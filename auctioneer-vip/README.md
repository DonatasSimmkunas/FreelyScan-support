# Auctioneer VIP

Papildomas `/vip` modulis esamai `auctioneer.it.com` svetainei. Esamoje `auctioneer-site` šakoje pridedamas tik naujas `auctioneer/vip` aplankas su vieša sąsaja. Ankstesni svetainės failai, meniu ir pagrindinis puslapis nekeičiami. Duomenis ir slaptažodį tikrina atskiras Render Node serveris `https://auctioneer-vip.onrender.com`, diegiamas iš `auctioneer-vip` šakos. Galutinė patikra atliekama po abiejų diegimų.

Privatus pristatymo archyvas turi vietinio paleidimo konfigūraciją su slaptažodžio maiša ir duomenų iššifravimo raktu. Archyvo, jo konfigūracijos ir `private` katalogo negalima pateikti per statinių failų serverį. `.gitignore` neleidžia konfigūracijai patekti į Git. Pati slaptažodžio tekstinė reikšmė archyve nesaugoma.

## Paruoštos funkcijos

- Prisijungimas vartotojo vardu ir slaptažodžiu, serverio patikra, scrypt slaptažodžio maiša.
- Produkcijos sąsajoje sesijos prieigos žetonas laikomas tik naršyklės atmintyje, perduodamas Authorization antrašte. Atnaujinus puslapį reikia prisijungti iš naujo. 30 min. neveiklumo ir 8 val. maksimali sesijos trukmė. Slapukų režimas paliktas vietiniam arba same-origin naudojimui.
- Apriboti neteisingo prisijungimo bandymai, Origin ir CSRF patikra.
- Visi 4 500 originalių įrašų ir 19 originalių laukų. Duomenys perduodami tik prisijungus; viešuose JavaScript failuose jų nėra.
- Paieška visuose laukuose, kategorija, 56 vietovės, visa Lietuva arba šaltinyje nurodyta aptarnavimo zona.
- Kainos vienetas, ribos, kontaktų ir kainos buvimas; papildomi filtrai kiekvienam iš 19 laukų su IR / ARBA.
- 8 rūšiavimo būdai, pagal nutylėjimą didėjanti kaina, įrašai be reikšmės gale, 25 / 50 / 100 rezultatų puslapyje.
- Rezultatų lentelė, mobilios kortelės, visos originalios informacijos langas, telefonas, el. paštas ir šaltinių nuorodos.
- Cyberpunk prisijungimo iliustracija, lėti neoniniai efektai, jų išjungimas ir reduced-motion palaikymas.
- Vartotojo pasirinkta „Under Your Spell — Desire (Drive)“ per oficialų YouTube įterpimą; kartojimas, atkūrimas abiejuose ekranuose.
- Viešos sąsajos `noindex`, `nofollow`, `noarchive` ir griežta CSP. Privatūs API atsakymai naudoja `no-store`; leidžiama tik tiksli `https://auctioneer.it.com` kilmė, CORS be wildcard ar Allow-Credentials.

## Duomenų pastabos

- 1 024 įrašai neturi skaitinės kainos, 373 neturi telefono, 4 335 neturi el. pašto.
- 321 užpildyta kategorija ir 4 įrašai be kategorijos.
- `is_business` visur 0; teisinė forma iš šio lauko nenustatoma.
- Įkainiai €/val., €/m², €/m³ ir € nelygiaverčiai; rodoma palyginimo pastaba, pateiktas vieneto filtras.
- Teritorijos spindulys perimamas iš failo. Atstumai ir teikėjo pasiekiamumas kituose miestuose nespėjami.
- Duomenys neperrašomi pagal spėjimus. Originalios reikšmės matomos detaliame įraše.

## Paleidimas

Reikia Node.js 22 ar naujesnio. Trečiųjų šalių serverio paketų nėra.

1. Įkelkite modulį už viešai aptarnaujamo katalogo ribų.
2. Serverio aplinkoje nustatykite `.env.example` nurodytus kintamuosius. Tikrieji prisijungimo ir duomenų raktai niekada neturi patekti į viešą Git saugyklą, frontend paketą ar dokumento HTML.
3. Paleiskite `npm start` arba importuokite `createVipHandler` į esamą Node serverį.
4. Produkcijoje privalomi `NODE_ENV=production` ir `VIP_PUBLIC_ORIGIN=https://auctioneer.it.com`.

`private/catalog.enc` yra užšifruotas AES-256-GCM. Jam reikalingas atskirai saugomas `VIP_DATA_KEY`. Tinkamo rakto nebuvimas sustabdo paleidimą, o ne įjungia viešą režimą.

Konfigūracijos kūrimo skriptas `scripts/configure.mjs` priima JSON per stdin: `username`, `password`, `recordsPath`, `origin`. Jis sukuria naują duomenų raktą, užšifruotą katalogą ir vietinį konfigūracijos failą. Jis niekada neišveda slaptažodžio ar rakto. Pakartotinis vykdymas pakeičia duomenų raktą, todėl prie jau įdiegtos versijos jo neleiskite be suplanuoto raktų atnaujinimo.

## Integracija, išsaugant seną svetainę

