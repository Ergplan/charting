# SegmentedControl

A pill track of 2 to 4 mutually exclusive views: Day view / Month to date, 1 day / 7 days, Timeline / ToD.

Markup: `<div class="eg-seg" role="group" aria-label="…">` holding `<button aria-pressed="true|false">`. The pressed segment rises as `glass-strong` and its icon turns `accent`. Use `eg-seg--sm` inside card headers and `eg-seg--glass` when the control sits directly on the aurora canvas.

The consumer toggles `aria-pressed`. Use tabs-like segments for views of the same data only; navigation between screens belongs in the sidebar or dock.
