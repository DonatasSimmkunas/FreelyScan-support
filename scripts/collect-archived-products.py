"""Recover retired exact SKUs using the manufacturer's include-discontinued session."""
import concurrent.futures,http.cookiejar,json,pathlib,re,urllib.request,urllib.parse
ROOT=pathlib.Path(__file__).resolve().parents[1];CACHE=ROOT/'tmp/manufacturer'
jar=http.cookiejar.CookieJar();opener=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
def get(url):
 with opener.open(urllib.request.Request(url,headers={'User-Agent':'VENTIT-CatalogResearch/1.0'}),timeout=30) as r:return r.read().decode()
get('https://select.salda.lt/Catalogue/SetIncludeDiscontinued?includeDiscontinued=true')
wanted={r['sku'] for r in json.loads((ROOT/'tmp/catalog.json').read_text())};matches={}
for prefix in ['AHU','ACC','FIT','FAN']:
 data=json.loads(get('https://select.salda.lt/Search?q='+prefix+'&perPage=5000'))
 for p in data.get('results',[]):
  if p.get('code') in wanted and not (CACHE/(p['code']+'.json')).exists():matches[p['code']]=p
 print(prefix,'additional candidates',len(matches),flush=True)
def detail(item):
 sku,p=item;text=get('https://select.salda.lt/Product/Index/'+str(p['id']));m=re.search(r'var data = (.*?);\s*window.bootstrapApplication',text,re.S)
 if not m:return False
 d=json.loads(m[1])
 if d.get('code')!=sku:return False
 (CACHE/(sku+'.json')).write_text(json.dumps(d,ensure_ascii=False));return True
ok=0
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
 for f in concurrent.futures.as_completed([pool.submit(detail,x) for x in matches.items()]):
  try:ok+=bool(f.result())
  except Exception as e:print(type(e).__name__,flush=True)
print('Recovered exact SKUs',ok,flush=True)
