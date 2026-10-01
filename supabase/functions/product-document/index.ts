const ORIGINS=new Set(['https://vent.it.com','https://vent-it-com.onrender.com','https://vent.it.com:443']);
const HOSTS=new Set(['select.salda.lt','www.sorke.cz','www.salda.lt']);
const PUBLIC_KEY='sb_publishable_HtD7m9xbEc00YJbytJRrRA_UhtG-DJe';
const TYPES:Record<string,string>={pdf:'application/pdf',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',dxf:'application/octet-stream',dwg:'application/octet-stream',rfa:'application/octet-stream',zip:'application/zip'};
const MAX=50*1024*1024;
function allowed(u:URL){return u.protocol==='https:'&&HOSTS.has(u.hostname)&&!u.username&&!u.password&&!u.port;}
async function supplier(url:string){let u=new URL(url);for(let i=0;i<4;i++){if(!allowed(u))throw Error('unsafe_source');const r=await fetch(u,{redirect:'manual',signal:AbortSignal.timeout(30000)});if([301,302,303,307,308].includes(r.status)){const next=r.headers.get('location');await r.body?.cancel();if(!next)throw Error('source_unavailable');u=new URL(next,u);continue;}return r;}throw Error('source_unavailable');}
Deno.serve(async(req:Request)=>{
 const origin=req.headers.get('origin')||'',headers:Record<string,string>={'Access-Control-Allow-Origin':ORIGINS.has(origin)?origin:'https://vent.it.com','Access-Control-Allow-Headers':'apikey,content-type','Access-Control-Allow-Methods':'GET,OPTIONS','Vary':'Origin','X-Content-Type-Options':'nosniff'};
 const fail=(error:string,status:number)=>new Response(JSON.stringify({error}),{status,headers:{...headers,'content-type':'application/json','cache-control':'no-store'}});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='GET')return fail('method_not_allowed',405);
 // Public catalog documents only; the app key selects the authorized catalog client.
 if((req.headers.get('apikey')||new URL(req.url).searchParams.get('key'))!==PUBLIC_KEY)return fail('unauthorized',401);
 if(origin&&!ORIGINS.has(origin))return fail('forbidden_origin',403);
 const q=new URL(req.url).searchParams,sku=q.get('sku')||'',raw=q.get('doc')||'';
 if(!/^[A-Z0-9_-]{1,60}$/.test(sku)||!/^\d{1,4}$/.test(raw))return fail('invalid_document',400);
 try{
  const catalog=await fetch('https://vent-it-com.onrender.com/assets/product-details/'+encodeURIComponent(sku)+'.json',{signal:AbortSignal.timeout(15000)});
  if(!catalog.ok)return fail('not_found',404);
  const item=await catalog.json(),doc=item.sku===sku?item.documents?.[Number(raw)]:null;
  const type=String(doc?.type||'').toLowerCase();if(!doc||!TYPES[type])return fail('not_found',404);
  const r=await supplier(doc.url);if(!r.ok||!r.body)return fail('document_unavailable',502);
  const size=Number(r.headers.get('content-length'));if(size>MAX){await r.body.cancel();return fail('document_too_large',413);}
  const reader=r.body.getReader(),parts:Uint8Array[]=[];let total=0;
  while(true){const {value,done}=await reader.read();if(done)break;total+=value.length;if(total>MAX){await reader.cancel();return fail('document_too_large',413);}parts.push(value);}
  const bytes=new Uint8Array(total);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}
  if(!total)return fail('document_unavailable',502);
  const start=new TextDecoder().decode(bytes.subarray(0,512));
  if(/<(?:!doctype\s+html|html|script)/i.test(start))return fail('invalid_document_content',502);
  if(type==='pdf'&&!start.includes('%PDF-'))return fail('invalid_document_content',502);
  if(type==='png'&&!(bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71))return fail('invalid_document_content',502);
  if(['jpg','jpeg'].includes(type)&&!(bytes[0]===255&&bytes[1]===216))return fail('invalid_document_content',502);
  const name=String(doc.name||sku).replace(/[\r\n"\\/]/g,' ').slice(0,160)+'.'+type;
  return new Response(bytes,{headers:{...headers,'Content-Type':TYPES[type],'Content-Disposition':`attachment; filename="${sku}.${type}"; filename*=UTF-8''${encodeURIComponent(name)}`,'Cache-Control':'public,max-age=3600','Content-Length':String(total)}});
 }catch{return fail('document_unavailable',502);}
});
