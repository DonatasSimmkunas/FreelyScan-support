import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { createHash, timingSafeEqual } from "node:crypto";
const origins=new Set(["https://vent.it.com","https://www.vent.it.com","https://vent-it-com.onrender.com"]);
Deno.serve(async req=>{
 const origin=req.headers.get("origin")||"";
 const headers={"content-type":"application/json","cache-control":"no-store","access-control-allow-origin":origins.has(origin)?origin:"https://vent-it-com.onrender.com","access-control-allow-methods":"POST,OPTIONS","access-control-allow-headers":"content-type","vary":"Origin"};
 const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
 if(req.method==="OPTIONS")return new Response("ok",{headers});
 if(req.method!=="POST"||(origin&&!origins.has(origin)))return reply({error:"forbidden"},403);
 try{
  const {order,status_token}=await req.json();
  if(typeof order!=="string"||order.length>80||typeof status_token!=="string"||!/^[-a-f0-9]{36}$/.test(status_token))return reply({error:"invalid_request"},400);
  const sb=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const {data:o}=await sb.from("orders").select("order_no,status,metadata").eq("order_no",order).eq("payment_provider","paysera").single();
  const expected=o?.metadata?.payment_status_token_hash||"",hash=createHash("sha256").update(status_token).digest("hex");
  if(expected.length!==hash.length||!timingSafeEqual(new TextEncoder().encode(expected),new TextEncoder().encode(hash)))return reply({error:"not_found"},404);
  const test=o.metadata.paysera_test===true,paid=!test&&o.status==="paid"&&o.metadata.paysera_paid===true&&!!o.metadata.paysera_callback_verified_at;
  return reply({order_no:o.order_no,test,paid,status:paid?"paid":"pending"});
 }catch{return reply({error:"status_unavailable"},502)}
});
