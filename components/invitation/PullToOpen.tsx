'use client';
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { useCordSpring } from './useCordSpring';
import { ArrowDown, Check } from 'lucide-react';

const PULL_DISTANCE = 64; // Screen pixels, independent of the invitation scale.
export default function PullToOpen({scale,onOpen}:{scale:number;onOpen:()=>void}) {
 const braidId=useId().replace(/:/g,'');
 const [distance,setDistance]=useState(0);const [dragging,setDragging]=useState(false);
 const cordRef=useRef<HTMLDivElement>(null);
 const [vector,setVector]=useState({angle:0,stretch:0});
 const [tilt,setTilt]=useState(0);
 const [sensorOn,setSensorOn]=useState(false);
 const [sensorMessage,setSensorMessage]=useState('');
 const sensorZero=useRef<number|null>(null);
 const gesture=useRef<{id:number;x:number;y:number;distance:number;rest:number;angle:number}|null>(null);
 useEffect(()=>{
   if(!sensorOn)return;
   let last=0;
   const orient=(event:DeviceOrientationEvent)=>{
     if(document.hidden||event.gamma===null||event.beta===null)return;
     const now=performance.now();if(now-last<40)return;last=now;
     const angle=(screen.orientation?.angle??0)*Math.PI/180;
     const lateral=event.gamma*Math.cos(angle)+event.beta*Math.sin(angle);
     if(sensorZero.current===null)sensorZero.current=lateral;
     setTilt(Math.max(-16,Math.min(16,-(lateral-sensorZero.current)*.45)));
   };
   const calibrate=()=>{sensorZero.current=null;setTilt(0);};
   window.addEventListener('deviceorientation',orient);
   window.addEventListener('orientationchange',calibrate);
   return()=>{window.removeEventListener('deviceorientation',orient);window.removeEventListener('orientationchange',calibrate);};
 },[sensorOn]);
 async function toggleSensor(){
   if(sensorOn){setSensorOn(false);setTilt(0);setSensorMessage('');return;}
   const sensor=window.DeviceOrientationEvent as (typeof DeviceOrientationEvent & {requestPermission?:()=>Promise<string>})|undefined;
   if(!window.isSecureContext||!sensor){setSensorMessage('Cảm biến cần trình duyệt hỗ trợ và link HTTPS. Bạn vẫn kéo dây được.');return;}
   try{
     if(sensor.requestPermission&&await sensor.requestPermission()!=='granted'){setSensorMessage('Chưa được cấp quyền nghiêng máy. Bạn vẫn kéo dây được.');return;}
     sensorZero.current=null;setSensorOn(true);setSensorMessage('Giữ máy thẳng rồi nghiêng nhẹ để thử.');
   }catch{setSensorMessage('Không bật được cảm biến. Bạn vẫn kéo dây được.');}
 }
 useCordSpring(cordRef,dragging?vector.angle:tilt,dragging?vector.stretch:0,dragging);
 const opened=useRef(false);
 const ready=distance>=PULL_DISTANCE;
 function open(){if(opened.current)return;opened.current=true;onOpen();}
 function reset(){gesture.current=null;setDragging(false);setDistance(0);setVector({angle:0,stretch:0});}
 return <><div ref={cordRef} className={`pull-cord ${dragging?'dragging':''} ${ready?'ready':''}`} style={{'--handle-size':`${Math.max(54,44/scale)}px`} as CSSProperties}>
  <div className="cord-anchor" aria-hidden="true"/><div className="cord-motion"><div className="cord-line" aria-hidden="true"><svg width="100%" height="100%" viewBox="0 0 24 120" preserveAspectRatio="none"><defs>
    <linearGradient id={`${braidId}-silk`} x1="0" y1="0" x2="1" y2=".6"><stop stopColor="#a58247"/><stop offset=".28" stopColor="#e6cd95"/><stop offset=".52" stopColor="#fff0c9"/><stop offset=".8" stopColor="#d1b374"/><stop offset="1" stopColor="#96733f"/></linearGradient>
    <pattern id={braidId} width="24" height="28" patternUnits="userSpaceOnUse">
      <path d="M12 -5C4 -2 1 3 4 8L12 15 20 8C23 3 20 -2 12 -5ZM12 9C4 12 1 17 4 22L12 29 20 22C23 17 20 12 12 9Z" fill="#725b35"/>
      <path d="M4 -3C1 3 4 9 15 15C22 14 22 9 18 6Z" fill={`url(#${braidId}-silk)`}/>
      <path d="M20 11C23 17 20 23 9 29C2 28 2 23 6 20Z" fill={`url(#${braidId}-silk)`}/>
      <path d="M5 1C5 6 10 9 16 12M19 15C19 20 14 23 8 26" fill="none" stroke="#fff2ce" strokeOpacity=".6" strokeWidth=".8"/>
      <path d="M7 0C7 4 12 7 18 10M17 14C17 18 12 21 6 24" fill="none" stroke="#92713e" strokeOpacity=".35" strokeWidth=".6"/>
    </pattern></defs><rect width="100%" height="100%" fill={`url(#${braidId})`}/></svg></div>
  <button className="cord-handle" aria-label="Kéo dây để mở thư; hoặc nhấn Enter" aria-describedby="pull-instructions"
   onPointerDown={event=>{if(event.button!==0||gesture.current)return;event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);const rest=parseFloat(getComputedStyle(cordRef.current!).getPropertyValue('--rest-cord'))||100;gesture.current={id:event.pointerId,x:event.clientX,y:event.clientY,distance:0,rest,angle:tilt*Math.PI/180};setVector({angle:tilt,stretch:0});setDragging(true);}}
   onPointerMove={event=>{const start=gesture.current;if(!start||start.id!==event.pointerId)return;const dx=event.clientX-start.x,dy=event.clientY-start.y;
     const x=-Math.sin(start.angle)*start.rest+dx/scale*.7;
     const y=Math.cos(start.angle)*start.rest+dy/scale*.7;
     const length=Math.hypot(x,y);
     const next=Math.hypot(dx,dy);start.distance=next;setDistance(next);
     setVector({angle:Math.max(-75,Math.min(75,-Math.atan2(x,Math.max(20,y))*180/Math.PI)),stretch:Math.max(-start.rest*.45,Math.min(110,length-start.rest))});}}
   onPointerUp={event=>{const start=gesture.current;if(!start||start.id!==event.pointerId)return;const complete=start.distance>=PULL_DISTANCE;reset();if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);if(complete)open();}}
   onPointerCancel={reset} onLostPointerCapture={()=>{if(gesture.current)reset();}}
   onClick={event=>{if(event.detail===0)open();}}>
    <svg className="braid-tassel" viewBox="0 0 36 76" aria-hidden="true"><defs><linearGradient id={`${braidId}-end`}><stop stopColor="#947141"/><stop offset=".4" stopColor="#f6e5bb"/><stop offset=".65" stopColor="#d8bc82"/><stop offset="1" stopColor="#a07b42"/></linearGradient></defs>
      <path d="M12 2Q18 -2 24 2L24 20Q18 25 12 20Z" fill={`url(#${braidId}-end)`}/>
      <path d="M12 5H24M12 9H24M12 13H24M12 17H24" stroke="#896735" strokeWidth="1" opacity=".6"/>
      <path d="M13 22Q10 42 6 64Q18 72 30 64Q26 42 23 22Z" fill={`url(#${braidId}-end)`}/>
      <path d="M14 24L10 64M17 25L15 67M20 25L21 67M23 24L26 64" fill="none" stroke="#fff0c7" strokeWidth=".8"/>
      <path d="M15 25L13 65M19 25L18 68M22 25L24 65" fill="none" stroke="#9c7946" strokeWidth=".7"/>
    </svg>
    <span className="braid-cue" aria-hidden="true">{ready?<Check size={18}/>:<ArrowDown size={16}/>}</span>
  </button></div>
 </div><div className="pull-instructions" id="pull-instructions"><strong>{ready?'Thả tay để mở thư':dragging?'Kéo thêm một chút…':'Kéo dây tết ở góc phải để mở'}</strong><span>{sensorMessage||'Thử kéo dây sang một hướng bất kỳ'}</span></div><button className="tilt-toggle" onClick={toggleSensor} aria-pressed={sensorOn}>{sensorOn?'Tắt nghiêng máy':'Bật nghiêng máy'}</button><span className="sr-only" role="status">{ready?'Đã kéo đủ. Thả tay để mở thư.':''}</span></>;
}
