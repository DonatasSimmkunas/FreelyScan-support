# VENT deployment staging

Ši izoliuota šaka naudojama tik VENT paleidimui, nes dabartinė ChatGPT GitHub jungtis negali sukurti naujo repository.
Ji nekeičia `main` šakos ir FreelyScan support svetainės.

Build:
```bash
npm run build
```

Vercel:
- Build command: `npm run build`
- Output directory: `dist`
- Production domain: `vent.it.com`
- ENV: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_AUTH_REDIRECT_URL`
