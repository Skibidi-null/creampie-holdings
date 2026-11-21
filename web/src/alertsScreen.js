// Alerts screen: all alerts, or one asset's alerts on its chart (drag lines to move them),
// add sheet with every kind, a price ladder to set many levels at once, quiet hours, history.
import { useState } from 'preact/hooks';
import { html, Back, Sheet, Field, NumInput, Seg, Switch, toast, SettingRow } from './ui.js';
import { Icon } from './icons.js';
import { useStore, patch } from './store.js';
import { useAssetsLive, nameOf, fmtPrice, A, search } from './assets.js';
import { ChartCard } from './chart.js';
import { KINDS, describe, addAlert, updateAlert, removeAlert, firedLog, inQuiet, startAlerts } from './alerts.js';
import { feedback } from './fx.js';
import { parseNum } from './util.js';
import { enablePush, isNative } from './push.js';

export { startAlerts };
const go = (r) => { location.hash = '#/' + r; };
const nice = (v) => +(v >= 1000 ? v.toFixed(0) : v >= 1 ? v.toFixed(2) : v.toPrecision(4));

export function AlertsScreen({ arg }) {
  const s = useStore();
  const sym = arg && arg !== 'new' ? decodeURIComponent(arg) : null;
  const a = useAssetsLive(sym ? [sym] : []);
  const [sheet, setSheet] = useState(arg === 'new' ? { add: true } : null);
  const all = s.alerts || [];
  const list = sym ? all.filter((x) => x.sym === sym) : all;
  const q = sym ? a.q[sym] : null;
  const bySym = {}; for (const al of list) (bySym[al.sym] ||= []).push(al);
  const log = firedLog().filter((x) => !sym || x.sym === sym).slice(0, 12);
  return html`<div class="screen stagger">
    <${Back} title=${sym ? `${nameOf(sym)} alerts` : 'Alerts'} hint=${`${list.filter((x) => x.on).length} active${sym ? ' · drag a line on the chart to move it' : ''}${inQuiet() ? ' · quiet hours now' : ''}`} onBack=${() => history.back()} />
    ${sym && html`<${ChartCard} sym=${sym} livePrice=${q && q.last} alerts=${list} height=${260} defTf="1M" onAlertMove=${(id, field, price) => { updateAlert(id, { [field]: price, firedAt: null }); toast(`Alert moved to ${fmtPrice(price, sym)}`); }} />`}
    ${!list.length && html`<div class="card"><div class="empty"><span class="e"><${Icon} n="bell" size=${30} /></span>No alerts yet.<div class="hint" style="margin-top:6px">Set several per asset: price levels, ranges, % moves, advisor signals, volume spikes.</div></div></div>`}
    ${Object.entries(bySym).map(([k, als]) => html`
      ${!sym && html`<div class="sect"><span class="h-title">${nameOf(k)}</span><button class="more" onClick=${() => go('alerts/' + encodeURIComponent(k))}>Chart</button></div>`}
      ${als.map((al) => html`<div class="alrow">
        <span class="cdot" style=${{ background: KINDS[al.kind] ? KINDS[al.kind].color : '#fff', boxShadow: `0 0 8px ${KINDS[al.kind] ? KINDS[al.kind].color : '#fff'}` }}></span>
        <div class="grow" onClick=${() => setSheet({ edit: al })}><div class="t1">${describe(al)}</div><div class="t2">${al.once ? 'Once' : 'Every time'} · ${al.sound !== false ? 'sound' : 'silent'}${al.vib !== false ? ' + vibration' : ''}${al.urgent ? ' · urgent' : ''}${al.firedAt ? ' · last ' + new Date(al.firedAt).toLocaleDateString() : ''}</div></div>
        <${Switch} on=${al.on} onChange=${(v) => { updateAlert(al.id, { on: v, firedAt: v ? null : al.firedAt }); feedback(v ? 'set' : 'tap'); }} />
      </div>`)}`)}
    <div class="btns" style="margin-top:8px">
      <button class="btn holo big" style="flex:1.6" onClick=${() => setSheet({ add: true })}><${Icon} n="plus" size=${18} /> Add alert</button>
      <button class="btn big" onClick=${() => setSheet({ ladder: true })}>Price ladder</button>
    </div>
    <div class="sect"><span class="h-title">Delivery</span></div>
    <div class="card">
      <${SettingRow} title="Quiet hours" hint=${`No alerts from ${s.settings.quiet.from}:00 to ${s.settings.quiet.to}:00, except ones marked urgent`}><${Switch} on=${s.settings.quiet.on} onChange=${(v) => patch('settings', { quiet: { ...s.settings.quiet, on: v } })} /><//>
      ${s.settings.quiet.on && html`<div class="row" style="gap:8px;margin:4px 0 8px">
        <select class="input" value=${s.settings.quiet.from} onChange=${(e) => patch('settings', { quiet: { ...s.settings.quiet, from: +e.target.value } })}>${Array.from({ length: 24 }, (_, h) => html`<option value=${h}>From ${h}:00</option>`)}</select>
        <select class="input" value=${s.settings.quiet.to} onChange=${(e) => patch('settings', { quiet: { ...s.settings.quiet, to: +e.target.value } })}>${Array.from({ length: 24 }, (_, h) => html`<option value=${h}>To ${h}:00</option>`)}</select></div>`}
      <${SettingRow} title="Notifications when the app is closed" hint=${isNative() ? 'Android checks about every 15 minutes' : 'iPhone: checked about every 10 minutes online'}>${s.settings.alertsSetup ? html`<span class="tag up">On</span>` : html`<button class="btn sm primary" onClick=${async () => { const r = await enablePush(); toast(r === 'ok' ? 'Notifications on' : r === 'install-first' ? 'Add the app to your Home Screen first' : 'Notifications not allowed', r === 'ok' ? '✓' : '!'); }}>Turn on</button>`}<//>
    </div>
    ${log.length > 0 && html`<div class="sect"><span class="h-title">Recent</span></div><div class="card" style="padding:4px 14px">${log.map((x) => html`<div class="item"><div class="grow"><div class="t1" style="white-space:normal;font-size:13.5px">${x.text}</div><div class="t2">${new Date(x.t).toLocaleString()}${x.quiet ? ' · during quiet hours' : ''}</div></div></div>`)}</div>`}
    ${sheet && sheet.add && html`<${AlertSheet} sym=${sym} onClose=${() => { setSheet(null); if (arg === 'new') history.replaceState(null, '', '#/alerts'); }} />`}
    ${sheet && sheet.edit && html`<${AlertSheet} sym=${sheet.edit.sym} edit=${sheet.edit} onClose=${() => setSheet(null)} />`}
    ${sheet && sheet.ladder && html`<${LadderSheet} sym=${sym} onClose=${() => setSheet(null)} />`}
  </div>`;
}

