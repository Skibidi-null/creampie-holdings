// Stocks & crypto watchlist: live quotes, charts, search, simple signals and price alerts.
//  Stocks/ETFs/indices: CNBC (quote.cnbc.com every 5 s on screen, ts-api bars for charts, symlookup for search)
//  Crypto: Coinbase Exchange public API (prices in USD; works on both phones and on GitHub's servers)
import { useEffect, useState } from 'preact/hooks';
import { get, set } from './store.js';
import { parseQuotes, QUOTE_URL } from './signals.js';
import { mark } from './data.js';

const CB = 'https://api.exchange.coinbase.com';
export const isCrypto = (sym) => /^[A-Z0-9]+-USD$/.test(sym) && !sym.includes('.');
const NICE = { '@GC.1': 'GOLD', '@SI.1': 'SILVER', '@CL.1': 'OIL', 'PLN=': 'USD/PLN', 'EUR=': 'EUR/USD', 'AED=': 'USD/AED', 'INR=': 'USD/INR', 'JPY=': 'USD/JPY' };
export const cleanSym = (sym) => NICE[sym] || (isCrypto(sym) ? sym.replace('-USD', '') : /^[A-Z]{6}=$/.test(sym) ? sym.slice(0, 3) + '/' + sym.slice(3, 6) : sym.replace(/^[.@]/, '').replace(/\.1$/, '').replace(/-[A-Z]{2}$/, ''));

export const DEFAULT_WATCH = [
  { sym: 'NVDA', name: 'NVIDIA' }, { sym: 'AAPL', name: 'Apple' }, { sym: 'MSFT', name: 'Microsoft' },
  { sym: 'BTC-USD', name: 'Bitcoin' }, { sym: 'ETH-USD', name: 'Ethereum' },
];
export const INDICES = [['.SPX', 'S&P 500'], ['.IXIC', 'Nasdaq'], ['.VIX', 'Fear (VIX)'], ['BTC-USD', 'Bitcoin']];
// always refreshed: home tickers, risk meter, currency board
export const ALWAYS = ['.SPX', '.IXIC', '.DJI', '.VIX', 'HYG', '@GC.1', '.DXY', 'BTC-USD', 'EURPLN=', 'PLN=', 'US10Y'];

// ---------- live quotes ----------
const LS = 'cp.assets.v1';
const saved = (() => { try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch { return {}; } })();
export const A = { q: saved.q || {}, at: 0, err: null, ticks: 0, bars: {}, cbNames: saved.cbNames || null };
const subs = new Set();
const emit = () => { A.ticks++; subs.forEach((f) => f(A.ticks)); };
export function useAssets() { const [, s] = useState(0); useEffect(() => { subs.add(s); return () => subs.delete(s); }, []); return A; }
let lastSave = 0;
const persist = () => { if (Date.now() - lastSave < 30e3) return; lastSave = Date.now(); try { localStorage.setItem(LS, JSON.stringify({ q: A.q, cbNames: A.cbNames })); } catch {} };

async function j(u) { const r = await fetch(u, { cache: 'no-store' }); if (!r.ok) throw new Error(String(r.status)); return r.json(); }

export const watchSyms = () => {
  const m = get().markets || {};
  return [...new Set([...(m.list || []).map((x) => x.sym), ...INDICES.map((x) => x[0]), ...ALWAYS, ...(get().holdings || []).map((h) => h.sym), ...(m.extra || [])])];
};

async function stockQuotes(syms) {
  if (!syms.length) return {};
  const out = {};
  for (let i = 0; i < syms.length; i += 40) Object.assign(out, parseQuotes(await j(QUOTE_URL(syms.slice(i, i + 40)))));
  return out;
}
async function cryptoQuotes(syms) {
  const out = {};
  await Promise.all(syms.map(async (s) => {
    try {
      const st = await j(`${CB}/products/${s}/stats`);
      const last = +st.last, open = +st.open; // open = price 24 hours ago
      out[s] = { last, prev: open, chg: last - open, pct: open ? ((last - open) / open) * 100 : null, hi: +st.high, lo: +st.low, vol: +st.volume, time: Date.now(), open: true, h24: true };
    } catch {}
  }));
  return out;
}

