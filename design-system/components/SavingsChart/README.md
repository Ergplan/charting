# SavingsChart

Daily net savings as rounded green bars with the cleared volume as a sand line on a second axis, plus a dashed daily average.

```js
ErgOS.savingsChart(el, { labels: ['Oct 1', …], savings: [/* ₹ */], volume: [/* kWh */], height: 300 });
```

- The best day is labelled above its bar; the average line is labelled at the left.
- Left axis is rupees (compact: 40k, 1.2 L), right axis kWh. Both units are printed at the top of their axis.
- Put the legend in the card header with `eg-legend`, not inside the plot.
