// Markets: watchlist (stocks + crypto), asset detail with chart & signals, price alerts,
// Trading 212 portfolio and trading.
import { useState, useEffect, useMemo, useRef } from 'preact/hooks';
import { html, LineChart, Seg, Sheet, Field, NumInput, Switch, toast, SettingRow, Back } from './ui.js';
import { Icon } from './icons.js';
import { useStore, get, patch } from './store.js';
import { useAssetsLive, A, search, addWatch, removeWatch, moveWatch, nameOf, RANGES, useBars, bars, assetSignal, setAlert, fmtPrice, isCrypto, cleanSym, INDICES } from './assets.js';
import { Spark } from './holo.js';
import { ChartCard, Depth } from './chart.js';
import { SignalPanel } from './advisorScreen.js';
import { useAnalysis } from './advisor.js';
import { AlertSheet } from './alertsScreen.js';
import { describe, updateAlert, KINDS } from './alerts.js';
import { fearGreed } from './data.js';
import { feedback } from './fx.js';
import { T212C, useT212, T212, setEnv, setRelay, saveCreds, forget, summary, positions, pendingOrders, cancelOrder, orderHistory, placeOrder, findInstrument, tickerToSym, T212Error } from './t212.js';
import { num, parseNum } from './util.js';

const go = (r) => { location.hash = '#/' + r; };
const pctTxt = (v, d = 2) => (v == null || !Number.isFinite(v) ? '—' : `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(d)}%`);
const money = (v, cur = 'PLN', d = 2) => (v == null || !Number.isFinite(v) ? '—' : `${v < 0 ? '−' : ''}${Math.abs(v).toLocaleString('pl-PL', { minimumFractionDigits: d, maximumFractionDigits: d })} ${cur === 'PLN' ? 'zł' : cur}`);
const statusTxt = (q) => !q ? '' : q.h24 ? '24h market' : q.status === 'REG_MKT' ? 'Market open' : q.status === 'PRE_MKT' ? 'Pre-market' : q.status === 'POST_MKT' ? 'After hours' : q.status ? 'Market closed' : '';

// ---------- small hook: Trading 212 portfolio (positions + summary), refreshed while visible ----------
const pf = T212C;
const pfSubs = new Set();
async function refreshPortfolio(full) {
  if (!T212.connected) return;
  try {
    pf.pos = await positions();
    if (full || !pf.sum || Date.now() - pf.at > 15e3) { pf.sum = await summary(); pf.ord = await pendingOrders(); pf.at = Date.now(); }
    pf.err = null;
  } catch (e) { pf.err = e.message; }
  pfSubs.forEach((f) => f({}));
}
function usePortfolio(ms = 10000) {
  const [, s] = useState(0);
  const t212 = useT212();
  useEffect(() => {
    const f = () => s((x) => x + 1); pfSubs.add(f);
    let alive = true; let timer;
    const loop = async () => { if (!alive) return; await refreshPortfolio(); if (alive) timer = setTimeout(loop, ms); };
    if (t212.connected) loop();
    return () => { alive = false; clearTimeout(timer); pfSubs.delete(f); };
  }, [t212.connected, t212.env]);
  return pf;
}

