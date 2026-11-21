// Wealth tab and investing tools: portfolio across brokers (Trading 212 live + manual / CSV for
// Robinhood, XTB and others), benchmark, risk check and rebalancing, dividends, Polish tax
// (PIT-38) or UAE, financial freedom, DCA plan, what-if, trade journal, fee tracker.
import { useState, useEffect, useMemo } from 'preact/hooks';
import { html, Back, Sheet, Field, NumInput, Seg, Switch, toast, SettingRow, Money, Donut, Bar } from './ui.js';
import { Icon } from './icons.js';
import { useStore, get, set, patch, monthStats, toPln, cashTotal } from './store.js';
import { useLive, priceNow, useHistory } from './gold.js';
import { fullNetWorth, holdingsValue, nwSeries } from './networth.js';
import { useAssetsLive, A, nameOf, fmtPrice, search, isCrypto } from './assets.js';
import { HoloCard, Spark } from './holo.js';
import { SeriesChart } from './chart.js';
import { candles, getJSON } from './data.js';
import { T212, T212C, orderHistory, dividendHistory } from './t212.js';
import { useMarket, mkt } from './market.js';
import { money, num, uid, today, thisYm, prevYm, parseNum, convert, DISP, addDays } from './util.js';
import { feedback } from './fx.js';
import { STYLES } from './advisor.js';

const go = (r) => { location.hash = '#/' + r; };
const pctS = (x, d = 1) => (x == null || !Number.isFinite(x) ? '–' : `${x >= 0 ? '+' : '−'}${Math.abs(x).toFixed(d)}%`);
const HOLO_PAL = ['#00D2FF', '#FFE36E', '#7A5CFF', '#FF3CC8', '#3CFFB4', '#9DF6FF', '#FF8F5C', '#A794FF'];

// asset class of a holding
const classOf = (sym) => (isCrypto(sym) ? 'Crypto' : /^(GLD|IAU|SGLN|PHAU|IGLN|4GLD)/.test(sym) || sym === '@GC.1' ? 'Gold' : /^(US\d+Y|TLT|IEF|AGG|BND|IBTA|VGOV)/.test(sym) ? 'Bonds' : 'Stocks and ETFs');

export function allocation(s, p) {
  const nw = fullNetWorth(s, p);
  const by = { Cash: Math.max(0, nw.cash), Gold: nw.gold, 'Stocks and ETFs': 0, Crypto: 0, Bonds: 0 };
  for (const h of s.holdings || []) { const q = A.q[h.sym]; const px = q && q.last != null ? q.last : h.lastPx; if (px == null) continue; by[classOf(h.sym)] += toPln(s, h.qty * px, h.cur || 'USD'); }
  if (T212C.pos && T212C.sum) {
    for (const x of T212C.pos) by['Stocks and ETFs'] += toPln(s, x.walletImpact ? x.walletImpact.currentValue : (x.quantity * x.currentPrice || 0), (x.walletImpact && x.walletImpact.currency) || T212C.sum.currency);
    by.Cash += toPln(s, T212C.sum.cash ? T212C.sum.cash.availableToTrade || 0 : 0, T212C.sum.currency);
  }
  return { by, nw };
}

// ================= Wealth tab =================
export function WealthTab() {
  const s = useStore();
  useAssetsLive((s.holdings || []).map((h) => h.sym));
  const lv = useLive(); const p = lv.price || priceNow();
  const { by, nw } = allocation(s, p);
  const parts = Object.entries(by).filter(([, v]) => v > 0.5).map(([label, v], i) => ({ label, v, color: HOLO_PAL[i % HOLO_PAL.length] }));
  const total = parts.reduce((a, x) => a + x.v, 0) || 1;
  return html`<div class="screen stagger">
    <div class="top"><div class="grow"><div class="h-title">Wealth</div><div class="hint">Everything you own, owe and invest</div></div>
      <button class="iconbtn" onClick=${() => go('networth')} aria-label="Net worth history"><${Icon} n="chart" size=${18} /></button></div>
    <${HoloCard} onClick=${() => go('networth')}>
      <span class="label">Net worth</span>
      <div class="nw-big" style="font-size:36px"><${Money} v=${nw.total} cls="num" /></div>
      <div class="row" style="margin-top:14px;gap:16px">
        <${Donut} data=${parts.length ? parts : [{ v: 1, color: 'rgba(255,255,255,.1)' }]} size=${104} />
        <div class="legend grow">${parts.map((x) => html`<div class="li"><i class="sw" style=${{ background: x.color, boxShadow: `0 0 8px ${x.color}` }}></i><span class="grow">${x.label}</span><span class="mono" style="font-size:12px">${Math.round((x.v / total) * 100)}%</span></div>`)}
          ${nw.card > 0 && html`<div class="li"><i class="sw" style="background:var(--down)"></i><span class="grow">Card debt</span><${Money} v=${-nw.card} d=${0} cls="down" /></div>`}</div>
      </div>
    <//>
    <div class="tiles">
      <${T} ic="pie" tone="acc" nm="Portfolio" val=${html`<${Money} v=${nw.invest} d=${0} />`} sub=${`${(s.holdings || []).length} holdings${T212.connected ? ' + Trading 212' : ''}`} r="portfolio" />
      <${T} ic="wallet" nm="Accounts" val=${html`<${Money} v=${nw.cash} d=${0} />`} sub=${`${s.accounts.length} places`} r="accounts" />
      <${T} ic="coin" tone="gold" nm="Gold" val=${html`<${Money} v=${nw.gold} d=${0} />`} sub="live value" r="gold" />
      <${T} ic="card" tone="mag" nm="Credit card" val=${html`<${Money} v=${-nw.card} d=${0} />`} sub="owed" r="card" />
      <${T} ic="users" nm="Friends" val=${html`<${Money} v=${nw.fOwedMe - nw.fIOwe} d=${0} />`} sub="net owed to you" r="friends" />
      <${T} ic="target" tone="mint" nm="Goals" val=${`${s.goals.length}`} sub="savings goals" r="goals" />
    </div>
    <div class="sect"><span class="h-title">Tools</span></div>
    <div class="tiles four">${[['scale', 'Benchmark', 'benchmark'], ['shield', 'Risk check', 'riskcheck'], ['drop', 'Dividends', 'dividends'], ['calc', s.settings.tax === 'AE' ? 'Tax (UAE)' : 'Polish tax', 'tax'], ['target', 'Freedom', 'freedom'], ['repeat', 'DCA plan', 'dca'], ['zap', 'What if', 'whatif'], ['book', 'Journal', 'journal'], ['receipt', 'Fees', 'fees'], ['candle', 'Practice', 'practice'], ['lock', 'Risk guard', 'guard'], ['moon', 'Zakat', 'zakat']].map(([ic, nm, r]) => html`<button class="tile" onClick=${() => go(r)}><div class="ic"><${Icon} n=${ic} size=${18} /></div><div class="nm">${nm}</div></button>`)}</div>
  </div>`;
}
function T({ ic, nm, val, sub, r, tone }) {
  return html`<button class="tile" onClick=${() => go(r)}><div class=${`ic ${tone || ''}`}><${Icon} n=${ic} size=${18} /></div><div><div class="nm">${nm}</div><div class="val">${val}</div><div class="hint" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${sub}</div></div></button>`;
}

