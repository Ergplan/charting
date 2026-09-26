import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fromBlockRows, fromRecords, parseCSV, parseDay, parseClock, aggregator, indexSpan } from '../src/data.js';
import { computeTod, normaliseZones, DEFAULT_TOD_ZONES } from '../src/tod.js';
import { fmtMoney, fmtPrice, fmtEnergy, fmtPower, niceTicks, timeTicks, fmtRange } from '../src/format.js';
import { createStore } from '../src/store.js';
import { toDataset, resolveMetrics } from '../src/mount.js';
import { energySupplyPreset, SAMPLE_PRICES } from '../src/presets.js';

const U = (d, h = 0, m = 0) => Date.UTC(2026, 8, d, h, m);

// ---------------------------------------------------------------- adapters
test('empty input produces an empty, well-formed dataset', () => {
  const ds = fromBlockRows([], { columns: { a: 'A' } });
  assert.deepEqual(ds.t, []);
  assert.deepEqual(ds.values.a, []);
});

test('block rows: start stamping shifts by one block', () => {
  const ds = fromBlockRows([{ Date: '2026-09-01', Block: 1, A: 1 }], { columns: { a: 'A' }, stamp: 'start' });
  assert.equal(ds.t[0], Date.UTC(2026, 8, 1, 0, 0));
});

test('block rows: time column only (no Block) → block derived from HH:MM', () => {
  const rows = [{ Date: '2026-09-01', T: '00:15', A: 1 }, { Date: '2026-09-01', T: '00:30', A: 2 }];
  const ds = fromBlockRows(rows, { columns: { a: 'A' }, blockKey: null, timeKey: 'T' });
  assert.deepEqual(ds.t, [Date.UTC(2026, 8, 1, 0, 15), Date.UTC(2026, 8, 1, 0, 30)]);
});

test('block rows: 30-minute blocks', () => {
  const ds = fromBlockRows([{ Date: '2026-09-01', Block: 48, A: 1 }], { columns: { a: 'A' }, blockMinutes: 30 });
  assert.equal(ds.t[0], Date.UTC(2026, 8, 2));
});

test('non-numeric / blank / thousands-separated values', () => {
  const ds = fromBlockRows([{ Date: '2026-09-01', Block: 1, A: '1,234.5' }, { Date: '2026-09-01', Block: 2, A: '' }, { Date: '2026-09-01', Block: 3, A: 'n/a' }], { columns: { a: 'A', missing: 'Nope' } });
  assert.deepEqual(ds.values.a, [1234.5, 0, 0]);
  assert.deepEqual(ds.values.missing, [0, 0, 0], 'absent column → zeros, never undefined');
});

test('parseDay accepts ISO, Excel serial, Date and US m/d/yyyy', () => {
  assert.equal(parseDay('2026-09-26'), U(26));
  assert.equal(parseDay(46291), U(26));
  assert.equal(parseDay('9/26/2026'), U(26));
  assert.throws(() => parseDay('yesterday'), /Unrecognised date/);
});

test('parseClock', () => {
  assert.equal(parseClock('24:00'), 1440);
  assert.equal(parseClock('7:05'), 425);
  assert.ok(Number.isNaN(parseClock('noon')));
});

test('fromRecords: ISO / epoch / Date inputs, unsorted, 5-minute step inferred', () => {
  const ds = fromRecords([
    { ts: Date.UTC(2026, 8, 1, 0, 10), v: 3 },
    { ts: '2026-09-01T00:00', v: 1 },
    { ts: '2026-09-01 00:05', v: 2 },
  ], { time: 'ts', columns: { v: 'v' } });
  assert.deepEqual(ds.values.v, [1, 2, 3]);
  assert.equal(ds.stepMinutes, 5);
});

test('parseCSV: CRLF, blank lines, trailing newline, header whitespace', () => {
  const r = parseCSV(' a , b \r\n1,2\r\n\r\n3,4\r\n');
  assert.deepEqual(r, [{ a: '1', b: '2' }, { a: '3', b: '4' }]);
});

