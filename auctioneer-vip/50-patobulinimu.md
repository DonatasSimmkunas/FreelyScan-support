# 50 būdų pagerinti Auctioneer VIP

Tai siūlomi kiti etapai. Jie nėra visi įdiegti dabartiniame modulyje. Pirmiausia verta sutvarkyti duomenų kokybę, tada plėsti palyginimą ir komandos darbą.

## Duomenų kokybė

1. **Įmonės statuso patikra.** Dabartiniame faile visos 4 500 `is_business` reikšmių yra 0. Teisinę formą saugoti atskirai ir patvirtinti iš patikimo šaltinio.
2. **Trūkstamų kainų eilė.** Atskirai peržiūrėti 1 024 įrašus be skaitinio įkainio; nepaversti jų nuliais.
3. **Kontaktų papildymas.** Darbo eilė 373 įrašams be telefono ir 4 335 be el. pašto, pažymint patikros šaltinį.
4. **Vienodas telefono formatas.** Išsaugoti originalą ir papildomai turėti normalizuotą numerį paieškai bei skambučiams.
5. **Pasikartojančių kontaktų aptikimas.** Sugrupuoti bendrą telefoną ar profilį turinčius įrašus, nepašalinant skirtingų paslaugų.
6. **Pasikartojančių įmonių sujungimas.** Žmogui patvirtinus sujungti skirtingas rašybos formas į vieną teikėjo kortelę.
7. **Vienetų normalizavimas.** Vieningai saugoti valandą, m², m³ ir kitas paslaugos matavimo kategorijas.
8. **Kainos pobūdžio laukas.** Atskirti fiksuotą kainą, „nuo“, intervalą ir kainą pagal susitarimą.
9. **PVM žyma.** Atskirti kainas su PVM, be PVM ir tas, kurių mokestinė sudėtis nenurodyta.
10. **Duomenų patikros data.** Kiekvienai kainai ir kontaktui parodyti, kada jis paskutinį kartą patikrintas; nevadinti importo datos patikros data.

## Paieška ir teritorijos

11. **Kelių teritorijų pasirinkimas.** Vienu metu ieškoti, pavyzdžiui, Vilniuje ir Trakų rajone.
12. **Apskričių filtras.** Susieti miestus ir savivaldybes su apskritimis pagal patvirtintą vietovių sąrašą.
13. **Paieška pagal objektą.** Įvedus darbų vietą skaičiuoti apytikrį atstumą iki patvirtintos teikėjo vietos.
14. **Aptarnavimo teritorijų žemėlapis.** Rodyti šaltinio spindulį atskirai nuo tiksliai patvirtintos aptarnavimo zonos.
15. **Atvykimo mokestis.** Atskirai rodyti kelionės kainą, nemokamo atvykimo ribas ir minimalų užsakymą.
16. **Kategorijų hierarchija.** 321 užpildytą paslaugų kategoriją sujungti į aiškias grupes ir pogrupius.
17. **Sinonimų paieška.** „Santechnikas“, „vamzdynai“ ir panašūs terminai galėtų rasti susijusias paslaugas.
18. **Rašybos klaidų toleravimas.** Siūlyti artimą pavadinimą, kai tiksli paieška nieko neranda.
19. **Paieškos šablonai.** Išsaugoti dažnas užklausas, pavyzdžiui, „elektrikai Kaune iki 30 €/val.“.
20. **Paaiškinimas, kodėl rastas įrašas.** Parodyti atitikusį lauką ir pažymėti paieškos tekstą.

## Kainų ir teikėjų palyginimas

21. **Kelių teikėjų palyginimas.** Greta parodyti pasirinktų 2–5 teikėjų kainas, teritorijas, patirtį ir kontaktus.
22. **Vienodo darbo sąmata.** Įvedus valandų, ploto ar tūrio kiekį skaičiuoti bendrą kainą tik tos pačios paslaugos ir vieneto įrašams.
23. **Visos užsakymo išlaidos.** Prie darbų kainos pridėti patvirtintas medžiagų, transporto ir minimalaus užsakymo išlaidas.
24. **Vietos kainų mediana.** Rodyti palyginamos kategorijos, vieneto ir teritorijos kainų medianą bei imties dydį.
25. **Neįprastų įkainių žymėjimas.** Labai mažus ar didelius įkainius nukreipti peržiūrai, jų automatiškai netaisyti.
26. **Kainos pokyčių istorija.** Saugoti ankstesnius įkainius ir pakeitimo datą.
27. **Patikimumas pagal atsiliepimų kiekį.** Greta balo rodyti imties dydį, kad vienas penketas neatrodytų toks pats kaip šimtas įvertinimų.
28. **Pasirenkami rūšiavimo prioritetai.** Leisti vartotojui nustatyti, ar svarbesnė kaina, patirtis, atstumas, ar atsiliepimai.
29. **Prieinamumo kalendorius.** Saugoti paties teikėjo patvirtintą darbų pradžios datą.
30. **Patikrintų paslaugų žyma.** Atskirti importuotą reklamą nuo realiai patvirtintos paslaugos ir jos apimties.

