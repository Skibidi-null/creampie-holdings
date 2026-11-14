// Live gold price (every second while open), NBP history since 2013, buy-timing analytics.
import { useEffect, useState } from 'preact/hooks';
import { get, set, patch } from './store.js';
import { today, addDays, sum, iso } from './util.js';

export const OZ = 31.1034768;
const SPOT = 'https://api.gold-api.com/price/';
const NBP = 'https://api.nbp.pl/api';

// ---------- exchange rates ----------
// zł per 1 unit of each currency. NBP (Polish central bank, table A) first; open.er-api for
// currencies NBP doesn't publish daily (AED). Always overwrites old values so nothing goes stale.
export const RATE_CURS = ['USD', 'EUR', 'GBP', 'CHF', 'INR', 'AED', 'TRY', 'SAR'];
export async function refreshRates(force) {
  const s = get();
  if (!force && s.rates.USD && s.rates.INR && Date.now() - s.rates.at < 3 * 3600e3) return s.rates;
  const r = { PLN: 1 };
  const src = {};
  let date = null;
  try {
    const j = await (await fetch(`${NBP}/exchangerates/tables/a/?format=json`, { cache: 'no-store' })).json();
    date = j[0].effectiveDate;
    for (const x of j[0].rates) if (RATE_CURS.includes(x.code)) { r[x.code] = x.mid; src[x.code] = 'nbp'; }
  } catch {}
  try {
    const j = await (await fetch('https://open.er-api.com/v6/latest/USD', { cache: 'no-store' })).json();
    const pln = j.rates.PLN;
    for (const c of RATE_CURS) if (!r[c] && j.rates[c] && pln) { r[c] = pln / j.rates[c]; src[c] = 'er'; }
    if (!date && j.time_last_update_unix) date = iso(new Date(j.time_last_update_unix * 1000));
  } catch {}
  if (!r.USD) return s.rates; // offline: keep the last saved rates
  const next = { ...s.rates, ...r, src: { ...(s.rates.src || {}), ...src }, date: date || s.rates.date || null, at: Date.now() };
  patch('rates', next);
  return next;
}

// ---------- live spot ----------
const LS_SAMPLES = 'cp.gold.samples';
const listeners = new Set();
export const live = { price: null, usdOz: null, at: null, prev: null, dir: 0, err: null, dayOpen: null, ticks: 0 };

function loadSamples() { try { return JSON.parse(localStorage.getItem(LS_SAMPLES)) || []; } catch { return []; } }
let samples = loadSamples();
let lastSaved = 0;
export const getSamples = () => samples;

function emit() { listeners.forEach((f) => f({ ...live })); }

export async function tick() {
  try {
    const usd = get().rates.USD || (await refreshRates()).USD;
    const res = await fetch(SPOT + 'XAU', { cache: 'no-store' });
    const j = await res.json();
    if (!j.price || !usd) throw new Error('no price');
    const p = (j.price / OZ) * usd;
    live.prev = live.price;
    live.dir = live.prev == null ? 0 : p > live.prev + 1e-6 ? 1 : p < live.prev - 1e-6 ? -1 : 0;
    live.price = p; live.usdOz = j.price; live.at = j.updatedAt ? Date.parse(j.updatedAt) : Date.now(); live.err = null; live.ticks++;
    const now = Date.now();
    if (now - lastSaved > 60e3 || live.dir !== 0) {
      samples.push([now, +p.toFixed(3)]);
      samples = samples.filter((x) => x[0] > now - 8 * 864e5);
      if (now - lastSaved > 60e3) { lastSaved = now; try { localStorage.setItem(LS_SAMPLES, JSON.stringify(samples)); } catch {} }
    }
    live.dayOpen = dayOpenPrice();
    checkInAppAlerts(p);
  } catch (e) { live.err = String(e.message || e); }
  emit();
}

