# SlotHeatmap

Seven days by 96 blocks: each cell is one 15-minute block, filled with the IEX series at an opacity proportional to cleared kW. Empty blocks sit as `surface-2` wells.

```js
ErgOS.heatmap(el, { rows: [{ label: 'Tue 13', values: [/* 96 kW */] }, …], max: 2800, series: 'iex' });
```

Hours are marked every 3 hours. Every cell carries a native tooltip (day, block, time, kW). Show a gradient key in the card header.
