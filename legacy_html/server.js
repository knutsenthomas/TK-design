const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const functions = require('firebase-functions');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

// GA4 Client initialization
let analyticsClient = null;
let analyticsInitError = null;
try {
    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
        let jsonStr = process.env.GOOGLE_SERVICE_ACCOUNT_JSON.trim();
        // Strip accidental outer quotes if they exist (common when copying/pasting)
        if (jsonStr.startsWith("'") && jsonStr.endsWith("'")) jsonStr = jsonStr.slice(1, -1).trim();
        if (jsonStr.startsWith('"') && jsonStr.endsWith('"')) jsonStr = jsonStr.slice(1, -1).trim();

        const credentials = JSON.parse(jsonStr);
        if (credentials.private_key) {
            credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
        }
        analyticsClient = new BetaAnalyticsDataClient({ credentials });
        console.log('[Analytics] GA4 Client initialisert med service account.');
    } else {
        analyticsInitError = "Missing GOOGLE_SERVICE_ACCOUNT_JSON";
    }
} catch (err) {
    analyticsInitError = err.message;
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
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

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

// Diagnostic API (Safe for production, only shows presence of keys)
app.get('/api/debug-env', (req, res) => {
    res.json({
        firebase: {
            projectId: !!process.env.TK_FIREBASE_PROJECT_ID,
            clientEmail: !!process.env.TK_FIREBASE_CLIENT_EMAIL,
            privateKey: !!process.env.TK_FIREBASE_PRIVATE_KEY,
            privateKeyValid: (process.env.TK_FIREBASE_PRIVATE_KEY || '').includes('BEGIN PRIVATE KEY'),
        },
        analytics: {
            propertyId: !!process.env.GA_PROPERTY_ID,
            serviceAccount: !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
            clientInitialized: !!analyticsClient,
            initError: analyticsInitError
        },
        resend: !!process.env.RESEND_API_KEY,
        gemini: !!process.env.GEMINI_API_KEY,
        unsplash: !!String(process.env.UNSPLASH_ACCESS_KEY || '').trim()
    });
});

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
        // Run all GA4 reports in parallel for faster response
        const [[summaryResponse], [pagesResponse], [sourcesResponse]] = await Promise.all([
            analyticsClient.runReport({
                property: `properties/${propertyId}`,
                dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
                metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
            }),
            analyticsClient.runReport({
                property: `properties/${propertyId}`,
                dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
                dimensions: [{ name: 'pageTitle' }],
                metrics: [{ name: 'screenPageViews' }],
                limit: 8,
                orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }]
            }),
            analyticsClient.runReport({
                property: `properties/${propertyId}`,
                dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
                dimensions: [{ name: 'sessionDefaultChannelGroup' }],
                metrics: [{ name: 'sessions' }],
                limit: 8,
                orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
            })
        ]);

        // Get Real-time users (separate, can fail gracefully)
        let activeUsersNow = '0';
        try {
            const [realtimeResponse] = await analyticsClient.runRealtimeReport({
                property: `properties/${propertyId}`,
                metrics: [{ name: 'activeUsers' }],
            });
            activeUsersNow = realtimeResponse.rows?.[0]?.metricValues?.[0]?.value || '0';
        } catch (rtErr) {
            console.warn('[Analytics] Kunne ikke hente sanntidsdata:', rtErr.message);
        }

        const topPages = (pagesResponse.rows || []).map(row => ({
            title: row.dimensionValues[0].value,
            views: row.metricValues[0].value
        }));

        const trafficSources = (sourcesResponse.rows || []).map(row => ({
            source: row.dimensionValues[0].value,
            sessions: row.metricValues[0].value
        }));

        const summaryMetrics = summaryResponse.rows?.[0]?.metricValues || [];

        res.json({
            status: 'success',
            data: {
                active7DayUsers: summaryMetrics[0]?.value || '0',
                screenPageViews: summaryMetrics[1]?.value || '0',
                activeUsers: activeUsersNow,
                topPages,
                trafficSources
            }
        });
    } catch (err) {
        console.error('[Analytics] API feil:', err.message);
        res.status(500).json({ error: 'Kunne ikke hente statistikk fra Google' });
    }
});

