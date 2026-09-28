// Decorative counters are labelled separately from the real, server-supplied totals.
const login=document.getElementById('loginView');
const format=new Intl.NumberFormat('lt-LT');
const metrics=[
  {output:document.getElementById('demoDatabaseCount'),real:document.getElementById('realDatabaseCount'),key:'total',speed:18,scale:800,last:null},
  {output:document.getElementById('demoContactCount'),real:document.getElementById('realContactCount'),key:'contacts',speed:14,scale:1100,last:null}
];
for(const metric of metrics)metric.base=Number(metric.real?.textContent.replace(/\D/g,''))||0;
let activeMilliseconds=0,lastTick=performance.now();
const onLogin=()=>Boolean(login&&!login.hidden);
function render(){
  for(const metric of metrics){
    const growth=onLogin()?Math.floor(metric.speed*Math.log1p(activeMilliseconds/metric.scale)):0;
    const value=metric.base+growth;
    if(metric.output&&value!==metric.last){metric.output.textContent=format.format(value);metric.last=value;}
  }
}
render();
const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
const minimumRefreshGap=30000;
let refreshing=false,refreshQueued=false,refreshTimer=null,lastRefreshAttempt=-Infinity,lastCrawlerRevision='';
function requestRefresh(){
  if(document.hidden)return;
  if(refreshing){refreshQueued=true;return;}
  const delay=minimumRefreshGap-(performance.now()-lastRefreshAttempt);
  if(delay>0){
    if(refreshTimer===null)refreshTimer=setTimeout(()=>{refreshTimer=null;requestRefresh();},delay);
    return;
  }
  if(refreshTimer!==null){clearTimeout(refreshTimer);refreshTimer=null;}
  refreshQueued=false;void refreshTotals();
}
async function refreshTotals(){
  if(refreshing)return;refreshing=true;lastRefreshAttempt=performance.now();
  try{
    const response=await fetch((local?'':'https://auctioneer-vip.onrender.com')+'/vip/api/totals',{credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(45000)});
    const data=response.ok?await response.json():null;
    for(const metric of metrics){
      const value=data?.[metric.key];
      if(!Number.isSafeInteger(value)||value<0||value>10_000_000)continue;
      metric.base=value;if(metric.real)metric.real.textContent=format.format(value);
    }
    render();
  }catch{}finally{
    refreshing=false;
    if(refreshQueued){refreshQueued=false;requestRefresh();}
  }
}
requestRefresh();
// The shared header remains current in both login and authenticated views.
setInterval(requestRefresh,60000);
document.addEventListener('visibilitychange',()=>{
  lastTick=performance.now();
  if(!document.hidden){render();requestRefresh();}
});
window.addEventListener('vip:crawler-status',event=>{
  const status=event.detail?.status;if(!status)return;
  const revision=JSON.stringify([status.lastRun,status.totalCompanies,status.totalJobs,status.contactCompanies]);
  if(revision===lastCrawlerRevision)return;
  lastCrawlerRevision=revision;requestRefresh();
});
// Switching views changes only presentation; it never creates another timer.
if(login)new MutationObserver(()=>{lastTick=performance.now();render();}).observe(login,{attributes:true,attributeFilter:['hidden']});
const phonePerformance=matchMedia('(max-width: 900px) and (pointer: coarse), (max-height: 600px) and (pointer: coarse)');
const counterTick=phonePerformance.matches?1000:200;
setInterval(()=>{
  const now=performance.now(),elapsed=Math.min(now-lastTick,counterTick*2);lastTick=now;
  if(document.hidden||!onLogin())return;
  activeMilliseconds+=Math.max(0,elapsed);
  // Visibly quicker: about +78 records and +56 contacts in the first minute.
  // Logarithmic growth stays close to the real baseline, without fabricated DB writes.
  render();
},counterTick);
