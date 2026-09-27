// Decorative counters are labelled separately from the real, server-supplied totals.
const login=document.getElementById('loginView');
const format=new Intl.NumberFormat('lt-LT');
const metrics=[
  {output:document.getElementById('demoDatabaseCount'),real:document.getElementById('realDatabaseCount'),key:'total',speed:18,scale:800,last:null},
  {output:document.getElementById('demoContactCount'),real:document.getElementById('realContactCount'),key:'contacts',speed:14,scale:1100,last:null}
];
for(const metric of metrics)metric.base=Number(metric.real?.textContent.replace(/\D/g,''))||0;
let activeMilliseconds=0,lastTick=performance.now();
function render(){
  for(const metric of metrics){
    const value=metric.base+Math.floor(metric.speed*Math.log1p(activeMilliseconds/metric.scale));
    if(metric.output&&value!==metric.last){metric.output.textContent=format.format(value);metric.last=value;}
  }
}
render();
const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
let refreshing=false;
async function refreshTotals(){
  if(refreshing)return;refreshing=true;
  try{
    const response=await fetch((local?'':'https://auctioneer-vip.onrender.com')+'/vip/api/totals',{credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(45000)});
    const data=response.ok?await response.json():null;
    for(const metric of metrics){
      const value=data?.[metric.key];
      if(!Number.isSafeInteger(value)||value<0||value>10_000_000)continue;
      metric.base=value;if(metric.real)metric.real.textContent=format.format(value);
    }
    render();
  }catch{}finally{refreshing=false;}
}
void refreshTotals();
setInterval(()=>{if(!document.hidden&&!login?.hidden)void refreshTotals();},60000);
setInterval(()=>{
  const now=performance.now(),elapsed=Math.min(now-lastTick,400);lastTick=now;
  if(document.hidden||login?.hidden)return;
  activeMilliseconds+=Math.max(0,elapsed);
  // Visibly quicker: about +78 records and +56 contacts in the first minute.
  // Logarithmic growth stays close to the real baseline, without fabricated DB writes.
  render();
},200);
