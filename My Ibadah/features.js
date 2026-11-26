/* My Ibadah v10 — streaks, Tasbih mode, Khatam planner, Qaza plan, trends,
   reflection, cloud backup, Ramadan tools. Loaded after app.js / device.js. */
'use strict';

/* ---------- helpers (read-only: never create empty day records) ---------- */
const DAYMS=86400000;
const keyDate=k=>new Date(k+'T12:00:00');
const addDays=(k,n)=>{const d=keyDate(k);d.setDate(d.getDate()+n);return localKey(d);};
const daysBetween=(a,b)=>Math.round((keyDate(b)-keyDate(a))/DAYMS);
const nowKey=()=>localKey(new Date());
const peek=k=>state.days[k]||null;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function fardOf(d){if(!d||!d.checks)return 0;let n=0;prayers.forEach(g=>{if(g.items.some(i=>i[1]==='Fard'&&d.checks[pkey(g.name,i[0])]))n++;});return n;}
const pagesOf=d=>d&&d.quran?Math.max(0,Number(d.quran.pages)||0):0;
const dhikrOf=d=>d&&d.dhikr?d.dhikr.reduce((a,x)=>a+(Number(x.count)||0),0):0;
const fdate=(k,o)=>keyDate(k).toLocaleDateString(undefined,o||{month:'short',day:'numeric'});
const visible=t=>{const p=$(t+'Panel');return p&&!p.classList.contains('hidden');};
const $q=(sel,root=document)=>root.querySelector(sel);
function html(el,s){el.innerHTML=s;return el;}

/* =====================================================================
   1. STREAKS & MILESTONES (Home)
   ===================================================================== */
const MILESTONES=[3,7,14,30,60,100];
function streakInfo(){
  const today=nowKey();let cur=0,k=today;
  if(fardOf(peek(k))<5)k=addDays(k,-1);
  while(fardOf(peek(k))>=5&&cur<5000){cur++;k=addDays(k,-1);}
  // Best streak: longest run of all-5-prayer days up to today (future dates are ignored)
  const keys=Object.keys(state.days).filter(x=>x<=today&&fardOf(state.days[x])>=5).sort();
  let best=0,run=0,prev=null;
  keys.forEach(x=>{run=(prev&&daysBetween(prev,x)===1)?run+1:1;best=Math.max(best,run);prev=x;});
  best=Math.max(best,cur);
  // Best always reflects the days actually recorded (clears any stale value saved by an earlier version)
  if(state.bestStreak!==undefined){delete state.bestStreak;persist();}
  const week=[];for(let i=6;i>=0;i--){const x=addDays(today,-i),n=fardOf(peek(x));week.push({k:x,n});}
  return {cur,best,week,perfect:week.every(w=>w.n>=5)};
}
function injectHome(){
  const dash=$('dashboardPanel'),first=$q('.prayer-status-card',dash);
  const ban=document.createElement('div');ban.id='homeBanners';ban.className='stack';dash.prepend(ban);
  first.insertAdjacentHTML('afterend',`<section class="card streak-card" id="streakCard" aria-label="Prayer streak">
    <div class="streak-top"><div class="streak-flame" aria-hidden="true">🔥</div>
      <div class="streak-num"><strong id="streakNum">0</strong><small>day streak</small></div>
      <div class="streak-best"><small>Best</small><b id="streakBest">0</b></div></div>
    <div class="week-dots" id="weekDots" aria-label="Last 7 days"></div>
    <div class="badge-row" id="badgeRow" aria-label="Streak badges"></div>
    <p class="sub streak-msg" id="streakMsg"></p></section>`);
}
function renderStreaks(){
  const el=$('streakCard');if(!el)return;const s=streakInfo();
  $('streakNum').textContent=s.cur;$('streakBest').textContent=s.best;
  const dots=$('weekDots');dots.innerHTML='';
  s.week.forEach((w,i)=>{const d=document.createElement('div');d.className='wd'+(w.n>=5?' all5':w.n>0?' part':'')+(i===6?' today':'');
    const lbl=keyDate(w.k).toLocaleDateString(undefined,{weekday:'short'}).slice(0,3);
    d.innerHTML=`<i>${w.n>=5?'✓':w.n>0?w.n:''}</i><small>${esc(lbl)}</small>`;dots.append(d);});
  const row=$('badgeRow');row.innerHTML='';
  MILESTONES.forEach(m=>{const on=s.best>=m;const b=document.createElement('div');b.className='badge '+(on?'on':'off');b.innerHTML=`<span aria-hidden="true">${on?'🏅':'🔒'}</span><b>${m}</b><small>days</small>`;b.title=m+'-day';row.append(b);});
  let msg;
  if(s.perfect)msg='Perfect week — mashaAllah!';
  else if(s.cur===0)msg='Complete all 5 prayers today to start a streak';
  else{const nx=MILESTONES.find(m=>m>s.cur);msg=nx?`${nx-s.cur} more ${nx-s.cur===1?'day':'days'} to the ${nx}-day badge`:'Subhanallah — keep it going!';}
  $('streakMsg').textContent=msg;
  state.badges??=[];
  if(MILESTONES.includes(s.cur)&&!state.badges.includes(s.cur)){state.badges.push(s.cur);persist();toast('🏅 '+s.cur+'-day streak!');if(navigator.vibrate)navigator.vibrate([20,40,20]);}
}

