// "More": every feature in one place.
import { html } from './ui.js';
import { Icon } from './icons.js';
import { useStore } from './store.js';
import { T212 } from './t212.js';
import { feedback } from './fx.js';

const go = (r) => { feedback('tap'); location.hash = '#/' + r; };
const GROUPS = [
  ['Markets and advisor', [
    ['spark', 'Advisor', 'advisor'], ['globe', 'World', 'world'], ['sun', 'Morning brief', 'world/brief'], ['bell', 'Alerts', 'alerts'],
    ['coin', 'Gold', 'gold'], ['calendar', 'Calendar', 'world/cal'], ['bank', 'Central banks', 'world/banks'], ['link', 'Correlation', 'world/links'],
    ['crown', 'Big funds (COT)', 'world/funds'], ['search', 'Screener', 'screener'], ['receipt2', 'Earnings', 'earnings'], ['users', 'Insiders and 13F', 'insiders'],
    ['flask', 'Backtester', 'backtest'], ['clock', 'Session clock', 'world/now'], ['news', 'News', 'news'],
  ]],
  ['Investing', [
    ['pie', 'Portfolio', 'portfolio'], ['chart', 'Net worth', 'networth'], ['scale', 'Benchmark', 'benchmark'], ['shield', 'Risk check', 'riskcheck'],
    ['drop', 'Dividends', 'dividends'], ['calc', 'Polish tax', 'tax'], ['target', 'Freedom number', 'freedom'], ['repeat', 'DCA plan', 'dca'],
    ['zap', 'What if', 'whatif'], ['book', 'Trade journal', 'journal'], ['candle', 'Practice trading', 'practice'], ['lock', 'Risk guard', 'guard'],
    ['receipt', 'Fee tracker', 'fees'], ['swap', 'Trading 212', 'broker'],
  ]],
  ['Money', [
    ['budget', 'Budget', 'budget'], ['receipt', 'Activity', 'activity'], ['wallet', 'Accounts', 'accounts'], ['card', 'Credit card', 'card'],
    ['repeat', 'Bills and subs', 'bills'], ['target', 'Goals', 'goals'], ['users', 'Friends', 'friends'], ['bars', 'History', 'history'],
    ['calendar', 'Month summary', 'summary'], ['moon', 'Zakat', 'zakat'], ['swap', 'Converter', 'convert'],
  ]],
  ['App', [['settings', 'Settings', 'settings'], ['save', 'Backup', 'backup'], ['pulse', 'Data health', 'health']]],
];
export function Hub() {
  const s = useStore();
  return html`<div class="screen stagger">
    <div class="top"><div class="grow"><div class="h-title">Everything</div><div class="hint">${T212.connected ? `Trading 212 ${T212.env === 'live' ? 'LIVE' : 'Practice'} connected` : 'All tools and screens'}</div></div>
      <button class="iconbtn" onClick=${() => go('settings')} aria-label="Settings"><${Icon} n="settings" size=${18} /></button></div>
    ${GROUPS.map(([g, items]) => html`<div class="sect"><span class="h-title">${g}</span></div>
      <div class="tiles four">${items.map(([ic, nm, r]) => html`<button class="tile" onClick=${() => go(r)}><div class="ic"><${Icon} n=${ic} size=${18} /></div><div class="nm">${nm}</div></button>`)}</div>`)}
  </div>`;
}
