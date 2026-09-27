import {startOnEntry} from './music.js';
const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=new Intl.NumberFormat('lt-LT',{maximumFractionDigits:4});
const isMissing=value=>value===null||value===undefined||value==='';
const unitLabel=u=>({'€/h':'€/val.','€/m2':'€/m²','€/m3':'€/m³','€':'€ · vienetas nenurodytas'}[u]||u||'Nenurodytas');
const priceSuffix=u=>({'€/h':'už valandą','€/m2':'už m²','€/m3':'už m³','€':'vienetas nenurodytas'}[u]||u||'');
const webURL=value=>{try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}};
const phoneURL=value=>{const s=String(value||'').replace(/[\s()-]/g,'');return /^\+?\d{5,20}$/.test(s)?'tel:'+s:null;};
const emailURL=value=>{const s=String(value||'').trim();return /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(s)?'mailto:'+encodeURIComponent(s):null;};
let csrf='',metadata=null,rows=[],page=1,pages=1,requestSerial=0,pendingRequest=null,debounceId,toastTimer;
const operators=[['contains','Turi tekstą'],['not_contains','Neturi teksto'],['eq','Lygu'],['neq','Nelygu'],['gte','Ne mažiau nei'],['lte','Ne daugiau nei'],['missing','Trūksta reikšmės'],['present','Reikšmė nurodyta']];
const mobileLayout=matchMedia('(max-width: 650px)');
function syncFilterLayout(){$('filterPanel').open=!mobileLayout.matches;}
syncFilterLayout();mobileLayout.addEventListener('change',syncFilterLayout);
function activeFilters(){
  const count=['category','city','coverage','unit','minPrice','maxPrice'].filter(id=>$(id).value!=='').length
    +['includeNationwide','withPhone','withEmail','withPrice'].filter(id=>$(id).checked).length;
  $('activeFilterCount').textContent=String(count);
}
function revealResults(){
  if(!mobileLayout.matches)return;
  $('filterPanel').open=false;
  document.activeElement?.blur();
  $('resultsToolbar').scrollIntoView({block:'start',behavior:'instant'});
  $('resultsToolbar').focus({preventScroll:true});
}

function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,2800);}
function clearSensitiveView(message=''){
  csrf='';rows=[];metadata=null;pendingRequest?.abort();$('resultsBody').replaceChildren();$('detailContent').replaceChildren();
  if($('detailDialog').open)$('detailDialog').close();
  $('appView').hidden=true;$('loginView').hidden=false;$('logout').hidden=true;document.body.classList.add('login-mode');$('routeState').textContent='PRIEIGA';$('loginError').textContent=message;$('password').value='';
}
async function api(endpoint,options={}){
  const {payload,signal}=options;
  const response=await fetch('/vip/api/'+endpoint,{method:payload===undefined?'GET':'POST',credentials:'same-origin',cache:'no-store',signal,
    headers:payload===undefined?{}:{'Content-Type':'application/json','X-VIP-CSRF':csrf},body:payload===undefined?undefined:JSON.stringify(payload)});
  const data=await response.json();
  if(!response.ok){
    if(response.status===401&&endpoint!=='login'&&endpoint!=='session')clearSensitiveView('Sesija baigėsi. Prisijunkite iš naujo.');
    const error=new Error(data.error||'Užklausa nepavyko.');error.status=response.status;throw error;
  }
  return data;
}
function addOptions(id,values,render=x=>x){const select=$(id);select.replaceChildren(select.options[0]);for(const value of values){const o=document.createElement('option');o.value=value;o.textContent=render(value);select.append(o);}}
async function enter(session){
  csrf=session.csrf;
  metadata=await api('metadata');
  $('searchForm').reset();$('rules').replaceChildren();$('ruleCount').textContent='0';
  addOptions('category',metadata.categories);let opt=document.createElement('option');opt.value='__missing__';opt.textContent='Kategorija nenurodyta';$('category').append(opt);
  addOptions('city',metadata.cities);addOptions('unit',metadata.units,unitLabel);opt=document.createElement('option');opt.value='__missing__';opt.textContent='Vienetas nenurodytas (tuščia)';$('unit').append(opt);
  $('statRecords').textContent=fmt.format(metadata.total);$('statCategories').textContent=fmt.format(metadata.categories.length);$('statCities').textContent=fmt.format(metadata.cities.length);$('statPriced').textContent=fmt.format(metadata.total-metadata.missingPrice);
  $('sourceCount').textContent=`${fmt.format(metadata.total)} įrašų · ${metadata.fields.length} laukų`;
  $('loginView').hidden=true;$('appView').hidden=false;$('logout').hidden=false;document.body.classList.remove('login-mode');$('routeState').textContent='PAIEŠKA';$('password').value='';
  syncFilterLayout();updateTerritory();await search(1);
  if(mobileLayout.matches){document.activeElement?.blur();$('appView').scrollIntoView({block:'start',behavior:'instant'});}
  else $('q').focus({preventScroll:true});
}
$('loginForm').addEventListener('submit',async event=>{
  event.preventDefault();$('loginError').textContent='';$('loginButton').disabled=true;$('loginButton').firstElementChild.textContent='Tikrinama…';
  startOnEntry();
  try{const session=await api('login',{payload:{username:$('username').value.trim(),password:$('password').value}});await enter(session);}
  catch(error){$('loginError').textContent=error.message;}
  finally{$('loginButton').disabled=false;$('loginButton').firstElementChild.textContent='Prisijungti';}
});
$('showPassword').addEventListener('click',()=>{const show=$('password').type==='password';$('password').type=show?'text':'password';$('showPassword').textContent=show?'Slėpti':'Rodyti';$('showPassword').setAttribute('aria-pressed',String(show));});
$('logout').addEventListener('click',async()=>{try{await api('logout',{payload:{}});clearSensitiveView();$('username').focus();}catch(error){toast(error.message);}});

