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
const firebaseWebConfigCache = {
    value: null,
    fetchedAt: 0,
    inflight: null
};
const FIREBASE_WEB_CONFIG_CACHE_MS = 10 * 60 * 1000;
const PAGE_ROUTE_MAP = {
    '/': 'index.html',
    '/blog': 'blog.html',
    '/project-details': 'project-details.html',
    '/blog-details': 'blog-details.html',
    '/contact': 'contact.html',
    '/service-details': 'service-details.html',
    '/privacy': 'privacy.html',
    '/accessibility': 'accessibility.html'
};
const LEGACY_REDIRECT_MAP = {
    '/index.html': '/',
    '/blog.html': '/blog',
    '/project-details.html': '/project-details',
    '/blog-details.html': '/blog-details',
    '/contact.html': '/contact',
    '/service-details.html': '/service-details',
    '/privacy.html': '/privacy',
    '/accessibility.html': '/accessibility'
};
const SEO_GLOBAL_DEFAULTS = {
    siteTitle: 'TK-design',
    separator: '|',
    defaultKeywords: 'design, portfolio, webutvikling, grafisk design',
    googleAnalyticsId: '',
    blogCommentsEnabled: true
};
const SEO_PAGE_DEFAULTS = {
    'index.html': {
        title: 'Hjem',
        description: 'Portefølje for Thomas Knutsen - Grafisk Designer og Webutvikler.',
        keywords: 'thomas knutsen, portefølje, hjem'
    },
    'blog.html': {
        title: 'Blogg',
        description: 'Les mine siste tanker og oppdateringer om design og teknologi.',
        keywords: 'blogg, design, tech'
    },
    'contact.html': {
        title: 'Kontakt',
        description: 'Ta kontakt med TK-design for profesjonell nettside, webdesign og SEO.',
        keywords: 'kontakt webdesigner, bestille nettside, tk-design kontakt'
    },
    'service-details.html': {
        title: 'Tjenester',
        description: 'Tjenester fra TK-design: UI/UX-design, webutvikling, digital markedsføring og merkevarebygging.',
        keywords: 'ui ux design, webutvikling, digital markedsføring, merkevarebygging'
    },
    'project-details.html': {
        title: 'Prosjekter',
        description: 'Utvalgte prosjekter fra TK-design med fokus på design, ytelse og synlighet.',
        keywords: 'prosjekter, webdesign case, tk-design'
    },
    'privacy.html': {
        title: 'Personvern',
        description: 'Personvernerklæring for TK-design og hvordan data behandles på nettsiden.',
        keywords: 'personvern, personvernerklæring, tk-design'
    },
    'accessibility.html': {
        title: 'Tilgjengelighet',
        description: 'Tilgjengelighetserklæring for TK-design med informasjon om universell utforming.',
        keywords: 'tilgjengelighet, universell utforming, tilgjengelighetserklæring'
    }
};

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
    if (typeof globalThis.fetch === 'function') {
        return globalThis.fetch.bind(globalThis);
    }

    try {
        const requiredFetch = require('node-fetch');
        if (typeof requiredFetch === 'function') {
            return requiredFetch;
        }
        if (requiredFetch && typeof requiredFetch.default === 'function') {
            return requiredFetch.default;
        }
    } catch (error) {
        // Fallback to dynamic import below.
    }

    const fetchModule = await import('node-fetch');
    return fetchModule.default;
}

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function upsertHeadMetaTag(html = '', attrName = 'name', attrValue = '', content = '') {
    const safeAttrName = String(attrName || '').trim();
    const safeAttrValue = String(attrValue || '').trim();
    if (!safeAttrName || !safeAttrValue) return String(html || '');

    const safeContent = escapeHtml(content || '');
    const tag = `<meta ${safeAttrName}="${safeAttrValue}" content="${safeContent}">`;
    const regex = new RegExp(`<meta\\s+${safeAttrName}="${safeAttrValue}"\\s+content="[\\s\\S]*?">`, 'i');
    const input = String(html || '');

    if (regex.test(input)) {
        return input.replace(regex, tag);
    }

    if (input.includes('</head>')) {
        return input.replace('</head>', `${tag}\n</head>`);
    }

    return `${input}\n${tag}`;
}

function serializeInlineJson(value) {
    return JSON.stringify(value).replace(/</g, '\\u003c');
}

