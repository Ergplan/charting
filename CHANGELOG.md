# Changelog

## 1.5.0 — battery (BESS) and where the surplus went

Added
- **Surplus destinations**: with `BESS Charge`, `Banked` (and optionally `Wasted`) columns, the undivided "Surplus RE" layer splits into **To BESS**, **Banked** and **Wasted**, hatched above the demand line. Wasted defaults to surplus − charge − banked. `allocateSurplus()`, preset `prepare`.
- **BESS discharge** labelled as such in the supply stack (below demand).
- **Battery in the band**: a small vertical battery showing SoC at the cursor (red under 20%), ▲ Charging / ▼ Discharging / Idle with kW, and banked / wasted so far. In ToD: SoC at the end of the zone and the energy in / out. Included in the PNG export.
- `type: 'state'` series (SoC): read by the battery and cards, never stacked or drawn.
- Cards `bessSoc` (added to the defaults when SoC exists), `bessCharged`, `banked`, `wasted`; metric `format: 'soc'`.
- Notes for above-demand layers: "Into the battery", "To the DISCOM bank", "Curtailed".
- `bessCapacityKWh` for SoC in kWh; datasets carry `present` (columns found), so optional series appear only when the data has them.
- Icons `bank`, `curtail`; roles `bessCharge`, `banked`, `wasted`, `soc` in every theme.
- `demo/bess-sample.js`: illustrative 4 MWh / 1 MW battery for the demos.

Changed
- The "Local battery" label is now "BESS discharge".
- CSV and table headers use each series' own unit (SoC in %).


## 1.4.1 — blended price and cost in the band

- The readout band's summary now shows **Blended price** (volume-weighted ₹/kWh across the sources that supplied power) and **Block cost** in the timeline (kW × block hours × price), or **Cost** in ToD. "Avg price" was renamed to "Blended price".
- A source with zero volume still shows its rate beside its note ("Idle · ₹6.80", "Not purchased · ₹3.00").
- `demo/harmony.html` and the ergOS demo's Today screen pass prices (`SAMPLE_PRICES`, illustrative), so each source shows its price in the band.

## 1.4.0 — Harmony by default, custom date range, smoothing

Added
- **Custom date range**: a third toolbar segment, **Custom**, plus the design system's `eg-range` from → to date pills, each opening the native date picker. In day mode a single date pill jumps to any day. API: `customRange`, `setCustomRange(from, to)`, `chart.customRange`, `customRangeLimit`, `onCustomRange`, `rangeMode: 'custom'`, `data-from` / `data-to`, a React `customRange` prop, and `toolbar: { custom, dates }`.
- **Smoothing**: `smoothing: N` draws a centred N-block moving average (geometry only; readings, cards, totals and exports stay raw). Also `data-smoothing` and a React prop.
- Harmony chart behaviour from the design system's SupplyChart:
  - a cursor that rests on the latest block
  - value pills (dashed demand pill, solid focus pill in the source colour; the band under the pointer dims the others)
  - outlined tick pills, thinned to fit, with a ‹ time › cursor pill whose arrows step blocks
  - a hatched "N blocks to go" future zone
  - band source icons, "Block n of 96", and zero notes ("Not purchased", "Idle", "No generation"; series `zeroNote`)
- Harmony StatTile cards: tinted series icon, period, 32px light metric, monotone sparkline fading into the glass, footnote; glass + blur + line + shadow-edge.
- `panel` option: the chart draws its own Harmony glass panel (on by default in Harmony; `panel: false` inside an existing `eg-glass` section).
- `loadFonts` / `injectFonts()`: Urbanist is loaded once from Google Fonts when the page lacks it.
- Glass tokens (`glass`, `glass-strong`, `surface-2`, `shadow-edge`, `shadow-float`) in the Harmony themes, from `tokens.json`.
- ToD columns in Harmony fade from their top edge with a 2px line in the source colour.

Changed
- **The default theme is now `harmony`** (was `energy`), and unknown theme names fall back to Harmony. Pass `theme: 'energy'` for the classic look.
- `apps/ergos-demo` Today screen passes `panel={false}` (its section is already glass).
- `demo/index.html` runs on Harmony tokens, with a Raw / Light / Strong smoothing control.

Fixed
- Band readings no longer shrink and overlap in the phone-width scroller.


## 1.3.0 — ergOS Harmony

Added
- **ergOS Harmony design system** in `design-system/`: tokens (`tokens.json` → generated `tokens.css` / `tokens.js`), the `eg-` component kit (`harmony.css`), the `window.ErgOS` runtime (`harmony.js`, typed in `harmony.d.ts`), 30 component and screen previews with usage guidelines, and a generated gallery (`npm run build:ds`).
- **Harmony chart themes** `harmony`, `volt`, `verdant`, `aurora`: Harmony skin for toolbar, readout band and cards; smooth monotone curves; gradient fills fading from each band's top edge; glowing top lines; dotted demand line. New roles `solar`, `wind`, `hydro` and price roles `dam`, `rtm`, `gdam`, `marginalVC`, `spareVC`, `buyWindow`, `sellWindow`.
- Chart options `curve: 'smooth'`, `fill: 'solid' | 'gradient'`, `glow` (default `null` → the theme decides).
- `registerTheme({ extends })` to build a theme on top of another.
- **PriceLandscape**: canvas heatmap of a year of block prices with hover readout, keyboard navigation and day selection.
- **PriceProfile**: one day's DAM / RTM / GDAM step lines against the marginal state VC and cheapest spare VC, with automatic or supplied buy and sell windows.
- `createPriceExplorer` links the two; `fromPriceRows`, `tradeWindows`, `dayStats`, `colormaps`, `colorAt`, `colormapCSS`, `samplePriceYear` in `prices.js`.
- Card icons `solar`, `wind`, `hydro`, `exchange`, `pylon`.
- **Next.js demo app** `apps/ergos-demo` (`npm run demo:next`): Today, Savings, Prices, Actual vs forecast, Real talk, Mobile, Brand and the design-system gallery, built only from Harmony and this library.
- **jouleWise logo in Harmony glass** (`design-system/assets/logo/`): glass wordmark for dark and light grounds, glass orb mark, app icon, mono, and a classic 2D glass version in the original gold; generator in `tools/logo/`.
- `PriceLandscape.setColormap()`.
- `demo/harmony.html`, `docs/HARMONY.md`, tests for themes, curves, prices, tokens and the new charts (node 57, browser 62).

Changed
- `curve` now defaults to `null` (the theme's choice). Classic themes still draw linear, so existing charts look the same.
- The headless browser test runner passes `--no-sandbox` when run as root (containers, CI).
