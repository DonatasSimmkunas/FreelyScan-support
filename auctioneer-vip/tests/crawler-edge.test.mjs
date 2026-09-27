import test from 'node:test';
import assert from 'node:assert/strict';
import {createCrawlerHandler,normalizeBatch,sha256,nextScheduledRun} from '../crawler/edge.mjs';
const token='test-crawler-token-'.repeat(3),tokenSha256=await sha256(token);
const env=name=>({SUPABASE_URL:'https://project.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'test-service-role'}[name]);
const req=(body,headers={})=>new Request('https://project.supabase.co/functions/v1/vip-crawler',{method:'POST',headers:{'Content-Type':'application/json','X-VIP-Crawler-Token':token,...headers},body:JSON.stringify(body)});
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});

test('reported next run follows UTC quarter-hour cron boundaries all day, including exact ticks and rollover',()=>{
  assert.equal(nextScheduledRun(Date.parse('2026-09-27T07:43:00Z')),'2026-09-27T07:45:00.000Z');
  assert.equal(nextScheduledRun(Date.parse('2026-09-27T06:00:00Z')),'2026-09-27T06:15:00.000Z');
  assert.equal(nextScheduledRun(Date.parse('2026-09-27T07:45:00Z')),'2026-09-27T08:00:00.000Z');
  assert.equal(nextScheduledRun(Date.parse('2026-09-27T23:59:59Z')),'2026-09-28T00:00:00.000Z');
});

test('crawler validates every request, denies browser origins and leaks no DB details',async()=>{
  let calls=0;const handler=createCrawlerHandler({env,tokenSha256,fetchImpl:async()=>{calls++;throw new Error('database-secret-connection-string');}});
  assert.equal((await handler(req({action:'status'},{'X-VIP-Crawler-Token':'incorrect'}))).status,401);
  assert.equal((await handler(req({action:'status'},{Origin:'https://auctioneer.it.com'}))).status,403);
  assert.equal(calls,0);
  const response=await handler(req({action:'status'}));assert.equal(response.status,503);assert.equal(response.headers.get('access-control-allow-origin'),null);
  assert.ok(!(await response.text()).includes('database-secret'));assert.equal(calls,1);
});

test('search stays DB-filtered and bounds user input without interpolating query syntax',async()=>{
  let saved;const handler=createCrawlerHandler({env,tokenSha256,fetchImpl:async(url,options)=>{assert.ok(url.endsWith('/rpc/vip_crawler_search'));saved=JSON.parse(options.body);return json({records:[],total:0});}});
  const response=await handler(req({action:'search',q:'x'.repeat(400),kind:'hiring',city:'Vilnius',legalForm:'UAB',page:-10,pageSize:50000,sort:'unsafe'}));
  assert.equal(response.status,200);assert.equal(saved.p_q.length,200);assert.equal(saved.p_page,1);assert.equal(saved.p_page_size,25);assert.equal(saved.p_sort,'newest');assert.equal(saved.p_kind,'hiring');
});

test('company identities use actual codes or stable named-source keys, never invented codes',async()=>{
  const batch={sourceId:'company_careers',status:'ok',companies:[{provider:'Example Employer',company_code:null,profile_url:'javascript:alert(1)'}],jobs:[{provider:'Example Employer',company_code:null,source_job_id:'job-1',title:'Engineer',status:'open',expires_at:'2026-10-20',url:'https://jobs.example/1'}],nextCursor:'careers:1:0',warnings:['Source publication time unavailable']};
  const first=await normalizeBatch(batch,'company_careers','2026-09-27T00:00:00Z'),second=await normalizeBatch(batch,'company_careers','2026-09-28T00:00:00Z');
  assert.equal(first.p_companies[0].company_code,null);assert.match(first.p_companies[0].id,/^company_careers:[a-f0-9]{24}$/);assert.equal(first.p_companies[0].id,second.p_companies[0].id);
  assert.equal(first.p_jobs[0].company_id,first.p_companies[0].id);assert.equal(first.p_companies[0].profile_url,'');assert.equal(first.p_jobs[0].expires_at,'2026-10-20T00:00:00.000Z');
  assert.equal(first.p_cursor,'careers:1:0');assert.deepEqual(first.p_warnings,batch.warnings);
});

