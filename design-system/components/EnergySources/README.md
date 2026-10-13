# EnergySources

The source vocabulary: one icon and one colour per source, used the same way in tiles, chips, legends and chart bands.

| Source | Icon | Token (Harmony) |
| --- | --- | --- |
| Solar | `solar` (panel and sun) | `series-solar` |
| Wind | `wind` (turbine) | `series-wind` |
| Hydro | `hydro` (drop over water) | `series-hydro` |
| Power exchange (IEX) | `exchange` (two-way arrows) | `series-iex` |
| Grid (DISCOM) | `grid` (pylon) | `series-grid` |
| Battery | `battery` | `series-battery` |

- `eg-source` tile: `data-series` sets its colour, `--share` fills the bar. Values in MWh with the share of demand.
- `eg-srcchip` toggle chip: filled icon when on (`aria-pressed="true"`), ring when off. Use them to show or hide chart layers.
- Four colour schemes ship as tokens: Harmony (default), Volt, Verdant and Aurora (`volt-*`, `verdant-*`, `aurora-*`). Apply one with the `eg-pal-<name>` class on any container. Within a scheme, stacked neighbours differ in lightness, so bands stay apart without relying on hue.
