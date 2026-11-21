// Trading 212 Public API client.
// Keys never leave the phone except to Trading 212 itself:
//  Android app → straight to Trading 212 through the native bridge (CPNative.http).
//  iPhone (browser app) → through your own Cloudflare relay (Trading 212 blocks browser apps),
//  which forwards the request and stores nothing. See relay/README.md.
import { useEffect, useState } from 'preact/hooks';
import { RELAY_URL } from './keys.js';

const LS = 'cp.t212';
const load = () => { try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch { return {}; } };
let cfg = load(); // { env: 'demo'|'live', demo: {key, secret}, live: {key, secret}, relay }
const subs = new Set();
const emit = () => subs.forEach((f) => f({}));
const save = () => { try { localStorage.setItem(LS, JSON.stringify(cfg)); } catch {} emit(); };

// shared portfolio cache (filled by the markets screens, read by net worth and widgets)
export const T212C = { sum: null, pos: null, ord: null, at: 0, err: null };

export const T212 = {
  get env() { return cfg.env || 'demo'; },
  get connected() { const c = cfg[this.env]; return !!(c && c.key && c.secret && c.ok); },
  creds(env = this.env) { return cfg[env] || null; },
  get relay() { return cfg.relay || RELAY_URL || ''; },
  get native() { return !!(window.CPNative && window.CPNative.http); },
  get canConnect() { return this.native || !!this.relay; },
};
export function setEnv(env) { cfg = { ...cfg, env }; save(); }
export function setRelay(url) { cfg = { ...cfg, relay: url.trim().replace(/\/+$/, '') }; save(); }
export function saveCreds(env, key, secret, ok) { cfg = { ...cfg, env, [env]: { key: key.trim(), secret: secret.trim(), ok: !!ok } }; save(); }
export function forget(env) { const c = { ...cfg }; delete c[env]; cfg = c; save(); clearCache(); }
export function useT212() { const [, s] = useState(0); useEffect(() => { const f = () => s((x) => x + 1); subs.add(f); return () => subs.delete(f); }, []); return T212; }

// ---------- transport ----------
let seq = 0; const pending = new Map();
window.cpHttp = (id, status, body) => { const p = pending.get(id); if (p) { pending.delete(id); p({ status, body }); } };
function nativeCall(method, url, auth, body) {
  return new Promise((resolve) => {
    const id = 'h' + ++seq; pending.set(id, resolve);
    window.CPNative.http(id, method, url, auth, body || '');
    setTimeout(() => { if (pending.has(id)) { pending.delete(id); resolve({ status: 0, body: 'timeout' }); } }, 30000);
  });
}

export class T212Error extends Error { constructor(status, msg) { super(msg); this.status = status; } }
const explain = (status, body) => {
  let m = ''; try { const j = JSON.parse(body); m = j.message || j.detail || j.title || j.error || (j.code ? String(j.code) : ''); } catch { m = (body || '').slice(0, 160); }
  if (status === 401) return 'Trading 212 rejected the key. Check the API key and secret (and that it\'s for the right account: Practice or Real).';
  if (status === 403) { const sc = /Scope\(\s*([\w:]+)\s*\)/.exec(m); return `This key doesn't have permission for that${sc ? ` (missing "${sc[1]}")` : m ? ` (${m})` : ''}. In Trading 212, create a key with Account, Portfolio, Orders (read + execute), Metadata, History and Pies enabled.`; }
  if (status === 429) return `Too many requests${m ? ` (${m})` : ''}. Trading 212 allows only a few per second. Try again in a few seconds.`;
  if (status === 408 || status === 0) return 'Trading 212 didn\'t answer in time. Check your internet and try again.';
  if (status === 400 && /quantity|precision|decimal|fraction|minimum|min/i.test(m)) return `Trading 212 refused the amount: ${m}. Try a round number of shares or a slightly bigger amount.`;
  if (status === 400) return `Trading 212 refused the order${m ? `: ${m}` : ''}.`;
  if (status === 404 || status === 405) return 'Not found at Trading 212. The relay address may be wrong.';
  if (status >= 500) return 'Trading 212 (or the relay) is having problems. Try again in a minute.';
  return m || `Trading 212 error ${status}`;
};

