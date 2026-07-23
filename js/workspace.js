import { CONFIG } from './config.js';
import './pwa-updater.js';
import './toast.js'; 
import './modulos/workspace/feed.js';
import './modulos/workspace/upload.js';
import './modulos/workspace/alertas.js'; 
import './modulos/workspace/sidebar.js';
import './modulos/workspace/avaliacoes.js';

window.Workspace = window.Workspace || {};
const Workspace = window.Workspace;

Object.assign(Workspace, {
    usuario: null,
    avatarsCache: {}, 
    deferredPrompt: null,

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
            return;
        }
        
        Workspace.usuario = JSON.parse(cacheUser);
        document.getElementById('ws-login-screen').style.display = 'none';
        document.getElementById('ws-navbar').style.display = 'flex';
        
        Workspace.navegarPara('feed', true);

        const boxCriarPost = document.getElementById('ws-criar-post');
        if (boxCriarPost) boxCriarPost.style.display = 'block';

        Workspace.avatarsCache = await Workspace.api('/workspace/avatars', 'GET') || {};
        Workspace.avatarsCache[Workspace.usuario.nome || Workspace.usuario.login] = Workspace.usuario.avatar;

        if (Workspace.Feed) await Workspace.Feed.init();
        if (Workspace.Upload) Workspace.Upload.init();
        if (Workspace.Alertas) Workspace.Alertas.init(); 
        if (Workspace.Bau) Workspace.Bau.carregarDadosDaNuvem();
        if (Workspace.Sidebar) await Workspace.Sidebar.init(); 
        if (Workspace.Avaliacoes) Workspace.Avaliacoes.init();

        document.addEventListener('click', (e) => {
            const menuContainer = document.getElementById('ws-menu-left-container');
            const menuDropdown = document.getElementById('ws-main-menu-dropdown');
            if (menuContainer && menuDropdown && !menuContainer.contains(e.target)) {
                menuDropdown.style.display = 'none';
            }
        });

        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.tela) Workspace.navegarPara(e.state.tela, false); 
            else Workspace.navegarPara('feed', false);
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
            'encontros_prof': 'ws-avaliacoes-prof-container' // Partilha o mesmo ecrã físico, mas altera o contexto!
        };

        if (tela === 'tarefas') tela = Workspace.usuario.tipo === 'Aluno' ? 'tarefas_aluno' : 'tarefas_prof';
        if (tela === 'avaliacoes') tela = Workspace.usuario.tipo === 'Aluno' ? 'avaliacoes_aluno' : 'avaliacoes_prof';

        // 🚀 O CAMALEÃO: Modifica o painel do professor conforme o clique no Hub
        if (tela === 'encontros_prof') {
            tela = 'avaliacoes_prof';
            if (Workspace.Avaliacoes && Workspace.Avaliacoes.setContextoProf) Workspace.Avaliacoes.setContextoProf('encontros');
        } else if (tela === 'avaliacoes_prof') {
            if (Workspace.Avaliacoes && Workspace.Avaliacoes.setContextoProf) Workspace.Avaliacoes.setContextoProf('avaliacoes');
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

        if (registarNoHistorico) history.pushState({ tela: tela }, '', `#${tela.replace('_', '-')}`);
    },

    fazerLogin: async () => {
        const login = document.getElementById('ws-login-user').value.trim();
        const pass = document.getElementById('ws-login-pass').value.trim();
        if(!login || !pass) return Workspace.mostrarAviso("Preencha utilizador e senha", "warning");

        const btn = document.querySelector('#ws-login-screen button');
        const txt = btn.innerText; btn.innerText = "Logando... ⏳"; btn.disabled = true;

        try {
            const res = await Workspace.api('/auth/login', 'POST', { login, senha: pass, deviceId: 'ws_web', sistema: 'workspace' });
            if(res && res.success) {
                localStorage.setItem('ws_usuario_logado', JSON.stringify(res.usuario));
                Workspace.init(); 
            } else {
                Workspace.mostrarAviso(res.error || "Login ou senha incorretos", "error");
            }
        } catch(e) { Workspace.mostrarAviso("Erro de comunicação com o servidor.", "error"); } 
        finally { btn.innerText = txt; btn.disabled = false; }
    },

    // 🎨 RENDERIZADOR UNIVERSAL DE AVATARES (Com CSS Inquebrável para proporções perfeitas)
    renderizarAvatar: (nomeAutor, tamanho = 40) => {
        const nomeStr = nomeAutor || 'Desconhecido';
        const url = Workspace.avatarsCache[nomeStr];
        
        if (url) {
            // 🚀 O SEGREDO DO CSS: 'aspect-ratio: 1/1', 'object-position: center' e 'flex-shrink: 0' impedem distorções e vazios!
            return `<img src="${url}" loading="lazy" style="width:${tamanho}px; height:${tamanho}px; min-width:${tamanho}px; max-width:${tamanho}px; border-radius:50%; object-fit:cover; object-position:center; aspect-ratio:1/1; border:2px solid #eee; box-shadow:0 2px 5px rgba(0,0,0,0.05); background:#fff; flex-shrink:0;">`;
        } else {
            const letra = nomeStr.charAt(0).toUpperCase();
            const corFundo = Workspace.gerarCorPorNome(nomeStr);
            return `<div style="width:${tamanho}px; height:${tamanho}px; min-width:${tamanho}px; max-width:${tamanho}px; aspect-ratio:1/1; border-radius:50%; background:${corFundo}; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:${tamanho/2.2}px; border:2px solid #eee; box-shadow:0 2px 5px rgba(0,0,0,0.05); flex-shrink:0;">${letra}</div>`;
        }
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

    abrirModalPerfil: () => Workspace.abrirPaginaPerfil(),

    verMinhaFoto: () => {
        if (Workspace.usuario && Workspace.usuario.avatar) {
            Workspace.abrirVisualizadorImagem(Workspace.usuario.avatar, "Minha foto de perfil");
        } else {
            Workspace.mostrarAviso("Ainda não tem uma foto de perfil.", "info");
        }
    },

  // 📸 MOTOR DE AVATARES PESSOAIS EM ALTA RESOLUÇÃO (Smart Crop, Fundo Branco, High-Res)
    uploadAvatar: async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 100 * 1024 * 1024) {
            Workspace.mostrarAviso("A fotografia é maior que 100MB. Escolha uma mais leve.", "warning");
            event.target.value = '';
            return;
        }

        const loader = document.getElementById('ws-avatar-loading');
        if(loader) loader.style.display = 'block';

        const objectUrl = URL.createObjectURL(file);
        const imgOriginal = new Image();

        imgOriginal.onload = () => {
            const canvas = document.createElement('canvas');
            
            // 🚀 1. DOBRO DA RESOLUÇÃO (Para ecrãs HD e Retina)
            const MAX_SIZE = 800; 
            canvas.width = MAX_SIZE;
            canvas.height = MAX_SIZE;

            const ctx = canvas.getContext('2d');
            
            // 🚀 2. SUAVIZAÇÃO GRÁFICA DE ELITE
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // 🚀 3. FUNDO BRANCO OBRIGATÓRIO (Impede que PNGs transparentes quebrem)
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, MAX_SIZE, MAX_SIZE);
            
            // 🚀 4. MATEMÁTICA DO CORTE CENTRAL (Smart Crop Perfeito)
            const menorLado = Math.min(imgOriginal.width, imgOriginal.height);
            const sourceX = (imgOriginal.width - menorLado) / 2;
            const sourceY = (imgOriginal.height - menorLado) / 2;

            ctx.drawImage(imgOriginal, sourceX, sourceY, menorLado, menorLado, 0, 0, MAX_SIZE, MAX_SIZE);

            // 🚀 5. COMPRESSÃO PREMIUM (0.92 garante nitidez)
            canvas.toBlob(async (blob) => {
                URL.revokeObjectURL(objectUrl); 

                if (!blob || blob.size < 100) {
                    Workspace.mostrarAviso("Erro ao processar a imagem.", "error");
                    if(loader) loader.style.display = 'none';
                    event.target.value = '';
                    return;
                }

                try {
                    const formData = new FormData();
                    formData.append('anexos', blob, 'avatar_usuario.jpg');

                    const uploadRes = await fetch('/api/workspace/upload', { method: 'POST', credentials: 'include', body: formData });
                    if (!uploadRes.ok) throw new Error("A ligação à nuvem falhou.");
                    const uploadData = await uploadRes.json();
                    
                    if (!uploadData.success || !uploadData.anexos || uploadData.anexos.length === 0) throw new Error("Falha.");

                    const avatarFinal = uploadData.anexos[0].url;

                    const res = await Workspace.api('/workspace/perfil/avatar', 'PUT', {
                        id: Workspace.usuario.id, alunoRefId: Workspace.usuario.alunoRefId || null, avatarUrl: avatarFinal
                    });

                    if (res && res.success) {
                        Workspace.usuario.avatar = avatarFinal;
                        localStorage.setItem('ws_usuario_logado', JSON.stringify(Workspace.usuario));
                        Workspace.avatarsCache[Workspace.usuario.nome || Workspace.usuario.login] = avatarFinal;
                        
                        const img = document.getElementById('ws-perfil-img');
                        const letras = document.getElementById('ws-perfil-letras');
                        if(img) { img.src = avatarFinal; img.style.display = 'block'; }
                        if(letras) letras.style.display = 'none';

                        Workspace.mostrarAviso("Foto de perfil atualizada com qualidade HD!", "success");
                        if(Workspace.Sidebar) Workspace.Sidebar.carregarTurmas();
                        if(Workspace.Feed) Workspace.Feed.carregarPosts();
                    }
                } catch (err) {
                    console.error(err);
                    Workspace.mostrarAviso("Erro ao alterar foto. Tente novamente.", "error");
                } finally {
                    if(loader) loader.style.display = 'none';
                    event.target.value = ''; 
                }
            }, 'image/jpeg', 0.92); 
        };
        
        imgOriginal.onerror = () => {
            Workspace.mostrarAviso("Ficheiro inválido.", "error");
            URL.revokeObjectURL(objectUrl);
            if(loader) loader.style.display = 'none';
            event.target.value = '';
        };

        imgOriginal.src = objectUrl;
    },

    abrirPaginaTarefas: () => Workspace.navegarPara('tarefas'),
    abrirPaginaBau: () => Workspace.navegarPara('bau'),
    abrirPaginaAvaliacoes: () => Workspace.navegarPara('avaliacoes'),
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
        const txt = btn.innerText; btn.innerText = "A encriptar e a guardar... ⏳"; btn.disabled = true;
        
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
    // 🧰 MOTOR DO BAÚ DAS MEMÓRIAS (Calendário, Notas Multi-Telas e Relógio Preciso)
    // ============================================================================
    Bau: {
        alarmesAtivos: [],
        notasCache: [],
        notaAbertaId: null,
        salvamentoTimer: null,
        radarDeAlarmes: null,
        calDataAtual: new Date(), // Mês/Ano que está a ser visualizado no calendário

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

        carregarDadosDaNuvem: async () => {
            try {
                // 1. Puxa Todas as Notas
                const resNotas = await Workspace.api(`/workspace/bau/notas?usuarioId=${Workspace.usuario.id}`, 'GET');
                if (resNotas && resNotas.dados) Workspace.Bau.notasCache = resNotas.dados;
                Workspace.Bau.renderizarListaNotas();

                // 2. Puxa Lembretes e Renderiza Calendário
                const resAlarmes = await Workspace.api(`/workspace/bau/alarmes?usuarioId=${Workspace.usuario.id}`, 'GET');
                if (resAlarmes && Array.isArray(resAlarmes.dados)) Workspace.Bau.alarmesAtivos = resAlarmes.dados;
                
                Workspace.Bau.renderizarCalendario();
                Workspace.Bau.atualizarCalendarioVisual();

                // 3. 🚀 O RELÓGIO DE PRECISÃO SUÍÇA (Verifica a cada 1 segundo = 1000ms)
                if(Workspace.Bau.radarDeAlarmes) clearInterval(Workspace.Bau.radarDeAlarmes);
                Workspace.Bau.radarDeAlarmes = setInterval(Workspace.Bau.verificarAlarme, 1000);
            } catch(e) { console.error("Erro ao carregar dados do Baú", e); }
        },

        // ======================= SISTEMA DE NOTAS =======================
        renderizarListaNotas: () => {
            const container = document.getElementById('ws-bau-lista-notas');
            if (!container) return;

            if (Workspace.Bau.notasCache.length === 0) {
                container.innerHTML = '<div style="text-align: center; color: #999; font-size: 13px; padding: 20px;">O seu caderno está vazio. Crie uma nova nota! 📝</div>';
                return;
            }

            let html = '';
            Workspace.Bau.notasCache.forEach(nota => {
                const dataStr = new Date(nota.dataAtualizacao || nota.dataCriacao).toLocaleDateString('pt-BR');
                html += `
                    <div style="background: white; border: 1px solid #ddd; padding: 12px 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: 0.2s;" onmouseover="this.style.borderColor='#3498db'; this.style.boxShadow='0 2px 8px rgba(52, 152, 219, 0.1)'" onmouseout="this.style.borderColor='#ddd'; this.style.boxShadow='none'">
                        <div style="flex: 1; min-width: 0;" onclick="Workspace.Bau.abrirNota('${nota.id}')">
                            <h5 style="margin: 0 0 4px 0; color: #2c3e50; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${Workspace.escapeHTML(nota.titulo)}</h5>
                            <span style="font-size: 11px; color: #aaa;">Atualizada em ${dataStr}</span>
                        </div>
                        <button onclick="Workspace.Bau.apagarNota('${nota.id}')" style="background: transparent; border: none; color: #e74c3c; font-size: 16px; cursor: pointer;" title="Apagar Nota">🗑️</button>
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
            else Workspace.Bau.abrirNota(Workspace.Bau.notaAbertaId); // Volta para leitura
        },

        // AUTO-SAVE EM SEGUNDO PLANO (Debounce)
        autoSalvarNota: () => {
            const status = document.getElementById('ws-bau-status-salvamento');
            if(status) status.innerText = 'A escrever... ✏️';

            clearTimeout(Workspace.Bau.salvamentoTimer);
            Workspace.Bau.salvamentoTimer = setTimeout(async () => {
                await Workspace.Bau.executarSalvamentoNuvem(false);
            }, 1500); 
        },

        // BOTÃO GRAVAR E SAIR
        salvarESairNota: async () => {
            clearTimeout(Workspace.Bau.salvamentoTimer); // Cancela o auto-save pendente
            const status = document.getElementById('ws-bau-status-salvamento');
            if(status) status.innerText = 'Guardando... ⏳';
            
            const sucesso = await Workspace.Bau.executarSalvamentoNuvem(true);
            if (sucesso) Workspace.Bau.abrirNota(Workspace.Bau.notaAbertaId); // Vai para leitura
        },

        // O Motor Real de Gravação
        executarSalvamentoNuvem: async (mostrarAlerta) => {
            const titulo = document.getElementById('ws-bau-edicao-titulo').value.trim();
            const texto = document.getElementById('ws-bau-edicao-texto').innerHTML;
            const status = document.getElementById('ws-bau-status-salvamento');

            if (!titulo && !texto) return false;

            try {
                let res;
                if (Workspace.Bau.notaAbertaId === 'nova') {
                    res = await Workspace.api('/workspace/bau/notas', 'POST', { usuarioId: Workspace.usuario.id, titulo, texto });
                    if(res && res.nota) {
                        Workspace.Bau.notaAbertaId = res.nota.id;
                        Workspace.Bau.notasCache.unshift(res.nota);
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

        apagarNota: async (id) => {
            if(confirm("Tem a certeza que deseja eliminar esta nota para sempre?")) {
                try {
                    await Workspace.api(`/workspace/bau/notas/${id}`, 'DELETE');
                    Workspace.Bau.notasCache = Workspace.Bau.notasCache.filter(n => n.id !== id);
                    Workspace.Bau.renderizarListaNotas();
                } catch(e) {}
            }
        },

        // ======================= SISTEMA DE CALENDÁRIO =======================
        mudarMes: (direcao) => {
            Workspace.Bau.calDataAtual.setMonth(Workspace.Bau.calDataAtual.getMonth() + direcao);
            Workspace.Bau.renderizarCalendario();
            Workspace.Bau.atualizarCalendarioVisual(); // Atualiza a lista abaixo do calendário!
        },

        renderizarCalendario: () => {
            const gridDias = document.getElementById('ws-bau-cal-dias');
            const labelMesAno = document.getElementById('ws-bau-cal-mesano');
            if(!gridDias || !labelMesAno) return;

            const ano = Workspace.Bau.calDataAtual.getFullYear();
            const mes = Workspace.Bau.calDataAtual.getMonth(); // 0 a 11
            
            const nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
            labelMesAno.innerText = `${nomesMeses[mes]} ${ano}`;

            const primeiroDiaDaSemana = new Date(ano, mes, 1).getDay(); // 0 (Dom) a 6 (Sab)
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
                    corTexto = '#ccc';
                    cursor = 'cursor: not-allowed;';
                    hover = ''; clique = '';
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
            
            const horaStr = document.getElementById('ws-alarme-hora').value; // Formato "HH:MM"
            const msg = document.getElementById('ws-alarme-msg').value.trim();

            if (!horaStr || !msg) return Workspace.mostrarAviso("Preencha a hora e a mensagem!", "warning");

            const [horas, minutos] = horaStr.split(':');
            
            // 🚀 Cria a data e hora absolutas exatas para o disparo
            const dataDisparo = new Date(ano, mes, dia, parseInt(horas), parseInt(minutos), 0, 0);
            const tempoDisparo = dataDisparo.getTime();

            // Verifica se a hora escolhida já não passou no dia de hoje
            if (tempoDisparo <= new Date().getTime()) {
                return Workspace.mostrarAviso("O horário escolhido já passou. Escolha um horário futuro.", "warning");
            }

            try {
                const res = await Workspace.api('/workspace/bau/alarmes', 'POST', {
                    usuarioId: Workspace.usuario.id,
                    mensagem: msg,
                    tempoDisparo: tempoDisparo
                });

                if (res && res.success) {
                    Workspace.Bau.alarmesAtivos.push({ id: res.id, mensagem: msg, tempoDisparo: tempoDisparo, disparado: false });
                    Workspace.Bau.atualizarCalendarioVisual();
                    document.getElementById('ws-modal-alarme').style.display = 'none';
                    Workspace.mostrarAviso("Lembrete agendado com sucesso e precisão!", "success");
                }
            } catch(e) {
                Workspace.mostrarAviso("Erro ao agendar lembrete na nuvem.", "error");
            }
        },

        atualizarCalendarioVisual: () => {
            const calVisual = document.getElementById('ws-bau-calendario-visual');
            if (!calVisual) return;

            // 🚀 FILTRO MÁGICO: Mostra apenas os lembretes do mês que está na tela!
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
                    
                    // 🚀 Se já disparou, fica cinzento. Se for futuro, fica verde.
                    const statusColor = alarme.disparado ? '#95a5a6' : '#27ae60';
                    const bgColor = alarme.disparado ? '#f0f2f5' : '#eafaf1';
                    
                    html += `
                        <div style="background: ${bgColor}; border-left: 3px solid ${statusColor}; padding: 10px; border-radius: 4px; font-size: 13px; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="color: ${statusColor};">${dataFormat} às ${horaFormat}</strong><br>
                                <span style="color: ${alarme.disparado ? '#7f8c8d' : '#333'}">${Workspace.escapeHTML(alarme.mensagem)}</span>
                            </div>
                            <!-- 🚀 NOVO: Botão Lixo para Apagar Manualmente -->
                            <button onclick="Workspace.Bau.apagarAlarme('${alarme.id}')" style="background: transparent; border: none; color: #e74c3c; font-size: 16px; cursor: pointer; padding: 5px;" title="Remover Lembrete">🗑️</button>
                        </div>`;
                });
                html += '</div>';
                calVisual.innerHTML = html;
            } else {
                calVisual.innerHTML = "Nenhum evento agendado neste mês.";
            }
        },

        apagarAlarme: async (id) => {
            if(confirm("Deseja apagar definitivamente este lembrete do seu calendário?")) {
                Workspace.Bau.alarmesAtivos = Workspace.Bau.alarmesAtivos.filter(a => a.id !== id);
                Workspace.Bau.atualizarCalendarioVisual(); // Limpa do ecrã
                try {
                    await Workspace.api(`/workspace/bau/alarmes/${id}`, 'DELETE');
                } catch(e) {}
            }
        },

        verificarAlarme: () => {
            const agora = new Date().getTime();
            
            Workspace.Bau.alarmesAtivos.forEach(async (alarme) => {
                // 🚀 Se a hora chegou e AINDA NÃO DISPAROU
                if (!alarme.disparado && agora >= alarme.tempoDisparo) {
                    
                    if (window.Workspace && Workspace.mostrarAviso) {
                        Workspace.mostrarAviso(`⏰ Lembrete do Baú: ${alarme.mensagem}`, 'pingpong', 12000);
                    }
                    
                    // Marca localmente como disparado e atualiza as cores para cinzento
                    alarme.disparado = true;
                    Workspace.Bau.atualizarCalendarioVisual();

                    // Avisa a Base de Dados que este alarme já tocou (não é apagado, apenas atualizado!)
                    try {
                        await Workspace.api(`/workspace/bau/alarmes/${alarme.id}/disparado`, 'PUT');
                    } catch(e) {}
                }
            });
        }
    }
});

document.addEventListener('DOMContentLoaded', Workspace.init);