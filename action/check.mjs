// Runs every ~10 minutes on GitHub Actions.
//  1. Refreshes gold news (hourly) into docs/news.json, tagged "may rise / may fall".
//  2. Sends Web Push alerts to iPhones that turned on notifications:
//     gold below target, big 24h drop, hot news, credit-card bill, 9 pm reminder.
// Device settings arrive encrypted via ntfy.sh; only this job has the key (CFG_PRIVATE secret).
import fs from 'node:fs';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const webpush = createRequire(import.meta.url)('web-push');
import { computeSignals, parseQuotes, QUOTE_URL, SYMS } from '../web/src/signals.js';
import { prep, techScoreAt } from '../web/src/score.js';
import { refreshMacro } from './macro.mjs';

const { VAPID_PUBLIC, VAPID_PRIVATE, CFG_PRIVATE, TOPIC } = process.env;
const STATE = process.env.STATE_FILE || 'state/state.json';
const NEWS = process.env.NEWS_FILE || 'docs/news.json';
const MACRO = process.env.MACRO_FILE || NEWS.replace(/news\.json$/, 'macro.json');
const APP_URL = 'https://skibidi-null.github.io/creampie-holdings/';
const OZ = 31.1034768;
const now = Date.now();
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

const state = (() => { try { return JSON.parse(fs.readFileSync(STATE, 'utf8')); } catch { return {}; } })();
state.devices ||= {};
state.samples ||= [];
state.pollSince ||= Math.floor(now / 1000) - 12 * 3600;

// ---------- decrypt device settings from the relay ----------
function decrypt(blob) {
  const { e, iv, ct } = JSON.parse(blob);
  const ecdh = crypto.createECDH('prime256v1');
  ecdh.setPrivateKey(Buffer.from(CFG_PRIVATE, 'base64url'));
  const secret = ecdh.computeSecret(Buffer.from(e, 'base64url'));
  const key = Buffer.from(crypto.hkdfSync('sha256', secret, Buffer.alloc(0), Buffer.from('cph-config'), 32));
  const raw = Buffer.from(ct, 'base64url');
  const d = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64url'));
  d.setAuthTag(raw.subarray(raw.length - 16));
  return JSON.parse(Buffer.concat([d.update(raw.subarray(0, raw.length - 16)), d.final()]).toString('utf8'));
}

async function pullConfigs() {
  if (!TOPIC || !CFG_PRIVATE) return;
  try {
    const r = await fetch(`https://ntfy.sh/${TOPIC}/json?poll=1&since=${state.pollSince}`);
    const lines = (await r.text()).split('\n').filter(Boolean);
    let n = 0;
    for (const line of lines) {
      const m = JSON.parse(line);
      if (m.event !== 'message' || !m.message) continue;
      state.pollSince = Math.max(state.pollSince, m.time);
      try {
        const d = decrypt(m.message);
        if (!d.sub || !d.sub.endpoint) continue;
        const id = crypto.createHash('sha256').update(d.sub.endpoint).digest('hex').slice(0, 16);
        const old = state.devices[id];
        if (old && old.at > d.at) continue;
        state.devices[id] = { ...(old || {}), sub: d.sub, cfg: d.cfg, at: d.at, fired: (old && old.fired) || {} };
        n++;
      } catch (e) { log('bad config message', e.message); }
    }
    log(`relay: ${lines.length} msgs, ${n} device updates, ${Object.keys(state.devices).length} devices`);
  } catch (e) { log('relay error', e.message); }
}

// ---------- gold price ----------
async function goldPLN() {
  const [spot, fx] = await Promise.all([
    fetch('https://api.gold-api.com/price/XAU').then((r) => r.json()),
    fetch('https://api.nbp.pl/api/exchangerates/rates/a/usd/?format=json').then((r) => r.json()),
  ]);
  return (spot.price / OZ) * fx.rates[0].mid;
}

