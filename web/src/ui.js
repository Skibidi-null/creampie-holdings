import { h } from 'preact';
import htm from 'htm';
import { useState, useRef, useMemo, useEffect } from 'preact/hooks';
import { get } from './store.js';
import { money, moneyIn, num, clamp, parseNum } from './util.js';
import { Icon } from './icons.js';

export const html = htm.bind(h);

// ---------- toast ----------
const toastSubs = new Set();
export function toast(text, icon = '✓', ms = 3200) { toastSubs.forEach((f) => f({ text, icon, id: Math.random(), ms })); }
export function Toaster() {
  const [t, setT] = useState(null);
  useEffect(() => {
    let timer;
    const f = (x) => { setT(x); clearTimeout(timer); timer = setTimeout(() => setT(null), x.ms); };
    toastSubs.add(f); return () => toastSubs.delete(f);
  }, []);
  if (!t) return null;
  const bad = t.icon === '!' || t.icon === '✕';
  return html`<div class="toast" key=${t.id} onClick=${() => setT(null)} role="status"><span class=${`ti ${bad ? 'bad' : ''}`}><${Icon} n=${bad ? 'alert' : t.icon === 'bell' ? 'bell' : 'check'} size=${15} sw=${2} /></span><span>${t.text}</span></div>`;
}

// ---------- money with discreet mode ----------
export function Money({ v, cur = 'PLN', cls = '', sign = false, d = 2, sec }) {
  const priv = get().settings.privacy;
  const txt = (sign && v > 0 ? '+' : '') + (sec ? moneyIn(sec, v, cur, d) : money(v, cur, d));
  return html`<span class=${`mono ${cls} ${priv ? 'blur' : ''}`}>${priv ? '••••' : txt}</span>`;
}

export function Back({ title, hint, onBack, right }) {
  return html`<div class="back">
    <button class="iconbtn" onClick=${onBack} aria-label="Back"><${Icon} n="back" size=${18} /></button>
    <div class="t"><div class="h-title">${title}</div>${hint && html`<div class="hint">${hint}</div>`}</div>
    ${right}
  </div>`;
}

export function Sheet({ title, onClose, children }) {
  const ref = useRef();
  const topRef = useRef();
  const close = () => { if (history.state && history.state.sheet) history.back(); else onClose(); };
  useEffect(() => {
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const onPop = () => onClose();
    history.pushState({ sheet: 1 }, '');
    window.addEventListener('popstate', onPop);
    // Swipe down to close (iPhone / Android touch). Works from the handle at any time,
    // and from the content when it is scrolled to the top.
    const el = ref.current;
    let y0 = null, x0 = 0, dy = 0, t0 = 0, dragging = false, fromTop = false;
    const start = (e) => {
      if (e.touches.length !== 1) { y0 = null; return; }
      fromTop = topRef.current && topRef.current.contains(e.target);
      if (!fromTop && el.scrollTop > 0) { y0 = null; return; }
      y0 = e.touches[0].clientY; x0 = e.touches[0].clientX; dy = 0; t0 = Date.now(); dragging = false;
    };
    const move = (e) => {
      if (y0 == null) return;
      const d = e.touches[0].clientY - y0;
      if (!dragging) {
        if (!fromTop && Math.abs(e.touches[0].clientX - x0) > Math.abs(d)) { y0 = null; return; }
        if (d > 6 && (fromTop || el.scrollTop <= 0)) {
          dragging = true;
          const a = document.activeElement; if (a && a !== document.body && a.blur) a.blur();
        } else if (d < -4) { y0 = null; return; } else return;
      }
      if (e.cancelable) e.preventDefault();
      dy = Math.max(0, d);
      el.style.transition = 'none';
      el.style.transform = `translateY(${dy}px)`;
    };
    const end = () => {
      if (y0 == null) return;
      y0 = null;
      if (!dragging) return;
      dragging = false;
      const speed = dy / Math.max(1, Date.now() - t0);
      if (dy > 100 || (dy > 30 && speed > 0.5)) {
        el.style.transition = 'transform .18s ease-in';
        el.style.transform = 'translateY(100%)';
        setTimeout(close, 170);
      } else {
        el.style.transition = 'transform .2s ease-out';
        el.style.transform = '';
      }
    };
    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('touchmove', move, { passive: false });
    el.addEventListener('touchend', end);
    el.addEventListener('touchcancel', end);
    return () => {
      document.body.style.overflow = prev; window.removeEventListener('popstate', onPop);
      el.removeEventListener('touchstart', start); el.removeEventListener('touchmove', move);
      el.removeEventListener('touchend', end); el.removeEventListener('touchcancel', end);
    };
  }, []);
  // stop the page behind from scrolling when the dark area is dragged
  const blockBg = (e) => { if (e.target === e.currentTarget && e.cancelable) e.preventDefault(); };
  return html`<div class="overlay" onClick=${(e) => e.target === e.currentTarget && close()} onTouchMove=${blockBg}>
    <div class="sheet" ref=${ref}>
      <div class="sheet-top" ref=${topRef}>
        <div class="grab"></div>
        <div class="sheet-head">${title ? html`<h3>${title}</h3>` : ''}<button class="x" onClick=${close} aria-label="Close"><${Icon} n="x" size=${15} /></button></div>
      </div>
      ${typeof children === 'function' ? children(close) : children}
    </div>
  </div>`;
}

