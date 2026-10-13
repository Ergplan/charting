# PriceProfile

One day of clearing prices as step lines per block: DAM (bold, glowing), RTM and GDAM, against the state's marginal variable cost (dashed) and the cheapest spare unit's cost (dotted). Buy windows (exchange below the marginal cost) and sell windows (above the spare cost) are shaded behind.

```js
const pp = new EnergyFlow.PriceProfile(el, {
  data, day: '2026-07-04', theme: 'harmony',
  windows: 'auto',            // or [{ type: 'buy', from: 0, to: 24 }, …] from your optimiser, or false
  onDayChange: (day, date) => {}
});
pp.setDay(305); pp.step(1);
```

- Legend chips toggle each series. ‹ › step days; PageUp / PageDown too.
- Hover or arrow keys read every price at a block in a glass card, with the window type.
- The y axis fits the market prices; a reference cost that spikes past it is clipped, never stretches the axis.
- Colours come from the theme's price roles: `dam`, `rtm`, `gdam`, `marginalVC`, `spareVC`, `buyWindow`, `sellWindow`.
