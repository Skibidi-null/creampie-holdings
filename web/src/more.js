import { useState, useEffect } from 'preact/hooks';
import { html, Money, Back, Sheet, Field, NumInput, Switch, Seg, toast, valid, SettingRow, Bar } from './ui.js';
import { useStore, get, set, patch, replaceAll, wipe, balance, cardOwed, friendBalances, goldTotals, cashTotal, monthStats, catOf, placeName, curOf, txnPln, toPln, ACCOUNT_KINDS } from './store.js';
import { useLive, priceNow, silverPerGram, refreshRates } from './gold.js';
import { enablePush, isNative, isIOS, isStandalone } from './push.js';
import { buildXlsx } from './xlsx.js';
import { T } from './copy.js';
import { num, money, parseNum, today, sha256, saveFile, uid, thisYm, prevYm, ymOf, addDays, niceDate, daysBetween } from './util.js';

const back = () => history.back();

// ---------- zakat ----------
export function Zakat() {
  const s = useStore();
  const lv = useLive();
  const gp = lv.price || priceNow();
  const [silver, setSilver] = useState(null);
  const [silverTried, setSilverTried] = useState(false);
  useEffect(() => { refreshRates().then(() => silverPerGram()).then((v) => { setSilver(v); setSilverTried(true); }); }, []);
  const z = s.zakat;
  const [other, setOther] = useState(z.other ? String(z.other) : '');
  const [debts, setDebts] = useState(z.debts ? String(z.debts) : '');

  // what you own
  const cash = Math.max(0, cashTotal(s));
  const gt = goldTotals(s, gp);
  const gold = gt.value;
  let owedMe = 0, iOwe = 0;
  for (const v of friendBalances(s).values()) { if (v > 0) owedMe += v; else iOwe -= v; }
  const otherV = z.other || 0;
  const assets = cash + gold + (z.countOwed ? owedMe : 0) + otherV;
  // what you owe now
  const card = s.card.on ? Math.max(0, cardOwed(s)) : 0;
  const debtsV = z.debts || 0;
  const minus = card + iOwe + debtsV;
  const net = Math.max(0, assets - minus);

  const nisabGold = gp ? gp * 85 : 0;
  const nisabSilver = silver ? silver * 595 : 0;
  const useSilver = z.nisab === 'silver';
  const nisab = useSilver ? nisabSilver : nisabGold;
  const ready = nisab > 0;
  const due = ready && net >= nisab;
  const zak = due ? net * 0.025 : 0;
  const hawlEnd = z.hawl ? addDays(z.hawl, 354) : null;
  const daysTo = hawlEnd ? daysBetween(today(), hawlEnd) : null;

  return html`<div class="screen">
    <${Back} title="Zakat" hint="2.5% of savings held for one lunar year above nisab" onBack=${back} />

    <div class="card hero" style="text-align:center">
      ${!ready ? html`<div class="label">Getting today's ${useSilver ? 'silver' : 'gold'} price…</div><div class="hint" style="margin-top:6px">${useSilver && silverTried ? 'Could not load the silver price. Check internet or use the gold nisab.' : 'Needed to work out the nisab.'}</div>`
      : due ? html`<div class="label">Zakat to pay</div><div class="big up"><${Money} v=${zak} /></div><div class="sub">2.5% of <${Money} v=${net} d=${0} /></div>`
      : html`<div class="label">No zakat due</div><div class="big"><${Money} v=${0} d=${0} /></div><div class="sub">Your net savings <${Money} v=${net} d=${0} /> are below the nisab <${Money} v=${nisab} d=${0} /></div>`}
    </div>

    <div class="card">
      <b>What you own</b>
      <div class="kv" style="margin-top:8px">
        <span>Cash, bank & savings</span><${Money} v=${cash} />
        <span>Gold: ${num(gt.grams, 2)} g × ${gp ? num(gp) : '…'} zł</span><${Money} v=${gold} />
        <span>Money friends owe you${z.countOwed ? '' : ' (not counted)'}</span><span class=${z.countOwed ? '' : 'mute'}><${Money} v=${owedMe} /></span>
        <span>Other assets</span><${Money} v=${otherV} />
        <span class="total">Total</span><span class="total"><${Money} v=${assets} /></span>
      </div>
      <div class="sep"></div>
      <b>Minus what you owe now</b>
      <div class="kv" style="margin-top:8px">
        <span>Credit card balance</span><${Money} v=${card} />
        <span>Money you owe friends</span><${Money} v=${iOwe} />
        <span>Other debts due now</span><${Money} v=${debtsV} />
        <span class="total">Total</span><span class="total"><${Money} v=${minus} /></span>
      </div>
      <div class="sep"></div>
      <div class="kv">
        <span class="total">Net zakatable wealth</span><span class="total"><${Money} v=${net} /></span>
        <span>Nisab (${useSilver ? '595 g silver' : '85 g gold'})</span><span>${ready ? html`<${Money} v=${nisab} d=${0} />` : '…'}</span>
        <span class="total">Zakat (2.5%)</span><span class="total up"><${Money} v=${zak} /></span>
      </div>
      ${ready && html`<div style="margin-top:12px"><${Bar} v=${net / nisab} cls=${due ? 'ok' : ''} /><div class="hint" style="margin-top:4px">${due ? 'Above nisab' : `${num(Math.min(100, (net / nisab) * 100), 0)}% of nisab`}</div></div>`}
    </div>

    <div class="card">
      <b>Nisab</b>
      <div class="hint" style="margin:2px 0 10px">The minimum amount before zakat applies</div>
      <${Seg} options=${[['gold', 'Gold · 85 g'], ['silver', 'Silver · 595 g']]} value=${z.nisab} onChange=${(v) => patch('zakat', { nisab: v })} />
      <div class="kv" style="margin-top:10px;font-size:13.5px">
        <span>Gold price today</span><span>${gp ? num(gp) + ' zł/g' : '…'}</span>
        <span>85 g gold</span><span>${nisabGold ? html`<${Money} v=${nisabGold} d=${0} />` : '…'}</span>
        <span>Silver price today</span><span>${silver ? num(silver) + ' zł/g' : silverTried ? 'unavailable' : '…'}</span>
        <span>595 g silver</span><span>${nisabSilver ? html`<${Money} v=${nisabSilver} d=${0} />` : '…'}</span>
      </div>
    </div>

    <div class="card">
      <${SettingRow} title="Count money friends owe me" hint="Only if you expect to get it back"><${Switch} on=${z.countOwed} onChange=${(v) => patch('zakat', { countOwed: v })} /><//>
      <div class="sep"></div>
      <${Field} label="Other assets (zł): shares, crypto, business stock, cash at home not in the app"><${NumInput} value=${other} onInput=${(v) => { setOther(v); patch('zakat', { other: parseNum(v) || 0 }); }} placeholder="0" /><//>
      <${Field} label="Other debts due now (zł): rent owed, loan instalment due"><${NumInput} value=${debts} onInput=${(v) => { setDebts(v); patch('zakat', { debts: parseNum(v) || 0 }); }} placeholder="0" /><//>
      <${Field} label="My zakat year started on"><input class="input" type="date" value=${z.hawl} onInput=${(e) => patch('zakat', { hawl: e.target.value })} /><//>
      ${hawlEnd && html`<div class="note">Next zakat date (1 lunar year = 354 days): <b>${niceDate(hawlEnd)}</b>${daysTo > 0 ? ` · in ${daysTo} days` : daysTo === 0 ? ' · today' : ' · already passed. Pay now and set a new start date.'}</div>`}
    </div>
    <div class="note" style="padding:0 6px">Gold is valued at today's live market price. This is a helper, not a fatwa. Jewellery worn personally, business assets and long-term loans have different rulings, so ask a scholar for your case.</div>
  </div>`;
}

// ---------- currency converter ----------
const CURS = ['PLN', 'EUR', 'USD', 'AED', 'GBP', 'INR'];
const CUR_NAMES = { PLN: 'Polish złoty', EUR: 'Euro', USD: 'US dollar', AED: 'UAE dirham', GBP: 'British pound', INR: 'Indian rupee' };
export function Convert() {
  const s = useStore();
  const [busy, setBusy] = useState(false);
  const reload = async () => { setBusy(true); await refreshRates(true); setBusy(false); };
  useEffect(() => { reload(); }, []);
  const [amt, setAmt] = useState('100');
  const [from, setFrom] = useState('EUR');
  const v = parseNum(amt) || 0;
  const rate = (c) => (c === 'PLN' ? 1 : s.rates[c] || NaN); // zł per 1 unit
  const pln = v * rate(from);
  const src = s.rates.src || {};
  return html`<div class="screen">
    <${Back} title=${T.convert} hint="Today's official rates" onBack=${back} right=${html`<button class="iconbtn" onClick=${reload} aria-label="Refresh">${busy ? '…' : '↻'}</button>`} />
    <div class="card">
      <div class="amount"><div class="cur">${CUR_NAMES[from]} (${from})</div><${NumInput} cls="" value=${amt} onInput=${setAmt} /></div>
      <div class="chips" style="justify-content:center">${CURS.map((c) => html`<button class=${`chip ${from === c ? 'on' : ''}`} onClick=${() => setFrom(c)}>${c}</button>`)}</div>
    </div>
    <div class="card" style="padding:4px 14px">
      ${CURS.filter((c) => c !== from).map((c) => { const out = pln / rate(c); const r1 = rate(from) / rate(c); return html`<div class="item">
        <span class="em" style="font-size:12px;font-weight:700">${c}</span>
        <div class="grow"><div class="t1" style="font-weight:500">${CUR_NAMES[c]}</div><div class="t2">1 ${from} = ${Number.isFinite(r1) ? num(r1, r1 < 0.1 ? 5 : 4) : '…'} ${c}</div></div>
        <span class="amt" style="font-size:17px">${Number.isFinite(out) ? money(out, c) : '…'}</span>
      </div>`; })}
    </div>
    <div class="hint" style="text-align:center;line-height:1.6">
      ${s.rates.date ? html`Latest official rates: <b>${niceDate(s.rates.date)}</b> · ` : ''}checked ${s.rates.at ? new Date(s.rates.at).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '…'}<br/>
      ${CURS.filter((c) => c !== 'PLN').map((c) => `${c}: ${src[c] === 'nbp' ? 'NBP' : src[c] === 'er' ? 'open.er-api' : '…'}`).join(' · ')}<br/>
      Official mid-market rates, updated once per working day. Banks and exchange shops add their own margin.
    </div>
  </div>`;
}

// ---------- backup / export ----------
export function Backup() {
  const s = useStore();
  const stamp = today();
  const exportJson = async () => {
    const r = await saveFile(`creampie-backup-${stamp}.json`, 'application/json', new TextEncoder().encode(JSON.stringify(get(), null, 1)));
    if (r !== 'cancelled') { patch('settings', { lastBackup: stamp }); toast('Backup saved'); }
  };
  const exportXlsx = async () => {
    const st = get();
    const fr = (id) => (st.friends.find((f) => f.id === id) || {}).name || '';
    const TYPES = { exp: 'Expense', inc: 'Income', xfer: 'Transfer', fout: 'To friend', fin: 'From friend', gold: 'Gold purchase', adj: 'Correction' };
    const tx = [...st.txns].sort((a, b) => a.date.localeCompare(b.date));
    const months = []; let ym = thisYm(); const first = tx.length ? ymOf(tx[0].date) : ym;
    while (ym >= first && months.length < 60) { months.push(monthStats(st, ym)); ym = prevYm(ym); }
    const bytes = buildXlsx([
      { name: 'Transactions', rows: [['Date', 'Type', 'Category', 'Amount', 'Currency', 'Amount (PLN)', 'From', 'To', 'Friend', 'Note'],
        ...tx.map((t) => [t.date, TYPES[t.t] || t.t, t.cat ? catOf(st, t.cat).name : '', t.amt, curOf(st, t.from || t.to), txnPln(st, t), t.from ? placeName(st, t.from) : '', t.to ? placeName(st, t.to) : '', t.friend ? fr(t.friend) : '', t.note || ''])] },
      { name: 'Monthly', rows: [['Month', 'Income', 'Spending', 'Net', 'Saved', 'On card'], ...months.map((m) => [m.ym, m.income, m.spend, m.net, m.saved, m.card])] },
      { name: 'Accounts', rows: [['Account', 'Type', 'Currency', 'Balance', 'Balance (PLN)'], ...st.accounts.map((a) => [a.name, ACCOUNT_KINDS[a.kind], a.cur, balance(st, a.id), toPln(st, balance(st, a.id), a.cur)]), [], ['Credit card', 'Limit', st.card.limit, 'Owed', cardOwed(st)]] },
      { name: 'Gold', rows: [['Date', 'Grams', 'Bought at (zł/g)', 'Market price (zł/g)', 'Premium %', 'Total paid', 'Note'], ...st.gold.buys.map((b) => [b.date, b.g, b.paid, b.market || '', b.market ? ((b.paid - b.market) / b.market) * 100 : '', b.g * b.paid, b.note || ''])] },
      { name: 'Friends', rows: [['Person', 'Balance (+ owes me / − I owe)'], ...st.friends.map((f) => [f.name, friendBalances(st).get(f.id) || 0])] },
      { name: 'Bills', rows: [['Bill', 'Amount', 'Day', 'Paid with', 'Paused'], ...st.recurring.map((r) => [r.name, r.amt, r.day, placeName(st, r.from), r.paused ? 'yes' : ''])] },
      { name: 'Goals', rows: [['Goal', 'Target', 'Saved', 'Deadline'], ...st.goals.map((g) => [g.name, g.target, g.saved, g.by || ''])] },
    ]);
    const r = await saveFile(`creampie-holdings-${stamp}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', bytes);
    if (r !== 'cancelled') toast('Excel exported 📊', '✅');
  };
  const restore = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    f.text().then((txt) => {
      try {
        const d = JSON.parse(txt);
        if (!d || !Array.isArray(d.txns) || !Array.isArray(d.accounts)) throw new Error('bad');
        if (!confirm(`Replace everything on this phone with the backup (${d.txns.length} entries)?`)) return;
        replaceAll(d); toast('Backup restored');
      } catch { toast('That file isn\'t a backup from this app', '⚠️'); }
    });
    e.target.value = '';
  };
  return html`<div class="screen">
    <${Back} title=${T.backup} hint="Backup, restore & Excel" onBack=${back} />
    <div class="card">
      <b>Backup</b>
      <div class="note" style="margin:6px 0 12px">Your data lives only on this phone. Save a backup now and then (to Google Drive, iCloud Files or email it to yourself). Use it to move to a new phone too.</div>
      <div class="hint" style="margin-bottom:10px">Last backup: ${s.settings.lastBackup ? niceDate(s.settings.lastBackup) : 'never'}</div>
      <button class="btn primary block" onClick=${exportJson}>💾 Save backup file</button>
      <label class="btn block" style="margin-top:8px">📂 Restore from backup<input type="file" accept=".json,application/json" style="display:none" onChange=${restore} /></label>
    </div>
    <div class="card">
      <b>Excel export 📊</b>
      <div class="note" style="margin:6px 0 12px">Everything in a spreadsheet: transactions, months, accounts, gold, friends, bills, goals.</div>
      <button class="btn block" onClick=${exportXlsx}>Export to Excel (.xlsx)</button>
    </div>
  </div>`;
}

