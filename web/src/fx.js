// Feel: short synthesised sounds (WebAudio, nothing downloaded), haptics, tilt-reactive shine,
// count-up numbers. Everything respects the mute setting and prefers-reduced-motion.
import { useEffect, useRef, useState } from 'preact/hooks';
import { get } from './store.js';

export const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };

// ---------- sounds ----------
let ctx = null;
const ac = () => {
  if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
};
// unlock audio on the first touch (iOS needs a user gesture)
const unlock = () => { try { ac(); } catch {} window.removeEventListener('touchend', unlock); window.removeEventListener('click', unlock); };
window.addEventListener('touchend', unlock, { passive: true }); window.addEventListener('click', unlock);

function tone(c, { f = 440, f2 = null, t = 0, d = 0.15, type = 'sine', g = 0.12, q = 0 }) {
  const o = c.createOscillator(), a = c.createGain();
  o.type = type; const t0 = c.currentTime + t;
  o.frequency.setValueAtTime(f, t0);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d);
  a.gain.setValueAtTime(0.0001, t0);
  a.gain.exponentialRampToValueAtTime(g, t0 + Math.min(0.012, d / 4));
  a.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
  let node = o;
  if (q) { const bq = c.createBiquadFilter(); bq.type = 'lowpass'; bq.frequency.value = q; o.connect(bq); node = bq; }
  node.connect(a); a.connect(c.destination);
  o.start(t0); o.stop(t0 + d + 0.05);
}
const SOUNDS = {
  // bright rising two-note chime with a soft shimmer
  buy: (c) => { tone(c, { f: 660, d: 0.12, g: 0.1, type: 'triangle' }); tone(c, { f: 990, t: 0.08, d: 0.22, g: 0.1, type: 'triangle' }); tone(c, { f: 1980, t: 0.1, d: 0.3, g: 0.025 }); },
  // falling two-note, warmer
  sell: (c) => { tone(c, { f: 880, d: 0.12, g: 0.1, type: 'triangle' }); tone(c, { f: 587, t: 0.08, d: 0.24, g: 0.1, type: 'triangle' }); tone(c, { f: 1174, t: 0.1, d: 0.25, g: 0.02 }); },
  // short "lock in" tick + ping
  set: (c) => { tone(c, { f: 1200, f2: 1600, d: 0.06, g: 0.06, type: 'square', q: 2500 }); tone(c, { f: 1320, t: 0.05, d: 0.18, g: 0.07 }); },
  // three quick rising pings
  alert: (c) => { [0, 0.11, 0.22].forEach((t, i) => tone(c, { f: [784, 988, 1318][i], t, d: 0.16, g: 0.11, type: 'triangle' })); },
  // low soft buzz
  error: (c) => { tone(c, { f: 180, f2: 120, d: 0.22, g: 0.12, type: 'sawtooth', q: 700 }); tone(c, { f: 150, t: 0.12, d: 0.2, g: 0.08, type: 'sawtooth', q: 600 }); },
  tap: (c) => tone(c, { f: 1800, d: 0.03, g: 0.025, type: 'sine' }),
  open: (c) => { tone(c, { f: 520, f2: 1040, d: 0.18, g: 0.05, type: 'sine' }); },
};
export function sound(name) {
  try {
    const st = get().settings;
    if (st.mute) return;
    const c = ac(); if (!c) return;
    (SOUNDS[name] || SOUNDS.tap)(c);
  } catch {}
}
export const haptic = (p = 10) => { try { if (get().settings.vibrate === false) return; if (window.CPNative && window.CPNative.vibrate) window.CPNative.vibrate(Array.isArray(p) ? p.reduce((a, b, i) => a + (i % 2 ? 0 : b), 0) : p); else if (navigator.vibrate) navigator.vibrate(p); } catch {} };
export const feedback = (name) => {
  sound(name);
  haptic({ buy: [12, 40, 18], sell: [18, 40, 12], set: 14, alert: [30, 60, 30, 60, 30], error: [60, 40, 60] }[name] || 8);
};

