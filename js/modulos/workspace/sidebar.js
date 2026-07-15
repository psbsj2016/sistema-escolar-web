// js/modulos/workspace/sidebar.js

window.Workspace = window.Workspace || {};

Workspace.Sidebar = {
    turmaIdAberta: null,

    init: async () => {
        console.log("📂 Módulo Sidebar (Tarefas e Bate-papo) iniciado.");
        Workspace.Sidebar.initExtraChatTriggers();
    },

    /* =========================================================================
       💬 MÓDULO DE BATE-PAPO (CHAT)
       ========================================================================= */

    abrirChat: (turmaId, nomeTurma) => {
        Workspace.Sidebar.turmaIdAberta = turmaId;
        
        const modalChat = document.getElementById('ws-chat-modal');
        const tituloChat = document.getElementById('ws-chat-titulo');
        const alunoNomeEl = document.getElementById('ws-chat-aluno-nome');
        
        if (modalChat) modalChat.style.display = 'flex';
        if (tituloChat) tituloChat.innerText = nomeTurma || 'Fórum da Turma';
        if (alunoNomeEl) alunoNomeEl.innerText = Workspace.usuario.nome || Workspace.usuario.login;

        // 🛡️ SEGURANÇA: Mostra os 3 pontinhos (Menu) apenas para Professores e Gestores
        const btnMenu = document.getElementById('ws-btn-opcoes-chat');
        if (btnMenu) {
            if (Workspace.usuario.tipo === 'Professor' || Workspace.usuario.tipo === 'Gestor') {
                btnMenu.style.display = 'inline-block';
            } else {
                btnMenu.style.display = 'none';
            }
        }

        // Limpa a tela e vai buscar as mensagens à Base de Dados
        document.getElementById('ws-chat-mensagens').innerHTML = '<div style="text-align:center; padding:20px; color:#999;">A carregar mensagens... ⏳</div>';
        Workspace.Sidebar.buscarMensagensChat(turmaId);
    },

    fecharChat: () => {
        Workspace.Sidebar.turmaIdAberta = null;
        const modalChat = document.getElementById('ws-chat-modal');
        if (modalChat) modalChat.style.display = 'none';
    },

    buscarMensagensChat: async (turmaId) => {
        try {
            const res = await Workspace.api(`/workspace/chat/${turmaId}`, 'GET');
            if (res && res.success) {
                Workspace.Sidebar.renderizarMensagensChat(res.mensagens || []);
            } else {
                document.getElementById('ws-chat-mensagens').innerHTML = '<div style="text-align:center; padding:20px; color:#999;">Inicie a conversa nesta turma!</div>';
            }
        } catch (e) {
            document.getElementById('ws-chat-mensagens').innerHTML = '<div style="text-align:center; padding:20px; color:#e74c3c;">Erro ao carregar mensagens.</div>';
        }
    },

    // 🚀 AQUI ESTÁ A CORREÇÃO: A Lógica de Desenho das Fotos e Balões
    renderizarMensagensChat: (mensagens) => {
        const area = document.getElementById('ws-chat-mensagens');
        if (!area) return;
        
        const meuNome = Workspace.usuario.nome || Workspace.usuario.login;
        
        if (mensagens.length === 0) {
            area.innerHTML = '<div style="text-align:center; padding:20px; color:#999; font-weight:bold;">Sem mensagens. Seja o primeiro a escrever!</div>';
            return;
        }

        area.innerHTML = mensagens.map(msg => {
            // Verifica se a mensagem fui eu que enviei
            const isMinha = msg.autorNome === meuNome;
            
            // As classes CSS que empurram a linha para a direita ou esquerda
            const alinhamentoClasse = isMinha ? 'ws-linha-direita' : 'ws-linha-esquerda';
            const balaoClasse = isMinha ? 'ws-balao-direita' : 'ws-balao-esquerda';
            
            const dataObj = new Date(msg.data || Date.now());
            const hora = dataObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
            
            // 📸 A FOTO DO UTILIZADOR: Chama a função global que desenha os Avatars
            const avatarHtml = `
                <div style="margin: 0 8px; flex-shrink: 0; align-self: flex-end;">
                    ${window.Workspace.renderizarAvatar(msg.autorNome, 30)}
                </div>
            `;
            
            // 📎 Processamento do Ficheiro Anexo
            let anexoHtml = '';
            if (msg.anexoUrl) {
                if (msg.anexoTipo === 'image') {
                    anexoHtml = `<img src="${msg.anexoUrl}" loading="lazy" style="max-width: 100%; max-height: 250px; border-radius: 8px; margin-bottom: 5px; cursor: pointer; object-fit: cover;" onclick="Workspace.abrirVisualizadorImagem('${msg.anexoUrl}')">`;
                } else if (msg.anexoTipo === 'video') {
                    anexoHtml = `<video src="${msg.anexoUrl}" controls style="max-width: 100%; max-height: 250px; border-radius: 8px; margin-bottom: 5px;"></video>`;
                } else {
                    anexoHtml = `
                    <a href="${msg.anexoUrl}" target="_blank" style="display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.05); padding: 10px; border-radius: 8px; text-decoration: none; color: inherit; margin-bottom: 5px; transition: background 0.2s;" onmouseover="this.style.background='rgba(0,0,0,0.1)'" onmouseout="this.style.background='rgba(0,0,0,0.05)'">
                        <span style="font-size: 24px;">📄</span>
                        <span style="font-size: 13px; font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Abrir Ficheiro</span>
                    </a>`;
                }
            }

            const textoFormatado = msg.texto ? `<div style="margin-top: 2px;">${Workspace.escapeHTML(msg.texto)}</div>` : '';
            const nomeHtml = !isMinha ? `<div style="font-size: 11px; font-weight: bold; color: #3498db; margin-bottom: 3px;">${msg.autorNome}</div>` : '';

            // 🧩 A MONTAGEM INTELIGENTE DO BLOCO
            let layoutMsg = '';
            
            if (isMinha) {
                // Se é minha: Balão Primeiro, Foto Depois (Direita)
                layoutMsg = `
                    <div class="ws-balao-chat ${balaoClasse}">
                        ${anexoHtml}
                        ${textoFormatado}
                        <div style="font-size: 10px; opacity: 0.6; text-align: right; margin-top: 4px; margin-bottom: -4px;">${hora}</div>
                    </div>
                    ${avatarHtml}
                `;
            } else {
                // Se é do outro: Foto Primeiro, Balão Depois (Esquerda)
                layoutMsg = `
                    ${avatarHtml}
                    <div class="ws-balao-chat ${balaoClasse}">
                        ${nomeHtml}
                        ${anexoHtml}
                        ${textoFormatado}
                        <div style="font-size: 10px; opacity: 0.6; text-align: right; margin-top: 4px; margin-bottom: -4px;">${hora}</div>
                    </div>
                `;
            }

            return `<div class="ws-linha-chat ${alinhamentoClasse}">${layoutMsg}</div>`;
        }).join('');
        
        area.scrollTop = area.scrollHeight;
    },

    enviarMensagemChat: async () => {
        const input = document.getElementById('ws-chat-input');
        const texto = input.value.trim();
        
        if (!texto || !Workspace.Sidebar.turmaIdAberta) return;
        
        input.value = '';
        input.style.height = 'auto'; // Reseta o tamanho da caixa
        
        try {
            const res = await Workspace.api(`/workspace/chat/${Workspace.Sidebar.turmaIdAberta}`, 'POST', {
                texto: texto,
                escolaId: Workspace.usuario.escolaId,
                autorNome: Workspace.usuario.nome || Workspace.usuario.login
            });

            if (res && res.success) {
                Workspace.Sidebar.buscarMensagensChat(Workspace.Sidebar.turmaIdAberta);
            } else {
                Workspace.mostrarAviso("Erro ao enviar mensagem.", "error");
            }
        } catch(e) {
            Workspace.mostrarAviso("Falha de comunicação.", "error");
        }
    },

    enviarAnexoChat: async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 50 * 1024 * 1024) {
            Workspace.mostrarAviso("O ficheiro é demasiado grande (Máx: 50MB).", "warning");
            event.target.value = '';
            return;
        }

        Workspace.mostrarAviso("A enviar anexo... ⏳", "info", 5000);
        
        try {
            const formData = new FormData();
            formData.append('anexos', file);
            
            const uploadRes = await fetch('/api/workspace/upload', { method: 'POST', credentials: 'include', body: formData });
            const uploadData = await uploadRes.json();
            
            if (!uploadData.success || !uploadData.anexos) throw new Error("Falha no upload.");
            
            const anexoUrl = uploadData.anexos[0].url;
            const tipoRaw = file.type.split('/')[0];
            const anexoTipo = (tipoRaw === 'image' || tipoRaw === 'video') ? tipoRaw : 'document';
            
            const res = await Workspace.api(`/workspace/chat/${Workspace.Sidebar.turmaIdAberta}`, 'POST', {
                texto: '', 
                anexoUrl: anexoUrl,
                anexoTipo: anexoTipo,
                escolaId: Workspace.usuario.escolaId,
                autorNome: Workspace.usuario.nome || Workspace.usuario.login
            });

            if (res && res.success) {
                Workspace.Sidebar.buscarMensagensChat(Workspace.Sidebar.turmaIdAberta);
            } else {
                Workspace.mostrarAviso("Erro ao partilhar anexo no chat.", "error");
            }
        } catch (e) {
            Workspace.mostrarAviso("Falha de comunicação com o servidor.", "error");
        } finally {
            event.target.value = ''; 
        }
    },

    apagarTodoOChat: () => {
        if (!Workspace.Sidebar.turmaIdAberta) return;
        
        if (Workspace.Avaliacoes && Workspace.Avaliacoes.confirmarDialog) {
            Workspace.Avaliacoes.confirmarDialog(
                "Apagar Todo o Chat?", 
                "Deseja eliminar DEFINITIVAMENTE todo o histórico de mensagens desta turma? Esta ação afeta todos os alunos e não tem retorno.", 
                "🗑️ Sim, Apagar Tudo", 
                "#e74c3c", 
                async () => {
                    try {
                        const res = await Workspace.api(`/workspace/chat/${Workspace.Sidebar.turmaIdAberta}/limpar`, 'DELETE');
                        if (res && res.success) {
                            Workspace.mostrarAviso("Histórico apagado com sucesso.", "success");
                            document.getElementById('ws-chat-mensagens').innerHTML = '<div style="text-align:center; color:#999; margin-top:20px; font-weight:bold;">Chat reiniciado. Envie uma mensagem!</div>';
                        } else {
                            Workspace.mostrarAviso("Não tem permissões ou ocorreu um erro.", "error");
                        }
                    } catch(e) { Workspace.mostrarAviso("Falha de comunicação.", "error"); }
                }
            );
        } else {
            if(confirm("Deseja eliminar todo o histórico de mensagens?")) {
                Workspace.api(`/workspace/chat/${Workspace.Sidebar.turmaIdAberta}/limpar`, 'DELETE').then(() => {
                    document.getElementById('ws-chat-mensagens').innerHTML = '';
                    Workspace.mostrarAviso("Chat limpo.", "success");
                });
            }
        }
    },

    notificarDigitando: () => {
    },

    initExtraChatTriggers: () => {
        document.addEventListener('click', (e) => {
            const menuDropdown = document.getElementById('ws-chat-opcoes-dropdown');
            const menuButton = document.getElementById('ws-btn-opcoes-chat');
            if (menuDropdown && menuDropdown.style.display === 'flex') {
                if (!menuDropdown.contains(e.target) && e.target !== menuButton) {
                    menuDropdown.style.display = 'none';
                }
            }
        });
    },

    verFotoChat: () => {
        Workspace.mostrarAviso("Página de perfil da turma em desenvolvimento.", "info");
    },
    abrirEdicaoChat: () => {
        Workspace.mostrarAviso("Edição de perfil em desenvolvimento.", "info");
    },


    /* =========================================================================
       🏋️ MÓDULO DE TAREFAS E ATIVIDADES (PRESERVADO PARA NÃO QUEBRAR)
       ========================================================================= */

    carregarTurmas: async () => {
        try {
            const res = await Workspace.api(`/turmas?escolaId=${Workspace.usuario.escolaId}`, 'GET');
            const menu = document.getElementById('ws-lista-turmas-menu');
            if(res && res.length > 0 && menu) {
                menu.innerHTML = res.map(t => `<div style="padding: 8px; margin-bottom: 5px; background: #fff; border: 1px solid #eee; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: bold; color: #2c3e50;" onclick="Workspace.Sidebar.abrirChat('${t.id}', '${Workspace.escapeHTML(t.nome)}')">📚 ${Workspace.escapeHTML(t.nome)}</div>`).join('');
            } else if (menu) {
                menu.innerHTML = '<div style="font-size:12px; color:#999; text-align:center;">Nenhuma turma encontrada.</div>';
            }
            
            const selectTurma = document.getElementById('ws-nova-tarefa-turma');
            if(selectTurma && res) {
                selectTurma.innerHTML = '<option value="">Selecione uma turma...</option>' + res.map(t => `<option value="${t.id}">${Workspace.escapeHTML(t.nome)}</option>`).join('');
            }
        } catch(e) {}
    },

    carregarTarefas: async () => {
        const area = document.getElementById('ws-lista-tarefas-grid');
        if(!area) return;
        area.innerHTML = '<div style="text-align: center; color: #999;">A carregar atividades...</div>';
        
        try {
            const res = await Workspace.api(`/workspace/tarefas?alunoId=${Workspace.usuario.id}`, 'GET');
            if(res && res.success && res.tarefas.length > 0) {
                area.innerHTML = res.tarefas.map(t => `
                    <div style="background: white; border: 1px solid #eee; padding: 20px; border-radius: 12px; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <h4 style="margin:0 0 10px 0; color:#2c3e50;">${t.titulo}</h4>
                            <div style="font-size:12px; color:#e74c3c; margin-bottom: 10px;">Prazo: ${new Date(t.prazo).toLocaleDateString()}</div>
                        </div>
                        <button class="ws-btn" onclick="Workspace.Sidebar.abrirModalTarefa('${t.id}')">Acessar Tarefa</button>
                    </div>
                `).join('');
            } else {
                area.innerHTML = '<div style="text-align: center; color: #999; width: 100%;">Nenhuma atividade pendente.</div>';
            }
        } catch(e) { area.innerHTML = '<div style="color: #e74c3c;">Erro ao carregar.</div>'; }
    },

    voltarMenuTarefasProf: () => {
        document.getElementById('ws-prof-nova-tarefa').style.display = 'none';
        document.getElementById('ws-prof-lista-recebidas').style.display = 'none';
        document.getElementById('ws-prof-menu-tarefas').style.display = 'grid';
    },

    abrirPainelNovaTarefa: () => {
        document.getElementById('ws-prof-menu-tarefas').style.display = 'none';
        document.getElementById('ws-prof-nova-tarefa').style.display = 'block';
        Workspace.Sidebar.carregarTurmas();
    },

    abrirPainelTarefasRecebidas: () => {
        document.getElementById('ws-prof-menu-tarefas').style.display = 'none';
        document.getElementById('ws-prof-lista-recebidas').style.display = 'block';
    },

    salvarNovaTarefa: async () => {
        Workspace.mostrarAviso("Módulo de Gravação de Tarefas a ser conectado à API...", "info");
    },

    abrirModalTarefa: async (id) => {
        Workspace.mostrarAviso("Visualização de Tarefa em construção...", "info");
    },

    enviarTarefa: async () => {
        Workspace.mostrarAviso("Módulo de Entrega em construção...", "info");
    }
};