/* =====================================================================
   2. TASBIH MODE (full-screen counter)
   ===================================================================== */
const TS={i:0,lock:null};
function buildTasbih(){
  const d=document.createElement('div');d.id='tasbih';d.className='tasbih';d.hidden=true;d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label','Tasbih mode');
  d.innerHTML=`<div class="ts-top"><button class="ts-icon" id="tsClose" type="button" aria-label="Close">✕</button>
    <div class="ts-title"><b id="tsName"></b><small id="tsTarget"></small></div>
    <button class="ts-icon" id="tsReset" type="button" aria-label="Reset">↺</button></div>
    <div class="ts-pick"><button class="ts-icon" id="tsPrev" type="button" aria-label="Previous dhikr">‹</button>
    <div class="ts-ar" id="tsAr" lang="ar" dir="rtl"></div>
    <button class="ts-icon" id="tsNext" type="button" aria-label="Next dhikr">›</button></div>
    <button class="ts-tap" id="tsTap" type="button" aria-label="Tap to count"><div class="ts-ring" id="tsRing"><strong id="tsCount">0</strong><small>Tap anywhere to count</small></div></button>
    <div class="ts-foot"><button id="tsUndo" class="ts-pill" type="button">− Undo</button><span id="tsTotal"></span></div>`;
  document.body.append(d);
  $('tsClose').onclick=closeTasbih;
  $('tsPrev').onclick=()=>{const n=day().dhikr.length;TS.i=(TS.i-1+n)%n;renderTasbih();};
  $('tsNext').onclick=()=>{const n=day().dhikr.length;TS.i=(TS.i+1)%n;renderTasbih();};
  $('tsTap').onclick=()=>{const it=day().dhikr[TS.i];if(!it)return;const was=+it.count||0,t=+it.target||0;it.count=was+1;
    if(navigator.vibrate)navigator.vibrate(t&&was+1===t?[25,50,25]:10);save();if(t&&was+1===t)toast('✓ '+it.name+' target reached');};
  $('tsUndo').onclick=()=>{const it=day().dhikr[TS.i];if(it&&it.count>0){it.count--;save();}};
  $('tsReset').onclick=()=>{const it=day().dhikr[TS.i];if(it&&it.count>0&&confirm(tr('Reset this count to zero?'))){it.count=0;save();toast(tr('Count reset'));}};
  document.addEventListener('keydown',e=>{if(!d.hidden){if(e.key==='Escape')closeTasbih();if(e.key===' '||e.key==='Enter'){if(e.target.closest&&e.target.closest('.ts-icon,.ts-pill'))return;e.preventDefault();$('tsTap').click();}}});
}
function renderTasbih(){
  const d=$('tasbih');if(!d||d.hidden)return;const items=day().dhikr;if(TS.i>=items.length)TS.i=0;const it=items[TS.i];if(!it)return;
  $('tsName').textContent=it.name;const t=+it.target||0,c=+it.count||0;
  $('tsTarget').textContent=t?`${c} / ${t}`:`${c}`;
  $('tsAr').textContent=it.arabic||'';$('tsCount').textContent=c.toLocaleString();
  const pct=t?Math.min(100,c/t*100):0;$('tsRing').style.setProperty('--p',pct);$('tsRing').classList.toggle('done',t>0&&c>=t);
  $('tsTotal').textContent=dhikrOf(day()).toLocaleString();
}
async function openTasbih(i){
  TS.i=Math.max(0,i||0);$('tasbih').hidden=false;document.body.classList.add('ts-open');renderTasbih();
  try{if(navigator.wakeLock)TS.lock=await navigator.wakeLock.request('screen');}catch{}
}
function closeTasbih(){$('tasbih').hidden=true;document.body.classList.remove('ts-open');try{TS.lock&&TS.lock.release();}catch{}TS.lock=null;}
const __rd=renderDhikr;
renderDhikr=function(){__rd();
  document.querySelectorAll('#dhikrList .dhikr-card').forEach((card,i)=>{const head=$q('.dhikr-head',card);if(!head||$q('.focus-btn',head))return;
    const b=document.createElement('button');b.type='button';b.className='focus-btn';b.setAttribute('aria-label','Tasbih mode');b.textContent='⛶';b.onclick=()=>openTasbih(i);head.append(b);});
  renderTasbih();};

