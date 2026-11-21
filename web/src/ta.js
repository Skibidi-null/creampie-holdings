// Technical analysis maths on OHLCV bars ({time, open, high, low, close, volume}).
// Every series function returns an array aligned with the input (null where not enough data).

export function sma(xs, n) {
  const out = new Array(xs.length).fill(null); let s = 0;
  for (let i = 0; i < xs.length; i++) { s += xs[i]; if (i >= n) s -= xs[i - n]; if (i >= n - 1) out[i] = s / n; }
  return out;
}
export function ema(xs, n) {
  const out = new Array(xs.length).fill(null); const k = 2 / (n + 1); let e = null, s = 0;
  for (let i = 0; i < xs.length; i++) {
    if (i < n) { s += xs[i]; if (i === n - 1) { e = s / n; out[i] = e; } continue; }
    e = xs[i] * k + e * (1 - k); out[i] = e;
  }
  return out;
}
// Wilder RSI
export function rsi(xs, n = 14) {
  const out = new Array(xs.length).fill(null); let g = 0, l = 0;
  for (let i = 1; i < xs.length; i++) {
    const d = xs[i] - xs[i - 1], up = Math.max(d, 0), dn = Math.max(-d, 0);
    if (i <= n) { g += up; l += dn; if (i === n) { g /= n; l /= n; out[i] = l === 0 ? 100 : 100 - 100 / (1 + g / l); } continue; }
    g = (g * (n - 1) + up) / n; l = (l * (n - 1) + dn) / n;
    out[i] = l === 0 ? 100 : 100 - 100 / (1 + g / l);
  }
  return out;
}
export function macd(xs, f = 12, s = 26, sig = 9) {
  const a = ema(xs, f), b = ema(xs, s);
  const line = xs.map((_, i) => (a[i] != null && b[i] != null ? a[i] - b[i] : null));
  const start = line.findIndex((v) => v != null);
  const sl = start < 0 ? [] : ema(line.slice(start), sig);
  const signal = line.map((_, i) => (i < start ? null : sl[i - start]));
  const hist = line.map((v, i) => (v != null && signal[i] != null ? v - signal[i] : null));
  return { line, signal, hist };
}
export function bollinger(xs, n = 20, k = 2) {
  const mid = sma(xs, n), up = [], lo = [];
  for (let i = 0; i < xs.length; i++) {
    if (mid[i] == null) { up.push(null); lo.push(null); continue; }
    let v = 0; for (let j = i - n + 1; j <= i; j++) v += (xs[j] - mid[i]) ** 2;
    const sd = Math.sqrt(v / n); up.push(mid[i] + k * sd); lo.push(mid[i] - k * sd);
  }
  return { mid, up, lo };
}
export function atr(bars, n = 14) {
  const out = new Array(bars.length).fill(null); let a = null, s = 0;
  for (let i = 0; i < bars.length; i++) {
    const b = bars[i], pc = i ? bars[i - 1].close : b.close;
    const tr = Math.max(b.high - b.low, Math.abs(b.high - pc), Math.abs(b.low - pc));
    if (i < n) { s += tr; if (i === n - 1) { a = s / n; out[i] = a; } continue; }
    a = (a * (n - 1) + tr) / n; out[i] = a;
  }
  return out;
}
// VWAP that resets each day (intraday) or runs over the whole series (daily+)
export function vwap(bars, resetDaily = true) {
  const out = []; let pv = 0, v = 0, day = null;
  for (const b of bars) {
    const d = Math.floor(b.time / 86400);
    if (resetDaily && d !== day) { pv = 0; v = 0; day = d; }
    const tp = (b.high + b.low + b.close) / 3, vol = b.volume || 0;
    pv += tp * vol; v += vol; out.push(v ? pv / v : null);
  }
  return out;
}
export function heikinAshi(bars) {
  const out = []; let po = null, pc = null;
  for (const b of bars) {
    const c = (b.open + b.high + b.low + b.close) / 4;
    const o = po == null ? (b.open + b.close) / 2 : (po + pc) / 2;
    out.push({ time: b.time, open: o, high: Math.max(b.high, o, c), low: Math.min(b.low, o, c), close: c });
    po = o; pc = c;
  }
  return out;
}
export const roc = (xs, n) => xs.map((v, i) => (i >= n && xs[i - n] ? ((v - xs[i - n]) / xs[i - n]) * 100 : null));
// accumulation/distribution line
export function adl(bars) {
  const out = []; let s = 0;
  for (const b of bars) { const r = b.high - b.low; const mfm = r ? ((b.close - b.low) - (b.high - b.close)) / r : 0; s += mfm * (b.volume || 0); out.push(s); }
  return out;
}
// volume profile: volume per price bucket over the given bars, point of control, value area (70%)
export function volumeProfile(bars, buckets = 40) {
  if (!bars.length) return null;
  let lo = Infinity, hi = -Infinity;
  for (const b of bars) { lo = Math.min(lo, b.low); hi = Math.max(hi, b.high); }
  if (!(hi > lo)) return null;
  const step = (hi - lo) / buckets; const vol = new Array(buckets).fill(0), up = new Array(buckets).fill(0);
  let anyVol = false;
  for (const b of bars) {
    const v = b.volume || 0; if (v) anyVol = true;
    const w = v || 1; // no volume (some futures/FX): count time spent at price
    const a = Math.max(0, Math.floor((b.low - lo) / step)), z = Math.min(buckets - 1, Math.floor((b.high - lo) / step));
    const per = w / (z - a + 1);
    for (let k = a; k <= z; k++) { vol[k] += per; if (b.close >= b.open) up[k] += per; }
  }
  let poc = 0; for (let k = 1; k < buckets; k++) if (vol[k] > vol[poc]) poc = k;
  const total = vol.reduce((s, x) => s + x, 0);
  let inVA = vol[poc], a = poc, z = poc;
  while (inVA < total * 0.7 && (a > 0 || z < buckets - 1)) {
    const na = a > 0 ? vol[a - 1] : -1, nz = z < buckets - 1 ? vol[z + 1] : -1;
    if (nz >= na) { z++; inVA += vol[z]; } else { a--; inVA += vol[a]; }
  }
  return { lo, hi, step, vol, up, poc: lo + (poc + 0.5) * step, vaLo: lo + a * step, vaHi: lo + (z + 1) * step, max: Math.max(...vol), byTime: !anyVol };
}
// swing pivots (local highs/lows) for support/resistance
export function pivots(bars, k = 5) {
  const hi = [], lo = [];
  for (let i = k; i < bars.length - k; i++) {
    let isH = true, isL = true;
    for (let j = i - k; j <= i + k; j++) { if (bars[j].high > bars[i].high) isH = false; if (bars[j].low < bars[i].low) isL = false; }
    if (isH) hi.push({ i, p: bars[i].high, time: bars[i].time });
    if (isL) lo.push({ i, p: bars[i].low, time: bars[i].time });
  }
  return { hi, lo };
}
// nearest support below and resistance above the price, from clustered pivots
export function levels(bars, price) {
  const { hi, lo } = pivots(bars.slice(-260), 5);
  const all = [...hi.map((x) => x.p), ...lo.map((x) => x.p)].sort((a, b) => a - b);
  const zones = [];
  for (const p of all) { const z = zones.at(-1); if (z && (p - z.p) / z.p < 0.012) { z.p = (z.p * z.n + p) / (z.n + 1); z.n++; } else zones.push({ p, n: 1 }); }
  const sup = zones.filter((z) => z.p < price * 0.997).sort((a, b) => b.p - a.p)[0] || null;
  const res = zones.filter((z) => z.p > price * 1.003).sort((a, b) => a.p - b.p)[0] || null;
  return { sup, res, zones };
}
// bullish/bearish divergence between price and RSI over the last `look` bars
export function divergence(closes, r, look = 40) {
  const n = closes.length; if (n < look + 5) return null;
  const seg = (a, b) => { let lo = a, hi = a; for (let i = a; i < b; i++) { if (closes[i] < closes[lo]) lo = i; if (closes[i] > closes[hi]) hi = i; } return { lo, hi }; };
  const A = seg(n - look, n - Math.floor(look / 2)), B = seg(n - Math.floor(look / 2), n);
  if (r[A.lo] != null && r[B.lo] != null && closes[B.lo] < closes[A.lo] && r[B.lo] > r[A.lo] + 3) return 'bull';
  if (r[A.hi] != null && r[B.hi] != null && closes[B.hi] > closes[A.hi] && r[B.hi] < r[A.hi] - 3) return 'bear';
  return null;
}
export const last = (a) => { for (let i = a.length - 1; i >= 0; i--) if (a[i] != null) return a[i]; return null; };
export const stdev = (xs) => { const m = xs.reduce((s, x) => s + x, 0) / xs.length; return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, xs.length - 1)); };
export function corr(a, b) {
  const n = Math.min(a.length, b.length); if (n < 10) return null;
  const x = a.slice(-n), y = b.slice(-n);
  const mx = x.reduce((s, v) => s + v, 0) / n, my = y.reduce((s, v) => s + v, 0) / n;
  let sxy = 0, sx = 0, sy = 0;
  for (let i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sx += (x[i] - mx) ** 2; sy += (y[i] - my) ** 2; }
  return sx && sy ? sxy / Math.sqrt(sx * sy) : null;
}
// daily returns aligned by date between two bar series
export function alignedReturns(a, b) {
  const mb = new Map(b.map((x) => [Math.floor(x.time / 86400), x.close]));
  const ra = [], rb = []; let pa = null, pb = null;
  for (const x of a) {
    const d = Math.floor(x.time / 86400); const cb = mb.get(d);
    if (cb == null) continue;
    if (pa != null) { ra.push(Math.log(x.close / pa)); rb.push(Math.log(cb / pb)); }
    pa = x.close; pb = cb;
  }
  return [ra, rb];
}
