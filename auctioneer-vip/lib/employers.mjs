export const EMPLOYER_FIELDS = [
  ['id', 'Darbdavio ID', 'text'], ['provider', 'Įmonė', 'text'],
  ['employer_type', 'Darbdavio tipas', 'text'], ['category', 'Veiklos sritis', 'text'],
  ['city_area', 'Miestai / šalys (originalūs)', 'text'], ['positions', 'Ieškomos pareigos', 'text'],
  ['company_phone', 'Telefonai', 'text'], ['company_email', 'El. paštai', 'text'],
  ['profile_url', 'Svetainė', 'text'], ['contact_status', 'Kontaktų būsena', 'text'],
  ['jobs_count', 'Skelbimų skaičius', 'number'], ['portals', 'Darbo portalai', 'text'],
  ['listing_url', 'Skelbimo nuoroda', 'text'], ['phone_source_url', 'Telefono šaltinis', 'text'],
  ['email_source_url', 'El. pašto šaltinis', 'text'], ['company_code', 'Įmonės kodas', 'text'],
  ['listing_status', 'Skelbimo patikra', 'text'],
].map(([key, label, type]) => ({key, label, type}));

const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('lt').replace(/\s+/g, ' ').trim();
const absent = value => value == null || typeof value === 'string' && value.trim() === '';
const numeric = value => typeof value === 'number' && Number.isFinite(value);
const collator = new Intl.Collator('lt', {numeric: true, sensitivity: 'base'});
const splitValues = value => String(value ?? '').split(';').map(v => v.trim()).filter(Boolean);
const unique = values => [...new Set(values)].filter(v => !absent(v)).sort(collator.compare);
const OPS = new Set(['contains', 'not_contains', 'eq', 'neq', 'gte', 'lte', 'missing', 'present']);
const SORTS = new Set(['name_asc', 'name_desc', 'jobs_desc', 'jobs_asc', 'city_asc']);

// Explicit grammatical aliases do not infer a service radius or merge cities with districts.
const LOCATION_GROUPS = [
  ['Vilnius', 'Vilniuje'], ['Kaunas', 'Kaune'], ['Klaipėda', 'Klaipėdoje'],
  ['Šiauliai', 'Šiauliuose'], ['Panevėžys', 'Panevėžyje', 'Panevežys'],
  ['Marijampolė', 'Marijampolėje'], ['Alytus', 'Alytuje'], ['Jonava', 'Jonavoje'],
  ['Kėdainiai', 'Kėdainiuose'], ['Ukmergė', 'Ukmergėje'], ['Palanga', 'Palangoje'],
  ['Mažeikiai', 'Mažeikiuose'], ['Utena', 'Utenoje'], ['Telšiai', 'Telšiuose'],
  ['Kaišiadorys', 'Kaišiadoryse'], ['Kretinga', 'Kretingoje'], ['Lentvaris', 'Lentvaryje'],
  ['Prienai', 'Prienuose'], ['Trakai', 'Trakuose'], ['Vievis', 'Vievyje'],
  ['Elektrėnai', 'Elektrėnuose'], ['Gargždai', 'Gargžduose'], ['Tauragė', 'Tauragėje'],
  ['Druskininkai', 'Druskininkuose'], ['Plungė', 'Plungėje'], ['Širvintos', 'Širvintose'],
  ['Kazlų Rūda', 'Kazlų Rūdoje'], ['Kelmė', 'Kelmėje'], ['Molėtai', 'Molėtuose'],
  ['Birštonas', 'Birštone'], ['Radviliškis', 'Radviliškyje'], ['Kupiškis', 'Kupiškyje'],
  ['Raseiniai', 'Raseiniuose'], ['Šilutė', 'Šilutėje'], ['Anykščiai', 'Anykščiuose'],
  ['Šilalė', 'Šilalėje'], ['Rietavas', 'Rietave'], ['Šalčininkai', 'Šalčininkuose'],
  ['Joniškis', 'Joniškyje'], ['Pasvalys', 'Pasvalyje'], ['Rokiškis', 'Rokiškyje'],
  ['Nemenčinė', 'Nemenčinėje'], ['Vilkaviškis', 'Vilkaviškyje'], ['Kalvarija', 'Kalvarijoje'],
  ['Pakruojis', 'Pakruojyje'], ['Pagėgiai', 'Pagėgiuose'], ['Šakiai', 'Šakiuose'],
  ['Naujoji Akmenė', 'Naujojoje Akmenėje'], ['Garliava', 'Garliavoje'], ['Ariogala'],
  ['Vilkija'], ['Lazdijai', 'Lazdijuose'], ['Biržai', 'Biržuose', 'Biržų m.'],
  ['Skuodas', 'Skuode'], ['Kuršėnai', 'Kuršėnuose'], ['Visaginas', 'Visagine'],
  ['Ignalina', 'Ignalinoje'], ['Švenčionys', 'Švenčionyse'], ['Zarasai', 'Zarasuose'],
  ['Jurbarkas', 'Jurbarke'], ['Pabradė', 'Pabradėje'], ['Krekenava', 'Krekenavoje'],
  ['Neringa', 'Neringoje'], ['Varėna', 'Varėnoje'], ['Paberžė'],
  ['Vokietija', 'Vokietijoje'], ['Nyderlandai', 'Nyderlanduose'], ['Norvegija', 'Norvegijoje'],
  ['Švedija', 'Švedijoje'], ['Danija', 'Danijoje', 'Visa Danija'], ['Suomija', 'Suomijoje'],
  ['Belgija', 'Belgijoje'], ['Prancūzija', 'Prancūzijoje'], ['Islandija', 'Islandijoje'],
  ['Estija', 'Estijoje'], ['Ispanija', 'Ispanijoje'], ['Airija', 'Airijoje'], ['JAV'],
];
const locationAliases = new Map(LOCATION_GROUPS.flatMap(([canonical, ...aliases]) =>
  [canonical, ...aliases].map(value => [normalize(value), canonical])));

