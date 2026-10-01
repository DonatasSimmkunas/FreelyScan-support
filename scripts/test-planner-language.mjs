import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const html=fs.readFileSync('planner.html','utf8'),c={};vm.runInNewContext(html.slice(html.indexOf('const I18N='),html.indexOf('function defaultState()'))+';this.I18N=I18N',c);
let count=0;function check(fn){fn();count++}
for(const lang of ['lt','en','no']){
 check(()=>assert.equal(Object.keys(c.I18N.en).filter(k=>!c.I18N[lang][k]).length,0,lang+' missing translation'));
 check(()=>assert.equal([...html.matchAll(/data-i18n="([^"]+)"/g)].filter(m=>!c.I18N[lang][m[1]]).length,0,lang+' static key missing'));
 check(()=>assert.ok(!/requires sign-in|reikia prisijungti|krever innlogging/.test(c.I18N[lang].guideStep3Text),'guide no longer requires authentication'));
 c.state={lang};c.t=k=>c.I18N[lang][k];
 check(()=>assert.equal(c.localizedFloorName(2),{lt:'2 aukštas',en:'Floor 2',no:'2. etasje'}[lang]));
 check(()=>assert.equal(c.recognitionNote('Missing room identifiers: 1-2, 1-3'),c.I18N[lang].uncertaintyIds+'1-2, 1-3'));
}
const r=fs.readFileSync('plan-reliability-ui.js','utf8'),rc={};vm.runInNewContext(r.slice(r.indexOf(' const COPY='),r.indexOf(' const LABELS='))+';this.copy=COPY',rc);
for(const lang of ['lt','en','no'])check(()=>assert.equal(Object.keys(rc.copy.en).filter(k=>!rc.copy[lang][k]).length,0,lang+' reliability missing key'));
const au=fs.readFileSync('plan-auto-ui.js','utf8'),ac={state:{lang:'no'}};vm.runInNewContext(au.slice(au.indexOf(' const NO='),au.indexOf(' const area='))+';this.localize=lt;this.dictionary=NO',ac);
// Exercise real translation helper for each two-argument auto-processing message.
for(const m of au.matchAll(/lt\('((?:\\.|[^'\\])*)','((?:\\.|[^'\\])*)'\)/g))check(()=>{const a=m[1],b=m[2];assert.ok(ac.dictionary[b],'Missing NO: '+b);assert.notEqual(ac.localize(a,b),b,'NO fallback: '+b)});
const inline=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);for(const script of inline)check(()=>new vm.Script(script));
console.log(count+' planner language checks PASS (LT / EN / NO, auto status, reliability, guide, floors, identifiers, inline syntax).');
