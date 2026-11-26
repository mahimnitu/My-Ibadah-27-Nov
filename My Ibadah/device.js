/* My Ibadah v10 — device features: native bridge, haptics, prayer reminders, Qibla compass */
'use strict';
const IS_NATIVE=()=>!!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform());
const PL=n=>window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins[n];
const persist=()=>{try{localStorage.setItem(STORE,JSON.stringify(state));}catch{}};
const tr=s=>(window.I18N?I18N.t(s):s);

/* ---------- Haptics: use the native plugin inside the Android app ---------- */
if(IS_NATIVE()&&PL('Haptics')){
  try{Object.defineProperty(navigator,'vibrate',{configurable:true,value:p=>{const ms=Array.isArray(p)?p.filter((_,i)=>i%2===0).reduce((a,b)=>a+b,0):p;PL('Haptics').vibrate({duration:Math.max(10,Math.min(Number(ms)||10,400))});return true;}});}catch{}
}

/* ---------- Prayer reminders ---------- */
const PRAYERS5=['Fajr','Dhuhr','Asr','Maghrib','Isha'];
const BN_PRAYER={Fajr:'ফজর',Dhuhr:'যোহর',Asr:'আসর',Maghrib:'মাগরিব',Isha:'ঈশা'};

function reminderStatus(msg){const el=$('notificationStatus');if(el)el.textContent=msg;}

async function getCalendarDays(){
  const s=state.settings,city=s.city||'Dhaka',country=s.country||'Bangladesh',method=s.method||'1';
  const out=[],now=new Date();
  const months=[[now.getFullYear(),now.getMonth()+1],[now.getMonth()===11?now.getFullYear()+1:now.getFullYear(),now.getMonth()===11?1:now.getMonth()+2]];
  let cache={};try{cache=JSON.parse(localStorage.getItem('myIbadah.cal')||'{}');}catch{}
  for(const [y,m] of months){
    const key=`${city}|${country}|${method}|${y}-${m}`;let days=null;
    try{
      const r=await fetch(`https://api.aladhan.com/v1/calendarByCity/${y}/${m}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`);
      if(r.ok){const j=await r.json();if(j.code===200&&Array.isArray(j.data)){days=j.data.map(x=>{const [dd,mm,yy]=x.date.gregorian.date.split('-');const t={};PRAYERS5.forEach(n=>{const mt=/(\d{1,2}):(\d{2})/.exec(x.timings[n]||'');t[n]=mt?mt[1].padStart(2,'0')+':'+mt[2]:null;});return {date:`${yy}-${mm}-${dd}`,t};});cache[key]=days;}}
    }catch{}
    if(!days&&cache[key])days=cache[key];
    if(days)out.push(...days);
  }
  try{const keep={};Object.keys(cache).slice(-6).forEach(k=>keep[k]=cache[k]);localStorage.setItem('myIbadah.cal',JSON.stringify(keep));}catch{}
  return out;
}

