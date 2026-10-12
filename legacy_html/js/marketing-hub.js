'use strict';
const crypto = require('node:crypto');
const projectId = 'hub-tk-design';
const ownerEmail = 'thomas@tk-design.no';
const documentUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${encodeURIComponent(ownerEmail)}/data/hub_state`;
const segments = ['Regnskap', 'Menigheter', 'Bygg og håndverk', 'Andre små og mellomstore bedrifter'];
const normalize = value => String(value || '').normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ');
const normalizeUrl = value => { try { const u = new URL(value); return u.hostname.replace(/^www\./, '') + u.pathname.replace(/\/+$/, ''); } catch { return ''; } };
function encode(value) {
 if (value === null) return { nullValue: null };
 if (typeof value === 'string') return { stringValue: value };
 if (typeof value === 'boolean') return { booleanValue: value };
 if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
 if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
 return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, encode(v)])) } };
}
function decode(value) {
 if (!value) return null;
 if ('stringValue' in value) return value.stringValue;
 if ('integerValue' in value) return Number(value.integerValue);
 if ('doubleValue' in value) return value.doubleValue;
 if ('booleanValue' in value) return value.booleanValue;
 if ('arrayValue' in value) return (value.arrayValue.values || []).map(decode);
 if ('mapValue' in value) return Object.fromEntries(Object.entries(value.mapValue.fields || {}).map(([k, v]) => [k, decode(v)]));
 return null;
}
function validateCandidates(value) {
 if (!Array.isArray(value) || value.length > 100) throw Error('invalid_candidates');
 return value.map(v => {
  if (!v || typeof v.id !== 'string' || !/^[a-zA-Z0-9_-]{1,160}$/.test(v.id) || typeof v.title !== 'string' || !v.title.trim() || v.title.length > 160 || typeof v.notes !== 'string' || v.notes.length > 10000 || typeof v.status !== 'string' || !segments.includes(v.segment)) throw Error('invalid_candidates');
  if (typeof v.url !== 'string' || v.url.length > 500 || !/^https?:\/\//.test(v.url)) throw Error('invalid_candidates');
  const url = new URL(v.url); if (url.username || url.password) throw Error('invalid_candidates');
  if (typeof v.email !== 'string' || v.email.length > 160 || (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))) throw Error('invalid_candidates');
  return { id: v.id, title: v.title.trim(), notes: v.notes, status: v.status, segment: v.segment, url: url.href, email: v.email };
 });
}
function planTransfer(existing, receipts, candidates, now) {
 const clients = [...existing]; const results = []; const nextReceipts = { ...receipts };
 for (const c of candidates) {
  const key = crypto.createHash('sha256').update('tk-markedsagent:' + c.id).digest('hex');
  if (['Ikke kontakt', 'Avsluttet', 'Vunnet'].includes(c.status) || /kudos\s*regnskap|mandal\s*regnskapskontor/i.test(c.title)) { results.push({ sourceId: c.id, status: 'excluded' }); continue; }
  if (receipts[key]) { results.push({ sourceId: c.id, status: receipts[key].status === 'imported' ? 'already_imported' : receipts[key].status, clientId: receipts[key].clientId || '' }); continue; }
  const duplicate = clients.find(x => x.id === 'agent-' + key || normalize(x.name) === normalize(c.title) || (c.email && normalize(x.email) === normalize(c.email)) || (normalizeUrl(x.website) && normalizeUrl(x.website) === normalizeUrl(c.url)));
  if (duplicate) { nextReceipts[key] = { status: 'existing', clientId: duplicate.id, sourceId: c.id, at: now }; results.push({ sourceId: c.id, status: 'existing', clientId: duplicate.id }); continue; }
  const client = { id: 'agent-' + key, name: c.title, industry: c.segment, contactPerson: '', email: c.email, status: 'Lead', totalProjects: 0, revenue: '0', lastActive: now.slice(0, 10), website: c.url, notes: c.notes + '\n\nAutomatisk overført fra TK-design Markedsagent. Behov og kjøpsinteresse er ikke bekreftet.', customerType: 'Bedrift', marketingAgentSourceId: c.id, marketingAgentImportedAt: now };
  clients.push(client); nextReceipts[key] = { status: 'imported', clientId: client.id, sourceId: c.id, at: now }; results.push({ sourceId: c.id, status: 'imported', clientId: client.id });
 }
 return { clients, receipts: nextReceipts, results };
}
function createHubConnection({ getAdminInstance, env = process.env, fetcher = globalThis.fetch }) {
 async function token() {
  const credential = getAdminInstance()?.options?.credential;
  if (!credential?.getAccessToken) throw Error('credentials_missing');
  const value = await credential.getAccessToken();
  if (typeof value?.access_token !== 'string') throw Error('credentials_missing');
  return value.access_token;
 }
 async function call(accessToken, url, options = {}) {
  const response = await fetcher(url, { ...options, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + accessToken }, redirect: 'manual', signal: AbortSignal.timeout(15000) });
  if (!response.ok) {
   const error = Error(response.status === 403 ? 'permission_denied' : response.status === 404 ? 'hub_account_missing' : [409, 412].includes(response.status) ? 'conflict' : 'hub_unavailable');
   throw error;
  }
  return response.json();
 }
 function statusFailure(error) {
  const code = ['permission_denied', 'hub_account_missing', 'credentials_missing'].includes(error.message) ? error.message : 'hub_unavailable';
  return { success: false, connected: false, code, projectId, ownerEmail, serviceAccountEmail: String(env.TK_FIREBASE_CLIENT_EMAIL || ''), error: code === 'permission_denied' ? 'Serverkontoen mangler tilgang til hubbens Firebase-prosjekt.' : code === 'hub_account_missing' ? 'Fant ikke hubbens lagrede kundedata for thomas@tk-design.no.' : code === 'credentials_missing' ? 'Serverkontoen for Firebase er ikke konfigurert.' : 'Hubben er utilgjengelig. Kandidatene beholdes i markedsagenten.' };
 }
 const project = document => {
  const clients = decode(document.fields?.clients) || [];
  if (!Array.isArray(clients)) throw Error('hub_unavailable');
  return { clients, receipts: decode(document.fields?.marketingAgentReceipts) || {} };
 };
 async function read() {
  try {
   const document = await call(await token(), documentUrl); const { clients } = project(document);
   return { success: true, connected: true, projectId, ownerEmail, checkedAt: new Date().toISOString(), customers: clients.map(c => ({ id: String(c.id || ''), title: String(c.name || '').slice(0, 160), email: String(c.email || '').slice(0, 160), url: String(c.website || '').slice(0, 500), status: String(c.status || '') })), total: clients.length };
  } catch (error) { return statusFailure(error); }
 }
 async function sync(input) {
  let candidates; try { candidates = validateCandidates(input); } catch { return { success: false, connected: false, code: 'invalid_candidates', error: 'Ugyldige kandidater.' }; }
  try {
   const accessToken = await token();
   for (let attempt = 0; attempt < 3; attempt++) {
    const document = await call(accessToken, documentUrl); const { clients, receipts } = project(document);
    const checkedAt = new Date().toISOString(); const plan = planTransfer(clients, receipts, candidates, checkedAt);
    if (JSON.stringify(plan.clients) !== JSON.stringify(clients) || JSON.stringify(plan.receipts) !== JSON.stringify(receipts)) {
     if (typeof document.updateTime !== 'string') throw Error('hub_unavailable');
     const url = new URL(documentUrl); url.searchParams.append('updateMask.fieldPaths', 'clients'); url.searchParams.append('updateMask.fieldPaths', 'marketingAgentReceipts'); url.searchParams.set('currentDocument.updateTime', document.updateTime);
     try { await call(accessToken, url.href, { method: 'PATCH', body: JSON.stringify({ fields: { clients: { arrayValue: { values: [...(document.fields?.clients?.arrayValue?.values || []), ...plan.clients.slice(clients.length).map(encode)] } }, marketingAgentReceipts: encode(plan.receipts) } }) }); }
     catch (error) { if (error.message === 'conflict' && attempt < 2) continue; throw error; }
    }
    // Confirm persisted IDs before reporting any successful transfer.
    const verified = project(await call(accessToken, documentUrl));
    if (plan.results.some(r => r.status === 'imported' && (!verified.receipts[crypto.createHash('sha256').update('tk-markedsagent:' + r.sourceId).digest('hex')] || !verified.clients.some(c => c.id === r.clientId)))) throw Error('hub_unavailable');
    return { success: true, connected: true, checkedAt, projectId, ownerEmail, added: plan.clients.length - clients.length, results: plan.results, customers: verified.clients.map(c => ({ id: String(c.id || ''), title: String(c.name || '').slice(0, 160), email: String(c.email || '').slice(0, 160), url: String(c.website || '').slice(0, 500), status: String(c.status || '') })), total: verified.clients.length };
   }
  } catch (error) { return statusFailure(error); }
 }
 return { read, sync };
}
module.exports = { createHubConnection, planTransfer, validateCandidates, encode, decode };
