const boxes=[...document.querySelectorAll('.checklist input')];
const key='tk-design-ki-checklist-v1';
try{const saved=JSON.parse(localStorage.getItem(key)||'[]');boxes.forEach((box,i)=>box.checked=saved[i]===true)}catch{}
function update(){document.getElementById('progress').textContent=boxes.filter(b=>b.checked).length+' av 6 punkter gjennomgått';try{localStorage.setItem(key,JSON.stringify(boxes.map(b=>b.checked)))}catch{}}
boxes.forEach(box=>box.addEventListener('change',update));
document.getElementById('reset').addEventListener('click',()=>{boxes.forEach(b=>b.checked=false);update()});
update();
