# PriceExplorer

The PriceLandscape and the PriceProfile sharing one store: click any cell in the landscape and the profile below shows that day; step days in the profile and the landscape's outline follows.

```js
const { landscape, profile } = EnergyFlow.createPriceExplorer({
  landscape: '#landscape', profile: '#profile', data, day: '2026-07-04', theme: 'harmony'
});
```

Put the landscape first and the profile directly under it, both full width. Use it on the IEX Data and Trading screens.
