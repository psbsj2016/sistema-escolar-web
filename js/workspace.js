// js/workspace.js
import { CONFIG } from './config.js';

// Criação do Escopo Isolado do Workspace
window.Workspace = window.Workspace || {};
const Workspace = window.Workspace;

Object.assign(Workspace, {
    usuario: null,

    // Motor de API independente, blindado com credenciais
    api: async (endpoint, method = 'GET', body = null) => {
        const options = { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include' };
        if (body) options.body = JSON.stringify(body);
        try {
            const res = await fetch(`/api${endpoint}`, options);
            if (!res.ok) throw new Error('Falha na resposta do servidor');
            return await res.json();
        } catch (e) {
            console.error(`❌ Erro API Workspace [${endpoint}]:`, e);
            return null;
        }
    },

    init: async () => {
        console.log("🚀 A iniciar o Motor do Workspace...");
        
        // 1. Validar Sessão Segura
        const cacheUser = localStorage.getItem('usuario_logado');
        if (!cacheUser) {
            alert("A sua sessão expirou. Por favor, faça login novamente.");
            window.location.href = '/';
            return;
        }
        Workspace.usuario = JSON.parse(cacheUser);
        
        // 2. Renderizar Interface Base
        const nomeEl = document.getElementById('ws-user-name');
        const avatarEl = document.getElementById('ws-user-avatar');
        
        if (nomeEl) nomeEl.innerText = Workspace.usuario.nome || Workspace.usuario.login;
        if (avatarEl) avatarEl.innerText = (Workspace.usuario.nome || Workspace.usuario.login).charAt(0).toUpperCase();

        // 3. Controle de Permissões: O aluno não pode criar posts mestres, só o professor/gestor
        const boxCriarPost = document.getElementById('ws-criar-post');
        if (boxCriarPost && ['Gestor', 'Professor', 'Secretaria'].includes(Workspace.usuario.tipo)) {
            boxCriarPost.style.display = 'block';
        }

        // 4. Daqui para a frente, iremos carregar os ficheiros divididos (Feed, Uploads, etc)
        document.getElementById('ws-posts-area').innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <span style="font-size:30px;">🌟</span><br>
                Bem-vindo ao Workspace!<br><small>O motor do feed será ligado em breve.</small>
            </div>
        `;
    }
});

// Arranca o sistema quando a página carrega
document.addEventListener('DOMContentLoaded', Workspace.init);