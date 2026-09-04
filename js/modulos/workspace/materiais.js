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
                            <span id="ws-mat-placeholder" style="color: #999; font-size: 14px;">Selecione uma turma, mais de uma ou todas... ⬇️</span>
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
        
        // 🚀 NOVO: Captura as palavras-chave mágicas para a IA
        const tagsInput = document.getElementById('ws-mat-tags');
        const tags = tagsInput ? tagsInput.value.trim() : '';
        
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
        
        const isEdicao = Workspace.Materiais.materialEmEdicao !== null;
        const matAntigo = Workspace.Materiais.materialEmEdicao;

        if (!isEdicao && inputFicheiro.files.length === 0) {
            return Workspace.mostrarAviso("Por favor, selecione um ficheiro para enviar.", "warning");
        }
        
        const btn = document.getElementById('ws-btn-enviar-mat');
        btn.innerText = isEdicao ? "Atualizando... ⏳" : "Enviando arquivo... ⏳"; 
        btn.disabled = true;

        try {
            let fileUrl = isEdicao ? matAntigo.url : '';
            let tipoFicheiro = isEdicao ? matAntigo.tipoFicheiro : '';
            let nomeOriginal = isEdicao ? matAntigo.nomeOriginal : '';

            if (inputFicheiro.files.length > 0) {
                const file = inputFicheiro.files[0];
                const dadosUpload = await Workspace.Upload.enviarFicheiroInteligente(file);
                fileUrl = dadosUpload.url;
                tipoFicheiro = file.type || file.name.split('.').pop() || 'desconhecido';
                nomeOriginal = file.name;
            }

            // 🚀 NOVO: As 'tags' agora viajam dentro do Payload para o servidor!
            const payload = {
                titulo, descricao: desc, tags, destino, destinoNome, 
                url: fileUrl, tipoFicheiro, nomeOriginal,
                escolaId: Workspace.usuario.escolaId,
                autorNome: Workspace.usuario.nome || Workspace.usuario.login
            };

            if (isEdicao) {
                const res = await Workspace.api(`/workspace/materiais/${matAntigo.id}`, 'PUT', payload);
                if (res && res.success) {
                    Workspace.mostrarAviso("Material atualizado com sucesso! 🎉", "success");
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
            
            // LIMPEZA GERAL APÓS SUCESSO
            document.getElementById('ws-mat-titulo').value = ''; 
            document.getElementById('ws-mat-desc').value = ''; 
            if (tagsInput) tagsInput.value = ''; // 🚀 NOVO: Limpa o campo de tags
            document.getElementById('ws-mat-ficheiro').value = '';
            
            const chkGlobalUI = document.getElementById('mat-chk-global');
            if (chkGlobalUI) chkGlobalUI.checked = false;
            document.querySelectorAll('.mat-chk-turma').forEach(chk => { chk.checked = false; chk.disabled = false; });
            if (Workspace.Materiais.atualizarTagsTurmas) Workspace.Materiais.atualizarTagsTurmas();

            Workspace.Materiais.materialEmEdicao = null;
            btn.style.background = ""; 
            
            Workspace.Materiais.renderizarProf();
            
        } catch (e) {
            Workspace.mostrarAviso("Erro ao processar o material.", "error");
        } finally { 
            btn.disabled = false;
            btn.innerText = Workspace.Materiais.materialEmEdicao ? "💾 Guardar Alterações" : "Publicar Material";
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
            // 🚀 O FILTRO ABSOLUTO NA BIBLIOTECA
            if (m.destino === 'global' || (Array.isArray(m.destino) && m.destino.includes('global'))) return true;
            
            let destinosArr = Array.isArray(m.destino) ? m.destino : [m.destino];
            let nomesArr = Array.isArray(m.destinoNome) ? m.destinoNome : [m.destinoNome];
            
            return destinosArr.some((dest, idx) => Workspace.verificarTurma(Workspace.usuario, dest, nomesArr[idx] || ''));
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
        
        document.getElementById('ws-mat-titulo').value = mat.titulo;
        document.getElementById('ws-mat-desc').value = mat.descricao || '';
        
        // 🚀 NOVO: Restaura as tags no input durante a edição
        const tagsInput = document.getElementById('ws-mat-tags');
        if (tagsInput) tagsInput.value = mat.tags || '';
        
        const chkGlobal = document.getElementById('mat-chk-global');
        if (chkGlobal) chkGlobal.checked = false;
        document.querySelectorAll('.mat-chk-turma').forEach(chk => { chk.checked = false; chk.disabled = false; });
        
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
        
        const btn = document.getElementById('ws-btn-enviar-mat');
        if (btn) {
            btn.innerText = "💾 Guardar Alterações";
            btn.style.background = "#f39c12"; 
            btn.style.color = "#fff";
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        Workspace.mostrarAviso("Modo de edição ativado. Altere as informações e clique em Guardar. O anexo é opcional.", "info", 5000);
    },

  // 🚀 O VISUALIZADOR ABSOLUTO E PERFEITO (Apresentação Imersiva e Botão Fechar Garantido)
    abrirVisualizador: (url, tipoFornecido, titulo) => {
        const modalId = 'ws-modal-visualizador-material';
        if(document.getElementById(modalId)) document.getElementById(modalId).remove();

        // 1. 🕵️‍♂️ MÁQUINA DO TEMPO: Recupera a identidade de ficheiros antigos!
        const absoluteUrl = url.startsWith('http') ? url : window.location.origin + url;
        const urlMin = absoluteUrl.toLowerCase();
        
        let tipo = String(tipoFornecido || '').toLowerCase();
        if (!tipo || tipo === 'undefined' || tipo === 'null' || tipo === '') {
            if (urlMin.includes('.pdf')) tipo = 'pdf';
            else if (urlMin.includes('.ppt') || urlMin.includes('.pps')) tipo = 'powerpoint';
            else if (urlMin.includes('.doc')) tipo = 'word';
            else if (urlMin.includes('.xls')) tipo = 'excel';
            else if (urlMin.includes('.mp4')) tipo = 'video/mp4';
            else if (urlMin.includes('.mp3')) tipo = 'audio/mp3';
            else if (urlMin.match(/\.(jpg|jpeg|png|gif|webp)$/)) tipo = 'image';
        }

        const tituloSeguro = Workspace.escapeHTML(titulo || 'Documento do Workspace');
        const urlCodificada = encodeURIComponent(absoluteUrl);
        const isMobile = window.innerWidth <= 900 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

        // 2. 🔍 DETETIVE DE FORMATOS
        const ehPowerPoint = tipo.includes('powerpoint') || tipo.includes('presentation') || tipo.includes('ppt') || tipo.includes('pps') || urlMin.endsWith('.ppt') || urlMin.endsWith('.pptx') || urlMin.endsWith('.pps') || urlMin.endsWith('.ppsx');
        const ehWordExcel = tipo.includes('word') || tipo.includes('document') || tipo.includes('msword') || tipo.includes('xls') || tipo.includes('spreadsheet') || tipo.includes('doc') || urlMin.endsWith('.doc') || urlMin.endsWith('.docx') || urlMin.endsWith('.xls') || urlMin.endsWith('.xlsx');
        const ehPDF = tipo.includes('pdf') || urlMin.endsWith('.pdf');
        
        let conteudoHTML = '';

        // 3. 🎨 RENDERIZADORES NATIVOS PERFEITOS
        if (tipo.includes('video') || tipo.includes('mp4')) {
            conteudoHTML = `<video controls autoplay style="width: 100%; max-height: 100%; border-radius: 12px; outline: none; box-shadow: 0 20px 50px rgba(0,0,0,0.5); background: #000;"><source src="${absoluteUrl}" type="video/mp4">Seu navegador não suporta vídeos.</video>`;
        } 
        else if (tipo.includes('audio')) {
            conteudoHTML = `<div style="background: rgba(255,255,255,0.05); padding: 50px; border-radius: 24px; text-align: center; width: 100%; max-width: 450px; backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 50px rgba(0,0,0,0.3);"><div style="font-size:70px; margin-bottom: 30px; animation: pulse 2s infinite;">🎵</div><audio controls autoplay style="width: 100%; outline: none;"><source src="${absoluteUrl}" type="audio/mpeg"></audio></div>`;
        } 
        else if (tipo.includes('image')) {
            conteudoHTML = `<img src="${absoluteUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.4);">`;
        } 
        else if (ehPDF) {
            if (isMobile) {
                conteudoHTML = `<iframe src="https://docs.google.com/gview?url=${urlCodificada}&embedded=true" width="100%" height="100%" style="border: none; border-radius: 12px; background: white;"></iframe>`;
            } else {
                conteudoHTML = `<iframe src="${absoluteUrl}#toolbar=1" width="100%" height="100%" style="border: none; border-radius: 12px; background: white; box-shadow: 0 20px 50px rgba(0,0,0,0.3);"></iframe>`;
            }
        }
        else if (ehPowerPoint || ehWordExcel) {
            // '&wdAr=1' força o PowerPoint a rodar as animações no Modo de Apresentação de Slides
            const motorMS = ehPowerPoint 
                ? `https://view.officeapps.live.com/op/embed.aspx?src=${urlCodificada}&wdAr=1` 
                : `https://view.officeapps.live.com/op/embed.aspx?src=${urlCodificada}`;
            
            const motorGoogle = `https://docs.google.com/gview?url=${urlCodificada}&embedded=true`;
            
            conteudoHTML = `
            <div style="width: 100%; height: 100%; position: relative; background: #f8fafc; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
                <!-- BARRA DE FERRAMENTAS INTELIGENTE DO DOCUMENTO -->
                <div style="background: #0f172a; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; z-index: 10; flex-shrink: 0;">
                    <div style="color: #94a3b8; font-size: 13px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                        <span style="display:inline-block; width:8px; height:8px; background:#10b981; border-radius:50%; box-shadow: 0 0 10px #10b981; animation: pulse 2s infinite;"></span> Sistema Multi-Nuvem Ativo
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="document.getElementById('ws-iframe-leitor').src='${motorMS}'" style="background: #2563eb; color: white; border: none; padding: 8px 15px; border-radius: 8px; font-size: 12px; font-weight: bold; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#1d4ed8'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='#2563eb'; this.style.transform='translateY(0)'" title="Tentar com o Motor da Microsoft">Motor Microsoft</button>
                        <button onclick="document.getElementById('ws-iframe-leitor').src='${motorGoogle}'" style="background: #ea4335; color: white; border: none; padding: 8px 15px; border-radius: 8px; font-size: 12px; font-weight: bold; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#c0392b'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='#ea4335'; this.style.transform='translateY(0)'" title="Tentar com o Motor da Google">Motor Google</button>
                    </div>
                </div>

                <!-- CARREGAMENTO DE FUNDO ELEGANTE -->
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; text-align: center; z-index: 1;">
                    <div style="font-size: 45px; margin-bottom: 20px; animation: spin 3s linear infinite;">⚙️</div>
                    <h3 style="color:#334155; font-size: 18px; margin-bottom: 10px;">Conectando ao Documento...</h3>
                    <p style="color:#64748b; font-size: 13px; max-width: 400px; line-height: 1.5;">A apresentação interativa está a ser preparada. Aguarde uns instantes.<br><br>Se ocorrer um erro, pode <strong>trocar o motor de leitura</strong> ou transferir o ficheiro no botão de Download.</p>
                </div>

                <!-- O IFRAME DE LEITURA -->
                <iframe id="ws-iframe-leitor" src="${motorMS}" width="100%" height="100%" style="border: none; position: relative; z-index: 2; background: transparent; flex: 1;"></iframe>
            </div>`;
        } 
        else {
            conteudoHTML = `<div style="background: rgba(255,255,255,0.05); padding: 50px; border-radius: 24px; text-align: center; max-width: 450px; margin: auto; box-shadow: 0 20px 50px rgba(0,0,0,0.3); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1);"><div style="font-size:70px; margin-bottom: 25px;">📦</div><h3 style="color:#f8fafc; margin-bottom: 15px; font-size: 20px;">Formato Especial</h3><p style="color:#cbd5e1; margin-bottom: 30px; font-size: 14px; line-height: 1.6;">O sistema não suporta a pré-visualização deste formato específico na web. Por favor, transfira o ficheiro para visualizar com qualidade total.</p><a href="${absoluteUrl}" download class="ws-btn" style="background:#3b82f6; color:white; text-decoration:none; padding:15px 35px; border-radius:30px; font-weight: bold; font-size: 16px; transition: 0.2s; display: inline-block; box-shadow: 0 4px 15px rgba(59,130,246,0.4);" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">📥 Transferir Ficheiro</a></div>`;
        }

        const modal = document.createElement('div');
        modal.id = modalId;
        // z-index colossal para sobrepor qualquer coisa no sistema
        modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(2, 6, 23, 0.95); z-index:2147483647; display:flex; flex-direction:column; backdrop-filter:blur(10px); animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);";
        
        modal.innerHTML = `
            <style>
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
                /* No telemóvel, esconde o texto "Download" para poupar espaço, deixando só o ícone */
                @media (max-width: 600px) { .ws-hide-mobile { display: none !important; } }
            </style>
            
            <!-- 🚀 CABEÇALHO DO LEITOR (Z-INDEX ALTO) -->
            <div style="width: 100%; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; box-sizing: border-box; background: #020617; border-bottom: 1px solid rgba(255,255,255,0.05); flex-shrink: 0; box-shadow: 0 4px 15px rgba(0,0,0,0.8); z-index: 99999;">
                <div style="display: flex; flex-direction: column; max-width: 50%;">
                    <span style="color: #f8fafc; font-weight: 800; font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 20px;">📄</span> ${tituloSeguro}
                    </span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 10px;">
                    <a href="${absoluteUrl}" download target="_blank" style="color: #f8fafc; text-decoration:none; display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: bold; background: rgba(255,255,255,0.1); padding: 8px 15px; border-radius: 20px; transition: 0.2s; border: 1px solid rgba(255,255,255,0.2);" onmouseover="this.style.background='rgba(59, 130, 246, 0.9)'; this.style.borderColor='transparent';" onmouseout="this.style.background='rgba(255,255,255,0.1)'; this.style.borderColor='rgba(255,255,255,0.2)';">
                        <span style="font-size: 16px;">📥</span> <span class="ws-hide-mobile">Download</span>
                    </a>
                    <!-- 🚀 BOTÃO FECHAR BLINDADO (Comando direto na veia 'onclick') -->
                    <button onclick="document.getElementById('${modalId}').remove()" style="background: #e74c3c; color: white; border: none; height: 35px; padding: 0 15px; border-radius: 20px; font-size: 14px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 10px rgba(231, 76, 60, 0.3); transition: 0.2s;" onmouseover="this.style.background='#c0392b'; this.style.transform='scale(1.05)'" onmouseout="this.style.background='#e74c3c'; this.style.transform='scale(1)'">
                        ✖ Fechar
                    </button>
                </div>
            </div>
            
            <!-- ÁREA DE EXIBIÇÃO CENTRAL -->
            <div style="flex: 1; width: 100%; display: flex; justify-content: center; align-items: center; padding: 15px; box-sizing: border-box; overflow: hidden; z-index: 1;">
                <div style="width: 100%; height: 100%; max-width: 1400px; display: flex; flex-direction: column;">
                    ${conteudoHTML}
                </div>
            </div>
        `;
        
        // Mantém o ouvinte de cliques para o fundo escuro, caso consigam clicar fora
        modal.addEventListener('click', (e) => { 
            if (e.target === modal) modal.remove(); 
        });
        document.body.appendChild(modal);
    },

    obterIconePorTipo: (tipo) => {
        if (!tipo) return '📎';
        tipo = tipo.toLowerCase();
        if (tipo.includes('pdf')) return '📕';
        if (tipo.includes('word') || tipo.includes('doc')) return '📘';
        if (tipo.includes('presentation') || tipo.includes('ppt') || tipo.includes('pps')) return '📙';
        if (tipo.includes('video') || tipo.includes('mp4')) return '🎬';
        if (tipo.includes('audio')) return '🎧';
        if (tipo.includes('image')) return '🖼️';
        if (tipo.includes('spreadsheet') || tipo.includes('xls')) return '📗';
        return '📎';
    }
};