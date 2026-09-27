import {createEmployerCatalog} from './employers.mjs';
import {createHash} from 'node:crypto';

const text = value => String(value ?? '').trim();
const key = value => text(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('lt').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const code = value => /^\d{7,12}$/.test(text(value)) ? text(value) : '';
const legalName = value => key(value).replace(/^(?:uab|mb|ab|ii|vsi)\s+|\s+(?:uab|mb|ab|ii|vsi)$/g, '').trim();
const legalForm = value => key(value).match(/^(uab|mb|ab|ii|vsi)(?:\s|$)|(?:^|\s)(uab|mb|ab|ii|vsi)$/)?.slice(1).find(Boolean) || '';
const sharedHosts = /(^|\.)(?:facebook\.com|linkedin\.com|cvbankas\.lt|cvonline\.lt|cvmarket\.lt|darbo\.lt|rekvizitai\.vz\.lt|ashbyhq\.com|lever\.co|greenhouse\.io)$/;
const sourceName = source => ({company_careers: 'Įmonės karjeros puslapis', uzt_vacancies: 'Užimtumo tarnyba'}[source] || 'Viešas crawlerio šaltinis');
const join = (...values) => [...new Set(values.flatMap(value => text(value).split(';').map(text)).filter(Boolean))].join('; ') || null;
const category = value => !text(value) || ['unknown', 'null', 'undefined', 'n a', 'nezinoma', 'nenurodyta', 'nezinomas'].includes(key(value)) || !/[\p{L}]/u.test(text(value)) ? 'Kita' : text(value);

// Only tracking parameters are removed; application IDs and meaningful query values survive.
export function canonicalJobUrl(value) {
  try {
    const url = new URL(text(value));
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return '';
    url.hash = '';
    url.hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    for (const name of [...url.searchParams.keys()]) if (/^(?:utm_|fbclid$|gclid$|dclid$|msclkid$|mc_cid$|mc_eid$)/i.test(name)) url.searchParams.delete(name);
    url.searchParams.sort();
    url.pathname = url.pathname.replace(/\/+$/, '') || '/';
    return url.href;
  } catch { return ''; }
}

function officialHost(value) {
  try {
    const url = new URL(text(value));
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return '';
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    return sharedHosts.test(host) ? '' : host;
  } catch { return ''; }
}

function sameCompany(company, incoming) {
  const a = code(company['Įmonės kodas']), b = code(incoming.company_code);
  if (a && b) return a === b;
  const host = officialHost(company['Svetainė']);
  if (!host || host !== officialHost(incoming.profile_url)) return false;
  const name = legalName(company['Įmonė']);
  if (name.length < 4 || ['imone', 'darbdavys', 'statyba', 'paslaugos', 'kontaktai', 'darbas'].includes(name) || name !== legalName(incoming.provider)) return false;
  const leftForm = legalForm(company['Įmonė']), rightForm = legalForm(incoming.legal_form) || legalForm(incoming.provider);
  return !leftForm || !rightForm || leftForm === rightForm;
}

function activeJobs(company, now) {
  return company.jobs.filter(job => {
    if (job.status !== 'open') return false;
    if (job.expires_at != null && text(job.expires_at) && Date.parse(job.expires_at) < now) return false;
    if (job.last_seen != null && text(job.last_seen) && Date.parse(job.last_seen) < now - 48 * 60 * 60 * 1000) return false;
    return true;
  });
}

function validateCompanies(records) {
  const ids = new Set();
  for (const company of records) {
    if (!company || typeof company !== 'object' || !text(company.id) || !text(company.provider) || !Array.isArray(company.jobs) || ids.has(text(company.id))) throw new Error('Invalid crawler company snapshot');
    ids.add(text(company.id));
    for (const job of company.jobs) {
      if (!job || typeof job !== 'object' || !text(job.title) || !['open', 'closed', 'unknown'].includes(job.status) || !canonicalJobUrl(job.url)) throw new Error('Invalid crawler job');
      for (const field of ['expires_at', 'last_seen']) if (text(job[field]) && !Number.isFinite(Date.parse(job[field]))) throw new Error('Invalid crawler job time');
    }
  }
}

/** Rebuild from the immutable import every time, so closed live jobs never accumulate. */
export function mergeLiveEmployers(base = {}, records = [], {now = Date.now()} = {}) {
  validateCompanies(records);
  const companies = structuredClone(base.companies || []), jobs = structuredClone(base.jobs || []), contactSources = structuredClone(base.contactSources || []);
  const importedJobs = new Map(), crawlerJobs = new Map(), activeCounts = new Map(), seenJobs = new Map();
  for (const company of companies) seenJobs.set(text(company.ID), new Set());
  for (const job of jobs) {
    const id = text(job['Darbdavio ID']), url = canonicalJobUrl(job['Skelbimas']);
    importedJobs.set(id, (importedJobs.get(id) || 0) + 1);
    if (url) seenJobs.get(id)?.add(url);
  }
  const importedCompaniesTotal = companies.length, importedJobsTotal = jobs.length, importedIds = new Set(companies.map(company => text(company.ID)));
  let crawlerCompaniesTotal = 0, activeCrawlerJobsTotal = 0, crawlerContactCompaniesTotal = 0;
  const matchedIds = new Set(), activeJobIdentities = new Set();
  for (const incoming of records) {
    const active = activeJobs(incoming, now);
    if (!active.length) continue;
    crawlerCompaniesTotal++;
    if(text(incoming.company_phone)||text(incoming.company_email))crawlerContactCompaniesTotal++;
    const matches = companies.filter(company => sameCompany(company, incoming));
    // Ambiguous identities stay separate rather than attaching jobs to a guessed company.
    let company = matches.length === 1 ? matches[0] : null;
    if (company && importedIds.has(text(company.ID))) matchedIds.add(text(company.ID));
    if (!company) {
      let id = 'CRW_'+createHash('sha256').update(text(incoming.id)).digest('hex').slice(0,32);
      while (seenJobs.has(id)) id += '_new';
      company = {ID: id, 'Įmonė': text(incoming.provider), 'Darbdavio tipas': 'Darbdavys',
        'Darbo sritys': category(incoming.category), 'Miestai / šalys': text(incoming.city_area) || null,
        'Pareigų pavyzdžiai': null, 'Telefonas (-ai)': null, 'El. paštas (-ai)': null,
        'Svetainė': canonicalJobUrl(incoming.profile_url) || null, 'Kontaktų būsena': null,
        'Darbo portalai': null, 'Skelbimo nuoroda': null, 'Telefono šaltinis': null,
        'El. pašto šaltinis': null, 'Įmonės kodas': code(incoming.company_code) || null,
        'Skelbimo patikra': 'Aktyvus viešame šaltinyje; tikrina crawleris'};
      companies.push(company); seenJobs.set(id, new Set());
    }
    const id = text(company.ID), label = sourceName(incoming.source_id), sourceUrl = canonicalJobUrl(incoming.source_url) || canonicalJobUrl(incoming.profile_url) || null;
    company['Miestai / šalys'] = join(company['Miestai / šalys'], incoming.city_area, ...active.map(job => job.city_area));
    company['Pareigų pavyzdžiai'] = join(company['Pareigų pavyzdžiai'], ...active.map(job => job.title));
    company['Darbo portalai'] = join(company['Darbo portalai'], label);
    company['Svetainė'] ||= canonicalJobUrl(incoming.profile_url) || null;
    company['Įmonės kodas'] ||= code(incoming.company_code) || null;
    for (const [field, target, type, sourceField] of [['company_phone', 'Telefonas (-ai)', 'Telefonas', 'Telefono šaltinis'], ['company_email', 'El. paštas (-ai)', 'El. paštas', 'El. pašto šaltinis']]) {
      const value = text(incoming[field]);
      if (!value) continue;
      company[target] = join(company[target], value); company[sourceField] ||= sourceUrl;
      if (!contactSources.some(contact => text(contact['Darbdavio ID']) === id && contact['Kontakto tipas'] === type && text(contact['Kontaktas']) === value && text(contact['Šaltinio nuoroda']) === text(sourceUrl))) contactSources.push({'Darbdavio ID': id, 'Kontakto tipas': type, 'Kontaktas': value, 'Šaltinio nuoroda': sourceUrl});
    }
    company['Kontaktų būsena'] = company['Telefonas (-ai)'] && company['El. paštas (-ai)'] ? 'Telefonas ir el. paštas' : company['Telefonas (-ai)'] ? 'Telefonas' : company['El. paštas (-ai)'] ? 'El. paštas' : company['Kontaktų būsena'] || 'Kontaktą papildyti';
    for (const job of active) {
      const url = canonicalJobUrl(job.url), identity = `${id}\n${url}`;
      if (!activeJobIdentities.has(identity)) { activeJobIdentities.add(identity); activeCrawlerJobsTotal++; activeCounts.set(id, (activeCounts.get(id) || 0) + 1); }
      if (seenJobs.get(id).has(url)) continue;
      seenJobs.get(id).add(url); crawlerJobs.set(id, (crawlerJobs.get(id) || 0) + 1);
      jobs.push({'Darbdavio ID': id, 'Ieškomos pareigos': text(job.title), 'Miestai / šalys': text(job.city_area) || null, 'Šaltinis': `${sourceName(job.source_id || incoming.source_id)} · crawleris`, 'Skelbimas': url});
      company['Skelbimo nuoroda'] ||= url;
    }
  }
  const catalog = createEmployerCatalog({companies, jobs, contactSources});
  const originalDetail = catalog.detail;
  catalog.detail = id => {
    const detail = originalDetail(id);
    return detail && {...detail, imported_jobs_count: importedJobs.get(text(id)) || 0, crawler_jobs_count: crawlerJobs.get(text(id)) || 0, active_crawler_jobs_count: activeCounts.get(text(id)) || 0};
  };
  Object.assign(catalog.metadata, {source: crawlerCompaniesTotal ? 'Darbdavių importai ir gyvas crawleris' : 'Darbdavių bazė', importedCompaniesTotal, importedJobsTotal, crawlerCompaniesTotal, crawlerContactCompaniesTotal, addedCompaniesTotal: companies.length - importedCompaniesTotal, matchedCompaniesTotal: matchedIds.size, crawlerJobsTotal: jobs.length - importedJobsTotal, activeCrawlerJobsTotal});
  return catalog;
}

/** A full, paginated snapshot is committed atomically; failures retain the last good data. */
export function createLiveEmployerCatalog(base, crawler, {ttlMs = 30000, maxPages = 100, maxRefreshMs = 30000, now = Date.now} = {}) {
  if (!Number.isInteger(maxPages) || maxPages < 1 || maxPages > 100 || !Number.isFinite(ttlMs) || ttlMs < 0 || !Number.isFinite(maxRefreshMs) || maxRefreshMs < 1) throw new Error('Invalid live employer cache options');
  let records = [], catalog = mergeLiveEmployers(base, records, {now: now()}), freshUntil = 0, pending = null, generation = 0, builtAt = now();
  const status = {configured: Boolean(crawler?.configured), lastAttemptAt: null, lastSuccessAt: null, stale: Boolean(crawler?.configured), error: null};
  const decorate = () => {
    Object.assign(catalog.metadata, {liveSnapshotAt: status.lastSuccessAt, liveStale: status.stale});
    return catalog;
  };
  const getStatus = () => ({...status, refreshing: Boolean(pending), crawlerCompaniesTotal: catalog.metadata.crawlerCompaniesTotal, addedCompaniesTotal: catalog.metadata.addedCompaniesTotal, crawlerJobsTotal: catalog.metadata.crawlerJobsTotal, activeCrawlerJobsTotal: catalog.metadata.activeCrawlerJobsTotal});
  const expiredSinceBuild = () => records.some(company => company.jobs.some(job => {
    const expiry = Date.parse(job.expires_at), seenExpiry = Date.parse(job.last_seen) + 48 * 60 * 60 * 1000;
    return [expiry, seenExpiry].some(time => Number.isFinite(time) && time >= builtAt && time < now());
  }));
  async function refresh() {
    const revision = generation, startedAt = now();
    status.lastAttemptAt = new Date(now()).toISOString();
    try {
      const collected = [];
      let total, pages;
      for (let page = 1; page <= (pages ?? 1); page++) {
        if (now() - startedAt >= maxRefreshMs) throw new Error('Crawler snapshot deadline exceeded');
        const response = await crawler.request('search', {kind: 'hiring', page, pageSize: 50});
        const data = response?.data;
        if (response?.status !== 200 || !data || !Array.isArray(data.records) || !Number.isInteger(data.total) || data.total < 0 || !Number.isInteger(data.pages) || data.pages < 1 || data.pages > maxPages || data.page !== page || data.pageSize !== 50 || data.pages !== Math.max(1, Math.ceil(data.total / 50))) throw new Error('Incomplete crawler snapshot');
        if (total === undefined) { total = data.total; pages = data.pages; }
        if (data.total !== total || data.pages !== pages || data.records.length !== Math.min(50, Math.max(0, total - (page - 1) * 50))) throw new Error('Crawler snapshot changed during pagination');
        collected.push(...data.records);
      }
      if (collected.length !== total) throw new Error('Incomplete crawler snapshot');
      const next = mergeLiveEmployers(base, collected, {now: now()});
      records = collected; catalog = next; builtAt = now();
      status.lastSuccessAt = new Date(now()).toISOString(); status.stale = false; status.error = null;
    } catch {
      status.stale = true;
      status.error = 'Gyvi skelbimai laikinai neatnaujinti. Rodoma paskutinė sėkminga kopija.';
      if (expiredSinceBuild()) { catalog = mergeLiveEmployers(base, records, {now: now()}); builtAt = now(); }
    } finally { freshUntil = revision === generation ? now() + ttlMs : 0; }
    return decorate();
  }
  return {
    async getCatalog({force = false} = {}) {
      if (!status.configured) return decorate();
      if (pending) return pending;
      if (expiredSinceBuild()) { catalog = mergeLiveEmployers(base, records, {now: now()}); builtAt = now(); }
      if (!force && now() < freshUntil) return decorate();
      pending = refresh();
      try { return await pending; } finally { pending = null; }
    },
    invalidate() { generation++; freshUntil = 0; },
    getStatus,
  };
}
