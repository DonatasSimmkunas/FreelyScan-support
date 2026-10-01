(function(){
  let detail=null,loadFailed=false;
  const words={lt:{about:'Apie produktą',specs:'Išsamios techninės specifikacijos',documents:'Dokumentai ir brėžiniai',source:'Duomenų šaltinis',checked:'Patikrinta',country:'Pristatymo šalis',pending:'Šio SKU išsamios specifikacijos dar nepatvirtintos. Naujesnio modelio duomenys nepriskiriami šiai prekei.',failed:'Nepavyko įkelti techninių duomenų. Bandykite atnaujinti puslapį.',basis:'Planavimo terminas su atsarga; tai nėra patvirtintas tiekėjo pažadas. Tikslus likutis ir išsiuntimo data patvirtinami prieš apmokėjimą.',parts:['Paruošimas','Transportas','Laiko atsarga'],days:'d. d.',discontinued:'Gamintojo kataloge pažymėta: gamyba nutraukta. Prieinamumas tik pagal užklausą.'},en:{about:'About this product',specs:'Detailed technical specifications',documents:'Documents and drawings',source:'Technical data source',checked:'Checked',country:'Delivery country',pending:'Detailed specifications for this SKU are not yet verified. Specifications from a newer variant are not assigned to this item.',failed:'Technical data could not be loaded. Please refresh the page.',basis:'Planning estimate including a buffer, not a confirmed supplier promise. Stock and dispatch date are confirmed before payment.',parts:['Preparation','Transit','Time allowance'],days:'business days',discontinued:'Marked discontinued by the manufacturer. Availability on request.'},no:{about:'Om produktet',specs:'Detaljerte tekniske spesifikasjoner',documents:'Dokumenter og tegninger',source:'Produsentens datakilde',checked:'Kontrollert',country:'Leveringsland',pending:'Detaljerte spesifikasjoner for denne SKU-en er ikke bekreftet. Data fra en nyere variant brukes ikke for dette produktet.',failed:'Kunne ikke laste tekniske data. Last siden på nytt.',basis:'Planleggingsestimat med tidsmargin, ikke et bekreftet leveringsløfte. Lagerstatus og utsendelsesdato bekreftes før betaling.',parts:['Klargjøring','Transport','Tidsmargin'],days:'virkedager',discontinued:'Utgått hos produsenten. Tilgjengelighet på forespørsel.'}};
  const translations={Weight:'Vekt',Packing:'Emballasje'};
  const lt={'Packing':'Pakuotė','Weight':'Svoris','Electrical data':'Elektros duomenys','Rated power':'Vardinė galia','Rated current':'Vardinė srovė','Phases':'Fazės','Voltage':'Įtampa','Frequency':'Dažnis','Supply fan':'Tiekiamo oro ventiliatorius','Exhaust fan':'Šalinamo oro ventiliatorius','Max. power consumption':'Didžiausia vartojama galia','Heater / Cooler':'Šildytuvas / vėsintuvas','Integrated Heater/Cooler':'Integruotas šildytuvas / vėsintuvas','Heat Exchanger':'Šilumokaitis','Heat exchanger Type':'Šilumokaičio tipas','Heat Exchanger Subtype':'Šilumokaičio variantas','Casing':'Korpusas','Material':'Medžiaga','Insulation thickness':'Izoliacijos storis','Color':'Spalva','IP Class':'IP apsaugos klasė','Operation environment':'Darbo aplinka','Installation Position':'Montavimo padėtis','Supply air side':'Oro tiekimo pusė','Supply air filter':'Tiekiamo oro filtras','Extract air filter':'Šalinamo oro filtras','Class':'Klasė','Safety data':'Saugos duomenys','Ambient air temp.':'Aplinkos oro temperatūra','Outdoor air temp. without frost protection':'Lauko oro temperatūra be apsaugos nuo užšalimo','Technical data':'Techniniai duomenys','Dimensions':'Matmenys','Thermal efficiency (EN308)':'Šiluminis efektyvumas (EN308)','Maximum flow rate':'Didžiausias oro srautas','Maximum airflow':'Didžiausias oro srautas','Nominal external pressure':'Vardinis išorinis slėgis','Sound power level':'Garso galios lygis','Galvanized steel':'Cinkuotas plienas','Electrical Heater':'Elektrinis šildytuvas','Rotor':'Rotorinis','Condensing':'Kondensacinis','Indoors':'Patalpose','Vertical':'Vertikali','Horizontal':'Horizontali','Left':'Kairė','Right':'Dešinė','Yes':'Taip','No':'Ne','Variable speed':'Reguliuojamas greitis','Steel RAL9016 and EPP':'Plienas RAL9016 ir EPP'};
  Object.assign(lt,{'Airflow at specified pressure':'Oro srautas prie nurodyto slėgio','Power supply':'Elektros maitinimas','Fan motor power':'Ventiliatorių variklių galia','Protection class':'Apsaugos klasė','Maximum air temperature':'Didžiausia oro temperatūra','Ambient temperature range':'Aplinkos temperatūros diapazonas','Filters':'Filtrai','Casing dimensions':'Korpuso matmenys','Net weight (supplier)':'Neto svoris pagal tiekėją','Duct connections':'Ortakių jungtys','Casing material':'Korpuso medžiaga','Thermal efficiency at reference flow':'Šiluminis efektyvumas prie atskaitinio srauto','Reference airflow':'Atskaitinis oro srautas','Reference pressure difference':'Atskaitinis slėgio skirtumas','Specific power input':'Savitoji vartojamoji galia','Fan speed control':'Ventiliatorių greičio valdymas','Supplier technical data · SORKE':'Tiekėjo techniniai duomenys · SORKE'});
  Object.assign(lt,{'Thermal efficiency up to':'Šiluminis efektyvumas iki','Heater power':'Šildytuvo galia','Heater current':'Šildytuvo srovė','Supply fan power':'Tiekiamo oro ventiliatoriaus galia','Extract fan power':'Šalinamo oro ventiliatoriaus galia','Fan current':'Ventiliatoriaus srovė','Fan speed':'Ventiliatoriaus sukimosi greitis','Fan protection class':'Ventiliatoriaus apsaugos klasė','Fan control input':'Ventiliatoriaus valdymo įėjimas','Total power':'Bendra galia','Total current':'Bendra srovė','Net weight (manual)':'Neto svoris pagal vadovą','Supply air filter class':'Tiekiamo oro filtro klasė','Extract air filter class':'Šalinamo oro filtro klasė','Filter model':'Filtro modelis','Filter width':'Filtro plotis','Filter height':'Filtro aukštis','Filter depth':'Filtro gylis','Casing width':'Korpuso plotis','Casing height':'Korpuso aukštis','Casing depth':'Korpuso gylis','Archived model manual · revision P0108_AZ_0003':'Archyvinis modelio vadovas · versija P0108_AZ_0003','Filter class':'Filtro klasė','Topology':'Agregato tipas','Type of drive':'Pavaros tipas','Casing sound power level':'Korpuso garso galios lygis','ErP Compliance':'Atitiktis ErP','Internet address for disassembly instructions':'Išmontavimo instrukcijos nuoroda','Type of HRS':'Šilumos atgavimo sistemos tipas','Nominal NRVU flow rate':'Vardinis negyvenamųjų patalpų agregato oro srautas','Effective electric power input':'Efektyvioji vartojama elektros galia','Face velocity':'Oro greitis skerspjūvyje','Corrosion resistance class':'Atsparumo korozijai klasė','Visual filter warning':'Vaizdinis filtro būklės įspėjimas','Declared maximum internal leakage rates':'Deklaruotas didžiausias vidinis nuotėkis','Maximum flow rate':'Didžiausias oro srautas','Maximum airflow':'Didžiausias oro srautas','Recovery type':'Šilumos atgavimo tipas','Variable speed':'Reguliuojamas greitis','Recuperative':'Rekuperacinis','Regenerative':'Regeneracinis','Cold · SEC':'Šaltas klimatas · SEC','Cold · Class':'Šaltas klimatas · klasė','Cold · AEC':'Šaltas klimatas · AEC','Cold · AHS':'Šaltas klimatas · AHS','Average · SEC':'Vidutinis klimatas · SEC','Average · Class':'Vidutinis klimatas · klasė','Average · AEC':'Vidutinis klimatas · AEC','Average · AHS':'Vidutinis klimatas · AHS','Warm · SEC':'Šiltas klimatas · SEC','Warm · Class':'Šiltas klimatas · klasė','Warm · AEC':'Šiltas klimatas · AEC','Warm · AHS':'Šiltas klimatas · AHS'});
  const featureLT={
    'Compact size: designed to fit throught a standart door with an opening of 890mm.':'Kompaktiškas korpusas, pritaikytas pernešti pro 890 mm pločio durų angą.',
    'Premium casing: airtight L1(M) and eliminated thermal bridges TB2.':'Korpuso sandarumo klasė L1(M), šiluminių tiltelių klasė TB2.',
    'Pocket filters with ePM1 55% (F7) classification for supply and ePM10 65% (M5) for extract air are designed to provide a large filter area and have a long lifetime.':'Kišeniniai filtrai: tiekiamam orui ePM1 55% (F7), šalinamam orui ePM10 65% (M5).',
    'Fully wired for quick and easy setup with an inteligent MCB control system.':'Gamykloje sujungta elektros instaliacija ir integruotas MCB valdymas.',
    'Control board is integrated inside the casing for easy access and servicing.':'Valdymo plokštė įmontuota korpuse ir pasiekiama techninei priežiūrai.',
    'Variable-speed EC fans, energy efficiency class IE4.':'Reguliuojamo greičio EC ventiliatoriai; energinio efektyvumo klasė IE4.',
    'Variable speed control for rotary heat exchanger.':'Reguliuojamas rotorinio šilumokaičio sukimosi greitis.',
    'Large range of interfaces: SaldaAir app, PC control and BMS (Modbus TCP/IP, BACnet/IP) viaMB-Gateway.':'Galimos valdymo sąsajos per MB-Gateway: SaldaAir, kompiuteris ir BMS (Modbus TCP/IP, BACnet/IP).',
    'Constant air volume control (CAV) as standard. Variable air volume control (VAV) as an accessory.':'Standartinis pastovaus oro srauto valdymas CAV; VAV valdymas galimas su papildomu priedu.',
    'Instalation position: Horizontal':'Horizontali montavimo padėtis.',
    'Instalation position: Vertical':'Vertikali montavimo padėtis.',
    'Maintenance-free':'Gamintojas nurodo, kad šiam komponentui nereikia periodinės priežiūros.',
    'Backward curved impeller':'Atgal lenktos sparnuotės mentės.',
    'Low height: 38.5 cm':'Agregato aukštis — 38,5 cm.',
    'Universal installation: horizontal, ceiling, floor':'Galimas horizontalus montavimas, tvirtinimas prie lubų arba ant grindų.',
    'Outdoor version as a standard':'Standartinė komplektacija pritaikyta naudoti lauke.',
    'Tested in all EU conditions (-35C - +40C)':'Gamintojo nurodytas išbandytas temperatūros diapazonas: −35…+40 °C.',
    'Easy maintenance':'Konstrukcija pritaikyta patogiai techninei priežiūrai.',
    'Eurovent certification':'Gamintojas nurodo Eurovent sertifikavimą.',
    'AC-type motor: cost-efficient solution':'AC tipo variklis.',
    'Integral thermal protection':'Integruota šiluminė apsauga.',
    'Complies with ErP2018 requirements.':'Gamintojo deklaruojama atitiktis ErP 2018 reikalavimams.',
    'Complies withErP2018 requirements.':'Gamintojo deklaruojama atitiktis ErP 2018 reikalavimams.',
    'Galvanized steel casing':'Cinkuoto plieno korpusas.',
    'Roof fan.':'Stoginis ventiliatorius.',
    'Integrated motor protection.':'Integruota variklio apsauga.',
    'Vertical exhaust':'Vertikalus oro išmetimas.',
    'EC-type motor: energy efficient':'Energiją taupantis EC variklis.',
    'EC-type motor: low energy consumption':'Mažų energijos sąnaudų EC variklis.',
    'Universal installation.':'Galimi keli montavimo būdai pagal gamintojo instrukciją.',
    'Aluminum casing':'Aliuminio korpusas.',
    'Kitchen exhaust fan':'Virtuvės oro ištraukimo ventiliatorius.',
    'Maintenance-free motorized impeller':'Sparnuotė su varikliu, kuriam gamintojas nenumato periodinės priežiūros.',
    'extracted air temperature – 120 C.':'Nurodyta šalinamo oro temperatūra — 120 °C.',
    'Can be installed outdoors.':'Galima montuoti lauke.',
    'Modular construction enables to connect additional modules.':'Modulinė konstrukcija leidžia prijungti papildomus modulius.',
    'Inegrated potentiometer.':'Integruotas potenciometras.',
    'Possibility to install the filter.':'Galima įrengti filtrą.',
    'Efficient EC-type fan.':'EC tipo ventiliatorius.',
    'Backward or forwards curved impeller':'Sparnuotė su atgal arba į priekį lenktomis mentėmis.'
  };
  function translated(v,l){if(l==='lt'){const efficiency=v.match(/^Efficient (Sorption|Condensing) heat exchanger – (\d+) % EN308\.$/);if(efficiency)return `${efficiency[1]==='Sorption'?'Sorbcinis':'Kondensacinis'} šilumokaitis: ${efficiency[2]}% efektyvumas pagal EN308.`;return featureLT[v.trim()]||lt[v.trim()]||v;}return l==='no'?(translations[v]||v):v;}
  function el(tag,text,cls){const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;}
  function description(p,l){
    const purpose={lt:{'Residential HRU':'gyvenamųjų patalpų subalansuotam vėdinimui ir šilumos atgavimui','Fans':'oro judėjimui vėdinimo sistemoje','Ducts & Fittings':'ortakių tinklo įrengimui ir sujungimui','Accessories':'vėdinimo sistemos komplektavimui, priežiūrai arba valdymui','Heaters & Coolers':'tiekiamo oro temperatūros valdymui'},en:{'Residential HRU':'balanced residential ventilation and heat recovery','Fans':'moving air through a ventilation system','Ducts & Fittings':'building and connecting a duct network','Accessories':'ventilation system configuration, maintenance or control','Heaters & Coolers':'supply air temperature control'},no:{'Residential HRU':'balansert boligventilasjon og varmegjenvinning','Fans':'lufttransport i ventilasjonsanlegg','Ducts & Fittings':'oppbygging og tilkobling av kanalnett','Accessories':'konfigurasjon, vedlikehold eller styring av ventilasjonsanlegg','Heaters & Coolers':'temperaturstyring av tilluft'}};
    const use=purpose[l][p.category]||({lt:'pastatų vėdinimo sistemos komplektavimui',en:'building ventilation systems',no:'ventilasjonsanlegg i bygninger'})[l];
    const intro={lt:`${p.model} — ${p.family||categoryLabel(p.category)} serijos produktas, skirtas ${use}. Prekės kodas ${p.sku} leidžia tiksliai identifikuoti šią komplektaciją.`,en:`${p.model} is a ${p.family||p.category} product for ${use}. Use manufacturer code ${p.sku} to identify this exact configuration.`,no:`${p.model} er et produkt i ${p.family||p.category}-serien for ${use}. Produsentkode ${p.sku} identifiserer denne konfigurasjonen.`}[l];
    const facts=[];
    for(const s of detail?.sections||[])for(const r of s.rows){if(/Voltage|Rated power|Class|Material|Installation Position|Heat exchanger Type|Maximum airflow|Thermal efficiency/.test(r[0])&&facts.length<8)facts.push(`${translated(r[0],l)}: ${translated(r[1],l)}${r[2]?' '+r[2]:''}`);}
    const closing={lt:'Renkantis įvertinkite jungčių dydį, montavimo vietą ir suderinamumą su visa sistema. Našumas, triukšmas ir energijos sąnaudos priklauso nuo darbo taško; projektuojant remkitės gamintojo parinkimo duomenimis. Valdymo įranga ir kiti priedai gali būti užsakomi atskirai.',en:'Check connection sizes, installation space and system compatibility before ordering. Airflow, noise and energy use depend on the operating point; use manufacturer selection data when designing the system. Controls and other accessories may require a separate order.',no:'Kontroller tilkoblinger, monteringsplass og systemkompatibilitet før bestilling. Luftmengde, støy og energibruk avhenger av driftspunktet. Bruk produsentens dimensjoneringsdata. Styring og annet tilbehør kan måtte bestilles separat.'}[l];
    return[intro,facts.join(' · '),closing].filter(Boolean);
  }
  function render(){
    if(!currentProduct)return;
    const p=currentProduct,l=lang,t=words[l],root=document.getElementById('enrichedDetails');root.replaceChildren();
    // The sales feed has unverified physical attributes; technical facts come from the sourced SKU record.
    const summary=document.getElementById('specs');if(summary)Array.from(summary.rows).slice(4).forEach(row=>row.remove());
    const chips=document.getElementById('chips');if(chips)chips.replaceChildren(el('span',categoryLabel(p.category),'chip'));
    root.append(el('h2',t.about));
    const desc=currentOverride.description_override?[currentOverride.description_override]:description(p,l);
    desc.forEach(v=>root.append(el('p',v)));
    if(detail?.features?.length){const list=el('ul');detail.features.forEach(v=>list.append(el('li',translated(v,l))));root.append(list);}
    document.getElementById('desc').textContent=desc[0];
    document.querySelector('meta[name=description]').content=desc[0].slice(0,155);
    root.append(el('h2',t.specs));
    if(!detail)root.append(el('p',loadFailed?t.failed:t.pending,'note'));
    else{
      if(detail.discontinued)root.append(el('p',t.discontinued,'warn'));
      if(detail.sourceScope==='exact-supplier-sku')root.append(el('p',({lt:'Techniniai duomenys iš SORKE tiekėjo puslapio pagal tikslų gamintojo prekės kodą. Prieš užsakant patvirtinkite gamybos reviziją, komplektaciją ir dabartinį prieinamumą.',en:'Technical data from supplier SORKE, matched by exact manufacturer SKU. Confirm production revision, configuration and current availability before ordering.',no:'Tekniske data fra leverandøren SORKE, koblet til nøyaktig produsentkode. Bekreft produksjonsversjon, konfigurasjon og tilgjengelighet før bestilling.'})[l],'warn'));
      if(detail.sourceScope==='archived-model-manual')root.append(el('p',({lt:'Pateikiami archyvinio modelio vadovo P0108_AZ_0003 duomenys. Vadove SKU nenurodytas; prieš užsakymą reikia patvirtinti gamybos reviziją. Neto svoris ir korpuso matmenys skiriasi nuo pirminio prekybinio katalogo reikšmių.',en:'Data from archived model manual P0108_AZ_0003. The manual does not identify the SKU; confirm the production revision before ordering. Net weight and casing dimensions differ from the original sales catalogue.',no:'Data fra arkivert modellhåndbok P0108_AZ_0003. SKU er ikke angitt; bekreft produksjonsversjonen før bestilling. Nettovekt og kabinettmål avviker fra den opprinnelige salgskatalogen.'})[l],'warn'));
      const src=el('p',`${t.checked}: ${detail.checkedAt} · `);const a=el('a',t.source);a.href=detail.source;a.target='_blank';a.rel='noopener';src.append(a);root.append(src);
      for(const section of detail.sections){const block=el('details');block.open=true;block.append(el('summary',translated(section.name,l)));const table=el('table');for(const row of section.rows){const tr=el('tr');tr.append(el('th',translated(row[0],l)),el('td',`${translated(row[1],l)}${row[2]?' '+row[2]:''}`));table.append(tr);}block.append(table);root.append(block);}
      if(detail.documents.length){root.append(el('h2',t.documents));const list=el('ul',null,'documentList');for(const doc of detail.documents){const li=el('li'),link=el('a',`${doc.name} · ${(doc.type||'').toUpperCase()}${doc.size?' · '+doc.size:''}`);link.href=doc.url;link.target='_blank';link.rel='noopener';if(/^(png|jpg|jpeg|webp)$/i.test(doc.type)){const image=el('img');image.src=doc.url;image.alt=doc.name;image.loading='lazy';image.style.cssText='display:block;width:100%;max-height:320px;object-fit:contain';link.prepend(image);}li.append(link);list.append(li);}root.append(list);}
    }
    renderDelivery();
  }
  function renderDelivery(){
    const l=lang,t=words[l],p=currentProduct;if(!p)return;
    const selected=document.getElementById('deliveryCountry');document.getElementById('deliveryCountryLabel').textContent=t.country;
    const country=selected.value,e=VentDelivery.estimate(p,country);
    document.getElementById('lead').textContent=detail?.discontinued?UI[l].lead:VentDelivery.label(p,country,l);
    document.getElementById('deliveryBasis').textContent=t.basis;
    document.getElementById('deliveryBreakdown').textContent=e&&!detail?.discontinued?`${t.parts[0]}: ${e.preparation.join('–')} ${t.days} · ${t.parts[1]}: ${e.transit.join('–')} ${t.days} · ${t.parts[2]}: ${e.buffer} ${t.days}`:'';
    if(currentOverride.lead_time_text)document.getElementById('deliveryBreakdown').textContent+=' · '+currentOverride.lead_time_text;
  }
  const oldRender=renderProductDetails;
  renderProductDetails=function(){oldRender();if(currentProduct)render();};
  const country=document.getElementById('deliveryCountry');
  const region={LT:'lt-LT',NO:'nb-NO',EN:'en'};
  for(const code of VentDelivery.countries){let name=code;try{name=new Intl.DisplayNames([region[lang.toUpperCase()]||'en'],{type:'region'}).of(code);}catch{}const o=el('option',name);o.value=code;country.append(o);}
  country.value=localStorage.getItem('ventit-delivery-country')||(lang==='no'?'NO':'LT');if(!country.value)country.value='LT';country.onchange=()=>{localStorage.setItem('ventit-delivery-country',country.value);renderDelivery();};
  fetch('assets/product-details/'+encodeURIComponent(sku)+'.json').then(r=>{if(r.status===404)return null;if(!r.ok)throw Error('details');return r.json();}).then(d=>{if(d&&d.sku!==sku)throw Error('SKU mismatch');detail=d;if(currentProduct)render();}).catch(()=>{loadFailed=true;if(currentProduct)render();});
})();
