// js/modulos/workspace/alertas.js
window.Workspace = window.Workspace || {};

Workspace.Alertas = {
    notificacoesAtuais: [],
    idsConhecidos: new Set(),

    init: () => {
        console.log("🔔 Motor de Alertas: Conexão em Tempo Real (SSE) Ativada.");
        Workspace.Alertas.injetarCSS();
        Workspace.Alertas.construirDropdown();
        Workspace.Alertas.atualizarInterface();
        
        const aguardarUsuario = setInterval(() => {
            if (Workspace.usuario && Workspace.usuario.nome) {
                clearInterval(aguardarUsuario);
                Workspace.Alertas.buscarNotificacoes(); 
                Workspace.Alertas.iniciarConexaoTempoReal(); 
            }
        }, 1000);
    },

    iniciarConexaoTempoReal: () => {
        const escolaId = Workspace.usuario.escolaId || 'DEFAULT';
        const sse = new EventSource(`/api/workspace/stream?escolaId=${escolaId}`);

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
        `;
        document.head.appendChild(style);
    },

    construirDropdown: () => {
        const bell = document.getElementById('ws-bell');
        if (!bell) return;
        
        let dropdown = document.getElementById('ws-noti-dropdown');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.id = 'ws-noti-dropdown';
            
            // 🚀 LIMPAMOS O CSS ANTIGO: 
            // Deixamos apenas o display:none inicial para a lógica de abrir/fechar funcionar.
            // O nosso novo CSS no index.html (Gaveta) fará todo o resto do design!
            dropdown.style.cssText = 'display:none;'; 
            
            // 🚀 MUDANÇA ESTRUTURAL: 
            // Em vez de prender o menu dentro do sininho, prendemos no 'body' 
            // para ele poder ser uma gaveta lateral independente!
            document.body.appendChild(dropdown);
        }
        
        bell.addEventListener('click', (e) => {
            if (e.target.closest('#ws-bell') && !e.target.closest('#ws-noti-dropdown')) {
                // Alterna o estado. O nosso detetive (Observer) no HTML vai ver isto e deslizar a gaveta!
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                const perfilDropdown = document.getElementById('ws-perfil-dropdown');
                if (perfilDropdown) perfilDropdown.style.display = 'none';
            }
        });
        
        // Garante que clicar fora da gaveta também a fecha
        document.addEventListener('click', (e) => { 
            if (!e.target.closest('#ws-bell') && !e.target.closest('#ws-noti-dropdown')) {
                dropdown.style.display = 'none'; 
            }
        });
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
                        setTimeout(async () => { // Usamos async para o alarme do Baú
                            
                            const titulo = novaNoti.mensagem.split('"')[1] || 'Atividade'; // Extrai o nome da atividade que vem entre aspas

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
                                    mensagemCorpo: `Foi agendada a sessão: <strong>"${titulo}"</strong>.<br>🗓️ <i>Um alarme será criado no seu Baú ao confirmar!</i>`
                                }, 'online', async () => {
                                    // 🚀 A MÁGICA ACONTECE AQUI! (Só após o aluno clicar em "Ciente")
                                    try {
                                        let tempoLembrete;
                                        
                                        // Usa a data exata blindada do Servidor
                                        if (novaNoti.dataEvento) {
                                            tempoLembrete = new Date(novaNoti.dataEvento);
                                        } else {
                                            tempoLembrete = new Date();
                                            tempoLembrete.setHours(tempoLembrete.getHours() + 24);
                                        }

                                        // 🚀 O GRANDE SEGREDO DO BAÚ: Ele espera a data em Milissegundos (número) e não em texto!
                                        const tempoDisparoMs = tempoLembrete.getTime();

                                        const res = await Workspace.api('/workspace/bau/alarmes', 'POST', {
                                            usuarioId: Workspace.usuario.id,
                                            mensagem: `Aula Online: ${titulo} (com ${novaNoti.remetenteNome})`,
                                            tempoDisparo: tempoDisparoMs
                                        });
                                        
                                        // 🚀 UX EXTRA: Atualiza visualmente na mesma hora sem recarregar a página!
                                        if (res && res.success && window.Workspace && Workspace.Bau) {
                                            // Injeta o novo alarme diretamente na memória viva do Baú
                                            Workspace.Bau.alarmesAtivos.push({
                                                id: res.id,
                                                mensagem: `Aula Online: ${titulo} (com ${novaNoti.remetenteNome})`,
                                                tempoDisparo: tempoDisparoMs,
                                                disparado: false
                                            });
                                            
                                            // Manda o calendário redesenhar-se magicamente no ecrã!
                                            Workspace.Bau.atualizarCalendarioVisual();
                                        }
                                    } catch (e) { console.error("Erro ao criar alarme automático", e); }
                                });
                            }
                            
                            // 3. EXERCÍCIOS / TAREFAS
                            else if (novaNoti.origem === 'tarefa' || novaNoti.origem === 'exercicio') {
                                // 🚀 DISTINÇÃO INTELIGENTE: Verifica quem está a olhar para o ecrã
                                const ehProfessor = Workspace.usuario.tipo === 'Professor' || Workspace.usuario.tipo === 'Gestor';
                                
                                Toast.showInterativo({
                                    remetenteNome: novaNoti.remetenteNome,
                                    subtitulo: ehProfessor ? "Trabalho Entregue 📥" : "Novo Exercício 📝",
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
                            
                            // 5. POSTS OU CHAT (Avisos de Ping-Pong normais)
                            else {
                                if (window.Toast && Toast.show) Toast.show(`🔔 ${novaNoti.remetenteNome} ${novaNoti.mensagem}`, 'info');
                                const bell = document.getElementById('ws-bell');
                                if(bell) { bell.classList.add('bell-ringing'); setTimeout(() => bell.classList.remove('bell-ringing'), 1000); }
                            }

                        }, index * 1000); // 1 segundo de intervalo entre cada cartão
                    });
                }
                Workspace.Alertas.idsConhecidos = new Set(idsAtuais);
                // Não atualizamos o sininho AQUI! O sininho só atualiza quando o aluno clica em OK e a foto aterra nele!
                if (novas.length === 0) Workspace.Alertas.atualizarInterface();
            }
        } catch (e) {}
    },

  atualizarInterface: () => {
        const badge = document.getElementById('ws-noti-count');
        const dropdown = document.getElementById('ws-noti-dropdown');
        const qtd = Workspace.Alertas.notificacoesAtuais.length;

        if (badge) {
            badge.innerText = qtd > 99 ? '99+' : qtd;
            // 🚀 CORREÇÃO DO BUG DO ZERO: Força a remoção do display pelo JavaScript!
            if (qtd > 0) {
                badge.style.setProperty('display', 'flex', 'important');
                badge.style.animation = 'pulse 1s infinite';
            } else {
                badge.style.setProperty('display', 'none', 'important');
                badge.style.animation = 'none';
            }
        }

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
        if (origem === 'post') {
            if (window.Workspace && Workspace.voltarAoFeed) Workspace.voltarAoFeed();
            const checkExist = setInterval(() => {
                const postElement = document.getElementById(`box-comentarios-${origemId}`);
                if (postElement) {
                    clearInterval(checkExist);
                    postElement.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    if (Workspace.Feed && Workspace.Feed.toggleComentarios) {
                        if (postElement.style.display === 'none') Workspace.Feed.toggleComentarios(origemId);
                    }
                }
            }, 200);
            setTimeout(() => clearInterval(checkExist), 3000); 
        } 
        else if (origem === 'chat') {
            if (window.Workspace && Workspace.voltarAoFeed) Workspace.voltarAoFeed();
            if (Workspace.Sidebar && Workspace.Sidebar.abrirChat) Workspace.Sidebar.abrirChat(origemId, destinoNome || 'Fórum da Turma');
        }
        else if (origem === 'tarefa' || origem === 'exercicio') {
            // Abre primeiro a página de Exercícios e depois invoca o modal específico
            if (window.Workspace && Workspace.navegarPara) Workspace.navegarPara('tarefas');
            setTimeout(() => {
                if (Workspace.Sidebar && Workspace.Sidebar.abrirModalTarefa) Workspace.Sidebar.abrirModalTarefa(origemId);
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
        else if (origem === 'online') {
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