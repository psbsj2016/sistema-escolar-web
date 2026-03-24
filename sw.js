// =========================================================
// SERVICE WORKER - MOTOR PWA INTELIGENTE (SaaS)
// =========================================================

// Nome dinâmico para garantir que inicia limpo
const CACHE_NAME = 'escola-pwa-inteligente-v1'; 

// Ficheiros essenciais para o ecrã inicial funcionar offline
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/site.css',
  '/js/app.js',
  '/js/config.js'
];

// 1. INSTALAÇÃO: Força a ativação imediata do novo Service Worker
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Não espera que o utilizador feche as abas todas
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 A guardar ficheiros essenciais no cache...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. ATIVAÇÃO: Limpa qualquer lixo de caches antigas (como as v47, v46, etc.)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🧹 A limpar cache antiga:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Assume o controlo de todas as páginas abertas imediatamente
});

// 3. INTERCETADOR DE PEDIDOS (A Magia Acontece Aqui)
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 🚨 REGRA DE OURO BANCÁRIA: Nunca guardar em cache chamadas da API, POSTs ou extensões do Chrome!
    if (url.origin.includes('onrender.com') || 
        event.request.method !== 'GET' || 
        url.protocol === 'chrome-extension:') {
        return; // Deixa passar direto para a internet
    }

    // 🌐 ESTRATÉGIA: "Network First" (Rede Primeiro, Cache como Plano B)
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // Se fomos à internet e recebemos a resposta fresca, guardamos uma cópia nova no cache!
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // 📵 O UTILIZADOR ESTÁ OFFLINE (Sem Net)
                // Vamos tentar buscar o ficheiro ao nosso Cache!
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Opcional: Aqui poderia retornar uma página HTML amigável dizendo "Você está offline"
                });
            })
    );
});