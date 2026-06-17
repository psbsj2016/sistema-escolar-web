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
                const anexos = Workspace.Upload ? Workspace.Upload.arquivosAtuais : [];

                if (!texto && anexos.length === 0) {
                    if (window.App && App.showToast) App.showToast("Escreva algo ou anexe um ficheiro antes de publicar.", "warning");
                    return;
                }

                btnPublicar.innerText = "A publicar... ⏳";
                btnPublicar.disabled = true;

                // Aqui entrará a lógica de enviar para o backend (Fase 3)
                console.log("A preparar publicação com:", { texto, anexos });
                
                setTimeout(() => {
                    inputTexto.value = '';
                    if (Workspace.Upload) Workspace.Upload.limparAnexos();
                    btnPublicar.innerText = "Publicar";
                    btnPublicar.disabled = false;
                    if (window.App && App.showToast) App.showToast("Publicado com sucesso!", "success");
                }, 1000);
            });
        }
    }
};