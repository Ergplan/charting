# ReadoutStrip

The legend that reads values: the time of the block in view on the left, then each series with its swatch, value and a note.

It sits directly above a chart and updates from the chart's `onHover(row)` callback (see SupplyChart). At rest it shows the latest block. Notes explain zeros ("Not purchased", "Idle") and add the price where energy was bought ("@ ₹5.33 / kWh").
