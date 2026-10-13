# TrendChart

Two or three overlaid series on one axis, the clean way: a bright series with a glowing line and a deep fade, a dashed series with a quiet grey fade, a cursor with value pills on top and an outlined time pill below. Built for actual vs forecast, savings vs target, this month vs last.

```js
ErgOS.trendChart(el, {
  series: [
    { key: 'demand', label: 'Forecast', values: [...], dashed: true },
    { key: 'iex', label: 'Actual', values: [...] }      // null where there is no data yet
  ],
  now: 88, cursor: 44, height: 360, unit: 'kW',
  xLabel: function (i) { return months[i]; }          // for non-slot data
});
```

- The dashed series always draws first, the bright series over it. The pill of the series nearest the pointer turns solid.
- Wrap the card in `eg-pal-volt` for the chartreuse look shown here, or keep Harmony.
- Range pills (`eg-pills`) sit in the card header: All, Day, Week, Month.
