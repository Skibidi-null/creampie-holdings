// Click-through test of the web app at iPhone size (390x844, touch). Sample data only.
// Usage: serve docs/ (python3 -m http.server PORT --directory docs), then
//   node tools/e2e.mjs http://localhost:PORT/ outDir [seed.json]
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
const [base, out, seed] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.emulate({ viewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1' });
const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('dialog', (d) => d.accept());
const R = []; const check = (n, ok, x = '') => R.push(`${ok ? 'PASS' : 'FAIL'} ${n} ${x}`);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const text = () => p.evaluate(() => document.body.innerText);
const click = (t, sel = 'button') => p.evaluate((t, sel) => { const a = [...document.querySelectorAll(sel)]; const el = a.find((x) => x.innerText.trim() === t) || a.find((x) => x.innerText.trim().includes(t)); if (el) { el.click(); return true; } return false; }, t, sel);
const input = (i, v, scope = '') => p.evaluate((i, v, scope) => { const el = document.querySelectorAll(scope + ' input')[i]; if (!el) return false; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); return true; }, i, v, scope);
const go = async (h, ms = 2500) => { await p.evaluate((h) => { location.hash = h; }, h); await wait(ms); };

await p.goto(base + 'manifest.webmanifest');
await p.evaluate((d) => { localStorage.clear(); if (d) localStorage.setItem('cp.data.v1', d); }, seed ? fs.readFileSync(seed, 'utf8') : null);
await p.goto(base + 'index.html#/home'); await wait(6000);

// every route renders without crashing
const ROUTES = ['home', 'markets', 'wealth', 'more', 'advisor', 'world/now', 'world/brief', 'world/cal', 'world/banks', 'world/links', 'world/funds', 'alerts', 'gold', 'news', 'asset/BTC-USD', 'asset/.SPX', 'asset/EURPLN%3D', 'portfolio', 'networth', 'benchmark', 'riskcheck', 'dividends', 'tax', 'freedom', 'dca', 'whatif', 'journal', 'fees', 'practice', 'guard', 'screener', 'earnings', 'insiders', 'backtest', 'settings', 'backup', 'health', 'budget', 'activity', 'accounts', 'card', 'bills', 'goals', 'friends', 'history', 'summary', 'zakat', 'convert', 'setup', 'broker'];
for (const r of ROUTES) {
  const before = errs.length; await go('#/' + r, 2200);
  const t = await text();
  check('route ' + r, errs.length === before && t.length > 40 && !/undefined|NaN|\[object Object\]/.test(t), errs.length > before ? errs.at(-1) : (/undefined|NaN|\[object Object\]/.exec(t) || [''])[0]);
}
// orb menu -> add expense
await go('#/home', 1500);
await p.evaluate(() => document.querySelector('.orb').click()); await wait(600);
check('orb menu opens', (await text()).includes('Add expense'));
await click('Add expense'); await wait(900);
await input(0, '42,50', '.sheet'); await p.evaluate(() => document.querySelector('.sheet .cat') && document.querySelector('.sheet .cat').click()); await wait(300);
const saved = await p.evaluate(() => { const b = [...document.querySelectorAll('.sheet button')].find((x) => /^(Save|Add)/.test(x.innerText.trim())); if (b) { b.click(); return b.innerText; } return null; });
await wait(1200);
check('expense added', !!saved && (await p.evaluate(() => JSON.parse(localStorage.getItem('cp.data.v1') || '{}').txns?.some((t) => t.amt === 42.5) || false)) , saved || '');
// currency switch converts the net worth
await go('#/home', 2000);
const pln = await p.evaluate(() => document.querySelector('.nw-big').innerText);
await click('USD'); await wait(1500);
const usd = await p.evaluate(() => document.querySelector('.nw-big').innerText);
check('currency switch', pln !== usd && /USD/.test(usd), `${pln.replace(/\n/g, ' ')} -> ${usd.replace(/\n/g, ' ')}`);
await click('PLN'); await wait(500);
// privacy
await p.evaluate(() => document.querySelector('[aria-label="Hide amounts"]').click()); await wait(500);
check('privacy hides amounts', (await text()).includes('••'));
await p.evaluate(() => document.querySelector('[aria-label="Hide amounts"]').click()); await wait(300);
// alerts: add via sheet
await go('#/alerts/new', 2500);
await click('Bitcoin'); await wait(1500);
await input(1, '250000', '.sheet'); await wait(300);
await click('Set alert'); await wait(1200);
check('alert added', (await text()).includes('Price goes above'));
// ladder
await click('Price ladder'); await wait(1200);
await click('Bitcoin'); await wait(2000);
const lad = await p.evaluate(() => { const bs = [...document.querySelectorAll('.ladder button:not(.cur)')]; bs[0]?.click(); bs.at(-1)?.click(); return bs.length; });
await wait(400); await click('Set 2 alerts'); await wait(1000);
check('ladder sets 2 alerts', lad >= 10 && (await p.evaluate(() => JSON.parse(localStorage.getItem('cp.data.v1')).alerts.length)) >= 3);
// chart modes and indicators on an asset
await go('#/asset/BTC-USD', 9000);
for (const m of ['Line', 'Candles', 'Heikin', 'Liquidity', 'Heatmap', 'Area']) { await click(m); await wait(m === 'Liquidity' || m === 'Heatmap' ? 5000 : 1500); if (m === 'Liquidity') await p.screenshot({ path: `${out}/chart_liquidity.png` }); }
check('chart modes switch without errors', errs.length === 0);
for (const ind of ['+ MA50', '+ RSI', '+ MACD', '+ Bollinger']) { await click(ind); await wait(900); }
await p.screenshot({ path: `${out}/chart_indicators.png` });
check('indicators add panes', (await p.evaluate(() => document.querySelector('.lwc').offsetHeight)) > 400);
// drawing a horizontal line
await click('+ Line'); await wait(300);
const box = await p.evaluate(() => { const r = document.querySelector('.lwc').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + 120 }; });
await p.mouse.click(box.x, box.y); await wait(800);
check('drawn line saved', await p.evaluate(() => (JSON.parse(localStorage.getItem('cp.data.v1')).chart['BTC-USD'] || {}).lines?.length === 1));
// pinch zoom with two touch points (Chrome DevTools protocol)
const cdp = await p.target().createCDPSession();
const r0 = await p.evaluate(() => { const r = document.querySelector('.lwc').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
const cy = r0.y + r0.h * 0.35;
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r0.x + r0.w * 0.45, y: cy, id: 1 }, { x: r0.x + r0.w * 0.55, y: cy, id: 2 }] });
for (let k = 1; k <= 8; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: r0.x + r0.w * (0.45 - k * 0.04), y: cy, id: 1 }, { x: r0.x + r0.w * (0.55 + k * 0.04), y: cy, id: 2 }] }); await wait(30); }
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await wait(600);
await p.screenshot({ path: `${out}/chart_pinched.png` });
check('pinch gesture handled', errs.length === 0);
// practice trade
await go('#/practice/BTC-USD', 6000);
await input(0, '1000', '.sheet'); await wait(300);
await click('Buy (practice)'); await wait(1200);
check('practice buy', (await text()).includes('Bitcoin') && (await p.evaluate(() => JSON.parse(localStorage.getItem('cp.data.v1')).paper.pos.length)) === 1);
// risk guard
await go('#/guard', 1500); await p.evaluate(() => [...document.querySelectorAll('.switch')][0].click()); await input(0, '200'); await wait(600);
check('risk guard saved', await p.evaluate(() => { const g = JSON.parse(localStorage.getItem('cp.data.v1')).guard; return g.on && g.dailyLoss === 200; }));
// encrypted backup round trip (in page)
await go('#/backup', 1500);
await input(0, 'correct horse 1'); await input(1, 'correct horse 1'); await wait(300);
check('backup button enabled with matching passwords', await p.evaluate(() => ![...document.querySelectorAll('button')].find((x) => x.innerText.includes('Save encrypted backup')).disabled));
// sounds toggle + settings currency per section
await go('#/settings', 1500);
await p.evaluate(() => { const s = [...document.querySelectorAll('select')][0]; s.value = 'EUR'; s.dispatchEvent(new Event('change', { bubbles: true })); }); await wait(500);
await go('#/budget', 1500);
check('section currency (budget in EUR)', (await text()).includes('€'));
await go('#/settings', 1000); await p.evaluate(() => { const s = [...document.querySelectorAll('select')][0]; s.value = ''; s.dispatchEvent(new Event('change', { bubbles: true })); }); await wait(300);
// desktop layout
await p.setViewport({ width: 1280, height: 860 }); await go('#/home', 2500);
check('desktop sidebar', await p.evaluate(() => getComputedStyle(document.querySelector('.side')).display !== 'none'));
await p.screenshot({ path: `${out}/desktop_home.png` });
console.log(R.join('\n'));
console.log('FAILS', R.filter((x) => x.startsWith('FAIL')).length, 'of', R.length);
console.log('PAGE ERRORS', JSON.stringify([...new Set(errs)]));
await b.close();
