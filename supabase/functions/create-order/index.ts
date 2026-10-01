import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { quota } from "../_shared/limits.ts";
const ORIGINS=new Set(["https://vent.it.com","https://www.vent.it.com","https://vent-it-com.onrender.com"]);
const BASE_CORS={"access-control-allow-origin":"https://vent.it.com","access-control-allow-headers":"content-type,authorization,apikey","access-control-allow-methods":"POST,OPTIONS","content-type":"application/json"};
const CATALOG="https://fihyzcabvrndsztlsufg.supabase.co/functions/v1/vent-shop-products";
function clean(s:any,n=180){return String(s??"").replace(/[<>]/g,"").trim().slice(0,n)}
function emailOK(s:string){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)&&s.length<200}
async function sendMail(to:string,subject:string,html:string){const key=Deno.env.get("RESEND_API_KEY");if(!key)return;try{await fetch("https://api.resend.com/emails",{method:"POST",headers:{authorization:"Bearer "+key,"content-type":"application/json"},body:JSON.stringify({from:"VENT IT <orders@vent.it.com>",to:[to],subject,html})})}catch(e){console.warn("email",e)}}
Deno.serve(async(req)=>{
 const origin=req.headers.get("origin")||"";const CORS={...BASE_CORS,"access-control-allow-origin":ORIGINS.has(origin)?origin:"https://vent.it.com","vary":"Origin"};
 if(origin&&!ORIGINS.has(origin))return new Response(JSON.stringify({error:"forbidden"}),{status:403,headers:CORS});
 if(req.method==="OPTIONS")return new Response("ok",{headers:CORS});if(req.method!=="POST")return new Response(JSON.stringify({error:"method"}),{status:405,headers:CORS});
 try{
  const body=await req.json(),email=clean(body.email,199),country=clean(body.country_code,2).toUpperCase(),language=["en","lt","no"].includes(body.language)?body.language:"en";
  if(!emailOK(email)||body.accept_terms!==true)return new Response(JSON.stringify({error:"email_and_terms_required"}),{status:400,headers:CORS});
  const address=body.delivery_address||{};
  if(!clean(body.name)||![address.street,address.city,address.postal_code,address.phone].every(v=>typeof v==='string'&&v.trim().length>0)||!['courier','collection'].includes(address.method)||!/^\+?[0-9 ()-]{6,30}$/.test(address.phone)||body.terms_version!=="2026-10-01-v2")return new Response(JSON.stringify({error:"delivery_details_required"}),{status:400,headers:CORS});
  const input=Array.isArray(body.items)?body.items.slice(0,120):[];if(!input.length)return new Response(JSON.stringify({error:"cart_empty"}),{status:400,headers:CORS});
  const sb=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  if(!await quota(sb,'order-email',email.toLowerCase(),5,3600))return new Response(JSON.stringify({error:'too_many_requests'}),{status:429,headers:{...CORS,'retry-after':'3600'}});
  if(!await quota(sb,'orders-global','all',100,3600))return new Response(JSON.stringify({error:'too_many_requests'}),{status:429,headers:CORS});
  const [catalog,{data:ovs},{data:z}]=await Promise.all([fetch(CATALOG).then(r=>r.json()),sb.from("product_overrides").select("*"),sb.from("shipping_zones").select("*").eq("country_code",country||"LT").maybeSingle()]);
  if(!z)return new Response(JSON.stringify({error:"delivery_country_not_supported"}),{status:400,headers:CORS});
  const bySku=new Map((catalog as any[]).map((p:any)=>[p.sku,p])),ov=new Map((ovs||[]).map((x:any)=>[x.sku,x]));
  const checkoutToken=crypto.randomUUID()+crypto.randomUUID();
  const checkoutTokenHash=[...new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(checkoutToken)))].map(b=>b.toString(16).padStart(2,"0")).join("");
  let subtotal=0,weight=0,volume=0;const items:any[]=[];
  for(const raw of input){const sku=clean(raw.sku,80),qty=Math.max(.01,Math.min(9999,Number(raw.qty)||1)),p:any=bySku.get(sku),o:any=ov.get(sku)||{};if(o.is_hidden)continue;const price=p?Math.round(Number(o.store_price_override??p.storePrice??0)*100)/100:0,model=clean(o.title_override||p?.model||raw.model||sku,220);subtotal+=price*qty;if(p){weight+=Number(p.weightKg||0)*qty;volume+=Number(p.dimensionsMm?.m3||0)*qty}items.push({sku,model,qty,unit_price_eur:price,line_total_eur:Math.round(price*qty*100)/100,metadata:{project_priced:!p||price<=0,note:clean(raw.note,300),lead_time:o.lead_time_text||null,stock_status:o.stock_status||null}})}
  if(!items.length)return new Response(JSON.stringify({error:"no_orderable_items"}),{status:400,headers:CORS});
  let shipping=0;if(z){const billable=Math.max(weight,volume*220);shipping=Number(z.base_eur||0)+billable*Number(z.kg_rate||0)+volume*Number(z.m3_rate||0);if(weight>30||volume>.25)shipping+=Number(z.oversize_eur||0)}
  shipping=Math.ceil(shipping*2)/2;subtotal=Math.round(subtotal*100)/100;const total=Math.round((subtotal+shipping)*100)/100;
  let user_id=null;const auth=req.headers.get("authorization")||"";if(auth.startsWith("Bearer ")){try{const {data}=await sb.auth.getUser(auth.slice(7));user_id=data.user?.id||null}catch{}}
  const {data:o,error:oe}=await sb.from("orders").insert({user_id,email,name:clean(body.name),company:clean(body.company),vat_id:clean(body.vat_id,60),country_code:country||"LT",language,subtotal_eur:subtotal,shipping_eur:shipping,total_eur:total,status:"request_received",metadata:{checkout_token_hash:checkoutTokenHash,weight_kg:weight,volume_m3:volume,delivery_address:{street:clean(address.street,180),city:clean(address.city,100),postal_code:clean(address.postal_code,20),phone:clean(address.phone,30),method:address.method},terms_version:"2026-10-01-v2",terms_accepted_at:new Date().toISOString(),accept_terms:true,tax_status:"to_confirm_before_payment"}}).select("id,order_no,status,subtotal_eur,shipping_eur,total_eur").single();if(oe)throw oe;
  const {error:ie}=await sb.from("order_items").insert(items.map(x=>({...x,order_id:o.id})));if(ie)throw ie;
  const lines=items.map(x=>`<li>${x.model} × ${x.qty}${x.unit_price_eur>0?` — €${x.line_total_eur.toFixed(2)}`:" — project price"}</li>`).join("");
  const buyerMail=sendMail(email,`VENT IT — order request ${o.order_no}`,`<h2>Thank you</h2><p>We received your VENT IT order request <b>${o.order_no}</b>.</p><ul>${lines}</ul><p>Estimated catalog subtotal: €${subtotal.toFixed(2)}<br>Estimated shipping: €${shipping.toFixed(2)}</p><p>VAT/tax, availability, lead time and project-priced items are confirmed before payment.</p>`);
  const sellerMail=sendMail("sales@vent.it.com",`New VENT IT order request ${o.order_no}`,`<h2>${o.order_no}</h2><p>${email} · ${country}</p><ul>${lines}</ul><p>Total estimate €${total.toFixed(2)}</p>`);
  await Promise.allSettled([buyerMail,sellerMail]);
  return new Response(JSON.stringify({ok:true,...o,checkout_token:checkoutToken}),{headers:CORS});
 }catch(e){console.error(e);return new Response(JSON.stringify({error:"order_failed"}),{status:500,headers:CORS})}
});
