import { useMemo, useState, useEffect } from 'preact/hooks';
import { html, Money, Bar, toast } from './ui.js';
import { useStore, patch, dailyLimit, monthStats, cardOwed, cashTotal, goldTotals, friendBalances, upcomingBills, netWorth, catOf } from './store.js';
import { useLive, priceNow, buySignal, useHistory, fetchNews } from './gold.js';
import { T, pick } from './copy.js';
import { thisYm, money, num, pct, niceDate, daysBetween, today } from './util.js';
import { TxnRow } from './activity.js';

export const nav = (r) => { location.hash = '#/' + r; };
const hello = pick(T.hello);

export function Home({ openAdd }) {
  const s = useStore();
  const lv = useLive();
  const hist = useHistory();
  const p = lv.price || priceNow();
  const dl = dailyLimit(s);
  const ms = monthStats(s, thisYm());
  const g = goldTotals(s, p);
  const nw = netWorth(s, p);
  const owed = cardOwed(s);
  const fb = [...friendBalances(s).values()];
  const owedMe = fb.filter((v) => v > 0).reduce((a, b) => a + b, 0);
  const bills = upcomingBills(s, 40);
  const soon = bills.filter((b) => daysBetween(today(), b.date) <= 3 && b.amt > 0);
  const sig = useMemo(() => buySignal(hist, p, g.avgMarket), [hist.length, Math.round((p || 0) * 2)]);
  const chg = lv.dayOpen && p ? ((p - lv.dayOpen) / lv.dayOpen) * 100 : null;
  const goal = s.goals[0];
  const [news, setNews] = useState(null);
  useEffect(() => { fetchNews().then(setNews); }, []);
  const hot = news && news.items && news.items[0];
  const recent = [...s.txns].sort((a, b) => (b.date + b.id).localeCompare(a.date + a.id)).slice(0, 5);
  const priv = s.settings.privacy;

  return html`<div class="screen">
    <div class="top">
      <img class="logo" src="icons/icon-192.png" alt="" />
      <div class="grow"><div class="brand">${T.app}</div><div class="hint">${hello}</div></div>
      <button class=${`iconbtn ${priv ? 'on' : ''}`} title=${T.discreet} onClick=${() => { patch('settings', { privacy: !priv }); toast(priv ? 'Showing everything 😳' : 'Discreet mode on. Amounts hidden 🤫', priv ? '👀' : '🙈'); }}>${priv ? '🙈' : '👀'}</button>
      <button class="iconbtn" onClick=${() => nav('settings')}>⚙️</button>
    </div>

    ${!s.settings.onboarded && html`<div class="card neon tap" onClick=${() => nav('setup')}>
      <div class="row"><span style="font-size:30px">🔞</span><div class="grow"><div style="font-weight:700">First time? Let's get you set up</div><div class="hint">Balances, card limit, monthly limit. 1 minute</div></div><span class="pink">→</span></div>
    </div>`}

    <div class="card neon hero" onClick=${() => nav(dl ? 'budget' : 'budget')}>
      <div class="scan"></div><div class="corner"></div>
      ${dl ? html`
        <div class="label">${dl.left >= 0 ? T.todayLeft : 'Over today by'}</div>
        <div class=${`big ${dl.left >= 0 ? 'glow-pink' : 'down glow-down'}`}><${Money} v=${Math.abs(dl.left)} /></div>
        <div style="margin:10px 0 6px"><${Bar} v=${dl.allowance ? dl.todaySpent / dl.allowance : 1} cls=${dl.left < 0 ? 'hot' : ''} /></div>
        <div class="row between sub"><span>${T.spentToday}: <${Money} v=${dl.todaySpent} /></span><span>${dl.daysLeft}d left · <${Money} v=${dl.monthLeft} d=${0} /></span></div>
      ` : html`
        <div class="label">${T.thisMonth}</div>
        <div class="big glow-pink"><${Money} v=${ms.spend} /></div>
        <div class="sub">${T.noBudget} →</div>
      `}
    </div>

    <div class="card goldy tap" onClick=${() => nav('gold')} style="padding:14px 16px">
      <div class="row">
        <span style="font-size:26px">🪙</span>
        <div class="grow">
          <div class="hint"><span class=${`livedot ${lv.price ? '' : 'off'}`}></span>GOLD · LIVE · per gram</div>
          <div class="row" style="gap:8px;align-items:baseline">
            <span class=${`mono glow-gold gold ${lv.dir > 0 ? 'ticker flash-up' : lv.dir < 0 ? 'ticker flash-down' : ''}`} key=${lv.ticks} style="font-size:24px;font-weight:800">${p ? num(p) + ' zł' : '…'}</span>
            ${chg != null && html`<span class=${`mono ${chg >= 0 ? 'up' : 'down'}`} style="font-size:13px">${chg >= 0 ? '▲' : '▼'} ${pct(chg, 2)}</span>`}
          </div>
        </div>
        ${sig && html`<span class=${`tag ${sig.level === 'good' ? 'up' : sig.level === 'wait' ? 'down' : 'watch'}`}>${sig.level === 'good' ? 'Buy 🍆' : sig.level === 'wait' ? 'Wait' : 'Fair'}</span>`}
      </div>
    </div>

    ${soon.map((b) => html`<div class="card tap" style="border-color:rgba(255,184,77,.4);padding:12px 16px" onClick=${() => nav(b.kind === 'card' ? 'card' : 'bills')}>
      <div class="row"><span style="font-size:20px">⏰</span><div class="grow"><b>${b.name}</b><div class="hint">${niceDate(b.date)}${b.date === today() ? '. Due today!' : ''}</div></div><${Money} v=${b.amt} cur=${b.cur} cls="warn" /></div>
    </div>`)}

    <div class="sect"><span class="h-title">The Menu 🔞</span><span class="hint">tap anything</span></div>
    <div class="tiles">
      <${Tile} ic="🧾" nm=${T.nActivity} hint="All spending" val=${html`<${Money} v=${ms.spend} />`} sub=${`${ms.count} this month`} accent="#ff2e88" go="activity" />
      <${Tile} ic="💳" nm=${T.card} hint=${T.cardHint} val=${s.card.limit ? html`<${Money} v=${s.card.limit - owed} />` : 'Set limit'} sub=${s.card.limit ? 'available' : ''} accent="#a35cff" go="card" />
      <${Tile} ic="💰" nm=${T.accounts} hint=${T.accountsHint} val=${html`<${Money} v=${cashTotal(s)} />`} sub=${`${s.accounts.length} places`} accent="#38e8ff" go="accounts" />
      <${Tile} ic="🪙" nm=${T.nGold} hint="Your gold" val=${g.grams ? html`<${Money} v=${g.value} />` : 'No gold yet'} sub=${g.grams ? `${num(g.grams, 2)} g` : ''} accent="#ffc94d" go="gold" />
      <${Tile} wide ic="👑" nm=${T.netWorth} hint="Everything you own minus what you owe" val=${html`<${Money} v=${nw.total} />`} sub=${'cash + gold + owed to you − debts'} accent="#2bffa3" go="wealth" />
      <${Tile} ic="🤝" nm=${T.friends} hint=${T.friendsHint} val=${html`<${Money} v=${owedMe} />`} sub="owed to you" accent="#ff7ab8" go="friends" />
      <${Tile} ic="🎯" nm=${T.goals} hint=${T.goalsHint} val=${goal ? `${Math.round((goal.saved / goal.target) * 100 || 0)}%` : 'Add a goal'} sub=${goal ? goal.name : ''} accent="#e0ff4d" go="goals" />
      <${Tile} ic="🔁" nm=${T.bills} hint=${T.billsHint} val=${bills[0] ? niceDate(bills[0].date) : 'None yet'} sub=${bills[0] ? bills[0].name : ''} accent="#ff7a45" go="bills" />
      <${Tile} ic="🗞️" nm=${T.news} hint=${T.newsHint} val=${hot ? (hot.impact === 'up' ? '▲ may rise' : hot.impact === 'down' ? '▼ may fall' : '● watch') : '…'} sub=${hot ? hot.title : ''} accent="#38e8ff" go="news" />
    </div>
    <div class="tiles three" style="margin-top:10px">
      <${Tile} small ic="⛓️" nm="Limits" hint="Budgets" accent="#ff2e88" go="budget" />
      <${Tile} small ic="📊" nm="History" hint="Months" accent="#a35cff" go="history" />
      <${Tile} small ic="🌅" nm="Morning After" hint="Summary" accent="#ffc94d" go="summary" />
      <${Tile} small ic="🕋" nm="Zakat" hint="Calculator" accent="#2bffa3" go="zakat" />
      <${Tile} small ic="💱" nm="Exchange" hint="Converter" accent="#38e8ff" go="convert" />
      <${Tile} small ic="🛡️" nm="Protection" hint="Backup" accent="#ff7ab8" go="backup" />
    </div>

    <div class="sect"><span class="h-title">Latest action</span><button class="more" onClick=${() => nav('activity')}>See all →</button></div>
    <div class="card" style="padding:6px 12px">
      ${recent.length ? recent.map((t) => html`<${TxnRow} t=${t} s=${s} />`) : html`<div class="empty"><span class="e">🍑</span>${T.empty}<div style="margin-top:12px"><button class="btn primary" onClick=${() => openAdd('exp')}>${T.addExp}</button></div></div>`}
    </div>
  </div>`;
}

function Tile({ ic, nm, hint, val, sub, accent, go, wide, small }) {
  return html`<button class=${`tile ${wide ? 'wide' : ''} ${small ? 'small' : ''}`} style=${{ '--accent': accent }} onClick=${() => nav(go)}>
    <div class="ic">${ic}</div>
    <div>
      <div class="nm">${nm}</div>
      ${val != null && html`<div class="val">${val}</div>`}
      <div class="hint" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${sub || hint}</div>
    </div>
  </button>`;
}
