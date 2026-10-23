'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const express = require('express');
const { createAdminGuard, isAdministrator, privatePlannerFile } = require('../js/admin-security');
const env = { TK_ADMIN_EMAILS: 'thomas@tk-design.no,knutsenthomas@gmail.com', ADMIN_SECRET: 'test-only-admin-secret' };
const owner = { uid: 'owner', email: 'Thomas@TK-design.no', email_verified: true, firebase: { sign_in_provider: 'google.com' } };
function guardFor(token, options = {}) {
  return createAdminGuard({ env: options.env || env, hasFirebaseServerCredentials: () => options.credentials !== false, getAdminInstance: () => ({ auth: () => ({ verifyIdToken: async (_token, checkRevoked) => { assert.equal(checkRevoked, true); if (token instanceof Error) throw token; return token; } }) }) });
}
function response() { return { code: 200, headers: {}, setHeader(k,v) { this.headers[k]=v; }, status(n) { this.code=n; return this; }, json(v) { this.body=v; return this; } }; }
test('verified owners and trusted admin claims pass; ordinary and spoofed identities fail', () => {
  assert.equal(isAdministrator(owner, env), true);
  assert.equal(isAdministrator({ ...owner, email: 'knutsenthomas@gmail.com' }, env), true);
  for (const token of [{ ...owner, email_verified: false }, { ...owner, email: 'other@example.invalid' }, { ...owner, admin: 'true', email: 'other@example.invalid' }, { ...owner, firebase: { sign_in_provider: 'anonymous' } }]) assert.equal(isAdministrator(token, env), false);
  assert.equal(isAdministrator({ ...owner, email: 'other@example.invalid', admin: true }, env), true);
  assert.equal(isAdministrator(owner, {}), false);
});
test('host and forwarded headers never bypass authentication; expired and nonadmin tokens fail closed', async () => {
  for (const credentials of [true,false]) {
    let allowed=false;const res=response();
    await guardFor(owner, { credentials })({ headers: { host: 'localhost', 'x-forwarded-for': '127.0.0.1' }, hostname:'localhost', socket: { remoteAddress:'127.0.0.1' } },res,()=>allowed=true);
    assert.equal(res.code,401); assert.equal(allowed,false);
  }
  for (const [token, code] of [[new Error('expired'),401],[{uid:'ordinary',email:'other@example.invalid',email_verified:true},403]]) {
    let allowed=false;const res=response();await guardFor(token)({headers:{authorization:'Bearer test-token'}},res,()=>allowed=true);
    assert.equal(res.code,code);assert.equal(allowed,false);
  }
});
test('authorized requests and existing service-secret headers work; repeated middleware verifies once', async () => {
  let calls=0; const guard=createAdminGuard({env,hasFirebaseServerCredentials:()=>true,getAdminInstance:()=>({auth:()=>({verifyIdToken:async()=>{calls++;return owner;}})})});
  const req={headers:{authorization:'Bearer test-token'}},res=response();let next=0;
  await guard(req,res,()=>next++);await guard(req,res,()=>next++);
  assert.equal(calls,1);assert.equal(next,2);assert.equal(res.headers['Cache-Control'],'private, no-store');
  let allowed=false;await guardFor(owner)({headers:{'x-admin-secret':env.ADMIN_SECRET}},response(),()=>allowed=true);assert.equal(allowed,true);
  allowed=false;await guardFor(owner,{credentials:false})({headers:{authorization:'Bearer '+env.ADMIN_SECRET}},response(),()=>allowed=true);assert.equal(allowed,true);
});
test('private planner representations are blocked while public posts and SEO files remain public', () => {
  for (const path of ['/data/social_planner.json','/data/%73ocial_planner.json','/public/data/social_planner.json','/data/SOCIAL_PLANNER.JSON','/data/../data/social_planner.json']) assert.equal(privatePlannerFile(path),true);
  for (const path of ['/data/posts.json','/data/seo.json','/js/documents.js']) assert.equal(privatePlannerFile(path),false);
});
test('actual Express prefix boundary blocks every admin method before its handler', async () => {
  const app=express(),source=fs.readFileSync(require.resolve('../server.js'),'utf8');
  const registration=source.match(/app\.use\(\s*\[\s*["']\/api\/debug-env["'][\s\S]*?\]\s*,\s*verifyAdminToken\s*,?\s*\);/)[0];
  vm.runInNewContext(registration,{app,verifyAdminToken:guardFor(owner)});
  let mutations=0;
  for (const route of ['/api/messages/item','/api/social-planner/settings','/api/social/autopost','/api/analytics','/api/debug-env','/api/unsplash/search']) app.all(route,(_req,res)=>{mutations++;res.json({ok:true});});
  app.get('/api/posts',(_req,res)=>res.json([]));app.post('/api/contact',(_req,res)=>res.json({ok:true}));
  const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  try {
    for (const method of ['GET','HEAD','POST','PUT','PATCH','DELETE']) for (const route of ['/api/messages/item','/api/social-planner/settings','/api/social/autopost','/api/analytics','/api/debug-env','/api/unsplash/search']) {
      const res=await fetch(base+route,{method});assert.equal(res.status,401,method+' '+route);await res.arrayBuffer();
    }
    assert.equal(mutations,0);
    assert.equal((await fetch(base+'/api/posts')).status,200);
    assert.equal((await fetch(base+'/api/contact',{method:'POST'})).status,200);
    assert.equal((await fetch(base+'/api/messages/item',{headers:{Authorization:'Bearer owner-test'}})).status,200);
    assert.equal(mutations,1);
  } finally { await new Promise(resolve=>server.close(resolve)); }
});
test('admin browser sends a token only to its own API, preserving caller headers and Request input', async () => {
  const source=fs.readFileSync(require.resolve('../public/admin/app.js'),'utf8'), wrapper=source.slice(0,source.indexOf('\nfunction getAdminApiUrl'));
  const sent=[],window={location:{href:'https://www.tk-design.no/admin/'},firebaseAuth:{currentUser:{getIdToken:async()=>'test-only-token'}},fetch:async(resource,options)=>sent.push({resource,options})};
  vm.runInNewContext(wrapper,{window,URL,Headers,Request,console,getAdminApiUrl:()=>'/api'});
  await window.fetch('/api/messages',{headers:{'X-Example':'keep'}});
  assert.equal(sent[0].options.headers.get('Authorization'),'Bearer test-only-token');assert.equal(sent[0].options.headers.get('X-Example'),'keep');
  for (const url of ['https://other.example.invalid/api/messages','https://www.tk-design.no.evil.invalid/api/messages','/apiary/messages']) {await window.fetch(url);assert.equal(sent.at(-1).options.headers,undefined);}
  await window.fetch(new Request('https://www.tk-design.no/api/messages',{headers:{'X-Example':'request'}}));
  assert.equal(sent.at(-1).options.headers.get('X-Example'),'request');
});