export const Field = ({ label, children }) => html`<div class="field">${label && html`<label>${label}</label>`}${children}</div>`;

export function NumInput({ value, onInput, placeholder = '0', autofocus, cls = 'input mono' }) {
  const ref = useRef();
  useEffect(() => { if (autofocus && ref.current) setTimeout(() => ref.current.focus(), 250); }, []);
  return html`<input ref=${ref} class=${cls} inputmode="decimal" placeholder=${placeholder} value=${value}
    onInput=${(e) => onInput(e.target.value.replace(/[^\d.,\-\s]/g, ''))} />`;
}
export const valid = (v) => Number.isFinite(parseNum(v)) && parseNum(v) > 0;

export function Seg({ options, value, onChange }) {
  return html`<div class="seg">${options.map(([k, label]) => html`<button class=${value === k ? 'on' : ''} onClick=${() => onChange(k)}>${label}</button>`)}</div>`;
}
export const Switch = ({ on, onChange }) => html`<button class=${`switch ${on ? 'on' : ''}`} onClick=${() => onChange(!on)} aria-pressed=${on}></button>`;
export const Bar = ({ v, cls = '' }) => html`<div class=${`bar ${cls}`}><i style=${{ width: `${clamp(v, 0, 1) * 100}%` }}></i></div>`;
export const Empty = ({ e = '📭', text }) => html`<div class="empty"><span class="e">${e}</span>${text}</div>`;

export function SettingRow({ title, hint, children, onClick }) {
  return html`<div class="row" style="padding:10px 2px" onClick=${onClick}>
    <div class="grow"><div style="font-weight:600">${title}</div>${hint && html`<div class="hint">${hint}</div>`}</div>${children}</div>`;
}

