'use strict';
const test=require('node:test'); const assert=require('node:assert/strict');
const { createHubConnection, planTransfer, validateCandidates, encode, decode }=require('../js/marketing-hub');
const lead={id:'agent-lead-1',title:'Lokalt Bygg AS',segment:'Bygg og håndverk',status:'Ny',email:'',url:'https://lokalt.no/',notes:'Observasjon, kilde og kontaktutkast.'};
const oldClient={id:'customer-1',name:'Eksisterende kunde',email:'kunde@example.no',status:'Aktiv',website:'https://example.no/',revenue:'50 000',timeline:[{at:'tidligere'}]};
function fixture({ denied=false, race=false, uncertain=false }={}){
 let credentialCalls=0,patches=0,reads=0;
 let document={updateTime:'2026-10-12T12:00:00Z',fields:{clients:encode([oldClient]),projects:encode([{id:'project-1'}]),marketingAgentReceipts:encode({})}};
 // Unknown typed values in existing clients must survive byte-for-byte.
 document.fields.clients.arrayValue.values[0].mapValue.fields.registeredAt={timestampValue:'2020-01-01T00:00:00Z'};
 const original=structuredClone(document);
 const connection=createHubConnection({env:{TK_FIREBASE_CLIENT_EMAIL:'unit@test.iam.gserviceaccount.com'},getAdminInstance:()=>({options:{credential:{getAccessToken:async()=>{credentialCalls++;return {access_token:'test-only-token'};}}}}),fetcher:async(url,options)=>{
  assert.equal(options.redirect,'manual'); assert.equal(options.headers.Authorization,'Bearer test-only-token');
  assert.ok(String(url).startsWith('https://firestore.googleapis.com/v1/projects/hub-tk-design/databases/(default)/documents/users/thomas%40tk-design.no/data/hub_state'));
  if(denied)return {ok:false,status:403};
  if(options.method==='PATCH'){
   patches++; const parsed=new URL(url);assert.deepEqual(parsed.searchParams.getAll('updateMask.fieldPaths'),['clients','marketingAgentReceipts']);assert.equal(parsed.searchParams.get('currentDocument.updateTime'),document.updateTime);
   if(race&&patches===1){document.fields.clients.arrayValue.values.push(encode({id:'concurrent',name:'Samtidig lagret kunde',status:'Aktiv'}));document.updateTime='2026-10-12T12:00:01Z';return {ok:false,status:412};}
   const body=JSON.parse(options.body);Object.assign(document.fields,body.fields);document.updateTime='2026-10-12T12:00:02Z';
   if(uncertain)throw Error('transport failed after persistence');
  }else reads++;
  return {ok:true,status:200,json:async()=>structuredClone(document)};
 }});
 return {connection,original,state:()=>({document,patches,reads,credentialCalls})};
}
test('blocked candidates, existing customers and existing source IDs never create another client',()=>{
 const candidates=validateCandidates([lead,{...lead,id:'blocked',status:'Ikke kontakt'},{...lead,id:'closed',status:'Avsluttet'},{...lead,id:'known',title:'Kudos Regnskap'},{...lead,id:'same-email',title:'Annet navn',email:'KUNDE@example.no'}]);
 const result=planTransfer([oldClient],{},candidates,'2026-10-12');assert.equal(result.clients.length,2);assert.deepEqual(result.results.map(r=>r.status),['imported','excluded','excluded','excluded','existing']);
 const again=planTransfer(result.clients,result.receipts,candidates,'2026-10-13');assert.equal(again.clients.length,2);assert.equal(again.results[0].status,'already_imported');
});
test('real transfer uses a precondition, preserves existing typed data and unrelated fields, then reads back',async()=>{
 const f=fixture();const r=await f.connection.sync([lead]);assert.equal(r.success,true);assert.equal(r.added,1);
 assert.deepEqual(f.state().document.fields.clients.arrayValue.values[0],f.original.fields.clients.arrayValue.values[0]);assert.deepEqual(f.state().document.fields.projects,f.original.fields.projects);
 const clients=decode(f.state().document.fields.clients);assert.equal(clients[1].status,'Lead');assert.equal(clients[1].contactPerson,'');assert.ok(clients[1].notes.includes(lead.notes));assert.ok(!JSON.stringify(r).includes('test-only-token'));
 const again=await f.connection.sync([lead]);assert.equal(again.added,0);assert.equal(f.state().patches,1);
});
test('a concurrent hub edit causes a fresh read; the added client survives the retry',async()=>{
 const f=fixture({race:true});const r=await f.connection.sync([lead]);assert.equal(r.success,true);assert.equal(f.state().patches,2);assert.equal(r.total,3);assert.ok(r.customers.some(c=>c.id==='concurrent'));
});
test('uncertain persistence stays unconfirmed; a later sync verifies the existing source ID without another write',async()=>{
 const f=fixture({uncertain:true});const r=await f.connection.sync([lead]);assert.equal(r.success,false);
 const next=await f.connection.sync([lead]);assert.equal(next.success,true);assert.equal(next.added,0);assert.equal(f.state().patches,1);
});
test('permission denial and malformed candidates never modify hub data',async()=>{
 const f=fixture({denied:true});const r=await f.connection.sync([lead]);assert.equal(r.code,'permission_denied');assert.equal(r.connected,false);assert.equal(f.state().patches,0);
 const bad=await f.connection.sync([{...lead,url:'https://user:password@example.no/'}]);assert.equal(bad.code,'invalid_candidates');assert.equal(f.state().credentialCalls,1);
});