// ================= Portfolio across brokers =================
export function PortfolioHub() {
  const s = useStore();
  const a = useAssetsLive((s.holdings || []).map((h) => h.sym));
  const [sheet, setSheet] = useState(null);
  const hs = s.holdings || [];
  const brokers = [...new Set(hs.map((h) => h.broker || 'Other'))];
  const hv = holdingsValue(s);
  return html`<div class="screen stagger">
    <${Back} title="Portfolio" hint="Trading 212, Robinhood, XTB and others" onBack=${() => history.back()} right=${html`<button class="iconbtn" onClick=${() => setSheet({ add: true })} aria-label="Add holding"><${Icon} n="plus" size=${18} /></button>`} />
    <div class="card tap" onClick=${() => go(T212.connected ? 't212' : 'broker')}>
      <div class="row"><span class="tile-ic-lg acc"><${Icon} n="swap" size=${20} /></span><div class="grow"><b style="font-weight:600">Trading 212 ${T212.connected ? (T212.env === 'live' ? '· LIVE' : '· Practice') : ''}</b>
        <div class="hint">${T212.connected ? (T212C.sum ? `Value ${money(T212C.sum.totalValue, T212C.sum.currency)}` : 'Open to load the portfolio') : 'Connect to see positions and trade'}</div></div><${Icon} n="chevron" size=${16} cls="ice" /></div>
    </div>
    <div class="card hero"><span class="label">Other brokers and wallets</span><div class="big"><${Money} v=${hv.v} /></div>
      <div class="hint">${hv.cost ? html`Cost <${Money} v=${hv.cost} d=${0} /> · <span class=${hv.v >= hv.cost ? 'up' : 'down'}>${pctS(((hv.v - hv.cost) / hv.cost) * 100)}</span>` : 'Add holdings by hand or import a CSV export'}${hv.missing ? ` · ${hv.missing} without a price` : ''}</div></div>
    ${brokers.map((b) => html`<div class="sect"><span class="h-title">${b}</span></div><div class="card" style="padding:4px 14px">${hs.filter((h) => (h.broker || 'Other') === b).map((h) => { const q = a.q[h.sym]; const px = q ? q.last : h.lastPx; const val = px != null ? h.qty * px : null; const pl = px != null && h.cost ? ((px - h.cost) / h.cost) * 100 : null;
      return html`<button class="item" onClick=${() => setSheet({ edit: h })}><span class="em sym">${(nameOf(h.sym) || h.sym).slice(0, 4).toUpperCase()}</span><div class="grow"><div class="t1">${h.name || nameOf(h.sym)}</div><div class="t2">${num(h.qty, h.qty < 10 ? 4 : 2)} × ${px != null ? fmtPrice(px, h.sym) : 'no price'}${q && q.pct != null ? ` · today ${pctS(q.pct)}` : ''}</div></div>
        <div style="text-align:right"><div class="amt">${val != null ? html`<${Money} v=${toPln(s, val, h.cur || 'USD')} d=${0} />` : '–'}</div>${pl != null && html`<span class=${`chg ${pl >= 0 ? 'up' : 'down'}`}>${pctS(pl)}</span>`}</div></button>`; })}</div>`)}
    <div class="btns" style="margin-top:6px"><button class="btn holo" onClick=${() => setSheet({ add: true })}><${Icon} n="plus" size=${17} /> Add holding</button><button class="btn" onClick=${() => setSheet({ csv: true })}><${Icon} n="upload" size=${17} /> Import CSV</button></div>
    <div class="note" style="margin:12px 4px">Robinhood and XTB have no API we can use, so their holdings are entered by hand or imported from their CSV export. Prices update live.</div>
    ${sheet && (sheet.add || sheet.edit) && html`<${HoldingSheet} h=${sheet.edit} onClose=${() => setSheet(null)} />`}
    ${sheet && sheet.csv && html`<${CsvSheet} onClose=${() => setSheet(null)} />`}
  </div>`;
}
function HoldingSheet({ h, onClose }) {
  const [sym, setSym] = useState(h ? h.sym : ''); const [name, setName] = useState(h ? h.name : '');
  const [q, setQ] = useState(''); const [res, setRes] = useState(null);
  const [broker, setBroker] = useState(h ? h.broker : 'Robinhood');
  const [qty, setQty] = useState(h ? String(h.qty) : ''); const [cost, setCost] = useState(h && h.cost ? String(h.cost) : '');
  const [cur, setCur] = useState(h ? h.cur || 'USD' : 'USD');
  const ok = sym && parseNum(qty) > 0;
  const save = (close) => { const x = { id: h ? h.id : uid(), sym, name: name || nameOf(sym), broker, qty: parseNum(qty), cost: parseNum(cost) || 0, cur };
    set((s) => ({ ...s, holdings: h ? s.holdings.map((y) => (y.id === h.id ? x : y)) : [...(s.holdings || []), x] })); feedback('set'); toast(h ? 'Holding updated' : 'Holding added'); close(); };
  return html`<${Sheet} title=${h ? 'Edit holding' : 'Add holding'} onClose=${onClose}>${(close) => html`
    <${Field} label="Broker"><div class="chips">${['Robinhood', 'XTB', 'Trading 212 (manual)', 'Crypto wallet', 'Bank', 'Other'].map((b) => html`<button class=${`chip ${broker === b ? 'on' : ''}`} onClick=${() => setBroker(b)}>${b}</button>`)}</div><//>
    <${Field} label="Asset">${sym ? html`<div class="row between"><b style="font-weight:500">${name || nameOf(sym)} <span class="mute mono" style="font-size:12px">${sym}</span></b><button class="btn sm" onClick=${() => setSym('')}>Change</button></div>`
      : html`<input class="input" placeholder="Search stock, ETF or coin" value=${q} onInput=${(e) => { setQ(e.target.value); const t = e.target.value; clearTimeout(HoldingSheet.t); HoldingSheet.t = setTimeout(() => t.trim() ? search(t).then(setRes) : setRes(null), 300); }} />
        ${res && res.slice(0, 6).map((r) => html`<button class="item" onClick=${() => { setSym(r.sym); setName(r.name); setCur(r.kind === 'Crypto' ? 'USD' : 'USD'); setRes(null); }}><div class="grow"><div class="t1">${r.name}</div><div class="t2">${r.sym} · ${r.kind} · ${r.where}</div></div></button>`)}`}<//>
    <div class="grid2"><${Field} label="Quantity"><${NumInput} value=${qty} onInput=${setQty} /><//><${Field} label="Average cost each"><${NumInput} value=${cost} onInput=${setCost} /><//></div>
    <${Field} label="Price currency"><${Seg} options=${['USD', 'EUR', 'GBP', 'PLN'].map((c) => [c, c])} value=${cur} onChange=${setCur} /><//>
    <div class="btns">${h && html`<button class="btn danger" onClick=${() => { set((s) => ({ ...s, holdings: s.holdings.filter((y) => y.id !== h.id) })); toast('Holding removed'); close(); }}>Delete</button>`}<button class="btn holo grow" disabled=${!ok} onClick=${() => save(close)}>Save</button></div>`}<//>`;
}
// CSV: finds columns for symbol, quantity, average cost and currency by their header names
export function parseHoldingsCsv(txt) {
  const lines = txt.replace(/\r/g, '').split('\n').filter((l) => l.trim());
  if (lines.length < 2) return [];
  const sep = (lines[0].match(/;/g) || []).length > (lines[0].match(/,/g) || []).length ? ';' : ',';
  const split = (l) => { const out = []; let cur = '', qt = false; for (const ch of l) { if (ch === '"') qt = !qt; else if (ch === sep && !qt) { out.push(cur); cur = ''; } else cur += ch; } out.push(cur); return out.map((x) => x.trim()); };
  const head = split(lines[0]).map((h) => h.toLowerCase());
  const col = (...names) => head.findIndex((h) => names.some((n) => h === n || h.includes(n)));
  const cs = col('symbol', 'ticker', 'instrument'), cq = col('quantity', 'shares', 'volume', 'qty', 'amount'), cc = col('average cost', 'avg cost', 'average price', 'open price', 'cost basis per', 'price'), ccur = col('currency');
  if (cs < 0 || cq < 0) return [];
  return lines.slice(1).map(split).map((r) => ({ sym: (r[cs] || '').toUpperCase().replace(/\.US$/, '').replace(/\.PL$/, ''), qty: parseNum((r[cq] || '').replace(/\s/g, '')), cost: cc >= 0 ? parseNum((r[cc] || '').replace(/[$€£\s]/g, '')) : 0, cur: ccur >= 0 && /^[A-Z]{3}$/.test(r[ccur]) ? r[ccur] : 'USD' })).filter((x) => x.sym && x.qty > 0);
}
function CsvSheet({ onClose }) {
  const [rows, setRows] = useState(null); const [broker, setBroker] = useState('Robinhood');
  const pick = (e) => { const f = e.target.files && e.target.files[0]; if (!f) return; f.text().then((t) => { const r = parseHoldingsCsv(t); setRows(r); if (!r.length) toast('No holdings found in that file', '!'); }); e.target.value = ''; };
  return html`<${Sheet} title="Import holdings (CSV)" onClose=${onClose}>${(close) => html`
    <div class="note" style="margin-bottom:12px">Export your positions as CSV from Robinhood, XTB (Open positions export) or any spreadsheet with columns for symbol, quantity and average price. Existing holdings from the same broker are replaced.</div>
    <${Field} label="Broker"><div class="chips">${['Robinhood', 'XTB', 'Other'].map((b) => html`<button class=${`chip ${broker === b ? 'on' : ''}`} onClick=${() => setBroker(b)}>${b}</button>`)}</div><//>
    <label class="btn block"><${Icon} n="upload" size=${17} /> Choose CSV file<input type="file" accept=".csv,text/csv" style="display:none" onChange=${pick} /></label>
    ${rows && rows.length > 0 && html`<div class="card" style="margin-top:12px;padding:4px 14px">${rows.slice(0, 30).map((r) => html`<div class="item"><div class="grow"><div class="t1">${r.sym}</div><div class="t2">${r.qty} × ${r.cost || '?'} ${r.cur}</div></div></div>`)}</div>
      <button class="btn holo block" onClick=${() => { set((s) => ({ ...s, holdings: [...(s.holdings || []).filter((h) => h.broker !== broker), ...rows.map((r) => ({ id: uid(), broker, name: r.sym, ...r }))] })); toast(`${rows.length} holdings imported`); close(); }}>Import ${rows.length} holdings</button>`}`}<//>`;
}

