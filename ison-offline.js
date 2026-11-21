const cacheName = 'ison-offline-v1';
const page = new URL('index.html', self.registration.scope).href;
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    await cache.add(new Request(page, {cache: 'reload'}));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.mode !== 'navigate' || ![page, self.registration.scope].includes(url.origin + url.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    try {
      const response = await fetch(event.request);
      if (response.ok) {
        await cache.put(page, response.clone());
        return response;
      }
      return await cache.match(page) || response;
    } catch {
      return await cache.match(page) || Response.error();
    }
  })());
});
