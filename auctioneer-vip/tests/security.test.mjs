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
