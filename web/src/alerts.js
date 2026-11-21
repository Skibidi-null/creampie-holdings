// Alerts v2: many per asset. Kinds:
//  above / below      price crosses a level
//  enter / leave      price enters or leaves a range [a, b]
//  move               price moves pct% (up or down, sign of pct, or both if 'both') over `days`
//  score              advisor verdict turns Buy (or better) / Sell (or worse)
//  volume             today's volume is `pct` times the 20-day average
// In-app checks run on every price tick; with the app closed the Android worker and the
// GitHub job (iPhone push) check the same list (see push.js config).
import { get, set } from './store.js';
import { A, tickBus, nameOf, fmtPrice } from './assets.js';
import { candles } from './data.js';
import { analyze, verdictOf } from './advisor.js';
import { uid } from './util.js';
import { feedback } from './fx.js';

export const KINDS = {
  above: { name: 'Price goes above', color: '#3CFFB4' },
  below: { name: 'Price falls below', color: '#FF5C8A' },
  enter: { name: 'Enters the range', color: '#00D2FF' },
  leave: { name: 'Leaves the range', color: '#00D2FF' },
  move: { name: 'Moves by %', color: '#FF3CC8' },
  score: { name: 'Advisor signal', color: '#FFE36E' },
  volume: { name: 'Volume spike', color: '#A794FF' },
};
export const describe = (al) => {
  const f = (v) => fmtPrice(v, al.sym);
  switch (al.kind) {
    case 'above': return `Price goes above ${f(al.a)}`;
    case 'below': return `Price falls below ${f(al.a)}`;
    case 'enter': return `Enters the range ${f(al.a)} to ${f(al.b)}`;
    case 'leave': return `Leaves the range ${f(al.a)} to ${f(al.b)}`;
    case 'move': return `${al.dir === 'down' ? 'Drops' : al.dir === 'up' ? 'Rises' : 'Moves'} ${al.pct}% in ${al.days === 1 ? 'a day' : al.days === 7 ? 'a week' : al.days + ' days'}`;
    case 'score': return al.dir === 'sell' ? 'Advisor score turns Sell' : al.dir === 'any' ? 'Advisor verdict changes' : 'Advisor score turns Buy';
    case 'volume': return `Volume above ${al.pct}x normal`;
    default: return al.kind;
  }
};

export function addAlert(al) {
  const a = { id: uid(), on: true, once: false, sound: true, vib: true, urgent: false, made: Date.now(), name: nameOf(al.sym), ...al };
  set((s) => ({ ...s, alerts: [...(s.alerts || []), a] }));
  return a;
}
export function updateAlert(id, ch) { set((s) => ({ ...s, alerts: s.alerts.map((x) => (x.id === id ? { ...x, ...ch } : x)) })); }
export function removeAlert(id) { set((s) => ({ ...s, alerts: s.alerts.filter((x) => x.id !== id) })); }
export const alertsFor = (sym) => (get().alerts || []).filter((x) => x.sym === sym);

// ---------- quiet hours ----------
export function inQuiet(d = new Date()) {
  const q = get().settings.quiet || {};
  if (!q.on) return false;
  const h = d.getHours() + d.getMinutes() / 60;
  return q.from > q.to ? h >= q.from || h < q.to : h >= q.from && h < q.to;
}

// ---------- fired log (kept on the device, outside the main data) ----------
const LOG = 'cp.alog';
export const firedLog = () => { try { return JSON.parse(localStorage.getItem(LOG)) || []; } catch { return []; } };
const pushLog = (x) => { try { localStorage.setItem(LOG, JSON.stringify([x, ...firedLog()].slice(0, 120))); } catch {} };

export const alertBus2 = new Set();
function fire(al, text) {
  const quiet = inQuiet() && !al.urgent;
  pushLog({ id: al.id, sym: al.sym, text, t: Date.now(), quiet });
  if (al.once) updateAlert(al.id, { on: false, firedAt: Date.now() });
  else updateAlert(al.id, { firedAt: Date.now() });
  if (!quiet) {
    if (al.sound !== false) feedback('alert'); else if (al.vib !== false) { try { navigator.vibrate && navigator.vibrate([30, 60, 30]); } catch {} }
  }
  alertBus2.forEach((f) => f({ al, text, quiet }));
}

