/* Offline-Unterstützung: immer erst das Netz (neueste Version), sonst der Zwischenspeicher. */
const CACHE = 'greta-mathe';

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    try {
      const html = await (await fetch('./index.html', { cache: 'no-store' })).text();
      const lokal = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]).filter((u) => !/^https?:/.test(u));
      await c.addAll(['./', ...lokal]);
    } catch (err) { /* offline beim Installieren – egal */ }
  })());
});

self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        const kopie = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, kopie));
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('./')))
  );
});
