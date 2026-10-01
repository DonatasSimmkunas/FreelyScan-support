import fs from 'node:fs';import assert from 'node:assert/strict';
for(const name of ['supabase','scripts','PAYSERA-SETUP.md','package.json','launch-product-review.csv','.github'])assert(!fs.existsSync('dist/'+name),name+' must not be published');
for(const name of ['index.html','quote.html','warranty.html','admin-operations.js','assets/product-details/coverage.json'])assert(fs.existsSync('dist/'+name));
console.log('Public surface PASS: website assets present, server and operational files excluded.');
