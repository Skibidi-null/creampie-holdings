// Settings v2, encrypted backups and data health.
import { useState, useEffect } from 'preact/hooks';
import { html, Back, Sheet, Field, NumInput, Seg, Switch, toast, SettingRow } from './ui.js';
import { Icon } from './icons.js';
import { useStore, get, set, patch, replaceAll, wipe, monthStats, catOf, curOf, txnPln, placeName, balance, toPln, cardOwed, friendBalances, ACCOUNT_KINDS } from './store.js';
import { enablePush, isNative, isIOS, isStandalone, syncConfig } from './push.js';
import { PinSheet, CatSheet } from './more.js';
import { buildXlsx } from './xlsx.js';
import { CURS, today, saveFile, niceDate, parseNum, thisYm, prevYm, ymOf } from './util.js';
import { STYLES } from './advisor.js';
import { useHealth, SOURCES, level, ageTxt } from './data.js';
import { Light } from './holo.js';
import { feedback, sound } from './fx.js';
import { refreshRates } from './gold.js';
import { nativeVersion, checkUpdate } from './updater.js';

const back = () => history.back();
const SECS = [['budget', 'Budget and spending'], ['wealth', 'Wealth and net worth'], ['markets', 'Markets and trading'], ['gold', 'Gold']];

export function Settings() {
  const s = useStore();
  const st = s.settings;
  const [pinSheet, setPinSheet] = useState(false);
  const [catSheet, setCatSheet] = useState(false);
  const [status, setStatus] = useState(null);
  const P = (o) => patch('settings', o);
  return html`<div class="screen stagger">
    <${Back} title="Settings" hint="Creampie Holdings v2.0" onBack=${back} />
    <div class="sect"><span class="h-title">Currency</span></div>
    <div class="card">
      <${Field} label="Show all amounts in"><div class="seg small">${CURS.map((c) => html`<button class=${st.cur === c ? 'on' : ''} onClick=${() => { P({ cur: c }); feedback('tap'); }}>${c}</button>`)}</div><//>
      <div class="hint" style="margin:-4px 2px 10px">Converted with live rates (NBP daily fixing, other currencies from open exchange rates). ${s.rates.date ? `Rates from ${s.rates.date}.` : ''}</div>
      ${SECS.map(([k, n]) => html`<div class="row between" style="padding:6px 0"><span style="font-size:14px">${n}</span>
        <select class="input" style="width:130px;padding:8px 12px;font-size:14px" value=${(st.curSec || {})[k] || ''} onChange=${(e) => P({ curSec: { ...(st.curSec || {}), [k]: e.target.value || undefined } })}>
          <option value="">Same (${st.cur})</option>${CURS.map((c) => html`<option value=${c}>${c}</option>`)}</select></div>`)}
      <button class="btn sm" style="margin-top:8px" onClick=${() => refreshRates(true).then(() => toast('Rates updated'))}>Refresh rates now</button>
    </div>

    <div class="sect"><span class="h-title">Advisor</span></div>
    <div class="card">
      <${Field} label="Risk style"><${Seg} options=${Object.entries(STYLES).map(([k, v]) => [k, v.name])} value=${st.risk || 'balanced'} onChange=${(v) => P({ risk: v })} /><//>
      <${Field} label="Risk per trade (% of net worth)"><${Seg} options=${[[0.5, '0.5%'], [1, '1%'], [1.5, '1.5%'], [2, '2%']]} value=${st.riskPct || 1} onChange=${(v) => P({ riskPct: v })} /><//>
      <${SettingRow} title="Cooling-off timer" hint=${`Big buys (over ${st.cooling.pct}% of your portfolio) when the advisor says Hold or Sell, or right after a spike, wait ${st.cooling.mins} minutes`}><${Switch} on=${st.cooling.on} onChange=${(v) => P({ cooling: { ...st.cooling, on: v } })} /><//>
      ${st.cooling.on && html`<div class="grid2"><${Field} label="Big buy = over % of portfolio"><${NumInput} value=${String(st.cooling.pct)} onInput=${(v) => P({ cooling: { ...st.cooling, pct: parseNum(v) || 10 } })} /><//><${Field} label="Wait (minutes)"><${NumInput} value=${String(st.cooling.mins)} onInput=${(v) => P({ cooling: { ...st.cooling, mins: parseNum(v) || 10 } })} /><//></div>`}
      <${Field} label="Trading 212 currency conversion fee (%)"><${NumInput} value=${String(st.fxFee)} onInput=${(v) => P({ fxFee: parseNum(v) >= 0 ? parseNum(v) : 0.15 })} /><//>
      <${Field} label="Tax residency"><${Seg} options=${[['PL', 'Poland (19% Belka)'], ['AE', 'UAE (no personal tax)']]} value=${st.tax || 'PL'} onChange=${(v) => P({ tax: v })} /><//>
    </div>

    <div class="sect"><span class="h-title">Security</span></div>
    <div class="card">
      <${SettingRow} title="Hide amounts" hint="Blur every amount until you tap the eye"><${Switch} on=${st.privacy} onChange=${(v) => P({ privacy: v })} /><//>
      <${SettingRow} title="PIN lock" hint=${st.pin ? `On${isNative() ? ', fingerprint too' : ''}` : 'Lock the app with a 4 to 6 digit PIN'} onClick=${() => setPinSheet(true)}><span class="ice">${st.pin ? 'Change' : 'Set up'}</span><//>
      ${st.pin && html`<${Field} label="Lock again after the app is in the background for"><${Seg} options=${[[0, 'At once'], [60, '1 min'], [300, '5 min'], [900, '15 min']]} value=${st.autoLock ?? 60} onChange=${(v) => P({ autoLock: v })} /><//>`}
    </div>

    <div class="sect"><span class="h-title">Sound and notifications</span></div>
    <div class="card">
      <${SettingRow} title="Sound effects" hint="Buy, sell, alert set, alert, error"><${Switch} on=${!st.mute} onChange=${(v) => { P({ mute: !v }); if (v) setTimeout(() => sound('buy'), 50); }} /><//>
      ${!st.mute && html`<div class="chips" style="margin:2px 0 8px">${[['buy', 'Buy'], ['sell', 'Sell'], ['set', 'Alert set'], ['alert', 'Alert'], ['error', 'Error']].map(([k, n]) => html`<button class="chip" onClick=${() => sound(k)}><${Icon} n="sound" size=${13} /> ${n}</button>`)}</div>`}
      <${SettingRow} title="Vibration"><${Switch} on=${st.vibrate !== false} onChange=${(v) => P({ vibrate: v })} /><//>
      <${SettingRow} title="Quiet hours" hint=${`${st.quiet.from}:00 to ${st.quiet.to}:00, urgent alerts still come through`}><${Switch} on=${st.quiet.on} onChange=${(v) => P({ quiet: { ...st.quiet, on: v } })} /><//>
      <${SettingRow} title="Sunday summary" hint="Weekly: portfolio change, market moves, advisor calls, next week's events"><${Switch} on=${st.sunday !== false} onChange=${(v) => P({ sunday: v })} /><//>
      <${SettingRow} title="9 pm spending reminder"><${Switch} on=${st.remind9pm} onChange=${(v) => P({ remind9pm: v })} /><//>
      <${SettingRow} title="Card bill reminders"><${Switch} on=${st.cardRemind} onChange=${(v) => P({ cardRemind: v })} /><//>
      <${SettingRow} title="Gold price and news alerts"><${Switch} on=${s.gold.alertsOn} onChange=${(v) => patch('gold', { alertsOn: v })} /><//>
      <${SettingRow} title="Price and signal alerts" hint="Your alerts list"><${Switch} on=${s.markets.alertsOn !== false} onChange=${(v) => patch('markets', { alertsOn: v })} /><//>
      <button class=${`btn block ${st.alertsSetup ? '' : 'primary'}`} style="margin-top:8px" onClick=${async () => { setStatus('…'); const r = await enablePush(); setStatus(r); if (r === 'ok') syncConfig(true); }}>${st.alertsSetup ? 'Notifications on. Check again' : 'Turn on notifications'}</button>
      ${status === 'install-first' && html`<div class="note warn" style="margin-top:8px">iPhone: tap Share, then "Add to Home Screen", open the app from your Home Screen and tap this again.</div>`}
      ${status === 'denied' && html`<div class="note warn" style="margin-top:8px">Blocked. Allow notifications for this app in your phone's settings.</div>`}
      ${status === 'relay-failed' && html`<div class="note warn" style="margin-top:8px">Couldn't reach the alert helper. Check the internet and try again.</div>`}
    </div>

    <div class="sect"><span class="h-title">App</span></div>
    <div class="card">
      ${isNative() && html`<${SettingRow} title="App version" hint=${nativeVersion() || ''} onClick=${checkUpdate}><span class="ice">Check for update</span><//>`}
      <${SettingRow} title="Data health" hint="Status of every price and data source" onClick=${() => (location.hash = '#/health')}><span class="ice">Open</span><//>
      <${SettingRow} title="Backup" hint=${`Encrypted backup file. Last: ${st.lastBackup ? niceDate(typeof st.lastBackup === 'number' ? new Date(st.lastBackup).toISOString().slice(0, 10) : st.lastBackup) : 'never'}`} onClick=${() => (location.hash = '#/backup')}><span class="ice">Open</span><//>
      <${SettingRow} title="Categories" hint="Add your own spending categories" onClick=${() => setCatSheet(true)}><span class="ice">Edit</span><//>
      <${SettingRow} title="Run setup again" hint="Balances, card, monthly limit" onClick=${() => (location.hash = '#/setup')}><span class="ice">Open</span><//>
      <${Field} label="Gold sell-back discount (%)"><${NumInput} value=${String(s.gold.sellSpread)} onInput=${(v) => patch('gold', { sellSpread: parseNum(v) || 0 })} /><//>
    </div>
    ${isIOS() && !isStandalone() && html`<div class="card"><b>Install on iPhone</b><div class="note" style="margin-top:6px">In Safari tap Share, then "Add to Home Screen". It opens full screen like a real app and can send you alerts.</div></div>`}
    <button class="btn danger block" onClick=${() => { if (confirm('Delete ALL data on this phone? This cannot be undone. Save a backup first.') && confirm('Are you sure? Everything will be deleted.')) { wipe(); toast('All data deleted'); location.hash = '#/home'; } }}>Delete all data</button>
    <div class="disclaim">Creampie Holdings v2.0 · your data stays on this device (alert settings are sent encrypted).</div>
    ${pinSheet && html`<${PinSheet} onClose=${() => setPinSheet(false)} />`}
    ${catSheet && html`<${CatSheet} onClose=${() => setCatSheet(false)} />`}
  </div>`;
}

// ---------- encrypted backup (AES-GCM 256, key from password with PBKDF2-SHA256, 310k rounds) ----------
const b64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
async function keyFrom(pw, salt, iter) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
export async function encryptBackup(obj, pw) {
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12)), iter = 310000;
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await keyFrom(pw, salt, iter), new TextEncoder().encode(JSON.stringify(obj))));
  return JSON.stringify({ app: 'creampie-holdings', kind: 'encrypted-backup', v: 2, alg: 'AES-GCM-256/PBKDF2-SHA256', iter, salt: b64(salt), iv: b64(iv), data: b64(ct), at: new Date().toISOString() });
}
export async function decryptBackup(txt, pw) {
  const j = JSON.parse(txt);
  if (j.kind !== 'encrypted-backup') return j; // plain (old) backup
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(j.iv) }, await keyFrom(pw, unb64(j.salt), j.iter), unb64(j.data));
  return JSON.parse(new TextDecoder().decode(pt));
}
function collect(withKeys) {
  const out = { data: get(), extra: {} };
  for (const k of ['cp.alog', 'cp.gold.samples']) { try { const v = localStorage.getItem(k); if (v) out.extra[k] = v; } catch {} }
  if (withKeys) { try { const v = localStorage.getItem('cp.t212'); if (v) out.extra['cp.t212'] = v; } catch {} }
  return out;
}

export function Backup() {
  const s = useStore();
  const [pw, setPw] = useState(''); const [pw2, setPw2] = useState('');
  const [keys, setKeys] = useState(false);
  const [busy, setBusy] = useState(false);
  const [restore, setRestore] = useState(null); // { txt, enc }
  const [rpw, setRpw] = useState('');
  const stamp = today();
  const okPw = pw.length >= 8 && pw === pw2;
  const save = async () => {
    setBusy(true);
    try {
      const txt = await encryptBackup(collect(keys), pw);
      const r = await saveFile(`creampie-backup-${stamp}.cpb`, 'application/octet-stream', new TextEncoder().encode(txt));
      if (r !== 'cancelled') { patch('settings', { lastBackup: Date.now() }); feedback('set'); toast(r === 'saved' ? 'Encrypted backup saved to Downloads' : 'Encrypted backup ready'); setPw(''); setPw2(''); }
    } catch (e) { feedback('error'); toast('Backup failed: ' + e.message, '!'); }
    setBusy(false);
  };
  const pick = (e) => { const f = e.target.files && e.target.files[0]; if (!f) return; f.text().then((txt) => { let enc = false; try { enc = JSON.parse(txt).kind === 'encrypted-backup'; } catch { toast('That file is not a backup from this app', '!'); return; } setRestore({ txt, enc, name: f.name }); }); e.target.value = ''; };
  const doRestore = async () => {
    setBusy(true);
    try {
      const d = await decryptBackup(restore.txt, rpw);
      const data = d.data || d; // v2 {data, extra} or v1 plain state
      if (!data || !Array.isArray(data.txns) || !Array.isArray(data.accounts)) throw new Error('bad');
      if (!confirm(`Replace everything on this device with the backup (${data.txns.length} entries)?`)) { setBusy(false); return; }
      replaceAll(data);
      for (const [k, v] of Object.entries(d.extra || {})) { try { localStorage.setItem(k, v); } catch {} }
      feedback('set'); toast('Backup restored'); setRestore(null); setRpw('');
    } catch (e) { feedback('error'); toast(restore.enc ? 'Wrong password or damaged file' : 'That file is not a backup from this app', '!'); }
    setBusy(false);
  };
  const exportXlsx = async () => {
    const st = get();
    const fr = (id) => (st.friends.find((f) => f.id === id) || {}).name || '';
    const TYPES = { exp: 'Expense', inc: 'Income', xfer: 'Transfer', fout: 'To friend', fin: 'From friend', gold: 'Gold purchase', adj: 'Correction' };
    const tx = [...st.txns].sort((a, b) => a.date.localeCompare(b.date));
    const months = []; let ym = thisYm(); const first = tx.length ? ymOf(tx[0].date) : ym;
    while (ym >= first && months.length < 60) { months.push(monthStats(st, ym)); ym = prevYm(ym); }
    const bytes = buildXlsx([
      { name: 'Transactions', rows: [['Date', 'Type', 'Category', 'Amount', 'Currency', 'Amount (PLN)', 'From', 'To', 'Friend', 'Note'], ...tx.map((t) => [t.date, TYPES[t.t] || t.t, t.cat ? catOf(st, t.cat).name : '', t.amt, curOf(st, t.from || t.to), txnPln(st, t), t.from ? placeName(st, t.from) : '', t.to ? placeName(st, t.to) : '', t.friend ? fr(t.friend) : '', t.note || ''])] },
      { name: 'Monthly', rows: [['Month', 'Income', 'Spending', 'Net', 'Saved', 'On card'], ...months.map((m) => [m.ym, m.income, m.spend, m.net, m.saved, m.card])] },
      { name: 'Accounts', rows: [['Account', 'Type', 'Currency', 'Balance', 'Balance (PLN)'], ...st.accounts.map((a) => [a.name, ACCOUNT_KINDS[a.kind], a.cur, balance(st, a.id), toPln(st, balance(st, a.id), a.cur)]), [], ['Credit card', 'Limit', st.card.limit, 'Owed', cardOwed(st)]] },
      { name: 'Gold', rows: [['Date', 'Grams', 'Bought at (zł/g)', 'Market price (zł/g)', 'Total paid', 'Note'], ...st.gold.buys.map((b) => [b.date, b.g, b.paid, b.market || '', b.g * b.paid, b.note || ''])] },
      { name: 'Holdings', rows: [['Broker', 'Symbol', 'Name', 'Quantity', 'Cost each', 'Currency'], ...(st.holdings || []).map((h) => [h.broker, h.sym, h.name, h.qty, h.cost, h.cur])] },
      { name: 'Journal', rows: [['Date', 'Symbol', 'Side', 'Qty', 'Price', 'Why', 'Result'], ...(st.journal || []).map((j) => [j.date, j.sym, j.side, j.qty, j.px, j.why || '', j.result || ''])] },
      { name: 'Friends', rows: [['Person', 'Balance (+ owes me / - I owe)'], ...st.friends.map((f) => [f.name, friendBalances(st).get(f.id) || 0])] },
    ]);
    const r = await saveFile(`creampie-holdings-${stamp}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', bytes);
    if (r !== 'cancelled') toast('Excel exported');
  };
  const last = s.settings.lastBackup; const lastT = typeof last === 'number' ? last : last ? Date.parse(last) : 0;
  const due = !lastT || Date.now() - lastT > 7 * 864e5;
  return html`<div class="screen stagger">
    <${Back} title="Backup" hint="Encrypted backup, restore, Excel" onBack=${back} />
    <div class=${`card ${due ? '' : ''}`}>
      <div class="row between"><span class="label">Encrypted backup</span><span class=${`tag ${due ? 'watch' : 'up'}`}>${lastT ? 'Last ' + new Date(lastT).toLocaleDateString() : 'Never backed up'}</span></div>
      <div class="note" style="margin:8px 0 12px">Everything (money, gold, alerts, journal, settings) in one file locked with your password (AES-256). Without the password nobody can read it, not even us. ${isNative() ? 'Android saves it to your Downloads folder.' : isIOS() ? 'iPhone opens the Share sheet: choose "Save to Files" or iCloud.' : ''}</div>
      <${Field} label="Password (8+ characters)"><input class="input" type="password" value=${pw} onInput=${(e) => setPw(e.target.value)} autocomplete="new-password" /><//>
      <${Field} label="Same password again"><input class="input" type="password" value=${pw2} onInput=${(e) => setPw2(e.target.value)} autocomplete="new-password" /><//>
      <${SettingRow} title="Include Trading 212 keys" hint="Off by default. Only if you need them on a new phone"><${Switch} on=${keys} onChange=${setKeys} /><//>
      <button class="btn holo block big" disabled=${!okPw || busy} onClick=${save}><${Icon} n="lock" size=${17} /> ${busy ? 'Encrypting…' : 'Save encrypted backup'}</button>
      ${pw && pw2 && pw !== pw2 && html`<div class="note warn" style="margin-top:6px">The passwords don't match.</div>`}
      <div class="note" style="margin-top:8px">Write the password down. If you lose it, the backup cannot be opened.</div>
      <${SettingRow} title="Weekly reminder" hint="A nudge on Home when the last backup is older than 7 days"><${Switch} on=${s.settings.backupRemind !== false} onChange=${(v) => patch('settings', { backupRemind: v })} /><//>
    </div>
    <div class="card">
      <span class="label">Restore</span>
      <div class="note" style="margin:8px 0 12px">Works with encrypted backups and old plain backups from v1.</div>
      <label class="btn block"><${Icon} n="upload" size=${17} /> Choose backup file<input type="file" accept=".cpb,.json,application/json,application/octet-stream" style="display:none" onChange=${pick} /></label>
      ${restore && html`<div style="margin-top:12px"><div class="hint" style="margin-bottom:8px">${restore.name}${restore.enc ? ' (encrypted)' : ' (plain, from v1)'}</div>
        ${restore.enc && html`<${Field} label="Backup password"><input class="input" type="password" value=${rpw} onInput=${(e) => setRpw(e.target.value)} /><//>`}
        <button class="btn primary block" disabled=${busy || (restore.enc && !rpw)} onClick=${doRestore}>${busy ? 'Opening…' : 'Restore this backup'}</button></div>`}
    </div>
    <div class="card"><span class="label">Excel export</span><div class="note" style="margin:8px 0 12px">Transactions, months, accounts, gold, holdings, journal and friends in a spreadsheet (not encrypted).</div><button class="btn block" onClick=${exportXlsx}><${Icon} n="download" size=${17} /> Export to Excel (.xlsx)</button></div>
  </div>`;
}

