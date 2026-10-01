# VENT IT — 50 planerio patikimumo pakeitimų

Versija: 2026.10-reliability-1. 2026-10-01.

Įgyvendinti 50 techninių pakeitimų. 89 skirtingi automatizuoti testai praėjo. Tai nereiškia, kad automatinis visų patalpų atpažinimas patvirtintas: tikras vieno būsto pavyzdys vis dar aptinka tik vonios sritį iš 3 pagrindinių vidaus sričių. AI kelias paruoštas, bet paslauga neturi API rakto. Vietinis algoritmas yra kandidatų siūlymo ir rankinio patikslinimo priemonė.

| Nr. | Pakeitimas | Elgsena / ribos | Vieta | Patikra |
|---:|---|---|---|---|
| 1 | Baigtiniai kampų skaičiai | NaN / Infinity ir ne skaičiai atmetami. | plan-geometry.js | 04–05 |
| 2 | Koordinatės brėžinio ribose | Ribos už 1000×700 drobės nepriimamos. | plan-geometry.js | 06 |
| 3 | Pasikartojantys kampai | Dvigubi kampai ir nulinės kraštinės atmetami. | plan-geometry.js | 07 |
| 4 | Nesikertančios ribos | Tikrinami kirtimai, prisilietimai ir atgal einančios kraštinės. | plan-geometry.js | 08–09 |
| 5 | Mažiausias patalpos kontūras | Atmetami pernelyg maži poligonai. | plan-geometry.js | 10 |
| 6 | Įgaubtų patalpų plotas | Plotas skaičiuojamas pagal poligoną, ne apibrėžiantį stačiakampį. | plan-geometry.js | 01–02 |
| 7 | Kontūro krypties nepriklausomumas | Plotas ir sankirtos tikrinami nepriklausomai nuo kampų krypties. | plan-geometry.js | 03 |
| 8 | Tikslūs patalpų persidengimai | Įgaubti poligonai trianguliuojami; bendra siena nelaikoma bendru plotu. | plan-geometry.js | 11–14, 56 |
| 9 | Patalpa pastato viduje | Tikrinamos ir kraštinės, ne vien kampai ar keli vidiniai mėginiai. | plan-reliability.js | 18, 57 |
| 10 | Sienų pritraukimo apsauga | Pritraukimas negali įrašyti netaisyklingo poligono. | plan-geometry.js | test-plan-geometry |
| 11 | Difuzorius įgaubtoje patalpoje | Taškas projektuojamas į patalpos vidų su tarpu nuo ribos. | plan-geometry.js | 16–17 |
| 12 | Stačiakampės trasų jungtys | Tikslios pradinės ir galinės koordinatės įtraukiamos į maršruto tinklelį. | plan-routing.js | 20, 22 |
| 13 | Trasų tarpas nuo draudžiamų zonų | Tikrinama visa atkarpa ir 6 px geometrinė atsarga. Tai nėra norminis montavimo tarpas. | plan-routing.js | 21, 23–24 |
| 14 | Trasa įgaubtame pastate | Trasos kraštinės negali išeiti už patvirtinto pastato kontūro. | plan-routing.js | 25–26 |
| 15 | Mažiau nereikalingų posūkių | Maršrutizavimas atskiria judėjimo kryptis ir taiko posūkio kainą. | plan-routing.js | 22–26 |
| 16 | Maršrutų pakartotinio skaičiavimo mažinimas | Vieno atvaizdavimo metu identiškos trasų užklausos įsimenamos. | plan-reliability-ui.js | Naršyklės sąmatos scenarijus |
| 17 | Automatinis kontrasto slenkstis | Sienų analizės slenkstis parenkamas iš vaizdo histogramos ir ribojamas. | plan-raster.js | 29–30 |
| 18 | Skaidrių vaizdų apdorojimas | Skaidrus juodas fonas nelaikomas juoda siena. | plan-raster.js | 27 |
| 19 | Tuščio / per tamsaus brėžinio atmetimas | Iš netinkamo kontrasto vaizdo patalpos neišgalvojamos. | plan-raster.js | 28–29 |
| 20 | Vaizdo triukšmo filtravimas | Smulkūs nesusiję taškai nekuria patalpų. | plan-raster.js | 33 |
| 21 | Plonų baldų linijų slopinimas | Sienų storio požymiai mažina plonų baldų ir raidžių įtaką; nėra universali atpažinimo garantija. | plan-raster.js | 32; tikri brėžiniai |
| 22 | Valdomas angų uždarymas | Mažų tarpelių uždarymo slenkstį galima keisti ir matyti kandidatus. | plan-raster.js | 86–87 |
| 23 | Išorinio lapo ploto atmetimas | Prie lapo krašto prijungtos laisvos sritys nelaikomos kambariais. | plan-raster.js | 31 |
| 24 | Kontūrai pagal pikselių sritis | Atpažintos sritys turi kontūrus, įskaitant įgaubimus. | plan-raster.js | 30, 85 |
| 25 | Kontūro supaprastinimo ploto patikra | Supaprastinimas negali reikšmingai pakeisti atpažintos srities ploto. | plan-raster.js | 30, 85 |
| 26 | Baldų dydžio sričių atmetimas | Mažos ir siauros uždaros sritys neįtraukiamos. | plan-raster.js | 32 |
| 27 | Sienų požymių rodymas | Rodoma, kokia kontūro dalis turi tamsių sienų požymių. Tai ne tikslumo procentas. | plan-raster.js | 30; naršyklės kandidatai |
| 28 | Jautrumas pasirinktam tarpelio dydžiui | Kandidatas pažymimas kaip stabilus arba jautrus parametro pokyčiui. | plan-reliability-ui.js | Naršyklės trijų patalpų scenarijus |
| 29 | Vietinis atpažinimas be paskyros | Pagrindinis mygtukas gali analizuoti sienų sritis naršyklėje be AI rakto ir prisijungimo. | plan-reliability-ui.js | Naršyklės tikro ir sintetinio brėžinio scenarijai |
| 30 | Patalpos pasirinkimas paspaudimu | Paspaudimas susiaurina kandidatus iki pasirinkto taško srities. | plan-reliability-ui.js | Geometrinė taško priklausymo patikra |
| 31 | Kandidatų peržiūra be darbo praradimo | Kandidatai neperrašo esamų patalpų; galima apžiūrėti ribas plane ir priimti pasirinktus. | plan-reliability-ui.js | Naršyklės kandidato priėmimas |
| 32 | Pavadinimai pagal vietą | PDF teksto koordinatės ir vietinis OCR priskiria pavadinimus tik srities viduje. | plan-raster.js / plan-ocr.js | 35, 81–82; gyvas OCR 3/3 |
| 33 | Plotai pagal įrodymą | Priimamas aiškus vienas m² užrašas; kelios reikšmės, matmenys ir sq ft nepervadinami m². | plan-raster.js | 36–38, 88 |
| 34 | Patalpų paskirties pasiūlymai | LT / EN / NO pavadinimų požymiai, įskaitant svetainę su virtuve; neaiški paskirtis stabdo užklausą. | plan-raster.js / plan-reliability.js | 39, 55; gyvas OCR |
| 35 | Mastelio bazinės patikros | Atmetami trumpi matmenys ir netinkamos metrų reikšmės; tikrinamas linijos bei mastelio sutapimas. | plan-reliability.js | 47–49, 51, 83 |
| 36 | Antras mastelio matmuo | Galima nepriklausomai patikrinti kitą matmenį; >5% skirtumas stabdo tinkamumo būseną. | plan-reliability.js | 53 |
| 37 | Ploto ir ribų palyginimas | >15% skirtumas tarp įrašyto / spausdinto ir pagal mastelį skaičiuoto ploto pažymimas klaida. | plan-reliability.js | 54 |
| 38 | Aukšto peržiūra ir patalpų skaičius | Reikia įrašyti originaliame plane matomą skaičių; pakeitimai panaikina peržiūros galiojimą. | plan-reliability.js / UI | 52, 75; naršyklės neteisingas skaičius |
| 39 | Rankinių reikšmių ribojimas | Plotas, aukštis ir srautai negali tapti neigiamais ar nebaigtiniais skaičiais. | plan-reliability-ui.js | 45, 77 |
| 40 | Atkuriamų projektų validacija | Vietiniai, bendrinami, debesies ir JSON projektai tikrinami prieš atvaizdavimą. | plan-reliability.js | 40–46 |
| 41 | Projekto JSON kopija ir atkūrimas | Atkūrimas nepriima nežinomo formato; dabartiniam projektui inicijuojama kopija ir išlieka Atšaukti. | plan-reliability-ui.js | 40–46; gyvas atkūrimas |
| 42 | AI užklausos gyvavimo apsauga | Laiko limitas, seno atsakymo atmetimas, geometrijos pakartotinė validacija ir įspėjimas prieš perrašymą. | planner.html / Edge Function | test-recognition-contract; kodo peržiūra |
| 43 | Apsauga redaguojant originalų planą | Patalpos foniniame brėžinyje netempiamos atsitiktinai; netaisyklingas kampų pakeitimas atšaukiamas. | plan-reliability-ui.js | 08–09; naršyklės peržiūra |
| 44 | Rekuperatoriaus ir elementų vietos | Siūloma vieta matomoje techninėje / ūkio patalpoje; tikrinami HRV, dėžės ir difuzoriai. Tai ne optimalaus inžinerinio išdėstymo įrodymas. | plan-reliability.js / UI | 58–61, 78 |
| 45 | Srautų ir difuzorių derinimas | Tikrinamos patalpų sumos, linijų talpa, dubliavimas, balansas, greičio ir artimų P/I taškų įspėjimai. | plan-reliability.js | 61–67 |
| 46 | Klaidos stabdo komplekto veiksmus | Geometrijos, mastelio, trasų ir srautų klaidos stabdo komplekto įtraukimą / patikros užklausą. | plan-reliability-ui.js | 50–68; naršyklės sąmatos |
| 47 | Nubraižyti ir pirkimo metrai atskirai | Atsarga 0–30%; dešimtainės paklaidos suvaldomos prieš apvalinimą pirkimui. | plan-reliability.js | 69–70, 84 |
| 48 | Lygiagrečios ir vertikalios linijos | Kiekiai dauginami iš linijų skaičiaus; kelių aukštų vertikali dalis abiem oro kryptims skaičiuojama iš įvesto matmens. | plan-reliability.js | 71–74 |
| 49 | CSV sąmatos eksportas | Kiekiai, trasos, versija, prielaidos ir klaidos eksportuojami; formulę primenantis tekstas neutralizuojamas. | plan-reliability-ui.js | Kodo peržiūra; naršyklės eksportas |
| 50 | Patikimumo rezultatai PDF | Į ataskaitą įtraukiama versija, klaidos, įspėjimai, atsarga ir preliminaraus plano statusas. | planner.html / plan-reliability-ui.js | test-export-calibration; ataskaitos konstrukcija |

Testai: `node scripts/test-planner-reliability.mjs`; regresija: `node scripts/run-tests.mjs`; tikrų vaizdų stebėjimas: `node scripts/benchmark-planner-real.mjs <fixtures-dir>`. Tikri naudotojo failai neviešinami Git repozitorijoje.
