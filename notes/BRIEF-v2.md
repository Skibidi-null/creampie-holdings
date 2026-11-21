# Creampie Holdings v2.0: build brief (21 Nov 2026)

The user's goal: "a personal investment, tracking and daily management app that will make me rich. MAIN MOTIVE: keep an eye on the GLOBAL MARKET." Build it like your own personal financial advisor and bot. Very tech, high-end banking/trading app. "Do the best design you can."

## Design: HOLO (chosen by the user)
Mockups to match and beat (inline-styled HTML, open in a browser): notes/mockups/Holo-Home.dc.html, Holo-Signal.dc.html, Holo-Depth.dc.html, Holo-Alerts.dc.html, Holo-Widgets.dc.html, Icons.dc.html. Online: https://claude.ai/artifact/AnbQX9TiQTsedoBwtrJBK8 (rows 2 and 3).
- Near-black #040407 with large soft glows (magenta #FF3CC8, cyan #00D2FF, violet #7A5CFF), faint grid, glass panels (gradient white 7% to 2%, 1px white 10% borders), iridescent gradient edges (magenta, violet, cyan, mint #3CFFB4, gold #FFE36E).
- Fonts: Space Grotesk (UI) + JetBrains Mono (all numbers, labels), self-hosted (OFL).
- Net worth HOLO CARD: iridescent 1px edge, conic holographic glow, animated light sweep. The user LOVES the light sweep: make it better, e.g. the shine follows phone tilt (DeviceOrientation; iOS needs a permission tap, fall back to the timed sweep), subtle and smooth.
- The center "+" / advisor orb button in the bottom bar with conic holographic ring: the user likes it; animate it (slow rotating ring, press ripple).
- Up = mint #3CFFB4, down = pink-red #FF5C8A. Signal gauge = 270-degree arc, gold to mint gradient.
- Animations everywhere they help (count-up numbers, card entrance, gauge fill, live pulse), but smooth on an old Android phone (Note 8). Respect prefers-reduced-motion.
- SOUND EFFECTS (short, tasteful, synthesised with WebAudio or tiny bundled files): buy confirmed, sell confirmed, alert set, alert triggered, error. Mute toggle in Settings.
- New app icon: option 1 "Holo C + candle" (Icons.dc.html) for PWA icons, Android launcher (adaptive icon) and splash. Keep the name "Creampie Holdings" but NO sexual wording, emoji or imagery anywhere (user rule).
- Plain English copy, no em or en dashes anywhere user-visible, never mention AI.

## Charts (critical)
- EVERY chart is interactive: pinch zoom, pan, crosshair with values, double-tap reset. Use TradingView Lightweight Charts (Apache-2.0, pin an exact version, self-host the file). Test pinch/pan in Android WebView and iPhone Safari sizes.
- Display modes switch: Line, Area, Candles, Heikin-Ashi, Liquidity, Heatmap.
  - Liquidity: volume profile (computed from candles, POC line) for all assets; for crypto also live order-book walls + depth chart (Coinbase Exchange public level2 book, CORS ok).
  - Heatmap: order-book heatmap over time for crypto (sample book every few seconds while open); for others a volume heatmap.
- Indicators: MA20/50/200, EMA, VWAP, Bollinger, RSI, MACD, ATR; drawing horizontal lines/trendlines; saved per asset.

