'use strict';
const crypto = require('node:crypto');
const tokenUrl = 'https://oauth2.googleapis.com/token';
const allowedSites = ['sc-domain:tk-design.no', 'https://www.tk-design.no/', 'https://tk-design.no/'];
const number = value => Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : 0;

function credentialsFromEnv(env) {
    let raw = String(env.GOOGLE_SERVICE_ACCOUNT_JSON || '').trim();
    if ((raw.startsWith("'") && raw.endsWith("'")) || (raw.startsWith('"') && raw.endsWith('"'))) raw = raw.slice(1, -1);
    const data = JSON.parse(raw);
    if (typeof data.client_email !== 'string' || !data.client_email.endsWith('.iam.gserviceaccount.com') || typeof data.private_key !== 'string') throw Error('invalid_credentials');
    return { email: data.client_email, key: data.private_key.replace(/\\n/g, '\n') };
}

async function googleJson(fetcher, url, options = {}) {
    // All callers use fixed Google API origins. Never follow redirects with tokens.
    const response = await fetcher(url, { ...options, redirect: 'manual', signal: AbortSignal.timeout(10000) });
    if (!response.ok) {
        let apiDisabled = false;
        if (response.status === 403) {
            // Read only the documented reason; never expose Google's raw error
            // body, request options, key or assertion in diagnostics.
            try {
                const data = await response.json();
                apiDisabled = data.error?.details?.some(d => d.reason === 'SERVICE_DISABLED') || data.error?.errors?.some(d => d.reason === 'accessNotConfigured') || false;
            } catch {}
        }
        const error = Error(apiDisabled ? 'api_disabled' : response.status === 401 || response.status === 403 ? 'access_denied' : response.status === 429 ? 'rate_limited' : 'google_unavailable');
        throw error;
    }
    return response.json();
}

async function accessToken(credentials, scope, fetcher) {
    const now = Math.floor(Date.now() / 1000);
    const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
    const unsigned = encode({ alg: 'RS256', typ: 'JWT' }) + '.' + encode({ iss: credentials.email, scope, aud: tokenUrl, iat: now, exp: now + 600 });
    const assertion = unsigned + '.' + crypto.sign('RSA-SHA256', Buffer.from(unsigned), credentials.key).toString('base64url');
    const data = await googleJson(fetcher, tokenUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }) });
    if (typeof data.access_token !== 'string' || !data.access_token) throw Error('invalid_credentials');
    return data.access_token;
}

function rangeEnding(daysAgo) {
    const end = new Date(); end.setUTCDate(end.getUTCDate() - daysAgo);
    const start = new Date(end); start.setUTCDate(start.getUTCDate() - 27);
    return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) };
}

