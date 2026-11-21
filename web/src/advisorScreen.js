// Advisor screens: the watchlist scored, the per-asset signal panel with every reason,
// the backtest, the trade plan and the honest track record of past calls.
import { useState, useEffect, useMemo } from 'preact/hooks';
import { html, Back, Seg, toast } from './ui.js';
import { Icon } from './icons.js';
import { useStore, patch, get, toPln } from './store.js';
import { Gauge } from './holo.js';
import { useAnalysis, todaysCall, useTodaysCall, topTags, STYLES, style, tradePlan, emergencyFund, trackRecord, DISCLAIMER, verdictOf } from './advisor.js';
import { nameOf, fmtPrice, A, useAssets } from './assets.js';
import { fullNetWorth } from './networth.js';
import { priceNow } from './gold.js';
import { feedback } from './fx.js';
import { money, num } from './util.js';

const go = (r) => { location.hash = '#/' + r; };
const pctS = (x, d = 1) => (x == null ? '–' : `${x >= 0 ? '+' : '−'}${Math.abs(x).toFixed(d)}%`);

export function AdvisorScreen() {
  const s = useStore();
  useAssets();
  const tc = useTodaysCall();
  const [busy, setBusy] = useState(false);
  const [tr, setTr] = useState(null);
  useEffect(() => { trackRecord().then(setTr).catch(() => setTr(null)); }, [(s.calls || []).length]);
  const ef = emergencyFund(s);
  const refresh = async () => { setBusy(true); try { await todaysCall(true); } finally { setBusy(false); } };
  const list = tc.list || [];
  const missing = (s.markets.list || []).filter((w) => !list.some((r) => r.sym === w.sym));
  return html`<div class="screen stagger">
    <${Back} title="Advisor" hint=${`${STYLES[s.settings.risk] ? STYLES[s.settings.risk].name : 'Balanced'} style · ${list.length} assets scored`} onBack=${() => history.back()}
      right=${html`<button class="iconbtn" onClick=${refresh} aria-label="Refresh"><${Icon} n="repeat" size=${18} cls=${busy ? 'spin' : ''} /></button>`} />
    ${ef && ef.low && html`<div class="callout" style="margin-bottom:12px"><b style="font-weight:600">Safety cushion first.</b> Your cash covers about ${ef.months.toFixed(1)} months of spending (${money(ef.monthly, 'PLN', 0)} a month). Building 3 to 6 months of savings before adding more risk is a common rule.</div>`}
    <div class="card">
      <div class="label" style="margin-bottom:10px">Risk style</div>
      <${Seg} options=${Object.entries(STYLES).map(([k, v]) => [k, v.name])} value=${s.settings.risk || 'balanced'} onChange=${(k) => { patch('settings', { risk: k }); feedback('tap'); setTimeout(refresh, 50); }} />
      <div class="hint" style="margin-top:8px">${{ careful: 'Needs a score of 65+ to say Buy. Wider stops (2.5x daily range), risks 0.5% per trade.', balanced: 'Buy at 60+, Sell at 40 or less. Stops at 2x the daily range, risks 1% per trade.', aggressive: 'Acts on weaker signals (57+). Tighter stops (1.5x), risks 2% per trade.' }[s.settings.risk || 'balanced']}</div>
    </div>

    <div class="sect"><span class="h-title">Your watchlist, scored</span><button class="more" onClick=${() => go('markets')}>Edit</button></div>
    ${list.map((r) => html`<div class="card tap tight" onClick=${() => go('asset/' + encodeURIComponent(r.sym))}>
      <div class="row" style="gap:14px"><${Gauge} score=${r.score} size=${58} stroke=${6} />
        <div class="grow"><div class="row between"><b style="font-weight:600">${nameOf(r.sym)}</b><span class=${`call ${r.verdict.key}`} style="font-size:14px">${r.verdict.label}</span></div>
          <div class="hint" style="margin:2px 0 6px">${r.agree} of ${r.avail} signals agree · ${r.conf.toLowerCase()} confidence</div>
          <div class="tags">${topTags(r, 3).map((t) => html`<span class=${`tagx ${t.dir === 'down' ? 'down' : ''}`}>${t.text}</span>`)}</div></div></div>
    </div>`)}
    ${!tc.at && html`<div class="card"><div class="hint">Scoring your watchlist… this reads up to 20 years of prices per asset.</div></div>`}
    ${tc.at && missing.length > 0 && html`<div class="note" style="margin:0 4px 12px">No score for ${missing.map((m) => m.name || m.sym).join(', ')}: not enough price history available.</div>`}

    <div class="sect"><span class="h-title">Track record</span></div>
    <div class="card">${tr && tr.all[0].n ? html`
      <div class="hint" style="margin-bottom:8px">Every Buy or Sell call the advisor made on this phone, checked against what the price did next.</div>
      <div class="bt h"><span></span><span>5 days</span><span>20 days</span><span>60 days</span></div>
      <div class="bt"><span>All calls right</span>${tr.all.map((o) => html`<span>${o.n ? Math.round(o.hit) + '%' : '–'}</span>`)}</div>
      <div class="bt"><span>Average result</span>${tr.all.map((o) => html`<span class=${o.avg > 0 ? 'up' : o.avg < 0 ? 'down' : ''}>${o.n ? pctS(o.avg) : '–'}</span>`)}</div>
      <div class="bt"><span>Calls checked</span>${tr.all.map((o) => html`<span>${o.n}</span>`)}</div>
      ${Object.entries(tr.sym).map(([sym, row]) => row[0].n ? html`<div class="bt"><span>${nameOf(sym)}</span>${row.map((o) => html`<span>${o.n ? Math.round(o.hit) + '%' : '–'}</span>`)}</div>` : '')}
      <div class="note" style="margin-top:8px">${tr.total} calls logged, ${tr.pending} still waiting for 5 days to pass. Results are shown as they are, good or bad.</div>`
      : html`<div class="hint">${(s.calls || []).length} calls logged so far. Results appear once 5 trading days have passed after a Buy or Sell call.</div>`}</div>
    <div class="disclaim">${DISCLAIMER}</div>
  </div>`;
}

