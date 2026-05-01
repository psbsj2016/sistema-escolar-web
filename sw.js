// =========================================================
// SERVICE WORKER - MOTOR PWA INTELIGENTE (SaaS)
// =========================================================

// 1. GESTÃO DE VERSÃO DINÂMICA
const APP_PREFIX = 'escola-pwa-';
// 🚀 SEMPRE QUE ATUALIZAR O SISTEMA FRONT-END, MUDE ESTE NÚMERO
const VERSION = 'v1777665688'; 
const CACHE_NAME = APP_PREFIX + VERSION;

// Ficheiros essenciais para o ecrã inicial funcionar super rápido
const ASSETS_TO_CACHE = [
  '/',
    '/index.html',
    '/css/site.css',
    '/js/config.js?v=1777665688',
    '/js/app.js?v=1777665688',
    '/js/modulos/cadastros.js?v=1777665688',
    '/js/modulos/financeiro.js?v=1777665688',
    '/js/modulos/pedagogico.js?v=1777665688',
    '/js/modulos/relatorios.js?v=1777665688'
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
                    // Verifica se o cache é do nosso PWA e se a versão é velha
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

// 4. INTERCETADOR DE PEDIDOS (Estratégia: Network First / Rede Primeiro)
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 🚨 REGRA DE OURO BANCÁRIA: Nunca fazer cache da API do Render ou Extensões!
    if (url.origin.includes('onrender.com') || 
        event.request.method !== 'GET' || 
        url.protocol === 'chrome-extension:') {
        return; // Passa direto para a internet sem interferir
    }

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // Se a internet funcionou, atualizamos o cache com os dados mais recentes
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            })
            .catch(async () => {
                // 📵 O UTILIZADOR ESTÁ OFFLINE
                console.log(`📡 [SW] Sem rede! Tentando carregar da mochila (cache): ${event.request.url}`);
                const cachedResponse = await caches.match(event.request);
                return cachedResponse;
            })
    );
});