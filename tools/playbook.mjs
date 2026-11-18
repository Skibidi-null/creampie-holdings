// Builds web/src/playbook.json: what gold did, historically (Aug 1971 → latest month),
// after each kind of event. Run: node tools/playbook.mjs
// Data (tools/data): gold monthly (datasets/gold-prices), S&P 500 (datasets/s-and-p-500, Shiller),
// Fed funds + 10y yield (Federal Reserve H.15), CPI (BLS), dollar index (Fed H.10) via DBnomics.
import fs from 'node:fs';
const D = new URL('./data/', import.meta.url);
const rd = (f) => fs.readFileSync(new URL(f, D), 'utf8');
const ym = (s) => s.slice(0, 7);

const csv = (f, col) => { const m = new Map(); for (const l of rd(f).trim().split('\n').slice(1)) { const c = l.split(','); const v = +c[col]; if (v > 0) m.set(ym(c[0]), v); } return m; };
const dbn = (f) => { const d = JSON.parse(rd(f)).series.docs[0]; const m = new Map(); d.period.forEach((p, i) => { const v = d.value[i]; if (typeof v === 'number') m.set(ym(p), v); }); return m; };

const gold = csv('gold_m.csv', 1);
const spx = csv('spx_m.csv', 1);
const ff = dbn('ff_m.json');
const y10 = dbn('y10_m.json');
const cpi = dbn('cpi_m.json');
for (const x of JSON.parse(rd('cpi_recent.json')).Results.series[0].data) if (/^M\d\d$/.test(x.period) && x.period !== 'M13') cpi.set(`${x.year}-${x.period.slice(1)}`, +x.value);
// dollar: major-currencies index to 2005, then chain the broad index's monthly changes
const maj = dbn('usdmaj_m.json'), broad = dbn('usdbroad_m.json');
const usd = new Map();
for (const [k, v] of maj) if (k < '2006-01') usd.set(k, v);
let last = usd.get('2005-12'), prevB = null;
for (const [k, v] of [...broad].sort()) { if (prevB != null) last *= v / prevB; usd.set(k, last); prevB = v; }

// months from Aug 1971 (end of the gold standard) → last gold month
const months = [...gold.keys()].filter((k) => k >= '1971-08').sort();
const idx = new Map(months.map((m, i) => [m, i]));
const at = (m, k) => months[idx.get(m) + k];
// gold return from month m to month m+k
const ret = (m, k) => { const a = gold.get(m), b = gold.get(at(m, k)); return a && b ? (b / a - 1) * 100 : null; };
const chg = (map, m, k) => { const a = map.get(at(m, -k)), b = map.get(m); return a != null && b != null ? b - a : null; };
const pchg = (map, m, k) => { const a = map.get(at(m, -k)), b = map.get(m); return a && b ? (b / a - 1) * 100 : null; };
const infl = (m) => pchg(cpi, m, 12);
const r1 = (x) => (x == null ? null : +x.toFixed(1));

function summary(list, horizons = [1, 3, 6, 12]) {
  const out = { n: list.length };
  for (const h of horizons) {
    const xs = list.map((m) => ret(m, h)).filter((x) => x != null).sort((a, b) => a - b);
    if (!xs.length) continue;
    out['h' + h] = { avg: r1(xs.reduce((s, x) => s + x, 0) / xs.length), med: r1(xs[Math.floor(xs.length / 2)]), up: Math.round((xs.filter((x) => x > 0).length / xs.length) * 100), n: xs.length };
  }
  return out;
}
// gold's move in the same month as a condition
function same(cond) {
  const xs = months.slice(1).filter(cond).map((m) => ret(at(m, -1), 1)).filter((x) => x != null);
  return { n: xs.length, avg: +(xs.reduce((s, x) => s + x, 0) / xs.length).toFixed(2), up: Math.round((xs.filter((x) => x > 0).length / xs.length) * 100) };
}

// Fed policy direction from the 3-month change in the Fed funds rate
const dir = (m) => { const c = chg(ff, m, 3); return c == null ? 0 : c >= 0.25 ? 1 : c <= -0.25 ? -1 : 0; };
function starts(d) { // first month of a new cycle (no move that way in the previous 12 months)
  const out = []; let lastSeen = -99;
  months.forEach((m, i) => { if (dir(m) === d) { if (i - lastSeen > 12) out.push(m); lastSeen = i; } });
  return out;
}
const firstCut = starts(-1), firstHike = starts(1);

const real = new Map(months.map((m) => [m, y10.get(m) != null && infl(m) != null ? y10.get(m) - infl(m) : null]));
const usd3 = (m) => pchg(usd, m, 3);
const spxRet = (m) => pchg(spx, m, 1);

const crash = months.filter((m) => spxRet(m) != null && spxRet(m) <= -7).map((m) => ({ m, spx: r1(spxRet(m)), gold: r1(ret(at(m, -1), 1)), next3: r1(ret(m, 3)), next12: r1(ret(m, 12)) }));
const bears = []; { let peak = null; for (const m of months) { const v = spx.get(m); if (!v) continue; if (!peak || v > peak.v) peak = { m, v }; else if (1 - v / peak.v >= 0.2 && !bears.find((b) => b.peak === peak.m)) bears.push({ peak: peak.m, hit20: m, gold: r1((gold.get(m) / gold.get(peak.m) - 1) * 100), next12: r1(ret(m, 12)) }); } }

const gStart = gold.get(months[0]), gEnd = gold.get(months.at(-1)), yrs = (months.length - 1) / 12;
const out = {
  built: new Date().toISOString().slice(0, 10), from: months[0], to: months.at(-1), years: Math.round(yrs),
  start: gStart, end: gEnd, cagr: r1((Math.pow(gEnd / gStart, 1 / yrs) - 1) * 100),
  base: summary(months),
  fed: {
    hiking: summary(months.filter((m) => dir(m) === 1)), cutting: summary(months.filter((m) => dir(m) === -1)), holding: summary(months.filter((m) => dir(m) === 0)),
    firstCut: { ...summary(firstCut), when: firstCut }, firstHike: { ...summary(firstHike), when: firstHike },
  },
  real: {
    rising: summary(months.filter((m) => (chg(real, m, 3) ?? 0) >= 1)), falling: summary(months.filter((m) => (chg(real, m, 3) ?? 0) <= -1)),
    negative: summary(months.filter((m) => real.get(m) != null && real.get(m) < 0)), high: summary(months.filter((m) => real.get(m) != null && real.get(m) > 2)),
  },
  usd: {
    rising: summary(months.filter((m) => (usd3(m) ?? 0) >= 4)), falling: summary(months.filter((m) => (usd3(m) ?? 0) <= -4)),
    sameUp: same((m) => (pchg(usd, m, 1) ?? 0) > 1), sameDown: same((m) => (pchg(usd, m, 1) ?? 0) < -1),
  },
  infl: {
    hot: summary(months.filter((m) => (infl(m) ?? 0) >= 5)), low: summary(months.filter((m) => infl(m) != null && infl(m) < 2)),
    rising: summary(months.filter((m) => { const a = infl(at(m, -6)), b = infl(m); return a != null && b != null && b - a >= 1; })),
  },
  stocks: { bad: { ...summary(months.filter((m) => (spxRet(m) ?? 0) <= -4)), same: same((m) => (spxRet(m) ?? 0) <= -4) }, crash, bears },
};
fs.writeFileSync(new URL('../web/src/playbook.json', import.meta.url), JSON.stringify(out));
console.log(JSON.stringify(out, null, 1));
