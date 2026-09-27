// Public source adapters. Standard Web APIs only: also imported by the Deno collector.
const REGISTRY_URL = 'https://get.data.gov.lt/datasets/gov/rc/jar/iregistruoti/JuridinisAsmuo';
const FORMS_URL = 'https://get.data.gov.lt/datasets/gov/rc/jar/formos_statusai/Forma';
const VACANCIES_URL = 'https://get.data.gov.lt/datasets/gov/uzt/ldv/Vieta';
const MAX_BATCH = 250;
const REQUEST_TIMEOUT_MS = 20_000;
const MAX_RESPONSE_BYTES = 8_000_000;
const DAY_MS = 86_400_000;

// Explicitly verified public employer boards; removed government feeds remain only
// as legacy adapters below and are never part of the active collection config.
export const CAREER_BOARD_SOURCES = Object.freeze([
  Object.freeze({id:'careers_cybercare',provider:'CyberCare',type:'ashby',official:'https://cybercare.cc/careers/',api:'https://api.ashbyhq.com/posting-api/job-board/cybercare',jobHost:'jobs.ashbyhq.com',path:'/cybercare/'}),
  Object.freeze({id:'careers_sintra',provider:'Sintra',type:'ashby',official:'https://sintra.ai/careers',api:'https://api.ashbyhq.com/posting-api/job-board/sintra',jobHost:'jobs.ashbyhq.com',path:'/sintra/'}),
  Object.freeze({id:'careers_tesonet_global',provider:'Tesonet Global',type:'ashby',official:'https://tesonet.com/careers/',api:'https://api.ashbyhq.com/posting-api/job-board/tesonet-global',jobHost:'jobs.ashbyhq.com',path:'/tesonet-global/'}),
  Object.freeze({id:'careers_surfshark',provider:'Surfshark',type:'ashby',official:'https://surfshark.com/career',api:'https://api.ashbyhq.com/posting-api/job-board/surfshark',jobHost:'jobs.ashbyhq.com',path:'/surfshark/'}),
  Object.freeze({id:'careers_nord_security',provider:'Nord Security',type:'ashby',official:'https://nordsecurity.com/careers/',api:'https://api.ashbyhq.com/posting-api/job-board/nord-security',jobHost:'jobs.ashbyhq.com',path:'/nord-security/'}),
  Object.freeze({id:'careers_omnisend',provider:'Omnisend',type:'lever',official:'https://www.omnisend.com/careers/',api:'https://api.lever.co/v0/postings/omnisend?mode=json&limit=250',jobHost:'jobs.lever.co',path:'/omnisend/'}),
]);
export const SOURCE_DEFINITIONS = Object.freeze([
  Object.freeze({id: 'company_careers', name: 'Oxylabs ir Hostinger karjeros puslapiai', url: 'https://career.oxylabs.io/', documentationUrl: 'https://github.com/lever/postings-api', expectedUpdateDays: 1}),
  ...CAREER_BOARD_SOURCES.map(board=>Object.freeze({id:board.id,name:board.provider+' — karjeros puslapis',url:board.official,api:board.api,expectedUpdateDays:1})),
]);

