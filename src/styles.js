// Component CSS, injected once per document. Everything is scoped under .efc and
// driven by --efc-* custom properties written by applyThemeVars().

export const css = `
.efc, .efc-cards { font-family: var(--efc-font, system-ui, -apple-system, "Segoe UI", sans-serif); color: var(--efc-ink); }
.efc { position: relative; background: var(--efc-surface); border-radius: 12px; }
.efc *, .efc-cards * { box-sizing: border-box; }

.efc-top { display: flex; align-items: center; justify-content: flex-end; gap: 12px; flex-wrap: wrap; padding: 0 4px 8px; }
.efc-legend { display: flex; flex-wrap: wrap; gap: 4px 6px; align-items: center; }
.efc-legend button {
  all: unset; display: inline-flex; align-items: center; gap: 7px; cursor: pointer;
  padding: 4px 9px 4px 7px; border-radius: 999px; font-size: 12.5px; color: var(--efc-ink2);
  border: 1px solid transparent; transition: background .15s, opacity .15s;
}
.efc-legend button:hover { background: var(--efc-band); }
.efc-legend button:focus-visible { outline: 2px solid var(--efc-accent); outline-offset: 1px; }
.efc-legend button[aria-pressed="false"] { opacity: .45; }
.efc-legend button[aria-pressed="false"] .efc-key { background: transparent !important; box-shadow: inset 0 0 0 1.5px var(--efc-muted); }
.efc-key { width: 12px; height: 12px; border-radius: 3px; flex: none; }
.efc-key.is-line { height: 0; border-radius: 0; border-top: 2px dashed var(--efc-ink); background: none !important; }
.efc-key.is-line.is-solid { border-top-style: solid; }
.efc-key.is-hatch { background-image: repeating-linear-gradient(135deg, transparent 0 2px, var(--efc-surface) 2px 4px) !important; }

.efc-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 10px; margin: 0 0 8px; font-size: 12px; }
.efc-toolbar[hidden], .efc-toolbar [hidden] { display: none !important; }
.efc-tb-spacer { flex: 1; }
.efc-seg { display: inline-flex; border: 1px solid var(--efc-border); border-radius: 8px; overflow: hidden; background: var(--efc-surface); }
.efc-seg button { all: unset; cursor: pointer; padding: 5px 10px; font-weight: 600; color: var(--efc-ink2); white-space: nowrap; }
.efc-seg button + button { border-left: 1px solid var(--efc-border); }
.efc-seg button:hover:not([aria-pressed="true"]) { background: var(--efc-band); }
.efc-seg button[aria-pressed="true"] { background: var(--efc-accent); color: var(--efc-surface); }
.efc-range { display: inline-flex; align-items: center; gap: 4px; }
.efc-period { font-weight: 650; color: var(--efc-ink); min-width: 9.5em; text-align: center; font-variant-numeric: tabular-nums; white-space: nowrap; }
.efc-step { all: unset; cursor: pointer; width: 24px; height: 24px; display: grid; place-items: center; border-radius: 6px; border: 1px solid var(--efc-border); color: var(--efc-ink2); font-size: 15px; line-height: 1; }
.efc-step:hover:not(:disabled) { background: var(--efc-band); }
.efc-step:disabled { opacity: .35; cursor: default; }
.efc-reset, .efc-export {
  all: unset; cursor: pointer; font-size: 12px; font-weight: 600; color: var(--efc-accent); white-space: nowrap;
  padding: 4px 9px; border-radius: 7px; border: 1px solid var(--efc-border); background: var(--efc-surface);
}
.efc-export { display: inline-flex; align-items: center; gap: 5px; color: var(--efc-surface); background: var(--efc-accent); border-color: var(--efc-accent); }
.efc-reset:hover { background: var(--efc-band); }
.efc-export:hover { filter: brightness(1.06); }
.efc-seg button:focus-visible, .efc-step:focus-visible, .efc-export:focus-visible { outline: 2px solid var(--efc-accent); outline-offset: 1px; }
.efc-reset[hidden] { display: none; }
.efc-lock {
  all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
  font-size: 11.5px; color: var(--efc-ink2); white-space: nowrap; padding: 2px 4px; border-radius: 6px;
}
.efc-lock[hidden] { display: none; }
.efc-switch { position: relative; width: 24px; height: 14px; border-radius: 999px; background: var(--efc-axis); transition: background .15s; flex: none; }
.efc-switch::after { content: ""; position: absolute; top: 2px; left: 2px; width: 10px; height: 10px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.25); transition: transform .15s; }
.efc-lock[aria-checked="true"] .efc-switch { background: var(--efc-accent); }
.efc-lock[aria-checked="true"] .efc-switch::after { transform: translateX(10px); }
.efc-lock[aria-checked="true"] { color: var(--efc-ink); }
.efc-lock:focus-visible, .efc-reset:focus-visible { outline: 2px solid var(--efc-accent); outline-offset: 1px; }
@media (prefers-reduced-motion: reduce) { .efc-switch, .efc-switch::after { transition: none; } }

/* readout band: legend + live values, sits directly above the plot */
.efc-band {
  display: flex; align-items: stretch; gap: 0; margin: 0 0 6px; min-height: 52px;
  border: 1px solid var(--efc-border); border-radius: 10px; background: var(--efc-surface);
  font-variant-numeric: tabular-nums; transition: border-color .15s, box-shadow .15s;
}
.efc-band.is-live { border-color: color-mix(in srgb, var(--efc-accent) 55%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--efc-accent) 10%, transparent); }
.efc-band-when { flex: none; display: flex; flex-direction: column; justify-content: center; gap: 1px; padding: 6px 12px; min-width: 124px; border-right: 1px solid var(--efc-border); }
.efc-band.is-pinned { border-color: var(--efc-accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--efc-accent) 16%, transparent); }
.efc-band-when { position: relative; }
.efc-band.is-live .efc-band-when { padding-right: 28px; }
.efc-unpin { all: unset; cursor: pointer; position: absolute; top: 3px; right: 4px; width: 18px; height: 18px; border-radius: 50%; display: grid; place-items: center; font-size: 13px; line-height: 1; color: var(--efc-muted); }
.efc-unpin:hover { background: var(--efc-band); color: var(--efc-ink); }
.efc-unpin:focus-visible { outline: 2px solid var(--efc-accent); }
.efc-band-when b { font-size: 13px; font-weight: 650; color: var(--efc-ink); white-space: nowrap; }
.efc-band-when span { font-size: 11.5px; color: var(--efc-muted); white-space: nowrap; }
.efc-band-items { flex: 1; min-width: 0; display: flex; flex-wrap: wrap; align-content: center; gap: 2px 2px; padding: 4px 6px; }
.efc-band-sum { flex: none; display: flex; align-items: center; gap: 16px; padding: 6px 14px; border-left: 1px solid var(--efc-border); }
.efc-band-sum div { display: flex; flex-direction: column; gap: 1px; }
.efc-band-sum span { font-size: 11px; color: var(--efc-muted); white-space: nowrap; }
.efc-band-sum b { font-size: 13px; font-weight: 650; color: var(--efc-ink); white-space: nowrap; }
.efc-band-sum .pos b { color: var(--efc-good, #0a8a0a); }
.efc-band-sum .neg b { color: var(--efc-bad, #d03b3b); }
.efc-legend .efc-chip { padding: 4px 8px 4px 7px; border-radius: 8px; gap: 6px; }
.efc-chip-label { color: var(--efc-ink2); white-space: nowrap; }
.efc-chip-val { font-weight: 650; color: var(--efc-ink); white-space: nowrap; min-width: 4ch; }
/* priced chips stack: label / volume / price */
.efc-chip:has(.efc-chip-price) { display: inline-grid !important; grid-template-columns: 12px auto; column-gap: 6px; row-gap: 0; align-items: center; padding: 3px 8px 3px 6px; min-width: 0; }
.efc-chip:has(.efc-chip-price) .efc-chip-label { font-size: 11.5px; }
.efc-chip:has(.efc-chip-price) .efc-chip-val { grid-column: 2; font-size: 13px; }
.efc-chip-price { grid-column: 2; font-size: 11px; color: var(--efc-muted); white-space: nowrap; }
.efc-band-sum:has(> :nth-child(4)) { display: grid; grid-template-columns: repeat(3, auto); gap: 4px 16px; align-content: center; }
.efc-chip.is-zero .efc-chip-val, .efc-chip.is-zero .efc-chip-label { color: var(--efc-muted); font-weight: 500; }
.efc-chip.is-hl { background: var(--efc-band); }
.efc-legend button[aria-pressed="false"] .efc-chip-val { font-weight: 500; }
@media (max-width: 760px) {
  .efc-band { flex-wrap: wrap; }
  .efc-band-when { border-right: 0; flex-direction: row; align-items: baseline; gap: 8px; padding: 6px 10px 0; min-width: 0; width: 100%; }
  .efc-band-items { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; width: 100%; padding: 2px 4px; }
  .efc-band-items > *, .efc-legend.efc-band-items > button { flex: none; } /* keep each reading's width inside the scroller (beats the chip's all: unset) */
  .efc-band-sum { border-left: 0; border-top: 1px solid var(--efc-border); width: 100%; justify-content: space-between; padding: 6px 10px; }
}

.efc-plot { position: relative; }
.efc { min-width: 0; }
/* percentage width → zero min-content, so the chart never props its container open when it shrinks */
.efc-plot svg, .efc-nav { display: block; overflow: visible; width: 100%; height: auto; }
.efc-hit { cursor: crosshair; touch-action: pan-y; }
.efc-hit:focus { outline: none; }
.efc-plot:focus-within .efc-focusring { opacity: 1; }
.efc-focusring { opacity: 0; transition: opacity .15s; }
.efc-area, .efc-line { transition: opacity .18s ease; }
.efc-dim { opacity: .18; }
.efc-dimline { opacity: .3; }

.efc-now circle.pulse { animation: efc-pulse 2s ease-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes efc-pulse { 0% { transform: scale(1); opacity: .55; } 100% { transform: scale(3.2); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .efc-now circle.pulse { animation: none; opacity: 0; } }

.efc-nav-wrap { position: relative; margin-top: 6px; }
.efc-nav { touch-action: none; user-select: none; }
.efc-nav .win { cursor: grab; }
.efc-nav .win:active { cursor: grabbing; }
.efc-nav .handle { cursor: ew-resize; }

.efc-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

@media (max-width: 560px) {
  .efc-legend button { font-size: 12px; padding: 3px 7px 3px 5px; gap: 5px; }
}
.efc-table { max-height: 320px; overflow: auto; margin-top: 12px; border: 1px solid var(--efc-border); border-radius: 8px; }
.efc-table[hidden] { display: none; }
.efc-table table { border-collapse: collapse; width: 100%; font-size: 12px; font-variant-numeric: tabular-nums; }
.efc-table th, .efc-table td { padding: 6px 10px; text-align: right; border-bottom: 1px solid var(--efc-grid); white-space: nowrap; }
.efc-table th { position: sticky; top: 0; background: var(--efc-surface); color: var(--efc-ink2); font-weight: 600; }
.efc-table th:first-child, .efc-table td:first-child { text-align: left; }
.efc-table tr.is-hover td { background: var(--efc-band); }

/* ---------------- cards ---------------- */
.efc-cards { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(var(--efc-card-min, 160px), 1fr)); }
.efc-card {
  all: unset; box-sizing: border-box; position: relative; display: flex; flex-direction: column; gap: 1px; min-width: 0;
  padding: 10px 12px 8px 14px; border-radius: 10px; cursor: pointer; overflow: hidden;
  background: var(--efc-surface); border: 1px solid var(--efc-border);
  transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease, border-color .15s;
}
.efc-card::before { content: ""; position: absolute; inset: 0; background: var(--card-color); opacity: .06; pointer-events: none; transition: opacity .15s; }
.efc-card::after { content: ""; position: absolute; left: 0; top: 10px; bottom: 10px; width: 3px; border-radius: 0 3px 3px 0; background: var(--card-color); }
.efc-card.is-static:hover { transform: none; box-shadow: none; }
.efc-card:hover, .efc-card.is-hl { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.07); border-color: color-mix(in srgb, var(--card-color) 45%, transparent); }
.efc-card:hover::before, .efc-card.is-hl::before { opacity: .12; }
.efc-card:focus-visible { outline: 2px solid var(--efc-accent); outline-offset: 2px; }
.efc-card[aria-pressed="false"] { opacity: .5; }
.efc-card[aria-pressed="false"]::after { background: var(--efc-muted); }
.efc-card.is-static { cursor: default; }
.efc-card-top { display: flex; justify-content: space-between; align-items: center; gap: 6px; }
.efc-card-period { margin-top: -1px; font-size: 10.5px; font-weight: 600; color: var(--efc-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-variant-numeric: tabular-nums; }
.efc-card-label { font-size: 11.5px; font-weight: 600; color: var(--efc-ink2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.efc-card-icon { width: 20px; height: 20px; border-radius: 6px; display: grid; place-items: center; flex: none; color: var(--efc-ink2); background: color-mix(in srgb, var(--card-color) 16%, transparent); }
.efc-card-icon svg { width: 12px; height: 12px; }
.efc-card-value { font-size: 19px; font-weight: 700; letter-spacing: -0.01em; line-height: 1.2; color: var(--efc-ink); white-space: nowrap; }
.efc-card-value small { font-size: 11.5px; font-weight: 600; color: var(--efc-ink2); margin-left: 3px; }
.efc-card-sub { font-size: 11px; color: var(--efc-muted); min-height: 1.35em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-variant-numeric: tabular-nums; }
.efc-card-sub.is-live { color: var(--efc-ink2); }
.efc-card-sub.is-live b { color: var(--efc-ink); font-weight: 650; }
.efc-card-spark { display: block; width: 100%; height: 20px; margin-top: 4px; overflow: visible; color: var(--efc-ink2); }

/* ---------------- ergOS Harmony skin (themes harmony / volt / verdant / aurora) ---------------- */
[data-efc-skin="harmony"] { font-feature-settings: "tnum" 1; -webkit-font-smoothing: antialiased; }
.efc[data-efc-skin="harmony"] { border-radius: 20px; }
[data-efc-skin="harmony"] .efc-toolbar { gap: 8px 10px; font-size: 12.5px; margin-bottom: 12px; }
[data-efc-skin="harmony"] .efc-seg { border-radius: 999px; padding: 3px; gap: 2px; background: var(--efc-band); border: 1px solid var(--efc-border); overflow: visible; }
[data-efc-skin="harmony"] .efc-seg button { border-radius: 999px; padding: 6px 14px; font-weight: 500; color: var(--efc-muted); }
[data-efc-skin="harmony"] .efc-seg button + button { border-left: 0; }
[data-efc-skin="harmony"] .efc-seg button:hover:not([aria-pressed="true"]) { background: transparent; color: var(--efc-ink); }
[data-efc-skin="harmony"] .efc-seg button[aria-pressed="true"] { background: var(--efc-glass-strong); color: var(--efc-ink); box-shadow: var(--efc-shadow-edge), 0 2px 8px -2px rgba(0,0,0,0.25); }
[data-efc-skin="harmony"] .efc-step { width: 30px; height: 30px; border-radius: 50%; background: var(--efc-band); }
[data-efc-skin="harmony"] .efc-period { font-weight: 600; }
[data-efc-skin="harmony"] .efc-reset, [data-efc-skin="harmony"] .efc-export {
  border-radius: 999px; padding: 7px 14px; font-weight: 500; color: var(--efc-ink); background: var(--efc-band); border: 1px solid var(--efc-border);
}
[data-efc-skin="harmony"] .efc-export:hover { filter: none; background: var(--efc-border); }
[data-efc-skin="harmony"] .efc-switch { width: 30px; height: 18px; }
[data-efc-skin="harmony"] .efc-switch::after { width: 14px; height: 14px; }
[data-efc-skin="harmony"] .efc-lock[aria-checked="true"] .efc-switch::after { transform: translateX(12px); background: var(--efc-surface); }
/* glass panel around the whole chart (option panel, default on in Harmony): glass + blur-glass + line + shadow-edge */
.efc[data-efc-panel="glass"] {
  padding: 20px 24px 18px; border-radius: 28px; background: var(--efc-glass);
  -webkit-backdrop-filter: blur(22px) saturate(140%); backdrop-filter: blur(22px) saturate(140%);
  border: 1px solid var(--efc-border); box-shadow: var(--efc-shadow-edge), var(--efc-shadow-float);
}
@media (max-width: 640px) { .efc[data-efc-panel="glass"] { padding: 14px 12px 12px; border-radius: 20px; } }
[data-efc-skin="harmony"] .efc-band {
  border-radius: 20px; min-height: 64px; margin-bottom: 4px; background: var(--efc-glass);
  -webkit-backdrop-filter: blur(22px) saturate(140%); backdrop-filter: blur(22px) saturate(140%);
  border-color: var(--efc-border); box-shadow: var(--efc-shadow-edge);
}
[data-efc-skin="harmony"] .efc-band.is-live, [data-efc-skin="harmony"] .efc-band.is-pinned { border-color: color-mix(in srgb, var(--efc-accent) 45%, transparent); box-shadow: var(--efc-shadow-edge), 0 0 0 3px color-mix(in srgb, var(--efc-accent) 10%, transparent); }
[data-efc-skin="harmony"] .efc-key-ico { display: inline-grid; place-items: center; width: 16px; height: 16px; background: none !important; }
[data-efc-skin="harmony"] .efc-legend button[aria-pressed="false"] .efc-key-ico { box-shadow: none; opacity: .5; }
[data-efc-skin="harmony"] .efc-plot svg { overflow: visible; }
[data-efc-skin="harmony"] .efc-timepill-step:hover { fill: var(--efc-ink); }
[data-efc-skin="harmony"] .efc-band-when { padding: 10px 16px; min-width: 140px; }
[data-efc-skin="harmony"] .efc-band-when b { font-size: 15px; }
[data-efc-skin="harmony"] .efc-legend .efc-chip { border-radius: 14px; padding: 6px 10px 6px 8px; }
[data-efc-skin="harmony"] .efc-chip-val { font-size: 14px; font-weight: 600; }
[data-efc-skin="harmony"] .efc-key { border-radius: 4px; }
[data-efc-skin="harmony"] .efc-key.is-line { border-top-style: dotted; border-top-width: 2.5px; }
[data-efc-skin="harmony"] .efc-table { border-radius: 14px; }
[data-efc-skin="harmony"] .efc-seg button:focus-visible, [data-efc-skin="harmony"] .efc-step:focus-visible, [data-efc-skin="harmony"] .efc-export:focus-visible { outline-offset: 2px; }
.efc-cards[data-efc-skin="harmony"] { gap: 14px; }
/* StatTile (design-system/components/StatTile): glass tile, label + tinted series icon, date,
   32px light metric with its unit, a sparkline that fades into the glass, then the footnote */
.efc-cards[data-efc-skin="harmony"] { gap: 16px; }
[data-efc-skin="harmony"] .efc-card {
  padding: 20px; border-radius: 20px; gap: 4px; background: var(--efc-glass);
  -webkit-backdrop-filter: blur(22px) saturate(140%); backdrop-filter: blur(22px) saturate(140%);
  border: 1px solid var(--efc-border); box-shadow: var(--efc-shadow-edge);
}
[data-efc-skin="harmony"] .efc-card::after, [data-efc-skin="harmony"] .efc-card::before { display: none; }
[data-efc-skin="harmony"] .efc-card:hover, [data-efc-skin="harmony"] .efc-card.is-hl { transform: none; background: var(--efc-glass-strong); box-shadow: var(--efc-shadow-edge); border-color: var(--efc-border); }
[data-efc-skin="harmony"] .efc-card-label { font-size: 13px; line-height: 18px; font-weight: 500; color: var(--efc-ink); }
[data-efc-skin="harmony"] .efc-card-period { font-size: 12px; line-height: 16px; font-weight: 400; color: var(--efc-muted); }
[data-efc-skin="harmony"] .efc-card-icon { width: 32px; height: 32px; border-radius: 50%; color: var(--card-color); background: var(--efc-glass-strong); border: 1px solid var(--efc-border); }
[data-efc-skin="harmony"] .efc-card-icon svg { width: 16px; height: 16px; stroke-width: 1.75; }
[data-efc-skin="harmony"] .efc-card-value { margin-top: 10px; font-size: 32px; line-height: 36px; font-weight: 300; letter-spacing: -0.01em; }
[data-efc-skin="harmony"] .efc-card-value small { font-size: 14px; font-weight: 500; color: var(--efc-muted); margin-left: 6px; }
[data-efc-skin="harmony"] .efc-card-spark { height: 40px; margin: 6px -4px 2px; width: calc(100% + 8px); color: var(--card-color); }
[data-efc-skin="harmony"] .efc-card-sub { font-size: 12px; line-height: 16px; }

/* ---------------- date picking: single day pill and the from → to range (design-system Fields: eg-range) ---------------- */
.efc-daterange { display: inline-flex; align-items: center; gap: 2px; padding: 2px; border-radius: 999px; border: 1px solid var(--efc-border); background: var(--efc-surface); }
.efc-daterange[hidden] { display: none; }
.efc-date { all: unset; position: relative; display: inline-flex; align-items: center; gap: 7px; height: 28px; padding: 0 11px; border-radius: 999px; cursor: pointer; color: var(--efc-ink); font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }
.efc-date:hover { background: var(--efc-band); }
.efc-date:focus-visible { outline: 2px solid var(--efc-accent); outline-offset: 2px; }
.efc-date svg { color: var(--efc-accent); flex: none; }
.efc-datewrap { position: relative; display: inline-flex; }
.efc-datewrap[hidden] { display: none; }
.efc-date input { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; border: 0; padding: 0; margin: 0; pointer-events: none; color-scheme: inherit; }
.efc-range-arrow { color: var(--efc-muted); display: inline-grid; place-items: center; padding: 0 2px; }
[data-efc-skin="harmony"] .efc-daterange { background: var(--efc-band); padding: 3px; }
[data-efc-skin="harmony"] .efc-date { height: 32px; padding: 0 12px; font-weight: 500; }
[data-efc-skin="harmony"] .efc-date:hover { background: var(--efc-glass-strong); }

/* ---------------- price landscape (heatmap) ---------------- */
.efc-pl, .efc-pp { padding: 18px 20px 16px; border: 1px solid var(--efc-border); }
.efc-pl-head, .efc-pp-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px 16px; flex-wrap: wrap; margin-bottom: 14px; }
.efc-pl-title, .efc-pp-title { margin: 0; font-size: 22px; line-height: 28px; font-weight: 500; letter-spacing: -0.01em; color: var(--efc-ink); }
[data-efc-skin="harmony"] .efc-pl-title, [data-efc-skin="harmony"] .efc-pp-title { font-weight: 400; font-size: 24px; }
.efc-pl-sub { margin: 2px 0 0; font-size: 13px; color: var(--efc-muted); }
.efc-pl-hint { font-size: 13px; color: var(--efc-muted); padding-top: 6px; }
.efc-pl-plot, .efc-pp-plot { position: relative; min-width: 0; }
.efc-pl-canvas { position: absolute; inset: 0; display: block; }
.efc-pl-svg { position: relative; display: block; width: 100%; height: auto; overflow: visible; cursor: crosshair; outline: none; }
.efc-pl-svg:focus-visible { outline: 2px solid var(--efc-accent); outline-offset: 2px; border-radius: 6px; }
.efc-pl-axis, .efc-pp-axis { fill: var(--efc-muted); font-size: 11px; font-family: var(--efc-mono, ui-monospace, "JetBrains Mono", "SF Mono", Menlo, monospace); letter-spacing: .02em; }
.efc-pp-axis.is-unit { font-weight: 600; }
.efc-pl-sel { fill: none; stroke: var(--efc-ink); stroke-width: 2; }
.efc-pl-col { fill: var(--efc-ink); fill-opacity: .10; }
.efc-pl-cell { fill: none; stroke: var(--efc-ink); stroke-width: 1.5; }
.efc-pl-tip, .efc-pp-tip {
  position: absolute; pointer-events: none; z-index: 2; display: grid; gap: 3px;
  padding: 10px 12px; border-radius: 12px; min-width: 150px;
  background: color-mix(in srgb, var(--efc-tooltip) 92%, transparent); border: 1px solid var(--efc-border);
  -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
  box-shadow: 0 12px 32px -12px rgba(0,0,0,.45); font-size: 12px; color: var(--efc-ink2); font-variant-numeric: tabular-nums;
}
.efc-pl-tip[hidden], .efc-pp-tip[hidden] { display: none; }
.efc-pl-tip b { font-size: 18px; font-weight: 600; color: var(--efc-ink); }
.efc-pl-tip b small { font-size: 11px; font-weight: 500; color: var(--efc-muted); }
.efc-pl-tip em, .efc-pp-tip em { font-style: normal; color: var(--efc-muted); font-size: 11.5px; }
.efc-pl-tip i { font-style: normal; display: flex; gap: 10px; color: var(--efc-ink2); }
.efc-pl-legend { display: flex; align-items: center; gap: 10px; margin: 10px 0 0 54px; font-size: 11px; color: var(--efc-muted); font-family: var(--efc-mono, ui-monospace, "JetBrains Mono", Menlo, monospace); }
.efc-pl-legend[hidden] { display: none; }
.efc-pl-bar { width: min(340px, 50%); height: 12px; border-radius: 999px; }

/* ---------------- price profile ---------------- */
.efc-pp-eyebrow { font-size: 11.5px; letter-spacing: .12em; color: var(--efc-muted); font-family: var(--efc-mono, ui-monospace, "JetBrains Mono", Menlo, monospace); margin-bottom: 4px; }
.efc-pp-right { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: flex-end; }
.efc-pp-legend { display: flex; flex-wrap: wrap; gap: 4px 6px; justify-content: flex-end; }
.efc-pp-key { all: unset; display: inline-flex; align-items: center; gap: 8px; padding: 5px 10px; border-radius: 999px; font-size: 13px; color: var(--efc-ink2); cursor: pointer; }
.efc-pp-key:hover { background: var(--efc-band); }
.efc-pp-key:focus-visible { outline: 2px solid var(--efc-accent); outline-offset: 1px; }
.efc-pp-key[aria-pressed="false"] { opacity: .4; }
.efc-pp-key.is-static { cursor: default; }
.efc-pp-key.is-static:hover { background: none; }
.efc-pp-sw { width: 16px; height: 0; border-top: 2.5px solid var(--sw); border-radius: 2px; }
.efc-pp-sw.is-dash { border-top-style: dashed; }
.efc-pp-sw.is-dot { border-top-style: dotted; }
.efc-pp-win { width: 12px; height: 12px; border-radius: 3px; background: var(--sw); box-shadow: inset 0 0 0 1px var(--efc-border); }
.efc-pp-stepper { display: inline-flex; gap: 6px; }
.efc-pp-svg { display: block; width: 100%; height: auto; overflow: visible; outline: none; cursor: crosshair; }
.efc-pp-svg:focus-visible { outline: 2px solid var(--efc-accent); outline-offset: 2px; border-radius: 6px; }
.efc-pp-cross { stroke: var(--efc-ink); stroke-opacity: .45; stroke-width: 1; }
.efc-pp-pill { fill: var(--efc-surface); stroke: var(--efc-ink); stroke-width: 1.5; }
.efc-pp-pilltext { fill: var(--efc-ink); font-size: 11.5px; font-weight: 700; font-variant-numeric: tabular-nums; }
.efc-pp-tip span { display: grid; grid-template-columns: 14px 1fr auto; align-items: center; gap: 8px; }
.efc-pp-tip span i { width: 12px; height: 0; border-top: 2.5px solid var(--sw); }
.efc-pp-tip span b { color: var(--efc-ink); font-weight: 650; }
.efc-pp-tip strong.is-buy { color: var(--efc-good, #0a8a0a); font-weight: 600; }
.efc-pp-tip strong.is-sell { color: var(--efc-accent); font-weight: 600; }
@media (max-width: 640px) { .efc-pp-legend { justify-content: flex-start; } .efc-pl-legend { margin-left: 0; } }
`;

/**
 * Harmony is set in Urbanist (design-system type). Load it once from Google Fonts unless the page
 * already has it (or the caller opted out with loadFonts: false, e.g. to self-host the font).
 */
export function injectFonts(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || doc.getElementById('efc-fonts')) return;
  const has = [...doc.querySelectorAll('link[href*="fonts.googleapis.com"], style')].some((n) => /Urbanist/.test(n.getAttribute?.('href') || n.textContent || ''));
  if (has) return;
  const l = doc.createElement('link');
  l.id = 'efc-fonts';
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700&display=swap';
  doc.head.appendChild(l);
}

let injected = false;
export function injectStyles(doc = typeof document !== 'undefined' ? document : null) {
  if (injected || !doc) return;
  if (doc.getElementById('efc-styles')) { injected = true; return; }
  const el = doc.createElement('style');
  el.id = 'efc-styles';
  el.textContent = css;
  doc.head.appendChild(el);
  injected = true;
}
