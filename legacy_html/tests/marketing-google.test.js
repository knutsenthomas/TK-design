'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { readGoogleSources } = require('../js/marketing-google');
const { installMarketingAgentRoutes } = require('../js/marketing-agent');
const key = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey.export({ type: 'pkcs8', format: 'pem' });
const env = { GOOGLE_SERVICE_ACCOUNT_JSON: JSON.stringify({ client_email: 'unit@test.iam.gserviceaccount.com', private_key: key }), GA_PROPERTY_ID: '123' };
function fixture({ deniedSearch = false, disabledSearch = false, noRows = false } = {}) {
 const calls = [];
 const fetcher = async (url, options) => {
  calls.push({ url, options });
  assert.equal(options.redirect, 'manual');
  let data;
  if (url === 'https://oauth2.googleapis.com/token') {
   const assertion = options.body.get('assertion');
   const payload = JSON.parse(Buffer.from(assertion.split('.')[1], 'base64url'));
   assert.ok(['https://www.googleapis.com/auth/analytics.readonly', 'https://www.googleapis.com/auth/webmasters.readonly'].includes(payload.scope));
   assert.equal(payload.sub, undefined); // Never impersonate a mailbox user.
   data = { access_token: 'unit-only-token' };
  } else if (url.endsWith('/sites')) {
   if (disabledSearch) return { ok: false, status: 403, json: async () => ({ error: { message: 'Provider raw content must never escape', details: [{ reason: 'SERVICE_DISABLED' }] } }) };
   if (deniedSearch) return { ok: false, status: 403 };
   data = { siteEntry: [{ siteUrl: 'sc-domain:another-site.no', permissionLevel: 'siteOwner' }, { siteUrl: 'sc-domain:tk-design.no', permissionLevel: 'siteRestrictedUser' }] };
  } else if (url.includes('searchAnalytics')) {
   assert.ok(url.includes(encodeURIComponent('sc-domain:tk-design.no')));
   const body = JSON.parse(options.body);
   assert.equal(body.dataState, 'final'); assert.equal(body.rowLimit, 8);
   data = { rows: noRows ? [] : [{ keys: ['nettside'], clicks: 3, impressions: 10, ctr: 0.3, position: 8 }] };
  } else {
   assert.ok(url.startsWith('https://analyticsdata.googleapis.com/v1beta/properties/123:runReport'));
   const body = JSON.parse(options.body);
   assert.deepEqual(body.dimensionFilter.filter.inListFilter.values, ['tk-design.no', 'www.tk-design.no']);
   data = { rows: noRows ? [] : [{ dimensionValues: [{ value: '/' }], metricValues: [{ value: '5' }, { value: '7' }, { value: '9' }] }] };
  }
  return { ok: true, status: 200, json: async () => data };
 };
 return { calls, fetcher };
}
test('missing credentials never make network calls or show active/zero measurements', async () => {
 let called = false;
 const result = await readGoogleSources({ env: {}, fetcher: async () => { called = true; } });
 assert.equal(called, false); assert.equal(result.analytics.status, 'unconfigured'); assert.equal(result.searchConsole.data, undefined);
});
test('Google success uses read-only scopes, fixed TK-design targets and independent reports without leaking tokens', async () => {
 const f = fixture(); const result = await readGoogleSources({ env, fetcher: f.fetcher });
 assert.equal(result.analytics.status, 'active'); assert.equal(result.searchConsole.status, 'active');
 assert.equal(result.analytics.data.sessions, 7); assert.equal(result.searchConsole.data.clicks, 3);
 assert.ok(!JSON.stringify(result).includes('unit-only-token')); assert.ok(!JSON.stringify(result).includes('PRIVATE KEY'));
 assert.equal(f.calls.length, 9);
});
test('Search Console denial retains confirmed Analytics and does not manufacture search measurements', async () => {
 const f = fixture({ deniedSearch: true }); const result = await readGoogleSources({ env, fetcher: f.fetcher });
 assert.equal(result.analytics.status, 'active'); assert.equal(result.searchConsole.status, 'error'); assert.equal(result.searchConsole.data, undefined);
});
test('confirmed empty Google reports are distinct from denied or unconfigured reports', async () => {
 const f = fixture({ noRows: true }); const result = await readGoogleSources({ env, fetcher: f.fetcher });
 assert.equal(result.analytics.status, 'active'); assert.equal(result.analytics.data.sessions, 0); assert.deepEqual(result.searchConsole.data.queries, []);
});
test('a disabled API produces a precise activation step without exposing the Google error body', async () => {
 const f = fixture({ disabledSearch: true }); const result = await readGoogleSources({ env, fetcher: f.fetcher });
 assert.equal(result.analytics.status, 'active'); assert.equal(result.searchConsole.code, 'api_disabled');
 assert.ok(result.searchConsole.message.includes('Google Search Console API')); assert.ok(!JSON.stringify(result).includes('Provider raw content'));
});
test('a foreign Search Console property is refused before accessing its Google API', async () => {
 const f = fixture(); const result = await readGoogleSources({ env: { ...env, GSC_SITE_URL: 'https://other.no/' }, fetcher: f.fetcher });
 assert.equal(result.searchConsole.status, 'unconfigured'); assert.ok(f.calls.every(c => !c.url.includes('webmasters')));
});
test('the Google bridge requires the existing shared server key before returning any configuration', async () => {
 const routes = {}; const secret = 'test-only-google-connection-1234567890';
 process.env.MARKETING_AGENT_SECRET = secret;
 const app = { get: (path, ...handlers) => { routes[path] = handlers; }, post() {} };
 installMarketingAgentRoutes(app, { publishers: {}, hasFirebaseServerCredentials: () => false, getAdminInstance() {} });
 async function invoke(token) {
  const res = { code: 200, setHeader() {}, status(n) { this.code = n; return this; }, json(data) { this.data = data; return this; } };
  let passed = false; const handlers = routes['/api/marketing-agent/google'];
  handlers[0]({ headers: { authorization: 'Bearer ' + token } }, res, () => { passed = true; });
  if (passed) await handlers[1]({}, res);
  return res;
 }
 assert.equal((await invoke('wrong-key')).code, 401);
 const result = await invoke(secret); assert.equal(result.data.success, true); assert.equal(result.data.analytics.status, 'unconfigured');
 assert.ok(!JSON.stringify(result.data).includes(secret));
});
