
const SB_URL="https://hvsbczirrxzzhuxlsbwe.supabase.co";
const SB_KEY="sb_publishable_gSq00JL9BE2rLc7L7kF_cg_CZmsFx7p";
const db=supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});

const LANGS={en:["EN","🇬🇧","English"],lt:["LT","🇱🇹","Lietuvių"],no:["NO","🇳🇴","Norsk"],de:["DE","🇩🇪","Deutsch"],pl:["PL","🇵🇱","Polski"],nl:["NL","🇳🇱","Nederlands"]};
const I18N={
en:{brandSub:"tools & equipment",searchPh:"Search drills, forklifts, compressors, brands, models...",search:"Search",forHouses:"For auction houses",addInventory:"+ Add inventory",heroEyebrow:"Marketplace discovery + auction operations",heroTitle:"Find serious tools.<br>Bid with confidence.",heroText:"A Vinted-simple way to browse industrial tools and equipment, backed by auction-grade cataloging, human review, visible condition notes and traceable photo evidence.",browse:"Browse equipment",auctions:"Auctions",trust1:"Human-reviewed details",trust2:"Visible condition notes",trust3:"Verified auction houses",discover:"Discover",ending:"Ending soon",endingSub:"Useful equipment worth a closer look.",marketplace:"Marketplace",allEquip:"All equipment",filters:"Filters",sort:"Sort",condition:"Condition",brand:"Brand",priceRange:"Current price",saveSearch:"☆ Save this search",trusted:"Trusted sellers",featuredAuctions:"Featured auctions",featuredSub:"Business liquidations and specialist equipment sales.",allAuctions:"All auctions →",browseBySale:"Browse by sale",auctionProjects:"Auction projects",auctionProjectsSub:"Curated collections from verified auction houses.",saved:"Saved",watchlist:"Watchlist",watchSub:"Items you want to keep an eye on.",opsTitle:"Catalog operations",opsSub:"The professional layer behind the cozy marketplace.",exportAll:"Export all CSV",qa:"Quality assurance",reviewQueue:"Review queue",findLot:"Find lot...",readiness:"Export readiness",catalogHealth:"Catalog health",photoIntake:"Photo intake",newInventory:"Add new inventory",newInventorySub:"Drop photos first. Structure and QA come next.",dropTitle:"Drop equipment photos here",dropSub:"JPG, PNG or WEBP. Multiple photos per lot are supported.",shop:"Shop",results:"results",currentBid:"current bid",ends:"ends",verified:"Verified auction house",lot:"Lot",seller:"Seller",category:"Category",model:"Model",conditionLabel:"Condition",qaLabel:"Catalog QA",savedSearch:"Search saved",favAdded:"Added to watchlist",favRemoved:"Removed from watchlist",signIn:"Sign in",myAccount:"My account",placeBid:"Place bid",maxBid:"Your maximum bid",bidHistory:"Bid history",highBidder:"You are the high bidder",register:"Register to bid",registered:"Registered",pickup:"Pickup / shipping",detected:"Detected",myBids:"My bids",signUp:"Create account",logOut:"Log out",accountCreated:"Account created — check email if confirmation is required",loginFailed:"Sign in failed",bidPlaced:"Bid placed",uploadDone:"Photos uploaded"},
lt:{brandSub:"įrankiai ir technika",searchPh:"Ieškok grąžtų, krautuvų, kompresorių, gamintojų, modelių...",search:"Ieškoti",forHouses:"Aukcionų namams",addInventory:"+ Pridėti inventorių",heroEyebrow:"Prekių paieška + aukcionų operacijos",heroTitle:"Rask rimtus įrankius.<br>Siūlyk užtikrintai.",heroText:"Paprastas, Vinted tipo naršymas po pramoninius įrankius ir techniką, paremtas aukcionų katalogavimu, žmogaus patikra, aiškia būkle ir nuotraukų įrodymais.",browse:"Naršyti techniką",auctions:"Aukcionai",trust1:"Žmogaus patikrinti duomenys",trust2:"Aiškios būklės pastabos",trust3:"Patikrinti aukcionų namai",discover:"Atrask",ending:"Greitai baigiasi",endingSub:"Verti dėmesio įrankiai ir technika.",marketplace:"Prekyvietė",allEquip:"Visa technika",filters:"Filtrai",sort:"Rikiuoti",condition:"Būklė",brand:"Gamintojas",priceRange:"Dabartinė kaina",saveSearch:"☆ Išsaugoti paiešką",trusted:"Patikimi pardavėjai",featuredAuctions:"Rekomenduojami aukcionai",featuredSub:"Verslų likvidacijos ir specializuotos technikos pardavimai.",allAuctions:"Visi aukcionai →",browseBySale:"Naršyti pagal pardavimą",auctionProjects:"Aukcionų projektai",auctionProjectsSub:"Patikrintų aukcionų namų kolekcijos.",saved:"Išsaugota",watchlist:"Stebimi",watchSub:"Daiktai, kuriuos nori sekti.",opsTitle:"Katalogo operacijos",opsSub:"Profesionalus sluoksnis po paprasta prekyviete.",exportAll:"Eksportuoti CSV",qa:"Kokybės patikra",reviewQueue:"Patikros eilė",findLot:"Rasti lotą...",readiness:"Eksporto parengtis",catalogHealth:"Katalogo būklė",photoIntake:"Nuotraukų įkėlimas",newInventory:"Pridėti naują inventorių",newInventorySub:"Pirmiausia nuotraukos. Tada struktūra ir QA.",dropTitle:"Įkelk technikos nuotraukas čia",dropSub:"JPG, PNG arba WEBP. Galima kelti kelias vieno loto nuotraukas.",shop:"Prekės",results:"rezultatų",currentBid:"dabartinis pasiūlymas",ends:"baigiasi",verified:"Patikrinti aukcionų namai",lot:"Lot",seller:"Pardavėjas",category:"Kategorija",model:"Modelis",conditionLabel:"Būklė",qaLabel:"Katalogo QA",savedSearch:"Paieška išsaugota",favAdded:"Pridėta į stebimus",favRemoved:"Pašalinta iš stebimų",signIn:"Prisijungti",myAccount:"Mano paskyra",placeBid:"Siūlyti kainą",maxBid:"Tavo maksimali kaina",bidHistory:"Pasiūlymų istorija",highBidder:"Tavo pasiūlymas pirmauja",register:"Registruotis siūlymui",registered:"Užregistruota",pickup:"Atsiėmimas / pristatymas",detected:"Aptikta",myBids:"Mano pasiūlymai",signUp:"Sukurti paskyrą",logOut:"Atsijungti",accountCreated:"Paskyra sukurta — jei reikia, patvirtink el. paštą",loginFailed:"Prisijungti nepavyko",bidPlaced:"Pasiūlymas pateiktas",uploadDone:"Nuotraukos įkeltos"},
no:{brandSub:"verktøy og utstyr",searchPh:"Søk etter driller, trucker, kompressorer, merker, modeller...",search:"Søk",forHouses:"For auksjonshus",addInventory:"+ Legg til varer",heroEyebrow:"Markedsplass + auksjonsdrift",heroTitle:"Finn seriøst utstyr.<br>By med trygghet.",heroText:"En enkel markedsplass for verktøy og industriutstyr, støttet av menneskelig kvalitetssikring.",browse:"Se utstyr",auctions:"Auksjoner",trust1:"Menneskelig kontrollert",trust2:"Tydelig tilstand",trust3:"Verifiserte auksjonshus",discover:"Oppdag",ending:"Avsluttes snart",endingSub:"Utstyr verdt en ekstra titt.",marketplace:"Markedsplass",allEquip:"Alt utstyr",filters:"Filtre",sort:"Sorter",condition:"Tilstand",brand:"Merke",priceRange:"Gjeldende pris",saveSearch:"☆ Lagre søk",trusted:"Pålitelige selgere",featuredAuctions:"Utvalgte auksjoner",featuredSub:"Avviklinger og spesialutstyr.",allAuctions:"Alle auksjoner →",browseBySale:"Se etter salg",auctionProjects:"Auksjonsprosjekter",auctionProjectsSub:"Samlinger fra verifiserte auksjonshus.",saved:"Lagret",watchlist:"Favoritter",watchSub:"Utstyr du følger.",opsTitle:"Katalogdrift",opsSub:"Det profesjonelle laget bak markedsplassen.",exportAll:"Eksporter CSV",qa:"Kvalitetssikring",reviewQueue:"Kontrollkø",findLot:"Finn lot...",readiness:"Eksportklar",catalogHealth:"Katalogstatus",photoIntake:"Bildeinntak",newInventory:"Legg til nytt utstyr",newInventorySub:"Bilder først. Struktur og QA etterpå.",dropTitle:"Slipp utstyrsbilder her",dropSub:"JPG, PNG eller WEBP. Flere bilder per lot støttes.",shop:"Marked",results:"resultater",currentBid:"nåværende bud",ends:"slutter",verified:"Verifisert auksjonshus",lot:"Lot",seller:"Selger",category:"Kategori",model:"Modell",conditionLabel:"Tilstand",qaLabel:"Katalog QA",savedSearch:"Søk lagret",favAdded:"Lagt til i favoritter",favRemoved:"Fjernet fra favoritter",signIn:"Logg inn",myAccount:"Min konto",placeBid:"Legg inn bud",maxBid:"Maksbud",bidHistory:"Budhistorikk",highBidder:"Du leder budrunden",register:"Registrer for bud",registered:"Registrert",pickup:"Henting / frakt",detected:"Oppdaget",myBids:"Mine bud",signUp:"Opprett konto",logOut:"Logg ut",accountCreated:"Konto opprettet",loginFailed:"Innlogging feilet",bidPlaced:"Bud lagt inn",uploadDone:"Bilder lastet opp"},
de:{brandSub:"Werkzeuge & Geräte",searchPh:"Bohrmaschinen, Stapler, Kompressoren, Marken, Modelle suchen...",search:"Suchen",forHouses:"Für Auktionshäuser",addInventory:"+ Inventar hinzufügen",heroEyebrow:"Marktplatz + Auktionsbetrieb",heroTitle:"Gute Werkzeuge finden.<br>Sicher bieten.",heroText:"Ein einfacher Marktplatz für Werkzeuge und Industrieausrüstung mit menschlicher Qualitätskontrolle.",browse:"Ausrüstung ansehen",auctions:"Auktionen",trust1:"Menschlich geprüft",trust2:"Klare Zustandsangaben",trust3:"Verifizierte Auktionshäuser",discover:"Entdecken",ending:"Endet bald",endingSub:"Ausrüstung, die einen Blick wert ist.",marketplace:"Marktplatz",allEquip:"Alle Geräte",filters:"Filter",sort:"Sortieren",condition:"Zustand",brand:"Marke",priceRange:"Aktueller Preis",saveSearch:"☆ Suche speichern",trusted:"Vertrauenswürdige Verkäufer",featuredAuctions:"Empfohlene Auktionen",featuredSub:"Betriebsauflösungen und Spezialausrüstung.",allAuctions:"Alle Auktionen →",browseBySale:"Nach Auktion",auctionProjects:"Auktionsprojekte",auctionProjectsSub:"Sammlungen verifizierter Auktionshäuser.",saved:"Gespeichert",watchlist:"Merkliste",watchSub:"Artikel, die du beobachtest.",opsTitle:"Katalogbetrieb",opsSub:"Die professionelle Ebene hinter dem Marktplatz.",exportAll:"CSV exportieren",qa:"Qualitätssicherung",reviewQueue:"Prüfliste",findLot:"Los suchen...",readiness:"Exportbereit",catalogHealth:"Katalogstatus",photoIntake:"Foto-Upload",newInventory:"Neues Inventar",newInventorySub:"Fotos zuerst. Struktur und QA danach.",dropTitle:"Gerätefotos hier ablegen",dropSub:"JPG, PNG oder WEBP. Mehrere Fotos pro Los möglich.",shop:"Shop",results:"Ergebnisse",currentBid:"aktuelles Gebot",ends:"endet",verified:"Verifiziertes Auktionshaus",lot:"Los",seller:"Verkäufer",category:"Kategorie",model:"Modell",conditionLabel:"Zustand",qaLabel:"Katalog QA",savedSearch:"Suche gespeichert",favAdded:"Zur Merkliste hinzugefügt",favRemoved:"Von Merkliste entfernt",signIn:"Anmelden",myAccount:"Mein Konto",placeBid:"Gebot abgeben",maxBid:"Maximalgebot",bidHistory:"Gebotsverlauf",highBidder:"Du bist Höchstbietender",register:"Zum Bieten registrieren",registered:"Registriert",pickup:"Abholung / Versand",detected:"Erkannt",myBids:"Meine Gebote",signUp:"Konto erstellen",logOut:"Abmelden",accountCreated:"Konto erstellt",loginFailed:"Anmeldung fehlgeschlagen",bidPlaced:"Gebot abgegeben",uploadDone:"Fotos hochgeladen"},
pl:{brandSub:"narzędzia i sprzęt",searchPh:"Szukaj wiertarek, wózków, kompresorów, marek, modeli...",search:"Szukaj",forHouses:"Dla domów aukcyjnych",addInventory:"+ Dodaj sprzęt",heroEyebrow:"Marketplace + obsługa aukcji",heroTitle:"Znajdź solidny sprzęt.<br>Licytuj pewnie.",heroText:"Prosty marketplace narzędzi i sprzętu przemysłowego z ludzką kontrolą jakości.",browse:"Przeglądaj sprzęt",auctions:"Aukcje",trust1:"Dane sprawdzone przez człowieka",trust2:"Jasny stan",trust3:"Zweryfikowane domy aukcyjne",discover:"Odkrywaj",ending:"Kończy się wkrótce",endingSub:"Sprzęt wart uwagi.",marketplace:"Marketplace",allEquip:"Cały sprzęt",filters:"Filtry",sort:"Sortuj",condition:"Stan",brand:"Marka",priceRange:"Aktualna cena",saveSearch:"☆ Zapisz wyszukiwanie",trusted:"Zaufani sprzedawcy",featuredAuctions:"Polecane aukcje",featuredSub:"Likwidacje firm i sprzęt specjalistyczny.",allAuctions:"Wszystkie aukcje →",browseBySale:"Według aukcji",auctionProjects:"Projekty aukcyjne",auctionProjectsSub:"Kolekcje zweryfikowanych domów aukcyjnych.",saved:"Zapisane",watchlist:"Obserwowane",watchSub:"Przedmioty, które śledzisz.",opsTitle:"Operacje katalogowe",opsSub:"Profesjonalna warstwa pod prostym marketplace.",exportAll:"Eksportuj CSV",qa:"Kontrola jakości",reviewQueue:"Kolejka kontroli",findLot:"Znajdź lot...",readiness:"Gotowość eksportu",catalogHealth:"Stan katalogu",photoIntake:"Import zdjęć",newInventory:"Dodaj nowy sprzęt",newInventorySub:"Najpierw zdjęcia. Potem struktura i QA.",dropTitle:"Upuść zdjęcia sprzętu tutaj",dropSub:"JPG, PNG lub WEBP. Wiele zdjęć na lot.",shop:"Sklep",results:"wyników",currentBid:"aktualna oferta",ends:"kończy się",verified:"Zweryfikowany dom aukcyjny",lot:"Lot",seller:"Sprzedawca",category:"Kategoria",model:"Model",conditionLabel:"Stan",qaLabel:"Katalog QA",savedSearch:"Wyszukiwanie zapisane",favAdded:"Dodano do obserwowanych",favRemoved:"Usunięto z obserwowanych",signIn:"Zaloguj",myAccount:"Moje konto",placeBid:"Złóż ofertę",maxBid:"Maksymalna oferta",bidHistory:"Historia ofert",highBidder:"Twoja oferta prowadzi",register:"Zarejestruj się",registered:"Zarejestrowano",pickup:"Odbiór / wysyłka",detected:"Wykryto",myBids:"Moje oferty",signUp:"Utwórz konto",logOut:"Wyloguj",accountCreated:"Konto utworzone",loginFailed:"Logowanie nieudane",bidPlaced:"Oferta złożona",uploadDone:"Zdjęcia przesłane"},
nl:{brandSub:"gereedschap & machines",searchPh:"Zoek boren, heftrucks, compressoren, merken, modellen...",search:"Zoeken",forHouses:"Voor veilinghuizen",addInventory:"+ Inventaris toevoegen",heroEyebrow:"Marktplaats + veilingbeheer",heroTitle:"Vind degelijk gereedschap.<br>Bied met vertrouwen.",heroText:"Een eenvoudige marktplaats voor gereedschap en industriële apparatuur met menselijke kwaliteitscontrole.",browse:"Bekijk apparatuur",auctions:"Veilingen",trust1:"Menselijk gecontroleerd",trust2:"Duidelijke conditie",trust3:"Geverifieerde veilinghuizen",discover:"Ontdek",ending:"Eindigt binnenkort",endingSub:"Apparatuur die een kijkje waard is.",marketplace:"Marktplaats",allEquip:"Alle apparatuur",filters:"Filters",sort:"Sorteren",condition:"Conditie",brand:"Merk",priceRange:"Huidige prijs",saveSearch:"☆ Zoekopdracht opslaan",trusted:"Betrouwbare verkopers",featuredAuctions:"Uitgelichte veilingen",featuredSub:"Bedrijfsopheffingen en specialistische apparatuur.",allAuctions:"Alle veilingen →",browseBySale:"Per verkoop",auctionProjects:"Veilingprojecten",auctionProjectsSub:"Collecties van geverifieerde veilinghuizen.",saved:"Opgeslagen",watchlist:"Volglijst",watchSub:"Items die je wilt volgen.",opsTitle:"Catalogusbeheer",opsSub:"De professionele laag achter de marktplaats.",exportAll:"CSV exporteren",qa:"Kwaliteitscontrole",reviewQueue:"Controlelijst",findLot:"Zoek lot...",readiness:"Exportgereed",catalogHealth:"Catalogusstatus",photoIntake:"Foto-invoer",newInventory:"Nieuwe inventaris",newInventorySub:"Eerst foto's. Daarna structuur en QA.",dropTitle:"Sleep foto's van apparatuur hierheen",dropSub:"JPG, PNG of WEBP. Meerdere foto's per lot ondersteund.",shop:"Shop",results:"resultaten",currentBid:"huidig bod",ends:"eindigt",verified:"Geverifieerd veilinghuis",lot:"Lot",seller:"Verkoper",category:"Categorie",model:"Model",conditionLabel:"Conditie",qaLabel:"Catalogus QA",savedSearch:"Zoekopdracht opgeslagen",favAdded:"Toegevoegd aan volglijst",favRemoved:"Verwijderd uit volglijst",signIn:"Inloggen",myAccount:"Mijn account",placeBid:"Bod plaatsen",maxBid:"Maximumbod",bidHistory:"Biedhistorie",highBidder:"Je bent hoogste bieder",register:"Registreer om te bieden",registered:"Geregistreerd",pickup:"Ophalen / verzending",detected:"Gedetecteerd",myBids:"Mijn biedingen",signUp:"Account maken",logOut:"Uitloggen",accountCreated:"Account aangemaakt",loginFailed:"Inloggen mislukt",bidPlaced:"Bod geplaatst",uploadDone:"Foto's geüpload"}
};

