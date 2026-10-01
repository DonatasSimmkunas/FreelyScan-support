import {readdirSync} from 'node:fs';import {spawnSync} from 'node:child_process';
for(const f of readdirSync('scripts').filter(f=>/^test-.*\.mjs$/.test(f)&&f!=='test-build-surface.mjs')){const r=spawnSync(process.execPath,['scripts/'+f],{stdio:'inherit'});if(r.status)process.exit(r.status)}
