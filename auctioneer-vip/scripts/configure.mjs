import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {scryptSync,randomBytes,createCipheriv} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

// Credentials arrive only on stdin. This script never logs secrets.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
let input='';for await(const chunk of process.stdin)input+=chunk;
const {username,password,recordsPath,origin='http://localhost:3000'}=JSON.parse(input);
if(!username||typeof password!=='string'||password.length<8||!recordsPath)throw new Error('Trūksta konfigūracijos.');
const salt=randomBytes(24).toString('hex');
const hash=scryptSync(password,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024}).toString('hex');
const key=randomBytes(32),iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);
const plaintext=await readFile(recordsPath);
const records=JSON.parse(plaintext);
if(!Array.isArray(records)||!records.length)throw new Error('Nėra duomenų.');
const encrypted=Buffer.concat([cipher.update(plaintext),cipher.final()]);
await mkdir(path.join(root,'private'),{recursive:true});
await writeFile(path.join(root,'private/catalog.enc'),Buffer.concat([Buffer.from('VIP1'),iv,cipher.getAuthTag(),encrypted]));
await writeFile(path.join(root,'.env.local'),`NODE_ENV=development\nPORT=3000\nVIP_PUBLIC_ORIGIN=${origin}\nVIP_USERNAME=${username}\nVIP_PASSWORD_HASH=scrypt$32768$8$1$${salt}$${hash}\nVIP_DATA_KEY=${key.toString('hex')}\n`,{mode:0o600});
console.log(JSON.stringify({configured:true,records:records.length,credentialsLogged:false}));
