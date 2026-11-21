// Research: screener (live quotes on a broad universe), earnings calendar, insider buying and
// superinvestor 13F moves (from macro.json, written by the online job), strategy backtester.
import { useState, useEffect, useMemo } from 'preact/hooks';
import { html, Back, Seg, Field, NumInput } from './ui.js';
import { Icon } from './icons.js';
import { useStore } from './store.js';
import { useAssetsLive, A, nameOf, fmtPrice } from './assets.js';
import { dailyLong, getJSON } from './data.js';
import { sma, rsi } from './ta.js';
import { prep, techScoreAt } from './score.js';
import { SeriesChart } from './chart.js';
import { feedback } from './fx.js';
import { parseNum } from './util.js';

const go = (r) => { location.hash = '#/' + r; };
const pctS = (x, d = 2) => (x == null || !Number.isFinite(x) ? '–' : `${x >= 0 ? '+' : '−'}${Math.abs(x).toFixed(d)}%`);

export const UNIVERSE = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META', 'TSLA', 'BRK.B', 'AVGO', 'LLY', 'JPM', 'V', 'MA', 'UNH', 'XOM', 'JNJ', 'WMT', 'PG', 'HD', 'COST', 'ORCL', 'NFLX', 'CVX', 'MRK', 'ABBV', 'KO', 'PEP', 'BAC', 'AMD', 'ADBE', 'CRM', 'TMO', 'MCD', 'CSCO', 'ACN', 'ABT', 'LIN', 'WFC', 'DIS', 'INTC', 'QCOM', 'TXN', 'IBM', 'GE', 'CAT', 'AMGN', 'PM', 'INTU', 'NOW', 'GS', 'MS', 'ISRG', 'UBER', 'BKNG', 'SPGI', 'BLK', 'HON', 'PFE', 'NKE', 'T', 'VZ', 'SBUX', 'PYPL', 'SHOP', 'PLTR', 'COIN', 'MSTR', 'ARM', 'ASML', 'TSM', 'BABA', 'SAP', 'NVO', 'SONY', 'TM',
  'SPY', 'QQQ', 'VOO', 'VTI', 'IWM', 'DIA', 'GLD', 'SLV', 'TLT', 'VNQ', 'XLE', 'XLK', 'SMH', 'ARKK', 'VUAA-GB', 'CSPX-GB', 'VUSA-GB', 'EQQQ-GB', 'IWDA-GB'];
const PRESETS = [
  ['all', 'All', (x) => true, (a, b) => (b.q.pct ?? -99) - (a.q.pct ?? -99)],
  ['low', 'Near 52-week low', (x) => x.pos != null && x.pos < 0.15, (a, b) => a.pos - b.pos],
  ['high', 'Near 52-week high', (x) => x.pos != null && x.pos > 0.9, (a, b) => b.pos - a.pos],
  ['cheap', 'Cheap (P/E under 15)', (x) => x.q.pe > 0 && x.q.pe < 15, (a, b) => a.q.pe - b.q.pe],
  ['div', 'High dividend', (x) => x.dy >= 2.5, (a, b) => b.dy - a.dy],
  ['fall', 'Biggest fallers today', (x) => x.q.pct < 0, (a, b) => a.q.pct - b.q.pct],
  ['rise', 'Biggest risers today', (x) => x.q.pct > 0, (a, b) => b.q.pct - a.q.pct],
];
export function Screener() {
  const a = useAssetsLive(UNIVERSE);
  const [p, setP] = useState('all');
  const rows = UNIVERSE.map((sym) => { const q = a.q[sym]; if (!q) return null; const pos = q.hi52 && q.lo52 && q.hi52 > q.lo52 ? (q.last - q.lo52) / (q.hi52 - q.lo52) : null; const dy = q.divYield ? parseFloat(q.divYield) : 0; return { sym, q, pos, dy }; }).filter(Boolean);
  const pr = PRESETS.find((x) => x[0] === p);
  const list = rows.filter(pr[2]).sort(pr[3]);
  return html`<div class="screen stagger">
    <${Back} title="Screener" hint=${`${rows.length} of ${UNIVERSE.length} big US stocks and popular ETFs, live`} onBack=${() => history.back()} />
    <div class="scrollx" style="margin-bottom:12px">${PRESETS.map(([k, n]) => html`<button class=${`chip ${p === k ? 'on' : ''}`} onClick=${() => { setP(k); feedback('tap'); }}>${n}</button>`)}</div>
    <div class="card" style="padding:4px 12px">
      <table class="table"><thead><tr><th>Name</th><th>Price</th><th>Today</th><th>${p === 'cheap' ? 'P/E' : p === 'div' ? 'Yield' : '52w'}</th></tr></thead>
      <tbody>${list.slice(0, 60).map((x) => html`<tr onClick=${() => go('asset/' + encodeURIComponent(x.sym))} style="cursor:pointer"><td><div style="font-weight:500">${x.sym.replace(/-GB$/, '')}</div><div class="hint" style="max-width:130px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${x.q.name || ''}</div></td>
        <td>${fmtPrice(x.q.last, x.sym)}</td><td class=${x.q.pct >= 0 ? 'up' : 'down'}>${pctS(x.q.pct)}</td>
        <td>${p === 'cheap' ? (x.q.pe ? x.q.pe.toFixed(1) : '–') : p === 'div' ? x.dy.toFixed(2) + '%' : x.pos != null ? html`<div class="bar" style="width:52px;display:inline-block"><i style=${{ width: x.pos * 100 + '%' }}></i></div>` : '–'}</td></tr>`)}</tbody></table>
      ${!list.length && html`<div class="hint" style="padding:14px 0">${rows.length ? 'Nothing matches right now.' : 'Loading live quotes…'}</div>`}
    </div>
    <div class="note" style="margin:10px 4px">Tap any row for its chart and full advisor score. Prices from CNBC.</div>
  </div>`;
}

