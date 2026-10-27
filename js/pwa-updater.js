// js/pwa-updater.js
import { registerSW } from 'virtual:pwa-register';

const CHAVE_VERSAO_LOCAL = 'ptt_versao_build_instalada';
const VERSAO_DESTE_BUNDLE = typeof __APP_BUILD_VERSION__ !== 'undefined' ? String(__APP_BUILD_VERSION__) : null;

let swRegistrationGlobal = null;
let versaoRemotaDetetada = null;
let atualizacaoEmCurso = false;

// 1. No primeiro carregamento após atualizar, grava a versão deste pacote JS
if (VERSAO_DESTE_BUNDLE) {
    const salva = localStorage.getItem(CHAVE_VERSAO_LOCAL);
    if (!salva) {
        localStorage.setItem(CHAVE_VERSAO_LOCAL, VERSAO_DESTE_BUNDLE);
    }
}

// 2. Quando um novo Service Worker assume o comando, recarrega a página de forma limpa
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (atualizacaoEmCurso) {
            window.location.reload();
        }
    });
}

// 🚀 3. Registo do PWA com verificação imediata no segundo zero
const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
        console.log("🔄 Nova atualização detetada pelo Service Worker!");
        mostrarAlertaAtualizacaoGlobal();
    },
    onOfflineReady() {
        console.log("✅ Sistema pronto para uso.");
    },
    onRegisteredSW(swUrl, r) {
        swRegistrationGlobal = r;
        if (r) {
            // Se já houver uma atualização em espera logo ao abrir o aparelho, mostra o card na hora!
            if (r.waiting) {
                mostrarAlertaAtualizacaoGlobal();
            }

            // Verifica imediatamente no arranque
            r.update().catch(() => {});
        }
        // Dispara também o verificador direto de version.json (fura o cache do iOS/Safari e Android)
        verificarVersaoNoServidor();
    },
    onRegistered(r) {
        swRegistrationGlobal = r;
        if (r && r.waiting) {
            mostrarAlertaAtualizacaoGlobal();
        }
        verificarVersaoNoServidor();
    }
});

// 🔍 4. DETETOR UNIVERSAL (Funciona mesmo no iOS/Safari e WebViews que congelam o Service Worker)
async function verificarVersaoNoServidor() {
    if (atualizacaoEmCurso) return;

    try {
        // Pede também ao Service Worker para verificar
        if (swRegistrationGlobal && typeof swRegistrationGlobal.update === 'function') {
            swRegistrationGlobal.update().catch(() => {});
            if (swRegistrationGlobal.waiting) {
                mostrarAlertaAtualizacaoGlobal();
            }
        }

        // Consulta direta ao ficheiro version.json ignorando qualquer cache do aparelho
        const res = await fetch(`/version.json?_t=${Date.now()}`, {
            method: 'GET',
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            }
        });

        if (!res.ok) return;
        const dados = await res.json();
        if (!dados || !dados.version) return;

        const versaoServidor = String(dados.version).trim();
        versaoRemotaDetetada = versaoServidor;

        const versaoNoAparelho = VERSAO_DESTE_BUNDLE || localStorage.getItem(CHAVE_VERSAO_LOCAL);

        if (!versaoNoAparelho) {
            localStorage.setItem(CHAVE_VERSAO_LOCAL, versaoServidor);
            return;
        }

        // Se a versão que está no servidor é diferente da versão que está aberta neste aparelho, mostra o card na hora!
        if (versaoServidor !== String(versaoNoAparelho).trim()) {
            console.log(`🚀 Desatualização detetada! Aparelho: ${versaoNoAparelho} | Servidor: ${versaoServidor}`);
            mostrarAlertaAtualizacaoGlobal();
        } else {
            localStorage.setItem(CHAVE_VERSAO_LOCAL, versaoServidor);
        }
    } catch (e) {
        // Silencioso caso esteja temporariamente sem rede
    }
}

// 📡 5. GATILHOS DE VERIFICAÇÃO IMEDIATA EM TODOS OS APARELHOS
// Verifica assim que abre a página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(verificarVersaoNoServidor, 300));
} else {
    setTimeout(verificarVersaoNoServidor, 300);
}

// Verifica sempre que o utilizador desbloqueia o telemóvel ou volta para a aba/app
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        verificarVersaoNoServidor();
    }
});

