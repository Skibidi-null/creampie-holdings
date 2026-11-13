import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { html, Toaster, toast, sheets } from './ui.js';
import { useStore, get, applyRecurring } from './store.js';
import { startLive, refreshRates, alertBus, loadHistory } from './gold.js';
import { syncConfig, localNotify, isNative } from './push.js';
import { T } from './copy.js';
import { sha256, vibrate } from './util.js';
import { Home } from './home.js';
import { Activity } from './activity.js';
import { AddSheet } from './add.js';
import { GoldScreen, NewsScreen } from './goldScreen.js';
import { Wealth, Accounts, Card, Friends, Goals } from './wealth.js';
import { Budget, Bills, HistoryScreen, Summary } from './plan.js';
import { Zakat, Convert, Backup, Settings, Setup } from './more.js';
import { Back } from './ui.js';

const TABS = ['home', 'activity', 'gold', 'wealth'];
const route = () => { const parts = (location.hash.replace(/^#\/?/, '') || 'home').split('/'); return { name: parts[0], arg: parts[1] }; };

function useRoute() {
  const [r, setR] = useState(route());
  useEffect(() => {
    const f = () => { setR(route()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  return r;
}

function Lock({ onOpen }) {
  const s = useStore();
  const [pin, setPin] = useState('');
  const [bad, setBad] = useState(false);
  const tryPin = async (p) => {
    if (p.length < 4) return;
    if ((await sha256('cph:' + p)) === s.settings.pin) { vibrate(20); onOpen(); }
    else if (p.length >= 6) { setBad(true); vibrate(200); setTimeout(() => { setBad(false); setPin(''); }, 450); }
  };
  const press = (k) => {
    vibrate(8);
    const next = k === '⌫' ? pin.slice(0, -1) : (pin + k).slice(0, 6);
    setPin(next);
    tryPin(next);
  };
  useEffect(() => {
    if (isNative() && window.CPNative.canBiometric && window.CPNative.canBiometric()) {
      window.cpBio = (ok) => ok && onOpen();
      setTimeout(() => window.CPNative.biometric(), 300);
    }
  }, []);
  return html`<div class="lock">
    <img class="logo" src="icons/icon-192.png" alt="" />
    <div class="xxx" style="font-size:18px">${T.members}</div>
    <div class="dim">${bad ? T.pinWrong : T.pinAsk}</div>
    <div class=${`dots ${bad ? 'shake' : ''}`}>${[0, 1, 2, 3, 4, 5].map((i) => html`<i class=${i < pin.length ? 'on' : ''} style=${{ opacity: i < 4 || i < pin.length ? 1 : 0.3 }}></i>`)}</div>
    <div class="pad">
      ${['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k) => html`<button onClick=${() => press(k)}>${k}</button>`)}
      ${isNative() && window.CPNative.canBiometric && window.CPNative.canBiometric() ? html`<button class="k" onClick=${() => window.CPNative.biometric()}>👆</button>` : html`<span></span>`}
      <button onClick=${() => press('0')}>0</button>
      <button class="k" onClick=${() => press('⌫')}>⌫</button>
    </div>
  </div>`;
}

function Dock({ tab, onAdd }) {
  const go = (t) => { vibrate(6); if (route().name !== t) location.replace('#/' + t); };
  const B = (t, i, label) => html`<button class=${tab === t ? 'on' : ''} onClick=${() => go(t)}><span class="i">${i}</span>${label}</button>`;
  return html`<nav class="dock">
    ${B('home', '💋', T.nHome)}
    ${B('activity', '🧾', 'Laundry')}
    <button class="plus" onClick=${onAdd} aria-label="Add">＋</button>
    ${B('gold', '🪙', 'Gold')}
    ${B('wealth', '👑', 'Stash')}
  </nav>`;
}

function App() {
  const s = useStore();
  const r = useRoute();
  const [locked, setLocked] = useState(!!s.settings.pin);
  const [sheet, setSheet] = useState(null);
  sheets.open = (opts) => setSheet(opts || {});

  useEffect(() => {
    applyRecurring();
    refreshRates().then(() => startLive());
    loadHistory().catch(() => {});
    syncConfig();
    const onAlert = (a) => { toast(a.text, a.kind === 'below' ? '📉' : '🔥', 6000); localNotify('🪙 Gold went down on you', a.text); };
    alertBus.add(onAlert);
    let lastHidden = 0;
    const vis = () => {
      if (document.visibilityState === 'hidden') lastHidden = Date.now();
      else {
        applyRecurring(); syncConfig();
        if (get().settings.pin && lastHidden && Date.now() - lastHidden > 60e3) setLocked(true);
      }
    };
    document.addEventListener('visibilitychange', vis);
    // Android: deep links from notifications / widget
    window.cpOpen = (where) => { if (where === 'add') setSheet({ mode: 'exp' }); else location.hash = '#/' + where; };
    if (location.hash === '#/add') { history.replaceState(null, '', '#/home'); setSheet({ mode: 'exp' }); }
    return () => { alertBus.delete(onAlert); document.removeEventListener('visibilitychange', vis); };
  }, []);

  if (locked && s.settings.pin) return html`<${Lock} onOpen=${() => setLocked(false)} />`;

  const tab = TABS.includes(r.name) ? r.name : null;
  const openAdd = (mode = 'exp') => setSheet({ mode });
  const screens = {
    home: () => html`<${Home} openAdd=${openAdd} />`,
    activity: () => html`<${Activity} />`,
    gold: () => html`<${GoldScreen} />`,
    wealth: () => html`<${Wealth} />`,
    news: () => html`<div class="screen"><${Back} title=${T.news} hint="Gold news & what it might mean" onBack=${() => history.back()} /><${NewsScreen} /></div>`,
    accounts: () => html`<${Accounts} />`,
    card: () => html`<${Card} />`,
    friends: () => html`<${Friends} />`,
    goals: () => html`<${Goals} />`,
    budget: () => html`<${Budget} />`,
    bills: () => html`<${Bills} />`,
    history: () => html`<${HistoryScreen} />`,
    summary: () => html`<${Summary} ym=${r.arg} key=${r.arg} />`,
    zakat: () => html`<${Zakat} />`,
    convert: () => html`<${Convert} />`,
    backup: () => html`<${Backup} />`,
    settings: () => html`<${Settings} />`,
    setup: () => html`<${Setup} />`,
  };
  const Screen = screens[r.name] || screens.home;
  return html`<div>
    <div key=${r.name}>${Screen()}</div>
    <${Dock} tab=${tab || (TABS.includes(r.name) ? r.name : '')} onAdd=${() => { vibrate(15); openAdd('exp'); }} />
    ${sheet && html`<${AddSheet} ...${sheet} onClose=${() => setSheet(null)} />`}
    <${Toaster} />
  </div>`;
}

render(html`<${App} />`, document.getElementById('app'));

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
