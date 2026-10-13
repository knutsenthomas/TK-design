'use strict';

function pdfTarget(raw, bucket) {
    if (typeof raw !== 'string' || raw.length > 8192) throw Object.assign(Error('Ugyldig PDF-adresse.'), { status: 400 });
    let url;
    try { url = new URL(raw); } catch { throw Object.assign(Error('Ugyldig PDF-adresse.'), { status: 400 }); }
    if (!bucket) throw Object.assign(Error('PDF-lagring er ikke konfigurert.'), { status: 503 });
    const firebasePath = '/v0/b/' + encodeURIComponent(bucket) + '/o/';
    const storagePath = '/' + encodeURIComponent(bucket) + '/';
    const allowed = url.hostname === 'firebasestorage.googleapis.com' && url.pathname.startsWith(firebasePath) && url.pathname.length > firebasePath.length
        || url.hostname === 'storage.googleapis.com' && url.pathname.startsWith(storagePath) && url.pathname.length > storagePath.length;
    if (url.protocol !== 'https:' || url.username || url.password || url.port || !allowed) throw Object.assign(Error('PDF-adressen er ikke tillatt.'), { status: 403 });
    return url;
}

function createPdfProxy({ getBucket, https = require('node:https'), maxBytes = 50 * 1024 * 1024 }) {
    return function proxyPdf(req, res) {
        let url;
        try { url = pdfTarget(req.query.url, getBucket()); }
        catch (error) { return res.status(error.status || 400).send(error.message); }
        let request, remote, finished = false;
        const fail = (status = 502) => {
            if (finished) return;
            finished = true;
            remote?.destroy(); request?.destroy();
            if (res.headersSent) res.destroy();
            else res.status(status).send('PDF-filen kunne ikke hentes.');
        };
        try {
            // https.get deliberately does not follow redirects. No visitor headers,
            // cookies, or authorization credentials are sent to storage.
            request = https.get(url, { headers: { Accept: 'application/pdf' } }, response => {
                remote = response;
                if (response.statusCode !== 200) return fail();
                if (Number(response.headers['content-length']) > maxBytes) return fail(413);
                // Older accepted .pdf uploads can have application/x-pdf or even
                // text/plain metadata. Check the PDF header instead of that metadata.
                let bytes = 0, prefix = Buffer.alloc(0), verified = false;
                const write = chunk => { if (!res.write(chunk)) response.pause(); };
                res.on('drain', () => response.resume());
                response.on('data', chunk => {
                    if (finished) return;
                    bytes += chunk.length;
                    if (bytes > maxBytes) return fail(413);
                    if (verified) return write(chunk);
                    prefix = Buffer.concat([prefix, chunk]);
                    const header = prefix.subarray(0, 1028).indexOf('%PDF-');
                    if (header >= 0 && header < 1024) {
                        verified = true;
                        res.setHeader('Access-Control-Allow-Origin', '*');
                        res.setHeader('Content-Type', 'application/pdf');
                        res.setHeader('X-Content-Type-Options', 'nosniff');
                        res.setHeader('Cache-Control', 'public, max-age=86400');
                        write(prefix); prefix = Buffer.alloc(0);
                    } else if (prefix.length >= 1028) fail();
                });
                response.on('error', () => fail());
                response.on('aborted', () => fail());
                response.on('end', () => {
                    if (finished) return;
                    if (!verified) return fail();
                    finished = true; res.end();
                });
            });
            request.setTimeout(15000, () => fail(504));
            request.on('error', () => fail());
            res.on('close', () => { remote?.destroy(); request?.destroy(); });
        } catch { fail(); }
    };
}
module.exports = { pdfTarget, createPdfProxy };
