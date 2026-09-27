# Auctioneer VIP

Papildomas `/vip` modulis esamai `auctioneer.it.com` svetainei. Esamoje `auctioneer-site` šakoje pridedamas tik naujas `auctioneer/vip` aplankas su vieša sąsaja. Ankstesni svetainės failai, meniu ir pagrindinis puslapis nekeičiami. Duomenis ir slaptažodį tikrina atskiras Render Node serveris `https://auctioneer-vip.onrender.com`, diegiamas iš `auctioneer-vip` šakos. Galutinė patikra atliekama po abiejų diegimų.

Privatus pristatymo archyvas turi vietinio paleidimo konfigūraciją su slaptažodžio maiša ir duomenų iššifravimo raktu. Archyvo, jo konfigūracijos ir `private` katalogo negalima pateikti per statinių failų serverį. `.gitignore` neleidžia konfigūracijai patekti į Git. Pati slaptažodžio tekstinė reikšmė archyve nesaugoma.

## Paruoštos funkcijos

- Prisijungimas vartotojo vardu ir slaptažodžiu, serverio patikra, scrypt slaptažodžio maiša.
- Produkcijos sąsajoje sesijos prieigos žetonas laikomas tik naršyklės atmintyje, perduodamas Authorization antrašte. Atnaujinus puslapį reikia prisijungti iš naujo. 30 min. neveiklumo ir 8 val. maksimali sesijos trukmė. Slapukų režimas paliktas vietiniam arba same-origin naudojimui.
- Apriboti neteisingo prisijungimo bandymai, Origin ir CSRF patikra.
- Dvi atskiros paieškos: 4 500 paslaugų teikėjų ir 1 504 darbdaviai su 4 393 susietais darbo skelbimais. Duomenys perduodami tik prisijungus; viešuose JavaScript failuose jų nėra.
- Paslaugų paieška visuose 19 laukų, 89 tikros veiklos sritys ir 56 vietovės; visa Lietuva arba šaltinyje nurodyta aptarnavimo zona. Datos ir tuščios reikšmės kategorijose nerodomos.
- Darbdavių paieška visuose 17 laukų, 9 darbo sritys, 99 suvienodintos teritorijos, darbdavio tipas, kontaktų būsena ir darbo portalas. Detaliame įraše rodomi visi susieti skelbimai bei kontaktų šaltiniai.
- Abiejų paieškų teritorijų sąrašuose rodomos tik kitus aktyvius filtrus atitinkančios vietovės. Jei pasirinkta vietovė tampa neaktuali, ji išvaloma ir rezultatai atnaujinami.
- Kainos vienetas, ribos, kontaktų ir kainos buvimas; papildomi filtrai kiekvienam iš 19 laukų su IR / ARBA.
- Paslaugoms 8 rūšiavimo būdai, pagal nutylėjimą didėjanti kaina, įrašai be reikšmės gale. Darbdaviams 5 būdai, pagal nutylėjimą mažėjantis skelbimų skaičius. 25 / 50 / 100 rezultatų puslapyje.
- Rezultatų lentelė, mobilios kortelės, visos originalios informacijos langas, telefonas, el. paštas ir šaltinių nuorodos.
- Cyberpunk prisijungimo iliustracija, dideli blyksintys neono vamzdeliai ir judančios fono detalės, efektų išjungimas ir reduced-motion palaikymas.
- Vartotojo pasirinkta „Under Your Spell — Desire (Drive)“ per oficialų YouTube įterpimą; kartojimas, atkūrimas abiejuose ekranuose.
- Viešos sąsajos `noindex`, `nofollow`, `noarchive` ir griežta CSP. Privatūs API atsakymai naudoja `no-store`; leidžiama tik tiksli `https://auctioneer.it.com` kilmė, CORS be wildcard ar Allow-Credentials.

## Duomenų pastabos

- 1 024 įrašai neturi skaitinės kainos, 373 neturi telefono, 4 335 neturi el. pašto.
- Iš 321 pradinės kategorijos reikšmės 232 buvo datos. Jos pašalintos iš kategorijų rodymo, išsaugant visus 4 500 įrašų; liko 89 veiklos sritys.
- Darbdavių rinkinyje 1 269 įmonės turi telefoną, 404 — el. paštą. Atlyginimų duomenų nėra, todėl kainų filtrai šioje paieškoje nerodomi. Datos ir tikrinimo laiko žymos sąsajoje nerodomos. Skelbimų aktyvumas nepriklausomai nepatvirtintas.
- `is_business` visur 0; teisinė forma iš šio lauko nenustatoma.
- Įkainiai €/val., €/m², €/m³ ir € nelygiaverčiai; rodoma palyginimo pastaba, pateiktas vieneto filtras.
- Teritorijos spindulys perimamas iš failo. Atstumai ir teikėjo pasiekiamumas kituose miestuose nespėjami.
- Duomenys nepapildomi spėjimais. Neleistinos kategorijų reikšmės ir laiko žymos sąsajoje slepiamos, originalus importas išsaugomas užšifruotame faile.

