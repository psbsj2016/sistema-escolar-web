// js/modulos/workspace/materiais.js
window.Workspace = window.Workspace || {};

Workspace.Materiais = {
    listaMateriais: [],
    materialEmEdicao: null, // 🚀 NOVA VARIÁVEL: Memoriza qual material está a ser editado
    
    init: async () => {
        console.log("📚 Módulo de Materiais das Aulas Iniciado.");
        if (!Workspace.Materiais.limpadorAtivo && typeof Workspace.navegarPara === 'function') {
            const navegacaoOriginal = Workspace.navegarPara;
            Workspace.navegarPara = (tela, historico) => {
                const modalVis = document.getElementById('ws-modal-visualizador-material');
                if (modalVis) modalVis.remove();
                navegacaoOriginal(tela, historico);
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
                // Se já for o nosso container customizado (para caso a função rode duas vezes), procuramos por ele
                const elementoAlvo = document.getElementById('ws-multi-select-container') || select;
                if (!elementoAlvo) return;

                const parent = elementoAlvo.parentNode;
                
                // 🚀 UI PREMIUM: Dropdown Multi-Select com Tags (Design Compacto e Elegante)
                const multiSelectHTML = `
                    <div id="ws-multi-select-container" style="position: relative; width: 100%; margin-bottom: 15px; font-family: sans-serif;">
                        <!-- CAIXA PRINCIPAL (O Falso Select que guarda as Tags) -->
                        <div id="ws-mat-select-header" onclick="document.getElementById('ws-mat-dropdown-list').style.display = document.getElementById('ws-mat-dropdown-list').style.display === 'block' ? 'none' : 'block'" style="min-height: 45px; border: 1px solid #ccc; border-radius: 8px; padding: 8px 12px; background: #fff; cursor: pointer; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; transition: border-color 0.2s;">
                            <span id="ws-mat-placeholder" style="color: #999; font-size: 14px;">Selecione as turmas ou Todas... ⬇️</span>
                        </div>
                        
                        <!-- LISTA SUSPENSA COM CHECKBOXES (Flutuante, não estica a tela) -->
                        <div id="ws-mat-dropdown-list" style="display: none; position: absolute; top: 100%; left: 0; width: 100%; max-height: 220px; overflow-y: auto; background: #fff; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); z-index: 1000; margin-top: 5px; padding: 5px;">
                            <label style="display: flex; align-items: center; gap: 8px; padding: 10px; font-weight: bold; cursor: pointer; border-bottom: 1px dashed #eee; transition: background 0.2s; border-radius: 4px;" onmouseover="this.style.background='#f0f4f8'" onmouseout="this.style.background='transparent'">
                                <input type="checkbox" id="mat-chk-global" value="global" onchange="Workspace.Materiais.toggleTodasTurmas(this)" style="width: 16px; height: 16px; cursor: pointer;"> 🌍 Todas as Turmas
                            </label>
                            
                            <div style="display: flex; flex-direction: column;">
                                ${turmas.map(t => `
                                    <label style="display: flex; align-items: center; gap: 8px; padding: 10px; cursor: pointer; font-size: 14px; color: #444; transition: background 0.2s; border-radius: 4px;" onmouseover="this.style.background='#f0f4f8'" onmouseout="this.style.background='transparent'">
                                        <input type="checkbox" class="mat-chk-turma" value="${t.id}" data-nome="${Workspace.escapeHTML(t.nome)}" onchange="Workspace.Materiais.atualizarTagsTurmas()" style="width: 16px; height: 16px; cursor: pointer;"> 📚 ${Workspace.escapeHTML(t.nome)}
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `;
                
                const divAux = document.createElement('div');
                divAux.innerHTML = multiSelectHTML;
                parent.replaceChild(divAux.firstElementChild, elementoAlvo);

                // 🚀 FECHO INTELIGENTE: Esconde a lista se o professor clicar fora da caixa!
                document.addEventListener('click', (e) => {
                    const container = document.getElementById('ws-multi-select-container');
                    if (container && !container.contains(e.target)) {
                        const dropdown = document.getElementById('ws-mat-dropdown-list');
                        if (dropdown) dropdown.style.display = 'none';
                    }
                });
            }
        } catch(e) {}
    },

    toggleTodasTurmas: (checkboxGlobal) => {
        const checkboxes = document.querySelectorAll('.mat-chk-turma');
        checkboxes.forEach(chk => { chk.checked = checkboxGlobal.checked; });
        Workspace.Materiais.atualizarTagsTurmas();
    },

    // 🚀 A MÁGICA VISUAL: Lê o que foi marcado e desenha as Etiquetas (Tags)
    atualizarTagsTurmas: () => {
        const header = document.getElementById('ws-mat-select-header');
        const chkGlobal = document.getElementById('mat-chk-global');
        const selecionadas = document.querySelectorAll('.mat-chk-turma:checked');
        
        // Limpa a caixa, guardando apenas o texto padrão (escondido ou visível)
        header.innerHTML = '<span id="ws-mat-placeholder" style="color: #999; font-size: 14px; display: none;">Selecione as turmas ou Todas... ⬇️</span>';
        
        if (chkGlobal && chkGlobal.checked) {
            header.innerHTML += `<span style="background: #e8f4f8; color: #3498db; padding: 4px 10px; border-radius: 14px; font-size: 12px; font-weight: bold; border: 1px solid #3498db;">🌍 Todas as Turmas</span>`;
            return;
        }

        if (selecionadas.length === 0) {
            document.getElementById('ws-mat-placeholder').style.display = 'block'; // Mostra texto se vazio
            return;
        }

        selecionadas.forEach(chk => {
            const nome = chk.getAttribute('data-nome');
            // Desenha a etiqueta redondinha e colorida para cada turma
            header.innerHTML += `<span style="background: #f4f6f7; color: #2c3e50; padding: 4px 10px; border-radius: 14px; font-size: 12px; border: 1px solid #ddd; display: flex; align-items: center; gap: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">📚 ${nome}</span>`;
        });
    },

    carregarMateriais: async () => {
        try {
            const endpoint = Workspace.usuario.tipo === 'Aluno' 
                ? `/workspace/materiais?escolaId=${Workspace.usuario.escolaId}&alunoRefId=${Workspace.usuario.id}`
                : `/workspace/materiais?escolaId=${Workspace.usuario.escolaId}`;
            const res = await Workspace.api(endpoint, 'GET');
            if (res && res.success) Workspace.Materiais.listaMateriais = res.materiais;
        } catch(e) {}
    },

  enviarMaterial: async () => {
        const titulo = document.getElementById('ws-mat-titulo').value.trim();
        const desc = document.getElementById('ws-mat-desc').value.trim();
        const inputFicheiro = document.getElementById('ws-mat-ficheiro');
        
        const isGlobal = document.getElementById('mat-chk-global')?.checked;
        let destino = [];
        let destinoNome = [];
        
        if (isGlobal) {
            destino = 'global';
            destinoNome = 'Todas as Turmas';
        } else {
            const selecionados = document.querySelectorAll('.mat-chk-turma:checked');
            selecionados.forEach(chk => {
                destino.push(chk.value);
                destinoNome.push(chk.getAttribute('data-nome'));
            });
            if (destino.length === 0) return Workspace.mostrarAviso("Por favor, selecione pelo menos uma turma ou 'Todas as Turmas'.", "warning");
        }
        
        if (!titulo) return Workspace.mostrarAviso("Por favor, dê um título ao material.", "warning");
        
        // 🚀 VERIFICAÇÃO DE MODO: Estamos a editar?
        const isEdicao = Workspace.Materiais.materialEmEdicao !== null;
        const matAntigo = Workspace.Materiais.materialEmEdicao;

        // Se NÃO é edição, o arquivo é obrigatório. Na edição, ele é opcional (usa o antigo se vazio).
        if (!isEdicao && inputFicheiro.files.length === 0) {
            return Workspace.mostrarAviso("Por favor, selecione um ficheiro para enviar.", "warning");
        }
        
        const btn = document.getElementById('ws-btn-enviar-mat');
        btn.innerText = isEdicao ? "Atualizando... ⏳" : "Enviando arquivo... ⏳"; 
        btn.disabled = true;

        try {
            // Se for edição e não escolheram novo arquivo, mantemos as URLs antigas
            let fileUrl = isEdicao ? matAntigo.url : '';
            let tipoFicheiro = isEdicao ? matAntigo.tipoFicheiro : '';
            let nomeOriginal = isEdicao ? matAntigo.nomeOriginal : '';

            // Se selecionaram um arquivo novo (ou é um material novo), fazemos upload
            if (inputFicheiro.files.length > 0) {
                const file = inputFicheiro.files[0];
                const dadosUpload = await Workspace.Upload.enviarFicheiroInteligente(file);
                fileUrl = dadosUpload.url;
                tipoFicheiro = file.type || file.name.split('.').pop() || 'desconhecido';
                nomeOriginal = file.name;
            }

            const payload = {
                titulo, descricao: desc, destino, destinoNome, 
                url: fileUrl, tipoFicheiro, nomeOriginal,
                escolaId: Workspace.usuario.escolaId,
                autorNome: Workspace.usuario.nome || Workspace.usuario.login
            };

            // 🚀 ROTA DE DECISÃO: POST (Criar) ou PUT (Atualizar)
            if (isEdicao) {
                const res = await Workspace.api(`/workspace/materiais/${matAntigo.id}`, 'PUT', payload);
                if (res && res.success) {
                    Workspace.mostrarAviso("Material atualizado com sucesso! 🎉", "success");
                    // Atualiza o card na tela imediatamente
                    const index = Workspace.Materiais.listaMateriais.findIndex(m => m.id === matAntigo.id);
                    if (index !== -1) Workspace.Materiais.listaMateriais[index] = { ...Workspace.Materiais.listaMateriais[index], ...payload };
                } else throw new Error();
            } else {
                payload.id = 'mat_' + Date.now();
                payload.dataCriacao = new Date().toISOString();
                const res = await Workspace.api('/workspace/materiais', 'POST', payload);
                if (res && res.success) {
                    Workspace.mostrarAviso("Material publicado com sucesso! 🎉", "success");
                    Workspace.Materiais.listaMateriais.unshift(payload); 
                } else throw new Error();
            }
            
            // 🚀 LIMPEZA GERAL APÓS SUCESSO (Criação ou Edição)
            document.getElementById('ws-mat-titulo').value = ''; 
            document.getElementById('ws-mat-desc').value = ''; 
            document.getElementById('ws-mat-ficheiro').value = '';
            
            const chkGlobalUI = document.getElementById('mat-chk-global');
            if (chkGlobalUI) chkGlobalUI.checked = false;
            document.querySelectorAll('.mat-chk-turma').forEach(chk => { chk.checked = false; chk.disabled = false; });
            if (Workspace.Materiais.atualizarTagsTurmas) Workspace.Materiais.atualizarTagsTurmas();

            // Encerra o modo edição e restaura o botão
            Workspace.Materiais.materialEmEdicao = null;
            btn.style.background = ""; // Volta à cor base
            
            Workspace.Materiais.renderizarProf();
            
        } catch (e) {
            Workspace.mostrarAviso("Erro ao processar o material.", "error");
        } finally { 
            // Garante que o texto do botão fica sempre correto e destrancado
            btn.disabled = false;
            if (Workspace.Materiais.materialEmEdicao) {
                btn.innerText = "💾 Guardar Alterações";
            } else {
                btn.innerText = "Publicar Material";
            }
        }
    },

    renderizarProf: (termoBusca = '') => {
        const container = document.getElementById('ws-materiais-lista-prof');
        if (!container) return;

        let filtrados = Workspace.Materiais.listaMateriais;
        if (termoBusca.trim() !== '') {
            const termo = termoBusca.toLowerCase().trim();
            filtrados = filtrados.filter(m => (m.titulo || '').toLowerCase().includes(termo) || (m.destinoNome || '').toLowerCase().includes(termo));
        }

        if (filtrados.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 30px; color: #7f8c8d; background: #f8fafc; border-radius: 8px;">Nenhum material encontrado.</div>';
            return;
        }

        let html = '';
        filtrados.forEach(mat => {
            const icone = Workspace.Materiais.obterIconePorTipo(mat.tipoFicheiro || mat.nomeOriginal);
            const dataFormatada = new Date(mat.dataCriacao).toLocaleDateString('pt-BR');
            
   // 🚀 TRADUTOR DE ARRAYS: Se for uma lista de turmas, junta com vírgulas.
          let nomesDestinoFinal = Array.isArray(mat.destinoNome) ? mat.destinoNome.join(', ') : mat.destinoNome;
          // Se o professor marcou muitas turmas, cortamos o texto para não esticar o design!
         if (nomesDestinoFinal.length > 40) nomesDestinoFinal = nomesDestinoFinal.substring(0, 40) + '...';

         // 🚀 VACINA CONTRA O ERRO DE SINTAXE: Substitui aspas simples para não quebrar o HTML!
            const tituloSeguro = Workspace.escapeHTML(mat.titulo || 'Material').replace(/'/g, "\\'");
            
            html += `
            <div style="background: #fff; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <div style="display: flex; gap: 15px; align-items: center;">
                    <div style="font-size: 30px;">${icone}</div>
                    <div>
                        <h4 style="margin: 0 0 5px 0; color: #2c3e50;">${Workspace.escapeHTML(mat.titulo)}</h4>
                        <div style="font-size: 11px; color: #7f8c8d;">📅 Publicado em: ${dataFormatada} | 👥 ${Workspace.escapeHTML(nomesDestinoFinal)}</div>
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="ws-btn" style="background: #f0f2f5; color: #3498db; border: none; padding: 8px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; cursor: pointer;" onclick="Workspace.Materiais.abrirVisualizador('${mat.url}', '${mat.tipoFicheiro}', '${tituloSeguro}')">👁️ Abrir</button>
                    <button class="ws-btn" style="background: #fff8e1; color: #f39c12; border: none; padding: 8px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; cursor: pointer;" onclick="Workspace.Materiais.prepararEdicao('${mat.id}')">✏️ Editar</button>
                    <button class="ws-btn" style="background: #fdf2f2; color: #e74c3c; border: none; padding: 8px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; cursor: pointer;" onclick="Workspace.Materiais.apagarMaterial('${mat.id}')">🗑️ Apagar</button>
                </div>
            </div>`;
        });
        container.innerHTML = html;
    },

    renderizarAluno: (termoBusca = '') => {
        const container = document.getElementById('ws-materiais-grid-aluno');
        if (!container) return;

       let materiaisPermitidos = Workspace.Materiais.listaMateriais.filter(m => {
            // Se for global em formato String ou Lista, permite a entrada!
            if (m.destino === 'global' || (Array.isArray(m.destino) && m.destino.includes('global'))) return true;
            
            const u = Workspace.usuario;
            let minhasTurmas = [].concat(u.turmas || [], u.turma || [], u.turmaId || []);
            const turmasStr = minhasTurmas.map(t => String(t.id || t).toLowerCase().trim());
            
            // 🚀 O DETETIVE MÚLTIPLO: Se o destino for uma lista (novo formato)
            if (Array.isArray(m.destino)) {
                return m.destino.some(d => turmasStr.includes(String(d).toLowerCase().trim()));
            } else {
                // Mantém retrocompatibilidade com materiais antigos guardados como String
                const destId = String(m.destino).toLowerCase().trim();
                const destNome = String(m.destinoNome || '').toLowerCase().trim();
                return turmasStr.includes(destId) || turmasStr.includes(destNome);
            }
        });

        if (termoBusca.trim() !== '') {
            const termo = termoBusca.toLowerCase().trim();
            materiaisPermitidos = materiaisPermitidos.filter(m => (m.titulo || '').toLowerCase().includes(termo) || (m.descricao || '').toLowerCase().includes(termo));
        }

        if (materiaisPermitidos.length === 0) {
            container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #7f8c8d; background: #f8fafc; border-radius: 8px;">Nenhum material disponível para a sua turma.</div>';
            return;
        }

        let html = '';
        materiaisPermitidos.forEach(mat => {
            const icone = Workspace.Materiais.obterIconePorTipo(mat.tipoFicheiro || mat.nomeOriginal);
            const dataFormatada = new Date(mat.dataCriacao).toLocaleDateString('pt-BR');
            let linkDownload = mat.url.includes('/upload/') ? mat.url.replace('/upload/', '/upload/fl_attachment/') : mat.url;

            // 🚀 VACINA CONTRA O ERRO DE SINTAXE AQUI TAMBÉM!
            const tituloSeguro = Workspace.escapeHTML(mat.titulo || 'Material').replace(/'/g, "\\'");

            html += `
            <div style="background: #fff; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; display: flex; flex-direction: column; box-shadow: 0 4px 6px rgba(0,0,0,0.02); transition: 0.3s;" onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 10px 20px rgba(0,0,0,0.05)'" onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 6px rgba(0,0,0,0.02)'">
                <div style="font-size: 40px; margin-bottom: 15px; text-align: center;">${icone}</div>
                <h4 style="margin: 0 0 10px 0; color: #2c3e50; text-align: center; font-size: 16px;">${Workspace.escapeHTML(mat.titulo)}</h4>
                <p style="font-size: 12px; color: #7f8c8d; text-align: center; margin: 0 0 15px 0; flex: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${Workspace.escapeHTML(mat.descricao || 'Sem descrição.')}</p>
                <div style="font-size: 11px; color: #95a5a6; text-align: center; margin-bottom: 15px;">Compartilhado em ${dataFormatada}</div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button class="ws-btn" style="background: #3498db; color: white; border: none; padding: 10px; border-radius: 20px; font-weight: bold; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px;" onclick="Workspace.Materiais.abrirVisualizador('${mat.url}', '${mat.tipoFicheiro}', '${tituloSeguro}')">👁️ Visualizar Aqui</button>
                    <a href="${linkDownload}" download class="ws-btn" style="background: #f0f2f5; color: #2c3e50; text-decoration: none; padding: 10px; border-radius: 20px; font-weight: bold; display: flex; justify-content: center; align-items: center; gap: 8px;">📥 Fazer Download</a>
                </div>
            </div>`;
        });
        container.innerHTML = html;
    },

    apagarMaterial: (id) => {
        if (Workspace.Avaliacoes && Workspace.Avaliacoes.confirmarDialog) {
            Workspace.Avaliacoes.confirmarDialog("Apagar Material?", "Tem a certeza que deseja remover este material?", "Sim, Apagar", "#e74c3c", async () => {
                try {
                    const res = await Workspace.api(`/workspace/materiais/${id}`, 'DELETE');
                    if (res && res.success) {
                        Workspace.Materiais.listaMateriais = Workspace.Materiais.listaMateriais.filter(m => m.id !== id);
                        Workspace.Materiais.renderizarProf();
                        Workspace.mostrarAviso("Material apagado!", "success");
                    }
                } catch(e) {}
            });
        }
    },

     // 🚀 O ATIVADOR DO MODO DE EDIÇÃO
    prepararEdicao: (id) => {
        const mat = Workspace.Materiais.listaMateriais.find(m => m.id === id);
        if (!mat) return;

        Workspace.Materiais.materialEmEdicao = mat;
        
        // 1. Preenche os textos antigos
        document.getElementById('ws-mat-titulo').value = mat.titulo;
        document.getElementById('ws-mat-desc').value = mat.descricao || '';
        
        // 2. Limpa o painel de turmas e prepara para marcar as antigas
        const chkGlobal = document.getElementById('mat-chk-global');
        if (chkGlobal) chkGlobal.checked = false;
        document.querySelectorAll('.mat-chk-turma').forEach(chk => { chk.checked = false; chk.disabled = false; });
        
        // 3. Marca as turmas que já estavam escolhidas
        if (mat.destino === 'global' || (Array.isArray(mat.destino) && mat.destino.includes('global'))) {
            if (chkGlobal) {
                chkGlobal.checked = true;
                if (Workspace.Materiais.toggleTodasTurmas) Workspace.Materiais.toggleTodasTurmas(chkGlobal);
            }
        } else {
            const destinosArray = Array.isArray(mat.destino) ? mat.destino : [mat.destino];
            destinosArray.forEach(d => {
                const chk = document.querySelector(`.mat-chk-turma[value="${d}"]`);
                if (chk) chk.checked = true;
            });
            if (Workspace.Materiais.atualizarTagsTurmas) Workspace.Materiais.atualizarTagsTurmas();
        }
        
        // 4. Muda a aparência do botão Principal
        const btn = document.getElementById('ws-btn-enviar-mat');
        if (btn) {
            btn.innerText = "💾 Guardar Alterações";
            btn.style.background = "#f39c12"; 
            btn.style.color = "#fff";
        }
        
        // 5. Rola suavemente para o formulário
        window.scrollTo({ top: 0, behavior: 'smooth' });
        Workspace.mostrarAviso("Modo de edição ativado. Altere as informações e clique em Guardar. O anexo é opcional.", "info", 5000);
    },

    // 🚀 O NOVO LEITOR DA MICROSOFT E GOOGLE COM EXPERIÊNCIA DE UX PREMIUM
    abrirVisualizador: (url, tipo, titulo) => {
        const modalId = 'ws-modal-visualizador-material';
        if(document.getElementById(modalId)) document.getElementById(modalId).remove();

        tipo = tipo.toLowerCase();
        let conteudoHTML = '';
        const isMobile = window.innerWidth <= 900 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
        
        // 🚀 O SEGREDO DO LEITOR: O URL deve ser sempre absoluto e codificado
        const absoluteUrl = url.startsWith('http') ? url : window.location.origin + url;
        const urlCodificada = encodeURIComponent(absoluteUrl);

        const ehOffice = tipo.includes('word') || tipo.includes('document') || tipo.includes('msword') || tipo.includes('powerpoint') || tipo.includes('presentation') || tipo.includes('xls') || tipo.includes('spreadsheet') || tipo.includes('ppt') || tipo.includes('doc');
        const ehPDF = tipo.includes('pdf');

        if (tipo.includes('video') || tipo.includes('mp4')) {
            conteudoHTML = `<video controls autoplay style="width: 100%; height: 100%; border-radius: 8px;"><source src="${absoluteUrl}" type="${tipo}">Seu navegador não suporta vídeos diretamente.</video>`;
        } 
        else if (tipo.includes('audio')) {
            conteudoHTML = `<div style="background: white; padding: 40px; border-radius: 12px; text-align: center; width: 100%; max-width: 500px;"><div style="font-size:50px; margin-bottom: 20px;">🎧</div><audio controls autoplay style="width: 100%;"><source src="${absoluteUrl}" type="${tipo}"></audio></div>`;
        } 
        else if (tipo.includes('image')) {
            conteudoHTML = `<img src="${absoluteUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 8px;">`;
        } 
        // 🚀 MICROSOFT VIEWER: Excelente para PowerPoints, Words e Excel
        else if (ehOffice) {
            conteudoHTML = `<div style="width: 100%; height: 100%; -webkit-overflow-scrolling: touch; overflow-y: scroll; background: white; border-radius: 8px;"><iframe src="https://view.officeapps.live.com/op/embed.aspx?src=${urlCodificada}" width="100%" height="100%" style="border: none; display: block;"></iframe></div>`;
        } 
        else if (ehPDF && isMobile) {
            conteudoHTML = `<div style="width: 100%; height: 100%; -webkit-overflow-scrolling: touch; overflow-y: scroll; background: white; border-radius: 8px;"><iframe src="https://docs.google.com/gview?url=${urlCodificada}&embedded=true" width="100%" height="100%" style="border: none; display: block;"></iframe></div>`;
        } 
        else if (ehPDF && !isMobile) {
            conteudoHTML = `<iframe src="${absoluteUrl}" width="100%" height="100%" style="border: none; border-radius: 8px; background: white;"></iframe>`;
        } 
        else {
            conteudoHTML = `<div style="background: white; padding: 40px; border-radius: 12px; text-align: center; max-width: 400px; margin: auto;"><div style="font-size:50px; margin-bottom: 20px;">📎</div><h3 style="color:#2c3e50; margin-bottom: 10px;">Formato Não Reconhecido</h3><p style="color:#7f8c8d; margin-bottom: 25px;">Por favor, faça o download para abrir no seu dispositivo.</p><a href="${absoluteUrl}" download class="ws-btn" style="background:#3498db; color:white; text-decoration:none; padding:12px 30px; border-radius:20px;">📥 Fazer Download</a></div>`;
        }

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:100000; display:flex; flex-direction:column; align-items:center; justify-content:center; backdrop-filter:blur(5px); animation: fadeIn 0.2s;";
        
        // 🚀 O NOVO CABEÇALHO DOURADO (Com botão Download explícito!)
        modal.innerHTML = `
            <div style="width: 100%; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; box-sizing: border-box; background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent); position: absolute; top: 0; left: 0; z-index: 10;">
                <div style="display: flex; flex-direction: column; max-width: 70%;">
                    <span style="color: white; font-weight: bold; font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; text-shadow: 1px 1px 3px rgba(0,0,0,0.8);">📚 ${titulo}</span>
                    <span style="color: #f1c40f; font-size: 11.5px; margin-top: 4px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">⚠️ Se o ficheiro for muito grande para abrir online, clique no botão 📥 ao lado.</span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 15px;">
                    <a href="${absoluteUrl}" download target="_blank" style="color:white; text-decoration:none; font-size:26px; transition:0.2s; margin-right: 10px;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Fazer Download">📥</a>
                    <button id="ws-fechar-visualizador" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 45px; height: 45px; border-radius: 50%; font-size: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; box-shadow: 0 2px 10px rgba(0,0,0,0.5); flex-shrink: 0;" onmouseover="this.style.background='rgba(231, 76, 60, 0.8)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">✖</button>
                </div>
            </div>
            <div style="width: 95vw; height: 85vh; display: flex; justify-content: center; align-items: center; position: relative; margin-top: 50px; pointer-events: none;">
                <div style="width: 100%; height: 100%; pointer-events: auto;">${conteudoHTML}</div>
            </div>
        `;
        
        modal.addEventListener('click', (e) => { if (e.target === modal || e.target.id === 'ws-fechar-visualizador') modal.remove(); });
        document.body.appendChild(modal);
    },

    obterIconePorTipo: (tipo) => {
        if (!tipo) return '📎';
        tipo = tipo.toLowerCase();
        if (tipo.includes('pdf')) return '📕';
        if (tipo.includes('word') || tipo.includes('doc')) return '📘';
        if (tipo.includes('presentation') || tipo.includes('ppt')) return '📙';
        if (tipo.includes('video') || tipo.includes('mp4')) return '🎬';
        if (tipo.includes('audio')) return '🎧';
        if (tipo.includes('image')) return '🖼️';
        if (tipo.includes('spreadsheet') || tipo.includes('xls')) return '📗';
        return '📎';
    }
};