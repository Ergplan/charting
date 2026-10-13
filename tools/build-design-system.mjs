#!/usr/bin/env node
// Build the ergOS Harmony design-system outputs from their sources:
//
//   design-system/tokens/tokens.json   (source of truth, edited by hand or in the design-system artifact)
//     → design-system/tokens/tokens.css   CSS custom properties: dark on :root, light on [data-theme="light"]
//     → design-system/tokens/tokens.js    the same values as an ES module (for TS/JS, charts, emails)
//
//   design-system/components/<Name>/preview.html   (artifact preview documents)
//     → design-system/gallery/<Name>.html           standalone pages with tokens, harmony.css, harmony.js
//     → design-system/gallery/index.html            one page that lists every component
//
// Run:  npm run build:ds
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../design-system/', import.meta.url));
const tokens = JSON.parse(readFileSync(join(root, 'tokens/tokens.json'), 'utf8'));
const themes = tokens.color.themes.map((t) => t.id);
const first = themes[0];

// ------------------------------------------------------------------ tokens.css
const val = (tok, theme) => (typeof tok.value === 'string' ? tok.value : tok.value[theme] ?? tok.value[first]);
const ref = (v) => String(v).replace(/^\{(.+)\}$/, 'var(--$1)'); // {alias} → var(--alias)
const block = (sel, lines) => `${sel} {\n${lines.map((l) => `  ${l}`).join('\n')}\n}\n`;
let css = `/* ${tokens.name} — generated from tokens.json by tools/build-design-system.mjs. Do not edit. */\n\n`;
for (const theme of themes) {
  const sel = theme === first ? `:root, [data-theme="${theme}"]` : `[data-theme="${theme}"]`;
  const lines = [
    ...tokens.color.tokens.map((t) => `--${t.name}: ${ref(val(t, theme))};`),
    ...(tokens.shadow?.tokens || []).map((t) => `--${t.name}: ${val(t, theme)};`),
    `color-scheme: ${theme === 'light' ? 'light' : 'dark'};`,
  ];
  css += block(sel, lines) + '\n';
}
const fixed = [];
for (const [fam, list] of Object.entries(tokens)) {
  if (['color', 'type', 'shadow', 'name', 'version', 'meta'].includes(fam) || !list?.tokens) continue;
  for (const t of list.tokens) fixed.push(`--${t.name}: ${t.value};`);
}
for (const [k, v] of Object.entries(tokens.type.families)) fixed.push(`--font-${k}: ${v};`);
css += block(':root', fixed) + '\n';
css += '/* Type styles: class="eg-type-<style>" */\n';
for (const g of tokens.type.groups) {
  for (const st of g.styles) {
    const fam = st.family || g.family;
    const lines = [`font-family: var(--font-${fam});`, `font-size: ${st.fontSize};`, `line-height: ${st.lineHeight};`, `font-weight: ${st.fontWeight};`];
    if (st.letterSpacing) lines.push(`letter-spacing: ${st.letterSpacing};`);
    if (st.name === 'overline') lines.push('text-transform: uppercase;');
    css += block(`.eg-type-${st.name}`, lines);
  }
}
writeFileSync(join(root, 'tokens/tokens.css'), css);

// ------------------------------------------------------------------ tokens.js
const js = {
  name: tokens.name,
  themes,
  color: Object.fromEntries(themes.map((th) => [th, Object.fromEntries(tokens.color.tokens.map((t) => [t.name, val(t, th)]))])),
  shadow: Object.fromEntries(themes.map((th) => [th, Object.fromEntries((tokens.shadow?.tokens || []).map((t) => [t.name, val(t, th)]))])),
  spacing: Object.fromEntries(tokens.spacing.tokens.map((t) => [t.name, t.value])),
  radius: Object.fromEntries(tokens.radius.tokens.map((t) => [t.name, t.value])),
  font: tokens.type.families,
  type: Object.fromEntries(tokens.type.groups.flatMap((g) => g.styles.map((st) => [st.name, { family: st.family || g.family, fontSize: st.fontSize, lineHeight: st.lineHeight, fontWeight: st.fontWeight, letterSpacing: st.letterSpacing }]))),
};
writeFileSync(join(root, 'tokens/tokens.js'), `// ${tokens.name} — generated from tokens.json by tools/build-design-system.mjs. Do not edit.\nexport const tokens = ${JSON.stringify(js, null, 2)};\nexport default tokens;\n`);

