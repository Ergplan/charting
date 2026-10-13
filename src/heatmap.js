// PriceLandscape: a year of exchange prices as one heatmap.
// Columns are days, rows are the 96 blocks of the day (00:00 at the top),
// colour is ₹/kWh. Click a cell to pick that day (→ PriceProfile).
//
// Canvas for the cells (365 × 96 = 35k cells stay smooth), SVG for axes and markers.

import { createStore } from './store.js';
import { getTheme, resolveMode, applyThemeVars } from './themes.js';
import { colorAt, colormapCSS, priceAt } from './prices.js';
import { fmtDayLong, fmtNumber } from './format.js';
import { injectStyles } from './styles.js';

const SVGNS = 'http://www.w3.org/2000/svg';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n) => String(n).padStart(2, '0');
const clock = (mins) => `${pad(Math.floor(mins / 60) % 24 || (mins >= 1440 ? 24 : 0))}:${pad(mins % 60)}`;

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

const DEFAULTS = {
  theme: 'harmony',
  mode: 'auto',
  market: 'dam',
  domain: [0, 10],
  colormap: null, // name or stop list; null → theme.chart.heatmap → 'landscape'
  height: 420,
  title: 'Price landscape',
  subtitle: null,
  hint: 'Click a cell to jump to that day',
  legend: true,
  unit: '₹/kWh',
  hourStep: 4,
  margin: { top: 6, right: 6, bottom: 28, left: 54 },
};

