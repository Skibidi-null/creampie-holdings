// Market sessions (opening hours in each exchange's own time zone) and the risk-on/off meter.
// Hours are the regular sessions; holidays are not modelled (the live quote status from CNBC
// is shown next to it where available).
import { A } from './assets.js';

export const EXCHANGES = [
  { id: 'nzx', name: 'Wellington', city: 'NZ', tz: 'Pacific/Auckland', open: '10:00', close: '16:45', idx: null },
  { id: 'tse', name: 'Tokyo', city: 'Japan', tz: 'Asia/Tokyo', open: '09:00', close: '15:30', lunch: ['11:30', '12:30'], idx: '.N225' },
  { id: 'hk', name: 'Hong Kong', city: 'China', tz: 'Asia/Hong_Kong', open: '09:30', close: '16:00', lunch: ['12:00', '13:00'], idx: '.HSI' },
  { id: 'sse', name: 'Shanghai', city: 'China', tz: 'Asia/Shanghai', open: '09:30', close: '15:00', lunch: ['11:30', '13:00'], idx: '.SSEC' },
  { id: 'nse', name: 'Mumbai', city: 'India', tz: 'Asia/Kolkata', open: '09:15', close: '15:30', idx: '.NSEI' },
  { id: 'dfm', name: 'Dubai', city: 'UAE', tz: 'Asia/Dubai', open: '10:00', close: '15:00', idx: '.DFMGI', days: [1, 2, 3, 4, 5] },
  { id: 'gpw', name: 'Warsaw', city: 'Poland', tz: 'Europe/Warsaw', open: '09:00', close: '17:00', idx: null },
  { id: 'xetra', name: 'Frankfurt', city: 'Germany', tz: 'Europe/Berlin', open: '09:00', close: '17:30', idx: '.GDAXI' },
  { id: 'lse', name: 'London', city: 'UK', tz: 'Europe/London', open: '08:00', close: '16:30', idx: '.FTSE' },
  { id: 'nyse', name: 'New York', city: 'USA', tz: 'America/New_York', open: '09:30', close: '16:00', idx: '.SPX' },
];
export const WORLD_IDX = [
  ['.SPX', 'S&P 500', 'USA'], ['.IXIC', 'Nasdaq', 'USA'], ['.DJI', 'Dow Jones', 'USA'], ['.RUT', 'Russell 2000', 'USA'],
  ['.FTSE', 'FTSE 100', 'UK'], ['.GDAXI', 'DAX', 'Germany'], ['.FCHI', 'CAC 40', 'France'], ['.STOXX50E', 'Euro Stoxx 50', 'Europe'],
['.N225', 'Nikkei 225', 'Japan'], ['.HSI', 'Hang Seng', 'Hong Kong'], ['.SSEC', 'Shanghai', 'China'],
  ['.NSEI', 'Nifty 50', 'India'], ['.KS11', 'KOSPI', 'Korea'], ['.AXJO', 'ASX 200', 'Australia'], ['.DFMGI', 'Dubai DFM', 'UAE'],
];