async function nativeSchedule(){
  const LN=PL('LocalNotifications');if(!IS_NATIVE()||!LN)return;
  try{const pend=await LN.getPending();if(pend&&pend.notifications&&pend.notifications.length)await LN.cancel({notifications:pend.notifications});}catch{}
  if(!state.settings.reminders){reminderStatus(tr('Reminders are off'));return;}
  try{
    let perm=await LN.checkPermissions();
    if(perm.display!=='granted')perm=await LN.requestPermissions();
    if(perm.display!=='granted'){reminderStatus(tr('Notification permission was denied. Enable it in Android Settings → Apps → My Ibadah → Notifications.'));return;}
    try{await LN.createChannel({id:'prayer',name:'Prayer reminders',description:'Reminders at prayer times',importance:4,visibility:1,vibration:true});}catch{}
    const days=await getCalendarDays();
    if(!days.length){reminderStatus(tr('Could not load prayer times for reminders. Connect to the internet once.'));return;}
    const before=(Number(state.settings.remindBefore)||0)*60000,now=Date.now(),bn=I18N&&I18N.get()==='bn',list=[];let id=100;
    days.forEach(d=>PRAYERS5.forEach(n=>{
      if(!d.t[n])return;const [h,m]=d.t[n].split(':').map(Number),[y,mo,da]=d.date.split('-').map(Number);
      const at=new Date(y,mo-1,da,h,m,0,0).getTime()-before;if(at<=now+5000)return;
      const name=bn?BN_PRAYER[n]:n,mins=before/60000;
      const body=bn?(mins?`${name} নামাজ ${mins} মিনিট পরে`:`${name} নামাজের সময় হয়েছে`):(mins?`${n} prayer in ${mins} minutes`:`It is time for ${n} prayer`);
      list.push({id:id++,title:'My Ibadah',body,channelId:'prayer',schedule:{at:new Date(at),allowWhileIdle:true}});
    }));
    const batch=list.slice(0,180);
    if(batch.length)await LN.schedule({notifications:batch});
    let exactNote='';
    try{const ex=await LN.checkExactNotificationSetting();if(ex&&ex.exact_alarm&&ex.exact_alarm!=='granted'){exactNote=' '+tr('For on-time alerts, allow “Alarms & reminders” for My Ibadah.');const b=$('exactAlarmBtn');if(b)b.hidden=false;}else{const b=$('exactAlarmBtn');if(b)b.hidden=true;}}catch{}
    reminderStatus((bn?`${batch.length}টি রিমাইন্ডার নির্ধারিত হয়েছে`:`${batch.length} reminders scheduled`)+exactNote);
  }catch(e){reminderStatus(tr('Could not schedule reminders.'));}
}

// keep old browser-timer reminders, and add native scheduling on top
const __sr=scheduleReminders;
scheduleReminders=function(t){if(!IS_NATIVE())__sr(t);else nativeSchedule();};

function enhanceReminderUI(){
  const box=document.querySelector('.reminder-box');if(!box||$('remindBefore'))return;
  const native=IS_NATIVE();
  const hint=box.querySelector('.hint');
  if(hint)hint.textContent=native?'Reminders arrive even when the app is closed. Choose how early you want to be reminded.':'Reminders only work while the app is open. Install the Android app for reminders that work in the background.';
  const lab=box.querySelector('.switchline');
  const row=document.createElement('div');row.className='remind-extra';
  row.innerHTML=`<label class="field"><span class="field-name">Remind me</span><select id="remindBefore"><option value="0">At prayer time</option><option value="5">5 minutes before</option><option value="10">10 minutes before</option><option value="15">15 minutes before</option><option value="30">30 minutes before</option></select></label>
  <div class="inline-controls"><button type="button" id="testNotif" class="secondary">Send test reminder</button><button type="button" id="exactAlarmBtn" class="secondary" hidden>Allow exact alarms</button></div>`;
  if(lab)lab.after(row);else box.append(row);
  $('remindBefore').value=String(state.settings.remindBefore||0);
  $('remindBefore').onchange=e=>{state.settings.remindBefore=Number(e.target.value)||0;persist();if(state.settings.reminders){if(native)nativeSchedule();else fetchTimes();}};
  $('testNotif').onclick=async()=>{
    if(native&&PL('LocalNotifications')){const LN=PL('LocalNotifications');try{let p=await LN.checkPermissions();if(p.display!=='granted')p=await LN.requestPermissions();if(p.display!=='granted'){toast(tr('Notification permission was denied.'));return;}await LN.schedule({notifications:[{id:99,title:'My Ibadah',body:tr('Test reminder — it works!'),schedule:{at:new Date(Date.now()+4000)},channelId:'prayer'}]});toast(tr('Test reminder in a few seconds'));}catch{toast(tr('Could not send test'));}}
    else if('Notification' in window){let p=Notification.permission;if(p!=='granted')p=await Notification.requestPermission();if(p==='granted'){new Notification('My Ibadah',{body:tr('Test reminder — it works!')});}else toast(tr('Notification permission was denied.'));}
    else toast(tr('Notifications are not supported here'));
  };
  $('exactAlarmBtn').onclick=async()=>{try{await PL('LocalNotifications').changeExactNotificationSetting();}catch{}};
  // native-aware handlers replace the browser-only ones
  if(native){
    $('enableNotifications').onclick=async()=>{const LN=PL('LocalNotifications');if(!LN){toast(tr('Notifications are not available'));return;}try{const p=await LN.requestPermissions();reminderStatus(p.display==='granted'?tr('Notifications allowed'):tr('Notification permission was denied.'));if(p.display==='granted'&&state.settings.reminders)nativeSchedule();}catch{}};
    $('remindersEnabled').onchange=e=>{state.settings.reminders=e.target.checked;persist();nativeSchedule();toast(tr(e.target.checked?'Prayer reminders on':'Reminders disabled'));};
  }
  const sl=$('saveLocation');if(sl){const old=sl.onclick;sl.onclick=function(ev){old&&old.call(this,ev);setTimeout(()=>{if(IS_NATIVE()&&state.settings.reminders)nativeSchedule();},800);};}
}

