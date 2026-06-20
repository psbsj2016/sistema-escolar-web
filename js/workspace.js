// js/workspace.js
import { CONFIG } from './config.js';

import './modulos/workspace/feed.js';
import './modulos/workspace/upload.js';
import './modulos/workspace/alertas.js'; 
import './modulos/workspace/sidebar.js';

window.Workspace = window.Workspace || {};
const Workspace = window.Workspace;

Object.assign(Workspace, {
    usuario: null,
    avatarsCache: {}, // 🧠 Memória global de fotos da escola

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
        const cacheUser = localStorage.getItem('ws_usuario_logado');
        if (!cacheUser) {
            document.getElementById('ws-login-screen').style.display = 'flex';
            document.getElementById('ws-navbar').style.display = 'none';
            document.getElementById('ws-main-container').style.display = 'none';
            return;
        }
        
        Workspace.usuario = JSON.parse(cacheUser);
        
        document.getElementById('ws-login-screen').style.display = 'none';
        document.getElementById('ws-navbar').style.display = 'flex';
        document.getElementById('ws-main-container').style.display = 'grid';

        const boxCriarPost = document.getElementById('ws-criar-post');
        if (boxCriarPost && ['Gestor', 'Professor', 'Secretaria'].includes(Workspace.usuario.tipo)) {
            boxCriarPost.style.display = 'block';
        }

        // 📸 Carrega as fotos de todo o mundo numa fração de segundo
        Workspace.avatarsCache = await Workspace.api('/workspace/avatars', 'GET') || {};
        Workspace.avatarsCache[Workspace.usuario.nome || Workspace.usuario.login] = Workspace.usuario.avatar;

        if (Workspace.Feed) await Workspace.Feed.init();
        if (Workspace.Upload) Workspace.Upload.init();
        if (Workspace.Alertas) Workspace.Alertas.init(); 
        if (Workspace.Sidebar) await Workspace.Sidebar.init(); 

        document.addEventListener('click', (e) => {
            const menuContainer = document.getElementById('ws-menu-left-container');
            const menuDropdown = document.getElementById('ws-main-menu-dropdown');
            if (menuContainer && menuDropdown && !menuContainer.contains(e.target)) {
                menuDropdown.style.display = 'none';
            }
        });
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
            const res = await Workspace.api('/auth/login', 'POST', { login: login, senha: pass, deviceId: 'ws_web' });
            if(res && res.success) {
                localStorage.setItem('ws_usuario_logado', JSON.stringify(res.usuario));
                Workspace.init(); 
            } else alert(res.error || "Login ou senha incorretos");
        } catch(e) { alert("Erro de comunicação."); } 
        finally { btn.innerText = txt; btn.disabled = false; }
    },

    // ==========================================
    // 🎨 MOTOR DE AVATARES GLOBAIS
    // ==========================================
    renderizarAvatar: (nomeAutor, tamanho = 40) => {
        const nomeStr = nomeAutor || 'Desconhecido';
        const url = Workspace.avatarsCache[nomeStr];
        
        if (url) {
            return `<img src="${url}" style="width:${tamanho}px; height:${tamanho}px; min-width:${tamanho}px; border-radius:50%; object-fit:cover; border:2px solid #eee; box-shadow:0 2px 5px rgba(0,0,0,0.05); background:#fff;">`;
        } else {
            const letra = nomeStr.charAt(0).toUpperCase();
            return `<div style="width:${tamanho}px; height:${tamanho}px; min-width:${tamanho}px; border-radius:50%; background:#3498db; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:${tamanho/2.2}px; border:2px solid #eee; box-shadow:0 2px 5px rgba(0,0,0,0.05);">${letra}</div>`;
        }
    },

    // ==========================================
    // 🍔 MESTRE DO MENU HAMBÚRGUER
    // ==========================================
    toggleMenuPrincipal: () => {
        const dropdown = document.getElementById('ws-main-menu-dropdown');
        if (!dropdown) return;
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    },

    toggleMenuChat: () => {
        const subMenu = document.getElementById('ws-lista-turmas-menu');
        if (!subMenu) return;
        if (subMenu.style.display === 'none') {
            subMenu.style.display = 'block';
            if (Workspace.Sidebar) Workspace.Sidebar.carregarTurmas();
        } else subMenu.style.display = 'none';
    },

    abrirModalPerfil: () => {
        document.getElementById('ws-main-menu-dropdown').style.display = 'none'; 
        document.getElementById('ws-perfil-modal').style.display = 'flex'; 
        
        const nome = Workspace.usuario.nome || Workspace.usuario.login;
        document.getElementById('ws-perfil-modal-nome').innerText = nome;
        document.getElementById('ws-perfil-modal-login').innerText = `@${Workspace.usuario.login}`;

        const imgEl = document.getElementById('ws-perfil-img');
        const letrasEl = document.getElementById('ws-perfil-letras');

        if (Workspace.usuario.avatar) {
            imgEl.src = Workspace.usuario.avatar;
            imgEl.style.display = 'block';
            letrasEl.style.display = 'none';
        } else {
            imgEl.style.display = 'none';
            letrasEl.style.display = 'flex';
            letrasEl.innerText = nome.charAt(0).toUpperCase();
        }
    },

    uploadAvatar: async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) return alert("A imagem é muito pesada. Escolha uma foto até 5MB.");

        const loading = document.getElementById('ws-avatar-loading');
        loading.style.display = 'block';

        try {
            const formData = new FormData();
            formData.append('anexos', file);

            const uploadRes = await fetch('/api/workspace/upload', { method: 'POST', credentials: 'include', body: formData });
            const uploadData = await uploadRes.json();
            
            if (!uploadData.success || !uploadData.anexos || uploadData.anexos.length === 0) throw new Error("Falha no envio.");
            const novaFotoUrl = uploadData.anexos[0].url;

            const res = await Workspace.api('/workspace/perfil/avatar', 'PUT', { 
                id: Workspace.usuario.id,
                alunoRefId: Workspace.usuario.alunoRefId,
                avatarUrl: novaFotoUrl
            });

            if (res && res.success) {
                Workspace.usuario.avatar = novaFotoUrl;
                localStorage.setItem('ws_usuario_logado', JSON.stringify(Workspace.usuario));
                Workspace.avatarsCache[Workspace.usuario.nome || Workspace.usuario.login] = novaFotoUrl;

                Workspace.abrirModalPerfil(); 
                
                // Recarrega ecrãs em tempo real
                if (Workspace.Feed) Workspace.Feed.carregarPosts();
                if (Workspace.Sidebar && Workspace.Sidebar.turmaIdAberta) Workspace.Sidebar.carregarMensagensChat();
            }
        } catch (e) { alert("Falha ao guardar a foto. Tente novamente."); } 
        finally { loading.style.display = 'none'; event.target.value = ''; }
    },

    // ==========================================
    // 📝 PÁGINA DE TAREFAS (ROTEADOR DE PERFIS)
    // ==========================================
    abrirPaginaTarefas: () => {
        document.getElementById('ws-main-menu-dropdown').style.display = 'none'; 
        document.getElementById('ws-main-container').style.display = 'none'; 
        document.getElementById('ws-config-container').style.display = 'none'; 

        // 🛡️ DESVIO DE TRÁFEGO: Aluno vs Professor
        if (Workspace.usuario.tipo === 'Aluno') {
            document.getElementById('ws-tarefas-professor-container').style.display = 'none';
            document.getElementById('ws-tarefas-container').style.display = 'block';
            if (Workspace.Sidebar) Workspace.Sidebar.carregarTarefas();
        } else {
            // Professor, Gestor ou Secretaria
            document.getElementById('ws-tarefas-container').style.display = 'none';
            document.getElementById('ws-tarefas-professor-container').style.display = 'block';
            if (Workspace.Sidebar) Workspace.Sidebar.voltarMenuTarefasProf(); // Reseta para os dois botões
        }
    },

    abrirConfiguracoes: () => {
        document.getElementById('ws-main-menu-dropdown').style.display = 'none';
        document.getElementById('ws-main-container').style.display = 'none';
        
        // Esconde tarefas de quem quer que seja
        const tProf = document.getElementById('ws-tarefas-professor-container');
        const tAlun = document.getElementById('ws-tarefas-container');
        if(tProf) tProf.style.display = 'none';
        if(tAlun) tAlun.style.display = 'none';

        document.getElementById('ws-config-container').style.display = 'block';
    },

    abrirModalSenha: () => {
        document.getElementById('ws-senha-modal').style.display = 'flex';
        document.getElementById('ws-senha-atual').value = '';
        document.getElementById('ws-nova-senha').value = '';
        document.getElementById('ws-confirma-senha').value = '';
    },

    salvarNovaSenha: async () => {
        // ... (Mantém a sua lógica intacta)
        const senhaAtual = document.getElementById('ws-senha-atual').value;
        const novaSenha = document.getElementById('ws-nova-senha').value.trim();
        const confirmaSenha = document.getElementById('ws-confirma-senha').value.trim();
        if (!senhaAtual || !novaSenha || !confirmaSenha) return alert("Preencha todos os campos.");
        if (novaSenha !== confirmaSenha) return alert("A nova senha e a confirmação não coincidem.");
        const btn = document.getElementById('ws-btn-salvar-senha');
        const txt = btn.innerText; btn.innerText = "⏳ A gravar..."; btn.disabled = true;
        try {
            const res = await Workspace.api('/workspace/perfil', 'PUT', { id: Workspace.usuario.id, senhaAtual, novaSenha });
            if (res && res.success) {
                alert("✅ Senha atualizada com sucesso! Por favor, entre novamente.");
                document.getElementById('ws-senha-modal').style.display = 'none';
                Workspace.logout();
            } else alert(res.error || "Erro ao atualizar a senha.");
        } catch (e) { alert("Erro de comunicação."); } finally { btn.innerText = txt; btn.disabled = false; }
    },

    voltarAoFeed: () => {
        const dropdown = document.getElementById('ws-main-menu-dropdown');
        const modalChat = document.getElementById('ws-chat-modal');
        const configPage = document.getElementById('ws-config-container');
        const tarefasPage = document.getElementById('ws-tarefas-container');
        const tarefasProfPage = document.getElementById('ws-tarefas-professor-container');
        
        if (dropdown) dropdown.style.display = 'none';
        if (modalChat) modalChat.style.display = 'none';
        if (configPage) configPage.style.display = 'none';
        if (tarefasPage) tarefasPage.style.display = 'none'; 
        if (tarefasProfPage) tarefasProfPage.style.display = 'none'; 
        
        document.getElementById('ws-main-container').style.display = 'block'; 
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    logout: async () => {
        if (Workspace.Alertas && Workspace.Alertas.radar) clearInterval(Workspace.Alertas.radar);
        localStorage.removeItem('ws_usuario_logado');
        window.location.reload(); 
    }
});

document.addEventListener('DOMContentLoaded', Workspace.init);