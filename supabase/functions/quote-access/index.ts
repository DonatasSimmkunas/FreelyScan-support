import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { createHash,timingSafeEqual } from "node:crypto";
const origins=new Set(['https://vent.it.com','https://www.vent.it.com','https://vent-it-com.onrender.com']);
Deno.serve(async req=>{
 const origin=req.headers.get('origin')||'',headers={'content-type':'application/json','cache-control':'no-store','access-control-allow-origin':origins.has(origin)?origin:'https://vent.it.com','access-control-allow-headers':'content-type','access-control-allow-methods':'POST,OPTIONS','vary':'Origin'};
 const reply=(b:unknown,s=200)=>new Response(JSON.stringify(b),{status:s,headers});
 if(req.method==='OPTIONS')return new Response('ok',{headers});if(req.method!=='POST'||(origin&&!origins.has(origin)))return reply({error:'forbidden'},403);
 try{
 const b=await req.json();if(typeof b.order!=='string'||b.order.length>80||typeof b.token!=='string'||b.token.length!==72)return reply({error:'not_found'},404);
 const sb=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
 const {data:o}=await sb.from('orders').select('*').eq('order_no',b.order).single();const q=o?.metadata?.quote,hash=createHash('sha256').update(b.token).digest('hex');
 if(!q||q.token_hash?.length!==64||!timingSafeEqual(new TextEncoder().encode(hash),new TextEncoder().encode(q.token_hash)))return reply({error:'not_found'},404);
 if(Date.parse(q.expires_at)<Date.now())return reply({error:'quote_expired'},410);
 if(b.action==='accept'){
  if(b.accept_terms!==true||b.version!==q.version)return reply({error:'terms_and_current_version_required'},400);
  const {data,error}=await sb.rpc('vent_accept_quote',{p_order:o.id,p_hash:hash,p_version:b.version});if(error)throw error;if(!data)return reply({error:'quote_changed'},409);
 }
 const {data:items}=await sb.from('order_items').select('sku,model,qty,unit_price_eur,line_total_eur').eq('order_id',o.id);
 const {data:company}=await sb.from('site_settings').select('value').eq('key','company').single();
 return reply({order_no:o.order_no,status:o.status,accepted:b.action==='accept'||!!q.accepted_at,quote:{version:q.version,expires_at:q.expires_at,tax_note:q.tax_note,lead_time:q.lead_time,return_cost_estimate:q.return_cost_estimate,warranty_note:q.warranty_note,terms_version:q.terms_version},items,subtotal_eur:o.subtotal_eur,shipping_eur:o.shipping_eur,total_eur:o.total_eur,currency:'EUR',recipient:{name:o.name,...o.metadata.delivery_address},seller:company?.value});
 }catch{return reply({error:'quote_unavailable'},502)}
});