function getCustomStyleHref() {
    const basePath = '/custom-style.css';
    try {
        const stat = fs.statSync(getAdminCustomStyleFilePath());
        const version = Math.floor(stat.mtimeMs);
        return `${basePath}?v=${version}`;
    } catch (error) {
        return basePath;
    }
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
        unsplash: !!String(process.env.UNSPLASH_ACCESS_KEY || '').trim(),
        social: {
            webhook: !!String(process.env.SOCIAL_WEBHOOK_URL || '').trim(),
            webhookSecret: !!String(process.env.SOCIAL_WEBHOOK_SECRET || '').trim(),
            metricsSyncToken: !!String(process.env.SOCIAL_METRICS_SYNC_TOKEN || '').trim()
        }
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

async function getCachedFirebaseWebAppConfig() {
    const now = Date.now();
    if (
        firebaseWebConfigCache.value &&
        (now - firebaseWebConfigCache.fetchedAt) < FIREBASE_WEB_CONFIG_CACHE_MS
    ) {
        return firebaseWebConfigCache.value;
    }

    if (firebaseWebConfigCache.inflight) {
        return firebaseWebConfigCache.inflight;
    }

    firebaseWebConfigCache.inflight = getOrCreateFirebaseWebAppConfig()
        .then((config) => {
            firebaseWebConfigCache.value = config;
            firebaseWebConfigCache.fetchedAt = Date.now();
            return config;
        })
        .finally(() => {
            firebaseWebConfigCache.inflight = null;
        });

    return firebaseWebConfigCache.inflight;
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

function getCommentsFilePath() {
    return path.join(__dirname, 'data/comments.json');
}

function getSocialPlannerFilePath() {
    return path.join(__dirname, 'data/social_planner.json');
}

function getSeoFilePath() {
    return path.join(__dirname, 'data/seo.json');
}

function getAdminCustomStyleFilePath() {
    return path.join(__dirname, 'public', 'admin', 'custom-style.css');
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

function buildFallbackCommentId(postId, name, message, createdAt) {
    const digest = crypto
        .createHash('sha1')
        .update(`${postId}|${name}|${message}|${createdAt}`)
        .digest('hex')
        .slice(0, 12);
    return `legacy_${digest}`;
}

function normalizeCommentEntry(value, fallbackPostId = null) {
    const postId = Number(value?.postId ?? fallbackPostId);
    if (!Number.isFinite(postId) || postId <= 0) {
        return null;
    }

    const name = String(value?.name || '').replace(/\s+/g, ' ').trim().slice(0, 80);
    const message = String(value?.message || '').replace(/\r\n/g, '\n').trim().slice(0, 2000);
    if (!name || !message) {
        return null;
    }

    const rawCreatedAt = String(value?.createdAt || '').trim();
    const createdAt = Number.isFinite(new Date(rawCreatedAt).getTime())
        ? new Date(rawCreatedAt).toISOString()
        : new Date().toISOString();

    const id = String(value?.id || '').trim() || buildFallbackCommentId(postId, name, message, createdAt);

    return {
        id,
        postId,
        name,
        message,
        createdAt
    };
}

function normalizeCommentsData(rawComments) {
    const normalized = {};

    function assignComment(value, fallbackPostId = null) {
        const comment = normalizeCommentEntry(value, fallbackPostId);
        if (!comment) return;

        const postKey = String(comment.postId);
        if (!Array.isArray(normalized[postKey])) {
            normalized[postKey] = [];
        }
        normalized[postKey].push(comment);
    }

    if (Array.isArray(rawComments)) {
        rawComments.forEach((comment) => assignComment(comment));
    } else if (rawComments && typeof rawComments === 'object') {
        for (const [postKey, comments] of Object.entries(rawComments)) {
            if (!Array.isArray(comments)) continue;
            comments.forEach((comment) => assignComment(comment, postKey));
        }
    }

    for (const [postKey, comments] of Object.entries(normalized)) {
        comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        const deduplicated = [];
        const seenIds = new Set();
        comments.forEach((comment) => {
            if (seenIds.has(comment.id)) return;
            seenIds.add(comment.id);
            deduplicated.push(comment);
        });
        normalized[postKey] = deduplicated;
    }

    return normalized;
}

function readBlogComments() {
    const commentsPath = getCommentsFilePath();
    if (!fs.existsSync(commentsPath)) {
        return {};
    }

    const rawData = JSON.parse(fs.readFileSync(commentsPath, 'utf8'));
    return normalizeCommentsData(rawData);
}

function writeBlogComments(commentsData) {
    const normalizedComments = normalizeCommentsData(commentsData);
    fs.writeFileSync(getCommentsFilePath(), JSON.stringify(normalizedComments, null, 4), 'utf8');
}

const SOCIAL_PLATFORMS = Object.freeze(['facebook', 'instagram', 'linkedin', 'x', 'tiktok']);
const SOCIAL_ENTRY_STATUSES = new Set([
    'draft',
    'scheduled',
    'publishing',
    'published',
    'partially_published',
    'failed',
    'cancelled'
]);
const SOCIAL_PLANNER_PERIOD_PRESETS = Object.freeze({
    '1d': 1,
    '7d': 7,
    '14d': 14,
    '30d': 30,
    '365d': 365
});

function normalizeIsoDateTime(value, fallbackIso = new Date().toISOString()) {
    const candidate = String(value || '').trim();
    const parsed = new Date(candidate);
    if (!Number.isFinite(parsed.getTime())) {
        return String(fallbackIso || new Date().toISOString());
    }
    return parsed.toISOString();
}

function normalizePlannerText(value, maxLength = 5000) {
    return String(value || '').replace(/\r\n/g, '\n').replace(/\s+\n/g, '\n').trim().slice(0, maxLength);
}

function normalizePlannerShortText(value, maxLength = 160) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function normalizePlannerUrl(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith('//')) return `https:${raw}`;
    if (raw.startsWith('/')) return raw;
    return `https://${raw}`;
}

function normalizePlannerPlatform(value) {
    const normalized = String(value || '').trim().toLowerCase();
    return SOCIAL_PLATFORMS.includes(normalized) ? normalized : 'facebook';
}

function normalizePlannerStatus(value) {
    const normalized = String(value || '').trim().toLowerCase();
    return SOCIAL_ENTRY_STATUSES.has(normalized) ? normalized : 'draft';
}

function createSocialPlannerId(prefix = 'sp') {
    return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

function normalizePlannerHashtags(value) {
    const rawItems = Array.isArray(value)
        ? value
        : String(value || '')
            .split(/[\n, ]+/)
            .map((item) => item.trim())
            .filter(Boolean);
    const seen = new Set();
    const hashtags = [];

    rawItems.forEach((item) => {
        let cleaned = String(item || '').trim().toLowerCase();
        cleaned = cleaned.replace(/^#+/, '').replace(/[^a-z0-9_]+/g, '');
        if (!cleaned || seen.has(cleaned)) return;
        seen.add(cleaned);
        hashtags.push(`#${cleaned}`);
    });

    return hashtags.slice(0, 20);
}

function normalizePlannerVariants(value) {
    const source = (value && typeof value === 'object' && !Array.isArray(value)) ? value : {};
    const normalized = {};

    SOCIAL_PLATFORMS.forEach((platform) => {
        normalized[platform] = normalizePlannerText(source[platform] || '', 3000);
    });

    return normalized;
}

function createDefaultSocialPlannerData() {
    const nowIso = new Date().toISOString();
    return {
        version: 1,
        settings: {
            activeWorkspaceId: 'default'
        },
        workspaces: [
            {
                id: 'default',
                name: 'TK-design',
                timezone: 'Europe/Oslo',
                createdAt: nowIso,
                updatedAt: nowIso
            }
        ],
        socialAccounts: [],
        templates: [
            {
                id: createSocialPlannerId('tpl'),
                workspaceId: 'default',
                category: 'salg',
                name: 'Salgskampanje',
                body: 'Nytt fra oss: {{title}}\n\n{{summary}}\n\nLes mer: {{url}}',
                createdAt: nowIso,
                updatedAt: nowIso
            },
            {
                id: createSocialPlannerId('tpl'),
                workspaceId: 'default',
                category: 'inspirasjon',
                name: 'Tips og innsikt',
                body: '{{hook}}\n\n{{summary}}\n\n#tips #inspirasjon',
                createdAt: nowIso,
                updatedAt: nowIso
            }
        ],
        entries: []
    };
}

function normalizeSocialPlannerWorkspace(workspace, fallbackId = 'default') {
    const nowIso = new Date().toISOString();
    const candidate = (workspace && typeof workspace === 'object' && !Array.isArray(workspace)) ? workspace : {};
    const id = normalizePlannerShortText(candidate.id || fallbackId, 60) || fallbackId;
    return {
        id,
        name: normalizePlannerShortText(candidate.name || 'Workspace', 100) || 'Workspace',
        timezone: normalizePlannerShortText(candidate.timezone || 'Europe/Oslo', 60) || 'Europe/Oslo',
        createdAt: normalizeIsoDateTime(candidate.createdAt, nowIso),
        updatedAt: normalizeIsoDateTime(candidate.updatedAt, nowIso)
    };
}

function normalizeSocialPlannerAccount(account, workspaceIds = new Set(['default'])) {
    const nowIso = new Date().toISOString();
    const candidate = (account && typeof account === 'object' && !Array.isArray(account)) ? account : {};
    const workspaceId = workspaceIds.has(String(candidate.workspaceId || ''))
        ? String(candidate.workspaceId)
        : 'default';

    return {
        id: normalizePlannerShortText(candidate.id || createSocialPlannerId('acct'), 80),
        workspaceId,
        platform: normalizePlannerPlatform(candidate.platform),
        displayName: normalizePlannerShortText(candidate.displayName || '', 120),
        externalAccountId: normalizePlannerShortText(candidate.externalAccountId || '', 180),
        status: normalizePlannerShortText(candidate.status || 'active', 30).toLowerCase() || 'active',
        createdAt: normalizeIsoDateTime(candidate.createdAt, nowIso),
        updatedAt: normalizeIsoDateTime(candidate.updatedAt, nowIso)
    };
}

function normalizeSocialPlannerTemplate(template, workspaceIds = new Set(['default'])) {
    const nowIso = new Date().toISOString();
    const candidate = (template && typeof template === 'object' && !Array.isArray(template)) ? template : {};
    const workspaceId = workspaceIds.has(String(candidate.workspaceId || ''))
        ? String(candidate.workspaceId)
        : 'default';
    const category = normalizePlannerShortText(candidate.category || 'generelt', 40).toLowerCase() || 'generelt';

    return {
        id: normalizePlannerShortText(candidate.id || createSocialPlannerId('tpl'), 80),
        workspaceId,
        category,
        name: normalizePlannerShortText(candidate.name || 'Template', 120) || 'Template',
        body: normalizePlannerText(candidate.body || '', 5000),
        createdAt: normalizeIsoDateTime(candidate.createdAt, nowIso),
        updatedAt: normalizeIsoDateTime(candidate.updatedAt, nowIso)
    };
}

function normalizeSocialPlannerMetrics(metrics) {
    const source = (metrics && typeof metrics === 'object' && !Array.isArray(metrics)) ? metrics : {};
    const toInt = (value) => {
        const parsed = Number.parseInt(value, 10);
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
    };

    return {
        likes: toInt(source.likes),
        comments: toInt(source.comments),
        shares: toInt(source.shares),
        reach: toInt(source.reach),
        clicks: toInt(source.clicks)
    };
}

function extractSocialPlannerMetricsPatch(source = {}) {
    const candidate = (source && typeof source === 'object' && !Array.isArray(source)) ? source : {};
    const patch = {};

    const likes = parseNonNegativeIntegerOrNull(candidate.likes);
    const comments = parseNonNegativeIntegerOrNull(candidate.comments);
    const shares = parseNonNegativeIntegerOrNull(candidate.shares);
    const reach = parseNonNegativeIntegerOrNull(candidate.reach);
    const clicks = parseNonNegativeIntegerOrNull(candidate.clicks);

    if (likes !== null) patch.likes = likes;
    if (comments !== null) patch.comments = comments;
    if (shares !== null) patch.shares = shares;
    if (reach !== null) patch.reach = reach;
    if (clicks !== null) patch.clicks = clicks;

    return patch;
}

function mergeSocialPlannerMetrics(baseMetrics = {}, patchMetrics = {}) {
    const base = normalizeSocialPlannerMetrics(baseMetrics);
    const patch = extractSocialPlannerMetricsPatch(patchMetrics);
    return {
        likes: patch.likes ?? base.likes,
        comments: patch.comments ?? base.comments,
        shares: patch.shares ?? base.shares,
        reach: patch.reach ?? base.reach,
        clicks: patch.clicks ?? base.clicks
    };
}

function normalizeSocialPlannerPublication(publication) {
    const nowIso = new Date().toISOString();
    const candidate = (publication && typeof publication === 'object' && !Array.isArray(publication)) ? publication : {};
    return {
        accountId: normalizePlannerShortText(candidate.accountId || '', 80),
        platform: normalizePlannerPlatform(candidate.platform || ''),
        externalPostId: normalizePlannerShortText(candidate.externalPostId || '', 240),
        externalMediaId: normalizePlannerShortText(candidate.externalMediaId || '', 240),
        externalUrl: normalizePlannerUrl(candidate.externalUrl || ''),
        publishedAt: candidate.publishedAt ? normalizeIsoDateTime(candidate.publishedAt, nowIso) : '',
        metrics: normalizeSocialPlannerMetrics(candidate.metrics || {}),
        metricsUpdatedAt: candidate.metricsUpdatedAt ? normalizeIsoDateTime(candidate.metricsUpdatedAt, nowIso) : '',
        updatedAt: normalizeIsoDateTime(candidate.updatedAt, nowIso)
    };
}

function normalizeSocialPlannerPublications(publications = []) {
    const list = Array.isArray(publications) ? publications : [];
    const normalized = [];
    const seen = new Set();

    list.forEach((item, index) => {
        const publication = normalizeSocialPlannerPublication(item);
        const stableKey = `${publication.accountId || '_'}|${publication.platform || '_'}|${publication.externalPostId || publication.externalMediaId || `idx_${index}`}`;
        if (seen.has(stableKey)) return;
        seen.add(stableKey);
        normalized.push(publication);
    });

    return normalized.slice(-100);
}

function sumSocialPlannerPublicationMetrics(publications = []) {
    const list = Array.isArray(publications) ? publications : [];
    return list.reduce((acc, publication) => {
        const metrics = normalizeSocialPlannerMetrics(publication?.metrics || {});
        acc.likes += metrics.likes;
        acc.comments += metrics.comments;
        acc.shares += metrics.shares;
        acc.reach += metrics.reach;
        acc.clicks += metrics.clicks;
        return acc;
    }, { likes: 0, comments: 0, shares: 0, reach: 0, clicks: 0 });
}

function findSocialPlannerPublicationIndex(publications = [], update = {}) {
    const list = Array.isArray(publications) ? publications : [];
    const accountId = normalizePlannerShortText(update.accountId || '', 80);
    const platform = normalizePlannerPlatform(update.platform || '');
    const externalPostId = normalizePlannerShortText(update.externalPostId || '', 240);
    const externalMediaId = normalizePlannerShortText(update.externalMediaId || '', 240);

    if (accountId && platform) {
        const exact = list.findIndex((publication) => publication.accountId === accountId && publication.platform === platform);
        if (exact >= 0) return exact;
    }
    if (accountId) {
        const byAccount = list.findIndex((publication) => publication.accountId === accountId);
        if (byAccount >= 0) return byAccount;
    }
    if (externalPostId && platform) {
        const byExternalAndPlatform = list.findIndex((publication) => publication.externalPostId === externalPostId && publication.platform === platform);
        if (byExternalAndPlatform >= 0) return byExternalAndPlatform;
    }
    if (externalPostId) {
        const byExternal = list.findIndex((publication) => publication.externalPostId === externalPostId);
        if (byExternal >= 0) return byExternal;
    }
    if (externalMediaId) {
        const byMedia = list.findIndex((publication) => publication.externalMediaId === externalMediaId);
        if (byMedia >= 0) return byMedia;
    }
    if (platform) {
        return list.findIndex((publication) => publication.platform === platform);
    }
    return -1;
}

function upsertSocialPlannerEntryPublication(entry, update = {}) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        return;
    }

    const nowIso = new Date().toISOString();
    const publications = normalizeSocialPlannerPublications(entry.platformPublications || []);
    const targetIndex = findSocialPlannerPublicationIndex(publications, update);
    const current = targetIndex >= 0
        ? publications[targetIndex]
        : normalizeSocialPlannerPublication({
            accountId: update.accountId,
            platform: update.platform
        });

    const metricsPatch = extractSocialPlannerMetricsPatch(update.metricsPatch || update.metrics || {});
    const hasMetricsPatch = Object.keys(metricsPatch).length > 0;
    const next = normalizeSocialPlannerPublication({
        ...current,
        accountId: normalizePlannerShortText(update.accountId || current.accountId || '', 80),
        platform: normalizePlannerPlatform(update.platform || current.platform || ''),
        externalPostId: normalizePlannerShortText(update.externalPostId || current.externalPostId || '', 240),
        externalMediaId: normalizePlannerShortText(update.externalMediaId || current.externalMediaId || '', 240),
        externalUrl: normalizePlannerUrl(update.externalUrl || current.externalUrl || ''),
        publishedAt: update.publishedAt || current.publishedAt || '',
        metrics: hasMetricsPatch
            ? mergeSocialPlannerMetrics(current.metrics || {}, metricsPatch)
            : normalizeSocialPlannerMetrics(current.metrics || {}),
        metricsUpdatedAt: hasMetricsPatch
            ? normalizeIsoDateTime(update.metricsUpdatedAt || nowIso, nowIso)
            : current.metricsUpdatedAt,
        updatedAt: nowIso
    });

    if (targetIndex >= 0) {
        publications[targetIndex] = next;
    } else {
        publications.push(next);
    }

    entry.platformPublications = normalizeSocialPlannerPublications(publications);
    if (hasMetricsPatch) {
        entry.metrics = sumSocialPlannerPublicationMetrics(entry.platformPublications);
    }
}

function normalizeSocialPlannerEntry(entry, workspaceIds = new Set(['default']), accountIds = new Set()) {
    const nowIso = new Date().toISOString();
    const candidate = (entry && typeof entry === 'object' && !Array.isArray(entry)) ? entry : {};
    const workspaceId = workspaceIds.has(String(candidate.workspaceId || ''))
        ? String(candidate.workspaceId)
        : 'default';
    const targetAccountIdsRaw = Array.isArray(candidate.targetAccountIds) ? candidate.targetAccountIds : [];
    const targetAccountIds = [];
    const seenAccountIds = new Set();
    targetAccountIdsRaw.forEach((value) => {
        const id = normalizePlannerShortText(value, 80);
        if (!id || seenAccountIds.has(id)) return;
        if (accountIds.size > 0 && !accountIds.has(id)) return;
        seenAccountIds.add(id);
        targetAccountIds.push(id);
    });

    const status = normalizePlannerStatus(candidate.status);
    const scheduledFor = normalizePlannerText(candidate.scheduledFor || '', 40);

    return {
        id: normalizePlannerShortText(candidate.id || createSocialPlannerId('entry'), 80),
        workspaceId,
        title: normalizePlannerShortText(candidate.title || 'Uten tittel', 180) || 'Uten tittel',
        masterText: normalizePlannerText(candidate.masterText || '', 6000),
        variants: normalizePlannerVariants(candidate.variants || {}),
        hashtags: normalizePlannerHashtags(candidate.hashtags || []),
        mediaUrl: normalizePlannerUrl(candidate.mediaUrl || ''),
        linkUrl: normalizePlannerUrl(candidate.linkUrl || ''),
        targetAccountIds,
        status,
        scheduledFor: scheduledFor ? normalizeIsoDateTime(scheduledFor, nowIso) : '',
        publishedAt: candidate.publishedAt ? normalizeIsoDateTime(candidate.publishedAt, nowIso) : '',
        createdAt: normalizeIsoDateTime(candidate.createdAt, nowIso),
        updatedAt: normalizeIsoDateTime(candidate.updatedAt, nowIso),
        lastError: normalizePlannerText(candidate.lastError || '', 1000),
        publishLog: Array.isArray(candidate.publishLog)
            ? candidate.publishLog.slice(-50).map((row) => ({
                at: normalizeIsoDateTime(row?.at || nowIso, nowIso),
                accountId: normalizePlannerShortText(row?.accountId || '', 80),
                platform: normalizePlannerPlatform(row?.platform || 'facebook'),
                status: normalizePlannerShortText(row?.status || 'unknown', 40),
                details: normalizePlannerText(row?.details || '', 500)
            }))
            : [],
        platformPublications: normalizeSocialPlannerPublications(candidate.platformPublications || []),
        metrics: normalizeSocialPlannerMetrics(candidate.metrics || {})
    };
}

function normalizeSocialPlannerData(rawData) {
    const source = (rawData && typeof rawData === 'object' && !Array.isArray(rawData))
        ? rawData
        : createDefaultSocialPlannerData();
    const defaults = createDefaultSocialPlannerData();
    const rawWorkspaces = Array.isArray(source.workspaces) ? source.workspaces : defaults.workspaces;
    const workspaceMap = new Map();

    rawWorkspaces.forEach((workspace) => {
        const normalized = normalizeSocialPlannerWorkspace(workspace);
        if (!workspaceMap.has(normalized.id)) {
            workspaceMap.set(normalized.id, normalized);
        }
    });

    if (!workspaceMap.has('default')) {
        workspaceMap.set('default', normalizeSocialPlannerWorkspace(defaults.workspaces[0], 'default'));
    }

    const workspaces = Array.from(workspaceMap.values());
    const workspaceIds = new Set(workspaces.map((workspace) => workspace.id));

    const rawAccounts = Array.isArray(source.socialAccounts) ? source.socialAccounts : [];
    const accountMap = new Map();
    rawAccounts.forEach((account) => {
        const normalized = normalizeSocialPlannerAccount(account, workspaceIds);
        if (normalized.displayName && !accountMap.has(normalized.id)) {
            accountMap.set(normalized.id, normalized);
        }
    });
    const socialAccounts = Array.from(accountMap.values());
    const accountIds = new Set(socialAccounts.map((account) => account.id));

    const rawTemplates = Array.isArray(source.templates) ? source.templates : defaults.templates;
    const templateMap = new Map();
    rawTemplates.forEach((template) => {
        const normalized = normalizeSocialPlannerTemplate(template, workspaceIds);
        if (!templateMap.has(normalized.id)) {
            templateMap.set(normalized.id, normalized);
        }
    });
    const templates = Array.from(templateMap.values());

    const rawEntries = Array.isArray(source.entries) ? source.entries : [];
    const entryMap = new Map();
    rawEntries.forEach((entry) => {
        const normalized = normalizeSocialPlannerEntry(entry, workspaceIds, accountIds);
        if (!entryMap.has(normalized.id)) {
            entryMap.set(normalized.id, normalized);
        }
    });

    const entries = Array.from(entryMap.values()).sort((a, b) => {
        const left = new Date(a.scheduledFor || a.createdAt).getTime();
        const right = new Date(b.scheduledFor || b.createdAt).getTime();
        return right - left;
    });

    const activeWorkspaceIdCandidate = String(source?.settings?.activeWorkspaceId || 'default');
    const activeWorkspaceId = workspaceIds.has(activeWorkspaceIdCandidate) ? activeWorkspaceIdCandidate : 'default';

    return {
        version: 1,
        settings: { activeWorkspaceId },
        workspaces,
        socialAccounts,
        templates,
        entries
    };
}

function readSocialPlannerData() {
    const filePath = getSocialPlannerFilePath();
    if (!fs.existsSync(filePath)) {
        return createDefaultSocialPlannerData();
    }

    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return normalizeSocialPlannerData(raw);
}

function writeSocialPlannerData(data) {
    const normalized = normalizeSocialPlannerData(data);
    fs.writeFileSync(getSocialPlannerFilePath(), JSON.stringify(normalized, null, 4), 'utf8');
}

function summarizeEntryEngagement(entry) {
    const metrics = normalizeSocialPlannerMetrics(entry?.metrics || {});
    return metrics.likes + metrics.comments + metrics.shares + metrics.clicks;
}

function resolveSocialPlannerDateRange(query = {}) {
    const periodRaw = String(query.period || '').trim().toLowerCase();
    const presetDays = SOCIAL_PLANNER_PERIOD_PRESETS[periodRaw] || SOCIAL_PLANNER_PERIOD_PRESETS['7d'];
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - (presetDays - 1));
    start.setHours(0, 0, 0, 0);

    if (periodRaw === 'custom') {
        const startRaw = String(query.startDate || '').trim();
        const endRaw = String(query.endDate || '').trim();
        const startCustom = new Date(`${startRaw}T00:00:00`);
        const endCustom = new Date(`${endRaw}T23:59:59`);

        if (Number.isFinite(startCustom.getTime()) && Number.isFinite(endCustom.getTime()) && startCustom <= endCustom) {
            return {
                period: 'custom',
                start: startCustom,
                end: endCustom
            };
        }
    }

    return {
        period: periodRaw in SOCIAL_PLANNER_PERIOD_PRESETS ? periodRaw : '7d',
        start,
        end
    };
}

function computeSocialPlannerAnalytics(data, range) {
    const entries = Array.isArray(data?.entries) ? data.entries : [];
    const publishedEntries = entries.filter((entry) => {
        if (!entry?.publishedAt) return false;
        const publishedAt = new Date(entry.publishedAt);
        if (!Number.isFinite(publishedAt.getTime())) return false;
        return publishedAt >= range.start && publishedAt <= range.end;
    });

    const totals = publishedEntries.reduce((acc, entry) => {
        const metrics = normalizeSocialPlannerMetrics(entry.metrics || {});
        acc.likes += metrics.likes;
        acc.comments += metrics.comments;
        acc.shares += metrics.shares;
        acc.reach += metrics.reach;
        acc.clicks += metrics.clicks;
        return acc;
    }, { likes: 0, comments: 0, shares: 0, reach: 0, clicks: 0 });

    const dayBuckets = new Map();
    const hourBuckets = new Map();

    publishedEntries.forEach((entry) => {
        const publishedAt = new Date(entry.publishedAt);
        const dayName = publishedAt.toLocaleDateString('no-NO', { weekday: 'long' });
        const hourKey = publishedAt.getHours();
        const engagement = summarizeEntryEngagement(entry);

        dayBuckets.set(dayName, (dayBuckets.get(dayName) || 0) + engagement);
        hourBuckets.set(hourKey, (hourBuckets.get(hourKey) || 0) + engagement);
    });

    const bestDay = Array.from(dayBuckets.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Ingen data';
    const bestHour = Array.from(hourBuckets.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0];

    const topEntries = publishedEntries
        .map((entry) => ({
            id: entry.id,
            title: entry.title,
            status: entry.status,
            publishedAt: entry.publishedAt,
            engagement: summarizeEntryEngagement(entry),
            metrics: normalizeSocialPlannerMetrics(entry.metrics || {})
        }))
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, 8);

    return {
        range: {
            period: range.period,
            startDate: range.start.toISOString().slice(0, 10),
            endDate: range.end.toISOString().slice(0, 10)
        },
        overview: {
            publishedPosts: publishedEntries.length,
            ...totals,
            bestDay,
            bestHour: Number.isFinite(bestHour) ? `${String(bestHour).padStart(2, '0')}:00` : 'Ingen data'
        },
        topEntries
    };
}

function buildSocialPlannerCaption(entry = {}, platform = 'facebook') {
    const variant = String(entry?.variants?.[platform] || '').trim();
    const master = String(entry?.masterText || '').trim();
    const title = String(entry?.title || '').trim();
    const hashtags = Array.isArray(entry?.hashtags) ? entry.hashtags.join(' ') : '';
    const linkUrl = String(entry?.linkUrl || '').trim();

    return [variant || master || title, linkUrl, hashtags].filter(Boolean).join('\n\n').trim();
}

function normalizeSeoData(seoData) {
    const parsedSeoData = (seoData && typeof seoData === 'object' && !Array.isArray(seoData))
        ? seoData
        : {};
    const parsedGlobal = (parsedSeoData.global && typeof parsedSeoData.global === 'object' && !Array.isArray(parsedSeoData.global))
        ? parsedSeoData.global
        : {};
    const parsedPages = (parsedSeoData.pages && typeof parsedSeoData.pages === 'object' && !Array.isArray(parsedSeoData.pages))
        ? parsedSeoData.pages
        : {};
    const blogCommentsEnabledRaw = parsedGlobal.blogCommentsEnabled;
    const blogCommentsEnabled = !(
        blogCommentsEnabledRaw === false ||
        String(blogCommentsEnabledRaw).toLowerCase() === 'false'
    );
    const normalizedPages = {};

    for (const [pageFile, defaults] of Object.entries(SEO_PAGE_DEFAULTS)) {
        const pageCandidate = parsedPages[pageFile];
        const pageConfig = (pageCandidate && typeof pageCandidate === 'object' && !Array.isArray(pageCandidate))
            ? pageCandidate
            : {};

        normalizedPages[pageFile] = {
            title: String(pageConfig.title ?? defaults.title ?? '').trim(),
            description: String(pageConfig.description ?? defaults.description ?? '').trim(),
            keywords: String(pageConfig.keywords ?? defaults.keywords ?? '').trim()
        };
    }

    return {
        global: {
            ...SEO_GLOBAL_DEFAULTS,
            ...parsedGlobal,
            blogCommentsEnabled
        },
        pages: normalizedPages
    };
}

function readSeoData() {
    if (!fs.existsSync(getSeoFilePath())) {
        return normalizeSeoData({});
    }

    return normalizeSeoData(JSON.parse(fs.readFileSync(getSeoFilePath(), 'utf8')));
}

function writeSeoData(seoData) {
    fs.writeFileSync(getSeoFilePath(), JSON.stringify(normalizeSeoData(seoData), null, 4), 'utf8');
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
    const {
        cssVariables,
        fontUrl,
        fontUrls,
        fontFamily,
        fontBodyFamily,
        fontHeadingFamily
    } = req.body;

    let cssContent = '';
    const rootVariables = {};
    const refreshVariables = {};

    // 1. Add Font imports (deduplicated)
    const incomingFontUrls = Array.isArray(fontUrls)
        ? fontUrls
        : [fontUrl].filter(Boolean);
    const uniqueFontUrls = [...new Set(incomingFontUrls
        .map((item) => String(item || '').trim())
        .filter(Boolean))];
    uniqueFontUrls.forEach((url) => {
        cssContent += `@import url('${url}');\n`;
    });

    if (fontFamily) {
        rootVariables['--font-primary'] = fontFamily;
    }
    if (fontBodyFamily) {
        rootVariables['--font-body'] = fontBodyFamily;
    }
    if (fontHeadingFamily) {
        rootVariables['--font-heading'] = fontHeadingFamily;
    }

    for (const [key, value] of Object.entries(cssVariables || {})) {
        const normalizedKey = String(key || '').trim();
        const normalizedValue = String(value || '').trim();
        if (!normalizedKey || !normalizedValue) continue;

        if (normalizedKey.startsWith('--refresh-')) {
            refreshVariables[normalizedKey] = normalizedValue;
        } else {
            rootVariables[normalizedKey] = normalizedValue;
        }
    }

    // 2. Root variables
    cssContent += `:root {\n`;
    for (const [key, value] of Object.entries(rootVariables)) {
        cssContent += `    ${key}: ${value};\n`;
    }
    cssContent += `}\n`;

    // 3. Refresh variables used by the live site
    cssContent += `body.homepage-refresh {\n`;
    for (const [key, value] of Object.entries(refreshVariables)) {
        cssContent += `    ${key}: ${value};\n`;
    }
    if (fontBodyFamily) {
        cssContent += `    font-family: var(--font-body, ${fontBodyFamily});\n`;
    }
    cssContent += `}\n`;

    if (fontHeadingFamily) {
        cssContent += `body.homepage-refresh h1,\n`;
        cssContent += `body.homepage-refresh h2,\n`;
        cssContent += `body.homepage-refresh h3,\n`;
        cssContent += `body.homepage-refresh h4,\n`;
        cssContent += `body.homepage-refresh h5,\n`;
        cssContent += `body.homepage-refresh h6 {\n`;
        cssContent += `    font-family: var(--font-heading, ${fontHeadingFamily});\n`;
        cssContent += `}\n`;
    }

    try {
        const result = await persistStyleCss(cssContent, writeCustomStyleCss);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error saving style', details: error.message });
    }
});

