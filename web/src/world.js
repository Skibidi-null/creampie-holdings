// World cockpit: markets now (world indices, sessions, risk meter, sectors, currency board),
// morning brief, economic calendar, central banks, correlation map, big-fund positioning (COT).
import { useState, useEffect, useMemo } from 'preact/hooks';
import { html, Back, Seg } from './ui.js';
import { Icon } from './icons.js';
import { useStore } from './store.js';
import { useAssetsLive, nameOf, fmtPrice, A } from './assets.js';
import { EXCHANGES, WORLD_IDX, session, sessionBar, fmtMins, riskMeter } from './sessions.js';
import { useMarket, mkt } from './market.js';
import { useTodaysCall, topTags } from './advisor.js';
import { candles, cot, getJSON, COT_CODES } from './data.js';
import { corr, alignedReturns } from './ta.js';
import { Spark, Gauge } from './holo.js';
import { eventPlaybook } from './signals.js';
import { feedback } from './fx.js';

const go = (r) => { location.hash = '#/' + r; };
const pctS = (x, d = 2) => (x == null || !Number.isFinite(x) ? '–' : `${x >= 0 ? '+' : '−'}${Math.abs(x).toFixed(d)}%`);
const heatBg = (p) => { if (p == null) return 'rgba(255,255,255,.04)'; const k = Math.min(1, Math.abs(p) / 2.5); return p >= 0 ? `rgba(60,255,180,${0.06 + k * 0.32})` : `rgba(255,92,138,${0.06 + k * 0.34})`; };
export const SECTORS = [['XLK', 'Technology'], ['XLF', 'Financials'], ['XLV', 'Health care'], ['XLY', 'Consumer'], ['XLP', 'Staples'], ['XLE', 'Energy'], ['XLI', 'Industrials'], ['XLB', 'Materials'], ['XLU', 'Utilities'], ['XLRE', 'Real estate'], ['XLC', 'Communication'], ['SMH', 'Chips']];
const FX = ['PLN=', 'EURPLN=', 'GBPPLN=', 'AED=', 'INR=', 'EUR='];
const MACRO = ['@GC.1', '@SI.1', '@CL.1', 'BTC-USD', '.DXY', 'US10Y', 'US2Y', '.VIX'];
const TABS = [['now', 'Now'], ['brief', 'Brief'], ['cal', 'Calendar'], ['banks', 'Banks'], ['links', 'Links'], ['funds', 'Funds']];

export function World({ tab: tab0 }) {
  const [tab, setTab] = useState(TABS.some((t) => t[0] === tab0) ? tab0 : 'now');
  const extra = useMemo(() => [...WORLD_IDX.map((x) => x[0]), ...SECTORS.map((x) => x[0]), ...FX, ...MACRO], []);
  const a = useAssetsLive(extra);
  useMarket();
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((x) => x + 1), 30e3); return () => clearInterval(t); }, []);
  return html`<div class="screen">
    <${Back} title="World markets" hint=${`Live · ${a.at ? Math.round((Date.now() - a.at) / 1000) + 's ago' : 'connecting'}`} onBack=${() => history.back()} />
    <div class="tabs5"><div class="seg small">${TABS.map(([k, n]) => html`<button class=${tab === k ? 'on' : ''} onClick=${() => { setTab(k); feedback('tap'); history.replaceState(null, '', '#/world/' + k); }}>${n}</button>`)}</div></div>
    <div class="stagger" key=${tab}>
      ${tab === 'now' && html`<${Now} q=${a.q} />`}
      ${tab === 'brief' && html`<${Brief} q=${a.q} />`}
      ${tab === 'cal' && html`<${Calendar} />`}
      ${tab === 'banks' && html`<${Banks} />`}
      ${tab === 'links' && html`<${Links} />`}
      ${tab === 'funds' && html`<${Funds} />`}
    </div>
  </div>`;
}

