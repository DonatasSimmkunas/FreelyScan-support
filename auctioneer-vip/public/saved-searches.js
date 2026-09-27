// Only explicit search filters and user-provided titles are persisted, never API responses or sessions.
export const MAX_SAVED_SEARCHES=20;
const MAX_STORAGE_LENGTH=400000;
const commonFields=['id','provider','category','city_area','company_phone','company_email','profile_url'];
const ruleFields={
  services:new Set([...commonFields,'page','price_raw','price_value','price_unit','rating','reviews','experience_years','price_parse_status','crawler_status','detected_provider','is_business','contact_source_url','additional_source_url','data_basis','source_notes']),
  employers:new Set([...commonFields,'employer_type','positions','contact_status','jobs_count','portals','listing_url','phone_source_url','email_source_url','company_code','listing_status'])
};
const numericFields={services:new Set(['id','page','price_value','rating','reviews','experience_years','is_business']),employers:new Set(['jobs_count'])};
const sorts={services:['price_asc','price_desc','name_asc','name_desc','rating_desc','reviews_desc','experience_desc','city_asc'],employers:['jobs_desc','jobs_asc','name_asc','name_desc','city_asc']};
const operators=new Set(['contains','not_contains','eq','neq','gte','lte','missing','present']);
const text=(value,max=500)=>typeof value==='string'?value.slice(0,max):'';
const price=value=>{const valueText=typeof value==='number'?String(value):text(value,40);return valueText!==''&&Number.isFinite(Number(valueText))&&Number(valueText)>=0?valueText:'';};

export function sanitizeSearchSnapshot(value){
  if(!value||typeof value!=='object'||!Object.hasOwn(ruleFields,value.niche))return null;
  const niche=value.niche;
  const clean={niche,q:text(value.q,300),category:text(value.category),city:text(value.city),withPhone:value.withPhone===true,withEmail:value.withEmail===true,sort:sorts[niche].includes(value.sort)?value.sort:sorts[niche][0],page:1,pageSize:[25,50,100].includes(value.pageSize)?value.pageSize:25,rules:[],ruleMode:value.ruleMode==='any'?'any':'all'};
  for(const rule of Array.isArray(value.rules)?value.rules.slice(0,30):[]){
    if(!rule||!ruleFields[niche].has(rule.field)||!operators.has(rule.op))continue;
    const ruleValue=['missing','present'].includes(rule.op)?'':text(rule.value).trim();
    if(!['missing','present'].includes(rule.op)&&!ruleValue)continue;
    if(['gte','lte'].includes(rule.op)&&(!numericFields[niche].has(rule.field)||!Number.isFinite(Number(ruleValue))))continue;
    clean.rules.push({field:rule.field,op:rule.op,value:ruleValue});
  }
  if(niche==='employers')return {...clean,employerType:text(value.employerType),contactStatus:text(value.contactStatus),portal:text(value.portal)};
  return {...clean,includeNationwide:!!clean.city&&value.includeNationwide===true,coverage:['','nationwide','30','50','100','200'].includes(value.coverage)?value.coverage:'',unit:text(value.unit),minPrice:price(value.minPrice),maxPrice:price(value.maxPrice),withPrice:value.withPrice===true};
}

export function savedSearchStorageKey(username){
  const user=typeof username==='string'?username.trim():'';
  return user&&user.length<=100?'vip.saved-searches.v1:'+encodeURIComponent(user):null;
}

function cleanEntries(entries){
  const result=[],ids=new Set();
  for(const item of Array.isArray(entries)?entries.slice(0,MAX_SAVED_SEARCHES):[]){
    if(!item||typeof item.id!=='string'||!/^[-\w]{1,64}$/.test(item.id)||ids.has(item.id))continue;
    const title=text(item.title,80).trim(),filters=sanitizeSearchSnapshot(item.filters);
    if(!title||!filters)continue;
    ids.add(item.id);result.push({id:item.id,title,filters});
  }
  return result;
}

export function parseSavedSearches(raw){
  if(typeof raw!=='string'||raw.length>MAX_STORAGE_LENGTH)return [];
  try{const value=JSON.parse(raw);return value?.version===1?cleanEntries(value.searches):[];}catch{return [];}
}

export function serializeSavedSearches(entries){
  return JSON.stringify({version:1,searches:cleanEntries(entries)});
}

function searchSummary(filters){
  const pieces=[filters.niche==='employers'?'Darbdaviai':'Paslaugų teikėjai'];
  if(filters.q)pieces.push('„'+filters.q+'“');
  if(filters.category)pieces.push(filters.category);
  if(filters.city)pieces.push(filters.city);
  const extra=['coverage','unit','minPrice','maxPrice','employerType','contactStatus','portal'].filter(key=>filters[key]!==undefined&&filters[key]!=='').length+['includeNationwide','withPhone','withEmail','withPrice'].filter(key=>filters[key]).length+filters.rules.length;
  if(extra)pieces.push('Papildomi filtrai: '+extra);
  return pieces.join(' · ');
}

