"""Collect public SALDA records; join exclusively by exact manufacturer SKU."""
import concurrent.futures, json, pathlib, re, time, urllib.request, sys
ROOT = pathlib.Path(__file__).resolve().parents[1]
CACHE = ROOT / 'tmp' / 'manufacturer'
CACHE.mkdir(parents=True, exist_ok=True)
def get(url, path):
    if path.exists(): return path.read_text()
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent':'VENTIT-CatalogResearch/1.0'})
            with urllib.request.urlopen(req, timeout=45) as r: text=r.read().decode('utf-8')
            path.write_text(text); return text
        except Exception:
            if attempt == 2: raise
            time.sleep(2)
def search(prefix):
    data=json.loads(get('https://select.salda.lt/Search?q='+prefix+'&perPage=5000',CACHE/(prefix+'.json')))
    return data
catalog_path=ROOT/'tmp/catalog.json'
if not catalog_path.exists():
    get('https://fihyzcabvrndsztlsufg.supabase.co/functions/v1/vent-shop-products',catalog_path)
catalog=json.loads(catalog_path.read_text())
wanted={p['sku'] for p in catalog}
records={}
for prefix in ['AHU','ACC','FIT','FAN']:
    data=search(prefix)
    print(prefix,data.get('pagingInfo'),flush=True)
    for p in data.get('results',[]):
        if p.get('code') in wanted: records[p['code']]=p
(CACHE/'matches.json').write_text(json.dumps(records))
print('Exact SKU matches',len(records),'of',len(wanted),flush=True)
def detail(item):
    sku,p=item
    text=get('https://select.salda.lt/Product/Index/'+str(p['id']),CACHE/(sku+'.html'))
    match=re.search(r'var data = (.*?);\s*window.bootstrapApplication',text,re.S)
    if not match: raise ValueError('Product payload missing: '+sku)
    data=json.loads(match[1])
    if data.get('code')!=sku: raise ValueError('SKU mismatch: '+sku)
    (CACHE/(sku+'.json')).write_text(json.dumps(data,ensure_ascii=False))
    return sku
errors=[]
items=list(records.items())
if '--reverse' in sys.argv: items.reverse()
items=[item for item in items if not (CACHE/(item[0]+'.json')).exists()]
with concurrent.futures.ThreadPoolExecutor(max_workers=14 if '--reverse' in sys.argv else 10) as pool:
    tasks={pool.submit(detail,item):item[0] for item in items}
    for i,f in enumerate(concurrent.futures.as_completed(tasks),1):
        try: f.result()
        except Exception as e: errors.append({'sku':tasks[f],'error':str(e)})
        if i%25==0: print('Fetched',i,'/',len(tasks),'errors',len(errors),flush=True)
(CACHE/'errors.json').write_text(json.dumps(errors))
print('Finished',len(records)-len(errors),'errors',len(errors),flush=True)
