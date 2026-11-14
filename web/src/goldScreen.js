import { useState, useMemo, useEffect } from 'preact/hooks';
import { html, Money, LineChart, Seg, Sheet, Field, NumInput, Switch, toast, Bar, SimpleBars, valid, SettingRow } from './ui.js';
import { useStore, get, set, patch, goldTotals, upsertBuy, removeBuy, addTxn, deleteTxn, updateTxn } from './store.js';
import { useLive, useHistory, priceNow, RANGES, seriesFor, stats, buySignal, seasonality, yearlyLows, bigDips, percentile, fetchNews, history } from './gold.js';
import { enablePush, isNative, isIOS, isStandalone } from './push.js';
import { T } from './copy.js';
import { num, money, pct, today, niceDate, parseNum, shortMonth, clamp } from './util.js';
import { nav } from './home.js';

export function GoldScreen() {
  const s = useStore();
  const lv = useLive();
  const hist = useHistory();
  const p = lv.price || priceNow();
  const [range, setRange] = useState('1M');
  const [sheet, setSheet] = useState(null);
  const [news, setNews] = useState(null);
  useEffect(() => { fetchNews().then(setNews); }, []);
  const g = goldTotals(s, p);
  const premium = g.avgPremium != null ? g.avgPremium : 0.1;
  const series = useMemo(() => seriesFor(range, hist, p), [range, hist.length, range === '1D' ? lv.ticks : Math.round(p || 0)]);
  const st = stats(series.pts);
  const sig = useMemo(() => buySignal(hist, p, g.avgMarket), [hist.length, Math.round((p || 0) * 2), g.avgMarket]);
  const seas = useMemo(() => seasonality(hist), [hist.length]);
  const lows = useMemo(() => yearlyLows(hist), [hist.length]);
  const dips = useMemo(() => bigDips(hist, 8).slice(0, 6), [hist.length]);
  const p5 = useMemo(() => (p ? percentile(hist, p, 1826) : null), [hist.length, Math.round(p || 0)]);
  const chg = lv.dayOpen && p ? ((p - lv.dayOpen) / lv.dayOpen) * 100 : null;
  const ago = lv.at ? Math.max(0, Math.round((Date.now() - lv.at) / 1000)) : null;
  const cheapest = [...seas].filter((x) => x.n).sort((a, b) => a.avg - b.avg).slice(0, 3);
  const goalG = s.gold.goalGrams;

  return html`<div class="screen">
    <div class="top"><div class="grow"><div class="h-title">${T.nGold}</div><div class="hint">${T.goldLive}</div></div>
      <button class=${`iconbtn ${s.gold.alertsOn ? 'on' : ''}`} onClick=${() => setSheet('alerts')}>🔔</button></div>

    <div class="card hero" style="text-align:center">
      <div class="scan" style="background:linear-gradient(to bottom,transparent,rgba(255,201,77,.08),transparent)"></div>
      <div class="label"><span class=${`livedot ${lv.price && !lv.err ? '' : 'off'}`}></span>${lv.err && !lv.price ? 'Offline: last known' : 'Live spot · zł per gram'}</div>
      <div class="ticker">${p ? num(p) : '…'}</div>
      <div class="row" style="justify-content:center;gap:10px;font-size:13px">
        ${chg != null && html`<span class=${`mono ${chg >= 0 ? 'up' : 'down'}`}>${chg >= 0 ? '▲' : '▼'} ${num(Math.abs(p - lv.dayOpen))} (${pct(chg, 2)})</span><span class="hint">vs yesterday's NBP price</span>`}
      </div>
      <div class="hint" style="margin-top:6px">${lv.usdOz ? `$${num(lv.usdOz)}/oz · ` : ''}${ago != null ? `updated ${ago}s ago` : 'connecting…'} · refreshes every second</div>
      <div class="sep"></div>
      <div class="row between" style="font-size:13px">
        <span class="dim">Shop price estimate<div class="hint">spot + your ${num(premium * 100, 1)}% premium</div></span>
        <span class="mono gold" style="font-weight:800;font-size:18px">${p ? num(p * (1 + premium)) + ' zł' : '…'}</span>
      </div>
    </div>

    ${sig && html`<div class=${`signal ${sig.level}`} style="margin-bottom:12px">
      <div class="row between"><b style="font-size:16px">${sig.level === 'good' ? T.buyGood : sig.level === 'ok' ? T.buyOk : T.buyWait}</b></div>
      <div class="gauge"><i style=${{ left: `${clamp(100 - ((sig.score + 3) / 8) * 100, 3, 97)}%` }}></i></div>
      <div class="row between hint"><span>Cheap</span><span>Pricey</span></div>
      <div style="margin-top:10px;display:flex;flex-direction:column;gap:6px">
        ${sig.reasons.map((r) => html`<div style="font-size:13px"><span class=${r.good ? 'up' : r.good === false ? 'down' : 'gold'}>${r.good ? '✔' : r.good === false ? '✖' : '●'}</span> ${r.text}</div>`)}
        ${p5 != null && html`<div style="font-size:13px"><span class="cyan">◆</span> Over 5 years, gold was cheaper than today on ${p5.toFixed(0)}% of days</div>`}
      </div>
      <div class="note" style="margin-top:8px">Based on price history only. A guide, not financial advice.</div>
    </div>`}

    <div class="card">
      <${Seg} options=${RANGES.map(([k]) => [k, k])} value=${range} onChange=${setRange} />
      <div style="margin-top:10px"><${LineChart} pts=${series.pts} time=${series.time} color="#a87414" fmt=${(v) => num(v) + ' zł/g'} refLine=${g.avgMarket || null} /></div>
      ${g.avgMarket ? html`<div class="hint"><span class="cyan">- - -</span> market price at your buys (${num(g.avgMarket)} zł) · <span class="up">●</span> low · <span class="down">●</span> high</div>` : html`<div class="hint"><span class="up">●</span> lowest · <span class="down">●</span> highest</div>`}
      ${st && html`<div class="stat3" style="margin-top:10px">
        <div><div class="l">Low</div><div class="v up">${num(st.lo[1])}</div><div class="d">${fmtT(st.lo[0], series.time)}</div></div>
        <div><div class="l">High</div><div class="v down">${num(st.hi[1])}</div><div class="d">${fmtT(st.hi[0], series.time)}</div></div>
        <div><div class="l">Change</div><div class=${`v ${st.change >= 0 ? 'up' : 'down'}`}>${pct(st.changePct)}</div><div class="d">${range}</div></div>
      </div>`}
      ${range === '1D' && series.pts.length < 5 && html`<div class="note" style="margin-top:8px">The 1-day chart builds while the app is open. Older ranges use the official NBP price.</div>`}
    </div>

    <div class="sect"><span class="h-title">Your gold 🪙</span><button class="more" onClick=${() => setSheet({ buy: {} })}>＋ ${T.boughtGold}</button></div>
    <div class="card">
      ${g.grams ? html`
        <div class="row between"><div><div class="hint">You own</div><div class="mono gold" style="font-size:26px;font-weight:700">${num(g.grams, 2)} g</div></div>
          <div style="text-align:right"><div class="hint">Worth now (spot)</div><div style="font-size:20px;font-weight:800"><${Money} v=${g.value} /></div></div></div>
        <div class="sep"></div>
        <div class="kv">
          <span>You paid in total</span><${Money} v=${g.paid} />
          <span>Avg you paid / g</span><${Money} v=${g.avgPaid} />
          <span>Avg market price / g at purchase</span><${Money} v=${g.avgMarket} />
          <span>Avg shop premium</span><span>${g.avgPremium != null ? num(g.avgPremium * 100, 1) + '%' : '—'}</span>
          <span>Profit / loss vs what you paid</span><${Money} v=${g.pl} sign cls=${g.pl >= 0 ? 'up' : 'down'} />
          <span>If you sold back (~${s.gold.sellSpread}% below spot)</span><${Money} v=${g.value * (1 - s.gold.sellSpread / 100) - g.paid} sign cls=${g.value * (1 - s.gold.sellSpread / 100) - g.paid >= 0 ? 'up' : 'down'} />
        </div>
        ${goalG > 0 && html`<div style="margin-top:12px"><div class="row between hint"><span>Goal: ${num(goalG, 0)} g</span><span>${Math.round((g.grams / goalG) * 100)}%</span></div><${Bar} v=${g.grams / goalG} cls="gold" /></div>`}
      ` : html`<div class="empty"><span class="e">🪙</span>No gold logged yet.<div style="margin-top:12px"><button class="btn goldbtn" onClick=${() => setSheet({ buy: {} })}>${T.boughtGold}</button></div></div>`}
    </div>
    ${s.gold.buys.length > 0 && html`<div class="card" style="padding:4px 12px">
      ${[...s.gold.buys].sort((a, b) => b.date.localeCompare(a.date)).map((b) => {
        const now = p ? (p - b.paid) / b.paid * 100 : 0;
        return html`<button class="item" onClick=${() => setSheet({ buy: b })}>
          <span class="em">🪙</span>
          <div class="grow"><div class="t1">${num(b.g, 2)} g at ${num(b.paid)} zł/g</div><div class="t2">${niceDate(b.date)} · market was ${num(b.market || 0)} · premium ${b.market ? num(((b.paid - b.market) / b.market) * 100, 1) + '%' : '—'}</div></div>
          <span class=${`amt mono ${now >= 0 ? 'up' : 'down'}`}>${pct(now)}</span>
        </button>`;
      })}
    </div>`}

    <div class="sect"><span class="h-title">Gold news</span><button class="more" onClick=${() => nav('news')}>All news →</button></div>
    <div class="card" style="padding:6px 14px"><${NewsList} news=${news} max=${3} /></div>

    <div class="sect"><span class="h-title">When was it cheapest?</span></div>
    ${cheapest.length > 0 && html`<div class="card">
      <b>Historically cheaper months</b>
      <div class="hint" style="margin-bottom:8px">How each month's average price compared with its year (${seas[0].n} full years of NBP data). Green = cheaper than usual.</div>
      <${SimpleBars} rows=${seas.map((x) => ({ v: x.avg, label: shortMonth(x.m)[0] + shortMonth(x.m)[1], hl: cheapest.includes(x) }))} />
      <div style="font-size:13px;margin-top:6px">Usually cheapest: ${cheapest.map((c) => html`<span class="tag up" style="margin:2px">${shortMonth(c.m)} ${pct(c.avg)}</span>`)}</div>
      <div class="note" style="margin-top:6px">Gold has mostly risen year after year, so early months often look "cheap". Patterns don't always repeat.</div>
    </div>`}
    ${dips.length > 0 && html`<div class="card">
      <b>Biggest dips: the best times to have bought</b>
      <div class="list" style="margin-top:6px">${dips.map((d) => html`<div class="item">
        <span class="em">📉</span>
        <div class="grow"><div class="t1">−${d.pct.toFixed(1)}% ${d.ongoing ? html`<span class="tag watch">ongoing</span>` : ''}</div>
          <div class="t2">${niceDate(d.peak[0])} ${num(d.peak[1])} → ${niceDate(d.trough[0])} ${num(d.trough[1])} zł</div></div>
      </div>`)}</div>
    </div>`}
    ${lows.length > 0 && html`<div class="card">
      <b>Lowest & highest price each year</b>
      <div class="list" style="margin-top:6px">${lows.map((y) => html`<div class="item" style="padding:8px 2px">
        <span class="mono" style="width:48px;font-weight:700">${y.y}</span>
        <div class="grow t2"><span class="up">▼ ${num(y.lo[1])}</span> ${niceDate(y.lo[0]).replace(' ' + y.y, '')} · <span class="down">▲ ${num(y.hi[1])}</span> ${niceDate(y.hi[0]).replace(' ' + y.y, '')}</div>
      </div>`)}</div>
      <div class="note">NBP official gold price (zł per gram), since 2013.</div>
    </div>`}

    ${sheet === 'alerts' && html`<${AlertSheet} onClose=${() => setSheet(null)} price=${p} />`}
    ${sheet && sheet.buy && html`<${BuySheet} buy=${sheet.buy} price=${p} onClose=${() => setSheet(null)} />`}
  </div>`;
}

const fmtT = (t, time) => { const d = new Date(t); return time ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString([], { day: 'numeric', month: 'short', year: '2-digit' }); };

export function NewsList({ news, max = 50 }) {
  if (!news) return html`<div class="empty" style="padding:16px">Loading news…</div>`;
  if (!news.items || !news.items.length) return html`<div class="empty" style="padding:16px">No news right now.</div>`;
  return news.items.slice(0, max).map((n) => html`<a class="news" href=${n.link} target="_blank" rel="noopener">
    <div class="row" style="gap:6px;margin-bottom:4px">
      <span class=${`tag ${n.impact}`}>${n.impact === 'up' ? '▲ may rise' : n.impact === 'down' ? '▼ may fall' : '● watch'}</span>
      <span class="hint">${n.source} · ${agoStr(n.date)}</span>
    </div>
    <div style="font-weight:600;font-size:14px">${n.title}</div>
    ${n.why && html`<div class="hint" style="margin-top:2px">${n.why}</div>`}
  </a>`);
}
export const agoStr = (d) => { const m = Math.round((Date.now() - Date.parse(d)) / 60000); return m < 60 ? `${Math.max(1, m)}m ago` : m < 1440 ? `${Math.round(m / 60)}h ago` : `${Math.round(m / 1440)}d ago`; };

export function NewsScreen() {
  const [news, setNews] = useState(null);
  useEffect(() => { fetchNews().then((n) => setNews(n || { items: [] })); }, []);
  const up = news && news.items ? news.items.filter((n) => n.impact === 'up').length : 0;
  const down = news && news.items ? news.items.filter((n) => n.impact === 'down').length : 0;
  const mood = up > down * 1.3 ? ['up', 'News leans positive: things that usually push gold up'] : down > up * 1.3 ? ['down', 'News leans negative: things that usually pull gold down'] : ['watch', 'Mixed news'];
  return html`<div>
    ${news && news.items && news.items.length > 0 && html`<div class=${`signal ${mood[0] === 'up' ? 'good' : mood[0] === 'down' ? 'wait' : 'ok'}`} style="margin-bottom:12px">
      <b>${mood[1]}</b>
      <div class="row" style="gap:6px;margin-top:8px"><span class="tag up">▲ ${up}</span><span class="tag down">▼ ${down}</span><span class="tag watch">● ${news.items.length - up - down}</span><span class="hint">last ${news.hours || 48}h</span></div>
      <div class="note" style="margin-top:6px">Tags are automatic, based on keywords (rate cuts, war, dollar…). News moves gold, but nobody can predict it for sure.</div>
    </div>`}
    <div class="card" style="padding:6px 14px"><${NewsList} news=${news} /></div>
    ${news && news.updated && html`<div class="hint" style="text-align:center">Updated ${agoStr(news.updated)} · Google News</div>`}
  </div>`;
}

function AlertSheet({ onClose, price }) {
  const s = useStore();
  const g = s.gold;
  const [below, setBelow] = useState(g.below ? String(g.below) : '');
  const [status, setStatus] = useState(null);
  const save = () => { patch('gold', { below: valid(below) ? parseNum(below) : null }); toast('Alerts saved', '🔔'); };
  const turnOn = async () => {
    setStatus('…');
    const r = await enablePush();
    setStatus(r);
    if (r === 'ok') toast('Notifications on 🔔', '✅');
  };
  const msg = { 'install-first': 'On iPhone, first add the app to your Home Screen (Share → Add to Home Screen), then open it from there and tap this again.', unsupported: 'This browser can\'t do background alerts.', denied: 'Notifications were blocked. Allow them in Settings → Notifications.', 'relay-failed': 'Saved on the phone but couldn\'t reach the alert server. I\'ll retry automatically.', '…': 'Setting up…' };
  return html`<${Sheet} title="🔔 Gold alerts" onClose=${onClose}>${(close) => html`
    <${SettingRow} title="Gold alerts" hint="Price drops & big moves"><${Switch} on=${g.alertsOn} onChange=${(v) => patch('gold', { alertsOn: v })} /><//>
    <${Field} label="Ping me when price per gram falls below">
      <${NumInput} value=${below} onInput=${setBelow} placeholder=${price ? (price * 0.98).toFixed(0) : '480'} />
      ${price && html`<div class="chips" style="margin-top:8px">${[1, 2, 3, 5].map((d) => html`<button class="chip" onClick=${() => setBelow((price * (1 - d / 100)).toFixed(0))}>−${d}% (${(price * (1 - d / 100)).toFixed(0)})</button>`)}</div>`}
    <//>
    <${Field} label="Also alert on a drop within 24h of"><div class="chips">${[1, 1.5, 2, 3, 5].map((d) => html`<button class=${`chip gold ${g.dropPct === d ? 'on' : ''}`} onClick=${() => patch('gold', { dropPct: d })}>${d}%</button>`)}<button class=${`chip ${!g.dropPct ? 'on' : ''}`} onClick=${() => patch('gold', { dropPct: null })}>Off</button></div><//>
    <${SettingRow} title="News alerts" hint="Big headlines that could move gold"><${Switch} on=${g.newsOn} onChange=${(v) => patch('gold', { newsOn: v })} /><//>
    <${Field} label="Gold goal (grams)"><${NumInput} value=${g.goalGrams ? String(g.goalGrams) : ''} onInput=${(v) => patch('gold', { goalGrams: parseNum(v) || 0 })} placeholder="e.g. 10" /><//>
    <div class="card" style="margin-top:6px">
      <b>Alerts when the app is closed</b>
      <div class="note" style="margin:6px 0 10px">${isNative() ? 'The Android app checks gold in the background about every 15 minutes.' : isIOS() ? 'On iPhone, an online helper checks gold about every 10 minutes and pings you.' : 'An online helper checks gold about every 10 minutes and pings you.'}</div>
      <button class=${`btn block ${s.settings.alertsSetup ? '' : 'primary'}`} onClick=${turnOn}>${s.settings.alertsSetup ? '✅ Notifications on. Tap to re-check' : '🔔 Turn on notifications'}</button>
      ${status && status !== 'ok' && html`<div class="note warn" style="margin-top:8px">${msg[status] || status}</div>`}
    </div>
    <button class="btn primary block" style="margin-top:8px" onClick=${() => { save(); close(); }}>Save</button>
  `}<//>`;
}

