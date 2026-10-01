import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
function hex(a:ArrayBuffer){return [...new Uint8Array(a)].map(b=>b.toString(16).padStart(2,"0")).join("")}
async function sig(secret:string,msg:string){const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return hex(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(msg)))}
Deno.serve(async(req)=>{
 const secret=Deno.env.get("STRIPE_WEBHOOK_SECRET");if(!secret)return new Response("not configured",{status:503});
 if(req.method!=="POST")return new Response("method",{status:405});
 try{
 const body=await req.text(),h=req.headers.get("stripe-signature")||"",parts=h.split(",").map(x=>x.split("=",2));
 const t=parts.find(x=>x[0]==="t")?.[1],signatures=parts.filter(x=>x[0]==="v1").map(x=>x[1]);
 if(!t||!/^\d+$/.test(t)||Math.abs(Date.now()/1000-Number(t))>300||!signatures.length)return new Response("bad signature",{status:400});
 const expected=await sig(secret,t+"."+body);
 const equal=(a:string,b:string)=>{if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0};
 if(!signatures.some(v=>equal(expected,v)))return new Response("bad signature",{status:400});
 const e=JSON.parse(body),obj=e?.data?.object||{},orderId=obj?.metadata?.order_id;
 if(orderId&&["checkout.session.completed","checkout.session.async_payment_succeeded","checkout.session.expired"].includes(e.type)){
  const sb=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const {data:o,error}=await sb.from("orders").select("id,status,total_eur,currency,payment_reference").eq("id",orderId).single();
  if(error||!o)return new Response("order unavailable",{status:500});
  if(o.payment_reference!==obj.id)return new Response("session mismatch",{status:409});
  if(e.type!=="checkout.session.expired"&&obj.payment_status==="paid"){
   if(obj.amount_total!==Math.round(Number(o.total_eur)*100)||obj.currency!==String(o.currency||"EUR").toLowerCase())return new Response("amount mismatch",{status:409});
   const {error:updateError}=await sb.from("orders").update({status:"paid",payment_provider:"stripe",payment_reference:obj.id,updated_at:new Date().toISOString()}).eq("id",o.id).neq("status","paid");
   if(updateError)return new Response("update failed",{status:500});
  }else if(e.type==="checkout.session.expired"){
   const {error:updateError}=await sb.from("orders").update({status:"request_received",updated_at:new Date().toISOString()}).eq("id",o.id).eq("status","payment_pending");
   if(updateError)return new Response("update failed",{status:500});
  }
 }
 }catch{return new Response("event failed",{status:500})}
 return new Response("ok");
});
