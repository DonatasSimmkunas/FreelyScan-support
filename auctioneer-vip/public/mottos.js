// Familiar and newly composed Latin mottoes, presented without historical attribution.
const mottos=[
  ['Per labia mea veritas loquitur.','Mano lūpomis kalba tiesa.'],
  ['Per aspera ad astra.','Per sunkumus – į žvaigždes.'],
  ['Audentes fortuna iuvat.','Sėkmė palanki drąsiesiems.'],
  ['Veritas numquam perit.','Tiesa niekada nežūsta.'],
  ['Fortis animus timorem vincit.','Tvirta dvasia įveikia baimę.'],
  ['Lux in tenebris lucet.','Šviesa šviečia tamsoje.'],
  ['Vincit qui se vincit.','Laimi tas, kuris įveikia save.'],
  ['Dum spiro, spero.','Kol kvėpuoju, tol viliuosi.'],
  ['Mens libera fines ignorat.','Laisvas protas nepripažįsta ribų.'],
  ['In silentio vis crescit.','Tyloje auga jėga.'],
  ['Scientia viam aperit.','Žinojimas atveria kelią.'],
  ['Fides montes movet.','Tikėjimas išjudina kalnus.'],
  ['Ex nocte lux oritur.','Iš nakties kyla šviesa.'],
  ['Amor veritatis nos ducit.','Tiesos meilė mus veda.'],
  ['Animus invictus manet.','Dvasia lieka nenugalėta.'],
  ['Sapientia potentia vera est.','Išmintis yra tikroji galia.'],
  ['Non verbis, sed factis.','Ne žodžiais, o darbais.'],
  ['Tempus omnia revelat.','Laikas atskleidžia viską.'],
  ['Qui quaerit, invenit.','Kas ieško, tas randa.'],
  ['Nulla victoria sine animo.','Be ryžto nėra pergalės.'],
  ['Contra ventum altius volamus.','Prieš vėją skrendame aukščiau.'],
  ['Una voce, uno animo.','Vienu balsu, viena dvasia.'],
  ['Virtus in adversis probatur.','Drąsa išbandoma negandose.'],
  ['Semper ad maiora.','Visada link didesnių tikslų.']
];
const svg=path=>`<svg class="motto-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${path}</svg>`;
const icons={previous:svg('<path d="m14 6-6 6 6 6"/>'),next:svg('<path d="m10 6 6 6-6 6"/>'),pause:svg('<path d="M8 5v14M16 5v14"/>'),play:svg('<path d="m8 5 11 7-11 7Z"/>')};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const boxes=[],intersecting=new Set();
let index=0,userPaused=false,timer=null,fadeTimer=null;
const effectsBlocked=()=>reduced.matches||document.body.classList.contains('effects-off');
const visibleBox=box=>box.isConnected&&!box.closest('[hidden]')&&(!intersectionObserver||intersecting.has(box));
const mayRotate=()=>!userPaused&&!effectsBlocked()&&document.visibilityState==='visible'&&boxes.some(visibleBox);
function stopTimer(){clearTimeout(timer);timer=null;}
function schedule(){stopTimer();if(mayRotate())timer=setTimeout(()=>move(1),10000);}
function paint(){
  const [latin,translation]=mottos[index],blocked=effectsBlocked(),paused=userPaused||blocked;
  for(const box of boxes){
    box.querySelector('.motto-latin').textContent=latin;
    box.querySelector('.motto-translation').textContent=translation;
    box.querySelector('.motto-position').textContent=`Frazė ${String(index+1).padStart(2,'0')}/${mottos.length}`;
    box.classList.remove('motto-changing');
    const pause=box.querySelector('[data-motto-action="pause"]');
    pause.innerHTML=paused?icons.play:icons.pause;
    pause.disabled=blocked;
    pause.setAttribute('aria-pressed',String(paused));
    const label=blocked?'Automatinė kaita išjungta pagal judesio nustatymus':paused?'Tęsti automatinę frazių kaitą':'Pristabdyti automatinę frazių kaitą';
    pause.setAttribute('aria-label',label);pause.title=label;
    box.dataset.rotation=paused?'paused':'automatic';
  }
}
function move(direction){
  stopTimer();clearTimeout(fadeTimer);index=(index+direction+mottos.length)%mottos.length;
  if(!effectsBlocked()&&document.visibilityState==='visible'&&boxes.some(visibleBox)){
    for(const box of boxes)box.classList.add('motto-changing');
    fadeTimer=setTimeout(()=>{paint();schedule();},160);
  }else{paint();schedule();}
}
function synchronize(){
  stopTimer();clearTimeout(fadeTimer);paint();schedule();
}
function createBox(location){
  const box=document.createElement('section');box.className='vip-motto';box.dataset.mottoLocation=location;box.setAttribute('aria-label','Lotyniška mintis ir jos vertimas');box.setAttribute('aria-live','off');
  box.innerHTML=`<div class="motto-header"><div class="motto-heading"><span class="motto-kicker">Lotyniška mintis</span><span class="motto-position">Frazė 01/${mottos.length}</span></div><div class="motto-controls" role="group" aria-label="Frazių valdymas"><button type="button" class="motto-button" data-motto-action="previous" aria-label="Ankstesnė frazė" title="Ankstesnė frazė">${icons.previous}</button><button type="button" class="motto-button motto-pause" data-motto-action="pause" aria-label="Pristabdyti automatinę frazių kaitą" aria-pressed="false" title="Pristabdyti automatinę frazių kaitą">${icons.pause}</button><button type="button" class="motto-button" data-motto-action="next" aria-label="Kita frazė" title="Kita frazė">${icons.next}</button></div></div><div class="motto-copy"><p class="motto-latin" lang="la"></p><p class="motto-translation" lang="lt"></p></div>`;
  box.addEventListener('click',event=>{
    const button=event.target.closest('button[data-motto-action]');if(!button||button.disabled)return;
    if(button.dataset.mottoAction==='previous')move(-1);
    else if(button.dataset.mottoAction==='next')move(1);
    else{userPaused=!userPaused;synchronize();}
  });
  boxes.push(box);return box;
}
const loginIntro=document.querySelector('#loginView .login-intro');
if(loginIntro)loginIntro.insertAdjacentElement('afterend',createBox('login'));
const workspaceHead=document.querySelector('#appView .workspace-head');
if(workspaceHead)workspaceHead.insertAdjacentElement('afterend',createBox('workspace'));
const intersectionObserver='IntersectionObserver' in window?new IntersectionObserver(entries=>{
  for(const entry of entries){if(entry.isIntersecting)intersecting.add(entry.target);else intersecting.delete(entry.target);}
  schedule();
},{threshold:0.05}):null;
for(const box of boxes)intersectionObserver?.observe(box);
const observer=new MutationObserver(synchronize);
observer.observe(document.body,{attributes:true,attributeFilter:['class']});
for(const id of ['loginView','appView']){const view=document.getElementById(id);if(view)observer.observe(view,{attributes:true,attributeFilter:['hidden']});}
reduced.addEventListener('change',synchronize);
document.addEventListener('visibilitychange',synchronize);
window.addEventListener('pagehide',()=>{stopTimer();clearTimeout(fadeTimer);});
window.addEventListener('pageshow',synchronize);
paint();schedule();
