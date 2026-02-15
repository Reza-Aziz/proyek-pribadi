const CACHE_NAME = "my-quran-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Strategy 1: Quran JSON Data -> Cache First (Immutable)
  if (url.pathname.startsWith("/quran-json/")) {
    event.respondWith(
      caches
        .match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then((networkResponse) => {
            // Only cache successful responses
            if (networkResponse && networkResponse.status === 200) {
              const cloneResponse = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, cloneResponse);
              });
            }
            return networkResponse;
          });
        })
        .catch(() => {
          // Return offline placeholder if needed
          return new Response("Offline - data not cached", {
            status: 503,
            statusText: "Service Unavailable",
          });
        }),
    );
    return;
  }

  // Strategy 2: Assets & HTML -> Network First, simple no clone issues
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Don't cache on the fly - let Vercel headers handle it
        return response;
      })
      .catch(() => {
        // Network failed - try cache as fallback
        return (
          caches.match(event.request).catch(() => {
            // Nothing in cache - return offline page
            return new Response("Offline", {
              status: 503,
              statusText: "Service Unavailable",
            });
          })
        );
      }),
  );
});
