/* My Ibadah — Ramadan dashboard (Home slider card, after "Weekly dhikr").
   Interactive: countdown / day progress ring, Suhoor & Iftar timer, 30-day fasting tracker,
   Tarawih + Quran (khatam) goals. Uses the same data as the Ramadan tab: state.ramadan[dateKey]
   = {fasting:'Fasted'|'Excused'|'Not fasted', tarawih, juz, ramadanDay}. */
'use strict';
(function(){
const dash=document.getElementById('dashboardPanel');
if(!dash||document.getElementById('ramadanCard'))return;
const DAY=864e5,LEN=30,PAGES_PER_JUZ=20;
const noon=d=>{const x=new Date(d);x.setHours(12,0,0,0);return x;};
const add=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x;};
const diff=(a,b)=>Math.round((noon(b)-noon(a))/DAY);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let HF=null;try{HF=new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn',{day:'numeric',month:'numeric',year:'numeric'});}catch{}
const hij=d=>{if(!HF)return null;const o={};HF.formatToParts(d).forEach(p=>{if(p.type!=='literal'&&p.type!=='era')o[p.type]=+p.value;});return o;};

/* ---------- dates ---------- */
const shift=()=>{const s=Number(state.settings&&state.settings.ramadanShift)||0;return Math.max(-1,Math.min(1,s));};
function ramadanInfo(){
  const today=noon(new Date());let start=null,year=1448;
  if(HF){for(let o=-(LEN-1);o<=420;o++){const d=add(today,o),h=hij(d);if(h&&h.month===9&&h.day===1){start=d;year=h.year;break;}}}
  if(!start)start=new Date(2027,1,8,12);
  start=add(start,shift());
  const n=diff(start,today)+1;                       // Ramadan day number today (<=0 before)
  return {today,start,year,n,status:n<1?'before':n>LEN?'after':'during',daysTo:Math.max(0,1-n)};
}
const dayDate=(info,i)=>add(info.start,i-1);
const dayKey=(info,i)=>localKey(dayDate(info,i));
const rec=k=>(state.ramadan&&state.ramadan[k])||{};
function setRec(k,patch){state.ramadan=state.ramadan||{};state.ramadan[k]=Object.assign({},state.ramadan[k]||{},patch);save();}

/* ---------- stats ---------- */
function stats(info){
  let fasted=0,excused=0,missed=0,tar=0,juz=0;const juzBy=[];
  for(let i=1;i<=LEN;i++){const r=rec(dayKey(info,i));
    if(r.fasting==='Fasted')fasted++;else if(r.fasting==='Excused')excused++;else if(r.fasting==='Not fasted')missed++;
    tar+=Number(r.tarawih)||0;const j=Number(r.juz)||0;juz+=j;juzBy.push(j);}
  let streak=0;const last=info.status==='after'?LEN:Math.min(LEN,info.n);
  let i=last;if(info.status==='during'&&rec(dayKey(info,i)).fasting!=='Fasted')i--;
  for(;i>=1&&rec(dayKey(info,i)).fasting==='Fasted';i--)streak++;
  return {fasted,excused,missed,tar,juz,juzBy,streak};
}

/* ---------- Suhoor / Iftar ---------- */
function times(){
  let t=null;try{t=(typeof __times!=='undefined'&&__times)||(state.settings.timesCache&&state.settings.timesCache.t);}catch{}
  const m=s=>{const x=/(\d{1,2}):(\d{2})/.exec(s||'');return x?+x[1]*60+ +x[2]:null;};
  return t?{fajr:m(t.Fajr),maghrib:m(t.Maghrib),fajrS:t.Fajr,maghribS:t.Maghrib}:null;
}
function nextEvent(){
  const t=times();if(!t||t.fajr==null||t.maghrib==null)return null;
  const now=new Date(),mins=now.getHours()*60+now.getMinutes()+now.getSeconds()/60;
  let name,at;
  if(mins<t.fajr){name='Suhoor ends';at=t.fajr;}
  else if(mins<t.maghrib){name='Iftar';at=t.maghrib;}
  else{name='Suhoor ends';at=t.fajr+1440;}
  const left=Math.max(0,Math.ceil(at-mins)),h=Math.floor(left/60),mm=left%60;
  const f=fmt12(at>=1440?t.fajrS:(name==='Iftar'?t.maghribS:t.fajrS));
  return {name,left:h?`${h}h ${mm}m`:`${mm}m`,clock:(f.t+' '+f.ap).trim(),iftar:name==='Iftar'};
}

/* ---------- UI state ---------- */
let tab='overview',sel=null;
const card=document.createElement('section');
card.id='ramadanCard';card.className='card ramadan-card';card.setAttribute('aria-label','Ramadan dashboard');
const anchor=dash.querySelector('.weekly-counter-card');
if(anchor)anchor.after(card);else dash.append(card);

function ring(info,st){
  const R=38,C=2*Math.PI*R;
  let p,big,small;
  if(info.status==='before'){p=Math.max(0.04,1-info.daysTo/365);big=info.daysTo;small=info.daysTo===1?'day to go':'days to go';}
  else if(info.status==='during'){p=info.n/LEN;big=info.n;small='of '+LEN;}
  else{p=1;big='✓';small='Eid Mubarak';}
  return `<div class="rm-ring"><svg viewBox="0 0 90 90" aria-hidden="true"><circle cx="45" cy="45" r="${R}" class="rm-ring-bg"/><circle cx="45" cy="45" r="${R}" class="rm-ring-fg" stroke-dasharray="${(C*Math.min(1,p)).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 45 45)"/></svg><div class="rm-ring-c"><strong>${esc(big)}</strong><small>${esc(small)}</small></div></div>`;
}

function paneOverview(info,st){
  const ev=nextEvent();
  const strip=ev?`<div class="rm-strip ${ev.iftar?'iftar':''}"><span aria-hidden="true">${ev.iftar?'🌇':'🌙'}</span><b>${ev.name} in ${ev.left}</b><small>${esc(ev.clock)}</small></div>`
    :`<button type="button" class="rm-strip link" data-rm="times"><span aria-hidden="true">🕌</span><b>Load prayer times for Suhoor &amp; Iftar</b><i aria-hidden="true">›</i></button>`;
  const tile=(ico,val,lab,go)=>`<button type="button" class="rm-tile" data-rm-go="${go}"><span aria-hidden="true">${ico}</span><b>${val}</b><small>${lab}</small></button>`;
  return `<div class="rm-ov">${ring(info,st)}<div class="rm-tiles">${tile('🌿',st.fasted,'Fasted','tracker')}${tile('🔥',st.streak,'Day streak','tracker')}${tile('🕌',st.tar,"Tarawih rak'ahs",'tracker')}${tile('📖',st.juz+'/30','Quran juz','quran')}</div></div>${strip}`;
}

function paneTracker(info,st){
  const cells=[];
  for(let i=1;i<=LEN;i++){
    const r=rec(dayKey(info,i)),f=r.fasting,future=info.status==='before'||(info.status==='during'&&i>info.n);
    const cls=['rm-day',f==='Fasted'?'fasted':f==='Excused'?'excused':f==='Not fasted'?'missed':'',i===sel?'sel':'',(info.status==='during'&&i===info.n)?'today':'',future?'future':''].join(' ');
    const mark=f==='Fasted'?'✓':f==='Excused'?'E':f==='Not fasted'?'✕':i;
    cells.push(`<button type="button" class="${cls}" data-rm-day="${i}" aria-label="Day ${i}${f?': '+esc(f):''}">${mark}</button>`);
  }
  const k=dayKey(info,sel),r=rec(k),d=dayDate(info,sel);
  const chip=(v,l)=>`<button type="button" class="rm-chip ${r.fasting===v?'on '+(v==='Fasted'?'ok':v==='Excused'?'gold':'bad'):''}" data-rm-fast="${v}">${l}</button>`;
  const step=(lab,field,val,minus,plus)=>`<div class="rm-step"><small>${lab}</small><div><button type="button" data-rm-step="${field}:-${minus}" aria-label="Decrease ${lab}">−</button><b>${val}</b><button type="button" data-rm-step="${field}:${plus}" aria-label="Increase ${lab}">+</button></div></div>`;
  return `<div class="rm-grid">${cells.join('')}</div>
  <div class="rm-sel"><div class="rm-seld"><b>Day ${sel}</b><small>${esc(d.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'}))}</small></div>
  <div class="rm-chips">${chip('Fasted','Fasted')}${chip('Excused','Excused')}${chip('Not fasted','Missed')}</div></div>
  <div class="rm-steps">${step("Tarawih rak'ahs",'tarawih',Number(r.tarawih)||0,2,2)}${step('Quran juz','juz',Number(r.juz)||0,1,1)}</div>`;
}

function paneQuran(info,st){
  const pct=Math.min(100,Math.round(st.juz/30*100)),left=Math.max(0,30-st.juz);
  const daysLeft=info.status==='during'?Math.max(1,LEN-info.n+1):(info.status==='before'?LEN:0);
  let msg;
  if(st.juz>=30)msg='Khatam complete — Alhamdulillah! 🎉';
  else if(info.status==='after')msg=`${left} juz left to complete`;
  else{const per=left/daysLeft;msg=`≈ ${per<1?per.toFixed(1):Math.ceil(per*10)/10} juz (~${Math.round(per*PAGES_PER_JUZ)} pages) per day to finish by Eid`;}
  const mx=Math.max(1,...st.juzBy);
  const bars=st.juzBy.map((j,i)=>`<i class="${j?'on':''}${i+1===sel?' sel':''}" style="height:${j?Math.max(18,Math.round(j/mx*100)):8}%" title="Day ${i+1}: ${j} juz"></i>`).join('');
  const r=rec(dayKey(info,sel)),cur=Number(r.juz)||0;
  return `<div class="rm-q"><div class="rm-qtop"><strong>${st.juz}<small>/30 juz</small></strong><span>${pct}%</span></div>
  <div class="rm-bar"><i style="width:${pct}%"></i></div><p>${esc(msg)}</p>
  <div class="rm-bars" aria-hidden="true">${bars}</div>
  <div class="rm-qact"><span>Day ${sel}: <b>${cur}</b> juz</span><button type="button" data-rm-step="juz:-1" aria-label="Remove one juz">−1</button><button type="button" class="p" data-rm-step="juz:1" aria-label="Add one juz">+1 juz</button></div></div>`;
}

function render(){
  const info=ramadanInfo();
  if(sel==null||sel<1||sel>LEN)sel=info.status==='during'?info.n:1;
  const st=stats(info);
  const fmt=d=>d.toLocaleDateString(undefined,{month:'short',day:'numeric'});
  const sub=info.status==='before'?`Starts ${fmt(info.start)} · in ${info.daysTo} ${info.daysTo===1?'day':'days'}`
    :info.status==='during'?`Day ${info.n} of ${LEN} · ${LEN-info.n} left`:`Completed · next year in sha Allah`;
  const sh=shift();
  const tabs=[['overview','Overview'],['tracker','Tracker'],['quran','Quran']];
  card.innerHTML=`<div class="rm-head"><div class="rm-moon" aria-hidden="true">🌙</div><div class="rm-title"><h2>Ramadan ${info.year}</h2><p>${esc(sub)}</p></div>
    <button type="button" class="rm-adj" data-rm="shift" aria-label="Adjust start date for moon sighting" title="Moon-sighting adjustment">✎ ${sh>0?'+'+sh:sh}d</button></div>
    <div class="rm-tabs" role="tablist">${tabs.map(([k,l])=>`<button type="button" role="tab" aria-selected="${tab===k}" class="${tab===k?'on':''}" data-rm-tab="${k}">${l}</button>`).join('')}</div>
    <div class="rm-pane" role="tabpanel">${tab==='tracker'?paneTracker(info,st):tab==='quran'?paneQuran(info,st):paneOverview(info,st)}</div>`;
}

card.addEventListener('click',e=>{
  const t=e.target.closest('button');if(!t||!card.contains(t))return;
  const info=ramadanInfo();
  if(t.dataset.rmTab){tab=t.dataset.rmTab;render();return;}
  if(t.dataset.rmGo){tab=t.dataset.rmGo;render();return;}
  if(t.dataset.rmDay){sel=+t.dataset.rmDay;render();return;}
  if(t.dataset.rm==='shift'){const order=[0,1,-1],next=order[(order.indexOf(shift())+1)%3];state.settings.ramadanShift=next;
    try{toast(next===0?'Ramadan start: calendar date':`Ramadan start moved ${next>0?'+':''}${next} day`);}catch{}save();return;}
  if(t.dataset.rm==='times'){try{setTab('times');}catch{}return;}
  if(t.dataset.rmFast){const k=dayKey(info,sel),cur=rec(k).fasting,v=t.dataset.rmFast;setRec(k,{fasting:cur===v?'':v,ramadanDay:String(sel)});if(navigator.vibrate)navigator.vibrate(10);return;}
  if(t.dataset.rmStep){const [f,d]=t.dataset.rmStep.split(':'),k=dayKey(info,sel),max=f==='juz'?30:40,v=Math.max(0,Math.min(max,(Number(rec(k)[f])||0)+Number(d)));setRec(k,{[f]:v,ramadanDay:String(sel)});if(navigator.vibrate)navigator.vibrate(8);}
});

const prev=renderAll;
renderAll=function(){prev();try{render();}catch(err){console.error('ramadan card',err);}};
try{render();}catch(err){console.error('ramadan card',err);}
setInterval(()=>{if(tab==='overview'&&document.body.dataset.tab==='dashboard'&&!document.hidden){try{render();}catch{}}},30000);
document.addEventListener('langchange',()=>{try{render();}catch{}});
window.RamadanCard={info:ramadanInfo,go:t=>{tab=t;render();}};
})();
