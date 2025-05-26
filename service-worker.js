const CACHE_NAME = 'fisc36-calculator-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/downsize.css',
  '/app.js',
  '/manifest.webmanifest',
  '/icons/icon-android-192.png',
  '/icons/icon-android-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});