## Advisor / signal engine (the heart)
For every watched asset (gold, crypto, stocks, ETFs, S&P 500, indices, FX) compute a 0-100 score => Strong sell / Sell / Hold / Buy / Strong buy, with confidence and EVERY reason shown (name, plain sentence, direction, weight bar). Factors (use what data exists per asset; mark missing ones as unavailable, never fake):
- Trend: price vs MA20/50/200, golden/death cross, higher highs/lows, multi-timeframe agreement (day/week/month)
- Momentum: RSI, MACD, rate of change, divergences
- Volatility/levels: Bollinger position, ATR, support/resistance, 52-week high/low distance, breakouts
- Volume: vs average, accumulation/distribution
- Macro: dollar index, US 10y and real yields, Fed expectations, inflation surprise, risk-on/off regime (VIX etc.). Existing code: web/src/market.js, outlook.js, signals.js.
- Sentiment: news tone (existing news.json), Fear and Greed (crypto: alternative.me API), extremes as contrarian
- Positioning: CFTC COT (weekly, free: publicreporting.cftc.gov Socrata API) for gold and futures-linked assets; crypto funding rate / open interest if a free CORS source exists
- Stock fundamentals where free: earnings dates and surprises, insider buying (SEC EDGAR Form 4), big funds (13F); valuation if available
- Seasonality, intermarket (gold vs dollar/yields, BTC vs Nasdaq), correlation
- BACKTEST each signal rule on history: hit rate and average move over the next 5/20/60 days, shown honestly (including bad results). Gold history since 2013 exists (NBP) and tools/playbook.mjs has stats since 1971.
- Trade plan: entry zone, stop (ATR based), target, risk/reward, position size from a risk % setting.
- Alerts when a score crosses into Buy/Sell, plus a daily "Today's call" on Home and a morning brief.
- Clear disclaimer line: a decision helper, not a guarantee.

## Alerts
Multiple alerts per asset at different prices: above, below, enters/leaves a range, % move over a period, advisor score change, volume spike. Draggable alert lines on the chart, a price ladder to set many levels at once, once/every time, sound + vibration choice. Delivered: Android native notifications (existing AlertWorker, WorkManager), iPhone Web Push via the existing GitHub Action (action/check.mjs) and in-app.

## Global market cockpit + features (user said "do all")
1 World markets map/grid with open/closed status; 2 Morning brief; 3 Risk-on/off meter; 4 Sector heat map; 5 Currency board (PLN, AED, INR, USD, EUR) with alerts; 6 "Why is it moving" news filtered to holdings; 7 Economic calendar (expected vs actual); 8 Net worth across T212, Robinhood, XTB (manual + CSV import), gold, cash, crypto, in PLN/AED/USD; 9 Benchmark vs S&P 500, gold, inflation; 10 Risk check + rebalancing; 11 Dividend calendar/passive income; 12 Polish tax estimate (19% Belka, PIT-38 helper); 13 Financial freedom number + projection; 14 DCA plan + payday reminder; 15 Buy-the-dip alerts; 16 Trade journal; 17 What-if calculator; 18 Practice (paper) trading with fake money; 19 Privacy mode (one tap hides amounts); 20 Widgets; 21 Bills/subscriptions + savings rate; 22 COT report; 23 Big investors (13F) + insider buying; 24 Central bank tracker (Fed, ECB, NBP, UAE); 25 Correlation map; 26 Strategy backtester; 27 Earnings calendar; 28 Screener; 29 Risk guard (daily loss limit locks trading for the day); 30 Session clock.
S&P 500: show the ways to get it with Trading 212 (S&P 500 ETFs such as VUAA/CSPX/VUSA, or the stocks) and trade them from the app.
NOT in scope (user skipped): real trading of forex/futures/options/CFDs. Those markets are WATCHED only.

## Widgets (Android only; iPhone web apps can't have widgets)
Beautiful HOLO widgets, all resizable and filling any size (more info when bigger): Net worth (sparkline), Signal gauge (choose asset), Watchlist, Risk on/off, Single ticker 1x1, Markets now (sessions), Budget this month, Next alert. Configure screens to pick assets. Test resizing on the S21 and Note 8 emulators.