## Paleidimas

Reikia Node.js 22 ar naujesnio. Trečiųjų šalių serverio paketų nėra.

1. Įkelkite modulį už viešai aptarnaujamo katalogo ribų.
2. Serverio aplinkoje nustatykite `.env.example` nurodytus kintamuosius. Tikrieji prisijungimo ir duomenų raktai niekada neturi patekti į viešą Git saugyklą, frontend paketą ar dokumento HTML.
3. Paleiskite `npm start` arba importuokite `createVipHandler` į esamą Node serverį.
4. Produkcijoje privalomi `NODE_ENV=production` ir `VIP_PUBLIC_ORIGIN=https://auctioneer.it.com`.

`private/catalog.enc` yra užšifruotas AES-256-GCM. Dabartinis VIP2 formatas prieš šifravimą suspaudžia JSON su gzip; serveris taip pat perskaito ankstesnį VIP1 formatą. Jam reikalingas atskirai saugomas `VIP_DATA_KEY`. Tinkamo rakto nebuvimas sustabdo paleidimą, o ne įjungia viešą režimą.

Konfigūracijos kūrimo skriptas `scripts/configure.mjs` priima JSON per stdin: `username`, `password`, `recordsPath`, `origin`. Jis sukuria naują duomenų raktą, užšifruotą katalogą ir vietinį konfigūracijos failą. Jis niekada neišveda slaptažodžio ar rakto. Pakartotinis vykdymas pakeičia duomenų raktą, todėl prie jau įdiegtos versijos jo neleiskite be suplanuoto raktų atnaujinimo.

Darbdavių importui naudokite `node --env-file=.env.local scripts/import-b2b.mjs <privataus-json-kelias>`. JSON turi `companies`, `jobs` ir `contactSources` masyvus. Skriptas patikrina unikalius ID ir susiejimus, išsaugo esamus paslaugų teikėjus bei tą patį duomenų raktą, o katalogą peršifruoja su nauju IV. Nei pradinis JSON, nei XLSX neturi patekti į viešą Git ar statinį katalogą.

## Integracija, išsaugant seną svetainę

Į statinės svetainės `auctioneer/vip/` katalogą kopijuojami tik vieši failai iš `public/`: index.html, app.js, styles.css, atmosphere.css, music.js, counter.js, favicon.svg, login-art.png, workspace-city.webp ir workspace-portrait.webp. Nei užšifruotas katalogas, nei serverio kodas, konfigūracija, slaptažodžio maiša ar duomenų raktas čia nepatenka. Nuoroda nepridedama į pagrindinį meniu ar sitemap.

Statinė sąsaja kreipiasi į `https://auctioneer-vip.onrender.com/vip/api/` su `credentials: omit`. Prisijungimas su `X-VIP-Client: static` grąžina atsitiktinį prieigos žetoną tik po sėkmingos serverio patikros; kiekviena duomenų užklausa jį siunčia kaip `Authorization: Bearer …`. Žetonas nesaugomas localStorage, sessionStorage, URL ar diske. Prisijungimą reikia pakartoti atnaujinus puslapį. POST užklausoms papildomai tikrinami Origin ir CSRF. Kitų svetainių kilmės ir neleistinos preflight antraštės atmetamos.

Atskiras serveris yra Render paslauga `srv-dasnvkojo6nc73cks2b0`, originali statinė svetainė — `srv-darnfinpn0mc73d9h8og`. Abu ištekliai priklauso patvirtintai darbo sričiai `tea-daqolg6gekts739eno7g`. Naudojamas vienas nemokamo plano serveris; po neveiklumo pirmas prisijungimas gali užtrukti, perkrovimas panaikina aktyvias sesijas. `/healthz` skirtas tik serverio būklei.

Šios paslaugos Git saugyklą klonuoja kaip viešą URL be Git tiekėjo prieigos. Nors API rodo autoDeploy=yes, patvirtinta, kad automatinis naujo commit diegimas nevyksta; po pakeitimų būtinas vienas Deploy latest commit, nekeičiant plano ar raktų.

`VIP_TRUSTED_IP_HEADER` nenustatytas: keli lankytojai per tą patį Render tarpinį serverį gali dalytis bandymų limitu. Pirmas nepatikrintas X-Forwarded-For adresas nelaikomas patikimu lankytojo adresu.

