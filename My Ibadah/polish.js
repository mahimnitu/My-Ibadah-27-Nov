/* My Ibadah — interaction polish: tab transitions, tactile feedback, +1 bubbles, celebrations,
   swipe-down to close the More sheet. Purely additive: it only listens to events/DOM changes. */
'use strict';
(function(){
const $=id=>document.getElementById(id);
const reduce=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const buzz=p=>{try{navigator.vibrate&&navigator.vibrate(p);}catch{}};
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();

/* 1 ── Tab transition: panel content glides in, one block after another */
let enterT=0,lastEntered=null;
function enter(){
  if(reduce())return;
  const p=document.querySelector('#dashboardPanel:not(.hidden),.panel:not(.hidden)');if(!p)return;
  if(lastEntered)lastEntered.classList.remove('tab-enter');
  [...p.children].slice(0,9).forEach((c,i)=>c.style.setProperty('--i',i));
  p.classList.remove('tab-enter');void p.offsetWidth;p.classList.add('tab-enter');lastEntered=p;
  clearTimeout(enterT);enterT=setTimeout(()=>p.classList.remove('tab-enter'),800);
}
new MutationObserver(()=>requestAnimationFrame(enter)).observe(document.body,{attributes:true,attributeFilter:['data-tab']});

/* 2 ── Light haptics on navigation and checklist ticks */
document.addEventListener('click',e=>{
  if(e.target.closest('.bn-item,.more-item,.date-step,.date-today,.hs-dot'))buzz(6);
},true);
document.addEventListener('change',e=>{if(e.target.matches&&e.target.matches('input[type=checkbox]'))buzz(8);},true);

/* 3 ── Confetti (tiny canvas, auto-removes) */
function confetti(x,y,n){
  if(reduce())return;
  const cv=document.createElement('canvas');cv.className='confetti';
  const dpr=Math.min(2,window.devicePixelRatio||1),W=innerWidth,H=innerHeight;
  cv.width=W*dpr;cv.height=H*dpr;document.body.append(cv);
  const g=cv.getContext('2d');g.scale(dpr,dpr);
  const cols=[css('--gold')||'#e0a83c',css('--brand')||'#0a5c53',css('--link')||'#5fd0b6','#ffffff',css('--ok')||'#2fa36b'];
  const ps=Array.from({length:n||46},()=>{const a=-Math.PI/2+(Math.random()-.5)*2.3,s=5+Math.random()*7;
    return{x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,w:5+Math.random()*5,h:3+Math.random()*4,r:Math.random()*6,vr:(Math.random()-.5)*.4,c:cols[Math.random()*cols.length|0]};});
  const t0=performance.now();
  (function f(t){const k=(t-t0)/1500;g.clearRect(0,0,W,H);
    ps.forEach(p=>{p.vy+=.24;p.vx*=.992;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;g.save();g.globalAlpha=Math.max(0,1-k*k);g.translate(p.x,p.y);g.rotate(p.r);g.fillStyle=p.c;g.fillRect(-p.w/2,-p.h/2,p.w,p.h);g.restore();});
    if(k<1)requestAnimationFrame(f);else cv.remove();})(t0);
}
window.celebrate=confetti;

/* 4 ── Dhikr: floating +1, count pop, confetti when a target is reached */
document.addEventListener('click',e=>{
  const plus=e.target.closest&&e.target.closest('#dhikrList .counter-row .plus');if(!plus)return;
  const card=plus.closest('.dhikr-card'),idx=[...$('dhikrList').children].indexOf(card),was=card.classList.contains('done');
  const r=plus.getBoundingClientRect(),x=e.clientX||r.left+r.width/2,y=e.clientY||r.top;
  if(!reduce()){const b=document.createElement('span');b.className='float-plus';b.textContent='+1';b.style.left=x+'px';b.style.top=y+'px';document.body.append(b);b.addEventListener('animationend',()=>b.remove());}
  requestAnimationFrame(()=>{
    const nc=$('dhikrList').children[idx];if(!nc)return;
    const v=nc.querySelector('.counter-row strong');if(v){v.classList.remove('pop');void v.offsetWidth;v.classList.add('pop');}
    if(!was&&nc.classList.contains('done')){const b=nc.getBoundingClientRect();nc.classList.add('just-done');confetti(b.left+b.width/2,b.top+b.height/2,38);}
  });
},true);

/* 5 ── Home "Mark done": highlight the row that changed */
document.addEventListener('click',e=>{
  const btn=e.target.closest&&e.target.closest('.dashboard-prayer-row button');if(!btn)return;
  const rows=[...document.querySelectorAll('.dashboard-prayer-row')],i=rows.indexOf(btn.closest('.dashboard-prayer-row'));buzz(14);
  requestAnimationFrame(()=>{const r=document.querySelectorAll('.dashboard-prayer-row')[i];if(r){r.classList.add('flash-ok');setTimeout(()=>r.classList.remove('flash-ok'),1200);}});
},true);

/* 6 ── All five prayers done → celebration */
(function(){
  const el=$('prayerSummary');if(!el)return;let prev=null;
  const read=()=>{const t=el.textContent.trim();if(/all five/i.test(t))return 5;const m=/^(\d+)\s/.exec(t);return m?+m[1]:null;};
  prev=read();
  new MutationObserver(()=>{const n=read();if(n===null)return;
    if(prev!==null&&prev<5&&n>=5&&document.body.dataset.tab==='dashboard'){buzz([20,40,20,40,30]);const b=el.getBoundingClientRect();confetti(b.left+b.width/2,Math.max(120,b.top),70);
      if(typeof window.toast==='function')window.toast("✨ Masha'Allah — all 5 prayers completed");}
    prev=n;}).observe(el,{childList:true,characterData:true,subtree:true});
})();

/* 7 ── Header shadow on scroll */
const bar=document.querySelector('.topbar');let sT=0;
addEventListener('scroll',()=>{if(sT)return;sT=requestAnimationFrame(()=>{sT=0;bar&&bar.classList.toggle('scrolled',scrollY>8);});},{passive:true});

/* 8 ── Swipe the More sheet down to close */
(function(){
  const panel=document.querySelector('.more-panel'),sheet=$('moreSheet');if(!panel||!sheet)return;
  let y0=0,dy=0,drag=false;
  panel.addEventListener('touchstart',e=>{const r=panel.getBoundingClientRect();if(e.touches[0].clientY-r.top>70||panel.scrollTop>0)return;y0=e.touches[0].clientY;dy=0;drag=true;panel.style.transition='none';},{passive:true});
  panel.addEventListener('touchmove',e=>{if(!drag)return;dy=Math.max(0,e.touches[0].clientY-y0);panel.style.transform=`translateY(${dy}px)`;},{passive:true});
  const end=()=>{if(!drag)return;drag=false;panel.style.transition='';const close=dy>90;
    if(close){panel.style.transform=`translateY(100%)`;setTimeout(()=>{$('moreClose')&&$('moreClose').click();panel.style.transform='';},160);}else panel.style.transform='';};
  panel.addEventListener('touchend',end);panel.addEventListener('touchcancel',end);
})();
})();
