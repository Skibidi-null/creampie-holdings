// Market data layer: OHLCV candles for every asset, order books, sentiment, positioning,
// plus a health record per data source (shown as status lights; prices are never shown
// as live when their source is stale).
//  Stocks, ETFs, indices, futures, FX: CNBC (quote + bars, free, unofficial)
//  Crypto: Coinbase Exchange public API (candles, level 2 order book)
//  Fear and Greed (crypto): alternative.me · COT positioning: CFTC Socrata API
import { useEffect, useState } from 'preact/hooks';

export const isCrypto = (sym) => /^[A-Z0-9]+-USD$/.test(sym) && !sym.includes('.');
export const isFx = (sym) => /=$/.test(sym);
export const isIndex = (sym) => sym.startsWith('.');
export const isFut = (sym) => sym.startsWith('@');

// ---------- source health ----------
export const SOURCES = { cnbc: 'CNBC prices', coinbase: 'Coinbase crypto', nbp: 'NBP gold & rates', fx: 'Exchange rates', news: 'News feed', gold: 'Live gold spot', cftc: 'CFTC positioning', fng: 'Fear and Greed' };
export const health = {};
const hsubs = new Set();
export function mark(src, ok, err) {
  const h = health[src] || {};
  health[src] = ok ? { ok: true, at: Date.now(), fails: 0 } : { ...h, ok: false, err: String(err || 'failed'), fails: (h.fails || 0) + 1, failAt: Date.now() };
  hsubs.forEach((f) => f({}));
}
export function useHealth() { const [, s] = useState(0); useEffect(() => { const f = () => s((x) => x + 1); hsubs.add(f); return () => hsubs.delete(f); }, []); return health; }
// green: fine within the expected interval, amber: old, red: failing
export function level(src, freshMs = 5 * 60e3) {
  const h = health[src];
  if (!h) return 'off';
  if (!h.ok && h.fails >= 2) return 'bad';
  if (h.at && Date.now() - h.at <= freshMs) return 'ok';
  return h.at ? 'old' : h.ok === false ? 'bad' : 'off';
}
export const ageTxt = (t) => {
  if (!t) return 'never';
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} d ago`;
};

export async function getJSON(u, src, opt) {
  try {
    const r = await fetch(u, { cache: 'no-store', ...opt });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    if (src) mark(src, true);
    return j;
  } catch (e) { if (src) mark(src, false, e.message); throw e; }
}

// ---------- candles ----------
// tf: '1D' (intraday 5 min), '5D' (30 min), '1M' (hourly-ish), '3M', '1Y', '5Y', 'MAX'
export const TFS = ['1D', '5D', '1M', '3M', '1Y', '5Y', 'MAX'];
const CB = 'https://api.exchange.coinbase.com';
const ymd = (d) => d.toISOString().slice(0, 19).replace(/[-:T]/g, '');
const mem = new Map();
const TTL = { '1D': 60e3, '5D': 5 * 60e3, '1M': 15 * 60e3, '3M': 60 * 60e3, '1Y': 3 * 3600e3, '5Y': 6 * 3600e3, 'MAX': 12 * 3600e3, 'D5': 3 * 3600e3 };

async function cnbcBars(sym, iv, start, end) {
  const r = await getJSON(`https://ts-api.cnbc.com/harmony/app/bars/${encodeURIComponent(sym)}/${iv}/${ymd(start)}/${ymd(end)}/adjusted/EST5EDT.json`, 'cnbc');
  const bars = (r.barData && r.barData.priceBars) || [];
  const out = [];
  for (const b of bars) {
    const c = +b.close; if (!Number.isFinite(c)) continue;
    const o = +b.open, h = +b.high, l = +b.low;
    out.push({ time: Math.floor(b.tradeTimeinMills / 1000), open: Number.isFinite(o) && o > 0 ? o : c, high: Number.isFinite(h) && h > 0 ? h : c, low: Number.isFinite(l) && l > 0 ? l : c, close: c, volume: +b.volume || 0 });
  }
  return out;
}
async function cbCandles(sym, gran, start, end) {
  const step = gran * 300 * 1000;
  const req = []; for (let t = start; t < end; t += step) req.push([t, Math.min(end, t + step)]);
  const parts = await Promise.all(req.map(([a, b]) => getJSON(`${CB}/products/${sym}/candles?granularity=${gran}&start=${new Date(a).toISOString()}&end=${new Date(b).toISOString()}`, 'coinbase').catch(() => [])));
  const m = new Map();
  for (const x of parts.flat()) if (Array.isArray(x)) m.set(x[0], { time: x[0], low: x[1], high: x[2], open: x[3], close: x[4], volume: x[5] });
  return [...m.values()].sort((a, b) => a.time - b.time);
}
function toWeekly(d) {
  const out = []; let cur = null;
  for (const b of d) {
    const wk = Math.floor((b.time / 86400 + 3) / 7); // weeks starting Monday
    if (!cur || cur.wk !== wk) { cur && out.push(cur); cur = { wk, time: b.time, open: b.open, high: b.high, low: b.low, close: b.close, volume: b.volume }; }
    else { cur.high = Math.max(cur.high, b.high); cur.low = Math.min(cur.low, b.low); cur.close = b.close; cur.volume += b.volume; }
  }
  cur && out.push(cur);
  return out.map(({ wk, ...x }) => x);
}

