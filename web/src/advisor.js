// The advisor: a 0-100 score per asset from many factors, each shown as a reason with its
// direction and weight, a backtest of the same rules on the asset's own history, a trade
// plan (entry, ATR stop, target, size) and a log of every call so its real track record
// can be checked later. A decision helper, not a guarantee.
import { useEffect, useState } from 'preact/hooks';
import { levels, divergence, pivots, last, corr, alignedReturns } from './ta.js';
import { prep, TECH, techScoreAt, clamp1, pctS } from './score.js';
import { loadMacro } from './research.js';
import { dailyLong, isCrypto, isFx, isIndex, isFut, fearGreed, cot, COT_CODES } from './data.js';
import { A } from './assets.js';
import { mkt } from './market.js';
import { riskMeter } from './sessions.js';
import { get, set, monthStats, cashTotal } from './store.js';
import { thisYm, prevYm, uid } from './util.js';

export const DISCLAIMER = 'A decision helper built from prices, macro data and history. Not a guarantee and not personal advice. Markets can move against any signal.';

// ---------- risk style ----------
export const STYLES = {
  careful: { name: 'Careful', buy: 65, sbuy: 80, sell: 35, ssell: 20, atrStop: 2.5, risk: 0.5, rr: 2.5 },
  balanced: { name: 'Balanced', buy: 60, sbuy: 75, sell: 40, ssell: 25, atrStop: 2, risk: 1, rr: 2 },
  aggressive: { name: 'Aggressive', buy: 57, sbuy: 70, sell: 43, ssell: 30, atrStop: 1.5, risk: 2, rr: 1.6 },
};
export const style = () => STYLES[get().settings.risk] || STYLES.balanced;
export function verdictOf(score, st = style()) {
  if (score == null) return { key: 'na', label: 'Unavailable', dir: 0 };
  if (score >= st.sbuy) return { key: 'sbuy', label: 'Strong buy', dir: 2 };
  if (score >= st.buy) return { key: 'buy', label: 'Buy', dir: 1 };
  if (score <= st.ssell) return { key: 'ssell', label: 'Strong sell', dir: -2 };
  if (score <= st.sell) return { key: 'sell', label: 'Sell', dir: -1 };
  return { key: 'hold', label: 'Hold', dir: 0 };
}

export function assetClass(sym) {
  if (sym === '@GC.1' || sym === '@SI.1' || sym === 'XAU' || /^(GLD|IAU|SGLN|PHAU)/.test(sym)) return 'gold';
  if (isCrypto(sym)) return 'crypto';
  if (isFx(sym)) return 'fx';
  if (/^US\d+Y/.test(sym)) return 'bond';
  if (isFut(sym)) return 'commodity';
  if (isIndex(sym)) return 'index';
  return 'stock';
}

// ---------- context (macro, sentiment, positioning) loaded once per session ----------
const ctx = { bars: {}, fng: null, cot: {}, at: 0 };
async function loadCtx(cls, sym) {
  const need = ['.DXY', 'US10Y', '.IXIC', '.SPX'];
  await Promise.all(need.filter((s) => !ctx.bars[s]).map(async (s) => { try { ctx.bars[s] = await dailyLong(s); } catch { ctx.bars[s] = []; } }));
  if (cls === 'crypto' && !ctx.fng) { try { ctx.fng = await fearGreed(); } catch { ctx.fng = []; } }
  if (cls === 'stock' && ctx.macro === undefined) { try { ctx.macro = await loadMacro(); } catch { ctx.macro = null; } }
  const code = COT_CODES[sym]; if (code && !ctx.cot[code]) { try { ctx.cot[code] = await cot(code, 160); } catch { ctx.cot[code] = []; } }
}
function chg(bars, n) { if (!bars || bars.length < n + 1) return null; const a = bars.at(-1 - n).close, b = bars.at(-1).close; return { abs: b - a, pct: ((b - a) / a) * 100 }; }