// ---------- macro.json (earnings, insiders, 13F) ----------
let macroP = null;
export function loadMacro() { if (!macroP) macroP = getJSON('macro.json?t=' + Math.floor(Date.now() / 1800e3)).catch(() => { macroP = null; return null; }); return macroP; }
function useMacro() { const [m, setM] = useState(undefined); useEffect(() => { loadMacro().then((x) => setM(x || null)); }, []); return m; }
const capTxt = (c) => (c >= 1e12 ? `$${(c / 1e12).toFixed(2)}T` : `$${(c / 1e9).toFixed(0)}B`);

export function Earnings() {
  const s = useStore(); const m = useMacro();
  const mine = new Set([...(s.markets.list || []).map((w) => w.sym), ...(s.holdings || []).map((h) => h.sym)]);
  const [only, setOnly] = useState(false);
  const rows = ((m && m.earnings) || []).filter((r) => !only || mine.has(r.sym));
  const days = {}; for (const r of rows) (days[r.d] ||= []).push(r);
  return html`<div class="screen stagger">
    <${Back} title="Earnings" hint="US companies worth $10B+, next two weeks" onBack=${() => history.back()} />
    <div class="card"><${Seg} options=${[[false, 'All big companies'], [true, 'Only mine']]} value=${only} onChange=${setOnly} /></div>
    ${m === undefined ? html`<div class="card"><div class="hint">Loading…</div></div>` : !m ? html`<div class="callout">Earnings data is not published yet. It is refreshed by the online job every 6 hours.</div>` : html`
      ${Object.entries(days).map(([d, rs]) => html`<div class="cal-day">${new Date(d + 'T12:00:00').toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' })}</div>
        <div class="card" style="padding:4px 14px">${rs.sort((a, b) => b.cap - a.cap).map((r) => html`<button class="item" onClick=${() => go('asset/' + encodeURIComponent(r.sym))}><span class="em sym">${r.sym.slice(0, 4)}</span><div class="grow"><div class="t1">${r.name}${mine.has(r.sym) ? html` <span class="tag info">yours</span>` : ''}</div><div class="t2">${capTxt(r.cap)} · ${r.time || 'time not set'}</div></div>
          <div style="text-align:right"><div class="mono" style="font-size:12px">EPS est ${r.eps || '–'}</div><div class="hint mono" style="font-size:11px">last year ${r.lastEps || '–'}</div></div></button>`)}</div>`)}
      ${!rows.length && html`<div class="card"><div class="hint">${only ? 'None of your assets report in the next two weeks.' : 'No big US earnings found.'}</div></div>`}
      <div class="note" style="margin:10px 4px">From the Nasdaq earnings calendar, updated ${new Date(m.at).toLocaleString()}. Stocks often move 5 to 10% on results day.</div>`}
  </div>`;
}

