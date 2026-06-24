// js/modulos/workspace/feed.js
window.Workspace = window.Workspace || {};

Workspace.Feed = {
    todosOsPosts: [],
    postsCache: [],
    comentariosAbertos: new Set(),
    paginaAtual: 1,
    observer: null,
    videoObserver: null,
    radarNovosPosts: null, 
    listenerFechamentoConfigurado: false,
    filtroAtivo: 'todos', 

    init: async () => {
        console.log("📚 Motor do Feed ligado à API.");
        Workspace.Feed.injetarCSSAnimacoes(); 
        Workspace.Feed.injetarModaisGlobais(); // 🚀 Injeta modais de exclusão bonitos
        await Workspace.Feed.carregarPosts();
        Workspace.Feed.configurarEventosCriacao();
        
        if (!Workspace.Feed.listenerFechamentoConfigurado) {
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.ws-menu-ancora')) {
                    Workspace.Feed.fecharMenus();
                }
            });
            Workspace.Feed.listenerFechamentoConfigurado = true;
        }
    },

    // 🚀 NOVIDADE: Injeta Modal Bonito de Confirmação e Action Sheet de Comentários
    injetarModaisGlobais: () => {
        if (!document.getElementById('ws-confirm-modal')) {
            const modaisHTML = `
                <div id="ws-confirm-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10005; align-items: center; justify-content: center; backdrop-filter: blur(4px); opacity: 0; transition: opacity 0.2s;">
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

                <div id="ws-comment-action-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 10005; align-items: flex-end; justify-content: center; backdrop-filter: blur(4px); opacity: 0; transition: opacity 0.2s;">
                    <div class="ws-card" style="width: 100%; max-width: 500px; padding: 20px 20px 30px 20px; border-radius: 24px 24px 0 0 !important; margin: 0; transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: 0 -10px 40px rgba(0,0,0,0.2);">
                        <div style="width: 40px; height: 5px; background: #ddd; border-radius: 5px; margin: 0 auto 20px auto;"></div>
                        <h4 style="margin: 0 0 15px 0; text-align: center; color: #7f8c8d; font-size: 14px;">Opções do Comentário</h4>
                        <button id="ws-comment-action-edit" class="ws-btn" style="width: 100%; background: #fdf8e3; color: #f39c12; margin-bottom: 10px; font-size: 15px; padding: 14px; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: none;"><span style="font-size: 18px;">✏️</span> Editar Comentário</button>
                        <button id="ws-comment-action-delete" class="ws-btn" style="width: 100%; background: #fdf2f2; color: #e74c3c; margin-bottom: 15px; font-size: 15px; padding: 14px; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: none;"><span style="font-size: 18px;">🗑️</span> Apagar Comentário</button>
                        <button onclick="Workspace.Feed.fecharMenuComentario()" class="ws-btn" style="width: 100%; background: white; color: #333; border: 1px solid #ddd; font-size: 15px; padding: 12px; box-shadow: none;">Cancelar</button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modaisHTML);
        }
    },

    // 🚀 NOVIDADE: Motor visual de confirmação em substituição do window.confirm
    confirmarAcao: (titulo, mensagem, onConfirm) => {
        const modal = document.getElementById('ws-confirm-modal');
        if(!modal) {
            if(confirm(mensagem)) onConfirm();
            return;
        }

        document.getElementById('ws-confirm-title').innerText = titulo;
        document.getElementById('ws-confirm-message').innerText = mensagem;

        const btnOk = document.getElementById('ws-confirm-btn-ok');
        const btnCancel = document.getElementById('ws-confirm-btn-cancel');

        modal.style.display = 'flex';
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            modal.children[0].style.transform = 'scale(1)';
        });

        const fechar = () => {
            modal.style.opacity = '0';
            modal.children[0].style.transform = 'scale(0.9)';
            setTimeout(() => modal.style.display = 'none', 200);
        };

        btnCancel.onclick = fechar;
        btnOk.onclick = () => {
            fechar();
            onConfirm();
        };
    },

    abrirMenuComentario: (postId, comentarioId) => {
        const modal = document.getElementById('ws-comment-action-modal');
        const btnEdit = document.getElementById('ws-comment-action-edit');
        const btnDelete = document.getElementById('ws-comment-action-delete');

        if(!modal) return;

        modal.style.display = 'flex';
        modal.onclick = (e) => { if(e.target === modal) Workspace.Feed.fecharMenuComentario(); };

        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            modal.children[0].style.transform = 'translateY(0)';
        });

        btnEdit.onclick = () => {
            Workspace.Feed.fecharMenuComentario();
            Workspace.Feed.editarComentarioInline(postId, comentarioId);
        };

        btnDelete.onclick = () => {
            Workspace.Feed.fecharMenuComentario();
            Workspace.Feed.apagarComentario(postId, comentarioId);
        };
    },

    fecharMenuComentario: () => {
        const modal = document.getElementById('ws-comment-action-modal');
        if(!modal) return;
        modal.style.opacity = '0';
        modal.children[0].style.transform = 'translateY(100%)';
        setTimeout(() => modal.style.display = 'none', 300);
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
        const menus = document.querySelectorAll('.ws-post-dropdown');
        menus.forEach(m => m.style.display = 'none');
    },

    injetarCSSAnimacoes: () => {
        if (!document.getElementById('ws-feed-styles')) {
            const style = document.createElement('style');
            style.id = 'ws-feed-styles';
            style.innerHTML = `
                /* 🛡️ REGRAS DE ANIMAÇÃO E INTERAÇÃO CLICK-TO-ACTION */
                .ws-comentario-click { cursor: pointer; transition: transform 0.1s, background 0.2s; }
                .ws-comentario-click:active { background: #f0f4f8 !important; transform: scale(0.98); }

                #ws-feed-filter-bar {
                    display: flex !important;
                    gap: 6px !important; 
                    margin-bottom: 16px !important;
                    overflow-x: auto !important;
                    padding-bottom: 4px !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                }
                .ws-filter-chip { 
                    background: #ffffff !important; 
                    color: #555 !important; 
                    border: 1px solid #e1e4e6 !important; 
                    padding: 6px 12px !important; 
                    border-radius: 20px !important; 
                    font-size: 12px !important; 
                    font-weight: 600 !important; 
                    cursor: pointer !important; 
                    transition: all 0.2s ease !important; 
                    white-space: nowrap !important;
                    flex-shrink: 0 !important;
                    scroll-snap-align: start !important;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.02) !important;
                }
                .ws-filter-chip:hover {
                    background: #f8fafc !important;
                    border-color: #cbd5e1 !important;
                }
                .ws-filter-chip.active { 
                    background: #2c3e50 !important; 
                    color: #fff !important; 
                    border-color: #2c3e50 !important;
                    box-shadow: 0 4px 8px rgba(44, 62, 80, 0.15) !important; 
                }

                .ws-card img, .ws-card video, .ws-card iframe {
                    display: block !important;
                    margin: 12px auto 0 auto !important; 
                    max-width: 100% !important;
                    border-radius: 8px !important;
                }

                @keyframes skeleton-shimmer {
                    0% { background-position: -468px 0; }
                    100% { background-position: 468px 0; }
                }
                .skeleton-box {
                    background: #f6f7f8;
                    background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
                    background-repeat: no-repeat; background-size: 800px 100%;
                    animation: skeleton-shimmer 1.5s infinite linear; border-radius: 4px;
                }
                
                @keyframes pop-effect {
                    0% { transform: scale(1); }
                    40% { transform: scale(1.25); }
                    100% { transform: scale(1); }
                }
                .like-animated { animation: pop-effect 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .ws-btn-gamified:active { transform: scale(0.95); transition: 0.1s; }

                .new-posts-pill {
                    position: sticky; top: 15px; z-index: 999; background: #3498db; color: white;
                    padding: 10px 24px; border-radius: 30px; margin: 0 auto 20px auto;
                    width: max-content; font-weight: 700; font-size: 13px; cursor: pointer;
                    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
                    transform: translateY(-100px); opacity: 0; transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                .new-posts-pill.show { transform: translateY(0); opacity: 1; }
                
                .ws-carousel-container { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none; scroll-behavior: smooth; width: 100%; }
                .ws-carousel-container::-webkit-scrollbar { display: none; }
                .ws-carousel-slide { flex: 0 0 100%; width: 100%; scroll-snap-align: center; display: flex; justify-content: center; align-items: center; position: relative; }

                .ws-text-collapsed { max-height: 110px; overflow: hidden; position: relative; transition: max-height 0.3s ease-out; }
                .ws-text-expanded { max-height: 2000px; transition: max-height 0.5s ease-in; }
                .ws-text-fade { position: absolute; bottom: 0; left: 0; width: 100%; height: 40px; background: linear-gradient(transparent, #ffffff); pointer-events: none; }
            `;
            document.head.appendChild(style);
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
        const agora = new Date();
        const diferencaSegundos = Math.floor((agora - dataPost) / 1000);

        if (diferencaSegundos < 60) return 'Agora mesmo';
        const diferencaMinutos = Math.floor(diferencaSegundos / 60);
        if (diferencaMinutos < 60) return `Há ${diferencaMinutos} min`;
        const diferencaHoras = Math.floor(diferencaMinutos / 60);
        if (diferencaHoras < 24) return `Há ${diferencaHoras} h`;
        const diferencaDias = Math.floor(diferencaHoras / 24);
        if (diferencaDias === 1) {
            const horas = dataPost.getHours().toString().padStart(2, '0');
            const minutos = dataPost.getMinutes().toString().padStart(2, '0');
            return `Ontem às ${horas}:${minutos}`;
        }
        if (diferencaDias < 7) return `Há ${diferencaDias} dias`;
        return dataPost.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    },

    processarTextoComEmbeds: (textoOriginal) => {
        if (!textoOriginal) return '';
        let texto = Workspace.Feed.limparTexto(textoOriginal);
        
        texto = texto.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); 
        texto = texto.replace(/\*(.*?)\*/g, '<strong>$1</strong>');     
        texto = texto.replace(/_(.*?)_/g, '<em>$1</em>');                
        texto = texto.replace(/\n/g, '<br>');

        const iframesYouTube = [];
        const regexYouTube = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?/g;
        
        texto = texto.replace(regexYouTube, (match, id) => {
            iframesYouTube.push(`
                <div style="margin-top: 15px; position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px; border: 1px solid #eee; box-shadow: 0 4px 10px rgba(0,0,0,0.05); background: #000;">
                    <iframe loading="lazy" class="ws-video-embed" src="https://www.youtube.com/embed/${id}?enablejsapi=1" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            `);
            return ''; 
        });

        const regexLinks = /(https?:\/\/[^\s<]+)/g;
        texto = texto.replace(regexLinks, `<a href="$1" target="_blank" style="color:#3498db; text-decoration:none; font-weight:600; word-break: break-all;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">$1 ↗</a>`);

        if (iframesYouTube.length > 0) texto += iframesYouTube.join('');
        return texto;
    },

    carregarPosts: async () => {
        const container = document.getElementById('ws-posts-area');
        if (!container) return;

        if (!document.getElementById('ws-feed-filter-bar')) {
            const filterBarHTML = `
                <div id="ws-feed-filter-bar" style="scrollbar-width: none; -ms-overflow-style: none; scroll-snap-type: x mandatory;">
                    <button class="ws-filter-chip active" id="filter-todos" onclick="Workspace.Feed.filtrarFeed('todos')">📋 Tudo</button>
                    <button class="ws-filter-chip" id="filter-imagens" onclick="Workspace.Feed.filtrarFeed('imagens')">🖼️ Imagens</button>
                    <button class="ws-filter-chip" id="filter-videos" onclick="Workspace.Feed.filtrarFeed('videos')">🎥 Vídeos</button>
                    <button class="ws-filter-chip" id="filter-docs" onclick="Workspace.Feed.filtrarFeed('docs')">📕 Documentos</button>
                </div>
            `;
            container.parentNode.insertBefore(Workspace.Feed.htmlParaElemento(filterBarHTML), container);
        }

        if(Workspace.Feed.todosOsPosts.length === 0) {
            let skeletonHTML = '';
            for(let i=0; i<3; i++) {
                skeletonHTML += `
                <div class="ws-card" style="margin-bottom: 20px; padding: 20px; background: #fff; border-radius: 12px; border: 1px solid #eee;">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:15px;">
                        <div class="skeleton-box" style="width:45px; height:45px; border-radius:50%;"></div>
                        <div style="flex: 1;">
                            <div class="skeleton-box" style="width: 35%; height: 12px; margin-bottom: 8px;"></div>
                            <div class="skeleton-box" style="width: 20%; height: 10px;"></div>
                        </div>
                    </div>
                    <div class="skeleton-box" style="width: 100%; height: 12px; margin-bottom: 8px;"></div>
                    <div class="skeleton-box" style="width: 90%; height: 12px; margin-bottom: 20px;"></div>
                    <div class="skeleton-box" style="width: 100%; height: 180px; border-radius: 8px;"></div>
                </div>`;
            }
            container.innerHTML = skeletonHTML;
        }

        try {
            const refId = Workspace.usuario.alunoRefId || '';
            const posts = await Workspace.api(`/workspace/posts?alunoRefId=${refId}`, 'GET');

            if (!posts || posts.length === 0) {
                container.innerHTML = `
                    <div class="ws-card" style="text-align: center; padding: 40px; color: #7f8c8d;">
                        <div style="font-size: 40px; margin-bottom: 10px;">📭</div>
                        <h3 style="margin: 0 0 5px 0;">O mural está vazio</h3>
                    </div>`;
                const sentinela = document.getElementById('ws-feed-sentinela');
                if (sentinela) sentinela.style.display = 'none';
                return;
            }

            Workspace.Feed.todosOsPosts = posts;
            Workspace.Feed.filtrarFeed(Workspace.Feed.filtroAtivo); 
            Workspace.Feed.iniciarRadarNovosPosts();

        } catch (error) {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: #e74c3c;">Erro de ligação ao carregar o feed.</div>';
        }
    },

    filtrarFeed: (tipoFiltro) => {
        Workspace.Feed.filtroAtivo = tipoFiltro;
        Workspace.Feed.paginaAtual = 1;
        Workspace.Feed.postsCache = [];
        
        document.querySelectorAll('.ws-filter-chip').forEach(btn => btn.classList.remove('active'));
        const btnAtivo = document.getElementById(`filter-${tipoFiltro}`);
        if(btnAtivo) btnAtivo.classList.add('active');

        let listaFiltrada = Workspace.Feed.todosOsPosts;
        if (tipoFiltro === 'imagens') {
            listaFiltrada = Workspace.Feed.todosOsPosts.filter(p => p.anexos && p.anexos.some(a => a.tipo.includes('image')));
        } else if (tipoFiltro === 'videos') {
            listaFiltrada = Workspace.Feed.todosOsPosts.filter(p => 
                (p.anexos && p.anexos.some(a => a.tipo.includes('video'))) || 
                (p.texto && p.texto.includes('youtube.com') || p.texto && p.texto.includes('youtu.be'))
            );
        } else if (tipoFiltro === 'docs') {
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
        sentinela.innerHTML = '<div style="text-align:center; padding:20px; color:#999; font-size:13px;">A carregar mais... ⏳</div>';

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

    iniciarRadarNovosPosts: () => {
        if (Workspace.Feed.radarNovosPosts) clearInterval(Workspace.Feed.radarNovosPosts);
        
        Workspace.Feed.radarNovosPosts = setInterval(async () => {
            try {
                const refId = Workspace.usuario.alunoRefId || '';
                const postsAtuais = await Workspace.api(`/workspace/posts?alunoRefId=${refId}`, 'GET');
                
                if (postsAtuais && Workspace.Feed.todosOsPosts.length > 0) {
                    const ultimoPostIdConhecido = Workspace.Feed.todosOsPosts[0].id;
                    const qtdNovos = postsAtuais.findIndex(p => p.id === ultimoPostIdConhecido);
                    
                    if (qtdNovos > 0) Workspace.Feed.mostrarPilulaNovosPosts(qtdNovos, postsAtuais);
                }
            } catch(e) {}
        }, 20000); 
    },
 
    iniciarMotorDeVideos: () => {
        document.querySelectorAll('.ws-feed-video').forEach(video => {
            video.onplay = function() {
                document.querySelectorAll('.ws-feed-video').forEach(v => {
                    if (v !== this && !v.paused) v.pause();
                });
                document.querySelectorAll('.ws-video-embed').forEach(iframe => {
                    iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
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
                    } else if (el.tagName === 'IFRAME') {
                        el.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                    }
                }
            });
        }, { threshold: 0.2 }); 

        document.querySelectorAll('.ws-feed-video, .ws-video-embed').forEach(el => {
            Workspace.Feed.videoObserver.observe(el);
        });
    },

    mostrarPilulaNovosPosts: (qtd, novosPostsData) => {
        let pill = document.getElementById('ws-new-posts-pill');
        if (!pill) {
            pill = document.createElement('div');
            pill.id = 'ws-new-posts-pill';
            pill.className = 'new-posts-pill';
            const container = document.getElementById('ws-posts-area');
            container.parentNode.insertBefore(pill, container);
        }
        
        pill.innerHTML = `⬆️ Ver ${qtd} nova${qtd > 1 ? 's' : ''} publicação${qtd > 1 ? 'ões' : ''}`;
        pill.classList.add('show');
        
        pill.onclick = () => {
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
            pill.classList.remove('show');
            Workspace.Feed.todosOsPosts = novosPostsData;
            Workspace.Feed.filtrarFeed(Workspace.Feed.filtroAtivo);
        };
    },

    abrirImagemInteira: (url) => {
        const id = 'ws-lightbox-modal';
        if(document.getElementById(id)) document.getElementById(id).remove();

        const overlay = document.createElement('div');
        overlay.id = id;
        overlay.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:10005; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(5px); opacity:0; transition: opacity 0.2s ease-in-out;";
        
        overlay.innerHTML = `
            <span style="position:absolute; top:20px; right:30px; color:white; font-size:40px; cursor:pointer; font-weight:bold; transition:0.2s;" onmouseover="this.style.color='#e74c3c'" onmouseout="this.style.color='white'" onclick="document.getElementById('${id}').style.opacity='0'; setTimeout(()=>document.getElementById('${id}').remove(), 200);" title="Fechar">&times;</span>
            <img src="${url}" style="max-width:90vw; max-height:90vh; border-radius:8px; box-shadow:0 10px 40px rgba(0,0,0,0.6); transform:scale(0.95); transition: transform 0.2s ease-out;">
        `;
        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            overlay.querySelector('img').style.transform = 'scale(1)';
        });

        overlay.addEventListener('click', (e) => {
            if(e.target === overlay) {
                overlay.style.opacity = '0';
                setTimeout(()=> overlay.remove(), 200);
            }
        });
    },

    abrirDocumento: (url, nome, ehOffice) => {
        const id = 'ws-doc-modal';
        if(document.getElementById(id)) document.getElementById(id).remove();

        const overlay = document.createElement('div');
        overlay.id = id;
        overlay.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:10005; display:flex; flex-direction:column; align-items:center; justify-content:center; backdrop-filter:blur(5px); opacity:0; transition: opacity 0.2s ease-in-out;";

        let iframeSrc = url;
        if (ehOffice) {
            const absoluteUrl = url.startsWith('http') ? url : window.location.origin + url;
            iframeSrc = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absoluteUrl)}`;
        }

        overlay.innerHTML = `
            <div style="width: 95vw; display: flex; justify-content: flex-end; align-items: center; padding: 10px 0; margin-bottom: 5px;">
                <span style="color:white; font-size:45px; cursor:pointer; font-weight:bold; transition:0.2s; line-height: 1;" onmouseover="this.style.color='#e74c3c'" onmouseout="this.style.color='white'" onclick="document.getElementById('${id}').style.opacity='0'; setTimeout(()=>document.getElementById('${id}').remove(), 200);" title="Fechar Documento">&times;</span>
            </div>
            <div style="width: 95vw; height: 90vh; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 15px 50px rgba(0,0,0,0.5); transform: scale(0.95); transition: transform 0.2s ease-out; position: relative;">
                ${ehOffice ? '<div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color:#999; font-size:14px; z-index:1;">A carregar documento com o Microsoft Office... ⏳</div>' : ''}
                <iframe loading="lazy" src="${iframeSrc}" style="width: 100%; height: 100%; border: none; position:relative; z-index:2; background: white;"></iframe>
            </div>
        `;
        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            overlay.querySelector('div:nth-child(2)').style.transform = 'scale(1)';
        });
    },

    scrollCarrossel: (postId, total) => {
        const container = document.getElementById(`carousel-${postId}`);
        if(!container) return;
        const width = container.offsetWidth;
        const scrollPos = container.scrollLeft;
        
        const index = Math.round(scrollPos / width);
        
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
        const width = container.offsetWidth;
        container.scrollBy({ left: direcao * width, behavior: 'smooth' });
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
                htmlFinal += `
                <div style="position: relative; width: 100%; border-radius: 12px; overflow: hidden; background: #f9f9f9; border: 1px solid #eee; margin-top: 15px;">
                    <div id="counter-${postId}" style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.7); color: white; padding: 4px 12px; border-radius: 14px; font-size: 12px; font-weight: bold; z-index: 10; pointer-events: none;">1 / ${qtd}</div>
                    
                    <button id="btn-left-${postId}" onclick="Workspace.Feed.moverCarrossel('${postId}', -1)" style="display:none; position: absolute; top: 50%; transform: translateY(-50%); left: 10px; background: rgba(255,255,255,0.85); border: none; width: 32px; height: 32px; border-radius: 50%; align-items: center; justify-content: center; cursor: pointer; z-index: 10; font-weight: bold; box-shadow: 0 2px 6px rgba(0,0,0,0.3); transition: 0.2s;">❮</button>
                    <button id="btn-right-${postId}" onclick="Workspace.Feed.moverCarrossel('${postId}', 1)" style="position: absolute; top: 50%; transform: translateY(-50%); right: 10px; background: rgba(255,255,255,0.85); border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; font-weight: bold; box-shadow: 0 2px 6px rgba(0,0,0,0.3); transition: 0.2s;">❯</button>
                    
                    <div id="carousel-${postId}" class="ws-carousel-container" onscroll="Workspace.Feed.scrollCarrossel('${postId}', ${qtd})">`;
                    
                imagens.forEach((img) => {
                    let url = img.url.startsWith('http') || img.url.startsWith('/') ? img.url : '/' + img.url;
                    htmlFinal += `
                        <div class="ws-carousel-slide">
                            <img src="${url}" loading="lazy" style="width: 100%; max-height: 400px; object-fit: contain; cursor: pointer;" onclick="Workspace.Feed.abrirImagemInteira('${url}')" title="Clique para ampliar">
                        </div>
                    `;
                });
                
                htmlFinal += `</div></div>`;
            }
        }
        
        if (videos.length > 0) {
            videos.forEach(video => {
                let url = video.url.startsWith('http') || video.url.startsWith('/') ? video.url : '/' + video.url;
                htmlFinal += `<video controls class="ws-feed-video" style="width:100%; max-height:400px; border-radius:8px; border:1px solid #eee; margin-top:10px; background:#000;"><source src="${url}" type="${video.tipo}">O seu navegador não suporta vídeos.</video>`;
            });
        }
        
        if (documentos.length > 0) {
            htmlFinal += '<div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:15px; width:100%;">';
            documentos.forEach(anexo => {
                let urlCorrigida = anexo.url.startsWith('http') || anexo.url.startsWith('/') ? anexo.url : '/' + anexo.url;
                const nomeMinusculo = (anexo.nome || '').toLowerCase();
                const ehOffice = nomeMinusculo.endsWith('.docx') || nomeMinusculo.endsWith('.doc') || 
                                 nomeMinusculo.endsWith('.xlsx') || nomeMinusculo.endsWith('.xls') || 
                                 nomeMinusculo.endsWith('.pptx') || nomeMinusculo.endsWith('.ppt');
                let icone = anexo.tipo.includes('pdf') || nomeMinusculo.endsWith('.pdf') ? '📕' : '📝';
                let textoAcao = 'Ler Documento ↗';

                htmlFinal += `
                    <div onclick="Workspace.Feed.abrirDocumento('${urlCorrigida}', '${anexo.nome}', ${ehOffice})" style="cursor:pointer; display:flex; align-items:center; gap:10px; background:#f4f6f7; padding:10px 15px; border-radius:8px; color:#2c3e50; border:1px solid #ddd; flex: 1; min-width:200px; max-width:300px; transition:0.2s;" onmouseover="this.style.background='#e5e8e8'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='#f4f6f7'; this.style.transform='translateY(0)'">
                        <span style="font-size:24px; flex-shrink: 0;">${icone}</span>
                        <span style="flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:13px; font-weight:600;">${anexo.nome}</span>
                        <span style="color:#3498db; font-size:12px; font-weight:bold; flex-shrink: 0;">${textoAcao}</span>
                    </div>`;
            });
            htmlFinal += '</div>';
        }
        
        return htmlFinal;
    },

    limparTexto: (txt) => {
        if(!txt) return '';
        return txt.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },

    editarPost: (postId) => {
        const post = Workspace.Feed.postsCache.find(p => p.id === postId);
        if(!post) return;
        const containerText = document.getElementById(`texto-post-${postId}`);
        if(!containerText) return;

        const textAtual = post.texto || '';
        containerText.innerHTML = `
            <div style="background:#f4f6f7; padding:12px; border-radius:8px; border:1px solid #ddd; margin-bottom:10px; animation: fadeIn 0.3s;">
                <textarea id="edit-input-${postId}" rows="4" style="width:100%; padding:10px; border-radius:6px; border:1px solid #ccc; font-family:inherit; font-size:13px; resize:vertical; box-sizing:border-box; outline:none;" onfocus="this.style.borderColor='#3498db'" onblur="this.style.borderColor='#ccc'">${textAtual}</textarea>
                <div style="display:flex; gap:10px; margin-top:10px;">
                    <button class="ws-btn ws-btn-gamified" style="background:#27ae60; padding:6px 15px; font-size:12px; font-weight:bold;" onclick="Workspace.Feed.salvarEdicaoPost('${postId}')">💾 Guardar Alterações</button>
                    <button class="ws-btn ws-btn-gamified" style="background:#95a5a6; padding:6px 15px; font-size:12px; font-weight:bold;" onclick="Workspace.Feed.cancelarEdicaoPost('${postId}')">Cancelar</button>
                </div>
            </div>
        `;
    },

    cancelarEdicaoPost: (postId) => {
        const post = Workspace.Feed.postsCache.find(p => p.id === postId);
        if(!post) return;
        const containerText = document.getElementById(`texto-post-${postId}`);
        if(containerText) containerText.innerHTML = Workspace.Feed.processarTextoComEmbeds(post.texto);
    },

    salvarEdicaoPost: async (postId) => {
        const input = document.getElementById(`edit-input-${postId}`);
        if(!input) return;
        const novoTexto = input.value.trim();
        const btn = event.target;
        
        btn.innerText = "⏳ A gravar..."; 
        btn.disabled = true;

        try {
            const res = await Workspace.api(`/workspace/posts/${postId}`, 'PUT', { texto: novoTexto });
            if(res && res.success) {
                const post = Workspace.Feed.postsCache.find(p => p.id === postId);
                if(post) post.texto = novoTexto;
                
                Workspace.Feed.cancelarEdicaoPost(postId);
                if(Workspace.mostrarAviso) Workspace.mostrarAviso("Publicação editada com sucesso!", "success");
            } else throw new Error();
        } catch(e) {
            if(Workspace.mostrarAviso) Workspace.mostrarAviso("Erro ao editar a publicação.", "error");
            btn.innerText = "💾 Guardar Alterações"; 
            btn.disabled = false;
        }
    },

    editarComentarioInline: (postId, comentarioId) => {
        const post = Workspace.Feed.postsCache.find(p => p.id === postId);
        if(!post || !post.comentarios) return;
        const c = post.comentarios.find(com => com.id === comentarioId);
        if(!c) return;

        const containerTexto = document.getElementById(`texto-comentario-${comentarioId}`);
        if(!containerTexto) return;

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
        const post = Workspace.Feed.postsCache.find(p => p.id === postId);
        if(!post || !post.comentarios) return;
        const c = post.comentarios.find(com => com.id === comentarioId);
        if(!c) return;

        const containerTexto = document.getElementById(`texto-comentario-${comentarioId}`);
        if(containerTexto) containerTexto.innerHTML = Workspace.Feed.limparTexto(c.texto);
    },

    salvarEdicaoComentario: async (postId, comentarioId) => {
        const input = document.getElementById(`input-edit-com-${comentarioId}`);
        if(!input) return;
        const novoTexto = input.value.trim();
        if(!novoTexto) return;

        try {
            const res = await Workspace.api(`/workspace/posts/${postId}/comentarios/${comentarioId}`, 'PUT', { texto: novoTexto });
            if(res && res.success) {
                const post = Workspace.Feed.postsCache.find(p => p.id === postId);
                if(post && post.comentarios) {
                    const c = post.comentarios.find(com => com.id === comentarioId);
                    if(c) c.texto = novoTexto;
                }
                Workspace.Feed.cancelarEdicaoComentario(postId, comentarioId);
            }
        } catch(e) {
            if(Workspace.mostrarAviso) Workspace.mostrarAviso("Erro ao atualizar o comentário.", "error");
        }
    },

    partilharPost: (postId) => {
        const urlPartilha = window.location.origin + window.location.pathname + '#post-' + postId;
        navigator.clipboard.writeText(urlPartilha).then(() => {
            if(window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Link copiado! Já pode colar onde quiser.", "success");
        }).catch(err => {
            if(window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Não foi possível copiar o link automaticamente.", "error");
        });
    },

    gerarHTMLPosts: (posts) => {
        const meuId = Workspace.usuario.id;
        
        return posts.map(p => {
            const tempoAmigavel = Workspace.Feed.calcularTempoRelativo(p.dataCriacao);
            const avatarPost = window.Workspace.renderizarAvatar(p.autorNome, 45);
            const textoSeguro = Workspace.Feed.processarTextoComEmbeds(p.texto);

            const ehDonoOuGestor = (Workspace.usuario.nome === p.autorNome || Workspace.usuario.login === p.autorNome || Workspace.usuario.tipo === 'Gestor');
            let destinoBadge = p.destino === 'global' 
                ? `<span style="font-size:10px; background:#e8f4f8; color:#3498db; padding:2px 6px; border-radius:4px; margin-left:5px; font-weight:bold;">🌍 Público Geral</span>`
                : `<span style="font-size:10px; background:#f4e8f8; color:#8e44ad; padding:2px 6px; border-radius:4px; margin-left:5px; font-weight:bold;">📚 ${Workspace.Feed.limparTexto(p.destinoNome)}</span>`;

            const likesArr = Array.isArray(p.likes) ? p.likes : [];
            const dislikesArr = Array.isArray(p.dislikes) ? p.dislikes : [];
            const euCurti = likesArr.includes(meuId);
            const euNaoCurti = dislikesArr.includes(meuId);
            
            const displayComentarios = Workspace.Feed.comentariosAbertos.has(p.id) ? 'block' : 'none';

            const ehTextoLongo = (p.texto && p.texto.length > 350);
            const btnVerMais = ehTextoLongo ? `<div style="margin-top: 8px;"><span onclick="Workspace.Feed.toggleTextoPost(this, '${p.id}')" style="color: #3498db; font-size: 13px; font-weight: bold; cursor: pointer;">Ler mais ⬇️</span></div>` : '';

            return `
          <div class="ws-card" id="post-${p.id}" style="animation: fadeIn 0.4s ease; margin-bottom: 20px;">
                    
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px; width:100%; gap:8px;">
                        
                        <div style="display:flex; align-items:center; gap:10px; flex: 1; min-width: 0;">
                            <div style="flex-shrink:0;">${avatarPost}</div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-weight:700; color:#2c3e50; font-size:15px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                    ${Workspace.Feed.limparTexto(p.autorNome)} <span style="font-size:11px; color:#aaa; margin-left:2px;">• ${p.autorTipo}</span>
                                </div>
                                <div style="font-size:12px; color:#7f8c8d; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                    ${tempoAmigavel} ${destinoBadge}
                                </div>
                            </div>
                        </div>
                        
                        <div class="ws-menu-ancora" style="position:relative; flex-shrink: 0; margin-left: auto;">
                            <button onclick="Workspace.Feed.toggleMenu(event, '${p.id}')" style="background:none; border:none; font-size:20px; font-weight:bold; cursor:pointer; color:#7f8c8d; padding:2px 10px; border-radius:50%; line-height:1;" onmouseover="this.style.background='#f0f2f5'; this.style.color='#2c3e50'" onmouseout="this.style.background='transparent'; this.style.color='#7f8c8d'">⋮</button>
                            
                            <div id="menu-dropdown-${p.id}" class="ws-post-dropdown" style="display:none; position:absolute; right:0; top:100%; background:#fff; border:1px solid #eee; border-radius:8px; box-shadow:0 10px 25px rgba(0,0,0,0.1); width:160px; z-index:100; overflow:hidden; animation: fadeIn 0.2s ease;">
                                <div style="padding:12px 15px; cursor:pointer; font-size:13px; font-weight:600; color:#333; display:flex; align-items:center; gap:10px;" onclick="Workspace.Feed.partilharPost('${p.id}'); Workspace.Feed.fecharMenus()">
                                    <span style="font-size:16px;">📤</span> Partilhar
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
                    
                    <div id="text-wrap-${p.id}" class="${ehTextoLongo ? 'ws-text-collapsed' : ''}" style="font-size:14px; color:#333; line-height:1.6; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word;">
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
                            ${p.comentarios && p.comentarios.length > 0 ? p.comentarios.map(c => {
                                const tempoComentario = c.dataCriacao ? Workspace.Feed.calcularTempoRelativo(c.dataCriacao) : 'Agora mesmo';
                                const ehDonoComentario = (c.autorNome === Workspace.usuario.nome || Workspace.usuario.login === c.autorNome || Workspace.usuario.tipo === 'Gestor');
                                const avatarComentario = window.Workspace.renderizarAvatar(c.autorNome, 30);
                                
                                // 🚀 O Menu interno desaparece. O comentário ganha poder de clique se for dono.
                                const clickAttr = ehDonoComentario ? `onclick="Workspace.Feed.abrirMenuComentario('${p.id}', '${c.id}')" title="Toque para ver opções"` : '';
                                const hoverClass = ehDonoComentario ? 'ws-comentario-click' : '';
                                
                                return `
                                <div id="comentario-${c.id}" ${clickAttr} class="${hoverClass}" style="background: #fdfdfd; border:1px solid #eee; padding: 10px 15px; border-radius: 12px; font-size: 13px; position:relative; display:flex; gap:10px; align-items:flex-start;">
                                    <div style="flex-shrink: 0;">${avatarComentario}</div>
                                    <div style="flex:1; padding-right: 5px; min-width: 0;">
                                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                                            <strong style="color: #2c3e50; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:70%;">${Workspace.Feed.limparTexto(c.autorNome)}</strong>
                                            <span style="font-size:10px; color:#aaa; margin-left:auto; flex-shrink: 0;">${tempoComentario}</span>
                                        </div>
                                        <span id="texto-comentario-${c.id}" style="color: #444; line-height:1.4; display: block; word-break: break-word; overflow-wrap: break-word;">${Workspace.Feed.limparTexto(c.texto)}</span>
                                    </div>
                                </div>
                                `;
                            }).join('') : '<div style="font-size:12px; color:#999; text-align:center;">Seja o primeiro a comentar!</div>'}
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
            
            if (isLike) {
                btnLike.classList.remove('like-animated');
                void btnLike.offsetWidth; 
                btnLike.classList.add('like-animated');
            }
        }

        if (btnDislike && countDislike) {
            const isDislike = acaoFinal === 'dislike';
            btnDislike.style.background = isDislike ? '#fdf2f2' : '#f0f2f5';
            btnDislike.style.color = isDislike ? '#e74c3c' : '#555';
            btnDislike.style.border = isDislike ? '1px solid #e74c3c' : '1px solid transparent';
            countDislike.innerText = post.dislikes.length;
            
            if (isDislike) {
                btnDislike.classList.remove('like-animated');
                void btnDislike.offsetWidth; 
                btnDislike.classList.add('like-animated');
            }
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
        // 🚀 Substitui o feio confirm() pelo belo ConfirmarAcao()
        Workspace.Feed.confirmarAcao("Apagar Publicação", "Tem a certeza que deseja apagar permanentemente esta publicação?", async () => {
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
        });
    },

    apagarComentario: async (postId, comentarioId) => {
        // 🚀 Substitui o confirm()
        Workspace.Feed.confirmarAcao("Apagar Comentário", "Deseja mesmo remover este comentário do mural?", async () => {
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
        });
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
                    texto: texto,
                    dataCriacao: new Date().toISOString()
                };

                const avatarComentario = window.Workspace.renderizarAvatar(c.autorNome, 30);
                
                if(listaComentarios.innerHTML.includes('Seja o primeiro')) {
                    listaComentarios.innerHTML = '';
                }

                const ehDonoComentario = true;
                const clickAttr = ehDonoComentario ? `onclick="Workspace.Feed.abrirMenuComentario('${postId}', '${c.id}')" title="Toque para ver opções"` : '';
                const hoverClass = ehDonoComentario ? 'ws-comentario-click' : '';

                const novoComentarioHTML = `
                <div id="comentario-${c.id}" ${clickAttr} class="${hoverClass}" style="background: #fdfdfd; border:1px solid #eee; padding: 10px 15px; border-radius: 12px; font-size: 13px; position:relative; display:flex; gap:10px; align-items:flex-start;">
                    <div style="flex-shrink: 0;">${avatarComentario}</div>
                    <div style="flex:1; padding-right: 5px; min-width: 0;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                            <strong style="color: #2c3e50; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:70%;">${Workspace.Feed.limparTexto(c.autorNome)}</strong>
                            <span style="font-size:10px; color:#aaa; margin-left:auto; flex-shrink: 0;">Agora mesmo</span>
                        </div>
                        <span id="texto-comentario-${c.id}" style="color: #444; line-height:1.4; display: block; word-break: break-word; overflow-wrap: break-word;">${Workspace.Feed.limparTexto(c.texto)}</span>
                    </div>
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

    htmlParaElemento: (htmlString) => {
        const template = document.createElement('template');
        template.innerHTML = htmlString.trim();
        return template.content.firstChild;
    },

    configurarEventosCriacao: async () => {
        const boxCriarPost = document.getElementById('ws-criar-post');
        if (!boxCriarPost) return;

        if (!document.getElementById('ws-post-destino')) {
            const areaBotoes = document.getElementById('ws-action-flex-wrapper');
            if (areaBotoes) {
                const htmlSelect = `
                    <select id="ws-post-destino" style="padding:6px 10px; border-radius:6px; border:1px solid #ccc; font-size:13px; outline:none; background:#f4f6f7; cursor:pointer; max-width: 120px; font-weight: 600; font-family: inherit; flex-shrink: 1; min-width: 0;">
                        <option value="global">🌍 Geral</option>
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
            
            const rascunhoGuardado = localStorage.getItem('ws_draft_post');
            if (rascunhoGuardado) {
                inputTexto.value = rascunhoGuardado;
            }

            inputTexto.addEventListener('input', (e) => {
                localStorage.setItem('ws_draft_post', e.target.value);
            });

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
                        localStorage.removeItem('ws_draft_post'); 
                        
                        if (Workspace.Upload) Workspace.Upload.limparAnexos();
                        if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Publicado com sucesso!", "success");
                        
                        Workspace.Feed.todosOsPosts = [];
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