import { useState } from 'preact/hooks';
import { html, Money, Back, Sheet, Field, NumInput, Switch, Bar, Donut, Empty, toast, valid, sheets, SettingRow, PALETTE } from './ui.js';
import { useStore, set, patch, balance, cardOwed, netWorth, friendBalances, goldTotals, toPln, monthStats, upsert, removeFrom, nextDue, txnPln, CARD, ACCOUNT_KINDS } from './store.js';
import { useLive, priceNow } from './gold.js';
import { T } from './copy.js';
import { TxnRow } from './activity.js';
import { nav } from './home.js';
import { num, money, parseNum, thisYm, niceDate, daysBetween, today, uid, ymOf, parseDate } from './util.js';

const back = () => history.back();
const ICONS = ['🏦', '🔒', '💵', '💶', '🪪', '🟣', '🟠', '🔵', '🐷', '💎', '🧧', '🏧'];

export function Wealth() {
  const s = useStore();
  const lv = useLive();
  const p = lv.price || priceNow();
  const nw = netWorth(s, p);
  const parts = [
    { label: 'Cash & bank', v: Math.max(0, nw.cash), color: '#38e8ff' },
    { label: 'Gold', v: nw.gold, color: '#ffc94d' },
    { label: 'Owed to you', v: nw.fOwedMe, color: '#ff7ab8' },
  ].filter((x) => x.v > 0);
  return html`<div class="screen">
    <div class="top"><div class="grow"><div class="h-title">${T.nWealth}</div><div class="hint">Everything you've got, all in one place</div></div></div>
    <div class="card neon hero">
      <div class="scan"></div>
      <div class="label">${T.netWorth} · ${T.netWorthHint}</div>
      <div class="big glow-pink"><${Money} v=${nw.total} /></div>
      <div class="row" style="margin-top:12px;gap:16px">
        <${Donut} data=${parts} size=${120} />
        <div class="legend grow">
          ${parts.map((x) => html`<div class="li"><i class="sw" style=${{ background: x.color }}></i><span class="grow">${x.label}</span><${Money} v=${x.v} d=${0} /></div>`)}
          ${nw.card > 0 && html`<div class="li"><i class="sw" style="background:#ff4d6d"></i><span class="grow">Card debt</span><${Money} v=${-nw.card} d=${0} cls="down" /></div>`}
          ${nw.fIOwe > 0 && html`<div class="li"><i class="sw" style="background:#ff4d6d"></i><span class="grow">You owe friends</span><${Money} v=${-nw.fIOwe} d=${0} cls="down" /></div>`}
        </div>
      </div>
    </div>
    <div class="tiles">
      ${[['💰', T.accounts, T.accountsHint, 'accounts', '#38e8ff', html`<${Money} v=${nw.cash} />`],
         ['💳', T.card, T.cardHint, 'card', '#a35cff', html`<${Money} v=${-nw.card} />`],
         ['🤝', T.friends, T.friendsHint, 'friends', '#ff7ab8', html`<${Money} v=${nw.fOwedMe - nw.fIOwe} sign />`],
         ['🎯', T.goals, T.goalsHint, 'goals', '#e0ff4d', `${s.goals.length} goal${s.goals.length === 1 ? '' : 's'}`],
         ['🪙', T.nGold, 'Live value', 'gold', '#ffc94d', html`<${Money} v=${nw.gold} />`],
         ['🕋', T.zakat, T.zakatHint, 'zakat', '#2bffa3', 'Calculate']].map(([ic, nm, hint, go, accent, val]) => html`
        <button class="tile" style=${{ '--accent': accent }} onClick=${() => nav(go)}><div class="ic">${ic}</div><div><div class="nm">${nm}</div><div class="val">${val}</div><div class="hint">${hint}</div></div></button>`)}
    </div>
  </div>`;
}