function dayOpenPrice() {
  // reference = NBP fixing of the last working day before today, else first sample today
  const h = history.data;
  if (h.length) {
    const t = today();
    for (let i = h.length - 1; i >= 0; i--) if (h[i][0] < t) return h[i][1];
  }
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const s = samples.find((x) => x[0] >= start.getTime());
  return s ? s[1] : null;
}

let timer = null;
export function startLive() {
  if (timer) return;
  const loop = async () => { await tick(); timer = setTimeout(loop, 1000); };
  timer = setTimeout(loop, 0);
}
export function stopLive() { clearTimeout(timer); timer = null; }
document.addEventListener('visibilitychange', () => (document.visibilityState === 'visible' ? startLive() : stopLive()));

export function useLive() {
  const [v, setV] = useState({ ...live });
  useEffect(() => { listeners.add(setV); return () => listeners.delete(setV); }, []);
  return v;
}

// fallback price when offline: last sample or last NBP fixing
export const priceNow = () => live.price || (samples.length ? samples[samples.length - 1][1] : history.data.length ? history.data[history.data.length - 1][1] : 0);

// ---------- in-app alerts (phone-side alerts run on Android worker / GitHub job for iPhone) ----------
const fired = JSON.parse(sessionStorage.getItem('cp.fired') || '{}');
export const alertBus = new Set();
function checkInAppAlerts(p) {
  const g = get().gold;
  if (!g.alertsOn) return;
  if (g.below && p <= g.below && !fired.below) {
    fired.below = true;
    alertBus.forEach((f) => f({ kind: 'below', text: `Gold dropped to ${p.toFixed(2)} zł/g, under your ${g.below} zł target` }));
  }
  if (g.below && p > g.below * 1.005) fired.below = false;
  if (g.dropPct) {
    const dayAgo = Date.now() - 864e5;
    const recent = samples.filter((x) => x[0] >= dayAgo).map((x) => x[1]);
    const firstT = (samples.find((x) => x[0] >= dayAgo) || [Date.now()])[0];
    // need at least 3 hours of live readings before judging a drop
    if (recent.length < 10 || firstT > Date.now() - 3 * 3600e3) { sessionStorage.setItem('cp.fired', JSON.stringify(fired)); return; }
    const hi = Math.max(...recent);
    if (hi > 0 && ((hi - p) / hi) * 100 >= g.dropPct && !fired.drop) {
      fired.drop = true;
      alertBus.forEach((f) => f({ kind: 'drop', text: `Gold is down ${(((hi - p) / hi) * 100).toFixed(1)}% from its 24h high` }));
    }
  }
  sessionStorage.setItem('cp.fired', JSON.stringify(fired));
}

// ---------- NBP daily history (PLN per gram, since 2013) ----------
const LS_HIST = 'cp.gold.hist';
export const history = (() => { try { return JSON.parse(localStorage.getItem(LS_HIST)) || { data: [], upTo: null }; } catch { return { data: [], upTo: null }; } })();
const histListeners = new Set();
let histLoading = null;

export function loadHistory() {
  if (histLoading) return histLoading;
  if (history.upTo === today() && history.data.length) return Promise.resolve(history);
  histLoading = (async () => {
    const t = today();
    const ranges = [];
    let start = history.data.length ? addDays(history.data[history.data.length - 1][0], 1) : '2013-01-02';
    while (start <= t) {
      let end = addDays(start, 360);
      if (end > t) end = t;
      ranges.push([start, end]);
      start = addDays(end, 1);
    }
    const chunks = await Promise.all(ranges.map(async ([a, b]) => {
      try {
        const r = await fetch(`${NBP}/cenyzlota/${a}/${b}/?format=json`);
        if (!r.ok) return [];
        return (await r.json()).map((x) => [x.data, x.cena]);
      } catch { return null; }
    }));
    if (chunks.some((c) => c === null) && !history.data.length) throw new Error('offline');
    const merged = new Map(history.data);
    for (const c of chunks) if (c) for (const [d, p] of c) merged.set(d, p);
    history.data = [...merged.entries()].sort((x, y) => x[0].localeCompare(y[0]));
    if (!chunks.some((c) => c === null)) history.upTo = t;
    try { localStorage.setItem(LS_HIST, JSON.stringify(history)); } catch {}
    histListeners.forEach((f) => f(history.data.length));
    return history;
  })().finally(() => { histLoading = null; });
  return histLoading;
}

