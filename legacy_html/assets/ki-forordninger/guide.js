const boxes=[...document.querySelectorAll('.checklist input')];
const key='tk-design-ki-checklist-v1';
try{const saved=JSON.parse(localStorage.getItem(key)||'[]');boxes.forEach((box,i)=>box.checked=saved[i]===true)}catch{}
function guideLanguage(){return document.documentElement.lang==='en'?'en':'no'}
function update(){const count=boxes.filter(b=>b.checked).length;document.getElementById('progress').textContent=guideLanguage()==='en'?`${count} of ${boxes.length} items reviewed`:`${count} av ${boxes.length} punkter gjennomgått`;try{localStorage.setItem(key,JSON.stringify(boxes.map(b=>b.checked)))}catch{}}
function translateGuideMeta(){const en=guideLanguage()==='en';const title=en?'The AI Act and Norwegian business | TK-design':'KI-forordningen og norsk næringsliv | TK-design';const description=en?'A practical guide to the AI Act, responsible AI use and digital trust for Norwegian businesses.':'En praktisk guide til KI-forordningen, ansvarlig teknologibruk og digital tillit for norske virksomheter.';document.title=title;document.querySelector('meta[name="description"]')?.setAttribute('content',description);document.querySelector('meta[property="og:title"]')?.setAttribute('content',title);document.querySelector('.visual')?.setAttribute('aria-label',en?'Three principles for responsible AI':'Tre prinsipper for ansvarlig KI');update()}
boxes.forEach(box=>box.addEventListener('change',update));
document.getElementById('reset').addEventListener('click',()=>{boxes.forEach(b=>b.checked=false);update()});
document.addEventListener('languagechange',translateGuideMeta);
translateGuideMeta();
