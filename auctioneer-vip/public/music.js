// The requested recording stays on YouTube. No media is copied or downloaded.
const VIDEO='WflAReA2cqs';
let open=false,manuallyStopped=false;
const dock=document.getElementById('musicDock');
const button=document.getElementById('musicToggle');
const label=document.getElementById('musicLabel');
function start(retry=false){
  if(open&&!retry)return;
  const frame=document.createElement('iframe');
  const params=new URLSearchParams({autoplay:'1',loop:'1',playlist:VIDEO,playsinline:'1',rel:'0',origin:location.origin});
  frame.src=`https://www.youtube-nocookie.com/embed/${VIDEO}?${params}`;
  frame.title='Under Your Spell — Desire (Drive)';frame.width='320';frame.height='200';
  frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;
  // YouTube requires a referring origin to identify embedded playback.
  frame.referrerPolicy='strict-origin-when-cross-origin';
  document.getElementById('playerMount').replaceChildren(frame);
  dock.hidden=false;open=true;manuallyStopped=false;button.setAttribute('aria-expanded','true');label.textContent='Uždaryti grotuvą';
}
function stop(){document.getElementById('playerMount').replaceChildren();dock.hidden=true;open=false;manuallyStopped=true;button.setAttribute('aria-expanded','false');label.textContent='Paleisti dainą';}
button.addEventListener('click',()=>open?stop():start());
// A fresh iframe after an explicit click retries playback if entry autoplay was blocked.
document.getElementById('playFromLogin').addEventListener('click',()=>start(true));
document.getElementById('closeMusic').addEventListener('click',stop);
export function startOnEntry(){if(!manuallyStopped)start();}
