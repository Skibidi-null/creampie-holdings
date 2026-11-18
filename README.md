# Creampie Holdings

Personal money tracker: spending, income, credit card, savings, friends, goals, zakat and a live gold tracker (drivers, outlook, early warnings, history), a stocks & crypto watchlist with alerts, and Trading 212 trading.

- `web/` app source (Preact). `tools/build.sh` builds it into `docs/` (GitHub Pages).
- `action/` the job that refreshes gold news and sends alerts (runs every 10 minutes).
- `android/` Android app.
- `relay/` optional Cloudflare Worker so the iPhone app can reach the Trading 212 API (Android talks to Trading 212 directly).
- `tools/playbook.mjs` rebuilds the gold history statistics (since 1971) from `tools/data`.

All money data stays on the device. Nothing personal is stored in this repository.
