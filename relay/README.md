# Creampie relay (iPhone → Trading 212)

Trading 212 doesn't allow browser apps to call its API, and the iPhone version of Creampie is a browser (Home Screen) app.
This tiny Cloudflare Worker forwards the app's requests to Trading 212. It accepts requests only from the Creampie app's
address, only to `demo/live.trading212.com/api/v0/…`, and stores nothing. The Android app doesn't need it.

Free Cloudflare plan: 100,000 requests a day (far more than needed).

Deploy (one time):

1. `npx wrangler login` (opens the browser, log in or create a free Cloudflare account)
2. `cd relay && npx wrangler deploy`
3. Put the printed `https://creampie-relay.<name>.workers.dev` address into `web/src/keys.js` → `RELAY_URL`, rebuild and push.
