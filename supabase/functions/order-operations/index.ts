import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { createHash } from "node:crypto";
const origins=new Set(['https://vent.it.com','https://www.vent.it.com','https://vent-it-com.onrender.com']);
Deno.serve(async req=>{
 const origin=req.headers.get('origin')||'',headers={'content-type':'application/json','cache-control':'no-store','access-control-allow-origin':origins.has(origin)?origin:'https://vent.it.com','access-control-allow-headers':'authorization,content-type','access-control-allow-methods':'POST,OPTIONS','vary':'Origin'};
 const reply=(b:unknown,s=200)=>new Response(JSON.stringify(b),{status:s,headers});
 if(req.method==='OPTIONS')return new Response('ok',{headers});if(req.method!=='POST'||(origin&&!origins.has(origin)))return reply({error:'forbidden'},403);
 const sb=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
 const {data:u}=await sb.auth.getUser((req.headers.get('authorization')||'').replace(/^Bearer /i,''));
 if(!u.user)return reply({error:'unauthorized'},401);const {data:admin}=await sb.from('site_admins').select('role').eq('user_id',u.user.id).maybeSingle();if(!admin)return reply({error:'forbidden'},403);
 try{
 const b=await req.json();
 if(b.action==='procurement_list'||b.action==='procurement_save'){
  if(b.action==='procurement_save'&&(!b.row||!['purchase_net','landed_net','sale_net','stock_quantity','lead_days'].every(k=>Number.isFinite(Number(b.row[k]))&&Number(b.row[k])>=0)||Number(b.row.sale_net)<=Number(b.row.landed_net)))return reply({error:'positive_margin_and_evidence_required'},400);
  const {data,error}=await sb.rpc('vent_procurement',{p_row:b.action==='procurement_save'?b.row:null,p_admin:u.user.id});if(error)throw error;return reply({data});
 }
 const {data:o,error}=await sb.from('orders').select('*').eq('id',b.order_id).single();if(error||!o)return reply({error:'not_found'},404);
 const {data:items}=await sb.from('order_items').select('*').eq('order_id',o.id);
 if(b.action==='detail')return reply({order:o,items});
 if(b.action==='quote'){
  if(!Array.isArray(b.items)||new Set(b.items.map((x:any)=>x.id)).size!==items?.length||!b.items.every((x:any)=>items.some((i:any)=>i.id===x.id)&&Number.isFinite(Number(x.qty))&&Number(x.qty)>0&&Number.isFinite(Number(x.unit_price_eur))&&Number(x.unit_price_eur)>0))return reply({error:'all_item_prices_required'},400);
  for(const k of ['tax_note','lead_time','supplier_reference','carrier_reference','return_cost_estimate','warranty_note'])if(typeof b[k]!=='string'||b[k].trim().length<3)return reply({error:'quote_evidence_required',field:k},400);
  if(b.stock_confirmed!==true||b.specifications_confirmed!==true||!Number.isFinite(Number(b.shipping_eur))||Number(b.shipping_eur)<0)return reply({error:'stock_specs_and_freight_required'},400);
  const token=crypto.randomUUID()+crypto.randomUUID(),version=crypto.randomUUID();
  const quote={version,token_hash:createHash('sha256').update(token).digest('hex'),created_at:new Date().toISOString(),expires_at:new Date(Date.now()+7*864e5).toISOString(),terms_version:'2026-10-01-v2',shipping_eur:Number(b.shipping_eur),...Object.fromEntries(['tax_note','lead_time','supplier_reference','carrier_reference','return_cost_estimate','warranty_note'].map(k=>[k,b[k].trim().slice(0,500)])),stock_confirmed:true,specifications_confirmed:true,prices_include_applicable_tax:true};
  const {data,error}=await sb.rpc('vent_finalize_quote',{p_order:o.id,p_admin:u.user.id,p_quote:quote,p_items:b.items});if(error)throw error;
  return reply({...data,url:(origins.has(origin)?origin:'https://vent.it.com')+'/quote.html?order='+encodeURIComponent(o.order_no)+'&token='+token});
 }
 const m={...o.metadata},now=new Date().toISOString();let status=o.status;
 if(b.action==='fulfil'){
  if(!['paid','processing'].includes(o.status)||!m.quote?.accepted_at)return reply({error:'accepted_paid_order_required'},409);
  for(const k of ['invoice_no','supplier_order_reference'])if(typeof b[k]!=='string'||b[k].trim().length<2)return reply({error:'invoice_and_supplier_order_required'},400);
  m.fulfilment={...m.fulfilment,invoice_no:b.invoice_no.slice(0,100),supplier_order_reference:b.supplier_order_reference.slice(0,100),started_at:now};status='processing';
 }else if(b.action==='ship'){
  if(o.status!=='processing'||!m.fulfilment?.invoice_no)return reply({error:'processing_invoice_required'},409);
  if(!b.carrier||!b.tracking_number)return reply({error:'tracking_required'},400);
  m.fulfilment={...m.fulfilment,carrier:String(b.carrier).slice(0,100),tracking_number:String(b.tracking_number).slice(0,150),shipped_at:now};status='shipped';
 }else if(b.action==='cancel'){
  if(o.status!=='request_received')return reply({error:'unpaid_request_required'},409);status='cancelled';
 }else if(b.action==='return_request'){
  if(!['paid','processing','shipped'].includes(o.status)||!b.reason)return reply({error:'paid_order_and_reason_required'},409);
  m.return_request={reason:String(b.reason).slice(0,1000),opened_at:now,status:'awaiting_review'};
 }else if(b.action==='record_refund'){
  const previousRefunds=m.refunds|| (m.refund?[m.refund]:[]),refunded=previousRefunds.reduce((sum:number,x:any)=>sum+Number(x.amount_eur),0);
  if(previousRefunds.some((x:any)=>x.provider_reference===b.provider_reference)||!m.return_request||!Number.isFinite(Number(b.amount_eur))||Number(b.amount_eur)<=0||Math.round((refunded+Number(b.amount_eur))*100)>Math.round(Number(o.total_eur)*100)||typeof b.provider_reference!=='string'||b.provider_reference.length<3||b.transfer_completed!==true)return reply({error:'completed_refund_evidence_required'},409);
  m.refund={amount_eur:Number(b.amount_eur),provider_reference:b.provider_reference.slice(0,150),recorded_at:now,recorded_by:u.user.id};m.refunds=[...previousRefunds,m.refund];m.return_request={...m.return_request,status:'refund_recorded'};if(Math.round((refunded+Number(b.amount_eur))*100)===Math.round(Number(o.total_eur)*100))status='refunded';
 }else return reply({error:'unknown_action'},400);
 m.operations=[...(m.operations||[]).slice(-99),{action:b.action,at:now,by:u.user.id}];
 const {data:changed,error:saveError}=await sb.from('orders').update({status,metadata:m,updated_at:now}).eq('id',o.id).eq('updated_at',o.updated_at).select('id');if(saveError)throw saveError;if(!changed?.length)return reply({error:'order_changed_reload'},409);
 return reply({ok:true,status});
 }catch{return reply({error:'operation_failed'},500)}
});
