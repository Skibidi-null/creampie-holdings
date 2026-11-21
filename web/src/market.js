// Live market drivers for gold: quotes every few seconds (CNBC), daily history (CNBC bars),
// Fed target (New York Fed), US inflation (BLS), event calendar (news.json, written by the job).
import { useEffect, useState } from 'preact/hooks';
import { SYMS, QUOTE_URL, parseQuotes, computeSignals } from './signals.js';
import PB from './playbook.json';

export const playbook = PB;
const ALL = Object.values(SYMS);
const LS = 'cp.mkt.v1';
const saved = (() => { try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch { return {}; } })();

export const mkt = {
  q: saved.q || {}, qAt: saved.qAt || 0, err: null,
  bars: saved.bars || {}, barsAt: saved.barsAt || 0,
  fed: saved.fed || null, cpi: saved.cpi || null,
  cal: [], news: null, ticks: 0,
};
const subs = new Set();
const emit = () => { mkt.ticks++; subs.forEach((f) => f(mkt.ticks)); };
const persist = () => { try { localStorage.setItem(LS, JSON.stringify({ q: mkt.q, qAt: mkt.qAt, bars: mkt.bars, barsAt: mkt.barsAt, fed: mkt.fed, cpi: mkt.cpi })); } catch {} };

async function getJSON(u, opt) { const r = await fetch(u, { cache: 'no-store', ...opt }); if (!r.ok) throw new Error(r.status); return r.json(); }

export async function refreshQuotes() {
  try {
    const q = parseQuotes(await getJSON(QUOTE_URL(ALL)));
    if (Object.keys(q).length) { mkt.q = { ...mkt.q, ...q }; mkt.qAt = Date.now(); mkt.err = null; }
  } catch (e) { mkt.err = 'offline'; }
  emit();
}

const ymd = (d) => d.toISOString().slice(0, 10).replace(/-/g, '') + '000000';
async function refreshBars() {
  if (Date.now() - mkt.barsAt < 3 * 3600e3 && Object.keys(mkt.bars).length >= ALL.length - 1) return;
  const end = new Date(), start = new Date(Date.now() - 400 * 864e5);
  const got = {};
  await Promise.all(ALL.map(async (s) => {
    try {
      const j = await getJSON(`https://ts-api.cnbc.com/harmony/app/bars/${encodeURIComponent(s)}/1D/${ymd(start)}/${ymd(end)}/adjusted/EST5EDT.json`);
      got[s] = j.barData.priceBars.map((b) => [b.tradeTimeinMills, +b.close]).filter((b) => b[1] > -1e9);
    } catch {}
  }));
  if (Object.keys(got).length) { mkt.bars = { ...mkt.bars, ...got }; mkt.barsAt = Date.now(); persist(); emit(); }
}

async function refreshFed() {
  if (mkt.fed && Date.now() - mkt.fed.at < 6 * 3600e3) return;
  try {
    const r = (await getJSON('https://markets.newyorkfed.org/api/rates/unsecured/effr/last/500.json')).refRates;
    const moves = []; let prev = null;
    for (const x of [...r].reverse()) { const t = [x.targetRateFrom, x.targetRateTo]; if (prev && t[1] !== prev[1]) moves.push({ date: x.effectiveDate, from: prev, to: t }); prev = t; }
    mkt.fed = { lo: r[0].targetRateFrom, hi: r[0].targetRateTo, effr: r[0].percentRate, date: r[0].effectiveDate, moves: moves.slice(-6), at: Date.now() };
    persist(); emit();
  } catch {}
}