export function useHistory() {
  const [n, setN] = useState(history.data.length);
  useEffect(() => {
    histListeners.add(setN);
    loadHistory().catch(() => {});
    return () => histListeners.delete(setN);
  }, []);
  return history.data;
}

// ---------- analytics ----------
export const RANGES = [
  ['1D', 1], ['1W', 7], ['1M', 30], ['6M', 182], ['1Y', 365], ['5Y', 1826], ['ALL', 99999],
];

export function seriesFor(range, hist, livePrice) {
  if (range === '1D') {
    const from = Date.now() - 864e5;
    const pts = samples.filter((x) => x[0] >= from).map(([t, p]) => [t, p]);
    if (livePrice) pts.push([Date.now(), livePrice]);
    return { pts, time: true };
  }
  const days = RANGES.find((r) => r[0] === range)[1];
  const from = addDays(today(), -days);
  const pts = hist.filter((x) => x[0] >= from).map(([d, p]) => [Date.parse(d), p]);
  if (livePrice && pts.length) pts.push([Date.now(), livePrice]);
  return { pts, time: false };
}

export function stats(pts) {
  if (!pts.length) return null;
  let lo = pts[0], hi = pts[0];
  for (const p of pts) { if (p[1] < lo[1]) lo = p; if (p[1] > hi[1]) hi = p; }
  const first = pts[0][1], last = pts[pts.length - 1][1];
  return { lo, hi, first, last, change: last - first, changePct: ((last - first) / first) * 100, avg: sum(pts, (p) => p[1]) / pts.length };
}

export function percentile(hist, price, days) {
  const from = addDays(today(), -days);
  const xs = hist.filter((x) => x[0] >= from).map((x) => x[1]);
  if (!xs.length) return null;
  return (xs.filter((x) => x < price).length / xs.length) * 100;
}

const sma = (hist, n) => { const xs = hist.slice(-n); return xs.length ? sum(xs, (x) => x[1]) / xs.length : null; };

// Simple, explainable scoring. Not financial advice.
export function buySignal(hist, price, avgMarketPaid) {
  if (!price || hist.length < 60) return null;
  const reasons = [];
  let score = 0;
  const m50 = sma(hist, 50), m200 = sma(hist, 200);
  const p1y = percentile(hist, price, 365);
  const hi30 = Math.max(...hist.slice(-22).map((x) => x[1]), price);
  const dip = ((hi30 - price) / hi30) * 100;
  if (m50) { const d = ((price - m50) / m50) * 100; if (d < -1) { score += 1; reasons.push({ good: true, text: `${Math.abs(d).toFixed(1)}% below its 50-day average` }); } else if (d > 3) { score -= 1; reasons.push({ good: false, text: `${d.toFixed(1)}% above its 50-day average` }); } else reasons.push({ good: null, text: 'Close to its 50-day average' }); }
  if (m200) { const d = ((price - m200) / m200) * 100; if (d < 0) { score += 1; reasons.push({ good: true, text: `Below its 200-day average (${d.toFixed(1)}%)` }); } else if (d > 12) { score -= 1; reasons.push({ good: false, text: `${d.toFixed(0)}% above its 200-day average: stretched` }); } }
  if (dip >= 4) { score += 1; reasons.push({ good: true, text: `Dipped ${dip.toFixed(1)}% from its 1-month high` }); }
  if (p1y != null) { if (p1y < 30) { score += 1; reasons.push({ good: true, text: `Cheaper than ${(100 - p1y).toFixed(0)}% of days this year` }); } else if (p1y > 90) { score -= 1; reasons.push({ good: false, text: `Near its 1-year high (top ${(100 - p1y).toFixed(0)}%)` }); } }
  if (avgMarketPaid) { const d = ((price - avgMarketPaid) / avgMarketPaid) * 100; if (d < 0) { score += 1; reasons.push({ good: true, text: `Below what gold cost when you bought (${d.toFixed(1)}%)` }); } else reasons.push({ good: null, text: `${d.toFixed(1)}% above the market price at your past buys` }); }
  const level = score >= 3 ? 'good' : score >= 1 ? 'ok' : 'wait';
  const label = { good: 'Good time to buy', ok: 'Fair: could buy a little', wait: 'Pricey: maybe wait' }[level];
  return { score, level, label, reasons, m50, m200, p1y, dip };
}