// ---------- accounts ----------
export function Accounts() {
  const s = useStore();
  const [edit, setEdit] = useState(null);
  const total = s.accounts.reduce((a, x) => a + toPln(s, balance(s, x.id), x.cur), 0);
  return html`<div class="screen">
    <${Back} title=${T.accounts} hint="Bank accounts, savings & cash" onBack=${back} right=${html`<button class="iconbtn" onClick=${() => setEdit({})}>＋</button>`} />
    <div class="card neon hero"><div class="label">All together (in zł)</div><div class="big glow-pink"><${Money} v=${total} /></div></div>
    <div class="card" style="padding:4px 12px">
      ${s.accounts.map((a) => { const b = balance(s, a.id); return html`<button class="item" onClick=${() => setEdit(a)}>
        <span class="em">${a.icon || '🏦'}</span>
        <div class="grow"><div class="t1">${a.name}</div><div class="t2">${ACCOUNT_KINDS[a.kind]} · ${a.cur}${a.cur !== 'PLN' ? ` · ≈ ${money(toPln(s, b, a.cur))}` : ''}</div></div>
        <${Money} v=${b} cur=${a.cur} cls=${`amt ${b < 0 ? 'down' : ''}`} />
      </button>`; })}
    </div>
    <div class="note" style="padding:0 6px">Tap an account to fix its balance if it doesn't match your banking app. Balances move automatically when you log spending, income and moves.</div>
    <div class="btns" style="margin-top:12px"><button class="btn grow" onClick=${() => sheets.open({ mode: 'xfer' })}>🔀 Move money</button><button class="btn grow" onClick=${() => setEdit({})}>＋ Add account</button></div>
    ${edit && html`<${AccountSheet} a=${edit} onClose=${() => setEdit(null)} />`}
  </div>`;
}

function AccountSheet({ a, onClose }) {
  const s = useStore();
  const isNew = !a.id;
  const [name, setName] = useState(a.name || '');
  const [icon, setIcon] = useState(a.icon || '🏦');
  const [cur, setCur] = useState(a.cur || 'PLN');
  const [kind, setKind] = useState(a.kind || 'bank');
  const cur0 = isNew ? 0 : balance(s, a.id);
  const [bal, setBal] = useState(isNew ? '' : String(+cur0.toFixed(2)));
  const used = !isNew && s.txns.some((t) => t.from === a.id || t.to === a.id);
  const save = (close) => {
    const target = parseNum(bal) || 0;
    if (isNew) {
      set((x) => ({ ...x, accounts: [...x.accounts, { id: uid(), name: name.trim() || 'Account', icon, cur, kind, opening: target }] }));
    } else {
      const opening = (a.opening || 0) + (target - cur0);
      set((x) => ({ ...x, accounts: x.accounts.map((y) => (y.id === a.id ? { ...y, name: name.trim() || y.name, icon, cur, kind, opening } : y)) }));
    }
    toast('Saved 💋', '✅'); close();
  };
  return html`<${Sheet} title=${isNew ? 'New account' : 'Edit account'} onClose=${onClose}>${(close) => html`
    <${Field} label="Name"><input class="input" value=${name} onInput=${(e) => setName(e.target.value)} placeholder="ING, Revolut, Wallet…" /><//>
    <${Field} label="Icon"><div class="chips">${ICONS.map((i) => html`<button class=${`chip ${icon === i ? 'on' : ''}`} onClick=${() => setIcon(i)}>${i}</button>`)}</div><//>
    <${Field} label="Type"><div class="chips">${Object.entries(ACCOUNT_KINDS).map(([k, v]) => html`<button class=${`chip ${kind === k ? 'on' : ''}`} onClick=${() => setKind(k)}>${v}</button>`)}</div><//>
    <${Field} label="Currency"><div class="chips">${['PLN', 'EUR', 'USD', 'AED', 'GBP'].map((c) => html`<button class=${`chip ${cur === c ? 'on' : ''}`} onClick=${() => setCur(c)}>${c}</button>`)}</div><//>
    <${Field} label=${`Balance right now (${cur})`}><${NumInput} value=${bal} onInput=${setBal} /><//>
    <div class="btns">
      ${!isNew && html`<button class="btn danger" onClick=${() => {
        if (used && !confirm('This account has entries. Delete it anyway? Its entries stay in your history.')) return;
        if (!used && !confirm('Delete this account?')) return;
        removeFrom('accounts', a.id); close();
      }}>Delete</button>`}
      <button class="btn primary grow" onClick=${() => save(close)}>Save</button>
    </div>
  `}<//>`;
}

