# Telkinys V15 — poreikiai, pasiūlymai ir susitarimai

## Šio leidimo apimtis

V15 yra kitas patvirtinto tobulinimo plano etapas, o ne visų verslo, teisinių ir integracijų darbų užbaigimas.

- Pagrindiniame puslapyje paieška pateikiama prieš ilgesnius paaiškinimus. Paieškos rezultatuose didelė įžanga nebekartojama.
- Pirminė forma trumpesnė; papildomi filtrai išskleidžiami. Daiktai ir prekių pasiūlymai sujungti lankytojo paieškoje, išlaikant ankstesnių įrašų suderinamumą.
- Tuščias rezultatas turi kelią į paslaugos poreikį, kvietimo prašymą arba kriterijų tikslinimą. Nėra išgalvotų skelbimų ar tiekėjų skaičių.
- Poreikio juodraštis, moderatoriaus peržiūra, pagal paslaugą ir miestą parinkta specialistų auditorija. Pirmojo bandymo paslaugos: pervežimas, valymas, baldų surinkimas.
- Specialisto pasirenkamos paslaugos, aptarnaujami miestai ir naujų užklausų priėmimas. Tai specialisto deklaracija, ne nepriklausoma patikra ar garantuotas prieinamumas.
- Iki penkių tuo metu galiojančių pasiūlymų vienam poreikiui. Struktūruota visa suma, įskaičiuoti darbai, išimtys, laikas ir galiojimas. Specialistai nemato kitų specialistų kainų.
- Privatus poreikio autoriaus ir konkretaus specialisto aptarimas, žinučių dubliavimo apsauga, paskyros pranešimai ir rankinis atnaujinimas.
- Pasirinkus pasiūlymą užfiksuojama nekeičiama sąlygų kopija. Specialistas patvirtina atskirai; užbaigimą kiekviena pusė pažymi pati. Tai nėra mokėjimo ar paslaugos kokybės patvirtinimas.
- Kvietimų prašymai ir pagalba pasiekiami neprisijungus. El. pašto ir telefono nereikalaujama. Atsakymas pasiekiamas tik su atsitiktiniu privačiu kodu; kodas neperduodamas URL, DB saugoma jo maiša. Prieiga galioja 30 dienų.
- Administratorius gali atsakyti į viešas užklausas, peržiūrėti poreikius ir matyti realius poreikių bandymo rodiklius. Paskyros eksportas papildytas V15 duomenimis.
- Pridėti rankiniai jau numatytų ir išlauktų failų valymo bei pasibaigusių pagalbos užklausų pašalinimo veiksmai. Automatinis grafikas neįjungtas.
- Paieška neišmeta produkto modelio ir talpos skaičių (pvz., iPhone 15 Pro 256 GB), skiria 15 nuo 115, supranta €/val. ir €/h. Kainos rikiavimas nebepriverčia visų įkainių tapti visa suma; nesant pasirinkto vieneto rodoma aiški pastaba.

## Patikrų įrodymai

- Floot: 26 paieškos atvejai dviejuose spec failuose; abu failai praėjo.
- Dev API: tikri laikini paskyrų, kvietimų, poreikio, pasiūlymo, žinutės ir susitarimo įrašai. Tęstiniame bandyme 29 patikros praėjo. Šis skaičius apima HTTP būsenų patikras, ne 29 atskirus pilnus scenarijus. Patikrintas prieigos atskyrimas, dubliavimas, sąlygų nekintamumas, atskiras abiejų pusių patvirtinimas, atšaukimo / atsiėmimo ribos ir eksportas.
- Testiniai duomenys pašalinti per execute_sql; po valymo vartotojų, poreikių ir anoniminių užklausų skaičiai buvo 0. Tikras savininko registracijos kvietimas nepanaudotas.
- Offline Chromium: 76/76 komponentų ir formų patikrų praėjo. Pločiai 360, 390, 768 ir 1440 px. Neaptikta neapdorotų JS išimčių ir horizontalaus viso puslapio perpildymo tikrintose būsenose. Tikrintas teksto, o ne HTML, atvaizdavimas.
- Offline UI patikra naudojo sintetinius API atsakymus ir page.set_content, nes vietinėje naršyklėje išorinė navigacija blokuojama. Tai nėra tikro serverio integracinis ar domeno navigacijos bandymas. UUID testinė aplinka atskirai užpildyta tik testo puslapyje; produkcinė CSP nepakeista.
- GitHub Actions Telkinys V15 validation, run 37530819221: completed / success. Visi 12 scenarijų modulių ir bendras rinkinys praėjo sintaksės patikrą. Template kontrolės ir CSP maišos sudaromos kiekvieną kartą.
- Sukurto HTML SHA-256: 7b1737cd2eab1b94d29bd801676c2cfd25cb5cf2b3373fce59f2c306109b73f0; 144418 baitų. Viešo domeno publikavimo patikra įrašoma atskirai po realaus leidimo.

## Kur tęsti

GitHub repo DonatasSimmkunas/FreelyScan-support. Darbinė šaka telkinys-v15-work. Nauji sąsajos moduliai telkinys-v15/, išsaugoti ankstesni telkinys-v14/ moduliai. Surinkimas: node telkinys-v15/build.mjs --write-deployment-artifact. Render beta komandai išlikęs telkinys-v14/build.mjs yra suderinamumo nukreipimas.

Pagrindinis Render servisas srv-dat11qg473hc73e9vj10, produkcinė šaka telkinys-vercel-staging, kopijuojamas telkinys-deploy/index.html. Esamas beta servisas srv-db29gbbbc2fs73fpje90, šaka telkinys-v14-readiness; jis pernaudojamas V15 peržiūrai. Senasis localStorage prototipas telkinys-v14-preview nėra dabartinio produkto šaltinis.

Serveris: Floot projektas 5b325205-4684-4080-b798-7236728d2e1a. API https://telkinys.floot.app/_api/telkinys. Nauji helpers telkinysAccess, telkinysNeeds; papildyti telkinysApi, telkinysSearch, telkinysListings. Privati telkinys schema, šešios naujos v15_* lentelės. Serverio kodo checkpoint e34c413b-7611-4b9d-8240-dc0cf05d84c8. Jis nėra DB atsarginė kopija. Pagrindinis Floot V9 puslapis nenaudojamas kaip produkto sąsaja.

## Neužbaigta ir ko nežadėti

Reikia tikrų operatoriaus rekvizitų bei taikytinų dokumentų teisinės peržiūros, realių specialistų ir klientų pritraukimo, el. pašto siuntimo domeno / paskyros atkūrimo el. paštu, automatinių atsarginių kopijų bei atkūrimo bandymo, tikrai atskiros testinės DB, automatinio priežiūros grafiko, išplėsto apkrovos bei saugumo audito, serverinio indeksuojamų skelbimų SEO. Noindex ir beta ribos paliktos. AI, mokėjimai, KYC, kainų agregavimas ir pilni visų šešių rinkų projektai neįjungti. Plano atnaujinimų ar mokamų paslaugų neužsakyta.

Tai veikiantis siauresnis produkto etapas, ne teiginys apie 100% paruoštą prekyvietę. Išlaikytas kelias grįžti prie V14 sąsajos; naujas DB lenteles atkuriant sąsają palikti, o ne naikinti jau gautus duomenis.
