# SupplyChart

Today's energy by source, block by block: smooth stacked bands for hydro, wind, solar, power exchange and grid under the dotted demand line, a hatched forecast zone after now, and a cursor that rests on the latest block.

```js
var chart = ErgOS.supplyChart(el, {
  demand: [/* 96 kW values */],
  layers: [
    { key: 'hydro', values: [/* kW */] }, { key: 'wind', values: [] }, { key: 'solar', values: [] },
    { key: 'iex', values: [] },
    { key: 'grid' }                 // no values: fills the rest up to demand
  ],
  now: 88,                          // index of the latest block
  palette: 'harmony',               // harmony | volt | verdant | aurora
  onHover: function (row) { /* {block, time, demand, focus, hydro, wind, solar, iex, grid} */ }
});
chart.setCursor(36); chart.palette('volt');
```

- **Look:** monotone curves (no overshoot), each band fades from its top edge into the ground, and each top edge carries a 2px line with a soft glow. Layers stack bottom-up in the order given; put steady sources (hydro, wind) at the bottom and the balancing source (grid) on top.
- **Cursor:** above the plot, a dashed pill shows demand and a solid pill in the source colour shows the band under the pointer, with its icon. Hovering a band dims the others. Below, a time pill replaces the nearest tick. Arrow keys move one block, Shift+arrow one hour, Home and End jump to the ends.
- **Ticks** are outlined pills thinned to fit the width: every 1, 2, 3, 4, 6 or 12 hours, never overlapping.
- **Colour schemes:** add `eg-pal-volt`, `eg-pal-verdant` or `eg-pal-aurora` to any container (or call `ErgOS.palette(el, name)`); charts, swatches, source chips and tiles inside it switch together. Harmony is the default.
- Pair it with a ReadoutStrip and source chips (EnergySources) that toggle layers.
