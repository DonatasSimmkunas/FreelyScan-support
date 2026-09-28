import test from 'node:test';
import assert from 'node:assert/strict';
import {SOURCE_DEFINITIONS, CAREER_BOARD_SOURCES, fetchCareerBoardBatch, fetchRegistryBatch, fetchVacanciesBatch, fetchCareerBatch} from '../lib/crawler-sources.mjs';

const NOW = new Date('2026-09-27T12:00:00Z');
const response = (data, modified = 'Sun, 27 Sep 2026 08:00:00 GMT') => new Response(JSON.stringify(data), {headers: {'content-type': 'application/json', ...(modified ? {'last-modified': modified} : {})}});
const company = (code, extra = {}) => ({_id: `uuid-${code}`, ja_kodas: code, ja_pavadinimas: `Įmonė ${code}`, reg_data: '2026-09-27', isreg_data: null, forma: {_id: 'cc5df44f-de10-47c4-a2b7-36191f606f26'}, ...extra});
const vacancy = (id, extra = {}) => ({_id: `uuid-${id}`, darbo_vietos_id: id, ar_aktuali_siandien: '1', statusas: 'sukurta', galioja_nuo: '2026-09-01', galioja_iki: '2026-09-30', ikelimo_data: '2026-09-26', jar_kodas: '00123', darbdavys: 'Pavyzdinė įmonė', profesijos_pareigybes_pav: 'Suvirintojas', darbo_vietos_sav_pav: 'Kauno miesto sav.', ...extra});
const leverJob = (id, extra = {}) => ({id, text: `Pareigos ${id}`, country: 'LT', categories: {location: 'Vilnius', allLocations: ['Vilnius']}, createdAt: Date.parse('2026-09-25T10:00:00Z'), hostedUrl: `https://jobs.lever.co/oxylabs/${id}`, ...extra});

test('registry fetch is bounded, newest-first, active-only, and joins actual legal forms', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({url: decodeURIComponent(url), options});
    if (url.includes('formos_statusai')) return response({_data: [{_id: 'uab-form', kodas: 310, pavadinimas: 'Uždaroji akcinė bendrovė'}]});
    return response({_data: [company(123), company(456, {forma: {_id: 'uab-form'}, pilnas_adresas: 'Vilnius, Testo g. 1'}), company(789, {isreg_data: '2026-09-26'})], _page: {next: 'YWJj'}});
  };
  const batch = await fetchRegistryBatch({limit: 9999, fetchImpl, now: NOW});
  assert.equal(batch.sourceId, 'rc_registry');
  assert.equal(batch.companies.length, 2);
  assert.deepEqual(batch.companies.map(company => company.legal_form), ['MB', 'UAB']);
  assert.equal(batch.companies[0].company_code, '123');
  assert.equal(batch.companies[0].company_phone, '');
  assert.equal(batch.companies[0].city_area, '');
  assert.equal(batch.companies[1].address, 'Vilnius, Testo g. 1');
  assert.deepEqual(batch.jobs, []);
  assert.equal(batch.nextCursor, null, 'partial last page terminates even if Spinta returns a next marker');
  const registry = calls.find(call => !call.url.includes('formos_statusai'));
  assert.match(registry.url, /isreg_data=null&sort\(-reg_data,-ja_kodas\)&limit\(250\)$/);
  assert.equal(registry.options.credentials, 'omit');
  assert.equal(registry.options.redirect, 'error');
  assert.equal(batch.sourceUpdatedAt, '2026-09-27T08:00:00.000Z');
});

test('registry preserves cursor on a full page and falls back only to verified MB/UAB forms', async () => {
  const batch = await fetchRegistryBatch({limit: 1, now: NOW, fetchImpl: async url => {
    if (url.includes('formos_statusai')) return new Response('', {status: 503});
    return response({_data: [company(123)], _page: {next: 'YWJj'}}, 'Fri, 21 Aug 2026 06:07:56 GMT');
  }});
  assert.equal(batch.nextCursor, 'registry:v1:YWJj');
  assert.equal(batch.companies[0].legal_form, 'MB');
  assert.equal(batch.warnings.length, 2);
  assert.match(batch.warnings.join(' '), /2026-08-21/);
});

