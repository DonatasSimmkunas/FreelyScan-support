# Auctioneer VIP

Papildomas `/vip` modulis esamai `auctioneer.it.com` svetainei. Statinės svetainės `auctioneer-site` šakoje pridedamas tik `auctioneer/vip` aplankas; senieji failai, meniu ir pagrindinis puslapis nekeičiami. Duomenis ir prisijungimą tikrina atskiras Render Node serveris `https://auctioneer-vip.onrender.com`, diegiamas iš `auctioneer-vip` šakos.

2026-09-28 išplėstas katalogas paskelbtas ir patikrintas gyvomis API užklausomis. Toliau aprašyta ir kompaktiškos antraštės sąsaja; tikro mobiliojo įrenginio patikra neatlikta.

## Duomenys ir paieška

- Paslaugų rinkinyje yra **5 217 įrašų**, 122 užpildytos veiklos sritys ir 22 paieškos laukai. 4 387 įrašai turi telefoną, 3 899 — skaitinę kainą.
- Importuotų darbdavių rinkinyje yra **1 504 įmonės ir 4 393 susieti darbo skelbimai**. 1 269 įmonės turi telefoną, 404 — el. paštą. Importų skelbimų dabartinis aktyvumas nepriklausomai nepatvirtintas.
- Iš abiejų importuotų kontaktų rinkinių **5 667 įrašai turi telefoną arba el. paštą**. Tai įrašų, o ne unikalių žmonių ar kontaktinių reikšmių skaičius.
- Atskiros paslaugų ir darbdavių paieškos, laisvas tekstas, veiklos sritis, teritorija, kontaktų buvimas ir papildomos laukų sąlygos su IR / ARBA. Paslaugoms — kainos ribos, vienetas ir aptarnavimo zona; darbdaviams — tipas, kontaktų būsena ir portalas.
- Teritorijų sąrašuose rodomos tik kitus aktyvius filtrus atitinkančios vietovės. Nebetinkama pasirinkta vietovė išvaloma, rezultatai atnaujinami.
- Paslaugoms 8 rūšiavimo būdai, pagal nutylėjimą didėjanti kaina; darbdaviams 5, pagal nutylėjimą mažėjantis skelbimų skaičius. Trūkstamos reikšmės gale; po 25 / 50 / 100 rezultatų puslapyje.
- Lentelė ir mobilios kortelės, išsamus įrašo langas, susieti skelbimai, kontaktai bei jų šaltiniai. Aktyvių filtrų žymos šalinamos po vieną, tekstas išvalomas atskirai, telefone yra grįžimas į rezultatų viršų.
- Iki 20 išsaugotų paieškų: išsaugojimas, taikymas, pervadinimas ir ištrynimas. Tik aiškiai pasirinkti filtrai ir pavadinimai laikomi šios naršyklės `localStorage`, atskirai pagal prisijungusį vartotoją. Rezultatų kopijos, slaptažodžiai ir sesijos žetonai nesaugomi. Atsijungus sąrašas pašalinamas iš matomos sąsajos.

Trūkstamos kainos, teritorijos, kontaktai, reitingai ar teisinė forma nepapildomi spėjimais. Įkainiai €/val., €/m², €/m³ ir € nėra tarpusavyje lygiaverčiai. Aptarnavimo spindulys perimamas iš šaltinio; tikras pasiekiamumas kituose miestuose nespėjamas. Datos ir klaidingos kategorijų reikšmės sąsajoje slepiamos, originalus importas išsaugomas užšifruotame kataloge.

## Paslaugų importai

Pradinis rinkinys turėjo 4 500 įrašų ir 89 veiklos sritis. Vėliau iš `Lietuvos_paslaugu_teikejai_253(1).xlsx` pridėti 253 įrašai be patvirtintų dublikatų. To etapo 4 753 įrašai ir 121 veiklos sritis yra istoriniai kiekiai.

Naujesnio 500 eilučių importo rezultatas: **464 nauji įrašai, 17 papildytų ir 19 nepakeistų**. Iš 25 telefono turėjusių įvesties eilučių 18 susietos su jau turėtais įrašais, 7 pridėjo naujus telefonus; 475 eilučių telefonai nepatvirtinti. Ankstesnės reikšmės neperrašytos spėjimais. Dabartiniai bendri kiekiai pateikti aukščiau.

