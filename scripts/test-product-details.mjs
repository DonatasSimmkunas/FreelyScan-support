import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const context={window:{}};
vm.runInNewContext(fs.readFileSync('delivery-estimate.js','utf8'),context);
const delivery=context.window.VentDelivery;
for(const country of delivery.countries){
  const e=delivery.estimate({},country);
  assert(e.min>0&&e.max>=e.min&&e.buffer>=5);
}
assert(delivery.estimate({},'NO').max>delivery.estimate({},'LT').max);
assert(delivery.estimate({category:'AmberAir Compact CXP'},'LT').max>delivery.estimate({},'LT').max);
assert(delivery.estimate({stockStatus:'in_stock'},'LT').max<delivery.estimate({},'LT').min);
assert(delivery.estimate({weightKg:150},'LT').buffer>delivery.estimate({weightKg:10},'LT').buffer);
assert.equal(delivery.estimate({},'XX'),null);
assert.equal(delivery.estimate({stockStatus:'quote'},'LT'),null);
assert.equal(delivery.estimate({discontinued:true},'LT'),null);
const coverage=JSON.parse(fs.readFileSync('assets/product-details/coverage.json'));
let rows=0,documents=0;
for(const sku of coverage.skus){
  const p=JSON.parse(fs.readFileSync(`assets/product-details/${sku}.json`));
  assert.equal(p.sku,sku);
  assert(p.source.startsWith('https://select.salda.lt/Product/Index/')||p.sourceScope==='archived-model-manual');
  for(const section of p.sections)for(const row of section.rows){assert(row.length===3&&row[0]&&row[1]);assert(!row[1].includes('parameter.'));rows++;}
  for(const doc of p.documents){assert(/^https:\/\/(select|www)\.salda\.lt\//.test(doc.url));documents++;}
}
const standard=JSON.parse(fs.readFileSync('assets/product-details/AHU000658.json'));
const plus=JSON.parse(fs.readFileSync('assets/product-details/AHU001104.json'));
assert.equal(standard.sourceScope,'archived-model-manual');
const fanPower=p=>p.sections[0].rows.find(row=>row[0]==='Supply fan power')[1];
assert.notEqual(fanPower(standard),fanPower(plus));
console.log(JSON.stringify({products:coverage.matched,technicalRows:rows,documents,deliveryCountries:delivery.countries.length,checks:'passed'}));
