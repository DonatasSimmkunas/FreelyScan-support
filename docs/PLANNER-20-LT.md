# VENT IT planerio patobulinimai ir patikros išvada

2026-10-06. Įgyvendinta 11 iš 20 punktų su toliau nurodytomis ribomis; 9 punktai įgyvendinti iš dalies. Visos užduoties baigta nelaikau.

| Nr. | Patobulinimas | Būsena ir ribos |
|---|---|---|
| 1 | Geometrijos pilnumas nepriklauso vien nuo kambarių numerių | Įgyvendinta: tikrinamas pastato kontūras, nepriskirtas plotas, kontūrų sutapimas ir persidengimai. |
| 2 | Daugiau nei 40 kambarių | Įgyvendinta: pašalinta tyli 40 sričių riba; testuota su 48 kambariais. Importo saugos riba lieka aiški. |
| 3 | Didelės raiškos fragmentų analizė | Įgyvendinta iki 64 persidengiančių fragmentų, su dublikatų šalinimu, eiga ir atšaukimu. |
| 4 | Vienodos brėžinio koordinatės | Įgyvendinta: bendros PDF, iškarpos ir planerio koordinačių transformacijos. |
| 5 | PDF vektorių skaitymas | Įgyvendinta tiesėms ir stačiakampiams; kreivės pažymimos kaip nepalaikomos. Grafinė linija savaime nelaikoma siena. |
| 6 | Legendų ir lentelių atskyrimas | Dalinė: legendos tekstinės eilutės atskiriamos, visos lentelių grafikos maskavimas dar nebaigtas. |
| 7 | Sienų storį atitinkantis tarpų uždarymas | Įgyvendinta: keliami ir lyginami variantai pagal nustatytą brūkšnio storį. |
| 8 | Durų ir atvirų praėjimų atskyrimas | Dalinė: tarpai uždaromi tik su atrama abiejuose galuose; atskiro durų atpažinimo modelio nėra. |
| 9 | Baldų, teksto ir sienų atskyrimas | Dalinė: storio ir ilgų linijų filtrai veikia; semantinis visų objektų atskyrimas nebaigtas. |
| 10 | Bendrų sienų grafas | Dalinė: bendri galai ir atkarpos susiejami su kambariais; visos T jungtys ir sienų suderinimas nebaigti. |
| 11 | Nepriklausomas pastato kontūras | Įgyvendinta uždaroms nustatomoms riboms; atviros išorinės ribos lieka nepatikimas atvejis. |
| 12 | Kontūrų pritraukimas prie originalių pikselių | Įgyvendinta konservatyviai: pataisa priimama tik išlaikant bent 0,98 geometrinį sutapimą. |
| 13 | Virtuvės ir svetainės zonos bendrame kambaryje | Įgyvendinta pagal atskirus užrašus; bendras „Living/Kitchen“ pavadinimas nėra zonos vieta. Keli terminalai išdėstomi išlaikant zonų atskyrimą. |
| 14 | Nepriklausomų atpažinimo metodų palyginimas | Dalinė: lyginami sienų, tarpų, fragmentų ir PDF variantai. Atskiro išmokyto modelio bei kalibruotų tikimybių nėra. |
| 15 | Mastelio patikra dviem kryptimis | Įgyvendinta su aiškiais ilgio vienetais; du horizontalūs matmenys nelaikomi nepriklausoma patikra. |
| 16 | Paklaidos intervalai | Dalinė: plotų geometrinės paklaidos rodomos inspektoriuje; visų pirkimo kiekių ir kainų intervalai nebaigti. |
| 17 | Brėžinių etalonai | Dalinė: 21 kontrolinis išplanavimas turi tikslias ribas. Nepriklausomo specialistų sužymėto tikrų projektų rinkinio dar nėra. |
| 18 | Atsparumo transformacijoms testai | Įgyvendinta: 63 pasukimo, kontrasto ir poslinkio variantai bei papildomos koordinačių patikros. |
| 19 | Nutraukto apdorojimo tęstinumas | Dalinė: OCR ir fragmentų etapai saugomi toje pačioje naršyklėje. Serverio užduočių eilė ir tęstinumas kituose įrenginiuose neįdiegti. |
| 20 | Fizinės trasos ir atsekama sąmata | Dalinė: įvertinamas ortakio plotis, sienų kirtimai pažymimi patikrai, atkarpos ir posūkio vietos turi ID. Konkretūs suderinami gaminiai ir montavimo aukščiai dar nepatvirtinti. |