function contextFactors(sym, cls, bars, P) {
  const out = [];
  const add = (key, group, name, w, r) => out.push({ key, group, name, w, ...(r || { na: true, s: 0, text: 'Not available right now' }) });
  const dxy = ctx.bars['.DXY'], y10 = ctx.bars.US10Y, ndx = ctx.bars['.IXIC'];
  const usdSens = { gold: -1, crypto: -0.6, commodity: -0.8, stock: -0.3, index: -0.3 }[cls];
  if (usdSens) {
    const c20 = chg(dxy, 20);
    add('usd', 'Macro', 'US dollar', Math.abs(usdSens) * 1.5, c20 && { s: clamp1((c20.pct / 2) * usdSens), text: `Dollar index ${pctS(c20.pct)} in 20 days: ${c20.pct * usdSens > 0 ? 'a tailwind' : 'a headwind'} for this asset` });
  }
  const ySens = { gold: -1, stock: -0.5, index: -0.5, crypto: -0.5 }[cls];
  if (ySens) {
    const c = chg(y10, 20); const lvl = y10 && y10.length ? y10.at(-1).close : null;
    add('yield', 'Macro', cls === 'gold' ? 'Real yields / 10-year' : 'Bond yields', Math.abs(ySens) * 1.5, c && { s: clamp1((c.abs / 0.3) * ySens), text: `US 10-year yield ${lvl != null ? lvl.toFixed(2) + '%' : ''}, ${c.abs >= 0 ? 'up' : 'down'} ${Math.abs(c.abs).toFixed(2)} pts in 20 days: ${c.abs * ySens > 0 ? 'supportive' : 'a headwind'}` });
  }
  if (cls === 'gold' || cls === 'stock' || cls === 'index') {
    const fed = mkt.fed, y2 = A.q.US2Y || mkt.q.US2Y;
    const mid = fed ? (fed.lo + fed.hi) / 2 : null, gap = y2 && mid != null ? y2.last - mid : null;
    add('fed', 'Macro', 'Fed expectations', 1, gap != null && { s: clamp1(-gap / 0.5), text: gap <= -0.2 ? `Markets price in rate cuts (2-year yield ${Math.abs(gap).toFixed(2)} below the Fed rate): supportive` : gap >= 0.2 ? `Markets price in higher rates (2-year ${gap.toFixed(2)} above the Fed rate): a headwind` : 'Markets expect the Fed to hold' });
    const cpi = mkt.cpi;
    if (cls === 'gold') add('infl', 'Macro', 'Inflation trend', 0.8, cpi && cpi.prev3 != null && { s: clamp1((cpi.yoy - cpi.prev3) / 0.6), text: `US inflation ${cpi.yoy.toFixed(1)}% (${cpi.yoy - cpi.prev3 >= 0 ? 'up' : 'down'} ${Math.abs(cpi.yoy - cpi.prev3).toFixed(1)} pts in 3 months)` });
  }
  const rm = riskMeter();
  if (cls !== 'fx' && cls !== 'bond') {
    const sens = cls === 'gold' ? -0.6 : cls === 'crypto' ? 1 : 0.8;
    add('regime', 'Macro', 'Risk-on / risk-off', 1, rm && { s: clamp1(((rm.score - 50) / 30) * sens), text: `Markets are ${rm.label.toLowerCase()} (${rm.score}/100)${sens < 0 ? ': fear helps safe havens' : ''}` });
  }
  // sentiment
  if (cls === 'gold') {
    const items = (mkt.news && mkt.news.items) || [];
    const recent = items.filter((x) => Date.now() - Date.parse(x.date) < 48 * 3600e3);
    const up = recent.filter((x) => x.impact === 'up').length, dn = recent.filter((x) => x.impact === 'down').length;
    add('news', 'Sentiment', 'News tone', 0.8, up + dn >= 3 ? { s: clamp1(((up - dn) / (up + dn)) * 1.2), text: `${up} supportive vs ${dn} negative gold headlines in 48 hours` } : { s: 0, text: 'Few gold headlines in 48 hours: news is neutral' });
  }
  if (cls === 'crypto') {
    const f = ctx.fng && ctx.fng[0];
    add('fng', 'Sentiment', 'Fear and Greed', 1, f && { s: f.v <= 20 ? 0.7 : f.v <= 35 ? 0.3 : f.v >= 80 ? -0.7 : f.v >= 65 ? -0.3 : 0, text: `${f.label} (${f.v}/100). ${f.v <= 25 ? 'Extreme fear has often been a good time to buy (contrarian)' : f.v >= 75 ? 'Extreme greed has often come before pullbacks' : 'Not at an extreme'}` });
  }
  if (cls === 'stock' || cls === 'index') {
    const vix = A.q['.VIX'];
    add('vix', 'Sentiment', 'Fear (VIX)', 0.7, vix && vix.last != null && { s: vix.last >= 32 ? 0.6 : vix.last >= 25 ? 0.2 : vix.last <= 12 ? -0.3 : 0, text: `VIX ${vix.last.toFixed(1)}. ${vix.last >= 30 ? 'Panic: historically a good long-term entry, but painful short-term' : vix.last <= 12 ? 'Very calm: complacency' : 'Normal'}` });
  }
  // positioning
  const code = COT_CODES[sym];
  if (code) {
    const rows = ctx.cot[code] || [];
    if (rows.length > 30) {
      const nets = rows.map((r) => r.specNet); const cur = nets.at(-1), prev = nets.at(-2);
      const pctl = nets.filter((x) => x < cur).length / nets.length;
      add('cot', 'Positioning', 'Big funds (COT)', 1, { s: pctl >= 0.9 ? -0.5 : pctl <= 0.1 ? 0.5 : clamp1((cur - prev) / (Math.abs(prev) || 1) * 3) * 0.4, text: `Speculators ${cur >= 0 ? 'net long' : 'net short'} ${Math.abs(cur).toLocaleString('en-US')} contracts, ${cur >= prev ? 'adding' : 'cutting'} this week; ${Math.round(pctl * 100)}th percentile of 3 years${pctl >= 0.9 ? ' (crowded)' : pctl <= 0.1 ? ' (washed out)' : ''}` });
    } else add('cot', 'Positioning', 'Big funds (COT)', 1, null);
  }
  // fundamentals (stocks)
  if (cls === 'stock') {
    const q = A.q[sym];
    add('pe', 'Fundamentals', 'Valuation (P/E)', 0.6, q && q.pe ? { s: q.pe < 0 ? -0.3 : q.pe < 15 ? 0.4 : q.pe > 60 ? -0.5 : q.pe > 35 ? -0.2 : 0.1, text: `P/E ${q.pe.toFixed(1)}: ${q.pe < 0 ? 'losing money' : q.pe < 15 ? 'cheap vs the market' : q.pe > 35 ? 'expensive, priced for strong growth' : 'around market levels'}` } : null);
    const ins = ctx.macro && ctx.macro.insiderBy ? ctx.macro.insiderBy[sym] || { net: 0, text: 'No insider purchases over $25,000 in the latest SEC filings' } : null;
    add('insider', 'Fundamentals', 'Insider buying', 0.6, ins ? { s: ins.net > 0 ? 0.5 : ins.net < 0 ? -0.2 : 0, text: ins.text } : null);
  }
  // seasonality from the asset's own daily history
  {
    const m = new Date().getMonth(); const byM = {};
    for (let i = 21; i < bars.length; i++) {
      const d = new Date(bars[i].time * 1000); const prev = new Date(bars[i - 1].time * 1000);
      if (d.getMonth() !== prev.getMonth()) { const k = prev.getFullYear() + '-' + prev.getMonth(); byM[k] = byM[k] || { m: prev.getMonth(), start: null }; }
    }
    // monthly returns
    const rets = [];
    let startPx = bars[0] ? bars[0].close : null, mon = bars[0] ? new Date(bars[0].time * 1000).getMonth() : null;
    for (let i = 1; i < bars.length; i++) {
      const mm = new Date(bars[i].time * 1000).getMonth();
      if (mm !== mon) { rets.push([mon, bars[i - 1].close / startPx - 1]); startPx = bars[i - 1].close; mon = mm; }
    }
    const xs = rets.slice(1).filter((r) => r[0] === m).map((r) => r[1] * 100);
    const MN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m];
    add('season', 'Seasonality', `${MN} seasonality`, 0.5, xs.length >= 5 ? (() => { const avg = xs.reduce((s, x) => s + x, 0) / xs.length, hit = xs.filter((x) => x > 0).length / xs.length; return { s: clamp1((hit - 0.5) * 3) * 0.7, text: `Up in ${Math.round(hit * 100)}% of ${xs.length} past ${MN}s (average ${pctS(avg)})` }; })() : null);
  }
  // intermarket
  if (cls === 'crypto' && ndx && ndx.length) {
    const [a, b] = alignedReturns(bars.slice(-120), ndx.slice(-160)); const cc = corr(a.slice(-60), b.slice(-60)); const nc = chg(ndx, 20);
    add('inter', 'Intermarket', 'Bitcoin vs Nasdaq', 0.8, cc != null && nc && { s: clamp1(cc * (nc.pct / 5)), text: `Correlation with the Nasdaq ${cc.toFixed(2)} (60 days); Nasdaq ${pctS(nc.pct)} in 20 days` });
  }
  if (cls === 'gold' && dxy && dxy.length) {
    const [a, b] = alignedReturns(bars.slice(-120), dxy.slice(-160)); const cc = corr(a.slice(-60), b.slice(-60));
    add('inter', 'Intermarket', 'Gold vs dollar link', 0.4, cc != null && { s: 0, text: `Correlation with the dollar ${cc.toFixed(2)} over 60 days (${cc < -0.3 ? 'normal inverse link holds' : 'the usual link is weak now'})` });
  }
  return out;
}

