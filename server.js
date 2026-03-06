const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const functions = require('firebase-functions');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

// GA4 Client initialization
/**
 * To enable GA4 dashboard integration, you need:
 * 1. GA_PROPERTY_ID (found in GA Admin > Property Settings)
 * 2. GOOGLE_SERVICE_ACCOUNT_JSON (JSON key from Google Cloud Service Account)
 */
let analyticsClient = null;
try {
    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
        if (credentials.private_key) {
            credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
        }
        analyticsClient = new BetaAnalyticsDataClient({ credentials });
        console.log('[Analytics] GA4 Client initialisert med service account.');
    }
} catch (err) {
    console.error('[Analytics] Kunne ikke initialisere GA4 client:', err.message);
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
const PORT = 3000;
const firebaseAccessTokenCache = new Map();

// Middleware
app.use(bodyParser.json());
// Static files moved to end to allow server-side injection

// Enable CORS for Live Server
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

async function getFetch() {
    try {
        return require('node-fetch');
    } catch (e) {
        const fetchModule = await import('node-fetch');
        return fetchModule.default;
    }
}

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function toBase64Url(input) {
    const base64 = Buffer.isBuffer(input)
        ? input.toString('base64')
        : Buffer.from(String(input)).toString('base64');

    return base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

function getFirebaseConfig() {
    const privateKey = (process.env.TK_FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n').replace(/^"|"$/g, '');
    const projectId = process.env.TK_FIREBASE_PROJECT_ID || 'tk-design-f43f6';

    return {
        projectId,
        clientEmail: process.env.TK_FIREBASE_CLIENT_EMAIL || '',
        privateKey,
        databaseId: process.env.TK_FIREBASE_DATABASE_ID || '(default)',
        collection: process.env.TK_FIREBASE_CONTACT_COLLECTION || 'contactMessages'
    };
}

function getFirebaseWebConfig() {
    const projectId = process.env.TK_FIREBASE_PROJECT_ID || 'tk-design-f43f6';
    const defaultWebConfig = {
        apiKey: 'AIzaSyDLYgqo2E1UiHoydEB6-WfFc119HES2U5c',
        messagingSenderId: '729667300921',
        appId: '1:729667300921:web:5061be8d41f10707a727e8'
    };

    return {
        apiKey: process.env.TK_FIREBASE_WEB_API_KEY || defaultWebConfig.apiKey,
        authDomain: process.env.TK_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
        projectId,
        storageBucket: process.env.TK_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
        messagingSenderId: process.env.TK_FIREBASE_MESSAGING_SENDER_ID || defaultWebConfig.messagingSenderId,
        appId: process.env.TK_FIREBASE_APP_ID || defaultWebConfig.appId
    };
}

function getFirebaseAuthHelperHost() {
    const projectId = process.env.TK_FIREBASE_PROJECT_ID || 'tk-design-f43f6';
    return `${projectId}.firebaseapp.com`;
}

function hasUsableFirebaseWebConfig(config) {
    return !!(
        config &&
        config.apiKey &&
        config.authDomain &&
        config.projectId &&
        config.storageBucket &&
        config.appId
    );
}

function createGoogleAccessJwt(clientEmail, privateKey, scope) {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + 3600;
    const header = {
        alg: 'RS256',
        typ: 'JWT'
    };
    const payload = {
        iss: clientEmail,
        sub: clientEmail,
        aud: 'https://oauth2.googleapis.com/token',
        scope,
        iat: issuedAt,
        exp: expiresAt
    };
    const unsignedToken = `${toBase64Url(JSON.stringify(header))}.${toBase64Url(JSON.stringify(payload))}`;
    const signature = crypto.sign('RSA-SHA256', Buffer.from(unsignedToken), privateKey);

    return {
        token: `${unsignedToken}.${toBase64Url(signature)}`,
        expiresAt
    };
}

async function getFirebaseAccessToken(scope = 'https://www.googleapis.com/auth/datastore') {
    const now = Date.now();
    const cachedToken = firebaseAccessTokenCache.get(scope);

    if (cachedToken && cachedToken.token && cachedToken.expiresAt - 60_000 > now) {
        return cachedToken.token;
    }

    const { clientEmail, privateKey } = getFirebaseConfig();
    if (!clientEmail || !privateKey) {
        throw new Error('Firebase mangler TK_FIREBASE_CLIENT_EMAIL eller TK_FIREBASE_PRIVATE_KEY i .env');
    }

    const fetch = await getFetch();
    const signedJwt = createGoogleAccessJwt(clientEmail, privateKey, scope);
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: signedJwt.token
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Firebase token request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    firebaseAccessTokenCache.set(scope, {
        token: data.access_token,
        expiresAt: now + ((data.expires_in || 3600) * 1000)
    });

    return data.access_token;
}

function toFirestoreValue(value) {
    if (value === null || value === undefined) {
        return { nullValue: null };
    }

    if (value instanceof Date) {
        return { timestampValue: value.toISOString() };
    }

    if (Array.isArray(value)) {
        return {
            arrayValue: {
                values: value.map(toFirestoreValue)
            }
        };
    }

    switch (typeof value) {
        case 'string':
            return { stringValue: value };
        case 'boolean':
            return { booleanValue: value };
        case 'number':
            if (Number.isInteger(value)) {
                return { integerValue: String(value) };
            }
            return { doubleValue: value };
        case 'object':
            return {
                mapValue: {
                    fields: toFirestoreFields(value)
                }
            };
        default:
            return { stringValue: String(value) };
    }
}

function toFirestoreFields(objectValue) {
    return Object.entries(objectValue).reduce((fields, [key, value]) => {
        if (value !== undefined) {
            fields[key] = toFirestoreValue(value);
        }
        return fields;
    }, {});
}

async function saveContactMessage(messagePayload) {
    console.log('Saving message to Firestore...', JSON.stringify(messagePayload, null, 2));
    const { projectId, databaseId, collection } = getFirebaseConfig();
    if (!projectId) {
        throw new Error('Firebase mangler TK_FIREBASE_PROJECT_ID i .env');
    }

    const accessToken = await getFirebaseAccessToken();
    const fetch = await getFetch();
    const documentId = crypto.randomUUID();
    const payload = {
        ...messagePayload,
        created_at: new Date().toISOString()
    };
    const response = await fetch(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${encodeURIComponent(databaseId)}/documents/${collection}?documentId=${documentId}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                fields: toFirestoreFields(payload)
            })
        });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Firebase write failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const savedId = data && data.name ? data.name.split('/').pop() : documentId;

    return {
        id: savedId,
        name: data && data.name ? data.name : null
    };
}

