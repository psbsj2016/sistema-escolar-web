window.Workspace = window.Workspace || {};

Workspace.Alertas = {
    radar: null,
    notificacoesAtuais: [],
    idsConhecidos: new Set(),

    init: () => {
        console.log("🔔 Motor de Alertas: Persistência Individual em Tempo Real Ativada.");
        Workspace.Alertas.injetarCSS();
        Workspace.Alertas.construirDropdown();
        
        // 🚀 Oculta os sinos imediatamente ao carregar a página (Esconde antes de buscar)
        Workspace.Alertas.atualizarInterface();
        
        // Espera o usuário carregar antes de iniciar o radar
        const aguardarUsuario = setInterval(() => {
            if (Workspace.usuario && Workspace.usuario.nome) {
                clearInterval(aguardarUsuario);
                Workspace.Alertas.buscarNotificacoes();
                Workspace.Alertas.radar = setInterval(Workspace.Alertas.buscarNotificacoes, 10000); // Batimento a cada 10s
            }
        }, 1000);
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
            dropdown.style.cssText = 'display:none; position:absolute; right:0; top:45px; width:320px; background:white; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.15); z-index:9999; padding:15px; color:#333; max-height:450px; overflow-y:auto; cursor:default; border: 1px solid #eee;';
            bell.appendChild(dropdown);
        }

        // Abre e fecha, MAS NÃO MARCA COMO LIDO (Removemos a amnésia)
        bell.addEventListener('click', (e) => {
            if (e.target.closest('#ws-bell') && !e.target.closest('#ws-noti-dropdown')) {
                const isOpen = dropdown.style.display === 'block';
                dropdown.style.display = isOpen ? 'none' : 'block';
                
                const perfilDropdown = document.getElementById('ws-perfil-dropdown');
                if (perfilDropdown) perfilDropdown.style.display = 'none';
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#ws-bell')) {
                dropdown.style.display = 'none';
            }
        });
    },

    buscarNotificacoes: async () => {
        if (!Workspace.usuario || !Workspace.usuario.nome) return;

        try {
            const data = await Workspace.api(`/workspace/notificacoes/${encodeURIComponent(Workspace.usuario.nome)}`);
            if (Array.isArray(data)) {
                Workspace.Alertas.notificacoesAtuais = data;
                
                // Identifica se há notificações realmente novas
                const idsAtuais = data.map(n => n.id);
                const novas = data.filter(n => !Workspace.Alertas.idsConhecidos.has(n.id));

                if (novas.length > 0 && Workspace.Alertas.idsConhecidos.size > 0) {
                    // Toca o sino e mostra o Toast Popup
                    if (window.Toast && Toast.show) Toast.show(`🔔 Tem ${novas.length} nova(s) notificação(ões)!`, 'info');
                    
                    const fab = document.getElementById('ws-notif-fab');
                    const bell = document.getElementById('ws-bell');
                    
                    if(fab) {
                        fab.classList.add('bell-ringing');
                        setTimeout(() => fab.classList.remove('bell-ringing'), 1000);
                    }
                    if(bell) {
                        bell.classList.add('bell-ringing');
                        setTimeout(() => bell.classList.remove('bell-ringing'), 1000);
                    }
                }

                Workspace.Alertas.idsConhecidos = new Set(idsAtuais);
                Workspace.Alertas.atualizarInterface();
            }
        } catch (e) {
            console.error("Radar de Alertas em espera...");
        }
    },

    atualizarInterface: () => {
        const badge = document.getElementById('ws-noti-count');
        const dropdown = document.getElementById('ws-noti-dropdown');
        const qtd = Workspace.Alertas.notificacoesAtuais.length;

        // 🚀 LÓGICA DE OCULTAÇÃO INTELIGENTE DO SININHO
        const bell = document.getElementById('ws-bell');
        const fab = document.getElementById('ws-notif-fab');

        const toggleSino = (el, isVisible) => {
            if (!el) return;
            el.style.transition = 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
            if (isVisible) {
                // Para o FAB usa flex, para o sino normal volta ao original
                el.style.display = el.id === 'ws-notif-fab' ? 'flex' : ''; 
                setTimeout(() => {
                    el.style.transform = 'scale(1) translateY(0)';
                    el.style.opacity = '1';
                    el.style.pointerEvents = 'auto';
                }, 10);
            } else {
                el.style.transform = 'scale(0) translateY(20px)';
                el.style.opacity = '0';
                el.style.pointerEvents = 'none';
                setTimeout(() => {
                    if (Workspace.Alertas.notificacoesAtuais.length === 0) el.style.display = 'none';
                }, 400); // Aguarda o fim da animação de scale
            }
        };

        if (qtd === 0) {
            toggleSino(bell, false);
            toggleSino(fab, false);
            if (dropdown) dropdown.style.display = 'none'; // Fecha a gaveta
        } else {
            toggleSino(bell, true);
            toggleSino(fab, true);
        }

        // Atualiza a bolinha vermelha no sino de topo (se existir)
        if (badge) {
            badge.innerText = qtd > 99 ? '99+' : qtd;
            badge.style.display = qtd > 0 ? 'flex' : 'none';
            if (qtd > 0) badge.style.animation = 'pulse 1s infinite';
            else badge.style.animation = 'none';
        }

        if (dropdown && qtd > 0) {
            dropdown.innerHTML = `
                <div style="font-weight:bold; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:10px; color:#2c3e50; display:flex; justify-content:space-between;">
                    <span>Notificações (${qtd})</span>
                </div>
                <div style="display:flex; flex-direction:column; gap:2px;">
                ${Workspace.Alertas.notificacoesAtuais.map(n => {
                    const destino = n.destinoNome ? n.destinoNome.replace(/'/g, "\\'") : '';
                    const avatarSino = window.Workspace.renderizarAvatar(n.remetenteNome, 36);

                    return `
                    <div class="ws-noti-item" id="notif-item-${n.id}">
                        <div onclick="Workspace.Alertas.lerEIr('${n.id}', '${n.origem}', '${n.origemId}', '${destino}')" style="display: flex; gap: 12px; flex: 1; align-items: flex-start;">
                            ${avatarSino}
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-size:12.5px; color:#334155; line-height:1.4;"><strong style="color:#3498db;">${n.remetenteNome}</strong> ${n.mensagem}</div>
                                <div style="font-size:10.5px; color:#94a3b8; font-weight:600; margin-top:4px;">${Workspace.Alertas.tempoRelativo(n.data)}</div>
                            </div>
                        </div>
                        <!-- O Botão de Riscar Individual -->
                        <button class="ws-noti-close" onclick="Workspace.Alertas.riscar('${n.id}', event)" title="Marcar como lida">✖</button>
                    </div>
                    `;
                }).join('')}
                </div>
            `;
        }
    },

    // 🚀 LER E IR: Navegação Inteligente + Marcar como Lida
    lerEIr: async (id, origem, origemId, destinoNome) => {
        const dropdown = document.getElementById('ws-noti-dropdown');
        if (dropdown) dropdown.style.display = 'none';

        // 1. Marca na Base de Dados como LIDA instantaneamente
        try {
            await Workspace.api(`/workspace/notificacoes/${id}/ler`, 'PUT');
            Workspace.Alertas.notificacoesAtuais = Workspace.Alertas.notificacoesAtuais.filter(n => n.id !== id);
            Workspace.Alertas.idsConhecidos.delete(id);
            Workspace.Alertas.atualizarInterface(); // Esconde o sino se for a última!
        } catch(e) {}

        // 2. Navegação Dinâmica
        if (window.Workspace && Workspace.voltarAoFeed) {
            Workspace.voltarAoFeed();
        } else {
            const modalChat = document.getElementById('ws-chat-modal');
            if (modalChat) modalChat.style.display = 'none';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        if (origem === 'post') {
            // Caçador de Posts: Tenta encontrar o post mesmo se a página demorar a renderizar
            const checkExist = setInterval(() => {
                const postElement = document.getElementById(`box-comentarios-${origemId}`);
                if (postElement) {
                    clearInterval(checkExist);
                    postElement.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    if (Workspace.Feed && Workspace.Feed.toggleComentarios) {
                        if (postElement.style.display === 'none') {
                            Workspace.Feed.toggleComentarios(origemId);
                        }
                    }
                }
            }, 200);
            setTimeout(() => clearInterval(checkExist), 3000); 
        } 
        else if (origem === 'chat') {
            if (Workspace.Sidebar && Workspace.Sidebar.abrirChat) {
                Workspace.Sidebar.abrirChat(origemId, destinoNome || 'Fórum da Turma');
            }
        } 
        else if (origem === 'tarefa') {
            if (Workspace.Sidebar && Workspace.Sidebar.abrirModalTarefa) {
                Workspace.Sidebar.abrirModalTarefa(origemId);
            }
        }
    },

    // 🚀 RISCAR: Dispensar individualmente (Ação do X)
    riscar: async (id, event) => {
        event.stopPropagation(); // Impede de abrir o post ao clicar no X
        const itemUI = document.getElementById(`notif-item-${id}`);
        if(itemUI) itemUI.classList.add('riscando'); // Animação bonita de sair para a direita

        try {
            await Workspace.api(`/workspace/notificacoes/${id}/ler`, 'PUT');
            setTimeout(() => {
                Workspace.Alertas.notificacoesAtuais = Workspace.Alertas.notificacoesAtuais.filter(n => n.id !== id);
                Workspace.Alertas.idsConhecidos.delete(id);
                Workspace.Alertas.atualizarInterface(); // Se for o último 'X', o sino inteiro some!
            }, 300); // Espera a animação terminar
        } catch (e) {
            if(itemUI) itemUI.classList.remove('riscando');
        }
    },

    tempoRelativo: (dataString) => {
        if (!dataString) return '';
        const dataPost = new Date(dataString);
        const agora = new Date();
        const diff = Math.floor((agora - dataPost) / 1000);

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