// ---------- credit card ----------
export function Card() {
  const s = useStore();
  const [edit, setEdit] = useState(false);
  const c = s.card;
  const owed = cardOwed(s);
  const avail = c.limit - owed;
  const used = c.limit ? owed / c.limit : 0;
  const due = nextDue(c.dueDay);
  const ms = monthStats(s, thisYm());
  const list = s.txns.filter((t) => t.from === CARD || t.to === CARD).sort((a, b) => (b.date + b.id).localeCompare(a.date + a.id)).slice(0, 30);
  return html`<div class="screen">
    <${Back} title=${T.card} hint="Credit card: limit, debt & bill" onBack=${back} right=${html`<button class="iconbtn" onClick=${() => setEdit(true)}>⚙️</button>`} />
    <div class="card neon hero" style="background:linear-gradient(135deg,rgba(163,92,255,.35),rgba(255,46,136,.25) 60%,rgba(255,255,255,.03))">
      <div class="row between"><span class="xxx">${c.name}</span><span style="font-size:26px">💳</span></div>
      <div class="label" style="margin-top:16px">Available to blow</div>
      <div class=${`big ${avail < 0 ? 'down' : 'glow-pink'}`}><${Money} v=${avail} /></div>
      <div style="margin:10px 0 6px"><${Bar} v=${used} cls=${used >= 0.8 ? 'hot' : ''} /></div>
      <div class="row between sub"><span>Owed: <${Money} v=${owed} /></span><span>Limit: <${Money} v=${c.limit} d=${0} /></span></div>
      ${used >= 0.8 && html`<div class="warn" style="margin-top:8px;font-weight:600">🥵 ${Math.round(used * 100)}% used. Easy, tiger.</div>`}
    </div>
    ${!c.limit && html`<div class="card tap" onClick=${() => setEdit(true)}><b>Set your limit and bill day</b><div class="hint">So I can warn you before you max it out</div></div>`}
    <div class="stat3">
      <div><div class="l">This month</div><div class="v"><${Money} v=${ms.card} d=${0} /></div><div class="d">on card</div></div>
      <div><div class="l">Bill due</div><div class="v">${due ? niceDate(due) : '—'}</div><div class="d">${due ? `in ${daysBetween(today(), due)} days` : 'set a day'}</div></div>
      <div><div class="l">Pay</div><div class="v"><${Money} v=${Math.max(0, owed)} d=${0} /></div><div class="d">full amount</div></div>
    </div>
    <button class="btn primary block" style="margin-top:12px" disabled=${owed <= 0} onClick=${() => sheets.open({ mode: 'xfer', preset: { to: CARD, amt: +owed.toFixed(2) } })}>💦 Pay the bill (satisfy Plastic Daddy)</button>
    <div class="note" style="padding:8px 6px">Paying the bill moves money from your bank to the card. It isn't counted as spending again, because each purchase already was.</div>
    <div class="sect"><span class="h-title">Card activity</span></div>
    <div class="card" style="padding:4px 12px">${list.length ? list.map((t) => html`<${TxnRow} t=${t} s=${s} key=${t.id} />`) : html`<${Empty} e="💳" text="Nothing on the card yet." />`}</div>
    ${edit && html`<${CardSheet} onClose=${() => setEdit(false)} />`}
  </div>`;
}

