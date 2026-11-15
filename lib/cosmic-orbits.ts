/** Circular paths, projected as ellipses on wide screens. Shared by tracks and planets. */
export function orbitGeometry(width:number,height:number,index:number) {
 const mobile=width<760;
 const radius=mobile?Math.max(width*.59,Math.min(height*.36,310))+index*26:Math.min(width*.43,height*.70)+index*38;
 return {cx:width/2,cy:height*(mobile?.48:.52),rx:radius,ry:mobile?radius:radius*.60,rotation:mobile?0:-.19};
}
export function orbitPoint(orbit:ReturnType<typeof orbitGeometry>,angle:number) {
 const x=orbit.rx*Math.cos(angle),y=orbit.ry*Math.sin(angle);
 return {x:orbit.cx+x*Math.cos(orbit.rotation)-y*Math.sin(orbit.rotation),y:orbit.cy+x*Math.sin(orbit.rotation)+y*Math.cos(orbit.rotation)};
}
