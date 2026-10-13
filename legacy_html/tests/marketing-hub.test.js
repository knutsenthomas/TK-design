'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createHubConnection,planTransfer,validateCandidates}=require('../js/marketing-hub');
const lead={id:'lead-1',title:'Lokalt Bygg AS',segment:'Bygg og håndverk',status:'Ny',email:'',url:'https://lokalt.no/',notes:'Verifisert observasjon og kontaktutkast.'};
const existing={id:'customer-1',name:'Eksisterende kunde',email:'kunde@example.no',status:'Ikke kontakt',website:'https://example.no/',contactPerson:'Elin Lende',registeredAt:new Date('2020-01-01'),timeline:[{id:'old-note',text:'Behold dette'}]};
function fixture({missing=false,denied=false,race=false,uncertain=false}={}) {
 const data=new Map(), root='workspaces/tk-design';let calls=0,writes=0,attempts=0;
 if(!missing)data.set(root,{revision:41,settings:{logoUrl:'original-logo'},updatedBy:'Thomas'});
 data.set(root+'/clients/'+existing.id,structuredClone(existing));
 data.set(root+'/projects/project-1',{id:'project-1',name:'Ekte prosjekt',published:true});
 data.set('users/thomas@tk-design.no/data/hub_state',{clients:[{id:'legacy',name:'Eldre arkiv'}]});
 const original=structuredClone([...data]);
 function doc(path){return {path,id:path.split('/').pop(),collection:name=>collection(path+'/'+name),get:async()=>({id:path.split('/').pop(),exists:data.has(path),data:()=>structuredClone(data.get(path))})};}
 function collection(path){return {path,doc:id=>doc(path+'/'+id),get:async()=>({docs:await Promise.all([...data.keys()].filter(k=>k.startsWith(path+'/')&&!k.slice(path.length+1).includes('/')).map(k=>doc(k).get()))})};}
 const database={collection,runTransaction:async callback=>{
  calls++;if(denied)throw Object.assign(Error('forbidden'),{code:7});
  attempts++;const pending=[];
  const result=await callback({get:ref=>ref.get(),set:(ref,value)=>pending.push(()=>data.set(ref.path,structuredClone(value))),update:(ref,value)=>pending.push(()=>data.set(ref.path,{...data.get(ref.path),...structuredClone(value)}))});
  if(race&&attempts===1&&pending.length){
   data.set(root,{...data.get(root),revision:42});
   data.set(root+'/clients/'+existing.id,{...data.get(root+'/clients/'+existing.id),contactPerson:'Manuelt oppdatert'});
   return database.runTransaction(callback);
  }
  for(const write of pending){write();writes++;}
  if(uncertain&&pending.length)throw Error('response lost after commit');
  return result;
 }};
 const connection=createHubConnection({getHubDb:()=>database,env:{}});
 return {data,connection,original,stats:()=>({calls,writes,attempts})};
}
test('blocked candidates and existing name/email/url/source never overwrite a customer',()=>{
 const rows=validateCandidates([lead,{...lead,id:'blocked',status:'Ikke kontakt'},{...lead,id:'closed',status:'Avsluttet'},{...lead,id:'won',status:'Vunnet'},{...lead,id:'kudos',title:'Kudos Regnskap AS'},{...lead,id:'mandal',title:'Mandal Regnskapskontor'},{...lead,id:'known',title:'EKsisterende Kunde'},{...lead,id:'email',email:'KUNDE@example.no'}]);
 const p=planTransfer([existing],{},rows,'2026-10-13');
 assert.equal(p.clients.length,2);assert.deepEqual(p.clients[0],existing);
 assert.deepEqual(p.results.map(r=>r.status),['imported','excluded','excluded','excluded','excluded','excluded','existing','existing']);
});
test('transfer writes only new workspace clients, receipts and revision; replay does not write',async()=>{
 const f=fixture(),r=await f.connection.sync([lead]);
 assert.equal(r.success,true);assert.equal(r.workspacePath,'workspaces/tk-design');assert.equal(r.added,1);assert.equal(r.revision,42);assert.equal(r.existingPreserved,true);
 for(const [path,value] of f.original)if(path!=='workspaces/tk-design')assert.deepEqual(f.data.get(path),value);
 assert.deepEqual(f.data.get('workspaces/tk-design').settings,{logoUrl:'original-logo'});
 assert.equal(r.customers.find(c=>c.title===lead.title).status,'Lead');
 const before=f.stats().writes,again=await f.connection.sync([lead]);
 assert.equal(again.added,0);assert.equal(again.results[0].status,'already_imported');assert.equal(f.stats().writes,before);
});
test('a concurrent manual edit survives a fresh transactional attempt',async()=>{
 const f=fixture({race:true}),r=await f.connection.sync([lead]);
 assert.equal(r.success,true);assert.equal(r.revision,43);
 assert.equal(f.data.get('workspaces/tk-design/clients/customer-1').contactPerson,'Manuelt oppdatert');
 assert.equal(r.added,1);assert.equal(r.existingPreserved,true);
});
test('uncertain commit is unconfirmed; replay finds the real receipt without duplication',async()=>{
 const f=fixture({uncertain:true}),first=await f.connection.sync([lead]);
 assert.equal(first.success,false);const writes=f.stats().writes;
 const next=await f.connection.sync([lead]);assert.equal(next.success,true);assert.equal(next.added,0);assert.equal(f.stats().writes,writes);
});
test('missing workspace, permission failure and invalid input never create an alternative database',async()=>{
 for(const options of [{missing:true},{denied:true}]){
  const f=fixture(options),r=await f.connection.sync([lead]);assert.equal(r.success,false);assert.equal(f.stats().writes,0);
  assert.equal(r.code,options.missing?'hub_workspace_missing':'permission_denied');
  assert.deepEqual(f.data.get('users/thomas@tk-design.no/data/hub_state'),{clients:[{id:'legacy',name:'Eldre arkiv'}]});
 }
 const f=fixture(),r=await f.connection.sync([{...lead,url:'https://user:password@example.no/'}]);assert.equal(r.code,'invalid_candidates');assert.equal(f.stats().calls,0);
});
test('workspace capacity blocks excess leads before any writes',async()=>{
 const f=fixture();for(let i=1;i<400;i++)f.data.set('workspaces/tk-design/clients/client-'+i,{id:'client-'+i,name:'Kunde '+i});
 const r=await f.connection.sync([lead]);assert.equal(r.code,'hub_capacity');assert.equal(f.stats().writes,0);
});