/* =====================================================================
   3. QURAN KHATAM PLANNER
   ===================================================================== */
function injectKhatam(){
  const host=$q('.quran-progress',$('quranPanel'));
  host.insertAdjacentHTML('afterend',`<section class="khatam" id="khatamCard">
    <div class="card-head tight"><h3>Khatam plan</h3></div>
    <div id="khatamBody"></div>
    <details id="khatamSetup"><summary>Plan settings</summary>
      <div class="form-grid">
        <label>Finish by<input type="date" id="kEnd"></label>
        <label>Start date<input type="date" id="kStart"></label>
        <label class="wide">Pages already read<input type="number" id="kOffset" inputmode="numeric" min="0" max="603" value="0"></label>
      </div>
      <div class="chip-row"><span class="field-name">Quick set</span>
        <button type="button" data-kd="30">30 days</button><button type="button" data-kd="60">60 days</button><button type="button" data-kd="90">90 days</button><button type="button" data-kd="365">1 year</button></div>
      <button id="kSave" class="primary full" type="button">Save plan</button>
      <button id="kDelete" class="danger full" type="button" hidden>Delete plan</button>
    </details></section>`);
  const fill=()=>{const K=state.khatam;$('kStart').value=K?K.start:nowKey();$('kEnd').value=K?K.end:addDays(nowKey(),29);$('kOffset').value=K?K.offset:0;$('kDelete').hidden=!K;};
  document.querySelectorAll('[data-kd]').forEach(b=>b.onclick=()=>{const s=$('kStart').value||nowKey();$('kEnd').value=addDays(s,Number(b.dataset.kd)-1);});
  $('kSave').onclick=()=>{const s=$('kStart').value||nowKey(),e=$('kEnd').value;if(!e||e<s){toast(tr('Pick a finish date after the start date'));return;}
    state.khatam={start:s,end:e,offset:Math.max(0,Math.min(603,Math.floor(+$('kOffset').value||0))),total:604};save();toast(tr('Plan saved'));$('khatamSetup').open=false;};
  $('kDelete').onclick=()=>{if(confirm(tr('Delete this khatam plan?'))){state.khatam=null;save();fill();toast(tr('Plan deleted'));}};
  fill();$('khatamSetup').open=!state.khatam;$('khatamSetup').addEventListener('toggle',()=>{if($('khatamSetup').open)fill();});
}
function lastReadInfo(){
  const keys=Object.keys(state.days).sort().reverse();
  for(const k of keys){const q=state.days[k].quran;if(q&&(q.surah||q.ayah))return {k,surah:q.surah,ayah:q.ayah};}
  return null;
}
function renderKhatam(){
  const body=$('khatamBody');if(!body)return;const K=state.khatam,lr=lastReadInfo();
  const lastTxt=lr?`<p class="sub k-last"><span>Last read</span>: <b>${esc(lr.surah||'')}${lr.ayah?(lr.surah?', ':'')+'ayah '+esc(lr.ayah):''}</b> · ${esc(fdate(lr.k))}</p>`:'';
  if(!K){body.innerHTML=`<p class="hint">Pick a finish date and the app works out your daily pages.</p>${lastTxt}`;return;}
  const today=nowKey(),total=K.total||604;
  let read=Number(K.offset)||0;Object.keys(state.days).forEach(k=>{if(k>=K.start)read+=pagesOf(state.days[k]);});
  const todayPages=today>=K.start?pagesOf(peek(today)):0,before=read-todayPages,left=Math.max(0,total-read);
  const daysLeft=Math.max(1,daysBetween(today,K.end)+1),totalDays=Math.max(1,daysBetween(K.start,K.end)+1);
  const need=Math.max(1,Math.ceil(Math.max(0,total-before)/daysLeft));
  const elapsed=Math.min(totalDays,Math.max(0,daysBetween(K.start,today)+1)),off=Number(K.offset)||0;
  const expected=Math.round(off+(total-off)*elapsed/totalDays),diff=read-expected;
  let a7=0;for(let i=0;i<7;i++)a7+=pagesOf(peek(addDays(today,-i)));a7/=7;
  const pct=Math.min(100,Math.round(read/total*100));
  let status,cls='';
  if(left===0){status='Khatam complete — alhamdulillah!';cls='ok';}
  else if(diff>=2){status=`${diff} pages ahead`;cls='ok';}
  else if(diff<=-2){status=`${-diff} pages behind`;cls='warn';}
  else status='On track';
  const proj=(left>0&&a7>0)?fdate(addDays(today,Math.ceil(left/a7)),{month:'short',day:'numeric',year:'numeric'}):null;
  body.innerHTML=`<div class="k-bar"><i style="width:${pct}%"></i></div>
    <div class="k-grid"><div><small>Pages read</small><strong>${read}<em>/${total}</em></strong></div><div><small>Pages left</small><strong>${left}</strong></div>
    <div><small>Pages per day</small><strong>${left===0?0:need}</strong></div><div><small>Days left</small><strong>${daysLeft}</strong></div></div>
    <p class="k-status ${cls}">${esc(status)}</p>${proj?`<p class="sub"><span>Projected finish</span>: <b>${esc(proj)}</b></p>`:''}${lastTxt}
    ${left>0?`<button class="secondary full" id="kApply" type="button"><span>Set today’s target to</span> <b>${need}</b> <span>pages</span></button>`:''}`;
  const ap=$('kApply');if(ap)ap.onclick=()=>{day().quran.target=need;save();loadQuranForm();toast(tr('Quran progress saved'));};
}
const __rq=renderQuran;renderQuran=function(){__rq();renderKhatam();};

