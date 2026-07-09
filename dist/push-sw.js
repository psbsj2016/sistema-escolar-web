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

// 🚀 O que acontece quando o utilizador CLICA na Notificação?
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // Fecha o balão da notificação

    // 🔥 A CORREÇÃO: Transforma o link relativo num link de internet completo!
    // Pega o '/#financeiro' e transforma em 'https://sistemaptt.com.br/#financeiro'
    const targetUrl = new URL(event.notification.data?.url || '/', self.location.origin).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            
            // 1. Se a aplicação JÁ ESTIVER ABERTA em algum lugar (minimizada ou não)
            for (let client of windowClients) {
                // Se a janela pertencer ao nosso sistema
                if (client.url.startsWith(self.location.origin) && 'focus' in client) {
                    client.focus(); // Traz a app para a frente do ecrã
                    
                    // E FORÇA a app a navegar para a tela que a notificação mandou!
                    if (client.url !== targetUrl) {
                        return client.navigate(targetUrl);
                    }
                    return;
                }
            }
            
            // 2. Se a aplicação estiver TOTALMENTE FECHADA
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});