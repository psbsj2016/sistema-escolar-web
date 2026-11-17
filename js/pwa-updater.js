// js/pwa-updater.js - Motor de Atualização Forçada Universal (PWA Instalado + Chrome, Edge, Firefox, Safari e Opera Mini)
import { registerSW } from 'virtual:pwa-register';

const CHAVE_VERSAO_LOCAL = 'ptt_versao_build_instalada';
const CHAVE_TENTATIVA_RELOAD = 'ptt_reload_forcado_versao';
const VERSAO_DESTE_BUNDLE = typeof __APP_BUILD_VERSION__ !== 'undefined' ? String(__APP_BUILD_VERSION__) : null;

let swRegistrationGlobal = null;
let versaoRemotaDetetada = null;
let atualizacaoEmCurso = false;
let atualizacaoAguardandoFimDeAula = false;

// 1. Grava a versão deste bundle JS caso ainda não exista no aparelho
if (VERSAO_DESTE_BUNDLE) {
    const salva = localStorage.getItem(CHAVE_VERSAO_LOCAL);
    if (!salva) {
        localStorage.setItem(CHAVE_VERSAO_LOCAL, VERSAO_DESTE_BUNDLE);
    }
}

// 🛡️ Verifica se o utilizador está no meio de uma Aula Ao Vivo ou Prova com Cronómetro para não o derrubar
function utilizadorEmAtividadeCriticaAoVivo() {
    try {
        // 1. Verifica se está em prova escrita ou teste oral ativo no WorkSpace
        if (window.Workspace && window.Workspace.Avaliacoes) {
            if (window.Workspace.Avaliacoes.exameAtivo || window.Workspace.Avaliacoes.estudioAtivo) {
                return true;
            }
        }
        // 2. Verifica se está dentro de uma Sala Ao Vivo ativa no PlayClass & Meet
        const modalVideo = document.getElementById('ws-modal-video-aulas');
        const iframeVideo = document.getElementById('iframeVideoAulas');
        if (modalVideo && modalVideo.style.display !== 'none' && iframeVideo && iframeVideo.contentWindow) {
            const win = iframeVideo.contentWindow;
            const emCinemaLive = win.document?.body?.classList?.contains('modo-cinema-live');
            const temLiveAtiva = Boolean(win.liveAtivaObj && win.liveAtivaObj.ativa);
            if (emCinemaLive || temLiveAtiva) {
                return true;
            }
        }
    } catch (e) {}
    return false;
}

// 💾 Salva qualquer texto que o utilizador estivesse a digitar antes de recarregar
function salvarRascunhosAntesDeAtualizar() {
    try {
        if (window.Workspace && window.Workspace.Rascunho && typeof window.Workspace.Rascunho.salvarAoSair === 'function') {
            window.Workspace.Rascunho.salvarAoSair();
        }
        if (window.App && typeof window.App.salvarRascunhoModal === 'function') {
            window.App.salvarRascunhoModal();
        }
    } catch (e) {}
}

// 2. Quando o novo Service Worker assume o controlo, aplica a atualização imediatamente
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (atualizacaoEmCurso) return;
        if (utilizadorEmAtividadeCriticaAoVivo()) {
            atualizacaoAguardandoFimDeAula = true;
            return;
        }
        forcarRecarregamentoLimpo();
    });
}

// 🚀 3. Registo do PWA em modo Auto-Update
const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
        console.log("🔄 Nova versão detetada pelo Service Worker! Aplicando atualização forçada...");
        dispararAtualizacaoForcadaImediata();
    },
    onOfflineReady() {
        console.log("✅ Aplicação pronta para uso.");
    },
    onRegisteredSW(swUrl, r) {
        swRegistrationGlobal = r;
        if (r) {
            if (r.waiting) {
                dispararAtualizacaoForcadaImediata();
            }
            r.update().catch(() => {});
        }
        verificarVersaoNoServidor();
    },
    onRegistered(r) {
        swRegistrationGlobal = r;
        if (r && r.waiting) {
            dispararAtualizacaoForcadaImediata();
        }
        verificarVersaoNoServidor();
    }
});

