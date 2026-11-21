// Net worth: total across everything, split by kind and currency, history chart.
import { useMemo } from 'preact/hooks';
import { html, Back, Money } from './ui.js';
import { useStore, cashTotal, cardOwed, goldTotals } from './store.js';
import { useLive, priceNow, useHistory } from './gold.js';
import { fullNetWorth, nwSeries, holdingsValue } from './networth.js';
import { SeriesChart } from './chart.js';
import { useAssets } from './assets.js';
import { convert, DISP, money } from './util.js';
import { Icon } from './icons.js';

const go = (r) => { location.hash = '#/' + r; };
export function NetWorthScreen() {
  const s = useStore();
  useAssets();
  const lv = useLive(); const hist = useHistory();
  const p = lv.price || priceNow();
  const nw = fullNetWorth(s, p);
  const series = useMemo(() => nwSeries(s, hist, 365), [hist.length, s.txns.length, (s.nwHist || []).length]);
  const disp = DISP.cur;
  const data = useMemo(() => series.map(([t, v]) => [t, convert(v, 'PLN', disp)]), [series, disp]);
  const parts = [
    ['wallet', 'Cash and bank', nw.cash, 'accounts'], ['coin', 'Gold', nw.gold, 'gold'], ['swap', 'Trading 212', nw.t212, 'portfolio'],
    ['pie', 'Other holdings', nw.hold, 'portfolio'], ['users', 'Owed to you', nw.fOwedMe, 'friends'], ['card', 'Credit card', -nw.card, 'card'], ['users', 'You owe friends', -nw.fIOwe, 'friends'],
  ].filter((x) => Math.abs(x[2]) > 0.004);
  const pos = parts.filter((x) => x[2] > 0).reduce((a, x) => a + x[2], 0) || 1;
  return html`<div class="screen stagger">
    <${Back} title="Net worth" hint="Everything you own minus what you owe" onBack=${() => history.back()} />
    <div class="card hero"><span class="label">Total</span><div class="big"><${Money} v=${nw.total} /></div><div class="hint">${s.settings.cur !== 'PLN' ? `${money(nw.total)} at live rates · ` : ''}${new Date().toLocaleDateString()}</div></div>
    <div class="card chartbox"><div class="label" style="margin:4px 4px 8px">Last 12 months</div><${SeriesChart} data=${data} height=${220} fmt=${(v) => (s.settings.privacy ? '••' : Math.round(v).toLocaleString('pl-PL'))} />
      <div class="note" style="margin-top:8px">Rebuilt from your own entries (cash from transactions, gold from purchase dates and NBP prices) plus a daily snapshot that includes broker holdings from the day you started using v2.</div></div>
    <div class="sect"><span class="h-title">Breakdown</span></div>
    <div class="card" style="padding:4px 14px">${parts.map(([ic, nm, v, r]) => html`<button class="item" onClick=${() => go(r)}><span class="em"><${Icon} n=${ic} size=${17} /></span><div class="grow"><div class="t1">${nm}</div>${v > 0 && html`<div class="bar" style="margin-top:6px"><i style=${{ width: (v / pos) * 100 + '%' }}></i></div>`}</div><span class="amt"><${Money} v=${v} /></span></button>`)}</div>
  </div>`;
}