const ANALYTICS_DATE_RANGE_PRESETS = Object.freeze({
    '1d': { startDate: '1daysAgo', endDate: 'today', shortLabel: '1d', metricSuffix: 'siste døgn' },
    '7d': { startDate: '7daysAgo', endDate: 'today', shortLabel: '7d', metricSuffix: 'siste 7 dager' },
    '14d': { startDate: '14daysAgo', endDate: 'today', shortLabel: '14d', metricSuffix: 'siste 14 dager' },
    '30d': { startDate: '30daysAgo', endDate: 'today', shortLabel: '30d', metricSuffix: 'siste 30 dager' },
    '365d': { startDate: '365daysAgo', endDate: 'today', shortLabel: '1 år', metricSuffix: 'siste 1 år' }
});

const ANALYTICS_DATE_RANGE_ALIASES = Object.freeze({
    '1': '1d',
    '1d': '1d',
    '24h': '1d',
    day: '1d',
    '7': '7d',
    '7d': '7d',
    '14': '14d',
    '14d': '14d',
    '30': '30d',
    '30d': '30d',
    '365': '365d',
    '1y': '365d',
    '365d': '365d',
    year: '365d',
    custom: 'custom'
});

function normalizeAnalyticsPeriod(period = '7d') {
    const raw = String(period || '').trim().toLowerCase();
    return ANALYTICS_DATE_RANGE_ALIASES[raw] || '7d';
}