function CardSheet({ onClose }) {
  const s = useStore();
  const c = s.card;
  const owed0 = cardOwed(s);
  const [name, setName] = useState(c.name);
  const [limit, setLimit] = useState(c.limit ? String(c.limit) : '');
  const [owed, setOwed] = useState(String(+owed0.toFixed(2)));
  const [day, setDay] = useState(c.dueDay ? String(c.dueDay) : '');
  return html`<${Sheet} title="💳 Card settings" onClose=${onClose}>${(close) => html`
    <${SettingRow} title="I have a credit card"><${Switch} on=${c.on} onChange=${(v) => patch('card', { on: v })} /><//>
    <${Field} label="Card name"><input class="input" value=${name} onInput=${(e) => setName(e.target.value)} /><//>
    <${Field} label="Credit limit (zł)"><${NumInput} value=${limit} onInput=${setLimit} placeholder="5000" /><//>
    <${Field} label="Amount owed right now (zł)"><${NumInput} value=${owed} onInput=${setOwed} /><//>
    <${Field} label="Bill payment day of month"><${NumInput} value=${day} onInput=${setDay} placeholder="e.g. 25" /><//>
    <${SettingRow} title="Bill reminders" hint="3 days before, 1 day before & on the day"><${Switch} on=${s.settings.cardRemind} onChange=${(v) => patch('settings', { cardRemind: v })} /><//>
    <button class="btn primary block" onClick=${() => {
      const target = parseNum(owed) || 0;
      patch('card', { name: name.trim() || 'Credit card', limit: parseNum(limit) || 0, opening: (c.opening || 0) + (target - owed0), dueDay: Math.min(31, Math.max(0, Math.round(parseNum(day) || 0))) });
      toast('Card saved 💳', '✅'); close();
    }}>Save</button>
  `}<//>`;
}

// ---------- friends ----------
export function Friends() {
  const s = useStore();
  const [open, setOpen] = useState(null);
  const bal = friendBalances(s);
  const owedMe = [...bal.values()].filter((v) => v > 0).reduce((a, b) => a + b, 0);
  const iOwe = -[...bal.values()].filter((v) => v < 0).reduce((a, b) => a + b, 0);
  const list = [...s.friends].sort((a, b) => Math.abs(bal.get(b.id) || 0) - Math.abs(bal.get(a.id) || 0));
  return html`<div class="screen">
    <${Back} title=${T.friends} hint="Who owes who" onBack=${back} right=${html`<button class="iconbtn" onClick=${() => sheets.open({ mode: 'friend' })}>＋</button>`} />
    <div class="stat3" style="grid-template-columns:1fr 1fr;margin-bottom:12px">
      <div><div class="l">Owed to you</div><div class="v up" style="font-size:18px"><${Money} v=${owedMe} /></div></div>
      <div><div class="l">You owe</div><div class="v down" style="font-size:18px"><${Money} v=${iOwe} /></div></div>
    </div>
    <div class="card" style="padding:4px 12px">
      ${list.length ? list.map((f) => { const v = bal.get(f.id) || 0; return html`<button class="item" onClick=${() => setOpen(f)}>
        <span class="em">${f.emoji || '🧑'}</span>
        <div class="grow"><div class="t1">${f.name}</div><div class="t2">${v > 0 ? 'owes you' : v < 0 ? 'you owe them' : 'all square ✨'}</div></div>
        <${Money} v=${Math.abs(v)} cls=${`amt ${v > 0 ? 'up' : v < 0 ? 'down' : 'dim'}`} />
      </button>`; }) : html`<${Empty} e="🤝" text="Nobody owes anybody. How wholesome." />`}
    </div>
    <div class="btns" style="margin-top:12px"><button class="btn grow" onClick=${() => sheets.open({ mode: 'friend' })}>🤝 Lend / borrow</button><button class="btn grow" onClick=${() => sheets.open({ mode: 'split' })}>🍕 Split a bill</button></div>
    ${open && html`<${FriendSheet} f=${open} onClose=${() => setOpen(null)} />`}
  </div>`;
}

