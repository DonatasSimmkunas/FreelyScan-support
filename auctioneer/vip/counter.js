// Decorative approximation, clearly labelled in the UI. No fabricated count is persisted.
const output=document.getElementById('demoDatabaseCount');
const login=document.getElementById('loginView');
const BASE_TOTAL=6004; // 4,500 providers + 1,504 employers in the current import.
const format=new Intl.NumberFormat('lt-LT');
let activeMilliseconds=0,lastTick=performance.now(),lastValue=BASE_TOTAL;
if(output){
  output.textContent=format.format(BASE_TOTAL);
  setInterval(()=>{
    const now=performance.now(),elapsed=Math.min(now-lastTick,1000);lastTick=now;
    if(document.hidden||login?.hidden)return;
    activeMilliseconds+=Math.max(0,elapsed);
    // Growth slows naturally: about +14 after one minute, +38 after one hour.
    const value=BASE_TOTAL+Math.floor(6*Math.log1p(activeMilliseconds/6000));
    if(value===lastValue)return;
    lastValue=value;output.textContent=format.format(value);
  },500);
}
