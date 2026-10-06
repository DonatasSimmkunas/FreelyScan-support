# V15 paskelbta pagrindiniame domene

## Publikavimo patvirtinimas

- Produkcinė šaka: telkinys-vercel-staging.
- Commit: 51b31204f3ef2be0c6f5a00bb49d02433705fd21.
- Render servisas: srv-dat11qg473hc73e9vj10.
- Render deploy: dep-db2m7ivavr4c73ejmfq0.
- Render būsena live, finishedAt 2026-10-06T21:10:47.441629Z.
- API serverio publikavimas Floot job c4503b34-6b2f-4cdd-b519-9fbd206e34af succeeded; viešas health patvirtino 15.0.0-beta.

Po Render live patvirtinimo atliktos tiesioginės HTTP patikros:

| Adresas | HTTP | Versija | HTML SHA-256 |
|---|---|---|---|
| https://telkinys.lt/?leidimas=v15 | 200 | 15.0.0-beta | 7b1737cd2eab1b94d29bd801676c2cfd25cb5cf2b3373fce59f2c306109b73f0 |
| https://www.telkinys.lt/?leidimas=v15 | 200, nukreipta į telkinys.lt | 15.0.0-beta | tas pats |
| https://telkinys.onrender.com/ | 200 | 15.0.0-beta | tas pats |

Visais trimis atvejais 144418 baitų ir V15 uždaros beta žyma. Tai identiškas lokaliai patikrintam ir beta aplinkoje pateiktam failui turinys. Prieš publikavimo pabaigą paprastas / adresas dar grąžino V14 kopiją; naujo leidimo užklausos parametras naudotas patikrai, kad nebūtų painiojama su sena talpykla. Papildoma paprasto / patikra po to buvo sustabdyta Floot dienos veiksmų limito, todėl jos nelaikyti įvykdyta.

## Patikrų ribos

Bandomosios svetainės pradinis puslapis užsikrovė gyvoje naršyklėje ir rodė naują sąsają, poreikių / specialistų navigaciją, trumpesnę paiešką, kvietimo prašymą ir sąžiningą tuščio katalogo būseną. Tolimesnius kelių žingsnių naršyklės scenarijus sustabdė įrankio saugos patikra prieš vykdymą. Po produkcinio publikavimo patvirtintas HTTP turinys ir realus API health / paieškos atsakymas; neapsimesti atlikus pilną naujo domeno registracijos ir sandorio naršyklės bandymą.

Prieš publikavimą praėjo 26 paieškos atvejai, 29 tikro dev API patikros su laikinomis paskyromis ir 76 offline UI komponentų / formų patikros su sintetiniais API atsakymais. Daugiau: TELKINYS_V15_RELEASE.md. Sintetinės UI patikros nėra serverio integraciniai bandymai.

V14 atsarginė šaka telkinys-v14-backup-before-v15 išsaugota ties commit 413bfca1452278e7ad3d7dcc9f61b0ffdc4c64fa. DNS, mokami planai ir originalus savininko kvietimas nekeisti. Beta ribos, noindex, registracija su kvietimu ir išjungti mokėjimai / AI / el. paštas išliko.

## Būsena baigus šį etapą

V15 publikuota. Papildomi serverio redagavimo veiksmai šios sesijos pabaigoje pasiekė Floot dienos veiksmų limitą; publikavimas buvo baigtas iki šio pranešimo. Automatinis tolesnis kūrimas nebuvo suplanuotas. Likęs darbų sąrašas ir neįjungtos integracijos aprašyti TELKINYS_V15_RELEASE.md. Operatorius turi pateikti tikrus rekvizitus; jie nebuvo išgalvoti.
