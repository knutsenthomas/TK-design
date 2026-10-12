'use strict';
const crypto=require('node:crypto');
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function validate(v){
 if(!v||typeof v.recordId!=='string'||!/^[a-zA-Z0-9:_-]{1,200}$/.test(v.recordId))throw Error('Ugyldig artikkel-ID.');
 const out={recordId:v.recordId};
 for(const [key,max] of [['title',160],['body',50000],['excerpt',500],['imageUrl',2000],['imageAlt',200]]){if(typeof v[key]!=='string'||v[key].length>max)throw Error('Ugyldig '+key);out[key]=v[key].trim();}
 if(!out.title||out.body.length<20)throw Error('Artikkelen trenger tittel og minst 20 tegn tekst.');
 if(out.imageUrl){const u=new URL(out.imageUrl);if(u.protocol!=='https:'||u.username||u.password||u.hostname==='localhost'||u.hostname.endsWith('.local')||u.hostname.includes(':')||/^\d+(\.\d+){3}$/.test(u.hostname))throw Error('Bruk en offentlig https-bildeadresse.');}
 return out;
}
function article(v){const safe=validate(v),hash=crypto.createHash('sha256').update(safe.recordId).digest('hex').slice(0,24);const slug=safe.title.toLowerCase().replace(/æ/g,'ae').replace(/ø/g,'o').replace(/å/g,'a').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70)+'-'+hash.slice(0,10);return {safe,id:'markedsagent-'+hash,slug,content:safe.body.split(/\n\s*\n/).map(p=>p.startsWith('## ')?'<h2>'+escape(p.slice(3))+'</h2>':'<p>'+escape(p).replace(/\n/g,'<br>')+'</p>').join('\n')};}
function install(app,{authenticate,getAdminInstance,hasFirebaseServerCredentials}){
 app.get('/api/marketing-agent/blog',authenticate,async(req,res)=>{try{if(!hasFirebaseServerCredentials())throw Error();const db=getAdminInstance().firestore();if(req.query.recordId){const id=article({recordId:String(req.query.recordId),title:'lookup',body:'lookup placeholder text',excerpt:'',imageUrl:'',imageAlt:''}).id;const doc=await db.collection('posts').doc(id).get();return res.json({success:true,published:doc.exists,url:doc.exists?'https://www.tk-design.no/blog/'+doc.data().slug:null});}await db.collection('posts').limit(1).get();return res.json({success:true,configured:true});}catch{return res.status(503).json({success:false,error:'Bloggdatabasen er utilgjengelig.'});}});
 app.post('/api/marketing-agent/blog',authenticate,async(req,res)=>{let a;try{if(req.body?.approved!==true)throw Error('Godkjenning kreves.');a=article(req.body);}catch(e){return res.status(400).json({success:false,error:e.message});}
 try{if(!hasFirebaseServerCredentials())throw Error('storage');const db=getAdminInstance().firestore(),ref=db.collection('posts').doc(a.id),fingerprint=crypto.createHash('sha256').update(JSON.stringify(a.safe)).digest('hex');
 await db.runTransaction(async tx=>{const existing=await tx.get(ref);if(existing.exists){if(existing.data().marketingFingerprint!==fingerprint)throw Error('already_published');return;}tx.create(ref,{title:a.safe.title,content:(a.safe.imageAlt?'<p><small>'+escape(a.safe.imageAlt)+'</small></p>\n':'')+a.content,summary:a.safe.excerpt,excerpt:a.safe.excerpt,image:a.safe.imageUrl,imageAlt:a.safe.imageAlt,slug:a.slug,author:'TK-design',category:'Webdesign',status:'published',publishedAt:new Date().toISOString(),marketingFingerprint:fingerprint});});
 const confirmed=await ref.get();if(!confirmed.exists||confirmed.data().marketingFingerprint!==fingerprint)throw Error('unconfirmed');return res.json({success:true,published:true,postId:a.id,url:'https://www.tk-design.no/blog/'+confirmed.data().slug});
 }catch(e){return res.status(e.message==='already_published'?409:503).json({success:false,error:e.message==='already_published'?'Artikkelen er allerede publisert med annet innhold.':'Publisering kunne ikke bekreftes. Hent status før nytt forsøk.'});}});
}
module.exports={install,validate,article};
