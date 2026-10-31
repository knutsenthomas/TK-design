const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { isPublicStaticPath } = require('../server/static-assets');

async function serve(app, run) {
 const server = app.listen(0, '127.0.0.1');
 await new Promise(resolve => server.once('listening', resolve));
 try { await run(`http://127.0.0.1:${server.address().port}`); }
 finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
}

test('real server blocks all private route methods before data/publishing side effects', async () => {
    const app = require('../server');
    const routes = [
        ['GET', '/api/messages'], ['HEAD', '/api/messages'], ['PATCH', '/api/messages/nonexistent'], ['DELETE', '/api/messages/nonexistent'],
        ['GET', '/api/social-planner'], ['GET', '/api/social-planner?runScheduler=true'], ['PUT', '/api/social-planner'],
        ['PATCH', '/api/social-planner/settings'], ['POST', '/api/social-planner/workspaces'],
        ...['workspaces', 'accounts', 'templates', 'entries'].flatMap(kind => ['PATCH', 'DELETE'].map(method => [method, `/api/social-planner/${kind}/nonexistent`])),
        ['POST', '/api/social-planner/accounts'], ['POST', '/api/social-planner/templates'], ['POST', '/api/social-planner/entries'],
        ['POST', '/api/social-planner/entries/nonexistent/publish'], ['POST', '/api/social-planner/scheduler/run'],
        ['GET', '/api/social-planner/analytics'], ['POST', '/api/social-planner/metrics/sync'], ['POST', '/api/social-planner/assistant'],
        ['POST', '/api/social/autopost'], ['POST', '/api/social/publish-direct'], ['POST', '/api/admin/storage/upload'],
        ['GET', '/API/MESSAGES/'], ['GET', '/api/social-planner/?runScheduler=true'],
        ['POST', '/api/content'], ['POST', '/api/style'], ['POST', '/api/posts'], ['POST', '/api/seo'], ['POST', '/api/generate-content']
    ];
    await serve(app, async base => {
        for (const [method, route] of routes) {
            const response = await fetch(base + route, { method, headers: { Host: 'localhost' } });
            assert.equal(response.status, 401, `${method} ${route}`);
            await response.arrayBuffer();
        }
        for (const route of ['/server.js', '/server/site-data.js', '/js/admin-security.js', '/js/marketing-agent.js', '/public/js/admin-security.js', '/package.json', '/firestore.rules', '/data/social_planner.json', '/data/comments.json', '/data%2fsocial_planner.json', '/%64ata/social_planner.json']) {
            const response = await fetch(base + route);
            assert.ok([403, 404].includes(response.status), route);
            await response.arrayBuffer();
        }
        for (const route of ['/', '/contact', '/js/documents.js', '/style.css', '/data/posts.json', '/data/seo.json', '/admin/login.html', '/admin/app.js', '/assets/fonts/kanit-400.woff2', '/public/js/documents.js', '/visittkort/']) {
            const response = await fetch(base + route);
            assert.equal(response.status, 200, route);
            await response.arrayBuffer();
        }
        const previousSecret = process.env.ADMIN_SECRET;
        process.env.ADMIN_SECRET = 'test-only-server-secret';
        try {
            const response = await fetch(base + '/api/social-planner', { headers: { 'x-admin-secret': 'test-only-server-secret' } });
            assert.equal(response.status, 200, 'authorized operator can still read the real planner');
            assert.match(response.headers.get('cache-control'), /no-store/);
            await response.arrayBuffer(); // Do not print private planner data.
        } finally {
            if (previousSecret === undefined) delete process.env.ADMIN_SECRET;
            else process.env.ADMIN_SECRET = previousSecret;
        }
    });
});

test('static allowlist cannot normalize private traversal into a public asset', () => {
    for (const value of ['/js/../data/social_planner.json', '/js/%2e%2e/server.js', '/js%5c..%5cserver.js', '/js/%00x', '/%E0%A4%A', '/data/social_planner.json']) {
        assert.equal(isPublicStaticPath(value), false, value);
    }
    assert.equal(isPublicStaticPath('/js/documents.js'), true);
});

test('Firebase deployment uses the same reviewed rules as repository root', () => {
    const legacy = path.join(__dirname, '..');
    for (const name of ['firestore.rules', 'storage.rules']) {
        assert.equal(fs.readFileSync(path.join(legacy, name), 'utf8'), fs.readFileSync(path.join(legacy, '..', name), 'utf8'));
    }
    const config = JSON.parse(fs.readFileSync(path.join(legacy, 'firebase.json'), 'utf8'));
    assert.equal(config.firestore.rules, 'firestore.rules');
    assert.equal(config.storage.rules, 'storage.rules');
});