// per-alert last state (which side of the level) kept for this session
const side = {};
function checkPrice(q) {
  for (const al of get().alerts || []) {
    if (!al.on) continue;
    const x = q[al.sym]; if (!x || x.last == null) continue;
    // stale prices (older than 20 minutes) never trigger
    if (x.at && Date.now() - x.at > 20 * 60e3) continue;
    const p = x.ext && x.status && x.status !== 'REG_MKT' && x.ext.last != null ? x.ext.last : x.last;
    const nm = al.name || nameOf(al.sym), f = (v) => fmtPrice(v, al.sym);
    let s = null, msg = null;
    if (al.kind === 'above') { s = p >= al.a ? 1 : p < al.a * 0.997 ? 0 : side[al.id]; msg = `${nm} is above ${f(al.a)} (now ${f(p)})`; }
    else if (al.kind === 'below') { s = p <= al.a ? 1 : p > al.a * 1.003 ? 0 : side[al.id]; msg = `${nm} fell below ${f(al.a)} (now ${f(p)})`; }
    else if (al.kind === 'enter' || al.kind === 'leave') {
      const lo = Math.min(al.a, al.b), hi = Math.max(al.a, al.b); const inside = p >= lo && p <= hi;
      s = al.kind === 'enter' ? (inside ? 1 : 0) : inside ? 0 : 1;
      msg = al.kind === 'enter' ? `${nm} entered your range ${f(lo)} to ${f(hi)} (now ${f(p)})` : `${nm} broke ${p > hi ? 'above' : 'below'} your range ${f(lo)} to ${f(hi)} (now ${f(p)})`;
    } else if (al.kind === 'volume' && x.vol) {
      const v = parseFloat(String(x.vol).replace(/,/g, '')) * (/M$/i.test(x.vol) ? 1e6 : /K$/i.test(x.vol) ? 1e3 : /B$/i.test(x.vol) ? 1e9 : 1);
      const avg = volAvg[al.sym]; if (!avg || !v) continue;
      s = v >= avg * (al.pct || 2) ? 1 : 0; msg = `${nm}: volume ${(v / avg).toFixed(1)}x normal today`;
    } else continue;
    const prev = side[al.id];
    side[al.id] = s;
    // fire on the change into the trigger state (first reading only arms the alert, unless it
    // was created already past the level, then it fires once right away)
    if (s === 1 && prev === 0) fire(al, msg);
    else if (s === 1 && prev === undefined && !al.firedAt && Date.now() - (al.made || 0) < 10 * 60e3 && al.kind !== 'leave') fire(al, msg);
  }
}

// % move and volume averages need daily bars; checked every 5 minutes
const volAvg = {};
async function checkSlow() {
  const list = (get().alerts || []).filter((x) => x.on);
  for (const al of list) {
    try {
      if (al.kind === 'move') {
        const b = await candles(al.sym, '3M'); const q = A.q[al.sym]; if (!b.length || !q) continue;
        const now = q.last; const ref = b[Math.max(0, b.length - 1 - (al.days || 1))].close;
        const ch = ((now - ref) / ref) * 100; const want = Math.abs(al.pct || 5);
        const hit = al.dir === 'down' ? ch <= -want : al.dir === 'up' ? ch >= want : Math.abs(ch) >= want;
        const k = al.id; const prev = side[k]; side[k] = hit ? 1 : 0;
        if (hit && prev !== 1 && (!al.firedAt || Date.now() - al.firedAt > 12 * 3600e3)) fire(al, `${al.name || nameOf(al.sym)} ${ch >= 0 ? 'is up' : 'is down'} ${Math.abs(ch).toFixed(1)}% in ${al.days === 1 ? 'a day' : al.days + ' days'}`);
      } else if (al.kind === 'volume' && !volAvg[al.sym]) {
        const b = await candles(al.sym, '3M'); const v = b.slice(-21, -1).map((x) => x.volume).filter(Boolean);
        if (v.length > 10) volAvg[al.sym] = v.reduce((s, x) => s + x, 0) / v.length;
      } else if (al.kind === 'score') {
        const r = await analyze(al.sym, { maxAge: 30 * 60e3 }); if (r.score == null) continue;
        const v = r.verdict; const want = al.dir || 'buy';
        const st = want === 'any' ? v.key : want === 'sell' ? (v.dir < 0 ? 1 : 0) : v.dir > 0 ? 1 : 0;
        const prev = side[al.id]; side[al.id] = st;
        if (prev === undefined) { if (al.last && al.last !== v.key && (want === 'any' || st === 1)) fire(al, `${al.name || nameOf(al.sym)}: advisor now says ${v.label} (score ${r.score})`); }
        else if (want === 'any' ? prev !== st : st === 1 && prev === 0) fire(al, `${al.name || nameOf(al.sym)}: advisor now says ${v.label} (score ${r.score})`);
        if (al.last !== v.key) updateAlert(al.id, { last: v.key });
      }
    } catch {}
  }
}
let started = false;
export function startAlerts() {
  if (started) return; started = true;
  tickBus.add(checkPrice);
  setTimeout(checkSlow, 8000);
  setInterval(checkSlow, 5 * 60e3);
}
// how close the nearest active price alert is (for the "next alert" widget)
export function nextAlert() {
  let best = null;
  for (const al of get().alerts || []) {
    if (!al.on || !['above', 'below'].includes(al.kind)) continue;
    const q = A.q[al.sym]; if (!q || q.last == null) continue;
    const d = Math.abs(q.last - al.a) / q.last * 100;
    if (!best || d < best.d) best = { al, d, px: q.last };
  }
  return best;
}
export { verdictOf };
