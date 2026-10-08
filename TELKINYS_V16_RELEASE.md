# Telkinys V16 — paskyros saugumas, kopijos ir techninė priežiūra

2026-10-08. Įgyvendintas kitas patvirtinto plano etapas, ne visas 100 % paruoštas verslas. Pagrindinis UI talpinamas Render telkinys.lt; Floot V9 pradinis puslapis nėra dabartinis produktas.

## Įgyvendinta

- Sesijų valdymas paskyroje: aktyvių prisijungimų datos, pasirinktos sesijos atjungimas, kitų sesijų atjungimas patvirtinus slaptažodžiu. Rodoma tik iš tikrųjų žinoma informacija, ne spėjami įrenginiai.
- Skelbimo aktualumas 30 dienų, atskira savininko aktualumo skiltis. Pasibaigęs patvirtintas skelbimas išlieka paskyroje, bet nerodomas viešoje paieškoje / detalėje / favorituose, jo nuotraukos nebepasiekiamos per viešą API, negalima pradėti naujo pokalbio. Savininkas gali atnaujinti realiai galiojantį pasiūlymą.
- Poreikio dalyvio blokavimas. Jau turimo susitarimo skaitymas ir atšaukimas lieka galimi, nors naujos žinutės blokuojamos. Susitarimo snapshot, need_id ir offer_id nekintamumas užtikrinamas ir DB trigeriu.
- Pataisyta senesnė modalų klaida: DOM vaikų masyvas nebeperduodamas replaceChildren kaip tekstas. Tai svarbu privačių žinučių ir patvirtinimo formoms.
- Administratoriaus priežiūros skiltis: kopijų istorija, atkūrimo būsena, eilė, rankinė priežiūra, papildomos kopijos, slaptažodžiu patvirtinamas privataus archyvo atsisiuntimas ir sąžiningos pasirengimo patikros.
- AI juodraščio adapteris gpt-6-luna per Floot ir peržiūros sąsaja. Tik aiškiai pasirinktas poreikio tekstas, per-užklausos sutikimas, jokių automatiškai siunčiamų pokalbių. 5 užklausos vartotojui ir 30 projektui per dieną. AI atsakymas nieko nepaskelbia: žmogus atskirai peržiūri ir perkelia į formą. OUT_OF_CREDITS nekelia klaidos toast. Dalyviams pagal nutylėjimą išjungta; įjungimą riboja operatoriaus patvirtinimas ir administratoriaus peržiūra. Tikro modelio atsakymo bandymas šiame darbe neatliktas, todėl integracijos nevadinti galutinai patvirtinta.
- Atnaujinta privatumo informacija pagal faktinę kopijų, GitHub patikrų, sesijų ir pasirinktinių AI juodraščių architektūrą. Operatoriaus rekvizitai neišgalvoti, dokumentų teisinė peržiūra neatlikta.

## Veikiantis kopijų ir atkūrimo pagrindas

Repo DEFAULT main šakoje: .github/workflows/telkinys-maintenance.yml ir .github/telkinys/verify_backup.py. Kasdien 02:17 UTC, taip pat galimas rankinis GitHub darbo paleidimas. Tai infrastruktūros priežiūra, ne automatinis programavimo tęsimas. GitHub grafikas gali vėluoti ir neaktyvioje viešoje saugykloje gali būti sustabdytas.

Darbas gauna tik trumpalaikį GitHub OIDC tokeną. Serveris tikrina konkrečią saugyklą, savininką, auditoriją, main šaką, workflow failą, galiojimą ir parašą. Jokių nuolatinių DB slaptažodžių GitHub darbo konfigūracijoje. Kopijos laikomos privačioje Floot saugykloje; jos nekeliamos į viešus GitHub priedus ar failus. Loguose tik agregatai.

Kopijuojama telkinys lentelių struktūra, enumai, apribojimai, indeksai, funkcijos, trigeriai, duomenys ir paruoštos nuotraukos. Sesijų, kvietimų ir laikinų įrašų turinys neatkuriamas. Kiekvienos kopijos atkūrimas tikrinamas naujame laikiname PostgreSQL 18 konteineryje be jungties prie gyvos DB. Tikrinamos eilutės, apribojimai ir esančių nuotraukų maišos.

2026-10-08 pirmas sėkmingas darbas: GitHub Actions 37808756458. Kopija 5fa03724-9bfd-4ea6-9cac-4beccecd3ea2, patikrinta 16:26:43 UTC: 27 lentelės, 1 konfigūracijos eilutė, 0 nuotraukų. Tai tikras atkūrimas, bet NE pilnas realių paskyrų ir nuotraukų atkūrimo bandymas. Pradinė PostgreSQL17 / PostgreSQL18 NOT NULL apribojimų nesuderinamumo klaida buvo aptikta ir pataisyta prieš sėkmingą pakartojimą.

