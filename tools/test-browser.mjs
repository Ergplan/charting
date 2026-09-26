#!/usr/bin/env node
// Run test/browser/ headless in Chrome/Edge/Chromium and print the results.
//   npm run test:browser            (auto-detects the browser)
//   BROWSER="/path/to/chrome" npm run test:browser
import { spawn, execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const candidates = [
  process.env.BROWSER,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].filter(Boolean);
const browser = candidates.find((p) => existsSync(p));
if (!browser) { console.error('No Chrome/Edge/Chromium found. Set BROWSER=/path/to/browser'); process.exit(2); }

const port = 5179;
const server = spawn(process.execPath, [fileURLToPath(new URL('./serve.mjs', import.meta.url)), String(port)], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 400));

let html = '';
try {
  html = execFileSync(browser, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    `--user-data-dir=${fileURLToPath(new URL('../node_modules/.efc-browser-profile', import.meta.url))}`,
    '--window-size=1400,1000', '--virtual-time-budget=60000', '--dump-dom',
    `http://localhost:${port}/test/browser/`,
  ], { encoding: 'utf8', timeout: 120000, maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
} catch (e) {
  html = e.stdout || ''; // some browsers exit non-zero after --dump-dom; the DOM is still valid
  if (!html) { console.error(`Browser failed: ${e.message.split('\n')[0]}`); }
} finally { server.kill(); }

const m = html.match(/<pre id="summary">([\s\S]*?)<\/pre>/);
const raw = m && m[1].replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
if (!raw) { console.error('Tests did not finish (no summary in page).'); process.exit(1); }
const { total, failed, results } = JSON.parse(raw);
for (const r of results) console.log(`${r.skipped ? '-' : r.ok ? '✔' : '✖'} ${r.name}${r.skipped ? ` (skipped: ${r.skipped})` : r.ok ? ` (${r.ms}ms)` : `\n    ${r.error.replace(/\n/g, '\n    ')}`}`);
console.log(`\n${total - failed}/${total} browser tests passed (${browser.split('/').pop()})`);
process.exit(failed ? 1 : 0);