// ================= Markets home =================
export function Markets() {
  const s = useStore();
  const a = useAssetsLive();
  const t = useT212();
  const p = usePortfolio(15000);
  const [sheet, setSheet] = useState(null);
  const [edit, setEdit] = useState(false);
  const list = s.markets.list;
  const age = a.at ? Math.round((Date.now() - a.at) / 1000) : null;
  return html`<div class="screen">
    <div class="top"><div class="grow"><div class="h-title">Markets</div><div class="hint"><span class=${`livedot ${a.err ? 'off' : ''}`}></span>${a.err ? 'Offline, last prices' : `Live · ${age != null ? age + 's ago' : '…'}`}</div></div>
      <button class="iconbtn" onClick=${() => setSheet('search')} aria-label="Add"><${Icon} n="plus" /></button>
      <button class="iconbtn" onClick=${() => go('broker')} aria-label="Trading 212"><${Icon} n="settings" /></button>
    </div>

    <div class="idx">${INDICES.map(([sym, nm]) => { const q = a.q[sym]; return html`<button class="idx-i" onClick=${() => go('asset/' + encodeURIComponent(sym))}>
      <div class="hint">${nm}</div><div class="mono idx-v">${q ? (sym === 'BTC-USD' ? '$' + num(q.last, 0) : num(q.last, sym === '.VIX' ? 2 : 0)) : '…'}</div>
      <div class=${`mono idx-c ${q && q.pct >= 0 ? (sym === '.VIX' ? 'down' : 'up') : sym === '.VIX' ? 'up' : 'down'}`}>${q ? pctTxt(q.pct) : ''}</div></button>`; })}</div>

    ${t.connected ? html`<div class="card tap" onClick=${() => go('portfolio')}>
      <div class="row between"><span class="hint">Trading 212 · ${t.env === 'live' ? 'Real money' : 'Practice'}</span><${Icon} n="chevron" size=${16} cls="mute" /></div>
      ${p.sum ? html`<div class="row between" style="align-items:flex-end;margin-top:4px">
        <div><div class="big-num mono">${money(p.sum.totalValue, p.sum.currency)}</div><div class="hint">Cash to trade ${money(p.sum.cash.availableToTrade, p.sum.currency)}</div></div>
        <div style="text-align:right"><div class=${`mono ${p.sum.investments.unrealizedProfitLoss >= 0 ? 'up' : 'down'}`} style="font-weight:700">${p.sum.investments.unrealizedProfitLoss >= 0 ? '+' : ''}${money(p.sum.investments.unrealizedProfitLoss, p.sum.currency)}</div><div class="hint">open profit / loss</div></div>
      </div>` : html`<div class="hint" style="margin-top:6px">${p.err || 'Loading portfolio…'}</div>`}
    </div>` : html`<div class="card tap" onClick=${() => go('broker')}>
      <div class="row"><span class="tile-ic-lg acc"><${Icon} n="swap" size=${20} /></span><div class="grow"><b>Connect Trading 212</b><div class="hint">See your portfolio and buy or sell from here</div></div><${Icon} n="chevron" size=${16} cls="mute" /></div>
    </div>`}

    <div class="sect"><span class="h-title">Watchlist</span><button class="more" onClick=${() => setEdit(!edit)}>${edit ? 'Done' : 'Edit'}</button></div>
    <div class="card" style="padding:2px 14px">
      ${list.length ? list.map((w, i) => html`<${WatchRow} w=${w} q=${a.q[w.sym]} edit=${edit} first=${i === 0} last=${i === list.length - 1} />`) : html`<div class="empty">Your watchlist is empty.</div>`}
    </div>
    <button class="btn block" onClick=${() => setSheet('search')}><${Icon} n="plus" size=${18} /> Add stock or crypto</button>
    <div class="note" style="margin:12px 4px">Stocks: live during US market hours (15:30–22:00 Polish time), plus pre-market and after-hours. Crypto trades 24/7 (Coinbase prices in USD). Charts and signals are a guide, not advice.</div>
    ${sheet === 'search' && html`<${SearchSheet} onClose=${() => setSheet(null)} />`}
  </div>`;
}

function WatchRow({ w, q, edit, first, last }) {
  const pts = useSpark(w.sym);
  const ext = q && q.ext && q.status !== 'REG_MKT' ? q.ext : null;
  return html`<div class="item wrow" onClick=${() => !edit && go('asset/' + encodeURIComponent(w.sym))}>
    <span class=${`em ${isCrypto(w.sym) ? 'gold' : ''}`} style="font-weight:700;font-size:11px">${cleanSym(w.sym).slice(0, 4)}</span>
    <div class="grow"><div class="t1">${w.name || cleanSym(w.sym)}</div><div class="t2">${cleanSym(w.sym)}${ext ? ` · ${ext.type === 'PRE_MKT' ? 'pre' : 'after'} ${pctTxt(ext.pct)}` : ''}</div></div>
    ${edit ? html`<div class="row" style="gap:4px">
      <button class="iconbtn sm" disabled=${first} onClick=${(e) => { e.stopPropagation(); moveWatch(w.sym, -1); }}>↑</button>
      <button class="iconbtn sm" disabled=${last} onClick=${(e) => { e.stopPropagation(); moveWatch(w.sym, 1); }}>↓</button>
      <button class="iconbtn sm" onClick=${(e) => { e.stopPropagation(); removeWatch(w.sym); }} aria-label="Remove">✕</button>
    </div>` : html`<${Spark} pts=${pts} w=${60} h=${26} />
    <div style="text-align:right;min-width:86px"><div class="mono" style="font-weight:650">${q ? fmtPrice(q.last, w.sym) : '…'}</div>
      <span class=${`chg ${q && q.pct >= 0 ? 'up' : 'down'}`}>${q ? pctTxt(q.pct) : ''}</span></div>`}
  </div>`;
}
function useSpark(sym) {
  const [pts, setPts] = useState(null);
  useEffect(() => { let ok = true; bars(sym, '1M').then((p) => ok && setPts(p)).catch(() => {}); return () => { ok = false; }; }, [sym]);
  return pts;
}

// ================= search =================
function SearchSheet({ onClose }) {
  const s = useStore();
  const [q, setQ] = useState('');
  const [res, setRes] = useState(null);
  useEffect(() => {
    if (!q.trim()) { setRes(null); return; }
    let ok = true; const t = setTimeout(() => search(q).then((r) => ok && setRes(r)), 300);
    return () => { ok = false; clearTimeout(t); };
  }, [q]);
  const have = new Set(s.markets.list.map((x) => x.sym));
  return html`<${Sheet} title="Add to watchlist" onClose=${onClose}>${(close) => html`
    <input class="input" placeholder="Company, ticker or coin (e.g. Nvidia, TSLA, Solana)" value=${q} onInput=${(e) => setQ(e.target.value)} autofocus />
    <div class="card" style="padding:2px 14px;margin-top:10px">
      ${res == null ? html`<div class="hint" style="padding:12px 0">Popular: ${['NVDA', 'TSLA', 'AMZN', 'GOOGL', 'META', 'SPY', 'SOL', 'XRP'].map((x) => html`<button class="chip" style="margin:3px" onClick=${() => setQ(x)}>${x}</button>`)}</div>`
        : !res.length ? html`<div class="hint" style="padding:12px 0">Nothing found.</div>`
        : res.map((r) => html`<div class="item">
          <div class="grow"><div class="t1">${r.name}</div><div class="t2">${cleanSym(r.sym)} · ${r.kind} · ${r.where}</div></div>
          ${have.has(r.sym) ? html`<span class="hint">Added</span>` : html`<button class="btn sm primary" onClick=${() => { addWatch(r); toast(`${r.name} added`); }}>Add</button>`}
        </div>`)}
    </div>
    <div class="note">Trading 212 trades mainly US and European listings. Crypto here is for prices and alerts only (Trading 212's API doesn't trade crypto).</div>
  `}<//>`;
}

