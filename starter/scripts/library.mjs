#!/usr/bin/env node
// Builds the library's index and catalog from its folders. Each item is a folder in
// src/library/<category>/<name>/ with <name>.tsx (the component), <name>.demo.tsx (its gallery
// sample) and item.json; this reads them all and writes:
//
//   src/library/index.ts       every item's exports, the backdrops and transitions by name, and
//                              every gallery sample (don't edit: it's regenerated)
//   src/library/CATALOG.md     what each item is, how to use it and its props, for people and agents
//   src/library/catalog.json   the same as data, for tools and the showreel site
//
//   npm run library            after adding, removing or changing an item
//   npm run library -- --check exits 1 if the files above are out of date
//
// An item's props come from its TypeScript types (with their doc comments), so the catalog can't
// drift from the code. What an item needs (other items, packages) comes from the component's
// imports; its sample's imports are listed apart, since copying an item doesn't need its sample.

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lib = path.join(root, 'src', 'library');
const check = process.argv.includes('--check');

/** The categories, in the gallery's order, with what the catalog says about each. */
const CATEGORIES = {
  templates: 'Whole scenes that take words as props. Put one in SCENES: `{name, seconds, component: () => <Statement text="…" />}`. They draw their own backdrop and lay themselves out for every format.',
  text: 'Kinetic type: a headline that animates in with its accent phrase marked, words that mark themselves, a rotating word, a counter. The style picks the effect and the mark; props override them.',
  graphics: 'Charts, numbers, pointers, input and product UI to put over any scene. Each takes `start` (the frame it begins) and most take `exit`.',
  drawings: 'Illustrations drawn with code that animate as they draw. They tint themselves toward the brand colour.',
  voice: 'A voiceover from WAV lines (`npm run voice`), captions in sync with it, and a waveform that moves with it.',
  backdrops: 'The page behind the shots. A style picks one; `<Backdrop kind="…" />` picks another.',
  transitions: "How one scene gives way to the next. A style picks one; a scene picks its own with `transition: '…'` (the one INTO that scene).",
};
/** Categories whose items the core finds by name: each item exports its thing under this name. */
const REGISTRY = {backdrops: {export: 'backdrop', table: 'BACKDROPS', doc: 'Backdrops by kind, for <Backdrop>.'}, transitions: {export: 'transition', table: 'TRANSITIONS', doc: 'Transitions by name, for <Scenes>.'}};
const IGNORED_PACKAGES = new Set(['react', 'remotion']);

// ---- Read the folders ----

const read = (p) => fs.readFileSync(p, 'utf8');
const items = [];
for (const category of fs.readdirSync(lib).filter((d) => fs.statSync(path.join(lib, d)).isDirectory()).sort()) {
  if (!(category in CATEGORIES)) throw new Error(`library/${category}: not a known category (${Object.keys(CATEGORIES).join(', ')})`);
  for (const folder of fs.readdirSync(path.join(lib, category)).sort()) {
    const dir = path.join(lib, category, folder);
    if (folder.startsWith('_') || !fs.statSync(dir).isDirectory()) continue;
    const file = path.join(dir, `${folder}.tsx`);
    const json = path.join(dir, 'item.json');
    if (!fs.existsSync(file) || !fs.existsSync(json)) throw new Error(`library/${category}/${folder}: needs ${folder}.tsx and item.json`);
    const meta = JSON.parse(read(json));
    for (const key of ['name', 'summary', 'usage', 'order']) if (meta[key] === undefined) throw new Error(`library/${category}/${folder}/item.json: missing "${key}"`);
    const demoFile = path.join(dir, `${folder}.demo.tsx`);
    items.push({id: `${category}/${folder}`, category, folder, file, demoFile: fs.existsSync(demoFile) ? demoFile : null, ...meta, tags: meta.tags ?? []});
  }
}
const order = Object.keys(CATEGORIES);
items.sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category) || a.order - b.order || a.folder.localeCompare(b.folder));

// ---- Exports and needs, from the source ----

/** Names a file exports, split into values and types (`demos` and the registry export aside). */
const exportsOf = (src) => {
  const values = [];
  const types = [];
  for (const m of src.matchAll(/^export (const|function|class|let|type|interface) (\w+)/gm)) (m[1] === 'type' || m[1] === 'interface' ? types : values).push(m[2]);
  for (const m of src.matchAll(/^export (type )?\{([^}]+)\} from/gm)) {
    for (const part of m[2].split(',').map((s) => s.trim()).filter(Boolean)) {
      const isType = m[1] || part.startsWith('type ');
      const name = part.replace(/^type /, '').split(/\s+as\s+/).pop();
      (isType ? types : values).push(name);
    }
  }
  return {values, types};
};

