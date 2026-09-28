import test from 'node:test';
import assert from 'node:assert/strict';
import {applyProviderDetails} from '../lib/provider-details.mjs';
import {createCatalog} from '../lib/catalog.mjs';
const record={id:1,provider:'Meistras',profile_url:'https://paslaugos.lt/meistras-ab123',category:'2026-09-01',company_phone:'+37060000000'};
const detail={id:1,provider:record.provider,profile_url:record.profile_url,category:'Apsaugos sistemos',service_description:'Montuoja kameras ir LED juostas.',company_phone:'must not replace'};
test('reviewed descriptions become searchable while contacts and valid categories remain unchanged',()=>{
 const rows=applyProviderDetails([record,{...record,id:2,category:'Elektrikai'}],[detail,{...detail,id:2}]);
 assert.equal(rows[0].company_phone,record.company_phone);assert.equal(rows[0].category,'Apsaugos sistemos');assert.equal(rows[1].category,'Elektrikai');assert.equal(record.category,'2026-09-01');
 const catalog=createCatalog(rows);assert.equal(catalog.search({q:'LED'}).total,2);assert.equal(catalog.search({rules:[{field:'service_description',op:'contains',value:'kameras'}]}).total,2);assert.ok(catalog.metadata.fields.some(f=>f.key==='service_source_url'));
});
test('mismatched and duplicate identities fail rather than applying descriptions to another person',()=>{
 for(const patch of [{id:3},{provider:'Kitas'},{profile_url:'https://paslaugos.lt/other-ab123'},{service_description:''}])assert.throws(()=>applyProviderDetails([record],[{...detail,...patch}]));
 assert.throws(()=>applyProviderDetails([record],[detail,detail]));assert.deepEqual(applyProviderDetails([record]),[record]);
});