function isValidIsoDateString(value = '') {
    const candidate = String(value || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(candidate)) return false;
    const parsed = new Date(`${candidate}T12:00:00`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === candidate;
}

// API: Get Blog Posts
// --- Messages API ---
app.get('/api/analytics', async (req, res) => {
    const propertyId = process.env.GA_PROPERTY_ID;
    const period = normalizeAnalyticsPeriod(req.query.period);
    const startDate = String(req.query.startDate || '').trim();
    const endDate = String(req.query.endDate || '').trim();

    let selectedRange;
    let rangeMeta;

    if (period === 'custom') {
        if (!isValidIsoDateString(startDate) || !isValidIsoDateString(endDate)) {
            return res.status(400).json({
                status: 'error',
                error: 'Ugyldig datoformat. Bruk YYYY-MM-DD.'
            });
        }
        if (startDate > endDate) {
            return res.status(400).json({
                status: 'error',
                error: 'Startdato kan ikke vare senere enn sluttdato.'
            });
        }
        selectedRange = { startDate, endDate };
        rangeMeta = {
            period,
            startDate,
            endDate,
            shortLabel: `${startDate} - ${endDate}`,
            metricSuffix: 'i valgt periode'
        };
    } else {
        const preset = ANALYTICS_DATE_RANGE_PRESETS[period] || ANALYTICS_DATE_RANGE_PRESETS['7d'];
        selectedRange = { startDate: preset.startDate, endDate: preset.endDate };
        rangeMeta = {
            period,
            startDate: preset.startDate,
            endDate: preset.endDate,
            shortLabel: preset.shortLabel,
            metricSuffix: preset.metricSuffix
        };
    }

    if (!analyticsClient || !propertyId) {
        return res.json({
            status: 'unconfigured',
            message: 'Google Analytics er ikke konfigurert ennå.',
            data: {
                active7DayUsers: '—',
                activeUsersInRange: '—',
                screenPageViews: '—',
                activeUsers: '—',
                topPages: [],
                trafficSources: []
            },
            range: rangeMeta
        });
    }

    try {
        const dateRanges = [selectedRange];

        // Run all GA4 reports in parallel for faster response
        const [[summaryResponse], [pagesResponse], [sourcesResponse]] = await Promise.all([
            analyticsClient.runReport({
                property: `properties/${propertyId}`,
                dateRanges,
                metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
            }),
            analyticsClient.runReport({
                property: `properties/${propertyId}`,
                dateRanges,
                dimensions: [{ name: 'pageTitle' }],
                metrics: [{ name: 'screenPageViews' }],
                limit: 8,
                orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }]
            }),
            analyticsClient.runReport({
                property: `properties/${propertyId}`,
                dateRanges,
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
                activeUsersInRange: summaryMetrics[0]?.value || '0',
                screenPageViews: summaryMetrics[1]?.value || '0',
                activeUsers: activeUsersNow,
                topPages,
                trafficSources
            },
            range: rangeMeta
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
        const posts = decorateBlogPostsWithResolvedLinks(await readSiteDataWithFallback('posts', readBlogPosts));
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error reading posts');
    }
});

// API: Save Blog Posts
app.post('/api/posts', async (req, res) => {
    const newPosts = decorateBlogPostsWithResolvedLinks(req.body);

    try {
        const result = await persistSiteData('posts', newPosts, writeBlogPosts);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error saving posts', details: error.message });
    }
});

app.get('/api/comments', async (req, res) => {
    const requestedPostId = Number(req.query.postId);

    try {
        const commentsData = normalizeCommentsData(await readSiteDataWithFallback('comments', readBlogComments));

        if (Number.isFinite(requestedPostId) && requestedPostId > 0) {
            return res.json(commentsData[String(requestedPostId)] || []);
        }

        return res.json(commentsData);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error reading comments' });
    }
});

app.get('/api/comments/settings', async (req, res) => {
    try {
        const seoConfig = normalizeSeoData(await readSiteDataWithFallback('seo', readSeoData));
        return res.json({
            blogCommentsEnabled: seoConfig.global.blogCommentsEnabled !== false
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error reading comment settings' });
    }
});

app.post('/api/comments', async (req, res) => {
    const postId = Number(req.body?.postId);
    const name = String(req.body?.name || '').replace(/\s+/g, ' ').trim();
    const message = String(req.body?.message || '').trim();

    if (!Number.isFinite(postId) || postId <= 0) {
        return res.status(400).json({ error: 'Ugyldig innlegg.' });
    }

    if (!name || name.length < 2) {
        return res.status(400).json({ error: 'Navn må være minst 2 tegn.' });
    }

    if (!message || message.length < 3) {
        return res.status(400).json({ error: 'Kommentar må være minst 3 tegn.' });
    }

    if (name.length > 80 || message.length > 2000) {
        return res.status(400).json({ error: 'Kommentaren er for lang.' });
    }

    try {
        const seoConfig = normalizeSeoData(await readSiteDataWithFallback('seo', readSeoData));
        if (seoConfig.global.blogCommentsEnabled === false) {
            return res.status(403).json({ error: 'Kommentarer er deaktivert globalt.' });
        }

        const posts = await readSiteDataWithFallback('posts', readBlogPosts);
        const post = Array.isArray(posts)
            ? posts.find((item) => Number(item?.id) === postId)
            : null;

        if (!post) {
            return res.status(404).json({ error: 'Innlegget finnes ikke.' });
        }

        if (post.allowComments === false) {
            return res.status(403).json({ error: 'Kommentarer er deaktivert for dette innlegget.' });
        }

        const commentsData = normalizeCommentsData(await readSiteDataWithFallback('comments', readBlogComments));
        const postKey = String(postId);
        const createdAt = new Date().toISOString();
        const comment = normalizeCommentEntry({
            id: `c_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
            postId,
            name,
            message,
            createdAt
        }, postId);

        if (!comment) {
            return res.status(400).json({ error: 'Kunne ikke opprette kommentar.' });
        }

        if (!Array.isArray(commentsData[postKey])) {
            commentsData[postKey] = [];
        }

        commentsData[postKey].push(comment);
        commentsData[postKey] = commentsData[postKey].slice(-500);

        const result = await persistSiteData('comments', commentsData, writeBlogComments);
        return res.status(201).json({
            success: true,
            comment,
            comments: commentsData[postKey],
            ...result
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error saving comment', details: error.message });
    }
});

// --- SEO FEATURES ---

// API: Get SEO Data
app.get('/api/seo', async (req, res) => {
    try {
        const seoConfig = normalizeSeoData(await readSiteDataWithFallback('seo', readSeoData));
        res.json(seoConfig);
    } catch (error) {
        console.error(error);
        res.json(normalizeSeoData({}));
    }
});

// API: Save SEO Data
app.post('/api/seo', async (req, res) => {
    const seoData = normalizeSeoData(req.body);

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
        const seoConfig = normalizeSeoData(await readSiteDataWithFallback('seo', readSeoData));
        const posts = await readSiteDataWithFallback('posts', readBlogPosts);
        const baseUrl = 'https://tk-design.no';

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        for (const page of Object.keys((seoConfig && seoConfig.pages) || {})) {
            const normalizedPage = String(page || '').replace(/^\/+/, '');
            const cleanPage = normalizedPage === 'index.html'
                ? ''
                : normalizedPage.replace(/\.html$/i, '');
            xml += `
    <url>
        <loc>${baseUrl}${cleanPage ? `/${cleanPage}` : ''}</loc>
        <changefreq>weekly</changefreq>
        <priority>${cleanPage === '' ? '1.0' : '0.8'}</priority>
    </url>`;
        }

        (posts || []).forEach((post) => {
            const postPath = normalizeStoredBlogPostLink(post.link, post.id, getBlogPostTitleForUrl(post));
            xml += `
    <url>
        <loc>${baseUrl}${postPath}</loc>
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

async function renderPageWithSeo(req, res, reqFile, matchedBlogPost = null) {
    let lang = 'no';
    const cookies = req.headers.cookie || '';
    const langMatch = cookies.match(/site_lang=(en|no)/);
    if (langMatch) lang = langMatch[1];

    let seoData = { global: {}, pages: {} };
    try {
        seoData = normalizeSeoData(await readSiteDataWithFallback('seo', readSeoData));
    } catch (e) { }

    const globalSeo = seoData.global || {};
    let title = '';
    let description = '';
    let keywords = '';
    let ogUrl = '';
    let ogImage = '';
    let ogType = 'website';

    const siteBaseUrl = getSiteBaseUrl(req);
    try {
        const requestUrl = String(req.originalUrl || req.url || req.path || '/').trim();
        ogUrl = siteBaseUrl ? new URL(requestUrl || '/', siteBaseUrl).toString() : '';
    } catch (error) {
        ogUrl = '';
    }

    // Specialized Logic for Blog Details
    if (reqFile === 'blog-details.html') {
        try {
            const posts = matchedBlogPost ? [] : await readSiteDataWithFallback('posts', readBlogPosts);
            const post = matchedBlogPost || posts.find(p => p.id == req.query.id);
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
                ogType = 'article';

                const resolvedPostUrl = resolveAbsolutePostUrl(post.link, req, post.id, getBlogPostTitleForUrl(post));
                if (resolvedPostUrl) {
                    ogUrl = resolvedPostUrl;
                }

                const socialImage = resolveSocialImage(post, req);
                if (socialImage.absolute) {
                    ogImage = socialImage.absolute;
                }
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
    if (!ogImage) {
        const configuredLogo = String(globalSeo.logoImage || '').trim();
        ogImage = resolveAbsoluteAssetUrl(configuredLogo || 'img/logo/d.png', req);
    }

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
            .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(finalTitle)}</title>`);

        injectedHtml = upsertHeadMetaTag(injectedHtml, 'name', 'description', description);
        injectedHtml = upsertHeadMetaTag(injectedHtml, 'name', 'keywords', keywords);
        injectedHtml = upsertHeadMetaTag(injectedHtml, 'property', 'og:title', finalTitle);
        injectedHtml = upsertHeadMetaTag(injectedHtml, 'property', 'og:description', description);
        injectedHtml = upsertHeadMetaTag(injectedHtml, 'property', 'og:type', ogType);
        injectedHtml = upsertHeadMetaTag(injectedHtml, 'name', 'twitter:title', finalTitle);
        injectedHtml = upsertHeadMetaTag(injectedHtml, 'name', 'twitter:description', description);
        injectedHtml = upsertHeadMetaTag(injectedHtml, 'name', 'twitter:card', ogImage ? 'summary_large_image' : 'summary');
        if (ogUrl) {
            injectedHtml = upsertHeadMetaTag(injectedHtml, 'property', 'og:url', ogUrl);
        }
        if (ogImage) {
            injectedHtml = upsertHeadMetaTag(injectedHtml, 'property', 'og:image', ogImage);
            injectedHtml = upsertHeadMetaTag(injectedHtml, 'name', 'twitter:image', ogImage);
        }

        if (!/custom-style\.css/i.test(injectedHtml)) {
            const customStyleLink = `<link rel="stylesheet" href="${getCustomStyleHref()}">`;
            injectedHtml = injectedHtml.replace('</head>', `${customStyleLink}\n</head>`);
        }

        const brandingConfig = {
            logoText: String(globalSeo.logoText || '').trim(),
            logoImage: String(globalSeo.logoImage || '').trim()
        };

        if (
            (brandingConfig.logoText || brandingConfig.logoImage) &&
            !injectedHtml.includes('window.__TK_BRANDING__')
        ) {
            const brandingScript = `<script>window.__TK_BRANDING__ = ${serializeInlineJson(brandingConfig)};</script>`;
            injectedHtml = injectedHtml.replace('</head>', `${brandingScript}\n</head>`);
        }

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
}

// Server-Side Meta Injection + clean URL redirects
app.get('/blog/:postSlug', async (req, res) => {
    try {
        const posts = await readSiteDataWithFallback('posts', readBlogPosts);
        const matchedPost = findBlogPostByRouteSegment(posts, req.params.postSlug);
        if (!matchedPost) {
            return res.status(404).send('Page not found');
        }

        return renderPageWithSeo(req, res, 'blog-details.html', matchedPost);
    } catch (error) {
        console.error('Error serving pretty blog URL:', error);
        return res.status(500).send('Page not found');
    }
});

app.get([...Object.keys(PAGE_ROUTE_MAP), ...Object.keys(LEGACY_REDIRECT_MAP)], async (req, res) => {
    const redirectTarget = LEGACY_REDIRECT_MAP[req.path];
    if (redirectTarget) {
        const qs = Object.keys(req.query).length ? `?${new URLSearchParams(req.query).toString()}` : '';
        return res.redirect(301, `${redirectTarget}${qs}`);
    }

    const reqFile = PAGE_ROUTE_MAP[req.path];
    if (!reqFile) {
        return res.status(404).send('Page not found');
    }

    if (reqFile === 'blog-details.html' && req.query.id) {
        try {
            const posts = await readSiteDataWithFallback('posts', readBlogPosts);
            const matchedPost = posts.find((post) => Number(post.id) === Number(req.query.id));
            if (matchedPost) {
                return res.redirect(301, normalizeStoredBlogPostLink(
                    matchedPost.link,
                    matchedPost.id,
                    getBlogPostTitleForUrl(matchedPost)
                ));
            }
        } catch (error) {
            console.error('Error redirecting legacy blog URL:', error);
        }
    }

    return renderPageWithSeo(req, res, reqFile);
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
        const posts = decorateBlogPostsWithResolvedLinks(await readSiteDataWithFallback('posts', readBlogPosts));
        res.json(posts);
    } catch (error) {
        console.error('Error serving posts.json:', error);
        res.status(500).json([]);
    }
});

app.get('/data/seo.json', async (req, res) => {
    try {
        const seoConfig = normalizeSeoData(await readSiteDataWithFallback('seo', readSeoData));
        res.json(seoConfig);
    } catch (error) {
        console.error('Error serving seo.json:', error);
        res.status(500).json(normalizeSeoData({}));
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
const ADMIN_STORAGE_UPLOAD_LIMITS = {
    fileSize: 20 * 1024 * 1024
};

const aiAttachmentUpload = multer({
    storage: multer.memoryStorage(),
    limits: AI_ATTACHMENT_LIMITS
});
const adminStorageUpload = multer({
    storage: multer.memoryStorage(),
    limits: ADMIN_STORAGE_UPLOAD_LIMITS
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

const adminStorageUploadMiddleware = (req, res, next) => {
    adminStorageUpload.single('file')(req, res, (error) => {
        if (!error) {
            return next();
        }

        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File too large',
                details: `Max filstørrelse er ${Math.round(ADMIN_STORAGE_UPLOAD_LIMITS.fileSize / (1024 * 1024))} MB.`
            });
        }

        return res.status(400).json({
            error: 'Invalid upload request',
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

function sanitizeStoragePathSegment(segment = '') {
    return String(segment || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function normalizeAdminStorageFolder(folderName = 'media') {
    const normalized = String(folderName || '')
        .split('/')
        .map((segment) => sanitizeStoragePathSegment(segment))
        .filter(Boolean)
        .join('/');

    return normalized || 'media';
}

function buildAdminStorageObjectName(folderName = 'media', originalName = 'file') {
    const extension = path.extname(String(originalName || '').toLowerCase()).replace(/^\./, '');
    const baseName = path.basename(String(originalName || 'file'), extension ? `.${extension}` : '');
    const safeBaseName = sanitizeStoragePathSegment(baseName) || 'file';
    const safeExtension = sanitizeStoragePathSegment(extension);
    const suffix = safeExtension ? `${safeBaseName}.${safeExtension}` : safeBaseName;
    return `${normalizeAdminStorageFolder(folderName)}/${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${suffix}`;
}

function buildFirebaseStorageDownloadUrl(bucketName, objectName, token) {
    return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucketName)}/o/${encodeURIComponent(objectName)}?alt=media&token=${encodeURIComponent(token)}`;
}

async function uploadBufferToFirebaseStorage({ folder = 'media', originalName = 'file', mimeType = '', buffer }) {
    const resolvedMimeType = String(mimeType || '').trim() || inferMimeTypeFromFileName(originalName);
    const storageBucket = String(getFirebaseWebConfig().storageBucket || '').trim();

    if (!storageBucket) {
        throw new Error('Firebase Storage bucket mangler i konfigurasjonen.');
    }

    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
        throw new Error('Filen var tom.');
    }

    const objectName = buildAdminStorageObjectName(folder, originalName);
    const downloadToken = crypto.randomUUID();
    const metadata = {
        name: objectName,
        contentType: resolvedMimeType,
        cacheControl: 'public,max-age=31536000',
        metadata: {
            firebaseStorageDownloadTokens: downloadToken
        }
    };
    const boundary = `tk-design-upload-${crypto.randomUUID()}`;
    const body = Buffer.concat([
        Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`, 'utf8'),
        Buffer.from(`--${boundary}\r\nContent-Type: ${resolvedMimeType}\r\nContent-Transfer-Encoding: binary\r\n\r\n`, 'utf8'),
        buffer,
        Buffer.from(`\r\n--${boundary}--`, 'utf8')
    ]);

    const accessToken = await getFirebaseAccessToken('https://www.googleapis.com/auth/cloud-platform');
    const fetch = await getFetch();
    const response = await fetch(
        `https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(storageBucket)}/o?uploadType=multipart`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': `multipart/related; boundary=${boundary}`
            },
            body
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Firebase Storage upload failed: ${response.status} ${errorText}`);
    }

    const payload = await response.json();

    return {
        bucket: storageBucket,
        path: objectName,
        fullPath: payload?.name || objectName,
        publicUrl: buildFirebaseStorageDownloadUrl(storageBucket, payload?.name || objectName, downloadToken)
    };
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

app.post('/api/admin/storage/upload', adminStorageUploadMiddleware, async (req, res) => {
    try {
        if (!hasFirebaseServerCredentials()) {
            return res.status(503).json({
                error: 'Firebase server credentials missing',
                details: 'Set TK_FIREBASE_PROJECT_ID, TK_FIREBASE_CLIENT_EMAIL og TK_FIREBASE_PRIVATE_KEY i .env.'
            });
        }

        const file = req.file;
        if (!file || !Buffer.isBuffer(file.buffer) || file.buffer.length === 0) {
            return res.status(400).json({
                error: 'Ingen fil valgt'
            });
        }

        const mimeType = String(file.mimetype || inferMimeTypeFromFileName(file.originalname))
            .trim()
            .toLowerCase();
        if (!mimeType.startsWith('image/')) {
            return res.status(400).json({
                error: 'Ugyldig filtype',
                details: 'Kun bildefiler er tillatt i denne opplastingen.'
            });
        }

        const folder = normalizeAdminStorageFolder(req.body?.folder || 'media');
        const result = await uploadBufferToFirebaseStorage({
            folder,
            originalName: file.originalname || 'file',
            mimeType,
            buffer: file.buffer
        });

        return res.json(result);
    } catch (error) {
        console.error('Admin storage upload failed:', error);
        return res.status(500).json({
            error: 'Upload failed',
            details: error.message
        });
    }
});

function getSiteBaseUrl(req) {
    const configured = String(process.env.SITE_URL || '').trim().replace(/\/+$/, '');
    if (configured) {
        return configured;
    }

    const forwardedHost = String(req.get('x-forwarded-host') || '').split(',')[0].trim();
    const directHost = String(req.get('host') || '').trim();
    const host = forwardedHost || directHost;

    if (!host) {
        return '';
    }

    const forwardedProto = String(req.get('x-forwarded-proto') || '').split(',')[0].trim();
    const protocol = forwardedProto || req.protocol || 'https';
    return `${protocol}://${host}`;
}

function normalizeBlogSlugPart(value = '') {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
}

function getBlogPostTitleForUrl(post = {}) {
    return String(post.title || post.titleEn || '').trim();
}

function buildRelativePostUrl(postId, title = '') {
    const numericId = Number(postId);
    const fallbackSlug = Number.isFinite(numericId) && numericId > 0
        ? `innlegg-${numericId}`
        : 'innlegg';
    const slug = normalizeBlogSlugPart(title) || fallbackSlug;

    if (Number.isFinite(numericId) && numericId > 0) {
        return `/blog/${slug}-${numericId}`;
    }

    return `/blog/${slug}`;
}

function isLegacyBlogPostLink(linkValue = '') {
    return /(^|\/)blog-details(?:\.html)?(?:\?|$)/i.test(String(linkValue || '').trim());
}

function normalizeStoredBlogPostLink(linkValue, postId, postTitle = '') {
    const rawLink = String(linkValue || '').trim();
    if (!rawLink || isLegacyBlogPostLink(rawLink)) {
        return buildRelativePostUrl(postId, postTitle);
    }

    if (/^https?:\/\//i.test(rawLink)) {
        return rawLink;
    }

    return rawLink.startsWith('/') ? rawLink : `/${rawLink}`;
}

function decorateBlogPostWithResolvedLink(post = {}) {
    return {
        ...post,
        link: normalizeStoredBlogPostLink(post.link, post.id, getBlogPostTitleForUrl(post))
    };
}

function decorateBlogPostsWithResolvedLinks(posts = []) {
    return Array.isArray(posts) ? posts.map((post) => decorateBlogPostWithResolvedLink(post)) : posts;
}

function findBlogPostByRouteSegment(posts = [], routeSegment = '') {
    let decodedSegment = String(routeSegment || '').trim();
    try {
        decodedSegment = decodeURIComponent(decodedSegment);
    } catch (error) {
        decodedSegment = String(routeSegment || '').trim();
    }

    const idMatch = decodedSegment.match(/-(\d+)$/);
    if (idMatch) {
        const matchedById = posts.find((post) => Number(post.id) === Number(idMatch[1]));
        if (matchedById) {
            return matchedById;
        }
    }

    const normalizedSegment = normalizeBlogSlugPart(decodedSegment.replace(/-\d+$/, ''));
    if (!normalizedSegment) {
        return null;
    }

    return posts.find((post) => normalizeBlogSlugPart(getBlogPostTitleForUrl(post)) === normalizedSegment) || null;
}

function resolveAbsolutePostUrl(linkValue, req, fallbackPostId, fallbackTitle = '') {
    const siteBaseUrl = getSiteBaseUrl(req);
    const fallbackPath = normalizeStoredBlogPostLink(linkValue, fallbackPostId, fallbackTitle);
    const candidate = fallbackPath || '/blog';

    try {
        if (/^https?:\/\//i.test(candidate)) {
            return candidate;
        }
        if (!siteBaseUrl) {
            return candidate.startsWith('/') ? candidate : `/${candidate}`;
        }
        return new URL(candidate.startsWith('/') ? candidate : `/${candidate}`, siteBaseUrl).toString();
    } catch (error) {
        return siteBaseUrl ? `${siteBaseUrl}${fallbackPath}` : fallbackPath;
    }
}

function resolveAbsoluteAssetUrl(assetValue, req) {
    const rawAsset = String(assetValue || '').trim();
    if (!rawAsset) return '';

    if (/^https?:\/\//i.test(rawAsset)) {
        return rawAsset;
    }

    if (/^\/\//.test(rawAsset)) {
        return `https:${rawAsset}`;
    }

    const siteBaseUrl = getSiteBaseUrl(req);
    const normalizedAsset = rawAsset.startsWith('/') ? rawAsset : `/${rawAsset}`;
    if (!siteBaseUrl) {
        return normalizedAsset;
    }

    try {
        return new URL(normalizedAsset, siteBaseUrl).toString();
    } catch (error) {
        return '';
    }
}

function extractFirstImageSrcFromHtml(htmlValue = '') {
    const html = String(htmlValue || '');
    if (!html) return '';
    const quotedMatch = html.match(/<img[^>]+src\s*=\s*["']([^"']+)["']/i);
    if (quotedMatch?.[1]) {
        return String(quotedMatch[1]).trim();
    }
    const unquotedMatch = html.match(/<img[^>]+src\s*=\s*([^\s>]+)/i);
    return unquotedMatch?.[1] ? String(unquotedMatch[1]).trim() : '';
}

function resolveSocialImage(post = {}, req) {
    const featuredImageRaw = String(post.image || '').trim();
    const contentImageRaw = extractFirstImageSrcFromHtml(post.content);
    const selectedRaw = featuredImageRaw || contentImageRaw;
    const absolute = resolveAbsoluteAssetUrl(selectedRaw, req);

    return {
        featuredImageRaw,
        contentImageRaw,
        selectedRaw,
        absolute
    };
}

function normalizeHashtagToken(value = '') {
    return String(value || '')
        .trim()
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .replace(/\s+/g, '');
}

function buildPostHashtags(post = {}, maxTags = 6) {
    const sourceTags = Array.isArray(post.tags) ? post.tags : [];
    const sourceKeywords = String(post.seoKeywords || '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
    const sourceCategories = Array.isArray(post.categories)
        ? post.categories
        : [post.category];

    const merged = [...sourceCategories, ...sourceTags, ...sourceKeywords];
    const uniqueTags = [];
    const seen = new Set();

    merged.forEach((entry) => {
        const token = normalizeHashtagToken(entry);
        if (!token || seen.has(token)) return;
        seen.add(token);
        uniqueTags.push(`#${token}`);
    });

    return uniqueTags.slice(0, maxTags);
}

function truncateForSocial(text = '', limit = 220) {
    const normalized = String(text || '').replace(/\s+/g, ' ').trim();
    if (normalized.length <= limit) return normalized;
    return `${normalized.slice(0, Math.max(0, limit - 1)).trim()}…`;
}

function firstNonEmptyString(values = []) {
    for (const value of values) {
        const normalized = String(value || '').trim();
        if (normalized) {
            return normalized;
        }
    }
    return '';
}

function firstDefinedValue(values = []) {
    for (const value of values) {
        if (value === 0 || value === '0') return value;
        if (value === false) return value;
        if (value === null || value === undefined) continue;
        if (typeof value === 'string' && value.trim() === '') continue;
        return value;
    }
    return undefined;
}

function parseNonNegativeIntegerOrNull(value) {
    if (value === null || value === undefined) return null;
    if (typeof value === 'string' && value.trim() === '') return null;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function resolveSocialExcerpt(post = {}, language = 'no') {
    const isEnglish = String(language || '').toLowerCase() === 'en';
    const primaryHtml = isEnglish
        ? String(post.contentEn || '').trim()
        : String(post.content || '').trim();
    const fallbackHtml = isEnglish
        ? String(post.content || '').trim()
        : String(post.contentEn || '').trim();
    const contentExcerpt = firstNonEmptyString([
        stripHtmlToText(primaryHtml),
        stripHtmlToText(fallbackHtml)
    ]);

    if (isEnglish) {
        return firstNonEmptyString([
            post.excerptEn,
            post.excerpt,
            post.detailSummaryEn,
            post.detailSummary,
            contentExcerpt
        ]);
    }

    return firstNonEmptyString([
        post.excerpt,
        post.detailSummary,
        post.excerptEn,
        post.detailSummaryEn,
        contentExcerpt
    ]);
}

function resolveWebhookHost(webhookUrl = '') {
    try {
        return new URL(String(webhookUrl || '').trim()).host || '';
    } catch (error) {
        return '';
    }
}

function summarizeWebhookResponseBody(responseBody = '', limit = 180) {
    const normalized = String(responseBody || '').replace(/\s+/g, ' ').trim();
    if (!normalized) return '';
    if (normalized.length <= limit) return normalized;
    return `${normalized.slice(0, Math.max(0, limit - 1)).trim()}…`;
}

function parseWebhookResponsePayload(rawBody = '', contentType = '') {
    const body = String(rawBody || '').trim();
    if (!body) return null;
    const type = String(contentType || '').toLowerCase();
    const looksJson = type.includes('application/json') || /^[\[{]/.test(body);
    if (!looksJson) return null;
    try {
        return JSON.parse(body);
    } catch (error) {
        return null;
    }
}

function isWebhookPayloadExplicitFailure(payload = null) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return false;
    }

    const hasFalseFlag = ['ok', 'success', 'sent', 'published']
        .some((key) => key in payload && payload[key] === false);
    const hasErrorSignal = Boolean(
        payload.error
        || payload.details && /error|failed|invalid|unauthorized|forbidden|denied/i.test(String(payload.details))
        || payload.message && /error|failed|invalid|unauthorized|forbidden|denied/i.test(String(payload.message))
    );
    const hasErrorList = Array.isArray(payload.errors) && payload.errors.length > 0;

    return hasFalseFlag || hasErrorSignal || hasErrorList;
}

function extractSocialWebhookDeliveryMeta(payload = null) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return {
            externalPostId: '',
            externalMediaId: '',
            externalUrl: '',
            publishedAt: '',
            metricsPatch: {}
        };
    }

    const metricsSources = [
        payload.metrics,
        payload.insights,
        payload.analytics,
        payload.data?.metrics,
        payload.result?.metrics,
        payload.post?.metrics
    ];

    let metricsPatch = {};
    metricsSources.forEach((source) => {
        const nextPatch = extractSocialPlannerMetricsPatch(source);
        if (Object.keys(nextPatch).length > 0) {
            metricsPatch = { ...metricsPatch, ...nextPatch };
        }
    });

    if (Object.keys(metricsPatch).length === 0) {
        metricsPatch = extractSocialPlannerMetricsPatch({
            likes: firstDefinedValue([payload.likes, payload.like_count, payload.data?.likes]),
            comments: firstDefinedValue([payload.comments, payload.comment_count, payload.data?.comments]),
            shares: firstDefinedValue([payload.shares, payload.share_count, payload.data?.shares]),
            reach: firstDefinedValue([payload.reach, payload.impressions, payload.data?.reach, payload.data?.impressions]),
            clicks: firstDefinedValue([payload.clicks, payload.click_count, payload.data?.clicks])
        });
    }

    const externalPostId = normalizePlannerShortText(firstNonEmptyString([
        payload.externalPostId,
        payload.external_post_id,
        payload.postId,
        payload.post_id,
        payload.providerPostId,
        payload.provider_post_id,
        payload.post?.externalPostId,
        payload.post?.postId,
        payload.post?.id,
        payload.data?.postId,
        payload.data?.id,
        payload.result?.postId,
        payload.result?.id,
        payload.id,
        payload.urn
    ]), 240);

    const externalMediaId = normalizePlannerShortText(firstNonEmptyString([
        payload.externalMediaId,
        payload.external_media_id,
        payload.mediaId,
        payload.media_id,
        payload.creationId,
        payload.creation_id,
        payload.data?.mediaId,
        payload.data?.creationId,
        payload.result?.mediaId,
        payload.result?.creationId
    ]), 240);

    const externalUrl = normalizePlannerUrl(firstNonEmptyString([
        payload.externalUrl,
        payload.external_url,
        payload.permalink,
        payload.permalink_url,
        payload.postUrl,
        payload.post_url,
        payload.url,
        payload.data?.url,
        payload.data?.permalink,
        payload.result?.url
    ]));

    const publishedAtRaw = firstNonEmptyString([
        payload.publishedAt,
        payload.published_at,
        payload.timestamp,
        payload.post?.publishedAt,
        payload.data?.publishedAt,
        payload.result?.publishedAt
    ]);
    const publishedAt = publishedAtRaw
        ? normalizeIsoDateTime(publishedAtRaw, new Date().toISOString())
        : '';

    return {
        externalPostId,
        externalMediaId,
        externalUrl,
        publishedAt,
        metricsPatch
    };
}

async function postPayloadToSocialWebhook(payload = {}, options = {}) {
    const allowSimulatedWithoutConfig = parseBooleanFlag(options.allowSimulatedWithoutConfig, false);
    const allowSimulatedOnFailure = parseBooleanFlag(options.allowSimulatedOnFailure, false);
    const webhookUrl = String(process.env.SOCIAL_WEBHOOK_URL || '').trim();
    if (!webhookUrl) {
        if (allowSimulatedWithoutConfig) {
            return {
                sent: true,
                simulated: true,
                code: 'social_webhook_simulated',
                details: 'Publisert lokalt uten webhook (SOCIAL_WEBHOOK_URL mangler).',
                httpStatus: 200
            };
        }
        return {
            sent: false,
            code: 'social_webhook_not_configured',
            details: 'Set SOCIAL_WEBHOOK_URL to enable social auto-post.',
            httpStatus: 200
        };
    }

    const body = JSON.stringify(payload || {});
    const webhookSecret = String(process.env.SOCIAL_WEBHOOK_SECRET || '').trim();
    const requestedTimeout = Number.parseInt(process.env.SOCIAL_WEBHOOK_TIMEOUT_MS, 10);
    const timeoutMs = Number.isFinite(requestedTimeout)
        ? Math.max(1000, Math.min(requestedTimeout, 20000))
        : 8000;

    const headers = {
        'Content-Type': 'application/json',
        'User-Agent': String(options.userAgent || 'tk-design-social-autopost')
    };

    if (webhookSecret) {
        const signature = crypto
            .createHmac('sha256', webhookSecret)
            .update(body)
            .digest('hex');
        headers['X-TK-Signature'] = signature;
    }

    try {
        const fetch = await getFetch();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);
        let response;

        try {
            response = await fetch(webhookUrl, {
                method: 'POST',
                headers,
                body,
                signal: controller.signal
            });
        } finally {
            clearTimeout(timeout);
        }

        if (!response.ok) {
            const responseBody = await response.text().catch(() => '');
            const webhookHost = resolveWebhookHost(webhookUrl);
            const hostHint = webhookHost ? ` (${webhookHost})` : '';

            if (allowSimulatedOnFailure) {
                return {
                    sent: true,
                    simulated: true,
                    code: 'social_webhook_simulated',
                    details: `Publisert lokalt fordi webhook svarte med ${response.status}${hostHint}.`,
                    httpStatus: 200
                };
            }

            if (response.status === 404) {
                return {
                    sent: false,
                    error: 'Social webhook failed',
                    code: 'social_webhook_not_found',
                    details: `Webhook URL returned 404${hostHint}. The endpoint is likely deleted or inactive. Update SOCIAL_WEBHOOK_URL in server environment variables.`,
                    httpStatus: 502
                };
            }

            const providerMessage = summarizeWebhookResponseBody(responseBody);
            const providerHint = providerMessage ? ` Provider response: ${providerMessage}` : '';
            return {
                sent: false,
                error: 'Social webhook failed',
                code: 'social_webhook_http_error',
                details: `Webhook responded with ${response.status}${hostHint}.${providerHint}`,
                httpStatus: 502
            };
        }

        const responseBody = await response.text().catch(() => '');
        const responseContentType = response.headers?.get?.('content-type') || '';
        const parsedPayload = parseWebhookResponsePayload(responseBody, responseContentType);
        if (isWebhookPayloadExplicitFailure(parsedPayload)) {
            const providerMessage = summarizeWebhookResponseBody(
                parsedPayload?.details
                || parsedPayload?.message
                || parsedPayload?.error
                || responseBody
            );
            return {
                sent: false,
                error: 'Social webhook reported failure',
                code: String(parsedPayload?.code || 'social_webhook_rejected'),
                details: providerMessage || 'Webhook svarte med feil i responsen.',
                httpStatus: 502
            };
        }

        const acceptedHint = summarizeWebhookResponseBody(
            parsedPayload?.details
            || parsedPayload?.message
            || responseBody
        );
        const deliveryMeta = extractSocialWebhookDeliveryMeta(parsedPayload);
        return {
            sent: true,
            details: acceptedHint || 'Webhook aksepterte publisering.',
            httpStatus: 200,
            ...deliveryMeta
        };
    } catch (error) {
        if (error?.name === 'AbortError') {
            if (allowSimulatedOnFailure) {
                return {
                    sent: true,
                    simulated: true,
                    code: 'social_webhook_simulated',
                    details: 'Publisert lokalt fordi webhook fikk timeout.',
                    httpStatus: 200
                };
            }
            return {
                sent: false,
                error: 'Social webhook timed out',
                code: 'social_webhook_timeout',
                details: 'Webhook timed out while publishing.',
                httpStatus: 504
            };
        }

        if (allowSimulatedOnFailure) {
            return {
                sent: true,
                simulated: true,
                code: 'social_webhook_simulated',
                details: 'Publisert lokalt fordi webhook-kall feilet.',
                httpStatus: 200
            };
        }

        return {
            sent: false,
            error: 'Failed to trigger social auto-post',
            code: 'social_webhook_request_failed',
            details: String(error?.message || 'Unknown webhook error'),
            httpStatus: 500
        };
    }
}

async function getSocialPlannerState() {
    return normalizeSocialPlannerData(await readSiteDataWithFallback('socialPlanner', readSocialPlannerData));
}

async function saveSocialPlannerState(state) {
    return persistSiteData('socialPlanner', normalizeSocialPlannerData(state), writeSocialPlannerData);
}

function resolveSocialPlannerWorkspace(state, workspaceId = '') {
    const workspaces = Array.isArray(state?.workspaces) ? state.workspaces : [];
    const targetId = String(workspaceId || state?.settings?.activeWorkspaceId || 'default');
    return workspaces.find((workspace) => workspace.id === targetId) || workspaces[0] || { id: 'default', name: 'TK-design', timezone: 'Europe/Oslo' };
}

function normalizeSocialPlannerWorkspaceId(value, fallback = 'default') {
    const normalized = normalizePlannerShortText(value || fallback, 60)
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return normalized || fallback;
}

function resolveSocialPlannerWorkspaceId(state, requestedWorkspaceId = '') {
    const workspaces = Array.isArray(state?.workspaces) ? state.workspaces : [];
    if (workspaces.length === 0) {
        return 'default';
    }

    const targetId = String(requestedWorkspaceId || state?.settings?.activeWorkspaceId || workspaces[0].id || 'default');
    return workspaces.some((workspace) => workspace.id === targetId) ? targetId : workspaces[0].id;
}

function getSocialPlannerWorkspaceIds(state) {
    const workspaces = Array.isArray(state?.workspaces) ? state.workspaces : [];
    return new Set(workspaces.map((workspace) => workspace.id));
}

function getSocialPlannerAccountIds(state) {
    const accounts = Array.isArray(state?.socialAccounts) ? state.socialAccounts : [];
    return new Set(accounts.map((account) => account.id));
}

function withSocialPlannerMeta(state, workspaceId = '') {
    const activeWorkspaceId = resolveSocialPlannerWorkspaceId(state, workspaceId);
    const activeWorkspace = resolveSocialPlannerWorkspace(state, activeWorkspaceId);

    return {
        ...state,
        settings: {
            ...(state?.settings || {}),
            activeWorkspaceId
        },
        activeWorkspace,
        supports: {
            platforms: SOCIAL_PLATFORMS.slice(),
            statuses: Array.from(SOCIAL_ENTRY_STATUSES)
        }
    };
}

function resolveSocialPlannerPublishMediaUrl(entry, req, options = {}) {
    const safeReq = req || { get: () => '', protocol: 'https' };
    const explicitMedia = resolveAbsoluteAssetUrl(options?.mediaUrl || '', safeReq);
    if (explicitMedia) {
        return normalizePlannerUrl(explicitMedia);
    }

    const primaryMedia = resolveAbsoluteAssetUrl(entry?.mediaUrl || '', safeReq);
    if (primaryMedia) {
        return normalizePlannerUrl(primaryMedia);
    }

    const useDefaultFallback = parseBooleanFlag(options?.useDefaultFallback, false);
    if (!useDefaultFallback) {
        return '';
    }

    const fallbackFromOptions = String(options?.fallbackImageUrl || '').trim();
    const fallbackFromEnv = String(process.env.SOCIAL_PLANNER_DEFAULT_IMAGE_URL || '').trim();
    const fallbackCandidate = fallbackFromOptions || fallbackFromEnv;
    const fallbackMedia = resolveAbsoluteAssetUrl(fallbackCandidate, safeReq);
    return normalizePlannerUrl(fallbackMedia);
}

function resolveSocialPlannerMetricsSyncUrl(req) {
    const safeReq = req || { get: () => '', protocol: 'https' };
    const siteBase = getSiteBaseUrl(safeReq) || String(process.env.SITE_URL || '').trim();
    if (!siteBase) return '';
    return `${String(siteBase).replace(/\/+$/, '')}/api/social-planner/metrics/sync`;
}

function buildSocialPlannerEntryPayload(entry, account, workspace, req, options = {}) {
    const safeReq = req || { get: () => '', protocol: 'https' };
    const siteBase = getSiteBaseUrl(safeReq) || String(process.env.SITE_URL || '').trim();
    const platform = normalizePlannerPlatform(account?.platform || 'facebook');
    const caption = buildSocialPlannerCaption(entry, platform);
    const mediaUrl = resolveSocialPlannerPublishMediaUrl(entry, safeReq, options);
    const linkUrl = normalizePlannerUrl(entry?.linkUrl || '');

    return {
        event: 'social.planner.publish',
        sentAt: new Date().toISOString(),
        source: 'tk-design-social-planner',
        site: siteBase,
        platform,
        image_url: mediaUrl,
        imageUrl: mediaUrl,
        media_url: mediaUrl,
        mediaUrl: mediaUrl,
        workspace: {
            id: String(workspace?.id || 'default'),
            name: String(workspace?.name || 'Workspace')
        },
        account: {
            id: String(account?.id || ''),
            platform,
            displayName: String(account?.displayName || ''),
            externalAccountId: String(account?.externalAccountId || '')
        },
        post: {
            id: String(entry?.id || ''),
            title: String(entry?.title || ''),
            caption,
            hashtags: Array.isArray(entry?.hashtags) ? entry.hashtags : [],
            mediaUrl,
            media_url: mediaUrl,
            image: mediaUrl,
            imageUrl: mediaUrl,
            image_url: mediaUrl,
            url: linkUrl,
            linkUrl,
            scheduledFor: String(entry?.scheduledFor || ''),
            status: String(entry?.status || 'draft')
        },
        social: {
            hashtags: Array.isArray(entry?.hashtags) ? entry.hashtags : [],
            captions: {
                no: caption,
                en: caption
            }
        },
        sync: {
            metricsUrl: resolveSocialPlannerMetricsSyncUrl(safeReq),
            entryId: String(entry?.id || ''),
            accountId: String(account?.id || ''),
            platform,
            requiresToken: !!String(process.env.SOCIAL_METRICS_SYNC_TOKEN || '').trim()
        }
    };
}

function summarizeSocialPlannerDelivery(delivery = []) {
    const items = Array.isArray(delivery) ? delivery : [];
    if (items.length === 0) return '';

    const summary = items.map((row) => {
        const platform = normalizePlannerPlatform(row?.platform || 'custom');
        const details = String(row?.details || '').trim();
        if (details) {
            return `${platform}: ${details}`;
        }
        return `${platform}: ${row?.sent ? 'ok' : 'feil'}`;
    }).join(' | ');

    return summary.slice(0, 600);
}

async function publishSocialPlannerEntryById(entryId, req, options = {}) {
    const entryIdNormalized = String(entryId || '').trim();
    if (!entryIdNormalized) {
        return { ok: false, httpStatus: 400, error: 'Entry id is required.' };
    }

    const state = await getSocialPlannerState();
    const entries = Array.isArray(state.entries) ? state.entries : [];
    const entryIndex = entries.findIndex((row) => String(row.id) === entryIdNormalized);

    if (entryIndex < 0) {
        return { ok: false, httpStatus: 404, error: 'Entry not found.' };
    }

    const entry = entries[entryIndex];
    const workspace = resolveSocialPlannerWorkspace(state, entry.workspaceId);
    const accounts = Array.isArray(state.socialAccounts) ? state.socialAccounts : [];
    const targetAccounts = accounts.filter((account) => entry.targetAccountIds.includes(account.id));
    const publishLog = Array.isArray(entry.publishLog) ? entry.publishLog.slice(-50) : [];
    const allowLocalPublishFallback = parseBooleanFlag(
        process.env.SOCIAL_PLANNER_ALLOW_LOCAL_PUBLISH_FALLBACK,
        true
    );

    if (targetAccounts.length === 0) {
        if (allowLocalPublishFallback) {
            entry.status = 'published';
            entry.publishedAt = new Date().toISOString();
            entry.lastError = '';
            entry.updatedAt = new Date().toISOString();
            publishLog.push({
                at: new Date().toISOString(),
                accountId: '',
                platform: 'custom',
                status: 'published',
                details: 'Publisert lokalt uten koblet konto.'
            });
            entry.publishLog = publishLog.slice(-50);
            entries[entryIndex] = normalizeSocialPlannerEntry(
                entry,
                new Set(state.workspaces.map((w) => w.id)),
                new Set(accounts.map((a) => a.id))
            );
            await saveSocialPlannerState(state);
            return {
                ok: true,
                httpStatus: 200,
                entry: entries[entryIndex],
                details: 'Publisert lokalt uten koblet konto.',
                delivery: [{
                    accountId: '',
                    platform: 'custom',
                    sent: true,
                    code: 'local_publish_without_account',
                    details: 'Publisert lokalt uten koblet konto.'
                }]
            };
        }

        entry.status = 'failed';
        entry.lastError = 'Ingen aktive kontoer er valgt for publisering.';
        entry.updatedAt = new Date().toISOString();
        entries[entryIndex] = normalizeSocialPlannerEntry(entry, new Set(state.workspaces.map((w) => w.id)), new Set(accounts.map((a) => a.id)));
        await saveSocialPlannerState(state);
        return {
            ok: false,
            httpStatus: 400,
            error: entry.lastError,
            details: entry.lastError,
            entry: entries[entryIndex]
        };
    }

    const requiresImage = targetAccounts.some(
        (account) => normalizePlannerPlatform(account?.platform || '') === 'instagram'
    );
    const explicitMediaUrl = resolveSocialPlannerPublishMediaUrl(entry, req, { useDefaultFallback: false });
    const resolvedMediaUrl = explicitMediaUrl || resolveSocialPlannerPublishMediaUrl(entry, req, {
        ...options,
        useDefaultFallback: requiresImage
    });

    if (requiresImage && !resolvedMediaUrl) {
        const details = 'Instagram krever bilde. Legg til bilde i innlegget (Unsplash eller Last opp) før publisering.';
        entry.status = options.keepScheduledOnFail ? 'scheduled' : 'failed';
        entry.lastError = details;
        entry.updatedAt = new Date().toISOString();
        entries[entryIndex] = normalizeSocialPlannerEntry(
            entry,
            new Set(state.workspaces.map((w) => w.id)),
            new Set(accounts.map((a) => a.id))
        );
        await saveSocialPlannerState(state);
        return {
            ok: false,
            httpStatus: 400,
            error: details,
            details,
            entry: entries[entryIndex],
            delivery: []
        };
    }

    entry.status = 'publishing';
    entry.lastError = '';
    entry.updatedAt = new Date().toISOString();
    entries[entryIndex] = entry;
    await saveSocialPlannerState(state);

    let successCount = 0;
    let failedCount = 0;
    let latestError = '';
    const delivery = [];

    for (const account of targetAccounts) {
        const accountPlatform = normalizePlannerPlatform(account?.platform || '');
        const mediaUrlForAccount = explicitMediaUrl || (accountPlatform === 'instagram' ? resolvedMediaUrl : '');

        if (String(account.status || 'active').toLowerCase() !== 'active') {
            failedCount += 1;
            const details = `Konto "${account.displayName}" er ikke aktiv.`;
            latestError = details;
            publishLog.push({
                at: new Date().toISOString(),
                accountId: account.id,
                platform: accountPlatform,
                status: 'failed',
                details
            });
            delivery.push({
                accountId: account.id,
                platform: accountPlatform,
                sent: false,
                details
            });
            continue;
        }

        const payload = buildSocialPlannerEntryPayload(entry, account, workspace, req, {
            mediaUrl: mediaUrlForAccount
        });
        const webhookResult = await postPayloadToSocialWebhook(payload, {
            userAgent: 'tk-design-social-planner',
            allowSimulatedWithoutConfig: allowLocalPublishFallback,
            allowSimulatedOnFailure: allowLocalPublishFallback
        });

        if (webhookResult.sent) {
            successCount += 1;
            const successDetails = webhookResult.simulated
                ? (webhookResult.details || 'Publisert lokalt (simulert).')
                : (webhookResult.details || 'Publisert via webhook');
            publishLog.push({
                at: new Date().toISOString(),
                accountId: account.id,
                platform: accountPlatform,
                status: 'published',
                details: successDetails
            });

            upsertSocialPlannerEntryPublication(entry, {
                accountId: account.id,
                platform: accountPlatform,
                externalPostId: webhookResult.externalPostId,
                externalMediaId: webhookResult.externalMediaId,
                externalUrl: webhookResult.externalUrl,
                publishedAt: webhookResult.publishedAt || new Date().toISOString(),
                metricsPatch: webhookResult.metricsPatch || {}
            });
        } else {
            failedCount += 1;
            latestError = webhookResult.details || webhookResult.error || 'Publisering feilet.';
            publishLog.push({
                at: new Date().toISOString(),
                accountId: account.id,
                platform: accountPlatform,
                status: 'failed',
                details: latestError
            });
        }

        delivery.push({
            accountId: account.id,
            platform: accountPlatform,
            sent: !!webhookResult.sent,
            code: webhookResult.code || '',
            details: webhookResult.details || '',
            externalPostId: webhookResult.externalPostId || '',
            externalMediaId: webhookResult.externalMediaId || '',
            externalUrl: webhookResult.externalUrl || ''
        });
    }

    if (successCount > 0 && failedCount === 0) {
        entry.status = 'published';
        entry.publishedAt = new Date().toISOString();
        entry.lastError = '';
    } else if (successCount > 0 && failedCount > 0) {
        entry.status = 'partially_published';
        entry.publishedAt = entry.publishedAt || new Date().toISOString();
        entry.lastError = latestError || 'Delvis publiseringsfeil.';
    } else {
        entry.status = options.keepScheduledOnFail ? 'scheduled' : 'failed';
        entry.lastError = latestError || 'Publisering feilet.';
    }

    entry.updatedAt = new Date().toISOString();
    entry.publishLog = publishLog.slice(-50);
    entries[entryIndex] = normalizeSocialPlannerEntry(entry, new Set(state.workspaces.map((w) => w.id)), new Set(accounts.map((a) => a.id)));
    const saveResult = await saveSocialPlannerState(state);

    return {
        ok: successCount > 0,
        httpStatus: successCount > 0 ? 200 : 502,
        error: successCount > 0 ? '' : (latestError || 'Publisering feilet.'),
        details: summarizeSocialPlannerDelivery(delivery) || (successCount > 0 ? 'Publisering sendt.' : (latestError || 'Publisering feilet.')),
        entry: entries[entryIndex],
        delivery,
        saveResult
    };
}

let socialPlannerSchedulerInFlight = false;
let socialPlannerSchedulerInterval = null;

function resolveSocialPlannerSchedulerIntervalMs() {
    const configured = Number.parseInt(process.env.SOCIAL_PLANNER_SCHEDULER_INTERVAL_MS, 10);
    if (!Number.isFinite(configured)) {
        return 60_000;
    }

    return Math.max(15_000, Math.min(configured, 15 * 60_000));
}

function resolveSocialPlannerPublishingStaleMs() {
    const configured = Number.parseInt(process.env.SOCIAL_PLANNER_PUBLISHING_STALE_MS, 10);
    if (!Number.isFinite(configured)) {
        return 2 * 60_000;
    }

    return Math.max(30_000, Math.min(configured, 30 * 60_000));
}

function createSocialPlannerSchedulerRequestContext() {
    const siteUrl = String(process.env.SITE_URL || '').trim();
    let protocol = 'https';
    let host = '';

    try {
        const parsed = new URL(siteUrl);
        protocol = String(parsed.protocol || 'https:').replace(':', '') || 'https';
        host = parsed.host || '';
    } catch (error) {
        // Defaults are used when SITE_URL is not a valid URL.
    }

    return {
        protocol,
        get(headerName = '') {
            return String(headerName || '').toLowerCase() === 'host' ? host : '';
        }
    };
}

async function runSocialPlannerSchedulerTick(req, options = {}) {
    if (socialPlannerSchedulerInFlight) {
        return {
            ok: false,
            skipped: true,
            reason: 'scheduler_in_flight',
            dueEntries: 0,
            processed: 0,
            published: 0,
            failed: 0,
            errors: []
        };
    }

    socialPlannerSchedulerInFlight = true;
    let dueEntries = [];
    let processed = 0;
    let published = 0;
    let failed = 0;
    const errors = [];

    try {
        const state = await getSocialPlannerState();
        const now = Date.now();
        const maxEntriesRaw = Number.parseInt(options?.maxEntries, 10);
        const maxEntries = Number.isFinite(maxEntriesRaw)
            ? Math.max(1, Math.min(maxEntriesRaw, 50))
            : 10;
        const publishingStaleMs = resolveSocialPlannerPublishingStaleMs();

        dueEntries = (Array.isArray(state.entries) ? state.entries : [])
            .filter((entry) => {
                const status = String(entry?.status || '').trim().toLowerCase();
                if (status === 'scheduled') {
                    const scheduledAt = new Date(entry?.scheduledFor || '').getTime();
                    return Number.isFinite(scheduledAt) && scheduledAt <= now;
                }

                if (status === 'publishing') {
                    const updatedAt = new Date(entry?.updatedAt || entry?.createdAt || '').getTime();
                    return Number.isFinite(updatedAt) && (now - updatedAt) >= publishingStaleMs;
                }

                return false;
            })
            .sort((a, b) => {
                const aStatus = String(a?.status || '').trim().toLowerCase();
                const bStatus = String(b?.status || '').trim().toLowerCase();
                const aTime = aStatus === 'publishing'
                    ? new Date(a?.updatedAt || a?.createdAt || '').getTime()
                    : new Date(a?.scheduledFor || '').getTime();
                const bTime = bStatus === 'publishing'
                    ? new Date(b?.updatedAt || b?.createdAt || '').getTime()
                    : new Date(b?.scheduledFor || '').getTime();
                return aTime - bTime;
            })
            .slice(0, maxEntries);

        for (const entry of dueEntries) {
            try {
                const publishResult = await publishSocialPlannerEntryById(entry.id, req, { keepScheduledOnFail: false });
                processed += 1;
                if (publishResult.ok) {
                    published += 1;
                } else {
                    failed += 1;
                }
            } catch (error) {
                processed += 1;
                failed += 1;
                errors.push({
                    entryId: entry.id,
                    error: String(error?.message || error)
                });
                console.error('[Social Planner] Scheduler publish error:', error);
            }
        }

        return {
            ok: true,
            skipped: false,
            dueEntries: dueEntries.length,
            processed,
            published,
            failed,
            errors
        };
    } catch (error) {
        errors.push({
            error: String(error?.message || error)
        });
        console.error('[Social Planner] Scheduler tick failed:', error);
        return {
            ok: false,
            skipped: false,
            dueEntries: dueEntries.length,
            processed,
            published,
            failed,
            errors
        };
    } finally {
        socialPlannerSchedulerInFlight = false;
    }
}

function startSocialPlannerSchedulerLoop() {
    if (socialPlannerSchedulerInterval) {
        return {
            started: false,
            enabled: true,
            intervalMs: resolveSocialPlannerSchedulerIntervalMs()
        };
    }

    const schedulerEnabled = String(process.env.SOCIAL_PLANNER_SCHEDULER_ENABLED || 'true').trim().toLowerCase() !== 'false';
    if (!schedulerEnabled) {
        return {
            started: false,
            enabled: false,
            intervalMs: 0
        };
    }

    const intervalMs = resolveSocialPlannerSchedulerIntervalMs();
    const requestContext = createSocialPlannerSchedulerRequestContext();
    socialPlannerSchedulerInterval = setInterval(() => {
        runSocialPlannerSchedulerTick(requestContext, { maxEntries: 10 }).catch((error) => {
            console.error('[Social Planner] Scheduler interval failed:', error);
        });
    }, intervalMs);

    if (typeof socialPlannerSchedulerInterval.unref === 'function') {
        socialPlannerSchedulerInterval.unref();
    }

    runSocialPlannerSchedulerTick(requestContext, { maxEntries: 10 }).catch((error) => {
        console.error('[Social Planner] Scheduler warmup failed:', error);
    });

    return {
        started: true,
        enabled: true,
        intervalMs
    };
}

function parseBooleanFlag(value, fallback = false) {
    const normalized = String(value ?? '').trim().toLowerCase();
    if (!normalized) {
        return fallback;
    }
    if (['1', 'true', 'yes', 'on'].includes(normalized)) {
        return true;
    }
    if (['0', 'false', 'no', 'off'].includes(normalized)) {
        return false;
    }
    return fallback;
}

function safeCompareSecrets(provided = '', expected = '') {
    const left = Buffer.from(String(provided || ''));
    const right = Buffer.from(String(expected || ''));
    if (left.length !== right.length || left.length === 0) return false;
    return crypto.timingSafeEqual(left, right);
}

function isAuthorizedSocialPlannerMetricsSyncRequest(req) {
    const expectedToken = String(process.env.SOCIAL_METRICS_SYNC_TOKEN || '').trim();
    if (!expectedToken) {
        return { ok: true, secured: false };
    }

    const providedToken = firstNonEmptyString([
        req.get('x-social-sync-token'),
        req.get('x-metrics-sync-token'),
        req.query?.token,
        req.body?.token
    ]);

    return {
        ok: safeCompareSecrets(providedToken, expectedToken),
        secured: true
    };
}

function normalizeSocialPlannerMetricsSyncUpdate(rawUpdate = {}) {
    const source = (rawUpdate && typeof rawUpdate === 'object' && !Array.isArray(rawUpdate)) ? rawUpdate : {};

    const entryId = normalizePlannerShortText(firstNonEmptyString([
        source.entryId,
        source.entry_id,
        source.postId,
        source.post_id,
        source.post?.entryId,
        source.post?.id,
        source.data?.entryId,
        source.data?.postId
    ]), 120);

    const accountId = normalizePlannerShortText(firstNonEmptyString([
        source.accountId,
        source.account_id,
        source.account?.id,
        source.delivery?.accountId
    ]), 80);

    const platform = normalizePlannerPlatform(firstNonEmptyString([
        source.platform,
        source.account?.platform,
        source.delivery?.platform,
        source.social?.platform
    ]));

    const externalPostId = normalizePlannerShortText(firstNonEmptyString([
        source.externalPostId,
        source.external_post_id,
        source.providerPostId,
        source.provider_post_id,
        source.remotePostId,
        source.remote_post_id,
        source.postExternalId,
        source.post_external_id,
        source.post?.externalPostId,
        source.post?.providerPostId,
        source.data?.externalPostId
    ]), 240);

    const externalMediaId = normalizePlannerShortText(firstNonEmptyString([
        source.externalMediaId,
        source.external_media_id,
        source.mediaId,
        source.media_id,
        source.creationId,
        source.creation_id,
        source.data?.mediaId,
        source.data?.creationId
    ]), 240);

    const externalUrl = normalizePlannerUrl(firstNonEmptyString([
        source.externalUrl,
        source.external_url,
        source.postUrl,
        source.post_url,
        source.permalink,
        source.url
    ]));

    const publishedAtRaw = firstNonEmptyString([
        source.publishedAt,
        source.published_at,
        source.timestamp,
        source.post?.publishedAt
    ]);
    const nowIso = new Date().toISOString();
    const publishedAt = publishedAtRaw ? normalizeIsoDateTime(publishedAtRaw, nowIso) : '';

    const metricsPatch = extractSocialPlannerMetricsPatch({
        likes: firstDefinedValue([source.metrics?.likes, source.likes, source.data?.likes]),
        comments: firstDefinedValue([source.metrics?.comments, source.comments, source.data?.comments]),
        shares: firstDefinedValue([source.metrics?.shares, source.shares, source.data?.shares]),
        reach: firstDefinedValue([
            source.metrics?.reach,
            source.metrics?.impressions,
            source.reach,
            source.impressions,
            source.data?.reach,
            source.data?.impressions
        ]),
        clicks: firstDefinedValue([source.metrics?.clicks, source.clicks, source.data?.clicks])
    });

    return {
        entryId,
        accountId,
        platform,
        externalPostId,
        externalMediaId,
        externalUrl,
        publishedAt,
        metricsPatch,
        metricsUpdatedAt: nowIso
    };
}

function findSocialPlannerEntryIndexForMetricsSync(entries = [], update = {}) {
    const list = Array.isArray(entries) ? entries : [];
    const entryId = normalizePlannerShortText(update.entryId || '', 120);
    const accountId = normalizePlannerShortText(update.accountId || '', 80);
    const platform = normalizePlannerPlatform(update.platform || '');
    const externalPostId = normalizePlannerShortText(update.externalPostId || '', 240);

    if (entryId) {
        const byId = list.findIndex((entry) => String(entry?.id || '') === entryId);
        if (byId >= 0) return byId;
    }

    if (!externalPostId && !accountId) {
        return -1;
    }

    return list.findIndex((entry) => {
        const publications = normalizeSocialPlannerPublications(entry?.platformPublications || []);
        return publications.some((publication) => {
            if (accountId && publication.accountId !== accountId) return false;
            if (platform && publication.platform !== platform) return false;
            if (externalPostId && publication.externalPostId !== externalPostId) return false;
            return true;
        });
    });
}

function buildSocialPlannerWorkspaceScopedState(state, workspaceId = '') {
    const activeWorkspaceId = resolveSocialPlannerWorkspaceId(state, workspaceId);
    return {
        ...state,
        socialAccounts: (Array.isArray(state?.socialAccounts) ? state.socialAccounts : [])
            .filter((account) => account.workspaceId === activeWorkspaceId),
        templates: (Array.isArray(state?.templates) ? state.templates : [])
            .filter((template) => template.workspaceId === activeWorkspaceId),
        entries: (Array.isArray(state?.entries) ? state.entries : [])
            .filter((entry) => entry.workspaceId === activeWorkspaceId)
    };
}

const SOCIAL_PLANNER_ASSISTANT_ALLOWED_ACTIONS = new Set(['write', 'improve', 'variants', 'shorten', 'expand', 'hashtags']);
const SOCIAL_PLANNER_ASSISTANT_ALLOWED_TONES = new Set(['professional', 'friendly', 'inspirational', 'sales', 'playful', 'informative']);

function normalizeSocialPlannerAssistantAction(value = '') {
    const normalized = String(value || '').trim().toLowerCase();
    return SOCIAL_PLANNER_ASSISTANT_ALLOWED_ACTIONS.has(normalized) ? normalized : 'write';
}

function normalizeSocialPlannerAssistantTone(value = '') {
    const normalized = normalizePlannerShortText(value || 'professional', 40).toLowerCase();
    return SOCIAL_PLANNER_ASSISTANT_ALLOWED_TONES.has(normalized) ? normalized : 'professional';
}

function normalizeSocialPlannerAssistantPlatforms(value = []) {
    const source = Array.isArray(value) ? value : [];
    const platforms = [];
    const seen = new Set();

    source.forEach((entry) => {
        const platform = normalizePlannerPlatform(entry);
        if (seen.has(platform)) return;
        seen.add(platform);
        platforms.push(platform);
    });

    return platforms.length > 0 ? platforms : SOCIAL_PLATFORMS.slice();
}

function buildSocialPlannerAssistantPrompt(payload = {}) {
    const action = normalizeSocialPlannerAssistantAction(payload.action);
    const tone = normalizeSocialPlannerAssistantTone(payload.tone);
    const prompt = normalizePlannerText(payload.prompt || '', 1200);
    const masterText = normalizePlannerText(payload.masterText || '', 6000);
    const variants = normalizePlannerVariants(payload.variants || {});
    const linkUrl = normalizePlannerUrl(payload.linkUrl || '');
    const hashtags = normalizePlannerHashtags(payload.hashtags || []);
    const selectedPlatforms = normalizeSocialPlannerAssistantPlatforms(payload.selectedPlatforms);

    const actionDescriptions = {
        write: 'Skriv et nytt forslag til innleggstekst basert på instruks og kontekst.',
        improve: 'Forbedre eksisterende innleggstekst med tydelig hook, flyt og call-to-action.',
        variants: 'Lag plattformspesifikke varianter til hver valgt plattform.',
        shorten: 'Forkort teksten uten å miste hovedbudskapet.',
        expand: 'Utvid teksten med mer verdi og konkretisering.',
        hashtags: 'Foreslå relevante hashtags og eventuelt en bedre hook.'
    };

    const existingVariantSummary = selectedPlatforms
        .map((platform) => `${platform}: ${String(variants[platform] || '').trim() || '(tom)'}`)
        .join('\n');

    return [
        'Du er en senior SoMe-copywriter for norske bedrifter.',
        `Oppgave: ${actionDescriptions[action] || actionDescriptions.write}`,
        `Tone: ${tone}`,
        `Målplattformer: ${selectedPlatforms.join(', ')}`,
        'Språk: Norsk bokmål.',
        '',
        'Returner KUN gyldig JSON med nøyaktig denne strukturen (ingen markdown, ingen kodeblokker):',
        '{',
        '  "masterText": "string",',
        '  "variants": {',
        '    "facebook": "string",',
        '    "instagram": "string",',
        '    "linkedin": "string",',
        '    "x": "string",',
        '    "tiktok": "string"',
        '  },',
        '  "hashtags": ["#tag1", "#tag2"],',
        '  "notes": "kort forklaring av hva som ble forbedret"',
        '}',
        '',
        'Regler:',
        '- Ingen påfunn eller udokumenterte fakta.',
        '- Kort, konkret og handlingsorientert stil.',
        '- Ikke legg inn URL i masterText hvis lenke er oppgitt separat.',
        '- La felt være tomme hvis de ikke er relevante for oppgaven.',
        '- Hashtags skal være relevante og uten duplikater (maks 12).',
        '',
        `Instruks fra bruker: ${prompt || '(ingen ekstra instruks)'}`,
        `Eksisterende mastertekst: ${masterText || '(tom)'}`,
        `Eksisterende varianter:\n${existingVariantSummary || '(ingen)'}`,
        `Lenke: ${linkUrl || '(ingen)'}`,
        `Eksisterende hashtags: ${hashtags.join(' ') || '(ingen)'}`
    ].join('\n');
}

function normalizeSocialPlannerAssistantSuggestion(payload = {}, fallbackText = '') {
    const source = (payload && typeof payload === 'object' && !Array.isArray(payload)) ? payload : {};
    const normalizedVariants = normalizePlannerVariants({});

    const assignVariant = (platformValue = '', textValue = '') => {
        const platform = normalizePlannerPlatform(platformValue);
        const normalizedText = normalizePlannerText(textValue || '', 3000);
        if (!normalizedText) return;
        normalizedVariants[platform] = normalizedText;
    };

    const variantObject = (source.variants && typeof source.variants === 'object' && !Array.isArray(source.variants))
        ? source.variants
        : {};
    Object.entries(variantObject).forEach(([platform, value]) => {
        assignVariant(platform, value);
    });

    const platformVariantsObject = (source.platformVariants && typeof source.platformVariants === 'object' && !Array.isArray(source.platformVariants))
        ? source.platformVariants
        : {};
    Object.entries(platformVariantsObject).forEach(([platform, value]) => {
        assignVariant(platform, value);
    });

    if (Array.isArray(source.variants)) {
        source.variants.forEach((entry) => {
            if (!entry || typeof entry !== 'object') return;
            assignVariant(entry.platform || entry.channel || entry.name, entry.text || entry.caption || entry.value);
        });
    }

    SOCIAL_PLATFORMS.forEach((platform) => {
        if (source[platform]) {
            assignVariant(platform, source[platform]);
        }
    });

    const fallbackMasterText = normalizePlannerText(fallbackText || '', 6000);
    const masterText = normalizePlannerText(
        source.masterText || source.text || source.caption || source.post || fallbackMasterText,
        6000
    );
    const hashtags = normalizePlannerHashtags(source.hashtags || source.tags || source.keywords || []);
    const notes = normalizePlannerText(source.notes || source.explanation || source.summary || '', 400);

    return {
        masterText,
        variants: normalizedVariants,
        hashtags,
        notes
    };
}

app.post('/api/social-planner/assistant', async (req, res) => {
    try {
        const action = normalizeSocialPlannerAssistantAction(req.body?.action);
        const tone = normalizeSocialPlannerAssistantTone(req.body?.tone);
        const prompt = normalizePlannerText(req.body?.prompt || '', 1200);
        const masterText = normalizePlannerText(req.body?.masterText || '', 6000);
        const variants = normalizePlannerVariants(req.body?.variants || {});
        const linkUrl = normalizePlannerUrl(req.body?.linkUrl || '');
        const hashtags = normalizePlannerHashtags(req.body?.hashtags || []);
        const selectedPlatforms = normalizeSocialPlannerAssistantPlatforms(req.body?.selectedPlatforms);
        const hasVariantContext = Object.values(variants).some((value) => String(value || '').trim());

        if (!prompt && !masterText && !hasVariantContext && !linkUrl && hashtags.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Skriv en instruks eller legg inn litt eksisterende tekst først.'
            });
        }

        const aiResult = await runGeminiGenerateContent([{
            text: buildSocialPlannerAssistantPrompt({
                action,
                tone,
                prompt,
                masterText,
                variants,
                linkUrl,
                hashtags,
                selectedPlatforms
            })
        }]);

        const parsed = parseGeminiJsonPayload(aiResult.text);
        const suggestion = normalizeSocialPlannerAssistantSuggestion(parsed, aiResult.text);

        if (action === 'hashtags' && suggestion.hashtags.length === 0) {
            const hashtagFromText = normalizePlannerHashtags(
                String(suggestion.masterText || '').match(/#[a-z0-9_]+/gi) || []
            );
            suggestion.hashtags = hashtagFromText;
        }

        return res.json({
            success: true,
            suggestion,
            model: aiResult.model
        });
    } catch (error) {
        console.error('[Social Planner] Assistant request failed:', error);
        const errorCode = String(error?.code || '');
        const errorMessage = String(error?.message || '');
        const apiKeyInvalid = /API_KEY_INVALID|API key not valid/i.test(errorMessage);
        const refererBlocked = /API_KEY_HTTP_REFERRER_BLOCKED|Requests from referer <empty> are blocked/i.test(errorMessage);

        if (errorCode === 'gemini_api_key_missing') {
            return res.status(500).json({
                success: false,
                error: 'Gemini API key is missing',
                code: 'gemini_api_key_missing',
                details: 'Set GEMINI_API_KEY in server environment variables.'
            });
        }

        if (errorCode === 'gemini_model_unavailable') {
            return res.status(500).json({
                success: false,
                error: 'No supported Gemini model available',
                code: 'gemini_model_unavailable',
                details: errorMessage || 'Server could not find a Gemini model that supports generateContent.'
            });
        }

        if (apiKeyInvalid) {
            return res.status(500).json({
                success: false,
                error: 'Gemini API key is invalid',
                code: 'gemini_api_key_invalid',
                details: 'Oppdater GEMINI_API_KEY i server-miljøet. Nåværende nøkkel avvises av Google.'
            });
        }

        if (refererBlocked) {
            return res.status(500).json({
                success: false,
                error: 'Gemini key blocked by HTTP referrer restrictions',
                code: 'gemini_api_key_http_referrer_blocked',
                details: 'Gemini-kallet går fra server (uten referer). Bruk en servernøkkel uten HTTP-referrer-restriksjon, men med API-restriksjon til Generative Language API.'
            });
        }

        return res.status(500).json({
            success: false,
            error: 'AI-assistenten feilet.',
            details: errorMessage || 'Unknown Gemini error'
        });
    }
});

app.get('/api/social-planner', async (req, res) => {
    try {
        const state = await getSocialPlannerState();
        const requestedWorkspaceId = String(req.query.workspaceId || '').trim();
        const scope = String(req.query.scope || 'all').trim().toLowerCase();
        const shouldRunScheduler = parseBooleanFlag(req.query.runScheduler, false);

        let scheduler = null;
        if (shouldRunScheduler) {
            scheduler = await runSocialPlannerSchedulerTick(req, {
                maxEntries: req.query.maxEntries
            });
        }

        const workspaceId = resolveSocialPlannerWorkspaceId(state, requestedWorkspaceId);
        const responseState = scope === 'workspace'
            ? buildSocialPlannerWorkspaceScopedState(state, workspaceId)
            : state;

        res.json({
            success: true,
            state: withSocialPlannerMeta(responseState, workspaceId),
            scheduler
        });
    } catch (error) {
        console.error('[Social Planner] Failed to read state:', error);
        res.status(500).json({
            success: false,
            error: 'Kunne ikke hente social planner data.',
            details: error.message
        });
    }
});

app.put('/api/social-planner', async (req, res) => {
    const incoming = req.body;
    if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
        return res.status(400).json({
            success: false,
            error: 'Ugyldig payload.'
        });
    }

    try {
        const currentState = await getSocialPlannerState();
        const merged = normalizeSocialPlannerData({
            ...currentState,
            ...incoming,
            settings: {
                ...(currentState.settings || {}),
                ...(incoming.settings || {})
            }
        });
        const saveResult = await saveSocialPlannerState(merged);
        res.json({
            success: true,
            state: withSocialPlannerMeta(merged, merged?.settings?.activeWorkspaceId || 'default'),
            ...saveResult
        });
    } catch (error) {
        console.error('[Social Planner] Failed to save state:', error);
        res.status(500).json({
            success: false,
            error: 'Kunne ikke lagre social planner data.',
            details: error.message
        });
    }
});

app.patch('/api/social-planner/settings', async (req, res) => {
    try {
        const state = await getSocialPlannerState();
        const activeWorkspaceId = resolveSocialPlannerWorkspaceId(state, req.body?.activeWorkspaceId);
        state.settings = {
            ...(state.settings || {}),
            activeWorkspaceId
        };
        const saveResult = await saveSocialPlannerState(state);
        res.json({
            success: true,
            settings: state.settings,
            ...saveResult
        });
    } catch (error) {
        console.error('[Social Planner] Failed to update settings:', error);
        res.status(500).json({
            success: false,
            error: 'Kunne ikke oppdatere innstillinger.',
            details: error.message
        });
    }
});

app.post('/api/social-planner/workspaces', async (req, res) => {
    try {
        const state = await getSocialPlannerState();
        state.settings = { ...(state.settings || {}) };
        state.workspaces = Array.isArray(state.workspaces) ? state.workspaces : [];
        const nowIso = new Date().toISOString();
        const workspaceIds = getSocialPlannerWorkspaceIds(state);
        const name = normalizePlannerShortText(req.body?.name || '', 100);
        const timezone = normalizePlannerShortText(req.body?.timezone || 'Europe/Oslo', 60) || 'Europe/Oslo';
        const requestedId = normalizeSocialPlannerWorkspaceId(req.body?.id, '');
        const fallbackId = createSocialPlannerId('ws');
        const baseId = requestedId || normalizeSocialPlannerWorkspaceId(name, fallbackId);
        let uniqueId = baseId;
        let suffix = 1;

        while (workspaceIds.has(uniqueId)) {
            const suffixPart = `-${suffix}`;
            const trimmedBaseId = baseId.slice(0, Math.max(1, 60 - suffixPart.length));
            uniqueId = `${trimmedBaseId}${suffixPart}`;
            suffix += 1;
        }

        const workspace = normalizeSocialPlannerWorkspace({
            id: uniqueId,
            name: name || `Workspace ${state.workspaces.length + 1}`,
            timezone,
            createdAt: nowIso,
            updatedAt: nowIso
        }, uniqueId);

        state.workspaces.push(workspace);
        if (!state.settings.activeWorkspaceId || parseBooleanFlag(req.body?.setActive, true)) {
            state.settings.activeWorkspaceId = workspace.id;
        }

        const saveResult = await saveSocialPlannerState(state);
        res.status(201).json({
            success: true,
            workspace,
            state: withSocialPlannerMeta(state, state.settings.activeWorkspaceId),
            ...saveResult
        });
    } catch (error) {
        console.error('[Social Planner] Failed to create workspace:', error);
        res.status(500).json({
            success: false,
            error: 'Kunne ikke opprette workspace.',
            details: error.message
        });
    }
});

app.patch('/api/social-planner/workspaces/:workspaceId', async (req, res) => {
    const workspaceId = String(req.params.workspaceId || '').trim();
    if (!workspaceId) {
        return res.status(400).json({
            success: false,
            error: 'Workspace id mangler.'
        });
    }

    try {
        const state = await getSocialPlannerState();
        state.settings = { ...(state.settings || {}) };
        state.workspaces = Array.isArray(state.workspaces) ? state.workspaces : [];
        const index = state.workspaces.findIndex((workspace) => workspace.id === workspaceId);

        if (index < 0) {
            return res.status(404).json({
                success: false,
                error: 'Workspace finnes ikke.'
            });
        }

        const current = state.workspaces[index];
        const nextWorkspace = normalizeSocialPlannerWorkspace({
            ...current,
            name: req.body?.name ?? current.name,
            timezone: req.body?.timezone ?? current.timezone,
            updatedAt: new Date().toISOString()
        }, current.id);

        state.workspaces[index] = nextWorkspace;
        if (parseBooleanFlag(req.body?.setActive, false)) {
            state.settings.activeWorkspaceId = nextWorkspace.id;
        }

        const saveResult = await saveSocialPlannerState(state);
        res.json({
            success: true,
            workspace: nextWorkspace,
            state: withSocialPlannerMeta(state, state.settings.activeWorkspaceId),
            ...saveResult
        });
    } catch (error) {
        console.error('[Social Planner] Failed to update workspace:', error);
        res.status(500).json({
            success: false,
            error: 'Kunne ikke oppdatere workspace.',
            details: error.message
        });
    }
});

app.delete('/api/social-planner/workspaces/:workspaceId', async (req, res) => {
    const workspaceId = String(req.params.workspaceId || '').trim();
    if (!workspaceId) {
        return res.status(400).json({
            success: false,
            error: 'Workspace id mangler.'
        });
    }

    try {
        const state = await getSocialPlannerState();
        state.settings = { ...(state.settings || {}) };
        state.workspaces = Array.isArray(state.workspaces) ? state.workspaces : [];
        state.socialAccounts = Array.isArray(state.socialAccounts) ? state.socialAccounts : [];
        state.templates = Array.isArray(state.templates) ? state.templates : [];
        state.entries = Array.isArray(state.entries) ? state.entries : [];

        const workspaceIndex = state.workspaces.findIndex((workspace) => workspace.id === workspaceId);
        if (workspaceIndex < 0) {
            return res.status(404).json({
                success: false,
                error: 'Workspace finnes ikke.'
            });
        }

        const [removedWorkspace] = state.workspaces.splice(workspaceIndex, 1);
        const removedAccountsCount = state.socialAccounts.filter((account) => account.workspaceId === workspaceId).length;
        const removedTemplatesCount = state.templates.filter((template) => template.workspaceId === workspaceId).length;
        const removedEntriesCount = state.entries.filter((entry) => entry.workspaceId === workspaceId).length;
        state.socialAccounts = state.socialAccounts.filter((account) => account.workspaceId !== workspaceId);
        state.templates = state.templates.filter((template) => template.workspaceId !== workspaceId);
        state.entries = state.entries.filter((entry) => entry.workspaceId !== workspaceId);

        if (state.workspaces.length === 0) {
            state.workspaces = createDefaultSocialPlannerData().workspaces;
        }

        if (!state.workspaces.some((workspace) => workspace.id === state.settings.activeWorkspaceId)) {
            state.settings.activeWorkspaceId = state.workspaces[0].id;
        }

        const saveResult = await saveSocialPlannerState(state);
        res.json({
            success: true,
            removedWorkspaceId: removedWorkspace.id,
            removedAccountsCount,
            removedTemplatesCount,
            removedEntriesCount,
            state: withSocialPlannerMeta(state, state.settings.activeWorkspaceId),
            ...saveResult
        });
    } catch (error) {
        console.error('[Social Planner] Failed to delete workspace:', error);
        res.status(500).json({
            success: false,
            error: 'Kunne ikke slette workspace.',
            details: error.message
        });
    }
});

app.post('/api/social-planner/accounts', async (req, res) => {
    try {
        const state = await getSocialPlannerState();
        state.socialAccounts = Array.isArray(state.socialAccounts) ? state.socialAccounts : [];
        const workspaceId = resolveSocialPlannerWorkspaceId(state, req.body?.workspaceId);
        const workspaceIds = getSocialPlannerWorkspaceIds(state);
        const nowIso = new Date().toISOString();
        let account = normalizeSocialPlannerAccount({
            id: req.body?.id || createSocialPlannerId('acct'),
            workspaceId,
            platform: req.body?.platform,
            displayName: req.body?.displayName,
            externalAccountId: req.body?.externalAccountId,
            status: req.body?.status || 'active',
            createdAt: nowIso,
            updatedAt: nowIso
        }, workspaceIds);

        if (!account.displayName) {
            return res.status(400).json({
                success: false,
                error: 'displayName er påkrevd.'
            });
        }

        const accountIds = getSocialPlannerAccountIds(state);
        if (accountIds.has(account.id)) {
            account = normalizeSocialPlannerAccount({
                ...account,
                id: createSocialPlannerId('acct')
            }, workspaceIds);
        }

        state.socialAccounts.push(account);
        const saveResult = await saveSocialPlannerState(state);
        res.status(201).json({
            success: true,
            account,
            ...saveResult
        });
    } catch (error) {
        console.error('[Social Planner] Failed to create account:', error);
        res.status(500).json({
            success: false,
            error: 'Kunne ikke opprette konto.',
            details: error.message
        });
    }
});

app.patch('/api/social-planner/accounts/:accountId', async (req, res) => {
    const accountId = String(req.params.accountId || '').trim();
    if (!accountId) {
        return res.status(400).json({
            success: false,
            error: 'Account id mangler.'
        });
    }

    try {
        const state = await getSocialPlannerState();
        state.socialAccounts = Array.isArray(state.socialAccounts) ? state.socialAccounts : [];
        const index = state.socialAccounts.findIndex((account) => account.id === accountId);
        if (index < 0) {
            return res.status(404).json({
                success: false,
                error: 'Konto finnes ikke.'
            });
        }

        const current = state.socialAccounts[index];
        const workspaceId = resolveSocialPlannerWorkspaceId(state, req.body?.workspaceId || current.workspaceId);
        const workspaceIds = getSocialPlannerWorkspaceIds(state);
        const nextAccount = normalizeSocialPlannerAccount({
            ...current,
            ...req.body,
            id: current.id,
            workspaceId,
            createdAt: current.createdAt,
            updatedAt: new Date().toISOString()
        }, workspaceIds);

        if (!nextAccount.displayName) {
            return res.status(400).json({
                success: false,
                error: 'displayName er påkrevd.'
            });
        }

        state.socialAccounts[index] = nextAccount;
        const saveResult = await saveSocialPlannerState(state);
        res.json({
            success: true,
            account: nextAccount,
            ...saveResult
        });
    } catch (error) {
        console.error('[Social Planner] Failed to update account:', error);
        res.status(500).json({
            success: false,
            error: 'Kunne ikke oppdatere konto.',
            details: error.message
        });
    }
});

app.delete('/api/social-planner/accounts/:accountId', async (req, res) => {
    const accountId = String(req.params.accountId || '').trim();
    if (!accountId) {
        return res.status(400).json({
            success: false,
            error: 'Account id mangler.'
        });
    }

    try {
        const state = await getSocialPlannerState();
        state.socialAccounts = Array.isArray(state.socialAccounts) ? state.socialAccounts : [];
        state.entries = Array.isArray(state.entries) ? state.entries : [];
        const index = state.socialAccounts.findIndex((account) => account.id === accountId);
        if (index < 0) {
            return res.status(404).json({
                success: false,
                error: 'Konto finnes ikke.'
            });
        }

        const [removedAccount] = state.socialAccounts.splice(index, 1);
        const workspaceIds = getSocialPlannerWorkspaceIds(state);
        const accountIds = getSocialPlannerAccountIds(state);
        let updatedEntries = 0;

        state.entries = state.entries.map((entry) => {
            if (!Array.isArray(entry.targetAccountIds) || !entry.targetAccountIds.includes(accountId)) {
                return entry;
            }

            updatedEntries += 1;
            return normalizeSocialPlannerEntry({
                ...entry,
                targetAccountIds: entry.targetAccountIds.filter((id) => id !== accountId),
                updatedAt: new Date().toISOString()
            }, workspaceIds, accountIds);
        });

        const saveResult = await saveSocialPlannerState(state);
        res.json({
            success: true,
            removedAccountId: removedAccount.id,
            updatedEntries,
            ...saveResult
        });
    } catch (error) {
        console.error('[Social Planner] Failed to delete account:', error);
        res.status(500).json({
            success: false,
            error: 'Kunne ikke slette konto.',
            details: error.message
        });
    }
});

app.post('/api/social-planner/templates', async (req, res) => {
    try {
        const state = await getSocialPlannerState();
        state.templates = Array.isArray(state.templates) ? state.templates : [];
        const workspaceId = resolveSocialPlannerWorkspaceId(state, req.body?.workspaceId);
        const workspaceIds = getSocialPlannerWorkspaceIds(state);
        const nowIso = new Date().toISOString();
        const template = normalizeSocialPlannerTemplate({
            id: req.body?.id || createSocialPlannerId('tpl'),
            workspaceId,
            category: req.body?.category,
            name: req.body?.name,
            body: req.body?.body,
            createdAt: nowIso,
            updatedAt: nowIso
        }, workspaceIds);

        state.templates.push(template);
        const saveResult = await saveSocialPlannerState(state);
        res.status(201).json({
            success: true,
            template,
            ...saveResult
        });
    } catch (error) {
        console.error('[Social Planner] Failed to create template:', error);
        res.status(500).json({
            success: false,
            error: 'Kunne ikke opprette mal.',
            details: error.message
        });
    }
});

app.patch('/api/social-planner/templates/:templateId', async (req, res) => {
    const templateId = String(req.params.templateId || '').trim();
    if (!templateId) {
        return res.status(400).json({
            success: false,
            error: 'Template id mangler.'
        });
    }

    try {
        const state = await getSocialPlannerState();
        state.templates = Array.isArray(state.templates) ? state.templates : [];
        const index = state.templates.findIndex((template) => template.id === templateId);
        if (index < 0) {
            return res.status(404).json({
                success: false,
                error: 'Mal finnes ikke.'
            });
        }

        const current = state.templates[index];
        const workspaceId = resolveSocialPlannerWorkspaceId(state, req.body?.workspaceId || current.workspaceId);
        const workspaceIds = getSocialPlannerWorkspaceIds(state);
        const nextTemplate = normalizeSocialPlannerTemplate({
            ...current,
            ...req.body,
            id: current.id,
            workspaceId,
            createdAt: current.createdAt,
            updatedAt: new Date().toISOString()
        }, workspaceIds);

        state.templates[index] = nextTemplate;
        const saveResult = await saveSocialPlannerState(state);
        res.json({
            success: true,
            template: nextTemplate,
            ...saveResult
        });
    } catch (error) {
        console.error('[Social Planner] Failed to update template:', error);
        res.status(500).json({
            success: false,
            error: 'Kunne ikke oppdatere mal.',
            details: error.message
        });
    }
});

app.delete('/api/social-planner/templates/:templateId', async (req, res) => {
    const templateId = String(req.params.templateId || '').trim();
    if (!templateId) {
        return res.status(400).json({
            success: false,
            error: 'Template id mangler.'
        });
    }

    try {
        const state = await getSocialPlannerState();
        state.templates = Array.isArray(state.templates) ? state.templates : [];
        const index = state.templates.findIndex((template) => template.id === templateId);
        if (index < 0) {
            return res.status(404).json({
                success: false,
                error: 'Mal finnes ikke.'
            });
        }

        const [removedTemplate] = state.templates.splice(index, 1);
        const saveResult = await saveSocialPlannerState(state);
        res.json({
            success: true,
            removedTemplateId: removedTemplate.id,
            ...saveResult
        });
    } catch (error) {
        console.error('[Social Planner] Failed to delete template:', error);
        res.status(500).json({
            success: false,
            error: 'Kunne ikke slette mal.',
            details: error.message
        });
    }
});

app.post('/api/social-planner/entries', async (req, res) => {
    try {
        const state = await getSocialPlannerState();
        state.entries = Array.isArray(state.entries) ? state.entries : [];
        const workspaceIds = getSocialPlannerWorkspaceIds(state);
        const accountIds = getSocialPlannerAccountIds(state);
        const workspaceId = resolveSocialPlannerWorkspaceId(state, req.body?.workspaceId);
        const nowIso = new Date().toISOString();
        const desiredStatus = normalizePlannerStatus(req.body?.status || (req.body?.scheduledFor ? 'scheduled' : 'draft'));
        const entry = normalizeSocialPlannerEntry({
            ...req.body,
            id: req.body?.id || createSocialPlannerId('entry'),
            workspaceId,
            status: desiredStatus,
            createdAt: nowIso,
            updatedAt: nowIso,
            publishedAt: desiredStatus === 'published' ? (req.body?.publishedAt || nowIso) : (req.body?.publishedAt || '')
        }, workspaceIds, accountIds);

        if (entry.status === 'scheduled' && !entry.scheduledFor) {
            return res.status(400).json({
                success: false,
                error: 'scheduledFor er påkrevd når status er scheduled.'
            });
        }

        state.entries.push(entry);
        const saveResult = await saveSocialPlannerState(state);
        const publishNow = parseBooleanFlag(req.body?.publishNow, false);

        if (publishNow) {
            const publishResult = await publishSocialPlannerEntryById(entry.id, req, { keepScheduledOnFail: false });
            return res.status(Number.isFinite(publishResult.httpStatus) ? publishResult.httpStatus : 500).json({
                success: !!publishResult.ok,
                entry: publishResult.entry || entry,
                delivery: publishResult.delivery || [],
                code: publishResult.ok ? 'published' : 'publish_failed',
                error: publishResult.error || '',
                details: publishResult.details || publishResult.error || '',
                ...saveResult
            });
        }

        res.status(201).json({
            success: true,
            entry,
            ...saveResult
        });
    } catch (error) {
        console.error('[Social Planner] Failed to create entry:', error);
        res.status(500).json({
            success: false,
            error: 'Kunne ikke opprette innlegg.',
            details: error.message
        });
    }
});

app.patch('/api/social-planner/entries/:entryId', async (req, res) => {
    const entryId = String(req.params.entryId || '').trim();
    if (!entryId) {
        return res.status(400).json({
            success: false,
            error: 'Entry id mangler.'
        });
    }

    try {
        const state = await getSocialPlannerState();
        state.entries = Array.isArray(state.entries) ? state.entries : [];
        const index = state.entries.findIndex((entry) => entry.id === entryId);
        if (index < 0) {
            return res.status(404).json({
                success: false,
                error: 'Innlegg finnes ikke.'
            });
        }

        const current = state.entries[index];
        const workspaceIds = getSocialPlannerWorkspaceIds(state);
        const accountIds = getSocialPlannerAccountIds(state);
        const workspaceId = resolveSocialPlannerWorkspaceId(state, req.body?.workspaceId || current.workspaceId);
        const desiredStatus = req.body?.status ? normalizePlannerStatus(req.body.status) : current.status;
        const nextEntry = normalizeSocialPlannerEntry({
            ...current,
            ...req.body,
            id: current.id,
            workspaceId,
            status: desiredStatus,
            createdAt: current.createdAt,
            updatedAt: new Date().toISOString(),
            publishedAt: desiredStatus === 'published'
                ? (req.body?.publishedAt || current.publishedAt || new Date().toISOString())
                : (req.body?.publishedAt ?? current.publishedAt)
        }, workspaceIds, accountIds);

        if (nextEntry.status === 'scheduled' && !nextEntry.scheduledFor) {
            return res.status(400).json({
                success: false,
                error: 'scheduledFor er påkrevd når status er scheduled.'
            });
        }

        state.entries[index] = nextEntry;
        const saveResult = await saveSocialPlannerState(state);
        const publishNow = parseBooleanFlag(req.body?.publishNow, false);

        if (publishNow) {
            const publishResult = await publishSocialPlannerEntryById(entryId, req, {
                keepScheduledOnFail: parseBooleanFlag(req.body?.keepScheduledOnFail, false)
            });
            return res.status(Number.isFinite(publishResult.httpStatus) ? publishResult.httpStatus : 500).json({
                success: !!publishResult.ok,
                entry: publishResult.entry || nextEntry,
                delivery: publishResult.delivery || [],
                code: publishResult.ok ? 'published' : 'publish_failed',
                error: publishResult.error || '',
                details: publishResult.details || publishResult.error || '',
                ...saveResult
            });
        }

        res.json({
            success: true,
            entry: nextEntry,
            ...saveResult
        });
    } catch (error) {
        console.error('[Social Planner] Failed to update entry:', error);
        res.status(500).json({
            success: false,
            error: 'Kunne ikke oppdatere innlegg.',
            details: error.message
        });
    }
});

app.delete('/api/social-planner/entries/:entryId', async (req, res) => {
    const entryId = String(req.params.entryId || '').trim();
    if (!entryId) {
        return res.status(400).json({
            success: false,
            error: 'Entry id mangler.'
        });
    }

    try {
        const state = await getSocialPlannerState();
        state.entries = Array.isArray(state.entries) ? state.entries : [];
        const index = state.entries.findIndex((entry) => entry.id === entryId);
        if (index < 0) {
            return res.status(404).json({
                success: false,
                error: 'Innlegg finnes ikke.'
            });
        }

        const [removedEntry] = state.entries.splice(index, 1);
        const saveResult = await saveSocialPlannerState(state);
        res.json({
            success: true,
            removedEntryId: removedEntry.id,
            ...saveResult
        });
    } catch (error) {
        console.error('[Social Planner] Failed to delete entry:', error);
        res.status(500).json({
            success: false,
            error: 'Kunne ikke slette innlegg.',
            details: error.message
        });
    }
});

app.post('/api/social-planner/entries/:entryId/publish', async (req, res) => {
    try {
        const publishResult = await publishSocialPlannerEntryById(req.params.entryId, req, {
            keepScheduledOnFail: parseBooleanFlag(req.body?.keepScheduledOnFail, false)
        });
        const statusCode = Number.isFinite(publishResult.httpStatus) ? publishResult.httpStatus : 500;
        res.status(statusCode).json({
            success: !!publishResult.ok,
            entry: publishResult.entry || null,
            delivery: publishResult.delivery || [],
            code: publishResult.ok ? 'published' : 'publish_failed',
            error: publishResult.error || '',
            details: publishResult.details || publishResult.error || ''
        });
    } catch (error) {
        console.error('[Social Planner] Failed to publish entry:', error);
        res.status(500).json({
            success: false,
            error: 'Kunne ikke publisere innlegg.',
            details: error.message
        });
    }
});

app.post('/api/social-planner/scheduler/run', async (req, res) => {
    try {
        const schedulerResult = await runSocialPlannerSchedulerTick(req, {
            maxEntries: req.body?.maxEntries ?? req.query.maxEntries
        });
        const success = schedulerResult.ok || schedulerResult.skipped;
        res.status(success ? 200 : 500).json({
            success,
            scheduler: schedulerResult
        });
    } catch (error) {
        console.error('[Social Planner] Scheduler run endpoint failed:', error);
        res.status(500).json({
            success: false,
            error: 'Kunne ikke kjøre scheduler.',
            details: error.message
        });
    }
});

app.get('/api/social-planner/analytics', async (req, res) => {
    try {
        const state = await getSocialPlannerState();
        const workspaceScope = String(req.query.scope || 'workspace').trim().toLowerCase();
        const workspaceId = resolveSocialPlannerWorkspaceId(state, req.query.workspaceId);
        const scopedEntries = workspaceScope === 'all'
            ? (Array.isArray(state.entries) ? state.entries : [])
            : (Array.isArray(state.entries) ? state.entries : []).filter((entry) => entry.workspaceId === workspaceId);
        const range = resolveSocialPlannerDateRange(req.query);
        const analytics = computeSocialPlannerAnalytics({
            ...state,
            entries: scopedEntries
        }, range);

        res.json({
            success: true,
            scope: workspaceScope === 'all' ? 'all' : 'workspace',
            workspaceId: workspaceScope === 'all' ? null : workspaceId,
            analytics
        });
    } catch (error) {
        console.error('[Social Planner] Failed to compute analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Kunne ikke hente analytics.',
            details: error.message
        });
    }
});

app.post('/api/social-planner/metrics/sync', async (req, res) => {
    try {
        const auth = isAuthorizedSocialPlannerMetricsSyncRequest(req);
        if (!auth.ok) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized metrics sync request.'
            });
        }

        const body = (req.body && typeof req.body === 'object' && !Array.isArray(req.body))
            ? req.body
            : {};
        const rawUpdates = Array.isArray(body.updates) ? body.updates : [body];
        const updates = rawUpdates
            .map((item) => normalizeSocialPlannerMetricsSyncUpdate(item))
            .filter((item) => item && typeof item === 'object');

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Ingen gyldige updates sendt inn.'
            });
        }

        const state = await getSocialPlannerState();
        state.entries = Array.isArray(state.entries) ? state.entries : [];
        const workspaceIds = getSocialPlannerWorkspaceIds(state);
        const accountIds = getSocialPlannerAccountIds(state);
        const updatedEntries = [];
        const notFound = [];
        const skipped = [];

        for (const update of updates) {
            const hasLookupValue = Boolean(update.entryId || update.externalPostId || update.accountId);
            if (!hasLookupValue) {
                skipped.push({
                    reason: 'missing_identifiers',
                    update
                });
                continue;
            }

            const targetIndex = findSocialPlannerEntryIndexForMetricsSync(state.entries, update);
            if (targetIndex < 0) {
                notFound.push({
                    entryId: update.entryId || '',
                    externalPostId: update.externalPostId || '',
                    accountId: update.accountId || '',
                    platform: update.platform || ''
                });
                continue;
            }

            const entry = state.entries[targetIndex];
            const hasMetricsPatch = Object.keys(update.metricsPatch || {}).length > 0;
            const hasPublicationData = Boolean(
                update.accountId
                || update.platform
                || update.externalPostId
                || update.externalMediaId
                || update.externalUrl
            );

            if (hasPublicationData) {
                upsertSocialPlannerEntryPublication(entry, update);
            } else if (hasMetricsPatch) {
                entry.metrics = mergeSocialPlannerMetrics(entry.metrics || {}, update.metricsPatch);
            }

            if (update.publishedAt && (!entry.publishedAt || entry.publishedAt < update.publishedAt)) {
                entry.publishedAt = update.publishedAt;
            }
            entry.updatedAt = new Date().toISOString();
            if (hasMetricsPatch) {
                entry.lastError = '';
            }

            state.entries[targetIndex] = normalizeSocialPlannerEntry(entry, workspaceIds, accountIds);
            updatedEntries.push({
                id: state.entries[targetIndex].id,
                title: state.entries[targetIndex].title,
                metrics: state.entries[targetIndex].metrics
            });
        }

        if (updatedEntries.length > 0) {
            await saveSocialPlannerState(state);
        }

        res.json({
            success: true,
            secured: auth.secured,
            processed: updates.length,
            updated: updatedEntries.length,
            updatedEntries,
            notFound,
            skipped
        });
    } catch (error) {
        console.error('[Social Planner] Metrics sync failed:', error);
        res.status(500).json({
            success: false,
            error: 'Kunne ikke synkronisere metrics.',
            details: error.message
        });
    }
});