// ---------- backtest of the technical rules on the asset's own history ----------
export function backtest(bars, P, st = style()) {
  const H = [5, 20, 60]; const n = bars.length; if (n < 300) return null;
  const res = { buy: H.map(() => ({ n: 0, hit: 0, sum: 0 })), sell: H.map(() => ({ n: 0, hit: 0, sum: 0 })), all: H.map(() => ({ n: 0, hit: 0, sum: 0 })), rules: {}, from: bars[220].time, step: 1 };
  const step = n > 3000 ? 2 : 1; res.step = step;
  for (const r of TECH) res.rules[r.key] = { up: { n: 0, hit: 0, sum: 0 }, dn: { n: 0, hit: 0, sum: 0 } };
  for (let i = 220; i < n - 5; i += step) {
    const sc = techScoreAt(P, i); if (sc == null) continue;
    const side = sc >= st.buy ? 'buy' : sc <= st.sell ? 'sell' : null;
    H.forEach((h, k) => {
      if (i + h >= n) return;
      const fwd = (P.c[i + h] / P.c[i] - 1) * 100;
      const a = res.all[k]; a.n++; a.sum += fwd; if (fwd > 0) a.hit++;
      if (side) { const b = res[side][k]; b.n++; b.sum += fwd; if (side === 'buy' ? fwd > 0 : fwd < 0) b.hit++; }
    });
    if (i + 20 < n) {
      const fwd = (P.c[i + 20] / P.c[i] - 1) * 100;
      for (const r of TECH) { const x = r.f(P, i, P.c[i]); if (!x) continue; const o = res.rules[r.key]; if (x.s >= 0.3) { o.up.n++; o.up.sum += fwd; if (fwd > 0) o.up.hit++; } else if (x.s <= -0.3) { o.dn.n++; o.dn.sum += fwd; if (fwd < 0) o.dn.hit++; } }
    }
  }
  const fin = (o) => ({ n: o.n, hit: o.n ? (o.hit / o.n) * 100 : null, avg: o.n ? o.sum / o.n : null });
  return { H, buy: res.buy.map(fin), sell: res.sell.map(fin), all: res.all.map(fin), rules: Object.fromEntries(Object.entries(res.rules).map(([k, v]) => [k, { up: fin(v.up), dn: fin(v.dn) }])), from: res.from };
}

