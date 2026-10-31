// Test preloader: never load real .env credentials or contact cloud services.
const Module = require('node:module');
const originalLoad = Module._load;
Module._load = function (name, ...args) {
    if (name === 'dotenv') return { config() { return { parsed: {} }; } };
    return originalLoad.call(this, name, ...args);
};
for (const key of Object.keys(process.env)) {
    if (/^(TK_FIREBASE_|FIREBASE_|GOOGLE_|GCLOUD_|GCP_|ADMIN_SECRET$|TK_ADMIN_SECRET$|SOCIAL_|FB_|RESEND_)/.test(key)) {
        delete process.env[key];
    }
}
const originalFetch = global.fetch;
global.fetch = function (input, options) {
    const url = new URL(typeof input === 'string' ? input : input.url || input.toString());
    if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) {
        throw new Error('External network disabled in offline tests');
    }
    return originalFetch(input, options);
};
