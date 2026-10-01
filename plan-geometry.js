(function(root){
 'use strict';
 const inside=(p,poly)=>{let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)hit=!hit}return hit};
 function roomPoint(room,preferred){
  const poly=room.polygon;if(!poly?.length||inside(preferred,poly))return preferred;
  // Project onto a grid of interior points, including concave rooms.
  let best=null,distance=Infinity;
  for(let iy=1;iy<30;iy++)for(let ix=1;ix<30;ix++){
   const p={x:room.x+room.w*ix/30,y:room.y+(room.hpx??room.h)*iy/30};
   const d=Math.hypot(p.x-preferred.x,p.y-preferred.y);
   if(d<distance&&inside(p,poly)){best=p;distance=d}
  }
  return best||preferred;
 }
 function snapRooms(pixels,width,height,rooms){
  const dark=(x,y)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=width||y>=height)return false;const k=(y*width+x)*4;return pixels[k+3]>100&&(pixels[k]+pixels[k+1]+pixels[k+2])/3<100};
  const score=(a,b,axis,position)=>{let supported=0,total=0;const length=Math.hypot(b.x-a.x,b.y-a.y);for(let d=12;d<length-12;d+=3){const t=d/length,x=axis==='x'?position:a.x+(b.x-a.x)*t,y=axis==='y'?position:a.y+(b.y-a.y)*t;total++;if(dark(x,y))supported++}return total>=12?supported/total:0};
  return rooms.map(room=>{
   const poly=room.polygon?.map(p=>({...p}));if(!poly||poly.length<3)return room;
   const shifts=[];
   for(let i=0;i<poly.length;i++){
    const a=poly[i],b=poly[(i+1)%poly.length];let axis;
    if(Math.abs(a.x-b.x)<2)axis='x';else if(Math.abs(a.y-b.y)<2)axis='y';else continue;
    const original=(a[axis]+b[axis])/2,base=score(a,b,axis,original);let position=original,best=base;
    for(let shift=-10;shift<=10;shift++){const candidate=original+shift,s=score(a,b,axis,candidate)-Math.abs(shift)*.004;if(s>best){best=s;position=candidate}}
    if(best>.55&&best>base+.15)shifts.push({i,axis,position});
   }
   for(const s of shifts){poly[s.i][s.axis]=s.position;poly[(s.i+1)%poly.length][s.axis]=s.position}
   const x=Math.min(...poly.map(p=>p.x)),y=Math.min(...poly.map(p=>p.y)),w=Math.max(...poly.map(p=>p.x))-x,h=Math.max(...poly.map(p=>p.y))-y;
   return {...room,polygon:poly,x,y,w,h};
  });
 }
 root.VentPlanGeometry={inside,roomPoint,snapRooms};
})(typeof window==='undefined'?globalThis:window);