async function analytics(env, credentials, fetcher) {
    const propertyId = String(env.GA_PROPERTY_ID || '').trim().replace(/^properties\//, '');
    if (!/^\d+$/.test(propertyId)) return { status: 'unconfigured', message: 'GA4-egenskapen mangler i serveroppsettet.' };
    const token = await accessToken(credentials, 'https://www.googleapis.com/auth/analytics.readonly', fetcher);
    const range = rangeEnding(1);
    const query = body => googleJson(fetcher, `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
        method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({
            dateRanges: [range], dimensionFilter: { filter: { fieldName: 'hostName', inListFilter: { values: ['tk-design.no', 'www.tk-design.no'] } } }, ...body
        })
    });
    const [summary, pages, sources] = await Promise.all([
        query({ metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }] }),
        query({ dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }], limit: '8', orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }] }),
        query({ dimensions: [{ name: 'sessionDefaultChannelGroup' }], metrics: [{ name: 'sessions' }], limit: '8', orderBys: [{ metric: { metricName: 'sessions' }, desc: true }] })
    ]);
    const values = summary.rows?.[0]?.metricValues || [];
    return { status: 'active', range, data: {
        activeUsers: number(values[0]?.value), sessions: number(values[1]?.value), pageViews: number(values[2]?.value),
        pages: (pages.rows || []).slice(0, 8).map(r => ({ title: String(r.dimensionValues?.[0]?.value || '').slice(0, 300), value: number(r.metricValues?.[0]?.value) })),
        sources: (sources.rows || []).slice(0, 8).map(r => ({ title: String(r.dimensionValues?.[0]?.value || '').slice(0, 150), value: number(r.metricValues?.[0]?.value) }))
    } };
}

async function searchConsole(env, credentials, fetcher) {
    const configuredSite = String(env.GSC_SITE_URL || '').trim();
    if (configuredSite && !allowedSites.includes(configuredSite)) return { status: 'unconfigured', message: 'Velg en Search Console-egenskap for tk-design.no.' };
    const token = await accessToken(credentials, 'https://www.googleapis.com/auth/webmasters.readonly', fetcher);
    const headers = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };
    const sites = await googleJson(fetcher, 'https://www.googleapis.com/webmasters/v3/sites', { headers });
    const accessible = (sites.siteEntry || []).filter(s => s.permissionLevel !== 'siteUnverifiedUser').map(s => s.siteUrl);
    const siteUrl = configuredSite || allowedSites.find(s => accessible.includes(s));
    if (!siteUrl || !accessible.includes(siteUrl)) return { status: 'needs_access', message: 'Gi Google-tjenestekontoen lesetilgang til tk-design.no i Search Console.' };
    const range = rangeEnding(3);
    const query = dimensions => googleJson(fetcher, `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
        method: 'POST', headers, body: JSON.stringify({ ...range, type: 'web', dataState: 'final', dimensions, rowLimit: 8 })
    });
    const [summary, queries, pages] = await Promise.all([query([]), query(['query']), query(['page'])]);
    const totals = summary.rows?.[0] || {};
    const rows = report => (report.rows || []).slice(0, 8).map(r => ({ title: String(r.keys?.[0] || '').slice(0, 300), clicks: number(r.clicks), impressions: number(r.impressions), ctr: number(r.ctr), position: number(r.position) }));
    return { status: 'active', siteUrl, range, data: { clicks: number(totals.clicks), impressions: number(totals.impressions), ctr: number(totals.ctr), position: number(totals.position), queries: rows(queries), pages: rows(pages) } };
}

async function readGoogleSources({ env = process.env, fetcher = globalThis.fetch } = {}) {
    let credentials;
    try { credentials = credentialsFromEnv(env); }
    catch { return { checkedAt: new Date().toISOString(), analytics: { status: 'unconfigured', message: 'Google-tjenestekontoen mangler eller er ugyldig i serveroppsettet.' }, searchConsole: { status: 'unconfigured', message: 'Google-tjenestekontoen mangler eller er ugyldig i serveroppsettet.' } }; }
    const safeRead = async (action, apiName) => {
        try { return await action(); }
        catch (e) { return { status: 'error', code: ['api_disabled', 'access_denied', 'rate_limited'].includes(e.message) ? e.message : 'google_unavailable', message: e.message === 'api_disabled' ? `Aktiver ${apiName} i Google Cloud-prosjektet til tjenestekontoen, og hent data på nytt.` : e.message === 'access_denied' ? 'Google nektet tilgang. Kontroller lesetilgang og at API-et er aktivert.' : e.message === 'rate_limited' ? 'Google begrenser forespørslene. Prøv igjen senere.' : 'Google-data kunne ikke hentes. Prøv igjen eller kontroller serveroppsettet.' }; }
    };
    const [ga, sc] = await Promise.all([safeRead(() => analytics(env, credentials, fetcher), 'Google Analytics Data API'), safeRead(() => searchConsole(env, credentials, fetcher), 'Google Search Console API')]);
    return { checkedAt: new Date().toISOString(), serviceAccountEmail: credentials.email, analytics: ga, searchConsole: sc };
}

module.exports = { readGoogleSources };