// ---------- tilt (DeviceOrientation) ----------
// Gives a smoothed {x, y} in -1..1. iOS asks for permission on the first tap.
const tilt = { x: 0, y: 0, on: false, subs: new Set(), asked: false };
let raf = 0, tx = 0, ty = 0;
function onOri(e) {
  if (e.gamma == null) return;
  tilt.on = true;
  tx = Math.max(-1, Math.min(1, e.gamma / 30));
  ty = Math.max(-1, Math.min(1, ((e.beta || 0) - 45) / 30));
  if (!raf) raf = requestAnimationFrame(step);
}
function step() {
  raf = 0;
  tilt.x += (tx - tilt.x) * 0.12; tilt.y += (ty - tilt.y) * 0.12;
  tilt.subs.forEach((f) => f(tilt));
  if (Math.abs(tx - tilt.x) > 0.002 || Math.abs(ty - tilt.y) > 0.002) raf = requestAnimationFrame(step);
}
export function startTilt() {
  if (reduced() || !('DeviceOrientationEvent' in window)) return false;
  const D = window.DeviceOrientationEvent;
  if (typeof D.requestPermission === 'function') {
    if (tilt.asked) return false;
    tilt.asked = true;
    D.requestPermission().then((r) => { if (r === 'granted') window.addEventListener('deviceorientation', onOri); }).catch(() => {});
    return true;
  }
  window.addEventListener('deviceorientation', onOri);
  return true;
}
export const needsTiltPermission = () => typeof (window.DeviceOrientationEvent && window.DeviceOrientationEvent.requestPermission) === 'function' && !tilt.asked;
export function useTilt(ref) {
  const [active, setActive] = useState(tilt.on);
  useEffect(() => {
    if (reduced()) return;
    startTilt();
    const f = (t) => {
      const el = ref.current; if (!el) return;
      if (!active) setActive(true);
      // light band position follows left/right tilt, angle follows forward/back tilt
      el.style.setProperty('--fx', `${50 + t.x * 45}%`);
      el.style.setProperty('--fa', `${115 + t.y * 25}deg`);
      el.style.setProperty('--gx', `${50 + t.x * 40}%`);
      el.style.setProperty('--gy', `${30 + t.y * 30}%`);
      el.style.setProperty('--ang', `${90 + t.x * 60}deg`);
    };
    tilt.subs.add(f);
    // touch/drag on the card also moves the shine (works on any device)
    const el = ref.current;
    const mv = (e) => {
      const p = e.touches ? e.touches[0] : e; const r = el.getBoundingClientRect();
      tx = ((p.clientX - r.left) / r.width) * 2 - 1; ty = ((p.clientY - r.top) / r.height) * 2 - 1;
      tilt.on = true; if (!raf) raf = requestAnimationFrame(step);
    };
    el && el.addEventListener('touchmove', mv, { passive: true });
    el && el.addEventListener('pointermove', mv);
    return () => { tilt.subs.delete(f); el && el.removeEventListener('touchmove', mv); el && el.removeEventListener('pointermove', mv); };
  }, []);
  return active;
}

// ---------- count-up numbers ----------
export function useCountUp(target, ms = 900) {
  const [v, setV] = useState(target);
  const from = useRef(null);
  useEffect(() => {
    if (target == null || !Number.isFinite(target)) { setV(target); return; }
    const start = from.current == null ? target * 0.92 : from.current;
    from.current = target;
    if (reduced() || start === target) { setV(target); return; }
    let id; const t0 = performance.now();
    const f = (t) => { const k = Math.min(1, (t - t0) / ms); const e = 1 - Math.pow(1 - k, 3); setV(start + (target - start) * e); if (k < 1) id = requestAnimationFrame(f); };
    id = requestAnimationFrame(f);
    return () => cancelAnimationFrame(id);
  }, [target]);
  return v;
}
