# Creampie Holdings

Personal investing, global markets and daily money app (v2.0, HOLO design): net worth across brokers, an advisor that scores every asset with its reasons and backtest, interactive charts, several alerts per asset, world markets cockpit, practice trading, Trading 212 trading, and the original budget, card, gold and zakat tools.

- `web/` app source (Preact + htm). `tools/build.sh` builds it into `docs/` (GitHub Pages). iPhone uses it as a Home Screen app.
- Desktop: on screens 960px and wider the app switches to a sidebar layout (`web/desktop.js`). Shortcuts: `N` add, `1` to `4` main tabs, `/` markets search, `Esc` close.
- `android/` Android app (WebView shell, 8 home-screen widgets, background alerts, in-app updater). Releases: `docs/android/version.json` + APK.
- `action/` online job every 10 minutes: news, iPhone push alerts, Sunday summary, `docs/macro.json` (NBP rates, earnings, insider buying, 13F).
- `relay/` optional Cloudflare Worker so the iPhone app can reach the Trading 212 API (Android talks to Trading 212 directly).
- Tests: `tools/e2e.mjs` (whole app at iPhone size), `tools/t212mock.mjs` + `tools/t212test.mjs` (Trading 212 API mock and trading flow).

All money data stays on the device. Nothing personal is stored in this repository.
