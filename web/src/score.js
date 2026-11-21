// Technical scoring rules shared by the app (advisor + backtest) and the online job / Android
// background checks. Pure functions, no browser APIs.
import { sma, ema, rsi, macd, bollinger, atr, roc, adl } from './ta.js';

// ---------- precomputed series (shared by live scoring and the backtest) ----------
export function prep(bars) {
  const c = bars.map((b) => b.close);
  const v = bars.map((b) => b.volume || 0);
  const hasVol = v.slice(-60).filter((x) => x > 0).length > 40;
  const m = macd(c);
  return {
    c, v, hasVol,
    ma20: sma(c, 20), ma50: sma(c, 50), ma200: sma(c, 200),
    r: rsi(c), mh: m.hist, ml: m.line,
    bb: bollinger(c), atr: atr(bars), roc20: roc(c, 20), roc60: roc(c, 60),
    vavg: sma(v, 20), ad: hasVol ? adl(bars) : null,
    hi55: rollMax(bars.map((b) => b.high), 55), lo55: rollMin(bars.map((b) => b.low), 55),
    hi252: rollMax(c, 252), lo252: rollMin(c, 252),
  };
}
function rollMax(xs, n) { const out = []; for (let i = 0; i < xs.length; i++) { let m = -Infinity; for (let j = Math.max(0, i - n + 1); j <= i; j++) if (xs[j] > m) m = xs[j]; out.push(m); } return out; }
function rollMin(xs, n) { const out = []; for (let i = 0; i < xs.length; i++) { let m = Infinity; for (let j = Math.max(0, i - n + 1); j <= i; j++) if (xs[j] < m) m = xs[j]; out.push(m); } return out; }
export const clamp1 = (x) => Math.max(-1, Math.min(1, x));
export const pctS = (x, d = 1) => `${x >= 0 ? '+' : '−'}${Math.abs(x).toFixed(d)}%`;

