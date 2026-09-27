import {readFile,writeFile} from 'node:fs/promises';
import {randomBytes,createCipheriv,createDecipheriv} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

// Run with --env-file=.env.local. Only encrypted data is written to the project.
// Existing credentials and the AES key stay unchanged; each import uses a fresh IV.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=process.argv[2];
if(!source||!/^[a-f\d]{64}$/.test(process.env.VIP_DATA_KEY||''))throw new Error('Reikia importo failo ir serverio rakto.');
const key=Buffer.from(process.env.VIP_DATA_KEY,'hex');
const previous=await readFile(path.join(root,'private/catalog.enc'));
const format=previous.subarray(0,4).toString();
if(!['VIP1','VIP2'].includes(format))throw new Error('Nežinomas katalogo formatas.');
const decipher=createDecipheriv('aes-256-gcm',key,previous.subarray(4,16));
decipher.setAuthTag(previous.subarray(16,32));
const decrypted=Buffer.concat([decipher.update(previous.subarray(32)),decipher.final()]);
const existing=JSON.parse((format==='VIP2'?gunzipSync(decrypted):decrypted).toString('utf8'));
const providers=Array.isArray(existing)?existing:existing.providers;
const employers=JSON.parse(await readFile(path.resolve(source),'utf8'));
if(!Array.isArray(providers)||!providers.length||!Array.isArray(employers.companies)||!employers.companies.length||!Array.isArray(employers.jobs)||!Array.isArray(employers.contactSources))throw new Error('Nepilnas importo failas.');
const ids=new Set(employers.companies.map(c=>c.ID));
if(ids.size!==employers.companies.length||employers.jobs.some(j=>!ids.has(j['Darbdavio ID']))||employers.contactSources.some(c=>!ids.has(c['Darbdavio ID'])))throw new Error('Nesutampa įmonių ryšiai.');
const payload=Buffer.from(JSON.stringify({version:2,providers,employers}));
const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);
const ciphertext=Buffer.concat([cipher.update(gzipSync(payload)),cipher.final()]);
await writeFile(path.join(root,'private/catalog.enc'),Buffer.concat([Buffer.from('VIP2'),iv,cipher.getAuthTag(),ciphertext]));
console.log(JSON.stringify({providers:providers.length,companies:employers.companies.length,jobs:employers.jobs.length,contactSources:employers.contactSources.length,encryptedBytes:ciphertext.length+32,credentialsChanged:false}));