// ================= Benchmark =================
export function Benchmark() {
  const s = useStore(); useMarket();
  const hist = useHistory(); const [range, setRange] = useState(365);
  const [bars, setBars] = useState({});
  useEffect(() => { for (const sym of ['.SPX', '@GC.1']) candles(sym, '5Y').then((b) => setBars((x) => ({ ...x, [sym]: b }))).catch(() => {}); }, []);
  const mine = useMemo(() => nwSeries(s, hist, range), [hist.length, range, s.txns.length]);
  const norm = (pts) => { const f = pts.find((p) => p[1] > 0); return f ? pts.map(([t, v]) => [t, (v / f[1]) * 100]) : []; };
  const start = Date.now() - range * 864e5;
  const ser = (sym) => norm((bars[sym] || []).filter((b) => b.time * 1000 >= start).map((b) => [b.time * 1000, b.close]));
  const cpi = mkt.cpi && mkt.cpi.series ? (() => { const y = mkt.cpi.yoy / 100; return [[start, 100], [Date.now(), 100 * Math.pow(1 + y, range / 365)]]; })() : null;
  const m = norm(mine.filter((p) => p[1] !== 0));
  const last = (x) => (x && x.length ? x.at(-1)[1] - 100 : null);
  return html`<div class="screen stagger">
    <${Back} title="Benchmark" hint="Your money vs the S&P 500, gold and inflation" onBack=${() => history.back()} />
    <div class="card"><${Seg} options=${[[90, '3 months'], [182, '6 months'], [365, '1 year'], [730, '2 years']]} value=${range} onChange=${setRange} /></div>
    <div class="card chartbox"><${SeriesChart} data=${m} height=${240} fmt=${(v) => v.toFixed(1)} baseline=${100} extra=${[{ name: 'S&P 500', color: '#FF3CC8', data: ser('.SPX') }, { name: 'Gold', color: '#FFE36E', data: ser('@GC.1') }, ...(cpi ? [{ name: 'Inflation', color: '#A794FF', data: cpi }] : [])]} /></div>
    <div class="stat3"><div><div class="l">You</div><div class=${`v ${last(m) >= 0 ? 'up' : 'down'}`}>${pctS(last(m))}</div></div><div><div class="l">S&P 500</div><div class="v">${pctS(last(ser('.SPX')))}</div></div><div><div class="l">Gold ($)</div><div class="v">${pctS(last(ser('@GC.1')))}</div></div></div>
    <div class="note" style="margin:12px 4px">Your line is net worth, so it includes saving and spending, not only investment returns. Inflation line uses the latest US yearly inflation (${mkt.cpi ? mkt.cpi.yoy.toFixed(1) + '%' : 'loading'}). All start at 100.</div>
  </div>`;
}

