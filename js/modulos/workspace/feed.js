// js/modulos/workspace/feed.js
window.Workspace = window.Workspace || {};

Workspace.Feed = {
    postsCache: [],

    init: async () => {
        console.log("📚 Motor do Feed ligado à API.");
        await Workspace.Feed.carregarPosts();
        Workspace.Feed.configurarEventosCriacao();
    },

    carregarPosts: async () => {
        const container = document.getElementById('ws-posts-area');
        if (!container) return;

        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">A procurar publicações na nuvem... ⏳</div>';

        try {
            const posts = await Workspace.api('/workspace/posts', 'GET');

            if (!posts || posts.length === 0) {
                container.innerHTML = `
                    <div class="ws-card" style="text-align: center; padding: 40px; color: #7f8c8d;">
                        <div style="font-size: 40px; margin-bottom: 10px;">📭</div>
                        <h3 style="margin: 0 0 5px 0;">O mural está vazio</h3>
                        <p style="margin: 0; font-size: 13px;">Seja o primeiro a partilhar uma atividade ou material com a turma!</p>
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
            if (anexo.tipo.includes('image')) {
                html += `<a href="${anexo.url}" target="_blank" style="flex:1; min-width:150px; max-width:250px;"><img src="${anexo.url}" style="width:100%; border-radius:8px; border:1px solid #eee; object-fit:cover; aspect-ratio:16/9; transition:0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'"></a>`;
            } else if (anexo.tipo.includes('video')) {
                html += `<video controls style="width:100%; max-width:400px; border-radius:8px; border:1px solid #eee; margin-top:10px; background:#000;"><source src="${anexo.url}" type="${anexo.tipo}">O seu navegador não suporta vídeos.</video>`;
            } else {
                let icone = anexo.tipo.includes('pdf') ? '📕' : '📎';
                html += `
                    <a href="${anexo.url}" target="_blank" style="display:flex; align-items:center; gap:10px; background:#f4f6f7; padding:10px 15px; border-radius:8px; text-decoration:none; color:#2c3e50; border:1px solid #ddd; width:100%; max-width:300px; transition:0.2s;" onmouseover="this.style.background='#e5e8e8'" onmouseout="this.style.background='#f4f6f7'">
                        <span style="font-size:24px;">${icone}</span>
                        <span style="flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:13px; font-weight:600;">${anexo.nome}</span>
                        <span style="color:#3498db; font-size:12px; font-weight:bold;">Abrir ↗</span>
                    </a>`;
            }
        });
        
        html += '</div>';
        return html;
    },

    // 🚀 NOVO: Sanitização para evitar injeção de código
    limparTexto: (txt) => {
        if(!txt) return '';
        return txt.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },

    renderizarLista: (posts) => {
        const container = document.getElementById('ws-posts-area');
        
        const html = posts.map(p => {
            const dataFormatada = new Date(p.dataCriacao).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' });
            const avatar = p.autorNome.charAt(0).toUpperCase();
            const textoSeguro = Workspace.Feed.limparTexto(p.texto).replace(/\n/g, '<br>');

            // Verifica se o usuário atual é o autor do post OU se é um Gestor (para poder apagar)
            const ehDonoOuGestor = (Workspace.usuario.nome === p.autorNome || Workspace.usuario.login === p.autorNome || Workspace.usuario.tipo === 'Gestor');
            const btnApagar = ehDonoOuGestor 
                ? `<span style="cursor:pointer; color:#e74c3c; font-size:12px; font-weight:bold; transition:0.2s;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'" onclick="Workspace.Feed.apagarPost('${p.id}')">🗑️ Apagar</span>` 
                : '';

            return `
                <div class="ws-card" style="animation: fadeIn 0.4s ease;">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:15px;">
                        <div style="width:40px; height:40px; border-radius:50%; background:#2c3e50; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:16px;">${avatar}</div>
                        <div>
                            <div style="font-weight:700; color:#2c3e50; font-size:15px;">${p.autorNome} <span style="font-size:11px; background:#e8f4f8; color:#3498db; padding:2px 6px; border-radius:4px; margin-left:5px;">${p.autorTipo}</span></div>
                            <div style="font-size:12px; color:#7f8c8d;">${dataFormatada}</div>
                        </div>
                    </div>
                    
                    <div style="font-size:14px; color:#333; line-height:1.6;">${textoSeguro}</div>
                    ${Workspace.Feed.renderizarAnexos(p.anexos)}
                    
                    <div style="margin-top:20px; padding-top:15px; border-top:1px solid #eee; display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; gap:20px; color:#666; font-size:13px; font-weight:600;">
                            <span style="cursor:pointer; display:flex; align-items:center; gap:5px; transition:0.2s;" onmouseover="this.style.color='#3498db'" onmouseout="this.style.color='#666'" onclick="Workspace.Feed.darLike('${p.id}')">👍 Gosto (<span id="likes-count-${p.id}">${p.likes || 0}</span>)</span>
                            <span style="cursor:pointer; display:flex; align-items:center; gap:5px; transition:0.2s;" onmouseover="this.style.color='#3498db'" onmouseout="this.style.color='#666'" onclick="Workspace.Feed.toggleComentarios('${p.id}')">💬 Comentar (${p.comentarios ? p.comentarios.length : 0})</span>
                        </div>
                        ${btnApagar}
                    </div>

                    <div id="box-comentarios-${p.id}" style="display:none; margin-top:15px; padding-top:15px; border-top:1px dashed #ddd;">
                        <div style="max-height: 250px; overflow-y: auto; margin-bottom: 15px; display: flex; flex-direction: column; gap: 10px;">
                            ${p.comentarios && p.comentarios.length > 0 ? p.comentarios.map(c => `
                                <div style="background: #f4f6f7; padding: 10px 15px; border-radius: 12px; font-size: 13px;">
                                    <strong style="color: #2c3e50;">${Workspace.Feed.limparTexto(c.autorNome)}:</strong> 
                                    <span style="color: #444;">${Workspace.Feed.limparTexto(c.texto)}</span>
                                </div>
                            `).join('') : '<div style="font-size:12px; color:#999; text-align:center;">Seja o primeiro a comentar!</div>'}
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

    // 🚀 NOVO: Função para registar o "Gosto"
    darLike: async (postId) => {
        try {
            const res = await Workspace.api(`/workspace/posts/${postId}/like`, 'PUT');
            if (res && res.success) {
                // Atualiza o número visualmente sem recarregar a página toda
                const el = document.getElementById(`likes-count-${postId}`);
                if (el) el.innerText = parseInt(el.innerText) + 1;
            }
        } catch (e) {
            console.error("Erro ao dar gosto", e);
        }
    },

    // 🚀 NOVO: Função para o dono ou o Gestor apagarem o Post
    apagarPost: async (postId) => {
        if (!confirm("Tem a certeza que deseja apagar esta publicação? A ação não pode ser desfeita.")) return;
        
        try {
            const res = await Workspace.api(`/workspace/posts/${postId}`, 'DELETE');
            if (res && res.success) {
                if (window.App && App.showToast) App.showToast("Publicação apagada com sucesso.", "success");
                await Workspace.Feed.carregarPosts(); // Puxa o mural limpo novamente
            } else {
                if (window.App && App.showToast) App.showToast("Erro ao apagar publicação.", "error");
            }
        } catch (e) {
            console.error("Erro ao apagar", e);
        }
    },

    // 🚀 NOVO: Função para abrir e fechar a área de comentários
    toggleComentarios: (id) => {
        const box = document.getElementById(`box-comentarios-${id}`);
        if(box) {
            box.style.display = box.style.display === 'none' ? 'block' : 'none';
            if(box.style.display === 'block') {
                const input = document.getElementById(`input-comentario-${id}`);
                if(input) input.focus();
            }
        }
    },

    // 🚀 NOVO: Função para enviar o comentário para o backend
    enviarComentario: async (postId) => {
        const input = document.getElementById(`input-comentario-${postId}`);
        if(!input) return;
        
        const texto = input.value.trim();
        if(!texto) {
            if (window.App && App.showToast) App.showToast("Escreva algo no comentário.", "warning");
            return;
        }

        const btn = input.nextElementSibling;
        const txtOriginal = btn.innerText;
        btn.innerText = "⏳";
        btn.disabled = true;

        try {
            const res = await Workspace.api(`/workspace/posts/${postId}/comentarios`, 'POST', {
                texto: texto,
                autorNome: Workspace.usuario.nome || Workspace.usuario.login
            });

            if(res && res.success) {
                input.value = '';
                await Workspace.Feed.carregarPosts(); // Recarrega os posts para atualizar a lista
                setTimeout(() => Workspace.Feed.toggleComentarios(postId), 50); // Garante que a gaveta fica aberta após atualizar
            } else {
                if (window.App && App.showToast) App.showToast("Erro ao comentar.", "error");
            }
        } catch(e) {
            if (window.App && App.showToast) App.showToast("Erro de comunicação.", "error");
        } finally {
            if(btn) {
                btn.innerText = txtOriginal;
                btn.disabled = false;
            }
        }
    },

    configurarEventosCriacao: () => {
        const btnPublicar = document.querySelector('#ws-criar-post .ws-btn');
        const inputTexto = document.querySelector('#ws-criar-post textarea');

        if (btnPublicar && inputTexto) {
            const novoBtn = btnPublicar.cloneNode(true);
            btnPublicar.parentNode.replaceChild(novoBtn, btnPublicar);

            novoBtn.addEventListener('click', async () => {
                const texto = inputTexto.value.trim();
                const anexosLocais = Workspace.Upload ? Workspace.Upload.arquivosAtuais : [];

                if (!texto && anexosLocais.length === 0) {
                    if (window.App && App.showToast) App.showToast("Escreva algo ou anexe um ficheiro primeiro.", "warning");
                    return;
                }

                novoBtn.innerText = "A enviar para a Nuvem... ⏳";
                novoBtn.disabled = true;

                try {
                    let urlsFinais = [];

                    if (anexosLocais.length > 0) {
                        const formData = new FormData();
                        anexosLocais.forEach(file => formData.append('anexos', file));

                        const uploadRes = await fetch('/api/workspace/upload', {
                            method: 'POST',
                            credentials: 'include',
                            body: formData 
                        });

                        const uploadData = await uploadRes.json();
                        if (uploadData.success) {
                            urlsFinais = uploadData.anexos;
                        } else {
                            throw new Error(uploadData.error || "Falha no envio dos ficheiros.");
                        }
                    }

                    novoBtn.innerText = "A gravar publicação... ⏳";

                    const postRes = await Workspace.api('/workspace/posts', 'POST', {
                        texto: texto,
                        escolaId: Workspace.usuario.escolaId,
                        autorNome: Workspace.usuario.nome || Workspace.usuario.login,
                        autorTipo: Workspace.usuario.tipo,
                        anexos: urlsFinais
                    });

                    if (postRes && postRes.success) {
                        if (window.App && App.showToast) App.showToast("Publicado com sucesso!", "success");
                        inputTexto.value = '';
                        if (Workspace.Upload) Workspace.Upload.limparAnexos();
                        await Workspace.Feed.carregarPosts(); 
                    } else {
                        throw new Error("Falha ao gravar publicação.");
                    }

                } catch (e) {
                    console.error(e);
                    if (window.App && App.showToast) App.showToast(e.message || "Falha na publicação.", "error");
                } finally {
                    novoBtn.innerText = "Publicar";
                    novoBtn.disabled = false;
                }
            });
        }
    }
};