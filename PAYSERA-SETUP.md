# VENT IT / UAB „Gedventa“ — Paysera Checkout aktyvavimas

Paruošta 2026-10-01. Integracija: Checkout Classic 1.8. Tikri kortelių mokėjimai dar neaktyvūs. IBAN matematinė kontrolinė suma teisinga; sąskaitos nuosavybę ir projekto aktyvumą patvirtina Paysera.

## Įmonė ir projekto duomenys

- Pardavėjas: UAB „Gedventa“, kodas 303314094, PVM LT100010636410.
- Adresas: Ilgalaukio g. 7-2, LT-02119 Vilnius, Lietuva.
- Telefonas: +370 673 32898.
- Parduotuvės kontaktas: sales@vent.it.com — prieš teikiant projektą patvirtinti, kad ši pašto dėžutė priima laiškus.
- Sąskaita: LT623500010003761644, EVIULT2VXXX, PAYSERA LT UAB, Lietuva.
- Projekto pavadinimas: VENT IT — vėdinimo įranga.
- Šiuo metu patikrintas svetainės adresas: https://vent-it-com.onrender.com
- Prekių aprašymas: „Prekiaujame rekuperatoriais, ortakiais, difuzoriais, filtrais ir vėdinimo sistemos priedais. Planavimo įrankis pateikia pavyzdinį ventiliacijos planą ir preliminarią komplektaciją. Prieš mokėjimą individualiai patvirtiname prekių prieinamumą, galutinę kainą su taikomais mokesčiais, pristatymo kainą ir terminą. Mokėjimas atliekamas tik už patvirtintą pasiūlymą.“
- Sąlygos: https://vent-it-com.onrender.com/terms.html
- Privatumas: https://vent-it-com.onrender.com/privacy.html
- Pristatymas: https://vent-it-com.onrender.com/shipping.html
- Grąžinimas: https://vent-it-com.onrender.com/returns.html

Domeno vent.it.com dar nenaudoti projekto callback / grįžimo adresams, kol nepatvirtintas DNS, HTTPS ir pasiekiamumas. Patvirtinus domeną, atnaujinti projektą ir jo svetainės nuosavybės žymą.

## Kas dar trūksta

1. Gedventa verslo paskyroje užsakyta internetinių įmokų surinkimo paslauga.
2. Sukurtas ir Paysera patvirtintas Checkout Classic projektas šiai parduotuvei.
3. Projekto ID ir slaptažodis. Slaptažodžio nesiųsti pokalbyje, neįrašyti į Git ar viešą site_settings lentelę.
4. Paysera pateikta svetainės nuosavybės patvirtinimo žyma, įrašyta į index.html head.
5. Projekte aktyvuotas mokėjimo kortelėmis surinkimas ir patvirtintos pasirinktos šalys / valiuta EUR.
6. Projekte įjungtas Allow test payments ir patikrintas visas testinio mokėjimo ciklas.
7. Patikrintas realus pavedimas, patvirtintas paslaugos aktyvumas ir tik tada įjungtas parduotuvės kortelių mokėjimo nustatymas.

## Kur suvesti slaptus duomenis

Supabase VENT projekto Edge Functions → Secrets:
https://supabase.com/dashboard/project/fihyzcabvrndsztlsufg/functions/secrets

- PAYSERA_PROJECT_ID: iš projekto nustatymų.
- PAYSERA_PROJECT_PASSWORD: projekto slaptažodis.
- PAYSERA_TEST: `true` testams; `false` tik po patvirtinto testavimo ir Paysera aktyvavimo.

Jei PAYSERA_TEST nėra, integracija visada naudoja testavimo režimą.

## Paruošti adresai

Callback (viešas, pasirašyti Paysera GET arba form POST pranešimai):
https://fihyzcabvrndsztlsufg.supabase.co/functions/v1/paysera-callback

Mokėjimo nuorodų kūrimas:
https://fihyzcabvrndsztlsufg.supabase.co/functions/v1/create-paysera-checkout

Grįžimas po mokėjimo: generuojamas serveryje, patikrintas parduotuvės adresas + `/order-success.html?provider=paysera&order=...&status_token=...`.
Atšaukimas: patikrintas parduotuvės adresas + `/#cart`.
Paysera paprastai gauna šiuos adresus kiekviename pasirašytame mokėjimo prašyme; jų nereikia rankiniu būdu susikurti su tikru užsakymo numeriu.

## Testavimo ir paleidimo tvarka

1. Įrašyti projekto secrets; PAYSERA_TEST=true.
2. Sukurti testinę užklausą su tikru katalogo SKU.
3. Prisijungti prie admin.html kaip leidžiamam administratoriui. Patvirtinti galutinį pristatymą, mokesčių pastabą ir tiekėjo patvirtintą terminą. Sugeneruoti Paysera nuorodą. Testinis režimas aiškiai pažymėtas pranešimu.
4. Atlikti Paysera testinį mokėjimą. Callback turi grąžinti tik OK. Užsakymo metadata turi paysera_test_completed=true, tačiau status nėra paid. Grįžimo puslapis turi rodyti, kad tikri pinigai negauti.
5. Atšaukti kitą testinį mokėjimą: užsakymas lieka neapmokėtas.
6. Patikrinti neprisijungusio lankytojo statuso užklausą: neteisingas status_token neduoda užsakymo informacijos.
7. Patvirtinus Paysera projektą ir kortelių paslaugą, nustatyti PAYSERA_TEST=false; commerce.payment_provider=paysera ir commerce.accept_card_payments=true.
8. Su savininku atlikti mažos sumos tikrą mokėjimą ir patikrinti įplauką Paysera paskyroje, pasirašytą callback, užsakymo paid būseną ir grąžinimo eigą. Testo metu nesiųsti prekių automatiškai.

## Saugumo ir komerciniai apribojimai

- Tik serveris pasirašo užsakymą; suma perskaičiuojama iš išsaugotų užsakymo eilučių ir galutinio pristatymo.
- Be patvirtinto mokestinio režimo mokėjimo nuoroda nekuriama.
- Classic protokolo SS1 MD5 tikrinamas pagal oficialią specifikaciją, kartu tikrinant projektą, sumą, valiutą ir testavimo aplinką.
- Tik status=1 pažymi apmokėjimą. Status=3 papildoma mokėtojo informacija nepaverčia neapmokėto užsakymo apmokėtu.
- Grįžimas į svetainę nėra mokėjimo įrodymas. Būsena rodoma pagal patikrintą serverio callback.
- Testinis callback nepaverčia užsakymo tikru apmokėjimu.
- Daliniai kiekiai (pvz., 1,5 m) kol kas reikalauja individualaus pasiūlymo; automatinis mokėjimas tokioms eilutėms blokuojamas.
- Paysera sutarties / komisinių sąlygų savininko vardu nepriėmėme.

Oficialūs šaltiniai:
https://developers.paysera.com/guides/checkout-classic/getting-started/making-your-first-payment/custom-integration
https://developers.paysera.com/guides/checkout-classic/getting-started/making-your-first-payment/processing-callback
https://developers.paysera.com/guides/checkout-classic/getting-started/request-parameters
https://www.paysera.lt/v2/lt-LT/blog/sukurti-imoku-surinkimo-projekta
