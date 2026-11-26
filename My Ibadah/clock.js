/* My Ibadah — Hero clock: digital + analog share one spot. Double-tap (or Enter/Space) to switch. */
'use strict';
(function(){
const btn=document.getElementById('heroClock');if(!btn)return;
const $=id=>document.getElementById(id);
const H=$('hcH'),M=$('hcM'),S=$('hcS'),AP=$('hcAp'),hh=$('hcHourHand'),mh=$('hcMinHand'),sh=$('hcSecHand');
const KEY='myIbadah.clockMode',p2=x=>String(x).padStart(2,'0');
let mode='digital';
try{if(localStorage.getItem(KEY)==='analog')mode='analog';}catch{}

function setText(el,v){if(el.textContent!==v)el.textContent=v;}
function tick(){
  if(!btn.offsetParent)return;                       // hidden on other tabs — skip work
  const d=new Date();
  const ms=d.getTime(),local=ms/1000-d.getTimezoneOffset()*60;   // seconds on the wall clock
  const hr=d.getHours();
  setText(H,String(hr%12||12));setText(M,p2(d.getMinutes()));setText(S,p2(d.getSeconds()));setText(AP,hr>=12?'PM':'AM');
  // monotonically increasing angles → hands never spin backwards at 12
  const sec=Math.floor(local);
  sh.style.transform=`rotate(${sec*6}deg)`;
  mh.style.transform=`rotate(${(local/10).toFixed(2)}deg)`;
  hh.style.transform=`rotate(${(local/120).toFixed(3)}deg)`;
}
let timer=0;
function loop(){clearTimeout(timer);tick();timer=setTimeout(loop,1000-(Date.now()%1000)+8);}   // stay aligned to the second
function snap(){btn.classList.add('nohands');tick();void btn.offsetWidth;btn.classList.remove('nohands');}

const LABEL={digital:'Digital clock. Double-tap to switch to analog.',analog:'Analog clock. Double-tap to switch to digital.'};
function apply(m,announce){
  mode=m;btn.dataset.mode=m;btn.setAttribute('aria-label',LABEL[m]);
  try{localStorage.setItem(KEY,m);}catch{}
  if(announce){
    btn.classList.add('flash');setTimeout(()=>btn.classList.remove('flash'),420);
    if(navigator.vibrate)navigator.vibrate(10);
  }
}
const toggle=()=>apply(mode==='digital'?'analog':'digital',true);

// double-tap detection (works for touch, pen and mouse; avoids relying on browser dblclick/zoom behaviour)
let lastT=0,lastX=0,lastY=0;
btn.addEventListener('pointerup',e=>{
  if(e.pointerType==='mouse'&&e.button!==0)return;
  const t=e.timeStamp,close=Math.hypot(e.clientX-lastX,e.clientY-lastY)<32;
  if(t-lastT<330&&close){lastT=0;toggle();}else{lastT=t;lastX=e.clientX;lastY=e.clientY;}
});
btn.addEventListener('dblclick',e=>e.preventDefault());
btn.addEventListener('contextmenu',e=>e.preventDefault());
btn.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});

document.addEventListener('visibilitychange',()=>{if(document.hidden)clearTimeout(timer);else{snap();loop();}});
new MutationObserver(()=>{if(btn.offsetParent)snap();}).observe(document.body,{attributes:true,attributeFilter:['data-tab']});

apply(mode,false);snap();loop();

// one-time discoverability hint
try{if(!localStorage.getItem(KEY+'Hint')){setTimeout(()=>{if(btn.offsetParent&&typeof window.toast==='function'){window.toast('Tip: double-tap the clock to switch digital / analog');localStorage.setItem(KEY+'Hint','1');}},2200);}}catch{}
window.HeroClock={toggle,get mode(){return mode;}};
})();
