// Exchange price data for the PriceLandscape heatmap and the PriceProfile chart.
//
// One normalised shape, a day × block matrix per market:
//
//   {
//     days: number[],            // UTC-midnight epoch of each day (wall-clock convention, see data.js)
//     blocks: 96,                // blocks per day
//     blockMinutes: 15,
//     unit: '₹/kWh',
//     markets: { dam: number[], rtm: number[], gdam: number[], marginalVC: number[], spareVC: number[] }
//   }
//
// markets[key][day * blocks + block] is the price of that block (NaN when missing).
// Block b covers b·15 min → (b+1)·15 min, so block 0 is 00:00–00:15.

import { parseDay } from './data.js';

const DAY = 86_400_000;

export const PRICE_MARKETS = ['dam', 'rtm', 'gdam', 'marginalVC', 'spareVC'];

/** Default column names in an exchange/SLDC price export. */
export const DEFAULT_PRICE_COLUMNS = {
  dam: 'DAM',
  rtm: 'RTM',
  gdam: 'GDAM',
  marginalVC: 'Marginal state VC',
  spareVC: 'Cheapest spare VC',
};

const num = (v) => {
  if (v == null || v === '') return NaN;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : NaN;
};

/**
 * Build a price matrix from block rows (one row per day × block).
 * @param {object[]} rows
 * @param {object} [opts]
 * @param {Record<string,string>} [opts.columns]  market key → column name
 * @param {string} [opts.dateKey='Date']
 * @param {string} [opts.blockKey='Block']        1-based block number (1 = 00:00–00:15)
 * @param {number} [opts.blockMinutes=15]
 * @param {'auto'|'kWh'|'MWh'} [opts.unit='auto'] IEX publishes ₹/MWh; 'auto' converts when values look like ₹/MWh
 */
export function fromPriceRows(rows, opts = {}) {
  const { columns = DEFAULT_PRICE_COLUMNS, dateKey = 'Date', blockKey = 'Block', blockMinutes = 15, unit = 'auto' } = opts;
  const blocks = Math.round(1440 / blockMinutes);
  const dayIndex = new Map();
  for (const r of rows) {
    const d = parseDay(r[dateKey]);
    if (!dayIndex.has(d)) dayIndex.set(d, 0);
  }
  const days = [...dayIndex.keys()].sort((a, b) => a - b);
  days.forEach((d, i) => dayIndex.set(d, i));
  const keys = Object.keys(columns);
  const markets = Object.fromEntries(keys.map((k) => [k, new Array(days.length * blocks).fill(NaN)]));
  for (const r of rows) {
    const di = dayIndex.get(parseDay(r[dateKey]));
    const b = Math.round(num(r[blockKey])) - 1;
    if (!(b >= 0 && b < blocks)) continue;
    for (const k of keys) markets[k][di * blocks + b] = num(r[columns[k]]);
  }
  let scale = 1;
  if (unit === 'MWh') scale = 1 / 1000;
  else if (unit === 'auto') {
    const sample = (markets.dam || markets[keys[0]] || []).filter(Number.isFinite).slice(0, 2000).sort((a, b) => a - b);
    const med = sample[Math.floor(sample.length / 2)];
    if (med > 100) scale = 1 / 1000; // ₹/MWh → ₹/kWh
  }
  if (scale !== 1) for (const k of keys) markets[k] = markets[k].map((v) => v * scale);
  return { days, blocks, blockMinutes, unit: '₹/kWh', markets };
}

/** Price of one block, NaN when missing. */
export function priceAt(matrix, market, day, block) {
  const arr = matrix.markets[market];
  if (!arr || day < 0 || day >= matrix.days.length) return NaN;
  const v = arr[day * matrix.blocks + block];
  return v == null ? NaN : v;
}

/** One day's blocks for a market. */
export function dayPrices(matrix, market, day) {
  const arr = matrix.markets[market];
  if (!arr) return [];
  return arr.slice(day * matrix.blocks, (day + 1) * matrix.blocks);
}

/** Index of the day containing epoch t (or the nearest day). */
export function dayIndexOf(matrix, t) {
  if (typeof t !== 'number') t = parseDay(t);
  const d = Math.floor(t / DAY) * DAY;
  let best = 0;
  let gap = Infinity;
  matrix.days.forEach((x, i) => { const g = Math.abs(x - d); if (g < gap) { gap = g; best = i; } });
  return best;
}