## Darbas su kontaktais

31. **Mėgstami teikėjai.** Išsaugoti kontaktus privačiame arba komandos sąraše.
32. **Sąrašai pagal projektą.** Atskiros atrankos renovacijai, aplinkos darbams ar kitam konkrečiam objektui.
33. **Privačios pastabos.** Prie kontakto saugoti susitarimus, darbo kokybės pastabas ir svarbias detales.
34. **Skambučio rezultatas.** Rankiniu būdu pažymėti „susisiekta“, „neatsiliepė“, „laukia atsakymo“.
35. **Pasiūlymų registras.** Įrašyti gautą kainą, terminą, apimtį ir pasiūlymo galiojimą.
36. **Sutartų darbų būsena.** Matyti, kurie teikėjai atrinkti, samdomi, dirba arba jau baigė darbus.
37. **Priminti apie kitą veiksmą.** Pasirinktam kontaktui nustatyti priminimo datą ir užduotį.
38. **Ribotas atrankos eksportas.** Eksportuoti tik pasirinktus laukus ir filtruotus įrašus, pagal vartotojo teises.
39. **Spausdinama atranka.** Paruošti tvarkingą PDF su keliais atrinktais kontaktais ir pasiūlymais.
40. **Kontaktų taisymo pasiūlymai.** Komandos narys pateikia pataisą, administratorius ją patvirtina, originalas lieka istorijoje.

## Prieiga, priežiūra ir patogumas

41. **Atskiros vartotojų paskyros.** Bendrą prisijungimą pakeisti asmeninėmis paskyromis su galimybe atšaukti vieno žmogaus prieigą.
42. **Dviejų žingsnių prisijungimas.** Administratoriui ir eksportuoti galintiems vartotojams pridėti papildomą patvirtinimą.
43. **Vartotojų rolės.** Atskirti žiūrėjimą, redagavimą, eksportą ir administravimą.
44. **Prisijungimų istorija.** Rodyti sėkmingus bei nesėkmingus bandymus ir leisti užbaigti aktyvias sesijas.
45. **Pakeitimų žurnalas.** Fiksuoti, kas pakeitė kainą, kontaktą, teritoriją ar pastabą, išsaugant ankstesnę reikšmę.
46. **Excel importo peržiūra.** Prieš atnaujinimą parodyti naujus, pakeistus, dingusius ir klaidingus įrašus.
47. **Duomenų versijos ir atkūrimas.** Turėti atskiras patikrintas importo versijas ir galimybę grįžti į ankstesnę.
48. **Klaviatūros valdymas.** Paieškos atidarymas klavišu, rezultatų naršymas rodyklėmis ir greitas numerio kopijavimas.
49. **Patogumo režimai.** Pasirenkamas teksto dydis, didesnis kontrastas ir kompaktiškas arba erdvus rezultatų vaizdas.
50. **Patikimesnė muzikos prieiga.** Jei turėsite teisę naudoti garso failą, pridėti jį kaip tiesioginį takelį, kad grojimas nepriklausytų nuo „YouTube“ įterpimo, reklamų ar regioninių ribojimų.

## Siūloma pirmųjų darbų eilė

Pirmiausia: 1–5 ir 10 (duomenų kokybė), 21–24 (palyginimas), 31–35 (kontaktų darbas), 41–47 (komandos prieiga ir saugūs atnaujinimai).

Skaičiai apskaičiuoti iš pateikto `rezultatai.xlsx`. „Vietovė“ šiame etape reiškia originalios teritorijos tekstą iki pirmojo kablelio; tai nėra patvirtinta geografinė koordinatė.