async function refreshCPI() {
  if (mkt.cpi && Date.now() - mkt.cpi.at < 12 * 3600e3) return;
  try {
    const rows = async (id) => (await getJSON(`https://api.bls.gov/publicAPI/v1/timeseries/data/${id}`)).Results.series[0].data
      .filter((x) => /^M(0\d|1[0-2])$/.test(x.period)).map((x) => [`${x.year}-${x.period.slice(1)}`, +x.value]).sort((a, b) => a[0].localeCompare(b[0]));
    const [all, core] = await Promise.all([rows('CUUR0000SA0'), rows('CUUR0000SA0L1E')]);
    // BLS skipped Oct 2025 (government shutdown): fill single missing months from their neighbours
    const yoy = (raw) => {
      const xs = raw.filter((x) => Number.isFinite(x[1]));
      const m = new Map(xs);
      const keyAdd = (k, d) => { let y = +k.slice(0, 4), mo = +k.slice(5) + d; while (mo < 1) { mo += 12; y--; } while (mo > 12) { mo -= 12; y++; } return `${y}-${String(mo).padStart(2, '0')}`; };
      const val = (k) => m.has(k) ? m.get(k) : (m.has(keyAdd(k, -1)) && m.has(keyAdd(k, 1)) ? (m.get(keyAdd(k, -1)) + m.get(keyAdd(k, 1))) / 2 : null);
      return xs.map(([k, v]) => [k, val(keyAdd(k, -12))]).map(([k, base], i) => [k, base ? +(((xs[i][1] / base) - 1) * 100).toFixed(2) : null]).filter((x) => x[1] != null);
    };
    const a = yoy(all), c = yoy(core);
    if (a.length) { mkt.cpi = { month: a.at(-1)[0], yoy: a.at(-1)[1], prev3: a.at(-4) ? a.at(-4)[1] : null, core: c.length ? c.at(-1)[1] : null, series: a.slice(-24), at: Date.now() }; persist(); emit(); }
  } catch {}
}

// news.json (written by the GitHub job): headlines + this week's calendar + server signals
export async function refreshNewsFeed(fetchNews) {
  const n = await fetchNews();
  if (n) { mkt.news = n; mkt.cal = n.cal || []; emit(); }
}

let timer = null, slow = null, fast = false, newsFn = null;
async function loop() { clearTimeout(timer); await refreshQuotes(); persistSoon(); timer = setTimeout(loop, fast ? 5000 : 30000); }
export function startMarket(fetchNews) {
  if (fetchNews) newsFn = fetchNews;
  if (timer || slow) return;
  timer = setTimeout(loop, 0);
  const slowAll = () => { refreshBars(); refreshFed(); refreshCPI(); if (newsFn) refreshNewsFeed(newsFn); };
  slowAll();
  slow = setInterval(slowAll, 10 * 60e3);
}
// 5-second quotes while a market screen is open, 30 seconds otherwise
export function setFast(v) { const was = fast; fast = v; if (v && !was && slow) loop(); }
export function stopMarket() { clearTimeout(timer); clearInterval(slow); timer = null; slow = null; }
let pt = 0; function persistSoon() { if (Date.now() - pt > 60e3) { pt = Date.now(); persist(); } }

export function useMarket() {
  const [, set] = useState(0);
  useEffect(() => { subs.add(set); return () => subs.delete(set); }, []);
  return mkt;
}

// ---------- helpers on daily bars ----------
const closes = (s) => mkt.bars[s] || [];
function changeOver(s, days, live) {
  const b = closes(s); if (!b.length) return null;
  const cur = live != null ? live : b.at(-1)[1];
  const t = Date.now() - days * 864e5;
  let ref = null; for (const x of b) { if (x[0] <= t) ref = x[1]; else break; }
  return ref == null ? null : { abs: cur - ref, pct: ref ? ((cur - ref) / Math.abs(ref)) * 100 : null };
}
const avgLast = (s, n) => { const b = closes(s).slice(-n); return b.length >= n * 0.8 ? b.reduce((a, x) => a + x[1], 0) / b.length : null; };
export function dailyVol(s = SYMS.gold, n = 60) {
  const b = closes(s).slice(-(n + 1)); if (b.length < 20) return null;
  const r = []; for (let i = 1; i < b.length; i++) r.push(Math.log(b[i][1] / b[i - 1][1]));
  const m = r.reduce((a, x) => a + x, 0) / r.length;
  return Math.sqrt(r.reduce((a, x) => a + (x - m) ** 2, 0) / (r.length - 1));
}
export const spark = (s, days = 90) => { const t = Date.now() - days * 864e5; const b = closes(s).filter((x) => x[0] >= t); const l = mkt.q[s]; if (l && b.length) b.push([Date.now(), l.last]); return b; };

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sgn = (v, thr) => (v == null ? 0 : v >= 2 * thr ? 2 : v >= thr ? 1 : v <= -2 * thr ? -2 : v <= -thr ? -1 : 0);

