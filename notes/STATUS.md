# Creampie Holdings: where we are (18 Nov 2026)

## Done
1. **Gold:** tabs Today / Drivers / Events / History / Learn.
   - Live factors that move gold: rates, dollar, Fed, inflation, fear and stocks, oil, news, trend, central banks, złoty.
   - Gold outlook with a likely price range.
   - Early warnings in the app, plus notifications on iPhone and Android.
   - Event calendar, history since 1971, plain guide.
2. **Markets tab:** stocks and crypto watchlist with live prices, search, charts, signals and price alerts.
3. **Trading 212:** connect screen, portfolio, buy/sell (market, limit, stop), cancel orders.
   - Android talks to Trading 212 directly.
   - Tested only against a fake (simulated) account so far, never a real key.
4. **Design:** cleaner look with line icons. The dock is now Home, Gold, +, Markets, Wealth.
5. **Android app:** v1.2 is installed. The APK was removed from GitHub and is saved at `CreampieHoldings.apk` in this folder.
6. All code is pushed to GitHub, and the iPhone app updates by itself (close and reopen twice).

## To do next
1. **Test Trading 212 on Android in Practice mode.**
   - In Trading 212 (Practice): Settings → API (Beta) → Generate key.
   - Permissions: Account, Portfolio, Orders (read + execute), Metadata, History. IP restriction OFF.
   - In Creampie: Markets → gear button → Practice → paste key and secret → Connect & test.
   - Place one small order. If it works, repeat with Real money.
2. **iPhone trading, when ready:**
   - Run `! npx wrangler@4 login` (free Cloudflare account).
   - Then: `cd relay && npx wrangler deploy`.
   - Put the printed address into `web/src/keys.js` → `RELAY_URL`, then rebuild (`sh tools/build.sh`) and push.
3. Optional: nothing else pending.

## Good to know
- Robinhood and XTB have no usable trading API, so they're watch-only. Crypto is prices and alerts only.
- Live prices come from CNBC (stocks, market factors) and Coinbase (crypto). Both are free but unofficial.
- Trading 212 keys are stored only on the phone, never in backups.
- Code map: `web/src/market.js` + `outlook.js` (gold), `assets.js` + `marketsScreen.js` (markets), `t212.js` (broker), `signals.js` (warnings), `action/check.mjs` (online job), `relay/` (iPhone relay), `android/` (Android app).

