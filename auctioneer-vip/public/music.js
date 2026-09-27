// The recording remains on YouTube. Playback uses its documented IFrame Player API.
const VIDEO='WflAReA2cqs';
const EMBED_ORIGIN='https://www.youtube-nocookie.com';
const API_SCRIPT='https://www.youtube.com/iframe_api';
let open=false,manuallyStopped=false,frame=null,player=null,ready=false,hasPlayed=false,needsGesture=true,firstGesturePending=true,apiLoading=false;
const dock=document.getElementById('musicDock');
const button=document.getElementById('musicToggle');
const label=document.getElementById('musicLabel');
const mount=document.getElementById('playerMount');
const mobile=typeof matchMedia==='function'?matchMedia('(max-width: 650px)'):null;
function updateButton(){label.textContent=open?(mobile?.matches?'Rodyti grotuvą':'Uždaryti grotuvą'):'Paleisti dainą';}
function revealPlayer(){if(mobile?.matches)dock.scrollIntoView({block:'start',behavior:'instant'});}
mobile?.addEventListener('change',updateButton);
function expectedFrame(){
  if(!frame||!mount.contains(frame))return false;
  try{const src=new URL(frame.src);return src.origin===EMBED_ORIGIN&&src.pathname===`/embed/${VIDEO}`&&src.searchParams.get('origin')===location.origin;}
  catch{return false;}
}
function currentEvent(event){return open&&event.target===player&&expectedFrame()&&event.target.getIframe()===frame;}
function playAudibly(){
  if(!open||manuallyStopped||!ready||!player||!expectedFrame())return false;
  needsGesture=false;
  try{player.unMute();player.playVideo();return true;}
  catch{needsGesture=true;return false;}
}
function attachPlayer(){
  if(!open||player||!expectedFrame()||typeof globalThis.YT?.Player!=='function')return;
  player=new globalThis.YT.Player(frame,{events:{
    onReady(event){if(!currentEvent(event))return;ready=true;playAudibly();},
    onAutoplayBlocked(event){if(currentEvent(event)&&!manuallyStopped)needsGesture=true;},
    onStateChange(event){
      if(!currentEvent(event))return;
      if(event.data===1){hasPlayed=true;needsGesture=false;firstGesturePending=false;manuallyStopped=false;}
      // Respect a pause made using YouTube's own controls after playback started.
      else if(event.data===2&&hasPlayed){manuallyStopped=true;needsGesture=false;}
    }
  }});
}
function loadApi(){
  if(typeof globalThis.YT?.Player==='function'){attachPlayer();return;}
  if(apiLoading)return;
  apiLoading=true;
  const previous=globalThis.onYouTubeIframeAPIReady;
  globalThis.onYouTubeIframeAPIReady=()=>{
    apiLoading=false;
    if(typeof previous==='function')previous();
    attachPlayer();
  };
  const script=document.createElement('script');script.src=API_SCRIPT;script.async=true;
  script.addEventListener('error',()=>{apiLoading=false;});
  document.head.append(script);
}
function releasePlayer(){
  const old=player;player=null;ready=false;hasPlayed=false;firstGesturePending=true;frame=null;
  try{old?.destroy();}catch{}
  mount.replaceChildren();
}
function start(retry=false){
  if(open&&!retry)return;
  manuallyStopped=false;needsGesture=true;
  if(open&&ready&&playAudibly())return;
  releasePlayer();
  frame=document.createElement('iframe');
  const params=new URLSearchParams({autoplay:'1',enablejsapi:'1',loop:'1',playlist:VIDEO,playsinline:'1',rel:'0',origin:location.origin});
  frame.src=`${EMBED_ORIGIN}/embed/${VIDEO}?${params}`;
  frame.title='Under Your Spell — Desire (Drive)';frame.width='320';frame.height='200';
  frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;
  frame.referrerPolicy='strict-origin-when-cross-origin';
  mount.replaceChildren(frame);
  dock.hidden=false;open=true;button.setAttribute('aria-expanded','true');updateButton();loadApi();
}
function stop(){
  manuallyStopped=true;needsGesture=false;open=false;releasePlayer();
  dock.hidden=true;button.setAttribute('aria-expanded','false');updateButton();
}
function userGesture(event){
  if(!event.isTrusted||event.repeat||manuallyStopped||!open||(!needsGesture&&!firstGesturePending))return;
  // Closing the player must never trigger a brief attempt to restart its audio.
  if(event.target?.closest?.('#closeMusic')||(!mobile?.matches&&event.target?.closest?.('#musicToggle')))return;
  // Touch activation is established on release; click is retained for browsers with stricter activation rules.
  if(event.type==='pointerdown'&&event.pointerType!=='mouse')return;
  if(event.type==='keydown'&&['Shift','Control','Alt','Meta','Escape'].includes(event.key))return;
  if(playAudibly())firstGesturePending=false;
}
for(const event of ['pointerdown','pointerup','click','keydown'])document.addEventListener(event,userGesture,{capture:true,passive:true});
button.addEventListener('click',()=>{if(open&&mobile?.matches){revealPlayer();return;}if(open)stop();else{start();revealPlayer();}});
document.getElementById('playFromLogin').addEventListener('click',()=>{start(true);revealPlayer();});
document.getElementById('closeMusic').addEventListener('click',stop);
export function startOnEntry(){
  if(manuallyStopped)return;
  start();
  // The login submit is another eligible trusted interaction; keep the existing player and position.
  if((needsGesture||firstGesturePending)&&globalThis.navigator?.userActivation?.isActive&&playAudibly())firstGesturePending=false;
}