function canonicalLocation(value) {
  const cleaned = String(value ?? '').trim().replace(/\braj\./gi, 'r.').replace(/\br\.\s*sav\./gi, 'r.').replace(/\s+/g, ' ');
  return locationAliases.get(normalize(cleaned)) || cleaned;
}
const locations = value => unique(String(value ?? '').split(/[;,/]/).map(canonicalLocation).filter(value => value && normalize(value) !== 'visi'));
const textValue = value => absent(value) ? null : String(value).trim();
const phoneValue = value => String(value ?? '').split(';').map(v => v.replace(/[^\d+]/g, '')).join(';');

export function createEmployerCatalog({companies = [], jobs = [], contactSources = []} = {}) {
  if (![companies, jobs, contactSources].every(Array.isArray)) throw new Error('Netinkamas darbdavių duomenų formatas.');
  const byId = new Map();
  for (const company of companies) {
    const id = String(company.ID ?? '').trim();
    if (!id || byId.has(id)) throw new Error('Trūkstamas arba pasikartojantis darbdavio ID.');
    const record = {
      id, provider: textValue(company['Įmonė']), employer_type: textValue(company['Darbdavio tipas']),
      category: textValue(company['Darbo sritys']), city_area: textValue(company['Miestai / šalys']),
      positions: textValue(String(company['Pareigų pavyzdžiai'] ?? '').replace(/^\s*Dar\s+\d+\s+pareigų\s*[–—-]\s*lape[^\n]*$/gmi, '').trim()),
      company_phone: textValue(company['Telefonas (-ai)']), company_email: textValue(company['El. paštas (-ai)']),
      profile_url: textValue(company['Svetainė']), contact_status: textValue(company['Kontaktų būsena']),
      jobs_count: 0, portals: textValue(company['Darbo portalai']), listing_url: textValue(company['Skelbimo nuoroda']),
      phone_source_url: textValue(company['Telefono šaltinis']), email_source_url: textValue(company['El. pašto šaltinis']),
      company_code: textValue(company['Įmonės kodas']), listing_status: textValue(company['Skelbimo patikra']),
    };
    byId.set(id, {record, jobs: [], contacts: []});
  }
  for (const job of jobs) {
    const entry = byId.get(String(job['Darbdavio ID'] ?? '').trim());
    if (!entry) throw new Error('Skelbimas neturi susieto darbdavio.');
    entry.jobs.push({title: textValue(job['Ieškomos pareigos']), city_area: textValue(job['Miestai / šalys']), portal: textValue(job['Šaltinis']), url: textValue(job['Skelbimas'])});
  }
  for (const contact of contactSources) {
    const entry = byId.get(String(contact['Darbdavio ID'] ?? '').trim());
    if (!entry) throw new Error('Kontaktas neturi susieto darbdavio.');
    entry.contacts.push({type: textValue(contact['Kontakto tipas']), value: textValue(contact['Kontaktas']), url: textValue(contact['Šaltinio nuoroda'])});
  }
  const entries = [...byId.values()];
  for (const entry of entries) {
    entry.record.jobs_count = entry.jobs.length;
    entry.categories = splitValues(entry.record.category);
    entry.cities = unique([entry.record.city_area, ...entry.jobs.map(j => j.city_area)].flatMap(locations));
    entry.portals = unique([...splitValues(entry.record.portals), ...entry.jobs.map(j => j.portal)]);
    entry.categoryKeys = new Set(entry.categories.map(normalize));
    entry.cityKeys = new Set(entry.cities.map(normalize));
    entry.portalKeys = new Set(entry.portals.map(normalize));
    entry.index = normalize([
      ...Object.values(entry.record), ...entry.cities,
      ...entry.jobs.flatMap(Object.values), ...entry.contacts.flatMap(Object.values),
      ...splitValues(entry.record.company_phone).map(phoneValue),
      ...entry.contacts.filter(c => normalize(c.type) === 'telefonas').map(c => phoneValue(c.value)),
    ].join(' '));
  }
  const distinct = key => unique(entries.map(e => e.record[key]));
  const metadata = {
    total: entries.length, source: 'Darbdavių bazė', fields: EMPLOYER_FIELDS,
    categories: unique(entries.flatMap(e => e.categories)), cities: unique(entries.flatMap(e => e.cities)),
    employerTypes: distinct('employer_type'), contactStatuses: distinct('contact_status'), portals: unique(entries.flatMap(e => e.portals)),
    jobsTotal: jobs.length, missingPhone: entries.filter(e => absent(e.record.company_phone)).length,
    missingEmail: entries.filter(e => absent(e.record.company_email)).length,
  };

  function search(input = {}) {
    const rules = Array.isArray(input.rules) ? input.rules : [];
    if (rules.length > 30) throw new Error('Galima naudoti iki 30 papildomų filtrų.');
    for (const rule of rules) {
      const field = rule && EMPLOYER_FIELDS.find(f => f.key === rule.field);
      if (!field || !OPS.has(rule.op)) throw new Error('Nežinomas filtras.');
      if (String(rule.value ?? '').length > 500) throw new Error('Per ilga filtro reikšmė.');
      if (['gte', 'lte'].includes(rule.op) && (field.type !== 'number' || absent(rule.value) || !Number.isFinite(Number(rule.value)))) throw new Error('Skaitiniam filtrui reikia skaičiaus.');
    }
    const matchRule = (record, rule) => {
      const value = record[rule.field];
      if (rule.op === 'missing') return absent(value);
      if (rule.op === 'present') return !absent(value);
      if (absent(value)) return false;
      const transform = rule.field === 'company_phone' ? phoneValue : normalize;
      const a = transform(value), b = transform(rule.value);
      switch (rule.op) {
        case 'contains': return a.includes(b);
        case 'not_contains': return !a.includes(b);
        case 'eq': return a === b;
        case 'neq': return a !== b;
        case 'gte': return numeric(value) && value >= Number(rule.value);
        case 'lte': return numeric(value) && value <= Number(rule.value);
      }
    };
    const tokens = normalize(input.q).slice(0, 300).split(/\s+/).filter(Boolean);
    const category = normalize(input.category), city = normalize(canonicalLocation(input.city));
    const type = normalize(input.employerType), contactStatus = normalize(input.contactStatus), portal = normalize(input.portal);
    const candidates = entries.filter(e => tokens.every(token => e.index.includes(token))
      && (!category || e.categoryKeys.has(category))
      && (!type || normalize(e.record.employer_type) === type)
      && (!contactStatus || normalize(e.record.contact_status) === contactStatus)
      && (!portal || e.portalKeys.has(portal))
      && (!input.withPhone || !absent(e.record.company_phone)) && (!input.withEmail || !absent(e.record.company_email))
      && (!rules.length || (input.ruleMode === 'any' ? rules.some(r => matchRule(e.record, r)) : rules.every(r => matchRule(e.record, r)))));
    const availableCities = unique(candidates.flatMap(e => e.cities));
    const matching = candidates.filter(e => !city || e.cityKeys.has(city));
    const sort = SORTS.has(input.sort) ? input.sort : 'jobs_desc';
    const [kind, direction] = sort.split('_');
    const sortValue = entry => kind === 'jobs' ? entry.record.jobs_count : kind === 'city' ? entry.cities[0] : entry.record.provider;
    matching.sort((a, b) => {
      const av = sortValue(a), bv = sortValue(b);
      if (absent(av) !== absent(bv)) return absent(av) ? 1 : -1;
      const order = numeric(av) && numeric(bv) ? av - bv : collator.compare(String(av ?? ''), String(bv ?? ''));
      return (direction === 'desc' ? -order : order) || collator.compare(a.record.provider ?? '', b.record.provider ?? '') || collator.compare(a.record.id, b.record.id);
    });
    const pageSize = [25, 50, 100].includes(Number(input.pageSize)) ? Number(input.pageSize) : 25;
    const pages = Math.max(1, Math.ceil(matching.length / pageSize));
    const requestedPage = Number(input.page);
    const page = Math.max(1, Math.min(pages, Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1));
    return {total: matching.length, page, pages, pageSize, sort, availableCities, records: matching.slice((page - 1) * pageSize, page * pageSize).map(e => e.record)};
  }
  function detail(id) {
    const entry = byId.get(String(id));
    return entry ? {...entry.record, jobs: entry.jobs, contacts: entry.contacts} : null;
  }
  return {metadata, search, detail};
}
