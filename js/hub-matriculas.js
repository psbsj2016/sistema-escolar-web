// 🚀 CORREÇÃO 2: O import fica obrigatoriamente na linha 1 do script
import './pwa-updater.js';

const urlParams = new URLSearchParams(window.location.search);
const escolaId = urlParams.get('escola');
const API_BASE = '/api';

// 🚀 FORÇAR ATUALIZAÇÃO DE CACHE
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let registration of registrations) { registration.update(); }
    });
}

async function carregarHubPersonalizado() {
    if (!escolaId) {
        document.body.innerHTML = "<h2 style='text-align:center; padding:50px; color:red;'>Link da instituição inválido.</h2>";
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/public/escola/${escolaId}?v=${new Date().getTime()}`);
        if (!res.ok) throw new Error("Escola não encontrada");

        const dados = await res.json();
        const configHub = dados.configHub || {};

        // 1. Aplica Textos do Topo
        if (configHub.tituloHeader) document.getElementById('hub-titulo').innerText = configHub.tituloHeader;
        if (configHub.descHeader) document.getElementById('hub-desc').innerText = configHub.descHeader;

        // 2. Aplica Cartão Presencial
        if (configHub.iconePresencial) document.getElementById('hub-icone-presencial').innerText = configHub.iconePresencial;
        if (configHub.tituloPresencial) document.getElementById('hub-tit-presencial').innerText = configHub.tituloPresencial;
        if (configHub.descPresencial) document.getElementById('hub-desc-presencial').innerText = configHub.descPresencial;
        if (configHub.btnPresencial) document.getElementById('hub-btn-presencial').innerText = configHub.btnPresencial;

        // 3. Aplica Cartão Online
        if (configHub.iconeOnline) document.getElementById('hub-icone-online').innerText = configHub.iconeOnline;
        if (configHub.tituloOnline) document.getElementById('hub-tit-online').innerText = configHub.tituloOnline;
        if (configHub.descOnline) document.getElementById('hub-desc-online').innerText = configHub.descOnline;
        if (configHub.btnOnline) document.getElementById('hub-btn-online').innerText = configHub.btnOnline;

        // 4. Monta os links e aplica o Bloqueador de Exibição (Presencial / Online / Ambos)
        const paramsString = window.location.search;
        const cardPresencial = document.getElementById("link-presencial");
        const cardOnline = document.getElementById("link-online");
        const containerCards = document.querySelector(".cards-container");

        const bloqPres = Boolean(configHub.bloquearPresencial);
        const bloqOn = Boolean(configHub.bloquearOnline);

       if (cardPresencial) {
            cardPresencial.href = "/matricula" + paramsString;
            cardPresencial.style.display = bloqPres ? 'none' : 'flex';
        }
        if (cardOnline) {
            cardOnline.href = "/matricula-online" + paramsString;
            cardOnline.style.display = bloqOn ? 'none' : 'flex';
        }

        const avisoAntigo = document.getElementById('hub-aviso-bloqueado');
        if (avisoAntigo) avisoAntigo.remove();

        if (bloqPres && bloqOn && containerCards) {
            const aviso = document.createElement('div');
            aviso.id = 'hub-aviso-bloqueado';
            aviso.style.cssText = 'background:#ffffff; border:2px dashed #fca5a5; border-radius:20px; padding:40px 30px; max-width:520px; width:100%; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.06); box-sizing:border-box;';
            aviso.innerHTML = `
                <div style="font-size:56px; margin-bottom:14px;">🔒</div>
                <h2 style="color:#b91c1c; margin:0 0 12px 0; font-size:1.5rem;">Matrículas Temporariamente Encerradas</h2>
                <p style="color:#666; font-size:0.98rem; line-height:1.6; margin:0;">
                    No momento não há modalidades abertas para novas matrículas. Por favor, entre em contato com a secretaria da instituição para mais informações.
                </p>
            `;
            containerCards.appendChild(aviso);
        }

        // 5. Esconde o Loading e mostra o ecrã!
        document.getElementById('loading-tela').style.display = 'none';
        document.getElementById('conteudo-hub').style.display = 'flex';

    } catch (error) {
        console.error("Erro:", error);
        document.body.innerHTML = `
            <div style="text-align:center; padding:40px 20px;">
                <div style="font-size:50px; margin-bottom:15px;">⚠️</div>
                <h2 style="color:#c0392b;">Link inválido</h2>
                <p style="color:#666;">Não foi possível carregar a vitrine desta instituição.</p>
            </div>
        `;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    carregarHubPersonalizado();

    // 📡 Atualiza o Hub em tempo real se o gestor alterar os bloqueios no painel
    if (escolaId) {
        try {
            const sse = new EventSource(`${API_BASE}/public/stream-matricula/${escolaId}`);
            sse.onmessage = (event) => {
                try {
                    const dados = JSON.parse(event.data);
                    if (dados.type === 'RELOAD') carregarHubPersonalizado();
                } catch (e) {}
            };
        } catch (e) {}
    }
});