Paskutinis pakartotinai pateiktas darbdavių XLSX buvo baitų tikslumu identiškas jau importuotam failui, todėl neimportuotas dar kartą: išlieka 1 504 įmonės, 4 393 skelbimai ir 2 899 kontaktų šaltinių įrašai.

Dublikatų patikra remiasi normalizuotais telefonais, el. paštais, profilio nuorodomis ir suderinama teikėjo tapatybe. Vien bendras telefonas, svetainė ar bendrinis pavadinimas nesujungia skirtingų įmonių ar paslaugų. Saugomi papildomi šaltiniai, duomenų pagrindas ir pastabos.

`node --env-file=.env.local scripts/import-providers.mjs <privataus-json-kelias>` pagal nutylėjimą atlieka tik peržiūrą; `--apply` įrašo atominiu pakeitimu. Išsaugomi esami ID, darbdavių duomenys ir šifravimo raktas, naudojamas naujas IV. Pakartotinis to paties importo vykdymas neprideda dublikatų. Pradiniai JSON ir XLSX neturi patekti į viešą Git ar statinį katalogą.

## Automatinis rinkimas

Atskiras `auctioneer-vip-crawler` Supabase Edge procesas naudoja tik `vip_crawler_*` lenteles. Esamos aukcionų lentelės ir pagrindinė svetainė nekeičiamos. RLS įjungta, `anon` ir `authenticated` neturi lentelių ar RPC teisių. Atskiras rinkimo raktas prieinamas tik VIP Node serveriui ir planuotojui; naršyklės užklausoms būtina VIP autorizacija ir POST CSRF patikra.

Grafikas **`*/15 * * * *` UTC — kas 15 minučių visą parą**, ir uždarius naršyklę. Supabase Cron kviečia Edge per `pg_net`, raktą gauna iš Vault. Panelėje yra „Tikrinti dabar“, būsenos, šaltinių datos, klaidos ir paieška pagal tikrai pateiktą teisinę formą bei vietovę.

Aktyvios **7 konfigūracijos, apimančios 8 karjeros puslapius**. Oxylabs ir Hostinger tikrinami pakaitomis per bendrą konfigūraciją; Nord Security, Surfshark, CyberCare, Omnisend, Tesonet Global ir Sintra — atskirai. Imami tik Lietuvos darbo vietų vieši Lever arba Ashby pasiūlymai. Skelbimo buvimas šaltinyje nėra nepriklausomas realaus priėmimo patvirtinimas; nepateikti kontaktai ir įmonių kodai nespėjami.

**2026-09-28 gyvas v8 rinkimas patvirtintas:** HTTP 200, visos 7 konfigūracijos sėkmingos, bazėje 8 įmonės ir 228 skelbimai; 6 įmonės naujos. Šaltinių patikroje rasta: Oxylabs 51, Hostinger 50, Nord Security 84, Surfshark 22, CyberCare 10, Omnisend 7, Tesonet Global 3 ir Sintra 1 skelbimas. Šie kiekiai yra tos patikros momentiniai duomenys, ne nekintantis pažadas.

Registrų centro ir Užimtumo tarnybos šaltiniai **pašalinti iš aktyvaus rinkimo** po `get.data.gov.lt` HTTP 403 blokavimo. Draudimo apėjimas neįdiegtas. Ateityje 401 arba 403 gavęs šaltinis taip pat pašalinamas iš aktyvaus rinkimo; 429 atveju gerbiamas `Retry-After`.

Vieno paleidimo terminas 85 s, šaltinio užklausos — iki 20 s, iki 250 įmonių ir 250 skelbimų viename šaltinio pakete. Lygiagrečiai vykdomi ne daugiau kaip 3 šaltiniai. Atominis užraktas saugo nuo persidengimo, rankiniams paleidimams taikoma minutės pauzė. Duomenys ir žymeklis įrašomi viena transakcija; nesėkmė neištrina ankstesnių duomenų ir neperstumia žymeklio. Rodomi tik nepasibaigę skelbimai, matyti per paskutines 48 valandas.

`crawler/edge.mjs` rakto SHA-256 žyma pakeičiama tik diegimo kopijoje; pats raktas lieka Render aplinkoje ir Supabase Vault. Rinkimo duomenys laikomi atskirai nuo importų, o bendrame vaizde tikrinami sutapimai.

## Sąsaja, muzika ir skaitikliai