test('conditional global lease prevents overlapping runs and source failures retain their cursor',async()=>{
  let leased=false,runSummary=null,resolveSource;const sourceGate=new Promise(resolve=>resolveSource=resolve);const ingests=[],patches=[];
  const fetchImpl=async(raw,options={})=>{
    const url=new URL(raw),path=url.pathname,body=options.body?JSON.parse(options.body):null;
    if(path.endsWith('/vip_crawler_control')&&options.method==='PATCH'){
      if(body.lease_owner){if(leased)return json([]);assert.match(url.searchParams.get('or'),/last_started_at.lt/);assert.match(url.searchParams.get('lease_until'),/^lt\./);leased=true;return json([{id:1}]);}
      assert.match(url.searchParams.get('lease_owner'),/^eq\./);leased=false;return new Response(null,{status:204});
    }
    if(path.endsWith('/vip_crawler_sources')&&options.method==='GET')return json([{id:'rc_registry',cursor:'registry-page'},{id:'uzt_vacancies',cursor:'unchanged-page'}]);
    if(path.endsWith('/vip_crawler_sources')&&options.method==='PATCH'){patches.push(body);return new Response(null,{status:204});}
    if(path.endsWith('/vip_crawler_runs')){if(options.method==='PATCH')runSummary=body;return new Response(null,{status:204});}
    if(path.endsWith('/rpc/vip_crawler_ingest')){ingests.push(body);return json({newCompanies:1,companiesSeen:1,jobsSeen:0});}
    if(path.endsWith('/rpc/vip_crawler_status'))return json({running:leased,totalCompanies:ingests.length});
    throw new Error('Unexpected DB request');
  };
  const sources=[['rc_registry',async({cursor})=>{assert.equal(cursor,'registry-page');await sourceGate;return{sourceId:'rc_registry',status:'ok',companies:[{company_code:'123456789',provider:'Example UAB'}],jobs:[],nextCursor:'registry-next'};}],['uzt_vacancies',async()=>{throw new Error('private source credentials');}]];
  const handler=createCrawlerHandler({env,tokenSha256,fetchImpl,sources});
  const first=handler(req({action:'run'}));while(!leased)await new Promise(resolve=>setImmediate(resolve));
  const concurrent=await handler(req({action:'run'}));assert.equal(concurrent.status,409);resolveSource();
  const response=await first;assert.equal(response.status,200);assert.equal(ingests.length,1);assert.equal(ingests[0].p_cursor,'registry-next');assert.equal(patches.length,1);assert.ok(!('cursor'in patches[0]));
  assert.equal(runSummary.status,'partial');assert.equal(runSummary.new_companies,1);assert.equal(leased,false);assert.ok(!JSON.stringify(runSummary).includes('private source'));
});

test('blocked sources are never fetched or advanced while permitted career collection continues',async()=>{
  const states=[{id:'rc_registry',cursor:'registry:v1:preserved-page',status:'blocked'},{id:'uzt_vacancies',cursor:'preserved-uzt-page',status:'blocked'},{id:'company_careers',cursor:'careers:1:0',status:'ok'}];
  const blockedBefore=structuredClone(states.slice(0,2)),ingests=[],sourceWrites=[];let blockedCalls=0,careerCalls=0,runSummary;
  const fetchImpl=async(raw,options={})=>{
    const url=new URL(raw),path=url.pathname,body=options.body?JSON.parse(options.body):null;
    if(path.endsWith('/vip_crawler_control'))return body.lease_owner?json([{id:1}]):new Response(null,{status:204});
    if(path.endsWith('/vip_crawler_sources')&&options.method==='GET'){assert.ok(url.searchParams.get('select').split(',').includes('status'));return json(states);}
    if(path.endsWith('/vip_crawler_sources')&&options.method==='PATCH'){sourceWrites.push({id:url.searchParams.get('id'),body});return new Response(null,{status:204});}
    if(path.endsWith('/vip_crawler_runs')){if(options.method==='PATCH')runSummary=body;return new Response(null,{status:204});}
    if(path.endsWith('/rpc/vip_crawler_ingest')){ingests.push(body);const source=states.find(s=>s.id===body.p_source);source.cursor=body.p_cursor;return json({newCompanies:1,companiesSeen:1,jobsSeen:1});}
    if(path.endsWith('/rpc/vip_crawler_status'))return json({running:false,totalCompanies:1,sources:states});
    throw new Error('Unexpected DB request');
  };
  const blockedFetch=async()=>{blockedCalls++;throw new Error('Blocked source must not be fetched');};
  const sources=[['rc_registry',blockedFetch],['uzt_vacancies',blockedFetch],['company_careers',async({cursor})=>{
    careerCalls++;assert.equal(cursor,'careers:1:0');return{sourceId:'company_careers',status:'ok',companies:[{provider:'Example Employer',company_code:null}],jobs:[{provider:'Example Employer',source_job_id:'job-1',title:'Engineer',status:'open',url:'https://jobs.example/1'}],nextCursor:null};
  }]];
  const response=await createCrawlerHandler({env,tokenSha256,fetchImpl,sources})(req({action:'run'}));
  assert.equal(response.status,200);assert.equal(blockedCalls,0);assert.equal(careerCalls,1);
  assert.deepEqual(states.slice(0,2),blockedBefore);assert.deepEqual(sourceWrites,[]);
  assert.equal(ingests.length,1);assert.equal(ingests[0].p_source,'company_careers');assert.equal(ingests[0].p_jobs.length,1);
  assert.equal(runSummary.status,'partial');assert.deepEqual(runSummary.summary.map(s=>[s.id,s.status]),[['rc_registry','blocked'],['uzt_vacancies','blocked'],['company_careers','ok']]);
});

