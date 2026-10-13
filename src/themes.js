// Themes: chrome tokens + series colours, each with a light and a dark variant.
//
// Series colours resolve in this order (see resolveSeriesColor):
//   1. series.color            explicit hex, or { light, dark }
//   2. theme[mode].roles[role] semantic role (renewable, grid, market, ...)
//   3. theme[mode].palette[n]  fixed-order fallback slot (by declaration order,
//                              never by rank, so hiding a series never repaints others)
//
// Every built-in role set was run through the data-viz palette validator in
// stack order renewable → localBattery → govBattery → grid → market → surplus
// (adjacent-pair CVD ΔE ≥ 8, normal-vision ΔE ≥ 15, lightness band, chroma floor).

const chromeLight = {
  surface: '#fcfcfb',
  page: '#f6f6f3',
  ink: '#0b0b0b',
  ink2: '#52514e',
  muted: '#898781',
  grid: '#e7e6e0',
  axis: '#c3c2b7',
  border: 'rgba(11,11,11,0.10)',
  tooltip: '#ffffff',
  band: 'rgba(11,11,11,0.035)',
  accent: '#b8912f',
};

const chromeDark = {
  surface: '#1a1a19',
  page: '#0f0f0e',
  ink: '#ffffff',
  ink2: '#c3c2b7',
  muted: '#8f8d86',
  grid: '#2c2c2a',
  axis: '#383835',
  border: 'rgba(255,255,255,0.10)',
  tooltip: '#242422',
  band: 'rgba(255,255,255,0.045)',
  accent: '#d6b35a',
};

const roleKeys = ['renewable', 'localBattery', 'govBattery', 'grid', 'market', 'surplus'];
const roles = (hexes) => Object.fromEntries(roleKeys.map((k, i) => [k, hexes[i]]));

export const themes = {
  /** Default. Warm amber grid + lilac market, echoing typical Indian C&I dashboards. */
  energy: {
    name: 'energy',
    label: 'Energy',
    light: {
      ...chromeLight,
      roles: { ...roles(['#1baf7a', '#2a78d6', '#4a3aa7', '#eda100', '#8e6ff0', '#e87ba4']), demand: 'ink' },
      palette: ['#1baf7a', '#2a78d6', '#4a3aa7', '#eda100', '#8e6ff0', '#e87ba4', '#eb6834', '#008300'],
    },
    dark: {
      ...chromeDark,
      roles: { ...roles(['#228f61', '#346aac', '#8477f3', '#a36e09', '#7457a3', '#c26c96']), demand: 'ink' },
      palette: ['#228f61', '#346aac', '#8477f3', '#a36e09', '#7457a3', '#c26c96', '#d95926', '#199e70'],
    },
  },
  /** Warmer, higher-saturation set. */
  sunset: {
    name: 'sunset',
    label: 'Sunset',
    light: {
      ...chromeLight,
      accent: '#c0582a',
      roles: { ...roles(['#3a732c', '#ff74b0', '#765ad4', '#994920', '#d6a20a', '#0f68a2']), demand: 'ink' },
      palette: ['#3a732c', '#ff74b0', '#765ad4', '#994920', '#d6a20a', '#0f68a2', '#1baf7a', '#e34948'],
    },
    dark: {
      ...chromeDark,
      accent: '#e07a45',
      roles: { ...roles(['#3f7932', '#c46b90', '#695ba9', '#ab4400', '#ad8522', '#196ea9']), demand: 'ink' },
      palette: ['#3f7932', '#c46b90', '#695ba9', '#ab4400', '#ad8522', '#196ea9', '#199e70', '#e66767'],
    },
  },
  /** Okabe–Ito derived; maximum separation for colour-vision deficiency and print. */
  contrast: {
    name: 'contrast',
    label: 'High contrast',
    light: {
      ...chromeLight,
      accent: '#0072b2',
      roles: { ...roles(['#009e73', '#0072b2', '#cc79a7', '#e69f00', '#56b4e9', '#d55e00']), demand: 'ink' },
      palette: ['#009e73', '#0072b2', '#cc79a7', '#e69f00', '#56b4e9', '#d55e00', '#f0e442', '#000000'],
    },
    dark: {
      ...chromeDark,
      accent: '#2193e0',
      roles: { ...roles(['#0a9068', '#2193e0', '#954a7e', '#ba7e2d', '#089ac3', '#a14d2f']), demand: 'ink' },
      palette: ['#0a9068', '#2193e0', '#954a7e', '#ba7e2d', '#089ac3', '#a14d2f', '#c9bd3a', '#ffffff'],
    },
  },
};

