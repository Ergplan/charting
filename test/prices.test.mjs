import { test } from 'node:test';
import assert from 'node:assert/strict';
import { withPrices, aggregator } from '../src/data.js';
import { computeTod } from '../src/tod.js';

const U = (d, h = 0, m = 0) => Date.UTC(2026, 8, d, h, m);
// 4 blocks: 00:15, 00:30, 18:15, 18:30 (end-stamped)
const base = () => ({ t: [U(1, 0, 15), U(1, 0, 30), U(1, 18, 15), U(1, 18, 30)], stepMinutes: 15, values: { a: [400, 400, 800, 800], b: [100, 0, 0, 100], s: [5, 5, 5, 5] } });

test('flat price', () => {
  const ds = withPrices(base(), { a: 5 });
  assert.deepEqual(ds.prices.a, [5, 5, 5, 5]);
  assert.equal(ds.prices.b, undefined, 'series without a spec stay unpriced');
});

test('per-sample array price, missing entries → NaN', () => {
  const ds = withPrices(base(), { a: [1, 2, 3] });
  assert.deepEqual(ds.prices.a.slice(0, 3), [1, 2, 3]);
  assert.ok(Number.isNaN(ds.prices.a[3]));
});

test('function price receives (t, i, dataset)', () => {
  const ds = withPrices(base(), { a: (t, i, d) => i + d.values.a.length });
  assert.deepEqual(ds.prices.a, [4, 5, 6, 7]);
});

test('ToD tariff uses the interval START (block ending 18:15 starts 18:00)', () => {
  const ds = withPrices(base(), { a: { tod: [{ start: '00:00', end: '18:00', price: 6 }, { start: '18:00', end: '24:00', price: 9 }] } });
  assert.deepEqual(ds.prices.a, [6, 6, 9, 9]);
});

test('ToD tariff wrapping midnight + base fallback for gaps', () => {
  const ds = withPrices(base(), { a: { tod: [{ start: '18:00', end: '00:15', price: 9 }], base: 1 } });
  // 00:00–00:15 interval is inside the wrap; 00:15–00:30 is a gap → base
  assert.deepEqual(ds.prices.a, [9, 1, 9, 9]);
});

test('unsupported spec throws a helpful error', () => {
  assert.throws(() => withPrices(base(), { a: { nope: 1 } }), /unsupported spec for a/);
});

test('withPrices does not mutate the input dataset and merges with existing prices', () => {
  const src = base();
  const one = withPrices(src, { a: 1 });
  const two = withPrices(one, { b: 2 });
  assert.equal(src.prices, undefined);
  assert.deepEqual(Object.keys(two.prices).sort(), ['a', 'b']);
});

test('aggregator cost + VOLUME-weighted average price (not a simple mean)', () => {
  const ds = withPrices(base(), { a: [2, 2, 10, 10] });
  const agg = aggregator(ds, 0, 3);
  // energy: 400,400,800,800 kW × 0.25 h = 100,100,200,200 kWh → cost 200+200+2000+2000
  assert.equal(agg.cost('a'), 4400);
  assert.equal(agg.avgPrice('a'), 4400 / 600);
  assert.notEqual(agg.avgPrice('a'), 6, 'simple mean of prices would be 6');
  assert.ok(Number.isNaN(agg.cost('b')), 'unpriced → NaN cost');
  assert.equal(agg.hasPrice('a'), true);
  assert.equal(agg.hasPrice('b'), false);
});

test('avgPrice is NaN with zero volume; NaN price samples are skipped in cost', () => {
  const ds = withPrices(base(), { b: [3, NaN, 3, 3] });
  const agg = aggregator(ds, 1, 2); // b = 0, 0 in this span
  assert.ok(Number.isNaN(agg.avgPrice('b')));
  assert.equal(aggregator(ds, 0, 3).cost('b'), (100 + 100) * 0.25 * 3);
});

test('computeTod carries cost and weighted price per zone', () => {
  const ds = withPrices(base(), { a: [2, 4, 10, 10] });
  const cols = computeTod(ds, [{ name: 'Day', start: '00:00', end: '18:00' }, { name: 'Eve', start: '18:00', end: '24:00' }], 0, 3, ['a', 'b']);
  assert.equal(cols[0].energy.a, 200);
  assert.equal(cols[0].cost.a, 100 * 2 + 100 * 4);
  assert.equal(cols[0].price.a, 3);
  assert.equal(cols[1].price.a, 10);
  assert.ok(Number.isNaN(cols[0].price.b), 'unpriced series → NaN price');
});
