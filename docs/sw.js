// Creampie Holdings service worker: offline app shell + push alerts (iPhone/desktop).
const V = '20261113143251';
const SHELL = ['./', 'index.html', 'app.js', 'style.css', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-180.png', 'icons/badge.png',
  'fonts/orbitron.woff2', 'fonts/grotesk.woff2', 'fonts/grotesk-ext.woff2', 'fonts/mono.woff2', 'fonts/mono-ext.woff2'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.endsWith('news.json')) { e.respondWith(fetch(e.request).then((r) => { if (r.ok) { const cp = r.clone(); caches.open(V).then((c) => c.put('news.json', cp)); } return r; }).catch(() => caches.match('news.json').then((h) => h || new Response('{"items":[]}', { headers: { 'Content-Type': 'application/json' } })))); return; }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request).then((r) => {
    if (r.ok && u.pathname.match(/\.(js|css|png|woff2|json|webmanifest)$/)) { const cp = r.clone(); caches.open(V).then((c) => c.put(e.request, cp)); }
    return r;
  }).catch(() => caches.match('index.html'))));
});
self.addEventListener('push', (e) => {
  let d = {}; try { d = e.data.json(); } catch { d = { title: 'Creampie Holdings', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Creampie Holdings', { body: d.body || '', icon: 'icons/icon-192.png', badge: 'icons/badge.png', tag: d.tag || undefined, data: { url: d.url || './#/home' } }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => {
    for (const c of cs) if ('focus' in c) { c.navigate(url).catch(() => {}); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
