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
        inicio: '/audios/arena-inicio.mp3',       
        mensagem: '/audios/arena-pop.mp3',        
        tempoEsgotado: '/audios/arena-tempo.mp3', 
        vitoria: '/audios/arena-vitoria.mp3'      
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

    init: () => {
        if (Workspace.Arena.isInitialized) return; 
        Workspace.Arena.isInitialized = true;
        Workspace.Arena.injetarModalFila();
        Workspace.Arena.injetarPainelBatalha();
        Workspace.Arena.escutarEventosTempoReal();
        Workspace.Arena.configurarMicrofone();
    },

    injetarModalFila: () => {
        if (document.getElementById('ws-modal-arena')) return;
        const modal = document.createElement('div');
        modal.id = 'ws-modal-arena';
        modal.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 100050; align-items: center; justify-content: center; backdrop-filter: blur(5px);';
        
        modal.innerHTML = `
            <div style="background: #1e293b; width: 90%; max-width: 450px; padding: 30px; border-radius: 20px; text-align: center; border: 1px solid #334155; position: relative; overflow: visible;">
                <button onclick="document.getElementById('ws-modal-arena').style.display='none'" style="position: absolute; top: 15px; right: 15px; background: transparent; border: none; color: #94a3b8; font-size: 20px; cursor: pointer;">✖</button>
                <div style="font-size: 50px; margin-bottom: 15px;">🎙️</div>
                <h2 style="color: #fff; margin-top: 0;">Arena de Roleplay</h2>
                <p style="color: #94a3b8; font-size: 14px; margin-bottom: 20px;">Pratique inglês ao vivo. Escolha a duração do combate e desafie um colega!</p>
                
                <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 12px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
                    <strong style="color: #cbd5e1; font-size: 14px;">Duração da Partida:</strong>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <input type="number" id="ws-arena-input-tempo" min="5" max="50" value="50" style="width: 60px; padding: 8px; border-radius: 8px; border: 1px solid #3b82f6; background: #0f172a; color: #fff; text-align: center; font-weight: bold; outline: none;">
                        <span style="color: #94a3b8; font-size: 14px;">min</span>
                    </div>
                </div>

              <div style="display: flex; flex-direction: column; gap: 15px;">
                    <!-- 🚀 O NOVO BOTÃO DO MODO SOLO -->
                    <button id="ws-btn-solo" onclick="Workspace.Arena.iniciarTreinoSolo()" style="background: linear-gradient(135deg, #8b5cf6, #6d28d9); color: white; padding: 15px; border-radius: 12px; border: none; font-weight: bold; font-size: 16px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                        <span style="font-size: 20px;">🤖</span> Treinar Solo com a IA
                    </button>

                    <button id="ws-btn-procurar" onclick="Workspace.Arena.procurarAleatorio()" style="background: #3b82f6; color: white; padding: 15px; border-radius: 12px; border: none; font-weight: bold; font-size: 16px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#2563eb'">
                        🎲 Procurar Oponente Aleatório
                    </button>
                    
                    <div style="position: relative; text-align: left;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="text" id="ws-arena-input-convite" placeholder="Nome do Colega..." style="flex: 1; padding: 15px; border-radius: 12px; border: 1px solid #334155; background: #0f172a; color: #fff; outline: none;" oninput="Workspace.Arena.filtrarColegas()">
                            <button onclick="Workspace.Arena.convidarColega()" style="background: #10b981; color: white; padding: 15px 20px; border-radius: 12px; border: none; font-weight: bold; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#059669'">Convidar</button>
                        </div>
                        <div id="ws-arena-sugestoes" style="display: none; position: absolute; top: 100%; left: 0; width: calc(100% - 100px); max-height: 180px; overflow-y: auto; background: #1e293b; border: 1px solid #334155; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); z-index: 100; margin-top: 5px;"></div>
                    </div>
                </div>
                <div id="ws-arena-status" style="margin-top: 20px; color: #f59e0b; font-weight: bold; font-size: 14px; display: none;">A procurar oponente... ⏳</div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    abrirPainel: () => { 
        Workspace.Arena.desbloquearAudioNavegador(); 
        document.getElementById('ws-modal-arena').style.display = 'flex'; 
    },

   filtrarColegas: () => {
        const normalizar = (texto) => texto ? texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";
        const inputStr = document.getElementById('ws-arena-input-convite').value;
        const input = normalizar(inputStr);
        const lista = document.getElementById('ws-arena-sugestoes');
        lista.innerHTML = '';

        // 🚀 1. Arranca a pesquisa logo na primeira letra digitada
        if (!input || input.length < 1) { 
            lista.style.display = 'none'; 
            return; 
        }

        const meuNomeNormalizado = normalizar(Workspace.usuario.nome || Workspace.usuario.login);
        
        // 🚀 2. Encontra todos os colegas que contêm a letra/nome digitado
        let colegas = Object.keys(Workspace.avatarsCache || {}).filter(nome => {
            const nomeNorm = normalizar(nome);
            return nomeNorm.includes(input) && nomeNorm !== meuNomeNormalizado;
        });

        // 🧠 3. INTELIGÊNCIA MATEMÁTICA: Ordenação Perfeita
        colegas.sort((a, b) => {
            const aNorm = normalizar(a);
            const bNorm = normalizar(b);
            const aComeca = aNorm.startsWith(input);
            const bComeca = bNorm.startsWith(input);
            
            // Quem COMEÇA com a letra vai para o topo da lista
            if (aComeca && !bComeca) return -1; 
            if (!aComeca && bComeca) return 1;  
            // Se ambos começam (ou ambos não começam), organiza por ordem alfabética normal
            return aNorm.localeCompare(bNorm);  
        });

        if (colegas.length > 0) {
            colegas.forEach(nome => {
                // Se não tiver foto, o sistema desenha a bolinha colorida automaticamente
                const fotoHTML = window.Workspace.renderizarAvatar(nome, 30);
                
                const item = document.createElement('div');
                item.style.cssText = 'padding: 10px; display: flex; align-items: center; gap: 10px; cursor: pointer; border-bottom: 1px solid #334155; transition: 0.2s;';
                item.onmouseover = () => item.style.background = '#334155';
                item.onmouseout = () => item.style.background = 'transparent';
                
                item.onclick = () => {
                    document.getElementById('ws-arena-input-convite').value = nome;
                    lista.style.display = 'none';
                };
                
                item.innerHTML = `${fotoHTML} <span style="color: #fff; font-size: 14px;">${nome}</span>`;
                lista.appendChild(item);
            });
            lista.style.display = 'block';
        } else {
            // Feedback elegante caso o nome não exista
            lista.innerHTML = '<div style="padding: 15px; color: #94a3b8; font-size: 13px; text-align: center;">Nenhum colega encontrado com este nome.</div>';
            lista.style.display = 'block';
        }
    },

    procurarAleatorio: async () => {
        Workspace.Arena.desbloquearAudioNavegador(); 
        const btn = document.getElementById('ws-btn-procurar');
        const status = document.getElementById('ws-arena-status');
        const tempo = document.getElementById('ws-arena-input-tempo').value; 

        btn.disabled = true; btn.style.opacity = '0.5';
        status.style.display = 'block'; status.innerText = 'A vasculhar a escola à procura de um oponente... ⏳';

        try {
            const res = await Workspace.api('/workspace/arena/procurar', 'POST', {
                alunoId: Workspace.usuario.id, alunoNome: Workspace.usuario.nome || Workspace.usuario.login, escolaId: Workspace.usuario.escolaId,
                limiteMinutos: tempo
            });

            if (res && res.success) {
                Workspace.Arena.salaAtual = res.salaId;
                if (!res.mensagem.includes('A aguardar')) {
                    status.style.color = '#10b981'; status.innerText = '🔥 Oponente Encontrado! A preparar a Arena...';
                } else {
                    status.innerText = 'Você é o primeiro na fila. A aguardar oponente... ⏳';
                }
            }
        } catch (error) { status.style.color = '#ef4444'; status.innerText = 'Erro de ligação com a Arena.'; btn.disabled = false; btn.style.opacity = '1'; }
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
                alunoId: Workspace.usuario.id, alunoNome: Workspace.usuario.nome || Workspace.usuario.login, colegaNome: nomeAlvo, escolaId: Workspace.usuario.escolaId,
                limiteMinutos: tempo
            });

            if (res && res.success) {
                document.getElementById('ws-arena-sugestoes').style.display = 'none';
                Workspace.Arena.salaAtual = res.salaId;
                status.style.color = '#10b981'; status.innerText = 'Convite enviado! A aguardar que o colega aceite...';
            }
        } catch (error) { status.style.color = '#ef4444'; status.innerText = error.message || 'Erro ao enviar convite.'; }
    },

  iniciarTreinoSolo: async () => {
        // 🛡️ BLINDAGEM DE SESSÃO: Evita que o sistema crashe se a sessão expirou por inatividade
        if (!Workspace.usuario || !Workspace.usuario.id) {
            if (window.Workspace && Workspace.mostrarAviso) {
                Workspace.mostrarAviso("A sua sessão expirou. Por favor, recarregue a página e faça login novamente.", "error");
            }
            return;
        }

        Workspace.Arena.desbloquearAudioNavegador(); 
        const btn = document.getElementById('ws-btn-solo');
        const status = document.getElementById('ws-arena-status');
        const tempo = document.getElementById('ws-arena-input-tempo').value; 

        btn.disabled = true; btn.style.opacity = '0.5';
        status.style.display = 'block'; 
        status.style.color = '#8b5cf6'; 
        status.innerText = 'A evocar o Mestre da Guilda... ⚡';

        try {
            const res = await Workspace.api('/workspace/arena/solo', 'POST', {
                alunoId: Workspace.usuario.id, 
                alunoNome: Workspace.usuario.nome || Workspace.usuario.login, 
                escolaId: Workspace.usuario.escolaId,
                limiteMinutos: tempo
            });

            if (res && res.success) {
                // Arranca o ecrã instantaneamente
                Workspace.Arena.iniciarPartida(res.salaId, 'Mestre da Guilda 🤖', tempo, res.cenario);
            }
        } catch (error) { 
            status.style.color = '#ef4444'; 
            status.innerText = 'Erro ao contactar a IA.'; 
            btn.disabled = false; 
            btn.style.opacity = '1'; 
        }
    },

   escutarEventosTempoReal: () => {
        if (Workspace.Arena.evtSource) return; 
        
        Workspace.Arena.evtSource = new EventSource(`/api/workspace/stream?escolaId=${Workspace.usuario.escolaId}`);
        
       Workspace.Arena.evtSource.onmessage = (event) => {
            try {
                const dados = JSON.parse(event.data);
                const meuNome = Workspace.usuario.nome || Workspace.usuario.login;
                const meuIdStr = String(Workspace.usuario.id);
                
                // 🚀 O SEGREDO DA PERFEIÇÃO BLINDADA: Filtra por Nome exato OU pela ID (Impressão Digital)
                const destLimpos = (dados.destinatarios || []).map(n => String(n).trim().toLowerCase());
                const destIds = (dados.destinatariosIds || []).map(id => String(id));
                const meuLimpo = String(meuNome).trim().toLowerCase();
                
                // Agora o "Raio Trator" puxa o jogador mesmo que o nome tenha sido alterado ou escrito errado!
                if (destLimpos.includes(meuLimpo) || destIds.includes(meuIdStr)) {
                    
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

                        // INICIA A MAGIA!
                        Workspace.Arena.iniciarPartida(dados.salaId, oponenteReal, dados.limiteMinutos, dados.cenario);
                    }
                }

                // (Eventos que não dependem do array de destinatários)
                if (dados.type === 'ARENA_NOVA_FALA' && Workspace.Arena.salaAtual === dados.salaId) {
                    if (dados.fala.autorNome !== meuNome) {
                        Workspace.Arena.desenharBalao(dados.fala.autorNome, dados.fala.texto, false, dados.fala.combo);
                        Workspace.Arena.tempoUltimaRececao = Date.now();
                    }
                }
               
                // Se o adversário clicou no personagem primeiro, o Servidor avisa-nos automaticamente para arrancarmos!
                if (dados.type === 'ARENA_PAPEIS_DEFINIDOS' && Workspace.Arena.salaAtual === dados.salaId) {
                if (!Workspace.Arena.papelAtual) { // Só executa se eu ainda estiver na tela de escolha
                    Workspace.Arena.papelAtual = dados.seuPapel;
                    if (window.Toast) Toast.show({ message: `O oponente escolheu rápido! Você será: ${dados.seuPapel}`, type: 'info' });
                    Workspace.Arena.comecarCombateReal(dados.seuPapel);
                }
            }

                if (dados.type === 'ARENA_DICA_MESTRE' && Workspace.Arena.salaAtual === dados.salaId) {
                    Workspace.Arena.desenharDicaDoMestre(dados.dica);
                }

                // 🚀 NOVO: Captura o Plot Twist em tempo real!
                if (dados.type === 'ARENA_PLOT_TWIST' && Workspace.Arena.salaAtual === dados.salaId) {
                    Workspace.Arena.desenharPlotTwist(dados.twist);
                }

                if (dados.type === 'ARENA_RESULTADO_FINAL' && Workspace.Arena.salaAtual === dados.salaId) {
                    Workspace.Arena.exibirPainelResultadoFinal(dados.resultado);
                }
            } catch (err) {
                // Silencia erros de parse para não quebrar a conexão
            }
        };
    },

  iniciarPartida: (salaId, oponente, limiteMinutos, cenarioSoloOpcional) => {
        Workspace.Arena.salaAtual = salaId;
        Workspace.Arena.oponenteNome = oponente;
        Workspace.Arena.minutosRestantes = parseInt(limiteMinutos) || 50;
        Workspace.Arena.papelAtual = null;
        Workspace.Arena.cenarioAtual = null;
        
        const modal = document.getElementById('ws-modal-arena');
        if (modal) modal.style.display = 'none';

        Workspace.Arena.injetarPainelBatalha();
        const painel = document.getElementById('ws-painel-batalha');
        painel.style.display = 'flex';
        requestAnimationFrame(() => painel.style.opacity = '1');

        // 🚀 PROTEÇÃO PARA O MODO SOLO: A IA não clica em botões, por isso saltamos o ecrã de escolha!
        if (oponente.includes('Mestre da Guilda')) {
            Workspace.Arena.papelAtual = "Guerreiro Solitário";
            document.getElementById('ws-arena-oponente-nome').innerText = `Contra: ${oponente}`;
            const log = document.getElementById('ws-arena-chat-log');
            log.innerHTML = `
                <div style="text-align: center; color: #cbd5e1; font-size: 14px; margin-bottom: 25px; background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; border: 1px dashed #8b5cf6; animation: popUp 0.5s ease;">
                    <strong style="color: #a855f7; font-size: 16px; display: block; margin-bottom: 5px;">🤖 TREINO SOLO:</strong> 
                    <span style="color:#fff; font-size: 15px;">${cenarioSoloOpcional || 'Conversa Livre com a Inteligência Artificial.'}</span><br><br>
                    <div style="background: #8b5cf6; color: white; display: inline-block; padding: 6px 15px; border-radius: 20px; font-weight: bold; margin-top: 15px; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.4);">O Mestre aguarda a sua voz! Liguem os microfones.</div>
                </div>`;
            Workspace.Arena.tocarSom('inicio');
            Workspace.Arena.iniciarRelogio();
            return; // Sai da função para não carregar a mecânica de escolher papéis
        }

        // 🎭 Se for contra um humano, roda a Magia Determinística do Roleplay!
        const cenarios = [
            { t: "No restaurante, a comida chegou fria e atrasada.", p1: "Cliente Faminto", p2: "Empregado de Mesa" },
            { t: "Entrevista de emprego para uma vaga na área de tecnologia.", p1: "Candidato Nervoso", p2: "Entrevistador Frio" },
            { t: "Devolução de um produto com defeito na loja.", p1: "Cliente Irritado", p2: "Gerente da Loja" },
            { t: "Dois amigos perdidos numa viagem de carro.", p1: "Motorista Teimoso", p2: "Passageiro com o Mapa" },
            { t: "No aeroporto, o voo foi cancelado.", p1: "Passageiro Desesperado", p2: "Agente de Embarque" },
            { t: "Ligação para cancelar a internet de casa.", p1: "Cliente Farto", p2: "Atendente que não quer cancelar" }
        ];
        
        let soma = 0;
        for(let i=0; i < salaId.length; i++) soma += salaId.charCodeAt(i);
        Workspace.Arena.cenarioAtual = cenarios[soma % cenarios.length];

        // Monta a tela de escolhas e garante que os botões estão destrancados
        document.getElementById('ws-arena-cenario-texto').innerText = `"${Workspace.Arena.cenarioAtual.t}"`;
        document.getElementById('ws-btn-papel-1').innerText = `🎭 ${Workspace.Arena.cenarioAtual.p1}`;
        document.getElementById('ws-btn-papel-2').innerText = `🎭 ${Workspace.Arena.cenarioAtual.p2}`;
        document.getElementById('ws-btn-papel-1').disabled = false;
        document.getElementById('ws-btn-papel-2').disabled = false;
        document.getElementById('ws-arena-status-escolha').style.display = 'none';
        
        // Exibe a tela de escolha. O relógio só começa depois de escolher!
        document.getElementById('ws-arena-selecao-personagem').style.display = 'flex';
    },

    // 🚀 Lógica disparada quando o Aluno clica num botão de papel
    escolherPapel: async (numeroPapel) => {
        const cenario = Workspace.Arena.cenarioAtual;
        const meuPapel = numeroPapel === 1 ? cenario.p1 : cenario.p2;
        const papelRestante = numeroPapel === 1 ? cenario.p2 : cenario.p1;

        // Tranca os botões para não clicar duas vezes
        document.getElementById('ws-btn-papel-1').disabled = true;
        document.getElementById('ws-btn-papel-2').disabled = true;
        const status = document.getElementById('ws-arena-status-escolha');
        status.style.display = 'block';

        try {
            const res = await Workspace.api(`/workspace/arena/${Workspace.Arena.salaAtual}/escolher-papel`, 'POST', {
                alunoId: Workspace.usuario.id,
                papelEscolhido: meuPapel,
                papelRestante: papelRestante,
                cenarioTexto: cenario.t
            });

            if (res && res.success) {
                // Se o res.papel for diferente do que ele clicou, é porque o adversário foi milissegundos mais rápido!
                Workspace.Arena.papelAtual = res.papel;
                Workspace.Arena.comecarCombateReal(res.papel);
            }
        } catch(e) {
            status.style.color = '#ef4444'; status.innerText = 'Erro ao conectar. O duelo começará em breve.';
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

    configurarMicrofone: () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        Workspace.Arena.reconhecimentoVoz = new SpeechRecognition();
        Workspace.Arena.reconhecimentoVoz.lang = 'en-US'; 
        Workspace.Arena.reconhecimentoVoz.continuous = false; 
        Workspace.Arena.reconhecimentoVoz.interimResults = false;

        Workspace.Arena.reconhecimentoVoz.onstart = () => {
            const btn = document.getElementById('ws-btn-mic-arena');
            if(btn) { btn.innerHTML = '🔴'; btn.style.background = '#ef4444'; btn.style.animation = 'pulse 1s infinite'; }
        };

       Workspace.Arena.reconhecimentoVoz.onresult = async (event) => {
            let transcricaoBruta = event.results[0][0].transcript;
            const agora = Date.now();
            if (Workspace.Arena.ultimaFala === transcricaoBruta && (agora - Workspace.Arena.ultimoTempoFala) < 2000) {
                return; 
            }
            Workspace.Arena.ultimaFala = transcricaoBruta;
            Workspace.Arena.ultimoTempoFala = agora;
            
            // 🚀 UX PREMIUM: Mostra ao aluno que a IA está a processar a gramática!
            const btn = document.getElementById('ws-btn-mic-arena');
            if(btn) { 
                btn.innerHTML = '⏳'; 
                btn.style.background = '#f59e0b'; 
                btn.style.animation = 'none'; 
            }
            
           try {
                // 1. Chama o nosso novo Revisor Inteligente na Nuvem
                const res = await Workspace.api('/workspace/ingles/transcricao/corrigir', 'POST', { textoCru: transcricaoBruta });
                
                let textoFinal = transcricaoBruta;
                if (res && res.success && res.textoCorrigido) {
                    textoFinal = res.textoCorrigido; // A frase perfeita chega aqui!
                } else {
                    textoFinal = Workspace.Arena.adicionarPontuacaoInteligente(transcricaoBruta);
                }
                
                // 2. Envia a fala polida para o Chat e para o Sistema de Combo
                Workspace.Arena.enviarFala(textoFinal);
                
            } catch (e) {
                const textoFinal = Workspace.Arena.adicionarPontuacaoInteligente(transcricaoBruta);
                Workspace.Arena.enviarFala(textoFinal);
            } finally {
                // 🚀 Retorna o botão ao estado normal SÓ QUANDO a IA terminar o serviço!
                if(btn) { 
                    btn.innerHTML = '🎙️'; 
                    btn.style.background = '#3b82f6'; 
                    btn.style.animation = 'none'; 
                }
            }
        };

        Workspace.Arena.reconhecimentoVoz.onend = () => {
            const btn = document.getElementById('ws-btn-mic-arena');
            // 🚀 Proteção: Só muda para azul se NÃO estiver ocupado com a ampulheta (IA a pensar)
            if(btn && btn.innerHTML !== '⏳') { 
                btn.innerHTML = '🎙️'; 
                btn.style.background = '#3b82f6'; 
                btn.style.animation = 'none'; 
            }
        };
    },

    alternarMicrofone: () => {
        if (!Workspace.Arena.reconhecimentoVoz) {
            if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Navegador não suporta microfone. Use o Chrome.", "error");
            return;
        }
        try { Workspace.Arena.reconhecimentoVoz.start(); } catch (e) { Workspace.Arena.reconhecimentoVoz.stop(); }
    },

    enviarFala: async (texto) => {
        if (!texto || !Workspace.Arena.salaAtual) return;
        
        // 🚀 O MOTOR DO COMBO! (Mede a velocidade da resposta)
        const tempoDecorrido = Date.now() - Workspace.Arena.tempoUltimaRececao;
        
        // Se respondeu em menos de 8 segundos, o Fogo aumenta!
        if (tempoDecorrido < 8000) {
            Workspace.Arena.comboAtual += 1;
        } else {
            // Se demorou muito, quebra o combo!
            Workspace.Arena.comboAtual = 0;
        }

        Workspace.Arena.desenharBalao(Workspace.usuario.nome || Workspace.usuario.login, texto, true, Workspace.Arena.comboAtual);

        try {
            await Workspace.api(`/workspace/arena/${Workspace.Arena.salaAtual}/falar`, 'POST', {
                texto: texto, 
                autorId: Workspace.usuario.id, 
                autorNome: Workspace.usuario.nome || Workspace.usuario.login, 
                escolaId: Workspace.usuario.escolaId,
                combo: Workspace.Arena.comboAtual // 🚀 Envia para a IA ver!
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
            
            <!-- 🚀 NOVO: TELA DE SELEÇÃO DE PERSONAGEM (Cobre o chat inicialmente) -->
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
            
            <div style="padding: 20px; background: #1e293b; border-top: 1px solid #334155; display: flex; justify-content: center; align-items: center; gap: 20px; position: relative;">
                <button id="ws-btn-lifeline" onclick="Workspace.Arena.pedirAjudaMestre()" style="background: rgba(168, 85, 247, 0.15); border: 1px solid #a855f7; color: #d8b4fe; width: 50px; height: 50px; border-radius: 50%; font-size: 22px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center;" title="Lifeline">💡</button>
                <button id="ws-btn-mic-arena" onclick="Workspace.Arena.alternarMicrofone()" style="background: #3b82f6; color: white; border: none; width: 70px; height: 70px; border-radius: 50%; font-size: 28px; cursor: pointer; box-shadow: 0 5px 20px rgba(59, 130, 246, 0.4); transition: 0.2s; display: flex; align-items: center; justify-content: center; z-index: 2;">🎙️</button>
                <div style="width: 50px;"></div>
                <div id="ws-arena-sugestoes-box" style="display: none; position: absolute; bottom: 100px; left: 50%; transform: translateX(-50%); width: 90%; max-width: 400px; background: rgba(15, 23, 42, 0.95); border: 1px solid #a855f7; border-radius: 16px; padding: 20px; box-shadow: 0 15px 40px rgba(0,0,0,0.6); z-index: 100;"></div>
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
            const res = await Workspace.api(`/workspace/arena/${Workspace.Arena.salaAtual}/ajuda`, 'POST', {});

            if (res && res.success && res.sugestoes) {
                Workspace.Arena.tocarSom('mensagem');
                
                let html = `<h4 style="color: #d8b4fe; margin: 0 0 15px 0; text-align: center; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">🪄 Sugestões do Mestre</h4><div style="display: flex; flex-direction: column; gap: 10px;">`;

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
        Workspace.Arena.enviarFala(texto);
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
        }, 1000);
    },

    desenharBalao: (nome, texto, isMinha) => {
        const log = document.getElementById('ws-arena-chat-log');
        const alinhamento = isMinha ? 'flex-end' : 'flex-start';
        const corFundo = isMinha ? '#3b82f6' : '#334155';
        const raio = isMinha ? '16px 16px 4px 16px' : '16px 16px 16px 4px';

        // 🚀 Magia visual: Mistura o nome real com o papel sorteado!
        let nomeDisplay = nome;
        if (Workspace.Arena.cenarioAtual && Workspace.Arena.papelAtual) {
             const oponentePapel = (Workspace.Arena.papelAtual === Workspace.Arena.cenarioAtual.p1) ? Workspace.Arena.cenarioAtual.p2 : Workspace.Arena.cenarioAtual.p1;
             nomeDisplay = isMinha ? `${nome} 🎭 (${Workspace.Arena.papelAtual})` : `${nome} 🎭 (${oponentePapel})`;
        }

        const html = `<div style="display: flex; flex-direction: column; align-items: ${alinhamento}; width: 100%; animation: fadeIn 0.3s ease;"><span style="color: #94a3b8; font-size: 11px; margin-bottom: 4px; font-weight: bold;">${nomeDisplay}</span><div style="background: ${corFundo}; color: #fff; padding: 12px 18px; border-radius: ${raio}; max-width: 80%; font-size: 15px; line-height: 1.5; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">${texto}</div></div>`;
        log.insertAdjacentHTML('beforeend', html);
        log.scrollTop = log.scrollHeight;
    },

    desenharDicaDoMestre: (dica) => {
        const log = document.getElementById('ws-arena-chat-log');
        if (!log) return;
        
        // O texto vem diretamente da IA. Usamos escapeHTML para evitar quebra de código.
        const textoLimpo = window.Workspace && Workspace.escapeHTML ? Workspace.escapeHTML(dica) : dica;

        // O Design Dourado Mágico
        const html = `
            <div style="display: flex; justify-content: center; width: 100%; margin: 15px 0; animation: popUp 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);">
                <div style="background: linear-gradient(135deg, #f59e0b, #ea580c); color: white; padding: 15px 25px; border-radius: 20px; max-width: 85%; box-shadow: 0 10px 25px rgba(245, 158, 11, 0.4); border: 2px solid #fde68a; text-align: center; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -10px; left: -10px; font-size: 50px; opacity: 0.1; transform: rotate(-15deg);">🧙‍♂️</div>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 900; margin-bottom: 6px; color: #fef3c7; position: relative; z-index: 1;">✨ O Mestre da Guilda sussurra:</div>
                    <div style="font-size: 15px; line-height: 1.6; font-weight: 700; position: relative; z-index: 1;">"${textoLimpo}"</div>
                </div>
            </div>
        `;
        
        log.insertAdjacentHTML('beforeend', html);
        log.scrollTop = log.scrollHeight;
        
        // Toca o som de notificação padrão para alertar os alunos
        Workspace.Arena.tocarSom('mensagem');
    },

    // ============================================================================
    // 🌪️ O RENDERIZADOR DO PLOT TWIST
    // ============================================================================
    desenharPlotTwist: (twistTexto) => {
        const log = document.getElementById('ws-arena-chat-log');
        if (!log) return;
        
        // Limpa o texto por segurança
        const textoLimpo = window.Workspace && Workspace.escapeHTML ? Workspace.escapeHTML(twistTexto) : twistTexto;

        // Desenha uma caixa vermelha vibrante e pulsante
        const html = `
            <div style="display: flex; justify-content: center; width: 100%; margin: 20px 0; animation: popUp 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);">
                <div style="background: linear-gradient(135deg, #ef4444, #991b1b); color: white; padding: 20px 25px; border-radius: 20px; max-width: 85%; box-shadow: 0 10px 30px rgba(239, 68, 68, 0.5); border: 2px solid #fca5a5; text-align: center; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -10px; right: -10px; font-size: 60px; opacity: 0.1; transform: rotate(15deg);">🌪️</div>
                    <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; margin-bottom: 8px; color: #fecaca; position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <span style="animation: pulse 1s infinite;">🚨</span> PLOT TWIST <span style="animation: pulse 1s infinite;">🚨</span>
                    </div>
                    <div style="font-size: 16px; line-height: 1.6; font-weight: 700; position: relative; z-index: 1;">"${textoLimpo}"</div>
                </div>
            </div>
        `;
        
        log.insertAdjacentHTML('beforeend', html);
        log.scrollTop = log.scrollHeight;
        
        // Dispara o som de mensagem normal, mas o visual já vai assustar o suficiente!
        Workspace.Arena.tocarSom('mensagem');
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

        // 🚀 O titulo foi ajustado com clamp(20px, 5vw, 32px) para não cortar em telemóveis!
        painel.innerHTML = `
            ${estiloCristais}
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px; text-align: center; background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%); animation: fadeIn 0.8s ease; overflow-y: auto;">
                <h1 style="color: white; margin: 0 0 10px 0; font-size: clamp(20px, 5vw, 32px); line-height: 1.2; background: -webkit-linear-gradient(#fcd34d, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Decisão do Mestre da Guilda (IA)</h1>
                <p style="color: #cbd5e1; font-size: 16px; margin-bottom: 30px; max-width: 600px;">"${resultado.feedbackGeral}"</p>
                <h3 style="color: #f59e0b; margin-bottom: 20px; font-size: 22px;">Destaque do Combate: ${resultado.vencedor}</h3>
                
                <div style="display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; max-width: 900px; width: 100%;">
                    ${htmlJogadores}
                </div>
                
                <!-- 🚀 Os Botões (Partilhar e Voltar) -->
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin-top: 40px; width: 100%;">
                    <button onclick="Workspace.Arena.compartilharEDesafiar('${window.Workspace.escapeHTML ? Workspace.escapeHTML(oponenteNomeParaFeed) : oponenteNomeParaFeed}', '${meuCristalParaFeed}')" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 16px 30px; border-radius: 15px; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.2s; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">📢 Partilhar e Desafiar</button>
                    
                    <button onclick="Workspace.Arena.destruirPainelBatalha()" style="background: #3b82f6; color: white; border: none; padding: 16px 30px; border-radius: 15px; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.2s; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">Recolher Cristais e Voltar</button>
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
        Workspace.Arena.pararSons();

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
    }


};