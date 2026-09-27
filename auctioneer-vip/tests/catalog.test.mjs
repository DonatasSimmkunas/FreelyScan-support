import test from 'node:test';
import assert from 'node:assert/strict';
import {createCatalog,FIELDS,cleanCategory} from '../lib/catalog.mjs';
const base=Object.fromEntries(FIELDS.map(f=>[f.key,null]));
const data=[
  {...base,id:1,provider:'Žilvinas',category:'Stogai',price_raw:'10 €/h',price_value:10,price_unit:'€/h',city_area:'Vilnius, +30 km aplink',company_phone:'+370 612 34567',rating:5,reviews:20,experience_years:9,is_business:0},
  {...base,id:2,provider:'MB Ąžuolas',category:'Stogai',price_raw:'2 €/m2',price_value:2,price_unit:'€/m2',city_area:'Kaunas, visa Lietuva',company_email:'test@example.com',rating:4,reviews:2,experience_years:12,is_business:0},
  {...base,id:3,provider:'Jonas',price_raw:'€',city_area:'Vilnius, +100 km aplink',experience_years:0,is_business:0},
  {...base,id:4,provider:'Nulis',category:'Stogai',price_value:0,price_unit:'€/h',city_area:'Kaunas, +50 km aplink',rating:0,reviews:0,is_business:0}
];
const catalog=createCatalog(data);
test('keeps all 19 original fields and distinguishes missing prices from zero',()=>{
  assert.equal(FIELDS.length,19);assert.equal(catalog.metadata.total,4);
  assert.equal(catalog.metadata.missingPrice,1);assert.equal(catalog.metadata.businessFlagReliable,false);
  assert.deepEqual(catalog.search().records.map(r=>r.id),[4,2,1,3]);
  assert.deepEqual(catalog.search({sort:'price_desc'}).records.map(r=>r.id),[1,2,4,3]);
});
test('city matching uses base locality and nationwide expansion is explicit',()=>{
  assert.deepEqual(catalog.search({city:'Vilnius'}).records.map(r=>r.id),[1,3]);
  assert.deepEqual(catalog.search({city:'Vilnius',includeNationwide:true}).records.map(r=>r.id),[2,1,3]);
  assert.equal(catalog.search({city:'Vilnius',coverage:'30'}).total,1);
});
test('combined price, unit, category, contact and accent-insensitive filters',()=>{
  assert.equal(catalog.search({q:'azuolas'}).records[0].id,2);
  assert.equal(catalog.search({unit:'€/h',minPrice:1,maxPrice:20,withPhone:true}).records[0].id,1);
  assert.equal(catalog.search({unit:'€/h'}).mixedUnits,false);
  assert.equal(catalog.search().mixedUnits,true);
  assert.equal(catalog.search({withPrice:true}).total,3);
  assert.equal(catalog.search({withEmail:true}).total,1);
  assert.equal(catalog.search({category:'__missing__'}).total,1);
  assert.throws(()=>catalog.search({minPrice:30,maxPrice:10}));
});
test('every source field is filterable, with missing values and AND/OR logic',()=>{
  for(const f of FIELDS){const record=data.find(r=>r[f.key]!==null);if(record)assert.ok(catalog.search({rules:[{field:f.key,op:'eq',value:String(record[f.key])}]}).records.some(r=>r.id===record.id));}
  assert.equal(catalog.search({rules:[{field:'price_value',op:'missing'}]}).records[0].id,3);
  assert.equal(catalog.search({rules:[{field:'company_phone',op:'contains',value:'612345'}]}).records[0].id,1);
  assert.equal(catalog.search({rules:[{field:'experience_years',op:'gte',value:'9'},{field:'reviews',op:'gte',value:'10'}]}).total,1);
  assert.equal(catalog.search({ruleMode:'any',rules:[{field:'provider',op:'eq',value:'Jonas'},{field:'provider',op:'contains',value:'azuolas'}]}).total,2);
  assert.throws(()=>catalog.search({rules:[{field:'bad',op:'eq',value:'x'}]}));
});
test('numeric sort and pagination remain stable, nulls last',()=>{
  const many=createCatalog(Array.from({length:70},(_,i)=>({...data[0],id:i+1,price_value:i+1})));
  assert.equal(many.search({page:2,pageSize:25}).records[0].id,26);
  assert.equal(many.search({page:999}).page,3);
  assert.equal(many.search({page:'nonsense'}).page,1);
  assert.deepEqual(catalog.search({sort:'rating_desc'}).records.map(r=>r.id),[1,2,4,3]);
});
test('category noise is suppressed without removing records or changing meaningful categories',()=>{
  const original=[...['2026-09-01','2026/09/01','Paslaugos kategorija',' ',null,'Stogai'].map((category,i)=>({...data[0],id:i+1,category}))];
  const cleaned=createCatalog(original);
  assert.equal(cleaned.metadata.total,6);assert.deepEqual(cleaned.metadata.categories,['Stogai']);
  assert.equal(cleaned.search().records.filter(r=>r.category===null).length,5);
  assert.equal(original[0].category,'2026-09-01');
  assert.equal(cleanCategory('  Vidaus apdailos darbai  '),'Vidaus apdailos darbai');
  assert.equal(cleaned.search({q:'2026-09-01'}).total,0);
});
test('territory options contain only matches under the other active filters',()=>{
  assert.deepEqual(catalog.search({q:'azuolas'}).availableCities,['Kaunas']);
  assert.deepEqual(catalog.search({city:'Vilnius',withEmail:true}).availableCities,['Kaunas']);
  assert.equal(catalog.search({city:'Vilnius',withEmail:true}).total,0);
  assert.deepEqual(catalog.search({q:'not-present'}).availableCities,[]);
  assert.deepEqual(catalog.search({city:'Vilnius',withEmail:true,includeNationwide:true}).availableCities,['Kaunas','Vilnius']);
});
test('import provenance remains searchable and filterable without creating empty optional fields',()=>{
  const imported=createCatalog([...data,{...base,id:5,provider:'Naujas teikėjas',data_basis:'Svetainė',additional_source_url:'https://example.com/kontaktai',source_notes:'Papildomai patikslinti paslaugos apimtį.'}]);
  assert.equal(catalog.metadata.fields.length,19);
  assert.equal(imported.metadata.fields.length,22);
  assert.equal(imported.search({q:'patikslinti'}).records[0].id,5);
  assert.equal(imported.search({rules:[{field:'data_basis',op:'eq',value:'Svetainė'}]}).total,1);
});
