// js/modulos/workspace/feed.js
window.Workspace = window.Workspace || {};

Workspace.Feed = {
    postsCache: [],
    comentariosAbertos: new Set(),

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

    // 🌟 NOVA FUNÇÃO: VISUALIZADOR DE IMAGENS INTERNO (LIGHTBOX)
    abrirImagemInteira: (url) => {
        const id = 'ws-lightbox-modal';
        if(document.getElementById(id)) document.getElementById(id).remove();

        const overlay = document.createElement('div');
        overlay.id = id;
        // Fundo escuro com desfoque (blur)
        overlay.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:10005; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(5px); opacity:0; transition: opacity 0.2s ease-in-out;";
        
        // Estrutura da Imagem Ampliada
        overlay.innerHTML = `
            <span style="position:absolute; top:20px; right:30px; color:white; font-size:40px; cursor:pointer; font-weight:bold; transition:0.2s;" onmouseover="this.style.color='#e74c3c'" onmouseout="this.style.color='white'" onclick="document.getElementById('${id}').style.opacity='0'; setTimeout(()=>document.getElementById('${id}').remove(), 200);" title="Fechar">&times;</span>
            <img src="${url}" style="max-width:90vw; max-height:90vh; border-radius:8px; box-shadow:0 10px 40px rgba(0,0,0,0.6); transform:scale(0.95); transition: transform 0.2s ease-out;">
        `;
        
        document.body.appendChild(overlay);

        // Dispara a animação visual de entrada
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            overlay.querySelector('img').style.transform = 'scale(1)';
        });

        // Fechar ao clicar fora da imagem (no fundo escuro)
        overlay.addEventListener('click', (e) => {
            if(e.target === overlay) {
                overlay.style.opacity = '0';
                setTimeout(()=> overlay.remove(), 200);
            }
        });
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

            // 📸 AJUSTE AQUI: Fim do corte, imagem inteira e com chamada para o Lightbox!
            if (anexo.tipo.includes('image')) {
                html += `<img src="${urlCorrigida}" style="width:100%; max-height:400px; border-radius:8px; border:1px solid #eee; object-fit:contain; background:#f9f9f9; cursor:pointer; transition:0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'" onclick="Workspace.Feed.abrirImagemInteira('${urlCorrigida}')" title="Clique para ampliar">`;
            } else if (anexo.tipo.includes('video')) {
                html += `<video controls style="width:100%; max-height:400px; border-radius:8px; border:1px solid #eee; margin-top:10px; background:#000;"><source src="${urlCorrigida}" type="${anexo.tipo}">O seu navegador não suporta vídeos.</video>`;
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
            const avatarPost = window.Workspace.renderizarAvatar(p.autorNome, 45);
            const textoSeguro = Workspace.Feed.limparTexto(p.texto).replace(/\n/g, '<br>');

            const ehDonoOuGestor = (Workspace.usuario.nome === p.autorNome || Workspace.usuario.login === p.autorNome || Workspace.usuario.tipo === 'Gestor');
            const btnApagar = ehDonoOuGestor ? `<span style="cursor:pointer; color:#e74c3c; font-size:12px; font-weight:bold; transition:0.2s;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'" onclick="Workspace.Feed.apagarPost('${p.id}')">🗑️ Apagar</span>` : '';

            let destinoBadge = p.destino === 'global' 
                ? `<span style="font-size:10px; background:#e8f4f8; color:#3498db; padding:2px 6px; border-radius:4px; margin-left:5px; font-weight:bold;">🌍 Público Geral</span>`
                : `<span style="font-size:10px; background:#f4e8f8; color:#8e44ad; padding:2px 6px; border-radius:4px; margin-left:5px; font-weight:bold;">📚 ${Workspace.Feed.limparTexto(p.destinoNome)}</span>`;

            const likesArr = Array.isArray(p.likes) ? p.likes : [];
            const dislikesArr = Array.isArray(p.dislikes) ? p.dislikes : [];
            const euCurti = likesArr.includes(meuId);
            const euNaoCurti = dislikesArr.includes(meuId);
            
            const displayComentarios = Workspace.Feed.comentariosAbertos.has(p.id) ? 'block' : 'none';

            return `
                <div class="ws-card" id="post-${p.id}" style="animation: fadeIn 0.4s ease;">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:15px;">
                        ${avatarPost}
                        <div>
                            <div style="font-weight:700; color:#2c3e50; font-size:15px;">${Workspace.Feed.limparTexto(p.autorNome)} <span style="font-size:11px; color:#aaa; margin-left:5px;">• ${p.autorTipo}</span></div>
                            <div style="font-size:12px; color:#7f8c8d; margin-top:2px;">${dataFormatada} ${destinoBadge}</div>
                        </div>
                    </div>
                    
                    <div style="font-size:14px; color:#333; line-height:1.6;">${textoSeguro}</div>
                    ${Workspace.Feed.renderizarAnexos(p.anexos)}
                    
                    <div style="margin-top:20px; padding-top:15px; border-top:1px solid #eee; display:flex; justify-content:space-between; align-items:center;">
                        
                        <div style="display:flex; gap:10px; flex-wrap:wrap;">
                            <button id="btn-like-${p.id}" style="background:${euCurti ? '#eafaf1' : '#f0f2f5'}; color:${euCurti ? '#27ae60' : '#555'}; border: 1px solid ${euCurti ? '#27ae60' : 'transparent'}; padding:8px 16px; border-radius:20px; font-size:13px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px; transition:0.2s;" onmouseover="this.style.filter='brightness(0.95)'" onmouseout="this.style.filter='brightness(1)'" onclick="Workspace.Feed.reagir('${p.id}', 'like')">
                                👍 <span id="count-like-${p.id}">${likesArr.length}</span>
                            </button>
                            
                            <button id="btn-dislike-${p.id}" style="background:${euNaoCurti ? '#fdf2f2' : '#f0f2f5'}; color:${euNaoCurti ? '#e74c3c' : '#555'}; border: 1px solid ${euNaoCurti ? '#e74c3c' : 'transparent'}; padding:8px 16px; border-radius:20px; font-size:13px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px; transition:0.2s;" onmouseover="this.style.filter='brightness(0.95)'" onmouseout="this.style.filter='brightness(1)'" onclick="Workspace.Feed.reagir('${p.id}', 'dislike')">
                                👎 <span id="count-dislike-${p.id}">${dislikesArr.length}</span>
                            </button>
                            
                            <button style="background:#f0f2f5; color:#555; border:none; padding:8px 16px; border-radius:20px; font-size:13px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px; transition:0.2s;" onmouseover="this.style.filter='brightness(0.95)'" onmouseout="this.style.filter='brightness(1)'" onclick="Workspace.Feed.toggleComentarios('${p.id}')">
                                💬 <span id="count-comment-${p.id}">${p.comentarios ? p.comentarios.length : 0}</span>
                            </button>
                        </div>
                        
                        ${btnApagar}
                    </div>

                    <div id="box-comentarios-${p.id}" style="display:${displayComentarios}; margin-top:15px; padding-top:15px; border-top:1px dashed #ddd;">
                        <div id="lista-comentarios-${p.id}" style="max-height: 250px; overflow-y: auto; margin-bottom: 15px; display: flex; flex-direction: column; gap: 8px;">
                            ${p.comentarios && p.comentarios.length > 0 ? p.comentarios.map(c => {
                                const ehDonoComentario = (c.autorNome === Workspace.usuario.nome || Workspace.usuario.login === c.autorNome || Workspace.usuario.tipo === 'Gestor');
                                const avatarComentario = window.Workspace.renderizarAvatar(c.autorNome, 30);
                                
                                return `
                                <div id="comentario-${c.id}" style="background: #fdfdfd; border:1px solid #eee; padding: 10px 15px; border-radius: 12px; font-size: 13px; position:relative; padding-right: 35px; display:flex; gap:10px; align-items:flex-start;">
                                    ${avatarComentario}
                                    <div style="flex:1;">
                                        <strong style="color: #2c3e50; display:block; margin-bottom:2px;">${Workspace.Feed.limparTexto(c.autorNome)}</strong> 
                                        <span style="color: #444; line-height:1.4;">${Workspace.Feed.limparTexto(c.texto)}</span>
                                    </div>
                                    ${ehDonoComentario ? `<span style="position:absolute; right:12px; top:12px; cursor:pointer; color:#e74c3c; font-size:14px;" title="Apagar comentário" onclick="Workspace.Feed.apagarComentario('${p.id}', '${c.id}')">🗑️</span>` : ''}
                                </div>
                                `;
                            }).join('') : '<div style="font-size:12px; color:#999; text-align:center;">Seja o primeiro a comentar!</div>'}
                        </div>
                        <div style="display:flex; gap:10px;">
                            <input type="text" id="input-comentario-${p.id}" placeholder="Escreva um comentário..." style="flex:1; padding:10px 15px; border-radius:20px; border:1px solid #ddd; font-size:13px; outline:none; background:#f9f9f9;" onfocus="this.style.borderColor='#3498db'" onblur="this.style.borderColor='#ddd'" onkeypress="if(event.key === 'Enter') Workspace.Feed.enviarComentario('${p.id}')">
                            <button class="ws-btn" style="padding:10px 20px; border-radius:20px;" onclick="Workspace.Feed.enviarComentario('${p.id}')">Enviar</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = html;
    },

    reagir: async (postId, tipoDesejado) => {
        const post = Workspace.Feed.postsCache.find(p => p.id === postId);
        if (!post) return;

        const meuId = Workspace.usuario.id;
        if(!post.likes) post.likes = [];
        if(!post.dislikes) post.dislikes = [];

        const jaCurtiu = post.likes.includes(meuId);
        const jaNaoCurtiu = post.dislikes.includes(meuId);

        let acaoFinal = tipoDesejado;
        if (tipoDesejado === 'like' && jaCurtiu) acaoFinal = 'none';
        if (tipoDesejado === 'dislike' && jaNaoCurtiu) acaoFinal = 'none';

        post.likes = post.likes.filter(id => id !== meuId);
        post.dislikes = post.dislikes.filter(id => id !== meuId);

        if (acaoFinal === 'like') post.likes.push(meuId);
        if (acaoFinal === 'dislike') post.dislikes.push(meuId);

        const btnLike = document.getElementById(`btn-like-${postId}`);
        const btnDislike = document.getElementById(`btn-dislike-${postId}`);
        const countLike = document.getElementById(`count-like-${postId}`);
        const countDislike = document.getElementById(`count-dislike-${postId}`);

        if (btnLike && countLike) {
            const isLike = acaoFinal === 'like';
            btnLike.style.background = isLike ? '#eafaf1' : '#f0f2f5';
            btnLike.style.color = isLike ? '#27ae60' : '#555';
            btnLike.style.border = isLike ? '1px solid #27ae60' : '1px solid transparent';
            countLike.innerText = post.likes.length;
        }

        if (btnDislike && countDislike) {
            const isDislike = acaoFinal === 'dislike';
            btnDislike.style.background = isDislike ? '#fdf2f2' : '#f0f2f5';
            btnDislike.style.color = isDislike ? '#e74c3c' : '#555';
            btnDislike.style.border = isDislike ? '1px solid #e74c3c' : '1px solid transparent';
            countDislike.innerText = post.dislikes.length;
        }

        try {
            await Workspace.api(`/workspace/posts/${postId}/reacao`, 'PUT', {
                userId: meuId,
                autorNome: Workspace.usuario.nome || Workspace.usuario.login,
                tipo: acaoFinal
            });
        } catch (e) {
            if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Falha ao registar interação na base de dados.", "warning");
        }
    },

    apagarPost: async (postId) => {
        if (!confirm("Tem a certeza que deseja apagar esta publicação?")) return;
        
        const postCard = document.getElementById(`post-${postId}`);
        if(postCard) postCard.style.display = 'none';

        try {
            const res = await Workspace.api(`/workspace/posts/${postId}`, 'DELETE');
            if (res && res.success) {
                if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Publicação removida com sucesso!", "success");
            } else {
                if(postCard) postCard.style.display = 'block'; 
                if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Erro ao apagar publicação.", "error");
            }
        } catch (e) {
            if(postCard) postCard.style.display = 'block';
            if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Erro de comunicação.", "error");
        }
    },

    apagarComentario: async (postId, comentarioId) => {
        if (!confirm("Apagar este comentário?")) return;
        
        const comEl = document.getElementById(`comentario-${comentarioId}`);
        if (comEl) comEl.style.display = 'none';

        const post = Workspace.Feed.postsCache.find(p => p.id === postId);
        if (post && post.comentarios) {
            post.comentarios = post.comentarios.filter(c => c.id !== comentarioId);
            const countComment = document.getElementById(`count-comment-${postId}`);
            if (countComment) countComment.innerText = post.comentarios.length;
        }

        try {
            const res = await Workspace.api(`/workspace/posts/${postId}/comentarios/${comentarioId}`, 'DELETE');
            if (!res || !res.success) {
                if (comEl) comEl.style.display = 'flex';
            }
        } catch (e) {
            if (comEl) comEl.style.display = 'flex';
        }
    },

    toggleComentarios: (id) => {
        const box = document.getElementById(`box-comentarios-${id}`);
        if(box) {
            if (box.style.display === 'none') {
                box.style.display = 'block';
                Workspace.Feed.comentariosAbertos.add(id); 
                const input = document.getElementById(`input-comentario-${id}`);
                if(input) input.focus();
            } else {
                box.style.display = 'none';
                Workspace.Feed.comentariosAbertos.delete(id); 
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
                
                const listaComentarios = document.getElementById(`lista-comentarios-${postId}`);
                const countComment = document.getElementById(`count-comment-${postId}`);
                
                const c = {
                    id: res.comentarioId || Date.now().toString(),
                    autorNome: Workspace.usuario.nome || Workspace.usuario.login,
                    texto: texto
                };

                const avatarComentario = window.Workspace.renderizarAvatar(c.autorNome, 30);
                
                if(listaComentarios.innerHTML.includes('Seja o primeiro')) {
                    listaComentarios.innerHTML = '';
                }

                const novoComentarioHTML = `
                <div id="comentario-${c.id}" style="background: #fdfdfd; border:1px solid #eee; padding: 10px 15px; border-radius: 12px; font-size: 13px; position:relative; padding-right: 35px; display:flex; gap:10px; align-items:flex-start; animation: fadeIn 0.4s ease;">
                    ${avatarComentario}
                    <div style="flex:1;">
                        <strong style="color: #2c3e50; display:block; margin-bottom:2px;">${Workspace.Feed.limparTexto(c.autorNome)}</strong> 
                        <span style="color: #444; line-height:1.4;">${Workspace.Feed.limparTexto(c.texto)}</span>
                    </div>
                    <span style="position:absolute; right:12px; top:12px; cursor:pointer; color:#e74c3c; font-size:14px;" title="Apagar comentário" onclick="Workspace.Feed.apagarComentario('${postId}', '${c.id}')">🗑️</span>
                </div>`;

                listaComentarios.insertAdjacentHTML('beforeend', novoComentarioHTML);
                listaComentarios.scrollTop = listaComentarios.scrollHeight;

                if(countComment) {
                    const post = Workspace.Feed.postsCache.find(p => p.id === postId);
                    if(post) {
                        if(!post.comentarios) post.comentarios = [];
                        post.comentarios.push(c);
                        countComment.innerText = post.comentarios.length;
                    }
                }
                Workspace.Feed.comentariosAbertos.add(postId);
            } else {
                if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Erro ao enviar comentário.", "error");
            }
        } catch(e) {
            if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Erro de comunicação.", "error");
        } finally {
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
                    if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Escreva algo ou anexe um ficheiro primeiro.", "warning");
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
                        if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Publicado com sucesso!", "success");
                        await Workspace.Feed.carregarPosts(); 
                    } else {
                        throw new Error("Falha ao gravar publicação.");
                    }

                } catch (e) {
                    if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Falha na publicação.", "error");
                } finally {
                    novoBtn.innerText = "Publicar";
                    novoBtn.disabled = false;
                }
            });
        }
    }
};