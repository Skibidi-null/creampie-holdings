// App state: one JSON object saved on the device (localStorage). Nothing is sent anywhere.
import { useEffect, useState } from 'preact/hooks';
import { uid, today, thisYm, ymOf, prevYm, nextYm, daysInMonth, pad, sum, parseDate, iso } from './util.js';

const KEY = 'cp.data.v1';

export const DEFAULT_EXP = [
  ['groceries', 'Groceries', '🛒', 'Daily living'],
  ['halal', 'Halal meat & food', '🥩', 'Daily living'],
  ['household', 'Household', '🧴', 'Daily living'],
  ['dining', 'Dining out', '🍽️', 'Personal'],
  ['coffee', 'Coffee & snacks', '☕', 'Personal'],
  ['transport', 'Public transport', '🚇', 'Transport'],
  ['taxi', 'Fuel / Taxi', '🚕', 'Transport'],
  ['car', 'Car', '🚗', 'Transport'],
  ['rent', 'Rent', '🏠', 'Housing'],
  ['utilities', 'Utilities', '💡', 'Housing'],
  ['phone', 'Internet / Phone', '📶', 'Housing'],
  ['uni', 'University fees', '🎓', 'Studies'],
  ['books', 'Books & supplies', '📚', 'Studies'],
  ['gifts', 'Gifts & dates', '🎁', 'Personal'],
  ['subs', 'Subscriptions', '🔁', 'Personal'],
  ['health', 'Health & fitness', '💪', 'Personal'],
  ['clothes', 'Clothing', '👕', 'Personal'],
  ['haircut', 'Haircut & care', '💈', 'Personal'],
  ['travel', 'Travel', '✈️', 'Personal'],
  ['charity', 'Sadaqah / Charity', '🤲', 'Personal'],
  ['misc', 'Miscellaneous', '📦', 'Other'],
].map(([id, name, icon, group]) => ({ id, name, icon, group }));

export const DEFAULT_INC = [
  ['salary', 'Salary', '💼'],
  ['freelance', 'Freelance / Side', '🧑‍💻'],
  ['gift_in', 'Gift received', '🎁'],
  ['refund', 'Refund', '↩️'],
  ['other_in', 'Other income', '💰'],
].map(([id, name, icon]) => ({ id, name, icon }));

export const ACCOUNT_KINDS = { bank: 'Bank', savings: 'Savings', cash: 'Cash' };

const blank = () => ({
  v: 2,
  created: today(),
  accounts: [
    { id: 'main', name: 'Main bank', cur: 'PLN', kind: 'bank', opening: 0, icon: '🏦' },
    { id: 'savings', name: 'Savings', cur: 'PLN', kind: 'savings', opening: 0, icon: '🔒' },
    { id: 'cash', name: 'Cash', cur: 'PLN', kind: 'cash', opening: 0, icon: '💵' },
  ],
  txns: [],
  card: { on: true, name: 'Credit card', limit: 0, opening: 0, dueDay: 0, target: 0 },
  friends: [],
  gold: { buys: [], below: null, dropPct: 2, alertsOn: true, newsOn: true, goalGrams: 0, sellSpread: 4 },
  budget: { monthly: 0, cats: {} },
  recurring: [],
  goals: [],
  cats: { exp: DEFAULT_EXP, inc: DEFAULT_INC },
  zakat: { nisab: 'gold', countOwed: true, hawl: '', other: 0, debts: 0 },
  settings: {
    privacy: false, pin: null, remind9pm: true, cardRemind: true, onboarded: false, alertsSetup: false,
    // v2
    cur: 'PLN', curSec: {}, mute: false, vibrate: true, risk: 'balanced', riskPct: 1, tax: 'PL',
    quiet: { on: true, from: 23, to: 7 }, autoLock: 60, sunday: true, fxFee: 0.15,
    cooling: { on: true, pct: 10, mins: 10 }, backupRemind: true, lastBackup: 0,
  },
  rates: { PLN: 1, USD: 0, EUR: 0, AED: 0, GBP: 0, INR: 0, at: 0 },
  markets: { list: [{ sym: '@GC.1', name: 'Gold' }, { sym: 'BTC-USD', name: 'Bitcoin' }, { sym: 'VUAA-GB', name: 'S&P 500 ETF (VUAA)' }, { sym: 'EURPLN=', name: 'EUR/PLN' }], alerts: {}, alertsOn: true },
  // v2: price/signal alerts, several per asset. { id, sym, name, kind, a, b, pct, days, once, on, sound, vib, urgent, made, fired }
  alerts: [],
  // v2: guard + practice trading + journal + advisor call log + holdings at other brokers + net worth history
  guard: { on: false, dailyLoss: 0, lockedDay: null },
  paper: { cash: 100000, cur: 'USD', start: 100000, pos: [], trades: [] },
  journal: [],
  calls: [],
  holdings: [],
  nwHist: [],
  dca: { on: false, amount: 0, day: 10, plan: [] },
  freedom: { spend: 0, rate: 4, ret: 6, monthly: 0 },
  chart: {},
});

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    return migrate(JSON.parse(raw));
  } catch (e) {
    try { localStorage.setItem(KEY + '.broken.' + Date.now(), localStorage.getItem(KEY)); } catch {}
    return blank();
  }
}

