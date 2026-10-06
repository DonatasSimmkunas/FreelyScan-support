import { mkdir, rm, copyFile, cp, readdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
const root=process.cwd(),dist=resolve(root,'dist');
await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
const publicFiles=['index.html','planner.html','product.html','admin.html','quote.html','order-success.html','terms.html','privacy.html','returns.html','warranty.html','shipping.html','cookies.html','brand-image.js','product-enrichment.js','plan-geometry.js','plan-evidence.js','plan-jobs.js','plan-raster.js','plan-auto.js','plan-auto-ui.js','plan-ocr.js','plan-routing.js','plan-reliability.js','plan-reliability-ui.js','delivery-estimate.js','admin-operations.js','robots.txt','sitemap.xml'];
for(const name of publicFiles)await copyFile(join(root,name),join(dist,name));
await cp(join(root,'assets'),join(dist,'assets'),{recursive:true});
await writeFile(join(dist,'health.json'),JSON.stringify({version:'launch-v2',mode:'quotation',built_at:new Date().toISOString()}));
console.log('Public website built; server code, tests, cost data and setup documents excluded.');
