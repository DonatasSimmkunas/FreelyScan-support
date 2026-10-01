(function(root){
 'use strict';
 const G=root.VentPlanGeometry;
 function simplify(poly,tolerance=2){
  const line=(points)=>{if(points.length<3)return points;let distance=0,index=0;const a=points[0],b=points.at(-1),dx=b.x-a.x,dy=b.y-a.y;for(let i=1;i<points.length-1;i++){const p=points[i],t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1))),d=Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);if(d>distance){distance=d;index=i}}return distance>tolerance?[...line(points.slice(0,index+1)).slice(0,-1),...line(points.slice(index))]:[a,b]};
  let opposite=1;for(let i=1;i<poly.length;i++)if(Math.hypot(poly[i].x-poly[0].x,poly[i].y-poly[0].y)>Math.hypot(poly[opposite].x-poly[0].x,poly[opposite].y-poly[0].y))opposite=i;
  return [...line(poly.slice(0,opposite+1)).slice(0,-1),...line([...poly.slice(opposite),poly[0]]).slice(0,-1)];
 }
 function closeAxis(mask,w,h,gap,vertical){const out=mask.slice();if(!gap)return out;for(let outer=0;outer<(vertical?w:h);outer++){let last=-1;for(let inner=0;inner<(vertical?h:w);inner++){const k=vertical?inner*w+outer:outer*w+inner;if(mask[k]){if(last>=0&&inner-last-1<=gap)for(let n=last+1;n<inner;n++)out[vertical?n*w+outer:outer*w+n]=1;last=inner}}}return out}
 function components(mask,w,h,value){const labels=new Int32Array(w*h).fill(-1),queue=new Int32Array(w*h),out=[];for(let k=0;k<mask.length;k++){if(mask[k]!==value||labels[k]>=0)continue;let head=0,tail=1,edge=false,minX=w,minY=h,maxX=0,maxY=0;queue[0]=k;labels[k]=out.length;while(head<tail){const p=queue[head++],x=p%w,y=Math.floor(p/w);minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);if(!x||!y||x===w-1||y===h-1)edge=true;for(const n of [x>0?p-1:-1,x<w-1?p+1:-1,y>0?p-w:-1,y<h-1?p+w:-1])if(n>=0&&mask[n]===value&&labels[n]<0){labels[n]=out.length;queue[tail++]=n}}out.push({id:out.length,count:tail,edge,minX,minY,maxX,maxY})}return {labels,regions:out}}
 function contour(labels,w,h,region,step){const edges=new Map();const add=(x,y,xx,yy)=>{const key=x+','+y,list=edges.get(key)||[];list.push([xx,yy]);edges.set(key,list)};for(let y=region.minY;y<=region.maxY;y++)for(let x=region.minX;x<=region.maxX;x++){if(labels[y*w+x]!==region.id)continue;if(y===0||labels[(y-1)*w+x]!==region.id)add(x,y,x+1,y);if(x===w-1||labels[y*w+x+1]!==region.id)add(x+1,y,x+1,y+1);if(y===h-1||labels[(y+1)*w+x]!==region.id)add(x+1,y+1,x,y+1);if(x===0||labels[y*w+x-1]!==region.id)add(x,y+1,x,y)}let best=[];while(edges.size){const first=edges.keys().next().value;let key=first,poly=[],guard=0;do{const [x,y]=key.split(',').map(Number),list=edges.get(key);if(!list?.length)break;poly.push({x:x*step,y:y*step});const next=list.pop();if(!list.length)edges.delete(key);key=next.join(',')}while(key!==first&&guard++<w*h*4);if(key===first&&poly.length>best.length)best=poly}return best}
 function detect(pixels,width,height,{gap=12,minimumArea=900,thinWalls=false,lineLength=16}={}){
  if(width!==1000||height!==700||pixels.length!==width*height*4)throw Error('raster_dimensions');
  const step=2,w=width/step,h=height/step,gray=new Uint8Array(w*h),hist=new Uint32Array(256);let sum=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=((y*step)*width+x*step)*4,a=pixels[k+3]/255,l=Math.round((.2126*pixels[k]+.7152*pixels[k+1]+.0722*pixels[k+2])*a+255*(1-a));gray[y*w+x]=l;hist[l]++;sum+=l}
  let sumBack=0,countBack=0,best=0,threshold=110;for(let t=0;t<255;t++){countBack+=hist[t];sumBack+=t*hist[t];if(!countBack||countBack===gray.length)continue;const countFore=gray.length-countBack,d=sumBack/countBack-(sum-sumBack)/countFore,v=countBack*countFore*d*d;if(v>best){best=v;threshold=t}}
  threshold=thinWalls?170:Math.max(65,Math.min(140,threshold));const base=Uint8Array.from(gray,g=>g<=threshold?1:0),dark=base.reduce((n,x)=>n+x,0)/base.length;
  if(dark<.002||dark>.4)return {rooms:[],reason:'raster_contrast',threshold,density:dark};
  // Discard tiny disconnected marks; long walls and attached labels remain evidence.
  // Main walls have stroke thickness; isolated text / furniture hairlines do not.
  if(thinWalls){
   const oriented=new Uint8Array(base.length),minimum=Math.max(4,Math.round(lineLength/step));
   for(let y=0;y<h;y++){let start=-1;for(let x=0;x<=w;x++){if(x<w&&base[y*w+x]){if(start<0)start=x}else if(start>=0){if(x-start>=minimum)for(let xx=start;xx<x;xx++)oriented[y*w+xx]=1;start=-1}}}
   for(let x=0;x<w;x++){let start=-1;for(let y=0;y<=h;y++){if(y<h&&base[y*w+x]){if(start<0)start=y}else if(start>=0){if(y-start>=minimum)for(let yy=start;yy<y;yy++)oriented[yy*w+x]=1;start=-1}}}
   const marks=components(oriented,w,h,1);for(let k=0;k<base.length;k++){const r=oriented[k]?marks.regions[marks.labels[k]]:null;base[k]=r&&Math.max(r.maxX-r.minX,r.maxY-r.minY)*step>=70?1:0}
  }else{
  const original=base.slice();for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const k=y*w+x;if(!original[k])continue;let neighbors=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)neighbors+=original[(y+dy)*w+x+dx];if(neighbors<8)base[k]=0}
  const cores=base.slice();for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const k=y*w+x;if(!original[k]||cores[k])continue;let nearby=false;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(cores[(y+dy)*w+x+dx])nearby=true;if(nearby)base[k]=1}
  const ink=components(base,w,h,1);for(let k=0;k<base.length;k++)if(base[k]&&ink.regions[ink.labels[k]].count<8)base[k]=0;
  }
  const radius=Math.max(0,Math.min(60,Math.round(gap/step))),mask=closeAxis(closeAxis(base,w,h,radius,false),w,h,radius,true),free=components(mask,w,h,0),rooms=[];
  for(const region of free.regions){if(region.edge||region.count*step*step<minimumArea||(region.maxX-region.minX)*step<25||(region.maxY-region.minY)*step<25)continue;const raw=contour(free.labels,w,h,region,step);if(raw.length<3)continue;let polygon=simplify(raw,2);if(polygon.length>40)polygon=simplify(raw,4);if(G.polygonIssues(polygon).length)continue;const actual=region.count*step*step,shape=G.area(polygon);if(Math.abs(shape-G.area(raw))/shape>.025||actual/shape<.65)continue;
   let supported=0,total=0;for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length],n=Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)/4);for(let j=0;j<=n;j++){const x=Math.round((a.x+(b.x-a.x)*j/n)/step),y=Math.round((a.y+(b.y-a.y)*j/n)/step);let hit=false;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(x+dx>=0&&y+dy>=0&&x+dx<w&&y+dy<h&&base[(y+dy)*w+x+dx])hit=true;total++;if(hit)supported++}}
   const wallSupport=supported/Math.max(1,total);if(wallSupport<(thinWalls?.45:.65))continue;const bounds=G.boundsOf(polygon);rooms.push({...bounds,polygon,name:'',type:'other',areaM2:null,wallSupport:Number(wallSupport.toFixed(3)),method:thinWalls?'orthogonal-walls':'local-walls',geometryReviewed:false,labelReviewed:false});
  }
  rooms.sort((a,b)=>a.y-b.y||a.x-b.x);return {rooms:rooms.slice(0,40),threshold,density:dark,gap,reason:rooms.length?'candidates':'raster_no_enclosures'};
 }
 function labelRoom(room,items){const labels=(items||[]).filter(x=>x&&typeof x.text==='string'&&G.inside(x,room.polygon));const text=labels.map(x=>x.text.trim()).filter(Boolean);const names=text.filter(x=>!/^[-+\d\s.,²m]+$/.test(x)&&x.length>1);const name=names.sort((a,b)=>b.length-a.length)[0]||'';const typeRules=[['livingKitchen',/((living|svetain|stue).*(kitchen|virtuv|kjøkken))|((kitchen|virtuv|kjøkken).*(living|svetain|stue))/i],['technical',/technical|teknisk|katilin|technin/i],['utility',/utility|laundry|skalbykl|vaskerom/i],['bathroom',/bath|von|bad\b|duš/i],['wc',/\bwc\b|toilet|tualet/i],['bedroom',/bedroom|mieg|soverom/i],['kitchen',/kitchen|virtuv|kjøkken/i],['living',/living|svetain|stue/i],['office',/office|kabinet|kontor/i],['hall',/hall|koridor|gang\b/i],['vestibule',/vestib|tambūr|entr/i]];const joined=text.join(' '),type=typeRules.find(x=>x[1].test(joined))?.[0]||'other';const values=text.flatMap(x=>{const m=x.match(/(\d{1,3}(?:[.,]\d{1,2})?)\s*m[²2]/i);return m?[Number(m[1].replace(',','.'))]:[]}).filter(x=>x>.5&&x<500);return {...room,name,type,areaM2:values.length===1?values[0]:null,labelEvidence:text.slice(0,8)};
 }
 root.VentPlanRaster={detect,labelRoom,simplify,components,contour,closeAxis};
})(typeof window==='undefined'?globalThis:window);