export async function candles(sym, tf = '3M') {
  const key = sym + '|' + tf;
  const c = mem.get(key);
  if (c && Date.now() - c.at < (TTL[tf] || 6e5)) return c.bars;
  let bars = [];
  const now = Date.now();
  if (isCrypto(sym)) {
    if (tf === '1D') bars = await cbCandles(sym, 300, now - 864e5, now);
    else if (tf === '5D') bars = await cbCandles(sym, 3600, now - 5 * 864e5, now);
    else if (tf === '1M') bars = await cbCandles(sym, 21600, now - 31 * 864e5, now);
    else if (tf === '3M') bars = await cbCandles(sym, 86400, now - 92 * 864e5, now);
    else if (tf === '1Y') bars = await cbCandles(sym, 86400, now - 366 * 864e5, now);
    else if (tf === 'D5') bars = await cbCandles(sym, 86400, now - 5 * 366 * 864e5, now);
    else bars = toWeekly(await candles(sym, 'D5'));
  } else {
    const end = new Date(now + 864e5);
    if (tf === '1D') {
      bars = await cnbcBars(sym, '5M', new Date(now - 5 * 864e5), end);
      if (bars.length) { // only the last session
        const lastDay = new Date((bars.at(-1).time - 5 * 3600) * 1000).toISOString().slice(0, 10);
        bars = bars.filter((b) => new Date((b.time - 5 * 3600) * 1000).toISOString().slice(0, 10) === lastDay);
      }
    } else if (tf === '5D') bars = await cnbcBars(sym, '30M', new Date(now - 8 * 864e5), end);
    else if (tf === '1M') bars = await cnbcBars(sym, '1H', new Date(now - 31 * 864e5), end).catch(() => []);
    if (tf === '1M' && bars.length < 20) bars = await cnbcBars(sym, '30M', new Date(now - 31 * 864e5), end);
    else if (tf === '3M') bars = await cnbcBars(sym, '1D', new Date(now - 92 * 864e5), end);
    else if (tf === '1Y') bars = await cnbcBars(sym, '1D', new Date(now - 366 * 864e5), end);
    else if (tf === 'D5') bars = await cnbcBars(sym, '1D', new Date(now - 5 * 366 * 864e5), end);
    else if (tf === 'D20') bars = await cnbcBars(sym, '1D', new Date(now - 20 * 366 * 864e5), end);
    else if (tf === '5Y') bars = await cnbcBars(sym, '1W', new Date(now - 5 * 366 * 864e5), end);
    else if (tf === 'MAX') bars = await cnbcBars(sym, '1W', new Date(Date.UTC(1990, 0, 1)), end);
  }
  // drop duplicate times (chart library needs strictly increasing time)
  const clean = []; for (const b of bars) if (!clean.length || b.time > clean.at(-1).time) clean.push(b);
  mem.set(key, { at: Date.now(), bars: clean });
  return clean;
}
// long daily history for the advisor + backtests (5 years crypto, up to 20 years others)
export const dailyLong = (sym) => candles(sym, isCrypto(sym) ? 'D5' : 'D20');

