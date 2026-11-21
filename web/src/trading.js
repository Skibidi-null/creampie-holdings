// Practice (paper) trading with fake money at live prices, and the Risk guard screen.
import { useState, useEffect } from 'preact/hooks';
import { html, Back, Sheet, Field, NumInput, Seg, Switch, toast, SettingRow } from './ui.js';
import { Icon } from './icons.js';
import { useStore, get, set, patch } from './store.js';
import { useAssetsLive, A, nameOf, fmtPrice, search, tickBus } from './assets.js';
import { useAnalysis } from './advisor.js';
import { Gauge } from './holo.js';
import { ChartCard } from './chart.js';
import { feedback } from './fx.js';
import { num, uid, today, parseNum } from './util.js';
import { guardState, liveAllowed } from './guard.js';
import { T212, T212C } from './t212.js';
import { addJournal } from './invest.js';

const go = (r) => { location.hash = '#/' + r; };
const pctS = (x, d = 2) => (x == null || !Number.isFinite(x) ? '–' : `${x >= 0 ? '+' : '−'}${Math.abs(x).toFixed(d)}%`);
const usd = (v) => (v == null ? '–' : `${v < 0 ? '−' : ''}$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
// paper prices are in each asset's own quote currency; the practice account counts everything in USD
// (non-USD quotes are converted with live FX where available)
const toUsd = (sym, px) => { const q = A.q[sym]; const c = (q && q.cur) || 'USD'; if (c === 'USD' || /-USD$/.test(sym)) return px; const r = get().rates; return r[c] && r.USD ? (px * r[c]) / r.USD : px; };

export function paperValue(s = get()) {
  const P = s.paper; let v = P.cash, cost = 0;
  for (const p of P.pos) { const q = A.q[p.sym]; const px = q ? toUsd(p.sym, q.last) : p.avg; v += p.qty * px; cost += p.qty * p.avg; }
  return { v, cost, pl: v - P.start, plPct: ((v - P.start) / P.start) * 100 };
}
// pending practice limit/stop orders are checked on every price tick
tickBus.add(() => {
  const P = get().paper; if (!P || !(P.orders || []).length) return;
  for (const o of P.orders) {
    const q = A.q[o.sym]; if (!q || q.last == null) continue;
    const hit = o.type === 'LIMIT' ? (o.side === 'BUY' ? q.last <= o.px : q.last >= o.px) : (o.side === 'BUY' ? q.last >= o.px : q.last <= o.px);
    if (hit) { set((s) => ({ ...s, paper: { ...s.paper, orders: s.paper.orders.filter((x) => x.id !== o.id) } })); paperFill(o.sym, o.side, o.qty, q.last, o.type.toLowerCase()); toast(`Practice ${o.type.toLowerCase()} order filled: ${o.side.toLowerCase()} ${num(o.qty, 4)} ${nameOf(o.sym)}`); }
  }
});
export function paperFill(sym, side, qty, px, how = 'market') {
  const pxU = toUsd(sym, px);
  set((s) => {
    const P = { ...s.paper, pos: [...s.paper.pos], trades: [...s.paper.trades] };
    const i = P.pos.findIndex((p) => p.sym === sym);
    if (side === 'BUY') { const cost = qty * pxU; if (cost > P.cash + 1e-6) return s; P.cash -= cost; if (i >= 0) { const p = P.pos[i]; P.pos[i] = { ...p, qty: p.qty + qty, avg: (p.avg * p.qty + cost) / (p.qty + qty) }; } else P.pos.push({ sym, qty, avg: pxU }); }
    else { if (i < 0 || P.pos[i].qty < qty - 1e-9) return s; const p = P.pos[i]; P.cash += qty * pxU; P.trades.push({ id: uid(), sym, side, qty, px: pxU, t: Date.now(), pl: (pxU - p.avg) * qty, how }); if (p.qty - qty <= 1e-9) P.pos.splice(i, 1); else P.pos[i] = { ...p, qty: p.qty - qty }; return { ...s, paper: P }; }
    P.trades.push({ id: uid(), sym, side, qty, px: pxU, t: Date.now(), how });
    return { ...s, paper: { ...P, trades: P.trades.slice(-500) } };
  });
  feedback(side === 'BUY' ? 'buy' : 'sell');
  addJournal({ sym, side, qty, px, paper: true, why: `Practice ${how} order` });
}

export function Practice({ arg }) {
  const s = useStore(); const P = s.paper;
  const pre = arg ? decodeURIComponent(arg) : null;
  const a = useAssetsLive([...P.pos.map((p) => p.sym), ...(pre ? [pre] : [])]);
  const [sheet, setSheet] = useState(pre ? { sym: pre } : null);
  const pv = paperValue(s);
  const gs = guardState();
  return html`<div class="screen stagger">
    <${Back} title="Practice trading" hint="Fake money, real live prices" onBack=${() => history.back()} right=${html`<button class="iconbtn" onClick=${() => setSheet({})} aria-label="New trade"><${Icon} n="plus" size=${18} /></button>`} />
    <div class="holo practice"><div class="in"><div class="content">
      <div class="row between"><span class="label">Practice account</span><span class="tag watch">NOT REAL MONEY</span></div>
      <div class="nw-big" style="font-size:36px">${usd(pv.v)}</div>
      <div class="row" style="gap:8px;margin-top:10px"><span class=${`delta ${pv.pl >= 0 ? '' : 'down'}`}>${pv.pl >= 0 ? '▲' : '▼'} ${usd(Math.abs(pv.pl))} · ${pctS(pv.plPct)}</span><span class="hint">since start</span></div>
      <div class="hint" style="margin-top:8px">Cash ${usd(P.cash)} · ${P.pos.length} positions · ${P.trades.length} trades</div>
    </div></div></div>
    <div class="sect"><span class="h-title">Positions</span></div>
    <div class="card" style="padding:4px 14px">${P.pos.length ? P.pos.map((p) => { const q = a.q[p.sym]; const px = q ? toUsd(p.sym, q.last) : null; const pl = px != null ? ((px - p.avg) / p.avg) * 100 : null;
      return html`<button class="item" onClick=${() => setSheet({ sym: p.sym, side: 'SELL' })}><span class="em sym">${nameOf(p.sym).slice(0, 4).toUpperCase()}</span><div class="grow"><div class="t1">${nameOf(p.sym)}</div><div class="t2">${num(p.qty, 4)} × avg ${usd(p.avg)}</div></div><div style="text-align:right"><div class="amt">${px != null ? usd(px * p.qty) : '–'}</div><span class=${`chg ${pl >= 0 ? 'up' : 'down'}`}>${pctS(pl)}</span></div></button>`; }) : html`<div class="empty">No positions. Tap + to make a practice trade.</div>`}</div>
    ${(P.orders || []).length > 0 && html`<div class="sect"><span class="h-title">Waiting orders</span></div><div class="card" style="padding:4px 14px">${P.orders.map((o) => html`<div class="item"><div class="grow"><div class="t1">${o.side} ${num(o.qty, 4)} ${nameOf(o.sym)}</div><div class="t2">${o.type.toLowerCase()} at ${fmtPrice(o.px, o.sym)}</div></div><button class="btn sm danger" onClick=${() => set((x) => ({ ...x, paper: { ...x.paper, orders: x.paper.orders.filter((y) => y.id !== o.id) } }))}>Cancel</button></div>`)}</div>`}
    ${P.trades.length > 0 && html`<div class="sect"><span class="h-title">History</span></div><div class="card" style="padding:4px 14px">${[...P.trades].reverse().slice(0, 15).map((t) => html`<div class="item"><span class=${`chg ${t.side === 'BUY' ? 'up' : 'down'}`}>${t.side}</span><div class="grow"><div class="t1">${nameOf(t.sym)}</div><div class="t2">${num(t.qty, 4)} @ ${usd(t.px)} · ${new Date(t.t).toLocaleString()}</div></div>${t.pl != null && html`<span class=${`mono ${t.pl >= 0 ? 'up' : 'down'}`}>${usd(t.pl)}</span>`}</div>`)}</div>`}
    <div class="btns" style="margin-top:10px"><button class="btn holo" onClick=${() => setSheet({})}><${Icon} n="plus" size=${17} /> New practice trade</button>
      <button class="btn" onClick=${() => { if (confirm('Reset the practice account to $100,000 and clear its history?')) { set((x) => ({ ...x, paper: { cash: 100000, cur: 'USD', start: 100000, pos: [], trades: [], orders: [] } })); toast('Practice account reset'); } }}>Reset</button></div>
    <div class="note" style="margin:12px 4px">Practise any stock, ETF, index, crypto, gold or currency with live prices. Fills at the live price without spread or fees, so real results will be a little worse. ${gs.locked ? 'Your risk guard lock does not apply to practice.' : ''}</div>
    ${sheet && html`<${PaperSheet} sym0=${sheet.sym} side0=${sheet.side} onClose=${() => { setSheet(null); if (pre) history.replaceState(null, '', '#/practice'); }} />`}
  </div>`;
}

function PaperSheet({ sym0, side0, onClose }) {
  const s = useStore();
  const [sym, setSym] = useState(sym0 || null);
  const [q, setQ] = useState(''); const [res, setRes] = useState(null);
  const a = useAssetsLive(sym ? [sym] : []);
  const an = useAnalysis(sym || '');
  const [side, setSide] = useState(side0 || 'BUY');
  const [type, setType] = useState('MARKET');
  const [amt, setAmt] = useState(''); const [lim, setLim] = useState('');
  const quote = sym ? a.q[sym] : null; const px = quote ? quote.last : null;
  const pxU = px != null ? toUsd(sym, px) : null;
  const pos = s.paper.pos.find((p) => p.sym === sym);
  const usdAmt = parseNum(amt); const qty = pxU ? usdAmt / pxU : 0;
  const ok = sym && px != null && qty > 0 && (side === 'BUY' ? usdAmt <= s.paper.cash : pos && qty <= pos.qty + 1e-9) && (type === 'MARKET' || parseNum(lim) > 0);
  return html`<${Sheet} title="Practice trade" onClose=${onClose}>${(close) => html`
    <div class="envbar">PRACTICE · fake money</div>
    ${!sym ? html`<input class="input" placeholder="Search stock, ETF, coin, gold" value=${q} onInput=${(e) => { setQ(e.target.value); const t = e.target.value; clearTimeout(PaperSheet.t); PaperSheet.t = setTimeout(() => t.trim() ? search(t).then(setRes) : setRes(null), 300); }} />
      <div class="chips" style="margin-top:8px">${(s.markets.list || []).map((w) => html`<button class="chip" onClick=${() => setSym(w.sym)}>${w.name}</button>`)}</div>
      ${res && res.slice(0, 6).map((r) => html`<button class="item" onClick=${() => setSym(r.sym)}><div class="grow"><div class="t1">${r.name}</div><div class="t2">${r.sym} · ${r.kind}</div></div></button>`)}`
    : html`
      <div class="row" style="gap:12px;margin-bottom:12px"><${Gauge} score=${an.res && an.res.sym === sym ? an.res.score : null} size=${56} stroke=${5} /><div class="grow"><b style="font-weight:600">${nameOf(sym)}</b><div class="hint">${px != null ? fmtPrice(px, sym) : 'loading price'}${an.res && an.res.score != null ? ` · advisor ${an.res.verdict.label}` : ''}</div></div><button class="btn sm" onClick=${() => setSym(null)}>Change</button></div>
      <${Seg} options=${[['BUY', 'Buy'], ['SELL', 'Sell']]} value=${side} onChange=${setSide} />
      <div style="margin:12px 0"><${Seg} options=${[['MARKET', 'Market'], ['LIMIT', 'Limit'], ['STOP', 'Stop']]} value=${type} onChange=${setType} /></div>
      ${type !== 'MARKET' && html`<${Field} label=${`${type === 'LIMIT' ? 'Limit' : 'Stop'} price`}><${NumInput} value=${lim} onInput=${setLim} placeholder=${px != null ? String(px) : ''} /><//>`}
      <${Field} label="Amount (USD)"><${NumInput} value=${amt} onInput=${setAmt} placeholder="1000" autofocus />
        <div class="chips" style="margin-top:8px">${side === 'BUY' ? [500, 1000, 5000, 10000].map((x) => html`<button class="chip mono" onClick=${() => setAmt(String(x))}>$${x.toLocaleString('en-US')}</button>`) : pos && html`<button class="chip" onClick=${() => setAmt(String((pos.qty * pxU).toFixed(2)))}>All (${num(pos.qty, 4)})</button>`}</div><//>
      <div class="kv" style="margin-bottom:12px"><span>Units</span><span>${qty ? num(qty, 6) : '–'}</span><span>Practice cash</span><span>${usd(s.paper.cash)}</span></div>
      <button class=${`btn block big ${side === 'BUY' ? 'buy' : 'sell'}`} disabled=${!ok} onClick=${() => {
        if (type === 'MARKET') { paperFill(sym, side, qty, px); toast(`Practice ${side === 'BUY' ? 'buy' : 'sell'} filled`); }
        else { set((x) => ({ ...x, paper: { ...x.paper, orders: [...(x.paper.orders || []), { id: uid(), sym, side, qty, type, px: parseNum(lim), t: Date.now() }] } })); feedback('set'); toast('Practice order waiting for its price'); }
        close(); }}>${side === 'BUY' ? 'Buy' : 'Sell'} (practice)</button>`}`}<//>`;
}

