const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

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

// Storage for Image Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'img/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use original name (overwrite existing)
    }
});
const upload = multer({ storage: storage });

async function getFetch() {
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
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    const projectId = process.env.FIREBASE_PROJECT_ID || 'tk-design-f43f6';

    return {
        projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
        privateKey,
        databaseId: process.env.FIREBASE_DATABASE_ID || '(default)',
        collection: process.env.FIREBASE_CONTACT_COLLECTION || 'contactMessages'
    };
}

function getFirebaseWebConfig() {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'tk-design-f43f6';

    return {
        apiKey: process.env.FIREBASE_WEB_API_KEY || '',
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
        projectId,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
        appId: process.env.FIREBASE_APP_ID || ''
    };
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
        throw new Error('Firebase mangler FIREBASE_CLIENT_EMAIL eller FIREBASE_PRIVATE_KEY i .env');
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
    const { projectId, databaseId, collection } = getFirebaseConfig();
    if (!projectId) {
        throw new Error('Firebase mangler FIREBASE_PROJECT_ID i .env');
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
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
            <h2 style="margin-bottom: 16px;">Ny melding fra kontaktskjemaet</h2>
            <p><strong>Navn:</strong> ${escapeHtml(messagePayload.name)}</p>
            <p><strong>E-post:</strong> ${escapeHtml(messagePayload.email)}</p>
            <p><strong>Telefon:</strong> ${escapeHtml(messagePayload.phone || 'Ikke oppgitt')}</p>
            <p><strong>Firma:</strong> ${escapeHtml(messagePayload.company || 'Ikke oppgitt')}</p>
            <p><strong>Emne:</strong> ${escapeHtml(messagePayload.subject || 'Ikke oppgitt')}</p>
            <p><strong>Kilde:</strong> ${escapeHtml(messagePayload.source_page || 'contact.html')}</p>
            <div style="margin-top: 20px; padding: 16px; border-radius: 12px; background: #f9fafb; border: 1px solid #e5e7eb;">
                <strong>Melding:</strong>
                <p style="white-space: pre-wrap; margin-top: 10px;">${escapeHtml(messagePayload.message)}</p>
            </div>
        </div>
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

    return { sent: true };
}

function getTranslationsFilePath() {
    return path.join(__dirname, 'translations.js');
}

function getLegacyContentFilePath() {
    return path.join(__dirname, 'data/content.json');
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

function writeDashboardContent(content) {
    const serializedTranslations = `const translations = ${JSON.stringify(content, null, 4)};\n`;
    fs.writeFileSync(getTranslationsFilePath(), serializedTranslations, 'utf8');
    fs.writeFileSync(getLegacyContentFilePath(), JSON.stringify(content, null, 4), 'utf8');
}

// API: Get Content
app.get('/api/content', (req, res) => {
    try {
        res.json(readDashboardContent());
    } catch (error) {
        console.error(error);
        res.status(500).send('Error reading content');
    }
});

// API: Save Content
app.post('/api/content', (req, res) => {
    try {
        writeDashboardContent(req.body);
        res.status(200).send('Content saved');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error saving content');
    }
});

// API: Save Style (CSS Variables & Fonts)
app.post('/api/style', (req, res) => {
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

    fs.writeFile(path.join(__dirname, 'admin/custom-style.css'), cssContent, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error saving style');
        }
        res.status(200).send('Style saved');
    });
});

// API: Get Blog Posts
app.get('/api/posts', (req, res) => {
    fs.readFile(path.join(__dirname, 'data/posts.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading posts');
        }
        res.json(JSON.parse(data));
    });
});

// API: Save Blog Posts
app.post('/api/posts', (req, res) => {
    const newPosts = req.body;
    fs.writeFile(path.join(__dirname, 'data/posts.json'), JSON.stringify(newPosts, null, 4), (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error saving posts');
        }
        res.status(200).send('Posts saved');
    });
});

// API: Upload Image
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    res.status(200).send({ message: 'Image uploaded', filename: req.file.originalname });
});

// --- SEO FEATURES ---

// API: Get SEO Data
app.get('/api/seo', (req, res) => {
    fs.readFile(path.join(__dirname, 'data/seo.json'), 'utf8', (err, data) => {
        if (err) {
            return res.json({ global: {}, pages: {} });
        }
        res.json(JSON.parse(data));
    });
});

