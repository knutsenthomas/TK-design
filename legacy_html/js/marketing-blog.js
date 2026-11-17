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
module.exports={validate,article};
