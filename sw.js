/* Njia — Service Worker
 * Network-first for app code (HTML/CSS/JS/data) so a deployed update is
 * visible on the next load while still working offline from cache;
 * cache-first for icons, which never change. A pure cache-first strategy
 * for app code would mean a browser that already has this app installed
 * could never see a new deploy without the user manually clearing site
 * data — bump CACHE_VERSION on every deploy that changes cached files.
 */

const CACHE_VERSION = 'njia-v135';
const ICON_ASSETS = [
  './icons/icon-192x192.png', './icons/icon-512x512.png',
  './icons/icon-maskable-192.png', './icons/icon-maskable-512.png',
  './icons/logo-mark.svg',
  './favicon.ico'
];
const CACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/app.js',
  './js/discover.js',
  './js/design.js',
  './js/decide.js',
  './js/connect.js',
  './js/track.js',
  './js/help.js',
  './data/questions.js',
  './data/institutions.js',
  './data/courses.js',
  './data/funding.js',
  './data/labour-market.js',
  './data/sectors.js',
  ...ICON_ASSETS
];

self.addEventListener('install', (event) => {
  // No self.skipWaiting() here: a first-time install activates on its own
  // since there's no existing controller to conflict with. An *update*
  // must wait in the 'waiting' state until the user approves the reload
  // (see app.js showUpdateAvailableToast + the 'message' listener below) —
  // calling skipWaiting() unconditionally would activate updates silently
  // and reload the page out from under the user without them agreeing.
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CACHE_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  /* Milestone markers are counted by the SERVER, so the one thing this worker
   * must never do is answer one. Cached or precached, the second and every
   * later visit would be served locally, the request would never leave the
   * device, and the count would silently flatten to roughly the number of
   * first-ever installs — an undercount that looks exactly like low usage.
   * Left entirely alone: no respondWith, so the browser goes to the network
   * itself and simply fails when offline, which is the intended behaviour.
   * These are also absent from CACHE_ASSETS for the same reason. */
  if (new URL(event.request.url).pathname.includes('/m/')) return;

  const isIcon = ICON_ASSETS.some((path) => event.request.url.endsWith(path.replace('./', '/')));

  if (isIcon) {
    // Cache-first: icons are immutable for a given deploy.
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
    return;
  }

  // Network-first: always try to get the latest app code/data; fall back
  // to cache when offline, and to the cached shell for navigations.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, responseClone));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => {
        if (cached) return cached;
        if (event.request.mode === 'navigate') return caches.match('./index.html');
        return undefined;
      }))
  );
});
