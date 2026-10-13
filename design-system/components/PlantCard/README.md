# PlantCard

A selectable card per plant: name, location, contracted capacity, IEX status and auto-trading state.

Markup: `<button class="eg-plant" aria-pressed="false">` with `eg-plant__head` (icon, name, `eg-plant__loc`, `eg-plant__radio`), `eg-plant__stats` (capacity in MW with a bolt, IEX rate or —) and `eg-plant__foot` (state, auto-trading chip).

- The selected plant becomes a small folder-green card (`is-selected`, `aria-pressed="true"`) with a white check in the radio. Exactly one plant is selected; it scopes every number on the screen.
- Lay cards out in a horizontal row of 4 with paging buttons for more ("8 units").
- Plant names are shown as stored (HALDIRAM C1); do not re-case them.
