// Trading 212 Public API mock for testing (no real key needed). Follows the official docs
// (docs.trading212.com, API v0): HTTP Basic auth (key:secret), /api/v0/equity/... endpoints, rate limits
// with x-ratelimit-* headers, cursor pagination with nextPagePath, plain-text error bodies.
// It is served behind the same path the app's relay uses: /t212/{demo|live}/api/v0/...
// Run: node tools/t212mock.mjs [port]   Keys: demo "DEMOKEY":"DEMOSECRET", live "LIVEKEY":"LIVESECRET".
// Special key "NOSCOPE" (any secret) has no orders:execute scope.
import http from 'node:http';

const PORT = +(process.argv[2] || 8787);
const KEYS = { demo: ['DEMOKEY', 'DEMOSECRET'], live: ['LIVEKEY', 'LIVESECRET'] };
const INSTR = [
  ['AAPL_US_EQ', 'AAPL', 'STOCK', 'USD', 'Apple', true, 'US0378331005'], ['NVDA_US_EQ', 'NVDA', 'STOCK', 'USD', 'NVIDIA', true, 'US67066G1040'],
  ['MSFT_US_EQ', 'MSFT', 'STOCK', 'USD', 'Microsoft', true, 'US5949181045'], ['VUAAl_EQ', 'VUAA', 'ETF', 'USD', 'Vanguard S&P 500 (Acc)', false, 'IE00BFMXXD54'],
  ['VUAAm_EQ', 'VUAA', 'ETF', 'EUR', 'Vanguard S&P 500 (Acc) Milan', false, 'IE00BFMXXD54'], ['CSPXl_EQ', 'CSPX', 'ETF', 'USD', 'iShares Core S&P 500 (Acc)', false, 'IE00B5BMR087'],
  ['VUSAl_EQ', 'VUSA', 'ETF', 'GBX', 'Vanguard S&P 500 (Dist)', false, 'IE00B3XXRP09'],
].map(([ticker, shortName, type, currencyCode, name, extendedHours, isin]) => ({ ticker, shortName, type, currencyCode, name, extendedHours, isin, addedOn: '2020-01-01T00:00:00Z', maxOpenQuantity: 1e6, workingScheduleId: 1 }));
const PX = { AAPL_US_EQ: 230.5, NVDA_US_EQ: 182.1, MSFT_US_EQ: 470.2, VUAAl_EQ: 136.7, VUAAm_EQ: 117.9, CSPXl_EQ: 762.4, VUSAl_EQ: 9850 };
const plnPer = { USD: 4.06, EUR: 4.45, GBX: 0.0531 };

function account(env) {
  return { env, cash: 25000, currency: 'PLN', id: env === 'demo' ? 1000001 : 2000002, pos: { AAPL_US_EQ: { q: 4, avg: 210 }, VUAAl_EQ: { q: 10, avg: 120 } }, orders: [], hist: [], nextId: 5000, realized: 0 };
}
const ACC = { demo: account('demo'), live: account('live') };
// seed some filled history (60 orders so pagination is used)
for (const env of ['demo', 'live']) for (let i = 0; i < 60; i++) {
  const t = Date.parse('2026-01-05T15:00:00Z') + i * 4 * 864e5; const tk = ['AAPL_US_EQ', 'NVDA_US_EQ', 'VUAAl_EQ'][i % 3]; const side = i % 4 === 3 ? 'SELL' : 'BUY';
  ACC[env].hist.push({ order: { id: 4000 + i, ticker: tk, type: 'MARKET', side, status: 'FILLED', quantity: side === 'SELL' ? -1 : 1, filledQuantity: side === 'SELL' ? -1 : 1, filledValue: PX[tk] * 0.9, currency: inst(tk).currencyCode, createdAt: new Date(t).toISOString(), instrument: { ticker: tk, name: inst(tk).name, currency: inst(tk).currencyCode, isin: inst(tk).isin } },
    fill: { id: 9000 + i, filledAt: new Date(t + 2000).toISOString(), price: PX[tk] * 0.9, quantity: side === 'SELL' ? -1 : 1, tradingMethod: 'TOTV', type: 'TRADE', walletImpact: { currency: 'PLN', fxRate: plnPer[inst(tk).currencyCode], netValue: PX[tk] * 0.9 * plnPer[inst(tk).currencyCode], realisedProfitLoss: 0, taxes: [{ name: 'CURRENCY_CONVERSION_FEE', quantity: PX[tk] * 0.9 * plnPer[inst(tk).currencyCode] * 0.0015, currency: 'PLN', chargedAt: new Date(t).toISOString() }] } } });
}
function inst(t) { return INSTR.find((x) => x.ticker === t); }

