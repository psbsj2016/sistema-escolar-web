// js/workspace.js
import { CONFIG } from './config.js';

// Importa os novos módulos do Workspace
import './modulos/workspace/feed.js';
import './modulos/workspace/upload.js';

window.Workspace = window.Workspace || {};
const Workspace = window.Workspace;

Object.assign(Workspace, {
    usuario: null,

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
        
        const cacheUser = localStorage.getItem('usuario_logado');
        if (!cacheUser) {
            alert("A sua sessão expirou. Por favor, faça login novamente.");
            window.location.href = '/';
            return;
        }
        Workspace.usuario = JSON.parse(cacheUser);
        
        const nomeEl = document.getElementById('ws-user-name');
        const avatarEl = document.getElementById('ws-user-avatar');
        if (nomeEl) nomeEl.innerText = Workspace.usuario.nome || Workspace.usuario.login;
        if (avatarEl) avatarEl.innerText = (Workspace.usuario.nome || Workspace.usuario.login).charAt(0).toUpperCase();

        const boxCriarPost = document.getElementById('ws-criar-post');
        if (boxCriarPost && ['Gestor', 'Professor', 'Secretaria'].includes(Workspace.usuario.tipo)) {
            boxCriarPost.style.display = 'block';
        }

        // 🚀 Liga os motores secundários que acabámos de criar
        if (Workspace.Feed) await Workspace.Feed.init();
        if (Workspace.Upload) Workspace.Upload.init();
    }
});

document.addEventListener('DOMContentLoaded', Workspace.init);