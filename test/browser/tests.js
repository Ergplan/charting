// Browser test suite: drives the real chart in a real DOM.
// Open /test/browser/ in any browser, or run headless: `npm run test:browser`.

import * as EF from '../../src/index.js';

const { mount, autoMount, createStore, EnergyFlowChart, computeTod, aggregator, withPrices, registerTheme, themes, fromBlockRows } = EF;

// ------------------------------------------------------------------ mini runner
const tests = [];
const test = (name, fn) => tests.push({ name, fn });
class AssertionError extends Error {}
class SkipError extends Error {}
const skip = (why) => { throw new SkipError(why); };
const assert = {
  ok: (v, msg = 'expected truthy') => { if (!v) throw new AssertionError(msg); },
  equal: (a, b, msg) => { if (a !== b) throw new AssertionError(`${msg || 'not equal'}: got ${JSON.stringify(a)}, want ${JSON.stringify(b)}`); },
  close: (a, b, tol, msg) => { if (!(Math.abs(a - b) <= tol)) throw new AssertionError(`${msg || 'not close'}: got ${a}, want ${b} ± ${tol}`); },
  match: (s, re, msg) => { if (!re.test(String(s))) throw new AssertionError(`${msg || 'no match'}: ${JSON.stringify(String(s))} !~ ${re}`); },
  rejects: async (p, re) => { try { await p; } catch (e) { if (re && !re.test(e.message)) throw new AssertionError(`wrong error: ${e.message}`); return; } throw new AssertionError('expected rejection'); },
  throws: (fn, re) => { try { fn(); } catch (e) { if (re && !re.test(e.message)) throw new AssertionError(`wrong error: ${e.message}`); return; } throw new AssertionError('expected throw'); },
};