/**
 * Buy / sell windows for one day, as block ranges.
 * Default rule (per block, on the reference market):
 *   buy   when the exchange clears BELOW the state's marginal variable cost (cheaper than generating)
 *   sell  otherwise, when it clears ABOVE the cheapest spare unit's variable cost (spare capacity earns)
 * A block whose marginal VC is missing or above `vcCap` (no dispatchable marginal unit) gets no window.
 * @returns {{ type: 'buy'|'sell', from: number, to: number }[]}  `to` is exclusive
 */
export function tradeWindows(matrix, day, { market = 'dam', marginal = 'marginalVC', spare = 'spareVC', vcCap = 20 } = {}) {
  const out = [];
  let cur = null;
  for (let b = 0; b < matrix.blocks; b++) {
    const p = priceAt(matrix, market, day, b);
    const mv = priceAt(matrix, marginal, day, b);
    const sv = priceAt(matrix, spare, day, b);
    let type = null;
    if (Number.isFinite(p) && Number.isFinite(mv) && mv <= vcCap) {
      if (p < mv) type = 'buy';
      else if (Number.isFinite(sv) && p > sv) type = 'sell';
    }
    if (cur && cur.type === type) { cur.to = b + 1; continue; }
    if (cur) out.push(cur);
    cur = type ? { type, from: b, to: b + 1 } : null;
  }
  if (cur) out.push(cur);
  return out;
}

/** Min / mean / max of a market over a day (NaN-safe). */
export function dayStats(matrix, market, day) {
  const v = dayPrices(matrix, market, day).filter(Number.isFinite);
  if (!v.length) return { min: NaN, max: NaN, mean: NaN };
  return { min: Math.min(...v), max: Math.max(...v), mean: v.reduce((a, b) => a + b, 0) / v.length };
}

// ------------------------------------------------------------------ colour maps

/** Sequential colour maps for the heatmap, low → high. */
export const colormaps = {
  /** Charcoal → teal → cyan → mint → volt. The Price landscape look. */
  landscape: ['#0b1722', '#123447', '#1d5c74', '#3591ad', '#7cc9cf', '#c8ec86', '#e4f25a'],
  /** Harmony greens rising into volt. */
  harmony: ['#0b1722', '#163a2a', '#1f5a35', '#2b7445', '#46a064', '#68e78e', '#ddf24b'],
  /** Olive to chartreuse. */
  volt: ['#101708', '#2a3612', '#4a5c1a', '#6f8a22', '#a8c234', '#ddf24b', '#f5fbb0'],
  /** One green ramp. */
  verdant: ['#0e3d22', '#1b5a33', '#2b7445', '#46a064', '#68e78e', '#b5e6c3', '#e6f8ec'],
  /** Light-ground variant: pale to deep teal. */
  landscapeLight: ['#f2f7f5', '#cfe7e6', '#93cbd0', '#4fa3b5', '#1f6f86', '#174a5c', '#0b2a33'],
};

const hexRGB = (h) => { const x = h.replace('#', ''); return [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16)]; };

/** [r, g, b] at position t ∈ [0, 1] along a colour map (name or stop list). */
export function colorAt(map, t) {
  const stops = (typeof map === 'string' ? colormaps[map] : map) || colormaps.landscape;
  const rgb = stops.map(hexRGB);
  if (!Number.isFinite(t)) return null;
  const x = Math.max(0, Math.min(1, t)) * (rgb.length - 1);
  const i = Math.min(rgb.length - 2, Math.floor(x));
  const f = x - i;
  return [0, 1, 2].map((c) => Math.round(rgb[i][c] + (rgb[i + 1][c] - rgb[i][c]) * f));
}

/** CSS linear-gradient for a legend bar. */
export function colormapCSS(map, direction = '90deg') {
  const stops = (typeof map === 'string' ? colormaps[map] : map) || colormaps.landscape;
  return `linear-gradient(${direction}, ${stops.map((c, i) => `${c} ${((i / (stops.length - 1)) * 100).toFixed(1)}%`).join(', ')})`;
}

