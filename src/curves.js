// Monotone cubic interpolation (Fritsch–Carlson). A smooth curve that never
// overshoots its points, so a smoothed stack never dips below the layer under it
// and a smoothed line never invents a peak the data doesn't have.
//
// Points are [x, y] pairs in pixel space with strictly increasing x.

const f = (p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;

/** Cubic segments [p0, c1, c2, p1] through pts. */
export function monotoneSegments(pts) {
  const n = pts.length;
  const segs = [];
  if (n < 2) return segs;
  const d = [];
  const m = new Array(n);
  for (let i = 0; i < n - 1; i++) d.push((pts[i + 1][1] - pts[i][1]) / ((pts[i + 1][0] - pts[i][0]) || 1));
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const s2 = a * a + b * b;
    if (s2 > 9) { const t = 3 / Math.sqrt(s2); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
  }
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const dx = (p1[0] - p0[0]) / 3;
    segs.push([p0, [p0[0] + dx, p0[1] + m[i] * dx], [p1[0] - dx, p1[1] - m[i + 1] * dx], p1]);
  }
  return segs;
}

/** SVG path data "M…C…" through pts. */
export function monotonePath(pts) {
  if (!pts.length) return '';
  if (pts.length < 2) return `M${f(pts[0])}`;
  return `M${f(pts[0])}${monotoneSegments(pts).map((s) => `C${f(s[1])} ${f(s[2])} ${f(s[3])}`).join('')}`;
}

/** Continue a path backwards through pts (last → first): "L…C…". Closes an area under a curve. */
export function monotoneBack(pts) {
  if (!pts.length) return '';
  const segs = monotoneSegments(pts);
  if (!segs.length) return `L${f(pts[0])}`;
  return `L${f(pts[pts.length - 1])}${segs.reverse().map((s) => `C${f(s[2])} ${f(s[1])} ${f(s[0])}`).join('')}`;
}

/** Straight-line equivalents, so callers can switch curve type with one branch. */
export const linearPath = (pts) => (pts.length ? `M${pts.map(f).join('L')}` : '');
export const linearBack = (pts) => (pts.length ? `L${pts.slice().reverse().map(f).join('L')}` : '');

/** Step-after path for block data: each value holds until the next point. */
export function stepPath(pts, xEnd) {
  if (!pts.length) return '';
  let d = `M${f(pts[0])}`;
  for (let i = 1; i < pts.length; i++) d += `H${pts[i][0].toFixed(1)}V${pts[i][1].toFixed(1)}`;
  if (xEnd != null) d += `H${xEnd.toFixed(1)}`;
  return d;
}