// ---------- trade plan ----------
export function tradePlan(price, P, bars, v, st = style(), capitalPLN = null, pxToPLN = 1) {
  const a = last(P.atr); if (!a || !price) return null;
  const lv = levels(bars, price);
  if (v.dir >= 0) {
    const entryHi = price, entryLo = Math.max(price - 0.5 * a, lv.sup ? Math.min(price, lv.sup.p * 1.003) : price - 0.5 * a);
    let stop = price - st.atrStop * a;
    if (lv.sup && lv.sup.p < price && lv.sup.p > stop) stop = Math.min(stop, lv.sup.p - 0.5 * a);
    const risk = price - stop;
    let target = price + st.rr * risk;
    if (lv.res && lv.res.p > price + risk && lv.res.p < target) target = Math.max(lv.res.p, price + 1.5 * risk);
    const rr = (target - price) / risk;
    const riskPct = get().settings.riskPct || st.risk;
    const units = capitalPLN && pxToPLN ? (capitalPLN * (riskPct / 100)) / (risk * pxToPLN) : null;
    return { side: 'long', entryLo, entryHi, stop, target, rr, atr: a, atrPct: (a / price) * 100, risk, riskPct, units, value: units != null ? units * price : null, sup: lv.sup && lv.sup.p, res: lv.res && lv.res.p };
  }
  // sell side: where to protect / take profit, and where it might be worth buying back
  const stop = price + st.atrStop * a;
  return { side: 'exit', exitNow: price, stop, rebuy: lv.sup ? lv.sup.p : price - 2 * a, atr: a, atrPct: (a / price) * 100, sup: lv.sup && lv.sup.p, res: lv.res && lv.res.p };
}

