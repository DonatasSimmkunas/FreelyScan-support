import {startOnEntry} from './music.js?v=2';
const $=id=>document.getElementById(id);
const staticClient=!['localhost','127.0.0.1','[::1]'].includes(location.hostname);
const apiBase=staticClient?'https://auctioneer-vip.onrender.com/vip/api/':'/vip/api/';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=new Intl.NumberFormat('lt-LT',{maximumFractionDigits:4});
const isMissing=value=>value===null||value===undefined||value==='';
const unitLabel=u=>({'€/h':'€/val.','€/m2':'€/m²','€/m3':'€/m³','€':'€ · vienetas nenurodytas'}[u]||u||'Nenurodytas');
const priceSuffix=u=>({'€/h':'už valandą','€/m2':'už m²','€/m3':'už m³','€':'vienetas nenurodytas'}[u]||u||'');
const webURL=value=>{try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}};
const phoneURL=value=>{const s=String(value||'').replace(/[\s().-]/g,'');return /^\+?\d{5,20}$/.test(s)?'tel:'+s:null;};
const emailURL=value=>{const s=String(value||'').trim();return /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(s)?'mailto:'+encodeURIComponent(s):null;};
const splitValues=value=>[...new Set(String(value??'').split(/[;\n]+/).map(s=>s.trim()).filter(Boolean))];
const categoryText=value=>{const s=String(value??'').trim();return !s||/^(__missing__|(?:kategorija\s+)?nenurodyta)$/i.test(s)||/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}(?:[T\s].*)?$/.test(s)||/^\d{1,2}[-/.]\d{1,2}[-/.]\d{4}(?:\s.*)?$/.test(s)?'':s;};
const visibleField=f=>f.type!=='date'&&!/(?:date|timestamp|checked_at|updated_at|created_at|patikrinta|tikrinimo_data)/i.test(f.key)&&!/(?:tikrinimo|patikros|patikrinimo|atnaujinimo)\s+data/i.test(f.label||'');
const serviceSorts=[['price_asc','Kaina: nuo mažiausios'],['price_desc','Kaina: nuo didžiausios'],['name_asc','Pavadinimas: A–Ž'],['name_desc','Pavadinimas: Ž–A'],['rating_desc','Geriausias įvertinimas'],['reviews_desc','Daugiausia atsiliepimų'],['experience_desc','Didžiausia patirtis'],['city_asc','Teritorija: A–Ž']];
const employerSorts=[['jobs_desc','Skelbimų: nuo daugiausia'],['jobs_asc','Skelbimų: nuo mažiausia'],['name_asc','Pavadinimas: A–Ž'],['name_desc','Pavadinimas: Ž–A'],['city_asc','Teritorija: A–Ž']];
let accessToken='',csrf='',metadata=null,rows=[],page=1,pages=1,currentNiche='services',sessionVersion=0,nicheSerial=0,requestSerial=0,detailSerial=0,pendingMetadata=null,pendingRequest=null,pendingDetail=null,debounceId,toastTimer;
const operators=[['contains','Turi tekstą'],['not_contains','Neturi teksto'],['eq','Lygu'],['neq','Nelygu'],['gte','Ne mažiau nei'],['lte','Ne daugiau nei'],['missing','Trūksta reikšmės'],['present','Reikšmė nurodyta']];
const mobileLayout=matchMedia('(max-width: 650px)');
const employers=()=>currentNiche==='employers';
function syncFilterLayout(){$('filterPanel').open=!mobileLayout.matches;}
syncFilterLayout();mobileLayout.addEventListener('change',syncFilterLayout);
function activeFilters(){
  const values=employers()?['category','city','employerType','contactStatus','portal']:['category','city','coverage','unit','minPrice','maxPrice'];
  const checks=employers()?['withPhone','withEmail']:['includeNationwide','withPhone','withEmail','withPrice'];
  $('activeFilterCount').textContent=String(values.filter(id=>$(id).value!=='').length+checks.filter(id=>$(id).checked).length);
}
function revealResults(){if(!mobileLayout.matches)return;$('filterPanel').open=false;document.activeElement?.blur();$('resultsToolbar').scrollIntoView({block:'start',behavior:'instant'});$('resultsToolbar').focus({preventScroll:true});}
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,2800);}
function invalidateDetail(){detailSerial++;pendingDetail?.abort();pendingDetail=null;}
function clearSensitiveView(message=''){
  accessToken='';csrf='';sessionVersion++;rows=[];metadata=null;nicheSerial++;requestSerial++;pendingMetadata?.abort();pendingRequest?.abort();invalidateDetail();clearTimeout(debounceId);$('resultsBody').replaceChildren();$('detailContent').replaceChildren();
  if($('detailDialog').open)$('detailDialog').close();
  $('appView').hidden=true;$('loginView').hidden=false;$('logout').hidden=true;document.body.classList.add('login-mode');$('routeState').textContent='PRIEIGA';$('loginError').textContent=message;$('password').value='';
}
async function api(endpoint,options={}){
  const {payload,signal}=options,version=sessionVersion;
  const headers=payload===undefined?{}:{'Content-Type':'application/json','X-VIP-CSRF':csrf};
  if(staticClient)headers['X-VIP-Client']='static';
  if(staticClient&&accessToken)headers.Authorization='Bearer '+accessToken;
  const response=await fetch(apiBase+endpoint,{method:payload===undefined?'GET':'POST',credentials:staticClient?'omit':'same-origin',cache:'no-store',signal,headers,body:payload===undefined?undefined:JSON.stringify(payload)});
  const data=await response.json();
  if(!response.ok){if(response.status===401&&version===sessionVersion&&endpoint!=='login'&&endpoint!=='session')clearSensitiveView('Sesija baigėsi. Prisijunkite iš naujo.');const error=new Error(data.error||'Užklausa nepavyko.');error.status=response.status;throw error;}
  return data;
}
function addOptions(id,values=[],render=x=>x){const select=$(id);select.replaceChildren(select.options[0]);for(const value of values){if(isMissing(value))continue;const o=document.createElement('option');o.value=value;o.textContent=render(value);select.append(o);}}
function renderNiche(){
  const employer=employers();$('appView').dataset.niche=currentNiche;
  $('workspaceTitle').textContent=employer?'Įmonės ieško darbininkų':'Paslaugų paieška';
  $('sourceName').textContent=employer?'Darbdavių kontaktų bazė':'Paslaugų teikėjų bazė';
  $('statRecordsLabel').textContent=employer?'Įmonės':'Įrašai';$('statFourthLabel').textContent=employer?'Darbo skelbimai':'Su nurodyta kaina';
  $('cityLabel').textContent=employer?'Miestas, rajonas arba šalis':'Miestas arba rajonas';
  $('q').placeholder=employer?'Įmonė, pareigos, miestas, telefonas ar kita informacija…':'Vardas, įmonė, telefonas, paslauga arba kita informacija…';
  document.querySelectorAll('[data-services-only]').forEach(el=>el.hidden=employer);$('employerFilters').hidden=!employer;
  for(const button of document.querySelectorAll('[data-niche]')){if(button.tagName==='BUTTON')button.setAttribute('aria-pressed',String(button.dataset.niche===currentNiche));}
  $('sort').innerHTML=(employer?employerSorts:serviceSorts).map(([value,label])=>`<option value="${value}">${esc(label)}</option>`).join('');
  $('resultsHead').innerHTML=(employer?['Įmonė','Teritorija','Telefonas','Ieškomos pareigos','Skelbimai']:['Paslaugos teikėjas','Teritorija','Telefonas','Įkainis','Įvertinimas']).map((label,i)=>`<th${!employer&&i===3?' class="price-col"':''}>${label}</th>`).join('')+'<th><span class="sr-only">Veiksmai</span></th>';
}
async function switchNiche(next){
  if(!['services','employers'].includes(next))return;
  const serial=++nicheSerial;currentNiche=next;metadata=null;rows=[];requestSerial++;pendingRequest?.abort();pendingMetadata?.abort();invalidateDetail();clearTimeout(debounceId);
  if($('detailDialog').open)$('detailDialog').close();$('detailContent').replaceChildren();
  $('searchForm').reset();$('rules').replaceChildren();$('ruleCount').textContent='0';$('resultsBody').replaceChildren();$('resultCount').textContent='—';$('mobileResultCount').textContent='—';$('pageInfo').textContent='';$('previousPage').disabled=true;$('nextPage').disabled=true;
  $('emptyState').hidden=true;$('unitNotice').hidden=true;$('searchError').hidden=true;$('resultsTable').hidden=false;$('searchForm').inert=true;$('searchForm').setAttribute('aria-busy','true');$('loading').hidden=false;
  for(const id of ['statRecords','statCategories','statCities','statPriced','sourceCount'])$(id).textContent='—';
  renderNiche();syncFilterLayout();pendingMetadata=new AbortController();
  try{
    const data=await api('metadata?niche='+encodeURIComponent(next),{signal:pendingMetadata.signal});
    if(serial!==nicheSerial)return;
    metadata={...data,categories:[...new Set((data.categories||[]).map(categoryText).filter(Boolean))],fields:(data.fields||[]).filter(visibleField).map(f=>({...f,label:f.key==='category'?'Veiklos sritis':f.label}))};
    addOptions('category',metadata.categories);addOptions('city',metadata.cities);addOptions('unit',metadata.units||[],unitLabel);
    if(!employers()){const option=document.createElement('option');option.value='__missing__';option.textContent='Vienetas nenurodytas';$('unit').append(option);}
    addOptions('employerType',metadata.employerTypes||[]);addOptions('contactStatus',metadata.contactStatuses||[]);addOptions('portal',metadata.portals||[]);
    $('statRecords').textContent=fmt.format(metadata.total);$('statCategories').textContent=fmt.format(metadata.categories.length);$('statCities').textContent=fmt.format((metadata.cities||[]).length);$('statPriced').textContent=fmt.format(employers()?(metadata.jobsTotal||0):metadata.total-(metadata.missingPrice||0));
    $('sourceCount').textContent=`${fmt.format(metadata.total)} ${employers()?'įmonių':'įrašų'} · ${metadata.fields.length} laukų`;
    $('advancedLabel').textContent=`Visų ${metadata.fields.length} laukų filtrai`;
    $('advancedNote').textContent=employers()?'Filtruokite įmonių informaciją, veiklos sritis, ieškomas pareigas ir kontaktų būseną.':'Filtruokite visus pateiktus duomenų laukus. Įmonės žyma nepatvirtina teikėjo teisinės formos.';
    for(const niche of data.niches||[]){const count=$('nicheCount-'+niche.id);if(count)count.textContent=fmt.format(niche.total);}
    updateTerritory();activeFilters();await search(1);
  }catch(error){if(error.name!=='AbortError'&&serial===nicheSerial){$('searchError').textContent=error.message;$('searchError').hidden=false;throw error;}}
  finally{if(serial===nicheSerial){$('searchForm').inert=false;$('searchForm').setAttribute('aria-busy','false');$('loading').hidden=true;}}
}
async function enter(session){
  const version=++sessionVersion;if(staticClient&&session.accessToken)accessToken=session.accessToken;csrf=session.csrf;
  await switchNiche('services');if(!csrf||version!==sessionVersion)return;
  $('loginView').hidden=true;$('appView').hidden=false;$('logout').hidden=false;document.body.classList.remove('login-mode');$('routeState').textContent='PAIEŠKA';$('password').value='';
  if(mobileLayout.matches){document.activeElement?.blur();$('appView').scrollIntoView({block:'start',behavior:'instant'});}else $('q').focus({preventScroll:true});
}
$('nichePicker').addEventListener('click',event=>{const button=event.target.closest('button[data-niche]');if(button&&(button.dataset.niche!==currentNiche||!metadata))switchNiche(button.dataset.niche).catch(()=>{});});
$('loginForm').addEventListener('submit',async event=>{
  event.preventDefault();sessionVersion++;$('loginError').textContent='';$('loginButton').disabled=true;$('loginButton').firstElementChild.textContent='Tikrinama…';startOnEntry();
  try{const session=await api('login',{payload:{username:$('username').value.trim(),password:$('password').value}});await enter(session);}catch(error){clearSensitiveView(error.message);}
  finally{$('password').value='';$('loginButton').disabled=false;$('loginButton').firstElementChild.textContent='Prisijungti';}
});
$('showPassword').addEventListener('click',()=>{const show=$('password').type==='password';$('password').type=show?'text':'password';$('showPassword').textContent=show?'Slėpti':'Rodyti';$('showPassword').setAttribute('aria-pressed',String(show));});
$('logout').addEventListener('click',async()=>{try{await api('logout',{payload:{}});clearSensitiveView();$('username').focus();}catch(error){toast(error.message);}});
function rules(){return [...$('rules').children].map(row=>({field:row.querySelector('.rule-field').value,op:row.querySelector('.rule-op').value,value:row.querySelector('.rule-value').value.trim()})).filter(r=>['missing','present'].includes(r.op)||r.value!=='');}
function searchInput(targetPage=1){
  const input={niche:currentNiche,q:$('q').value,category:$('category').value,city:$('city').value,withPhone:$('withPhone').checked,withEmail:$('withEmail').checked,sort:$('sort').value,page:targetPage,pageSize:Number($('pageSize').value),rules:rules(),ruleMode:$('ruleMode').value};
  return employers()?{...input,employerType:$('employerType').value,contactStatus:$('contactStatus').value,portal:$('portal').value}:{...input,includeNationwide:$('includeNationwide').checked,coverage:$('coverage').value,unit:$('unit').value,minPrice:$('minPrice').value,maxPrice:$('maxPrice').value,withPrice:$('withPrice').checked};
}
async function search(targetPage=1,territoryAdjusted=false){
  if(!csrf||!metadata)return;activeFilters();clearTimeout(debounceId);const serial=++requestSerial,niche=currentNiche;pendingRequest?.abort();pendingRequest=new AbortController();
  $('loading').hidden=false;$('resultsBody').setAttribute('aria-busy','true');$('searchError').hidden=true;$('ruleCount').textContent=String(rules().length);
  try{
    const result=await api('search',{payload:searchInput(targetPage),signal:pendingRequest.signal});if(serial!==requestSerial||niche!==currentNiche)return;
    if(Array.isArray(result.availableCities)){
      const selectedCity=$('city').value;addOptions('city',result.availableCities);
      if(selectedCity&&result.availableCities.includes(selectedCity))$('city').value=selectedCity;
      else if(selectedCity){updateTerritory();activeFilters();if(!territoryAdjusted)return await search(1,true);}
    }
    rows=result.records;page=result.page;pages=result.pages;$('resultCount').textContent=fmt.format(result.total);$('mobileResultCount').textContent=fmt.format(result.total);$('unitNotice').hidden=employers()||!result.mixedUnits;
    $('emptyState').hidden=result.total!==0;$('resultsTable').hidden=result.total===0;$('pageInfo').textContent=result.total?`${(page-1)*result.pageSize+1}–${Math.min(page*result.pageSize,result.total)} iš ${fmt.format(result.total)}`:'0 įrašų';
    $('previousPage').disabled=page<=1;$('nextPage').disabled=page>=pages;renderRows();
  }catch(error){if(error.name!=='AbortError'&&serial===requestSerial){$('searchError').textContent=error.message;$('searchError').hidden=false;}}
  finally{if(serial===requestSerial){$('loading').hidden=true;$('resultsBody').setAttribute('aria-busy','false');}}
}
function phoneCell(record){
  const phones=splitValues(record.company_phone),first=phones[0],url=phoneURL(first);if(!first)return'<span class="no-value">Telefonas nenurodytas</span>';
  return `${url?`<a class="phone-link" href="${esc(url)}">${esc(first)}</a>`:`<span class="phone-link">${esc(first)}</span>`}${phones.length>1?`<button type="button" class="contact-more" data-record="${esc(record.id)}">+${phones.length-1} kiti numeriai</button>`:''}<button type="button" class="phone-copy" data-copy="${esc(record.id)}">Kopijuoti</button>`;
}
function renderRows(){
  $('resultsBody').innerHTML=rows.map(r=>{
    const [city,...rest]=String(r.city_area||'').split(','),category=categoryText(r.category);
    const company=`<td data-label="${employers()?'Įmonė':'Paslaugos teikėjas'}"><button type="button" class="provider-button provider-name" data-record="${esc(r.id)}">${esc(r.provider)}</button>${category?`<span class="category-text">${esc(category)}</span>`:''}${employers()&&r.employer_type?`<span class="employer-type">${esc(r.employer_type)}</span>`:''}<span class="record-id">ID ${esc(r.id)}</span></td>`;
    const territory=`<td data-label="Teritorija"><span class="area-main">${esc(city)||'Nenurodyta'}</span>${rest.length?`<span class="area-detail">${esc(rest.join(',').trim())}</span>`:''}</td>`;
    const specific=employers()?`<td data-label="Ieškomos pareigos"><span class="positions-text">${esc(r.positions)||'Pareigos nenurodytos'}</span></td><td data-label="Darbo skelbimai"><strong class="jobs-count">${fmt.format(Number(r.jobs_count)||0)}</strong><span class="jobs-caption">darbo skelbimų</span></td>`:`<td class="price-col" data-label="Įkainis">${typeof r.price_value==='number'?`<strong class="price-value">${fmt.format(r.price_value)} €</strong><span class="price-unit">${esc(priceSuffix(r.price_unit))}</span>`:'<span class="no-value">Kaina<br>nenurodyta</span>'}</td><td data-label="Įvertinimas">${isMissing(r.rating)?'<span class="no-value">Neįvertinta</span>':`<span class="rating-value"><span class="rating-star" aria-label="Įvertinimas">★</span>${fmt.format(r.rating)}</span><span class="reviews-count">${isMissing(r.reviews)?'Atsiliepimų nenurodyta':fmt.format(r.reviews)+' atsiliepimų'}</span>`}</td>`;
    return `<tr>${company}${territory}<td data-label="Telefonas">${phoneCell(r)}</td>${specific}<td><button class="subtle detail-button" type="button" data-record="${esc(r.id)}" aria-label="Visa informacija: ${esc(r.provider)}"><span class="detail-button-label">Info </span>↗</button></td></tr>`;
  }).join('');
}
function linkedValues(value,kind){return splitValues(value).map(item=>{const url=kind==='phone'?phoneURL(item):kind==='email'?emailURL(item):webURL(item);return url?`<a href="${esc(url)}"${kind==='web'?' target="_blank" rel="noopener noreferrer"':''}>${esc(item)}</a>`:esc(item);}).join('<br>');}
function pretty(field,value){
  if(isMissing(value))return'<span class="no-value">Nenurodyta</span>';
  if(field==='company_phone')return linkedValues(value,'phone');if(field==='company_email')return linkedValues(value,'email');if(field.endsWith('_url'))return linkedValues(value,'web');
  return esc(Array.isArray(value)?value.join('; '):value);
}
function renderDetail(record,employer,fields){
  const phone=phoneURL(splitValues(record.company_phone)[0]),email=emailURL(splitValues(record.company_email)[0]),profile=webURL(splitValues(record.profile_url)[0]),category=categoryText(record.category);
  const details=fields.filter(f=>f.key!=='category'||category).map(f=>`<dt>${esc(f.label)}</dt><dd>${pretty(f.key,record[f.key])}</dd>`).join('');
  const jobs=Array.isArray(record.jobs)?record.jobs:[],contacts=Array.isArray(record.contacts)?record.contacts:[];
  const jobSection=employer?`<details class="detail-section jobs-section"><summary>Darbo skelbimai <span class="badge">${fmt.format(jobs.length)}</span></summary>${jobs.length?`<ul class="job-list">${jobs.map(job=>{const url=webURL(job.url);return`<li><strong>${url?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(job.title||'Darbo skelbimas')} ↗</a>`:esc(job.title||'Darbo skelbimas')}</strong><span>${[job.city_area,job.portal].filter(Boolean).map(esc).join(' · ')}</span></li>`;}).join('')}</ul>`:'<p class="field-note">Darbo skelbimų nuorodų nepateikta.</p>'}</details>`:'';
  const contactSection=employer&&contacts.length?`<details class="detail-section"><summary>Kontaktų šaltiniai <span class="badge">${fmt.format(contacts.length)}</span></summary><ul class="contact-source-list">${contacts.map(contact=>{const kind=/mail|pašt/i.test(contact.type)?'email':/phone|tel/i.test(contact.type)?'phone':String(contact.value||'').includes('@')?'email':'phone',url=webURL(contact.url);return`<li><span class="contact-kind">${kind==='email'?'El. paštas':'Telefonas'}</span><div>${linkedValues(contact.value,kind)}</div>${url?`<a class="source-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Kontaktų šaltinis ↗</a>`:''}</li>`;}).join('')}</ul></details>`:'';
  $('detailContent').innerHTML=`<h2 id="detailTitle" class="detail-title">${esc(record.provider)}</h2>${category?`<p class="detail-category">${esc(category)}</p>`:''}${employer?`<p class="detail-job-total"><strong>${fmt.format(Number(record.jobs_count)||jobs.length)}</strong> darbo skelbimų</p>`:`<div class="detail-price">${typeof record.price_value==='number'?esc(record.price_raw):'Kaina nenurodyta'}</div>`}<div class="detail-actions">${phone?`<a class="primary" href="${esc(phone)}">Skambinti</a>`:''}${email?`<a class="subtle" href="${esc(email)}">Rašyti el. laišką</a>`:''}${profile?`<a class="subtle" href="${esc(profile)}" target="_blank" rel="noopener noreferrer">${employer?'Įmonės svetainė':'Atidaryti profilį'} ↗</a>`:''}</div><dl class="detail-fields">${details}</dl>${jobSection}${contactSection}`;
}
async function detail(id){
  const record=rows.find(r=>String(r.id)===String(id));if(!record||!metadata)return;
  invalidateDetail();const serial=detailSerial,niche=currentNiche,fields=metadata.fields,employer=employers();
  $('detailContent').innerHTML=`<h2 id="detailTitle" class="detail-title">${esc(record.provider)}</h2><p class="field-note" role="status">Kraunama visa informacija…</p>`;
  if(!$('detailDialog').open)$('detailDialog').showModal();$('detailDialog').scrollTop=0;$('closeDetail').focus({preventScroll:true});
  if(!employer){renderDetail(record,false,fields);return;}
  pendingDetail=new AbortController();
  try{const full=await api('employers/'+encodeURIComponent(id),{signal:pendingDetail.signal});if(serial!==detailSerial||niche!==currentNiche||!$('detailDialog').open)return;renderDetail(full,true,fields);}
  catch(error){if(error.name!=='AbortError'&&serial===detailSerial&&$('detailDialog').open){$('detailContent').innerHTML=`<h2 id="detailTitle" class="detail-title">${esc(record.provider)}</h2><p class="error-banner" role="alert">${esc(error.message)}</p><button class="subtle" type="button" data-retry-detail="${esc(id)}">Bandyti dar kartą</button>`;}}
}
$('detailContent').addEventListener('click',event=>{const retry=event.target.closest('[data-retry-detail]');if(retry)detail(retry.dataset.retryDetail);});
$('resultsBody').addEventListener('click',async event=>{
  const info=event.target.closest('[data-record]');if(info){detail(info.dataset.record);return;}
  const copy=event.target.closest('[data-copy]');if(copy){const record=rows.find(r=>String(r.id)===String(copy.dataset.copy));if(!record)return;try{await navigator.clipboard.writeText(splitValues(record.company_phone)[0]||'');toast('Telefonas nukopijuotas.');}catch{toast('Kopijuoti nepavyko. Pažymėkite numerį rankiniu būdu.');}}
});
$('closeDetail').addEventListener('click',()=>$('detailDialog').close());$('detailDialog').addEventListener('close',invalidateDetail);
$('detailDialog').addEventListener('click',event=>{if(event.target===$('detailDialog')){const r=$('detailDialog').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)$('detailDialog').close();}});
function updateTerritory(){$('includeNationwide').disabled=employers()||!$('city').value;if(!$('city').value||employers())$('includeNationwide').checked=false;}
function scheduleSearch(){
  clearTimeout(debounceId);requestSerial++;pendingRequest?.abort();
  if(!csrf||!metadata)return;
  $('loading').hidden=false;$('resultsBody').setAttribute('aria-busy','true');
  debounceId=setTimeout(()=>search(1),300);
}
$('searchForm').addEventListener('submit',async event=>{event.preventDefault();await search(1);revealResults();});$('showResults').addEventListener('click',async()=>{await search(1);revealResults();});
$('searchForm').addEventListener('input',event=>{if(event.target.tagName==='INPUT')scheduleSearch();});
$('searchForm').addEventListener('change',event=>{if(event.target.id==='city')updateTerritory();if(event.target.matches('.rule-field,.rule-op'))configureRule(event.target.closest('.rule-row'),event.target.classList.contains('rule-field'));search(1);});
$('previousPage').addEventListener('click',async()=>{await search(page-1);revealResults();});$('nextPage').addEventListener('click',async()=>{await search(page+1);revealResults();});
function reset(){if(!metadata)return;$('searchForm').reset();$('rules').replaceChildren();$('ruleCount').textContent='0';updateTerritory();search(1);}
$('resetFilters').addEventListener('click',reset);$('emptyReset').addEventListener('click',reset);
function configureRule(row,fieldChanged=false){
  const field=row.querySelector('.rule-field').value,isNumber=metadata.fields.find(f=>f.key===field)?.type==='number',op=row.querySelector('.rule-op');
  for(const option of op.options)option.disabled=['gte','lte'].includes(option.value)&&!isNumber;
  if(op.selectedOptions[0]?.disabled)op.value='contains';
  const value=row.querySelector('.rule-value');value.disabled=['missing','present'].includes(op.value);value.type=['gte','lte'].includes(op.value)?'number':'text';value.step='any';value.inputMode=isNumber?'decimal':field==='company_phone'?'tel':field==='company_email'?'email':field.endsWith('_url')?'url':'text';value.enterKeyHint='search';value.autocapitalize='none';value.placeholder=value.disabled?'Reikšmės nereikia':isNumber?'Skaičius arba tekstas':'Įveskite reikšmę';if(fieldChanged)value.value='';
}
$('addRule').addEventListener('click',()=>{
  if(!metadata)return;if($('rules').children.length>=30){toast('Galima pridėti iki 30 filtrų.');return;}
  const row=document.createElement('div');row.className='rule-row';row.innerHTML=`<select class="rule-field" aria-label="Duomenų laukas">${metadata.fields.map(f=>`<option value="${esc(f.key)}"${f.key==='provider'?' selected':''}>${esc(f.label)}</option>`).join('')}</select><select class="rule-op" aria-label="Filtro sąlyga">${operators.map(([key,label])=>`<option value="${key}">${label}</option>`).join('')}</select><input class="rule-value" aria-label="Filtro reikšmė" placeholder="Įveskite reikšmę" maxlength="500"><button type="button" class="subtle remove-rule" aria-label="Pašalinti filtrą">✕</button>`;$('rules').append(row);configureRule(row);row.querySelector('.rule-value').focus();
});
$('rules').addEventListener('click',event=>{if(event.target.closest('.remove-rule')){event.target.closest('.rule-row').remove();search(1);$('addRule').focus();}});
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let effects=!reduced.matches;
try{if(localStorage.getItem('vip.effects')==='off')effects=false;}catch{}
function renderEffects(){document.body.classList.toggle('effects-off',!effects);$('effectsToggle').setAttribute('aria-pressed',String(effects));$('effectsToggle').title=effects?'Išjungti neoninius efektus':'Įjungti neoninius efektus';}
renderEffects();$('effectsToggle').addEventListener('click',()=>{effects=!effects;try{localStorage.setItem('vip.effects',effects?'on':'off');}catch{}renderEffects();});reduced.addEventListener('change',event=>{if(event.matches){effects=false;renderEffects();}});
// Only visual preferences are stored. Contacts, passwords and sessions never go to localStorage.
startOnEntry();
if(!staticClient){
  const bootstrapVersion=sessionVersion;
  try{
    const session=await api('session');
    if(bootstrapVersion===sessionVersion){
      try{await enter(session);}catch{if(sessionVersion===bootstrapVersion+1)clearSensitiveView('Nepavyko įkelti duomenų. Pabandykite prisijungti.');}
    }
  }catch(error){if(bootstrapVersion===sessionVersion&&error.status!==401)$('loginError').textContent='Nepavyko patikrinti sesijos. Pabandykite prisijungti.';}
}
// Static-site access tokens live only in memory. Refreshing the page requires sign-in.
window.addEventListener('pageshow',event=>{if(event.persisted)clearSensitiveView('Prisijunkite iš naujo.');});