// Especial para iOS Safari e Android (quando o utilizador volta do histórico/memória BFCache)
window.addEventListener('pageshow', () => {
    verificarVersaoNoServidor();
});

window.addEventListener('focus', () => {
    verificarVersaoNoServidor();
});

window.addEventListener('online', () => {
    verificarVersaoNoServidor();
});

// Verifica em segundo plano a cada 30 segundos enquanto estiver com a tela aberta
setInterval(() => {
    if (document.visibilityState === 'visible') {
        verificarVersaoNoServidor();
    }
}, 30000);

// 🧹 6. EXECUTOR DE ATUALIZAÇÃO PROFUNDA (Limpa Caches Antigos e Recarrega)
async function executarAtualizacaoProfunda() {
    if (atualizacaoEmCurso) return;
    atualizacaoEmCurso = true;

    try {
        if (versaoRemotaDetetada) {
            localStorage.setItem(CHAVE_VERSAO_LOCAL, versaoRemotaDetetada);
        } else if (VERSAO_DESTE_BUNDLE) {
            localStorage.setItem(CHAVE_VERSAO_LOCAL, VERSAO_DESTE_BUNDLE);
        }

        // 1. Se houver um Service Worker em espera, manda pular a fila (skipWaiting)
        if (swRegistrationGlobal && swRegistrationGlobal.waiting) {
            swRegistrationGlobal.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        try {
            updateSW(true);
        } catch (e) {}

        // 2. Limpa todos os CacheStorage antigos do navegador para obrigar o iOS/Android/Windows a baixar os ficheiros novos
        if ('caches' in window) {
            const chavesCache = await caches.keys();
            await Promise.all(chavesCache.map(chave => caches.delete(chave)));
        }

        // 3. Atualiza os registos do Service Worker
        if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            for (const reg of regs) {
                try { await reg.update(); } catch (e) {}
            }
        }
    } catch (err) {
        console.error("Aviso durante limpeza de cache:", err);
    }

    // 4. Força o recarregamento da página após 500ms (mesmo que o controllerchange do iOS não dispare)
    setTimeout(() => {
        window.location.reload();
    }, 500);
}

// Exposto globalmente caso o banner do index.html chame atualizarApp()
window.atualizarApp = executarAtualizacaoProfunda;

export function mostrarAlertaAtualizacaoGlobal() {
    if (document.getElementById('global-pwa-update-prompt')) return;

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
            .pwa-toast-desktop {
                bottom: 30px; right: 30px; left: auto; transform: none; animation: pwaSlideUp 0.35s ease-out;
            }
            @media screen and (max-width: 768px) {
                .pwa-toast-mobile {
                    left: 50% !important; right: auto !important; transform: translateX(-50%) !important; 
                    width: 92% !important; bottom: 20px !important; animation: pwaSlideUpMobile 0.35s ease-out !important;
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
        background: #1e293b; 
        color: white; 
        padding: 18px 22px; 
        border-radius: 16px; 
        box-shadow: 0 20px 45px rgba(0,0,0,0.55); 
        z-index: 2147483647; 
        display: flex; 
        align-items: center; 
        justify-content: space-between;
        gap: 16px; 
        font-family: 'Poppins', sans-serif; 
        max-width: 430px;
        border: 1px solid #334155;
        border-left: 5px solid #3b82f6;
    `;
    
    aviso.innerHTML = `
        <div style="flex: 1;">
            <strong style="display: block; font-size: 16px; margin-bottom: 4px; color: #ffffff;">🚀 Nova Atualização Disponível!</strong>
            <span style="font-size: 12px; color: #cbd5e1; line-height: 1.4; display: block;">Esta versão traz melhorias e ajustes recentes. Toque ao lado para atualizar o seu aparelho agora.</span>
        </div>
        <button id="btn-atualizar-global" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 12px 18px; border-radius: 10px; font-weight: bold; cursor: pointer; font-size: 13px; transition: 0.2s; white-space: nowrap; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35); flex-shrink: 0;">
            Atualizar Agora
        </button>
    `;
    
    document.body.appendChild(aviso);

    document.getElementById('btn-atualizar-global').addEventListener('click', () => {
        const btn = document.getElementById('btn-atualizar-global');
        if (btn) {
            btn.innerText = "Atualizando... ⏳";
            btn.style.background = "#f59e0b";
            btn.style.boxShadow = "none";
            btn.disabled = true;
        }
        executarAtualizacaoProfunda();
    });
}