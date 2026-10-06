import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Script } from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const source=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(source,'..');
const modules=['core.js','market.js','account.js','community.js','admin.js','setup.js','legal.js','boot.js'];
if(process.argv.includes('--apply-reviewed-fixes')){
 const fixes=JSON.parse(await readFile(path.join(source,'source-fixes.json'),'utf8'));
 for(const fix of fixes){
  if(!modules.includes(fix.file)||typeof fix.find!=='string'||!fix.find||typeof fix.replace!=='string')throw new Error('Invalid source fix.');
  const filename=path.join(source,fix.file);const before=await readFile(filename,'utf8');
  if(before.includes(fix.find)){
   if(before.split(fix.find).length!==2)throw new Error('Correction is not unique: '+fix.file);
   await writeFile(filename,before.replace(fix.find,fix.replace));
  }else if(!before.includes(fix.replace))throw new Error('Correction does not match: '+fix.file);
 }
}
let failed=false;const parts=[];
for(const name of modules){const text=await readFile(path.join(source,name),'utf8');try{new Script(text,{filename:name});console.log('Syntax OK: '+name);}catch(error){failed=true;console.error(error.stack);}parts.push('// '+name+'\n'+text);}
if(failed)throw new Error('Source validation failed; no release artifact produced.');
const javascript=parts.join('\n');new Script(javascript,{filename:'telkinys.bundle.js'});
if(/\.(?:innerHTML|outerHTML)\s*=|insertAdjacentHTML\s*\(|document\.write\s*\(/.test(javascript))throw new Error('Unsafe HTML rendering sink found.');
if(javascript.includes('</script'))throw new Error('Unexpected inline script terminator.');
const styles=await readFile(path.join(source,'styles.css'),'utf8');
const hash=text=>createHash('sha256').update(text).digest('base64');
const csp=["default-src 'none'","script-src 'sha256-"+hash(javascript)+"'","style-src 'sha256-"+hash(styles)+"'","img-src 'self' data: blob: https:","connect-src https://telkinys.floot.app https://*.amazonaws.com https://*.s3.amazonaws.com wss:","font-src 'self'","base-uri 'none'","form-action 'none'","object-src 'none'"].join('; ');
let html=await readFile(path.join(source,'index.template.html'),'utf8');
for(const token of ['<!-- CSP -->','/* STYLES */','/* APPLICATION */'])if(html.split(token).length!==2)throw new Error('Missing or duplicate build placeholder: '+token);
html=html.replace('<!-- CSP -->','<meta http-equiv="Content-Security-Policy" content="'+csp+'">').replace('/* STYLES */',()=>styles).replace('/* APPLICATION */',()=>javascript);
const target=path.join(root,'dist');await mkdir(target,{recursive:true});
await writeFile(path.join(target,'index.html'),html);
await writeFile(path.join(target,'robots.txt'),'User-agent: *\nAllow: /\n');
const manifest={version:'14.0.0-beta',phase:'closed_beta',sourceCommit:process.env.GITHUB_SHA||process.env.RENDER_GIT_COMMIT||null,sha256:createHash('sha256').update(html).digest('hex'),bytes:Buffer.byteLength(html),modules};
await writeFile(path.join(target,'build.json'),JSON.stringify(manifest,null,2)+'\n');
if(process.argv.includes('--write-deployment-artifact')){await mkdir(path.join(root,'telkinys-deploy'),{recursive:true});await writeFile(path.join(root,'telkinys-deploy','index.html'),html);}
console.log(JSON.stringify(manifest,null,2));