// ================= Risk check and rebalancing =================
const TARGETS = { careful: { Cash: 35, Gold: 20, 'Stocks and ETFs': 40, Crypto: 0, Bonds: 5 }, balanced: { Cash: 20, Gold: 15, 'Stocks and ETFs': 55, Crypto: 7, Bonds: 3 }, aggressive: { Cash: 10, Gold: 10, 'Stocks and ETFs': 65, Crypto: 15, Bonds: 0 } };
export function RiskCheck() {
  const s = useStore(); useAssetsLive((s.holdings || []).map((h) => h.sym));
  const lv = useLive(); const p = lv.price || priceNow();
  const { by } = allocation(s, p);
  const total = Object.values(by).reduce((a, b) => a + b, 0);
  const tgt = TARGETS[s.settings.risk] || TARGETS.balanced;
  const rows = Object.keys(tgt).map((k) => { const cur = total ? (by[k] / total) * 100 : 0; const diff = tgt[k] - cur; return { k, cur, tgt: tgt[k], diff, amt: (diff / 100) * total }; });
  const biggest = [...(s.holdings || [])].map((h) => { const q = A.q[h.sym]; const v = q ? toPln(s, h.qty * q.last, h.cur || 'USD') : 0; return { h, v }; }).sort((a, b) => b.v - a.v)[0];
  const warns = [];
  if (biggest && total && biggest.v / total > 0.2) warns.push(`${biggest.h.name || biggest.h.sym} is ${Math.round((biggest.v / total) * 100)}% of everything you own. One company or coin above 20% is a big single bet.`);
  if (total && by.Crypto / total > 0.25) warns.push(`Crypto is ${Math.round((by.Crypto / total) * 100)}%. It can fall 70% or more in a bad year.`);
  if (s.card.on && s.card.limit && fullNetWorth(s, p).card > s.card.limit * 0.5) warns.push('Your credit card is over half used. Paying it off is a guaranteed "return" before investing more.');
  return html`<div class="screen stagger">
    <${Back} title="Risk check" hint=${`Rebalancing for a ${(STYLES[s.settings.risk] || STYLES.balanced).name.toLowerCase()} style`} onBack=${() => history.back()} />
    ${warns.map((w) => html`<div class="callout bad" style="margin-bottom:8px">${w}</div>`)}
    ${!warns.length && html`<div class="callout good" style="margin-bottom:12px">No concentration warnings.</div>`}
    <div class="card">${rows.map((r) => html`<div style="padding:8px 0">
      <div class="row between" style="font-size:14px"><span>${r.k}</span><span class="mono" style="font-size:12px">${r.cur.toFixed(0)}% <span class="mute">target ${r.tgt}%</span></span></div>
      <div class="bar" style="margin:6px 0 4px;position:relative"><i style=${{ width: Math.min(100, r.cur) + '%' }}></i><span style=${{ position: 'absolute', top: '-3px', bottom: '-3px', left: r.tgt + '%', width: '2px', background: '#fff' }}></span></div>
      ${Math.abs(r.diff) >= 3 && html`<div class="hint">${r.diff > 0 ? 'Add about' : 'Reduce by about'} <b style="color:var(--text)">${money(Math.abs(r.amt), 'PLN', 0)}</b></div>`}</div>`)}</div>
    <div class="note" style="margin:8px 4px">Targets follow your risk style (Settings). They are a common starting point, not a rule. Rebalancing once or twice a year, or when a part drifts 5+ points, keeps risk steady.</div>
  </div>`;
}

