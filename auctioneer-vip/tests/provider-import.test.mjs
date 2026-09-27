import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {randomBytes,createCipheriv,createDecipheriv} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {mergeProviders,canonicalProfileUrl} from '../lib/provider-import.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),execute=promisify(execFile);
const provider=(overrides={})=>({provider:'Example Services',category:'Cleaning',...overrides});

test('new IDs follow the maximum while all existing records and IDs remain intact',()=>{
  const existing=[{id:5,...provider({company_phone:'+37060000001'})},{id:91,...provider({provider:'Other Services'})}];
  const snapshot=structuredClone(existing),result=mergeProviders(existing,[provider({provider:'New Company',category:'Construction'})]);
  assert.equal(result.providers.length,3);assert.deepEqual(result.providers.slice(0,2),existing);assert.deepEqual(existing,snapshot);assert.equal(result.providers[2].id,92);
});

test('canonical profile identity enriches blanks, keeps existing values and unions only explicit contacts/provenance',()=>{
  assert.equal(canonicalProfileUrl('http://www.example.lt/provider/?utm_source=x#top'),'example.lt/provider');
  const existing=[{id:1,...provider({profile_url:'https://example.lt/provider',price_value:0,company_phone:'+37060000001',city_area:'Vilnius'})}];
  const result=mergeProviders(existing,[provider({profile_url:'http://www.example.lt/provider/?utm_source=x',price_value:99,company_phone:'+37060000002',company_email:'hello@example.lt',city_area:'Kaunas',additional_source_url:'https://example.lt/contact',data_basis:'Provided spreadsheet',source_notes:'Explicit source note'})]);
  assert.equal(result.counts.added,0);assert.equal(result.providers[0].price_value,0);assert.equal(result.providers[0].city_area,'Vilnius');
  assert.equal(result.providers[0].company_phone,'+37060000001; +37060000002');assert.equal(result.providers[0].company_email,'hello@example.lt');
  assert.ok(result.decisions[0].conflictFields.includes('price_value'));assert.equal(result.providers[0].additional_source_url,'https://example.lt/contact');
});

test('shared websites, switchboard phones, generic labels, and different service categories do not collapse distinct records',()=>{
  const existing=[{id:1,...provider({provider:'UAB Brand',profile_url:'https://shared.example',company_phone:'+37060000001'})}];
  const incoming=[provider({provider:'MB Brand',profile_url:'https://shared.example'}),provider({provider:'Unrelated Brand',profile_url:'https://shared.example'}),provider({provider:'Other Business',company_phone:'+37060000001'}),provider({provider:'UAB Brand',category:'Design',profile_url:'https://shared.example',company_phone:'+37060000001'})];
  assert.equal(mergeProviders(existing,incoming).counts.added,4);
  assert.equal(mergeProviders([{id:10,...provider({provider:'Valymo paslaugos'})}],[provider({provider:'Valymo paslaugos'})]).counts.added,1);
});

test('normalized phone or email needs supporting identity and incoming duplicates merge without name-only matching',()=>{
  const existing=[{id:1,...provider({provider:'UAB Example Services',company_phone:'8 600 00001'})}];
  const result=mergeProviders(existing,[provider({provider:'Example Services',company_phone:'+370 600 00001',company_email:'INFO@example.lt'}),provider({provider:'Example Services',company_email:'info@EXAMPLE.lt',source_notes:'Second supplied observation'})]);
  assert.equal(result.counts.added,0);assert.equal(result.providers[0].company_phone,'8 600 00001');assert.equal(result.providers[0].company_email,'INFO@example.lt');
  assert.equal(mergeProviders(existing,[provider({provider:'UAB Example Services',company_phone:'+37060000099'})]).counts.added,1);
});

test('private import fingerprints make records without identifying contacts idempotent without trusting generic names',()=>{
  const incoming=[provider({provider:'Valymo paslaugos',source_row:8}),provider({provider:'Valymo paslaugos',source_row:9})];
  const first=mergeProviders([],incoming,{sourceFile:'supplied.xlsx'}),again=mergeProviders(first.providers,incoming,{sourceFile:'supplied.xlsx',priorImportKeys:first.importKeys});
  assert.equal(first.counts.added,2);assert.equal(again.counts.added,0);assert.deepEqual(again.providers,first.providers);assert.deepEqual(again.importKeys,first.importKeys);
});

test('CLI dry-run leaves ciphertext unchanged, apply preserves employer JSON, and reapply writes nothing',async()=>{
  const dir=await mkdtemp(path.join(root,'.provider-import-test-'));
  try{
    const key=randomBytes(32),iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);
    const employers={companies:[{ID:'company-one',note:'Original employer JSON — unchanged'}],jobs:[],contactSources:[]};
    const payload={version:2,providers:[{id:7,...provider()}],employers,existingMetadata:{retain:true}};
    const ciphertext=Buffer.concat([cipher.update(gzipSync(Buffer.from(JSON.stringify(payload)))),cipher.final()]);
    const original=Buffer.concat([Buffer.from('VIP2'),iv,cipher.getAuthTag(),ciphertext]);
    const catalog=path.join(dir,'catalog.enc'),input=path.join(dir,'candidates.json');await writeFile(catalog,original);
    await writeFile(input,JSON.stringify({sourceFile:'synthetic.xlsx',records:[provider({provider:'Private Synthetic Name',company_phone:'+37060000099',source_row:5})]}));
    const args=[path.join(root,'scripts/import-providers.mjs'),input,'--catalog',catalog],options={cwd:root,env:{...process.env,VIP_DATA_KEY:key.toString('hex')}};
    const dry=await execute(process.execPath,args,options);assert.equal(JSON.parse(dry.stdout).added,1);assert.ok((await readFile(catalog)).equals(original));assert.ok(!dry.stdout.includes('Private Synthetic Name'));assert.ok(!dry.stdout.includes('+37060000099'));
    const applied=await execute(process.execPath,[...args,'--apply'],options);assert.equal(JSON.parse(applied.stdout).catalogWritten,true);
    const encrypted=await readFile(catalog);assert.ok(!encrypted.subarray(4,16).equals(iv));
    const decipher=createDecipheriv('aes-256-gcm',key,encrypted.subarray(4,16));decipher.setAuthTag(encrypted.subarray(16,32));
    const result=JSON.parse(gunzipSync(Buffer.concat([decipher.update(encrypted.subarray(32)),decipher.final()])));
    assert.equal(JSON.stringify(result.employers),JSON.stringify(employers));assert.deepEqual(result.existingMetadata,payload.existingMetadata);assert.equal(result.providers[1].id,8);
    const repeat=await execute(process.execPath,[...args,'--apply'],options);assert.equal(JSON.parse(repeat.stdout).added,0);assert.equal(JSON.parse(repeat.stdout).catalogWritten,false);assert.ok((await readFile(catalog)).equals(encrypted));
  }finally{await rm(dir,{recursive:true,force:true});}
});