export function Guard() {
  const s = useStore(); const g = s.guard || {};
  const gs = guardState();
  const cur = gs.cur || 'PLN';
  return html`<div class="screen stagger">
    <${Back} title="Risk guard" hint="A daily loss limit that locks new buys" onBack=${() => history.back()} />
    <div class=${`card ${gs.locked ? 'lockcard' : ''}`}>
      <div class="row between"><span class="label">Today</span><span class=${`tag ${gs.locked ? 'down' : g.on ? 'up' : 'watch'}`}>${gs.locked ? 'LOCKED until tomorrow' : g.on ? 'Watching' : 'Off'}</span></div>
      <div class="big-num" style="margin-top:8px">${gs.loss == null ? '–' : `${gs.loss > 0 ? '−' : '+'}${num(Math.abs(gs.loss), 2)} ${cur}`}</div>
      <div class="hint">${gs.loss == null ? (T212.connected ? 'Open Markets once today to start tracking the day' : 'Connect Trading 212 to track your real account') : 'Change of your Trading 212 account value since your first visit today'}</div>
      ${g.on && g.dailyLoss > 0 && gs.loss != null && html`<div class="bar hot" style="margin-top:10px"><i style=${{ width: Math.min(100, Math.max(0, (gs.loss / g.dailyLoss) * 100)) + '%' }}></i></div>`}
    </div>
    <div class="card">
      <${SettingRow} title="Risk guard on" hint="Required before Real money trading can be used"><${Switch} on=${!!g.on} onChange=${(v) => { patch('guard', { on: v }); feedback(v ? 'set' : 'tap'); }} /><//>
      <${Field} label=${`Daily loss limit (${cur})`}><${NumInput} value=${g.dailyLoss ? String(g.dailyLoss) : ''} placeholder="e.g. 200" onInput=${(v) => patch('guard', { dailyLoss: parseNum(v) || 0 })} /><//>
      ${T212C.sum && html`<div class="chips">${[0.5, 1, 2, 3].map((p) => html`<button class="chip" onClick=${() => patch('guard', { dailyLoss: Math.round(T212C.sum.totalValue * p) / 100 })}>${p}% of account</button>`)}</div>`}
      ${gs.locked && html`<button class="btn danger block" style="margin-top:12px" onClick=${() => { if (confirm('Unlock trading today? The limit is there to stop emotional trading after losses.')) patch('guard', { lockedDay: null, day: null }); }}>Unlock today (not recommended)</button>`}
    </div>
    <div class="note" style="margin:8px 4px">When today's loss reaches the limit, new buy orders are blocked for the rest of the day. Selling stays possible so you can reduce risk. ${liveAllowed() ? 'Real money trading is allowed.' : 'Real money trading stays off until the guard is on with a limit.'}</div>
  </div>`;
}
