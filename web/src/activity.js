import { useState, useMemo } from 'preact/hooks';
import { html, Money, Back, Seg, Empty, sheets } from './ui.js';
import { useStore, catOf, placeName, txnPln, CARD, curOf, monthStats } from './store.js';
import { T } from './copy.js';
import { thisYm, prevYm, nextYm, monthName, niceDate, ymOf, money } from './util.js';

export function txnLabel(s, t) {
  const fr = t.friend && (s.friends.find((f) => f.id === t.friend) || {}).name;
  switch (t.t) {
    case 'exp': { const c = catOf(s, t.cat); return { icon: c.icon, title: t.note || c.name, sub: `${c.name} · ${placeName(s, t.from)}`, sign: -1, cur: curOf(s, t.from) }; }
    case 'inc': { const c = catOf(s, t.cat); return { icon: c.icon, title: t.note || c.name, sub: `${c.name} → ${placeName(s, t.to)}`, sign: 1, cur: curOf(s, t.to) }; }
    case 'xfer': return { icon: t.to === CARD ? '💳' : '🔀', title: t.note || (t.to === CARD ? 'Card bill paid' : 'Moved money'), sub: `${placeName(s, t.from)} → ${placeName(s, t.to)}`, sign: 0, cur: curOf(s, t.from) };
    case 'fout': return { icon: '🤝', title: `${fr || 'Friend'}: ${t.note || 'gave money'}`, sub: t.from ? `from ${placeName(s, t.from)}` : 'no money moved', sign: 0, cur: curOf(s, t.from) };
    case 'fin': return { icon: '🤝', title: `${fr || 'Friend'}: ${t.note || 'got money'}`, sub: t.to ? `into ${placeName(s, t.to)}` : 'no money moved', sign: 0, cur: curOf(s, t.to) };
    case 'gold': return { icon: '🪙', title: t.note || 'Gold purchase', sub: `Gold · ${placeName(s, t.from)}`, sign: -1, cur: curOf(s, t.from) };
    case 'adj': return { icon: '🛠️', title: 'Balance correction', sub: placeName(s, t.to || t.from), sign: 0, cur: curOf(s, t.to || t.from) };
    default: return { icon: '•', title: t.note || t.t, sub: '', sign: 0, cur: 'PLN' };
  }
}

export function TxnRow({ t, s }) {
  const L = txnLabel(s, t);
  return html`<button class="item" onClick=${() => (t.t === 'gold' ? (location.hash = '#/gold') : t.t !== 'adj' && sheets.open({ edit: t }))}>
    <span class="em">${L.icon}</span>
    <div class="grow"><div class="t1">${L.title}</div><div class="t2">${L.sub}${t.rec ? ' · 🔁' : ''}</div></div>
    <${Money} v=${L.sign ? L.sign * t.amt : t.amt} cur=${L.cur} sign=${L.sign > 0} cls=${`amt ${L.sign > 0 ? 'up' : L.sign < 0 ? '' : 'dim'}`} />
  </button>`;
}

export function Activity() {
  const s = useStore();
  const [ym, setYm] = useState(thisYm());
  const [kind, setKind] = useState('all');
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const list = useMemo(() => {
    let xs = s.txns;
    if (query) {
      xs = xs.filter((t) => { const L = txnLabel(s, t); return (L.title + ' ' + L.sub + ' ' + (t.note || '') + ' ' + t.amt).toLowerCase().includes(query); });
    } else xs = xs.filter((t) => ymOf(t.date) === ym);
    if (kind !== 'all') xs = xs.filter((t) => (kind === 'exp' ? t.t === 'exp' : kind === 'inc' ? t.t === 'inc' : !['exp', 'inc'].includes(t.t)));
    return [...xs].sort((a, b) => (b.date + b.id).localeCompare(a.date + a.id));
  }, [s.txns, ym, kind, query]);
  const groups = [];
  for (const t of list) { const g = groups[groups.length - 1]; if (g && g.date === t.date) g.items.push(t); else groups.push({ date: t.date, items: [t] }); }
  const ms = monthStats(s, ym);
  const found = query ? list.filter((t) => t.t === 'exp').reduce((a, t) => a + txnPln(s, t), 0) : 0;

  return html`<div class="screen">
    <div class="top"><div class="grow"><div class="h-title">${T.nActivity}</div><div class="hint">All your entries</div></div></div>
    <input class="input" placeholder="🔍  Search: haircut, kebab, 50…" value=${q} onInput=${(e) => setQ(e.target.value)} style="margin-bottom:10px" />
    ${!query && html`<div class="row between" style="margin:4px 2px 10px">
      <button class="iconbtn" onClick=${() => setYm(prevYm(ym))}>‹</button>
      <div style="text-align:center"><div class="h-big" style="font-size:16px">${monthName(ym, true)}</div></div>
      <button class="iconbtn" onClick=${() => setYm(nextYm(ym))} disabled=${ym >= thisYm()} style=${{ opacity: ym >= thisYm() ? 0.3 : 1 }}>›</button>
    </div>
    <div class="stat3" style="margin-bottom:10px">
      <div><div class="l">Spent</div><div class="v"><${Money} v=${ms.spend} d=${0} /></div></div>
      <div><div class="l">Came in</div><div class="v up"><${Money} v=${ms.income} d=${0} /></div></div>
      <div><div class="l">Net</div><div class=${`v ${ms.net >= 0 ? 'up' : 'down'}`}><${Money} v=${ms.net} d=${0} /></div></div>
    </div>`}
    ${query && html`<div class="card" style="padding:12px"><b>${list.length}</b> matches${found ? html` · spent <${Money} v=${found} cls="pink" />` : ''}</div>`}
    <${Seg} options=${[['all', 'All'], ['exp', 'Spent'], ['inc', 'Income'], ['other', 'Other']]} value=${kind} onChange=${setKind} />
    ${groups.length ? groups.map((g) => {
      const daySpend = g.items.filter((t) => t.t === 'exp').reduce((a, t) => a + txnPln(s, t), 0);
      return html`<div>
        <div class="dayhead"><span>${niceDate(g.date)}</span>${daySpend > 0 && html`<${Money} v=${-daySpend} />`}</div>
        <div class="card" style="padding:4px 12px;margin-bottom:6px">${g.items.map((t) => html`<${TxnRow} t=${t} s=${s} key=${t.id} />`)}</div>
      </div>`;
    }) : html`<${Empty} text=${query ? 'Nothing matches.' : T.empty} />`}
  </div>`;
}
