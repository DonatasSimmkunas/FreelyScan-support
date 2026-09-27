import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalJobUrl, createLiveEmployerCatalog, mergeLiveEmployers} from '../lib/live-employers.mjs';

const base = {companies: [{ID: 'LT1', 'Įmonė': 'UAB Žalias fabrikas', 'Įmonės kodas': '123456789', 'Svetainė': 'https://www.fabrikas.lt', 'Telefonas (-ai)': '+37060000001', 'Miestai / šalys': 'Kaunas', 'Darbo sritys': 'Gamyba'}], jobs: [{'Darbdavio ID': 'LT1', 'Ieškomos pareigos': 'Importuotas darbas', 'Šaltinis': 'Importas', 'Skelbimas': 'https://fabrikas.lt/jobs/1?utm_source=old', 'Miestai / šalys': 'Kaunas'}], contactSources: []};
const job = (id, extra = {}) => ({id: `job:${id}`, title: `Pareigos ${id}`, city_area: 'Vilnius', url: `https://fabrikas.lt/jobs/${id}`, status: 'open', source_id: 'company_careers', expires_at: null, ...extra});
const company = (id = '1', extra = {}) => ({id: `company:${id}`, provider: 'Žalias fabrikas, UAB', company_code: '123456789', profile_url: 'https://fabrikas.lt', company_phone: '', company_email: '', city_area: 'Vilnius', source_id: 'company_careers', source_url: 'https://fabrikas.lt/karjera', jobs: [job('1'), job('2')], ...extra});
const page = (records, pageNumber = 1, total = records.length) => ({status: 200, data: {records, total, page: pageNumber, pageSize: 50, pages: Math.max(1, Math.ceil(total / 50))}});

test('matching company codes join current jobs with imports once and preserve the imported source', () => {
  const untouched = JSON.stringify(base);
  const catalog = mergeLiveEmployers(base, [company('1', {provider: 'Naujas oficialus pavadinimas', company_email: 'hr@fabrikas.lt'})]);
  assert.equal(catalog.metadata.total, 1);
  assert.equal(catalog.metadata.jobsTotal, 2);
  assert.equal(catalog.metadata.importedJobsTotal, 1);
  assert.equal(catalog.metadata.crawlerJobsTotal, 1);
  assert.equal(catalog.metadata.activeCrawlerJobsTotal, 2);
  assert.equal(catalog.metadata.addedCompaniesTotal, 0);
  assert.equal(catalog.metadata.matchedCompaniesTotal, 1);
  const result = catalog.detail('LT1');
  assert.equal(result.provider, 'UAB Žalias fabrikas');
  assert.equal(result.company_email, 'hr@fabrikas.lt');
  assert.equal(result.contacts[0].url, 'https://fabrikas.lt/karjera');
  assert.equal(result.imported_jobs_count, 1);
  assert.equal(result.crawler_jobs_count, 1);
  assert.equal(result.jobs[0].portal, 'Importas');
  assert.match(result.jobs[1].portal, /crawleris/);
  assert.equal(catalog.search({q: 'Pareigos 2', city: 'Vilnius'}).total, 1);
  assert.equal(JSON.stringify(base), untouched);
});

test('without a code only a specific matching official domain and compatible name merge', () => {
  const original = structuredClone(base); original.companies[0]['Įmonės kodas'] = null;
  assert.equal(mergeLiveEmployers(original, [company('1', {company_code: null})]).metadata.total, 1);
  for (const extra of [
    {provider: 'Kitas fabrikas', company_code: null},
    {profile_url: 'https://kitas.lt', company_code: null},
    {company_code: '987654321'},
    {provider: 'MB Žalias fabrikas', legal_form: 'MB', company_code: null},
  ]) assert.equal(mergeLiveEmployers(base, [company('1', extra)]).metadata.total, 2, JSON.stringify(extra));
  const generic = {companies: [{ID: 'x', 'Įmonė': 'Paslaugos', 'Svetainė': 'https://paslaugos.lt'}]};
  assert.equal(mergeLiveEmployers(generic, [company('2', {provider: 'Paslaugos', profile_url: 'https://paslaugos.lt', company_code: null})]).metadata.total, 2);
  const shared = {companies: [{ID: 'x', 'Įmonė': 'Žalias fabrikas', 'Svetainė': 'https://jobs.lever.co/a'}]};
  assert.equal(mergeLiveEmployers(shared, [company('2', {profile_url: 'https://jobs.lever.co/b', company_code: null})]).metadata.total, 2);
});

test('new employers have stable IDs, real contacts, source links, and an explicit Kita category', () => {
  const catalog = mergeLiveEmployers({companies: [], jobs: []}, [company('5', {category: 'unknown', company_code: null, provider: 'Nauja įmonė'})]);
  assert.equal(catalog.metadata.total, 1);
  assert.equal(catalog.metadata.addedCompaniesTotal, 1);
  assert.equal(catalog.metadata.crawlerJobsTotal, 2);
  const id=catalog.search().records[0].id;assert.match(id,/^CRW_[a-f0-9]{32}$/);
  const result = catalog.detail(id);
  assert.equal(result.category, 'Kita');
  assert.equal(result.company_phone, null);
  assert.equal(result.company_email, null);
  assert.equal(result.company_code, null);
  assert.equal(result.listing_url, 'https://fabrikas.lt/jobs/1');
  assert.equal(catalog.search({withPhone: true}).total, 0);
  assert.equal(mergeLiveEmployers({}, [company('5', {category: 'IT'})]).metadata.categories[0], 'IT');
});

