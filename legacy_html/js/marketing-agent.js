'use strict';
// Markedsagenten (ChatGPT Sites, markedsagent.tk-design.no) ble slettet i november 2026.
// Markedsarbeidet ligger nå i TK-design Hub. Her står bare det allerede publisert innhold trenger:
// - offentlige bilder som publiserte innlegg/blogginnlegg kan peke til
// - tidsstyringen som publiserer bloggartikler Thomas allerede har godkjent og planlagt
// Alle ruter som krevde MARKETING_AGENT_SECRET er fjernet.
const { createGeneratedImageStore } = require('./marketing-generated-images');
const { tick, cronAuthorized } = require('./marketing-blog-scheduler');

function installMarketingAgentRoutes(app, { getAdminInstance, hasFirebaseServerCredentials }) {
    const store = createGeneratedImageStore({ getAdminInstance });
    // Only opaque image IDs are public. No listing, prompts, customer data or credentials are exposed.
    app.get('/api/marketing-agent/generated-images/:id', async (req, res) => {
        try {
            const bytes = await store.read(req.params.id);
            if (!bytes) return res.status(404).end();
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            res.send(bytes);
        } catch { res.status(503).end(); }
    });
    app.get('/api/cron/marketing-blog', async (req, res) => {
        res.set?.('Cache-Control', 'no-store');
        if (!cronAuthorized(req, process.env.CRON_SECRET)) return res.status(401).json({ success: false, error: 'Ingen tilgang.' });
        try {
            if (!hasFirebaseServerCredentials()) throw Error('storage');
            return res.json(await tick(getAdminInstance().firestore()));
        } catch { return res.status(503).json({ success: false, error: 'Bloggkontrollen mislyktes. Neste kjøring kan avstemme uten duplikater.' }); }
    });
}

module.exports = { installMarketingAgentRoutes };
