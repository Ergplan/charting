#!/usr/bin/env node
// Convert the first worksheet of an .xlsx into compact JSON (or a JS module)
// with zero dependencies: a minimal ZIP reader + zlib inflate.
//
//   node tools/xlsx-to-json.mjs "Energy Supply Chart.xlsx" > data.json
//   node tools/xlsx-to-json.mjs input.xlsx --js ENERGY_DATA > data.js
//
// Output: { "header": [...], "rows": [[...], ...] }

import { readFileSync } from 'node:fs';
import { inflateRawSync } from 'node:zlib';

function unzip(buf) {
  // Locate End Of Central Directory
  let eocd = buf.length - 22;
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--;
  if (eocd < 0) throw new Error('Not a zip file');
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const files = {};
  for (let n = 0; n < count; n++) {
    const method = buf.readUInt16LE(p + 10);
    const csize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    const lNameLen = buf.readUInt16LE(local + 26);
    const lExtraLen = buf.readUInt16LE(local + 28);
    const start = local + 30 + lNameLen + lExtraLen;
    const raw = buf.subarray(start, start + csize);
    files[name] = () => (method === 0 ? raw : inflateRawSync(raw)).toString('utf8');
    p += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}

const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
const colIndex = (ref) => [...ref.replace(/\d+/g, '')].reduce((a, c) => a * 26 + c.charCodeAt(0) - 64, 0) - 1;

export function readXlsx(path) {
  const files = unzip(readFileSync(path));
  const shared = files['xl/sharedStrings.xml']
    ? [...files['xl/sharedStrings.xml']().matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => decode([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join('')))
    : [];
  const sheetName = Object.keys(files).filter((f) => /^xl\/worksheets\/sheet\d+\.xml$/.test(f)).sort()[0];
  const xml = files[sheetName]();
  const rows = [];
  for (const r of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const row = [];
    for (const c of r[1].matchAll(/<c ([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = c[1];
      const ref = attrs.match(/r="([A-Z]+\d+)"/)?.[1];
      const type = attrs.match(/t="(\w+)"/)?.[1];
      const body = c[2] || '';
      let v = body.match(/<v>([\s\S]*?)<\/v>/)?.[1];
      if (type === 'inlineStr') v = body.match(/<t[^>]*>([\s\S]*?)<\/t>/)?.[1];
      if (v == null) continue;
      v = decode(v);
      const val = type === 's' ? shared[+v] : type === 'str' || type === 'inlineStr' ? v : type === 'b' ? v === '1' : +v;
      row[ref ? colIndex(ref) : row.length] = val;
    }
    rows.push(row);
  }
  const [header, ...body] = rows;
  return { header, rows: body.map((r) => header.map((_, i) => (r[i] === undefined ? null : typeof r[i] === 'number' ? Math.round(r[i] * 1000) / 1000 : r[i]))) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , input, flag, name = 'ENERGY_DATA'] = process.argv;
  if (!input) { console.error('usage: xlsx-to-json.mjs <file.xlsx> [--js VAR]'); process.exit(1); }
  const out = readXlsx(input);
  const json = JSON.stringify(out);
  process.stdout.write(flag === '--js' ? `// Generated from ${input.split('/').pop()}\nwindow.${name} = ${json};\n` : json);
}