const text = value => typeof value === 'string' ? value.trim() : typeof value === 'number' && Number.isFinite(value) ? String(value) : '';
const clean = value => text(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').slice(0, 4000);
const uniqueText = values => [...new Set(values.flatMap(value => clean(value).split(/;\s*/)).filter(Boolean))].join('; ');
const batchSize = value => Number.isFinite(Number(value)) ? Math.max(1, Math.min(MAX_BATCH, Math.trunc(Number(value)))) : MAX_BATCH;
const dateOnly = value => /^\d{4}-\d{2}-\d{2}$/.test(text(value)) && !Number.isNaN(Date.parse(value)) ? text(value) : null;
const timestamp = value => value && !Number.isNaN(new Date(value).getTime()) ? new Date(value).toISOString() : null;
const sourceError = (sourceId, code, message, status) => Object.assign(new Error(message), {sourceId, code, ...(status ? {status} : {})});
const knownProvider = value => value && !/^nežinomas veiklos pagrindas$/iu.test(value);

function queryUrl(base, terms, cursor, limit) {
  if (cursor !== null && cursor !== undefined && (typeof cursor !== 'string' || !/^[A-Za-z0-9_+\/=\-]{1,2048}$/.test(cursor))) {
    throw new TypeError('Netinkamas šaltinio puslapio žymeklis.');
  }
  const query = [...terms, `limit(${batchSize(limit)})`];
  if (cursor) query.push(`page(${encodeURIComponent(JSON.stringify(cursor))})`);
  const url = new URL(base);
  url.search = query.join('&');
  return url.href;
}

async function requestJson(url, {fetchImpl, signal, sourceId}) {
  const controller = new AbortController();
  const abort = () => controller.abort(signal?.reason);
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, {once: true});
  const timeout = setTimeout(() => controller.abort(new Error('Šaltinio užklausa užtruko per ilgai.')), REQUEST_TIMEOUT_MS);
  try {
    // Never forward auth/cookies and never follow a source redirect to another host.
    const response = await fetchImpl(url, {headers: {Accept: 'application/json'}, credentials: 'omit', redirect: 'error', signal: controller.signal});
    if (!response.ok) {
      const error = sourceError(sourceId, 'source_http_error', `Šaltinis grąžino HTTP ${response.status}.`, response.status);
      const retryHeader=response.headers.get('retry-after');
      const retryAfter = /^\d+$/.test(retryHeader||'')?Number(retryHeader):Math.ceil((Date.parse(retryHeader)-Date.now())/1000);
      if (Number.isFinite(retryAfter) && retryAfter > 0) error.retryAfter = retryAfter;
      throw error;
    }
    if (Number(response.headers.get('content-length')) > MAX_RESPONSE_BYTES) throw sourceError(sourceId, 'source_too_large', 'Šaltinio atsakymas viršija leistiną dydį.');
    let bodyText = '';
    if (response.body?.getReader) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let bytes = 0;
      try {
        while (true) {
          const {done, value} = await reader.read();
          if (done) break;
          bytes += value.byteLength;
          if (bytes > MAX_RESPONSE_BYTES) { await reader.cancel(); throw sourceError(sourceId, 'source_too_large', 'Šaltinio atsakymas viršija leistiną dydį.'); }
          bodyText += decoder.decode(value, {stream: true});
        }
        bodyText += decoder.decode();
      } finally { reader.releaseLock(); }
    } else {
      bodyText = await response.text();
      if (bodyText.length > MAX_RESPONSE_BYTES) throw sourceError(sourceId, 'source_too_large', 'Šaltinio atsakymas viršija leistiną dydį.');
    }
    let data;
    try { data = JSON.parse(bodyText); }
    catch { throw sourceError(sourceId, 'source_invalid_json', 'Šaltinio atsakymas nėra JSON.'); }
    return {data, sourceUpdatedAt: timestamp(response.headers.get('last-modified'))};
  } catch (error) {
    if (error.sourceId) throw error;
    throw sourceError(sourceId, controller.signal.aborted ? 'source_aborted' : 'source_unavailable', controller.signal.aborted ? 'Šaltinio užklausa nutraukta arba viršijo laiko ribą.' : 'Nepavyko pasiekti šaltinio.');
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}

function pageData(data, sourceId, limit) {
  if (!data || !Array.isArray(data._data) || data._data.length > limit || data._data.some(row => !row || typeof row !== 'object' || Array.isArray(row))) {
    throw sourceError(sourceId, 'source_invalid_schema', 'Pasikeitė šaltinio duomenų struktūra.');
  }
  return data._data;
}