// ------------------------------------------------------------------ sample data

function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * ILLUSTRATIVE exchange prices for demos and tests: a seeded year with Indian seasonality
 * (winter morning and evening peaks, a solar trough at midday, summer nights at the ₹10 cap).
 * Replace with real IEX / SLDC data in production.
 */
export function samplePriceYear({ start = '2025-09-01', days = 395, seed = 7, blocks = 96 } = {}) {
  const rnd = mulberry32(seed);
  const t0 = parseDay(start);
  const dayList = Array.from({ length: days }, (_, i) => t0 + i * DAY);
  const markets = Object.fromEntries(PRICE_MARKETS.map((k) => [k, new Array(days * blocks)]));
  const cap = 10;
  // seasonal weights by month (Jan → Dec), interpolated by day
  const SUMMER = [0, 0, 0.12, 0.6, 0.95, 1, 0.92, 0.85, 0.55, 0.12, 0, 0];
  const WINTER = [1, 0.85, 0.45, 0.05, 0, 0, 0, 0, 0, 0.15, 0.55, 0.9];
  const seasonal = (tbl, d) => {
    const m = d.getUTCMonth();
    const f = (d.getUTCDate() - 1) / 30;
    return tbl[m] + (tbl[(m + 1) % 12] - tbl[m]) * Math.min(1, f);
  };
  const sig = (x) => 1 / (1 + Math.exp(-x));
  let drift = 0;
  for (let di = 0; di < days; di++) {
    const d = new Date(dayList[di]);
    const summer = seasonal(SUMMER, d);
    const winter = seasonal(WINTER, d);
    const sunday = d.getUTCDay() === 0 ? 0.8 : 1;
    drift = drift * 0.8 + (rnd() - 0.5) * 0.8;
    const tight = rnd() < 0.03 + 0.2 * summer ? 1 : 0; // a scarce day: the night stays at the cap
    const slack = rnd() < 0.05 ? 1 : 0; // a windy, cheap day
    const nightAmp = summer * (4.5 + 3 * rnd());
    const mvBase = 4.8 + 0.6 * rnd();
    for (let b = 0; b < blocks; b++) {
      const h = (b + 0.5) * (24 / blocks);
      const solar = Math.max(0, Math.sin(((h - 6.4) / 12) * Math.PI)) ** 1.3; // midday trough driver
      const evening = Math.exp(-(((h - 19.2) / (1.0 + summer * 2.4)) ** 2));
      const morning = Math.exp(-(((h - 8.0) / 0.9) ** 2));
      const night = sig((h - 20.5) * 1.6) + sig((5.6 - h) * 1.6); // smooth, no hard edge at dawn
      let p = 3.9 + drift
        - solar * (2.5 + 0.9 * summer)
        + evening * (3.4 + 4.0 * summer + 2.6 * winter)
        + morning * (3.4 * winter)
        + night * nightAmp
        + tight * (3 + 3 * rnd()) * (1 - solar * 0.7)
        - slack * 1.6;
      p = p * sunday + (rnd() - 0.5) * 0.3;
      p = Math.max(0.3, Math.min(cap, p));
      const i = di * blocks + b;
      markets.dam[i] = +p.toFixed(2);
      markets.rtm[i] = +Math.max(0.3, Math.min(cap, p + (rnd() - 0.5) * 1.3 + (evening > 0.5 ? 0.7 * rnd() : 0))).toFixed(2);
      markets.gdam[i] = +Math.max(0.3, Math.min(cap, p * (0.93 + 0.12 * night) + (rnd() - 0.5) * 0.45)).toFixed(2);
      // the state's marginal unit: steady, cheaper while solar is up; occasionally no dispatchable unit
      const noUnit = solar > 0.92 && rnd() < 0.15;
      markets.marginalVC[i] = noUnit ? NaN : +(mvBase - (solar > 0.3 ? 0.35 : 0)).toFixed(2);
      markets.spareVC[i] = +(2.5 - solar * 1.1 + evening * 0.8 + (h > 21.5 ? 1.4 : 0)).toFixed(2);
    }
  }
  return { days: dayList, blocks, blockMinutes: 1440 / blocks, unit: '₹/kWh', markets };
}
