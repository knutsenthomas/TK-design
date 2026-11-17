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
module.exports={tick,cronAuthorized,publicJob,REVISION};
