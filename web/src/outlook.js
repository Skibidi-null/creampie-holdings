// Gold outlook, live drivers, early warnings, event calendar, 55-year history, and a plain guide.
import { useState, useMemo, useEffect } from 'preact/hooks';
import { html } from './ui.js';
import { Icon } from './icons.js';
import { useMarket, drivers, outlook, liveSignals, spark, zlotyEffect, playbook as PB, setFast } from './market.js';
import { eventPlaybook } from './signals.js';
import { num } from './util.js';

const sign = (v, d = 2) => { if (v == null || !Number.isFinite(v)) return '-'; const r = Math.abs(v).toFixed(d); return (+r === 0 ? '' : v > 0 ? '+' : '−') + r; };
const effTxt = (e) => (e >= 2 ? 'Strong push up' : e === 1 ? 'Pushing up' : e === -1 ? 'Pushing down' : e <= -2 ? 'Strong push down' : 'Neutral');
const effCls = (e) => (e > 0 ? 'up' : e < 0 ? 'down' : 'flat');
const localTime = (t) => new Date(t).toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

export function useMarketScreen() {
  useEffect(() => { setFast(true); return () => setFast(false); }, []);
  return useMarket();
}

export function Spark({ pts, w = 84, h = 28, color }) {
  if (!pts || pts.length < 3) return html`<svg width=${w} height=${h}></svg>`;
  let lo = Infinity, hi = -Infinity; for (const p of pts) { if (p[1] < lo) lo = p[1]; if (p[1] > hi) hi = p[1]; }
  const x0 = pts[0][0], x1 = pts.at(-1)[0];
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${(((p[0] - x0) / (x1 - x0 || 1)) * (w - 2) + 1).toFixed(1)},${((1 - (p[1] - lo) / (hi - lo || 1)) * (h - 4) + 2).toFixed(1)}`).join('');
  const c = color || (pts.at(-1)[1] >= pts[0][1] ? 'var(--up)' : 'var(--down)');
  return html`<svg width=${w} height=${h} viewBox=${`0 0 ${w} ${h}`} class="spark"><path d=${d} fill="none" stroke=${c} stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}

// ---------- outlook card ----------
export function OutlookCard({ price, compact }) {
  const m = useMarket();
  const ds = useMemo(() => drivers(), [m.ticks]);
  const o = useMemo(() => outlook(ds, price), [ds, Math.round(price || 0)]);
  const ready = Object.keys(m.q).length > 3;
  if (!ready) return html`<div class="card"><div class="hint">Loading market data…</div></div>`;
  const Row = ({ t, v }) => html`<div class="ol-row">
    <div class="ol-h"><span class="hint">${t}</span><span class=${`pill-dir ${v.dir}`}><${Icon} n=${v.dir === 'up' ? 'up' : v.dir === 'down' ? 'down' : 'flat'} size=${15} sw=${2.2} />${v.label}</span></div>
    <div class="meter"><i style=${{ left: `${Math.max(3, Math.min(97, 50 + v.score * 50))}%` }}></i></div>
    ${v.range && html`<div class="ol-range">Likely range: <b class="mono">${num(v.range.lo)} to ${num(v.range.hi)} zł/g</b> <span class="hint">(about 2 in 3 chance)</span></div>`}
    <div class="hint">Confidence: ${v.confLabel}${v.top.length ? ' · Main reasons: ' + v.top.map((d) => `${d.name.toLowerCase()} (${effTxt(v === o.days ? d.fx : d.fm).toLowerCase()})`).join(', ') : ''}</div>
  </div>`;
  return html`<div class="card">
    <div class="row between"><b>Gold outlook</b><span class="hint">from ${ds.length} live factors</span></div>
    <${Row} t="Next few days" v=${o.days} />
    <div class="sep"></div>
    <${Row} t="Next 1 to 3 months" v=${o.weeks} />
    ${!compact && html`<div class="note" style="margin-top:10px">This is a rough lean, not a promise. It adds up the factors below that historically move gold. Nobody can predict gold reliably: a surprise headline can flip it within minutes.</div>`}
  </div>`;
}

