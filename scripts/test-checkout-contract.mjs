import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {stripTypeScriptTypes} from 'node:module';import {webcrypto} from 'node:crypto';
let handler,stripeCalls=0,stripeForm;const token='test-order-token';const digest=[...new Uint8Array(await webcrypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))].map(x=>x.toString(16).padStart(2,'0')).join('');
let order={id:'order1',order_no:'TEST-1',email:'test@example.invalid',created_at:'2026-10-01',status:'request_received',subtotal_eur:100,total_eur:110,shipping_eur:10,metadata:{checkout_token_hash:digest,tax_status:'confirmed'}};
let items=[{sku:'TEST',model:'Test',unit_price_eur:100,qty:1}];
const setting=k=>k==='company'?{legal_name:'Test seller',registered_address:'Test',company_code:'123'}:{accept_card_payments:true};
function from(table){return{filter:null,select(){return this},eq(k,v){this.filter=v;return this},single(){return Promise.resolve({data:table==='orders'?order:{value:setting(this.filter)}})},update(){return this},then(resolve){resolve({data:table==='order_items'?items:[],error:null})}}}
const ctx={Deno:{serve(fn){handler=fn},env:{get(){return 'test-key'}}},createClient(){return{from}},crypto:webcrypto,TextEncoder,Uint8Array,Request,Response,URLSearchParams,console,fetch:async(url,options)=>{stripeCalls++;stripeForm=options.body;return{ok:true,json:async()=>({url:'https://checkout.stripe.com/test',id:'cs_test'})}}};
vm.runInNewContext(stripTypeScriptTypes(fs.readFileSync('supabase/functions/create-stripe-checkout/index.ts','utf8').replace(/^import .*;\n/gm,'')),ctx);
const invoke=(checkout_token=token)=>handler(new Request('https://example.test',{method:'POST',headers:{origin:'https://vent-it-com.onrender.com','content-type':'application/json'},body:JSON.stringify({order_id:'order1',checkout_token})}));
assert.equal((await invoke('wrong')).status,403);assert.equal(stripeCalls,0);
order.metadata.tax_status='to_confirm_before_payment';assert.equal((await invoke()).status,409);assert.equal(stripeCalls,0);
order.metadata.tax_status='confirmed';order.total_eur=1;assert.equal((await invoke()).status,409);assert.equal(stripeCalls,0);
order.total_eur=110;items[0].qty=1.2;assert.equal((await invoke()).status,409);assert.equal(stripeCalls,0);
items[0].qty=1;const r=await invoke();assert.equal(r.status,200);assert.equal(stripeCalls,1);assert.equal(stripeForm.get('line_items[0][price_data][unit_amount]'),'10000');assert(stripeForm.get('success_url').startsWith('https://vent-it-com.onrender.com/'));
console.log('Checkout: order token, unconfirmed tax, mismatched total, fractional quantities and trusted return URL PASS');