const stage = document.getElementById('stage');
// rAF is paused in background tabs, so each frame also resolves on a short timer
const oneFrame = () => new Promise((r) => { let done = false; const f = () => { if (!done) { done = true; r(); } }; requestAnimationFrame(f); setTimeout(f, 34); });
// every chart created in a test, so waits can also apply their pending redraws
const liveCharts = new Set();
const frames = async (n = 2) => { for (let k = 0; k < n; k++) await oneFrame(); for (const c of liveCharts) c.flush(); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let cleanups = [];
function host(width = 1000) {
  const wrap = document.createElement('div');
  wrap.style.width = `${width}px`;
  const cards = document.createElement('div');
  const chart = document.createElement('div');
  wrap.append(cards, chart);
  stage.appendChild(wrap);
  cleanups.push(() => wrap.remove());
  return { wrap, cards, chart };
}
const track = (h) => { liveCharts.add(h.chart); cleanups.push(() => { liveCharts.delete(h.chart); h.destroy(); }); return h; };

// ------------------------------------------------------------------ synthetic data
// D days × 96 blocks, deterministic, standard export columns.
const HEADER = ['Date', 'Block', 'Time (IST)', 'Total Demand (kW)', 'Renewable Energy (kW)', 'Surplus Renewable (kW)', 'Grid Supply (kW)', 'Local Battery (kW)', 'Energy Market (kW)', 'Government Battery (kW)'];
function synth({ days = 3, lastBlocks = 96, peakDay = 1, stampDate = '2026-09-26' } = {}) {
  const rows = [];
  for (let d = 0; d < days; d++) {
    const n = d === days - 1 ? lastBlocks : 96;
    for (let b = 1; b <= n; b++) {
      const h = (b - 0.5) / 4;
      const solar = Math.max(0, Math.round(1200 * Math.sin(((h - 6) / 12) * Math.PI)));
      const grid = 500 + (d === peakDay ? 1500 : 0);
      const market = h >= 10 && h < 19 ? 800 : 0;
      const surplus = h >= 12 && h < 13 ? 150 : 0;
      const demand = solar + grid + market - (b === 40 ? 100 : 0) + (b === 80 ? 100 : 0); // one oversupply, one shortfall block
      rows.push([stampDate, b, '', demand, solar, surplus, grid, 0, market, 0]);
    }
  }
  return { header: HEADER, rows };
}
const DS = (raw) => fromBlockRows(raw.rows.map((r) => Object.fromEntries(HEADER.map((h, i) => [h, r[i]]))), { columns: EF.energySupplyPreset.columns });
const PRICES = { renewable: 4, grid: { tod: [{ start: '00:00', end: '12:00', price: 6 }, { start: '12:00', end: '24:00', price: 9 }] }, market: (t) => (new Date(t).getUTCHours() >= 15 ? 10 : 3) };

// helpers bound to a mounted chart
const hitRect = (chart) => chart.hit.getBoundingClientRect();
function hoverAt(chart, frac) {
  const r = hitRect(chart);
  chart.hit.dispatchEvent(new PointerEvent('pointermove', { clientX: r.left + r.width * frac, clientY: r.top + 40, bubbles: true }));
}
const chipVal = (chart, key) => chart.chips[key].val.textContent;
const chipPrice = (chart, key) => chart.chips[key].price?.textContent ?? null;
const sumRow = (chart, label) => [...chart.bandSum.children].find((d) => d.firstChild.textContent === label)?.lastChild.textContent;
const num = (s) => parseFloat(String(s).replace(/[^\d.\-]/g, ''));
const yTop = (chart) => Math.max(...[...chart.gGrid.querySelectorAll('text')].map((t) => num(t.textContent)).filter(Number.isFinite));
const noNaN = (root) => {
  const bad = [...root.querySelectorAll('*')].flatMap((el) => [...el.attributes].filter((a) => /NaN|Infinity/.test(a.value)).map((a) => `${el.tagName}[${a.name}=${a.value.slice(0, 40)}]`));
  return bad;
};

// ================================================================== mount & data
test('mount({header, rows}) renders chart + 5 default cards', async () => {
  const { chart: el, cards } = host();
  const b = track(await mount(el, { data: synth(), cards }));
  assert.ok(el.querySelector('svg.efc-nav') && el.querySelector('.efc-plot svg'), 'svgs present');
  assert.equal(cards.querySelectorAll('.efc-card').length, 5, 'default cards');
  assert.equal(b.chart.data.t.length, 3 * 96);
});

test('mount(records[]) and mount(CSV text) give identical datasets', async () => {
  const raw = synth({ days: 1 });
  const records = raw.rows.map((r) => Object.fromEntries(HEADER.map((h, i) => [h, r[i]])));
  const csv = [HEADER.join(','), ...raw.rows.map((r) => r.join(','))].join('\n');
  const a = track(await mount(host().chart, { data: records }));
  const b = track(await mount(host().chart, { data: csv }));
  assert.equal(a.chart.data.values.demand.join(), b.chart.data.values.demand.join());
});

test('mount({url}) fetches JSON and CSV (by content type)', async () => {
  const raw = synth({ days: 1 });
  const jsonUrl = URL.createObjectURL(new Blob([JSON.stringify(raw)], { type: 'application/json' }));
  const csvUrl = URL.createObjectURL(new Blob([[HEADER.join(','), ...raw.rows.map((r) => r.join(','))].join('\n')], { type: 'text/csv' }));
  const a = track(await mount(host().chart, { url: jsonUrl }));
  const b = track(await mount(host().chart, { url: csvUrl }));
  assert.equal(a.chart.data.t.length, 96);
  assert.equal(b.chart.data.t.length, 96);
});

test('mount rejects on HTTP errors and missing targets', async () => {
  await assert.rejects(mount(host().chart, { url: '/definitely-missing.json' }), /HTTP 404/);
  await assert.rejects(mount('#no-such-element', { data: synth() }), /element not found/);
});

test('autoMount reads data-* attributes (view, y-lock, cards-show)', async () => {
  const { wrap } = host();
  const url = URL.createObjectURL(new Blob([JSON.stringify(synth())], { type: 'application/json' }));
  wrap.innerHTML = `<div id="am-cards"></div><div data-energy-flow data-src="${url}" data-cards="#am-cards" data-view="tod" data-y-lock data-cards-show="demand,grid"></div>`;
  await autoMount(wrap);
  await frames();
  const el = wrap.querySelector('[data-energy-flow]');
  assert.ok(el.hasAttribute('data-efc-mounted'));
  assert.equal(wrap.querySelectorAll('#am-cards .efc-card').length, 2, 'cards-show picked 2');
  assert.equal(el.querySelectorAll('.efc-todcol').length, 5, 'ToD view');
  assert.equal(el.querySelector('.efc-lock').getAttribute('aria-checked'), 'true', 'y-lock on');
  cleanups.push(() => el.replaceChildren());
});

test('preset:false with custom columns/series/metrics', async () => {
  const rows = [];
  for (let b = 1; b <= 96; b++) rows.push({ day: '2026-09-01', slot: b, Load: 900, Wind: 400, DG: 500 });
  const { chart: el, cards } = host();
  const b = track(await mount(el, {
    preset: false, data: rows, dateKey: 'day', blockKey: 'slot', columns: { load: 'Load', wind: 'Wind', dg: 'DG' },
    series: [{ key: 'wind', label: 'Wind' }, { key: 'dg', label: 'DG set' }, { key: 'load', label: 'Load', type: 'line' }],
    metrics: [{ label: 'DG', series: 'dg' }], cards,
  }));
  assert.equal(Object.keys(b.chart.chips).sort().join(), 'dg,load,wind');
  assert.equal(cards.querySelectorAll('.efc-card').length, 1);
  assert.match(cards.textContent, /12\.00\s*MWh/, 'DG 500 kW × 24 h');
});

// ================================================================== timeline hover + band
test('hover: band shows exact kW of the hovered block for every source', async () => {
  const b = track(await mount(host().chart, { data: synth() }));
  await frames();
  hoverAt(b.chart, 0.5);
  const i = b.chart.store.get().hover;
  assert.ok(i != null, 'hover set');
  for (const k of ['demand', 'grid', 'market', 'renewable']) {
    assert.equal(num(chipVal(b.chart, k)), Math.round(b.chart.data.values[k][i]), `${k} value`);
  }
  assert.ok(b.chart.bandEl.classList.contains('is-live'));
});

test('hover: crosshair + one dot per non-zero area and per line', async () => {
  const b = track(await mount(host().chart, { data: synth() }));
  await frames();
  hoverAt(b.chart, 0.55); // ~13:12 → solar, grid, market on; surplus off
  const i = b.chart.store.get().hover;
  const nonZero = ['renewable', 'localBattery', 'govBattery', 'grid', 'market', 'surplus'].filter((k) => b.chart.data.values[k][i] > 0).length;
  assert.equal(b.chart.gCross.querySelectorAll('line').length, 1, 'one crosshair');
  assert.equal(b.chart.gCross.querySelectorAll('circle').length, nonZero + 1, 'dots');
});

test('band idle shows the latest block in view', async () => {
  const b = track(await mount(host().chart, { data: synth({ lastBlocks: 50 }) }));
  await frames();
  assert.match(b.chart.bandWhen.textContent, /Latest in view/);
  assert.match(b.chart.bandWhen.textContent, /12:30/, 'block 50 ends 12:30');
});

test('band summary: supply excludes surplus; surplus / shortfall sign and value', async () => {
  const b = track(await mount(host().chart, { data: synth() }));
  await frames();
  const [i0] = b.chart.span;
  const at = (block) => { b.chart.store.set({ hover: i0 + block - 1 }); };
  at(40); // demand = supply − 100 → surplus +100
  assert.equal(sumRow(b.chart, 'Surplus'), '+100 kW');
  at(80); // demand = supply + 100 → shortfall
  assert.equal(sumRow(b.chart, 'Shortfall'), '−100 kW');
  at(20);
  assert.equal(sumRow(b.chart, 'Balance'), 'Balanced');
  const i = b.chart.store.get().hover;
  const supply = ['renewable', 'localBattery', 'govBattery', 'grid', 'market'].reduce((s, k) => s + b.chart.data.values[k][i], 0);
  assert.equal(num(sumRow(b.chart, 'Supply')), Math.round(supply));
});

test('band RE share = renewable / demand at the block', async () => {
  const b = track(await mount(host().chart, { data: synth() }));
  await frames();
  hoverAt(b.chart, 0.5);
  const i = b.chart.store.get().hover;
  const want = Math.round(Math.min(1, b.chart.data.values.renewable[i] / b.chart.data.values.demand[i]) * 100);
  assert.equal(sumRow(b.chart, 'RE share'), `${want}%`);
});

test('pointerleave clears hover; cards return to descriptions', async () => {
  const { chart: el, cards } = host();
  const b = track(await mount(el, { data: synth(), cards }));
  await frames();
  hoverAt(b.chart, 0.4);
  assert.match(cards.textContent, /@ \d\d:\d\d ·/);
  b.chart.hit.dispatchEvent(new PointerEvent('pointerleave'));
  assert.equal(b.chart.store.get().hover, null);
  assert.ok(!/@ \d\d:\d\d ·/.test(cards.textContent), 'no instant readings');
});

test('keyboard: arrows step 1 block, Shift+arrow 4, Home/End', async () => {
  const b = track(await mount(host().chart, { data: synth() }));
  await frames();
  const [i0, i1] = b.chart.span;
  b.chart.hit.dispatchEvent(new FocusEvent('focus'));
  assert.equal(b.chart.store.get().hover, i1, 'focus → last block');
  const key = (k, shift = false) => b.chart.hit.dispatchEvent(new KeyboardEvent('keydown', { key: k, shiftKey: shift, bubbles: true }));
  key('ArrowLeft');
  assert.equal(b.chart.store.get().hover, i1 - 1);
  key('ArrowLeft', true);
  assert.equal(b.chart.store.get().hover, i1 - 5);
  key('Home');
  assert.equal(b.chart.store.get().hover, i0);
  key('End');
  assert.equal(b.chart.store.get().hover, i1);
  assert.match(b.chart.srEl.textContent, /Demand/, 'screen-reader announcement');
});

// ================================================================== cards
test('cards total the visible range and follow range changes', async () => {
  const { chart: el, cards } = host();
  const b = track(await mount(el, { data: synth(), cards }));
  await frames();
  const firstCard = () => num(cards.querySelector('.efc-card-value').textContent);
  const expect = () => { const [a, z] = b.chart.getVisibleSpan(); return +(aggregator(b.chart.data, a, z).energy('demand') / 1000).toFixed(2); };
  assert.close(firstCard(), expect(), 0.006, 'today');
  b.chart.showDay(b.chart.days()[1]);
  await frames();
  assert.close(firstCard(), expect(), 0.006, 'peak day');
  b.chart.showAll();
  await frames();
  assert.close(firstCard(), expect(), 0.006, 'all');
});

test('card hover highlights its series; click hides it (survivor colours unchanged)', async () => {
  const { chart: el, cards } = host();
  const b = track(await mount(el, { data: synth(), cards }));
  await frames();
  const gridCard = [...cards.querySelectorAll('.efc-card')].find((c) => /Grid/.test(c.textContent));
  const marketColor = b.chart.colorMap.market;
  gridCard.dispatchEvent(new MouseEvent('mouseenter'));
  assert.ok(b.chart.chips.grid.b.classList.contains('is-hl'));
  assert.ok(b.chart.gAreas.querySelector('[data-key="market"]').classList.contains('efc-dim'), 'others dimmed');
  gridCard.dispatchEvent(new MouseEvent('mouseleave'));
  gridCard.click();
  await frames();
  assert.equal(b.chart.chips.grid.b.getAttribute('aria-pressed'), 'false');
  assert.equal(gridCard.getAttribute('aria-pressed'), 'false');
  assert.ok(!b.chart.gAreas.querySelector('[data-key="grid"]'), 'grid area removed');
  assert.equal(b.chart.gAreas.querySelector('[data-key="market"]').getAttribute('fill'), marketColor, 'market keeps its colour');
});

test('peak card: value = max demand, description names its time', async () => {
  const { chart: el, cards } = host();
  const b = track(await mount(el, { data: synth(), cards }));
  b.chart.showAll();
  await frames();
  const peak = [...cards.querySelectorAll('.efc-card')].find((c) => /Peak/.test(c.textContent));
  const max = Math.max(...b.chart.data.values.demand);
  assert.equal(num(peak.querySelector('.efc-card-value').textContent), max);
  assert.match(peak.querySelector('.efc-card-sub').textContent, /^at \d\d:\d\d on Sep \d+$/);
});

// ================================================================== prices
test('timeline hover with prices: per-block price per source, demand blank, surplus "not purchased"', async () => {
  const b = track(await mount(host().chart, { data: synth(), prices: PRICES }));
  await frames();
  const [i0] = b.chart.span;
  b.chart.store.set({ hover: i0 + 64 - 1 }); // block 64 = 15:45 end → starts 15:30
  assert.equal(chipPrice(b.chart, 'grid'), '@ ₹9.00/kWh');
  assert.equal(chipPrice(b.chart, 'market'), '@ ₹10.00/kWh');
  assert.equal(chipPrice(b.chart, 'renewable'), '@ ₹4.00/kWh');
  assert.equal(chipPrice(b.chart, 'demand').trim(), '');
  assert.equal(chipPrice(b.chart, 'surplus'), 'not purchased');
});

test('price cards: Avg Purchase Price is volume-weighted over the visible range', async () => {
  const { chart: el, cards } = host();
  const b = track(await mount(el, { data: synth(), prices: PRICES, cards }));
  await frames();
  const card = [...cards.querySelectorAll('.efc-card')].find((c) => /Avg Purchase/.test(c.textContent));
  assert.ok(card, 'price card added automatically when prices exist');
  const [a, z] = b.chart.getVisibleSpan();
  const agg = aggregator(b.chart.data, a, z);
  const keys = ['renewable', 'localBattery', 'govBattery', 'grid', 'market'].filter((k) => agg.hasPrice(k));
  const want = keys.reduce((s, k) => s + agg.cost(k), 0) / keys.reduce((s, k) => s + agg.energy(k), 0);
  assert.equal(card.querySelector('.efc-card-value').textContent.replace(/\s/g, ''), `₹${want.toFixed(2)}/kWh`);
});

// ================================================================== ToD
test('ToD: one column per zone, width proportional to hours', async () => {
  const b = track(await mount(host().chart, { data: synth(), view: 'tod' }));
  await frames();
  const cols = b.chart.todCols;
  assert.equal(b.chart.gAreas.querySelectorAll('.efc-todcol').length, 5);
  const pxPerHour = (cols.at(-1).x1 - cols[0].x0) / 24;
  for (const c of cols) assert.close(c.x1 - c.x0, c.hours * pxPerHour, 1, `${c.name} width`);
});

test('ToD: column AREA is proportional to energy', async () => {
  const b = track(await mount(host().chart, { data: synth({ lastBlocks: 96 }), view: 'tod' }));
  await frames();
  const areas = ['renewable', 'localBattery', 'govBattery', 'grid', 'market'];
  const ratios = b.chart.todCols.map((c) => {
    const px = [...b.chart.gAreas.querySelectorAll('.efc-todcol')][b.chart.todCols.indexOf(c)].querySelectorAll('path.efc-area');
    const h = [...px].filter((p) => areas.includes(p.dataset.key)).reduce((s, p) => s + p.getBBox().height, 0);
    const e = areas.reduce((s, k) => s + c.energy[k], 0);
    return (h * (c.x1 - c.x0)) / e;
  });
  const avg = ratios.reduce((a, r) => a + r, 0) / ratios.length;
  for (const r of ratios) assert.close(r / avg, 1, 0.05, 'area/energy constant (±5% for gaps + rounded corners)');
});

test('ToD hover: band shows zone volume, weighted price and cost per source', async () => {
  const b = track(await mount(host().chart, { data: synth(), view: 'tod', prices: PRICES }));
  b.chart.showAll();
  await frames();
  const cols = b.chart.todCols;
  const zi = 3; // Normal 10:00–19:00: grid 6→9 split at noon, market 3→10 split at 15:00
  const c = cols[zi];
  hoverAt(b.chart, (c.x0 + c.x1) / 2 / b.chart.dim.W);
  assert.equal(b.chart.store.get().hoverZone.index, zi);
  assert.match(b.chart.bandWhen.textContent, /Normal · 10:00–19:00/);
  assert.equal(chipPrice(b.chart, 'grid'), `@ ₹${c.price.grid.toFixed(2)}/kWh`);
  assert.equal(chipPrice(b.chart, 'market'), `@ ₹${c.price.market.toFixed(2)}/kWh`);
  // grid: 2h @6 + 7h @9 → weighted (not mean 7.5)
  assert.close(c.price.grid, (2 * 6 + 7 * 9) / 9, 1e-9, 'grid weighted price');
  const cost = ['renewable', 'grid', 'market'].reduce((s, k) => s + c.cost[k], 0);
  const vol = ['renewable', 'grid', 'market'].reduce((s, k) => s + c.energy[k], 0);
  assert.equal(sumRow(b.chart, 'Avg price'), `₹${(cost / vol).toFixed(2)}/kWh`);
  assert.equal(sumRow(b.chart, 'Cost'), EF.format.fmtMoney(cost));
});

test('ToD hover: cards switch to the zone and shade it on sparklines', async () => {
  const { chart: el, cards } = host();
  const b = track(await mount(el, { data: synth(), view: 'tod', cards }));
  await frames();
  const c = b.chart.todCols[2];
  hoverAt(b.chart, (c.x0 + c.x1) / 2 / b.chart.dim.W);
  const demandCard = cards.querySelector('.efc-card');
  assert.match(demandCard.querySelector('.efc-card-sub').textContent, new RegExp(`^${c.name} `));
  assert.ok(demandCard.querySelectorAll('.efc-card-spark rect').length > 0, 'zone shaded on sparkline');
});

test('ToD: zone without samples renders "No data yet"', async () => {
  const b = track(await mount(host().chart, { data: synth({ lastBlocks: 60 }), view: 'tod' }));
  await frames();
  assert.equal(b.chart.todCols.at(-1).count, 0);
  assert.match(b.chart.gAreas.textContent, /No data yet/);
});

test('ToD share mode: every column fills to 100%, lock switch hidden', async () => {
  const b = track(await mount(host().chart, { data: synth(), view: 'tod', todScale: 'share' }));
  await frames();
  const y100 = b.chart.y(100);
  const y0 = b.chart.y(0);
  for (const g of b.chart.gAreas.querySelectorAll('.efc-todcol')) {
    const boxes = [...g.querySelectorAll('path.efc-area')].map((p) => p.getBBox());
    if (!boxes.length) continue;
    assert.close(Math.min(...boxes.map((x) => x.y)), y100, 1, 'top at 100%');
    assert.close(Math.max(...boxes.map((x) => x.y + x.height)), y0, 1, 'bottom at 0%');
  }
  assert.ok(b.chart.lockBtn.hidden);
});

test('ToD keyboard: ← → move between zones', async () => {
  const b = track(await mount(host().chart, { data: synth(), view: 'tod' }));
  await frames();
  const key = (k) => b.chart.hit.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
  key('ArrowRight');
  assert.equal(b.chart.store.get().hoverZone.index, 0);
  key('ArrowRight'); key('ArrowRight');
  assert.equal(b.chart.store.get().hoverZone.index, 2);
  key('Escape');
  assert.equal(b.chart.store.get().hoverZone, null);
});

// ================================================================== Lock Y axis
test('Lock Y (timeline): axis follows the view when off, fixed to global max when on', async () => {
  const b = track(await mount(host().chart, { data: synth({ peakDay: 1 }) }));
  await frames();
  const unlocked = yTop(b.chart); // last day: low
  b.chart.lockBtn.click();
  await frames();
  const globalMax = Math.max(...b.chart.data.t.map((_, i) => ['renewable', 'localBattery', 'govBattery', 'grid', 'market', 'surplus'].reduce((s, k) => s + b.chart.data.values[k][i], 0)));
  const locked = yTop(b.chart);
  assert.ok(unlocked < globalMax, 'unlocked tighter than global');
  assert.ok(locked >= globalMax, 'locked covers the global max');
  const tops = [];
  for (const d of b.chart.days()) { b.chart.showDay(d); await frames(); tops.push(yTop(b.chart)); }
  assert.ok(tops.every((t) => t === locked), `same top on every day: ${tops}`);
});

test('Lock Y (ToD): same scale on every day', async () => {
  const b = track(await mount(host().chart, { data: synth({ peakDay: 0 }), view: 'tod', yLock: true }));
  await frames();
  const tops = [];
  for (const d of b.chart.days()) { b.chart.showDay(d); await frames(); tops.push(yTop(b.chart)); }
  assert.ok(new Set(tops).size === 1, `constant: ${tops}`);
  b.chart.setYLock(false);
  await frames();
  assert.ok(yTop(b.chart) < tops[0], 'unlocked last day is tighter');
});

test('Lock Y: hidden series are excluded from the locked scale', async () => {
  const b = track(await mount(host().chart, { data: synth({ peakDay: 1 }), yLock: true }));
  await frames();
  const before = yTop(b.chart);
  b.chart.store.toggle('grid');
  await frames();
  assert.equal(yTop(b.chart), before, 'demand line still carries the grid peak → scale unchanged');
  b.chart.store.toggle('demand');
  await frames();
  assert.ok(yTop(b.chart) < before, 'with grid and demand hidden the lock tightens');
});

test('Lock Y switch: role=switch, aria-checked, onYLockChange, yLockButton:false', async () => {
  const seen = [];
  const b = track(await mount(host().chart, { data: synth(), onYLockChange: (v) => seen.push(v) }));
  const sw = b.chart.lockBtn;
  assert.equal(sw.getAttribute('role'), 'switch');
  assert.equal(sw.textContent, 'Lock Y axis');
  sw.click(); sw.click();
  assert.equal(seen.join(), 'true,false');
  assert.equal(sw.getAttribute('aria-checked'), 'false');
  const c = track(await mount(host().chart, { data: synth(), yLockButton: false }));
  assert.ok(c.chart.lockBtn.hidden);
});

// ================================================================== range, zoom, navigator
test('setRange clamps to the minimum span and the data extent', async () => {
  const b = track(await mount(host().chart, { data: synth() }));
  const [a] = b.chart.store.get().range;
  b.chart.setRange(a, a + 60_000);
  const [x0, x1] = b.chart.store.get().range;
  assert.equal(x1 - x0, 60 * 60_000, 'min span 60 min');
  b.chart.setRange(-1e15, 1e15);
  const [y0, y1] = b.chart.store.get().range;
  assert.ok(y0 >= b.chart.data.t[0] - 15 * 60_000 && y1 <= b.chart.data.t.at(-1) + 86_400_000);
});

test('drag across the plot zooms; double-click shows all; Reset zoom restores', async () => {
  const b = track(await mount(host().chart, { data: synth() }));
  await frames();
  const r = hitRect(b.chart);
  assert.ok(b.chart.resetBtn.hidden, 'no reset at initial range');
  const ev = (type, f) => b.chart.hit.dispatchEvent(new PointerEvent(type, { clientX: r.left + r.width * f, clientY: r.top + 40, pointerId: 1, pointerType: 'mouse', bubbles: true }));
  ev('pointerdown', 0.25); ev('pointermove', 0.5); ev('pointerup', 0.5);
  await frames();
  const [a, z] = b.chart.store.get().range;
  assert.close((z - a) / 3_600_000, 6, 0.3, 'quarter of a day selected');
  assert.ok(!b.chart.resetBtn.hidden, 'reset visible');
  b.chart.hit.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
  assert.ok(b.chart.store.get().range[1] - b.chart.store.get().range[0] > 2 * 86_400_000, 'all days');
  b.chart.resetBtn.click();
  await frames();
  assert.ok(b.chart.resetBtn.hidden, 'back to initial');
});

test('Ctrl+wheel zooms in around the pointer; Shift+wheel pans', async () => {
  const b = track(await mount(host().chart, { data: synth() }));
  b.chart.showAll();
  await frames();
  const r = hitRect(b.chart);
  const span = () => { const [a, z] = b.chart.store.get().range; return z - a; };
  const s0 = span();
  b.chart.hit.dispatchEvent(new WheelEvent('wheel', { deltaY: -50, ctrlKey: true, clientX: r.left + r.width / 2, clientY: r.top + 20, bubbles: true, cancelable: true }));
  assert.ok(span() < s0, 'zoomed in');
  const start = b.chart.store.get().range[0];
  b.chart.hit.dispatchEvent(new WheelEvent('wheel', { deltaY: -100, shiftKey: true, clientX: r.left + 10, clientY: r.top + 20, bubbles: true, cancelable: true }));
  assert.ok(b.chart.store.get().range[0] < start, 'panned left');
});

test('navigator: dragging the window pans the range', async () => {
  const b = track(await mount(host().chart, { data: synth() }));
  b.chart.showDay(b.chart.days()[0]);
  await frames();
  const win = b.chart.navWin.getBoundingClientRect();
  const nav = b.chart.nav;
  const start = b.chart.store.get().range[0];
  const ev = (type, x) => (type === 'pointerdown' ? b.chart.navWin : nav).dispatchEvent(new PointerEvent(type, { clientX: x, clientY: win.top + 5, pointerId: 2, bubbles: true }));
  ev('pointerdown', win.left + win.width / 2); ev('pointermove', win.left + win.width / 2 + 100); ev('pointerup', win.left + win.width / 2 + 100);
  assert.ok(b.chart.store.get().range[0] > start, 'moved right');
});

// ================================================================== data edge cases
test('load(): new block keeps the window pinned to "now"', async () => {
  const raw = synth({ lastBlocks: 50 });
  const b = track(await mount(host().chart, { data: raw }));
  const before = b.chart.store.get().range;
  raw.rows.push(['2026-09-26', 51, '', 1000, 0, 0, 1000, 0, 0, 0]);
  await b.load({ header: raw.header, rows: raw.rows });
  await frames();
  assert.equal(b.chart.data.t.length, 3 * 96 - 96 + 51);
  assert.equal(b.chart.store.get().range[0], before[0] + 15 * 60_000, 'shifted by one block');
});

test('empty window: band "No data in view", cards zero, no NaN anywhere', async () => {
  const { chart: el, cards, wrap } = host();
  const b = track(await mount(el, { data: synth({ lastBlocks: 96 }), cards }));
  const last = b.chart.data.t.at(-1);
  b.store.set({ range: [last, last + 3_600_000] }); // strictly after the final sample
  await frames();
  assert.match(b.chart.bandWhen.textContent, /No data in view/);
  assert.equal(num(cards.querySelector('.efc-card-value').textContent), 0);
  hoverAt(b.chart, 0.5);
  assert.equal(b.chart.store.get().hover, null, 'nothing to hover');
  assert.equal(noNaN(wrap).join(' '), '');
});

test('all-zero data and a single sample render without NaN', async () => {
  const zeros = { header: HEADER, rows: Array.from({ length: 96 }, (_, i) => ['2026-09-26', i + 1, '', 0, 0, 0, 0, 0, 0, 0]) };
  const one = { header: HEADER, rows: [['2026-09-26', 1, '', 500, 0, 0, 500, 0, 0, 0]] };
  for (const data of [zeros, one]) {
    const { wrap, chart: el, cards } = host();
    const b = track(await mount(el, { data, cards }));
    await frames();
    hoverAt(b.chart, 0.01);
    b.chart.setView('tod');
    await frames();
    b.chart.setYLock(true);
    await frames();
    assert.equal(noNaN(wrap).join(' '), '', 'no NaN attributes');
  }
});

test('missing block (gap) is bridged; energy counts only real samples', async () => {
  const raw = synth({ days: 2 });
  raw.rows = raw.rows.filter((r) => r[1] !== 96);
  const { wrap, chart: el } = host();
  const b = track(await mount(el, { data: raw }));
  b.chart.showAll();
  await frames();
  assert.equal(b.chart.data.t.length, 2 * 95);
  assert.equal(noNaN(wrap).join(' '), '');
});

// ================================================================== themes, a11y, misc
test('setTheme: series colours follow roles; chrome variables switch for dark', async () => {
  const { chart: el } = host();
  const b = track(await mount(el, { data: synth() }));
  b.chart.setTheme('contrast', 'dark');
  await frames();
  assert.equal(b.chart.colorMap.grid, themes.contrast.dark.roles.grid);
  assert.equal(el.style.getPropertyValue('--efc-surface'), themes.contrast.dark.surface);
  assert.equal(b.chart.gAreas.querySelector('[data-key="grid"]').getAttribute('fill'), themes.contrast.dark.roles.grid);
});

test('registerTheme: custom role colours applied, missing chrome filled in', async () => {
  registerTheme({ name: 'test-brand', light: { roles: { grid: '#123456', demand: 'ink' } } });
  const b = track(await mount(host().chart, { data: synth(), theme: 'test-brand', mode: 'light' }));
  assert.equal(b.chart.colorMap.grid, '#123456');
  assert.equal(b.chart.t.surface, '#fcfcfb');
});

test('table view: one row per visible block; ToD table has zones + price columns', async () => {
  const b = track(await mount(host().chart, { data: synth(), prices: PRICES }));
  b.chart.setTableVisible(true);
  await frames();
  const [a, z] = b.chart.getVisibleSpan();
  assert.equal(b.chart.tableEl.querySelectorAll('tbody tr').length, z - a + 1);
  b.chart.setView('tod');
  await frames();
  assert.equal(b.chart.tableEl.querySelectorAll('tbody tr').length, 5);
  assert.match(b.chart.tableEl.querySelector('thead').textContent, /Grid \(₹\/kWh\)/);
});

test('exportCSV downloads the visible range; exportPNG produces a PNG', async () => {
  const b = track(await mount(host().chart, { data: synth() }));
  await frames();
  const clicks = [];
  const blobs = [];
  const origClick = HTMLAnchorElement.prototype.click;
  const origURL = URL.createObjectURL;
  HTMLAnchorElement.prototype.click = function () { clicks.push({ name: this.download }); };
  URL.createObjectURL = (blob) => { blobs.push(blob); return origURL(blob); };
  try {
    b.chart.exportCSV();
    await b.chart.exportPNG();
  } finally { HTMLAnchorElement.prototype.click = origClick; URL.createObjectURL = origURL; }
  assert.equal(clicks[0].name, 'energy-flow-2026-09-26.csv');
  assert.equal(clicks[1].name, 'energy-flow-2026-09-26.png');
  const csv = await blobs[0].text();
  const [a, z] = b.chart.getVisibleSpan();
  assert.equal(csv.trim().split('\n').length, z - a + 2, 'header + rows');
  const png = blobs[1];
  assert.equal(png.type, 'image/png');
  assert.ok(png.size > 5000);
});

test('labels are rendered as text (no HTML injection)', async () => {
  const { wrap, chart: el, cards } = host();
  const evil = '<img src=x onerror="window.__pwned=1">';
  track(await mount(el, {
    data: synth(), cards,
    series: [{ key: 'grid', label: evil }, { key: 'demand', label: 'Demand', type: 'line' }],
    metrics: [{ label: evil, series: 'grid' }],
  }));
  await frames();
  assert.equal(wrap.querySelectorAll('img').length, 0);
  assert.ok(wrap.textContent.includes(evil));
  assert.ok(!window.__pwned);
});

test('destroy() empties the element and detaches from the store', async () => {
  const { chart: el } = host();
  const b = await mount(el, { data: synth() });
  const store = b.store;
  b.destroy();
  assert.equal(el.children.length, 0);
  store.set({ hover: 5 }); // must not throw or re-render
  assert.equal(el.children.length, 0);
});

test('two charts sharing a store: hover and zoom stay in sync', async () => {
  const store = createStore();
  const series = EF.energySupplyPreset.series;
  const data = DS(synth());
  const A = new EnergyFlowChart(host().chart, { store, data, series });
  const B = new EnergyFlowChart(host().chart, { store, data, series });
  liveCharts.add(A); liveCharts.add(B);
  cleanups.push(() => { liveCharts.delete(A); liveCharts.delete(B); A.destroy(); B.destroy(); });
  await frames();
  hoverAt(A, 0.3);
  assert.equal(B.gCross.querySelectorAll('line').length, 1, 'B shows crosshair');
  A.showDay(A.days()[0]);
  assert.equal(B.store.get().range[0], A.store.get().range[0]);
});

test('resize: chart re-lays out to its container', async () => {
  const { wrap, chart: el } = host(1000);
  const b = track(await mount(el, { data: synth() }));
  await frames();
  const w1 = b.chart.dim.W;
  wrap.style.width = '600px';
  for (let k = 0; k < 30 && b.chart.dim.W > w1 - 300; k++) { await sleep(50); b.chart.flush(); }
  if (b.chart.dim.W > w1 - 300 && (document.hidden || /Headless/.test(navigator.userAgent))) skip('ResizeObserver is not delivered in hidden/headless tabs — covered when run in a visible browser');
  assert.ok(b.chart.dim.W < w1 - 300, `width ${w1} → ${b.chart.dim.W}`);
});

test('phone width (360px): nothing overflows the container', async () => {
  const { wrap, chart: el, cards } = host(360);
  track(await mount(el, { data: synth(), cards, prices: PRICES }));
  await frames(3);
  const right = wrap.getBoundingClientRect().right;
  const over = [...wrap.querySelectorAll('.efc > *, .efc-cards, .efc-card, .efc-plot svg')]
    .filter((n) => { const r = n.getBoundingClientRect(); return r.width > 0 && r.right > right + 1; });
  assert.equal(over.map((n) => n.className).join(','), '');
});

test('dist bundle: <script> exposes window.EnergyFlow with the same API', async () => {
  await new Promise((res, rej) => { const s = document.createElement('script'); s.src = '../../dist/energy-flow-chart.min.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  const G = window.EnergyFlow;
  for (const k of ['mount', 'autoMount', 'withPrices', 'computeTod', 'SAMPLE_PRICES', 'registerTheme', 'EnergyFlowChart']) assert.ok(G[k], `EnergyFlow.${k}`);
  const b = await G.mount(host().chart, { data: synth(), view: 'tod', yLock: true });
  cleanups.push(() => b.destroy());
  assert.equal(b.chart.todCols.length, 5);
});

// ------------------------------------------------------------------ run
const rowsEl = document.getElementById('rows');
const results = [];
for (const [i, t] of tests.entries()) {
  const t0 = performance.now();
  let error = null;
  try {
    await t.fn();
    await frames(1);
    // global invariant: no NaN/Infinity in any rendered attribute
    const bad = noNaN(stage);
    if (bad.length) throw new AssertionError(`NaN in DOM: ${bad.slice(0, 3).join(' ')}`);
  } catch (e) { error = e; }
  const skipped = error instanceof SkipError;
  if (skipped) { results.push({ name: t.name, ok: true, skipped: error.message, ms: 0 }); }
  for (const c of cleanups.reverse()) { try { c(); } catch { /* already gone */ } }
  cleanups = [];
  const ms = Math.round(performance.now() - t0);
  if (skipped) error = null;
  else results.push({ name: t.name, ok: !error, ms, error: error ? String(error.stack || error).split('\n').slice(0, 3).join('\n') : null });
  const tr = document.createElement('tr');
  const label = skipped ? `skipped: ${results.at(-1).skipped}` : error ? 'FAIL' : `ok · ${ms} ms`;
  for (const [txt, cls] of [[i + 1], [t.name], [label, error ? 'bad' : 'ok'], [error ? results.at(-1).error : '', 'err']]) {
    const td = document.createElement('td'); td.textContent = txt; if (cls) td.className = cls; tr.appendChild(td);
  }
  rowsEl.appendChild(tr);
}
const failed = results.filter((r) => !r.ok);
const status = document.getElementById('status');
const skippedN = results.filter((r) => r.skipped).length;
status.textContent = failed.length ? `FAIL: ${failed.length} of ${results.length} failed` : `PASS: ${results.length - skippedN} of ${results.length} passed${skippedN ? `, ${skippedN} skipped` : ''}`;
status.className = failed.length ? 'fail' : 'pass';
document.title = status.textContent;
document.getElementById('summary').textContent = JSON.stringify({ total: results.length, failed: failed.length, results });
window.__TEST_RESULTS__ = results;
