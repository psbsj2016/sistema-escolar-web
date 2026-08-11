// js/modulos/workspace/alertas.js
window.Workspace = window.Workspace || {};

Workspace.Alertas = {
    notificacoesAtuais: [],
    idsConhecidos: new Set(),
    
    // 🚀 NOVAS VARIÁVEIS DE MEMÓRIA PARA O "DETETIVE DE RETORNO"
    conexaoSSE: null, 
    momentoSaida: null,

    init: () => {
        console.log("🔔 Motor de Alertas: Conexão em Tempo Real (SSE) Ativada.");
        Workspace.Alertas.injetarCSS();
        Workspace.Alertas.construirDropdown();
        Workspace.Alertas.atualizarInterface();
        
        // 🚀 LIGA O VIGIA DE ABAS ADORMECIDAS
        Workspace.Alertas.iniciarDetetiveRetorno();
        
        const aguardarUsuario = setInterval(() => {
            if (Workspace.usuario && Workspace.usuario.nome) {
                clearInterval(aguardarUsuario);
                Workspace.Alertas.buscarNotificacoes(); 
                Workspace.Alertas.iniciarConexaoTempoReal(); 
            }
        }, 1000);
    },

    // ============================================================================
    // 🩺 O DESFIBRILADOR: ACORDA O SITE APÓS MUITO TEMPO ADORMECIDO
    // ============================================================================
    iniciarDetetiveRetorno: () => {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                // O utilizador minimizou o site. Anotamos a hora no relógio.
                Workspace.Alertas.momentoSaida = Date.now();
            } else if (document.visibilityState === 'visible') {
                // O utilizador voltou a olhar para o ecrã!
                if (Workspace.Alertas.momentoSaida) {
                    const tempoAusente = Date.now() - Workspace.Alertas.momentoSaida;
                    
                    // Se ficou fora por mais de 1 minuto (60000 milissegundos), reanimamos tudo!
                    if (tempoAusente > 60000) {
                        console.log("🔄 O aluno esteve ausente muito tempo. Reanimando o sistema...");
                        if(window.Workspace && Workspace.mostrarAviso) {
                            Workspace.mostrarAviso("Bem-vindo novamente! 🎉 Atualizando tudo... ⏳", "info", 2000);
                        }
                        Workspace.Alertas.reanimaSistema();
                    }
                    Workspace.Alertas.momentoSaida = null; // Limpa o relógio
                }
            }
        });
    },

    reanimaSistema: async () => {
        // 1. Reinicia o coração do site (Destrói a ligação velha e cria uma nova)
        Workspace.Alertas.iniciarConexaoTempoReal();

        // 2. Manda cada departamento recarregar as suas listas em silêncio
        if (window.Workspace) {
            // Atualiza as Notificações
            if (Workspace.Alertas.buscarNotificacoes) Workspace.Alertas.buscarNotificacoes();
            
            // Atualiza a Sala de Acessos (Avaliações / Lobbies) -> Resolve o seu Bug Principal!
            if (Workspace.Avaliacoes && Workspace.Avaliacoes.carregarLobbies) Workspace.Avaliacoes.carregarLobbies();
            
            // Atualiza o Bate-papo se o aluno o tiver deixado aberto na tela
            if (Workspace.Sidebar && Workspace.Sidebar.turmaIdAberta) {
                const nomeChat = document.getElementById('ws-chat-titulo') ? document.getElementById('ws-chat-titulo').innerText : 'Bate-papo';
                Workspace.Sidebar.abrirChat(Workspace.Sidebar.turmaIdAberta, nomeChat);
            }

            // Atualiza o Mural/Feed principal
            if (Workspace.Feed && Workspace.Feed.carregarPosts) {
                Workspace.Feed.todosOsPosts = []; // Esvazia o lixo antigo da memória
                Workspace.Feed.carregarPosts();
            }
            
            // Atualiza a Estante de Materiais
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
        // 🚀 O SEGREDO: Se já houver um túnel zombie, destrói-o antes de abrir o novo!
        if (Workspace.Alertas.conexaoSSE) {
            Workspace.Alertas.conexaoSSE.close();
        }

        const escolaId = Workspace.usuario.escolaId || 'DEFAULT';
        
        // Grava a nova ligação na nossa variável para controlo futuro
        Workspace.Alertas.conexaoSSE = new EventSource(`/api/workspace/stream?escolaId=${escolaId}`);
        
        const sse = Workspace.Alertas.conexaoSSE; // O código original continuará a funcionar com a nova variável

        sse.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'POST_UPDATE') {
                if (window.Workspace && Workspace.Feed && Workspace.Feed.sincronizarPostSilencioso) {
                    Workspace.Feed.sincronizarPostSilencioso(data.postId);
                }
            }
            
            if (data.type === 'NOVA_NOTIFICACAO' && data.destinatarios.includes(Workspace.usuario.nome || Workspace.usuario.login)) {
                Workspace.Alertas.buscarNotificacoes(); 
            }

            if (data.type === 'NOVO_POST') {
                if (Workspace.Feed && Workspace.Feed.verificarNovoPost) {
                    Workspace.Feed.verificarNovoPost();
                }
            }

            // 🚀 A MÁGICA AO VIVO DO FEEDBACK: Se a janela estiver aberta, desenha o balão instantaneamente!
            if (data.type === 'NOVO_FEEDBACK') {
                const modalAberto = document.getElementById('ws-feedback-modal');
                if (modalAberto && Workspace.Sidebar && Workspace.Sidebar.modalFeedbackAtivo === data.entregaId) {
                    Workspace.Sidebar.abrirModalFeedback(data.entregaId, null); // Recarrega os balões s/ pestanejar
                }
            }

            // 🚀 A NOVA MAGIA: Atualiza o Baú automaticamente se o professor alterar uma data!
            if (data.type === 'BAU_UPDATE') {
                if (window.Workspace && Workspace.Bau && Workspace.Bau.carregarDadosDaNuvem) {
                    Workspace.Bau.carregarDadosDaNuvem();
                }
            }

            // 🚀 O ATUALIZADOR INSTANTÂNEO DE SALAS (Ocultar/Desocultar em Tempo Real)
            if (data.type === 'SALA_UPDATE') {
                if (window.Workspace && Workspace.Avaliacoes && Workspace.Avaliacoes.carregarLobbies) {
                    Workspace.Avaliacoes.carregarLobbies(); // O ecrã do aluno pisca e o cartão some/aparece na hora!
                }
            }

            // 🚀 O ATUALIZADOR INSTANTÂNEO DE MATERIAIS DA AULA
            if (data.type === 'MATERIAL_UPDATE') {
                if (window.Workspace && Workspace.Materiais && Workspace.Materiais.carregarMateriais) {
                    // Puxa as atualizações do banco de dados silenciosamente
                    Workspace.Materiais.carregarMateriais().then(() => {
                        // Descobre quem está olhando para o ecrã e redesenha a estante!
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

            // 🚀 Detetive de Novas Mensagens do Bate-papo (Ping-Pong + Sininho)
            if (data.type === 'NOVA_MENSAGEM') {
                const meuNome = Workspace.usuario.nome || Workspace.usuario.login;
                
                    // 1. Só avisa se a mensagem NÃO for escrita por nós mesmos
                    if (data.mensagem && data.mensagem.autorNome !== meuNome) {
                    
                    // 2. Verifica se o bate-papo daquela turma JÁ ESTÁ ABERTO no ecrã neste momento
                    const chatAberto = Workspace.Sidebar && Workspace.Sidebar.turmaIdAberta === data.turmaId;
                    const modalChatVisivel = document.getElementById('ws-chat-modal') && document.getElementById('ws-chat-modal').style.display !== 'none';
                    
                    // 3. Se o aluno não estiver a olhar para o chat, disparamos a novidade!
                    if (!(chatAberto && modalChatVisivel)) {
                        const nomeTurma = data.turmaNome || 'Fórum da Turma';
                        const textoCurto = data.mensagem.texto.length > 30 ? data.mensagem.texto.substring(0, 30) + '...' : data.mensagem.texto;
                        
                        // 🔔 A) REGISTO NO SININHO (Fica guardado até o aluno limpar)
                        const idLocal = `alerta_local_${Date.now()}_${Math.floor(Math.random()*1000)}`;
                        const novaNotificacaoLocal = {
                            id: idLocal,
                            escolaId: Workspace.usuario.escolaId || 'DEFAULT',
                            destinatarioNome: meuNome,
                            remetenteNome: data.mensagem.autorNome,
                            mensagem: `enviou uma mensagem lá no chat: "${textoCurto}"`,
                            origem: 'chat',
                            origemId: data.turmaId,
                            destinoNome: nomeTurma,
                            lida: false,
                            data: new Date().toISOString()
                        };

                        // Adiciona no topo da lista do sininho e toca o alerta
                        Workspace.Alertas.notificacoesAtuais.unshift(novaNotificacaoLocal);
                        Workspace.Alertas.idsConhecidos.add(idLocal);
                        const bell = document.getElementById('ws-bell');
                        if (bell) { bell.classList.add('bell-ringing'); setTimeout(() => bell.classList.remove('bell-ringing'), 1000); }
                        Workspace.Alertas.atualizarInterface();

                        // 🏓 B) O BALÃO SALTITANTE (Ping-Pong Visual)
                        const avatarHtml = window.Workspace.renderizarAvatar(data.mensagem.autorNome, 44);
                        const layoutDivertido = `
                            <div style="display: flex; align-items: center; gap: 12px; margin-left: -5px; width: 100%;">
                                <div style="flex-shrink: 0; border: 2px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.2); background: white;">
                                    ${avatarHtml}
                                </div>
                                <div style="display: flex; flex-direction: column; line-height: 1.3;">
                                    <span style="font-size: 14px; font-weight: bold; color: white;">${data.mensagem.autorNome}</span>
                                    <span style="font-size: 12.5px; color: rgba(255,255,255,0.95);">disse lá no grupo: <i>"${textoCurto}"</i></span>
                                </div>
                            </div>
                        `;
                        
                        Workspace.mostrarAviso(
                            layoutDivertido, 
                            'pingpong', // O nosso novo CSS animado
                            6000,       // Fica 6 segundos no ecrã a saltar
                            () => {
                                // 🖱️ O Atalho Direto
                                if (Workspace.Sidebar && Workspace.Sidebar.abrirChat) {
                                    Workspace.Sidebar.abrirChat(data.turmaId, nomeTurma);
                                }
                            }
                        );
                    }
                }
            }
        };

        sse.onerror = () => { console.log("Reconectando túnel em tempo real..."); };
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

            /* 🚀 NOVO DESIGN: BOLHA VERMELHA NUMERADA ESTILO MOBILE */
            #ws-noti-count {
                position: absolute !important;
                top: -6px !important;
                right: -6px !important;
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
        // 🚀 CORREÇÃO 2: Procura TODOS os sininhos na tela (Mobile e PC)
        const bells = document.querySelectorAll('#ws-bell');
        if (bells.length === 0) return;
        
        let dropdown = document.getElementById('ws-noti-dropdown');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.id = 'ws-noti-dropdown';
            dropdown.style.cssText = 'display:none;'; 
            // Prendemos no body para ser uma gaveta independente!
            document.body.appendChild(dropdown);
        }
        
        // 🚀 PREVINE DUPLICAÇÃO DE CLIQUES E ATIVA INSTANTANEAMENTE EM TODOS OS SINOS
        if (!Workspace.Alertas.cliquesConfigurados) {
            bells.forEach(bell => {
                bell.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation(); // Impede o clique de se perder
                    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                    const perfilDropdown = document.getElementById('ws-perfil-dropdown');
                    if (perfilDropdown) perfilDropdown.style.display = 'none';
                });
            });
            
            // Garante que clicar fora da gaveta também a fecha
            document.addEventListener('click', (e) => { 
                if (!e.target.closest('#ws-bell') && !e.target.closest('#ws-noti-dropdown')) {
                    dropdown.style.display = 'none'; 
                }
            });
            Workspace.Alertas.cliquesConfigurados = true; // Marca que já ativou os cliques
        }
    },

  buscarNotificacoes: async () => {
        if (!Workspace.usuario || !Workspace.usuario.nome) return;
        try {
            const data = await Workspace.api(`/workspace/notificacoes/${encodeURIComponent(Workspace.usuario.nome)}`);
            if (Array.isArray(data)) {
                const locais = Workspace.Alertas.notificacoesAtuais.filter(n => String(n.id).startsWith('alerta_local_'));
                Workspace.Alertas.notificacoesAtuais = [...locais, ...data];
                
                const idsAtuais = Workspace.Alertas.notificacoesAtuais.map(n => n.id);
                const novas = data.filter(n => !Workspace.Alertas.idsConhecidos.has(n.id));

                if (novas.length > 0 && Workspace.Alertas.idsConhecidos.size > 0) {
                    
                    novas.forEach((novaNoti, index) => {
                        setTimeout(async () => { 
                            
                            const titulo = novaNoti.mensagem.split('"')[1] || 'Atividade'; 

                            // 1. AVALIAÇÕES (ESCRITA E ORAL)
                            if (novaNoti.origem === 'avaliacao_escrita' || novaNoti.origem === 'avaliacao_oral') {
                                Toast.showInterativo({
                                    remetenteNome: novaNoti.remetenteNome,
                                    subtitulo: "Central de Avaliações",
                                    mensagemCorpo: `Atenção! A avaliação <strong>"${titulo}"</strong> foi liberada. Acesse a Central de Avaliações para não perder o prazo!`
                                }, 'avaliacao');
                            }
                            
                            // 2. AULAS ONLINE / SESSÕES AO VIVO
                            else if (novaNoti.origem === 'online') {
                                Toast.showInterativo({
                                    remetenteNome: novaNoti.remetenteNome,
                                    subtitulo: "Sala de Aula Online",
                                    mensagemCorpo: `Foi agendada a sessão: <strong>"${titulo}"</strong>.<br>🗓️ <i>Um alarme será criado automaticamente no seu Baú. Clique em "OK 👍🏻".!</i>`
                                }, 'online', async () => {
                                    try {
                                        let tempoLembrete;
                                        if (novaNoti.dataEvento && novaNoti.dataEvento.includes('T')) {
                                            const partes = novaNoti.dataEvento.split('T');
                                            const dataPartes = partes[0].split('-');
                                            const horaPartes = partes[1].split(':');
                                            
                                            tempoLembrete = new Date(
                                                parseInt(dataPartes[0], 10),     
                                                parseInt(dataPartes[1], 10) - 1,  
                                                parseInt(dataPartes[2], 10),      
                                                parseInt(horaPartes[0], 10),      
                                                parseInt(horaPartes[1], 10)       
                                            );
                                        } else {
                                            tempoLembrete = new Date();
                                            tempoLembrete.setHours(tempoLembrete.getHours() + 24);
                                        }

                                        const tempoDisparoMs = tempoLembrete.getTime();

                                        const res = await Workspace.api('/workspace/bau/alarmes', 'POST', {
                                            usuarioId: Workspace.usuario.id,
                                            mensagem: `Aula Online: ${titulo} (com ${novaNoti.remetenteNome})`,
                                            tempoDisparo: tempoDisparoMs
                                        }); 
                                        
                                        if (res && res.success && window.Workspace && Workspace.Bau) {
                                            Workspace.Bau.alarmesAtivos.push({
                                                id: res.id,
                                                mensagem: `Aula Online: ${titulo} (com ${novaNoti.remetenteNome})`,
                                                tempoDisparo: tempoDisparoMs,
                                                disparado: false
                                            });
                                            Workspace.Bau.atualizarCalendarioVisual();
                                        }
                                    } catch (e) { console.error("Erro ao criar alarme automático", e); }
                                });
                            }
                            
                            // 2.5 EDIÇÃO DE AULAS ONLINE 
                            else if (novaNoti.origem === 'online_edit') {
                                Toast.showInterativo({
                                    remetenteNome: novaNoti.remetenteNome,
                                    subtitulo: "Sessão Online Atualizada ⚠️",
                                    mensagemCorpo: `O(a) professor(a) fez alterações em "${titulo}". Não fique de fora, acompanhe o que mudou entrando na <strong>Sala de Acessos</strong>.<br>🗓️ <i>O lembrete no seu Baú foi atualizado automaticamente!</i>`
                                }, 'online', async () => {
                                    if (window.Workspace && Workspace.Bau && Workspace.Bau.carregarDadosDaNuvem) {
                                        Workspace.Bau.carregarDadosDaNuvem();
                                    }
                                });
                            }

                            // 3. EXERCÍCIOS / TAREFAS
                            else if (novaNoti.origem === 'tarefa' || novaNoti.origem === 'exercicio') {
                                const ehProfessor = Workspace.usuario.tipo === 'Professor' || Workspace.usuario.tipo === 'Gestor';
                                
                                Toast.showInterativo({
                                    remetenteNome: novaNoti.remetenteNome,
                                    subtitulo: ehProfessor ? "Sala de Acessos 🖥️" : "Novo Exercício 📝",
                                    mensagemCorpo: ehProfessor 
                                        ? `O aluno(a) <strong>${novaNoti.remetenteNome}</strong> ${novaNoti.mensagem}` 
                                        : `Há um novo exercício disponível para você: <strong>"${titulo}"</strong>.!`
                                }, 'tarefa');
                            }
                            
                            // 4. MATERIAIS
                            else if (novaNoti.origem === 'material') {
                                Toast.showInterativo({
                                    remetenteNome: novaNoti.remetenteNome,
                                    subtitulo: "Estante Virtual",
                                    mensagemCorpo: `Há um novo material na estante aguardando você: <strong>"${titulo}"</strong>.`
                                }, 'material');
                            }
                            
                            // 🚀 4.5. FEEDBACK DO PROFESSOR (NOVO)
                            else if (novaNoti.origem === 'feedback_tarefa') {
                                Toast.showInterativo({
                                    remetenteNome: novaNoti.remetenteNome,
                                    subtitulo: "Novo Feedback Recebido 💬",
                                    mensagemCorpo: `O(a) professor(a) <strong>${novaNoti.remetenteNome}</strong> enviou um comentário sobre o seu exercício. Clique em OK para ler!`
                                }, 'tarefa', async () => {
                                    // Invoca a função do teletransporte mágico imediatamente!
                                    Workspace.Alertas.lerEIr(novaNoti.id, novaNoti.origem, novaNoti.origemId, novaNoti.destinoNome);
                                });
                            }
                            
                            // ========================================================================
                            // 🚀 5. POSTS, REAÇÕES, COMENTÁRIOS E CHAT (A CORREÇÃO ENTRA AQUI!)
                            // ========================================================================
                            else {
                                // Mostra o Toast na tela
                                if (window.Toast && Toast.show) Toast.show(`🔔 ${novaNoti.remetenteNome} ${novaNoti.mensagem}`, 'info');
                                
                                // 🚀 CORREÇÃO 3: ATUALIZA TODOS OS SININHOS DA TELA PARA ABANAREM
const bells = document.querySelectorAll('#ws-bell');
bells.forEach(bell => { 
    bell.classList.add('bell-ringing'); 
    setTimeout(() => bell.classList.remove('bell-ringing'), 1000); 
});

// Força a atualização IMEDIATAMENTE 
Workspace.Alertas.atualizarInterface();
                            }

                        }, index * 1000); 
                    });
                } else if (novas.length > 0 && Workspace.Alertas.idsConhecidos.size === 0) {
                    // 🚀 SININHO OFFLINE RESOLVIDO: É o primeiro login e há histórico guardado!
                    // Acende a bolinha vermelha sem precisar de fazer animações!
                    Workspace.Alertas.atualizarInterface();
                }
                
                Workspace.Alertas.idsConhecidos = new Set(idsAtuais);
                
                // Continua a atualizar as notificações silenciosas (se não existirem novas a animar)
                if (novas.length === 0) Workspace.Alertas.atualizarInterface();
            }
        } catch (e) {}
    },

