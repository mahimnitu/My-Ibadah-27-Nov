const $=id=>document.getElementById(id),STORE='myIbadah.v2';
const prayers=[{name:'Fajr',items:[['2 Rakat Sunnah','Sunnah'],['2 Rakat Fard','Fard']]},{name:'Dhuhr',items:[['4 Rakat Sunnah (before)','Sunnah'],['4 Rakat Fard','Fard'],['2 Rakat Sunnah (after)','Sunnah']]},{name:'Asr',items:[['4 Rakat Fard','Fard']]},{name:'Maghrib',items:[['3 Rakat Fard','Fard'],['2 Rakat Sunnah (after)','Sunnah']]},{name:'Isha',items:[['4 Rakat Fard','Fard'],['2 Rakat Sunnah (after)','Sunnah'],['3 Rakat Witr','Witr']]}];
const defaults=[{name:'SubhanAllah',arabic:'سُبْحَانَ اللَّهِ',target:33,count:0},{name:'Alhamdulillah',arabic:'الْحَمْدُ لِلَّهِ',target:33,count:0},{name:'Allahu Akbar',arabic:'اللَّهُ أَكْبَرُ',target:34,count:0},{name:'Astaghfirullah',arabic:'أَسْتَغْفِرُ اللَّهَ',target:100,count:0},{name:'Durood Sharif',arabic:'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ',target:100,count:0}];
const deedDefaults=['Prayed on time','Prayed in congregation','Read Quran','Morning Azkar','Evening Azkar','Made dua for parents','Helped someone','Gave Sadaqah','Maintained family ties','Avoided backbiting'];
const azkar={morning:['Ayat al-Kursi','Surah Al-Ikhlas (3 times)','Surah Al-Falaq (3 times)','Surah An-Nas (3 times)','Sayyidul Istighfar','SubhanAllahi wa bihamdihi (100 times)','Morning remembrance duas'],evening:['Ayat al-Kursi','Surah Al-Ikhlas (3 times)','Surah Al-Falaq (3 times)','Surah An-Nas (3 times)','Sayyidul Istighfar','Amsayna wa amsal-mulku lillah','Evening remembrance duas'],sleep:['Ayat al-Kursi','Last two verses of Surah Al-Baqarah','Surah Al-Ikhlas, Al-Falaq & An-Nas','Tasbih: SubhanAllah 33, Alhamdulillah 33, Allahu Akbar 34','Dua before sleeping']};
const hadiths=[['The most beloved deeds to Allah are those done regularly, even if they are few.','Sahih al-Bukhari 6464; Sahih Muslim 783'],['The strong person is the one who controls himself when angry.','Sahih al-Bukhari 6114; Sahih Muslim 2609'],['A good word is charity.','Sahih al-Bukhari 2989; Sahih Muslim 1009'],['Whoever believes in Allah and the Last Day, let him speak good or remain silent.','Sahih al-Bukhari 6018; Sahih Muslim 47'],['The best of you are those who learn the Quran and teach it.','Sahih al-Bukhari 5027']];
let selectedDate=localKey(new Date()),viewMonth=new Date(),azkarMode='morning',state=load(),timerHandles=[];
function localKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function blankState(){return {days:{},qazaTotals:{Fajr:0,Dhuhr:0,Asr:0,Maghrib:0,Isha:0},qazaLog:[],settings:{city:'Dhaka',country:'Bangladesh',method:'1',reminders:false},ramadan:{}};}
function load(){let s;try{s=JSON.parse(localStorage.getItem(STORE)||localStorage.getItem('myIbadah.v1'))}catch{};if(!s||typeof s!=='object')s=blankState();s.days??={};s.qazaTotals??=blankState().qazaTotals;s.qazaLog??=[];s.settings={...blankState().settings,...s.settings};s.ramadan??={};s.customAzkar??=[];return s;}
function save(){localStorage.setItem(STORE,JSON.stringify(state));renderAll();}
function day(key=selectedDate){if(!state.days[key])state.days[key]={checks:{},prayerPlaces:{},dhikr:defaults.map(x=>({...x})),quran:{surah:'',ayah:'',pages:0,target:10},azkar:{},good:{}};let d=state.days[key];d.checks??={};d.prayerPlaces??={};d.optionalPrayers??={};d.dhikr??=defaults.map(x=>({...x}));d.quran??={surah:'',ayah:'',pages:0,target:10};d.azkar??={};d.good??={};return d;}
let __toastT;function toast(s){let t=$('toast');t.textContent=s;t.classList.add('show');clearTimeout(__toastT);__toastT=setTimeout(()=>t.classList.remove('show'),2200);}
const MORE_TABS=['azkar','duas','times','good','insights','ramadan','settings','qibla','qaza'];
function closeMore(){const s=$('moreSheet');if(!s)return;s.classList.remove('open');s.setAttribute('aria-hidden','true');}
function openMore(){const s=$('moreSheet');s.classList.add('open');s.setAttribute('aria-hidden','false');}
function syncNav(tab){document.body.dataset.tab=tab;document.querySelectorAll('.bn-item').forEach(b=>{const n=b.dataset.nav,on=n==='more'?MORE_TABS.includes(tab):n===tab;b.classList.toggle('active',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});}
function setTab(tab){syncNav(tab);closeMore();window.scrollTo({top:0,behavior:'instant'});document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));['dashboard','salah','qaza','dhikr','quran','azkar','duas','times','good','insights','ramadan','settings','qibla'].forEach(x=>{const p=$(x+'Panel');if(p)p.classList.toggle('hidden',x!==tab);});if(tab==='insights'){renderCalendar();renderWeeklyReport();}if(tab==='quran')loadQuranForm();if(tab==='azkar')renderAzkar();if(tab==='good')renderGood();if(tab==='ramadan')loadRamadan();if(tab==='times'&&!$('prayerTimes').children.length)fetchTimes();}
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab)));document.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.goto)));function moveSelectedDate(offset){const d=new Date(selectedDate+'T12:00:00');d.setDate(d.getDate()+offset);selectedDate=localKey(d);$('datePicker').value=selectedDate;renderAll();}if($('previousDateBtn'))$('previousDateBtn').onclick=()=>moveSelectedDate(-1);if($('nextDateBtn'))$('nextDateBtn').onclick=()=>moveSelectedDate(1);const goToToday=()=>{selectedDate=localKey(new Date());$('datePicker').value=selectedDate;renderAll();};if($('dashboardDateBtn'))$('dashboardDateBtn').onclick=goToToday;
$('datePicker').value=selectedDate;$('datePicker').addEventListener('change',e=>{selectedDate=e.target.value||localKey(new Date());renderAll();});
function pkey(n,l){return n+'|'+l;}
function itemsFor(g,key=selectedDate){const d=day(key);return [...g.items,...(d.optionalPrayers?.[g.name]||[]).map(x=>[x.label,x.type||'Optional'])];}
function counts(key=selectedDate){let d=day(key),total=0,fard=0,all=0;prayers.forEach(g=>itemsFor(g,key).forEach(([l,t])=>{all++;if(d.checks[pkey(g.name,l)]){total++;if(t==='Fard')fard++;}}));return {total,fard,all};}
function mk(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;}
function renderSalah(){const root=$('prayerList'),d=day();root.innerHTML='';prayers.forEach(g=>{const items=itemsFor(g),done=items.filter(i=>d.checks[pkey(g.name,i[0])]).length,all=done===items.length;const card=mk('div','prayer-card'+(all?' complete':''));const h=mk('div','prayer-title');const title=mk('strong','',g.name);if(__times&&__times[g.name]){const f=fmt12(__times[g.name]);title.append(mk('small','',f.t+' '+f.ap));}const count=mk('span','count',`${done}/${items.length}`);const ma=mk('button','mark-all',all?'Clear':'Mark all');ma.type='button';ma.setAttribute('aria-label',(all?'Clear all ':'Mark all ')+g.name+' items');ma.onclick=()=>{const dd=day();items.forEach(i=>dd.checks[pkey(g.name,i[0])]=!all);save();};const place=mk('select','prayer-place');place.setAttribute('aria-label',g.name+' prayer location');place.dataset.prayer=g.name;[['','How did you pray?'],['Jamaat','Jamaat'],['Single','Single'],['Others','Others']].forEach(([v,t])=>{const o=mk('option','',t);o.value=v;place.append(o);});const savedPlace=d.prayerPlaces[g.name]||'';const savedIsOthers=savedPlace==='Others'||savedPlace.startsWith('Others:');place.value=savedPlace.startsWith('Jamaat @')?'Jamaat':savedPlace.startsWith('Single @')?'Single':(savedIsOthers?'Others':(['Jamaat','Single'].includes(savedPlace)?savedPlace:''));const customPlace=mk('input','prayer-place-custom');customPlace.type='text';customPlace.placeholder='Please specify where';customPlace.setAttribute('aria-label','Specify other prayer location');customPlace.value=savedPlace.startsWith('Others:')?savedPlace.slice(7):'';customPlace.hidden=place.value!=='Others';customPlace.addEventListener('input',()=>{const dd=day();dd.prayerPlaces[g.name]='Others: '+customPlace.value;localStorage.setItem(STORE,JSON.stringify(state));});place.addEventListener('change',()=>{const dd=day();dd.prayerPlaces[g.name]=place.value==='Others'?'Others':place.value;customPlace.hidden=place.value!=='Others';if(place.value!=='Others')customPlace.value='';save();});h.append(title,count,ma,place,customPlace);card.append(h);items.forEach(([label,type])=>{const row=mk('div','prayer-row');const cb=document.createElement('input');cb.type='checkbox';cb.checked=!!d.checks[pkey(g.name,label)];cb.addEventListener('change',()=>{day().checks[pkey(g.name,label)]=cb.checked;save();});const txt=mk('label','',label);cb.id='chk'+(window.__cid=(window.__cid||0)+1);txt.htmlFor=cb.id;const tag=mk('span','tag '+(type==='Fard'?'fard':type==='Witr'?'witr':type==='Optional'?'optional':''),type);row.append(cb,txt,tag);row.addEventListener('click',e=>{if(e.target===row||e.target===tag)cb.click();});card.append(row);});const det=mk('details','extra-add');det.append(mk('summary','','＋ Add extra prayer'));const addRow=mk('div','optional-add-row');const addInput=document.createElement('input');addInput.type='text';addInput.maxLength=60;addInput.placeholder='e.g. 2 Rakat Nafl';addInput.setAttribute('aria-label','Optional prayer for '+g.name);const addBtn=mk('button','secondary optional-add-btn','Add');addBtn.type='button';addBtn.addEventListener('click',()=>{const label=addInput.value.trim();if(!label){toast('Enter the prayer name first');addInput.focus();return;}const list=day().optionalPrayers[g.name]??=[];if(itemsFor(g).some(x=>x[0].toLowerCase()===label.toLowerCase())){toast('Already in the list');return;}list.push({label,type:'Optional'});save();toast('Prayer added');});addRow.append(addInput,addBtn);det.append(addRow);card.append(det);root.append(card);});}
function renderHeader(){const chosen=new Date(selectedDate+'T12:00:00'),today=localKey(new Date()),isToday=selectedDate===today;const diff=Math.round((chosen-new Date(today+'T12:00:00'))/86400000);$('prettyDate').textContent=chosen.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});$('dashboardDateBtn').textContent=isToday?'Today':diff===-1?'Yesterday (tap for today)':diff===1?'Tomorrow (tap for today)':'Back to today';try{$('hijriDate').textContent=new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura',{day:'numeric',month:'long',year:'numeric'}).format(chosen).replace(/\s*AH$/i,'')+' AH';}catch{$('hijriDate').textContent='';}$('dashboardDateBtn').setAttribute('aria-label',isToday?'Showing today':'Go back to today');}
function renderQaza(){let root=$('qazaList');root.innerHTML='';Object.keys(state.qazaTotals).forEach(n=>{let r=document.createElement('div');r.className='prayer-row';r.style.cssText='border:1px solid var(--line);border-radius:12px;margin:8px 0';r.innerHTML=`<span style="flex:1;font-weight:700">${n}</span><strong style="color:var(--green)">${state.qazaTotals[n]||0}</strong><span class="target">completed</span>`;root.append(r);});$('qazaTotal').textContent=Object.values(state.qazaTotals).reduce((a,b)=>a+(+b||0),0);$('qazaToday').textContent=state.qazaLog.filter(x=>x.date===selectedDate).length;}
$('addQaza').addEventListener('click',()=>{let p=$('qazaPrayer').value;state.qazaTotals[p]=(state.qazaTotals[p]||0)+1;state.qazaLog.push({date:selectedDate,prayer:p});save();toast('Qaza completion recorded');});
function renderDhikr(){const root=$('dhikrList'),items=day().dhikr;root.innerHTML='';const tr=$('dhikrTargetSettings');if(tr){tr.innerHTML='';items.forEach((it,i)=>{const row=mk('label','dhikr-target-row');const input=document.createElement('input');input.type='number';input.min='1';input.step='1';input.inputMode='numeric';input.value=Math.max(1,Number(it.target)||1);input.setAttribute('aria-label','Daily target for '+it.name);input.addEventListener('change',()=>{day().dhikr[i].target=Math.max(1,Math.floor(Number(input.value)||1));save();toast('Target updated');});row.append(mk('span','',it.name),input);tr.append(row);});}items.forEach((it,i)=>{const reached=(it.target||0)>0&&it.count>=it.target;const card=mk('div','dhikr-card'+(reached?' done':''));const head=mk('div','dhikr-head');head.append(mk('span','',it.name),mk('span','target',(reached?'✓ ':'')+`${it.count} / ${it.target||0}`));const ar=mk('div','dhikr-ar',it.arabic||'');ar.lang='ar';ar.dir='rtl';const meter=mk('div','meter');const fill=document.createElement('div');fill.style.width=Math.min(100,(it.count/(it.target||1))*100)+'%';meter.append(fill);const ctr=mk('div','counter-row');const minus=mk('button','','−');minus.type='button';minus.setAttribute('aria-label','Subtract one from '+it.name);const val=mk('strong','',it.count);const plus=mk('button','plus','+1');plus.type='button';plus.setAttribute('aria-label','Add one to '+it.name);minus.onclick=()=>{day().dhikr[i].count=Math.max(0,+day().dhikr[i].count-1);save();};plus.onclick=()=>{if(navigator.vibrate)navigator.vibrate(reached?8:12);const was=+day().dhikr[i].count,t=day().dhikr[i].target||0;day().dhikr[i].count=was+1;save();if(t&&was+1===t){if(navigator.vibrate)navigator.vibrate([20,40,20]);toast('✓ '+it.name+' target reached');}};ctr.append(minus,val,plus);card.append(head);if(it.arabic)card.append(ar);card.append(meter,ctr);root.append(card);});$('dhikrTotal').textContent=items.reduce((a,x)=>a+(+x.count||0),0).toLocaleString();}
$('addCustomDhikr').onclick=()=>{let n=$('customDhikr').value.trim();if(!n)return;day().dhikr.push({name:n,arabic:'',target:100,count:0});$('customDhikr').value='';save();};
function loadQuranForm(){let q=day().quran;$('quranSurah').value=q.surah||'';$('quranAyah').value=q.ayah||'';$('quranPages').value=q.pages||0;$('quranTarget').value=q.target||10;renderQuran();}
function renderQuran(){let q=day().quran,p=Math.min(100,Math.round((q.pages/Math.max(1,q.target))*100));$('quranMeter').style.width=p+'%';$('quranProgressText').textContent=q.pages>=q.target?`✓ Goal reached · ${q.pages} pages`:`${q.pages} of ${q.target} pages (${p}%)`;if($('quranStat'))$('quranStat').textContent=q.pages||0;}
$('quranPages').addEventListener('input',()=>{day().quran.pages=Math.max(0,Number($('quranPages').value)||0);save();});
$('saveQuran').onclick=()=>{day().quran={surah:$('quranSurah').value.trim(),ayah:$('quranAyah').value,pages:Math.max(0,+$('quranPages').value||0),target:Math.max(1,+$('quranTarget').value||10)};save();toast('Quran progress saved');};
function renderAzkar(){let root=$('azkarList');root.innerHTML='';const addRow=(name,key)=>{let row=document.createElement('label');row.className='check-row';let cb=document.createElement('input');cb.type='checkbox';cb.checked=!!day().azkar[key];cb.onchange=()=>{day().azkar[key]=cb.checked;save();};let t=document.createElement('span');t.textContent=name;row.append(cb,t);root.append(row);};azkar[azkarMode].forEach((name,i)=>addRow(name,azkarMode+'|'+i));(state.customAzkar||[]).filter(x=>x.mode===azkarMode).forEach(x=>addRow(x.text,'custom|'+x.id));$('azkarAddMode').textContent='New Azkar will be added to '+(azkarMode==='sleep'?'Before sleep':azkarMode)+' list.';}
document.querySelectorAll('.azkar-mode').forEach(b=>b.onclick=()=>{azkarMode=b.dataset.mode;document.querySelectorAll('.azkar-mode').forEach(x=>x.classList.toggle('active',x===b));renderAzkar();});
$('addCustomAzkar').addEventListener('click',()=>{const field=$('customAzkarText'),text=field.value.trim();if(!text){toast('Please enter an Azkar');field.focus();return;}state.customAzkar??=[];state.customAzkar.push({id:'azkar-'+Date.now(),mode:azkarMode,text});field.value='';save();renderAzkar();toast('Azkar added to '+azkarMode);});
function renderGood(){let root=$('goodDeedsList');root.innerHTML='';let d=day();if(!d.customDeeds)d.customDeeds=[];[...deedDefaults,...d.customDeeds].forEach((name,i)=>{let row=document.createElement('label');row.className='check-row';let cb=document.createElement('input');cb.type='checkbox';cb.checked=!!d.good[name];cb.onchange=()=>{day().good[name]=cb.checked;save();};let t=document.createElement('span');t.textContent=name;row.append(cb,t);root.append(row);});}
$('addGoodDeed').onclick=()=>{let n=$('customGoodDeed').value.trim();if(!n)return;day().customDeeds??=[];day().customDeeds.push(n);$('customGoodDeed').value='';save();};
function renderCalendar(){let y=viewMonth.getFullYear(),m=viewMonth.getMonth();$('monthLabel').textContent=viewMonth.toLocaleDateString(undefined,{month:'long',year:'numeric'});let root=$('calendar');root.innerHTML='';['S','M','T','W','T','F','S'].forEach(x=>{let e=document.createElement('div');e.className='weekday';e.textContent=x;root.append(e);});let first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate(),mf=0,md=0,mp=0,mg=0;for(let i=0;i<first;i++)root.append(document.createElement('div'));for(let d=1;d<=days;d++){let k=localKey(new Date(y,m,d)),data=day(k),c=counts(k);mf+=c.fard;md+=data.dhikr.reduce((a,x)=>a+(+x.count||0),0);mp+=+data.quran.pages||0;mg+=Object.values(data.good).filter(Boolean).length;let el=document.createElement('div');el.className='day';el.textContent=d;if(c.total===c.all&&c.total>0)el.classList.add('done');else if(c.total>0)el.classList.add('partial');if(k===localKey(new Date()))el.classList.add('today');el.onclick=()=>{selectedDate=k;$('datePicker').value=k;setTab('salah');renderAll();};root.append(el);}$('monthFard').textContent=mf;$('monthDhikr').textContent=md;$('monthPages').textContent=mp;$('monthGood').textContent=mg;$('monthQaza').textContent=state.qazaLog.filter(x=>x.date.slice(0,7)===`${y}-${String(m+1).padStart(2,'0')}`).length;}
$('prevMonth').onclick=()=>{viewMonth=new Date(viewMonth.getFullYear(),viewMonth.getMonth()-1,1);renderCalendar();};$('nextMonth').onclick=()=>{viewMonth=new Date(viewMonth.getFullYear(),viewMonth.getMonth()+1,1);renderCalendar();};
function loadRamadan(){let r=state.ramadan[selectedDate]||{};['ramadanDay','suhoor','iftar','fasting','tarawih','juz'].forEach((id)=>$(id).value=r[id]??(id==='tarawih'||id==='juz'?0:''));$('ramadanSummary').textContent=r.fasting?`Status: ${r.fasting} · Tarawih: ${r.tarawih||0} rak'ahs · Quran: ${r.juz||0} juz`:'';}
$('saveRamadan').onclick=()=>{let r={};['ramadanDay','suhoor','iftar','fasting','tarawih','juz'].forEach(id=>r[id]=$(id).value);state.ramadan[selectedDate]=r;save();toast('Ramadan entry saved');};
async function fetchTimes(){let city=state.settings.city||'Dhaka',country=state.settings.country||'Bangladesh',method=state.settings.method||'1';$('timeLocationLabel').textContent=`Prayer times for ${city}, ${country} · Loading…`;$('prayerTimes').innerHTML='';try{let d=new Date(),apiDate=`${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`,url=`https://api.aladhan.com/v1/timingsByCity/${apiDate}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`;let res=await fetch(url);if(!res.ok)throw Error('network');let json=await res.json();if(json.code!==200)throw Error('api');let t=json.data.timings;let keys=['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'];keys.forEach(k=>{let box=document.createElement('div');box.className='time-item';let n=document.createElement('span');n.textContent=k;let v=document.createElement('strong');{const f=fmt12(t[k]);v.textContent=(f.t+' '+f.ap).trim();}box.append(n,v);$('prayerTimes').append(box);});$('timeLocationLabel').textContent=`${city}, ${country} · ${json.data.date.readable} · Method ${method}`;$('dashboardTimeLocation').textContent=`${city}, ${country}`;$('dashboardPrayerTimes').innerHTML='';['Fajr','Dhuhr','Asr','Maghrib','Isha'].forEach(k=>{let item=document.createElement('div'),label=document.createElement('small'),value=document.createElement('b');label.textContent=k.toUpperCase();{const f=fmt12(t[k]);value.textContent=f.t;if(f.ap){const ap=document.createElement('i');ap.className='ampm';ap.textContent=f.ap;value.append(ap);}}item.dataset.prayer=k;item.append(label,value);$('dashboardPrayerTimes').append(item);});__times=t;try{const mt=json.data.meta||{};if(mt.latitude!=null){state.settings.lat=+mt.latitude;state.settings.lng=+mt.longitude;}state.settings.timesCache={date:apiDate,city,country,t};localStorage.setItem(STORE,JSON.stringify(state));}catch{}updateNextPrayer();renderDashboard();renderSalah();scheduleReminders(t);}catch(e){$('timeLocationLabel').textContent='Could not load prayer times. Check internet and city/country spelling, then refresh.';$('dashboardTimeLocation').textContent='Offline — open Prayer times to retry';toast('Prayer times unavailable');try{const c=state.settings.timesCache;if(c&&c.t&&c.city===city){__times=c.t;updateNextPrayer();renderDashboard();renderSalah();}}catch{}}}
$('refreshTimes').onclick=fetchTimes;$('saveLocation').onclick=()=>{state.settings.city=$('cityInput').value.trim()||'Dhaka';state.settings.country=$('countryInput').value.trim()||'Bangladesh';state.settings.method=$('methodInput').value;localStorage.setItem(STORE,JSON.stringify(state));fetchTimes();};
$('enableNotifications').onclick=async()=>{if(!('Notification'in window)){toast('Notifications are not supported by this browser');return;}let p=await Notification.requestPermission();$('notificationStatus').textContent='Notification permission: '+p;if(p==='granted')toast('Notifications enabled');};
$('remindersEnabled').onchange=e=>{state.settings.reminders=e.target.checked;localStorage.setItem(STORE,JSON.stringify(state));if(e.target.checked)fetchTimes();else clearTimers();toast(e.target.checked?'Reminders enabled while app is open':'Reminders disabled');};
function clearTimers(){timerHandles.forEach(clearTimeout);timerHandles=[];}
function scheduleReminders(t){
 clearTimers();
 if(!state.settings.reminders||!("Notification" in window)||Notification.permission!=="granted")return;
 const now=new Date();
 ["Fajr","Dhuhr","Asr","Maghrib","Isha"].forEach(n=>{
  const [h,m]=t[n].split(":").map(Number),when=new Date();when.setHours(h,m,0,0);
  const ms=when-now;
  if(ms>0&&ms<86400000){
   const id=setTimeout(async()=>{
    if(document.visibilityState!=="visible")return;
    try{
     if("serviceWorker" in navigator){const reg=await navigator.serviceWorker.ready;await reg.showNotification("My Ibadah",{body:`It is time for ${n} prayer.`,icon:"./icon.svg",tag:"prayer-"+n});}
     else new Notification("My Ibadah",{body:`It is time for ${n} prayer.`});
    }catch{}
   },ms);
   timerHandles.push(id);
  }
 });
}
async function saveFile(name,text,mime){const cap=window.Capacitor,P=cap&&cap.Plugins;if(cap&&cap.isNativePlatform&&cap.isNativePlatform()&&P&&P.Filesystem&&P.Share){try{const r=await P.Filesystem.writeFile({path:name,data:text,directory:'CACHE',encoding:'utf8'});await P.Share.share({title:name,url:r.uri,dialogTitle:'Save or share '+name});return;}catch(e){if(e&&/cancel/i.test(String(e.message||e)))return;toast('Could not save file');return;}}const blob=new Blob([text],{type:mime}),a=document.createElement('a'),u=URL.createObjectURL(blob);a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
function exportJson(){saveFile(`my-ibadah-backup-${localKey(new Date())}.json`,JSON.stringify(state,null,2),'application/json');}
$('backupData').onclick=exportJson;$('restoreFile').onchange=async e=>{let f=e.target.files[0];if(!f)return;try{let s=JSON.parse(await f.text());if(!s.days||!s.qazaTotals)throw Error();state=s;state.settings={...blankState().settings,...s.settings};state.ramadan??={};save();$('cityInput').value=state.settings.city;$('countryInput').value=state.settings.country;$('methodInput').value=state.settings.method;toast('Backup restored');}catch{toast('Invalid backup file');}e.target.value='';};
$('clearData').onclick=()=>{if(confirm('Delete all My Ibadah records on this device? This cannot be undone unless you have a backup.')){state=blankState();save();toast('App data cleared');}};
$('exportReport').onclick=()=>{let y=viewMonth.getFullYear(),m=viewMonth.getMonth(),rows=[['Date','Fard completed','Prayer checklist completed','Dhikr recitations','Quran pages','Good deeds']];for(let d=1;d<=new Date(y,m+1,0).getDate();d++){let k=localKey(new Date(y,m,d)),x=day(k),c=counts(k);rows.push([k,c.fard,c.total,x.dhikr.reduce((a,z)=>a+(+z.count||0),0),x.quran.pages,Object.values(x.good).filter(Boolean).length]);}let csv=rows.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\n'),fname=`my-ibadah-report-${y}-${m+1}.csv`;saveFile(fname,csv,'text/csv');};
function renderAll(){renderHeader();try{updateNextPrayer();}catch{}renderSalah();renderQaza();renderDhikr();renderDashboard();renderPrayerSummary();renderQuran();if(!$('insightsPanel').classList.contains('hidden')){renderCalendar();renderWeeklyReport();}}
function renderPrayerSummary(){const d=day();let n=0;prayers.forEach(g=>{if(g.items.some(i=>i[1]==='Fard'&&d.checks[pkey(g.name,i[0])]))n++;});const isToday=selectedDate===localKey(new Date());$('prayerCardTitle').textContent=isToday?"Today's prayers":new Date(selectedDate+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'})+' prayers';$('prayerSummary').textContent=n===5?'✓ All five prayers completed — alhamdulillah':`${n} of 5 completed`;$('prayerBar').style.width=(n/5*100)+'%';}
const ayahOfDay=[['فَإِنَّ مَعَ الْعُسْرِ يُسْرًا','Indeed, with hardship comes ease.','Surah Ash-Sharh 94:5'],['فَاذْكُرُونِي أَذْكُرْكُمْ','So remember Me; I will remember you.','Surah Al-Baqarah 2:152'],['وَهُوَ مَعَكُمْ أَيْنَ مَا كُنْتُمْ','And He is with you wherever you are.','Surah Al-Hadid 57:4'],['إِنَّ اللَّهَ مَعَ الصَّابِرِينَ','Indeed, Allah is with the patient.','Surah Al-Baqarah 2:153']];
const duaOfDay=['رَبِّ زِدْنِي عِلْمًا','My Lord, increase me in knowledge.','Surah Taha 20:114'];
function rangeTotals(start,end){let f=0,p=0,d=0;for(let dt=new Date(start);dt<=end;dt.setDate(dt.getDate()+1)){let k=localKey(dt),x=day(k),c=counts(k);f+=c.fard;p+=Number(x.quran.pages)||0;d+=x.dhikr.reduce((a,z)=>a+(Number(z.count)||0),0);}return {f,p,d};}
function renderWeeklyReport(){let anchor=new Date(selectedDate+'T12:00:00'),end=new Date(anchor.getFullYear(),anchor.getMonth(),anchor.getDate()),start=new Date(end);start.setDate(start.getDate()-6);let w=rangeTotals(start,end);['reportWeekFard','dashWeekFard'].forEach(id=>$(id).textContent=w.f);['reportWeekPages','dashWeekPages'].forEach(id=>$(id).textContent=w.p);['reportWeekDhikr','dashWeekDhikr'].forEach(id=>$(id).textContent=w.d);}
function renderDashboard(){let c=counts(),d=day(),dh=d.dhikr.reduce((a,x)=>a+(Number(x.count)||0),0),good=Object.values(d.good).filter(Boolean).length,totalGood=deedDefaults.length+(d.customDeeds||[]).length;$('dashDeeds').textContent=good+'/'+totalGood;renderActivityRings(c,d,dh);let root=$('dashboardPrayerList');root.innerHTML='';prayers.forEach(g=>{let r=document.createElement('div');r.className='dashboard-prayer-row'+(__nextName===g.name?' is-next':'');let n=document.createElement('strong');n.textContent=g.name;let place=document.createElement('span');{const tm=__times&&__times[g.name]?(f=>f.t+' '+f.ap)(fmt12(__times[g.name])):'';place.textContent=[tm,d.prayerPlaces[g.name]].filter(Boolean).join(' · ')||'Tap “Mark done” when prayed';}let done=g.items.some(i=>i[1]==='Fard'&&d.checks[pkey(g.name,i[0])]);let status=document.createElement('button');status.type='button';status.className=done?'status-done':'status-pending';status.textContent=done?'✓ Done':'Mark done';status.setAttribute('aria-label',(done?'Unmark ':'Mark ')+g.name+(done?' as not prayed':' as prayed'));status.onclick=()=>{const dd=day();g.items.filter(i=>i[1]==='Fard').forEach(i=>{dd.checks[pkey(g.name,i[0])]=!done;});save();toast(done?g.name+' unmarked':g.name+' marked as done ✓');};r.append(n,place,status);root.append(r);});let idx=Math.floor(Date.now()/86400000)%ayahOfDay.length,a=ayahOfDay[idx],h=hadiths[Math.floor(Date.now()/86400000)%hadiths.length];$('dailyAyahArabic').textContent=a[0];$('dailyAyahText').textContent='“'+a[1]+'”';$('dailyAyahRef').textContent=a[2];$('dashboardHadith').textContent='“'+h[0]+'”';$('dashboardHadithRef').textContent=h[1];$('dashboardDuaArabic').textContent=duaOfDay[0];$('dashboardDuaText').textContent=duaOfDay[1];$('dashboardDuaRef').textContent=duaOfDay[2];renderWeeklyReport();renderWeeklyDhikrWidget();}

function renderWeeklyDhikrWidget(){
 const end=new Date(selectedDate+'T12:00:00');end.setHours(12,0,0,0);const days=[];const totals=new Map();let total=0;
 for(let i=6;i>=0;i--){const dt=new Date(end);dt.setDate(end.getDate()-i);const key=localKey(dt);const d=day(key);const count=d.dhikr.reduce((sum,x)=>sum+(Number(x.count)||0),0);days.push({date:dt,count});total+=count;d.dhikr.forEach(x=>{const n=x.name||'Dhikr';totals.set(n,(totals.get(n)||0)+(Number(x.count)||0));});}
 const chart=$('weeklyDhikrChart');if(chart){chart.innerHTML='';const max=Math.max(1,...days.map(x=>x.count));days.forEach((x,i)=>{const bar=document.createElement('div');bar.className='week-bar'+(i===6?' current':'');bar.style.height=Math.max(7,Math.round(x.count/max*76))+'px';bar.title=x.date.toLocaleDateString()+': '+x.count+' recitations';chart.append(bar);});}
 const labels=$('weeklyDhikrDays');if(labels){labels.innerHTML='';days.forEach(x=>{const span=document.createElement('span');span.textContent=x.date.toLocaleDateString(undefined,{weekday:'short'}).slice(0,3).toUpperCase();labels.append(span);});}
 const first=days[0].date,last=days[6].date;const fmt=d=>d.toLocaleDateString(undefined,{month:'short',day:'numeric'});const period=document.querySelector('.weekly-counter-main p');if(period)period.textContent=`${fmt(first)} – ${fmt(last)} · 7 days`;
 $('weeklyDhikrTotal').textContent=total.toLocaleString();const ranked=[...totals.entries()].sort((a,b)=>b[1]-a[1]).slice(0,3);for(let i=0;i<3;i++){const item=ranked[i]||['No entries',0];$('rankDhikr'+(i+1)).textContent=item[0];$('rankCount'+(i+1)).textContent=item[1].toLocaleString();}
}
function setRingProgress(id,pct,radius){
 const el=$(id);if(!el)return;
 const value=Math.max(0,Math.min(100,Number(pct)||0));
 const circumference=2*Math.PI*radius;
 el.style.strokeDasharray=String(circumference);
 el.style.strokeDashoffset=String(circumference*(1-value/100));
 el.setAttribute('aria-valuenow',String(value));
}

function progressPercent(value,target){
 const amount=Math.max(0,Number(value)||0);
 const goal=Math.max(1,Number(target)||1);
 return Math.min(100,Math.max(0,Math.round((amount/goal)*100)));
}
const PROGRESS_PERIODS=['today','week','month','last30','all'];
const PROGRESS_LABEL={today:'Today',week:'This week',month:'This month',last30:'Last 30 days',all:'All time'};
function progressPeriod(){return PROGRESS_PERIODS.includes(state.settings.progressPeriod)?state.settings.progressPeriod:'today';}
function progressKeys(per){
 const anchor=new Date(selectedDate+'T12:00:00');
 if(per==='today')return [selectedDate];
 let start=new Date(anchor);
 if(per==='week')start.setDate(start.getDate()-6);
 else if(per==='last30')start.setDate(start.getDate()-29);
 else if(per==='month')start=new Date(anchor.getFullYear(),anchor.getMonth(),1,12);
 else{const first=Object.keys(state.days).filter(k=>k<=selectedDate).sort()[0];start=first?new Date(first+'T12:00:00'):anchor;}
 const keys=[];for(const dt=new Date(start);dt<=anchor&&keys.length<5000;dt.setDate(dt.getDate()+1))keys.push(localKey(dt));
 return keys;
}
function progressTotals(per,c,d){
 const sumDhikr=x=>(Array.isArray(x.dhikr)?x.dhikr:[]);
 if(per==='today'){
  const items=sumDhikr(d);
  return {days:1,salahCount:Math.max(0,Math.min(5,Number(c.fard)||0)),salahTarget:5,
   dhikrCount:items.reduce((s,i)=>s+Math.max(0,Number(i.count)||0),0),dhikrTarget:items.reduce((s,i)=>s+Math.max(0,Number(i.target)||0),0),
   quranPages:Math.max(0,Number(d.quran&&d.quran.pages)||0),quranTarget:Math.max(1,Number(d.quran&&d.quran.target)||10)};
 }
 const keys=progressKeys(per),t={days:keys.length,salahCount:0,salahTarget:5*keys.length,dhikrCount:0,dhikrTarget:0,quranPages:0,quranTarget:0};
 keys.forEach(k=>{
  const x=state.days[k];
  if(!x){t.quranTarget+=10;return;}            // never opened: counts as a missed day
  const ch=x.checks||{};
  prayers.forEach(g=>{if(g.items.some(i=>i[1]==='Fard'&&ch[pkey(g.name,i[0])]))t.salahCount++;});
  sumDhikr(x).forEach(i=>{t.dhikrCount+=Math.max(0,Number(i.count)||0);t.dhikrTarget+=Math.max(0,Number(i.target)||0);});
  t.quranPages+=Math.max(0,Number(x.quran&&x.quran.pages)||0);t.quranTarget+=Math.max(1,Number(x.quran&&x.quran.target)||10);
 });
 t.quranTarget=Math.max(1,t.quranTarget);
 return t;
}
function renderActivityRings(c,d,dh){
 const per=progressPeriod(),isToday=per==='today',T=progressTotals(per,c,d);
 const {salahCount,salahTarget,dhikrCount,dhikrTarget,quranPages,quranTarget,days}=T;
 const salahPct=progressPercent(salahCount,salahTarget);
 const dhikrPct=dhikrTarget?progressPercent(dhikrCount,dhikrTarget):0;
 const quranPct=progressPercent(quranPages,quranTarget);
 setRingProgress('salahRing',salahPct,84);
 setRingProgress('dhikrRing',dhikrPct,62);
 setRingProgress('quranRing',quranPct,40);
 const overall=Math.round((salahPct+dhikrPct+quranPct)/3);
 const avg=n=>{const v=n/Math.max(1,days);return (v>=10?Math.round(v):Math.round(v*10)/10).toLocaleString();};
 $('ringSalahValue').textContent=`${salahCount}/${salahTarget} prayers`;
 $('ringDhikrValue').textContent=`${dhikrCount.toLocaleString()}/${dhikrTarget.toLocaleString()} recitations`;
 $('ringQuranValue').textContent=`${quranPages}/${quranTarget} pages`;
 $('ringSalahPct').textContent=salahPct+'%';
 $('ringDhikrPct').textContent=dhikrPct+'%';
 $('ringQuranPct').textContent=quranPct+'%';
 if(isToday){
  $('ringSalahRemaining').textContent=salahCount>=5?'✓ Daily goal completed':`Remaining: ${5-salahCount} ${5-salahCount===1?'prayer':'prayers'}`;
  $('ringDhikrRemaining').textContent=dhikrTarget? (dhikrCount>=dhikrTarget?'✓ Daily goal completed':`Remaining: ${Math.max(0,dhikrTarget-dhikrCount).toLocaleString()}`):'Set a daily target';
  $('ringQuranRemaining').textContent=quranPages>=quranTarget?'✓ Daily goal completed':`Remaining: ${Math.max(0,quranTarget-quranPages)} ${quranTarget-quranPages===1?'page':'pages'}`;
 }else{
  $('ringSalahRemaining').textContent=`Avg ${avg(salahCount)} prayers/day`;
  $('ringDhikrRemaining').textContent=dhikrTarget?`Avg ${avg(dhikrCount)} recitations/day`:'Set a daily target';
  $('ringQuranRemaining').textContent=`Avg ${avg(quranPages)} pages/day`;
 }
 $('ringsCenterPct').textContent=overall+'%';
 const completed=[salahPct>=100,dhikrTarget>0&&dhikrPct>=100,quranPct>=100].filter(Boolean).length;
 $('ibadahGoalStatus').textContent=completed===3?(isToday?'✓ Daily goals completed':'✓ All goals completed'):overall>=80?'Almost there — you are doing well': 'Keep going — every step counts';
 $('ibadahGoalStatus').classList.toggle('goal-complete',completed===3);
 $('ringsDateLabel').textContent=isToday?(selectedDate===localKey(new Date())?'Today':new Date(selectedDate+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'})):PROGRESS_LABEL[per];
}
document.addEventListener('click',e=>{
 if(!e.target.closest('#ipPeriod'))return;
 const i=PROGRESS_PERIODS.indexOf(progressPeriod());
 state.settings.progressPeriod=PROGRESS_PERIODS[(i+1)%PROGRESS_PERIODS.length];
 save();
});

function setupSettings(){ $('cityInput').value=state.settings.city;$('countryInput').value=state.settings.country;$('methodInput').value=state.settings.method;$('remindersEnabled').checked=!!state.settings.reminders;$('dailyHadith').innerHTML='';let idx=Math.floor((Date.now()/86400000))%hadiths.length;let h=hadiths[idx];let p=document.createElement('p');p.textContent='Daily Hadith';let q=document.createElement('blockquote');q.textContent='“'+h[0]+'”';let s=document.createElement('small');s.textContent=h[1];$('dailyHadith').append(p,q,s);}

// Make each progress ring and its matching legend item a shortcut to the relevant tracker.
[['salahRing','salah'],['dhikrRing','dhikr'],['quranRing','quran']].forEach(([id,tab])=>{
 const ring=$(id); if(!ring)return;
 ring.setAttribute('tabindex','0'); ring.setAttribute('role','button');
 ring.setAttribute('aria-label',`Open ${tab} tracker`);
 ring.style.cursor='pointer';
 ring.addEventListener('click',()=>setTab(tab));
 ring.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setTab(tab);}});
});
document.querySelectorAll('[data-ring-tab]').forEach(button=>button.addEventListener('click',()=>setTab(button.dataset.ringTab)));

let deferredPrompt;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('installBtn').hidden=false;});$('installBtn').onclick=async()=>{if(!deferredPrompt){toast('Use your browser menu to install this app');return;}deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('installBtn').hidden=true;};
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));