// 🔍 4. DETETOR UNIVERSAL POR REDE (Funciona em Chrome, Edge, Firefox, Safari, Opera Mini e PWA Instalado)
async function verificarVersaoNoServidor() {
    if (atualizacaoEmCurso) return;

    // Se havia uma atualização à espera de terminar a aula ao vivo e a aula já acabou, atualiza agora!
    if (atualizacaoAguardandoFimDeAula && !utilizadorEmAtividadeCriticaAoVivo()) {
        atualizacaoAguardandoFimDeAula = false;
        executarAtualizacaoProfunda();
        return;
    }

    try {
        if (swRegistrationGlobal && typeof swRegistrationGlobal.update === 'function') {
            swRegistrationGlobal.update().catch(() => {});
            if (swRegistrationGlobal.waiting) {
                dispararAtualizacaoForcadaImediata();
                return;
            }
        }

        // Busca direta com timestamp único e cabeçalhos que furam proxies como o do Opera Mini
        const res = await fetch(`/version.json?_t=${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, {
            method: 'GET',
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });

        if (!res.ok) return;
        const dados = await res.json();
        if (!dados || !dados.version) return;

        const versaoServidor = String(dados.version).trim();
        versaoRemotaDetetada = versaoServidor;

        const versaoSalvaLocal = localStorage.getItem(CHAVE_VERSAO_LOCAL);
        const versaoNoAparelho = VERSAO_DESTE_BUNDLE || versaoSalvaLocal;

        if (!versaoNoAparelho) {
            localStorage.setItem(CHAVE_VERSAO_LOCAL, versaoServidor);
            return;
        }

        const desatualizadoPeloBundle = VERSAO_DESTE_BUNDLE && (versaoServidor !== String(VERSAO_DESTE_BUNDLE).trim());
        const desatualizadoPeloStorage = versaoSalvaLocal && (versaoServidor !== String(versaoSalvaLocal).trim());

        if (desatualizadoPeloBundle || desatualizadoPeloStorage) {
            // Evita loop infinito se o proxy da operadora/Opera Mini demorar alguns segundos a propagar o JS novo
            const ultimaTentativa = sessionStorage.getItem(CHAVE_TENTATIVA_RELOAD);
            if (ultimaTentativa === versaoServidor) {
                localStorage.setItem(CHAVE_VERSAO_LOCAL, versaoServidor);
                return;
            }
            console.log(`🚀 Atualizando aparelho automaticamente para a versão ${versaoServidor}...`);
            dispararAtualizacaoForcadaImediata();
        } else {
            localStorage.setItem(CHAVE_VERSAO_LOCAL, versaoServidor);
            sessionStorage.removeItem(CHAVE_TENTATIVA_RELOAD);
        }
    } catch (e) {
        // Silencioso caso esteja sem internet no momento
    }
}

// ⚡ Decide se aplica imediatamente ou aguarda o término da chamada ao vivo
function dispararAtualizacaoForcadaImediata() {
    if (atualizacaoEmCurso) return;
    if (utilizadorEmAtividadeCriticaAoVivo()) {
        atualizacaoAguardandoFimDeAula = true;
        return;
    }
    mostrarBannerAtualizacaoAutomatica();
    setTimeout(() => {
        executarAtualizacaoProfunda();
    }, 900);
}

// 📡 5. GATILHOS EM TEMPO REAL (Ao abrir o App, ao voltar para a aba, ao recuperar internet e a cada 25s)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(verificarVersaoNoServidor, 200));
} else {
    setTimeout(verificarVersaoNoServidor, 200);
}

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') verificarVersaoNoServidor();
});
window.addEventListener('pageshow', () => verificarVersaoNoServidor());
window.addEventListener('focus', () => verificarVersaoNoServidor());
window.addEventListener('online', () => verificarVersaoNoServidor());

setInterval(() => {
    if (document.visibilityState === 'visible') {
        verificarVersaoNoServidor();
    }
}, 25000);

// 🔄 Recarregamento que fura o cache do Opera Mini, Android WebView, iOS Safari e Desktop
async function forcarRecarregamentoLimpo() {
    try {
        // Pede ao navegador para revalidar o próprio HTML na rede antes do reload
        await fetch(window.location.href, {
            method: 'GET',
            cache: 'reload',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            }
        }).catch(() => {});
    } catch (e) {}

    window.location.reload();
}

// 🧹 6. EXECUTOR DE ATUALIZAÇÃO PROFUNDA FORÇADA
async function executarAtualizacaoProfunda() {
    if (atualizacaoEmCurso) return;
    atualizacaoEmCurso = true;

    salvarRascunhosAntesDeAtualizar();

    try {
        const versaoAlvo = versaoRemotaDetetada || VERSAO_DESTE_BUNDLE || String(Date.now());
        localStorage.setItem(CHAVE_VERSAO_LOCAL, versaoAlvo);
        sessionStorage.setItem(CHAVE_TENTATIVA_RELOAD, versaoAlvo);

        // 1. Manda o Service Worker em espera assumir imediatamente
        if (swRegistrationGlobal && swRegistrationGlobal.waiting) {
            swRegistrationGlobal.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        try {
            updateSW(true);
        } catch (e) {}

        // 2. Apaga TODAS as caches do CacheStorage (essencial para PWAs instalados e Chrome/Edge/Firefox)
        if ('caches' in window) {
            const chavesCache = await caches.keys();
            await Promise.all(chavesCache.map(chave => caches.delete(chave)));
        }

        // 3. Atualiza ou renova os Service Workers registados
        if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            for (const reg of regs) {
                try {
                    if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                    await reg.update();
                } catch (e) {}
            }
        }
    } catch (err) {
        console.error("Aviso durante limpeza de cache:", err);
    }

    setTimeout(() => {
        forcarRecarregamentoLimpo();
    }, 350);
}

window.atualizarApp = executarAtualizacaoProfunda;

// Exibe uma faixa discreta informando que a atualização automática está a ser aplicada
export function mostrarBannerAtualizacaoAutomatica() {
    if (document.getElementById('global-pwa-update-prompt')) return;

    const aviso = document.createElement('div');
    aviso.id = 'global-pwa-update-prompt';
    aviso.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #0f172a;
        color: #ffffff;
        padding: 12px 20px;
        border-radius: 999px;
        box-shadow: 0 14px 35px rgba(0,0,0,0.45);
        z-index: 2147483647;
        display: flex;
        align-items: center;
        gap: 10px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 13px;
        font-weight: 700;
        border: 1px solid #3b82f6;
        white-space: nowrap;
    `;
    aviso.innerHTML = `<span>🔄</span> <span>Aplicando nova atualização do sistema...</span>`;
    document.body.appendChild(aviso);
}

export const mostrarAlertaAtualizacaoGlobal = dispararAtualizacaoForcadaImediata;