// ---------- settings ----------
export function Settings() {
  const s = useStore();
  const [pinSheet, setPinSheet] = useState(false);
  const [catSheet, setCatSheet] = useState(false);
  const [status, setStatus] = useState(null);
  const st = s.settings;
  return html`<div class="screen">
    <${Back} title=${T.settings} hint="Settings" onBack=${back} />
    <div class="card">
      <${SettingRow} title=${T.discreet} hint=${T.discreetHint}><${Switch} on=${st.privacy} onChange=${(v) => patch('settings', { privacy: v })} /><//>
      <div class="sep"></div>
      <${SettingRow} title=${T.members} hint=${st.pin ? 'PIN lock is on' : 'Lock the app with a PIN'} onClick=${() => setPinSheet(true)}><span class="pink">${st.pin ? 'Change' : 'Set up'} →</span><//>
    </div>
    <div class="card">
      <div class="h-title" style="margin-bottom:6px">Notifications</div>
      <${SettingRow} title="9 pm reminder" hint="Reminds you to add today's spending"><${Switch} on=${st.remind9pm} onChange=${(v) => patch('settings', { remind9pm: v })} /><//>
      <${SettingRow} title="Card bill reminders"><${Switch} on=${st.cardRemind} onChange=${(v) => patch('settings', { cardRemind: v })} /><//>
      <${SettingRow} title="Gold price & news alerts" hint="Set targets on the Gold screen"><${Switch} on=${s.gold.alertsOn} onChange=${(v) => patch('gold', { alertsOn: v })} /><//>
      <button class=${`btn block ${st.alertsSetup ? '' : 'primary'}`} style="margin-top:8px" onClick=${async () => { setStatus('…'); const r = await enablePush(); setStatus(r); }}>${st.alertsSetup ? '✅ Notifications on. Re-check' : '🔔 Turn on notifications'}</button>
      ${status === 'install-first' && html`<div class="note warn" style="margin-top:8px">iPhone: tap Share ⬆️ → “Add to Home Screen”, open the app from your Home Screen, then tap this again.</div>`}
      ${status === 'denied' && html`<div class="note warn" style="margin-top:8px">Blocked. Allow notifications for this app in your phone's Settings.</div>`}
      ${status === 'relay-failed' && html`<div class="note warn" style="margin-top:8px">Couldn't reach the alert helper. Check internet and try again.</div>`}
    </div>
    <div class="card">
      <${SettingRow} title="Categories" hint="Add your own spending categories" onClick=${() => setCatSheet(true)}><span class="pink">Edit →</span><//>
      <div class="sep"></div>
      <${SettingRow} title="Run setup again" hint="Balances, card, monthly limit" onClick=${() => (location.hash = '#/setup')}><span class="pink">→</span><//>
      <div class="sep"></div>
      <${Field} label="Gold sell-back discount (%)"><${NumInput} value=${String(s.gold.sellSpread)} onInput=${(v) => patch('gold', { sellSpread: parseNum(v) || 0 })} /><//>
    </div>
    ${isIOS() && !isStandalone() && html`<div class="card"><b>Install on iPhone</b><div class="note" style="margin-top:6px">In Safari tap Share ⬆️ → “Add to Home Screen”. It opens full-screen like a real app and can send you alerts.</div></div>`}
    <div class="card">
      <button class="btn danger block" onClick=${() => { if (confirm('Delete ALL data on this phone? This cannot be undone. Save a backup first!') && confirm('Are you sure? Everything will be deleted.')) { wipe(); toast('All data deleted', '🗑️'); location.hash = '#/home'; } }}>Delete all data</button>
    </div>
    <div class="hint" style="text-align:center;margin-top:10px">${T.app} · v1.1<br/>Your data never leaves this phone (except encrypted alert settings).</div>
    ${pinSheet && html`<${PinSheet} onClose=${() => setPinSheet(false)} />`}
    ${catSheet && html`<${CatSheet} onClose=${() => setCatSheet(false)} />`}
  </div>`;
}

function PinSheet({ onClose }) {
  const s = useStore();
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const ok = /^\d{4,6}$/.test(a) && a === b;
  return html`<${Sheet} title=${T.members} onClose=${onClose}>${(close) => html`
    <div class="note" style="margin-bottom:12px">Choose a 4–6 digit PIN. You'll need it every time you open the app.${isNative() ? ' You can also use your fingerprint.' : ''} If you forget it, you'll have to reinstall and restore a backup.</div>
    <${Field} label="New PIN"><input class="input mono" type="password" inputmode="numeric" maxlength="6" value=${a} onInput=${(e) => setA(e.target.value.replace(/\D/g, ''))} /><//>
    <${Field} label="Again"><input class="input mono" type="password" inputmode="numeric" maxlength="6" value=${b} onInput=${(e) => setB(e.target.value.replace(/\D/g, ''))} /><//>
    <div class="btns">
      ${s.settings.pin && html`<button class="btn danger" onClick=${() => { patch('settings', { pin: null }); toast('PIN removed', '🔓'); close(); }}>Remove PIN</button>`}
      <button class="btn primary grow" disabled=${!ok} style=${{ opacity: ok ? 1 : 0.4 }} onClick=${async () => { patch('settings', { pin: await sha256('cph:' + a) }); toast('PIN saved', '🔒'); close(); }}>Save PIN</button>
    </div>
  `}<//>`;
}

