import * as crawlerSources from '../lib/crawler-sources.mjs';
const TOKEN_SHA256='__CRAWLER_TOKEN_SHA256__';
const SOURCE_RUNNERS=[['rc_registry',crawlerSources.fetchRegistryBatch],['uzt_vacancies',crawlerSources.fetchVacanciesBatch],['company_careers',crawlerSources.fetchCareerBatch]];
const RESPONSE_HEADERS={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'};
const text=(v,max=1000)=>typeof v==='string'?v.trim().slice(0,max):'';
const date=v=>{if(!v)return null;const n=Date.parse(String(v));return Number.isFinite(n)?new Date(n).toISOString():null;};
const url=v=>{try{const u=new URL(v);return ['https:','http:'].includes(u.protocol)?u.href.slice(0,2000):'';}catch{return '';}};
export async function sha256(value){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(v=>v.toString(16).padStart(2,'0')).join('');}
const equalHash=(a,b)=>{if(a.length!==b.length)return false;let n=0;for(let i=0;i<a.length;i++)n|=a.charCodeAt(i)^b.charCodeAt(i);return n===0;};
export function nextScheduledRun(timestamp){const interval=6*3600000;return new Date((Math.floor(timestamp/interval)+1)*interval).toISOString();}
class RequestError extends Error{constructor(status,message){super(message);this.status=status;}}
export async function normalizeBatch(batch,sourceId,nowIso){
  if(!batch||batch.sourceId!==sourceId||batch.status!=='ok')throw new Error('Source unavailable');
  const companies=new Map(),ids=new Map();
  const identity=async row=>{
    const code=text(String(row.company_code??''),20);
    if(/^\d{5,20}$/.test(code))return{id:code,code};
    const name=text(row.provider,500);if(!name)return null;
    return{id:sourceId+':'+(await sha256(name.normalize('NFKC').toLocaleLowerCase('lt'))).slice(0,24),code:null};
  };
  const remember=async row=>{
    const key=await identity(row);if(!key||!text(row.provider,500))return null;
    const record={id:key.id,company_code:key.code,provider:text(row.provider,500),legal_form:text(row.legal_form,300),city_area:text(row.city_area,500),address:text(row.address),profile_url:url(row.profile_url),source_url:url(row.source_url),company_phone:text(row.company_phone),company_email:text(row.company_email),registered_at:date(row.registered_at)?.slice(0,10)||null};
    const previous=companies.get(key.id);companies.set(key.id,previous?Object.fromEntries(Object.entries(record).map(([k,v])=>[k,v||previous[k]||v])):record);
    ids.set(text(row.provider,500).toLocaleLowerCase('lt'),key.id);return key.id;
  };
  for(const company of (Array.isArray(batch.companies)?batch.companies:[]).slice(0,250))await remember(company);
  const jobs=[];
  for(const job of (Array.isArray(batch.jobs)?batch.jobs:[]).slice(0,250)){
    const key=await identity(job);let companyId=key?.id||ids.get(text(job.provider,500).toLocaleLowerCase('lt'));
    if(!companyId)continue;
    if(!companies.has(companyId)&&text(job.provider,500)&&companies.size<250)companyId=await remember({...job,source_url:job.source_url||job.url});
    const sourceJob=text(String(job.source_job_id??''),300),title=text(job.title,1000);if(!companyId||!sourceJob||!title)continue;
    const status=['active','open'].includes(job.status)?'open':['closed','expired','inactive'].includes(job.status)?'closed':'unknown';
    jobs.push({company_id:companyId,source_job_id:sourceJob,title,city_area:text(job.city_area,500),url:url(job.url),status,published_at:date(job.published_at),expires_at:date(job.expires_at),source_updated_at:date(job.source_updated_at)});
  }
  return{p_source:sourceId,p_companies:[...companies.values()],p_jobs:jobs,p_cursor:batch.nextCursor??null,p_updated:date(batch.sourceUpdatedAt),p_fetched:date(batch.fetchedAt)||nowIso,p_warnings:(Array.isArray(batch.warnings)?batch.warnings:[]).slice(0,20).map(v=>text(typeof v==='string'?v:v?.message,500)).filter(Boolean)};
}
export function createCrawlerHandler({env=key=>globalThis.Deno?.env.get(key),fetchImpl=fetch,tokenSha256=TOKEN_SHA256,sources=SOURCE_RUNNERS,now=()=>Date.now()}={}){
  const base=String(env('SUPABASE_URL')||'').replace(/\/$/,''),key=env('SUPABASE_SERVICE_ROLE_KEY');
  const send=(status,body)=>new Response(JSON.stringify(body),{status,headers:RESPONSE_HEADERS});
  async function db(path,{method='GET',body,signal,representation=false}={}){
    const response=await fetchImpl(base+'/rest/v1/'+path,{method,signal:signal||AbortSignal.timeout(12000),headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:representation?'return=representation':'return=minimal'},body:body===undefined?undefined:JSON.stringify(body)});
    if(!response.ok)throw new Error('Database unavailable');
    const raw=await response.text();return raw?JSON.parse(raw):null;
  }
  const status=()=>db('rpc/vip_crawler_status',{method:'POST',body:{}});
  async function run(){
    const started=now(),startedIso=new Date(started).toISOString(),runId=crypto.randomUUID(),deadline=AbortSignal.timeout(85000);
    const runDb=(path,options={})=>db(path,{...options,signal:AbortSignal.any([deadline,AbortSignal.timeout(10000)])});
    const query=new URLSearchParams({id:'eq.1',lease_until:'lt.'+startedIso,or:'(last_started_at.is.null,last_started_at.lt.'+new Date(started-60000).toISOString()+')'});
    const lease=await runDb('vip_crawler_control?'+query,{method:'PATCH',representation:true,body:{lease_owner:runId,lease_until:new Date(started+180000).toISOString(),last_started_at:startedIso}});
    if(!lease?.length){const current=await runDb('rpc/vip_crawler_status',{method:'POST',body:{}});throw new RequestError(current?.running?409:429,current?.running?'Rinkimas jau vyksta.':'Palaukite bent minutę prieš kitą rinkimą.');}
    const summary=[];let totalNew=0,totalCompanies=0,totalJobs=0;
    try{
      await runDb('vip_crawler_runs',{method:'POST',body:{id:runId,started_at:startedIso}});
      const states=await runDb('vip_crawler_sources?select=id,cursor,status');
      for(const[sourceId,fetchBatch]of sources){
        if(states.find(s=>s.id===sourceId)?.status==='blocked'){
          summary.push({id:sourceId,status:'blocked',error:'Šaltinis blokuoja šio serverio užklausas. Rinkimas pristabdytas, kol bus suteikta prieiga.'});continue;
        }
        const remaining=75000-(now()-started);
        if(remaining<6000){summary.push({id:sourceId,status:'skipped',error:'Pasiektas vieno rinkimo laiko limitas.'});continue;}
        try{
          const batch=await fetchBatch({cursor:states.find(s=>s.id===sourceId)?.cursor??null,limit:250,fetchImpl,signal:AbortSignal.any([deadline,AbortSignal.timeout(Math.min(20000,remaining-3000))])});
          const normalized=await normalizeBatch(batch,sourceId,new Date(now()).toISOString());
          const saved=await runDb('rpc/vip_crawler_ingest',{method:'POST',body:normalized});
          totalNew+=saved.newCompanies||0;totalCompanies+=saved.companiesSeen||0;totalJobs+=saved.jobsSeen||0;
          summary.push({id:sourceId,status:'ok',...saved,warnings:normalized.p_warnings});
        }catch(cause){
          const sourceCode=['source_http_error','source_aborted','source_unavailable','source_invalid_json','source_invalid_schema','source_too_large'].includes(cause?.code)?cause.code:'source_save_failed';
          const httpStatus=Number.isInteger(cause?.status)&&cause.status>=400&&cause.status<=599?cause.status:null;
          const error='Šaltinio nepavyko patikrinti.'+(httpStatus?' HTTP '+httpStatus+'.':'')+' Išsaugoti duomenys ir žymeklis nepakeisti.';
          summary.push({id:sourceId,status:'error',error,errorCode:sourceCode,...(httpStatus?{httpStatus}:{})});
          try{await runDb('vip_crawler_sources?id=eq.'+encodeURIComponent(sourceId),{method:'PATCH',body:{status:'error',last_checked:new Date(now()).toISOString(),error}});}catch{}
        }
      }
      const finished=new Date(now()).toISOString(),ok=summary.filter(s=>s.status==='ok').length;
      await runDb('vip_crawler_runs?id=eq.'+runId,{method:'PATCH',body:{finished_at:finished,status:ok===sources.length?'ok':ok?'partial':'error',new_companies:totalNew,companies_seen:totalCompanies,jobs_seen:totalJobs,summary}});
    }catch{
      try{await runDb('vip_crawler_runs?id=eq.'+runId,{method:'PATCH',body:{finished_at:new Date(now()).toISOString(),status:'error',new_companies:totalNew,companies_seen:totalCompanies,jobs_seen:totalJobs,summary}});}catch{}
      throw new RequestError(503,'Rinkimas laikinai nepasiekiamas. Pabandykite vėliau.');
    }finally{
      try{await db('vip_crawler_control?id=eq.1&lease_owner=eq.'+runId,{method:'PATCH',signal:AbortSignal.timeout(2000),body:{lease_owner:null,lease_until:new Date(now()).toISOString(),last_finished_at:new Date(now()).toISOString(),next_run_at:nextScheduledRun(now())}});}catch{}
    }
    return db('rpc/vip_crawler_status',{method:'POST',body:{},signal:AbortSignal.timeout(5000)});
  }
  return async request=>{
    try{
      if(!/^[a-f0-9]{64}$/.test(tokenSha256)||!base.startsWith('https://')||!key)return send(503,{error:'Rinkimas nesukonfigūruotas.'});
      const token=request.headers.get('X-VIP-Crawler-Token')||'';
      if(token.length<32||token.length>512||!equalHash(await sha256(token),tokenSha256))return send(401,{error:'Neautorizuota.'});
      if(request.headers.has('Origin'))return send(403,{error:'Užklausa atmesta.'});
      if(request.method!=='POST')return send(405,{error:'Reikia POST užklausos.'});
      if(!(request.headers.get('Content-Type')||'').startsWith('application/json'))return send(415,{error:'Reikia JSON užklausos.'});
      const raw=await request.text();if(raw.length>32768)return send(413,{error:'Užklausa per didelė.'});
      let input;try{input=JSON.parse(raw);}catch{return send(400,{error:'Neteisingas JSON formatas.'});}
      if(!input||typeof input!=='object'||Array.isArray(input))return send(400,{error:'Neteisinga užklausa.'});
      if(input.action==='status')return send(200,await status());
      if(input.action==='run')return send(200,await run());
      if(input.action==='search'){
        const filters=input.filters&&typeof input.filters==='object'?input.filters:input;
        const page=Number(filters.page),size=Number(filters.pageSize);
        return send(200,await db('rpc/vip_crawler_search',{method:'POST',body:{p_q:text(filters.q,200),p_kind:filters.kind==='hiring'?'hiring':'all',p_legal_form:text(filters.legalForm,300),p_city:text(filters.city,500),p_page:Number.isFinite(page)?Math.max(1,Math.min(100000,Math.floor(page))):1,p_page_size:size===50?50:25,p_sort:filters.sort==='name'?'name':'newest'}}));
      }
      return send(400,{error:'Nežinomas veiksmas.'});
    }catch(error){return send(error instanceof RequestError?error.status:503,{error:error instanceof RequestError?error.message:'Duomenys laikinai nepasiekiami. Pabandykite vėliau.'});}
  };
}
if(typeof Deno!=='undefined')Deno.serve(createCrawlerHandler());
