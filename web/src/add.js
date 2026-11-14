import { useState, useMemo } from 'preact/hooks';
import { html, Sheet, Field, NumInput, Seg, toast, valid } from './ui.js';
import { get, set, useStore, addTxn, updateTxn, deleteTxn, CARD, curOf, cardOwed, cardProjection, monthStats, catOf, friendBalances, dailyLimit } from './store.js';
import { T } from './copy.js';
import { parseNum, today, uid, money, thisYm, vibrate } from './util.js';

const MODES = [['exp', 'Expense'], ['inc', 'Income'], ['xfer', 'Move'], ['split', 'Split'], ['friend', 'Lend']];

export function AddSheet({ onClose, edit, mode: initialMode = 'exp', preset = {} }) {
  const s = useStore();
  const [mode, setMode] = useState(edit ? (edit.t === 'fout' || edit.t === 'fin' ? 'friend' : edit.t) : initialMode);
  return html`<${Sheet} onClose=${onClose}>${(close) => html`
    ${!edit && html`<div style="margin-bottom:14px"><${Seg} options=${MODES} value=${mode} onChange=${(m) => { vibrate(); setMode(m); }} /></div>`}
    ${edit && html`<h3>Edit entry</h3>`}
    ${mode === 'exp' && html`<${ExpenseForm} s=${s} edit=${edit} preset=${preset} done=${close} />`}
    ${mode === 'inc' && html`<${IncomeForm} s=${s} edit=${edit} done=${close} />`}
    ${mode === 'xfer' && html`<${TransferForm} s=${s} edit=${edit} preset=${preset} done=${close} />`}
    ${mode === 'split' && html`<${SplitForm} s=${s} done=${close} />`}
    ${mode === 'friend' && html`<${FriendForm} s=${s} edit=${edit} preset=${preset} done=${close} />`}
  `}<//>`;
}

function Amount({ value, onInput, cur = 'PLN', label }) {
  return html`<div class="amount">
    <div class="cur">${label || cur}</div>
    <${NumInput} cls="" value=${value} onInput=${onInput} autofocus />
  </div>`;
}

function PlacePicker({ s, value, onChange, card = true, none, noneLabel = 'No money moved' }) {
  return html`<div class="chips">
    ${s.accounts.map((a) => html`<button class=${`chip ${value === a.id ? 'on' : ''}`} onClick=${() => onChange(a.id)}>${a.icon || '🏦'} ${a.name}${a.cur !== 'PLN' ? ` · ${a.cur}` : ''}</button>`)}
    ${card && s.card.on && html`<button class=${`chip ${value === CARD ? 'on' : ''}`} onClick=${() => onChange(CARD)}>💳 ${s.card.name}</button>`}
    ${none && html`<button class=${`chip ${value == null ? 'on' : ''}`} onClick=${() => onChange(null)}>✋ ${noneLabel}</button>`}
  </div>`;
}

function DateNote({ date, setDate, note, setNote }) {
  return html`<div class="row" style="gap:8px">
    <div style="flex:0 0 46%"><${Field} label="When"><input class="input" type="date" value=${date} max="2099-12-31" onInput=${(e) => setDate(e.target.value || today())} /><//></div>
    <div class="grow"><${Field} label="Note"><input class="input" placeholder="optional" value=${note} onInput=${(e) => setNote(e.target.value)} /><//></div>
  </div>`;
}

function Footer({ edit, onSave, ok, label = 'Save it' }) {
  return html`<div class="btns" style="margin-top:6px">
    ${edit && html`<button class="btn danger" onClick=${() => { if (confirm('Delete this entry?')) { deleteTxn(edit.id); toast('Deleted', '🗑️'); onSave(true); } }}>Delete</button>`}
    <button class="btn primary grow" disabled=${!ok} style=${{ opacity: ok ? 1 : 0.4 }} onClick=${() => ok && onSave()}>${label}</button>
  </div>`;
}

const lastUsed = (s, t, key, fallback) => { for (let i = s.txns.length - 1; i >= 0; i--) if (s.txns[i].t === t && s.txns[i][key] != null) return s.txns[i][key]; return fallback; };

