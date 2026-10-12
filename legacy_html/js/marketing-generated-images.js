'use strict';
const crypto=require('node:crypto');
const validId=id=>typeof id==='string'&&/^[a-f0-9-]{36}$/.test(id);
function createGeneratedImageStore({getAdminInstance}) {
 const collection=()=>getAdminInstance().firestore().collection('marketingAgentImages');
 return {
  async check(){await collection().doc('availability-check').get();return {success:true};},
  async save(value){
   if(!validId(value?.id)||typeof value?.base64!=='string'||value.base64.length>750000||!/^\/9j\/[A-Za-z0-9+/=]+$/.test(value.base64))throw Error('Ugyldig eller for stort bilde.');
   const bytes=Buffer.from(value.base64,'base64');if(bytes[0]!==255||bytes[1]!==216||bytes[2]!==255)throw Error('Ugyldig JPEG-bilde.');
   const digest=crypto.createHash('sha256').update(bytes).digest('hex');const doc=collection().doc(value.id);
   try{await doc.create({base64:value.base64,digest,createdAt:new Date().toISOString()});}
   catch(e){if(e.code!==6&&e.code!=='already-exists')throw Error('Bildet kunne ikke lagres.');const existing=await doc.get();if(existing.data()?.digest!==digest)throw Error('Bilde-ID er allerede brukt.');}
   const saved=await doc.get();if(saved.data()?.digest!==digest)throw Error('Bildelagring kunne ikke bekreftes.');
   return {success:true,image:{url:'https://www.tk-design.no/api/marketing-agent/generated-images/'+value.id,generated:true}};
  },
  async read(id){if(!validId(id))return null;const doc=await collection().doc(id).get();return doc.exists?Buffer.from(doc.data().base64,'base64'):null;}
 };
}
function installGeneratedImageRoutes(app,{authenticate,getAdminInstance}){
 const store=createGeneratedImageStore({getAdminInstance});
 app.get('/api/marketing-agent/generated-images',authenticate,async(req,res)=>{try{res.json(await store.check());}catch{res.status(503).json({success:false,error:'Bildelagring er utilgjengelig.'});}});
 app.post('/api/marketing-agent/generated-images',authenticate,async(req,res)=>{try{res.json(await store.save(req.body));}catch(e){res.status(503).json({success:false,error:e.message});}});
 // Only opaque image IDs are public, so social platforms can fetch selected images.
 // No listing, prompts, customer data or credentials are exposed by this route.
 app.get('/api/marketing-agent/generated-images/:id',async(req,res)=>{try{const bytes=await store.read(req.params.id);if(!bytes)return res.status(404).end();res.setHeader('Content-Type','image/jpeg');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','public, max-age=31536000, immutable');res.send(bytes);}catch{res.status(503).end();}});
}
module.exports={createGeneratedImageStore,installGeneratedImageRoutes};