/**
 * Every driver: current value, changes, and its effect on gold.
 * effect: −2 (strong push down) … +2 (strong push up). fx = effect in the next days, fm = next weeks/months
 */
export function drivers(newsItems) {
  const q = mkt.q, P = PB;
  const L = (s) => (q[s] ? q[s].last : closes(s).length ? closes(s).at(-1)[1] : null);
  const out = [];

  // 1. Real interest rate
  {
    const s = SYMS.real, v = L(s), w = changeOver(s, 7, v), m = changeOver(s, 30, v);
    const fx = -sgn(w && w.abs, 0.08), fm = -sgn(m && m.abs, 0.15);
    out.push({ key: 'real', name: 'Real interest rate', sub: 'US 10-year TIPS yield', sym: s, v, unit: '%', d: q[s] && q[s].chg, w: w && w.abs, m: m && m.abs, kind: 'pt', fx, fm, weight: 2,
      now: v == null ? '' : v >= 2 ? 'High: holding gold costs you a lot of missed interest.' : v >= 1 ? 'Moderate.' : v >= 0 ? 'Low: good for gold.' : 'Negative: very good for gold.',
      why: 'The #1 driver. Gold pays no interest. When safe US bonds pay well above inflation, big investors sell gold for bonds. When real rates fall, they come back to gold.',
      hist: `Since 1971, when real rates rose 1+ point in 3 months, gold went up over the next 3 months only ${P.real.rising.h3.up}% of the time (avg ${P.real.rising.h3.avg}%). When they fell 1+ point, it averaged +${P.real.falling.h3.avg}% (3 mo) and +${P.real.falling.h12.avg}% (12 mo).` });
  }
  // 2. Dollar
  {
    const s = SYMS.dxy, v = L(s), w = changeOver(s, 7, v), m = changeOver(s, 30, v);
    out.push({ key: 'usd', name: 'US dollar', sub: 'Dollar index (DXY)', sym: s, v, unit: '', d: q[s] && q[s].pct, w: w && w.pct, m: m && m.pct, kind: 'pct',
      fx: -sgn(w && w.pct, 0.7), fm: -sgn(m && m.pct, 1.5), weight: 1.5,
      now: '',
      why: 'Gold is priced in dollars. A stronger dollar makes gold more expensive for everyone else, so demand drops and the price falls.',
      hist: `Since 1971, in months the dollar rose over 1%, gold fell ${100 - P.usd.sameUp.up}% of the time (avg ${P.usd.sameUp.avg}%). In months it fell over 1%, gold rose ${P.usd.sameDown.up}% of the time (avg +${P.usd.sameDown.avg}%).` });
  }
  // 3. Rate expectations: 2-year yield vs the Fed's current rate
  {
    const s = SYMS.y2, v = L(s), w = changeOver(s, 7, v), m = changeOver(s, 30, v);
    const fed = mkt.fed; const mid = fed ? (fed.lo + fed.hi) / 2 : null;
    const gap = v != null && mid != null ? v - mid : null;
    const fmv = (gap == null ? 0 : gap <= -0.5 ? 2 : gap <= -0.2 ? 1 : gap >= 0.5 ? -2 : gap >= 0.2 ? -1 : 0);
    const last = fed && fed.moves.length ? fed.moves.at(-1) : null;
    out.push({ key: 'fed', name: 'Fed interest rate', sub: fed ? `Fed rate ${fed.lo.toFixed(2)} to ${fed.hi.toFixed(2)}% · 2-yr yield ${v != null ? v.toFixed(2) + '%' : '…'}` : 'US 2-year yield', sym: s, v, unit: '%', d: q[s] && q[s].chg, w: w && w.abs, m: m && m.abs, kind: 'pt',
      fx: -sgn(w && w.abs, 0.1), fm: clamp(fmv - sgn(m && m.abs, 0.25), -2, 2), weight: 1.5,
      now: gap == null ? '' : gap <= -0.2 ? `Traders expect rate CUTS ahead (2-yr yield ${Math.abs(gap).toFixed(2)} below the Fed rate). Good for gold.` : gap >= 0.2 ? `Traders expect more rate HIKES (2-yr yield ${gap.toFixed(2)} above the Fed rate). Bad for gold.` : 'Traders expect rates to stay about the same.',
      extra: last ? `Last Fed move: ${last.to[1] > last.from[1] ? 'HIKE' : 'CUT'} on ${last.date} (${last.from[0].toFixed(2)} to ${last.from[1].toFixed(2)}% → ${last.to[0].toFixed(2)} to ${last.to[1].toFixed(2)}%)` : '',
      why: 'The Fed sets US interest rates. Cuts make holding gold cheaper and weaken the dollar, so gold usually rises. Hikes do the opposite. Markets move BEFORE the Fed acts, so what traders expect matters more than the decision itself.',
      hist: `Since 1971, after the FIRST cut of a cutting cycle (${P.fed.firstCut.n} times), gold was higher 6 months later in ${P.fed.firstCut.h6.up}% of cases (avg +${P.fed.firstCut.h6.avg}%). Hikes alone did not always sink gold: what matters is whether rates rise faster than inflation (real rates, above).` });
  }
  // 4. Inflation
  {
    const c = mkt.cpi;
    const trend = c && c.prev3 != null ? c.yoy - c.prev3 : null;
    out.push({ key: 'infl', name: 'Inflation', sub: c ? `US prices +${c.yoy.toFixed(1)}% a year (${c.month})${c.core != null ? ` · core ${c.core.toFixed(1)}%` : ''}` : 'US consumer prices', v: c && c.yoy, unit: '%', kind: 'none',
      fx: 0, fm: trend == null ? 0 : sgn(trend, 0.3) + (c.yoy >= 4 ? 1 : 0), weight: 1,
      now: trend == null ? '' : trend >= 0.3 ? `Rising (${trend > 0 ? '+' : ''}${trend.toFixed(1)} pts in 3 months). Supports gold long-term, but hot reports can push the Fed to hike (short-term negative).` : trend <= -0.3 ? `Cooling (${trend.toFixed(1)} pts in 3 months). Less need for gold as protection, but opens the door to rate cuts.` : 'Steady.',
      why: 'Gold keeps its value when money loses it. Rising inflation brings buyers. The catch: if the Fed fights inflation with hikes, real rates rise and gold can fall anyway.',
      hist: `Since 1971, when yearly inflation rose 1+ point within 6 months, gold averaged +${P.infl.rising.h3.avg}% over the next 3 months and +${P.infl.rising.h12.avg}% over 12 months.` });
  }
  // 5. Fear & stocks
  {
    const sv = SYMS.vix, ss = SYMS.spx, vix = L(sv), spx = L(ss);
    const sw = changeOver(ss, 7, spx), dd = q[ss] && q[ss].hi52 ? ((spx - q[ss].hi52) / q[ss].hi52) * 100 : null;
    let fx = 0, fm = 0, now = '';
    if (vix != null) {
      if (vix >= 35) { fx = -1; fm = 2; now = `Panic (VIX ${vix.toFixed(0)}). Traders often sell gold first to cover stock losses, then gold recovers.`; }
      else if (vix >= 25) { fx = 1; fm = 1; now = `Nervous markets (VIX ${vix.toFixed(0)}). Safe-haven buying supports gold.`; }
      else if (vix >= 18) { fx = 0; fm = 0; now = `Normal (VIX ${vix.toFixed(0)}).`; }
      else { fx = -1; fm = 0; now = `Calm, "risk-on" (VIX ${vix.toFixed(0)}). Money prefers stocks over gold.`; }
    }
    if (dd != null && dd <= -10) now += ` Stocks are ${Math.abs(dd).toFixed(0)}% below their 1-year high.`;
    out.push({ key: 'fear', name: 'Fear & stock market', sub: `VIX ${vix != null ? vix.toFixed(1) : '…'} · S&P 500 ${q[ss] && q[ss].pct != null ? (q[ss].pct >= 0 ? '+' : '') + q[ss].pct.toFixed(1) + '% today' : ''}`, sym: sv, v: vix, unit: '', d: q[sv] && q[sv].pct, w: sw && sw.pct, kind: 'fear',
      fx, fm, weight: 1, now,
      why: 'Fear brings safe-haven buying. BUT in a real crash, traders who lose money on stocks sell gold to raise cash (margin calls). That happened in 2008 (gold −30%) and March 2020 (−12% in 8 days). Both times gold then rose to new records as central banks cut rates.',
      hist: `Since 1971, in months stocks fell 4%+ gold was up only ${P.stocks.bad.same.up}% of the time that month, but 6 months later it was higher ${P.stocks.bad.h6.up}% of the time (avg +${P.stocks.bad.h6.avg}%).` });
  }
  // 6. Oil
  {
    const s = SYMS.oil, v = L(s), w = changeOver(s, 7, v), m = changeOver(s, 30, v);
    out.push({ key: 'oil', name: 'Oil', sub: 'WTI crude, $ a barrel', sym: s, v, unit: '$', d: q[s] && q[s].pct, w: w && w.pct, m: m && m.pct, kind: 'pct',
      fx: sgn(w && w.pct, 6) > 0 ? 1 : 0, fm: sgn(m && m.pct, 10) > 0 ? 1 : sgn(m && m.pct, 10) < 0 ? -1 : 0, weight: 0.5, now: '',
      why: 'Oil jumps raise inflation and often come with wars or supply shocks, both good for gold. Weak oil cools inflation.', hist: '' });
  }
  // 7. News mood (last 48h headlines)
  {
    const items = newsItems || (mkt.news && mkt.news.items) || [];
    const recent = items.filter((x) => Date.now() - Date.parse(x.date) < 24 * 3600e3);
    const up = recent.filter((x) => x.impact === 'up').reduce((a, x) => a + (x.strength || 1), 0);
    const dn = recent.filter((x) => x.impact === 'down').reduce((a, x) => a + (x.strength || 1), 0);
    const bal = up + dn ? (up - dn) / (up + dn) : 0;
    out.push({ key: 'news', name: 'News & world events', sub: `${recent.length} headlines in 24h · ${recent.filter((x) => x.impact === 'up').length} positive, ${recent.filter((x) => x.impact === 'down').length} negative`, kind: 'none',
      fx: up + dn < 4 ? 0 : bal >= 0.5 ? 2 : bal >= 0.2 ? 1 : bal <= -0.5 ? -2 : bal <= -0.2 ? -1 : 0, fm: 0, weight: 1,
      now: up + dn < 4 ? 'Not much news.' : bal >= 0.2 ? 'Headlines lean towards things that lift gold (war, rate cuts, weak dollar…).' : bal <= -0.2 ? 'Headlines lean towards things that weigh on gold (hikes, strong dollar, peace…).' : 'Mixed headlines.',
      why: 'Wars, sanctions, tariffs and financial scares send money into gold within hours. Peace deals and strong economic news take it out.', hist: '' });
  }
  // 8. Trend & stretch of gold itself
  {
    const s = SYMS.gold, v = L(s), w = changeOver(s, 7, v), m = changeOver(s, 30, v);
    const a50 = avgLast(s, 50), a200 = avgLast(s, 200);
    const d200 = a200 && v ? ((v - a200) / a200) * 100 : null;
    const trendUp = a50 && v ? v > a50 : null;
    const fx = sgn(w && w.pct, 1.5) > 0 ? 1 : sgn(w && w.pct, 1.5) < 0 ? -1 : 0;
    const fm = d200 == null ? 0 : d200 > 20 ? -2 : d200 > 12 ? -1 : d200 < -5 ? 1 : trendUp ? 1 : 0;
    out.push({ key: 'trend', name: 'Gold trend', sub: `$${v ? v.toFixed(0) : '…'}/oz · ${d200 != null ? (d200 >= 0 ? '+' : '') + d200.toFixed(0) + '% vs 200-day avg' : ''}`, sym: s, v, unit: '$', d: q[s] && q[s].pct, w: w && w.pct, m: m && m.pct, kind: 'pct',
      fx, fm, weight: 1,
      now: d200 == null ? '' : d200 > 20 ? 'Very stretched above its long-term average. Big pullbacks are more likely from here.' : d200 > 12 ? 'Well above its long-term average. Rallies can pause.' : d200 < -5 ? 'Below its long-term average: historically a better time to buy.' : trendUp ? 'Uptrend (above its 50-day average).' : 'Downtrend (below its 50-day average).',
      why: 'Traders follow trends: rising prices attract more buyers, and breaking below key averages triggers selling. When gold runs far above its 200-day average it tends to pull back.', hist: '' });
  }
  // 9. Central banks (slow, structural)
  out.push({ key: 'cb', name: 'Central bank buying', sub: 'China, Poland, India, Turkey and others', kind: 'none', fx: 0, fm: 1, weight: 0.5,
    now: 'Central banks bought over 1,000 tonnes a year in 2022 to 2024, about double the 2010s average, and kept buying since. This steady demand kept gold high even when real rates rose.',
    why: 'Central banks buy gold to depend less on the dollar (especially after Russia\'s reserves were frozen in 2022). Their buying is slow, but it puts a floor under the price. Poland\'s central bank (NBP) is one of the biggest buyers.', hist: '' });
  return out;
}