test('canonical links discard only tracking, dedupe repeats, and preserve distinct query IDs', () => {
  assert.equal(canonicalJobUrl('https://www.fabrikas.lt/jobs/1/?utm_source=x&gclid=x#details'), 'https://fabrikas.lt/jobs/1');
  assert.equal(canonicalJobUrl('javascript:alert(1)'), '');
  assert.equal(canonicalJobUrl('https://user:password@example.lt'), '');
  const catalog = mergeLiveEmployers(base, [company('1', {jobs: [job('1'), job('2'), job('2', {url: 'https://www.fabrikas.lt/jobs/2/?fbclid=a'}), job('3', {url: 'https://fabrikas.lt/job?id=3'}), job('4', {url: 'https://fabrikas.lt/job?id=4'})]})]);
  assert.equal(catalog.metadata.jobsTotal, 4);
  assert.equal(catalog.metadata.activeCrawlerJobsTotal, 4);
});

test('closed or expired live jobs disappear on refresh while imported jobs remain', async () => {
  let current = [company()], time = Date.parse('2026-09-28T00:00:00Z'), requests = 0;
  const client = {configured: true, request: async () => { requests++; return page(current); }};
  const live = createLiveEmployerCatalog(base, client, {now: () => time});
  assert.equal((await live.getCatalog()).metadata.jobsTotal, 2);
  assert.equal((await live.getCatalog()).metadata.jobsTotal, 2); assert.equal(requests, 1);
  current = [company('1', {jobs: [job('2', {status: 'closed'}), job('3', {expires_at: '2026-09-27T23:59:59Z'})]})];
  time += 30001;
  assert.equal((await live.getCatalog()).metadata.jobsTotal, 1);
  assert.equal((await live.getCatalog()).metadata.crawlerJobsTotal, 0);
  assert.equal((await live.getCatalog()).detail('LT1').imported_jobs_count, 1);
  assert.equal(requests, 2);
});

test('full pagination commits atomically and failures retain the last good snapshot and mark it stale', async () => {
  const all = Array.from({length: 51}, (_, i) => company(String(i), {provider: `Įmonė ${i}`, profile_url: `https://imone-${i}.lt`, company_code: null, jobs: [job(i)]}));
  let fail = false;
  const seen = [];
  const live = createLiveEmployerCatalog(base, {configured: true, request: async (action, input) => { seen.push([action, input]); return fail && input.page === 2 ? {status: 502} : page(all.slice((input.page - 1) * 50, input.page * 50), input.page, all.length); }});
  const successful = await live.getCatalog();
  assert.equal(successful.metadata.total, 52); assert.equal(successful.metadata.jobsTotal, 52);
  assert.deepEqual(seen.map(entry => entry[1].page), [1, 2]);
  assert.ok(seen.every(([action, input]) => action === 'search' && input.kind === 'hiring' && input.pageSize === 50));
  fail = true; live.invalidate();
  const retained = await live.getCatalog();
  assert.equal(retained.metadata.total, 52); assert.equal(retained.metadata.jobsTotal, 52);
  assert.equal(retained.metadata.liveStale, true); assert.ok(live.getStatus().lastSuccessAt);
  assert.match(live.getStatus().error, /paskutinė sėkminga kopija/);
});

test('concurrent refreshes share one request, invalidation during flight forces the next refresh', async () => {
  let resolve, requests = 0;
  const client = {configured: true, request: () => { requests++; return new Promise(done => { resolve = done; }); }};
  const live = createLiveEmployerCatalog(base, client);
  const a = live.getCatalog(), b = live.getCatalog({force: true});
  assert.equal(requests, 1); assert.equal(live.getStatus().refreshing, true);
  live.invalidate(); resolve(page([company()]));
  const [first, second] = await Promise.all([a, b]); assert.equal(first, second);
  const c = live.getCatalog(); assert.equal(requests, 2); resolve(page([]));
  assert.equal((await c).metadata.jobsTotal, 1);
});

test('incomplete, duplicate, malformed or oversized snapshots do not silently replace valid data', async () => {
  const invalid = [
    {status: 502, data: {error: 'private service details'}},
    {status: 200, data: {records: [company()], total: 2, pages: 1, page: 1, pageSize: 50}},
    page([company(), company()]),
    page([company('1', {jobs: [job('1', {expires_at: 'yesterday'})]})]),
    {status: 200, data: {records: [], total: 5001, pages: 101, page: 1, pageSize: 50}},
  ];
  for (const response of invalid) {
    const live = createLiveEmployerCatalog(base, {configured: true, request: async () => response});
    const catalog = await live.getCatalog();
    assert.equal(catalog.metadata.total, 1); assert.equal(catalog.metadata.jobsTotal, 1); assert.equal(catalog.metadata.liveStale, true);
    assert.doesNotMatch(JSON.stringify(live.getStatus()), /private service details/);
  }
});

test('explicit expiry is respected even during cache lifetime and a service failure', async () => {
  let time = Date.parse('2026-09-28T00:00:00Z'), fail = false;
  const live = createLiveEmployerCatalog(base, {configured: true, request: async () => fail ? {status: 502} : page([company('2', {company_code: null, profile_url: 'https://new.lt', jobs: [job('3', {expires_at: '2026-09-28T00:00:01Z'})]})])}, {now: () => time});
  assert.equal((await live.getCatalog()).metadata.total, 2);
  time += 1001; fail = true;
  assert.equal((await live.getCatalog()).metadata.total, 1);
  live.invalidate(); assert.equal((await live.getCatalog()).metadata.jobsTotal, 1);
});

test('unconfigured collectors use the import without network requests or an error', async () => {
  const live = createLiveEmployerCatalog(base, {configured: false, request: () => assert.fail('must not request')});
  assert.equal((await live.getCatalog()).metadata.jobsTotal, 1);
  assert.equal(live.getStatus().stale, false); assert.equal(live.getStatus().error, null);
});