function isVercelRuntime() {
    return Boolean(process.env.VERCEL);
}

function hasFirebaseServerCredentials() {
    const { projectId, clientEmail, privateKey } = getFirebaseConfig();
    return !!(projectId && clientEmail && privateKey);
}

function getFirebaseSiteDataCollection() {
    return process.env.TK_FIREBASE_SITE_DATA_COLLECTION || 'siteAdminData';
}

function getFirestoreDocumentUrl(collection, documentId) {
    const { projectId, databaseId } = getFirebaseConfig();
    return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${encodeURIComponent(databaseId)}/documents/${encodeURIComponent(collection)}/${encodeURIComponent(documentId)}`;
}

async function readFirestoreDocument(collection, documentId) {
    if (!hasFirebaseServerCredentials()) {
        return null;
    }

    const accessToken = await getFirebaseAccessToken();
    const fetch = await getFetch();
    const response = await fetch(getFirestoreDocumentUrl(collection, documentId), {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Firebase read failed: ${response.status} ${errorText}`);
    }

    return response.json();
}

async function upsertFirestoreDocument(collection, documentId, fields) {
    if (!hasFirebaseServerCredentials()) {
        throw new Error('Firebase server credentials are not configured.');
    }

    const accessToken = await getFirebaseAccessToken();
    const fetch = await getFetch();
    const response = await fetch(getFirestoreDocumentUrl(collection, documentId), {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            fields: toFirestoreFields({
                ...fields,
                updated_at: new Date().toISOString()
            })
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Firebase write failed: ${response.status} ${errorText}`);
    }

    return response.json();
}

function readFirestoreStringField(document, fieldName) {
    return document?.fields?.[fieldName]?.stringValue || '';
}

async function readSiteJsonDocument(documentId) {
    const document = await readFirestoreDocument(getFirebaseSiteDataCollection(), documentId);
    if (!document) {
        return null;
    }

    const rawJson = readFirestoreStringField(document, 'json');
    if (!rawJson) {
        return null;
    }

    return JSON.parse(rawJson);
}

async function writeSiteJsonDocument(documentId, payload) {
    return upsertFirestoreDocument(getFirebaseSiteDataCollection(), documentId, {
        json: JSON.stringify(payload)
    });
}

async function readSiteTextDocument(documentId, fieldName = 'cssText') {
    const document = await readFirestoreDocument(getFirebaseSiteDataCollection(), documentId);
    if (!document) {
        return null;
    }

    return readFirestoreStringField(document, fieldName) || null;
}

async function writeSiteTextDocument(documentId, text, fieldName = 'cssText') {
    return upsertFirestoreDocument(getFirebaseSiteDataCollection(), documentId, {
        [fieldName]: text
    });
}

async function readSiteDataWithFallback(documentId, fallbackReader) {
    if (hasFirebaseServerCredentials()) {
        try {
            const firebaseValue = await readSiteJsonDocument(documentId);
            if (firebaseValue !== null) {
                return firebaseValue;
            }
        } catch (error) {
            console.error(`Failed to read ${documentId} from Firebase:`, error.message);
        }
    }

    return fallbackReader();
}

async function persistSiteData(documentId, payload, localWriter) {
    let savedToFirebase = false;
    let savedToFile = false;
    let lastError = null;

    if (isVercelRuntime() && !hasFirebaseServerCredentials()) {
        throw new Error('TK_FIREBASE_CLIENT_EMAIL og/eller TK_FIREBASE_PRIVATE_KEY mangler i Vercel-miljøet.');
    }

    if (hasFirebaseServerCredentials()) {
        try {
            await writeSiteJsonDocument(documentId, payload);
            savedToFirebase = true;
        } catch (error) {
            console.error(`Failed to save ${documentId} to Firebase:`, error.message);
            lastError = error;
        }
    }

    if (!isVercelRuntime()) {
        try {
            localWriter(payload);
            savedToFile = true;
        } catch (error) {
            console.error(`Failed to save ${documentId} to file:`, error.message);
            lastError = error;
        }
    }

    if (!savedToFirebase && !savedToFile) {
        throw lastError || new Error(`Could not persist ${documentId}`);
    }

    return { savedToFirebase, savedToFile };
}

async function readStyleCssWithFallback(fallbackReader) {
    if (hasFirebaseServerCredentials()) {
        try {
            const cssText = await readSiteTextDocument('style');
            if (cssText !== null) {
                return cssText;
            }
        } catch (error) {
            console.error('Failed to read style from Firebase:', error.message);
        }
    }

    return fallbackReader();
}

async function persistStyleCss(cssText, localWriter) {
    let savedToFirebase = false;
    let savedToFile = false;
    let lastError = null;

    if (isVercelRuntime() && !hasFirebaseServerCredentials()) {
        throw new Error('TK_FIREBASE_CLIENT_EMAIL og/eller TK_FIREBASE_PRIVATE_KEY mangler i Vercel-miljøet.');
    }

    if (hasFirebaseServerCredentials()) {
        try {
            await writeSiteTextDocument('style', cssText);
            savedToFirebase = true;
        } catch (error) {
            console.error('Failed to save style to Firebase:', error.message);
            lastError = error;
        }
    }

    if (!isVercelRuntime()) {
        try {
            localWriter(cssText);
            savedToFile = true;
        } catch (error) {
            console.error('Failed to save style file:', error.message);
            lastError = error;
        }
    }

    if (!savedToFirebase && !savedToFile) {
        throw lastError || new Error('Could not persist style');
    }

    return { savedToFirebase, savedToFile };
}

async function waitForFirebaseOperation(operationName, accessToken) {
    const fetch = await getFetch();
    const normalizedOperationName = String(operationName || '').replace(/^\/+/, '');
    const maxAttempts = 12;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const response = await fetch(`https://firebase.googleapis.com/v1beta1/${normalizedOperationName}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Firebase operation failed: ${response.status} ${errorText}`);
        }

        const operation = await response.json();
        if (operation.done) {
            if (operation.error) {
                throw new Error(operation.error.message || 'Firebase operation failed.');
            }
            return operation;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    throw new Error('Firebase operation timed out while waiting for web app provisioning.');
}

async function getOrCreateFirebaseWebAppConfig() {
    const envConfig = getFirebaseWebConfig();
    if (envConfig.apiKey && envConfig.messagingSenderId && envConfig.appId) {
        return envConfig;
    }

    if (!envConfig.projectId) {
        throw new Error('Firebase mangler prosjekt-ID for å hente web app-konfig.');
    }

    const accessToken = await getFirebaseAccessToken('https://www.googleapis.com/auth/cloud-platform');
    const fetch = await getFetch();
    const authHeaders = {
        'Authorization': `Bearer ${accessToken}`
    };
    const listUrl = `https://firebase.googleapis.com/v1beta1/projects/${encodeURIComponent(envConfig.projectId)}/webApps`;
    let webApps = [];

    const listResponse = await fetch(listUrl, {
        headers: authHeaders
    });

    if (!listResponse.ok) {
        const errorText = await listResponse.text();
        throw new Error(`Could not list Firebase web apps: ${listResponse.status} ${errorText}`);
    }

    const listData = await listResponse.json();
    webApps = Array.isArray(listData.apps) ? listData.apps : [];

    if (webApps.length === 0) {
        const createResponse = await fetch(listUrl, {
            method: 'POST',
            headers: {
                ...authHeaders,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                displayName: 'tk-design Admin'
            })
        });

        if (!createResponse.ok) {
            const errorText = await createResponse.text();
            throw new Error(`Could not create Firebase web app: ${createResponse.status} ${errorText}`);
        }

        const operation = await createResponse.json();
        if (operation && operation.name) {
            await waitForFirebaseOperation(operation.name, accessToken);
        }

        const refreshedListResponse = await fetch(listUrl, {
            headers: authHeaders
        });

        if (!refreshedListResponse.ok) {
            const errorText = await refreshedListResponse.text();
            throw new Error(`Could not refresh Firebase web apps: ${refreshedListResponse.status} ${errorText}`);
        }

        const refreshedListData = await refreshedListResponse.json();
        webApps = Array.isArray(refreshedListData.apps) ? refreshedListData.apps : [];
    }

    const firstWebApp = webApps[0];
    if (!firstWebApp || !firstWebApp.appId) {
        throw new Error('Fant ingen Firebase Web App i prosjektet.');
    }

    const configResponse = await fetch(
        `https://firebase.googleapis.com/v1beta1/projects/-/webApps/${encodeURIComponent(firstWebApp.appId)}/config`,
        {
            headers: authHeaders
        }
    );

    if (!configResponse.ok) {
        const errorText = await configResponse.text();
        throw new Error(`Could not fetch Firebase web config: ${configResponse.status} ${errorText}`);
    }

    const remoteConfig = await configResponse.json();

    return {
        apiKey: envConfig.apiKey || remoteConfig.apiKey || '',
        authDomain: envConfig.authDomain || remoteConfig.authDomain || `${envConfig.projectId}.firebaseapp.com`,
        projectId: envConfig.projectId || remoteConfig.projectId || '',
        storageBucket: envConfig.storageBucket || remoteConfig.storageBucket || `${envConfig.projectId}.firebasestorage.app`,
        messagingSenderId: envConfig.messagingSenderId || remoteConfig.messagingSenderId || '',
        appId: envConfig.appId || remoteConfig.appId || ''
    };
}

async function sendContactNotification(messagePayload) {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
        return {
            sent: false,
            reason: 'RESEND_API_KEY mangler i .env'
        };
    }

    const toEmail = String(process.env.CONTACT_TO_EMAIL || 'thomas@tk-design.no').trim() || 'thomas@tk-design.no';
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'TK-design <onboarding@resend.dev>';
    const fetch = await getFetch();
    const safeSubject = messagePayload.subject ? `: ${messagePayload.subject}` : '';

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f9; margin: 0; padding: 0; }
        .wrapper { width: 100%; background-color: #f4f7f9; padding: 40px 0; }
        .main { background-color: #ffffff; width: 100%; max-width: 600px; margin: 0 auto; border-radius: 8px; border: 1px solid #e1e8ed; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .header { background-color: #ffffff; padding: 40px 40px 20px 40px; text-align: center; border-bottom: 2px solid #f0f4f8; }
        .content { padding: 40px; text-align: center; color: #102a43; }
        .footer { padding: 30px; text-align: center; color: #627d98; font-size: 11px; border-top: 1px solid #f0f4f8; }
        .logo-img { width: 60px; height: auto; display: block; margin: 0 auto; }
        h1 { color: #102a43; font-size: 24px; margin: 25px 0 0 0; font-weight: bold; }
        .intro-text { font-size: 16px; color: #627d98; margin-bottom: 30px; }
        
        .info-card { background: #ffffff; border: 1px solid #e1e8ed; border-radius: 12px; padding: 20px; text-align: left; margin-bottom: 30px; }
        .info-row { border-bottom: 1px solid #f0f4f8; padding: 12px 0; margin: 0; }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-size: 11px; text-transform: uppercase; color: #9fb3c8; font-weight: bold; margin-bottom: 4px; display: block; }
        .info-value { font-size: 15px; color: #102a43; font-weight: 500; margin: 0; }
        
        .message-section { text-align: left; margin-top: 30px; }
        .message-title { font-weight: bold; font-size: 14px; text-transform: uppercase; color: #9fb3c8; margin-bottom: 10px; }
        .message-body { background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #ff6a1b; color: #334e68; line-height: 1.6; font-style: italic; white-space: pre-wrap; }
        
        .btn-container { margin: 40px 0 20px 0; }
        .button { background-color: #ff6a1b; color: #ffffff !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 15px; box-shadow: 0 4px 14px rgba(255, 106, 27, 0.3); }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="main">
            <div class="header">
                <img src="https://tk-design.no/img/logo/d.png" alt="TK-design" class="logo-img">
                <h1>TK-design kontaktskjema</h1>
            </div>
            <div class="content">
                <p class="intro-text">Du har mottatt en ny henvendelse via kontaktskjemaet på nettsiden.</p>
                
                <div class="info-card">
                    <div class="info-row">
                        <span class="info-label">Navn</span>
                        <p class="info-value">${escapeHtml(messagePayload.name)}</p>
                    </div>
                    <div class="info-row">
                        <span class="info-label">E-post</span>
                        <p class="info-value">${escapeHtml(messagePayload.email)}</p>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Telefon</span>
                        <p class="info-value">${escapeHtml(messagePayload.phone || 'Ikke oppgitt')}</p>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Bedrift / Firma</span>
                        <p class="info-value">${escapeHtml(messagePayload.company || 'Ikke oppgitt')}</p>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Emne</span>
                        <p class="info-value">${escapeHtml(messagePayload.subject || 'Ikke oppgitt')}</p>
                    </div>
                </div>

                <div class="message-section">
                    <div class="message-title">Melding</div>
                    <div class="message-body">${escapeHtml(messagePayload.message)}</div>
                </div>

                <div class="btn-container">
                    <a href="https://tk-design.no/admin" class="button">Gå til Innboks</a>
                </div>
            </div>
            <div class="footer">
                Dette er en automatisert melding fra TK-design.<br>
                &copy; 2026 TK-design. Alle rettigheter reservert.
            </div>
        </div>
    </div>
</body>
</html>
    `;

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
            from: fromEmail,
            to: [toEmail],
            reply_to: messagePayload.email,
            subject: `Ny henvendelse fra ${messagePayload.name}${safeSubject}`,
            html
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Resend request failed: ${response.status} ${errorText}`);
    }

    const resendBody = await response.json();
    console.log('[Resend API Success Detais]:', resendBody);

    return { sent: true };
}

function logContactPipelineConfig() {
    const hasResendApiKey = Boolean(String(process.env.RESEND_API_KEY || '').trim());
    const targetEmail = String(process.env.CONTACT_TO_EMAIL || 'thomas@tk-design.no').trim() || 'thomas@tk-design.no';

    if (!hasResendApiKey) {
        console.warn('[contact] RESEND_API_KEY mangler. Kontaktskjema lagres, men e-postvarsel blir ikke sendt.');
    } else {
        console.log(`[contact] E-postvarsel aktivert. Mottaker: ${targetEmail}`);
    }
}

function getTranslationsFilePath() {
    return path.join(__dirname, 'translations.js');
}

function getLegacyContentFilePath() {
    return path.join(__dirname, 'data/content.json');
}

function getPostsFilePath() {
    return path.join(__dirname, 'data/posts.json');
}

function getSeoFilePath() {
    return path.join(__dirname, 'data/seo.json');
}

function getAdminCustomStyleFilePath() {
    return path.join(__dirname, 'admin/custom-style.css');
}

function parseTranslationsSource(source) {
    const match = source.match(/const\s+translations\s*=\s*([\s\S]*?)\s*;\s*$/);
    if (!match) {
        throw new Error('Could not parse translations.js');
    }

    return Function(`"use strict"; return (${match[1]});`)();
}

function readDashboardContent() {
    const translationsPath = getTranslationsFilePath();
    if (fs.existsSync(translationsPath)) {
        const source = fs.readFileSync(translationsPath, 'utf8');
        return parseTranslationsSource(source);
    }

    const legacyPath = getLegacyContentFilePath();
    const legacySource = fs.readFileSync(legacyPath, 'utf8');
    return JSON.parse(legacySource);
}

function serializeDashboardContent(content) {
    return `const translations = ${JSON.stringify(content, null, 4)};\n`;
}

function writeDashboardContent(content) {
    const serializedTranslations = serializeDashboardContent(content);
    fs.writeFileSync(getTranslationsFilePath(), serializedTranslations, 'utf8');
    fs.writeFileSync(getLegacyContentFilePath(), JSON.stringify(content, null, 4), 'utf8');
}

function readBlogPosts() {
    return JSON.parse(fs.readFileSync(getPostsFilePath(), 'utf8'));
}

function writeBlogPosts(posts) {
    fs.writeFileSync(getPostsFilePath(), JSON.stringify(posts, null, 4), 'utf8');
}

function readSeoData() {
    if (!fs.existsSync(getSeoFilePath())) {
        return { global: {}, pages: {} };
    }

    return JSON.parse(fs.readFileSync(getSeoFilePath(), 'utf8'));
}

function writeSeoData(seoData) {
    fs.writeFileSync(getSeoFilePath(), JSON.stringify(seoData, null, 4), 'utf8');
}

function readCustomStyleCss() {
    if (!fs.existsSync(getAdminCustomStyleFilePath())) {
        return '';
    }

    return fs.readFileSync(getAdminCustomStyleFilePath(), 'utf8');
}

function writeCustomStyleCss(cssText) {
    fs.writeFileSync(getAdminCustomStyleFilePath(), cssText, 'utf8');
}

// API: Get Content
app.get('/api/content', async (req, res) => {
    try {
        const content = await readSiteDataWithFallback('content', readDashboardContent);
        res.json(content);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error reading content');
    }
});

// API: Save Content
app.post('/api/content', async (req, res) => {
    try {
        const result = await persistSiteData('content', req.body, writeDashboardContent);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error saving content', details: error.message });
    }
});

// API: Save Style (CSS Variables & Fonts)
app.post('/api/style', async (req, res) => {
    const { cssVariables, fontUrl, fontFamily } = req.body;

    let cssContent = '';

    // 1. Add Font Import if present
    if (fontUrl) {
        cssContent += `@import url('${fontUrl}');\n`;
    }

    // 2. Add Root Variables
    cssContent += `:root {\n`;

    if (fontFamily) {
        cssContent += `    --font-primary: ${fontFamily};\n`;
    }

    for (const [key, value] of Object.entries(cssVariables)) {
        cssContent += `    ${key}: ${value};\n`;
    }
    cssContent += `}\n`;

    try {
        const result = await persistStyleCss(cssContent, writeCustomStyleCss);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error saving style', details: error.message });
    }
});

// API: Get Blog Posts
// --- Messages API ---
app.get('/api/analytics', async (req, res) => {
    const propertyId = process.env.GA_PROPERTY_ID;

    if (!analyticsClient || !propertyId) {
        return res.json({
            status: 'unconfigured',
            message: 'Google Analytics er ikke konfigurert ennå.',
            data: {
                active7DayUsers: '—',
                screenPageViews: '—',
                activeUsers: '—'
            }
        });
    }

    try {
        // 1. Get 7-day metrics
        const [response] = await analyticsClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
            dimensions: [],
            metrics: [
                { name: 'activeUsers' },
                { name: 'screenPageViews' }
            ],
        });

        // 2. Get Real-time users (using runRealtimeReport)
        let activeUsersNow = '0';
        try {
            const [realtimeResponse] = await analyticsClient.runRealtimeReport({
                property: `properties/${propertyId}`,
                dimensions: [],
                metrics: [{ name: 'activeUsers' }],
            });
            activeUsersNow = realtimeResponse.rows?.[0]?.metricValues?.[0]?.value || '0';
        } catch (rtErr) {
            console.warn('[Analytics] Kunne ikke hente sanntidsdata:', rtErr.message);
        }

        const metrics = response.rows?.[0]?.metricValues || [];

        res.json({
            status: 'success',
            data: {
                active7DayUsers: metrics[0]?.value || '0',
                screenPageViews: metrics[1]?.value || '0',
                activeUsers: activeUsersNow
            }
        });
    } catch (err) {
        console.error('[Analytics] API feil:', err.message);
        res.status(500).json({ error: 'Kunne ikke hente statistikk fra Google' });
    }
});

app.get('/api/messages', async (req, res) => {
    try {
        console.log('[Messages] Henter konfigurasjon...');
        const { projectId, databaseId, collection } = getFirebaseConfig();
        console.log('[Messages] Forespørsel til Firebase for prosjekt:', projectId);

        const accessToken = await getFirebaseAccessToken();
        console.log('[Messages] Tilgangsnøkkel generert.');

        const fetch = await getFetch();
        const response = await fetch(
            `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${encodeURIComponent(databaseId)}/documents/${collection}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Messages] Firebase forespørsel feila:', response.status, errorText);
            throw new Error(`Firebase read failed: ${response.status}`);
        }

        const data = await response.json();
        const messages = (data.documents || []).map(doc => {
            const fields = doc.fields || {};
            const item = {};
            for (const [key, value] of Object.entries(fields)) {
                if (value.stringValue !== undefined) item[key] = value.stringValue;
                else if (value.integerValue !== undefined) item[key] = parseInt(value.integerValue);
                else if (value.booleanValue !== undefined) item[key] = value.booleanValue;
                else if (value.timestampValue !== undefined) item[key] = value.timestampValue;
            }
            item.id = doc.name.split('/').pop();
            return item;
        });

        console.log(`[Messages] Henta ${messages.length} meldinger.`);
        res.json(messages);
    } catch (error) {
        console.error('[Messages] Kritisk feil ved henting:', error);
        res.status(500).json({ error: 'Kunne ikke hente meldinger.', details: error.message });
    }
});

app.patch('/api/messages/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const { projectId, databaseId, collection } = getFirebaseConfig();
        const accessToken = await getFirebaseAccessToken();
        const fetch = await getFetch();

        // Firestore PATCH requires updateMask
        const updateMask = Object.keys(updateData).map(k => `updateMask.fieldPaths=${k}`).join('&');

        const response = await fetch(
            `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${encodeURIComponent(databaseId)}/documents/${collection}/${id}?${updateMask}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    fields: toFirestoreFields(updateData)
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Firebase update failed: ${response.status} ${errorText}`);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({ error: 'Kunne ikke oppdatere meldingen.', details: error.message });
    }
});

app.delete('/api/messages/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { projectId, databaseId, collection } = getFirebaseConfig();
        const accessToken = await getFirebaseAccessToken();
        const fetch = await getFetch();

        const response = await fetch(
            `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${encodeURIComponent(databaseId)}/documents/${collection}/${id}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Firebase delete failed: ${response.status} ${errorText}`);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Kunne ikke slette meldingen.', details: error.message });
    }
});

app.get('/api/posts', async (req, res) => {
    try {
        const posts = await readSiteDataWithFallback('posts', readBlogPosts);
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error reading posts');
    }
});

// API: Save Blog Posts
app.post('/api/posts', async (req, res) => {
    const newPosts = req.body;

    try {
        const result = await persistSiteData('posts', newPosts, writeBlogPosts);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error saving posts', details: error.message });
    }
});

// --- SEO FEATURES ---

// API: Get SEO Data
app.get('/api/seo', async (req, res) => {
    try {
        const seoConfig = await readSiteDataWithFallback('seo', readSeoData);
        res.json(seoConfig);
    } catch (error) {
        console.error(error);
        res.json({ global: {}, pages: {} });
    }
});

// API: Save SEO Data
app.post('/api/seo', async (req, res) => {
    const seoData = req.body;

    try {
        const result = await persistSiteData('seo', seoData, writeSeoData);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error saving SEO data', details: error.message });
    }
});

// Sitemap Generation
app.get('/sitemap.xml', async (req, res) => {
    try {
        const seoConfig = await readSiteDataWithFallback('seo', readSeoData);
        const posts = await readSiteDataWithFallback('posts', readBlogPosts);
        const baseUrl = 'https://tk-design.no';

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        for (const page of Object.keys((seoConfig && seoConfig.pages) || {})) {
            xml += `
    <url>
        <loc>${baseUrl}/${page}</loc>
        <changefreq>weekly</changefreq>
        <priority>${page === 'index.html' ? '1.0' : '0.8'}</priority>
    </url>`;
        }

        (posts || []).forEach((post) => {
            xml += `
    <url>
        <loc>${baseUrl}/blog-details.html?id=${post.id}</loc>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>`;
        });

        xml += `\n</urlset>`;
        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error('Error generating sitemap:', error);
        res.status(500).send('Error reading SEO config');
    }
});

// Server-Side Meta Injection
app.get(['/', '/index.html', '/blog.html', '/project-details.html', '/blog-details.html', '/contact.html'], async (req, res) => {
    let reqFile = req.path === '/' ? 'index.html' : req.path.substring(1);

    let seoData = { global: {}, pages: {} };
    try {
        seoData = await readSiteDataWithFallback('seo', readSeoData);
    } catch (e) { }

    const globalSeo = seoData.global || {};
    let title = '';
    let description = '';
    let keywords = '';

    // Specialized Logic for Blog Details
    if (reqFile === 'blog-details.html' && req.query.id) {
        try {
            const posts = await readSiteDataWithFallback('posts', readBlogPosts);
            const post = posts.find(p => p.id == req.query.id);
            if (post) {
                title = post.seoTitle || post.title;
                description = post.seoDesc || (post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 160) : '');
                keywords = post.seoKeywords || globalSeo.defaultKeywords || '';
            }
        } catch (e) { console.error('Error fetching post for SEO:', e); }
    }

    // Default Page Logic if not blog details or post not found
    if (!title) {
        const pageSeo = seoData.pages[reqFile] || {};
        title = pageSeo.title || '';
        description = pageSeo.description || '';
        keywords = pageSeo.keywords || globalSeo.defaultKeywords || '';
    }

    // Construct Final Title
    const siteTitleRaw = (globalSeo.siteTitle || '').trim();
    const siteTitle = siteTitleRaw === 'TK Design Studio' ? 'TK-design' : siteTitleRaw;
    const finalTitle = title ? `${title} ${globalSeo.separator || '|'} ${siteTitle}` : siteTitle;

    fs.readFile(path.join(__dirname, reqFile), 'utf8', (err, html) => {
        if (err) return res.status(404).send('Page not found');

        let injectedHtml = html
            .replace(/<title>.*<\/title>/, `<title>${finalTitle}</title>`)
            .replace(/<meta name="description" content=".*">/, `<meta name="description" content="${description}">`)
            .replace(/<meta name="keywords" content=".*">/, `<meta name="keywords" content="${keywords}">`);

        // Inject Google Analytics if ID exists
        if (globalSeo.googleAnalyticsId) {
            const gaScript = `
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${globalSeo.googleAnalyticsId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${globalSeo.googleAnalyticsId}');
    </script>`;
            injectedHtml = injectedHtml.replace('</head>', `${gaScript}\n</head>`);
        }

        res.send(injectedHtml);
    });
});

app.get('/translations.js', async (req, res) => {
    try {
        const content = await readSiteDataWithFallback('content', readDashboardContent);
        res.type('application/javascript');
        res.send(serializeDashboardContent(content));
    } catch (error) {
        console.error('Error serving translations.js:', error);
        res.status(500).type('application/javascript').send('const translations = {};');
    }
});

app.get('/data/posts.json', async (req, res) => {
    try {
        const posts = await readSiteDataWithFallback('posts', readBlogPosts);
        res.json(posts);
    } catch (error) {
        console.error('Error serving posts.json:', error);
        res.status(500).json([]);
    }
});

app.get('/data/seo.json', async (req, res) => {
    try {
        const seoConfig = await readSiteDataWithFallback('seo', readSeoData);
        res.json(seoConfig);
    } catch (error) {
        console.error('Error serving seo.json:', error);
        res.status(500).json({ global: {}, pages: {} });
    }
});

app.get(['/admin/custom-style.css', '/custom-style.css'], async (req, res) => {
    try {
        const cssText = await readStyleCssWithFallback(readCustomStyleCss);
        res.type('text/css').send(cssText || '');
    } catch (error) {
        console.error('Error serving custom-style.css:', error);
        res.type('text/css').send('');
    }
});

// API: Generate Blog Content with Gemini AI
app.post('/api/generate-content', async (req, res) => {
    try {
        const { topic, tone = 'professional', length = 'medium' } = req.body;

        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        // Configure length
        const lengthMap = {
            short: '2-3 paragraphs',
            medium: '4-6 paragraphs',
            long: '8-10 paragraphs'
        };

        const prompt = `Write a ${tone} blog post about "${topic}". 
        Length: ${lengthMap[length] || lengthMap.medium}.
        Format the content with proper HTML tags including <h2>, <h3>, <p>, <ul>, <li> where appropriate.
        Make it engaging, informative, and SEO-friendly.`;

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ content: text });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: 'Failed to generate content', details: error.message });
    }
});

// API: Search Unsplash Images
app.get('/api/unsplash/search', async (req, res) => {
    try {
        const { query, page = 1, per_page = 12 } = req.query;

        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}`;

        const fetch = (await import('node-fetch')).default;
        const response = await fetch(unsplashUrl, {
            headers: {
                'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`Unsplash API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Format response to include only necessary data
        const images = data.results.map(img => ({
            id: img.id,
            url: img.urls.regular,
            thumb: img.urls.thumb,
            description: img.description || img.alt_description,
            photographer: img.user.name,
            photographerUrl: img.user.links.html,
            downloadUrl: img.links.download_location
        }));

        res.json({ images, total: data.total });
    } catch (error) {
        console.error('Unsplash API Error:', error);
        res.status(500).json({ error: 'Failed to search images', details: error.message });
    }
});

// API: Contact Form
app.post('/api/contact', async (req, res) => {
    console.log('--- CONTACT FORM SUBMISSION START ---');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    try {
        const {
            name = '',
            email = '',
            phone = '',
            company = '',
            subject = '',
            message = '',
            consent = false,
            website = '',
            sourcePage = 'contact.html'
        } = req.body || {};

        // Honeypot field
        if (String(website).trim()) {
            return res.status(200).json({
                success: true,
                ignored: true
            });
        }

        const cleanName = String(name).trim();
        const cleanEmail = String(email).trim().toLowerCase();
        const cleanPhone = String(phone).trim();
        const cleanCompany = String(company).trim();
        const cleanSubject = String(subject).trim();
        const cleanMessage = String(message).trim();
        const cleanSourcePage = String(sourcePage).trim() || 'contact.html';
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!cleanName || !cleanEmail || !cleanMessage) {
            return res.status(400).json({
                success: false,
                error: 'Navn, e-post og melding er påkrevd.'
            });
        }

        if (!emailPattern.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                error: 'E-postadressen er ikke gyldig.'
            });
        }

        if (!consent) {
            return res.status(400).json({
                success: false,
                error: 'Du må godkjenne at vi kan lagre henvendelsen din.'
            });
        }


        const payload = {
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone || null,
            company: cleanCompany || null,
            subject: cleanSubject || null,
            message: cleanMessage,
            consent: true,
            source_page: cleanSourcePage,
            status: 'new',
            ip_address: (req.headers['x-forwarded-for'] || (req.socket && req.socket.remoteAddress) || '').toString().split(',')[0].trim() || null,
            user_agent: req.get('user-agent') || null
        };

        let saved = false;
        let savedMessage = null;
        let saveWarning = null;
        let emailSent = false;
        let emailWarning = null;

        try {
            const notificationResult = await sendContactNotification(payload);
            emailSent = !!notificationResult.sent;
            if (!notificationResult.sent) {
                emailWarning = notificationResult.reason || 'E-postvarsel ble ikke sendt.';
            }
        } catch (emailError) {
            console.error('Contact email notification error:', emailError);
            emailWarning = 'E-postvarsel feilet.';
        }

        try {
            // Setting a timeout for the save operation so it doesn't hang indefinitely 
            const savePromise = saveContactMessage(payload);
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase save timeout')), 5000));
            savedMessage = await Promise.race([savePromise, timeoutPromise]);
            saved = true;
        } catch (saveError) {
            console.error('Contact message save error:', saveError);
            saveWarning = 'Meldingen kunne ikke lagres i dashboardet.';
        }

        if (!saved && !emailSent) {
            return res.status(500).json({
                success: false,
                error: 'Kunne ikke levere kontaktskjemaet.',
                details: [saveWarning, emailWarning].filter(Boolean).join(' ') || 'Lagring og e-post feilet.'
            });
        }

        res.status(saved ? 201 : 202).json({
            success: true,
            saved,
            saveWarning,
            emailSent,
            emailWarning,
            id: savedMessage && savedMessage.id ? savedMessage.id : null
        });
    } catch (error) {
        console.error('Contact form submission error:', error);
        console.error('Error details:', error.message);
        res.status(500).json({
            success: false,
            error: 'Kunne ikke sende kontaktskjemaet.',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

app.get('/js/firebase-config.js', async (req, res) => {
    try {
        const config = await getOrCreateFirebaseWebAppConfig();
        res.type('application/javascript');
        res.send(
            `window.__TK_FIREBASE_CONFIG__ = ${JSON.stringify(config, null, 4)};\nwindow.__TK_FIREBASE_CONFIG_ERROR__ = null;`
        );
    } catch (error) {
        const fallbackConfig = getFirebaseWebConfig();
        res.type('application/javascript');
        res.send(
            `window.__TK_FIREBASE_CONFIG__ = ${JSON.stringify(fallbackConfig, null, 4)};\nwindow.__TK_FIREBASE_CONFIG_ERROR__ = ${JSON.stringify(hasUsableFirebaseWebConfig(fallbackConfig) ? null : error.message)};`
        );
    }
});

async function proxyFirebaseAuthHelper(req, res) {
    const fetch = await getFetch();
    const helperHost = getFirebaseAuthHelperHost();
    const targetUrl = `https://${helperHost}${req.originalUrl}`;
    const upstreamResponse = await fetch(targetUrl, {
        method: 'GET',
        headers: {
            Accept: req.get('accept') || '*/*',
            'Accept-Language': req.get('accept-language') || 'en-US,en;q=0.9',
            'User-Agent': req.get('user-agent') || 'tk-design-auth-proxy'
        }
    });

    res.status(upstreamResponse.status);

    const hopByHopHeaders = new Set([
        'connection',
        'transfer-encoding',
        'content-length',
        'content-encoding',
        'keep-alive',
        'proxy-authenticate',
        'proxy-authorization',
        'te',
        'trailer',
        'upgrade'
    ]);

    upstreamResponse.headers.forEach((value, key) => {
        if (!hopByHopHeaders.has(String(key).toLowerCase())) {
            res.setHeader(key, value);
        }
    });

    const bodyBuffer = Buffer.from(await upstreamResponse.arrayBuffer());
    res.send(bodyBuffer);
}

app.get(/^\/__\/auth\/.*$/, async (req, res) => {
    try {
        await proxyFirebaseAuthHelper(req, res);
    } catch (error) {
        console.error('Firebase auth helper proxy error:', error);
        res.status(502).send('Firebase auth helper proxy failed.');
    }
});

app.get(/^\/__\/firebase\/.*$/, async (req, res) => {
    try {
        await proxyFirebaseAuthHelper(req, res);
    } catch (error) {
        console.error('Firebase firebase-helper proxy error:', error);
        res.status(502).send('Firebase helper proxy failed.');
    }
});

// Clean URLs – redirect .html → uten .html og server filene
// Forside: /index.html → /
app.get('/index.html', (req, res) => {
    const hash = req.query['#'] || '';
    res.redirect(301, '/' + (hash ? '#' + hash : ''));
});
const htmlPages = [
    'blog',
    'blog-details',
    'contact',
    'project-details',
    'service-details',
    'privacy',
    'accessibility',
];

htmlPages.forEach(page => {
    // Redirect /page.html → /page
    app.get(`/${page}.html`, (req, res) => {
        const qs = Object.keys(req.query).length ? '?' + new URLSearchParams(req.query).toString() : '';
        res.redirect(301, `/${page}${qs}`);
    });
    // Serve /page → file
    app.get(`/${page}`, (req, res) => {
        res.sendFile(path.join(__dirname, `${page}.html`));
    });
});

// Admin clean URL
app.get('/admin/index.html', (req, res) => res.redirect(301, '/admin/'));
app.get('/admin/', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'index.html')));
app.get('/admin', (req, res) => res.redirect(301, '/admin/'));

// SEO: Serve sitemap and robots.txt with correct content-type
app.get('/sitemap.xml', (req, res) => {
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.sendFile(path.join(__dirname, 'sitemap.xml'));
});

app.get('/robots.txt', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.sendFile(path.join(__dirname, 'robots.txt'));
});

// Static Files (as fallback)
app.use(express.static(path.join(__dirname)));

if (require.main === module) {
    app.listen(PORT, () => {
        logContactPipelineConfig();
        console.log(`CMS Server running at http://localhost:${PORT}`);
        console.log(`Admin Panel available at http://localhost:${PORT}/admin`);
    });
}

module.exports = app;
module.exports.api = functions.https.onRequest(app);
