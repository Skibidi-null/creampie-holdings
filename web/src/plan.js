import { useState } from 'preact/hooks';
import { html, Money, Back, Sheet, Field, NumInput, Switch, Bar, Donut, Bars, Empty, toast, valid, PALETTE, SettingRow } from './ui.js';
import { useStore, patch, set, monthStats, catOf, upsert, removeFrom, upcomingBills, initialLast, curOf, CARD, txnPln, dailyLimit } from './store.js';
import { T } from './copy.js';
import { thisYm, prevYm, nextYm, monthName, money, num, parseNum, niceDate, daysBetween, today, daysInMonth, ymOf, pct } from './util.js';

const back = () => history.back();

export function CategoryBreakdown({ s, ms, max = 8 }) {
  const rows = Object.entries(ms.byCat).sort((a, b) => b[1] - a[1]);
  if (!rows.length) return html`<${Empty} text=${T.empty} />`;
  const data = rows.slice(0, max).map(([id, v], i) => ({ id, v, color: PALETTE[i % PALETTE.length] }));
  const rest = rows.slice(max).reduce((a, r) => a + r[1], 0);
  if (rest) data.push({ id: 'rest', v: rest, color: '#555' });
  return html`<div class="row" style="gap:14px;align-items:center">
    <${Donut} data=${data} size=${130} center=${['SPENT', s.settings.privacy ? '••••' : num(ms.spend, 0)]} />
    <div class="legend grow">${data.map((d) => html`<div class="li"><i class="sw" style=${{ background: d.color }}></i><span class="grow" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${d.id === 'rest' ? 'Other' : `${catOf(s, d.id).icon} ${catOf(s, d.id).name}`}</span><span class="mono dim" style="font-size:12px">${Math.round((d.v / ms.spend) * 100)}%</span></div>`)}</div>
  </div>`;
}

// ---------- budgets ----------
export function Budget() {
  const s = useStore();
  const ms = monthStats(s, thisYm());
  const dl = dailyLimit(s);
  const [monthly, setMonthly] = useState(s.budget.monthly ? String(s.budget.monthly) : '');
  const [editCat, setEditCat] = useState(null);
  const limits = Object.entries(s.budget.cats).filter(([, v]) => v > 0);
  return html`<div class="screen">
    <${Back} title=${T.budget} hint="Monthly limit & category limits" onBack=${back} />
    <div class="card">
      <${Field} label="My monthly spending limit (zł)">
        <div class="row"><${NumInput} value=${monthly} onInput=${setMonthly} placeholder="e.g. 4000" /><button class="btn primary" onClick=${() => { patch('budget', { monthly: parseNum(monthly) || 0 }); toast('Monthly limit saved'); }}>Set</button></div>
      <//>
      ${dl && html`<div class="kv" style="margin-top:6px">
        <span>Spent this month</span><${Money} v=${ms.spend} />
        <span>Left this month</span><${Money} v=${dl.monthLeft} cls=${dl.monthLeft < 0 ? 'down' : 'up'} />
        <span>Daily allowance (${dl.daysLeft} days left)</span><${Money} v=${dl.allowance} />
      </div>
      <div style="margin-top:10px"><${Bar} v=${ms.spend / dl.budget} cls=${ms.spend > dl.budget ? 'hot' : ''} /></div>`}
      <div class="note" style="margin-top:8px">Your daily limit = money left this month ÷ days left. Spend less today and tomorrow's limit grows.</div>
    </div>
    <div class="sect"><span class="h-title">This month by category</span></div>
    <div class="card"><${CategoryBreakdown} s=${s} ms=${ms} /></div>
    <div class="sect"><span class="h-title">Category limits</span><button class="more" onClick=${() => setEditCat('pick')}>＋ Add limit</button></div>
    <div class="card" style="padding:6px 14px">
      ${limits.length ? limits.map(([id, lim]) => {
        const spent = ms.byCat[id] || 0; const r = spent / lim; const c = catOf(s, id);
        return html`<div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,.05)" onClick=${() => setEditCat(id)}>
          <div class="row between" style="margin-bottom:6px"><span>${c.icon} ${c.name}</span><span class="mono" style="font-size:13px"><span class=${r >= 1 ? 'down' : r >= 0.8 ? 'warn' : ''}>${s.settings.privacy ? '••' : num(spent, 0)}</span> / ${s.settings.privacy ? '••' : num(lim, 0)}</span></div>
          <${Bar} v=${r} cls=${r >= 1 ? 'hot' : r >= 0.8 ? 'hot' : 'ok'} />
        </div>`;
      }) : html`<div class="empty" style="padding:16px">No limits yet. E.g. Dining out max 400 zł. I'll warn you at 80%.</div>`}
    </div>
    ${editCat && html`<${CatLimitSheet} id=${editCat} onClose=${() => setEditCat(null)} />`}
  </div>`;
}

function CatLimitSheet({ id, onClose }) {
  const s = useStore();
  const [cat, setCat] = useState(id === 'pick' ? null : id);
  const [v, setV] = useState(cat && s.budget.cats[cat] ? String(s.budget.cats[cat]) : '');
  return html`<${Sheet} title="Category limit" onClose=${onClose}>${(close) => html`
    ${id === 'pick' && html`<div class="catgrid" style="margin-bottom:12px">${s.cats.exp.map((c) => html`<button class=${`cat ${cat === c.id ? 'on' : ''}`} onClick=${() => { setCat(c.id); setV(s.budget.cats[c.id] ? String(s.budget.cats[c.id]) : ''); }}><span class="e">${c.icon}</span>${c.name}</button>`)}</div>`}
    ${cat && html`<${Field} label=${`${catOf(s, cat).name}: max per month (zł)`}><${NumInput} value=${v} onInput=${setV} autofocus /><//>`}
    <div class="btns">
      ${id !== 'pick' && html`<button class="btn danger" onClick=${() => { const c = { ...s.budget.cats }; delete c[cat]; patch('budget', { cats: c }); close(); }}>Remove</button>`}
      <button class="btn primary grow" disabled=${!cat || !valid(v)} onClick=${() => { patch('budget', { cats: { ...s.budget.cats, [cat]: parseNum(v) } }); close(); }}>Save</button>
    </div>
  `}<//>`;
}