// For every calendar month, how far its average sat from the year's average (all full years)
export function seasonality(hist) {
  const byYear = {};
  for (const [d, p] of hist) { const y = d.slice(0, 4); (byYear[y] ||= []).push([+d.slice(5, 7) - 1, p]); }
  const dev = Array.from({ length: 12 }, () => []);
  for (const [y, rows] of Object.entries(byYear)) {
    const months = new Set(rows.map((r) => r[0]));
    if (months.size < 12) continue;
    const yAvg = sum(rows, (r) => r[1]) / rows.length;
    for (let m = 0; m < 12; m++) {
      const mr = rows.filter((r) => r[0] === m);
      dev[m].push(((sum(mr, (r) => r[1]) / mr.length - yAvg) / yAvg) * 100);
    }
  }
  return dev.map((xs, m) => ({ m, avg: xs.length ? sum(xs) / xs.length : 0, n: xs.length }));
}

export function yearlyLows(hist) {
  const by = {};
  for (const [d, p] of hist) { const y = d.slice(0, 4); if (!by[y] || p < by[y].lo[1]) by[y] = { ...(by[y] || {}), lo: [d, p] }; if (!by[y].hi || p > by[y].hi[1]) by[y].hi = [d, p]; }
  return Object.entries(by).map(([y, v]) => ({ y, ...v })).reverse();
}

// Biggest dips in history (drawdowns ≥ 8%) to show "these were great times to buy"
export function bigDips(hist, minPct = 8) {
  const out = [];
  let peak = hist[0], trough = null;
  for (const x of hist) {
    if (x[1] > peak[1]) {
      if (trough && ((peak[1] - trough[1]) / peak[1]) * 100 >= minPct) out.push({ peak, trough, pct: ((peak[1] - trough[1]) / peak[1]) * 100 });
      peak = x; trough = null;
    } else if (!trough || x[1] < trough[1]) trough = x;
  }
  if (trough && ((peak[1] - trough[1]) / peak[1]) * 100 >= minPct) out.push({ peak, trough, pct: ((peak[1] - trough[1]) / peak[1]) * 100, ongoing: true });
  return out.reverse();
}

export async function silverPerGram() {
  try {
    const usd = get().rates.USD || (await refreshRates()).USD;
    const j = await (await fetch(SPOT + 'XAG', { cache: 'no-store' })).json();
    return (j.price / OZ) * usd;
  } catch { return null; }
}

// ---------- news (written hourly by the GitHub job into news.json next to the app) ----------
export const NEWS_URL = 'https://skibidi-null.github.io/creampie-holdings/news.json';
export async function fetchNews() {
  const urls = location.hostname.endsWith('github.io') ? ['news.json'] : [NEWS_URL, 'news.json'];
  for (const u of urls) {
    try { const r = await fetch(u + '?t=' + Math.floor(Date.now() / 300e3), { cache: 'no-store' }); if (r.ok) return await r.json(); } catch {}
  }
  return null;
}
