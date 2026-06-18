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
        const container = document.getElementById('ws-lista-turmas');
        if (!container) return;

        try {
            // Vai buscar a lista de turmas e a lista de todos os alunos da escola
            const [turmas, alunos] = await Promise.all([
                Workspace.api('/turmas', 'GET'),
                Workspace.api('/alunos', 'GET')
            ]);
            
            if (!turmas || turmas.error || turmas.length === 0) {
                container.innerHTML = '<div style="padding:10px; color:#999; font-size:12px;">Nenhuma turma encontrada na escola.</div>';
                return;
            }

            let turmasPermitidas = [];

            // Se for um Aluno, liga o cadeado!
            if (Workspace.usuario.tipo === 'Aluno') {
                // Procura a ficha de matrícula deste aluno específico
                const meuPerfil = alunos.find(a => a.id === Workspace.usuario.alunoRefId);
                
                if (meuPerfil) {
                    // Extrai as turmas onde ele está matriculado (compatível com texto ou multi-select)
                    let minhasTurmas = [];
                    if (meuPerfil.turmas) {
                        minhasTurmas = Array.isArray(meuPerfil.turmas) ? meuPerfil.turmas : [meuPerfil.turmas];
                    } else if (meuPerfil.turma) {
                        minhasTurmas = [meuPerfil.turma];
                    }

                    // Filtra a lista geral e deixa passar SÓ as turmas dele
                    turmasPermitidas = turmas.filter(t => minhasTurmas.includes(t.id) || minhasTurmas.includes(t.nome));
                }
            } else {
                // Gestor, Secretaria e Professores têm a "Chave Mestra", veem todas as turmas!
                turmasPermitidas = turmas;
            }

            // Se o aluno não estiver matriculado em lado nenhum
            if (turmasPermitidas.length === 0) {
                container.innerHTML = '<div style="padding:10px; color:#e74c3c; font-size:12px; text-align:center;">Você não está matriculado em nenhuma turma.</div>';
                return;
            }

            let html = '';
            turmasPermitidas.forEach(t => {
                const nomeSeguro = Workspace.Sidebar.escapeHTML(t.nome);
                html += `
                    <div style="padding: 8px 10px; border-radius: 6px; margin-bottom: 5px; margin-top: 5px; cursor: pointer; transition: 0.2s; background: #fff; border: 1px solid #e9ecef;" onmouseover="this.style.background='#f4f6f7'; this.style.borderColor='#bdc3c7'" onmouseout="this.style.background='#fff'; this.style.borderColor='#e9ecef'" onclick="Workspace.Sidebar.abrirChat('${t.id}', '${nomeSeguro}')">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 24px; height: 24px; border-radius: 6px; background: #8e44ad; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px;">💬</div>
                            <span style="font-weight: 500; color: #2c3e50; font-size: 12px;">${nomeSeguro}</span>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        } catch (e) {
            container.innerHTML = '<div style="padding:10px; color:#e74c3c; font-size:12px; text-align:center;">Erro ao carregar turmas.</div>';
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

        // Preenche o Modal com as informações da atividade
        document.getElementById('ws-tarefa-id').value = evento.id;
        document.getElementById('ws-tarefa-titulo').innerText = evento.descricao || evento.tipo;
        
        const dataFormatada = new Date(evento.data).toLocaleDateString('pt-BR');
        document.getElementById('ws-tarefa-data').innerText = `📅 Prazo: ${dataFormatada}`;
        
        // Se o professor tiver escrito detalhes da tarefa, mostramos. Se não, metemos um genérico.
        document.getElementById('ws-tarefa-desc').innerHTML = evento.detalhes ? Workspace.Sidebar.escapeHTML(evento.detalhes).replace(/\n/g, '<br>') : 'Envie a sua resolução/trabalho através do campo abaixo antes do prazo terminar.';

        // Limpa os campos de envio
        document.getElementById('ws-tarefa-arquivo').value = '';
        document.getElementById('ws-tarefa-obs').value = '';
        
        // Abre o modal em modo de carregamento
        document.getElementById('ws-tarefa-modal').style.display = 'flex';
        document.getElementById('ws-area-entrega').style.display = 'none';
        document.getElementById('ws-area-entregue').style.display = 'none';

        // 🛡️ Verifica no servidor se o aluno JÁ entregou isto antes
        try {
            const alunoRefId = Workspace.usuario.alunoRefId || Workspace.usuario.id; // Se for aluno, usa a ref dele
            const res = await Workspace.api(`/workspace/entregas/verificar/${evento.id}/${alunoRefId}`, 'GET');
            
            if (res && res.entregue && res.detalhes) {
                // Já entregou! Mostra o selo verde.
                document.getElementById('ws-area-entregue').style.display = 'block';
                const dataEnt = new Date(res.detalhes.dataEntrega).toLocaleString('pt-BR');
                document.getElementById('ws-tarefa-data-entregue').innerText = `Enviado em: ${dataEnt}`;
                document.getElementById('ws-tarefa-link-entregue').href = res.detalhes.arquivoUrl;
            } else {
                // Ainda não entregou, mostra o campo de Upload
                document.getElementById('ws-area-entrega').style.display = 'block';
            }
        } catch (e) {
            console.error("Erro ao verificar entrega:", e);
            document.getElementById('ws-area-entrega').style.display = 'block'; // Fallback
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