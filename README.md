# energy-flow-chart

A zero-dependency charting library for **energy consumption and generation time series**, such as 15-minute block data from meters, SLDC/IEX schedules or plant SCADA. It draws:

- **Timeline view**: every supply source (renewable, batteries, grid, exchange…) stacked as areas, with demand as a dashed line on top. Surplus renewable is hatched above.
- **ToD view**: one column per time-of-day tariff zone. Each **column is as wide as its zone's hours** and filled by the sources that met demand. Height is average kW, so **column area = kWh**.
- **Hover readout band**: a strip above the plot that doubles as the legend. For each source it shows **volume and average purchase price** at the hovered block or zone, plus supply, blended price, cost, surplus/shortfall and RE share.
- **Linked KPI cards**: they total whatever range is visible and follow the hover. Hover a card to highlight its source; click a card to hide or show it.

It works on **any website**: plain HTML with one `<script>` tag, React, Next.js, Vue, Angular, WordPress… There is nothing to configure if your data uses the standard *Energy Supply Chart* export columns.

---

## Contents

1. [Quick start (pick one)](#1-quick-start-pick-one)
2. [Your data](#2-your-data)
3. [Prices: volume and average purchase price](#3-prices-volume-and-average-purchase-price)
4. [Views: Timeline and ToD](#4-views-timeline-and-tod)
5. [Cards](#5-cards)
6. [Colours and themes](#6-colours-and-themes)
7. [Controlling the chart from your UI](#7-controlling-the-chart-from-your-ui)
8. [API reference](#8-api-reference)
9. [Recipes](#9-recipes)
10. [Working on the library](#10-working-on-the-library)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Quick start (pick one)

### A. Any website, no build, no JavaScript

```html
<div id="cards"></div>
<div data-energy-flow data-src="/api/energy.json" data-cards="#cards"></div>

<script src="https://cdn.jsdelivr.net/gh/Ergplan/charting@v1.0.0/dist/energy-flow-chart.min.js"></script>
```

That's all. The script finds every `[data-energy-flow]` element and mounts a chart on it.

| attribute | meaning | default |
|---|---|---|
| `data-src` | URL returning JSON or CSV (see [Your data](#2-your-data)) | required |
| `data-cards` | CSS selector of an element to fill with KPI cards | none |
| `data-cards-show` | which cards, e.g. `demand,grid,market,avgPrice` | 5 defaults |
| `data-view` | `timeline` or `tod` | `timeline` |
| `data-theme` | `energy`, `sunset`, `contrast` | `energy` |
| `data-mode` | `auto`, `light`, `dark` | `auto` |
| `data-height` | chart height in px | `420` |
| `data-refresh` | re-fetch `data-src` every N seconds (live updates) | off |

You can also self-host the bundle: copy `dist/energy-flow-chart.min.js` into your static assets.

### B. Any website, one call (more control)

```html
<div id="cards"></div>
<div id="chart"></div>
<script src="/js/energy-flow-chart.min.js"></script>
<script>
  EnergyFlow.mount('#chart', {
    url: '/api/energy.json',        // or data: rows / CSV text / { header, rows }
    cards: '#cards',
    view: 'tod',
    prices: {                       // optional → volume + ₹/kWh on hover, cost cards
      renewable: 4.20,
      grid: { tod: [ { start: '00:00', end: '06:00', price: 6.2 }, { start: '06:00', end: '24:00', price: 7.3 } ] },
      market: iexPricesPerBlock,    // number[] aligned with the rows
    },
  }).then(function (board) {
    // board.chart → full API (setView, showDay, exportPNG, …)
  });
</script>
```

ES-module sites can import the single-file module instead:
`import { mount } from '/js/energy-flow-chart.esm.js'`.

### C. React / Next.js

```bash
npm i github:Ergplan/charting#v1.0.0       # package name: energy-flow-chart
```

```jsx
'use client';                                   // Next.js App Router only
import { EnergyFlowBoard } from 'energy-flow-chart/react';

export default function EnergyPanel() {
  return <EnergyFlowBoard url="/api/energy" view="tod" refreshSeconds={60} />;
}
```

For **Next.js**, add this to `next.config.js` (the package ships untranspiled ES modules):

```js
module.exports = { transpilePackages: ['energy-flow-chart'] };
```

A complete, build-verified App Router example (page, client component with view toggle and API route) lives in [`examples/nextjs/`](examples/nextjs). Copy the three files into your app.

`EnergyFlowBoard` accepts every [`mount()` option](#mount-options) as a prop. Changing `data`/`url` reloads in place, and changing `view`, `theme` or `mode` updates without a re-mount. `ref` (or `onReady`) gives you the [handle](#mount-handle).

---

## 2. Your data

### Standard export (zero config)

If your rows have these columns, nothing needs configuring:

| Date | Block | Time (IST) | Total Demand (kW) | Renewable Energy (kW) | Surplus Renewable (kW) | Grid Supply (kW) | Local Battery (kW) | Energy Market (kW) | Government Battery (kW) |
|---|---|---|---|---|---|---|---|---|---|
| 2026-09-26 | 1 | 00:15 | 869.22 | 0 | 0 | 869.22 | 0 | 0 | 0 |

The chart accepts that data in any of these shapes:

| shape | example |
|---|---|
| URL to JSON | `url: '/api/energy'` |
| URL to CSV | `url: '/exports/energy.csv'` |
| compact JSON | `{ "header": ["Date","Block",…], "rows": [["2026-09-26",1,…], …] }` |
| records | `[{ "Date": "2026-09-26", "Block": 1, "Total Demand (kW)": 869.22, … }]` |
| CSV text | `data: csvString` |
| a Dataset | output of `fromBlockRows()` / `fromRecords()` |

To convert an Excel export into compact JSON with no dependencies:

```bash
node tools/xlsx-to-json.mjs "Energy Supply Chart 2026-09-26.xlsx" > energy.json
```

### Rules the library applies

- **Blocks are end-stamped:** block 1 = 00:00–00:15 is plotted at 00:15, and block 96 = 24:00. A range covers **(start, end]**, so the 00:00 sample counts toward the previous day.
- **Multi-day exports stamped with the export date** (every row says `2026-09-26`) are detected from the block number resetting to 1. Days are counted backwards so the last run of blocks lands on that date. When dates differ per row, they are used as-is.
- **Missing blocks** (e.g. an export without block 96) are bridged, not invented.
- **kW → kWh** = Σ kW × (block minutes / 60).
- Times are **wall-clock** (IST as written). They render identically in every browser timezone.

### Different column names

Only override what differs; the preset fills in the rest:

```js
EnergyFlow.mount('#chart', {
  url: '/api/plant-7',
  columns: {                       // series key → your column header
    demand: 'Load_kW',
    renewable: 'Solar_kW',
    grid: 'DISCOM_kW',
    market: 'IEX_kW',
    localBattery: 'BESS_kW',
    govBattery: 'Grid_BESS_kW',
    surplus: 'Export_kW',
  },
  dateKey: 'day', blockKey: 'slot', blockMinutes: 15,
});
```

With **timestamps instead of Date/Block**:

```js
EnergyFlow.mount('#chart', { url: '/api/readings', time: 'timestamp', columns: { demand: 'load', grid: 'grid' /* … */ } });
// "2026-09-26 14:15" / ISO strings / epoch-ms all work. The interval is inferred.
```

With **different sources altogether** (e.g. wind + DG + open access), pass your own `series` and `metrics` with `preset: false`. See [Recipes](#custom-sources).

---

## 3. Prices: volume and average purchase price

Supply `prices` and the hover band shows **volume and average ₹/kWh for every source**, plus a blended **Avg price** and total **Cost**. Two extra cards appear: *Avg Purchase Price* and *Purchase Cost*.

```js
prices: {
  renewable: 4.20,                                   // flat (PPA)
  grid: { tod: [                                     // ToD tariff (zone by interval start)
    { start: '00:00', end: '03:00', price: 8.76 },
    { start: '03:00', end: '05:00', price: 7.30 },
    { start: '05:00', end: '10:00', price: 6.21 },
    { start: '10:00', end: '19:00', price: 7.30 },
    { start: '19:00', end: '24:00', price: 8.76 },
  ] },
  market: mcpPerBlock,                               // number[] aligned with rows (IEX MCP)
  localBattery: (t, i, data) => 6.8,                 // function of time / index
  // no entry → "not purchased" (e.g. surplus exported)
}
```

- **Average price over a zone or range** = Σ(kW × h × price) ÷ Σ(kW × h), i.e. weighted by volume, never a simple mean.
- In the **timeline**, the band shows each source's price for the hovered block. In **ToD**, it shows the zone's weighted average and the cost.
- Units default to ₹/kWh. Change them with `priceFormat: { currency: '$', unit: '/MWh', digits: 0 }`.
- `EnergyFlow.SAMPLE_PRICES` holds **illustrative** numbers for demos only. Do not ship it.

If prices come in the same rows as the data (e.g. an `IEX Price (₹/kWh)` column), map them with a function:

```js
prices: (ds) => ({ market: rawRows.map((r) => +r['IEX Price (₹/kWh)']) })
```

---

## 4. Views: Timeline and ToD

```js
board.chart.setView('tod');         // or 'timeline'
board.chart.setOptions({ todScale: 'share' });   // ToD columns filled to 100 %
```

**Timeline**
- hover → vertical crosshair snapped to the block, values in the band
- drag across the plot to zoom, drag or resize the overview strip to pan, `⌘/Ctrl`+scroll to zoom, double-click to show everything
- keyboard: focus the chart, then `←` `→` (Shift = 1 h), `+` `−`, `PageUp` `PageDown`, `Esc`
- `curve: 'step'` draws each block as a flat step; `bands` shades tariff hours

**ToD**
- the range selected in the overview strip is what gets aggregated: one day, or all 7
- hover a column → zone volume, price and cost per source in the band; the cards switch to that zone, and each sparkline shades the zone's blocks
- a zone with no data yet (e.g. evening peak, earlier today) shows as a dashed outline
- zones default to the export convention (blocks 1–12 peak, 13–20 normal, 21–40 off-peak, 41–76 normal, 77–96 peak). Override with:

```js
todZones: [
  { name: 'Off-peak', start: '22:00', end: '06:00', kind: 'offpeak' },   // wrapping zones are split automatically
  { name: 'Normal',   start: '06:00', end: '18:00' },
  { name: 'Peak',     start: '18:00', end: '22:00', kind: 'peak' },      // kind 'peak' gets a shaded background
]
```

---

## 5. Cards

By default you get **5 cards**: Total Demand, Renewable, Grid, Exchange (IEX) and Peak Demand. **Avg Purchase Price** is added when prices are supplied.

**Pick exactly the cards you want by id.** This is the usual way to trim or extend:

```js
metrics: ['demand', 'grid', 'market', 'avgPrice']
```

```html
<div data-energy-flow data-src="/api/energy" data-cards="#cards" data-cards-show="demand,grid,avgPrice"></div>
```

Available ids: `demand` `renewable` `grid` `market` `localBattery` `govBattery` `surplus` `peak` `avgPrice` `cost`. Omit `cards` entirely for no cards.

**Or define your own** (ids and objects can be mixed):

```js
metrics: [
  { label: 'Total Demand', series: 'demand', icon: 'bolt', description: 'Energy consumed' },
  { label: 'RE Share', series: 'renewable', format: 'percent', agg: (a) => a.energy('renewable') / a.energy('demand') },
  { label: 'Peak Demand', series: 'demand', agg: 'max', icon: 'peak', toggle: false },
  { label: 'Grid Avg Price', series: 'grid', agg: 'avgPrice', icon: 'rupee' },
],
```

| option | values |
|---|---|
| `series` | key or keys (summed). Hovering highlights them; clicking toggles them |
| `agg` | `energy` (default, kWh) · `avg` · `max` · `min` · `last` · `avgPrice` · `cost` · `(agg, data) => number` |
| `format` | `energy` · `power` · `percent` · `number` · `price` · `money` · `(v) => string` |
| `description` | string or `(agg, value, data) => string` |
| `instant` | hover reading. `false` disables it; a function returns `[label, value]` |
| `icon` | `bolt sun battery grid market leaf peak rupee surplus plug` or `false` |
| `toggle`, `sparkline`, `color`, `onClick` | as named |

The `agg` object gives `energy(k) sum(k) avg(k) max(k) min(k) argmax(k) values(k) cost(k) avgPrice(k)` over the visible range.

Layout: the cards container is a CSS grid. Set columns yourself, e.g. `#cards { grid-template-columns: repeat(5, 1fr) }`, or set a minimum width with `--efc-card-min: 180px`.

---

## 6. Colours and themes

```js
theme: 'energy' | 'sunset' | 'contrast',  mode: 'auto' | 'light' | 'dark'
```

`mode: 'auto'` follows `<html data-theme="dark|light">` first, then the OS setting.

Your own brand colours:

```js
EnergyFlow.registerTheme({
  name: 'brand',
  light: { accent: '#c9a227', roles: { renewable: '#1baf7a', grid: '#e8a33d', market: '#8e6ff0', surplus: '#e87ba4', demand: 'ink' } },
  dark:  { accent: '#d6b35a', roles: { renewable: '#228f61', grid: '#a36e09', market: '#7457a3', surplus: '#c26c96', demand: 'ink' } },
});
board.chart.setTheme('brand');
```

A series picks its colour in this order:

1. its own `color` (a hex value or `{ light, dark }`)
2. the theme's `roles[role]`
3. the next `palette` slot, in declaration order (never by rank, so hiding a series never recolours the others)

The built-in themes are checked for colour-blind separation between neighbouring stack layers in both modes. If you define your own, keep adjacent stack colours clearly distinct.

Fonts and chrome follow CSS variables on the chart element: `--efc-font`, `--efc-surface`, `--efc-ink`, `--efc-accent`, …

---

## 7. Controlling the chart from your UI

```js
const { chart } = board;
chart.showDay('2026-09-23');        // one calendar day
chart.showLast(48);                 // last 48 hours
chart.showAll();                    // everything
chart.setRange(t0, t1);             // epoch-ms (wall-clock as UTC)
chart.days();                       // [epoch-ms of each day] for building a day picker
chart.setView('tod');
chart.setTheme('contrast', 'dark');
chart.setOptions({ curve: 'step', bands: [...], height: 480 });
chart.setTableVisible(true);        // accessible data table under the chart
chart.exportCSV();  chart.exportPNG();
await board.load('/api/energy?date=2026-09-25');   // swap data, stays pinned to "now"
```

React to the chart:

```js
EnergyFlow.mount('#chart', {
  url, onRangeChange: ([t0, t1]) => updateMyDatePicker(t0),
  onHover: (index) => {},
});
board.store.subscribe((state, changed) => { /* range, hover, hoverZone, hidden, highlight */ });
```

---

## 8. API reference

### Exports

| export | purpose |
|---|---|
| `mount(target, options) → Promise<handle>` | easiest entry, preset-driven |
| `autoMount(root?)` | mount every `[data-energy-flow]` (the script bundle calls it for you) |
| `EnergyFlowChart`, `EnergyCards`, `createEnergyDashboard` | lower-level building blocks |
| `createStore()` | shared state for linking components |
| `fromBlockRows`, `fromRecords`, `fromTable`, `parseCSV`, `toDataset` | data adapters |
| `withPrices(dataset, spec)` | attach prices |
| `computeTod(dataset, zones, i0, i1, keys)` | ToD aggregation (volume, cost, weighted price per zone), no DOM |
| `aggregator(dataset, i0, i1)` | range maths (energy, max, cost, avgPrice…) |
| `themes`, `registerTheme`, `SAMPLE_PRICES`, `presets`, `format` | configuration and helpers |
| `energy-flow-chart/react`: `EnergyFlowBoard`, `EnergyFlowChartView`, `EnergyCardsView` | React bindings |

TypeScript definitions ship in `types/`.

### mount options

| option | type | default |
|---|---|---|
| `url` / `data` | see [Your data](#2-your-data) | none |
| `cards` | selector or element | none |
| `preset` | `'energy-supply'` or `false` | `'energy-supply'` |
| `columns`, `dateKey`, `blockKey`, `timeKey`, `blockMinutes`, `time` | data mapping | preset |
| `series` | `Series[]`: stack order bottom→top | preset |
| `metrics` | card ids and/or `Metric` objects, e.g. `['demand','grid','avgPrice']` | 5 defaults (+ avgPrice if priced) |
| `prices` | `{ key: number \| number[] \| {tod} \| fn }` or `(ds) => that` | none |
| `view` | `'timeline' \| 'tod'` | `'timeline'` |
| `todZones`, `todScale` | zones / `'absolute' \| 'share'` | export zones / `absolute` |
| `theme`, `mode` | see §6 | `energy`, `auto` |
| `height` | px | `420` |
| `curve` | `'linear' \| 'step'` | `linear` |
| `initialRange` | `'last-day' \| 'all' \| [t0, t1]` | `last-day` |
| `live` | `{ series }` pulsing "now" dot, or `false` | preset: demand |
| `bands` | `[{ start, end, label }]` shaded hours | none |
| `refreshSeconds` | poll `url` | off |
| `transform` | `(dataset) => dataset` | none |
| `unit`, `locale`, `priceFormat`, `minSpanMinutes`, `navigator`, `legend`, `yMax` | misc | `kW`, `en-IN` |
| `onRangeChange`, `onHover`, `onThemeChange` | callbacks | none |

### Series

```ts
{ key, label, type?: 'area' | 'line', stack?: string | false, role?, color?, pattern?: 'hatch', dash?, countInTotal?: boolean }
```

Areas stack in declaration order. `type: 'line'` overlays (demand). `countInTotal: false` keeps a layer out of "Supply" and out of price blending (surplus exported).

### mount handle

`{ chart, cards, store, load(input), destroy() }`. Call `destroy()` when removing the element; React does this for you.

---

## 9. Recipes

**Live dashboard**

```js
EnergyFlow.mount('#chart', { url: '/api/energy/today', refreshSeconds: 60, cards: '#cards' });
```

The window stays pinned to the latest block as new data arrives.

**Server side (Next.js route) feeding the chart.** Return `{ header, rows }` straight from your DB query. See [`examples/nextjs/app/api/energy/route.ts`](examples/nextjs/app/api/energy/route.ts).

**Two plants with synced crosshair and zoom**

```js
const store = EnergyFlow.createStore();
new EnergyFlow.EnergyFlowChart(a, { store, data: plantA, series });
new EnergyFlow.EnergyFlowChart(b, { store, data: plantB, series });
```

<a id="custom-sources"></a>**Custom sources**

```js
EnergyFlow.mount('#chart', {
  preset: false,
  url: '/api/site',
  columns: { load: 'Load', wind: 'Wind', dg: 'DG', oa: 'Open Access' },
  series: [
    { key: 'wind', label: 'Wind', color: '#1baf7a' },
    { key: 'oa',   label: 'Open access', color: '#2a78d6' },
    { key: 'dg',   label: 'DG set', color: '#eb6834' },
    { key: 'load', label: 'Load', type: 'line', dash: '6 4', color: { light: '#0b0b0b', dark: '#ffffff' } },
  ],
  metrics: [{ label: 'Load', series: 'load' }, { label: 'DG', series: 'dg', icon: 'plug' }],
  prices: { oa: 5.1, dg: 21.0 },
  cards: '#cards',
});
```

**Chart without cards / without the overview strip:** omit `cards`; pass `navigator: false`.

**Server-side ToD numbers (reports, emails):** `computeTod()` is pure, so it runs in Node.

```js
import { fromBlockRows, withPrices, computeTod, DEFAULT_TOD_ZONES } from 'energy-flow-chart';
const cols = computeTod(withPrices(ds, prices), DEFAULT_TOD_ZONES, 0, ds.t.length - 1, ['grid', 'market']);
cols.map((c) => ({ zone: c.name, kWh: c.energy.grid, avgPrice: c.price.grid, cost: c.cost.grid }));
```

---

## 10. Working on the library

```
src/            the library (ES modules, no runtime dependencies)
  chart.js        EnergyFlowChart: timeline, readout band, navigator, interaction
  tod.js          ToD view + computeTod()
  cards.js        EnergyCards
  mount.js        mount() / autoMount(): the simple entry points
  presets.js      'energy-supply' preset + SAMPLE_PRICES
  data.js         adapters, withPrices(), aggregator()
  themes.js  store.js  format.js  export.js  styles.js
  browser.js      <script> bundle entry (window.EnergyFlow + auto-mount)
react/          React bindings (plain JS, 'use client')
types/          TypeScript definitions
dist/           built bundles, committed so consumers need no build step
examples/       plain-html · nextjs (App Router) · react · sample data
demo/           full interactive demo (every control)
test/           node:test suite
tools/          build, dev server, xlsx → JSON converter
```

```bash
npm install          # only dev dependency: esbuild
npm run demo         # http://localhost:5178/demo/  and  /examples/plain-html/
npm test             # 13 tests, including reconciliation against a real TOD export
npm run build        # regenerate dist/ (commit the result)
```

**Releasing:** bump `version` in `package.json`, `npm run build`, commit, then `git tag v1.x.y && git push --tags`. Consumers pin the tag: `github:Ergplan/charting#v1.x.y` for npm, or `cdn.jsdelivr.net/gh/Ergplan/charting@v1.x.y/dist/…` for the script tag.

**Conventions:** no runtime dependencies; SVG output with colours inlined, so PNG export works; every user-supplied label is inserted with `textContent`; colours follow the entity, not its position.

---

## 11. Troubleshooting

| symptom | fix |
|---|---|
| Next.js: `SyntaxError: Cannot use import statement` / `document is not defined` | add `transpilePackages: ['energy-flow-chart']`, and render from a `'use client'` component |
| Blank chart, console says `HTTP 404/500` | `url` must return JSON (`{header, rows}` or records) or CSV |
| All values zero | column names don't match. Pass `columns` (see §2) |
| Days offset by one | your blocks are start-stamped: pass `stamp: 'start'` via a custom adapter (`fromBlockRows(rows, { stamp: 'start', … })`) |
| ToD column shows "No data yet" | no samples fall in that zone within the selected range (e.g. evening peak, earlier today) |
| Card prices show `–` | no `prices` entry for that source, or zero volume |
| Chart overflows on mobile | put it in a container with a definite width; inside CSS grid use `grid-template-columns: minmax(0, 1fr)` |
| Wrong colours in dark mode | set `mode`, or set `data-theme` on `<html>`; `auto` follows both |