test('registry refreshes the newest head while retaining bounded backfill and legacy cursor support', async () => {
  for (const cursor of ['YWJj', 'registry:v1:YWJj']) {
    const registryCalls = [];
    const fetchImpl = async (url, options) => {
      if (url.includes('formos_statusai')) return response({_data: []});
      const decoded = decodeURIComponent(url);
      registryCalls.push({url: decoded, signal: options.signal});
      if (decoded.includes('page(')) {
        assert.match(decoded, /limit\(200\)&page\("YWJj"\)/);
        return response({_data: [company(1, {ja_pavadinimas: 'Senas pavadinimas'}), ...Array.from({length: 199}, (_, i) => company(1000 + i))], _page: {next: 'bmV4dA=='}});
      }
      assert.match(decoded, /limit\(50\)$/);
      return response({_data: Array.from({length: 50}, (_, i) => company(i + 1)), _page: {next: 'aGVhZA=='}});
    };
    const batch = await fetchRegistryBatch({cursor, fetchImpl, now: NOW});
    assert.equal(registryCalls.length, 2);
    assert.equal(batch.rawCount, 250);
    assert.equal(batch.companies.length, 249, 'company shared by head and backfill is deduplicated');
    assert.equal(batch.companies[0].provider, 'Įmonė 1', 'fresh head wins over old data');
    assert.equal(batch.nextCursor, 'registry:v1:bmV4dA==', 'cursor progresses historical page rather than refreshing head cursor');
  }
});

test('registry resets at historical EOF and does not release a cursor when either page fails', async () => {
  const run = async failBackfill => fetchRegistryBatch({cursor: 'registry:v1:YWJj', limit: 5, now: NOW, fetchImpl: async url => {
    if (url.includes('formos_statusai')) return response({_data: []});
    if (decodeURIComponent(url).includes('page(')) {
      if (failBackfill) return new Response('', {status: 503});
      return response({_data: [company(2)], _page: {next: 'bmV4dA=='}});
    }
    return response({_data: [company(1)], _page: {next: 'aGVhZA=='}});
  }});
  const batch = await run(false);
  assert.equal(batch.rawCount, 2);
  assert.equal(batch.nextCursor, null);
  await assert.rejects(run(true), {code: 'source_http_error', status: 503});
  let headCancelled = false;
  await assert.rejects(fetchRegistryBatch({cursor: 'registry:v1:YWJj', now: NOW, fetchImpl: async (url, options) => {
    if (url.includes('formos_statusai')) return response({_data: []});
    if (decodeURIComponent(url).includes('page(')) return new Response('', {status: 503});
    return new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => { headCancelled = true; reject(new Error('cancelled')); }, {once: true}));
  }}), {code: 'source_http_error', status: 503});
  assert.equal(headCancelled, true, 'failed backfill cancels the unfinished newest-head request');
});