app.get('/api/messages', async (req, res) => {
    try {
        const { projectId, databaseId, collection } = getFirebaseConfig();
        const accessToken = await getFirebaseAccessToken();
        const fetch = await getFetch();

        const response = await fetch(
            `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents:runQuery`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    structuredQuery: {
                        from: [{ collectionId: collection }],
                        orderBy: [{
                            field: { fieldPath: 'created_at' },
                            direction: 'DESCENDING'
                        }]
                    }
                })
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Firebase error: ${error}`);
        }

        const data = await response.json();
        const messages = (data || []).map(doc => {
            const fields = doc.document?.fields || {};
            return {
                id: (doc.document?.name || '').split('/').pop(),
                name: (fields.name?.stringValue || 'Ukjent'),
                email: (fields.email?.stringValue || ''),
                phone: (fields.phone?.stringValue || ''),
                company: (fields.company?.stringValue || ''),
                subject: (fields.subject?.stringValue || ''),
                message: (fields.message?.stringValue || ''),
                timestamp: (fields.created_at?.stringValue || fields.timestamp?.stringValue || fields.timestamp?.timestampValue || ''),
                archived: fields.status?.stringValue === 'archived' || fields.archived?.booleanValue || false
            };
        }).filter(m => m.id);

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Kunne ikke hente meldinger' });
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
    let lang = 'no';
    const cookies = req.headers.cookie || '';
    const langMatch = cookies.match(/site_lang=(en|no)/);
    if (langMatch) lang = langMatch[1];

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
                const isEn = lang === 'en';
                const postTitle = isEn ? (post.titleEn || post.title) : post.title;
                const postContent = isEn ? (post.contentEn || post.content) : post.content;
                const postSeoTitle = isEn ? (post.seoTitleEn || post.seoTitle) : post.seoTitle;
                const postSeoDesc = isEn ? (post.seoDescEn || post.seoDesc) : post.seoDesc;
                const postSeoKeywords = isEn ? (post.seoKeywordsEn || post.seoKeywords) : post.seoKeywords;

                title = postSeoTitle || postTitle;
                description = postSeoDesc || (postContent ? stripHtmlToText(postContent).substring(0, 160) : '');
                keywords = postSeoKeywords || globalSeo.defaultKeywords || '';
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

    fs.readFile(path.join(__dirname, reqFile), 'utf8', async (err, html) => {
        if (err) return res.status(404).send('Page not found');

        let translatedHtml = html;
        try {
            const translations = await readSiteDataWithFallback('content', readDashboardContent);
            const langData = translations[lang];

            if (langData) {
                // Regex to find elements with data-i18n attribute
                // It looks for tags like <span data-i18n="nav.home">Any Content</span>
                // and replaces "Any Content" with the translated value.
                translatedHtml = html.replace(/<([^>]+data-i18n="([^"]+)"[^>]*)>([\s\S]*?)<\/\s*([a-zA-Z0-9]+)\s*>/g, (match, openingTag, key, oldContent, tagName) => {
                    const keys = key.split('.');
                    let text = langData;
                    for (const k of keys) {
                        text = text ? text[k] : null;
                    }

                    if (text && typeof text === 'string') {
                        // Keep the opening tag exactly as it is (with the data-i18n attribute)
                        return `<${openingTag}>${text}</${tagName}>`;
                    }
                    return match;
                });
            }
        } catch (e) {
            console.error('Error during server-side translation:', e);
        }

        let injectedHtml = translatedHtml
            .replace(/<title>[\s\S]*?<\/title>/i, `<title>${finalTitle}</title>`)
            .replace(/<meta\s+name="description"\s+content="[\s\S]*?">/i, `<meta name="description" content="${description}">`)
            .replace(/<meta\s+name="keywords"\s+content="[\s\S]*?">/i, `<meta name="keywords" content="${keywords}">`)
            .replace(/<meta\s+property="og:title"\s+content="[\s\S]*?">/i, `<meta property="og:title" content="${finalTitle}">`)
            .replace(/<meta\s+property="og:description"\s+content="[\s\S]*?">/i, `<meta property="og:description" content="${description}">`);

        // Inject Google Analytics if ID exists and NOT already in the HTML
        if (globalSeo.googleAnalyticsId && !html.includes(globalSeo.googleAnalyticsId)) {
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

const AI_ATTACHMENT_LIMITS = {
    fileSize: 12 * 1024 * 1024,
    files: 6
};

const aiAttachmentUpload = multer({
    storage: multer.memoryStorage(),
    limits: AI_ATTACHMENT_LIMITS
});

const aiAttachmentMiddleware = (req, res, next) => {
    aiAttachmentUpload.array('contextFiles', AI_ATTACHMENT_LIMITS.files)(req, res, (error) => {
        if (!error) {
            return next();
        }

        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'Attachment too large',
                details: `Each attachment must be <= ${Math.round(AI_ATTACHMENT_LIMITS.fileSize / (1024 * 1024))} MB.`
            });
        }

        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                error: 'Too many attachments',
                details: `You can attach up to ${AI_ATTACHMENT_LIMITS.files} files.`
            });
        }

        return res.status(400).json({
            error: 'Invalid multipart request',
            details: error.message
        });
    });
};

function inferMimeTypeFromFileName(fileName = '') {
    const ext = path.extname(String(fileName || '').toLowerCase());
    if (ext === '.pdf') return 'application/pdf';
    if (ext === '.png') return 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
    if (ext === '.webp') return 'image/webp';
    if (ext === '.gif') return 'image/gif';
    if (ext === '.txt') return 'text/plain';
    if (ext === '.md') return 'text/markdown';
    return 'application/octet-stream';
}

function normalizeAiAttachmentMimeType(file = {}) {
    const rawMime = String(file.mimetype || '').trim().toLowerCase();
    if (rawMime && rawMime !== 'application/octet-stream') {
        return rawMime;
    }

    return inferMimeTypeFromFileName(file.originalname);
}

function isSupportedAiAttachmentMimeType(mimeType = '') {
    if (!mimeType) return false;
    if (mimeType.startsWith('image/')) return true;
    if (mimeType === 'application/pdf') return true;
    if (mimeType === 'text/plain' || mimeType === 'text/markdown') return true;
    return false;
}

const GEMINI_DEFAULT_MODEL_CANDIDATES = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest',
    'gemini-1.5-flash'
];

const GEMINI_MODEL_LIST_CACHE_TTL_MS = 30 * 60 * 1000;
const geminiModelListCache = {
    expiresAt: 0,
    models: []
};

function normalizeGeminiModelName(modelName = '') {
    return String(modelName || '').trim().replace(/^models\//i, '');
}

function isGeminiModelNotFoundError(error) {
    const message = String(error?.message || error || '');
    return /\b404\b|is not found for API version|not supported for generateContent|models?\/[a-z0-9._:-]+\s+is not found/i.test(message);
}

function getGeminiModelCandidates(preferredModel = '', discoveredModels = []) {
    const envFallbackModels = String(process.env.GEMINI_FALLBACK_MODELS || '')
        .split(',')
        .map((model) => normalizeGeminiModelName(model))
        .filter(Boolean);

    const mergedCandidates = [
        normalizeGeminiModelName(preferredModel),
        ...(Array.isArray(discoveredModels) ? discoveredModels : []).map((model) => normalizeGeminiModelName(model)),
        ...envFallbackModels,
        ...GEMINI_DEFAULT_MODEL_CANDIDATES
    ];

    const seen = new Set();
    const uniqueCandidates = [];

    mergedCandidates.forEach((model) => {
        const normalized = normalizeGeminiModelName(model);
        if (!normalized || seen.has(normalized)) {
            return;
        }
        seen.add(normalized);
        uniqueCandidates.push(normalized);
    });

    return uniqueCandidates.slice(0, 20);
}

async function listGeminiGenerateContentModels(apiKey = '') {
    const key = String(apiKey || '').trim();
    if (!key) return [];

    try {
        const fetch = await getFetch();
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const body = await response.text().catch(() => '');
            console.warn(`[Gemini] Could not list models (${response.status}): ${body.slice(0, 300)}`);
            return [];
        }

        const payload = await response.json().catch(() => ({}));
        const availableModels = Array.isArray(payload?.models) ? payload.models : [];

        return availableModels
            .filter((model) => {
                const methods = Array.isArray(model?.supportedGenerationMethods)
                    ? model.supportedGenerationMethods
                    : [];
                return methods.includes('generateContent');
            })
            .map((model) => normalizeGeminiModelName(model?.name))
            .filter((modelName) => /^gemini/i.test(modelName));
    } catch (error) {
        console.warn('[Gemini] Failed to fetch model list:', error?.message || error);
        return [];
    }
}

async function getGeminiGenerateContentModels(apiKey = '') {
    const now = Date.now();
    if (geminiModelListCache.expiresAt > now && geminiModelListCache.models.length > 0) {
        return geminiModelListCache.models;
    }

    const discoveredModels = await listGeminiGenerateContentModels(apiKey);
    if (discoveredModels.length > 0) {
        geminiModelListCache.models = discoveredModels;
        geminiModelListCache.expiresAt = now + GEMINI_MODEL_LIST_CACHE_TTL_MS;
        return discoveredModels;
    }

    return geminiModelListCache.models;
}

function stripGeminiCodeFence(text = '') {
    return String(text || '')
        .replace(/^```(?:json|html|markdown)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
}

function parseGeminiJsonPayload(text = '') {
    const cleaned = stripGeminiCodeFence(text);
    const candidates = [cleaned];
    const objectMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objectMatch) {
        candidates.push(objectMatch[0]);
    }

    for (const candidate of candidates) {
        if (!candidate) continue;
        try {
            const parsed = JSON.parse(candidate);
            if (parsed && typeof parsed === 'object') {
                return parsed;
            }
        } catch (error) {
            // Try next parsing candidate.
        }
    }

    return null;
}

