import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
Deno.serve(async req=>{
 if(req.method!=='GET')return new Response('',{status:405});
 const sb=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
 const {data,error}=await sb.from('site_settings').select('key').eq('key','commerce').maybeSingle();
 return new Response(JSON.stringify({ok:!error&&!!data,version:'launch-v2',checked_at:new Date().toISOString()}),{status:error||!data?503:200,headers:{'content-type':'application/json','cache-control':'no-store'}});
});