// ---------------------------------------------------------------------------
// ergOS Harmony: the ergOS design system's chart themes (design-system/README.md).
// Dark-first: Blue Charcoal ground, Harmony Green accent, glass chrome.
// `skin: 'harmony'` switches the component CSS (pills, glass band, Urbanist) and
// `chart` sets the drawing style: smooth monotone curves, areas that fade from
// their top edge, glowing top lines and a dotted demand line.

const harmonyDark = {
  surface: '#0b1722',
  page: '#000b1a',
  ink: '#f2f6f3',
  ink2: '#c9d3cf',
  muted: '#9daba6',
  grid: 'rgba(255,255,255,0.07)',
  axis: 'rgba(255,255,255,0.20)',
  border: 'rgba(255,255,255,0.09)',
  tooltip: '#13202b',
  band: 'rgba(255,255,255,0.05)',
  accent: '#68e78e',
  good: '#68e78e',
  bad: '#ff8f7e',
  live: '#68e78e',
};
const harmonyLight = {
  surface: '#ffffff',
  page: '#eef2ec',
  ink: '#000b1a',
  ink2: '#2e3b37',
  muted: '#4a5955',
  grid: '#e3e9e2',
  axis: '#c3cec6',
  border: 'rgba(0,11,26,0.09)',
  tooltip: '#ffffff',
  band: 'rgba(0,11,26,0.04)',
  accent: '#12723a',
  good: '#12723a',
  bad: '#b8392a',
  live: '#12723a',
};
// Price roles shared by the Harmony family (PriceProfile, PriceLandscape).
const priceRolesDark = { dam: '#5cc8f0', rtm: '#d9e86a', gdam: '#4fd1a5', marginalVC: '#ff8f7e', spareVC: '#f2f6f3', buyWindow: 'rgba(217,232,106,0.09)', sellWindow: 'rgba(92,200,240,0.10)' };
const priceRolesLight = { dam: '#1c78ae', rtm: '#7a7f00', gdam: '#0e7f5c', marginalVC: '#b8392a', spareVC: '#000b1a', buyWindow: 'rgba(122,127,0,0.08)', sellWindow: 'rgba(28,120,174,0.08)' };

const harmonyChart = { curve: 'smooth', fill: 'gradient', glow: true, demandDash: '1.5 5', heatmap: 'landscape' };
const harmonyFont = 'Urbanist, "Avenir Next", "Segoe UI", system-ui, sans-serif';

// sources: renewable (combined) · solar · wind · hydro · localBattery · govBattery · grid · market · surplus
function harmonyFamily(name, label, dark, light, extra = {}) {
  const keys = ['renewable', 'solar', 'wind', 'hydro', 'localBattery', 'govBattery', 'grid', 'market', 'surplus'];
  const r = (hexes) => Object.fromEntries(keys.map((k, i) => [k, hexes[i]]));
  return {
    name, label, skin: 'harmony', font: harmonyFont, chart: { ...harmonyChart, ...(extra.chart || {}) },
    dark: { ...harmonyDark, ...(extra.dark || {}), roles: { ...r(dark), ...priceRolesDark, demand: 'ink' }, palette: dark },
    light: { ...harmonyLight, ...(extra.light || {}), roles: { ...r(light), ...priceRolesLight, demand: 'ink' }, palette: light },
  };
}

