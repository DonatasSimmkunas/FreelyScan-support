import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
const origins=new Set(["https://vent.it.com","https://www.vent.it.com","https://vent-it-com.onrender.com"]);
Deno.serve(async req=>{
 const origin=req.headers.get("origin")||"";
 const headers={"content-type":"application/json","cache-control":"no-store","access-control-allow-origin":origins.has(origin)?origin:"https://vent.it.com","access-control-allow-methods":"POST,OPTIONS","access-control-allow-headers":"content-type","vary":"Origin"};
 const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
 if(req.method==="OPTIONS")return new Response("ok",{headers});
 if(req.method!=="POST"||(origin&&!origins.has(origin)))return reply({error:"forbidden"},403);
 try{
  const {session_id,order}=await req.json();
  if(!/^cs_(test_|live_)?[A-Za-z0-9]{16,240}$/.test(session_id||"")||typeof order!=="string"||order.length>80)return reply({error:"invalid_session"},400);
  const key=Deno.env.get("STRIPE_SECRET_KEY");if(!key)return reply({error:"payment_not_configured"},503);
  const result=await fetch("https://api.stripe.com/v1/checkout/sessions/"+encodeURIComponent(session_id),{headers:{authorization:"Bearer "+key}});
  if(!result.ok)return reply({error:"session_not_found"},404);
  const session=await result.json();
  if(session.metadata?.order_no!==order)return reply({error:"session_not_found"},404);
  const sb=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const {data:o,error}=await sb.from("orders").select("order_no,total_eur,currency,payment_reference,status").eq("id",session.metadata.order_id).single();
  if(error||!o||o.payment_reference!==session.id||o.order_no!==order)return reply({error:"session_not_found"},404);
  const paid=session.payment_status==="paid"&&session.amount_total===Math.round(Number(o.total_eur)*100)&&session.currency===String(o.currency||"EUR").toLowerCase();
  return reply({order_no:o.order_no,paid,status:paid?"paid":session.status==="expired"?"expired":"pending"});
 }catch{return reply({error:"status_unavailable"},502)}
});
