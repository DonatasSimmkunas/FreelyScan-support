import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { createHash } from "node:crypto";
const ALLOWED_ORIGINS=new Set(["https://vent.it.com","https://www.vent.it.com","https://vent-it-com.onrender.com"]);
Deno.serve(async(req)=>{
 const origin=req.headers.get("origin")||"";
 const site=ALLOWED_ORIGINS.has(origin)?origin:"https://vent-it-com.onrender.com";
 const H={"access-control-allow-origin":site,"access-control-allow-methods":"POST,OPTIONS","access-control-allow-headers":"content-type,authorization,apikey","vary":"Origin","content-type":"application/json"};
 if(origin&&!ALLOWED_ORIGINS.has(origin))return new Response(JSON.stringify({error:"forbidden"}),{status:403,headers:H});
 if(req.method!=="POST"&&req.method!=="OPTIONS")return new Response(JSON.stringify({error:"method"}),{status:405,headers:H});
 if(req.method==="OPTIONS")return new Response("ok",{headers:H});
 const key=Deno.env.get("PAYSERA_PROJECT_PASSWORD"),project=Deno.env.get("PAYSERA_PROJECT_ID"),test=Deno.env.get("PAYSERA_TEST")!=="false";if(!key||!/^\d+$/.test(project||""))return new Response(JSON.stringify({configured:false,error:"paysera_not_configured"}),{status:503,headers:H});
 try{
  const {order_id,checkout_token,confirm_quote,shipping_eur,tax_note,lead_time}=await req.json();const sb=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const [{data:commerceRow},{data:companyRow}]=await Promise.all([
    sb.from("site_settings").select("value").eq("key","commerce").single(),
    sb.from("site_settings").select("value").eq("key","company").single()
  ]);
  const company=companyRow?.value||{};
  if((!test&&commerceRow?.value?.accept_card_payments!==true)||commerceRow?.value?.payment_provider!=="paysera"||!company.legal_name||!company.registered_address||!company.company_code)
    return new Response(JSON.stringify({configured:false,error:"card_checkout_not_ready"}),{status:503,headers:H});
  const {data:o}=await sb.from("orders").select("*").eq("id",order_id).single();if(!o)return new Response(JSON.stringify({error:"order_not_found"}),{status:404,headers:H});
  const tokenHash=[...new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(String(checkout_token||""))))].map(b=>b.toString(16).padStart(2,"0")).join("");
  let adminId:string|null=null;
  if(confirm_quote===true){
   const bearer=req.headers.get("authorization")?.replace(/^Bearer\s+/i,"");
   if(bearer){const {data:user}=await sb.auth.getUser(bearer);if(user.user){const {data:admin}=await sb.from("site_admins").select("role").eq("user_id",user.user.id).maybeSingle();if(admin)adminId=user.user.id}}
  }
  if(!adminId&&(!o.metadata?.checkout_token_hash||tokenHash!==o.metadata.checkout_token_hash))return new Response(JSON.stringify({error:"order_access_denied"}),{status:403,headers:H});
  if(adminId){
   const freight=Number(shipping_eur);
   if(o.status!=="request_received"||!Number.isFinite(freight)||freight<0||typeof tax_note!=="string"||tax_note.trim().length<3||typeof lead_time!=="string"||lead_time.trim().length<3)return new Response(JSON.stringify({error:"confirmed_quote_details_required"}),{status:409,headers:H});
   o.shipping_eur=Math.round(freight*100)/100;o.total_eur=Math.round((Number(o.subtotal_eur)+o.shipping_eur)*100)/100;
   o.metadata={...o.metadata,tax_status:"confirmed",tax_note:tax_note.trim().slice(0,300),confirmed_lead_time:lead_time.trim().slice(0,300),quote_confirmed_by:adminId,quote_confirmed_at:new Date().toISOString()};
   const {error:quoteError}=await sb.from("orders").update({shipping_eur:o.shipping_eur,total_eur:o.total_eur,metadata:o.metadata}).eq("id",o.id).eq("status","request_received");
   if(quoteError)throw quoteError;
  }
  if(o.status!=="request_received"&&o.status!=="payment_pending")return new Response(JSON.stringify({error:"already_paid"}),{status:409,headers:H});
  if(o.metadata?.tax_status!=="confirmed")return new Response(JSON.stringify({error:"tax_not_confirmed"}),{status:409,headers:H});
  const {data:items}=await sb.from("order_items").select("*").eq("order_id",order_id);
  if(!items?.length||(items||[]).some((x:any)=>!Number.isFinite(Number(x.unit_price_eur))||Number(x.unit_price_eur)<=0||!Number.isInteger(Number(x.qty))||Number(x.qty)<1))return new Response(JSON.stringify({configured:true,error:"project_priced_items_require_quote"}),{status:409,headers:H});
  const cents=items.reduce((sum:number,x:any)=>sum+Math.round(Number(x.unit_price_eur)*100)*Number(x.qty),0)+Math.round(Number(o.shipping_eur)*100);
  if(cents!==Math.round(Number(o.total_eur)*100)||cents<=0||String(o.currency||"EUR").toUpperCase()!=="EUR")return new Response(JSON.stringify({error:"order_total_mismatch"}),{status:409,headers:H});
  const reference=crypto.randomUUID(),statusToken=crypto.randomUUID();
  const statusHash=createHash("sha256").update(statusToken).digest("hex");
  const form=new URLSearchParams({projectid:project!,orderid:reference,amount:String(cents),currency:"EUR",version:"1.8",test:test?"1":"0",p_email:o.email,accepturl:`${site}/order-success.html?provider=paysera&order=${encodeURIComponent(o.order_no)}&status_token=${statusToken}`,cancelurl:`${site}/#cart`,callbackurl:Deno.env.get("SUPABASE_URL")+"/functions/v1/paysera-callback"});
  const data=btoa(form.toString()).replace(/\+/g,"-").replace(/\//g,"_");
  const sign=createHash("md5").update(data+key).digest("hex");
  const metadata={...o.metadata,paysera_project_id:project,paysera_test:test,payment_status_token_hash:statusHash};
  const {data:updated,error}=await sb.from("orders").update({status:"payment_pending",payment_provider:"paysera",payment_reference:reference,metadata,updated_at:new Date().toISOString()}).eq("id",o.id).eq("status",o.status).eq("updated_at",o.updated_at).select("id");
  if(error)throw error;if(!updated?.length)return new Response(JSON.stringify({error:"order_changed_retry"}),{status:409,headers:H});
  return new Response(JSON.stringify({configured:true,test,url:"https://www.paysera.com/pay/?"+new URLSearchParams({data,sign})}),{headers:H});
 }catch(e){console.error("Paysera checkout failed");return new Response(JSON.stringify({error:"checkout_failed"}),{status:500,headers:H})}
});
