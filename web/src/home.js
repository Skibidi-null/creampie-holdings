import { useMemo, useState, useEffect } from 'preact/hooks';
import { html, Money, Bar, toast } from './ui.js';
import { useStore, patch, cardProjection, dailyLimit, monthStats, cardOwed, cashTotal, goldTotals, friendBalances, upcomingBills, catOf } from './store.js';
import { useLive, priceNow, useHistory } from './gold.js';
import { T } from './copy.js';
import { thisYm, money, num, pct, niceDate, daysBetween, today, section, DISP, convert, CURS } from './util.js';
import { TxnRow } from './activity.js';
import { Icon } from './icons.js';
import { HoloCard, Gauge, Spark } from './holo.js';
import { fullNetWorth, nwSeries, recordSnapshot, dayChange } from './networth.js';
import { useCountUp, feedback } from './fx.js';
import { useTodaysCall, topTags, verdictOf, emergencyFund } from './advisor.js';
import { useAssets, nameOf } from './assets.js';
import { candles } from './data.js';
import { riskMeter, openNow, EXCHANGES, session } from './sessions.js';

export const nav = (r) => { location.hash = '#/' + r; };
const greet = () => { const h = new Date().getHours(); return h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };

export function Home({ openAdd }) {
  const s = useStore();
  section('wealth');
  const lv = useLive();
  const hist = useHistory();
  const a = useAssets();
  const p = lv.price || priceNow();
  const nw = fullNetWorth(s, p);
  useEffect(() => { if (p) recordSnapshot(nw.total); }, [Math.round(nw.total)]);
  const series = useMemo(() => nwSeries(s, hist, 90), [hist.length, s.txns.length, s.gold.buys.length, (s.nwHist || []).length]);
  const dc = dayChange(nw.total);
  const priv = s.settings.privacy;
  const disp = DISP.cur;
  const shown = convert(nw.total, 'PLN', disp);
  const anim = useCountUp(shown == null ? nw.total : shown);
  const [whole, dec] = num(anim, 2).split(',');
  const quick = ['PLN', 'AED', 'USD'].includes(disp) ? ['PLN', 'AED', 'USD'] : ['PLN', disp, 'USD'];
  const setCur = (c) => { feedback('tap'); patch('settings', { cur: c }); };

  const tc = useTodaysCall();
  const call = tc.res;
  const ef = emergencyFund(s);
  const rm = riskMeter();
  const open = openNow();
  const ny = session(EXCHANGES.find((e) => e.id === 'nyse'));

  const dl = dailyLimit(s);
  const ms = monthStats(s, thisYm());
  const g = goldTotals(s, p);
  const owed = cardOwed(s);
  const cp = cardProjection(s);
  const owedMe = [...friendBalances(s).values()].filter((v) => v > 0).reduce((x, y) => x + y, 0);
  const bills = upcomingBills(s, 40);
  const soon = bills.filter((b) => daysBetween(today(), b.date) <= 3 && b.amt > 0);
  const recent = [...s.txns].sort((x, y) => (y.date + y.id).localeCompare(x.date + x.id)).slice(0, 4);

  return html`<div class="screen stagger">
    <div class="top">
      <span class="avatar"><img src="icons/icon-192.png" alt="" /></span>
      <div class="grow"><div class="hint">${greet()}</div><div class="brand">${T.app}</div></div>
      <button class=${`iconbtn ${priv ? 'on' : ''}`} onClick=${() => { patch('settings', { privacy: !priv }); feedback('tap'); toast(priv ? 'Amounts shown' : 'Amounts hidden'); }} aria-label="Hide amounts"><${Icon} n=${priv ? 'eyeOff' : 'eye'} size=${18} sw=${1.6} /></button>
      <button class="iconbtn" onClick=${() => nav('alerts')} aria-label="Alerts"><${Icon} n="bell" size=${18} sw=${1.6} />${(s.alerts || []).some((x) => x.on) && html`<span class="dot"></span>`}</button>
    </div>

    ${!s.settings.onboarded && html`<div class="card tap" onClick=${() => nav('setup')}>
      <div class="row"><div class="grow"><div style="font-weight:600">First time? Let's set you up</div><div class="hint">Balances, card limit, monthly limit. 1 minute</div></div><${Icon} n="chevron" size=${16} cls="ice" /></div>
    </div>`}

    <${HoloCard} onClick=${(e) => { if (!e.target.closest('button')) nav('networth'); }}>
      <div class="row between"><span class="label">Net worth</span>
        <span class="curpick">${quick.map((c) => html`<button class=${disp === c ? 'on' : ''} onClick=${() => setCur(c)}>${c}</button>`)}</span></div>
      <div class=${`nw-big ${priv ? 'blur' : ''}`}>${priv ? '••••••' : html`${whole}<span class="dec">,${dec}</span> <span style="font-size:20px;color:var(--dim);font-weight:400">${disp === 'PLN' ? 'zł' : disp}</span>`}</div>
      <div class="row" style="margin-top:10px;gap:8px">
        ${dc ? html`<span class=${`delta ${dc.abs > 0.005 ? '' : dc.abs < -0.005 ? 'down' : 'flat'}`}>${dc.abs >= 0 ? '▲' : '▼'} ${priv ? '••' : money(Math.abs(dc.abs))}${dc.pct != null ? ` · ${Math.abs(dc.pct).toFixed(2)}%` : ''}</span><span class="hint">since ${niceDate(dc.since).toLowerCase()}</span>`
          : html`<span class="delta flat">Tracking daily from today</span>`}
      </div>
      <div style="margin-top:16px;height:58px"><${Spark} pts=${series} w=${318} h=${58} holo fill dot cls="nwspark" /></div>
    <//>

    <div class="qa">
      ${[['trade', 'Trade', 'markets'], ['spark', 'Advisor', 'advisor'], ['globe', 'World', 'world'], ['budget', 'Budget', 'budget']].map(([ic, nm, go]) => html`<button onClick=${() => { feedback('tap'); nav(go); }}><span class="sq"><${Icon} n=${ic} size=${21} sw=${1.7} /></span>${nm}</button>`)}
    </div>

    <div class="card tap" onClick=${() => nav(call ? 'asset/' + encodeURIComponent(call.sym) : 'advisor')} style="padding:18px">
      <div class="row top0" style="gap:16px">
        <${Gauge} score=${call ? call.score : null} size=${74} />
        <div class="grow">
          <div class="row between"><span class="label">Today's call</span><span class="mono ice" style="font-size:11.5px">Why?</span></div>
          ${call ? html`<div style="font-size:17px;font-weight:600;margin:6px 0 8px">${nameOf(call.sym)} <span class="mute" style="font-weight:400">· ${call.verdict.label}</span></div>
            <div class="tags">${topTags(call, 4).map((t) => html`<span class=${`tagx ${t.dir === 'down' ? 'down' : ''}`}>${t.text}</span>`)}</div>
            <div class="hint" style="margin-top:8px">${call.agree} of ${call.avail} signals agree · ${call.conf.toLowerCase()} confidence</div>`
          : html`<div style="font-size:15px;margin:6px 0 4px">${tc.at ? 'Not enough data for a call right now' : 'Reading the markets…'}</div><div class="hint">Scores every asset on your watchlist</div>`}
        </div>
      </div>
      ${ef && ef.low && call && call.verdict.dir > 0 && html`<div class="callout" style="margin-top:12px;font-size:12.5px">Your cash covers about ${ef.months.toFixed(1)} months of spending. Many people keep 3 to 6 months aside before investing more.</div>`}
    </div>

    <div class="minis">
      ${[['.SPX', 'S&P 500'], ['BTC-USD', 'Bitcoin'], ['EURPLN=', 'EUR/PLN']].map(([sym, nm]) => html`<${Mini} sym=${sym} nm=${nm} q=${a.q[sym]} />`)}
    </div>

    <button class="ribbon" onClick=${() => nav('world')}>
      <span class=${`dotst ${rm && rm.on ? 'on' : rm && rm.off ? '' : 'pre'}`} style=${rm && rm.off ? 'background:var(--down);box-shadow:0 0 8px var(--down)' : ''}></span>
      <span class="grow">${rm ? rm.label : 'Risk meter loading'}${a.q['.VIX'] ? ` · VIX ${a.q['.VIX'].last.toFixed(1)}` : ''} · ${open.length ? open.map((e) => e.name).slice(0, 2).join(', ') + ' open' : `New York opens in ${ny.mins != null ? Math.floor(ny.mins / 60) + 'h' : '...'}`}</span>
      <span class="go">brief</span>
    </button>

    ${soon.map((b) => html`<div class="card tap tight" style="border-color:rgba(255,181,71,.35)" onClick=${() => nav(b.kind === 'card' ? 'card' : 'bills')}>
      <div class="row"><span class="warn"><${Icon} n="clock" /></span><div class="grow"><b style="font-weight:500">${b.name}</b><div class="hint">${niceDate(b.date)}${b.date === today() ? '. Due today' : ''}</div></div><${Money} v=${b.amt} cur=${b.cur} cls="warn" /></div>
    </div>`)}

    <div class="card tap" onClick=${() => nav('budget')}>
      ${dl ? html`
        <div class="row between"><span class="label">${dl.left >= 0 ? 'You can spend today' : 'Over today by'}</span><span class="hint mono">${dl.daysLeft}d left</span></div>
        <div class=${`big-num ${dl.left >= 0 ? '' : 'down'}`} style="margin:8px 0 10px"><${Money} sec="budget" v=${Math.abs(dl.left)} /></div>
        <${Bar} v=${dl.allowance ? dl.todaySpent / dl.allowance : 1} cls=${dl.left < 0 ? 'hot' : ''} />
        <div class="row between hint" style="margin-top:8px"><span>Spent today <${Money} sec="budget" v=${dl.todaySpent} /></span><span>Month left <${Money} sec="budget" v=${dl.monthLeft} d=${0} /></span></div>
      ` : html`<div class="row between"><span class="label">Spent this month</span><${Icon} n="chevron" size=${16} cls="ice" /></div>
        <div class="big-num" style="margin-top:8px"><${Money} sec="budget" v=${ms.spend} /></div><div class="hint" style="margin-top:4px">${T.noBudget}</div>`}
    </div>

    <div class="sect"><span class="h-title">Overview</span></div>
    <div class="tiles">
      <${Tile} ic="receipt" nm="Activity" val=${html`<${Money} v=${ms.spend} />`} sub=${`${ms.count} payments this month`} go="activity" />
      <${Tile} ic="card" tone="mag" nm=${T.card} val=${s.card.limit ? html`<${Money} v=${s.card.limit - owed} />` : 'Set limit'} sub=${cp.spent > 0 ? `month pace ${s.settings.privacy ? '••' : money(cp.projected, 'PLN', 0)}` : s.card.limit ? 'available' : ''} go="card" />
      <${Tile} ic="wallet" nm=${T.accounts} val=${html`<${Money} v=${cashTotal(s)} />`} sub=${`${s.accounts.length} places`} go="accounts" />
      <${Tile} ic="coin" tone="gold" nm="Gold" val=${g.grams ? html`<${Money} v=${g.value} />` : 'No gold yet'} sub=${g.grams ? `${num(g.grams, 2)} g` : 'live price & outlook'} go="gold" />
      <${Tile} ic="pie" tone="acc" nm="Investments" val=${nw.invest ? html`<${Money} v=${nw.invest} />` : 'Add holdings'} sub=${'Trading 212, others'} go="portfolio" />
      <${Tile} ic="users" nm=${T.friends} val=${html`<${Money} v=${owedMe} />`} sub="owed to you" go="friends" />
    </div>

    <div class="sect"><span class="h-title">Recent</span><button class="more" onClick=${() => nav('activity')}>See all</button></div>
    <div class="card" style="padding:6px 14px">
      ${recent.length ? recent.map((t) => html`<${TxnRow} t=${t} s=${s} />`) : html`<div class="empty">${T.empty}<div style="margin-top:12px"><button class="btn primary" onClick=${() => openAdd('exp')}>${T.addExp}</button></div></div>`}
    </div>
  </div>`;
}