Object.assign(themes, {
  /** ergOS Harmony (default for ergOS): one hue per source, power exchange in Harmony Green. */
  harmony: harmonyFamily('harmony', 'Harmony',
    ['#f3e37c', '#f3e37c', '#8fe3d2', '#6e9cf7', '#7cc8f0', '#b9a8f2', '#e9b872', '#68e78e', '#c9f27a'],
    ['#8a7400', '#8a7400', '#0e7f72', '#2457b8', '#1c78ae', '#6e55c4', '#a35f0a', '#178a44', '#5e8f00']),
  /** Chartreuse and sage, high energy on charcoal. */
  volt: harmonyFamily('volt', 'Volt',
    ['#f2e48a', '#f2e48a', '#93a88a', '#5f7f5b', '#a8c26a', '#e6efc4', '#c9d1bc', '#ddf24b', '#b8c47a'],
    ['#857100', '#857100', '#5e6e55', '#3e5a3a', '#56702a', '#6f7752', '#4c5544', '#5f7000', '#6f7a2a'],
    { chart: { heatmap: 'volt' }, dark: { accent: '#ddf24b' }, light: { accent: '#5f7000' } }),
  /** One green ramp, for brand-only screens. */
  verdant: harmonyFamily('verdant', 'Verdant',
    ['#46a064', '#46a064', '#2e7a49', '#1f5a35', '#3fbf7a', '#d7f5e0', '#b5e6c3', '#68e78e', '#8fd6a6'],
    ['#2b7445', '#2b7445', '#1b5a33', '#0e3d22', '#34a060', '#a9d4b5', '#7fb892', '#178a44', '#5ea876'],
    { chart: { heatmap: 'verdant' } }),
  /** Cool cyan, blue and violet with a gold sun. */
  aurora: harmonyFamily('aurora', 'Aurora',
    ['#ffd37a', '#ffd37a', '#7fe3e0', '#5a8df0', '#b9a8f2', '#f29cc6', '#a3aecb', '#68e78e', '#c8f08a'],
    ['#946500', '#946500', '#0f7f7b', '#1f5fb8', '#6e55c4', '#b23f7a', '#56617d', '#178a44', '#5e8f00']),
});

/** Register (or override) a theme. Missing chrome tokens fall back to the defaults. */
export function registerTheme(theme) {
  if (!theme || !theme.name) throw new Error('registerTheme: theme.name is required');
  // a theme that extends another (e.g. { name: 'acme', extends: 'harmony', dark: { accent } }) inherits its chrome, roles and skin
  if (theme.extends) {
    const base = getTheme(theme.extends);
    const merge = (a, b) => ({ ...a, ...(b || {}), roles: { ...a.roles, ...((b && b.roles) || {}) } });
    theme = { skin: base.skin, font: base.font, chart: { ...(base.chart || {}), ...(theme.chart || {}) }, ...theme, light: merge(base.light, theme.light), dark: merge(base.dark, theme.dark) };
  }
  const fill = (variant, base) => ({ ...base, roles: {}, palette: [], ...(variant || {}) });
  themes[theme.name] = {
    label: theme.name,
    ...theme,
    light: fill(theme.light, chromeLight),
    dark: fill(theme.dark || theme.light, chromeDark),
  };
  return themes[theme.name];
}

export function getTheme(nameOrTheme) {
  if (nameOrTheme && typeof nameOrTheme === 'object') {
    return nameOrTheme.light ? nameOrTheme : registerTheme({ name: 'custom', ...nameOrTheme });
  }
  return themes[nameOrTheme] || themes.energy;
}

/** 'auto' follows <html data-theme> first, then the OS preference. */
export function resolveMode(mode) {
  if (mode === 'light' || mode === 'dark') return mode;
  const attr = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme');
  if (attr === 'light' || attr === 'dark') return attr;
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Colour for every series, keyed by series.key. Fallback slots follow declaration order. */
export function resolveSeriesColors(series, theme, mode) {
  const t = theme[mode];
  const out = {};
  let slot = 0;
  for (const s of series) {
    let c = s.color;
    if (c && typeof c === 'object') c = c[mode] || c.light;
    if (!c) c = t.roles[s.role || s.key];
    if (!c) c = t.palette[slot++ % Math.max(1, t.palette.length)] || t.ink;
    out[s.key] = c === 'ink' ? t.ink : c;
  }
  return out;
}

/** Write chrome tokens onto an element as CSS custom properties (--efc-*). */
export function applyThemeVars(el, theme, mode) {
  const t = theme[mode];
  for (const k of ['surface', 'page', 'ink', 'ink2', 'muted', 'grid', 'axis', 'border', 'tooltip', 'band', 'accent']) {
    el.style.setProperty(`--efc-${k}`, t[k]);
  }
  for (const k of ['good', 'bad']) {
    if (t[k]) el.style.setProperty(`--efc-${k}`, t[k]);
    else el.style.removeProperty(`--efc-${k}`);
  }
  if (theme.font) el.style.setProperty('--efc-font', theme.font);
  else el.style.removeProperty('--efc-font');
  el.style.colorScheme = mode;
  el.dataset.efcMode = mode;
  if (theme.skin) el.dataset.efcSkin = theme.skin;
  else delete el.dataset.efcSkin;
}