Pats `/vip` kelias nėra apsauga: kiekvieną duomenų užklausą autorizuoja serveris.

## Muzika ir efektai

Naudojamas tik vartotojo nurodytas vaizdo įrašas: https://www.youtube.com/watch?v=WflAReA2cqs . Garso failas nekopijuojamas. Grotuvas matomas ir valdomas, o uždarymas sustabdo atkūrimą. Prisijungimas vyksta neperkraunant puslapio, todėl grotuvas lieka tas pats.

Oficiali YouTube IFrame API bando automatiškai įjungti garsą ir paleisti dainą įėjus. Jei naršyklė blokuoja garsą, po pirmo paspaudimo ar klavišo paleidimas automatiškai kartojamas. Sąmoningas sustabdymas gerbiamas. Taip pat yra paleidimo mygtukas ir matomi YouTube valdikliai. Galimybė įterpti ar atkurti šį vaizdo įrašą priklauso ir nuo YouTube, regiono, paskyros bei tinklo. Nėra pažado, kad garsas visose naršyklėse gros be paspaudimo.

Neono vamzdeliai yra 24 px storio ir 65 vh aukščio (telefone 12 px ir 50 vh). Šviesa sklandžiai įsižiebia ir užgęsta nenutrūkstamame cikle. Ir prisijungimo ekrane, ir vidinėje paieškoje rodoma lėtai judanti ir persiliejanti dviejų cyberpunk nuotraukų kompozicija, papildyta lietaus, dalelių ir šviesos judesiu. Animacijos nepaleidžiamos iš naujo pereinant iš prisijungimo į paiešką. Miesto pastatų šviesos turi atskirus 13, 17, 19 ir 23 sekundžių žalių bei violetinių atspalvių švytėjimo ciklus, kurie juda kartu su nuotraukomis. Išjungus efektus arba įjungus reduced-motion lieka statiška miesto nuotrauka. Animacijos nestroboskopinės. Efektų pasirinkimas išsaugomas tik vietiniame įrenginyje. Kontaktai, slaptažodis ir sesijos žetonai localStorage nesaugomi.

## Patikra

`npm test` tikrina autentifikaciją, prisijungimo ribojimą, sesijos pabaigą, CSRF, filtrus, visas laukų rūšis, teritorijas, skirtingus vienetus, trūkstamas reikšmes ir puslapiavimą. Papildoma HTTP ir naršyklės patikra atliekama prieš diegimą. Sesijos ir bandymų ribos šioje versijoje laikomos vieno serverio atmintyje: perkrovus reikia prisijungti iš naujo. Prieš diegiant kelias serverio kopijas sesijas ir ribojimą perkelti į bendrą saugyklą.

2026-09-27 vietinė patikra: 44 testai sėkmingi, įskaitant tikro užšifruoto abiejų rinkinių katalogo HTTP užklausas, dinamiškas teritorijas, darbdavių susiejimus ir muzikos valdymą. Patvirtinti originalių maršrutų perdavimas nepakeistam handleriui, 401 neprisijungus, 403 netinkamam Origin / CSRF, 404 privatiems failams ir sesijos panaikinimas atsijungus. Gyvo serverio patikra sėkminga: HTTPS prisijungimas, Secure / HttpOnly sesija, 4 500 įrašų, 19 laukų, Vilniaus teritorijos ir kainos rūšiavimas, CSRF, atsijungimas bei neprieinami privatūs failai. Pagrindinio puslapio HTML SHA-256 prieš ir po diegimo sutampa. Darbalaukio prisijungimo vaizdas patikrintas naršyklėje; YouTube rodo teisingą dainą ir valdiklius, bet nenutrūkstamas atkūrimas šiame naršyklės seanse nepatvirtintas. Mobili sąsaja pritaikyta, tačiau tikro mobiliojo įrenginio patikra dar neatlikta. Tikslus CORS kilmės tikrinimas, Bearer sesija, neteisingų žetonų atmetimas, sesijos pabaiga ir atsijungimas papildomai patikrinti testais. Galutinė domeno patikra atliekama paskelbus statinį `/vip` aplanką.

50 tolesnių patobulinimų aprašyti `50-patobulinimu.md`.

## Papildomi VIP sąsajos patobulinimai

- Originali cyberpunk personažė lieka prisijungimo ekrane; jos nuotraukos miesto šviesos, lietus ir šviesos pėdsakai juda kartu su nuotrauka.
- Aktyvių filtrų žymos leidžia pašalinti atskirą filtrą vienu paspaudimu. Paieškos tekstą galima išvalyti atskirai. Telefone yra grįžimo į rezultatų viršų veiksmas.
- Po animuotais prisijungimo skaitikliais atskirai pateikti tikrieji kiekiai. Atskaitos taškas 6 004 pagrindiniai importuoti įrašai, mažas logaritminis prieaugis nesaugomas ir nekeičia duomenų bazės ar paieškos kiekių.
- Dekoratyvinės kaukolės ir humoristinis užrašas neteigia apie tikrą neteisėtą veiklą.

