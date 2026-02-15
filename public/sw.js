const CACHE_NAME = "my-quran-v1";
const STATIC_ASSETS = ["/", "/index.html", "/manifest.json"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Ignore errors for optional static assets
      });
    }),
  );
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
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          return (
            response ||
            fetch(event.request)
              .then((networkResponse) => {
                // Only cache successful responses
                if (networkResponse && networkResponse.status === 200) {
                  cache.put(event.request, networkResponse.clone());
                }
                return networkResponse;
              })
              .catch(() => {
                // Return cached version if offline
                return response;
              })
          );
        });
      }),
    );
    return;
  }

  // Strategy 2: Assets (JS/CSS with hash) -> Network First with fallback
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Only cache successful responses
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback to cache on network error
          return caches.match(event.request);
        }),
    );
    return;
  }

  // Strategy 3: HTML/index routes -> Network First
  if (url.pathname === "/" || url.pathname.endsWith(".html") || url.pathname === "/manifest.json") {
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request);
        }),
    );
    return;
  }

  // Strategy 4: Everything else -> Network First with fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => response)
      .catch(() => {
        return caches.match(event.request);
      }),
  );
});
