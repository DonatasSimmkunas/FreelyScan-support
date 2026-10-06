// Pure search functions. No network, DOM, account or AI assumptions.
export const V14_CATEGORIES = {home:'Būstas',auto:'Auto',items:'Daiktai',services:'Paslaugos',jobs:'Darbai',prices:'Kainos'};
export function v14Normalize(value) {
  return String(value ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
}
function numberValue(value, unit='') {
  const n = Number(String(value).replace(/[\s\u00a0]/g,'').replace(',','.'));
  return Number.isFinite(n) ? n * (/^(k|tuk)/.test(unit) ? 1000 : 1) : null;
}
export function v14ParseQuery(value) {
  let text = v14Normalize(value);
  const p = {category:'',city:'',district:'',min:null,max:null,rooms:null,minYear:null,maxMileage:null,notGround:false,keywords:[],warnings:[]};
  const use = (re, fn) => { text = text.replace(re,(...args)=>{fn(...args);return ' ';}); };
  use(/\b(?:iki|maziau nei|maziau negu)\s*(\d+(?:[ \u00a0]\d{3})*(?:[.,]\d+)?)\s*(k\b|tukst\w*\.?)?\s*km\b/g,(_,n,u)=>p.maxMileage=numberValue(n,u));
  use(/\bnuo\s*(20\d{2})\s*(?:m(?:et\w*)?\.?)?(?!\d)/g,(_,n)=>p.minYear=Number(n));
  use(/\b(20\d{2})\s*\+/g,(_,n)=>p.minYear=Number(n));
  use(/\b(\d+)\s*kamb\w*/g,(_,n)=>p.rooms=Number(n));
  use(/\b(?:ne|nenoriu)\s*(?:1|pirm\w*)\s*aukst\w*/g,()=>p.notGround=true);
  use(/\b(iki|nuo)\s*(\d+(?:[ \u00a0]\d{3})*(?:[.,]\d+)?)\s*(k\b|tukst\w*\.?)?\s*(?:€|eur\w*)?/g,(_,direction,n,u)=>p[direction==='iki'?'max':'min']=numberValue(n,u));
  const cities = [['Vilnius',/\bviln\w*/g],['Kaunas',/\bkaun\w*/g],['Klaipėda',/\bklaiped\w*/g],['Šiauliai',/\bsiaul\w*/g],['Panevėžys',/\bpanevez\w*/g],['Alytus',/\balyt\w*/g],['Nuotoliu',/\b(?:nuotol\w*|remote)\b/g]];
  for (const [name,re] of cities) use(re,()=>{if(!p.city)p.city=name;else if(p.city!==name)p.warnings.push('Kelių miestų užklausą patikslinkite vietos filtre.');});
  for (const [name,re] of [['Žirmūnai',/\bzirmun\w*/g],['Antakalnis',/\bantakaln\w*/g]]) use(re,()=>{p.district=name;if(!p.city)p.city='Vilnius';});
  if(/\b(elektr\w*|santech\w*|meistr\w*|perdaz\w*|dazyt\w*|remont\w*|valym\w*|isval\w*|montuot\w*|paslaug\w*)/.test(text)) p.category='services';
  else if(/\b(darbas|darbo|darbai|darbuotoj\w*|marketing\w*|karjer\w*|etatas|pozic\w*)/.test(text)) p.category='jobs';
  else if(/\b(pigia\w*|palygin\w*|parduotuv\w*|dyson)\b/.test(text)) p.category='prices';
  else if(p.rooms||p.district||/\b(but\w*|bust\w*|namas|namo|namu|sklyp\w*|nt)\b/.test(text)) p.category='home';
  else if(/\b(auto\w*|toyota|rav4|audi|bmw|volkswagen|golf|hibrid\w*|hybrid|dyzel\w*|vin)\b/.test(text)) p.category='auto';
  else if(/\b(iphone|telefon\w*|dvirat\w*|daikt\w*|macbook|playstation|bald\w*|kompiut\w*)\b/.test(text)) p.category='items';
  if(/\b(rytoj|siandien|poryt|savaite|laisv\w*|po \d+|baterij\w*)/.test(text)) {
    p.warnings.push('Šioje demonstracijoje laikas, prieinamumas ir baterijos kriterijai dar netikrinami.');
    text=text.replace(/\b(?:rytoj|siandien|poryt|savaite|laisv\w*|baterij\w*)\b/g,' ').replace(/\bpo\s*\d+(?::\d+)?\s*(?:val\w*\.?)?/g,' ');
  }
  const ignored=/^(man|reikia|ieskau|ieskoti|noriu|pirkti|perku|parduoti|parduodu|nuomai|nuomoti|iki|nuo|su|ir|ar|ne|nenoriu|tik|pvz|bent|maziau|nei|negu|eur|euro|eu|val|men|m|km|gb|k|tukst|butas|buto|busta|bustas|automobilis|automobilio|automobili|auto|daiktas|daiktai|paslauga|paslaugos|paslaugu|darbas|darbo|darbai|kaina|kainos|palyginti|palyginimas|pigiausia|nauja|naujas|nauju|naudotas|naudota|naudotu)$/;
  p.keywords=text.replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(t=>t.length>1&&!/^\d+$/.test(t)&&!ignored.test(t));
  p.keywords=[...new Set(p.keywords)];
  return p;
}
function keywordMatches(word, hay) {
  const groups = {hibrid:['hibrid','hybrid'],hybrid:['hibrid','hybrid'],telefon:['telefon','iphone'],but:['but','bust'],bust:['but','bust'],elektr:['elektr','elektros'],marketing:['marketing'],nuotol:['nuotol','remote']};
  for(const [stem,alternatives] of Object.entries(groups)) if(word.startsWith(stem)) return alternatives.some(s=>hay.includes(s));
  const stem=word.length>6?word.slice(0,-2):word;
  return hay.includes(stem);
}
export function v14Search(records, query='', filters={}) {
  const p=v14ParseQuery(query);
  const num=(v)=>v===''||v===undefined||v===null?null:Number(v);
  const min=num(filters.min),max=num(filters.max);
  const category=filters.category||'';
  const city=filters.city||'';
  const matches=records.filter(x=>{
    if(x.status&&x.status!=='active')return false;
    if(p.category&&x.type!==p.category)return false;
    if(category&&x.type!==category)return false;
    if(p.city&&v14Normalize(x.loc)!==v14Normalize(p.city))return false;
    if(city&&v14Normalize(x.loc)!==v14Normalize(city))return false;
    if(p.district&&v14Normalize(x.district)!==v14Normalize(p.district))return false;
    for(const lower of [p.min,min])if(lower!==null&&(!Number.isFinite(x.amount)||x.amount<lower))return false;
    for(const upper of [p.max,max])if(upper!==null&&(!Number.isFinite(x.amount)||x.amount>upper))return false;
    if(p.rooms!==null&&Number(x.rooms)!==p.rooms)return false;
    if(p.minYear!==null&&(!x.year||Number(x.year)<p.minYear))return false;
    if(p.maxMileage!==null&&(!Number.isFinite(x.mileage)||x.mileage>p.maxMileage))return false;
    if(p.notGround&&(!x.floor||Number(x.floor)===1))return false;
    const hay=v14Normalize([x.title,x.desc,x.meta,x.loc,JSON.stringify(x.facts||{})].join(' '));
    return p.keywords.every(word=>keywordMatches(word,hay));
  });
  const sorted=matches.map((x,i)=>({x,i,score:p.keywords.reduce((sum,w)=>sum+(keywordMatches(w,v14Normalize(x.title))?2:0),0)}));
  sorted.sort((a,b)=>{
    if(filters.sort==='price-asc')return a.x.amount-b.x.amount||a.i-b.i;
    if(filters.sort==='price-desc')return b.x.amount-a.x.amount||a.i-b.i;
    if(filters.sort==='newest')return String(b.x.createdAt||'').localeCompare(String(a.x.createdAt||''))||a.i-b.i;
    return b.score-a.score||a.i-b.i;
  });
  const criteria=[];
  if(p.category)criteria.push(V14_CATEGORIES[p.category]);
  if(p.city)criteria.push(p.city);
  if(p.district)criteria.push(p.district);
  if(p.min!==null)criteria.push('Nuo '+p.min.toLocaleString('lt-LT')+' €');
  if(p.max!==null)criteria.push('Iki '+p.max.toLocaleString('lt-LT')+' €');
  if(p.rooms!==null)criteria.push(p.rooms+' kamb.');
  if(p.minYear!==null)criteria.push('Nuo '+p.minYear+' m.');
  if(p.maxMileage!==null)criteria.push('Iki '+p.maxMileage.toLocaleString('lt-LT')+' km');
  if(p.notGround)criteria.push('Ne pirmas aukštas');
  if(p.keywords.length)criteria.push('Raktažodžiai: '+p.keywords.join(', '));
  return {items:sorted.map(r=>r.x),criteria,warnings:p.warnings,parsed:p};
}
