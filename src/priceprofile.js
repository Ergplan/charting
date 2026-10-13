// PriceProfile: one day of clearing prices against the state's marginal cost.
// Step lines per 15-minute block for DAM, RTM and GDAM; the marginal state VC
// (dashed) and the cheapest spare VC (dotted) as references; buy and sell
// windows shaded behind. Hover or arrow keys read every price at a block.

import { createStore } from './store.js';
import { getTheme, resolveMode, applyThemeVars } from './themes.js';
import { priceAt, tradeWindows, dayIndexOf } from './prices.js';
import { niceTicks, fmtDayLong } from './format.js';
import { stepPath } from './curves.js';
import { injectStyles } from './styles.js';
import { PriceLandscape } from './heatmap.js';

const SVGNS = 'http://www.w3.org/2000/svg';
const pad = (n) => String(n).padStart(2, '0');
const clock = (mins) => (mins >= 1440 ? '24:00' : `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`);
const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function h(tag, attrs = {}, parent) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'text') el.textContent = v;
    else if (v != null) el.setAttribute(k, v);
  }
  if (parent) parent.appendChild(el);
  return el;
}
function s(tag, attrs = {}, parent) {
  const el = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v);
  if (parent) parent.appendChild(el);
  return el;
}

export const DEFAULT_PROFILE_SERIES = [
  { key: 'dam', label: 'DAM', width: 2.6, glow: true },
  { key: 'rtm', label: 'RTM', width: 1.4 },
  { key: 'gdam', label: 'GDAM', width: 1.4 },
  { key: 'marginalVC', label: 'Marginal state VC', width: 1.6, dash: '4 4' },
  { key: 'spareVC', label: 'Cheapest spare VC', width: 1.6, dash: '1.5 4' },
];

const DEFAULTS = {
  theme: 'harmony',
  mode: 'auto',
  height: 420,
  series: DEFAULT_PROFILE_SERIES,
  windows: 'auto', // 'auto' | false | [{ type: 'buy'|'sell', from: block, to: block }] | (matrix, day) => windows
  windowRule: {}, // options for tradeWindows()
  title: "Clearing prices vs the state's marginal cost",
  eyebrow: true, // "PRICE PROFILE · SAT 4 JUL 2026"
  stepper: true, // ‹ › day buttons
  yMax: null, // null → nice ceiling over DAM/RTM/GDAM (references never stretch the axis)
  unit: '₹/kWh',
  margin: { top: 18, right: 16, bottom: 30, left: 50 },
};

export class PriceProfile {
  /**
   * @param {HTMLElement} el
   * @param {object} options  { data: PriceMatrix, day, series, windows, store, theme, mode, height, onDayChange, onHover }
   */
  constructor(el, options = {}) {
    if (!el) throw new Error('PriceProfile: container element is required');
    if (!options.data) throw new Error('PriceProfile: options.data (a price matrix) is required');
    injectStyles(el.ownerDocument);
    this.el = el;
    this.opts = { ...DEFAULTS, ...options, margin: { ...DEFAULTS.margin, ...(options.margin || {}) } };
    this.data = options.data;
    this.store = options.store || createStore();
    this.hidden = new Set(options.hidden || []);
    this.hover = null;
    let day = options.day;
    if (day != null && typeof day !== 'number') day = dayIndexOf(this.data, day);
    else if (day != null && day > 100000) day = dayIndexOf(this.data, day); // epoch given
    if (day == null) day = this.store.get().day ?? this.data.days.length - 1;
    this.store.set({ day });
    this._build();
    this.setTheme(this.opts.theme, this.opts.mode, false);
    this._unsub = this.store.subscribe((state, changed) => {
      if (changed.includes('day')) { this.hover = null; this.render(); this.opts.onDayChange?.(state.day, this.data.days[state.day]); }
    });
    this._ro = new ResizeObserver(() => this.render());
    this._ro.observe(this.plotEl);
    if (typeof matchMedia !== 'undefined') {
      this._mq = matchMedia('(prefers-color-scheme: dark)');
      this._mqFn = () => this.opts.mode === 'auto' && this.setTheme(this.opts.theme, 'auto');
      this._mq.addEventListener?.('change', this._mqFn);
      this._mo = new MutationObserver(this._mqFn);
      this._mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }
    this.render();
  }