Cyberpunk prisijungimo iliustracija, neono šviesos, judantis miesto fonas, terminalo garsinis signalas ir gylio efektai. Žemėlapio ir galaktikos kortelės pritaikytos mažesniems ekranams; šviesos sluoksniai neužstoja valdiklių. Efektai išjungiami, palaikomas `prefers-reduced-motion`.

Žemėlapio kontūras paruoštas iš **Natural Earth 110m**, viešojo naudojimo duomenų: https://github.com/nvkelso/natural-earth-vector . Jis pateikiamas su vietiniais failais, be išorinio žemėlapio užklausų veikimo metu. Šriftai „Manrope“ ir „Space Grotesk“ laikomi `/vip/fonts/` su OFL licencijomis.

Viena kompaktiška lotyniškos minties juosta ir bazės bei kontaktų skaitikliai yra bendroje antraštėje, matomi prieš prisijungimą ir prisijungus. 24 frazės su lietuviškais vertimais keičiasi kas 10 sekundžių, tik kol matoma juosta. Yra ankstesnės / kitos frazės ir pauzės valdikliai; sumažinto judesio režimu automatinis keitimas sustoja. Istorinė autorystė neteigiama.

Naudojamas vartotojo pasirinktas vaizdo įrašas https://www.youtube.com/watch?v=WflAReA2cqs per oficialų YouTube IFrame API. Garso failas nekopijuojamas. Matomas grotuvas išlieka prisijungiant, daina kartojama, sąmoningas sustabdymas gerbiamas. Bandoma paleisti automatiškai, o užblokavus garsą — pakartotinai po pirmo paspaudimo ar klavišo. Yra ir rankiniai valdikliai. Naršyklės ir YouTube taisyklės gali neleisti garso be naudotojo veiksmo.

Viešas `/vip/api/totals` pateikia tik kiekius. Bendras duomenų skaičius apima **teikėjus, įmones ir darbo skelbimus**; importų pagrindas yra 11 114, crawlerio radiniai pridedami dinamiškai su sutapimų patikra. Po nurodyto rinkimo vietinė bendro kiekio patikra davė **11 350**: 11 114 importuotų įrašų, 8 surinktos įmonės ir 228 skelbimai. Atskiras kontaktų skaitiklis skaičiuoja įrašus su telefonu arba el. paštu — šioje patikroje 5 667. Serverio skaičių podėlis galioja **30 sekundžių**.

Prisijungimo animacija demonstruoja lėtėjantį logaritminį rodmens augimą, tačiau tikrieji kiekiai pateikti atskirai. Prisijungus antraštės pagrindiniai skaičiai taip pat rodo tik realius kiekius. Animacija nesaugoma ir nekeičia duomenų bazės ar paieškos rezultatų kiekių.

Vidinė apžvalga kompaktiška, Lietuvos holograma iš pradžių suskleista, gyvas atradimų srautas pateiktas po paieškos rezultatais prieš puslapio poraštę. Antraštės skaitikliai ir vidiniai katalogų kiekiai atnaujinami kas minutę matomame puslapyje bei gavus pasikeitusią crawlerio būseną; paieškos filtrai ir puslapis išsaugomi. Rodomas paskutinio sėkmingo atnaujinimo laikas.

## Autentifikacija ir paleidimas

Reikia Node.js 22 ar naujesnio; trečiųjų šalių serverio paketų nėra. `npm start` paleidžia serverį; galima integruoti `createVipHandler` į esamą Node serverį. Produkcijoje būtini `NODE_ENV=production` ir `VIP_PUBLIC_ORIGIN=https://auctioneer.it.com`; likę kintamieji aprašyti `.env.example`.

Slaptažodis tikrinamas serveryje su scrypt maiša. Produkcijos prieigos žetonas laikomas tik naršyklės atmintyje ir siunčiamas `Authorization` antrašte; atnaujinus puslapį reikia prisijungti. Sesija baigiasi po 30 min. neveiklumo arba 8 val. Slapukų režimas paliktas vietiniam / same-origin naudojimui. Prisijungimo bandymai ribojami, POST tikrina Origin ir CSRF. Leidžiama tik tiksli `https://auctioneer.it.com` kilmė; nėra wildcard ar `Allow-Credentials`. Statinis klientas naudoja `credentials: omit`.

