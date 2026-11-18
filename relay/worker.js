// Creampie relay: lets the iPhone (browser) app talk to the Trading 212 API,
// which doesn't allow browser apps (no CORS). It only forwards requests to
// demo/live.trading212.com/api/v0/…, only for the Creampie app's address,
// and stores or logs nothing. Your API key travels in the request header, as with Trading 212 directly.
const ALLOWED_ORIGINS = ['https://skibidi-null.github.io'];

export default {
  async fetch(req) {
    const origin = req.headers.get('Origin') || '';
    const okOrigin = ALLOWED_ORIGINS.includes(origin);
    const cors = {
      'Access-Control-Allow-Origin': okOrigin ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    };
    if (req.method === 'OPTIONS') return new Response(null, { status: okOrigin ? 204 : 403, headers: cors });
    if (!okOrigin) return new Response('Forbidden', { status: 403, headers: cors });

    const url = new URL(req.url);
    const m = url.pathname.match(/^\/t212\/(demo|live)(\/api\/v0\/[A-Za-z0-9_\/\-]+)$/);
    if (!m || !['GET', 'POST', 'DELETE'].includes(req.method)) return new Response('Not found', { status: 404, headers: cors });

    const target = `https://${m[1]}.trading212.com${m[2]}${url.search}`;
    const headers = { Accept: 'application/json', 'User-Agent': 'CreampieRelay/1.0' };
    const auth = req.headers.get('Authorization'); if (auth) headers.Authorization = auth;
    let body;
    if (req.method === 'POST') { headers['Content-Type'] = 'application/json'; body = await req.text(); if (body.length > 10000) return new Response('Too large', { status: 413, headers: cors }); }
    let r;
    try { r = await fetch(target, { method: req.method, headers, body }); }
    catch { return new Response('{"message":"Relay could not reach Trading 212"}', { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } }); }
    const out = new Headers(cors);
    out.set('Content-Type', r.headers.get('Content-Type') || 'application/json');
    out.set('Cache-Control', 'no-store');
    for (const h of ['x-ratelimit-limit', 'x-ratelimit-remaining', 'x-ratelimit-reset']) { const v = r.headers.get(h); if (v) out.set(h, v); }
    out.set('Access-Control-Expose-Headers', 'x-ratelimit-limit, x-ratelimit-remaining, x-ratelimit-reset');
    return new Response(r.body, { status: r.status, headers: out });
  },
};
