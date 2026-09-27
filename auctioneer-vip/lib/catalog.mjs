export const FIELDS = [
  ['id','Įrašo ID','number'],['page','Šaltinio puslapis','number'],
  ['provider','Vardas arba įmonė','text'],['category','Veiklos sritis','text'],
  ['price_raw','Originalus įkainis','text'],['price_value','Kaina','number'],
  ['price_unit','Kainos vienetas','text'],['city_area','Teritorija (originali)','text'],
  ['rating','Įvertinimas','number'],['reviews','Atsiliepimų skaičius','number'],
  ['experience_years','Patirtis metais','number'],['profile_url','Profilio nuoroda','text'],
  ['company_phone','Telefonas','text'],['company_email','El. paštas','text'],
  ['price_parse_status','Kainos nuskaitymo būsena','text'],['crawler_status','Įrašo nuskaitymo būsena','text'],
  ['detected_provider','Aptiktas teikėjo pavadinimas','text'],['is_business','Įmonės žyma šaltinyje (0 / 1)','number'],
  ['contact_source_url','Kontaktų šaltinio nuoroda','text']
].map(([key,label,type])=>({key,label,type}));
const IMPORT_FIELDS=[
  ['additional_source_url','Papildomas šaltinis'],
  ['data_basis','Duomenų pagrindas'],
  ['source_notes','Šaltinio pastabos']
].map(([key,label])=>({key,label,type:'text'}));
export const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('lt').trim();
export function cleanCategory(value){
  const text=String(value??'').trim();
  if(!text||/^(?:\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[./-]\d{1,2}[./-]\d{4})(?:[T\s].*)?$/.test(text)||/^\d+(?:[.,]\d+)?$/.test(text))return null;
  if(new Set(['paslaugos kategorija','kategorija','category','n/a','none','null','undefined','-','—','kategorija nenurodyta','(tuscia)']).has(normalize(text)))return null;
  return text;
}
const absent = value => value === null || value === undefined || value === '';
const numeric = value => typeof value === 'number' && Number.isFinite(value);
const collator = new Intl.Collator('lt', {numeric:true,sensitivity:'base'});
const OPS = new Set(['contains','not_contains','eq','neq','gte','lte','missing','present']);
const safeNum = (value, name) => { if(absent(value)) return null; const n=Number(value); if(!Number.isFinite(n)) throw new Error(`Neteisingas skaičius: ${name}`); return n; };
export function createCatalog(records) {
  // Remove misclassified dates and labels from presentation without deleting contacts.
  records=records.map(record=>({...record,category:cleanCategory(record.category)}));
  const fields=[...FIELDS,...IMPORT_FIELDS.filter(field=>records.some(record=>!absent(record[field.key])))];
  const entries=records.map(record=>({record,city:String(record.city_area||'').split(',')[0].trim(),
    nationwide:normalize(record.city_area).includes('visa lietuva'),radius:Number(String(record.city_area||'').match(/\+(\d+)\s*km/)?.[1]||0),
    index:normalize(Object.values(record).join(' '))}));
  const distinct = key=>[...new Set(records.map(r=>r[key]).filter(v=>!absent(v)))].sort((a,b)=>collator.compare(String(a),String(b)));
  const metadata={total:records.length,source:'Paslaugų teikėjų importai',fields,categories:distinct('category'),units:distinct('price_unit'),
    cities:[...new Set(entries.map(e=>e.city).filter(Boolean))].sort(collator.compare),
    missingPrice:records.filter(r=>!numeric(r.price_value)).length,missingPhone:records.filter(r=>absent(r.company_phone)).length,
    missingEmail:records.filter(r=>absent(r.company_email)).length,
    businessFlagReliable:records.some(r=>r.is_business===1),
    distinct:{price_parse_status:distinct('price_parse_status'),crawler_status:distinct('crawler_status')}};
  function search(input={}) {
    const q=normalize(input.q).slice(0,300), category=String(input.category||''), city=String(input.city||''), unit=String(input.unit||'');
    const min=safeNum(input.minPrice,'Kaina nuo'),max=safeNum(input.maxPrice,'Kaina iki');
    if(min!==null && max!==null && min>max) throw new Error('Kaina nuo negali būti didesnė už kainą iki.');
    const rules=Array.isArray(input.rules)?input.rules:[];
    if(rules.length>30) throw new Error('Galima naudoti iki 30 papildomų filtrų.');
    for(const r of rules) {
      if(!fields.some(f=>f.key===r.field)||!OPS.has(r.op)) throw new Error('Nežinomas filtras.');
      if(['gte','lte'].includes(r.op) && (!fields.some(f=>f.key===r.field&&f.type==='number') || safeNum(r.value,r.field)===null)) throw new Error('Skaitiniam filtrui reikia skaičiaus.');
      if(String(r.value??'').length>500) throw new Error('Per ilga filtro reikšmė.');
    }
    const matchRule=(record,rule)=>{
      const v=record[rule.field];
      if(rule.op==='missing') return absent(v);
      if(rule.op==='present') return !absent(v);
      if(absent(v)) return false;
      const a=rule.field==='company_phone'?String(v).replace(/[^\d+]/g,''):normalize(v);
      const b=rule.field==='company_phone'?String(rule.value??'').replace(/[^\d+]/g,''):normalize(rule.value);
      switch(rule.op){
        case 'contains':return a.includes(b); case 'not_contains':return !a.includes(b);
        case 'eq':return a===b;case 'neq':return a!==b;
        case 'gte':return numeric(v)&&v>=Number(rule.value);case 'lte':return numeric(v)&&v<=Number(rule.value);
      }
    };
    const tokens=q.split(/\s+/).filter(Boolean);
    const candidates=entries.filter(e=>tokens.every(t=>e.index.includes(t))
      && (!category||(category==='__missing__'?absent(e.record.category):e.record.category===category))
      && (!unit||(unit==='__missing__'?absent(e.record.price_unit):e.record.price_unit===unit))
      && (!input.coverage||(input.coverage==='nationwide'?e.nationwide:input.coverage==='radius'?e.radius>0:e.radius===Number(input.coverage)))
      && (min===null||(numeric(e.record.price_value)&&e.record.price_value>=min))
      && (max===null||(numeric(e.record.price_value)&&e.record.price_value<=max))
      && (!input.withPhone||!absent(e.record.company_phone))
      && (!input.withEmail||!absent(e.record.company_email))
      && (!input.withPrice||numeric(e.record.price_value))
      && (!rules.length||(input.ruleMode==='any'?rules.some(r=>matchRule(e.record,r)):rules.every(r=>matchRule(e.record,r)))));
    const availableCities=input.includeNationwide===true&&candidates.some(e=>e.nationwide)
      ?metadata.cities:[...new Set(candidates.map(e=>e.city).filter(Boolean))].sort(collator.compare);
    let matching=candidates.filter(e=>!city||e.city===city||(input.includeNationwide===true&&e.nationwide));
    const allowedSorts=new Set(['price_asc','price_desc','name_asc','name_desc','rating_desc','reviews_desc','experience_desc','city_asc']);
    const sort=allowedSorts.has(input.sort)?input.sort:'price_asc';
    const [kind,dir]=sort.split('_');
    const key={price:'price_value',name:'provider',rating:'rating',reviews:'reviews',experience:'experience_years',city:'city_area'}[kind];
    matching.sort((a,b)=>{
      const av=a.record[key],bv=b.record[key];
      if(absent(av)!==absent(bv)) return absent(av)?1:-1;
      const order=numeric(av)&&numeric(bv)?av-bv:collator.compare(String(av??''),String(bv??''));
      return (dir==='desc'?-order:order)||collator.compare(a.record.provider,b.record.provider)||a.record.id-b.record.id;
    });
    const pageSize=[25,50,100].includes(Number(input.pageSize))?Number(input.pageSize):25;
    const pages=Math.max(1,Math.ceil(matching.length/pageSize));
    const requestedPage=Number(input.page);
    const page=Math.max(1,Math.min(pages,Number.isFinite(requestedPage)?Math.floor(requestedPage):1));
    const units=[...new Set(matching.map(e=>e.record.price_unit).filter(v=>!absent(v)))];
    return {total:matching.length,page,pages,pageSize,sort,mixedUnits:units.length>1,units,availableCities,
      missingPrice:matching.filter(e=>!numeric(e.record.price_value)).length,
      records:matching.slice((page-1)*pageSize,page*pageSize).map(e=>e.record)};
  }
  return {metadata,search};
}
