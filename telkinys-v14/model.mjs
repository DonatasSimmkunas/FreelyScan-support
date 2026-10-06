export const V14_STORAGE = 'telkinys.v14.workspace';
export const V14_LOCAL_CATEGORIES = ['home','auto','items','services','jobs'];
export function v14PrepareCatalog(catalog) {
  const meta={
    h1:{amount:169000,rooms:2,floor:4,year:2020,district:'Žirmūnai',summary:'Pavyzdinis dviejų kambarių butas su balkonu.'},
    h2:{amount:184500,rooms:3,floor:2,district:'Antakalnis',summary:'Pavyzdinis trijų kambarių butas renovuotame name.'},
    a1:{amount:24900,year:2021,mileage:74000,summary:'Pavyzdinis hibridinis automobilis su automatine pavarų dėže.'},
    a2:{amount:22650,year:2020,mileage:91000,summary:'Pavyzdinis Toyota RAV4 hibridas. Duomenys skirti paieškai išbandyti.'},
    s1:{amount:35,unit:'€/val.',summary:'Elektros gedimų diagnostikos ir smulkaus remonto paslaugos pavyzdys.'},
    s2:{amount:40,unit:'€/val.',summary:'Elektros instaliacijos ir avarinių darbų paslaugos pavyzdys.'},
    j1:{amount:2800,upper:3600,unit:'€/mėn. bruto',summary:'Pavyzdinė augimo rinkodaros pozicija hibridiniu darbo modeliu.'},
    j2:{amount:3400,upper:4200,unit:'€/mėn. bruto',summary:'Pavyzdinė senior performance marketing pozicija nuotoliu.'},
    i1:{amount:749,summary:'Pavyzdinis naudotas iPhone 15 Pro, 256 GB.'},
    i2:{amount:689,summary:'Pavyzdinis naudotas iPhone 15 Pro, 128 GB.'},
    p1:{amount:519,summary:'Demonstracinė Dyson V15 kaina. Tikros parduotuvių kainos dar neprijungtos.'},
    p2:{amount:829,summary:'Demonstracinė naujo iPhone kaina. Tai ne realus parduotuvės pasiūlymas.'}
  };
  return Array.from(catalog,(x,i)=>{
    const facts={...x.facts};
    for(const key of ['Reitingas','Darbai','Atsakymas','Garantija','Dokumentai','Min','Mediana','Pardavėjai','Pokytis','Atnaujinta','Naujas','Naudotas'])delete facts[key];
    return {...x,...meta[x.id],desc:meta[x.id]?.summary||'Demonstracinis pasiūlymas.',facts,unit:meta[x.id]?.unit||'€',loc:x.loc==='Remote'?'Nuotoliu':x.loc==='Online'?'Internetu':x.loc,status:'active',demo:true,own:false,images:[],createdAt:new Date(Date.UTC(2026,8,28,8,0,i)).toISOString()};
  });
}
export function v14ValidLocal(x) {
  if(!x||typeof x!=='object'||!/^local-[a-f0-9-]{36}$/.test(x.id||'')||!V14_LOCAL_CATEGORIES.includes(x.type))return null;
  if(typeof x.title!=='string'||x.title.trim().length<5||x.title.length>120||typeof x.desc!=='string'||x.desc.trim().length<10||x.desc.length>3000)return null;
  if(typeof x.loc!=='string'||!x.loc.trim()||x.loc.length>80||!Number.isFinite(x.amount)||x.amount<0||x.amount>1000000000)return null;
  const numeric=(v,min,max)=>Number.isFinite(v)&&v>=min&&v<=max?v:null;
  const images=Array.isArray(x.images)?x.images.filter(s=>typeof s==='string'&&s.length<=600000&&/^data:image\/(?:jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(s)).slice(0,3):[];
  return {id:x.id,type:x.type,title:x.title.trim(),desc:x.desc.trim(),loc:x.loc.trim(),amount:x.amount,unit:['€','€/val.','€/mėn. bruto'].includes(x.unit)?x.unit:'€',district:typeof x.district==='string'?x.district.slice(0,80):'',rooms:numeric(x.rooms,1,50),floor:numeric(x.floor,1,200),year:numeric(x.year,1900,2100),mileage:numeric(x.mileage,0,2000000),images,status:x.status==='archived'?'archived':'active',createdAt:typeof x.createdAt==='string'&&Number.isFinite(Date.parse(x.createdAt))?x.createdAt:new Date().toISOString(),demo:false,own:true,facts:{}};
}
export function v14ValidWorkspace(raw) {
  const data=raw&&typeof raw==='object'?raw:{};
  return {version:1,records:Array.isArray(data.records)?data.records.slice(0,50).map(v14ValidLocal).filter(Boolean):[],favorites:Array.isArray(data.favorites)?[...new Set(data.favorites.filter(s=>typeof s==='string'&&s.length<80))].slice(0,100):[],searches:Array.isArray(data.searches)?data.searches.filter(s=>typeof s==='string'&&s.trim()&&s.length<=2000).slice(0,20):[]};
}
