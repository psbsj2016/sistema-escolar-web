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

    escapeHTML: (str) => {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },

    toggleTurmas: () => {
        const lista = document.getElementById('ws-lista-turmas');
        const icone = document.getElementById('ws-icon-turmas');
        if (!lista) return;

        if (lista.style.display === 'none') {
            lista.style.display = 'block';
            if (icone) icone.innerText = '▲';
        } else {
            lista.style.display = 'none';
            if (icone) icone.innerText = '▼';
        }
    },

    // 🛡️ A BARREIRA DE ACESSO ÀS SALAS
    carregarTurmas: async () => {
        const container = document.getElementById('ws-lista-turmas-menu');
        if (!container) return;

        // 1. Mensagem de carregamento inicial
        container.innerHTML = '<div style="padding:10px; color:#999; font-size:12px; text-align:center;">A carregar fóruns... ⏳</div>';

        try {
            // 2. Busca TODAS as turmas na nuvem
            let turmas = await Workspace.api('/turmas', 'GET');
            
            if (!turmas || turmas.error || turmas.length === 0) {
                container.innerHTML = '<div style="padding:10px; color:#e74c3c; font-size:12px; text-align:center;">Nenhuma turma encontrada.</div>';
                return;
            }

            // 🔒 3. FILTRO DE PRIVACIDADE DO ALUNO (VERSÃO INTELIGENTE)
            if (Workspace.usuario.tipo === 'Aluno') {
                let minhasTurmas = [];
                const u = Workspace.usuario;
                
                // Reúne todas as variáveis possíveis onde a turma possa estar guardada
                if (u.turmas) minhasTurmas = minhasTurmas.concat(u.turmas);
                if (u.turma) minhasTurmas = minhasTurmas.concat(u.turma);
                if (u.turmaId) minhasTurmas = minhasTurmas.concat(u.turmaId);
                if (u.turmaNome) minhasTurmas = minhasTurmas.concat(u.turmaNome);
                
                // Normaliza tudo para texto minúsculo e sem espaços extra para garantir o match
                const turmasDoAlunoSeguras = minhasTurmas
                    .filter(t => t) // Remove vazios
                    .map(t => String(t).toLowerCase().trim());

                // 🧠 HACK DE LÓGICA: Se não encontrou a turma no perfil, vai ler os posts do Feed
                if (Workspace.Feed && Workspace.Feed.postsCache) {
                    Workspace.Feed.postsCache.forEach(post => {
                        if (post.destino && post.destino !== 'global') {
                            turmasDoAlunoSeguras.push(String(post.destino).toLowerCase().trim());
                            turmasDoAlunoSeguras.push(String(post.destinoNome).toLowerCase().trim());
                        }
                    });
                }

                // Aplica o corte: Só passam as turmas que dão match com o ID ou Nome
                turmas = turmas.filter(t => {
                    const idGeral = String(t.id).toLowerCase().trim();
                    const nomeGeral = String(t.nome).toLowerCase().trim();
                    return turmasDoAlunoSeguras.includes(idGeral) || turmasDoAlunoSeguras.includes(nomeGeral);
                });
            }

            // Se o aluno realmente não estiver em nenhuma turma
            if (turmas.length === 0) {
                 container.innerHTML = '<div style="padding:10px; color:#7f8c8d; font-size:12px; text-align:center;">Ainda não está associado a nenhum fórum.</div>';
                 return;
            }

            // 4. Desenha apenas os fóruns autorizados no menu
            let html = '';
            turmas.forEach(t => {
                const nomeTurma = Workspace.Sidebar.escapeHTML(t.nome);
                // 🛡️ CORREÇÃO: O clique agora fecha o 'ws-main-menu-dropdown' corretamente sem dar erro!
                html += `
                    <div style="padding: 12px; margin-bottom: 5px; border-radius: 8px; background: #fdfdfd; border: 1px solid #f0f2f5; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s;" onmouseover="this.style.background='#f4f6f7'; this.style.borderColor='#e2e6ea'" onmouseout="this.style.background='#fdfdfd'; this.style.borderColor='#f0f2f5'" onclick="const menu = document.getElementById('ws-main-menu-dropdown'); if(menu) menu.style.display='none'; Workspace.Sidebar.abrirChat('${t.id}', '${nomeTurma}')">
                        <div style="width: 30px; height: 30px; border-radius: 50%; background: #8e44ad; color: white; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">#</div>
                        <span style="font-size: 13px; color: #2c3e50; font-weight: 600;">${nomeTurma}</span>
                    </div>
                `;
            });
            container.innerHTML = html;
            
        } catch (e) {
            container.innerHTML = '<div style="padding:10px; color:#e74c3c; font-size:12px; text-align:center;">Erro ao carregar fóruns.</div>';
        }
    },

    // ==========================================
    // 💬 LÓGICA DO BATE-PAPO / FÓRUM DA TURMA
    // ==========================================

    abrirChat: (turmaId, turmaNome) => {
        Workspace.Sidebar.turmaIdAberta = turmaId;
        
        document.getElementById('ws-chat-titulo').innerText = `Fórum: ${turmaNome}`;
        document.getElementById('ws-chat-aluno-nome').innerText = Workspace.usuario.nome || Workspace.usuario.login;
        
        document.getElementById('ws-chat-modal').style.display = 'flex';
        
        document.getElementById('ws-chat-input').value = '';
        setTimeout(() => document.getElementById('ws-chat-input').focus(), 100);

        Workspace.Sidebar.carregarMensagensChat();
        if (Workspace.Sidebar.radarChat) clearInterval(Workspace.Sidebar.radarChat);
        Workspace.Sidebar.radarChat = setInterval(Workspace.Sidebar.carregarMensagensChat, 5000); 
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

            const meuNome = Workspace.usuario.nome || Workspace.usuario.login;
            let html = '';

            mensagens.forEach(m => {
                const ehMinha = m.autorNome === meuNome;
                const alinhamento = ehMinha ? 'flex-end' : 'flex-start';
                const corFundo = ehMinha ? '#dcf8c6' : '#ffffff';
                const hora = new Date(m.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                // 📸 Foto no Bate-Papo
                const avatarChat = window.Workspace.renderizarAvatar(m.autorNome, 32);

                html += `
                    <div style="display: flex; gap: 10px; flex-direction: ${ehMinha ? 'row-reverse' : 'row'}; align-items: flex-end; margin-bottom: 12px;">
                        ${avatarChat}
                        <div style="display: flex; flex-direction: column; align-items: ${alinhamento}; max-width: 75%;">
                            ${!ehMinha ? `<span style="font-size: 11px; color: #666; margin-bottom: 2px; margin-left: 5px; font-weight: bold;">${Workspace.Sidebar.escapeHTML(m.autorNome)}</span>` : ''}
                            <div style="background: ${corFundo}; padding: 10px 15px; border-radius: 15px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); font-size: 14px; color: #333; line-height: 1.4; border-bottom-${ehMinha ? 'right' : 'left'}-radius: 4px;">
                                ${Workspace.Sidebar.escapeHTML(m.texto).replace(/\n/g, '<br>')}
                                <div style="font-size: 10px; color: #999; text-align: right; margin-top: 5px; margin-right: -5px;">${hora}</div>
                            </div>
                        </div>
                    </div>
                `;
            });

            if (container.innerHTML !== html) {
                container.innerHTML = html;
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

        input.value = ''; 

        try {
            await Workspace.api(`/workspace/chat/${turmaId}`, 'POST', {
                texto: texto,
                autorNome: Workspace.usuario.nome || Workspace.usuario.login
            });
            await Workspace.Sidebar.carregarMensagensChat();
        } catch (e) {
            if (window.App && App.showToast) App.showToast("Erro ao enviar mensagem.", "error");
        }
    },

    // ==========================================
    // 📅 AGENDA PEDAGÓGICA E ENTREGA DE TAREFAS
    // ==========================================
    tarefasCache: [],

    // 📝 O NOVO MOTOR DE TAREFAS EM GRELHA (CARDS)
    carregarTarefas: async () => {
        const container = document.getElementById('ws-lista-tarefas-grid');
        if (!container) return;

        container.innerHTML = '<div style="grid-column: 1 / -1; padding: 30px; color:#999; font-size:15px; text-align:center;">A procurar atividades na nuvem... ⏳</div>';

        try {
            const eventos = await Workspace.api('/eventos', 'GET');
            
            if (!eventos || eventos.error || eventos.length === 0) {
                container.innerHTML = '<div style="grid-column: 1 / -1; padding: 40px; color:#7f8c8d; font-size:16px; text-align:center;">🎉 Que maravilha! Não há tarefas agendadas no momento.</div>';
                return;
            }

            // Filtra só o que for Tarefa/Trabalho
            let tarefas = eventos.filter(e => e.tipo === 'Tarefa' || e.tipo === 'Trabalho');

            // 🔒 Filtro de Privacidade (Aluno só vê as da turma dele)
            if (Workspace.usuario.tipo === 'Aluno') {
                let minhasTurmas = [];
                const u = Workspace.usuario;
                if (u.turmas) minhasTurmas = minhasTurmas.concat(u.turmas);
                if (u.turma) minhasTurmas = minhasTurmas.concat(u.turma);
                
                const turmasSeguras = minhasTurmas.filter(t => t).map(t => String(t).toLowerCase().trim());

                tarefas = tarefas.filter(t => {
                    if (!t.turma || String(t.turma).toLowerCase().trim() === 'global') return true;
                    return turmasSeguras.includes(String(t.turma).toLowerCase().trim());
                });
            }

            if (tarefas.length === 0) {
                 container.innerHTML = '<div style="grid-column: 1 / -1; padding: 40px; color:#7f8c8d; font-size:16px; text-align:center;">🎉 Nenhuma tarefa pendente para a sua turma!</div>';
                 return;
            }

            // Ordena (As que terminam mais rápido primeiro)
            tarefas.sort((a, b) => new Date(a.data) - new Date(b.data));

            let html = '';
            tarefas.forEach(t => {
                const dataObj = new Date(t.data);
                const hoje = new Date();
                hoje.setHours(0,0,0,0); // Ignora a hora exata para o cálculo do dia
                
                const passou = dataObj < hoje;
                const corEstado = passou ? '#e74c3c' : '#27ae60';
                const fundoEstado = passou ? '#fdf2f2' : '#eafaf1';
                const textoEstado = passou ? 'Prazo Terminado' : 'No Prazo';
                const dataFormatada = dataObj.toLocaleDateString('pt-BR');

                // O Card de Tarefa
                html += `
                    <div style="background: white; border: 1px solid #e1e4e8; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; transition: 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.02);" onmouseover="this.style.boxShadow='0 10px 25px rgba(0,0,0,0.1)'; this.style.transform='translateY(-3px)'" onmouseout="this.style.boxShadow='0 4px 6px rgba(0,0,0,0.02)'; this.style.transform='translateY(0)'">
                        
                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                                <div style="background: #f4f6f7; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; color: #2c3e50; text-transform: uppercase; letter-spacing: 0.5px;">
                                    📚 ${Workspace.Sidebar.escapeHTML(t.turma || 'Geral')}
                                </div>
                                <div style="font-size: 10px; font-weight: bold; color: ${corEstado}; background: ${fundoEstado}; padding: 4px 8px; border-radius: 8px;">
                                    ${textoEstado}
                                </div>
                            </div>
                            
                            <h4 style="margin: 0 0 8px 0; color: #3498db; font-size: 17px;">${Workspace.Sidebar.escapeHTML(t.titulo || t.nome)}</h4>
                            
                            <p style="margin: 0 0 20px 0; font-size: 13px; color: #666; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                                ${Workspace.Sidebar.escapeHTML(t.descricao || 'Clique para ver as instruções detalhadas.')}
                            </p>
                        </div>
                        
                        <div style="border-top: 1px solid #f0f2f5; padding-top: 15px; display: flex; justify-content: space-between; align-items: center;">
                            <div style="font-size: 12px; color: #7f8c8d; display: flex; align-items: center; gap: 5px; font-weight: 500;">
                                <span style="font-size:14px;">📅</span> Entrega: ${dataFormatada}
                            </div>
                            <button class="ws-btn" style="padding: 8px 15px; font-size: 12px; border-radius: 6px; background: #2c3e50;" onclick="Workspace.Sidebar.abrirModalTarefa('${t.id}')">
                                Detalhes ↗
                            </button>
                        </div>
                        
                    </div>
                `;
            });
            container.innerHTML = html;
        } catch (e) {
            container.innerHTML = '<div style="grid-column: 1 / -1; padding: 20px; color:#e74c3c; font-size:14px; text-align:center;">Erro ao carregar atividades. Tente atualizar a página.</div>';
        }
    },

    abrirModalTarefa: async (eventoId) => {
        const evento = Workspace.Sidebar.tarefasCache.find(e => e.id === eventoId);
        if (!evento) return;

        document.getElementById('ws-tarefa-id').value = evento.id;
        document.getElementById('ws-tarefa-titulo').innerText = evento.descricao || evento.tipo;
        const dataFormatada = new Date(evento.data).toLocaleDateString('pt-BR');
        document.getElementById('ws-tarefa-data').innerText = `📅 Prazo: ${dataFormatada}`;
        document.getElementById('ws-tarefa-desc').innerHTML = evento.detalhes ? Workspace.Sidebar.escapeHTML(evento.detalhes).replace(/\n/g, '<br>') : 'Acompanhe os detalhes desta atividade.';

        document.getElementById('ws-area-entrega').style.display = 'none';
        document.getElementById('ws-area-entregue').style.display = 'none';
        const areaProfessor = document.getElementById('ws-area-professor');
        if (areaProfessor) areaProfessor.style.display = 'none';

        document.getElementById('ws-tarefa-modal').style.display = 'flex';

        const ehAluno = Workspace.usuario.tipo === 'Aluno';

        if (!ehAluno) {
            // 👨‍🏫 MESA DO PROFESSOR
            if (areaProfessor) {
                areaProfessor.style.display = 'block';
                document.getElementById('ws-lista-entregas').innerHTML = '<p style="font-size: 12px; color: #999; text-align: center;">A buscar trabalhos... ⏳</p>';
                
                try {
                    const entregas = await Workspace.api(`/workspace/entregas/tarefa/${evento.id}`, 'GET');
                    
                    if (!entregas || entregas.length === 0) {
                        document.getElementById('ws-lista-entregas').innerHTML = '<div style="background: #f9f9f9; border: 1px solid #eee; padding: 15px; border-radius: 8px; text-align: center;"><div style="font-size:24px; margin-bottom:5px;">📭</div><div style="font-size:13px; color:#7f8c8d;">Nenhum aluno entregou este trabalho ainda.</div></div>';
                    } else {
                        let htmlEntregas = '';
                        entregas.forEach(ent => {
                            const dataEnt = new Date(ent.dataEntrega).toLocaleString('pt-BR', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'});
                            
                            // 🛡️ CORREÇÃO: Trata a URL e força download se for Office
                            let urlCorrigida = ent.arquivoUrl;
                            if (!urlCorrigida.startsWith('http') && !urlCorrigida.startsWith('/')) {
                                urlCorrigida = '/' + urlCorrigida;
                            }
                            const nomeMinusculo = (ent.arquivoNome || '').toLowerCase();
                            const ehOffice = nomeMinusculo.endsWith('.docx') || nomeMinusculo.endsWith('.doc') || nomeMinusculo.endsWith('.xlsx') || nomeMinusculo.endsWith('.xls');
                            const attrDownload = ehOffice ? `download="${ent.arquivoNome}"` : '';

                           // 📸 Foto na lista de Trabalhos Entregues (Para o Professor)
                            const avatarAluno = window.Workspace.renderizarAvatar(ent.alunoNome, 28);

                            htmlEntregas += `
                                <div style="background: #f4f6f7; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            ${avatarAluno}
                                            <strong style="color: #2c3e50; font-size: 13px;">${Workspace.Sidebar.escapeHTML(ent.alunoNome)}</strong>
                                        </div>
                                        <span style="font-size: 10px; color: #7f8c8d; font-weight: bold; background: #e2e6ea; padding: 2px 6px; border-radius: 4px;">${dataEnt}</span>
                                    </div>
                                    ${ent.observacao ? `<div style="font-size: 12px; color: #555; font-style: italic; background: #fff; padding: 8px; border-radius: 6px; border: 1px solid #eee;">💬 "${Workspace.Sidebar.escapeHTML(ent.observacao)}"</div>` : ''}
                                    <a href="${urlCorrigida}" ${attrDownload} target="_blank" style="background: #3498db; color: white; padding: 8px 12px; border-radius: 6px; font-size: 12px; text-decoration: none; text-align: center; font-weight: bold; margin-top: 5px; transition: 0.2s;" onmouseover="this.style.background='#2980b9'">📥 Abrir / Baixar Trabalho</a>
                                </div>
                            `;
                        });
                        document.getElementById('ws-lista-entregas').innerHTML = htmlEntregas;
                    }
                } catch(e) {
                    document.getElementById('ws-lista-entregas').innerHTML = '<p style="color: #e74c3c; font-size: 12px; text-align:center;">Erro ao buscar entregas.</p>';
                }
            }
        } else {
            // 🎓 LÓGICA DO ALUNO
            document.getElementById('ws-tarefa-arquivo').value = '';
            document.getElementById('ws-tarefa-obs').value = '';

            try {
                const alunoRefId = Workspace.usuario.alunoRefId || Workspace.usuario.id;
                const res = await Workspace.api(`/workspace/entregas/verificar/${evento.id}/${alunoRefId}`, 'GET');
                
                if (res && res.entregue && res.detalhes) {
                    document.getElementById('ws-area-entregue').style.display = 'block';
                    const dataEnt = new Date(res.detalhes.dataEntrega).toLocaleString('pt-BR');
                    document.getElementById('ws-tarefa-data-entregue').innerText = `Enviado em: ${dataEnt}`;
                    
                    // 🛡️ CORREÇÃO: Trata a URL do anexo que o aluno já enviou
                    let urlCorrigida = res.detalhes.arquivoUrl;
                    if (!urlCorrigida.startsWith('http') && !urlCorrigida.startsWith('/')) {
                        urlCorrigida = '/' + urlCorrigida;
                    }
                    const nomeMinusculo = (res.detalhes.arquivoNome || '').toLowerCase();
                    const ehOffice = nomeMinusculo.endsWith('.docx') || nomeMinusculo.endsWith('.doc') || nomeMinusculo.endsWith('.xlsx') || nomeMinusculo.endsWith('.xls');
                    const attrDownload = ehOffice ? `download="${res.detalhes.arquivoNome}"` : '';

                    const btnLink = document.getElementById('ws-tarefa-link-entregue');
                    btnLink.href = urlCorrigida;
                    if(ehOffice) btnLink.setAttribute('download', res.detalhes.arquivoNome);
                    else btnLink.removeAttribute('download');

                } else {
                    document.getElementById('ws-area-entrega').style.display = 'block';
                }
            } catch (e) {
                document.getElementById('ws-area-entrega').style.display = 'block'; 
            }
        }
    },

    enviarTarefa: async () => {
        const eventoId = document.getElementById('ws-tarefa-id').value;
        const fileInput = document.getElementById('ws-tarefa-arquivo');
        const obs = document.getElementById('ws-tarefa-obs').value.trim();

        if (!fileInput.files || fileInput.files.length === 0) {
            alert("⚠️ Selecione um ficheiro (PDF, Word ou Imagem) para enviar o seu trabalho.");
            return;
        }

        const file = fileInput.files[0];
        
        // Bloqueio de tamanho (Máx 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert("⚠️ O ficheiro é muito pesado. Tente um ficheiro até 10MB.");
            return;
        }

        const btn = document.getElementById('ws-btn-entregar');
        const txtOriginal = btn.innerText;
        btn.innerText = "☁️ A subir ficheiro para a Nuvem...";
        btn.disabled = true;

        try {
            // 1. Faz upload do ficheiro para a Nuvem (Cloudinary) usando a rota que já criámos na Fase 3
            const formData = new FormData();
            formData.append('anexos', file);

            const uploadRes = await fetch('/api/workspace/upload', {
                method: 'POST',
                credentials: 'include',
                body: formData 
            });

            const uploadData = await uploadRes.json();
            
            if (!uploadData.success || !uploadData.anexos || uploadData.anexos.length === 0) {
                throw new Error("Falha no upload do ficheiro.");
            }

            const arquivoFinalUrl = uploadData.anexos[0].url;

            btn.innerText = "📝 A gravar entrega...";

            // 2. Grava a Entrega na Base de Dados
            const payload = {
                eventoId: eventoId,
                alunoId: Workspace.usuario.alunoRefId || Workspace.usuario.id,
                alunoNome: Workspace.usuario.nome || Workspace.usuario.login,
                arquivoUrl: arquivoFinalUrl,
                arquivoNome: file.name,
                observacao: obs
            };

            const entregaRes = await Workspace.api('/workspace/entregas', 'POST', payload);

            if (entregaRes && entregaRes.success) {
                alert("🎉 Trabalho entregue com sucesso!");
                // Recarrega o modal para mostrar a tela verde de sucesso
                Workspace.Sidebar.abrirModalTarefa(eventoId);
            } else {
                throw new Error(entregaRes.error || "Erro ao gravar entrega.");
            }

        } catch (e) {
            console.error(e);
            alert("Erro ao enviar trabalho. Tente novamente.");
        } finally {
            btn.innerText = txtOriginal;
            btn.disabled = false;
        }
    }
};