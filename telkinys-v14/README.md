# Telkinys V14 — bandomoji versija

## Ką pakeitė šis etapas

- Pašalinta visa senojo hero iliustracija: centrinis telkinys, srautai ir išmėtytos kortelės. Ji nepaslepiama vien telefonu — jos nėra sugeneruotame HTML.
- Išsaugota žalia Telkinio vizualinė kryptis, supaprastinta navigacija ir pagrindinis puslapis.
- Paieška atskirta į testuojamą modulį. Kategorija, žinomos vietos, kainos, kambariai, aukštas, metai ir rida taikomi kaip apribojimai. Nėra atsarginio nesusijusių rezultatų sąrašo.
- Veikia rankiniai kategorijos, vietos, kainos filtrai ir tikras rikiavimas.
- Pasiūlymų kūrimas, redagavimas, archyvavimas, atkūrimas, pašalinimas ir paieška naudoja tą patį vietinių duomenų modelį.
- Galima pridėti iki 3 JPG/PNG/WebP nuotraukų; jos sumažinamos kliento naršyklėje.
- Favoritai, palyginimas ir paieškos su filtrais saugomos naršyklėje, su duomenų eksporto galimybe ir išsaugojimo klaidų pranešimais.
- Vartotojo tekstai atvaizduojami per DOM tekstinius laukus, ne kaip HTML šablonai. Įjungta statinio scenarijaus SHA-256 CSP politika, uždraustos tinklo API užklausos ir formų siuntimas.
- Nauja sąsaja nenaudoja išgalvotų aktyvių mokėjimų, AI, tapatybės patikrų, reputacijos ar tikrų pardavėjų pažadų.

## Sąmoningos ribos

Tai ne produkcinis MVP ir ne bendra prekyvietė. Paskyros, serverio DB, kitų žmonių matomi skelbimai, tikros žinutės, AI modelis, tikras žemėlapis, mokėjimai, moderavimo serveris ir paštas NEPRIJUNGTI. Vietiniai pasiūlymai neveikia kitame įrenginyje. Demo skelbimų `?skelbimas=` nuorodos skirtos demonstracijai, ne pilnam SEO sprendimui. Nauja/naudota ir realaus laiko prieinamumo kriterijai dar neįgyvendinti; sąsaja apie tai įspėja.

## Šaltinis ir leidimo izoliacija

- Gamybinis V13: `telkinys-vercel-staging` / `telkinys-deploy/index.html`, bazinis commit `f97e9321191b132709fa980760aa078ab6f7eaf4`.
- Šio etapo šaka: `telkinys-v14-preview`.
- Atskiras Render servisas: `srv-db28uqjtqb8s73chc420`, `telkinys-v14-preview.onrender.com`.
- Pagrindinis servisas `srv-dat11qg473hc73e9vj10` ir `telkinys.lt` šiame etape NEKEIČIAMI.
- Preview turi `noindex,nofollow`. Jokie Supabase ar kitų projektų resursai nebuvo keičiami.

## Failai

- `shell.html`: semantinė sąsaja ir native dialogai.
- `style.css`: konsoliduotas mobilus / kompiuterio dizainas.
- `search.mjs`: grynos paieškos funkcijos.
- `model.mjs`: pavyzdinių duomenų normalizavimas ir vietinių duomenų validacija.
- `app.js`: vietinės sąveikos, saugojimas, nuotraukos ir maršrutai.
- `search.test.mjs`: automatiniai regresiniai testai.
- `build.mjs`: be paketų priklausomybių surenka vieną statinį puslapį; ikonoms ir 12 demo įrašų naudoja esamą V13 šaltinį, bet jo nekeičia.

## Patikra ir surinkimas

```sh
node --test telkinys-v14/search.test.mjs
node telkinys-v14/build.mjs
# Static output: telkinys-v14-dist
```

Render build privalo praeiti testus prieš publikuodamas peržiūrą. Testų išjungti vien dėl nepavykusio surinkimo negalima.

Naršyklėje patikrinti: 360/390/768/1440 px pločius, tikrą `innerWidth`, horizontalų slinkimą, paiešką `2 kambarių butas Žirmūnuose iki 180 000 €`, `Audi iki 10 000 €`, kainos rikiavimą, filtrus, vietinį įkėlimą, redagavimą, perkrovimą, archyvavimą / atkūrimą, pašalinimo atšaukimą, ilgus tekstus, nuotraukų validaciją, vietinio saugojimo klaidas, dialogų klaviatūros valdymą ir peržiūros nuorodas.

## Kitas etapas (dar neįgyvendintas)

1. Pasirinkti pradinę kategoriją ir realių pasiūlymų šaltinį.
2. Sukurti atskirą Telkinio paskyrų / duomenų aplinką, ne naudoti kitų projektų DB.
3. Įgyvendinti autentifikaciją, savininko teises, serverinį skelbimų modelį ir nuotraukų saugojimą.
4. Prijungti tikrą publikavimą ir dviejų vartotojų susisiekimą.
5. Moderavimas, pranešimai apie skelbimus, piktnaudžiavimo ribojimai, atsarginės kopijos ir atkūrimo bandymas.
6. Telkiniui pritaikyti teisiniai dokumentai ir kontaktai; dabar saugyklos šaknyje esanti FreelyScan privatumo politika netinka.
7. Uždara beta, skelbimų URL / SEO, stebėsena ir tik tada viešas paleidimas.
8. AI, tikras žemėlapis ir mokėjimai — atskirai, su realiais duomenimis ir aiškiais priėmimo kriterijais.

Nesujungti į gamybinę šaką ir nekeisti domeno be atskiro leidimo. Gamybinis Render vis dar kopijuoja tik seną `telkinys-deploy/index.html`; būsimas V14 paleidimas turi sąmoningai pakeisti jo build / publish konfigūraciją arba pateikti patikrintą sugeneruotą artefaktą.