function resultFor(sourceId, response, rows, limit, now) {
  const token = response.data._page?.next;
  const nextCursor = rows.length >= limit && typeof token === 'string' && /^[A-Za-z0-9_+\/=\-]{1,2048}$/.test(token) ? token : null;
  const warnings = [];
  const threshold = sourceId === 'rc_registry' ? 35 : 3;
  if (response.sourceUpdatedAt && now.getTime() - Date.parse(response.sourceUpdatedAt) > threshold * DAY_MS) {
    warnings.push(`Šaltinio duomenys neatnaujinti nuo ${response.sourceUpdatedAt.slice(0, 10)}. Naujo tikrinimo laikas nereiškia, kad šaltinis atnaujintas.`);
  } else if (!response.sourceUpdatedAt) {
    warnings.push('Šaltinis nepateikė duomenų atnaujinimo laiko.');
  }
  return {sourceId, status: 'ok', companies: [], jobs: [], nextCursor, sourceUpdatedAt: response.sourceUpdatedAt, fetchedAt: now.toISOString(), warnings, rawCount: rows.length};
}

const formCache = new WeakMap();
const VERIFIED_FORMS = new Map([
  ['5c444113-5081-4d88-b94d-782c0779bb89', 'UAB'],
  ['cc5df44f-de10-47c4-a2b7-36191f606f26', 'MB'],
]);

async function legalForms(options) {
  const cached = formCache.get(options.fetchImpl);
  if (cached && Date.now() - cached.loadedAt < DAY_MS) return {map: cached.map, warning: null};
  try {
    const response = await requestJson(queryUrl(FORMS_URL, [], null, MAX_BATCH), options);
    const rows = pageData(response.data, options.sourceId, MAX_BATCH);
    const map = new Map(VERIFIED_FORMS);
    for (const row of rows) {
      if (!text(row._id) || !clean(row.pavadinimas)) continue;
      map.set(text(row._id), Number(row.kodas) === 310 ? 'UAB' : Number(row.kodas) === 960 ? 'MB' : clean(row.pavadinimas));
    }
    formCache.set(options.fetchImpl, {loadedAt: Date.now(), map});
    return {map, warning: null};
  } catch (error) {
    if (options.signal?.aborted) throw error;
    return {map: VERIFIED_FORMS, warning: 'Teisinių formų klasifikatorius laikinai nepasiekiamas; atpažįstamos patikrintos MB ir UAB formos.'};
  }
}

