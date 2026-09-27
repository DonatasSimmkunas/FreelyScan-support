# Auctioneer VIP

Papildomas `/vip` modulis esamai `auctioneer.it.com` svetainei. Pagrindinio puslapio failai nebuvo keičiami. Esama svetainė yra Render Static Site, diegiama iš `auctioneer-site` šakos katalogo `auctioneer`. VIP serveris diegiamas atskirai iš `auctioneer-vip` šakos; pagrindinės svetainės šaka ir failai nekeičiami. Domeno maršrutų prijungimo būsena tikrinama Render valdymo skydelyje.

Privatus pristatymo archyvas turi vietinio paleidimo konfigūraciją su slaptažodžio maiša ir duomenų iššifravimo raktu. Archyvo, jo konfigūracijos ir `private` katalogo negalima pateikti per statinių failų serverį. `.gitignore` neleidžia konfigūracijai patekti į Git. Pati slaptažodžio tekstinė reikšmė archyve nesaugoma.

## Paruoštos funkcijos

- Prisijungimas vartotojo vardu ir slaptažodžiu, serverio patikra, scrypt slaptažodžio maiša.
- HttpOnly, SameSite=Strict sesija; Secure slapukas produkcijoje. 30 min. neveiklumo ir 8 val. maksimali sesijos trukmė.
- Apriboti neteisingo prisijungimo bandymai, Origin ir CSRF patikra.
- Visi 4 500 originalių įrašų ir 19 originalių laukų. Duomenys perduodami tik prisijungus; viešuose JavaScript failuose jų nėra.
- Paieška visuose laukuose, kategorija, 56 vietovės, visa Lietuva arba šaltinyje nurodyta aptarnavimo zona.
- Kainos vienetas, ribos, kontaktų ir kainos buvimas; papildomi filtrai kiekvienam iš 19 laukų su IR / ARBA.
- 8 rūšiavimo būdai, pagal nutylėjimą didėjanti kaina, įrašai be reikšmės gale, 25 / 50 / 100 rezultatų puslapyje.
- Rezultatų lentelė, mobilios kortelės, visos originalios informacijos langas, telefonas, el. paštas ir šaltinių nuorodos.
- Cyberpunk prisijungimo iliustracija, lėti neoniniai efektai, jų išjungimas ir reduced-motion palaikymas.
- Vartotojo pasirinkta „Under Your Spell — Desire (Drive)“ per oficialų YouTube įterpimą; kartojimas, atkūrimas abiejuose ekranuose.
- `noindex`, `nofollow`, `noarchive`, `no-store`, CSP, draudimas įterpti VIP puslapį į kitos svetainės iframe.

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

Jei esamas serveris naudoja Node, VIP handlerį įterpkite prieš dabartinį maršrutų arba statinių failų handlerį:

```js
import { createVipHandler } from './auctioneer-vip/lib/handler.mjs';
const vip = await createVipHandler(process.env);

// Esamo serverio request funkcijoje:
if (await vip(req, res)) return;
// Toliau vykdomas nepakeistas dabartinės svetainės handleris.
```

Handleris aptarnauja tik `/vip` ir `/vip/…`; kitoms užklausoms grąžina `false`. Negalima pakeisti pagrindinio serverio pateiktu demonstraciniu `server.mjs`, nes jis pats neaptarnauja senos svetainės.

Jei esama svetainė yra Render Static Site, vien statinio `/vip/index.html` katalogo neužtenka serverio autentifikacijai. Reikės prie esamo domeno `/vip/*` prijungti serverio maršrutą arba suderinamą saugų backend per same-origin rewrite. Statinių puslapių dizainas, meniu, domeno šaknis ir likę maršrutai turi likti nepakeisti. Reikalingos tik dvi papildomos rewrite taisyklės: `/vip` ir `/vip/*`, nukreiptos į atitinkamus atskiros VIP tarnybos kelius. Esamos taisyklės išsaugomos. `/healthz` skirtas tik atskiro serverio būklei tikrinti.

`VIP_TRUSTED_IP_HEADER` paliekamas nenustatytas: keli lankytojai per tą patį Render tarpinį serverį gali dalytis bandymų limitu. Pirmas nepatikrintas X-Forwarded-For adresas nelaikomas patikimu lankytojo adresu. Naudojama viena serverio kopija.

VIP nuorodos nereikia pridėti į pagrindinį meniu, sitemap ar robots sąrašą. Pats žinomas `/vip` kelias nėra apsaugos priemonė; apsaugą vykdo serveris.

## Muzika ir efektai

Naudojamas tik vartotojo nurodytas vaizdo įrašas: https://www.youtube.com/watch?v=WflAReA2cqs . Garso failas nekopijuojamas. Grotuvas matomas ir valdomas, o uždarymas sustabdo atkūrimą. Prisijungimas vyksta neperkraunant puslapio, todėl grotuvas lieka tas pats.

Naršyklė gali blokuoti automatinį garsą be vartotojo paspaudimo. Įdėtas paleidimo mygtukas ir matomi YouTube valdikliai. Galimybė įterpti ar atkurti šį vaizdo įrašą priklauso ir nuo YouTube, regiono, paskyros bei tinklo. Nėra pažado, kad garsas visose naršyklėse gros be paspaudimo.

Neono animacijos lėtos, nestroboskopinės. Efektų pasirinkimas išsaugomas tik vietiniame įrenginyje. Kontaktai, slaptažodis ir sesijos žetonai localStorage nesaugomi.

## Patikra

`npm test` tikrina autentifikaciją, prisijungimo ribojimą, sesijos pabaigą, CSRF, filtrus, visas laukų rūšis, teritorijas, skirtingus vienetus, trūkstamas reikšmes ir puslapiavimą. Papildoma HTTP ir naršyklės patikra atliekama prieš diegimą. Sesijos ir bandymų ribos šioje versijoje laikomos vieno serverio atmintyje: perkrovus reikia prisijungti iš naujo. Prieš diegiant kelias serverio kopijas sesijas ir ribojimą perkelti į bendrą saugyklą.

2026-09-27 vietinė patikra: 11 testų sėkmingi, įskaitant tikro užšifruoto 4 500 įrašų katalogo HTTP užklausas. Patvirtinti originalių maršrutų perdavimas nepakeistam handleriui, 401 neprisijungus, 403 netinkamam Origin / CSRF, 404 privatiems failams ir sesijos panaikinimas atsijungus. Browser vizualinė patikra nebaigta, nes šioje aplinkoje neveikė peržiūros infrastruktūra. YouTube įterpimo parametrai paruošti, bet realus vaizdo įrašo atkūrimas naršyklėje dar nepatvirtintas.

50 tolesnių patobulinimų aprašyti `50-patobulinimu.md`.