export async function refreshAssets(extra = []) {
  const all = [...new Set([...watchSyms(), ...extra])];
  try {
    const [a, b] = await Promise.all([stockQuotes(all.filter((s) => !isCrypto(s))), cryptoQuotes(all.filter(isCrypto))]);
    for (const k of Object.keys(a)) a[k].at = Date.now();
    for (const k of Object.keys(b)) b[k].at = Date.now();
    A.q = { ...A.q, ...a, ...b }; A.at = Date.now(); A.err = null;
    if (Object.keys(a).length) mark('cnbc', true);
    if (Object.keys(b).length) mark('coinbase', true);
    tickBus.forEach((f) => { try { f(A.q); } catch (e) { console.warn(e); } });
  } catch (e) { A.err = 'offline'; mark('cnbc', false, e && e.message); }
  persist(); emit();
}

let timer = null, fast = false, focus = [];
async function loop() { clearTimeout(timer); await refreshAssets(focus); timer = setTimeout(loop, fast ? 5000 : 60000); }
export function startAssets() { if (!timer) timer = setTimeout(loop, 0); }
export function stopAssets() { clearTimeout(timer); timer = null; }
// 5-second refresh while a markets screen is open; extra = symbols on screen that aren't in the watchlist
export function useAssetsLive(extra = []) {
  useEffect(() => {
    const prev = focus; focus = extra; const was = fast; fast = true; if (!was || extra.join() !== prev.join()) loop();
    return () => { fast = false; focus = []; };
  }, [extra.join()]);
  return useAssets();
}

// ---------- names & search ----------
export async function cryptoList() {
  if (A.cbNames && Date.now() - A.cbNames.at < 7 * 864e5) return A.cbNames.list;
  const [prods, curs] = await Promise.all([j(`${CB}/products`), j(`${CB}/currencies`).catch(() => [])]);
  const nm = new Map(curs.map((c) => [c.id, c.name]));
  const list = prods.filter((p) => p.quote_currency === 'USD' && p.status === 'online' && !p.trading_disabled && !p.fx_stablecoin)
    .map((p) => ({ sym: p.id, name: nm.get(p.base_currency) || p.base_currency, base: p.base_currency }));
  A.cbNames = { at: Date.now(), list }; lastSave = 0; persist();
  return list;
}
const POPULAR = ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'ADA', 'AVAX', 'LINK', 'DOT', 'LTC', 'SHIB', 'BCH', 'UNI', 'XLM', 'NEAR', 'SUI', 'PEPE', 'AAVE'];
export async function search(text) {
  const t = text.trim(); if (!t) return [];
  const out = [];
  try {
    const r = await j(`https://symlookup.cnbc.com/symservice/symlookup.do?prefix=${encodeURIComponent(t)}&partnerid=20064&pgok=1&pgsize=12`);
    for (const x of r.slice(1)) if (['STOCK', 'FUND', 'INDEX', 'ETF', 'CLOSED_END_FUND'].includes(x.issueType) && !/\.(CM|CB)=$/.test(x.symbolName))
      out.push({ sym: x.symbolName, name: x.companyName, kind: x.issueType === 'INDEX' ? 'Index' : x.issueType === 'STOCK' ? 'Stock' : 'Fund', where: x.exchangeName, us: x.countryCode === 'US' });
  } catch {}
  try {
    const list = await cryptoList(); const u = t.toUpperCase();
    const hits = list.filter((c) => c.base === u || c.base.startsWith(u) || c.name.toUpperCase().startsWith(u))
      .sort((a, b) => (a.base === u ? -1 : 0) - (b.base === u ? -1 : 0) || (POPULAR.indexOf(a.base) + 1 || 99) - (POPULAR.indexOf(b.base) + 1 || 99)).slice(0, 6);
    for (const c of hits) out.unshift({ sym: c.sym, name: c.name, kind: 'Crypto', where: 'Coinbase' });
  } catch {}
  // US listings first, then the rest
  return out.sort((a, b) => (a.kind === 'Crypto' ? -2 : a.us ? -1 : 0) - (b.kind === 'Crypto' ? -2 : b.us ? -1 : 0));
}

// ---------- watchlist ----------
export function addWatch(item) {
  set((s) => { const m = s.markets; if (m.list.some((x) => x.sym === item.sym)) return s; return { ...s, markets: { ...m, list: [...m.list, { sym: item.sym, name: item.name }] } }; });
}
export function removeWatch(sym) { set((s) => ({ ...s, markets: { ...s.markets, list: s.markets.list.filter((x) => x.sym !== sym) } })); }
export function moveWatch(sym, d) {
  set((s) => { const l = [...s.markets.list]; const i = l.findIndex((x) => x.sym === sym); const k = i + d; if (i < 0 || k < 0 || k >= l.length) return s; [l[i], l[k]] = [l[k], l[i]]; return { ...s, markets: { ...s.markets, list: l } }; });
}
export const nameOf = (sym) => { const w = (get().markets.list || []).find((x) => x.sym === sym); return (w && w.name) || (A.q[sym] && A.q[sym].name) || cleanSym(sym); };

