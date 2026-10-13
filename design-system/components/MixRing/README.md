# MixRing

A thick, gapped ring for the share of each source in today's demand, with the headline share in the centre and a value legend beside it.

```js
ErgOS.ring(el, { parts: [{ key: 'hydro', value: 3.39 }, { key: 'wind', value: 4.57 }, { key: 'solar', value: 3.11 }, { key: 'iex', value: 16.83 }, { key: 'grid', value: 22.65 }], size: 176, stroke: 14 });
```

Wrap it in `eg-ringwrap` with an `eg-ringwrap__center` for the label. Inside the folder the grid arc turns white and the IEX arc Harmony. Use at most five parts; zero parts are skipped but still listed in the legend.