const S={lang:"en",houses:[],auctions:[],lots:[],ranked:null,user:null,profile:null,watch:new Set(),regs:new Set(),myBids:new Map(),cat:"All",sort:"recommended",qa:"ALL",manualLang:false,geo:{lat:null,lon:null,country:null,code:null},radius:null,sessionId:crypto.randomUUID(),impressed:new Set()};
const tr=k=>(I18N[S.lang]&&I18N[S.lang][k])||I18N.en[k]||k;
const byId=id=>document.getElementById(id);let serverOffsetMs=0;
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function fmt(v){return new Intl.NumberFormat(S.lang==="no"?"nb-NO":S.lang,{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(Number(v)||0)}
function house(id){return S.houses.find(x=>x.id===id)}
function auction(id){return S.auctions.find(x=>x.id===id)}
function hoursLeft(iso){return Math.max(0,Math.round((new Date(iso)-(Date.now()+serverOffsetMs))/36e5))}
function toast(t){const e=byId("toast");e.textContent=t;e.classList.remove("hidden");setTimeout(()=>e.classList.add("hidden"),1800)}
function status(s){return '<span class="status '+String(s).toLowerCase()+'">'+s+'</span>'}

async function loadPublic(){
  const [h,a,l]=await Promise.all([
    db.from("auction_house_public_profiles").select("*").order("name"),
    db.from("auctions").select("*").eq("public",true).order("ends_at"),
    db.from("lots_public_catalog").select("*").eq("status","open").order("ends_at")
  ]);
  if(h.error||a.error||l.error){console.error(h.error||a.error||l.error);return}
  S.houses=h.data||[];S.auctions=a.data||[];S.lots=l.data||[];
}
async function loadPrivate(){
  S.watch.clear();S.regs.clear();S.myBids.clear();S.profile=null;
  if(!S.user)return;
  const [p,w,r,b]=await Promise.all([
    db.from("profiles").select("*").eq("id",S.user.id).maybeSingle(),
    db.from("watchlist").select("lot_id").eq("user_id",S.user.id),
    db.from("auction_registrations").select("auction_id").eq("user_id",S.user.id),
    db.from("bids").select("lot_id,amount,created_at").eq("bidder_id",S.user.id).order("created_at",{ascending:false})
  ]);
  if(p.data)S.profile=p.data;
  (w.data||[]).forEach(x=>S.watch.add(x.lot_id));
  (r.data||[]).forEach(x=>S.regs.add(x.auction_id));
  (b.data||[]).forEach(x=>{const old=S.myBids.get(x.lot_id)||0;S.myBids.set(x.lot_id,Math.max(old,Number(x.amount)||0))});
}
async function initAuth(){
  const {data:{session}}=await db.auth.getSession();S.user=session?.user||null;await loadPrivate();
  db.auth.onAuthStateChange(async(_event,session)=>{S.user=session?.user||null;await loadPrivate();await syncBuyerGeo();renderAll()});
}
function subscribeRealtime(){
  db.channel("auctioneer-live")
    .on("postgres_changes",{event:"UPDATE",schema:"public",table:"lots_public_catalog"},p=>{const i=S.lots.findIndex(x=>x.id===p.new.id);if(i>=0)S.lots[i]=p.new;else S.lots.push(p.new);renderMarket();renderBids()})
    .on("postgres_changes",{event:"INSERT",schema:"public",table:"bids"},async()=>{if(S.user)await loadPrivate();renderBids()})
    .subscribe();
}

function renderLangMenu(){byId("langMenu").innerHTML=Object.entries(LANGS).map(([k,v])=>'<button class="'+(k===S.lang?'active':'')+'" onclick="setLang(\''+k+'\',true);toggleLangMenu(false)"><span class="flag">'+v[1]+'</span><span class="langName">'+v[2]+'</span><span class="langCode">'+v[0]+'</span></button>').join("")}
function toggleLangMenu(force){const e=byId("langMenu"),show=force===undefined?e.classList.contains("hidden"):force;e.classList.toggle("hidden",!show)}
function setLang(v,manual=false){S.lang=I18N[v]?v:"en";S.manualLang=manual||S.manualLang;if(manual){localStorage.setItem("auctioneer-lang",S.lang);localStorage.setItem("auctioneer-lang-manual","1")}document.documentElement.lang=S.lang;byId("langFlag").textContent=LANGS[S.lang][1];byId("langCode").textContent=LANGS[S.lang][0];document.querySelectorAll("[data-i18n]").forEach(e=>e.innerHTML=tr(e.dataset.i18n));document.querySelectorAll("[data-i18n-placeholder]").forEach(e=>e.placeholder=tr(e.dataset.i18nPlaceholder));renderLangMenu();renderAll()}
async function syncBuyerGeo(){
  if(!S.user||S.geo.lat==null||S.geo.lon==null)return;
  await db.from("buyer_geo_profile").upsert({
    user_id:S.user.id,
    country_code:S.geo.code||null,
    home_latitude:S.geo.lat,
    home_longitude:S.geo.lon,
    preferred_radius_km:S.radius||100
  });
}
async function refreshRankedFeed(){
  if(S.geo.lat==null||S.geo.lon==null){S.ranked=null;renderMarket();return}
  const {data,error}=await db.rpc("ranked_feed",{
    p_lat:S.geo.lat,p_lon:S.geo.lon,p_radius_km:S.radius,
    p_category:null,p_brand:null,p_price_min:null,p_price_max:null,p_limit:100
  });
  if(error){console.error(error);S.ranked=null;renderMarket();return}
  S.ranked=(data||[]).map(r=>{
    const base=S.lots.find(x=>x.id===r.lot_id)||{};
    return {...base,_distance:r.distance_km,_visibility:r.visibility_radius_km,_liquidity:r.liquidity_score,_score:r.final_score,_reasons:r.reason_codes||[]};
  });
  renderMarket();
}
async function detectLang(){
  const map={LT:"lt",NO:"no",DE:"de",AT:"de",CH:"de",PL:"pl",NL:"nl",BE:"nl"};
  const manual=localStorage.getItem("auctioneer-lang-manual")==="1",saved=localStorage.getItem("auctioneer-lang");
  const geoConsent=localStorage.getItem("auctioneer-geo-consent");
  let choice=(navigator.language||"en").slice(0,2).toLowerCase();if(!I18N[choice])choice="en";let label="browser";
  let resolved={lat:null,lon:null,country:null,code:null};
  try{
    const r=await fetch(SB_URL+"/functions/v1/geo",{cache:"no-store"});const d=await r.json();
    if(d?.country_code&&map[String(d.country_code).toUpperCase()])choice=map[String(d.country_code).toUpperCase()];
    label=d?.country||d?.country_code||label;
    resolved={lat:d?.latitude??null,lon:d?.longitude??null,country:d?.country||null,code:d?.country_code||null};
  }catch(e){}
  if(!resolved.code){
    const tz=Intl.DateTimeFormat().resolvedOptions().timeZone||"";
    const m={
      "Europe/Vilnius":{lang:"lt",name:"Lithuania",code:"LT",lat:54.6872,lon:25.2797},
      "Europe/Oslo":{lang:"no",name:"Norway",code:"NO",lat:59.9139,lon:10.7522},
      "Europe/Amsterdam":{lang:"nl",name:"Netherlands",code:"NL",lat:52.3676,lon:4.9041},
      "Europe/Berlin":{lang:"de",name:"Germany",code:"DE",lat:52.52,lon:13.405},
      "Europe/Warsaw":{lang:"pl",name:"Poland",code:"PL",lat:52.2297,lon:21.0122}
    };
    if(m[tz]){choice=m[tz].lang;label=m[tz].name;resolved={lat:m[tz].lat,lon:m[tz].lon,country:m[tz].name,code:m[tz].code}}
  }
  S.geo=geoConsent==="yes"?resolved:{lat:null,lon:null,country:resolved.country,code:resolved.code};
  setLang(manual&&saved?saved:choice,false);
  byId("geoLabel").textContent=tr("detected")+": "+label+(geoConsent==="yes"?" · Near me on":"");
  if(geoConsent===null)showGeoConsent();
  await syncBuyerGeo();
  await refreshRankedFeed();
}
function showGeoConsent(){
  const box=byId("privacyBanner");if(!box)return;
  box.innerHTML='<div><b>Use approximate location for nearby lots?</b><span>We use country/city-level location to rank local equipment. You can browse without it.</span></div><div><button class="btn sm" onclick="setGeoConsent(false)">Not now</button><button class="btn primary sm" onclick="setGeoConsent(true)">Use Near me</button></div>';
  box.classList.remove("hidden");
}
async function setGeoConsent(allow){
  localStorage.setItem("auctioneer-geo-consent",allow?"yes":"no");
  byId("privacyBanner")?.classList.add("hidden");
  await detectLang();
}

function showView(v){document.querySelectorAll(".view").forEach(e=>e.classList.remove("active"));const target=byId(v+"View");if(target)target.classList.add("active");document.querySelectorAll("[data-nav]").forEach(e=>e.classList.toggle("active",e.dataset.nav===v));if(v==="watch")renderWatch();if(v==="bids")renderBids();if(v==="seller")renderSeller();if(v==="orders")renderOrders();if(v==="notifications")renderNotifications();if(v==="admin")renderAdmin();if(v==="ops"){renderOps();renderOpsTable()}window.scrollTo({top:0,behavior:"smooth"})}
function categories(){return ["All",...new Set(S.lots.map(x=>x.category).filter(Boolean))]}
function renderCats(){byId("catChips").innerHTML=categories().map(c=>'<button class="chip '+(S.cat===c?'active':'')+'" onclick="S.cat=\''+esc(c).replace(/&#39;/g,"\\'")+'\';renderCats();renderMarket()">'+esc(c)+'</button>').join("")}
function renderBrands(){const s=byId("brandSel"),cur=s.value;s.innerHTML='<option value="">All brands</option>'+[...new Set(S.lots.map(x=>x.brand).filter(Boolean))].sort().map(b=>'<option>'+esc(b)+'</option>').join("");s.value=cur}
function filtered(){
  const q=(byId("globalSearch").value||"").toLowerCase().trim(),cond=byId("conditionSel").value,brand=byId("brandSel").value,mn=Number(byId("minPrice").value||0),mx=Number(byId("maxPrice").value||0),wOnly=byId("watchOnly").checked,bOnly=byId("bidsOnly").checked;
  let a=(S.ranked||S.lots).filter(x=>(S.cat==="All"||x.category===S.cat)&&(!cond||x.condition===cond)&&(!brand||x.brand===brand)&&(!mn||Number(x.current_bid)>=mn)&&(!mx||Number(x.current_bid)<=mx)&&(!wOnly||S.watch.has(x.id))&&(!bOnly||S.myBids.has(x.id))&&(!q||[x.title,x.brand,x.model,x.category,auction(x.auction_id)?.title,house(auction(x.auction_id)?.house_id)?.name].join(" ").toLowerCase().includes(q)));
  if(S.sort==="recommended"&&S.ranked)a.sort((a,b)=>(b._score||0)-(a._score||0));if(S.sort==="ending")a.sort((a,b)=>new Date(a.ends_at)-new Date(b.ends_at));if(S.sort==="hot")a.sort((a,b)=>b.bid_count-a.bid_count);if(S.sort==="priceLow")a.sort((a,b)=>a.current_bid-b.current_bid);if(S.sort==="priceHigh")a.sort((a,b)=>b.current_bid-a.current_bid);return a
}
function itemCard(x){
  const a=auction(x.auction_id),h=house(a?.house_id),my=S.myBids.get(x.id),img=(x.image_urls||[])[0]||a?.cover_url||"";
  return '<article class="item"><div class="photo" onclick="openItem(\''+x.id+'\')"><img loading="lazy" src="'+esc(img)+'" alt="'+esc(x.title)+'"><button class="fav '+(S.watch.has(x.id)?'on':'')+'" onclick="event.stopPropagation();toggleWatch(\''+x.id+'\')">'+(S.watch.has(x.id)?'♥':'♡')+'</button>'+(a?.is_demo?'<span class="demoBadge">DEMO</span>':'')+(x.bid_count>=15?'<span class="hot">🔥 '+x.bid_count+' bids</span>':'')+'<span class="tag">'+esc(x.condition||"Used")+'</span></div><div class="ib"><div class="meta">'+esc(h?.name||"Auction house")+' · '+esc(x.category||"Equipment")+'</div><h3>'+esc(x.title)+'</h3><div class="desc">'+esc(x.brand||"")+' · '+esc(x.model||"")+'</div>'+(x._distance!=null?'<div class="row"><span>📍 '+x._distance+' km</span><span>'+((x._reasons||[]).includes("NEARBY_25KM")?"Near you":((x._reasons||[]).includes("SHIPPING_AVAILABLE")?"Shipping available":"Smart reach"))+'</span></div>':'')+'<div class="price">'+fmt(x.current_bid)+' <small>'+tr("currentBid")+'</small></div><div class="row"><span>'+(my?'<span class="status blue">MY BID '+fmt(my)+'</span>':status(x.qa_status))+'</span><span>'+tr("ends")+' '+hoursLeft(x.ends_at)+'h</span></div></div></article>'
}
function renderMarket(){
  const a=filtered();byId("resultCount").textContent=a.length+" "+tr("results");byId("marketGrid").innerHTML=a.length?a.map(itemCard).join(""):'<div class="empty" style="grid-column:1/-1"><b>No matching equipment</b>Try changing filters or search terms.</div>';
  byId("endingGrid").innerHTML=[...S.lots].sort((a,b)=>new Date(a.ends_at)-new Date(b.ends_at)).slice(0,4).map(itemCard).join("");
  byId("hotGrid").innerHTML=[...S.lots].sort((a,b)=>b.bid_count-a.bid_count).slice(0,4).map(itemCard).join("");
  a.slice(0,20).forEach(x=>{if(!S.impressed.has(x.id)){S.impressed.add(x.id);trackEvent(x.id,"impression",x._distance)}});
}
function auctionCard(a){
  const h=house(a.house_id),ls=S.lots.filter(x=>x.auction_id===a.id),reg=S.regs.has(a.id);
  return '<article class="auction"><div class="auctioncover"><img loading="lazy" src="'+esc(a.cover_url||"")+'">'+(a.is_demo?'<span class="demoBadge auctionDemo">DEMO INVENTORY</span>':'')+'<div class="auctiontxt"><small>'+esc(a.platform||a.status)+'</small><h3>'+esc(a.title)+'</h3><div>✓ '+esc(h?.name||"Auction house")+'</div></div></div><div class="auctionbody"><div class="stats"><div class="stat"><small>Lots</small><b>'+ls.length+'</b></div><div class="stat"><small>GREEN</small><b>'+ls.filter(x=>x.qa_status==="GREEN").length+'</b></div><div class="stat"><small>Bids</small><b>'+ls.reduce((s,x)=>s+x.bid_count,0)+'</b></div><div class="stat"><small>Ends</small><b>'+hoursLeft(a.ends_at)+'h</b></div></div><div class="row"><span class="status green">✓ '+tr("verified")+'</span><div style="display:flex;gap:5px"><button class="btn sm" onclick="registerAuction(\''+a.id+'\')">'+(reg?tr("registered"):tr("register"))+'</button><button class="btn sm" onclick="focusAuction(\''+a.id+'\')">Open</button></div></div></div></article>'
}
function renderAuctions(){byId("featuredAuctions").innerHTML=S.auctions.slice(0,3).map(auctionCard).join("");byId("allAuctions").innerHTML=S.auctions.map(auctionCard).join("")}
function renderAuctionDetail(id){
  const a=auction(id);if(!a)return;const h=house(a.house_id),ls=S.lots.filter(x=>x.auction_id===id),reg=S.regs.has(id);
  const totalBids=ls.reduce((s,x)=>s+Number(x.bid_count||0),0),green=ls.filter(x=>x.qa_status==="GREEN").length,watching=ls.filter(x=>S.watch.has(x.id)).length,top=ls.length?Math.max(...ls.map(x=>Number(x.current_bid||0))):0;
  byId("auctionDetail").innerHTML=
    '<button class="backlink" onclick="showView(\'auctions\')">← Back to auctions</button>'+
    '<div class="auctionDetailHero"><img src="'+esc(a.cover_url||"")+'"><div class="auctionDetailContent"><div class="eyebrow" style="color:#dff1e6">'+esc(a.status||"timed")+' auction · '+esc(a.platform||"")+'</div><h1>'+esc(a.title)+'</h1><p style="max-width:650px;line-height:1.6;color:#edf5ef">Professional equipment sale from a verified auction house. Review lot photos, condition notes and bidding activity before placing a bid.</p><div class="auctionMeta"><span>✓ '+esc(h?.name||"Auction house")+'</span><span>📍 '+esc(a.location||h?.location||"")+'</span><span>⏱ '+hoursLeft(a.ends_at)+'h left</span><span>Buyer premium '+Number(a.buyer_premium||0)+'%</span></div><div class="auctionActions"><button class="btn primary" style="background:#fff;color:#425c4d;border-color:#fff" onclick="registerAuction(\''+a.id+'\')">'+(reg?tr("registered"):tr("register"))+'</button><button class="btn" onclick="document.getElementById(\'auctionLots\').scrollIntoView({behavior:\'smooth\'})">Browse '+ls.length+' lots</button></div></div></div>'+
    '<div class="auctionStats"><div class="auctionStat"><small>Lots</small><b>'+ls.length+'</b></div><div class="auctionStat"><small>Total bids</small><b>'+totalBids+'</b></div><div class="auctionStat"><small>GREEN QA</small><b>'+green+'</b></div><div class="auctionStat"><small>Watchlisted</small><b>'+watching+'</b></div><div class="auctionStat"><small>Highest current bid</small><b>'+fmt(top)+'</b></div></div>'+
    '<div class="auctionInfoGrid"><div class="auctionInfoCard"><h3>Auction information</h3><div class="auctionInfoRows"><div><span>Auction house</span><b>'+esc(h?.name||"")+'</b></div><div><span>Location</span><b>'+esc(a.location||h?.location||"")+'</b></div><div><span>Format</span><b>'+esc(a.status||"timed")+'</b></div><div><span>Platform</span><b>'+esc(a.platform||"Auctioneer")+'</b></div></div></div><div class="auctionInfoCard"><h3>Buyer terms</h3><div class="auctionInfoRows"><div><span>Buyer premium</span><b>'+Number(a.buyer_premium||0)+'%</b></div><div><span>Pickup</span><b style="text-align:right">'+esc(a.pickup_info||"See auction terms")+'</b></div><div><span>Registration</span><b>'+(reg?"Approved":"Required")+'</b></div></div></div></div>'+
    '<div id="auctionLots" class="auctionLotHeader"><div><div class="eyebrow">Auction catalog</div><h2>'+ls.length+' lots in this sale</h2></div><span class="muted">'+totalBids+' total bids</span></div>'+
    '<div class="grid">'+(ls.length?ls.map(itemCard).join(""):'<div class="empty" style="grid-column:1/-1"><b>No lots yet</b>This auction has no active lots.</div>')+'</div>';
}
function focusAuction(id){const u=new URL(location.href);u.searchParams.delete("lot");u.searchParams.set("auction",id);history.pushState({auction:id},"",u);renderAuctionDetail(id);showView("auctionDetail")}

function reportClientError(message,source=null,lineNo=null,colNo=null,stack=null){
  db.rpc("record_client_error",{
    p_session_id:S.sessionId,
    p_message:String(message||"Unknown error"),
    p_source:source,
    p_line_no:lineNo,
    p_col_no:colNo,
    p_stack:stack,
    p_page_url:location.href,
    p_user_agent:navigator.userAgent
  }).catch(()=>{})
}
function trackEvent(lotId,type,distance=null,metadata={}){db.rpc("record_marketplace_event",{p_lot_id:lotId||null,p_event_type:type,p_distance_km:distance,p_session_id:S.sessionId,p_metadata:metadata}).catch(()=>{})}
async function toggleWatch(lotId){
  if(!S.user){openAuth("signin");return}
  if(S.watch.has(lotId)){const {error}=await db.from("watchlist").delete().eq("user_id",S.user.id).eq("lot_id",lotId);if(!error){S.watch.delete(lotId);trackEvent(lotId,"watch_remove",S.lots.find(x=>x.id===lotId)?._distance);toast(tr("favRemoved"))}}
  else{const {error}=await db.from("watchlist").insert({user_id:S.user.id,lot_id:lotId});if(!error){S.watch.add(lotId);trackEvent(lotId,"watch_add",S.lots.find(x=>x.id===lotId)?._distance);toast(tr("favAdded"))}}
  renderAll()
}
function renderWatch(){const a=S.lots.filter(x=>S.watch.has(x.id));byId("watchGrid").innerHTML=a.length?a.map(itemCard).join(""):'<div class="empty" style="grid-column:1/-1"><b>'+tr("watchlist")+'</b>'+tr("watchSub")+'</div>'}
function renderBids(){const a=S.lots.filter(x=>S.myBids.has(x.id));byId("bidsGrid").innerHTML=a.length?a.map(itemCard).join(""):'<div class="empty" style="grid-column:1/-1"><b>'+tr("myBids")+'</b>No bids yet.</div>'}

async function registerAuction(id){
  if(!S.user){openAuth("signin");return}
  byId("modal").className="modal";
  byId("modal").innerHTML='<div class="modalbox" style="max-width:540px"><div class="modalhead"><button class="close" onclick="closeModal()">×</button></div><div style="padding:0 22px 24px"><div class="eyebrow">Auction registration</div><h2 style="font:700 30px Georgia;margin:6px 0">Review auction rules</h2><p class="muted" style="line-height:1.6">Bids may be binding. Server time is authoritative. Maximum bids use proxy bidding and late bids may extend the auction under soft-close rules.</p><label class="consentBox"><input id="rulesConsent" type="checkbox"> <span>I accept the Auction Rules for this auction.</span></label><div style="display:flex;gap:8px;margin-top:14px"><button class="btn" onclick="openLegal(\'auction-rules\')">Read rules</button><button class="btn primary" onclick="confirmAuctionRegistration(\''+id+'\')">Register</button></div></div></div>'
}
async function confirmAuctionRegistration(id){
  if(!byId("rulesConsent")?.checked){toast("Please accept the Auction Rules");return}
  const {error}=await db.rpc("register_for_auction",{p_auction_id:id,p_accept_rules:true});
  if(error){toast(error.message);return}
  S.regs.add(id);trackEvent(null,"auction_register",null,{auction_id:id});toast(tr("registered"));closeModal();renderAuctions();if(byId("auctionDetailView")?.classList.contains("active"))renderAuctionDetail(id)
}
async function placeBid(lotId){
  if(!S.user){openAuth("signin");return}
  const x=S.lots.find(v=>v.id===lotId),a=auction(x?.auction_id);
  if(a?.is_demo||S.platform?.bidding_enabled===false){toast("Demo / preview inventory — real bidding is currently disabled");return}
  if(!S.regs.has(x.auction_id)){toast("Register for this auction first");return}
  const amount=Number(byId("bidAmount").value||0);const {data,error}=await db.rpc("place_bid",{p_lot_id:lotId,p_amount:amount});
  if(error){toast(error.message.replace("BID_TOO_LOW","Bid too low").replace("REGISTRATION_REQUIRED","Register for this auction first"));return}
  if(data){const i=S.lots.findIndex(v=>v.id===lotId);if(i>=0)S.lots[i]=data}
  S.myBids.set(lotId,amount);trackEvent(lotId,"bid",x?._distance,{amount});toast(tr("bidPlaced"));openItem(lotId);renderAll()
}


function openReportLot(lotId){
  if(!S.user){openAuth("signin");return}
  byId("modal").className="modal";
  byId("modal").innerHTML='<div class="modalbox" style="max-width:540px"><div class="modalhead"><button class="close" onclick="closeModal()">×</button></div><div style="padding:0 22px 24px"><div class="eyebrow">Trust & Safety</div><h2 style="font:700 28px Georgia">Report this listing</h2><select id="reportType" class="control"><option value="misleading_listing">Misleading listing</option><option value="identity_issue">Identity / model issue</option><option value="suspected_fraud">Suspected fraud</option><option value="shill_bidding">Suspicious bidding</option><option value="prohibited_item">Prohibited item</option><option value="other">Other</option></select><textarea id="reportNotes" class="control" style="margin-top:8px;min-height:100px" placeholder="What should we review?"></textarea><button class="btn primary full" style="margin-top:10px" onclick="submitLotReport(\''+lotId+'\')">Send report</button></div></div>';
}
async function submitLotReport(lotId){
  const {error}=await db.rpc("report_lot",{p_lot_id:lotId,p_flag_type:byId("reportType").value,p_notes:byId("reportNotes").value||null});
  if(error){toast(error.message);return}
  toast("Listing reported for review");closeModal();
}

async function updateFeeQuote(lotId){
  const input=byId("bidAmount"),box=byId("feeQuote");
  if(!input||!box)return;
  const amount=Number(input.value||0);
  box.innerHTML='<div class="muted" style="font-size:11px">Calculating all-in estimate…</div>';
  const {data,error}=await db.rpc("lot_fee_quote",{p_lot_id:lotId,p_hammer_price:amount});
  if(error||!data?.length){
    box.innerHTML='<div class="muted" style="font-size:11px">Fee estimate unavailable.</div>';
    return;
  }
  const q=data[0];
  box.innerHTML=
    '<div class="feeTitle">Estimated all-in price</div>'+
    '<div class="feeRow"><span>Bid / hammer price</span><b>'+fmt(q.hammer_price)+'</b></div>'+
    '<div class="feeRow"><span>Buyer premium ('+Number(q.buyer_premium_pct)+'%)</span><b>'+fmt(q.buyer_premium_amount)+'</b></div>'+
    '<div class="feeRow"><span>Auctioneer Buyer Protection</span><b>'+fmt(q.protection_fee)+'</b></div>'+
    '<div class="feeTotal"><span>Estimated total</span><b>'+fmt(q.total_before_tax)+'</b></div>'+
    '<div class="feeNote">Buyer Protection: '+Number(q.protection_rate_pct)+'%'+(Number(q.protection_fixed_fee)>0?' + '+fmt(q.protection_fixed_fee):'')+(q.protection_cap?' · cap '+fmt(q.protection_cap):'')+'. VAT, shipping or seller-specific taxes may apply separately.</div>';
}
async function openItem(id){
  const x=S.lots.find(v=>v.id===id);if(!x)return;const u=new URL(location.href);u.searchParams.set("lot",id);history.pushState({lot:id},"",u);trackEvent(id,"detail_view",x._distance);const a=auction(x.auction_id),h=house(a?.house_id),imgs=x.image_urls||[];
  const {data:hist}=await db.from("public_bid_history").select("amount,created_at").eq("lot_id",id).order("created_at",{ascending:false}).limit(6);
  const thumbHtml=imgs.map(u=>'<img src="'+esc(u)+'" onclick="byId(\'detailMainImg\').src=this.src">').join("");
  byId("modal").className="modal";byId("modal").innerHTML='<div class="modalbox"><div class="modalhead"><button class="close" onclick="closeModal()">×</button></div><div class="detail"><div><div class="gallerymain"><img id="detailMainImg" src="'+esc(imgs[0]||a?.cover_url||"")+'" alt="'+esc(x.title)+'"></div><div class="thumbrow">'+thumbHtml+'</div><div class="row"><span>📷 '+Math.max(imgs.length,1)+' inspection photos</span><span>Lot #'+x.lot_number+'</span></div></div><div><div class="eyebrow">'+esc(a?.title||"Auction")+'</div><h2>'+esc(x.title)+'</h2><div class="price">'+fmt(x.current_bid)+' <small>'+tr("currentBid")+' · '+x.bid_count+' bids</small></div><div class="specs"><div class="spec"><small>'+tr("brand")+'</small><b>'+esc(x.brand||"—")+'</b></div><div class="spec"><small>'+tr("model")+'</small><b>'+esc(x.model||"—")+'</b></div><div class="spec"><small>'+tr("category")+'</small><b>'+esc(x.category||"—")+'</b></div><div class="spec"><small>'+tr("conditionLabel")+'</small><b>'+esc(x.condition||"—")+'</b></div><div class="spec"><small>'+tr("qaLabel")+'</small>'+status(x.qa_status)+'</div><div class="spec"><small>'+tr("ends")+'</small><b>'+hoursLeft(x.ends_at)+'h</b></div></div><p class="muted" style="line-height:1.6">'+esc(x.description||"")+'</p>'+(a?.is_demo?'<div class="notice demoNotice"><b>Demo inventory</b> · This listing is for preview/testing only. Real bidding and payment are disabled.</div>':'')+'<div class="notice">Buyer premium: '+Number(a?.buyer_premium||0)+'% · '+esc(a?.pickup_info||"Pickup terms provided by seller")+'</div><div class="bidbox"><div class="eyebrow">'+tr("placeBid")+'</div><div class="bidrow"><input id="bidAmount" type="number" min="'+(Number(x.current_bid)+Number(x.min_increment))+'" value="'+(Number(x.current_bid)+Number(x.min_increment))+'" oninput="updateFeeQuote(\''+x.id+'\')"><button class="btn primary" onclick="placeBid(\''+x.id+'\')">'+tr("placeBid")+'</button></div><div class="bidstatus">'+tr("maxBid")+' · minimum next '+fmt(Number(x.current_bid)+Number(x.min_increment))+' · your maximum stays private</div><div class="notice" style="margin-top:8px">Proxy bidding automatically bids only as much as needed. '+(x.reserve_price!=null?(x.reserve_met?'✓ Reserve met':'Reserve not met'):'No reserve disclosed')+' · soft close '+Math.round(Number(x.soft_close_seconds||120)/60)+' min</div><div id="feeQuote" class="feeQuote"></div><div class="history"><b>'+tr("bidHistory")+'</b>'+((hist||[]).length?(hist||[]).map((v,i)=>'<div class="historyline"><span>Bidder '+(i+1)+'</span><b>'+fmt(v.amount)+'</b></div>').join(""):'<div class="historyline"><span>No bids yet</span><b>—</b></div>')+'</div></div><div style="display:flex;gap:8px;margin-top:10px"><button class="btn" onclick="toggleWatch(\''+x.id+'\')">'+(S.watch.has(x.id)?'♥':'♡')+' '+tr("watchlist")+'</button><button class="btn" onclick="toast(\''+tr("pickup").replace(/'/g,"\\'")+'\')">🚚 '+tr("pickup")+'</button><button class="btn" onclick="openReportLot(\''+x.id+'\')">⚑ Report</button></div><div class="seller"><b>✓ '+esc(h?.name||"Auction house")+'</b><span>'+tr("verified")+' · '+esc(a?.platform||"")+'</span></div></div></div></div>';updateFeeQuote(id)
}
function closeModal(){byId("modal").className="hidden";byId("modal").innerHTML="";document.body.classList.remove("noScroll");const u=new URL(location.href);if(u.searchParams.has("lot")){u.searchParams.delete("lot");history.replaceState({},"",u)}}

function openAuth(mode="signin"){
  byId("modal").className="modal";byId("modal").innerHTML='<div class="modalbox" style="max-width:500px"><div class="modalhead"><button class="close" onclick="closeModal()">×</button></div><div style="padding:0 22px 24px"><div class="eyebrow">Auctioneer ID</div><h2 style="font:700 30px Georgia;margin:6px 0">'+tr(mode==="signup"?"signUp":"signIn")+'</h2><div class="authTabs"><button class="'+(mode==="signin"?"active":"")+'" onclick="openAuth(\'signin\')">'+tr("signIn")+'</button><button class="'+(mode==="signup"?"active":"")+'" onclick="openAuth(\'signup\')">'+tr("signUp")+'</button></div>'+(mode==="signup"?'<input id="authName" class="control" placeholder="Name" style="margin:6px 0"><select id="authType" class="control" style="margin:6px 0"><option value="personal">Personal buyer</option><option value="business">Business buyer</option><option value="auction_house">Auction house</option></select>':'')+'<input id="authEmail" class="control" type="email" placeholder="Email" style="margin:6px 0"><input id="authPassword" class="control" type="password" placeholder="Password" style="margin:6px 0"><button class="btn primary full" style="margin-top:9px" onclick="'+(mode==="signup"?"doSignUp()":"doSignIn()")+'">'+tr(mode==="signup"?"signUp":"signIn")+'</button></div></div>'
}
async function doSignUp(){
  const email=byId("authEmail").value,password=byId("authPassword").value,name=byId("authName").value,type=byId("authType").value;
  const {error}=await db.auth.signUp({email,password,options:{data:{display_name:name,account_type:type,locale:S.lang},emailRedirectTo:location.origin}});
  if(error){toast(error.message);return}toast(tr("accountCreated"));closeModal()
}
async function doSignIn(){const {error}=await db.auth.signInWithPassword({email:byId("authEmail").value,password:byId("authPassword").value});if(error){toast(tr("loginFailed")+": "+error.message);return}closeModal()}
async function doLogout(){await db.auth.signOut();closeModal()}
function openAccount(){
  if(!S.user){openAuth("signin");return}
  const adminBtn=S.profile?.app_role==="admin"?'<button class="btn full" style="margin-top:7px" onclick="showView(\'admin\');closeModal()">Admin dashboard</button>':'';
  byId("modal").className="modal";
  byId("modal").innerHTML='<div class="modalbox" style="max-width:500px"><div class="modalhead"><button class="close" onclick="closeModal()">×</button></div><div style="padding:0 22px 24px"><div class="eyebrow">Auctioneer ID</div><h2 style="font:700 30px Georgia;margin:6px 0">'+esc(S.profile?.display_name||S.user.email)+'</h2><div class="notice">'+esc(S.profile?.account_type||"buyer")+' · '+esc(S.user.email||"")+'</div><button class="btn full" onclick="showView(\'bids\');closeModal()">'+tr("myBids")+'</button><button class="btn full" style="margin-top:7px" onclick="showView(\'watch\');closeModal()">'+tr("watchlist")+'</button><button class="btn full" style="margin-top:7px" onclick="showView(\'orders\');closeModal()">My orders</button><button class="btn full" style="margin-top:7px" onclick="showView(\'notifications\');closeModal()">Notifications</button>'+adminBtn+'<button class="btn dark full" style="margin-top:14px" onclick="doLogout()">'+tr("logOut")+'</button></div></div>'
}
function renderAccount(){const label=byId("accountLabel"),av=document.querySelector("#accountBtn .avatar");if(S.user){label.textContent=S.profile?.display_name||tr("myAccount");av.textContent=(S.profile?.display_name||S.user.email||"U").charAt(0).toUpperCase()}else{label.textContent=tr("signIn");av.textContent="U"}}

async function saveSearch(){
  const q={q:byId("globalSearch").value,cat:S.cat,condition:byId("conditionSel").value,brand:byId("brandSel").value};
  if(S.user){const {error}=await db.from("saved_searches").insert({user_id:S.user.id,label:q.q||q.cat,query:q});if(error){toast(error.message);return}}
  else localStorage.setItem("auctioneer-saved-search",JSON.stringify(q));
  toast(tr("savedSearch"))
}
function searchInput(){renderMarket();showSearchSuggestions()}
async function showSearchSuggestions(){
  const q=byId("globalSearch").value.trim(),box=byId("suggestions");
  if(q.length<2){box.classList.add("hidden");return}
  const {data,error}=await db.rpc("search_lots",{p_query:q,p_limit:8});
  if(error||!data?.length){box.classList.add("hidden");return}
  box.innerHTML=data.map(x=>'<button onclick="chooseSearch(\''+esc(x.title).replace(/&#39;/g,"\\'")+'\',\''+x.lot_id+'\')"><span>'+esc(x.title)+'</span><small>'+esc(x.brand||"")+' · '+esc(x.model||"")+'</small></button>').join("");
  box.classList.remove("hidden")
}
function chooseSearch(v,lotId=null){byId("globalSearch").value=v;byId("suggestions").classList.add("hidden");renderMarket();if(lotId){trackEvent(lotId,"search_click",null,{query:v});openItem(lotId)}}
function setDensity(v){byId("gridBtn").classList.toggle("active",v==="grid");byId("compactBtn").classList.toggle("active",v==="compact");byId("marketGrid").style.gridTemplateColumns=v==="compact"?"repeat(auto-fill,minmax(180px,1fr))":""}
function openFilterSheet(){document.body.classList.add("noScroll");byId("modal").className="sheet";byId("modal").innerHTML='<div class="sheetbox"><div class="modalhead"><b style="margin-right:auto;font:700 23px Georgia">Refine results</b><button class="close" onclick="closeModal()">×</button></div><div class="fgroup"><label>'+tr("sort")+'</label><select id="mSort" class="control"><option value="recommended">Recommended</option><option value="ending">Ending soon</option><option value="hot">Most bids</option><option value="priceLow">Price: low to high</option><option value="priceHigh">Price: high to low</option></select></div><div class="fgroup"><label>'+tr("condition")+'</label><select id="mCond" class="control"><option value="">Any condition</option><option>Excellent</option><option>Good</option><option>Used</option><option>For parts</option></select></div><div class="fgroup"><label>'+tr("brand")+'</label><select id="mBrand" class="control"><option value="">All brands</option>'+[...new Set(S.lots.map(x=>x.brand).filter(Boolean))].sort().map(b=>'<option>'+esc(b)+'</option>').join("")+'</select></div><button class="btn primary full" style="margin-top:12px" onclick="applyMobileFilters()">Apply filters</button></div>';byId("mSort").value=S.sort;byId("mCond").value=byId("conditionSel").value;byId("mBrand").value=byId("brandSel").value}
async function setNearRadius(v){S.radius=v?Number(v):null;await syncBuyerGeo();await refreshRankedFeed()}
function applyMobileFilters(){S.sort=byId("mSort").value;byId("sortSel").value=S.sort;byId("conditionSel").value=byId("mCond").value;byId("brandSel").value=byId("mBrand").value;closeModal();renderMarket()}

async function handleFiles(files){
  if(!S.user){openAuth("signin");return}
  const box=byId("intakePreview");box.classList.remove("hidden");box.innerHTML='<div class="eyebrow">'+tr("photoIntake")+'</div><h2 style="font:700 24px Georgia;margin:6px 0">Uploading '+files.length+' photos…</h2><div id="uploadGrid" class="uploadGrid"></div>';
  for(const file of [...files]){
    const path=S.user.id+"/"+crypto.randomUUID()+"-"+file.name.replace(/[^a-zA-Z0-9._-]+/g,"-");
    const {error}=await db.storage.from("lot-images").upload(path,file,{upsert:false});if(error){toast(error.message);continue}
    const {data}=db.storage.from("lot-images").getPublicUrl(path);await db.from("intake_items").insert({user_id:S.user.id,image_url:data.publicUrl,file_name:file.name,status:"uploaded"});
    byId("uploadGrid").insertAdjacentHTML("beforeend",'<div class="uploadCard"><img src="'+esc(data.publicUrl)+'"><div>'+esc(file.name)+'<br><span class="status green">UPLOADED</span></div></div>')
  }
  toast(tr("uploadDone"))
}
function renderOps(){
  const green=S.lots.filter(x=>x.qa_status==="GREEN").length,yellow=S.lots.filter(x=>x.qa_status==="YELLOW").length,red=S.lots.filter(x=>x.qa_status==="RED").length,ready=S.lots.length?Math.round(green/S.lots.length*100):0;
  byId("opsKpis").innerHTML=[["Auctions",S.auctions.length],["Lots",S.lots.length],["GREEN",green],["Needs review",yellow+red],["Live bids",S.lots.reduce((s,x)=>s+x.bid_count,0)],["Watchlisted",S.watch.size]].map(x=>'<div class="kpi"><small>'+x[0]+'</small><b>'+x[1]+'</b></div>').join("");
  byId("health").innerHTML='<p><b>'+ready+'% ready for straight-through export</b></p><div class="progress"><i style="width:'+ready+'%"></i></div><div class="checklist" style="margin-top:14px"><div class="check"><i>✓</i><div><b>'+green+' GREEN lots</b><span>Identity and key visible facts are clear.</span></div></div><div class="check"><i>!</i><div><b>'+yellow+' YELLOW lots</b><span>Human confirmation recommended.</span></div></div><div class="check"><i>×</i><div><b>'+red+' RED lots</b><span>Critical identity/specification gap.</span></div></div></div>'
}
function renderOpsTable(){const q=(byId("opsSearch").value||"").toLowerCase(),a=S.lots.filter(x=>(S.qa==="ALL"||x.qa_status===S.qa)&&(!q||[x.title,x.brand,x.model,auction(x.auction_id)?.title].join(" ").toLowerCase().includes(q)));byId("opsTable").innerHTML='<table><thead><tr><th>Photo</th><th>Auction</th><th>Lot</th><th>QA</th><th>Title</th><th>Brand</th><th>Warnings</th><th>Bids</th></tr></thead><tbody>'+a.map(x=>'<tr><td><img class="thumb" src="'+esc((x.image_urls||[])[0]||"")+'"></td><td>'+esc(auction(x.auction_id)?.title||"")+'</td><td>#'+x.lot_number+'</td><td>'+status(x.qa_status)+'</td><td><b>'+esc(x.title)+'</b></td><td>'+esc(x.brand||"")+'</td><td>'+x.warning_count+'</td><td>'+x.bid_count+'</td></tr>').join("")+'</tbody></table>'}
function downloadAllCsv(){const h=["Auction","Lot","Title","Brand","Model","Category","Condition","CurrentBidEUR","Bids","QA"];const rows=S.lots.map(x=>[auction(x.auction_id)?.title,x.lot_number,x.title,x.brand,x.model,x.category,x.condition,x.current_bid,x.bid_count,x.qa_status]);const csv="\uFEFF"+h.join(",")+"\n"+rows.map(r=>r.map(v=>{v=String(v??"");return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}).join(",")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="auctioneer-catalog.csv";a.click()}
function renderVisuals(){
  const top=[...S.auctions].sort((a,b)=>S.lots.filter(x=>x.auction_id===b.id).reduce((s,x)=>s+x.bid_count,0)-S.lots.filter(x=>x.auction_id===a.id).reduce((s,x)=>s+x.bid_count,0))[0];if(!top)return;
  const ls=S.lots.filter(x=>x.auction_id===top.id),bids=ls.reduce((s,x)=>s+x.bid_count,0),ready=ls.length?Math.round(ls.filter(x=>x.qa_status==="GREEN").length/ls.length*100):0;
  byId("visualStrip").innerHTML='<div class="visualHero"><img src="'+esc(top.cover_url||"")+'"><div class="visualText"><div class="eyebrow" style="color:#e9f5ed">Most active sale</div><h3>'+esc(top.title)+'</h3><div>'+bids+' bids · '+ls.length+' lots · '+hoursLeft(top.ends_at)+'h left</div></div></div><div class="visualStat"><div><div class="eyebrow">Catalog readiness</div><h3 style="font:700 31px Georgia;margin:8px 0">'+ready+'%</h3><div class="bar"><i style="width:'+ready+'%"></i></div></div><p class="muted">Human-reviewed lot data prepared for bidding and export.</p></div><div class="visualStat"><div><div class="eyebrow">Marketplace activity</div><h3 style="font:700 31px Georgia;margin:8px 0">'+S.lots.reduce((s,x)=>s+x.bid_count,0)+'</h3><div class="bar"><i style="width:'+Math.min(100,S.lots.reduce((s,x)=>s+x.bid_count,0)/4)+'%"></i></div></div><p class="muted">Total bidding activity across current demo inventory.</p></div>'
}

async function syncServerTime(){
  const t0=Date.now();
  const {data}=await db.rpc("server_time");
  const t1=Date.now();
  if(data)serverOffsetMs=new Date(data).getTime()-((t0+t1)/2);
}


async function loadPlatformSettings(){
  const {data}=await db.from("platform_settings").select("*").eq("id",true).maybeSingle();
  S.platform=data||{};
  const banner=byId("systemBanner");if(!banner)return;
  if(S.platform.maintenance_mode||S.platform.bidding_enabled===false||S.platform.launch_mode!=="live"){
    banner.textContent=S.platform.maintenance_message||("Auctioneer "+(S.platform.launch_mode||"preview")+" mode — real-money bidding is not enabled yet.");
    banner.classList.remove("hidden");
  }else banner.classList.add("hidden");
}
function openSupport(){
  if(!S.user){openAuth("signin");return}
  byId("modal").className="modal";
  byId("modal").innerHTML='<div class="modalbox" style="max-width:560px"><div class="modalhead"><button class="close" onclick="closeModal()">×</button></div><div style="padding:0 22px 24px"><div class="eyebrow">Auctioneer Support</div><h2 style="font:700 28px Georgia">How can we help?</h2><select id="supportCategory" class="control"><option value="account">Account</option><option value="bidding">Bidding</option><option value="payment">Payment</option><option value="pickup">Pickup</option><option value="dispute">Dispute</option><option value="listing">Listing</option><option value="other">Other</option></select><input id="supportSubject" class="control" style="margin-top:8px" placeholder="Subject"><textarea id="supportMessage" class="control" style="margin-top:8px;min-height:120px" placeholder="Describe the problem"></textarea><button class="btn primary full" style="margin-top:10px" onclick="submitSupportTicket()">Send to support</button></div></div>';
}
async function submitSupportTicket(){
  const {error}=await db.from("support_tickets").insert({user_id:S.user.id,category:byId("supportCategory").value,subject:byId("supportSubject").value,message:byId("supportMessage").value});
  if(error){toast(error.message);return}
  toast("Support request sent");closeModal();
}
function openPrivacyCenter(){
  if(!S.user){openAuth("signin");return}
  byId("modal").className="modal";
  byId("modal").innerHTML='<div class="modalbox" style="max-width:560px"><div class="modalhead"><button class="close" onclick="closeModal()">×</button></div><div style="padding:0 22px 24px"><div class="eyebrow">Privacy center</div><h2 style="font:700 28px Georgia">Your data</h2><p class="muted">Control approximate location personalization and manage your account data.</p><div class="notice"><b>Nearby ranking</b><div class="muted" style="margin:5px 0 8px">Use country/city-level location to prioritize nearby lots.</div><div style="display:flex;gap:7px"><button class="btn sm" onclick="setGeoConsent(false);toast(\'Near me turned off\')">Turn off</button><button class="btn primary sm" onclick="setGeoConsent(true);toast(\'Near me turned on\')">Turn on</button></div></div><button class="btn full" style="margin-top:10px" onclick="downloadMyData()">Download my data now</button><select id="privacyType" class="control" style="margin-top:8px"><option value="correct">Correct my data</option><option value="delete">Delete my account/data</option></select><textarea id="privacyDetails" class="control" style="margin-top:8px;min-height:90px" placeholder="Optional details"></textarea><button class="btn primary full" style="margin-top:10px" onclick="submitPrivacyRequest()">Submit request</button></div></div>';
}

async function downloadMyData(){
  const {data,error}=await db.rpc("export_my_data");
  if(error){toast(error.message);return}
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="auctioneer-my-data.json";
  a.click();
  URL.revokeObjectURL(a.href);
}
async function startPayment(orderId){
  if(!S.platform?.payments_enabled){toast("Payments are not enabled yet");return}
  const {data,error}=await db.functions.invoke("payments-create",{body:{order_id:orderId}});
  if(error||data?.error){toast(data?.error||error?.message||"Payment could not start");return}
  toast("Payment session created");
  console.log("Payment intent",data);
}

async function submitPrivacyRequest(){
  const {error}=await db.from("privacy_requests").insert({user_id:S.user.id,request_type:byId("privacyType").value,details:byId("privacyDetails").value||null});
  if(error){toast(error.message);return}
  toast("Privacy request submitted");closeModal();
}


async function startStripeOnboarding(houseId){
  if(!S.user){openAuth("signin");return}
  const {data,error}=await db.functions.invoke("connect-onboarding",{body:{auction_house_id:houseId}});
  if(error||!data?.url){toast(data?.detail||data?.error||error?.message||"Stripe onboarding unavailable");return}
  location.href=data.url;
}
async function syncStripeStatus(houseId,quiet=false){
  if(!S.user)return null;
  const {data,error}=await db.functions.invoke("connect-status",{body:{auction_house_id:houseId}});
  if(error){if(!quiet)toast(error.message);return null}
  if(!quiet)toast(data?.status==="verified"?"Stripe verification complete":"Stripe verification still needs information");
  return data;
}
async function startCheckout(orderId){
  if(!S.user){openAuth("signin");return}
  const {data,error}=await db.functions.invoke("payments-create",{body:{order_id:orderId}});
  if(error||!data?.checkout_url){
    toast(data?.error||data?.detail||error?.message||"Checkout unavailable");
    return
  }
  location.href=data.checkout_url;
}

async function renderSeller(){
  const box=byId("sellerConsole");if(!box)return;
  if(!S.user){
    box.innerHTML='<div class="empty"><b>Sign in to sell</b>Create a business or auction-house account to start onboarding.<br><button class="btn primary" style="margin-top:12px" onclick="openAuth(\'signup\')">Create account</button></div>';
    return;
  }
  const {data:houses,error}=await db.from("auction_houses").select("*").eq("owner_id",S.user.id).order("created_at",{ascending:true});
  if(error){box.innerHTML='<div class="empty"><b>Could not load seller account</b>'+esc(error.message)+'</div>';return}
  if(!houses?.length){
    box.innerHTML='<div class="sellerOnboard panel"><div class="eyebrow">Business onboarding</div><h2 style="font:700 28px Georgia;margin:6px 0">Create your auction house</h2><p class="muted">Business verification and payout activation are completed through the payment/KYB provider before real settlement.</p><div class="sellerForm"><input id="sellerName" class="control" placeholder="Public auction house name"><input id="sellerLegal" class="control" placeholder="Legal company name"><input id="sellerLocation" class="control" placeholder="City, country"><input id="sellerCountry" class="control" maxlength="2" placeholder="Country code, e.g. LT"><input id="sellerReg" class="control" placeholder="Company registration number"><input id="sellerVat" class="control" placeholder="VAT number (optional)"></div><button class="btn primary" style="margin-top:10px" onclick="createSellerHouse()">Start onboarding</button></div>';
    return;
  }
  const h=houses[0];
  const {data:aucs}=await db.from("auctions").select("*").eq("house_id",h.id).order("created_at",{ascending:false});
  box.innerHTML='<div class="sellerHeader panel"><div><div class="eyebrow">Seller account</div><h2 style="font:700 28px Georgia;margin:5px 0">'+esc(h.name)+'</h2><div class="row"><span class="status '+(h.verification_status==="verified"?"green":"yellow")+'">'+esc(h.verification_status.toUpperCase())+'</span><span>'+esc(h.location||"")+'</span></div><div class="muted" style="margin-top:7px">'+(h.payouts_enabled?'Stripe transfers active':'Stripe/KYB verification required before payouts')+'</div></div><div style="display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end">'+(h.payouts_enabled?'<button class="btn" onclick="syncStripeStatus(\''+h.id+'\')">Refresh Stripe status</button>':'<button class="btn" onclick="startStripeOnboarding(\''+h.id+'\')">Complete Stripe verification</button>')+'<button class="btn primary" onclick="openCreateAuction(\''+h.id+'\')">+ Create auction</button></div></div>'+
    '<div class="section"><div class="sectionhead"><div><div class="eyebrow">Your inventory</div><h2>Auctions</h2></div></div><div class="auctions">'+((aucs||[]).length?(aucs||[]).map(a=>'<article class="auction"><div class="auctionbody"><div class="eyebrow">'+esc(a.publication_status||"draft")+'</div><h3 style="font:700 20px Georgia;margin:5px 0">'+esc(a.title)+'</h3><div class="muted">'+new Date(a.ends_at).toLocaleString()+' · buyer premium '+Number(a.buyer_premium||0)+'%</div><div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap"><button class="btn sm" onclick="manageSellerAuction(\''+a.id+'\')">Manage</button><button class="btn sm" onclick="openCreateLot(\''+a.id+'\')">+ Add lot</button><button class="btn sm" onclick="focusAuction(\''+a.id+'\')">Preview</button></div></div></article>').join(""):'<div class="empty" style="grid-column:1/-1"><b>No auctions yet</b>Create your first timed auction.</div>')+'</div></div>';
}

async function manageSellerAuction(auctionId){
  const {data:a,error:ae}=await db.from("auctions").select("*").eq("id",auctionId).single();
  const {data:lots,error:le}=await db.from("lots").select("*").eq("auction_id",auctionId).order("lot_number");
  if(ae||le){toast((ae||le).message);return}
  byId("modal").className="modal";
  byId("modal").innerHTML='<div class="modalbox"><div class="modalhead"><button class="close" onclick="closeModal()">×</button></div><div style="padding:0 20px 24px"><div class="eyebrow">Seller catalog</div><div class="sectionhead" style="margin-bottom:12px"><div><h2 style="font:700 28px Georgia;margin:4px 0">'+esc(a.title)+'</h2><p>'+esc(a.publication_status||"draft")+' · ends '+new Date(a.ends_at).toLocaleString()+'</p></div><button class="btn primary" onclick="publishSellerAuction(\''+a.id+'\')">Publish auction</button></div><div class="sellerLotList">'+((lots||[]).length?(lots||[]).map(l=>'<div class="sellerLotRow"><img src="'+esc((l.image_urls||[])[0]||a.cover_url||"")+'"><div><div class="eyebrow">Lot #'+l.lot_number+' · '+esc(l.catalog_status)+'</div><b>'+esc(l.title)+'</b><div class="muted">'+esc(l.qa_status)+' QA · '+(l.image_urls||[]).length+' photos · '+fmt(l.current_bid)+'</div></div><div class="sellerLotActions"><label class="btn sm">+ Photo<input type="file" accept="image/*" hidden onchange="uploadSellerLotPhoto(\''+l.id+'\',this.files,\''+a.id+'\')"></label>'+(l.qa_status==="YELLOW"&&!l.qa_seller_confirmed?'<button class="btn sm" onclick="confirmSellerLotQa(\''+l.id+'\',\''+a.id+'\')">Confirm QA</button>':'')+'<button class="btn sm" onclick="publishSellerLot(\''+l.id+'\',\''+a.id+'\')">Publish</button></div></div>').join(""):'<div class="empty"><b>No lots</b>Add a lot to this auction.</div>')+'</div><button class="btn" style="margin-top:12px" onclick="openCreateLot(\''+a.id+'\')">+ Add another lot</button></div></div>';
}
async function uploadSellerLotPhoto(lotId,files,auctionId){
  if(!files?.length)return;
  for(const file of [...files]){
    const path=S.user.id+"/"+lotId+"/"+crypto.randomUUID()+"-"+file.name.replace(/[^a-zA-Z0-9._-]+/g,"-");
    const {error}=await db.storage.from("lot-images").upload(path,file,{upsert:false});
    if(error){toast(error.message);continue}
    const {data:url}=db.storage.from("lot-images").getPublicUrl(path);
    const {data:lot}=await db.from("lots").select("image_urls").eq("id",lotId).single();
    const urls=[...(lot?.image_urls||[]),url.publicUrl];
    const {error:ue}=await db.from("lots").update({image_urls:urls}).eq("id",lotId);
    if(ue){toast(ue.message);return}
  }
  toast("Photo added");await loadPublic();manageSellerAuction(auctionId);
}
async function confirmSellerLotQa(lotId,auctionId){
  const {error}=await db.rpc("confirm_lot_qa",{p_lot_id:lotId,p_notes:"Seller confirmed visible lot data before publication"});
  if(error){toast(error.message);return}
  toast("QA confirmed");await loadPublic();manageSellerAuction(auctionId);
}
async function publishSellerLot(lotId,auctionId){
  const {error}=await db.rpc("publish_lot",{p_lot_id:lotId});
  if(error){toast(error.message.replace("QA_CONFIRMATION_REQUIRED","Confirm YELLOW QA before publishing").replace("PHOTO_REQUIRED","Add at least one photo before publishing"));return}
  toast("Lot published");await loadPublic();manageSellerAuction(auctionId);
}
async function publishSellerAuction(auctionId){
  const {error}=await db.rpc("publish_auction",{p_auction_id:auctionId});
  if(error){toast(error.message.replace("SELLER_VERIFICATION_REQUIRED","Auction house verification is required before publishing"));return}
  toast("Auction published");closeModal();await loadPublic();renderSeller();renderAuctions();
}

async function createSellerHouse(){
  const args={
    p_name:byId("sellerName").value,
    p_legal_name:byId("sellerLegal").value,
    p_location:byId("sellerLocation").value,
    p_country_code:byId("sellerCountry").value,
    p_registration_number:byId("sellerReg").value||null,
    p_vat_number:byId("sellerVat").value||null
  };
  const {error}=await db.rpc("create_auction_house",args);
  if(error){toast(error.message);return}
  await loadPrivate();toast("Seller onboarding started");renderSeller();
}
function openCreateAuction(houseId){
  byId("modal").className="modal";
  byId("modal").innerHTML='<div class="modalbox" style="max-width:560px"><div class="modalhead"><button class="close" onclick="closeModal()">×</button></div><div style="padding:0 22px 24px"><div class="eyebrow">New auction</div><h2 style="font:700 28px Georgia">Create timed auction</h2><input id="newAuctionTitle" class="control" placeholder="Auction title"><input id="newAuctionEnd" class="control" style="margin-top:8px" type="datetime-local"><input id="newAuctionLocation" class="control" style="margin-top:8px" placeholder="Pickup location"><input id="newAuctionPremium" class="control" style="margin-top:8px" type="number" value="12" min="0" max="50" placeholder="Buyer premium %"><textarea id="newAuctionPickup" class="control" style="margin-top:8px;min-height:90px" placeholder="Pickup instructions"></textarea><button class="btn primary full" style="margin-top:10px" onclick="createSellerAuction(\''+houseId+'\')">Create draft auction</button></div></div>';
}
async function createSellerAuction(houseId){
  const raw=byId("newAuctionEnd").value;if(!raw){toast("Choose an end time");return}
  const {error}=await db.rpc("create_auction",{p_house_id:houseId,p_title:byId("newAuctionTitle").value,p_ends_at:new Date(raw).toISOString(),p_location:byId("newAuctionLocation").value,p_buyer_premium:Number(byId("newAuctionPremium").value||12),p_pickup_info:byId("newAuctionPickup").value||null});
  if(error){toast(error.message);return}
  closeModal();toast("Draft auction created");renderSeller();
}
function openCreateLot(auctionId){
  byId("modal").className="modal";
  byId("modal").innerHTML='<div class="modalbox" style="max-width:560px"><div class="modalhead"><button class="close" onclick="closeModal()">×</button></div><div style="padding:0 22px 24px"><div class="eyebrow">New lot</div><h2 style="font:700 28px Georgia">Create catalog lot</h2><input id="newLotTitle" class="control" placeholder="Lot title"><div class="frow" style="margin-top:8px"><input id="newLotBrand" class="control" placeholder="Brand"><input id="newLotModel" class="control" placeholder="Model"></div><div class="frow" style="margin-top:8px"><input id="newLotCategory" class="control" placeholder="Category"><select id="newLotCondition" class="control"><option>Good</option><option>Excellent</option><option>Used</option><option>For parts</option></select></div><input id="newLotStart" class="control" style="margin-top:8px" type="number" min="0" value="10" placeholder="Starting bid"><textarea id="newLotDescription" class="control" style="margin-top:8px;min-height:90px" placeholder="Description"></textarea><button class="btn primary full" style="margin-top:10px" onclick="createSellerLot(\''+auctionId+'\')">Create lot for review</button></div></div>';
}
async function createSellerLot(auctionId){
  const {data,error}=await db.rpc("create_lot",{p_auction_id:auctionId,p_title:byId("newLotTitle").value,p_category:byId("newLotCategory").value,p_condition:byId("newLotCondition").value,p_starting_bid:Number(byId("newLotStart").value||0),p_brand:byId("newLotBrand").value||null,p_model:byId("newLotModel").value||null,p_description:byId("newLotDescription").value||null});
  if(error){toast(error.message);return}
  closeModal();toast("Lot created — add photos and complete QA before publishing");await loadPublic();renderSeller();
}

async function renderOrders(){
  const box=byId("ordersList");if(!box)return;
  if(!S.user){box.innerHTML='<div class="empty"><b>Sign in required</b>Your won lots and transactions will appear here.</div>';return}
  const {data,error}=await db.from("orders").select("*").order("created_at",{ascending:false});
  if(error){box.innerHTML='<div class="empty"><b>Could not load orders</b>'+esc(error.message)+'</div>';return}
  box.innerHTML=(data||[]).length?(data||[]).map(o=>{
    const l=S.lots.find(x=>x.id===o.lot_id);
    return '<div class="orderCard"><div><div class="eyebrow">'+esc(o.status)+'</div><h3>'+esc(l?.title||"Auction purchase")+'</h3><div class="muted">'+fmt(o.hammer_price)+' hammer · '+fmt(o.protection_fee)+' protection</div></div><div class="orderAmount"><small>Total</small><b>'+fmt(o.total_amount)+'</b></div><div class="orderActions">'+(o.status==="awaiting_payment"?'<button class="btn primary sm" onclick="startPayment(\''+o.id+'\')">Pay now</button>':'')+((o.status==="paid"||o.status==="awaiting_pickup")?'<button class="btn sm" onclick="issuePickupCode(\''+o.id+'\')">Pickup code</button>':'')+((["paid","awaiting_pickup","collected"].includes(o.status))?'<button class="btn sm" onclick="openDispute(\''+o.id+'\')">Report issue</button>':'')+'</div></div>';
  }).join(""):'<div class="empty"><b>No orders yet</b>Won lots will appear here after an auction closes.</div>';
}
async function issuePickupCode(orderId){
  const {data,error}=await db.rpc("issue_handover_code",{p_order_id:orderId});
  if(error){toast(error.message);return}
  byId("modal").className="modal";
  byId("modal").innerHTML='<div class="modalbox" style="max-width:440px"><div class="modalhead"><button class="close" onclick="closeModal()">×</button></div><div style="padding:0 22px 28px;text-align:center"><div class="eyebrow">Secure handover</div><h2 style="font:700 30px Georgia">Pickup code</h2><div class="pickupCode">'+esc(data)+'</div><p class="muted">Give this code to the seller only when the item is physically handed over.</p></div></div>';
}
function openDispute(orderId){
  byId("modal").className="modal";
  byId("modal").innerHTML='<div class="modalbox" style="max-width:540px"><div class="modalhead"><button class="close" onclick="closeModal()">×</button></div><div style="padding:0 22px 24px"><div class="eyebrow">Buyer Protection</div><h2 style="font:700 28px Georgia">Report a transaction issue</h2><select id="disputeReason" class="control"><option value="not_received">Item not received</option><option value="materially_not_as_described">Materially not as described</option><option value="wrong_item">Wrong item</option><option value="damaged_in_handover">Damaged during handover</option><option value="other">Other</option></select><textarea id="disputeText" class="control" style="margin-top:8px;min-height:110px" placeholder="Describe the issue and available evidence"></textarea><button class="btn primary full" style="margin-top:10px" onclick="submitDispute(\''+orderId+'\')">Submit dispute</button></div></div>';
}
async function submitDispute(orderId){
  const {error}=await db.rpc("open_dispute",{p_order_id:orderId,p_reason:byId("disputeReason").value,p_description:byId("disputeText").value||null});
  if(error){toast(error.message);return}
  toast("Dispute opened");closeModal();renderOrders();
}
async function renderNotifications(){
  const box=byId("notificationsList");if(!box)return;
  if(!S.user){box.innerHTML='<div class="empty"><b>Sign in required</b></div>';return}
  const {data,error}=await db.from("notifications").select("*").order("created_at",{ascending:false}).limit(100);
  if(error){box.innerHTML='<div class="empty"><b>Could not load notifications</b></div>';return}
  box.innerHTML=(data||[]).length?(data||[]).map(n=>'<button class="notificationCard '+(n.status==="read"?"":"unread")+'" onclick="markNotificationRead(\''+n.id+'\')"><b>'+esc(n.title)+'</b><span>'+esc(n.body)+'</span><small>'+new Date(n.created_at).toLocaleString()+'</small></button>').join(""):'<div class="empty"><b>No notifications</b></div>';
}
async function markNotificationRead(id){
  await db.from("notifications").update({status:"read"}).eq("id",id);
  renderNotifications();
}
async function renderAdmin(){
  const box=byId("adminDashboard");if(!box)return;
  const [dash,gate]=await Promise.all([db.rpc("admin_dashboard"),db.rpc("launch_readiness")]);
  if(dash.error||!dash.data){box.innerHTML='<div class="empty"><b>Admin access required</b>This control room is restricted.</div>';return}
  const d=dash.data,g=gate.data||{};
  const metrics=[["Users",d.users],["Active auctions",d.active_auctions],["Open lots",d.open_lots],["GMV",fmt(d.gmv)],["Protection revenue",fmt(d.platform_revenue)],["Awaiting payment",d.awaiting_payment],["Open disputes",d.open_disputes],["Moderation",d.moderation_open],["Queued notifications",d.queued_notifications]];
  const blockers=(g.blockers||[]).map(x=>'<li>'+esc(x)+'</li>').join("");
  const warnings=(g.warnings||[]).map(x=>'<li>'+esc(x)+'</li>').join("");
  box.innerHTML='<div class="launchGate '+(g.ready_for_real_money_live?'ready':'blocked')+'"><div><div class="eyebrow">Launch Gate</div><h2>'+(g.ready_for_real_money_live?'Ready for real-money live':'Real-money launch blocked')+'</h2><p>Mode: '+esc(g.launch_mode||"preview")+'</p></div><div class="gateCols"><div><b>Blockers</b><ul>'+(blockers||'<li>None</li>')+'</ul></div><div><b>Warnings</b><ul>'+(warnings||'<li>None</li>')+'</ul></div></div></div><div class="ops">'+metrics.map(x=>'<div class="kpi"><small>'+x[0]+'</small><b>'+x[1]+'</b></div>').join("")+'</div>';
}

async function openLegal(slug){
  const {data}=await db.from("legal_documents").select("title,body_markdown,version,status,created_at").eq("slug",slug).eq("status","active").order("created_at",{ascending:false}).limit(1);
  if(!data?.length){toast("This document is pending final legal review");return}
  const d=data[0];
  byId("modal").className="modal";
  byId("modal").innerHTML='<div class="modalbox" style="max-width:760px"><div class="modalhead"><button class="close" onclick="closeModal()">×</button></div><article class="legalDoc"><div class="eyebrow">Version '+esc(d.version)+'</div><h2>'+esc(d.title)+'</h2><p>'+esc(d.body_markdown).replace(/\n/g,"</p><p>")+'</p></article></div>';
}
async function handleDeepLink(){
  const u=new URL(location.href);
  const lot=u.searchParams.get("lot"),auc=u.searchParams.get("auction");
  const sellerAction=u.searchParams.get("seller"),houseId=u.searchParams.get("house");
  const payment=u.searchParams.get("payment");
  if(sellerAction==="connect-refresh"&&houseId){
    await startStripeOnboarding(houseId);return
  }
  if(sellerAction==="connect-return"&&houseId){
    await syncStripeStatus(houseId,true);
    await loadPrivate();
    showView("seller");
    await renderSeller();
    toast("Stripe status refreshed");
    return
  }
  if(payment==="success"){
    showView("orders");await renderOrders();toast("Payment submitted — waiting for Stripe confirmation");return
  }
  if(payment==="cancelled"){
    showView("orders");await renderOrders();toast("Payment was cancelled");return
  }
  if(auc&&auction(auc)){renderAuctionDetail(auc);showView("auctionDetail")}
  if(lot&&S.lots.some(x=>x.id===lot))await openItem(lot);
}

function renderAll(){renderCats();renderBrands();renderMarket();renderAuctions();renderWatch();renderBids();renderOps();renderOpsTable();renderLangMenu();renderAccount();renderVisuals();byId("watchCount").textContent=S.watch.size;byId("bidCount").textContent=S.myBids.size}

window.S=S;window.setGeoConsent=setGeoConsent;window.startStripeOnboarding=startStripeOnboarding;window.syncStripeStatus=syncStripeStatus;window.startCheckout=startCheckout;window.downloadMyData=downloadMyData;window.startPayment=startPayment;window.manageSellerAuction=manageSellerAuction;window.uploadSellerLotPhoto=uploadSellerLotPhoto;window.confirmSellerLotQa=confirmSellerLotQa;window.publishSellerLot=publishSellerLot;window.publishSellerAuction=publishSellerAuction;window.openReportLot=openReportLot;window.submitLotReport=submitLotReport;window.openSupport=openSupport;window.submitSupportTicket=submitSupportTicket;window.openPrivacyCenter=openPrivacyCenter;window.submitPrivacyRequest=submitPrivacyRequest;window.renderSeller=renderSeller;window.createSellerHouse=createSellerHouse;window.openCreateAuction=openCreateAuction;window.createSellerAuction=createSellerAuction;window.openCreateLot=openCreateLot;window.createSellerLot=createSellerLot;window.renderOrders=renderOrders;window.renderNotifications=renderNotifications;window.renderAdmin=renderAdmin;window.openLegal=openLegal;window.issuePickupCode=issuePickupCode;window.openDispute=openDispute;window.submitDispute=submitDispute;window.markNotificationRead=markNotificationRead;window.confirmAuctionRegistration=confirmAuctionRegistration;window.updateFeeQuote=updateFeeQuote;window.refreshRankedFeed=refreshRankedFeed;window.setNearRadius=setNearRadius;window.showView=showView;window.renderAuctionDetail=renderAuctionDetail;window.openItem=openItem;window.toggleWatch=toggleWatch;window.registerAuction=registerAuction;window.placeBid=placeBid;window.openAuth=openAuth;window.openAccount=openAccount;window.doSignUp=doSignUp;window.doSignIn=doSignIn;window.doLogout=doLogout;window.closeModal=closeModal;window.setLang=setLang;window.toggleLangMenu=toggleLangMenu;window.searchInput=searchInput;window.showSearchSuggestions=showSearchSuggestions;window.chooseSearch=chooseSearch;window.setDensity=setDensity;window.openFilterSheet=openFilterSheet;window.applyMobileFilters=applyMobileFilters;window.saveSearch=saveSearch;window.handleFiles=handleFiles;window.downloadAllCsv=downloadAllCsv;window.focusAuction=focusAuction;

(async()=>{
  await Promise.all([loadPublic(),initAuth(),syncServerTime(),loadPlatformSettings()]);
  renderAll();subscribeRealtime();await detectLang();await handleDeepLink();
  document.addEventListener("click",e=>{if(!e.target.closest(".langwrap"))toggleLangMenu(false);if(!e.target.closest(".searchWrap"))byId("suggestions").classList.add("hidden")});window.addEventListener("error",e=>reportClientError(e.message,e.filename,e.lineno,e.colno,e.error?.stack));window.addEventListener("unhandledrejection",e=>reportClientError("Unhandled promise rejection",null,null,null,e.reason?.stack||String(e.reason)));window.addEventListener("popstate",()=>handleDeepLink());setInterval(syncServerTime,60000);
})();
