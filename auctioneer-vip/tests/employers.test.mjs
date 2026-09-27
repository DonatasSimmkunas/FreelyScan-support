import test from 'node:test';
import assert from 'node:assert/strict';
import {createEmployerCatalog, EMPLOYER_FIELDS} from '../lib/employers.mjs';

const company = (ID, name, extra = {}) => ({
  ID, 'Įmonė': name, 'Darbdavio tipas': 'Darbdavys', 'Darbo sritys': 'Gamyba; Statyba',
  'Miestai / šalys': 'Vilniuje; Kauno raj.; Norvegijoje', 'Pareigų pavyzdžiai': 'Suvirintojas\nDar 27 pareigų – lape „Skelbimai“.',
  'Telefonas (-ai)': '+370 600 00001; +370 600 00002', 'El. paštas (-ai)': 'darbai@example.com; info@example.com',
  'Svetainė': 'https://example.com', 'Kontaktų būsena': 'Telefonas ir el. paštas', 'Skelbimų sk.': 999,
  'Darbo portalai': 'CVbankas.lt; Darbo.lt', 'Skelbimo nuoroda': 'https://jobs.example.com/1',
  'Telefono šaltinis': 'https://example.com/contacts', 'El. pašto šaltinis': 'https://example.com/contact',
  'Įmonės kodas': '000001', 'Patikrinta': '2026-09-28T12:00:00', 'Skelbimo patikra': 'Matyta skelbimų sąraše', ...extra,
});
const job = (id, title, area = 'Kaune', url = title) => ({'Darbdavio ID': id, 'Ieškomos pareigos': title, 'Miestai / šalys': area, 'Šaltinis': 'Darbo.lt', 'Skelbimas': `https://jobs.example.com/${url}`, 'Portalo laiko žyma': 'prieš 3 d.', 'Patikrinta': '2026-09-28T12:00:00'});
const input = {
  companies: [company('LTB0001', 'Žalias fabrikas'), company('LTB0002', 'Ąžuolo agentūra', {'Darbdavio tipas': 'Agentūra / atrankos', 'Darbo sritys': 'Logistika', 'Miestai / šalys': 'Kaunas', 'Telefonas (-ai)': null, 'El. paštas (-ai)': null, 'Kontaktų būsena': 'Kontaktą papildyti'}), company('LTB0003', 'Be vietos', {'Miestai / šalys': null, 'Darbo sritys': null, 'Darbo portalai': null})],
  jobs: [job('LTB0001', 'Suvirintojas'), job('LTB0001', 'Retas naktinio krautuvo operatorius', 'Šiauliuose'), job('LTB0002', 'Vairuotojas', 'Kaunas')],
  contactSources: [
    {'Darbdavio ID': 'LTB0001', 'Kontakto tipas': 'Telefonas', 'Kontaktas': '+370 600 00002', 'Šaltinio nuoroda': 'https://example.com/contact-source-1', 'Patikrinta': '2026-09-28T12:00:00'},
    {'Darbdavio ID': 'LTB0001', 'Kontakto tipas': 'Telefonas', 'Kontaktas': '+370 600 00002', 'Šaltinio nuoroda': 'https://example.com/contact-source-2', 'Patikrinta': '2026-09-28T12:00:00'},
  ],
};
const catalog = createEmployerCatalog(input);

test('company joins use all jobs and keep contact provenance without date fields or invented prices', () => {
  assert.equal(catalog.metadata.total, 3);
  assert.equal(catalog.metadata.jobsTotal, 3);
  assert.equal(catalog.metadata.fields.find(f => f.key === 'category').label, 'Veiklos sritis');
  assert.deepEqual(catalog.metadata.categories, ['Gamyba', 'Logistika', 'Statyba']);
  const detail = catalog.detail('LTB0001');
  assert.equal(detail.jobs_count, 2);
  assert.equal(detail.positions, 'Suvirintojas');
  assert.equal(detail.contacts.length, 2);
  assert.equal(new Set(detail.contacts.map(c => c.url)).size, 2);
  assert.deepEqual(Object.keys(detail.jobs[0]), ['title', 'city_area', 'portal', 'url']);
  assert.deepEqual(Object.keys(detail.contacts[0]), ['type', 'value', 'url']);
  assert.equal(catalog.detail('absent'), null);
  assert.doesNotMatch(JSON.stringify({metadata: catalog.metadata, detail}), /Patikrinta|Portalo laiko|2026-09-28|prieš 3 d\.|price_|salary/);
  assert.deepEqual(Object.keys(catalog.search().records[0]), EMPLOYER_FIELDS.map(f => f.key));
  assert.equal(catalog.search().records[0].jobs, undefined);
});

test('search includes later job titles, joined territories and contact provenance', () => {
  assert.deepEqual(catalog.search({q: 'retas krautuvo'}).records.map(r => r.id), ['LTB0001']);
  assert.deepEqual(catalog.search({q: 'contact-source-2'}).records.map(r => r.id), ['LTB0001']);
  assert.deepEqual(catalog.search({q: '37060000002'}).records.map(r => r.id), ['LTB0001', 'LTB0003']);
  assert.equal(catalog.search({q: '2026-09-28'}).total, 0);
});