function RiskCard() {
  const rm = riskMeter();
  if (!rm) return html`<div class="card"><div class="label">Risk meter</div><div class="hint" style="margin-top:8px">Waiting for live prices</div></div>`;
  return html`<div class="card">
    <div class="row between"><span class="label">Risk-on / risk-off</span><span class=${`tag ${rm.on ? 'up' : rm.off ? 'down' : 'watch'}`}>${rm.label}</span></div>
    <div class="riskm"><i style=${{ left: `${rm.score}%` }}></i></div>
    <div class="row between hint mono" style="font-size:10.5px"><span>RISK-OFF</span><span>${rm.score}/100</span><span>RISK-ON</span></div>
    <div style="margin-top:10px">${rm.parts.map((p) => html`<div class="row between" style="padding:4px 0;font-size:12.5px"><span class="dim">${p.name}</span><span class=${`mono ${p.v > 0.15 ? 'up' : p.v < -0.15 ? 'down' : 'mute'}`} style="font-size:12px">${p.txt}</span></div>`)}</div>
    <div class="note" style="margin-top:6px">Risk-on: money is going into stocks and crypto. Risk-off: into safe havens like gold, the dollar and bonds.</div>
  </div>`;
}

function Now({ q }) {
  const s = useStore();
  const pln = q['PLN='], aed = q['AED='], inr = q['INR='];
  const fx = [
    ['USD', pln && pln.last, pln && pln.pct, 'PLN='],
    ['EUR', q['EURPLN='] && q['EURPLN='].last, q['EURPLN='] && q['EURPLN='].pct, 'EURPLN='],
    ['GBP', q['GBPPLN='] && q['GBPPLN='].last, q['GBPPLN='] && q['GBPPLN='].pct, 'GBPPLN='],
    ['AED', pln && aed ? pln.last / aed.last : s.rates.AED || null, pln && aed && pln.pct != null && aed.pct != null ? pln.pct - aed.pct : null, null],
    ['INR ×100', pln && inr ? (pln.last / inr.last) * 100 : s.rates.INR ? s.rates.INR * 100 : null, pln && inr && pln.pct != null && inr.pct != null ? pln.pct - inr.pct : null, null],
  ];
  return html`
    <${RiskCard} />
    <div class="sect"><span class="h-title">Sessions</span><span class="hint mono">your time</span></div>
    <div class="card">${EXCHANGES.map((ex) => { const ss = session(ex); const b = sessionBar(ex); const iq = ex.idx && q[ex.idx];
      return html`<div>
        <div class="row between" style="font-size:13px"><span class="row" style="gap:8px"><span class=${`dotst ${ss.st === 'open' ? 'on' : ss.st === 'lunch' ? 'pre' : ''}`}></span>${ex.name}<span class="hint">${ex.city}</span></span>
          <span class="mono" style="font-size:11.5px">${iq && iq.pct != null ? html`<span class=${iq.pct >= 0 ? 'up' : 'down'}>${pctS(iq.pct)}</span> · ` : ''}<span class=${ss.st === 'open' ? 'up' : 'mute'}>${ss.st === 'open' ? 'closes in ' + fmtMins(ss.mins) : ss.st === 'lunch' ? 'lunch, back in ' + fmtMins(ss.mins) : 'opens in ' + fmtMins(ss.mins)}</span></span></div>
        <div class="sessbar">${b.o < b.c ? html`<i class=${ss.st === 'open' ? '' : 'off'} style=${{ left: b.o * 100 + '%', width: (b.c - b.o) * 100 + '%' }}></i>` : html`<i class=${ss.st === 'open' ? '' : 'off'} style=${{ left: b.o * 100 + '%', right: 0 }}></i><i class=${ss.st === 'open' ? '' : 'off'} style=${{ left: 0, width: b.c * 100 + '%' }}></i>`}<span class="now" style=${{ left: b.now * 100 + '%' }}></span></div>
      </div>`; })}
      <div class="note">Regular hours, holidays not included. Crypto trades 24/7. Gold and forex trade nearly 24h on weekdays.</div></div>

    <div class="sect"><span class="h-title">World indices</span></div>
    <div class="heat">${WORLD_IDX.map(([sym, nm, c]) => { const x = q[sym]; return html`<button style=${{ background: heatBg(x && x.pct) }} onClick=${() => go('asset/' + encodeURIComponent(sym))}><div class="hn">${nm}</div><div class="hv">${x && x.pct != null ? pctS(x.pct) : '–'}</div><div class="hint" style="font-size:10px">${c}</div></button>`; })}</div>

    <div class="sect"><span class="h-title">US sectors today</span></div>
    <div class="heat">${SECTORS.map(([sym, nm]) => { const x = q[sym]; return html`<button style=${{ background: heatBg(x && x.pct) }} onClick=${() => go('asset/' + sym)}><div class="hn">${nm}</div><div class="hv">${x && x.pct != null ? pctS(x.pct) : '–'}</div></button>`; })}</div>

    <div class="sect"><span class="h-title">Currency board</span><span class="hint mono">zł per unit</span></div>
    <div class="card" style="padding:4px 14px">${fx.map(([c, v, p, sym]) => html`<button class="item" onClick=${() => sym && go('asset/' + encodeURIComponent(sym))}>
      <span class="em sym">${c.slice(0, 3)}</span><div class="grow"><div class="t1">${c}/PLN</div><div class="t2">${sym ? 'live' : 'cross rate from live USD prices'}${s.rates[c.slice(0, 3)] ? ` · NBP ${s.rates[c.slice(0, 3)].toFixed(4)}` : ''}</div></div>
      <div style="text-align:right"><div class="mono">${v != null ? v.toFixed(4) : '–'}</div><span class=${`chg ${p >= 0 ? 'up' : 'down'}`}>${pctS(p)}</span></div></button>`)}</div>

    <div class="sect"><span class="h-title">Commodities, crypto, rates</span></div>
    <div class="heat">${MACRO.map((sym) => { const x = q[sym]; const nm = { '@GC.1': 'Gold', '@SI.1': 'Silver', '@CL.1': 'Oil (WTI)', 'BTC-USD': 'Bitcoin', '.DXY': 'Dollar index', US10Y: 'US 10-year', US2Y: 'US 2-year', '.VIX': 'VIX fear' }[sym];
      return html`<button style=${{ background: heatBg(x && (sym.startsWith('US') ? null : x.pct)) }} onClick=${() => go('asset/' + encodeURIComponent(sym))}><div class="hn">${nm}</div><div class="hv">${x ? (sym.startsWith('US') ? x.last.toFixed(3) + '%' : fmtPrice(x.last, sym, x.last > 1000 ? 0 : 2)) : '–'}</div><div class=${`hint ${x && x.pct >= 0 ? 'up' : 'down'}`} style="font-size:10.5px">${x ? (sym.startsWith('US') && x.chg != null ? `${x.chg >= 0 ? '+' : ''}${(x.chg * 100).toFixed(1)} bp` : pctS(x.pct)) : ''}</div></button>`; })}</div>
  `;
}

