import test from 'node:test';
import assert from 'node:assert/strict';
import {scryptSync,randomBytes} from 'node:crypto';
import {createVipHandler} from '../lib/handler.mjs';
import {createVipServer} from '../server.mjs';

test('exact-origin static client authenticates with a revocable bearer without cookies',{skip:!process.env.VIP_DATA_KEY},async()=>{
  const salt=randomBytes(24).toString('hex'),password=randomBytes(18).toString('hex');
  const passwordHash=`scrypt$32768$8$1$${salt}$${scryptSync(password,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024}).toString('hex')}`;
  const origin='https://auctioneer.it.com',evil='https://other.example';
  const handler=await createVipHandler({...process.env,VIP_USERNAME:'verification',VIP_PASSWORD_HASH:passwordHash,VIP_PUBLIC_ORIGIN:origin,NODE_ENV:'production'});
  const server=createVipServer(handler);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  const preflight=(sendOrigin=origin,method='POST',headers='Content-Type, Authorization, X-VIP-CSRF, X-VIP-Client')=>fetch(base+'/vip/api/search',{
    method:'OPTIONS',headers:{...(sendOrigin===null?{}:{Origin:sendOrigin}),'Access-Control-Request-Method':method,'Access-Control-Request-Headers':headers}
  });
  const post=(route,payload,headers={})=>fetch(base+'/vip/api/'+route,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...headers},body:JSON.stringify(payload)});
  const checkAllowed=response=>{
    assert.equal(response.headers.get('access-control-allow-origin'),origin);
    assert.match(response.headers.get('vary'),/Origin/);
    assert.equal(response.headers.get('access-control-allow-credentials'),null);
    assert.match(response.headers.get('cache-control'),/no-store/);
  };
  try{
    let response=await preflight();assert.equal(response.status,204);checkAllowed(response);
    assert.equal(response.headers.get('access-control-allow-methods'),'GET, POST, OPTIONS');
    assert.equal(response.headers.get('access-control-allow-headers'),'Content-Type, Authorization, X-VIP-CSRF, X-VIP-Client');
    for(const [sendOrigin,method,headers]of [[evil,'POST','Authorization'],['null','GET','Authorization'],[null,'GET','Authorization'],[origin,'DELETE','Authorization'],[origin,'POST','Authorization, X-Evil']]){
      response=await preflight(sendOrigin,method,headers);assert.equal(response.status,403);
      if(sendOrigin!==origin)assert.equal(response.headers.get('access-control-allow-origin'),null);
    }
    response=await fetch(base+'/vip/app.js',{headers:{Origin:origin}});assert.equal(response.headers.get('access-control-allow-origin'),null);
    response=await fetch(base+'/vip/api/metadata',{headers:{Origin:origin}});assert.equal(response.status,401);checkAllowed(response);
    assert.deepEqual(Object.keys(await response.json()),['error']);
    for(const method of ['GET','POST','PUT','HEAD']){
      response=await fetch(base+'/vip/api/metadata',{method,headers:{Origin:evil}});assert.equal(response.status,403);
      assert.equal(response.headers.get('access-control-allow-origin'),null);
    }
    response=await fetch(base+'/vip/api/login',{method:'POST',headers:{'Content-Type':'application/json','X-VIP-Client':'static'},body:JSON.stringify({username:'verification',password})});
    assert.equal(response.status,403);assert.equal(response.headers.get('set-cookie'),null);
    response=await post('login',{username:'verification',password},{'X-VIP-Client':'static'});
    assert.equal(response.status,200);checkAllowed(response);assert.equal(response.headers.get('set-cookie'),null);
    const login=await response.json();assert.match(login.accessToken,/^[A-Za-z0-9_-]{43}$/);
    const headers={Origin:origin,Authorization:`Bearer ${login.accessToken}`};
    response=await fetch(base+'/vip/api/session',{headers});assert.equal(response.status,200);checkAllowed(response);
    assert.deepEqual(await response.json(),{username:'verification',csrf:login.csrf});
    response=await fetch(base+'/vip/api/metadata',{headers});assert.equal(response.status,200);
    const metadata=await response.json();assert.equal(metadata.total,5217);assert.equal(metadata.fields.length,22);
    response=await fetch(base+'/vip/api/metadata',{headers:{...headers,Origin:evil}});assert.equal(response.status,403);
    response=await post('search',{},headers);assert.equal(response.status,403);
    response=await post('search',{}, {...headers,'X-VIP-CSRF':'wrong'});assert.equal(response.status,403);
    response=await post('search',{pageSize:25},{...headers,'X-VIP-CSRF':login.csrf});assert.equal(response.status,200);checkAllowed(response);
    const results=await response.json();assert.equal(results.total,5217);assert.equal(results.records.length,25);
    response=await post('login',{username:'verification',password});assert.equal(response.status,200);
    const cookie=response.headers.get('set-cookie');assert.ok(cookie);assert.equal((await response.json()).accessToken,undefined);
    response=await fetch(base+'/vip/api/session',{headers:{Origin:origin,Cookie:cookie,Authorization:'Bearer invalid'}});assert.equal(response.status,401);
    response=await post('logout',{}, {...headers,'X-VIP-CSRF':login.csrf});assert.equal(response.status,200);assert.equal(response.headers.get('set-cookie'),null);
    response=await fetch(base+'/vip/api/metadata',{headers});assert.equal(response.status,401);assert.deepEqual(Object.keys(await response.json()),['error']);
    response=await post('search',{}, {...headers,'X-VIP-CSRF':login.csrf});assert.equal(response.status,401);
  }finally{await new Promise(resolve=>server.close(resolve));}
});
