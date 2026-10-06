# Telkinys V14 beta — darbų ir paleidimo būklė

Atnaujinta: 2026-10-06. Tai įgyvendintos beta kandidatės perdavimo dokumentas, ne teiginys, kad visas produktas paruoštas 100 %.

## Aplinkos ir saugus tęstinumas

- Nauja serverį naudojanti beta: https://telkinys-v14-beta.onrender.com
- Saugykla: DonatasSimmkunas/FreelyScan-support.
- Darbo šaka: telkinys-v14-readiness.
- Sąsajos šaltiniai: telkinys-v14/; sugeneruotas failas: telkinys-deploy/index.html šioje darbo šakoje.
- Render beta servisas: srv-db29gbbbc2fs73fpje90; workspace tea-daqolg6gekts739eno7g.
- Patikrintas beta leidimas: dep-db29gbjbc2fs73fpjen0, būsena live, commit 052bc837c2da5fea265ba398c2b9c5f15c3a1cb9.
- Beta surinkimas: node telkinys-v14/build.mjs; publikuojamas dist.
- Serveris: Floot projektas 5b325205-4684-4080-b798-7236728d2e1a, https://telkinys.floot.app/_api/telkinys.
- Floot paskelbtas sėkmingai, job 16590765-5536-47c8-aa9d-3a8a2c798023. Senasis Floot V9 pradinis puslapis nepakeistas; beta sąsaja yra Render adresu.
- Serverio atkūrimo taškas: 12b194d1-5069-4565-ab39-20a64b0bac05. Floot checkpoint grąžina kodą / konfigūraciją, NE duomenų bazės įrašus ar failus.

**Viešas telkinys.lt nepakeistas:** Render srv-dat11qg473hc73e9vj10, šaka telkinys-vercel-staging, commit f97e9321191b132709fa980760aa078ab6f7eaf4. Jo build vis dar kopijuoja V13 telkinys-deploy/index.html. Naujos beta nesujungti į šią šaką, kol nepravažiuoti žemiau nurodyti priėmimo kriterijai.

Aptikta atskira vietinio prototipo šaka telkinys-v14-preview ir jos Render servisas. Šio darbo metu ji nebuvo pakeista. Nepainioti jos su telkinys-v14-readiness / telkinys-v14-beta.

## Kas įgyvendinta kode ir prijungta prie duomenų modelio

- Atskira privati telkinys schema Floot valdomame Postgres; kitų projektų duomenų bazės nenaudotos.
- Kvietimų paskyros, slaptažodžių maišos, ribotos trukmės sesijos, vienkartiniai atkūrimo kodai ir paskyros duomenų eksportas / pašalinimas.
- Skelbimų juodraščiai, savininko teisės, versijos konfliktų tikrinimas, peržiūros eilė, publikavimas, sustabdymas ir užbaigimas.
- Nuotraukų įkėlimo rezervavimas privačioje saugykloje, formato ir dydžio patikra, serverinis WebP konvertavimas be EXIF metaduomenų; skelbime iki 6 nuotraukų.
- Griežtos paieškos kategorijos, miestai, kainos ribos ir jų vienetai, kambariai, aukštas, automobilio metai / rida / markė. Nėra atsarginio nesusijusių pavyzdžių sąrašo.
- Paskyroje išsaugomi favoritai bei paieškos; laikinas vienodos kategorijos ir kainos vieneto palyginimas.
- Privatūs dalyvių pokalbiai, žinučių pakartotinio siuntimo apsauga, neperskaitytų žinučių skaičius, blokavimas ir pranešimas moderatoriui.
- Susitikimo pasiūlymai, kitos pusės patvirtinimas, laiko konfliktų patikros kodas ir ICS eksportas.
- Abiejų pokalbio pusių pažymėto užbaigto bendravimo atsiliepimai. Tai nėra nepriklausomas sandorio / mokėjimo patvirtinimas.
- Moderavimo centras, skelbimų peržiūra, konkrečiai praneštų pokalbių prieigos žurnalas, pagalbos užklausos ir vartotojų blokavimas.
- Supaprastintas mobilus ir kompiuterio vaizdas, teksto atvaizdavimas per DOM tekstinius laukus, su turinio maišomis sudaryta CSP.
- Atskiri skelbimų query adresai, puslapių antraštės ir bendri metaduomenys. Beta pažymėta noindex; pilnas serverinis skelbimų SEO / indeksavimas dar nėra baigtas.
- Privatumo, naudojimo ir pagalbos puslapių beta projektai su tikrų operatoriaus kontaktų nustatymu administravime.

Šis sąrašas reiškia parašytą ir prijungtą įgyvendinimą. Jis NEREIŠKIA, kad kiekvienas serverinis scenarijus jau išbandytas su tikrais vartotojais.

## Patikrų įrodymai ir ribos