function warnAfterSpend(cat, from) {
  const s = get();
  if (from === CARD && s.card.limit) {
    const used = cardOwed(s) / s.card.limit;
    if (used >= 1) return toast(`Credit card limit reached (${Math.round(used * 100)}% used)`, '💳', 5000);
    if (used >= 0.8) return toast(T.cardWarn80, '💳', 5000);
  }
  if (from === CARD && s.card.target) {
    const p = cardProjection(s);
    if (p.projected > p.target) return toast(`At this pace your card spending will reach ${money(p.projected, 'PLN', 0)} this month (target ${money(p.target, 'PLN', 0)})`, '💳', 6000);
  }
  const lim = s.budget.cats[cat];
  if (lim) {
    const spent = monthStats(s, thisYm()).byCat[cat] || 0;
    const name = catOf(s, cat).name;
    if (spent >= lim) return toast(T.catOver(name), '🚨', 5000);
    if (spent >= lim * 0.8) return toast(T.catWarn(name), '⚠️', 5000);
  }
  const dl = dailyLimit(s);
  if (dl && dl.left < 0) return toast(`${T.todayOver} ${money(-dl.left)}`, '⚠️', 4500);
  toast('Expense saved', '✓');
}

function ExpenseForm({ s, edit, preset, done }) {
  const [amt, setAmt] = useState(edit ? String(edit.amt) : preset.amt ? String(preset.amt) : '');
  const [cat, setCat] = useState(edit ? edit.cat : preset.cat || null);
  const [from, setFrom] = useState(edit ? edit.from : lastUsed(s, 'exp', 'from', s.accounts[0] && s.accounts[0].id));
  const [date, setDate] = useState(edit ? edit.date : today());
  const [note, setNote] = useState(edit ? edit.note : preset.note || '');
  const cats = useMemo(() => {
    // most used first
    const count = {};
    for (const t of s.txns) if (t.t === 'exp') count[t.cat] = (count[t.cat] || 0) + 1;
    return [...s.cats.exp].sort((a, b) => (count[b.id] || 0) - (count[a.id] || 0));
  }, [s.cats.exp]);
  const ok = valid(amt) && cat && from !== undefined;
  const save = () => {
    const data = { t: 'exp', amt: parseNum(amt), cat, from, date, note };
    if (edit) { updateTxn(edit.id, data); toast('Updated', '✓'); } else { addTxn(data); warnAfterSpend(cat, from); }
    done();
  };
  return html`
    <${Amount} value=${amt} onInput=${setAmt} cur=${curOf(s, from)} label=${`${T.addExp} · ${curOf(s, from)}`} />
    <div class="catgrid" style="margin-bottom:14px">
      ${cats.map((c) => html`<button class=${`cat ${cat === c.id ? 'on' : ''}`} onClick=${() => { vibrate(); setCat(c.id); }}><span class="e">${c.icon}</span>${c.name}</button>`)}
    </div>
    <${Field} label="Paid with"><${PlacePicker} s=${s} value=${from} onChange=${setFrom} /><//>
    <${DateNote} ...${{ date, setDate, note, setNote }} />
    <${Footer} edit=${edit} ok=${ok} onSave=${(deleted) => (deleted ? done() : save())} />`;
}

function IncomeForm({ s, edit, done }) {
  const [amt, setAmt] = useState(edit ? String(edit.amt) : '');
  const [cat, setCat] = useState(edit ? edit.cat : 'salary');
  const [to, setTo] = useState(edit ? edit.to : lastUsed(s, 'inc', 'to', s.accounts[0] && s.accounts[0].id));
  const [date, setDate] = useState(edit ? edit.date : today());
  const [note, setNote] = useState(edit ? edit.note : '');
  const ok = valid(amt) && cat && to;
  const save = () => {
    const data = { t: 'inc', amt: parseNum(amt), cat, to, date, note };
    if (edit) updateTxn(edit.id, data); else addTxn(data);
    toast(edit ? 'Updated' : 'Income saved', '✓');
    done();
  };
  return html`
    <${Amount} value=${amt} onInput=${setAmt} label=${`${T.addInc} · ${curOf(s, to)}`} />
    <${Field} label="What kind"><div class="chips">${s.cats.inc.map((c) => html`<button class=${`chip ${cat === c.id ? 'on' : ''}`} onClick=${() => setCat(c.id)}>${c.icon} ${c.name}</button>`)}</div><//>
    <${Field} label="Landed in"><${PlacePicker} s=${s} value=${to} onChange=${setTo} card=${false} /><//>
    <${DateNote} ...${{ date, setDate, note, setNote }} />
    <${Footer} edit=${edit} ok=${ok} onSave=${(d) => (d ? done() : save())} />`;
}