test('independent sources retire denied access, honor Retry-After and retain successful writes',async()=>{
  const states=[{id:'denied',status:'idle'},{id:'healthy',status:'idle'},{id:'throttled',status:'idle'},{id:'retired',status:'removed'}];
  let now=Date.parse('2026-09-28T00:00:00Z'),deniedCalls=0,throttledCalls=0,retiredCalls=0,healthyCalls=0,summary;const saved=[];
  const fetchImpl=async(raw,options={})=>{
    const url=new URL(raw),path=url.pathname,body=options.body?JSON.parse(options.body):null;
    if(path.endsWith('/vip_crawler_control'))return body.lease_owner?json([{id:1}]):new Response(null,{status:204});
    if(path.endsWith('/vip_crawler_sources')&&options.method==='GET')return json(states);
    if(path.endsWith('/vip_crawler_sources')&&options.method==='PATCH'){Object.assign(states.find(source=>source.id===url.searchParams.get('id').slice(3)),body);assert.ok(!('cursor' in body));return new Response(null,{status:204});}
    if(path.endsWith('/vip_crawler_runs')){if(options.method==='PATCH')summary=body;return new Response(null,{status:204});}
    if(path.endsWith('/rpc/vip_crawler_ingest')){saved.push(body);return json({newCompanies:1,companiesSeen:1,jobsSeen:1});}
    if(path.endsWith('/rpc/vip_crawler_status'))return json({running:false,totalCompanies:saved.length});
    throw new Error('Unexpected request');
  };
  const sources=[['denied',async()=>{deniedCalls++;throw Object.assign(new Error('Forbidden'),{code:'source_http_error',status:403});}],['healthy',async()=>{healthyCalls++;return{sourceId:'healthy',status:'ok',companies:[{provider:'Public Employer'}],jobs:[]};}],['throttled',async()=>{throttledCalls++;throw Object.assign(new Error('Slow down'),{code:'source_http_error',status:429,retryAfter:3600});}],['retired',async()=>{retiredCalls++;throw new Error('Must not fetch');}]];
  const handler=createCrawlerHandler({env,tokenSha256,fetchImpl,sources,now:()=>now});
  assert.equal((await handler(req({action:'run'}))).status,200);assert.equal(summary.status,'partial');
  assert.equal(states[0].status,'removed');assert.equal(states[2].retry_after,'2026-09-28T01:00:00.000Z');assert.equal(saved.length,1);
  now+=120000;assert.equal((await handler(req({action:'run'}))).status,200);
  assert.equal(deniedCalls,1);assert.equal(throttledCalls,1);assert.equal(retiredCalls,0);assert.equal(healthyCalls,2);assert.equal(saved.length,2);
  assert.deepEqual(Object.fromEntries(summary.summary.map(item=>[item.id,item.status])),{healthy:'ok',retired:'removed',denied:'removed',throttled:'cooldown'});
});