// ---------- news ----------
const RULES = [
  // [regex, impact, strength, why, category]
  [/\b(rate[- ]cuts?|cuts? (interest )?rates?|cutting rates|dovish|easing cycle|pause hikes?)\b/i, 'up', 2, 'Lower interest rates usually make gold more attractive', 'cut'],
  [/\b(rate[- ]hikes?|hikes? (interest )?rates?|raising rates|hawkish|tighten(ing)?|higher for longer)\b/i, 'down', 2, 'Higher interest rates usually weigh on gold', 'hike'],
  [/\b(war|invasion|invade[sd]?|missiles?|airstrikes?|attacks?|military|escalat\w*|conflict|nuclear)\b/i, 'up', 2, 'Fear and conflict push people into gold as a safe haven', 'war'],
  [/\b(ceasefire|cease-fire|peace (deal|talks|agreement)|truce|de-?escalat\w*)\b/i, 'down', 2, 'Calmer world → less demand for safe-haven gold', 'peace'],
  [/\b(dollar (falls?|slides?|weakens?|slumps?|drops?|dips?|eases?)|weak(er)? dollar)\b/i, 'up', 1, 'A weaker dollar makes gold cheaper for the world to buy', 'usdDown'],
  [/\b(dollar (rises?|gains?|jumps?|strengthens?|firms?|rall(y|ies)|climbs?)|strong(er)? dollar)\b/i, 'down', 1, 'A stronger dollar usually pushes gold down', 'usdUp'],
  [/\b(yields? (fall|drop|slide|ease|decline)s?)\b/i, 'up', 1, 'Falling bond yields help gold', 'yieldsDown'],
  [/\b(yields? (rise|jump|climb|surge|spike)s?)\b/i, 'down', 1, 'Rising bond yields compete with gold', 'yieldsUp'],
  [/\b(inflation (rises?|jumps?|accelerates?|heats?|hotter|surges?)|hot(ter)? inflation|sticky inflation)\b/i, 'up', 1, 'Rising inflation boosts gold as a store of value', 'inflUp'],
  [/\b(inflation (cools?|eases?|slows?|falls?)|disinflation)\b/i, 'down', 1, 'Cooling inflation reduces the need for gold'],
  [/\b(recession|crisis|crash|turmoil|sell-?off|bank (failure|collapse)|default|shutdown|debt ceiling)\b/i, 'up', 2, 'Economic stress drives safe-haven buying', 'crash'],
  [/\b(central banks? (buy|bought|buying|add|purchases?)|record (central bank )?purchases|PBOC|reserves? (buying|purchases))\b/i, 'up', 1, 'Central banks buying gold supports the price', 'cb'],
  [/\b(tariffs?|trade war|sanctions?)\b/i, 'up', 1, 'Trade tensions and sanctions add uncertainty'],
  [/\b(strong (jobs|payrolls|data)|jobs (beat|surge)|economy (booms|strong))\b/i, 'down', 1, 'Strong economy → fewer rate cuts → weaker gold'],
  [/\bgold\b.*\b(hits?|tops?|soars?|surges?|jumps?|rall(y|ies)|climbs?|rises?|gains?|up \d|higher|record|all-time high|rebounds?|recovers?)\b/i, 'up', 1, 'Momentum: gold is moving up'],
  [/\bgold\b.*\b(falls?|slips?|drops?|tumbles?|slides?|sinks?|plunges?|retreats?|dips?|eases?|loses?|lower|down( over)? \d|declines?|erases?|(one|1|multi)-(year|month|week) low|lowest|weak(er)? demand|fading demand)\b/i, 'down', 1, 'Momentum: gold is moving down'],
  [/\b(profit[- ]taking|risk[- ]on|stocks? (rally|surge|record))\b/i, 'down', 1, 'Investors moving from gold into riskier assets'],
  [/\b(margin calls?|dash for cash|forced selling|liquidat\w+)\b/i, 'down', 2, 'Traders selling gold to cover losses elsewhere (usually short-lived)', 'crash'],
];

function classify(title) {
  let up = 0, down = 0; const why = []; let cat = null;
  for (const [re, imp, w, reason, c] of RULES) {
    if (re.test(title)) { if (imp === 'up') up += w; else down += w; if (why.length < 1) why.push(reason); if (!cat && c) cat = c; }
  }
  if (cat === 'crash' && /gold|bullion/i.test(title) && !/stock|equit|market|bank|recession/i.test(title)) cat = null;
  const impact = up > down ? 'up' : down > up ? 'down' : 'watch';
  return { impact, cat, strength: Math.abs(up - down) || (up + down ? 1 : 0), why: why[0] || (/(fed|federal reserve|powell|warsh|ecb|inflation|cpi)/i.test(title) ? 'Central-bank & inflation news often moves gold' : '') };
}

