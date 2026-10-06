# Telkinys.lt — V15 leidimas

Savininkas patvirtino tęstinį tobulinimą ir naujos versijos perkėlimą į domeną. Šis leidimas atnaujina V14 sąsają į V15, palikdamas uždarą beta, kvietimus ir noindex. Daugiau: TELKINYS_V15_RELEASE.md.

Produkcinis Render: srv-dat11qg473hc73e9vj10, branch telkinys-vercel-staging. Build kopijuoja tik telkinys-deploy/index.html. V15 HTML blob 6a06ab5756fd8969d4aba3f070d918f4b6c907de, 144418 baitų, SHA-256 7b1737cd2eab1b94d29bd801676c2cfd25cb5cf2b3373fce59f2c306109b73f0.

Bandomasis leidimas pernaudotame telkinys-v14-beta Render servise: dep-db2m5avlk1mc73cogm0g, status live, source commit 1b3489f9a1e90ba3dae3a54596a7c920b5837a81. Naršyklėje patvirtinta V15 žyma ir pilnas pradinis puslapis. Tolimesni kelių žingsnių naršyklės scenarijai buvo blokuoti įrankio saugos patikros; jų nelaikyti atliktais. Offline UI patikros atskirtos nuo tikrų dev API testų.

Floot V15 backend publikavimas c4503b34-6b2f-4cdd-b519-9fbd206e34af succeeded. Viešas health atsakymas patvirtino 15.0.0-beta; realios skaitymo užklausos patvirtino skaičių išsaugojimą, €/val. ir saugų rikiavimą. CORS leidžia telkinys.lt. DNS ir planai nekeičiami.

## Grįžimas
V14 išsaugota branch telkinys-v14-backup-before-v15, commit 413bfca1452278e7ad3d7dcc9f61b0ffdc4c64fa, HTML blob cfc5afb154feb9e13a91f720ac31b23c0d756d3a. Norint grąžinti V14 sąsają, sukurti naują commit esamoje produkcinėje šakoje pakeičiant tik deployment index į šį blob; nenaudoti force push ir nenaikinti V15 duomenų lentelių. Naujas serveris išlaiko V14 endpointų suderinamumą.

Kodo checkpoint nėra DB ar failų atsarginė kopija. Prieš bet kokį DB atkūrimą atskirai išsaugoti jau gautus poreikius, pasiūlymus, privačius pokalbius ir susitarimus. Viešo domeno leidimo faktas fiksuojamas po Render live patvirtinimo ir HTML patikros.
