// js/modulos/workspace/alertas.js
window.Workspace = window.Workspace || {};

Workspace.Alertas = {
    notificacoesAtuais: [],
    idsConhecidos: new Set(),
    primeiraBuscaConcluida: false,
    
    // Variáveis de memória para o Detetive de Retorno e Radar
    conexaoSSE: null, 
    momentoSaida: null,
    radarPolling: null,

    init: () => {
        console.log("🔔 Motor de Alertas: Conexão em Tempo Real (SSE) Ativada.");
        Workspace.Alertas.injetarCSS();
        Workspace.Alertas.construirDropdown();
        Workspace.Alertas.atualizarInterface();
        
        // Liga o vigia de abas adormecidas
        Workspace.Alertas.iniciarDetetiveRetorno();
        
        const aguardarUsuario = setInterval(() => {
            const meuNome = Workspace.usuario ? (Workspace.usuario.nome ? Workspace.usuario.nome : Workspace.usuario.login) : null;
            if (meuNome) {
                clearInterval(aguardarUsuario);
                Workspace.Alertas.buscarNotificacoes(); 
                Workspace.Alertas.iniciarConexaoTempoReal(); 

                // 🛡️ Radar de Segurança: Verifica novas notificações a cada 15s caso o túnel SSE oscile
                if (Workspace.Alertas.radarPolling) clearInterval(Workspace.Alertas.radarPolling);
                Workspace.Alertas.radarPolling = setInterval(() => {
                    if (document.visibilityState === 'visible' && Workspace.usuario) {
                        Workspace.Alertas.buscarNotificacoes(true);
                    }
                }, 15000);
            }
        }, 1000);
    },

    // ============================================================================
    // 🔄 SINCRONIZADOR DE NOME E FOTO DENTRO DO SININHO
    // ============================================================================
    sincronizarPerfilNasNotificacoes: (nomeAntigo, novoNome, loginUser, avatarUrl) => {
        const alvos = [nomeAntigo, loginUser, novoNome]
            .filter(Boolean)
            .map(s => String(s).trim().toLowerCase());

        let houveMudanca = false;

        // 1. Atualiza o cache de avatares global se veio uma foto
        if (novoNome) {
            if (!Workspace.avatarsCache) Workspace.avatarsCache = {};
            if (avatarUrl) {
                Workspace.avatarsCache[novoNome.trim()] = avatarUrl;
                if (window.Workspace.mapaAvatars) window.Workspace.mapaAvatars[novoNome.trim()] = avatarUrl;
            } else if (avatarUrl === null) {
                delete Workspace.avatarsCache[novoNome.trim()];
                if (nomeAntigo) delete Workspace.avatarsCache[String(nomeAntigo).trim()];
            }
        }

        // 2. Atualiza os nomes dentro da lista de notificações em memória
        if (novoNome && Array.isArray(Workspace.Alertas.notificacoesAtuais)) {
            Workspace.Alertas.notificacoesAtuais.forEach(n => {
                const remAtual = String(n.remetenteNome || '').trim().toLowerCase();
                if (alvos.includes(remAtual) && n.remetenteNome !== novoNome) {
                    n.remetenteNome = novoNome;
                    houveMudanca = true;
                }
                const destAtual = String(n.destinatarioNome || '').trim().toLowerCase();
                if (alvos.includes(destAtual) && n.destinatarioNome !== novoNome) {
                    n.destinatarioNome = novoNome;
                    houveMudanca = true;
                }
            });
        }

        // 3. Re-renderiza o dropdown do sininho preservando a posição do scroll
        if (houveMudanca || avatarUrl !== undefined) {
            Workspace.Alertas.atualizarInterface();
        }
    },

    // ============================================================================
    // 🩺 O DESFIBRILADOR: ACORDA O SITE APÓS MUITO TEMPO ADORMECIDO
    // ============================================================================
    iniciarDetetiveRetorno: () => {
        document.addEventListener('visibilitychange', () => {
            if (!window.Workspace || !Workspace.usuario) return;

            if (document.visibilityState === 'hidden') {
                Workspace.Alertas.momentoSaida = Date.now();
            } else if (document.visibilityState === 'visible') {
                if (Workspace.Alertas.momentoSaida) {
                    const tempoAusente = Date.now() - Workspace.Alertas.momentoSaida;
                    
                    if (tempoAusente > 60000 && Workspace.usuario) {
                        console.log("🔄 O aluno esteve ausente muito tempo. Reanimando o sistema...");
                        if (window.Workspace && Workspace.mostrarAviso) {
                            Workspace.mostrarAviso("Atualizando ⏳", "info", 2000);
                        }
                        Workspace.Alertas.reanimaSistema();
                    }
                    Workspace.Alertas.momentoSaida = null; 
                }
            }
        });
    },

    reanimaSistema: async () => {
        // 1. Reinicia o coração do site (Destrói a ligação velha e cria uma nova)
        Workspace.Alertas.iniciarConexaoTempoReal();

        // 2. Manda cada departamento recarregar as suas listas em silêncio
        if (window.Workspace) {
            if (typeof Workspace.atualizarCacheAvatares === 'function') {
                await Workspace.atualizarCacheAvatares();
            }
            if (Workspace.Alertas.buscarNotificacoes) Workspace.Alertas.buscarNotificacoes();
            
            if (Workspace.Avaliacoes && Workspace.Avaliacoes.carregarLobbies) Workspace.Avaliacoes.carregarLobbies();
            
            if (Workspace.Sidebar && Workspace.Sidebar.turmaIdAberta) {
                const elTitulo = document.getElementById('ws-chat-titulo');
                const nomeChat = elTitulo ? elTitulo.innerText : 'Bate-papo';
                Workspace.Sidebar.abrirChat(Workspace.Sidebar.turmaIdAberta, nomeChat);
            }

            if (Workspace.Feed && Workspace.Feed.carregarPosts) {
                Workspace.Feed.todosOsPosts = [];
                Workspace.Feed.carregarPosts();
            }
            
            if (Workspace.Materiais && Workspace.Materiais.carregarMateriais) {
                await Workspace.Materiais.carregarMateriais();
                if (Workspace.usuario.tipo === 'Aluno') {
                    const areaAluno = document.getElementById('ws-materiais-aluno-area');
                    if (areaAluno && areaAluno.style.display !== 'none') Workspace.Materiais.renderizarAluno();
                } else {
                    const areaProf = document.getElementById('ws-materiais-prof-area');
                    if (areaProf && areaProf.style.display !== 'none') Workspace.Materiais.renderizarProf();
                }
            }
        }
    },

    iniciarConexaoTempoReal: () => {
        if (!window.Workspace || !Workspace.usuario) return;

        if (Workspace.Alertas.conexaoSSE) {
            Workspace.Alertas.conexaoSSE.close();
        }

        const escolaId = Workspace.usuario.escolaId ? Workspace.usuario.escolaId : 'DEFAULT';
        Workspace.Alertas.conexaoSSE = new EventSource(`/api/workspace/stream?escolaId=${escolaId}`);
        const sse = Workspace.Alertas.conexaoSSE; 

        sse.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            // 👤 ATUALIZAÇÃO EM TEMPO REAL DE NOME E FOTO NO SININHO E NA TELA
            if (data.type === 'PERFIL_ATUALIZADO') {
                Workspace.Alertas.sincronizarPerfilNasNotificacoes(
                    data.nomeAntigo,
                    data.novoNome,
                    data.login,
                    data.avatar
                );
                if (typeof Workspace.atualizarNomeNaTela === 'function' && data.novoNome) {
                    Workspace.atualizarNomeNaTela(data.nomeAntigo || data.novoNome, data.novoNome, data.avatar);
                }
                if (typeof Workspace.atualizarAvataresNaTela === 'function' && data.novoNome) {
                    Workspace.atualizarAvataresNaTela(data.novoNome, data.avatar);
                }
            }

            if (data.type === 'POST_UPDATE') {
                if (window.Workspace && Workspace.Feed && Workspace.Feed.sincronizarPostSilencioso) {
                    Workspace.Feed.sincronizarPostSilencioso(data.postId);
                }
            }
            
            if (data.type === 'NOVA_NOTIFICACAO' && Array.isArray(data.destinatarios)) {
                const meuNome = (Workspace.usuario.nome ? Workspace.usuario.nome : '').trim().toLowerCase();
                const meuLogin = (Workspace.usuario.login ? Workspace.usuario.login : '').trim().toLowerCase();
                const souDestinatario = data.destinatarios.some(d => {
                    const destLimpo = String(d ? d : '').trim().toLowerCase();
                    return destLimpo === 'todos' ? true : (destLimpo === meuNome ? true : destLimpo === meuLogin);
                });
                if (souDestinatario) {
                    Workspace.Alertas.buscarNotificacoes(); 
                }
            }

            if (data.type === 'NOVO_POST') {
                if (Workspace.Feed && Workspace.Feed.verificarNovoPost) {
                    Workspace.Feed.verificarNovoPost();
                }
            }

            if (data.type === 'NOVO_FEEDBACK') {
                const modalAberto = document.getElementById('ws-feedback-modal');
                if (modalAberto && Workspace.Sidebar && Workspace.Sidebar.modalFeedbackAtivo === data.entregaId) {
                    Workspace.Sidebar.abrirModalFeedback(data.entregaId, null);
                }
            }

            if (data.type === 'BAU_UPDATE') {
                if (window.Workspace && Workspace.Bau && Workspace.Bau.carregarDadosDaNuvem) {
                    Workspace.Bau.carregarDadosDaNuvem();
                }
            }

            if (data.type === 'SALA_UPDATE') {
                if (window.Workspace && Workspace.Avaliacoes && Workspace.Avaliacoes.carregarLobbies) {
                    Workspace.Avaliacoes.carregarLobbies();
                }
            }

            if (data.type === 'MATERIAL_UPDATE') {
                if (window.Workspace && Workspace.Materiais && Workspace.Materiais.carregarMateriais) {
                    Workspace.Materiais.carregarMateriais().then(() => {
                        if (Workspace.usuario.tipo === 'Aluno') {
                            const areaAluno = document.getElementById('ws-materiais-aluno-area');
                            if (areaAluno && areaAluno.style.display !== 'none') {
                                Workspace.Materiais.renderizarAluno();
                            }
                        } else {
                            const areaProf = document.getElementById('ws-materiais-prof-area');
                            if (areaProf && areaProf.style.display !== 'none') {
                                Workspace.Materiais.renderizarProf();
                            }
                        }
                    });
                }
            }

            if (data.type === 'BAU_INGLES_UPDATE') {
                if (window.Workspace && Workspace.Ingles && Workspace.Ingles.loadDados) {
                    Workspace.Ingles.loadDados().then(() => {
                        const painelAberto = document.getElementById('ws-ingles-container');
                        if (painelAberto && painelAberto.style.display !== 'none') {
                            Workspace.Ingles.renderizarVisualizacao();
                        }
                    });
                }
            }

            if (data.type === 'NOVA_MENSAGEM') {
                const meuNome = Workspace.usuario.nome ? Workspace.usuario.nome : Workspace.usuario.login;
                
                if (data.mensagem && data.mensagem.autorNome !== meuNome) {
                    let pertenceATurma = false;
                    
                    if (Workspace.usuario.tipo === 'Professor' || Workspace.usuario.tipo === 'Gestor') {
                        pertenceATurma = true;
                    } else {
                        const minhasTurmas = Array.isArray(Workspace.usuario.turmas) 
                            ? Workspace.usuario.turmas 
                            : [Workspace.usuario.turmas, Workspace.usuario.turma, Workspace.usuario.turmaId];
                        
                        const idRecebido = String(data.turmaId).toLowerCase().trim();
                        const nomeRecebido = String(data.turmaNome ? data.turmaNome : '').toLowerCase().trim();
                        
                        pertenceATurma = (idRecebido === 'global' || idRecebido === 'geral') || minhasTurmas.some(t => {
                            if (!t) return false;
                            const turmaLimpa = String(t).toLowerCase().trim();
                            return turmaLimpa === idRecebido || turmaLimpa === nomeRecebido;
                        });
                    }

                    if (!pertenceATurma) return;

                    const chatAberto = Workspace.Sidebar && Workspace.Sidebar.turmaIdAberta === data.turmaId;
                    const modalChatEl = document.getElementById('ws-chat-modal');
                    const modalChatVisivel = modalChatEl && modalChatEl.style.display !== 'none';
                    
                    if (!(chatAberto && modalChatVisivel)) {
                        const nomeTurma = data.turmaNome ? data.turmaNome : 'Fórum da Turma';
                        const textoBruto = data.mensagem.texto || (data.mensagem.anexoNome ? `📎 ${data.mensagem.anexoNome}` : '📎 Anexo');
                        const textoCurto = textoBruto.length > 30 ? textoBruto.substring(0, 30) + '...' : textoBruto;
                        
                        const idLocal = `alerta_local_${Date.now()}_${Math.floor(Math.random()*1000)}`;
                        const novaNotificacaoLocal = {
                            id: idLocal,
                            escolaId: Workspace.usuario.escolaId ? Workspace.usuario.escolaId : 'DEFAULT',
                            destinatarioNome: meuNome,
                            remetenteNome: data.mensagem.autorNome,
                            mensagem: `enviou uma mensagem lá no chat: "${textoCurto}"`,
                            origem: 'chat',
                            origemId: data.turmaId,
                            destinoNome: nomeTurma,
                            lida: false,
                            data: new Date().toISOString()
                        };

                        Workspace.Alertas.notificacoesAtuais.unshift(novaNotificacaoLocal);
                        Workspace.Alertas.idsConhecidos.add(idLocal);
                        const bell = document.getElementById('ws-bell');
                        if (bell) { bell.classList.add('bell-ringing'); setTimeout(() => bell.classList.remove('bell-ringing'), 1000); }
                        Workspace.Alertas.atualizarInterface();

                        const avatarHtml = window.Workspace.renderizarAvatar(data.mensagem.autorNome, 44);
                        const layoutDivertido = `
                            <div style="display: flex; align-items: center; gap: 12px; margin-left: -5px; width: 100%;">
                                <div style="flex-shrink: 0; border: 2px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.2); background: white;">
                                    ${avatarHtml}
                                </div>
                                <div style="display: flex; flex-direction: column; line-height: 1.3;">
                                    <span style="font-size: 14px; font-weight: bold; color: white;">${Workspace.escapeHTML(data.mensagem.autorNome)}</span>
                                    <span style="font-size: 12.5px; color: rgba(255,255,255,0.95);">disse lá no grupo: <i>"${Workspace.escapeHTML(textoCurto)}"</i></span>
                                </div>
                            </div>
                        `;
                        
                        if (window.Workspace && Workspace.mostrarAviso) {
                            Workspace.mostrarAviso(
                                layoutDivertido, 
                                'pingpong',
                                6000,
                                () => {
                                    if (Workspace.Sidebar && Workspace.Sidebar.abrirChat) {
                                        Workspace.Sidebar.abrirChat(data.turmaId, nomeTurma);
                                    }
                                }
                            );
                        }
                    }
                }
            }
        };

        sse.onerror = () => { 
            console.log("Túnel tremendo. O navegador está a tentar recuperar..."); 
            if (sse.readyState === EventSource.CLOSED) {
                setTimeout(() => {
                    if (Workspace.Alertas && Workspace.Alertas.iniciarConexaoTempoReal) {
                        Workspace.Alertas.iniciarConexaoTempoReal();
                    }
                }, 3000);
            }
        };
    },

    injetarCSS: () => {
        if (document.getElementById('ws-alertas-css')) return;
        const style = document.createElement('style');
        style.id = 'ws-alertas-css';
        style.innerHTML = `
            .ws-noti-item { padding: 12px; border-bottom: 1px solid #f5f5f5; background: #fdfefe; border-radius: 6px; margin-bottom: 5px; cursor: pointer; transition: 0.2s; display: flex; gap: 12px; align-items: flex-start; position: relative; }
            .ws-noti-item:hover { background: #f4f6f7; }
            .ws-noti-item.riscando { animation: fadeOutRight 0.3s forwards; pointer-events: none; }
            .ws-noti-close { background: transparent; border: none; color: #cbd5e1; cursor: pointer; font-size: 16px; padding: 2px 8px; margin-left: auto; transition: color 0.2s; display: flex; align-items: center; justify-content: center; border-radius: 4px; }
            .ws-noti-close:hover { color: #e74c3c; background: #fdf2f2; }
            @keyframes fadeOutRight { to { opacity: 0; transform: translateX(100%); } }
            @keyframes ringBell { 0% { transform: rotate(0); } 15% { transform: rotate(20deg); } 30% { transform: rotate(-20deg); } 45% { transform: rotate(15deg); } 60% { transform: rotate(-15deg); } 75% { transform: rotate(0); } }
            .bell-ringing i, .bell-ringing { animation: ringBell 0.6s ease-in-out; color: #3498db !important; }
            
            .ws-scroll-suave::-webkit-scrollbar { width: 6px; }
            .ws-scroll-suave::-webkit-scrollbar-track { background: transparent; }
            .ws-scroll-suave::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            .ws-scroll-suave::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

            #ws-noti-count {
                position: absolute !important;
                top: -4px !important;
                right: -4px !important;
                background: #e74c3c !important;
                color: white !important;
                font-family: 'Poppins', sans-serif !important;
                font-size: 11px !important;
                font-weight: 800 !important;
                min-width: 18px !important;
                height: 18px !important;
                padding: 0 4px !important;
                border-radius: 50px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                box-shadow: 0 2px 6px rgba(231, 76, 60, 0.4) !important;
                border: 2px solid white !important;
                z-index: 10 !important;
                line-height: 1 !important;
                box-sizing: border-box !important;
            }

            @keyframes highlightMagic { 
                0% { background-color: transparent; transform: scale(1); } 
                20% { background-color: #fff9c4; transform: scale(1.02); box-shadow: 0 0 15px rgba(241, 196, 15, 0.5); } 
                80% { background-color: #fff9c4; transform: scale(1.02); box-shadow: 0 0 15px rgba(241, 196, 15, 0.5); } 
                100% { background-color: transparent; transform: scale(1); box-shadow: none; } 
            }
            .ws-highlight-magic { animation: highlightMagic 2.5s ease-out; }
        `;
        document.head.appendChild(style);
    },

    construirDropdown: () => {
        const bells = document.querySelectorAll('#ws-bell');
        if (bells.length === 0) return;
        
        let dropdown = document.getElementById('ws-noti-dropdown');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.id = 'ws-noti-dropdown';
            dropdown.style.cssText = 'display:none;'; 
            document.body.appendChild(dropdown);
        }
        
        if (!Workspace.Alertas.cliquesConfigurados) {
            bells.forEach(bell => {
                bell.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const vaiAbrir = dropdown.style.display !== 'block';
                    dropdown.style.display = vaiAbrir ? 'block' : 'none';
                    if (vaiAbrir) {
                        // Garante que as fotos e tempos relativos estejam frescos ao abrir a gaveta
                        Workspace.Alertas.atualizarInterface();
                    }
                    const perfilDropdown = document.getElementById('ws-perfil-dropdown');
                    if (perfilDropdown) perfilDropdown.style.display = 'none';
                });
            });
            
            document.addEventListener('click', (e) => { 
                if (!e.target.closest('#ws-bell') && !e.target.closest('#ws-noti-dropdown')) {
                    dropdown.style.display = 'none'; 
                }
            });
            Workspace.Alertas.cliquesConfigurados = true;
        }
    },

    buscarNotificacoes: async (isPollingSilencioso = false) => {
        const meuNome = Workspace.usuario ? (Workspace.usuario.nome ? Workspace.usuario.nome : Workspace.usuario.login) : null;
        if (!meuNome) return;
        
        try {
            const data = await Workspace.api(`/workspace/notificacoes/${encodeURIComponent(meuNome.trim())}`);
            
            if (Array.isArray(data)) {                
                const assinaturaAntiga = Workspace.Alertas.notificacoesAtuais
                    .map(n => `${n.id}_${n.remetenteNome}`)
                    .join('|');

                const locais = Workspace.Alertas.notificacoesAtuais.filter(n => String(n.id).startsWith('alerta_local_'));
                Workspace.Alertas.notificacoesAtuais = [...locais, ...data];
                
                const idsAtuais = Workspace.Alertas.notificacoesAtuais.map(n => n.id);
                const novas = data.filter(n => !Workspace.Alertas.idsConhecidos.has(n.id));

                if (Workspace.Alertas.primeiraBuscaConcluida && novas.length > 0) {
                    
                    novas.forEach((novaNoti, index) => {
                        setTimeout(async () => { 
                            const partesMsg = novaNoti.mensagem ? novaNoti.mensagem.split('"') : [];
                            const titulo = partesMsg[1] ? partesMsg[1] : 'Atividade'; 

                            // 1. AVALIAÇÕES (ESCRITA E ORAL)
                            if (novaNoti.origem === 'avaliacao_escrita' || novaNoti.origem === 'avaliacao_oral') {
                                Toast.showInterativo({
                                    remetenteNome: novaNoti.remetenteNome,
                                    subtitulo: "Central de Avaliações",
                                    mensagemCorpo: `Atenção! A avaliação <strong>"${titulo}"</strong> foi liberada. Aceda para não perder o prazo!`
                                }, 'avaliacao', () => Workspace.Alertas.lerEIr(novaNoti.id, novaNoti.origem, novaNoti.origemId, novaNoti.destinoNome));
                            }
                            
                            // 2. AULAS ONLINE / SESSÕES AO VIVO
                            else if (novaNoti.origem === 'online') {
                                Toast.showInterativo({
                                    remetenteNome: novaNoti.remetenteNome,
                                    subtitulo: "Sala de Aula Online",
                                    mensagemCorpo: `Foi agendada a sessão: <strong>"${titulo}"</strong>.`
                                }, 'online', async () => {
                                    try {
                                        let tempoLembrete;
                                        if (novaNoti.dataEvento && novaNoti.dataEvento.includes('T')) {
                                            const partes = novaNoti.dataEvento.split('T');
                                            const dataPartes = partes[0].split('-');
                                            const horaPartes = partes[1].split(':');
                                            tempoLembrete = new Date(parseInt(dataPartes[0], 10), parseInt(dataPartes[1], 10) - 1, parseInt(dataPartes[2], 10), parseInt(horaPartes[0], 10), parseInt(horaPartes[1], 10));
                                        } else {
                                            tempoLembrete = new Date(); tempoLembrete.setHours(tempoLembrete.getHours() + 24);
                                        }
                                        const tempoDisparoMs = tempoLembrete.getTime();
                                        const res = await Workspace.api('/workspace/bau/alarmes', 'POST', { usuarioId: Workspace.usuario.id, mensagem: `Aula Online: ${titulo} (com ${novaNoti.remetenteNome})`, tempoDisparo: tempoDisparoMs }); 
                                        if (res && res.success && window.Workspace && Workspace.Bau) {
                                            Workspace.Bau.alarmesAtivos.push({ id: res.id, mensagem: `Aula Online: ${titulo} (com ${novaNoti.remetenteNome})`, tempoDisparo: tempoDisparoMs, disparado: false });
                                            Workspace.Bau.atualizarCalendarioVisual();
                                        }
                                    } catch (e) {}
                                    Workspace.Alertas.lerEIr(novaNoti.id, novaNoti.origem, novaNoti.origemId, novaNoti.destinoNome);
                                });
                            }
                            
                            // 2.5 EDIÇÃO DE AULAS ONLINE 
                            else if (novaNoti.origem === 'online_edit') {
                                Toast.showInterativo({
                                    remetenteNome: novaNoti.remetenteNome,
                                    subtitulo: "Sessão Online Atualizada ⚠️",
                                    mensagemCorpo: `O(a) professor(a) fez alterações em "${titulo}". Acompanhe o que mudou na <strong>Sala de Acessos</strong>.`
                                }, 'online', async () => {
                                    if (window.Workspace && Workspace.Bau && Workspace.Bau.carregarDadosDaNuvem) Workspace.Bau.carregarDadosDaNuvem();
                                    Workspace.Alertas.lerEIr(novaNoti.id, novaNoti.origem, novaNoti.origemId, novaNoti.destinoNome);
                                });
                            }

                            // 3. EXERCÍCIOS E ACESSOS ÀS SESSÕES (Professor)
                            else if (novaNoti.origem === 'tarefa' || novaNoti.origem === 'exercicio' || novaNoti.origem === 'acesso_online') {
                                const ehProfessor = Workspace.usuario.tipo === 'Professor' || Workspace.usuario.tipo === 'Gestor';
                                
                                let subtitulo = "Novo Exercício 📝";
                                let msgCorpo = `Há um novo exercício disponível para você: <strong>"${titulo}"</strong>.`;
                                
                                if (ehProfessor) {
                                    subtitulo = novaNoti.origem === 'acesso_online' ? "Presença Registada 🖥️" : "Sala de Acessos 🖥️";
                                    msgCorpo = `O aluno(a) <strong>${novaNoti.remetenteNome}</strong> ${novaNoti.mensagem}`;
                                }

                                Toast.showInterativo({
                                    remetenteNome: novaNoti.remetenteNome,
                                    subtitulo: subtitulo,
                                    mensagemCorpo: msgCorpo
                                }, 'tarefa', () => Workspace.Alertas.lerEIr(novaNoti.id, novaNoti.origem, novaNoti.origemId, novaNoti.destinoNome));
                            }
                            
                            // 4. MATERIAIS
                            else if (novaNoti.origem === 'material') {
                                Toast.showInterativo({
                                    remetenteNome: novaNoti.remetenteNome,
                                    subtitulo: "Estante Virtual",
                                    mensagemCorpo: `Há um novo material na estante aguardando você: <strong>"${titulo}"</strong>.`
                                }, 'material', () => Workspace.Alertas.lerEIr(novaNoti.id, novaNoti.origem, novaNoti.origemId, novaNoti.destinoNome));
                            }
                            
                            // 4.5. FEEDBACK DO PROFESSOR
                            else if (novaNoti.origem === 'feedback_tarefa') {
                                Toast.showInterativo({
                                    remetenteNome: novaNoti.remetenteNome,
                                    subtitulo: "Novo Feedback Recebido 💬",
                                    mensagemCorpo: `O(a) professor(a) <strong>${novaNoti.remetenteNome}</strong> enviou um comentário sobre o seu exercício.`
                                }, 'tarefa', async () => Workspace.Alertas.lerEIr(novaNoti.id, novaNoti.origem, novaNoti.origemId, novaNoti.destinoNome));
                            }
                            
                            // 4.6. COMUNICADO DIRETO DA COORDENAÇÃO / GESTOR
                            else if (novaNoti.origem === 'aviso_coordenacao') {
                                if (window.Toast && typeof Toast.showInterativo === 'function') {
                                    Toast.showInterativo({
                                        remetenteNome: novaNoti.remetenteNome,
                                        subtitulo: novaNoti.tituloAviso ? novaNoti.tituloAviso : "Comunicado da Coordenação 📢",
                                        mensagemCorpo: novaNoti.mensagem
                                    }, 'avaliacao', () => Workspace.Alertas.lerEIr(novaNoti.id, 'aviso_coordenacao', '', ''));
                                } else if (window.Toast && Toast.show) {
                                    Toast.show(`📢 ${novaNoti.remetenteNome}: ${novaNoti.mensagem}`, 'info', 6000);
                                }
                                const bells = document.querySelectorAll('#ws-bell');
                                bells.forEach(bell => { bell.classList.add('bell-ringing'); setTimeout(() => bell.classList.remove('bell-ringing'), 1000); });
                                Workspace.Alertas.atualizarInterface();
                            }  

                            // 5. POSTS E REAÇÕES
                            else {
                                if (window.Toast && Toast.show) Toast.show(`🔔 ${novaNoti.remetenteNome} ${novaNoti.mensagem}`, 'info');
                                const bells = document.querySelectorAll('#ws-bell');
                                bells.forEach(bell => { bell.classList.add('bell-ringing'); setTimeout(() => bell.classList.remove('bell-ringing'), 1000); });
                                Workspace.Alertas.atualizarInterface();
                            }

                        }, index * 1000); 
                    });
                } 
                
                const assinaturaNova = Workspace.Alertas.notificacoesAtuais
                    .map(n => `${n.id}_${n.remetenteNome}`)
                    .join('|');

                Workspace.Alertas.idsConhecidos = new Set(idsAtuais);
                const eraPrimeiraBusca = !Workspace.Alertas.primeiraBuscaConcluida;
                Workspace.Alertas.primeiraBuscaConcluida = true;
                
                // Só reconstrói o HTML se houve alteração na lista ou se foi o primeiro carregamento
                if (!isPollingSilencioso || eraPrimeiraBusca || assinaturaAntiga !== assinaturaNova) {
                    Workspace.Alertas.atualizarInterface();
                } else {
                    // Atualiza apenas os textos "Há X min" sem destruir o scroll!
                    document.querySelectorAll('#ws-lista-notificacoes .ws-time-ago').forEach(el => {
                        const t = el.getAttribute('data-time');
                        if (t) el.innerText = Workspace.Alertas.tempoRelativo(t);
                    });
                }
            }
        } catch (e) {}
    },

    atualizarInterface: () => {
        const badges = document.querySelectorAll('#ws-noti-count');
        const dropdown = document.getElementById('ws-noti-dropdown');
        const qtd = Workspace.Alertas.notificacoesAtuais.length;

        badges.forEach(badge => {
            badge.innerText = qtd > 99 ? '99+' : qtd;
            if (qtd > 0) {
                badge.style.setProperty('display', 'flex', 'important');
                badge.style.animation = 'pulse 1s infinite';
            } else {
                badge.style.setProperty('display', 'none', 'important');
                badge.style.animation = 'none';
            }
        });

        if (dropdown) {
            // Preserva a posição de rolagem atual caso a gaveta esteja aberta
            const listaAnterior = document.getElementById('ws-lista-notificacoes');
            const scrollSalvo = listaAnterior ? listaAnterior.scrollTop : 0;

            if (qtd === 0) {
                dropdown.innerHTML = `
                    <div style="display:flex; justify-content:flex-end; padding:12px 15px; border-bottom:1px solid #eee;">
                        <button onclick="document.getElementById('ws-noti-dropdown').style.display='none'" style="background:#f0f2f5; border:none; color:#555; width:32px; height:32px; border-radius:50%; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:0.2s;" onmouseover="this.style.background='#e74c3c'; this.style.color='white'" title="Fechar Painel">✖</button>
                    </div>
                    <div style="text-align:center; color:#94a3b8; padding:50px 0;"><div style="font-size:45px; margin-bottom:10px;">🔔</div><div style="font-weight:600; font-size:16px;">Parabéns! </div><div style="font-size:13px; margin-top:5px;">Nenhuma notificação pendente.</div></div>`;
            } else {
                dropdown.innerHTML = `
                    <div style="font-weight:bold; margin-bottom:10px; border-bottom:1px solid #eee; padding:15px 15px 12px 15px; color:#2c3e50; display:flex; justify-content:space-between; align-items:center; flex-shrink: 0;">
                        <span style="font-size: 16px;">🔔 Notificações (${qtd})</span>
                        <div style="display:flex; gap: 10px; align-items: center;">
                            <button onclick="Workspace.Alertas.limparTodas()" style="background:transparent; border:none; color:#3498db; cursor:pointer; font-size:12px; font-weight:bold; padding:4px 8px; border-radius:4px; transition:0.2s;" onmouseover="this.style.background='#ebf5fb'" onmouseout="this.style.background='transparent'" title="Marcar todas como lidas">Excluir Todas</button>
                            <button onclick="document.getElementById('ws-noti-dropdown').style.display='none'" style="background:#f0f2f5; border:none; color:#555; width:32px; height:32px; border-radius:50%; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:0.2s;" onmouseover="this.style.background='#e74c3c'; this.style.color='white'" title="Fechar Painel">✖</button>
                        </div>
                    </div>
                    
                    <div id="ws-lista-notificacoes" class="ws-scroll-suave" style="display:flex; flex-direction:column; gap:2px; max-height: 75vh; overflow-y: auto; overscroll-behavior: contain; padding: 0 10px 15px 10px;">
                    ${Workspace.Alertas.notificacoesAtuais.map(n => {
                        const destino = n.destinoNome ? String(n.destinoNome).replace(/'/g, "\\'") : '';
                        const nomeRemetente = n.remetenteNome || 'Utilizador';
                        const nomeSeguro = Workspace.escapeHTML(nomeRemetente);
                        const avatarSino = window.Workspace.renderizarAvatar(nomeRemetente, 36);
                        const msgBruta = String(n.mensagem || '');
                        const msgEspacada = msgBruta.startsWith(' ') ? msgBruta : ' ' + msgBruta;

                        return `
                        <div class="ws-noti-item" id="notif-item-${n.id}">
                            <div onclick="Workspace.Alertas.lerEIr('${n.id}', '${n.origem}', '${n.origemId}', '${destino}')" style="display: flex; gap: 12px; flex: 1; align-items: flex-start;">
                                ${avatarSino}
                                <div style="flex: 1; min-width: 0;">
                                    <div style="font-size:12.5px; color:#334155; line-height:1.4;"><strong data-noti-autor="${nomeSeguro}" style="color:#3498db;">${nomeSeguro}</strong>${msgEspacada}</div>
                                    <div class="ws-time-ago" data-time="${n.data}" style="font-size:10.5px; color:#94a3b8; font-weight:600; margin-top:4px;">${Workspace.Alertas.tempoRelativo(n.data)}</div>
                                </div>
                            </div>
                            <button class="ws-noti-close" onclick="Workspace.Alertas.riscar('${n.id}', event)" title="Marcar como lida">✖</button>
                        </div>`;
                    }).join('')}
                    </div>`;

                const novaLista = document.getElementById('ws-lista-notificacoes');
                if (novaLista && scrollSalvo > 0) {
                    novaLista.scrollTop = scrollSalvo;
                }
            }
        }
    },

    limparTodas: () => {
        const meuNome = Workspace.usuario ? (Workspace.usuario.nome ? Workspace.usuario.nome : Workspace.usuario.login) : null;
        if (!meuNome) return;

        const itens = document.querySelectorAll('#ws-lista-notificacoes .ws-noti-item');
        if (itens.length === 0) return;

        itens.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('riscando');
            }, Math.min(index, 10) * 50);
        });

        const tempoEspera = (Math.min(itens.length, 10) * 50) + 300;

        setTimeout(async () => {
            Workspace.Alertas.notificacoesAtuais = [];
            Workspace.Alertas.idsConhecidos.clear();
            Workspace.Alertas.atualizarInterface();

            try {
                const nomeDono = encodeURIComponent(meuNome);
                await Workspace.api(`/workspace/notificacoes/usuario/${nomeDono}/ler-todas`, 'PUT');
            } catch (e) {
                console.error("Erro ao limpar notificações no servidor.");
            }
        }, tempoEspera);
    },

    lerEIr: async (id, origem, origemId, destinoNome) => {
        const dropdown = document.getElementById('ws-noti-dropdown');
        if (dropdown) dropdown.style.display = 'none';

        if (String(id).startsWith('alerta_local_')) {
            Workspace.Alertas.notificacoesAtuais = Workspace.Alertas.notificacoesAtuais.filter(n => n.id !== id);
            Workspace.Alertas.idsConhecidos.delete(id);
            Workspace.Alertas.atualizarInterface();
        } else {
            try {
                await Workspace.api(`/workspace/notificacoes/${id}/ler`, 'PUT');
                Workspace.Alertas.notificacoesAtuais = Workspace.Alertas.notificacoesAtuais.filter(n => n.id !== id);
                Workspace.Alertas.idsConhecidos.delete(id);
                Workspace.Alertas.atualizarInterface();
            } catch(e) {}
        }

        const modalChat = document.getElementById('ws-chat-modal');
        if (modalChat) modalChat.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (origem === 'post' || origem === 'comentario_novo' || origem === 'comentario_reacao') {
            if (window.Workspace && Workspace.voltarAoFeed) Workspace.voltarAoFeed();
            
            let postId = origemId;
            let comentarioId = null;

            if (origemId && origemId.includes('|')) {
                const partes = origemId.split('|');
                postId = partes[0];
                comentarioId = partes[1];
            }

            const checkExist = setInterval(() => {
                const postElement = document.getElementById(`post-${postId}`);
                
                if (postElement) {
                    clearInterval(checkExist);
                    
                    if (comentarioId && Workspace.Feed && Workspace.Feed.toggleComentarios) {
                        const boxComentarios = document.getElementById(`box-comentarios-${postId}`);
                        if (boxComentarios && boxComentarios.style.display === 'none') {
                            Workspace.Feed.toggleComentarios(postId);
                        }
                    }

                    let alvoDestaque = postElement;
                    if (comentarioId) {
                        const comElement = document.getElementById(`comentario-${comentarioId}`);
                        if (comElement) alvoDestaque = comElement;
                    }

                    alvoDestaque.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    alvoDestaque.classList.remove('ws-highlight-magic');
                    void alvoDestaque.offsetWidth; 
                    alvoDestaque.classList.add('ws-highlight-magic');
                }
            }, 200);
            setTimeout(() => clearInterval(checkExist), 3000);
        }
        else if (origem === 'chat') {
            if (window.Workspace && Workspace.voltarAoFeed) Workspace.voltarAoFeed();
            if (Workspace.Sidebar && Workspace.Sidebar.abrirChat) Workspace.Sidebar.abrirChat(origemId, destinoNome ? destinoNome : 'Fórum da Turma');
        }
        else if (origem === 'tarefa' || origem === 'exercicio') {
            if (window.Workspace && Workspace.navegarPara) Workspace.navegarPara('tarefas');
            
            setTimeout(async () => {
                if (Workspace.Sidebar && Workspace.Sidebar.carregarTarefas) {
                    await Workspace.Sidebar.carregarTarefas();
                }
                if (Workspace.Sidebar && Workspace.Sidebar.abrirModalTarefa) {
                    Workspace.Sidebar.abrirModalTarefa(origemId);
                }
            }, 500); 
        }
        else if (origem === 'feedback_tarefa') {
            if (window.Workspace && Workspace.navegarPara) Workspace.navegarPara('tarefas');
            setTimeout(() => {
                const partes = origemId.split('|');
                const eventoId = partes[0];
                const entregaId = partes[1];
                
                if (Workspace.Sidebar && Workspace.Sidebar.abrirModalTarefa) {
                    Workspace.Sidebar.abrirModalTarefa(eventoId);
                    setTimeout(() => {
                        if (Workspace.Sidebar.abrirModalFeedback) Workspace.Sidebar.abrirModalFeedback(entregaId, eventoId);
                    }, 600); 
                }
            }, 500); 
        }
        else if (origem === 'material') {
            if (window.Workspace && Workspace.navegarPara) Workspace.navegarPara('sala_aula');
            setTimeout(() => {
                if (window.Workspace && Workspace.abrirPaginaMateriais) Workspace.abrirPaginaMateriais();
            }, 300);
        }
        else if (origem === 'lousa_espera') {
            if (window.Workspace && Workspace.navegarPara) Workspace.navegarPara('encontros_prof');
            
            setTimeout(() => {
                const painelLousa = document.getElementById('ws-cartao-lousa-prof');
                if (painelLousa) {
                    painelLousa.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    painelLousa.classList.remove('ws-highlight-magic');
                    void painelLousa.offsetWidth; 
                    painelLousa.classList.add('ws-highlight-magic');
                    
                    const seletorTurma = document.getElementById('ws-prof-turma-lousa-modal') || document.getElementById('ws-prof-turma-lousa');
                    if (seletorTurma && origemId && origemId !== 'global') {
                        seletorTurma.value = origemId;
                    }
                }
            }, 600);
        }
        else if (origem === 'avaliacao_escrita') {
            if (window.Workspace && Workspace.navegarPara) {
                if (Workspace.usuario && (Workspace.usuario.tipo === 'Professor' || Workspace.usuario.tipo === 'Gestor')) {
                    Workspace.navegarPara('avaliacoes_prof'); 
                } else {
                    Workspace.navegarPara('avaliacoes_escrita'); 
                }
            }
        }
        else if (origem === 'avaliacao_oral') {
            if (window.Workspace && Workspace.navegarPara) {
                if (Workspace.usuario && (Workspace.usuario.tipo === 'Professor' || Workspace.usuario.tipo === 'Gestor')) {
                    Workspace.navegarPara('avaliacoes_prof');
                } else {
                    Workspace.navegarPara('avaliacoes_oral');
                }
            }
        }
        else if (origem === 'online' || origem === 'online_edit' || origem === 'acesso_online' || origem === 'sessao_vivo') {
            if (window.Workspace && Workspace.navegarPara) {
                if (Workspace.usuario && (Workspace.usuario.tipo === 'Professor' || Workspace.usuario.tipo === 'Gestor')) {
                    Workspace.navegarPara('encontros_prof');
                    
                    setTimeout(() => {
                        if (Workspace.Avaliacoes && Workspace.Avaliacoes.abrirGerenciador) {
                            Workspace.Avaliacoes.abrirGerenciador();
                            
                            let tentativas = 0;
                            const radarPisca = setInterval(() => {
                                const cartaoSessao = document.querySelector(`[id*="${origemId}"]`);
                                
                                if (cartaoSessao && cartaoSessao.offsetParent !== null) {
                                    clearInterval(radarPisca);
                                    cartaoSessao.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    cartaoSessao.classList.remove('ws-highlight-magic');
                                    setTimeout(() => {
                                        cartaoSessao.classList.add('ws-highlight-magic');
                                    }, 100);
                                }
                                
                                tentativas++;
                                if (tentativas > 80) clearInterval(radarPisca); 
                            }, 250);
                        }
                    }, 500);
                } else {
                    Workspace.navegarPara('avaliacoes_online');
                    
                    setTimeout(() => {
                        const cartaoSessao = document.getElementById(`sessao-online-${origemId}`);
                        if (cartaoSessao) {
                            cartaoSessao.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            cartaoSessao.classList.remove('ws-highlight-magic');
                            setTimeout(() => {
                                cartaoSessao.classList.add('ws-highlight-magic');
                            }, 50);
                        }
                    }, 600);
                }
            }
        }
        else if (origem === 'bau') {
            if (Workspace.Bau && Workspace.Bau.irParaCalendarioDoBau) Workspace.Bau.irParaCalendarioDoBau(Number(origemId));
        }
        else if (origem === 'aviso_coordenacao') {
            if (window.Workspace && Workspace.voltarAoFeed) Workspace.voltarAoFeed();
        }
    },

    riscar: async (id, event) => {
        event.stopPropagation(); 
        const itemUI = document.getElementById(`notif-item-${id}`);
        if (itemUI) itemUI.classList.add('riscando'); 
        
        if (String(id).startsWith('alerta_local_')) {
            setTimeout(() => {
                Workspace.Alertas.notificacoesAtuais = Workspace.Alertas.notificacoesAtuais.filter(n => n.id !== id);
                Workspace.Alertas.idsConhecidos.delete(id);
                Workspace.Alertas.atualizarInterface(); 
            }, 300);
            return;
        }

        try {
            await Workspace.api(`/workspace/notificacoes/${id}/ler`, 'PUT');
            setTimeout(() => {
                Workspace.Alertas.notificacoesAtuais = Workspace.Alertas.notificacoesAtuais.filter(n => n.id !== id);
                Workspace.Alertas.idsConhecidos.delete(id);
                Workspace.Alertas.atualizarInterface(); 
            }, 300); 
        } catch (e) { if (itemUI) itemUI.classList.remove('riscando'); }
    },

    tempoRelativo: (dataString) => {
        if (!dataString) return '';
        const dataPost = new Date(dataString);
        const diff = Math.max(0, Math.floor((new Date() - dataPost) / 1000));
        
        if (diff < 60) return 'Agora mesmo';
        const m = Math.floor(diff / 60);
        if (m < 60) return `Há ${m} min`;
        const h = Math.floor(m / 60);
        if (h < 24) return `Há ${h} h`;
        const d = Math.floor(h / 24);
        if (d === 1) return `Ontem`;
        return `Há ${d} dias`;
    }
};