// ---------- charts ----------
export const RANGES = [['1D', 1], ['1W', 7], ['1M', 31], ['6M', 183], ['1Y', 366], ['5Y', 1830]];
const ymd = (d) => d.toISOString().slice(0, 19).replace(/[-:T]/g, '');
export async function bars(sym, range) {
  const key = sym + '|' + range;
  const c = A.bars[key]; if (c && Date.now() - c.at < (range === '1D' ? 60e3 : 15 * 60e3)) return c.pts;
  const days = RANGES.find((r) => r[0] === range)[1];
  let pts = [];
  if (isCrypto(sym)) {
    const g = range === '1D' ? 300 : range === '1W' ? 3600 : range === '1M' ? 21600 : 86400;
    const end = Date.now(), start = end - days * 864e5;
    const step = g * 300 * 1000;
    const req = []; for (let t = start; t < end; t += step) req.push([t, Math.min(end, t + step)]);
    const parts = await Promise.all(req.slice(-7).map(([a, b]) => j(`${CB}/products/${sym}/candles?granularity=${g}&start=${new Date(a).toISOString()}&end=${new Date(b).toISOString()}`).catch(() => [])));
    pts = parts.flat().map((x) => [x[0] * 1000, x[4]]).sort((a, b) => a[0] - b[0]);
  } else {
    const iv = range === '1D' ? '5M' : range === '1W' ? '30M' : range === '5Y' ? '1W' : '1D';
    const end = new Date(Date.now() + 864e5), start = new Date(Date.now() - (range === '1D' ? 4 : days) * 864e5);
    const r = await j(`https://ts-api.cnbc.com/harmony/app/bars/${encodeURIComponent(sym)}/${iv}/${ymd(start)}/${ymd(end)}/adjusted/EST5EDT.json`);
    pts = ((r.barData && r.barData.priceBars) || []).map((b) => [b.tradeTimeinMills, +b.close]).filter((p) => Number.isFinite(p[1]));
    if (range === '1D' && pts.length) { // only the last trading session
      const lastDay = new Date(pts.at(-1)[0] - 5 * 3600e3).toISOString().slice(0, 10);
      pts = pts.filter((p) => new Date(p[0] - 5 * 3600e3).toISOString().slice(0, 10) === lastDay);
    }
  }
  A.bars[key] = { at: Date.now(), pts };
  return pts;
}

export function useBars(sym, range) {
  const [st, setSt] = useState({ pts: (A.bars[sym + '|' + range] || {}).pts || null, err: null });
  useEffect(() => {
    let live = true;
    bars(sym, range).then((pts) => live && setSt({ pts, err: null })).catch(() => live && setSt((x) => ({ pts: x.pts || [], err: 'offline' })));
    return () => { live = false; };
  }, [sym, range]);
  return st;
}

