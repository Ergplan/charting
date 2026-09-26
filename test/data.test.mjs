import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fromBlockRows, fromRecords, parseCSV, aggregator, indexSpan, nearestIndex, fromTable } from '../src/data.js';
import { createStore } from '../src/store.js';
import { fmtEnergy, fmtRange, niceTicks, fmtBlockTime } from '../src/format.js';
import { resolveSeriesColors, themes, registerTheme } from '../src/themes.js';
import { toCSV } from '../src/export.js';

const U = (d, h = 0, m = 0) => Date.UTC(2026, 8, d, h, m);

test('block rows: constant export date with block resets → days counted back', () => {
  const rows = [];
  for (let d = 0; d < 3; d++) for (let b = 1; b <= 96; b++) rows.push({ Date: '2026-09-26', Block: b, D: 100 });
  rows.length = 96 * 2 + 10; // today partially filled
  const ds = fromBlockRows(rows, { columns: { demand: 'D' } });
  assert.equal(ds.inferredDays, true);
  assert.equal(ds.t[0], U(24, 0, 15)); // block 1 of first day, end-stamped
  assert.equal(ds.t[95], U(25, 0, 0)); // block 96 = 24:00
  assert.equal(ds.t[96], U(25, 0, 15));
  assert.equal(ds.t[ds.t.length - 1], U(26, 2, 30));
});

test('block rows: explicit changing dates are respected', () => {
  const rows = [
    { Date: '2026-09-01', Block: 95, v: 1 }, { Date: '2026-09-01', Block: 96, v: 2 },
    { Date: '2026-09-02', Block: 1, v: 3 },
  ];
  const ds = fromBlockRows(rows, { columns: { v: 'v' } });
  assert.equal(ds.inferredDays, false);
  assert.deepEqual(ds.t, [Date.UTC(2026, 8, 1, 23, 45), Date.UTC(2026, 8, 2), Date.UTC(2026, 8, 2, 0, 15)]);
});

test('aggregator integrates kW → kWh by block length', () => {
  const ds = { t: [1, 2, 3, 4], stepMinutes: 15, values: { a: [400, 400, 800, 0] } };
  const a = aggregator(ds, 0, 3);
  assert.equal(a.energy('a'), 400); // (400+400+800) × 0.25 h
  assert.equal(a.max('a'), 800);
  assert.equal(a.argmax('a'), 2);
  assert.equal(a.avg('a'), 400);
});

test('span + nearest index', () => {
  const t = [10, 20, 30, 40];
  assert.deepEqual(indexSpan(t, 15, 35), [1, 2]);
  assert.deepEqual(indexSpan(t, 0, 100), [0, 3]);
  assert.deepEqual(indexSpan(t, 20, 40), [2, 3]); // (t0, t1]: the sample AT t0 closes the previous interval
  assert.equal(nearestIndex(t, 24), 1);
  assert.equal(nearestIndex(t, 26), 2);
});

test('fromRecords sorts and infers the step', () => {
  const ds = fromRecords([{ ts: '2026-09-01 00:30', v: '2' }, { ts: '2026-09-01 00:15', v: '1,000' }], { time: 'ts', columns: { v: 'v' } });
  assert.deepEqual(ds.values.v, [1000, 2]);
  assert.equal(ds.stepMinutes, 15);
});

test('parseCSV handles quotes', () => {
  const r = parseCSV('a,b\n"x, y",2\n"say ""hi""",3\n');
  assert.deepEqual(r, [{ a: 'x, y', b: '2' }, { a: 'say "hi"', b: '3' }]);
});

test('store notifies only on change and toggles', () => {
  const s = createStore();
  const seen = [];
  s.subscribe((_, c) => seen.push(c.join()));
  s.set({ hover: 1 });
  s.set({ hover: 1 });
  s.toggle('grid');
  s.set({ range: [1, 2] });
  s.set({ range: [1, 2] });
  assert.deepEqual(seen, ['hover', 'hidden', 'range']);
  assert.ok(s.get().hidden.has('grid'));
});

test('colours follow the entity, not the rank', () => {
  const series = [{ key: 'a' }, { key: 'b' }, { key: 'c', role: 'grid' }, { key: 'd', color: '#123456' }];
  const c = resolveSeriesColors(series, themes.energy, 'light');
  assert.equal(c.a, themes.energy.light.palette[0]);
  assert.equal(c.b, themes.energy.light.palette[1]);
  assert.equal(c.c, themes.energy.light.roles.grid);
  assert.equal(c.d, '#123456');
  const t = registerTheme({ name: 'brand', light: { palette: ['#111111'] } });
  assert.equal(t.dark.palette[0], '#111111'); // dark falls back to light variant
  assert.equal(t.light.surface, '#fcfcfb'); // chrome defaults filled in
});

