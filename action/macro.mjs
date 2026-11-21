// Slow-changing public data the browser can't fetch itself (no CORS), written to docs/macro.json
// every 6 hours: NBP interest rates, US earnings calendar (big companies), latest insider
// purchases (SEC Form 4 via OpenInsider) and superinvestor 13F moves (Dataroma).
// Public market data only; nothing about the user.
import fs from 'node:fs';

const UA = { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130 Safari/537.36', Accept: 'application/json, text/html' };
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), 'macro', ...a);
const txt = (h) => h.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();

async function nbp() {
  const x = await (await fetch('https://static.nbp.pl/dane/stopy/stopy_procentowe.xml', { headers: { 'User-Agent': UA['User-Agent'] } })).text();
  const get = (id) => { const m = new RegExp(`id="${id}"[^>]*?oprocentowanie="([\\d,]+)"[^>]*?obowiazuje_od="([\\d-]+)"`, 's').exec(x); return m ? { v: +m[1].replace(',', '.'), since: m[2] } : null; };
  const ref = get('ref'), lom = get('lom'), dep = get('dep');
  return ref ? { ref: ref.v, since: ref.since, lombard: lom && lom.v, deposit: dep && dep.v } : null;
}

async function earnings() {
  const out = [];
  const d = new Date();
  for (let i = 0; i < 14 && out.length < 400; i++) {
    const day = new Date(d.getTime() + i * 864e5); const wd = day.getUTCDay(); if (wd === 0 || wd === 6) continue;
    const iso = day.toISOString().slice(0, 10);
    try {
      const j = await (await fetch(`https://api.nasdaq.com/api/calendar/earnings?date=${iso}`, { headers: UA })).json();
      for (const r of (j.data && j.data.rows) || []) {
        const cap = +String(r.marketCap || '').replace(/[$,]/g, '') || 0;
        if (cap < 10e9) continue;
        out.push({ d: iso, sym: r.symbol, name: r.name, cap, time: r.time === 'time-pre-market' ? 'before open' : r.time === 'time-after-hours' ? 'after close' : '', eps: r.epsForecast || null, lastEps: r.lastYearEPS || null, n: r.noOfEsts || null });
      }
    } catch (e) { log('earnings', iso, e.message); }
  }
  return out;
}

async function insiders() {
  const h = await (await fetch('http://openinsider.com/latest-insider-purchases-25k', { headers: UA })).text();
  const body = h.slice(h.lastIndexOf('<tbody>'), h.lastIndexOf('</tbody>'));
  const rows = [];
  for (const tr of body.split('<tr').slice(1)) {
    const cells = tr.split('<td').slice(1);
    const td = cells.map((c) => txt('<td' + c.replace(/onmouseover="[^"]*"/g, '')));
    const tk = /<a href="\/([A-Z][A-Z.\-]*)"/.exec(cells[3] || '');
    if (td.length < 13) continue;
    const [, filed, traded, ticker, company, who, title, type, price, qty, , , value] = td;
    if (!/^P/.test(type)) continue;
    rows.push({ filed: filed.slice(0, 10), traded, sym: tk ? tk[1] : ticker.replace(/[^A-Z.]/g, ''), company, who, title, price: +price.replace(/[$,]/g, '') || null, qty: +qty.replace(/[+,]/g, '') || null, value: +value.replace(/[+$,]/g, '') || null });
    if (rows.length >= 80) break;
  }
  // per ticker summary for the advisor
  const by = {};
  for (const r of rows) { const b = (by[r.sym] ||= { net: 0, n: 0 }); b.net += r.value || 0; b.n++; }
  for (const [k, b] of Object.entries(by)) b.text = `${b.n} insider purchase${b.n > 1 ? 's' : ''} worth $${Math.round(b.net).toLocaleString('en-US')} in recent SEC filings`;
  return { rows, by };
}

async function superinvestors() {
  const h = await (await fetch('https://www.dataroma.com/m/allact.php?typ=b', { headers: UA })).text();
  const i = h.indexOf('<table id="grid"'); if (i < 0) return [];
  const tb = h.slice(i, h.indexOf('</table>', i));
  const out = [];
  for (const tr of tb.split('<tr>').slice(2)) {
    const firm = txt((/<td class="firm">([\s\S]*?)<\/td>/.exec(tr) || [])[1] || '');
    const period = txt((/<td class="period">([\s\S]*?)<\/td>/.exec(tr) || [])[1] || '');
    const moves = [...tr.matchAll(/<a class="(buy|sell)"[^>]*>([^<]+)<\/a>\s*<div>([\s\S]*?)<\/div>/g)].map((m) => { const parts = m[3].split(/<br\s*\/?>/).map(txt); return { side: m[1], sym: m[2].trim(), name: parts[0], act: parts[1], weight: parts[2] }; });
    if (firm) out.push({ firm, period, moves: moves.slice(0, 6) });
    if (out.length >= 40) break;
  }
  return out;
}

export async function refreshMacro(file, now = Date.now()) {
  let old = {}; try { old = JSON.parse(fs.readFileSync(file, 'utf8')); } catch {}
  if (old.at && now - old.at < 6 * 3600e3 && !process.env.FORCE_MACRO) return false;
  const res = { at: now, updated: new Date(now).toISOString() };
  const tasks = { nbp, earnings, insiders, superinvestors };
  for (const [k, f] of Object.entries(tasks)) {
    try { res[k] = await f(); log(k, 'ok'); } catch (e) { log(k, 'failed', e.message); res[k] = old[k] || null; }
  }
  if (res.insiders) { res.insiderBy = res.insiders.by; res.insiders = res.insiders.rows; }
  fs.writeFileSync(file, JSON.stringify(res));
  return true;
}

if (process.argv[1] && process.argv[1].endsWith('macro.mjs')) {
  process.env.FORCE_MACRO = '1';
  await refreshMacro(process.argv[2] || '../docs/macro.json');
}