// ---------- early warnings ----------
export function Signals({ max = 10, empty = true }) {
  const m = useMarket();
  const list = useMemo(() => liveSignals(), [m.ticks]);
  if (!list.length) return empty ? html`<div class="card calm"><div class="row"><${Icon} n="pulse" cls="up" /><div class="grow"><b>No warnings right now</b><div class="hint">Nothing unusual in rates, the dollar, stocks or fear today. Checked every few seconds.</div></div></div></div>` : null;
  return html`<div class="signals">${list.slice(0, max).map((s) => html`<div class=${`sig ${s.level} ${s.dir}`}>
    <div class="row" style="gap:8px;align-items:flex-start">
      <span class="sig-ic"><${Icon} n=${s.dir === 'up' ? 'up' : s.dir === 'down' ? 'down' : s.id.startsWith('ev-') ? 'calendar' : 'alert'} size=${18} sw=${2} /></span>
      <div class="grow">
        <div class="sig-t">${s.title}${s.when ? html` <span class="hint">· ${localTime(s.when)}</span>` : ''}</div>
        <div class="sig-b">${s.body}</div>
        <div class="sig-tag">${s.dir === 'up' ? 'Usually good for gold' : s.dir === 'down' ? 'Usually bad for gold' : 'Could move gold sharply'}${s.level === 'high' ? ' · important' : ''}</div>
      </div>
    </div>
  </div>`)}</div>`;
}

// ---------- drivers list ----------
export function Drivers() {
  const m = useMarket();
  const ds = useMemo(() => drivers(), [m.ticks]);
  const z = zlotyEffect();
  const [open, setOpen] = useState(null);
  const age = m.qAt ? Math.round((Date.now() - m.qAt) / 1000) : null;
  const ch = (d, v) => (v == null ? '-' : d.kind === 'pt' ? sign(v) + ' pt' : sign(v, 1) + '%');
  return html`<div>
    <div class="hint" style="margin:0 4px 10px"><span class=${`livedot ${m.err ? 'off' : ''}`}></span>${m.err ? 'Offline, showing last data' : `Live · updated ${age != null ? age + 's' : '…'} ago · refreshes every 5 seconds`}</div>
    ${ds.map((d) => html`<div class="card drv" onClick=${() => setOpen(open === d.key ? null : d.key)}>
      <div class="row" style="align-items:flex-start">
        <div class="grow">
          <div class="drv-n">${d.name}</div>
          <div class="hint">${d.sub}</div>
        </div>
        ${d.sym && html`<${Spark} pts=${spark(d.sym, 90)} color=${d.key === 'trend' ? 'var(--gold)' : 'var(--mute)'} />`}
      </div>
      ${d.v != null && d.kind !== 'none' && html`<div class="drv-nums">
        <span class="mono drv-v">${d.unit === '$' ? '$' + num(d.v, d.v > 1000 ? 0 : 2) : num(d.v, 2) + (d.unit === '%' ? '%' : '')}</span>
        ${d.kind !== 'fear' && html`<span class="hint">today <b class="mono">${ch(d, d.d)}</b></span><span class="hint">week <b class="mono">${ch(d, d.w)}</b></span><span class="hint">month <b class="mono">${ch(d, d.m)}</b></span>`}
      </div>`}
      <div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap">
        <span class=${`eff ${effCls(d.fx)}`}>Days: ${effTxt(d.fx)}</span>
        <span class=${`eff ${effCls(d.fm)}`}>Months: ${effTxt(d.fm)}</span>
      </div>
      ${d.now && html`<div class="drv-now">${d.now}</div>`}
      ${d.extra && html`<div class="hint" style="margin-top:4px">${d.extra}</div>`}
      ${open === d.key ? html`<div class="drv-more">
        <div><b>Why it matters.</b> ${d.why}</div>
        ${d.hist && html`<div style="margin-top:6px"><b>History.</b> ${d.hist}</div>`}
      </div>` : html`<div class="hint" style="margin-top:6px">Tap for why it matters${d.hist ? ' and history' : ''}</div>`}
    </div>`)}
    ${z.v && html`<div class="card">
      <div class="drv-n">Złoty vs dollar</div>
      <div class="hint">USD/PLN ${z.v.toFixed(4)} · today ${sign(z.d, 2)}% · month ${sign(z.m, 1)}%</div>
      <div class="drv-now">Your gold price in zł = world gold price × this rate. When the złoty weakens, gold in zł gets more expensive even if world gold doesn't move.</div>
    </div>`}
  </div>`;
}

