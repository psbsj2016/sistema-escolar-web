// js/modulos/workspace/arena.js
window.Workspace = window.Workspace || {};

Workspace.Arena = {
    salaAtual: null,
    oponenteNome: null,
    timerInterval: null,
    minutosRestantes: 50,
    segundosRestantes: 0,
    reconhecimentoVoz: null,

 // 1. INICIALIZAÇÃO
    init: () => {
        console.log("⚔️ Motor da Arena Multiplayer iniciado.");
        // A linha do botão flutuante foi apagada daqui!
        Workspace.Arena.injetarModalFila();
        Workspace.Arena.injetarPainelBatalha();
        Workspace.Arena.escutarEventosTempoReal();
        Workspace.Arena.configurarMicrofone();
    },

    // 2. INTERFACE BÁSICA (Botão flutuante e Menu de Procura)
    injetarBotaoFlutuante: () => {
        if (document.getElementById('ws-btn-arena')) return;
        const btn = document.createElement('button');
        btn.id = 'ws-btn-arena';
        btn.innerHTML = '⚔️ Arena de Fluência';
        btn.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; z-index: 9999;
            background: linear-gradient(135deg, #f59e0b, #ea580c);
            color: white; border: none; padding: 15px 25px; border-radius: 30px;
            font-size: 16px; font-weight: 800; cursor: pointer;
            box-shadow: 0 10px 25px rgba(234, 88, 12, 0.4); transition: 0.3s;
        `;
        btn.onmouseover = () => btn.style.transform = 'scale(1.05)';
        btn.onmouseout = () => btn.style.transform = 'scale(1)';
        btn.onclick = Workspace.Arena.abrirPainel;
        document.body.appendChild(btn);
    },

    injetarModalFila: () => {
        if (document.getElementById('ws-modal-arena')) return;
        const modal = document.createElement('div');
        modal.id = 'ws-modal-arena';
        modal.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 100050; align-items: center; justify-content: center; backdrop-filter: blur(5px);';
        
        modal.innerHTML = `
            <div style="background: #1e293b; width: 90%; max-width: 450px; padding: 30px; border-radius: 20px; text-align: center; border: 1px solid #334155; position: relative;">
                <button onclick="document.getElementById('ws-modal-arena').style.display='none'" style="position: absolute; top: 15px; right: 15px; background: transparent; border: none; color: #94a3b8; font-size: 20px; cursor: pointer;">✖</button>
                <div style="font-size: 50px; margin-bottom: 15px;">🎙️</div>
                <h2 style="color: #fff; margin-top: 0;">Arena de Roleplay</h2>
                <p style="color: #94a3b8; font-size: 14px; margin-bottom: 25px;">Pratique inglês ao vivo com um colega. O duelo dura 50 minutos!</p>
                
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <button id="ws-btn-procurar" onclick="Workspace.Arena.procurarAleatorio()" style="background: #3b82f6; color: white; padding: 15px; border-radius: 12px; border: none; font-weight: bold; font-size: 16px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
                        🎲 Procurar Oponente Aleatório
                    </button>
                    
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <input type="text" id="ws-arena-input-convite" placeholder="Nome exato do Colega..." style="flex: 1; padding: 15px; border-radius: 12px; border: 1px solid #334155; background: #0f172a; color: #fff; outline: none;">
                        <button onclick="Workspace.Arena.convidarColega()" style="background: #10b981; color: white; padding: 15px 20px; border-radius: 12px; border: none; font-weight: bold; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">Convidar</button>
                    </div>
                </div>
                <div id="ws-arena-status" style="margin-top: 20px; color: #f59e0b; font-weight: bold; font-size: 14px; display: none;">A procurar oponente... ⏳</div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    abrirPainel: () => {
        document.getElementById('ws-modal-arena').style.display = 'flex';
    },

    // 3. ECRÃ PRINCIPAL DA BATALHA E RELÓGIO (FASE 2)
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

            <div id="ws-arena-chat-log" style="flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px;">
                <div style="text-align: center; color: #64748b; font-size: 13px; margin-bottom: 20px;">
                    A partida começou! Aperte o microfone e converse apenas em Inglês.
                </div>
            </div>

            <div style="padding: 20px; background: #1e293b; border-top: 1px solid #334155; display: flex; justify-content: center;">
                <button id="ws-btn-mic-arena" onclick="Workspace.Arena.alternarMicrofone()" style="background: #3b82f6; color: white; border: none; width: 70px; height: 70px; border-radius: 50%; font-size: 28px; cursor: pointer; box-shadow: 0 5px 20px rgba(59, 130, 246, 0.4); transition: 0.2s; display: flex; align-items: center; justify-content: center;">
                    🎙️
                </button>
            </div>
        `;
        document.body.appendChild(painel);
    },

    iniciarPartida: (salaId, oponente) => {
        Workspace.Arena.salaAtual = salaId;
        Workspace.Arena.oponenteNome = oponente;
        
        const modal = document.getElementById('ws-modal-arena');
        if (modal) modal.style.display = 'none';

        const painel = document.getElementById('ws-painel-batalha');
        document.getElementById('ws-arena-oponente-nome').innerText = `Contra: ${oponente}`;
        document.getElementById('ws-arena-chat-log').innerHTML = '<div style="text-align: center; color: #64748b; font-size: 13px; margin-bottom: 20px;">A partida começou! Aperte o microfone e converse em Inglês.</div>';
        
        painel.style.display = 'flex';
        requestAnimationFrame(() => painel.style.opacity = '1');

        Workspace.Arena.iniciarRelogio();
    },

    iniciarRelogio: () => {
        Workspace.Arena.minutosRestantes = 50;
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
            } else {
                Workspace.Arena.segundosRestantes--;
            }

            const m = Workspace.Arena.minutosRestantes.toString().padStart(2, '0');
            const s = Workspace.Arena.segundosRestantes.toString().padStart(2, '0');
            document.getElementById('ws-arena-timer').innerText = `${m}:${s}`;
        }, 1000);
    },

    // 4. LÓGICA DE MICROFONE E COMUNICAÇÃO
    configurarMicrofone: () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        Workspace.Arena.reconhecimentoVoz = new SpeechRecognition();
        Workspace.Arena.reconhecimentoVoz.lang = 'en-US'; // Escuta apenas inglês
        Workspace.Arena.reconhecimentoVoz.interimResults = false;

        Workspace.Arena.reconhecimentoVoz.onstart = () => {
            const btn = document.getElementById('ws-btn-mic-arena');
            btn.innerHTML = '🔴';
            btn.style.background = '#ef4444';
            btn.style.animation = 'pulse 1s infinite';
        };

        Workspace.Arena.reconhecimentoVoz.onresult = (event) => {
            const transcricao = event.results[0][0].transcript;
            Workspace.Arena.enviarFala(transcricao);
        };

        Workspace.Arena.reconhecimentoVoz.onend = () => {
            const btn = document.getElementById('ws-btn-mic-arena');
            btn.innerHTML = '🎙️';
            btn.style.background = '#3b82f6';
            btn.style.animation = 'none';
        };
    },

    alternarMicrofone: () => {
        if (!Workspace.Arena.reconhecimentoVoz) {
            if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Navegador não suporta microfone. Use o Chrome.", "error");
            return;
        }
        try { Workspace.Arena.reconhecimentoVoz.start(); } 
        catch (e) { Workspace.Arena.reconhecimentoVoz.stop(); }
    },

    enviarFala: async (texto) => {
        if (!texto || !Workspace.Arena.salaAtual) return;

        Workspace.Arena.desenharBalao(Workspace.usuario.nome || Workspace.usuario.login, texto, true);

        try {
            // 🚀 Caminho atualizado
            await Workspace.api(`/workspace/arena/${Workspace.Arena.salaAtual}/falar`, 'POST', {
                texto: texto,
                autorId: Workspace.usuario.id,
                autorNome: Workspace.usuario.nome || Workspace.usuario.login,
                escolaId: Workspace.usuario.escolaId
            });
        } catch (error) {
            if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Erro ao transmitir fala.", "error");
        }
    },

    desenharBalao: (nome, texto, isMinha) => {
        const log = document.getElementById('ws-arena-chat-log');
        const alinhamento = isMinha ? 'flex-end' : 'flex-start';
        const corFundo = isMinha ? '#3b82f6' : '#334155';
        const raio = isMinha ? '16px 16px 4px 16px' : '16px 16px 16px 4px';

        const html = `
            <div style="display: flex; flex-direction: column; align-items: ${alinhamento}; width: 100%; animation: fadeIn 0.3s ease;">
                <span style="color: #94a3b8; font-size: 11px; margin-bottom: 4px; font-weight: bold;">${nome}</span>
                <div style="background: ${corFundo}; color: #fff; padding: 12px 18px; border-radius: ${raio}; max-width: 80%; font-size: 15px; line-height: 1.5; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                    ${texto}
                </div>
            </div>
        `;
        log.insertAdjacentHTML('beforeend', html);
        log.scrollTop = log.scrollHeight;
    },

   // 5. EVENTOS DO SERVIDOR (Escuta as respostas e convites)
    escutarEventosTempoReal: () => {
        const evtSource = new EventSource(`/api/workspace/stream?escolaId=${Workspace.usuario.escolaId}`);
        
        evtSource.onmessage = (event) => {
            const dados = JSON.parse(event.data);
            const meuNome = Workspace.usuario.nome || Workspace.usuario.login;
            
            // Lida com Convites e Matchmaking (Fase 1)
            if (dados.destinatarios && dados.destinatarios.includes(meuNome)) {
                if (dados.type === 'ARENA_CONVITE_RECEBIDO') {
                    if (window.Toast) {
                        Toast.showInterativo({
                            remetenteNome: dados.remetenteNome,
                            subtitulo: "⚔️ Desafio para a Arena",
                            mensagemCorpo: `<strong>${dados.remetenteNome}</strong> desafiou-te para uma prática de inglês!`
                        }, 'arena', () => {
                            // Ao clicar no aviso, entra automaticamente na sala
                            Workspace.Arena.iniciarPartida(dados.salaId, dados.remetenteNome);
                        });
                    }
                }
                
                if (dados.type === 'ARENA_MATCH_ENCONTRADO') {
                    const oponenteReal = dados.destinatarios.find(nome => nome !== meuNome);
                    Workspace.Arena.iniciarPartida(dados.salaId, oponenteReal);
                }
            }

            // Lida com a fala do oponente em tempo real
            if (dados.type === 'ARENA_NOVA_FALA' && Workspace.Arena.salaAtual === dados.salaId) {
                if (dados.fala.autorNome !== meuNome) {
                    Workspace.Arena.desenharBalao(dados.fala.autorNome, dados.fala.texto, false);
                }
            }

            // 🚀 O NOVO TRECHO INSERIDO AQUI: Ouve quando a IA entrega as Medalhas!
            if (dados.type === 'ARENA_RESULTADO_FINAL' && Workspace.Arena.salaAtual === dados.salaId) {
                Workspace.Arena.exibirPainelResultadoFinal(dados.resultado);
            }
        };
    },

    // 6. COMANDOS DE REDE
   procurarAleatorio: async () => {
        const btn = document.getElementById('ws-btn-procurar');
        const status = document.getElementById('ws-arena-status');
        btn.disabled = true; btn.style.opacity = '0.5';
        status.style.display = 'block'; status.innerText = 'A vasculhar a escola à procura de um oponente... ⏳';

        try {
            // 🚀 Caminho atualizado
            const res = await Workspace.api('/workspace/arena/procurar', 'POST', {
                alunoId: Workspace.usuario.id,
                alunoNome: Workspace.usuario.nome || Workspace.usuario.login,
                escolaId: Workspace.usuario.escolaId
            });

            if (res && res.success) {
                Workspace.Arena.salaAtual = res.salaId;
                if (!res.mensagem.includes('A aguardar')) {
                    status.style.color = '#10b981'; status.innerText = '🔥 Oponente Encontrado! A preparar a Arena...';
                } else {
                    status.innerText = 'Você é o primeiro na fila. A aguardar oponente... ⏳';
                }
            }
        } catch (error) {
            status.style.color = '#ef4444'; status.innerText = 'Erro de ligação com a Arena.';
            btn.disabled = false; btn.style.opacity = '1';
        }
    },

    convidarColega: async () => {
        const input = document.getElementById('ws-arena-input-convite');
        const status = document.getElementById('ws-arena-status');
        const nomeAlvo = input.value.trim();

        if (!nomeAlvo) { if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Digite o nome exato do colega.", "warning"); return; }

        status.style.display = 'block'; status.style.color = '#3b82f6'; status.innerText = `A enviar convite para ${nomeAlvo}... ⏳`;

        try {
            // 🚀 Caminho atualizado
            const res = await Workspace.api('/workspace/arena/convidar', 'POST', {
                alunoId: Workspace.usuario.id, alunoNome: Workspace.usuario.nome || Workspace.usuario.login, colegaNome: nomeAlvo, escolaId: Workspace.usuario.escolaId
            });

            if (res && res.success) {
                input.value = ''; Workspace.Arena.salaAtual = res.salaId;
                status.style.color = '#10b981'; status.innerText = 'Convite enviado! A aguardar que o colega aceite...';
            }
        } catch (error) {
            status.style.color = '#ef4444'; status.innerText = 'Erro ao enviar convite.';
        }
    },

    // 🚀 NOVO CARD DE ABANDONO (Substitui o Confirm Feio do Navegador)
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
                <p style="color: #94a3b8; font-size: 14px; margin-bottom: 25px; line-height: 1.5;">Se sair agora, perderá a oportunidade de conquistar <strong>Medalhas de Fluência</strong> e o seu oponente ficará a falar sozinho.</p>
                <div style="display: flex; gap: 10px;">
                    <button id="btn-arena-ficar" style="flex: 1; background: #3b82f6; color: white; border: none; padding: 12px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#2563eb'">Ficar e Lutar</button>
                    <button id="btn-arena-sair" style="flex: 1; background: transparent; border: 1px solid #ef4444; color: #ef4444; padding: 12px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.1)'">Sim, Sair</button>
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

    // 🚀 CHAMA A INTELIGÊNCIA ARTIFICIAL QUANDO O RELÓGIO ZERA
    encerrarPartidaViaTempo: async () => {
        const log = document.getElementById('ws-arena-chat-log');
        log.insertAdjacentHTML('beforeend', '<div style="text-align: center; color: #f59e0b; font-size: 15px; margin-top: 30px; font-weight: bold; animation: pulse 1.5s infinite;">⏰ O tempo esgotou-se! A IA Groq está a analisar a vossa gramática e a preparar as Medalhas... Aguarde!</div>');
        log.scrollTop = log.scrollHeight;
        
        // Desliga o microfone para garantir que não mandam mais áudio
        if (Workspace.Arena.reconhecimentoVoz) {
            try { Workspace.Arena.reconhecimentoVoz.stop(); } catch(e){}
        }
        
        try {
            // Dispara o Backend para chamar o Groq
            await Workspace.api(`/workspace/arena/${Workspace.Arena.salaAtual}/avaliar`, 'POST', {
                escolaId: Workspace.usuario.escolaId
            });
        } catch (error) {
            if (window.Workspace && Workspace.mostrarAviso) Workspace.mostrarAviso("Ocorreu um atraso na avaliação.", "warning");
        }
    },

    // 🚀 DESENHA O PÓDIO FINAL QUANDO A IA RESPONDE
    exibirPainelResultadoFinal: (resultado) => {
        const painel = document.getElementById('ws-painel-batalha');
        if (!painel) return;

        // Limpa o chat e transforma a tela no Pódio
        painel.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px; text-align: center; background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%); animation: fadeIn 0.8s ease; overflow-y: auto;">
                <div style="font-size: 80px; margin-bottom: 10px; animation: bounceIn 1s forwards;">🏅</div>
                <h1 style="color: white; margin: 0 0 10px 0; font-size: 32px;">Avaliação Concluída!</h1>
                <p style="color: #94a3b8; font-size: 16px; margin-bottom: 30px; max-width: 500px;">"${resultado.feedbackGeral}"</p>
                
                <div style="background: rgba(255,255,255,0.05); border: 1px solid #334155; padding: 30px; border-radius: 20px; max-width: 600px; width: 100%; backdrop-filter: blur(10px); box-shadow: 0 25px 50px rgba(0,0,0,0.3);">
                    <h2 style="color: #cbd5e1; margin: 0 0 15px 0; font-size: 20px;">Vencedor do Duelo</h2>
                    <h1 style="color: #f59e0b; margin: 0 0 10px 0; font-size: 28px;">${resultado.vencedor}</h1>
                    
                    <div style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 8px 25px; border-radius: 30px; font-weight: 800; font-size: 16px; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4); text-transform: uppercase; letter-spacing: 1px;">
                        Medalha de ${resultado.medalha}
                    </div>
                    
                    <div style="text-align: left; background: rgba(0,0,0,0.4); padding: 20px; border-radius: 12px; border: 1px solid #1e293b;">
                        <h4 style="color: #38bdf8; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase;">Feedback Gramatical Individual:</h4>
                        ${resultado.correcoes && resultado.correcoes.length > 0 ? resultado.correcoes.map(c => `
                            <div style="margin-bottom: 12px; border-left: 2px solid #3b82f6; padding-left: 10px;">
                                <strong style="color: #fff; font-size: 15px;">${c.nome}:</strong> 
                                <div style="color: #94a3b8; font-size: 14px; margin-top: 4px;">${c.feedback}</div>
                            </div>
                        `).join('') : '<span style="color: #94a3b8;">Foi um jogo excelente, sem correções específicas!</span>'}
                    </div>
                </div>
                
                <button onclick="Workspace.Arena.destruirPainelBatalha()" style="margin-top: 40px; background: #3b82f6; color: white; border: none; padding: 16px 40px; border-radius: 15px; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.2s; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">Concluir e Voltar ao Feed</button>
            </div>
        `;
        
        // 🚀 Chama os confetes maravilhosos que já criámos antes!
        if (Workspace.Feed && Workspace.Feed.dispararConfetes) {
            Workspace.Feed.dispararConfetes();
        }
    },

    destruirPainelBatalha: () => {
        const painel = document.getElementById('ws-painel-batalha');
        if (painel) {
            painel.style.opacity = '0';
            setTimeout(() => {
                painel.style.display = 'none';
                painel.remove(); // Limpamos a tela por completo para quando ele jogar de novo o HTML nascer fresco
                clearInterval(Workspace.Arena.timerInterval);
                Workspace.Arena.salaAtual = null;
            }, 300);
        }
    }
};