const EMOJIS = ['🍔', '🍕', '🥙', '🛍️', '🎮', '🎬', '🍺', '🚬', '💊', '🐶', '👶', '🏋️', '📦', '🧾', '💄', '🎉', '⛽', '🅿️', '🧺', '🛠️'];
function CatSheet({ onClose }) {
  const s = useStore();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🛍️');
  const used = new Set(s.txns.map((t) => t.cat));
  return html`<${Sheet} title="Categories" onClose=${onClose}>${(close) => html`
    <div class="chips" style="margin-bottom:14px">${s.cats.exp.map((c) => html`<button class="chip" onClick=${() => {
      if (used.has(c.id)) return toast('Used by entries, so it can\'t be removed', '⚠️');
      if (confirm(`Remove “${c.name}”?`)) set((x) => ({ ...x, cats: { ...x.cats, exp: x.cats.exp.filter((y) => y.id !== c.id) } }));
    }}>${c.icon} ${c.name} ✕</button>`)}</div>
    <${Field} label="New category"><input class="input" value=${name} onInput=${(e) => setName(e.target.value)} placeholder="e.g. Shisha, Gaming, Pets" /><//>
    <div class="chips" style="margin-bottom:12px">${EMOJIS.map((e) => html`<button class=${`chip ${icon === e ? 'on' : ''}`} onClick=${() => setIcon(e)}>${e}</button>`)}</div>
    <button class="btn primary block" disabled=${!name.trim()} onClick=${() => { set((x) => ({ ...x, cats: { ...x.cats, exp: [...x.cats.exp, { id: 'c_' + uid(), name: name.trim(), icon, group: 'Custom' }] } })); setName(''); toast('Category added', '🏷️'); }}>Add category</button>
  `}<//>`;
}