// ================= asset detail =================
export function Asset({ sym }) {
  const s = useStore();
  const a = useAssetsLive([sym]);
  const t = useT212();
  const p = usePortfolio(10000);
  const q = a.q[sym];
  const an = useAnalysis(sym);
  const [sheet, setSheet] = useState(null);
  const [inst, setInst] = useState(undefined);
  const [fg, setFg] = useState(null);
  useEffect(() => { if (t.connected && !isCrypto(sym) && !sym.startsWith('.') && !sym.startsWith('@') && !/=$/.test(sym)) findInstrument(sym).then(setInst).catch(() => setInst(null)); else setInst(null); }, [sym, t.connected, t.env]);
  useEffect(() => { if (isCrypto(sym)) fearGreed().then((d) => setFg(d[0])).catch(() => {}); }, [sym]);
  const pos = inst && p.pos ? p.pos.find((x) => x.instrument.ticker === inst.ticker) : null;
  const inList = s.markets.list.some((x) => x.sym === sym);
  const als = (s.alerts || []).filter((x) => x.sym === sym);
  const stale = q && q.at && Date.now() - q.at > 3 * 60e3;
  const unwatch = () => { removeWatch(sym); toast('Removed from watchlist'); };
  return html`<div class="screen">
    <${Back} title=${html`${nameOf(sym)} <span class="mute" style="font-weight:400">${cleanSym(sym)}</span>`} hint=${`${isCrypto(sym) ? 'Coinbase' : 'CNBC'} · ${statusTxt(q).toLowerCase() || 'loading'}`} onBack=${() => history.back()}
      right=${html`<button class=${`iconbtn ${als.some((x) => x.on) ? 'on' : ''}`} onClick=${() => go('alerts/' + encodeURIComponent(sym))} aria-label="Alerts"><${Icon} n="bell" size=${18} /></button>`} />
    <div class="row" style="gap:10px;align-items:baseline;margin:-6px 2px 12px;flex-wrap:wrap">
      <span class="ticker">${q ? fmtPrice(q.last, sym) : '…'}</span>
      ${q && q.pct != null && html`<span class=${`delta ${q.pct >= 0 ? '' : 'down'}`}>${pctTxt(q.pct)} ${q.h24 ? '24h' : 'today'}</span>`}
      ${stale && html`<span class="tag watch">price ${Math.round((Date.now() - q.at) / 60000)} min old</span>`}
    </div>
    ${q && q.ext && q.status !== 'REG_MKT' && html`<div class="hint" style="margin:-6px 2px 10px">${q.ext.type === 'PRE_MKT' ? 'Pre-market' : 'After hours'}: <b class="mono">${fmtPrice(q.ext.last, sym)}</b> <span class=${q.ext.pct >= 0 ? 'up' : 'down'}>${pctTxt(q.ext.pct)}</span></div>`}

    <${ChartCard} sym=${sym} livePrice=${q && q.last} alerts=${als} onAlertMove=${(id, field, price) => { updateAlert(id, { [field]: price, firedAt: null }); toast('Alert moved to ' + fmtPrice(price, sym), 'bell'); }} />
    ${isCrypto(sym) && html`<div class="card"><div class="row between" style="margin-bottom:8px"><span class="label">Market depth</span><span class="hint">±2% of price</span></div><${Depth} sym=${sym} /></div>
      <div class="stat3" style="margin-bottom:12px"><div><div class="l">24h high</div><div class="v">${q ? fmtPrice(q.hi, sym) : '–'}</div></div><div><div class="l">24h low</div><div class="v">${q ? fmtPrice(q.lo, sym) : '–'}</div></div><div><div class="l">Fear / Greed</div><div class=${`v ${fg ? (fg.v >= 55 ? 'gold' : fg.v <= 45 ? 'down' : '') : ''}`}>${fg ? `${fg.v} ${fg.label.split(' ').pop()}` : '–'}</div></div></div>`}

    <${SignalPanel} sym=${sym} an=${an} canTrade=${!!inst} onTrade=${(side) => setSheet({ trade: side })} onAlert=${() => setSheet('alert')} />

    ${als.length > 0 && html`<div class="sect"><span class="h-title">Your alerts</span><button class="more" onClick=${() => go('alerts/' + encodeURIComponent(sym))}>Manage</button></div>
      ${als.map((al) => html`<div class="alrow"><span class="cdot" style=${{ background: KINDS[al.kind].color }}></span><div class="grow"><div class="t1">${describe(al)}</div><div class="t2">${al.on ? 'active' : 'off'}</div></div></div>`)}`}

    ${t.connected && inst === null && !isCrypto(sym) && !sym.startsWith('.') && html`<div class="note" style="margin:0 4px 12px">Trading 212 doesn't offer this listing through its API. Watching only.</div>`}

    ${pos && html`<div class="card">
      <span class="label">Your position</span>
      <div class="kv" style="margin-top:10px">
        <span>Shares</span><span>${num(pos.quantity, 4)}</span>
        <span>Average price</span><span>${fmtPrice(pos.averagePricePaid, sym)}</span>
        <span>Value</span><span>${money(pos.walletImpact.currentValue, pos.walletImpact.currency)}</span>
        <span>Profit / loss</span><span class=${pos.walletImpact.unrealizedProfitLoss >= 0 ? 'up' : 'down'}>${pos.walletImpact.unrealizedProfitLoss >= 0 ? '+' : ''}${money(pos.walletImpact.unrealizedProfitLoss, pos.walletImpact.currency)} (${pctTxt(pos.walletImpact.totalCost ? (pos.walletImpact.unrealizedProfitLoss / pos.walletImpact.totalCost) * 100 : null, 1)})</span>
      </div>
    </div>`}

    ${q && !isCrypto(sym) && (q.mcap || q.pe || q.hi52) && html`<div class="card"><span class="label">Key numbers</span><div class="kv" style="margin-top:10px">
      ${q.mcap && html`<span>Company value</span><span>$${q.mcap}</span>`}
      ${q.pe && html`<span>P/E (price ÷ yearly profit)</span><span>${num(q.pe, 1)}</span>`}
      ${q.eps && html`<span>Profit per share (yearly)</span><span>$${num(q.eps, 2)}</span>`}
      ${q.divYield && html`<span>Dividend yield</span><span>${q.divYield}</span>`}
      ${q.hi52 && html`<span>1-year range</span><span>${fmtPrice(q.lo52, sym)} to ${fmtPrice(q.hi52, sym)}</span>`}
      ${q.vol && html`<span>Volume today</span><span>${q.vol}</span>`}
    </div></div>`}

    <div class="btns">
      ${inList ? html`<button class="btn" onClick=${unwatch}>Remove from watchlist</button>` : html`<button class="btn holo" onClick=${() => { addWatch({ sym, name: nameOf(sym) }); feedback('set'); toast('Added to watchlist'); }}>Add to watchlist</button>`}
      <a class="btn" href=${`https://news.google.com/search?q=${encodeURIComponent((isCrypto(sym) ? nameOf(sym) + ' crypto' : nameOf(sym) + ' stock'))}&hl=en`} target="_blank" rel="noopener">Latest news</a>
    </div>
    ${sheet === 'alert' && html`<${AlertSheet} sym=${sym} onClose=${() => setSheet(null)} />`}
    ${sheet && sheet.trade && html`<${TradeSheet} sym=${sym} side=${sheet.trade} inst=${inst} q=${q} pos=${pos} an=${an.res} onClose=${() => setSheet(null)} />`}
  </div>`;
}

function OldAlertSheet({ sym, price, onClose }) {
  const s = useStore();
  const cur = s.markets.alerts[sym] || {};
  const [above, setAbove] = useState(cur.above ? String(cur.above) : '');
  const [below, setBelow] = useState(cur.below ? String(cur.below) : '');
  const nice = (v) => +(v >= 100 ? v.toFixed(0) : v >= 1 ? v.toFixed(2) : v.toPrecision(3));
  return html`<${Sheet} title=${`Alert: ${nameOf(sym)}`} onClose=${onClose}>${(close) => html`
    <div class="hint" style="margin:0 2px 12px">Now ${fmtPrice(price, sym)}. You get a notification when the price crosses a level, even with the app closed (Android every ~15 min, iPhone every ~10 min).</div>
    <${Field} label="Tell me when it rises above"><${NumInput} value=${above} onInput=${setAbove} placeholder=${price ? String(nice(price * 1.05)) : ''} />
      ${price && html`<div class="chips" style="margin-top:8px">${[3, 5, 10, 20].map((d) => html`<button class="chip" onClick=${() => setAbove(String(nice(price * (1 + d / 100))))}>+${d}%</button>`)}</div>`}<//>
    <${Field} label="Tell me when it falls below"><${NumInput} value=${below} onInput=${setBelow} placeholder=${price ? String(nice(price * 0.95)) : ''} />
      ${price && html`<div class="chips" style="margin-top:8px">${[3, 5, 10, 20].map((d) => html`<button class="chip" onClick=${() => setBelow(String(nice(price * (1 - d / 100))))}>−${d}%</button>`)}</div>`}<//>
    <div class="btns">
      ${(cur.above || cur.below) && html`<button class="btn danger" onClick=${() => { setAlert(sym, null); toast('Alert removed'); close(); }}>Remove</button>`}
      <button class="btn primary grow" onClick=${() => { const a = { above: parseNum(above) > 0 ? parseNum(above) : null, below: parseNum(below) > 0 ? parseNum(below) : null }; setAlert(sym, a); if (!s.markets.list.some((x) => x.sym === sym)) addWatch({ sym, name: nameOf(sym) }); toast(a.above || a.below ? 'Alert saved' : 'Alert removed'); close(); }}>Save</button>
    </div>
    ${!s.settings.alertsSetup && html`<div class="note warn" style="margin-top:10px">Turn on notifications first: Gold → bell → Turn on notifications.</div>`}
  `}<//>`;
}