Rotacija numato 14 dienų, tačiau paskutinė patikrinta kopija paliekama, jei naujesnės nėra. Kopijos yra tame pačiame Floot paslaugų teikėjuje: tai dar ne nepriklausomas atsarginis teikėjas. Aiškios beta ribos: 50 tūkst. duomenų eilučių, 32 MB JSON, iki 500 nuotraukų / 256 MB. Viršijus ribą darbas turi aiškiai nepavykti, ne sukurti dalinę sėkmingą kopiją.

## Atliktos patikros

- 26 paieškos atvejai + 10 OIDC teisių / laiko atvejų: 3 Floot spec failai praėjo.
- GitHub Actions V16 validation 37810570261: success. 13 JS modulių sintaksė, bendras rinkinys ir 10 surinkimo regresijų praėjo.
- 55 offline Chromium sąsajos patikros su sintetiniais API atsakymais praėjo. Pločiai 320,360,390,768,1440 px; neaptikta viso puslapio horizontalaus perpildymo tikrintose būsenose. Patikrinti modalai, vartotojo/admin ekranai, AI sutikimas, atskiras juodraščio pritaikymas, tekstinis HTML atvaizdavimas ir kredito klaida be toast.
- Vietinė naršyklė neleido tinklo navigacijos. UI patikrai naudotas page.set_content, išlaikant produkcinę CSP; UUID buvo pateiktas tik testinėje aplinkoje. Tai ne tikro domeno ar tikrų paskyrų integracinis testas.
- Automatinė kelių laikinų paskyrų / nuotraukos / AI API patikra buvo BLOKUOTA SAUGOS PATIKROS PRIEŠ VYKDYMĄ. Šis bandymas nevykdytas ir nepermaršrutuotas. Jo nelaikyti atliktu; testiniai vartotojai nesukurti. Prieš domeno publikavimą tikri users/listings/images skaičiai tebebuvo 0.

## Šaltiniai ir tęstinumas

Kandidatė: telkinys-v16-work, patikrintas artefakto commit 4c359f22eb3ca7c3df2558f866a14793a593b67b.
HTML: 166726 baitų, SHA256 a52307bf7d681da8859aa0abc45210a812bc97c429fdd02bd90b2de8d1d29b51.
Surinkimas: node telkinys-v16/build.mjs --write-deployment-artifact; testai node --test telkinys-v16/build.test.mjs.
Produkcija: Render srv-dat11qg473hc73e9vj10, workspace tea-daqolg6gekts739eno7g, telkinys-vercel-staging, kopijuojamas telkinys-deploy/index.html. V14 build įėjimas nukreipiamas į V16. Viešo leidimo rezultatas fiksuojamas atskirai tik po tikros patikros.
Backend: Floot 5b325205-4684-4080-b798-7236728d2e1a; checkpoint 8147ccfb-c96d-4f3e-ac3b-ac0abe9c7737; paskelbimo job d9caa654-6fc1-49b5-b8f9-2ff44f45eb48 succeeded.
V15 atsarginė šaka telkinys-v15-backup-before-v16, commit51b31204f3ef2be0c6f5a00bb49d02433705fd21. Grąžinant UI nekeisti DB atgal ir nenaikinti naujai gautų duomenų. Kodo checkpoint nėra duomenų kopija.

## Likę darbai ir priklausomybės

Tikri operatoriaus rekvizitai / dokumentų peržiūra, patvirtintas el. pašto siuntimo domenas ir automatinis paskyros atkūrimas el. paštu, mokėjimų ir KYC teikėjo prijungimas, AI live priėmimo testas, pilnas tikrų paskyrų / nuotraukų E2E, nepriklausomas saugumo ir apkrovos auditas, realių klientų bei specialistų pritraukimas. Taip pat liko pilnas indeksuojamų skelbimų SEO ir platesni visų rinkų procesai. Nepriklausomos nuolatinės testinės Floot DB sukurti neleido nemokamo plano 5 projektų riba; vietoj jos atkūrimo bandymui yra izoliuota laikina CI duomenų bazė. Mokamų planų ir paslaugų neužsakyta. Beta/noindex/kvietimai lieka. Mokėjimai ir automatiniai el. laiškai dar neįjungti. Nebuvo keičiami DNS ar originalus administratoriaus kvietimas.