function AssetPick({ value, onPick }) {
  const s = useStore();
  const [q, setQ] = useState('');
  const [res, setRes] = useState(null);
  const list = s.markets.list || [];
  return html`<div>
    <div class="chips" style="margin-bottom:8px">${list.map((w) => html`<button class=${`chip ${value === w.sym ? 'on' : ''}`} onClick=${() => onPick(w.sym)}>${w.name || w.sym}</button>`)}</div>
    <input class="input" placeholder="Or search any stock, ETF, coin" value=${q} onInput=${(e) => { setQ(e.target.value); const t = e.target.value; clearTimeout(AssetPick.t); AssetPick.t = setTimeout(() => t.trim() ? search(t).then(setRes) : setRes(null), 300); }} />
    ${res && html`<div style="margin-top:6px">${res.slice(0, 6).map((r) => html`<button class="item" onClick=${() => { onPick(r.sym, r.name); setRes(null); setQ(''); }}><div class="grow"><div class="t1">${r.name}</div><div class="t2">${r.sym} · ${r.kind}</div></div></button>`)}</div>`}
  </div>`;
}

export function AlertSheet({ sym: sym0, edit, onClose, preset }) {
  const [sym, setSym] = useState(sym0 || (edit && edit.sym) || null);
  const [symName, setSymName] = useState(null);
  const a = useAssetsLive(sym ? [sym] : []);
  const q = sym ? a.q[sym] : null; const px = q ? q.last : null;
  const e = edit || preset || {};
  const [kind, setKind] = useState(e.kind || 'above');
  const [va, setVa] = useState(e.a != null ? String(e.a) : '');
  const [vb, setVb] = useState(e.b != null ? String(e.b) : '');
  const [pct, setPct] = useState(e.pct != null ? String(e.pct) : kind === 'volume' ? '2' : '5');
  const [days, setDays] = useState(e.days || 7);
  const [dir, setDir] = useState(e.dir || (kind === 'score' ? 'buy' : 'both'));
  const [once, setOnce] = useState(!!e.once);
  const [snd, setSnd] = useState(e.sound !== false);
  const [vib, setVib] = useState(e.vib !== false);
  const [urgent, setUrgent] = useState(!!e.urgent);
  const priceKinds = ['above', 'below', 'enter', 'leave'];
  const ok = sym && (priceKinds.includes(kind) ? parseNum(va) > 0 && (!['enter', 'leave'].includes(kind) || parseNum(vb) > 0) : kind === 'move' || kind === 'volume' ? parseNum(pct) > 0 : true);
  const save = (close) => {
    const al = { sym, kind, a: parseNum(va) || null, b: parseNum(vb) || null, pct: parseNum(pct) || null, days: +days, dir, once, sound: snd, vib, urgent };
    if (symName) al.name = symName;
    if (edit) updateAlert(edit.id, { ...al, firedAt: null }); else addAlert(al);
    feedback('set'); toast(edit ? 'Alert updated' : 'Alert set', 'bell'); close();
  };
  const chips = (set, sign) => px && html`<div class="chips" style="margin-top:8px">${[1, 2, 5, 10, 20].map((d) => html`<button class="chip mono" onClick=${() => set(String(nice(px * (1 + (sign * d) / 100))))}>${sign > 0 ? '+' : '−'}${d}%</button>`)}</div>`;
  return html`<${Sheet} title=${edit ? 'Edit alert' : 'New alert'} onClose=${onClose}>${(close) => html`
    ${!edit && html`<${Field} label="Asset"><${AssetPick} value=${sym} onPick=${(x, n) => { setSym(x); setSymName(n || null); }} /><//>`}
    ${sym && html`<div class="hint" style="margin:-4px 2px 12px">${nameOf(sym)} now <b class="mono" style="color:var(--text)">${px != null ? fmtPrice(px, sym) : '…'}</b></div>`}
    <${Field} label="When"><div class="chips">${Object.entries(KINDS).map(([k, v]) => html`<button class=${`chip ${kind === k ? 'on' : ''}`} onClick=${() => { setKind(k); if (k === 'score') setDir('buy'); else if (k === 'move') setDir('both'); }}>${v.name}</button>`)}</div><//>
    ${(kind === 'above' || kind === 'below') && html`<${Field} label="Price"><${NumInput} value=${va} onInput=${setVa} placeholder=${px ? String(nice(px * (kind === 'above' ? 1.05 : 0.95))) : ''} />${chips(setVa, kind === 'above' ? 1 : -1)}<//>`}
    ${(kind === 'enter' || kind === 'leave') && html`<div class="grid2"><${Field} label="From"><${NumInput} value=${va} onInput=${setVa} placeholder=${px ? String(nice(px * 0.97)) : ''} /><//><${Field} label="To"><${NumInput} value=${vb} onInput=${setVb} placeholder=${px ? String(nice(px * 1.03)) : ''} /><//></div>
      ${px && html`<div class="chips" style="margin:-6px 0 12px">${[2, 5, 10].map((d) => html`<button class="chip mono" onClick=${() => { setVa(String(nice(px * (1 - d / 100)))); setVb(String(nice(px * (1 + d / 100)))); }}>±${d}%</button>`)}</div>`}`}
    ${kind === 'move' && html`<div class="grid2"><${Field} label="Move %"><${NumInput} value=${pct} onInput=${setPct} /><//><${Field} label="Within"><select class="input" value=${days} onChange=${(ev) => setDays(+ev.target.value)}>${[[1, 'a day'], [3, '3 days'], [7, 'a week'], [30, 'a month']].map(([d, n]) => html`<option value=${d}>${n}</option>`)}</select><//></div>
      <${Field} label="Direction"><${Seg} options=${[['down', 'Drop (buy the dip)'], ['up', 'Rise'], ['both', 'Either']]} value=${dir} onChange=${setDir} /><//>`}
    ${kind === 'score' && html`<${Field} label="Tell me when the advisor says"><${Seg} options=${[['buy', 'Buy'], ['sell', 'Sell'], ['any', 'Any change']]} value=${dir} onChange=${setDir} /><//>`}
    ${kind === 'volume' && html`<${Field} label="Times normal volume"><${NumInput} value=${pct} onInput=${setPct} placeholder="2" /><//>`}
    <${SettingRow} title="Only once" hint="Off: fires every time it crosses again"><${Switch} on=${once} onChange=${setOnce} /><//>
    <${SettingRow} title="Sound"><${Switch} on=${snd} onChange=${setSnd} /><//>
    <${SettingRow} title="Vibration"><${Switch} on=${vib} onChange=${setVib} /><//>
    <${SettingRow} title="Urgent" hint="Comes through during quiet hours"><${Switch} on=${urgent} onChange=${setUrgent} cls="c-down" /><//>
    <div class="btns" style="margin-top:12px">
      ${edit && html`<button class="btn danger" onClick=${() => { removeAlert(edit.id); toast('Alert removed'); close(); }}>Delete</button>`}
      <button class="btn holo grow" disabled=${!ok} onClick=${() => save(close)}>${edit ? 'Save' : 'Set alert'}</button>
    </div>
  `}<//>`;
}