function Mini({ sym, nm, q }) {
  const [pts, setPts] = useState(null);
  useEffect(() => { let ok = true; candles(sym, '1M').then((b) => ok && setPts(b.map((x) => x.close))).catch(() => ok && setPts([])); return () => { ok = false; }; }, [sym]);
  const up = q && q.pct >= 0;
  return html`<button class="mini" onClick=${() => nav('asset/' + encodeURIComponent(sym))}>
    <div class="n">${nm}</div>
    <div class=${`p ${q ? (up ? 'up' : 'down') : 'mute'}`}>${q && q.pct != null ? pct(q.pct, 2) : '–'}</div>
    <${Spark} pts=${pts} w=${90} h=${22} color=${q ? (up ? '#3CFFB4' : '#FF5C8A') : undefined} />
  </button>`;
}

function Tile({ ic, nm, val, sub, go, wide, tone }) {
  return html`<button class=${`tile ${wide ? 'wide' : ''}`} onClick=${() => nav(go)}>
    <div class=${`ic ${tone || ''}`}><${Icon} n=${ic} size=${18} /></div>
    <div>
      <div class="nm">${nm}</div>
      ${val != null && html`<div class="val">${val}</div>`}
      <div class="hint" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${sub}</div>
    </div>
  </button>`;
}
