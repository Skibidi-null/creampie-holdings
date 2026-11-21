// Usage: serve docs/ on a port, run tools/t212mock.mjs PORT2, then: node tools/t212test.mjs http://localhost:PORT/ http://localhost:PORT2 outDir
// End-to-end test of the Trading 212 screens against tools/t212mock.mjs (as the iPhone relay).
import puppeteer from 'puppeteer-core';
const [base, mock, out] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.emulate({ viewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1' });
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
p.on('dialog', (d) => d.accept());
const results = [];
const check = (name, ok, extra = '') => { results.push(`${ok ? 'PASS' : 'FAIL'} ${name} ${extra}`); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const text = () => p.evaluate(() => document.body.innerText);
const clickText = async (t, sel = 'button') => p.evaluate((t, sel) => { const all = [...document.querySelectorAll(sel)]; const el = all.find((x) => x.innerText.trim() === t) || all.find((x) => x.innerText.trim().includes(t)); if (el) { el.click(); return true; } return false; }, t, sel);
const setInput = async (idx, v, scope = '') => p.evaluate((idx, v, scope) => { const el = document.querySelectorAll(scope + ' input')[idx]; if (!el) return false; const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); }, idx, v, scope);
const go = async (h, ms = 3000) => { await p.evaluate((h) => { location.hash = h; }, h); await wait(ms); };

await p.goto(base + 'manifest.webmanifest');
await p.evaluate((mock) => { localStorage.clear(); localStorage.setItem('cp.t212', JSON.stringify({ env: 'demo', relay: mock })); }, mock);
await p.goto(base + 'index.html#/broker'); await wait(3000);
// 1. wrong key
await setInput(0, 'WRONG'); await setInput(1, 'BAD'); await clickText('Connect & test'); await wait(2500);
check('wrong key shows clear error', (await text()).includes('rejected the key'));
// 2. right key
await setInput(0, 'DEMOKEY'); await setInput(1, 'DEMOSECRET'); await clickText('Connect & test'); await wait(3000);
check('connect demo', (await text()).includes('Connected to account 1000001'));
await p.screenshot({ path: `${out}/t212_connect.png` });
// 3. practice badge
check('practice badge visible', (await text()).includes('T212 PRACTICE'));
// 4. live needs guard
await clickText('Real money'); await wait(800);
check('live blocked without risk guard', (await text()).includes('set a daily loss limit'));
await clickText('Practice'); await wait(500);
// 5. portfolio
await go('#/t212', 14000);
const pt = await text();
check('portfolio shows positions', pt.includes('Apple') && pt.includes('Vanguard S&P 500'));
check('portfolio shows pies', pt.includes('Pie #77'));
check('history loaded', /RECENT ORDERS[\s\S]*(BUY|SELL)/i.test(pt));
await p.screenshot({ path: `${out}/t212_portfolio.png`, fullPage: true });
// 6. buy AAPL market
await go('#/asset/AAPL', 9000);
check('buy button on tradable stock', await clickText('Buy'));
await wait(1200);
await setInput(0, '500', '.sheet'); await wait(400);
await p.screenshot({ path: `${out}/t212_trade_form.png` });
await clickText('Review order'); await wait(800);
const rv = await text();
check('review shows practice warning-free and total', rv.includes('Estimated total'));
await p.screenshot({ path: `${out}/t212_trade_review.png` });
await clickText('Place practice order'); await wait(3000);
check('market order sent', (await text()).includes('Order sent'));
await clickText('Done'); await wait(600);
// 7. limit order then cancel
await go('#/asset/NVDA', 8000);
await clickText('Buy'); await wait(1000);
await clickText('Limit'); await wait(300);
await setInput(0, '100', '.sheet'); await setInput(1, '300', '.sheet'); await wait(300);
await clickText('Review order'); await wait(600); await clickText('Place practice order'); await wait(3000);
check('limit order sent', (await text()).includes('Order sent'));
await clickText('Done'); await wait(500);
await go('#/t212', 14000);
check('open order listed', /open orders/i.test(await text()));
await clickText('Cancel'); await wait(6000);
check('order cancelled', !/open orders/i.test(await text()));
// 8. sell more than held is blocked in the form
await go('#/asset/AAPL', 8000);
await clickText('Sell'); await wait(1000); await clickText('In shares'); await wait(300);
await setInput(0, '999', '.sheet'); await wait(400);
check('oversell blocked', (await text()).includes('shares available to sell'));
await p.keyboard.press('Escape'); await go('#/home', 1000);
// 9. missing scope
await p.evaluate((mock) => { localStorage.setItem('cp.t212', JSON.stringify({ env: 'demo', relay: mock, demo: { key: 'NOSCOPE', secret: 'x', ok: true } })); }, mock);
await p.goto(base + 'index.html#/asset/AAPL'); await p.reload(); await wait(9000);
await clickText('Buy'); await wait(1000); await setInput(0, '100', '.sheet'); await clickText('Review order'); await wait(600); await clickText('Place practice order'); await wait(3000);
check('missing scope explained', (await text()).includes('orders:execute'));
await p.screenshot({ path: `${out}/t212_scope_error.png` });
// 10. fees + tax read paginated history
await p.evaluate((mock) => { localStorage.setItem('cp.t212', JSON.stringify({ env: 'demo', relay: mock, demo: { key: 'DEMOKEY', secret: 'DEMOSECRET', ok: true } })); }, mock);
await p.goto(base + 'index.html#/fees'); await p.reload(); await wait(12000);
check('fees from paginated history', /filled orders/.test(await text()), (await text()).match(/\d+ of \d+ filled orders/)?.[0] || '');
await p.screenshot({ path: `${out}/t212_fees.png` });
console.log(results.join('\n'));
console.log('PAGE ERRORS', JSON.stringify(errs));
await b.close();
