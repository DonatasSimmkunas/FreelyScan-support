import test from 'node:test';
import assert from 'node:assert/strict';
import {sanitizeSearchSnapshot,parseSavedSearches,serializeSavedSearches,savedSearchStorageKey,MAX_SAVED_SEARCHES} from '../public/saved-searches.js';

test('complete provider filters survive while records, session values and hidden niche fields do not',()=>{
  const input={niche:'services',q:'langai',category:'Langų valymas',city:'Vilnius',coverage:'50',unit:'€/m2',minPrice:'2.5',maxPrice:'30',includeNationwide:true,withPhone:true,withEmail:true,withPrice:true,sort:'price_desc',pageSize:50,ruleMode:'any',rules:[{field:'price_value',op:'gte',value:'3'},{field:'additional_source_url',op:'present',value:''}],page:9,accessToken:'secret',csrf:'secret',password:'secret',records:[{provider:'private'}],employerType:'hidden'};
  const clean=sanitizeSearchSnapshot(input),serialized=serializeSavedSearches([{id:'search-1',title:'Mano paieška',filters:input,records:input.records,accessToken:'secret'}]);
  assert.deepEqual(clean,{niche:'services',q:'langai',category:'Langų valymas',city:'Vilnius',withPhone:true,withEmail:true,sort:'price_desc',page:1,pageSize:50,rules:input.rules,ruleMode:'any',includeNationwide:true,coverage:'50',unit:'€/m2',minPrice:'2.5',maxPrice:'30',withPrice:true});
  assert.doesNotMatch(serialized,/secret|private|records|accessToken|csrf|password|employerType/);
  assert.deepEqual(parseSavedSearches(serialized),[{id:'search-1',title:'Mano paieška',filters:clean}]);
});

test('employer filters preserve all controls and discard irrelevant pricing filters',()=>{
  const clean=sanitizeSearchSnapshot({niche:'employers',q:'driver',employerType:'Įmonė',contactStatus:'Yra kontaktai',portal:'CVbankas',sort:'jobs_asc',pageSize:100,withPhone:true,withPrice:true,minPrice:'7',includeNationwide:true,rules:[{field:'jobs_count',op:'gte',value:'2'},{field:'company_code',op:'eq',value:'123'}]});
  assert.equal(clean.employerType,'Įmonė');assert.equal(clean.contactStatus,'Yra kontaktai');assert.equal(clean.portal,'CVbankas');assert.equal(clean.sort,'jobs_asc');assert.equal(clean.pageSize,100);assert.equal(clean.rules.length,2);
  for(const key of ['minPrice','maxPrice','withPrice','includeNationwide','coverage','unit'])assert.equal(Object.hasOwn(clean,key),false);
});

test('storage parsing is bounded and rejects malformed or unapproved rule fields',()=>{
  for(const raw of ['', '{broken',null,'null','[]',JSON.stringify({version:2,searches:[]}), 'x'.repeat(400001)])assert.deepEqual(parseSavedSearches(raw),[]);
  assert.equal(sanitizeSearchSnapshot({niche:'__proto__'}),null);
  const filters=sanitizeSearchSnapshot({niche:'services',q:'x'.repeat(500),sort:'evil',pageSize:999,includeNationwide:true,withPhone:'true',rules:[{field:'accessToken',op:'eq',value:'secret'},{field:'provider',op:'gte',value:'10'},{field:'price_value',op:'lte',value:'NaN'},{field:'provider',op:'missing',value:'discard me'},{field:'source_notes',op:'contains',value:'x'.repeat(800)}]});
  assert.equal(filters.q.length,300);assert.equal(filters.sort,'price_asc');assert.equal(filters.pageSize,25);assert.equal(filters.includeNationwide,false);assert.equal(filters.withPhone,false);
  assert.deepEqual(filters.rules[0],{field:'provider',op:'missing',value:''});assert.equal(filters.rules.length,2);assert.equal(filters.rules[1].value.length,500);
  const entries=Array.from({length:30},(_,i)=>({id:'id-'+i,title:'x'.repeat(100),filters}));
  const restored=parseSavedSearches(serializeSavedSearches(entries));assert.equal(restored.length,MAX_SAVED_SEARCHES);assert.equal(restored[0].title.length,80);
  assert.equal(parseSavedSearches(serializeSavedSearches([entries[0],entries[0],{id:'bad!',title:'x',filters}])).length,1);
});

test('storage is explicitly scoped to the server-provided user and filter copies are independent',()=>{
  assert.equal(savedSearchStorageKey(''),null);assert.equal(savedSearchStorageKey(null),null);assert.equal(savedSearchStorageKey('x'.repeat(101)),null);
  assert.notEqual(savedSearchStorageKey('User One'),savedSearchStorageKey('User Two'));assert.equal(savedSearchStorageKey(' User One '),'vip.saved-searches.v1:User%20One');
  const filters={niche:'services',rules:[{field:'provider',op:'contains',value:'original'}]};
  const restored=parseSavedSearches(serializeSavedSearches([{id:'one',title:'Test',filters}]));
  restored[0].filters.rules[0].value='changed';assert.equal(filters.rules[0].value,'original');
});