// ================= Dividends =================
export function Dividends() {
  const s = useStore(); const syms = (s.holdings || []).map((h) => h.sym);
  const a = useAssetsLive(syms);
  const [hist, setHist] = useState(null);
  useEffect(() => { if (T212.connected) dividendHistory(50).then((r) => setHist(r.items || [])).catch(() => setHist([])); }, []);
  const rows = (s.holdings || []).map((h) => { const q = a.q[h.sym]; const y = q && q.divYield ? parseFloat(String(q.divYield)) : null; const v = q ? h.qty * q.last : null; return { h, y, v, inc: y != null && v != null ? (v * y) / 100 : null }; }).filter((r) => r.y);
  const yearly = rows.reduce((t, r) => t + toPln(s, r.inc || 0, r.h.cur || 'USD'), 0);
  const recv = (hist || []).reduce((t, d) => t + (d.amount || 0), 0);
  return html`<div class="screen stagger">
    <${Back} title="Dividends" hint="Passive income from what you hold" onBack=${() => history.back()} />
    <div class="card hero"><span class="label">Expected per year</span><div class="big"><${Money} v=${yearly} /></div><div class="hint">about <${Money} v=${yearly / 12} /> a month, from current dividend yields</div></div>
    <div class="card" style="padding:4px 14px">${rows.length ? rows.map((r) => html`<div class="item"><div class="grow"><div class="t1">${r.h.name || r.h.sym}</div><div class="t2">yield ${r.y.toFixed(2)}%</div></div><span class="amt"><${Money} v=${toPln(s, r.inc, r.h.cur || 'USD')} /> / yr</span></div>`) : html`<div class="hint" style="padding:12px 0">No dividend payers among your other holdings${T212.connected ? '' : ' (connect Trading 212 for its dividends)'}.</div>`}</div>
    ${T212.connected && html`<div class="sect"><span class="h-title">Received at Trading 212</span></div><div class="card" style="padding:4px 14px">${hist == null ? html`<div class="hint" style="padding:12px 0">Loading…</div>` : !hist.length ? html`<div class="hint" style="padding:12px 0">None yet.</div>` : hist.slice(0, 20).map((d) => html`<div class="item"><div class="grow"><div class="t1">${d.ticker}</div><div class="t2">${(d.paidOn || '').slice(0, 10)}</div></div><span class="amt up">+${num(d.amount, 2)} ${T212C.sum ? T212C.sum.currency : ''}</span></div>`)}${hist && hist.length > 0 && html`<div class="hint" style="padding:8px 0">Total shown: ${num(recv, 2)}</div>`}</div>`}
    <div class="note" style="margin:12px 4px">Exact payment dates are not in the free data. Yields come from live quotes and change with the price. US dividends are taxed 15% at source with a W-8BEN form (Trading 212 files it for you).</div>
  </div>`;
}

// ================= Tax =================
const nbpCache = {};
async function nbpRates(cur, year) {
  const k = cur + year; if (nbpCache[k]) return nbpCache[k];
  const end = `${year}-12-31` > today() ? today() : `${year}-12-31`;
  const [a, b] = await Promise.all([getJSON(`https://api.nbp.pl/api/exchangerates/rates/a/${cur.toLowerCase()}/${year - 1}-12-01/${year}-06-30/?format=json`, 'nbp').catch(() => ({ rates: [] })), `${year}-07-01` <= end ? getJSON(`https://api.nbp.pl/api/exchangerates/rates/a/${cur.toLowerCase()}/${year}-07-01/${end}/?format=json`, 'nbp').catch(() => ({ rates: [] })) : { rates: [] }]);
  const list = [...a.rates, ...b.rates].map((r) => [r.effectiveDate, r.mid]);
  nbpCache[k] = list; return list;
}
// NBP rate from the last working day BEFORE the date (Polish tax rule)
const rateBefore = (list, d) => { let r = null; for (const [x, v] of list) { if (x < d) r = v; else break; } return r; };
export function Tax() {
  const s = useStore();
  const [year, setYear] = useState(new Date().getFullYear());
  const [res, setRes] = useState(null);
  const ae = s.settings.tax === 'AE';
  const run = async () => {
    setRes({ busy: true });
    try {
      let orders = [];
      if (T212.connected) { const r = await orderHistory(50, true); orders = (r.items || []).map((x) => x.order ? { ...x.order, fill: x.fill } : x); }
      const trades = [...orders.filter((o) => (o.status || '').toUpperCase() === 'FILLED' || o.filledQuantity).map((o) => ({ date: (o.fill && o.fill.filledAt || o.dateModified || o.createdAt || '').slice(0, 10), sym: o.ticker || (o.instrument && o.instrument.ticker), side: (o.side || (o.filledQuantity > 0 ? 'BUY' : 'SELL')).toUpperCase(), qty: Math.abs(o.filledQuantity || o.quantity || 0), px: (o.fill && o.fill.price) || o.fillPrice || o.filledValue / Math.abs(o.filledQuantity || 1), cur: (o.instrument && o.instrument.currency) || o.currency || 'USD' })),
        ...(s.journal || []).filter((j) => j.real && j.px && j.qty).map((j) => ({ date: j.date, sym: j.sym, side: j.side, qty: j.qty, px: j.px, cur: j.cur || 'USD' }))].filter((t) => t.date && t.qty > 0).sort((a, b) => a.date.localeCompare(b.date));
      const curs = [...new Set(trades.map((t) => t.cur).filter((c) => c !== 'PLN'))].map((c) => (c === 'GBX' ? 'GBP' : c));
      const rates = {}; for (const c of curs) { rates[c] = [...(await nbpRates(c, year - 1)), ...(await nbpRates(c, year))]; }
      const lots = {}; let rev = 0, cost = 0, missing = 0;
      for (const t of trades) {
        const c = t.cur === 'GBX' ? 'GBP' : t.cur; const fx = c === 'PLN' ? 1 : rateBefore(rates[c] || [], t.date); const k = (t.cur === 'GBX' ? 0.01 : 1);
        if (fx == null) { missing++; continue; }
        const plnPx = t.px * k * fx;
        if (t.side === 'BUY') (lots[t.sym] ||= []).push({ qty: t.qty, px: plnPx });
        else { let q = t.qty; let c0 = 0; const L = lots[t.sym] || []; while (q > 1e-9 && L.length) { const l = L[0]; const take = Math.min(q, l.qty); c0 += take * l.px; l.qty -= take; q -= take; if (l.qty <= 1e-9) L.shift(); }
          if (t.date.startsWith(String(year))) { rev += t.qty * plnPx; cost += c0; } }
      }
      setRes({ rev, cost, gain: rev - cost, tax: Math.max(0, rev - cost) * 0.19, n: trades.length, missing });
    } catch (e) { setRes({ err: e.message }); }
  };
  if (ae) return html`<div class="screen stagger"><${Back} title="Tax (UAE)" hint="Tax residency: United Arab Emirates" onBack=${() => history.back()} />
    <div class="card"><b>No personal income tax</b><div class="note" style="margin-top:8px">UAE residents pay no personal tax on capital gains or dividends. US dividends are still taxed 15% at source with a W-8BEN form. If you are also tax resident in Poland, switch the residency in Settings to see the PIT-38 estimate.</div></div></div>`;
  return html`<div class="screen stagger">
    <${Back} title="Polish tax" hint="19% capital gains tax (Belka), PIT-38" onBack=${() => history.back()} />
    <div class="card"><${Field} label="Tax year"><${Seg} options=${[new Date().getFullYear() - 1, new Date().getFullYear()].map((y) => [y, String(y)])} value=${year} onChange=${(y) => { setYear(y); setRes(null); }} /><//>
      <button class="btn holo block" onClick=${run} disabled=${res && res.busy}>${res && res.busy ? 'Calculating…' : 'Calculate from my trades'}</button>
      <div class="hint" style="margin-top:8px">Uses ${T212.connected ? 'your Trading 212 order history' : 'trades marked as real in your journal (connect Trading 212 for its history)'}. Each trade is converted to zł at the NBP rate from the working day before, as the tax office requires. First in, first out.</div></div>
    ${res && !res.busy && !res.err && html`<div class="card hero"><span class="label">PIT-38 estimate ${year}</span>
      <div class="kv" style="margin-top:12px"><span>Revenue (przychód)</span><span>${money(res.rev, 'PLN')}</span><span>Costs (koszty)</span><span>${money(res.cost, 'PLN')}</span><span class="total">${res.gain >= 0 ? 'Gain (dochód)' : 'Loss (strata)'}</span><span class=${`total ${res.gain >= 0 ? 'up' : 'down'}`}>${money(res.gain, 'PLN')}</span><span class="total">Tax 19%</span><span class="total">${money(res.tax, 'PLN', 0)}</span></div>
      <div class="hint" style="margin-top:8px">${res.n} trades read${res.missing ? `, ${res.missing} skipped (no NBP rate)` : ''}. A loss can be deducted from gains in the next 5 years (up to 50% of it per year). Fees can be added to costs.</div></div>`}
    ${res && res.err && html`<div class="callout bad">${res.err}</div>`}
    <div class="note" style="margin:12px 4px">An estimate to help you fill PIT-38 (due 30 April). Foreign dividends: Poland wants 19%; with 15% taken in the US you usually pay the 4% difference in PIT-38. Check with a tax adviser for your case.</div>
  </div>`;
}