export function useCandles(sym, tf) {
  const key = sym + '|' + tf;
  const [st, setSt] = useState(() => ({ bars: (mem.get(key) || {}).bars || null, err: null, key }));
  useEffect(() => {
    let live = true;
    if (st.key !== key) setSt({ bars: (mem.get(key) || {}).bars || null, err: null, key });
    candles(sym, tf).then((bars) => live && setSt({ bars, err: null, key })).catch((e) => live && setSt((x) => ({ bars: x.key === key ? x.bars || [] : [], err: e.message || 'offline', key })));
    return () => { live = false; };
  }, [key]);
  return st.key === key ? st : { bars: (mem.get(key) || {}).bars || null, err: null, key };
}
export function useDaily(sym) {
  const [st, setSt] = useState({ bars: null, err: null });
  useEffect(() => {
    let live = true; setSt({ bars: null, err: null });
    dailyLong(sym).then((bars) => live && setSt({ bars, err: null })).catch((e) => live && setSt({ bars: [], err: e.message }));
    return () => { live = false; };
  }, [sym]);
  return st;
}

// ---------- crypto order book (Coinbase level 2, aggregated) ----------
export async function orderBook(sym) {
  const j = await getJSON(`${CB}/products/${sym}/book?level=2`, 'coinbase');
  const bids = (j.bids || []).map(([p, s]) => [+p, +s]);
  const asks = (j.asks || []).map(([p, s]) => [+p, +s]);
  return { bids, asks, at: Date.now() };
}

// ---------- sentiment & positioning ----------
let fngCache = null;
export async function fearGreed() {
  if (fngCache && Date.now() - fngCache.at < 3600e3) return fngCache.data;
  const j = await getJSON('https://api.alternative.me/fng/?limit=60', 'fng');
  const data = (j.data || []).map((x) => ({ v: +x.value, label: x.value_classification, t: +x.timestamp * 1000 }));
  fngCache = { at: Date.now(), data };
  return data;
}
// CFTC Commitments of Traders (legacy futures-only). Codes: gold 088691, silver 084691, WTI 067651,
// S&P 500 e-mini 13874A, Nasdaq e-mini 209742, euro 099741, yen 097741, 10y note 043602, bitcoin 133741
export const COT_CODES = { '@GC.1': '088691', '@SI.1': '084691', '@CL.1': '067651', '.SPX': '13874A', '.IXIC': '209742', '.NDX': '209742', 'EUR=': '099741', 'EURUSD=': '099741', 'JPY=': '097741', 'US10Y': '043602', 'BTC-USD': '133741' };
const cotCache = new Map();
export async function cot(code, weeks = 104) {
  const c = cotCache.get(code); if (c && Date.now() - c.at < 6 * 3600e3) return c.rows;
  const u = `https://publicreporting.cftc.gov/resource/6dca-aqww.json?$limit=${weeks}&$where=cftc_contract_market_code='${code}'&$order=report_date_as_yyyy_mm_dd DESC&$select=report_date_as_yyyy_mm_dd,noncomm_positions_long_all,noncomm_positions_short_all,comm_positions_long_all,comm_positions_short_all,open_interest_all,market_and_exchange_names`;
  const j = await getJSON(u, 'cftc');
  const rows = j.map((r) => ({ date: r.report_date_as_yyyy_mm_dd.slice(0, 10), specNet: +r.noncomm_positions_long_all - +r.noncomm_positions_short_all, commNet: +r.comm_positions_long_all - +r.comm_positions_short_all, oi: +r.open_interest_all, name: r.market_and_exchange_names })).reverse();
  cotCache.set(code, { at: Date.now(), rows });
  return rows;
}
