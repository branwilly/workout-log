/* Service worker: network-first (3s) for same-origin GETs with cache fallback, so the app
   opens offline in the gym and still picks up updates when online. Never touches POSTs
   or cross-origin requests (the Google Sheet sync). */
var CACHE = 'workout-log-v1';
var SHELL = ['./', './index.html', './style.css', './plan.js', './app.js',
  './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png',
  './icons/apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith((function () {
    var network = fetch(req).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    });
    network.catch(function () {});
    var timeout = new Promise(function (_, reject) { setTimeout(function () { reject(new Error('timeout')); }, 3000); });
    return Promise.race([network, timeout]).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (hit) {
        return hit || caches.match('./index.html');
      });
    });
  })());
});
