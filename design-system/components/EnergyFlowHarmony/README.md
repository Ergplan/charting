# EnergyFlowHarmony

The production supply chart (`EnergyFlowChart` from this repo) in the Harmony theme: the same data engine, toolbar, ToD view, pinned crosshair, CSV and PNG export and linked KPI cards, drawn with Harmony's smooth fading bands, glowing top edges and dotted demand line.

```js
EnergyFlow.mount('#chart', { url: '/api/energy.json', cards: '#cards', theme: 'harmony' });
// or: new EnergyFlowChart(el, { data, series, theme: 'harmony' })
```

- Use this for real plant data. `ErgOS.supplyChart` (harmony.js) is the lightweight presentational version for prototypes and marketing pages.
- Series roles map to Harmony colours: `solar`, `wind`, `hydro`, `renewable`, `market` (power exchange), `grid`, `localBattery`, `govBattery`, `surplus`, `demand`.
- Card icons: `solar`, `wind`, `hydro`, `exchange`, `pylon`, plus the originals (`bolt`, `battery`, `grid`, `market`, `rupee`, `peak`).
- Switch scheme with `chart.setTheme('volt' | 'verdant' | 'aurora')`.
