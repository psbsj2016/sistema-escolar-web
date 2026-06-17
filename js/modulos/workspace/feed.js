// js/modulos/workspace/feed.js
window.Workspace = window.Workspace || {};

Workspace.Feed = {
    postsCache: [],

    init: async () => {
        console.log("📚 Motor do Feed iniciado.");
        await Workspace.Feed.carregarPosts();
        Workspace.Feed.configurarEventosCriacao();
    },

    carregarPosts: async () => {
        const container = document.getElementById('ws-posts-area');
        if (!container) return;

        // Simulando a busca no Backend (Na Fase 3 ligaremos à API real)
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">A carregar publicações... ⏳</div>';

        try {
            // Exemplo de como será a chamada real:
            // const posts = await Workspace.api('/workspace/posts', 'GET');
            const posts = []; // Temporariamente vazio até criarmos a rota no Backend

            if (posts.length === 0) {
                container.innerHTML = `
                    <div class="ws-card" style="text-align: center; padding: 40px; color: #7f8c8d;">
                        <div style="font-size: 40px; margin-bottom: 10px;">📭</div>
                        <h3 style="margin: 0 0 5px 0;">O mural está vazio</h3>
                        <p style="margin: 0; font-size: 13px;">Seja o primeiro a partilhar uma atividade ou material com a turma!</p>
                    </div>`;
                return;
            }

            Workspace.Feed.renderizarLista(posts);
        } catch (error) {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: #e74c3c;">Erro ao carregar o feed.</div>';
        }
    },

    renderizarLista: (posts) => {
        const container = document.getElementById('ws-posts-area');
        // Lógica de desenho dos posts entrará aqui quando tivermos dados
        container.innerHTML = posts.map(p => `<div>Post ${p.id}</div>`).join('');
    },

   configurarEventosCriacao: () => {
        const btnPublicar = document.querySelector('#ws-criar-post .ws-btn');
        const inputTexto = document.querySelector('#ws-criar-post textarea');

        if (btnPublicar && inputTexto) {
            btnPublicar.addEventListener('click', async () => {
                const texto = inputTexto.value.trim();
                const anexosLocais = Workspace.Upload ? Workspace.Upload.arquivosAtuais : [];

                if (!texto && anexosLocais.length === 0) {
                    if (window.App && App.showToast) App.showToast("Escreva algo ou anexe um ficheiro.", "warning");
                    return;
                }

                btnPublicar.innerText = "A publicar... ⏳";
                btnPublicar.disabled = true;

                try {
                    let urlsFinais = [];

                    // ☁️ PASSO 1: Enviar ficheiros para a Nuvem (se existirem)
                    if (anexosLocais.length > 0) {
                        const formData = new FormData();
                        anexosLocais.forEach(file => formData.append('anexos', file));

                        // O fetch direto é usado aqui porque a nossa api() injeta JSON, e ficheiros precisam de FormData
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

                    // 📝 PASSO 2: Enviar a publicação para o MongoDB
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
                        await Workspace.Feed.carregarPosts(); // Recarrega o feed para mostrar o novo post
                    } else {
                        throw new Error("Falha ao gravar publicação.");
                    }

                } catch (e) {
                    console.error(e);
                    if (window.App && App.showToast) App.showToast(e.message || "Falha na publicação.", "error");
                } finally {
                    btnPublicar.innerText = "Publicar";
                    btnPublicar.disabled = false;
                }
            });
        }
    }
};