// Net worth across everything: cash accounts, credit card, friends, gold, holdings at
// brokers (Trading 212 live, Robinhood / XTB / others entered by hand or CSV), crypto.
// History: rebuilt day by day from your own entries (cash from transactions, gold grams
// from purchase dates x NBP daily gold price) plus a daily snapshot from now on.
import { get, set, netWorth, cardOwed, toPln, accountById, CARD } from './store.js';
import { A } from './assets.js';
import { T212C } from './t212.js';
import { today, addDays } from './util.js';

// value of manual holdings in zł (needs a live or last price; skipped if none)
export function holdingsValue(s) {
  let v = 0, cost = 0, missing = 0;
  for (const h of s.holdings || []) {
    const q = A.q[h.sym];
    const px = q && q.last != null ? q.last : h.lastPx;
    const cur = h.cur || (q && q.cur) || 'USD';
    if (px == null) { missing++; continue; }
    v += toPln(s, h.qty * px * (cur === 'GBX' ? 0.01 : 1), cur === 'GBX' ? 'GBP' : cur);
    cost += toPln(s, h.qty * (h.cost || 0), cur === 'GBX' ? 'GBP' : cur);
  }
  return { v, cost, missing };
}
export function t212Value(s) {
  const p = T212C.sum; if (!p) return 0;
  return toPln(s, p.totalValue || 0, p.currency || 'PLN');
}
export function fullNetWorth(s, goldPerGram) {
  const base = netWorth(s, goldPerGram);
  const hold = holdingsValue(s).v;
  const t212 = t212Value(s);
  return { ...base, hold, t212, invest: hold + t212, total: base.total + hold + t212 };
}

// day-by-day reconstruction for the last `days` days (zł). Uses today's exchange rates for
// foreign-currency accounts (a simplification, said so in the app).
export function nwSeries(s, goldHist, days = 90) {
  const t = today(); const start = addDays(t, -days);
  const txns = [...s.txns].sort((a, b) => a.date.localeCompare(b.date));
  const buys = [...s.gold.buys].sort((a, b) => a.date.localeCompare(b.date));
  const gp = new Map(goldHist || []);
  // opening balances
  let cash = 0;
  for (const a of s.accounts) cash += toPln(s, a.opening || 0, a.cur);
  let owed = s.card.on ? s.card.opening || 0 : 0;
  const curOf = (id) => (id === CARD ? 'PLN' : (accountById(s, id) || {}).cur || 'PLN');
  const apply = (x) => {
    if (x.from && x.from !== CARD) cash -= toPln(s, x.amt, curOf(x.from));
    if (x.to && x.to !== CARD) cash += toPln(s, x.t === 'xfer' && x.amt2 != null ? x.amt2 : x.amt, curOf(x.to));
    if (s.card.on) { if (x.from === CARD) owed += x.amt; if (x.to === CARD) owed -= x.t === 'xfer' && x.amt2 != null ? x.amt2 : x.amt; }
  };
  let ti = 0, bi = 0, grams = 0, lastGp = null;
  for (const [d, p] of goldHist || []) { if (d <= start) lastGp = p; else break; }
  const out = [];
  for (let d = start; d <= t; d = addDays(d, 1)) {
    while (ti < txns.length && txns[ti].date <= d) apply(txns[ti++]);
    while (bi < buys.length && buys[bi].date <= d) grams += buys[bi++].g;
    if (gp.has(d)) lastGp = gp.get(d);
    out.push([Date.parse(d), cash - owed + grams * (lastGp || 0)]);
  }
  // splice in saved snapshots (they include broker holdings)
  const snap = new Map((s.nwHist || []).map((x) => [x.d, x.v]));
  return out.map(([t0, v]) => { const d = new Date(t0).toISOString().slice(0, 10); return [t0, snap.has(d) ? snap.get(d) : v]; });
}

// one snapshot a day (zł), kept for 3 years
export function recordSnapshot(total) {
  if (!Number.isFinite(total)) return;
  const d = today(); const s = get();
  const h = s.nwHist || [];
  const lastE = h.at(-1);
  if (lastE && lastE.d === d && Math.abs(lastE.v - total) < 0.5) return;
  const next = [...h.filter((x) => x.d !== d), { d, v: Math.round(total * 100) / 100 }].slice(-1100);
  set((x) => ({ ...x, nwHist: next }));
}
// change since the last snapshot before today
export function dayChange(total) {
  const h = (get().nwHist || []).filter((x) => x.d < today());
  if (!h.length || !Number.isFinite(total)) return null;
  const prev = h.at(-1).v;
  return { abs: total - prev, pct: prev ? ((total - prev) / Math.abs(prev)) * 100 : null, since: h.at(-1).d };
}