// ---------- line chart with touch scrubbing ----------
export function LineChart({ pts, color = '#1f6b57', height = 180, time = false, fmt = (v) => num(v), marks = true, refLine }) {
  const [hover, setHover] = useState(null);
  const ref = useRef();
  const W = 340, H = height, P = 6;
  const geo = useMemo(() => {
    if (!pts || pts.length < 2) return null;
    let lo = Infinity, hi = -Infinity, loI = 0, hiI = 0;
    pts.forEach((p, i) => { if (p[1] < lo) { lo = p[1]; loI = i; } if (p[1] > hi) { hi = p[1]; hiI = i; } });
    if (refLine) { lo = Math.min(lo, refLine); hi = Math.max(hi, refLine); }
    const pad = (hi - lo) * 0.12 || 1;
    const y0 = lo - pad, y1 = hi + pad;
    const x0 = pts[0][0], x1 = pts[pts.length - 1][0];
    const X = (t) => P + ((t - x0) / (x1 - x0 || 1)) * (W - 2 * P);
    const Y = (v) => P + (1 - (v - y0) / (y1 - y0)) * (H - 2 * P);
    // decimate for speed
    const step = Math.max(1, Math.floor(pts.length / 400));
    const ds = pts.filter((_, i) => i % step === 0 || i === pts.length - 1);
    const d = ds.map((p, i) => `${i ? 'L' : 'M'}${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join('');
    return { d, area: `${d}L${X(x1)},${H}L${X(x0)},${H}Z`, X, Y, lo: pts[loI], hi: pts[hiI] };
  }, [pts, height, refLine]);
  if (!geo) return html`<div class="empty" style=${{ height: H + 'px', display: 'grid', placeItems: 'center' }}>Loading…</div>`;
  const id = 'g' + color.replace('#', '');
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const cx = ((e.touches ? e.touches[0].clientX : e.clientX) - r.left) / r.width * W;
    let best = 0, bd = Infinity;
    for (let i = 0; i < pts.length; i++) { const dd = Math.abs(geo.X(pts[i][0]) - cx); if (dd < bd) { bd = dd; best = i; } }
    setHover(pts[best]);
  };
  const lbl = (t) => { const d = new Date(t); return time ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }); };
  const last = pts[pts.length - 1];
  return html`<div>
    <div class="chart-tip">${hover ? html`<b>${fmt(hover[1])}</b> · ${lbl(hover[0])}` : html`<span class="mute">Touch the chart to explore</span>`}</div>
    <svg ref=${ref} class="chart" viewBox=${`0 0 ${W} ${H}`} preserveAspectRatio="none" style=${{ height: H + 'px' }}
      onTouchStart=${onMove} onTouchMove=${onMove} onMouseMove=${onMove} onTouchEnd=${() => setHover(null)} onMouseLeave=${() => setHover(null)}>
      <defs>
        <linearGradient id=${id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color=${color} stop-opacity=".18"/><stop offset="1" stop-color=${color} stop-opacity="0"/></linearGradient>
        
      </defs>
      ${[0.25, 0.5, 0.75].map((f) => html`<line x1="0" x2=${W} y1=${H * f} y2=${H * f} stroke="rgba(128,128,128,.15)" />`)}
      ${refLine && html`<line x1="0" x2=${W} y1=${geo.Y(refLine)} y2=${geo.Y(refLine)} stroke="#2f6fa3" stroke-dasharray="4 4" stroke-width="1" opacity=".7" vector-effect="non-scaling-stroke"/>`}
      <path d=${geo.area} fill=${`url(#${id})`} />
      <path d=${geo.d} fill="none" stroke=${color} stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>
      ${marks && html`<circle cx=${geo.X(geo.lo[0])} cy=${geo.Y(geo.lo[1])} r="4" fill="#1e8a55" /><circle cx=${geo.X(geo.hi[0])} cy=${geo.Y(geo.hi[1])} r="4" fill="#c2392f" />`}
      <circle cx=${geo.X(last[0])} cy=${geo.Y(last[1])} r="4" fill=${color} />
      ${hover && html`<line x1=${geo.X(hover[0])} x2=${geo.X(hover[0])} y1="0" y2=${H} stroke="currentColor" stroke-width="1" opacity=".4" vector-effect="non-scaling-stroke"/><circle cx=${geo.X(hover[0])} cy=${geo.Y(hover[1])} r="5" fill=${color} />`}
    </svg>
  </div>`;
}

export const PALETTE = ['#1f6b57', '#2f6fa3', '#c8963e', '#b5523b', '#6b5b95', '#4f8a3c', '#a0596e', '#3e8e9e', '#8a7a52', '#9a9a92'];

export function Donut({ data, size = 150, center }) {
  const total = data.reduce((s, d) => s + d.v, 0);
  if (!total) return null;
  const R = 56, C = 2 * Math.PI * R;
  let off = 0;
  return html`<svg viewBox="0 0 150 150" width=${size} height=${size} style="flex:none">
    <circle cx="75" cy="75" r=${R} fill="none" stroke="rgba(128,128,128,.15)" stroke-width="16"/>
    ${data.map((d, i) => {
      const len = (d.v / total) * C;
      const el = html`<circle cx="75" cy="75" r=${R} fill="none" stroke=${d.color || PALETTE[i % PALETTE.length]} stroke-width="16"
        stroke-dasharray=${`${Math.max(0, len - 2)} ${C}`} stroke-dashoffset=${-off} transform="rotate(-90 75 75)"/>`;
      off += len; return el;
    })}
    ${center && html`<text x="75" y="72" text-anchor="middle" fill="currentColor" opacity=".6" font-size="10">${center[0]}</text>
    <text x="75" y="90" text-anchor="middle" fill="currentColor" font-size="15" font-weight="700">${center[1]}</text>`}
  </svg>`;
}

// Monthly bars: income vs spending
export function Bars({ rows, height = 140 }) {
  if (!rows.length) return null;
  const max = Math.max(1, ...rows.flatMap((r) => [r.a, r.b]));
  const W = 340, H = height, bw = Math.min(14, (W / rows.length - 8) / 2);
  const slot = W / rows.length;
  return html`<svg viewBox=${`0 0 ${W} ${H + 18}`} class="chart" style=${{ height: H + 18 + 'px' }}>
    ${rows.map((r, i) => {
      const x = i * slot + slot / 2;
      const ha = (r.a / max) * H, hb = (r.b / max) * H;
      return html`<g>
        <rect x=${x - bw - 1} y=${H - ha} width=${bw} height=${ha} rx="3" fill="#1e8a55" opacity=".85"/>
        <rect x=${x + 1} y=${H - hb} width=${bw} height=${hb} rx="3" fill="#b5523b" opacity=".85"/>
        <text x=${x} y=${H + 13} text-anchor="middle" font-size="10" fill="#8d8c85">${r.label}</text>
      </g>`;
    })}
  </svg>`;
}

// Generic vertical bars (seasonality etc.)
export function SimpleBars({ rows, height = 120, fmt = (v) => v.toFixed(1) }) {
  const max = Math.max(...rows.map((r) => Math.abs(r.v)), 0.01);
  const W = 340, H = height, mid = H / 2, slot = W / rows.length, bw = slot * 0.6;
  return html`<svg viewBox=${`0 0 ${W} ${H + 16}`} class="chart" style=${{ height: H + 16 + 'px' }}>
    <line x1="0" x2=${W} y1=${mid} y2=${mid} stroke="rgba(128,128,128,.3)"/>
    ${rows.map((r, i) => {
      const hh = (Math.abs(r.v) / max) * (mid - 4);
      const x = i * slot + (slot - bw) / 2;
      return html`<g><rect x=${x} y=${r.v >= 0 ? mid - hh : mid} width=${bw} height=${hh} rx="3" fill=${r.v < 0 ? '#1e8a55' : '#c2392f'} opacity=${r.hl ? 1 : 0.7}/>
        <text x=${x + bw / 2} y=${H + 12} text-anchor="middle" font-size="10" fill="#8d8c85" font-weight=${r.hl ? 700 : 400}>${r.label}</text></g>`;
    })}
  </svg>`;
}

// App-wide opener for the add/edit sheet (set by app.js)
export const sheets = { open: (opts) => {} };
