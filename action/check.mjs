// Runs every ~10 minutes on GitHub Actions.
//  1. Refreshes gold news (hourly) into docs/news.json, tagged "may rise / may fall".
//  2. Sends Web Push alerts to iPhones that turned on notifications:
//     gold below target, big 24h drop, hot news, credit-card bill, 9 pm reminder.
// Device settings arrive encrypted via ntfy.sh; only this job has the key (CFG_PRIVATE secret).
import fs from 'node:fs';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const webpush = createRequire(import.meta.url)('web-push');

const { VAPID_PUBLIC, VAPID_PRIVATE, CFG_PRIVATE, TOPIC } = process.env;
const STATE = process.env.STATE_FILE || 'state/state.json';
const NEWS = process.env.NEWS_FILE || 'docs/news.json';
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
  // [regex, impact, strength, why]
  [/\b(rate[- ]cuts?|cuts? (interest )?rates?|cutting rates|dovish|easing cycle|pause hikes?)\b/i, 'up', 2, 'Lower interest rates usually make gold more attractive'],
  [/\b(rate[- ]hikes?|hikes? (interest )?rates?|raising rates|hawkish|tighten(ing)?|higher for longer)\b/i, 'down', 2, 'Higher interest rates usually weigh on gold'],
  [/\b(war|invasion|invade[sd]?|missiles?|airstrikes?|attacks?|military|escalat\w*|conflict|nuclear)\b/i, 'up', 2, 'Fear and conflict push people into gold as a safe haven'],
  [/\b(ceasefire|cease-fire|peace (deal|talks|agreement)|truce|de-?escalat\w*)\b/i, 'down', 2, 'Calmer world → less demand for safe-haven gold'],
  [/\b(dollar (falls?|slides?|weakens?|slumps?|drops?|dips?|eases?)|weak(er)? dollar)\b/i, 'up', 1, 'A weaker dollar makes gold cheaper for the world to buy'],
  [/\b(dollar (rises?|gains?|jumps?|strengthens?|firms?|rall(y|ies)|climbs?)|strong(er)? dollar)\b/i, 'down', 1, 'A stronger dollar usually pushes gold down'],
  [/\b(yields? (fall|drop|slide|ease|decline)s?)\b/i, 'up', 1, 'Falling bond yields help gold'],
  [/\b(yields? (rise|jump|climb|surge|spike)s?)\b/i, 'down', 1, 'Rising bond yields compete with gold'],
  [/\b(inflation (rises?|jumps?|accelerates?|heats?|hotter|surges?)|hot(ter)? inflation|sticky inflation)\b/i, 'up', 1, 'Rising inflation boosts gold as a store of value'],
  [/\b(inflation (cools?|eases?|slows?|falls?)|disinflation)\b/i, 'down', 1, 'Cooling inflation reduces the need for gold'],
  [/\b(recession|crisis|crash|turmoil|sell-?off|bank (failure|collapse)|default|shutdown|debt ceiling)\b/i, 'up', 2, 'Economic stress drives safe-haven buying'],
  [/\b(central banks? (buy|bought|buying|add|purchases?)|record (central bank )?purchases|PBOC|reserves? (buying|purchases))\b/i, 'up', 1, 'Central banks buying gold supports the price'],
  [/\b(tariffs?|trade war|sanctions?)\b/i, 'up', 1, 'Trade tensions and sanctions add uncertainty'],
  [/\b(strong (jobs|payrolls|data)|jobs (beat|surge)|economy (booms|strong))\b/i, 'down', 1, 'Strong economy → fewer rate cuts → weaker gold'],
  [/\bgold\b.*\b(hits?|tops?|soars?|surges?|jumps?|rall(y|ies)|climbs?|rises?|gains?|up \d|higher|record|all-time high|rebounds?|recovers?)\b/i, 'up', 1, 'Momentum: gold is moving up'],
  [/\bgold\b.*\b(falls?|slips?|drops?|tumbles?|slides?|sinks?|plunges?|retreats?|dips?|eases?|loses?|lower|down( over)? \d|declines?|erases?|(one|1|multi)-(year|month|week) low|lowest|weak(er)? demand|fading demand)\b/i, 'down', 1, 'Momentum: gold is moving down'],
  [/\b(profit[- ]taking|risk[- ]on|stocks? (rally|surge|record))\b/i, 'down', 1, 'Investors moving from gold into riskier assets'],
];

function classify(title) {
  let up = 0, down = 0; const why = [];
  for (const [re, imp, w, reason] of RULES) {
    if (re.test(title)) { if (imp === 'up') up += w; else down += w; if (why.length < 1) why.push(reason); }
  }
  const impact = up > down ? 'up' : down > up ? 'down' : 'watch';
  return { impact, strength: Math.abs(up - down) || (up + down ? 1 : 0), why: why[0] || (/(fed|federal reserve|powell|ecb|inflation|cpi)/i.test(title) ? 'Central-bank & inflation news often moves gold' : '') };
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
        const relevant = /gold|bullion|fed|federal reserve|powell|rates?|inflation|dollar|treasur|yields?|war|ceasefire|tariff|central bank|recession/i.test(title);
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

// ---------- local time helpers ----------
function local(tz) {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: tz || 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const p = Object.fromEntries(f.formatToParts(new Date(now)).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour), min: Number(p.minute) };
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
      if (drop >= g.dropPct && now - (f.dropAt || 0) > 6 * 3600e3) { sends.push({ title: `🔥 Gold dropped ${drop.toFixed(1)}% today`, body: `${price.toFixed(2)} zł/g, down from ${hi24.toFixed(2)} in the last 24 hours.`, url: APP_URL + '#/gold', tag: 'gold-drop' }); f.dropAt = now; }
    }
  }
  if (g.news && news && news.items) {
    f.seen ||= [];
    f.newsDay ||= ''; if (f.newsDay !== L.date) { f.newsDay = L.date; f.newsCount = 0; }
    const fresh = news.items.filter((n) => n.gold && n.impact !== 'watch' && n.strength >= 2 && now - Date.parse(n.date) < 6 * 3600e3 && !f.seen.includes(n.id));
    if (fresh.length && (f.newsCount || 0) < 3 && L.hour >= 8 && L.hour < 23) {
      const n = fresh[0];
      sends.push({ title: n.impact === 'up' ? '🗞️ Hot gossip: gold may RISE ▲' : '🗞️ Hot gossip: gold may FALL ▼', body: `${n.title}\n${n.why}. Stay alert 👀`, url: APP_URL + '#/news', tag: 'news' });
      f.newsCount = (f.newsCount || 0) + 1;
    }
    for (const n of fresh) f.seen.push(n.id);
    f.seen = f.seen.slice(-200);
  }
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

fs.mkdirSync(STATE.split('/').slice(0, -1).join('/') || '.', { recursive: true });
fs.writeFileSync(STATE, JSON.stringify(state));
log('done');