export function migrate(d) {
  const b = blank();
  const out = { ...b, ...d };
  for (const k of ['card', 'gold', 'budget', 'zakat', 'settings', 'rates', 'cats', 'markets', 'guard', 'paper', 'dca', 'freedom', 'chart']) out[k] = { ...b[k], ...(d[k] || {}) };
  for (const k of ['accounts', 'txns', 'friends', 'recurring', 'goals', 'alerts', 'journal', 'calls', 'holdings', 'nwHist']) if (!Array.isArray(out[k])) out[k] = [];
  out.settings.quiet = { ...b.settings.quiet, ...(out.settings.quiet || {}) };
  out.settings.cooling = { ...b.settings.cooling, ...(out.settings.cooling || {}) };
  if (!out.settings.curSec || typeof out.settings.curSec !== 'object') out.settings.curSec = {};
  if (!Array.isArray(out.paper.pos)) out.paper.pos = [];
  if (!Array.isArray(out.paper.trades)) out.paper.trades = [];
  // v1 -> v2: old one-per-asset alerts {sym: {above, below}} become separate alerts (old object kept as is)
  if (d.v !== 2 && out.markets.alerts && !out.alerts.length) {
    const nm = (sym) => ((out.markets.list || []).find((x) => x.sym === sym) || {}).name || sym;
    for (const [sym, a] of Object.entries(out.markets.alerts)) {
      if (a && a.above) out.alerts.push({ id: uid(), sym, name: nm(sym), kind: 'above', a: a.above, once: false, on: true, sound: true, vib: true, made: 0 });
      if (a && a.below) out.alerts.push({ id: uid(), sym, name: nm(sym), kind: 'below', a: a.below, once: false, on: true, sound: true, vib: true, made: 0 });
    }
  }
  out.v = 2;
  if (!Array.isArray(out.gold.buys)) out.gold.buys = [];
  if (!Array.isArray(out.markets.list)) out.markets.list = [];
  if (!out.markets.alerts || typeof out.markets.alerts !== 'object') out.markets.alerts = {};
  return out;
}

let state = load();
const subs = new Set();
let saveTimer = null;

export const get = () => state;
export function set(fn) {
  const next = typeof fn === 'function' ? fn(state) : fn;
  if (!next || next === state) return;
  state = next;
  subs.forEach((f) => f(state));
  clearTimeout(saveTimer);
  saveTimer = setTimeout(persist, 150);
}
export function persist() {
  clearTimeout(saveTimer);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.error(e); }
  onSaved.forEach((f) => f(state));
}
export const onSaved = new Set();
export function replaceAll(d) { state = migrate(d); subs.forEach((f) => f(state)); persist(); }
export function wipe() { state = blank(); subs.forEach((f) => f(state)); persist(); }

export function useStore() {
  const [, force] = useState(0);
  useEffect(() => { const f = () => force((x) => x + 1); subs.add(f); return () => subs.delete(f); }, []);
  return state;
}

window.addEventListener('pagehide', persist);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') persist(); });
try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch {}

// ---------- updates ----------
export const patch = (key, obj) => set((s) => ({ ...s, [key]: { ...s[key], ...obj } }));

export function addTxn(t) {
  const txn = { id: uid(), date: today(), note: '', ...t };
  set((s) => ({ ...s, txns: [...s.txns, txn] }));
  return txn;
}
export function updateTxn(id, t) { set((s) => ({ ...s, txns: s.txns.map((x) => (x.id === id ? { ...x, ...t } : x)) })); }
export function deleteTxn(id) { set((s) => ({ ...s, txns: s.txns.filter((x) => x.id !== id && x.pair !== id) })); }

export function upsert(listKey, item) {
  set((s) => {
    const list = s[listKey];
    const exists = list.some((x) => x.id === item.id);
    return { ...s, [listKey]: exists ? list.map((x) => (x.id === item.id ? { ...x, ...item } : x)) : [...list, { id: uid(), ...item }] };
  });
}
export function removeFrom(listKey, id) { set((s) => ({ ...s, [listKey]: s[listKey].filter((x) => x.id !== id) })); }