// ---------- event calendar ----------
export function Calendar() {
  const m = useMarket();
  const now = Date.now();
  const ev = (m.cal || []).filter((e) => (e.country === 'USD' && e.impact !== 'Low') || (e.impact === 'High' && ['EUR', 'CNY'].includes(e.country))).filter((e) => Date.parse(e.date) > now - 12 * 3600e3);
  if (!m.news) return html`<div class="card hint">Loading calendar…</div>`;
  if (!ev.length) return html`<div class="card"><b>No big events left this week</b><div class="hint">Next week's calendar appears on Sunday/Monday.</div></div>`;
  let lastDay = '';
  return html`<div>
    <div class="note" style="margin:0 4px 10px">Scheduled reports that often move gold. Times are your local time. Red = high impact.</div>
    <div class="card" style="padding:4px 14px">
    ${ev.map((e) => {
      const t = Date.parse(e.date); const day = new Date(t).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' });
      const head = day !== lastDay ? html`<div class="cal-day">${day}</div>` : ''; lastDay = day;
      const past = t < now;
      return html`${head}<details class=${`cal ${past ? 'past' : ''}`}>
        <summary class="row" style="gap:10px">
          <span class=${`imp ${e.impact.toLowerCase()}`}></span>
          <span class="mono hint" style="width:44px">${new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })}</span>
          <span class="grow"><span style="font-weight:600">${e.title}</span> <span class="hint">${e.country}</span></span>
        </summary>
        <div class="cal-more">${e.forecast && html`<div class="hint">Forecast ${e.forecast}${e.previous ? ` · previous ${e.previous}` : ''}</div>`}${eventPlaybook(e.title)}</div>
      </details>`;
    })}
    </div>
  </div>`;
}

// ---------- 55 years of history ----------
const Stat = ({ label, s, h = 'h6' }) => s && s[h] ? html`<div class="hrow">
  <div class="grow">${label}<div class="hint">${s.n} ${s.n === 1 ? 'case' : 'months'}</div></div>
  <div class="hcell"><b class=${s.h3.avg >= PB.base.h3.avg ? 'up' : 'down'}>${sign(s.h3.avg, 1)}%</b><span class="hint">${s.h3.up}% up</span></div>
  <div class="hcell"><b class=${s.h12.avg >= PB.base.h12.avg ? 'up' : 'down'}>${sign(s.h12.avg, 1)}%</b><span class="hint">${s.h12.up}% up</span></div>
</div>` : null;

