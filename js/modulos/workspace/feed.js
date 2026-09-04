// js/modulos/workspace/feed.js
window.Workspace = window.Workspace || {};

Workspace.Feed = {
    todosOsPosts: [],
    postsCache: [],
    comentariosAbertos: new Set(),
    paginaAtual: 1,
    observer: null,
    videoObserver: null,
    listenerFechamentoConfigurado: false,
    listenerAnimacaoConfigurado: false,
    filtroAtivo: 'todos', 

    init: async () => {
        console.log("📚 Motor do Feed ligado à API.");
        Workspace.Feed.injetarCSSAnimacoes(); 
        Workspace.Feed.injetarModaisGlobais(); 
        Workspace.Feed.injetarBotaoImersao(); // 🚀 NOVO: Injeta o botão da Imersão Específica
        await Workspace.Feed.carregarPosts();
        Workspace.Feed.configurarEventosCriacao();
        Workspace.Feed.iniciarRelogioTempos(); 
        
        Workspace.Feed.conectarTempoReal();
        
        if (!Workspace.Feed.listenerFechamentoConfigurado) {
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.ws-menu-ancora')) Workspace.Feed.fecharMenus();
            });
            Workspace.Feed.listenerFechamentoConfigurado = true;
        }
    },

   // 🚀 NOVO: Radar Persistente para Injetar o Botão Mágico
   injetarBotaoImersao: () => {
        const tentarInjetar = setInterval(() => {
            const filterBar = document.getElementById('ws-feed-filter-bar');
            const areaDePosts = document.getElementById('ws-posts-area');
            const localAlvo = filterBar || (areaDePosts ? areaDePosts.parentNode : null);

            if (localAlvo && !document.getElementById('ws-grupo-botoes-imersao')) {
                const wrapper = document.createElement('div');
                wrapper.id = 'ws-grupo-botoes-imersao';
                wrapper.style.cssText = 'display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; width: 100%;';

                const btnImersao = document.createElement('button');
                btnImersao.className = 'ws-filter-chip';
                btnImersao.style.cssText = 'background: linear-gradient(135deg, #3b82f6, #8b5cf6) !important; color: white !important; border: none !important; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4) !important; font-weight: 800 !important; padding: 10px 18px !important; font-size: 14px !important; border-radius: 20px !important; cursor: pointer !important; display: inline-flex !important; align-items: center !important; flex-shrink: 0 !important;';
                btnImersao.innerHTML = '🌌 Imersão Específica';
                btnImersao.onclick = () => Workspace.Feed.abrirImersao();

                const btnMusica = document.createElement('button');
                btnMusica.className = 'ws-filter-chip';
                btnMusica.style.cssText = 'background: linear-gradient(135deg, #ec4899, #f43f5e) !important; color: white !important; border: none !important; box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4) !important; font-weight: 800 !important; padding: 10px 18px !important; font-size: 14px !important; border-radius: 20px !important; cursor: pointer !important; display: inline-flex !important; align-items: center !important; flex-shrink: 0 !important;';
                btnMusica.innerHTML = '🎶 Inglês com Música';
                btnMusica.onclick = () => Workspace.Feed.abrirImersaoMusical();

                wrapper.appendChild(btnImersao);
                wrapper.appendChild(btnMusica);
                
                if (filterBar) filterBar.insertBefore(wrapper, filterBar.firstChild);
                else if (areaDePosts) localAlvo.insertBefore(wrapper, areaDePosts);

                clearInterval(tentarInjetar); 
            }
        }, 500);
        setTimeout(() => clearInterval(tentarInjetar), 10000);
    },

    conectarTempoReal: () => {
        const escolaId = Workspace.usuario ? Workspace.usuario.escolaId : 'DEFAULT';
        const evtSource = new EventSource(`/api/workspace/stream?escolaId=${escolaId}`);
        
        evtSource.onmessage = (event) => {
            try {
                const dados = JSON.parse(event.data);
                if (dados.type === 'POST_APAGADO') {
                    const idDoPost = String(dados.postId);
                    const elementoHTML = document.getElementById(`post-${idDoPost}`);
                    if (elementoHTML) {
                        elementoHTML.remove(); 
                    }
                    Workspace.Feed.todosOsPosts = Workspace.Feed.todosOsPosts.filter(p => String(p.id) !== idDoPost);
                    Workspace.Feed.postsCache = Workspace.Feed.postsCache.filter(p => String(p.id) !== idDoPost);
                }
            } catch (err) {}
        };
    },

    iniciarRelogioTempos: () => {
        setInterval(() => {
            document.querySelectorAll('.ws-time-ago').forEach(el => {
                const dataTime = el.getAttribute('data-time');
                if (dataTime) el.innerText = Workspace.Feed.calcularTempoRelativo(dataTime);
            });
        }, 60000); 
    },

    sincronizarPostSilencioso: async (postId) => {
        try {
            const postAtualizado = await Workspace.api(`/workspace/posts/${postId}`, 'GET');
            if (postAtualizado && !postAtualizado.error) {
                const indexCache = Workspace.Feed.postsCache.findIndex(p => String(p.id) === String(postId));
                if(indexCache !== -1) Workspace.Feed.postsCache[indexCache] = postAtualizado;

                const indexTodos = Workspace.Feed.todosOsPosts.findIndex(p => String(p.id) === String(postId));
                if(indexTodos !== -1) Workspace.Feed.todosOsPosts[indexTodos] = postAtualizado;

                const meuId = Workspace.usuario.id;

                const btnLike = document.getElementById(`btn-like-${postId}`);
                const countLike = document.getElementById(`count-like-${postId}`);
                const likesArr = Array.isArray(postAtualizado.likes) ? postAtualizado.likes : [];
                const euCurti = likesArr.includes(meuId);

                if(countLike) countLike.innerText = likesArr.length;
                if(btnLike) {
                    btnLike.style.background = euCurti ? '#eafaf1' : '#f0f2f5';
                    btnLike.style.color = euCurti ? '#27ae60' : '#555';
                    btnLike.style.borderColor = euCurti ? '#27ae60' : 'transparent';
                }

                const btnDislike = document.getElementById(`btn-dislike-${postId}`);
                const countDislike = document.getElementById(`count-dislike-${postId}`);
                const dislikesArr = Array.isArray(postAtualizado.dislikes) ? postAtualizado.dislikes : [];
                const euNaoCurti = dislikesArr.includes(meuId);

                if(countDislike) countDislike.innerText = dislikesArr.length;
                if(btnDislike) {
                    btnDislike.style.background = euNaoCurti ? '#fdf2f2' : '#f0f2f5';
                    btnDislike.style.color = euNaoCurti ? '#e74c3c' : '#555';
                    btnDislike.style.borderColor = euNaoCurti ? '#e74c3c' : 'transparent';
                }

                const countComment = document.getElementById(`count-comment-${postId}`);
                if(countComment) countComment.innerText = postAtualizado.comentarios ? postAtualizado.comentarios.length : 0;

                const listaComentarios = document.getElementById(`lista-comentarios-${postId}`);
                if(listaComentarios) {
                    if(postAtualizado.comentarios && postAtualizado.comentarios.length > 0) {
                        listaComentarios.innerHTML = postAtualizado.comentarios.map(c => Workspace.Feed.gerarHTMLComentario(c, postId)).join('');
                    } else {
                        listaComentarios.innerHTML = '<div style="font-size:12px; color:#999; text-align:center;">Seja o primeiro a comentar!</div>';
                    }
                }
            }
        } catch(e) { }
    },

    gerarHTMLComentario: (c, postId) => {
        const tempoComentario = c.dataCriacao ? Workspace.Feed.calcularTempoRelativo(c.dataCriacao) : 'Agora mesmo';
        const tempoAttr = c.dataCriacao ? `data-time="${c.dataCriacao}"` : '';
        const ehDonoComentario = (Workspace.usuario.nome === c.autorNome || Workspace.usuario.login === c.autorNome || Workspace.usuario.tipo === 'Gestor' || Workspace.usuario.tipo === 'Professor');
        const avatarComentario = window.Workspace.renderizarAvatar(c.autorNome, 30);
        
        const meuId = Workspace.usuario ? Workspace.usuario.id : 'anonimo';
        const likesArr = Array.isArray(c.likes) ? c.likes : [];
        const dislikesArr = Array.isArray(c.dislikes) ? c.dislikes : [];
        const euCurtiCom = likesArr.includes(meuId);
        const euNaoCurtiCom = dislikesArr.includes(meuId);

        const acoesInline = ehDonoComentario ? `
            <div id="acoes-comentario-${c.id}" style="display:none; gap:10px; margin-top:6px; animation: fadeIn 0.2s; border-top:1px dashed #eee; padding-top:6px;">
                <span style="font-size:11px; color:#f39c12; font-weight:bold; cursor:pointer;" onclick="event.stopPropagation(); Workspace.Feed.editarComentarioInline('${postId}', '${c.id}')">Editar</span>
                <span style="font-size:11px; color:#e74c3c; font-weight:bold; cursor:pointer;" onclick="event.stopPropagation(); Workspace.Feed.apagarComentario('${postId}', '${c.id}')">Apagar</span>
            </div>` : '';
        
        return `
        <div id="comentario-${c.id}" style="background: #fdfdfd; border:1px solid #eee; padding: 10px 15px; border-radius: 12px; font-size: 13px; position:relative; display:flex; gap:10px; align-items:flex-start; transition: 0.5s;">
            <div style="flex-shrink: 0; cursor:pointer;" onclick="Workspace.Feed.abrirPerfilUsuario('${Workspace.Feed.limparTexto(c.autorNome)}')">${avatarComentario}</div>
            <div style="flex:1; padding-right: 5px; min-width: 0;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                 <strong style="color: #2c3e50; cursor:pointer; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:70%;" onclick="Workspace.Feed.abrirPerfilUsuario('${Workspace.Feed.limparTexto(c.autorNome)}')" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${Workspace.Feed.limparTexto(c.autorNome)}</strong>
                    <span class="ws-time-ago" ${tempoAttr} style="font-size:10px; color:#aaa; margin-left:auto; flex-shrink: 0;">${tempoComentario}</span>
                </div>
                <span id="texto-comentario-${c.id}" style="color: #444; line-height:1.4; display: block; word-break: break-word; overflow-wrap: break-word;">${Workspace.Feed.limparTexto(c.texto)}</span>
                
                <div style="display:flex; gap:15px; margin-top:6px; align-items:center;">
                    <span id="btn-like-com-${c.id}" onclick="Workspace.Feed.reagirComentario('${postId}', '${c.id}', 'like')" style="font-size:11px; cursor:pointer; font-weight:bold; color:${euCurtiCom ? '#27ae60' : '#95a5a6'}; transition:0.2s;" onmouseover="this.style.filter='brightness(0.8)'" onmouseout="this.style.filter='none'">
                        👍 <span id="count-like-com-${c.id}">${likesArr.length > 0 ? likesArr.length : 'Curtir'}</span>
                    </span>
                    <span id="btn-dislike-com-${c.id}" onclick="Workspace.Feed.reagirComentario('${postId}', '${c.id}', 'dislike')" style="font-size:11px; cursor:pointer; font-weight:bold; color:${euNaoCurtiCom ? '#e74c3c' : '#95a5a6'}; transition:0.2s;" onmouseover="this.style.filter='brightness(0.8)'" onmouseout="this.style.filter='none'">
                        👎 <span id="count-dislike-com-${c.id}">${dislikesArr.length > 0 ? dislikesArr.length : 'Descurtir'}</span>
                    </span>
                    ${ehDonoComentario ? `<span style="font-size:11px; color:#95a5a6; cursor:pointer; font-weight:600;" onclick="Workspace.Feed.toggleOpcoesComentario('acoes-comentario-${c.id}')">⚙️ Opções</span>` : ''}
                </div>
                ${acoesInline}
            </div>
        </div>`;
    },

    injetarModaisGlobais: () => {
        if (!document.getElementById('ws-confirm-modal')) {
            const modaisHTML = `
                <div id="ws-confirm-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 100025; align-items: center; justify-content: center; backdrop-filter: blur(4px); opacity: 0; transition: opacity 0.2s;">
                    <div class="ws-card" style="width: 90%; max-width: 340px; text-align: center; padding: 30px 20px; transform: scale(0.9); transition: transform 0.2s; margin: 0; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
                        <div style="font-size: 50px; margin-bottom: 10px; line-height: 1;">⚠️</div>
                        <h3 id="ws-confirm-title" style="margin: 0 0 10px 0; color: #2c3e50; font-size: 18px;">Atenção</h3>
                        <p id="ws-confirm-message" style="font-size: 14px; color: #666; margin-bottom: 25px; line-height: 1.5;">Tem certeza?</p>
                        <div style="display: flex; gap: 10px; justify-content: center;">
                            <button id="ws-confirm-btn-cancel" class="ws-btn" style="background: #f0f2f5; color: #555; flex: 1; padding: 12px; font-size: 14px; box-shadow: none;">Cancelar</button>
                            <button id="ws-confirm-btn-ok" class="ws-btn" style="background: #e74c3c; flex: 1; padding: 12px; font-size: 14px; box-shadow: none;">Sim, Apagar</button>
                        </div>
                    </div>
                </div>
            `;
            
            // 🚀 O NOVO PALCO DA IMERSÃO ESPECÍFICA!
            const modalImersao = `
                <div id="ws-imersao-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #0f172a; z-index: 100030; flex-direction: column; opacity: 0; transition: opacity 0.3s; overflow-y: auto;">
                    <div style="padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; background: rgba(15, 23, 42, 0.9); position: sticky; top: 0; z-index: 10; backdrop-filter: blur(10px); border-bottom: 1px solid #1e293b;">
                        <h2 style="color: #fff; margin: 0; font-size: 20px; display: flex; align-items: center; gap: 10px;">🌌 Imersão Específica</h2>
                        <button onclick="Workspace.Feed.fecharImersao()" style="background: rgba(255,255,255,0.1); border: none; color: #fff; font-size: 16px; cursor: pointer; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'" title="Sair da Imersão">✖</button>
                    </div>
                    
                    <div style="padding: 20px; max-width: 800px; margin: 0 auto; width: 100%; box-sizing: border-box;">
                        
                        <!-- Barra de Pesquisa Poderosa -->
                        <div style="display: flex; gap: 10px; margin-bottom: 30px; flex-wrap: wrap;">
                            <input type="text" id="ws-imersao-busca" placeholder="O que deseja estudar agora? (Ex: Phrasal Verbs, Viagem...)" style="flex: 1; min-width: 250px; padding: 16px; border-radius: 12px; border: 1px solid #334155; font-size: 16px; outline: none; background: #1e293b; color: #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.2);" onkeypress="if(event.key === 'Enter') Workspace.Feed.gerarImersao()">
                            <button onclick="Workspace.Feed.gerarImersao()" id="ws-btn-gerar-imersao" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; border: none; padding: 16px 24px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 16px; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);">Gerar Aula da IA 🪄</button>
                        </div>
                        
                        <!-- A Área onde a IA desenha os resultados -->
                        <div id="ws-imersao-conteudo" style="color: #cbd5e1; font-size: 16px; line-height: 1.6;">
                            <div style="text-align: center; padding: 50px 20px; color: #64748b;">
                                <div style="font-size: 60px; margin-bottom: 15px; animation: ws-float 3s ease-in-out infinite;">🤖</div>
                                <h3 style="color: #94a3b8; font-size: 22px;">O seu Professor Particular IA</h3>
                                <p style="max-width: 500px; margin: 0 auto;">Pesquise um tema específico ou clique diretamente em "Gerar". A Inteligência Artificial vai vasculhar o Feed da sua turma, criar uma aula resumo imersiva e fabricar um Quiz de Evolução para si.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            

        const modalMusica = `
                <div id="ws-imersao-musical-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #18181b; z-index: 100030; flex-direction: column; opacity: 0; transition: opacity 0.3s; overflow-y: auto;">
                    <div style="padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; background: rgba(24, 24, 27, 0.9); position: sticky; top: 0; z-index: 10; backdrop-filter: blur(10px); border-bottom: 1px solid #3f3f46;">
                        <h2 style="color: #fff; margin: 0; font-size: 20px; display: flex; align-items: center; gap: 10px;">🎶 Inglês com Música</h2>
                        <button onclick="Workspace.Feed.fecharImersaoMusical()" style="background: rgba(255,255,255,0.1); border: none; color: #fff; font-size: 16px; cursor: pointer; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'" title="Sair">✖</button>
                    </div>
                    <div style="padding: 20px; max-width: 800px; margin: 0 auto; width: 100%; box-sizing: border-box;">
                        <div style="display: flex; gap: 10px; margin-bottom: 30px; justify-content: center;">
                            <button onclick="Workspace.Feed.gerarImersaoMusical()" id="ws-btn-gerar-musica" style="background: linear-gradient(135deg, #ec4899, #f43f5e); color: white; border: none; padding: 16px 30px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 16px; box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4); width: 100%;">Analisar Feed e Criar Plano Musical 🎧</button>
                        </div>
                        <div id="ws-imersao-musical-conteudo" style="color: #e4e4e7; font-size: 16px; line-height: 1.6;">
                            <div style="text-align: center; padding: 50px 20px; color: #a1a1aa;">
                                <div style="font-size: 60px; margin-bottom: 15px; animation: ws-float 3s ease-in-out infinite;">🎸</div>
                                <h3 style="color: #d4d4d8; font-size: 22px;">O Poder da Repetição Espaçada</h3>
                                <p style="max-width: 500px; margin: 0 auto;">A Inteligência Artificial vai vasculhar a turma por vídeos musicais partilhados e desenhar um plano de 7 dias com as frases e gírias mais importantes para si.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modaisHTML + modalImersao + modalMusica);
       
        }
    },

    confirmarAcao: (titulo, mensagem, onConfirm) => {
        const modal = document.getElementById('ws-confirm-modal');
        if(!modal) { if(confirm(mensagem)) onConfirm(); return; }
        document.getElementById('ws-confirm-title').innerText = titulo;
        document.getElementById('ws-confirm-message').innerText = mensagem;
        const btnOk = document.getElementById('ws-confirm-btn-ok');
        const btnCancel = document.getElementById('ws-confirm-btn-cancel');

        modal.style.display = 'flex';
        requestAnimationFrame(() => { modal.style.opacity = '1'; modal.children[0].style.transform = 'scale(1)'; });
        const fechar = () => { modal.style.opacity = '0'; modal.children[0].style.transform = 'scale(0.9)'; setTimeout(() => modal.style.display = 'none', 200); };

        btnCancel.onclick = fechar;
        btnOk.onclick = () => { fechar(); onConfirm(); };
    },

    toggleOpcoesComentario: (idAcoes) => {
        const el = document.getElementById(idAcoes);
        if (el) el.style.display = el.style.display === 'none' ? 'flex' : 'none';
    },

    toggleMenu: (event, idUnico) => {
        event.stopPropagation(); 
        const menu = document.getElementById(`menu-dropdown-${idUnico}`);
        if (!menu) return;
        const estaAberto = menu.style.display === 'block';
        Workspace.Feed.fecharMenus(); 
        if (!estaAberto) menu.style.display = 'block';
    },

    fecharMenus: () => {
        document.querySelectorAll('.ws-post-dropdown').forEach(m => m.style.display = 'none');
    },

    injetarCSSAnimacoes: () => {
        if (!document.getElementById('ws-feed-styles')) {
            const style = document.createElement('style');
            style.id = 'ws-feed-styles';
            style.innerHTML = `
                .ws-comentario-click { cursor: pointer; transition: background 0.2s, transform 0.1s; }
                .ws-comentario-click:active { background: #f0f4f8 !important; transform: scale(0.99); }
                #ws-feed-filter-bar { display: flex !important; gap: 6px !important; margin-bottom: 16px !important; overflow-x: auto !important; padding-bottom: 4px !important; width: 100% !important; box-sizing: border-box !important; }
                .ws-filter-chip { background: #ffffff !important; color: #555 !important; border: 1px solid #e1e4e6 !important; padding: 6px 12px !important; border-radius: 20px !important; font-size: 12px !important; font-weight: 600 !important; cursor: pointer !important; transition: all 0.2s ease !important; white-space: nowrap !important; flex-shrink: 0 !important; scroll-snap-align: start !important; box-shadow: 0 1px 3px rgba(0,0,0,0.02) !important; }
                .ws-filter-chip:hover { background: #f8fafc !important; border-color: #cbd5e1 !important; }
                .ws-filter-chip.active { background: #2c3e50 !important; color: #fff !important; border-color: #2c3e50 !important; box-shadow: 0 4px 8px rgba(44, 62, 80, 0.15) !important; }
                .ws-card img, .ws-card video, .ws-card iframe { display: block !important; margin: 12px auto 0 auto !important; max-width: 100% !important; border-radius: 8px !important; }
                @keyframes skeleton-shimmer { 0% { background-position: -468px 0; } 100% { background-position: 468px 0; } }
                .skeleton-box { background: #f6f7f8; background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%); background-repeat: no-repeat; background-size: 800px 100%; animation: skeleton-shimmer 1.5s infinite linear; border-radius: 4px; }
                @keyframes pop-effect { 0% { transform: scale(1); } 40% { transform: scale(1.25); } 100% { transform: scale(1); } }
                .like-animated { animation: pop-effect 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .ws-btn-gamified { transition: transform 0.1s ease, filter 0.1s ease !important; }
                .ws-btn-gamified:active { transform: scale(0.92) !important; filter: brightness(0.9); }
                .btn-tapped { transform: scale(0.92) !important; filter: brightness(0.9) !important; }
                .new-posts-pill { position: sticky; top: 15px; z-index: 999; background: #3498db; color: white; padding: 10px 24px; border-radius: 30px; margin: 0 auto 20px auto; width: max-content; font-weight: 700; font-size: 13px; cursor: pointer; box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4); transform: translateY(-100px); opacity: 0; transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); }
                .new-posts-pill.show { transform: translateY(0); opacity: 1; }
                .ws-carousel-container { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none; scroll-behavior: smooth; width: 100%; }
                .ws-carousel-container::-webkit-scrollbar { display: none; }
                .ws-carousel-slide { flex: 0 0 100%; width: 100%; scroll-snap-align: center; display: flex; justify-content: center; align-items: center; position: relative; }
                .ws-text-collapsed { max-height: 110px; overflow: hidden; position: relative; transition: max-height 0.3s ease-out; }
                .ws-text-expanded { max-height: 2000px; transition: max-height 0.5s ease-in; }
                .ws-text-fade { position: absolute; bottom: 0; left: 0; width: 100%; height: 40px; background: linear-gradient(transparent, #ffffff); pointer-events: none; }
                @keyframes ws-float { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }
            `;
            document.head.appendChild(style);
        }
        
        if (!Workspace.Feed.listenerAnimacaoConfigurado) {
            document.addEventListener('touchstart', function(e) { const btn = e.target.closest('.ws-btn, .ws-btn-gamified, #ws-btn-anexar'); if (btn) btn.classList.add('btn-tapped'); }, { passive: true });
            document.addEventListener('touchend', function(e) { const btn = e.target.closest('.ws-btn, .ws-btn-gamified, #ws-btn-anexar'); if (btn) setTimeout(() => btn.classList.remove('btn-tapped'), 150); }, { passive: true });
            document.addEventListener('touchcancel', function(e) { const btn = e.target.closest('.ws-btn, .ws-btn-gamified, #ws-btn-anexar'); if (btn) btn.classList.remove('btn-tapped'); }, { passive: true });
            Workspace.Feed.listenerAnimacaoConfigurado = true;
        }
    },

    toggleTextoPost: (btn, postId) => {
        const wrap = document.getElementById(`text-wrap-${postId}`);
        if (!wrap) return;
        
        if (wrap.classList.contains('ws-text-expanded')) {
            wrap.classList.remove('ws-text-expanded');
            btn.innerText = "Ler mais ⬇️";
            document.getElementById(`post-${postId}`).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            wrap.classList.add('ws-text-expanded');
            btn.innerText = "Subir / Ocultar ⬆️";
        }
    },

    calcularTempoRelativo: (dataString) => {
        if (!dataString) return '';
        const dataPost = new Date(dataString);
        const diff = Math.floor((new Date() - dataPost) / 1000);
        if (diff < 60) return 'Agora mesmo';
        const m = Math.floor(diff / 60);
        if (m < 60) return `Há ${m} min`;
        const h = Math.floor(m / 60);
        if (h < 24) return `Há ${h} h`;
        const d = Math.floor(h / 24);
        if (d === 1) return `Ontem às ${dataPost.getHours().toString().padStart(2, '0')}:${dataPost.getMinutes().toString().padStart(2, '0')}`;
        if (d < 7) return `Há ${d} dias`;
        return dataPost.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    },

   processarTextoComEmbeds: (textoOriginal) => {
        if (!textoOriginal) return '';
        let texto = Workspace.Feed.limparTexto(textoOriginal).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>').replace(/\n/g, '<br>');
        const embeds = [];
        
        texto = texto.replace(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?/ig, (match, id) => {
            embeds.push(`<div style="margin-top: 15px; position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px; border: 1px solid #eee; box-shadow: 0 4px 10px rgba(0,0,0,0.05); background: #000; break-inside: avoid; column-span: all;"><iframe loading="lazy" class="ws-video-embed" src="https://www.youtube.com/embed/${id}?enablejsapi=1" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`);
            return ''; 
        });

        texto = texto.replace(/https?:\/\/(?:www\.)?tiktok\.com\/.*\/video\/(\d+)(?:\S+)?/ig, (match, id) => {
            embeds.push(`<div style="margin-top: 15px; display: flex; justify-content: center; width: 100%; break-inside: avoid; column-span: all;"><blockquote class="tiktok-embed" cite="${match.split('?')[0]}" data-video-id="${id}" style="max-width: 605px;min-width: 325px; border-radius: 12px;" ><section></section></blockquote><script async src="https://www.tiktok.com/embed.js"></script></div>`);
            return '';
        });

        texto = texto.replace(/https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)(?:\S+)?/ig, (match, id) => {
            embeds.push(`<div style="margin-top: 15px; display: flex; justify-content: center; width: 100%; break-inside: avoid; column-span: all;"><iframe src="https://www.instagram.com/p/${id}/embed" width="400" height="480" frameborder="0" scrolling="no" allowtransparency="true" style="border-radius: 12px; border: 1px solid #eee; box-shadow: 0 4px 10px rgba(0,0,0,0.05);"></iframe></div>`);
            return '';
        });

        texto = texto.replace(/https?:\/\/(?:www\.)?facebook\.com\/(?:watch\/\?v=|video\.php\?v=|.*\/videos\/)(\d+)(?:\S+)?/ig, (match, id) => {
            embeds.push(`<div style="margin-top: 15px; display: flex; justify-content: center; width: 100%; break-inside: avoid; column-span: all;"><iframe src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(match.split('?')[0])}&show_text=false" width="500" height="280" style="border:none; overflow:hidden; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen="true"></iframe></div>`);
            return '';
        });

        texto = texto.replace(/https?:\/\/open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)(?:\S+)?/ig, (match, type, id) => {
            embeds.push(`<div style="margin-top: 15px; width: 100%; break-inside: avoid; column-span: all;"><iframe src="https://open.spotify.com/embed/${type}/${id}" width="100%" height="152" frameborder="0" allowtransparency="true" allow="encrypted-media" style="border-radius: 12px;"></iframe></div>`);
            return '';
        });

        texto = texto.replace(/(https?:\/\/[^\s<]+)/g, `<a href="$1" target="_blank" style="color:#3498db; text-decoration:none; font-weight:600; word-break: break-all;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">$1 ↗</a>`);
        
        if (embeds.length > 0) texto += embeds.join('');
        return texto;
    },

    carregarPosts: async () => {
        const container = document.getElementById('ws-posts-area');
        if (!container) return;

        if(Workspace.Feed.todosOsPosts.length === 0) {
            container.innerHTML = Array(3).fill(`
                <div class="ws-card" style="margin-bottom: 20px; padding: 20px; background: #fff; border-radius: 12px; border: 1px solid #eee;">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:15px;">
                        <div class="skeleton-box" style="width:45px; height:45px; border-radius:50%;"></div>
                        <div style="flex: 1;"><div class="skeleton-box" style="width: 35%; height: 12px; margin-bottom: 8px;"></div><div class="skeleton-box" style="width: 20%; height: 10px;"></div></div>
                    </div>
                    <div class="skeleton-box" style="width: 100%; height: 12px; margin-bottom: 8px;"></div>
                    <div class="skeleton-box" style="width: 90%; height: 12px; margin-bottom: 20px;"></div>
                    <div class="skeleton-box" style="width: 100%; height: 180px; border-radius: 8px;"></div>
                </div>`).join('');
        }

        try {
            const refId = Workspace.usuario.alunoRefId || '';
            const posts = await Workspace.api(`/workspace/posts?alunoRefId=${refId}`, 'GET');

            if (!posts || posts.length === 0) {
                container.innerHTML = `<div class="ws-card" style="text-align: center; padding: 40px; color: #7f8c8d;"><div style="font-size: 40px; margin-bottom: 10px;">📭</div><h3 style="margin: 0 0 5px 0;">O mural está vazio</h3></div>`;
                const sentinela = document.getElementById('ws-feed-sentinela');
                if (sentinela) sentinela.style.display = 'none';
                return;
            }

            Workspace.Feed.todosOsPosts = posts;
            Workspace.Feed.filtrarFeed(Workspace.Feed.filtroAtivo); 

        } catch (error) {
            if (Workspace.Feed.todosOsPosts.length === 0) {
                 container.innerHTML = '<div style="text-align: center; padding: 40px; color: #7f8c8d;">Sincronizando as publicações... ⏳ A aguardar a estabilização da rede.</div>';
            }
            setTimeout(() => {
                if (Workspace.Feed && Workspace.Feed.carregarPosts) Workspace.Feed.carregarPosts();
            }, 3000);
        }
    },

    filtrarFeed: (tipoFiltro) => {
        Workspace.Feed.filtroAtivo = tipoFiltro;
        Workspace.Feed.paginaAtual = 1;
        Workspace.Feed.postsCache = [];
        
        document.querySelectorAll('.ws-filtro-btn').forEach(btn => btn.classList.remove('ativo'));
        const btnAtivo = document.getElementById(`filtro-${tipoFiltro}`);
        if(btnAtivo) btnAtivo.classList.add('ativo');

        let listaFiltrada = Workspace.Feed.todosOsPosts;
        
        if (tipoFiltro === 'imagem') {
            listaFiltrada = Workspace.Feed.todosOsPosts.filter(p => p.anexos && p.anexos.some(a => a.tipo.includes('image')));
        } 
        else if (tipoFiltro === 'video') {
            listaFiltrada = Workspace.Feed.todosOsPosts.filter(p => (p.anexos && p.anexos.some(a => a.tipo.includes('video'))) || (p.texto && p.texto.includes('youtube.com') || p.texto && p.texto.includes('youtu.be') || p.texto && p.texto.includes('tiktok.com') || p.texto && p.texto.includes('instagram.com/reel')));
        } 
        else if (tipoFiltro === 'documento') {
            listaFiltrada = Workspace.Feed.todosOsPosts.filter(p => p.anexos && p.anexos.some(a => !a.tipo.includes('image') && !a.tipo.includes('video')));
        }

        const container = document.getElementById('ws-posts-area');
        if (container) container.innerHTML = ''; 

        let sentinela = document.getElementById('ws-feed-sentinela');
        if (!sentinela) {
            sentinela = document.createElement('div');
            sentinela.id = 'ws-feed-sentinela';
            container.parentNode.insertBefore(sentinela, container.nextSibling);
        }
        sentinela.style.display = 'block';
        
        sentinela.innerHTML = '<div style="text-align:center; padding:20px; color:#249; font-size:13px; animation: pulse 2.5s infinite ease-in-out;"><strong><h3>🚨 Se você está lendo esta mensagem é porque ficou muito tempo sem acessar o WorkSpace! Por favor, saia do WorkSpace e entre novamente para que tudo seja atualizado e este aviso deixe de aparecer.</h3></strong></div>';

        Workspace.Feed.carregarLoteFiltrado(listaFiltrada);
    },

    carregarLoteFiltrado: (lista) => {
        const limite = 5; 
        const inicio = (Workspace.Feed.paginaAtual - 1) * limite;
        const fim = inicio + limite;
        const novosPosts = lista.slice(inicio, fim);
        const sentinela = document.getElementById('ws-feed-sentinela');

        if (novosPosts.length === 0 && Workspace.Feed.paginaAtual === 1) {
            document.getElementById('ws-posts-area').innerHTML = '<div class="ws-card" style="text-align:center; padding:40px; color:#999; font-size:14px;">📭 Nenhuma publicação encontrada nesta categoria.</div>';
            if(sentinela) sentinela.style.display = 'none';
            return;
        }

        if (novosPosts.length === 0) {
            if(sentinela) sentinela.innerHTML = '<div style="text-align:center; padding:30px; color:#bbb; font-size:14px; font-weight:bold;">Chegou ao fim do feed!</div>';
            return;
        }

        Workspace.Feed.postsCache = [...Workspace.Feed.postsCache, ...novosPosts];
        const html = Workspace.Feed.gerarHTMLPosts(novosPosts);
        document.getElementById('ws-posts-area').insertAdjacentHTML('beforeend', html);

        Workspace.Feed.iniciarMotorDeVideos();
        Workspace.Feed.paginaAtual++;

        if (Workspace.Feed.observer) Workspace.Feed.observer.disconnect();
        Workspace.Feed.observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) Workspace.Feed.carregarLoteFiltrado(lista);
        }, { rootMargin: '300px' });
        Workspace.Feed.observer.observe(sentinela);

        if (fim >= lista.length && sentinela) {
            sentinela.innerHTML = '<div style="text-align:center; padding:30px; color:#bbb; font-size:14px; font-weight:bold;">Chegou ao fim do feed!</div>';
            Workspace.Feed.observer.disconnect();
        }
    },
 
    iniciarMotorDeVideos: () => {
        document.querySelectorAll('.ws-feed-video').forEach(video => {
            video.onplay = function() {
                document.querySelectorAll('.ws-feed-video').forEach(v => { if (v !== this && !v.paused) v.pause(); });
                document.querySelectorAll('.ws-video-embed').forEach(iframe => iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*'));
            };
        });

        if (Workspace.Feed.videoObserver) Workspace.Feed.videoObserver.disconnect();
        Workspace.Feed.videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    const el = entry.target;
                    if (el.tagName === 'VIDEO' && !el.paused) el.pause(); 
                    else if (el.tagName === 'IFRAME') el.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                }
            });
        }, { threshold: 0.2 }); 

        document.querySelectorAll('.ws-feed-video, .ws-video-embed').forEach(el => Workspace.Feed.videoObserver.observe(el));
    },

    verificarNovoPost: async () => {
        const refId = Workspace.usuario.alunoRefId || '';
        const postsAtuais = await Workspace.api(`/workspace/posts?alunoRefId=${refId}`, 'GET');
        if (postsAtuais && Workspace.Feed.todosOsPosts.length > 0) {
            const ultimoPostIdConhecido = Workspace.Feed.todosOsPosts[0].id;
            const qtdNovos = postsAtuais.findIndex(p => String(p.id) === String(ultimoPostIdConhecido));
            if (qtdNovos > 0) {
                let pill = document.getElementById('ws-new-posts-pill');
                if (!pill) {
                    pill = document.createElement('div');
                    pill.id = 'ws-new-posts-pill';
                    pill.className = 'new-posts-pill';
                    const container = document.getElementById('ws-posts-area');
                    container.parentNode.insertBefore(pill, container);
                }
                pill.innerHTML = `⬆️ Ver ${qtdNovos} nova${qtdNovos > 1 ? 's' : ''} publicação${qtdNovos > 1 ? 'ões' : ''}`;
                pill.classList.add('show');
                pill.onclick = () => {
                    window.scrollTo({ top: 0, behavior: 'smooth' }); 
                    pill.classList.remove('show');
                    Workspace.Feed.todosOsPosts = postsAtuais;
                    Workspace.Feed.filtrarFeed(Workspace.Feed.filtroAtivo);
                };
            }
        }
    },

    abrirImagemInteira: (url) => {
        const id = 'ws-lightbox-modal';
        if(document.getElementById(id)) document.getElementById(id).remove();
        const overlay = document.createElement('div');
        overlay.id = id;
        overlay.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:10005; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(5px); opacity:0; transition: opacity 0.2s ease-in-out;";
        overlay.innerHTML = `<span style="position:absolute; top:20px; right:30px; color:white; font-size:40px; cursor:pointer; font-weight:bold; transition:0.2s;" onmouseover="this.style.color='#e74c3c'" onmouseout="this.style.color='white'" onclick="document.getElementById('${id}').style.opacity='0'; setTimeout(()=>document.getElementById('${id}').remove(), 200);" title="Fechar">×</span><img src="${url}" style="max-width:90vw; max-height:90vh; border-radius:8px; box-shadow:0 10px 40px rgba(0,0,0,0.6); transform:scale(0.95); transition: transform 0.2s ease-out;">`;
        document.body.appendChild(overlay);
        requestAnimationFrame(() => { overlay.style.opacity = '1'; overlay.querySelector('img').style.transform = 'scale(1)'; });
        overlay.addEventListener('click', (e) => { if(e.target === overlay) { overlay.style.opacity = '0'; setTimeout(()=> overlay.remove(), 200); } });
    },

    abrirDocumento: (url, nome, ehOffice) => {
        const id = 'ws-doc-modal';
        if(document.getElementById(id)) document.getElementById(id).remove();
        
        const overlay = document.createElement('div');
        overlay.id = id;
        overlay.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100dvh; z-index:2147483647; opacity:0; transition: opacity 0.3s; display:flex; flex-direction:column; background:rgba(0,0,0,0.92); backdrop-filter:blur(5px);";
        
        const absoluteUrl = url.startsWith('http') ? url : window.location.origin + url;
        const ehPDF = absoluteUrl.toLowerCase().endsWith('.pdf');
        const isMobile = window.innerWidth <= 900 || /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
        
        let iframeSrc = absoluteUrl;
        if (ehOffice) iframeSrc = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absoluteUrl)}`; 
        else if (ehPDF && isMobile) iframeSrc = `https://docs.google.com/viewer?url=${encodeURIComponent(absoluteUrl)}&embedded=true`;
        
        const nomeSeguro = (Workspace.Feed && Workspace.Feed.limparTexto) ? Workspace.Feed.limparTexto(nome) : nome;

        const cmdZoomOut = "let w = document.getElementById('ws-iframe-wrapper'); let z = parseFloat(w.dataset.zoom || 100) - 25; if(z < 100) z = 100; w.style.width = z + '%'; w.style.height = z + '%'; w.dataset.zoom = z;";
        const cmdZoomIn = "let w = document.getElementById('ws-iframe-wrapper'); let z = parseFloat(w.dataset.zoom || 100) + 25; if(z > 400) z = 400; w.style.width = z + '%'; w.style.height = z + '%'; w.dataset.zoom = z;";

        overlay.innerHTML = `
            <div style="width: 100%; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.8); border-bottom: 1px solid rgba(255,255,255,0.1); box-sizing: border-box; flex-shrink: 0; z-index: 10;">
                <div style="display: flex; flex-direction: column; max-width: 55%; overflow: hidden;">
                    <span style="color:white; font-weight:bold; font-size:14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">📄 ${nomeSeguro}</span>
                    <span style="color:#f1c40f; font-size:10px; margin-top: 2px;">⚠️ Se der erro, use o botão 📥.</span>
                </div>
                
                <div style="display:flex; gap:10px; align-items:center; background:rgba(255,255,255,0.1); padding:6px 12px; border-radius:20px;">
                    <button onclick="${cmdZoomOut}" style="background:transparent; border:none; color:white; font-size:16px; cursor:pointer; font-weight:bold;">🔍-</button>
                    <span style="color:rgba(255,255,255,0.3);">|</span>
                    <button onclick="${cmdZoomIn}" style="background:transparent; border:none; color:white; font-size:16px; cursor:pointer; font-weight:bold;">🔍+</button>
                    <span style="color:rgba(255,255,255,0.3);">|</span>
                    <a href="${absoluteUrl}" download target="_blank" style="color:white; text-decoration:none; font-size:18px;" title="Fazer Download">📥</a>
                    <button onclick="document.getElementById('${id}').style.opacity='0'; setTimeout(()=>document.getElementById('${id}').remove(), 300)" style="background:#e74c3c; border:none; color:white; font-size:16px; cursor:pointer; font-weight:bold; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center;" title="Fechar">✕</button>
                </div>
            </div>

            <div id="ws-doc-scroll-container" style="flex: 1; width: 100%; overflow: auto; position: relative; display: flex; justify-content: center; align-items: center; padding: 10px; box-sizing: border-box;">
                <div id="ws-iframe-wrapper" data-zoom="100" style="width:100%; height:100%; background:white; position:relative; border-radius:8px; overflow:hidden; transition: width 0.15s ease-out, height 0.15s ease-out;">
                    ${isMobile ? '<div id="ws-touch-glass" style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:10; background:transparent;"></div>' : ''}
                    ${ehOffice || ehPDF ? '<div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color:#999; font-size:13px; font-weight:bold;">Carregando documento... ⏳</div>' : ''}
                    <iframe src="${iframeSrc}" style="width:100%; height:100%; border:none; position:relative; z-index:2; background:white; ${isMobile ? 'pointer-events:none;' : ''}"></iframe>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 300);
            }
        });

        if (isMobile) {
            const glass = document.getElementById('ws-touch-glass');
            const scrollContainer = document.getElementById('ws-doc-scroll-container');
            const wrapper = document.getElementById('ws-iframe-wrapper');

            if (glass && scrollContainer && wrapper) {
                let mode = 'none';
                let startX = 0, startY = 0;
                let startScrollLeft = 0, startScrollTop = 0;
                let startDist = 0, startZoom = 100;

                glass.addEventListener('touchstart', (e) => {
                    e.preventDefault(); 
                    if (e.touches.length === 1) {
                        mode = 'pan';
                        startX = e.touches[0].pageX;
                        startY = e.touches[0].pageY;
                        startScrollLeft = scrollContainer.scrollLeft;
                        startScrollTop = scrollContainer.scrollTop;
                    } else if (e.touches.length === 2) {
                        mode = 'zoom';
                        startDist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
                        startZoom = parseFloat(wrapper.dataset.zoom || 100);
                    }
                }, { passive: false });

                glass.addEventListener('touchmove', (e) => {
                    e.preventDefault();
                    if (mode === 'pan' && e.touches.length === 1) {
                        const dx = e.touches[0].pageX - startX;
                        const dy = e.touches[0].pageY - startY;
                        scrollContainer.scrollLeft = startScrollLeft - dx;
                        scrollContainer.scrollTop = startScrollTop - dy;
                    } else if (mode === 'zoom' && e.touches.length === 2) {
                        const currentDist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
                        let newZoom = startZoom * (currentDist / startDist);
                        if (newZoom < 100) newZoom = 100;
                        if (newZoom > 400) newZoom = 400;
                        wrapper.style.width = newZoom + '%';
                        wrapper.style.height = newZoom + '%';
                        wrapper.dataset.zoom = newZoom;
                    }
                }, { passive: false });

                glass.addEventListener('touchend', (e) => {
                    if (e.touches.length === 0) mode = 'none';
                    else if (e.touches.length === 1) {
                        mode = 'pan';
                        startX = e.touches[0].pageX;
                        startY = e.touches[0].pageY;
                        startScrollLeft = scrollContainer.scrollLeft;
                        startScrollTop = scrollContainer.scrollTop;
                    }
                }, { passive: false });
            }
        }

        requestAnimationFrame(() => overlay.style.opacity = '1');
    },

    scrollCarrossel: (postId, total) => {
        const container = document.getElementById(`carousel-${postId}`);
        if(!container) return;
        const width = container.offsetWidth;
        const index = Math.round(container.scrollLeft / width);
        const counter = document.getElementById(`counter-${postId}`);
        if(counter) counter.innerText = `${index + 1} / ${total}`;
        const btnLeft = document.getElementById(`btn-left-${postId}`);
        const btnRight = document.getElementById(`btn-right-${postId}`);
        if(btnLeft) btnLeft.style.display = index === 0 ? 'none' : 'flex';
        if(btnRight) btnRight.style.display = index === total - 1 ? 'none' : 'flex';
    },

    moverCarrossel: (postId, direcao) => {
        const container = document.getElementById(`carousel-${postId}`);
        if(!container) return;
        container.scrollBy({ left: direcao * container.offsetWidth, behavior: 'smooth' });
    },

    renderizarAnexos: (anexos, postId) => {
        if (!anexos || anexos.length === 0) return '';
        const imagens = anexos.filter(a => a.tipo.includes('image'));
        const videos = anexos.filter(a => a.tipo.includes('video'));
        const documentos = anexos.filter(a => !a.tipo.includes('image') && !a.tipo.includes('video'));
        let htmlFinal = '';
        
        if (imagens.length > 0) {
            const qtd = imagens.length;
            if (qtd === 1) {
                let url = imagens[0].url.startsWith('http') || imagens[0].url.startsWith('/') ? imagens[0].url : '/' + imagens[0].url;
                htmlFinal += `<img src="${url}" loading="lazy" style="width:100%; max-height:400px; border-radius:8px; border:1px solid #eee; object-fit:contain; background:#f9f9f9; cursor:pointer; transition:0.2s; margin-top:15px;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'" onclick="Workspace.Feed.abrirImagemInteira('${url}')" title="Clique para ampliar">`;
            } else {
                htmlFinal += `<div style="position: relative; width: 100%; border-radius: 12px; overflow: hidden; background: #f9f9f9; border: 1px solid #eee; margin-top: 15px;"><div id="counter-${postId}" style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.7); color: white; padding: 4px 12px; border-radius: 14px; font-size: 12px; font-weight: bold; z-index: 10; pointer-events: none;">1 / ${qtd}</div><button id="btn-left-${postId}" onclick="Workspace.Feed.moverCarrossel('${postId}', -1)" style="display:none; position: absolute; top: 50%; transform: translateY(-50%); left: 10px; background: rgba(255,255,255,0.85); border: none; width: 32px; height: 32px; border-radius: 50%; align-items: center; justify-content: center; cursor: pointer; z-index: 10; font-weight: bold; box-shadow: 0 2px 6px rgba(0,0,0,0.3); transition: 0.2s;">❮</button><button id="btn-right-${postId}" onclick="Workspace.Feed.moverCarrossel('${postId}', 1)" style="position: absolute; top: 50%; transform: translateY(-50%); right: 10px; background: rgba(255,255,255,0.85); border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; font-weight: bold; box-shadow: 0 2px 6px rgba(0,0,0,0.3); transition: 0.2s;">❯</button><div id="carousel-${postId}" class="ws-carousel-container" onscroll="Workspace.Feed.scrollCarrossel('${postId}', ${qtd})">`;
                imagens.forEach((img) => { let url = img.url.startsWith('http') || img.url.startsWith('/') ? img.url : '/' + img.url; htmlFinal += `<div class="ws-carousel-slide"><img src="${url}" loading="lazy" style="width: 100%; max-height: 400px; object-fit: contain; cursor: pointer;" onclick="Workspace.Feed.abrirImagemInteira('${url}')" title="Clique para ampliar"></div>`; });
                htmlFinal += `</div></div>`;
            }
        }
        
        if (videos.length > 0) {
            videos.forEach(video => {
                let url = video.url.startsWith('http') || video.url.startsWith('/') ? video.url : '/' + video.url;
                htmlFinal += `
                <div style="margin-top: 15px; width: 100%; border-radius: 12px; border: 1px solid #eee; box-shadow: 0 4px 10px rgba(0,0,0,0.05); background: #000; overflow: hidden; display: flex; justify-content: center; align-items: center;">
                    <video controls playsinline preload="metadata" class="ws-feed-video" style="width:100%; max-height:450px; outline:none; border:none; background:#000;">
                        <source src="${url}" type="${video.tipo}">
                        O seu navegador não suporta vídeos.
                    </video>
                </div>`;
            });
        }
        
        if (documentos.length > 0) {
            htmlFinal += '<div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:15px; width:100%;">';
            documentos.forEach(anexo => {
                let urlCorrigida = anexo.url.startsWith('http') || anexo.url.startsWith('/') ? anexo.url : '/' + anexo.url;
                const nomeMinusculo = (anexo.nome || '').toLowerCase();
                const ehOffice = nomeMinusculo.endsWith('.docx') || nomeMinusculo.endsWith('.doc') || nomeMinusculo.endsWith('.xlsx') || nomeMinusculo.endsWith('.xls') || nomeMinusculo.endsWith('.pptx') || nomeMinusculo.endsWith('.ppt');
                let icone = anexo.tipo.includes('pdf') || nomeMinusculo.endsWith('.pdf') ? '📕' : '📝';
                
                const nomeSeguro = (anexo.nome || 'Documento').replace(/'/g, "\\'"); 
                
                htmlFinal += `<div onclick="Workspace.Feed.abrirDocumento('${urlCorrigida}', '${nomeSeguro}', ${ehOffice})" style="cursor:pointer; display:flex; align-items:center; gap:10px; background:#f4f6f7; padding:10px 15px; border-radius:8px; color:#2c3e50; border:1px solid #ddd; flex: 1; min-width:200px; max-width:300px; transition:0.2s;" onmouseover="this.style.background='#e5e8e8'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='#f4f6f7'; this.style.transform='translateY(0)'"><span style="font-size:24px; flex-shrink: 0;">${icone}</span><span style="flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:13px; font-weight:600;">${anexo.nome}</span><span style="color:#3498db; font-size:12px; font-weight:bold; flex-shrink: 0;">Ler Documento ↗</span></div>`;
            });
            htmlFinal += '</div>';
        }
        
        return htmlFinal;
    },

    limparTexto: (txt) => { 
        if(!txt) return ''; 
        return String(txt).replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); 
    },

    reagir: async (postId, tipo) => {
        const meuId = Workspace.usuario.id;
        const post = Workspace.Feed.postsCache.find(p => String(p.id) === String(postId));
        if (!post) return;

        const likesArr = Array.isArray(post.likes) ? post.likes : [];
        const dislikesArr = Array.isArray(post.dislikes) ? post.dislikes : [];
        let euCurti = likesArr.includes(meuId);
        let euNaoCurti = dislikesArr.includes(meuId);

        let tipoParaEnviar = tipo; 

        if (tipo === 'like') {
            if (euCurti) { 
                post.likes = likesArr.filter(id => id !== meuId); 
                euCurti = false; 
                tipoParaEnviar = 'remove'; 
            }
            else { 
                post.likes.push(meuId); 
                euCurti = true; 
                if (euNaoCurti) { post.dislikes = dislikesArr.filter(id => id !== meuId); euNaoCurti = false; } 
            }
        } else if (tipo === 'dislike') {
            if (euNaoCurti) { 
                post.dislikes = dislikesArr.filter(id => id !== meuId); 
                euNaoCurti = false; 
                tipoParaEnviar = 'remove'; 
            }
            else { 
                post.dislikes.push(meuId); 
                euNaoCurti = true; 
                if (euCurti) { post.likes = likesArr.filter(id => id !== meuId); euCurti = false; } 
            }
        }

        const btnLike = document.getElementById(`btn-like-${postId}`);
        const countLike = document.getElementById(`count-like-${postId}`);
        if (countLike) countLike.innerText = post.likes.length;
        if (btnLike) {
            btnLike.style.background = euCurti ? '#eafaf1' : '#f0f2f5';
            btnLike.style.color = euCurti ? '#27ae60' : '#555';
            btnLike.style.borderColor = euCurti ? '#27ae60' : 'transparent';
            btnLike.classList.remove('like-animated'); void btnLike.offsetWidth; btnLike.classList.add('like-animated');
        }

        const btnDislike = document.getElementById(`btn-dislike-${postId}`);
        const countDislike = document.getElementById(`count-dislike-${postId}`);
        if (countDislike) countDislike.innerText = post.dislikes.length;
        if (btnDislike) {
            btnDislike.style.background = euNaoCurti ? '#fdf2f2' : '#f0f2f5';
            btnDislike.style.color = euNaoCurti ? '#e74c3c' : '#555';
            btnDislike.style.borderColor = euNaoCurti ? '#e74c3c' : 'transparent';
        }

        try {
            const meuNome = Workspace.usuario.nome || Workspace.usuario.login;
            await Workspace.api(`/workspace/posts/${postId}/reagir`, 'PUT', { tipo: tipoParaEnviar, userId: meuId, autorNome: meuNome });
        } catch (e) {}
    },

    toggleComentarios: (postId) => {
        const box = document.getElementById(`box-comentarios-${postId}`);
        if (!box) return;
        if (box.style.display === 'none') {
            box.style.display = 'block'; box.style.animation = 'fadeIn 0.3s ease'; Workspace.Feed.comentariosAbertos.add(postId);
        } else {
            box.style.display = 'none'; Workspace.Feed.comentariosAbertos.delete(postId);
        }
    },

    enviarComentario: async (postId) => {
        const input = document.getElementById(`input-comentario-${postId}`);
        if (!input) return;
        const btn = input.nextElementSibling;
        
        const texto = input.value.trim();
        if (!texto) return;

        input.value = '';
        if (btn) { btn.innerText = "⏳"; btn.disabled = true; } 

        try {
            const res = await Workspace.api(`/workspace/posts/${postId}/comentarios`, 'POST', {
                texto, autorNome: Workspace.usuario.nome || Workspace.usuario.login
            });

            if (res && res.success) {
                await Workspace.Feed.sincronizarPostSilencioso(postId);
                const lista = document.getElementById(`lista-comentarios-${postId}`);
                if (lista) lista.scrollTop = lista.scrollHeight;
            }
        } catch (e) { 
        } finally {
            if (btn) { btn.innerText = "Enviar"; btn.disabled = false; }
        }
    },

    apagarPost: (postId) => {
        Workspace.Feed.confirmarAcao("Apagar Publicação", "Tem a certeza de que deseja eliminar definitivamente esta publicação?", async () => {
            const el = document.getElementById(`post-${postId}`);
            if (el) el.remove(); 
            
            Workspace.Feed.todosOsPosts = Workspace.Feed.todosOsPosts.filter(p => String(p.id) !== String(postId));
            Workspace.Feed.postsCache = Workspace.Feed.postsCache.filter(p => String(p.id) !== String(postId));
            
            if(window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Publicação eliminada!", "success");

            try { await Workspace.api(`/workspace/posts/${postId}`, 'DELETE'); } catch (e) { }
        });
    },

    apagarComentario: async (postId, comentarioId) => {
        const elComentario = document.getElementById(`comentario-${comentarioId}`);
        if (elComentario) elComentario.remove();

        const post = Workspace.Feed.postsCache.find(p => String(p.id) === String(postId));
        if (post && post.comentarios) {
            post.comentarios = post.comentarios.filter(c => String(c.id) !== String(comentarioId));
            const countComment = document.getElementById(`count-comment-${postId}`);
            if (countComment) countComment.innerText = post.comentarios.length;
        }

        try { await Workspace.api(`/workspace/posts/${postId}/comentarios/${comentarioId}`, 'DELETE'); } catch (e) {}
    },

    editarPost: (postId) => {
        const post = Workspace.Feed.postsCache.find(p => String(p.id) === String(postId));
        if(!post) return;
        const containerText = document.getElementById(`text-wrap-${postId}`);
        if(!containerText) return;

        // 🚀 REMOVE AS AMARRAS DE ALTURA DURANTE A EDIÇÃO!
        containerText.classList.remove('ws-text-collapsed');
        
        // Esconde o botão Ler Mais temporariamente
        const btnLerMais = document.getElementById(`btn-ler-mais-${postId}`);
        if(btnLerMais) btnLerMais.style.display = 'none';

        const textAtual = post.texto || '';
        containerText.innerHTML = `
            <div style="background:#f4f6f7; padding:12px; border-radius:8px; border:1px solid #ddd; margin-bottom:10px; animation: fadeIn 0.3s; column-span: all; break-inside: avoid;" onclick="event.stopPropagation()">
                <textarea id="edit-input-${postId}" rows="6" style="width:100%; padding:10px; border-radius:6px; border:1px solid #ccc; font-family:inherit; font-size:13px; resize:vertical; box-sizing:border-box; outline:none;" onfocus="this.style.borderColor='#3498db'" onblur="this.style.borderColor='#ccc'">${textAtual}</textarea>
                <div style="display:flex; gap:10px; margin-top:10px;">
                    <button class="ws-btn ws-btn-gamified" style="background:#27ae60; padding:6px 15px; font-size:12px; font-weight:bold;" onclick="Workspace.Feed.salvarEdicaoPost('${postId}')">💾 Guardar Alterações</button>
                    <button class="ws-btn ws-btn-gamified" style="background:#e74c3c; padding:6px 15px; font-size:12px; font-weight:bold;" onclick="Workspace.Feed.cancelarEdicaoPost('${postId}')">✖ Cancelar</button>
                </div>
            </div>
        `;
    },

    cancelarEdicaoPost: (postId) => {
        const post = Workspace.Feed.postsCache.find(p => String(p.id) === String(postId));
        if(!post) return;
        const containerText = document.getElementById(`text-wrap-${postId}`);
        if(containerText) {
            const numLinhas = (post.texto ? (post.texto.match(/\n/g) || []).length : 0);
            const ehTextoLongo = (post.texto && post.texto.length > 350) || numLinhas > 8;
            
            containerText.innerHTML = Workspace.Feed.processarTextoComEmbeds(post.texto) + (ehTextoLongo ? '<div class="ws-text-fade"></div>' : '');
            
            if(ehTextoLongo) {
                containerText.classList.add('ws-text-collapsed');
            }
            
            const btnLerMais = document.getElementById(`btn-ler-mais-${postId}`);
            if(btnLerMais) {
                btnLerMais.style.display = ehTextoLongo ? 'block' : 'none';
                const spanLerMais = btnLerMais.querySelector('span');
                if(spanLerMais) spanLerMais.innerText = "Ler mais ⬇️";
            }
        }
    },

    salvarEdicaoPost: async (postId) => {
        const input = document.getElementById(`edit-input-${postId}`);
        if(!input) return;
        const novoTexto = input.value.trim();
        const btn = event.target;
        btn.innerText = "⏳ A gravar..."; btn.disabled = true;

        try {
            const res = await Workspace.api(`/workspace/posts/${postId}`, 'PUT', { texto: novoTexto });
            if(res && res.success) {
                const post = Workspace.Feed.postsCache.find(p => String(p.id) === String(postId));
                if(post) post.texto = novoTexto;
                
                // 🚀 CHAMA O CANCELAR PARA RECONSTRUIR A CAIXA E AVALIAR O TAMANHO DO TEXTO NOVO
                Workspace.Feed.cancelarEdicaoPost(postId);
                
                if(Workspace.mostrarAviso) Workspace.mostrarAviso("Publicação editada com sucesso!", "success");
            } else throw new Error();
        } catch(e) {
            btn.innerText = "💾 Guardar Alterações"; btn.disabled = false;
        }
    },

    editarComentarioInline: (postId, comentarioId) => {
        const post = Workspace.Feed.postsCache.find(p => String(p.id) === String(postId));
        if(!post || !post.comentarios) return;
        const c = post.comentarios.find(com => String(com.id) === String(comentarioId));
        if(!c) return;
        const containerTexto = document.getElementById(`texto-comentario-${comentarioId}`);
        if(!containerTexto) return;
        const acoesEl = document.getElementById(`acoes-comentario-${comentarioId}`);
        if(acoesEl) acoesEl.style.display = 'none';

        containerTexto.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:6px; margin-top:5px; animation: fadeIn 0.2s;" onclick="event.stopPropagation()">
                <input type="text" id="input-edit-com-${comentarioId}" value="${c.texto}" style="padding:6px 12px; border-radius:14px; border:1px solid #3498db; font-size:13px; outline:none; background:#fff; width:100%; box-sizing:border-box;">
                <div style="display:flex; gap:6px;">
                    <span style="font-size:11px; color:#27ae60; font-weight:bold; cursor:pointer;" onclick="event.stopPropagation(); Workspace.Feed.salvarEdicaoComentario('${postId}', '${comentarioId}')">💾 Guardar</span>
                    <span style="font-size:11px; color:#95a5a6; font-weight:bold; cursor:pointer;" onclick="event.stopPropagation(); Workspace.Feed.cancelarEdicaoComentario('${postId}', '${comentarioId}')">Cancelar</span>
                </div>
            </div>
        `;
    },

    cancelarEdicaoComentario: (postId, comentarioId) => {
        const post = Workspace.Feed.postsCache.find(p => String(p.id) === String(postId));
        if(!post || !post.comentarios) return;
        const c = post.comentarios.find(com => String(com.id) === String(comentarioId));
        if(!c) return;
        const containerTexto = document.getElementById(`texto-comentario-${comentarioId}`);
        if(containerTexto) containerTexto.innerHTML = Workspace.Feed.limparTexto(c.texto);
        const acoesEl = document.getElementById(`acoes-comentario-${comentarioId}`);
        if(acoesEl) acoesEl.style.display = 'none';
    },

    salvarEdicaoComentario: async (postId, comentarioId) => {
        const input = document.getElementById(`input-edit-com-${comentarioId}`);
        if(!input) return;
        const novoTexto = input.value.trim();
        if(!novoTexto) return;

        try {
            const res = await Workspace.api(`/workspace/posts/${postId}/comentarios/${comentarioId}`, 'PUT', { texto: novoTexto });
            if(res && res.success) {
                await Workspace.Feed.sincronizarPostSilencioso(postId);
            }
        } catch(e) {}
    },

    partilharPost: (postId) => {
        const urlPartilha = window.location.origin + window.location.pathname + '#post-' + postId;
        navigator.clipboard.writeText(urlPartilha).then(() => {
            if(window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Link copiado! Já pode colar onde quiser.", "success");
        }).catch(err => {});
    },

    gerarHTMLPosts: (posts) => {
        const meuId = Workspace.usuario.id;
        
        return posts.map(p => {
            const tempoAmigavel = p.dataCriacao ? Workspace.Feed.calcularTempoRelativo(p.dataCriacao) : 'Agora mesmo';
            const tempoAttr = p.dataCriacao ? `class="ws-time-ago" data-time="${p.dataCriacao}"` : '';
            const avatarPost = `<div onclick="Workspace.Feed.abrirPerfilUsuario('${Workspace.Feed.limparTexto(p.autorNome)}')" style="cursor:pointer; transition:0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'" title="Ver Perfil">${window.Workspace.renderizarAvatar(p.autorNome, 45)}</div>`;
            const textoSeguro = Workspace.Feed.processarTextoComEmbeds(p.texto);

            const ehDonoOuGestor = (
                Workspace.usuario.nome === p.autorNome || 
                Workspace.usuario.login === p.autorNome || 
                Workspace.usuario.tipo === 'Gestor' || 
                Workspace.usuario.tipo === 'Professor'
            );

            let destinoBadge = p.destino === 'global' 
                ? `<span style="font-size:10px; background:#e8f4f8; color:#3498db; padding:2px 6px; border-radius:4px; margin-left:5px; font-weight:bold;">🌍 Público Geral</span>`
                : `<span style="font-size:10px; background:#f4e8f8; color:#8e44ad; padding:2px 6px; border-radius:4px; margin-left:5px; font-weight:bold;">📚 ${Workspace.Feed.limparTexto(p.destinoNome)}</span>`;

            const likesArr = Array.isArray(p.likes) ? p.likes : [];
            const dislikesArr = Array.isArray(p.dislikes) ? p.dislikes : [];
            const euCurti = likesArr.includes(meuId);
            const euNaoCurti = dislikesArr.includes(meuId);
            
            const displayComentarios = Workspace.Feed.comentariosAbertos.has(p.id) ? 'block' : 'none';

            // 🚀 O NOVO CÁLCULO INTELIGENTE (Letras de Músicas)
            const numLinhas = (p.texto ? (p.texto.match(/\n/g) || []).length : 0);
            const ehTextoLongo = (p.texto && p.texto.length > 350) || numLinhas > 8;
            const ehMusica = numLinhas >= 10; 
            
            // Se for música/poema, aplica colunas elegantes (cria 2 colunas e divide o texto para não ficar muito longo pra baixo)
            const estiloColunas = ehMusica ? 'column-width: 250px; column-gap: 30px; widows: 3; orphans: 3;' : '';

            // 🚀 O BOTÃO LER MAIS AGORA TEM UM ID EXCLUSIVO PARA O PODERMOS CONTROLAR!
            const btnVerMais = `<div id="btn-ler-mais-${p.id}" style="margin-top: 8px; display: ${ehTextoLongo ? 'block' : 'none'};"><span onclick="Workspace.Feed.toggleTextoPost(this, '${p.id}')" style="color: #3498db; font-size: 13px; font-weight: bold; cursor: pointer; background: rgba(52,152,219,0.1); padding: 5px 12px; border-radius: 14px; transition: 0.2s;" onmouseover="this.style.background='rgba(52,152,219,0.2)'" onmouseout="this.style.background='rgba(52,152,219,0.1)'">Ler mais ⬇️</span></div>`;

            return `
                <div class="ws-card" id="post-${p.id}" style="animation: fadeIn 0.4s ease; margin-bottom: 20px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px; width:100%; gap:8px;">
                        <div style="display:flex; align-items:center; gap:10px; flex: 1; min-width: 0;">
                            <div style="flex-shrink:0;">${avatarPost}</div>
                            <div style="flex: 1; min-width: 0;">
                                
<div style="font-weight:700; color:#2c3e50; font-size:15px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                    <span onclick="Workspace.Feed.abrirPerfilUsuario('${Workspace.Feed.limparTexto(p.autorNome)}')" style="cursor:pointer;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'" title="Ver Perfil">${Workspace.Feed.limparTexto(p.autorNome)}</span> 
                                    <span style="font-size:11px; color:#aaa; margin-left:2px;">• ${p.autorTipo}</span>
                                </div>
                                <div style="font-size:12px; color:#7f8c8d; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                    <span ${tempoAttr}>${tempoAmigavel}</span> ${destinoBadge}
                                </div>
                            </div>
                        </div>
                        <div class="ws-menu-ancora" style="position:relative; flex-shrink: 0; margin-left: auto; padding-right: 5px;">
                            <button onclick="Workspace.Feed.toggleMenu(event, '${p.id}')" style="background:none; border:none; font-size:20px; font-weight:bold; cursor:pointer; color:#7f8c8d; padding:2px 10px; border-radius:50%; line-height:1;" onmouseover="this.style.background='#f0f2f5'; this.style.color='#2c3e50'" onmouseout="this.style.background='transparent'; this.style.color='#7f8c8d'">⋮</button>
                            <div id="menu-dropdown-${p.id}" class="ws-post-dropdown" style="display:none; position:absolute; right:5px; top:100%; background:#fff; border:1px solid #eee; border-radius:8px; box-shadow:0 10px 25px rgba(0,0,0,0.1); width:160px; z-index:100; overflow:hidden; animation: fadeIn 0.2s ease;">
                                <div style="padding:12px 15px; cursor:pointer; font-size:13px; font-weight:600; color:#333; display:flex; align-items:center; gap:10px;" onclick="Workspace.Feed.partilharPost('${p.id}'); Workspace.Feed.fecharMenus()">
                                    <span style="font-size:16px;">🔗</span> Copiar Link
                                </div>
                                ${ehDonoOuGestor ? `
                                <div style="padding:12px 15px; cursor:pointer; font-size:13px; font-weight:600; color:#f39c12; display:flex; align-items:center; gap:10px; border-top:1px solid #f9f9f9;" onclick="Workspace.Feed.editarPost('${p.id}'); Workspace.Feed.fecharMenus()">
                                    <span style="font-size:16px;">✏️</span> Editar
                                </div>
                                <div style="padding:12px 15px; cursor:pointer; font-size:13px; font-weight:600; color:#e74c3c; display:flex; align-items:center; gap:10px; border-top:1px solid #f9f9f9;" onclick="Workspace.Feed.apagarPost('${p.id}'); Workspace.Feed.fecharMenus()">
                                    <span style="font-size:16px;">🗑️</span> Apagar
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <div id="text-wrap-${p.id}" class="${ehTextoLongo ? 'ws-text-collapsed' : ''}" style="font-size:14px; color:#333; line-height:1.6; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; ${estiloColunas}">
                        ${textoSeguro}
                        ${ehTextoLongo ? '<div class="ws-text-fade"></div>' : ''}
                    </div>
                    ${btnVerMais}
                    
                    ${Workspace.Feed.renderizarAnexos(p.anexos, p.id)}
                    
                    <div style="margin-top:20px; padding-top:15px; border-top:1px solid #eee; display:flex; gap:8px; flex-wrap:wrap;">
                        <button id="btn-like-${p.id}" class="ws-btn-gamified" style="background:${euCurti ? '#eafaf1' : '#f0f2f5'}; color:${euCurti ? '#27ae60' : '#555'}; border: 1px solid ${euCurti ? '#27ae60' : 'transparent'}; padding:8px 16px; border-radius:20px; font-size:13px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px; transition:0.2s;" onclick="Workspace.Feed.reagir('${p.id}', 'like')">
                            👍 <span id="count-like-${p.id}">${likesArr.length}</span>
                        </button>
                        
                        <button id="btn-dislike-${p.id}" class="ws-btn-gamified" style="background:${euNaoCurti ? '#fdf2f2' : '#f0f2f5'}; color:${euNaoCurti ? '#e74c3c' : '#555'}; border: 1px solid ${euNaoCurti ? '#e74c3c' : 'transparent'}; padding:8px 16px; border-radius:20px; font-size:13px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px; transition:0.2s;" onclick="Workspace.Feed.reagir('${p.id}', 'dislike')">
                            👎 <span id="count-dislike-${p.id}">${dislikesArr.length}</span>
                        </button>
                        
                        <button class="ws-btn-gamified" style="background:#f0f2f5; color:#555; border:none; padding:8px 16px; border-radius:20px; font-size:13px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px; transition:0.2s;" onclick="Workspace.Feed.toggleComentarios('${p.id}')">
                            💬 <span id="count-comment-${p.id}">${p.comentarios ? p.comentarios.length : 0}</span>
                        </button>
                    </div>

                    <div id="box-comentarios-${p.id}" style="display:${displayComentarios}; margin-top:15px; padding-top:15px; border-top:1px dashed #ddd;">
                        <div id="lista-comentarios-${p.id}" style="max-height: 250px; overflow-y: auto; margin-bottom: 15px; display: flex; flex-direction: column; gap: 8px;">
                            ${p.comentarios && p.comentarios.length > 0 ? p.comentarios.map(c => Workspace.Feed.gerarHTMLComentario(c, p.id)).join('') : '<div style="font-size:12px; color:#999; text-align:center;">Seja o primeiro a comentar!</div>'}
                        </div>
                        
                        <div style="display:flex; gap:10px; align-items: center;">
                            <input type="text" id="input-comentario-${p.id}" placeholder="Escreva um comentário..." style="flex:1; min-width: 0; padding:10px 15px; border-radius:20px; border:1px solid #ddd; font-size:13px; outline:none; background:#f9f9f9;" onkeypress="if(event.key === 'Enter') Workspace.Feed.enviarComentario('${p.id}')">
                            <button class="ws-btn ws-btn-gamified" style="flex-shrink: 0; padding:10px 20px; border-radius:20px;" onclick="Workspace.Feed.enviarComentario('${p.id}')">Enviar</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    focarPost: (postId) => {
        const indexDoPost = Workspace.Feed.todosOsPosts.findIndex(p => String(p.id) === String(postId));
        
        if (indexDoPost !== -1) {
            const paginaAlvo = Math.ceil((indexDoPost + 1) / 5);
            while (Workspace.Feed.paginaAtual <= paginaAlvo) {
                Workspace.Feed.carregarLoteFiltrado(Workspace.Feed.todosOsPosts);
            }
        } else {
            if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Esta publicação já não se encontra disponível.", "warning");
        }

        const checkExist = setInterval(() => {
            const postElement = document.getElementById(`post-${postId}`);
            if (postElement) {
                clearInterval(checkExist);
                history.replaceState(null, null, ' ');

                setTimeout(() => {
                    postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    postElement.classList.remove('ws-highlight-magic');
                    void postElement.offsetWidth; 
                    postElement.classList.add('ws-highlight-magic');
                    
                    const wrap = document.getElementById(`text-wrap-${postId}`);
                    if (wrap && wrap.classList.contains('ws-text-collapsed')) {
                        const btnLerMais = postElement.querySelector('span[onclick*="toggleTextoPost"]');
                        if (btnLerMais) Workspace.Feed.toggleTextoPost(btnLerMais, postId);
                    }
                }, 600);
            }
        }, 300);
        
        setTimeout(() => clearInterval(checkExist), 5000);
    },

    htmlParaElemento: (htmlString) => {
        const template = document.createElement('template');
        template.innerHTML = htmlString.trim();
        return template.content.firstChild;
    },

    configurarEventosCriacao: async () => {
        const boxCriarPost = document.getElementById('ws-criar-post');
        if (!boxCriarPost) return;

        const selDestino = document.getElementById('ws-post-destino');
        
        if (selDestino && selDestino.options.length === 1) { 
            try {
                const turmas = await Workspace.api('/turmas', 'GET');
                if (turmas && turmas.length > 0) {
                    const tipoUsuario = Workspace.usuario.tipo;
                    
                    if (tipoUsuario === 'Professor' || tipoUsuario === 'Gestor') {
                        turmas.forEach(t => {
                            selDestino.innerHTML += `<option value="${t.id}">📚 ${Workspace.Feed.limparTexto(t.nome)}</option>`;
                        });
                    } else {
                        turmas.forEach(t => {
                            if (Workspace.verificarTurma(Workspace.usuario, t.id, t.nome)) {
                                selDestino.innerHTML += `<option value="${t.id}">📚 ${Workspace.Feed.limparTexto(t.nome)}</option>`;
                            }
                        });
                    }
                }
            } catch(e) {}
        }

        const btnPublicar = boxCriarPost.querySelector('#ws-btn-publicar');
        const inputTexto = boxCriarPost.querySelector('textarea');

        if (btnPublicar && inputTexto) {
            const rascunhoGuardado = localStorage.getItem('ws_draft_post');
            if (rascunhoGuardado) inputTexto.value = rascunhoGuardado;

            inputTexto.addEventListener('input', (e) => localStorage.setItem('ws_draft_post', e.target.value));

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

                novoBtn.innerText = "Publicando... ⏳";
                novoBtn.disabled = true;

                try {
                    let urlsFinais = [];

                    if (anexosLocais.length > 0) {
                        urlsFinais = await Workspace.Upload.enviarMultiplosFicheiros(anexosLocais);
                    }

                    const postRes = await Workspace.api('/workspace/posts', 'POST', {
                        texto: texto, escolaId: Workspace.usuario.escolaId, autorNome: Workspace.usuario.nome || Workspace.usuario.login, autorTipo: Workspace.usuario.tipo, anexos: urlsFinais, destino: destino, destinoNome: destinoNome
                    });

                    if (postRes && postRes.success) {
                        inputTexto.value = '';
                        localStorage.removeItem('ws_draft_post'); 
                        
                        if (Workspace.Upload) Workspace.Upload.limparAnexos();
                        if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Publicado com sucesso!", "success");
                        
                        Workspace.Feed.todosOsPosts = [];
                        await Workspace.Feed.carregarPosts(); 
                    } else throw new Error();

                } catch (e) {
                    if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Falha na publicação. Tente enviar os ficheiros um por um.", "error");
                } finally {
                    novoBtn.innerText = "Publicar";
                    novoBtn.disabled = false;
                }
            });
        }
    },

    abrirPerfilUsuario: (autorNome) => {
        const id = 'ws-perfil-visitante-modal';
        if(document.getElementById(id)) document.getElementById(id).remove();
        const avatarHTML = window.Workspace.renderizarAvatar(autorNome, 100);
        
        const overlay = document.createElement('div');
        overlay.id = id;
        overlay.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100dvh; background:rgba(0,0,0,0.85); z-index:100020; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(5px); opacity:0; transition: opacity 0.2s ease-in-out;";
        overlay.innerHTML = `
            <div class="ws-card" style="width: 90%; max-width: 340px; text-align: center; padding: 40px 20px; background: white; border-radius: 16px; position: relative; transform: scale(0.9); transition: transform 0.2s; margin:0;">
                <span style="position:absolute; top:15px; right:20px; color:#aaa; font-size:26px; cursor:pointer; font-weight:bold; transition:0.2s;" onmouseover="this.style.color='#e74c3c'" onmouseout="this.style.color='#aaa'" onclick="document.getElementById('${id}').style.opacity='0'; setTimeout(()=>document.getElementById('${id}').remove(), 200);">✖</span>
                <div style="width:100px; height:100px; margin: 0 auto 15px auto; border-radius:50%; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border: 3px solid #3498db; overflow: hidden; display: flex; align-items: center; justify-content: center; font-size: 40px;">
                    ${avatarHTML}
                </div>
                <h2 style="margin: 0 0 5px 0; color: #2c3e50; font-size: 20px;">${autorNome}</h2>
                <p style="margin: 0; color: #7f8c8d; font-size: 13px;">Membro da Plataforma</p>
            </div>
        `;
        document.body.appendChild(overlay);
        requestAnimationFrame(() => { overlay.style.opacity = '1'; overlay.children[0].style.transform = 'scale(1)'; });
        overlay.addEventListener('click', (e) => { if(e.target === overlay) { overlay.style.opacity = '0'; setTimeout(()=> overlay.remove(), 200); } });
    },

    reagirComentario: async (postId, comentarioId, tipo) => {
        const meuId = Workspace.usuario.id;
        const post = Workspace.Feed.postsCache.find(p => String(p.id) === String(postId));
        if (!post || !post.comentarios) return;
        const c = post.comentarios.find(com => String(com.id) === String(comentarioId));
        if (!c) return;

        if (!Array.isArray(c.likes)) c.likes = [];
        if (!Array.isArray(c.dislikes)) c.dislikes = [];
        let euCurti = c.likes.includes(meuId);
        let euNaoCurti = c.dislikes.includes(meuId);

        let tipoParaEnviar = tipo;

        if (tipo === 'like') {
            if (euCurti) { c.likes = c.likes.filter(id => id !== meuId); euCurti = false; tipoParaEnviar = 'remove'; }
            else { c.likes.push(meuId); euCurti = true; if (euNaoCurti) { c.dislikes = c.dislikes.filter(id => id !== meuId); euNaoCurti = false; } }
        } else if (tipo === 'dislike') {
            if (euNaoCurti) { c.dislikes = c.dislikes.filter(id => id !== meuId); euNaoCurti = false; tipoParaEnviar = 'remove'; }
            else { c.dislikes.push(meuId); euNaoCurti = true; if (euCurti) { c.likes = c.likes.filter(id => id !== meuId); euCurti = false; } }
        }

        const countLikeEl = document.getElementById(`count-like-com-${comentarioId}`);
        const btnLikeEl = document.getElementById(`btn-like-com-${comentarioId}`);
        if (countLikeEl) countLikeEl.innerText = c.likes.length > 0 ? c.likes.length : 'Curtir';
        if (btnLikeEl) btnLikeEl.style.color = euCurti ? '#27ae60' : '#95a5a6';

        const countDislikeEl = document.getElementById(`count-dislike-com-${comentarioId}`);
        const btnDislikeEl = document.getElementById(`btn-dislike-com-${comentarioId}`);
        if (countDislikeEl) countDislikeEl.innerText = c.dislikes.length > 0 ? c.dislikes.length : 'Descurtir';
        if (btnDislikeEl) btnDislikeEl.style.color = euNaoCurti ? '#e74c3c' : '#95a5a6';

        try {
            const meuNome = Workspace.usuario.nome || Workspace.usuario.login;
            await Workspace.api(`/workspace/posts/${postId}/comentarios/${comentarioId}/reagir`, 'PUT', { tipo: tipoParaEnviar, userId: meuId, autorNome: meuNome });
        } catch(e) {}
    },

  // ------------------------------------------------------------------------
    // 🌌 MÓDULO: IMERSÃO ESPECÍFICA (O CÉREBRO DE CURADORIA NO FRONTEND)
    // ------------------------------------------------------------------------
    abrirImersao: () => {
        const modal = document.getElementById('ws-imersao-modal');
        if (modal) {
            document.body.style.overflow = 'hidden'; 
            modal.style.display = 'flex';
            requestAnimationFrame(() => modal.style.opacity = '1');
        }
    },

    fecharImersao: () => {
        const modal = document.getElementById('ws-imersao-modal');
        if (modal) {
            document.body.style.overflow = '';
            modal.style.opacity = '0';
            setTimeout(() => modal.style.display = 'none', 300);
        }
    },

    gerarImersao: async () => {
        const input = document.getElementById('ws-imersao-busca');
        const btn = document.getElementById('ws-btn-gerar-imersao');
        const conteudo = document.getElementById('ws-imersao-conteudo');
        
        const termoBusca = input ? input.value.trim() : '';
        
        if (btn) {
            btn.innerText = 'Lendo o Feed e a Biblioteca... ⏳';
            btn.disabled = true;
            btn.style.opacity = '0.7';
        }
        
        conteudo.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 50px; animation: pulse 1.5s infinite;">🧠</div>
                <h3 style="color: #fff; margin-top: 20px;">A processar milhares de dados...</h3>
                <p style="color: #94a3b8;">A Inteligência Artificial está a focar-se no seu pedido com exatidão.</p>
            </div>
        `;
        
        try {
            const refId = Workspace.usuario.alunoRefId || '';
            const escolaId = Workspace.usuario.escolaId || 'DEFAULT';
            
            const res = await Workspace.api('/workspace/posts/imersao', 'POST', {
                termoBusca, alunoRefId: refId, escolaId
            });
            
            if (res && res.success && res.imersao) {
                res.imersao.materiaisExtras = res.materiaisExtras || [];
                Workspace.Feed.renderizarImersao(res.imersao);
            } else {
                throw new Error(res?.error || 'A IA não encontrou conteúdo suficiente sobre este tema.');
            }
        } catch (error) {
            conteudo.innerHTML = `
                <div style="text-align: center; padding: 40px; background: rgba(239, 68, 68, 0.1); border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.3);">
                    <h3 style="color: #f87171;">Ocorreu um erro ❌</h3>
                    <p style="color: #fca5a5;">${error.message || 'Houve uma falha na ligação. Tente pesquisar outro termo.'}</p>
                </div>
            `;
        } finally {
            if (btn) {
                btn.innerHTML = 'Gerar Aula da IA 🪄';
                btn.disabled = false;
                btn.style.opacity = '1';
            }
        }
    },

    // 🚀 O FILTRO DOURADO BLINDADO 2.0 (Apaga estilos da IA e formata Tabela)
    formatarIA: (txt) => {
        if (!txt) return '';
        
        let textoProcessado = String(txt)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/```(.*?)```/gs, '<code>$1</code>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
            
        const descodificador = document.createElement('textarea');
        descodificador.innerHTML = textoProcessado;
        let textoReal = descodificador.value;
        
        textoReal = Workspace.Feed.limparTexto(textoReal);
        
        const tagsPermitidas = ['strong', 'em', 'b', 'i', 'br', 'p', 'ul', 'ol', 'li', 'u', 'h1', 'h2', 'h3', 'h4', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'span'];
        
        tagsPermitidas.forEach(tag => {
            const regexOpen = new RegExp(`&lt;${tag}(?:.*?)&gt;`, 'gi');
            const regexClose = new RegExp(`&lt;/${tag}&gt;`, 'gi');
            const regexSelfClose = new RegExp(`&lt;${tag}\\s*/?&gt;`, 'gi');
            
            if (tag === 'table') {
                textoReal = textoReal.replace(regexOpen, `<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; background: rgba(255,255,255,0.05); border-radius: 8px; overflow: hidden; border: 1px solid #334155;">`).replace(regexClose, `</table></div>`).replace(regexSelfClose, `<table>`);
            } else if (tag === 'th' || tag === 'td') {
                textoReal = textoReal.replace(regexOpen, `<${tag} style="border: 1px solid #334155; padding: 10px 15px; text-align: left; color: #e2e8f0;">`).replace(regexClose, `</${tag}>`).replace(regexSelfClose, `<${tag}>`);
            } else if (tag === 'span') {
                textoReal = textoReal.replace(regexOpen, `<span>`).replace(regexClose, `</span>`).replace(regexSelfClose, `<span>`);
            } else {
                textoReal = textoReal.replace(regexOpen, `<${tag}>`).replace(regexClose, `</${tag}>`).replace(regexSelfClose, `<${tag}>`);
            }
        });

        textoReal = textoReal.replace(/&lt;code&gt;/gi, '<code style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #a78bfa;">')
                             .replace(/&lt;\/code&gt;/gi, '</code>');

        return textoReal;
    },

    gerarHTMLRecursosImersao: (idsRelacionados, materiaisExtras) => {
        let htmlVideos = '';
        let htmlDocs = '';
        let htmlImagens = '';

        if (idsRelacionados && Array.isArray(idsRelacionados)) {
            idsRelacionados.forEach(id => {
                const post = Workspace.Feed.todosOsPosts.find(p => String(p.id) === String(id));
                if (post) {
                    if (post.anexos && post.anexos.length > 0) {
                        post.anexos.forEach(a => {
                            let url = a.url.startsWith('http') || a.url.startsWith('/') ? a.url : '/' + a.url;
                            if (a.tipo.includes('video')) {
                                htmlVideos += `<div style="flex: 1; min-width: 250px; background: rgba(0,0,0,0.4); border-radius: 12px; overflow: hidden; border: 1px solid #334155;"><div style="background:#1e293b; padding:4px 10px; font-size:11px; color:#94a3b8; font-weight:bold;">💬 Do Feed</div><video controls playsinline preload="metadata" style="width:100%; max-height:200px; background:#000;"><source src="${url}" type="${a.tipo}"></video></div>`;
                            } else if (a.tipo.includes('image')) {
                                htmlImagens += `<div style="flex: 1; min-width: 150px; max-width: 200px; border-radius: 12px; overflow: hidden; border: 1px solid #334155;"><div style="background:#1e293b; padding:4px; font-size:10px; color:#94a3b8; font-weight:bold; text-align:center;">💬 Do Feed</div><img src="${url}" loading="lazy" style="width: 100%; height: 100px; object-fit: cover; cursor: pointer;" onclick="Workspace.Feed.abrirImagemInteira('${url}')"></div>`;
                            } else {
                                const nomeMinusculo = (a.nome || '').toLowerCase();
                                const ehOffice = nomeMinusculo.endsWith('.docx') || nomeMinusculo.endsWith('.doc') || nomeMinusculo.endsWith('.xlsx') || nomeMinusculo.endsWith('.xls') || nomeMinusculo.endsWith('.ppt');
                                let icone = a.tipo.includes('pdf') || nomeMinusculo.endsWith('.pdf') ? '📕' : '📝';
                                const nomeSeguro = (a.nome || 'Documento').replace(/'/g, "\\'"); 
                                htmlDocs += `<div onclick="Workspace.Feed.abrirDocumento('${url}', '${nomeSeguro}', ${ehOffice})" style="cursor:pointer; display:flex; flex-direction:column; gap:8px; background:rgba(59, 130, 246, 0.1); padding:12px; border-radius:12px; color:#e2e8f0; border:1px solid rgba(59, 130, 246, 0.3); flex: 1; min-width: 200px;" onmouseover="this.style.background='rgba(59, 130, 246, 0.2)'" onmouseout="this.style.background='rgba(59, 130, 246, 0.1)'"><div style="font-size:10px; color:#60a5fa; font-weight:bold;">💬 Partilhado no Feed</div><div style="display:flex; align-items:center; gap:10px;"><span style="font-size:24px;">${icone}</span><span style="flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:13px; font-weight:600;">${a.nome}</span></div></div>`;
                            }
                        });
                    }
                    if (post.texto) {
                        const regexYouTube = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/ig;
                        let match;
                        while ((match = regexYouTube.exec(post.texto)) !== null) {
                            htmlVideos += `<div style="flex: 1; min-width: 250px; border-radius: 12px; overflow: hidden; border: 1px solid #334155; position: relative; padding-bottom: 56.25%; height: 0; background: #000;"><iframe loading="lazy" src="https://www.youtube.com/embed/${match[1]}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen></iframe></div>`;
                        }
                    }
                }
            });
        }

        // NOVO: Adiciona os materiais extraídos da estante de Material Didático
        if (materiaisExtras && Array.isArray(materiaisExtras)) {
            materiaisExtras.forEach(m => {
                let url = m.url.startsWith('http') || m.url.startsWith('/') ? m.url : '/' + m.url;
                const tipoStr = (m.tipoFicheiro || m.url || '').toLowerCase();
                const tituloSeguro = (m.titulo || 'Material da Aula').replace(/'/g, "\\'");
                
                if (tipoStr.includes('video') || tipoStr.endsWith('.mp4')) {
                    htmlVideos += `<div style="flex: 1; min-width: 250px; background: rgba(0,0,0,0.4); border-radius: 12px; overflow: hidden; border: 1px solid #a78bfa;"><div style="background:#4c1d95; padding:4px 10px; font-size:11px; color:#ddd6fe; font-weight:bold;">📚 Acervo do Professor</div><video controls playsinline preload="metadata" style="width:100%; max-height:200px; background:#000;"><source src="${url}"></video><div style="padding:8px; font-size:12px; color:#fff; background:#1e1b4b;">${tituloSeguro}</div></div>`;
                } else if (tipoStr.includes('image') || tipoStr.endsWith('.jpg') || tipoStr.endsWith('.png')) {
                    htmlImagens += `<div style="flex: 1; min-width: 150px; max-width: 200px; border-radius: 12px; overflow: hidden; border: 1px solid #a78bfa;"><div style="background:#4c1d95; padding:4px; font-size:10px; color:#ddd6fe; font-weight:bold; text-align:center;">📚 Acervo</div><img src="${url}" loading="lazy" style="width: 100%; height: 100px; object-fit: cover; cursor: pointer;" onclick="Workspace.Feed.abrirImagemInteira('${url}')"></div>`;
                } else {
                    const ehOffice = tipoStr.endsWith('.docx') || tipoStr.endsWith('.doc') || tipoStr.endsWith('.xlsx') || tipoStr.endsWith('.xls') || tipoStr.endsWith('.ppt');
                    let icone = tipoStr.includes('pdf') || tipoStr.endsWith('.pdf') ? '📕' : '📑';
                    htmlDocs += `<div onclick="Workspace.Feed.abrirDocumento('${url}', '${tituloSeguro}', ${ehOffice})" style="cursor:pointer; display:flex; flex-direction:column; gap:8px; background:rgba(167, 139, 250, 0.1); padding:12px; border-radius:12px; color:#e2e8f0; border:1px solid rgba(167, 139, 250, 0.3); flex: 1; min-width: 200px;" onmouseover="this.style.background='rgba(167, 139, 250, 0.2)'" onmouseout="this.style.background='rgba(167, 139, 250, 0.1)'"><div style="font-size:10px; color:#c4b5fd; font-weight:bold;">📚 Acervo do Professor</div><div style="display:flex; align-items:center; gap:10px;"><span style="font-size:24px;">${icone}</span><span style="flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:13px; font-weight:600;">${m.titulo}</span></div></div>`;
                }
            });
        }

        let painelCompleto = '';
        if (htmlVideos || htmlDocs || htmlImagens) {
            painelCompleto += `<div style="margin-top: 30px; background: rgba(15, 23, 42, 0.6); padding: 25px; border-radius: 16px; border: 1px solid #1e293b;"><h3 style="color: #a78bfa; margin-top: 0; border-bottom: 1px solid #334155; padding-bottom: 10px; font-size: 20px;">📚 Foco de Estudo: Materiais Relevantes</h3>`;
            if (htmlVideos) painelCompleto += `<h4 style="color:#e2e8f0; margin:15px 0 10px 0;">🎥 Vídeos Analisados</h4><div style="display:flex; gap:15px; flex-wrap:wrap;">${htmlVideos}</div>`;
            if (htmlDocs) painelCompleto += `<h4 style="color:#e2e8f0; margin:25px 0 10px 0;">📕 Documentos e Exercícios de Aprofundamento</h4><div style="display:flex; gap:15px; flex-wrap:wrap;">${htmlDocs}</div>`;
            if (htmlImagens) painelCompleto += `<h4 style="color:#e2e8f0; margin:25px 0 10px 0;">🖼️ Imagens</h4><div style="display:flex; gap:15px; flex-wrap:wrap;">${htmlImagens}</div>`;
            painelCompleto += `</div>`;
        }
        return painelCompleto;
    },

    gerarHTMLPerguntaQuiz: (q, index) => {
        return `
            <div style="background: rgba(255,255,255,0.03); padding: 25px; border-radius: 16px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.1);">
                <p style="color: #fff; font-weight: bold; font-size: 17px; margin-top: 0;">${index + 1}. ${Workspace.Feed.formatarIA(q.pergunta)}</p>
                <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
                    ${q.opcoes.map((opcao, optIndex) => `
                        <button id="quiz-opt-${index}-${optIndex}" onclick="Workspace.Feed.verificarQuizImersao(${index}, ${optIndex})" style="background: rgba(0,0,0,0.4); border: 1px solid #334155; color: #e2e8f0; padding: 14px 20px; border-radius: 10px; text-align: left; cursor: pointer; transition: all 0.2s ease; font-size: 15px; font-family: inherit;" onmouseover="this.style.background='rgba(59, 130, 246, 0.2)'; this.style.borderColor='#3b82f6';" onmouseout="this.style.background='rgba(0,0,0,0.4)'; this.style.borderColor='#334155';">${Workspace.Feed.formatarIA(opcao)}</button>
                    `).join('')}
                </div>
                <div id="quiz-exp-${index}" style="display: none; margin-top: 15px; padding: 15px; border-radius: 10px; font-size: 15px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #a7f3d0; line-height: 1.5;"></div>
            </div>
        `;
    },

    renderizarImersao: (dados) => {
        const conteudo = document.getElementById('ws-imersao-conteudo');
        Workspace.Feed._quizImersaoCache = dados.quiz || []; 
        Workspace.Feed._dadosImersaoAtual = dados; 
        Workspace.Feed._notaImersaoAtual = { titulo: dados.tituloNota, conteudo: dados.conteudoParaNota };
        
        let htmlQuiz = '';
        if (dados.quiz && dados.quiz.length > 0) {
            htmlQuiz = `
                <div id="ws-imersao-quiz-container">
                    <h3 style="color: #38bdf8; margin-top: 40px; border-bottom: 1px solid #334155; padding-bottom: 10px; font-size: 22px;">🎯 Quiz de Evolução</h3>
                    <div id="ws-imersao-lista-perguntas">
            `;
            dados.quiz.forEach((q, index) => {
                htmlQuiz += Workspace.Feed.gerarHTMLPerguntaQuiz(q, index);
            });
            htmlQuiz += `
                    </div>
                    <div style="text-align: center; margin-top: 20px;">
                        <button id="ws-btn-mais-quiz" onclick="Workspace.Feed.gerarMaisQuizImersao()" style="background: rgba(56, 189, 248, 0.1); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 12px 24px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 15px;">➕ Quero Mais Perguntas</button>
                    </div>
                </div>
            `;
        }
        
        let htmlNota = '';
        if (dados.tituloNota && dados.conteudoParaNota) {
            htmlNota = `
                <div style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); padding: 25px; border-radius: 16px; margin: 30px 0; text-align: center; animation: fadeIn 0.8s ease;">
                    <div style="font-size: 35px; margin-bottom: 15px; animation: ws-float 3s ease-in-out infinite;">🧰</div>
                    <h3 style="color: #34d399; margin: 0 0 10px 0; font-size: 19px;">Guardar Resumo no Baú das Memórias?</h3>
                    <p style="color: #94a3b8; font-size: 15px; margin-bottom: 20px; max-width: 500px; margin-left: auto; margin-right: auto;">A Inteligência Artificial preparou um material focado nas suas necessidades. Clique abaixo para guardá-lo permanentemente nas suas Anotações!</p>
                    <button id="ws-btn-salvar-nota-ia" onclick="Workspace.Feed.salvarNotaImersao()" style="background: #10b981; color: white; border: none; padding: 14px 28px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 15px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">📝 Guardar nas Anotações</button>
                </div>
            `;
        }

        let resumoSeguro = dados.resumo ? dados.resumo.replace(/```html/g, '').replace(/```/g, '') : '';
        let htmlRecursos = Workspace.Feed.gerarHTMLRecursosImersao(dados.postsRelacionados, dados.materiaisExtras);

        conteudo.innerHTML = `
            <div style="animation: fadeIn 0.5s ease;">
                <h1 style="color: #fff; font-size: 32px; margin-bottom: 20px; background: -webkit-linear-gradient(#60a5fa, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${Workspace.Feed.formatarIA(dados.titulo || 'Aula Imersiva')}</h1>
                <div style="background: rgba(59, 130, 246, 0.05); padding: 25px; border-radius: 16px; margin-bottom: 20px; border-left: 4px solid #3b82f6; font-size: 17px; color: #e2e8f0; line-height: 1.6;">
                    ${Workspace.Feed.formatarIA(resumoSeguro)}
                </div>
                ${htmlNota}
                ${htmlRecursos}
                ${htmlQuiz}
            </div>
        `;
    },

    verificarQuizImersao: (perguntaIndex, opcaoClicada) => {
        const quizCache = Workspace.Feed._quizImersaoCache;
        if (!quizCache || !quizCache[perguntaIndex]) return;
        
        const pergunta = quizCache[perguntaIndex];
        const correta = pergunta.respostaCorreta;
        
        pergunta.opcoes.forEach((_, optIndex) => {
            const btn = document.getElementById(`quiz-opt-${perguntaIndex}-${optIndex}`);
            if (btn) {
                btn.disabled = true;
                btn.style.cursor = 'default';
                btn.onmouseover = null;
                btn.onmouseout = null;
                
                if (optIndex === correta) {
                    btn.style.background = 'rgba(16, 185, 129, 0.2)'; 
                    btn.style.borderColor = '#10b981';
                    btn.style.color = '#fff';
                    btn.style.fontWeight = 'bold';
                } else if (optIndex === opcaoClicada && optIndex !== correta) {
                    btn.style.background = 'rgba(239, 68, 68, 0.2)'; 
                    btn.style.borderColor = '#ef4444';
                    btn.style.color = '#fff';
                } else {
                    btn.style.opacity = '0.5';
                }
            }
        });
        
        const exp = document.getElementById(`quiz-exp-${perguntaIndex}`);
        if (exp) {
            exp.style.display = 'block';
            exp.innerHTML = `💡 <strong>Explicação:</strong> ${Workspace.Feed.formatarIA(pergunta.explicacao)}`;
            exp.style.animation = 'fadeIn 0.3s ease';
        }
    },

    salvarNotaImersao: async () => {
        const nota = Workspace.Feed._notaImersaoAtual;
        if (!nota || !nota.titulo || !nota.conteudo || !Workspace.usuario) return;
        
        const btn = document.getElementById('ws-btn-salvar-nota-ia');
        if (btn) {
            btn.innerHTML = '⏳ A guardar...';
            btn.disabled = true;
        }

        try {
            const res = await Workspace.api('/workspace/bau/notas', 'POST', {
                usuarioId: Workspace.usuario.id,
                titulo: nota.titulo,
                texto: Workspace.Feed.formatarIA(nota.conteudo) 
            });

            if (res && res.success) {
                if (window.Workspace && Workspace.mostrarAviso) {
                    Workspace.mostrarAviso("Anotação guardada no Baú das Memórias! 🧰✨", "success", 4000);
                }
                if (btn) {
                    btn.innerHTML = '✅ Guardado nas Anotações';
                    btn.style.background = '#059669';
                    btn.style.boxShadow = 'none';
                }
                
                if (Workspace.Bau && Workspace.Bau.carregarDadosDaNuvem) {
                    Workspace.Bau.carregarDadosDaNuvem();
                }
            } else {
                throw new Error('Falha no servidor');
            }
        } catch (error) {
            if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Erro ao guardar. Tente novamente.", "error");
            if (btn) {
                btn.innerHTML = '📝 Guardar nas Anotações';
                btn.disabled = false;
            }
        }
    },

 gerarMaisQuizImersao: async () => {
        const btn = document.getElementById('ws-btn-mais-quiz');
        const listaPerguntas = document.getElementById('ws-imersao-lista-perguntas');
        const dadosBase = Workspace.Feed._dadosImersaoAtual;
        
        if (!dadosBase || !listaPerguntas || !btn) return;
        
        btn.innerHTML = '⏳ A gerar novas perguntas...';
        btn.disabled = true;
        btn.style.opacity = '0.7';

        try {
            const res = await Workspace.api('/workspace/posts/imersao/mais-quiz', 'POST', {
                titulo: dadosBase.titulo,
                resumo: dadosBase.resumo
            });

            if (res && res.success && res.novasPerguntas) {
                const quizInicioIndex = Workspace.Feed._quizImersaoCache.length;
                
                res.novasPerguntas.forEach(novaPergunta => {
                    Workspace.Feed._quizImersaoCache.push(novaPergunta);
                });

                let novasHtml = '';
                res.novasPerguntas.forEach((q, i) => {
                    novasHtml += Workspace.Feed.gerarHTMLPerguntaQuiz(q, quizInicioIndex + i);
                });

                listaPerguntas.insertAdjacentHTML('beforeend', novasHtml);
            } else {
                throw new Error('Falha ao gerar');
            }
        } catch (error) {
            if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("A IA precisa de uma pausa. Tente gerar perguntas daqui a pouco.", "warning");
        } finally {
            btn.innerHTML = '➕ Quero Mais Perguntas';
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    }, // 🚀 A VÍRGULA MÁGICA ADICIONADA AQUI!

    // ------------------------------------------------------------------------
    // 🎶 MÓDULO: IMERSÃO MUSICAL (7 DIAS DE TREINO)
    // ------------------------------------------------------------------------
    abrirImersaoMusical: () => {
        const modal = document.getElementById('ws-imersao-musical-modal');
        if (modal) {
            document.body.style.overflow = 'hidden'; 
            modal.style.display = 'flex';
            requestAnimationFrame(() => modal.style.opacity = '1');
        }
    },

    fecharImersaoMusical: () => {
        const modal = document.getElementById('ws-imersao-musical-modal');
        if (modal) {
            document.body.style.overflow = '';
            modal.style.opacity = '0';
            setTimeout(() => modal.style.display = 'none', 300);
        }
    },

    gerarImersaoMusical: async () => {
        const btn = document.getElementById('ws-btn-gerar-musica');
        const conteudo = document.getElementById('ws-imersao-musical-conteudo');
        
        if (btn) {
            btn.innerText = 'Procurando Músicas no Feed... ⏳';
            btn.disabled = true;
            btn.style.opacity = '0.7';
        }
        
        conteudo.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 50px; animation: pulse 1.5s infinite;">🎧</div>
                <h3 style="color: #fff; margin-top: 20px;">A afinar os instrumentos...</h3>
                <p style="color: #a1a1aa;">A analisar letras e a construir o seu plano de 7 dias.</p>
            </div>
        `;
        
        try {
            const refId = Workspace.usuario.alunoRefId || '';
            const escolaId = Workspace.usuario.escolaId || 'DEFAULT';
            
            const res = await Workspace.api('/workspace/posts/imersao-musical', 'POST', {
                alunoRefId: refId, escolaId
            });
            
            if (res && res.success && res.plano) {
                Workspace.Feed.renderizarImersaoMusical(res.plano, res.postOriginal);
            } else {
                throw new Error(res?.error || 'A IA não conseguiu gerar o plano.');
            }
        } catch (error) {
            conteudo.innerHTML = `
                <div style="text-align: center; padding: 40px; background: rgba(239, 68, 68, 0.1); border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.3);">
                    <h3 style="color: #f87171;">Faltam Músicas ❌</h3>
                    <p style="color: #fca5a5;">${error.message || 'Certifique-se de que partilha publicações com vídeos do Youtube/Spotify contendo as palavras "música" ou "letra".'}</p>
                </div>
            `;
        } finally {
            if (btn) {
                btn.innerHTML = 'Analisar Feed e Criar Plano Musical 🎧';
                btn.disabled = false;
                btn.style.opacity = '1';
            }
        }
    },

    renderizarImersaoMusical: (plano, postOriginal) => {
        const conteudo = document.getElementById('ws-imersao-musical-conteudo');
        
        let htmlVideo = '';
        if (postOriginal) {
            const textoSeguro = Workspace.Feed.processarTextoComEmbeds(postOriginal.texto || '');
            const anexos = Workspace.Feed.renderizarAnexos(postOriginal.anexos, 'musica');
            
            htmlVideo = `
                <div style="background: rgba(0,0,0,0.3); border: 1px solid #3f3f46; padding: 20px; border-radius: 16px; margin-bottom: 30px;">
                    <div style="font-size: 13px; color: #ec4899; font-weight: bold; text-transform: uppercase; margin-bottom: 10px;">Vídeo Fonte da Imersão</div>
                    <div style="color: #d4d4d8; font-size: 14px; margin-bottom: 15px;">${textoSeguro}</div>
                    ${anexos}
                </div>
            `;
        }

        let htmlDias = '';
        if (plano.plano7Dias && plano.plano7Dias.length > 0) {
            plano.plano7Dias.forEach(dia => {
                htmlDias += `
                    <div style="background: #27272a; border-left: 5px solid #ec4899; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <h4 style="margin: 0; color: #fff; font-size: 18px;">Dia ${dia.dia}</h4>
                            <span style="background: rgba(236, 72, 153, 0.2); color: #f9a8d4; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;">Frase Diária</span>
                        </div>
                        <div style="font-size: 22px; font-weight: 800; color: #fdf2f8; margin-bottom: 5px; font-style: italic;">"${Workspace.Feed.formatarIA(dia.fraseOriginal)}"</div>
                        <div style="font-size: 15px; color: #a1a1aa; margin-bottom: 15px; border-bottom: 1px dashed #3f3f46; padding-bottom: 15px;">Trad: ${Workspace.Feed.formatarIA(dia.traducao)}</div>
                        
                        <div style="margin-bottom: 15px;">
                            <strong style="color: #ec4899; font-size: 14px;">👩‍🏫 Foco da IA:</strong>
                            <div style="color: #d4d4d8; font-size: 15px; margin-top: 5px;">${Workspace.Feed.formatarIA(dia.explicacao)}</div>
                        </div>
                        
                        <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; border: 1px solid #3f3f46;">
                            <strong style="color: #fb7185; font-size: 14px;">🔥 O Seu Desafio:</strong>
                            <div style="color: #e4e4e7; font-size: 14px; margin-top: 5px;">${Workspace.Feed.formatarIA(dia.desafio)}</div>
                        </div>
                    </div>
                `;
            });
        }

        conteudo.innerHTML = `
            <div style="animation: fadeIn 0.5s ease;">
                <h1 style="color: #fff; font-size: 30px; margin-bottom: 10px; text-align: center;">${Workspace.Feed.formatarIA(plano.tituloMusica)}</h1>
                <p style="text-align: center; color: #a1a1aa; margin-bottom: 30px;">O seu plano de 7 dias de fluência focado nesta música.</p>
                ${htmlVideo}
                ${htmlDias}
            </div>
        `;
    }
};