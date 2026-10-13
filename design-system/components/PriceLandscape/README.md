# PriceLandscape

A year of exchange prices in one picture: one column per day, one row per 15-minute block (00:00 at the top), colour from ₹0 to ₹10 per kWh. Seasons, the solar trough and the evening peak read at a glance; click a cell to open that day.

```js
const data = EnergyFlow.fromPriceRows(rows);           // or EnergyFlow.samplePriceYear() for demos
const pl = new EnergyFlow.PriceLandscape(el, {
  data, market: 'dam', domain: [0, 10], theme: 'harmony',
  onSelect: (day, block, info) => profile.setDay(day)   // or use createPriceExplorer
});
```

- Colour maps: `landscape` (charcoal → teal → volt, default), `harmony`, `volt`, `verdant`, or your own stop list. In the light theme `landscape` switches to its light variant.
- Hover shows a glass readout (price, date, block, other markets). Arrow keys move one block or day (Shift: 4 blocks or 7 days), Enter selects, Esc clears.
- The selected day is outlined. Missing blocks draw as the ground colour, never as ₹0.
- Keep the domain fixed (₹0–₹10, the exchange cap) so landscapes compare across plants and years.