function buildSocialAutopostPayload(post = {}, req) {
    const postId = Number(post.id);
    const postUrl = resolveAbsolutePostUrl(post.link, req, postId, getBlogPostTitleForUrl(post));
    const socialImage = resolveSocialImage(post, req);
    const titleNo = String(post.title || '').trim();
    const titleEn = String(post.titleEn || '').trim();
    const excerptNo = resolveSocialExcerpt(post, 'no');
    const excerptEn = resolveSocialExcerpt(post, 'en');
    const hashtags = buildPostHashtags(post);
    const shortUrl = postUrl || '/blog';

    const noCaption = [
        excerptNo ? truncateForSocial(excerptNo, 180) : '',
        shortUrl,
        hashtags.join(' ')
    ].filter(Boolean).join('\n\n');

    const enCaption = [
        excerptEn ? truncateForSocial(excerptEn, 180) : '',
        shortUrl,
        hashtags.join(' ')
    ].filter(Boolean).join('\n\n');

    return {
        event: 'blog.published',
        sentAt: new Date().toISOString(),
        source: 'tk-design-admin',
        site: getSiteBaseUrl(req),
        post: {
            id: Number.isFinite(postId) ? postId : null,
            title: titleNo,
            titleEn: titleEn || titleNo,
            excerpt: excerptNo,
            excerptEn: excerptEn || excerptNo,
            category: String(post.category || '').trim(),
            categories: Array.isArray(post.categories) ? post.categories : [],
            tags: Array.isArray(post.tags) ? post.tags : [],
            date: String(post.date || '').trim(),
            dateIso: String(post.dateIso || '').trim(),
            author: String(post.author || '').trim(),
            image: socialImage.absolute,
            imageRaw: socialImage.featuredImageRaw,
            imageFromContent: resolveAbsoluteAssetUrl(socialImage.contentImageRaw, req),
            url: shortUrl,
            link: String(post.link || '').trim()
        },
        social: {
            hashtags,
            captions: {
                no: noCaption,
                en: enCaption
            }
        }
    };
}