function rules(){return [...$('rules').children].map(row=>({field:row.querySelector('.rule-field').value,op:row.querySelector('.rule-op').value,value:row.querySelector('.rule-value').value.trim()})).filter(r=>['missing','present'].includes(r.op)||r.value!=='');}
function searchInput(targetPage=1){return{q:$('q').value,category:$('category').value,city:$('city').value,includeNationwide:$('includeNationwide').checked,coverage:$('coverage').value,
  unit:$('unit').value,minPrice:$('minPrice').value,maxPrice:$('maxPrice').value,withPhone:$('withPhone').checked,withEmail:$('withEmail').checked,withPrice:$('withPrice').checked,
  sort:$('sort').value,page:targetPage,pageSize:Number($('pageSize').value),rules:rules(),ruleMode:$('ruleMode').value};}
async function search(targetPage=1){
  if(!csrf)return;
  activeFilters();
  clearTimeout(debounceId);const serial=++requestSerial;pendingRequest?.abort();pendingRequest=new AbortController();
  $('loading').hidden=false;$('resultsBody').setAttribute('aria-busy','true');$('searchError').hidden=true;$('ruleCount').textContent=String(rules().length);
  try{
    const result=await api('search',{payload:searchInput(targetPage),signal:pendingRequest.signal});
    if(serial!==requestSerial)return;
    rows=result.records;page=result.page;pages=result.pages;
    $('resultCount').textContent=fmt.format(result.total);$('mobileResultCount').textContent=fmt.format(result.total);$('unitNotice').hidden=!result.mixedUnits;
    $('emptyState').hidden=result.total!==0;$('resultsTable').hidden=result.total===0;
    $('pageInfo').textContent=result.total?`${(page-1)*result.pageSize+1}–${Math.min(page*result.pageSize,result.total)} iš ${fmt.format(result.total)}`:'0 įrašų';
    $('previousPage').disabled=page<=1;$('nextPage').disabled=page>=pages;
    renderRows();
  }catch(error){if(error.name!=='AbortError'&&serial===requestSerial){$('searchError').textContent=error.message;$('searchError').hidden=false;}}
  finally{if(serial===requestSerial){$('loading').hidden=true;$('resultsBody').setAttribute('aria-busy','false');}}
}
function renderRows(){
  $('resultsBody').innerHTML=rows.map(r=>{
    const [city,...rest]=String(r.city_area||'').split(',');const phone=phoneURL(r.company_phone);
    return `<tr><td data-label="Paslaugos teikėjas"><button type="button" class="provider-button provider-name" data-record="${esc(r.id)}">${esc(r.provider)}</button><span class="category-text">${esc(r.category||'Kategorija nenurodyta')}</span><span class="record-id">ID ${esc(r.id)}</span></td>
      <td data-label="Teritorija"><span class="area-main">${esc(city)}</span><span class="area-detail">${esc(rest.join(',').trim())}</span></td>
      <td data-label="Telefonas">${r.company_phone?`${phone?`<a class="phone-link" href="${esc(phone)}">${esc(r.company_phone)}</a>`:`<span class="phone-link">${esc(r.company_phone)}</span>`}<button type="button" class="phone-copy" data-copy="${esc(r.id)}">Kopijuoti</button>`:'<span class="no-value">Telefonas<br>nenurodytas</span>'}</td>
      <td class="price-col" data-label="Įkainis">${typeof r.price_value==='number'?`<strong class="price-value">${fmt.format(r.price_value)} €</strong><span class="price-unit">${esc(priceSuffix(r.price_unit))}</span>`:'<span class="no-value">Kaina<br>nenurodyta</span>'}</td>
      <td data-label="Įvertinimas">${isMissing(r.rating)?'<span class="no-value">Neįvertinta</span>':`<span class="rating-value"><span class="rating-star" aria-label="Įvertinimas">★</span>${fmt.format(r.rating)}</span><span class="reviews-count">${isMissing(r.reviews)?'Atsiliepimų nenurodyta':fmt.format(r.reviews)+' atsiliepimų'}</span>`}</td>
      <td><button class="subtle detail-button" type="button" data-record="${esc(r.id)}" aria-label="Visa informacija: ${esc(r.provider)}"><span class="detail-button-label">Info </span>↗</button></td></tr>`;
  }).join('');
}
function detail(id){
  const record=rows.find(r=>r.id===Number(id));if(!record||!metadata)return;
  const phone=phoneURL(record.company_phone),email=emailURL(record.company_email),profile=webURL(record.profile_url);
  const pretty=(field,value)=>{
    if(isMissing(value))return'<span class="no-value">Nenurodyta</span>';
    if(field.endsWith('_url')){const url=webURL(value);return url?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(value)}</a>`:esc(value);}
    if(field==='company_phone'&&phone)return`<a href="${esc(phone)}">${esc(value)}</a>`;
    if(field==='company_email'&&email)return`<a href="${esc(email)}">${esc(value)}</a>`;
    return esc(value);
  };
  $('detailContent').innerHTML=`<h2 id="detailTitle" class="detail-title">${esc(record.provider)}</h2><p class="detail-category">${esc(record.category||'Kategorija nenurodyta')}</p><div class="detail-price">${typeof record.price_value==='number'?esc(record.price_raw):'Kaina nenurodyta'}</div><div class="detail-actions">${phone?`<a class="primary" href="${esc(phone)}">Skambinti</a>`:''}${email?`<a class="subtle" href="${esc(email)}">Rašyti el. laišką</a>`:''}${profile?`<a class="subtle" href="${esc(profile)}" target="_blank" rel="noopener noreferrer">Atidaryti profilį ↗</a>`:''}</div><dl class="detail-fields">${metadata.fields.map(f=>`<dt>${esc(f.label)}</dt><dd>${pretty(f.key,record[f.key])}</dd>`).join('')}</dl>`;
  $('detailDialog').showModal();$('detailDialog').scrollTop=0;$('closeDetail').focus({preventScroll:true});
}
$('resultsBody').addEventListener('click',async event=>{
  const info=event.target.closest('[data-record]');if(info){detail(info.dataset.record);return;}
  const copy=event.target.closest('[data-copy]');if(copy){const record=rows.find(r=>r.id===Number(copy.dataset.copy));try{await navigator.clipboard.writeText(record.company_phone);toast('Telefonas nukopijuotas.');}catch{toast('Kopijuoti nepavyko. Pažymėkite numerį rankiniu būdu.');}}
});
$('closeDetail').addEventListener('click',()=>$('detailDialog').close());
$('detailDialog').addEventListener('click',event=>{if(event.target===$('detailDialog')){const r=$('detailDialog').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)$('detailDialog').close();}});

function updateTerritory(){$('includeNationwide').disabled=!$('city').value;if(!$('city').value)$('includeNationwide').checked=false;}
function scheduleSearch(){clearTimeout(debounceId);debounceId=setTimeout(()=>search(1),300);}
$('searchForm').addEventListener('submit',async event=>{event.preventDefault();await search(1);revealResults();});
$('showResults').addEventListener('click',async()=>{await search(1);revealResults();});
$('searchForm').addEventListener('input',event=>{if(event.target.tagName==='INPUT')scheduleSearch();});
$('searchForm').addEventListener('change',event=>{
  if(event.target.id==='city')updateTerritory();
  if(event.target.matches('.rule-field,.rule-op'))configureRule(event.target.closest('.rule-row'),event.target.classList.contains('rule-field'));
  search(1);
});
$('previousPage').addEventListener('click',async()=>{await search(page-1);revealResults();});$('nextPage').addEventListener('click',async()=>{await search(page+1);revealResults();});
function reset(){if(!metadata)return;$('searchForm').reset();$('rules').replaceChildren();$('ruleCount').textContent='0';updateTerritory();search(1);}
$('resetFilters').addEventListener('click',reset);$('emptyReset').addEventListener('click',reset);
function configureRule(row,fieldChanged=false){
  const field=row.querySelector('.rule-field').value,isNumber=metadata.fields.find(f=>f.key===field).type==='number';
  const op=row.querySelector('.rule-op');
  for(const option of op.options){option.disabled=['gte','lte'].includes(option.value)&&!isNumber;}
  if(op.selectedOptions[0]?.disabled)op.value='contains';
  const value=row.querySelector('.rule-value');
  value.disabled=['missing','present'].includes(op.value);
  value.type=['gte','lte'].includes(op.value)?'number':'text';value.step='any';
  value.inputMode=isNumber?'decimal':field==='company_phone'?'tel':field==='company_email'?'email':field.endsWith('_url')?'url':'text';
  value.enterKeyHint='search';
  value.autocapitalize='none';
  value.placeholder=value.disabled?'Reikšmės nereikia':isNumber?'Skaičius arba tekstas':'Įveskite reikšmę';
  if(fieldChanged)value.value='';
}
$('addRule').addEventListener('click',()=>{
  if(!metadata)return;if($('rules').children.length>=30){toast('Galima pridėti iki 30 filtrų.');return;}
  const row=document.createElement('div');row.className='rule-row';
  row.innerHTML=`<select class="rule-field" aria-label="Duomenų laukas">${metadata.fields.map(f=>`<option value="${f.key}"${f.key==='provider'?' selected':''}>${esc(f.label)}</option>`).join('')}</select><select class="rule-op" aria-label="Filtro sąlyga">${operators.map(([key,label])=>`<option value="${key}">${label}</option>`).join('')}</select><input class="rule-value" aria-label="Filtro reikšmė" placeholder="Įveskite reikšmę" maxlength="500"><button type="button" class="subtle remove-rule" aria-label="Pašalinti filtrą">✕</button>`;
  $('rules').append(row);configureRule(row);row.querySelector('.rule-value').focus();
});
$('rules').addEventListener('click',event=>{if(event.target.closest('.remove-rule')){event.target.closest('.rule-row').remove();search(1);$('addRule').focus();}});

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let effects=!reduced.matches;
try{if(localStorage.getItem('vip.effects')==='off')effects=false;}catch{}
function renderEffects(){document.body.classList.toggle('effects-off',!effects);$('effectsToggle').setAttribute('aria-pressed',String(effects));$('effectsToggle').title=effects?'Išjungti neoninius efektus':'Įjungti neoninius efektus';}
renderEffects();$('effectsToggle').addEventListener('click',()=>{effects=!effects;try{localStorage.setItem('vip.effects',effects?'on':'off');}catch{}renderEffects();});
reduced.addEventListener('change',event=>{if(event.matches){effects=false;renderEffects();}});
// Only visual preferences are stored. Contacts, passwords and sessions never go to localStorage.
// Request playback on every entry. Browsers may still require pressing Play.
startOnEntry();
try{const session=await api('session');await enter(session);}catch(error){if(error.status!==401){$('loginError').textContent='Nepavyko patikrinti sesijos. Pabandykite prisijungti.';}}