test('toDataset accepts every documented shape', () => {
  const cfg = { ...energySupplyPreset };
  const header = ['Date', 'Block', 'Total Demand (kW)', 'Grid Supply (kW)'];
  const rows = [['2026-09-01', 1, 100, 100], ['2026-09-01', 2, 200, 200]];
  const fromCompact = toDataset({ header, rows }, cfg);
  const fromRecordsIn = toDataset(rows.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]]))), cfg);
  const fromCsv = toDataset(`${header.join(',')}\n${rows.map((r) => r.join(',')).join('\n')}`, cfg);
  for (const ds of [fromCompact, fromRecordsIn, fromCsv]) {
    assert.deepEqual(ds.values.demand, [100, 200]);
    assert.deepEqual(ds.values.renewable, [0, 0]);
  }
  assert.equal(toDataset(fromCompact, cfg), fromCompact, 'a Dataset passes straight through');
  assert.throws(() => toDataset(42, cfg), /data must be/);
});

// ---------------------------------------------------------------- ranges
test('indexSpan edge cases: before, after, exact, empty window', () => {
  const t = [10, 20, 30];
  const empty = ([a, b]) => b < a;
  assert.ok(empty(indexSpan(t, -100, 5)), 'window before the data is empty');
  assert.ok(empty(indexSpan(t, 30, 100)), 'window after the last sample is empty (sample AT t0 excluded)');
  assert.ok(empty(indexSpan(t, 12, 18)), 'window between samples is empty');
  assert.deepEqual(indexSpan(t, 10, 30), [1, 2]);
  assert.deepEqual(indexSpan(t, 0, 100), [0, 2]);
  for (const [a, b] of [indexSpan(t, 30, 100), indexSpan(t, -5, 5)]) {
    const agg = aggregator({ t, stepMinutes: 15, values: { x: [1, 2, 3] } }, a, b);
    assert.equal(agg.count, 0);
    assert.equal(agg.energy('x'), 0, 'empty span never borrows a neighbouring sample');
  }
});

test('aggregator on a single sample and min/last/first', () => {
  const a = aggregator({ t: [1], stepMinutes: 60, values: { x: [7] } }, 0, 0);
  assert.equal(a.energy('x'), 7);
  assert.equal(a.min('x'), 7);
  assert.equal(a.last('x'), 7);
  assert.equal(a.first('x'), 7);
  assert.equal(a.sum('nope'), 0, 'unknown series sums to 0');
});

// ---------------------------------------------------------------- ToD
test('default zones cover the whole day exactly once', () => {
  const z = normaliseZones(DEFAULT_TOD_ZONES);
  assert.equal(z[0].a, 0);
  assert.equal(z.at(-1).b, 1440);
  for (let i = 1; i < z.length; i++) assert.equal(z[i].a, z[i - 1].b);
  assert.equal(z.reduce((s, c) => s + (c.b - c.a), 0), 1440);
});

test('ToD: zone with no samples has count 0 and zero means (renders "No data yet")', () => {
  const ds = { t: [U(1, 1, 0)], stepMinutes: 15, values: { a: [100] } };
  const cols = computeTod(ds, DEFAULT_TOD_ZONES, 0, 0, ['a']);
  assert.equal(cols[0].count, 1);
  assert.equal(cols.at(-1).count, 0);
  assert.equal(cols.at(-1).mean.a, 0);
});

test('ToD: samples in a gap between zones are dropped, not misassigned', () => {
  const ds = { t: [U(1, 12, 15)], stepMinutes: 15, values: { a: [100] } };
  const cols = computeTod(ds, [{ name: 'Morning', start: '06:00', end: '10:00' }], 0, 0, ['a']);
  assert.equal(cols[0].count, 0);
});

test('ToD: multi-day mean power = energy / (hours × days)', () => {
  const t = [];
  const a = [];
  for (let d = 1; d <= 2; d++) for (let b = 1; b <= 96; b++) { t.push(U(d) + b * 15 * 60_000); a.push(d === 1 ? 100 : 300); }
  const cols = computeTod({ t, stepMinutes: 15, values: { a } }, [{ name: 'All', start: '00:00', end: '24:00' }], 0, t.length - 1, ['a']);
  assert.equal(cols[0].mean.a, 200);
  assert.equal(cols[0].days, 2);
  assert.equal(cols[0].energy.a, (100 + 300) * 24);
});

