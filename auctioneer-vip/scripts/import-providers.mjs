import {readFile,writeFile,rename,unlink,open} from 'node:fs/promises';
import {createCipheriv,createDecipheriv,randomBytes} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {mergeProviders} from '../lib/provider-import.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function parseArgs(args){
  const options={apply:false,catalog:path.join(root,'private/catalog.enc'),source:null,audit:null};
  for(let i=0;i<args.length;i++){const value=args[i];if(value==='--apply')options.apply=true;else if(['--audit','--catalog'].includes(value)){if(!args[i+1])throw new Error('Trūksta parametro kelio.');options[value.slice(2)]=path.resolve(args[++i]);}else if(value.startsWith('--')||options.source)throw new Error('Nežinomas importo parametras.');else options.source=path.resolve(value);}
  if(!options.source)throw new Error('Nurodykite paruoštą importo JSON failą.');
  if(options.audit&&(options.audit===root||options.audit.startsWith(root+path.sep)))throw new Error('Audito failas turi būti už projekto katalogo ribų.');
  if(options.audit&&[options.source,options.catalog].includes(options.audit))throw new Error('Audito failas negali pakeisti duomenų failo.');return options;
}
const parseJson=(value,message)=>{try{return JSON.parse(value);}catch{throw new Error(message);}};
try{
  const options=parseArgs(process.argv.slice(2));
  if(!/^[a-f\d]{64}$/.test(process.env.VIP_DATA_KEY||''))throw new Error('Nesukonfigūruotas duomenų raktas.');
  const key=Buffer.from(process.env.VIP_DATA_KEY,'hex'),before=await readFile(options.catalog);
  if(before.subarray(0,4).toString()!=='VIP2'||before.length<33)throw new Error('Reikalingas VIP2 katalogas.');
  const decipher=createDecipheriv('aes-256-gcm',key,before.subarray(4,16));decipher.setAuthTag(before.subarray(16,32));
  const bytes=Buffer.concat([decipher.update(before.subarray(32)),decipher.final()]);
  const existing=parseJson(gunzipSync(bytes).toString('utf8'),'Neteisingas katalogo JSON.'),incoming=parseJson(await readFile(options.source,'utf8'),'Neteisingas importo JSON.');
  if(!Array.isArray(existing.providers)||!existing.employers||!Array.isArray(incoming.records))throw new Error('Nepilnas katalogas arba importo failas.');
  const employersBefore=JSON.stringify(existing.employers);
  const result=mergeProviders(existing.providers,incoming.records,{sourceFile:String(incoming.sourceFile||path.basename(options.source)),priorImportKeys:existing.providerImportKeys||{}});
  const payload={...existing,providers:result.providers,providerImportKeys:result.importKeys};
  if(JSON.stringify(payload.employers)!==employersBefore)throw new Error('Darbdavių duomenys neturi keistis.');
  const changed=JSON.stringify(payload)!==JSON.stringify(existing);
  if(options.audit)await writeFile(options.audit,JSON.stringify({counts:result.counts,decisions:result.decisions},null,2),{mode:0o600});
  if(options.apply&&changed){
    const lockPath=options.catalog+'.import.lock',temporary=options.catalog+'.import-'+randomBytes(8).toString('hex')+'.tmp';
    let lock;
    try{
      lock=await open(lockPath,'wx',0o600);
      if(!(await readFile(options.catalog)).equals(before))throw new Error('Katalogas pasikeitė. Pakartokite peržiūrą.');
      const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);
      const ciphertext=Buffer.concat([cipher.update(gzipSync(Buffer.from(JSON.stringify(payload)))),cipher.final()]);
      const output=Buffer.concat([Buffer.from('VIP2'),iv,cipher.getAuthTag(),ciphertext]);
      const file=await open(temporary,'wx',0o600);try{await file.writeFile(output);await file.sync();}finally{await file.close();}
      await rename(temporary,options.catalog);
    }finally{await unlink(temporary).catch(()=>{});if(lock){await lock.close();await unlink(lockPath).catch(()=>{});}}
  }
  console.log(JSON.stringify({...result.counts,mode:options.apply?'apply':'dry-run',catalogWritten:options.apply&&changed,employersUnchanged:true,credentialsChanged:false,auditWritten:Boolean(options.audit)}));
}catch(error){
  const publicMessages=['Trūksta parametro kelio.','Nežinomas importo parametras.','Nurodykite paruoštą importo JSON failą.','Audito failas turi būti už projekto katalogo ribų.','Audito failas negali pakeisti duomenų failo.','Nesukonfigūruotas duomenų raktas.','Reikalingas VIP2 katalogas.','Neteisingas katalogo JSON.','Neteisingas importo JSON.','Nepilnas katalogas arba importo failas.','Katalogas pasikeitė. Pakartokite peržiūrą.'];
  console.error(JSON.stringify({error:publicMessages.includes(error.message)?error.message:'Importas nepavyko; duomenų failas nepakeistas.'}));process.exitCode=1;
}
