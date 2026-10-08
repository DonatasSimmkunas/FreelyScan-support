# Dabartinis Telkinys.lt leidimo šaltinis

Naujausia kandidatė V16. Žr. TELKINYS_V16_RELEASE.md apie patikras, ribas ir atsarginę V15 šaką.
Produkcijos šaka telkinys-vercel-staging, Render srv-dat11qg473hc73e9vj10. Servisas kopijuoja telkinys-deploy/index.html į dist/index.html. Modulinio kodo pakeitimai savaime neatsiranda svetainėje: reikia patikrinti node telkinys-v16/build.mjs --write-deployment-artifact rezultatą.
Backend API: https://telkinys.floot.app/_api/telkinys, Floot projektas5b325205-4684-4080-b798-7236728d2e1a. Floot V9 puslapis nėra dabartinės svetainės sąsaja. Kasdienės privačios kopijos workflow yra repo DEFAULT main, ne produkcijos šakoje. Mokėjimai, el. paštas ir tapatybės patikros neįjungti; beta ribos lieka.
Senasis telkinys-v14-preview yra localStorage demonstracija. telkinys-v14-beta.onrender.com šiame etape neatnaujintas ir nėra naujausios produkcijos rodiklis. Tikrinti telkinys.lt versijos meta ir realų Render deploy.