// ---------- repeating bills ----------
export function Bills() {
  const s = useStore();
  const [edit, setEdit] = useState(null);
  const up = upcomingBills(s, 35);
  const monthly = s.recurring.filter((r) => !r.paused).reduce((a, r) => a + r.amt, 0);
  return html`<div class="screen">
    <${Back} title=${T.bills} hint="Rent, phone, subscriptions: added automatically" onBack=${back} right=${html`<button class="iconbtn" onClick=${() => setEdit({})}>＋</button>`} />
    <div class="card hero"><div class="label">Fixed costs every month</div><div class="big"><${Money} v=${monthly} /></div><div class="sub">${s.recurring.length} repeating bill${s.recurring.length === 1 ? '' : 's'}</div></div>
    <div class="sect"><span class="h-title">Coming up 📅</span></div>
    <div class="card" style="padding:4px 12px">
      ${up.length ? up.map((b) => { const d = daysBetween(today(), b.date); return html`<div class="item">
        <span class="em">${b.icon}</span>
        <div class="grow"><div class="t1">${b.name}</div><div class="t2">${niceDate(b.date)} · ${d === 0 ? 'today' : `in ${d} day${d === 1 ? '' : 's'}`}${b.kind === 'card' ? ' · pay manually' : ' · auto-added'}</div></div>
        <${Money} v=${b.amt} cur=${b.cur} cls=${`amt ${d <= 3 ? 'warn' : ''}`} />
      </div>`; }) : html`<div class="empty" style="padding:16px">Nothing due in the next 5 weeks</div>`}
    </div>
    <div class="sect"><span class="h-title">Your repeating bills</span></div>
    <div class="card" style="padding:4px 12px">
      ${s.recurring.length ? s.recurring.map((r) => html`<button class="item" onClick=${() => setEdit(r)} style=${{ opacity: r.paused ? 0.5 : 1 }}>
        <span class="em">${catOf(s, r.cat).icon}</span>
        <div class="grow"><div class="t1">${r.name}</div><div class="t2">every month on day ${r.day}${r.paused ? ' · paused' : ''}</div></div>
        <${Money} v=${r.amt} cur=${curOf(s, r.from)} cls="amt" />
      </button>`) : html`<${Empty} e="🔁" text="Add rent, phone, gym… they'll log themselves every month." />`}
    </div>
    ${edit && html`<${BillSheet} r=${edit} onClose=${() => setEdit(null)} />`}
  </div>`;
}

