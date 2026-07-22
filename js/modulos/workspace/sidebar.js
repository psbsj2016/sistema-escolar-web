window.Workspace = window.Workspace || {};

Workspace.Sidebar = {
    turmaIdAberta: null,
    infoTurmaAberta: null, 
    fotoComprimida: null,  
    chatStream: null, 
    tarefasCache: [],
    mensagensRenderizadas: new Set(), 
    
    // 🚀 NOVO: Cofre de textos para copiar e Calendário para organizar datas
    textosMensagens: {}, 
    ultimaDataRenderizada: null,
    
   // ============================================================================
    // 🚀 MOTOR DE DETEÇÃO: PRESSÃO LONGA (MOBILE) E CLIQUE (PC) COM COORDENADAS
    // ============================================================================
    pressTimer: null,
    
    iniciarPressMensagem: (event, msgId) => {
        Workspace.Sidebar.cancelarPressMensagem(); 
        
        // Espia as coordenadas do dedo no ecrã do telemóvel
        const touch = event.touches ? event.touches[0] : event;
        const x = touch.clientX;
        const y = touch.clientY;

        Workspace.Sidebar.pressTimer = setTimeout(() => {
            if (Workspace.Sidebar.modoSelecaoAtivo) Workspace.Sidebar.toggleSelecaoMensagem(msgId);
            else Workspace.Sidebar.mostrarOpcoesMensagem(msgId, x, y);
        }, 500); 
    },
    
    cancelarPressMensagem: () => {
        if (Workspace.Sidebar.pressTimer) clearTimeout(Workspace.Sidebar.pressTimer);
    },
    
    cliqueMensagem: (event, msgId) => {
        if (Workspace.Sidebar.modoSelecaoAtivo) {
            Workspace.Sidebar.toggleSelecaoMensagem(msgId);
            return;
        }
        
        // Espia as coordenadas do Rato no PC
        if (event.pointerType === "mouse" || window.innerWidth > 900 || event.type === 'contextmenu') {
            Workspace.Sidebar.mostrarOpcoesMensagem(msgId, event.clientX, event.clientY);
        }
    },
    
    mostrarOpcoesMensagem: (msgId, x, y) => {
        document.querySelectorAll('.ws-msg-opcoes').forEach(el => el.style.display = 'none');
        
        const menu = document.getElementById(`opcoes-msg-${msgId}`);
        if (menu) {
            menu.style.display = 'flex';
            
            // 🚀 MATEMÁTICA INTELIGENTE: Impede que o menu fuja pela beira do ecrã!
            const larguraMenu = 150; 
            const alturaMenu = 100;
            let posX = x;
            let posY = y;
            
            if (x + larguraMenu > window.innerWidth) posX = window.innerWidth - larguraMenu - 15;
            if (y + alturaMenu > window.innerHeight) posY = window.innerHeight - alturaMenu - 15;
            
            menu.style.left = `${posX}px`;
            menu.style.top = `${posY}px`;
        }
        
        if (navigator.vibrate) navigator.vibrate(50); // Feedback tátil (vibração)
    }, 
    
    isTyping: false,
    typingTimer: null,
    typingUiTimer: null,

    init: async () => {
        console.log("📊 Motor do Menu Lateral com Chat Avançado iniciado.");
        Workspace.Sidebar.initExtraChatTriggers();
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

    // ============================================================================
    // 📥 MOTOR DE DOWNLOAD SEGURO (Ignora bloqueios de nova aba do Cloudinary)
    // ============================================================================
    forcarDownload: async (url, nomeArquivo) => {
        Workspace.mostrarAviso("A preparar a transferência segura... ⏳", "info", 2000);
        try {
            // Vai buscar o ficheiro ao Cloudinary de forma invisível
            const resposta = await fetch(url);
            if (!resposta.ok) throw new Error("Falha na rede");
            
            // Transforma o ficheiro num objeto de memória local (Blob)
            const blob = await resposta.blob();
            const urlLocal = window.URL.createObjectURL(blob);
            
            // Cria um link fantasma, clica nele e destrói-o a seguir
            const linkFantasma = document.createElement('a');
            linkFantasma.style.display = 'none';
            linkFantasma.href = urlLocal;
            linkFantasma.download = nomeArquivo || 'documento_workspace';
            document.body.appendChild(linkFantasma);
            linkFantasma.click();
            
            // Limpa a memória
            window.URL.revokeObjectURL(urlLocal);
            document.body.removeChild(linkFantasma);
        } catch (erro) {
            console.error("Erro no download:", erro);
            Workspace.mostrarAviso("O navegador bloqueou a transferência direta. A abrir separador...", "warning");
            window.open(url, '_blank'); // Plano B de segurança
        }
    },

    carregarTurmas: async () => {
        const container = document.getElementById('ws-lista-turmas-menu');
        if (!container) return;
        container.innerHTML = '<div style="padding:10px; color:#999; font-size:12px; text-align:center;">Atualizando a lista... ⏳</div>';

        try {
            let turmas = await Workspace.api('/turmas', 'GET');
            
            if (!turmas || turmas.error || turmas.length === 0) {
                container.innerHTML = '<div style="padding:10px; color:#e74c3c; font-size:12px; text-align:center;">Nenhuma turma encontrada.</div>';
                return;
            }

            if (Workspace.usuario.tipo === 'Aluno') {
                let minhasTurmas = [];
                const u = Workspace.usuario;
                if (u.turmas) minhasTurmas = minhasTurmas.concat(u.turmas);
                if (u.turma) minhasTurmas = minhasTurmas.concat(u.turma);
                if (u.turmaId) minhasTurmas = minhasTurmas.concat(u.turmaId);
                if (u.turmaNome) minhasTurmas = minhasTurmas.concat(u.turmaNome);
                
                const turmasDoAlunoSeguras = minhasTurmas.filter(t => t).map(t => String(t).toLowerCase().trim());

                if (Workspace.Feed && Workspace.Feed.postsCache) {
                    Workspace.Feed.postsCache.forEach(post => {
                        if (post.destino && post.destino !== 'global') {
                            turmasDoAlunoSeguras.push(String(post.destino).toLowerCase().trim());
                            turmasDoAlunoSeguras.push(String(post.destinoNome).toLowerCase().trim());
                        }
                    });
                }

                turmas = turmas.filter(t => {
                    const idGeral = String(t.id).toLowerCase().trim();
                    const nomeGeral = String(t.nome).toLowerCase().trim();
                    return turmasDoAlunoSeguras.includes(idGeral) || turmasDoAlunoSeguras.includes(nomeGeral);
                });
            }

            if (turmas.length === 0) {
                 container.innerHTML = '<div style="padding:10px; color:#7f8c8d; font-size:12px; text-align:center;">Ainda não está associado a nenhum bate-papo.</div>';
                 return;
            }

            let html = '';
            turmas.forEach(t => {
                const nomeTurma = Workspace.Sidebar.escapeHTML(t.nome);
                let avatarMenu = `<div style="width: 30px; height: 30px; min-width: 30px; border-radius: 50%; background: #8e44ad; color: white; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; flex-shrink: 0;">#</div>`;
                if(t.foto) {
                    // 🚀 Aplicamos a mesma blindagem de fundo branco, centralização absoluta e quebra de cache no menu lateral
                    const cacheBuster = new Date().getTime();
                    const urlLimpa = t.foto.split('?')[0];
                    const urlFinal = `${urlLimpa}?v=${cacheBuster}`;
                    
                    avatarMenu = `<div style="width: 30px; height: 30px; min-width: 30px; border-radius: 50%; overflow: hidden; flex-shrink: 0; border: 1px solid #ddd; background: #ffffff; display: flex; align-items: center; justify-content: center; box-sizing: border-box; padding: 0; margin: 0;"><img src="${urlFinal}" style="width:100% !important; height:100% !important; object-fit:cover !important; object-position:center !important; background-color:#ffffff !important; display:block !important; margin:0 !important; padding:0 !important; border:none !important; border-radius:50% !important;"></div>`;
                }

                html += `
                    <div style="padding: 12px; margin-bottom: 5px; border-radius: 8px; background: #fdfdfd; border: 1px solid #f0f2f5; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s;" onmouseover="this.style.background='#f4f6f7'; this.style.borderColor='#e2e6ea'" onmouseout="this.style.background='#fdfdfd'; this.style.borderColor='#f0f2f5'" onclick="const menu = document.getElementById('ws-main-menu-dropdown'); if(menu) menu.style.display='none'; Workspace.Sidebar.abrirChat('${t.id}', '${nomeTurma}')">
                        ${avatarMenu}
                        <span style="font-size: 13px; color: #2c3e50; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${nomeTurma}</span>
                    </div>
                `;
            });
            container.innerHTML = html;
        } catch (e) {
            container.innerHTML = '<div style="padding:10px; color:#e74c3c; font-size:12px; text-align:center;">Erro ao carregar fóruns.</div>';
        }
    },

  // ============================================================================
    // 🎨 ATUALIZAÇÃO DO CABEÇALHO DO CHAT (BLINDAGEM: CORTE, ESMAGAMENTO E CACHE)
    // ============================================================================
    atualizarCabecalhoChat: (info) => {
        const titulo = document.getElementById('ws-chat-titulo');
        const avatar = document.getElementById('ws-chat-avatar-container');
        
        // 1. Atualiza o título do chat
        if(titulo) titulo.innerText = info.nome || 'Sala de Bate-Papo';
        
        if (avatar) {
            // 🚀 ARMADURA CSS ABSOLUTA: Garante o círculo perfeito e previne achatamento
            avatar.style.flexShrink = '0';
            avatar.style.width = '42px'; // Ligeiramente maior para compensar a borda
            avatar.style.height = '42px';
            avatar.style.minWidth = '42px';
            avatar.style.minHeight = '42px';
            avatar.style.borderRadius = '50%';
            avatar.style.overflow = 'hidden';
            avatar.style.display = 'flex';
            avatar.style.alignItems = 'center';
            avatar.style.justifyContent = 'center';
            avatar.style.padding = '0';
            avatar.style.margin = '0';
            avatar.style.boxSizing = 'border-box';
            avatar.style.background = '#ffffff';
            avatar.style.border = '2px solid #ffffff';
            
            // 2. Verifica se a URL da foto existe e é válida
            if(info.foto && (info.foto.startsWith('http') || info.foto.startsWith('https'))) {
                
                // 🚀 O SEGREDO DO CACHE: Forçamos o navegador a buscar a foto nova, ignorando a antiga!
                const cacheBuster = new Date().getTime();
                const urlLimpa = info.foto.split('?')[0]; // Limpa qualquer código antigo
                const urlFinal = `${urlLimpa}?v=${cacheBuster}`;

                // 🚀 O SEGREDO DO CENTRO: Usamos !important para garantir que nada na página empurra a foto para baixo
                avatar.innerHTML = `<img src="${urlFinal}" style="width:100% !important; height:100% !important; object-fit:cover !important; object-position:center !important; background-color:#ffffff !important; display:block !important; margin:0 !important; padding:0 !important; border:none !important; border-radius:50% !important;" onerror="this.parentElement.innerHTML='👥'; this.parentElement.style.background='rgba(255,255,255,0.2)'; this.parentElement.style.border='1px solid rgba(255,255,255,0.3)';">`;
            } else {
                // 3. Fallback (Sem foto): Desenha o ícone padrão
                avatar.innerHTML = '👥';
                avatar.style.background = 'rgba(255,255,255,0.2)';
                avatar.style.border = '1px solid rgba(255,255,255,0.3)';
            }
        }
    },

verFotoChat: () => {
        const info = Workspace.Sidebar.infoTurmaAberta;
        if(info && info.foto) {
            // 🚀 Redireciona a visualização para a nossa nova janela interna elegante do chat!
            if(Workspace.Sidebar.abrirVisualizadorInterno) {
                Workspace.Sidebar.abrirVisualizadorInterno(info.foto, 'imagem', info.nome);
            }
        } else {
            Workspace.mostrarAviso("Esta grupo ainda não possui uma foto de perfil.", "info");
        }
    },

  // ============================================================================
    // ✏️ ABRIR EDIÇÃO DO CHAT (Com Interface Gráfica Premium e Organizada)
    // ============================================================================
    abrirEdicaoChat: () => {
        const info = Workspace.Sidebar.infoTurmaAberta || {};
        Workspace.Sidebar.fotoComprimida = null; 
        
        const idModal = 'ws-modal-edit-chat';
        if(document.getElementById(idModal)) document.getElementById(idModal).remove();

        const chatBox = document.getElementById('ws-chat-modal');
        if(!chatBox) return;

        if (window.getComputedStyle(chatBox).position === 'static') {
            chatBox.style.position = 'relative';
        }

        const modal = document.createElement('div');
        modal.id = idModal;
        // Fundo escuro confinado à janela do chat
        modal.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:100000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); opacity:0; transition:0.2s; border-radius:inherit; overflow:hidden;";
        
        // 🚀 A ESTRUTURA COMPLETA: Cartão branco central com elementos perfeitamente alinhados
        modal.innerHTML = `
            <div style="width: 90%; max-width: 380px; max-height: 90%; overflow-y: auto; padding: 25px; transform: scale(0.9); transition: 0.2s; position: relative; background: #ffffff; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); box-sizing: border-box; display: flex; flex-direction: column; align-items: center; scrollbar-width: none;">
                
                <button onclick="document.getElementById('${idModal}').style.opacity='0'; setTimeout(()=>document.getElementById('${idModal}').remove(), 200)" style="position:absolute; right:15px; top:15px; background:#f0f2f5; border:none; border-radius:50%; width:30px; height:30px; cursor:pointer; font-weight:bold; color:#555; transition: 0.2s; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.background='#ff7675'; this.style.color='white'" onmouseout="this.style.background='#f0f2f5'; this.style.color='#555'">✕</button>
                
                <h3 style="margin: 0 0 20px 0; color: #2c3e50; text-align: center; font-size: 18px; width: 100%;">Configurações do Grupo</h3>
                
                <div style="text-align: center; margin-bottom: 20px; width: 100%; display: flex; flex-direction: column; align-items: center;">
                    <!-- 🚀 A FOTO DO PERFIL BLINDADA E CENTRALIZADA -->
                    <div style="width: 90px; height: 90px; min-width: 90px; flex-shrink: 0; background: #ffffff; border-radius: 50%; margin: 0 auto 10px auto; overflow: hidden; border: 3px solid #3498db; position: relative; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center;" onclick="document.getElementById('ws-chat-nova-foto').click()">
                        <img id="ws-chat-foto-preview" src="${info.foto || ''}" style="width:100% !important; height:100% !important; object-fit:cover !important; object-position:center !important; display: ${info.foto ? 'block' : 'none'};">
                        <div id="ws-chat-icone-holder" style="display: ${info.foto ? 'none' : 'flex'}; align-items:center; justify-content:center; width:100%; height:100%; font-size:35px; color:#aaa;">👥</div>
                        <div style="position: absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5); color:white; font-size:20px; opacity:0; transition:0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0'">📷</div>
                    </div>
                    <input type="file" id="ws-chat-nova-foto" accept="image/*" style="display:none;" onchange="Workspace.Sidebar.previewFotoChat(event)">
                    <div style="font-size: 11px; color: #7f8c8d; font-weight: bold;">Toque na foto para alterar</div>
                    <div id="ws-alerta-compressao" style="font-size: 10px; color: #27ae60; font-weight: bold; margin-top: 5px; display: none;">Imagem otimizada! 🚀</div>
                </div>

                <div style="width: 100%; text-align: left; margin-bottom: 20px;">
                    <label style="font-size: 12px; font-weight: bold; color: #555; margin-bottom: 5px; display: block;">Nome da Turma / Grupo</label>
                    <input type="text" id="ws-chat-novo-nome" value="${Workspace.Sidebar.escapeHTML(info.nome || '')}" placeholder="Ex: Turma Avançada A" style="width: 100%; padding: 12px; font-weight: bold; color: #333; box-sizing: border-box; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='#3498db'" onblur="this.style.borderColor='#ddd'">
                </div>

                <button id="ws-btn-salvar-chat" style="background:#27ae60; color:white; border:none; width:100%; font-size: 14px; padding: 12px; border-radius:6px; cursor:pointer; font-weight:bold; transition:0.2s;" onmouseover="this.style.background='#219653'" onmouseout="this.style.background='#27ae60'" onclick="Workspace.Sidebar.salvarEdicaoChat()">Salvar Alterações</button>
            </div>
        `;
        
        chatBox.appendChild(modal);

        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            modal.firstElementChild.style.transform = 'scale(1)';
        });
    },

   // 📸 MOTOR DE AVATARES EM ALTA RESOLUÇÃO (Corte Inteligente e Anti-Pixelização)
    previewFotoChat: (e) => {
        const file = e.target.files[0];
        if(!file) return;

        if (file.size > 100 * 1024 * 1024) { 
            Workspace.mostrarAviso("A fotografia ultrapassou o limite máximo de 100MB.", "warning");
            e.target.value = ''; 
            return;
        }

        const imgOriginal = new Image();
        const objectUrl = URL.createObjectURL(file);

        imgOriginal.onload = () => {
            const canvas = document.createElement('canvas');
            
            // 🚀 1. DOBRO DA RESOLUÇÃO: Aumentamos de 400 para 800 para ecrãs HD/Retina
            const MAX_SIZE = 800;
            canvas.width = MAX_SIZE;
            canvas.height = MAX_SIZE;

            const ctx = canvas.getContext('2d');
            
            // 🚀 2. ALTA DEFINIÇÃO: Ativa o suavizador gráfico do navegador
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // 🚀 3. FUNDO BRANCO OBRIGATÓRIO: Previne "espaços vagos" ou falhas pretas em PNGs transparentes
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, MAX_SIZE, MAX_SIZE);
            
            // 🚀 4. MATEMÁTICA DO CORTE CENTRAL PERFEITO (Smart Crop)
            // Identifica se a foto é horizontal ou vertical e corta exatamente o centro quadrado
            const menorLado = Math.min(imgOriginal.width, imgOriginal.height);
            const sourceX = (imgOriginal.width - menorLado) / 2;
            const sourceY = (imgOriginal.height - menorLado) / 2;

            ctx.drawImage(imgOriginal, sourceX, sourceY, menorLado, menorLado, 0, 0, MAX_SIZE, MAX_SIZE);

            // 🚀 5. COMPRESSÃO PREMIUM: Qualidade 0.92 (em vez de 0.85) para máxima nitidez
            canvas.toBlob((blob) => {
                URL.revokeObjectURL(objectUrl); 

                if (!blob || blob.size < 100) {
                    Workspace.mostrarAviso("Falha ao processar a imagem. Tente escolher uma foto diferente.", "error");
                    e.target.value = '';
                    return;
                }

                Workspace.Sidebar.fotoComprimida = blob;

                const imgPreview = document.getElementById('ws-chat-foto-preview');
                const icone = document.getElementById('ws-chat-icone-holder');
                const avisoCompressao = document.getElementById('ws-alerta-compressao');
                
                imgPreview.src = URL.createObjectURL(blob);
                imgPreview.style.display = 'block';
                if(icone) icone.style.display = 'none';
                if(avisoCompressao) avisoCompressao.style.display = 'block';

                e.target.value = ''; 
            }, 'image/jpeg', 0.92); 
        };

        imgOriginal.onerror = () => {
            Workspace.mostrarAviso("Ficheiro de imagem inválido.", "error");
            URL.revokeObjectURL(objectUrl);
            e.target.value = '';
        };

        imgOriginal.src = objectUrl;
    },

    salvarEdicaoChat: async () => {
        const nomeInput = document.getElementById('ws-chat-novo-nome');
        const nome = nomeInput.value.trim();
        const btn = document.getElementById('ws-btn-salvar-chat');
        
        if(!nome) return Workspace.mostrarAviso("O nome do grupo é obrigatório.", "warning");

        const textoOriginal = btn.innerText;
        btn.innerText = "Salvando...⏳";
        btn.disabled = true;

        try {
            let fotoUrl = Workspace.Sidebar.infoTurmaAberta?.foto || null;
            
            if (Workspace.Sidebar.fotoComprimida) {
                const formData = new FormData();
                formData.append('anexos', Workspace.Sidebar.fotoComprimida, 'avatar_otimizado.jpg'); 
                
                const uploadRes = await fetch('/api/workspace/upload', { 
                    method: 'POST', 
                    credentials: 'include', 
                    body: formData 
                });
                
                if (!uploadRes.ok) throw new Error("A ligação com a nuvem falhou.");
                const uploadData = await uploadRes.json();
                
                if(uploadData.success && uploadData.anexos && uploadData.anexos.length > 0) {
                    fotoUrl = uploadData.anexos[0].url;
                    Workspace.Sidebar.fotoComprimida = null; 
                } else {
                    throw new Error("Não foi possível processar a imagem.");
                }
            }

            const res = await Workspace.api(`/workspace/chat/info/${Workspace.Sidebar.turmaIdAberta}`, 'PUT', {
                nome: nome,
                foto: fotoUrl
            });

            if(res && res.success) {
                Workspace.mostrarAviso("Identidade do Grupo atualizada! ✨", "success");
                
                const modal = document.getElementById('ws-modal-edit-chat');
                if(modal) {
                    modal.style.opacity = '0';
                    setTimeout(()=> modal.remove(), 200);
                }
                
                Workspace.Sidebar.infoTurmaAberta = { nome: nome, foto: fotoUrl };
                Workspace.Sidebar.atualizarCabecalhoChat(Workspace.Sidebar.infoTurmaAberta);
                Workspace.Sidebar.carregarTurmas(); 
            } else {
                throw new Error("Ocorreu um erro na Base de Dados.");
            }
        } catch (e) {
            console.error("Erro no salvarEdicaoChat:", e);
            Workspace.mostrarAviso("Erro ao atualizar a foto ou o nome.", "error");
        } finally {
            btn.innerText = textoOriginal;
            btn.disabled = false;
        }
    },

    abrirChat: (turmaId, turmaNome) => {
        Workspace.Sidebar.turmaIdAberta = turmaId;
        
        document.getElementById('ws-chat-titulo').innerText = 'A carregar grupo...';
        document.getElementById('ws-chat-avatar-container').innerHTML = '👥';
        document.getElementById('ws-chat-avatar-container').style.background = 'rgba(255,255,255,0.2)';
        document.getElementById('ws-chat-aluno-nome').innerText = Workspace.usuario.nome || Workspace.usuario.login;
        
        // 🚀 Oculta/Mostra os 3 pontinhos para Gestores/Professores
        const btnMenu = document.getElementById('ws-btn-opcoes-chat');
        if(btnMenu) {
            btnMenu.style.display = (Workspace.usuario.tipo === 'Professor' || Workspace.usuario.tipo === 'Gestor') ? 'inline-block' : 'none';
        }

        Workspace.api(`/workspace/chat/info/${turmaId}`, 'GET').then(info => {
            if(info) {
                Workspace.Sidebar.infoTurmaAberta = info;
                Workspace.Sidebar.atualizarCabecalhoChat(info);
            }
        }).catch(() => {
            document.getElementById('ws-chat-titulo').innerText = turmaNome;
        });

        // 🚀 Injeta a animação "piscarSuave" para não alterar o tamanho da caixa
        if (!document.getElementById('ws-chat-typing-indicator')) {
            const inputContainer = document.getElementById('ws-chat-input').closest('div[style*="padding: 10px"]');
            inputContainer.insertAdjacentHTML('beforebegin', `
                <style>@keyframes piscarSuave { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }</style>
                <div id="ws-chat-typing-indicator" style="display:none; padding: 4px 20px 8px 20px; font-size: 11.5px; color: #128c7e; font-style: italic; font-weight: 600; background: #e5ddd5; animation: piscarSuave 1.5s infinite ease-in-out;"></div>
            `);
        }
        
        document.getElementById('ws-chat-modal').style.display = 'flex';
        
        const inputElement = document.getElementById('ws-chat-input');
        inputElement.value = '';
        setTimeout(() => inputElement.focus(), 100);

        inputElement.oninput = () => {
            if (!Workspace.Sidebar.isTyping) {
                Workspace.Sidebar.isTyping = true;
                Workspace.Sidebar.enviarStatusDigitacao(true);
            }
            clearTimeout(Workspace.Sidebar.typingTimer);
            Workspace.Sidebar.typingTimer = setTimeout(() => {
                Workspace.Sidebar.isTyping = false;
                Workspace.Sidebar.enviarStatusDigitacao(false);
            }, 1500); 
        };

        Workspace.Sidebar.carregarMensagensChat();

        if (Workspace.Sidebar.chatStream) Workspace.Sidebar.chatStream.close();
        
        const escolaId = Workspace.usuario.escolaId || 'DEFAULT';
        Workspace.Sidebar.chatStream = new EventSource(`/api/workspace/stream?escolaId=${escolaId}`);
        
        Workspace.Sidebar.chatStream.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'NOVA_MENSAGEM' && data.turmaId === Workspace.Sidebar.turmaIdAberta) {
                Workspace.Sidebar.injetarNovaMensagem(data.mensagem);
                Workspace.Sidebar.ocultarDigitando();
            }
            
            // 🚀 O VIGILANTE SILENCIOSO DO CHAT: Destruição imediata e fulminante
            if (data.type === 'MSG_APAGADA') {
                const elMsg = document.getElementById(`msg-${data.mensagemId}`);
                if (elMsg) {
                    elMsg.remove();
                    Workspace.Sidebar.mensagensRenderizadas.delete(data.mensagemId);
                }
            }

            // 🚀 O VIGILANTE: Destruição em massa no ecrã
            else if (data.type === 'MSG_APAGADA_MASSA') {
                if (data.mensagensIds && Array.isArray(data.mensagensIds)) {
                    data.mensagensIds.forEach(idApagar => {
                        const elMsg = document.getElementById(`msg-${idApagar}`);
                        if (elMsg) elMsg.remove();
                        Workspace.Sidebar.mensagensRenderizadas.delete(idApagar);
                    });
                }
            }

            if (data.type === 'DIGITANDO' && data.turmaId === Workspace.Sidebar.turmaIdAberta) {
                const meuNome = Workspace.usuario.nome || Workspace.usuario.login;
                if (data.autorNome !== meuNome) {
                    Workspace.Sidebar.mostrarDigitando(data.autorNome, data.isTyping);
                }
            }

            if (data.type === 'SALA_UPDATE' && data.turmaId === Workspace.Sidebar.turmaIdAberta) {
                Workspace.api(`/workspace/chat/info/${Workspace.Sidebar.turmaIdAberta}`, 'GET').then(info => {
                    if(info) {
                        Workspace.Sidebar.infoTurmaAberta = info;
                        Workspace.Sidebar.atualizarCabecalhoChat(info);
                        Workspace.Sidebar.carregarTurmas(); 
                    }
                });
            }
        };
    },

   fecharChat: () => {
        Workspace.Sidebar.cancelarSelecao();
        document.getElementById('ws-chat-modal').style.display = 'none';
        Workspace.Sidebar.turmaIdAberta = null;
        Workspace.Sidebar.infoTurmaAberta = null;
        
        // 🚀 Limpeza de Memória Segura
        Workspace.Sidebar.textosMensagens = {};
        Workspace.Sidebar.ultimaDataRenderizada = null;
        
        if (Workspace.Sidebar.chatStream) {
            Workspace.Sidebar.chatStream.close();
            Workspace.Sidebar.chatStream = null;
        }
        
        Workspace.Sidebar.ocultarDigitando();
    },

    enviarStatusDigitacao: (status) => {
        if (!Workspace.Sidebar.turmaIdAberta) return;
        Workspace.api(`/workspace/chat/${Workspace.Sidebar.turmaIdAberta}/digitando`, 'POST', {
            autorNome: Workspace.usuario.nome || Workspace.usuario.login,
            isTyping: status
        }).catch(()=>{}); 
    },

    mostrarDigitando: (autorNome, isTyping) => {
        const indicator = document.getElementById('ws-chat-typing-indicator');
        if (!indicator) return;

        if (isTyping) {
            indicator.innerText = `${Workspace.Sidebar.escapeHTML(autorNome)} está a escrever...`;
            indicator.style.display = 'block';
            
            clearTimeout(Workspace.Sidebar.typingUiTimer);
            Workspace.Sidebar.typingUiTimer = setTimeout(() => {
                indicator.style.display = 'none';
            }, 3000);
        } else {
            indicator.style.display = 'none';
        }
    },

    ocultarDigitando: () => {
        const indicator = document.getElementById('ws-chat-typing-indicator');
        if (indicator) indicator.style.display = 'none';
    },

    // ============================================================================
    // 📋 FERRAMENTAS DO BATE-PAPO: COPIAR E DIVISORES DE DATA
    // ============================================================================
    copiarTextoMensagem: (msgId) => {
        const texto = Workspace.Sidebar.textosMensagens[msgId];
        if (texto) {
            navigator.clipboard.writeText(texto).then(() => {
                if (window.Workspace && Workspace.mostrarAviso) {
                    Workspace.mostrarAviso("Mensagem copiada! 📋", "success");
                }
            }).catch(() => Workspace.mostrarAviso("Erro ao copiar.", "error"));
        }
        // Esconde o menu após copiar
        document.querySelectorAll('.ws-msg-opcoes').forEach(el => el.style.display = 'none');
    },

    gerarHTMLDataDivisor: (dataString) => {
        const dataPost = new Date(dataString);
        const hoje = new Date();
        const ontem = new Date();
        ontem.setDate(hoje.getDate() - 1);

        let textoData = dataPost.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
        
        if (dataPost.toDateString() === hoje.toDateString()) {
            textoData = 'Hoje';
        } else if (dataPost.toDateString() === ontem.toDateString()) {
            textoData = 'Ontem';
        }

        return `
            <div style="display: flex; justify-content: center; margin: 20px 0 10px 0; width: 100%;">
                <div style="background: rgba(0,0,0,0.06); color: #54656f; padding: 6px 14px; border-radius: 12px; font-size: 11px; font-weight: bold; text-transform: uppercase; box-shadow: 0 1px 2px rgba(0,0,0,0.02); pointer-events: none;">
                    ${textoData}
                </div>
            </div>
        `;
    },