export function Insiders() {
  const m = useMacro(); const [tab, setTab] = useState('ins');
  return html`<div class="screen stagger">
    <${Back} title="Insiders and big investors" hint="Who is putting real money in" onBack=${() => history.back()} />
    <div class="card"><${Seg} options=${[['ins', 'Insider buying'], ['13f', 'Superinvestors (13F)']]} value=${tab} onChange=${setTab} /></div>
    ${m === undefined ? html`<div class="card"><div class="hint">Loading…</div></div>` : !m ? html`<div class="callout">Not published yet. The online job refreshes this every 6 hours.</div>`
      : tab === 'ins' ? html`<div class="card" style="padding:4px 14px">${(m.insiders || []).slice(0, 50).map((r) => html`<button class="item" onClick=${() => go('asset/' + encodeURIComponent(r.sym))}><span class="em sym">${r.sym.slice(0, 4)}</span><div class="grow"><div class="t1">${r.company}</div><div class="t2">${r.who} (${r.title}) · ${r.traded}</div></div><div style="text-align:right"><div class="mono up" style="font-size:13px">+$${Math.round(r.value || 0).toLocaleString('en-US')}</div><div class="hint mono" style="font-size:11px">at $${r.price}</div></div></button>`)}</div>
        <div class="note" style="margin:10px 4px">Purchases of $25,000+ by company insiders, from SEC Form 4 filings (via OpenInsider). Insiders sell for many reasons but usually buy for one: they think the price will rise. Small companies dominate this list; be careful.</div>`
      : html`${(m.superinvestors || []).map((f) => html`<div class="card tight"><div class="row between"><b style="font-weight:500">${f.firm}</b><span class="hint mono">${f.period}</span></div><div class="tags" style="margin-top:8px">${f.moves.map((x) => html`<button class=${`tagx ${x.side === 'sell' ? 'down' : ''}`} style="border:0" onClick=${() => go('asset/' + encodeURIComponent(x.sym))} title=${`${x.name}: ${x.act}`}>${x.sym} ${x.act.split(' ')[0]}</button>`)}</div></div>`)}
        <div class="note" style="margin:10px 4px">Latest quarterly 13F filings of well-known fund managers (via Dataroma). 13F data is up to 45 days old when published.</div>`}
  </div>`;
}

