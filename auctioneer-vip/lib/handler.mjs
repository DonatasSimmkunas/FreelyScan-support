import {readFile} from 'node:fs/promises';
import {createDecipheriv} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCatalog} from './catalog.mjs';
import {createEmployerCatalog} from './employers.mjs';
import {createAuth} from './auth.mjs';
import {createCrawlerClient} from './crawler-client.mjs';
import {createLiveEmployerCatalog} from './live-employers.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const PUBLIC_FILES={
  '/vip/':['index.html','text/html; charset=utf-8'],
  '/vip/app.js':['app.js','text/javascript; charset=utf-8'],
  '/vip/styles.css':['styles.css','text/css; charset=utf-8'],
  '/vip/atmosphere.css':['atmosphere.css','text/css; charset=utf-8'],
  '/vip/music.js':['music.js','text/javascript; charset=utf-8'],
  '/vip/counter.js':['counter.js','text/javascript; charset=utf-8'],
  '/vip/crawler.js':['crawler.js','text/javascript; charset=utf-8'],
  '/vip/crawler.css':['crawler.css','text/css; charset=utf-8'],
  '/vip/fonts.css':['fonts.css','text/css; charset=utf-8'],
  '/vip/mottos.css':['mottos.css','text/css; charset=utf-8'],
  '/vip/mottos.js':['mottos.js','text/javascript; charset=utf-8'],
  '/vip/saved-searches.js':['saved-searches.js','text/javascript; charset=utf-8'],
  '/vip/saved-searches.css':['saved-searches.css','text/css; charset=utf-8'],
  '/vip/experience.js':['experience.js','text/javascript; charset=utf-8'],
  '/vip/experience.css':['experience.css','text/css; charset=utf-8'],
  '/vip/hologram.js':['hologram.js','text/javascript; charset=utf-8'],
  '/vip/hologram.css':['hologram.css','text/css; charset=utf-8'],
  '/vip/holo-cards.js':['holo-cards.js','text/javascript; charset=utf-8'],
  '/vip/holo-cards.css':['holo-cards.css','text/css; charset=utf-8'],
  '/vip/fonts/manrope-latin.woff2':['fonts/manrope-latin.woff2','font/woff2'],
  '/vip/fonts/manrope-latin-ext.woff2':['fonts/manrope-latin-ext.woff2','font/woff2'],
  '/vip/fonts/space-grotesk-latin.woff2':['fonts/space-grotesk-latin.woff2','font/woff2'],
  '/vip/fonts/space-grotesk-latin-ext.woff2':['fonts/space-grotesk-latin-ext.woff2','font/woff2'],
  '/vip/login-art.png':['login-art.png','image/png'],
  '/vip/workspace-city.webp':['workspace-city.webp','image/webp'],
  '/vip/workspace-portrait.webp':['workspace-portrait.webp','image/webp'],
  '/vip/favicon.svg':['favicon.svg','image/svg+xml']
};
const HEADERS={
  'Cache-Control':'no-store, private','Pragma':'no-cache','X-Robots-Tag':'noindex, nofollow, noarchive',
  'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer',
  'Content-Security-Policy':"default-src 'self'; script-src 'self' https://www.youtube.com; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-src https://www.youtube-nocookie.com; media-src 'self' blob:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
  'Permissions-Policy':'camera=(), microphone=(), geolocation=()'
};
const CORS_METHODS=new Set(['GET','POST','OPTIONS']);
const CORS_HEADERS=new Set(['content-type','authorization','x-vip-csrf','x-vip-client']);
async function jsonBody(req){
  if(!(req.headers['content-type']||'').startsWith('application/json'))throw new Error('Reikia JSON užklausos.');
  let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>32_768)throw new Error('Užklausa per didelė.');chunks.push(chunk);}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
