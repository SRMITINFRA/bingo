const CACHE_NAME = 'bingo-royale-v3';
const ASSETS = [
  './',
  './index.html',
  './live.html',
  './manifest.json',
  './icon192.png',
  './icon512.png'
];

// Install stage - cache local static files only
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

// Media-safe Fetch Handler
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // CRITICAL: Completely bypass external requests (Supabase, WebRTC signaling, TURN traffic)
  if (url.origin !== location.origin) {
    return; // Let the browser handle it normally over the direct network
  }

  // Only handle local static asset caching
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
