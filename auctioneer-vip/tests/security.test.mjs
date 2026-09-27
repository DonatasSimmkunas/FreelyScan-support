import test from 'node:test';
import assert from 'node:assert/strict';
import {scryptSync,randomBytes} from 'node:crypto';
import {createAuth} from '../lib/auth.mjs';
const password=randomBytes(18).toString('base64url');
const salt=randomBytes(24).toString('hex');
const passwordHash=`scrypt$32768$8$1$${salt}$${scryptSync(password,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024}).toString('hex')}`;
test('requires real password, uses secure HttpOnly cookie and validates CSRF',async()=>{
  const auth=createAuth({username:'tester',passwordHash});
  assert.equal((await auth.login('tester','wrong','one')).status,401);
  assert.equal((await auth.login('someone',password,'one')).status,401);
  const login=await auth.login('tester',password,'one');assert.equal(login.status,200);
  assert.match(login.cookie,/HttpOnly/);assert.match(login.cookie,/; Secure/);assert.match(login.cookie,/SameSite=Strict/);
  const s=auth.session(login.cookie);assert.equal(s.username,'tester');
  assert.equal(auth.csrfValid(s,'forged'),false);assert.equal(auth.csrfValid(s,s.csrf),true);
  auth.logout(s);assert.equal(auth.session(login.cookie),null);
});
test('rate-limits repeated failures before computing more password hashes',async()=>{
  const auth=createAuth({username:'tester',passwordHash});
  for(let i=0;i<8;i++)assert.equal((await auth.login('tester','wrong','attacker')).status,401);
  const blocked=await auth.login('tester',password,'attacker');assert.equal(blocked.status,429);assert.ok(blocked.retryAfter>0);
});
test('expires sessions after inactivity or maximum age',async()=>{
  let clock=1_000_000;const auth=createAuth({username:'tester',passwordHash,now:()=>clock});
  const login=await auth.login('tester',password,'one');assert.ok(auth.session(login.cookie));clock+=31*60_000;assert.equal(auth.session(login.cookie),null);
});
test('bearer sessions require canonical 32-byte tokens and never fall back to cookies',async()=>{
  const auth=createAuth({username:'tester',passwordHash});
  const first=await auth.login('tester',password,'one'),second=await auth.login('tester',password,'two');
  assert.match(first.token,/^[A-Za-z0-9_-]{43}$/);
  assert.equal(auth.session('',`Bearer ${first.token}`).token,first.token);
  assert.equal(auth.session(first.cookie,`Bearer ${second.token}`).token,second.token);
  const malformed=['',null,'Bearer short',`bearer ${first.token}`,`Bearer  ${first.token}`,`Bearer ${first.token}=`,`Bearer ${first.token}\n`,`Bearer ${randomBytes(32).toString('base64url')}`];
  for(const authorization of malformed)assert.equal(auth.session(first.cookie,authorization),null);
  const s=auth.session('',`Bearer ${first.token}`);auth.logout(s);
  assert.equal(auth.session('',`Bearer ${first.token}`),null);assert.equal(auth.session(first.cookie),null);
});
test('bearer sessions expire after inactivity and after eight hours despite ongoing use',async()=>{
  let clock=1_000_000;const auth=createAuth({username:'tester',passwordHash,now:()=>clock});
  const idle=await auth.login('tester',password,'one');clock+=31*60_000;
  assert.equal(auth.session('',`Bearer ${idle.token}`),null);
  const active=await auth.login('tester',password,'one');
  for(let i=0;i<16;i++){clock+=29*60_000;assert.ok(auth.session('',`Bearer ${active.token}`));}
  clock+=17*60_000;assert.equal(auth.session('',`Bearer ${active.token}`),null);
});
