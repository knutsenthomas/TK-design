'use strict';
const crypto = require('node:crypto');
const {article} = require('./marketing-blog');
const REVISION = 'blog-scheduler-v1';
const fingerprint = a => crypto.createHash('sha256').update(JSON.stringify(a.safe)).digest('hex');
const postData = (a,now) => ({title:a.safe.title,content:(a.safe.imageAlt?'<p><small>'+a.safe.imageAlt.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))+'</small></p>\n':'')+a.content,summary:a.safe.excerpt,excerpt:a.safe.excerpt,image:a.safe.imageUrl,imageAlt:a.safe.imageAlt,slug:a.slug,author:'TK-design',category:'Webdesign',status:'published',publishedAt:now,marketingFingerprint:fingerprint(a)});
function cronAuthorized(req,secret){const got=String(req.headers?.authorization||'');const expected='Bearer '+secret;return !!secret&&Buffer.byteLength(got)===Buffer.byteLength(expected)&&crypto.timingSafeEqual(Buffer.from(got),Buffer.from(expected));}
function publicJob(v){return v?{status:v.status,scheduledAt:v.scheduledAt,approvedAt:v.approvedAt,publishedUrl:v.publishedUrl||'',error:v.error||'',updatedAt:v.updatedAt}:null;}
async function tick(db,now=new Date()){
 const stamp=now.toISOString(),nowMs=now.getTime();
 const rows=await db.collection('marketingBlogSchedules').where('status','==','scheduled').get();
 let published=0,blocked=0;
 for(const row of rows.docs.filter(r=>Date.parse(r.data().scheduledAt)<=nowMs).slice(0,50)){
  if(Date.parse(row.data().scheduledAt)>nowMs)continue;
  const result=await db.runTransaction(async tx=>{
   const job=await tx.get(row.ref);if(!job.exists||job.data().status!=='scheduled')return 'skipped';const v=job.data();
   const a=article(v.snapshot),post=db.collection('posts').doc(a.id),existing=await tx.get(post);
   if(existing.exists){if(existing.data().marketingFingerprint!==v.fingerprint){tx.update(row.ref,{status:'blocked',error:'Artikkelen finnes allerede med annet innhold.',updatedAt:stamp});return 'blocked';}tx.update(row.ref,{status:'published',publishedUrl:'https://www.tk-design.no/blog/'+existing.data().slug,updatedAt:stamp});return 'reconciled';}
   if(!v.approvedAt||v.revision!==REVISION||!Number.isFinite(Date.parse(v.scheduledAt))||Date.parse(v.scheduledAt)>nowMs)return 'skipped';
   if(nowMs-Date.parse(v.scheduledAt)>30*60000){tx.update(row.ref,{status:'blocked',error:'Tidspunktet er passert med mer enn 30 minutter. Avbryt og velg et nytt tidspunkt.',updatedAt:stamp});return 'blocked';}
   tx.create(post,postData(a,stamp));tx.update(row.ref,{status:'published',publishedUrl:'https://www.tk-design.no/blog/'+a.slug,updatedAt:stamp});return 'published';
  });if(result==='published')published++;if(result==='blocked')blocked++;
 }
 await db.collection('marketingBlogSystem').doc('scheduler').set({revision:REVISION,lastTickAt:stamp,published,blocked},{merge:true});
 return {success:true,published,blocked,checkedAt:stamp};
}
function install(app,{authenticate,getAdminInstance,hasFirebaseServerCredentials}){
 const db=()=>{if(!hasFirebaseServerCredentials())throw Error('Bloggdatabasen er utilgjengelig.');return getAdminInstance().firestore();};
 app.get('/api/marketing-agent/blog/scheduler',authenticate,async(req,res)=>{try{const d=db(),h=await d.collection('marketingBlogSystem').doc('scheduler').get();return res.json({success:true,revision:REVISION,configured:!!process.env.CRON_SECRET,lastTickAt:h.exists?h.data().lastTickAt:null});}catch{return res.status(503).json({success:false,error:'Tidsstyringen er utilgjengelig.'});}});
 app.get('/api/marketing-agent/blog/schedule',authenticate,async(req,res)=>{try{const a=article({recordId:req.query.recordId,title:'lookup',body:'lookup placeholder text',excerpt:'',imageUrl:'',imageAlt:''}),d=await db().collection('marketingBlogSchedules').doc(a.id).get();return res.json({success:true,schedule:d.exists?publicJob(d.data()):null});}catch{return res.status(503).json({success:false,error:'Kunne ikke hente publiseringsplanen.'});}});
 app.post('/api/marketing-agent/blog/schedule',authenticate,async(req,res)=>{try{
  if(req.body?.approved!==true)throw Error('Godkjenn artikkelen og tidspunktet først.');
  if(typeof req.body.approvalId!=='string'||!/^[a-zA-Z0-9-]{1,100}$/.test(req.body.approvalId))throw Error('Ugyldig godkjenning.');
  const a=article(req.body),scheduledAt=String(req.body.scheduledAt||''),due=Date.parse(scheduledAt),now=new Date(),stamp=now.toISOString();
  if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(scheduledAt)||!Number.isFinite(due)||due<now.getTime()+2*60000||due>now.getTime()+180*86400000)throw Error('Velg et tidspunkt minst to minutter fram og innen 180 dager.');
  if(!process.env.CRON_SECRET)throw Error('Tidsstyringen er ikke aktivert.');const d=db(),ref=d.collection('marketingBlogSchedules').doc(a.id),post=d.collection('posts').doc(a.id),hash=fingerprint(a);
  const result=await d.runTransaction(async tx=>{const prior=await tx.get(ref),existing=await tx.get(post);if(existing.exists)throw Error('Artikkelen er allerede publisert.');if(prior.exists&&prior.data().status!=='cancelled'){if(prior.data().approvalId===req.body.approvalId&&prior.data().fingerprint===hash&&prior.data().scheduledAt===scheduledAt&&prior.data().status==='scheduled')return prior.data();throw Error('Artikkelen har allerede en plan. Avbryt planen før du endrer den.');}const job={approvalId:req.body.approvalId,revision:REVISION,status:'scheduled',scheduledAt,snapshot:a.safe,fingerprint:hash,approvedAt:stamp,updatedAt:stamp};tx.set(ref,job);return job;});return res.json({success:true,scheduled:true,schedule:publicJob(result)});
 }catch(e){return res.status(400).json({success:false,error:e.message});}});
 app.post('/api/marketing-agent/blog/cancel',authenticate,async(req,res)=>{try{const a=article({recordId:req.body?.recordId,title:'lookup',body:'lookup placeholder text',excerpt:'',imageUrl:'',imageAlt:''}),d=db(),ref=d.collection('marketingBlogSchedules').doc(a.id),post=d.collection('posts').doc(a.id);await d.runTransaction(async tx=>{const job=await tx.get(ref),existing=await tx.get(post);if(existing.exists)throw Error('Artikkelen er allerede publisert.');if(job.exists&&job.data().approvalId!==req.body?.approvalId)throw Error('Planen er endret. Hent status før du avbryter.');if(job.exists)tx.update(ref,{status:'cancelled',updatedAt:new Date().toISOString()});});return res.json({success:true,cancelled:true});}catch(e){return res.status(409).json({success:false,error:e.message});}});
 app.get('/api/cron/marketing-blog',async(req,res)=>{res.set?.('Cache-Control','no-store');if(!cronAuthorized(req,process.env.CRON_SECRET))return res.status(401).json({success:false,error:'Ingen tilgang.'});try{return res.json(await tick(db()));}catch{return res.status(503).json({success:false,error:'Bloggkontrollen mislyktes. Neste kjøring kan avstemme uten duplikater.'});}});
}
module.exports={install,tick,cronAuthorized,publicJob,REVISION};
