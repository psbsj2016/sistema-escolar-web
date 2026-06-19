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

                html += `
                    <div style="display: flex; flex-direction: column; align-items: ${alinhamento};">
                        ${!ehMinha ? `<span style="font-size: 11px; color: #666; margin-bottom: 2px; margin-left: 5px; font-weight: bold;">${Workspace.Sidebar.escapeHTML(m.autorNome)}</span>` : ''}
                        <div style="background: ${corFundo}; padding: 10px 15px; border-radius: 15px; max-width: 85%; box-shadow: 0 1px 2px rgba(0,0,0,0.1); font-size: 14px; color: #333; line-height: 1.4;">
                            ${Workspace.Sidebar.escapeHTML(m.texto).replace(/\n/g, '<br>')}
                            <div style="font-size: 10px; color: #999; text-align: right; margin-top: 5px; margin-right: -5px;">${hora}</div>
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

            Workspace.Sidebar.tarefasCache = eventos; // Guarda na memória

            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            // Filtra as atividades futuras e ordena por data
            const proximos = eventos.filter(e => new Date(e.data) >= hoje).sort((a, b) => new Date(a.data) - new Date(b.data)).slice(0, 5);

            if(proximos.length === 0) {
                container.innerHTML = '<p style="font-size: 13px; color: #7f8c8d; text-align:center;">Nenhuma atividade futura.</p>';
                return;
            }

            let html = '';
            proximos.forEach(ev => {
                let cor = '#3498db'; 
                let icone = '📌';
                if(ev.tipo === 'Feriado') { cor = '#e74c3c'; icone = '🏖️'; }
                if(ev.tipo === 'Evento') { cor = '#2ecc71'; icone = '🎉'; }
                if(ev.tipo === 'Reunião') { cor = '#f39c12'; icone = '👥'; }
                if(ev.tipo === 'Prova' || ev.tipo === 'Trabalho') { cor = '#9b59b6'; icone = '📝'; }

                const dataFormatada = new Date(ev.data).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'});
                
                // 🚀 ADICIONADO: Ao clicar, abre o modal de tarefa
                html += `
                    <div onclick="Workspace.Sidebar.abrirModalTarefa('${ev.id}')" style="background: #fff; border-left: 4px solid ${cor}; padding: 12px; border-radius: 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); margin-bottom: 12px; transition: 0.2s; cursor: pointer;" onmouseover="this.style.transform='translateX(4px)'" onmouseout="this.style.transform='translateX(0)'">
                        <div style="font-weight: 700; font-size: 13px; color: #2c3e50; margin-bottom: 6px; line-height: 1.3;">${icone} ${Workspace.Sidebar.escapeHTML(ev.descricao || ev.tipo)}</div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 10px; color: #7f8c8d; background: #f0f2f5; padding: 3px 6px; border-radius: 4px; font-weight: bold; text-transform: uppercase;">${Workspace.Sidebar.escapeHTML(ev.tipo)}</span>
                            <span style="font-size: 11px; color: ${cor}; font-weight: bold;">📅 ${dataFormatada}</span>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        } catch(e) { 
            container.innerHTML = '<p style="color:#e74c3c; font-size:12px; text-align:center;">Erro ao carregar agenda.</p>'; 
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

                            htmlEntregas += `
                                <div style="background: #f4f6f7; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <strong style="color: #2c3e50; font-size: 13px;">👨‍🎓 ${Workspace.Sidebar.escapeHTML(ent.alunoNome)}</strong>
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