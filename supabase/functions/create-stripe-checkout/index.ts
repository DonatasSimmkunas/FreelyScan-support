import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
const ALLOWED_ORIGINS=new Set(["https://vent.it.com","https://www.vent.it.com","https://vent-it-com.onrender.com"]);
Deno.serve(async(req)=>{
 const origin=req.headers.get("origin")||"";
 const site=ALLOWED_ORIGINS.has(origin)?origin:"https://vent.it.com";
 const H={"access-control-allow-origin":site,"access-control-allow-methods":"POST,OPTIONS","access-control-allow-headers":"content-type,authorization,apikey","vary":"Origin","content-type":"application/json"};
 if(origin&&!ALLOWED_ORIGINS.has(origin))return new Response(JSON.stringify({error:"forbidden"}),{status:403,headers:H});
 if(req.method!=="POST"&&req.method!=="OPTIONS")return new Response(JSON.stringify({error:"method"}),{status:405,headers:H});
 if(req.method==="OPTIONS")return new Response("ok",{headers:H});
 const key=Deno.env.get("STRIPE_SECRET_KEY");if(!key)return new Response(JSON.stringify({configured:false,error:"stripe_not_configured"}),{status:503,headers:H});
 try{
  const {order_id,checkout_token,confirm_quote,shipping_eur,tax_note,lead_time}=await req.json();const sb=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const [{data:commerceRow},{data:companyRow}]=await Promise.all([
    sb.from("site_settings").select("value").eq("key","commerce").single(),
    sb.from("site_settings").select("value").eq("key","company").single()
  ]);
  const company=companyRow?.value||{};
  if(commerceRow?.value?.accept_card_payments!==true||!company.legal_name||!company.registered_address||!company.company_code)
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
  if(o.status==="paid")return new Response(JSON.stringify({error:"already_paid"}),{status:409,headers:H});
  if(o.metadata?.tax_status!=="confirmed")return new Response(JSON.stringify({error:"tax_not_confirmed"}),{status:409,headers:H});
  const {data:items}=await sb.from("order_items").select("*").eq("order_id",order_id);
  if(!items?.length||(items||[]).some((x:any)=>!Number.isFinite(Number(x.unit_price_eur))||Number(x.unit_price_eur)<=0||!Number.isInteger(Number(x.qty))||Number(x.qty)<1))return new Response(JSON.stringify({configured:true,error:"project_priced_items_require_quote"}),{status:409,headers:H});
  const form=new URLSearchParams();form.set("mode","payment");form.set("customer_email",o.email);form.set("success_url",`${site}/order-success.html?order=${encodeURIComponent(o.order_no)}&session_id={CHECKOUT_SESSION_ID}`);form.set("cancel_url",`${site}/#cart`);form.set("metadata[order_id]",o.id);form.set("metadata[order_no]",o.order_no);
  let n=0;for(const x of items||[]){form.set(`line_items[${n}][price_data][currency]`,"eur");form.set(`line_items[${n}][price_data][product_data][name]`,x.model);form.set(`line_items[${n}][price_data][product_data][metadata][sku]`,x.sku||"");form.set(`line_items[${n}][price_data][unit_amount]`,String(Math.round(Number(x.unit_price_eur)*100)));form.set(`line_items[${n}][quantity]`,String(Math.max(1,Math.round(Number(x.qty)))));n++}
  if(Number(o.shipping_eur)>0){form.set(`line_items[${n}][price_data][currency]`,"eur");form.set(`line_items[${n}][price_data][product_data][name]`,"Shipping estimate");form.set(`line_items[${n}][price_data][unit_amount]`,String(Math.round(Number(o.shipping_eur)*100)));form.set(`line_items[${n}][quantity]`,"1")}
  const cents=items.reduce((sum:number,x:any)=>sum+Math.round(Number(x.unit_price_eur)*100)*Number(x.qty),0)+Math.round(Number(o.shipping_eur)*100);
  if(cents!==Math.round(Number(o.total_eur)*100)||cents<=0)return new Response(JSON.stringify({error:"order_total_mismatch"}),{status:409,headers:H});
  const r=await fetch("https://api.stripe.com/v1/checkout/sessions",{method:"POST",headers:{authorization:"Bearer "+key,"content-type":"application/x-www-form-urlencoded","Idempotency-Key":"vent-checkout-"+o.id+"-"+(o.metadata.quote_confirmed_at||o.created_at)},body:form});
  const j=await r.json();if(!r.ok)throw new Error(j?.error?.message||"stripe_error");
  await sb.from("orders").update({status:"payment_pending",payment_provider:"stripe",payment_reference:j.id,updated_at:new Date().toISOString()}).eq("id",o.id);
  return new Response(JSON.stringify({configured:true,url:j.url,session_id:j.id}),{headers:H});
 }catch(e){console.error(e);return new Response(JSON.stringify({configured:true,error:"checkout_failed"}),{status:500,headers:H})}
});
