import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { quota } from "../_shared/limits.ts";
const origins=new Set(['https://vent.it.com','https://www.vent.it.com','https://vent-it-com.onrender.com']);
const allowed=new Set(['page_view','product_view','planner_open','planner_export','kit_generated','add_kit','cart_open','order_start','order_created','client_error','language_change','search','category_view','analytics_consent']);
Deno.serve(async req=>{
 const origin=req.headers.get('origin')||'',headers={'content-type':'application/json','access-control-allow-origin':origins.has(origin)?origin:'https://vent.it.com','access-control-allow-headers':'content-type','access-control-allow-methods':'POST,OPTIONS','vary':'Origin'};
 const reply=(b:unknown,s=200)=>new Response(JSON.stringify(b),{status:s,headers});if(req.method==='OPTIONS')return new Response('ok',{headers});if(req.method!=='POST'||!origins.has(origin))return reply({error:'forbidden'},403);
 try{const raw=await req.text();if(raw.length>10000)return reply({error:'too_large'},413);const b=JSON.parse(raw);if(!allowed.has(b.event_name)||typeof b.session_id!=='string')return reply({error:'invalid_event'},400);
 const sb=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);if(!await quota(sb,'events-session',b.session_id,120,3600)||!await quota(sb,'events-global','all',5000,3600))return reply({error:'rate_limited'},429);
 const safe:any={};for(const [k,v] of Object.entries(b.payload||{})){if(!['lines','total','country','payment','language','line','message','query_length','sku','model','category','tier','value'].includes(k))continue;if(typeof v==='number'&&Number.isFinite(v))safe[k]=v;else if(typeof v==='string')safe[k]=v.slice(0,200).replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g,'[email]').replace(/(?:token|secret|password|key)[=:]\s*[^\s]+/gi,'[redacted]')}
 const {error}=await sb.from('client_events').insert({session_id:b.session_id.slice(0,80),event_name:b.event_name,page:String(b.page||'').split(/[?#]/)[0].slice(0,180),referrer_host:String(b.referrer_host||'').slice(0,120),country_code:String(b.country_code||'').slice(0,2),language:['lt','en','no'].includes(b.language)?b.language:'en',payload:safe});if(error)throw error;
 return reply({ok:true});}catch{return reply({error:'event_unavailable'},503)}
});
