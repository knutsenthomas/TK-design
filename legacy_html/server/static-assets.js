'use strict';

const rootFiles = new Set(['style.css', 'script.js', 'translations.js']);
const assetRoots = new Set(['assets', 'img', 'speed-test', 'nettside-sjekker-dist']);
const browserScripts = new Set([
    'contact-page.js', 'cookies.js', 'documents.js', 'firebase-client.js',
    'firebase-config.js', 'service-content.js', 'speed-insights-init.js',
    'privacy-consent.js', 'offline-consent.js'
]);

function isPublicStaticPath(requestPath) {
    let decoded;
    try { decoded = decodeURIComponent(requestPath); } catch { return false; }
    if (decoded.includes('\\') || decoded.includes('\0')) return false;
    const parts = decoded.split('/').filter(Boolean);
    if (parts.some(value => value === '.' || value === '..' || value.startsWith('.'))) return false;
    if (parts.length === 1) return rootFiles.has(parts[0]);
    if (assetRoots.has(parts[0])) return true;
    if (parts[0] === 'js') return parts.length === 2 && browserScripts.has(parts[1]);
    // Preserve only the known legacy public aliases, not the whole public tree.
    if (parts[0] === 'public') {
        if (parts.length === 2) return rootFiles.has(parts[1]);
        if (parts[1] === 'img') return parts.length > 2;
        return parts.length === 3 && parts[1] === 'js' && browserScripts.has(parts[2]);
    }
    return false;
}

module.exports = { isPublicStaticPath };