  // ------------------------------------------------------------------ public API
  get day() { return this.store.get().day; }
  setDay(day) {
    if (typeof day !== 'number' || day > 100000) day = dayIndexOf(this.data, day);
    this.store.set({ day: Math.max(0, Math.min(this.data.days.length - 1, day)) });
  }
  step(n) { this.setDay(this.day + n); }
  setData(data) { this.data = data; this.setDay(Math.min(this.day, data.days.length - 1)); this.render(); }
  toggle(key) { if (this.hidden.has(key)) this.hidden.delete(key); else this.hidden.add(key); this._buildLegend(); this.render(); }
  setTheme(theme, mode = this.opts.mode, rerender = true) {
    this.opts.theme = theme;
    this.opts.mode = mode;
    this.theme = getTheme(theme);
    this.modeResolved = resolveMode(mode);
    this.t = this.theme[this.modeResolved];
    applyThemeVars(this.el, this.theme, this.modeResolved);
    this._buildLegend();
    if (rerender) this.render();
  }
  /** Windows for the current day, as rendered. */
  windows() {
    const w = this.opts.windows;
    if (!w) return [];
    if (Array.isArray(w)) return w;
    if (typeof w === 'function') return w(this.data, this.day) || [];
    return tradeWindows(this.data, this.day, this.opts.windowRule);
  }
  destroy() {
    this._unsub?.(); this._ro?.disconnect(); this._mo?.disconnect(); this._mq?.removeEventListener?.('change', this._mqFn);
    this.el.replaceChildren(); this.el.classList.remove('efc', 'efc-pp');
  }

  // ------------------------------------------------------------------ internals
  _color(key) {
    const ser = this.opts.series.find((x) => x.key === key);
    let c = ser?.color;
    if (c && typeof c === 'object') c = c[this.modeResolved] || c.light;
    c = c || this.t.roles?.[key];
    if (c === 'ink' || !c) c = key === 'spareVC' ? this.t.ink : c || this.t.accent;
    return c;
  }

  _build() {
    const el = this.el;
    el.classList.add('efc', 'efc-pp');
    el.replaceChildren();
    const head = h('div', { class: 'efc-pp-head' }, el);
    const left = h('div', { class: 'efc-pp-titles' }, head);
    this.eyebrowEl = h('div', { class: 'efc-pp-eyebrow' }, left);
    if (this.opts.title) h('h3', { class: 'efc-pp-title', text: this.opts.title }, left);
    const right = h('div', { class: 'efc-pp-right' }, head);
    this.legendEl = h('div', { class: 'efc-pp-legend', role: 'group', 'aria-label': 'Series (click to toggle)' }, right);
    if (this.opts.stepper) {
      const st = h('div', { class: 'efc-pp-stepper' }, right);
      this.prevBtn = h('button', { type: 'button', class: 'efc-step', 'aria-label': 'Previous day', text: '‹' }, st);
      this.nextBtn = h('button', { type: 'button', class: 'efc-step', 'aria-label': 'Next day', text: '›' }, st);
      this.prevBtn.addEventListener('click', () => this.step(-1));
      this.nextBtn.addEventListener('click', () => this.step(1));
    }
    this.plotEl = h('div', { class: 'efc-pp-plot' }, el);
    this.svg = s('svg', { role: 'img', tabindex: '0', class: 'efc-pp-svg' }, this.plotEl);
    this.defs = s('defs', {}, this.svg);
    this.gWin = s('g', {}, this.svg);
    this.gGrid = s('g', {}, this.svg);
    this.gLines = s('g', {}, this.svg);
    this.gCross = s('g', {}, this.svg);
    this.tip = h('div', { class: 'efc-pp-tip', role: 'status', hidden: '' }, this.plotEl);
    this._bind();
  }

