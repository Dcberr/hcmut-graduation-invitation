'use client';
import { useLayoutEffect, useRef, type RefObject } from 'react';
export function useCordSpring(ref:RefObject<HTMLDivElement|null>,angle:number,stretch:number,dragging:boolean){
 const motion=useRef({angle:0,stretch:0,av:0,sv:0});
 useLayoutEffect(()=>{
  const element=ref.current;if(!element)return;
  const rest=parseFloat(getComputedStyle(element).getPropertyValue('--rest-cord'))||100;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let frame=0,last=performance.now();
  const paint=()=>{const m=motion.current;const ratio=Math.max(.5,(rest+m.stretch)/rest);element.style.setProperty('--cord-angle',`${m.angle}deg`);element.style.setProperty('--pull',`${m.stretch}px`);element.style.setProperty('--stretch-y',String(ratio));element.style.setProperty('--stretch-x',String(1/Math.sqrt(ratio)));};
  if(reduced){motion.current={angle,stretch,av:0,sv:0};paint();return;}
  function tick(now:number){
   const dt=Math.min((now-last)/1000,1/30);last=now;
   const m=motion.current;const stiffness=dragging?520:210,damping=dragging?40:20;
   // Small integration steps keep the spring stable on low-frame-rate devices.
   const steps=Math.max(1,Math.ceil(dt/.008)),h=dt/steps;
   for(let i=0;i<steps;i++){m.av+=((angle-m.angle)*stiffness-m.av*damping)*h;m.sv+=((stretch-m.stretch)*stiffness-m.sv*damping)*h;m.angle+=m.av*h;m.stretch+=m.sv*h;}
   if(Math.abs(angle-m.angle)+Math.abs(stretch-m.stretch)+Math.abs(m.av)+Math.abs(m.sv)<.08){motion.current={angle,stretch,av:0,sv:0};paint();return;}
   paint();frame=requestAnimationFrame(tick);
  }
  frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
 },[ref,angle,stretch,dragging]);
}
