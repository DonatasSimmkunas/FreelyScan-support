import { mkdir, rm, copyFile, cp, readdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const root = process.cwd();
const dist = resolve(root, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

// Editable source files are the deploy source. The old compressed bundle was incomplete.
const publicFiles = (await readdir(root)).filter(name =>
  /\.(?:html|xml|txt|js|json)$/.test(name) && name !== 'package.json'
);
for (const name of publicFiles) await copyFile(join(root, name), join(dist, name));
await mkdir(join(dist, 'assets'), { recursive: true });
for (const name of await readdir(join(root, 'assets'))) {
  await cp(join(root, 'assets', name), join(dist, 'assets', name), {recursive:true});
}

if (process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY) {
  const config = {
    supabaseUrl: process.env.SUPABASE_URL,
    supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY,
    authRedirectUrl: process.env.SUPABASE_AUTH_REDIRECT_URL || 'https://vent.it.com'
  };
  await writeFile(join(dist, 'config.js'), `window.__VENT_CONFIG__ = ${JSON.stringify(config)};\n`);
}
console.log('VENT build complete -> dist/');