// ================= trade =================
function TradeSheet({ sym, side: side0, inst, q, pos, onClose }) {
  const s = useStore();
  const t = useT212();
  const [side, setSide] = useState(side0);
  const [type, setType] = useState('MARKET');
  const [mode, setMode] = useState('amount'); // amount | shares
  const [val, setVal] = useState('');
  const px0 = q ? (q.ext && q.status !== 'REG_MKT' ? q.ext.last : q.last) : null;
  const [limit, setLimit] = useState(px0 ? String(px0) : '');
  const [stop, setStop] = useState(px0 ? String(px0) : '');
  const [validity, setValidity] = useState('DAY');
  const [ext, setExt] = useState(false);
  const [step, setStep] = useState('form'); // form | review | sending | done
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);
  const acct = (pf.sum && pf.sum.currency) || 'PLN';
  const nowPx = q ? (q.ext && q.status !== 'REG_MKT' ? q.ext.last : q.last) : NaN; // pre/after-hours price when the main session is closed
  const price = type === 'LIMIT' ? parseNum(limit) : type === 'STOP' ? parseNum(stop) : nowPx;
  const instCur = (inst && inst.currency) || 'USD';
  const fx = acct === instCur ? 1 : acct === 'PLN' ? (s.rates[instCur === 'GBX' ? 'GBP' : instCur] || 0) * (instCur === 'GBX' ? 0.01 : 1) : 0; // account currency per 1 unit of the stock's currency
  const v = parseNum(val);
  const shares = mode === 'shares' ? v : fx && price ? v / (price * fx) : NaN;
  const qty = Number.isFinite(shares) ? Math.floor(shares * 1e4) / 1e4 : NaN;
  const estCost = Number.isFinite(qty) && price && fx ? qty * price * fx : null;
  const avail = pos ? pos.quantityAvailableForTrading ?? pos.quantity : 0;
  const cash = pf.sum ? pf.sum.cash.availableToTrade : null;
  const problems = [];
  if (!(qty > 0)) problems.push('Enter how much');
  if (side === 'SELL' && qty > avail + 1e-9) problems.push(`You have ${num(avail, 4)} shares available to sell`);
  if (side === 'BUY' && cash != null && estCost != null && estCost > cash * 1.0) problems.push(`Estimated cost ${money(estCost, acct)} is more than your cash ${money(cash, acct)}`);
  if (type !== 'MARKET' && !(price > 0)) problems.push('Enter a price');
  const live = t.env === 'live';
  const send = async () => {
    setStep('sending'); setErr(null);
    try {
      const r = await placeOrder({ type, side, ticker: inst.ticker, quantity: qty, limitPrice: limit, stopPrice: stop, timeValidity: validity, extendedHours: ext });
      setResult(r); setStep('done'); refreshPortfolio(true);
    } catch (e) { setErr(e.message); setStep('review'); }
  };
  const typeName = { MARKET: 'Market (now)', LIMIT: 'Limit (at my price or better)', STOP: 'Stop (when price reaches)' }[type];
  return html`<${Sheet} title=${`${side === 'BUY' ? 'Buy' : 'Sell'} ${cleanSym(sym)}`} onClose=${onClose}>${(close) => html`
    <div class=${`envbar ${live ? 'live' : ''}`}>${live ? 'REAL MONEY · Trading 212' : 'PRACTICE account · no real money'}</div>
    ${step === 'form' && html`
      <div style="margin-bottom:12px"><${Seg} options=${[['BUY', 'Buy'], ['SELL', 'Sell']]} value=${side} onChange=${setSide} /></div>
      <${Field} label="Order type"><${Seg} options=${[['MARKET', 'Market'], ['LIMIT', 'Limit'], ['STOP', 'Stop']]} value=${type} onChange=${setType} />
        <div class="hint" style="margin:6px 2px">${type === 'MARKET' ? 'Fills right away at the best available price.' : type === 'LIMIT' ? (side === 'BUY' ? 'Buys only at your price or LOWER.' : 'Sells only at your price or HIGHER.') : (side === 'BUY' ? 'Buys once the price RISES to your level.' : 'Sells once the price FALLS to your level (stop-loss).')}</div><//>
      ${type === 'LIMIT' && html`<${Field} label=${`Limit price (${instCur})`}><${NumInput} value=${limit} onInput=${setLimit} /><//>`}
      ${type === 'STOP' && html`<${Field} label=${`Stop price (${instCur})`}><${NumInput} value=${stop} onInput=${setStop} /><//>`}
      <${Field} label=${mode === 'amount' ? `Amount (${acct})` : 'Number of shares'}>
        <div style="margin-bottom:8px"><${Seg} options=${[['amount', `In ${acct === 'PLN' ? 'zł' : acct}`], ['shares', 'In shares']]} value=${mode} onChange=${(m) => { setMode(m); setVal(''); }} /></div>
        <${NumInput} value=${val} onInput=${setVal} placeholder=${mode === 'amount' ? '500' : '1'} autofocus />
        <div class="chips" style="margin-top:8px">
          ${side === 'SELL' && avail > 0 ? html`<button class="chip" onClick=${() => { setMode('shares'); setVal(String(avail)); }}>Sell all (${num(avail, 4)})</button><button class="chip" onClick=${() => { setMode('shares'); setVal(String(Math.floor(avail * 5e3) / 1e4)); }}>Half</button>`
            : mode === 'amount' ? [100, 250, 500, 1000].map((x) => html`<button class="chip" onClick=${() => setVal(String(x))}>${x}</button>`) : ''}
        </div>
      <//>
      ${type !== 'MARKET' && html`<${Field} label="Valid"><${Seg} options=${[['DAY', 'Today only'], ['GOOD_TILL_CANCEL', 'Until cancelled']]} value=${validity} onChange=${setValidity} /><//>`}
      ${type === 'MARKET' && inst.extendedHours && html`<${SettingRow} title="Allow pre-market / after hours" hint="Otherwise it waits for the regular session"><${Switch} on=${ext} onChange=${setExt} /><//>`}
      <div class="card" style="padding:12px"><div class="kv">
        <span>Price now${q && q.ext && q.status !== 'REG_MKT' ? (q.ext.type === 'PRE_MKT' ? ' (pre-market)' : ' (after hours)') : ''}</span><span>${q ? fmtPrice(nowPx, sym) : '—'}</span>
        <span>Shares</span><span>${Number.isFinite(qty) ? num(qty, 4) : '—'}</span>
        <span>Estimated ${side === 'BUY' ? 'cost' : 'you get'}</span><span>${estCost != null ? '≈ ' + money(estCost, acct) : '—'}</span>
        ${cash != null && html`<span>Cash to trade</span><span>${money(cash, acct)}</span>`}
      </div>${instCur !== acct && html`<div class="hint" style="margin-top:6px">Trading 212 converts ${acct} → ${instCur} and charges a small FX fee (about 0.15%).</div>`}</div>
      ${problems.length > 0 && val && html`<div class="note warn">${problems[0]}</div>`}
      <button class="btn primary block" disabled=${problems.length > 0} onClick=${() => setStep('review')}>Review order</button>
    `}
    ${(step === 'review' || step === 'sending') && html`
      <div class="card"><div class="kv">
        <span>Action</span><span class=${side === 'BUY' ? 'up' : 'down'}>${side === 'BUY' ? 'BUY' : 'SELL'} ${num(qty, 4)} × ${cleanSym(sym)}</span>
        <span>Instrument</span><span>${inst.name}</span>
        <span>Type</span><span>${typeName}</span>
        ${type === 'LIMIT' && html`<span>Limit price</span><span>${fmtPrice(+limit, sym)}</span>`}
        ${type === 'STOP' && html`<span>Stop price</span><span>${fmtPrice(+stop, sym)}</span>`}
        ${type !== 'MARKET' && html`<span>Valid</span><span>${validity === 'DAY' ? 'Today only' : 'Until cancelled'}</span>`}
        <span>Estimated total</span><span>≈ ${money(estCost, acct)}</span>
      </div></div>
      ${type === 'MARKET' && q && !q.open && !ext && html`<div class="note warn" style="margin-bottom:10px">The market is closed now, so this order will fill when it opens, at the opening price (which can be different).</div>`}
      ${err && html`<div class="callout bad" style="margin-bottom:10px">${err}</div>`}
      <div class="btns">
        <button class="btn" disabled=${step === 'sending'} onClick=${() => setStep('form')}>Back</button>
        <button class=${`btn grow ${live ? 'danger-fill' : 'primary'}`} disabled=${step === 'sending'} onClick=${send}>${step === 'sending' ? 'Sending…' : `${live ? 'Place REAL order' : 'Place practice order'}`}</button>
      </div>
    `}
    ${step === 'done' && html`
      <div class="empty"><span class="e up"><${Icon} n="up" size=${34} /></span><b>Order sent</b><div class="hint" style="margin-top:6px">Status: ${result && result.status ? result.status.replace(/_/g, ' ').toLowerCase() : 'sent'}${result && result.id ? ` · #${result.id}` : ''}</div></div>
      <div class="btns"><button class="btn grow" onClick=${() => { close(); setTimeout(() => go('portfolio'), 350); }}>See portfolio</button><button class="btn primary grow" onClick=${close}>Done</button></div>
    `}
  `}<//>`;
}