export function upsertBuy(b) {
  set((s) => {
    const buys = s.gold.buys;
    const next = b.id && buys.some((x) => x.id === b.id) ? buys.map((x) => (x.id === b.id ? { ...x, ...b } : x)) : [...buys, { ...b, id: uid() }];
    return { ...s, gold: { ...s.gold, buys: next } };
  });
}
export function removeBuy(id) { set((s) => ({ ...s, gold: { ...s.gold, buys: s.gold.buys.filter((x) => x.id !== id) } })); }

// ---------- lookups ----------
export const CARD = 'card';
export const accountById = (s, id) => s.accounts.find((a) => a.id === id);
export const curOf = (s, id) => (id === CARD ? 'PLN' : (accountById(s, id) || {}).cur || 'PLN');
export const catOf = (s, id) => s.cats.exp.find((c) => c.id === id) || s.cats.inc.find((c) => c.id === id) || { id, name: id || 'Other', icon: '•' };
export const toPln = (s, amt, cur) => (cur === 'PLN' || !cur ? amt : amt * (s.rates[cur] || 0));
export const placeName = (s, id) => (id === CARD ? s.card.name : (accountById(s, id) || { name: '-' }).name);

// Txn types:
//  exp  : spending, from account/card
//  inc  : earning, to account
//  xfer : between own accounts (or paying the card: to = 'card'); amt2 = amount received if currency differs
//  fout : money given to friend (lend, or repay what I owe). from = account or null. friend balance +
//  fin  : money from friend (borrow, or they repay me). to = account or null. friend balance −
//  adj  : balance correction for an account (amt can be negative)

export function balance(s, id) {
  const a = accountById(s, id);
  let b = a ? a.opening || 0 : 0;
  for (const t of s.txns) {
    if (t.from === id) b -= t.amt;
    if (t.to === id) b += t.t === 'xfer' && t.amt2 != null ? t.amt2 : t.amt;
  }
  return b;
}

export function cardOwed(s) {
  let o = s.card.opening || 0;
  for (const t of s.txns) {
    if (t.from === CARD) o += t.amt; // purchases (or cash advance)
    if (t.to === CARD) o -= t.t === 'xfer' && t.amt2 != null ? t.amt2 : t.amt; // bill payment / refund
  }
  return o;
}

export function friendBalances(s) {
  const map = new Map(s.friends.map((f) => [f.id, 0]));
  for (const t of s.txns) {
    if (!t.friend || !map.has(t.friend)) continue;
    const plnAmt = toPln(s, t.amt, curOf(s, t.from || t.to));
    if (t.t === 'fout') map.set(t.friend, map.get(t.friend) + plnAmt);
    if (t.t === 'fin') map.set(t.friend, map.get(t.friend) - plnAmt);
  }
  return map;
}

export const txnPln = (s, t) => toPln(s, t.amt, curOf(s, t.t === 'inc' || t.t === 'fin' ? t.to : t.from));

export function monthStats(s, ym) {
  const r = { ym, income: 0, spend: 0, saved: 0, byCat: {}, card: 0, count: 0 };
  for (const t of s.txns) {
    if (ymOf(t.date) !== ym) continue;
    const v = txnPln(s, t);
    if (t.t === 'exp') { r.spend += v; r.byCat[t.cat] = (r.byCat[t.cat] || 0) + v; r.count++; if (t.from === CARD) r.card += v; }
    else if (t.t === 'inc') r.income += v;
    else if (t.t === 'xfer') {
      const toS = (accountById(s, t.to) || {}).kind === 'savings';
      const fromS = (accountById(s, t.from) || {}).kind === 'savings';
      if (toS && !fromS) r.saved += v;
      if (fromS && !toS && t.to !== CARD) r.saved -= v;
    }
  }
  r.net = r.income - r.spend;
  return r;
}

export function spentOn(s, date) {
  return sum(s.txns.filter((t) => t.t === 'exp' && t.date === date), (t) => txnPln(s, t));
}

export function dailyLimit(s) {
  const B = s.budget.monthly;
  if (!B) return null;
  const ym = thisYm();
  const t = today();
  const day = Number(t.slice(8));
  const dim = daysInMonth(ym);
  const before = sum(s.txns.filter((x) => x.t === 'exp' && ymOf(x.date) === ym && x.date < t), (x) => txnPln(s, x));
  const todaySpent = spentOn(s, t);
  const daysLeft = dim - day + 1;
  const allowance = Math.max(0, (B - before) / daysLeft);
  return { allowance, todaySpent, left: allowance - todaySpent, monthLeft: B - before - todaySpent, daysLeft, budget: B };
}

