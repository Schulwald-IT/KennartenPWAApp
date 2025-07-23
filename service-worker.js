//cache wird benötigt um alle erforderlichen modelle und dateien für die app zu laden  
const CACHE_NAME = 'pflanzen-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/script.js',
  '/style.css',
  '/manifest.json',
  '/ResultImages/',
  //model classifier wird benötigt um zu entscheiden ob es eine kennart ist oder nicht
  '/modelClassifier/model.json',
  '/modelClassifier/model.json',
  '/modelClassifier/weights.bin',
  //model species wird benötigt um zu entscheiden welche kennart es ist
  '/modelSpecies/model.json',
  '/modelSpecies/metadata.json',
  '/modelSpecies/weights.bin',
  //bindet die TensorFlow Javascript Biliothek für Anwendung von KI ein
  'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js'
];

//wenn die app installiert wird werden dateien und models in den cache geladen
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

//wenn eine der urls angefragt wird innerhalb der app liefert der service worker die datei
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});