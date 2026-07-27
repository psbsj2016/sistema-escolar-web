window.Workspace = window.Workspace || {};

Workspace.Materiais = {
    listaMateriais: [],
    
    init: async () => {
        console.log("📚 Módulo de Materiais das Aulas Iniciado.");
        
        // 🚀 O AUTO-LIMPADOR: Garante que o visualizador feche se o utilizador navegar para fora!
        if (!Workspace.Materiais.limpadorAtivo && typeof Workspace.navegarPara === 'function') {
            const navegacaoOriginal = Workspace.navegarPara;
            Workspace.navegarPara = (tela, historico) => {
                const modalVis = document.getElementById('ws-modal-visualizador-material');
                if (modalVis) modalVis.remove(); // Destrói o visualizador "zombie"
                navegacaoOriginal(tela, historico); // Continua a viagem normalmente
            };
            Workspace.Materiais.limpadorAtivo = true;
        }
    },

    abrirPainel: async () => {
        Workspace.navegarPara('materiais');
        Workspace.mostrarAviso("Carregando estante de materiais... ⏳", "info", 1500);
        
        await Workspace.Materiais.carregarMateriais();
        
        if (Workspace.usuario.tipo === 'Aluno') {
            document.getElementById('ws-materiais-prof-area').style.display = 'none';
            document.getElementById('ws-materiais-aluno-area').style.display = 'block';
            Workspace.Materiais.renderizarAluno();
        } else {
            document.getElementById('ws-materiais-aluno-area').style.display = 'none';
            document.getElementById('ws-materiais-prof-area').style.display = 'block';
            Workspace.Materiais.carregarTurmasDropdown();
            Workspace.Materiais.renderizarProf();
        }
    },

    carregarTurmasDropdown: async () => {
        try {
            const turmas = await Workspace.api('/turmas', 'GET');
            if (turmas && turmas.length > 0) {
                const select = document.getElementById('ws-mat-destino');
                if (!select) return;
                let options = '<option value="global">🌍 Todas as Turmas</option>';
                turmas.forEach(t => options += `<option value="${t.id}">📚 ${Workspace.escapeHTML(t.nome)}</option>`);
                select.innerHTML = options;
            }
        } catch(e) { console.log("Erro ao carregar turmas", e); }
    },

    carregarMateriais: async () => {
        try {
            const endpoint = Workspace.usuario.tipo === 'Aluno' 
                ? `/workspace/materiais?escolaId=${Workspace.usuario.escolaId}&alunoRefId=${Workspace.usuario.id}`
                : `/workspace/materiais?escolaId=${Workspace.usuario.escolaId}`;
            
            const res = await Workspace.api(endpoint, 'GET');
            if (res && res.success) {
                Workspace.Materiais.listaMateriais = res.materiais;
            }
        } catch(e) {
            console.error("Erro ao carregar materiais", e);
        }
    },

    enviarMaterial: async () => {
        const titulo = document.getElementById('ws-mat-titulo').value.trim();
        const desc = document.getElementById('ws-mat-desc').value.trim();
        const selectDestino = document.getElementById('ws-mat-destino');
        const destino = selectDestino.value;
        const destinoNome = selectDestino.options[selectDestino.selectedIndex].text.replace('📚 ', '').replace('🌍 ', '');
        const inputFicheiro = document.getElementById('ws-mat-ficheiro');
        
        if (!titulo) return Workspace.mostrarAviso("Por favor, dê um título ao material.", "warning");
        if (inputFicheiro.files.length === 0) return Workspace.mostrarAviso("Por favor, selecione um ficheiro para enviar.", "warning");
        
        const file = inputFicheiro.files[0];
        const btn = document.getElementById('ws-btn-enviar-mat');
        const txtOriginal = btn.innerText;
        
        btn.innerText = "Despachando para a turma... ⏳";
        btn.disabled = true;

        try {
            const formData = new FormData();
            formData.append('anexos', file);
            
            const uploadRes = await fetch('/api/workspace/upload', { method: 'POST', credentials: 'include', body: formData });
            const uploadData = await uploadRes.json();
            
            if (!uploadData.success || !uploadData.anexos || uploadData.anexos.length === 0) throw new Error("Falha no upload.");
            
            const urlFicheiro = uploadData.anexos[0].url;
            
            const payload = {
                id: 'mat_' + Date.now(),
                titulo,
                descricao: desc,
                destino,
                destinoNome,
                url: urlFicheiro,
                tipoFicheiro: file.type || file.name.split('.').pop() || 'desconhecido',
                nomeOriginal: file.name,
                escolaId: Workspace.usuario.escolaId,
                autorNome: Workspace.usuario.nome || Workspace.usuario.login,
                dataCriacao: new Date().toISOString()
            };

            const res = await Workspace.api('/workspace/materiais', 'POST', payload);
            
            if (res && res.success) {
                Workspace.mostrarAviso("Material publicado com sucesso! 🎉", "success");
                document.getElementById('ws-mat-titulo').value = '';
                document.getElementById('ws-mat-desc').value = '';
                document.getElementById('ws-mat-ficheiro').value = '';
                Workspace.Materiais.listaMateriais.unshift(payload);
                Workspace.Materiais.renderizarProf();
            } else {
                Workspace.mostrarAviso(res.error || "Erro ao guardar material.", "error");
            }
        } catch (e) {
            Workspace.mostrarAviso("Erro na transferência do ficheiro.", "error");
        } finally {
            btn.innerText = txtOriginal;
            btn.disabled = false;
        }
    },

    renderizarProf: (termoBusca = '') => {
        const container = document.getElementById('ws-materiais-lista-prof');
        if (!container) return;

        let filtrados = Workspace.Materiais.listaMateriais;
        
        if (termoBusca.trim() !== '') {
            const termo = termoBusca.toLowerCase().trim();
            filtrados = filtrados.filter(m => 
                (m.titulo || '').toLowerCase().includes(termo) || 
                (m.destinoNome || '').toLowerCase().includes(termo)
            );
        }

        if (filtrados.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 30px; color: #7f8c8d; background: #f8fafc; border-radius: 8px;">Nenhum material encontrado.</div>';
            return;
        }

        let html = '';
        filtrados.forEach(mat => {
            const icone = Workspace.Materiais.obterIconePorTipo(mat.tipoFicheiro || mat.nomeOriginal);
            const dataFormatada = new Date(mat.dataCriacao).toLocaleDateString('pt-BR');
            
            html += `
            <div style="background: #fff; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <div style="display: flex; gap: 15px; align-items: center;">
                    <div style="font-size: 30px;">${icone}</div>
                    <div>
                        <h4 style="margin: 0 0 5px 0; color: #2c3e50;">${Workspace.escapeHTML(mat.titulo)}</h4>
                        <div style="font-size: 11px; color: #7f8c8d;">
                            📅 Publicado em: ${dataFormatada} | 👥 ${Workspace.escapeHTML(mat.destinoNome)}
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="ws-btn" style="background: #f0f2f5; color: #3498db; border: none; padding: 8px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; cursor: pointer;" onclick="Workspace.Materiais.abrirVisualizador('${mat.url}', '${mat.tipoFicheiro}', '${Workspace.escapeHTML(mat.titulo)}')">👁️ Abrir</button>
                    <button class="ws-btn" style="background: #fdf2f2; color: #e74c3c; border: none; padding: 8px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; cursor: pointer;" onclick="Workspace.Materiais.apagarMaterial('${mat.id}')">🗑️ Apagar</button>
                </div>
            </div>
            `;
        });
        container.innerHTML = html;
    },

    renderizarAluno: (termoBusca = '') => {
        const container = document.getElementById('ws-materiais-grid-aluno');
        if (!container) return;

        let materiaisPermitidos = Workspace.Materiais.listaMateriais.filter(m => {
            if (m.destino === 'global') return true;
            
            const u = Workspace.usuario;
            let minhasTurmas = [];
            if (u.turmas) minhasTurmas = minhasTurmas.concat(u.turmas);
            if (u.turma) minhasTurmas = minhasTurmas.concat(u.turma);
            if (u.turmaId) minhasTurmas = minhasTurmas.concat(u.turmaId);
            
            const turmasStr = minhasTurmas.map(t => String(t.id || t).toLowerCase().trim());
            const destId = String(m.destino).toLowerCase().trim();
            const destNome = String(m.destinoNome || '').toLowerCase().trim();
            
            return turmasStr.includes(destId) || turmasStr.includes(destNome);
        });

        if (termoBusca.trim() !== '') {
            const termo = termoBusca.toLowerCase().trim();
            materiaisPermitidos = materiaisPermitidos.filter(m => 
                (m.titulo || '').toLowerCase().includes(termo) || 
                (m.descricao || '').toLowerCase().includes(termo)
            );
        }

        if (materiaisPermitidos.length === 0) {
            container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #7f8c8d; background: #f8fafc; border-radius: 8px;">Nenhum material disponível para a sua turma.</div>';
            return;
        }

        let html = '';
        materiaisPermitidos.forEach(mat => {
            const icone = Workspace.Materiais.obterIconePorTipo(mat.tipoFicheiro || mat.nomeOriginal);
            const dataFormatada = new Date(mat.dataCriacao).toLocaleDateString('pt-BR');
            
            let linkDownload = mat.url;
            if (linkDownload.includes('/upload/')) {
                linkDownload = linkDownload.replace('/upload/', '/upload/fl_attachment/');
            }

            html += `
            <div style="background: #fff; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; display: flex; flex-direction: column; box-shadow: 0 4px 6px rgba(0,0,0,0.02); transition: 0.3s;" onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 10px 20px rgba(0,0,0,0.05)'" onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 6px rgba(0,0,0,0.02)'">
                <div style="font-size: 40px; margin-bottom: 15px; text-align: center;">${icone}</div>
                <h4 style="margin: 0 0 10px 0; color: #2c3e50; text-align: center; font-size: 16px;">${Workspace.escapeHTML(mat.titulo)}</h4>
                <p style="font-size: 12px; color: #7f8c8d; text-align: center; margin: 0 0 15px 0; flex: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${Workspace.escapeHTML(mat.descricao || 'Sem descrição detalhada.')}</p>
                <div style="font-size: 11px; color: #95a5a6; text-align: center; margin-bottom: 15px;">Compartilhado em ${dataFormatada}</div>
                
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button class="ws-btn" style="background: #3498db; color: white; border: none; padding: 10px; border-radius: 20px; font-weight: bold; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px;" onclick="Workspace.Materiais.abrirVisualizador('${mat.url}', '${mat.tipoFicheiro}', '${Workspace.escapeHTML(mat.titulo)}')">
                        👁️ Visualizar Aqui
                    </button>
                    <a href="${linkDownload}" download class="ws-btn" style="background: #f0f2f5; color: #2c3e50; text-decoration: none; padding: 10px; border-radius: 20px; font-weight: bold; display: flex; justify-content: center; align-items: center; gap: 8px;">
                        📥 Fazer Download
                    </a>
                </div>
            </div>
            `;
        });
        container.innerHTML = html;
    },

    apagarMaterial: (id) => {
        if (Workspace.Avaliacoes && Workspace.Avaliacoes.confirmarDialog) {
            Workspace.Avaliacoes.confirmarDialog("Apagar Material?", "Tem a certeza que deseja remover este material?", "Sim, Apagar", "#e74c3c", async () => {
                Workspace.mostrarAviso("Apagando...", "info");
                try {
                    const res = await Workspace.api(`/workspace/materiais/${id}`, 'DELETE');
                    if (res && res.success) {
                        Workspace.Materiais.listaMateriais = Workspace.Materiais.listaMateriais.filter(m => m.id !== id);
                        Workspace.Materiais.renderizarProf();
                        Workspace.mostrarAviso("Material apagado com sucesso!", "success");
                    }
                } catch(e) { Workspace.mostrarAviso("Erro ao apagar material.", "error"); }
            });
        }
    },

  abrirVisualizador: (url, tipo, titulo) => {
        const modalId = 'ws-modal-visualizador-material';
        if(document.getElementById(modalId)) document.getElementById(modalId).remove();

        tipo = tipo.toLowerCase();
        let conteudoHTML = '';
        
        // 🚀 A INTELIGÊNCIA: Verifica se é um telemóvel ou tablet
        const isMobile = window.innerWidth <= 900 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
        
        if (tipo.includes('video') || tipo.includes('mp4')) {
            conteudoHTML = `<video controls autoplay style="width: 100%; height: 100%; border-radius: 8px;"><source src="${url}" type="${tipo}">Seu navegador não suporta vídeos diretamente.</video>`;
        } 
        else if (tipo.includes('audio')) {
            conteudoHTML = `<div style="background: white; padding: 40px; border-radius: 12px; text-align: center; width: 100%; max-width: 500px;"><div style="font-size:50px; margin-bottom: 20px;">🎧</div><audio controls autoplay style="width: 100%;"><source src="${url}" type="${tipo}"></audio></div>`;
        } 
        else if (tipo.includes('image')) {
            conteudoHTML = `<img src="${url}" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 8px;">`;
        } 
        // 🚀 O MOTOR GOOGLE DOCS: Ativado para arquivos Office E para PDFs quando visto no telemóvel!
        else if (tipo.includes('word') || tipo.includes('document') || tipo.includes('msword') || tipo.includes('powerpoint') || tipo.includes('presentation') || tipo.includes('xls') || tipo.includes('spreadsheet') || tipo.includes('ppt') || tipo.includes('doc') || (tipo.includes('pdf') && isMobile)) {
            const urlCodificada = encodeURIComponent(url);
            // 🛡️ ARMADURA iOS: A div com '-webkit-overflow-scrolling' resolve os bugs de scroll no iPhone
            conteudoHTML = `
                <div style="width: 100%; height: 100%; -webkit-overflow-scrolling: touch; overflow-y: scroll; background: white; border-radius: 8px;">
                    <iframe src="https://docs.google.com/gview?url=${urlCodificada}&embedded=true" width="100%" height="100%" style="border: none; display: block;"></iframe>
                </div>
            `;
        } 
        // 🚀 SE FOR PDF NO COMPUTADOR: Usa o leitor nativo que é mais rápido
        else if (tipo.includes('pdf') && !isMobile) {
            conteudoHTML = `<iframe src="${url}" width="100%" height="100%" style="border: none; border-radius: 8px; background: white;"></iframe>`;
        } 
        else {
            conteudoHTML = `
                <div style="background: white; padding: 40px; border-radius: 12px; text-align: center; max-width: 400px; margin: auto;">
                    <div style="font-size:50px; margin-bottom: 20px;">📎</div>
                    <h3 style="color:#2c3e50; margin-bottom: 10px;">Formato Não Reconhecido</h3>
                    <p style="color:#7f8c8d; margin-bottom: 25px;">Por favor, faça o download para abrir no seu dispositivo.</p>
                    <a href="${url.replace('/upload/', '/upload/fl_attachment/')}" download class="ws-btn" style="background:#3498db; color:white; text-decoration:none; padding:12px 30px; border-radius:20px;">📥 Fazer Download</a>
                </div>
            `;
        }

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:100000; display:flex; flex-direction:column; align-items:center; justify-content:center; backdrop-filter:blur(5px); animation: fadeIn 0.2s;";
        
        modal.innerHTML = `
            <div style="width: 100%; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; box-sizing: border-box; background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent); position: absolute; top: 0; left: 0; z-index: 10;">
                <!-- 🚀 PROTEÇÃO DE TEXTO: Evita que títulos compridos partam o design em ecrãs pequenos -->
                <span style="color: white; font-weight: bold; font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80%;">📚 ${titulo}</span>
                <button id="ws-fechar-visualizador" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 45px; height: 45px; border-radius: 50%; font-size: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; box-shadow: 0 2px 10px rgba(0,0,0,0.5); flex-shrink: 0;" onmouseover="this.style.background='rgba(231, 76, 60, 0.8)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">✖</button>
            </div>
            <div style="width: 95vw; height: 85vh; display: flex; justify-content: center; align-items: center; position: relative; margin-top: 50px; pointer-events: none;">
                <div style="width: 100%; height: 100%; pointer-events: auto;">
                    ${conteudoHTML}
                </div>
            </div>
        `;
        
        // O CLIQUE DE FUGA
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.id === 'ws-fechar-visualizador') {
                modal.remove();
            }
        });

        document.body.appendChild(modal);
    },

    obterIconePorTipo: (tipo) => {
        if (!tipo) return '📎';
        tipo = tipo.toLowerCase();
        if (tipo.includes('pdf')) return '📕';
        if (tipo.includes('word') || tipo.includes('document') || tipo.includes('doc')) return '📘';
        if (tipo.includes('presentation') || tipo.includes('powerpoint') || tipo.includes('ppt')) return '📙';
        if (tipo.includes('video') || tipo.includes('mp4')) return '🎬';
        if (tipo.includes('audio')) return '🎧';
        if (tipo.includes('image')) return '🖼️';
        if (tipo.includes('spreadsheet') || tipo.includes('excel') || tipo.includes('xls')) return '📗';
        return '📎';
    }
};