export class PriceLandscape {
  /**
   * @param {HTMLElement} el
   * @param {object} options  { data: PriceMatrix, market, domain, colormap, selectedDay, onSelect, store, theme, mode, height }
   */
  constructor(el, options = {}) {
    if (!el) throw new Error('PriceLandscape: container element is required');
    if (!options.data) throw new Error('PriceLandscape: options.data (a price matrix) is required');
    injectStyles(el.ownerDocument);
    this.el = el;
    this.opts = { ...DEFAULTS, ...options, margin: { ...DEFAULTS.margin, ...(options.margin || {}) } };
    this.data = options.data;
    this.store = options.store || createStore();
    this.hover = null; // { day, block }
    if (options.selectedDay != null) this.store.set({ day: options.selectedDay });
    this._build();
    this.setTheme(this.opts.theme, this.opts.mode, false);
    this._unsub = this.store.subscribe((state, changed) => { if (changed.includes('day')) this._drawMarks(); });
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
  setData(data) { this.data = data; this.render(); }
  setMarket(market) { this.opts.market = market; this.render(); }
  /** Switch colour map: a name ('landscape', 'harmony', 'volt', 'verdant') or a stop list. */
  setColormap(map) { this.opts.colormap = map; this.legendBar.style.background = colormapCSS(this._map()); this.render(); }
  setTheme(theme, mode = this.opts.mode, rerender = true) {
    this.opts.theme = theme;
    this.opts.mode = mode;
    this.theme = getTheme(theme);
    this.modeResolved = resolveMode(mode);
    this.t = this.theme[this.modeResolved];
    applyThemeVars(this.el, this.theme, this.modeResolved);
    this.legendBar.style.background = colormapCSS(this._map());
    if (rerender) this.render();
  }
  /** Select a day (index into data.days). */
  select(day) { this.store.set({ day: Math.max(0, Math.min(this.data.days.length - 1, day)) }); }
  get selectedDay() { return this.store.get().day ?? null; }
  destroy() {
    this._unsub?.(); this._ro?.disconnect(); this._mo?.disconnect(); this._mq?.removeEventListener?.('change', this._mqFn);
    this.el.replaceChildren(); this.el.classList.remove('efc', 'efc-pl');
  }

  // ------------------------------------------------------------------ internals
  _map() {
    if (this.opts.colormap) return this.opts.colormap;
    const m = this.theme?.chart?.heatmap || 'landscape';
    // one map in both themes so yellow always means expensive; pass colormap: 'landscapeLight' for a pale ground
    return m;
  }

  _build() {
    const el = this.el;
    el.classList.add('efc', 'efc-pl');
    el.replaceChildren();
    if (this.opts.title || this.opts.hint) {
      const head = h('div', { class: 'efc-pl-head' }, el);
      const left = h('div', {}, head);
      if (this.opts.title) h('h3', { class: 'efc-pl-title', text: this.opts.title }, left);
      if (this.opts.subtitle) h('p', { class: 'efc-pl-sub', text: this.opts.subtitle }, left);
      if (this.opts.hint) h('span', { class: 'efc-pl-hint', text: this.opts.hint }, head);
    }
    this.plotEl = h('div', { class: 'efc-pl-plot', style: `height:${this.opts.height}px` }, el);
    this.canvas = h('canvas', { class: 'efc-pl-canvas', 'aria-hidden': 'true' }, this.plotEl);
    this.svg = s('svg', { class: 'efc-pl-svg', role: 'grid', tabindex: '0', 'aria-label': 'Price heatmap. Arrow keys move between blocks and days, Enter selects a day.' }, this.plotEl);
    this.gAxes = s('g', {}, this.svg);
    this.gMarks = s('g', {}, this.svg);
    this.tip = h('div', { class: 'efc-pl-tip', role: 'status', hidden: '' }, this.plotEl);
    const leg = h('div', { class: 'efc-pl-legend' }, el);
    this.legMin = h('span', {}, leg);
    this.legendBar = h('span', { class: 'efc-pl-bar' }, leg);
    this.legMax = h('span', {}, leg);
    if (!this.opts.legend) leg.hidden = true;
    this._bind();
  }

  render() {
    if (!this.plotEl.isConnected) return;
    const { days, blocks } = this.data;
    const m = this.opts.margin;
    const W = Math.max(280, this.plotEl.clientWidth || 800);
    const H = this.opts.height;
    const pw = W - m.left - m.right;
    const ph = H - m.top - m.bottom;
    this.dim = { W, H, pw, ph, m };
    const nD = days.length;
    this.cw = pw / Math.max(1, nD);
    this.ch = ph / blocks;
    const [lo, hi] = this.opts.domain;
    this.legMin.textContent = `₹${fmtNumber(lo, 0)}`;
    this.legMax.textContent = `₹${fmtNumber(hi, 0)}`;

    // cells: draw one pixel per cell into an offscreen canvas, then scale up without smoothing
    const off = document.createElement('canvas');
    off.width = Math.max(1, nD);
    off.height = blocks;
    const octx = off.getContext('2d');
    const img = octx.createImageData(off.width, off.height);
    const map = this._map();
    const empty = this._rgb(this.t.band) || [40, 48, 56];
    const lut = Array.from({ length: 256 }, (_, i) => colorAt(map, i / 255));
    for (let d = 0; d < nD; d++) {
      for (let b = 0; b < blocks; b++) {
        const v = priceAt(this.data, this.opts.market, d, b);
        const c = Number.isFinite(v) ? lut[Math.round(Math.max(0, Math.min(1, (v - lo) / (hi - lo || 1))) * 255)] : empty;
        const k = (b * off.width + d) * 4;
        img.data[k] = c[0]; img.data[k + 1] = c[1]; img.data[k + 2] = c[2]; img.data[k + 3] = 255;
      }
    }
    octx.putImageData(img, 0, 0);
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(W * dpr);
    this.canvas.height = Math.round(H * dpr);
    this.canvas.style.width = `${W}px`;
    this.canvas.style.height = `${H}px`;
    const ctx = this.canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = false;
    ctx.save();
    const r = 6;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(m.left, m.top, pw, ph, r); else ctx.rect(m.left, m.top, pw, ph);
    ctx.clip();
    ctx.drawImage(off, m.left, m.top, pw, ph);
    ctx.restore();

    this.svg.setAttribute('width', W);
    this.svg.setAttribute('height', H);
    this.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    this._drawAxes();
    this._drawMarks();
  }

  _rgb(css) {
    const m = String(css).match(/rgba?\(([^)]+)\)/);
    if (m) {
      const [r, g, b, a = 1] = m[1].split(',').map((x) => parseFloat(x));
      const bg = this._rgbHex(this.t.surface) || [0, 0, 0];
      return [r, g, b].map((c, i) => Math.round(c * a + bg[i] * (1 - a)));
    }
    return this._rgbHex(css);
  }
  _rgbHex(c) { const x = String(c).replace('#', ''); return x.length === 6 ? [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16)) : null; }

  _drawAxes() {
    const g = this.gAxes;
    g.replaceChildren();
    const { m, pw, ph } = this.dim;
    const { days, blockMinutes } = this.data;
    const step = this.opts.hourStep;
    for (let hr = 0; hr < 24; hr += step) {
      const yy = m.top + (hr * 60 / blockMinutes) * this.ch;
      s('text', { x: m.left - 10, y: yy + 4, 'text-anchor': 'end', class: 'efc-pl-axis' }, g).textContent = `${pad(hr)}:00`;
    }
    // months: label the first day of each month, skipping labels that would collide
    let lastX = -Infinity;
    days.forEach((t, i) => {
      const d = new Date(t);
      if (d.getUTCDate() !== 1 && i !== 0) return;
      const xx = m.left + i * this.cw;
      if (xx - lastX < 34) return;
      lastX = xx;
      const label = d.getUTCMonth() === 0 ? `Jan ’${String(d.getUTCFullYear()).slice(2)}` : MONTHS[d.getUTCMonth()];
      s('text', { x: xx, y: m.top + ph + 19, 'text-anchor': i === 0 ? 'start' : 'middle', class: 'efc-pl-axis' }, g).textContent = label;
    });
  }

  _drawMarks() {
    const g = this.gMarks;
    if (!g || !this.dim) return;
    g.replaceChildren();
    const { m, ph } = this.dim;
    const sel = this.store.get().day;
    if (sel != null && sel >= 0) {
      const xx = m.left + sel * this.cw;
      s('rect', { x: xx - 1.5, y: m.top - 3, width: Math.max(3, this.cw) + 3, height: ph + 6, rx: 3, class: 'efc-pl-sel' }, g);
    }
    const hv = this.hover;
    if (hv) {
      const xx = m.left + hv.day * this.cw;
      s('rect', { x: xx, y: m.top, width: Math.max(1.5, this.cw), height: ph, class: 'efc-pl-col' }, g);
      s('rect', { x: xx - 2, y: m.top + hv.block * this.ch - 2, width: Math.max(1.5, this.cw) + 4, height: this.ch + 4, rx: 2, class: 'efc-pl-cell' }, g);
    }
  }

  _cellAt(ev) {
    const r = this.svg.getBoundingClientRect();
    const sc = this.dim.W / r.width;
    const x = (ev.clientX - r.left) * sc;
    const y = (ev.clientY - r.top) * sc;
    const { m, pw, ph } = this.dim;
    if (x < m.left || x > m.left + pw || y < m.top || y > m.top + ph) return null;
    return { day: Math.min(this.data.days.length - 1, Math.floor((x - m.left) / this.cw)), block: Math.min(this.data.blocks - 1, Math.floor((y - m.top) / this.ch)), x, y };
  }

  _showTip(cell) {
    if (!cell) { this.tip.hidden = true; return; }
    const { day, block } = cell;
    const bm = this.data.blockMinutes;
    const v = priceAt(this.data, this.opts.market, day, block);
    const others = ['dam', 'rtm', 'gdam'].filter((k) => k !== this.opts.market && this.data.markets[k]);
    const rows = others.map((k) => { const x = priceAt(this.data, k, day, block); return Number.isFinite(x) ? `<span>${k.toUpperCase()} ₹${x.toFixed(2)}</span>` : ''; }).join('');
    // values below are numbers and library-owned labels only
    this.tip.innerHTML = `<b>${Number.isFinite(v) ? `₹${v.toFixed(2)}` : 'No price'}<small> / kWh</small></b>` +
      `<em>${fmtDayLong(this.data.days[day])} · ${clock(block * bm)}–${clock((block + 1) * bm)}</em>` + (rows ? `<i>${rows}</i>` : '');
    this.tip.hidden = false;
    const { W } = this.dim;
    const tw = this.tip.offsetWidth || 200;
    const x = cell.x ?? (this.dim.m.left + day * this.cw);
    const y = cell.y ?? (this.dim.m.top + block * this.ch);
    this.tip.style.left = `${Math.max(4, Math.min(W - tw - 4, x + 14))}px`;
    this.tip.style.top = `${Math.max(4, y - 64)}px`;
  }

  _setHover(cell) {
    this.hover = cell ? { day: cell.day, block: cell.block } : null;
    this._drawMarks();
    this._showTip(cell);
    this.opts.onHover?.(cell ? { day: cell.day, block: cell.block, date: this.data.days[cell.day], price: priceAt(this.data, this.opts.market, cell.day, cell.block) } : null);
  }

  _pick(day, block) {
    this.select(day);
    this.opts.onSelect?.(day, block, { date: this.data.days[day], price: priceAt(this.data, this.opts.market, day, block) });
  }

  _bind() {
    this.svg.addEventListener('pointermove', (ev) => this._setHover(this._cellAt(ev)));
    this.svg.addEventListener('pointerleave', () => this._setHover(null));
    this.svg.addEventListener('click', (ev) => { const c = this._cellAt(ev); if (c) this._pick(c.day, c.block); });
    this.svg.addEventListener('keydown', (ev) => {
      const cur = this.hover || { day: this.store.get().day ?? this.data.days.length - 1, block: 72 };
      let { day, block } = cur;
      const k = ev.key;
      if (k === 'ArrowLeft') day -= ev.shiftKey ? 7 : 1;
      else if (k === 'ArrowRight') day += ev.shiftKey ? 7 : 1;
      else if (k === 'ArrowUp') block -= ev.shiftKey ? 4 : 1;
      else if (k === 'ArrowDown') block += ev.shiftKey ? 4 : 1;
      else if (k === 'Enter' || k === ' ') { this._pick(day, block); ev.preventDefault(); return; }
      else if (k === 'Escape') { this._setHover(null); return; }
      else return;
      ev.preventDefault();
      day = Math.max(0, Math.min(this.data.days.length - 1, day));
      block = Math.max(0, Math.min(this.data.blocks - 1, block));
      this._setHover({ day, block });
    });
    this.svg.addEventListener('blur', () => this._setHover(null));
  }
}

export function createPriceLandscape(el, options) { return new PriceLandscape(el, options); }
