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
 function validPolygon(poly){
  if(!Array.isArray(poly)||poly.length<3||poly.length>40||poly.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)))return false;
  const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
  for(let i=0;i<poly.length;i++)for(let j=i+1;j<poly.length;j++){if(j===i+1||(i===0&&j===poly.length-1))continue;const a=poly[i],b=poly[(i+1)%poly.length],c=poly[j],d=poly[(j+1)%poly.length];if(cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0)return false}
  const area=Math.abs(poly.reduce((sum,p,i)=>{const q=poly[(i+1)%poly.length];return sum+p.x*q.y-q.x*p.y},0)/2);return area>=500;
 }
 // Shared exact predicates; touching boundaries are not overlapping floor area.
 const epsilon=1e-7;
 const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
 const signedArea=poly=>poly.reduce((s,p,i)=>{const q=poly[(i+1)%poly.length];return s+p.x*q.y-q.x*p.y},0)/2;
 const area=poly=>Math.abs(signedArea(poly));
 const distanceToSegment=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy)};
 const onSegment=(p,a,b)=>distanceToSegment(p,a,b)<epsilon;
 const contains=(p,poly)=>inside(p,poly)||poly.some((a,i)=>onSegment(p,a,poly[(i+1)%poly.length]));
 function intersects(a,b,c,d){const abC=cross(a,b,c),abD=cross(a,b,d),cdA=cross(c,d,a),cdB=cross(c,d,b);return abC*abD<0&&cdA*cdB<0||onSegment(a,c,d)||onSegment(b,c,d)||onSegment(c,a,b)||onSegment(d,a,b)}
 function polygonIssues(poly,{minArea=500,bounds=true}={}){
  if(!Array.isArray(poly)||poly.length<3||poly.length>64)return ['polygon_size'];
  if(poly.some(p=>!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)))return ['polygon_numbers'];
  const issues=[];
  if(bounds&&poly.some(p=>p.x<0||p.x>1000||p.y<0||p.y>700))issues.push('polygon_bounds');
  if(poly.some((p,i)=>poly.some((q,j)=>j>i&&Math.hypot(p.x-q.x,p.y-q.y)<epsilon)))issues.push('polygon_duplicate');
  for(let i=0;i<poly.length;i++)for(let j=i+1;j<poly.length;j++){
   const a=poly[i],b=poly[(i+1)%poly.length],c=poly[j],d=poly[(j+1)%poly.length];
   if(j===i+1||(i===0&&j===poly.length-1)){const common=j===i+1?b:a,other1=j===i+1?a:b,other2=j===i+1?d:c;if(Math.abs(cross(other1,common,other2))<epsilon&&onSegment(other1,common,other2))issues.push('polygon_crossed');continue}
   if(intersects(a,b,c,d))issues.push('polygon_crossed');
  }
  if(area(poly)<minArea)issues.push('polygon_small');
  return [...new Set(issues)];
 }
 function triangles(poly){
  const p=signedArea(poly)>0?poly.slice():poly.slice().reverse(),out=[];let guard=0;
  while(p.length>3&&guard++<256){let found=false;for(let i=0;i<p.length;i++){const a=p[(i+p.length-1)%p.length],b=p[i],c=p[(i+1)%p.length];if(cross(a,b,c)<=epsilon)continue;if(p.some(q=>q!==a&&q!==b&&q!==c&&contains(q,[a,b,c])))continue;out.push([a,b,c]);p.splice(i,1);found=true;break}if(!found)return []}if(p.length===3)out.push(p);return out;
 }
 function convexClip(subject,clip){let out=subject;for(let i=0;i<clip.length;i++){const a=clip[i],b=clip[(i+1)%clip.length],input=out;out=[];if(!input.length)break;let s=input.at(-1);for(const e of input){const ei=cross(a,b,e)>=-epsilon,si=cross(a,b,s)>=-epsilon;if(ei!==si){const ds=cross(a,b,s),de=cross(a,b,e),t=ds/(ds-de);out.push({x:s.x+t*(e.x-s.x),y:s.y+t*(e.y-s.y)})}if(ei)out.push(e);s=e}}return out}
 function overlapArea(a,b){if(polygonIssues(a,{minArea:0,bounds:false}).length||polygonIssues(b,{minArea:0,bounds:false}).length)return NaN;let total=0;for(const x of triangles(a))for(const y of triangles(b)){const clip=convexClip(x,y);if(clip.length>=3)total+=area(clip)}return total}
 const outline=r=>r.polygon?.length>=3?r.polygon:[{x:r.x,y:r.y},{x:r.x+r.w,y:r.y},{x:r.x+r.w,y:r.y+(r.hpx??r.h)},{x:r.x,y:r.y+(r.hpx??r.h)}];
 const boundaryDistance=(p,poly)=>Math.min(...poly.map((a,i)=>distanceToSegment(p,a,poly[(i+1)%poly.length])));
 function interiorPoint(room,preferred,clearance=8){const poly=outline(room),bb=boundsOf(poly);let best=null,bestScore=Infinity;for(let y=bb.y+2;y<bb.y+bb.h;y+=Math.max(2,bb.h/40))for(let x=bb.x+2;x<bb.x+bb.w;x+=Math.max(2,bb.w/40)){const p={x,y};if(!inside(p,poly))continue;const gap=boundaryDistance(p,poly),score=Math.hypot(x-preferred.x,y-preferred.y)+Math.max(0,clearance-gap)*100;if(score<bestScore){best=p;bestScore=score}}if(inside(preferred,poly)&&boundaryDistance(preferred,poly)>=clearance)return preferred;return best}
 function boundsOf(poly){const x=Math.min(...poly.map(p=>p.x)),y=Math.min(...poly.map(p=>p.y));return {x,y,w:Math.max(...poly.map(p=>p.x))-x,h:Math.max(...poly.map(p=>p.y))-y}}
 function segmentContained(a,b,poly){const n=Math.max(1,Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)));for(let i=0;i<=n;i++)if(!contains({x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n},poly))return false;return true}
 function pathIssues(pts,envelope,zones=[],clearance=6){if(!Array.isArray(pts)||pts.length<2)return ['route_missing'];if(pts.some(p=>!Array.isArray(p)||p.length!==2||p.some(n=>!Number.isFinite(n))))return ['route_numbers'];const issues=[];for(let i=1;i<pts.length;i++){const a={x:pts[i-1][0],y:pts[i-1][1]},b={x:pts[i][0],y:pts[i][1]};if(envelope?.length&&!segmentContained(a,b,envelope))issues.push('route_outside');if(Math.abs(a.x-b.x)>epsilon&&Math.abs(a.y-b.y)>epsilon)issues.push('route_diagonal');for(const z of zones){const poly=outline({x:z.x-clearance,y:z.y-clearance,w:z.w+2*clearance,hpx:z.h+2*clearance});if(contains(a,poly)||contains(b,poly)||poly.some((c,j)=>intersects(a,b,c,poly[(j+1)%poly.length])))issues.push('route_zone')}}return [...new Set(issues)]}
 root.VentPlanGeometry={inside,contains,roomPoint:(r,p)=>interiorPoint(r,p)||p,snapRooms:(pixels,w,h,rooms)=>snapRooms(pixels,w,h,rooms).map((r,i)=>polygonIssues(r.polygon).length?rooms[i]:r),validPolygon:poly=>!polygonIssues(poly).length,polygonIssues,area,signedArea,overlapArea,outline,boundsOf,boundaryDistance,interiorPoint,segmentContained,pathIssues};
})(typeof window==='undefined'?globalThis:window);