atualizarInterface: () => {
        // 🚀 CORREÇÃO 1: Procura TODAS as bolinhas de notificação e atualiza-as em simultâneo
        const badges = document.querySelectorAll('#ws-noti-count, .ws-badge');
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
            if (qtd === 0) {
                dropdown.innerHTML = `
                    <div style="display:flex; justify-content:flex-end; padding-bottom:10px; border-bottom:1px solid #eee;">
                        <button onclick="document.getElementById('ws-noti-dropdown').style.display='none'" style="background:#f0f2f5; border:none; color:#555; width:32px; height:32px; border-radius:50%; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:0.2s;" onmouseover="this.style.background='#e74c3c'; this.style.color='white'" title="Fechar Painel">✖</button>
                    </div>
                    <div style="text-align:center; color:#94a3b8; padding:50px 0;"><div style="font-size:45px; margin-bottom:10px;">🔔</div><div style="font-weight:600; font-size:16px;">Parabéns! </div><div style="font-size:13px; margin-top:5px;">Nenhuma notificação pendente.</div></div>`;
            } else {
                
                dropdown.innerHTML = `
                    <div style="font-weight:bold; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:15px; color:#2c3e50; display:flex; justify-content:space-between; align-items:center; flex-shrink: 0;">
                        <span style="font-size: 16px;">🔔 Notificações (${qtd})</span>
                        <div style="display:flex; gap: 10px; align-items: center;">
                            <button onclick="Workspace.Alertas.limparTodas()" style="background:transparent; border:none; color:#3498db; cursor:pointer; font-size:12px; font-weight:bold; padding:4px 8px; border-radius:4px; transition:0.2s;" onmouseover="this.style.background='#ebf5fb'" onmouseout="this.style.background='transparent'" title="Marcar todas como lidas">Excluir Todas</button>
                            <button onclick="document.getElementById('ws-noti-dropdown').style.display='none'" style="background:#f0f2f5; border:none; color:#555; width:32px; height:32px; border-radius:50%; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:0.2s;" onmouseover="this.style.background='#e74c3c'; this.style.color='white'" title="Fechar Painel">✖</button>
                        </div>
                    </div>
                    
                    <div id="ws-lista-notificacoes" class="ws-scroll-suave" style="display:flex; flex-direction:column; gap:2px; max-height: 75vh; overflow-y: auto; overscroll-behavior: contain; padding-right: 4px;">
                    ${Workspace.Alertas.notificacoesAtuais.map(n => {
                        const destino = n.destinoNome ? n.destinoNome.replace(/'/g, "\\'") : '';
                        const avatarSino = window.Workspace.renderizarAvatar(n.remetenteNome, 36);
                        return `
                        <div class="ws-noti-item" id="notif-item-${n.id}">
                            <div onclick="Workspace.Alertas.lerEIr('${n.id}', '${n.origem}', '${n.origemId}', '${destino}')" style="display: flex; gap: 12px; flex: 1; align-items: flex-start;">
                                ${avatarSino}
                                <div style="flex: 1; min-width: 0;">
                                    <div style="font-size:12.5px; color:#334155; line-height:1.4;"><strong style="color:#3498db;">${n.remetenteNome}</strong> ${n.mensagem}</div>
                                    <div class="ws-time-ago" data-time="${n.data}" style="font-size:10.5px; color:#94a3b8; font-weight:600; margin-top:4px;">${Workspace.Alertas.tempoRelativo(n.data)}</div>
                                </div>
                            </div>
                            <button class="ws-noti-close" onclick="Workspace.Alertas.riscar('${n.id}', event)" title="Marcar como lida">✖</button>
                        </div>`;
                    }).join('')}
                    </div>`;
            }
        }
    },

    // 🚀 A NOVA FUNÇÃO: Limpa todas com o Efeito Cascata!
    limparTodas: () => {
        if (!Workspace.usuario || !Workspace.usuario.nome) return;

        // 1. Procura todas as notificações visíveis na lista
        const itens = document.querySelectorAll('#ws-lista-notificacoes .ws-noti-item');
        if (itens.length === 0) return;

        // 2. Aplica a classe de animação "riscando" uma por uma, com atraso de 80ms (Efeito Cascata / Escada)
        itens.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('riscando');
            }, index * 80); 
        });

        // 3. Calcula o tempo exato para esperar a última animação terminar
        // (Quantidade de itens * 80ms) + 300ms (tempo de duração da animação no CSS)
        const tempoEspera = (itens.length * 80) + 300;

        // 4. Só depois de todas saírem da tela é que limpamos a memória e o banco de dados
        setTimeout(async () => {
            // Esvazia as listas locais e atualiza o ecrã para a mensagem de "Tudo limpo!"
            Workspace.Alertas.notificacoesAtuais = [];
            Workspace.Alertas.idsConhecidos.clear();
            Workspace.Alertas.atualizarInterface();

            // Envia a ordem secreta para o servidor limpar de vez
            try {
                const nomeDono = encodeURIComponent(Workspace.usuario.nome);
                await Workspace.api(`/workspace/notificacoes/usuario/${nomeDono}/ler-todas`, 'PUT');
            } catch (e) {
                console.error("Erro ao limpar notificações no servidor.");
            }
        }, tempoEspera);
    },

    lerEIr: async (id, origem, origemId, destinoNome) => {
        // Fecha a gaveta do sininho imediatamente
        const dropdown = document.getElementById('ws-noti-dropdown');
        if (dropdown) dropdown.style.display = 'none';

        // Marca como lida na memória e na nuvem
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

        // Esconde o chat se estiver aberto
        const modalChat = document.getElementById('ws-chat-modal');
        if (modalChat) modalChat.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 🚀 O ROTEADOR INTELIGENTE (O "Teletransporte" para qualquer área do Hub)
        // 🚀 O ROTEADOR INTELIGENTE (O "Teletransporte" com Destaque)
        if (origem === 'post' || origem === 'comentario_novo' || origem === 'comentario_reacao') {
            if (window.Workspace && Workspace.voltarAoFeed) Workspace.voltarAoFeed();
            
            let postId = origemId;
            let comentarioId = null;

            // Desempacota os IDs caso seja uma interação de comentário
            if (origemId.includes('|')) {
                const partes = origemId.split('|');
                postId = partes[0];
                comentarioId = partes[1];
            }

            const checkExist = setInterval(() => {
                const postElement = document.getElementById(`post-${postId}`);
                
                if (postElement) {
                    clearInterval(checkExist);
                    
                    // Se a notificação for de um comentário, garantimos que a aba de comentários abre!
                    if (comentarioId && Workspace.Feed && Workspace.Feed.toggleComentarios) {
                        const boxComentarios = document.getElementById(`box-comentarios-${postId}`);
                        if (boxComentarios && boxComentarios.style.display === 'none') {
                            Workspace.Feed.toggleComentarios(postId);
                        }
                    }

                    // Define quem vai brilhar (o Post inteiro ou apenas o Comentário exato)
                    let alvoDestaque = postElement;
                    if (comentarioId) {
                        const comElement = document.getElementById(`comentario-${comentarioId}`);
                        if (comElement) alvoDestaque = comElement;
                    }

                    // O Salto Automático
                    alvoDestaque.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // O Piscar de Cor (Remove a classe e volta a adicionar para forçar o recomeço da animação)
                    alvoDestaque.classList.remove('ws-highlight-magic');
                    void alvoDestaque.offsetWidth; 
                    alvoDestaque.classList.add('ws-highlight-magic');
                }
            }, 200);
            setTimeout(() => clearInterval(checkExist), 3000); // Desiste após 3 segundos se a net estiver lenta
        }
        else if (origem === 'chat') {
            if (window.Workspace && Workspace.voltarAoFeed) Workspace.voltarAoFeed();
            if (Workspace.Sidebar && Workspace.Sidebar.abrirChat) Workspace.Sidebar.abrirChat(origemId, destinoNome || 'Fórum da Turma');
        }
       else if (origem === 'tarefa' || origem === 'exercicio') {
            // Abre primeiro a página de Exercícios 
            if (window.Workspace && Workspace.navegarPara) Workspace.navegarPara('tarefas');
            
            setTimeout(async () => {
                // 🚀 O TRUQUE DE MESTRE: Força a plataforma a atualizar as tarefas (invisivelmente)
                // Isto garante que o aluno vê as novas edições que o professor fez!
                if (Workspace.Sidebar && Workspace.Sidebar.carregarTarefas) {
                    await Workspace.Sidebar.carregarTarefas();
                }
                // Só depois de atualizar é que abre o modal específico da tarefa
                if (Workspace.Sidebar && Workspace.Sidebar.abrirModalTarefa) {
                    Workspace.Sidebar.abrirModalTarefa(origemId);
                }
            }, 500); 
        }
        // 🚀 O NOVO ROTEIRO DO FEEDBACK 
        else if (origem === 'feedback_tarefa') {
            if (window.Workspace && Workspace.navegarPara) Workspace.navegarPara('tarefas');
            setTimeout(() => {
                // Desempacotamos os 2 IDs que guardamos no servidor separados pela barra vertical (|)
                const partes = origemId.split('|');
                const eventoId = partes[0];
                const entregaId = partes[1];
                
                if (Workspace.Sidebar && Workspace.Sidebar.abrirModalTarefa) {
                    Workspace.Sidebar.abrirModalTarefa(eventoId); // Abre o exercício
                    setTimeout(() => {
                        // 0.6 segundos depois, sobrepõe o modal de Feedback por cima do exercício!
                        if (Workspace.Sidebar.abrirModalFeedback) Workspace.Sidebar.abrirModalFeedback(entregaId, eventoId);
                    }, 600); 
                }
            }, 500); 
        }
        else if (origem === 'material') {
            // Abre o Hub e invoca a página de Materiais
            if (window.Workspace && Workspace.navegarPara) Workspace.navegarPara('sala_aula');
            setTimeout(() => {
                 if (window.Workspace && Workspace.abrirPaginaMateriais) Workspace.abrirPaginaMateriais();
            }, 300);
        }
        else if (origem === 'avaliacao_escrita') {
            if (window.Workspace && Workspace.navegarPara) Workspace.navegarPara('avaliacoes_escrita');
        }
        else if (origem === 'avaliacao_oral') {
            if (window.Workspace && Workspace.navegarPara) Workspace.navegarPara('avaliacoes_oral');
        }
        else if (origem === 'online' || origem === 'online_edit') {
            if (window.Workspace && Workspace.navegarPara) Workspace.navegarPara('avaliacoes_online');
        }
        else if (origem === 'bau') {
            if (Workspace.Bau && Workspace.Bau.irParaCalendarioDoBau) Workspace.Bau.irParaCalendarioDoBau(Number(origemId));
        }
    },

    riscar: async (id, event) => {
        event.stopPropagation(); 
        const itemUI = document.getElementById(`notif-item-${id}`);
        if(itemUI) itemUI.classList.add('riscando'); 
        
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
        } catch (e) { if(itemUI) itemUI.classList.remove('riscando'); }
    },

    tempoRelativo: (dataString) => {
        if (!dataString) return '';
        const dataPost = new Date(dataString);
        const diff = Math.floor((new Date() - dataPost) / 1000);
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