## Platforms and delivery
- Web app in web/ (Preact + htm, esbuild via tools/build.sh into docs/, GitHub Pages https://skibidi-null.github.io/creampie-holdings/). iPhone uses it as a PWA (updates by itself). The Android app (android/, Kotlin WebView shell + native bridge CPNative, widgets, WorkManager alerts, biometric) loads the Pages URL, so UI updates automatically.
- Add an Android IN-APP UPDATER like Barakah's (~/Projects/barakah/app/src/main/java/com/barakah/app/update/Updater.kt + UpdateSheet): version.json + APK under docs/android/ on GitHub Pages; check on open (6h), download with progress, sha256 verify, install. Bump to versionName 2.0, versionCode 4. Keep the signing key (android/keystore).
- Keep user data: localStorage migration must keep everything (budget, gold, watchlist, alerts, T212 keys in 'cp.t212').
- Trading 212: keep and polish (Android native bridge; iPhone needs the relay, not deployed). Test against the existing mock; no real key available.

## Process
- Keep notes/STATUS.md updated as you go (done/partial/todo) so work survives interruptions (usage limits may stop you; you'll be resumed).
- Test: puppeteer-core + /usr/bin/chromium at 390x844 touch (0 console errors, fresh + seeded old data), Android emulators s21_api35 and note8_api28 (one at a time, ~15 GB RAM; kill emulators when done). Take screenshots of every main screen into notes/screens-v2/.
- Commit and push to GitHub when a solid, tested state is reached (the repo is public; never commit .secrets.json, keystore files or keys). Publish the APK + version.json under docs/android/ only after the Android build passes tests. Commit message attribution: end with "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>".

## Repo gotchas
- .gitignore has `*.apk`: add `!docs/android/*.apk` so the published APK is committed (only that folder).
- The GitHub Action commits "news update" every ~10 minutes: always `git pull --rebase` before `git push`.
- Backup of the state before v2: ~/Projects/backups/creampie-2026-11-21-before-v2.tgz

## User answers (21 Nov, later): follow these too
1. TEST EVERYTHING thoroughly: every screen, button and feature on the web (iPhone size) and both Android emulators before reporting done.
2. Trading 212 fully complete and robust: account, portfolio, positions, orders (market/limit/stop/stop-limit), cancel, history, pies if the API allows, instrument search incl. S&P 500 ETFs. BOTH Practice (demo) and Live keys with a clear switch, a "test connection" step and clear error messages. Test against a faithful mock of the official API (endpoints, auth, rate limits, error shapes).
3. App-wide currency switch (PLN default, plus AED, USD, EUR, INR, GBP) converting EVERY amount with live FX. Each section (budget, wealth, markets, gold) can override its own display currency.
4. Icon: NICE, UNIQUE, premium HOLO icon, not a simple candle (e.g. faceted holographic prism/gem, or a monogram from orbit lines with upward motion). 3 options as PNG renders in notes/screens-v2/icons/, best one used everywhere (PWA, Android adaptive icon, splash).
5. Repo is public: NO private info in the repo, its history going forward, docs/, news.json or committed screenshots (no personal amounts, names, emails, account numbers, keys, tokens). Use sample or empty data for committed screenshots/tests. Check before every push.

## More additions (coordinator, 21 Nov). Scope LOCKED for v2.0 after these
- Encrypted backups: export/import ALL data as a password-encrypted file (WebCrypto AES-GCM + PBKDF2), weekly reminder, auto-save on Android (Downloads/Documents via bridge), Share sheet/Files on iPhone. T212 keys excluded unless "include keys" ticked.
- App lock: biometric on Android (keep working with new design) + PIN on both; auto-lock after 60 s in background.
- Live trading safety: always-visible Practice/Live badge; Risk guard (daily loss limit) REQUIRED before Live can be enabled; confirmation sheet for every real order showing the amount in the user's chosen currency.
- Data health: status light per data source (CNBC, Coinbase, NBP, FX, news) in Settings and on charts; automatic fallbacks where possible; never show stale prices as live (show the age).
- Defaults until told: tax residency setting (Poland PIT-38/Belka 19% or "UAE: no personal tax"); watchlist defaults gold + Bitcoin + S&P 500 ETF + EUR/PLN; risk style setting careful/balanced/aggressive (default balanced) adjusting score thresholds, ATR stop multiple, position size.
- Advisor scorecard: log every advisor call (asset, time, score, verdict, price), evaluate at +5/+20/+60 days, show the real track record per asset and overall.
- Cooling-off timer: large buy (> set % of portfolio) while score is Hold/Sell, or right after a big spike, requires a 10-minute wait (configurable; skippable with deliberate confirm).
- Fee tracker: estimate T212 FX conversion fees (0.15% setting) and other fees per year from trade history, with suggestions (currency-matched ETFs).
- Emergency fund check: months of expenses covered by cash; advisor shows a gentle warning before investment suggestions if under 3 months.
- Sunday summary: weekly notification (Android native, iPhone push via Action) with portfolio change, market moves, advisor calls, next week's events.
- Quiet hours: no alerts in a chosen night window except alerts marked urgent.
