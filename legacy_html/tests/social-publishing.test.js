'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const createSocialPublishing = require('../server/social-publishing');
const source = fs.readFileSync(require.resolve('../server.js'), 'utf8') + fs.readFileSync(require.resolve('../server/social-publishing'), 'utf8');
function extractFunction(name) { return createSocialPublishing({})[name].toString(); }
function providerContext(responses) {
 let calls = 0;
 Object.assign(process.env, { FB_PAGE_ID: 'page', FB_PAGE_ACCESS_TOKEN: 'test-token', INSTAGRAM_ACCOUNT_ID: 'ig', LINKEDIN_ORGANIZATION_ID: 'org', LINKEDIN_ACCESS_TOKEN: 'test-token' });
 const context = createSocialPublishing({ getFetch: async () => async () => {
  const r = responses[calls++];
  return { ok: r.ok, json: async () => r.data, text: async () => '', headers: { get: name => name === 'x-restli-id' ? r.id : null } };
 } });
 return { context, count: () => calls };
}
test('Facebook rejects failed HTTP and missing provider IDs; environment credentials remain supported',async()=>{
 for(const response of [{ok:false,data:{}},{ok:true,data:{}}]){const p=providerContext([response]);assert.equal((await p.context.publishToFacebookPageApi({message:'test'})).ok,false);}
 const p=providerContext([{ok:true,data:{id:'post'}}]);assert.equal((await p.context.publishToFacebookPageApi({message:'test'})).id,'post');
});
test('Instagram container failure prevents a publish call; valid container and post work',async()=>{
 const p=providerContext([{ok:true,data:{}}]);assert.equal((await p.context.publishToInstagramApi({caption:'test',imageUrl:'https://example.com/a.jpg'})).ok,false);assert.equal(p.count(),1);
 const good=providerContext([{ok:true,data:{id:'container'}},{ok:true,data:{id:'post'}}]);assert.equal((await good.context.publishToInstagramApi({caption:'test',imageUrl:'https://example.com/a.jpg'})).id,'post');
});
test('LinkedIn uses the documented response ID header and rejects an absent ID',async()=>{
 const p=providerContext([{ok:true,data:{},id:'urn:li:share:1'}]);assert.equal((await p.context.publishToLinkedInCompanyApi({text:'test'})).id,'urn:li:share:1');
 const bad=providerContext([{ok:true,data:{}}]);assert.equal((await bad.context.publishToLinkedInCompanyApi({text:'test'})).ok,false);
});
test('no source credential fallback and no simulated publication transitions survive',()=>{
 assert.ok(!/process\.env\.FB_PAGE_ACCESS_TOKEN\s*\|\|\s*'[^']+'/.test(source));
 const helper=extractFunction('postPayloadToSocialWebhook');assert.ok(!/sent:\s*true,\s*simulated:\s*true/.test(helper));
 assert.ok(!extractFunction('publishSocialPlannerEntryById').includes('Publisert lokalt uten koblet konto.'));
});