/* =====================================================================
   4. QAZA: plan + auto-count from the Salah screen
   ===================================================================== */
function injectQaza(){
  $q('.hint',$('qazaPanel')).insertAdjacentHTML('afterend',`<section class="qplan" id="qazaPlan"><h3>Qaza plan</h3>
    <p class="hint">Set how many prayers you need to make up. Record completed make-up prayers here using the Qaza tracker controls.</p>
    <div id="qazaPlanRows"></div><div class="qplan-total"><span>Total remaining</span><strong id="qzRem">0</strong></div></section>`);
  $('prayerList').addEventListener('change',e=>{
    const sel=e.target;if(!sel.classList||!sel.classList.contains('prayer-place'))return;
    const name=sel.dataset.prayer;if(!name)return;const key=selectedDate+'|'+name;state.qazaAuto??={};
    if(sel.value==='Qaza'&&!state.qazaAuto[key]){state.qazaAuto[key]=1;state.qazaTotals[name]=(state.qazaTotals[name]||0)+1;state.qazaLog.push({date:selectedDate,prayer:name,auto:true});save();toast(tr('Counted as Qaza'));}
    else if(sel.value!=='Qaza'&&state.qazaAuto[key]){delete state.qazaAuto[key];state.qazaTotals[name]=Math.max(0,(state.qazaTotals[name]||0)-1);
      for(let i=state.qazaLog.length-1;i>=0;i--){const l=state.qazaLog[i];if(l.auto&&l.date===selectedDate&&l.prayer===name){state.qazaLog.splice(i,1);break;}}save();}
  });
}
function renderQazaPlan(){
  const root=$('qazaPlanRows');if(!root)return;state.qazaOwed??={};let rem=0;root.innerHTML='';
  PRAYERS5.forEach(p=>{const owed=+state.qazaOwed[p]||0,done=+state.qazaTotals[p]||0,left=Math.max(0,owed-done);rem+=left;
    const row=document.createElement('div');row.className='qrow';
    row.innerHTML=`<b>${p}</b><label><small>Owed</small><input type="number" min="0" inputmode="numeric" value="${owed}" aria-label="${p} owed"></label><span><small>Done </small><b>${done}</b></span><span><small>Remaining</small><b class="${left?'':'zero'}">${left}</b></span>`;
    $q('input',row).addEventListener('change',e=>{state.qazaOwed[p]=Math.max(0,Math.floor(+e.target.value||0));save();});root.append(row);});
  $('qzRem').textContent=rem.toLocaleString();
}

/* =====================================================================
   5. TRENDS (Reports)
   ===================================================================== */
