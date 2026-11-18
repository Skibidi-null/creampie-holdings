// Alerts while the app is closed.
//  Android app: hands the settings to the native background checker (CPNative.setConfig).
//  iPhone (Home Screen app): Web Push. Settings are encrypted on the phone and dropped in a
//  relay (ntfy.sh); only the GitHub job holds the key to read them. No money data is included
//  except the credit-card amount due, which is needed for the bill reminder.
import { get, cardOwed, dailyLimit, monthStats, onSaved, set } from './store.js';
import { thisYm } from './util.js';
import { VAPID_PUBLIC, CFG_PUBLIC, TOPIC } from './keys.js';
import { live } from './gold.js';

export const isNative = () => !!window.CPNative;
export const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
export const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
export const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

function config() {
  const s = get();
  const dl = dailyLimit(s);
  return {
    v: 1,
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Warsaw',
    gold: { on: !!s.gold.alertsOn, below: s.gold.below || null, dropPct: s.gold.dropPct || null, news: !!s.gold.newsOn, signals: s.gold.signalsOn !== false },
    markets: { on: s.markets.alertsOn !== false, alerts: Object.entries(s.markets.alerts || {}).slice(0, 30).map(([sym, a]) => ({ sym, name: ((s.markets.list || []).find((x) => x.sym === sym) || {}).name || sym, above: a.above || null, below: a.below || null })) },
    remind9pm: !!s.settings.remind9pm,
    card: { on: !!(s.card.on && s.settings.cardRemind), name: s.card.name, dueDay: s.card.dueDay || 0, owed: Math.round(cardOwed(s) * 100) / 100 },
    lastEntry: s.txns.length ? s.txns.reduce((m, t) => (t.date > m ? t.date : m), '') : null,
    widget: {
      today: dl ? dl.todaySpent : null,
      left: dl ? dl.left : null,
      month: monthStats(s, thisYm()).spend,
      gold: live.price || null,
      privacy: !!s.settings.privacy,
    },
  };
}

const b64u = {
  enc: (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
  dec: (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0)),
};

async function encrypt(obj) {
  const server = await crypto.subtle.importKey('raw', b64u.dec(CFG_PUBLIC), { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const eph = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const secret = await crypto.subtle.deriveBits({ name: 'ECDH', public: server }, eph.privateKey, 256);
  const hk = await crypto.subtle.importKey('raw', secret, 'HKDF', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: new TextEncoder().encode('cph-config') }, hk, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(obj)));
  const epub = await crypto.subtle.exportKey('raw', eph.publicKey);
  return JSON.stringify({ e: b64u.enc(epub), iv: b64u.enc(iv), ct: b64u.enc(ct) });
}

let lastSent = '';
let sendTimer = null;
export async function syncConfig(force) {
  const cfg = config();
  if (isNative()) {
    try { window.CPNative.setConfig(JSON.stringify(cfg)); } catch {}
    return true;
  }
  if (!get().settings.alertsSetup || !pushSupported()) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return false;
    const { widget, ...rest } = cfg; // widget only matters on Android
    const body = { sub: sub.toJSON(), cfg: rest, at: Date.now() };
    const key = JSON.stringify({ ...body, at: 0 });
    const lastAt = Number(localStorage.getItem('cp.cfg.at') || 0);
    if (!force && key === lastSent && Date.now() - lastAt < 6 * 3600e3) return true;
    const r = await fetch(`https://ntfy.sh/${TOPIC}`, { method: 'POST', body: await encrypt(body) });
    if (r.ok) { lastSent = key; localStorage.setItem('cp.cfg.at', String(Date.now())); }
    return r.ok;
  } catch (e) { console.warn('sync', e); return false; }
}

onSaved.add(() => { clearTimeout(sendTimer); sendTimer = setTimeout(() => syncConfig(), 2500); });

export async function enablePush() {
  if (isNative()) { try { window.CPNative.requestNotifications(); } catch {} set((s) => ({ ...s, settings: { ...s.settings, alertsSetup: true } })); return 'ok'; }
  if (isIOS() && !isStandalone()) return 'install-first';
  if (!pushSupported()) return 'unsupported';
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') return 'denied';
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64u.dec(VAPID_PUBLIC) });
  set((s) => ({ ...s, settings: { ...s.settings, alertsSetup: true } }));
  const ok = await syncConfig(true);
  return ok ? 'ok' : 'relay-failed';
}

// Local notification while the app is open (in-app alert)
export async function localNotify(title, body) {
  if (isNative()) { try { window.CPNative.notify(title, body); } catch {} return; }
  try {
    if (Notification.permission === 'granted') {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification(title, { body, icon: 'icons/icon-192.png', badge: 'icons/badge.png', tag: title });
    }
  } catch {}
}