test('UZT rejects expired/inactive/future jobs, retains sourced contacts and exact company joins', async () => {
  const fetchImpl = async url => {
    assert.match(decodeURIComponent(url), /ar_aktuali_siandien="1"&galioja_iki>="2026-09-27"&sort\(-ikelimo_data,-darbo_vietos_id\)/);
    return response({_data: [
      vacancy('a', {darbdavio_tel_nr: '+37060000001', darbdavio_mob_nr: '+37060000002', darbdavio_el_pastas: 'jobs@example.test'}),
      vacancy('b', {darbdavio_tel_nr: '+37060000001', darbo_vietos_sav_pav: 'Vilniaus miesto sav.'}),
      vacancy('expired', {galioja_iki: '2026-07-12'}),
      vacancy('inactive', {ar_aktuali_siandien: '0'}),
      vacancy('archive', {statusas: 'archyvuota'}),
      vacancy('future', {galioja_nuo: '2026-10-01'}),
      vacancy('unknown', {darbdavys: 'Nežinomas veiklos pagrindas'}),
      vacancy('no-code', {jar_kodas: null, darbdavys: 'Maža įmonė'}),
      vacancy('no-expiry', {galioja_iki: null}),
    ]});
  };
  const result = await fetchVacanciesBatch({fetchImpl, now: NOW});
  assert.deepEqual(result.jobs.map(job => job.source_job_id), ['a', 'b', 'no-code']);
  assert.equal(result.companies.length, 2);
  assert.equal(result.jobs[0].company_code, '00123');
  assert.equal(result.jobs[2].company_code, null);
  assert.equal(result.companies[0].company_phone, '+37060000001; +37060000002');
  assert.equal(result.companies[0].company_email, 'jobs@example.test');
  assert.equal(result.companies[0].city_area, 'Kauno miesto sav.; Vilniaus miesto sav.');
  assert.equal(result.jobs[0].expires_at, '2026-09-30T23:59:59.999Z');
  assert.match(result.jobs[0].url, /get\.data\.gov\.lt\/datasets\/gov\/uzt\/ldv\/Vieta\/uuid-a$/);
  assert.ok(!JSON.stringify(result).includes('salary'));
});

test('empty stale UZT source is reported honestly rather than inventing current vacancies', async () => {
  const result = await fetchVacanciesBatch({now: NOW, fetchImpl: async () => response({_data: []}, 'Thu, 09 Jul 2026 01:49:44 GMT')});
  assert.equal(result.status, 'ok');
  assert.equal(result.jobs.length, 0);
  assert.equal(result.nextCursor, null);
  assert.match(result.warnings.join(' '), /2026-07-09/);
  assert.match(result.warnings.join(' '), /nerasta šiuo metu galiojančių/);
});

test('career boards use LT locations, original URLs, newest-first results and bounded cursors', async () => {
  const fetchImpl = async url => {
    assert.equal(url, 'https://api.lever.co/v0/postings/oxylabs?mode=json&limit=250&skip=0');
    return response([
      leverJob('old'), leverJob('new', {createdAt: Date.parse('2026-09-26T10:00:00Z')}),
      leverJob('foreign', {country: 'DE', categories: {location: 'Berlin', allLocations: ['Berlin']}}),
      leverJob('secondary', {country: 'DE', categories: {location: 'Berlin', allLocations: ['Berlin', 'Kaunas']}}),
      leverJob('invalid-url', {hostedUrl: 'https://evil.example/job'}),
    ], null);
  };
  const first = await fetchCareerBatch({fetchImpl, limit: 1, now: NOW});
  assert.equal(first.jobs[0].source_job_id, 'oxylabs:new');
  assert.equal(first.nextCursor, 'careers:0:1');
  assert.equal(first.companies[0].company_code, null);
  assert.equal(first.companies[0].provider, first.jobs[0].provider);
  assert.equal(first.jobs[0].expires_at, null);
  assert.equal(first.sourceUpdatedAt, null, 'fetch time is not a fabricated publication/update timestamp');
  const second = await fetchCareerBatch({fetchImpl, cursor: first.nextCursor, now: NOW});
  assert.deepEqual(second.jobs.map(job => job.source_job_id), ['oxylabs:old', 'oxylabs:secondary']);
  assert.equal(second.jobs[1].city_area, 'Kaunas');
  assert.equal(second.nextCursor, 'careers:1:0');
});

