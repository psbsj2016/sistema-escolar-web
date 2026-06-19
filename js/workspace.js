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

        const boxCriarPost = document.getElementById('ws-criar-post');
        if (boxCriarPost && ['Gestor', 'Professor', 'Secretaria'].includes(Workspace.usuario.tipo)) {
            boxCriarPost.style.display = 'block';
        }

        // 🚀 Liga todos os motores secundários!
        if (Workspace.Feed) await Workspace.Feed.init();
        if (Workspace.Upload) Workspace.Upload.init();
        if (Workspace.Alertas) Workspace.Alertas.init(); 
        if (Workspace.Sidebar) await Workspace.Sidebar.init(); 

        // 🚀 Fecha o menu hambúrguer principal se clicar fora dele
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

    // ==========================================
    // 🍔 MESTRE DO MENU HAMBÚRGUER E NAVEGAÇÃO
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
            if (Workspace.Sidebar) Workspace.Sidebar.carregarTurmas(); // Dispara o motor de turmas
        } else {
            subMenu.style.display = 'none';
        }
    },

    // ==========================================
    // 👤 MEU PERFIL E UPLOAD DA FOTO
    // ==========================================
    abrirModalPerfil: () => {
        document.getElementById('ws-main-menu-dropdown').style.display = 'none'; // Fecha menu
        document.getElementById('ws-perfil-modal').style.display = 'flex'; // Abre modal
        
        const nome = Workspace.usuario.nome || Workspace.usuario.login;
        document.getElementById('ws-perfil-modal-nome').innerText = nome;
        document.getElementById('ws-perfil-modal-login').innerText = `@${Workspace.usuario.login}`;

        const imgEl = document.getElementById('ws-perfil-img');
        const letrasEl = document.getElementById('ws-perfil-letras');

        // Se ele já tiver foto guardada, mostra a foto
        if (Workspace.usuario.avatar) {
            imgEl.src = Workspace.usuario.avatar;
            imgEl.style.display = 'block';
            letrasEl.style.display = 'none';
        } else {
            // Se não, mostra a Letra inicial
            imgEl.style.display = 'none';
            letrasEl.style.display = 'flex';
            letrasEl.innerText = nome.charAt(0).toUpperCase();
        }
    },

    uploadAvatar: async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Limita a 5MB para fotos de perfil
        if (file.size > 5 * 1024 * 1024) {
            alert("A imagem é muito pesada. Escolha uma foto até 5MB.");
            return;
        }

        const loading = document.getElementById('ws-avatar-loading');
        loading.style.display = 'block';

        try {
            // 1. Envia a foto para a Nuvem
            const formData = new FormData();
            formData.append('anexos', file);

            const uploadRes = await fetch('/api/workspace/upload', { method: 'POST', credentials: 'include', body: formData });
            const uploadData = await uploadRes.json();
            
            if (!uploadData.success || !uploadData.anexos || uploadData.anexos.length === 0) throw new Error("Falha no envio.");
            const novaFotoUrl = uploadData.anexos[0].url;

            // 2. Grava a nova URL no perfil do Aluno na Base de Dados
            const res = await Workspace.api('/workspace/perfil/avatar', 'PUT', { 
                id: Workspace.usuario.id,
                alunoRefId: Workspace.usuario.alunoRefId,
                avatarUrl: novaFotoUrl
            });

            if (res && res.success) {
                // Atualiza a memória e a cache do navegador para não perder ao recarregar
                Workspace.usuario.avatar = novaFotoUrl;
                localStorage.setItem('ws_usuario_logado', JSON.stringify(Workspace.usuario));
                
                // Força o ecrã a atualizar a foto sem precisar fechar e abrir
                Workspace.abrirModalPerfil(); 
            }
        } catch (e) {
            alert("Falha ao guardar a foto. Tente novamente.");
        } finally {
            loading.style.display = 'none';
            event.target.value = ''; // Limpa o input
        }
    },

    // ==========================================
    // ⚙️ CONFIGURAÇÕES E SEGURANÇA
    // ==========================================
    abrirConfiguracoes: () => {
        document.getElementById('ws-main-menu-dropdown').style.display = 'none';
        
        // Esconde o Feed e as Tarefas
        document.getElementById('ws-main-container').style.display = 'none';
        
        // Mostra a Tela de Configurações
        document.getElementById('ws-config-container').style.display = 'block';
    },

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
        
        if (!senhaAtual || !novaSenha || !confirmaSenha) {
            alert("Preencha todos os campos para continuar.");
            return;
        }
        if (novaSenha.length < 6) {
            alert("A nova senha deve ter pelo menos 6 caracteres.");
            return;
        }
        if (novaSenha !== confirmaSenha) {
            alert("A nova senha e a confirmação não coincidem.");
            return;
        }

        const btn = document.getElementById('ws-btn-salvar-senha');
        const txt = btn.innerText;
        btn.innerText = "⏳ A gravar...";
        btn.disabled = true;

        try {
            const res = await Workspace.api('/workspace/perfil', 'PUT', { 
                id: Workspace.usuario.id,
                senhaAtual: senhaAtual,
                novaSenha: novaSenha 
            });

            if (res && res.success) {
                alert("✅ Senha atualizada com sucesso! Por favor, entre novamente.");
                document.getElementById('ws-senha-modal').style.display = 'none';
                Workspace.logout(); // O aluno é deslogado para confirmar a senha nova
            } else {
                alert(res.error || "Erro ao atualizar a senha.");
            }
        } catch (e) {
            alert("Erro de comunicação com o servidor.");
        } finally {
            btn.innerText = txt;
            btn.disabled = false;
        }
    },

    // ==========================================
    // 🏠 VOLTAR AO FEED (HOME)
    // ==========================================
    voltarAoFeed: () => {
        // Fecha todos os modais e menus abertos
        const dropdown = document.getElementById('ws-main-menu-dropdown');
        const modalChat = document.getElementById('ws-chat-modal');
        const configPage = document.getElementById('ws-config-container');
        
        if (dropdown) dropdown.style.display = 'none';
        if (modalChat) modalChat.style.display = 'none';
        
        // Esconde Configurações e Volta a mostrar o Feed
        if (configPage) configPage.style.display = 'none';
        document.getElementById('ws-main-container').style.display = 'grid'; // Retorna o Grid Original
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    logout: async () => {
        if (Workspace.Alertas && Workspace.Alertas.radar) clearInterval(Workspace.Alertas.radar);
        localStorage.removeItem('ws_usuario_logado');
        window.location.reload(); // Recarrega a página para voltar a exibir a tela de login
    }
});

// Dá ordem de arranque assim que a página carrega
document.addEventListener('DOMContentLoaded', Workspace.init);