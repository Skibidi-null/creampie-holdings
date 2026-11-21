// Trading safety: risk guard (daily loss limit locks new trades for the rest of the day),
// cooling-off timer for impulsive big buys, practice-vs-live checks.
import { get, set, patch } from './store.js';
import { T212, T212C } from './t212.js';
import { today } from './util.js';

// remember the account value at the start of each day
export function trackDayStart() {
  const g = get().guard || {}; const sum = T212C.sum; if (!sum) return;
  const d = today(); const key = T212.env;
  if (!g.day || g.day.d !== d || g.day.env !== key) patch('guard', { day: { d, env: key, v: sum.totalValue, cur: sum.currency } });
}
export function dayLoss() {
  const g = get().guard || {}; const sum = T212C.sum;
  if (!sum || !g.day || g.day.d !== today() || g.day.env !== T212.env) return null;
  return g.day.v - sum.totalValue; // positive = lost today
}
export function guardState() {
  const g = get().guard || {};
  const locked = g.lockedDay === today();
  const loss = dayLoss();
  const limit = g.dailyLoss || 0;
  if (g.on && limit > 0 && loss != null && loss >= limit && !locked) { patch('guard', { lockedDay: today() }); return { on: true, locked: true, loss, limit, cur: g.day && g.day.cur }; }
  return { on: !!g.on, locked: !!(g.on && locked), loss, limit, cur: (g.day && g.day.cur) || (T212C.sum && T212C.sum.currency) || 'PLN' };
}
export const liveAllowed = () => { const g = get().guard || {}; return !!(g.on && g.dailyLoss > 0); };

// ---------- cooling-off ----------
const CK = 'cp.cool';
const load = () => { try { return JSON.parse(localStorage.getItem(CK)) || {}; } catch { return {}; } };
export function coolingNeeded({ side, cost, portfolio, verdictDir, dayPct }) {
  const c = get().settings.cooling || {};
  if (!c.on || side !== 'BUY' || !cost || !portfolio) return null;
  const big = (cost / portfolio) * 100 >= (c.pct || 10);
  if (!big) return null;
  const reasons = [];
  if (verdictDir != null && verdictDir <= 0) reasons.push(verdictDir < 0 ? 'the advisor says Sell' : 'the advisor says Hold');
  if (dayPct != null && dayPct >= 5) reasons.push(`it already jumped ${dayPct.toFixed(1)}% today`);
  if (!reasons.length) return null;
  return { mins: c.mins || 10, reasons, pct: (cost / portfolio) * 100 };
}
export function coolingLeft(sym) { const u = load()[sym]; return u && u > Date.now() ? u - Date.now() : 0; }
export function startCooling(sym, mins) { const x = load(); x[sym] = Date.now() + mins * 60e3; try { localStorage.setItem(CK, JSON.stringify(x)); } catch {} }
export function coolingDone(sym) { const x = load(); return x[sym] && x[sym] <= Date.now(); }
export function clearCooling(sym) { const x = load(); delete x[sym]; try { localStorage.setItem(CK, JSON.stringify(x)); } catch {} }