// Credit card pace for a month: what was put on the card so far, the daily average,
// and where that pace ends up by the last day of the month.
// e.g. 1000 zł in the first 10 days → 100 zł/day → 3000 zł for a 30-day month.
export function cardProjection(s, ym = thisYm()) {
  const t = today();
  const dim = daysInMonth(ym);
  const isNow = ym === thisYm();
  const day = isNow ? Number(t.slice(8)) : dim;
  const days = [];
  for (let i = 0; i < dim; i++) days.push(0);
  let spent = 0;
  for (const x of s.txns) {
    if (x.from !== CARD || ymOf(x.date) !== ym || x.date > t) continue;
    spent += x.amt;
    days[Number(x.date.slice(8)) - 1] += x.amt;
  }
  const perDay = day ? spent / day : 0;
  const daysLeft = dim - day;
  const projected = spent + perDay * daysLeft;
  const target = s.card.target || 0;
  return {
    ym, spent, day, dim, daysLeft, perDay, projected, days,
    extra: perDay * daysLeft,
    owedEnd: cardOwed(s) + perDay * daysLeft,
    target,
    overTarget: target ? projected - target : null,
    safePerDay: target && daysLeft > 0 ? Math.max(0, (target - spent) / daysLeft) : null,
  };
}

export function cashTotal(s) {
  return sum(s.accounts, (a) => toPln(s, balance(s, a.id), a.cur));
}

export function goldTotals(s, livePerGram) {
  const buys = s.gold.buys;
  const grams = sum(buys, (b) => b.g);
  const paid = sum(buys, (b) => b.g * b.paid);
  const market = sum(buys, (b) => b.g * (b.market || b.paid));
  const premiums = buys.filter((b) => b.market > 0).map((b) => (b.paid - b.market) / b.market);
  const avgPremium = premiums.length ? sum(premiums) / premiums.length : null;
  const value = livePerGram ? grams * livePerGram : 0;
  return { grams, paid, market, avgPaid: grams ? paid / grams : 0, avgMarket: grams ? market / grams : 0, avgPremium, value, pl: value - paid };
}

export function netWorth(s, livePerGram) {
  const cash = cashTotal(s);
  const gold = goldTotals(s, livePerGram).value;
  const owed = s.card.on ? cardOwed(s) : 0;
  let fOwedMe = 0, fIOwe = 0;
  for (const v of friendBalances(s).values()) { if (v > 0) fOwedMe += v; else fIOwe -= v; }
  const goals = 0; // goals are tracked inside accounts, not extra money
  return { cash, gold, card: owed, fOwedMe, fIOwe, total: cash + gold + fOwedMe - owed - fIOwe + goals };
}

// ---------- recurring bills ----------
export function applyRecurring() {
  const s = get();
  const t = today();
  const cur = thisYm();
  const add = [];
  const rec = s.recurring.map((r) => {
    if (r.paused) return r;
    let last = r.last || prevYm(cur);
    let ym = nextYm(last);
    let changed = false;
    while (ym <= cur) {
      const day = Math.min(r.day, daysInMonth(ym));
      const date = `${ym}-${pad(day)}`;
      if (date > t) break;
      add.push({ id: uid(), t: 'exp', amt: r.amt, cat: r.cat, from: r.from, date, note: r.name, rec: r.id });
      last = ym; changed = true;
      ym = nextYm(ym);
    }
    return changed ? { ...r, last } : r;
  });
  if (add.length) set((x) => ({ ...x, recurring: rec, txns: [...x.txns, ...add] }));
  return add.length;
}

// When a bill is created, which month counts as "last added"
export function initialLast(day) {
  const t = today();
  const ym = thisYm();
  const date = `${ym}-${pad(Math.min(day, daysInMonth(ym)))}`;
  return date < t ? ym : prevYm(ym); // already passed this month → start next month
}

export function nextDue(dayOfMonth, from = today()) {
  if (!dayOfMonth) return null;
  let ym = from.slice(0, 7);
  for (let i = 0; i < 3; i++) {
    const d = `${ym}-${pad(Math.min(dayOfMonth, daysInMonth(ym)))}`;
    if (d >= from) return d;
    ym = nextYm(ym);
  }
  return null;
}

export function upcomingBills(s, days = 35) {
  const t = today();
  const end = iso(new Date(parseDate(t).getTime() + days * 86400000));
  const out = [];
  for (const r of s.recurring) {
    if (r.paused) continue;
    let d = nextDue(r.day, t);
    // skip if this month's already added
    if (d && d.slice(0, 7) === (r.last || '')) d = nextDue(r.day, `${nextYm(r.last)}-01`);
    if (d && d <= end) out.push({ date: d, name: r.name, amt: r.amt, cur: curOf(s, r.from), icon: catOf(s, r.cat).icon, kind: 'bill' });
  }
  if (s.card.on && s.card.dueDay) {
    const d = nextDue(s.card.dueDay, t);
    const owed = cardOwed(s);
    if (d && d <= end) out.push({ date: d, name: `${s.card.name} payment`, amt: owed, cur: 'PLN', icon: '💳', kind: 'card' });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}
