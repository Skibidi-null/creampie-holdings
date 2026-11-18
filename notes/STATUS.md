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