const TR={range:'30',metric:'salah'};
function injectTrends(){
  $q('.weekly-report',$('insightsPanel')).insertAdjacentHTML('afterend',`<section class="trends" id="trends"><h3>Trends</h3>
    <div class="segmented" id="trRange"><button type="button" data-r="30" class="active">30 days</button><button type="button" data-r="12">12 weeks</button></div>
    <div class="segmented" id="trMetric"><button type="button" data-m="salah" class="active">Prayers</button><button type="button" data-m="quran">Quran</button><button type="button" data-m="dhikr">Dhikr</button></div>
    <div id="trChart" class="tr-chart"></div><div id="trInsights"></div></section>`);
  $('trRange').onclick=e=>{const b=e.target.closest('button');if(!b)return;TR.range=b.dataset.r;renderTrends();};
  $('trMetric').onclick=e=>{const b=e.target.closest('button');if(!b)return;TR.metric=b.dataset.m;renderTrends();};
}
function metricOf(d,m){return m==='salah'?fardOf(d):m==='quran'?pagesOf(d):dhikrOf(d);}
function renderTrends(){
  if(!$('trends'))return;
  document.querySelectorAll('#trRange button').forEach(b=>b.classList.toggle('active',b.dataset.r===TR.range));
  document.querySelectorAll('#trMetric button').forEach(b=>b.classList.toggle('active',b.dataset.m===TR.metric));
  const today=nowKey(),pts=[];
  if(TR.range==='30'){for(let i=29;i>=0;i--){const k=addDays(today,-i);pts.push({k,v:metricOf(peek(k),TR.metric)});}}
  else{for(let w=11;w>=0;w--){let s=0;for(let j=0;j<7;j++)s+=metricOf(peek(addDays(today,-(w*7+j))),TR.metric);pts.push({k:addDays(today,-(w*7+6)),v:s});}}
  const cap=TR.metric==='salah'?(TR.range==='30'?5:35):0,max=Math.max(1,cap,...pts.map(p=>p.v)),W=320,H=120,padL=4,padR=4,padT=8,padB=4,n=pts.length,slot=(W-padL-padR)/n,bw=slot*0.68;
  const avg=pts.reduce((a,p)=>a+p.v,0)/n,ay=padT+(H-padT-padB)*(1-avg/max);
  let bars='';pts.forEach((p,i)=>{const h=Math.max(p.v>0?2:0,(H-padT-padB)*p.v/max),x=padL+i*slot+(slot-bw)/2,y=H-padB-h;bars+=`<rect class="tbar ${p.k===today||i===n-1?'last':''}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="2"><title>${fdate(p.k)}: ${p.v}</title></rect>`;});
  const unit=TR.metric==='salah'?'/5':'';
  $('trChart').className='tr-chart m-'+TR.metric;
  $('trChart').innerHTML=`<div class="tr-meta"><span><b>${(Math.round(avg*10)/10).toLocaleString()}</b>${unit} <small>${TR.range==='30'?'per day':'per week'} · average</small></span><span class="tr-max">max ${max.toLocaleString()}</span></div>
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Trend chart" preserveAspectRatio="none">${bars}<line class="tavg" x1="0" x2="${W}" y1="${ay.toFixed(1)}" y2="${ay.toFixed(1)}"/></svg>
    <div class="tr-axis"><span>${esc(fdate(pts[0].k))}</span><span>${esc(fdate(pts[n-1].k))}</span></div>`;
  // insights: best weekday + prayer consistency
  const first=Object.keys(state.days).filter(k=>fardOf(state.days[k])>0||pagesOf(state.days[k])>0||dhikrOf(state.days[k])>0).sort()[0];
  const ins=$('trInsights');
  if(!first||daysBetween(first,today)<2){ins.innerHTML='<p class="hint">Not enough data yet — keep logging!</p>';return;}
  const wd=Array.from({length:7},()=>({s:0,c:0}));
  for(let i=0;i<84;i++){const k=addDays(today,-i);if(k<first)break;const w=keyDate(k).getDay();wd[w].s+=fardOf(peek(k));wd[w].c++;}
  let bi=-1,bv=-1;wd.forEach((x,i)=>{if(x.c){const v=x.s/x.c;if(v>bv){bv=v;bi=i;}}});
  const ref=new Date(2024,0,7+bi),bestName=bi>=0?ref.toLocaleDateString(undefined,{weekday:'long'}):'—';
  const rows=PRAYERS5.map(p=>{let hit=0,tot=0;for(let i=0;i<30;i++){const k=addDays(today,-i);if(k<first)break;tot++;const d=peek(k);if(d&&d.checks){const g=prayers.find(x=>x.name===p);if(g.items.some(it=>it[1]==='Fard'&&d.checks[pkey(p,it[0])]))hit++;}}return {p,pct:tot?Math.round(hit/tot*100):0};});
  const weak=[...rows].sort((a,b)=>a.pct-b.pct)[0],strong=[...rows].sort((a,b)=>b.pct-a.pct)[0];
  ins.innerHTML=`<div class="ins-cards"><div><small>Best day</small><strong>${esc(bestName)}</strong><em>${(Math.round(bv*10)/10)}/5 <span>average</span></em></div>
    <div><small>Needs attention</small><strong>${esc(weak.p)}</strong><em>${weak.pct}%</em></div></div>
    <h4>Prayer consistency (last 30 days)</h4>`+rows.map(r=>`<div class="pc-row"><span>${r.p}</span><div class="pc-bar"><i style="width:${r.pct}%"></i></div><b>${r.pct}%</b></div>`).join('');
}