export function HistoryLessons() {
  const f = (m) => { const [y, mo] = m.split('-'); return new Date(+y, +mo - 1, 1).toLocaleDateString([], { month: 'short', year: 'numeric' }); };
  return html`<div>
    <div class="card">
      <b>What gold did next, since ${PB.from.slice(0, 4)}</b>
      <div class="hint" style="margin:4px 0 10px">${PB.years} years of monthly data. Gold went from $${PB.start} to $${num(PB.end, 0)} an ounce (+${PB.cagr}% a year on average). Green = better than an average month, red = worse.</div>
      <div class="hrow head"><div class="grow hint">After…</div><div class="hcell hint">3 months</div><div class="hcell hint">12 months</div></div>
      <${Stat} label="Any month (normal)" s=${PB.base} />
      <div class="hsec">Interest rates</div>
      <${Stat} label="Real rates fell 1+ pt" s=${PB.real.falling} />
      <${Stat} label="Real rates rose 1+ pt" s=${PB.real.rising} />
      <${Stat} label="Real rates below zero" s=${PB.real.negative} />
      <${Stat} label="Real rates above 2%" s=${PB.real.high} />
      <${Stat} label="First Fed cut of a cycle" s=${PB.fed.firstCut} />
      <${Stat} label="First Fed hike of a cycle" s=${PB.fed.firstHike} />
      <${Stat} label="Fed cutting" s=${PB.fed.cutting} />
      <${Stat} label="Fed hiking" s=${PB.fed.hiking} />
      <div class="hsec">Dollar & inflation</div>
      <${Stat} label="Dollar fell 4%+ in 3 months" s=${PB.usd.falling} />
      <${Stat} label="Dollar rose 4%+ in 3 months" s=${PB.usd.rising} />
      <${Stat} label="Inflation rising" s=${PB.infl.rising} />
      <${Stat} label="Inflation above 5%" s=${PB.infl.hot} />
      <${Stat} label="Inflation below 2%" s=${PB.infl.low} />
      <div class="hsec">Stocks</div>
      <${Stat} label="Stocks fell 4%+ in a month" s=${PB.stocks.bad} />
      <div class="note" style="margin-top:10px">Same month: when the dollar rose over 1%, gold fell ${100 - PB.usd.sameUp.up}% of the time. When the dollar fell over 1%, gold rose ${PB.usd.sameDown.up}% of the time. That's the most reliable day-to-day link.</div>
      <div class="note" style="margin-top:6px">Surprise: Fed hiking months were not bad for gold on their own, because hikes usually happen when inflation is high. What hurts gold is rates rising FASTER than inflation (real rates).</div>
    </div>

    <div class="card">
      <b>Stock crashes: gold sold first, recovered later</b>
      <div class="hint" style="margin:4px 0 8px">Months the S&P 500 fell 7%+ (monthly averages)</div>
      <div class="hrow head"><div class="grow hint">Month · stocks</div><div class="hcell hint">Gold same month</div><div class="hcell hint">Gold 12 mo later</div></div>
      ${PB.stocks.crash.slice().reverse().map((c) => html`<div class="hrow">
        <div class="grow">${f(c.m)} <span class="hint">${sign(c.spx, 1)}%</span></div>
        <div class="hcell"><b class=${c.gold >= 0 ? 'up' : 'down'}>${sign(c.gold, 1)}%</b></div>
        <div class="hcell"><b class=${c.next12 == null ? '' : c.next12 >= 0 ? 'up' : 'down'}>${c.next12 == null ? '-' : sign(c.next12, 1) + '%'}</b></div>
      </div>`)}
      ${(() => { const r = PB.stocks.crash.filter((c) => c.m >= '2000' && c.next12 != null); return html`<div class="note" style="margin-top:8px">Since 2000, gold was higher a year later in ${r.filter((c) => c.next12 > 0).length} of ${r.length} of these crash months. The worst moments (Oct 2008, Mar 2020) included a fast dip as traders sold gold to cover losses.</div>`; })()}
    </div>

    <div class="card">
      <b>Famous turning points</b>
      ${EPISODES.map((e) => html`<div class="ep"><div class="row between"><b>${e.t}</b><span class=${`mono ${e.chg.startsWith('−') ? 'down' : 'up'}`}>${e.chg}</span></div><div class="hint">${e.when}</div><div class="ep-b">${e.b}</div></div>`)}
    </div>
  </div>`;
}

const EPISODES = [
  { t: 'Volcker hikes rates to ~20%', when: '1980 → 1982', chg: '−65%', b: 'Gold peaked at $850 in Jan 1980 with inflation at 14%. The Fed raised rates far above inflation, real rates went strongly positive and gold collapsed to ~$300. It took 28 years to beat that peak.' },
  { t: 'Lehman crash: sold for cash', when: 'Mar → Oct 2008', chg: '−30%', b: 'Funds losing money on stocks sold gold for cash and the dollar surged. Then the Fed cut to zero and printed money: gold nearly tripled to $1,920 by Sep 2011.' },
  { t: 'Taper tantrum', when: 'Jan → Dec 2013', chg: '−28%', b: 'The Fed hinted it would stop printing money. Real rates jumped about 1.5 points in months and gold had its worst year in 30 years, including −13% in two days.' },
  { t: 'Covid panic, then record', when: 'Mar → Aug 2020', chg: '−12% then +40%', b: 'Gold fell 12% in 8 days in the "dash for cash". Then rates were cut to zero, real rates went deeply negative and gold hit a record $2,075 by August.' },
  { t: 'Fastest hikes in 40 years', when: 'Mar → Nov 2022', chg: '−21%', b: 'The Fed hiked from 0% to 4% in a year, the dollar hit a 20-year high and gold slid from $2,070 to $1,620. Central bank buying then started a new rally.' },
  { t: 'Central banks buy record amounts', when: '2023 → 2025', chg: '+120%', b: 'Central banks bought about 1,000 tonnes a year. Gold broke away from real rates and rose from ~$1,800 to above $4,000 for the first time in Oct 2025.' },
];