let __times=null,__nextName=null;
function fmt12(s){const m=/(\d{1,2}):(\d{2})/.exec(s||'');if(!m)return{t:s||'—',ap:''};let h=+m[1];const ap=h>=12?'PM':'AM';h=h%12||12;return{t:h+':'+m[2],ap};}
/* Ayyam al-Bid (the White Days): 13th, 14th & 15th of every Hijri month (Sunnah fasts).
   The Islamic day begins at Maghrib, so after Maghrib we look at tomorrow's Hijri date:
   on the evening of the 12th the banner already says "Sunnah fast tomorrow". */
const __wdFmt=(()=>{try{return new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn',{day:'numeric'});}catch{return null;}})();
function whiteDayInfo(now,t){
  /* Preview: open the app with ?wd=1, ?wd=2 or ?wd=3 (day of the White Days) to see the highlight any time. */
  try{const q=+new URLSearchParams(location.search).get('wd');if(q>=1&&q<=3)return {n:q,tomorrow:false};}catch{}
  if(!__wdFmt)return null;
  /* A different day picked with the ‹ › date buttons: judge that date instead of "now". */
  try{if(typeof selectedDate==='string'&&selectedDate!==localKey(now)){
    const sd=new Date(selectedDate+'T12:00:00'),p=__wdFmt.formatToParts(sd).find(x=>x.type==='day'),dd=p?+p.value:NaN;
    return dd>=13&&dd<=15?{n:dd-12,tomorrow:false,other:true}:null;}}catch{}
  let after=false;const m=/(\d{1,2}):(\d{2})/.exec((t&&t.Maghrib)||'');
  if(m)after=now.getHours()*60+now.getMinutes()>=(+m[1])*60+(+m[2]);
  const d=new Date(now.getFullYear(),now.getMonth(),now.getDate()+(after?1:0),12,0,0);
  let day=NaN;try{const p=__wdFmt.formatToParts(d).find(x=>x.type==='day');day=p?+p.value:NaN;}catch{}
  return day>=13&&day<=15?{n:day-12,tomorrow:after}:null;
}
function renderWhiteDays(chip,now){
  const box=$('whiteDaysBadge');if(!box)return;
  const w=whiteDayInfo(now,__times);
  chip.classList.toggle('is-white-days',!!w);
  box.hidden=!w;
  if(!w)return;
  $('wdDay').textContent=`Day ${w.n} of 3`;
  $('wdNote').textContent=w.other?'Sunnah fast day':w.tomorrow?'Sunnah fast tomorrow':'Sunnah fast today';
}
function updateNextPrayer(){const chip=$('nextPrayerChip');if(!chip)return;if(!__times){chip.hidden=true;return;}const now=new Date(),names=['Fajr','Dhuhr','Asr','Maghrib','Isha'],at=(n,add)=>{const m=/(\d{1,2}):(\d{2})/.exec(__times[n]||'');if(!m)return null;const w=new Date();w.setDate(w.getDate()+add);w.setHours(+m[1],+m[2],0,0);return w;};let next=null;for(const n of names){const w=at(n,0);if(w&&w>now){next={n,w};break;}}if(!next){const w=at('Fajr',1);if(w)next={n:'Fajr',w};}if(!next){chip.hidden=true;return;}const mins=Math.max(0,Math.round((next.w-now)/60000)),hh=Math.floor(mins/60),mm=mins%60,f=fmt12(__times[next.n]);$('nextPrayerName').textContent=`${next.n} · ${f.t} ${f.ap}`;$('nextPrayerTime').textContent='in '+(hh?hh+'h ':'')+mm+'m';chip.hidden=false;renderWhiteDays(chip,now);if(__nextName!==next.n){__nextName=next.n;renderDashboard();}document.querySelectorAll('#dashboardPrayerTimes > div').forEach(el=>el.classList.toggle('is-next',el.dataset.prayer===next.n));}
setInterval(updateNextPrayer,30000);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')updateNextPrayer();});
// Bottom navigation, More sheet and extra date controls
document.querySelectorAll('.bn-item').forEach(b=>b.addEventListener('click',()=>{const n=b.dataset.nav;if(n==='more'){$('moreSheet').classList.contains('open')?closeMore():openMore();}else setTab(n);}));
$('moreBackdrop').addEventListener('click',closeMore);$('moreClose').addEventListener('click',closeMore);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMore();});
$('salahPrevBtn').onclick=()=>moveSelectedDate(-1);$('salahNextBtn').onclick=()=>moveSelectedDate(1);
setupSettings();$('datePicker').value=selectedDate;setTab('dashboard');renderAll();fetchTimes();

document.querySelectorAll('.step').forEach(b=>b.addEventListener('click',()=>{const i=$('quranPages');i.value=Math.max(0,(Number(i.value)||0)+Number(b.dataset.step));i.dispatchEvent(new Event('input'));if(navigator.vibrate)navigator.vibrate(8);}));
['previousDateBtn','nextDateBtn'].forEach(id=>$(id).addEventListener('click',()=>window.scrollTo({top:0})));
// Add-on: Enter key submits the add-fields
[['customDhikr','addCustomDhikr'],['customAzkarText','addCustomAzkar'],['customGoodDeed','addGoodDeed']].forEach(([i,b])=>$(i).addEventListener('keydown',e=>{if(e.key==='Enter')$(b).click();}));
