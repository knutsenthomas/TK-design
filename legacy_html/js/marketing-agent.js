'use strict';
const crypto = require('node:crypto');
const platforms = ['facebook', 'instagram', 'linkedin'];
const idPattern = /^[a-zA-Z0-9:_-]{1,160}$/;

function configuredChannels(env = process.env) {
    return platforms.map(platform => ({
        platform,
        configured: platform === 'facebook'
            ? !!(env.FB_PAGE_ID && env.FB_PAGE_ACCESS_TOKEN)
            : platform === 'instagram'
                ? !!(env.INSTAGRAM_ACCOUNT_ID && env.FB_PAGE_ACCESS_TOKEN)
                : !!(env.LINKEDIN_ORGANIZATION_ID && env.LINKEDIN_ACCESS_TOKEN)
    }));
}

function validatePublishInput(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Ugyldig innlegg.');
    const requestId = value.requestId;
    const recordId = value.recordId;
    if (typeof requestId !== 'string' || !idPattern.test(requestId) || typeof recordId !== 'string' || !idPattern.test(recordId)) throw Error('Ugyldig kjørings-ID.');
    if (typeof value.text !== 'string' || !value.text.trim() || value.text.length > 10000) throw Error('Skriv tekst til innlegget (maks 10 000 tegn).');
    if (!Array.isArray(value.targets) || !value.targets.length || value.targets.length > 3 || value.targets.some(p => !platforms.includes(p)) || new Set(value.targets).size !== value.targets.length) throw Error('Velg Facebook, Instagram eller LinkedIn.');
    function httpsUrl(raw) {
        if (!raw) return '';
        if (typeof raw !== 'string' || raw.length > 2000) throw Error('Ugyldig nettadresse.');
        const url = new URL(raw);
        if (url.protocol !== 'https:' || url.username || url.password) throw Error('Bruk en offentlig https-adresse.');
        const hostname = url.hostname.toLowerCase();
        if (hostname === 'localhost' || hostname.includes(':') || /^\d+(\.\d+){3}$/.test(hostname) || hostname.endsWith('.local')) throw Error('Bruk en offentlig https-adresse.');
        return url.href;
    }
    const imageUrl = httpsUrl(value.imageUrl);
    if (value.targets.includes('instagram') && !imageUrl) throw Error('Instagram krever et bilde med offentlig https-adresse.');
    return { requestId, recordId, title: String(value.title || '').slice(0,160), text: value.text, link: httpsUrl(value.link), imageUrl, targets: value.targets };
}

function publicRun(run) {
    return { requestId: run.requestId, recordId: run.recordId, status: run.status, startedAt: run.startedAt, completedAt: run.completedAt || '',
        results: platforms.filter(p => run.results?.[p]).map(platform => {
            const result = run.results[platform];
            return { platform, status: result.status, postId: result.postId || '', message: result.message || '' };
        }) };
}

