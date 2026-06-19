// js/modulos/workspace/alertas.js
window.Workspace = window.Workspace || {};

Workspace.Alertas = {
    radar: null,
    notificacoesAtuais: [],

    init: () => {
        console.log("🔔 Motor de Alertas ativado com Cliques Direcionados.");
        Workspace.Alertas.construirDropdown();
        Workspace.Alertas.buscarNotificacoes();
        
        // O "Radar" que checa a base de dados a cada 15 segundos
        Workspace.Alertas.radar = setInterval(Workspace.Alertas.buscarNotificacoes, 15000);
    },

    construirDropdown: () => {
        const bell = document.getElementById('ws-bell');
        if (!bell) return;

        // Cria a "gaveta" flutuante de notificações
        let dropdown = document.getElementById('ws-noti-dropdown');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.id = 'ws-noti-dropdown';
            dropdown.style.cssText = 'display:none; position:absolute; right:0; top:40px; width:300px; background:white; border-radius:10px; box-shadow:0 10px 25px rgba(0,0,0,0.2); z-index:9999; padding:15px; color:#333; max-height:400px; overflow-y:auto; cursor:default;';
            bell.appendChild(dropdown);
        }

        // Evento de clique para abrir/fechar
        bell.addEventListener('click', async (e) => {
            if (e.target.closest('#ws-bell') && !e.target.closest('#ws-noti-dropdown')) {
                const isOpen = dropdown.style.display === 'block';
                dropdown.style.display = isOpen ? 'none' : 'block';
                
                // Fecha o menu de perfil se estiver aberto para não encavalar
                const perfilDropdown = document.getElementById('ws-perfil-dropdown');
                if (perfilDropdown) perfilDropdown.style.display = 'none';
                
                // Se abriu e havia notificações, avisa o servidor que já as lemos!
                if (!isOpen && Workspace.Alertas.notificacoesAtuais.length > 0) {
                    await Workspace.Alertas.marcarComoLidas();
                }
            }
        });

        // Fecha se clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#ws-bell')) {
                dropdown.style.display = 'none';
            }
        });
    },

    buscarNotificacoes: async () => {
        if (!Workspace.usuario || !Workspace.usuario.nome) return;

        try {
            // Usa o nome do utilizador logado para buscar os seus avisos
            const data = await Workspace.api(`/workspace/notificacoes/${encodeURIComponent(Workspace.usuario.nome)}`);
            if (Array.isArray(data)) {
                Workspace.Alertas.notificacoesAtuais = data;
                Workspace.Alertas.atualizarInterface();
            }
        } catch (e) {
            console.error("Erro ao buscar alertas", e);
        }
    },

    atualizarInterface: () => {
        const badge = document.getElementById('ws-noti-count');
        const dropdown = document.getElementById('ws-noti-dropdown');
        const qtd = Workspace.Alertas.notificacoesAtuais.length;

        // Atualiza a bolinha vermelha
        if (badge) {
            badge.innerText = qtd > 99 ? '99+' : qtd;
            badge.style.display = qtd > 0 ? 'flex' : 'none';
            if (qtd > 0) badge.style.animation = 'pulse 1s infinite';
            else badge.style.animation = 'none';
        }

        // Atualiza o texto dentro da gaveta
        if (dropdown) {
            if (qtd === 0) {
                dropdown.innerHTML = '<div style="text-align:center; color:#999; font-size:13px; padding:20px 0;">Nenhuma notificação nova.</div>';
            } else {
               dropdown.innerHTML = `
                    <div style="font-weight:bold; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:5px; color:#2c3e50;">Novidades (${qtd})</div>
                    ${Workspace.Alertas.notificacoesAtuais.map(n => {
                        const destino = n.destinoNome ? n.destinoNome.replace(/'/g, "\\'") : '';
                        
                        // 📸 Foto nas Notificações
                        const avatarSino = window.Workspace.renderizarAvatar(n.remetenteNome, 36);

                        return `
                        <div style="padding:10px; border-bottom:1px solid #f5f5f5; background:#fdfefe; border-radius:6px; margin-bottom:5px; cursor:pointer; transition:0.2s; display: flex; gap: 12px; align-items: flex-start;"
                             onmouseover="this.style.background='#f4f6f7'" onmouseout="this.style.background='#fdfefe'"
                             onclick="Workspace.Alertas.processarClique('${n.origem}', '${n.origemId}', '${destino}')">
                            ${avatarSino}
                            <div style="flex: 1;">
                                <div style="font-size:12px; color:#444; line-height:1.3;"><strong style="color:#3498db;">${n.remetenteNome}</strong> ${n.mensagem}</div>
                                <div style="font-size:10px; color:#aaa; margin-top:4px;">Agora mesmo</div>
                            </div>
                        </div>
                        `;
                    }).join('')}
                `;
            }
        }
    },

    marcarComoLidas: async () => {
        if (!Workspace.usuario || !Workspace.usuario.nome) return;
        try {
            await Workspace.api(`/workspace/notificacoes/ler/${encodeURIComponent(Workspace.usuario.nome)}`, 'PUT');
            // Mantemos os dados na tela para o usuário conseguir clicar mesmo após serem marcadas como lidas no banco
        } catch (e) { console.error("Erro ao limpar notificações"); }
    },

    // 🚀 O DIRECIONADOR INTELIGENTE (O MOTOR DE CLIQUES)
    processarClique: (origem, origemId, destinoNome) => {
        // 1. Esconde a gaveta de notificações
        const dropdown = document.getElementById('ws-noti-dropdown');
        if (dropdown) dropdown.style.display = 'none';

        // 2. Reseta o feed principal simulando o botão Home (Volta ao topo e fecha o chat antigo se houver)
        if (window.Workspace && Workspace.voltarAoFeed) {
            Workspace.voltarAoFeed();
        } else {
            const modalChat = document.getElementById('ws-chat-modal');
            if (modalChat) modalChat.style.display = 'none';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // 3. Executa a ação baseada na origem do gatilho
        if (origem === 'post') {
            // Procura o post no feed pelo ID da caixa de comentários
            const postElement = document.getElementById(`box-comentarios-${origemId}`);
            if (postElement) {
                // Rola a tela suavemente até centralizar o post desejado
                postElement.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Abre a caixa de comentários para que o usuário veja a nova interação
                if (Workspace.Feed && Workspace.Feed.toggleComentarios) {
                    Workspace.Feed.toggleComentarios(origemId);
                }
            }
        } 
        else if (origem === 'chat') {
            // Abre a sala de bate-papo daquela turma imediatamente
            if (Workspace.Sidebar && Workspace.Sidebar.abrirChat) {
                Workspace.Sidebar.abrirChat(origemId, destinoNome || 'Fórum da Turma');
            }
        } 
        else if (origem === 'tarefa') {
            // Abre o modal com os detalhes e arquivos da tarefa correspondente
            if (Workspace.Sidebar && Workspace.Sidebar.abrirModalTarefa) {
                Workspace.Sidebar.abrirModalTarefa(origemId);
            }
        }
    }
};