// ---------- full analysis ----------
const cache = new Map();
export async function analyze(sym, opts = {}) {
  const c = cache.get(sym);
  if (c && Date.now() - c.at < (opts.maxAge || 5 * 60e3)) return c.res;
  const cls = assetClass(sym);
  const bars = await dailyLong(sym);
  if (!bars || bars.length < 60) { const res = { sym, cls, score: null, verdict: verdictOf(null), factors: [], err: 'Not enough price history for this asset' }; cache.set(sym, { at: Date.now(), res }); return res; }
  await loadCtx(cls, sym).catch(() => {});
  const q = A.q[sym];
  // use the live price as today's close if it is fresher than the last daily bar
  const live = q && q.last != null && q.at && Date.now() - q.at < 15 * 60e3 ? q.last : null;
  const B = live ? [...bars.slice(0, -1), { ...bars.at(-1), close: live, high: Math.max(bars.at(-1).high, live), low: Math.min(bars.at(-1).low, live) }] : bars;
  const P = prep(B); const i = B.length - 1; const price = B[i].close;
  const factors = [];
  for (const r of TECH) { const x = r.f(P, i, price); factors.push({ key: r.key, group: r.group, name: r.name, w: r.w, ...(x || { na: true, s: 0, text: 'Not enough history' }) }); }
  // swing structure + divergence (live only)
  { const pv = pivots(B.slice(-120), 4); const H = pv.hi.slice(-2), L = pv.lo.slice(-2);
    if (H.length === 2 && L.length === 2) { const hh = H[1].p > H[0].p, hl = L[1].p > L[0].p; factors.splice(3, 0, { key: 'hhll', group: 'Trend', name: 'Highs and lows', w: 1, s: hh && hl ? 0.8 : !hh && !hl ? -0.8 : 0, text: hh && hl ? 'Higher highs and higher lows (uptrend structure)' : !hh && !hl ? 'Lower highs and lower lows (downtrend structure)' : 'Mixed highs and lows (range)' }); } }
  { const dv = divergence(P.c, P.r); factors.splice(7, 0, { key: 'div', group: 'Momentum', name: 'Divergence', w: 0.8, s: dv === 'bull' ? 0.8 : dv === 'bear' ? -0.8 : 0, text: dv === 'bull' ? 'Bullish divergence: price made a lower low but RSI did not' : dv === 'bear' ? 'Bearish divergence: price made a higher high but RSI did not' : 'No divergence between price and RSI' }); }
  { const lv = levels(B, price); const a = last(P.atr) || price * 0.02;
    const ds = lv.sup ? (price - lv.sup.p) / a : null, dr = lv.res ? (lv.res.p - price) / a : null;
    factors.push({ key: 'sr', group: 'Levels', name: 'Support / resistance', w: 0.8, s: ds != null && ds < 1 ? 0.5 : dr != null && dr < 1 ? -0.5 : 0, text: `${lv.sup ? `Support ${fmtN(lv.sup.p)}` : 'No support nearby'}${lv.res ? `, resistance ${fmtN(lv.res.p)}` : ', no resistance overhead (blue sky)'}${ds != null && ds < 1 ? ': sitting near support' : dr != null && dr < 1 ? ': right under resistance' : ''}` });
    factors.push({ key: 'atr', group: 'Volatility', name: 'Daily range (ATR)', w: 0, s: 0, info: true, text: `Moves about ${((a / price) * 100).toFixed(1)}% a day on average (${fmtN(a)})` }); }
  factors.push(...contextFactors(sym, cls, B, P));
  let s = 0, w = 0, up = 0, dn = 0, act = 0, avail = 0;
  for (const f of factors) { if (f.na || f.info) continue; avail++; s += f.s * f.w; w += f.w; if (f.s > 0.15) up++; else if (f.s < -0.15) dn++; if (Math.abs(f.s) > 0.15) act++; }
  const score = w ? Math.round(50 + (s / w) * 50) : null;
  const st = style(); const v = verdictOf(score, st);
  const agree = v.dir > 0 ? up : v.dir < 0 ? dn : avail - act;
  const bt = backtest(B, P, st);
  const strength = Math.abs((score || 50) - 50);
  const ratio = avail ? agree / avail : 0;
  const conf = strength >= 22 && ratio >= 0.6 ? 'High' : strength >= 10 && ratio >= 0.45 ? 'Medium' : 'Low';
  const res = { sym, cls, score, verdict: v, conf, agree, avail, up, dn, factors, bt, price, live: !!live, at: Date.now(), bars: B, P, style: st.name };
  cache.set(sym, { at: Date.now(), res });
  logCall(res);
  return res;
}
const fmtN = (x) => (x >= 1000 ? x.toLocaleString('en-US', { maximumFractionDigits: 0 }) : x >= 1 ? x.toFixed(2) : x.toPrecision(3));