// Złoty effect, shown separately (doesn't change world gold, changes YOUR price)
export function zlotyEffect() {
  const s = SYMS.usdpln, q = mkt.q[s];
  const v = q ? q.last : null; const m = changeOver(s, 30, v);
  return { v, d: q && q.pct, m: m && m.pct };
}

const LABELS = [[0.45, 'Leaning UP', 'up'], [0.15, 'Slightly up', 'up'], [-0.15, 'Mixed / sideways', 'flat'], [-0.45, 'Slightly down', 'down'], [-9, 'Leaning DOWN', 'down']];
function verdict(ds, key) {
  let sum = 0, wsum = 0, agree = 0, active = 0;
  for (const d of ds) { const e = d[key]; wsum += d.weight * 2; sum += d.weight * e; if (e) active += d.weight; }
  const score = wsum ? sum / wsum * 2 : 0; // −2…2 scaled to roughly −1…1
  const [, label, dir] = LABELS.find(([t]) => score >= t);
  for (const d of ds) if (d[key] && Math.sign(d[key]) === Math.sign(score)) agree += d.weight;
  const conf = active ? agree / active : 0;
  const confLabel = Math.abs(score) < 0.15 ? 'Low' : conf >= 0.75 && Math.abs(score) >= 0.35 ? 'Medium' : 'Low';
  const top = [...ds].filter((d) => d[key]).sort((a, b) => Math.abs(b[key] * b.weight) - Math.abs(a[key] * a.weight)).slice(0, 3);
  return { score, label, dir, conf, confLabel, top };
}

// Rough outlook: direction from the drivers, range from gold's recent volatility.
export function outlook(ds, pricePLN) {
  const vol = dailyVol();
  const range = (days) => (vol && pricePLN ? { lo: pricePLN * Math.exp(-vol * Math.sqrt(days)), hi: pricePLN * Math.exp(vol * Math.sqrt(days)) } : null);
  return { days: { ...verdict(ds, 'fx'), range: range(5) }, weeks: { ...verdict(ds, 'fm'), range: range(21) }, vol };
}

export function liveSignals() { return computeSignals(mkt.q, mkt.cal, Date.now()); }
