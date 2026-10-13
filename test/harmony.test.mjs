import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { themes, getTheme, registerTheme, resolveSeriesColors } from '../src/themes.js';
import { monotoneSegments, monotonePath, stepPath } from '../src/curves.js';
import { fromPriceRows, tradeWindows, priceAt, dayIndexOf, dayStats, colorAt, colormapCSS, samplePriceYear } from '../src/prices.js';

// ------------------------------------------------------------------ themes
test('Harmony family is registered with skin, font and drawing hints', () => {
  for (const name of ['harmony', 'volt', 'verdant', 'aurora']) {
    const t = themes[name];
    assert.ok(t, name);
    assert.equal(t.skin, 'harmony');
    assert.match(t.font, /Urbanist/);
    assert.equal(t.chart.curve, 'smooth');
    for (const mode of ['light', 'dark']) {
      for (const role of ['solar', 'wind', 'hydro', 'grid', 'market', 'dam', 'rtm', 'gdam', 'marginalVC', 'spareVC', 'buyWindow', 'sellWindow']) {
        assert.ok(t[mode].roles[role], `${name}.${mode}.roles.${role}`);
      }
    }
  }
});

test('Harmony uses the brand colours: charcoal ground, Harmony Green exchange', () => {
  const t = getTheme('harmony');
  assert.equal(t.dark.page, '#000b1a');
  assert.equal(t.dark.roles.market, '#68e78e');
  const c = resolveSeriesColors([{ key: 'm', role: 'market' }, { key: 's', role: 'solar' }, { key: 'd', role: 'demand' }], t, 'dark');
  assert.equal(c.m, '#68e78e');
  assert.equal(c.d, t.dark.ink, 'demand draws in ink');
});

test('registerTheme({ extends }) inherits chrome, roles and skin', () => {
  const t = registerTheme({ name: 'acme-test', extends: 'harmony', dark: { accent: '#ff00aa', roles: { market: '#123456' } } });
  assert.equal(t.skin, 'harmony');
  assert.equal(t.dark.accent, '#ff00aa');
  assert.equal(t.dark.roles.market, '#123456');
  assert.equal(t.dark.roles.solar, themes.harmony.dark.roles.solar, 'untouched roles inherited');
  assert.equal(t.light.surface, themes.harmony.light.surface);
  delete themes['acme-test'];
});

// ------------------------------------------------------------------ curves
test('monotone curve never overshoots its points', () => {
  const pts = [[0, 100], [10, 100], [20, 20], [30, 20], [40, 90], [50, 85]];
  for (const [p0, c1, c2, p1] of monotoneSegments(pts)) {
    const lo = Math.min(p0[1], p1[1]);
    const hi = Math.max(p0[1], p1[1]);
    for (const c of [c1, c2]) assert.ok(c[1] >= lo - 1e-9 && c[1] <= hi + 1e-9, `control ${c} outside [${lo}, ${hi}]`);
  }
  assert.match(monotonePath(pts), /^M0\.0,100\.0C/);
});

test('step path holds each value until the next block', () => {
  assert.equal(stepPath([[0, 5], [10, 7], [20, 3]], 30), 'M0.0,5.0H10.0V7.0H20.0V3.0H30.0');
});

// ------------------------------------------------------------------ prices
const rows = [
  { Date: '2026-07-04', Block: 1, DAM: 4500, RTM: 4400, GDAM: 4600, 'Marginal state VC': 5200, 'Cheapest spare VC': 2500 },
  { Date: '2026-07-04', Block: 2, DAM: 6000, RTM: 6100, GDAM: 5900, 'Marginal state VC': 5200, 'Cheapest spare VC': 2500 },
  { Date: '2026-07-04', Block: 3, DAM: 2000, RTM: 2100, GDAM: 1900, 'Marginal state VC': '', 'Cheapest spare VC': 2500 },
  { Date: '2026-07-05', Block: 96, DAM: 10000, RTM: 10000, GDAM: 10000, 'Marginal state VC': 5200, 'Cheapest spare VC': 3300 },
];