/** `apply` restores filters directly through app.js, preserving its session/request guards. */
export function createSavedSearches({before,capture,apply}){
  if(!before||typeof capture!=='function'||typeof apply!=='function')throw new TypeError('Saved searches require a host and search callbacks.');
  const doc=before.ownerDocument,view=doc.defaultView;
  let key=null,entries=[],generation=0,section=null,list=null,body=null,toggle=null,count=null,status=null,editor=null,input=null,saveButton=null,editorTitle=null,editorSubmit=null,editState=null,busy=false;
  const node=(tag,className,content)=>{const el=doc.createElement(tag);if(className)el.className=className;if(content!==undefined)el.textContent=content;return el;};
  const button=(label,className='subtle')=>{const el=node('button',className,label);el.type='button';return el;};
  const feedback=(message,error=false)=>{if(!status)return;status.textContent=message;status.classList.toggle('is-error',error);};
  const expand=()=>{body.hidden=false;toggle.setAttribute('aria-expanded','true');};
  const setBusy=value=>{busy=value;section?.setAttribute('aria-busy',String(value));section?.querySelectorAll('button,input').forEach(el=>el.disabled=value);if(saveButton)saveButton.disabled=value||entries.length>=MAX_SAVED_SEARCHES;};
  const persist=next=>{
    if(!key)return false;
    try{view.localStorage.setItem(key,serializeSavedSearches(next));entries=cleanEntries(next);return true;}
    catch{feedback('Naršyklė neleido išsaugoti pakeitimo. Patikrinkite jos saugyklos nustatymus.',true);return false;}
  };
  const closeEditor=()=>{editState=null;if(editor){editor.hidden=true;input.value='';input.setCustomValidity('');}};
  const focusAction=(id,action)=>{const row=[...list.children].find(item=>item.dataset.savedId===id);(row?.querySelector('[data-action="'+action+'"]')||toggle).focus({preventScroll:true});};
  const openEditor=(filters,item=null)=>{
    if(busy)return;expand();editState={filters,id:item?.id||null};
    editorTitle.textContent=item?'Keisti paieškos pavadinimą':'Išsaugoti dabartinę paiešką';
    editorSubmit.textContent=item?'Pervadinti':'Išsaugoti';
    input.value=item?.title||[filters.q,filters.category,filters.city].filter(Boolean).join(' · ').slice(0,80)||(filters.niche==='employers'?'Darbdavių paieška':'Paslaugų paieška');
    input.setCustomValidity('');editor.hidden=false;feedback('');input.focus();input.select();
  };
  function renderList(){
    if(!list)return;list.replaceChildren();count.textContent=String(entries.length);saveButton.disabled=busy||entries.length>=MAX_SAVED_SEARCHES;
    if(!entries.length){const empty=node('li','saved-searches-empty','Dažnai ieškote tų pačių kontaktų? Nustatykite filtrus ir išsaugokite paiešką.');list.append(empty);return;}
    for(const item of entries){
      const row=node('li','saved-search-row');row.dataset.savedId=item.id;
      const info=node('div','saved-search-info'),title=node('strong','saved-search-title',item.title),summary=node('span','saved-search-summary',searchSummary(item.filters));info.append(title,summary);
      const actions=node('div','saved-search-actions');
      const applyButton=button('Taikyti','subtle saved-search-apply');applyButton.dataset.action='apply';applyButton.setAttribute('aria-label','Taikyti paiešką: '+item.title);
      applyButton.addEventListener('click',async()=>{
        if(busy||!key)return;const version=generation;closeEditor();setBusy(true);feedback('Taikomi išsaugoti filtrai…');
        try{await apply(sanitizeSearchSnapshot(item.filters));if(version===generation&&key)feedback('Išsaugoti filtrai pritaikyti.');}
        catch(error){if(version===generation&&key)feedback(error?.message||'Nepavyko pritaikyti paieškos. Bandykite dar kartą.',true);}
        finally{if(version===generation&&key)setBusy(false);}
      });
      const rename=button('Pervadinti');rename.dataset.action='rename';rename.setAttribute('aria-label','Pervadinti paiešką: '+item.title);rename.addEventListener('click',()=>openEditor(item.filters,item));
      const remove=button('Ištrinti','subtle saved-search-delete');remove.setAttribute('aria-label','Ištrinti paiešką: '+item.title);remove.addEventListener('click',()=>{
        if(busy||!key)return;
        if(persist(entries.filter(entry=>entry.id!==item.id))){closeEditor();renderList();feedback('Išsaugota paieška ištrinta.');toggle.focus({preventScroll:true});}
      });
      actions.append(applyButton,rename,remove);row.append(info,actions);list.append(row);
    }
  }
  function render(){
    section=node('section','saved-searches');section.id='savedSearches';section.setAttribute('aria-label','Išsaugotos paieškos');
    const header=node('div','saved-searches-head');toggle=button('','saved-searches-toggle');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','savedSearchesBody');
    const heading=node('span','','Išsaugotos paieškos');count=node('span','badge','0');const chevron=node('span','saved-searches-chevron','⌄');chevron.setAttribute('aria-hidden','true');toggle.append(heading,count,chevron);
    toggle.addEventListener('click',()=>{body.hidden=!body.hidden;toggle.setAttribute('aria-expanded',String(!body.hidden));});
    saveButton=button('Išsaugoti dabartinę','subtle saved-searches-save');saveButton.addEventListener('click',()=>{
      if(busy||!key)return;expand();
      if(entries.length>=MAX_SAVED_SEARCHES){feedback('Galima turėti iki 20 paieškų. Ištrinkite nebereikalingą paiešką.',true);return;}
      try{
        const filters=sanitizeSearchSnapshot(capture());if(!filters)throw new Error('Palaukite, kol bus įkelti paieškos filtrai.');
        const duplicate=entries.find(entry=>JSON.stringify(entry.filters)===JSON.stringify(filters));
        if(duplicate){closeEditor();feedback('Tokie filtrai jau išsaugoti: '+duplicate.title);focusAction(duplicate.id,'apply');return;}
        openEditor(filters);
      }catch(error){feedback(error?.message||'Nepavyko nuskaityti filtrų.',true);}
    });header.append(toggle,saveButton);
    body=node('div','saved-searches-body');body.id='savedSearchesBody';body.hidden=true;
    const note=node('p','saved-searches-note','Tik šioje naršyklėje, šiam vartotojui. Saugomi pavadinimai ir filtrai; rezultatų kopijos nesaugomos. Iki 20 paieškų.');
    editor=node('form','saved-search-editor');editor.hidden=true;editorTitle=node('label','','Paieškos pavadinimas');editorTitle.htmlFor='savedSearchTitle';
    input=node('input');input.id='savedSearchTitle';input.name='savedSearchTitle';input.type='text';input.maxLength=80;input.required=true;input.autocomplete='off';input.enterKeyHint='done';
    const editorActions=node('div','saved-search-editor-actions');editorSubmit=button('Išsaugoti','primary');editorSubmit.type='submit';
    const cancel=button('Atšaukti');cancel.addEventListener('click',()=>{const id=editState?.id;closeEditor();if(id)focusAction(id,'rename');else saveButton.focus({preventScroll:true});});
    input.addEventListener('input',()=>input.setCustomValidity(''));
    editor.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();cancel.click();}});
    editor.addEventListener('submit',event=>{
      event.preventDefault();if(busy||!key||!editState)return;
      const title=input.value.trim();if(!title){input.setCustomValidity('Įveskite paieškos pavadinimą.');input.reportValidity();return;}
      const current=editState,entry={id:current.id||view.crypto.randomUUID(),title,filters:current.filters};
      if(!current.id&&entries.length>=MAX_SAVED_SEARCHES){feedback('Pasiektas 20 paieškų limitas. Ištrinkite nebereikalingą paiešką.',true);return;}
      const next=current.id?entries.map(item=>item.id===current.id?entry:item):[...entries,entry];
      if(persist(next)){closeEditor();renderList();feedback(current.id?'Paieška pervadinta.':'Paieška išsaugota šioje naršyklėje.');focusAction(entry.id,'apply');}
    });
    editorActions.append(editorSubmit,cancel);editor.append(editorTitle,input,editorActions);
    status=node('p','saved-searches-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.setAttribute('aria-atomic','true');
    list=node('ul','saved-searches-list');body.append(note,editor,status,list);section.append(header,body);before.before(section);renderList();
  }
  function storageChanged(event){
    if(!key||event.key!==key&&event.key!==null)return;
    closeEditor();entries=parseSavedSearches(event.key===null?null:event.newValue);renderList();setBusy(busy);feedback('Išsaugotos paieškos atnaujintos kitame skirtuke.');
  }
  function deactivate(){
    generation++;key=null;entries=[];busy=false;editState=null;view.removeEventListener('storage',storageChanged);section?.remove();
    section=list=body=toggle=count=status=editor=input=saveButton=editorTitle=editorSubmit=null;
  }
  function activate(username){
    deactivate();key=savedSearchStorageKey(username);if(!key)return;
    let storageError=false;try{entries=parseSavedSearches(view.localStorage.getItem(key));}catch{storageError=true;}
    render();view.addEventListener('storage',storageChanged);
    if(storageError){expand();feedback('Naršyklės saugykla nepasiekiama. Išsaugotos paieškos negali būti įkeltos.',true);}
  }
  return {activate,deactivate};
}