test('location aliases and split work areas filter exactly without merging cities and districts', () => {
  assert.equal(catalog.search({city: 'Vilnius'}).total, 1);
  assert.equal(catalog.search({city: 'Vilniuje'}).total, 1);
  assert.equal(catalog.search({city: 'Kaunas'}).total, 2);
  assert.equal(catalog.search({city: 'Kauno r.'}).total, 1);
  assert.equal(catalog.search({city: 'Norvegija'}).total, 1);
  assert.equal(catalog.search({city: 'Šiauliai'}).total, 1);
  assert.equal(catalog.search({city: 'Kaun'}).total, 0);
  assert.equal(catalog.search({category: 'Statyba'}).total, 1);
  assert.equal(catalog.search({category: 'Stat'}).total, 0);
  assert.equal(catalog.search({employerType: 'Agentūra / atrankos', contactStatus: 'Kontaktą papildyti', portal: 'Darbo.lt'}).records[0].id, 'LTB0002');
  assert.equal(catalog.search({withPhone: true, withEmail: true}).total, 2);
  assert.equal(catalog.metadata.missingPhone, 1);
  assert.equal(catalog.metadata.missingEmail, 1);
});

test('all canonical fields support rules; numbers, missing values, AND/OR and invalid rules behave correctly', () => {
  const record = catalog.detail('LTB0001');
  for (const field of EMPLOYER_FIELDS) {
    assert.ok(catalog.search({rules: [{field: field.key, op: 'eq', value: record[field.key]}]}).records.some(r => r.id === 'LTB0001'), field.key);
  }
  assert.equal(catalog.search({rules: [{field: 'company_phone', op: 'contains', value: '+37060000002'}]}).total, 2);
  assert.equal(catalog.search({rules: [{field: 'jobs_count', op: 'gte', value: 2}]}).total, 1);
  assert.equal(catalog.search({rules: [{field: 'jobs_count', op: 'lte', value: 0}]}).records[0].id, 'LTB0003');
  assert.equal(catalog.search({rules: [{field: 'company_phone', op: 'missing'}]}).total, 1);
  assert.equal(catalog.search({rules: [{field: 'company_phone', op: 'present'}, {field: 'jobs_count', op: 'gte', value: 1}]}).total, 1);
  assert.equal(catalog.search({ruleMode: 'any', rules: [{field: 'company_phone', op: 'missing'}, {field: 'jobs_count', op: 'gte', value: 2}]}).total, 2);
  for (const rules of [[{field: 'Patikrinta', op: 'present'}], [{field: 'provider', op: 'gte', value: 1}], [{field: 'jobs_count', op: 'gte', value: 'bad'}], [null], Array(31).fill({field: 'id', op: 'present'})]) assert.throws(() => catalog.search({rules}));
});

test('available territories reflect other filters while remaining independent of the selected territory', () => {
  const result = catalog.search({category: 'Logistika', city: 'Vilnius'});
  assert.equal(result.total, 0);
  assert.deepEqual(result.availableCities, ['Kaunas']);
  assert.deepEqual(catalog.search({q: 'nothing-here'}).availableCities, []);
  assert.deepEqual(catalog.search({rules: [{field: 'jobs_count', op: 'gte', value: 2}]}).availableCities, catalog.search({category: 'Statyba'}).availableCities);
  const unknown = createEmployerCatalog({companies: [company('x', 'A', {'Miestai / šalys': 'Visi;  '})]});
  assert.deepEqual(unknown.metadata.cities, []);
  assert.deepEqual(unknown.search().availableCities, []);
});

test('sorting and pagination are stable, clamp invalid pages and put missing locations last', () => {
  assert.deepEqual(catalog.search().records.map(r => r.id), ['LTB0001', 'LTB0002', 'LTB0003']);
  assert.deepEqual(catalog.search({sort: 'jobs_asc'}).records.map(r => r.id), ['LTB0003', 'LTB0002', 'LTB0001']);
  assert.equal(catalog.search({sort: 'name_asc'}).records[0].id, 'LTB0002');
  assert.equal(catalog.search({sort: 'name_desc'}).records[0].id, 'LTB0001');
  assert.equal(catalog.search({sort: 'city_asc'}).records.at(-1).id, 'LTB0003');
  const many = createEmployerCatalog({companies: Array.from({length: 70}, (_, i) => company(`LTB${i}`, `Įmonė ${i}`))});
  assert.equal(many.search({page: 2, pageSize: 25}).records[0].provider, 'Įmonė 25');
  assert.equal(many.search({page: 999}).page, 3);
  assert.equal(many.search({page: 'bad'}).page, 1);
  assert.equal(many.search({pageSize: 50}).pages, 2);
  assert.equal(many.search({pageSize: 100}).records.length, 70);
  assert.equal(many.search({pageSize: 12}).pageSize, 25);
  assert.equal(many.search({q: 'nothing-here'}).pages, 1);
});

test('invalid joins and duplicate IDs fail instead of silently dropping private source rows', () => {
  assert.throws(() => createEmployerCatalog({companies: [company('same', 'A'), company('same', 'B')]}));
  assert.throws(() => createEmployerCatalog({jobs: [job('unknown', 'Pareigos')]}));
  assert.throws(() => createEmployerCatalog({contactSources: input.contactSources}));
});