// ================= portfolio =================
export function Portfolio() {
  const t = useT212();
  const p = usePortfolio(8000);
  const a = useAssetsLive((p.pos || []).map((x) => tickerToSym(x.instrument.ticker)).filter((x) => x && !/[a-z]/.test(x)));
  const [hist, setHist] = useState(null);
  useEffect(() => { if (t.connected) orderHistory(20).then((r) => setHist(r.items || [])).catch(() => setHist([])); }, [t.connected, t.env]);
  if (!t.connected) return html`<div class="screen"><${Back} title="Portfolio" onBack=${() => history.back()} /><div class="card"><b>Not connected</b><div class="hint" style="margin:6px 0 10px">Connect Trading 212 to see your portfolio.</div><button class="btn primary" onClick=${() => go('broker')}>Connect</button></div></div>`;
  const cur = p.sum ? p.sum.currency : 'PLN';
  const posList = [...(p.pos || [])].sort((x, y) => y.walletImpact.currentValue - x.walletImpact.currentValue);
  return html`<div class="screen">
    <${Back} title="Portfolio" hint=${`Trading 212 · ${t.env === 'live' ? 'Real money' : 'Practice'}`} onBack=${() => history.back()} right=${html`<button class="iconbtn" onClick=${() => refreshPortfolio(true)} aria-label="Refresh"><${Icon} n="repeat" /></button>`} />
    ${p.err && html`<div class="callout bad" style="margin-bottom:12px">${p.err}</div>`}
    ${p.sum && html`<div class="card hero">
      <div class="label">Total value</div>
      <div class="big mono">${money(p.sum.totalValue, cur)}</div>
      <div class="kv" style="margin-top:10px">
        <span>Invested (cost)</span><span>${money(p.sum.investments.totalCost, cur)}</span>
        <span>Open profit / loss</span><span class=${p.sum.investments.unrealizedProfitLoss >= 0 ? 'up' : 'down'}>${p.sum.investments.unrealizedProfitLoss >= 0 ? '+' : ''}${money(p.sum.investments.unrealizedProfitLoss, cur)}</span>
        <span>Realised profit (all time)</span><span>${money(p.sum.investments.realizedProfitLoss, cur)}</span>
        <span>Cash to trade</span><span>${money(p.sum.cash.availableToTrade, cur)}</span>
        ${p.sum.cash.reservedForOrders > 0 && html`<span>Reserved for orders</span><span>${money(p.sum.cash.reservedForOrders, cur)}</span>`}
      </div>
    </div>`}
    <div class="sect"><span class="h-title">Holdings</span><span class="hint">${posList.length}</span></div>
    <div class="card" style="padding:2px 14px">${p.pos == null ? html`<div class="hint" style="padding:12px 0">Loading…</div>` : !posList.length ? html`<div class="empty">No shares yet.</div>` : posList.map((x) => {
      const sym = tickerToSym(x.instrument.ticker); const w = x.walletImpact; const pl = w.totalCost ? (w.unrealizedProfitLoss / w.totalCost) * 100 : 0;
      return html`<div class="item" onClick=${() => go('asset/' + encodeURIComponent(sym))}>
        <span class="em" style="font-weight:700;font-size:11px">${sym.slice(0, 4)}</span>
        <div class="grow"><div class="t1">${x.instrument.name}</div><div class="t2">${num(x.quantity, 4)} sh · avg ${num(x.averagePricePaid, 2)} ${x.instrument.currency}${a.q[sym] ? ` · today ${pctTxt(a.q[sym].pct)}` : ''}</div></div>
        <div style="text-align:right"><div class="mono" style="font-weight:650">${money(w.currentValue, w.currency)}</div><span class=${`chg ${pl >= 0 ? 'up' : 'down'}`}>${pctTxt(pl, 1)}</span></div>
      </div>`; })}</div>
    ${p.ord && p.ord.length > 0 && html`<div class="sect"><span class="h-title">Open orders</span></div>
      <div class="card" style="padding:2px 14px">${p.ord.map((o) => html`<div class="item">
        <div class="grow"><div class="t1">${o.side || (o.quantity > 0 ? 'BUY' : 'SELL')} ${num(Math.abs(o.quantity || 0), 4)} ${tickerToSym(o.ticker || (o.instrument && o.instrument.ticker))}</div>
          <div class="t2">${o.type}${o.limitPrice ? ' @ ' + o.limitPrice : ''}${o.stopPrice ? ' stop ' + o.stopPrice : ''} · ${(o.status || '').toLowerCase()}</div></div>
        <button class="btn sm danger" onClick=${async () => { if (!confirm('Cancel this order?')) return; try { await cancelOrder(o.id); toast('Cancel requested'); refreshPortfolio(true); } catch (e) { toast(e.message, '!', 6000); } }}>Cancel</button>
      </div>`)}</div>`}
    <div class="sect"><span class="h-title">Recent orders</span></div>
    <div class="card" style="padding:2px 14px">${hist == null ? html`<div class="hint" style="padding:12px 0">Loading…</div>` : !hist.length ? html`<div class="hint" style="padding:12px 0">No orders yet.</div>` : hist.map((h) => { const o = h.order || h; const f = h.fill || {}; return html`<div class="item">
      <div class="grow"><div class="t1">${o.side || ''} ${num(Math.abs(o.filledQuantity || o.quantity || 0), 4)} ${tickerToSym(o.ticker || (o.instrument && o.instrument.ticker))}</div>
        <div class="t2">${(o.type || '').toLowerCase()} · ${(o.status || '').toLowerCase()}${o.createdAt ? ' · ' + new Date(o.createdAt).toLocaleDateString() : ''}</div></div>
      <span class="mono">${f.price ? num(f.price, 2) : o.filledValue ? num(o.filledValue, 2) : ''}</span>
    </div>`; })}</div>
  </div>`;
}

