const CACHE_NAME = 'awpl-cache-v2';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './products.js',
  './app.js',
  './logo.png',
  './favicon.png',
  './favicon.ico',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap'
];

// Install Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching files...');
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Service Worker
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache...');
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Interceptor
self.addEventListener('fetch', (e) => {
  // Only handle local requests or fonts
  if (e.request.url.startsWith(self.location.origin) || e.request.url.includes('googleapis') || e.request.url.includes('gstatic')) {
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(e.request).then((networkResponse) => {
          return networkResponse;
        }).catch(() => {
          // Offline fallback
          if (e.request.url.endsWith('.html') || e.request.url === self.location.origin + '/') {
            return caches.match('./index.html');
          }
        });
      })
    );
  }
});
