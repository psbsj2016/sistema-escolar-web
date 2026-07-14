window.Workspace = window.Workspace || {};

Workspace.Sidebar = {
    turmaIdAberta: null,
    infoTurmaAberta: null, 
    fotoComprimida: null,  // Guarda a foto transformada em ficheiro (File)
    chatStream: null, 
    tarefasCache: [],
    mensagensRenderizadas: new Set(), 
    
    isTyping: false,
    typingTimer: null,
    typingUiTimer: null,

    init: async () => {
        console.log("📊 Motor do Menu Lateral com Chat Avançado iniciado.");
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

    carregarTurmas: async () => {
        const container = document.getElementById('ws-lista-turmas-menu');
        if (!container) return;
        container.innerHTML = '<div style="padding:10px; color:#999; font-size:12px; text-align:center;">A carregar fóruns... ⏳</div>';

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
                 container.innerHTML = '<div style="padding:10px; color:#7f8c8d; font-size:12px; text-align:center;">Ainda não está associado a nenhum fórum.</div>';
                 return;
            }

            let html = '';
            turmas.forEach(t => {
                const nomeTurma = Workspace.Sidebar.escapeHTML(t.nome);
                
                let avatarMenu = `<div style="width: 30px; height: 30px; border-radius: 50%; background: #8e44ad; color: white; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; flex-shrink: 0;">#</div>`;
                if(t.foto) {
                    avatarMenu = `<div style="width: 30px; height: 30px; border-radius: 50%; overflow: hidden; flex-shrink: 0; border: 1px solid #ddd;"><img src="${t.foto}" style="width:100%; height:100%; object-fit:cover;"></div>`;
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

    atualizarCabecalhoChat: (info) => {
        const titulo = document.getElementById('ws-chat-titulo');
        const avatar = document.getElementById('ws-chat-avatar-container');
        
        if(titulo) titulo.innerText = info.nome || 'Sala de Bate-Papo';
        
        if(info.foto) {
            avatar.innerHTML = `<img src="${info.foto}" style="width:100%; height:100%; object-fit:cover;">`;
            avatar.style.background = 'transparent';
        } else {
            avatar.innerHTML = '👥';
            avatar.style.background = 'rgba(255,255,255,0.2)';
        }
    },

    verFotoChat: () => {
        const info = Workspace.Sidebar.infoTurmaAberta;
        if(info && info.foto) {
            if(Workspace.Feed && Workspace.Feed.abrirImagemInteira) {
                Workspace.Feed.abrirImagemInteira(info.foto);
            }
        } else {
            Workspace.mostrarAviso("Este grupo de estudos ainda não possui uma foto de perfil.", "info");
        }
    },

    abrirEdicaoChat: () => {
        const info = Workspace.Sidebar.infoTurmaAberta || {};
        Workspace.Sidebar.fotoComprimida = null; 
        
        const idModal = 'ws-modal-edit-chat';
        if(document.getElementById(idModal)) document.getElementById(idModal).remove();

        const modal = document.createElement('div');
        modal.id = idModal;
        modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:100000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); opacity:0; transition:0.2s;";
        
        modal.innerHTML = `
            <div class="ws-card" style="width: 90%; max-width: 400px; padding: 25px; transform: scale(0.9); transition: 0.2s; position: relative;">
                <button onclick="document.getElementById('${idModal}').style.opacity='0'; setTimeout(()=>document.getElementById('${idModal}').remove(), 200)" style="position:absolute; right:15px; top:15px; background:#eee; border:none; border-radius:50%; width:30px; height:30px; cursor:pointer; font-weight:bold; color:#333;">×</button>
                <h3 style="margin: 0 0 15px 0; color: #2c3e50; text-align: center;">✏️ Configurações do Grupo</h3>
                
                <div style="text-align: center; margin-bottom: 25px;">
                    <div style="width: 100px; height: 100px; background: #f0f2f5; border-radius: 50%; margin: 0 auto 10px auto; overflow: hidden; border: 3px solid #3498db; position: relative; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" onclick="document.getElementById('ws-chat-nova-foto').click()">
                        <img id="ws-chat-foto-preview" src="${info.foto || ''}" style="width:100%; height:100%; object-fit:cover; display: ${info.foto ? 'block' : 'none'};">
                        <div id="ws-chat-icone-holder" style="display: ${info.foto ? 'none' : 'flex'}; align-items:center; justify-content:center; width:100%; height:100%; font-size:40px; color:#aaa;">👥</div>
                        <div style="position: absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5); color:white; font-size:24px; opacity:0; transition:0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0'">📷</div>
                    </div>
                    <input type="file" id="ws-chat-nova-foto" accept="image/*" style="display:none;" onchange="Workspace.Sidebar.previewFotoChat(event)">
                    <div style="font-size: 12px; color: #7f8c8d; font-weight: bold;">Toque no ícone para alterar a foto</div>
                    <div id="ws-alerta-compressao" style="font-size: 10px; color: #27ae60; font-weight: bold; margin-top: 5px; display: none;">Imagem otimizada para envio ultrarrápido! 🚀</div>
                </div>

                <label style="font-size: 12px; font-weight: bold; color: #555;">Nome da Turma / Grupo</label>
                <input type="text" id="ws-chat-novo-nome" class="ws-post-input" value="${Workspace.Sidebar.escapeHTML(info.nome || '')}" placeholder="Ex: Turma Avançada A" style="padding: 12px; margin-bottom: 20px; font-weight: bold; color: #333;">

                <div style="display:flex; gap:10px;">
                    <button class="ws-btn" id="ws-btn-salvar-chat" style="background:#27ae60; flex:1; width:100%; font-size: 14px; padding: 12px;" onclick="Workspace.Sidebar.salvarEdicaoChat()">💾 Guardar Alterações</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            modal.firstElementChild.style.transform = 'scale(1)';
        });
    },

    // 🚀 MOTOR DE COMPRESSÃO REFEITO PARA CRIAR UM "FILE" NATIVO
    previewFotoChat: (e) => {
        const file = e.target.files[0];
        if(!file) return;

        if (file.size > 15 * 1024 * 1024) { 
            Workspace.mostrarAviso("A fotografia é muito pesada. Escolha uma imagem até 15MB.", "warning");
            e.target.value = ''; 
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const imgOriginal = new Image();
            imgOriginal.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 400; 
                const MAX_HEIGHT = 400;
                let width = imgOriginal.width;
                let height = imgOriginal.height;

                if (width > height) {
                    if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                } else {
                    if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(imgOriginal, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    // 🛡️ MÁGICA: Convertemos o Blob num autêntico objeto "File" idêntico ao upload do Perfil
                    const arquivoFinal = new File([blob], "avatar_turma_otimizado.jpg", { type: "image/jpeg" });
                    Workspace.Sidebar.fotoComprimida = arquivoFinal;

                    const imgPreview = document.getElementById('ws-chat-foto-preview');
                    const icone = document.getElementById('ws-chat-icone-holder');
                    const avisoCompressao = document.getElementById('ws-alerta-compressao');
                    
                    imgPreview.src = URL.createObjectURL(arquivoFinal);
                    imgPreview.style.display = 'block';
                    if(icone) icone.style.display = 'none';
                    if(avisoCompressao) avisoCompressao.style.display = 'block';

                    e.target.value = ''; 
                }, 'image/jpeg', 0.85); 
            };
            imgOriginal.src = event.target.result;
        };
        reader.readAsDataURL(file);
    },

    salvarEdicaoChat: async () => {
        const nomeInput = document.getElementById('ws-chat-novo-nome');
        const nome = nomeInput.value.trim();
        const btn = document.getElementById('ws-btn-salvar-chat');
        
        if(!nome) return Workspace.mostrarAviso("O nome do grupo é obrigatório.", "warning");

        const textoOriginal = btn.innerText;
        btn.innerText = "⏳ A guardar na nuvem...";
        btn.disabled = true;

        try {
            let fotoUrl = Workspace.Sidebar.infoTurmaAberta?.foto || null;
            
            // Agora Workspace.Sidebar.fotoComprimida é um "File" real!
            if (Workspace.Sidebar.fotoComprimida) {
                const formData = new FormData();
                formData.append('anexos', Workspace.Sidebar.fotoComprimida); 
                
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

    // ==========================================
    // 💬 LÓGICA DO BATE-PAPO
    // ==========================================
    abrirChat: (turmaId, turmaNome) => {
        Workspace.Sidebar.turmaIdAberta = turmaId;
        
        document.getElementById('ws-chat-titulo').innerText = 'A carregar grupo...';
        document.getElementById('ws-chat-avatar-container').innerHTML = '👥';
        document.getElementById('ws-chat-avatar-container').style.background = 'rgba(255,255,255,0.2)';
        document.getElementById('ws-chat-aluno-nome').innerText = Workspace.usuario.nome || Workspace.usuario.login;
        
        const btnEdit = document.getElementById('ws-btn-editar-chat');
        if(btnEdit) {
            btnEdit.style.display = (Workspace.usuario.tipo === 'Professor' || Workspace.usuario.tipo === 'Gestor') ? 'block' : 'none';
        }

        Workspace.api(`/workspace/chat/info/${turmaId}`, 'GET').then(info => {
            if(info) {
                Workspace.Sidebar.infoTurmaAberta = info;
                Workspace.Sidebar.atualizarCabecalhoChat(info);
            }
        }).catch(() => {
            document.getElementById('ws-chat-titulo').innerText = turmaNome;
        });

        if (!document.getElementById('ws-chat-typing-indicator')) {
            const inputContainer = document.getElementById('ws-chat-input').closest('div[style*="padding: 10px"]');
            inputContainer.insertAdjacentHTML('beforebegin', '<div id="ws-chat-typing-indicator" style="display:none; padding: 4px 20px 8px 20px; font-size: 11.5px; color: #128c7e; font-style: italic; font-weight: 600; background: #e5ddd5; transition: 0.3s; animation: pulse 1.5s infinite;"></div>');
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
        document.getElementById('ws-chat-modal').style.display = 'none';
        Workspace.Sidebar.turmaIdAberta = null;
        Workspace.Sidebar.infoTurmaAberta = null;
        
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

    gerarHTMLMensagem: (m, meuNome) => {
        const ehMinha = m.autorNome === meuNome;
        const alinhamento = ehMinha ? 'flex-end' : 'flex-start';
        const corFundo = ehMinha ? '#dcf8c6' : '#ffffff';
        const hora = new Date(m.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const avatarChat = window.Workspace.renderizarAvatar(m.autorNome, 32);

        return `
            <div id="msg-${m.id}" style="display: flex; gap: 10px; flex-direction: ${ehMinha ? 'row-reverse' : 'row'}; align-items: flex-end; margin-bottom: 12px; animation: fadeIn 0.3s ease;">
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
    },

    injetarNovaMensagem: (m) => {
        if (Workspace.Sidebar.mensagensRenderizadas.has(m.id)) return; 
        Workspace.Sidebar.mensagensRenderizadas.add(m.id);

        const container = document.getElementById('ws-chat-mensagens');
        const meuNome = Workspace.usuario.nome || Workspace.usuario.login;
        
        if (container.innerHTML.includes('Nenhuma mensagem')) {
            container.innerHTML = '';
        }

        container.insertAdjacentHTML('beforeend', Workspace.Sidebar.gerarHTMLMensagem(m, meuNome));
        container.scrollTop = container.scrollHeight;
    },

    carregarMensagensChat: async () => {
        if (!Workspace.Sidebar.turmaIdAberta) return;
        const container = document.getElementById('ws-chat-mensagens');
        
        try {
            const mensagens = await Workspace.api(`/workspace/chat/${Workspace.Sidebar.turmaIdAberta}`, 'GET');
            
            if (!mensagens || mensagens.length === 0) {
                container.innerHTML = `<div style="text-align:center; padding:30px; color:#7f8c8d; font-size:13px;">Nenhuma mensagem neste fórum ainda.<br>Diga olá para a turma! 👋</div>`;
                return;
            }

            const meuNome = Workspace.usuario.nome || Workspace.usuario.login;
            let html = '';
            
            Workspace.Sidebar.mensagensRenderizadas.clear();

            mensagens.forEach(m => {
                Workspace.Sidebar.mensagensRenderizadas.add(m.id);
                html += Workspace.Sidebar.gerarHTMLMensagem(m, meuNome);
            });

            container.innerHTML = html;
            container.scrollTop = container.scrollHeight;
            
        } catch (e) { console.error("Erro ao carregar chat", e); }
    },

    enviarMensagemChat: async () => {
        const input = document.getElementById('ws-chat-input');
        const texto = input.value.trim();
        const turmaId = Workspace.Sidebar.turmaIdAberta;
        
        if (!texto || !turmaId) return;
        
        input.value = ''; 
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
        document.body.appendChild(overlay);

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