// js/pwa-updater.js
import { registerSW } from 'virtual:pwa-register';

// 🚀 Sistema Global PWA: Alerta de Atualização para TODAS as telas (Web e Mobile)
const updateSW = registerSW({
    onNeedRefresh() {
        console.log("🔄 Nova atualização detetada pelo Vite PWA!");
        mostrarAlertaAtualizacaoGlobal();
    },
    onOfflineReady() {
        console.log("✅ PWA pronto para uso offline.");
    },
    onRegistered(r) {
        console.log("📡 Radar PWA ativado: A escutar novas versões em tempo real.");
        if (r) {
            // 1. Procura por atualizações a cada 60 segundos em segundo plano
            setInterval(() => {
                r.update().catch(err => console.log("Erro ao procurar atualizações PWA:", err));
            }, 60000);

            // 2. Procura imediatamente sempre que o aluno volta para a aba do portal
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    r.update().catch(err => console.log("Erro ao procurar atualizações PWA:", err));
                }
            });
        }
    }
});

function mostrarAlertaAtualizacaoGlobal() {
    if (document.getElementById('global-pwa-update-prompt')) return;

    // 🎨 Injeta o CSS de posicionamento dinâmico (Desktop vs Mobile)
    if (!document.getElementById('pwa-keyframes')) {
        const style = document.createElement('style');
        style.id = 'pwa-keyframes';
        style.innerHTML = `
            @keyframes pwaSlideUp {
                from { transform: translateY(100px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes pwaSlideUpMobile {
                from { transform: translate(-50%, 100px); opacity: 0; }
                to { transform: translate(-50%, 0); opacity: 1; }
            }
            /* Padrão Web/Desktop (Canto inferior direito) */
            .pwa-toast-desktop {
                bottom: 30px; right: 30px; left: auto; transform: none; animation: pwaSlideUp 0.4s ease-out;
            }
            /* Padrão Mobile (Centro inferior) */
            @media screen and (max-width: 768px) {
                .pwa-toast-mobile {
                    left: 50% !important; right: auto !important; transform: translateX(-50%) !important; 
                    width: 90% !important; bottom: 20px !important; animation: pwaSlideUpMobile 0.4s ease-out !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    const aviso = document.createElement('div');
    aviso.id = 'global-pwa-update-prompt';
    aviso.className = 'pwa-toast-desktop pwa-toast-mobile';
    aviso.style.cssText = `
        position: fixed; 
        background: #2c3e50; 
        color: white; 
        padding: 15px 25px; 
        border-radius: 12px; 
        box-shadow: 0 15px 35px rgba(0,0,0,0.4); 
        z-index: 9999999; 
        display: flex; 
        align-items: center; 
        gap: 20px; 
        font-family: 'Poppins', sans-serif; 
        max-width: 400px;
        border-left: 4px solid #3498db;
    `;
    
    aviso.innerHTML = `
        <div style="flex: 1;">
            <strong style="display: block; font-size: 14px; margin-bottom: 4px;">🚀 Atualização Disponível</strong>
            <span style="font-size: 12px; color: #bdc3c7;">Uma nova versão melhorada do site está diponível. Para atualizar, basta clicar no botão.</span>
        </div>
        <button id="btn-atualizar-global" style="background: #27ae60; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px; transition: 0.2s; white-space: nowrap; box-shadow: 0 4px 6px rgba(39, 174, 96, 0.3);">
            Atualizar Agora
        </button>
    `;
    
    document.body.appendChild(aviso);

    document.getElementById('btn-atualizar-global').addEventListener('click', () => {
        const btn = document.getElementById('btn-atualizar-global');
        btn.innerText = "Atualizando... ⏳";
        btn.style.background = "#f39c12";
        btn.style.boxShadow = "none";
        
        // Dá um compasso de espera de 800ms para o utilizador ler que o botão mudou antes da página dar refresh
        setTimeout(() => {
            updateSW(true);
        }, 800);
    });
}