function normalizeKeywordString(value = '') {
    if (Array.isArray(value)) {
        return value
            .map((item) => String(item || '').trim())
            .filter(Boolean)
            .join(', ');
    }

    return String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .join(', ');
}

function normalizeOutlineList(value = [], maxItems = 6) {
    const source = Array.isArray(value) ? value : String(value || '').split('\n');
    return source
        .map((item) => String(item || '').replace(/^[\-*]\s*/, '').replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .slice(0, maxItems);
}

function extractOutlineFallback(text = '', maxItems = 3) {
    const normalizedText = String(text || '').replace(/\s+/g, ' ').trim();
    if (!normalizedText) return [];
    const rawItems = normalizedText.split(/[.!?]\s+/);
    return normalizeOutlineList(rawItems, maxItems);
}

function stripHtmlToText(html = '') {
    return String(html || '')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function truncateText(text = '', maxLength = 160) {
    const normalized = String(text || '').replace(/\s+/g, ' ').trim();
    if (!normalized) return '';
    if (normalized.length <= maxLength) return normalized;
    return `${normalized.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
}

async function runGeminiGenerateContent(parts = []) {
    const geminiApiKey = String(process.env.GEMINI_API_KEY || '').trim();
    if (!geminiApiKey) {
        const keyError = new Error('Set GEMINI_API_KEY in server environment variables.');
        keyError.code = 'gemini_api_key_missing';
        throw keyError;
    }

    const preferredModel = normalizeGeminiModelName(process.env.GEMINI_MODEL || 'gemini-2.0-flash');
    const discoveredModels = await getGeminiGenerateContentModels(geminiApiKey);
    const modelCandidates = getGeminiModelCandidates(preferredModel, discoveredModels);

    if (modelCandidates.length === 0) {
        const noModelError = new Error('No Gemini model candidates available.');
        noModelError.code = 'gemini_model_unavailable';
        throw noModelError;
    }

    let selectedModel = '';
    let text = '';
    let lastModelErrorMessage = '';

    for (const candidate of modelCandidates) {
        try {
            const model = genAI.getGenerativeModel({ model: candidate });
            const result = await model.generateContent({
                contents: [{ role: 'user', parts }]
            });
            const response = await result.response;
            const candidateText = stripGeminiCodeFence(response.text() || '');

            if (!candidateText) {
                throw new Error('Gemini returned empty content.');
            }

            selectedModel = candidate;
            text = candidateText;
            break;
        } catch (candidateError) {
            if (isGeminiModelNotFoundError(candidateError)) {
                lastModelErrorMessage = String(candidateError?.message || '');
                console.warn(`[Gemini] Model ${candidate} unavailable. Trying next candidate...`);
                continue;
            }

            throw candidateError;
        }
    }

    if (!selectedModel || !text) {
        const unavailableError = new Error(
            `Ingen støttet Gemini-modell tilgjengelig for generateContent. Prøvde: ${modelCandidates.join(', ')}.${lastModelErrorMessage ? ` Siste feil: ${lastModelErrorMessage}` : ''}`
        );
        unavailableError.code = 'gemini_model_unavailable';
        throw unavailableError;
    }

    return {
        model: selectedModel,
        text
    };
}

// API: Generate Blog Content with Gemini AI
app.post('/api/generate-content', aiAttachmentMiddleware, async (req, res) => {
    try {
        const topic = String(req.body.topic || req.body.prompt || '').trim();
        const tone = String(req.body.tone || 'professional').trim();
        const length = String(req.body.length || 'medium').trim();
        const existingDraft = String(req.body.existingDraft || '').trim();
        const attachments = Array.isArray(req.files) ? req.files : [];

        if (!topic && !existingDraft && attachments.length === 0) {
            return res.status(400).json({ error: 'Prompt, draft or attachment is required' });
        }

        if (!String(process.env.GEMINI_API_KEY || '').trim()) {
            return res.status(500).json({
                error: 'Gemini API key is missing',
                details: 'Set GEMINI_API_KEY in server environment variables.'
            });
        }

        const invalidAttachment = attachments.find((file) => {
            const mimeType = normalizeAiAttachmentMimeType(file);
            return !isSupportedAiAttachmentMimeType(mimeType);
        });

        if (invalidAttachment) {
            return res.status(400).json({
                error: 'Unsupported attachment type',
                details: `${invalidAttachment.originalname} is not supported. Use image, PDF, TXT or MD.`
            });
        }

        const lengthMap = {
            short: 'kort (ca. 2-3 avsnitt)',
            medium: 'middels (ca. 4-6 avsnitt)',
            long: 'lang (ca. 8-10 avsnitt)'
        };

        const promptSections = [
            'Du er en erfaren norsk innholdsforfatter.',
            `Tema/brief: ${topic || 'Bruk vedleggene som grunnlag og foreslå en tydelig vinkling.'}`,
            `Tone: ${tone || 'professional'}`,
            `Lengde: ${lengthMap[length] || lengthMap.medium}`,
            'Skriv kun gyldig HTML uten markdown-kodeblokker.',
            'Bruk semantiske tagger som <h2>, <h3>, <p>, <ul>, <li>, og eventuelt <blockquote>.',
            'Inkluder en tydelig ingress, nyttige mellomtitler og en konkret avslutning.',
            'Språk: Norsk bokmål.'
        ];

        if (existingDraft) {
            promptSections.push('Ta hensyn til eksisterende utkast, behold nyttige poeng, og forbedre struktur/språk.');
        }

        if (attachments.length > 0) {
            promptSections.push(`Bruk vedlagte filer som kontekst. Antall vedlegg: ${attachments.length}.`);
        }

        const parts = [{ text: promptSections.join('\n\n') }];

        if (existingDraft) {
            parts.push({
                text: `Eksisterende utkast:\n${existingDraft}`
            });
        }

        attachments.forEach((file) => {
            const mimeType = normalizeAiAttachmentMimeType(file);

            if (mimeType.startsWith('text/')) {
                const textContent = file.buffer.toString('utf8');
                const truncatedText = textContent.length > 60000
                    ? `${textContent.slice(0, 60000)}\n\n[Truncated due to size]`
                    : textContent;

                parts.push({
                    text: `Vedlagt fil (${file.originalname}):\n${truncatedText}`
                });
                return;
            }

            parts.push({
                text: `Vedlagt fil: ${file.originalname}`
            });
            parts.push({
                inlineData: {
                    mimeType,
                    data: file.buffer.toString('base64')
                }
            });
        });

        const aiResult = await runGeminiGenerateContent(parts);
        const text = stripGeminiCodeFence(aiResult.text);

        res.json({
            content: text,
            model: aiResult.model,
            attachmentCount: attachments.length
        });
    } catch (error) {
        console.error('Gemini API Error:', error);
        const errorCode = String(error?.code || '');
        const errorMessage = String(error?.message || '');
        const refererBlocked = /API_KEY_HTTP_REFERRER_BLOCKED|Requests from referer <empty> are blocked/i.test(errorMessage);

        if (errorCode === 'gemini_api_key_missing') {
            return res.status(500).json({
                error: 'Gemini API key is missing',
                code: 'gemini_api_key_missing',
                details: 'Set GEMINI_API_KEY in server environment variables.'
            });
        }

        if (errorCode === 'gemini_model_unavailable') {
            return res.status(500).json({
                error: 'No supported Gemini model available',
                code: 'gemini_model_unavailable',
                details: errorMessage || 'Server could not find a Gemini model that supports generateContent.'
            });
        }

        if (refererBlocked) {
            return res.status(500).json({
                error: 'Gemini key blocked by HTTP referrer restrictions',
                code: 'gemini_api_key_http_referrer_blocked',
                details: 'Gemini-kallet går fra server (uten referer). Bruk en servernøkkel uten HTTP-referrer-restriksjon, men med API-restriksjon til Generative Language API.'
            });
        }

        res.status(500).json({ error: 'Failed to generate content', details: errorMessage || 'Unknown Gemini error' });
    }
});

// API: Generate blog SEO (NO) and translation (EN)
app.post('/api/blog/ai-enrich', async (req, res) => {
    try {
        const title = String(req.body?.title || '').trim();
        const content = String(req.body?.content || '').trim();
        const excerpt = String(req.body?.excerpt || '').trim();
        const category = String(req.body?.category || '').trim();
        const seoTitle = String(req.body?.seoTitle || '').trim();
        const seoDesc = String(req.body?.seoDesc || '').trim();
        const seoKeywords = normalizeKeywordString(req.body?.seoKeywords || '');

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        if (!String(process.env.GEMINI_API_KEY || '').trim()) {
            return res.status(500).json({
                error: 'Gemini API key is missing',
                details: 'Set GEMINI_API_KEY in server environment variables.'
            });
        }

        const plainNoContent = stripHtmlToText(content);
        const fallbackNoExcerpt = excerpt || truncateText(plainNoContent, 220);
        const prompt = [
            'Du er en senior SEO-spesialist og en profesjonell oversetter (norsk -> engelsk).',
            'Du skal analysere et norsk blogginnlegg og returnere SEO-data og full engelsk versjon.',
            'Svar KUN med gyldig JSON. Ingen markdown, ingen forklaringer.',
            'JSON-formatet må være:',
            '{',
            '  "seo": {',
            '    "title": "Norsk SEO-tittel (maks 65 tegn)",',
            '    "description": "Norsk metabeskrivelse (maks 160 tegn)",',
            '    "keywords": ["nøkkelord1", "nøkkelord2", "nøkkelord3"]',
            '  },',
            '  "summary": {',
            '    "no": "Norsk sammendrag for hero (1-2 setninger)",',
            '    "en": "English hero summary (1-2 sentences)"',
            '  },',
            '  "outline": {',
            '    "no": ["Norsk punkt 1", "Norsk punkt 2", "Norsk punkt 3"],',
            '    "en": ["English point 1", "English point 2", "English point 3"]',
            '  },',
            '  "translation": {',
            '    "title": "Engelsk tittel",',
            '    "excerpt": "Engelsk utdrag (1-2 setninger)",',
            '    "category": "Engelsk kategori",',
            '    "contentHtml": "Full engelsk HTML med samme struktur som input",',
            '    "seoTitle": "English SEO title (max 65 chars)",',
            '    "seoDescription": "English meta description (max 160 chars)",',
            '    "seoKeywords": ["keyword1", "keyword2", "keyword3"]',
            '  }',
            '}',
            'Krav:',
            '- contentHtml må være gyldig HTML uten kodeblokker.',
            '- Behold semantisk struktur (<h2>, <h3>, <p>, <ul>, <li>, <blockquote>) fra originalen.',
            '- Ikke legg til fakta som ikke finnes i innholdet.',
            '- SEO-tittel og beskrivelse skal være konkrete og klikkvennlige.',
            '- summary.no og summary.en skal være korte og konkrete.',
            '- outline.no og outline.en skal ha 3-5 korte punkter.',
            '',
            `Norsk tittel: ${title}`,
            `Norsk kategori: ${category || 'Generelt'}`,
            `Norsk utdrag: ${fallbackNoExcerpt || '(mangler)'}`,
            `Eksisterende SEO-tittel: ${seoTitle || '(mangler)'}`,
            `Eksisterende SEO-beskrivelse: ${seoDesc || '(mangler)'}`,
            `Eksisterende SEO-nøkkelord: ${seoKeywords || '(mangler)'}`,
            '',
            'Norsk HTML-innhold:',
            content
        ].join('\n');

        const aiResult = await runGeminiGenerateContent([{ text: prompt }]);
        const parsed = parseGeminiJsonPayload(aiResult.text);

        if (!parsed) {
            throw new Error('Gemini returned invalid JSON payload for blog SEO/translation.');
        }

        const parsedSeo = parsed.seo || {};
        const parsedSummary = parsed.summary || {};
        const parsedOutline = parsed.outline || {};
        const parsedTranslation = parsed.translation || parsed.english || {};

        const normalizedSeoTitle = String(parsedSeo.title || parsedSeo.seoTitle || '').trim();
        const normalizedSeoDesc = String(parsedSeo.description || parsedSeo.seoDescription || '').trim();
        const normalizedSeoKeywords = normalizeKeywordString(parsedSeo.keywords || parsedSeo.seoKeywords || '');
        const normalizedSummaryNo = String(parsedSummary.no || parsed.summaryNo || '').trim();
        const normalizedSummaryEn = String(parsedSummary.en || parsed.summaryEn || '').trim();
        const normalizedOutlineNo = normalizeOutlineList(parsedOutline.no || parsed.outlineNo || []);
        const normalizedOutlineEn = normalizeOutlineList(parsedOutline.en || parsed.outlineEn || []);

        const translatedTitle = String(parsedTranslation.title || '').trim();
        const translatedExcerptRaw = String(parsedTranslation.excerpt || '').trim();
        const translatedCategory = String(parsedTranslation.category || '').trim();
        const translatedContentHtml = stripGeminiCodeFence(
            parsedTranslation.contentHtml || parsedTranslation.content || parsedTranslation.html || ''
        );
        const translatedSeoTitle = String(parsedTranslation.seoTitle || '').trim();
        const translatedSeoDesc = String(parsedTranslation.seoDescription || parsedTranslation.seoDesc || '').trim();
        const translatedSeoKeywords = normalizeKeywordString(parsedTranslation.seoKeywords || parsedTranslation.keywords || '');
        const translatedSummary = String(parsedTranslation.summary || '').trim();
        const translatedOutline = normalizeOutlineList(parsedTranslation.outline || []);

        if (!translatedContentHtml) {
            throw new Error('Gemini returned empty English content.');
        }

        const translatedPlainText = stripHtmlToText(translatedContentHtml);
        const translatedExcerpt = translatedExcerptRaw || truncateText(translatedPlainText, 220);
        const fallbackOutlineNo = extractOutlineFallback(plainNoContent, 3);
        const fallbackOutlineEn = extractOutlineFallback(translatedPlainText, 3);

        res.json({
            seo: {
                title: normalizedSeoTitle || seoTitle || title,
                description: normalizedSeoDesc || seoDesc || truncateText(plainNoContent, 160),
                keywords: normalizedSeoKeywords || seoKeywords
            },
            summary: {
                no: normalizedSummaryNo || fallbackNoExcerpt,
                en: normalizedSummaryEn || translatedSummary || translatedExcerpt
            },
            outline: {
                no: normalizedOutlineNo.length ? normalizedOutlineNo : fallbackOutlineNo,
                en: normalizedOutlineEn.length ? normalizedOutlineEn : (translatedOutline.length ? translatedOutline : fallbackOutlineEn)
            },
            translation: {
                title: translatedTitle || title,
                excerpt: translatedExcerpt,
                category: translatedCategory || category || 'General',
                content: translatedContentHtml,
                seoTitle: translatedSeoTitle || translatedTitle || title,
                seoDesc: translatedSeoDesc || truncateText(translatedPlainText, 160),
                seoKeywords: translatedSeoKeywords
            },
            model: aiResult.model
        });
    } catch (error) {
        console.error('Gemini Blog Enrichment Error:', error);
        const errorCode = String(error?.code || '');
        const errorMessage = String(error?.message || '');
        const refererBlocked = /API_KEY_HTTP_REFERRER_BLOCKED|Requests from referer <empty> are blocked/i.test(errorMessage);

        if (errorCode === 'gemini_api_key_missing') {
            return res.status(500).json({
                error: 'Gemini API key is missing',
                code: 'gemini_api_key_missing',
                details: 'Set GEMINI_API_KEY in server environment variables.'
            });
        }

        if (errorCode === 'gemini_model_unavailable') {
            return res.status(500).json({
                error: 'No supported Gemini model available',
                code: 'gemini_model_unavailable',
                details: errorMessage || 'Server could not find a Gemini model that supports generateContent.'
            });
        }

        if (refererBlocked) {
            return res.status(500).json({
                error: 'Gemini key blocked by HTTP referrer restrictions',
                code: 'gemini_api_key_http_referrer_blocked',
                details: 'Gemini-kallet går fra server (uten referer). Bruk en servernøkkel uten HTTP-referrer-restriksjon, men med API-restriksjon til Generative Language API.'
            });
        }

        res.status(500).json({
            error: 'Failed to enrich post with AI',
            details: errorMessage || 'Unknown Gemini error'
        });
    }
});

const UNSPLASH_QUERY_SYNONYMS = {
    bilde: 'image',
    bilder: 'images',
    foto: 'photo',
    fotografi: 'photography',
    nettside: 'website',
    hjemmeside: 'website',
    webside: 'website',
    webdesign: 'web design',
    design: 'design',
    markedsforing: 'marketing',
    markedsføring: 'marketing',
    sosiale: 'social',
    medier: 'media',
    kontor: 'office',
    bedrift: 'business',
    butikk: 'store',
    kunde: 'customer',
    team: 'team',
    reise: 'travel',
    natur: 'nature',
    mat: 'food',
    teknologi: 'technology',
    kunstig: 'artificial',
    intelligens: 'intelligence'
};

function normalizeUnsplashQuery(value = '') {
    return String(value || '')
        .replace(/\s+/g, ' ')
        .trim();
}

function transliterateUnsplashQuery(value = '') {
    const normalized = normalizeUnsplashQuery(value);
    return normalized.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
}

function buildUnsplashQueryVariants(rawQuery = '') {
    const variants = [];
    const seen = new Set();
    const base = normalizeUnsplashQuery(rawQuery);

    const pushVariant = (candidate) => {
        const value = normalizeUnsplashQuery(candidate);
        const key = value.toLowerCase();
        if (!value || seen.has(key)) return;
        seen.add(key);
        variants.push(value);
    };

    pushVariant(base);

    const transliterated = transliterateUnsplashQuery(base);
    if (transliterated && transliterated.toLowerCase() !== base.toLowerCase()) {
        pushVariant(transliterated);
    }

    const tokens = base
        .split(/[\s,;|/]+/)
        .map((token) => token.trim())
        .filter((token) => token.length >= 2);

    if (tokens.length > 1) {
        pushVariant(tokens.slice(0, 3).join(' '));
    }

    const translatedTokens = tokens.map((token) => {
        const tokenKey = token.toLowerCase();
        return UNSPLASH_QUERY_SYNONYMS[tokenKey] || token;
    });

    if (translatedTokens.length) {
        pushVariant(translatedTokens.join(' '));
        if (translatedTokens.length > 1) {
            pushVariant(translatedTokens.slice(0, 3).join(' '));
        }
    }

    tokens.forEach((token) => pushVariant(token));
    translatedTokens.forEach((token) => pushVariant(token));

    return variants.slice(0, 6);
}

async function fetchUnsplashSearchPage({ fetchImpl, accessKey, query, page, perPage }) {
    const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
    const response = await fetchImpl(unsplashUrl, {
        headers: {
            Authorization: `Client-ID ${accessKey}`,
            'Accept-Version': 'v1',
            'User-Agent': 'tk-design-studio'
        }
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[Unsplash] API-feil (${response.status}) for query "${query}": ${errorBody}`);
        throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

// API: Search Unsplash Images
app.get('/api/unsplash/search', async (req, res) => {
    console.log(`[Unsplash] Mottok søkeforespørsel: "${req.query.query}" (Page: ${req.query.page})`);
    try {
        const query = normalizeUnsplashQuery(req.query.query || '');
        const requestedPage = Number.parseInt(req.query.page, 10);
        const requestedPerPage = Number.parseInt(req.query.per_page, 10);
        const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
        const perPage = Number.isFinite(requestedPerPage) && requestedPerPage > 0
            ? Math.min(requestedPerPage, 30)
            : 24;

        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const fetch = (await import('node-fetch')).default;
        const accessKey = String(process.env.UNSPLASH_ACCESS_KEY || '').trim();

        if (!accessKey) {
            console.error('[Unsplash] UNSPLASH_ACCESS_KEY mangler.');
            return res.status(500).json({
                error: 'Unsplash is not configured on server',
                code: 'unsplash_not_configured',
                details: 'Set UNSPLASH_ACCESS_KEY in server environment variables.'
            });
        }

        const queryVariants = buildUnsplashQueryVariants(query);
        const collected = [];
        const seenIds = new Set();
        const tokenCount = query.split(/\s+/).filter(Boolean).length;
        let selectedTotal = 0;
        let fallbackUsed = false;
        let effectiveQuery = queryVariants[0] || query;

        for (let index = 0; index < queryVariants.length; index += 1) {
            const candidateQuery = queryVariants[index];
            const remaining = perPage - collected.length;
            if (remaining <= 0) break;

            const data = await fetchUnsplashSearchPage({
                fetchImpl: fetch,
                accessKey,
                query: candidateQuery,
                page,
                perPage: remaining
            });

            const results = Array.isArray(data?.results) ? data.results : [];
            if (index === 0) {
                selectedTotal = Number(data?.total) || 0;
                effectiveQuery = candidateQuery;
            }

            results.forEach((img) => {
                if (!img?.id || seenIds.has(img.id)) return;
                seenIds.add(img.id);
                collected.push(img);
            });

            if (index === 0) {
                const shouldTryFallback = results.length === 0
                    || (tokenCount > 1 && results.length < Math.min(8, perPage));
                if (!shouldTryFallback) {
                    break;
                }
                fallbackUsed = true;
                continue;
            }

            if (collected.length >= perPage) {
                break;
            }
        }

        // Format response to include only necessary data
        const images = collected.map((img) => ({
            id: img.id,
            full: img.urls.full || img.urls.regular,
            url: img.urls.regular,
            small: img.urls.small,
            thumb: img.urls.thumb,
            alt: img.alt_description || img.description || '',
            description: img.description || img.alt_description,
            photographer: img.user.name,
            photographerUrl: img.user.links.html,
            downloadUrl: img.links.download_location
        }));

        res.json({
            images,
            total: Math.max(selectedTotal, images.length),
            page,
            perPage,
            searchQuery: effectiveQuery,
            fallbackUsed
        });
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

// PWA: Serve manifest and service worker with correct headers
app.get('/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(path.join(__dirname, 'manifest.json'));
});

app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(__dirname, 'sw.js'));
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