export function useAnalysis(sym, deps = []) {
  const [st, setSt] = useState({ res: (cache.get(sym) || {}).res || null, busy: true });
  useEffect(() => {
    let ok = true; setSt((x) => ({ res: x.res && x.res.sym === sym ? x.res : (cache.get(sym) || {}).res || null, busy: true }));
    analyze(sym).then((res) => ok && setSt({ res, busy: false })).catch((e) => ok && setSt({ res: { sym, score: null, verdict: verdictOf(null), factors: [], err: e.message || 'Data unavailable' }, busy: false }));
    return () => { ok = false; };
  }, [sym, ...deps]);
  return st;
}

// ---------- call log + track record ----------
function logCall(r) {
  if (r.score == null) return;
  const s = get(); const calls = s.calls || [];
  const day = new Date().toISOString().slice(0, 10);
  const prev = [...calls].reverse().find((c) => c.sym === r.sym);
  if (prev && prev.day === day && prev.v === r.verdict.key) return; // one per day unless the verdict changes
  const c = { id: uid(), sym: r.sym, day, t: Date.now(), score: r.score, v: r.verdict.key, px: r.price };
  set((x) => ({ ...x, calls: [...(x.calls || []), c].slice(-1500) }));
  if (prev && prev.v !== r.verdict.key) callBus.forEach((f) => f(r, prev));
}
export const callBus = new Set();
// evaluate every logged call at +5/+20/+60 trading days with daily bars
export async function trackRecord() {
  const calls = get().calls || []; const bySym = {};
  for (const c of calls) (bySym[c.sym] ||= []).push(c);
  const out = { all: [5, 20, 60].map(() => ({ n: 0, hit: 0, sum: 0 })), sym: {}, pending: 0, total: calls.length };
  for (const [sym, cs] of Object.entries(bySym)) {
    let bars = []; try { bars = await dailyLong(sym); } catch {}
    const row = [5, 20, 60].map(() => ({ n: 0, hit: 0, sum: 0 }));
    for (const c of cs) {
      if (c.v === 'hold') continue;
      const i = bars.findIndex((b) => b.time * 1000 >= c.t - 12 * 3600e3);
      [5, 20, 60].forEach((h, k) => {
        if (i < 0 || i + h >= bars.length) { if (k === 0) out.pending++; return; }
        const fwd = (bars[i + h].close / c.px - 1) * 100; const good = c.v.includes('buy') ? fwd > 0 : fwd < 0;
        const signed = c.v.includes('buy') ? fwd : -fwd;
        for (const o of [row[k], out.all[k]]) { o.n++; o.sum += signed; if (good) o.hit++; }
      });
    }
    out.sym[sym] = row.map((o) => ({ n: o.n, hit: o.n ? (o.hit / o.n) * 100 : null, avg: o.n ? o.sum / o.n : null }));
  }
  out.all = out.all.map((o) => ({ n: o.n, hit: o.n ? (o.hit / o.n) * 100 : null, avg: o.n ? o.sum / o.n : null }));
  return out;
}

