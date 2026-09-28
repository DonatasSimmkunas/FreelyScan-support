// Current-page visual explorer. No precise locations or commercial relationships are inferred.
const app=document.getElementById('appView');
if(app){
  const SVG='http://www.w3.org/2000/svg',fmt=new Intl.NumberFormat('lt-LT');
  const cities=[['Vilnius',25.28,54.69,'vilni'],['Kaunas',23.90,54.90,'kaun'],['Klaipėda',21.14,55.71,'klaiped'],['Šiauliai',23.32,55.93,'siaul'],['Panevėžys',24.35,55.73,'panevez'],['Alytus',24.05,54.40,'alyt'],['Marijampolė',23.35,54.56,'marijamp'],['Mažeikiai',22.34,56.31,'mazeik'],['Jonava',24.28,55.07,'jonav'],['Utena',25.60,55.50,'uten'],['Kėdainiai',23.98,55.29,'kedain'],['Telšiai',22.25,55.98,'tels'],['Tauragė',22.29,55.25,'taurag'],['Ukmergė',24.77,55.25,'ukmerg'],['Visaginas',26.44,55.60,'visagin'],['Plungė',21.85,55.91,'plung'],['Kretinga',21.25,55.89,'kreting'],['Šilutė',21.48,55.34,'silut'],['Palanga',21.07,55.92,'palang'],['Radviliškis',23.54,55.81,'radvilisk'],['Gargždai',21.40,55.71,'gargzd'],['Druskininkai',23.97,54.02,'druskin'],['Rokiškis',25.59,55.96,'rokisk'],['Biržai',24.75,56.20,'birz'],['Elektrėnai',24.66,54.79,'elektren'],['Trakai',24.93,54.64,'trak'],['Jurbarkas',22.77,55.08,'jurbark'],['Anykščiai',25.10,55.53,'anyksc'],['Šakiai',23.05,54.95,'saki'],['Šilalė',22.18,55.49,'silal'],['Vilkaviškis',23.03,54.65,'vilkavisk'],['Prienai',23.95,54.63,'prien'],['Kaišiadorys',24.45,54.86,'kaisiador'],['Kelmė',22.94,55.63,'kelm'],['Pasvalys',24.40,56.06,'pasval'],['Zarasai',26.25,55.73,'zaras'],['Molėtai',25.42,55.23,'molet'],['Švenčionys',26.16,55.14,'svencion'],['Ignalina',26.16,55.34,'ignal'],['Skuodas',21.53,56.27,'skuod'],['Pakruojis',23.86,55.98,'pakruoj'],['Širvintos',24.97,55.04,'sirvint'],['Raseiniai',23.12,55.38,'rasein'],['Lazdijai',23.51,54.23,'lazdij'],['Varėna',24.57,54.21,'varen']];
  const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const territory=record=>String(record.city_area||'').split(',')[0].trim();
  const dispatch=(type,detail)=>window.dispatchEvent(new CustomEvent(type,{detail}));
  function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
  function svgNode(tag,attrs={}){const node=document.createElementNS(SVG,tag);for(const[key,value]of Object.entries(attrs))node.setAttribute(key,String(value));return node;}
  const explorer=element('details','vip-hologram');explorer.id='vipHologram';explorer.open=false;
  explorer.innerHTML='<summary><span class="holo-emblem" aria-hidden="true">◈</span><span><strong>Lietuvos holograma</strong><small>Žemėlapis ir įmonių galaktika</small></span><span class="holo-summary-arrow" aria-hidden="true">⌄</span></summary><div class="holo-body"><div class="holo-tabs" role="tablist" aria-label="Duomenų vaizdas"><button type="button" role="tab" id="holoMapTab" aria-controls="holoPanel" aria-selected="true" data-holo-view="map">Lietuvos holograma</button><button type="button" role="tab" id="holoGalaxyTab" aria-controls="holoPanel" aria-selected="false" tabindex="-1" data-holo-view="galaxy">Įmonių galaktika</button></div><p class="holo-scope"></p><div id="holoPanel" role="tabpanel" aria-labelledby="holoMapTab"><div class="holo-stage"><div class="holo-depth-grid" aria-hidden="true"></div><div class="holo-scan" aria-hidden="true"></div><span class="holo-projection" aria-hidden="true"></span><svg class="holo-visual" viewBox="0 0 900 430" aria-hidden="true" focusable="false"></svg><p class="holo-empty" hidden></p></div><p class="holo-explanation"></p><div class="holo-list" aria-label="Pasirinkti rezultatą"></div></div></div>';
  (document.getElementById('liveCatalogNote')||app.querySelector('.stats'))?.after(explorer);
  const visual=explorer.querySelector('.holo-visual'),list=explorer.querySelector('.holo-list'),scope=explorer.querySelector('.holo-scope'),explanation=explorer.querySelector('.holo-explanation'),empty=explorer.querySelector('.holo-empty'),projection=explorer.querySelector('.holo-projection');
  let records=[],view='map',currentPage=1,resultTotal=0,niche='services';
  const button=(label,description,action)=>{const b=element('button','holo-result');b.type='button';b.append(element('span','',label),element('small','',description));b.addEventListener('click',action);return b;};
  const label=(x,y,text,className)=>{const node=svgNode('text',{x,y,class:className});node.textContent=text;visual.append(node);};
  function dot(x,y,r,index,action){const g=svgNode('g',{class:'holo-point','data-holo-index':index,transform:`translate(${x} ${y})`});g.append(svgNode('circle',{r:23,class:'holo-hit'}),svgNode('circle',{r:r+7,class:'holo-ring'}),svgNode('circle',{r,class:'holo-core'}));g.addEventListener('click',action);visual.append(g);return g;}
  function renderMap(){
    // Natural Earth 1:110m country outline, public domain; city points are approximate centres.
    visual.append(svgNode('path',{d:"M768.83 167.12 L779.95 219.23 L682.93 256.48 L655.47 322.15 L527.00 365.97 L412.62 365.18 L384.21 329.34 L323.51 316.90 L314.04 287.21 L326.67 255.36 L274.36 236.89 L150.43 216.52 L125.27 118.73 L260.80 83.05 L459.26 90.51 L575.51 79.01 L592.11 103.21 L655.08 110.68 L768.83 167.12 Z",class:'holo-country'}));
    const clusters=new Map();let unmapped=0;
    for(const record of records){let mapped=false;const seen=new Set(),areas=niche==='employers'?String(record.city_area||'').split(/[;,/]/).map(s=>s.trim()):[territory(record)];for(const sourceArea of areas){const normal=normalize(sourceArea),city=cities.find(c=>new RegExp(`^${c[3]}`).test(normal));if(!city||/[;/]/.test(sourceArea))continue;const area=niche==='employers'&&!/\br(?:aj)?\./i.test(sourceArea)?city[0]:sourceArea;if(seen.has(area))continue;seen.add(area);mapped=true;if(!clusters.has(area))clusters.set(area,{city,area,count:0});clusters.get(area).count++;}if(!mapped)unmapped++;}
    const groups=[...clusters.values()].sort((a,b)=>b.count-a.count||a.area.localeCompare(b.area,'lt'));
    projection.textContent='LIETUVA / SCHEMINĖ PROJEKCIJA';
    for(const city of cities)visual.append(svgNode('circle',{cx:95+(city[1]-20.8)/6.0*710,cy:355-(city[2]-54.0)/2.45*285,r:2,class:'holo-reference-city'}));
    for(const [i,g]of groups.entries()){
      const x=95+(g.city[1]-20.8)/6.0*710,y=355-(g.city[2]-54.0)/2.45*285,activate=()=>dispatch('vip:select-city',{city:g.area});
      dot(x,y,Math.min(12,5+Math.sqrt(g.count)),i,activate);
      if(i<8)label(Math.min(775,x+16),y-12,`${g.city[0]} · ${g.count}`,'holo-city-label');
      list.append(button(g.area,`${fmt.format(g.count)} įraš. · filtruoti`,activate));
    }
    empty.hidden=groups.length>0;empty.textContent=records.length?'Šiame puslapyje nėra atpažintų Lietuvos vietovių.':'Vaizdas atsiras gavus paieškos rezultatus.';
    explanation.textContent=`Blankūs taškai – orientaciniai miestai; ryškūs – šio puslapio įrašai. Apytikrės centrų vietos, ne kontaktų adresai. ${fmt.format(unmapped)} iš ${fmt.format(records.length)} įrašų be atpažintos vietovės. Paspauskite vietovę ir pritaikykite filtrą.`;
  }
  function renderGalaxy(){
    const selected=records.slice(0,25),n=selected.length;
    const nodes=selected.map((record,i)=>{const angle=i*2.39996323,radius=n===1?0:35+Math.sqrt(i/Math.max(1,n-1))*155;return{record,x:450+Math.cos(angle)*radius*1.95,y:210+Math.sin(angle)*radius,city:normalize(territory(record)),category:normalize(record.category)};});
    let edges=0;
    for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
      const a=nodes[i],b=nodes[j],sameCity=a.city&&a.city===b.city&&!/nenurodyta|visa lietuva/.test(a.city),sameCategory=a.category&&a.category===b.category&&!/^(kita|nenurodyta|__missing__)$/.test(a.category);
      if((sameCity||sameCategory)&&edges<80){const line=svgNode('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:sameCity?'holo-link holo-link-city':'holo-link'});const title=svgNode('title');title.textContent=sameCity?'Sutampa nurodyta vietovė':'Sutampa veiklos sritis';line.append(title);visual.append(line);edges++;}
    }
    projection.textContent='ĮMONĖS / BENDRI POŽYMIAI';
    for(const[nodeIndex,node]of nodes.entries()){
      const name=String(node.record.provider||'Įrašas'),activate=()=>dispatch('vip:open-record',{id:node.record.id}),g=dot(node.x,node.y,7+(nodeIndex%3),nodeIndex,activate);g.classList.add('holo-galaxy-node');
      const title=svgNode('title');title.textContent=name;g.append(title);
      label(node.x,node.y+4,String(nodeIndex+1),'holo-node-number');
      list.append(button(`${nodeIndex+1}. ${name}`,[territory(node.record),node.record.category].filter(Boolean).join(' · ')||'Atidaryti kortelę',activate));
    }
    empty.hidden=n>0;empty.textContent='Galaktika atsiras gavus paieškos rezultatus.';
    explanation.textContent=`Rodoma ${fmt.format(n)} iš ${fmt.format(records.length)} šio puslapio įrašų (iki 25). ${edges?`${fmt.format(edges)} linijos jungia sutampančią vietovę arba veiklos sritį. `:''}Tai nėra įmonių verslo ryšių duomenys. Pasirinkite įrašą ir atidarykite kortelę.`;
  }
  const phonePerformance=matchMedia('(max-width: 900px) and (pointer: coarse), (max-height: 600px) and (pointer: coarse)');
  let renderPending=false;
  function render(){
    if(phonePerformance.matches&&(!explorer.open||app.hidden||document.hidden)){
      renderPending=true;
      if(!records.length){visual.replaceChildren();list.replaceChildren();scope.textContent='';explanation.textContent='';}
      return;
    }
    renderPending=false;visual.replaceChildren();list.replaceChildren();scope.textContent=`Šio rezultatų puslapio įrašai · ${fmt.format(records.length)} / ${fmt.format(resultTotal)} · puslapis ${currentPage}`;explorer.dataset.view=view;view==='map'?renderMap():renderGalaxy();}
  explorer.addEventListener('toggle',()=>{if(explorer.open&&renderPending)render();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&renderPending)render();});
  phonePerformance.addEventListener('change',()=>{if(renderPending)render();});
  function selectView(next){view=next;for(const tab of explorer.querySelectorAll('[data-holo-view]')){const active=tab.dataset.holoView===view;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;}document.getElementById('holoPanel').setAttribute('aria-labelledby',view==='map'?'holoMapTab':'holoGalaxyTab');render();}
  explorer.querySelector('.holo-tabs').addEventListener('click',event=>{const tab=event.target.closest('[data-holo-view]');if(tab)selectView(tab.dataset.holoView);});
  explorer.querySelector('.holo-tabs').addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();selectView(event.key==='Home'?'map':event.key==='End'?'galaxy':view==='map'?'galaxy':'map');explorer.querySelector('[aria-selected="true"]').focus();});
  window.addEventListener('vip:results',event=>{if(app.hidden)return;const data=event.detail||{};niche=data.currentNiche==='employers'?'employers':'services';records=Array.isArray(data.records)?data.records.slice(0,100):[];currentPage=Math.max(1,Number(data.page)||1);resultTotal=Math.max(records.length,Number(data.total)||0);render();});
  const clear=()=>{if(!app.hidden)return;explorer.open=false;records=[];resultTotal=0;currentPage=1;render();};
  new MutationObserver(clear).observe(app,{attributes:true,attributeFilter:['hidden']});
  window.addEventListener('vip:clear-results',()=>{records=[];resultTotal=0;currentPage=1;render();});
  render();
}