// ---------- plain guide ----------
export function Guide() {
  const Item = ({ ic, t, children }) => html`<div class="gd"><span class="gd-ic"><${Icon} n=${ic} size=${18} /></span><div class="grow"><b>${t}</b><div class="gd-b">${children}</div></div></div>`;
  return html`<div>
    <div class="card">
      <b>Who sets the gold price?</b>
      <div class="gd-b" style="margin-top:6px">London publishes the official <b>LBMA Gold Price</b> twice a day (10:30 and 15:00 London time). It's an auction between big banks and is used for contracts, but it doesn't control the market. Gold trades nonstop: in London between banks, as futures in New York (COMEX) and in Shanghai. The live price you see is what buyers and sellers agree on second by second.</div>
      <div class="gd-b" style="margin-top:6px">So it IS supply and demand, but not from mines (mine output barely changes year to year). It's demand from <b>investors, funds, traders and central banks</b>, and they react to the factors below. Your shop price = world price × USD/PLN + the shop's premium.</div>
    </div>
    <div class="card">
      <b>What moves gold, most important first</b>
      <${Item} ic="layers" t="1. Real interest rates">US bond yield minus inflation. Gold pays nothing, so when safe bonds pay well above inflation, investors swap gold for bonds. Rising = bad for gold, falling = good.<//>
      <${Item} ic="bank" t="2. The Fed (US central bank)">Rate cuts → gold up. Hikes → gold down. Markets react to what they EXPECT, so a speech hinting at cuts moves gold before any cut happens. Watch FOMC meetings, CPI and jobs reports.<//>
      <${Item} ic="globe" t="3. The US dollar">Gold is priced in dollars. Strong dollar → gold down. Weak dollar → gold up. This is the most reliable same-day link.<//>
      <${Item} ic="pulse" t="4. Inflation">High and rising inflation pushes people into gold to protect savings. But hot inflation reports can make the Fed hike, which hurts gold short-term.<//>
      <${Item} ic="alert" t="5. Fear: wars, crises, crashes">Fear sends money into gold. Exception: in a sudden crash, traders sell gold to cover stock losses (margin calls), so gold can drop for a few days first, as in 2008 and March 2020. It usually recovers within months.<//>
      <${Item} ic="bank" t="6. Central bank buying">Since 2022 central banks (China, Poland, India, Turkey…) buy record amounts to depend less on the dollar. Slow, but it keeps a floor under the price.<//>
      <${Item} ic="up" t="7. Trend & positioning">Traders follow momentum. Big runs far above the 200-day average often end with sharp pullbacks as traders take profits.<//>
      <${Item} ic="swap" t="8. For you in Poland: the złoty">Gold in zł also rises when the złoty weakens against the dollar, and falls when it strengthens.<//>
    </div>
    <div class="card">
      <b>How to use this app</b>
      <div class="gd-b" style="margin-top:6px">1. Check <b>Warnings</b> on the Today tab. They appear when something big happens (yield jump, dollar surge, stocks crash, big report coming).<br/>2. Look at the <b>Outlook</b> for the overall lean and the likely price range.<br/>3. Open <b>Drivers</b> to see which factor is pushing and why.<br/>4. Before big events (Fed, CPI, jobs), expect sharp moves. Many people wait until after the report to buy.<br/>5. For buying physical gold, the long-term trend matters more than daily moves. Buying in parts over time lowers the risk of bad timing.</div>
    </div>
  </div>`;
}

// History line for a news category (used under each headline)
export function newsHistory(cat) {
  const P = PB;
  return ({
    cut: `After the first Fed cut of a cycle, gold was higher 6 months later in ${P.fed.firstCut.h6.up}% of cases since 1971.`,
    hike: `What matters is real rates: when they rose 1+ pt, gold was up 3 months later only ${P.real.rising.h3.up}% of the time.`,
    usdDown: `When the dollar fell 1%+ in a month, gold rose ${P.usd.sameDown.up}% of the time.`,
    usdUp: `When the dollar rose 1%+ in a month, gold fell ${100 - P.usd.sameUp.up}% of the time.`,
    yieldsUp: `Rising real yields: gold up 3 months later only ${P.real.rising.h3.up}% of the time.`,
    yieldsDown: `Falling real yields: gold averaged +${P.real.falling.h3.avg}% over the next 3 months.`,
    inflUp: `When inflation was rising, gold averaged +${P.infl.rising.h12.avg}% over the next 12 months.`,
    crash: `After bad stock months, gold was higher 6 months later ${P.stocks.bad.h6.up}% of the time, but it often dips first.`,
    war: 'War news usually lifts gold quickly, but the jump often fades within weeks unless the conflict spreads (Feb 2022: gold +7% in two weeks, gone within two months).',
    peace: 'Peace news usually takes some "fear premium" out of gold within days.',
    cb: 'Central bank buying is slow but steady demand; it has supported gold since 2022.',
  })[cat] || '';
}
