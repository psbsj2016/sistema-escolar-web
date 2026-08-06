import { CONFIG } from './config.js';
import './pwa-updater.js';
import './toast.js'; 
import './modulos/workspace/feed.js';
import './modulos/workspace/upload.js';
import './modulos/workspace/alertas.js'; 
import './modulos/workspace/sidebar.js';
import './modulos/workspace/avaliacoes.js';
import './modulos/workspace/materiais.js';

window.Workspace = window.Workspace || {};
const Workspace = window.Workspace;

Object.assign(Workspace, {
    usuario: null,
    avatarsCache: {}, 
    deferredPrompt: null,

    // 🚀 NOVA MEMÓRIA: Guarda os nomes de quem está online
    usuariosOnline: new Set(),
    
   // 🚀 NOVA FUNÇÃO: Desenha a bolinha verde pulsante (Com flex-shrink e trim)
    renderizarBolinhaOnline: (nome) => {
        if (!nome) return '';
        const nomeLimpo = nome.trim();
        const isOnline = Workspace.usuariosOnline.has(nomeLimpo);
        
        // Desenhamos a bolinha com display inline-block se estiver online, ou none se estiver offline
        return `<span class="ws-online-dot" data-nome="${Workspace.escapeHTML(nomeLimpo)}" style="display: ${isOnline ? 'inline-block' : 'none'} !important; width: 8px; height: 8px; background-color: #27ae60; border-radius: 50%; margin-right: 6px; box-shadow: 0 0 0 rgba(39, 174, 96, 0.4); animation: pulseGreen 2s infinite; vertical-align: middle; flex-shrink: 0;"></span>`;
    },

    // 🚀 NOVA FUNÇÃO: O Radar que consulta o servidor silenciosamente
    iniciarRadarOnline: () => {
        // Injeta o CSS da animação de pulsação suave
        if (!document.getElementById('ws-online-css')) {
            const style = document.createElement('style');
            style.id = 'ws-online-css';
            style.innerHTML = `@keyframes pulseGreen { 0% { box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.7); } 70% { box-shadow: 0 0 0 5px rgba(39, 174, 96, 0); } 100% { box-shadow: 0 0 0 0 rgba(39, 174, 96, 0); } }`;
            document.head.appendChild(style);
        }

        const buscarStatus = async () => {
            if (!Workspace.usuario) return;
            try {
                const res = await Workspace.api('/monitoramento/status', 'GET');
                if (Array.isArray(res)) {
                    Workspace.usuariosOnline.clear();
                    res.forEach(u => {
                        if (u.isOnline && u.nome) Workspace.usuariosOnline.add(u.nome.trim());
                    });
                    
                    // 🚀 Magia DOM Turbo: Acende ou apaga as bolinhas instantaneamente!
                    document.querySelectorAll('.ws-online-dot').forEach(dot => {
                        const nomeDaBolinha = dot.getAttribute('data-nome');
                        if (nomeDaBolinha && Workspace.usuariosOnline.has(nomeDaBolinha.trim())) {
                            dot.style.setProperty('display', 'inline-block', 'important');
                        } else {
                            dot.style.setProperty('display', 'none', 'important');
                        }
                    });
                }
            } catch(e) {}
        };

        // 🚀 O SEGREDO DO ARRANQUE: Aguardamos 2.5 segundos para o Feed já ter desenhado o HTML
        setTimeout(buscarStatus, 2500); 
        setInterval(buscarStatus, 35000); 
    },

    mostrarAviso: (mensagem, tipo = 'info', duracao = 3500, onClickCallback = null) => {
        if (window.Toast && typeof window.Toast.show === 'function') {
            window.Toast.show(mensagem, tipo, duracao, onClickCallback);
        } else {
            alert(mensagem); 
        }
    },

    abrirVisualizadorImagem: (url, titulo = 'Visualização') => {
        const id = 'ws-whatsapp-viewer';
        let viewer = document.getElementById(id);
        if (viewer) viewer.remove();

        viewer = document.createElement('div');
        viewer.id = id;
        viewer.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.95); z-index: 9999999; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s ease; backdrop-filter: blur(5px);";

        viewer.innerHTML = `
            <div style="position: absolute; top: 0; left: 0; width: 100%; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent); box-sizing: border-box;">
                <span style="color: white; font-weight: 500; font-size: 16px; font-family: sans-serif;">${Workspace.escapeHTML(titulo)}</span>
                <button onclick="document.getElementById('${id}').style.opacity='0'; setTimeout(()=>document.getElementById('${id}').remove(), 200)" style="background: transparent; border: none; color: white; font-size: 35px; cursor: pointer; padding: 0; line-height: 1;">&times;</button>
            </div>
            <img src="${url}" style="max-width: 90vw; max-height: 80vh; object-fit: contain; box-shadow: 0 5px 25px rgba(0,0,0,0.5); border-radius: 4px; transform: scale(0.9); transition: transform 0.2s ease;" id="ws-viewer-img">
        `;

        document.body.appendChild(viewer);
        
        requestAnimationFrame(() => {
            viewer.style.opacity = '1';
            document.getElementById('ws-viewer-img').style.transform = 'scale(1)';
        });
    },

    escapeHTML: (str) => {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
            
            // 🚀 A CORREÇÃO: Lê a mensagem do servidor, mesmo que o status seja Erro (ex: 400)
            const data = await res.json().catch(() => null);

            if (!res.ok) {
                // Se o servidor mandou uma mensagem amigável no pacote 'error', devolvemos sem "desmaiar"
                if (data && data.error) return data; 
                throw new Error('Falha na resposta do servidor');
            }
            
            return data;
        } catch (e) {
            console.error(`❌ Erro API Workspace [${endpoint}]:`, e);
            // Retorna um objeto estruturado em vez de 'null' para impedir que o ecrã crashe
            return { success: false, error: 'Falha de comunicação com o servidor.' };
        }
    },

    gerarCorPorNome: (nome) => {
        const cores = ['#e74c3c', '#8e44ad', '#2980b9', '#27ae60', '#f39c12', '#d35400', '#c0392b', '#16a085', '#34495e', '#ff5252'];
        let hash = 0;
        for (let i = 0; i < nome.length; i++) { hash = nome.charCodeAt(i) + ((hash << 5) - hash); }
        return cores[Math.abs(hash) % cores.length];
    },

   init: async () => {
        const cacheUser = localStorage.getItem('ws_usuario_logado');
        if (!cacheUser) {
            document.getElementById('ws-login-screen').style.display = 'flex';
            document.getElementById('ws-navbar').style.display = 'none';
            document.getElementById('ws-main-container').style.display = 'none';
            
            // 🚀 GUARDIÃO DE ROTAS (Auth Guard): Deteta Invasores com Link Partilhado
            if (window.location.hash && window.location.hash.includes('post-')) {
                // 1. Destrói o link da barra de endereços para não ficar gravado no histórico do invasor
                history.replaceState(null, null, ' ');
                // 2. Lança o alerta de segurança inquebrável
                setTimeout(() => {
                    Workspace.mostrarAviso("Você não foi autorizado a acessar a plataforma, pois não tem cadastro no nosso sistema", "error", 8000);
                }, 500);
            }
            return;
        }
        
        Workspace.usuario = JSON.parse(cacheUser);
        document.getElementById('ws-login-screen').style.display = 'none';
        document.getElementById('ws-navbar').style.display = 'flex';
        
        // ====================================================================
        // 🚀 O SEGREDO DO REFRESH E DEEP LINKING
        // ====================================================================
        let telaDestino = 'feed'; // O destino padrão de segurança
        let postAlvo = null;      // Memoriza se o aluno clicou num link de publicação
        
        if (window.location.hash) {
            if (window.location.hash.includes('post-')) {
                telaDestino = 'feed'; // Obriga a carregar o Feed
                postAlvo = window.location.hash.replace('#post-', ''); // Guarda a matrícula do post
            } else {
                telaDestino = window.location.hash.replace('#', '').replace(/-/g, '_');
            }
        }
        
        Workspace.navegarPara(telaDestino, true);
        // ====================================================================

        const boxCriarPost = document.getElementById('ws-criar-post');
        if (boxCriarPost) boxCriarPost.style.display = 'block';

        Workspace.avatarsCache = await Workspace.api('/workspace/avatars', 'GET') || {};
        Workspace.avatarsCache[Workspace.usuario.nome || Workspace.usuario.login] = Workspace.usuario.avatar;

        if (Workspace.Feed) await Workspace.Feed.init();
        if (Workspace.ComandoMágico) Workspace.ComandoMágico.init();
        if (Workspace.Upload) Workspace.Upload.init();
        Workspace.iniciarRadarOnline(); // 🚀 O RADAR É LIGADO AQUI!
        if (Workspace.Alertas) Workspace.Alertas.init(); 
        if (Workspace.Bau) Workspace.Bau.carregarDadosDaNuvem();
        if (Workspace.Sidebar) await Workspace.Sidebar.init(); 
        if (Workspace.Avaliacoes) Workspace.Avaliacoes.init();
        if (Workspace.Materiais) Workspace.Materiais.init();

        document.addEventListener('click', (e) => {
            const menuContainer = document.getElementById('ws-menu-left-container');
            const menuDropdown = document.getElementById('ws-main-menu-dropdown');
            if (menuContainer && menuDropdown && !menuContainer.contains(e.target)) {
                menuDropdown.style.display = 'none';
            }
        });

        window.addEventListener('popstate', (e) => {
            // Também blindamos o botão "Voltar" do navegador para respeitar a Hash!
            if (e.state && e.state.tela) {
                Workspace.navegarPara(e.state.tela, false); 
            } else if (window.location.hash) {
                const telaHash = window.location.hash.replace('#', '').replace(/-/g, '_');
                Workspace.navegarPara(telaHash, false);
            } else {
                Workspace.navegarPara('feed', false);
            }
        });
    },

    abrirEncontroOnline: (btn) => {
        if (Workspace.usuario.tipo === 'Aluno') {
            if(Workspace.Avaliacoes && Workspace.Avaliacoes.abrirSalasOnlineAluno) {
                Workspace.Avaliacoes.abrirSalasOnlineAluno(btn);
            }
        } else {
            // 🚀 Professores vão para o painel isolado de encontros online
            Workspace.navegarPara('encontros_prof'); 
        }
    },

   navegarPara: (tela, registarNoHistorico = true) => {
        const dropdown = document.getElementById('ws-main-menu-dropdown');
        if (dropdown) dropdown.style.display = 'none';
        const modalChat = document.getElementById('ws-chat-modal');
        if (modalChat) modalChat.style.display = 'none';

        const ecras = {
            'feed': 'ws-main-container', 
            'bau': 'ws-bau-container',
            'configuracoes': 'ws-config-container',
            'sala_aula': 'ws-sala-aula-container',
            'tarefas_aluno': 'ws-tarefas-container', 
            'tarefas_prof': 'ws-tarefas-professor-container',
            'perfil': 'ws-perfil-modal', 
            'avaliacoes_aluno': 'ws-avaliacoes-container',
            'avaliacoes_prof': 'ws-avaliacoes-prof-container', 
            'avaliacoes_escrita': 'ws-avaliacoes-escrita-container',
            'avaliacoes_oral': 'ws-avaliacoes-oral-container',
            'avaliacoes_online': 'ws-avaliacoes-online-container',
            'encontros_prof': 'ws-avaliacoes-prof-container', 
            'materiais': 'ws-materiais-container'
        };

        if (tela === 'tarefas') tela = Workspace.usuario.tipo === 'Aluno' ? 'tarefas_aluno' : 'tarefas_prof';
        if (tela === 'avaliacoes') tela = Workspace.usuario.tipo === 'Aluno' ? 'avaliacoes_aluno' : 'avaliacoes_prof';

        // 🚀 O CAMALEÃO
        if (tela === 'encontros_prof') {
            tela = 'avaliacoes_prof';
            if (Workspace.Avaliacoes && Workspace.Avaliacoes.setContextoProf) Workspace.Avaliacoes.setContextoProf('encontros');
        } else if (tela === 'avaliacoes_prof') {
            if (Workspace.Avaliacoes && Workspace.Avaliacoes.setContextoProf) Workspace.Avaliacoes.setContextoProf('avaliacoes');
        }

        // ====================================================================
        // 🚀 A MAGIA DO PERFIL: Sempre que abrir o perfil, preenche os dados primeiro!
        // ====================================================================
        if (tela === 'perfil' && Workspace.usuario) {
            const nome = Workspace.usuario.nome || Workspace.usuario.login;
            const elNome = document.getElementById('ws-perfil-modal-nome');
            const elLogin = document.getElementById('ws-perfil-modal-login');
            
            if (elNome) elNome.innerText = nome;
            if (elLogin) elLogin.innerText = `@${Workspace.usuario.login}`;

            const imgEl = document.getElementById('ws-perfil-img');
            const letrasEl = document.getElementById('ws-perfil-letras');

            if (Workspace.usuario.avatar) {
                if (imgEl) { imgEl.src = Workspace.usuario.avatar; imgEl.style.display = 'block'; }
                if (letrasEl) letrasEl.style.display = 'none';
            } else {
                if (imgEl) imgEl.style.display = 'none';
                if (letrasEl) {
                    letrasEl.style.display = 'flex';
                    letrasEl.innerText = nome.charAt(0).toUpperCase();
                    letrasEl.style.background = Workspace.gerarCorPorNome(nome);
                }
            }
        }
        // ====================================================================

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

        if (registarNoHistorico) history.pushState({ tela: tela }, '', `#${tela.replace('_', '-')}`);
    },

    fazerLogin: async () => {
        const login = document.getElementById('ws-login-user').value.trim();
        const pass = document.getElementById('ws-login-pass').value.trim();
        if(!login || !pass) return Workspace.mostrarAviso("Preencha utilizador e senha", "warning");

        const btn = document.querySelector('#ws-login-screen button');
        const txt = btn.innerText; btn.innerText = "Entrando... ⏳"; btn.disabled = true;

        try {
            const res = await Workspace.api('/auth/login', 'POST', { login, senha: pass, deviceId: 'ws_web', sistema: 'workspace' });
            if(res && res.success) {
                // Guarda os dados na memória imediatamente
                Workspace.usuario = res.usuario; 
                localStorage.setItem('ws_usuario_logado', JSON.stringify(res.usuario));

                // ====================================================================
                // 🚀 VERIFICAÇÃO DO "TAPETE VERMELHO" (Experiência de Primeiro Acesso)
                // ====================================================================
                const userId = res.usuario.id;
                const jaAcessou = localStorage.getItem('ws_primeiro_acesso_concluido_' + userId);

                if (!jaAcessou) {
                    // 1. Marca na memória que já recebeu as boas-vindas
                    localStorage.setItem('ws_primeiro_acesso_concluido_' + userId, 'true');

                    // 2. Esconde o login frio e rígido
                    document.getElementById('ws-login-screen').style.display = 'none';

                    // 3. Prepara a magia: Coloca o primeiro nome do utilizador no ecrã
                    const telaBoasVindas = document.getElementById('ws-boas-vindas-screen');
                    const nomeTexto = document.getElementById('ws-boas-vindas-nome');
                    const primeiroNome = (res.usuario.nome || res.usuario.login).split(' ')[0];
                    
                    nomeTexto.innerText = `Bem-vindo(a), ${primeiroNome}!`;
                    
                    // 4. Inicia a animação cinematográfica
                    telaBoasVindas.style.display = 'flex';

                    // 5. Após 4 segundos de brilho, dissipa-se suavemente e arranca o sistema!
                    setTimeout(() => {
                        telaBoasVindas.style.opacity = '0';
                        telaBoasVindas.style.transition = 'opacity 0.6s ease';
                        setTimeout(() => {
                            telaBoasVindas.style.display = 'none';
                            Workspace.init(); 
                        }, 600);
                    }, 4000);

                } else {
                    // Se for um aluno regular, entra rápido e sem distrações!
                    Workspace.init(); 
                }
            } else {
                Workspace.mostrarAviso(res.error || "Login ou senha incorretos", "error");
            }
        } catch(e) { 
            Workspace.mostrarAviso("Erro de comunicação com o servidor.", "error"); 
        } 
        finally { btn.innerText = txt; btn.disabled = false; }
    },

    // ============================================================================
    // 🎨 RENDERIZADOR UNIVERSAL DE AVATARES (Puro e Estável)
    // ============================================================================
    renderizarAvatar: (nomeAutor, tamanho = 40) => {
        const nomeStr = nomeAutor || 'Desconhecido';
        const url = Workspace.avatarsCache[nomeStr];
        
        // 🚀 O GPS MAGNÉTICO: Identifica de quem é a foto e o tamanho exato na tela
        const atributoBusca = `data-avatar-nome="${Workspace.escapeHTML(nomeStr)}" data-avatar-tamanho="${tamanho}"`;

        if (url) {
            // Desenha a Fotografia
            return `<img src="${url}" ${atributoBusca} loading="lazy" style="width:${tamanho}px; height:${tamanho}px; min-width:${tamanho}px; max-width:${tamanho}px; border-radius:50%; object-fit:cover; object-position:center; aspect-ratio:1/1; border:2px solid #eee; box-shadow:0 2px 5px rgba(0,0,0,0.05); background:#fff; flex-shrink:0;">`;
        } else {
            // Desenha a Letra Inicial
            const letra = nomeStr.charAt(0).toUpperCase();
            const corFundo = Workspace.gerarCorPorNome(nomeStr);
            return `<div ${atributoBusca} style="width:${tamanho}px; height:${tamanho}px; min-width:${tamanho}px; max-width:${tamanho}px; aspect-ratio:1/1; border-radius:50%; background:${corFundo}; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:${tamanho/2.2}px; border:2px solid #eee; box-shadow:0 2px 5px rgba(0,0,0,0.05); flex-shrink:0;">${letra}</div>`;
        }
    },

    // 🚀 O VARREDOR MÁGICO: Atualiza toda a tela num piscar de olhos
    atualizarAvataresNaTela: (nomeAutor, novaUrl) => {
        const nomeSeguro = Workspace.escapeHTML(nomeAutor);
        const elementos = document.querySelectorAll(`[data-avatar-nome="${nomeSeguro}"]`);
        
        elementos.forEach(el => {
            const tamanho = el.getAttribute('data-avatar-tamanho') || 40;
            
            if (el.tagName === 'IMG') {
                el.src = novaUrl;
            } else if (el.tagName === 'DIV') {
                const novaImg = document.createElement('img');
                novaImg.src = novaUrl;
                novaImg.setAttribute('data-avatar-nome', nomeSeguro);
                novaImg.setAttribute('data-avatar-tamanho', tamanho);
                novaImg.setAttribute('loading', 'lazy');
                novaImg.style.cssText = `width:${tamanho}px; height:${tamanho}px; min-width:${tamanho}px; max-width:${tamanho}px; border-radius:50%; object-fit:cover; object-position:center; aspect-ratio:1/1; border:2px solid #eee; box-shadow:0 2px 5px rgba(0,0,0,0.05); background:#fff; flex-shrink:0;`;
                el.parentNode.replaceChild(novaImg, el);
            }
        });
    },

    toggleMenuPrincipal: () => {
        const dropdown = document.getElementById('ws-main-menu-dropdown');
        if (dropdown) dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
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
        // Como o 'navegarPara' agora é super inteligente, só precisamos dar-lhe a ordem de viagem!
        Workspace.navegarPara('perfil');
    },

    abrirModalPerfil: () => Workspace.abrirPaginaPerfil(),

    verMinhaFoto: () => {
        if (Workspace.usuario && Workspace.usuario.avatar) {
            Workspace.abrirVisualizadorImagem(Workspace.usuario.avatar, "Minha foto de perfil");
        } else {
            Workspace.mostrarAviso("Ainda não tem uma foto de perfil.", "info");
        }
    },

    // ============================================================================
    // ✏️ EDIÇÃO DO NOME DO PERFIL E EFEITO CASCATA VISUAL
    // ============================================================================
    editarNomePerfil: () => {
        const nomeAtual = Workspace.usuario.nome || Workspace.usuario.login;
        document.getElementById('ws-input-novo-nome').value = nomeAtual;
        document.getElementById('ws-perfil-nome-view').style.display = 'none';
        document.getElementById('ws-perfil-nome-edit').style.display = 'flex';
        document.getElementById('ws-input-novo-nome').focus();
    },

    cancelarEdicaoNome: () => {
        document.getElementById('ws-perfil-nome-edit').style.display = 'none';
        document.getElementById('ws-perfil-nome-view').style.display = 'flex';
    },

    salvarNomePerfil: async () => {
        const input = document.getElementById('ws-input-novo-nome');
        const novoNome = input.value.trim();

        if (!novoNome) {
            Workspace.mostrarAviso("Por favor, digite um nome válido.", "warning");
            return;
        }

        const btn = document.getElementById('ws-btn-salvar-nome');
        const txtOriginal = btn.innerText;
        btn.innerText = "⏳";
        btn.disabled = true;

        try {
            const res = await Workspace.api('/workspace/perfil/nome', 'PUT', {
                id: Workspace.usuario.id,
                alunoRefId: Workspace.usuario.alunoRefId,
                novoNome: novoNome
            });

            if (res && res.success) {
                const nomeAntigo = res.nomeAntigo;

                // 1. Atualiza a Memória do Navegador
                Workspace.usuario.nome = novoNome;
                localStorage.setItem('ws_usuario_logado', JSON.stringify(Workspace.usuario));

                // 2. Transferência de Avatar no Cache
                if (nomeAntigo && Workspace.avatarsCache[nomeAntigo]) {
                    Workspace.avatarsCache[novoNome] = Workspace.avatarsCache[nomeAntigo];
                }

                // 3. Atualiza Visuais
                document.getElementById('ws-perfil-modal-nome').innerText = novoNome;
                if (!Workspace.usuario.avatar) {
                    const letrasEl = document.getElementById('ws-perfil-letras');
                    if (letrasEl) {
                        letrasEl.innerText = novoNome.charAt(0).toUpperCase();
                        letrasEl.style.background = Workspace.gerarCorPorNome(novoNome);
                    }
                }

                Workspace.cancelarEdicaoNome();
                Workspace.mostrarAviso("Nome atualizado em toda a plataforma!", "success");

                // 4. Magia Invisível: Recarrega o Feed
                if (Workspace.Feed) {
                    Workspace.Feed.todosOsPosts = [];
                    Workspace.Feed.postsCache = [];
                    const areaFeed = document.getElementById('ws-posts-area');
                    if (areaFeed) areaFeed.innerHTML = ''; 
                    Workspace.Feed.carregarPosts(); 
                }

                if (Workspace.Sidebar && Workspace.Sidebar.carregarTurmas) Workspace.Sidebar.carregarTurmas();
            } else {
                Workspace.mostrarAviso(res.error || "Erro ao atualizar o nome.", "error");
            }
        } catch (error) {
            Workspace.mostrarAviso("Falha na comunicação.", "error");
        } finally {
            btn.innerText = txtOriginal;
            btn.disabled = false;
        }
    },

    // ============================================================================
    // 📸 MOTOR DE AVATARES INTELIGENTE (ESTÚDIO DE CORTE)
    // ============================================================================
    uploadAvatar: async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 100 * 1024 * 1024) {
            Workspace.mostrarAviso("A fotografia é muito pesada. Escolha uma até 100MB.", "warning");
            event.target.value = '';
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        const imgElement = document.getElementById('ws-imagem-para-cortar');
        const modal = document.getElementById('ws-modal-corte-foto');

        if (!imgElement || !modal) return;

        modal.style.display = 'flex';
        imgElement.src = objectUrl;

        if (Workspace.cropperInstance) Workspace.cropperInstance.destroy();

        Workspace.cropperInstance = new Cropper(imgElement, {
            aspectRatio: 1, viewMode: 1, dragMode: 'move', autoCropArea: 0.9,
            restore: false, guides: true, center: true, highlight: false,
            cropBoxMovable: false, cropBoxResizable: false, toggleDragModeOnDblclick: false,
        });

        event.target.value = ''; 
    },

    fecharModalCorte: () => {
        const modal = document.getElementById('ws-modal-corte-foto');
        if (modal) modal.style.display = 'none';
        if (Workspace.cropperInstance) {
            Workspace.cropperInstance.destroy();
            Workspace.cropperInstance = null;
        }
    },

    confirmarCorteAvatar: async () => {
        if (!Workspace.cropperInstance) return;

        const btn = document.getElementById('ws-btn-confirmar-corte');
        const textoOriginal = btn.innerText;
        btn.innerText = "⏳ Atualizando...";
        btn.disabled = true;

        const loader = document.getElementById('ws-avatar-loading');
        if (loader) loader.style.display = 'block';

        const canvas = Workspace.cropperInstance.getCroppedCanvas({
            width: 800, height: 800, imageSmoothingEnabled: true, imageSmoothingQuality: 'high',
        });

        if (!canvas) {
            Workspace.mostrarAviso("Não foi possível cortar a imagem.", "error");
            btn.innerText = textoOriginal;
            btn.disabled = false;
            return;
        }

        canvas.toBlob(async (blob) => {
            try {
                const formData = new FormData();
                formData.append('anexos', blob, 'avatar_usuario.jpg');

                const uploadRes = await fetch('/api/workspace/upload', { method: 'POST', credentials: 'include', body: formData });
                if (!uploadRes.ok) throw new Error("Falha ao comunicar com o servidor.");
                const uploadData = await uploadRes.json();
                
                if (!uploadData.success || !uploadData.anexos || uploadData.anexos.length === 0) throw new Error("A nuvem rejeitou o envio.");

                const avatarFinal = uploadData.anexos[0].url;

                const res = await Workspace.api('/workspace/perfil/avatar', 'PUT', {
                    id: Workspace.usuario.id, alunoRefId: Workspace.usuario.alunoRefId || null, avatarUrl: avatarFinal
                });

                if (res && res.success) {
                    const nomeUsuario = Workspace.usuario.nome || Workspace.usuario.login;
                    Workspace.usuario.avatar = avatarFinal;
                    localStorage.setItem('ws_usuario_logado', JSON.stringify(Workspace.usuario));
                    Workspace.avatarsCache[nomeUsuario] = avatarFinal;
                    
                    const img = document.getElementById('ws-perfil-img');
                    const letras = document.getElementById('ws-perfil-letras');
                    
                    if(img) { img.src = avatarFinal; img.style.display = 'block'; }
                    if(letras) letras.style.display = 'none';

                    Workspace.mostrarAviso("Foto atualizada em toda a plataforma!", "success");
                    
                    // 🚀 O VARREDOR MÁGICO ENTRA AQUI!
                    if (Workspace.atualizarAvataresNaTela) {
                        Workspace.atualizarAvataresNaTela(nomeUsuario, avatarFinal);
                    }
                    
                    Workspace.fecharModalCorte();
                }
            } catch (err) {
                console.error(err);
                Workspace.mostrarAviso("Ocorreu um erro ao guardar. Tente de novo.", "error");
            } finally {
                if (loader) loader.style.display = 'none';
                btn.innerText = textoOriginal;
                btn.disabled = false;
            }
        }, 'image/jpeg', 0.92);
    },

    abrirPaginaTarefas: () => Workspace.navegarPara('tarefas'),
    abrirPaginaBau: () => Workspace.navegarPara('bau'),
    abrirPaginaAvaliacoes: () => Workspace.navegarPara('avaliacoes'),
    abrirPaginaMateriais: () => {
        if (Workspace.Materiais) Workspace.Materiais.abrirPainel();
        else Workspace.navegarPara('materiais');
    },
    abrirConfiguracoes: () => Workspace.navegarPara('configuracoes'),
    voltarAoFeed: () => Workspace.navegarPara('feed'),

    abrirModalSenha: () => {
        document.getElementById('ws-senha-modal').style.display = 'flex';
        document.getElementById('ws-senha-atual').value = '';
        document.getElementById('ws-nova-senha').value = '';
        document.getElementById('ws-confirma-senha').value = '';
    },

   // ============================================================================
    // 🔑 MOTOR DE ALTERAÇÃO DE SENHA (FRONTEND)
    // ============================================================================
    salvarNovaSenha: async () => {
        const senhaAtual = document.getElementById('ws-senha-atual').value.trim();
        const novaSenha = document.getElementById('ws-nova-senha').value.trim();
        const confirmaSenha = document.getElementById('ws-confirma-senha').value.trim();
        
        if (!senhaAtual || !novaSenha || !confirmaSenha) return Workspace.mostrarAviso("Preencha todos os campos para continuar.", "warning");
        if (novaSenha !== confirmaSenha) return Workspace.mostrarAviso("A nova senha e a confirmação não coincidem.", "warning");
        
        const btn = document.getElementById('ws-btn-salvar-senha');
        const txt = btn.innerText; btn.innerText = "Fazendo criptografia e salvando... ⏳"; btn.disabled = true;
        
        try {
            const res = await Workspace.api('/workspace/perfil', 'PUT', { 
                id: Workspace.usuario.id, 
                alunoRefId: Workspace.usuario.alunoRefId, 
                senhaAtual: senhaAtual, 
                novaSenha: novaSenha 
            });
            
            if (res && res.success) {
                Workspace.mostrarAviso("Senha atualizada com sucesso! Por favor, entre novamente.", "success");
                document.getElementById('ws-senha-modal').style.display = 'none';
                setTimeout(() => Workspace.logout(), 2500);
            } else {
                // 🚀 PROTEÇÃO: Lê a mensagem amigável que o novo "mensageiro" transportou!
                Workspace.mostrarAviso(res?.error || "Erro ao atualizar a senha.", "error");
            }
        } catch (e) { 
            Workspace.mostrarAviso("Falha de comunicação com o servidor.", "error"); 
        } 
        finally { btn.innerText = txt; btn.disabled = false; }
    },

  logout: async (forcado = false) => {
        if (Workspace.Alertas && Workspace.Alertas.radar) clearInterval(Workspace.Alertas.radar);
        localStorage.removeItem('ws_usuario_logado');
        
        if(forcado) {
            document.getElementById('ws-login-screen').style.display = 'flex';
            document.getElementById('ws-navbar').style.display = 'none';
            document.getElementById('ws-main-container').style.display = 'none';
            
            // 🚀 LIMPEZA VISUAL: Fecha as janelas flutuantes que possam ter ficado perdidas no ecrã!
            const modais = ['ws-senha-modal', 'ws-perfil-modal', 'ws-chat-modal', 'ws-tarefa-modal', 'ws-modal-alarme'];
            modais.forEach(id => {
                const modal = document.getElementById(id);
                if (modal) modal.style.display = 'none';
            });

            Workspace.usuario = null;
        } else {
            window.location.reload(); 
        }
    }, // <--- 🚀 A VÍRGULA MÁGICA QUE FALTAVA ESTÁ AQUI!

   // ============================================================================
    // 🧰 MOTOR DO BAÚ DAS MEMÓRIAS (Alarme Gigante, Notas Seguras e Integração com Sininho Global)
    // ============================================================================
    Bau: {
        alarmesAtivos: [],
        notasCache: [],
        notaAbertaId: null,
        salvamentoTimer: null,
        radarDeAlarmes: null,
        calDataAtual: new Date(), 
        alarmeGiganteAtual: null,

        // ======================= SISTEMA DE NAVEGAÇÃO =======================
        mudarAba: (aba) => {
            const btnMeu = document.getElementById('tab-bau-meu');
            const btnInst = document.getElementById('tab-bau-inst');
            if(aba === 'meu') {
                btnMeu.style.background = '#2c3e50'; btnMeu.style.color = 'white';
                btnInst.style.background = 'transparent'; btnInst.style.color = '#7f8c8d';
                document.getElementById('ws-bau-meu-conteudo').style.display = 'block';
                document.getElementById('ws-bau-inst-conteudo').style.display = 'none';
            } else {
                btnInst.style.background = '#2c3e50'; btnInst.style.color = 'white';
                btnMeu.style.background = 'transparent'; btnMeu.style.color = '#7f8c8d';
                document.getElementById('ws-bau-inst-conteudo').style.display = 'block';
                document.getElementById('ws-bau-meu-conteudo').style.display = 'none';
            }
        },

        irParaCalendarioDoBau: (tempoDisparo) => {
            document.getElementById('ws-modal-alarme-gigante').style.display = 'none';
            
            Workspace.navegarPara('bau');
            Workspace.Bau.mudarAba('meu');

            if (tempoDisparo) {
                const dataAlarme = new Date(tempoDisparo);
                Workspace.Bau.calDataAtual = new Date(dataAlarme.getFullYear(), dataAlarme.getMonth(), 1);
                Workspace.Bau.renderizarCalendario();
                Workspace.Bau.atualizarCalendarioVisual();
            }
            
            const areaCalendario = document.getElementById('ws-bau-cal-mesano');
            if(areaCalendario) areaCalendario.scrollIntoView({ behavior: 'smooth', block: 'center' });
        },

        carregarDadosDaNuvem: async () => {
            try {
                const resNotas = await Workspace.api(`/workspace/bau/notas?usuarioId=${Workspace.usuario.id}`, 'GET');
                if (resNotas && resNotas.dados) Workspace.Bau.notasCache = resNotas.dados;
                Workspace.Bau.renderizarListaNotas();

                const resAlarmes = await Workspace.api(`/workspace/bau/alarmes?usuarioId=${Workspace.usuario.id}`, 'GET');
                if (resAlarmes && Array.isArray(resAlarmes.dados)) Workspace.Bau.alarmesAtivos = resAlarmes.dados;
                
                Workspace.Bau.renderizarCalendario();
                Workspace.Bau.atualizarCalendarioVisual();

                if(Workspace.Bau.radarDeAlarmes) clearInterval(Workspace.Bau.radarDeAlarmes);
                Workspace.Bau.radarDeAlarmes = setInterval(Workspace.Bau.verificarAlarme, 1000);
            } catch(e) { console.error("Erro ao carregar dados do Baú", e); }
        },

        // ======================= SISTEMA DE NOTAS (BLINDADO) =======================
      // ======================= SISTEMA DE NOTAS (BLINDADO) =======================
        renderizarListaNotas: () => {
            const container = document.getElementById('ws-bau-lista-notas');
            if (!container) return;

            // 🚀 1. O FILTRO CAÇA-FANTASMAS
            // Varre a memória e expulsa qualquer nota que não tenha ID ou que esteja vazia.
            Workspace.Bau.notasCache = Workspace.Bau.notasCache.filter(nota => {
                const temIdValido = nota && nota.id && nota.id !== 'undefined';
                const temConteudo = nota.titulo || (nota.texto && nota.texto.trim() !== '');
                return temIdValido && temConteudo;
            });

            if (Workspace.Bau.notasCache.length === 0) {
                container.innerHTML = '<div style="text-align: center; color: #999; font-size: 13px; padding: 20px;">O seu bloco de notas está vazio. Faça uma nova anotação! 📝</div>';
                return;
            }

            let html = '';
            Workspace.Bau.notasCache.forEach(nota => {
                // 🛡️ Blindagem da Data
                const dataMestra = nota.dataAtualizacao || nota.dataCriacao;
                const d = new Date(dataMestra);
                const dataStr = isNaN(d.getTime()) ? 'Agora mesmo' : d.toLocaleDateString('pt-BR');
                
                // 🛡️ Blindagem do Título: Impede que um título vazio crie aquele "buraco" visual
                const tituloSeguro = (nota.titulo && nota.titulo.trim() !== '') ? Workspace.escapeHTML(nota.titulo) : 'Nota sem título';
                
                html += `
                    <div style="background: white; border: 1px solid #ddd; padding: 12px 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: 0.2s;" onmouseover="this.style.borderColor='#3498db'; this.style.boxShadow='0 2px 8px rgba(52, 152, 219, 0.1)'" onmouseout="this.style.borderColor='#ddd'; this.style.boxShadow='none'">
                        <div style="flex: 1; min-width: 0;" onclick="Workspace.Bau.abrirNota('${nota.id}')">
                            <h5 style="margin: 0 0 4px 0; color: #2c3e50; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${tituloSeguro}</h5>
                            <span style="font-size: 11px; color: #aaa;">Atualizada em: <span style="font-weight:bold; color:#7f8c8d;">${dataStr}</span></span>
                        </div>
                        <button onclick="Workspace.Bau.apagarNota('${nota.id}')" style="background: transparent; border: none; color: #e74c3c; font-size: 16px; cursor: pointer; padding: 5px;" title="Apagar Nota">🗑️</button>
                    </div>
                `;
            });
            container.innerHTML = html;
        },

        novaNota: () => {
            Workspace.Bau.notaAbertaId = 'nova';
            document.getElementById('ws-bau-edicao-titulo').value = '';
            document.getElementById('ws-bau-edicao-texto').innerHTML = '';
            document.getElementById('ws-bau-status-salvamento').innerText = 'Não guardado';
            
            document.getElementById('ws-bau-tela-lista').style.display = 'none';
            document.getElementById('ws-bau-tela-leitura').style.display = 'none';
            document.getElementById('ws-bau-tela-edicao').style.display = 'block';
        },

        abrirNota: (id) => {
            const nota = Workspace.Bau.notasCache.find(n => n.id === id);
            if(!nota) return;
            Workspace.Bau.notaAbertaId = id;
            document.getElementById('ws-bau-leitura-titulo').innerText = nota.titulo;
            document.getElementById('ws-bau-leitura-texto').innerHTML = nota.texto;

            document.getElementById('ws-bau-tela-lista').style.display = 'none';
            document.getElementById('ws-bau-tela-edicao').style.display = 'none';
            document.getElementById('ws-bau-tela-leitura').style.display = 'block';
        },

        editarNotaAtual: () => {
            const nota = Workspace.Bau.notasCache.find(n => n.id === Workspace.Bau.notaAbertaId);
            if(!nota) return;
            document.getElementById('ws-bau-edicao-titulo').value = nota.titulo;
            document.getElementById('ws-bau-edicao-texto').innerHTML = nota.texto;
            document.getElementById('ws-bau-status-salvamento').innerText = 'Sincronizado ☁️✅';

            document.getElementById('ws-bau-tela-leitura').style.display = 'none';
            document.getElementById('ws-bau-tela-edicao').style.display = 'block';
        },

        voltarListaNotas: () => {
            document.getElementById('ws-bau-tela-leitura').style.display = 'none';
            document.getElementById('ws-bau-tela-edicao').style.display = 'none';
            document.getElementById('ws-bau-tela-lista').style.display = 'block';
            Workspace.Bau.notaAbertaId = null;
        },

        fecharEdicao: () => {
            if(Workspace.Bau.notaAbertaId === 'nova') Workspace.Bau.voltarListaNotas();
            else Workspace.Bau.abrirNota(Workspace.Bau.notaAbertaId);
        },

        autoSalvarNota: () => {
            const status = document.getElementById('ws-bau-status-salvamento');
            if(status) status.innerText = 'Digitando... ⌨️';

            clearTimeout(Workspace.Bau.salvamentoTimer);
            Workspace.Bau.salvamentoTimer = setTimeout(async () => {
                await Workspace.Bau.executarSalvamentoNuvem(false);
            }, 1500); 
        },

        salvarESairNota: async () => {
            clearTimeout(Workspace.Bau.salvamentoTimer);
            const status = document.getElementById('ws-bau-status-salvamento');
            if(status) status.innerText = 'Guardando... ⏳';
            
            const sucesso = await Workspace.Bau.executarSalvamentoNuvem(true);
            if (sucesso) {
                Workspace.Bau.renderizarListaNotas();
                Workspace.Bau.abrirNota(Workspace.Bau.notaAbertaId);
            }
        },

        executarSalvamentoNuvem: async (mostrarAlerta) => {
            const titulo = document.getElementById('ws-bau-edicao-titulo').value.trim() || 'Nota sem título';
            const texto = document.getElementById('ws-bau-edicao-texto').innerHTML;
            const status = document.getElementById('ws-bau-status-salvamento');

            if (!texto && Workspace.Bau.notaAbertaId === 'nova') return false;

            try {
                let res;
                if (Workspace.Bau.notaAbertaId === 'nova') {
                    res = await Workspace.api('/workspace/bau/notas', 'POST', { usuarioId: Workspace.usuario.id, titulo, texto });
                    if(res && res.nota) {
                        Workspace.Bau.notaAbertaId = res.nota.id;
                        Workspace.Bau.notasCache = [res.nota, ...Workspace.Bau.notasCache];
                    }
                } else {
                    res = await Workspace.api(`/workspace/bau/notas/${Workspace.Bau.notaAbertaId}`, 'PUT', { titulo, texto });
                    if(res && res.success) {
                        const idx = Workspace.Bau.notasCache.findIndex(n => n.id === Workspace.Bau.notaAbertaId);
                        if(idx !== -1) {
                            Workspace.Bau.notasCache[idx].titulo = titulo;
                            Workspace.Bau.notasCache[idx].texto = texto;
                            Workspace.Bau.notasCache[idx].dataAtualizacao = new Date().toISOString();
                        }
                    }
                }
                
                if(status) status.innerText = 'Sincronizado ☁️✅';
                if(mostrarAlerta && window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Nota guardada com sucesso!", "success");
                Workspace.Bau.renderizarListaNotas(); 
                return true;
            } catch(e) {
                if(status) status.innerText = 'Falha ao sincronizar ❌';
                return false;
            }
        },

     apagarNota: (id) => {
            // 🚀 Aciona o modal de confirmação bonito para as Notas
            Workspace.Sidebar.mostrarConfirmacao(
                "Apagar Nota?",
                "Tem a certeza de que deseja eliminar esta anotação para sempre? Esta ação não tem retorno.",
                async () => {
                    // 🚀 1. DESTRUIÇÃO IMEDIATA NA TELA (Optimistic UI)
                    // Apagamos a nota do ecrã no exato milissegundo em que o utilizador clica!
                    Workspace.Bau.notasCache = Workspace.Bau.notasCache.filter(n => n.id !== id);
                    Workspace.Bau.renderizarListaNotas();
                    
                    // 2. Avisamos a nuvem (Base de Dados) em segundo plano
                    try {
                        await Workspace.api(`/workspace/bau/notas/${id}`, 'DELETE');
                        if (window.Workspace && Workspace.mostrarAviso) {
                            Workspace.mostrarAviso("Nota apagada com sucesso!", "success");
                        }
                    } catch(e) {
                        // Se a nota fantasma der erro na nuvem (porque já nem existia direito), 
                        // o sistema ignora e não chateia o utilizador. A UX mantém-se limpa!
                    }
                }
            );
        },

        // ======================= SISTEMA DE CALENDÁRIO & ALARMES =======================
        mudarMes: (direcao) => {
            Workspace.Bau.calDataAtual.setMonth(Workspace.Bau.calDataAtual.getMonth() + direcao);
            Workspace.Bau.renderizarCalendario();
            Workspace.Bau.atualizarCalendarioVisual(); 
        },

        renderizarCalendario: () => {
            const gridDias = document.getElementById('ws-bau-cal-dias');
            const labelMesAno = document.getElementById('ws-bau-cal-mesano');
            if(!gridDias || !labelMesAno) return;

            const ano = Workspace.Bau.calDataAtual.getFullYear();
            const mes = Workspace.Bau.calDataAtual.getMonth(); 
            
            const nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
            labelMesAno.innerText = `${nomesMeses[mes]} ${ano}`;

            const primeiroDiaDaSemana = new Date(ano, mes, 1).getDay(); 
            const diasNoMes = new Date(ano, mes + 1, 0).getDate();
            
            const hoje = new Date();
            hoje.setHours(0,0,0,0); 

            let html = '';
            for (let i = 0; i < primeiroDiaDaSemana; i++) {
                html += `<div style="padding: 10px; background: transparent;"></div>`;
            }

            for (let dia = 1; dia <= diasNoMes; dia++) {
                const dataDesteDia = new Date(ano, mes, dia);
                const diaDaSemana = dataDesteDia.getDay();
                
                const ehPassado = dataDesteDia < hoje;
                const ehHoje = dataDesteDia.getTime() === hoje.getTime();
                const ehDomingo = diaDaSemana === 0;
                
                let corTexto = ehDomingo ? '#e74c3c' : '#333';
                let cursor = 'cursor: pointer;';
                let hover = `onmouseover="this.style.background='#3498db'; this.style.color='white'" onmouseout="this.style.background='${ehHoje ? '#e8f4f8' : 'white'}'; this.style.color='${corTexto}'"`;
                let clique = `onclick="Workspace.Bau.abrirModalAgendamento(${ano}, ${mes}, ${dia})"`;

                if (ehPassado) {
                    corTexto = '#ccc'; cursor = 'cursor: not-allowed;'; hover = ''; clique = '';
                }
                const estiloBase = `padding: 10px 5px; background: ${ehHoje ? '#e8f4f8' : 'white'}; border-radius: 6px; border: 1px solid ${ehHoje ? '#3498db' : '#eee'}; color: ${corTexto}; font-weight: ${ehHoje ? 'bold' : 'normal'}; ${cursor} transition: 0.2s;`;
                html += `<div style="${estiloBase}" ${hover} ${clique}>${dia}</div>`;
            }
            gridDias.innerHTML = html;
        },

        abrirModalAgendamento: (ano, mes, dia) => {
            const modal = document.getElementById('ws-modal-alarme');
            if(!modal) return;
            document.getElementById('ws-alarme-ano').value = ano;
            document.getElementById('ws-alarme-mes').value = mes;
            document.getElementById('ws-alarme-dia').value = dia;

            const dataFormatada = new Date(ano, mes, dia).toLocaleDateString('pt-BR');
            document.getElementById('ws-modal-alarme-data').innerText = `Agendando para: ${dataFormatada}`;
            document.getElementById('ws-alarme-hora').value = '';
            document.getElementById('ws-alarme-msg').value = '';
            modal.style.display = 'flex';
        },

        confirmarAgendamento: async () => {
            const ano = document.getElementById('ws-alarme-ano').value;
            const mes = document.getElementById('ws-alarme-mes').value;
            const dia = document.getElementById('ws-alarme-dia').value;
            const horaStr = document.getElementById('ws-alarme-hora').value; 
            const msg = document.getElementById('ws-alarme-msg').value.trim();

            if (!horaStr || !msg) return Workspace.mostrarAviso("Preencha a hora e a mensagem!", "warning");
            const [horas, minutos] = horaStr.split(':');
            
            const dataDisparo = new Date(ano, mes, dia, parseInt(horas), parseInt(minutos), 0, 0);
            const tempoDisparo = dataDisparo.getTime();

            if (tempoDisparo <= new Date().getTime()) {
                return Workspace.mostrarAviso("O horário escolhido já passou. Escolha um horário futuro.", "warning");
            }

            try {
                const res = await Workspace.api('/workspace/bau/alarmes', 'POST', { usuarioId: Workspace.usuario.id, mensagem: msg, tempoDisparo: tempoDisparo });
                if (res && res.success) {
                    Workspace.Bau.alarmesAtivos.push({ id: res.id, mensagem: msg, tempoDisparo: tempoDisparo, disparado: false });
                    Workspace.Bau.atualizarCalendarioVisual();
                    document.getElementById('ws-modal-alarme').style.display = 'none';
                    Workspace.mostrarAviso("Lembrete agendado com sucesso e precisão!", "success");
                }
            } catch(e) { Workspace.mostrarAviso("Erro ao agendar lembrete na nuvem.", "error"); }
        },

        atualizarCalendarioVisual: () => {
            const calVisual = document.getElementById('ws-bau-calendario-visual');
            if (!calVisual) return;

            const mesAtual = Workspace.Bau.calDataAtual.getMonth();
            const anoAtual = Workspace.Bau.calDataAtual.getFullYear();

            const alarmesDoMes = Workspace.Bau.alarmesAtivos.filter(a => {
                const d = new Date(a.tempoDisparo);
                return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
            });

            if (alarmesDoMes.length > 0) {
                let html = '<div style="display: flex; flex-direction: column; gap: 8px; text-align:left;">';
                alarmesDoMes.sort((a,b) => a.tempoDisparo - b.tempoDisparo).forEach(alarme => {
                    const dataObj = new Date(alarme.tempoDisparo);
                    const dataFormat = dataObj.toLocaleDateString('pt-BR');
                    const horaFormat = dataObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
                    
                    const statusColor = alarme.disparado ? '#95a5a6' : '#27ae60';
                    const bgColor = alarme.disparado ? '#f0f2f5' : '#eafaf1';
                    
                    html += `
                        <div style="background: ${bgColor}; border-left: 3px solid ${statusColor}; padding: 10px; border-radius: 4px; font-size: 13px; display: flex; justify-content: space-between; align-items: center;">
                            <div style="cursor: pointer;" onclick="Workspace.Bau.irParaCalendarioDoBau(${alarme.tempoDisparo})">
                                <strong style="color: ${statusColor};">${dataFormat} às ${horaFormat}</strong><br>
                                <span style="color: ${alarme.disparado ? '#7f8c8d' : '#333'}; font-weight: 500;">${Workspace.escapeHTML(alarme.mensagem)}</span>
                            </div>
                            <button onclick="Workspace.Bau.apagarAlarme('${alarme.id}')" style="background: transparent; border: none; color: #e74c3c; font-size: 16px; cursor: pointer; padding: 5px;" title="Remover Lembrete">🗑️</button>
                        </div>`;
                });
                html += '</div>';
                calVisual.innerHTML = html;
            } else { calVisual.innerHTML = "Nenhum evento agendado neste mês."; }
        },

       apagarAlarme: (id) => {
            // 🚀 Aciona o modal de confirmação bonito para os Lembretes
            Workspace.Sidebar.mostrarConfirmacao(
                "Apagar Lembrete?",
                "Tem a certeza de que deseja apagar definitivamente este lembrete do seu calendário?",
                async () => {
                    // 1. Apaga do ecrã na mesma hora (Optimistic UI)
                    Workspace.Bau.alarmesAtivos = Workspace.Bau.alarmesAtivos.filter(a => a.id !== id);
                    Workspace.Bau.atualizarCalendarioVisual(); 
                    
                    // 🚀 A CORREÇÃO: Removemos a chamada à função fantasma que quebrava o JavaScript!
                    
                    // 2. Avisa a Nuvem (Base de Dados) para apagar definitivamente
                    try { 
                        await Workspace.api(`/workspace/bau/alarmes/${id}`, 'DELETE'); 
                        if (window.Workspace && Workspace.mostrarAviso) {
                            Workspace.mostrarAviso("Lembrete removido com sucesso!", "success");
                        }
                    } catch(e) {
                        console.error("Erro ao tentar apagar o alarme na nuvem", e);
                    }
                }
            );
        },

        // 🚀 O CORAÇÃO DO SISTEMA DE ALARMES
        verificarAlarme: () => {
            const agora = new Date().getTime();
            
            Workspace.Bau.alarmesAtivos.forEach(async (alarme) => {
                // SE A HORA CHEGOU E AINDA NÃO DISPAROU!
                if (!alarme.disparado && agora >= alarme.tempoDisparo) {
                    
                    // 1. Acorda a Tela Gigante!
                    Workspace.Bau.abrirAlarmeGigante(alarme);
                    
                    // 2. Marca como disparado na memória do navegador
                    alarme.disparado = true;
                    Workspace.Bau.atualizarCalendarioVisual();

                    // 3. Informa a Nuvem para pintar de cinzento permanentemente
                    try { await Workspace.api(`/workspace/bau/alarmes/${alarme.id}/disparado`, 'PUT'); } catch(e) {}
                }
            });
        },

        // ======================= INTELIGÊNCIA DO MODAL GIGANTE E INTEGRAÇÃO GLOBAL =======================
        abrirAlarmeGigante: (alarme) => {
            Workspace.Bau.alarmeGiganteAtual = alarme;
            const modal = document.getElementById('ws-modal-alarme-gigante');
            
            const dataObj = new Date(alarme.tempoDisparo);
            const horaFormat = dataObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
            
            document.getElementById('ws-alarme-gigante-msg').innerText = alarme.mensagem;
            document.getElementById('ws-alarme-gigante-tempo').innerText = `Agendado para às ${horaFormat}`;
            
            modal.style.display = 'flex';
            if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
        },

        fecharAlarmeGigante: () => {
            document.getElementById('ws-modal-alarme-gigante').style.display = 'none';
            const alarme = Workspace.Bau.alarmeGiganteAtual;
            
            // 🚀 A INTEGRAÇÃO MÁGICA: Ao fechar, envia para o Sininho Principal!
            if (alarme && Workspace.Alertas) {
                const idLocal = `alerta_local_bau_${alarme.id}`;
                
                if (!Workspace.Alertas.idsConhecidos.has(idLocal)) {
                    const dataObj = new Date(alarme.tempoDisparo);
                    const horaFormat = dataObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
                    const dataFormat = dataObj.toLocaleDateString('pt-BR');

                    const novaNotificacao = {
                        id: idLocal,
                        escolaId: Workspace.usuario.escolaId || 'DEFAULT',
                        destinatarioNome: Workspace.usuario.nome || Workspace.usuario.login,
                        remetenteNome: '🧰 Baú das Memórias',
                        mensagem: `O lembrete "${alarme.mensagem}" tocou às ${horaFormat} do dia ${dataFormat}.`,
                        origem: 'bau',
                        origemId: alarme.tempoDisparo, // Guardamos o tempo para o clique levar ao calendário
                        destinoNome: '',
                        lida: false,
                        // Guardamos a data original para o Sininho calcular "Há X min" perfeitamente
                        data: dataObj.toISOString() 
                    };
                    
                    Workspace.Alertas.notificacoesAtuais.unshift(novaNotificacao);
                    Workspace.Alertas.idsConhecidos.add(idLocal);
                    
                    // Faz o Sininho principal abanar e atualiza o ecrã
                    const bell = document.getElementById('ws-bell');
                    if (bell) { bell.classList.add('bell-ringing'); setTimeout(() => bell.classList.remove('bell-ringing'), 1000); }
                    Workspace.Alertas.atualizarInterface();
                }
            }
            Workspace.Bau.alarmeGiganteAtual = null;
        }
    },
 
    // ============================================================================
    // 🚀 MOTOR DA BIBLIOTECA INTELIGENTE
    // ============================================================================
    Biblioteca: {
       pesquisar: async () => {
            const input = document.getElementById('ws-busca-biblioteca');
            const termo = input.value.trim();
            const grid = document.getElementById('ws-biblioteca-grid');
            
            if (!termo) {
                if (Workspace.mostrarAviso) Workspace.mostrarAviso("Digite o título ou autor que deseja procurar.", "warning");
                return;
            }

            // Animação de Carregamento bonita
            grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 60px; color: #f39c12; font-weight: bold;"><div style="font-size: 30px; margin-bottom: 10px; animation: piscarSuave 1s infinite;">📡</div>Mergulhando na base de dados e na internet... ⏳</div>';

            try {
                // Chama o nosso Cérebro Agregador no servidor
                const res = await Workspace.api(`/workspace/biblioteca/pesquisar?termo=${encodeURIComponent(termo)}`, 'GET');
                
                if (res && res.success && res.livros.length > 0) {
                    // Pinta os livros no ecrã com a etiqueta dinâmica de Origem!
                    grid.innerHTML = res.livros.map((livro, index) => `
                        <div class="ws-card" style="padding: 15px; display: flex; flex-direction: column; align-items: center; text-align: center; transition: 0.3s; cursor: pointer; animation: fadeUpIn 0.4s ease forwards ${index * 0.05}s; opacity: 0; transform: translateY(20px);" onmouseover="this.style.transform='translateY(-8px)'; this.style.boxShadow='0 15px 30px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)'" onclick="Workspace.Biblioteca.abrirLivro('${livro.urlLeitura}', '${Workspace.Feed.limparTexto(livro.titulo)}', ${livro.linkExterno})">
                            <img src="${livro.capa}" alt="Capa" style="width: 130px; height: 190px; object-fit: cover; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.2);">
                            <h4 style="margin: 0 0 5px 0; color: #2c3e50; font-size: 14px; font-weight: 700; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.3;">${Workspace.escapeHTML(livro.titulo)}</h4>
                            <span style="font-size: 11px; color: #7f8c8d; margin-bottom: 10px; font-weight: 500;">${Workspace.escapeHTML(livro.autor)}</span>
                            
                            <!-- A MÁGICA DA ETIQUETA DE ORIGEM AQUI -->
                            ${livro.linkExterno 
                                ? `<span style="font-size: 10px; background: #e0f2fe; color: #2563eb; padding: 4px 10px; border-radius: 12px; font-weight: bold; width: 100%; display: flex; align-items: center; justify-content: center; gap: 5px;">🌐 ${Workspace.escapeHTML(livro.origem || 'Leitura Web')}</span>` 
                                : `<span style="font-size: 10px; background: #dcf8c6; color: #27ae60; padding: 4px 10px; border-radius: 12px; font-weight: bold; width: 100%; display: flex; align-items: center; justify-content: center; gap: 5px;">📚 Acervo Local</span>`}
                        </div>
                    `).join('');
                } else {
                    grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 50px; color: #e74c3c; background: #fdf2f2; border-radius: 12px;"><div style="font-size: 40px; margin-bottom: 10px;">📭</div>Nenhum livro encontrado nas bibliotecas globais. Tente um título diferente ou em outro idioma!</div>';
                }
            } catch (e) {
                console.error(e);
                grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #e74c3c; font-weight: bold;">Falha de comunicação com a Grande Biblioteca. Tente novamente!</div>';
            }
        },

        // 1. Atualizamos esta função para usar o nosso novo leitor!
        abrirLivro: (url, titulo, externo) => {
            if (externo) {
                // Em vez de atirar para fora do site, abrimos a nossa "Janela de Vidro"
                Workspace.Biblioteca.abrirLeitorEmbutido(url, titulo);
            } else {
                // Se for um PDF nosso, usa o super leitor que já criámos no Feed!
                if (Workspace.Feed && Workspace.Feed.abrirDocumento) {
                    Workspace.Feed.abrirDocumento(url, titulo, false);
                } else {
                    window.open(url, '_blank');
                }
            }
        },

        // 2. A NOVA FUNÇÃO: Cria o ecrã escuro e o Leitor Embutido
        abrirLeitorEmbutido: (url, titulo) => {
            const id = 'ws-leitor-externo-modal';
            // Se já existir um aberto, removemos primeiro para não duplicar
            if (document.getElementById(id)) document.getElementById(id).remove();

            const overlay = document.createElement('div');
            overlay.id = id;
            // Estilo do fundo escuro, em ecrã inteiro, por cima de tudo
            overlay.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; z-index:2147483647; background:rgba(0,0,0,0.9); backdrop-filter:blur(5px); opacity:0; transition: opacity 0.3s; display:flex; flex-direction:column; align-items:center; justify-content:center;";

            // Usa a mesma função de segurança do Feed para limpar o título
            const tituloSeguro = Workspace.Feed ? Workspace.Feed.limparTexto(titulo) : titulo;

            // Desenhamos a estrutura HTML do Leitor
            overlay.innerHTML = `
                <!-- CABEÇALHO FLUTUANTE -->
                <div style="width:100%; padding:15px 20px; display:flex; justify-content:space-between; align-items:center; box-sizing:border-box; background:linear-gradient(to bottom, rgba(0,0,0,0.8), transparent); position:absolute; top:0; left:0; z-index:10;">
                    <div style="color:white; font-weight:bold; font-size:16px; text-shadow:1px 1px 3px rgba(0,0,0,0.8);">📖 ${tituloSeguro}</div>
                    
                    <div style="display:flex; gap:15px; align-items:center;">
                        <!-- O nosso Plano B: Botão caso o site externo bloqueie a janela -->
                        <a href="${url}" target="_blank" style="color:#3498db; text-decoration:none; font-size:12px; font-weight:bold; background:rgba(255,255,255,0.1); padding:8px 14px; border-radius:20px; transition:0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'" title="Clique se o livro não carregar">Abrir noutra janela ↗</a>
                        
                        <!-- Botão de Fechar -->
                        <button onclick="document.getElementById('${id}').style.opacity='0'; setTimeout(()=>document.getElementById('${id}').remove(), 300)" style="background:#e74c3c; border:none; color:white; font-size:18px; cursor:pointer; font-weight:bold; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; transition:0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">✕</button>
                    </div>
                </div>

                <!-- MENSAGEM DE CARREGAMENTO (Fica atrás do livro, visível até ele abrir) -->
                <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color:#aaa; font-size:14px; font-weight:bold; z-index:1; display:flex; flex-direction:column; align-items:center; gap:10px;">
                    <span style="font-size:30px; animation: piscarSuave 1s infinite;">⏳</span>
                    A carregar a biblioteca externa...
                </div>

                <!-- A JANELA DE VIDRO (IFRAME) -->
                <iframe src="${url}" style="width:95vw; height:85vh; max-width:1200px; margin-top:50px; border:none; border-radius:12px; background:white; position:relative; z-index:2; box-shadow:0 10px 40px rgba(0,0,0,0.5);"></iframe>
            `;

            document.body.appendChild(overlay);

            // Magia suave para o ecrã aparecer de forma elegante
            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
            });
        }
    },  

    // ============================================================================
    // 🚀 MOTOR DE COMANDO UNIVERSAL (SPOTLIGHT / CTRL + K)
    // ============================================================================
    ComandoMágico: {
        aberto: false,
        indiceFocado: 0,
        atalhos: [
            { id: 'feed', titulo: 'Página Inicial (Feed)', icone: '🏠', tela: 'feed' },
            { id: 'perfil', titulo: 'Meu Perfil', icone: '🙍', tela: 'perfil' },
            { id: 'sala_aula', titulo: 'Hub da Sala de Aula', icone: '🏫', tela: 'sala_aula' },
            { id: 'tarefas', titulo: 'Exercícios', icone: '🏋️', tela: 'tarefas' },
            { id: 'avaliacoes', titulo: 'Central de Avaliações', icone: '📑', tela: 'avaliacoes' },
            { id: 'materiais', titulo: 'Estante de Materiais', icone: '📚', tela: 'materiais' },
            { id: 'bau', titulo: 'Baú das Memórias (Lembretes)', icone: '🧰', tela: 'bau' },
            { id: 'configuracoes', titulo: 'Configurações', icone: '⚙️', tela: 'configuracoes' }
        ],

        init: () => {
            // Escuta o teclado do utilizador de forma invisível
            document.addEventListener('keydown', (e) => {
                // Se pressionar Ctrl + K (ou Cmd + K no Mac)
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                    e.preventDefault(); 
                    Workspace.ComandoMágico.abrir();
                }
                // Se pressionar ESC e estiver aberto
                if (e.key === 'Escape' && Workspace.ComandoMágico.aberto) {
                    Workspace.ComandoMágico.fechar();
                }
            });

            // Configura a caixa de pesquisa
            const input = document.getElementById('ws-spotlight-input');
            if (input) {
                input.addEventListener('input', (e) => Workspace.ComandoMágico.filtrar(e.target.value));
                input.addEventListener('keydown', Workspace.ComandoMágico.navegarTeclado);
            }

            // Fecha ao clicar fora da caixa
            const overlay = document.getElementById('ws-spotlight-overlay');
            if (overlay) {
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) Workspace.ComandoMágico.fechar();
                });
            }
        },

        abrir: () => {
            const overlay = document.getElementById('ws-spotlight-overlay');
            const box = document.getElementById('ws-spotlight-box');
            const input = document.getElementById('ws-spotlight-input');
            
            if (!overlay || !box || !input) return;

            Workspace.ComandoMágico.aberto = true;
            input.value = '';
            Workspace.ComandoMágico.filtrar(''); // Mostra tudo inicialmente
            
            overlay.style.display = 'flex';
            // Magia CSS para animação suave
            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
                box.style.transform = 'scale(1)';
            });
            
            setTimeout(() => input.focus(), 100);
        },

        fechar: () => {
            const overlay = document.getElementById('ws-spotlight-overlay');
            const box = document.getElementById('ws-spotlight-box');
            if (!overlay || !box) return;

            Workspace.ComandoMágico.aberto = false;
            overlay.style.opacity = '0';
            box.style.transform = 'scale(0.95)';
            
            setTimeout(() => { overlay.style.display = 'none'; }, 200);
        },

        filtrar: (termo) => {
            const container = document.getElementById('ws-spotlight-resultados');
            if (!container) return;

            termo = termo.toLowerCase().trim();
            const resultados = Workspace.ComandoMágico.atalhos.filter(a => a.titulo.toLowerCase().includes(termo));
            
            Workspace.ComandoMágico.indiceFocado = 0; // Volta o foco para o primeiro

            if (resultados.length === 0) {
                container.innerHTML = '<div style="text-align:center; padding: 20px; color: #94a3b8; font-size: 13px;">Nenhum destino encontrado.</div>';
                return;
            }

            container.innerHTML = resultados.map((item, index) => `
                <div class="ws-spotlight-item ${index === 0 ? 'active' : ''}" data-tela="${item.tela}" onclick="Workspace.ComandoMágico.viajarPara('${item.tela}')" onmouseover="Workspace.ComandoMágico.focarManual(${index})">
                    <div class="icone">${item.icone}</div>
                    <div>${item.titulo}</div>
                </div>
            `).join('');
        },

        navegarTeclado: (e) => {
            const itens = document.querySelectorAll('.ws-spotlight-item');
            if (itens.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                Workspace.ComandoMágico.indiceFocado = (Workspace.ComandoMágico.indiceFocado + 1) % itens.length;
                Workspace.ComandoMágico.atualizarFocoVisial(itens);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                Workspace.ComandoMágico.indiceFocado = (Workspace.ComandoMágico.indiceFocado - 1 + itens.length) % itens.length;
                Workspace.ComandoMágico.atualizarFocoVisial(itens);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const telaDestino = itens[Workspace.ComandoMágico.indiceFocado].getAttribute('data-tela');
                Workspace.ComandoMágico.viajarPara(telaDestino);
            }
        },

        focarManual: (index) => {
            Workspace.ComandoMágico.indiceFocado = index;
            const itens = document.querySelectorAll('.ws-spotlight-item');
            Workspace.ComandoMágico.atualizarFocoVisial(itens);
        },

        atualizarFocoVisial: (itens) => {
            itens.forEach(i => i.classList.remove('active'));
            if (itens[Workspace.ComandoMágico.indiceFocado]) {
                const ativo = itens[Workspace.ComandoMágico.indiceFocado];
                ativo.classList.add('active');
                ativo.scrollIntoView({ block: 'nearest' });
            }
        },

        viajarPara: (tela) => {
            Workspace.ComandoMágico.fechar();
            Workspace.navegarPara(tela);
        }
    }

});

document.addEventListener('DOMContentLoaded', Workspace.init);