function BuySheet({ buy, price, onClose }) {
  const s = useStore();
  const edit = !!buy.id;
  const [date, setDate] = useState(buy.date || today());
  const [g, setG] = useState(buy.g ? String(buy.g) : '');
  const [mode, setMode] = useState('pg');
  const [paid, setPaid] = useState(buy.paid ? String(buy.paid) : '');
  const [market, setMarket] = useState(buy.market ? String(buy.market) : price ? price.toFixed(2) : '');
  const [from, setFrom] = useState(edit ? (s.txns.find((t) => t.id === buy.txn) || {}).from || null : null);
  const [note, setNote] = useState(buy.note || '');
  // auto-fill market price from NBP for past dates
  useEffect(() => {
    if (edit) return;
    if (date === today()) { if (price) setMarket(price.toFixed(2)); return; }
    const h = history.data; let best = null;
    for (const x of h) { if (x[0] <= date) best = x; else break; }
    if (best) setMarket(String(best[1]));
  }, [date]);
  const grams = parseNum(g);
  const perGram = mode === 'pg' ? parseNum(paid) : parseNum(paid) / grams;
  const ok = valid(g) && Number.isFinite(perGram) && perGram > 0;
  const prem = ok && valid(market) ? ((perGram - parseNum(market)) / parseNum(market)) * 100 : null;
  const save = (close) => {
    const total = +(grams * perGram).toFixed(2);
    let txn = buy.txn;
    if (txn && !from) { deleteTxn(txn); txn = null; }
    else if (txn && from) updateTxn(txn, { amt: total, from, date });
    else if (!txn && from) txn = addTxn({ t: 'gold', amt: total, from, date, note: `${num(grams, 2)} g gold` }).id;
    upsertBuy({ ...(edit ? { id: buy.id } : {}), date, g: grams, paid: +perGram.toFixed(2), market: valid(market) ? parseNum(market) : null, note, txn });
    toast(edit ? 'Updated' : `${num(grams, 2)} g gold added`, '✓');
    close();
  };
  return html`<${Sheet} title=${edit ? 'Edit gold buy' : '🪙 ' + T.boughtGold} onClose=${onClose}>${(close) => html`
    <div class="row" style="gap:8px">
      <div style="flex:1"><${Field} label="Grams"><${NumInput} value=${g} onInput=${setG} autofocus placeholder="1" /><//></div>
      <div style="flex:1"><${Field} label="Date"><input class="input" type="date" value=${date} onInput=${(e) => setDate(e.target.value || today())} /><//></div>
    </div>
    <${Field} label="What you paid (bought at)">
      <div style="margin-bottom:8px"><${Seg} options=${[['pg', 'per gram'], ['total', 'total']]} value=${mode} onChange=${setMode} /></div>
      <${NumInput} value=${paid} onInput=${setPaid} placeholder=${mode === 'pg' ? '544' : '1072'} />
    <//>
    <${Field} label="Market price per gram that day (actual price)"><${NumInput} value=${market} onInput=${setMarket} /><div class="hint" style="margin:4px">Filled in automatically (live today, NBP for past dates). Change it if your receipt says otherwise.</div><//>
    ${prem != null && html`<div class="card" style="padding:12px"><div class="kv"><span>Total paid</span><span>${money(grams * perGram)}</span><span>Premium over market</span><span class=${prem > 12 ? 'down' : prem > 8 ? 'warn' : 'up'}>${num(prem, 1)}%</span></div></div>`}
    <${Field} label="Paid from (optional, deducts from that account)"><div class="chips">
      ${s.accounts.map((a) => html`<button class=${`chip ${from === a.id ? 'on' : ''}`} onClick=${() => setFrom(a.id)}>${a.icon} ${a.name}</button>`)}
      ${s.card.on && html`<button class=${`chip ${from === 'card' ? 'on' : ''}`} onClick=${() => setFrom('card')}>💳 ${s.card.name}</button>`}
      <button class=${`chip ${!from ? 'on' : ''}`} onClick=${() => setFrom(null)}>Don't deduct</button>
    </div><//>
    <${Field} label="Note"><input class="input" value=${note} onInput=${(e) => setNote(e.target.value)} placeholder="shop, coin, bar…" /><//>
    <div class="btns">
      ${edit && html`<button class="btn danger" onClick=${() => { if (confirm('Delete this purchase?')) { if (buy.txn) deleteTxn(buy.txn); removeBuy(buy.id); close(); } }}>Delete</button>`}
      <button class="btn goldbtn grow" disabled=${!ok} style=${{ opacity: ok ? 1 : 0.4 }} onClick=${() => ok && save(close)}>Save</button>
    </div>
  `}<//>`;
}
