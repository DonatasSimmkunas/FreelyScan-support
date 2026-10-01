const base='https://vent.it.com';
for(const path of ['/','/planner.html','/quote.html','/health.json']){const r=await fetch(base+path,{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error(path+' HTTP '+r.status);console.log(path,r.status)}
const r=await fetch('https://fihyzcabvrndsztlsufg.supabase.co/functions/v1/site-health',{signal:AbortSignal.timeout(15000)});if(!r.ok||!(await r.json()).ok)throw Error('Backend health failed');console.log('Backend health PASS');
for(const path of ['/supabase/functions/create-order/index.ts','/scripts/test-paysera-contract.mjs','/PAYSERA-SETUP.md']){const r=await fetch(base+path,{signal:AbortSignal.timeout(15000)});if(r.ok)throw Error('Private release path exposed: '+path);console.log('Excluded',path,r.status)}