test('Ashby handles secondary Lithuanian locations and excludes unlisted jobs', async () => {
  const job = (id, extra = {}) => ({id, title: `Pareigos ${id}`, location: 'Remote', secondaryLocations: [{location: 'Kaunas', address: {postalAddress: {addressCountry: 'Lithuania', addressLocality: 'Kaunas'}}}], publishedAt: '2026-09-23T10:00:00Z', isListed: true, jobUrl: `https://jobs.ashbyhq.com/hostinger/${id}`, ...extra});
  const result = await fetchCareerBatch({cursor: 'careers:1:0', now: NOW, fetchImpl: async url => {
    assert.equal(url, 'https://api.ashbyhq.com/posting-api/job-board/hostinger');
    return response({jobs: [job('lt'), job('hidden', {isListed: false}), job('foreign', {secondaryLocations: []})]}, null);
  }});
  assert.equal(result.jobs.length, 1);
  assert.equal(result.jobs[0].city_area, 'Kaunas');
  assert.equal(result.companies[0].provider, 'Hostinger');
  assert.equal(result.nextCursor, null);
  assert.ok(SOURCE_DEFINITIONS.every(source=>!['rc_registry','uzt_vacancies'].includes(source.id)));
  assert.equal(SOURCE_DEFINITIONS.length,CAREER_BOARD_SOURCES.length+1);
});

test('malformed cursor/schema and HTTP failures fail closed without retries or auth forwarding', async () => {
  let calls = 0;
  await assert.rejects(fetchVacanciesBatch({cursor: 'https://evil.example', fetchImpl: async () => { calls++; }}), /žymeklis/);
  await assert.rejects(fetchCareerBatch({cursor: 'careers:9:0', fetchImpl: async () => { calls++; }}), /žymeklis/);
  assert.equal(calls, 0);
  await fetchVacanciesBatch({cursor: 'YWJj+Lw==', now: NOW, fetchImpl: async url => {
    assert.match(url, /%2B/);
    assert.match(decodeURIComponent(url), /page\("YWJj\+Lw=="\)/);
    return response({_data: []});
  }});
  await assert.rejects(fetchVacanciesBatch({fetchImpl: async () => response({unexpected: []})}), {code: 'source_invalid_schema'});
  await assert.rejects(fetchVacanciesBatch({fetchImpl: async () => new Response('', {status: 429, headers: {'retry-after': '60'}})}), {code: 'source_http_error', status: 429, retryAfter: 60});
  await assert.rejects(fetchVacanciesBatch({fetchImpl: async () => new Response('<html>no JSON</html>')}), {code: 'source_invalid_json'});
  const signal = AbortSignal.abort();
  await assert.rejects(fetchVacanciesBatch({signal, fetchImpl: async (_url, options) => { assert.equal(options.signal.aborted, true); throw new Error('aborted'); }}), {code: 'source_aborted'});
});


test('new career boards are fixed, independently paginated and restricted to Lithuanian listed roles',async()=>{
  const board=CAREER_BOARD_SOURCES.find(item=>item.type==='lever');
  assert.ok(board);let calls=0;
  const options={boardId:board.id,limit:1,now:NOW,fetchImpl:async url=>{
    calls++;assert.equal(url,board.api);return response([
      leverJob('first',{hostedUrl:`https://${board.jobHost}${board.path}first`}),
      leverJob('second',{hostedUrl:`https://${board.jobHost}${board.path}second`}),
      leverJob('talent',{text:'Join our talent pool',hostedUrl:`https://${board.jobHost}${board.path}talent`}),
      leverJob('future',{text:'Apply Here: Future Product & Engineering Leadership Roles!',hostedUrl:`https://${board.jobHost}${board.path}future`}),
      leverJob('general',{text:'Didn’t Find Your Role? Apply Here!',hostedUrl:`https://${board.jobHost}${board.path}general`}),
      leverJob('foreign',{country:'DE',categories:{location:'Berlin'},hostedUrl:`https://${board.jobHost}${board.path}foreign`}),
      leverJob('evil',{hostedUrl:'https://evil.example/any'})
    ]);
  }};
  const first=await fetchCareerBoardBatch(options);assert.equal(first.sourceId,board.id);assert.equal(first.jobs.length,1);assert.match(first.nextCursor,new RegExp('^board:'+board.id+':1$'));
  const second=await fetchCareerBoardBatch({...options,cursor:first.nextCursor});assert.equal(second.jobs.length,1);assert.notEqual(first.jobs[0].source_job_id,second.jobs[0].source_job_id);assert.equal(second.nextCursor,null);
  await assert.rejects(fetchCareerBoardBatch({...options,boardId:'https://evil.example'}),/Nežinomas/);
  await assert.rejects(fetchCareerBoardBatch({...options,cursor:'board:other:1'}),/žymeklis/);assert.equal(calls,2);
});

