const CACHE_NAME = 'my-quran-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
  // Vite assets will be hashed, so we can't hardcode them easily here without a build step injecting them.
  // Strategy: Cache First for /quran-json/, Network First for others?
  // Since we can't install workbox or vite-plugin-pwa, we use a simple strategy.
  // We will cache all requests to /quran-json/ dynamically.
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // We can't cache everything upfront easily without a list.
      // We force cache the critical shell if we knew the filenames.
      // For now, we rely on runtime caching.
      return cache.addAll(['/']);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
     caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Strategy 1: Quran JSON Data -> Cache First (Immutable basically)
  if (url.pathname.startsWith('/quran-json/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          return response || fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Strategy 2: Assets (JS/CSS) -> Stale While Revalidate
  // Since vite generates hashed filenames, Cache First is safer if we know it's a built asset.
  // But locally `npm run dev` serves files differently.
  // We'll use Network First for dev safety, or StaleWithRevalidate.
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((networkResponse) => {
          // Cache everything visited (Naive PWA)
          // Don't cache sockjs/HMR
          if (!url.pathname.includes('node_modules') && !url.pathname.includes('@')) {
               caches.open(CACHE_NAME).then((cache) => {
                 try {
                     cache.put(event.request, networkResponse.clone());
                 } catch (e) {
                     // ignore (e.g. POST requests or chrome-extension schemes)
                 }
               });
          }
          return networkResponse;
      });
    })
  );
});
