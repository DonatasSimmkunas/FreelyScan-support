import { mkdir, rm, readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { gunzipSync } from 'node:zlib';

const root = process.cwd();
const bundleDir = resolve(root, 'bundle');
const dist = resolve(root, 'dist');

const parts = (await readdir(bundleDir))
  .filter(name => /^part-\d+\.txt$/.test(name))
  .sort();

const encoded = (await Promise.all(parts.map(name => readFile(resolve(bundleDir, name), 'utf8')))).join('').trim();
const packed = Buffer.from(encoded, 'base64');
const files = JSON.parse(gunzipSync(packed).toString('utf8'));

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const [name, content] of Object.entries(files)) {
  const target = resolve(dist, name);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content, 'utf8');
}

if (process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY) {
  const config = {
    supabaseUrl: process.env.SUPABASE_URL,
    supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY,
    authRedirectUrl: process.env.SUPABASE_AUTH_REDIRECT_URL || 'https://vent.it.com'
  };
  await writeFile(resolve(dist, 'config.js'), `window.__VENT_CONFIG__ = ${JSON.stringify(config)};\n`, 'utf8');
  console.log('VENT: Supabase config injected from environment');
} else {
  console.log('VENT: using browser-safe bundled Supabase publishable config');
}

console.log('VENT build complete -> dist/');
