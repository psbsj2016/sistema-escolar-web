// js/pwa-updater.js - Motor de Atualização Forçada Universal com Blindagem Absoluta para Aulas Ao Vivo
import { registerSW } from 'virtual:pwa-register';

const CHAVE_VERSAO_LOCAL = 'ptt_versao_build_instalada';
const CHAVE_TENTATIVA_RELOAD = 'ptt_reload_forcado_versao';
const CHAVE_LOCK_LIVE = 'ws_live_em_andamento_lock';
const VERSAO_DESTE_BUNDLE = typeof __APP_BUILD_VERSION__ !== 'undefined' ? String(__APP_BUILD_VERSION__) : null;

let swRegistrationGlobal = null;
let versaoRemotaDetetada = null;
let atualizacaoEmCurso = false;
let atualizacaoAguardandoFimDeAula = false;
let sinalLiveRecebidoDoIframe = false;

// 1. Grava a versão deste bundle JS caso ainda não exista no aparelho
if (VERSAO_DESTE_BUNDLE) {
    const salva = localStorage.getItem(CHAVE_VERSAO_LOCAL);
    if (!salva) {
        localStorage.setItem(CHAVE_VERSAO_LOCAL, VERSAO_DESTE_BUNDLE);
    }
}

// 🛡️ DETETOR BLINDADO DE AULA AO VIVO OU PROVA (Nunca expulsa professor nem aluno!)
function utilizadorEmAtividadeCriticaAoVivo() {
    try {
        // 1. Verifica se está em prova escrita ou teste oral ativo no WorkSpace
        if (window.Workspace && window.Workspace.Avaliacoes) {
            if (window.Workspace.Avaliacoes.exameAtivo || window.Workspace.Avaliacoes.estudioAtivo) {
                return true;
            }
        }

        // 2. Verifica o modal da plataforma PlayClass & Meet
        const modalVideo = document.getElementById('ws-modal-video-aulas');
        const iframeVideo = document.getElementById('iframeVideoAulas');
        const modalAberto = Boolean(modalVideo && modalVideo.style.display !== 'none');

        if (!modalAberto) {
            sinalLiveRecebidoDoIframe = false;
            return false;
        }

        // 2a. Se o modal estiver minimizado em PiP navegando pelo WorkSpace, há uma live ativa!
        if (modalVideo.dataset.minimizado === 'true') {
            return true;
        }

        // 2b. Se o iframe reportou recentemente via postMessage que há live/portaria/gravação ativa
        if (sinalLiveRecebidoDoIframe) {
            return true;
        }

        // 2c. Verifica o carimbo recente em sessionStorage (renovado a cada 2s durante a live)
        const lockRaw = sessionStorage.getItem(CHAVE_LOCK_LIVE);
        if (lockRaw) {
            const lockData = JSON.parse(lockRaw);
            if (lockData && lockData.ativa && (Date.now() - Number(lockData.ts || 0) < 12000)) {
                return true;
            }
        }

        // 2d. Inspeção direta dentro do iframe (tela cheia, PiP interno, PiP externo, Estúdio, WebRTC ou Gravação)
        if (iframeVideo && iframeVideo.contentWindow) {
            const win = iframeVideo.contentWindow;
            const body = win.document?.body;
            const viewLive = win.document?.getElementById('view-live');

            const emModoLive = Boolean(
                body?.classList?.contains('modo-cinema-live') ||
                body?.classList?.contains('modo-minimizado-pip') ||
                body?.classList?.contains('modo-pip-interno')
            );
            const abaLiveVisivel = Boolean(viewLive && viewLive.style.display === 'block');
            const liveNoObjeto = Boolean(win.liveAtivaObj && win.liveAtivaObj.ativa);
            const protecaoExplicita = Boolean(win.__liveProtegidaAtiva);

            if (emModoLive || abaLiveVisivel || liveNoObjeto || protecaoExplicita) {
                return true;
            }
        }
    } catch (e) {}
    return false;
}

// 📡 Escuta o iframe avisando quando a Live começa ou termina
window.addEventListener('message', (ev) => {
    const d = ev.data;
    if (!d || typeof d !== 'object') return;

    if (d.type === 'LIVE_PROTECAO_ATUALIZACAO') {
        sinalLiveRecebidoDoIframe = Boolean(d.ativa);
        // Assim que a Live terminar ou o aluno sair da chamada, aplica a atualização que ficou guardada!
        if (!sinalLiveRecebidoDoIframe && atualizacaoAguardandoFimDeAula && !atualizacaoEmCurso) {
            setTimeout(() => {
                if (!utilizadorEmAtividadeCriticaAoVivo() && atualizacaoAguardandoFimDeAula) {
                    atualizacaoAguardandoFimDeAula = false;
                    dispararAtualizacaoForcadaImediata();
                }
            }, 1200);
        }
    }
});

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