/** Every file an import reaches inside the library, followed through shared files. */
const importsOf = (file) => [...read(file).matchAll(/^import [^;]*?from '([^']+)';/gms)].map((m) => m[1]);
const resolveTs = (from, spec) => {
  const base = path.resolve(path.dirname(from), spec);
  for (const p of [`${base}.tsx`, `${base}.ts`, path.join(base, 'index.ts')]) if (fs.existsSync(p)) return p;
  return null;
};
const needsOf = (item, from) => {
  const needs = new Set();
  const packages = new Set();
  const seen = new Set();
  const walk = (file) => {
    if (seen.has(file)) return;
    seen.add(file);
    for (const spec of importsOf(file)) {
      if (!spec.startsWith('.')) {
        const pkg = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
        if (!IGNORED_PACKAGES.has(pkg)) packages.add(pkg);
        continue;
      }
      const target = resolveTs(file, spec);
      if (!target || !target.startsWith(lib + path.sep)) continue;
      const rel = path.relative(lib, target).split(path.sep);
      if (rel.length === 3 && rel[2] === `${rel[1]}.tsx`) {
        const id = `${rel[0]}/${rel[1]}`;
        if (id !== item.id) needs.add(id);
      } else if (rel.length === 2 && rel[1].startsWith('_')) {
        walk(target);
      }
    }
  };
  walk(from);
  return {needs: [...needs].sort(), packages: [...packages].sort()};
};

for (const item of items) {
  const src = read(item.file);
  const {values, types} = exportsOf(src);
  const reg = REGISTRY[item.category];
  if (item.demoFile) {
    if (values.includes('demos')) throw new Error(`${item.id}: \`demos\` belongs in ${item.folder}.demo.tsx, not ${item.folder}.tsx`);
    if (!exportsOf(read(item.demoFile)).values.includes('demos')) throw new Error(`${item.id}: ${item.folder}.demo.tsx must export \`demos\``);
  } else if (!values.includes('demos')) {
    throw new Error(`${item.id}: needs ${item.folder}.demo.tsx exporting \`demos\` (an empty array if it has no gallery sample)`);
  }
  if (reg && !values.includes(reg.export)) throw new Error(`${item.id}: a ${item.category} item must export \`${reg.export}\``);
  item.values = values.filter((v) => v !== 'demos' && (!reg || v !== reg.export));
  item.types = types;
  if (!reg && !item.values.includes(item.name) && !item.types.includes(item.name)) throw new Error(`${item.id}: item.json name "${item.name}" isn't exported by ${item.folder}.tsx`);
  Object.assign(item, needsOf(item, item.file));
  item.demoNeeds = item.demoFile ? needsOf(item, item.demoFile).needs.filter((n) => !item.needs.includes(n)) : [];
}

// Two items exporting the same name would collide in the index.
const owner = new Map();
for (const item of items) {
  for (const name of [...item.values, ...item.types]) {
    if (owner.has(name)) throw new Error(`${name} is exported by both ${owner.get(name)} and ${item.id}: rename one`);
    owner.set(name, item.id);
  }
}

// ---- Props, from the types ----

const program = ts.createProgram(
  items.map((i) => i.file),
  {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, jsx: ts.JsxEmit.ReactJSX, strict: true, noEmit: true, skipLibCheck: true},
);
const checker = program.getTypeChecker();
const propsOf = (item) => {
  if (REGISTRY[item.category]) return [];
  const sf = program.getSourceFile(item.file);
  const symbol = sf && checker.getSymbolAtLocation(sf) && checker.getExportsOfModule(checker.getSymbolAtLocation(sf)).find((s) => s.name === item.name);
  if (!symbol) return [];
  const type = checker.getTypeOfSymbolAtLocation(symbol, sf);
  const signature = type.getCallSignatures()[0];
  const param = signature?.getParameters()[0];
  if (!param || !/^[A-Z]/.test(item.name)) return [];
  const propsType = checker.getTypeOfSymbolAtLocation(param, sf);
  return propsType.getProperties().filter((p) => !p.getJsDocTags(checker).some((t) => t.name === 'deprecated')).map((p) => {
    const decl = p.valueDeclaration ?? p.declarations?.[0];
    const t = checker.getTypeOfSymbolAtLocation(p, decl ?? sf);
    const optional = (p.flags & ts.SymbolFlags.Optional) !== 0;
    let typeText = checker.typeToString(optional ? checker.getNonNullableType(t) : t, decl, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseSingleQuotesForStringLiteralType);
    if (p.name === 'children') typeText = 'ReactNode';
    else if (typeText.length > 90) typeText = `${typeText.slice(0, 87)}…`;
    const doc = ts.displayPartsToString(p.getDocumentationComment(checker)).replace(/\s+/g, ' ').trim();
    return {name: p.name, type: typeText, optional, doc};
  });
};
for (const item of items) item.props = propsOf(item);

