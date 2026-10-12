#!/usr/bin/env node
// Renders every library item's samples as short clips and posters: the real thing moving, for the
// showreel's library page or anywhere a person should see an item before picking it.
//
//   npm run samples                          # all of them, into out/samples/
//   npm run samples -- --only graphics       # one category
//   npm run samples -- --style bold          # in another style (the brand's own by default)
//
// For each sample it writes <category>-<name>-<n>.mp4 (960×540; voice samples keep their sound)
// and .jpg (its best frame), and samples.json lists them with their names and code.

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderMedia, renderStill, selectComposition} from '@remotion/renderer';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i < 0 ? undefined : process.argv[i + 1];
};
const only = arg('only');
const style = arg('style');
const outDir = path.join(root, 'out', 'samples');
fs.mkdirSync(outDir, {recursive: true});

// The same settings as remotion.config.ts, which the programmatic renderer doesn't read.
const chromiumOptions = {gl: process.platform === 'darwin' ? 'angle' : 'swangle'};

console.log('bundling…');
const serveUrl = await bundle({entryPoint: path.join(root, 'src', 'index.ts')});
const browser = await openBrowser('chrome', {chromiumOptions});

const list = await selectComposition({serveUrl, id: 'ItemList', inputProps: {}, puppeteerInstance: browser, chromiumOptions});
const samples = list.props.items.filter((s) => !only || s.id.startsWith(`${only}/`));

const done = [];
for (const [n, s] of samples.entries()) {
  const base = `${s.id.replace('/', '-')}-${s.index}`;
  const inputProps = {id: s.id, index: s.index, ...(style ? {style} : {})};
  const composition = await selectComposition({serveUrl, id: 'Item', inputProps, puppeteerInstance: browser, chromiumOptions});
  const t = Date.now();
  await renderMedia({
    composition,
    serveUrl,
    inputProps,
    codec: 'h264',
    crf: 24,
    scale: 0.5,
    jpegQuality: 95,
    muted: !s.id.startsWith('voice/'),
    outputLocation: path.join(outDir, `${base}.mp4`),
    puppeteerInstance: browser,
    chromiumOptions,
  });
  await renderStill({
    composition,
    serveUrl,
    inputProps,
    frame: Math.min(s.hero, composition.durationInFrames - 1),
    imageFormat: 'jpeg',
    jpegQuality: 82,
    scale: 0.5,
    output: path.join(outDir, `${base}.jpg`),
    puppeteerInstance: browser,
    chromiumOptions,
  });
  done.push({...s, video: `${base}.mp4`, poster: `${base}.jpg`});
  console.log(`${n + 1}/${samples.length} ${base} (${((Date.now() - t) / 1000).toFixed(1)} s)`);
}
await browser.close({silent: true});

// Merge with what's there, so a --only run keeps the other categories.
const manifest = path.join(outDir, 'samples.json');
const before = fs.existsSync(manifest) ? JSON.parse(fs.readFileSync(manifest, 'utf8')) : [];
const key = (s) => `${s.id}#${s.index}`;
const merged = new Map(before.map((s) => [key(s), s]));
for (const s of done) merged.set(key(s), s);
fs.writeFileSync(manifest, `${JSON.stringify([...merged.values()], null, 2)}\n`);
console.log(`wrote ${done.length} samples and ${path.relative(root, manifest)}`);