## New round (21 Nov 2026), user's brief
- Goal: "a personal investment, tracking and daily management app that will make you rich". MAIN MOTIVE: keep an eye on the GLOBAL MARKET.
- Design: completely new, "very tech, like a high-tech banking app", use advanced design skills. Show mockups FIRST (user prefers choosing from drawings, see Barakah lesson).
- Next: discuss extra features with the user before building.
- User said "do all" of features 1-21 (global cockpit, net worth, discipline tools, banking touches) AND wants all asset classes: forex, commodities, futures, options/derivatives, bonds/fixed income, index/ETF, CFD/spread bet, equity derivatives; "accurately like a real platform".
- Proposed: 3 layers (watch everything / analyse + realistic practice simulator / real trading via broker API). Real multi-asset execution needs IBKR or Saxo account (T212 API = stocks only; XTB/Robinhood no API). Extra ideas 22-30: COT report, 13F/insider, central bank tracker, correlation map, backtester, earnings calendar, screener, risk guard (daily loss lock), session clock.
- Waiting for user: (1) open IBKR/Saxo for real trading or practice-only? (2) design mockups go-ahead.
- 21 Nov: user SKIPPED real forex/futures/options/CFD trading. Keep watching those markets (data), trading stays T212 stocks. Next: design mockups.
- 21 Nov (later): user wants an ADVISOR/BOT: "more advanced methodologies guiding/alerting me to make buy or sell decisions on gold, crypto or whatever I trade"; "build this update as if this is your personal financial advisor or bot". Also mentioned "the chats, make..." (message cut off; probably a chat with the advisor). Ask to finish that sentence.
- CHARTS: every chart must be fancy + interactive: pinch zoom, pan, crosshair, candles/line, indicators. Plan: TradingView Lightweight Charts (Apache-2.0). Test zoom on Android + iPhone.
- More from user (21 Nov):
  * S&P 500 trading + "give options" (show the ways to trade S&P 500: via T212 = S&P 500 ETFs like VUAA/CSPX/VUSA or US stocks; T212 API has no CFDs so no US500 CFD).
  * Test Trading 212 capabilities for real (needs user's Practice API key).
  * "Make the app a super advanced level app with all finance features, dream app."
  * Advisor/bot: buy/sell guidance + alerts on gold, crypto, stocks (scored signals with reasons, backtested hit rate).
  * Charts: fancy interactive (zoom/pan/crosshair) everywhere.
- Design mockups drawn (4): A Quant Terminal, B Private Bank, C Neon Quant, D Carbon Pulse: https://claude.ai/artifact/AnbQX9TiQTsedoBwtrJBK8 . Waiting for pick.
- User: designs not good enough, "do better". Wants MORE decision features and MORE reasoning per signal (gold, crypto, stocks). New app icon when done.
  Signal engine factors to build (each shown as a reason with weight and direction):
  * Trend: price vs 20/50/200-day averages, golden/death cross, higher highs/lows, multi-timeframe agreement (day/week/month)
  * Momentum: RSI, MACD, rate of change, divergences
  * Volatility/levels: Bollinger, ATR, support/resistance, 52-week high/low distance, breakout/breakdown
  * Volume: volume vs average, accumulation/distribution
  * Macro: dollar index, real yields/10y, Fed expectations, inflation surprise, risk-on/off regime
  * Sentiment: news tone, Fear and Greed, extreme readings as contrarian
  * Positioning: CFTC COT (gold, futures), ETF flows, crypto funding rates/open interest
  * Fundamentals (stocks): valuation vs history, earnings surprises/revisions, analyst targets, insider buying (SEC Form 4), 13F
  * Seasonality, intermarket (gold vs dollar/yields, BTC vs Nasdaq), correlation
  * Backtest of the exact signal: hit rate and average move after, shown honestly
  * Trade plan: entry zone, stop, target, risk/reward, position size from risk %
- DESIGN CHOSEN: HOLO (holographic black, iridescent edge, light sweep, glass). Mockups row 2 + row 3 in https://claude.ai/artifact/AnbQX9TiQTsedoBwtrJBK8 (Holo-Home, Holo-Signal, Holo-Depth, Holo-Alerts, Holo-Widgets). Copies in notes/mockups/.
- More requests: chart display modes switchable (Line, Candles, Heikin-Ashi, Liquidity = volume profile + order book walls + depth chart, Heatmap); ALL charts pinch-zoom/pan; complete makeover, very tech, animations; SOUND EFFECTS on buy/sell/alert set; MULTIPLE alerts per asset at different prices (above/below/range enter-exit/% move/signal change), draggable alert lines, price ladder; better light-sweep animation (e.g. tilt-reactive holographic shine); better widgets, all sizes, resizable (net worth, signal gauge, watchlist, risk, single ticker, markets now, budget, next alert).
- Data note: real order book (liquidity walls/depth) is free only for crypto (Coinbase level2). Stocks/gold: volume profile computed from candles instead.
- 21 Nov ~02:00 user answers: test everything; T212 complete with Practice + Live keys; app-wide currency switch + per-section override; unique premium icon (3 options); repo public but no private info. Added scope: encrypted backups, app lock, live-trading safety, data health light, advisor scorecard, cooling-off timer, fee tracker, emergency fund check, Sunday summary, quiet hours. SCOPE LOCKED for v2.0; new ideas go to v2.1.
## v2.1 ideas (not in v2.0)
- Family/shared savings goals; receipt photo scan into budget; analyst 12-month price targets view.

# v2.0 build log (HOLO makeover), started 21 Nov 2026
Brief: notes/BRIEF-v2.md (incl. user answers + locked additions at the bottom).
## Phase 1 (design system + shell + Home): DONE (commit "v2 phase 1-2")
- web/style.css HOLO; fx.js sounds/haptics/tilt/count-up; holo.js (HoloCard tilt shine, Gauge 270, Spark, Light); fonts self-hosted web/fonts
- Icon: 3 options in notes/screens-v2/icons (prism = default, orbit, ascent); sources tools/icons/*.svg; PWA icons + Android adaptive (ic_fg/ic_bg) + notif_large
- util.money() converts to display currency (settings.cur + settings.curSec per section; Money sec prop)
- store v2 migration: settings (cur, mute, risk, tax, quiet, cooling...), alerts[], guard, paper, journal, calls, holdings, nwHist, dca, freedom, chart. Old markets.alerts -> alerts[]
- app shell: dock Home/Markets/orb/Wealth/More, orb menu, Hub (More) screen, autolock setting
- Home: holo net worth card (currency pick, history spark rebuilt from entries), quick actions, Today's call, minis, risk ribbon, budget, tiles, recent
## Phase 2 (charts): MOSTLY DONE
- chart.js: LWC 5.2.1 (docs/lwc.js lazy). Modes line/area/candles/heikin/liquidity(VP+POC, crypto walls)/heatmap(crypto book over time, others volume heat); indicators MA20/50/200 EMA21 VWAP BB RSI MACD ATR Vol; drawings hline/trend saved per asset; alert lines draggable; double-tap reset; Depth chart; SeriesChart generic
- todo: replace old SVG LineChart in gold screens with LWC; test pinch on Android
## Phase 3 (advisor): MOSTLY DONE
- advisor.js: 25 factors (trend, momentum, volatility/levels, volume, macro, sentiment, positioning COT, fundamentals P/E, insider (needs action data), seasonality, intermarket), backtest 5/20/60 + per-rule hit rates, trade plan (ATR stop, target, R:R, size), call log + trackRecord, today's call, emergency fund
- advisorScreen.js AdvisorScreen + SignalPanel (asset screen)
## Phase 4 (alerts): web side DONE (alerts.js engine + alertsScreen.js: kinds above/below/enter/leave/move/score/volume, ladder, quiet hours, log)
- todo: push.js config -> new alerts; action/check.mjs + Android AlertWorker for new kinds; Sunday summary
## Phase 5: DONE web side (commit 'v2 phase 5'): world.js; invest.js (WealthTab, PortfolioHub+manual holdings+CSV, Benchmark, RiskCheck, Dividends, Tax PL/AE, Freedom, Dca, WhatIf, Journal, Fees); trading.js (Practice paper trading incl. limit/stop, Guard); guard.js (daily loss lock, cooling-off, live needs guard); research.js (Screener, Earnings, Insiders/13F from macro.json, Backtester); settings2.js (Settings v2, encrypted Backup AES-GCM/PBKDF2, Data health); T212 client per official docs (pagination, dividends, pies, stop-limit); env badge; action/macro.mjs -> docs/macro.json (NBP rates, earnings, insiders, 13F). OLD todo list was: screener, earnings, insiders, backtest, portfolio+holdings/CSV, benchmark, riskcheck, dividends, tax, freedom, dca, whatif, journal, practice, guard, fees, health, encrypted backup, settings v2 (currency per section, sounds, risk style, tax residency), T212 complete + mock tests, cooling-off, live safety
## Phase 6: todo widgets, updater, APK v2.0, emulator tests
## Testing harness
- scratchpad pp/shots.mjs (puppeteer) + seed-v1.json sample data (fake numbers only)
## Phase 4 job: DONE (commit "v2 phase 4"). push.js config now sends alerts[] (v2), quiet, style, sunday, dca, backup, widget v2 data (nwTxt, nwSpark, calls, watch, risk, budget, next).
## Phase 6 (Android) IN PROGRESS: plan = Updater (native download/verify/install, web sheet UI via window.cpUpdate), AlertWorker v2 (alerts kinds + TechScore.kt port + quiet + sunday + dca), 8 widgets (TextViews + small bitmaps for spark/gauge/meter, size classes via onAppWidgetOptionsChanged), configure activity for Signal/Ticker, versionName 2.0 / versionCode 4, publish docs/android/{version.json, CreampieHoldings-2.0.apk}.
- 21 Nov: APK 2.0 built (not yet published); S21 emulator shows v2 Home correctly. SW now network-first for the page. Next: widget placement test, Note 8 test, publish docs/android.
- 21 Nov 06:05: APK 2.0 published (docs/android). Updater tested end-to-end on note8 emu (auto + manual check, download, sha, permission, install). Widgets tested via temp WidgetLab on note8 (all 8, several sizes). S21 api35 emulator crashes host-side (qemu segfault, 'Failed to find ColorBuffer') ~45s after the WebView app opens; idle is stable -> emulator GPU bug. Old WebView 69 support added (polyfills, inset). Next: LineChart->LWC, gold zł strings -> currency, worker run test.
- T212: tools/t212mock.mjs (faithful mock per official docs) + tools/t212test.mjs: 16/16 PASS (connect errors, demo connect, badge, live needs guard, positions, pies, history pagination, market+limit orders, cancel, oversell, missing scope 403, fees).
- 06:30 sheets-above-dock fix pushed. e2e.mjs 64/65 (expense step needed a category; test fixed). Next: Note8 1.2->2.0 upgrade + PIN, alert firing, S21 retry, final screens.