Į statinės svetainės `auctioneer/vip/` katalogą kopijuojami tik šeši failai iš `public/`: index.html, app.js, styles.css, music.js, favicon.svg ir login-art.png. Nei užšifruotas katalogas, nei serverio kodas, konfigūracija, slaptažodžio maiša ar duomenų raktas čia nepatenka. Nuoroda nepridedama į pagrindinį meniu ar sitemap.

Statinė sąsaja kreipiasi į `https://auctioneer-vip.onrender.com/vip/api/` su `credentials: omit`. Prisijungimas su `X-VIP-Client: static` grąžina atsitiktinį prieigos žetoną tik po sėkmingos serverio patikros; kiekviena duomenų užklausa jį siunčia kaip `Authorization: Bearer …`. Žetonas nesaugomas localStorage, sessionStorage, URL ar diske. Prisijungimą reikia pakartoti atnaujinus puslapį. POST užklausoms papildomai tikrinami Origin ir CSRF. Kitų svetainių kilmės ir neleistinos preflight antraštės atmetamos.

Atskiras serveris yra Render paslauga `srv-dasnvkojo6nc73cks2b0`, originali statinė svetainė — `srv-darnfinpn0mc73d9h8og`. Abu ištekliai priklauso patvirtintai darbo sričiai `tea-daqolg6gekts739eno7g`. Naudojamas vienas nemokamo plano serveris; po neveiklumo pirmas prisijungimas gali užtrukti, perkrovimas panaikina aktyvias sesijas. `/healthz` skirtas tik serverio būklei.

Šios paslaugos Git saugyklą klonuoja kaip viešą URL be Git tiekėjo prieigos. Nors API rodo autoDeploy=yes, patvirtinta, kad automatinis naujo commit diegimas nevyksta; po pakeitimų būtinas vienas Deploy latest commit, nekeičiant plano ar raktų.

`VIP_TRUSTED_IP_HEADER` nenustatytas: keli lankytojai per tą patį Render tarpinį serverį gali dalytis bandymų limitu. Pirmas nepatikrintas X-Forwarded-For adresas nelaikomas patikimu lankytojo adresu.

Pats `/vip` kelias nėra apsauga: kiekvieną duomenų užklausą autorizuoja serveris.

## Muzika ir efektai

Naudojamas tik vartotojo nurodytas vaizdo įrašas: https://www.youtube.com/watch?v=WflAReA2cqs . Garso failas nekopijuojamas. Grotuvas matomas ir valdomas, o uždarymas sustabdo atkūrimą. Prisijungimas vyksta neperkraunant puslapio, todėl grotuvas lieka tas pats.

Naršyklė gali blokuoti automatinį garsą be vartotojo paspaudimo. Įdėtas paleidimo mygtukas ir matomi YouTube valdikliai. Galimybė įterpti ar atkurti šį vaizdo įrašą priklauso ir nuo YouTube, regiono, paskyros bei tinklo. Nėra pažado, kad garsas visose naršyklėse gros be paspaudimo.

Neono animacijos lėtos, nestroboskopinės. Efektų pasirinkimas išsaugomas tik vietiniame įrenginyje. Kontaktai, slaptažodis ir sesijos žetonai localStorage nesaugomi.

## Patikra

`npm test` tikrina autentifikaciją, prisijungimo ribojimą, sesijos pabaigą, CSRF, filtrus, visas laukų rūšis, teritorijas, skirtingus vienetus, trūkstamas reikšmes ir puslapiavimą. Papildoma HTTP ir naršyklės patikra atliekama prieš diegimą. Sesijos ir bandymų ribos šioje versijoje laikomos vieno serverio atmintyje: perkrovus reikia prisijungti iš naujo. Prieš diegiant kelias serverio kopijas sesijas ir ribojimą perkelti į bendrą saugyklą.

2026-09-27 vietinė patikra: 14 testų sėkmingi, įskaitant tikro užšifruoto 4 500 įrašų katalogo HTTP užklausas. Patvirtinti originalių maršrutų perdavimas nepakeistam handleriui, 401 neprisijungus, 403 netinkamam Origin / CSRF, 404 privatiems failams ir sesijos panaikinimas atsijungus. Gyvo serverio patikra sėkminga: HTTPS prisijungimas, Secure / HttpOnly sesija, 4 500 įrašų, 19 laukų, Vilniaus teritorijos ir kainos rūšiavimas, CSRF, atsijungimas bei neprieinami privatūs failai. Pagrindinio puslapio HTML SHA-256 prieš ir po diegimo sutampa. Darbalaukio prisijungimo vaizdas patikrintas naršyklėje; YouTube rodo teisingą dainą ir valdiklius, bet nenutrūkstamas atkūrimas šiame naršyklės seanse nepatvirtintas. Mobili sąsaja pritaikyta, tačiau tikro mobiliojo įrenginio patikra dar neatlikta. Tikslus CORS kilmės tikrinimas, Bearer sesija, neteisingų žetonų atmetimas, sesijos pabaiga ir atsijungimas papildomai patikrinti testais. Galutinė domeno patikra atliekama paskelbus statinį `/vip` aplanką.

50 tolesnių patobulinimų aprašyti `50-patobulinimu.md`.
