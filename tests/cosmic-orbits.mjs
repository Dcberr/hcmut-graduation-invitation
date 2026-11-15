import assert from 'node:assert/strict';
import { orbitGeometry, orbitPoint } from '../lib/cosmic-orbits.ts';
for(const [w,h] of [[390,844],[1440,900],[1920,1080]]){
 for(let i=0;i<3;i++){
  const o=orbitGeometry(w,h,i);
  for(let a=0;a<Math.PI*2;a+=.1){
   const p=orbitPoint(o,a),x=p.x-o.cx,y=p.y-o.cy;
   const u=x*Math.cos(o.rotation)+y*Math.sin(o.rotation),v=-x*Math.sin(o.rotation)+y*Math.cos(o.rotation);
   assert.ok(Math.abs((u/o.rx)**2+(v/o.ry)**2-1)<1e-10,'Planet must stay on its visible track');
   const end=orbitPoint(o,a+Math.PI*2);assert.ok(Math.hypot(p.x-end.x,p.y-end.y)<1e-9,'Orbit must wrap without jumping');
  }
 }
}
console.log('Orbit geometry: mobile and desktop paths, full-revolution continuity passed');