// ---------- signals ----------
const avg = (xs) => xs.reduce((a, x) => a + x, 0) / xs.length;
function rsi(closes, n = 14) {
  if (closes.length < n + 1) return null;
  let g = 0, l = 0;
  for (let i = closes.length - n; i < closes.length; i++) { const d = closes[i] - closes[i - 1]; if (d > 0) g += d; else l -= d; }
  if (!l) return 100; const rs = g / n / (l / n); return 100 - 100 / (1 + rs);
}
/** daily closes (1Y) + live price → plain-language read. Not advice. */
export function assetSignal(daily, price, crypto = false) {
  if (!daily || daily.length < 60 || !price) return null;
  const c = daily.map((x) => x[1]);
  const m50 = avg(c.slice(-50)), m200 = c.length >= 180 ? avg(c.slice(-200)) : null;
  const hi = Math.max(...c, price), lo = Math.min(...c, price);
  const fromHi = ((price - hi) / hi) * 100, pos = hi > lo ? ((price - lo) / (hi - lo)) * 100 : 50;
  const r = rsi([...c, price]);
  const vol = Math.sqrt(avg(c.slice(-61).slice(1).map((x, i) => Math.log(x / c.slice(-61)[i]) ** 2))) * Math.sqrt(crypto ? 365 : 252) * 100;
  let score = 0; const reasons = [];
  if (m200) {
    if (price > m200 && m50 > m200) { reasons.push({ good: true, text: 'Uptrend: above its 50- and 200-day averages' }); score += 1; }
    else if (price < m200 && m50 < m200) { reasons.push({ good: false, text: 'Downtrend: below its 50- and 200-day averages' }); score -= 1; }
    else reasons.push({ good: null, text: 'Trend is changing (mixed averages)' });
  }
  if (r != null) {
    if (r >= 70) { reasons.push({ good: false, text: `Overbought (RSI ${r.toFixed(0)}): it rose fast, pullbacks are common` }); score -= 1; }
    else if (r <= 30) { reasons.push({ good: true, text: `Oversold (RSI ${r.toFixed(0)}): it fell fast, bounces are common` }); score += 1; }
    else reasons.push({ good: null, text: `Momentum normal (RSI ${r.toFixed(0)})` });
  }
  if (fromHi <= -30) { reasons.push({ good: null, text: `${Math.abs(fromHi).toFixed(0)}% below its 1-year high: cheap vs the past year, but big falls often have a reason` }); score += 1; }
  else if (fromHi <= -10) { reasons.push({ good: true, text: `${Math.abs(fromHi).toFixed(0)}% below its 1-year high: a pullback` }); score += 1; }
  else if (fromHi > -3) { reasons.push({ good: false, text: 'At or near its 1-year high' }); score -= 1; }
  const d50 = ((price - m50) / m50) * 100;
  if (d50 > 15) { reasons.push({ good: false, text: `${d50.toFixed(0)}% above its 50-day average: stretched` }); score -= 1; }
  const level = score >= 2 ? 'good' : score >= 0 ? 'ok' : 'wait';
  return { level, label: { good: 'Looks like a fair entry', ok: 'Neutral', wait: 'Stretched: maybe wait' }[level], reasons, rsi: r, m50, m200, hi, lo, pos, fromHi, vol };
}

export const tickBus = new Set();
// ---------- (v1) price alerts: replaced by alerts.js; kept for reference ----------
const firedA = (() => { try { return JSON.parse(sessionStorage.getItem('cp.afired')) || {}; } catch { return {}; } })();
export const assetAlertBus = new Set();
function checkAlerts() {
  const al = (get().markets || {}).alerts || {};
  for (const [sym, a] of Object.entries(al)) {
    const q = A.q[sym]; if (!q || q.last == null) continue;
    const nm = nameOf(sym);
    if (a.above && q.last >= a.above && !firedA[sym + 'a']) { firedA[sym + 'a'] = 1; assetAlertBus.forEach((f) => f(`${nm} is up to ${fmtPrice(q.last, sym)}, above your ${fmtPrice(a.above, sym)} alert`)); }
    if (a.above && q.last < a.above * 0.995) firedA[sym + 'a'] = 0;
    if (a.below && q.last <= a.below && !firedA[sym + 'b']) { firedA[sym + 'b'] = 1; assetAlertBus.forEach((f) => f(`${nm} dropped to ${fmtPrice(q.last, sym)}, below your ${fmtPrice(a.below, sym)} alert`)); }
    if (a.below && q.last > a.below * 1.005) firedA[sym + 'b'] = 0;
  }
  try { sessionStorage.setItem('cp.afired', JSON.stringify(firedA)); } catch {}
}
export function setAlert(sym, a) {
  set((s) => { const al = { ...(s.markets.alerts || {}) }; if (!a || (!a.above && !a.below)) delete al[sym]; else al[sym] = a; return { ...s, markets: { ...s.markets, alerts: al } }; });
}

export const curSign = (sym) => { if (/=$/.test(sym) || /^US\d+Y/.test(sym)) return ''; const q = A.q[sym]; const c = isCrypto(sym) ? 'USD' : (q && q.cur) || 'USD'; return c === 'USD' ? '$' : c === 'EUR' ? '€' : c === 'GBP' ? '£' : c === 'PLN' ? 'zł ' : ''; };
export const fmtPrice = (v, sym, dec = null) => {
  if (v == null || !Number.isFinite(v)) return '-';
  const idx = sym && sym.startsWith('.');
  const d = dec != null ? dec : v >= 1 ? 2 : v >= 0.01 ? 4 : 8;
  return (idx ? '' : curSign(sym)) + v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
};
