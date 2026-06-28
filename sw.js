const CACHE_NAME = 'bingo-royale-v4';
const ASSETS = [
  '/',
  '/index.html',
  '/live.html',
  '/manifest.json',
  '/icon192.png',
  '/icon512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // CRITICAL: Force bypass on any WebRTC signaling, Supabase sockets, or STUN/TURN relays
  if (e.request.url.startsWith('http') === false || e.request.method !== 'GET') {
    return;
  }

  const url = new URL(e.request.url);
  if (url.origin !== location.origin) {
    return; // Bypass completely out to native network
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(e.request);
    })
  );
});