test('Greenhouse rejects foreign, prospect, expired and untrusted jobs without inventing contacts',async()=>{
  const board=CAREER_BOARD_SOURCES.find(b=>b.id==='careers_transfergo');
  const job=(id,extra={})=>({id,internal_job_id:id,title:'Engineer',location:{name:'Vilnius, Lithuania'},absolute_url:`https://job-boards.greenhouse.io/transfergo/jobs/${id}`,first_published:'2026-09-25',...extra});
  const batch=await fetchCareerBoardBatch({boardId:board.id,now:NOW,fetchImpl:async()=>response({jobs:[job(1),job(1),job(2,{location:{name:'London'}}),job(3,{internal_job_id:null}),job(4,{application_deadline:'2026-09-26'}),job(5,{absolute_url:'https://evil.example/transfergo/jobs/5'}),job(6,{application_deadline:'2026-09-27'})]})});
  assert.deepEqual(batch.jobs.map(j=>j.source_job_id),['transfergo:1','transfergo:6']);
  assert.equal(batch.jobs[1].expires_at,'2026-09-27T23:59:59.999Z');assert.equal(batch.companies[0].company_phone,'');assert.equal(batch.companies[0].company_code,null);
});

test('SmartRecruiters advances raw pages even when all jobs in a page are filtered out',async()=>{
 const board=CAREER_BOARD_SOURCES.find(b=>b.id==='careers_ignitisgroup');
 const options={boardId:board.id,limit:1,now:NOW,fetchImpl:async raw=>{
  const u=new URL(raw);assert.equal(u.searchParams.get('country'),'lt');assert.equal(u.searchParams.get('limit'),'1');
  const offset=Number(u.searchParams.get('offset'));
  return response({totalFound:2,content:[{id:String(offset+1),name:'Elektrikas',releasedDate:'2026-09-25',location:{country:offset?'lt':'lv',city:offset?'Panevėžys':'Riga'}}]});
 }};
 const first=await fetchCareerBoardBatch(options);assert.equal(first.jobs.length,0);assert.equal(first.nextCursor,'board:careers_ignitisgroup:1');
 const second=await fetchCareerBoardBatch({...options,cursor:first.nextCursor});assert.equal(second.jobs.length,1);assert.equal(second.jobs[0].city_area,'Panevėžys');assert.equal(second.nextCursor,null);assert.equal(second.jobs[0].url,'https://jobs.smartrecruiters.com/Ignitisgroup/2');
});

test('paged Lever continues beyond the first page and refuses cross-board cursors',async()=>{
 const board=CAREER_BOARD_SOURCES.find(b=>b.id==='careers_palantir');
 const options={boardId:board.id,limit:1,now:NOW,fetchImpl:async raw=>{
  const u=new URL(raw),skip=Number(u.searchParams.get('skip'));assert.equal(u.searchParams.get('limit'),'1');
  return response(skip===2?[]:[leverJob(String(skip),{country:skip?'LT':'DE',categories:{location:skip?'Vilnius':'Berlin'},hostedUrl:`https://jobs.lever.co/palantir/${skip}`})]);
 }};
 const first=await fetchCareerBoardBatch(options);assert.equal(first.jobs.length,0);assert.ok(first.nextCursor);
 const second=await fetchCareerBoardBatch({...options,cursor:first.nextCursor});assert.equal(second.jobs.length,1);assert.ok(second.nextCursor);
 const last=await fetchCareerBoardBatch({...options,cursor:second.nextCursor});assert.equal(last.nextCursor,null);
});
