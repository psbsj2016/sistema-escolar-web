// js/modulos/workspace/feed.js
window.Workspace = window.Workspace || {};

Workspace.Feed = {
    postsCache: [],
    comentariosAbertos: new Set(), // 🧠 Memória: Guarda quais comentários estão abertos

    init: async () => {
        console.log("📚 Motor do Feed ligado à API.");
        await Workspace.Feed.carregarPosts();
        Workspace.Feed.configurarEventosCriacao();
    },

    carregarPosts: async () => {
        const container = document.getElementById('ws-posts-area');
        if (!container) return;

        if(Workspace.Feed.postsCache.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">A procurar publicações na nuvem... ⏳</div>';
        }

        try {
            const refId = Workspace.usuario.alunoRefId || '';
            const posts = await Workspace.api(`/workspace/posts?alunoRefId=${refId}`, 'GET');

            if (!posts || posts.length === 0) {
                container.innerHTML = `
                    <div class="ws-card" style="text-align: center; padding: 40px; color: #7f8c8d;">
                        <div style="font-size: 40px; margin-bottom: 10px;">📭</div>
                        <h3 style="margin: 0 0 5px 0;">O mural está vazio</h3>
                        <p style="margin: 0; font-size: 13px;">Nenhuma publicação recente para a sua turma.</p>
                    </div>`;
                return;
            }

            Workspace.Feed.postsCache = posts;
            Workspace.Feed.renderizarLista(posts);
        } catch (error) {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: #e74c3c;">Erro de ligação ao carregar o feed.</div>';
        }
    },

    renderizarAnexos: (anexos) => {
        if (!anexos || anexos.length === 0) return '';
        let html = '<div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:15px;">';
        
        anexos.forEach(anexo => {
            let urlCorrigida = anexo.url;
            if (!urlCorrigida.startsWith('http') && !urlCorrigida.startsWith('/')) {
                urlCorrigida = '/' + urlCorrigida;
            }

            const nomeMinusculo = (anexo.nome || '').toLowerCase();
            const ehOffice = nomeMinusculo.endsWith('.docx') || nomeMinusculo.endsWith('.doc') || 
                             nomeMinusculo.endsWith('.xlsx') || nomeMinusculo.endsWith('.xls') || 
                             nomeMinusculo.endsWith('.pptx');

            const attrDownload = ehOffice ? `download="${anexo.nome}"` : '';

            if (anexo.tipo.includes('image')) {
                html += `<a href="${urlCorrigida}" target="_blank" style="flex:1; min-width:150px; max-width:250px;"><img src="${urlCorrigida}" style="width:100%; border-radius:8px; border:1px solid #eee; object-fit:cover; aspect-ratio:16/9; transition:0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'"></a>`;
            } else if (anexo.tipo.includes('video')) {
                html += `<video controls style="width:100%; max-width:400px; border-radius:8px; border:1px solid #eee; margin-top:10px; background:#000;"><source src="${urlCorrigida}" type="${anexo.tipo}">O seu navegador não suporta vídeos.</video>`;
            } else {
                let icone = anexo.tipo.includes('pdf') || nomeMinusculo.endsWith('.pdf') ? '📕' : '📎';
                let textoAcao = ehOffice ? 'Baixar ⬇️' : 'Abrir ↗';

                html += `
                    <a href="${urlCorrigida}" ${attrDownload} target="_blank" style="display:flex; align-items:center; gap:10px; background:#f4f6f7; padding:10px 15px; border-radius:8px; text-decoration:none; color:#2c3e50; border:1px solid #ddd; width:100%; max-width:300px; transition:0.2s;" onmouseover="this.style.background='#e5e8e8'" onmouseout="this.style.background='#f4f6f7'">
                        <span style="font-size:24px;">${icone}</span>
                        <span style="flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:13px; font-weight:600;">${anexo.nome}</span>
                        <span style="color:#3498db; font-size:12px; font-weight:bold;">${textoAcao}</span>
                    </a>`;
            }
        });
        
        html += '</div>';
        return html;
    },

    limparTexto: (txt) => {
        if(!txt) return '';
        return txt.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },

    renderizarLista: (posts) => {
        const container = document.getElementById('ws-posts-area');
        const meuId = Workspace.usuario.id;
        
        const html = posts.map(p => {
            const dataFormatada = new Date(p.dataCriacao).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' });
            const avatar = p.autorNome.charAt(0).toUpperCase();
            const textoSeguro = Workspace.Feed.limparTexto(p.texto).replace(/\n/g, '<br>');

            const ehDonoOuGestor = (Workspace.usuario.nome === p.autorNome || Workspace.usuario.login === p.autorNome || Workspace.usuario.tipo === 'Gestor');
            const btnApagar = ehDonoOuGestor 
                ? `<span style="cursor:pointer; color:#e74c3c; font-size:12px; font-weight:bold; transition:0.2s;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'" onclick="Workspace.Feed.apagarPost('${p.id}')">🗑️ Apagar Post</span>` 
                : '';

            let destinoBadge = p.destino === 'global' 
                ? `<span style="font-size:10px; background:#e8f4f8; color:#3498db; padding:2px 6px; border-radius:4px; margin-left:5px; font-weight:bold;">🌍 Público Geral</span>`
                : `<span style="font-size:10px; background:#f4e8f8; color:#8e44ad; padding:2px 6px; border-radius:4px; margin-left:5px; font-weight:bold;">📚 ${Workspace.Feed.limparTexto(p.destinoNome)}</span>`;

            // 🚀 LÓGICA DE CURTIDAS
            const likesArr = Array.isArray(p.likes) ? p.likes : [];
            const dislikesArr = Array.isArray(p.dislikes) ? p.dislikes : [];
            
            const euCurti = likesArr.includes(meuId);
            const euNaoCurti = dislikesArr.includes(meuId);

            const corLike = euCurti ? '#27ae60' : '#666';
            const corDislike = euNaoCurti ? '#e74c3c' : '#666';

            // Verifica se este comentário deve aparecer aberto (memória do sistema)
            const displayComentarios = Workspace.Feed.comentariosAbertos.has(p.id) ? 'block' : 'none';

            return `
                <div class="ws-card" style="animation: fadeIn 0.4s ease;">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:15px;">
                        <div style="width:40px; height:40px; border-radius:50%; background:#2c3e50; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:16px;">${avatar}</div>
                        <div>
                            <div style="font-weight:700; color:#2c3e50; font-size:15px;">${p.autorNome} <span style="font-size:11px; color:#aaa; margin-left:5px;">• ${p.autorTipo}</span></div>
                            <div style="font-size:12px; color:#7f8c8d; margin-top:2px;">${dataFormatada} ${destinoBadge}</div>
                        </div>
                    </div>
                    
                    <div style="font-size:14px; color:#333; line-height:1.6;">${textoSeguro}</div>
                    ${Workspace.Feed.renderizarAnexos(p.anexos)}
                    
                    <div style="margin-top:20px; padding-top:15px; border-top:1px solid #eee; display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; gap:15px; color:#666; font-size:13px; font-weight:600;">
                            
                            <span style="cursor:pointer; display:flex; align-items:center; gap:5px; color:${corLike}; font-weight:${euCurti ? 'bold' : 'normal'}; transition:0.2s;" onclick="Workspace.Feed.reagir('${p.id}', '${euCurti ? 'none' : 'like'}')">
                                👍 Curtir (${likesArr.length})
                            </span>
                            
                            <span style="cursor:pointer; display:flex; align-items:center; gap:5px; color:${corDislike}; font-weight:${euNaoCurti ? 'bold' : 'normal'}; transition:0.2s;" onclick="Workspace.Feed.reagir('${p.id}', '${euNaoCurti ? 'none' : 'dislike'}')">
                                👎 Não Curtir (${dislikesArr.length})
                            </span>

                            <span style="cursor:pointer; display:flex; align-items:center; gap:5px; transition:0.2s;" onmouseover="this.style.color='#3498db'" onmouseout="this.style.color='#666'" onclick="Workspace.Feed.toggleComentarios('${p.id}')">
                                💬 Comentar (${p.comentarios ? p.comentarios.length : 0})
                            </span>
                        </div>
                        ${btnApagar}
                    </div>

                    <div id="box-comentarios-${p.id}" style="display:${displayComentarios}; margin-top:15px; padding-top:15px; border-top:1px dashed #ddd;">
                        <div style="max-height: 250px; overflow-y: auto; margin-bottom: 15px; display: flex; flex-direction: column; gap: 10px;">
                            ${p.comentarios && p.comentarios.length > 0 ? p.comentarios.map(c => {
                                const ehDonoComentario = (c.autorNome === Workspace.usuario.nome || Workspace.usuario.login === c.autorNome || Workspace.usuario.tipo === 'Gestor');
                                return `
                                <div style="background: #f4f6f7; padding: 10px 15px; border-radius: 12px; font-size: 13px; position:relative; padding-right: 35px;">
                                    <strong style="color: #2c3e50;">${Workspace.Feed.limparTexto(c.autorNome)}:</strong> 
                                    <span style="color: #444;">${Workspace.Feed.limparTexto(c.texto)}</span>
                                    ${ehDonoComentario ? `<span style="position:absolute; right:12px; top:50%; transform:translateY(-50%); cursor:pointer; color:#e74c3c; font-size:14px;" title="Apagar comentário" onclick="Workspace.Feed.apagarComentario('${p.id}', '${c.id}')">🗑️</span>` : ''}
                                </div>
                                `;
                            }).join('') : '<div style="font-size:12px; color:#999; text-align:center;">Seja o primeiro a comentar!</div>'}
                        </div>
                        <div style="display:flex; gap:10px;">
                            <input type="text" id="input-comentario-${p.id}" placeholder="Escreva um comentário..." style="flex:1; padding:10px; border-radius:6px; border:1px solid #ccc; font-size:13px;" onkeypress="if(event.key === 'Enter') Workspace.Feed.enviarComentario('${p.id}')">
                            <button class="ws-btn" style="padding:10px 15px;" onclick="Workspace.Feed.enviarComentario('${p.id}')">Enviar</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = html;
    },

    reagir: async (postId, tipo) => {
        try {
            const res = await Workspace.api(`/workspace/posts/${postId}/reacao`, 'PUT', {
                userId: Workspace.usuario.id,
                autorNome: Workspace.usuario.nome || Workspace.usuario.login, // 🔔 Passa o nome para o gatilho de notificação
                tipo: tipo
            });
            if (res && res.success) {
                await Workspace.Feed.carregarPosts(); 
            }
        } catch (e) {}
    },

    apagarPost: async (postId) => {
        if (!confirm("Tem a certeza que deseja apagar esta publicação?")) return;
        try {
            const res = await Workspace.api(`/workspace/posts/${postId}`, 'DELETE');
            if (res && res.success) await Workspace.Feed.carregarPosts(); 
        } catch (e) {}
    },

    apagarComentario: async (postId, comentarioId) => {
        if (!confirm("Apagar este comentário?")) return;
        try {
            const res = await Workspace.api(`/workspace/posts/${postId}/comentarios/${comentarioId}`, 'DELETE');
            if (res && res.success) await Workspace.Feed.carregarPosts(); 
        } catch (e) {}
    },

    toggleComentarios: (id) => {
        const box = document.getElementById(`box-comentarios-${id}`);
        if(box) {
            if (box.style.display === 'none') {
                box.style.display = 'block';
                Workspace.Feed.comentariosAbertos.add(id); // Guarda na memória que abriu
                const input = document.getElementById(`input-comentario-${id}`);
                if(input) input.focus();
            } else {
                box.style.display = 'none';
                Workspace.Feed.comentariosAbertos.delete(id); // Esquece
            }
        }
    },

    enviarComentario: async (postId) => {
        const input = document.getElementById(`input-comentario-${postId}`);
        if(!input) return;
        
        const texto = input.value.trim();
        if(!texto) return;

        const btn = input.nextElementSibling;
        const txtOriginal = btn.innerText;
        btn.innerText = "⏳";
        btn.disabled = true;

        try {
            const res = await Workspace.api(`/workspace/posts/${postId}/comentarios`, 'POST', {
                texto: texto, autorNome: Workspace.usuario.nome || Workspace.usuario.login
            });

            if(res && res.success) {
                input.value = '';
                Workspace.Feed.comentariosAbertos.add(postId); // Mantém aberto
                await Workspace.Feed.carregarPosts(); 
            }
        } catch(e) {} finally {
            if(btn) { btn.innerText = txtOriginal; btn.disabled = false; }
        }
    },

    configurarEventosCriacao: async () => {
        const boxCriarPost = document.getElementById('ws-criar-post');
        if (!boxCriarPost) return;

        if (!document.getElementById('ws-post-destino')) {
            const areaBotoes = boxCriarPost.querySelector('div[style*="justify-content: space-between"]');
            if (areaBotoes) {
                const htmlSelect = `
                    <select id="ws-post-destino" style="padding:8px 12px; border-radius:6px; border:1px solid #ccc; font-size:13px; outline:none; background:#f4f6f7; cursor:pointer; max-width: 150px;">
                        <option value="global">🌍 Público Geral</option>
                    </select>
                `;
                areaBotoes.insertAdjacentHTML('afterbegin', htmlSelect);

                try {
                    const turmas = await Workspace.api('/turmas', 'GET');
                    if (turmas && turmas.length > 0) {
                        const sel = document.getElementById('ws-post-destino');
                        turmas.forEach(t => {
                            sel.innerHTML += `<option value="${t.id}">📚 ${Workspace.Feed.limparTexto(t.nome)}</option>`;
                        });
                    }
                } catch(e) {}
            }
        }

        const btnPublicar = boxCriarPost.querySelector('.ws-btn');
        const inputTexto = boxCriarPost.querySelector('textarea');

        if (btnPublicar && inputTexto) {
            const novoBtn = btnPublicar.cloneNode(true);
            btnPublicar.parentNode.replaceChild(novoBtn, btnPublicar);

            novoBtn.addEventListener('click', async () => {
                const texto = inputTexto.value.trim();
                const anexosLocais = Workspace.Upload ? Workspace.Upload.arquivosAtuais : [];
                
                const selDestino = document.getElementById('ws-post-destino');
                const destino = selDestino ? selDestino.value : 'global';
                const destinoNome = selDestino ? selDestino.options[selDestino.selectedIndex].text.replace('📚 ', '').replace('🌍 ', '') : 'Público Geral';

                if (!texto && anexosLocais.length === 0) {
                    alert("Escreva algo ou anexe um ficheiro primeiro.");
                    return;
                }

                novoBtn.innerText = "⏳ A enviar...";
                novoBtn.disabled = true;

                try {
                    let urlsFinais = [];

                    if (anexosLocais.length > 0) {
                        const formData = new FormData();
                        anexosLocais.forEach(file => formData.append('anexos', file));

                        const uploadRes = await fetch('/api/workspace/upload', {
                            method: 'POST', credentials: 'include', body: formData 
                        });

                        const uploadData = await uploadRes.json();
                        if (uploadData.success) urlsFinais = uploadData.anexos;
                        else throw new Error("Falha no envio dos ficheiros.");
                    }

                    const postRes = await Workspace.api('/workspace/posts', 'POST', {
                        texto: texto,
                        escolaId: Workspace.usuario.escolaId,
                        autorNome: Workspace.usuario.nome || Workspace.usuario.login,
                        autorTipo: Workspace.usuario.tipo,
                        anexos: urlsFinais,
                        destino: destino,
                        destinoNome: destinoNome
                    });

                    if (postRes && postRes.success) {
                        inputTexto.value = '';
                        if (Workspace.Upload) Workspace.Upload.limparAnexos();
                        await Workspace.Feed.carregarPosts(); 
                    } else {
                        throw new Error("Falha ao gravar publicação.");
                    }

                } catch (e) {
                    alert("Falha na publicação.");
                } finally {
                    novoBtn.innerText = "Publicar";
                    novoBtn.disabled = false;
                }
            });
        }
    }
};