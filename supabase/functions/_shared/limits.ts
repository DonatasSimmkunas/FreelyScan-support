export async function quota(sb:any,scope:string,identity:string,limit:number,seconds:number){
 const bucket=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(identity)))].map(b=>b.toString(16).padStart(2,'0')).join('');
 const {data,error}=await sb.rpc('vent_consume_quota',{p_scope:scope,p_bucket:bucket,p_limit:limit,p_seconds:seconds});
 if(error)throw new Error('quota_unavailable');return data===true;
}