const hm = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
function localNow(tz, now = new Date()) {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(now);
  const g = (t) => (p.find((x) => x.type === t) || {}).value;
  const wd = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[g('weekday')];
  return { wd, min: (+g('hour') % 24) * 60 + +g('minute') };
}
// status of one exchange: open / lunch / closed + minutes to the next change
export function session(ex, now = new Date()) {
  const { wd, min } = localNow(ex.tz, now);
  const days = ex.days || [1, 2, 3, 4, 5];
  const o = hm(ex.open), c = hm(ex.close);
  const today = days.includes(wd);
  if (today && min >= o && min < c) {
    if (ex.lunch && min >= hm(ex.lunch[0]) && min < hm(ex.lunch[1])) return { st: 'lunch', label: 'Lunch break', mins: hm(ex.lunch[1]) - min };
    return { st: 'open', label: 'Open', mins: c - min };
  }
  // minutes until next open
  let add = 0, d = wd, m = min;
  for (let i = 0; i < 8; i++) {
    if (days.includes(d) && m < o) return { st: 'closed', label: 'Closed', mins: add + (o - m) };
    add += 1440 - m; m = 0; d = (d + 1) % 7;
  }
  return { st: 'closed', label: 'Closed', mins: null };
}
export const fmtMins = (m) => (m == null ? '' : m < 60 ? `${m} min` : m < 1440 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m` : `${Math.floor(m / 1440)}d ${Math.floor((m % 1440) / 60)}h`);
// position of an exchange's session on a 24h bar in the user's own time zone (0..1)
export function sessionBar(ex, now = new Date()) {
  const here = localNow(Intl.DateTimeFormat().resolvedOptions().timeZone, now).min;
  const there = localNow(ex.tz, now).min;
  let off = there - here; if (off > 720) off -= 1440; if (off < -720) off += 1440;
  const o = ((hm(ex.open) - off) + 1440) % 1440, c = ((hm(ex.close) - off) + 1440) % 1440;
  return { o: o / 1440, c: c / 1440, now: here / 1440 };
}
export const openNow = (now = new Date()) => EXCHANGES.filter((e) => session(e, now).st === 'open');

// ---------- risk-on / risk-off meter (0 = risk-off, 100 = risk-on) ----------
// From live data only: VIX level, S&P 500 day move, Nasdaq vs Dow, gold, dollar, high-yield
// credit (HYG) and Bitcoin. Missing inputs are skipped and listed.
export function riskMeter() {
  const q = A.q; const parts = [];
  const add = (name, v, txt) => parts.push({ name, v: Math.max(-1, Math.min(1, v)), txt });
  const vix = q['.VIX'];
  if (vix && vix.last != null) add('Fear index (VIX)', vix.last < 14 ? 1 : vix.last < 18 ? 0.5 : vix.last < 22 ? 0 : vix.last < 28 ? -0.6 : -1, `VIX ${vix.last.toFixed(1)}`);
  const spx = q['.SPX'];
  if (spx && spx.pct != null) add('Stocks today', spx.pct / 1.2, `S&P 500 ${spx.pct >= 0 ? '+' : ''}${spx.pct.toFixed(2)}%`);
  const ndx = q['.IXIC'], dji = q['.DJI'];
  if (ndx && dji && ndx.pct != null && dji.pct != null) add('Tech vs defensives', (ndx.pct - dji.pct) / 0.8, `Nasdaq ${(ndx.pct - dji.pct) >= 0 ? 'ahead of' : 'behind'} Dow by ${Math.abs(ndx.pct - dji.pct).toFixed(2)} pts`);
  const hyg = q.HYG;
  if (hyg && hyg.pct != null) add('Credit (junk bonds)', hyg.pct / 0.4, `HYG ${hyg.pct >= 0 ? '+' : ''}${hyg.pct.toFixed(2)}%`);
  const gold = q['@GC.1'];
  if (gold && gold.pct != null) add('Gold (safe haven)', -gold.pct / 1.2, `Gold ${gold.pct >= 0 ? '+' : ''}${gold.pct.toFixed(2)}%`);
  const dxy = q['.DXY'];
  if (dxy && dxy.pct != null) add('US dollar', -dxy.pct / 0.5, `Dollar ${dxy.pct >= 0 ? '+' : ''}${dxy.pct.toFixed(2)}%`);
  const btc = q['BTC-USD'];
  if (btc && btc.pct != null) add('Bitcoin (24h)', btc.pct / 4, `Bitcoin ${btc.pct >= 0 ? '+' : ''}${btc.pct.toFixed(1)}%`);
  if (!parts.length) return null;
  const w = { 'Fear index (VIX)': 2, 'Stocks today': 1.5 };
  let s = 0, ws = 0; for (const p of parts) { const k = w[p.name] || 1; s += p.v * k; ws += k; }
  const score = Math.round(50 + (s / ws) * 50);
  const label = score >= 65 ? 'Risk-on' : score >= 55 ? 'Leaning risk-on' : score > 45 ? 'Neutral' : score > 35 ? 'Leaning risk-off' : 'Risk-off';
  return { score, label, parts, on: score >= 55, off: score <= 45 };
}
export const RISK_SYMS = ['.VIX', '.SPX', '.IXIC', '.DJI', 'HYG', '@GC.1', '.DXY', 'BTC-USD'];
