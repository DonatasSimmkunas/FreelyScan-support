# V16 patvirtinta telkinys.lt domene

2026-10-08. Savininkui paprašius atnaujinta produkcinė svetainė.

## Publikavimo įrodymai

Produkcijos šaka telkinys-vercel-staging perkelta ne priverstinai, su ankstesnio head patikra iš 51b31204f3ef2be0c6f5a00bb49d02433705fd21 į 6438d8eea79da7649ecddf1d5fc39b9f76f149ed.
Render srv-dat11qg473hc73e9vj10; švarus surinkimas dep-db3sjifavr4c73b1eong; status live; baigta 2026-10-08T16:50:41.757834Z.
Backend Floot job d9caa654-6fc1-49b5-b8f9-2ff44f45eb48 succeeded.

Po publikavimo tiesioginis GET https://telkinys.lt/ grąžino HTTP200, meta application-version16.0.0-beta,166726baitus ir SHA256 a52307bf7d681da8859aa0abc45210a812bc97c429fdd02bd90b2de8d1d29b51.
GET https://www.telkinys.lt/ nukreipė į https://telkinys.lt/ ir grąžino tuos pačius baitus bei maišą.
Viešas backend health: HTTP200,ok:true,version16.0.0-beta,Access-Control-Allow-Origin https://telkinys.lt.

## Gyva neprisijungusio lankytojo naršyklė

Firecrawl sesija01a11c6c-ed96-73e1-91ce-9e580d9a0c05. Atidarytas pagrindinis /, patvirtinta V16, tikras API tuščias katalogas ir naujasis poreikių procesas. Senojo grafinio bloko .lake-stage/.lake-source/.stream-map elementų0.
Peržiūrėtas /?view=changes su antrašte V16 · patikimesnis pagrindas.
GET paieška iPhone15Pro256GBiki700EUR grąžino Daiktai ir prekės / iki700EUR /0rezultatų. Didelė pradžios įžanga rezultatuose neberodoma.
Tikras naršyklės viewport390x844. Prisijungimo ekrane vardas ir slaptažodis atvaizduojami kaip input; nėra [object HTML…] teksto. Login ir neprisijungusio security puslapiuose scrollWidth=clientWidth=375. Security puslapis reikalauja prisijungti ir nerodo sesijų.
Naršyklės errors komanda šiame scenarijuje negrąžino neapdorotų klaidų. Tai ribota neprisijungusio vartotojo patikra, ne prisijungusių vartotojų autorizacijos sertifikavimas. Formos nebuvo pateiktos, paskyros ar duomenys nekuriami.

## Šio leidimo funkcijos ir patikros

Pridėtas sesijų valdymas,skelbimų30dienųaktualumas,poreikio dalyvio blokavimas išsaugant susitarimo skaitymą/atšaukimą,nekintamos susitarimo sąlygos ir administratoriaus priežiūros skiltis. Pataisyta senesnė modalų formų klaida. V15 vizualinė kryptis ir poreikis→pasiūlymas→susitarimas procesas išsaugoti.

GitHub daily maintenance .github/workflows/telkinys-maintenance.yml DEFAULT main:kasdien02:17UTC. Trumpalaikė griežtai patikrinta OIDC tapatybė; privačios kopijos saugomos Floot,ne viešuose GitHubprieduose. Automatinis atkūrimas į laikiną atskirą PostgreSQL18.
Tikras sėkmingas run37808756458:27lentelės,1konfigūracijos eilutė,0nuotraukų. Kopija5fa03724-9bfd-4ea6-9cac-4beccecd3ea2,restore_verified_at2026-10-08T16:26:43.399Z. Tai ne pilno užpildyto produkto atkūrimo bandymas. Grafikas best-effort; numatyta14dienųrotacija,saugant paskutinę patikrintą kopiją. Kopijos tebėra tame pačiame paslaugų teikėjuje.

Praėjo26paieškos +10OIDC vienetinių atvejų trijuose Floot testų failuose;13JSmoduliųsintaksė ir10surinkimo regresijų (CI37810570261success);55offlineChromiumUIpatikros320/360/390/768/1440px su sintetiniais APIatsakymais,0klaidų.

AIgpt-6-lunajuodraščioadapteris ir peržiūros sąsaja parengti administratoriaus bandymui. Kiekvienai užklausai būtinas sutikimas,žmogus atskirai peržiūri ir pritaiko tekstą. Dalyviams defaultOFF iki operatoriaus patvirtinimo. Tikro modelio atsakymo ir kelių tikrų paskyrų/nuotraukosE2E bandymas šiame darbe NEATLIKTAS:automatinė writepatikra užblokuota prieš vykdymą ir nebuvo permaršrutuota.

## Ko nevadinti užbaigtu

Operatoriaus rekvizitai ir teisinė peržiūra,patvirtintasel.paštosiuntimas/atkūrimas,mokėjimai/KYC,AIrealausatsakymo priėmimo testas,pilnasvartotojų/nuotraukųE2E,nepriklausomosoffsitekopijos,nuolatinėatskiratestinėaplinka,pilnasindeksuojamųskelbimųSEO,platesnėsapkrovos/saugumo/prieinamumo patikros ir realių klientų/specialistųpasiūla dar lieka.
Dabartinėje DB vartotojų,skelbimų,nuotraukų0. Sąmoningai nėra netikrų pasiūlymų.
Mokami planai neužsakyti,DNSnekeista,originalusadministratoriauskvietimas nepanaudotas. V15atsarginėšaka telkinys-v15-backup-before-v16 išsaugota. GrįžimasprieUI nėra DBatstatymas;naujųduomenųnenaikinti.
Daugiau TELKINYS_V16_RELEASE.md produkciniamecommit6438d8eea79da7649ecddf1d5fc39b9f76f149ed.
