// js/modulos/workspace/arena.js
window.Workspace = window.Workspace || {};

Workspace.Arena = {
    salaAtual: null,
    oponenteNome: null,
    timerInterval: null,
    minutosRestantes: 50,
    segundosRestantes: 0,
    reconhecimentoVoz: null,

    init: () => {
        console.log("⚔️ Motor da Arena Multiplayer iniciado.");
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
        
        // 🚀 AQUI ESTÃO AS NOVIDADES: Input de Tempo, e Input de Convite com AutoComplete Visual
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
                    <button id="ws-btn-procurar" onclick="Workspace.Arena.procurarAleatorio()" style="background: #3b82f6; color: white; padding: 15px; border-radius: 12px; border: none; font-weight: bold; font-size: 16px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#2563eb'">
                        🎲 Procurar Oponente Aleatório
                    </button>
                    
                    <div style="position: relative; text-align: left;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="text" id="ws-arena-input-convite" placeholder="Nome do Colega..." style="flex: 1; padding: 15px; border-radius: 12px; border: 1px solid #334155; background: #0f172a; color: #fff; outline: none;" oninput="Workspace.Arena.filtrarColegas()">
                            <button onclick="Workspace.Arena.convidarColega()" style="background: #10b981; color: white; padding: 15px 20px; border-radius: 12px; border: none; font-weight: bold; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#059669'">Convidar</button>
                        </div>
                        <!-- Lista de Sugestões de Busca Visual -->
                        <div id="ws-arena-sugestoes" style="display: none; position: absolute; top: 100%; left: 0; width: calc(100% - 100px); max-height: 180px; overflow-y: auto; background: #1e293b; border: 1px solid #334155; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); z-index: 100; margin-top: 5px;"></div>
                    </div>
                </div>
                <div id="ws-arena-status" style="margin-top: 20px; color: #f59e0b; font-weight: bold; font-size: 14px; display: none;">A procurar oponente... ⏳</div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    abrirPainel: () => { document.getElementById('ws-modal-arena').style.display = 'flex'; },

    // 🚀 NOVIDADE 2: Inteligência de Autocomplete com Foto do Perfil
    filtrarColegas: () => {
        const input = document.getElementById('ws-arena-input-convite').value.toLowerCase().trim();
        const lista = document.getElementById('ws-arena-sugestoes');
        lista.innerHTML = '';

        if (!input || input.length < 2) {
            lista.style.display = 'none';
            return;
        }

        // Procura no cache de avatares que a plataforma já possui
        const colegas = Object.keys(Workspace.avatarsCache || {}).filter(nome => nome.toLowerCase().includes(input) && nome !== Workspace.usuario.nome);

        if (colegas.length > 0) {
            colegas.forEach(nome => {
                const avatar = Workspace.avatarsCache[nome] || '';
                const item = document.createElement('div');
                item.style.cssText = 'padding: 10px; display: flex; align-items: center; gap: 10px; cursor: pointer; border-bottom: 1px solid #334155; transition: 0.2s;';
                item.onmouseover = () => item.style.background = '#334155';
                item.onmouseout = () => item.style.background = 'transparent';
                item.onclick = () => {
                    document.getElementById('ws-arena-input-convite').value = nome;
                    lista.style.display = 'none';
                };
                
                // Reaproveita a função do Workspace para desenhar o Avatar redondinho
                const fotoHTML = window.Workspace.renderizarAvatar(nome, 30);
                
                item.innerHTML = `${fotoHTML} <span style="color: #fff; font-size: 14px;">${nome}</span>`;
                lista.appendChild(item);
            });
            lista.style.display = 'block';
        } else {
            lista.style.display = 'none';
        }
    },

    // 🚀 NOVIDADE 1 e 3: Envio e Recepção do Tempo e Redirecionamento Imediato
    procurarAleatorio: async () => {
        const btn = document.getElementById('ws-btn-procurar');
        const status = document.getElementById('ws-arena-status');
        const tempo = document.getElementById('ws-arena-input-tempo').value; // Pega o tempo

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
        } catch (error) { status.style.color = '#ef4444'; status.innerText = 'Erro ao enviar convite.'; }
    },

    escutarEventosTempoReal: () => {
        const evtSource = new EventSource(`/api/workspace/stream?escolaId=${Workspace.usuario.escolaId}`);
        
        evtSource.onmessage = (event) => {
            const dados = JSON.parse(event.data);
            const meuNome = Workspace.usuario.nome || Workspace.usuario.login;
            
            if (dados.destinatarios && dados.destinatarios.includes(meuNome)) {
                if (dados.type === 'ARENA_CONVITE_RECEBIDO') {
                    if (window.Toast) {
                        // 🚀 NOVIDADE 1 e 3: Mostra o tempo e arrasta para a arena automaticamente!
                        Toast.showInterativo({
                            remetenteNome: dados.remetenteNome,
                            subtitulo: "⚔️ Desafio para a Arena",
                            mensagemCorpo: `<strong>${dados.remetenteNome}</strong> desafiou-te para uma prática de inglês de <strong>${dados.limiteMinutos} minutos</strong>!`
                        }, 'arena', async () => {
                            // Ao aceitar o convite, avisa o servidor para puxar os dois!
                            await Workspace.api(`/workspace/arena/${dados.salaId}/aceitar`, 'POST', {
                                alunoId: Workspace.usuario.id, alunoNome: meuNome, escolaId: Workspace.usuario.escolaId
                            });
                        });
                    }
                }
                
                // O servidor emite isto para AMBOS quando um encontro é fechado ou um convite é aceite
                if (dados.type === 'ARENA_MATCH_ENCONTRADO') {
                    const oponenteReal = dados.destinatarios.find(nome => nome !== meuNome);
                    Workspace.Arena.iniciarPartida(dados.salaId, oponenteReal, dados.limiteMinutos); // Passa o tempo!
                }
            }

            if (dados.type === 'ARENA_NOVA_FALA' && Workspace.Arena.salaAtual === dados.salaId) {
                if (dados.fala.autorNome !== meuNome) {
                    Workspace.Arena.desenharBalao(dados.fala.autorNome, dados.fala.texto, false);
                }
            }

            if (dados.type === 'ARENA_RESULTADO_FINAL' && Workspace.Arena.salaAtual === dados.salaId) {
                Workspace.Arena.exibirPainelResultadoFinal(dados.resultado);
            }
        };
    },

    iniciarPartida: (salaId, oponente, limiteMinutos) => {
        Workspace.Arena.salaAtual = salaId;
        Workspace.Arena.oponenteNome = oponente;
        Workspace.Arena.minutosRestantes = parseInt(limiteMinutos) || 50; // 🚀 Define o tempo combinado!
        
        const modal = document.getElementById('ws-modal-arena');
        if (modal) modal.style.display = 'none';

        Workspace.Arena.injetarPainelBatalha();
        const painel = document.getElementById('ws-painel-batalha');
        
        document.getElementById('ws-arena-oponente-nome').innerText = `Contra: ${oponente}`;
        document.getElementById('ws-arena-chat-log').innerHTML = '<div style="text-align: center; color: #64748b; font-size: 13px; margin-bottom: 20px;">A partida começou! Liguem os microfones e conversem em Inglês.</div>';
        
        painel.style.display = 'flex';
        requestAnimationFrame(() => painel.style.opacity = '1');

        Workspace.Arena.iniciarRelogio();
    },

    // 🚀 NOVIDADE 4: Inteligência de Captação e Pontuação da Voz
    adicionarPontuacaoInteligente: (texto) => {
        let txt = texto.trim();
        if (!txt) return "";
        
        // Coloca a primeira letra em Maiúscula
        txt = txt.charAt(0).toUpperCase() + txt.slice(1);
        
        // Se a própria API nativa já colocou pontuação, não interferimos
        if (txt.match(/[.?!]$/)) return txt;

        // Análise Heurística Simples para Perguntas em Inglês
        const palavrasInterrogativas = ['what', 'where', 'when', 'who', 'why', 'how', 'do', 'does', 'did', 'is', 'are', 'can', 'could', 'would', 'should', 'will', 'have', 'has'];
        const primeiraPalavra = txt.split(' ')[0].toLowerCase();

        if (palavrasInterrogativas.includes(primeiraPalavra)) {
            return txt + "?";
        } else {
            return txt + ".";
        }
    },

    configurarMicrofone: () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        Workspace.Arena.reconhecimentoVoz = new SpeechRecognition();
        Workspace.Arena.reconhecimentoVoz.lang = 'en-US'; 
        Workspace.Arena.reconhecimentoVoz.continuous = false; // Permite pausas naturais
        Workspace.Arena.reconhecimentoVoz.interimResults = false;

        Workspace.Arena.reconhecimentoVoz.onstart = () => {
            const btn = document.getElementById('ws-btn-mic-arena');
            if(btn) { btn.innerHTML = '🔴'; btn.style.background = '#ef4444'; btn.style.animation = 'pulse 1s infinite'; }
        };

        Workspace.Arena.reconhecimentoVoz.onresult = (event) => {
            let transcricaoBruta = event.results[0][0].transcript;
            
            // 🚀 Passa o texto bruto pelo nosso "Cérebro Linguístico" para adicionar pontuação
            const transcricaoInteligente = Workspace.Arena.adicionarPontuacaoInteligente(transcricaoBruta);
            
            Workspace.Arena.enviarFala(transcricaoInteligente);
        };

        Workspace.Arena.reconhecimentoVoz.onend = () => {
            const btn = document.getElementById('ws-btn-mic-arena');
            if(btn) { btn.innerHTML = '🎙️'; btn.style.background = '#3b82f6'; btn.style.animation = 'none'; }
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
        Workspace.Arena.desenharBalao(Workspace.usuario.nome || Workspace.usuario.login, texto, true);

        try {
            await Workspace.api(`/workspace/arena/${Workspace.Arena.salaAtual}/falar`, 'POST', {
                texto: texto, autorId: Workspace.usuario.id, autorNome: Workspace.usuario.nome || Workspace.usuario.login, escolaId: Workspace.usuario.escolaId
            });
        } catch (error) { if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Erro ao transmitir fala.", "error"); }
    },

    // (As funções injetarPainelBatalha, iniciarRelogio, desenharBalao, abandonarPartida, encerrarPartidaViaTempo, exibirPainelResultadoFinal e destruirPainelBatalha continuam exatamente iguais à sua versão atual)
    
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
            <div id="ws-arena-chat-log" style="flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px;"></div>
            <div style="padding: 20px; background: #1e293b; border-top: 1px solid #334155; display: flex; justify-content: center;">
                <button id="ws-btn-mic-arena" onclick="Workspace.Arena.alternarMicrofone()" style="background: #3b82f6; color: white; border: none; width: 70px; height: 70px; border-radius: 50%; font-size: 28px; cursor: pointer; box-shadow: 0 5px 20px rgba(59, 130, 246, 0.4); transition: 0.2s; display: flex; align-items: center; justify-content: center;">🎙️</button>
            </div>
        `;
        document.body.appendChild(painel);
    },

    iniciarRelogio: () => {
        Workspace.Arena.segundosRestantes = 0;
        clearInterval(Workspace.Arena.timerInterval);

        Workspace.Arena.timerInterval = setInterval(() => {
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
            document.getElementById('ws-arena-timer').innerText = `${m}:${s}`;
        }, 1000);
    },

    desenharBalao: (nome, texto, isMinha) => {
        const log = document.getElementById('ws-arena-chat-log');
        const alinhamento = isMinha ? 'flex-end' : 'flex-start';
        const corFundo = isMinha ? '#3b82f6' : '#334155';
        const raio = isMinha ? '16px 16px 4px 16px' : '16px 16px 16px 4px';

        const html = `<div style="display: flex; flex-direction: column; align-items: ${alinhamento}; width: 100%; animation: fadeIn 0.3s ease;"><span style="color: #94a3b8; font-size: 11px; margin-bottom: 4px; font-weight: bold;">${nome}</span><div style="background: ${corFundo}; color: #fff; padding: 12px 18px; border-radius: ${raio}; max-width: 80%; font-size: 15px; line-height: 1.5; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">${texto}</div></div>`;
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
                <p style="color: #94a3b8; font-size: 14px; margin-bottom: 25px; line-height: 1.5;">Se sair agora, perderá a oportunidade de conquistar <strong>Medalhas de Fluência</strong>.</p>
                <div style="display: flex; gap: 10px;">
                    <button id="btn-arena-ficar" style="flex: 1; background: #3b82f6; color: white; border: none; padding: 12px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s;">Ficar e Lutar</button>
                    <button id="btn-arena-sair" style="flex: 1; background: transparent; border: 1px solid #ef4444; color: #ef4444; padding: 12px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s;">Sim, Sair</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('btn-arena-ficar').onclick = () => modal.remove();
        document.getElementById('btn-arena-sair').onclick = () => { modal.remove(); Workspace.Arena.destruirPainelBatalha(); };
    },

    encerrarPartidaViaTempo: async () => {
        const log = document.getElementById('ws-arena-chat-log');
        log.insertAdjacentHTML('beforeend', '<div style="text-align: center; color: #f59e0b; font-size: 15px; margin-top: 30px; font-weight: bold; animation: pulse 1.5s infinite;">⏰ O tempo esgotou-se! A IA Groq está a analisar a vossa gramática... Aguarde!</div>');
        log.scrollTop = log.scrollHeight;
        if (Workspace.Arena.reconhecimentoVoz) { try { Workspace.Arena.reconhecimentoVoz.stop(); } catch(e){} }
        
        try { await Workspace.api(`/workspace/arena/${Workspace.Arena.salaAtual}/avaliar`, 'POST', { escolaId: Workspace.usuario.escolaId }); } 
        catch (error) { if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Ocorreu um atraso na avaliação.", "warning"); }
    },

    exibirPainelResultadoFinal: (resultado) => {
        const painel = document.getElementById('ws-painel-batalha');
        if (!painel) return;

        painel.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px; text-align: center; background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%); animation: fadeIn 0.8s ease; overflow-y: auto;">
                <div style="font-size: 80px; margin-bottom: 10px;">🏅</div>
                <h1 style="color: white; margin: 0 0 10px 0; font-size: 32px;">Avaliação Concluída!</h1>
                <p style="color: #94a3b8; font-size: 16px; margin-bottom: 30px; max-width: 500px;">"${resultado.feedbackGeral}"</p>
                
                <div style="background: rgba(255,255,255,0.05); border: 1px solid #334155; padding: 30px; border-radius: 20px; max-width: 600px; width: 100%; backdrop-filter: blur(10px); box-shadow: 0 25px 50px rgba(0,0,0,0.3);">
                    <h2 style="color: #cbd5e1; margin: 0 0 15px 0; font-size: 20px;">Vencedor do Duelo</h2>
                    <h1 style="color: #f59e0b; margin: 0 0 10px 0; font-size: 28px;">${resultado.vencedor}</h1>
                    <div style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 8px 25px; border-radius: 30px; font-weight: 800; font-size: 16px; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4); text-transform: uppercase;">Medalha de ${resultado.medalha}</div>
                    
                    <div style="text-align: left; background: rgba(0,0,0,0.4); padding: 20px; border-radius: 12px; border: 1px solid #1e293b;">
                        <h4 style="color: #38bdf8; margin: 0 0 15px 0; font-size: 14px;">Feedback Gramatical:</h4>
                        ${resultado.correcoes && resultado.correcoes.length > 0 ? resultado.correcoes.map(c => `
                            <div style="margin-bottom: 12px; border-left: 2px solid #3b82f6; padding-left: 10px;">
                                <strong style="color: #fff; font-size: 15px;">${c.nome}:</strong> 
                                <div style="color: #94a3b8; font-size: 14px; margin-top: 4px;">${c.feedback}</div>
                            </div>
                        `).join('') : '<span style="color: #94a3b8;">Excelente jogo, sem correções!</span>'}
                    </div>
                </div>
                <button onclick="Workspace.Arena.destruirPainelBatalha()" style="margin-top: 40px; background: #3b82f6; color: white; border: none; padding: 16px 40px; border-radius: 15px; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.2s;">Concluir e Voltar</button>
            </div>
        `;
        if (Workspace.Feed && Workspace.Feed.dispararConfetes) Workspace.Feed.dispararConfetes();
    },

    destruirPainelBatalha: () => {
        const painel = document.getElementById('ws-painel-batalha');
        if (painel) {
            painel.style.opacity = '0';
            setTimeout(() => { painel.style.display = 'none'; painel.remove(); clearInterval(Workspace.Arena.timerInterval); Workspace.Arena.salaAtual = null; }, 300);
        }
    }
};// js/modulos/workspace/arena.js
window.Workspace = window.Workspace || {};

