import {api} from './app.js?v=6';

const appView=document.getElementById('appView');
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=new Intl.NumberFormat('lt-LT');
const moment=new Intl.DateTimeFormat('lt-LT',{dateStyle:'medium',timeStyle:'short'});
const day=new Intl.DateTimeFormat('lt-LT',{dateStyle:'medium'});
const count=value=>Number.isFinite(Number(value))&&value!==null&&value!==''?number.format(Number(value)):'—';
const date=(value,withTime=true)=>{if(!value)return'—';const d=new Date(value);return Number.isNaN(d.getTime())?'—':(withTime?moment:day).format(d);};
const webURL=value=>{try{const u=new URL(String(value||''));return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}};
const phoneURL=value=>{const s=String(value||'').replace(/[\s().-]/g,'');return /^\+?\d{5,20}$/.test(s)?'tel:'+s:null;};
const emailURL=value=>{const s=String(value||'').trim();return /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(s)?'mailto:'+encodeURIComponent(s):null;};
const values=value=>[...new Set(String(value??'').split(/[;\n]+/).map(s=>s.trim()).filter(Boolean))];
const authenticated=()=>appView&&!appView.hidden&&!document.body.classList.contains('login-mode');
let panel=null,state=null,epoch=0,pollTimer=null,searchTimer=null,statusController=null,searchController=null,runController=null,statusSerial=0,searchSerial=0;
const find=id=>panel?.querySelector('#'+id);
const current=version=>version===epoch&&panel&&authenticated();
const canPoll=()=>authenticated()&&panel?.open&&document.visibilityState==='visible';
function stopPoll(){clearTimeout(pollTimer);pollTimer=null;}
function nextPoll(){
  stopPoll();if(!canPoll())return;
  const cooldown=Date.parse(state?.status?.cooldownUntil||'')-Date.now();
  let delay=state?.runPending||state?.status?.running?15000:60000;
  if(cooldown>0)delay=Math.min(delay,cooldown+200);
  pollTimer=setTimeout(()=>refreshStatus(),delay);
}
function setMessage(id,message,tone='error'){
  const el=find(id);if(!el)return;el.textContent=message||'';el.hidden=!message;el.dataset.tone=tone;
}
function sourceLabel(status){
  return({ok:'Atnaujinta',success:'Atnaujinta',running:'Tikrinama',fetching:'Tikrinama',queued:'Laukia',error:'Nepavyko',blocked:'Prieiga blokuojama',failed:'Nepavyko',partial:'Iš dalies',stale:'Senesni duomenys',idle:'Dar netikrinta',pending:'Dar netikrinta',never:'Dar netikrinta'}[status]||'Būsena nurodyta šaltinyje');
}
function sourceWarnings(source){
  const list=Array.isArray(source.warnings)?source.warnings:source.warnings?[source.warnings]:[];
  return list.map(value=>typeof value==='object'&&value?value.message||value.code||'Šaltinio duomenys riboti.':String(value)).map(value=>({stale_source:'Šaltinio duomenys senesni. Vertinkite aukščiau nurodytą jų atnaujinimo datą.',partial_batch:'Surinkta dalis šaltinio įrašų. Rinkimas bus tęsiamas per kitas patikras.',no_active_jobs:'Šaltinyje nerasta šiuo metu galiojančių darbo skelbimų.'}[value]||value));
}
function renderStatus(){
  if(!state||!panel)return;
  const s=state.status,sources=Array.isArray(s?.sources)?s.sources:[],partial=sources.some(source=>['error','blocked','failed','partial','stale'].includes(source.status)||sourceWarnings(source).length);
  const badge=find('crawlerState');
  badge.textContent=state.runPending&&!s?.running?'Paleidžiama…':s?.running?'Tikrinama':s?partial?'Dalis šaltinių':s.lastRun?'Paruošta':'Laukia pirmos patikros':state.statusError?'Būsena nepasiekiama':'Kraunama…';
  badge.dataset.state=state.runPending||s?.running?'running':partial?'partial':s?'ready':'pending';
  find('crawlerSummary').textContent=s?`${count(s.totalCompanies)} įmonių · ${count(s.totalJobs)} skelbimų`:'';
  for(const [id,key] of [['crawlerCompanies','totalCompanies'],['crawlerHiring','hiringCompanies'],['crawlerJobs','totalJobs'],['crawlerNew','newLastRun']])find(id).textContent=s?count(s[key]):'—';
  find('crawlerLastRun').textContent=s?.lastRun?date(s.lastRun):s?'Dar nebuvo':'—';
  find('crawlerSchedule').textContent=s?.scheduleLabel||'Automatinis grafikas tikslinamas';
  find('crawlerNextRun').textContent=s?.nextRun?`Kita patikra: ${date(s.nextRun)}`:'';
  find('crawlerSources').innerHTML=sources.length?sources.map(source=>{
    const warnings=sourceWarnings(source);
    const hasProblem=['error','blocked','failed','partial','stale'].includes(source.status)||warnings.length>0;
    return `<li class="crawler-source"><div class="crawler-source-head"><strong>${esc(source.name||source.id||'Oficialus šaltinis')}</strong><span class="crawler-source-state" data-state="${hasProblem?'partial':source.status==='running'?'running':'ready'}">${esc(sourceLabel(source.status))}</span></div><div class="crawler-source-dates">${source.lastChecked?`<span>Tikrinta: ${esc(date(source.lastChecked))}</span>`:'<span>Dar netikrinta</span>'}${source.sourceUpdatedAt?`<span>Šaltinio duomenys: ${esc(date(source.sourceUpdatedAt,false))}</span>`:''}</div>${source.error?`<p class="crawler-source-warning">${esc(source.error)}</p>`:''}${warnings.map(warning=>`<p class="crawler-source-warning">${esc(warning)}</p>`).join('')}</li>`;
  }).join(''):'<li class="crawler-source-empty">Šaltinių būsena bus rodoma gavus atsakymą.</li>';
  find('crawlerPartial').hidden=!partial;
  const cooldown=Date.parse(s?.cooldownUntil||'')-Date.now(),button=find('crawlerRun');
  button.disabled=!s||state.runPending||Boolean(s.running)||cooldown>0;
  button.textContent=state.runPending?'Paleidžiama…':s?.running?'Patikra vykdoma':cooldown>0?'Patikra laikinai negalima':'Tikrinti dabar';
  find('crawlerCooldown').textContent=cooldown>0?`Vėl galima tikrinti: ${date(s.cooldownUntil)}`:'';
}
async function refreshStatus(){
  if(!authenticated()||!panel)return;
  const version=epoch,serial=++statusSerial;statusController?.abort();statusController=new AbortController();
  try{
    const result=await api('crawler/status',{signal:statusController.signal});
    if(!current(version)||serial!==statusSerial)return;
    const previous=state.status;state.status=result;state.statusError=false;setMessage('crawlerStatusError','');renderStatus();
    if(previous&&canPoll()&&state.hasSearched&&!state.searchBusy&&[ 'totalCompanies','totalJobs','hiringCompanies','lastRun'].some(key=>previous[key]!==result[key]))void searchRecords(state.page);
  }catch(error){
    if(error.name!=='AbortError'&&current(version)&&serial===statusSerial){state.statusError=true;setMessage('crawlerStatusError',error.message||'Nepavyko gauti rinkimo būsenos. Galite bandyti dar kartą.');renderStatus();}
  }finally{if(current(version)&&serial===statusSerial)nextPoll();}
}
function options(id,items,preserveSelection=true){
  const select=find(id),selected=select.value,first=select.options[0];select.replaceChildren(first);
  const unique=[...new Set((Array.isArray(items)?items:[]).map(v=>String(v??'').trim()).filter(Boolean))];
  if(preserveSelection&&selected&&!unique.includes(selected))unique.push(selected);
  for(const value of unique){const option=document.createElement('option');option.value=value;option.textContent=value;select.append(option);}select.value=selected;
}
function contactLinks(value,type){return values(value).map(item=>{const url=type==='phone'?phoneURL(item):emailURL(item);return url?`<a href="${esc(url)}">${esc(item)}</a>`:`<span>${esc(item)}</span>`;}).join('');}
function renderRecords(result){
  state.page=Number(result.page)||1;state.pages=Math.max(1,Number(result.pages)||1);state.hasSearched=true;
  options('crawlerCity',result.cities);options('crawlerLegalForm',result.legalForms);
  const records=Array.isArray(result.records)?result.records:[],total=Number(result.total)||0;
  find('crawlerResultCount').textContent=`${count(total)} ${find('crawlerKind').value==='hiring'?'darbuotojų ieškančių įmonių':'įmonių'}`;
  find('crawlerRecords').innerHTML=records.map(record=>{
    const jobs=Array.isArray(record.jobs)?record.jobs:[],source=webURL(record.source_url),profile=webURL(record.profile_url);
    return `<article class="crawler-card"><div class="crawler-card-top"><h3>${esc(record.provider||'Pavadinimas nepateiktas')}</h3>${jobs.length?`<span class="crawler-hiring-badge">Ieško darbuotojų · ${count(jobs.length)}</span>`:''}</div><p class="crawler-company-meta">${[record.company_code?`Kodas ${record.company_code}`:'',record.legal_form,record.city_area].filter(Boolean).map(esc).join(' · ')}</p>${record.address?`<p class="crawler-address">${esc(record.address)}</p>`:''}${record.registered_at?`<p class="crawler-registration">Registruota: ${esc(date(record.registered_at,false))}</p>`:''}${record.company_phone||record.company_email?`<div class="crawler-contacts">${contactLinks(record.company_phone,'phone')}${contactLinks(record.company_email,'email')}</div>`:''}<div class="crawler-card-links">${source?`<a href="${esc(source)}" target="_blank" rel="noopener noreferrer">Oficialus šaltinis ↗</a>`:''}${profile&&profile!==source?`<a href="${esc(profile)}" target="_blank" rel="noopener noreferrer">Įmonės svetainė ↗</a>`:''}</div>${jobs.length?`<details class="crawler-job-details"><summary>Darbo skelbimai <span>${count(jobs.length)}</span></summary><ul>${jobs.map(job=>{const url=webURL(job.url);return`<li><strong>${url?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(job.title||'Darbo skelbimas')} ↗</a>`:esc(job.title||'Darbo skelbimas')}</strong>${job.city_area?`<span>${esc(job.city_area)}</span>`:''}</li>`;}).join('')}</ul></details>`:''}</article>`;
  }).join('');
  const empty=find('crawlerEmpty');empty.hidden=total!==0;
  if(total===0){const firstCrawl=state.status&&Number(state.status.totalCompanies)===0&&!state.status.lastRun;find('crawlerEmptyTitle').textContent=firstCrawl?'Pradėkite pirmą duomenų patikrą':'Įmonių nerasta';find('crawlerEmptyText').textContent=firstCrawl?'Paspauskite „Tikrinti dabar“ arba palaukite automatinio rinkimo. Čia bus rodomi oficialiuose šaltiniuose aptikti įrašai.':'Pagal šiuos filtrus surinktų įrašų nėra. Pabandykite kitą vietovę, įmonės tipą ar trumpesnę užklausą.';}
  const pageSize=Number(result.pageSize)||25;
  find('crawlerPageInfo').textContent=total?`${(state.page-1)*pageSize+1}–${Math.min(state.page*pageSize,total)} iš ${count(total)}`:'0 įrašų';
  find('crawlerPrevious').disabled=state.page<=1;find('crawlerNext').disabled=state.page>=state.pages;
}
function searchInput(page){return{q:find('crawlerQ').value.trim(),kind:find('crawlerKind').value,legalForm:find('crawlerLegalForm').value,city:find('crawlerCity').value,page,pageSize:25,sort:find('crawlerSort').value};}
async function searchRecords(page=1,cityAdjusted=false){
  if(!authenticated()||!panel?.open)return;
  clearTimeout(searchTimer);const version=epoch,serial=++searchSerial;searchController?.abort();searchController=new AbortController();
  state.searchBusy=true;find('crawlerResults').setAttribute('aria-busy','true');find('crawlerSearchLoading').hidden=false;setMessage('crawlerSearchError','');
  try{
    const result=await api('crawler/search',{payload:searchInput(page),signal:searchController.signal});
    if(!current(version)||serial!==searchSerial)return;
    if(Array.isArray(result.cities)){
      const selectedCity=find('crawlerCity').value;options('crawlerCity',result.cities,false);
      if(selectedCity&&!result.cities.includes(selectedCity)&&!cityAdjusted)return await searchRecords(1,true);
    }
    renderRecords(result);
  }catch(error){if(error.name!=='AbortError'&&current(version)&&serial===searchSerial)setMessage('crawlerSearchError',error.message||'Paieška nepavyko. Pabandykite dar kartą.');}
  finally{if(current(version)&&serial===searchSerial){state.searchBusy=false;find('crawlerResults').setAttribute('aria-busy','false');find('crawlerSearchLoading').hidden=true;}}
}
function scheduleSearch(){
  clearTimeout(searchTimer);searchSerial++;searchController?.abort();if(!state)return;state.searchBusy=false;
  searchTimer=setTimeout(()=>searchRecords(1),350);
}
async function runNow(){
  if(!authenticated()||!panel||state.runPending||find('crawlerRun').disabled)return;
  const version=epoch;state.runPending=true;setMessage('crawlerRunMessage','');renderStatus();nextPoll();
  const controller=new AbortController();runController=controller;let timedOut=false;
  const timeout=setTimeout(()=>{timedOut=true;controller.abort();},98000);
  try{
    const result=await api('crawler/run',{payload:{},signal:controller.signal});
    if(!current(version))return;state.status=result;state.statusError=false;state.runPending=false;
    setMessage('crawlerRunMessage',result.running?'Patikra vykdoma. Būsena atnaujinama automatiškai.':'Patikra baigta. Toliau pateikta kiekvieno šaltinio būsena.','info');
    renderStatus();if(panel.open)await searchRecords(1);
  }catch(error){
    if(!current(version))return;
    if(error.name==='AbortError'&&!timedOut)return;
    const message=timedOut?'Atsakymo dar negavome. Patikra gali tebevykti; atnaujiname jos būseną.':error.status===409?'Kita patikra jau vyksta. Jos būseną atnaujinsime automatiškai.':error.status===429?'Neseniai jau tikrinta. Kita leidžiama patikra bus rodoma prie mygtuko.':error.message||'Nepavyko paleisti patikros. Pabandykite dar kartą.';
    setMessage('crawlerRunMessage',message,[409,429].includes(error.status)||timedOut?'info':'error');await refreshStatus();
  }finally{
    clearTimeout(timeout);if(runController===controller)runController=null;
    if(current(version)){state.runPending=false;renderStatus();nextPoll();}
  }
}
function mount(){
  if(panel||!authenticated())return;epoch++;
  state={status:null,statusError:false,runPending:false,searchBusy:false,hasSearched:false,page:1,pages:1};
  panel=document.createElement('details');panel.id='crawlerPanel';panel.className='crawler-panel';
  panel.innerHTML=`<summary class="crawler-summary"><span class="crawler-summary-title">Automatinis duomenų rinkimas</span><span id="crawlerState" class="crawler-state" data-state="pending">Kraunama…</span><span id="crawlerSummary" class="crawler-summary-counts"></span><span class="crawler-chevron" aria-hidden="true">⌄</span></summary><div class="crawler-body"><p class="crawler-intro">Registrų centro įmonės, Užimtumo tarnybos ir įmonių karjeros puslapių skelbimai. Rodoma surinkta šaltinių dalis, o ne visas Lietuvos įmonių sąrašas. Darbo pasiūlymai rodomi pagal šaltinio paskelbtą būseną; jų atvirumas papildomai netikrinamas.</p><div id="crawlerStatusError" class="crawler-message" role="status" hidden></div><div class="crawler-overview"><div><span>Surinktos įmonės</span><strong id="crawlerCompanies">—</strong></div><div><span>Ieško darbuotojų</span><strong id="crawlerHiring">—</strong></div><div><span>Darbo skelbimai</span><strong id="crawlerJobs">—</strong></div><div><span>Naujos per patikrą</span><strong id="crawlerNew">—</strong></div></div><div class="crawler-status-row"><div class="crawler-timing"><span>Paskutinė patikra: <strong id="crawlerLastRun">—</strong></span><span id="crawlerSchedule"></span><span id="crawlerNextRun"></span></div><div class="crawler-run-actions"><button id="crawlerRefresh" class="crawler-button crawler-button-subtle" type="button">Atnaujinti būseną</button><button id="crawlerRun" class="crawler-button crawler-button-primary" type="button" disabled>Tikrinti dabar</button><span id="crawlerCooldown" class="crawler-cooldown"></span></div></div><div id="crawlerRunMessage" class="crawler-message" role="status" hidden></div><ul id="crawlerSources" class="crawler-sources"></ul><p id="crawlerPartial" class="crawler-partial" hidden>Kai kurių šaltinių duomenys riboti arba senesni. Jų pastabos pateiktos aukščiau; kiti surinkti įrašai pasiekiami.</p><form id="crawlerSearchForm" class="crawler-search-form"><div class="crawler-query-row"><label class="sr-only" for="crawlerQ">Ieškoti surinktų įmonių</label><input id="crawlerQ" type="search" maxlength="300" placeholder="Įmonės pavadinimas, kodas, adresas…" autocomplete="off" enterkeyhint="search"><button class="crawler-button crawler-button-primary" type="submit">Ieškoti</button></div><div class="crawler-filters"><label for="crawlerKind">Įmonės<select id="crawlerKind"><option value="all">Visos surinktos</option><option value="hiring">Ieško darbuotojų</option></select></label><label for="crawlerLegalForm">Teisinė forma<select id="crawlerLegalForm"><option value="">Visos formos</option></select></label><label for="crawlerCity">Vietovė<select id="crawlerCity"><option value="">Visos vietovės</option></select></label><label for="crawlerSort">Rikiuoti<select id="crawlerSort"><option value="newest">Naujausios pirmiausia</option><option value="name">Pavadinimas: A–Ž</option></select></label></div></form><section id="crawlerResults" class="crawler-results" aria-label="Surinktos įmonės" aria-busy="false"><div class="crawler-results-heading"><strong id="crawlerResultCount">Surinktų įmonių paieška</strong><span id="crawlerSearchLoading" role="status" hidden>Ieškoma…</span></div><div id="crawlerSearchError" class="crawler-message" role="alert" hidden></div><div id="crawlerEmpty" class="crawler-empty" hidden><h3 id="crawlerEmptyTitle"></h3><p id="crawlerEmptyText"></p></div><div id="crawlerRecords" class="crawler-records"></div><div class="crawler-pagination"><span id="crawlerPageInfo"></span><div><button id="crawlerPrevious" class="crawler-button crawler-button-subtle" type="button" disabled>← Ankstesni</button><button id="crawlerNext" class="crawler-button crawler-button-subtle" type="button" disabled>Kiti →</button></div></div></section></div>`;
  const search=appView.querySelector('#searchForm');if(search)appView.insertBefore(panel,search);else appView.append(panel);
  panel.addEventListener('toggle',event=>{
    if(!panel||event.target!==panel)return;
    if(panel.open){void refreshStatus();if(!state.hasSearched)void searchRecords(1);else nextPoll();}
    else{stopPoll();clearTimeout(searchTimer);statusSerial++;statusController?.abort();searchSerial++;searchController?.abort();state.searchBusy=false;find('crawlerResults').setAttribute('aria-busy','false');find('crawlerSearchLoading').hidden=true;}
  });
  find('crawlerRefresh').addEventListener('click',()=>refreshStatus());find('crawlerRun').addEventListener('click',runNow);
  find('crawlerSearchForm').addEventListener('submit',event=>{event.preventDefault();void searchRecords(1);});
  find('crawlerQ').addEventListener('input',scheduleSearch);
  find('crawlerSearchForm').addEventListener('change',event=>{if(event.target.tagName==='SELECT')void searchRecords(1);});
  find('crawlerPrevious').addEventListener('click',()=>searchRecords(state.page-1));find('crawlerNext').addEventListener('click',()=>searchRecords(state.page+1));
  void refreshStatus();
}
function unmount(){
  if(!panel&&!state)return;epoch++;statusSerial++;searchSerial++;stopPoll();clearTimeout(searchTimer);
  statusController?.abort();searchController?.abort();runController?.abort();statusController=null;searchController=null;runController=null;
  panel?.replaceChildren();panel?.remove();panel=null;state=null;
}
function synchronize(){if(authenticated())mount();else unmount();}
if(appView){
  const observer=new MutationObserver(synchronize);observer.observe(appView,{attributes:true,attributeFilter:['hidden']});observer.observe(document.body,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&canPoll())void refreshStatus();else stopPoll();});
  window.addEventListener('pagehide',unmount);window.addEventListener('pageshow',synchronize);synchronize();
}