/* =====================================================================
   6. DAILY REFLECTION (Good deeds screen)
   ===================================================================== */
let refTimer;
function injectReflection(){
  $q('.hint',$('goodPanel')).insertAdjacentHTML('afterend',`<section class="reflect" id="reflectCard"><h3>Daily reflection</h3>
    <label class="field"><span class="field-name">Alhamdulillah for…</span><textarea id="refGrateful" rows="2" maxlength="400" placeholder="Write a few words (private, saved on this device)"></textarea></label>
    <label class="field"><span class="field-name">To improve tomorrow…</span><textarea id="refImprove" rows="2" maxlength="400" placeholder="Write a few words (private, saved on this device)"></textarea></label>
    <div id="refPast"></div></section>`);
  const saveRef=()=>{const d=day();d.reflection={grateful:$('refGrateful').value.trim(),improve:$('refImprove').value.trim()};persist();renderPast();};
  ['refGrateful','refImprove'].forEach(id=>$(id).addEventListener('input',()=>{clearTimeout(refTimer);refTimer=setTimeout(saveRef,500);}));
}
function loadReflection(force){
  if(!$('refGrateful'))return;
  const active=document.activeElement&&(document.activeElement.id==='refGrateful'||document.activeElement.id==='refImprove');
  if(active&&!force)return;
  const r=(peek(selectedDate)||{}).reflection||{};
  if($('refGrateful').value!==(r.grateful||''))$('refGrateful').value=r.grateful||'';
  if($('refImprove').value!==(r.improve||''))$('refImprove').value=r.improve||'';
  renderPast();
}
function renderPast(){
  const root=$('refPast');if(!root)return;root.innerHTML='';
  const items=Object.keys(state.days).filter(k=>k!==selectedDate&&state.days[k].reflection&&(state.days[k].reflection.grateful||state.days[k].reflection.improve)).sort().reverse().slice(0,5);
  if(!items.length)return;const h=document.createElement('h4');h.textContent='Earlier reflections';root.append(h);
  items.forEach(k=>{const r=state.days[k].reflection,det=document.createElement('details');det.className='ref-item';
    const sm=document.createElement('summary');sm.textContent=fdate(k,{weekday:'short',month:'short',day:'numeric'});det.append(sm);
    if(r.grateful){const p=document.createElement('p');const b=document.createElement('b');b.textContent='Grateful for';p.append(b,': ',document.createTextNode(r.grateful));det.append(p);}
    if(r.improve){const p=document.createElement('p');const b=document.createElement('b');b.textContent='To improve';p.append(b,': ',document.createTextNode(r.improve));det.append(p);}
    root.append(det);});
}

/* =====================================================================
   7. CLOUD BACKUP (share sheet → Google Drive / Files) + reminder banner
   ===================================================================== */
function injectBackup(){
  $q('.backup-actions',$('settingsPanel')).insertAdjacentHTML('afterend',`<section class="cloud-card"><h3>Cloud backup</h3>
    <p class="hint">Opens your phone’s share sheet — choose Google Drive, Files, email or WhatsApp.</p>
    <button id="cloudBackup" class="primary full" type="button">Back up to Google Drive / Files</button>
    <p class="tiny-note" id="lastBackupTxt"></p></section>`);
  $('cloudBackup').onclick=()=>doBackup(true);
  $('backupData').onclick=()=>doBackup(false);
  renderBackupInfo();
}
async function doBackup(viaShare){
  const name=`my-ibadah-backup-${nowKey()}.json`;state.lastBackup=nowKey();const text=JSON.stringify(state,null,2);
  if(!IS_NATIVE()&&viaShare&&navigator.canShare){
    try{const f=new File([text],name,{type:'application/json'});if(navigator.canShare({files:[f]})){await navigator.share({files:[f],title:name});persist();renderBackupInfo();return;}}
    catch(e){if(e&&e.name==='AbortError'){return;}}
  }
  await saveFile(name,text,'application/json');persist();renderBackupInfo();renderBanners(true);
}
function renderBackupInfo(){const el=$('lastBackupTxt');if(!el)return;el.textContent='Last backup: '+(state.lastBackup?fdate(state.lastBackup,{month:'short',day:'numeric',year:'numeric'}):'never');}

