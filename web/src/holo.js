// HOLO building blocks: holographic card with tilt-reactive shine, signal gauge, sparkline,
// status lights.
import { useRef, useMemo } from 'preact/hooks';
import { html } from './ui.js';
import { useTilt } from './fx.js';
import { level, ageTxt, health, SOURCES } from './data.js';

let gid = 0;
export function HoloCard({ children, cls = '', onClick, style }) {
  const ref = useRef();
  const tilting = useTilt(ref);
  return html`<div class=${`holo ${tilting ? 'tilt' : ''} ${cls}`} onClick=${onClick} style=${style}>
    <div class="in" ref=${ref}>
      <div class="orbglow"></div>
      <div class="foil"></div><div class="glint"></div><div class="sweep"></div>
      <div class="content">${children}</div>
    </div>
  </div>`;
}

// 270-degree arc, gold to mint, value 0..100
export const VERDICT = (s) => (s == null ? ['Unavailable', 'na'] : s >= 75 ? ['Strong buy', 'sbuy'] : s >= 60 ? ['Buy', 'buy'] : s > 40 ? ['Hold', 'hold'] : s > 25 ? ['Sell', 'sell'] : ['Strong sell', 'ssell']);
export function Gauge({ score, size = 76, label, stroke = 7 }) {
  const id = useMemo(() => 'gg' + ++gid, []);
  const r = size / 2 - stroke, c = 2 * Math.PI * r, arc = c * 0.75;
  const v = score == null ? 0 : Math.max(0, Math.min(100, score));
  const col = score == null ? '#6E7190' : v >= 60 ? '#3CFFB4' : v > 40 ? '#FFE36E' : '#FF5C8A';
  const lbl = label != null ? label : VERDICT(score)[0];
  return html`<div class="gaugewrap" style=${{ width: size + 'px', height: size + 'px' }}>
    <svg width=${size} height=${size} viewBox=${`0 0 ${size} ${size}`} style="transform:rotate(135deg)">
      <defs><linearGradient id=${id} x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#FFE36E"/><stop offset="1" stop-color="#3CFFB4"/></linearGradient></defs>
      <circle cx=${size / 2} cy=${size / 2} r=${r} fill="none" stroke="rgba(255,255,255,.08)" stroke-width=${stroke} stroke-linecap="round" stroke-dasharray=${`${arc} ${c}`} />
      <circle class="arc" cx=${size / 2} cy=${size / 2} r=${r} fill="none" stroke=${score != null && v < 41 ? '#FF5C8A' : `url(#${id})`} stroke-width=${stroke} stroke-linecap="round" stroke-dasharray=${`${arc} ${c}`} stroke-dashoffset=${arc * (1 - v / 100)} />
    </svg>
    <div class="gv"><b style=${{ fontSize: size * 0.29 + 'px' }}>${score == null ? '-' : Math.round(v)}</b>${size >= 60 && html`<span style=${{ color: col }}>${lbl.toUpperCase()}</span>`}</div>
  </div>`;
}

// smooth gradient sparkline: pts = [[t, v], ...] or [v, ...]
export function Spark({ pts, w = 100, h = 24, color, holo = false, fill = false, dot = false, cls = '' }) {
  const id = useMemo(() => 'sp' + ++gid, []);
  const vals = (pts || []).map((p) => (Array.isArray(p) ? p[1] : p)).filter((v) => v != null && Number.isFinite(v));
  if (vals.length < 2) return html`<svg class=${cls} width=${w} height=${h} viewBox=${`0 0 ${w} ${h}`}><line x1="0" x2=${w} y1=${h / 2} y2=${h / 2} stroke="rgba(255,255,255,.1)" stroke-dasharray="2 3"/></svg>`;
  const step = Math.max(1, Math.floor(vals.length / 120));
  const v = vals.filter((_, i) => i % step === 0 || i === vals.length - 1);
  const lo = Math.min(...v), hi = Math.max(...v), pad = 2;
  const X = (i) => (i / (v.length - 1)) * w, Y = (x) => pad + (1 - (x - lo) / (hi - lo || 1)) * (h - 2 * pad);
  let d = `M0 ${Y(v[0]).toFixed(1)}`;
  for (let i = 1; i < v.length; i++) { const x0 = X(i - 1), x1 = X(i), xm = (x0 + x1) / 2; d += ` C${xm.toFixed(1)} ${Y(v[i - 1]).toFixed(1)} ${xm.toFixed(1)} ${Y(v[i]).toFixed(1)} ${x1.toFixed(1)} ${Y(v[i]).toFixed(1)}`; }
  const up = v.at(-1) >= v[0];
  const c = color || (up ? '#3CFFB4' : '#FF5C8A');
  return html`<svg class=${`${cls} draw`} width=${w} height=${h} viewBox=${`0 0 ${w} ${h}`} preserveAspectRatio="none" style="overflow:visible">
    <defs>
      <linearGradient id=${id} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FF3CC8"/><stop offset=".5" stop-color="#7A5CFF"/><stop offset="1" stop-color="#00D2FF"/></linearGradient>
      <linearGradient id=${id + 'f'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color=${holo ? '#7A5CFF' : c} stop-opacity=".35"/><stop offset="1" stop-color=${holo ? '#7A5CFF' : c} stop-opacity="0"/></linearGradient>
    </defs>
    ${fill && html`<path d=${`${d} L${w} ${h} L0 ${h} Z`} fill=${`url(#${id}f)`} />`}
    <path d=${d} fill="none" stroke=${holo ? `url(#${id})` : c} stroke-width=${holo ? 2.2 : 1.6} vector-effect="non-scaling-stroke" stroke-linecap="round" />
    ${dot && html`<circle cx=${w} cy=${Y(v.at(-1))} r="3.5" fill=${holo ? '#00D2FF' : c} class="livedot" style="animation:pulse 1.6s infinite" />`}
  </svg>`;
}

// status light for one data source
export function Light({ src, fresh = 5 * 60e3, text = true }) {
  const lv = level(src, fresh); const h = health[src];
  const col = { ok: 'var(--up)', old: 'var(--warn)', bad: 'var(--down)', off: 'var(--mute)' }[lv];
  return html`<span class="row" style="gap:6px;display:inline-flex"><i style=${{ width: '7px', height: '7px', borderRadius: '50%', background: col, boxShadow: lv === 'ok' ? `0 0 6px ${col}` : 'none', display: 'inline-block' }}></i>${text && html`<span class="hint">${SOURCES[src] || src} · ${lv === 'bad' ? 'not answering' : h && h.at ? ageTxt(h.at) : 'waiting'}</span>`}</span>`;
}