## Atliktos patikros

- 127 naujos automatizuotos patikros praėjo. Tai 21 kontrolinis originalas, 63 transformuoti jų variantai ir papildomos geometrijos, mastelio, PDF, maršrutų bei zonų patikros. Tai nėra 100 skirtingų internete rastų projektų.
- Esami planerio, patalpų įvedimo, geometrijos, patikimumo, kalbų, eksportavimo ir parduotuvės sutarčių testai praėjo. Tai nepatvirtina realaus mokėjimo ar visų naudotojo veiksmų produkcijoje.
- Svetainėje įkeltas specialiai sukurtas keturių patalpų PDF. Automatiškai gauti 4 kambariai, 48,1 m², agregato vieta ūkinėje patalpoje, difuzoriai, dėžutės ir trasos.
- Aptiktas ir pataisytas pradinis 70 / 95 m³/h disbalansas. Po pataisos gauti 95 / 95 m³/h. Pataisytas virtuvės ir svetainės taškų per didelis artumas: šiame kontroliniame plane liko 0 automatinių klaidų ir 3 specialisto patikrai skirti įspėjimai.
- Patikrintas užbaigto rezultato išlikimas perkrovus puslapį. Nutraukimas viduryje OCR ir atnaujinimas kitu įrenginiu šiuo bandymu nepatvirtinti.
- Svetainėje perjungtos LT, EN ir NO kalbos; patikrinti analizės, patikimumo ir patikrų tekstai. Papildomai praeina 53 kalbų patikros.
- Medžiagų lentelėje gauta 40,2 m Ø75 ortakių ir 45 m pirkimo įvertis su 10 % atsarga, 2 skirstymo dėžutės ir 9 difuzoriai. Skaičiai priklauso nuo konkrečios preliminarios trasos.
- CSV mygtukas paspaustas, bet naršyklės automatizavimas negavo patvirtinto atsisiuntimo rezultato. Todėl CSV atsisiuntimo šioje naršyklėje patvirtintu nelaikau. Programiniai eksporto testai praėjo.

## Kas trukdo vadinti produktą baigtu

Viso komplekto kainos dar nepilnos. Kontroliniame plane trys rodomos įkainotų prekių sumos apėmė katalogo rekuperatorių; ortakiai, jungtys, difuzoriai ir dėžutės turėjo tikslinamų pozicijų. Įdėjimas į krepšelį buvo išjungtas. Šių sumų negalima pateikti kaip visos sistemos kainos.

Toliau būtina užbaigti lentelių ir baldų atskyrimą, durų klasifikavimą, bendrų sienų suderinimą, nepriklausomą atpažinimo modelį, medžiagų paklaidų skaičiavimą, serverio apdorojimą ir konkrečių gaminių suderinamumą. Reikia atskiro tikrų projektų rinkinio su specialistų patvirtintais kambarių, sienų ir mastelio etalonais.

Šios versijos tikrų projektų atpažinimo procentas neišmatuotas. Kontrolinių testų sėkmė ir vienas svetainės bandymas nėra pagrindas teigti 100 % tikslumą. Dabartinė versija tinka preliminariam bandymui ir specialistui pateikiamam juodraščiui; ji dar nėra universalus automatinio montavimo projekto ir galutinio pirkinių komplekto generatorius.
