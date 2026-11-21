import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { html, Toaster, toast, sheets } from './ui.js';
import { useStore, get, applyRecurring } from './store.js';
import { startLive, refreshRates, alertBus, loadHistory, fetchNews } from './gold.js';
import { startMarket, liveSignals, useMarket } from './market.js';
import { Icon } from './icons.js';
import { syncConfig, localNotify, isNative } from './push.js';
import { T } from './copy.js';
import { sha256, vibrate, setDisplay, section } from './util.js';
import { feedback, sound } from './fx.js';
import { Hub } from './hub.js';
import { AdvisorScreen } from './advisorScreen.js';
import { World } from './world.js';
import { AlertsScreen, startAlerts } from './alertsScreen.js';
import { alertBus2 } from './alerts.js';
import { UpdateSheet } from './updater.js';
import { NetWorthScreen } from './wealthPlus.js';
import { Settings as Settings2, Backup as Backup2, Health } from './settings2.js';
import { WealthTab, PortfolioHub, Benchmark, RiskCheck, Dividends, Tax, Freedom, Dca, WhatIf, Journal, Fees } from './invest.js';
import { Practice, Guard } from './trading.js';
import { Screener, Earnings, Insiders, Backtest } from './research.js';
import { T212 as T212S, useT212 as useT212S } from './t212.js';
import { Home } from './home.js';
import { Activity } from './activity.js';
import { AddSheet } from './add.js';
import { GoldScreen, NewsScreen } from './goldScreen.js';
import { Wealth, Accounts, Card, Friends, Goals } from './wealth.js';
import { Budget, Bills, HistoryScreen, Summary } from './plan.js';
import { Zakat, Convert, Backup, Settings, Setup } from './more.js';
import { Back } from './ui.js';
import { Markets, Asset, Portfolio, Broker } from './marketsScreen.js';
import { startAssets, assetAlertBus } from './assets.js';

