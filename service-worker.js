const CACHE_NAME = 'pflanzen-app-cache-v2';
const urlsToCache = [
  './',
  './index.html',
  './script.js',
  './style.css',
  './manifest.json',
  './tf.min.js',
  './modelClassifier/model.json',
  './modelClassifier/weights.bin',
  './modelSpecies/model.json',
  './modelSpecies/metadata.json',
  './modelSpecies/weights.bin',
  './ResultImages/Alpen Augentrost.jpg',
  './ResultImages/Birnelle.jpg',
  './ResultImages/Butterblume.jpg',
  './ResultImages/Ehrenpreis.jpg',
  './ResultImages/Feld Hainsime.jpg',
  './ResultImages/Flockenblume.jpg',
  './ResultImages/Haarstrang.jpg',
  './ResultImages/Hahnenfuß.jpg',
  './ResultImages/Hornklee.jpg',
  './ResultImages/Johanniskraut.jpg',
  './ResultImages/Labkraut.jpg',
  './ResultImages/Mädesüß.jpg',
  './ResultImages/Ranuculus Orthorhynchus.jpg',
  './ResultImages/Rotklee.jpg',
  './ResultImages/Scharfgabe.jpg',
  './ResultImages/Segge.jpg',
  './ResultImages/Skabiosenflockenblume.jpg',
  './ResultImages/Strandflieder.jpg',
  './ResultImages/Wiesen Witwenblume.jpg',
  './ResultImages/Wiesenmargerite.jpg',
  './ResultImages/Wiesenplatterbse.jpg',
  './ResultImages/Wilde Möhre.jpg',
];

// Install-Event: Cache alles
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate-Event: alten Cache löschen, falls Cache-Name sich ändert
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
                  .map(name => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Fetch-Event: erst Cache, dann Netzwerk, fallback offline.html wenn Navigation
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('./offline.html'))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});