// Desktop layout: a left sidebar with every section, plus keyboard shortcuts.
// Plain script (no build step). It only shows on wide screens (see .side in style.css),
// so phones and the Android app keep the bottom dock.
(() => {
  const ICONS = {
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    coin: '<circle cx="12" cy="12" r="8"/><path d="M12 8v8M9.5 10h4a1.5 1.5 0 010 3h-3a1.5 1.5 0 000 3h4"/>',
    up: '<path d="M4 17l6-6 4 4 6-7"/><path d="M15 8h5v5"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    bank: '<path d="M3 10l9-6 9 6"/><path d="M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/>',
    card: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/>',
    users: '<circle cx="9" cy="9" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 5.5a3.5 3.5 0 010 7M21 20c0-2.6-1.6-4.8-4-5.6"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
    wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M16 12h2M3 9h18"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
    moon: '<path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/>',
    swap: '<path d="M7 7h12l-3-3M17 17H5l3 3"/>',
    save: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
    news: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h10M7 13h6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
  };
  const icon = (n) => `<svg class="ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[n] || ''}</svg>`;

  ICONS.spark = '<path d="M12 3l2.4 5.6L20 11l-5.6 2.4L12 19l-2.4-5.6L4 11l5.6-2.4z"/>';
  ICONS.globe = '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>';
  ICONS.bell = '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>';
  ICONS.grid = '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>';
  const NAV = [
    [null, [['home', 'Home', 'home'], ['advisor', 'Advisor', 'spark'], ['world', 'World', 'globe'], ['alerts', 'Alerts', 'bell']]],
    ['Invest', [['markets', 'Markets', 'up'], ['portfolio', 'Portfolio', 'layers'], ['gold', 'Gold', 'coin'], ['news', 'News', 'news']]],
    ['Money', [['wealth', 'Wealth', 'chart'], ['networth', 'Net worth', 'bank'], ['budget', 'Budget', 'wallet'], ['activity', 'Activity', 'receipt'], ['card', 'Credit card', 'card'], ['bills', 'Bills', 'calendar']]],
    ['More', [['more', 'All tools', 'grid'], ['backup', 'Backup', 'save'], ['settings', 'Settings', 'settings']]],
  ];
  // sub-pages that should keep their parent highlighted
  const PARENT = { asset: 'markets', broker: 'markets', summary: 'budget', history: 'budget' };

  const current = () => {
    const n = (location.hash.replace(/^#\/?/, '') || 'home').split('/')[0];
    return PARENT[n] || n;
  };

  const side = document.createElement('aside');
  side.className = 'side';
  side.innerHTML = `
    <div class="side-brand"><img src="icons/icon-192.png" alt="" /><span>Creampie Holdings</span></div>
    <button class="side-add" type="button">${icon('plus')}<span>Add</span><kbd>N</kbd></button>
    <nav>${NAV.map(([title, items]) => `
      ${title ? `<div class="side-h">${title}</div>` : ''}
      ${items.map(([r, label, ic]) => `<a href="#/${r}" data-r="${r}">${icon(ic)}<span>${label}</span></a>`).join('')}
    `).join('')}</nav>
    <div class="side-foot">Press <kbd>/</kbd> to jump to Markets search</div>`;

  const mark = () => {
    const c = current();
    side.querySelectorAll('a[data-r]').forEach((a) => a.classList.toggle('on', a.dataset.r === c));
  };

  side.querySelector('.side-add').addEventListener('click', () => window.cpOpen && window.cpOpen('add'));
  window.addEventListener('hashchange', mark);

  const typing = (t) => t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const x = document.querySelector('.overlay .x');
      if (x) { e.preventDefault(); x.click(); }
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey || typing(e.target) || document.querySelector('.lock')) return;
    if (e.key === 'n' || e.key === 'N') { e.preventDefault(); window.cpOpen && window.cpOpen('add'); }
    else if (e.key === '/') {
      e.preventDefault();
      if (current() !== 'markets') location.hash = '#/markets';
      setTimeout(() => { const i = document.querySelector('.screen input'); if (i) i.focus(); }, 150);
    }
    else if (/^[1-4]$/.test(e.key)) location.hash = '#/' + ['home', 'markets', 'wealth', 'more'][+e.key - 1];
  });

  // click outside a sheet closes it (desktop modal behaviour)
  document.addEventListener('mousedown', (e) => {
    if (window.innerWidth >= 960 && e.target.classList && e.target.classList.contains('overlay')) {
      const x = e.target.querySelector('.x');
      if (x) x.click();
    }
  });

  const mount = () => { document.body.appendChild(side); mark(); };
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
