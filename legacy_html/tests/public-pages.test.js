const { test } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');

test('public pages serve distinct content before JavaScript runs', async () => {
    const server = app.listen(0);
    await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    try {
        const expected = {
            '/': /NETTSIDER[\s\S]*FOR DIN[\s\S]*BEDRIFT/,
            '/webdesign': /Nettsider og webdesign for bedrifter/,
            '/seo': /SEO &amp; Søkemotoroptimalisering/,
            '/support-og-vedlikehold': /Drift &amp; Supportavtale for Nettside/,
            '/sosiale-medier': /Digital markedsføring &amp; SoMe/
        };
        for (const [route, heading] of Object.entries(expected)) {
            const response = await fetch(base + route);
            assert.equal(response.status, 200, route);
            const html = await response.text();
            const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1];
            assert.match(h1, heading, route);
            if (route === '/') {
                assert.doesNotMatch(html, /id="testimonial"|id="analyzerDashboardState"|Ansett heltidsutvikler/);
                assert.equal((html.match(/class="project-card\b/g) || []).length, 3);
            }
        }
        for (const route of ['/portefolje', '/blog', '/contact', '/privacy', '/accessibility', '/nettside-sjekker', '/sitemap.xml', '/robots.txt', '/js/service-content.js']) {
            assert.equal((await fetch(base + route)).status, 200, route);
        }
        const seo = await (await fetch(base + '/seo')).text();
        assert.match(seo, /Google Search Console/);
        assert.match(seo, /Teknisk SEO-revisjon/);
        assert.doesNotMatch(seo.match(/<article\b[\s\S]*?<\/article>/)[0], /Brukerinnsikt|100\/100/);
        const english = await (await fetch(base + '/seo', { headers: { cookie: 'site_lang=en' } })).text();
        assert.match(english, /<html lang="en"/);
        assert.match(english, /Help customers find your services/);
        const support = await (await fetch(base + '/support-og-vedlikehold', { headers: { cookie: 'site_lang=en' } })).text();
        assert.match(support, /Website maintenance and support/);
        assert.doesNotMatch(support.match(/<article\b[\s\S]*?<\/article>/)[0], /[æøå]/i);
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
});
