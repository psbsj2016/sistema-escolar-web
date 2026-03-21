// =========================================================
// SERVICE WORKER - MOTOR DO PWA (APP INSTALÁVEL)
// =========================================================

// 🚀 Detonador de Cache atualizado para forçar o restauro do design!
const CACHE_NAME = 'escola-pwa-v42';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/site.css',
  './js/app.js',
  './js/modulos/cadastros.js',
  './js/modulos/financeiro.js',
  './js/modulos/pedagogico.js',
  './js/modulos/relatorios.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🧹 A limpar cache antigo:', cacheName);
            return caches.delete(cacheName); 
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('onrender.com')) return;
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting(); 
  }
});