function installMarketingAgentRoutes(app, dependencies) {
    const { publishers, hasFirebaseServerCredentials, getAdminInstance } = dependencies;
    function authenticate(req, res, next) {
        res.setHeader('Cache-Control', 'private, no-store');
        const expected = process.env.MARKETING_AGENT_SECRET || '';
        const header = req.headers.authorization || '';
        const supplied = typeof header === 'string' && header.startsWith('Bearer ') ? header.slice(7) : '';
        if (expected.length < 32) return res.status(503).json({ success: false, code: 'connection_not_configured', error: 'Publiseringstilkoblingen er ikke konfigurert på TK-design.' });
        if (Buffer.byteLength(supplied) !== Buffer.byteLength(expected) || !crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return res.status(401).json({ success: false, error: 'Adgang nektet.' });
        next();
    }
    function runsCollection() {
        if (!hasFirebaseServerCredentials()) throw Error('storage_unavailable');
        return getAdminInstance().firestore().collection('marketingAgentRuns');
    }
    const hub = require('./marketing-hub').createHubConnection({ getAdminInstance });
    app.get('/api/marketing-agent/hub', authenticate, async (req, res) => res.json(await hub.read()));
    app.post('/api/marketing-agent/hub', authenticate, async (req, res) => res.json(await hub.sync(req.body?.leads)));
    app.get('/api/marketing-agent/google', authenticate, async (req, res) => {
        try { return res.json({ success: true, ...await require('./marketing-google').readGoogleSources() }); }
        catch { return res.status(503).json({ success: false, error: 'Google-data er utilgjengelige. Prøv igjen.' }); }
    });
    app.get('/api/marketing-agent', authenticate, async (req, res) => {
        if (req.query.requestId) {
            if (typeof req.query.requestId !== 'string' || !idPattern.test(req.query.requestId)) return res.status(400).json({ success: false, error: 'Ugyldig kjørings-ID.' });
            try {
                const doc = await runsCollection().doc(req.query.requestId).get();
                if (!doc.exists) return res.status(404).json({ success: false, error: 'Fant ikke publiseringsforsøket.' });
                return res.json({ success: true, run: publicRun(doc.data()) });
            } catch { return res.status(503).json({ success: false, error: 'Publiseringsloggen er utilgjengelig.' }); }
        }
        res.json({ success: true, channels: configuredChannels(), storageConfigured: hasFirebaseServerCredentials(), verified: false,
            message: 'Konfigurasjon er kontrollert. Kontoenes API-tilgang er ikke testet, og ingen innlegg er sendt.' });
    });
    app.post('/api/marketing-agent', authenticate, async (req, res) => {
        let input;
        try { input = validatePublishInput(req.body); }
        catch(e) { return res.status(400).json({ success: false, error: e.message }); }
        const channels = configuredChannels();
        if (input.targets.some(p => !channels.find(c => c.platform === p)?.configured)) return res.status(409).json({ success: false, error: 'En valgt kanal mangler kontoinnstillinger på TK-design.' });
        const fingerprint = crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
        let doc;
        let run = { requestId: input.requestId, recordId: input.recordId, fingerprint, status: 'publishing', startedAt: new Date().toISOString(), results: {} };
        try {
            doc = runsCollection().doc(input.requestId);
            // Firestore create is atomic across serverless instances. A claimed ID is never automatically replayed.
            await doc.create(run);
        } catch(e) {
            if (e.code === 6 || e.code === 'already-exists') {
                try {
                    const previous = (await doc.get()).data();
                    if (previous.fingerprint !== fingerprint) return res.status(409).json({ success: false, error: 'Kjørings-ID er allerede brukt til et annet innlegg.' });
                    return res.json({ success: true, replay: true, run: publicRun(previous) });
                } catch { /* Fail closed: never resend on an uncertain claim. */ }
            }
            return res.status(503).json({ success: false, error: 'Kunne ikke sikre publiseringsloggen. Ingen nye API-kall ble startet.' });
        }
        for (const platform of input.targets) {
            run.results[platform] = { status: 'publishing', message: 'Publisering startet. Resultatet må bekreftes.' };
            try { await doc.set(run); }
            catch { return res.status(503).json({ success: false, uncertain: true, run: publicRun(run), error: 'Publiseringsloggen er utilgjengelig. Ikke send innlegget på nytt.' }); }
            try {
                const result = await publishers[platform](input);
                const postId = result?.id;
                run.results[platform] = result?.ok === true && typeof postId === 'string' && postId.trim()
                    ? { status: 'published', postId: postId.slice(0,300), message: 'Publisering bekreftet av kanalen.' }
                    : { status: 'unknown', message: 'Kanalen bekreftet ikke publiseringen. Kontroller kontoen før et nytt forsøk.' };
            } catch {
                run.results[platform] = { status: 'unknown', message: 'API-kallet ble avbrutt. Kontroller kontoen før et nytt forsøk.' };
            }
            try { await doc.set(run); }
            catch { return res.status(503).json({ success: false, uncertain: true, run: publicRun(run), error: 'Resultatet kunne ikke lagres. Kontroller publiseringen på kontoen; ikke send på nytt.' }); }
        }
        const published = Object.values(run.results).filter(r => r.status === 'published').length;
        run.status = published === input.targets.length ? 'published' : published ? 'partially_published' : 'unknown';
        run.completedAt = new Date().toISOString();
        try { await doc.set(run); }
        catch { return res.status(503).json({ success: false, uncertain: true, run: publicRun(run), error: 'Sluttstatus kunne ikke lagres. Kontroller kontoen før et nytt forsøk.' }); }
        res.json({ success: true, run: publicRun(run) });
    });
}

module.exports = { installMarketingAgentRoutes, validatePublishInput, configuredChannels, publicRun };
