// Early-warning rules shared by the app (live, in-app) and the GitHub job (push to iPhone)
// and read by the Android background worker (via news.json). Pure functions, no browser APIs.

// CNBC quote symbols used everywhere
export const SYMS = {
  gold: '@GC.1', real: 'US10YTIP', dxy: '.DXY', y10: 'US10Y', y2: 'US2Y', vix: '.VIX', spx: '.SPX', oil: '@CL.1', silver: '@SI.1', usdpln: 'PLN=',
};
export const QUOTE_URL = (syms) => 'https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=' +
  encodeURIComponent(syms.join('|')) + '&requestMethod=itv&noform=1&partnerId=2&fund=1&exthrs=1&output=json';

const n = (s) => { if (s == null) return null; const v = parseFloat(String(s).replace(/[,%+]/g, '')); return Number.isFinite(v) ? v : null; };

// CNBC FormattedQuote → { last, chg, pct, prev, hi52, lo52, time, name }
export function parseQuotes(json) {
  const out = {};
  const list = (json && json.FormattedQuoteResult && json.FormattedQuoteResult.FormattedQuote) || [];
  for (const q of list) {
    if (q.code !== 0 && q.code !== '0') continue;
    const last = n(q.last); if (last == null) continue;
    const prev = n(q.previous_day_closing);
    const chg = n(q.change) ?? (prev != null ? last - prev : null);
    let pct = n(q.change_pct);
    if (pct == null && prev) pct = ((last - prev) / prev) * 100;
    const t = q.last_time ? Date.parse(q.last_time.length === 10 ? q.last_time + 'T21:00:00-05:00' : q.last_time.replace(/([+-]\d\d)(\d\d)$/, '$1:$2')) : null;
    out[q.symbol] = { last, chg, pct, prev, hi52: n(q.yrhiprice), lo52: n(q.yrloprice), time: Number.isFinite(t) ? t : null, name: q.name, open: q.curmktstatus === 'REG_MKT' };
  }
  return out;
}

const dayOf = (t) => new Date(t || Date.now()).toISOString().slice(0, 10);
const fmt = (v, d = 2) => (v >= 0 ? '+' : '') + v.toFixed(d);

// What usually happens to gold around each kind of scheduled US release.
export function eventPlaybook(title) {
  const t = title.toLowerCase();
  if (/minutes/.test(t)) return 'Notes from the last Fed meeting. Hints of more hikes usually weigh on gold; hints of cuts help it.';
  if (/fomc|federal funds|rate decision|monetary policy statement/.test(t)) return 'Fed rate decision. A cut or a softer tone usually lifts gold; a hike or "rates stay high" usually pushes it down. The big move often comes within the first hour.';
  if (/core pce|pce price/.test(t)) return 'The Fed\'s favourite inflation number. Hotter than expected → bond yields and the dollar rise → gold usually dips that day. Cooler → gold usually rises.';
  if (/cpi/.test(t)) return 'US inflation. Hotter than expected → markets expect higher rates → gold usually falls that day. Cooler than expected → gold usually jumps.';
  if (/ppi/.test(t)) return 'Factory-gate inflation. Hot → slightly bad for gold short-term, cool → slightly good.';
  if (/non-farm|nonfarm|payroll/.test(t)) return 'US jobs report. Strong jobs → fewer rate cuts → gold usually falls. Weak jobs → gold usually rises. Often the biggest gold move of the month.';
  if (/unemployment rate/.test(t)) return 'Higher unemployment → more chance of rate cuts → good for gold.';
  if (/unemployment claims|jobless/.test(t)) return 'Weekly job losses. More claims than expected → slightly good for gold.';
  if (/gdp/.test(t)) return 'Economic growth. Strong → less need for rate cuts → mildly bad for gold. Weak → mildly good.';
  if (/retail sales/.test(t)) return 'Shopping data. Strong → mildly bad for gold, weak → mildly good.';
  if (/ism|pmi/.test(t)) return 'Business survey. Strong → mildly bad for gold, weak → mildly good.';
  if (/(warsh|powell|fed chair|fed governor|speaks)/.test(t)) return 'Fed speech. Talk of higher rates → gold down; talk of cuts → gold up.';
  if (/ecb|main refinancing/.test(t)) return 'European rate decision. Affects the dollar: an ECB cut can lift the dollar a bit, which weighs on gold.';
  return 'Scheduled release. Surprises vs the forecast can move gold quickly.';
}

/**
 * Early warnings from live quotes and the event calendar.
 * q: parseQuotes() result; cal: [{title,country,date,impact,forecast,previous}]; now: ms
 * returns [{ id, level: 'high'|'med', dir: 'up'|'down'|'watch', title, body }]
 */