function LadderSheet({ sym: sym0, onClose }) {
  const [sym, setSym] = useState(sym0);
  const a = useAssetsLive(sym ? [sym] : []);
  const px = sym && a.q[sym] ? a.q[sym].last : null;
  const [step, setStep] = useState(2);
  const [pick, setPick] = useState({});
  const rows = px ? [5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5].map((k) => ({ k, p: nice(px * (1 + (k * step) / 100)) })) : [];
  const n = Object.values(pick).filter(Boolean).length;
  return html`<${Sheet} title="Price ladder" onClose=${onClose}>${(close) => html`
    ${!sym0 && html`<${Field} label="Asset"><${AssetPick} value=${sym} onPick=${setSym} /><//>`}
    <div class="hint" style="margin-bottom:10px">Tap levels to set an alert at each. Above the price: "goes above". Below: "falls below".</div>
    <${Field} label="Step between levels"><${Seg} options=${[[0.5, '0.5%'], [1, '1%'], [2, '2%'], [5, '5%'], [10, '10%']]} value=${step} onChange=${(v) => { setStep(v); setPick({}); }} /><//>
    <div class="ladder">${rows.map((r) => r.k === 0 ? html`<button class="cur" disabled><span>NOW</span><span>${fmtPrice(px, sym)}</span><span></span></button>`
      : html`<button class=${pick[r.k] ? 'on' : ''} onClick=${() => { setPick({ ...pick, [r.k]: !pick[r.k] }); feedback('tap'); }}><span class=${r.k > 0 ? 'up' : 'down'}>${r.k > 0 ? '+' : '−'}${Math.abs(r.k * step)}%</span><span>${fmtPrice(r.p, sym)}</span><span>${pick[r.k] ? html`<${Icon} n="check" size=${15} />` : ''}</span></button>`)}</div>
    <button class="btn holo block big" style="margin-top:12px" disabled=${!n} onClick=${() => { for (const r of rows) if (pick[r.k]) addAlert({ sym, kind: r.k > 0 ? 'above' : 'below', a: r.p, once: true }); feedback('set'); toast(`${n} alerts set`, 'bell'); close(); }}>Set ${n || ''} alert${n === 1 ? '' : 's'}</button>
  `}<//>`;
}