// ---------- morning brief (built from live data only) ----------
export function briefLines(q) {
  const L = [];
  const mv = (sym, nm) => { const x = q[sym]; return x && x.pct != null ? `${nm} ${pctS(x.pct, 1)}` : null; };
  const asia = [mv('.N225', 'Nikkei'), mv('.HSI', 'Hang Seng'), mv('.SSEC', 'Shanghai'), mv('.NSEI', 'Nifty')].filter(Boolean);
  const eu = [mv('.GDAXI', 'DAX'), mv('.FTSE', 'FTSE'), mv('.STOXX50E', 'Euro Stoxx')].filter(Boolean);
  const us = [mv('.SPX', 'S&P 500'), mv('.IXIC', 'Nasdaq'), mv('.DJI', 'Dow')].filter(Boolean);
  if (asia.length) L.push(['globe', 'Asia', asia.join(', ')]);
  if (eu.length) L.push(['globe', 'Europe', eu.join(', ')]);
  if (us.length) L.push(['globe', 'Wall Street (last session)', us.join(', ')]);
  const rm = riskMeter(); if (rm) L.push(['pulse', 'Mood', `${rm.label} (${rm.score}/100). ${rm.parts.slice(0, 2).map((p) => p.txt).join(', ')}`]);
  const m = [mv('@GC.1', 'Gold'), mv('BTC-USD', 'Bitcoin'), mv('@CL.1', 'Oil'), mv('.DXY', 'Dollar')].filter(Boolean);
  if (m.length) L.push(['coin', 'Gold, crypto, oil, dollar', m.join(', ')]);
  if (q.US10Y) L.push(['bank', 'Bonds', `US 10-year at ${q.US10Y.last.toFixed(2)}%${q.US10Y.chg != null ? ` (${q.US10Y.chg >= 0 ? '+' : ''}${(q.US10Y.chg * 100).toFixed(0)} bp)` : ''}`]);
  if (q['EURPLN='] || q['PLN=']) L.push(['swap', 'Złoty', [q['PLN='] && `USD/PLN ${q['PLN='].last.toFixed(4)}`, q['EURPLN='] && `EUR/PLN ${q['EURPLN='].last.toFixed(4)}`].filter(Boolean).join(', ')]);
  const cal = (mkt.cal || []).filter((e) => { const t = Date.parse(e.date); return t > Date.now() - 3600e3 && t < Date.now() + 24 * 3600e3; });
  if (cal.length) L.push(['calendar', 'Today and tonight', cal.slice(0, 4).map((e) => `${new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${e.title}`).join(' · ')]);
  return L;
}
function Brief({ q }) {
  const s = useStore();
  const tc = useTodaysCall();
  const lines = briefLines(q);
  const movers = (s.markets.list || []).map((w) => ({ w, x: q[w.sym] || A.q[w.sym] })).filter((m) => m.x && m.x.pct != null).sort((a, b) => Math.abs(b.x.pct) - Math.abs(a.x.pct)).slice(0, 4);
  const news = (mkt.news && mkt.news.items) || [];
  return html`
    <div class="holo" style="margin-bottom:14px"><div class="in"><div class="content">
      <div class="label">Morning brief · ${new Date().toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}</div>
      ${tc.res ? html`<div class="row" style="gap:14px;margin-top:12px"><${Gauge} score=${tc.res.score} size=${64} /><div class="grow"><div style="font-weight:600">Today's call: ${nameOf(tc.res.sym)} ${tc.res.verdict.label}</div><div class="tags" style="margin-top:6px">${topTags(tc.res, 3).map((t) => html`<span class=${`tagx ${t.dir === 'down' ? 'down' : ''}`}>${t.text}</span>`)}</div></div></div>` : html`<div class="hint" style="margin-top:10px">Scoring your watchlist…</div>`}
    </div></div></div>
    <div class="card">${lines.length ? lines.map(([ic, h, t]) => html`<div class="gd"><span class="gd-ic" style="background:rgba(0,210,255,.1);color:var(--ice)"><${Icon} n=${ic} size=${17} /></span><div><b style="font-weight:600;font-size:14px">${h}</b><div class="gd-b">${t}</div></div></div>`) : html`<div class="hint">Waiting for live prices</div>`}</div>
    ${movers.length > 0 && html`<div class="sect"><span class="h-title">Your watchlist movers</span></div><div class="card" style="padding:4px 14px">${movers.map(({ w, x }) => html`<button class="item" onClick=${() => go('asset/' + encodeURIComponent(w.sym))}><div class="grow"><div class="t1">${w.name || w.sym}</div><div class="t2">${fmtPrice(x.last, w.sym)}</div></div><span class=${`chg ${x.pct >= 0 ? 'up' : 'down'}`}>${pctS(x.pct)}</span></button>`)}</div>`}
    ${news.length > 0 && html`<div class="sect"><span class="h-title">Why it's moving</span><button class="more" onClick=${() => go('news')}>All news</button></div><div class="card" style="padding:4px 14px">${news.slice(0, 5).map((n) => html`<a class="news" href=${n.link} target="_blank" rel="noopener"><div style="font-size:13.5px">${n.title}</div><div class="hint" style="margin-top:3px">${n.source || ''}${n.impact && n.impact !== 'watch' ? ` · gold may ${n.impact === 'up' ? 'rise' : 'fall'}` : ''}</div></a>`)}</div>`}
  `;
}

function Calendar() {
  useMarket();
  const cal = [...(mkt.cal || [])].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  const days = {}; for (const e of cal) (days[new Date(e.date).toDateString()] ||= []).push(e);
  return html`<div class="card">${!cal.length ? html`<div class="hint">No calendar loaded (it refreshes from the online job every few hours).</div>` : Object.entries(days).map(([d, es]) => html`
    <div class="cal-day">${new Date(d).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' })}</div>
    ${es.map((e) => html`<details class=${`cal ${Date.parse(e.date) < Date.now() ? 'past' : ''}`}><summary class="row" style="gap:10px"><span class="mono hint" style="width:44px">${new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><span class=${`imp ${String(e.impact).toLowerCase()}`}></span><span class="grow" style="font-size:13.5px">${e.title}</span><span class="pill">${e.country}</span></summary>
      <div class="cal-more"><div class="kv" style="font-size:12.5px;margin-bottom:6px"><span>Expected</span><span>${e.forecast || '–'}</span><span>Previous</span><span>${e.previous || '–'}</span><span>Actual</span><span>${e.actual || 'not in the free feed'}</span></div>${eventPlaybook(e.title)}</div></details>`)}`)}
    <div class="note" style="margin-top:10px">This week's important US, euro area and China releases. Times in your time zone.</div></div>`;
}

const banksCache = { at: 0, d: null };
async function loadBanks() {
  if (banksCache.d && Date.now() - banksCache.at < 6 * 3600e3) return banksCache.d;
  const d = {};
  try {
    const j = await getJSON('https://data-api.ecb.europa.eu/service/data/FM/B.U2.EUR.4F.KR.DFR.LEV?lastNObservations=8&format=jsondata');
    const ser = Object.values(j.dataSets[0].series)[0].observations; const dates = j.structure.dimensions.observation[0].values.map((v) => v.id);
    const obs = Object.entries(ser).map(([k, v]) => [dates[+k], v[0]]).sort((a, b) => a[0].localeCompare(b[0]));
    d.ecb = { rate: obs.at(-1)[1], date: obs.at(-1)[0], prev: obs.find((x) => x[1] !== obs.at(-1)[1]) || null };
  } catch {}
  try { const m = await getJSON('macro.json?t=' + Math.floor(Date.now() / 3600e3)); d.macro = m; } catch {}
  banksCache.d = d; banksCache.at = Date.now(); return d;
}
function Banks() {
  useMarket();
  const [d, setD] = useState(banksCache.d);
  useEffect(() => { loadBanks().then(setD); }, []);
  const fed = mkt.fed; const y2 = A.q.US2Y || mkt.q.US2Y;
  const nbp = d && d.macro && d.macro.nbp;
  const row = (nm, sub, rate, extra) => html`<div class="card"><div class="row between"><div><div style="font-weight:600">${nm}</div><div class="hint">${sub}</div></div><div class="big-num mono" style="font-size:22px">${rate}</div></div>${extra && html`<div class="hint" style="margin-top:8px;line-height:1.5">${extra}</div>`}</div>`;
  return html`
    ${row('Federal Reserve (US)', fed ? `Target range, since ${fed.moves.length ? fed.moves.at(-1).date : fed.date}` : 'New York Fed', fed ? `${fed.lo.toFixed(2)}–${fed.hi.toFixed(2)}%`.replace('–', ' to ') : '–',
      fed && y2 ? `The 2-year yield (${y2.last.toFixed(2)}%) is ${y2.last < (fed.lo + fed.hi) / 2 - 0.2 ? 'below the Fed rate: markets expect cuts' : y2.last > (fed.lo + fed.hi) / 2 + 0.2 ? 'above the Fed rate: markets expect hikes' : 'close to the Fed rate: markets expect a hold'}.${fed.moves.length ? ` Last move: ${fed.moves.at(-1).to[1] > fed.moves.at(-1).from[1] ? 'hike' : 'cut'} on ${fed.moves.at(-1).date}.` : ''}` : null)}
    ${row('European Central Bank', d && d.ecb ? `Deposit rate, since ${d.ecb.date}` : 'ECB data portal', d && d.ecb ? d.ecb.rate.toFixed(2) + '%' : d ? 'unavailable' : '…', 'Sets rates for the euro. Moves EUR/PLN and European stocks.')}
    ${row('Narodowy Bank Polski', nbp ? `Reference rate, since ${nbp.since}` : 'NBP', nbp ? nbp.ref.toFixed(2) + '%' : 'unavailable', nbp ? `Lombard ${nbp.lombard != null ? nbp.lombard.toFixed(2) + '%' : '–'}, deposit ${nbp.deposit != null ? nbp.deposit.toFixed(2) + '%' : '–'}. Affects your złoty savings and loans.` : 'Loaded by the online job; not published yet.')}
    ${row('Central Bank of the UAE', 'Base rate', 'follows the Fed', 'The dirham is pegged to the US dollar, so the UAE base rate moves together with the Fed. There is no free live feed for the exact number.')}
  `;
}

const LINK_SYMS = [['.SPX', 'S&P'], ['.IXIC', 'Nasdaq'], ['@GC.1', 'Gold'], ['BTC-USD', 'BTC'], ['@CL.1', 'Oil'], ['.DXY', 'USD'], ['US10Y', '10y'], ['EURPLN=', 'EUR/PLN']];
function Links() {
  const s = useStore();
  const syms = useMemo(() => { const extra = (s.markets.list || []).map((w) => [w.sym, (w.name || w.sym).split(' ')[0].slice(0, 7)]).filter(([x]) => !LINK_SYMS.some((l) => l[0] === x)).slice(0, 3); return [...LINK_SYMS, ...extra]; }, []);
  const [m, setM] = useState(null);
  const [win, setWin] = useState(90);
  useEffect(() => {
    let ok = true;
    Promise.all(syms.map(([x]) => candles(x, '1Y').catch(() => []))).then((bars) => {
      if (!ok) return;
      const M = syms.map((_, i) => syms.map((__, j) => { if (i === j) return 1; const [a, b] = alignedReturns(bars[i].slice(-win - 40), bars[j].slice(-win - 40)); return corr(a.slice(-win), b.slice(-win)); }));
      setM(M);
    });
    return () => { ok = false; };
  }, [win]);
  const col = (v) => v == null ? 'rgba(255,255,255,.04)' : v >= 0 ? `rgba(0,210,255,${Math.abs(v) * 0.75})` : `rgba(255,60,200,${Math.abs(v) * 0.75})`;
  return html`<div class="card">
    <div class="row between" style="margin-bottom:10px"><span class="label">Correlation of daily moves</span><${Seg} options=${[[30, '30d'], [90, '90d'], [250, '1y']]} value=${win} onChange=${setWin} /></div>
    ${!m ? html`<div class="hint">Loading a year of prices…</div>` : html`<div class="corr" style=${{ gridTemplateColumns: `52px repeat(${syms.length}, 1fr)` }}>
      <div class="h"></div>${syms.map(([, n]) => html`<div class="h" style="writing-mode:vertical-rl;transform:rotate(180deg);height:44px">${n}</div>`)}
      ${syms.map(([, n], i) => html`<div class="h" style="text-align:right;padding-right:4px">${n}</div>${m[i].map((v, j) => html`<div style=${{ background: col(v), color: Math.abs(v || 0) > 0.5 ? '#fff' : 'var(--dim)' }} title=${`${n} vs ${syms[j][1]}`}>${v == null ? '' : i === j ? '' : v.toFixed(1).replace('0.', '.').replace('-.', '−.')}</div>`)}`)}
    </div>`}
    <div class="note" style="margin-top:10px">Cyan: they tend to move together. Pink: they tend to move opposite. Near zero: no link. Holding assets that are not strongly linked spreads your risk.</div>
  </div>`;
}

const COTS = [['@GC.1', 'Gold'], ['@SI.1', 'Silver'], ['@CL.1', 'Crude oil'], ['.SPX', 'S&P 500'], ['.IXIC', 'Nasdaq 100'], ['EUR=', 'Euro'], ['US10Y', '10-year note'], ['BTC-USD', 'Bitcoin']];
function Funds() {
  const [rows, setRows] = useState({});
  useEffect(() => { let ok = true; for (const [sym] of COTS) cot(COT_CODES[sym], 160).then((r) => ok && setRows((x) => ({ ...x, [sym]: r }))).catch(() => ok && setRows((x) => ({ ...x, [sym]: [] }))); return () => { ok = false; }; }, []);
  return html`<div class="note" style="margin:0 4px 10px">Weekly CFTC report (Commitments of Traders): what big speculators (hedge funds) hold in futures. Extremes often come before turns.</div>
    ${COTS.map(([sym, nm]) => { const r = rows[sym]; if (!r) return html`<div class="card tight"><b style="font-weight:500">${nm}</b><div class="hint">Loading…</div></div>`; if (!r.length) return html`<div class="card tight"><b style="font-weight:500">${nm}</b><div class="hint">Unavailable</div></div>`;
      const nets = r.map((x) => x.specNet); const cur = nets.at(-1), prev = nets.at(-2); const pctl = Math.round((nets.filter((x) => x < cur).length / nets.length) * 100);
      return html`<div class="card tight"><div class="row between"><div><b style="font-weight:500">${nm}</b><div class="hint">${r.at(-1).date} · ${pctl}th percentile of 3 years${pctl >= 90 ? ', crowded long' : pctl <= 10 ? ', extreme short' : ''}</div></div>
        <div style="text-align:right"><div class=${`mono ${cur >= 0 ? 'up' : 'down'}`}>${cur >= 0 ? 'Long' : 'Short'} ${Math.abs(cur).toLocaleString('en-US')}</div><div class="hint mono">${cur - prev >= 0 ? '+' : '−'}${Math.abs(cur - prev).toLocaleString('en-US')} this week</div></div></div>
        <div style="margin-top:8px"><${Spark} pts=${nets} w=${330} h=${30} color=${cur >= 0 ? '#3CFFB4' : '#FF5C8A'} fill cls="chart" /></div></div>`; })}`;
}