// minimum time between calls per endpoint (Trading 212 rate limits)
// official limits: summary 1/5s, positions 1/1s, orders 1/5s, order by id 1/1s, market 50/1m, limit/stop/stop_limit 1/2s,
// history 20/1m, instruments 1/50s, exchanges 1/30s, pies list 1/30s, pie 1/5s
const GAP = { 'account/summary': 5000, positions: 1050, orders: 5000, 'orders/id': 1050, 'metadata/instruments': 50000, 'metadata/exchanges': 30000, 'history/orders': 3100, 'history/dividends': 3100, 'history/transactions': 3100, 'orders/limit': 2000, 'orders/stop': 2000, 'orders/stop_limit': 2000, 'orders/market': 1200, pies: 30000, 'pies/id': 5000 };
const lastCall = {};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export async function call(method, path, body, env = T212.env, creds) {
  const c = creds || T212.creds(env);
  if (!c || !c.key || !c.secret) throw new T212Error(401, 'Not connected');
  const ep0 = path.replace(/^\/api\/v0\/equity\//, '').replace(/\?.*$/, '');
  const ep = /^orders\/\d+$/.test(ep0) && method === 'GET' ? 'orders/id' : /^pies\/\d+/.test(ep0) ? 'pies/id' : ep0.replace(/\/\d+$/, '');
  const gap = GAP[ep] || 0; const k = env + ep;
  const since = Date.now() - (lastCall[k] || 0); if (since < gap) await wait(gap - since);
  lastCall[k] = Date.now();
  const auth = 'Basic ' + btoa(unescape(encodeURIComponent(`${c.key}:${c.secret}`)));
  const json = body ? JSON.stringify(body) : null;
  let res;
  if (T212.native) res = await nativeCall(method, `https://${env}.trading212.com${path}`, auth, json);
  else if (T212.relay) {
    try {
      const r = await fetch(`${T212.relay}/t212/${env}${path}`, { method, headers: { Authorization: auth, ...(json ? { 'Content-Type': 'application/json' } : {}) }, body: json, cache: 'no-store' });
      res = { status: r.status, body: await r.text() };
    } catch { res = { status: 0, body: '' }; }
  } else throw new T212Error(-1, 'On iPhone, Trading 212 needs the relay set up first (see Connect screen).');
  if (res.status < 200 || res.status >= 300) throw new T212Error(res.status, explain(res.status, res.body));
  try { return res.body ? JSON.parse(res.body) : null; } catch { return null; }
}

// ---------- endpoints ----------
const P = '/api/v0/equity';
export const summary = (env, creds) => call('GET', `${P}/account/summary`, null, env, creds);
export const positions = () => call('GET', `${P}/positions`);
export const pendingOrders = () => call('GET', `${P}/orders`);
export const cancelOrder = (id) => call('DELETE', `${P}/orders/${id}`);
// history endpoints are paginated: follow nextPagePath until null (all=true reads up to `max` pages)
async function paged(path, limit, all, max = 20) {
  let r = await call('GET', `${path}${path.includes('?') ? '&' : '?'}limit=${limit}`); const items = [...((r && r.items) || [])];
  let n = 1; while (all && r && r.nextPagePath && n < max) { r = await call('GET', r.nextPagePath.startsWith('/api') ? r.nextPagePath : `${P}/${r.nextPagePath.replace(/^\//, '')}`); items.push(...((r && r.items) || [])); n++; }
  return { items, more: !!(r && r.nextPagePath) };
}
export const orderHistory = (limit = 20, all = false) => paged(`${P}/history/orders`, Math.min(50, limit), all);
export const dividendHistory = (limit = 50, all = false) => paged(`${P}/history/dividends`, Math.min(50, limit), all);
export const transactionHistory = (limit = 50, all = false) => paged(`${P}/history/transactions`, Math.min(50, limit), all);
export const orderById = (id) => call('GET', `${P}/orders/${id}`);
export const pies = () => call('GET', `${P}/pies`);
export const pie = (id) => call('GET', `${P}/pies/${id}`);
export const exchanges = () => call('GET', `${P}/metadata/exchanges`);
const qty = (side, q) => +(side === 'SELL' ? -Math.abs(q) : Math.abs(q)).toFixed(6);
export function placeOrder({ type, side, ticker, quantity, limitPrice, stopPrice, timeValidity = 'DAY', extendedHours = false }) {
  const q = qty(side, quantity);
  if (type === 'MARKET') return call('POST', `${P}/orders/market`, { ticker, quantity: q, extendedHours });
  if (type === 'LIMIT') return call('POST', `${P}/orders/limit`, { ticker, quantity: q, limitPrice: +limitPrice, timeValidity });
  if (type === 'STOP') return call('POST', `${P}/orders/stop`, { ticker, quantity: q, stopPrice: +stopPrice, timeValidity });
  if (type === 'STOP_LIMIT') return call('POST', `${P}/orders/stop_limit`, { ticker, quantity: q, stopPrice: +stopPrice, limitPrice: +limitPrice, timeValidity });
  throw new Error('Unknown order type');
}

// ---------- instruments: which watchlist symbols Trading 212 can trade ----------
// Stored in the browser's Cache Storage (the list is large), refreshed daily.
const CK = 'cp-t212-instr', CU = '/__t212/instruments';
let instr = null, instrLoading = null;
async function clearCache() { instr = null; try { const c = await caches.open(CK); await c.delete(CU + '-demo'); await c.delete(CU + '-live'); } catch {} }
export function instruments() {
  if (instr && instr.env === T212.env && Date.now() - instr.at < 864e5) return Promise.resolve(instr.list);
  if (instrLoading) return instrLoading;
  instrLoading = (async () => {
    const url = CU + '-' + T212.env;
    try {
      const c = await caches.open(CK); const r = await c.match(url);
      if (r) { const d = await r.json(); if (Date.now() - d.at < 864e5) { instr = { ...d, env: T212.env }; return d.list; } }
    } catch {}
    const raw = await call('GET', `${P}/metadata/instruments`);
    const list = raw.filter((x) => ['STOCK', 'ETF'].includes(x.type)).map((x) => [x.ticker, x.shortName, x.type, x.currencyCode, x.name, x.extendedHours ? 1 : 0, x.isin]);
    instr = { at: Date.now(), list, env: T212.env };
    try { const c = await caches.open(CK); await c.put(url, new Response(JSON.stringify(instr))); } catch {}
    return list;
  })().finally(() => { instrLoading = null; });
  return instrLoading;
}
// CNBC symbol (e.g. NVDA, BRK.B) → Trading 212 instrument
export async function findInstrument(sym) {
  const list = await instruments();
  const lse = /-GB$/.test(sym); // CNBC London listing, e.g. VUAA-GB -> Trading 212 VUAAl_EQ
  const s = sym.toUpperCase().replace(/-[A-Z]{2}$/, '').replace('.', '');
  const hits = list.filter((x) => x[1] && x[1].toUpperCase().replace('.', '') === s);
  const best = (lse ? hits.find((x) => /l_EQ$/.test(x[0])) : hits.find((x) => /_US_EQ$/.test(x[0]))) || hits[0];
  return best ? { ticker: best[0], shortName: best[1], type: best[2], currency: best[3], name: best[4], extendedHours: !!best[5], isin: best[6] } : null;
}
export const tickerToSym = (t) => { t = t || ''; if (/^[A-Z0-9]+l_EQ$/.test(t)) return t.replace(/l_EQ$/, '') + '-GB'; return t.replace(/_US_EQ$/, '').replace(/[a-z]?_EQ$/, '').replace(/_[A-Z]{2}$/, ''); };