const TABS = ['home', 'markets', 'wealth', 'more'];
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
    <div class="h-big">${T.app}</div>
    <div class="dim">${bad ? T.pinWrong : T.pinAsk}</div>
    <div class=${`dots ${bad ? 'shake' : ''}`}>${[0, 1, 2, 3, 4, 5].map((i) => html`<i class=${i < pin.length ? 'on' : ''} style=${{ opacity: i < 4 || i < pin.length ? 1 : 0.3 }}></i>`)}</div>
    <div class="pad">
      ${['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k) => html`<button onClick=${() => press(k)}>${k}</button>`)}
      ${isNative() && window.CPNative.canBiometric && window.CPNative.canBiometric() ? html`<button class="k" onClick=${() => window.CPNative.biometric()} aria-label="Fingerprint">Touch</button>` : html`<span></span>`}
      <button onClick=${() => press('0')}>0</button>
      <button class="k" onClick=${() => press('⌫')}>⌫</button>
    </div>
  </div>`;
}

const ORB = [
  ['spark', 'Advisor', () => (location.hash = '#/advisor')],
  ['receipt', 'Add expense', (o) => o('exp')],
  ['bell', 'New alert', () => (location.hash = '#/alerts/new')],
  ['trade', 'Trade', () => (location.hash = '#/markets')],
  ['up', 'Add income', (o) => o('inc')],
  ['flask', 'Practice', () => (location.hash = '#/practice')],
];
function Dock({ tab, onAdd }) {
  const [open, setOpen] = useState(false);
  const [rip, setRip] = useState(0);
  const go = (t) => { vibrate(6); setOpen(false); if (route().name !== t) location.replace('#/' + t); };
  const B = (t, i, label) => html`<button class=${tab === t ? 'on' : ''} onClick=${() => go(t)}><span class="i"><${Icon} n=${i} size=${21} sw=${tab === t ? 1.9 : 1.6} /></span>${label}</button>`;
  return html`${open && html`<div class="orbmenu" onClick=${() => setOpen(false)}><div class="items">${ORB.map(([ic, nm, f]) => html`<button onClick=${(e) => { e.stopPropagation(); setOpen(false); feedback('tap'); f(onAdd); }}><span class="ic"><${Icon} n=${ic} size=${22} /></span>${nm}</button>`)}</div></div>`}
  <nav class="dock">
    ${B('home', 'home', 'Home')}
    ${B('markets', 'bars', 'Markets')}
    <button class=${`orb ${open ? 'open' : ''}`} onClick=${() => { setRip((x) => x + 1); feedback('open'); setOpen(!open); }} aria-label="Actions"><span class="ring"></span><span class="core"><${Icon} n=${open ? 'plus' : 'spark'} size=${21} sw=${1.8} /></span>${rip > 0 && html`<span class="rip" key=${rip}></span>`}</button>
    ${B('wealth', 'pie', 'Wealth')}
    ${B('more', 'dots', 'More')}
  </nav>`;
}

// always-visible Trading 212 mode badge (Practice / LIVE)
function EnvBadge() {
  const t = useT212S();
  if (!t.connected) return null;
  const live = t.env === 'live';
  return html`<button class=${`envbadge ${live ? 'live' : ''}`} onClick=${() => { location.hash = '#/broker'; }}>${live ? 'T212 LIVE' : 'T212 PRACTICE'}</button>`;
}

function App() {
  const s = useStore();
  const r = useRoute();
  setDisplay(s.settings.cur, s.settings.curSec, s.rates);
  section({ gold: 'gold', markets: 'markets', asset: 'markets', portfolio: 'markets', broker: 'markets', advisor: 'markets', wealth: 'wealth', networth: 'wealth', accounts: 'wealth', budget: 'budget', bills: 'budget', activity: 'budget', card: 'budget', summary: 'budget', history: 'budget' }[r.name]);
  const [locked, setLocked] = useState(!!s.settings.pin);
  const [sheet, setSheet] = useState(null);
  sheets.open = (opts) => setSheet(opts || {});

  useEffect(() => {
    applyRecurring();
    refreshRates().then(() => startLive());
    loadHistory().catch(() => {});
    startMarket(fetchNews);
    startAssets();
    startAlerts();
    const onAsset = (text) => { toast(text, 'bell', 6000); localNotify('Price alert', text); };
    assetAlertBus.add(onAsset);
    const onAl2 = ({ text, quiet }) => { toast(text, 'bell', 7000); if (!quiet) localNotify('Alert', text); };
    alertBus2.add(onAl2);
    syncConfig();
    const onAlert = (a) => { toast(a.text, '!', 6000); localNotify('Gold price alert', a.text); };
    // new important early warnings while the app is open → banner (once each)
    const seenW = new Set(JSON.parse(sessionStorage.getItem('cp.warn') || '[]'));
    const warnTimer = setInterval(() => {
      if (get().gold.signalsOn === false) return;
      for (const w of liveSignals()) if (w.level === 'high' && !seenW.has(w.id)) { seenW.add(w.id); toast(w.title, '!', 7000); }
      sessionStorage.setItem('cp.warn', JSON.stringify([...seenW]));
    }, 15000);
    alertBus.add(onAlert);
    let lastHidden = 0;
    const vis = () => {
      if (document.visibilityState === 'hidden') lastHidden = Date.now();
      else {
        applyRecurring(); syncConfig();
        if (get().settings.pin && lastHidden && Date.now() - lastHidden > (get().settings.autoLock || 60) * 1e3) setLocked(true);
      }
    };
    document.addEventListener('visibilitychange', vis);
    // Android: deep links from notifications / widget
    window.cpOpen = (where) => { if (where === 'add') setSheet({ mode: 'exp' }); else location.hash = '#/' + where; };
    if (location.hash === '#/add') { history.replaceState(null, '', '#/home'); setSheet({ mode: 'exp' }); }
    return () => { assetAlertBus.delete(onAsset); clearInterval(warnTimer); alertBus.delete(onAlert); document.removeEventListener('visibilitychange', vis); };
  }, []);

  if (locked && s.settings.pin) return html`<${Lock} onOpen=${() => setLocked(false)} />`;

  const tab = TABS.includes(r.name) ? r.name : null;
  const openAdd = (mode = 'exp') => setSheet({ mode });
  const screens = {
    home: () => html`<${Home} openAdd=${openAdd} />`,
    activity: () => html`<${Activity} />`,
    gold: () => html`<${GoldScreen} />`,
    wealth: () => html`<${WealthTab} />`,
    news: () => html`<div class="screen"><${Back} title=${T.news} hint="Gold news & what it might mean" onBack=${() => history.back()} /><${NewsScreen} /></div>`,
    markets: () => html`<${Markets} />`,
    more: () => html`<${Hub} />`,
    advisor: () => html`<${AdvisorScreen} />`,
    world: () => html`<${World} tab=${r.arg} />`,
    alerts: () => html`<${AlertsScreen} arg=${r.arg} key=${r.arg} />`,
    networth: () => html`<${NetWorthScreen} />`,
    asset: () => html`<${Asset} sym=${decodeURIComponent(r.arg || '')} key=${r.arg} />`,
    portfolio: () => html`<${PortfolioHub} />`,
    t212: () => html`<${Portfolio} />`,
    benchmark: () => html`<${Benchmark} />`, riskcheck: () => html`<${RiskCheck} />`, dividends: () => html`<${Dividends} />`, tax: () => html`<${Tax} />`,
    freedom: () => html`<${Freedom} />`, dca: () => html`<${Dca} />`, whatif: () => html`<${WhatIf} />`, journal: () => html`<${Journal} />`, fees: () => html`<${Fees} />`,
    practice: () => html`<${Practice} arg=${r.arg} key=${r.arg || 'p'} />`, guard: () => html`<${Guard} />`,
    screener: () => html`<${Screener} />`, earnings: () => html`<${Earnings} />`, insiders: () => html`<${Insiders} />`, backtest: () => html`<${Backtest} />`,
    health: () => html`<${Health} />`,
    broker: () => html`<${Broker} />`,
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
    backup: () => html`<${Backup2} />`,
    settings: () => html`<${Settings2} />`,
    setup: () => html`<${Setup} />`,
  };
  const Screen = screens[r.name] || screens.home;
  return html`<div>
    <div key=${r.name}>${Screen()}</div>
    <${EnvBadge} />
    <${UpdateSheet} />
    <${Dock} tab=${tab || (TABS.includes(r.name) ? r.name : '')} onAdd=${() => { vibrate(15); openAdd('exp'); }} />
    ${sheet && html`<${AddSheet} ...${sheet} onClose=${() => setSheet(null)} />`}
    <${Toaster} />
  </div>`;
}

render(html`<${App} />`, document.getElementById('app'));

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