export async function fetchRegistryBatch({cursor = null, limit = MAX_BATCH, fetchImpl = globalThis.fetch, signal, now = new Date()} = {}) {
  const sourceId = 'rc_registry';
  const size = batchSize(limit);
  // Accept the original Spinta token as well as this versioned opaque wrapper.
  const backfillCursor = typeof cursor === 'string' && cursor.startsWith('registry:v1:') ? cursor.slice('registry:v1:'.length) : cursor;
  const headSize = backfillCursor ? Math.min(50, Math.ceil(size / 5)) : size;
  const backfillSize = backfillCursor ? size - headSize : 0;
  const terms = ['isreg_data=null', 'sort(-reg_data,-ja_kodas)'];
  const headUrl = queryUrl(REGISTRY_URL, terms, null, headSize);
  // Validate a legacy/wrapped token before making any request, even with limit=1.
  const backfillUrl = backfillCursor ? queryUrl(REGISTRY_URL, terms, backfillCursor, backfillSize || 1) : null;
  if (cursor !== null && cursor !== undefined && !backfillCursor) throw new TypeError('Netinkamas šaltinio puslapio žymeklis.');
  const deadline = new AbortController();
  const abort = () => deadline.abort(signal?.reason);
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, {once: true});
  // The head, historical page and classifier share one overall source deadline.
  const timer = setTimeout(() => deadline.abort(), REQUEST_TIMEOUT_MS);
  const options = {fetchImpl, signal: deadline.signal, sourceId};
  try {
    const [head, backfill, forms] = await Promise.all([
      requestJson(headUrl, options),
      backfillSize ? requestJson(backfillUrl, options) : Promise.resolve(null),
      legalForms(options),
    ]);
    const headRows = pageData(head.data, sourceId, headSize);
    const backfillRows = backfill ? pageData(backfill.data, sourceId, backfillSize) : [];
    const rows = [...headRows, ...backfillRows];
    const response = {data: head.data, sourceUpdatedAt: [head.sourceUpdatedAt, backfill?.sourceUpdatedAt].filter(Boolean).sort().at(-1) || null};
    const result = resultFor(sourceId, response, rows, size, now);
    const progress = backfill || head;
    const progressRows = backfill ? backfillRows : headRows;
    const progressSize = backfill ? backfillSize : headSize;
    const rawNext = backfillCursor && !backfillSize ? backfillCursor : progressRows.length >= progressSize ? progress.data._page?.next : null;
    result.nextCursor = typeof rawNext === 'string' && /^[A-Za-z0-9_+\/=\-]{1,2048}$/.test(rawNext) ? `registry:v1:${rawNext}` : null;
    if (forms.warning) result.warnings.push(forms.warning);
    const seen = new Set();
    // Prefer the fresh head if a company also appears in the historical page.
    for (const row of rows) {
      const code = text(row.ja_kodas);
      const provider = clean(row.ja_pavadinimas);
      if (!code || !provider || row.isreg_data || seen.has(code)) continue;
      seen.add(code);
      result.companies.push({company_code: code, provider, legal_form: forms.map.get(text(row.forma?._id)) || '', city_area: '', address: clean(row.pilnas_adresas) || clean(row.adresas), profile_url: '', source_url: `${REGISTRY_URL}/${encodeURIComponent(text(row._id))}`, registered_at: dateOnly(row.reg_data), source_id: sourceId, company_phone: '', company_email: ''});
    }
    result.observedLatestDate = rows.map(row => dateOnly(row.reg_data)).filter(Boolean).sort().at(-1) || null;
    return result;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
    deadline.abort();
  }
}

export async function fetchVacanciesBatch({cursor = null, limit = MAX_BATCH, fetchImpl = globalThis.fetch, signal, now = new Date()} = {}) {
  const sourceId = 'uzt_vacancies';
  const size = batchSize(limit);
  const today = now.toISOString().slice(0, 10);
  // Live endpoint uses a string despite the catalog schema describing this flag as integer.
  // The flag describes the last source snapshot; an expiry check is also necessary.
  const url = queryUrl(VACANCIES_URL, ['ar_aktuali_siandien="1"', `galioja_iki>=${JSON.stringify(today)}`, 'sort(-ikelimo_data,-darbo_vietos_id)'], cursor, size);
  const response = await requestJson(url, {fetchImpl, signal, sourceId});
  const rows = pageData(response.data, sourceId, size);
  const result = resultFor(sourceId, response, rows, size, now);
  const companies = new Map();
  const jobs = new Set();
  for (const row of rows) {
    const provider = clean(row.darbdavys);
    const id = text(row.darbo_vietos_id);
    const expires = dateOnly(row.galioja_iki);
    const starts = dateOnly(row.galioja_nuo);
    const title = clean(row.profesijos_pareigybes_pav);
    if (String(row.ar_aktuali_siandien) !== '1' || !expires || expires < today || (starts && starts > today) || /archyvuota/iu.test(clean(row.statusas)) || !knownProvider(provider) || !id || !title || jobs.has(id)) continue;
    jobs.add(id);
    const companyCode = text(row.jar_kodas) || null;
    const sourceUrl = `${VACANCIES_URL}/${encodeURIComponent(text(row._id))}`;
    const city = clean(row.darbo_vietos_sav_pav);
    const key = companyCode || provider.toLocaleLowerCase('lt');
    const previous = companies.get(key);
    const company = {company_code: companyCode, provider, legal_form: clean(row.teisines_formos_pav), city_area: uniqueText([previous?.city_area, city]), address: clean(row.darbdavio_bustine), profile_url: '', source_url: sourceUrl, registered_at: dateOnly(row.imones_iregistravimas), source_id: sourceId, company_phone: uniqueText([previous?.company_phone, row.darbdavio_tel_nr, row.darbdavio_mob_nr]), company_email: uniqueText([previous?.company_email, row.darbdavio_el_pastas])};
    companies.set(key, company);
    result.jobs.push({source_id: sourceId, source_job_id: id, company_code: companyCode, provider, title, city_area: city, url: sourceUrl, status: 'open', published_at: dateOnly(row.ikelimo_data), source_updated_at: response.sourceUpdatedAt, expires_at: `${expires}T23:59:59.999Z`});
  }
  result.companies = [...companies.values()];
  result.observedLatestDate = rows.map(row => dateOnly(row.ikelimo_data)).filter(Boolean).sort().at(-1) || null;
  if (!result.jobs.length) result.warnings.push('Šaltinyje nerasta šiuo metu galiojančių darbo skelbimų. Pasibaigę skelbimai neįtraukti.');
  return result;
}

