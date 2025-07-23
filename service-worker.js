const CACHE_NAME = 'pflanzen-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/script.js',
  '/style.css',
  '/manifest.json',
  '/ResultImages/',
  '/modelClassifier/model.json',
  '/modelClassifier/weights.bin',
  '/modelSpecies/model.json',
  '/modelSpecies/metadata.json',
  '/modelSpecies/weights.bin',
  'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js'
];

// Installation: Dateien cachen
self.addEventListener('install', event => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Aktivierung: Alte Caches löschen
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
});

// Abrufen: Erst Cache, dann Netzwerk (Fallback)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }).catch(() => {
      // Optional: Fallback-Datei anzeigen
      // return caches.match('/offline.html');
    })
  );
});