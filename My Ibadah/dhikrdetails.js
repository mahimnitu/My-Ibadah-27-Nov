/* My Ibadah — Weekly dhikr "View details" panel (mirrors the "Where did you pray?" details).
   Lists EVERY dhikr (defaults + personal ones) with its 7-day total, active days and a daily mini-chart.
   Read-only: it never creates or modifies day records. */
'use strict';
(function(){
let open=false;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const card=()=>document.querySelector('.weekly-counter-card');

function weekData(){
  const end=new Date(selectedDate+'T12:00:00'),days=[];
  for(let i=6;i>=0;i--){const dt=new Date(end);dt.setDate(end.getDate()-i);days.push({date:dt,key:localKey(dt)});}
  const map=new Map();
  const ensure=n=>{if(!map.has(n))map.set(n,{name:n,arabic:'',counts:[0,0,0,0,0,0,0],total:0,active:0});return map.get(n);};
  try{(typeof defaults!=='undefined'?defaults:[]).forEach(x=>{ensure(x.name).arabic=x.arabic||'';});}catch{}
  days.forEach((dy,i)=>{
    const d=state.days&&state.days[dy.key];if(!d||!Array.isArray(d.dhikr))return;
    d.dhikr.forEach(x=>{const n=x.name||'Dhikr',r=ensure(n),c=Number(x.count)||0;if(!r.arabic&&x.arabic)r.arabic=x.arabic;r.counts[i]+=c;});
  });
  const rows=[...map.values()];
  rows.forEach(r=>{r.total=r.counts.reduce((a,b)=>a+b,0);r.active=r.counts.filter(c=>c>0).length;});
  return {days,rows,total:rows.reduce((a,r)=>a+r.total,0)};
}

function spark(r,days){
  const max=Math.max(1,...r.counts);
  return `<span class="dd-spark" aria-hidden="true">${r.counts.map((c,i)=>`<i class="${c?'on':''}${i===6?' cur':''}" style="height:${c?Math.max(14,Math.round(c/max*100)):8}%" title="${esc(days[i].date.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'}))}: ${c}"></i>`).join('')}</span>`;
}

function render(){
  const c=card();if(!c)return;
  const head=c.querySelector('.weekly-counter-main .card-head');
  if(head&&!document.getElementById('ddBtn')){
    const b=document.createElement('button');b.type='button';b.id='ddBtn';b.className='pl-more dd-more';
    head.insertBefore(b,head.querySelector('.week-total'));
  }
  const btn=document.getElementById('ddBtn');
  if(btn){btn.textContent=open?'Hide details ‹':'View details ›';btn.setAttribute('aria-expanded',open);}
  let panel=document.getElementById('ddPanel');
  if(!open){if(panel)panel.remove();return;}
  const w=weekData(),f=d=>d.toLocaleDateString(undefined,{month:'short',day:'numeric'});
  const html=`<div class="dd-head"><div><h4>All dhikr</h4><p>${f(w.days[0].date)} – ${f(w.days[6].date)}</p></div><button type="button" class="pl-more" id="ddClose">Hide details ‹</button></div>
    <div class="dd-sum"><div><small>Total</small><b>${w.total.toLocaleString()}</b></div><div><small>Dhikr types</small><b>${w.rows.filter(r=>r.total>0).length}/${w.rows.length}</b></div><div><small>Daily average</small><b>${Math.round(w.total/7).toLocaleString()}</b></div></div>
    <div class="dd-list">${w.rows.map(r=>`<div class="dd-row${r.total?'':' zero'}"><div class="dd-name"><b>${esc(r.name)}</b><small>${r.active}/7 days</small></div>${spark(r,w.days)}<strong>${r.total.toLocaleString()}</strong></div>`).join('')}</div>`;
  if(!panel){panel=document.createElement('div');panel.id='ddPanel';panel.className='dd-details';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','All dhikr');c.append(panel);}
  panel.innerHTML=html;
}

document.addEventListener('click',e=>{
  if(e.target.closest('#ddBtn')){open=!open;render();return;}
  if(e.target.closest('#ddClose')){open=false;render();}
});
const prev=renderAll;
renderAll=function(){prev();try{render();}catch(err){console.error('dhikr details',err);}};
try{render();}catch{}
document.addEventListener('langchange',()=>{try{render();}catch{}});
})();