// These boards are linked from each employer's official careers site. No discovery
// URLs or employer names supplied by a client are fetched. Verified 2026-09-27.
const CAREER_BOARDS = Object.freeze([
  {provider: 'Oxylabs', type: 'lever', official: 'https://career.oxylabs.io/', api: 'https://api.lever.co/v0/postings/oxylabs?mode=json&limit=250&skip=0', jobHost: 'jobs.lever.co', path: '/oxylabs/'},
  {provider: 'Hostinger', type: 'ashby', official: 'https://www.hostinger.com/career', api: 'https://api.ashbyhq.com/posting-api/job-board/hostinger', jobHost: 'jobs.ashbyhq.com', path: '/hostinger/'},
]);
const LT_LOCATION = /(?:^|\b)(?:vilnius|kaunas|klaip[ėe]da|[šs]iauliai|panev[ėe][žz]ys|alytus|marijampol[ėe]|lithuania|lietuva)(?:\b|$)/iu;

function careerCursor(cursor) {
  if (cursor === null || cursor === undefined) return {board: 0, offset: 0};
  const match = typeof cursor === 'string' && /^careers:(\d):(\d{1,5})$/.exec(cursor);
  if (!match || Number(match[1]) >= CAREER_BOARDS.length) throw new TypeError('Netinkamas karjeros šaltinio puslapio žymeklis.');
  return {board: Number(match[1]), offset: Number(match[2])};
}

function careerLocation(job, board) {
  if (board.type === 'lever') {
    const locations = [job.categories?.location, ...(Array.isArray(job.categories?.allLocations) ? job.categories.allLocations : [])].map(clean).filter(Boolean);
    const matching = locations.filter(location => LT_LOCATION.test(location));
    if (!matching.length && text(job.country).toUpperCase() !== 'LT') return null;
    return uniqueText(matching.length ? matching : locations.length ? locations : ['Lithuania']);
  }
  const locations = [{location: job.location, address: job.address}, ...(Array.isArray(job.secondaryLocations) ? job.secondaryLocations : [])];
  const matching = locations.filter(location => ['LT', 'Lithuania', 'Lietuva'].includes(text(location.address?.postalAddress?.addressCountry)) || LT_LOCATION.test(clean(location.location)) || LT_LOCATION.test(clean(location.address?.postalAddress?.addressLocality)));
  if (!matching.length) return null;
  return uniqueText(matching.map(location => clean(location.address?.postalAddress?.addressLocality) || clean(location.location) || 'Lithuania'));
}

function verifiedJobUrl(value, board) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === board.jobHost && url.pathname.startsWith(board.path) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

export async function fetchCareerBatch({cursor = null, limit = MAX_BATCH, fetchImpl = globalThis.fetch, signal, now = new Date()} = {}) {
  const {board: boardIndex, offset} = careerCursor(cursor);
  return readCareerBoard(CAREER_BOARDS[boardIndex],{sourceId:'company_careers',offset,size:batchSize(limit),fetchImpl,signal,now,next:nextOffset=>nextOffset!==null?`careers:${boardIndex}:${nextOffset}`:boardIndex+1<CAREER_BOARDS.length?`careers:${boardIndex+1}:0`:null});
}