// ================= Freedom number =================
export function Freedom() {
  const s = useStore(); const f = s.freedom || {};
  const lv = useLive(); const p = lv.price || priceNow();
  const ms = [1, 2, 3, 4, 5, 6].map((k) => { let ym = thisYm(); for (let i = 0; i < k; i++) ym = prevYm(ym); return monthStats(s, ym); }).filter((m) => m.spend || m.income);
  const avgSpend = ms.length ? ms.reduce((a, m) => a + m.spend, 0) / ms.length : 0;
  const avgSave = ms.length ? ms.reduce((a, m) => a + (m.income - m.spend), 0) / ms.length : 0;
  const spend = f.spend || avgSpend * 12; const rate = f.rate || 4; const ret = f.ret || 6; const monthly = f.monthly || Math.max(0, avgSave);
  const target = spend / (rate / 100);
  const now = Math.max(0, fullNetWorth(s, p).total);
  let v = now, yrs = 0; const pts = [[Date.now(), now]];
  while (v < target && yrs < 60) { for (let m = 0; m < 12; m++) v = v * (1 + ret / 100 / 12) + monthly; yrs++; pts.push([Date.now() + yrs * 365.25 * 864e5, v]); }
  const P = (o) => patch('freedom', o);
  return html`<div class="screen stagger">
    <${Back} title="Freedom number" hint="When your money could pay for your life" onBack=${() => history.back()} />
    <div class="holo"><div class="in"><div class="content"><span class="label">Your freedom number</span><div class="nw-big" style="font-size:34px"><${Money} v=${target} d=${0} /></div>
      <div class="hint" style="margin-top:8px">${v >= target ? `Reachable in about ${yrs} year${yrs === 1 ? '' : 's'} (around ${new Date().getFullYear() + yrs})` : 'Not reached within 60 years with these numbers'} · now ${Math.round((now / target) * 100)}% there</div>
      <div class="bar ok" style="margin-top:10px"><i style=${{ width: Math.min(100, (now / target) * 100) + '%' }}></i></div></div></div></div>
    <div class="card chartbox"><${SeriesChart} data=${pts} height=${200} fmt=${(x) => Math.round(convert(x, 'PLN') || x).toLocaleString('pl-PL')} baseline=${target} /></div>
    <div class="card">
      <${Field} label=${`Yearly spending (zł). Your last months suggest ${money(avgSpend * 12, 'PLN', 0)}`}><${NumInput} value=${f.spend ? String(f.spend) : ''} placeholder=${String(Math.round(avgSpend * 12))} onInput=${(x) => P({ spend: parseNum(x) || 0 })} /><//>
      <${Field} label=${`Saved per month (zł). Recent average ${money(avgSave, 'PLN', 0)}`}><${NumInput} value=${f.monthly ? String(f.monthly) : ''} placeholder=${String(Math.round(Math.max(0, avgSave)))} onInput=${(x) => P({ monthly: parseNum(x) || 0 })} /><//>
      <${Field} label="Yearly return after inflation"><${Seg} options=${[[3, '3%'], [4, '4%'], [5, '5%'], [6, '6%'], [7, '7%']]} value=${ret} onChange=${(x) => P({ ret: x })} /><//>
      <${Field} label="Safe withdrawal rate"><${Seg} options=${[[3, '3%'], [3.5, '3.5%'], [4, '4%']]} value=${rate} onChange=${(x) => P({ rate: x })} /><//>
    </div>
    <div class="note" style="margin:8px 4px">The "4% rule": a portfolio of about 25 times your yearly spending has historically lasted 30+ years. Lower rates are safer for longer retirements.</div>
  </div>`;
}