export function computeSignals(q, cal = [], now = Date.now()) {
  const out = [];
  const fresh = (x) => x && x.time && now - x.time < 20 * 3600e3;
  const add = (id, level, dir, title, body, x) => out.push({ id: `${id}-${dayOf(x && x.time ? x.time : now)}`, level, dir, title, body });

  const r = q[SYMS.real];
  if (fresh(r) && r.chg != null && Math.abs(r.chg) >= 0.08) {
    const up = r.chg > 0;
    add(up ? 'real-up' : 'real-down', Math.abs(r.chg) >= 0.15 ? 'high' : 'med', up ? 'down' : 'up',
      up ? 'Real interest rates jumped' : 'Real interest rates fell',
      `US 10-year real yield ${fmt(r.chg)} points today (now ${r.last.toFixed(2)}%). ${up ? 'Bonds paying more after inflation is the biggest weight on gold.' : 'Cheaper money is the strongest support for gold.'}`, r);
  }
  const d = q[SYMS.dxy];
  if (fresh(d) && d.pct != null && Math.abs(d.pct) >= 0.6) {
    const up = d.pct > 0;
    add(up ? 'usd-up' : 'usd-down', Math.abs(d.pct) >= 1 ? 'high' : 'med', up ? 'down' : 'up',
      up ? 'Dollar is surging' : 'Dollar is sliding',
      `Dollar index ${fmt(d.pct)}% today. ${up ? 'Since 1971, gold fell in 3 of 4 months when the dollar rose over 1%.' : 'Since 1971, gold rose in 3 of 4 months when the dollar fell over 1%.'}`, d);
  }
  const y2 = q[SYMS.y2];
  if (fresh(y2) && y2.chg != null && Math.abs(y2.chg) >= 0.1) {
    const up = y2.chg > 0;
    add(up ? 'y2-up' : 'y2-down', Math.abs(y2.chg) >= 0.2 ? 'high' : 'med', up ? 'down' : 'up',
      up ? 'Markets now expect higher Fed rates' : 'Markets now expect Fed rate cuts',
      `US 2-year yield ${fmt(y2.chg)} points today (${y2.last.toFixed(2)}%). This yield follows what traders expect the Fed to do next.`, y2);
  }
  const v = q[SYMS.vix];
  if (fresh(v)) {
    if (v.last >= 30) add('vix-high', 'high', 'watch', 'Fear is very high on markets',
      `VIX fear index at ${v.last.toFixed(1)}. In panics (2008, March 2020) traders first SELL gold to cover stock losses, so gold can drop for days. Afterwards gold usually recovered and rose.`, v);
    else if (v.pct != null && v.pct >= 20) add('vix-jump', 'med', 'watch', 'Fear is rising fast',
      `VIX fear index ${fmt(v.pct, 0)}% today (${v.last.toFixed(1)}). Rising fear usually helps gold, but a real panic can cause short selling of gold first.`, v);
  }
  const s = q[SYMS.spx];
  if (fresh(s) && s.pct != null && s.pct <= -2) {
    add('spx-drop', s.pct <= -3.5 ? 'high' : 'med', 'watch', `Stocks fell ${Math.abs(s.pct).toFixed(1)}% today`,
      'Big stock losses can force traders to sell gold to raise cash (margin calls), so gold may dip short-term. Over the next 6 months after bad stock months, gold rose about 2 times in 3.', s);
  }
  const g = q[SYMS.gold];
  if (fresh(g) && g.pct != null && Math.abs(g.pct) >= 2) {
    const up = g.pct > 0;
    add(up ? 'gold-jump' : 'gold-drop', Math.abs(g.pct) >= 3.5 ? 'high' : 'med', up ? 'up' : 'down',
      up ? `Gold is up ${g.pct.toFixed(1)}% today` : `Gold is down ${Math.abs(g.pct).toFixed(1)}% today`,
      up ? 'A very big daily move. Chasing after big jumps is risky; prices often pause or pull back.' : 'A very big daily drop. Check the drivers screen for the reason before buying the dip.', g);
  }
  const pln = q[SYMS.usdpln];
  if (fresh(pln) && pln.pct != null && Math.abs(pln.pct) >= 1) {
    const up = pln.pct > 0;
    add(up ? 'pln-weak' : 'pln-strong', 'med', up ? 'up' : 'down', up ? 'Złoty weakening vs the dollar' : 'Złoty strengthening vs the dollar',
      `USD/PLN ${fmt(pln.pct)}% today (${pln.last.toFixed(4)}). ${up ? 'Gold in zł gets more expensive even if world gold is flat.' : 'Gold in zł gets cheaper even if world gold is flat.'}`, pln);
  }
  const o = q[SYMS.oil];
  if (fresh(o) && o.pct != null && Math.abs(o.pct) >= 5) {
    const up = o.pct > 0;
    add(up ? 'oil-up' : 'oil-down', 'med', up ? 'up' : 'watch', up ? `Oil jumped ${o.pct.toFixed(1)}%` : `Oil fell ${Math.abs(o.pct).toFixed(1)}%`,
      up ? 'Oil spikes raise inflation fears and often come with conflict, both supportive for gold.' : 'Falling oil cools inflation fears, a small negative for gold.', o);
  }

  // big scheduled releases in the next 24 hours
  for (const e of cal) {
    if (e.impact !== 'High' || e.country !== 'USD') continue;
    const t = Date.parse(e.date); const h = (t - now) / 3600e3;
    if (h > 0 && h <= 24) {
      out.push({ id: `ev-${e.title.replace(/\W+/g, '').slice(0, 24)}-${dayOf(t)}`, level: h <= 3 ? 'high' : 'med', dir: 'watch', when: t,
        title: `${h <= 1 ? 'Within the hour' : h < 3 ? 'Soon' : 'Coming up'}: ${e.title}`,
        body: `${e.forecast ? `Forecast ${e.forecast}${e.previous ? `, previous ${e.previous}` : ''}. ` : ''}${eventPlaybook(e.title)}` });
    }
  }
  const rank = { high: 0, med: 1 };
  return out.sort((a, b) => rank[a.level] - rank[b.level]);
}
