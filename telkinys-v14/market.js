(()=>{
 const {E,s,pages,categories,units,link,button,field,form,submit,notice,panel,empty,heading,badge,money,date,toast,api,get,go,current,modal}=App;
 const symbols={home:'⌂',auto:'◇',items:'□',services:'⌘',jobs:'▤',prices:'≋'};
 const attrNames={rooms:'Kambariai',floor:'Aukštas',area:'Plotas, m²',year:'Metai',mileage:'Rida, km',brand:'Markė',model:'Modelis',condition:'Būklė'};
 const conditionNames={new:'Nauja',used:'Naudota',renovated:'Renovuota',other:'Kita'};
 s.compareListings=new Map();
 function addCompare(item){
  if(s.compare.has(item.id)){s.compare.delete(item.id);s.compareListings.delete(item.id);toast('Pašalinta iš palyginimo.');return;}
  if(s.compare.size>=3){toast('Vienu metu galima palyginti iki 3 pasiūlymų.');return;}
  const first=[...s.compareListings.values()][0];if(first&&(first.category!==item.category||first.priceUnit!==item.priceUnit)){toast('Palyginimui rinkis tos pačios kategorijos ir kainos vieneto pasiūlymus.');return;}
  s.compare.add(item.id);s.compareListings.set(item.id,item);toast('Pridėta palyginimui ('+s.compare.size+'/3).');
 }
 async function favorite(item){if(!s.user){s.afterAuth=current();go({view:'login'});return;}const saved=!(s.me?.favorites||[]).includes(item.id);await api('favorite',{id:item.id,saved});s.me.favorites=saved?[...(s.me.favorites||[]),item.id]:s.me.favorites.filter(x=>x!==item.id);toast(saved?'Išsaugota tavo paskyroje.':'Pašalinta iš išsaugotų.');}
 function card(item){
  const photo=E('a',{class:'card-image',href:App.href({skelbimas:item.id}),'data-nav':'','aria-label':'Atidaryti: '+item.title},item.image?E('img',{src:item.image,alt:item.title,loading:'lazy',decoding:'async'}):E('span',{class:'placeholder','aria-hidden':'true'},symbols[item.category]||'□'));
  if(item.image)photo.firstChild.addEventListener('error',()=>photo.replaceChildren(E('span',{class:'placeholder','aria-hidden':'true'},symbols[item.category]||'□')),{once:true});
  const fav=button((s.me?.favorites||[]).includes(item.id)?'♥ Išsaugota':'♡ Išsaugoti',async(e,b)=>{await favorite(item);b.textContent=(s.me?.favorites||[]).includes(item.id)?'♥ Išsaugota':'♡ Išsaugoti';},'btn small',{'aria-pressed':String((s.me?.favorites||[]).includes(item.id))});
  return E('article',{class:'card'},photo,E('div',{class:'card-body'},E('div',{class:'card-top'},categories[item.category]||item.category),E('h3',{},link(item.title,{skelbimas:item.id})),E('div',{class:'price'},money(item.price,item.priceUnit)),E('p',{class:'card-location'},[item.city,item.district].filter(Boolean).join(' · ')),E('div',{class:'card-bottom'},E('span',{class:'seller-name'},item.seller.name),fav,button('⇄',()=>{addCompare(item);App.render(false);},'btn small',{'aria-label':'Palyginti '+item.title}))));
 }
 App.card=card;App.attrNames=attrNames;
 pages.home=async p=>{
  s.lastSearch={...p};
  const root=E('div',{});
  root.append(E('section',{class:'hero'},E('div',{},E('span',{class:'eyebrow'},'Viena vieta tavo kitam žingsniui'),E('h1',{},'Neieškok portalo.',E('br'),'Pasakyk, ko reikia.'),E('p',{class:'lead'},'Rask būstą, automobilį, daiktą, darbą ar specialistą. Išsaugok tinkamus pasiūlymus ir susisiek tiesiai Telkinyje.'),E('div',{class:'hero-note'},E('span',{},'✓ Nemokamas skelbimo įkėlimas'),E('span',{},'✓ Viena paskyra visoms kategorijoms'))),E('aside',{class:'hero-card'},E('span',{class:'kicker'},'Mažiau blaškymosi'),E('h3',{},'Nuo poreikio iki pokalbio.'),E('div',{class:'hero-steps'},[['01','Pasakyk, ko ieškai','Kategorija, vieta ir tikra kainos riba.'],['02','Išsirink pasiūlymą','Išsaugok ir palygink vienodomis sąlygomis.'],['03','Susisiek ir susitark','Pokalbis ir susitikimo laikas tavo paskyroje.']].map(x=>E('div',{class:'hero-step'},E('span',{class:'step-number'},x[0]),E('div',{},E('b',{},x[1]),E('p',{},x[2]))))))));
  const searchForm=form([E('div',{class:'search-line'},E('input',{class:'control',name:'q',value:p.q||'',maxLength:300,placeholder:'Pvz., 2 kambarių butas Žirmūnuose iki 180 000 €','aria-label':'Ko ieškai?',autocomplete:'off',enterkeyhint:'search'}),submit('Rasti')),E('div',{class:'filters'},field('category','Kategorija',[['','Pagal paiešką'],...Object.entries(categories)],p.category||''),field('city','Miestas','text',p.city||'',{maxLength:60,placeholder:'Visa Lietuva'}),field('min','Kaina nuo, €','number',p.min||'',{min:0,max:1e9,step:'0.01',inputmode:'decimal'}),field('max','Kaina iki, €','number',p.max||'',{min:0,max:1e9,step:'0.01',inputmode:'decimal'}),field('unit','Kainos vienetas',[['','Pagal paiešką'],['total','Visa suma'],['hour','Už valandą'],['month','Už mėnesį'],['from','Kaina nuo'],['negotiable','Sutartinė']],p.unit||''),field('sort','Rikiuoti',[['newest','Naujausi'],['price-asc','Pigiausi pirmi'],['price-desc','Brangiausi pirmi']],p.sort||'newest'))],async fd=>{const values=Object.fromEntries(fd);if(values.sort.startsWith('price')&&!values.unit)values.unit='total';go(values);});
  searchForm.className='search-panel';root.append(searchForm,E('nav',{class:'categories','aria-label':'Kategorijos'},link('Visi pasiūlymai',{},'chip '+(!p.category?'active':'')),Object.entries(categories).map(([key,name])=>link(name,{category:key},'chip '+(p.category===key?'active':'')))));
  let data;try{data=await get({...p,op:'search'});}catch(err){root.append(notice(err.message,'error'),button('Bandyti dar kartą',()=>App.render(false)));return root;}
  const interpreted=data.interpreted;
  if(p.q){const info=[interpreted.category?categories[interpreted.category]:null,interpreted.city,interpreted.rooms?interpreted.rooms+' kamb.':null,interpreted.max!==null?'iki '+money(interpreted.max/100,interpreted.unit||'total'):null,interpreted.brand?interpreted.brand.toUpperCase():null].filter(Boolean);if(info.length)root.append(notice('Taikomi kriterijai: '+info.join(' · ')));}
  for(const warning of interpreted.warnings||[])root.append(notice(warning,'warning'));
  const tools=E('div',{class:'row'},button('♡ Išsaugoti paiešką',async()=>{if(!s.user){s.afterAuth=current();go({view:'login'});return;}const filters=Object.fromEntries(Object.entries(p).filter(([k])=>['q','category','city','min','max','sort','unit'].includes(k)));await api('save-search',{name:(p.q||categories[p.category]||'Visi pasiūlymai').slice(0,120),filters});await App.refreshMe();toast('Paieška išsaugota paskyroje. Automatiniai el. laiškai dar nesiunčiami.');},'btn small'),s.compare.size?link('Palyginti ('+s.compare.size+')',{view:'compare'},'btn small primary'):null);
  root.append(E('div',{class:'section-head'},E('div',{},E('h2',{},p.q?'Paieškos rezultatai':'Naujausi pasiūlymai'),E('p',{class:'muted small-text'},data.total+' viešų pasiūlymų')),tools));
  if(!data.items.length)root.append(empty(p.q||p.category||p.city?'Tikslių atitikmenų neradome.':'Čia atsiras pirmieji tikri pasiūlymai.',p.q||p.category||p.city?'Pabandyk kitą miestą, didesnį biudžetą ar trumpesnę užklausą. Netinkančių pasiūlymų vietoje tikslių rezultatų nerodome.':'Telkinys pradeda uždarą beta. Pavyzdinių skelbimų nėra: prisijungę dalyviai gali pateikti savo pasiūlymus peržiūrai.',E('div',{class:'row between'},link('Visi pasiūlymai',{},'btn'),link('Įkelti pasiūlymą',{view:'edit'},'btn primary'))));
  else root.append(E('div',{class:'grid'},data.items.map(card)));
  if(data.pages>1)root.append(E('nav',{class:'pagination','aria-label':'Rezultatų puslapiai'},data.page>1?link('← Ankstesnis',{...p,page:data.page-1},'btn'):null,E('span',{class:'muted small-text'},data.page+' / '+data.pages),data.page<data.pages?link('Kitas →',{...p,page:data.page+1},'btn'):null));
  root.append(E('section',{class:'panel soft',style:undefined},E('div',{class:'section-head'},E('div',{},E('span',{class:'kicker'},'Turi ką pasiūlyti?'),E('h2',{},'Įkelk vieną kartą. Valdyk vienoje vietoje.')),link('Sukurti pasiūlymą',{view:'edit'},'btn primary')),E('p',{class:'muted'},'Juodraščiai, aktyvūs skelbimai, susirašinėjimai ir susitikimai priklauso tavo paskyrai, ne vienam įrenginiui.')));
  return root;
 };
 pages.detail=async p=>{
  const item=await get({op:'listing',id:p.skelbimas});document.title=item.title+' — Telkinys';
  const root=E('div',{},E('div',{class:'page-head'},button('← Grįžti į rezultatus',()=>go(s.lastSearch||{}),'btn quiet small'),E('p',{class:'card-top'},categories[item.category]+' · '+item.city),E('h1',{},item.title)));
  const photos=E('div',{class:'detail-images'},item.images.map(x=>E('a',{href:x.url,target:'_blank',rel:'noopener noreferrer','aria-label':'Atverti skelbimo nuotrauką'},E('img',{src:x.url,alt:item.title,loading:'lazy'}))));
  const content=E('section',{},item.images.length?photos:empty('Nuotraukų nėra.','Autorius prie šio pasiūlymo nuotraukų nepridėjo.'),E('div',{class:'panel detail-copy'},E('h2',{},'Aprašymas'),E('p',{},item.description)),E('div',{class:'facts'},Object.entries(item.attributes||{}).map(([k,v])=>E('div',{class:'fact'},E('span',{},attrNames[k]||k),E('strong',{},conditionNames[v]||String(v))))));
  const owner=s.user?.id===item.ownerId;
  const side=E('aside',{class:'panel detail-side'},E('span',{class:'badge'},categories[item.category]),E('p',{class:'price'},money(item.price,item.priceUnit)),E('p',{class:'muted'},[item.city,item.district].filter(Boolean).join(' · ')),E('hr'),E('h3',{},item.seller.name),E('p',{class:'hint'},'@'+item.seller.username),notice('Telkinys šiame etape netikrina tapatybės ir nepriima mokėjimų. Dėl objekto bei sąlygų susitark tiesiogiai.'),owner?link('Redaguoti mano skelbimą',{view:'edit',id:item.id},'btn primary wide'):button('Parašyti autoriui',()=>{
   if(!s.user){s.afterAuth={skelbimas:item.id};go({view:'login'});return;}
   const clientId=crypto.randomUUID();modal('Susisiekti dėl pasiūlymo',E('p',{class:'muted'},item.title),form([field('body','Tavo žinutė','textarea','',{required:true,minLength:1,maxLength:3000,placeholder:'Sveiki, ar pasiūlymas dar aktualus?'}),submit('Siųsti žinutę')],async fd=>{const result=await api('send',{listingId:item.id,body:fd.get('body'),clientId});App.$('#dialog').close();go({view:'thread',id:result.threadId});}));
  },'btn primary wide'),E('div',{class:'actions'},button('♡ Išsaugoti',()=>favorite(item)),button('⇄ Palyginti',()=>{addCompare(item);if(s.compare.size>1)go({view:'compare'});})),E('p',{class:'hint'},'Paskelbta '+date(item.createdAt)),E('a',{class:'btn small wide',href:'https://www.openstreetmap.org/search?query='+encodeURIComponent([item.district,item.city,'Lietuva'].filter(Boolean).join(', ')),target:'_blank',rel:'noopener noreferrer'},'Peržiūrėti vietovę žemėlapyje'),E('p',{class:'hint'},'Rodoma vietovė, ne tikslus objekto adresas.'),!owner?button('Pranešti apie skelbimą',()=>{
   if(!s.user){s.afterAuth={skelbimas:item.id};go({view:'login'});return;}
   modal('Pranešti moderatoriui',form([field('reason','Kas negerai?','textarea','',{required:true,minLength:10,maxLength:1500}),submit('Pateikti pranešimą')],async fd=>{await api('report',{listingId:item.id,reason:fd.get('reason')});App.$('#dialog').close();toast('Pranešimas perduotas moderatoriui.');}));
  },'btn quiet small wide'):null);
  root.append(E('div',{class:'detail-grid'},content,side));
  const reviews=E('section',{class:'panel'},E('h2',{},'Autoriaus atsiliepimai'),E('p',{class:'hint'},'Atsiliepimus galima palikti, kai abi pokalbio pusės pažymi bendravimą užbaigtu. Tai nėra patvirtinto mokėjimo ar tapatybės ženklas.'));
  if(item.reviews.length)reviews.append(...item.reviews.map(r=>E('article',{class:'review'},E('div',{class:'row between'},E('strong',{},r.author),E('span',{class:'rating'},r.score+' / 5')),E('p',{},r.body),E('small',{class:'muted'},date(r.created_at)))));else reviews.append(E('p',{class:'muted'},'Atsiliepimų dar nėra.'));
  root.append(reviews);return root;
 };
 pages.compare=async()=>{
  const root=E('div',{},heading('Palygink vienodomis sąlygomis.','Iki trijų tos pačios kategorijos pasiūlymų. Skirtingų kainos vienetų nemaišome.'));
  if(s.compare.size<2){root.append(empty('Pasirink bent du pasiūlymus.','Prie pasiūlymų spausk ⇄ ir grįžk čia.',link('Grįžti į paiešką',s.lastSearch||{},'btn primary')));return root;}
  const results=await Promise.all([...s.compare].map(async id=>{try{return await get({op:'listing',id});}catch{return null;}}));const items=results.filter(Boolean);
  if(items.length<2){root.append(notice('Dalis pasirinktų pasiūlymų nebėra vieši. Pasirink kitus.','warning'));return root;}
  const keys=[...new Set(items.flatMap(x=>Object.keys(x.attributes||{})))];
  const table=E('table',{class:'comparison'},E('thead',{},E('tr',{},E('th',{scope:'col'},'Kriterijus'),items.map(x=>E('th',{scope:'col'},link(x.title,{skelbimas:x.id}))))),E('tbody',{},[['Kaina',x=>money(x.price,x.priceUnit)],['Vieta',x=>[x.city,x.district].filter(Boolean).join(' · ')],['Autorius',x=>x.seller.name],...keys.map(k=>[attrNames[k]||k,x=>conditionNames[x.attributes[k]]||x.attributes[k]||'Nenurodyta'])].map(([label,value])=>E('tr',{},E('th',{scope:'row'},label),items.map(x=>E('td',{},String(value(x))))))));
  root.append(E('div',{class:'panel comparison-wrap'},table),E('div',{class:'actions'},button('Išvalyti palyginimą',()=>{s.compare.clear();s.compareListings.clear();go(s.lastSearch||{});}),link('Grįžti į paiešką',s.lastSearch||{},'btn primary')));return root;
 };
})();