// 2. Quando um novo Service Worker assume o controlo, só recarrega se NÃO houver live ativa
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (utilizadorEmAtividadeCriticaAoVivo()) {
            atualizacaoAguardandoFimDeAula = true;
            console.log("🛡️ Atualização segurada em segundo plano porque há uma Aula Ao Vivo ativa.");
            return;
        }
        if (atualizacaoEmCurso) {
            forcarRecarregamentoLimpo();
        }
    });
}

// 🚀 3. Registo do PWA controlado 100% pelo nosso motor
const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
        console.log("🔄 Nova versão disponível em segundo plano!");
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

    // Se havia atualização guardada e a aula ao vivo já acabou, aplica agora!
    if (atualizacaoAguardandoFimDeAula && !utilizadorEmAtividadeCriticaAoVivo()) {
        atualizacaoAguardandoFimDeAula = false;
        dispararAtualizacaoForcadaImediata();
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
            const ultimaTentativa = sessionStorage.getItem(CHAVE_TENTATIVA_RELOAD);
            if (ultimaTentativa === versaoServidor) {
                localStorage.setItem(CHAVE_VERSAO_LOCAL, versaoServidor);
                return;
            }
            dispararAtualizacaoForcadaImediata();
        } else {
            localStorage.setItem(CHAVE_VERSAO_LOCAL, versaoServidor);
            sessionStorage.removeItem(CHAVE_TENTATIVA_RELOAD);
        }
    } catch (e) {}
}

// ⚡ Decide se aplica imediatamente ou segura silenciosamente até a Live acabar
function dispararAtualizacaoForcadaImediata() {
    if (atualizacaoEmCurso) return;
    if (utilizadorEmAtividadeCriticaAoVivo()) {
        atualizacaoAguardandoFimDeAula = true;
        console.log("🛡️ Nova versão detetada — aguardando o término da Aula Ao Vivo para aplicar sem expulsar ninguém.");
        return;
    }
    mostrarBannerAtualizacaoAutomatica();
    setTimeout(() => {
        executarAtualizacaoProfunda();
    }, 900);
}

// 📡 5. GATILHOS DE VERIFICAÇÃO EM TEMPO REAL
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

// 🔄 Recarregamento limpo com última barreira anti-expulsão
async function forcarRecarregamentoLimpo() {
    if (utilizadorEmAtividadeCriticaAoVivo()) {
        atualizacaoEmCurso = false;
        atualizacaoAguardandoFimDeAula = true;
        const banner = document.getElementById('global-pwa-update-prompt');
        if (banner) banner.remove();
        return;
    }

    try {
        await fetch(window.location.href, {
            method: 'GET',
            cache: 'reload',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            }
        }).catch(() => {});
    } catch (e) {}

    if (utilizadorEmAtividadeCriticaAoVivo()) {
        atualizacaoEmCurso = false;
        atualizacaoAguardandoFimDeAula = true;
        return;
    }
    window.location.reload();
}

// 🧹 6. EXECUTOR DE ATUALIZAÇÃO PROFUNDA (Apenas quando NÃO há Live ativa)
async function executarAtualizacaoProfunda() {
    if (atualizacaoEmCurso) return;

    // 🛡️ Segunda barreira de segurança antes de limpar caches ou recarregar
    if (utilizadorEmAtividadeCriticaAoVivo()) {
        atualizacaoAguardandoFimDeAula = true;
        const banner = document.getElementById('global-pwa-update-prompt');
        if (banner) banner.remove();
        return;
    }

    atualizacaoEmCurso = true;
    salvarRascunhosAntesDeAtualizar();

    try {
        const versaoAlvo = versaoRemotaDetetada || VERSAO_DESTE_BUNDLE || String(Date.now());
        localStorage.setItem(CHAVE_VERSAO_LOCAL, versaoAlvo);
        sessionStorage.setItem(CHAVE_TENTATIVA_RELOAD, versaoAlvo);

        // 1. Manda o Service Worker em espera assumir agora que a aula não está ativa
        if (swRegistrationGlobal && swRegistrationGlobal.waiting) {
            swRegistrationGlobal.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        try {
            updateSW(true);
        } catch (e) {}

        // 2. Apaga caches antigas para garantir 100% os ficheiros novos
        if ('caches' in window) {
            const chavesCache = await caches.keys();
            await Promise.all(chavesCache.map(chave => caches.delete(chave)));
        }

        // 3. Atualiza registos do Service Worker
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

export function mostrarBannerAtualizacaoAutomatica() {
    if (utilizadorEmAtividadeCriticaAoVivo()) return;
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