const QUERIES = ['gold price', 'gold prices fed', 'federal reserve interest rates', 'geopolitical tensions markets', 'us dollar index'];
const decode = (s) => s.replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'").trim();

async function refreshNews() {
  const items = new Map();
  for (const q of QUERIES) {
    try {
      const xml = await (await fetch(`https://news.google.com/rss/search?q=${encodeURIComponent(q + ' when:2d')}&hl=en-US&gl=US&ceid=US:en`, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text();
      for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
        const get = (t) => { const x = m[1].match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`)); return x ? decode(x[1]) : ''; };
        let title = get('title'); const source = get('source') || 'News';
        if (title.endsWith(' - ' + source)) title = title.slice(0, -(source.length + 3));
        const date = new Date(get('pubDate')).toISOString();
        if (now - Date.parse(date) > 48 * 3600e3) continue;
        const key = title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().slice(0, 80);
        if (items.has(key)) continue;
        const relevant = /gold|bullion|fed|federal reserve|powell|warsh|rates?|inflation|dollar|treasur|yields?|war|ceasefire|tariff|central bank|recession/i.test(title);
        if (!relevant) continue;
        items.set(key, { id: crypto.createHash('sha1').update(key).digest('hex').slice(0, 10), title, source, link: get('link'), date, ...classify(title), gold: /gold|bullion/i.test(title) });
      }
    } catch (e) { log('news query failed', q, e.message); }
  }
  const list = [...items.values()].sort((a, b) => (b.gold - a.gold) || b.date.localeCompare(a.date));
  // gold headlines first, then the rest, newest first within each, cap 40
  const gold = list.filter((x) => x.gold).sort((a, b) => b.date.localeCompare(a.date));
  const other = list.filter((x) => !x.gold && x.impact !== 'watch').sort((a, b) => b.date.localeCompare(a.date));
  const out = [...gold.slice(0, 28), ...other.slice(0, 12)].sort((a, b) => b.date.localeCompare(a.date));
  return out;
}

// ---------- watchlist prices (cached per run) ----------
const pxCache = new Map();
async function assetPrice(sym) {
  if (pxCache.has(sym)) return pxCache.get(sym);
  let v = null;
  try {
    if (/^[A-Z0-9]+-USD$/.test(sym)) v = +(await (await fetch(`https://api.exchange.coinbase.com/products/${sym}/ticker`, { headers: { 'User-Agent': 'Mozilla/5.0' } })).json()).price || null;
    else { const q = parseQuotes(await (await fetch(QUOTE_URL([sym]), { headers: { 'User-Agent': 'Mozilla/5.0' } })).json())[sym]; v = q ? (q.ext && q.status !== 'REG_MKT' ? q.ext.last : q.last) : null; }
  } catch (e) { log('price failed', sym, e.message); }
  pxCache.set(sym, v); return v;
}

// ---------- local time helpers ----------
function local(tz) {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: tz || 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const p = Object.fromEntries(f.formatToParts(new Date(now)).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour), min: Number(p.minute), weekday: new Date(Date.UTC(+p.year, +p.month - 1, +p.day)).getUTCDay() };
}
function daysUntilDay(dateStr, day) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dim = (yy, mm) => new Date(yy, mm, 0).getDate();
  let due = new Date(Date.UTC(y, m - 1, Math.min(day, dim(y, m))));
  const today = new Date(Date.UTC(y, m - 1, d));
  if (due < today) due = new Date(Date.UTC(m === 12 ? y + 1 : y, m % 12, Math.min(day, dim(m === 12 ? y + 1 : y, (m % 12) + 1))));
  return { days: Math.round((due - today) / 864e5), due: due.toISOString().slice(0, 10) };
}

// ---------- main ----------
await pullConfigs();

let price = null;
try { price = await goldPLN(); state.samples.push([now, +price.toFixed(3)]); log('gold', price.toFixed(2), 'zł/g'); } catch (e) { log('price error', e.message); }
state.samples = state.samples.filter((x) => x[0] > now - 48 * 3600e3);

let news = null;
let newsFile = null;
try { newsFile = JSON.parse(fs.readFileSync(NEWS, 'utf8')); } catch {}
const newsAge = newsFile && newsFile.updated ? now - Date.parse(newsFile.updated) : Infinity;
if (newsAge > 55 * 60e3 || process.env.FORCE_NEWS) {
  try {
    const items = await refreshNews();
    if (items.length) {
      news = { updated: new Date(now).toISOString(), hours: 48, items };
      fs.writeFileSync(NEWS, JSON.stringify(news));
      log('news', items.length, 'items');
    }
  } catch (e) { log('news error', e.message); }
}
news ||= newsFile;

// ---------- calendar + early warnings (every run; file only changes when they change) ----------
// daily candles for % move and signal alerts (cached per run)
const barCache = new Map();
async function dailyBars(sym) {
  if (barCache.has(sym)) return barCache.get(sym);
  let out = [];
  try {
    if (/^[A-Z0-9]+-USD$/.test(sym)) {
      const end = Date.now(); const parts = [];
      for (let k = 0; k < 2; k++) { const e = end - k * 300 * 864e5, b = e - 300 * 864e5; parts.push(...(await (await fetch(`https://api.exchange.coinbase.com/products/${sym}/candles?granularity=86400&start=${new Date(b).toISOString()}&end=${new Date(e).toISOString()}`, { headers: { 'User-Agent': 'Mozilla/5.0' } })).json())); }
      const m = new Map(); for (const x of parts) if (Array.isArray(x)) m.set(x[0], { time: x[0], low: x[1], high: x[2], open: x[3], close: x[4], volume: x[5] });
      out = [...m.values()].sort((a, b) => a.time - b.time);
    } else {
      const ymd = (d) => d.toISOString().slice(0, 19).replace(/[-:T]/g, '');
      const j = await (await fetch(`https://ts-api.cnbc.com/harmony/app/bars/${encodeURIComponent(sym)}/1D/${ymd(new Date(Date.now() - 600 * 864e5))}/${ymd(new Date(Date.now() + 864e5))}/adjusted/EST5EDT.json`, { headers: { 'User-Agent': 'Mozilla/5.0' } })).json();
      out = ((j.barData && j.barData.priceBars) || []).map((b) => ({ time: Math.floor(b.tradeTimeinMills / 1000), open: +b.open || +b.close, high: +b.high || +b.close, low: +b.low || +b.close, close: +b.close, volume: +b.volume || 0 })).filter((b) => Number.isFinite(b.close));
    }
  } catch (e) { log('bars failed', sym, e.message); }
  barCache.set(sym, out); return out;
}
function techScore(bars, live) {
  if (!bars || bars.length < 230) return null;
  const B = live ? [...bars.slice(0, -1), { ...bars.at(-1), close: live }] : bars;
  const sc = techScoreAt(prep(B), B.length - 1); return sc == null ? null : Math.round(sc);
}
const inQuiet = (q, hour) => q && q.on && (q.from > q.to ? hour >= q.from || hour < q.to : hour >= q.from && hour < q.to);

let quotes = {};
try { quotes = parseQuotes(await (await fetch(QUOTE_URL(Object.values(SYMS)), { headers: { 'User-Agent': 'Mozilla/5.0' } })).json()); log('quotes', Object.keys(quotes).length); } catch (e) { log('quotes error', e.message); }
let cal = (news && news.cal) || (newsFile && newsFile.cal) || [];
if (!news || !news.calAt || now - news.calAt > 3 * 3600e3) {
  try {
    const r = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json', { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (r.ok) {
      cal = (await r.json()).filter((e) => (e.country === 'USD' && e.impact !== 'Low' && e.impact !== 'Holiday') || (e.impact === 'High' && ['EUR', 'CNY'].includes(e.country)))
        .map(({ title, country, date, impact, forecast, previous }) => ({ title, country, date: new Date(date).toISOString(), impact, forecast, previous }));
      if (news) news.calAt = now;
      log('calendar', cal.length);
    }
  } catch (e) { log('calendar error', e.message); }
}
const signals = computeSignals(quotes, cal, now);
if (news) {
  // keep the text of signals already published so the file (and the site) only changes when the SET changes
  const oldS = new Map((news.signals || []).map((x) => [x.id, x]));
  const nextS = signals.map((x) => oldS.get(x.id) || x);
  const changed = JSON.stringify(nextS.map((x) => x.id)) !== JSON.stringify((news.signals || []).map((x) => x.id)) || JSON.stringify(cal) !== JSON.stringify(news.cal || []);
  news.signals = nextS; news.cal = cal;
  if (changed) { fs.writeFileSync(NEWS, JSON.stringify(news)); log('signals', nextS.map((x) => x.id).join(' ') || 'none'); }
}

if (VAPID_PUBLIC && VAPID_PRIVATE) webpush.setVapidDetails(APP_URL, VAPID_PUBLIC, VAPID_PRIVATE);

const dayAgo = now - 24 * 3600e3;
const recent = state.samples.filter((x) => x[0] >= dayAgo);
const coverage = recent.length ? now - recent[0][0] : 0;
const hi24 = recent.length ? Math.max(...recent.map((x) => x[1])) : null;

for (const [id, dev] of Object.entries(state.devices)) {
  const c = dev.cfg || {};
  const f = (dev.fired ||= {});
  const L = local(c.tz);
  const sends = [];
  const g = c.gold || {};
  if (price && g.on) {
    if (g.below) {
      if (price <= g.below && !f.below) { sends.push({ title: 'Gold price alert', body: `Gold is now ${price.toFixed(2)} zł/g, below your ${g.below} zł target.`, url: APP_URL + '#/gold', tag: 'gold-below' }); f.below = true; }
      if (price > g.below * 1.005) f.below = false;
    }
    if (g.dropPct && hi24 && coverage > 3 * 3600e3) {
      const drop = ((hi24 - price) / hi24) * 100;
      if (drop >= g.dropPct && now - (f.dropAt || 0) > 6 * 3600e3) { sends.push({ title: `Gold dropped ${drop.toFixed(1)}% today`, body: `${price.toFixed(2)} zł/g, down from ${hi24.toFixed(2)} in the last 24 hours.`, url: APP_URL + '#/gold', tag: 'gold-drop' }); f.dropAt = now; }
    }
  }
  if (g.news && news && news.items) {
    f.seen ||= [];
    f.newsDay ||= ''; if (f.newsDay !== L.date) { f.newsDay = L.date; f.newsCount = 0; }
    const fresh = news.items.filter((n) => n.gold && n.impact !== 'watch' && n.strength >= 2 && now - Date.parse(n.date) < 6 * 3600e3 && !f.seen.includes(n.id));
    if (fresh.length && (f.newsCount || 0) < 3 && L.hour >= 8 && L.hour < 23) {
      const n = fresh[0];
      sends.push({ title: n.impact === 'up' ? 'News: gold may rise ▲' : 'News: gold may fall ▼', body: `${n.title}\n${n.why}.`, url: APP_URL + '#/news', tag: 'news' });
      f.newsCount = (f.newsCount || 0) + 1;
    }
    for (const n of fresh) f.seen.push(n.id);
    f.seen = f.seen.slice(-200);
  }
  if (g.signals !== false && g.on !== false && signals.length) {
    f.sig ||= [];
    f.sigDay ||= ''; if (f.sigDay !== L.date) { f.sigDay = L.date; f.sigCount = 0; }
    const fresh = signals.filter((x) => x.level === 'high' && !f.sig.includes(x.id));
    if (fresh.length && (f.sigCount || 0) < 4 && L.hour >= 7 && L.hour < 23) {
      const x = fresh[0];
      const when = x.when ? new Intl.DateTimeFormat('en-GB', { timeZone: c.tz || 'Europe/Warsaw', weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(x.when)) + ' · ' : '';
      sends.push({ title: (x.dir === 'up' ? '▲ ' : x.dir === 'down' ? '▼ ' : '! ') + x.title, body: when + x.body, url: APP_URL + '#/gold', tag: 'sig-' + x.id });
      f.sigCount = (f.sigCount || 0) + 1;
    }
    // quiet hours: mark as seen anyway so old warnings don't arrive in the morning
    for (const x of (L.hour >= 7 && L.hour < 23 ? fresh.slice(0, 1) : fresh)) f.sig.push(x.id);
    f.sig = f.sig.slice(-100);
  }
  // price and signal alerts v2 (stocks via CNBC, crypto via Coinbase)
  const quiet = inQuiet(c.quiet, L.hour);
  if (Array.isArray(c.alerts) && c.alerts.length) {
    f.al ||= {};
    for (const al of c.alerts) {
      const st = (f.al[al.id] ||= {});
      const fmt = (v) => (v >= 1 ? (+v).toFixed(2) : (+v).toPrecision(4));
      const url = APP_URL + '#/asset/' + encodeURIComponent(al.sym);
      const push = (title, body) => { if (quiet && !al.urgent) { st.quietSkip = now; return; } sends.push({ title, body, url, tag: 'al-' + al.id }); };
      const px = await assetPrice(al.sym); if (px == null) continue;
      let side = null, title = '', body = `Now ${fmt(px)}. Your alert.`;
      if (al.kind === 'above') { side = px >= al.a ? 1 : px < al.a * 0.997 ? 0 : st.s; title = `${al.name} is above ${fmt(al.a)}`; }
      else if (al.kind === 'below') { side = px <= al.a ? 1 : px > al.a * 1.003 ? 0 : st.s; title = `${al.name} fell below ${fmt(al.a)}`; }
      else if (al.kind === 'enter' || al.kind === 'leave') { const lo = Math.min(al.a, al.b), hi = Math.max(al.a, al.b); const inside = px >= lo && px <= hi; side = al.kind === 'enter' ? (inside ? 1 : 0) : inside ? 0 : 1; title = al.kind === 'enter' ? `${al.name} entered ${fmt(lo)} to ${fmt(hi)}` : `${al.name} left ${fmt(lo)} to ${fmt(hi)}`; }
      else if (al.kind === 'move') { const b = await dailyBars(al.sym); if (b.length < (al.days || 1) + 1) continue; const ref = b[b.length - 1 - (al.days || 1)].close; const ch = ((px - ref) / ref) * 100; const want = Math.abs(al.pct || 5); side = (al.dir === 'down' ? ch <= -want : al.dir === 'up' ? ch >= want : Math.abs(ch) >= want) ? 1 : 0; title = `${al.name} ${ch >= 0 ? 'up' : 'down'} ${Math.abs(ch).toFixed(1)}% in ${al.days === 1 ? 'a day' : al.days + ' days'}`; }
      else if (al.kind === 'score') { const sc = techScore(await dailyBars(al.sym), px); if (sc == null) continue; const sty = c.style || { buy: 60, sell: 40 }; const v = sc >= sty.buy ? 'buy' : sc <= sty.sell ? 'sell' : 'hold'; side = al.dir === 'any' ? v : (al.dir === 'sell' ? v === 'sell' : v === 'buy') ? 1 : 0; title = `${al.name}: technical signals now say ${v === 'buy' ? 'Buy' : v === 'sell' ? 'Sell' : 'Hold'}`; body = `Technical score ${sc}/100. Open the app for the full advisor reasons.`; if (al.dir === 'any') { if (st.s !== undefined && st.s !== side) push(title, body); st.s = side; continue; } }
      else continue;
      if (side === 1 && st.s === 0 && (!al.once || !st.done)) { push(title, body); if (al.once) st.done = 1; }
      st.s = side;
    }
  }
  // Sunday summary (Sunday 18:00-19:00 local)
  if (c.sunday && L.weekday === 0 && L.hour === 18 && f.sunday !== L.date) {
    f.sunday = L.date;
    const mv = (sym, nm) => { const q = quotes[sym]; return q && q.pct != null ? `${nm} ${q.pct >= 0 ? '+' : ''}${q.pct.toFixed(1)}%` : null; };
    let spxW = null; try { const b = await dailyBars('.SPX'); if (b.length > 6) spxW = ((b.at(-1).close / b.at(-6).close) - 1) * 100; } catch {}
    let goldW = null; try { const b = await dailyBars('@GC.1'); if (b.length > 6) goldW = ((b.at(-1).close / b.at(-6).close) - 1) * 100; } catch {}
    const nextEv = (cal || []).filter((e) => e.impact === 'High' && Date.parse(e.date) > now && Date.parse(e.date) < now + 7 * 864e5).slice(0, 3).map((e) => e.title);
    const parts = [
      c.sunday.nwPct != null ? `Your net worth ${c.sunday.nwPct >= 0 ? '+' : ''}${c.sunday.nwPct}% this week.` : null,
      [spxW != null ? `S&P 500 ${spxW >= 0 ? '+' : ''}${spxW.toFixed(1)}%` : null, goldW != null ? `gold ${goldW >= 0 ? '+' : ''}${goldW.toFixed(1)}%` : null].filter(Boolean).join(', ') + (spxW != null || goldW != null ? ' this week.' : ''),
      c.sunday.calls && c.sunday.calls.length ? `Advisor: ${c.sunday.calls.join(', ')}.` : null,
      nextEv.length ? `Next week: ${nextEv.join(', ')}.` : null,
    ].filter(Boolean);
    if (parts.length) sends.push({ title: 'Your Sunday summary', body: parts.join(' '), url: APP_URL + '#/world/brief', tag: 'sunday' });
  }
  // DCA payday reminder (09:00-10:00 local on the chosen day)
  if (c.dca && L.hour === 9 && +L.date.slice(8) === c.dca.day && f.dca !== L.date) { f.dca = L.date; sends.push({ title: 'DCA day', body: `Time for your monthly investment${c.dca.amount ? ` of ${c.dca.amount}` : ''}. Open the app to buy.`, url: APP_URL + '#/dca', tag: 'dca' }); }
  // weekly backup reminder (Saturday 11:00)
  if (c.backup && L.weekday === 6 && L.hour === 11 && f.bk !== L.date && now - (c.backup.last || 0) > 7 * 864e5) { f.bk = L.date; sends.push({ title: 'Time for a backup', body: 'Your last encrypted backup is more than a week old.', url: APP_URL + '#/backup', tag: 'backup' }); }
  const card = c.card || {};
  if (card.on && card.dueDay && card.owed > 0 && L.hour >= 9 && L.hour < 21) {
    const { days, due } = daysUntilDay(L.date, card.dueDay);
    const key = `${due}:${days}`;
    if ([3, 1, 0].includes(days) && f.card !== key) {
      sends.push({ title: days === 0 ? `💳 ${card.name} bill due TODAY` : `💳 ${card.name} bill in ${days} day${days > 1 ? 's' : ''}`, body: `Amount to pay: ${card.owed.toFixed(2)} zł`, url: APP_URL + '#/card', tag: 'card' });
      f.card = key;
    }
  }
  if (c.remind9pm && L.hour === 21 && f.night !== L.date) {
    if (c.lastEntry !== L.date) sends.push({ title: 'Daily reminder', body: 'Add today\'s spending before you forget.', url: APP_URL + '#/add', tag: 'night' });
    f.night = L.date;
  }
  if (inQuiet(c.quiet, L.hour)) for (let i = sends.length - 1; i >= 0; i--) if (!/^(al-|card)/.test(sends[i].tag || '')) sends.splice(i, 1);
  for (const msg of sends) {
    try { await webpush.sendNotification(dev.sub, JSON.stringify(msg), { TTL: 3600, urgency: 'high' }); log('push', id, msg.tag); }
    catch (e) {
      log('push failed', id, e.statusCode, e.body);
      if ([400, 403, 404, 410].includes(e.statusCode)) { delete state.devices[id]; break; }
    }
  }
  // forget devices silent for 60 days
  if (state.devices[id] && now - dev.at > 60 * 864e5) delete state.devices[id];
}

try { await refreshMacro(MACRO, now); } catch (e) { log('macro error', e.message); }

fs.mkdirSync(STATE.split('/').slice(0, -1).join('/') || '.', { recursive: true });
fs.writeFileSync(STATE, JSON.stringify(state));
log('done');