Workspace.Arena = {
    salaAtual: null,
    oponenteNome: null,
    timerInterval: null,
    minutosRestantes: 50,
    segundosRestantes: 0,
    reconhecimentoVoz: null,

    init: () => {
        console.log("⚔️ Motor da Arena Multiplayer iniciado.");
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
        
        // 🚀 AQUI ESTÃO AS NOVIDADES: Input de Tempo, e Input de Convite com AutoComplete Visual
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
                    <button id="ws-btn-procurar" onclick="Workspace.Arena.procurarAleatorio()" style="background: #3b82f6; color: white; padding: 15px; border-radius: 12px; border: none; font-weight: bold; font-size: 16px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#2563eb'">
                        🎲 Procurar Oponente Aleatório
                    </button>
                    
                    <div style="position: relative; text-align: left;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="text" id="ws-arena-input-convite" placeholder="Nome do Colega..." style="flex: 1; padding: 15px; border-radius: 12px; border: 1px solid #334155; background: #0f172a; color: #fff; outline: none;" oninput="Workspace.Arena.filtrarColegas()">
                            <button onclick="Workspace.Arena.convidarColega()" style="background: #10b981; color: white; padding: 15px 20px; border-radius: 12px; border: none; font-weight: bold; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#059669'">Convidar</button>
                        </div>
                        <!-- Lista de Sugestões de Busca Visual -->
                        <div id="ws-arena-sugestoes" style="display: none; position: absolute; top: 100%; left: 0; width: calc(100% - 100px); max-height: 180px; overflow-y: auto; background: #1e293b; border: 1px solid #334155; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); z-index: 100; margin-top: 5px;"></div>
                    </div>
                </div>
                <div id="ws-arena-status" style="margin-top: 20px; color: #f59e0b; font-weight: bold; font-size: 14px; display: none;">A procurar oponente... ⏳</div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    abrirPainel: () => { document.getElementById('ws-modal-arena').style.display = 'flex'; },

    // 🚀 NOVIDADE 2: Inteligência de Autocomplete com Foto do Perfil
    filtrarColegas: () => {
        const input = document.getElementById('ws-arena-input-convite').value.toLowerCase().trim();
        const lista = document.getElementById('ws-arena-sugestoes');
        lista.innerHTML = '';

        if (!input || input.length < 2) {
            lista.style.display = 'none';
            return;
        }

        // Procura no cache de avatares que a plataforma já possui
        const colegas = Object.keys(Workspace.avatarsCache || {}).filter(nome => nome.toLowerCase().includes(input) && nome !== Workspace.usuario.nome);

        if (colegas.length > 0) {
            colegas.forEach(nome => {
                const avatar = Workspace.avatarsCache[nome] || '';
                const item = document.createElement('div');
                item.style.cssText = 'padding: 10px; display: flex; align-items: center; gap: 10px; cursor: pointer; border-bottom: 1px solid #334155; transition: 0.2s;';
                item.onmouseover = () => item.style.background = '#334155';
                item.onmouseout = () => item.style.background = 'transparent';
                item.onclick = () => {
                    document.getElementById('ws-arena-input-convite').value = nome;
                    lista.style.display = 'none';
                };
                
                // Reaproveita a função do Workspace para desenhar o Avatar redondinho
                const fotoHTML = window.Workspace.renderizarAvatar(nome, 30);
                
                item.innerHTML = `${fotoHTML} <span style="color: #fff; font-size: 14px;">${nome}</span>`;
                lista.appendChild(item);
            });
            lista.style.display = 'block';
        } else {
            lista.style.display = 'none';
        }
    },

    // 🚀 NOVIDADE 1 e 3: Envio e Recepção do Tempo e Redirecionamento Imediato
    procurarAleatorio: async () => {
        const btn = document.getElementById('ws-btn-procurar');
        const status = document.getElementById('ws-arena-status');
        const tempo = document.getElementById('ws-arena-input-tempo').value; // Pega o tempo

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
        } catch (error) { status.style.color = '#ef4444'; status.innerText = 'Erro ao enviar convite.'; }
    },

    escutarEventosTempoReal: () => {
        const evtSource = new EventSource(`/api/workspace/stream?escolaId=${Workspace.usuario.escolaId}`);
        
        evtSource.onmessage = (event) => {
            const dados = JSON.parse(event.data);
            const meuNome = Workspace.usuario.nome || Workspace.usuario.login;
            
            if (dados.destinatarios && dados.destinatarios.includes(meuNome)) {
                if (dados.type === 'ARENA_CONVITE_RECEBIDO') {
                    if (window.Toast) {
                        // 🚀 NOVIDADE 1 e 3: Mostra o tempo e arrasta para a arena automaticamente!
                        Toast.showInterativo({
                            remetenteNome: dados.remetenteNome,
                            subtitulo: "⚔️ Desafio para a Arena",
                            mensagemCorpo: `<strong>${dados.remetenteNome}</strong> desafiou-te para uma prática de inglês de <strong>${dados.limiteMinutos} minutos</strong>!`
                        }, 'arena', async () => {
                            // Ao aceitar o convite, avisa o servidor para puxar os dois!
                            await Workspace.api(`/workspace/arena/${dados.salaId}/aceitar`, 'POST', {
                                alunoId: Workspace.usuario.id, alunoNome: meuNome, escolaId: Workspace.usuario.escolaId
                            });
                        });
                    }
                }
                
                // O servidor emite isto para AMBOS quando um encontro é fechado ou um convite é aceite
                if (dados.type === 'ARENA_MATCH_ENCONTRADO') {
                    const oponenteReal = dados.destinatarios.find(nome => nome !== meuNome);
                    Workspace.Arena.iniciarPartida(dados.salaId, oponenteReal, dados.limiteMinutos); // Passa o tempo!
                }
            }

            if (dados.type === 'ARENA_NOVA_FALA' && Workspace.Arena.salaAtual === dados.salaId) {
                if (dados.fala.autorNome !== meuNome) {
                    Workspace.Arena.desenharBalao(dados.fala.autorNome, dados.fala.texto, false);
                }
            }

            if (dados.type === 'ARENA_RESULTADO_FINAL' && Workspace.Arena.salaAtual === dados.salaId) {
                Workspace.Arena.exibirPainelResultadoFinal(dados.resultado);
            }
        };
    },

    iniciarPartida: (salaId, oponente, limiteMinutos) => {
        Workspace.Arena.salaAtual = salaId;
        Workspace.Arena.oponenteNome = oponente;
        Workspace.Arena.minutosRestantes = parseInt(limiteMinutos) || 50; // 🚀 Define o tempo combinado!
        
        const modal = document.getElementById('ws-modal-arena');
        if (modal) modal.style.display = 'none';

        Workspace.Arena.injetarPainelBatalha();
        const painel = document.getElementById('ws-painel-batalha');
        
        document.getElementById('ws-arena-oponente-nome').innerText = `Contra: ${oponente}`;
        document.getElementById('ws-arena-chat-log').innerHTML = '<div style="text-align: center; color: #64748b; font-size: 13px; margin-bottom: 20px;">A partida começou! Liguem os microfones e conversem em Inglês.</div>';
        
        painel.style.display = 'flex';
        requestAnimationFrame(() => painel.style.opacity = '1');

        Workspace.Arena.iniciarRelogio();
    },

    // 🚀 NOVIDADE 4: Inteligência de Captação e Pontuação da Voz
    adicionarPontuacaoInteligente: (texto) => {
        let txt = texto.trim();
        if (!txt) return "";
        
        // Coloca a primeira letra em Maiúscula
        txt = txt.charAt(0).toUpperCase() + txt.slice(1);
        
        // Se a própria API nativa já colocou pontuação, não interferimos
        if (txt.match(/[.?!]$/)) return txt;

        // Análise Heurística Simples para Perguntas em Inglês
        const palavrasInterrogativas = ['what', 'where', 'when', 'who', 'why', 'how', 'do', 'does', 'did', 'is', 'are', 'can', 'could', 'would', 'should', 'will', 'have', 'has'];
        const primeiraPalavra = txt.split(' ')[0].toLowerCase();

        if (palavrasInterrogativas.includes(primeiraPalavra)) {
            return txt + "?";
        } else {
            return txt + ".";
        }
    },

    configurarMicrofone: () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        Workspace.Arena.reconhecimentoVoz = new SpeechRecognition();
        Workspace.Arena.reconhecimentoVoz.lang = 'en-US'; 
        Workspace.Arena.reconhecimentoVoz.continuous = false; // Permite pausas naturais
        Workspace.Arena.reconhecimentoVoz.interimResults = false;

        Workspace.Arena.reconhecimentoVoz.onstart = () => {
            const btn = document.getElementById('ws-btn-mic-arena');
            if(btn) { btn.innerHTML = '🔴'; btn.style.background = '#ef4444'; btn.style.animation = 'pulse 1s infinite'; }
        };

        Workspace.Arena.reconhecimentoVoz.onresult = (event) => {
            let transcricaoBruta = event.results[0][0].transcript;
            
            // 🚀 Passa o texto bruto pelo nosso "Cérebro Linguístico" para adicionar pontuação
            const transcricaoInteligente = Workspace.Arena.adicionarPontuacaoInteligente(transcricaoBruta);
            
            Workspace.Arena.enviarFala(transcricaoInteligente);
        };

        Workspace.Arena.reconhecimentoVoz.onend = () => {
            const btn = document.getElementById('ws-btn-mic-arena');
            if(btn) { btn.innerHTML = '🎙️'; btn.style.background = '#3b82f6'; btn.style.animation = 'none'; }
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
        Workspace.Arena.desenharBalao(Workspace.usuario.nome || Workspace.usuario.login, texto, true);

        try {
            await Workspace.api(`/workspace/arena/${Workspace.Arena.salaAtual}/falar`, 'POST', {
                texto: texto, autorId: Workspace.usuario.id, autorNome: Workspace.usuario.nome || Workspace.usuario.login, escolaId: Workspace.usuario.escolaId
            });
        } catch (error) { if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Erro ao transmitir fala.", "error"); }
    },

    // (As funções injetarPainelBatalha, iniciarRelogio, desenharBalao, abandonarPartida, encerrarPartidaViaTempo, exibirPainelResultadoFinal e destruirPainelBatalha continuam exatamente iguais à sua versão atual)
    
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
            <div id="ws-arena-chat-log" style="flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px;"></div>
            <div style="padding: 20px; background: #1e293b; border-top: 1px solid #334155; display: flex; justify-content: center;">
                <button id="ws-btn-mic-arena" onclick="Workspace.Arena.alternarMicrofone()" style="background: #3b82f6; color: white; border: none; width: 70px; height: 70px; border-radius: 50%; font-size: 28px; cursor: pointer; box-shadow: 0 5px 20px rgba(59, 130, 246, 0.4); transition: 0.2s; display: flex; align-items: center; justify-content: center;">🎙️</button>
            </div>
        `;
        document.body.appendChild(painel);
    },

    iniciarRelogio: () => {
        Workspace.Arena.segundosRestantes = 0;
        clearInterval(Workspace.Arena.timerInterval);

        Workspace.Arena.timerInterval = setInterval(() => {
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
            document.getElementById('ws-arena-timer').innerText = `${m}:${s}`;
        }, 1000);
    },

    desenharBalao: (nome, texto, isMinha) => {
        const log = document.getElementById('ws-arena-chat-log');
        const alinhamento = isMinha ? 'flex-end' : 'flex-start';
        const corFundo = isMinha ? '#3b82f6' : '#334155';
        const raio = isMinha ? '16px 16px 4px 16px' : '16px 16px 16px 4px';

        const html = `<div style="display: flex; flex-direction: column; align-items: ${alinhamento}; width: 100%; animation: fadeIn 0.3s ease;"><span style="color: #94a3b8; font-size: 11px; margin-bottom: 4px; font-weight: bold;">${nome}</span><div style="background: ${corFundo}; color: #fff; padding: 12px 18px; border-radius: ${raio}; max-width: 80%; font-size: 15px; line-height: 1.5; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">${texto}</div></div>`;
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
                <p style="color: #94a3b8; font-size: 14px; margin-bottom: 25px; line-height: 1.5;">Se sair agora, perderá a oportunidade de conquistar <strong>Medalhas de Fluência</strong>.</p>
                <div style="display: flex; gap: 10px;">
                    <button id="btn-arena-ficar" style="flex: 1; background: #3b82f6; color: white; border: none; padding: 12px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s;">Ficar e Lutar</button>
                    <button id="btn-arena-sair" style="flex: 1; background: transparent; border: 1px solid #ef4444; color: #ef4444; padding: 12px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s;">Sim, Sair</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('btn-arena-ficar').onclick = () => modal.remove();
        document.getElementById('btn-arena-sair').onclick = () => { modal.remove(); Workspace.Arena.destruirPainelBatalha(); };
    },

    encerrarPartidaViaTempo: async () => {
        const log = document.getElementById('ws-arena-chat-log');
        log.insertAdjacentHTML('beforeend', '<div style="text-align: center; color: #f59e0b; font-size: 15px; margin-top: 30px; font-weight: bold; animation: pulse 1.5s infinite;">⏰ O tempo esgotou-se! A IA Groq está a analisar a vossa gramática... Aguarde!</div>');
        log.scrollTop = log.scrollHeight;
        if (Workspace.Arena.reconhecimentoVoz) { try { Workspace.Arena.reconhecimentoVoz.stop(); } catch(e){} }
        
        try { await Workspace.api(`/workspace/arena/${Workspace.Arena.salaAtual}/avaliar`, 'POST', { escolaId: Workspace.usuario.escolaId }); } 
        catch (error) { if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Ocorreu um atraso na avaliação.", "warning"); }
    },

    exibirPainelResultadoFinal: (resultado) => {
        const painel = document.getElementById('ws-painel-batalha');
        if (!painel) return;

        painel.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px; text-align: center; background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%); animation: fadeIn 0.8s ease; overflow-y: auto;">
                <div style="font-size: 80px; margin-bottom: 10px;">🏅</div>
                <h1 style="color: white; margin: 0 0 10px 0; font-size: 32px;">Avaliação Concluída!</h1>
                <p style="color: #94a3b8; font-size: 16px; margin-bottom: 30px; max-width: 500px;">"${resultado.feedbackGeral}"</p>
                
                <div style="background: rgba(255,255,255,0.05); border: 1px solid #334155; padding: 30px; border-radius: 20px; max-width: 600px; width: 100%; backdrop-filter: blur(10px); box-shadow: 0 25px 50px rgba(0,0,0,0.3);">
                    <h2 style="color: #cbd5e1; margin: 0 0 15px 0; font-size: 20px;">Vencedor do Duelo</h2>
                    <h1 style="color: #f59e0b; margin: 0 0 10px 0; font-size: 28px;">${resultado.vencedor}</h1>
                    <div style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 8px 25px; border-radius: 30px; font-weight: 800; font-size: 16px; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4); text-transform: uppercase;">Medalha de ${resultado.medalha}</div>
                    
                    <div style="text-align: left; background: rgba(0,0,0,0.4); padding: 20px; border-radius: 12px; border: 1px solid #1e293b;">
                        <h4 style="color: #38bdf8; margin: 0 0 15px 0; font-size: 14px;">Feedback Gramatical:</h4>
                        ${resultado.correcoes && resultado.correcoes.length > 0 ? resultado.correcoes.map(c => `
                            <div style="margin-bottom: 12px; border-left: 2px solid #3b82f6; padding-left: 10px;">
                                <strong style="color: #fff; font-size: 15px;">${c.nome}:</strong> 
                                <div style="color: #94a3b8; font-size: 14px; margin-top: 4px;">${c.feedback}</div>
                            </div>
                        `).join('') : '<span style="color: #94a3b8;">Excelente jogo, sem correções!</span>'}
                    </div>
                </div>
                <button onclick="Workspace.Arena.destruirPainelBatalha()" style="margin-top: 40px; background: #3b82f6; color: white; border: none; padding: 16px 40px; border-radius: 15px; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.2s;">Concluir e Voltar</button>
            </div>
        `;
        if (Workspace.Feed && Workspace.Feed.dispararConfetes) Workspace.Feed.dispararConfetes();
    },

    destruirPainelBatalha: () => {
        const painel = document.getElementById('ws-painel-batalha');
        if (painel) {
            painel.style.opacity = '0';
            setTimeout(() => { painel.style.display = 'none'; painel.remove(); clearInterval(Workspace.Arena.timerInterval); Workspace.Arena.salaAtual = null; }, 300);
        }
    }
};// js/modulos/workspace/arena.js
window.Workspace = window.Workspace || {};

