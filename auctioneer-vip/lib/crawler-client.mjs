// The browser never receives this service credential or talks to the collector directly.
export function createCrawlerClient(env={},fetchImpl=fetch){
  const endpoint=env.VIP_CRAWLER_URL||'',token=env.VIP_CRAWLER_KEY||'';
  const configured=/^https:\/\/[a-z0-9]+\.supabase\.co\/functions\/v1\/auctioneer-vip-crawler$/.test(endpoint)&&/^[a-f0-9]{64}$/.test(token);
  return {configured,async request(action,input={}){
    if(!configured)return {status:503,data:{error:'Automatinis rinkimas dar neįjungtas.'}};
    if(!['status','search','run'].includes(action))return {status:400,data:{error:'Nežinomas veiksmas.'}};
    const text=(value,length)=>String(value??'').trim().slice(0,length);
    const payload={action};
    if(action==='search')Object.assign(payload,{
      q:text(input.q,300),kind:input.kind==='hiring'?'hiring':'all',
      legalForm:text(input.legalForm,150),city:text(input.city,150),
      page:Math.max(1,Math.min(100000,Math.floor(Number(input.page)||1))),
      pageSize:input.pageSize===50?50:25,sort:input.sort==='name'?'name':'newest'
    });
    try{
      const response=await fetchImpl(endpoint,{method:'POST',redirect:'error',headers:{'Content-Type':'application/json','X-VIP-Crawler-Token':token},body:JSON.stringify(payload),signal:AbortSignal.timeout(action==='run'?110000:15000)});
      if(Number(response.headers.get('content-length')||0)>4_000_000)throw new Error('size');
      const raw=await response.text();if(raw.length>4_000_000)throw new Error('size');
      const data=JSON.parse(raw);
      if(response.status===409||response.status===429)return {status:response.status,data:{error:response.status===409?'Rinkimas jau vyksta.':'Palaukite bent minutę prieš kitą rinkimą.',...(typeof data.cooldownUntil==='string'?{cooldownUntil:data.cooldownUntil}:{})}};
      if(!response.ok)return {status:502,data:{error:'Duomenų rinkimo tarnyba šiuo metu nepasiekiama. Pabandykite vėliau.'}};
      return {status:200,data};
    }catch{return {status:502,data:{error:'Nepavyko pasiekti duomenų rinkimo tarnybos. Pabandykite vėliau.'}};}
  }};
}