// ---------- today's call across the watchlist ----------
const today0 = { res: null, at: 0, list: [] };
const tsubs = new Set();
export async function todaysCall(force) {
  if (!force && today0.at && Date.now() - today0.at < 10 * 60e3) return today0;
  const syms = [...new Set((get().markets.list || []).map((x) => x.sym))].slice(0, 12);
  const list = [];
  for (const sym of syms) { try { const r = await analyze(sym, { maxAge: 10 * 60e3 }); if (r.score != null) list.push(r); } catch {} }
  const rank = (r) => Math.abs(r.score - 50) * (r.conf === 'High' ? 1.4 : r.conf === 'Medium' ? 1.15 : 1);
  list.sort((a, b) => rank(b) - rank(a));
  today0.res = list[0] || null; today0.list = list; today0.at = Date.now();
  tsubs.forEach((f) => f({}));
  return today0;
}
export function useTodaysCall() {
  const [, s] = useState(0);
  useEffect(() => { const f = () => s((x) => x + 1); tsubs.add(f); const t = setTimeout(() => todaysCall().catch(() => {}), 1200); return () => { tsubs.delete(f); clearTimeout(t); }; }, []);
  return today0;
}
// short tags for the strongest reasons
export function topTags(r, n = 4) {
  return [...(r.factors || [])].filter((f) => !f.na && !f.info && Math.abs(f.s) >= 0.3).sort((a, b) => Math.abs(b.s * b.w) - Math.abs(a.s * a.w)).slice(0, n)
    .map((f) => ({ text: TAG[f.key] ? TAG[f.key](f.s) : f.name, dir: f.s > 0 ? 'up' : 'down' }));
}
const TAG = {
  ma: (s) => (s > 0 ? 'Uptrend' : 'Downtrend'), cross: (s) => (s > 0 ? 'Golden cross' : 'Death cross'), mtf: (s) => (s > 0 ? 'All timeframes up' : 'All timeframes down'), hhll: (s) => (s > 0 ? 'Higher highs' : 'Lower lows'),
  rsi: (s) => (s > 0 ? 'Momentum up' : 'Momentum weak'), macd: (s) => (s > 0 ? 'MACD up' : 'MACD down'), roc: (s) => (s > 0 ? 'Rising fast' : 'Falling'), div: (s) => (s > 0 ? 'Bullish divergence' : 'Bearish divergence'),
  bb: (s) => (s > 0 ? 'Stretched down' : 'Stretched up'), w52: (s) => (s > 0 ? 'Near highs' : 'Deep drawdown'), break: (s) => (s > 0 ? 'Breakout' : 'Breakdown'), sr: (s) => (s > 0 ? 'At support' : 'At resistance'),
  vol: (s) => (s > 0 ? 'Big buying' : 'Big selling'), ad: (s) => (s > 0 ? 'Accumulation' : 'Distribution'), usd: (s) => (s > 0 ? 'Dollar weak' : 'Dollar strong'), yield: (s) => (s > 0 ? 'Yields easing' : 'Yields rising'),
  fed: (s) => (s > 0 ? 'Cuts priced' : 'Hikes priced'), infl: (s) => (s > 0 ? 'Inflation up' : 'Inflation cooling'), regime: (s) => (s > 0 ? 'Regime helps' : 'Regime hurts'), news: (s) => (s > 0 ? 'Good news' : 'Bad news'),
  fng: (s) => (s > 0 ? 'Fear (contrarian)' : 'Greed'), vix: (s) => (s > 0 ? 'Fear high' : 'Complacent'), cot: (s) => (s > 0 ? 'Funds buying' : 'Funds crowded'), pe: (s) => (s > 0 ? 'Cheap' : 'Expensive'),
  insider: (s) => (s > 0 ? 'Insiders buying' : 'Insiders selling'), season: (s) => (s > 0 ? 'Good season' : 'Weak season'), inter: (s) => (s > 0 ? 'Nasdaq tailwind' : 'Nasdaq headwind'),
};

// ---------- emergency fund ----------
export function emergencyFund(s = get()) {
  const ms = [prevYm(thisYm()), prevYm(prevYm(thisYm())), prevYm(prevYm(prevYm(thisYm())))].map((ym) => monthStats(s, ym).spend).filter((x) => x > 0);
  const monthly = ms.length ? ms.reduce((a, b) => a + b, 0) / ms.length : s.budget.monthly || 0;
  if (!monthly) return null;
  const cash = Math.max(0, cashTotal(s));
  return { months: cash / monthly, monthly, cash, low: cash / monthly < 3 };
}
