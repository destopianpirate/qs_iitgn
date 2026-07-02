const CACHE_NAME = 'qs-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/index.css',
  '/css/portal.css',
  '/js/firebase.js',
  '/js/quiz.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;
  
  // Don't cache API/Firebase calls
  if (event.request.url.includes('firestore') || event.request.url.includes('firebase')) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request).then(response => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    }).catch(() => {
      // Offline fallback
      return caches.match('/index.html');
    })
  );
});
