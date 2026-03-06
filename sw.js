const CACHE_NAME = 'tkdesign-v1';
const STATIC_ASSETS = [
    '/',
    '/style.css',
    '/img/logo/d.png',
    '/img/logo/icon-192.png',
    '/img/logo/icon-512.png',
];

// Install: cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)).catch(() => { })
    );
    self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch: network-first strategy
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    const url = new URL(event.request.url);
    // Don't intercept API calls or admin
    if (url.pathname.startsWith('/api') || url.pathname.startsWith('/admin')) return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
