import {readFile} from 'node:fs/promises';
import {createDecipheriv} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCatalog} from './catalog.mjs';
import {createAuth} from './auth.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const PUBLIC_FILES={
  '/vip/':['index.html','text/html; charset=utf-8'],
  '/vip/app.js':['app.js','text/javascript; charset=utf-8'],
  '/vip/styles.css':['styles.css','text/css; charset=utf-8'],
  '/vip/music.js':['music.js','text/javascript; charset=utf-8'],
  '/vip/login-art.png':['login-art.png','image/png'],
  '/vip/favicon.svg':['favicon.svg','image/svg+xml']
};
const HEADERS={
  'Cache-Control':'no-store, private','Pragma':'no-cache','X-Robots-Tag':'noindex, nofollow, noarchive',
  'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer',
  'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-src https://www.youtube-nocookie.com; media-src 'self' blob:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
  'Permissions-Policy':'camera=(), microphone=(), geolocation=()'
};
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
  const encrypted=await readFile(path.join(root,'private/catalog.enc'));
  if(encrypted.subarray(0,4).toString()!=='VIP1')throw new Error('Neatpažintas duomenų failas.');
  const decipher=createDecipheriv('aes-256-gcm',Buffer.from(env.VIP_DATA_KEY,'hex'),encrypted.subarray(4,16));
  decipher.setAuthTag(encrypted.subarray(16,32));
  const catalog=createCatalog(JSON.parse(Buffer.concat([decipher.update(encrypted.subarray(32)),decipher.final()]).toString('utf8')));
  const assets=new Map(await Promise.all(Object.entries(PUBLIC_FILES).map(async([url,[file,type]])=>[url,{body:await readFile(path.join(root,'public',file)),type}])));
  return async function vipHandler(req,res){
    const send=(status,data,type='application/json; charset=utf-8',extra={})=>{res.writeHead(status,{...HEADERS,'Content-Type':type,...extra});res.end(req.method==='HEAD'?undefined:(type.startsWith('application/json')?JSON.stringify(data):data));};
    try{
      const url=new URL(req.url,'http://local');
      if(url.pathname!=='/vip'&&!url.pathname.startsWith('/vip/'))return false;
      if(url.pathname==='/vip'){send(308,'','text/plain',{Location:'/vip/'});return true;}
      if(assets.has(url.pathname)&&['GET','HEAD'].includes(req.method)){const a=assets.get(url.pathname);send(200,a.body,a.type);return true;}
      if(!url.pathname.startsWith('/vip/api/')){send(404,{error:'Nerasta.'});return true;}
      if(req.method==='POST'&&req.headers.origin!==origin){send(403,{error:'Užklausa atmesta.'});return true;}
      if(url.pathname==='/vip/api/login'&&req.method==='POST'){
        const body=await jsonBody(req);
        const ip=env.VIP_TRUSTED_IP_HEADER?String(req.headers[env.VIP_TRUSTED_IP_HEADER.toLowerCase()]||req.socket.remoteAddress).split(',')[0]:req.socket.remoteAddress;
        const result=await auth.login(body.username,body.password,ip);
        if(result.status===200)send(200,{username:result.session.username,csrf:result.session.csrf},undefined,{'Set-Cookie':result.cookie});
        else send(result.status,{error:result.status===429?'Per daug bandymų. Pabandykite vėliau.':'Neteisingas vartotojo vardas arba slaptažodis.'},undefined,result.retryAfter?{'Retry-After':String(result.retryAfter)}:{});
        return true;
      }
      const s=auth.session(req.headers.cookie);
      if(!s){send(401,{error:'Prisijunkite, kad matytumėte duomenis.'});return true;}
      if(req.method==='POST'&&!auth.csrfValid(s,req.headers['x-vip-csrf'])){send(403,{error:'Sesija neatitinka. Prisijunkite iš naujo.'});return true;}
      if(url.pathname==='/vip/api/session'&&req.method==='GET')send(200,{username:s.username,csrf:s.csrf});
      else if(url.pathname==='/vip/api/metadata'&&req.method==='GET')send(200,catalog.metadata);
      else if(url.pathname==='/vip/api/search'&&req.method==='POST')send(200,catalog.search(await jsonBody(req)));
      else if(url.pathname==='/vip/api/logout'&&req.method==='POST')send(200,{ok:true},undefined,{'Set-Cookie':auth.logout(s)});
      else send(404,{error:'Nerasta.'});
    }catch(error){send(400,{error:error instanceof SyntaxError||error.code==='ERR_INVALID_URL'?'Neteisingas užklausos formatas.':String(error.message||'Užklausa nepavyko.').slice(0,200)});}
    return true;
  };
}