/* =====================================================================
   8. RAMADAN TOOLS
   ===================================================================== */
const HF=new Intl.DateTimeFormat('en-u-ca-islamic-umalqura',{day:'numeric',month:'numeric',year:'numeric'});
function hijri(d){const p={};HF.formatToParts(d).forEach(x=>p[x.type]=x.value);return {d:+p.day,m:+p.month,y:+p.year};}
let __ramCache={};
function autoRamStart(){
  const t=nowKey();if(__ramCache.t===t)return __ramCache.v;let v=null;
  for(let i=-35;i<=430;i++){const k=addDays(t,i);const h=hijri(keyDate(k));if(h.m===9&&h.d===1){v=k;break;}}
  __ramCache={t,v};return v;
}
const ramStart=()=>state.settings.ramadanStart||autoRamStart();
function inRamadan(){const h=hijri(new Date());return h.m===9?h.d:0;}
function tToDate(str,add=0){const m=/(\d{1,2}):(\d{2})/.exec(str||'');if(!m)return null;const d=new Date();d.setHours(+m[1],+m[2],0,0);d.setDate(d.getDate()+add);return d;}
const dur=ms=>{const t=Math.max(0,Math.round(ms/60000)),h=Math.floor(t/60),m=t%60;return h?`${h}h ${m}m`:`${m}m`;};
function countdown(){
  const T=typeof __times!=='undefined'?__times:null;if(!T)return null;
  const now=new Date(),fajr=tToDate(T.Fajr),mag=tToDate(T.Maghrib);if(!fajr||!mag)return null;
  if(now<fajr)return {label:'Suhoor ends in',ms:fajr-now,f:T.Fajr,m:T.Maghrib};
  if(now<mag)return {label:'Iftar in',ms:mag-now,f:T.Fajr,m:T.Maghrib};
  return {label:'Next suhoor ends in',ms:tToDate(T.Fajr,1)-now,f:T.Fajr,m:T.Maghrib,passed:true};
}
function injectRamadan(){
  $q('.section-heading',$('ramadanPanel')).insertAdjacentHTML('afterend',`<section class="ram-card" id="ramCard">
      <div class="ram-top"><div><small id="ramLabel">—</small><strong id="ramTime">—</strong></div><div class="ram-times" id="ramTimes"></div></div>
      <p class="ram-sub" id="ramSub"></p></section>
    <section class="ram-grid-card"><h3>30-day fasting grid</h3><div class="ram-grid" id="ramGrid"></div>
      <div class="legend"><span><i class="dot"></i> Fasted</span><span><i class="dot partial"></i> Excused</span><span><i class="dot miss"></i> Not fasted</span></div>
      <div class="ram-stats" id="ramStats"></div>
      <label class="field ram-start"><span class="field-name">Start date (1 Ramadan)</span><input type="date" id="ramStartInput"></label>
      <p class="tiny-note">Auto-detected from the Umm al-Qura calendar. Adjust if your local moon-sighting differs.</p></section>`);
  $('ramStartInput').addEventListener('change',e=>{state.settings.ramadanStart=e.target.value||undefined;persist();__ramCache={};renderRamadan();});
}
function renderRamCountdown(){
  const el=$('ramLabel');if(!el)return;const c=countdown(),rd=inRamadan(),start=ramStart();
  if(c){$('ramLabel').textContent=c.label;$('ramTime').textContent=dur(c.ms);
    const f=fmt12(c.f),m=fmt12(c.m);$('ramTimes').innerHTML=`<span><small>Fajr</small>${f.t} ${f.ap}</span><span><small>Maghrib</small>${m.t} ${m.ap}</span>`;}
  else{$('ramLabel').textContent='Sehri / Iftar';$('ramTime').textContent='—';$('ramTimes').innerHTML='';}
  const sub=$('ramSub');
  if(rd)sub.textContent='Ramadan Day '+rd;
  else if(start&&start>nowKey())sub.textContent='Ramadan starts in '+daysBetween(nowKey(),start)+' days';else sub.textContent='';
}
function renderRamadan(){
  if(!$('ramGrid'))return;renderRamCountdown();
  const start=ramStart(),grid=$('ramGrid'),today=nowKey();grid.innerHTML='';let f=0,m=0,x=0,juz=0;
  $('ramStartInput').value=state.settings.ramadanStart||start||'';
  if(!start){return;}
  for(let n=1;n<=30;n++){const k=addDays(start,n-1),e=state.ramadan[k]||{};
    const st=e.fasting==='Fasted'?'f':e.fasting==='Not fasted'?'m':e.fasting==='Excused'?'x':'';
    if(st==='f')f++;else if(st==='m')m++;else if(st==='x')x++;juz+=Number(e.juz)||0;
    const b=document.createElement('button');b.type='button';b.className='rc '+st+(k===today?' today':'')+(k>today?' future':'')+(k===selectedDate?' sel':'');b.textContent=n;
    b.setAttribute('aria-label',`Ramadan day ${n}, ${fdate(k)}`);
    b.onclick=()=>{selectedDate=k;$('datePicker').value=k;renderAll();loadRamadan();};grid.append(b);}
  $('ramStats').innerHTML=`<div><small>Fasted days</small><strong>${f}</strong></div><div><small>Make-up fasts owed</small><strong>${m+x}</strong></div><div><small>Juz completed</small><strong>${juz}</strong></div>`;
}
const __lr=loadRamadan;
loadRamadan=function(){__lr();
  if(!$('ramadanDay').value){const st=ramStart();if(st){const n=daysBetween(st,selectedDate)+1;if(n>=1&&n<=30)$('ramadanDay').value=n;}}
  renderRamadan();};