// ================= DCA plan =================
export function Dca() {
  const s = useStore(); const d = s.dca || {};
  const [sym, setSym] = useState(d.sym || 'VUAA-GB');
  const [res, setRes] = useState(null);
  useEffect(() => { setRes(null); candles(sym, '5Y').then((b) => {
    if (!b.length) return setRes({ err: true });
    const amt = d.amount || 500; let units = 0, paid = 0; let lastM = null;
    for (const x of b) { const m = new Date(x.time * 1000).getMonth(); if (m !== lastM) { units += amt / x.close; paid += amt; lastM = m; } }
    const lump = (paid / b[0].close) * b.at(-1).close;
    setRes({ paid, val: units * b.at(-1).close, lump, from: b[0].time, months: paid / amt });
  }).catch(() => setRes({ err: true })); }, [sym, d.amount]);
  const nextDay = (() => { const t = new Date(); const day = d.day || 10; const n = new Date(t.getFullYear(), t.getMonth() + (t.getDate() > day ? 1 : 0), day); return n; })();
  return html`<div class="screen stagger">
    <${Back} title="DCA plan" hint="Invest the same amount every month" onBack=${() => history.back()} />
    <div class="card">
      <${SettingRow} title="Payday reminder" hint=${`Notification on day ${d.day || 10} of each month: next ${nextDay.toLocaleDateString()}`}><${Switch} on=${!!d.on} onChange=${(v) => patch('dca', { on: v })} /><//>
      <div class="grid2"><${Field} label="Amount per month"><${NumInput} value=${d.amount ? String(d.amount) : ''} placeholder="500" onInput=${(x) => patch('dca', { amount: parseNum(x) || 0 })} /><//><${Field} label="Day of month"><${NumInput} value=${String(d.day || 10)} onInput=${(x) => patch('dca', { day: Math.min(28, Math.max(1, parseNum(x) || 10)) })} /><//></div>
      <${Field} label="What to buy"><div class="chips">${[['VUAA-GB', 'S&P 500 (VUAA)'], ['CSPX-GB', 'S&P 500 (CSPX)'], ['@GC.1', 'Gold'], ['BTC-USD', 'Bitcoin'], ...(s.markets.list || []).filter((w) => !['VUAA-GB', 'CSPX-GB', '@GC.1', 'BTC-USD'].includes(w.sym)).slice(0, 4).map((w) => [w.sym, w.name])].map(([k, n]) => html`<button class=${`chip ${sym === k ? 'on' : ''}`} onClick=${() => { setSym(k); patch('dca', { sym: k }); }}>${n}</button>`)}</div><//>
    </div>
    <div class="card"><span class="label">If you had done this for 5 years</span>${!res ? html`<div class="hint" style="margin-top:8px">Loading history…</div>` : res.err ? html`<div class="hint" style="margin-top:8px">History unavailable</div>` : html`
      <div class="kv" style="margin-top:12px"><span>Paid in (${Math.round(res.months)} months)</span><span>${num(res.paid, 0)}</span><span>Worth now</span><span class=${res.val >= res.paid ? 'up' : 'down'}>${num(res.val, 0)} (${pctS(((res.val - res.paid) / res.paid) * 100)})</span><span>All at once on day one</span><span>${num(res.lump, 0)}</span></div>
      <div class="hint" style="margin-top:8px">Amounts in the asset's own currency, real prices since ${new Date(res.from * 1000).toLocaleDateString()}, no fees.</div>`}</div>
    <div class="note" style="margin:8px 4px">Buying a fixed amount on a schedule takes emotion out of timing. In rising markets a lump sum usually wins; DCA wins when prices fall first.</div>
  </div>`;
}

// ================= What if =================
export function WhatIf() {
  const s = useStore();
  const [sym, setSym] = useState('@GC.1'); const [amt, setAmt] = useState('10000'); const [yrs, setYrs] = useState(5);
  const [r, setR] = useState(null);
  useEffect(() => { setR(null); candles(sym, yrs > 5 ? 'MAX' : '5Y').then((b) => { const t0 = Date.now() / 1000 - yrs * 365.25 * 86400; const f = b.find((x) => x.time >= t0) || b[0]; if (!f) return setR({ err: true }); const mult = b.at(-1).close / f.close; setR({ mult, from: f.time, cagr: (Math.pow(mult, 1 / Math.max(0.1, (b.at(-1).time - f.time) / 31557600)) - 1) * 100 }); }).catch(() => setR({ err: true })); }, [sym, yrs]);
  const a = parseNum(amt) || 0;
  return html`<div class="screen stagger">
    <${Back} title="What if" hint="If I had invested back then" onBack=${() => history.back()} />
    <div class="card">
      <${Field} label="Amount"><${NumInput} value=${amt} onInput=${setAmt} /><//>
      <${Field} label="In"><div class="chips">${[['@GC.1', 'Gold'], ['.SPX', 'S&P 500'], ['BTC-USD', 'Bitcoin'], ['.IXIC', 'Nasdaq'], ...(s.markets.list || []).filter((w) => !['@GC.1', 'BTC-USD'].includes(w.sym)).slice(0, 5).map((w) => [w.sym, w.name])].map(([k, n]) => html`<button class=${`chip ${sym === k ? 'on' : ''}`} onClick=${() => setSym(k)}>${n}</button>`)}</div><//>
      <${Field} label="Years ago"><${Seg} options=${[[1, '1'], [3, '3'], [5, '5'], [10, '10'], [20, '20']]} value=${yrs} onChange=${setYrs} /><//>
    </div>
    ${r && !r.err && html`<${HoloCard}><span class="label">${nameOf(sym)} since ${new Date(r.from * 1000).toLocaleDateString()}</span><div class="nw-big" style="font-size:34px">${num(a * r.mult, 0)}</div><div class="hint" style="margin-top:8px">${pctS((r.mult - 1) * 100, 0)} in total, ${pctS(r.cagr)} a year · same currency as the asset, before fees and tax</div><//>`}
    ${r && r.err && html`<div class="callout">Not enough history for that.</div>`}
    ${!r && html`<div class="card"><div class="hint">Loading…</div></div>`}
  </div>`;
}

// ================= Journal =================
export function Journal() {
  const s = useStore(); const [edit, setEdit] = useState(null);
  const js = [...(s.journal || [])].sort((a, b) => b.date.localeCompare(a.date));
  const closed = js.filter((j) => j.result != null && j.result !== '');
  const wins = closed.filter((j) => parseNum(j.result) > 0).length;
  return html`<div class="screen stagger">
    <${Back} title="Trade journal" hint="Why you bought or sold, and what happened" onBack=${() => history.back()} right=${html`<button class="iconbtn" onClick=${() => setEdit({})} aria-label="Add"><${Icon} n="plus" size=${18} /></button>`} />
    <div class="stat3"><div><div class="l">Entries</div><div class="v">${js.length}</div></div><div><div class="l">Closed</div><div class="v">${closed.length}</div></div><div><div class="l">Win rate</div><div class="v">${closed.length ? Math.round((wins / closed.length) * 100) + '%' : '–'}</div></div></div>
    <div class="card" style="padding:4px 14px;margin-top:12px">${js.length ? js.map((j) => html`<button class="item" onClick=${() => setEdit(j)}><span class=${`em ${j.side === 'SELL' ? 'down' : ''}`} style="font-size:10px;font-family:var(--mono)">${j.side}</span><div class="grow"><div class="t1">${nameOf(j.sym) || j.sym}${j.paper ? ' · practice' : ''}</div><div class="t2">${j.date} · ${num(j.qty || 0, 4)} @ ${j.px != null ? fmtPrice(j.px, j.sym) : '?'}${j.why ? ' · ' + j.why : ''}</div></div>${j.result !== undefined && j.result !== '' && html`<span class=${`chg ${parseNum(j.result) >= 0 ? 'up' : 'down'}`}>${j.result}%</span>`}</button>`) : html`<div class="empty">No entries yet. Practice and Trading 212 trades are added here automatically.</div>`}</div>
    ${edit && html`<${JournalSheet} j=${edit} onClose=${() => setEdit(null)} />`}
  </div>`;
}
function JournalSheet({ j, onClose }) {
  const [x, setX] = useState({ date: today(), side: 'BUY', ...j });
  const F = (k) => (v) => setX({ ...x, [k]: v });
  return html`<${Sheet} title=${j.id ? 'Journal entry' : 'New entry'} onClose=${onClose}>${(close) => html`
    <div class="grid2"><${Field} label="Symbol"><input class="input" value=${x.sym || ''} onInput=${(e) => F('sym')(e.target.value.toUpperCase())} /><//><${Field} label="Date"><input class="input" type="date" value=${x.date} onInput=${(e) => F('date')(e.target.value)} /><//></div>
    <${Field} label="Side"><${Seg} options=${[['BUY', 'Buy'], ['SELL', 'Sell']]} value=${x.side} onChange=${F('side')} /><//>
    <div class="grid2"><${Field} label="Quantity"><${NumInput} value=${x.qty != null ? String(x.qty) : ''} onInput=${(v) => F('qty')(parseNum(v))} /><//><${Field} label="Price"><${NumInput} value=${x.px != null ? String(x.px) : ''} onInput=${(v) => F('px')(parseNum(v))} /><//></div>
    <${Field} label="Why (your reason)"><input class="input" value=${x.why || ''} onInput=${(e) => F('why')(e.target.value)} placeholder="e.g. advisor Buy 72, breakout above 55-day high" /><//>
    <${Field} label="Result % (when closed)"><input class="input mono" value=${x.result || ''} onInput=${(e) => F('result')(e.target.value)} placeholder="+8.5" /><//>
    <${SettingRow} title="Real trade" hint="Counted in the tax estimate"><${Switch} on=${!!x.real} onChange=${F('real')} /><//>
    <div class="btns">${j.id && html`<button class="btn danger" onClick=${() => { set((s) => ({ ...s, journal: s.journal.filter((y) => y.id !== j.id) })); close(); }}>Delete</button>`}
      <button class="btn holo grow" disabled=${!x.sym} onClick=${() => { const e = { id: j.id || uid(), ...x }; set((s) => ({ ...s, journal: j.id ? s.journal.map((y) => (y.id === j.id ? e : y)) : [...(s.journal || []), e] })); feedback('set'); close(); }}>Save</button></div>`}<//>`;
}
export function addJournal(e) { set((s) => ({ ...s, journal: [...(s.journal || []), { id: uid(), date: today(), ...e }].slice(-2000) })); }