export async function createVipHandler(env=process.env){
  const production=!['development','test'].includes(env.NODE_ENV);
  const origin=new URL(env.VIP_PUBLIC_ORIGIN||'http://localhost:3000').origin;
  if(production&&!origin.startsWith('https://'))throw new Error('Produkcijoje būtinas HTTPS.');
  if(!/^[a-f\d]{64}$/.test(env.VIP_DATA_KEY||''))throw new Error('Nesukonfigūruotas duomenų raktas.');
  const auth=createAuth({username:env.VIP_USERNAME,passwordHash:env.VIP_PASSWORD_HASH,secure:production});
  const crawler=createCrawlerClient(env);
  const encrypted=await readFile(path.join(root,'private/catalog.enc'));
  const format=encrypted.subarray(0,4).toString();
  if(!['VIP1','VIP2'].includes(format))throw new Error('Neatpažintas duomenų failas.');
  const decipher=createDecipheriv('aes-256-gcm',Buffer.from(env.VIP_DATA_KEY,'hex'),encrypted.subarray(4,16));
  decipher.setAuthTag(encrypted.subarray(16,32));
  const plaintext=Buffer.concat([decipher.update(encrypted.subarray(32)),decipher.final()]);
  const payload=JSON.parse((format==='VIP2'?gunzipSync(plaintext):plaintext).toString('utf8'));
  const catalog=createCatalog(Array.isArray(payload)?payload:payload.providers);
  const employerPayload=Array.isArray(payload)?{companies:[],jobs:[],contactSources:[]}:payload.employers;
  const employers=createEmployerCatalog(employerPayload);
  const liveEmployers=createLiveEmployerCatalog(employerPayload,crawler);
  const catalogs={services:catalog,employers};
  const niches=[{id:'services',label:'Paslaugų teikėjai',total:catalog.metadata.total},{id:'employers',label:'Įmonės ieško darbininkų',total:employers.metadata.total}].filter(n=>n.total>0);
  const importedTotal=niches.reduce((sum,niche)=>sum+niche.total,0)+employers.metadata.jobsTotal;
  const importedContacts=Object.values(catalogs).reduce((sum,c)=>sum+c.search({withPhone:true}).total+c.search({withEmail:true}).total-c.search({withPhone:true,withEmail:true}).total,0);
  let cachedTotals={total:importedTotal,baseRecords:importedTotal,discoveredCompanies:0,contacts:importedContacts},totalsUntil=0,totalsPending=null;
  async function publicTotals(){
    if(Date.now()<totalsUntil)return cachedTotals;
    if(!totalsPending)totalsPending=(async()=>{
      const [result,live]=await Promise.all([crawler.request('status'),liveEmployers.getCatalog()]);
      if(result.status===200){
        const count=Number(result.data.totalCompanies),contacts=Number(result.data.contactCompanies);
        if(Number.isSafeInteger(count)&&count>=0&&count<=10_000_000){
          const extraCompanies=Math.max(0,count-(live.metadata.crawlerCompaniesTotal||0));
          const knownContacts=live.search({withPhone:true}).total+live.search({withEmail:true}).total-live.search({withPhone:true,withEmail:true}).total;
          const importedEmployerContacts=employers.search({withPhone:true}).total+employers.search({withEmail:true}).total-employers.search({withPhone:true,withEmail:true}).total;
          const extraContacts=Number.isSafeInteger(contacts)&&contacts>=0?Math.max(0,contacts-(live.metadata.crawlerContactCompaniesTotal||0)):0;
          cachedTotals={total:catalog.metadata.total+live.metadata.total+extraCompanies+live.metadata.jobsTotal,baseRecords:importedTotal,discoveredCompanies:live.metadata.total-employers.metadata.total+extraCompanies,contacts:importedContacts-importedEmployerContacts+knownContacts+extraContacts};
        }
      }
      totalsUntil=Date.now()+30_000;return cachedTotals;
    })().finally(()=>{totalsPending=null;});
    return totalsPending;
  }
  const chooseCatalog=async niche=>{const key=niche||'services';if(!Object.hasOwn(catalogs,key))throw new Error('Nežinoma paieškos skiltis.');return key==='employers'?liveEmployers.getCatalog():catalog;};
  let crawlerRevision='';
  function updateCrawlerRevision(status){
    const revision=JSON.stringify([status.lastRun,status.totalCompanies,status.totalJobs,status.contactCompanies]);
    if(revision!==crawlerRevision){crawlerRevision=revision;liveEmployers.invalidate();totalsUntil=0;}
  }
  const assets=new Map(await Promise.all(Object.entries(PUBLIC_FILES).map(async([url,[file,type]])=>[url,{body:await readFile(path.join(root,'public',file)),type}])));
  return async function vipHandler(req,res){
    let cors={};
    const send=(status,data,type='application/json; charset=utf-8',extra={})=>{res.writeHead(status,{...HEADERS,...cors,'Content-Type':type,...extra});res.end(req.method==='HEAD'?undefined:(type.startsWith('application/json')?JSON.stringify(data):data));};
    try{
      const url=new URL(req.url,'http://local');
      if(url.pathname!=='/vip'&&!url.pathname.startsWith('/vip/'))return false;
      if(url.pathname==='/vip'){send(308,'','text/plain',{Location:'/vip/'});return true;}
      if(assets.has(url.pathname)&&['GET','HEAD'].includes(req.method)){const a=assets.get(url.pathname);send(200,a.body,a.type);return true;}
      if(!url.pathname.startsWith('/vip/api/')){send(404,{error:'Nerasta.'});return true;}
      cors={Vary:'Origin'};
      if(req.headers.origin!==undefined&&req.headers.origin!==origin){send(403,{error:'Užklausa atmesta.'});return true;}
      if(req.headers.origin===origin)cors['Access-Control-Allow-Origin']=origin;
      if(req.method==='OPTIONS'){
        const method=req.headers['access-control-request-method'];
        const rawHeaders=req.headers['access-control-request-headers'];
        const requestedHeaders=rawHeaders===undefined?[]:typeof rawHeaders==='string'?rawHeaders.split(',').map(h=>h.trim().toLowerCase()):[''];
        if(req.headers.origin!==origin||!CORS_METHODS.has(method)||requestedHeaders.some(h=>!CORS_HEADERS.has(h))){send(403,{error:'Užklausa atmesta.'});return true;}
        send(204,'','text/plain; charset=utf-8',{
          'Access-Control-Allow-Methods':'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers':'Content-Type, Authorization, X-VIP-CSRF, X-VIP-Client',
          Vary:'Origin, Access-Control-Request-Method, Access-Control-Request-Headers'
        });return true;
      }
      if(req.method==='POST'&&req.headers.origin!==origin){send(403,{error:'Užklausa atmesta.'});return true;}
      if(url.pathname==='/vip/api/totals'&&req.method==='GET'){send(200,await publicTotals());return true;}
      if(url.pathname==='/vip/api/login'&&req.method==='POST'){
        const body=await jsonBody(req);
        const ip=env.VIP_TRUSTED_IP_HEADER?String(req.headers[env.VIP_TRUSTED_IP_HEADER.toLowerCase()]||req.socket.remoteAddress).split(',')[0]:req.socket.remoteAddress;
        const result=await auth.login(body.username,body.password,ip);
        if(result.status===200){
          const staticClient=req.headers['x-vip-client']==='static';
          send(200,{username:result.session.username,csrf:result.session.csrf,...(staticClient?{accessToken:result.token}:{})},undefined,staticClient?{}:{'Set-Cookie':result.cookie});
        }
        else send(result.status,{error:result.status===429?'Per daug bandymų. Pabandykite vėliau.':'Neteisingas vartotojo vardas arba slaptažodis.'},undefined,result.retryAfter?{'Retry-After':String(result.retryAfter)}:{});
        return true;
      }
      const s=auth.session(req.headers.cookie,req.headers.authorization);
      if(!s){send(401,{error:'Prisijunkite, kad matytumėte duomenis.'});return true;}
      if(req.method==='POST'&&!auth.csrfValid(s,req.headers['x-vip-csrf'])){send(403,{error:'Sesija neatitinka. Prisijunkite iš naujo.'});return true;}
      if(url.pathname==='/vip/api/session'&&req.method==='GET')send(200,{username:s.username,csrf:s.csrf});
      else if(url.pathname==='/vip/api/crawler/status'&&req.method==='GET'){
        const result=await crawler.request('status');if(result.status===200)updateCrawlerRevision(result.data);send(result.status,result.data);
      }
      else if(url.pathname==='/vip/api/crawler/search'&&req.method==='POST'){
        const result=await crawler.request('search',await jsonBody(req));send(result.status,result.data);
      }
      else if(url.pathname==='/vip/api/crawler/run'&&req.method==='POST'){
        await jsonBody(req);const result=await crawler.request('run');totalsUntil=0;liveEmployers.invalidate();if(result.status===200)updateCrawlerRevision(result.data);send(result.status,result.data);
      }
      else if(url.pathname==='/vip/api/metadata'&&req.method==='GET'){
        const selected=await chooseCatalog(url.searchParams.get('niche'));
        const live=await liveEmployers.getCatalog();
        send(200,{...selected.metadata,niches:niches.map(niche=>niche.id==='employers'?{...niche,total:live.metadata.total}:niche)});
      }
      else if(url.pathname==='/vip/api/search'&&req.method==='POST'){
        const input=await jsonBody(req);send(200,(await chooseCatalog(input.niche)).search(input));
      }
      else if(/^\/vip\/api\/employers\/[A-Za-z0-9_-]+$/.test(url.pathname)&&req.method==='GET'){
        const record=(await liveEmployers.getCatalog()).detail(url.pathname.split('/').at(-1));
        send(record?200:404,record||{error:'Įmonė nerasta.'});
      }
      else if(url.pathname==='/vip/api/logout'&&req.method==='POST'){
        const cookie=auth.logout(s);
        send(200,{ok:true},undefined,req.headers.authorization===undefined?{'Set-Cookie':cookie}:{});
      }
      else send(404,{error:'Nerasta.'});
    }catch(error){send(400,{error:error instanceof SyntaxError||error.code==='ERR_INVALID_URL'?'Neteisingas užklausos formatas.':String(error.message||'Užklausa nepavyko.').slice(0,200)});}
    return true;
  };
}