app.post('/api/social/autopost', async (req, res) => {
    try {
        const incomingPost = req.body?.post && typeof req.body.post === 'object'
            ? req.body.post
            : req.body;
        const title = String(incomingPost?.title || '').trim();
        if (!title) {
            return res.status(400).json({ error: 'Post title is required' });
        }

        const payload = buildSocialAutopostPayload(incomingPost, req);
        const webhookResult = await postPayloadToSocialWebhook(payload, {
            userAgent: 'tk-design-social-autopost'
        });

        if (!webhookResult.sent) {
            const statusCode = Number.isFinite(webhookResult.httpStatus) ? webhookResult.httpStatus : 500;
            return res.status(statusCode).json({
                sent: false,
                error: webhookResult.error || 'Social webhook failed',
                code: webhookResult.code || 'social_webhook_error',
                details: webhookResult.details || ''
            });
        }

        return res.status(200).json({ sent: true, code: 'ok' });
    } catch (error) {
        console.error('Social auto-post error:', error);
        return res.status(500).json({
            sent: false,
            error: 'Failed to trigger social auto-post',
            details: error.message
        });
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
        const config = await getCachedFirebaseWebAppConfig();
        res.type('application/javascript');
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.send(
            `window.__TK_FIREBASE_CONFIG__ = ${JSON.stringify(config, null, 4)};\nwindow.__TK_FIREBASE_CONFIG_ERROR__ = null;`
        );
    } catch (error) {
        const fallbackConfig = getFirebaseWebConfig();
        res.type('application/javascript');
        res.setHeader('Cache-Control', 'no-store');
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

// Admin clean URL + single source of truth from public/admin
const adminPublicDir = path.join(__dirname, 'public', 'admin');
app.get('/admin/index.html', (req, res) => res.redirect(301, '/admin/'));
app.get('/admin/', (req, res) => res.sendFile(path.join(adminPublicDir, 'index.html')));
app.get('/admin', (req, res) => res.redirect(301, '/admin/'));
app.use('/admin', express.static(adminPublicDir));
app.get('/public/admin', (req, res) => res.redirect(301, '/admin/'));
app.get('/public/admin/', (req, res) => res.redirect(301, '/admin/'));
app.get('/public/admin/index.html', (req, res) => res.redirect(301, '/admin/'));
app.get('/public/admin/login.html', (req, res) => res.redirect(301, '/admin/login.html'));

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

app.get('/llms.txt', (req, res) => {
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.sendFile(path.join(__dirname, 'llms.txt'));
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
        const schedulerStartup = startSocialPlannerSchedulerLoop();
        console.log(`CMS Server running at http://localhost:${PORT}`);
        console.log(`Admin Panel available at http://localhost:${PORT}/admin`);
        if (schedulerStartup.enabled) {
            if (schedulerStartup.started) {
                console.log(`[Social Planner] Scheduler aktiv: ${schedulerStartup.intervalMs} ms intervall.`);
            } else {
                console.log('[Social Planner] Scheduler var allerede aktiv.');
            }
        } else {
            console.log('[Social Planner] Scheduler er deaktivert via SOCIAL_PLANNER_SCHEDULER_ENABLED=false.');
        }
    });
}

module.exports = app;
module.exports.api = functions.https.onRequest(app);