function BillSheet({ r, onClose }) {
  const s = useStore();
  const [name, setName] = useState(r.name || '');
  const [amt, setAmt] = useState(r.amt ? String(r.amt) : '');
  const [cat, setCat] = useState(r.cat || 'rent');
  const [from, setFrom] = useState(r.from || (s.accounts[0] && s.accounts[0].id));
  const [day, setDay] = useState(r.day ? String(r.day) : '');
  const [paused, setPaused] = useState(!!r.paused);
  const d = Math.round(parseNum(day));
  const ok = name.trim() && valid(amt) && d >= 1 && d <= 31;
  return html`<${Sheet} title=${r.id ? 'Edit bill' : 'New repeating bill'} onClose=${onClose}>${(close) => html`
    <${Field} label="Name"><input class="input" value=${name} onInput=${(e) => setName(e.target.value)} placeholder="Rent, Play, Netflix, Gym…" /><//>
    <div class="row" style="gap:8px"><div class="grow"><${Field} label="Amount"><${NumInput} value=${amt} onInput=${setAmt} /><//></div><div style="flex:0 0 40%"><${Field} label="Day of month"><${NumInput} value=${day} onInput=${setDay} placeholder="1 to 31" /><//></div></div>
    <${Field} label="Category"><div class="chips">${s.cats.exp.map((c) => html`<button class=${`chip ${cat === c.id ? 'on' : ''}`} onClick=${() => setCat(c.id)}>${c.icon} ${c.name}</button>`)}</div><//>
    <${Field} label="Paid with"><div class="chips">
      ${s.accounts.map((a) => html`<button class=${`chip ${from === a.id ? 'on' : ''}`} onClick=${() => setFrom(a.id)}>${a.icon} ${a.name}</button>`)}
      ${s.card.on && html`<button class=${`chip ${from === CARD ? 'on' : ''}`} onClick=${() => setFrom(CARD)}>💳 ${s.card.name}</button>`}
    </div><//>
    ${r.id && html`<${SettingRow} title="Paused" hint="Stop adding it for now"><${Switch} on=${paused} onChange=${setPaused} /><//>`}
    <div class="btns">
      ${r.id && html`<button class="btn danger" onClick=${() => { if (confirm('Delete this bill? Past entries stay.')) { removeFrom('recurring', r.id); close(); } }}>Delete</button>`}
      <button class="btn primary grow" disabled=${!ok} onClick=${() => {
        upsert('recurring', { ...(r.id ? { id: r.id } : { last: initialLast(d) }), name: name.trim(), amt: parseNum(amt), cat, from, day: d, paused });
        toast(r.id ? 'Bill updated' : 'Added. It\'ll log itself every month 🔁', '✅'); close();
      }}>Save</button>
    </div>
  `}<//>`;
}

// ---------- history ----------
export function HistoryScreen() {
  const s = useStore();
  const months = [];
  let ym = thisYm();
  const first = s.txns.reduce((m, t) => (ymOf(t.date) < m ? ymOf(t.date) : m), thisYm());
  for (let i = 0; i < 24 && ym >= first; i++) { months.push(monthStats(s, ym)); ym = prevYm(ym); }
  const chart = [...months].slice(0, 12).reverse().map((m) => ({ a: m.income, b: m.spend, label: monthName(m.ym).slice(0, 3) }));
  const avgSpend = months.length ? months.reduce((a, m) => a + m.spend, 0) / months.length : 0;
  return html`<div class="screen">
    <${Back} title=${T.history} hint="Month by month" onBack=${back} />
    <div class="card"><${Bars} rows=${chart} /><div class="hint"><span class="up">■</span> income <span class="pink">■</span> spending · average spend <${Money} v=${avgSpend} d=${0} />/month</div></div>
    <div class="card" style="padding:4px 12px">
      ${months.map((m) => html`<button class="item" onClick=${() => { location.hash = '#/summary/' + m.ym; }}>
        <span class="em">📅</span>
        <div class="grow"><div class="t1">${monthName(m.ym, true)}</div><div class="t2">in <${Money} v=${m.income} d=${0} /> · out <${Money} v=${m.spend} d=${0} />${m.saved ? html` · saved <${Money} v=${m.saved} d=${0} />` : ''}</div></div>
        <${Money} v=${m.net} sign d=${0} cls=${`amt ${m.net >= 0 ? 'up' : 'down'}`} />
      </button>`)}
    </div>
  </div>`;
}