## Automatinis naujų duomenų rinkimas

Atskiras `auctioneer-vip-crawler` Supabase Edge procesas naudoja tik naujas `vip_crawler_*` lenteles. Esamos aukcionų lentelės, funkcijos ir pagrindinės svetainės failai nekeičiami. RLS įjungta; anon ir authenticated neturi lentelių ar RPC teisių. Tik Node VIP serveris ir planuotojas turi atskirą rinkimo raktą. Naršyklė pasiekia būseną, paiešką ir paleidimą tik po įprastos VIP autorizacijos bei POST CSRF patikros.

Grafikas: `0 */6 * * *` UTC (00:00, 06:00, 12:00, 18:00). Supabase Cron kviečia Edge per pg_net, raktą paimdamas iš Vault. Tikrinama ir uždarius naršyklę. VIP panelėje yra „Tikrinti dabar“, būsena, šaltinių datos, klaidos, įmonių paieška, MB/UAB ir kitų tikrų teisinių formų bei vietovės filtrai. Rinkimo duomenys laikomi atskirai nuo pradinio importo, nekuriant fiktyvių kontaktų, kainų ar įmonių kodų.

- Registrų centro atviri juridinių asmenų duomenys: pirmą kartą iki 250 naujausių veikiančių įmonių, vėliau 50 naujausių ir iki 200 senesnių įrašų su išsaugomu puslapio žymekliu. Rodoma surinkta dalis, ne visas registras. Momentinė šaltinio kopija gali vėluoti.
- Užimtumo tarnybos atviri pasiūlymai: tik pažymėti aktyviais ir nepasibaigusio galiojimo. Nauja patikra neatjaunina seno šaltinio; šaltinio atnaujinimo data ir įspėjimas pateikiami atskirai.
- Patikrinti vieši įmonių karjeros API: Oxylabs (Lever) ir Hostinger (Ashby), pakaitomis kas patikrą, tik Lietuvos darbo vietos. Tai viešai paskelbti pasiūlymai; realus priėmimas nepriklausomai netvirtinamas. Nesant kodo ar kontakto jis nespėjamas.

Vieno proceso terminas 85 s, vieno šaltinio 20 s, iki 250 įmonių ir 250 skelbimų iš šaltinio. Bendras atominis užraktas saugo nuo persidengimo, rankiniams paleidimams taikoma minutės pauzė. Įrašai ir šaltinio žymeklis įrašomi viena transakcija; nesėkmė neištrina ankstesnių duomenų ir neperstumia žymeklio. Darbo skelbimai rodomi tik jeigu paskutinį kartą matyti per 48 valandas ir nėra pasibaigę.

Diegiant `crawler/edge.mjs` hash žyma pakeičiama atskiro rakto SHA-256 tik diegimo kopijoje. Pats raktas lieka Render aplinkoje ir Supabase Vault. `.env.example` aprašo naujus kintamuosius be reikšmių.

Viešas `/vip/api/totals` grąžina tik skaičius: importuotų ir surinktų įrašų sumą bei įrašus su telefonu arba el. paštu. Kontaktų skaičius nėra unikalių žmonių skaičius. Pradinė bazė 6 004 įrašai, iš jų 5 407 su kontaktu. Prisijungimo animacija atskirai padidina rodmenis, maždaug +78 / +56 per pirmą minutę, lėtėdama pagal logaritmą; reali bazė rodoma atskirai. Duomenų lentelių skaičiai visada tikri.

Šriftai „Manrope“ ir „Space Grotesk“ pateikiami iš `/vip/fonts/`, su lotynų ir išplėstinių lotynų rašmenų palaikymu; OFL licencijos išsaugotos šalia. Piktogramos vienodo SVG linijų stiliaus. Viso ekrano žaibai turi retus atskirus trumpus šviesos impulsus, netrukdo paspaudimams ir išsijungia su efektų valdikliu arba reduced-motion.

Gyvo paleidimo apribojimas: get.data.gov.lt grąžino aiškų „Web Page Blocked“ atsakymą Supabase serveriui. RC ir UZT šaltiniai pažymėti `blocked` ir automatiškai nebekviečiami. Atnaujinti jų būseną galima tik sutvarkius leidžiamą prieigą; draudimo apėjimas per kitus IP ar tarpininkus neįdiegtas. Karjeros šaltiniai veikia: pradiniame rinkime 2 įmonės ir 101 Lietuvos darbo skelbimas.