// ================= connect Trading 212 =================
export function Broker() {
  const t = useT212();
  const [env, setE] = useState(t.env);
  const c = t.creds(env) || {};
  const [key, setKey] = useState(c.key || '');
  const [secret, setSecret] = useState(c.secret || '');
  const [relay, setR] = useState(t.relay);
  const [st, setSt] = useState(null);
  const test = async () => {
    setSt({ busy: true });
    if (!t.native && relay !== t.relay) setRelay(relay);
    try {
      const sum = await summary(env, { key: key.trim(), secret: secret.trim() });
      saveCreds(env, key, secret, true); setEnv(env);
      setSt({ ok: `Connected to account ${sum.id} (${sum.currency}). Total value ${money(sum.totalValue, sum.currency)}.` });
      refreshPortfolio(true);
    } catch (e) { setSt({ err: e.message }); }
  };
  const connected = (x) => { const k = t.creds(x); return !!(k && k.ok); };
  return html`<div class="screen">
    <${Back} title="Trading 212" hint="Connect your account" onBack=${() => history.back()} />
    <div class="card">
      <b>Account</b>
      <div style="margin:10px 0"><${Seg} options=${[['demo', 'Practice'], ['live', 'Real money']]} value=${env} onChange=${(e) => { setE(e); const k = t.creds(e) || {}; setKey(k.key || ''); setSecret(k.secret || ''); setSt(null); }} /></div>
      <div class="hint">${env === 'demo' ? 'Start here: practice with fake money first to check everything works.' : 'Orders will use your REAL money.'}</div>
      ${connected('demo') || connected('live') ? html`<div class="chips" style="margin-top:10px">${['demo', 'live'].filter(connected).map((x) => html`<button class=${`chip ${t.env === x ? 'on' : ''}`} onClick=${() => { setEnv(x); toast(`Using ${x === 'live' ? 'Real money' : 'Practice'}`); }}>Use ${x === 'live' ? 'Real' : 'Practice'}</button>`)}</div>` : ''}
    </div>
    <div class="card">
      <b>1. Create an API key in Trading 212</b>
      <div class="gd-b" style="margin-top:6px">In the Trading 212 app: switch to <b>${env === 'demo' ? 'Practice' : 'Real'}</b> mode → <b>Settings</b> → <b>API (Beta)</b> → <b>Generate API key</b>.<br/>Turn ON these permissions: Account data, Portfolio, Orders (read + execute), Metadata, History (orders).<br/>Leave the IP restriction OFF (phone networks change their address).<br/>Copy the <b>API key</b> and the <b>secret</b> (the secret is shown only once).</div>
    </div>
    <div class="card">
      <b>2. Paste them here</b>
      <${Field} label="API key"><input class="input mono" value=${key} onInput=${(e) => setKey(e.target.value)} autocomplete="off" autocapitalize="off" spellcheck="false" /><//>
      <${Field} label="API secret"><input class="input mono" type="password" value=${secret} onInput=${(e) => setSecret(e.target.value)} autocomplete="off" autocapitalize="off" spellcheck="false" /><//>
      ${!t.native && html`<${Field} label="iPhone relay address"><input class="input mono" value=${relay} onInput=${(e) => setR(e.target.value)} placeholder="https://creampie-relay.<name>.workers.dev" autocapitalize="off" spellcheck="false" />
        <div class="hint" style="margin:4px 2px">iPhone only. Trading 212 blocks browser apps, so requests go through your own free Cloudflare relay. It passes them on and stores nothing.</div><//>`}
      <button class="btn primary block" disabled=${!key.trim() || !secret.trim() || (st && st.busy) || (!t.native && !relay.trim())} onClick=${test}>${st && st.busy ? 'Checking…' : 'Connect & test'}</button>
      ${st && st.ok && html`<div class="callout good" style="margin-top:10px">${st.ok}</div>`}
      ${st && st.err && html`<div class="callout bad" style="margin-top:10px">${st.err}</div>`}
    </div>
    ${connected(env) && html`<button class="btn danger block" onClick=${() => { if (confirm('Remove this key from the phone?')) { forget(env); setKey(''); setSecret(''); setSt(null); toast('Key removed'); } }}>Disconnect ${env === 'live' ? 'Real' : 'Practice'}</button>`}
    <div class="note" style="margin:12px 4px">Your key is saved only on this phone (not in backups, not online). Trading 212's API can't withdraw money; anyone with the key could only trade. If your phone is lost, delete the key in Trading 212 → Settings → API. Lock this app with a PIN in Settings.</div>
  </div>`;
}
