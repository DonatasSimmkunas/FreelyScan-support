import {randomBytes,scrypt as scryptCallback,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(scryptCallback);
const equal=(a,b)=>{const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&timingSafeEqual(x,y);};
export function createAuth({username,passwordHash,secure=true,now=()=>Date.now()}) {
  const parts=String(passwordHash||'').split('$');
  if(!username||parts.length!==6||parts[0]!=='scrypt'||parts[1]!=='32768'||parts[2]!=='8'||parts[3]!=='1'||!/^[a-f\d]{48}$/.test(parts[4])||!/^[a-f\d]{128}$/.test(parts[5]))throw new Error('Nesukonfigūruotas VIP prisijungimas.');
  const sessions=new Map(),attempts=new Map();let inFlight=0;
  const cookieName=secure?'__Secure-auctioneer_vip':'auctioneer_vip_local';
  const cookie=(token,maxAge)=>`${cookieName}=${token}; Path=/vip; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure?'; Secure':''}`;
  function clean(){const t=now();for(const [id,s]of sessions)if(t>s.expires||t-s.seen>30*60_000)sessions.delete(id);for(const [k,a]of attempts)if(t>a.until)attempts.delete(k);}
  function session(header='') {
    clean();const token=header.split(';').map(c=>c.trim()).find(c=>c.startsWith(cookieName+'='))?.slice(cookieName.length+1);
    const s=token?sessions.get(token):null;if(!s)return null;s.seen=now();return {...s,token};
  }
  async function login(suppliedUser,suppliedPassword,ip){
    clean();
    const keys=[`ip:${ip}`,'global'];const limits=[8,100];
    for(let i=0;i<keys.length;i++){const a=attempts.get(keys[i]);if(a&&a.count>=limits[i])return {status:429,retryAfter:Math.ceil((a.until-now())/1000)};}
    if(inFlight>=4)return{status:429,retryAfter:5};
    if(typeof suppliedUser!=='string'||typeof suppliedPassword!=='string'||suppliedUser.length>100||suppliedPassword.length>512)return{status:400};
    for(const k of keys){const a=attempts.get(k)||{count:0,until:now()+15*60_000};a.count++;attempts.set(k,a);}
    inFlight++;
    let derived;try{derived=await scrypt(suppliedPassword,parts[4],64,{N:32768,r:8,p:1,maxmem:64*1024*1024});}finally{inFlight--;}
    const validPassword=timingSafeEqual(derived,Buffer.from(parts[5],'hex'));
    if(!validPassword||!equal(suppliedUser,username))return{status:401};
    attempts.delete(keys[0]);
    if(sessions.size>=5000)sessions.delete(sessions.keys().next().value);
    const token=randomBytes(32).toString('base64url');
    const s={username,csrf:randomBytes(24).toString('base64url'),created:now(),seen:now(),expires:now()+8*60*60_000};
    sessions.set(token,s);return{status:200,session:s,cookie:cookie(token,8*60*60)};
  }
  function logout(s){if(s)sessions.delete(s.token);return cookie('',0);}
  return{login,session,logout,csrfValid:(s,t)=>typeof t==='string'&&equal(s.csrf,t)};
}
