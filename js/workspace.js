// js/workspace.js
import { CONFIG } from './config.js';

// 🌟 IMPORTAÇÃO CORRETA PARA O VITE
import './toast.js'; 

import './modulos/workspace/feed.js';
import './modulos/workspace/upload.js';
import './modulos/workspace/alertas.js'; 
import './modulos/workspace/sidebar.js';

window.Workspace = window.Workspace || {};
const Workspace = window.Workspace;

Object.assign(Workspace, {
    usuario: null,
    avatarsCache: {}, 
    deferredPrompt: null, // 🧠 Guarda o evento de instalação para disparar quando quisermos

    mostrarAviso: (mensagem, tipo = 'info') => {
        if (window.Toast && typeof window.Toast.show === 'function') {
            window.Toast.show(mensagem, tipo);
        } else {
            alert(mensagem); 
        }
    },

    api: async (endpoint, method = 'GET', body = null) => {
        const options = { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include' };
        if (body) options.body = JSON.stringify(body);
        
        try {
            const res = await fetch(`/api${endpoint}`, options);
            
            if (res.status === 401 && endpoint !== '/auth/login') {
                Workspace.mostrarAviso("A sua sessão expirou por segurança. Faça login novamente.", "warning");
                Workspace.logout(true); 
                return null;
            }
            
            if (!res.ok) throw new Error('Falha na resposta do servidor');
            return await res.json();
        } catch (e) {
            console.error(`❌ Erro API Workspace [${endpoint}]:`, e);
            return null;
        }
    },

    gerarCorPorNome: (nome) => {
        const cores = [
            '#e74c3c', '#8e44ad', '#2980b9', '#27ae60', '#f39c12', 
            '#d35400', '#c0392b', '#16a085', '#34495e', '#ff5252'
        ];
        let hash = 0;
        for (let i = 0; i < nome.length; i++) {
            hash = nome.charCodeAt(i) + ((hash << 5) - hash);
        }
        hash = Math.abs(hash);
        return cores[hash % cores.length];
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
        
        Workspace.navegarPara('feed', true);

        const boxCriarPost = document.getElementById('ws-criar-post');
        if (boxCriarPost && ['Gestor', 'Professor', 'Secretaria'].includes(Workspace.usuario.tipo)) {
            boxCriarPost.style.display = 'block';
        }

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

        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.tela) {
                Workspace.navegarPara(e.state.tela, false); 
            } else {
                Workspace.navegarPara('feed', false);
            }
        });

        // 🧠 OUVINTES PWA: Captura o pop-up de instalação nativo e customiza-o
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault(); // Impede o navegador de agir de forma silenciosa
            Workspace.deferredPrompt = e; // Guarda o evento na nossa memória
            
            // Se o utilizador já tiver a App instalada, não mostra nada
            if (window.matchMedia('(display-mode: standalone)').matches) return;

            // Mostra o pop-up premium de instalação na interface
            Workspace.injetarPopUpInstalacao();
        });

        window.addEventListener('appinstalled', () => {
            Workspace.deferredPrompt = null;
            const banner = document.getElementById('ws-pwa-install-banner');
            if (banner) banner.remove();
            Workspace.mostrarAviso("Aplicação Workspace instalada com sucesso! 🎉", "success");
        });
    },

    // 🖥️ INOVAÇÃO: Injeta dinamicamente um aviso elegante estilo Pop-up de App
    injetarPopUpInstalacao: () => {
        if (document.getElementById('ws-pwa-install-banner')) return;

        const banner = document.createElement('div');
        banner.id = 'ws-pwa-install-banner';
        banner.style.cssText = "position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: #2c3e50; color: white; padding: 12px 24px; border-radius: 30px; display: flex; align-items: center; gap: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); z-index: 10009; font-family: sans-serif; font-size: 13px; font-weight: 600; width: max-content; max-width: 90vw; animation: fadeIn 0.4s ease;";
        
        banner.innerHTML = `
            <span>📱 Gostaria de instalar a App do Workspace no ecrã principal?</span>
            <div style="display: flex; gap: 8px;">
                <button id="ws-pwa-btn-instalar" style="background: #3498db; color: white; border: none; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: bold; cursor: pointer; transition: 0.2s;">Instalar</button>
                <button id="ws-pwa-btn-fechar" style="background: transparent; color: #bbb; border: none; cursor: pointer; font-size: 16px; padding: 0 5px;">&times;</button>
            </div>
        `;
        
        document.body.appendChild(banner);

        document.getElementById('ws-pwa-btn-instalar').addEventListener('click', async () => {
            if (!Workspace.deferredPrompt) return;
            
            // Abre o prompt oficial do sistema operativo (Android/iOS/Windows)
            Workspace.deferredPrompt.prompt();
            
            const { outcome } = await Workspace.deferredPrompt.userChoice;
            console.log(`Utilizador escolheu: ${outcome}`);
            
            Workspace.deferredPrompt = null;
            banner.remove();
        });

        document.getElementById('ws-pwa-btn-fechar').addEventListener('click', () => {
            banner.remove();
        });
    },

    navegarPara: (tela, registarNoHistorico = true) => {
        const dropdown = document.getElementById('ws-main-menu-dropdown');
        if (dropdown) dropdown.style.display = 'none';
        const modalChat = document.getElementById('ws-chat-modal');
        if (modalChat) modalChat.style.display = 'none';

        const ecras = {
            'feed': 'ws-main-container',
            'configuracoes': 'ws-config-container',
            'tarefas_aluno': 'ws-tarefas-container',
            'tarefas_prof': 'ws-tarefas-professor-container',
            'perfil': 'ws-perfil-modal' 
        };

        if (tela === 'tarefas') {
            tela = Workspace.usuario.tipo === 'Aluno' ? 'tarefas_aluno' : 'tarefas_prof';
        }

        Object.values(ecras).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        const ecraAtivo = document.getElementById(ecras[tela]);
        if (ecraAtivo) {
            if (tela === 'feed') ecraAtivo.style.display = 'grid';
            else if (tela === 'perfil') ecraAtivo.style.display = 'flex';
            else ecraAtivo.style.display = 'block';
            
            ecraAtivo.style.animation = 'fadeIn 0.3s ease-out';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        if (tela === 'tarefas_aluno' && Workspace.Sidebar) Workspace.Sidebar.carregarTarefas();
        if (tela === 'tarefas_prof' && Workspace.Sidebar) Workspace.Sidebar.voltarMenuTarefasProf();

        if (registarNoHistorico) {
            history.pushState({ tela: tela }, '', `#${tela.replace('_', '-')}`);
        }
    },

    fazerLogin: async () => {
        const login = document.getElementById('ws-login-user').value.trim();
        const pass = document.getElementById('ws-login-pass').value.trim();
        
        if(!login || !pass) return Workspace.mostrarAviso("Preencha utilizador e senha", "warning");

        const btn = document.querySelector('#ws-login-screen button');
        const txt = btn.innerText; 
        btn.innerText = "A autenticar... ⏳"; 
        btn.disabled = true;

        try {
            const res = await Workspace.api('/auth/login', 'POST', { login: login, senha: pass, deviceId: 'ws_web' });
            if(res && res.success) {
                localStorage.setItem('ws_usuario_logado', JSON.stringify(res.usuario));
                Workspace.init(); 
            } else {
                Workspace.mostrarAviso(res.error || "Login ou senha incorretos", "error");
            }
        } catch(e) { 
            Workspace.mostrarAviso("Erro de comunicação com o servidor.", "error"); 
        } finally { 
            btn.innerText = txt; 
            btn.disabled = false; 
        }
    },

    renderizarAvatar: (nomeAutor, tamanho = 40) => {
        const nomeStr = nomeAutor || 'Desconhecido';
        const url = Workspace.avatarsCache[nomeStr];
        
        if (url) {
            return `<img src="${url}" loading="lazy" style="width:${tamanho}px; height:${tamanho}px; min-width:${tamanho}px; border-radius:50%; object-fit:cover; border:2px solid #eee; box-shadow:0 2px 5px rgba(0,0,0,0.05); background:#fff;">`;
        } else {
            const letra = nomeStr.charAt(0).toUpperCase();
            const corFundo = Workspace.gerarCorPorNome(nomeStr);
            return `<div style="width:${tamanho}px; height:${tamanho}px; min-width:${tamanho}px; border-radius:50%; background:${corFundo}; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:${tamanho/2.2}px; border:2px solid #eee; box-shadow:0 2px 5px rgba(0,0,0,0.05);">${letra}</div>`;
        }
    },

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

    abrirPaginaPerfil: () => {
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
            letrasEl.style.background = Workspace.gerarCorPorNome(nome);
        }

        Workspace.navegarPara('perfil');
    },

    // 🛡️ VACINA ANTI-CACHE: Se o HTML antigo chamar a função velha, ela aciona a nova!
    abrirModalPerfil: () => Workspace.abrirPaginaPerfil(),

    uploadAvatar: async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) return Workspace.mostrarAviso("A imagem é muito pesada. Escolha uma foto até 5MB.", "warning");

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

                Workspace.abrirPaginaPerfil(); 
                Workspace.mostrarAviso("Foto de perfil updated!", "success");
                
                if (Workspace.Feed) Workspace.Feed.carregarPosts();
                if (Workspace.Sidebar && Workspace.Sidebar.turmaIdAberta) Workspace.Sidebar.carregarMensagensChat();
            }
        } catch (e) { 
            Workspace.mostrarAviso("Falha ao guardar a foto. Tente novamente.", "error"); 
        } finally { 
            loading.style.display = 'none'; 
            event.target.value = ''; 
        }
    },

    abrirPaginaTarefas: () => Workspace.navegarPara('tarefas'),
    abrirConfiguracoes: () => Workspace.navegarPara('configuracoes'),
    voltarAoFeed: () => Workspace.navegarPara('feed'),

    abrirModalSenha: () => {
        document.getElementById('ws-senha-modal').style.display = 'flex';
        document.getElementById('ws-senha-atual').value = '';
        document.getElementById('ws-nova-senha').value = '';
        document.getElementById('ws-confirma-senha').value = '';
    },

    salvarNovaSenha: async () => {
        const senhaAtual = document.getElementById('ws-senha-atual').value;
        const novaSenha = document.getElementById('ws-nova-senha').value.trim();
        const confirmaSenha = document.getElementById('ws-confirma-senha').value.trim();
        
        if (!senhaAtual || !novaSenha || !confirmaSenha) return Workspace.mostrarAviso("Preencha todos os campos para continuar.", "warning");
        if (novaSenha !== confirmaSenha) return Workspace.mostrarAviso("A nova senha e a confirmação não coincidem.", "warning");
        
        const btn = document.getElementById('ws-btn-salvar-senha');
        const txt = btn.innerText; 
        btn.innerText = "⏳ A gravar..."; 
        btn.disabled = true;
        
        try {
            const res = await Workspace.api('/workspace/perfil', 'PUT', { id: Workspace.usuario.id, senhaAtual, novaSenha });
            if (res && res.success) {
                Workspace.mostrarAviso("Senha updated com sucesso! Por favor, entre novamente.", "success");
                document.getElementById('ws-senha-modal').style.display = 'none';
                setTimeout(() => Workspace.logout(), 2500);
            } else {
                Workspace.mostrarAviso(res.error || "Erro ao atualizar a senha.", "error");
            }
        } catch (e) { 
            Workspace.mostrarAviso("Erro de comunicação com o servidor.", "error"); 
        } finally { 
            btn.innerText = txt; 
            btn.disabled = false; 
        }
    },

    logout: async (forcado = false) => {
        if (Workspace.Alertas && Workspace.Alertas.radar) clearInterval(Workspace.Alertas.radar);
        localStorage.removeItem('ws_usuario_logado');
        
        if(forcado) {
            document.getElementById('ws-login-screen').style.display = 'flex';
            document.getElementById('ws-navbar').style.display = 'none';
            document.getElementById('ws-main-container').style.display = 'none';
            Workspace.usuario = null;
        } else {
            window.location.reload(); 
        }
    }
});

document.addEventListener('DOMContentLoaded', Workspace.init);