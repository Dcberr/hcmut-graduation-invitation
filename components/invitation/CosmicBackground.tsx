'use client';
import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

type Spark = { x:number; y:number; vx:number; vy:number; life:number };
/** One transparent canvas; no React renders per animation frame. */
export default function CosmicBackground() {
 const canvasRef=useRef<HTMLCanvasElement>(null);
 const [paused,setPaused]=useState(false);
 const [reduced,setReduced]=useState(false);
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>setReduced(media.matches);update();media.addEventListener('change',update);
  return()=>media.removeEventListener('change',update);
 },[]);
 useEffect(()=>{
  const canvas=canvasRef.current;const ctx=canvas?.getContext('2d');if(!canvas||!ctx)return;
  let width=0,height=0,frame=0,last=0,time=0;
  let pointer={x:0,y:0},offset={x:0,y:0};let sparks:Spark[]=[];
  const stars=Array.from({length:42},(_,i)=>({x:((i*73+19)%101)/101,y:((i*47+11)%103)/103,r:.5+(i%3)*.35,phase:i*1.7}));
  const quiet=paused||reduced;
  function resize(){width=innerWidth;height=innerHeight;const dpr=Math.min(devicePixelRatio||1,1.5);canvas!.width=Math.round(width*dpr);canvas!.height=Math.round(height*dpr);ctx!.setTransform(dpr,0,0,dpr,0,0);draw(0);}
  function draw(dt:number){
   if(!ctx)return;time+=dt;ctx.clearRect(0,0,width,height);
   offset.x+=(pointer.x-offset.x)*.04;offset.y+=(pointer.y-offset.y)*.04;
   const drift=quiet?0:time;
   stars.forEach((star,i)=>{
    const x=(star.x*width+drift*(5+i%4*2)+Math.sin(drift*.4+star.phase)*12+offset.x*(i%3+1)+width)%width;
    const y=(star.y*height+drift*(3+i%3)+Math.cos(drift*.3+star.phase)*16+offset.y*(i%3+1)+height)%height;
    ctx.globalAlpha=.18+(Math.sin(drift*1.2+star.phase)+1)*.16;ctx.fillStyle=i%4===0?'#f4d58b':'#c9ddff';
    ctx.beginPath();ctx.arc(x,y,star.r,0,Math.PI*2);ctx.fill();
    if(i%11===0){ctx.strokeStyle='#edcf87';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(x-3,y);ctx.lineTo(x+3,y);ctx.moveTo(x,y-3);ctx.lineTo(x,y+3);ctx.stroke();}
   });
   // Quiet edge ornaments leave the invitation's central text unobstructed.
   for(let i=0;i<2;i++){
    const x=width*(i===0?.09:.9)+Math.sin(drift*.13+i*3)*7+offset.x;
    const y=height*(i===0?.26:.76)+Math.cos(drift*.12+i)*10+offset.y;
    const radius=width<760?10:17;
    ctx.save();ctx.translate(x,y);ctx.rotate(-.4+i*.8+Math.sin(drift*.1)*.12);ctx.globalAlpha=.25;
    const fill=ctx.createRadialGradient(-radius/3,-radius/3,1,0,0,radius);fill.addColorStop(0,'#7b9ccc');fill.addColorStop(1,'#172a50');ctx.fillStyle=fill;ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d6b773';ctx.lineWidth=.7;ctx.beginPath();ctx.ellipse(0,0,radius*1.8,radius*.45,0,0,Math.PI*2);ctx.stroke();ctx.restore();
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