1. Floot helpers/telkinysSearch.spec.tsx: 15 atskirų paieškos atvejų; testų failas praėjo. Tikrina kainos lubas, kategoriją, markę, metus, ridą, aukštą, diakritiką, klaidingą intervalą ir kainos vienetus.
2. GitHub Actions workflow Telkinys V14 validation, run 37424832158: completed / success. Tikrina visų 8 JS modulių ir rinkinio sintaksę, draudžiamus HTML atvaizdavimo būdus, surenka kandidatę.
3. Offline Chromium komponentų patikra: 45 / 45, naudojant sintetinius API atsakymus ir 1440, 390, 360 px pločius. Patikrintose būsenose nėra JS išimčių ar horizontalaus viso puslapio perpildymo. Tai NĖRA tikras API integracinis ar naršymo testas.
4. Serverio dev API health ir griežtos Audi paieškos užklausos: HTTP 200. Be sesijos atlikta me užklausa: HTTP 401. Leidžiamai kilmei grąžintas CORS antraštės atsakymas.
5. Publikuotos beta neprisijungusio lankytojo patikra: pradinis, paieška, apie, privatumas, taisyklės, prisijungimas, registracijos ekranas ir įkėlimo prieigos reikalavimas atsidaro. Audi iki 10 000 € grąžina 0 tikrų rezultatų ir atpažintus kriterijus. TinyFish run ae989066-a551-420a-9ea0-06403babb363 completed. Šis įrankis negalėjo patikrinti viewport dydžių ar pateikti atskiro konsolės žurnalo; rezultatą laikyti navigacijos / matomų būsenų patikra, ne išsamiu JS / tinklo auditu.
6. Render patvirtinta live beta bei nepakeistas live V13.

**Neatliktas visas dviejų tikrų paskyrų bandymas.** Jo automatizuotas vykdymas buvo blokuotas įrankio saugos patikroje prieš vykdymą. Registracijos, kito vartotojo prieigos neigimo, tikro failų įkėlimo, susirašinėjimo, atsiliepimų ir atkūrimo eigų nelaikyti sertifikuotomis ar galutinai patvirtintomis vien dėl parašyto kodo.

## Prieigos perdavimas savininkui

Sukurtas vienkartinis 72 val. administratoriaus registracijos kvietimas. Jo kodas perduotas tik privačiame pokalbio faile, saugykloje ir šiame dokumente jo NĖRA. Galiojimo pabaiga: 2026-10-09 09:50 Lietuvos laiku. Slaptažodį pasirenka pats savininkas. Atkūrimo kodą būtina saugoti privačiai.

Prieš kitų dalyvių kvietimą administravimo ekrane reikalaujama tikrų operatoriaus rekvizitų ir žmogaus patvirtinimo, kad jis peržiūrėjo beta privatumo informaciją. Tai nepakeičia teisinės peržiūros ir negarantuoja atitikties.

## Kas dar nebaigta — paleidimo kliūtys

- Pilna realių paskyrų, savininko teisių, privačių pokalbių, failų, sesijų ir atkūrimo integracinė patikra.
- Automatinės atsarginės kopijos, dokumentuotas atkūrimo bandymas, duomenų / failų saugojimo terminai ir stebėsena. Vien lentelė backups nėra veikianti atsarginių kopijų sistema.
- Fizinis failų valymas: duomenų trynimo trigeris įrašo darbus į media_cleanup, o telkinysMedia.cleanup aprašo vykdymą. Tačiau grafikas ir operatoriaus paleidimo mygtukas NEPRIJUNGTI. Iki jų įjungimo nepažadėti fizinio išvalymo termino. Vieša prieiga per API nutraukiama, jau išduota privati nuoroda galioja iki 60 s.
- Floot free plane automatinėms platformos užduotims reikia mokamo plano. Plano nekeista, automatinių užduočių grafikas nepaskelbtas.
- Mokėjimų, pinigų išmokėjimų, KYC / KYB, AI modelio, automatinio el. pašto bei nuosavos pašto dėžutės paslaugos NEĮJUNGTOS.
- Tikros geografinių koordinačių ir žemėlapio integracijos nėra; pateikiama tik nuoroda į nurodytą vietovę.
- Pilnas indeksuojamų skelbimų SEO, išorinės parduotuvių kainų integracijos ir paklausos radaras nebaigti.
- Realūs operatoriaus kontaktai, tvarkytojų sutartys ir taikytinos teisinės pareigos turi būti patvirtinti operatoriaus. Rekvizitai nebuvo išgalvoti.
- Nėra apkrovos bandymo, nepriklausomo saugumo audito ar visų pagalbinių technologijų prieinamumo patikros.
- Katalogas sąmoningai tuščias; reikia tikrų pasiūlymų ir dalyvių. Demonstraciniai duomenys nėra reali pasiūla.

## Kelias į viešą MVP

Pirma užbaigti realių dviejų dalyvių kelią: paskyra → skelbimas ir nuotrauka → moderatoriaus patvirtinimas → kitos paskyros paieška → žinutė ir atsakymas → paskyros duomenų išsaugojimas kitame įrenginyje. Patikrinti, kad svetimo įrašo ar pokalbio pasiekti negalima. Tada įjungti ir išbandyti priežiūrą / atkūrimą, patvirtinti operatoriaus dokumentus ir tik tuomet priimti sprendimą dėl pagrindinio domeno. Mokėjimus ir kitus papildomus produktus vertinti pagal atskirus priėmimo kriterijus.

## Serverio kodo vietos tęsimui

Floot helpers: telkinysCore.tsx, telkinysSearch.tsx, telkinysListings.tsx, telkinysMedia.tsx, telkinysCommunity.tsx, telkinysAdmin.tsx, telkinysApi.tsx; testas telkinysSearch.spec.tsx. Endpoints: telkinys_GET.ts, telkinys_POST.ts, telkinys-image_GET.ts ir jų schemos. Bendrieji _realtime token/send/lastseen endpointai užrakinti; naudoti tik autentifikuotą Telkinio kanalą.

Svarbu: vien sąsajos ZIP ar GitHub commit nėra Floot duomenų bazės, failų ir viso serverio atsarginė kopija. Duomenų schema ir serverio kodas šiuo metu valdomi nurodytame Floot projekte.