// ---------- month summary ----------
export function Summary({ ym: ym0 }) {
  const s = useStore();
  const [ym, setYm] = useState(ym0 || thisYm());
  const ms = monthStats(s, ym);
  const prev = monthStats(s, prevYm(ym));
  const exps = s.txns.filter((t) => t.t === 'exp' && ymOf(t.date) === ym);
  const biggest = exps.reduce((m, t) => (!m || txnPln(s, t) > txnPln(s, m) ? t : m), null);
  const days = ym === thisYm() ? Number(today().slice(8)) : daysInMonth(ym);
  const spendDays = new Set(exps.map((t) => t.date)).size;
  const noSpend = Math.max(0, days - spendDays);
  const rate = ms.income ? ((ms.income - ms.spend) / ms.income) * 100 : null;
  const top = Object.entries(ms.byCat).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const changes = Object.keys({ ...ms.byCat, ...prev.byCat }).map((id) => ({ id, now: ms.byCat[id] || 0, before: prev.byCat[id] || 0 }))
    .filter((x) => x.before > 0 || x.now > 0).map((x) => ({ ...x, d: x.now - x.before })).sort((a, b) => Math.abs(b.d) - Math.abs(a.d)).slice(0, 5);
  const verdict = !ms.spend ? 'No spending recorded this month.' : ms.net > 0 && rate > 20 ? `Great month. You kept ${num(rate, 0)}% of your income.` : ms.net > 0 ? 'You spent less than you earned.' : 'You spent more than you earned this month.';
  return html`<div class="screen">
    <${Back} title=${T.summary} hint="Month summary" onBack=${back} />
    <div class="row between" style="margin:0 2px 12px">
      <button class="iconbtn" onClick=${() => setYm(prevYm(ym))}>‹</button>
      <div class="h-big" style="font-size:16px">${monthName(ym, true)}</div>
      <button class="iconbtn" onClick=${() => ym < thisYm() && setYm(nextYm(ym))} style=${{ opacity: ym >= thisYm() ? 0.3 : 1 }}>›</button>
    </div>
    <div class="card"><div class="h-big" style="font-size:17px;line-height:1.3">${verdict}</div></div>
    <div class="stat3">
      <div><div class="l">Spent</div><div class="v"><${Money} v=${ms.spend} d=${0} /></div><div class="d">${prev.spend ? pct(((ms.spend - prev.spend) / prev.spend) * 100, 0) + ' vs last' : ''}</div></div>
      <div><div class="l">Came in</div><div class="v up"><${Money} v=${ms.income} d=${0} /></div></div>
      <div><div class="l">Saved</div><div class="v cyan"><${Money} v=${ms.saved} d=${0} /></div><div class="d">${rate != null ? `${num(rate, 0)}% kept` : ''}</div></div>
    </div>
    <div class="card" style="margin-top:12px"><div class="kv">
      <span>Daily average</span><${Money} v=${ms.spend / days} />
      <span>No-spend days</span><span>${noSpend} / ${days}</span>
      <span>Biggest expense</span><span>${biggest ? html`<${Money} v=${txnPln(s, biggest)} /> <span class="hint">${catOf(s, biggest.cat).icon}</span>` : '-'}</span>
      <span>On the card</span><${Money} v=${ms.card} />
    </div></div>
    ${top.length > 0 && html`<div class="sect"><span class="h-title">Top 3 categories</span></div>
    <div class="card">${top.map(([id, v], i) => html`<div class="row" style="padding:6px 0"><span class="mute" style="width:22px;font-weight:700">${i + 1}</span><span class="grow">${catOf(s, id).icon} ${catOf(s, id).name}</span><${Money} v=${v} /></div>`)}</div>`}
    ${changes.length > 0 && prev.spend > 0 && html`<div class="sect"><span class="h-title">vs ${monthName(prevYm(ym))}</span></div>
    <div class="card">${changes.map((c) => html`<div class="row" style="padding:6px 0"><span class="grow">${catOf(s, c.id).icon} ${catOf(s, c.id).name}</span>
      <span class=${`mono ${c.d > 0 ? 'down' : 'up'}`} style="font-size:13px">${c.d > 0 ? '▲' : '▼'} ${s.settings.privacy ? '••' : num(Math.abs(c.d), 0)} zł${c.before ? ` (${pct((c.d / c.before) * 100, 0)})` : ' (new)'}</span></div>`)}</div>`}
    <div class="sect"><span class="h-title">Breakdown</span></div>
    <div class="card"><${CategoryBreakdown} s=${s} ms=${ms} /></div>
  </div>`;
}