// ---------------------------------------------------------------- formatting
test('money and price formatting (Indian units)', () => {
  assert.equal(fmtMoney(63275), '₹63,275');
  assert.equal(fmtMoney(788000), '₹7.88 L');
  assert.equal(fmtMoney(17470000), '₹1.75 Cr');
  assert.equal(fmtMoney(NaN), '–');
  assert.equal(fmtPrice(4.3456), '₹4.35/kWh');
  assert.equal(fmtPrice(80, { currency: '$', unit: '/MWh', digits: 0 }), '$80/MWh');
  assert.equal(fmtPower(2431), '2,431 kW');
  assert.equal(fmtPower(2431, { auto: true }), '2.43 MW');
  assert.equal(fmtEnergy(2.5e6), '2.50 GWh');
});

test('niceTicks degenerate range and timeTicks spacing', () => {
  assert.deepEqual(niceTicks(0, 0).ticks, [0, 0.5, 1], 'flat-zero data still gets a usable axis');
  const { ticks, step } = timeTicks(U(1), U(2), 1000, 64);
  assert.ok(step >= 60 * 60_000, 'no label closer than 64px on a 1000px day');
  assert.ok(ticks.every((v, i) => i === 0 || v - ticks[i - 1] === step));
  assert.equal(fmtRange(U(20), U(27)), 'Sep 20 00:00 – Sep 26 24:00');
});

// ---------------------------------------------------------------- store
test('store: unsubscribe stops notifications; highlight normalises empty to null', () => {
  const s = createStore();
  let n = 0;
  const off = s.subscribe(() => n++);
  s.setHighlight(['a']);
  s.setHighlight([]);
  assert.equal(s.get().highlight, null);
  off();
  s.set({ hover: 3 });
  assert.equal(n, 2);
});

// ---------------------------------------------------------------- cards selection
test('cards: default 5, +avgPrice when priced, ids by array or comma string, objects pass through', () => {
  const ids = (list) => list.map((m) => m.id || m.label);
  assert.deepEqual(ids(resolveMetrics(undefined, energySupplyPreset, false)), ['demand', 'renewable', 'grid', 'market', 'peak']);
  assert.deepEqual(ids(resolveMetrics(undefined, energySupplyPreset, true)).at(-1), 'avgPrice');
  assert.deepEqual(ids(resolveMetrics('grid, cost', energySupplyPreset, true)), ['grid', 'cost']);
  assert.deepEqual(ids(resolveMetrics(['demand', { label: 'Mine', series: 'grid' }], energySupplyPreset, false)), ['demand', 'Mine']);
});

test('cards: unknown id is skipped with a warning listing valid ids', () => {
  const warn = console.warn;
  let msg = '';
  console.warn = (m) => { msg = m; };
  try {
    assert.deepEqual(resolveMetrics(['bogus', 'grid'], energySupplyPreset, false).map((m) => m.id), ['grid']);
  } finally { console.warn = warn; }
  assert.match(msg, /unknown card id "bogus".*demand/);
});

test('SAMPLE_PRICES market curve: evening dearer than midday, all positive', () => {
  const at = (h) => SAMPLE_PRICES.market(U(1, h, 15));
  assert.ok(at(19) > at(13));
  for (let h = 0; h < 24; h++) assert.ok(at(h) > 0);
});

test('fmtPeriod: day, whole days, across months, partial windows', async () => {
  const { fmtPeriod } = await import('../src/format.js');
  const D = 86_400_000;
  assert.equal(fmtPeriod(U(26), U(27)), 'Sat 26 Sep');
  assert.equal(fmtPeriod(U(26), U(27), { long: true }), 'Sat, 26 Sep 2026');
  assert.equal(fmtPeriod(U(20), U(27)), '20–26 Sep');
  assert.equal(fmtPeriod(U(20), U(27), { long: true }), '20–26 Sep 2026');
  assert.equal(fmtPeriod(U(28), U(28) + 7 * D), '28 Sep – 4 Oct');
  assert.equal(fmtPeriod(U(24, 6), U(24, 16)), '24 Sep 06:00–16:00');
  assert.equal(fmtPeriod(U(24, 6), U(25)), '24 Sep 06:00–24:00');
  assert.equal(fmtPeriod(U(23, 18), U(24, 6)), '23 Sep 18:00 – 24 Sep 06:00');
});
