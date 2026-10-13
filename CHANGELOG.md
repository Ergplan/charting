# Changelog

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
