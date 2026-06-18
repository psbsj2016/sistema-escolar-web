// js/modulos/workspace/sidebar.js
window.Workspace = window.Workspace || {};

Workspace.Sidebar = {
    turmaIdAberta: null,
    radarChat: null,

    init: async () => {
        console.log("📊 Motor do Menu Lateral iniciado.");
        await Workspace.Sidebar.carregarTurmas();
        await Workspace.Sidebar.carregarTarefas();
    },

    carregarTurmas: async () => {
        const container = document.getElementById('ws-lista-turmas');
        if (!container) return;

        container.innerHTML = '<p style="color:#999; font-size:12px; text-align:center;">A procurar fóruns... ⏳</p>';

        try {
            const turmas = await Workspace.api('/turmas', 'GET');
            
            if (!turmas || turmas.error || turmas.length === 0) {
                container.innerHTML = '<p style="color:#999; font-size:13px; text-align:center;">Nenhuma turma encontrada.</p>';
                return;
            }

            let html = '';
            turmas.forEach(t => {
                // Ao clicar, chama a função abrirChat com o ID e o Nome da Turma
                html += `
                    <div style="padding: 10px 12px; border-radius: 6px; margin-bottom: 8px; cursor: pointer; transition: 0.2s; background: #fff; border: 1px solid #e9ecef;" onmouseover="this.style.background='#f4f6f7'; this.style.borderColor='#bdc3c7'" onmouseout="this.style.background='#fff'; this.style.borderColor='#e9ecef'" onclick="Workspace.Sidebar.abrirChat('${t.id}', '${App.escapeHTML(t.nome)}')">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 28px; height: 28px; border-radius: 6px; background: #8e44ad; color: white; display: flex; align-items: center; justify-content: center; font-size: 14px;">💬</div>
                            <span style="font-weight: 500; color: #2c3e50; font-size: 13px;">${App.escapeHTML(t.nome)}</span>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        } catch (e) {
            container.innerHTML = '<p style="color:#e74c3c; font-size:12px; text-align:center;">Erro ao carregar turmas.</p>';
        }
    },

    // ==========================================
    // 💬 LÓGICA DO BATE-PAPO / FÓRUM DA TURMA
    // ==========================================

    abrirChat: (turmaId, turmaNome) => {
        Workspace.Sidebar.turmaIdAberta = turmaId;
        
        // Configura os textos do Cabeçalho
        document.getElementById('ws-chat-titulo').innerText = `Fórum: ${turmaNome}`;
        document.getElementById('ws-chat-aluno-nome').innerText = Workspace.usuario.nome || Workspace.usuario.login;
        
        // Mostra a janela do chat
        document.getElementById('ws-chat-modal').style.display = 'flex';
        
        // Limpa a caixa e foca para escrever
        document.getElementById('ws-chat-input').value = '';
        setTimeout(() => document.getElementById('ws-chat-input').focus(), 100);

        // Carrega as mensagens e inicia o radar para ver se chegam novas
        Workspace.Sidebar.carregarMensagensChat();
        if (Workspace.Sidebar.radarChat) clearInterval(Workspace.Sidebar.radarChat);
        Workspace.Sidebar.radarChat = setInterval(Workspace.Sidebar.carregarMensagensChat, 5000); // Procura mensagens a cada 5s
    },

    fecharChat: () => {
        document.getElementById('ws-chat-modal').style.display = 'none';
        Workspace.Sidebar.turmaIdAberta = null;
        if (Workspace.Sidebar.radarChat) clearInterval(Workspace.Sidebar.radarChat);
    },

    carregarMensagensChat: async () => {
        if (!Workspace.Sidebar.turmaIdAberta) return;
        
        const container = document.getElementById('ws-chat-mensagens');
        
        try {
            const mensagens = await Workspace.api(`/workspace/chat/${Workspace.Sidebar.turmaIdAberta}`, 'GET');
            
            if (!mensagens || mensagens.length === 0) {
                if(container.innerHTML.trim() === '' || container.innerHTML.includes('A carregar')) {
                    container.innerHTML = `<div style="text-align:center; padding:30px; color:#7f8c8d; font-size:13px;">Nenhuma mensagem neste fórum ainda.<br>Diga olá para a turma! 👋</div>`;
                }
                return;
            }

            // Descobre qual o nome de quem está logado para mudar a cor da mensagem (Verde = Minha, Branca = dos outros)
            const meuNome = Workspace.usuario.nome || Workspace.usuario.login;
            let html = '';

            mensagens.forEach(m => {
                const ehMinha = m.autorNome === meuNome;
                const alinhamento = ehMinha ? 'flex-end' : 'flex-start';
                const corFundo = ehMinha ? '#dcf8c6' : '#ffffff';
                const hora = new Date(m.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                html += `
                    <div style="display: flex; flex-direction: column; align-items: ${alinhamento};">
                        ${!ehMinha ? `<span style="font-size: 11px; color: #666; margin-bottom: 2px; margin-left: 5px; font-weight: bold;">${m.autorNome}</span>` : ''}
                        <div style="background: ${corFundo}; padding: 10px 15px; border-radius: 15px; max-width: 85%; box-shadow: 0 1px 2px rgba(0,0,0,0.1); font-size: 14px; color: #333; line-height: 1.4;">
                            ${m.texto.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
                            <div style="font-size: 10px; color: #999; text-align: right; margin-top: 5px; margin-right: -5px;">${hora}</div>
                        </div>
                    </div>
                `;
            });

            // Só atualiza o HTML se houver diferença (para não piscar o ecrã enquanto escrevemos)
            if (container.innerHTML !== html) {
                container.innerHTML = html;
                // Faz scroll automático para o fundo (mensagens mais recentes)
                container.scrollTop = container.scrollHeight;
            }

        } catch (e) {
            console.error("Erro ao carregar chat", e);
        }
    },

    enviarMensagemChat: async () => {
        const input = document.getElementById('ws-chat-input');
        const texto = input.value.trim();
        const turmaId = Workspace.Sidebar.turmaIdAberta;

        if (!texto || !turmaId) return;

        input.value = ''; // Limpa logo para dar fluidez

        try {
            await Workspace.api(`/workspace/chat/${turmaId}`, 'POST', {
                texto: texto,
                autorNome: Workspace.usuario.nome || Workspace.usuario.login
            });
            // Assim que envia, recarrega a lista para mostrar a nova mensagem
            await Workspace.Sidebar.carregarMensagensChat();
        } catch (e) {
            if (window.App && App.showToast) App.showToast("Erro ao enviar mensagem.", "error");
        }
    },

    // ==========================================
    // AGENDA PEDAGÓGICA (MANTIDO)
    // ==========================================
    carregarTarefas: async () => {
        const container = document.getElementById('ws-tarefas-pendentes');
        if (!container) return;

        container.innerHTML = '<p style="color:#999; font-size:12px; text-align:center;">A procurar agenda... ⏳</p>';

        try {
            const eventos = await Workspace.api('/eventos', 'GET');
            if (!eventos || eventos.error || eventos.length === 0) {
                container.innerHTML = '<p style="font-size: 13px; color: #7f8c8d; text-align:center;">Nenhuma atividade pendente.</p>';
                return;
            }

            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            const proximos = eventos.filter(e => new Date(e.data) >= hoje).sort((a, b) => new Date(a.data) - new Date(b.data)).slice(0, 4);

            if(proximos.length === 0) {
                container.innerHTML = '<p style="font-size: 13px; color: #7f8c8d; text-align:center;">Nenhuma atividade futura.</p>';
                return;
            }

            let html = '';
            proximos.forEach(ev => {
                let cor = '#3498db'; if(ev.tipo === 'Feriado') cor = '#e74c3c'; if(ev.tipo === 'Evento') cor = '#2ecc71'; if(ev.tipo === 'Reunião') cor = '#f39c12';
                const dataFormatada = new Date(ev.data).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'});
                html += `
                    <div style="background: #fff; border-left: 4px solid ${cor}; padding: 12px; border-radius: 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); margin-bottom: 12px; transition: 0.2s; cursor: pointer;" onmouseover="this.style.transform='translateX(4px)'" onmouseout="this.style.transform='translateX(0)'">
                        <div style="font-weight: 700; font-size: 13px; color: #2c3e50; margin-bottom: 6px; line-height: 1.3;">${ev.descricao || ev.tipo}</div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 10px; color: #7f8c8d; background: #f0f2f5; padding: 3px 6px; border-radius: 4px; font-weight: bold; text-transform: uppercase;">${ev.tipo}</span>
                            <span style="font-size: 11px; color: ${cor}; font-weight: bold;">📅 ${dataFormatada}</span>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        } catch(e) { container.innerHTML = '<p style="color:#e74c3c; font-size:12px; text-align:center;">Erro ao carregar agenda.</p>'; }
    }
};