// ------------------------------------------------------------------ gallery
const compDir = join(root, 'components');
const galDir = join(root, 'gallery');
if (!existsSync(galDir)) mkdirSync(galDir);
const head = [
  '<meta name="viewport" content="width=device-width, initial-scale=1">',
  '<link rel="stylesheet" href="../tokens/tokens.css">',
  '<link rel="stylesheet" href="../harmony.css">',
  '<script src="../../dist/energy-flow-chart.min.js"></script>',
  '<script src="../harmony.js"></script>',
].join('\n');
const cards = [];
for (const name of readdirSync(compDir).sort()) {
  const file = join(compDir, name, 'preview.html');
  if (!existsSync(file)) continue;
  let html = readFileSync(file, 'utf8');
  const marker = html.split('\n')[0];
  const group = (marker.match(/group="([^"]+)"/) || [])[1] || (name === 'Cover' ? 'Overview' : 'Other');
  const height = +((marker.match(/height=(\d+)/) || [])[1] || 300);
  const width = +((marker.match(/width=(\d+)/) || [])[1] || 0);
  html = html.replace(/^<!--[^\n]*-->\n/, '');
  // previews link files relative to the system root (../../assets/…); gallery pages sit one level below it
  html = html.replace(/(["'(])\.\.\/\.\.\//g, '$1../');
  html = html.replace('<html lang="en">', '<html lang="en" data-theme="dark">');
  html = html.replace('<head>', `<head>\n${head}`);
  // add a theme toggle to every standalone page
  // a theme toggle on pages opened on their own (not inside the gallery's frames)
  html = html.replace('</body>', '<script>if (window.top === window) { var t = document.createElement("button"); t.className = "eg-btn eg-btn--sm"; t.textContent = "Switch theme"; t.style.cssText = "position:fixed;right:12px;bottom:12px;z-index:9"; t.onclick = function () { var r = document.documentElement; r.setAttribute("data-theme", r.getAttribute("data-theme") === "light" ? "dark" : "light"); }; document.body.appendChild(t); }</script>\n</body>');
  writeFileSync(join(galDir, `${name}.html`), html);
  const readme = existsSync(join(compDir, name, 'README.md')) ? readFileSync(join(compDir, name, 'README.md'), 'utf8') : '';
  const summary = (readme.split('\n').find((l) => l.trim() && !l.startsWith('#')) || '').replace(/[`*]/g, '').split('. ')[0];
  cards.push({ name, group, height, width, summary });
}
const ORDER = ['Overview', 'Actions', 'Navigation', 'Inputs', 'Status', 'Data display', 'Charts', 'Screens'];
const groups = [...new Set(cards.map((c) => c.group))].sort((a, b) => (ORDER.indexOf(a) + 1 || 99) - (ORDER.indexOf(b) + 1 || 99));
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const index = `<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ergOS Harmony</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="../tokens/tokens.css">
<link rel="stylesheet" href="../harmony.css">
<style>
  body.eg-stage { padding: 40px 24px 80px; }
  .wrap { max-width: 1240px; margin: 0 auto; display: grid; gap: 40px; }
  header { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
  header p { margin: 8px 0 0; color: var(--ink-muted); max-width: 60ch; }
  h2.g { margin: 0 0 14px; }
  .grid { display: grid; gap: 18px; }
  .card { border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--line); background: var(--surface); }
  .card iframe { display: block; width: 100%; border: 0; background: var(--canvas); }
  .card .meta { display: flex; justify-content: space-between; gap: 12px; padding: 12px 16px; border-top: 1px solid var(--line); }
  .card .meta b { font-weight: 600; }
  .card .meta span { color: var(--ink-muted); font-size: 13px; }
  .card .meta a { color: var(--accent); font-size: 13px; text-decoration: none; white-space: nowrap; }
</style>
</head>
<body class="eg-stage">
<div class="wrap">
  <header><div><h1 class="eg-h1">erg<em>OS</em> Harmony</h1><p>The ergOS interface kit: tokens, components, charts and screens. Every card below is a live page in this folder; open one to inspect it on its own.</p></div>
  <button class="eg-btn" onclick="var r=document.documentElement;var n=r.getAttribute('data-theme')==='light'?'dark':'light';r.setAttribute('data-theme',n);document.querySelectorAll('iframe').forEach(function(f){try{f.contentDocument.documentElement.setAttribute('data-theme',n)}catch(e){}})">Switch theme</button></header>
${groups.map((g) => `  <section><h2 class="g eg-overline">${esc(g)}</h2><div class="grid">
${cards.filter((c) => c.group === g).map((c) => `    <article class="card"><iframe src="${c.name}.html" title="${esc(c.name)}" loading="lazy" style="height:${Math.min(c.height + 48, c.width ? 1100 : 900)}px"></iframe><div class="meta"><div><b>${esc(c.name)}</b> <span>${esc(c.summary)}</span></div><a href="${c.name}.html">Open</a></div></article>`).join('\n')}
  </div></section>`).join('\n')}
</div>
</body>
</html>
`;
writeFileSync(join(galDir, 'index.html'), index);
console.log(`design-system: tokens.css, tokens.js, ${cards.length} gallery pages`);
