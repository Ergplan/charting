// Build the distributable bundles (committed to the repo so consumers need no build step):
//   dist/energy-flow-chart.min.js   <script> drop-in, sets window.EnergyFlow, auto-mounts [data-energy-flow]
//   dist/energy-flow-chart.esm.js   single-file ES module for <script type="module"> / import maps
import { build } from 'esbuild';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
const banner = { js: `/*! energy-flow-chart v${pkg.version} | zero-dependency energy charts */` };

await build({ entryPoints: ['src/browser.js'], outfile: 'dist/energy-flow-chart.min.js', bundle: true, minify: true, format: 'iife', target: ['es2020'], banner, sourcemap: true });
await build({ entryPoints: ['src/index.js'], outfile: 'dist/energy-flow-chart.esm.js', bundle: true, minify: true, format: 'esm', target: ['es2020'], banner, sourcemap: true });
console.log('built dist/energy-flow-chart.min.js + dist/energy-flow-chart.esm.js');