// ---------- strategy backtester ----------
const STRATS = [['ma', 'Moving average cross'], ['rsi', 'RSI buy low, sell high'], ['break', 'Breakout (55-day high)'], ['score', 'Advisor technical score'], ['hold', 'Buy and hold only']];
function runBt(bars, strat, prm) {
  const c = bars.map((b) => b.close); const n = c.length;
  let pos = 0; const trades = []; let entry = null; const eq = []; let cash = 1; let units = 0; let inDays = 0;
  const f = sma(c, prm.fast), sl = sma(c, prm.slow), r = rsi(c); const P = strat === 'score' ? prep(bars) : null;
  const hi = []; for (let i = 0; i < n; i++) { let m = -Infinity; for (let j = Math.max(0, i - 55); j < i; j++) m = Math.max(m, c[j]); hi.push(m); }
  const lo20 = []; for (let i = 0; i < n; i++) { let m = Infinity; for (let j = Math.max(0, i - 20); j < i; j++) m = Math.min(m, c[j]); lo20.push(m); }
  const start = strat === 'score' ? 220 : Math.max(prm.slow || 0, 60);
  for (let i = start; i < n; i++) {
    let want = pos;
    if (strat === 'ma') want = f[i] > sl[i] ? 1 : 0;
    else if (strat === 'rsi') { if (!pos && r[i] < prm.lo) want = 1; else if (pos && r[i] > prm.hi) want = 0; }
    else if (strat === 'break') { if (!pos && c[i] > hi[i]) want = 1; else if (pos && c[i] < lo20[i]) want = 0; }
    else if (strat === 'score') { const sc = techScoreAt(P, i); if (!pos && sc >= 60) want = 1; else if (pos && sc <= 40) want = 0; }
    else want = 1;
    if (want !== pos) {
      if (want) { units = cash / c[i]; cash = 0; entry = { i, px: c[i] }; }
      else { cash = units * c[i]; units = 0; trades.push({ ret: (c[i] / entry.px - 1) * 100, days: i - entry.i }); entry = null; }
      pos = want;
    }
    if (pos) inDays++;
    eq.push([bars[i].time * 1000, cash + units * c[i]]);
  }
  if (pos && entry) trades.push({ ret: (c[n - 1] / entry.px - 1) * 100, days: n - 1 - entry.i, open: true });
  const bh = c.slice(start).map((v, k) => [bars[start + k].time * 1000, v / c[start]]);
  const stats = (e) => { const yrs = (e.at(-1)[0] - e[0][0]) / 31557600000; const tot = e.at(-1)[1] / e[0][1]; let peak = -Infinity, dd = 0; for (const [, v] of e) { peak = Math.max(peak, v); dd = Math.min(dd, v / peak - 1); } return { tot: (tot - 1) * 100, cagr: (Math.pow(tot, 1 / Math.max(0.1, yrs)) - 1) * 100, dd: dd * 100, yrs }; };
  return { eq, bh, s: stats(eq), b: stats(bh), trades, win: trades.length ? (trades.filter((t) => t.ret > 0).length / trades.length) * 100 : null, inMkt: (inDays / Math.max(1, n - start)) * 100 };
}
export function Backtest() {
  const s = useStore();
  const [sym, setSym] = useState('@GC.1'); const [strat, setStrat] = useState('ma');
  const [prm, setPrm] = useState({ fast: 50, slow: 200, lo: 30, hi: 70 });
  const [bars, setBars] = useState(null);
  useEffect(() => { setBars(null); dailyLong(sym).then(setBars).catch(() => setBars([])); }, [sym]);
  const res = useMemo(() => (bars && bars.length > 300 ? runBt(bars, strat, prm) : null), [bars, strat, prm.fast, prm.slow, prm.lo, prm.hi]);
  return html`<div class="screen stagger">
    <${Back} title="Strategy backtester" hint="Test a rule on real history" onBack=${() => history.back()} />
    <div class="card">
      <${Field} label="Asset"><div class="chips">${[['@GC.1', 'Gold'], ['.SPX', 'S&P 500'], ['BTC-USD', 'Bitcoin'], ['.IXIC', 'Nasdaq'], ['EURPLN=', 'EUR/PLN'], ...(s.markets.list || []).filter((w) => !['@GC.1', 'BTC-USD', 'EURPLN='].includes(w.sym)).slice(0, 5).map((w) => [w.sym, w.name])].map(([k, n]) => html`<button class=${`chip ${sym === k ? 'on' : ''}`} onClick=${() => setSym(k)}>${n}</button>`)}</div><//>
      <${Field} label="Strategy"><div class="chips">${STRATS.map(([k, n]) => html`<button class=${`chip ${strat === k ? 'on' : ''}`} onClick=${() => setStrat(k)}>${n}</button>`)}</div><//>
      ${strat === 'ma' && html`<div class="grid2"><${Field} label="Fast average (days)"><${NumInput} value=${String(prm.fast)} onInput=${(v) => setPrm({ ...prm, fast: Math.max(2, parseNum(v) || 50) })} /><//><${Field} label="Slow average (days)"><${NumInput} value=${String(prm.slow)} onInput=${(v) => setPrm({ ...prm, slow: Math.max(5, parseNum(v) || 200) })} /><//></div>`}
      ${strat === 'rsi' && html`<div class="grid2"><${Field} label="Buy when RSI below"><${NumInput} value=${String(prm.lo)} onInput=${(v) => setPrm({ ...prm, lo: parseNum(v) || 30 })} /><//><${Field} label="Sell when RSI above"><${NumInput} value=${String(prm.hi)} onInput=${(v) => setPrm({ ...prm, hi: parseNum(v) || 70 })} /><//></div>`}
      <div class="hint">${{ ma: 'Holds while the fast average is above the slow one.', rsi: 'Buys when RSI is oversold, sells when overbought.', break: 'Buys a new 55-day high, sells on a new 20-day low (turtle rules).', score: 'Buys when the advisor technical score reaches 60, sells at 40 or less.', hold: 'Buys on day one and never sells.' }[strat]}</div>
    </div>
    ${!bars ? html`<div class="card"><div class="hint">Loading up to 20 years of daily prices…</div></div>` : !res ? html`<div class="callout">Not enough history for this asset.</div>` : html`
      <div class="card chartbox"><${SeriesChart} data=${res.eq} height=${220} fmt=${(v) => v.toFixed(2) + 'x'} baseline=${1} extra=${[{ name: 'Buy and hold', color: '#FFE36E', data: res.bh }]} /></div>
      <div class="card"><table class="table"><thead><tr><th></th><th>Strategy</th><th>Buy and hold</th></tr></thead><tbody>
        <tr><td>Total return</td><td class=${res.s.tot >= 0 ? 'up' : 'down'}>${pctS(res.s.tot, 0)}</td><td>${pctS(res.b.tot, 0)}</td></tr>
        <tr><td>Per year</td><td>${pctS(res.s.cagr, 1)}</td><td>${pctS(res.b.cagr, 1)}</td></tr>
        <tr><td>Worst fall</td><td class="down">${pctS(res.s.dd, 0)}</td><td class="down">${pctS(res.b.dd, 0)}</td></tr>
        <tr><td>Trades</td><td>${res.trades.length}</td><td>1</td></tr>
        <tr><td>Winning trades</td><td>${res.win != null ? Math.round(res.win) + '%' : '–'}</td><td></td></tr>
        <tr><td>Time invested</td><td>${Math.round(res.inMkt)}%</td><td>100%</td></tr></tbody></table>
        <div class="note" style="margin-top:8px">${res.s.yrs.toFixed(1)} years of real daily closes, no fees, taxes or slippage. Past results do not promise future ones; a rule that worked before can stop working.</div></div>`}
  </div>`;
}
