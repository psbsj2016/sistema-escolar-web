// =========================================================
// SERVICE WORKER - O XEQUE-MATE NA CDN DO GITHUB (FINAL)
// =========================================================

const APP_PREFIX = 'escola-pwa-';
const VERSION = 'v1777943554'; // O seu robô vai mudar isto automaticamente
const CACHE_NAME = APP_PREFIX + VERSION;

// ⚠️ As tags ?v= estão aqui para o seu robô as poder atualizar
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/site.css?v=1777943554', 
    '/js/config.js?v=1777943554',
    '/js/app.js?v=1777943554',
    '/js/modulos/cadastros.js?v=1777943554',
    '/js/modulos/financeiro.js?v=1777943554',
    '/js/modulos/pedagogico.js?v=1777943554',
    '/js/modulos/relatorios.js?v=1777943554'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName.startsWith(APP_PREFIX) && cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); 
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 🚨 Deixa APIs e extensões em paz
    if (url.origin.includes('onrender.com') || event.request.method !== 'GET' || url.protocol === 'chrome-extension:') {
        return; 
    }

    // 🔥 REGRA INFALÍVEL PARA HTML (Fura a CDN do GitHub)
    if (event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
        event.respondWith(
            fetch(event.request.url + (event.request.url.includes('?') ? '&' : '?') + 'furacdn=' + new Date().getTime(), { cache: 'reload' })
            .then(response => {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request.url, responseClone));
                return response;
            })
            .catch(() => {
                return caches.match(event.request.url) || caches.match('/');
            })
        );
        return;
    }

    // 🔥 REGRA PARA JS/CSS (Cache First rápido e seguro com ?v=)
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse; 
            
            return fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
                }
                return networkResponse;
            });
        })
    );
});