// 🚀 O MOTOR DE DESENHO DOS BALÕES E AVATARS
    gerarHTMLMensagem: (m, meuNome) => {
        // 🚀 GUARDA O TEXTO PURO NO COFRE PARA A FUNÇÃO DE COPIAR
        if (m.texto) Workspace.Sidebar.textosMensagens[m.id] = m.texto;

        const ehMinha = m.autorNome === meuNome;
        const alinhamento = ehMinha ? 'flex-end' : 'flex-start';
        const backgroundBalao = ehMinha ? '#dcf8c6' : '#ffffff';
        const borderRadiusFix = ehMinha ? 'border-top-right-radius: 2px;' : 'border-top-left-radius: 2px;';
        const hora = new Date(m.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const avatarChat = window.Workspace.renderizarAvatar(m.autorNome, 32);
        
        const podeApagar = ehMinha || Workspace.usuario.tipo === 'Professor' || Workspace.usuario.tipo === 'Gestor';

        const avatarHtml = `<div style="margin: 0 8px; flex-shrink: 0; align-self: flex-end;">${avatarChat}</div>`;

        let anexoHtml = '';
        if (m.anexoUrl) {
            if (m.anexoTipo === 'image') {
                anexoHtml = `<img src="${m.anexoUrl}" style="max-width: 100%; max-height: 250px; border-radius: 8px; margin-bottom: 5px; cursor: pointer; object-fit: cover; border: 1px solid rgba(0,0,0,0.1);" onclick="Workspace.Sidebar.abrirVisualizadorInterno('${m.anexoUrl}', 'imagem', 'Imagem Partilhada')">`;
            } else if (m.anexoTipo === 'video') {
                anexoHtml = `<video src="${m.anexoUrl}" controls style="max-width: 100%; max-height: 250px; border-radius: 8px; margin-bottom: 5px; border: 1px solid rgba(0,0,0,0.1);"></video>`;
            } else {
                const nomeSeguro = m.anexoNome ? Workspace.Sidebar.escapeHTML(m.anexoNome) : 'Documento Anexado';
                anexoHtml = `
                <div onclick="Workspace.Sidebar.abrirVisualizadorInterno('${m.anexoUrl}', 'documento', '${nomeSeguro}')" style="display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.05); padding: 10px; border-radius: 8px; cursor: pointer; color: inherit; margin-bottom: 5px; transition: background 0.2s;" onmouseover="this.style.background='rgba(0,0,0,0.1)'" onmouseout="this.style.background='rgba(0,0,0,0.05)'">
                    <span style="font-size: 24px;">📄</span>
                    <span style="font-size: 13px; font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px;" title="${nomeSeguro}">${nomeSeguro}</span>
                </div>`;
            }
        }

        const textoFormatado = m.texto ? `<div style="margin-top: 2px;">${Workspace.Sidebar.escapeHTML(m.texto).replace(/\n/g, '<br>')}</div>` : '';
        const nomeHtml = !ehMinha ? `<div style="font-size: 11px; font-weight: bold; color: #3498db; margin-bottom: 3px;">${Workspace.Sidebar.escapeHTML(m.autorNome)}</div>` : '';
        
        // 🚀 O MENU FLUTUANTE (Agora com a Opção COPIAR acima do Selecionar)
        const menuOpcoes = podeApagar ? `
            <div id="opcoes-msg-${m.id}" class="ws-msg-opcoes" style="display: none; position: fixed; background: white; border-radius: 8px; box-shadow: 0 5px 25px rgba(0,0,0,0.3); padding: 4px; z-index: 100005; border: 1px solid #eee; flex-direction: column; gap: 2px; min-width: 140px;">
                ${m.texto ? `<button onclick="event.stopPropagation(); Workspace.Sidebar.copiarTextoMensagem('${m.id}')" style="background: transparent; border: none; color: #2c3e50; font-size: 13px; font-weight: bold; cursor: pointer; padding: 10px 15px; white-space: nowrap; display: flex; align-items: center; gap: 8px; border-radius: 6px; text-align: left;" onmouseover="this.style.background='#f0f2f5'" onmouseout="this.style.background='transparent'"><span style="font-size:16px;">📋</span> Copiar</button>` : ''}
                <button onclick="event.stopPropagation(); Workspace.Sidebar.ativarModoSelecao('${m.id}')" style="background: transparent; border: none; color: #2980b9; font-size: 13px; font-weight: bold; cursor: pointer; padding: 10px 15px; white-space: nowrap; display: flex; align-items: center; gap: 8px; border-radius: 6px; text-align: left;" onmouseover="this.style.background='#ebf5fb'" onmouseout="this.style.background='transparent'"><span style="font-size:16px;">☑️</span> Selecionar</button>
                <div style="height: 1px; background: #eee; width: 100%;"></div>
                <button onclick="event.stopPropagation(); Workspace.Sidebar.apagarMensagemIndividual('${m.id}')" style="background: transparent; border: none; color: #e74c3c; font-size: 13px; font-weight: bold; cursor: pointer; padding: 10px 15px; white-space: nowrap; display: flex; align-items: center; gap: 8px; border-radius: 6px; text-align: left;" onmouseover="this.style.background='#fdf2f2'" onmouseout="this.style.background='transparent'"><span style="font-size:16px;">🗑️</span> Apagar</button>
            </div>
        ` : '';

        const balaoStyle = `position: relative; display: flex; flex-direction: column; max-width: 85%; width: fit-content; padding: 8px 12px; border-radius: 12px; ${borderRadiusFix} background: ${backgroundBalao}; color: #2c3e50; font-size: 14px; line-height: 1.4; word-break: break-word; box-shadow: 0 1px 2px rgba(0,0,0,0.1); cursor: ${podeApagar ? 'pointer' : 'default'}; -webkit-user-select: none; user-select: none;`;
        
        const eventosInteracao = podeApagar ? `onclick="Workspace.Sidebar.cliqueMensagem(event, '${m.id}')" ontouchstart="Workspace.Sidebar.iniciarPressMensagem(event, '${m.id}')" ontouchend="Workspace.Sidebar.cancelarPressMensagem()" ontouchmove="Workspace.Sidebar.cancelarPressMensagem()" oncontextmenu="event.preventDefault(); Workspace.Sidebar.mostrarOpcoesMensagem('${m.id}', event.clientX, event.clientY); return false;"` : '';

        let layoutMsg = ehMinha ? 
            `<div style="${balaoStyle}" ${eventosInteracao}>${menuOpcoes}${anexoHtml}${textoFormatado}<div style="font-size: 10px; opacity: 0.6; text-align: right; margin-top: 4px; margin-bottom: -4px;">${hora}</div></div>${avatarHtml}` : 
            `${avatarHtml}<div style="${balaoStyle}" ${eventosInteracao}>${menuOpcoes}${nomeHtml}${anexoHtml}${textoFormatado}<div style="font-size: 10px; opacity: 0.6; text-align: right; margin-top: 4px; margin-bottom: -4px;">${hora}</div></div>`;

        return `<div id="msg-${m.id}" style="display: flex; width: 100%; margin-bottom: 12px; justify-content: ${alinhamento}; animation: fadeIn 0.3s ease;">${layoutMsg}</div>`;
    },

    // ============================================================================
    // 📖 VISUALIZADOR IN-CHAT (ABRE PRESO DENTRO DO BATE-PAPO)
    // ============================================================================
    abrirVisualizadorInterno: (url, tipo, nome = 'Anexo') => {
        const idModal = 'ws-chat-inner-viewer';
        const chatBox = document.getElementById('ws-chat-modal');
        if(!chatBox) return;

        // Limpa o antigo se o utilizador clicar noutro documento rápido
        if(document.getElementById(idModal)) document.getElementById(idModal).remove();

        // 🚀 O SEGREDO: Transforma a janela do chat numa "âncora" para o visualizador não escapar!
        if (window.getComputedStyle(chatBox).position === 'static') {
            chatBox.style.position = 'relative';
        }

        const isMobile = window.innerWidth <= 900 || /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
        let contentHtml = '';

        if (tipo === 'imagem') {
            // Layout para Imagens
            contentHtml = `<div style="flex:1; display:flex; align-items:center; justify-content:center; padding:15px; overflow:hidden;"><img src="${url}" style="max-width:100%; max-height:100%; object-fit:contain; border-radius:8px; box-shadow:0 10px 30px rgba(0,0,0,0.5); transform:scale(0.95); transition:0.3s;" id="ws-inner-img"></div>`;
        } else {
            // Layout para Documentos (PDF, Word, Excel, etc.)
            const urlLower = url.toLowerCase();
            const ehOffice = urlLower.endsWith('.doc') || urlLower.endsWith('.docx') || urlLower.endsWith('.xls') || urlLower.endsWith('.xlsx') || urlLower.endsWith('.ppt') || urlLower.endsWith('.pptx');
            const ehPDF = urlLower.endsWith('.pdf');

            let iframeSrc = url; 
            if (ehOffice) iframeSrc = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
            else if (ehPDF && isMobile) iframeSrc = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

            if (ehOffice || ehPDF) {
                contentHtml = `<div style="flex:1; width:100%; background:#f0f2f5; -webkit-overflow-scrolling:touch; overflow:auto;"><iframe src="${iframeSrc}" style="width:100%; height:100%; border:none; background:white;"></iframe></div>`;
            } else {
                contentHtml = `
                <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:20px;">
                    <span style="font-size:60px; margin-bottom:15px;">📁</span>
                    <p style="font-size: 16px; font-weight: bold; color: white;">Pré-visualização indisponível.</p>
                    <a href="${url}" download target="_blank" style="margin-top:15px; background:#3498db; color:white; padding:12px 25px; border-radius:8px; text-decoration:none; font-weight:bold;">📥 Baixar Ficheiro</a>
                </div>`;
            }
        }

        const overlay = document.createElement('div');
        overlay.id = idModal;
        // position: absolute fá-lo preencher APENAS a caixa do Bate-papo!
        overlay.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.92); z-index:100000; display:flex; flex-direction:column; border-radius:inherit; backdrop-filter:blur(5px); opacity:0; transition:0.3s ease-in-out; overflow:hidden;";

        overlay.innerHTML = `
            <div style="width: 100%; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.5); border-bottom: 1px solid rgba(255,255,255,0.1); box-sizing: border-box; flex-shrink: 0; z-index:10;">
                <div style="font-weight: 600; font-size: 14px; color:white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 70%;">
                    ${tipo === 'imagem' ? '🖼️' : '📄'} ${Workspace.Sidebar.escapeHTML(nome)}
                </div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <button onclick="Workspace.Sidebar.forcarDownload('${url}', '${Workspace.Sidebar.escapeHTML(nome)}')" style="background:transparent; border:none; color:white; font-size:24px; cursor:pointer; font-weight:bold; padding:0; line-height:1; transition:0.2s;" onmouseover="this.style.color='#3498db'" onmouseout="this.style.color='white'" title="Transferir para o aparelho">📥</button>
                    <button onclick="document.getElementById('${idModal}').style.opacity='0'; setTimeout(()=>document.getElementById('${idModal}').remove(), 300)" style="background:transparent; border:none; color:white; font-size:24px; cursor:pointer; font-weight:bold; padding:0; line-height:1;" title="Fechar">✖</button>
                </div>
            </div>
            ${contentHtml}
        `;

        // Injentamos diretamente DENTRO da caixa de Bate-papo
        chatBox.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            const img = document.getElementById('ws-inner-img');
            if (img) img.style.transform = 'scale(1)';
        });
    },

  // 🚀 RESTAURO: Injetar Nova Mensagem com Validador de Datas
    injetarNovaMensagem: (m) => {
        if (Workspace.Sidebar.mensagensRenderizadas.has(m.id)) return; 
        Workspace.Sidebar.mensagensRenderizadas.add(m.id);

        const container = document.getElementById('ws-chat-mensagens');
        const meuNome = Workspace.usuario.nome || Workspace.usuario.login;
        
        if (container.innerHTML.includes('Nenhuma mensagem')) {
            container.innerHTML = '';
        }

        // 🚀 VERIFICAÇÃO DO DIA (Para Inserir o Separador)
        const dataStr = new Date(m.data).toLocaleDateString('pt-BR');
        let divisorHtml = '';
        if (Workspace.Sidebar.ultimaDataRenderizada !== dataStr) {
            divisorHtml = Workspace.Sidebar.gerarHTMLDataDivisor(m.data);
            Workspace.Sidebar.ultimaDataRenderizada = dataStr;
        }

        container.insertAdjacentHTML('beforeend', divisorHtml + Workspace.Sidebar.gerarHTMLMensagem(m, meuNome));
        container.scrollTop = container.scrollHeight;
    },

    // 🚀 RESTAURO: Carregar as Mensagens organizando por dias
    carregarMensagensChat: async () => {
        if (!Workspace.Sidebar.turmaIdAberta) return;
        const container = document.getElementById('ws-chat-mensagens');
        
        try {
            const mensagens = await Workspace.api(`/workspace/chat/${Workspace.Sidebar.turmaIdAberta}`, 'GET');
            
            if (!mensagens || mensagens.length === 0) {
                container.innerHTML = `<div style="text-align:center; padding:30px; color:#7f8c8d; font-size:13px;">Nenhuma mensagem neste bate-papo.<br>Diga olá para a turma! 👋</div>`;
                return;
            }

            const meuNome = Workspace.usuario.nome || Workspace.usuario.login;
            let html = '';
            
            // Limpa as memórias ao recarregar a sala
            Workspace.Sidebar.mensagensRenderizadas.clear();
            Workspace.Sidebar.textosMensagens = {};
            Workspace.Sidebar.ultimaDataRenderizada = null;

            mensagens.forEach(m => {
                Workspace.Sidebar.mensagensRenderizadas.add(m.id);
                
                // 🚀 LÓGICA DO SEPARADOR DE DATA
                const dataStr = new Date(m.data).toLocaleDateString('pt-BR');
                if (Workspace.Sidebar.ultimaDataRenderizada !== dataStr) {
                    html += Workspace.Sidebar.gerarHTMLDataDivisor(m.data);
                    Workspace.Sidebar.ultimaDataRenderizada = dataStr;
                }
                
                html += Workspace.Sidebar.gerarHTMLMensagem(m, meuNome);
            });

            container.innerHTML = html;
            container.scrollTop = container.scrollHeight;
            
        } catch (e) { console.error("Erro ao carregar chat", e); }
    },

    // 🚀 RESTAURO: O envio de mensagens de texto que foi apagado acidentalmente
    enviarMensagemChat: async () => {
        const input = document.getElementById('ws-chat-input');
        const texto = input.value.trim();
        const turmaId = Workspace.Sidebar.turmaIdAberta;
        
        if (!texto || !turmaId) return;
        
        input.value = ''; 
        input.style.height = 'auto'; // Repõe o tamanho do input
        Workspace.Sidebar.isTyping = false;
        Workspace.Sidebar.enviarStatusDigitacao(false);
        clearTimeout(Workspace.Sidebar.typingTimer);

        try {
            const res = await Workspace.api(`/workspace/chat/${turmaId}`, 'POST', { 
                texto: texto, 
                autorNome: Workspace.usuario.nome || Workspace.usuario.login 
            });
            
            if (res && res.success && res.mensagem) {
                Workspace.Sidebar.injetarNovaMensagem(res.mensagem);
            }
        } catch (e) { 
            Workspace.mostrarAviso("Erro ao enviar mensagem.", "error"); 
        }
    },

    // 🚀 LÓGICA DE ENVIO DE ANEXOS 📎 (ATUALIZADA COM O NOME REAL DO FICHEIRO)
    enviarAnexoChat: async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            Workspace.mostrarAviso("O ficheiro é demasiado grande (Máx: 10MB).", "warning");
            event.target.value = '';
            return;
        }

        Workspace.mostrarAviso("Carregando o arquivo... ⏳", "info", 5000);
        
        try {
            const formData = new FormData();
            formData.append('anexos', file);
            
            const uploadRes = await fetch('/api/workspace/upload', { method: 'POST', credentials: 'include', body: formData });
            const uploadData = await uploadRes.json();
            
            if (!uploadData.success || !uploadData.anexos) throw new Error("Falha no processamento da nuvem.");
            
            // Lemos as propriedades do ficheiro que subiu
            const anexoUrl = uploadData.anexos[0].url;
            const anexoNome = file.name; // NOVIDADE: Pegamos o nome real do Word/PDF/Excel
            const tipoRaw = file.type.split('/')[0];
            const anexoTipo = (tipoRaw === 'image' || tipoRaw === 'video') ? tipoRaw : 'document';
            
            // Enviamos para o nosso backend (que agora já sabe gravar isto)
            const res = await Workspace.api(`/workspace/chat/${Workspace.Sidebar.turmaIdAberta}`, 'POST', {
                texto: '', 
                anexoUrl: anexoUrl,
                anexoTipo: anexoTipo,
                anexoNome: anexoNome, // Enviamos o nome
                escolaId: Workspace.usuario.escolaId,
                autorNome: Workspace.usuario.nome || Workspace.usuario.login
            });

            if (res && res.success) {
                Workspace.Sidebar.carregarMensagensChat(); 
            } else {
                Workspace.mostrarAviso("Erro ao partilhar anexo no chat.", "error");
            }
        } catch (e) {
            console.error("🚨 Erro:", e);
            Workspace.mostrarAviso("Falha de comunicação com o servidor.", "error");
        } finally {
            event.target.value = ''; 
        }
    },
 
    // ============================================================================
    // 🚀 MOTOR DE SELEÇÃO EM MASSA
    // ============================================================================
    modoSelecaoAtivo: false,
    mensagensSelecionadas: new Set(),

    ativarModoSelecao: (msgId) => {
        Workspace.Sidebar.modoSelecaoAtivo = true;
        // Esconde os menuzinhos flutuantes
        document.querySelectorAll('.ws-msg-opcoes').forEach(el => el.style.display = 'none');
        Workspace.Sidebar.toggleSelecaoMensagem(msgId);
    },

    toggleSelecaoMensagem: (msgId) => {
        const elMsg = document.getElementById(`msg-${msgId}`);
        if (!elMsg) return;

        const balao = elMsg.querySelector('div[style*="max-width: 85%"]');

        if (Workspace.Sidebar.mensagensSelecionadas.has(msgId)) {
            // Retira do cesto e remove o destaque
            Workspace.Sidebar.mensagensSelecionadas.delete(msgId);
            if (balao) balao.style.outline = 'none';
        } else {
            // Põe no cesto e adiciona um destaque visual azul
            Workspace.Sidebar.mensagensSelecionadas.add(msgId);
            if (balao) balao.style.outline = '3px solid #3498db';
        }

        Workspace.Sidebar.renderizarBarraSelecao();
    },

    cancelarSelecao: () => {
        Workspace.Sidebar.modoSelecaoAtivo = false;
        // Remove os destaques visuais de todos os balões
        Workspace.Sidebar.mensagensSelecionadas.forEach(msgId => {
            const elMsg = document.getElementById(`msg-${msgId}`);
            if (elMsg) {
                const balao = elMsg.querySelector('div[style*="max-width: 85%"]');
                if (balao) balao.style.outline = 'none';
            }
        });
        Workspace.Sidebar.mensagensSelecionadas.clear();
        
        const barra = document.getElementById('ws-barra-selecao');
        if (barra) barra.style.display = 'none';
    },

    renderizarBarraSelecao: () => {
        let barra = document.getElementById('ws-barra-selecao');
        if (!barra) {
            barra = document.createElement('div');
            barra.id = 'ws-barra-selecao';
            barra.style.cssText = "position: absolute; top: 0; left: 0; width: 100%; background: #2c3e50; color: white; padding: 15px 20px; display: none; justify-content: space-between; align-items: center; z-index: 1000; box-shadow: 0 4px 10px rgba(0,0,0,0.2); box-sizing: border-box; transition: 0.3s;";
            
            const chatHeader = document.getElementById('ws-chat-modal').firstElementChild;
            chatHeader.style.position = 'relative';
            chatHeader.appendChild(barra);
        }

        const qtd = Workspace.Sidebar.mensagensSelecionadas.size;
        if (qtd === 0) {
            Workspace.Sidebar.cancelarSelecao();
            return;
        }

        barra.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <button onclick="Workspace.Sidebar.cancelarSelecao()" style="background: transparent; border: none; color: white; font-size: 20px; cursor: pointer; padding: 0;">✖</button>
                <span style="font-weight: bold; font-size: 16px;">${qtd} selecionada(s)</span>
            </div>
            <button onclick="Workspace.Sidebar.apagarMensagensEmMassa()" style="background: #e74c3c; color: white; border: none; padding: 8px 15px; border-radius: 6px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px;"><span style="font-size: 16px;">🗑️</span> Apagar</button>
        `;
        barra.style.display = 'flex';
    },

    apagarMensagensEmMassa: async () => {
        const ids = Array.from(Workspace.Sidebar.mensagensSelecionadas);
        if (ids.length === 0) return;

        // 1. Destruição visual no ecrã de quem clica (fulminante)
        ids.forEach(msgId => {
            const elMsg = document.getElementById(`msg-${msgId}`);
            if (elMsg) elMsg.remove();
            Workspace.Sidebar.mensagensRenderizadas.delete(msgId);
        });

        Workspace.Sidebar.cancelarSelecao(); // Fecha a barra superior

        // 2. Avisa a nuvem silenciosamente
        try {
            await Workspace.api(`/workspace/chat/${Workspace.Sidebar.turmaIdAberta}/mensagens/massa`, 'DELETE', { ids: ids });
        } catch(e) {
            console.error("Falha ao apagar em massa.");
        }
    },

  // 🚀 LÓGICA DE APAGAR MENSAGEM INDIVIDUAL DO CHAT (INSTANTÂNEO E SEM CONFIRMAÇÃO)
    apagarMensagemIndividual: async (mensagemId) => {
        // 1. Esconde imediatamente o menu flutuante (para não ficar preso no ecrã)
        document.querySelectorAll('.ws-msg-opcoes').forEach(el => el.style.display = 'none');

        // 2. Apaga do próprio ecrã instantaneamente, sem perguntar!
        const elMsg = document.getElementById(`msg-${mensagemId}`);
        if (elMsg) elMsg.remove();
        Workspace.Sidebar.mensagensRenderizadas.delete(mensagemId);

        // 3. Avisa a nuvem (background) de forma silenciosa
        try {
            await Workspace.api(`/workspace/chat/${Workspace.Sidebar.turmaIdAberta}/mensagem/${mensagemId}`, 'DELETE');
        } catch(e) {
            console.error("Falha ao apagar mensagem na nuvem.");
        }
    },

    // 🚀 LÓGICA DOS 3 PONTINHOS ⋮ (APAGAR O CHAT)
    apagarTodoOChat: () => {
        if (!Workspace.Sidebar.turmaIdAberta) return;
        
        Workspace.Sidebar.mostrarConfirmacao(
            "Apagar Todo o Chat?", 
            "Tem a certeza de que deseja eliminar DEFINITIVAMENTE todo o histórico de mensagens desta turma? Esta ação não tem retorno.", 
            async () => {
                try {
                    const res = await Workspace.api(`/workspace/chat/${Workspace.Sidebar.turmaIdAberta}/limpar`, 'DELETE');
                    if (res && res.success) {
                        Workspace.mostrarAviso("Histórico da turma apagado com sucesso.", "success");
                        document.getElementById('ws-chat-mensagens').innerHTML = '<div style="text-align:center; padding:30px; color:#7f8c8d; font-size:13px;">O histórico foi limpo.<br>Diga olá para a turma! 👋</div>';
                    } else {
                        Workspace.mostrarAviso("Não tem permissões ou erro ao apagar.", "error");
                    }
                } catch(e) {
                    Workspace.mostrarAviso("Falha de comunicação.", "error");
                }
            }
        );
    },

    initExtraChatTriggers: () => {
        document.addEventListener('click', (e) => {
            // 1. Fecha o menu superior dos 3 pontinhos (Opções da Sala)
            const menuDropdown = document.getElementById('ws-chat-opcoes-dropdown');
            const menuButton = document.getElementById('ws-btn-opcoes-chat');
            if (menuDropdown && menuDropdown.style.display === 'flex') {
                if (!menuDropdown.contains(e.target) && e.target !== menuButton) {
                    menuDropdown.style.display = 'none';
                }
            }
            
            // 2. 🚀 NOVA REGRA: Fecha os menus flutuantes das mensagens se o utilizador clicar/tocar noutro lado
            if (!e.target.closest('.ws-msg-opcoes') && !e.target.closest('div[id^="msg-"]')) {
                document.querySelectorAll('.ws-msg-opcoes').forEach(el => el.style.display = 'none');
            }
        });
    },

    // ==========================================
    // 📅 TAREFAS: LÓGICA DO ALUNO E PROFESSOR
    // ==========================================
    carregarTarefas: async () => {
        const container = document.getElementById('ws-lista-tarefas-grid');
        if (!container) return;
        container.innerHTML = '<div style="grid-column: 1 / -1; padding: 30px; color:#999; font-size:15px; text-align:center;">Atualizando Painel de Atividades ⏳... </div>';

        try {
            const eventos = await Workspace.api('/eventos', 'GET');
            if (!eventos || eventos.error || eventos.length === 0) {
                container.innerHTML = '<div style="grid-column: 1 / -1; padding: 40px; color:#7f8c8d; font-size:16px; text-align:center;">🎉 Que maravilha! Não há tarefas agendadas no momento.</div>';
                return;
            }

            let tarefas = eventos.filter(e => e.tipo === 'Tarefa' || e.tipo === 'Trabalho');

            if (Workspace.usuario.tipo === 'Aluno') {
                let minhasTurmas = [];
                const u = Workspace.usuario;
                if (u.turmas) minhasTurmas = minhasTurmas.concat(u.turmas);
                if (u.turma) minhasTurmas = minhasTurmas.concat(u.turma);
                if (u.turmaId) minhasTurmas = minhasTurmas.concat(u.turmaId);
                if (u.turmaNome) minhasTurmas = minhasTurmas.concat(u.turmaNome);
                
                const turmasSeguras = minhasTurmas.filter(t => t).map(t => String(t).toLowerCase().trim());

                tarefas = tarefas.filter(t => {
                    if (!t.turma || String(t.turma).toLowerCase().trim() === 'global') return true;
                    const matchId = turmasSeguras.includes(String(t.turma).toLowerCase().trim());
                    const matchNome = t.turmaNome ? turmasSeguras.includes(String(t.turmaNome).toLowerCase().trim()) : false;
                    return matchId || matchNome;
                });
            }

            if (tarefas.length === 0) {
                 container.innerHTML = '<div style="grid-column: 1 / -1; padding: 40px; color:#7f8c8d; font-size:16px; text-align:center;">🎉 Nenhuma tarefa pendente para a sua turma!</div>';
                 return;
            }

            tarefas.sort((a, b) => new Date(a.data) - new Date(b.data));
            Workspace.Sidebar.tarefasCache = tarefas; 

            let html = '';
            tarefas.forEach(t => {
                const dataObj = new Date(t.data);
                const hoje = new Date();
                hoje.setHours(0,0,0,0);
                
                const passou = dataObj < hoje;
                const corEstado = passou ? '#e74c3c' : '#27ae60';
                const fundoEstado = passou ? '#fdf2f2' : '#eafaf1';
                const textoEstado = passou ? 'Prazo Terminado' : 'No Prazo';
                const dataFormatada = dataObj.toLocaleDateString('pt-BR');

                html += `
                    <div style="background: white; border: 1px solid #e1e4e8; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; transition: 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.02);" onmouseover="this.style.boxShadow='0 10px 25px rgba(0,0,0,0.1)'; this.style.transform='translateY(-3px)'" onmouseout="this.style.boxShadow='0 4px 6px rgba(0,0,0,0.02)'; this.style.transform='translateY(0)'">
                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                                <div style="background: #f4f6f7; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; color: #2c3e50; text-transform: uppercase; letter-spacing: 0.5px;">
                                    📚 ${Workspace.Sidebar.escapeHTML(t.turmaNome || 'Geral')}
                                </div>
                                <div style="font-size: 10px; font-weight: bold; color: ${corEstado}; background: ${fundoEstado}; padding: 4px 8px; border-radius: 8px;">
                                    ${textoEstado}
                                </div>
                            </div>
                            <h4 style="margin: 0 0 8px 0; color: #3498db; font-size: 17px;">${Workspace.Sidebar.escapeHTML(t.titulo || t.nome || 'Atividade')}</h4>
                            <p style="margin: 0 0 20px 0; font-size: 13px; color: #666; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                                ${Workspace.Sidebar.escapeHTML(t.descricao || 'Clique em Detalhes para ver as instruções completas.')}
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
            container.innerHTML = '<div style="grid-column: 1 / -1; padding: 20px; color:#e74c3c; font-size:14px; text-align:center;">Erro ao carregar atividades.</div>';
        }
    },

    abrirModalTarefa: async (eventoId) => {
        const evento = Workspace.Sidebar.tarefasCache.find(e => e.id === eventoId);
        if (!evento) return;

        document.getElementById('ws-tarefa-id').value = evento.id;
        document.getElementById('ws-tarefa-titulo').innerText = evento.titulo || evento.nome || evento.tipo;
        const dataFormatada = new Date(evento.data).toLocaleDateString('pt-BR');
        document.getElementById('ws-tarefa-data').innerText = `📅 Prazo Limite: ${dataFormatada}`;
        
        let htmlAnexo = '';
        if (evento.anexoUrl) {
            let urlCorrigida = evento.anexoUrl.startsWith('http') || evento.anexoUrl.startsWith('/') ? evento.anexoUrl : '/' + evento.anexoUrl;
            const urlLower = urlCorrigida.toLowerCase();
            const ehImagem = urlLower.match(/\.(jpeg|jpg|gif|png|webp)$/) != null || urlLower.includes('image');
            const ehVideo = urlLower.match(/\.(mp4|webm|ogg)$/) != null || urlLower.includes('video');

            if (ehImagem) {
                htmlAnexo = `<div style="margin-top:15px; border-top:1px dashed #ccc; padding-top:15px;"><img src="${urlCorrigida}" style="width:100%; border-radius:8px; border:1px solid #ddd;"></div>`;
            } else if (ehVideo) {
                htmlAnexo = `<div style="margin-top:15px; border-top:1px dashed #ccc; padding-top:15px;"><video controls style="width:100%; border-radius:8px; border:1px solid #ddd; background:#000;"><source src="${urlCorrigida}">Seu navegador não suporta este vídeo.</video></div>`;
            } else {
                htmlAnexo = `<div style="margin-top:15px; border-top:1px dashed #ccc; padding-top:15px;"><a href="${urlCorrigida}" target="_blank" style="display:flex; align-items:center; gap:8px; background:#3498db; color:white; padding:10px; border-radius:6px; text-decoration:none; font-weight:bold; justify-content:center; transition:0.2s;" onmouseover="this.style.background='#2980b9'">📎 Abrir Material de Apoio</a></div>`;
            }
        }

        const textoInstrucoes = evento.descricao ? Workspace.Sidebar.escapeHTML(evento.descricao).replace(/\n/g, '<br>') : 'Nenhuma instrução adicional foi fornecida pelo professor.';
        const ehAluno = Workspace.usuario.tipo === 'Aluno';
        
        let htmlEditar = '';
        if(!ehAluno) {
            htmlEditar = `<div style="display:flex; justify-content:flex-end; margin-bottom:10px;"><button onclick="Workspace.Sidebar.editarTarefaInstrucoes('${evento.id}')" style="background:#e8f4f8; color:#3498db; border:1px solid #bde0fe; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:bold; cursor:pointer; transition:0.2s;" onmouseover="this.style.background='#d5ebf6'">✏️ Editar Instruções</button></div>`;
        }

        document.getElementById('ws-tarefa-desc').innerHTML = htmlEditar + `<div style="line-height:1.6; color:#444;">${textoInstrucoes}</div>` + htmlAnexo;

        document.getElementById('ws-area-entrega').style.display = 'none';
        document.getElementById('ws-area-entregue').style.display = 'none';
        const areaProfessor = document.getElementById('ws-area-professor');
        if (areaProfessor) areaProfessor.style.display = 'none';

        document.getElementById('ws-tarefa-modal').style.display = 'flex';

        if (!ehAluno) {
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
                            let urlCorrigida = ent.arquivoUrl;
                            if (!urlCorrigida.startsWith('http') && !urlCorrigida.startsWith('/')) urlCorrigida = '/' + urlCorrigida;
                            const nomeMinusculo = (ent.arquivoNome || '').toLowerCase();
                            const ehOffice = nomeMinusculo.endsWith('.docx') || nomeMinusculo.endsWith('.doc') || nomeMinusculo.endsWith('.xlsx') || nomeMinusculo.endsWith('.xls');
                            const attrDownload = ehOffice ? `download="${ent.arquivoNome}"` : '';
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
                                    <a href="${urlCorrigida}" ${attrDownload} target="_blank" style="background: #3498db; color: white; padding: 8px 12px; border-radius: 6px; font-size: 12px; text-decoration: none; text-align: center; font-weight: bold; margin-top: 5px; transition: 0.2s;" onmouseover="this.style.background='#2980b9'">📥 Baixar Trabalho</a>
                                </div>
                            `;
                        });
                        document.getElementById('ws-lista-entregas').innerHTML = htmlEntregas;
                    }
                } catch(e) { document.getElementById('ws-lista-entregas').innerHTML = '<p style="color: #e74c3c; font-size: 12px; text-align:center;">Erro ao buscar entregas.</p>'; }
            }
        } else {
            document.getElementById('ws-tarefa-arquivo').value = '';
            document.getElementById('ws-tarefa-obs').value = '';

            try {
                const alunoRefId = Workspace.usuario.alunoRefId || Workspace.usuario.id;
                const res = await Workspace.api(`/workspace/entregas/verificar/${evento.id}/${alunoRefId}`, 'GET');
                
                if (res && res.entregue && res.detalhes) {
                    document.getElementById('ws-area-entregue').style.display = 'block';
                    const dataEnt = new Date(res.detalhes.dataEntrega).toLocaleString('pt-BR');
                    document.getElementById('ws-tarefa-data-entregue').innerText = `Enviado em: ${dataEnt}`;
                    
                    let urlCorrigida = res.detalhes.arquivoUrl;
                    if (!urlCorrigida.startsWith('http') && !urlCorrigida.startsWith('/')) urlCorrigida = '/' + urlCorrigida;
                    const nomeMinusculo = (res.detalhes.arquivoNome || '').toLowerCase();
                    const ehOffice = nomeMinusculo.endsWith('.docx') || nomeMinusculo.endsWith('.doc') || nomeMinusculo.endsWith('.xlsx') || nomeMinusculo.endsWith('.xls');
                    const attrDownload = ehOffice ? `download="${res.detalhes.arquivoNome}"` : '';

                    const btnLink = document.getElementById('ws-tarefa-link-entregue');
                    btnLink.href = urlCorrigida;
                    if(ehOffice) btnLink.setAttribute('download', res.detalhes.arquivoNome);
                    else btnLink.removeAttribute('download');
                } else { document.getElementById('ws-area-entrega').style.display = 'block'; }
            } catch (e) { document.getElementById('ws-area-entrega').style.display = 'block'; }
        }
    },

    enviarTarefa: async () => {
        const eventoId = document.getElementById('ws-tarefa-id').value;
        const fileInput = document.getElementById('ws-tarefa-arquivo');
        const obs = document.getElementById('ws-tarefa-obs').value.trim();

        if (!fileInput.files || fileInput.files.length === 0) {
            Workspace.mostrarAviso("Selecione um material (PDF, Imagem, Power Point ou Word) para enviar o seu trabalho.", "warning");
            return;
        }

        const file = fileInput.files[0];
        if (file.size > 10 * 1024 * 1024) return Workspace.mostrarAviso("O documento é muito pesado. Tente um documento até 10MB.", "warning");

        const btn = document.getElementById('ws-btn-entregar');
        const txtOriginal = btn.innerText;
        btn.innerText = "🔄 Enviando, aguarde...";
        btn.disabled = true;

        try {
            const formData = new FormData();
            formData.append('anexos', file);
            const uploadRes = await fetch('/api/workspace/upload', { method: 'POST', credentials: 'include', body: formData });
            const uploadData = await uploadRes.json();
            if (!uploadData.success || !uploadData.anexos || uploadData.anexos.length === 0) throw new Error("Falha no upload do documento.");

            const arquivoFinalUrl = uploadData.anexos[0].url;
            btn.innerText = "📝 Registrando a entrega...";

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
                Workspace.mostrarAviso("Trabalho entregue com sucesso!", "success");
                Workspace.Sidebar.abrirModalTarefa(eventoId);
            } else throw new Error(entregaRes.error || "Erro ao gravar entrega.");
        } catch (e) {
            console.error(e);
            Workspace.mostrarAviso("Erro ao enviar trabalho. Tente novamente.", "error");
        } finally {
            btn.innerText = txtOriginal;
            btn.disabled = false;
        }
    },

    voltarMenuTarefasProf: () => {
        document.getElementById('ws-prof-menu-tarefas').style.display = 'grid';
        document.getElementById('ws-prof-nova-tarefa').style.display = 'none';
        document.getElementById('ws-prof-lista-recebidas').style.display = 'none';
    },

    abrirPainelNovaTarefa: async () => {
        document.getElementById('ws-prof-menu-tarefas').style.display = 'none';
        document.getElementById('ws-prof-nova-tarefa').style.display = 'block';

        const sel = document.getElementById('ws-nova-tarefa-turma');
        sel.innerHTML = '<option value="">A carregar turmas...</option>';
        try {
            const turmas = await Workspace.api('/turmas', 'GET');
            sel.innerHTML = '<option value="global">🌍 Todas as Turmas (Público Geral)</option>';
            if(turmas && turmas.length > 0) {
                turmas.forEach(t => {
                    sel.innerHTML += `<option value="${t.id}">📚 ${Workspace.Sidebar.escapeHTML(t.nome)}</option>`;
                });
            }
        } catch(e) { sel.innerHTML = '<option value="global">🌍 Global</option>'; }
    },

    salvarNovaTarefa: async () => {
        const titulo = document.getElementById('ws-nova-tarefa-titulo').value.trim();
        const turmaId = document.getElementById('ws-nova-tarefa-turma').value;
        const selTurma = document.getElementById('ws-nova-tarefa-turma');
        const turmaNome = selTurma.options[selTurma.selectedIndex].text.replace('📚 ', '').replace('🌍 ', '');
        const data = document.getElementById('ws-nova-tarefa-data').value;
        const desc = document.getElementById('ws-nova-tarefa-desc').value.trim();
        const fileInput = document.getElementById('ws-nova-tarefa-arquivo');

        if(!titulo || !turmaId || !data) return Workspace.mostrarAviso("Preencha o Título, a Turma e o Prazo Limite!", "warning");

        const btn = document.getElementById('ws-btn-salvar-tarefa');
        const txt = btn.innerText;
        btn.innerText = "Salvando a atividade e notificando os alunos... ⏳";
        btn.disabled = true;

        try {
            let anexoUrl = null;
            if(fileInput.files.length > 0) {
                const formData = new FormData();
                formData.append('anexos', fileInput.files[0]);
                const uploadRes = await fetch('/api/workspace/upload', { method: 'POST', credentials: 'include', body: formData });
                const uploadData = await uploadRes.json();
                if(uploadData.success && uploadData.anexos.length > 0) {
                    anexoUrl = uploadData.anexos[0].url;
                }
            }

            const payload = {
                tipo: 'Tarefa', titulo: titulo, turma: turmaId, turmaNome: turmaNome,
                data: data, descricao: desc, anexoUrl: anexoUrl, autorNome: Workspace.usuario.nome || Workspace.usuario.login
            };

            const res = await Workspace.api('/eventos', 'POST', payload);
            if(res && !res.error) {
                Workspace.mostrarAviso("Atividade publicada com sucesso nas agendas dos alunos!", "success");
                document.getElementById('ws-nova-tarefa-titulo').value = '';
                document.getElementById('ws-nova-tarefa-data').value = '';
                document.getElementById('ws-nova-tarefa-desc').value = '';
                fileInput.value = '';
                Workspace.Sidebar.voltarMenuTarefasProf(); 
            } else {
                Workspace.mostrarAviso(res.error || "Erro ao criar tarefa.", "error");
            }
        } catch(e) { 
            Workspace.mostrarAviso("Erro de comunicação com o servidor.", "error"); 
        } finally { 
            btn.innerText = txt; 
            btn.disabled = false; 
        }
    },

   mostrarConfirmacao: (titulo, mensagem, callbackSim) => {
        const id = 'ws-custom-confirm-modal';
        if(document.getElementById(id)) document.getElementById(id).remove();

        const overlay = document.createElement('div');
        overlay.id = id;
        overlay.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:10005; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(3px); opacity:0; transition: opacity 0.2s;";
        
        overlay.innerHTML = `
            <div style="background:white; padding:25px; border-radius:16px; width:90%; max-width:320px; text-align:center; box-shadow:0 15px 40px rgba(0,0,0,0.3); transform:scale(0.9); transition: transform 0.2s;">
                <div style="font-size:45px; margin-bottom:10px;">🗑️</div>
                <h3 style="margin:0 0 10px 0; color:#2c3e50; font-size:18px;">${titulo}</h3>
                <p style="color:#7f8c8d; font-size:13px; margin:0 0 25px 0; line-height:1.5;">${mensagem}</p>
                <div style="display:flex; gap:10px;">
                    <button id="ws-confirm-btn-nao" style="flex:1; padding:12px; border:none; background:#f0f2f5; color:#555; border-radius:8px; font-weight:bold; cursor:pointer; font-size:13px; transition:0.2s;" onmouseover="this.style.background='#e2e6ea'" onmouseout="this.style.background='#f0f2f5'">Cancelar</button>
                    <button id="ws-confirm-btn-sim" style="flex:1; padding:12px; border:none; background:#e74c3c; color:white; border-radius:8px; font-weight:bold; cursor:pointer; font-size:13px; transition:0.2s;" onmouseover="this.style.background='#c0392b'" onmouseout="this.style.background='#e74c3c'">Sim, Apagar</button>
                </div>
            </div>
        `;

        // 🚀 O SEGREDO DO CONFINAMENTO: Se o chat estiver aberto, prendemos a confirmação dentro dele!
        const chatBox = document.getElementById('ws-chat-modal');
        if (chatBox && chatBox.style.display !== 'none') {
            overlay.style.position = 'absolute';
            overlay.style.borderRadius = 'inherit';
            chatBox.appendChild(overlay);
        } else {
            // Caso seja chamada a partir do Feed/Tarefas, mantém no ecrã total
            document.body.appendChild(overlay);
        }

        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            overlay.firstElementChild.style.transform = 'scale(1)';
        });

        const fechar = () => {
            overlay.style.opacity = '0';
            overlay.firstElementChild.style.transform = 'scale(0.9)';
            setTimeout(() => overlay.remove(), 200);
        };

        document.getElementById('ws-confirm-btn-nao').onclick = fechar;
        document.getElementById('ws-confirm-btn-sim').onclick = () => {
            fechar(); 
            callbackSim(); 
        };
    },

    apagarTarefa: (id) => {
        Workspace.Sidebar.mostrarConfirmacao(
            "Apagar Tarefa?",
            "Esta ação é irreversível. Todos os trabalhos entregues pelos alunos também serão destruídos. Tem a certeza?",
            async () => {
                try {
                    const res = await Workspace.api(`/eventos/${id}`, 'DELETE');
                    if(res && res.success) {
                        Workspace.mostrarAviso("Tarefa removida com sucesso!", "success");
                        Workspace.Sidebar.abrirPainelTarefasRecebidas(); 
                    } else {
                        Workspace.mostrarAviso("Erro ao apagar tarefa.", "error");
                    }
                } catch(e) { 
                    Workspace.mostrarAviso("Erro de comunicação com o servidor.", "error"); 
                }
            }
        );
    },

    editarTarefaInstrucoes: (id) => {
        const evento = Workspace.Sidebar.tarefasCache.find(e => e.id === id);
        if(!evento) return;
        
        const descArea = document.getElementById('ws-tarefa-desc');
        const textoAtual = evento.descricao || '';
        
        descArea.innerHTML = `
            <div style="background:#f4f6f7; padding:15px; border-radius:8px; border:1px solid #ddd; margin-bottom:15px;">
                <label style="font-size:12px; font-weight:bold; color:#e67e22; display:block; margin-bottom:10px;">✏️ Modo de Edição de Instruções</label>
                <textarea id="ws-edit-desc-input" rows="8" style="width:100%; padding:10px; border-radius:6px; border:1px solid #ccc; font-family:inherit; font-size:13px; margin-bottom:10px; resize:vertical; box-sizing:border-box;">${textoAtual}</textarea>
                <div style="display:flex; gap:10px;">
                    <button class="ws-btn" style="background:#27ae60; flex:1;" onclick="Workspace.Sidebar.salvarEdicaoTarefa('${id}')">💾 Guardar Alterações</button>
                    <button class="ws-btn" style="background:#95a5a6; flex:1;" onclick="Workspace.Sidebar.abrirModalTarefa('${id}')">Cancelar</button>
                </div>
            </div>
        `;
    },

    salvarEdicaoTarefa: async (id) => {
        const novoTexto = document.getElementById('ws-edit-desc-input').value;
        const btn = event.target;
        btn.innerText = "⏳ A guardar...";
        btn.disabled = true;

        try {
            const res = await Workspace.api(`/eventos/${id}`, 'PUT', { descricao: novoTexto });
            if(res && res.success) {
                Workspace.mostrarAviso("Instruções atualizadas com sucesso!", "success");
                const evento = Workspace.Sidebar.tarefasCache.find(e => e.id === id);
                if(evento) evento.descricao = novoTexto;
                Workspace.Sidebar.abrirModalTarefa(id);
            } else {
                Workspace.mostrarAviso("Erro ao atualizar instruções.", "error");
            }
        } catch(e) { 
            Workspace.mostrarAviso("Erro de comunicação com o servidor.", "error"); 
            btn.innerText = "Guardar Alterações"; 
            btn.disabled = false; 
        }
    },

    abrirPainelTarefasRecebidas: async () => {
        document.getElementById('ws-prof-menu-tarefas').style.display = 'none';
        document.getElementById('ws-prof-lista-recebidas').style.display = 'block';
        
        const container = document.getElementById('ws-prof-tarefas-grid');
        container.innerHTML = '<div style="text-align:center; padding:30px; color:#999;">Procurando atividades criadas ⏳... </div>';

        try {
            const eventos = await Workspace.api('/eventos', 'GET');
            let tarefas = (eventos || []).filter(e => e.tipo === 'Tarefa' || e.tipo === 'Trabalho');
            
            if(tarefas.length === 0) {
                container.innerHTML = '<div style="text-align:center; padding:30px; color:#7f8c8d;">Nenhuma tarefa enviada ainda. Crie uma nova tarefa primeiro!</div>';
                return;
            }

            tarefas.sort((a,b) => new Date(b.data) - new Date(a.data));
            Workspace.Sidebar.tarefasCache = tarefas; 

            let html = '';
            tarefas.forEach(t => {
                const dataF = new Date(t.data).toLocaleDateString('pt-BR');
                html += `
                    <div style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                        <div style="background: #f8f9fa; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;">
                            <div style="flex: 1; cursor: pointer;" onclick="Workspace.Sidebar.carregarEntregasDaTarefa('${t.id}')">
                                <h4 style="margin: 0 0 5px 0; color: #2c3e50; font-size:15px;">${Workspace.Sidebar.escapeHTML(t.titulo || 'Tarefa Sem Título')}</h4>
                                <div style="font-size: 11px; color: #7f8c8d; font-weight:bold;">📚 ${t.turmaNome || 'Global'} &nbsp;|&nbsp; 📅 Entrega até: <span style="color:#e74c3c;">${dataF}</span></div>
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <button onclick="Workspace.Sidebar.abrirModalTarefa('${t.id}')" style="background:#3498db; color:white; border:none; padding:6px 10px; border-radius:6px; font-size:11px; font-weight:bold; cursor:pointer; transition:0.2s;" onmouseover="this.style.background='#2980b9'">👁️ Detalhes</button>
                                <button onclick="Workspace.Sidebar.apagarTarefa('${t.id}')" style="background:#e74c3c; color:white; border:none; padding:6px 10px; border-radius:6px; font-size:11px; font-weight:bold; cursor:pointer; transition:0.2s;" onmouseover="this.style.background='#c0392b'">🗑️ Apagar</button>
                                <div style="color: #3498db; font-size: 13px; font-weight: bold; margin-left:10px; cursor: pointer;" onclick="Workspace.Sidebar.carregarEntregasDaTarefa('${t.id}')">Trabalhos ▼</div>
                            </div>
                        </div>
                        <div id="entregas-prof-${t.id}" style="display: none; padding: 15px; background: white; border-top: 1px solid #eee;">
                            <div style="text-align:center; font-size:12px; color:#999; padding:10px;">Procurando alunos que entregaram... ⏳</div>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        } catch(e) {
            container.innerHTML = '<div style="color:#e74c3c; text-align:center; padding:20px;">Erro ao carregar lista de tarefas.</div>';
        }
    },

    carregarEntregasDaTarefa: async (eventoId) => {
        const box = document.getElementById(`entregas-prof-${eventoId}`);
        if(!box) return;

        if(box.style.display === 'block') {
            box.style.display = 'none';
            return;
        }
        
        box.style.display = 'block';

        try {
            const entregas = await Workspace.api(`/workspace/entregas/tarefa/${eventoId}`, 'GET');
            if(!entregas || entregas.length === 0) {
                box.innerHTML = '<div style="font-size:13px; color:#7f8c8d; text-align:center; padding:15px; background:#fdfdfd; border-radius:8px; border:1px dashed #ddd;">Nenhum aluno entregou esta atividade ainda.</div>';
                return;
            }

            let html = '';
            entregas.forEach(ent => {
                const dataEnt = new Date(ent.dataEntrega).toLocaleString('pt-BR', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'});
                let urlCorrigida = ent.arquivoUrl.startsWith('http') || ent.arquivoUrl.startsWith('/') ? ent.arquivoUrl : '/' + ent.arquivoUrl;
                
                const nomeMinusculo = (ent.arquivoNome || '').toLowerCase();
                const ehOffice = nomeMinusculo.endsWith('.docx') || nomeMinusculo.endsWith('.doc') || nomeMinusculo.endsWith('.xlsx') || nomeMinusculo.endsWith('.xls');
                const attrDownload = ehOffice ? `download="${ent.arquivoNome}"` : '';
                const avatarAluno = window.Workspace.renderizarAvatar(ent.alunoNome, 35);

                html += `
                    <div style="background: #fdfefe; border: 1px solid #e9ecef; border-left: 3px solid #3498db; border-radius: 8px; padding: 12px 15px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            ${avatarAluno}
                            <div>
                                <strong style="color: #2c3e50; font-size: 14px; display: block; margin-bottom: 2px;">${Workspace.Sidebar.escapeHTML(ent.alunoNome)}</strong>
                                <span style="font-size: 11px; color: #7f8c8d; background:#f0f2f5; padding:2px 6px; border-radius:4px;">Entregue: ${dataEnt}</span>
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            ${ent.observacao ? `<span title="${Workspace.Sidebar.escapeHTML(ent.observacao)}" style="cursor:help; font-size:20px; color:#f1c40f;">💬</span>` : ''}
                            <a href="${urlCorrigida}" ${attrDownload} target="_blank" style="background: #3498db; color: white; padding: 8px 15px; border-radius: 6px; font-size: 12px; text-decoration: none; text-align: center; font-weight: bold; margin-top: 5px; transition: 0.2s; box-shadow:0 2px 5px rgba(52, 152, 219, 0.3);" onmouseover="this.style.background='#2980b9'">📥 Baixar Arquivo do Aluno</a>
                        </div>
                    </div>
                `;
            });
            box.innerHTML = html;
        } catch(e) {
            box.innerHTML = '<div style="font-size:12px; color:#e74c3c; text-align:center;">Erro ao carregar entregas.</div>';
        }
    }
};