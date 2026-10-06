import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {Script} from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(dir,'..');
const modules=['telkinys-v14/core.js','telkinys-v14/market.js','telkinys-v14/account.js','telkinys-v14/community.js','telkinys-v14/admin.js','telkinys-v14/setup.js','telkinys-v14/legal.js','telkinys-v15/integration.js','telkinys-v15/market.js','telkinys-v15/needs.js','telkinys-v15/access.js','telkinys-v14/boot.js'];
function one(text,from,to){if(text.split(from).length!==2)throw new Error('Compatibility anchor must occur exactly once: '+from.slice(0,90));return text.replace(from,()=>to);}
const parts=[];
for(const name of modules){let text=await readFile(path.join(root,name),'utf8');
 if(name==='telkinys-v14/core.js'){
  text=one(text,"if(['message','thread','appointment'].includes(kind))","if(kind==='need')go({view:'need',id:n.reference_id});else if(['message','thread','appointment'].includes(kind))");
  text=one(text,"compare:'Palyginimas'","compare:'Palyginimas',needs:'Poreikiai ir susitarimai',need:'Poreikio pasiūlymai','need-new':'Naujas poreikis',access:'Kvietimai ir pagalba'");
 }
 new Script(text,{filename:name});parts.push('// '+name+'\n'+text);console.log('Syntax OK: '+name);
}
const javascript=parts.join('\n');new Script(javascript,{filename:'telkinys-v15.bundle.js'});
if(/\.(?:innerHTML|outerHTML)\s*=|insertAdjacentHTML\s*\(|document\.write\s*\(/.test(javascript))throw new Error('Unsafe HTML rendering sink.');
if(javascript.includes('</script'))throw new Error('Unexpected script terminator.');
const styles=(await readFile(path.join(root,'telkinys-v14/styles.css'),'utf8'))+'\n'+await readFile(path.join(dir,'styles.css'),'utf8');
let html=await readFile(path.join(root,'telkinys-v14/index.template.html'),'utf8');
html=one(html,'V14 · uždara beta','V15 · uždara beta');
html=one(html,'<title>Telkinys — pasakyk, ko reikia</title>','<title>Telkinys — pasakyk, ko reikia</title>\n<meta name="application-version" content="15.0.0-beta">');
html=one(html,'<nav class="navlinks" aria-label="Pagrindinė navigacija"><a href="/" data-nav>Ieškoti</a><a href="/?view=account&tab=listings" data-nav>Aš siūlau</a><a href="/?view=about" data-nav>Kaip veikia</a></nav>','<nav class="navlinks" aria-label="Pagrindinė navigacija"><a href="/" data-nav>Pasiūlymai</a><a href="/?view=needs" data-nav>Poreikiai</a><a href="/?view=needs&tab=provider" data-nav>Specialistams</a><a href="/?view=about" data-nav>Kaip veikia</a></nav>');
html=one(html,'<strong>Uždara beta.</strong> Registracija su kvietimu. Mokėjimų ir tapatybės patikrų ši versija neatlieka.','<strong>V15 · uždara beta.</strong> Registracija su kvietimu. <a href="/?view=access&kind=invite" data-nav>Prašyti kvietimo</a>. Mokėjimai neįjungti.');
html=one(html,'<a href="/?view=account&tab=saved" data-nav><span aria-hidden="true">♡</span>Išsaugota</a>','<a href="/?view=needs" data-nav><span aria-hidden="true">≡</span>Poreikiai</a>');
const hash=text=>createHash('sha256').update(text).digest('base64');
const csp=["default-src 'none'","script-src 'sha256-"+hash(javascript)+"'","style-src 'sha256-"+hash(styles)+"'","img-src 'self' data: blob: https:","connect-src https://telkinys.floot.app https://*.amazonaws.com https://*.s3.amazonaws.com wss:","font-src 'self'","base-uri 'none'","form-action 'none'","object-src 'none'"].join('; ');
html=one(html,'<!-- CSP -->','<meta http-equiv="Content-Security-Policy" content="'+csp+'">');html=one(html,'/* STYLES */',styles);html=one(html,'/* APPLICATION */',javascript);
if(/lake-stage|lake-source|stream-map/.test(html))throw new Error('Removed diagram reintroduced.');
const ids=[...html.slice(0,html.indexOf('<script>')).matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);if(new Set(ids).size!==ids.length)throw new Error('Duplicate static IDs.');
const out=path.join(root,'dist');await mkdir(out,{recursive:true});await writeFile(path.join(out,'index.html'),html);await writeFile(path.join(out,'robots.txt'),'User-agent: *\nAllow: /\n');
const manifest={version:'15.0.0-beta',phase:'closed_beta',sourceCommit:process.env.GITHUB_SHA||process.env.RENDER_GIT_COMMIT||null,sha256:createHash('sha256').update(html).digest('hex'),bytes:Buffer.byteLength(html),modules};await writeFile(path.join(out,'build.json'),JSON.stringify(manifest,null,2)+'\n');
if(process.argv.includes('--write-deployment-artifact')){await mkdir(path.join(root,'telkinys-deploy'),{recursive:true});await writeFile(path.join(root,'telkinys-deploy/index.html'),html);}
console.log(JSON.stringify(manifest,null,2));
