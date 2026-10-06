// One-time, idempotent source corrections found by the Node syntax validator.
// The workflow commits the corrected source, not a runtime patch or skipped test.
import {readFile,writeFile} from 'node:fs/promises';
const fixes=[
 ['needs.js',"n.moderation_note?notice(n.moderation_note,'warning'):null);","n.moderation_note?notice(n.moderation_note,'warning'):null));"],
 ['access.js',"E('span',{},label)))));","E('span',{},label))))));"]
];
for(const [name,before,after] of fixes){
 const file=new URL(name,import.meta.url),source=await readFile(file,'utf8');
 if(source.includes(before)){
  if(source.split(before).length!==2)throw new Error('Correction must match exactly once: '+name);
  await writeFile(file,source.replace(before,()=>after));
 }else if(!source.includes(after))throw new Error('Expected reviewed correction is missing: '+name);
}
