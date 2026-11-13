// js/modulos/workspace/arena.js
window.Workspace = window.Workspace || {};

Workspace.Arena = {
    isInitialized: false, 
    evtSource: null,      
    salaAtual: null,
    oponenteNome: null,
    timerInterval: null,
    minutosRestantes: 50,
    segundosRestantes: 0,
    reconhecimentoVoz: null,
    
    papelAtual: null,
    cenarioAtual: null,

    ultimaFala: "",
    ultimoTempoFala: 0,

    // 🚀 AS NOVAS VARIÁVEIS DE COMBO E VELOCIDADE
    tempoUltimaRececao: Date.now(),
    comboAtual: 0,
    cenarioAtual: "",

    // ============================================================================
    // 🎵 MOTOR DE ÁUDIO E EFEITOS SONOROS 
    // ============================================================================
    sons: {
        inicio: './audios/arena-inicio.mp3',       
        mensagem: './audios/arena-pop.mp3',        
        tempoEsgotado: './audios/arena-tempo.mp3', 
        vitoria: './audios/arena-vitoria.mp3'      
    },

    audiosAtivos: [], 
    audioDesbloqueado: false,

    desbloquearAudioNavegador: () => {
        if (Workspace.Arena.audioDesbloqueado) return;
        try {
            const audioFake = new Audio(Workspace.Arena.sons.mensagem);
            audioFake.volume = 0;
            audioFake.play().then(() => {
                Workspace.Arena.audioDesbloqueado = true;
            }).catch(e => {}); 
        } catch(e) {}
    },

    tocarSom: (nomeSom) => {
        try {
            if (nomeSom !== 'mensagem') Workspace.Arena.pararSons();

            const url = Workspace.Arena.sons[nomeSom];
            if (url) {
                const audio = new Audio(url);
                audio.volume = nomeSom === 'mensagem' ? 0.3 : 0.6; 
                
                Workspace.Arena.audiosAtivos.push(audio);

                audio.play().then(() => {
                    audio.onended = () => { Workspace.Arena.audiosAtivos = Workspace.Arena.audiosAtivos.filter(a => a !== audio); };
                }).catch(e => console.warn("Áudio bloqueado:", e));
            }
        } catch (error) { console.error("Erro áudio:", error); }
    },

    pararSons: () => {
        if (Workspace.Arena.audiosAtivos && Workspace.Arena.audiosAtivos.length > 0) {
            Workspace.Arena.audiosAtivos.forEach(audio => {
                try { if (!audio.paused) { audio.pause(); audio.currentTime = 0; } } catch(e){}
            });
            Workspace.Arena.audiosAtivos = []; 
        }
    },
    // ============================================================================

 init: async () => { // 🚀 A função agora é assíncrona
        if (Workspace.Arena.isInitialized) return; 
        Workspace.Arena.isInitialized = true;
        Workspace.Arena.injetarModalFila();
        Workspace.Arena.injetarPainelBatalha();
        Workspace.Arena.escutarEventosTempoReal();
        Workspace.Arena.configurarMicrofone();

        // 🚀 Tenta ressuscitar uma arena perdida se o aluno tiver dado um F5 acidental
        await Workspace.Arena.restaurarCaixaNegra();
    },

     // ============================================================================
    // 🧰 CAIXA NEGRA: SOBREVIVÊNCIA A F5 E QUEDAS DE REDE
    // ============================================================================
    salvarCaixaNegra: () => {
        if (!Workspace.Arena.salaAtual) return;
        const estado = {
            salaAtual: Workspace.Arena.salaAtual,
            oponenteNome: Workspace.Arena.oponenteNome,
            minutosRestantes: Workspace.Arena.minutosRestantes,
            segundosRestantes: Workspace.Arena.segundosRestantes,
            papelAtual: Workspace.Arena.papelAtual,
            cenarioAtual: Workspace.Arena.cenarioAtual
        };
        sessionStorage.setItem('ws_arena_backup', JSON.stringify(estado));
    },

    limparCaixaNegra: () => {
        sessionStorage.removeItem('ws_arena_backup');
    },

    // ============================================================================
    // 🧠 MEMÓRIA ANTI-REPETIÇÃO (7 DIAS)
    // ============================================================================
    _getCenariosJogados: () => {
        const memoria = JSON.parse(localStorage.getItem('ws_arena_history') || '[]');
        const seteDiasMs = 7 * 24 * 60 * 60 * 1000;
        const agora = Date.now();
        // Limpa automaticamente os cenários que já têm mais de 7 dias
        const validos = memoria.filter(item => (agora - item.data) < seteDiasMs);
        localStorage.setItem('ws_arena_history', JSON.stringify(validos));
        return validos.map(item => item.id);
    },

    _addCenarioJogado: (id) => {
        if(!id) return;
        const memoria = JSON.parse(localStorage.getItem('ws_arena_history') || '[]');
        memoria.push({ id, data: Date.now() });
        localStorage.setItem('ws_arena_history', JSON.stringify(memoria));
    },

    restaurarCaixaNegra: async () => {
        const backup = sessionStorage.getItem('ws_arena_backup');
        if (!backup) return false;
        
        try {
            const estado = JSON.parse(backup);
            if (!estado.salaAtual) return false;

            // 1. Consulta o servidor para ver se a sala ainda está de pé e busca o chat
            const res = await Workspace.api(`/workspace/arena/${estado.salaAtual}/estado`, 'GET');
            if (!res || !res.success || res.sala.status === 'finalizado' || res.sala.status === 'cancelado') {
                Workspace.Arena.limparCaixaNegra();
                return false;
            }

            // 2. Restaura o Cérebro da Arena
            Workspace.Arena.salaAtual = estado.salaAtual;
            Workspace.Arena.oponenteNome = estado.oponenteNome;
            Workspace.Arena.minutosRestantes = estado.minutosRestantes;
            Workspace.Arena.segundosRestantes = estado.segundosRestantes;
            Workspace.Arena.papelAtual = estado.papelAtual;
            Workspace.Arena.cenarioAtual = estado.cenarioAtual;

            // 3. Reconstrói o Painel Silenciosamente (sem mostrar o Modal da fila)
            Workspace.Arena.injetarPainelBatalha();
            const modal = document.getElementById('ws-modal-arena');
            if (modal) modal.style.display = 'none';
            
            const painel = document.getElementById('ws-painel-batalha');
            painel.style.display = 'flex';
            painel.style.opacity = '1';

            // 4. Repopula o Chat Histórico
            const log = document.getElementById('ws-arena-chat-log');
            log.innerHTML = `<div style="text-align: center; color: #10b981; font-size: 13px; margin: 15px 0; background: rgba(16, 185, 129, 0.1); padding: 8px; border-radius: 8px; animation: popUp 0.5s ease;">🔄 Ligação restabelecida com sucesso!</div>`;
            
            if (res.sala.historico && res.sala.historico.length > 0) {
                res.sala.historico.forEach(fala => {
                    const isMinha = fala.autorId === Workspace.usuario.id;
                    // Se for o Mestre, a lógica de balão adapta-se automaticamente
                    Workspace.Arena.desenharBalao(fala.autorNome, fala.texto, isMinha);
                });
            }

            // 5. Devolve o jogador à fase certa (Escolha de Papel ou Combate Ativo)
            if (Workspace.Arena.papelAtual) {
                document.getElementById('ws-arena-selecao-personagem').style.display = 'none';
                const cenario = Workspace.Arena.cenarioAtual;
                const oponentePapel = (Workspace.Arena.papelAtual === cenario.p1) ? cenario.p2 : cenario.p1;
                document.getElementById('ws-arena-oponente-nome').innerText = `Contra: ${Workspace.Arena.oponenteNome} (${oponentePapel})`;
                Workspace.Arena.iniciarRelogio();
            } else {
                const cenario = Workspace.Arena.cenarioAtual;
                document.getElementById('ws-arena-cenario-texto').innerText = `"${cenario.t}"`;
                document.getElementById('ws-btn-papel-1').innerText = `🎭 ${cenario.p1}`;
                document.getElementById('ws-btn-papel-2').innerText = `🎭 ${cenario.p2}`;
                document.getElementById('ws-btn-papel-1').disabled = false;
                document.getElementById('ws-btn-papel-2').disabled = false;
                document.getElementById('ws-arena-selecao-personagem').style.display = 'flex';
            }

            // 6. Rearma o detetive de aba
            window.addEventListener('beforeunload', Workspace.Arena._onBeforeUnload);
            return true;
        } catch (e) {
            Workspace.Arena.limparCaixaNegra();
            return false;
        }
    },

  // 🚀 RASTREADOR DE JANELA FECHADA: Desativado cirurgicamente!
    // O navegador não sabe a diferença entre fechar a aba e atualizar (F5).
    // Ao esvaziar esta função, impedimos que o F5 mate a partida. A Caixa Negra trata do resto!
    _onBeforeUnload: () => {
        // Deixamos vazio intencionalmente para o F5 sobreviver à recarga da página!
    },

   colegasGrupo: [],
    participantesSala: [],
    modoLivreAtivo: false,

    injetarModalFila: () => {
        if (document.getElementById('ws-modal-arena')) return;
        const modal = document.createElement('div');
        modal.id = 'ws-modal-arena';
        modal.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 100050; align-items: center; justify-content: center; backdrop-filter: blur(5px);';
        
        modal.innerHTML = `
            <div style="background: #1e293b; width: 92%; max-width: 480px; padding: 26px; border-radius: 20px; text-align: center; border: 1px solid #334155; position: relative; overflow: visible; max-height: 92vh; overflow-y: auto;">
                <button onclick="document.getElementById('ws-modal-arena').style.display='none'" style="position: absolute; top: 15px; right: 15px; background: transparent; border: none; color: #94a3b8; font-size: 20px; cursor: pointer;">✖</button>
                <div style="font-size: 46px; margin-bottom: 10px;">🎙️</div>
                <h2 style="color: #fff; margin: 0 0 6px 0;">Arena & Prática Livre</h2>
                <p style="color: #94a3b8; font-size: 13.5px; margin-bottom: 18px;">Treine com IA, faça duelos com cenários ou abra uma <b>Sala Livre (até 5 pessoas)</b> sem contexto fixo!</p>
                
                <div style="background: rgba(0,0,0,0.2); padding: 12px 15px; border-radius: 12px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
                    <strong style="color: #cbd5e1; font-size: 13.5px;">Duração da Sessão:</strong>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <input type="number" id="ws-arena-input-tempo" min="5" max="50" value="30" style="width: 60px; padding: 7px; border-radius: 8px; border: 1px solid #3b82f6; background: #0f172a; color: #fff; text-align: center; font-weight: bold; outline: none;">
                        <span style="color: #94a3b8; font-size: 13.5px;">min</span>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <!-- 🤖 MODO 1: TREINO SOLO COM IA -->
                    <button id="ws-btn-solo" onclick="Workspace.Arena.abrirMenuSolo()" style="background: linear-gradient(135deg, #8b5cf6, #6d28d9); color: white; padding: 13px; border-radius: 12px; border: none; font-weight: bold; font-size: 15px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.35);">
                        <span style="font-size: 19px;">🤖</span> Treinar Solo com a IA
                    </button>
                    
                    <div id="ws-arena-solo-options" style="display: none; flex-direction: column; gap: 8px; padding: 14px; background: rgba(0,0,0,0.25); border-radius: 12px; border: 1px solid #475569;">
                        <strong style="color: #cbd5e1; font-size: 12.5px; margin-bottom: 4px;">Escolha o Nível de Dificuldade:</strong>
                        <button onclick="Workspace.Arena.iniciarTreinoSolo('A1_A2')" style="background: #10b981; color: white; padding: 9px; border-radius: 8px; border: none; font-weight: bold; cursor: pointer;">🟢 Iniciante (A1/A2)</button>
                        <button onclick="Workspace.Arena.iniciarTreinoSolo('B1_B2')" style="background: #f59e0b; color: white; padding: 9px; border-radius: 8px; border: none; font-weight: bold; cursor: pointer;">🟡 Intermediário (B1/B2)</button>
                        <button onclick="Workspace.Arena.iniciarTreinoSolo('C1_C2')" style="background: #ef4444; color: white; padding: 9px; border-radius: 8px; border: none; font-weight: bold; cursor: pointer;">🔴 Avançado (C1/C2)</button>
                    </div>

                    <!-- 🎲 MODO 2: SINALIZADOR ALEATÓRIO -->
                    <button id="ws-btn-procurar" onclick="Workspace.Arena.procurarAleatorio()" style="background: #3b82f6; color: white; padding: 13px; border-radius: 12px; border: none; font-weight: bold; font-size: 15px; cursor: pointer; transition: 0.2s;">
                        🎲 Procurar Oponente Aleatório
                    </button>
                    
                    <!-- 👥 MODO 3: BUSCA DE COLEGAS (DUELO 1x1 OU SALA LIVRE ATÉ 5 PESSOAS) -->
                    <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid #334155; border-radius: 14px; padding: 14px; text-align: left; position: relative;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="color: #38bdf8; font-size: 12.5px; font-weight: 800; text-transform: uppercase;">👥 Selecionar Colegas (Até 5 na Sala)</span>
                            <span id="ws-arena-contador-grupo" style="background: #1e293b; color: #94a3b8; font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: bold; border: 1px solid #334155;">Você + 0/4</span>
                        </div>

                        <!-- Etiquetas (Chips) dos colegas adicionados para a Sala de Grupo -->
                        <div id="ws-arena-chips-grupo" style="display: none; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;"></div>

                        <div style="position: relative;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <input type="text" id="ws-arena-input-convite" placeholder="Digite o nome para adicionar..." style="flex: 1; padding: 12px 14px; border-radius: 10px; border: 1px solid #475569; background: #0f172a; color: #fff; outline: none; font-size: 14px;" oninput="Workspace.Arena.filtrarColegas()">
                                <button type="button" onclick="Workspace.Arena.adicionarColegaInput()" title="Adicionar à lista da sala" style="background: #334155; color: #fff; padding: 12px 14px; border-radius: 10px; border: 1px solid #475569; font-weight: bold; cursor: pointer;">➕</button>
                            </div>
                            <div id="ws-arena-sugestoes" style="display: none; position: absolute; top: 100%; left: 0; width: 100%; max-height: 170px; overflow-y: auto; background: #1e293b; border: 1px solid #3b82f6; border-radius: 10px; box-shadow: 0 12px 28px rgba(0,0,0,0.65); z-index: 200; margin-top: 4px;"></div>
                        </div>

                        <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
                            <button type="button" onclick="Workspace.Arena.iniciarSalaGrupoLivre()" style="flex: 1.4; min-width: 170px; background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white; padding: 12px; border-radius: 10px; border: none; font-weight: 800; font-size: 13.5px; cursor: pointer; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);">
                                🗣️ Sala Livre (Sem Contexto)
                            </button>
                            <button type="button" onclick="Workspace.Arena.convidarColega()" style="flex: 1; min-width: 130px; background: #10b981; color: white; padding: 12px; border-radius: 10px; border: none; font-weight: 800; font-size: 13.5px; cursor: pointer;">
                                🎭 Duelo c/ Papel
                            </button>
                        </div>
                    </div>
                </div>
                <div id="ws-arena-status" style="margin-top: 16px; color: #f59e0b; font-weight: bold; font-size: 13.5px; display: none;">A procurar oponente... ⏳</div>
            </div>
        `;
        document.body.appendChild(modal);
    },

   guerreirosCache: [],

    carregarGuerreiros: async () => {
        try {
            const res = await Workspace.api('/workspace/arena/guerreiros', 'GET');
            if (res && res.success && Array.isArray(res.guerreiros)) {
                Workspace.Arena.guerreirosCache = res.guerreiros;
                // Alimenta também o avatarsCache para quem tiver foto
                res.guerreiros.forEach(g => {
                    if (g.nome && g.avatar) {
                        Workspace.avatarsCache = Workspace.avatarsCache || {};
                        Workspace.avatarsCache[g.nome] = g.avatar;
                    }
                });
            }
        } catch (e) {}
    },

    abrirMenuSolo: () => {
        document.getElementById('ws-btn-solo').style.display = 'none';
        document.getElementById('ws-arena-solo-options').style.display = 'flex';
        document.getElementById('ws-btn-procurar').style.display = 'none';
    },

    abrirPainel: async () => { 
        Workspace.Arena.desbloquearAudioNavegador(); 
        const modal = document.getElementById('ws-modal-arena');
        if (modal) {
            modal.style.display = 'flex';
            // Restaura o estado visual dos botões sempre que abrir o modal
            const btnSolo = document.getElementById('ws-btn-solo');
            const menuSolo = document.getElementById('ws-arena-solo-options');
            const btnProcurar = document.getElementById('ws-btn-procurar');
            const status = document.getElementById('ws-arena-status');
            if (btnSolo) btnSolo.style.display = 'flex';
            if (menuSolo) menuSolo.style.display = 'none';
            if (btnProcurar) {
                btnProcurar.style.display = 'block';
                btnProcurar.disabled = false;
                btnProcurar.style.opacity = '1';
                btnProcurar.innerHTML = '🎲 Procurar Oponente Aleatório';
                btnProcurar.style.background = '#3b82f6';
                btnProcurar.style.border = 'none';
                btnProcurar.style.color = 'white';
            }
            if (status) status.style.display = 'none';
        }
        await Workspace.Arena.carregarGuerreiros();
    },

    filtrarColegas: async () => {
        const normalizar = (texto) => texto ? String(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";
        const inputEl = document.getElementById('ws-arena-input-convite');
        const lista = document.getElementById('ws-arena-sugestoes');
        if (!inputEl || !lista) return;

        const input = normalizar(inputEl.value);
        lista.innerHTML = '';

        if (!input || input.length < 1) { 
            lista.style.display = 'none'; 
            return; 
        }

        // Se o cache da Arena ainda estiver vazio, busca imediatamente no servidor
        if (!Array.isArray(Workspace.Arena.guerreirosCache) || Workspace.Arena.guerreirosCache.length === 0) {
            await Workspace.Arena.carregarGuerreiros();
        }

        const meuId = String(Workspace.usuario?.id || '');
        const meuRefId = String(Workspace.usuario?.alunoRefId || '');
        const meuNomeNormalizado = normalizar(Workspace.usuario?.nome || Workspace.usuario?.login);
        const meuLoginNormalizado = normalizar(Workspace.usuario?.login);

        // Combina a lista completa de guerreiros do servidor + fallback do avatarsCache sem duplicar
        const mapaNomes = new Map();

        (Workspace.Arena.guerreirosCache || []).forEach(g => {
            if (!g || !g.nome) return;
            if (meuId && (String(g.id) === meuId || String(g.alunoRefId) === meuId)) return;
            if (meuRefId && (String(g.id) === meuRefId || String(g.alunoRefId) === meuRefId)) return;
            const nNorm = normalizar(g.nome);
            if (!nNorm || nNorm === meuNomeNormalizado || (meuLoginNormalizado && nNorm === meuLoginNormalizado)) return;
            mapaNomes.set(nNorm, g.nome.trim());
        });

        Object.keys(Workspace.avatarsCache || {}).forEach(nomeCache => {
            // Ignora formatos compostos "Nome (@Apelido)" para não poluir a lista
            const limpo = String(nomeCache).replace(/\s*\(@.*\)\s*$/, '').trim();
            const nNorm = normalizar(limpo);
            if (!nNorm || nNorm === meuNomeNormalizado || (meuLoginNormalizado && nNorm === meuLoginNormalizado)) return;
            if (!mapaNomes.has(nNorm)) {
                mapaNomes.set(nNorm, limpo);
            }
        });

        let colegas = Array.from(mapaNomes.values()).filter(nome => {
            return normalizar(nome).includes(input);
        });

        colegas.sort((a, b) => {
            const aNorm = normalizar(a);
            const bNorm = normalizar(b);
            const aComeca = aNorm.startsWith(input);
            const bComeca = bNorm.startsWith(input);
            if (aComeca && !bComeca) return -1; 
            if (!aComeca && bComeca) return 1;  
            return aNorm.localeCompare(bNorm);  
        });

        if (colegas.length > 0) {
            colegas.forEach(nome => {
                const fotoHTML = window.Workspace.renderizarAvatar(nome, 30);
                const item = document.createElement('div');
                item.style.cssText = 'padding: 10px 12px; display: flex; align-items: center; gap: 10px; cursor: pointer; border-bottom: 1px solid #334155; transition: 0.2s;';
                item.onmouseover = () => item.style.background = '#334155';
                item.onmouseout = () => item.style.background = 'transparent';
                
               item.onclick = () => {
                    inputEl.value = nome;
                    lista.style.display = 'none';
                    Workspace.Arena.adicionarColegaAoGrupo(nome);
                };
                
                item.innerHTML = `${fotoHTML} <span style="color: #fff; font-size: 14px; font-weight: 600;">${Workspace.escapeHTML(nome)}</span>`;
                lista.appendChild(item);
            });
            lista.style.display = 'block';
        } else {
            lista.innerHTML = '<div style="padding: 15px; color: #94a3b8; font-size: 13px; text-align: center;">Nenhum colega encontrado com este nome.</div>';
            lista.style.display = 'block';
        }
    },

    adicionarColegaInput: () => {
        const inputEl = document.getElementById('ws-arena-input-convite');
        if (!inputEl || !inputEl.value.trim()) return;
        Workspace.Arena.adicionarColegaAoGrupo(inputEl.value.trim());
        inputEl.value = '';
        const lista = document.getElementById('ws-arena-sugestoes');
        if (lista) lista.style.display = 'none';
    },

    adicionarColegaAoGrupo: (nome) => {
        const nomeLimpo = String(nome || '').trim();
        if (!nomeLimpo) return;
        if (!Array.isArray(Workspace.Arena.colegasGrupo)) Workspace.Arena.colegasGrupo = [];

        const jaExiste = Workspace.Arena.colegasGrupo.some(c => c.toLowerCase() === nomeLimpo.toLowerCase());
        if (jaExiste) return;

        if (Workspace.Arena.colegasGrupo.length >= 4) {
            if (window.Workspace && Workspace.mostrarAviso) {
                Workspace.mostrarAviso("Limite máximo atingido: 4 colegas + você = 5 pessoas na sala!", "warning");
            }
            return;
        }

        Workspace.Arena.colegasGrupo.push(nomeLimpo);
        const inputEl = document.getElementById('ws-arena-input-convite');
        if (inputEl) inputEl.value = '';
        Workspace.Arena.renderizarChipsGrupo();
    },

    removerColegaDoGrupo: (nome) => {
        Workspace.Arena.colegasGrupo = (Workspace.Arena.colegasGrupo || []).filter(c => c !== nome);
        Workspace.Arena.renderizarChipsGrupo();
    },

    renderizarChipsGrupo: () => {
        const box = document.getElementById('ws-arena-chips-grupo');
        const contador = document.getElementById('ws-arena-contador-grupo');
        const lista = Workspace.Arena.colegasGrupo || [];

        if (contador) {
            contador.innerText = `Você + ${lista.length}/4 (${lista.length + 1}/5 na sala)`;
            contador.style.color = lista.length > 0 ? '#38bdf8' : '#94a3b8';
        }
        if (!box) return;

        if (lista.length === 0) {
            box.style.display = 'none';
            box.innerHTML = '';
            return;
        }

        box.style.display = 'flex';
        box.innerHTML = lista.map(nome => {
            const seguro = Workspace.escapeHTML(nome);
            const nomeJs = seguro.replace(/'/g, "\\'");
            return `
                <span style="background: #0f172a; border: 1px solid #38bdf8; color: #e0f2fe; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
                    👤 ${seguro}
                    <button type="button" onclick="Workspace.Arena.removerColegaDoGrupo('${nomeJs}')" style="background: transparent; border: none; color: #f87171; cursor: pointer; font-weight: bold; font-size: 13px; padding: 0; line-height: 1;">✖</button>
                </span>
            `;
        }).join('');
    },

    // 🗣️ INICIA A SALA DE PRÁTICA LIVRE (SEM CONTEXTO E ATÉ 5 PESSOAS)
    iniciarSalaGrupoLivre: async () => {
        Workspace.Arena.desbloquearAudioNavegador();
        const inputEl = document.getElementById('ws-arena-input-convite');
        const digitadoAgora = inputEl ? inputEl.value.trim() : '';
        if (digitadoAgora) {
            Workspace.Arena.adicionarColegaAoGrupo(digitadoAgora);
        }

        const convidados = Workspace.Arena.colegasGrupo || [];
        if (convidados.length === 0) {
            if (window.Workspace && Workspace.mostrarAviso) {
                Workspace.mostrarAviso("Pesquise e selecione de 1 a 4 colegas para abrir a Sala Livre!", "warning");
            }
            return;
        }

        const status = document.getElementById('ws-arena-status');
        const tempo = document.getElementById('ws-arena-input-tempo')?.value || 30;
        if (status) {
            status.style.display = 'block';
            status.style.color = '#38bdf8';
            status.innerText = `A abrir Sala Livre e a chamar ${convidados.join(', ')}... 🚀`;
        }

        try {
            const meuNome = Workspace.usuario.nome || Workspace.usuario.login;
            const res = await Workspace.api('/workspace/arena/grupo-livre/criar', 'POST', {
                alunoId: Workspace.usuario.id,
                alunoNome: meuNome,
                colegasNomes: convidados,
                escolaId: Workspace.usuario.escolaId || 'DEFAULT',
                limiteMinutos: tempo
            });

            if (res && res.success) {
                Workspace.Arena.colegasGrupo = [];
                Workspace.Arena.renderizarChipsGrupo();
                Workspace.Arena.abrirSalaGrupoLivreUI(res.salaId, res.participantes || [{ id: Workspace.usuario.id, nome: meuNome }], res.limiteMinutos, convidados);
            } else {
                throw new Error(res?.error || 'Não foi possível criar a sala livre.');
            }
        } catch (err) {
            if (status) {
                status.style.color = '#ef4444';
                status.innerText = err.message || 'Erro ao criar sala livre.';
            }
        }
    },

    // 🚀 ABRE O PALCO DIRETO PARA PRÁTICA LIVRE (SEM TELA DE ESCOLHA DE PAPÉIS)
    abrirSalaGrupoLivreUI: (salaId, participantes, limiteMinutos, convidadosPendentes = []) => {
        Workspace.Arena.salaAtual = salaId;
        Workspace.Arena.modoLivreAtivo = true;
        Workspace.Arena.participantesSala = Array.isArray(participantes) ? participantes : [];
        Workspace.Arena.minutosRestantes = parseInt(limiteMinutos, 10) || 30;
        Workspace.Arena.papelAtual = 'Prática Livre';
        Workspace.Arena.cenarioAtual = { id: 'livre_aberto', t: 'Prática Livre em Grupo (Sem Contexto Fixo)', livre: true };

        const nomesPresentes = Workspace.Arena.participantesSala.map(p => p.nome).join(', ');
        Workspace.Arena.oponenteNome = `Grupo (${Workspace.Arena.participantesSala.length}/5): ${nomesPresentes}`;

        const modal = document.getElementById('ws-modal-arena');
        if (modal) modal.style.display = 'none';

        Workspace.Arena.injetarPainelBatalha();
        const painel = document.getElementById('ws-painel-batalha');
        painel.style.display = 'flex';
        requestAnimationFrame(() => painel.style.opacity = '1');

        // Esconde completamente a tela de escolha de personagens ("Luzes, Câmera, Ação!")
        const telaSelecao = document.getElementById('ws-arena-selecao-personagem');
        if (telaSelecao) telaSelecao.style.display = 'none';

        document.getElementById('ws-arena-oponente-nome').innerText = `👥 Sala Livre (${Workspace.Arena.participantesSala.length}/5): ${nomesPresentes}`;

        const avisoConvidados = convidadosPendentes.length > 0
            ? `<div style="margin-top: 8px; font-size: 12.5px; color: #38bdf8;">📨 Convite enviado para: <b>${Workspace.escapeHTML(convidadosPendentes.join(', '))}</b> (entrarão automaticamente ao aceitar)</div>`
            : '';

        const log = document.getElementById('ws-arena-chat-log');
        log.innerHTML = `
            <div style="text-align: center; color: #cbd5e1; font-size: 14px; margin-bottom: 20px; background: rgba(14, 165, 233, 0.08); padding: 18px; border-radius: 15px; border: 1px dashed #38bdf8; animation: popUp 0.4s ease;">
                <strong style="color: #38bdf8; font-size: 16px; display: block; margin-bottom: 4px;">🗣️ SALA DE PRÁTICA LIVRE (ATÉ 5 PESSOAS)</strong>
                <span style="color: #f8fafc; font-size: 13.5px;">Sem contexto ou personagem fixo! Conversem livremente em inglês sobre o tema da aula.</span>
                ${avisoConvidados}
                <div style="margin-top: 10px; font-size: 12px; color: #a855f7;">💡 <b>Dica Mobile/Tablet/PC:</b> Toque em qualquer palavra ou em <b>🌐 Traduzir frase</b> nos balões para ver a tradução e pronúncia!</div>
            </div>
        `;

        Workspace.Arena.tocarSom('inicio');
        Workspace.Arena.iniciarRelogio();
    },

    procurarAleatorio: async () => {
        Workspace.Arena.desbloquearAudioNavegador(); 
        const btn = document.getElementById('ws-btn-procurar');
        const status = document.getElementById('ws-arena-status');
        const tempo = document.getElementById('ws-arena-input-tempo').value; 

        // Desativa o botão temporariamente para evitar duplo clique
        btn.disabled = true; btn.style.opacity = '0.5';
        status.style.display = 'block'; 
        status.style.color = '#f59e0b';
        status.innerText = 'A lançar o Sinalizador para toda a escola... 🚀';

        try {
            // 🚀 NOVA ROTA: O Sinalizador de Desafio (Broadcast)
            const res = await Workspace.api('/workspace/arena/desafio-aleatorio', 'POST', {
                desafianteNome: Workspace.usuario.nome || Workspace.usuario.login, 
                escolaId: Workspace.usuario.escolaId,
                minutos: tempo
            });

            if (res && res.success) {
                status.style.color = '#f59e0b'; 
                status.innerHTML = 'Sinalizador no ar! O primeiro a aceitar entra na batalha... ⏳<br><span style="font-size:12px; color:#94a3b8;">Fique atento, a batalha começará automaticamente!</span>';
                
                // 🎨 Efeito visual no botão para indicar modo de espera
                btn.innerHTML = '🚨 A aguardar oponentes...';
                btn.style.background = 'transparent';
                btn.style.border = '1px solid #f59e0b';
                btn.style.color = '#f59e0b';
            } else {
                throw new Error(res?.error || "Falha ao enviar o sinalizador.");
            }
        } catch (error) { 
            // Em caso de falha, reverte o botão ao estado original
            status.style.color = '#ef4444'; 
            status.innerText = error.message || 'Erro de ligação com a Arena.'; 
            btn.disabled = false; 
            btn.style.opacity = '1'; 
            btn.innerHTML = '🎲 Procurar Oponente Aleatório';
            btn.style.background = '#3b82f6';
            btn.style.border = 'none';
            btn.style.color = 'white';
        }
    },

    convidarColega: async () => {
        Workspace.Arena.desbloquearAudioNavegador(); 
        const input = document.getElementById('ws-arena-input-convite');
        const status = document.getElementById('ws-arena-status');
        const tempo = document.getElementById('ws-arena-input-tempo').value;
        const nomeAlvo = input.value.trim();

        if (!nomeAlvo) { if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Digite ou selecione o nome do colega.", "warning"); return; }

        status.style.display = 'block'; status.style.color = '#3b82f6'; status.innerText = `A enviar convite de ${tempo} min para ${nomeAlvo}... ⏳`;

        try {
            const res = await Workspace.api('/workspace/arena/convidar', 'POST', {
                alunoId: Workspace.usuario.id, 
                alunoNome: Workspace.usuario.nome || Workspace.usuario.login, 
                colegaNome: nomeAlvo, 
                escolaId: Workspace.usuario.escolaId,
                limiteMinutos: tempo
            });

            if (res && res.success) {
                document.getElementById('ws-arena-sugestoes').style.display = 'none';
                Workspace.Arena.salaAtual = res.salaId;
                status.style.color = '#10b981'; status.innerText = 'Convite enviado! A aguardar que o colega aceite...';
            } else {
                // 🚀 A CORREÇÃO: Força o erro para que a caixa vermelha mostre a mensagem!
                throw new Error(res?.error || 'Guerreiro não encontrado na Base de Dados.');
            }
        } catch (error) { 
            status.style.color = '#ef4444'; 
            status.innerText = error.message || 'Erro ao enviar convite.'; 
        }
    },

  iniciarTreinoSolo: async (nivelDificuldade) => {
        if (!Workspace.usuario || !Workspace.usuario.id) {
            if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("A sua sessão expirou. Recarregue a página.", "error");
            return;
        }

        Workspace.Arena.desbloquearAudioNavegador(); 
        const status = document.getElementById('ws-arena-status');
        const tempo = document.getElementById('ws-arena-input-tempo').value; 
        
        document.getElementById('ws-arena-solo-options').style.display = 'none';
        status.style.display = 'block'; 
        status.style.color = '#8b5cf6'; 
        status.innerText = 'A invocar o Mestre da Guilda e a gerar cenário... ⚡';

        try {
            const res = await Workspace.api('/workspace/arena/solo', 'POST', {
                alunoId: Workspace.usuario.id, 
                alunoNome: Workspace.usuario.nome || Workspace.usuario.login, 
                escolaId: Workspace.usuario.escolaId,
                limiteMinutos: tempo,
                nivel: nivelDificuldade, // 🚀 Informa a IA do nível escolhido
                jogados: Workspace.Arena._getCenariosJogados() // 🚀 Envia a memória anti-repetição
            });

            if (res && res.success) {
                // Arranca o ecrã instantaneamente com o OBJETO do cenário
                Workspace.Arena.iniciarPartida(res.salaId, 'Mestre da Guilda 🤖', tempo, res.cenarioObj);
            }
        } catch (error) { 
            status.style.color = '#ef4444'; 
            status.innerText = 'Erro ao contactar a IA. Tente novamente.'; 
            document.getElementById('ws-btn-solo').style.display = 'flex';
        }
    },

  escutarEventosTempoReal: () => {
        if (Workspace.Arena.evtSource) return; 
        Workspace.Arena.evtSource = true;
        
        window.addEventListener('ws-sse-message', (e) => {
            try {
                const dados = e.detail;
                if (!dados) return;
              const meuNome = Workspace.usuario.nome || Workspace.usuario.login || '';
                const meuLogin = Workspace.usuario.login || '';
                const meuIdStr = String(Workspace.usuario.id || '');
                const meuRefIdStr = String(Workspace.usuario.alunoRefId || '');
                
                const destLimpos = (dados.destinatarios || []).map(n => String(n).trim().toLowerCase());
                const destIds = (dados.destinatariosIds || []).map(id => String(id));
                const meuLimpo = String(meuNome).trim().toLowerCase();
                const meuLoginLimpo = String(meuLogin).trim().toLowerCase();
                
                const souAlvo = destLimpos.includes(meuLimpo) ||
                                (meuLoginLimpo && destLimpos.includes(meuLoginLimpo)) ||
                                (meuIdStr && destIds.includes(meuIdStr)) ||
                                (meuRefIdStr && destIds.includes(meuRefIdStr));

                if (souAlvo) {
                    
                    if (dados.type === 'ARENA_CONVITE_RECEBIDO') {
                        if (window.Toast) {
                            Toast.showInterativo({
                                remetenteNome: dados.remetenteNome,
                                subtitulo: "⚔️ Desafio para a Arena",
                                mensagemCorpo: `<strong>${dados.remetenteNome}</strong> desafiou-te para uma prática de inglês de <strong>${dados.limiteMinutos} minutos</strong>!`
                            }, 'arena', async () => {
                                Workspace.Arena.desbloquearAudioNavegador(); 
                                await Workspace.api(`/workspace/arena/${dados.salaId}/aceitar`, 'POST', {
                                    alunoId: Workspace.usuario.id, alunoNome: meuNome, escolaId: Workspace.usuario.escolaId
                                });
                            });
                        }
                    }
                    
                   // 🚀 1. DONO DO POST RECEBE O PING
                    if (dados.type === 'ARENA_DESAFIO_DIRETO') {
                        Workspace.Arena.desbloquearAudioNavegador();
                        Workspace.Arena.mostrarConviteDireto(dados.desafianteNome, dados.minutos, dados.salaId, dados.postId);
                    }

                    // 🚀 2. DESAFIANTE É AVISADO QUE O DONO RECUSOU
                    if (dados.type === 'ARENA_DESAFIO_RECUSADO') {
                        if (window.Workspace && Workspace.mostrarAviso) {
                            Workspace.mostrarAviso("O oponente não aceitou o desafio ou não está disponível.", "warning");
                        }
                        if (window.Workspace && Workspace.Feed && Workspace.Feed._ultimoBotaoDesafioPendente) {
                            const btn = document.getElementById(Workspace.Feed._ultimoBotaoDesafioPendente);
                            if (btn) {
                                btn.innerHTML = 'Aceitar Desafio (10 Min) ⏱️';
                                btn.disabled = false;
                                btn.style.opacity = '1';
                            }
                            Workspace.Feed._ultimoBotaoDesafioPendente = null;
                        }
                    }

                    if (dados.type === 'ARENA_CONVITE_GRUPO') {
                        const entrarNoGrupo = async () => {
                            Workspace.Arena.desbloquearAudioNavegador();
                            const res = await Workspace.api(`/workspace/arena/grupo-livre/${dados.salaId}/entrar`, 'POST', {
                                alunoId: Workspace.usuario.id,
                                alunoNome: meuNome,
                                escolaId: Workspace.usuario.escolaId || 'DEFAULT'
                            });
                            if (res && res.success) {
                                Workspace.Arena.abrirSalaGrupoLivreUI(res.salaId, res.participantes, res.limiteMinutos, []);
                            } else if (res && res.error && window.Workspace?.mostrarAviso) {
                                Workspace.mostrarAviso(res.error, 'warning');
                            }
                        };

                        if (window.Toast && typeof Toast.showInterativo === 'function') {
                            Toast.showInterativo({
                                remetenteNome: dados.remetenteNome,
                                subtitulo: "🗣️ Sala de Prática Livre (Grupo)",
                                mensagemCorpo: `<strong>${dados.remetenteNome}</strong> convidou-te para uma Sala de Prática Livre em grupo (${dados.limiteMinutos} min). Clique para entrar!`
                            }, 'arena', entrarNoGrupo);
                        } else if (confirm(`${dados.remetenteNome} convidou-te para uma Sala de Prática Livre. Deseja entrar agora?`)) {
                            entrarNoGrupo();
                        }
                    }

                    // 🚀 3. AMBOS SÃO ENGOLIDOS PARA A ARENA IMEDIATAMENTE!
                    if (dados.type === 'ARENA_MATCH_ENCONTRADO') {
                        // Descobre o nome do oponente limpando a matriz
                        const oponenteReal = dados.destinatarios.find(n => String(n).trim().toLowerCase() !== meuLimpo) || "Adversário";
                        
                        // Garante que o Modal do dono do post é destruído
                        const conviteModal = document.getElementById('ws-arena-convite-direto-modal');
                        if (conviteModal) conviteModal.remove();

                        // Destrava o botão do Feed do desafiante silenciosamente
                        if (window.Workspace && Workspace.Feed && Workspace.Feed._ultimoBotaoDesafioPendente) {
                            const btn = document.getElementById(Workspace.Feed._ultimoBotaoDesafioPendente);
                            if (btn) {
                                btn.innerHTML = 'Aceitar Desafio (10 Min) ⏱️';
                                btn.disabled = false;
                                btn.style.opacity = '1';
                            }
                            Workspace.Feed._ultimoBotaoDesafioPendente = null;
                        }

                        // INICIA A MAGIA! 🚀 (Passamos dados.cenarioObj em vez de dados.cenario)
                        Workspace.Arena.iniciarPartida(dados.salaId, oponenteReal, dados.limiteMinutos, dados.cenarioObj);
                    }
                }

               // 🚀 NOVO: O ADVERSÁRIO ESCOLHEU UM PAPEL (BLOQUEIO VISUAL DO SOBRANTE)
                if (dados.type === 'ARENA_PAPEL_BLOQUEADO' && Workspace.Arena.salaAtual === dados.salaId) {
                    const btn1 = document.getElementById('ws-btn-papel-1');
                    const btn2 = document.getElementById('ws-btn-papel-2');
                    
                    // Se este jogador ainda não escolheu nada, vê o botão bloqueado a cinzento!
                    if (!Workspace.Arena.papelAtual) {
                        if (btn1 && btn1.innerText.includes(dados.papelBloqueado)) {
                            btn1.disabled = true;
                            btn1.style.background = '#475569'; 
                            btn1.style.opacity = '0.4';
                            btn1.style.transform = 'scale(0.95)';
                            btn1.innerText = `🔒 (Escolhido pelo Oponente)`;
                        } else if (btn2 && btn2.innerText.includes(dados.papelBloqueado)) {
                            btn2.disabled = true;
                            btn2.style.background = '#475569'; 
                            btn2.style.opacity = '0.4';
                            btn2.style.transform = 'scale(0.95)';
                            btn2.innerText = `🔒 (Escolhido pelo Oponente)`;
                        }
                    }
                }

                // 🎯 O TIRO DE PARTIDA! Ambos escolheram. Entram na Arena na mesma fração de segundo!
                if (dados.type === 'ARENA_TODOS_PRONTOS' && Workspace.Arena.salaAtual === dados.salaId) {
                    if (Workspace.Arena.papelAtual) {
                        Workspace.Arena.comecarCombateReal(Workspace.Arena.papelAtual);
                    }
                }

                if (dados.type === 'ARENA_GRUPO_ATUALIZADO' && Workspace.Arena.salaAtual === dados.salaId) {
                    Workspace.Arena.participantesSala = dados.participantes || [];
                    const nomesPresentes = Workspace.Arena.participantesSala.map(p => p.nome).join(', ');
                    const headerEl = document.getElementById('ws-arena-oponente-nome');
                    if (headerEl) {
                        headerEl.innerText = `👥 Sala Livre (${Workspace.Arena.participantesSala.length}/5): ${nomesPresentes}`;
                    }
                    const log = document.getElementById('ws-arena-chat-log');
                    if (log && dados.novoMembro && dados.novoMembro !== meuNome) {
                        log.insertAdjacentHTML('beforeend', `<div style="text-align:center; color:#10b981; font-size:12.5px; margin:6px 0;">✨ <b>${Workspace.escapeHTML(dados.novoMembro)}</b> entrou na Sala Livre! (${Workspace.Arena.participantesSala.length}/5)</div>`);
                        log.scrollTop = log.scrollHeight;
                    }
                }

                // (Eventos que não dependem do array de destinatários)
                if (dados.type === 'ARENA_NOVA_FALA' && Workspace.Arena.salaAtual === dados.salaId) {
                    if (dados.fala.autorNome !== meuNome) {
                        Workspace.Arena.desenharBalao(dados.fala.autorNome, dados.fala.texto, false, dados.fala.combo);
                        Workspace.Arena.tempoUltimaRececao = Date.now();
                        
                        // 🚀 A CORREÇÃO: Dispara o som de nova mensagem sempre que o oponente fala!
                        Workspace.Arena.tocarSom('mensagem');
                    }
                }

                // O Mestre da Guilda atua como NPC!
                if (dados.type === 'ARENA_DICA_MESTRE' && Workspace.Arena.salaAtual === dados.salaId) {
                    Workspace.Arena.desenharBalao('🧙‍♂️ Mestre da Guilda', dados.dica, false);
                }

                if (dados.type === 'ARENA_RESULTADO_FINAL' && Workspace.Arena.salaAtual === dados.salaId) {
                    Workspace.Arena.exibirPainelResultadoFinal(dados.resultado);
                }

                // 🚀 NOVO: Captura a fuga do oponente em tempo real!
                if (dados.type === 'ARENA_OPONENTE_FUGIU' && Workspace.Arena.salaAtual === dados.salaId) {
                    if (dados.fugitivoNome !== meuNome) {
                        Workspace.Arena.lidarComFugaDoOponente(dados.fugitivoNome);
                    }
                }
            } catch (err) {
                // Silencia erros de parse para não quebrar a conexão
            }
        });
    },

 iniciarPartida: (salaId, oponente, limiteMinutos, cenarioObj) => {
        Workspace.Arena.salaAtual = salaId;
        Workspace.Arena.oponenteNome = oponente;
        Workspace.Arena.minutosRestantes = parseInt(limiteMinutos) || 50;
        Workspace.Arena.papelAtual = null;
        Workspace.Arena.cenarioAtual = null;
        
        // Arma o detetive de abas
        window.addEventListener('beforeunload', Workspace.Arena._onBeforeUnload);

        const modal = document.getElementById('ws-modal-arena');
        if (modal) {
            modal.style.display = 'none';
            // Reseta a interface do menu Solo para a próxima vez
            const btnSolo = document.getElementById('ws-btn-solo');
            const menuSolo = document.getElementById('ws-arena-solo-options');
            const btnProcurar = document.getElementById('ws-btn-procurar');
            if(btnSolo) btnSolo.style.display = 'flex';
            if(menuSolo) menuSolo.style.display = 'none';
            if(btnProcurar) btnProcurar.style.display = 'block';
            document.getElementById('ws-arena-status').style.display = 'none';
        }

        Workspace.Arena.injetarPainelBatalha();
        const painel = document.getElementById('ws-painel-batalha');
        painel.style.display = 'flex';
        requestAnimationFrame(() => painel.style.opacity = '1');

        // 🚀 A CORREÇÃO DO ÁUDIO: Toca exatamente quando a luz da Arena se acende!
        Workspace.Arena.tocarSom('inicio');

        // 🚀 O NOVO MOTOR CEREBRAL: Aceita o cenário enviado pelo servidor
        Workspace.Arena.cenarioAtual = cenarioObj || { t: "Conversa Livre", p1: "Participante 1", p2: "Participante 2" };

        // 🚀 MEMÓRIA ANTI-REPETIÇÃO: Grava este cenário para não voltar a aparecer em 7 dias
        if (Workspace.Arena.cenarioAtual && Workspace.Arena.cenarioAtual.id) {
            Workspace.Arena._addCenarioJogado(Workspace.Arena.cenarioAtual.id);
        }

        // Monta a tela de escolhas
        document.getElementById('ws-arena-cenario-texto').innerText = `"${Workspace.Arena.cenarioAtual.t}"`;
        document.getElementById('ws-btn-papel-1').innerText = `🎭 ${Workspace.Arena.cenarioAtual.p1}`;
        document.getElementById('ws-btn-papel-2').innerText = `🎭 ${Workspace.Arena.cenarioAtual.p2}`;
        document.getElementById('ws-btn-papel-1').disabled = false;
        document.getElementById('ws-btn-papel-2').disabled = false;
        document.getElementById('ws-arena-status-escolha').style.display = 'none';
        
        // Exibe a tela de escolha.
        document.getElementById('ws-arena-selecao-personagem').style.display = 'flex';
    },

    // 🚀 Lógica disparada quando o Aluno clica num botão de papel
    escolherPapel: async (numeroPapel) => {
        const cenario = Workspace.Arena.cenarioAtual;
        const meuPapel = numeroPapel === 1 ? cenario.p1 : cenario.p2;
        const papelRestante = numeroPapel === 1 ? cenario.p2 : cenario.p1; // 🚀 Calcula o que sobrou para a IA

        const btn1 = document.getElementById('ws-btn-papel-1');
        const btn2 = document.getElementById('ws-btn-papel-2');
        const status = document.getElementById('ws-arena-status-escolha');

        // 1. Trava os botões localmente na mesma fração de segundo!
        if (btn1) btn1.disabled = true;
        if (btn2) btn2.disabled = true;

        // 2. Dá feedback visual imediato ao aluno sobre o que ele clicou
        if (numeroPapel === 1) {
            if (btn1) { btn1.style.background = '#10b981'; btn1.style.transform = 'scale(1.05)'; btn1.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.5)'; }
            if (btn2) { btn2.style.opacity = '0.3'; btn2.style.background = '#1e293b'; }
        } else {
            if (btn2) { btn2.style.background = '#10b981'; btn2.style.transform = 'scale(1.05)'; btn2.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.5)'; }
            if (btn1) { btn1.style.opacity = '0.3'; btn1.style.background = '#1e293b'; }
        }

        status.style.display = 'block';
        status.innerText = 'A aguardar que o oponente escolha... ⏳';
        status.style.color = '#f59e0b';

        // 3. Guarda o papel na memória
        Workspace.Arena.papelAtual = meuPapel;

        try {
            await Workspace.api(`/workspace/arena/${Workspace.Arena.salaAtual}/escolher-papel`, 'POST', {
                alunoId: Workspace.usuario.id,
                papelEscolhido: meuPapel,
                papelRestante: papelRestante // 🚀 Envia o papel sobrante para o Backend!
            });
        } catch(e) {
            status.style.color = '#ef4444'; status.innerText = 'Erro de comunicação. Tente novamente.';
        }
    },

    // 🚀 Arranca a partida a sério após os papéis estarem definidos
    comecarCombateReal: (meuPapel) => {
        document.getElementById('ws-arena-selecao-personagem').style.display = 'none';
        
        const cenario = Workspace.Arena.cenarioAtual;
        const oponentePapel = (meuPapel === cenario.p1) ? cenario.p2 : cenario.p1;
        
        // Atualiza os cabeçalhos
        document.getElementById('ws-arena-oponente-nome').innerText = `Contra: ${Workspace.Arena.oponenteNome} (${oponentePapel})`;
        
        // Coloca a "Claquete do Mestre" no meio do chat
        const log = document.getElementById('ws-arena-chat-log');
        log.innerHTML = `
            <div style="text-align: center; color: #cbd5e1; font-size: 14px; margin-bottom: 25px; background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; border: 1px dashed #3b82f6; animation: popUp 0.5s ease;">
                <strong style="color: #38bdf8; font-size: 16px; display: block; margin-bottom: 5px;">🎬 CENÁRIO:</strong> 
                <span style="color:#fff; font-size: 15px;">${cenario.t}</span><br><br>
                O teu papel: <strong style="color: #f59e0b; font-size: 18px; text-transform: uppercase;">${meuPapel}</strong><br>
                <div style="background: #10b981; color: white; display: inline-block; padding: 6px 15px; border-radius: 20px; font-weight: bold; margin-top: 15px; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.4);">A Batalha Começou! Liguem os microfones.</div>
            </div>`;
        
        // AGORA SIM, o relógio arranca!
        Workspace.Arena.iniciarRelogio();
    },

    adicionarPontuacaoInteligente: (texto) => {
        let txt = texto.trim();
        if (!txt) return "";
        txt = txt.charAt(0).toUpperCase() + txt.slice(1);
        if (txt.match(/[.?!]$/)) return txt;
        const palavrasInterrogativas = ['what', 'where', 'when', 'who', 'why', 'how', 'do', 'does', 'did', 'is', 'are', 'can', 'could', 'would', 'should', 'will', 'have', 'has'];
        const primeiraPalavra = txt.split(' ')[0].toLowerCase();
        if (palavrasInterrogativas.includes(primeiraPalavra)) return txt + "?";
        else return txt + ".";
    },

    // ============================================================================
    // 🚀 JANELA DE DECISÃO: ALGUÉM ACEITOU O TEU DESAFIO NO FEED!
    // ============================================================================
    mostrarConviteDireto: (desafianteNome, minutos, salaId, postId) => { // 🚀 POST ID AQUI
        const idModal = 'ws-arena-convite-direto-modal';
        if (document.getElementById(idModal)) document.getElementById(idModal).remove();

        const modal = document.createElement('div');
        modal.id = idModal;
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh; background: rgba(0,0,0,0.85); z-index: 999999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); animation: fadeIn 0.2s ease;';

        modal.innerHTML = `
            <div style="background: #1e293b; padding: 30px; border-radius: 20px; width: 90%; max-width: 400px; text-align: center; border: 1px solid #334155; box-shadow: 0 20px 50px rgba(0,0,0,0.5); transform: scale(0.95); animation: popUp 0.3s forwards;">
                <div style="font-size: 50px; margin-bottom: 15px; animation: pulse 1s infinite;">⚔️</div>
                <h2 style="color: #fff; margin: 0 0 10px 0; font-size: 22px;">Desafio Aceite!</h2>
                <p style="color: #94a3b8; font-size: 15px; margin-bottom: 25px; line-height: 1.5;">O(a) <strong>${Workspace.escapeHTML(desafianteNome)}</strong> acabou de aceitar o teu desafio no Feed para um combate de <strong>${minutos} Minutos</strong>!</p>
                <div style="display: flex; gap: 10px;">
                    <button id="btn-aceitar-direto" style="flex: 1; background: #10b981; color: white; border: none; padding: 12px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#059669'">Lutar Agora</button>
                    <button id="btn-recusar-direto" style="flex: 1; background: transparent; border: 1px solid #ef4444; color: #ef4444; padding: 12px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.1)'">Recusar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        Workspace.Arena.tocarSom('inicio');

        document.getElementById('btn-aceitar-direto').onclick = async () => {
            document.getElementById('btn-aceitar-direto').innerText = 'A ligar...';
            try {
                await Workspace.api('/workspace/arena/desafio-direto/aceitar', 'POST', {
                    salaId: salaId,
                    desafiadoNome: Workspace.usuario.nome || Workspace.usuario.login,
                    desafianteNome: desafianteNome,
                    escolaId: Workspace.usuario.escolaId,
                    minutos: minutos,
                    postId: postId // 🚀 DEVOLVE O POST ID PARA O SERVIDOR APAGAR!
                });
                modal.remove(); 
            } catch(e) {
                Workspace.mostrarAviso("Erro ao entrar na sala.", "error");
                modal.remove();
            }
        };

        document.getElementById('btn-recusar-direto').onclick = async () => {
            modal.remove();
            try {
                await Workspace.api('/workspace/arena/desafio-direto/recusar', 'POST', {
                    desafianteNome: desafianteNome,
                    escolaId: Workspace.usuario.escolaId
                });
            } catch(e){}
        };
    },

   // Variáveis do Gravador Híbrido (Compatível com Google Meet / Telemóvel)
    mediaRecorderArena: null,
    audioStreamArena: null,
    audioChunksArena: [],
    usandoGravadorNuvem: false,
    timerMaximoGravacao: null,

    configurarMicrofone: () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            Workspace.Arena.usandoGravadorNuvem = true;
            return;
        }

        Workspace.Arena.reconhecimentoVoz = new SpeechRecognition();
        Workspace.Arena.reconhecimentoVoz.lang = 'en-US'; 
        Workspace.Arena.reconhecimentoVoz.continuous = false; 
        Workspace.Arena.reconhecimentoVoz.interimResults = false;

        Workspace.Arena.reconhecimentoVoz.onstart = () => {
            const btn = document.getElementById('ws-btn-mic-arena');
            if(btn) {
                btn.innerHTML = '🔴';
                btn.style.background = '#ef4444';
                btn.style.animation = 'pulse 1s infinite';
                btn.title = 'A ouvir... Toque novamente para enviar!';
            }
        };

        // 🛡️ DETETOR DE CONFLITO COM O MEET NO TELEMÓVEL:
        // Se o sistema operativo bloquear o SpeechRecognition por causa do Meet, muda automaticamente para o Gravador em Nuvem!
        Workspace.Arena.reconhecimentoVoz.onerror = (event) => {
            const erro = event?.error || '';
            const btn = document.getElementById('ws-btn-mic-arena');

            if (erro === 'audio-capture' || erro === 'not-allowed' || erro === 'service-not-allowed' || erro === 'network') {
                Workspace.Arena.usandoGravadorNuvem = true;
                if (btn) {
                    btn.innerHTML = '🎙️';
                    btn.style.background = '#3b82f6';
                    btn.style.animation = 'none';
                }
                // Tenta imediatamente abrir o canal de áudio híbrido (MediaRecorder)
                Workspace.Arena.iniciarGravacaoNuvem();
            } else {
                if (btn) {
                    btn.innerHTML = '🎙️';
                    btn.style.background = '#3b82f6';
                    btn.style.animation = 'none';
                }
            }
        };

        Workspace.Arena.reconhecimentoVoz.onresult = async (event) => {
            let transcricaoBruta = event.results[0][0].transcript;
            await Workspace.Arena.processarTextoCaptado(transcricaoBruta);
        };

        Workspace.Arena.reconhecimentoVoz.onend = () => {
            const btn = document.getElementById('ws-btn-mic-arena');
            if(btn && btn.innerHTML !== '⏳' && !Workspace.Arena.mediaRecorderArena) { 
                btn.innerHTML = '🎙️'; 
                btn.style.background = '#3b82f6'; 
                btn.style.animation = 'none'; 
            }
        };
    },

    // 🧠 Processa, pontua com a IA e envia a fala para a Arena
    processarTextoCaptado: async (transcricaoBruta) => {
        const agora = Date.now();
        if (!transcricaoBruta || transcricaoBruta.trim() === '') return; 

        if (Workspace.Arena.ultimaFala === transcricaoBruta && (agora - Workspace.Arena.ultimoTempoFala) < 2000) return; 
        
        Workspace.Arena.ultimaFala = transcricaoBruta;
        Workspace.Arena.ultimoTempoFala = agora;
        
        const btn = document.getElementById('ws-btn-mic-arena');
        if(btn) { 
            btn.innerHTML = '⏳'; 
            btn.style.background = '#f59e0b'; 
            btn.style.animation = 'none'; 
        }
        
        let iaRespondeu = false;
        const timerSalvaVidas = setTimeout(() => {
            if (!iaRespondeu) {
                iaRespondeu = true;
                const textoSeguro = Workspace.Arena.adicionarPontuacaoInteligente(transcricaoBruta);
                Workspace.Arena.enviarFala(textoSeguro);
                if(btn) { btn.innerHTML = '🎙️'; btn.style.background = '#3b82f6'; }
            }
        }, 7000);
        
        try {
            const res = await Workspace.api('/workspace/ingles/transcricao/corrigir', 'POST', { textoCru: transcricaoBruta });
            if (iaRespondeu) return;
            iaRespondeu = true;
            clearTimeout(timerSalvaVidas);
            
            let textoFinal = (res && res.success && res.textoCorrigido)
                ? res.textoCorrigido
                : Workspace.Arena.adicionarPontuacaoInteligente(transcricaoBruta);
            Workspace.Arena.enviarFala(textoFinal);
        } catch (e) {
            if (iaRespondeu) return;
            iaRespondeu = true;
            clearTimeout(timerSalvaVidas);
            const textoFinal = Workspace.Arena.adicionarPontuacaoInteligente(transcricaoBruta);
            Workspace.Arena.enviarFala(textoFinal);
        } finally {
            if(btn && btn.innerHTML !== '🔴') { 
                btn.innerHTML = '🎙️'; 
                btn.style.background = '#3b82f6'; 
            }
        }
    },

    // ☁️ GRAVADOR DE NUVEM COM LIBERTAÇÃO IMEDIATA DO MICROFONE (COMPATÍVEL COM CHAMADAS)
    iniciarGravacaoNuvem: async () => {
        const btn = document.getElementById('ws-btn-mic-arena');
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            const inputFala = document.getElementById('ws-arena-input-fala');
            if (inputFala) inputFala.focus();
            if (window.Workspace && Workspace.mostrarAviso) {
                Workspace.mostrarAviso("Use a barra de texto abaixo para enviar a sua resposta!", "info");
            }
            return;
        }

        try {
            // Requisita áudio com filtros de chamada (echoCancellation + noiseSuppression)
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            Workspace.Arena.audioStreamArena = stream;
            Workspace.Arena.audioChunksArena = [];

            let opcoesMime = {};
            if (typeof MediaRecorder !== 'undefined') {
                if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) opcoesMime = { mimeType: 'audio/webm;codecs=opus' };
                else if (MediaRecorder.isTypeSupported('audio/mp4')) opcoesMime = { mimeType: 'audio/mp4' };
            }

            const recorder = new MediaRecorder(stream, opcoesMime);
            Workspace.Arena.mediaRecorderArena = recorder;

            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    Workspace.Arena.audioChunksArena.push(e.data);
                }
            };

            recorder.onstop = async () => {
                // 🔓 LIBERTA IMEDIATAMENTE O HARDWARE DO MICROFONE DE VOLTA PARA O MEET!
                if (Workspace.Arena.audioStreamArena) {
                    Workspace.Arena.audioStreamArena.getTracks().forEach(track => {
                        try { track.stop(); } catch (e) {}
                    });
                    Workspace.Arena.audioStreamArena = null;
                }
                Workspace.Arena.mediaRecorderArena = null;
                clearTimeout(Workspace.Arena.timerMaximoGravacao);

                const chunks = Workspace.Arena.audioChunksArena;
                if (!chunks || chunks.length === 0) {
                    if (btn) { btn.innerHTML = '🎙️'; btn.style.background = '#3b82f6'; btn.style.animation = 'none'; }
                    return;
                }

                if (btn) {
                    btn.innerHTML = '⏳';
                    btn.style.background = '#f59e0b';
                    btn.style.animation = 'none';
                }

                const mimeUsado = recorder.mimeType || 'audio/webm';
                const blob = new Blob(chunks, { type: mimeUsado });
                const reader = new FileReader();

                reader.onloadend = async () => {
                    try {
                        const base64Audio = reader.result;
                        const res = await Workspace.api('/workspace/arena/transcrever-audio', 'POST', {
                            audioBase64: base64Audio,
                            mimeType: mimeUsado
                        });

                        if (res && res.success && res.textoTranscrito) {
                            await Workspace.Arena.processarTextoCaptado(res.textoTranscrito);
                        } else {
                            if (window.Workspace && Workspace.mostrarAviso) {
                                Workspace.mostrarAviso("Não ouvimos bem. Fale mais perto do microfone ou escreva abaixo!", "warning");
                            }
                        }
                    } catch (err) {
                        if (window.Workspace && Workspace.mostrarAviso) {
                            Workspace.mostrarAviso("Falha ao transcrever áudio. Pode usar a barra de texto abaixo!", "warning");
                        }
                    } finally {
                        if (btn) {
                            btn.innerHTML = '🎙️';
                            btn.style.background = '#3b82f6';
                            btn.style.animation = 'none';
                        }
                    }
                };
                reader.readAsDataURL(blob);
            };

            recorder.start();
            if (btn) {
                btn.innerHTML = '🔴';
                btn.style.background = '#ef4444';
                btn.style.animation = 'pulse 1s infinite';
            }
            if (window.Workspace && Workspace.mostrarAviso) {
                Workspace.mostrarAviso("🎙️ Gravando! Fale em inglês e toque no botão 🔴 para enviar.", "info", 2500);
            }

            // Corta e envia automaticamente após 12 segundos caso o aluno esqueça de tocar novamente
            clearTimeout(Workspace.Arena.timerMaximoGravacao);
            Workspace.Arena.timerMaximoGravacao = setTimeout(() => {
                if (Workspace.Arena.mediaRecorderArena && Workspace.Arena.mediaRecorderArena.state === 'recording') {
                    Workspace.Arena.mediaRecorderArena.stop();
                }
            }, 12000);

        } catch (errMic) {
            // Se o telemóvel estiver com bloqueio exclusivo de hardware pelo Meet aberto
            if (btn) {
                btn.innerHTML = '🎙️';
                btn.style.background = '#3b82f6';
                btn.style.animation = 'none';
            }
            const inputFala = document.getElementById('ws-arena-input-fala');
            if (inputFala) inputFala.focus();
            if (window.Workspace && Workspace.mostrarAviso) {
                Workspace.mostrarAviso("🎙️ O Meet está a segurar o microfone do telemóvel! Mute o mic no Meet por 3s para falar aqui ou escreva na barra abaixo.", "warning", 5500);
            }
        }
    },

    alternarMicrofone: () => {
        const btn = document.getElementById('ws-btn-mic-arena');

        // 1. Se o Gravador de Nuvem estiver a gravar (🔴), um clique pára e envia a fala!
        if (Workspace.Arena.mediaRecorderArena && Workspace.Arena.mediaRecorderArena.state === 'recording') {
            try { Workspace.Arena.mediaRecorderArena.stop(); } catch (e) {}
            return;
        }

        // 2. Se estiver em estado de espera ou travado (⏳ / 🔴 do SpeechRecognition), finaliza/reinicia
        if (btn && (btn.innerHTML.includes('⏳') || btn.innerHTML.includes('🔴'))) {
            if (Workspace.Arena.reconhecimentoVoz) {
                try { Workspace.Arena.reconhecimentoVoz.stop(); } catch(e) {
                    try { Workspace.Arena.reconhecimentoVoz.abort(); } catch(err){}
                }
            }
            btn.innerHTML = '🎙️'; 
            btn.style.background = '#3b82f6'; 
            btn.style.animation = 'none'; 
            return; 
        }

        // 3. Se já detetou conflito com o Meet ou navegador mobile sem SpeechRecognition, usa direto o Gravador de Nuvem
        if (Workspace.Arena.usandoGravadorNuvem || !Workspace.Arena.reconhecimentoVoz) {
            Workspace.Arena.iniciarGravacaoNuvem();
            return;
        }

        // 4. Caso contrário, inicia o reconhecimento rápido padrão (que faz fallback automático em onerror se o Meet bloquear)
        try {
            Workspace.Arena.reconhecimentoVoz.start();
        } catch (e) {
            Workspace.Arena.usandoGravadorNuvem = true;
            Workspace.Arena.iniciarGravacaoNuvem();
        }
    },

    // ⌨️ Envia a fala digitada ou ditada na barra rápida inferior
    enviarFalaInput: () => {
        const inputEl = document.getElementById('ws-arena-input-fala');
        if (!inputEl) return;
        const textoCru = inputEl.value.trim();
        if (!textoCru) return;
        inputEl.value = '';
        const textoPontuado = Workspace.Arena.adicionarPontuacaoInteligente(textoCru);
        Workspace.Arena.enviarFala(textoPontuado);
    },

    enviarFala: async (texto) => {
        if (!texto || !Workspace.Arena.salaAtual) return;
        
        const tempoDecorrido = Date.now() - Workspace.Arena.tempoUltimaRececao;
        if (tempoDecorrido < 8000) {
            Workspace.Arena.comboAtual += 1;
        } else {
            Workspace.Arena.comboAtual = 0;
        }

        Workspace.Arena.desenharBalao(Workspace.usuario.nome || Workspace.usuario.login, texto, true, Workspace.Arena.comboAtual);

        try {
            await Workspace.api(`/workspace/arena/${Workspace.Arena.salaAtual}/falar`, 'POST', {
                texto: texto, 
                autorId: Workspace.usuario.id, 
                autorNome: Workspace.usuario.nome || Workspace.usuario.login, 
                escolaId: Workspace.usuario.escolaId,
                combo: Workspace.Arena.comboAtual
            });
        } catch (error) { if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Erro ao transmitir fala.", "error"); }
    },

    injetarPainelBatalha: () => {
        if (document.getElementById('ws-painel-batalha')) return;
        const painel = document.createElement('div');
        painel.id = 'ws-painel-batalha';
        painel.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100dvh; background: #0f172a; z-index: 100100; flex-direction: column; opacity: 0; transition: opacity 0.3s;';
        
        painel.innerHTML = `
            <div style="padding: 15px 25px; background: #1e293b; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 24px;">⚔️</span>
                    <div>
                        <h2 style="margin: 0; color: #fff; font-size: 16px;">Arena de Roleplay</h2>
                        <div style="color: #10b981; font-size: 12px; font-weight: bold;" id="ws-arena-oponente-nome">A aguardar oponente...</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 20px;">
                    <div style="background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #fca5a5; padding: 6px 15px; border-radius: 20px; font-weight: bold; font-size: 18px; font-variant-numeric: tabular-nums;" id="ws-arena-timer">
                        50:00
                    </div>
                    <button onclick="Workspace.Arena.abandonarPartida()" style="background: transparent; border: none; color: #94a3b8; font-size: 24px; cursor: pointer;" title="Sair">✖</button>
                </div>
            </div>
            
            <!-- 🚀 TELA DE SELEÇÃO DE PERSONAGEM -->
            <div id="ws-arena-selecao-personagem" style="position: absolute; top: 65px; left: 0; width: 100%; height: calc(100% - 65px); background: rgba(15,23,42,0.98); z-index: 100105; display: none; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center; backdrop-filter: blur(10px);">
                <div style="font-size: 60px; margin-bottom: 10px; animation: bounceIn 0.8s ease;">🎬</div>
                <h2 style="color: white; margin: 0 0 10px 0; font-size: 24px;">Luzes, Câmera, Ação!</h2>
                <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; border: 1px dashed #475569; margin-bottom: 30px; max-width: 600px;">
                    <p style="color: #cbd5e1; font-size: 14px; text-transform: uppercase; margin: 0 0 5px 0; font-weight: bold;">Cenário do Duelo:</p>
                    <p id="ws-arena-cenario-texto" style="color: #38bdf8; font-size: 18px; margin: 0; font-weight: bold;">...</p>
                </div>
                <h3 style="color: #f59e0b; margin-bottom: 20px; animation: pulse 1.5s infinite;">Escolha rápido o seu papel:</h3>
                <div style="display: flex; gap: 15px; width: 100%; max-width: 600px; flex-wrap: wrap; justify-content: center;">
                    <button id="ws-btn-papel-1" onclick="Workspace.Arena.escolherPapel(1)" class="ws-btn" style="flex: 1; min-width: 250px; padding: 20px; background: #3b82f6; font-size: 16px; box-shadow: 0 10px 20px rgba(59,130,246,0.3); transition: 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"></button>
                    <button id="ws-btn-papel-2" onclick="Workspace.Arena.escolherPapel(2)" class="ws-btn" style="flex: 1; min-width: 250px; padding: 20px; background: #8b5cf6; font-size: 16px; box-shadow: 0 10px 20px rgba(139,92,246,0.3); transition: 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"></button>
                </div>
                <div id="ws-arena-status-escolha" style="color: #10b981; margin-top: 25px; font-weight: bold; display: none; font-size: 16px;">A processar escolha... ⏳</div>
            </div>

            <div id="ws-arena-chat-log" style="flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px;"></div>
            
            <!-- 🚀 RODAPÉ HÍBRIDO: DICA + MICROFONE ANTI-BLOQUEIO + BARRA DE RESPOSTA RÁPIDA -->
            <div style="padding: 14px 18px; background: #1e293b; border-top: 1px solid #334155; display: flex; justify-content: center; align-items: center; gap: 12px; position: relative; flex-wrap: wrap;">
                <button id="ws-btn-lifeline" onclick="Workspace.Arena.pedirAjudaMestre()" style="background: rgba(168, 85, 247, 0.15); border: 1px solid #a855f7; color: #d8b4fe; width: 46px; height: 46px; border-radius: 50%; font-size: 20px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; flex-shrink: 0;" title="Pedir Dica ao Mestre (Lifeline)">💡</button>
                
                <button id="ws-btn-mic-arena" onclick="Workspace.Arena.alternarMicrofone()" style="background: #3b82f6; color: white; border: none; width: 58px; height: 58px; border-radius: 50%; font-size: 24px; cursor: pointer; box-shadow: 0 5px 20px rgba(59, 130, 246, 0.4); transition: 0.2s; display: flex; align-items: center; justify-content: center; z-index: 2; flex-shrink: 0;" title="Falar no Microfone">🎙️</button>

                <div style="flex: 1; min-width: 180px; max-width: 520px; display: flex; align-items: center; gap: 8px; background: #0f172a; border: 1px solid #334155; border-radius: 30px; padding: 6px 8px 6px 16px;">
                    <input type="text" id="ws-arena-input-fala" placeholder="Fale no 🎙️ ou escreva/dite aqui (modo Meet)..." style="flex: 1; background: transparent; border: none; color: #fff; font-size: 14px; outline: none; min-width: 0;" onkeydown="if(event.key === 'Enter') { event.preventDefault(); Workspace.Arena.enviarFalaInput(); }">
                    <button type="button" onclick="Workspace.Arena.enviarFalaInput()" style="background: #10b981; color: #fff; border: none; width: 38px; height: 38px; border-radius: 50%; font-size: 16px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;" title="Enviar Fala">➤</button>
                </div>

                <div id="ws-arena-sugestoes-box" style="display: none; position: absolute; bottom: 90px; left: 50%; transform: translateX(-50%); width: 90%; max-width: 400px; background: rgba(15, 23, 42, 0.95); border: 1px solid #a855f7; border-radius: 16px; padding: 20px; box-shadow: 0 15px 40px rgba(0,0,0,0.6); z-index: 100;"></div>
            </div>
        `;
        document.body.appendChild(painel);
    },

   pedirAjudaMestre: async () => {
        if (!Workspace.Arena.salaAtual) return;
        const btn = document.getElementById('ws-btn-lifeline');
        const box = document.getElementById('ws-arena-sugestoes-box');

        if (btn) { btn.disabled = true; btn.style.opacity = '0.5'; btn.innerText = '⏳'; }

        try {
            // 🚀 AGORA ENVIAMOS O CENÁRIO E O PAPEL PARA A IA!
            const res = await Workspace.api(`/workspace/arena/${Workspace.Arena.salaAtual}/ajuda`, 'POST', {
                cenario: Workspace.Arena.cenarioAtual ? Workspace.Arena.cenarioAtual.t : 'Conversa Livre',
                papel: Workspace.Arena.papelAtual || 'Guerreiro'
            });

            if (res && res.success && res.sugestoes) {
                Workspace.Arena.tocarSom('mensagem');
                
                let html = `<h4 style="color: #d8b4fe; margin: 0 0 15px 0; text-align: center; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">🪄 Sugestões para ${Workspace.Arena.papelAtual || 'ti'}</h4><div style="display: flex; flex-direction: column; gap: 10px;">`;

                res.sugestoes.forEach(sugestao => {
                    const sugestaoSegura = window.Workspace.escapeHTML ? Workspace.escapeHTML(sugestao) : sugestao;
                    // Se clicar numa frase, ela é imediatamente disparada no chat do duelo!
                    html += `<div style="background: rgba(168, 85, 247, 0.15); border: 1px solid #a855f7; padding: 12px 15px; border-radius: 10px; color: #fff; font-size: 15px; font-weight: 600; cursor: pointer; transition: 0.2s; text-align: center;" onmouseover="this.style.background='rgba(168, 85, 247, 0.3)'" onmouseout="this.style.background='rgba(168, 85, 247, 0.15)'" onclick="Workspace.Arena.usarSugestao('${sugestaoSegura}')">"${sugestao}"</div>`;
                });

                html += `</div><button onclick="document.getElementById('ws-arena-sugestoes-box').style.display='none'" style="width: 100%; margin-top: 15px; background: transparent; border: 1px solid #475569; color: #94a3b8; padding: 8px; border-radius: 8px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#334155'" onmouseout="this.style.background='transparent'">Esconder Dicas</button>`;

                box.innerHTML = html;
                box.style.display = 'block';
                box.style.animation = 'popUp 0.3s ease forwards';
            }
        } catch (error) {
            if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("O Mestre não pôde formular as dicas. Tente de novo.", "warning");
        } finally {
            if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.innerHTML = '💡'; }
        }
    },

    usarSugestao: (texto) => {
        document.getElementById('ws-arena-sugestoes-box').style.display = 'none';
        
        // 🚀 O SELO DE TRANSPARÊNCIA: Adiciona a etiqueta à mensagem original
        const textoComSelo = `${texto} 💡 (Ideia do Mestre)`;
        
        Workspace.Arena.enviarFala(textoComSelo);
    },

    iniciarRelogio: () => {
        Workspace.Arena.segundosRestantes = 0;
        clearInterval(Workspace.Arena.timerInterval);

        Workspace.Arena.timerInterval = setInterval(() => {
            const timerElement = document.getElementById('ws-arena-timer');
            if (!timerElement) {
                clearInterval(Workspace.Arena.timerInterval);
                return;
            }

            if (Workspace.Arena.segundosRestantes === 0) {
                if (Workspace.Arena.minutosRestantes === 0) {
                    clearInterval(Workspace.Arena.timerInterval);
                    Workspace.Arena.encerrarPartidaViaTempo();
                    return;
                }
                Workspace.Arena.minutosRestantes--;
                Workspace.Arena.segundosRestantes = 59;
            } else { Workspace.Arena.segundosRestantes--; }

            const m = Workspace.Arena.minutosRestantes.toString().padStart(2, '0');
            const s = Workspace.Arena.segundosRestantes.toString().padStart(2, '0');
            timerElement.innerText = `${m}:${s}`;

            // 🚀 O CORAÇÃO DA CAIXA NEGRA: Guarda o tempo atualizado a cada segundo!
            Workspace.Arena.salvarCaixaNegra();
        }, 1000);
    },

    // 🎨 Transforma cada palavra do balão num elemento tocável para Telemóvel, Tablet e PC
    _tornarTextoTocavelArena: (textoBruto) => {
        if (!textoBruto) return '';
        let corpoFala = String(textoBruto);
        let seloMestre = '';
        if (corpoFala.includes('💡 (Ideia do Mestre)')) {
            corpoFala = corpoFala.replace('💡 (Ideia do Mestre)', '').trim();
            seloMestre = ' <span style="font-size: 11.5px; color: #fde047; font-weight: bold;">💡 (Ideia do Mestre)</span>';
        }

        const palavrasHtml = corpoFala.split(/(\s+)/).map(parte => {
            if (/^\s+$/.test(parte)) return parte;
            const limpa = parte.replace(/^[^a-zA-Z0-9'-]+|[^a-zA-Z0-9'-]+$/g, '');
            if (!limpa) return Workspace.escapeHTML(parte);
            const seguraHtml = Workspace.escapeHTML(parte);
            const seguraJs = limpa.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            return `<span class="ws-arena-word" onclick="Workspace.Arena.tocarPalavraMobile(event, '${seguraJs}', this)" style="cursor: pointer; border-bottom: 1px dotted rgba(255,255,255,0.45); border-radius: 4px; padding: 1px 2px; transition: background 0.15s; display: inline-block;">${seguraHtml}</span>`;
        }).join('');

        return palavrasHtml + seloMestre;
    },

    tocarPalavraMobile: (event, palavra, el) => {
        if (event) {
            event.stopPropagation();
        }
        // Se o utilizador selecionou uma frase inteira arrastando, prioriza a seleção
        const sel = window.getSelection ? window.getSelection().toString().trim() : '';
        if (sel && sel.length > palavra.length) return;

        if (el) {
            const bgOriginal = el.style.background;
            el.style.background = 'rgba(255,255,255,0.28)';
            setTimeout(() => { el.style.background = bgOriginal; }, 400);
        }

        const rect = el ? el.getBoundingClientRect() : null;
        const coordX = rect ? (rect.left + rect.width / 2) : (event?.clientX || window.innerWidth / 2);
        const coordY = rect ? rect.top : (event?.clientY || window.innerHeight / 2);

        Workspace.Arena.exibirCaixaTraducao(palavra, coordX, coordY);
    },

    traduzirBalaoInteiro: (event, btnEl) => {
        if (event) event.stopPropagation();
        const balao = btnEl?.closest('[data-texto-original]');
        const textoOriginal = balao ? balao.getAttribute('data-texto-original') : '';
        if (!textoOriginal) return;

        const rect = btnEl.getBoundingClientRect();
        Workspace.Arena.exibirCaixaTraducao(textoOriginal, rect.left + rect.width / 2, rect.top);
    },

    desenharBalao: (nome, texto, isMinha) => {
        const log = document.getElementById('ws-arena-chat-log');
        const alinhamento = isMinha ? 'flex-end' : 'flex-start';

        // Cores distintas para identificar até 5 pessoas facilmente na Sala Livre
        let corFundo = isMinha ? '#2563eb' : '#334155';
        if (!isMinha && Workspace.Arena.modoLivreAtivo) {
            const paletaGrupo = ['#334155', '#0f766e', '#6d28d9', '#b45309'];
            let hash = 0;
            for (let i = 0; i < String(nome).length; i++) hash = String(nome).charCodeAt(i) + ((hash << 5) - hash);
            corFundo = paletaGrupo[Math.abs(hash) % paletaGrupo.length];
        }

        const raio = isMinha ? '16px 16px 4px 16px' : '16px 16px 16px 4px';

        let nomeDisplay = Workspace.escapeHTML(nome);
        if (!Workspace.Arena.modoLivreAtivo && Workspace.Arena.cenarioAtual && !Workspace.Arena.cenarioAtual.livre && Workspace.Arena.papelAtual) {
            const oponentePapel = (Workspace.Arena.papelAtual === Workspace.Arena.cenarioAtual.p1) ? Workspace.Arena.cenarioAtual.p2 : Workspace.Arena.cenarioAtual.p1;
            nomeDisplay = isMinha ? `${Workspace.escapeHTML(nome)} 🎭 (${Workspace.escapeHTML(Workspace.Arena.papelAtual)})` : `${Workspace.escapeHTML(nome)} 🎭 (${Workspace.escapeHTML(oponentePapel)})`;
        }

        const textoSemSelo = String(texto || '').replace('💡 (Ideia do Mestre)', '').trim();
        const textoAtributoSeguro = Workspace.escapeHTML(textoSemSelo);
        const conteudoInterativo = Workspace.Arena._tornarTextoTocavelArena(texto);

        const html = `
            <div style="display: flex; flex-direction: column; align-items: ${alinhamento}; width: 100%; animation: fadeIn 0.3s ease;">
                <span style="color: #94a3b8; font-size: 11px; margin-bottom: 4px; font-weight: bold;">${nomeDisplay}</span>
                <div data-texto-original="${textoAtributoSeguro}"
                     onmouseup="Workspace.Arena.capturarToqueTexto(event, this)"
                     ontouchend="Workspace.Arena.capturarToqueTexto(event, this)"
                     style="background: ${corFundo}; color: #fff; padding: 12px 16px; border-radius: ${raio}; max-width: 85%; font-size: 15px; line-height: 1.55; box-shadow: 0 4px 10px rgba(0,0,0,0.2); cursor: text;">
                    <div>${conteudoInterativo}</div>
                    <div style="display: flex; justify-content: flex-end; margin-top: 6px; padding-top: 5px; border-top: 1px solid rgba(255,255,255,0.12);">
                        <button type="button" onclick="Workspace.Arena.traduzirBalaoInteiro(event, this)" style="background: rgba(255,255,255,0.14); border: none; color: #e0f2fe; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                            🌐 Traduzir frase & pronúncia
                        </button>
                    </div>
                </div>
            </div>`;
        log.insertAdjacentHTML('beforeend', html);
        log.scrollTop = log.scrollHeight;
    },

    abandonarPartida: () => {
        const idModal = 'ws-arena-confirm-exit';
        if (document.getElementById(idModal)) document.getElementById(idModal).remove();
        const modal = document.createElement('div');
        modal.id = idModal;
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh; background: rgba(0,0,0,0.85); z-index: 999999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); animation: fadeIn 0.2s ease;';
        
        modal.innerHTML = `
            <div style="background: #1e293b; padding: 30px; border-radius: 20px; width: 90%; max-width: 400px; text-align: center; border: 1px solid #334155; box-shadow: 0 20px 50px rgba(0,0,0,0.5); transform: scale(0.95); animation: popUp 0.3s forwards;">
                <div style="font-size: 50px; margin-bottom: 15px;">🏃💨</div>
                <h2 style="color: #fff; margin: 0 0 10px 0; font-size: 22px;">Abandonar a Arena?</h2>
                <p style="color: #94a3b8; font-size: 14px; margin-bottom: 25px; line-height: 1.5;">Se sair agora, perderá a oportunidade de conquistar <strong>Cristais de Eloquência</strong>.</p>
                <div style="display: flex; gap: 10px;">
                    <button id="btn-arena-ficar" style="flex: 1; background: #3b82f6; color: white; border: none; padding: 12px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s;">Ficar e Lutar</button>
                    <button id="btn-arena-sair" style="flex: 1; background: transparent; border: 1px solid #ef4444; color: #ef4444; padding: 12px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s;">Sim, Sair</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('btn-arena-ficar').onclick = () => modal.remove();
        document.getElementById('btn-arena-sair').onclick = () => { 
            modal.remove(); 
            Workspace.Arena.destruirPainelBatalha(); 
        };
    },

    lidarComFugaDoOponente: (fugitivoNome) => {
        Workspace.Arena.limparCaixaNegra(); // 🚀 Elimina o histórico da RAM local
        const log = document.getElementById('ws-arena-chat-log');
        if (log) {
            // Desenha um cartão vermelho dramático na tela de quem ficou
            const html = `
                <div style="display: flex; justify-content: center; width: 100%; margin: 20px 0; animation: popUp 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);">
                    <div style="background: linear-gradient(135deg, #ef4444, #991b1b); color: white; padding: 20px 25px; border-radius: 20px; max-width: 85%; box-shadow: 0 10px 30px rgba(239, 68, 68, 0.5); border: 2px solid #fca5a5; text-align: center;">
                        <div style="font-size: 40px; margin-bottom: 10px;">🏃💨</div>
                        <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 900; margin-bottom: 8px; color: #fecaca;">Batalha Encerrada</div>
                        <div style="font-size: 16px; line-height: 1.6; font-weight: 700;">O(a) guerreiro(a) <strong>${Workspace.escapeHTML(fugitivoNome)}</strong> fugiu da arena!</div>
                        <div style="margin-top: 15px; font-size: 13px; color: #fecaca;">Você obteve uma vitória moral. Pode fechar o combate.</div>
                    </div>
                </div>
            `;
            log.insertAdjacentHTML('beforeend', html);
            log.scrollTop = log.scrollHeight;
        }

        // Efeitos de finalização
        Workspace.Arena.tocarSom('vitoria'); // Som de recompensa para quem teve a coragem de ficar!
        clearInterval(Workspace.Arena.timerInterval); // Pára o relógio
        
        if (Workspace.Arena.reconhecimentoVoz) { try { Workspace.Arena.reconhecimentoVoz.stop(); } catch(e){} }
        
        // Bloqueia a Sala na memória para que a avaliação não seja disparada acidentalmente
        Workspace.Arena.salaAtual = null;
    },

    encerrarPartidaViaTempo: async () => {
        const log = document.getElementById('ws-arena-chat-log');
        if (log) {
            log.insertAdjacentHTML('beforeend', '<div style="text-align: center; color: #f59e0b; font-size: 15px; margin-top: 30px; font-weight: bold; animation: pulse 1.5s infinite;">⏰ O tempo esgotou-se! O Mestre da Guilda (IA) está a analisar as vossas argumentações... Aguarde!</div>');
            log.scrollTop = log.scrollHeight;
        }
        
        Workspace.Arena.tocarSom('tempoEsgotado');

        if (Workspace.Arena.reconhecimentoVoz) { try { Workspace.Arena.reconhecimentoVoz.stop(); } catch(e){} }
        
        try { await Workspace.api(`/workspace/arena/${Workspace.Arena.salaAtual}/avaliar`, 'POST', { escolaId: Workspace.usuario.escolaId }); } 
        catch (error) { if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Ocorreu um atraso na avaliação.", "warning"); }
    },

  exibirPainelResultadoFinal: (resultado) => {
        Workspace.Arena.limparCaixaNegra(); // 🚀 Elimina o histórico da RAM local
        const painel = document.getElementById('ws-painel-batalha');
        if (!painel) return;

        Workspace.Arena.tocarSom('vitoria');

        const estiloCristais = `
            <style>
                .ws-cristal-box { width: 80px; height: 80px; transform: rotate(45deg); margin: 20px auto; position: relative; animation: flutuarCristal 3s ease-in-out infinite; }
                .ws-cristal-box::before { content: ''; position: absolute; top: 10%; left: 10%; right: 10%; bottom: 10%; border: 2px solid rgba(255,255,255,0.5); }
                .cristal-Safira { background: linear-gradient(135deg, #60a5fa 0%, #1d4ed8 100%); box-shadow: 0 0 30px #3b82f6, inset 0 0 20px rgba(255,255,255,0.8); }
                .cristal-Ametista { background: linear-gradient(135deg, #c084fc 0%, #7e22ce 100%); box-shadow: 0 0 30px #a855f7, inset 0 0 20px rgba(255,255,255,0.8); }
                .cristal-Rubi { background: linear-gradient(135deg, #f87171 0%, #b91c1c 100%); box-shadow: 0 0 30px #ef4444, inset 0 0 20px rgba(255,255,255,0.8); }
                .cristal-Diamante { background: linear-gradient(135deg, #22d3ee 0%, #083344 100%); box-shadow: 0 0 40px #06b6d4, inset 0 0 30px rgba(255,255,255,0.9); }
                @keyframes flutuarCristal { 0% { transform: translateY(0) rotate(45deg); } 50% { transform: translateY(-15px) rotate(45deg); } 100% { transform: translateY(0) rotate(45deg); } }
            </style>
        `;

        let htmlJogadores = '';
        let meuCristalParaFeed = 'Safira';
        let oponenteNomeParaFeed = 'um colega';

        if (resultado.jogadores && resultado.jogadores.length > 0) {
            
            // 🚀 Identifica os perfis para o botão de desafio
            const meuPerfil = resultado.jogadores.find(j => j.nome === Workspace.usuario.nome || j.nome === Workspace.usuario.login);
            if (meuPerfil) meuCristalParaFeed = meuPerfil.cristal;
            
            const oponentePerfil = resultado.jogadores.find(j => j !== meuPerfil);
            if (oponentePerfil) oponenteNomeParaFeed = oponentePerfil.nome;

            resultado.jogadores.forEach(j => {
                const classeCristal = j.cristal.includes('Diamante') ? 'cristal-Diamante' : `cristal-${j.cristal}`;
                const avatarMiniatura = window.Workspace.renderizarAvatar(j.nome, 40);

                htmlJogadores += `
                    <div style="flex: 1; min-width: 250px; background: rgba(0,0,0,0.4); border: 1px solid #334155; padding: 25px; border-radius: 20px; position: relative; overflow: hidden;">
                        <div style="position: absolute; top: -50px; left: -50px; width: 100px; height: 100px; background: white; opacity: 0.05; border-radius: 50%; filter: blur(20px);"></div>
                        
                        <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 10px; position: relative; z-index: 1;">
                            <div style="box-shadow: 0 4px 10px rgba(0,0,0,0.3); border-radius: 50%; display: flex;">${avatarMiniatura}</div>
                            <h2 style="color: white; margin: 0; font-size: 22px;">${j.nome}</h2>
                        </div>
                        
                        <div class="ws-cristal-box ${classeCristal}"></div>
                        <div style="color: #cbd5e1; font-weight: 800; font-size: 16px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 15px; position: relative; z-index: 1;">${j.titulo}</div>
                        <div style="color: #94a3b8; font-size: 14px; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 10px; border-left: 3px solid #3b82f6; position: relative; z-index: 1; text-align: left;">${j.feedback}</div>
                    </div>
                `;
            });
        }

        // 🚀 Lógica Condicional dos Botões (AGORA FORA DO HTML)
        let botoesFinais = '';
        if (Workspace.Arena.oponenteNome.includes('Mestre da Guilda')) {
            botoesFinais = `
                <button onclick="Workspace.Arena.destruirPainelBatalha()" style="background: #3b82f6; color: white; border: none; padding: 16px 30px; border-radius: 15px; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.2s; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">Concluir Treino</button>
            `;
        } else {
            botoesFinais = `
                <button onclick="Workspace.Arena.compartilharEDesafiar('${window.Workspace.escapeHTML ? Workspace.escapeHTML(oponenteNomeParaFeed) : oponenteNomeParaFeed}', '${meuCristalParaFeed}')" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 16px 30px; border-radius: 15px; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.2s; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">📢 Partilhar e Desafiar</button>
                <button onclick="Workspace.Arena.destruirPainelBatalha()" style="background: #3b82f6; color: white; border: none; padding: 16px 30px; border-radius: 15px; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.2s; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">Recolher Cristais e Voltar</button>
            `;
        }

        // 🚀 A injeção final do HTML perfeitamente formatada
        painel.innerHTML = `
            ${estiloCristais}
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px; text-align: center; background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%); animation: fadeIn 0.8s ease; overflow-y: auto;">
                <h1 style="color: white; margin: 0 0 10px 0; font-size: clamp(20px, 5vw, 32px); line-height: 1.2; background: -webkit-linear-gradient(#fcd34d, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Decisão do Mestre da Guilda (IA)</h1>
                <p style="color: #cbd5e1; font-size: 16px; margin-bottom: 30px; max-width: 600px;">"${resultado.feedbackGeral}"</p>
                <h3 style="color: #f59e0b; margin-bottom: 20px; font-size: 22px;">Destaque do Combate: ${resultado.vencedor}</h3>
                
                <div style="display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; max-width: 900px; width: 100%;">
                    ${htmlJogadores}
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin-top: 40px; width: 100%;">
                    ${botoesFinais}
                </div>
            </div>
        `;
        
        if (Workspace.Feed && Workspace.Feed.dispararConfetes) Workspace.Feed.dispararConfetes();
    },

   // 🚀 O NOVO GATILHO DE PARTILHA COM O MODO DE 10 MINUTOS
    compartilharEDesafiar: async (oponenteNome, cristal) => {
        if (!Workspace.usuario) return;
        
        // Atribui o Emoji correto ao Cristal
        let emoji = '🔷⚡';
        if (cristal.includes('Diamante')) emoji = '💎✨';
        else if (cristal.includes('Rubi')) emoji = '🟥🔥';
        else if (cristal.includes('Ametista')) emoji = '🟪🔮';

        // 🚀 O SEGREDO: Este texto tem as palavras exatas que o Feed procura para gerar o botão!
        const textoVitoria = `Acabo de sobreviver à Arena e conquistei o cristal de **${cristal}** ${emoji} num duelo épico contra o(a) **${oponenteNome}**! A minha fluência está a subir de nível.\n\nQuem tem coragem de me enfrentar num duelo direto de **10 Minutos** na Arena? ⚔️`;

        try {
            const res = await Workspace.api('/workspace/posts', 'POST', {
                texto: textoVitoria,
                autorNome: Workspace.usuario.nome || Workspace.usuario.login,
                autorTipo: Workspace.usuario.tipo,
                escolaId: Workspace.usuario.escolaId,
                anexos: [],
                destino: 'global',
                destinoNome: 'Público Geral',
                categoria: 'normal'
            });

            if (res && res.success) {
                if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Desafio de 10 Minutos lançado no Feed! 🏆", "success");
                
                // Fecha a tela da Arena e leva o aluno direto para ver a sua publicação
                Workspace.Arena.destruirPainelBatalha();
                Workspace.navegarPara('feed');
                
                if (Workspace.Feed) {
                    Workspace.Feed.todosOsPosts = [];
                    Workspace.Feed.carregarPosts();
                }
            }
        } catch (error) {
            if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Erro ao partilhar desafio no Feed.", "error");
        }
    },

   destruirPainelBatalha: () => {
        Workspace.Arena.limparCaixaNegra(); // 🚀 Elimina o histórico da RAM local
        Workspace.Arena.pararSons();
        window.removeEventListener('beforeunload', Workspace.Arena._onBeforeUnload);

        // AVISA O SERVIDOR DA FUGA (Usamos o Beacon que garante o envio mesmo que o ecrã desabe)
        if (Workspace.Arena.salaAtual) {
            const payload = JSON.stringify({
                alunoNome: Workspace.usuario.nome || Workspace.usuario.login,
                escolaId: Workspace.usuario.escolaId
            });
            navigator.sendBeacon(`/api/workspace/arena/${Workspace.Arena.salaAtual}/abandonar`, new Blob([payload], { type: 'application/json' }));
        }

        const painel = document.getElementById('ws-painel-batalha');
        if (painel) {
            painel.style.opacity = '0';
            setTimeout(() => { 
                painel.style.display = 'none'; 
                painel.remove(); 
                clearInterval(Workspace.Arena.timerInterval); 
                Workspace.Arena.salaAtual = null; 
            }, 300);
        }
    },

// ============================================================================
    // 📜 MÓDULO DE HISTÓRICO E GLÓRIA (FASE 3)
    // ============================================================================
    abrirHistoricoEstatistico: async () => {
        if (!Workspace.usuario || !Workspace.usuario.id) return;
        
        // 1. Cria o modal escuro do Pergaminho
        const idModal = 'ws-arena-historico-modal';
        if (document.getElementById(idModal)) document.getElementById(idModal).remove();
        
        const modal = document.createElement('div');
        modal.id = idModal;
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh; background: rgba(15, 23, 42, 0.9); z-index: 1000000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); animation: fadeIn 0.2s ease; padding: 20px; box-sizing: border-box;';
        
        modal.innerHTML = `
            <div style="background: #1e293b; width: 100%; max-width: 600px; max-height: 85vh; border-radius: 20px; border: 1px solid #334155; box-shadow: 0 25px 50px rgba(0,0,0,0.5); display: flex; flex-direction: column; overflow: hidden; position: relative;">
                
                <!-- Cabeçalho -->
                <div style="background: #0f172a; padding: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155;">
                    <h2 style="margin: 0; color: #fff; font-size: 18px; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 24px;">📜</span> O Seu Histórico Épico
                    </h2>
                    <button onclick="document.getElementById('${idModal}').remove()" style="background: rgba(255,255,255,0.1); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#ef4444'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">✖</button>
                </div>

                <!-- Lista de Duelos -->
                <div id="ws-arena-lista-historico" style="flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px;">
                    <div style="text-align: center; color: #94a3b8; padding: 40px;">Procurando nos arquivos da Guilda... ⏳</div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // 2. Busca os dados no servidor e injeta-os no ecrã
        try {
            const res = await Workspace.api(`/workspace/arena/historico/${Workspace.usuario.id}`, 'GET');
            const container = document.getElementById('ws-arena-lista-historico');
            
            if (res && res.success && res.historico.length > 0) {
                let html = '';
                res.historico.forEach(batalha => {
                    // Formatação bonita da data
                    const dataStr = new Date(batalha.dataFim).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
                    
                    // Lógica para descobrir quem era o adversário (sempre a pessoa que não sou eu)
                    const souJogador1 = batalha.jogador1.id === Workspace.usuario.id;
                    const adversarioNome = souJogador1 ? (batalha.jogador2 ? batalha.jogador2.nome : 'Desconhecido') : batalha.jogador1.nome;
                    
                    // Descobre qual foi o cristal que EU ganhei nesta batalha específica
                    const meuResultado = batalha.resultado?.jogadores?.find(j => j.id === Workspace.usuario.id);
                    const meuCristal = meuResultado ? meuResultado.cristal : 'Nenhum';
                    
                    // Se foi um Diamante ou Rubi, habilita o Botão de Celebrar!
                    let btnPartilha = '';
                    if (meuCristal.includes('Diamante') || meuCristal.includes('Rubi') || meuCristal.includes('Ametista')) {
                        btnPartilha = `<button onclick="Workspace.Arena.partilharVitoria('${adversarioNome}', '${meuCristal}')" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; border: none; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3); transition: 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">📢 Celebrar no Feed</button>`;
                    }

                    html += `
                        <div style="background: rgba(0,0,0,0.2); border: 1px solid #334155; padding: 15px; border-radius: 12px; display: flex; flex-direction: column; gap: 10px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div style="color: #cbd5e1; font-weight: bold; font-size: 14px;">⚔️ vs ${Workspace.escapeHTML(adversarioNome)}</div>
                                <div style="font-size: 11px; color: #64748b; background: #0f172a; padding: 4px 8px; border-radius: 6px;">${dataStr}</div>
                            </div>
                            <div style="font-size: 12px; color: #94a3b8; font-style: italic;">Missão: ${Workspace.escapeHTML(batalha.cenario || 'Conversa Livre')}</div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px; padding-top: 10px; border-top: 1px dashed #334155;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 16px;">💎</span>
                                    <span style="color: #38bdf8; font-weight: bold; font-size: 13px;">Conquista: ${meuCristal}</span>
                                </div>
                                ${btnPartilha}
                            </div>
                        </div>
                    `;
                });
                container.innerHTML = html;
            } else {
                container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 40px;">Você ainda não travou nenhuma batalha na Arena. Os seus desafios aparecerão aqui!</div>';
            }
        } catch (error) {
            document.getElementById('ws-arena-lista-historico').innerHTML = '<div style="text-align: center; color: #ef4444; padding: 40px;">Erro ao ler os arquivos da Guilda.</div>';
        }
    },

    partilharVitoria: async (oponenteNome, cristal) => {
        if (!Workspace.usuario) return;
        
        // Monta o texto de celebração
        const emoji = cristal.includes('Diamante') ? '💎✨' : '🔥';
        const textoVitoria = `Acabei de conquistar o cristal de **${cristal}** ${emoji} num duelo épico de inglês na Arena contra o(a) **${oponenteNome}**! A fluência está a evoluir a cada batalha. Quem é o próximo a desafiar-me? ⚔️`;

        try {
            // Reutiliza o motor de posts do seu Feed de forma silenciosa e perfeita
            const res = await Workspace.api('/workspace/posts', 'POST', {
                texto: textoVitoria,
                autorNome: Workspace.usuario.nome || Workspace.usuario.login,
                autorTipo: Workspace.usuario.tipo,
                escolaId: Workspace.usuario.escolaId,
                anexos: [],
                destino: 'global',
                destinoNome: 'Público Geral',
                categoria: 'normal'
            });

            if (res && res.success) {
                if (window.Workspace && Workspace.mostrarAviso) {
                    Workspace.mostrarAviso("Vitória celebrada no Feed com sucesso! 🏆", "success");
                }
                
                // Fecha o modal de histórico
                const modal = document.getElementById('ws-arena-historico-modal');
                if (modal) modal.remove();
                
                // Redireciona o aluno para o Feed para ele ver a sua própria conquista
                Workspace.navegarPara('feed');
                if (Workspace.Feed) {
                    Workspace.Feed.todosOsPosts = [];
                    Workspace.Feed.carregarPosts();
                }
            }
        } catch (error) {
            if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Erro ao partilhar no Feed.", "error");
        }
    },

    // ============================================================================
    // 🌍 SISTEMA DE TOQUE INTELIGENTE (SMART TOUCH - TRADUTOR)
    // ============================================================================
    
   // 1. O Detetive de Toques e Seleção (Compatível com Telemóvel, Tablet e PC)
    capturarToqueTexto: (event, elemento) => {
        if (event.target.tagName === 'BUTTON' || event.target.tagName === 'A' || event.target.classList?.contains('ws-arena-word')) return;

        const touch = (event.changedTouches && event.changedTouches[0]) || (event.touches && event.touches[0]) || null;
        const coordX = touch ? touch.clientX : (event.clientX || window.innerWidth / 2);
        const coordY = touch ? touch.clientY : (event.clientY || window.innerHeight / 2);

        setTimeout(() => {
            const selecao = window.getSelection ? window.getSelection() : null;
            const textoSelecionado = selecao ? selecao.toString().trim() : '';

            if (textoSelecionado && textoSelecionado.length > 1) {
                Workspace.Arena.exibirCaixaTraducao(textoSelecionado, coordX, coordY);
                try { selecao.removeAllRanges(); } catch (e) {}
            }
        }, 80); 
    },

    // 2. O Extrator Matemático de Palavras
    extrairPalavraDoClique: (event) => {
        let range;
        // Pede ao navegador para descobrir em que letra exata o pixel tocou
        if (document.caretRangeFromPoint) {
            range = document.caretRangeFromPoint(event.clientX, event.clientY);
        } else if (event.rangeParent) {
            range = document.createRange();
            range.setStart(event.rangeParent, event.rangeOffset);
        }
        
        // Se tocou fora de um texto, cancela
        if (!range || range.startContainer.nodeType !== Node.TEXT_NODE) return null;

        const textoOriginal = range.startContainer.nodeValue;
        let inicio = range.startOffset;
        let fim = range.startOffset;

        // O Algoritmo expande para a esquerda até encontrar um espaço
        while (inicio > 0 && !textoOriginal[inicio - 1].match(/\s/)) {
            inicio--;
        }
        // O Algoritmo expande para a direita até encontrar um espaço
        while (fim < textoOriginal.length && !textoOriginal[fim].match(/\s/)) {
            fim++;
        }

        // Corta a palavra limpa sem pontuações coladas (ex: "apple!" vira "apple")
        return textoOriginal.slice(inicio, fim).replace(/[.,!?;:"'()]/g, '').trim();
    },

    // 3. O Desenhista da Caixa Flutuante (Agora com Smart Positioning)
    exibirCaixaTraducao: async (texto, coordX, coordY) => {
        // Se já existir uma caixa aberta, destroi a antiga
        const caixaAntiga = document.getElementById('ws-arena-caixa-traducao');
        if (caixaAntiga) caixaAntiga.remove();

        const caixa = document.createElement('div');
        caixa.id = 'ws-arena-caixa-traducao';
        
        // 🚀 O SEGREDO DO POSICIONAMENTO INTELIGENTE (Smart Bounding Box)
        // Descobrimos se o clique foi na metade de cima ou de baixo da tela
        const metadeDaTelaY = window.innerHeight / 2;
        const clicouEmBaixo = coordY > metadeDaTelaY;

        // Se clicou na parte de baixo, a caixa fixa o "bottom" e cresce para CIMA.
        // Se clicou em cima, fixa o "top" e cresce para BAIXO.
        let posicaoYCSS = clicouEmBaixo 
            ? `bottom: ${window.innerHeight - coordY + 20}px; top: auto;` 
            : `top: ${coordY + 20}px; bottom: auto;`;

        // Prevenção lateral (evita que a caixa saia pelas bordas em telemóveis)
        let posX = coordX;
        let transformX = 'translateX(-50%)'; // Centralizado no dedo por defeito
        
        // Se estiver muito à esquerda
        if (coordX < 160) {
            posX = 20;
            transformX = 'translateX(0)';
        } 
        // Se estiver muito à direita
        else if (coordX > window.innerWidth - 160) {
            posX = window.innerWidth - 20;
            transformX = 'translateX(-100%)';
        }

        caixa.style.cssText = `position: fixed; left: ${posX}px; ${posicaoYCSS} background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(12px); border: 1px solid #3b82f6; border-radius: 16px; padding: 15px; color: white; z-index: 1000500; box-shadow: 0 15px 40px rgba(0,0,0,0.6); min-width: 220px; max-width: 320px; font-size: 14px; animation: popUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); transform: ${transformX}; display: flex; flex-direction: column;`;

        // Desenha o estado de "A carregar"
        caixa.innerHTML = `
            <div style="position: absolute; top: 8px; right: 12px; cursor: pointer; color: #94a3b8; font-weight: bold; font-size: 18px;" onclick="this.parentElement.remove()">×</div>
            <div style="color: #60a5fa; font-weight: 900; margin-bottom: 5px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 5px;"><span style="animation: pulse 1s infinite;">🧠</span> Analisando texto...</div>
            <div style="text-align: center; margin: 15px 0;"><div style="font-size: 24px; color: #94a3b8; font-style: italic;">"${Workspace.Feed.limparTexto(texto)}"</div></div>
        `;
        document.body.appendChild(caixa);

        try {
            // Envia para o nosso motor no Backend
            const res = await Workspace.api('/workspace/arena/traduzir', 'POST', { texto: texto });
            
            if (res && res.success) {
                // Sucesso! Atualiza a caixa com a Tradução e Pronúncia
                caixa.innerHTML = `
                    <div style="position: absolute; top: 8px; right: 12px; cursor: pointer; color: #94a3b8; font-weight: bold; font-size: 18px; transition: 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#94a3b8'" onclick="this.parentElement.remove()">×</div>
                    <div style="color: #38bdf8; font-weight: 800; margin-bottom: 8px; font-size: 14px; border-bottom: 1px solid #334155; padding-bottom: 6px; padding-right: 20px;">🌍 Tradução Oficial</div>
                    <div style="font-size: 16px; margin-bottom: 15px; color: #f8fafc; line-height: 1.4;">${res.traducao}</div>
                    
                    <div style="color: #a855f7; font-weight: 800; margin-bottom: 6px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">🗣️ Como Pronunciar:</div>
                    <div style="font-size: 15px; color: #ddd6fe; font-style: italic; background: rgba(168, 85, 247, 0.15); padding: 10px; border-radius: 8px; border: 1px solid rgba(168, 85, 247, 0.3); display: flex; align-items: center; gap: 8px;">
                        <span>🎙️</span> "${res.pronuncia}"
                    </div>
                `;
            } else {
                throw new Error('Falha no Backend');
            }
        } catch (err) {
            caixa.innerHTML = `
                <div style="position: absolute; top: 8px; right: 12px; cursor: pointer; color: #94a3b8; font-weight: bold; font-size: 18px;" onclick="this.parentElement.remove()">×</div>
                <div style="color: #ef4444; font-weight: bold; text-align: center; margin-top: 15px; padding-bottom: 5px;">❌ A IA perdeu o foco. Tente de novo!</div>
            `;
        }
    }


};