(function(root){
 'use strict';const G=root.VentPlanGeometry;
 function route(start,end,{envelope=null,zones=[],rooms=[],step=20,clearance=6}={}){
  if(!Number.isFinite(clearance)||clearance<0||clearance>100)return null;
  if([start.x,start.y,end.x,end.y].some(x=>!Number.isFinite(x))||[start,end].some(p=>p.x<0||p.x>1000||p.y<0||p.y>700))return null;
  const xs=[...new Set([start.x,end.x,...Array.from({length:Math.floor(1000/step)+1},(_,i)=>i*step)])].sort((a,b)=>a-b),ys=[...new Set([start.y,end.y,...Array.from({length:Math.floor(700/step)+1},(_,i)=>i*step)])].sort((a,b)=>a-b),w=xs.length,h=ys.length;
  const blocked=new Map(),edges=new Map(),penalties=new Map();
  const point=(x,y)=>({x:xs[x],y:ys[y]});
  const safe=(x,y)=>{const k=y*w+x;if(blocked.has(k))return !blocked.get(k);const p=point(x,y),bad=envelope&&(!G.contains(p,envelope)||G.boundaryDistance(p,envelope)<clearance)||zones.some(z=>G.contains(p,G.outline({x:z.x-clearance,y:z.y-clearance,w:z.w+2*clearance,hpx:z.h+2*clearance})));blocked.set(k,bad);return !bad};
  const edgeSafe=(x,y,xx,yy)=>{const k=[y*w+x,yy*w+xx].sort((a,b)=>a-b).join(':');if(edges.has(k))return edges.get(k);const a=point(x,y),b=point(xx,yy);let value=!G.pathIssues([[a.x,a.y],[b.x,b.y]],envelope,zones,clearance).length;if(value&&envelope){const n=Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,clearance/2));for(let i=1;i<n;i++)if(G.boundaryDistance({x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n},envelope)<clearance){value=false;break}}edges.set(k,value);return value};
  const penalty=(x,y)=>{const k=y*w+x;if(penalties.has(k))return penalties.get(k);const p=point(x,y),room=rooms.find(r=>G.inside(p,G.outline(r))),v=room?Math.min(1.5,Math.max(0,G.boundaryDistance(p,G.outline(room))-20)/60):0;penalties.set(k,v);return v};
  const sx=xs.indexOf(start.x),sy=ys.indexOf(start.y),ex=xs.indexOf(end.x),ey=ys.indexOf(end.y);if(!safe(sx,sy)||!safe(ex,ey))return null;
  const key=(x,y,d)=>(y*w+x)*3+d;
  const heap=[];const push=node=>{heap.push(node);let i=heap.length-1;while(i){const p=(i-1)>>1;if(heap[p].f<=node.f)break;heap[i]=heap[p];i=p}heap[i]=node};const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){let i=0;heap[0]=last;while(i*2+1<heap.length){let j=i*2+1;if(j+1<heap.length&&heap[j+1].f<heap[j].f)j++;if(heap[j].f>=last.f)break;heap[i]=heap[j];i=j}heap[i]=last}return top};
  const best=new Map(),parent=new Map(),nodes=new Map(),initial={x:sx,y:sy,d:0,g:0,f:Math.abs(start.x-end.x)+Math.abs(start.y-end.y)};push(initial);best.set(key(sx,sy,0),0);let iterations=0;
  while(heap.length&&iterations++<25000){const cur=pop(),ck=key(cur.x,cur.y,cur.d);if(cur.g!==best.get(ck))continue;nodes.set(ck,cur);if(cur.x===ex&&cur.y===ey){const pts=[];let k=ck;while(k!==undefined){const n=nodes.get(k);if(!n)return null;pts.push([xs[n.x],ys[n.y]]);k=parent.get(k)}pts.reverse();const out=pts.filter((p,i)=>!i||i===pts.length-1||!((pts[i-1][0]===p[0]&&p[0]===pts[i+1][0])||(pts[i-1][1]===p[1]&&p[1]===pts[i+1][1])));if(out.length===1)out.push(out[0].slice());return G.pathIssues(out,envelope,zones).length?null:out}
   for(const [dx,dy,d] of [[1,0,1],[-1,0,1],[0,1,2],[0,-1,2]]){const x=cur.x+dx,y=cur.y+dy;if(x<0||y<0||x>=w||y>=h||!safe(x,y)||!edgeSafe(cur.x,cur.y,x,y))continue;const length=Math.abs(xs[x]-xs[cur.x])+Math.abs(ys[y]-ys[cur.y]),g=cur.g+length*(1+penalty(x,y))+(cur.d&&cur.d!==d?7:0),k=key(x,y,d);if(g>=(best.get(k)??Infinity))continue;best.set(k,g);parent.set(k,ck);push({x,y,d,g,f:g+Math.abs(xs[x]-end.x)+Math.abs(ys[y]-end.y)})}
  }return null;
 }
 root.VentPlanRouting={route};
})(typeof window==='undefined'?globalThis:window);