// API: Save SEO Data
app.post('/api/seo', (req, res) => {
    const seoData = req.body;
    fs.writeFile(path.join(__dirname, 'data/seo.json'), JSON.stringify(seoData, null, 4), (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error saving SEO data');
        }
        res.status(200).send('SEO data saved');
    });
});

// Sitemap Generation
app.get('/sitemap.xml', (req, res) => {
    fs.readFile(path.join(__dirname, 'data/seo.json'), 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error reading SEO config');

        const seoConfig = JSON.parse(data);
        const baseUrl = 'https://tk-design.no';

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // Add static pages
        for (const page of Object.keys(seoConfig.pages)) {
            xml += `
    <url>
        <loc>${baseUrl}/${page}</loc>
        <changefreq>weekly</changefreq>
        <priority>${page === 'index.html' ? '1.0' : '0.8'}</priority>
    </url>`;
        }

        // Add blog posts
        try {
            const postsData = fs.readFileSync(path.join(__dirname, 'data/posts.json'), 'utf8');
            const posts = JSON.parse(postsData);
            posts.forEach(post => {
                xml += `
    <url>
        <loc>${baseUrl}/blog-details.html?id=${post.id}</loc>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>`;
            });
        } catch (e) {
            console.log('No posts found for sitemap');
        }

        xml += `\n</urlset>`;
        res.header('Content-Type', 'application/xml');
        res.send(xml);
    });
});

// Server-Side Meta Injection
app.get(['/', '/index.html', '/blog.html', '/project-details.html', '/blog-details.html', '/contact.html'], (req, res) => {
    let reqFile = req.path === '/' ? 'index.html' : req.path.substring(1);

    let seoData = { global: {}, pages: {} };
    try {
        seoData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/seo.json'), 'utf8'));
    } catch (e) { }

    const globalSeo = seoData.global || {};
    let title = '';
    let description = '';
    let keywords = '';

    // Specialized Logic for Blog Details
    if (reqFile === 'blog-details.html' && req.query.id) {
        try {
            const posts = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/posts.json'), 'utf8'));
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
    const finalTitle = title ? `${title} ${globalSeo.separator || '|'} ${globalSeo.siteTitle || ''}` : globalSeo.siteTitle;

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

// API: Upload Blog Image
const blogImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'img/blog';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadBlogImage = multer({
    storage: blogImageStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

app.post('/api/upload-blog-image', uploadBlogImage.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const imageUrl = `/img/blog/${req.file.filename}`;
        res.json({
            success: true,
            imageUrl: imageUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Image Upload Error:', error);
        res.status(500).json({ error: 'Failed to upload image', details: error.message });
    }
});

// API: Contact Form
app.post('/api/contact', async (req, res) => {
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

        if (cleanMessage.length < 10) {
            return res.status(400).json({
                success: false,
                error: 'Meldingen må være minst 10 tegn.'
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
            ip_address: (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim() || null,
            user_agent: req.get('user-agent') || null
        };

        const savedMessage = await saveContactMessage(payload);

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
            emailWarning = 'Meldingen ble lagret, men e-postvarsel feilet.';
        }

        res.status(201).json({
            success: true,
            saved: true,
            emailSent,
            emailWarning,
            id: savedMessage && savedMessage.id ? savedMessage.id : null
        });
    } catch (error) {
        console.error('Contact form submission error:', error);
        res.status(500).json({
            success: false,
            error: 'Kunne ikke sende kontaktskjemaet.',
            details: error.message
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
        res.type('application/javascript');
        res.send(
            `window.__TK_FIREBASE_CONFIG__ = ${JSON.stringify(getFirebaseWebConfig(), null, 4)};\nwindow.__TK_FIREBASE_CONFIG_ERROR__ = ${JSON.stringify(error.message)};`
        );
    }
});

// Static Files (as fallback)
app.use(express.static(path.join(__dirname)));

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`CMS Server running at http://localhost:${PORT}`);
        console.log(`Admin Panel available at http://localhost:${PORT}/admin`);
    });
}

module.exports = app;