// Technical rules that can be evaluated at any past day i (used live AND in the backtest).
// Each returns { s: -1..1, text } or null when there is not enough data.
export const TECH = [
  { key: 'ma', group: 'Trend', name: 'Moving averages', w: 2, f(P, i, px) {
    const ms = [P.ma20[i], P.ma50[i], P.ma200[i]]; if (ms[1] == null) return null;
    const avail = ms.filter((x) => x != null); const above = avail.filter((m) => px > m).length;
    const s = (above / avail.length) * 2 - 1;
    const names = ['20', '50', '200'].filter((_, k) => ms[k] != null);
    return { s, text: above === avail.length ? `Above its ${names.join(', ')}-day averages` : above === 0 ? `Below its ${names.join(', ')}-day averages` : `Above ${above} of its ${avail.length} key averages` };
  } },
  { key: 'cross', group: 'Trend', name: 'Golden / death cross', w: 1, f(P, i) {
    if (P.ma200[i] == null || P.ma200[i - 20] == null) return null;
    const now = P.ma50[i] > P.ma200[i];
    let crossed = null; for (let k = i - 19; k <= i; k++) if ((P.ma50[k] > P.ma200[k]) !== (P.ma50[k - 1] > P.ma200[k - 1])) crossed = i - k;
    if (crossed != null) return { s: now ? 1 : -1, text: now ? `Golden cross ${crossed === 0 ? 'today' : crossed + ' days ago'}: 50-day average rose above the 200-day` : `Death cross ${crossed === 0 ? 'today' : crossed + ' days ago'}: 50-day average fell below the 200-day` };
    return { s: now ? 0.4 : -0.4, text: now ? '50-day average above the 200-day (long uptrend)' : '50-day average below the 200-day (long downtrend)' };
  } },
  { key: 'mtf', group: 'Trend', name: 'Day, week, month agree', w: 1.5, f(P, i, px) {
    if (P.ma200[i] == null) return null;
    const d = px > P.ma20[i], w = px > P.ma50[i], m = px > P.ma200[i]; const n = [d, w, m].filter(Boolean).length;
    return { s: (n / 3) * 2 - 1, text: n === 3 ? 'Daily, weekly and monthly trends all point up' : n === 0 ? 'Daily, weekly and monthly trends all point down' : `${n} of 3 timeframes point up (${[d ? 'day' : null, w ? 'week' : null, m ? 'month' : null].filter(Boolean).join(', ') || 'none'})` };
  } },
  { key: 'rsi', group: 'Momentum', name: 'RSI', w: 1.2, f(P, i) {
    const r = P.r[i], r5 = P.r[i - 5]; if (r == null || r5 == null) return null;
    if (r >= 75) return { s: -0.7, text: `RSI ${r.toFixed(0)}: overbought, pullbacks are common from here` };
    if (r >= 68) return { s: -0.3, text: `RSI ${r.toFixed(0)}: getting overbought` };
    if (r <= 25) return { s: 0.7, text: `RSI ${r.toFixed(0)}: oversold, bounces are common from here` };
    if (r <= 32) return { s: 0.35, text: `RSI ${r.toFixed(0)}: getting oversold` };
    if (r >= 50) return { s: r > r5 ? 0.45 : 0.15, text: `RSI ${r.toFixed(0)}${r > r5 ? ' and rising' : ''}: healthy upward momentum` };
    return { s: r < r5 ? -0.45 : -0.15, text: `RSI ${r.toFixed(0)}${r < r5 ? ' and falling' : ''}: momentum is weak` };
  } },
  { key: 'macd', group: 'Momentum', name: 'MACD', w: 1, f(P, i) {
    const h = P.mh[i], h1 = P.mh[i - 1], h3 = P.mh[i - 3]; if (h == null || h3 == null) return null;
    if (h > 0 && h1 <= 0) return { s: 0.9, text: 'MACD just crossed above its signal line (turn up)' };
    if (h < 0 && h1 >= 0) return { s: -0.9, text: 'MACD just crossed below its signal line (turn down)' };
    if (h > 0) return { s: h > h3 ? 0.6 : 0.25, text: h > h3 ? 'MACD positive and strengthening' : 'MACD positive but fading' };
    return { s: h < h3 ? -0.6 : -0.25, text: h < h3 ? 'MACD negative and weakening further' : 'MACD negative but improving' };
  } },
  { key: 'roc', group: 'Momentum', name: 'Rate of change', w: 1, f(P, i) {
    const a = P.roc20[i], b = P.roc60[i], at = P.atr[i]; if (a == null || b == null || !at) return null;
    const dv = (at / P.c[i]) * 100 * Math.sqrt(20); // typical 20-day move
    const s = clamp1((a / dv) * 0.6 + (b / (dv * 1.7)) * 0.4);
    return { s, text: `${pctS(a)} in 20 days, ${pctS(b)} in 60 days` };
  } },
  { key: 'bb', group: 'Volatility', name: 'Bollinger bands', w: 0.8, f(P, i, px) {
    const u = P.bb.up[i], l = P.bb.lo[i]; if (u == null) return null;
    const pb = (px - l) / (u - l || 1);
    if (pb > 1.05) return { s: -0.5, text: 'Above the upper band: stretched, often pauses' };
    if (pb < -0.05) return { s: 0.5, text: 'Below the lower band: stretched down, often bounces' };
    const width = (u - l) / P.bb.mid[i] * 100;
    return { s: (pb - 0.5) * 0.4, text: `Inside the bands (${Math.round(pb * 100)}% of the range)${width < 4 ? ', bands are tight: a big move may be coming' : ''}` };
  } },
  { key: 'w52', group: 'Levels', name: '52-week range', w: 1, f(P, i, px) {
    const hi = P.hi252[i], lo = P.lo252[i]; if (i < 200) return null;
    const fromHi = (px / hi - 1) * 100, pos = (px - lo) / (hi - lo || 1);
    if (fromHi > -2) return { s: 0.5, text: 'At a 52-week high: strength, new highs often lead to more highs' };
    if (fromHi < -35) return { s: -0.5, text: `${Math.abs(fromHi).toFixed(0)}% below its 52-week high: deep drawdown, falling knives are risky` };
    return { s: (pos - 0.5) * 0.6, text: `${Math.abs(fromHi).toFixed(0)}% below the 52-week high, ${Math.round(pos * 100)}% up the yearly range` };
  } },
  { key: 'break', group: 'Levels', name: 'Breakout / breakdown', w: 1.2, f(P, i, px) {
    if (i < 60) return null; const hi = P.hi55[i - 1], lo = P.lo55[i - 1];
    if (px > hi) return { s: 1, text: 'Broke above its 55-day high (breakout)' };
    if (px < lo) return { s: -1, text: 'Broke below its 55-day low (breakdown)' };
    return { s: 0, text: 'No breakout: inside its 55-day range' };
  } },
  { key: 'vol', group: 'Volume', name: 'Volume', w: 0.8, f(P, i) {
    if (!P.hasVol || !P.vavg[i - 1]) return null;
    const rel = P.v[i] / P.vavg[i - 1], up = P.c[i] >= P.c[i - 1];
    if (rel >= 1.6) return { s: up ? 0.7 : -0.7, text: `Volume ${rel.toFixed(1)}x normal on a ${up ? 'rising' : 'falling'} day: strong ${up ? 'buying' : 'selling'}` };
    return { s: 0, text: `Volume ${rel.toFixed(1)}x its 20-day average` };
  } },
  { key: 'ad', group: 'Volume', name: 'Accumulation', w: 0.8, f(P, i) {
    if (!P.ad || i < 21) return null;
    const a = P.ad[i] - P.ad[i - 20], pc = P.c[i] - P.c[i - 20];
    const tot = P.v.slice(i - 19, i + 1).reduce((s, x) => s + x, 0) || 1;
    const s = clamp1((a / tot) * 3);
    return { s, text: s > 0.25 ? `Money flowing in (accumulation) over 20 days${pc < 0 ? ' even while price fell' : ''}` : s < -0.25 ? `Money flowing out (distribution) over 20 days${pc > 0 ? ' even while price rose' : ''}` : 'No clear accumulation or distribution' };
  } },
];

export function techScoreAt(P, i) {
  let s = 0, w = 0;
  for (const r of TECH) { const x = r.f(P, i, P.c[i]); if (x) { s += x.s * r.w; w += r.w; } }
  return w ? 50 + (s / w) * 50 : null;
}