// ---------- signal panel (used on every asset screen) ----------
export function SignalPanel({ sym, an, onAlert, onTrade, canTrade }) {
  const s = useStore();
  const r = an.res;
  const [open, setOpen] = useState(false);
  const tradeBtns = canTrade && html`<div class="btns" style="margin-top:14px"><button class="btn buy big" onClick=${() => onTrade('BUY')}>Buy</button><button class="btn sell big" onClick=${() => onTrade('SELL')}>Sell</button></div>`;
  if (!r) return html`<div class="card"><div class="row" style="gap:14px"><${Gauge} score=${null} size=${76} /><div class="grow"><div class="call hold" style="font-size:18px;color:var(--dim)">Reading signals…</div><div class="hint">Trend, momentum, macro, sentiment, positioning and history</div></div></div>${tradeBtns}</div>`;
  if (r.score == null) return html`<div class="card"><div class="row" style="gap:14px"><${Gauge} score=${null} size=${76} /><div class="grow"><b>Signal unavailable</b><div class="hint">${r.err || 'Not enough data'}</div></div></div>${tradeBtns}</div>`;
  const bt = r.bt; const side = r.verdict.dir > 0 ? 'buy' : r.verdict.dir < 0 ? 'sell' : null;
  const b20 = bt && side ? bt[side][1] : null;
  // position size from net worth (investable) in zł
  const nw = fullNetWorth(s, priceNow());
  const q = A.q[sym]; const cur = (q && q.cur) || 'USD';
  const pxToPLN = cur === 'PLN' || /PLN=$/.test(sym) ? 1 : toPln(s, 1, cur === 'GBX' ? 'GBP' : cur) * (cur === 'GBX' ? 0.01 : 1);
  const plan = tradePlan(r.price, r.P, r.bars, r.verdict, style(), Math.max(0, nw.total), pxToPLN);
  const groups = [...new Set(r.factors.map((f) => f.group))];
  const shown = open ? r.factors : r.factors.filter((f) => !f.na).sort((a, b) => Math.abs(b.s * b.w) - Math.abs(a.s * a.w)).slice(0, 7);
  const ef = emergencyFund(s);
  return html`<div class="card" style="padding:18px">
    <div class="row top0" style="gap:16px">
      <${Gauge} score=${r.score} size=${80} />
      <div class="grow">
        <div class=${`call ${r.verdict.key}`}>${r.verdict.label.toUpperCase()}</div>
        <div style="font-size:13px;color:#C9CBE0;margin-top:2px">${r.agree} of ${r.avail} signals agree · ${r.conf.toLowerCase()} confidence</div>
        ${b20 && b20.n >= 10 ? html`<div class="hint" style="margin-top:4px">This setup was right <b style="color:var(--text)">${Math.round(b20.hit)}%</b> of the time over 20 days since ${new Date(bt.from * 1000).getFullYear()} (${b20.n} days, avg ${pctS(side === 'buy' ? b20.avg : b20.avg)})</div>`
          : html`<div class="hint" style="margin-top:4px">${side ? 'Too few past cases to backtest this setup' : 'No strong edge either way: waiting is a valid choice'}</div>`}
      </div>
    </div>
    ${ef && ef.low && r.verdict.dir > 0 && html`<div class="callout" style="margin-top:12px;font-size:12.5px">Your cash covers ${ef.months.toFixed(1)} months of spending. Consider your safety cushion before buying.</div>`}
    <div style="margin-top:12px">
      ${shown.map((f) => html`<div class=${`reason ${f.na ? 'na' : ''}`}>
        <span class="rn">${f.name}<small class="hint" style="display:block;font-size:10px">${f.group}</small></span>
        <span class="rt">${f.text}${bt && bt.rules[f.key] && !f.na && Math.abs(f.s) >= 0.3 ? (() => { const o = f.s > 0 ? bt.rules[f.key].up : bt.rules[f.key].dn; return o.n >= 20 ? html`<small>History: right ${Math.round(o.hit)}% of ${o.n} times over 20 days</small>` : ''; })() : ''}</span>
        <span class=${`wb ${f.na ? 'na' : f.s > 0.15 ? '' : f.s < -0.15 ? 'down' : 'flat'}`}><i style=${{ width: `${f.na ? 0 : Math.max(8, Math.abs(f.s) * 100)}%` }}></i></span>
      </div>`)}
    </div>
    <button class="btn ghost block sm" style="margin-top:6px" onClick=${() => setOpen(!open)}>${open ? 'Show the strongest only' : `Show all ${r.factors.length} factors (${r.factors.filter((f) => f.na).length} unavailable)`}</button>
    ${plan && html`<div class="plan3">${plan.side === 'long' ? html`
        <div><div class="k">Entry zone</div><div class="v">${fmtPrice(plan.entryLo, sym)}</div><div class="v mute" style="font-size:11px">to ${fmtPrice(plan.entryHi, sym)}</div></div>
        <div class="stop"><div class="k">Stop</div><div class="v">${fmtPrice(plan.stop, sym)}</div><div class="v mute" style="font-size:11px">${pctS(((plan.stop - r.price) / r.price) * 100)}</div></div>
        <div class="tgt"><div class="k">Target · R:R ${plan.rr.toFixed(1)}</div><div class="v">${fmtPrice(plan.target, sym)}</div><div class="v mute" style="font-size:11px">${pctS(((plan.target - r.price) / r.price) * 100)}</div></div>`
      : html`<div><div class="k">Price now</div><div class="v">${fmtPrice(plan.exitNow, sym)}</div></div>
        <div class="stop"><div class="k">Protect above</div><div class="v">${fmtPrice(plan.stop, sym)}</div></div>
        <div class="tgt"><div class="k">Buy-back zone</div><div class="v">${fmtPrice(plan.rebuy, sym)}</div></div>`}</div>
      ${plan.side === 'long' && plan.units != null && plan.units > 0 && html`<div class="hint">Position size for ${plan.riskPct}% risk of your net worth: about <b style="color:var(--text)">${plan.units >= 10 ? num(plan.units, 0) : num(plan.units, 4)} units</b> (${fmtPrice(plan.value, sym)}). If the stop is hit you lose about ${money((plan.units * plan.risk) * pxToPLN, 'PLN', 0)}.</div>`}
      ${plan.side !== 'long' && html`<div class="hint">If you hold it: consider taking some profit or tightening your stop. The buy-back zone is the nearest support.</div>`}`}
    ${bt && html`<details style="margin-top:12px"><summary class="hint" style="cursor:pointer">Backtest of the technical rules since ${new Date(bt.from * 1000).getFullYear()}</summary>
      <div class="bt h" style="margin-top:8px"><span></span><span>5 days</span><span>20 days</span><span>60 days</span></div>
      ${[['Buy signals: rose', 'buy'], ['Sell signals: fell', 'sell'], ['Any day: rose', 'all']].map(([nm, k]) => html`<div class="bt"><span>${nm}</span>${bt[k].map((o) => html`<span>${o.n ? Math.round(o.hit) + '%' : '–'}</span>`)}</div>
        <div class="bt" style="border-top:0;padding-top:0"><span class="hint">avg move (${bt[k][1].n} cases)</span>${bt[k].map((o) => html`<span class=${`hint ${o.avg > 0 ? 'up' : o.avg < 0 ? 'down' : ''}`}>${o.n ? pctS(o.avg) : ''}</span>`)}</div>`)}
      <div class="note" style="margin-top:6px">Compare the signal rows with "Any day": the edge is the difference. Macro, sentiment and positioning factors are not in this backtest (not enough free history).</div>
    </details>`}
    <div class="btns" style="margin-top:14px">
      ${canTrade ? html`<button class="btn buy big" onClick=${() => onTrade('BUY')}>Buy</button><button class="btn sell big" onClick=${() => onTrade('SELL')}>Sell</button>` : html`<button class="btn buy big" onClick=${() => go('practice/' + encodeURIComponent(sym))}>Practice trade</button>`}
      <button class="btn big" onClick=${onAlert}>Alert me</button>
    </div>
    <div class="disclaim">${DISCLAIMER}</div>
  </div>`;
}
