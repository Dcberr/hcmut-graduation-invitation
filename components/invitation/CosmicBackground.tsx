'use client';
import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { orbitGeometry, orbitPoint } from '../../lib/cosmic-orbits';

type Spark = { x:number; y:number; vx:number; vy:number; life:number };
/** One transparent canvas; no React renders per animation frame. */
export default function CosmicBackground() {
 const canvasRef=useRef<HTMLCanvasElement>(null);
 const elapsed=useRef(0);
 const [paused,setPaused]=useState(false);
 const [reduced,setReduced]=useState(false);
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>setReduced(media.matches);update();media.addEventListener('change',update);
  return()=>media.removeEventListener('change',update);
 },[]);
 useEffect(()=>{
  const canvas=canvasRef.current;const ctx=canvas?.getContext('2d');if(!canvas||!ctx)return;
  let width=0,height=0,frame=0,last=0,time=elapsed.current;
  let pointer={x:0,y:0},offset={x:0,y:0};let sparks:Spark[]=[];
  const stars=Array.from({length:72},(_,i)=>({x:((i*73+19)%101)/101,y:((i*47+11)%103)/103,r:.5+(i%3)*.35,phase:i*1.7}));
  const quiet=paused||reduced;
  function resize(){width=innerWidth;height=innerHeight;const dpr=Math.min(devicePixelRatio||1,1.5);canvas!.width=Math.round(width*dpr);canvas!.height=Math.round(height*dpr);ctx!.setTransform(dpr,0,0,dpr,0,0);draw(0);}
  function draw(dt:number){
   if(!ctx)return;time+=dt;elapsed.current=time;ctx.clearRect(0,0,width,height);
   offset.x+=(pointer.x-offset.x)*.04;offset.y+=(pointer.y-offset.y)*.04;
   const drift=time;
   // Soft, transparent light falls off before the viewport edges (no background seams).
   if(width>=760){
    for(const [x,y,color] of [[width*.12,height*.38,'rgba(53,102,177,.16)'],[width*.88,height*.64,'rgba(102,69,155,.13)']] as const){
     const glow=ctx.createRadialGradient(x,y,0,x,y,Math.min(width,height)*.55);glow.addColorStop(0,color);glow.addColorStop(1,'rgba(5,14,49,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
    }
   }
   for(let i=0;i<3;i++){
    const orbit=orbitGeometry(width,height,i);
    ctx.save();ctx.translate(orbit.cx,orbit.cy);ctx.rotate(orbit.rotation);
    ctx.strokeStyle=i===1?'rgba(225,198,133,.19)':'rgba(144,173,219,.12)';ctx.lineWidth=.7;
    ctx.beginPath();ctx.ellipse(0,0,orbit.rx,orbit.ry,0,0,Math.PI*2);ctx.stroke();
    ctx.restore();
   }
   stars.forEach((star,i)=>{
    const x=(star.x*width+drift*(5+i%4*2)+Math.sin(drift*.4+star.phase)*12+offset.x*(i%3+1)+width)%width;
    const y=(star.y*height+drift*(3+i%3)+Math.cos(drift*.3+star.phase)*16+offset.y*(i%3+1)+height)%height;
    ctx.globalAlpha=.18+(Math.sin(drift*1.2+star.phase)+1)*.16;ctx.fillStyle=i%4===0?'#f4d58b':'#c9ddff';
    ctx.beginPath();ctx.arc(x,y,star.r,0,Math.PI*2);ctx.fill();
    if(i%11===0){ctx.strokeStyle='#edcf87';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(x-3,y);ctx.lineTo(x+3,y);ctx.moveTo(x,y-3);ctx.lineTo(x,y+3);ctx.stroke();}
   });
   // Each planet and its luminous wake use precisely the same path as its track.
   for(let i=0;i<3;i++){
    const orbit=orbitGeometry(width,height,i);
    const angle=drift*Math.PI*2/[24,36,48][i]+[3.7,.45,2.1][i];
    const point=orbitPoint(orbit,angle);
    for(let j=16;j>0;j--){
     const trail=orbitPoint(orbit,angle-j*.012);
     ctx.globalAlpha=(1-j/17)*.24;ctx.fillStyle=i===1?'#efd395':'#9dbff1';
     ctx.beginPath();ctx.arc(trail.x,trail.y,width<760?.8:1.2,0,Math.PI*2);ctx.fill();
    }
    const radius=(width<760?7:13)+i*2;
    ctx.save();ctx.translate(point.x,point.y);ctx.rotate(-.4+i*.55);ctx.globalAlpha=width<760?.65:.85;
    const halo=ctx.createRadialGradient(0,0,radius*.5,0,0,radius*3);halo.addColorStop(0,'rgba(155,187,241,.20)');halo.addColorStop(1,'rgba(155,187,241,0)');ctx.fillStyle=halo;ctx.fillRect(-radius*3,-radius*3,radius*6,radius*6);
    const fill=ctx.createRadialGradient(-radius*.4,-radius*.4,1,0,0,radius);fill.addColorStop(0,i===1?'#eed8a0':'#a1c9ed');fill.addColorStop(.4,i===1?'#9f8452':'#466ca3');fill.addColorStop(1,'#0c1b39');
    // Rear half of Saturn's ring, globe, then front half.
    ctx.strokeStyle='#d6bd83';ctx.lineWidth=.9;
    if(i!==2){ctx.beginPath();ctx.ellipse(0,0,radius*1.85,radius*.48,0,Math.PI,Math.PI*2);ctx.stroke();}
    ctx.fillStyle=fill;ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.fill();
    if(i!==2){ctx.beginPath();ctx.ellipse(0,0,radius*1.85,radius*.48,0,0,Math.PI);ctx.stroke();}
    ctx.restore();
   }
   sparks=sparks.filter(s=>s.life>0);for(const s of sparks){s.life-=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;ctx.globalAlpha=Math.max(0,s.life/1.1)*.7;ctx.fillStyle='#ffe2a0';ctx.beginPath();ctx.arc(s.x,s.y,1.3,0,Math.PI*2);ctx.fill();}
   ctx.globalAlpha=1;
  }
  function tick(now:number){if(now-last>32){const dt=Math.min((now-last)/1000,.05);last=now;draw(dt);}frame=requestAnimationFrame(tick);}
  function start(){cancelAnimationFrame(frame);if(!document.hidden&&!quiet){last=performance.now();frame=requestAnimationFrame(tick);}else draw(0);}
  function move(e:PointerEvent){if(quiet)return;pointer={x:(e.clientX/width-.5)*5,y:(e.clientY/height-.5)*5};}
  function burst(e:PointerEvent){if(quiet||!(e.target instanceof Element)||e.target.closest('button,a,input,textarea,[role="dialog"],.paper,.envelope-hit'))return;
   for(let i=0;i<12;i++){const angle=i*Math.PI/6;sparks.push({x:e.clientX,y:e.clientY,vx:Math.cos(angle)*22,vy:Math.sin(angle)*22,life:1.1});}sparks=sparks.slice(-72);
  }
  resize();start();addEventListener('resize',resize);addEventListener('pointermove',move,{passive:true});addEventListener('pointerdown',burst,{passive:true});document.addEventListener('visibilitychange',start);
  return()=>{cancelAnimationFrame(frame);removeEventListener('resize',resize);removeEventListener('pointermove',move);removeEventListener('pointerdown',burst);document.removeEventListener('visibilitychange',start);};
 },[paused,reduced]);
 return <><canvas ref={canvasRef} className="cosmic-background" aria-hidden="true"/>{!reduced&&<button className="cosmic-toggle" onClick={()=>setPaused(value=>!value)} aria-label={paused?'Bật chuyển động nền':'Tạm dừng chuyển động nền'} title={paused?'Bật chuyển động nền':'Tạm dừng chuyển động nền'}>{paused?<Play size={15}/>:<Pause size={15}/>}</button>}</>;
}