test('fromPriceRows: day × block matrix, ₹/MWh converted to ₹/kWh, gaps stay NaN', () => {
  const m = fromPriceRows(rows);
  assert.equal(m.days.length, 2);
  assert.equal(m.blocks, 96);
  assert.equal(priceAt(m, 'dam', 0, 0), 4.5);
  assert.equal(priceAt(m, 'dam', 1, 95), 10);
  assert.ok(Number.isNaN(priceAt(m, 'marginalVC', 0, 2)), 'blank cell → NaN, never 0');
  assert.ok(Number.isNaN(priceAt(m, 'dam', 0, 50)), 'missing block → NaN');
  assert.equal(dayIndexOf(m, '2026-07-05'), 1);
});

test('tradeWindows: buy below marginal VC, sell above spare VC, none without a marginal unit', () => {
  const m = fromPriceRows(rows);
  assert.deepEqual(tradeWindows(m, 0).slice(0, 2), [{ type: 'buy', from: 0, to: 1 }, { type: 'sell', from: 1, to: 2 }]);
  assert.ok(!tradeWindows(m, 0).some((w) => w.from <= 2 && w.to > 2), 'block 3 has no marginal VC → no window');
});

test('dayStats ignores missing blocks', () => {
  const m = fromPriceRows(rows);
  const st = dayStats(m, 'dam', 0);
  assert.equal(st.min, 2);
  assert.equal(st.max, 6);
});

test('colour maps: ends, midpoints and CSS legend', () => {
  assert.deepEqual(colorAt('landscape', 0), [0x0b, 0x17, 0x22]);
  assert.deepEqual(colorAt('landscape', 1), [0xe4, 0xf2, 0x5a]);
  assert.deepEqual(colorAt(['#000000', '#ffffff'], 0.5), [128, 128, 128]);
  assert.equal(colorAt('landscape', NaN), null);
  assert.match(colormapCSS('harmony'), /^linear-gradient\(90deg, #0b1722 0\.0%/);
});

test('samplePriceYear is deterministic, capped and seasonal', () => {
  const a = samplePriceYear({ days: 400 });
  const b = samplePriceYear({ days: 400 });
  assert.deepEqual(a.markets.dam.slice(0, 500), b.markets.dam.slice(0, 500));
  assert.ok(a.markets.dam.every((v) => v >= 0.3 && v <= 10), 'within ₹0.3–₹10');
  const jul = dayIndexOf(a, '2026-07-04');
  const dec = dayIndexOf(a, '2025-12-15');
  const night = (d) => a.markets.dam.slice(d * 96, d * 96 + 16).reduce((x, y) => x + y, 0) / 16;
  const noon = (d) => a.markets.dam.slice(d * 96 + 46, d * 96 + 54).reduce((x, y) => x + y, 0) / 8;
  assert.ok(night(jul) > night(dec), 'summer nights dearer than winter nights');
  assert.ok(noon(jul) < 3 && noon(dec) < 3, 'solar trough at midday');
});

// ------------------------------------------------------------------ design system
test('design-system tokens: every colour has both themes and a usage note', () => {
  const t = JSON.parse(readFileSync(new URL('../design-system/tokens/tokens.json', import.meta.url)));
  assert.deepEqual(t.color.themes.map((x) => x.id), ['dark', 'light']);
  for (const c of t.color.tokens) {
    assert.ok(c.usage, `${c.name} has a usage note`);
    if (typeof c.value === 'object') assert.ok(c.value.dark && c.value.light, `${c.name} has dark and light`);
  }
  const css = readFileSync(new URL('../design-system/tokens/tokens.css', import.meta.url), 'utf8');
  assert.match(css, /--harmony: #68E78E;/);
  assert.match(css, /\[data-theme="light"\]/);
});