// ================= Fee tracker =================
export function Fees() {
  const s = useStore();
  const [h, setH] = useState(null);
  useEffect(() => { if (T212.connected) orderHistory(50, true).then((r) => setH(r.items || [])).catch((e) => setH({ err: e.message })); }, []);
  const acct = T212C.sum ? T212C.sum.currency : 'PLN'; const fee = (s.settings.fxFee ?? 0.15) / 100;
  const rows = Array.isArray(h) ? h.map((x) => x.order ? { ...x.order, fill: x.fill } : x).filter((o) => (o.status || '').toUpperCase() === 'FILLED' || o.filledQuantity) : [];
  const fx = rows.filter((o) => { const c = (o.instrument && o.instrument.currency) || o.currency; return c && c !== acct; });
  const val = (o) => Math.abs(o.filledValue || ((o.fill && o.fill.price) || o.fillPrice || 0) * Math.abs(o.filledQuantity || 0));
  const byYear = {}; for (const o of fx) { const y = (o.dateModified || o.createdAt || (o.fill && o.fill.filledAt) || '').slice(0, 4) || '?'; byYear[y] = (byYear[y] || 0) + val(o) * fee; }
  const total = Object.values(byYear).reduce((a, b) => a + b, 0);
  return html`<div class="screen stagger">
    <${Back} title="Fee tracker" hint="What trading costs you" onBack=${() => history.back()} />
    ${!T212.connected ? html`<div class="card"><div class="hint">Connect Trading 212 to read your order history.</div><button class="btn primary" style="margin-top:10px" onClick=${() => go('broker')}>Connect</button></div>`
      : h == null ? html`<div class="card"><div class="hint">Reading order history…</div></div>` : h.err ? html`<div class="callout bad">${h.err}</div>` : html`
      <div class="card hero"><span class="label">Estimated currency conversion fees</span><div class="big">${num(total, 2)} ${acct}</div><div class="hint">${fx.length} of ${rows.length} filled orders were in another currency than your ${acct} account, at ${(fee * 100).toFixed(2)}% each way</div></div>
      <div class="card">${Object.entries(byYear).sort().map(([y, v]) => html`<div class="row between" style="padding:6px 0"><span>${y}</span><span class="mono">${num(v, 2)} ${acct}</span></div>`)}${!Object.keys(byYear).length && html`<div class="hint">No conversion fees found.</div>`}</div>`}
    <div class="card"><span class="label">Ways to pay less</span><div class="gd-b" style="margin-top:8px">
      <b>Match the currency:</b> where an ETF is listed in your account currency (for example EUR-listed versions of S&P 500 ETFs like VUAA or CSPX on Xetra for a EUR account), buying that listing avoids the conversion.<br/>
      <b>Trade less often:</b> the fee is a percentage of every buy and every sell, so fewer, planned trades (DCA once a month) cost less than many small ones.<br/>
      <b>Hold longer:</b> each round trip pays the fee twice.<br/>
      Trading 212 charges no commission on shares; the conversion fee is the main cost. Change the rate in Settings if it changes.</div></div>
  </div>`;
}