// per account + endpoint limits from the docs: [requests, seconds]
const LIMITS = { 'GET account/summary': [1, 5], 'GET positions': [1, 1], 'GET orders': [1, 5], 'GET orders/id': [1, 1], 'POST orders/market': [50, 60], 'POST orders/limit': [1, 2], 'POST orders/stop': [1, 2], 'POST orders/stop_limit': [1, 2], 'DELETE orders/id': [50, 60],
  'GET history/orders': [20, 60], 'GET history/dividends': [20, 60], 'GET history/transactions': [20, 60], 'GET metadata/instruments': [1, 50], 'GET metadata/exchanges': [1, 30], 'GET pies': [1, 30], 'GET pies/id': [1, 5] };
const used = {};
export const log = [];

function send(res, code, body, headers = {}) {
  const txt = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(code, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS', 'Access-Control-Expose-Headers': 'x-ratelimit-limit, x-ratelimit-remaining, x-ratelimit-reset, x-ratelimit-used, x-ratelimit-period', 'Content-Type': typeof body === 'string' ? 'text/plain' : 'application/json', ...headers });
  res.end(txt);
}
const positionsOf = (a) => Object.entries(a.pos).filter(([, p]) => p.q > 1e-9).map(([tk, p]) => {
  const i = inst(tk); const cur = PX[tk]; const k = plnPer[i.currencyCode]; const cost = p.q * p.avg * k; const val = p.q * cur * k;
  return { averagePricePaid: p.avg, createdAt: '2026-02-01T10:00:00Z', currentPrice: cur, instrument: { currency: i.currencyCode, isin: i.isin, name: i.name, ticker: tk }, quantity: p.q, quantityAvailableForTrading: p.q - (a.orders.filter((o) => o.ticker === tk && o.quantity < 0).reduce((s, o) => s - o.quantity, 0)), quantityInPies: 0,
    walletImpact: { currency: 'PLN', currentValue: +val.toFixed(2), fxImpact: null, totalCost: +cost.toFixed(2), unrealizedProfitLoss: +(val - cost).toFixed(2) } };
});
function summary(a) {
  const pos = positionsOf(a); const inv = pos.reduce((s, p) => s + p.walletImpact.currentValue, 0); const cost = pos.reduce((s, p) => s + p.walletImpact.totalCost, 0);
  const reserved = a.orders.filter((o) => o.quantity > 0).reduce((s, o) => s + o.quantity * (o.limitPrice || o.stopPrice || PX[o.ticker]) * plnPer[inst(o.ticker).currencyCode], 0);
  return { cash: { availableToTrade: +(a.cash - reserved).toFixed(2), inPies: 0, reservedForOrders: +reserved.toFixed(2) }, currency: a.currency, id: a.id, investments: { currentValue: +inv.toFixed(2), realizedProfitLoss: +a.realized.toFixed(2), totalCost: +cost.toFixed(2), unrealizedProfitLoss: +(inv - cost).toFixed(2) }, totalValue: +(a.cash + inv).toFixed(2) };
}
function fill(a, o) {
  const i = inst(o.ticker); const k = plnPer[i.currencyCode]; const px = o.type === 'LIMIT' ? o.limitPrice : PX[o.ticker]; const q = o.quantity;
  const p = (a.pos[o.ticker] ||= { q: 0, avg: 0 });
  if (q > 0) { p.avg = (p.avg * p.q + q * px) / (p.q + q); p.q += q; a.cash -= q * px * k * 1.0015; }
  else { a.realized += (-q) * (px - p.avg) * k; p.q += q; a.cash += (-q) * px * k * 0.9985; }
  o.status = 'FILLED'; o.filledQuantity = q; o.filledValue = +(Math.abs(q) * px).toFixed(2);
  a.hist.push({ order: { ...o }, fill: { id: ++a.nextId, filledAt: new Date().toISOString(), price: px, quantity: q, tradingMethod: 'TOTV', type: 'TRADE', walletImpact: { currency: 'PLN', fxRate: k, netValue: +(Math.abs(q) * px * k).toFixed(2), realisedProfitLoss: 0, taxes: [] } } });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, '');
  const m = /^\/t212\/(demo|live)(\/api\/v0\/[^?]*)(\?.*)?$/.exec(req.url);
  if (!m) return send(res, 404, 'Not found');
  const [, env, path, qs = ''] = m; const a = ACC[env]; const q = new URLSearchParams(qs.slice(1));
  // auth
  const auth = req.headers.authorization || '';
  let key = '', secret = '';
  if (auth.startsWith('Basic ')) { [key, secret] = Buffer.from(auth.slice(6), 'base64').toString().split(':'); }
  const noScope = key === 'NOSCOPE';
  if (!noScope && (key !== KEYS[env][0] || secret !== KEYS[env][1])) return send(res, 401, 'Bad API key');
  // endpoint + rate limit
  const ep0 = path.replace('/api/v0/equity/', '');
  const ep = `${req.method} ${ep0.replace(/^orders\/\d+$/, 'orders/id').replace(/^pies\/\d+$/, 'pies/id')}`;
  const lim = LIMITS[ep];
  if (lim) {
    const k = env + ep; const now = Date.now() / 1000; const w = (used[k] ||= []).filter((t) => t > now - lim[1]); used[k] = w;
    const h = { 'x-ratelimit-limit': lim[0], 'x-ratelimit-period': lim[1], 'x-ratelimit-remaining': Math.max(0, lim[0] - w.length - 1), 'x-ratelimit-reset': Math.ceil((w[0] || now) + lim[1]), 'x-ratelimit-used': w.length + 1 };
    if (w.length >= lim[0]) { log.push(['429', ep]); return send(res, 429, `Limited: ${lim[0]} / ${lim[1]}s`, h); }
    w.push(now); res.rl = h;
  }
  let body = '';
  for await (const c of req) body += c;
  log.push([req.method, path, body]);
  if (process.env.MOCK_LOG) console.log(env, key, req.method, path + qs, body);
  const ok = (j) => send(res, 200, j, res.rl);
  try {
    if (ep === 'GET account/summary') return ok(summary(a));
    if (ep === 'GET positions') return ok(positionsOf(a).filter((p) => !q.get('ticker') || p.instrument.ticker === q.get('ticker')));
    if (ep === 'GET orders') return ok(a.orders);
    if (ep === 'GET orders/id') { const o = a.orders.find((x) => x.id === +ep0.split('/')[1]) || a.hist.map((h) => h.order).find((x) => x.id === +ep0.split('/')[1]); return o ? ok(o) : send(res, 404, 'Order not found'); }
    if (ep === 'DELETE orders/id') { const id = +ep0.split('/')[1]; const i = a.orders.findIndex((x) => x.id === id); if (i < 0) return send(res, 404, 'Order not found'); a.orders.splice(i, 1); return send(res, 200, '', res.rl); }
    if (ep.startsWith('POST orders/')) {
      if (noScope) return send(res, 403, 'Scope( orders:execute ) missing for API key');
      const b = JSON.parse(body || '{}'); const type = ep0.split('/')[1].toUpperCase(); const i = inst(b.ticker);
      if (!i || typeof b.quantity !== 'number' || !b.quantity) return send(res, 400, 'Failed validation');
      if (Math.round(Math.abs(b.quantity) * 1e6) !== Math.abs(b.quantity) * 1e6) return send(res, 400, 'Failed validation: quantity precision');
      if (type !== 'MARKET' && !['DAY', 'GOOD_TILL_CANCEL'].includes(b.timeValidity)) return send(res, 400, 'Failed validation: timeValidity');
      if ((type === 'LIMIT' || type === 'STOP_LIMIT') && !(b.limitPrice > 0)) return send(res, 400, 'Failed validation: limitPrice');
      if ((type === 'STOP' || type === 'STOP_LIMIT') && !(b.stopPrice > 0)) return send(res, 400, 'Failed validation: stopPrice');
      const held = (a.pos[b.ticker] || { q: 0 }).q;
      if (b.quantity < 0 && -b.quantity > held + 1e-9) return send(res, 400, 'Failed validation: not enough shares to sell');
      const cost = b.quantity * (b.limitPrice || PX[b.ticker]) * plnPer[i.currencyCode];
      if (b.quantity > 0 && cost > summary(a).cash.availableToTrade) return send(res, 400, 'Failed validation: insufficient funds');
      const o = { id: ++a.nextId, ticker: b.ticker, type, side: b.quantity > 0 ? 'BUY' : 'SELL', status: 'NEW', quantity: b.quantity, filledQuantity: 0, filledValue: 0, value: null, limitPrice: b.limitPrice ?? null, stopPrice: b.stopPrice ?? null, timeInForce: b.timeValidity || 'DAY', strategy: 'QUANTITY', currency: i.currencyCode, extendedHours: !!b.extendedHours, initiatedFrom: 'API', createdAt: new Date().toISOString(), instrument: { ticker: i.ticker, name: i.name, currency: i.currencyCode, isin: i.isin } };
      if (type === 'MARKET' || (type === 'LIMIT' && (b.quantity > 0 ? PX[b.ticker] <= b.limitPrice : PX[b.ticker] >= b.limitPrice))) { fill(a, o); } else a.orders.push(o);
      return ok(o);
    }
    if (ep === 'GET history/orders') {
      const lim2 = Math.min(50, +(q.get('limit') || 20)); if (lim2 < 1) return send(res, 400, 'Bad filtering arguments');
      const all = [...a.hist].filter((h) => !q.get('ticker') || h.order.ticker === q.get('ticker')).sort((x, y) => Date.parse(y.order.createdAt) - Date.parse(x.order.createdAt));
      const cur = q.get('cursor') ? +q.get('cursor') : Infinity; const items = all.filter((h) => Date.parse(h.order.createdAt) < cur).slice(0, lim2);
      const more = all.filter((h) => Date.parse(h.order.createdAt) < cur).length > lim2;
      return ok({ items, nextPagePath: more ? `/api/v0/equity/history/orders?limit=${lim2}&cursor=${Date.parse(items.at(-1).order.createdAt)}` : null });
    }
    if (ep === 'GET history/dividends') return ok({ items: [{ amount: 3.21, amountInEuro: 0.72, currency: 'PLN', grossAmountPerShare: 0.26, instrument: { ticker: 'AAPL_US_EQ', name: 'Apple' }, paidOn: '2026-08-14T00:00:00Z', quantity: 4, reference: 'D1', ticker: 'AAPL_US_EQ', tickerCurrency: 'USD', type: 'ORDINARY' }], nextPagePath: null });
    if (ep === 'GET history/transactions') return ok({ items: [{ amount: 25000, currency: 'PLN', dateTime: '2026-01-02T09:00:00Z', reference: 'T1', type: 'DEPOSIT' }], nextPagePath: null });
    if (ep === 'GET metadata/instruments') return ok(INSTR);
    if (ep === 'GET metadata/exchanges') return ok([{ id: 1, name: 'NASDAQ', workingSchedules: [{ id: 1, timeEvents: [] }] }]);
    if (ep === 'GET pies') return ok([{ cash: 12.5, dividendDetails: { gained: 1.2, inCash: 0.3, reinvested: 0.9 }, id: 77, progress: 0.4, result: { priceAvgInvestedValue: 1000, priceAvgResult: 85, priceAvgResultCoef: 0.085, priceAvgValue: 1085 }, status: 'ON_TRACK' }]);
    if (ep === 'GET pies/id') return +ep0.split('/')[1] === 77 ? ok({ instruments: [{ currentShare: 0.6, expectedShare: 0.6, issues: [], ownedQuantity: 2, result: { priceAvgInvestedValue: 600, priceAvgResult: 50, priceAvgResultCoef: 0.083, priceAvgValue: 650 }, ticker: 'VUAAl_EQ' }], settings: { creationDate: '2026-03-01T00:00:00Z', dividendCashAction: 'REINVEST', endDate: null, goal: 5000, icon: 'Home', id: 77, initialInvestment: 1000, instrumentShares: { VUAAl_EQ: 0.6, CSPXl_EQ: 0.4 }, name: 'S&P core', publicUrl: null } }) : send(res, 404, 'pie not found');
    return send(res, 404, 'Not found');
  } catch (e) { return send(res, 400, 'Failed validation'); }
});
server.listen(PORT, () => console.log(`T212 mock on http://localhost:${PORT}/t212/{demo|live}/api/v0/...`));
export { server, ACC };