// ---------- data health ----------
const FRESH = { cnbc: 5 * 60e3, coinbase: 5 * 60e3, gold: 2 * 60e3, nbp: 26 * 3600e3, fx: 6 * 3600e3, news: 20 * 60e3, cftc: 8 * 864e5, fng: 26 * 3600e3 };
export function Health() {
  const h = useHealth();
  const [, t] = useState(0);
  useEffect(() => { const i = setInterval(() => t((x) => x + 1), 5000); return () => clearInterval(i); }, []);
  return html`<div class="screen stagger">
    <${Back} title="Data health" hint="Where every number comes from" onBack=${back} />
    <div class="card" style="padding:4px 14px">${Object.entries(SOURCES).map(([k, n]) => { const lv = level(k, FRESH[k]); const x = h[k];
      return html`<div class="item"><${Light} src=${k} fresh=${FRESH[k]} text=${false} /><div class="grow"><div class="t1">${n}</div><div class="t2">${!x ? 'Not used yet this session' : x.ok === false ? `Not answering (${x.err || 'error'}), last good ${ageTxt(x.at)}` : `Last update ${ageTxt(x.at)}`}</div></div><span class=${`tag ${lv === 'ok' ? 'up' : lv === 'bad' ? 'down' : 'watch'}`}>${{ ok: 'Live', old: 'Old', bad: 'Down', off: 'Idle' }[lv]}</span></div>`; })}</div>
    <div class="card"><span class="label">Sources and fallbacks</span><div class="gd-b" style="margin-top:8px">
      <b>Stocks, ETFs, indices, futures, forex, bond yields:</b> CNBC (free, about 15 s delay at most). If it stops answering, the last prices stay visible with their age and are never shown as live.<br/>
      <b>Crypto:</b> Coinbase Exchange (prices, candles, order book). Background checks use the same.<br/>
      <b>Gold spot:</b> gold-api.com every second; fallback to the last NBP gold fixing.<br/>
      <b>Exchange rates:</b> NBP table A (official), fallback open.er-api.com for currencies NBP lacks or when NBP is down.<br/>
      <b>News and calendar:</b> written by the online job every 10 minutes (Google News, Forex Factory calendar).<br/>
      <b>Positioning:</b> CFTC weekly report. <b>Fear and Greed:</b> alternative.me (daily).</div></div>
  </div>`;
}
