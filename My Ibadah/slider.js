/* My Ibadah — Home card slider: Ibadah progress · Where did you pray? · Day streak · Weekly dhikr · Ramadan
   Moves the existing cards (IDs and handlers stay intact) into a swipeable, scroll-snapping track. */
'use strict';
(function(){
const dash=document.getElementById('dashboardPanel');if(!dash||document.getElementById('homeSlider'))return;
const cards=[
  {el:dash.querySelector('.ibadah-progress-card'),label:'Ibadah progress'},
  {el:document.getElementById('placesCard'),label:'Where did you pray?'},
  {el:document.getElementById('streakCard'),label:'Day streak'},
  {el:dash.querySelector('.weekly-counter-card'),label:'Weekly dhikr'},
  {el:document.getElementById('ramadanCard'),label:'Ramadan'}
].filter(c=>c.el);
if(cards.length<2)return;

const wrap=document.createElement('section');wrap.id='homeSlider';wrap.className='home-slider';wrap.setAttribute('aria-roledescription','carousel');wrap.setAttribute('aria-label','Home cards');
const track=document.createElement('div');track.className='hs-track';track.tabIndex=0;
const dots=document.createElement('div');dots.className='hs-dots';dots.setAttribute('role','tablist');
wrap.append(track,dots);

const anchor=dash.querySelector('.prayer-status-card');
dash.insertBefore(wrap,anchor||dash.firstChild);

const slides=cards.map((c,i)=>{
  const s=document.createElement('div');s.className='hs-slide'+(c.el.id==='ramadanCard'?' rm-slide':'');s.setAttribute('role','group');s.setAttribute('aria-roledescription','slide');s.setAttribute('aria-label',`${i+1} / ${cards.length}`);
  s.append(c.el);track.append(s);
  const d=document.createElement('button');d.type='button';d.className='hs-dot';d.setAttribute('role','tab');d.setAttribute('aria-label',c.label);d.innerHTML='<i></i>';
  d.addEventListener('click',()=>go(i));dots.append(d);return s;
});

let active=0,anim=0;
const reduce=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const padL=()=>parseFloat(getComputedStyle(track).paddingLeft)||0;
const pos=i=>slides[i].offsetLeft-padL();            // scrollLeft that puts slide i in place
const maxScroll=()=>track.scrollWidth-track.clientWidth;
function mark(){dots.querySelectorAll('.hs-dot').forEach((d,i)=>{const on=i===active;d.classList.toggle('on',on);d.setAttribute('aria-selected',on);});slides.forEach((s,i)=>s.classList.toggle('active',i===active));}
function nearest(){const x=Math.min(track.scrollLeft,maxScroll());let best=0,bd=1e9;slides.forEach((_,i)=>{const d=Math.abs(x-Math.min(pos(i),maxScroll()));if(d<bd){bd=d;best=i;}});return best;}
function stopAnim(){if(anim){cancelAnimationFrame(anim);anim=0;track.style.scrollSnapType='';}}
function animateTo(x,ms){
  stopAnim();const start=track.scrollLeft,dist=x-start;
  if(reduce()||Math.abs(dist)<1){track.scrollLeft=x;return;}
  const dur=ms||Math.min(520,Math.max(320,Math.abs(dist)*0.55)),t0=performance.now();
  track.style.scrollSnapType='none';                  // let our easing drive; snap re-enabled at the end
  const ease=k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2; // easeInOutCubic
  (function frame(t){const k=Math.min(1,(t-t0)/dur);track.scrollLeft=start+dist*ease(k);
    if(k<1)anim=requestAnimationFrame(frame);else{anim=0;track.style.scrollSnapType='';}})(t0);
}
function go(i,ms){active=Math.max(0,Math.min(slides.length-1,i));mark();animateTo(Math.min(pos(active),maxScroll()),ms);}
let raf=0;
track.addEventListener('scroll',()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;const i=nearest();if(i!==active){active=i;mark();}});},{passive:true});
['pointerdown','touchstart','wheel'].forEach(ev=>track.addEventListener(ev,stopAnim,{passive:true}));
track.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();go(active+1);}else if(e.key==='ArrowLeft'){e.preventDefault();go(active-1);}});
window.addEventListener('resize',()=>{stopAnim();track.scrollLeft=Math.min(pos(active),maxScroll());});
mark();
// one-time gentle peek so people discover the slider
try{if(!localStorage.getItem('myIbadah.sliderHint')&&!reduce()){setTimeout(()=>{if(track.scrollLeft<2&&document.body.dataset.tab==='dashboard'){animateTo(46,420);setTimeout(()=>go(0,520),620);localStorage.setItem('myIbadah.sliderHint','1');}},1400);}}catch{}
window.HomeSlider={go,get index(){return active;}};
})();