function TransferForm({ s, edit, preset, done }) {
  const [amt, setAmt] = useState(edit ? String(edit.amt) : preset.amt ? String(preset.amt) : '');
  const [amt2, setAmt2] = useState(edit && edit.amt2 != null ? String(edit.amt2) : '');
  const [from, setFrom] = useState(edit ? edit.from : preset.from || (s.accounts[0] && s.accounts[0].id));
  const [to, setTo] = useState(edit ? edit.to : preset.to || (s.accounts[1] && s.accounts[1].id));
  const [date, setDate] = useState(edit ? edit.date : today());
  const [note, setNote] = useState(edit ? edit.note : preset.note || '');
  const c1 = curOf(s, from), c2 = curOf(s, to);
  const fx = c1 !== c2;
  const ok = valid(amt) && from && to && from !== to && from !== CARD && (!fx || valid(amt2));
  const save = () => {
    const data = { t: 'xfer', amt: parseNum(amt), amt2: fx ? parseNum(amt2) : null, from, to, date, note: note || (to === CARD ? 'Card bill paid' : '') };
    if (edit) updateTxn(edit.id, data); else addTxn(data);
    toast(to === CARD ? 'Card bill payment saved' : 'Transfer saved', '✓');
    done();
  };
  return html`
    <${Amount} value=${amt} onInput=${setAmt} label=${`${T.addXfer} · ${c1}`} />
    <${Field} label="From"><${PlacePicker} s=${s} value=${from} onChange=${setFrom} card=${false} /><//>
    <${Field} label="To (pick the card to pay its bill)"><${PlacePicker} s=${s} value=${to} onChange=${setTo} /><//>
    ${fx && html`<${Field} label=${`Amount received in ${c2}`}><${NumInput} value=${amt2} onInput=${setAmt2} /><//>`}
    <div class="note" style="margin:-4px 4px 12px">Moving money isn't spending. Your totals stay honest.</div>
    <${DateNote} ...${{ date, setDate, note, setNote }} />
    <${Footer} edit=${edit} ok=${ok} onSave=${(d) => (d ? done() : save())} />`;
}

export function FriendPicker({ s, value, onChange, newName, setNewName }) {
  return html`<div>
    <div class="chips">
      ${s.friends.map((f) => html`<button class=${`chip ${value === f.id ? 'on' : ''}`} onClick=${() => onChange(f.id)}>${f.emoji || '🧑'} ${f.name}</button>`)}
      <button class=${`chip ${value === 'new' ? 'on' : ''}`} onClick=${() => onChange('new')}>＋ New person</button>
    </div>
    ${value === 'new' && html`<input class="input" style="margin-top:8px" placeholder="Their name" value=${newName} onInput=${(e) => setNewName(e.target.value)} />`}
  </div>`;
}

export function ensureFriend(fid, newName) {
  if (fid !== 'new') return fid;
  const id = uid();
  set((x) => ({ ...x, friends: [...x.friends, { id, name: newName.trim(), emoji: '🧑' }] }));
  return id;
}

function SplitForm({ s, done }) {
  const [amt, setAmt] = useState('');
  const [mine, setMine] = useState('');
  const [people, setPeople] = useState(2);
  const [fid, setFid] = useState(s.friends[0] ? s.friends[0].id : 'new');
  const [newName, setNewName] = useState('');
  const [cat, setCat] = useState('dining');
  const [from, setFrom] = useState(s.accounts[0] && s.accounts[0].id);
  const [date, setDate] = useState(today());
  const [note, setNote] = useState('');
  const total = parseNum(amt);
  const myShare = mine ? parseNum(mine) : total / people;
  const theirs = total - myShare;
  const ok = valid(amt) && Number.isFinite(myShare) && myShare >= 0 && theirs > 0 && (fid !== 'new' || newName.trim()) && from;
  const save = () => {
    const friend = ensureFriend(fid, newName);
    const e = addTxn({ t: 'exp', amt: myShare, cat, from, date, note: note || 'Split bill (my share)' });
    addTxn({ t: 'fout', amt: theirs, from, friend, date, note: note || 'Split bill (their share)', pair: e.id });
    toast(`Split saved. They owe you ${money(theirs)}`, '✓');
    done();
  };
  return html`
    <${Amount} value=${amt} onInput=${setAmt} label="Total bill you paid" />
    <${Field} label="Split between"><div class="chips">${[2, 3, 4, 5, 6].map((n) => html`<button class=${`chip ${people === n && !mine ? 'on' : ''}`} onClick=${() => { setPeople(n); setMine(''); }}>${n} people</button>`)}</div><//>
    <${Field} label="Or my exact share"><${NumInput} value=${mine} onInput=${setMine} placeholder=${Number.isFinite(total) ? (total / people).toFixed(2) : '0'} /><//>
    <${Field} label="Who owes you the rest"><${FriendPicker} ...${{ s, value: fid, onChange: setFid, newName, setNewName }} /><//>
    <${Field} label="Category"><div class="chips">${s.cats.exp.slice(0, 12).map((c) => html`<button class=${`chip ${cat === c.id ? 'on' : ''}`} onClick=${() => setCat(c.id)}>${c.icon} ${c.name}</button>`)}</div><//>
    <${Field} label="Paid with"><${PlacePicker} s=${s} value=${from} onChange=${setFrom} /><//>
    ${valid(amt) && html`<div class="card" style="padding:12px"><div class="kv"><span>Your share (spending)</span><span>${money(myShare)}</span><span>They owe you</span><span class="up">${money(theirs)}</span></div></div>`}
    <${DateNote} ...${{ date, setDate, note, setNote }} />
    <${Footer} ok=${ok} onSave=${save} label="Split it" />`;
}

const FKINDS = [
  ['lend', 'I lent them', 'fout', 'They owe you more'],
  ['borrow', 'I borrowed', 'fin', 'You owe them more'],
  ['repaid', 'They paid me back', 'fin', 'They owe you less'],
  ['repay', 'I paid them back', 'fout', 'You owe them less'],
];

function FriendForm({ s, edit, preset, done }) {
  const [kind, setKind] = useState(edit ? (edit.kind || (edit.t === 'fout' ? 'lend' : 'borrow')) : preset.kind || 'lend');
  const [fid, setFid] = useState(edit ? edit.friend : preset.friend || (s.friends[0] ? s.friends[0].id : 'new'));
  const [newName, setNewName] = useState('');
  const [amt, setAmt] = useState(edit ? String(edit.amt) : preset.amt ? String(preset.amt) : '');
  const k = FKINDS.find((x) => x[0] === kind);
  const [acc, setAcc] = useState(edit ? (k[2] === 'fout' ? edit.from : edit.to) : null);
  const [date, setDate] = useState(edit ? edit.date : today());
  const [note, setNote] = useState(edit ? edit.note : '');
  const bal = friendBalances(s);
  const ok = valid(amt) && (fid !== 'new' || newName.trim());
  const save = () => {
    const friend = ensureFriend(fid, newName);
    const t = k[2];
    const data = { t, kind, amt: parseNum(amt), friend, from: t === 'fout' ? acc : null, to: t === 'fin' ? acc : null, date, note: note || k[1] };
    if (edit) updateTxn(edit.id, data); else addTxn(data);
    toast(k[3], '🤝');
    done();
  };
  return html`
    <${Amount} value=${amt} onInput=${setAmt} label=${T.addFriend} />
    <${Field} label="What happened"><div class="chips">${FKINDS.map(([id, label]) => html`<button class=${`chip ${kind === id ? 'on' : ''}`} onClick=${() => setKind(id)}>${label}</button>`)}</div><//>
    <${Field} label="Who"><${FriendPicker} ...${{ s, value: fid, onChange: setFid, newName, setNewName }} /><//>
    ${fid && fid !== 'new' && html`<div class="note" style="margin:-4px 4px 12px">Right now: ${(() => { const v = bal.get(fid) || 0; return v > 0 ? `they owe you ${money(v)}` : v < 0 ? `you owe them ${money(-v)}` : 'all square'; })()}</div>`}
    <${Field} label=${k[2] === 'fout' ? 'Money came out of' : 'Money went into'}><${PlacePicker} s=${s} value=${acc} onChange=${setAcc} card=${k[2] === 'fout'} none /><//>
    <${DateNote} ...${{ date, setDate, note, setNote }} />
    <${Footer} edit=${edit} ok=${ok} onSave=${(d) => (d ? done() : save())} />`;
}