function FriendSheet({ f, onClose }) {
  const s = useStore();
  const v = friendBalances(s).get(f.id) || 0;
  const [name, setName] = useState(f.name);
  const list = s.txns.filter((t) => t.friend === f.id).sort((a, b) => (b.date + b.id).localeCompare(a.date + a.id));
  const days = list.length ? daysBetween(list[list.length - 1].date, today()) : 0;
  return html`<${Sheet} title=${`${f.emoji || '🧑'} ${f.name}`} onClose=${onClose}>${(close) => html`
    <div class="card neon" style="text-align:center">
      <div class="hint">${v > 0 ? 'Owes you' : v < 0 ? 'You owe them' : 'All square'}</div>
      <div class=${`mono ${v > 0 ? 'up glow-up' : v < 0 ? 'down glow-down' : ''}`} style="font-size:30px;font-weight:800"><${Money} v=${Math.abs(v)} /></div>
      ${v !== 0 && days > 0 && html`<div class="hint">open for ${days} days</div>`}
    </div>
    <div class="btns" style="margin-bottom:12px">
      ${v > 0 && html`<button class="btn primary grow" onClick=${() => { close(); setTimeout(() => sheets.open({ mode: 'friend', preset: { kind: 'repaid', friend: f.id, amt: +v.toFixed(2) } }), 50); }}>They paid me back</button>`}
      ${v < 0 && html`<button class="btn primary grow" onClick=${() => { close(); setTimeout(() => sheets.open({ mode: 'friend', preset: { kind: 'repay', friend: f.id, amt: +(-v).toFixed(2) } }), 50); }}>I paid them back</button>`}
      <button class="btn grow" onClick=${() => { close(); setTimeout(() => sheets.open({ mode: 'friend', preset: { friend: f.id } }), 50); }}>＋ New favour</button>
    </div>
    <div class="card" style="padding:4px 12px">${list.length ? list.map((t) => html`<${TxnRow} t=${t} s=${s} key=${t.id} />`) : html`<div class="empty">No history</div>`}</div>
    <${Field} label="Name"><input class="input" value=${name} onInput=${(e) => setName(e.target.value)} onBlur=${() => name.trim() && set((x) => ({ ...x, friends: x.friends.map((y) => (y.id === f.id ? { ...y, name: name.trim() } : y)) }))} /><//>
    <button class="btn danger block" onClick=${() => { if (confirm(`Remove ${f.name} and all their entries?`)) { set((x) => ({ ...x, friends: x.friends.filter((y) => y.id !== f.id), txns: x.txns.filter((t) => t.friend !== f.id) })); close(); } }}>Remove person</button>
  `}<//>`;
}

