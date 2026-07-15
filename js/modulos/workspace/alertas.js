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
        bell.addEventListener('click', (e) => {
            if (e.target.closest('#ws-bell') && !e.target.closest('#ws-noti-dropdown')) {
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                const perfilDropdown = document.getElementById('ws-perfil-dropdown');
                if (perfilDropdown) perfilDropdown.style.display = 'none';
            }
        });
        document.addEventListener('click', (e) => { if (!e.target.closest('#ws-bell')) dropdown.style.display = 'none'; });
    },

    buscarNotificacoes: async () => {
        if (!Workspace.usuario || !Workspace.usuario.nome) return;
        try {
            const data = await Workspace.api(`/workspace/notificacoes/${encodeURIComponent(Workspace.usuario.nome)}`);
            if (Array.isArray(data)) {
                // Preserva as notificações locais (como o alarme de 10 min) e junta com as que vieram da BD
                const locais = Workspace.Alertas.notificacoesAtuais.filter(n => String(n.id).startsWith('alerta_local_'));
                Workspace.Alertas.notificacoesAtuais = [...locais, ...data];
                
                const idsAtuais = Workspace.Alertas.notificacoesAtuais.map(n => n.id);
                const novas = data.filter(n => !Workspace.Alertas.idsConhecidos.has(n.id));

                if (novas.length > 0 && Workspace.Alertas.idsConhecidos.size > 0) {
                    if (window.Toast && Toast.show) Toast.show(`🔔 Tem ${novas.length} nova(s) notificação(ões)!`, 'info');
                    const bell = document.getElementById('ws-bell');
                    if(bell) { bell.classList.add('bell-ringing'); setTimeout(() => bell.classList.remove('bell-ringing'), 1000); }
                }
                Workspace.Alertas.idsConhecidos = new Set(idsAtuais);
                Workspace.Alertas.atualizarInterface();
            }
        } catch (e) {}
    },

    atualizarInterface: () => {
        const badge = document.getElementById('ws-noti-count');
        const dropdown = document.getElementById('ws-noti-dropdown');
        const qtd = Workspace.Alertas.notificacoesAtuais.length;

        if (badge) {
            badge.innerText = qtd > 99 ? '99+' : qtd;
            badge.style.display = qtd > 0 ? 'flex' : 'none';
            if (qtd > 0) badge.style.animation = 'pulse 1s infinite'; else badge.style.animation = 'none';
        }

        if (dropdown) {
            if (qtd === 0) {
                dropdown.innerHTML = `<div style="text-align:center; color:#94a3b8; padding:30px 0;"><div style="font-size:35px; margin-bottom:10px;">📭</div><div style="font-weight:600; font-size:14px;">Tudo limpo!</div><div style="font-size:12px; margin-top:5px;">Nenhuma notificação pendente.</div></div>`;
            } else {
                dropdown.innerHTML = `
                    <div style="font-weight:bold; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:10px; color:#2c3e50; display:flex; justify-content:space-between;"><span>Notificações (${qtd})</span></div>
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

    lerEIr: async (id, origem, origemId, destinoNome) => {
        const dropdown = document.getElementById('ws-noti-dropdown');
        if (dropdown) dropdown.style.display = 'none';

        // 🛡️ Se for um alerta gerado no momento (ex: Salas 10 min), apaga localmente sem ir ao servidor
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

        if (window.Workspace && Workspace.voltarAoFeed) Workspace.voltarAoFeed();
        else {
            const modalChat = document.getElementById('ws-chat-modal');
            if (modalChat) modalChat.style.display = 'none';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Encaminhamento
        if (origem === 'post') {
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
        else if (origem === 'chat' && Workspace.Sidebar && Workspace.Sidebar.abrirChat) Workspace.Sidebar.abrirChat(origemId, destinoNome || 'Fórum da Turma');
        else if (origem === 'tarefa' && Workspace.Sidebar && Workspace.Sidebar.abrirModalTarefa) Workspace.Sidebar.abrirModalTarefa(origemId);
        // 🚀 O Novo Encaminhamento para a Sala Online!
        else if (origem === 'online' && window.Workspace && Workspace.navegarPara) Workspace.navegarPara('avaliacoes_online');
    },

    riscar: async (id, event) => {
        event.stopPropagation(); 
        const itemUI = document.getElementById(`notif-item-${id}`);
        if(itemUI) itemUI.classList.add('riscando'); 
        
        // Se for alerta do telemóvel, descarta só da memória
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