/* =====================================================================
   9. HOME BANNERS (backup reminder + Ramadan chip)
   ===================================================================== */
let __banSig='';
function renderBanners(force){
  const root=$('homeBanners');if(!root)return;const today=nowKey();const parts=[];let sig='';
  const rd=inRamadan(),c=rd?countdown():null;
  if(rd){const t=c?dur(c.ms):'';sig+='R'+rd+t+(c?c.label:'');parts.push('ram');}
  const active=Object.keys(state.days).filter(k=>fardOf(state.days[k])>0).length;
  const since=state.lastBackup?daysBetween(state.lastBackup,today):999;
  const showBk=active>=3&&since>=7&&!(state.backupSnooze&&state.backupSnooze>today);
  if(showBk){sig+='B';parts.push('bk');}
  if(!force&&sig===__banSig&&root.dataset.lang===I18N.get())return;__banSig=sig;root.dataset.lang=I18N.get();root.innerHTML='';
  if(rd){const b=document.createElement('button');b.type='button';b.className='card ram-chip';b.innerHTML=`<span aria-hidden="true">🌙</span><div><b>Ramadan Day ${rd}</b><small>${c?esc(c.label)+' '+esc(dur(c.ms)):''}</small></div><i aria-hidden="true">›</i>`;b.onclick=()=>setTab('ramadan');root.append(b);}
  if(showBk){const d=document.createElement('div');d.className='card bk-banner';d.innerHTML=`<span aria-hidden="true">☁️</span><div><b>Backup reminder</b><p>It has been a while since your last backup. Save a copy to Google Drive or Files so you never lose your records.</p>
    <div class="inline-controls"><button type="button" class="primary" id="bkNow">Back up now</button><button type="button" class="secondary" id="bkLater">Later</button></div></div>`;root.append(d);
    $('bkNow').onclick=()=>doBackup(true);$('bkLater').onclick=()=>{state.backupSnooze=addDays(today,3);persist();renderBanners(true);};}
}

/* =====================================================================
   WIRING
   ===================================================================== */
function extras(){
  renderStreaks();renderBanners();
  if(visible('quran'))renderKhatam();
  if(visible('qaza'))renderQazaPlan();
  if(visible('insights'))renderTrends();
  if(visible('good'))loadReflection(false);
  if(visible('ramadan'))renderRamadan();
  if(window.I18N)I18N.fixHijri();
}
const __ra=renderAll;
renderAll=function(){__ra();try{extras();}catch(e){console.error('extras',e);}};
const __stF=setTab;
setTab=function(t){__stF(t);try{
  if(t==='quran')renderKhatam();if(t==='qaza')renderQazaPlan();if(t==='insights')renderTrends();
  if(t==='good')loadReflection(true);if(t==='ramadan'){renderRamadan();}if(t==='settings')renderBackupInfo();
  if(window.I18N)I18N.fixHijri();}catch(e){console.error('tab',e);}};
// app.js patch: prayer location selects need the prayer name for auto-Qaza
document.addEventListener('langchange',()=>{__banSig='';try{renderAll();}catch{}});

injectHome();buildTasbih();injectKhatam();injectQaza();injectTrends();injectReflection();injectBackup();injectRamadan();
$('moreTasbih').onclick=()=>{closeMore();openTasbih(0);};
setInterval(()=>{try{renderRamCountdown();renderBanners();}catch{}},30000);
renderAll();