// ---------- goals ----------
const GOAL_EMOJI = ['🎯', '💻', '📱', '✈️', '🚗', '🏠', '💍', '🕋', '🎓', '🪙', '👟', '🛡️'];
export function Goals() {
  const s = useStore();
  const [edit, setEdit] = useState(null);
  const [add, setAdd] = useState(null);
  return html`<div class="screen">
    <${Back} title=${T.goals} hint="Savings goals" onBack=${back} right=${html`<button class="iconbtn" onClick=${() => setEdit({})}>＋</button>`} />
    ${s.goals.length ? s.goals.map((g) => {
      const p = g.target ? g.saved / g.target : 0;
      const left = g.target - g.saved;
      const months = g.by ? Math.max(1, Math.round(daysBetween(today(), g.by) / 30.4)) : null;
      return html`<div class="card neon tap" onClick=${() => setAdd(g)}>
        <div class="row"><span style="font-size:30px">${g.emoji}</span>
          <div class="grow"><b>${g.name}</b><div class="hint">${g.by ? `by ${niceDate(g.by)}` : 'no deadline'}${months && left > 0 ? ` · ${money(left / months, 'PLN', 0)}/month needed` : ''}</div></div>
          <button class="iconbtn" onClick=${(e) => { e.stopPropagation(); setEdit(g); }}>✏️</button></div>
        <div style="margin:12px 0 6px"><${Bar} v=${p} cls=${p >= 1 ? 'ok' : ''} /></div>
        <div class="row between"><span><${Money} v=${g.saved} d=${0} /> of <${Money} v=${g.target} d=${0} /></span><b class=${p >= 1 ? 'up' : 'pink'}>${p >= 1 ? 'Done! 🎉' : Math.round(p * 100) + '%'}</b></div>
      </div>`;
    }) : html`<${Empty} e="🎯" text="Saving it for something special? Add a goal." />`}
    <button class="btn primary block" onClick=${() => setEdit({})}>＋ New goal</button>
    ${edit && html`<${GoalSheet} g=${edit} onClose=${() => setEdit(null)} />`}
    ${add && html`<${GoalAddSheet} g=${add} onClose=${() => setAdd(null)} />`}
  </div>`;
}

function GoalSheet({ g, onClose }) {
  const [name, setName] = useState(g.name || '');
  const [emoji, setEmoji] = useState(g.emoji || '🎯');
  const [target, setTarget] = useState(g.target ? String(g.target) : '');
  const [saved, setSaved] = useState(g.saved ? String(g.saved) : '');
  const [by, setBy] = useState(g.by || '');
  return html`<${Sheet} title=${g.id ? 'Edit goal' : 'New goal'} onClose=${onClose}>${(close) => html`
    <${Field} label="What for"><input class="input" value=${name} onInput=${(e) => setName(e.target.value)} placeholder="New laptop, Umrah, car…" /><//>
    <${Field} label="Icon"><div class="chips">${GOAL_EMOJI.map((e) => html`<button class=${`chip ${emoji === e ? 'on' : ''}`} onClick=${() => setEmoji(e)}>${e}</button>`)}</div><//>
    <div class="row" style="gap:8px"><div class="grow"><${Field} label="Target (zł)"><${NumInput} value=${target} onInput=${setTarget} /><//></div><div class="grow"><${Field} label="Saved so far"><${NumInput} value=${saved} onInput=${setSaved} /><//></div></div>
    <${Field} label="Deadline (optional)"><input class="input" type="date" value=${by} onInput=${(e) => setBy(e.target.value)} /><//>
    <div class="btns">
      ${g.id && html`<button class="btn danger" onClick=${() => { if (confirm('Delete goal?')) { removeFrom('goals', g.id); close(); } }}>Delete</button>`}
      <button class="btn primary grow" disabled=${!name.trim() || !valid(target)} onClick=${() => { upsert('goals', { ...(g.id ? { id: g.id } : {}), name: name.trim(), emoji, target: parseNum(target), saved: parseNum(saved) || 0, by }); close(); }}>Save</button>
    </div>
  `}<//>`;
}

function GoalAddSheet({ g, onClose }) {
  const [amt, setAmt] = useState('');
  return html`<${Sheet} title=${`${g.emoji} ${g.name}`} onClose=${onClose}>${(close) => html`
    <div class="amount"><div class="cur">Put some in (or take out with −)</div><${NumInput} cls="" value=${amt} onInput=${setAmt} autofocus /></div>
    <div class="note" style="margin-bottom:10px">This only tracks progress. To actually move money into savings, use "Move money".</div>
    <button class="btn primary block" disabled=${!Number.isFinite(parseNum(amt))} onClick=${() => { upsert('goals', { id: g.id, saved: Math.max(0, (g.saved || 0) + parseNum(amt)) }); toast('Getting closer 😏', '🎯'); close(); }}>Add to goal</button>
  `}<//>`;
}
