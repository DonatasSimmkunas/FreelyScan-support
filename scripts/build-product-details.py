"""Publish factual manufacturer fields and provenance, without joining by name."""
import json, pathlib, re, html, collections
ROOT=pathlib.Path(__file__).resolve().parents[1]
cache=ROOT/'tmp/manufacturer'
catalog=json.loads((ROOT/'tmp/catalog.json').read_text())
def plain(s): return re.sub(r'\s+',' ',html.unescape(re.sub('<[^>]+>',' ',str(s or '')))).strip()
def ecodesign_rows(table, prefix=''):
    rows=[]
    for name in table.get('modelMeta',{}).get('fields',[]):
        v=table.get(name,{})
        if not isinstance(v,dict): continue
        if 'modelMeta' in v:
            rows.extend(ecodesign_rows(v,prefix+plain(v['modelMeta'].get('name') or name)+' · '));continue
        value=v.get('displayValue',v.get('value'))
        if value not in (None,'') and not isinstance(value,(list,dict)):
            rows.append([prefix+plain(v.get('label') or name),plain(value),plain(v.get('unit'))])
    return rows
out={}
for p in catalog:
    f=cache/(p['sku']+'.json')
    if not f.exists():
        if p['model'] not in ['Smarty 2R VEL','Smarty 2R VER','Smarty 2R VEL plus','Smarty 2R VER plus']: continue
        plus=p['model'].endswith('plus')
        url='https://www.salda.lt/rest/techpdf/techPDFdown/Smarty%202R%20VE_P0108_AZ_0003.pdf'
        rows=[['Voltage','230','V'],['Frequency','50','Hz'],['Phases','1',''],['Heat exchanger Type','Rotor',''],['Thermal efficiency up to','75','%'],['Heater power','0.6','kW'],['Heater current','2.61','A'],['Supply fan power','0.084' if plus else '0.07','kW'],['Extract fan power','0.084' if plus else '0.07','kW'],['Fan current','0.75' if plus else '0.6','A'],['Fan speed','3200' if plus else '1380','RPM'],['Fan protection class','IP54' if plus else 'IP44',''],['Fan control input','0–10','V DC'],['Total power','0.77' if plus else '0.75','kW'],['Total current','4.13' if plus else '3.91','A'],['Insulation thickness','20','mm'],['Net weight (manual)','36','kg'],['Supply air filter class','M5',''],['Extract air filter class','M5',''],['Filter model','FMK' if plus else 'MPL',''],['Filter width','270','mm'],['Filter height','85' if plus else '86','mm'],['Filter depth','173' if plus else '46','mm'],['Casing width','598','mm'],['Casing height','653','mm'],['Casing depth','320','mm']]
        out[p['sku']]={'sku':p['sku'],'model':p['model'],'source':url,'sourceScope':'archived-model-manual','checkedAt':'2026-10-01','discontinued':False,'sections':[{'name':'Archived model manual · revision P0108_AZ_0003','rows':rows}],'documents':[{'name':'Smarty 2R VE / VE plus · P0108_AZ_0003','type':'pdf','url':url}],'features':[],'notes':[]}
        continue
    d=json.loads(f.read_text())
    assert d['code']==p['sku']
    sections=[];docs=[];images=[];features=[];notes=[]
    for t in d.get('tabs',[]):
        m=t.get('model')
        if not isinstance(m,dict): continue
        if t['slug']=='general-information':
            features=[plain(x) for x in re.findall(r'<li[^>]*>(.*?)</li>',m.get('features',''),re.S)]
            features=[x for x in features if 'parameter.' not in x and not re.search(r':\s*\.?$',x) and not re.search(r'SPI only\s*\.?$',x)]
        for group in m.get('parameters',[]):
            rows=[]
            for v in group.get('parameters',[]):
                if v.get('value') not in (None,'') and 'parameter.' not in str(v.get('value')):
                    rows.append([plain(v.get('name')),plain(v['value']),plain(v.get('unitName'))])
            if rows: sections.append({'name':plain(group.get('name') or t.get('name')),'rows':rows})
        if t['slug']=='ecodesign':
            for key,table in m.items():
                if not isinstance(table,dict) or 'modelMeta' not in table: continue
                rows=ecodesign_rows(table)
                if rows: sections.append({'name':'Ecodesign / ErP','rows':rows})
        if m.get('remark'): notes.append(plain(m['remark']))
        for v in m.get('documents',[])+m.get('images',[]):
            url='https://select.salda.lt/Download/Download?input='+v['hash']
            if not any(x['url']==url for x in docs): docs.append({'name':plain(v.get('name')),'type':v.get('extension'),'size':v.get('size'),'url':url})
    out[p['sku']]={'sku':p['sku'],'model':d['name'],'source':'https://select.salda.lt/Product/Index/'+str(d['id']),'checkedAt':'2026-10-01','discontinued':d.get('isDiscontinued',False),'sections':sections,'documents':docs,'features':features,'notes':notes}
target=ROOT/'assets/product-details'
target.mkdir(parents=True,exist_ok=True)
for sku,detail in out.items():
    (target/(sku+'.json')).write_text(json.dumps(detail,ensure_ascii=False,separators=(',',':')))
(target/'coverage.json').write_text(json.dumps({'version':1,'checkedAt':'2026-10-01','catalog':len(catalog),'matched':len(out),'skus':list(out)},separators=(',',':')))
report={'catalog':len(catalog),'matched':len(out),'unmatched':[{'sku':p['sku'],'model':p['model'],'source':p['productUrl']} for p in catalog if p['sku'] not in out],'technicalRows':sum(len(s['rows']) for p in out.values() for s in p['sections'])}
(ROOT/'tmp/enrichment-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print({k:v for k,v in report.items() if k!='unmatched'})
