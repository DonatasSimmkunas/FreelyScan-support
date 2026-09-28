// Decorative depth and an original, one-shot terminal chime. No external audio files.
const root=document.documentElement,body=document.body,app=document.getElementById('appView');
const motion=matchMedia('(prefers-reduced-motion: reduce)'),finePointer=matchMedia('(hover: hover) and (pointer: fine)');
const phonePerformance=matchMedia('(max-width: 900px) and (pointer: coarse), (max-height: 600px) and (pointer: coarse)');
function syncPhoneVisibility(){body.classList.toggle('phone-page-inactive',phonePerformance.matches&&document.hidden);}
document.addEventListener('visibilitychange',syncPhoneVisibility);phonePerformance.addEventListener('change',syncPhoneVisibility);syncPhoneVisibility();
const effects=()=>!motion.matches&&!body.classList.contains('effects-off');
const backdrop=document.getElementById('ambientBackground');
if(backdrop){const floor=document.createElement('i');floor.className='city-depth-floor';floor.setAttribute('aria-hidden','true');backdrop.append(floor);}
let frame=0,x=0,y=0;
function paintDepth(){frame=0;root.style.setProperty('--city-x',x.toFixed(3));root.style.setProperty('--city-y',y.toFixed(3));}
function resetDepth(){x=0;y=0;if(!frame)frame=requestAnimationFrame(paintDepth);}
document.addEventListener('pointermove',event=>{
  if(phonePerformance.matches||!effects()||!finePointer.matches||document.hidden||event.pointerType==='touch')return;
  x=Math.max(-1,Math.min(1,event.clientX/innerWidth*2-1));y=Math.max(-1,Math.min(1,event.clientY/innerHeight*2-1));
  if(!frame)frame=requestAnimationFrame(paintDepth);
},{passive:true});
document.documentElement.addEventListener('pointerleave',resetDepth);
finePointer.addEventListener('change',resetDepth);
document.addEventListener('visibilitychange',()=>{if(document.hidden)resetDepth();});

let soundEnabled=true,context=null,activeNodes=[],bootTimer=null,wasInside=Boolean(app&&!app.hidden);
try{soundEnabled=localStorage.getItem('vip.terminal-sound')!=='off';}catch{}
const soundButton=document.createElement('button');soundButton.type='button';soundButton.id='terminalSoundToggle';soundButton.className='subtle small terminal-sound-toggle';
soundButton.innerHTML='<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4zM17 8a6 6 0 0 1 0 8M19 5a10 10 0 0 1 0 14"/></svg><span>Garsai</span>';
document.getElementById('effectsToggle')?.after(soundButton);
function renderSound(){soundButton.setAttribute('aria-pressed',String(soundEnabled));soundButton.title=soundEnabled?'Išjungti terminalo atsidarymo garsą':'Įjungti terminalo atsidarymo garsą';}
function stopSound(){for(const oscillator of activeNodes)try{oscillator.stop();}catch{}activeNodes=[];}
function setSound(value){soundEnabled=value;try{localStorage.setItem('vip.terminal-sound',value?'on':'off');}catch{}if(!value)stopSound();renderSound();}
function unlockAudio(event){
  if(!soundEnabled||!event.isTrusted)return;
  if(event.type==='keydown'&&event.key!=='Enter')return;
  try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;context||=new Audio();if(context.state==='suspended')void context.resume().catch(()=>{});}catch{}
}
soundButton.addEventListener('click',event=>{setSound(!soundEnabled);if(soundEnabled)unlockAudio(event);});
for(const type of ['pointerdown','pointerup','keydown','submit'])document.getElementById('loginForm')?.addEventListener(type,unlockAudio,{capture:true,passive:true});
document.getElementById('closeMusic')?.addEventListener('click',()=>setSound(false));
document.getElementById('musicToggle')?.addEventListener('click',()=>{if(!matchMedia('(max-width: 650px)').matches&&document.getElementById('musicDock')?.hidden)setSound(false);});
function chime(){
  if(!soundEnabled||!context||context.state!=='running'||document.hidden)return;
  stopSound();const start=context.currentTime;
  for(const [offset,frequency,length]of [[0,220,.12],[.11,440,.13],[.23,660,.34]]){
    const oscillator=context.createOscillator(),gain=context.createGain();oscillator.type='sine';oscillator.frequency.setValueAtTime(frequency,start+offset);
    gain.gain.setValueAtTime(0,start+offset);gain.gain.linearRampToValueAtTime(.035,start+offset+.015);gain.gain.exponentialRampToValueAtTime(.0001,start+offset+length);
    oscillator.connect(gain);gain.connect(context.destination);oscillator.start(start+offset);oscillator.stop(start+offset+length+.02);activeNodes.push(oscillator);
    oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();activeNodes=activeNodes.filter(node=>node!==oscillator);};
  }
}
const boot=document.createElement('div');boot.id='terminalBoot';boot.className='terminal-boot';boot.hidden=true;
boot.innerHTML='<div class="terminal-boot-card"><span class="terminal-boot-kicker">AUCTIONEER / VIP</span><strong>PRIEIGA PATVIRTINTA<span aria-hidden="true">_</span></strong><div class="terminal-boot-lines" aria-hidden="true"><span>01 / Sesija patvirtinta <b>OK</b></span><span>02 / Duomenys įkelti <b>OK</b></span><span>03 / Terminalas paruoštas <b>OK</b></span></div><div class="terminal-boot-progress" aria-hidden="true"></div></div>';
boot.setAttribute('role','status');boot.setAttribute('aria-live','polite');document.body.append(boot);
function hideBoot(){clearTimeout(bootTimer);boot.hidden=true;}
function synchronize(){
  const inside=Boolean(app&&!app.hidden&&!body.classList.contains('login-mode'));
  if(inside&&!wasInside){
    chime();if(effects()){boot.hidden=false;clearTimeout(bootTimer);bootTimer=setTimeout(hideBoot,1150);}
  }
  if(!inside){hideBoot();stopSound();}
  if(!effects()){resetDepth();hideBoot();}
  wasInside=inside;
}
const observer=new MutationObserver(synchronize);
if(app)observer.observe(app,{attributes:true,attributeFilter:['hidden']});
observer.observe(body,{attributes:true,attributeFilter:['class']});motion.addEventListener('change',synchronize);
window.addEventListener('pagehide',()=>{hideBoot();stopSound();if(frame)cancelAnimationFrame(frame);frame=0;});
renderSound();synchronize();
