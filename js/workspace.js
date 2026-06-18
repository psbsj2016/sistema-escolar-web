// js/workspace.js
import { CONFIG } from './config.js';

// Importa os módulos do Workspace
import './modulos/workspace/feed.js';
import './modulos/workspace/upload.js';
import './modulos/workspace/alertas.js'; 
import './modulos/workspace/sidebar.js';

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
        
        // 1. Validar Sessão Específica do Workspace
        // Repare que usamos 'ws_usuario_logado' em vez do login normal do gestor
        const cacheUser = localStorage.getItem('ws_usuario_logado');
        
        if (!cacheUser) {
            // Se não estiver logado: Mostra o formulário de login, esconde o portal
            document.getElementById('ws-login-screen').style.display = 'flex';
            document.getElementById('ws-navbar').style.display = 'none';
            document.getElementById('ws-main-container').style.display = 'none';
            return;
        }
        
        // Se estiver logado, recuperamos os dados
        Workspace.usuario = JSON.parse(cacheUser);
        
        // Entrou com sucesso! Esconde o login e mostra o portal do aluno
        document.getElementById('ws-login-screen').style.display = 'none';
        document.getElementById('ws-navbar').style.display = 'flex';
        document.getElementById('ws-main-container').style.display = 'grid';

        const nomeEl = document.getElementById('ws-user-name');
        const avatarEl = document.getElementById('ws-user-avatar');
        if (nomeEl) nomeEl.innerText = Workspace.usuario.nome || Workspace.usuario.login;
        if (avatarEl) avatarEl.innerText = (Workspace.usuario.nome || Workspace.usuario.login).charAt(0).toUpperCase();

        const boxCriarPost = document.getElementById('ws-criar-post');
        if (boxCriarPost && ['Gestor', 'Professor', 'Secretaria'].includes(Workspace.usuario.tipo)) {
            boxCriarPost.style.display = 'block';
        }

        // 🚀 Liga todos os motores secundários!
        if (Workspace.Feed) await Workspace.Feed.init();
        if (Workspace.Upload) Workspace.Upload.init();
        if (Workspace.Alertas) Workspace.Alertas.init(); 
        if (Workspace.Sidebar) await Workspace.Sidebar.init();
    },

    fazerLogin: async () => {
        const login = document.getElementById('ws-login-user').value.trim();
        const pass = document.getElementById('ws-login-pass').value.trim();
        if(!login || !pass) return alert("Preencha utilizador e senha");

        const btn = document.querySelector('#ws-login-screen button');
        const txt = btn.innerText; 
        btn.innerText = "A autenticar... ⏳"; 
        btn.disabled = true;

        try {
            // Usa a API do sistema para fazer o login
            const res = await Workspace.api('/auth/login', 'POST', { login: login, senha: pass, deviceId: 'ws_web' });
            
            if(res && res.success) {
                // Se estiver correto, salva no localStorage como "ws_usuario_logado"
                localStorage.setItem('ws_usuario_logado', JSON.stringify(res.usuario));
                Workspace.init(); // Arranca a plataforma do Workspace!
            } else {
                alert(res.error || "Login ou senha incorretos");
            }
        } catch(e) {
            alert("Erro de comunicação com o servidor.");
        } finally {
            btn.innerText = txt; 
            btn.disabled = false;
        }
    },

    // 👤 LÓGICA DO MEU PERFIL
    abrirPerfil: () => {
        document.getElementById('ws-perfil-modal').style.display = 'flex';
        document.getElementById('ws-perfil-nome').innerText = Workspace.usuario.nome || Workspace.usuario.login;
        document.getElementById('ws-perfil-login').innerText = `@${Workspace.usuario.login}`;
        document.getElementById('ws-perfil-avatar-preview').innerText = (Workspace.usuario.nome || Workspace.usuario.login).charAt(0).toUpperCase();
        document.getElementById('ws-perfil-senha').value = '';
    },

    salvarPerfil: async () => {
        const senha = document.getElementById('ws-perfil-senha').value.trim();
        if (!senha) {
            alert("Digite uma nova senha para atualizar.");
            return;
        }
        if (senha.length < 6) {
            alert("A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        const btn = document.querySelector('.btn-salvar-perfil');
        const txt = btn.innerText;
        btn.innerText = "A guardar... ⏳";
        btn.disabled = true;

        try {
            // Envia a nova senha para o backend usando o ID do utilizador logado
            const res = await Workspace.api('/workspace/perfil', 'PUT', { 
                id: Workspace.usuario.id,
                senha: senha 
            });

            if (res && res.success) {
                alert("✅ Senha atualizada com sucesso!");
                document.getElementById('ws-perfil-modal').style.display = 'none';
            } else {
                alert(res.error || "Erro ao atualizar perfil.");
            }
        } catch (e) {
            alert("Erro de comunicação com o servidor.");
        } finally {
            btn.innerText = txt;
            btn.disabled = false;
        }
    },

    logout: async () => {
        if (Workspace.Alertas && Workspace.Alertas.radar) clearInterval(Workspace.Alertas.radar);
        localStorage.removeItem('ws_usuario_logado');
        window.location.reload(); // Recarrega a página para voltar a exibir a tela de login
    }
});

// Dá ordem de arranque assim que a página carrega
document.addEventListener('DOMContentLoaded', Workspace.init);