// ---- Write index.ts ----

const ident = (item) => item.id.replace(/[^a-zA-Z0-9]/g, '_');
const rel = (item) => `./${item.id}/${item.folder}`;
let index = `// GENERATED by scripts/library.mjs from the folders in library/: don't edit it. Run \`npm run library\`
// after adding, removing or changing an item.

import type {Demo} from './types';
${items.map((i) => `import * as ${ident(i)} from '${rel(i)}';`).join('\n')}
${items.filter((i) => i.demoFile).map((i) => `import * as ${ident(i)}_demo from '${rel(i)}.demo';`).join('\n')}

export * from './types';
`;
for (const item of items) {
  if (item.values.length) index += `export {${item.values.join(', ')}} from '${rel(item)}';\n`;
  if (item.types.length) index += `export type {${item.types.join(', ')}} from '${rel(item)}';\n`;
}
for (const [category, reg] of Object.entries(REGISTRY)) {
  const list = items.filter((i) => i.category === category);
  index += `\n/** ${reg.doc} */\nexport const ${reg.table} = {\n${list.map((i) => `  ${i.name}: ${ident(i)}.${reg.export},`).join('\n')}\n};\n`;
}
index += `\n/** Every item's gallery samples, by category, in catalog order. */\nexport const DEMOS: Record<${order.map((c) => `'${c}'`).join(' | ')}, Demo[]> = {\n`;
for (const category of order) {
  const list = items.filter((i) => i.category === category);
  index += `  ${category}: [${list.map((i) => `...${ident(i)}${i.demoFile ? '_demo' : ''}.demos`).join(', ')}],\n`;
}
index += '};\n';

// ---- Write the catalog ----

const propLine = (p) => `\`${p.name}${p.optional ? '?' : ''}: ${p.type}\`${p.doc ? ` ${p.doc}` : ''}`;
let md = `# The dolly library

GENERATED by \`npm run library\` from the items' folders: don't edit it. ${items.length} items.

Every item is a folder in \`src/library/<category>/<name>/\`: the component in \`<name>.tsx\` and its
\`item.json\`. Import any of them from the library: \`import {Stat, Kinetic, Statement} from './library'\`
(\`'../library'\` from \`src/scenes/\`). Each reads the style through \`useLook()\` and lays itself out for
every format. \`npm run gallery\` renders every item's sample, labelled with its code.
`;
for (const category of order) {
  const list = items.filter((i) => i.category === category);
  if (!list.length) continue;
  md += `\n## ${category[0].toUpperCase()}${category.slice(1)}\n\n${CATEGORIES[category]}\n`;
  for (const item of list) {
    md += `\n### ${item.name} · \`${item.id}\`\n\n${item.summary}\n\n\`${item.usage}\`\n`;
    if (item.props.length) md += `\nProps: ${item.props.map(propLine).join(' · ')}\n`;
    const extra = [...item.values.filter((v) => v !== item.name), ...item.types.filter((t) => t !== item.name)];
    if (extra.length) md += `\nAlso exports: ${extra.map((e) => `\`${e}\``).join(', ')}\n`;
    if (item.needs.length) md += `\nNeeds: ${item.needs.map((n) => `\`${n}\``).join(', ')}\n`;
  }
}

const catalog = items.map(({id, category, name, summary, usage, tags, values, types, needs, demoNeeds, packages, props}) => ({
  id, category, name, summary, usage, tags, exports: [...values, ...types], needs, demoNeeds, packages, props,
}));

const outputs = {
  [path.join(lib, 'index.ts')]: index,
  [path.join(lib, 'CATALOG.md')]: md,
  [path.join(lib, 'catalog.json')]: `${JSON.stringify(catalog, null, 2)}\n`,
};
let stale = 0;
for (const [file, text] of Object.entries(outputs)) {
  const now = fs.existsSync(file) ? read(file) : '';
  if (now === text) continue;
  stale += 1;
  if (check) console.error(`out of date: ${path.relative(root, file)}`);
  else fs.writeFileSync(file, text);
}
if (check && stale) {
  console.error('Run `npm run library` and commit the result.');
  process.exit(1);
}
const counts = order.map((c) => `${items.filter((i) => i.category === c).length} ${c}`).join(', ');
console.log(`${check ? 'library is up to date' : 'wrote library/index.ts, CATALOG.md and catalog.json'}: ${items.length} items (${counts})`);
