'use strict';
const crypto = require('node:crypto');

function equalSecret(value, expected) {
    if (typeof value !== 'string' || typeof expected !== 'string' || !expected) return false;
    const left = Buffer.from(value), right = Buffer.from(expected);
    return left.length === right.length && crypto.timingSafeEqual(left, right);
}
function list(value) {
    return String(value || '').split(',').map(v => v.trim().toLowerCase()).filter(Boolean);
}
function isAdministrator(token, env = process.env) {
    if (!token || token.firebase?.sign_in_provider === 'anonymous') return false;
    if (token.admin === true) return true;
    return token.email_verified === true && typeof token.email === 'string'
        && list(env.TK_ADMIN_EMAILS).includes(token.email.toLowerCase());
}
function createAdminGuard({ getAdminInstance, hasFirebaseServerCredentials, env = process.env }) {
    const authorized = Symbol('verified-administrator');
    return async function adminGuard(req, res, next) {
        res.setHeader('Cache-Control', 'private, no-store');
        if (req[authorized]) return next();
        const allow = () => { req[authorized] = true; return next(); };
        const expected = env.ADMIN_SECRET || env.TK_ADMIN_SECRET || '';
        const supplied = req.headers['x-admin-secret'] || req.headers['x-tk-admin-secret'] || '';
        if (equalSecret(supplied, expected)) return allow();
        const header = req.headers.authorization;
        const match = typeof header === 'string' && /^Bearer ([^\s]+)$/i.exec(header);
        if (!match) return res.status(401).json({ success: false, error: 'Innlogging er påkrevd.' });
        if (!hasFirebaseServerCredentials()) {
            if (equalSecret(match[1], expected)) return allow();
            return res.status(401).json({ success: false, error: 'Innlogging er påkrevd.' });
        }
        let token;
        try { token = await getAdminInstance().auth().verifyIdToken(match[1], true); }
        catch { return res.status(401).json({ success: false, error: 'Ugyldig eller utløpt autentiseringstoken.' }); }
        if (!isAdministrator(token, env)) return res.status(403).json({ success: false, error: 'Denne kontoen har ikke administratoradgang.' });
        req.user = token;
        return allow();
    };
}

// Never expose the planner's disk fallback through express.static.
function privatePlannerFile(pathname) {
    let path;
    try { path = decodeURIComponent(pathname).replace(/\\/g, '/').toLowerCase(); }
    catch { return true; }
    return /(?:^|\/)social_planner\.json(?:\/|$)/.test(path);
}
module.exports = { createAdminGuard, isAdministrator, privatePlannerFile };