/* ---------- Qibla compass ---------- */
const KAABA={lat:21.4225,lng:39.8262};
const rad=x=>x*Math.PI/180,deg=x=>x*180/Math.PI;
function qiblaBearing(lat,lng){const f1=rad(lat),f2=rad(KAABA.lat),dl=rad(KAABA.lng-lng);return (deg(Math.atan2(Math.sin(dl)*Math.cos(f2),Math.cos(f1)*Math.sin(f2)-Math.sin(f1)*Math.cos(f2)*Math.cos(dl)))+360)%360;}
function distanceKm(lat,lng){const R=6371,f1=rad(lat),f2=rad(KAABA.lat),df=f2-f1,dl=rad(KAABA.lng-lng),a=Math.sin(df/2)**2+Math.cos(f1)*Math.cos(f2)*Math.sin(dl/2)**2;return 2*R*Math.asin(Math.sqrt(a));}
const Q={heading:null,smooth:null,running:false,aligned:false,gotAbs:false};
function qLocation(){const s=state.settings;if(s.loc&&s.loc.lat!=null)return {lat:s.loc.lat,lng:s.loc.lng,label:tr('your GPS location')};if(s.lat!=null)return {lat:s.lat,lng:s.lng,label:`${s.city}, ${s.country}`};return null;}
function renderQibla(){
  const loc=qLocation();
  if(!loc){$('qBearing').textContent='—';$('qDistance').textContent='—';$('qLoc').textContent=tr('Location unknown. Tap “Use my GPS location” or load prayer times once.');return;}
  const b=qiblaBearing(loc.lat,loc.lng),km=distanceKm(loc.lat,loc.lng);
  $('qBearing').textContent=Math.round(b)+'° '+['N','NE','E','SE','S','SW','W','NW'][Math.round(b/45)%8];
  $('qDistance').textContent=Math.round(km).toLocaleString()+' km';
  $('qLoc').textContent=tr('Using')+' '+loc.label;
  $('qMark').style.transform=`rotate(${b}deg)`;
  renderHeading();
}
function renderHeading(){
  const loc=qLocation();const dial=$('qDial');
  if(Q.smooth==null){$('qHeading').textContent='—';dial.style.transform='rotate(0deg)';$('qCenter').textContent='';return;}
  dial.style.transform=`rotate(${-Q.smooth}deg)`;
  $('qHeading').textContent=Math.round(Q.smooth)+'°';
  if(loc){const b=qiblaBearing(loc.lat,loc.lng);let diff=((b-Q.smooth+540)%360)-180;const ok=Math.abs(diff)<=4;
    $('qCenter').textContent=ok?'✓':Math.abs(Math.round(diff))+'°';
    $('compass').classList.toggle('aligned',ok);
    if(ok&&!Q.aligned&&navigator.vibrate)navigator.vibrate(30);Q.aligned=ok;}
}
function onOrient(e){
  let h=null;
  if(typeof e.webkitCompassHeading==='number')h=e.webkitCompassHeading;
  else if(e.type==='deviceorientationabsolute'&&e.alpha!=null){h=(360-e.alpha)%360;Q.gotAbs=true;}
  else if(e.absolute&&e.alpha!=null){h=(360-e.alpha)%360;}
  else if(!Q.gotAbs&&e.alpha!=null&&typeof DeviceOrientationEvent!=='undefined'){h=(360-e.alpha)%360;}
  if(h==null||isNaN(h))return;
  if(Q.smooth==null)Q.smooth=h;else{let d=((h-Q.smooth+540)%360)-180;Q.smooth=(Q.smooth+d*0.18+360)%360;}
  renderHeading();
}
async function startCompass(){
  if(Q.running){stopCompass();return;}
  try{if(/iP(hone|ad|od)/.test(navigator.userAgent)&&typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){const r=await DeviceOrientationEvent.requestPermission();if(r!=='granted'){$('qStatus').textContent=tr('Compass permission was denied.');return;}}}catch{}
  if(!('DeviceOrientationEvent' in window)){$('qStatus').textContent=tr('This device has no compass sensor. The Qibla bearing above is measured from true North.');return;}
  window.addEventListener('deviceorientationabsolute',onOrient,true);window.addEventListener('deviceorientation',onOrient,true);
  Q.running=true;Q.gotAbs=false;$('qStart').textContent=tr('Stop compass');
  $('qStatus').textContent=tr('Hold your phone flat and turn until the Kaaba icon is under the top arrow. It turns green when aligned.');
  setTimeout(()=>{if(Q.running&&Q.smooth==null)$('qStatus').textContent=tr('No compass data received. Your phone may not have a magnetometer — use the bearing above with a physical compass.');},3500);
}
function stopCompass(){window.removeEventListener('deviceorientationabsolute',onOrient,true);window.removeEventListener('deviceorientation',onOrient,true);Q.running=false;Q.smooth=null;Q.aligned=false;const b=$('qStart');if(b)b.textContent=tr('Start compass');const c=$('compass');if(c)c.classList.remove('aligned');}
async function useGps(){
  $('qStatus').textContent=tr('Finding your location…');
  try{
    let pos;const G=IS_NATIVE()&&PL('Geolocation');
    if(G){const perm=await G.requestPermissions();pos=await G.getCurrentPosition({enableHighAccuracy:false,timeout:12000});}
    else pos=await new Promise((res,rej)=>navigator.geolocation?navigator.geolocation.getCurrentPosition(res,rej,{timeout:12000}):rej(new Error('none')));
    state.settings.loc={lat:pos.coords.latitude,lng:pos.coords.longitude};persist();renderQibla();$('qStatus').textContent=tr('Location updated.');
  }catch{$('qStatus').textContent=tr('Could not get your location. Allow location access and try again.');}
}
$('qStart').onclick=startCompass;$('qGps').onclick=useGps;

const __stQ=setTab;
setTab=function(t){if(document.body.dataset.tab==='qibla'&&t!=='qibla')stopCompass();__stQ(t);if(t==='qibla')renderQibla();if(t==='times')enhanceReminderUI();};
enhanceReminderUI();
if(IS_NATIVE()&&state.settings.reminders)setTimeout(nativeSchedule,1500);

/* Android hardware back button: close overlays first, then go Home, then exit */
if(IS_NATIVE()&&PL('App')){
  PL('App').addListener('backButton',()=>{
    const ts=$('tasbih');
    if(ts&&!ts.hidden){closeTasbih();return;}
    if($('moreSheet').classList.contains('open')){closeMore();return;}
    if(document.body.dataset.tab!=='dashboard'){setTab('dashboard');return;}
    PL('App').exitApp();
  });
}
