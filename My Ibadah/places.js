/* My Ibadah — "Where did you pray?" card (Home, between the next-prayer card and Today's prayers).
   Reads prayerPlaces from every saved day: Jamaat / Single / Others (incl. "Others: custom text"
   and older values such as "Jamaat @Mosque"). Prayers marked "Qaza" are not counted here. */
'use strict';
(function(){
const NAMES=['Fajr','Dhuhr','Asr','Maghrib','Isha'];
const KINDS=['jamaat','single','others'];
const KIND_LABEL={jamaat:'Jamaat',single:'Single',others:'Others'};
const PERIODS=['today','week','month','last30','all'];
const PERIOD_LABEL={today:'Today',week:'This week',month:'This month',last30:'Last 30 days',all:'All time'};
let open=false;

const kindOf=v=>!v?null:/^jamaat/i.test(v)?'jamaat':/^single/i.test(v)?'single':/^others/i.test(v)?'others':null;
const dkey=d=>localKey(d);
const addK=(k,n)=>{const d=new Date(k+'T12:00:00');d.setDate(d.getDate()+n);return dkey(d);};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function fardDone(d,name){const g=prayers.find(x=>x.name===name);return !!(g&&d&&d.checks&&g.items.some(i=>i[1]==='Fard'&&d.checks[pkey(name,i[0])]));}

function inRange(k,per,anchor){
  if(per==='all')return true;
  if(per==='today')return k===anchor;
  if(per==='month')return k.slice(0,7)===anchor.slice(0,7);
  if(per==='last30')return k>=addK(anchor,-29)&&k<=anchor;
  return k>=addK(anchor,-6)&&k<=anchor;
}
function stats(){
  const per=PERIODS.includes(state.settings.placesPeriod)?state.settings.placesPeriod:'week',anchor=selectedDate;
  const tot={jamaat:0,single:0,others:0},byPrayer={},custom={};let unplaced=0;
  NAMES.forEach(n=>byPrayer[n]={jamaat:0,single:0,others:0});
  Object.keys(state.days).forEach(k=>{
    if(!inRange(k,per,anchor))return;const d=state.days[k],pp=d.prayerPlaces||{};
    NAMES.forEach(n=>{const v=pp[n],kd=kindOf(v);
      if(kd){tot[kd]++;byPrayer[n][kd]++;if(kd==='others'&&/^others:/i.test(v)){const t=v.slice(7).trim();if(t){const key=t.toLowerCase();custom[key]=custom[key]||{t,c:0};custom[key].c++;}}}
      else if(fardDone(d,n)&&!/qaza/i.test(v||''))unplaced++;});
  });
  const total=tot.jamaat+tot.single+tot.others;
  return {per,tot,total,byPrayer,custom:Object.values(custom).sort((a,b)=>b.c-a.c).slice(0,5),unplaced};
}

const ICON={
  pin:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" fill="currentColor"/><circle cx="12" cy="10" r="2.8" fill="#fff"/></svg>',
  cal:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="8.5" cy="14" r="1.1" fill="currentColor"/><circle cx="12" cy="14" r="1.1" fill="currentColor"/><circle cx="15.5" cy="14" r="1.1" fill="currentColor"/></svg>',
  jamaat:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2c-1.5 1.4-3.6 2.7-3.6 5.1V10h7.2V8.3c0-2.4-2.1-3.7-3.6-5.1z" fill="currentColor"/><path d="M4 20.5v-6.8h16v6.8H4z" fill="currentColor"/><path d="M2.5 20.5h19M2.5 8v12.5M21.5 8v12.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M10.4 20.5v-3.2a1.6 1.6 0 0 1 3.2 0v3.2z" fill="#fff"/></svg>',
  single:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4.2" fill="currentColor"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" fill="currentColor"/></svg>',
  others:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2 6.3 20.3l1.2-6.4L2.8 9.5l6.4-.8z" fill="currentColor"/></svg>'
};

function donut(s){
  const R=50,C=2*Math.PI*R,SW=18;let svg=`<svg viewBox="0 0 140 140" role="img" aria-label="${KINDS.map(k=>s.tot[k]+' '+KIND_LABEL[k]).join(', ')}"><g transform="rotate(-90 70 70)"><circle class="pl-track" cx="70" cy="70" r="${R}" fill="none" stroke-width="${SW}"/>`;
  if(s.total>0){
    const used=KINDS.filter(k=>s.tot[k]>0),gap=used.length>1?2.5:0;let off=0;
    KINDS.forEach(k=>{if(!s.tot[k])return;const len=C*s.tot[k]/s.total,draw=Math.max(0.5,len-gap);
      svg+=`<circle class="pl-seg pl-${k}" cx="70" cy="70" r="${R}" fill="none" stroke-width="${SW}" stroke-dasharray="${draw.toFixed(2)} ${(C-draw).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}"/>`;off+=len;});
  }
  return svg+'</g></svg>';
}
function pct(n,t){return t?Math.round(n/t*100):0;}

function build(){
  const host=document.querySelector('#dashboardPanel .prayer-status-card');if(!host||document.getElementById('placesCard'))return;
  const sec=document.createElement('section');sec.id='placesCard';sec.className='places-card';sec.setAttribute('aria-label','Where did you pray?');
  host.parentNode.insertBefore(sec,host);
  sec.addEventListener('click',e=>{
    if(e.target.closest('#plPeriod')){const i=PERIODS.indexOf(state.settings.placesPeriod||'week');state.settings.placesPeriod=PERIODS[(i+1)%PERIODS.length];try{localStorage.setItem(STORE,JSON.stringify(state));}catch{}render();return;}
    if(e.target.closest('#plDetailsBtn')){open=!open;render();return;}
    if(e.target.closest('#plCloseBtn')){open=false;render();return;}
    if(e.target.closest('#plAdd')){setTab('salah');}
  });
}
function render(){
  const sec=document.getElementById('placesCard');if(!sec)return;const s=stats();
  const rows=KINDS.map(k=>`<div class="pl-row pl-row-${k}"><span class="pl-ico pl-ico-${k}">${ICON[k]}</span><span class="pl-name">${KIND_LABEL[k]}</span><strong>${s.tot[k]}</strong><em>(${pct(s.tot[k],s.total)}%)</em></div>`).join('');
  let details='';
  if(open){
    details=`<div class="pl-details" role="dialog" aria-label="By prayer"><div class="pl-dhead"><h4>By prayer</h4><button type="button" class="pl-more" id="plCloseBtn">Hide details ‹</button></div><div class="pl-table"><div class="pl-th"><span></span>${KINDS.map(k=>`<b>${KIND_LABEL[k]}</b>`).join('')}</div>`+
      NAMES.map(n=>`<div class="pl-tr"><span>${n}</span>${KINDS.map(k=>`<b class="${s.byPrayer[n][k]?'':'zero'}">${s.byPrayer[n][k]}</b>`).join('')}</div>`).join('')+`</div>`+
      (s.custom.length?`<h4>Places you wrote under Others</h4><div class="pl-chips">${s.custom.map(c=>`<span>${esc(c.t)}<b>×${c.c}</b></span>`).join('')}</div>`:'')+`</div>`;
  }
  const empty=s.total===0;
  sec.innerHTML=`<div class="pl-head">
      <span class="pl-pin">${ICON.pin}</span>
      <div class="pl-titles"><h2>Where did you pray?</h2>
        <button type="button" class="pl-period" id="plPeriod" aria-label="Change period">${ICON.cal}<span>${PERIOD_LABEL[s.per]}</span><i aria-hidden="true">⇅</i></button></div>
      <button type="button" class="pl-more" id="plDetailsBtn" aria-expanded="${open}">${open?'Hide details ‹':'View details ›'}</button>
    </div>
    <div class="pl-body">
      <div class="pl-donut${empty?' empty':''}">${donut(s)}<div class="pl-center"><strong>${s.total}</strong><small>Total prayers</small></div></div>
      <div class="pl-legend">${rows}</div>
    </div>
    ${empty?'<p class="pl-hint">Pick Jamaat, Single or Others on the Salah screen to see your stats</p>':''}
    ${s.unplaced>0?`<p class="pl-hint pl-unplaced"><span>${s.unplaced} ${s.unplaced===1?'prayer':'prayers'} without a place yet</span> <button type="button" id="plAdd">Add ›</button></p>`:''}
    ${details}`;
}

const __raP=renderAll;
renderAll=function(){__raP();try{render();}catch(e){console.error('places',e);}};
build();render();
document.addEventListener('langchange',()=>{try{render();}catch{}});
})();