  _buildLegend() {
    if (!this.legendEl) return;
    this.legendEl.replaceChildren();
    for (const ser of this.opts.series) {
      if (!this.data.markets[ser.key]) continue;
      const b = h('button', { type: 'button', class: 'efc-pp-key', 'aria-pressed': String(!this.hidden.has(ser.key)) }, this.legendEl);
      const sw = h('span', { class: `efc-pp-sw${ser.dash ? ' is-dash' : ''}` }, b);
      sw.style.setProperty('--sw', this._color(ser.key));
      if (ser.dash === '1.5 4') sw.classList.add('is-dot');
      h('span', { text: ser.label }, b);
      b.addEventListener('click', () => this.toggle(ser.key));
    }
    if (this.opts.windows) {
      for (const [type, label] of [['buy', 'Buy window'], ['sell', 'Sell window']]) {
        const k = h('span', { class: 'efc-pp-key is-static' }, this.legendEl);
        const sw = h('span', { class: 'efc-pp-win' }, k);
        sw.style.setProperty('--sw', this.t.roles?.[`${type}Window`] || this.t.band);
        h('span', { text: label }, k);
      }
    }
  }

  render() {
    if (!this.plotEl.isConnected || !this.t) return;
    const { blocks, blockMinutes } = this.data;
    const day = this.day;
    const date = this.data.days[day];
    const dd = new Date(date);
    if (this.opts.eyebrow) this.eyebrowEl.textContent = `PRICE PROFILE · ${WEEKDAYS[dd.getUTCDay()]} ${dd.getUTCDate()} ${MONTHS[dd.getUTCMonth()]} ${dd.getUTCFullYear()}`;
    if (this.prevBtn) { this.prevBtn.disabled = day <= 0; this.nextBtn.disabled = day >= this.data.days.length - 1; }

    const m = this.opts.margin;
    const W = Math.max(280, this.plotEl.clientWidth || 800);
    const H = this.opts.height;
    const pw = W - m.left - m.right;
    const ph = H - m.top - m.bottom;
    this.dim = { W, H, pw, ph, m };
    this.svg.setAttribute('width', W);
    this.svg.setAttribute('height', H);
    this.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

    const visible = this.opts.series.filter((x) => this.data.markets[x.key] && !this.hidden.has(x.key));
    let peak = 0;
    for (const ser of visible) {
      if (ser.key === 'marginalVC' || ser.key === 'spareVC') continue;
      for (let b = 0; b < blocks; b++) { const v = priceAt(this.data, ser.key, day, b); if (Number.isFinite(v)) peak = Math.max(peak, v); }
    }
    // a half-unit of headroom over the highest market price (₹10 cap → axis to 10.5)
    const yMax = this.opts.yMax ?? Math.max(1, Math.ceil((peak + 0.25) * 2) / 2);
    const yt = niceTicks(0, yMax, Math.max(4, Math.round(ph / 48)));
    this.y = (v) => m.top + ph - (Math.min(v, yMax * 1.2) / yMax) * ph;
    this.x = (b) => m.left + (b / blocks) * pw;

    // windows
    this.gWin.replaceChildren();
    for (const w of this.windows()) {
      s('rect', { x: this.x(w.from), y: m.top, width: Math.max(0, this.x(w.to) - this.x(w.from)), height: ph, fill: this.t.roles?.[`${w.type}Window`] || this.t.band, class: `efc-pp-window is-${w.type}` }, this.gWin);
    }
    // grid + axes
    this.gGrid.replaceChildren();
    const ticks = yt.ticks.filter((x) => x <= yMax);
    if (ticks[ticks.length - 1] < yMax) ticks.push(yMax);
    for (const v of ticks) {
      const yy = Math.round(this.y(v)) + 0.5;
      s('line', { x1: m.left, x2: m.left + pw, y1: yy, y2: yy, stroke: v === 0 ? this.t.axis : this.t.grid }, this.gGrid);
      s('text', { x: m.left - 10, y: yy + 4, 'text-anchor': 'end', class: 'efc-pp-axis' }, this.gGrid).textContent = String(v);
    }
    s('text', { x: m.left - 10, y: m.top - 6, 'text-anchor': 'end', class: 'efc-pp-axis is-unit' }, this.gGrid).textContent = this.opts.unit;
    const hourStep = [2, 3, 4, 6].find((hs) => (pw / 24) * hs >= 64) || 6;
    for (let hr = 0; hr <= 24; hr += hourStep) {
      const xx = this.x((hr * 60) / blockMinutes);
      s('text', { x: xx, y: m.top + ph + 20, 'text-anchor': hr === 0 ? 'start' : hr === 24 ? 'end' : 'middle', class: 'efc-pp-axis' }, this.gGrid).textContent = `${pad(hr)}:00`;
    }

    // lines: references first, the reference market (DAM) last so it sits on top
    this.gLines.replaceChildren();
    this.defs.replaceChildren();
    const glowId = `efc-pp-glow-${Math.random().toString(36).slice(2, 7)}`;
    const fl = s('filter', { id: glowId, x: '-5%', y: '-30%', width: '110%', height: '160%' }, this.defs);
    s('feGaussianBlur', { stdDeviation: 3.5 }, fl);
    const clipId = `${glowId}-clip`;
    const cp = s('clipPath', { id: clipId }, this.defs);
    s('rect', { x: m.left, y: m.top - 4, width: pw, height: ph + 6 }, cp);
    this.gLines.setAttribute('clip-path', `url(#${clipId})`);
    const order = [...visible].sort((a, b) => (a.key === 'dam') - (b.key === 'dam'));
    for (const ser of order) {
      const c = this._color(ser.key);
      // split at missing values so gaps stay gaps
      let run = [];
      const runs = [];
      for (let b = 0; b < blocks; b++) {
        const v = priceAt(this.data, ser.key, day, b);
        if (Number.isFinite(v)) run.push([this.x(b), this.y(v), b]);
        else if (run.length) { runs.push(run); run = []; }
      }
      if (run.length) runs.push(run);
      for (const r of runs) {
        const d = stepPath(r, this.x(r[r.length - 1][2] + 1));
        if (ser.glow && this.theme.chart?.glow) s('path', { d, fill: 'none', stroke: c, 'stroke-width': ser.width * 2.4, 'stroke-opacity': this.modeResolved === 'dark' ? 0.45 : 0.2, filter: `url(#${glowId})` }, this.gLines);
        s('path', { d, fill: 'none', stroke: c, 'stroke-width': ser.width || 1.5, 'stroke-dasharray': ser.dash || null, 'stroke-linejoin': 'round', 'stroke-linecap': ser.dash ? 'round' : 'butt', 'data-key': ser.key }, this.gLines);
      }
    }
    this.svg.setAttribute('aria-label', `${this.opts.title}. ${fmtDayLong(date)}. ${this._summary()}`);
    this._drawCross();
  }

