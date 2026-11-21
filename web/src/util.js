// Small helpers: numbers, dates, ids, files.

export const pad = (n) => String(n).padStart(2, '0');
export const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => iso(new Date());
export const ymOf = (s) => s.slice(0, 7);
export const thisYm = () => today().slice(0, 7);
export const parseDate = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (s, n) => { const d = parseDate(s); d.setDate(d.getDate() + n); return iso(d); };
export const daysBetween = (a, b) => Math.round((parseDate(b) - parseDate(a)) / 86400000);
export const daysInMonth = (ym) => { const [y, m] = ym.split('-').map(Number); return new Date(y, m, 0).getDate(); };
export const prevYm = (ym) => { const [y, m] = ym.split('-').map(Number); return m === 1 ? `${y - 1}-12` : `${y}-${pad(m - 1)}`; };
export const nextYm = (ym) => { const [y, m] = ym.split('-').map(Number); return m === 12 ? `${y + 1}-01` : `${y}-${pad(m + 1)}`; };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const monthName = (ym, long) => { const [y, m] = ym.split('-').map(Number); return `${(long ? MONTHS_LONG : MONTHS)[m - 1]} ${y}`; };
export const shortMonth = (i) => MONTHS[i];
export const niceDate = (s) => {
  const t = today();
  if (s === t) return 'Today';
  if (s === addDays(t, -1)) return 'Yesterday';
  const d = parseDate(s);
  const base = `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  return d.getFullYear() === new Date().getFullYear() ? base : `${base} ${d.getFullYear()}`;
};

let _seq = 0;
export const uid = () => Date.now().toString(36) + (_seq++ % 1296).toString(36).padStart(2, '0') + Math.random().toString(36).slice(2, 5);

// Accepts "1 234,50", "1234.5", "12,5"
export const parseNum = (v) => {
  if (typeof v === 'number') return v;
  if (v == null) return NaN;
  const s = String(v).replace(/\s|zł/g, '').replace(',', '.');
  if (s === '' || s === '.') return NaN;
  return Number(s);
};

const nf = {};
const fmtr = (d) => (nf[d] ||= new Intl.NumberFormat('pl-PL', { minimumFractionDigits: d, maximumFractionDigits: d }));
export const num = (v, d = 2) => fmtr(d).format(Number.isFinite(v) ? v : 0).replace(/ /g, ' ');
export const SYM = { PLN: 'zł', EUR: '€', USD: '$', AED: 'AED', GBP: '£', INR: '₹' };
export const CURS = ['PLN', 'AED', 'USD', 'EUR', 'INR', 'GBP'];
// Display currency: every money() call converts from its source currency into the
// currency chosen for the current section (app-wide default, or a per-section override).
// rates = zł per 1 unit (from the store). Set by the app shell on each render.
export const DISP = { cur: 'PLN', rates: null, app: 'PLN', sec: {} };
export function setDisplay(app, sec, rates) { DISP.app = app || 'PLN'; DISP.sec = sec || {}; DISP.rates = rates; DISP.cur = DISP.app; }
// call at the top of a screen's render to pick that section's currency
export function section(name) { DISP.cur = (name && DISP.sec[name]) || DISP.app; return DISP.cur; }
export function convert(v, from = 'PLN', to = DISP.cur) {
  if (v == null || !Number.isFinite(v)) return null;
  if (!from || from === to) return v;
  const r = DISP.rates || {};
  const pln = from === 'PLN' ? v : r[from] ? v * r[from] : null;
  if (pln == null) return null;
  return to === 'PLN' ? pln : r[to] ? pln / r[to] : null;
}
export const fmtCur = (v, cur = 'PLN', d = 2) => {
  const s = num(Math.abs(v), d);
  const sign = v < 0 ? '\u2212' : '';
  if (cur === 'PLN') return `${sign}${s} zł`;
  if (cur === 'AED') return `${sign}${s} AED`;
  return `${sign}${SYM[cur] || cur + ' '}${s}`;
};
// converts into the display currency (falls back to the source currency if no rate yet)
export const money = (v, cur = 'PLN', d = 2) => {
  const c = convert(v, cur);
  return c == null ? fmtCur(v, cur, d) : fmtCur(c, DISP.cur, d);
};
// format in a given section's currency without changing the current one
export const moneyIn = (sec, v, cur = 'PLN', d = 2) => { const keep = DISP.cur; DISP.cur = (sec && DISP.sec[sec]) || DISP.app; try { return money(v, cur, d); } finally { DISP.cur = keep; } };
// no conversion (amounts that must stay in their own currency, e.g. order sizes)
export const rawMoney = fmtCur;
export const pct = (v, d = 1) => `${v > 0 ? '+' : v < 0 ? '\u2212' : ''}${num(Math.abs(v), d)}%`;

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const sum = (a, f = (x) => x) => a.reduce((s, x) => s + f(x), 0);

export async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const vibrate = (ms = 12) => { try { navigator.vibrate && navigator.vibrate(ms); } catch {} };

export const b64FromBytes = (bytes) => {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
};

// Save a file: Android app bridge, iPhone share sheet, or browser download.
export async function saveFile(name, mime, bytes) {
  if (window.CPNative && window.CPNative.saveFile) {
    window.CPNative.saveFile(name, mime, b64FromBytes(bytes));
    return 'saved';
  }
  const file = new File([bytes], name, { type: mime });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: name }); return 'shared'; } catch (e) { if (e.name === 'AbortError') return 'cancelled'; }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return 'downloaded';
}
