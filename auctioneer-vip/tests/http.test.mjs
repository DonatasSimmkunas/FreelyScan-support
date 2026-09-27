import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer,request} from 'node:http';
import {scryptSync,randomBytes} from 'node:crypto';
import {createVipHandler} from '../lib/handler.mjs';
import {createVipServer} from '../server.mjs';

test('backend health survives an unexpected rejected request without revealing the error',async()=>{
  const server=createVipServer(async()=>{throw new Error('sensitive internal details');});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  try{
    let response=await fetch(base+'/vip/api/session');assert.equal(response.status,500);
    assert.deepEqual(await response.json(),{error:'Užklausa nepavyko.'});
    response=await fetch(base+'/healthz');assert.equal(response.status,200);
    assert.deepEqual(await response.json(),{ok:true});
    response=await fetch(base+'/healthz',{method:'HEAD'});assert.equal(response.status,200);assert.equal(await response.text(),'');
  }finally{await new Promise(resolve=>server.close(resolve));}
});

// Run with --env-file=.env.local to verify the real encrypted catalog.
test('protected HTTP lifecycle, no unauthenticated catalog and no original-site route changes',{skip:!process.env.VIP_DATA_KEY},async()=>{
  const salt=randomBytes(24).toString('hex'),password=randomBytes(18).toString('hex');
  const passwordHash=`scrypt$32768$8$1$${salt}$${scryptSync(password,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024}).toString('hex')}`;
  const origin='https://auctioneer.it.com';
  const handler=await createVipHandler({...process.env,VIP_USERNAME:'verification',VIP_PASSWORD_HASH:passwordHash,VIP_PUBLIC_ORIGIN:origin,NODE_ENV:'production'});
  const server=createServer(async(req,res)=>{if(await handler(req,res))return;res.writeHead(200,{'Content-Type':'text/plain'});res.end('existing-site-unchanged');});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  try{
    for(const path of ['//%','//[']){
      // request() preserves malformed request targets that fetch() would normalize.
      const response=await new Promise((resolve,reject)=>{
        const req=request({host:'127.0.0.1',port:server.address().port,path},res=>{
          let body='';res.setEncoding('utf8');res.on('data',chunk=>body+=chunk);
          res.on('end',()=>resolve({status:res.statusCode,body}));
        });req.on('error',reject);req.end();
      });
      assert.equal(response.status,400);assert.deepEqual(JSON.parse(response.body),{error:'Neteisingas užklausos formatas.'});
    }
    assert.equal(await(await fetch(base+'/')).text(),'existing-site-unchanged');
    let response=await fetch(base+'/vip/');assert.equal(response.status,200);
    assert.match(response.headers.get('x-robots-tag'),/noindex/);assert.match(response.headers.get('cache-control'),/no-store/);
    const html=await response.text();assert.ok(!html.includes('+370'));assert.ok(!html.includes('scrypt$'));assert.ok(!html.includes('catalog.enc'));
    response=await fetch(base+'/vip/api/metadata');assert.equal(response.status,401);
    response=await fetch(base+'/vip/api/metadata?niche=employers');assert.equal(response.status,401);
    response=await fetch(base+'/vip/api/employers/LTB0001');assert.equal(response.status,401);
    response=await fetch(base+'/vip/private/catalog.enc');assert.equal(response.status,404);
    response=await fetch(base+'/vip/.env.local');assert.equal(response.status,404);
    const post=(route,payload,cookie='',csrf='',sendOrigin=origin)=>fetch(base+route,{method:'POST',headers:{'content-type':'application/json',Origin:sendOrigin,Cookie:cookie,'X-VIP-CSRF':csrf},body:JSON.stringify(payload)});
    response=await post('/vip/api/login',{username:'verification',password},'','','https://other.example');assert.equal(response.status,403);
    response=await post('/vip/api/login',{username:'verification',password});assert.equal(response.status,200);
    const cookie=response.headers.get('set-cookie').split(';')[0];assert.match(response.headers.get('set-cookie'),/Secure/);const session=await response.json();
    response=await fetch(base+'/vip/api/metadata',{headers:{Cookie:cookie}});const serviceMeta=await response.json();
    assert.equal(serviceMeta.categories.length,89);assert.ok(serviceMeta.categories.every(c=>c&&!/^\d{4}-\d{2}-\d{2}$/.test(c)));
    response=await fetch(base+'/vip/api/metadata?niche=employers',{headers:{Cookie:cookie}});const employerMeta=await response.json();
    assert.equal(employerMeta.total,1504);assert.equal(employerMeta.jobsTotal,4393);assert.equal(employerMeta.categories.length,9);
    assert.deepEqual(employerMeta.niches.map(n=>n.total),[4500,1504]);
    response=await post('/vip/api/search',{niche:'employers',withPhone:true},cookie,session.csrf);assert.equal(response.status,200);assert.equal((await response.json()).total,1269);
    response=await post('/vip/api/search',{niche:'employers',withEmail:true},cookie,session.csrf);assert.equal((await response.json()).total,404);
    response=await fetch(base+'/vip/api/employers/LTB0001',{headers:{Cookie:cookie}});assert.equal(response.status,200);const company=await response.json();
    assert.equal(company.id,'LTB0001');assert.equal(company.jobs.length,36);assert.ok(company.contacts.length);
    assert.ok(company.jobs.every(j=>j.title&&j.url&&!Object.hasOwn(j,'Patikrinta')&&!Object.hasOwn(j,'Portalo laiko žyma')));
    response=await fetch(base+'/vip/api/employers/not-real',{headers:{Cookie:cookie}});assert.equal(response.status,404);
    response=await fetch(base+'/vip/api/metadata?niche=constructor',{headers:{Cookie:cookie}});assert.equal(response.status,400);
    response=await post('/vip/api/search',{},cookie,'wrong');assert.equal(response.status,403);
    response=await post('/vip/api/search',{},cookie,session.csrf);assert.equal(response.status,200);const data=await response.json();
    assert.equal(data.total,4500);assert.equal(data.records.length,25);assert.equal(Object.keys(data.records[0]).length,19);assert.equal(data.mixedUnits,true);
    response=await post('/vip/api/search',{withPhone:true},cookie,session.csrf);assert.equal((await response.json()).total,4127);
    response=await post('/vip/api/search',{withPrice:true},cookie,session.csrf);assert.equal((await response.json()).total,3476);
    response=await post('/vip/api/logout',{},cookie,session.csrf);assert.equal(response.status,200);
    response=await post('/vip/api/search',{},cookie,session.csrf);assert.equal(response.status,401);
    response=await fetch(base+'/vip/api/employers/LTB0001',{headers:{Cookie:cookie}});assert.equal(response.status,401);
  }finally{await new Promise(resolve=>server.close(resolve));}
});
