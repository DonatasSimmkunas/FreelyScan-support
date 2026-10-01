import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {stripTypeScriptTypes} from 'node:module';
import {webcrypto,createHmac} from 'node:crypto';
let handler,updates=[],order={id:'order1',status:'payment_pending',total_eur:123.45,currency:'EUR',payment_reference:'cs_test_12345678901234567890'};
const query={select(){return this},eq(){return this},single:async()=>({data:order,error:null}),update(value){updates.push(value);return this},neq(){return Promise.resolve({error:null})},then(resolve){resolve({error:null})}};
const context={Deno:{serve(fn){handler=fn},env:{get(name){return name==='STRIPE_WEBHOOK_SECRET'?'whsec_test':'key'}}},createClient(){return{from(){return query}}},crypto:webcrypto,TextEncoder,Uint8Array,Date,Response,Request,console};
const src=fs.readFileSync('supabase/functions/stripe-webhook/index.ts','utf8').replace(/^import .*;\n/gm,'');vm.runInNewContext(stripTypeScriptTypes(src),context);
const event=(type='checkout.session.completed',amount=12345,session=order.payment_reference)=>({type,data:{object:{id:session,payment_status:'paid',amount_total:amount,currency:'eur',metadata:{order_id:order.id}}}});
async function invoke(e,time=Math.floor(Date.now()/1000),bad=false){const body=JSON.stringify(e),signature=createHmac('sha256','whsec_test').update(time+'.'+body).digest('hex');return handler(new Request('https://example.test',{method:'POST',headers:{'stripe-signature':`t=${time},v1=invalid,v1=${bad?'invalid':signature}`},body}));}
assert.equal((await invoke(event())).status,200);assert.equal(updates.at(-1).status,'paid');
updates=[];assert.equal((await invoke(event(),Math.floor(Date.now()/1000)-600)).status,400);assert.equal(updates.length,0);
assert.equal((await invoke(event(),Math.floor(Date.now()/1000),true)).status,400);
assert.equal((await invoke(event('checkout.session.completed',1))).status,409);assert.equal(updates.length,0);
assert.equal((await invoke(event('checkout.session.completed',12345,'cs_other'))).status,409);
assert.equal((await invoke(event('checkout.session.async_payment_succeeded'))).status,200);
assert.equal((await invoke(event('checkout.session.expired'))).status,200);assert.equal(updates.at(-1).status,'request_received');
console.log('Payments: valid and rotated signatures, replay rejection, exact amount/session, async completion and expiry PASS');
