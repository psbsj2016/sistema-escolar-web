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
            // 🌐 AGORA SIM: Chamada real à base de dados!
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

    // 🎨 O "Mágico" que decide como desenhar o ficheiro (Vídeo, Imagem ou Documento)
    renderizarAnexos: (anexos) => {
        if (!anexos || anexos.length === 0) return '';
        
        let html = '<div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:15px;">';
        
        anexos.forEach(anexo => {
            // O Cloudinary devolve a url e o tipo (ex: image/jpeg, video/mp4, application/pdf)
            if (anexo.tipo.includes('image')) {
                html += `<a href="${anexo.url}" target="_blank" style="flex:1; min-width:150px; max-width:250px;"><img src="${anexo.url}" style="width:100%; border-radius:8px; border:1px solid #eee; object-fit:cover; aspect-ratio:16/9; transition:0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'"></a>`;
            } else if (anexo.tipo.includes('video')) {
                html += `<video controls style="width:100%; max-width:400px; border-radius:8px; border:1px solid #eee; margin-top:10px; background:#000;"><source src="${anexo.url}" type="${anexo.tipo}">O seu navegador não suporta vídeos.</video>`;
            } else {
                // PDFs, Word, Excel, etc...
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

    renderizarLista: (posts) => {
        const container = document.getElementById('ws-posts-area');
        
        const html = posts.map(p => {
            const dataFormatada = new Date(p.dataCriacao).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' });
            const avatar = p.autorNome.charAt(0).toUpperCase();
            
            // Tratamento contra XSS básico, mantendo quebras de linha
            const textoSeguro = (p.texto || '').replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, '<br>');

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
                    
                    <div style="margin-top:20px; padding-top:15px; border-top:1px solid #eee; display:flex; gap:20px; color:#666; font-size:13px; font-weight:600;">
                        <span style="cursor:pointer; display:flex; align-items:center; gap:5px; transition:0.2s;" onmouseover="this.style.color='#3498db'" onmouseout="this.style.color='#666'" onclick="alert('Funcionalidade de Gosto na próxima fase!')">👍 Gosto (${p.likes || 0})</span>
                        <span style="cursor:pointer; display:flex; align-items:center; gap:5px; transition:0.2s;" onmouseover="this.style.color='#3498db'" onmouseout="this.style.color='#666'" onclick="alert('Área de comentários na próxima fase!')">💬 Comentar (${p.comentarios ? p.comentarios.length : 0})</span>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = html;
    },

    configurarEventosCriacao: () => {
        const btnPublicar = document.querySelector('#ws-criar-post .ws-btn');
        const inputTexto = document.querySelector('#ws-criar-post textarea');

        if (btnPublicar && inputTexto) {
            // Garantimos que não duplicamos eventos caso o init() rode duas vezes
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

                    // ☁️ PASSO 1: Enviar ficheiros para o Cloudinary (se existirem)
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

                    // 📝 PASSO 2: Enviar a publicação com os Links para o MongoDB
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
                        await Workspace.Feed.carregarPosts(); // Puxa os dados novos instantaneamente!
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