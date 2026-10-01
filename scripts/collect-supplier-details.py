"""Collect only exact SKU facts from supplier SORKE; never merge models by name."""
import concurrent.futures,json,pathlib,re,urllib.request,urllib.parse,html,hashlib
ROOT=pathlib.Path(__file__).resolve().parents[1];CACHE=ROOT/'tmp/sorke';CACHE.mkdir(exist_ok=True)
BASE='https://www.sorke.cz';PREFIX='/vetraci-a-rekuperacni-jednotky/rekuperacni-jednotky-pro-byty-a-domy'
catalog={p['sku']:p for p in json.loads((ROOT/'tmp/catalog.json').read_text())}
def fetch(path):
 f=CACHE/(hashlib.sha256(path.encode()).hexdigest()+'.html')
 if f.exists():return f.read_text()
 with urllib.request.urlopen(BASE+path,timeout=25) as r:s=r.read().decode()
 f.write_text(s);return s
def links(s):return [u for u in dict.fromkeys(re.findall(r'href="([^"]+)"',s)) if u.startswith(PREFIX)]
def plain(s):return re.sub(r'\s+',' ',html.unescape(re.sub('<[^>]+>',' ',s))).strip()
labels={'Max. množství vzduchu':'Airflow at specified pressure','Elektrické napětí':'Power supply','Výkon motoru(ů)':'Fan motor power','Krytí':'Protection class','Maximální teplota vzduchu':'Maximum air temperature','Maximální teplota oblast':'Ambient temperature range','Filtry':'Filters','Rozměry':'Casing dimensions','Váha':'Net weight (supplier)','Připojení':'Duct connections','Izolace':'Insulation thickness','Materiál':'Casing material','Účinnost rekuperace při referenční průtoku (vyvážené)':'Thermal efficiency at reference flow','Referenční průtok':'Reference airflow','Referenční tlakový rozdíl':'Reference pressure difference','SPI':'Specific power input','Topný výkon':'Heater power','Stupně rychlostí':'Fan speed control'}
root=fetch(PREFIX);families=[p for p in links(root) if p.count('/')==3]
print('Supplier families',len(families),flush=True)
products=set()
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
 for family,s in zip(families,pool.map(fetch,families)):
  products.update(u for u in links(s) if u.startswith(family+'/') and u.count('/')==4)
print('Supplier pages',len(products),flush=True)
def collect(path):
 s=fetch(path);li=[plain(x) for x in re.findall(r'<li[^>]*>(.*?)</li>',s,re.S)]
 codes=[re.search(r'Číslo dílu výrobce:\s*(AHU\d+|ACC\d+|FIT\d+|FAN\d+)\b',x) for x in li];codes=[m.group(1) for m in codes if m]
 if len(set(codes))!=1:return None
 sku=codes[0]
 if sku not in catalog or (ROOT/'assets/product-details'/f'{sku}.json').exists():return None
 rows=[]
 for x in li:
  key,sep,value=x.partition(':')
  if sep and key in labels and value.strip():rows.append([labels[key],value.strip().replace(' při ',' at ').replace(' proud ',' current ').replace('Proměnnými otáčkami','Variable speed').replace('Ocel RAL9016 a EPP','Steel RAL9016 and EPP'),''])
 if len(rows)<5:return None
 p=catalog[sku];docs=[{'name':u.split('/')[-1].replace('.pdf','').replace('_',' '),'type':'pdf','url':urllib.parse.urljoin(BASE,u)} for u in dict.fromkeys(re.findall(r'href="([^"]+\.pdf)"',s))]
 d={'sku':sku,'model':p['model'],'source':BASE+path,'sourceScope':'exact-supplier-sku','checkedAt':'2026-10-01','discontinued':False,'sections':[{'name':'Supplier technical data · SORKE','rows':rows}],'documents':docs,'features':[],'notes':[]}
 (ROOT/'assets/product-details'/f'{sku}.json').write_text(json.dumps(d,ensure_ascii=False,separators=(',',':')));return sku
recovered=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
 tasks=[pool.submit(collect,path) for path in products]
 for i,f in enumerate(concurrent.futures.as_completed(tasks),1):
  try:
   sku=f.result()
   if sku:recovered.append(sku);print('Recovered',sku,flush=True)
  except Exception as e:print('Supplier fetch failed',type(e).__name__,flush=True)
  if i%50==0:print('Progress',i,len(tasks),flush=True)
print('Supplier exact matches',len(recovered),flush=True)
(ROOT/'tmp/supplier-recovery.json').write_text(json.dumps(recovered))
