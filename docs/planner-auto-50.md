# VENT IT — 50 naujų įkėlimo ir automatikos pakeitimų

2026-10-01. Šie pakeitimai skirti PDF ir vaizdo automatikai. 11/11 patalpų aptikimas viename brėžinyje nėra universalaus tikslumo įrodymas. Numerių paskirties legenda nepateikta, todėl jos neišgalvojame.

| Nr. | Pakeitimas | Elgsena |
|---:|---|---|
| 1 | Didesnė PDF raiška | PDF ilgasis kraštas renderinamas iki 2200 px; pašalintas ankstesnis scale≤2 ribojimas. |
| 2 | PNG brėžinio fonas | Sienos ir skaitmenys nepažeidžiami JPEG glaudinimo. |
| 3 | Atskiras OCR vaizdas | Užrašams išsaugoma 2000×1400 versija iš originalaus šaltinio. |
| 4 | Automatinė lapo iškarpa | Brėžinys aptinkamas pagal konstrukcinių linijų sritį. |
| 5 | Pavadinimo ir paraščių slopinimas | Trumpų raidžių komponentai nelemia brėžinio iškarpos. |
| 6 | Iškarpos saugos paraštė | Pridedama proporcinga paraštė prie konstrukcijų ribų. |
| 7 | Rankinės iškarpos prioritetas | Naudotojo pasirinkimas nepakeičiamas automatiniu. |
| 8 | Pasirinkto puslapio išlaikymas | Apdorojamas naudotojo pasirinktas PDF puslapis. |
| 9 | Iškarpos koordinačių transformacija | PDF tekstas ir vaizdas perkeliami į vieną koordinačių sistemą. |
| 10 | OCR be prisijungimo | Įkėlimo automatika naudoja vietinį OCR, nepriklausomai nuo AI API rakto. |
| 11 | Du OCR masteliai | Sujungiami 2000 ir 1400 px ilgio skaitymo bandymai. |
| 12 | Užrašų dydžio metaduomenys | Išsaugomi plotis ir aukštis, naudojami artumo patikroms. |
| 13 | Atskiri žodžiai ir eilutės | Neleidžiama prarasti vienos eilutės fragmentų. |
| 14 | Skaitmenų pasitikėjimo slenkstis | Griežti skaitmeniniai požymiai priimami nuo 35; tekstui lieka 55. |
| 15 | Kadastrinių numerių formatas | Patalpų numeriai atskiriami nuo plotų ir aukščio matmenų. |
| 16 | Unicode brūkšnių normalizacija | En/em/minus brūkšniai numeriuose suvienodinami. |
| 17 | OCR numerio fragmentų sujungimas | Greta esantys 1- ir 10 sujungiami pagal padėtį. |
| 18 | OCR pasikartojimų pašalinimas | Tas pats numeris arti to paties taško neskaičiuojamas du kartus. |
| 19 | Numerių dviprasmybių išlaikymas | Tas pats numeris skirtingose vietose neištrinamas tyliai. |
| 20 | Numerio ir ploto pora | Skaičius po patalpos numeriu siejamas pagal atstumą ir padėtį. |
| 21 | Dešimtainių kablelių apdorojimas | Kablelis ir taškas priimami kaip dešimtainis skirtukas. |
| 22 | Prarasto taško hipotezė | 432 gali siūlyti 4,32 tik su aiškia taisymo žyma ir geometriniu palyginimu. |
| 23 | Skirtingų plotų hipotezių išlaikymas | Abiejų OCR bandymų reikšmės tikrinamos pagal bendrą mastelį. |
| 24 | Plotų geometrinis neatitikimas | >15% skirtumas pažymimas; klaidingas plotas neįrašomas kaip patvirtintas. |
| 25 | Plonų sienų režimas | Ilgos horizontalios ir vertikalios linijos išsaugomos nepriklausomai nuo storio. |
| 26 | Trumpų baldų linijų filtravimas | Smulkūs neprijungti komponentai atmetami prieš kontūrus. |
| 27 | Konstrukcinių komponentų dydis | Skaitmenų pabraukimai nelaikomi sienomis. |
| 28 | Šeši angų uždarymo bandymai | Išbandomi 16, 24, 28, 32, 40 ir 48 px tarpai. |
| 29 | Variantų vertinimas pagal numerius | Pirmenybė teikiama variantui su daugiau atskirtų numerių. |
| 30 | Sujungtų patalpų bauda | Kontūras su keliais patalpų numeriais vertinamas prasčiau. |
| 31 | Neatpažintų numerių sąrašas | Rezultate išvardijami praleisti patalpų numeriai. |
| 32 | Nežymėtų didelių sričių patikra | Didelė sritis be numerio neleidžia deklaruoti pilno aptikimo. |
| 33 | Terasos ir balkono išskyrimas | Tr ir kiti aiškūs lauko sričių užrašai tikrinami tarp visų srities užrašų. |
| 34 | Skaičiaus ir kontūrų sutikrinimas | Pilnumas tikrinamas pagal numerius, dublikatus ir sankirtas. |
| 35 | Mastelio konsensusas iš plotų | Reikia bent keturių nepriklausomų patalpų. |
| 36 | Mastelio išskirčių atmetimas | Vienas netinkamas plotas neperrašo viso brėžinio mastelio. |
| 37 | Apytikrio mastelio žyma | Vien iš plotų gautas mastelis lieka nepatvirtintas. |
| 38 | Matmenų paieška prie sienos | Plotis siejamas tik su centruotu užrašu arti patalpos viršaus / apačios. |
| 39 | Matmens ir plotų konsensuso palyginimas | Netinkamos matmens interpretacijos atmetamos. |
| 40 | Du nepriklausomi matmenys | Automatinis kalibravimas reikalauja dviejų skirtingų patalpų matmenų. |
| 41 | Įgaubto pločio apsauga | Įgaubtos patalpos bounding box plotis nenaudojamas matmeniui kalibruoti. |
| 42 | Automatinė pastato srities riba | Patalpų sąjunga su sienų tarpais sudaro preliminarų kontūrą. |
| 43 | Pastato ribos validacija | Tikrinamas poligonas ir visų patalpų įtraukimas. |
| 44 | Automatinis startas po įkėlimo | Įkėlus ir pasirinkus Naudoti, užrašai ir ribos apdorojami be papildomų etapų. |
| 45 | Proceso etapų būsena | Rodoma užrašų, sienų, mastelio ir patalpų eiga. |
| 46 | Dvigubo paleidimo apsauga | Antras paspaudimas nekuria lygiagrečių apdorojimų. |
| 47 | Seno atsakymo atmetimas | Keičiant aukštą, projektą ar foną, senas rezultatas neįrašomas. |
| 48 | Atšaukimas neprarandant šaltinio | Atšaukus procesą rezultatas neįrašomas, PDF fonas išlieka. |
| 49 | Jokio išgalvoto HRV / stovo | Tuščias projektas prasideda be fiktyvių įrenginio ir stovo vietų. |
| 50 | Atskira automatinė geometrijos patikra | Saugomas mašininės patikros parašas; nežinomos paskirtys vis tiek stabdo ventiliacijos parinkimą. |
