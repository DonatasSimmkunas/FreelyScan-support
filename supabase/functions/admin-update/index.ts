import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
const ORIGINS=new Set(["https://vent.it.com","https://www.vent.it.com","https://vent-it-com.onrender.com"]);
const BASE_H={"access-control-allow-origin":"https://vent.it.com","access-control-allow-methods":"POST,OPTIONS","access-control-allow-headers":"content-type,authorization,apikey","content-type":"application/json"};
function txt(x:any,n=500){return x==null?null:String(x).replace(/[<>]/g,"").trim().slice(0,n)}
Deno.serve(async(req)=>{
 const origin=req.headers.get("origin")||"";const H={...BASE_H,"access-control-allow-origin":ORIGINS.has(origin)?origin:"https://vent.it.com","vary":"Origin"};
 if(origin&&!ORIGINS.has(origin))return new Response(JSON.stringify({error:"forbidden"}),{status:403,headers:H});
 if(req.method==="OPTIONS")return new Response("ok",{headers:H});if(req.method!=="POST")return new Response("{}",{status:405,headers:H});
 const auth=req.headers.get("authorization")||"";if(!auth.startsWith("Bearer "))return new Response(JSON.stringify({error:"unauthorized"}),{status:401,headers:H});
 const sb=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!),{data:u}=await sb.auth.getUser(auth.slice(7));if(!u.user)return new Response(JSON.stringify({error:"unauthorized"}),{status:401,headers:H});
 const {data:adm}=await sb.from("site_admins").select("role").eq("user_id",u.user.id).maybeSingle();if(!adm)return new Response(JSON.stringify({error:"forbidden"}),{status:403,headers:H});
 try{const b=await req.json();
  if(b.action==="product_override"){
   const sku=txt(b.sku,80);if(!sku)return new Response(JSON.stringify({error:"sku"}),{status:400,headers:H});
   const row:any={sku,updated_at:new Date().toISOString()};for(const k of ["title_override","description_override","lead_time_text","stock_status","image_override_url"])if(k in b)row[k]=txt(b[k],k==="description_override"?1000:500);if("store_price_override" in b)row.store_price_override=b.store_price_override===""||b.store_price_override==null?null:Number(b.store_price_override);if("is_hidden" in b)row.is_hidden=!!b.is_hidden;
   const {error}=await sb.from("product_overrides").upsert(row,{onConflict:"sku"});if(error)throw error;
  }else if(b.action==="order_status"){
   return new Response(JSON.stringify({error:"use_order_operations"}),{status:409,headers:H});
   const allowed=["request_received","payment_pending","paid","processing","shipped","cancelled","refunded"];if(!allowed.includes(b.status))throw new Error("status");const {error}=await sb.from("orders").update({status:b.status,updated_at:new Date().toISOString()}).eq("id",b.order_id);if(error)throw error;
  }else if(b.action==="image_review"){
   const allowed=["open","approved","rejected","fixed"];if(!allowed.includes(b.status))throw new Error("status");const {error}=await sb.from("image_review_queue").update({status:b.status,issue_detail:txt(b.issue_detail,1000),updated_at:new Date().toISOString()}).eq("sku",b.sku);if(error)throw error;
  }else return new Response(JSON.stringify({error:"action"}),{status:400,headers:H});
  return new Response(JSON.stringify({ok:true}),{headers:H});
 }catch(e){console.error(e);return new Response(JSON.stringify({error:"update_failed"}),{status:500,headers:H})}
});