// ---------- first-run setup ----------
export function Setup() {
  const s = useStore();
  const [step, setStep] = useState(0);
  const [bals, setBals] = useState(() => Object.fromEntries(s.accounts.map((a) => [a.id, balance(s, a.id) ? String(+balance(s, a.id).toFixed(2)) : ''])));
  const [names, setNames] = useState(() => Object.fromEntries(s.accounts.map((a) => [a.id, a.name])));
  const [hasCard, setHasCard] = useState(s.card.on);
  const [limit, setLimit] = useState(s.card.limit ? String(s.card.limit) : '');
  const [owed, setOwed] = useState(cardOwed(s) ? String(+cardOwed(s).toFixed(2)) : '');
  const [day, setDay] = useState(s.card.dueDay ? String(s.card.dueDay) : '');
  const [monthly, setMonthly] = useState(s.budget.monthly ? String(s.budget.monthly) : '');
  const finish = () => {
    set((x) => {
      const accounts = x.accounts.map((a) => {
        const target = parseNum(bals[a.id]) || 0;
        const cur = balance(x, a.id);
        return { ...a, name: (names[a.id] || a.name).trim() || a.name, opening: (a.opening || 0) + (target - cur) };
      });
      const owed0 = cardOwed(x);
      const card = { ...x.card, on: hasCard, limit: parseNum(limit) || 0, opening: (x.card.opening || 0) + ((parseNum(owed) || 0) - owed0), dueDay: Math.min(31, Math.round(parseNum(day) || 0)) };
      return { ...x, accounts, card, budget: { ...x.budget, monthly: parseNum(monthly) || 0 }, settings: { ...x.settings, onboarded: true } };
    });
    toast('All set');
    location.hash = '#/home';
  };
  const steps = [
    html`<div>
      <div class="h-big" style="margin-bottom:6px">Your money right now</div>
      <div class="note" style="margin-bottom:14px">Rename these to your real accounts (ING, Revolut…) and type what's in each today. You can add more later.</div>
      ${s.accounts.map((a) => html`<div class="card" style="padding:12px">
        <div class="row" style="gap:8px"><span style="font-size:22px">${a.icon}</span><input class="input" style="flex:1" value=${names[a.id]} onInput=${(e) => setNames({ ...names, [a.id]: e.target.value })} /></div>
        <div style="margin-top:8px"><${NumInput} value=${bals[a.id]} onInput=${(v) => setBals({ ...bals, [a.id]: v })} placeholder=${`Balance in ${a.cur}`} /></div>
      </div>`)}
    </div>`,
    html`<div>
      <div class="h-big" style="margin-bottom:6px">Credit card</div>
      <${SettingRow} title="I have a credit card"><${Switch} on=${hasCard} onChange=${setHasCard} /><//>
      ${hasCard && html`
        <${Field} label="Credit limit (zł)"><${NumInput} value=${limit} onInput=${setLimit} placeholder="5000" /><//>
        <${Field} label="How much you owe on it now (zł)"><${NumInput} value=${owed} onInput=${setOwed} placeholder="0" /><//>
        <${Field} label="Bill payment day of the month"><${NumInput} value=${day} onInput=${setDay} placeholder="e.g. 25" /><//>`}
    </div>`,
    html`<div>
      <div class="h-big" style="margin-bottom:6px">Monthly limit</div>
      <div class="note" style="margin-bottom:14px">How much do you want to spend per month max (excluding savings)? I'll turn it into a daily limit. Leave empty to skip.</div>
      <${Field} label="Monthly limit (zł)"><${NumInput} value=${monthly} onInput=${setMonthly} placeholder="e.g. 4000" /><//>
    </div>`,
  ];
  return html`<div class="screen">
    <${Back} title="Setup" hint=${`Step ${step + 1} of ${steps.length}`} onBack=${() => (step ? setStep(step - 1) : back())} />
    <div class="row" style="gap:6px;margin-bottom:16px">${steps.map((_, i) => html`<div class="grow" style=${{ height: '4px', borderRadius: '4px', background: i <= step ? 'var(--accent)' : 'var(--line)' }}></div>`)}</div>
    ${steps[step]}
    <button class="btn primary block" style="margin-top:12px" onClick=${() => (step < steps.length - 1 ? setStep(step + 1) : finish())}>${step < steps.length - 1 ? 'Next →' : 'Finish'}</button>
  </div>`;
}
