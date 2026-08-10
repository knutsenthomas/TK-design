const dotenv = require('dotenv');
const crypto = require('crypto');

dotenv.config();

function getFirebaseConfig() {
    const privateKey = (process.env.TK_FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n').replace(/^"|"$/g, '');
    const projectId = process.env.TK_FIREBASE_PROJECT_ID || 'tk-design-f43f6';

    return {
        projectId,
        clientEmail: process.env.TK_FIREBASE_CLIENT_EMAIL || '',
        privateKey,
        databaseId: process.env.TK_FIREBASE_DATABASE_ID || '(default)'
    };
}

function toBase64Url(source) {
    const buffer = Buffer.isBuffer(source) ? source : Buffer.from(source);
    return buffer.toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
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

async function getFirebaseAccessToken() {
    const { clientEmail, privateKey } = getFirebaseConfig();
    const signedJwt = createGoogleAccessJwt(clientEmail, privateKey, 'https://www.googleapis.com/auth/datastore');
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
        throw new Error("Token failed");
    }

    const data = await response.json();
    return data.access_token;
}

async function run() {
    try {
        console.log("Fetching posts from Firestore...");
        const { projectId, databaseId } = getFirebaseConfig();
        const accessToken = await getFirebaseAccessToken();
        const collection = process.env.TK_FIREBASE_SITE_DATA_COLLECTION || 'siteAdminData';
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${encodeURIComponent(databaseId)}/documents/${collection}/posts`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (!response.ok) {
            console.error("Failed to read posts:", response.status, await response.text());
            return;
        }
        
        const doc = await response.json();
        const jsonStr = doc.fields?.json?.stringValue;
        if (!jsonStr) {
            console.log("No JSON field found in document.");
            return;
        }
        
        const posts = JSON.parse(jsonStr);
        const post10 = posts.find(p => p.id === 10 || String(p.id) === '10');
        if (!post10) {
            console.log("Post 10 not found. Available post IDs:", posts.map(p => p.id));
            return;
        }
        
        console.log("========================================= POST 10 CONTENT =========================================");
        console.log("Title:", post10.title);
        console.log("Length of Content HTML:", post10.content?.length);
        console.log("Content HTML:");
        console.log(post10.content);
        console.log("====================================================================================================");
    } catch (e) {
        console.error("Error:", e);
    }
}

run();