  _summary() {
    const v = [];
    for (let b = 0; b < this.data.blocks; b++) { const x = priceAt(this.data, 'dam', this.day, b); if (Number.isFinite(x)) v.push(x); }
    if (!v.length) return '';
    return `DAM from ₹${Math.min(...v).toFixed(2)} to ₹${Math.max(...v).toFixed(2)} per kWh.`;
  }

  _drawCross() {
    const g = this.gCross;
    g.replaceChildren();
    const b = this.hover;
    if (b == null || !this.dim) { this.tip.hidden = true; return; }
    const { m, ph, W } = this.dim;
    const bm = this.data.blockMinutes;
    const xx = this.x(b + 0.5);
    s('line', { x1: xx, x2: xx, y1: m.top, y2: m.top + ph, class: 'efc-pp-cross' }, g);
    const rows = [];
    for (const ser of this.opts.series) {
      if (!this.data.markets[ser.key] || this.hidden.has(ser.key)) continue;
      const v = priceAt(this.data, ser.key, this.day, b);
      if (!Number.isFinite(v)) continue;
      const c = this._color(ser.key);
      s('circle', { cx: xx, cy: this.y(v), r: ser.key === 'dam' ? 5 : 3.5, fill: this.t.surface, stroke: c, 'stroke-width': 2.2 }, g);
      rows.push(`<span><i style="--sw:${c}"></i>${ser.label}<b>₹${v.toFixed(2)}</b></span>`);
    }
    const win = this.windows().find((w) => b >= w.from && b < w.to);
    // time pill on the axis
    const tw = 92;
    const px = Math.max(m.left, Math.min(m.left + this.dim.pw - tw, xx - tw / 2));
    s('rect', { x: px, y: m.top + ph + 5, width: tw, height: 22, rx: 11, class: 'efc-pp-pill' }, g);
    s('text', { x: px + tw / 2, y: m.top + ph + 20, 'text-anchor': 'middle', class: 'efc-pp-pilltext' }, g).textContent = `${clock(b * bm)}–${clock((b + 1) * bm)}`;
    // readout card (library-owned labels and numbers only)
    this.tip.innerHTML = `<em>Block ${b + 1} · ${clock(b * bm)}–${clock((b + 1) * bm)}${win ? ` · <strong class="is-${win.type}">${win.type === 'buy' ? 'Buy window' : 'Sell window'}</strong>` : ''}</em>${rows.join('')}`;
    this.tip.hidden = false;
    const tw2 = this.tip.offsetWidth || 220;
    const left = xx + 16 + tw2 > W ? xx - 16 - tw2 : xx + 16;
    this.tip.style.left = `${Math.max(4, left)}px`;
    this.tip.style.top = `${m.top + 8}px`;
  }

