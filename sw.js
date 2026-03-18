// =========================================================
// SERVICE WORKER - MOTOR DO PWA (APP INSTALÁVEL)
// =========================================================

const CACHE_NAME = 'escola-pwa-v1';
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

// Instalação do Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache PWA aberto com sucesso');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// Ativação e Limpeza de caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceção de pedidos (Network-first para os dados, Cache-first para ficheiros)
self.addEventListener('fetch', event => {
  // Ignora chamadas para a API (para os dados estarem sempre atualizados)
  if (event.request.url.includes('onrender.com')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Devolve do cache (Super rápido)
        }
        return fetch(event.request); // Vai buscar à internet
      })
  );
});