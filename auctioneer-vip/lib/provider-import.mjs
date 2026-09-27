import {createHash} from 'node:crypto';
export const PROVIDER_FIELDS=['id','page','provider','category','price_raw','price_value','price_unit','city_area','rating','reviews','experience_years','profile_url','company_phone','company_email','price_parse_status','crawler_status','detected_provider','is_business','contact_source_url'];
const EXTRA_FIELDS=['additional_source_url','data_basis','source_notes'];
const NUMERIC=new Set(['page','price_value','rating','reviews','experience_years','is_business']);
const JOIN_FIELDS=new Set(['company_phone','company_email','contact_source_url',...EXTRA_FIELDS]);
const SHARED_DOMAINS=new Set(['paslaugos.lt','rekvizitai.vz.lt','imones.lt','facebook.com','m.facebook.com','instagram.com','linkedin.com','youtube.com','google.com','maps.google.com','gmail.com','yahoo.com','outlook.com','hotmail.com','mail.ru','inbox.lt','one.lt']);
const GENERIC_NAMES=new Set(['paslaugos','valymo paslaugos','valymas','elektrikas','elektrikai','santechnikas','santechnikai','meistras','meistrai','imone','kontaktai','statybos darbai','statybos','geodeziniai matavimai','nenurodyta']);
const empty=v=>v===null||v===undefined||(typeof v==='string'&&!v.trim());
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('lt').trim();
const nameKey=v=>norm(v).replace(/\b(?:uab|mb|ab|vi|vs i|vsi|ii|individuali imone|mazoji bendrija|uzdaroji akcine bendrove)\b/g,' ').replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim();
const legalForm=v=>norm(v).match(/\b(uab|mb|ab|vsi|vi|ii)\b/)?.[1]||'';
const tokens=v=>String(v??'').split(/[;\n]+/).map(s=>s.trim()).filter(Boolean);
export function canonicalProfileUrl(value){
  try{const u=new URL(String(value).trim());if(!['http:','https:'].includes(u.protocol))return null;u.hostname=u.hostname.toLowerCase().replace(/^www\./,'');u.hash='';
    for(const key of [...u.searchParams.keys()])if(/^utm_/i.test(key)||['fbclid','gclid','msclkid'].includes(key.toLowerCase()))u.searchParams.delete(key);
    u.searchParams.sort();const path=u.pathname.replace(/\/+$/,'')||'/';
    if(SHARED_DOMAINS.has(u.hostname)&&['/','/kontaktai','/contacts'].includes(path))return null;
    return u.hostname+(u.port?':'+u.port:'')+path+(u.searchParams.size?'?'+u.searchParams:'');
  }catch{return null;}
}
export function normalizedPhone(value){let d=String(value??'').replace(/\D/g,'');if(d.startsWith('00370'))d=d.slice(2);if(/^[08]\d{8}$/.test(d))d='370'+d.slice(1);return /^\d{7,15}$/.test(d)?d:null;}
export function normalizedEmail(value){const s=norm(value).replace(/^mailto:/,'');return /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(s)?s:null;}
const intersects=(a,b)=>[...a].some(v=>b.has(v));
function describe(record){
  const name=nameKey(record.provider),strongName=name.length>=3&&!GENERIC_NAMES.has(name),profiles=new Set(tokens(record.profile_url).map(canonicalProfileUrl).filter(Boolean));
  const phones=new Set(tokens(record.company_phone).map(normalizedPhone).filter(Boolean)),emails=new Set(tokens(record.company_email).map(normalizedEmail).filter(Boolean)),domains=new Set();
  for(const value of [...tokens(record.profile_url),...tokens(record.additional_source_url),...tokens(record.contact_source_url)]){try{const host=new URL(value).hostname.toLowerCase().replace(/^www\./,'');if(!SHARED_DOMAINS.has(host))domains.add(host);}catch{}}
  for(const email of emails){const host=email.split('@')[1];if(!SHARED_DOMAINS.has(host))domains.add(host);}
  return{name,strongName,legalForm:legalForm(record.provider),profiles,phones,emails,domains,category:norm(record.category)};
}
function match(left,right){
  if(left.category&&right.category&&left.category!==right.category)return null;
  if(left.legalForm&&right.legalForm&&left.legalForm!==right.legalForm)return null;
  // Shared company websites and switchboard numbers do not override distinct business names.
  if(left.strongName&&right.strongName&&left.name!==right.name)return null;
  const sameName=left.strongName&&right.strongName&&left.name===right.name;
  if(intersects(left.profiles,right.profiles))return{score:3,reason:'profile_and_compatible_identity'};
  const contact=intersects(left.phones,right.phones)||intersects(left.emails,right.emails);
  if(contact&&(sameName||intersects(left.domains,right.domains)))return{score:sameName?2:1,reason:sameName?'contact_and_name':'contact_and_owned_domain'};
  return null;
}
function unionValues(before,incoming,key){
  const normalize=key==='company_phone'?normalizedPhone:key==='company_email'?normalizedEmail:key.endsWith('_url')?canonicalProfileUrl:norm;
  const result=[],seen=new Set();for(const value of [...tokens(before),...tokens(incoming)]){const identity=normalize(value)||norm(value);if(!seen.has(identity)){seen.add(identity);result.push(value);}}
  return result.join('; ');
}
function sanitize(record){
  if(!record||typeof record!=='object'||Array.isArray(record)||empty(record.provider))throw new Error('Importo įrašui trūksta pavadinimo.');
  const clean={};for(const key of [...PROVIDER_FIELDS.filter(k=>k!=='id'),...EXTRA_FIELDS]){const value=record[key];
    if(NUMERIC.has(key)){if(!empty(value)&&(typeof value!=='number'||!Number.isFinite(value)))throw new Error('Importe yra netinkama skaitinė reikšmė.');clean[key]=empty(value)?null:value;}
    else{if(!empty(value)&&typeof value!=='string')throw new Error('Importe yra netinkama tekstinė reikšmė.');clean[key]=empty(value)?null:value.trim();}
  }return clean;
}
export function mergeProviders(existing,incoming,{sourceFile='',priorImportKeys={}}={}){
  if(!Array.isArray(existing)||!Array.isArray(incoming))throw new Error('Reikia esamų ir naujų įrašų sąrašų.');
  const providers=existing.map(record=>({...record})),idToIndex=new Map(),descriptions=[],indexes={profiles:new Map(),phones:new Map(),emails:new Map()};
  let nextId=0;const importKeys={...priorImportKeys},decisions=[];
  const indexRecord=index=>{const info=describe(providers[index]);descriptions[index]=info;for(const group of Object.keys(indexes))for(const value of info[group]){if(!indexes[group].has(value))indexes[group].set(value,new Set());indexes[group].get(value).add(index);}};
  providers.forEach((record,index)=>{if(!Number.isSafeInteger(record.id)||record.id<1||idToIndex.has(record.id))throw new Error('Esami įrašų ID turi būti unikalūs teigiami sveikieji skaičiai.');idToIndex.set(record.id,index);nextId=Math.max(nextId,record.id);indexRecord(index);});
  for(const [incomingIndex,raw]of incoming.entries()){
    const clean=sanitize(raw),sourceRow=Number.isSafeInteger(raw.source_row)?raw.source_row:null;
    const importKey=createHash('sha256').update(JSON.stringify({sourceFile,sourceRow,record:clean})).digest('hex');
    let index=idToIndex.get(importKeys[importKey]),reason='prior_import';
    if(index===undefined){
      const info=describe(clean),candidateIndexes=new Set();for(const group of Object.keys(indexes))for(const value of info[group])for(const i of indexes[group].get(value)||[])candidateIndexes.add(i);
      const matches=[...candidateIndexes].map(i=>({index:i,...match(descriptions[i],info)})).filter(m=>m.score).sort((a,b)=>b.score-a.score||providers[a.index].id-providers[b.index].id);
      if(matches.length){index=matches[0].index;reason=matches[0].reason;}
    }
    if(index===undefined){
      if(!Number.isSafeInteger(nextId+1))throw new Error('Baigėsi saugus įrašų ID intervalas.');
      const record={id:++nextId,...clean};providers.push(record);index=providers.length-1;idToIndex.set(record.id,index);indexRecord(index);importKeys[importKey]=record.id;
      decisions.push({incomingIndex,sourceRow,id:record.id,action:'added',reason:'no_confident_match',changedFields:[],conflictFields:[]});continue;
    }
    const target=providers[index],changedFields=[],conflictFields=[];
    for(const [key,value]of Object.entries(clean)){
      if(empty(value))continue;
      if(empty(target[key])){target[key]=value;changedFields.push(key);}
      else if(JOIN_FIELDS.has(key)){const joined=unionValues(target[key],value,key);if(joined!==target[key]){target[key]=joined;changedFields.push(key);}}
      else if(target[key]!==value)conflictFields.push(key);
    }
    importKeys[importKey]=target.id;indexRecord(index);decisions.push({incomingIndex,sourceRow,id:target.id,action:changedFields.length?'enriched':'unchanged',reason,changedFields,conflictFields});
  }
  const counts={before:existing.length,incoming:incoming.length,added:decisions.filter(d=>d.action==='added').length,enriched:decisions.filter(d=>d.action==='enriched').length,unchanged:decisions.filter(d=>d.action==='unchanged').length,conflicts:decisions.filter(d=>d.conflictFields.length).length,after:providers.length};
  return{providers,importKeys,counts,decisions};
}
