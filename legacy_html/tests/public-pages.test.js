const { test } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');
const http = require('node:http');
function requestWithHost(url, host) {
    return new Promise((resolve, reject) => {
        http.get(url, { headers: { Host: host } }, response => {
            let body = ''; response.setEncoding('utf8');
            response.on('data', chunk => body += chunk);
            response.on('end', () => resolve({ status: response.statusCode, headers: response.headers, body }));
        }).on('error', reject);
    });
}

test('public pages serve distinct content before JavaScript runs', async () => {
    const server = app.listen(0);
    await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    try {
        for (const path of ['/', '/webdesign', '/project-details?project=kudos', '/sitemap.xml']) {
            const redirect = await requestWithHost(base + path, 'tk-design.no');
            assert.equal(redirect.status, 301);
            assert.equal(redirect.headers.location, 'https://www.tk-design.no' + path);
        }
        const canonicalHome = (await requestWithHost(base + '/', 'www.tk-design.no')).body;
        assert.match(canonicalHome, /rel="canonical" href="https:\/\/www\.tk-design\.no\/"/);
        const sitemap = await (await fetch(base + '/sitemap.xml')).text();
        assert.doesNotMatch(sitemap, /https:\/\/tk-design\.no/);
        assert.match(await (await fetch(base + '/robots.txt')).text(), /Sitemap: https:\/\/www\.tk-design\.no/);
        const expected = {
            '/': /NETTSIDER[\s\S]*FOR DIN[\s\S]*BEDRIFT/,
            '/nettside-for-regnskapsbyra': /Nettsider for regnskapsbyråer/,
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
        const accounting = await (await fetch(base + '/nettside-for-regnskapsbyra')).text();
        assert.match(accounting, /<section id="accountingCases">/);
        assert.match(accounting, /project=kudos/);
        assert.match(accounting, /project=mandal/);
        assert.match(await (await fetch(base + '/sitemap.xml')).text(), /nettside-for-regnskapsbyra/);
        const accountingEnglish = await (await fetch(base + '/nettside-for-regnskapsbyra', { headers: { cookie: 'site_lang=en' } })).text();
        assert.match(accountingEnglish, /Websites for accounting firms/);
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