Privatūs API atsakymai naudoja `no-store`. Viešoje sąsajoje yra `noindex`, `nofollow`, `noarchive` ir CSP. Pats `/vip` kelias nėra apsauga — kiekvieną privačių duomenų užklausą autorizuoja serveris.

`private/catalog.enc` šifruojamas AES-256-GCM; VIP2 prieš šifravimą suspaudžia JSON su gzip, serveris taip pat skaito VIP1. `VIP_DATA_KEY` saugomas atskirai; netinkamas raktas sustabdo paleidimą. Privataus archyvo, konfigūracijos ir `private` katalogo negalima aptarnauti statinių failų serveriu. Slaptažodžio tekstas archyve nesaugomas.

`scripts/configure.mjs` priima JSON per stdin (`username`, `password`, `recordsPath`, `origin`) ir sukuria naują raktą, katalogą bei vietinę konfigūraciją, neišvesdamas paslapčių. Prie esamos versijos jo neleisti be suplanuoto raktų atnaujinimo. Darbdavių importui skirtas `scripts/import-b2b.mjs <privataus-json-kelias>`; jis tikrina `companies`, `jobs`, `contactSources` susiejimus ir išsaugo teikėjus bei esamą raktą.

## Diegimas ir patikra

Į statinės svetainės `auctioneer/vip/` kopijuojami tik vieši `public/` HTML, JavaScript, CSS, vaizdai ir šriftai, įskaitant crawlerio, išsaugotų paieškų ir efektų modulius. Serverio kodas, katalogas, konfigūracija ir raktai čia nepatenka. Nuoroda nepridedama į pagrindinį meniu ar sitemap.

Render serveris: `srv-dasnvkojo6nc73cks2b0`; originali statinė svetainė: `srv-darnfinpn0mc73d9h8og`; patvirtinta darbo sritis: `tea-daqolg6gekts739eno7g`. Vieno nemokamo serverio pirmas prisijungimas po neveiklumo gali užtrukti. `/healthz` skirtas tik būklei. Ankstesnėje patikroje automatinis commit diegimas neveikė, nors API rodė `autoDeploy=yes`, todėl naują laidą reikia aiškiai įdiegti abiem paslaugoms.

Sesijos ir bandymų ribojimas laikomi vieno serverio atmintyje: perkrovimas panaikina sesijas. Kelioms serverio kopijoms reikėtų bendros saugyklos. `VIP_TRUSTED_IP_HEADER` nenustatytas; keli lankytojai gali dalytis tarpinio serverio bandymų limitu, nepatikrintas pirmas `X-Forwarded-For` adresas nelaikomas patikimu.

**Dabartinė vietinė patikra: 67 / 67 automatinių testų sėkmingi.** Tikrinamos autentifikacijos ir CSRF ribos, CORS / Bearer sesijos, filtrai, teritorijos, darbdavių susiejimai, importų pakartojamumas, išsaugotų paieškų serializavimas, muzikos valdymas ir crawlerio šaltinių bei klaidų apdorojimas.

2026-09-28 gyvos API patikros rezultatas: 11 350 bendrų įrašų, 5 667 kontaktų įrašai, 5 217 paslaugų teikėjų, 1 512 darbdavių ir 4 621 darbo skelbimas. Patvirtinta crawlerio įmonių paieška bei detalės, 401 neprisijungus, 403 klaidingam CSRF ir sesijos panaikinimas atsijungus. Patikrinti paskelbti statiniai failai ir nepakitęs pagrindinio puslapio HTML SHA-256. Viešas prisijungimo ekranas ir frazių valdikliai patikrinti naršyklėje. Tikro mobiliojo įrenginio ir visų vidinių vizualų naršyklės patikra neatlikta. YouTube šiai testavimo naršyklei pateikė robotų patikrą, todėl garso atkūrimas nepatvirtintas.

50 papildomų idėjų pateikta `50-patobulinimu.md`.

## Viešų failų versijos

Po `public/` JavaScript ar CSS pakeitimų paleisti `node scripts/build-public-assets.mjs` prieš publikavimą. Jis sukuria turinio maiša pažymėtus failus, atnaujina HTML nuorodas, crawlerio priklausomybę nuo app modulio ir serverio leidžiamų failų sąrašą. Šie generuoti vieši failai įrašomi į abi Git šakas. Atskiros failų versijos neleidžia naršyklei sujungti seno skripto su nauju HTML.