test('formatting', () => {
  assert.equal(fmtEnergy(43480), '43.48 MWh');
  assert.equal(fmtEnergy(14), '14 kWh');
  assert.equal(fmtBlockTime(U(27)), '24:00');
  assert.equal(fmtRange(U(26), U(27)), 'Sat, 26 Sep 2026 · 00:00–24:00');
  assert.deepEqual(niceTicks(0, 3119).ticks, [0, 1000, 2000, 3000, 4000]);
});

test('CSV export round-trips values', () => {
  const ds = { t: [U(26, 0, 15)], stepMinutes: 15, block: [1], values: { a: [1.5] } };
  assert.equal(toCSV(ds, [{ key: 'a', label: 'A' }]), 'Date,Time,Block,A (kW)\n2026-09-26,00:15,1,1.5');
});

test('real export: 7 days, energy balances with the source file', async () => {
  const { readXlsx } = await import('../tools/xlsx-to-json.mjs');
  const path = process.env.EFC_XLSX || `${process.env.HOME}/Downloads/Energy Supply Chart 2026-09-26.xlsx`;
  let x;
  try { x = readXlsx(path); } catch { return; } // file not present on this machine → skip
  const ds = fromBlockRows(fromTable(x.header, x.rows), { columns: { demand: 'Total Demand (kW)', grid: 'Grid Supply (kW)' } });
  assert.equal(ds.t.length, 638);
  assert.equal(ds.t[0], U(20, 0, 15));
  assert.equal(ds.t[ds.t.length - 1], U(26, 15, 30));
  const a = aggregator(ds, 0, ds.t.length - 1);
  assert.equal(Math.round(a.energy('demand') / 10) / 100, 294.13); // MWh
});

test('ToD columns: width in hours, samples assigned by interval start, wrap split', async () => {
  const { computeTod, normaliseZones } = await import('../src/tod.js');
  const z = normaliseZones([{ name: 'Night', start: '22:00', end: '06:00' }, { name: 'Day', start: '06:00', end: '22:00' }]);
  assert.deepEqual(z.map((c) => [c.name, c.a, c.b]), [['Night', 0, 360], ['Day', 360, 1320], ['Night', 1320, 1440]]);
  // block ending 06:00 belongs to Night (starts 05:45); block ending 06:15 to Day
  const ds = { t: [U(1, 6, 0), U(1, 6, 15)], stepMinutes: 15, values: { a: [100, 200] } };
  const cols = computeTod(ds, [{ name: 'Night', start: '22:00', end: '06:00' }, { name: 'Day', start: '06:00', end: '22:00' }], 0, 1, ['a']);
  assert.equal(cols[0].energy.a, 25);
  assert.equal(cols[1].energy.a, 50);
  assert.equal(cols[1].hours, 16);
});

test('ToD view reproduces the TOD export (24 Sep pair) over all 7 days', async () => {
  const { readXlsx } = await import('../tools/xlsx-to-json.mjs');
  const { computeTod, DEFAULT_TOD_ZONES } = await import('../src/tod.js');
  const dir = process.env.EFC_DIR || `${process.env.HOME}/Downloads`;
  let blocks, tod;
  try {
    blocks = readXlsx(`${dir}/Energy Supply Chart 2026-09-24.xlsx`);
    tod = readXlsx(`${dir}/Energy Supply TOD Chart 2026-09-24.xlsx`);
  } catch { return; } // files not present → skip
  const cols = { demand: 'Total Demand (kW)', grid: 'Grid Supply (kW)', market: 'Energy Market (kW)', renewable: 'Renewable Energy (kW)' };
  const ds = fromBlockRows(fromTable(blocks.header, blocks.rows), { columns: cols });
  const res = computeTod(ds, DEFAULT_TOD_ZONES, 0, ds.t.length - 1, Object.keys(cols));
  tod.rows.forEach((r, zi) => {
    assert.ok(Math.abs(res[zi].energy.demand - r[1]) < 1, `${r[0]} demand ${res[zi].energy.demand} vs ${r[1]}`);
    assert.ok(Math.abs(res[zi].energy.grid - r[4]) < 1, `${r[0]} grid`);
    assert.ok(Math.abs(res[zi].energy.market - r[6]) < 1, `${r[0]} market`);
  });
});
