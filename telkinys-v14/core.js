'use strict';
const App=(()=>{
 const API='https://telkinys.floot.app/_api/telkinys';
 const s={token:'',user:null,me:null,compare:new Set(),dirty:false};
 try{s.token=sessionStorage.getItem('telkinys.session')||'';}catch{}
 const pages={},categories={home:'Būstas',auto:'Auto',items:'Daiktai',services:'Paslaugos',jobs:'Darbai',prices:'Prekių pasiūlymai'};
 const statuses={draft:'Juodraštis',pending:'Laukia patvirtinimo',active:'Viešas',paused:'Sustabdytas',completed:'Užbaigtas',rejected:'Reikia pataisyti'};
 const units={total:'',hour:'/ val.',month:'/ mėn.',from:'nuo',negotiable:'sutartinė'};
 const $=sel=>document.querySelector(sel);
 function E(tag,props={},...children){
  const el=document.createElement(tag);
  for(const child of children.flat(Infinity)){if(child===null||child===undefined||child===false)continue;el.append(child instanceof Node?child:document.createTextNode(String(child)));}
  for(const [key,value] of Object.entries(props)){if(value===undefined||value===null||value===false)continue;
   if(key==='innerHTML'||key==='outerHTML')throw new Error('Unsafe rendering is prohibited');
   if(key.startsWith('on')&&typeof value==='function'){el.addEventListener(key.slice(2).toLowerCase(),value);continue;}
   if(key==='class'){el.className=value;continue;}
   if(key==='value'||key==='checked'||key==='disabled'||key==='hidden'){el[key]=value;continue;}
   el.setAttribute(key,value===true?'':String(value));
  }
  return el;
 }
 function href(values={}){const q=new URLSearchParams();for(const [k,v] of Object.entries(values)){if(v!==''&&v!==undefined&&v!==null)q.set(k,String(v));}return '/'+(q.size?'?'+q:'');}
 const link=(label,values={},cls='')=>E('a',{href:href(values),'data-nav':'',class:cls},label);
 function button(label,handler,cls='btn',props={}){return E('button',{type:'button',class:cls,...props,onClick:async function(e){if(this.disabled)return;this.disabled=true;try{await handler(e,this);}catch(err){toast(err.message,true);}finally{this.disabled=false;}}},label);}
 function field(name,label,type='text',value='',props={}){let control;if(type==='textarea')control=E('textarea',{name,value,...props});else if(Array.isArray(type))control=E('select',{name,value,...props},type.map(x=>E('option',{value:Array.isArray(x)?x[0]:x},Array.isArray(x)?x[1]:x)));else control=E('input',{name,type,value,...props});return E('label',{class:'field'},E('span',{},label),control);}
 function form(children,submit){const err=E('p',{class:'error-message',role:'alert',hidden:true});const f=E('form',{},children,err);f.addEventListener('submit',async e=>{e.preventDefault();if(f.dataset.busy)return;if(!f.reportValidity())return;f.dataset.busy='1';err.hidden=true;const buttons=[...f.querySelectorAll('button[type=submit]')];buttons.forEach(x=>x.disabled=true);f.setAttribute('aria-busy','true');try{await submit(new FormData(f),e.submitter?.value||'',f);}catch(error){err.textContent=error.message;err.hidden=false;err.scrollIntoView({block:'nearest'});}finally{delete f.dataset.busy;buttons.forEach(x=>x.disabled=false);f.removeAttribute('aria-busy');}});return f;}
 function submit(label,value='',primary=true){return E('button',{type:'submit',value,class:'btn '+(primary?'primary':'')},label);}
 const notice=(text,kind='')=>E('div',{class:'notice '+kind},text);
 const panel=(...children)=>E('section',{class:'panel'},children);
 const empty=(title,description,action=null)=>E('section',{class:'empty'},E('div',{class:'empty-icon','aria-hidden':'true'},'⌕'),E('h3',{},title),E('p',{},description),action);
 const heading=(title,description='')=>E('div',{class:'page-head'},link('← Grįžti į paiešką',{},'back'),E('h1',{},title),description?E('p',{class:'muted'},description):null);
 const badge=status=>E('span',{class:'badge '+status},statuses[status]||status);
 const money=(amount,unit='total')=>unit==='negotiable'?'Kaina sutartinė':(unit==='from'?'nuo ':'')+new Intl.NumberFormat('lt-LT',{style:'currency',currency:'EUR',maximumFractionDigits:Number.isInteger(Number(amount))?0:2}).format(Number(amount))+(units[unit]&&unit!=='from'?' '+units[unit]:'');
 const date=(v)=>{const d=new Date(v);return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('lt-LT',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Vilnius'}).format(d);};
 let toastTimer;
 function toast(message,bad=false){const t=$('#toast');t.textContent=String(message||'');t.classList.toggle('bad',bad);t.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.hidden=true,6500);}
 async function response(res){let data;try{data=JSON.parse(await res.text());}catch{throw new Error('Serveris laikinai nepasiekiamas. Pabandyk dar kartą.');}if(!res.ok){const error=new Error(data.error||'Nepavyko atlikti veiksmo.');error.code=data.code;error.status=res.status;if(res.status===401&&s.token&&data.code!=='INVALID_CREDENTIALS'){setToken('');s.user=null;s.me=null;updateHeader();}throw error;}return data;}
 async function request(url,init={}){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),45000);try{return await response(await fetch(url,{...init,signal:controller.signal,cache:'no-store'}));}catch(err){if(err.name==='AbortError')throw new Error('Serveris laiku neatsakė. Pabandyk dar kartą.');if(err instanceof TypeError)throw new Error('Nepavyko prisijungti prie serverio. Patikrink interneto ryšį.');throw err;}finally{clearTimeout(timer);}}
 function api(op,data={}){return request(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({op,...data,...(s.token?{token:s.token}:{})})});}
 function get(params={}){const q=new URLSearchParams();for(const [k,v] of Object.entries(params)){if(v!==undefined&&v!==null&&v!=='')q.set(k,String(v));}return request(API+'?'+q);}
 function setToken(token){s.token=token;try{if(token)sessionStorage.setItem('telkinys.session',token);else sessionStorage.removeItem('telkinys.session');}catch{}if(!token)stopLive();}
 async function refreshMe(){if(!s.token){s.user=null;s.me=null;return null;}const data=await api('me');s.user=data.user;s.me=data;updateHeader();return data;}
 function updateHeader(){const account=$('#accountLink');account.textContent=s.user?s.user.displayName.slice(0,18):'Prisijungti';account.title=s.user?.displayName||'Prisijungti';account.href=href(s.user?{view:'account'}:{view:'login'});$('#notificationsBtn').hidden=!s.user;const count=(s.me?.notifications||[]).filter(x=>!x.read_at).length;$('#notificationCount').textContent=count>9?'9+':String(count);$('#notificationCount').hidden=!count;}
 let generation=0;
 function current(){return Object.fromEntries(new URL(location.href).searchParams);}
 function go(params={},replace=false){if(s.dirty&&!confirm('Yra neišsaugotų pakeitimų. Išeiti jų neišsaugojus?'))return;s.dirty=false;history[replace?'replaceState':'pushState']({},'',href(params));render(true);}
 async function render(scroll=true){const turn=++generation;App.onLive=null;const p=current();const view=p.skelbimas?'detail':p.view||'home';document.title='Telkinys — '+({account:'Mano paskyra',edit:'Skelbimas',login:'Prisijungimas',privacy:'Privatumas',terms:'Naudojimo taisyklės',thread:'Pokalbis',about:'Kaip veikia',help:'Pagalba',compare:'Palyginimas'}[view]||'pasakyk, ko reikia');document.querySelector('link[rel=canonical]').href='https://telkinys.lt'+href(p.skelbimas?{skelbimas:p.skelbimas}:view==='home'?{}:{view});
  const root=$('#main');root.setAttribute('aria-busy','true');root.replaceChildren(E('div',{class:'loading',role:'status'},'Kraunama…'));
  try{const page=pages[view]||pages.notFound;const element=await page(p);if(turn!==generation)return;root.replaceChildren(element);if(scroll){window.scrollTo({top:0,behavior:'instant'});root.focus({preventScroll:true});}}
  catch(err){if(turn!==generation)return;root.replaceChildren(heading('Nepavyko atverti'),notice(err.message,'error'),button('Bandyti dar kartą',()=>render(false)),s.user?null:link('Prisijungti',{view:'login'},'btn'));}
  finally{if(turn===generation)root.removeAttribute('aria-busy');}
 }
 function requireUser(){if(s.user)return null;return E('div',{class:'auth panel'},E('h1',{},'Tavo Telkinys prasideda čia.'),E('p',{class:'muted'},'Prisijunk, kad įkeltum skelbimą, išsaugotum pasiūlymus ar susirašinėtum. Duomenys keliauja su paskyra.'),link('Prisijungti',{view:'login'},'btn primary wide'),notice('Beta registracijai reikia projekto savininko kvietimo.'));}
 function download(name,text,type='text/plain;charset=utf-8'){const url=URL.createObjectURL(new Blob([text],{type}));const a=E('a',{href:url,download:name});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 let returnFocus;
 function modal(title,...children){const d=$('#dialog');if(d.open)d.close();returnFocus=document.activeElement;$('#dialogContent').replaceChildren(E('div',{class:'dialog-head'},E('h2',{},title),button('×',()=>d.close(),'icon-button',{'aria-label':'Uždaryti'})),children);d.showModal();return d;}
 $('#dialog').addEventListener('close',()=>{if(returnFocus?.isConnected)returnFocus.focus();});
 $('#dialog').addEventListener('click',e=>{const r=e.currentTarget.getBoundingClientRect();if(e.target===e.currentTarget&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))e.currentTarget.close();});
 async function notifications(){await refreshMe();const list=E('div',{class:'stack'});for(const n of s.me.notifications){list.append(button('',()=>{const kind=n.kind;$('#dialog').close();if(['message','thread','appointment'].includes(kind))go({view:'thread',id:n.reference_id});else if(kind==='moderation')go({view:'edit',id:n.reference_id});else if(kind==='review')go({skelbimas:n.reference_id});else go({view:'account',tab:'support'});},'notification'));const el=list.lastElementChild;el.append(E('b',{},n.title),E('span',{},date(n.created_at)));}if(!list.children.length)list.append(E('p',{class:'muted'},'Naujų pranešimų nėra.'));modal('Pranešimai',list);await api('notify-read');await refreshMe();}
 $('#notificationsBtn').addEventListener('click',()=>notifications().catch(err=>toast(err.message,true)));
 let socket=null,reconnect=null,heartbeat=null,liveEpoch=0,delay=1000,eventTimer;
 function stopLive(){liveEpoch++;clearTimeout(reconnect);clearInterval(heartbeat);if(socket){socket.onclose=null;socket.close();socket=null;}$('#connectionStatus').textContent='Pranešimai atnaujinami atvėrus paskyrą.';}
 async function connectLive(){if(!s.user||!s.token||[WebSocket.OPEN,WebSocket.CONNECTING].includes(socket?.readyState))return;const epoch=++liveEpoch;clearTimeout(reconnect);try{const result=await api('realtime-token');if(epoch!==liveEpoch||!s.user)return;const url=new URL(result.wssEndpoint);if(url.protocol!=='wss:')throw new Error('Netinkamas tiesioginių pranešimų adresas.');url.searchParams.set('token',result.token);socket=new WebSocket(url);socket.onopen=()=>{if(epoch!==liveEpoch)return;delay=1000;socket.send(JSON.stringify({action:'subscribe',channel:'user:'+s.user.id}));$('#connectionStatus').textContent='Tiesioginiai paskyros pranešimai įjungti.';clearInterval(heartbeat);heartbeat=setInterval(()=>{if(socket?.readyState===WebSocket.OPEN)socket.send(JSON.stringify({action:'ping'}));},4*60000);};socket.onmessage=e=>{let event;try{event=JSON.parse(e.data);}catch{return;}if(event.channel!=='user:'+s.user?.id||!event.data)return;clearTimeout(eventTimer);eventTimer=setTimeout(async()=>{try{await refreshMe();if(App.onLive)await App.onLive();}catch{}},200);};socket.onclose=()=>{clearInterval(heartbeat);socket=null;if(epoch===liveEpoch&&s.token){$('#connectionStatus').textContent='Ryšys nutrūko. Jungiamasi iš naujo…';reconnect=setTimeout(connectLive,delay);delay=Math.min(30000,delay*2);}};socket.onerror=()=>socket?.close();}catch{$('#connectionStatus').textContent='Pranešimus gali atnaujinti paskyroje.';if(epoch===liveEpoch&&s.token){reconnect=setTimeout(connectLive,delay);delay=Math.min(30000,delay*2);}}}
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&s.token){connectLive();refreshMe().catch(()=>{});if(App.onLive)App.onLive().catch(()=>{});}});
 document.addEventListener('click',e=>{const a=e.target.closest('a[data-nav]');if(!a||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const url=new URL(a.href,location.href);if(url.origin!==location.origin)return;e.preventDefault();go(Object.fromEntries(url.searchParams));});
 window.addEventListener('popstate',()=>{s.dirty=false;render(true);});
 window.addEventListener('beforeunload',e=>{if(s.dirty){e.preventDefault();e.returnValue='';}});
 pages.notFound=async()=>empty('Puslapis nerastas','Grįžk į paiešką ir pasirink pasiūlymą.',link('Ieškoti',{},'btn primary'));
 return {API,s,pages,categories,statuses,units,$,E,href,link,button,field,form,submit,notice,panel,empty,heading,badge,money,date,toast,api,get,setToken,refreshMe,updateHeader,current,go,render,requireUser,download,modal,connectLive,stopLive,onLive:null};
})();