Workspace.Arena = {
    salaAtual: null,
    oponenteNome: null,
    timerInterval: null,
    minutosRestantes: 50,
    segundosRestantes: 0,
    reconhecimentoVoz: null,

    init: () => {
        console.log("⚔️ Motor da Arena Multiplayer iniciado.");
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
        
        // 🚀 AQUI ESTÃO AS NOVIDADES: Input de Tempo, e Input de Convite com AutoComplete Visual
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
                    <button id="ws-btn-procurar" onclick="Workspace.Arena.procurarAleatorio()" style="background: #3b82f6; color: white; padding: 15px; border-radius: 12px; border: none; font-weight: bold; font-size: 16px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#2563eb'">
                        🎲 Procurar Oponente Aleatório
                    </button>
                    
                    <div style="position: relative; text-align: left;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="text" id="ws-arena-input-convite" placeholder="Nome do Colega..." style="flex: 1; padding: 15px; border-radius: 12px; border: 1px solid #334155; background: #0f172a; color: #fff; outline: none;" oninput="Workspace.Arena.filtrarColegas()">
                            <button onclick="Workspace.Arena.convidarColega()" style="background: #10b981; color: white; padding: 15px 20px; border-radius: 12px; border: none; font-weight: bold; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#059669'">Convidar</button>
                        </div>
                        <!-- Lista de Sugestões de Busca Visual -->
                        <div id="ws-arena-sugestoes" style="display: none; position: absolute; top: 100%; left: 0; width: calc(100% - 100px); max-height: 180px; overflow-y: auto; background: #1e293b; border: 1px solid #334155; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); z-index: 100; margin-top: 5px;"></div>
                    </div>
                </div>
                <div id="ws-arena-status" style="margin-top: 20px; color: #f59e0b; font-weight: bold; font-size: 14px; display: none;">A procurar oponente... ⏳</div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    abrirPainel: () => { document.getElementById('ws-modal-arena').style.display = 'flex'; },

    // 🚀 NOVIDADE 2: Inteligência de Autocomplete com Foto do Perfil
    filtrarColegas: () => {
        const input = document.getElementById('ws-arena-input-convite').value.toLowerCase().trim();
        const lista = document.getElementById('ws-arena-sugestoes');
        lista.innerHTML = '';

        if (!input || input.length < 2) {
            lista.style.display = 'none';
            return;
        }

        // Procura no cache de avatares que a plataforma já possui
        const colegas = Object.keys(Workspace.avatarsCache || {}).filter(nome => nome.toLowerCase().includes(input) && nome !== Workspace.usuario.nome);

        if (colegas.length > 0) {
            colegas.forEach(nome => {
                const avatar = Workspace.avatarsCache[nome] || '';
                const item = document.createElement('div');
                item.style.cssText = 'padding: 10px; display: flex; align-items: center; gap: 10px; cursor: pointer; border-bottom: 1px solid #334155; transition: 0.2s;';
                item.onmouseover = () => item.style.background = '#334155';
                item.onmouseout = () => item.style.background = 'transparent';
                item.onclick = () => {
                    document.getElementById('ws-arena-input-convite').value = nome;
                    lista.style.display = 'none';
                };
                
                // Reaproveita a função do Workspace para desenhar o Avatar redondinho
                const fotoHTML = window.Workspace.renderizarAvatar(nome, 30);
                
                item.innerHTML = `${fotoHTML} <span style="color: #fff; font-size: 14px;">${nome}</span>`;
                lista.appendChild(item);
            });
            lista.style.display = 'block';
        } else {
            lista.style.display = 'none';
        }
    },

    // 🚀 NOVIDADE 1 e 3: Envio e Recepção do Tempo e Redirecionamento Imediato
    procurarAleatorio: async () => {
        const btn = document.getElementById('ws-btn-procurar');
        const status = document.getElementById('ws-arena-status');
        const tempo = document.getElementById('ws-arena-input-tempo').value; // Pega o tempo

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
        } catch (error) { status.style.color = '#ef4444'; status.innerText = 'Erro ao enviar convite.'; }
    },

    escutarEventosTempoReal: () => {
        const evtSource = new EventSource(`/api/workspace/stream?escolaId=${Workspace.usuario.escolaId}`);
        
        evtSource.onmessage = (event) => {
            const dados = JSON.parse(event.data);
            const meuNome = Workspace.usuario.nome || Workspace.usuario.login;
            
            if (dados.destinatarios && dados.destinatarios.includes(meuNome)) {
                if (dados.type === 'ARENA_CONVITE_RECEBIDO') {
                    if (window.Toast) {
                        // 🚀 NOVIDADE 1 e 3: Mostra o tempo e arrasta para a arena automaticamente!
                        Toast.showInterativo({
                            remetenteNome: dados.remetenteNome,
                            subtitulo: "⚔️ Desafio para a Arena",
                            mensagemCorpo: `<strong>${dados.remetenteNome}</strong> desafiou-te para uma prática de inglês de <strong>${dados.limiteMinutos} minutos</strong>!`
                        }, 'arena', async () => {
                            // Ao aceitar o convite, avisa o servidor para puxar os dois!
                            await Workspace.api(`/workspace/arena/${dados.salaId}/aceitar`, 'POST', {
                                alunoId: Workspace.usuario.id, alunoNome: meuNome, escolaId: Workspace.usuario.escolaId
                            });
                        });
                    }
                }
                
                // O servidor emite isto para AMBOS quando um encontro é fechado ou um convite é aceite
                if (dados.type === 'ARENA_MATCH_ENCONTRADO') {
                    const oponenteReal = dados.destinatarios.find(nome => nome !== meuNome);
                    Workspace.Arena.iniciarPartida(dados.salaId, oponenteReal, dados.limiteMinutos); // Passa o tempo!
                }
            }

            if (dados.type === 'ARENA_NOVA_FALA' && Workspace.Arena.salaAtual === dados.salaId) {
                if (dados.fala.autorNome !== meuNome) {
                    Workspace.Arena.desenharBalao(dados.fala.autorNome, dados.fala.texto, false);
                }
            }

            if (dados.type === 'ARENA_RESULTADO_FINAL' && Workspace.Arena.salaAtual === dados.salaId) {
                Workspace.Arena.exibirPainelResultadoFinal(dados.resultado);
            }
        };
    },

    iniciarPartida: (salaId, oponente, limiteMinutos) => {
        Workspace.Arena.salaAtual = salaId;
        Workspace.Arena.oponenteNome = oponente;
        Workspace.Arena.minutosRestantes = parseInt(limiteMinutos) || 50; // 🚀 Define o tempo combinado!
        
        const modal = document.getElementById('ws-modal-arena');
        if (modal) modal.style.display = 'none';

        Workspace.Arena.injetarPainelBatalha();
        const painel = document.getElementById('ws-painel-batalha');
        
        document.getElementById('ws-arena-oponente-nome').innerText = `Contra: ${oponente}`;
        document.getElementById('ws-arena-chat-log').innerHTML = '<div style="text-align: center; color: #64748b; font-size: 13px; margin-bottom: 20px;">A partida começou! Liguem os microfones e conversem em Inglês.</div>';
        
        painel.style.display = 'flex';
        requestAnimationFrame(() => painel.style.opacity = '1');

        Workspace.Arena.iniciarRelogio();
    },

    // 🚀 NOVIDADE 4: Inteligência de Captação e Pontuação da Voz
    adicionarPontuacaoInteligente: (texto) => {
        let txt = texto.trim();
        if (!txt) return "";
        
        // Coloca a primeira letra em Maiúscula
        txt = txt.charAt(0).toUpperCase() + txt.slice(1);
        
        // Se a própria API nativa já colocou pontuação, não interferimos
        if (txt.match(/[.?!]$/)) return txt;

        // Análise Heurística Simples para Perguntas em Inglês
        const palavrasInterrogativas = ['what', 'where', 'when', 'who', 'why', 'how', 'do', 'does', 'did', 'is', 'are', 'can', 'could', 'would', 'should', 'will', 'have', 'has'];
        const primeiraPalavra = txt.split(' ')[0].toLowerCase();

        if (palavrasInterrogativas.includes(primeiraPalavra)) {
            return txt + "?";
        } else {
            return txt + ".";
        }
    },

    configurarMicrofone: () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        Workspace.Arena.reconhecimentoVoz = new SpeechRecognition();
        Workspace.Arena.reconhecimentoVoz.lang = 'en-US'; 
        Workspace.Arena.reconhecimentoVoz.continuous = false; // Permite pausas naturais
        Workspace.Arena.reconhecimentoVoz.interimResults = false;

        Workspace.Arena.reconhecimentoVoz.onstart = () => {
            const btn = document.getElementById('ws-btn-mic-arena');
            if(btn) { btn.innerHTML = '🔴'; btn.style.background = '#ef4444'; btn.style.animation = 'pulse 1s infinite'; }
        };

        Workspace.Arena.reconhecimentoVoz.onresult = (event) => {
            let transcricaoBruta = event.results[0][0].transcript;
            
            // 🚀 Passa o texto bruto pelo nosso "Cérebro Linguístico" para adicionar pontuação
            const transcricaoInteligente = Workspace.Arena.adicionarPontuacaoInteligente(transcricaoBruta);
            
            Workspace.Arena.enviarFala(transcricaoInteligente);
        };

        Workspace.Arena.reconhecimentoVoz.onend = () => {
            const btn = document.getElementById('ws-btn-mic-arena');
            if(btn) { btn.innerHTML = '🎙️'; btn.style.background = '#3b82f6'; btn.style.animation = 'none'; }
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
        Workspace.Arena.desenharBalao(Workspace.usuario.nome || Workspace.usuario.login, texto, true);

        try {
            await Workspace.api(`/workspace/arena/${Workspace.Arena.salaAtual}/falar`, 'POST', {
                texto: texto, autorId: Workspace.usuario.id, autorNome: Workspace.usuario.nome || Workspace.usuario.login, escolaId: Workspace.usuario.escolaId
            });
        } catch (error) { if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Erro ao transmitir fala.", "error"); }
    },

    // (As funções injetarPainelBatalha, iniciarRelogio, desenharBalao, abandonarPartida, encerrarPartidaViaTempo, exibirPainelResultadoFinal e destruirPainelBatalha continuam exatamente iguais à sua versão atual)
    
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
            <div id="ws-arena-chat-log" style="flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px;"></div>
            <div style="padding: 20px; background: #1e293b; border-top: 1px solid #334155; display: flex; justify-content: center;">
                <button id="ws-btn-mic-arena" onclick="Workspace.Arena.alternarMicrofone()" style="background: #3b82f6; color: white; border: none; width: 70px; height: 70px; border-radius: 50%; font-size: 28px; cursor: pointer; box-shadow: 0 5px 20px rgba(59, 130, 246, 0.4); transition: 0.2s; display: flex; align-items: center; justify-content: center;">🎙️</button>
            </div>
        `;
        document.body.appendChild(painel);
    },

    iniciarRelogio: () => {
        Workspace.Arena.segundosRestantes = 0;
        clearInterval(Workspace.Arena.timerInterval);

        Workspace.Arena.timerInterval = setInterval(() => {
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
            document.getElementById('ws-arena-timer').innerText = `${m}:${s}`;
        }, 1000);
    },

    desenharBalao: (nome, texto, isMinha) => {
        const log = document.getElementById('ws-arena-chat-log');
        const alinhamento = isMinha ? 'flex-end' : 'flex-start';
        const corFundo = isMinha ? '#3b82f6' : '#334155';
        const raio = isMinha ? '16px 16px 4px 16px' : '16px 16px 16px 4px';

        const html = `<div style="display: flex; flex-direction: column; align-items: ${alinhamento}; width: 100%; animation: fadeIn 0.3s ease;"><span style="color: #94a3b8; font-size: 11px; margin-bottom: 4px; font-weight: bold;">${nome}</span><div style="background: ${corFundo}; color: #fff; padding: 12px 18px; border-radius: ${raio}; max-width: 80%; font-size: 15px; line-height: 1.5; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">${texto}</div></div>`;
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
                <p style="color: #94a3b8; font-size: 14px; margin-bottom: 25px; line-height: 1.5;">Se sair agora, perderá a oportunidade de conquistar <strong>Medalhas de Fluência</strong>.</p>
                <div style="display: flex; gap: 10px;">
                    <button id="btn-arena-ficar" style="flex: 1; background: #3b82f6; color: white; border: none; padding: 12px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s;">Ficar e Lutar</button>
                    <button id="btn-arena-sair" style="flex: 1; background: transparent; border: 1px solid #ef4444; color: #ef4444; padding: 12px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s;">Sim, Sair</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('btn-arena-ficar').onclick = () => modal.remove();
        document.getElementById('btn-arena-sair').onclick = () => { modal.remove(); Workspace.Arena.destruirPainelBatalha(); };
    },

    encerrarPartidaViaTempo: async () => {
        const log = document.getElementById('ws-arena-chat-log');
        log.insertAdjacentHTML('beforeend', '<div style="text-align: center; color: #f59e0b; font-size: 15px; margin-top: 30px; font-weight: bold; animation: pulse 1.5s infinite;">⏰ O tempo esgotou-se! A IA Groq está a analisar a vossa gramática... Aguarde!</div>');
        log.scrollTop = log.scrollHeight;
        if (Workspace.Arena.reconhecimentoVoz) { try { Workspace.Arena.reconhecimentoVoz.stop(); } catch(e){} }
        
        try { await Workspace.api(`/workspace/arena/${Workspace.Arena.salaAtual}/avaliar`, 'POST', { escolaId: Workspace.usuario.escolaId }); } 
        catch (error) { if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Ocorreu um atraso na avaliação.", "warning"); }
    },

    exibirPainelResultadoFinal: (resultado) => {
        const painel = document.getElementById('ws-painel-batalha');
        if (!painel) return;

        painel.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px; text-align: center; background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%); animation: fadeIn 0.8s ease; overflow-y: auto;">
                <div style="font-size: 80px; margin-bottom: 10px;">🏅</div>
                <h1 style="color: white; margin: 0 0 10px 0; font-size: 32px;">Avaliação Concluída!</h1>
                <p style="color: #94a3b8; font-size: 16px; margin-bottom: 30px; max-width: 500px;">"${resultado.feedbackGeral}"</p>
                
                <div style="background: rgba(255,255,255,0.05); border: 1px solid #334155; padding: 30px; border-radius: 20px; max-width: 600px; width: 100%; backdrop-filter: blur(10px); box-shadow: 0 25px 50px rgba(0,0,0,0.3);">
                    <h2 style="color: #cbd5e1; margin: 0 0 15px 0; font-size: 20px;">Vencedor do Duelo</h2>
                    <h1 style="color: #f59e0b; margin: 0 0 10px 0; font-size: 28px;">${resultado.vencedor}</h1>
                    <div style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 8px 25px; border-radius: 30px; font-weight: 800; font-size: 16px; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4); text-transform: uppercase;">Medalha de ${resultado.medalha}</div>
                    
                    <div style="text-align: left; background: rgba(0,0,0,0.4); padding: 20px; border-radius: 12px; border: 1px solid #1e293b;">
                        <h4 style="color: #38bdf8; margin: 0 0 15px 0; font-size: 14px;">Feedback Gramatical:</h4>
                        ${resultado.correcoes && resultado.correcoes.length > 0 ? resultado.correcoes.map(c => `
                            <div style="margin-bottom: 12px; border-left: 2px solid #3b82f6; padding-left: 10px;">
                                <strong style="color: #fff; font-size: 15px;">${c.nome}:</strong> 
                                <div style="color: #94a3b8; font-size: 14px; margin-top: 4px;">${c.feedback}</div>
                            </div>
                        `).join('') : '<span style="color: #94a3b8;">Excelente jogo, sem correções!</span>'}
                    </div>
                </div>
                <button onclick="Workspace.Arena.destruirPainelBatalha()" style="margin-top: 40px; background: #3b82f6; color: white; border: none; padding: 16px 40px; border-radius: 15px; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.2s;">Concluir e Voltar</button>
            </div>
        `;
        if (Workspace.Feed && Workspace.Feed.dispararConfetes) Workspace.Feed.dispararConfetes();
    },

    destruirPainelBatalha: () => {
        const painel = document.getElementById('ws-painel-batalha');
        if (painel) {
            painel.style.opacity = '0';
            setTimeout(() => { painel.style.display = 'none'; painel.remove(); clearInterval(Workspace.Arena.timerInterval); Workspace.Arena.salaAtual = null; }, 300);
        }
    }
};