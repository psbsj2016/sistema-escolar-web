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
        Workspace.Feed.injetarBotaoImersao(); 
        
        if (window.Workspace && Workspace.Arena) {
            Workspace.Arena.init();
        }

        try {
            const avataresRes = await Workspace.api('/workspace/avatars', 'GET');
            if (avataresRes && !avataresRes.error) {
                window.Workspace.mapaAvatars = avataresRes;
            }
        } catch(e) {}

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

                const btnArena = document.createElement('button');
                btnArena.className = 'ws-filter-chip';
                btnArena.style.cssText = 'background: linear-gradient(135deg, #f59e0b, #ea580c) !important; color: white !important; border: none !important; box-shadow: 0 4px 15px rgba(234, 88, 12, 0.4) !important; font-weight: 800 !important; padding: 10px 18px !important; font-size: 14px !important; border-radius: 20px !important; cursor: pointer !important; display: inline-flex !important; align-items: center !important; flex-shrink: 0 !important;';
                btnArena.innerHTML = '⚔️ Arena de Fluência';
                
                btnArena.onclick = () => { 
                    if (window.Workspace && Workspace.Arena) {
                        if (!document.getElementById('ws-modal-arena')) Workspace.Arena.init();
                        Workspace.Arena.abrirPainel(); 
                    } else {
                        if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("O motor da Arena não foi encontrado.", "error");
                    }
                };

                wrapper.appendChild(btnImersao);
                wrapper.appendChild(btnMusica);
                wrapper.appendChild(btnArena);
                
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
                    if (elementoHTML) elementoHTML.remove(); 
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
            
            const modalImersao = `
                <div id="ws-imersao-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #0f172a; z-index: 100030; flex-direction: column; opacity: 0; transition: opacity 0.3s; overflow-y: auto;">
                    <div style="padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; background: rgba(15, 23, 42, 0.9); position: sticky; top: 0; z-index: 10; backdrop-filter: blur(10px); border-bottom: 1px solid #1e293b;">
                        <h2 style="color: #fff; margin: 0; font-size: 20px; display: flex; align-items: center; gap: 10px;">🌌 Imersão Específica</h2>
                        <button onclick="Workspace.Feed.fecharImersao()" style="background: rgba(255,255,255,0.1); border: none; color: #fff; font-size: 16px; cursor: pointer; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">✖</button>
                    </div>
                    
                    <div style="padding: 20px; max-width: 800px; margin: 0 auto; width: 100%; box-sizing: border-box;">
                        <div style="display: flex; gap: 10px; margin-bottom: 30px; flex-wrap: wrap;">
                            <input type="text" id="ws-imersao-busca" placeholder="O que deseja estudar agora? (Ex: Phrasal Verbs, Viagem...)" style="flex: 1; min-width: 250px; padding: 16px; border-radius: 12px; border: 1px solid #334155; font-size: 16px; outline: none; background: #1e293b; color: #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.2);" onkeypress="if(event.key === 'Enter') Workspace.Feed.gerarImersao()">
                            <button onclick="Workspace.Feed.gerarImersao()" id="ws-btn-gerar-imersao" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; border: none; padding: 16px 24px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 16px; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);">Gerar Aula da IA 🪄</button>
                        </div>
                        <div id="ws-imersao-conteudo" style="color: #cbd5e1; font-size: 16px; line-height: 1.6;">
                            <div style="text-align: center; padding: 50px 20px; color: #64748b;">
                                <div style="font-size: 60px; margin-bottom: 15px; animation: ws-float 3s ease-in-out infinite;">🤖</div>
                                <h3 style="color: #94a3b8; font-size: 22px;">O seu Professor Particular IA</h3>
                                <p style="max-width: 500px; margin: 0 auto;">Pesquise um tema específico ou clique diretamente em "Gerar". A Inteligência Artificial vai vasculhar o Feed da sua turma, criar uma aula resumo imersiva e fabricar um Quiz de Evolução para você.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const modalMusica = `
                <div id="ws-imersao-musical-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #18181b; z-index: 100030; flex-direction: column; opacity: 0; transition: opacity 0.3s; overflow-y: auto;">
                    <div style="padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; background: rgba(24, 24, 27, 0.9); position: sticky; top: 0; z-index: 10; backdrop-filter: blur(10px); border-bottom: 1px solid #3f3f46;">
                        <h2 style="color: #fff; margin: 0; font-size: 20px; display: flex; align-items: center; gap: 10px;">🎶 Inglês com Música</h2>
                        <button onclick="Workspace.Feed.fecharImersaoMusical()" style="background: rgba(255,255,255,0.1); border: none; color: #fff; font-size: 16px; cursor: pointer; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">✖</button>
                    </div>
                    <div style="padding: 20px; max-width: 800px; margin: 0 auto; width: 100%; box-sizing: border-box;">
                        <div style="display: flex; gap: 10px; margin-bottom: 30px; justify-content: center;">
                            <button onclick="Workspace.Feed.gerarImersaoMusical()" id="ws-btn-gerar-musica" style="background: linear-gradient(135deg, #ec4899, #f43f5e); color: white; border: none; padding: 16px 30px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 16px; box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4); width: 100%;">Analisar Feed e Criar Plano Musical 🎧</button>
                        </div>
                        <div id="ws-imersao-musical-conteudo" style="color: #e4e4e7; font-size: 16px; line-height: 1.6;">
                            <div style="text-align: center; padding: 50px 20px; color: #a1a1aa;">
                                <div style="font-size: 60px; margin-bottom: 15px; animation: ws-float 3s ease-in-out infinite;">🎸</div>
                                <h3 style="color: #d4d4d8; font-size: 22px;">O Poder da Repetição Espaçada</h3>
                                <p style="max-width: 500px; margin: 0 auto;">A Inteligência Artificial vai vasculhar a turma por vídeos musicais partilhados e desenhar um plano de alguns dias com as frases e gírias mais importantes para você.</p>
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
        else if (tipoFiltro === 'musica') {
            listaFiltrada = Workspace.Feed.todosOsPosts.filter(p => p.categoria === 'musica');
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
                
                document.querySelectorAll('.ws-video-embed').forEach(iframe => {
                    if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                    }
                });
            };
        });

        if (Workspace.Feed.videoObserver) Workspace.Feed.videoObserver.disconnect();
        
        Workspace.Feed.videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    const el = entry.target;
                    if (el.tagName === 'VIDEO' && !el.paused) {
                        el.pause(); 
                    } 
                    else if (el.tagName === 'IFRAME') {
                        if (el && el.contentWindow) {
                            el.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                        }
                    }
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
                let videoUrlHacked = url.includes('#') ? url : url + '#t=0.001';

                htmlFinal += `
                <div style="margin-top: 15px; width: 100%; border-radius: 12px; border: 1px solid #eee; box-shadow: 0 4px 10px rgba(0,0,0,0.05); background: #000; overflow: hidden; display: flex; justify-content: center; align-items: center;">
                    <video controls playsinline preload="metadata" class="ws-feed-video" src="${videoUrlHacked}" style="width:100%; max-height:450px; outline:none; border:none; background:#000; object-fit: contain;">
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

        containerText.classList.remove('ws-text-collapsed');
        
        const btnLerMais = document.getElementById(`btn-ler-mais-${postId}`);
        if(btnLerMais) btnLerMais.style.display = 'none';

        const textAtual = post.texto || '';
        const categoriaAtual = post.categoria || 'normal'; 

        containerText.innerHTML = `
            <div style="background:#f4f6f7; padding:12px; border-radius:8px; border:1px solid #ddd; margin-bottom:10px; animation: fadeIn 0.3s; column-span: all; break-inside: avoid;" onclick="event.stopPropagation()">
                
                <div style="margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
                    <label style="font-size:12px; font-weight:bold; color:#555;">Categoria do Post:</label>
                    <select id="edit-categoria-${postId}" style="padding: 6px 12px; border-radius: 6px; border: 1px solid #ccc; font-family: inherit; font-size: 13px; outline: none; background: #fff; cursor: pointer;">
                        <option value="normal" ${categoriaAtual === 'normal' ? 'selected' : ''}>📝 Post Normal</option>
                        <option value="musica" ${categoriaAtual === 'musica' ? 'selected' : ''}>🎵 Música c/ Letra</option>
                    </select>
                </div>

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
        const selectCat = document.getElementById(`edit-categoria-${postId}`); 
        if(!input) return;
        
        const novoTexto = input.value.trim();
        const novaCategoria = selectCat ? selectCat.value : 'normal';
        
        const btn = event.target;
        btn.innerText = "⏳ A gravar..."; btn.disabled = true;

        try {
            const res = await Workspace.api(`/workspace/posts/${postId}`, 'PUT', { texto: novoTexto, categoria: novaCategoria });
            if(res && res.success) {
                const post = Workspace.Feed.postsCache.find(p => String(p.id) === String(postId));
                if(post) {
                    post.texto = novoTexto;
                    post.categoria = novaCategoria; 
                }
                
                Workspace.Feed.cancelarEdicaoPost(postId);
                Workspace.Feed.filtrarFeed(Workspace.Feed.filtroAtivo);
                
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

            let categoriaBadge = p.categoria === 'musica' 
                ? `<span style="font-size:10px; background:#fce7f3; color:#db2777; padding:2px 6px; border-radius:4px; margin-left:5px; font-weight:bold;">🎵 Música</span>` 
                : '';

            const likesArr = Array.isArray(p.likes) ? p.likes : [];
            const dislikesArr = Array.isArray(p.dislikes) ? p.dislikes : [];
            const euCurti = likesArr.includes(meuId);
            const euNaoCurti = dislikesArr.includes(meuId);
            
            const displayComentarios = Workspace.Feed.comentariosAbertos.has(p.id) ? 'block' : 'none';

            const numLinhas = (p.texto ? (p.texto.match(/\n/g) || []).length : 0);
            const ehTextoLongo = (p.texto && p.texto.length > 350) || numLinhas > 8;
            const ehMusica = numLinhas >= 10; 
            
            const estiloColunas = ehMusica ? 'column-width: 250px; column-gap: 30px; widows: 3; orphans: 3;' : '';

            const btnVerMais = `<div id="btn-ler-mais-${p.id}" style="margin-top: 8px; display: ${ehTextoLongo ? 'block' : 'none'};"><span onclick="Workspace.Feed.toggleTextoPost(this, '${p.id}')" style="color: #3498db; font-size: 13px; font-weight: bold; cursor: pointer; background: rgba(52,152,219,0.1); padding: 5px 12px; border-radius: 14px; transition: 0.2s;" onmouseover="this.style.background='rgba(52,152,219,0.2)'" onmouseout="this.style.background='rgba(52,152,219,0.1)'">Ler mais ⬇️</span></div>`;

            let cardDesafioArena = '';
            if (p.texto && p.texto.includes('Quem tem coragem') && p.texto.includes('na Arena')) {
                const ehMeuProprioDesafio = Workspace.usuario && (Workspace.usuario.nome === p.autorNome || Workspace.usuario.login === p.autorNome);
                
                let botaoAcao = '';
                if (ehMeuProprioDesafio) {
                    botaoAcao = `<div style="color: #ea580c; font-size: 13px; font-weight: bold; background: rgba(234, 88, 12, 0.1); padding: 8px 12px; border-radius: 8px;">A aguardar oponentes... ⏳</div>`;
                } else {
                    botaoAcao = `
                        <button id="btn-desafio-${p.id}" onclick="if(window.Workspace && Workspace.Feed){ Workspace.Feed.enviarDesafioDireto('${Workspace.Feed.limparTexto(p.autorNome)}', 10, '${p.id}'); } else { alert('Aguarde um segundo!'); }" style="background: linear-gradient(135deg, #f59e0b, #ea580c); color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: bold; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 10px rgba(234, 88, 12, 0.3); font-size: 13px; display: flex; align-items: center; gap: 6px;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            Aceitar Desafio (10 Min) ⏱️
                        </button>
                    `;
                }

                cardDesafioArena = `
                    <div style="margin-top: 15px; border-radius: 12px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(234, 88, 12, 0.1)); border: 1px solid rgba(245, 158, 11, 0.3); padding: 15px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; animation: popUp 0.5s ease;">
                        <div>
                            <strong style="color: #ea580c; display: flex; align-items: center; gap: 5px; font-size: 15px;">⚔️ Desafio da Arena</strong>
                            <span style="color: #64748b; font-size: 13px;">Duelo Rápido: 10 Minutos de Pura Adrenalina!</span>
                        </div>
                        ${botaoAcao}
                    </div>
                `;
            }

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
                                    <span ${tempoAttr}>${tempoAmigavel}</span> ${destinoBadge} ${categoriaBadge}
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
                    
                    ${cardDesafioArena}

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
                
                const selCategoria = document.getElementById('ws-post-categoria');
                const categoriaPost = selCategoria ? selCategoria.value : 'normal';

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
                        texto: texto, escolaId: Workspace.usuario.escolaId, autorNome: Workspace.usuario.nome || Workspace.usuario.login, autorTipo: Workspace.usuario.tipo, anexos: urlsFinais, destino: destino, destinoNome: destinoNome,
                        categoria: categoriaPost 
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

    abrirPerfilUsuario: async (autorNome) => {
        const id = 'ws-perfil-visitante-modal';
        if(document.getElementById(id)) document.getElementById(id).remove();
        
        document.body.style.cursor = 'wait';
        
        let res = null;
        try {
            res = await Workspace.api(`/workspace/perfil/info/${encodeURIComponent(autorNome)}`, 'GET');
        } catch(e) {}
        
        document.body.style.cursor = 'default';

        let avatarHTML = window.Workspace.renderizarAvatar(autorNome, 100);
        let bioReal = "A evoluir e a participar ativamente na nossa comunidade de aprendizagem.";
        let tipoMembro = "Aluno"; let iconeMembro = "📚"; let corFundo = "#e0e7ff"; let corTexto = "#2563eb";
        let avatarFinalHTML = avatarHTML;
        let arenaHtml = ''; 

        if (res && res.success) {
            if (res.bio) bioReal = Workspace.Feed.limparTexto(res.bio);
            if (res.tipo === 'Professor') { tipoMembro = "Professor"; iconeMembro = "🎓"; corFundo = "#fef08a"; corTexto = "#d97706"; }
            else if (res.tipo === 'Gestor') { tipoMembro = "Gestor"; iconeMembro = "🛡️"; corFundo = "#fce7f3"; corTexto = "#db2777"; }

            if (res.avatar) {
                const urlSegura = res.avatar.startsWith('http') ? res.avatar : '/' + res.avatar;
                const novoSrc = `${urlSegura}?t=${Date.now()}`; 
                if (avatarFinalHTML.includes('<img')) {
                    avatarFinalHTML = avatarFinalHTML.replace(/src="([^"]+)"/, `src="${novoSrc}"`);
                } else {
                    avatarFinalHTML = `<img src="${novoSrc}" alt="${autorNome}">`;
                }
            }

            if (tipoMembro === "Aluno") {
                let arenaStats = res.arenaStats || (res.usuario && res.usuario.arenaStats) || null;
                let cristalArena = arenaStats ? (arenaStats.cristalAtual || 'Safira') : 'Safira';
                let tituloArena = arenaStats ? (arenaStats.tituloAtual || 'Iniciante da Arena') : 'Iniciante da Arena';
                
                let corCristal = '#3b82f6'; let emojiCristal = '🔷'; let glow = 'rgba(59, 130, 246, 0.1)';
                if (cristalArena.includes('Diamante')) { corCristal = '#06b6d4'; emojiCristal = '💎'; glow = 'rgba(6, 182, 212, 0.1)'; }
                else if (cristalArena.includes('Rubi')) { corCristal = '#ef4444'; emojiCristal = '🟥'; glow = 'rgba(239, 68, 68, 0.1)'; }
                else if (cristalArena.includes('Ametista')) { corCristal = '#a855f7'; emojiCristal = '🟪'; glow = 'rgba(168, 85, 247, 0.1)'; }

                arenaHtml = `
                    <div style="background: ${glow}; border: 1px solid rgba(0,0,0,0.05); padding: 8px 15px; border-radius: 12px; display: inline-flex; align-items: center; gap: 12px; margin-bottom: 20px; text-align: left; box-shadow: 0 2px 10px ${glow};">
                        <div style="font-size: 24px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); animation: ws-float 3s ease-in-out infinite;">${emojiCristal}</div>
                        <div style="line-height: 1.2;">
                            <div style="font-size: 9px; color: #64748b; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Status de Eloquência</div>
                            <div style="color: ${corCristal}; font-size: 15px; font-weight: 900; letter-spacing: -0.3px;">${tituloArena}</div>
                        </div>
                    </div>
                    <br>
                `;
            }
        }

        const overlay = document.createElement('div');
        overlay.id = id;
        overlay.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100dvh; background:rgba(15, 23, 42, 0.85); z-index:100020; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(8px); opacity:0; transition: opacity 0.3s ease-in-out;";
        
        const estiloAvatar = `
            <style>
                .ws-avatar-perfect img { 
                    width: 100% !important; 
                    height: 100% !important; 
                    object-fit: contain !important; 
                    object-position: center !important; 
                    margin: 0 !important; 
                    padding: 0 !important; 
                    display: block !important; 
                    border-radius: 12px !important; 
                }
                .ws-avatar-perfect > div { 
                    width: 100% !important; 
                    height: 100% !important; 
                    display: flex !important; 
                    align-items: center !important; 
                    justify-content: center !important; 
                    border-radius: 12px !important; 
                    margin: 0 !important; 
                }
                .ws-avatar-perfect div[style*="absolute"][style*="border-radius"] {
                    transform: scale(0.65);
                    transform-origin: bottom right;
                    bottom: -3px !important;
                    right: -3px !important;
                }
            </style>
        `;

        overlay.innerHTML = `
            ${estiloAvatar}
            <div class="ws-card" style="width: 90%; max-width: 360px; text-align: center; padding: 0; background: #fff; border-radius: 20px; position: relative; transform: scale(0.9); transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); margin:0; box-shadow: 0 25px 50px rgba(0,0,0,0.3); overflow: visible;">
                <div style="position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.3); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; z-index: 10; backdrop-filter: blur(5px); transition: 0.2s;" onmouseover="this.style.background='rgba(231, 76, 60, 0.9)'" onmouseout="this.style.background='rgba(0,0,0,0.3)'" onclick="document.getElementById('${id}').style.opacity='0'; setTimeout(()=>document.getElementById('${id}').remove(), 300);" title="Fechar">✖</div>
                
                <div style="height: 110px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); position: relative; width: 100%; border-top-left-radius: 20px; border-top-right-radius: 20px; overflow: hidden;">
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.15; background-image: radial-gradient(#fff 2px, transparent 2px); background-size: 20px 20px;"></div>
                </div>
                
                <div class="ws-avatar-perfect" style="width:100px; height:100px; margin: -50px auto 15px auto; border-radius:12px; box-shadow: 0 5px 15px rgba(0,0,0,0.15); border: 4px solid #fff; position: relative; z-index: 2; background: #f0f2f5;">
                    ${avatarFinalHTML}
                </div>
                
                <div style="padding: 0 25px 30px 25px; animation: fadeIn 0.3s ease;">
                    <h2 style="margin: 0 0 8px 0; color: #1e293b; font-size: 22px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 6px;">
                        ${Workspace.Feed.limparTexto(autorNome)}
                        <span style="color: #3b82f6; font-size: 16px; background: #eff6ff; border-radius: 50%; padding: 2px;" title="Conta Verificada">✔️</span>
                    </h2>
                    
                    <div style="display: inline-block; background: ${corFundo}; color: ${corTexto}; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 800; margin-bottom: 15px; letter-spacing: 0.5px; text-transform: uppercase;">
                        ${iconeMembro} ${tipoMembro}
                    </div>
                    
                    ${arenaHtml}

                    <p style="margin: 0 0 25px 0; color: #64748b; font-size: 14px; line-height: 1.5; font-style: italic;">
                        "${bioReal}"
                    </p>
                    <button onclick="document.getElementById('${id}').style.opacity='0'; setTimeout(()=>document.getElementById('${id}').remove(), 300);" style="width: 100%; background: #f1f5f9; color: #475569; border: none; padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#e2e8f0'; this.style.color='#1e293b'" onmouseout="this.style.background='#f1f5f9'; this.style.color='#475569'">
                        Voltar ao Feed
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        requestAnimationFrame(() => { overlay.style.opacity = '1'; overlay.children[1].style.transform = 'scale(1)'; });
        
        overlay.addEventListener('click', (e) => { 
            if(e.target === overlay) { overlay.style.opacity = '0'; overlay.children[1].style.transform = 'scale(0.9)'; setTimeout(() => overlay.remove(), 300); } 
        });
    },

    treinarPronunciaMusical: (dia, fraseOriginal) => {
        const btn = document.getElementById(`btn-mic-dia-${dia}`);
        const feedbackBox = document.getElementById(`feedback-mic-dia-${dia}`);
        if (!btn || !feedbackBox) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("O seu navegador não suporta reconhecimento de voz direto. Tente usar o Google Chrome.", "error");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US'; 
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        btn.innerHTML = '<span style="font-size: 16px; animation: pulse 1s infinite;">🔴</span> A ouvir... Fale agora!';
        btn.style.background = '#ef4444';
        feedbackBox.style.display = 'none';

        recognition.start();

        recognition.onresult = async (event) => {
            const transcricao = event.results[0][0].transcript;
            btn.innerHTML = '⏳ A avaliar...';
            btn.style.background = '#f59e0b';
            
            try {
                const res = await Workspace.api('/workspace/ingles/jogo/avaliar', 'POST', {
                    jogo: 'readAloud',
                    pergunta: fraseOriginal,
                    respostaAluno: transcricao
                });

                feedbackBox.style.display = 'block';
                if (res && res.correto) {
                    btn.innerHTML = '<span style="font-size: 16px;">⭐</span> Perfeito!';
                    btn.style.background = '#10b981';
                    
                    const elogios = [
                        "ESPETACULAR! 🌟", 
                        "PRONÚNCIA PERFEITA! 🎯", 
                        "MIND-BLOWING! 🤯", 
                        "SIMPLESMENTE BRILHANTE! 🏆", 
                        "UAU! PARECE NATIVO! 🇺🇸",
                        "VOCÊ ESTÁ ON FIRE! 🔥"
                    ];
                    const elogioSorteado = elogios[Math.floor(Math.random() * elogios.length)];
                    
                    feedbackBox.innerHTML = `<strong>A IA ouviu:</strong> "${transcricao}"<br><br>✅ <strong>Feedback:</strong> ${res.feedback}<br><div style="color:#10b981; font-weight: 900; font-size: 20px; margin-top: 15px; text-align: center; animation: pulse 1s infinite;">${elogioSorteado}</div>`;
                    Workspace.Feed.dispararConfetes();

                } else {
                    btn.innerHTML = '<span style="font-size: 16px;">🎙️</span> Tentar Novamente';
                    btn.style.background = '#8b5cf6';
                    feedbackBox.innerHTML = `<strong>A IA ouviu:</strong> "${transcricao}"<br><br>❌ <strong>Feedback:</strong> ${res?.feedback || 'Tente pronunciar com mais clareza.'}<br><strong>Dica:</strong> ${res?.correcao || ''}`;
                }
            } catch (error) {
                if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Erro ao comunicar com a IA de pronúncia.", "error");
                btn.innerHTML = '<span style="font-size: 16px;">🎙️</span> Treinar Pronúncia';
                btn.style.background = '#8b5cf6';
            }
        };

        recognition.onerror = (event) => {
            if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Não conseguimos ouvir. Permita o uso do microfone e tente novamente.", "warning");
            btn.innerHTML = '<span style="font-size: 16px;">🎙️</span> Treinar Pronúncia';
            btn.style.background = '#8b5cf6';
        };
    },

    dispararConfetes: () => {
        const cores = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
        for (let i = 0; i < 70; i++) {
            const confete = document.createElement('div');
            confete.style.position = 'fixed';
            confete.style.width = Math.random() * 8 + 6 + 'px';
            confete.style.height = Math.random() * 8 + 6 + 'px';
            confete.style.background = cores[Math.floor(Math.random() * cores.length)];
            confete.style.top = '-10px';
            confete.style.left = Math.random() * 100 + 'vw';
            confete.style.opacity = Math.random() + 0.5;
            confete.style.zIndex = '9999999';
            confete.style.pointerEvents = 'none';
            confete.style.borderRadius = Math.random() > 0.5 ? '50%' : '0px'; 
            document.body.appendChild(confete);

            const duracao = Math.random() * 2 + 2; 
            const animacao = confete.animate([
                { transform: `translate3d(0,0,0) rotate(0deg)`, opacity: 1 },
                { transform: `translate3d(${Math.random() * 200 - 100}px, 100vh, 0) rotate(${Math.random() * 720}deg)`, opacity: 0 }
            ], { duration: duracao * 1000, easing: 'cubic-bezier(.37,0,.63,1)' });

            animacao.onfinish = () => confete.remove();
        }
    },

    editarBioPerfil: () => {
        const viewMode = document.getElementById('ws-bio-view-mode');
        const editMode = document.getElementById('ws-bio-edit-mode');
        const input = document.getElementById('ws-input-bio-perfil');

        if(viewMode && editMode && input) {
            viewMode.style.display = 'none';
            editMode.style.display = 'flex';
            
            if (Workspace.usuario && Workspace.usuario.bio) {
                input.value = Workspace.usuario.bio;
            }
            input.focus();
        }
    },

    cancelarEdicaoBio: () => {
        const viewMode = document.getElementById('ws-bio-view-mode');
        const editMode = document.getElementById('ws-bio-edit-mode');
        
        if(viewMode && editMode) {
            editMode.style.display = 'none';
            viewMode.style.display = 'flex';
        }
    },

    salvarBioPerfil: async () => {
        const input = document.getElementById('ws-input-bio-perfil');
        const btn = document.getElementById('ws-btn-salvar-bio');
        const textoAtual = document.getElementById('ws-texto-bio-atual');
        if(!input || !btn || !Workspace.usuario) return;

        const novaBio = input.value.trim();
        btn.innerText = '⏳';
        btn.disabled = true;

        try {
            const res = await Workspace.api('/workspace/perfil/bio', 'PUT', {
                id: Workspace.usuario.id,
                bio: novaBio
            });
            
            if (res && res.success) {
                if(Workspace.mostrarAviso) Workspace.mostrarAviso("Frase de perfil atualizada!", "success");
                
                Workspace.usuario.bio = novaBio;
                
                if(textoAtual) {
                    textoAtual.innerText = novaBio !== '' ? `"${novaBio}"` : 'Sem frase no momento.';
                }
                
                Workspace.Feed.cancelarEdicaoBio();
            } else throw new Error();
        } catch(e) {
            if(Workspace.mostrarAviso) Workspace.mostrarAviso("Erro ao atualizar a frase.", "error");
        } finally {
            btn.innerText = '💾 Salvar';
            btn.disabled = false;
        }
    },

    apagarBioPerfil: async () => {
        if (!Workspace.usuario) return;
        
        Workspace.Feed.confirmarAcao("Apagar Frase", "Tem a certeza que deseja apagar a sua frase de perfil?", async () => {
            try {
                const res = await Workspace.api('/workspace/perfil/bio', 'PUT', {
                    id: Workspace.usuario.id,
                    bio: ''
                });
                
                if (res && res.success) {
                    Workspace.usuario.bio = '';
                    
                    const textoAtual = document.getElementById('ws-texto-bio-atual');
                    if(textoAtual) textoAtual.innerText = 'Sem frase no momento.';
                    
                    const input = document.getElementById('ws-input-bio-perfil');
                    if(input) input.value = '';

                    Workspace.Feed.cancelarEdicaoBio();
                    
                    if(Workspace.mostrarAviso) Workspace.mostrarAviso("Frase removida com sucesso!", "success");
                }
            } catch(e) {
                if(Workspace.mostrarAviso) Workspace.mostrarAviso("Erro ao remover a frase.", "error");
            }
        });
    },

    enviarDesafioDireto: async (desafiadoNome, minutos, postId) => {
        const btn = document.getElementById(`btn-desafio-${postId}`);
        if (btn) {
            btn.innerHTML = 'A enviar convite... ⏳';
            btn.disabled = true;
            btn.style.opacity = '0.8';
        }

        try {
            const res = await Workspace.api('/workspace/arena/desafio-direto', 'POST', {
                desafiadoNome: desafiadoNome,
                desafianteNome: Workspace.usuario.nome || Workspace.usuario.login,
                escolaId: Workspace.usuario.escolaId,
                minutos: minutos,
                postId: postId 
            });

            if (res && res.success) {
                if (btn) btn.innerHTML = 'A aguardar que oponente aceite... ⏳';
                Workspace.Feed._ultimoBotaoDesafioPendente = `btn-desafio-${postId}`;
                
                setTimeout(() => {
                    const btnAtrasado = document.getElementById(`btn-desafio-${postId}`);
                    if (btnAtrasado && btnAtrasado.innerHTML.includes('A aguardar')) {
                        btnAtrasado.innerHTML = 'Aceitar Desafio (10 Min) ⏱️';
                        btnAtrasado.disabled = false;
                        btnAtrasado.style.opacity = '1';
                        Workspace.Feed._ultimoBotaoDesafioPendente = null;
                    }
                }, 60000); 

            } else {
                throw new Error(res.error || 'Falha ao enviar convite');
            }
        } catch (error) {
            if (btn) {
                btn.innerHTML = 'Aceitar Desafio (10 Min) ⏱️';
                btn.disabled = false;
                btn.style.opacity = '1';
            }
            if (window.Workspace && Workspace.mostrarAviso) {
                Workspace.mostrarAviso(error.message || "Erro ao enviar o convite.", "error");
            }
        }
    }

};