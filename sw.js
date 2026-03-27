// =========================================================
// SERVICE WORKER - MOTOR PWA INTELIGENTE (SaaS)
// =========================================================

// 1. GESTÃO DE VERSÃO DINÂMICA
const APP_PREFIX = 'escola-pwa-';
// 🚀 SEMPRE QUE ATUALIZAR O SISTEMA, MUDE ESTE NÚMERO (Ex: v2.0.1, v2.0.2...)
const VERSION = 'v2.0.2'; 
const CACHE_NAME = APP_PREFIX + VERSION;

// Ficheiros essenciais para o ecrã inicial funcionar offline
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/site.css',
  '/js/app.js',
  '/js/config.js'
];

// 2. INSTALAÇÃO: Força a ativação imediata e guarda os ficheiros estáticos
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Não espera que o utilizador feche as abas todas
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log(`📦 [SW] A guardar ficheiros na versão: ${VERSION}`);
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 3. ATIVAÇÃO: Limpeza inteligente (O Segredo da Versão)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Verifica se o cache é do nosso PWA e se a versão é diferente da atual
                    if (cacheName.startsWith(APP_PREFIX) && cacheName !== CACHE_NAME) {
                        console.log(`🧹 [SW] Cache antigo detetado e removido: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Assume o controlo imediato das páginas abertas
});

// 4. INTERCETADOR DE PEDIDOS (Estratégia: Network First)
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 🚨 REGRA DE OURO BANCÁRIA: Não fazer cache a APIs ou Extensões!
    if (url.origin.includes('onrender.com') || 
        event.request.method !== 'GET' || 
        url.protocol === 'chrome-extension:') {
        return; // Passa direto para a internet
    }

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // Fomos à internet e recebemos ficheiros frescos.
                // Guardamos uma cópia no NOSSO CACHE ATUALIZADO.
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // 📵 O UTILIZADOR ESTÁ OFFLINE
                console.log(`📡 [SW] Modo Offline. A carregar do cache: ${event.request.url}`);
                return caches.match(event.request);
            })
    );
});