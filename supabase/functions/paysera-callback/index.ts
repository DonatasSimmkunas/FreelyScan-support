import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { createHash, timingSafeEqual } from "node:crypto";
Deno.serve(async req=>{
 const reply=(text:string,status=200)=>new Response(text,{status,headers:{"content-type":"text/plain","cache-control":"no-store"}});
 if(!["GET","POST"].includes(req.method))return reply("Method not allowed",405);
 const password=Deno.env.get("PAYSERA_PROJECT_PASSWORD"),project=Deno.env.get("PAYSERA_PROJECT_ID");
 if(!password||!project)return reply("Not configured",503);
 try{
  const raw=req.method==="GET"?new URL(req.url).search.slice(1):await req.text();
  if(raw.length>20000)return reply("Invalid callback",400);
  const params=new URLSearchParams(raw),data=params.get("data")||"",ss1=params.get("ss1")||"";
  const expected=createHash("md5").update(data+password).digest("hex");
  if(!/^[a-f0-9]{32}$/i.test(ss1)||!timingSafeEqual(new TextEncoder().encode(expected),new TextEncoder().encode(ss1.toLowerCase())))return reply("Invalid signature",403);
  const decoded=new URLSearchParams(atob(data.replace(/-/g,"+").replace(/_/g,"/")));
  if(decoded.get("projectid")!==project)return reply("Wrong project",400);
  const sb=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const {data:o,error:readError}=await sb.from("orders").select("*").eq("payment_provider","paysera").eq("payment_reference",decoded.get("orderid")).single();
  if(readError||!o)return reply("Order unavailable",500);
  const amount=decoded.get("payamount")??decoded.get("amount"),currency=decoded.has("payamount")?decoded.get("paycurrency"):decoded.get("currency");
  if(!/^\d+$/.test(amount||"")||Number(amount)!==Math.round(Number(o.total_eur)*100)||currency!=="EUR"||o.metadata?.paysera_project_id!==project)return reply("Payment mismatch",400);
  const test=decoded.get("test")==="1";
  if(!["0","1"].includes(decoded.get("test")||"")||test!==o.metadata?.paysera_test)return reply("Environment mismatch",400);
  const status=decoded.get("status");
  // Additional payer information alone never changes an unpaid order to paid.
  if(status!=="1")return reply("OK");
  if(o.status==="paid"||o.metadata?.paysera_test_completed)return reply("OK");
  if(o.status!=="payment_pending")return reply("Order state mismatch",409);
  const metadata={...o.metadata,paysera_callback_verified_at:new Date().toISOString(),...(test?{paysera_test_completed:true}:{paysera_paid:true})};
  const {error}=await sb.from("orders").update({status:test?"payment_pending":"paid",metadata,updated_at:new Date().toISOString()}).eq("id",o.id).eq("payment_reference",o.payment_reference).eq("status","payment_pending");
  if(error)return reply("Retry callback",500);
  return reply("OK");
 }catch{return reply("Callback unavailable",500)}
});
