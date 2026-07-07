// public/push-sw.js

// ============================================================================
// 📡 MOTOR DE ESCUTA PUSH (NOTIFICAÇÕES EM SEGUNDO PLANO)
// ============================================================================

self.addEventListener('push', (event) => {
    let dados = {
        title: '🔔 Alerta Sistema PTT',
        body: 'Nova atualização no seu painel escolar.',
        url: '/'
    };

    if (event.data) {
        try {
            dados = event.data.json();
        } catch (e) {
            dados.body = event.data.text();
        }
    }

    const opcoes = {
        body: dados.body,
        icon: '/assets/icone.png',      
        badge: '/assets/icone.png',     
        vibrate: [200, 100, 200],       
        data: { url: dados.url },       
        actions: [
            { action: 'open', title: '📱 Abrir App' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(dados.title, opcoes)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const urlParaAbrir = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let client of windowClients) {
                if (client.url === urlParaAbrir && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlParaAbrir);
            }
        })
    );
});