export async function fetchCareerBoardBatch({boardId,cursor=null,limit=MAX_BATCH,fetchImpl=globalThis.fetch,signal,now=new Date()}={}) {
  const board=CAREER_BOARD_SOURCES.find(item=>item.id===boardId);
  if(!board)throw new TypeError('Nežinomas patvirtintas karjeros šaltinis.');
  const prefix=`board:${board.id}:`,offsetText=cursor===null||cursor===undefined?'0':typeof cursor==='string'&&cursor.startsWith(prefix)?cursor.slice(prefix.length):'';
  if(!/^\d{1,5}$/.test(offsetText))throw new TypeError('Netinkamas karjeros šaltinio puslapio žymeklis.');
  return readCareerBoard(board,{sourceId:board.id,offset:Number(offsetText),size:batchSize(limit),fetchImpl,signal,now,next:nextOffset=>nextOffset===null?null:prefix+nextOffset});
}

async function readCareerBoard(board,{sourceId,offset,size,fetchImpl,signal,now,next}) {
  const response = await requestJson(board.api, {fetchImpl, signal, sourceId});
  const rows = board.type === 'lever' ? response.data : response.data?.jobs;
  if (!Array.isArray(rows) || rows.length > 2000 || rows.some(row => !row || typeof row !== 'object' || Array.isArray(row))) throw sourceError(sourceId, 'source_invalid_schema', 'Pasikeitė karjeros šaltinio duomenų struktūra.');
  const warnings = [];
  // Lever supports a bounded request; Ashby's documented public API is a complete
  // board response. The byte and row caps above bound that non-paginated response.
  if (board.type === 'lever' && rows.length >= MAX_BATCH) warnings.push(`${board.provider}: pasiekta 250 skelbimų vieno karjeros puslapio riba; dalis pozicijų gali būti neįtraukta.`);
  const seen = new Set();
  const matching = [];
  for (const row of rows) {
    const id = clean(row.id);
    const title = clean(board.type === 'lever' ? row.text : row.title);
    const location = careerLocation(row, board);
    const url = verifiedJobUrl(board.type === 'lever' ? row.hostedUrl : row.jobUrl, board);
    if (!id || !title || location === null || !url || row.isListed === false || seen.has(id)) continue;
    if(board.id&&/talent pool|future (?:opportunit|position|role)|general application|spontaneous application|open application|join.{0,20}talent|^apply here: future\b|didn.t find your role/iu.test(title))continue;
    seen.add(id);
    matching.push({source_id: sourceId, source_job_id: `${board.provider.toLowerCase()}:${id}`, company_code: null, provider: board.provider, title, city_area: location, url, status: 'open', published_at: timestamp(board.type === 'lever' ? row.createdAt : row.publishedAt), source_updated_at: response.sourceUpdatedAt, expires_at: null});
  }
  matching.sort((a, b) => (b.published_at || '').localeCompare(a.published_at || '') || a.source_job_id.localeCompare(b.source_job_id));
  const jobs = matching.slice(offset, offset + size);
  const nextCursor = next(offset + size < matching.length ? offset + size : null);
  const companies = jobs.length ? [{company_code: null, provider: board.provider, legal_form: '', city_area: uniqueText(jobs.map(job => job.city_area)), address: '', profile_url: board.official, source_url: board.official, registered_at: null, source_id: sourceId, company_phone: '', company_email: ''}] : [];
  return {sourceId, status: 'ok', companies, jobs, nextCursor, sourceUpdatedAt: response.sourceUpdatedAt, fetchedAt: now.toISOString(), warnings, rawCount: rows.length, observedLatestDate: matching[0]?.published_at || null, employer: board.provider, listingMeaning: 'Šiuo tikrinimu viešai skelbiamos darbdavio karjeros pozicijos; vietos užpildymas nepriklausomai nepatvirtintas.'};
}
