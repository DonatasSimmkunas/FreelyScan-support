// The requested recording stays on YouTube. No media is copied or downloaded.
const VIDEO='WflAReA2cqs';
let open=false,manuallyStopped=false;
const dock=document.getElementById('musicDock');
const button=document.getElementById('musicToggle');
const label=document.getElementById('musicLabel');
const mobile=typeof matchMedia==='function'?matchMedia('(max-width: 650px)'):null;
function updateButton(){label.textContent=open?(mobile?.matches?'Rodyti grotuvą':'Uždaryti grotuvą'):'Paleisti dainą';}
function revealPlayer(){if(mobile?.matches)dock.scrollIntoView({block:'start',behavior:'instant'});}
mobile?.addEventListener('change',updateButton);
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
  dock.hidden=false;open=true;manuallyStopped=false;button.setAttribute('aria-expanded','true');updateButton();
}
function stop(){document.getElementById('playerMount').replaceChildren();dock.hidden=true;open=false;manuallyStopped=true;button.setAttribute('aria-expanded','false');updateButton();}
button.addEventListener('click',()=>{if(open&&mobile?.matches){revealPlayer();return;}if(open)stop();else{start();revealPlayer();}});
// A fresh iframe after an explicit click retries playback if entry autoplay was blocked.
document.getElementById('playFromLogin').addEventListener('click',()=>{start(true);revealPlayer();});
document.getElementById('closeMusic').addEventListener('click',stop);
export function startOnEntry(){if(!manuallyStopped)start();}
