'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const { installMarketingAgentRoutes, validatePublishInput } = require('../js/marketing-agent');
const secret='test-only-placeholder-connection-123456789';
const input={requestId:'run-1',recordId:'record-1',text:'Et kontrollert innlegg.',title:'Tittel',link:'https://tk-design.no/',imageUrl:'https://tk-design.no/img/test.jpg',targets:['facebook','instagram','linkedin']};

function setup(publishers,options={}) {
 process.env.MARKETING_AGENT_SECRET=secret;
 process.env.FB_PAGE_ID='test-page';process.env.FB_PAGE_ACCESS_TOKEN='test-only-provider-token';
 process.env.INSTAGRAM_ACCOUNT_ID='test-ig';process.env.LINKEDIN_ORGANIZATION_ID='test-org';process.env.LINKEDIN_ACCESS_TOKEN='test-only-provider-token';
 const routes={};const docs=new Map();
 const app={get:(path,...handlers)=>{routes.GET=handlers;},post:(path,...handlers)=>{routes.POST=handlers;}};
 const collection={doc:id=>({async create(data){if(docs.has(id)){const e=Error('already exists');e.code=6;throw e;}docs.set(id,structuredClone(data));},async get(){return {exists:docs.has(id),data:()=>structuredClone(docs.get(id))};},async set(data){docs.set(id,structuredClone(data));}})};
 installMarketingAgentRoutes(app,{publishers,hasFirebaseServerCredentials:()=>options.storage!==false,getAdminInstance:()=>({firestore:()=>({collection:()=>collection})})});
 return {docs,async invoke(method,body=input,token=secret,query={}){
  const req={headers:{authorization:'Bearer '+token},body,query};const res={code:200,status(n){this.code=n;return this;},setHeader(){},json(data){this.data=data;return this;}};
  let authenticated=false;routes[method][0](req,res,()=>{authenticated=true;});if(authenticated)await routes[method][1](req,res);return res;
 }};
}
test('missing/wrong secret blocks publication; valid secret allows a bounded connection read',async()=>{
 let calls=0;const s=setup({facebook:async()=>{calls++;}});
 assert.equal((await s.invoke('POST',input,'incorrect')).code,401);
 process.env.MARKETING_AGENT_SECRET='';assert.equal((await s.invoke('POST')).code,503);assert.equal(calls,0);
 process.env.MARKETING_AGENT_SECRET=secret;const r=await s.invoke('GET');assert.equal(r.data.channels.length,3);assert.equal(r.data.verified,false);assert.ok(!JSON.stringify(r.data).includes(secret));
});
test('strict platforms, public HTTPS URLs and Instagram media are validated',()=>{
 assert.throws(()=>validatePublishInput({...input,targets:['unknown']}));
 assert.throws(()=>validatePublishInput({...input,targets:['facebook','facebook']}));
 assert.throws(()=>validatePublishInput({...input,imageUrl:''}));
 for(const url of ['http://example.com/image.jpg','https://localhost/image.jpg','https://127.0.0.1/a','https://user:pass@example.com/a'])assert.throws(()=>validatePublishInput({...input,imageUrl:url}));
 assert.equal(validatePublishInput(input).text,input.text);
});
test('persisted duplicate IDs do not resend; changed contents with same ID conflict',async()=>{
 let calls=0;const publisher=async()=>{calls++;return {ok:true,id:'confirmed'};};const s=setup({facebook:publisher,instagram:publisher,linkedin:publisher});
 assert.equal((await s.invoke('POST')).data.run.status,'published');
 assert.equal((await s.invoke('POST')).data.replay,true);assert.equal(calls,3);
 assert.equal((await s.invoke('POST',{...input,text:'Changed'})).code,409);assert.equal(calls,3);
});
test('parallel duplicate claims publish once',async()=>{
 let calls=0;const publisher=async()=>{calls++;await Promise.resolve();return {ok:true,id:'confirmed'};};const s=setup({facebook:publisher,instagram:publisher,linkedin:publisher});
 await Promise.all([s.invoke('POST'),s.invoke('POST')]);assert.equal(calls,3);
});
test('partial success and uncertain delivery stay separate; raw provider errors never escape',async()=>{
 const s=setup({facebook:async()=>({ok:true,id:'FB-confirmed'}),instagram:async()=>({ok:true}),linkedin:async()=>{throw Error('test-only-provider-token');}});
 const r=await s.invoke('POST');assert.equal(r.data.run.status,'partially_published');
 assert.deepEqual(r.data.run.results.map(x=>x.status),['published','unknown','unknown']);assert.ok(!JSON.stringify(r.data).includes('test-only-provider-token'));
 const read=await s.invoke('GET',input,secret,{requestId:'run-1'});assert.equal(read.data.run.results[0].postId,'FB-confirmed');
});
test('storage unavailable means no outbound publishing call',async()=>{
 let calls=0;const s=setup({facebook:async()=>{calls++;}},{storage:false});assert.equal((await s.invoke('POST')).code,503);assert.equal(calls,0);
});

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
