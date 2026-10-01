import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
const ORIGINS=new Set(["https://vent.it.com","https://www.vent.it.com","https://vent-it-com.onrender.com"]);
const BASE_H={"access-control-allow-origin":"https://vent.it.com","access-control-allow-methods":"GET,OPTIONS","access-control-allow-headers":"content-type,authorization,apikey","content-type":"application/json"};
Deno.serve(async(req)=>{
 const origin=req.headers.get("origin")||"";const H={...BASE_H,"access-control-allow-origin":ORIGINS.has(origin)?origin:"https://vent.it.com","vary":"Origin"};
 if(origin&&!ORIGINS.has(origin))return new Response(JSON.stringify({error:"forbidden"}),{status:403,headers:H});
 if(req.method==="OPTIONS")return new Response("ok",{headers:H});
 const auth=req.headers.get("authorization")||"";if(!auth.startsWith("Bearer "))return new Response(JSON.stringify({error:"unauthorized"}),{status:401,headers:H});
 const sb=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);const jwt=auth.slice(7);const {data:u}=await sb.auth.getUser(jwt);if(!u.user)return new Response(JSON.stringify({error:"unauthorized"}),{status:401,headers:H});
 const {data:adm}=await sb.from("site_admins").select("role").eq("user_id",u.user.id).maybeSingle();if(!adm)return new Response(JSON.stringify({error:"forbidden"}),{status:403,headers:H});
 const [{data:orders},{data:events},{data:reviews},{data:overrides}]=await Promise.all([
  sb.from("orders").select("id,order_no,email,name,company,country_code,total_eur,status,created_at").order("created_at",{ascending:false}).limit(100),
  sb.from("client_events").select("event_name,created_at").gte("created_at",new Date(Date.now()-7*864e5).toISOString()).limit(5000),
  sb.from("image_review_queue").select("*").eq("status","open").limit(200),
  sb.from("product_overrides").select("*").limit(500)
 ]);
 const counts:any={};for(const e of events||[])counts[e.event_name]=(counts[e.event_name]||0)+1;
 return new Response(JSON.stringify({orders:orders||[],event_counts:counts,image_reviews:reviews||[],overrides:overrides||[]}),{headers:H});
});
