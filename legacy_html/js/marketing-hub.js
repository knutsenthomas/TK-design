'use strict';
const crypto = require('node:crypto');
const projectId = 'hub-tk-design';
const ownerEmail = 'thomas@tk-design.no';
const workspacePath = 'workspaces/tk-design';
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
function createHubConnection({ getAdminInstance, env = process.env, getHubDb }) {
 let database = null;
 function db() {
  if (getHubDb) return getHubDb();
  if (database) return database;
  const credential = getAdminInstance()?.options?.credential;
  if (!credential?.getAccessToken) throw Error('credentials_missing');
  const admin = require('firebase-admin');
  const app = admin.apps.find(a => a.name === 'tk-marketing-hub-workspace') ||
   admin.initializeApp({ projectId, credential }, 'tk-marketing-hub-workspace');
  database = admin.firestore(app);
  return database;
 }
 const workspace = database => database.collection('workspaces').doc('tk-design');
 const sourceKey = id => crypto.createHash('sha256').update('tk-markedsagent:' + id).digest('hex');
 function statusFailure(error) {
  const permission = [7, 'permission-denied'].includes(error.code) || error.message === 'permission_denied';
  const code = permission ? 'permission_denied' : ['hub_workspace_missing', 'credentials_missing', 'hub_capacity'].includes(error.message) ? error.message : 'hub_unavailable';
  return { success: false, connected: false, code, projectId, ownerEmail, workspacePath,
   serviceAccountEmail: String(env.TK_FIREBASE_CLIENT_EMAIL || ''),
   error: code === 'permission_denied' ? 'Serverkontoen mangler tilgang til hubbens Firebase-prosjekt.'
    : code === 'hub_workspace_missing' ? 'Fant ikke det eksisterende TK-design-arbeidsområdet. Ingen alternativ kundedatabase er opprettet.'
    : code === 'credentials_missing' ? 'Serverkontoen for Firebase er ikke konfigurert.'
    : code === 'hub_capacity' ? 'Hubben har nådd kundegrensen. Kandidatene beholdes i Markedsagenten.'
    : 'Hubben er utilgjengelig. Kandidatene beholdes i Markedsagenten.' };
 }
 function customers(clients) {
  return clients.map(c => ({ id: String(c.id || ''), title: String(c.name || '').slice(0,160),
   email: String(c.email || '').slice(0,160), url: String(c.website || '').slice(0,500), status: String(c.status || '') }));
 }
 async function snapshot(database) {
  const ws = workspace(database);
  return database.runTransaction(async tx => {
   const meta = await tx.get(ws);
   if (!meta.exists || !Number.isInteger(meta.data()?.revision)) throw Error('hub_workspace_missing');
   const list = await tx.get(ws.collection('clients'));
   return { revision: meta.data().revision, clients: list.docs.map(d => ({ ...d.data(), id: d.id })) };
  });
 }
 async function read() {
  try {
   const state = await snapshot(db());
   return { success: true, connected: true, projectId, ownerEmail, workspacePath,
    checkedAt: new Date().toISOString(), revision: state.revision,
    customers: customers(state.clients), total: state.clients.length };
  } catch (error) { return statusFailure(error); }
 }
 async function sync(input) {
  let candidates;
  try { candidates = validateCandidates(input); }
  catch { return { success: false, connected: false, code: 'invalid_candidates', error: 'Ugyldige kandidater.' }; }
  try {
   const database = db(), ws = workspace(database);
   const result = await database.runTransaction(async tx => {
    const meta = await tx.get(ws);
    if (!meta.exists || !Number.isInteger(meta.data()?.revision)) throw Error('hub_workspace_missing');
    const list = await tx.get(ws.collection('clients'));
    const receiptRefs = candidates.map(c => ws.collection('marketingAgentReceipts').doc(sourceKey(c.id)));
    const receiptDocs = await Promise.all(receiptRefs.map(ref => tx.get(ref)));
    const receipts = Object.fromEntries(receiptDocs.filter(d => d.exists).map(d => [d.id, d.data()]));
    const existing = list.docs.map(d => ({ ...d.data(), id: d.id }));
    const checkedAt = new Date().toISOString(), plan = planTransfer(existing, receipts, candidates, checkedAt);
    if (plan.clients.length > 400) throw Error('hub_capacity');
    const additions = plan.clients.slice(existing.length);
    // Existing client documents are never written. A concurrent Hub save sees a new revision.
    for (const client of additions) tx.set(ws.collection('clients').doc(client.id), client);
    for (const [key, receipt] of Object.entries(plan.receipts)) {
     if (!receipts[key]) tx.set(ws.collection('marketingAgentReceipts').doc(key), receipt);
    }
    if (additions.length) tx.update(ws, { revision: meta.data().revision + 1, updatedAt: checkedAt, updatedBy: 'TK-design Markedsagent' });
    return { checkedAt, added: additions.length, results: plan.results, original: list.docs.map(d => ({id:d.id, data:d.data()})) };
   });
   const verified = await snapshot(database);
   const verifiedReceipts = await Promise.all(candidates.map(c => ws.collection('marketingAgentReceipts').doc(sourceKey(c.id)).get()));
   const receiptMap = new Map(verifiedReceipts.filter(d => d.exists).map(d => [d.id, d.data()]));
   if (result.results.some(r => ['imported','already_imported'].includes(r.status) &&
    (!receiptMap.has(sourceKey(r.sourceId)) || !verified.clients.some(c => c.id === r.clientId)))) throw Error('hub_unavailable');
   // Report whether the original clients remain unchanged, without restoring/overwriting concurrent user edits.
   const originalAfter = await Promise.all(result.original.map(c => ws.collection('clients').doc(c.id).get()));
   const preserved = result.original.every((c,i) => originalAfter[i].exists && JSON.stringify(originalAfter[i].data()) === JSON.stringify(c.data));
   return { success: true, connected: true, checkedAt: result.checkedAt, projectId, ownerEmail, workspacePath,
    revision: verified.revision, added: result.added, results: result.results, existingPreserved: preserved,
    customers: customers(verified.clients), total: verified.clients.length };
  } catch (error) { return statusFailure(error); }
 }
 return { read, sync };
}
module.exports = { createHubConnection, planTransfer, validateCandidates, encode, decode };