  _setHover(b) {
    this.hover = b;
    this._drawCross();
    this.opts.onHover?.(b == null ? null : { block: b, values: Object.fromEntries(this.opts.series.map((x) => [x.key, priceAt(this.data, x.key, this.day, b)])) });
  }

  _bind() {
    const blockAt = (ev) => {
      const r = this.svg.getBoundingClientRect();
      const x = (ev.clientX - r.left) * (this.dim.W / r.width);
      const { m, pw } = this.dim;
      if (x < m.left || x > m.left + pw) return null;
      return Math.min(this.data.blocks - 1, Math.floor(((x - m.left) / pw) * this.data.blocks));
    };
    this.svg.addEventListener('pointermove', (ev) => this._setHover(blockAt(ev)));
    this.svg.addEventListener('pointerleave', () => this._setHover(null));
    this.svg.addEventListener('blur', () => this._setHover(null));
    this.svg.addEventListener('keydown', (ev) => {
      const k = ev.key;
      let b = this.hover ?? 72;
      if (k === 'ArrowLeft') b -= ev.shiftKey ? 4 : 1;
      else if (k === 'ArrowRight') b += ev.shiftKey ? 4 : 1;
      else if (k === 'PageUp') { this.step(-1); ev.preventDefault(); return; }
      else if (k === 'PageDown') { this.step(1); ev.preventDefault(); return; }
      else if (k === 'Escape') { this._setHover(null); return; }
      else return;
      ev.preventDefault();
      this._setHover(Math.max(0, Math.min(this.data.blocks - 1, b)));
    });
  }
}

export function createPriceProfile(el, options) { return new PriceProfile(el, options); }

/**
 * Landscape + profile wired together: clicking a day in the heatmap shows its profile,
 * stepping days in the profile moves the heatmap's selection.
 */
export function createPriceExplorer({ landscape, profile, data, day, theme = 'harmony', mode = 'auto', landscapeOptions = {}, profileOptions = {} }) {
  const store = createStore();
  const start = day ?? data.days.length - 1;
  store.set({ day: typeof start === 'number' && start < 100000 ? start : dayIndexOf(data, start) });
  const resolve = (x) => (typeof x === 'string' ? document.querySelector(x) : x);
  const L = new PriceLandscape(resolve(landscape), { data, store, theme, mode, ...landscapeOptions });
  const P = new PriceProfile(resolve(profile), { data, store, theme, mode, ...profileOptions });
  return { landscape: L, profile: P, store, destroy() { L.destroy(); P.destroy(); } };
}
