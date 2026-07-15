window.Workspace = window.Workspace || {};

Workspace.Avaliacoes = {
    avaliacoesDisponiveis: [],
    avaliacoesGerenciadorCache: [],
    entregasFeitas: [], 
    entregasEmCache: [], 
    provasEmCache: {},
    abaEscrita: 'pendentes',
    abaOral: 'pendentes',
    avaliacaoEmEdicao: null,
    turmasCarregadas: false, 
    
    exameAtivo: null,
    tentativaAtivaId: null, 
    cronometroInterval: null,
    segundosRestantes: 0,
    respostas: {},

    estudioAtivo: null,
    mediaRecorder: null,
    audioChunks: [],
    audioBlob: null,
    streamMicrofone: null,
    gravacaoInterval: null,
    segundosGravados: 0,
    
    radarInterval: null, 
    
    // 🛡️ SENSORES DE AUDITORIA EXTREMA
    monitorandoFraude: false,
    fugasCount: 0,
    tempoFora: 0,
    ultimoTick: null,
    heartbeatInterval: null,
    momentoSaidaBlur: null,
    
    // 🚀 NOVO: Memória Anti-Spam para os alertas de 10 minutos
    salasNotificadas: new Set(), 

    init: () => {
        console.log("📝 Motor de Avaliações com Integração de Videoconferência Ativado.");
        if (Workspace.usuario && Workspace.usuario.tipo === 'Aluno') {
            Workspace.Avaliacoes.carregarLobbies();
            Workspace.Avaliacoes.iniciarRadarAvaliacoes(); 
        }
    },

    // ==========================================
    // 🛡️ O MOTOR ANTIFRAUDE (HEARTBEAT & EVENTOS)
    // ==========================================
    iniciarSensorFraude: () => {
        Workspace.Avaliacoes.monitorandoFraude = true;
        Workspace.Avaliacoes.fugasCount = 0;
        Workspace.Avaliacoes.tempoFora = 0;
        Workspace.Avaliacoes.ultimoTick = Date.now();

        if(Workspace.Avaliacoes.heartbeatInterval) clearInterval(Workspace.Avaliacoes.heartbeatInterval);
        
        Workspace.Avaliacoes.heartbeatInterval = setInterval(() => {
            if (!Workspace.Avaliacoes.monitorandoFraude) return;
            const agora = Date.now();
            const delta = agora - Workspace.Avaliacoes.ultimoTick;
            
            if (delta > 2500) { 
                Workspace.Avaliacoes.fugasCount++;
                Workspace.Avaliacoes.tempoFora += (delta / 1000);
            }
            Workspace.Avaliacoes.ultimoTick = agora;
        }, 1000);

        window.addEventListener('blur', Workspace.Avaliacoes.registrarSaida);
        window.addEventListener('focus', Workspace.Avaliacoes.registrarVolta);
        
        window.onbeforeunload = () => "Tem a certeza? Se sair perderá esta tentativa.";
    },

    registrarSaida: () => {
        if (!Workspace.Avaliacoes.monitorandoFraude) return;
        Workspace.Avaliacoes.momentoSaidaBlur = Date.now();
        Workspace.Avaliacoes.fugasCount++;
    },

    registrarVolta: () => {
        if (!Workspace.Avaliacoes.monitorandoFraude || !Workspace.Avaliacoes.momentoSaidaBlur) return;
        const ausente = (Date.now() - Workspace.Avaliacoes.momentoSaidaBlur) / 1000;
        if(ausente > 1) Workspace.Avaliacoes.tempoFora += ausente; 
        Workspace.Avaliacoes.momentoSaidaBlur = null;
    },

    pararSensorFraude: () => {
        Workspace.Avaliacoes.monitorandoFraude = false;
        if(Workspace.Avaliacoes.heartbeatInterval) clearInterval(Workspace.Avaliacoes.heartbeatInterval);
        window.removeEventListener('blur', Workspace.Avaliacoes.registrarSaida);
        window.removeEventListener('focus', Workspace.Avaliacoes.registrarVolta);
        window.onbeforeunload = null;
        
        return {
            fugas: Workspace.Avaliacoes.fugasCount,
            tempoFora: Math.round(Workspace.Avaliacoes.tempoFora)
        };
    },

    confirmarDialog: (titulo, message, textoBtnConfirma, corBtnConfirma, onConfirm) => {
        let modal = document.getElementById('ws-aval-confirm-modal');
        if (!modal) {
            const modalHtml = `
            <div id="ws-aval-confirm-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.75); z-index: 999999; align-items: center; justify-content: center; backdrop-filter: blur(5px); opacity: 0; transition: opacity 0.3s;">
                <div class="ws-card" style="width: 90%; max-width: 400px; text-align: center; padding: 30px; transform: scale(0.9); transition: transform 0.3s; margin: 0; box-shadow: 0 20px 50px rgba(0,0,0,0.4); background: white; border-radius: 16px;">
                    <div id="ws-aval-confirm-icon" style="font-size: 55px; margin-bottom: 15px; line-height: 1;">⚠️</div>
                    <h3 id="ws-aval-confirm-title" style="margin: 0 0 10px 0; color: #2c3e50; font-size: 20px;">Atenção</h3>
                    <p id="ws-aval-confirm-msg" style="font-size: 15px; color: #555; margin-bottom: 25px; line-height: 1.5;">Tem a certeza?</p>
                    <div style="display: flex; gap: 15px; justify-content: center;">
                        <button class="ws-btn" style="background: #f0f2f5; color: #555; flex: 1; padding: 12px; font-size: 14px; border-radius: 30px; font-weight: bold; border: none; cursor: pointer;" onclick="document.getElementById('ws-aval-confirm-modal').style.opacity=0; setTimeout(()=>document.getElementById('ws-aval-confirm-modal').style.display='none',300)">Cancelar</button>
                        <button id="ws-aval-confirm-btn" class="ws-btn" style="flex: 1; padding: 12px; font-size: 14px; border-radius: 30px; color: white; font-weight: bold; border: none; cursor: pointer;">Confirmar</button>
                    </div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            modal = document.getElementById('ws-aval-confirm-modal');
        }

        document.getElementById('ws-aval-confirm-title').innerText = titulo;
        document.getElementById('ws-aval-confirm-msg').innerText = message;
        const btnConfirma = document.getElementById('ws-aval-confirm-btn');
        btnConfirma.innerText = textoBtnConfirma;
        btnConfirma.style.background = corBtnConfirma;
        const icon = document.getElementById('ws-aval-confirm-icon');
        icon.innerText = corBtnConfirma === '#e74c3c' ? '🚨' : (corBtnConfirma === '#27ae60' ? '✅' : '⚠️');

        modal.style.display = 'flex';
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            modal.querySelector('.ws-card').style.transform = 'scale(1)';
        });

        btnConfirma.onclick = () => {
            modal.style.opacity = '0';
            modal.querySelector('.ws-card').style.transform = 'scale(0.9)';
            setTimeout(() => { modal.style.display = 'none'; onConfirm(); }, 300);
        };
    },

    // ==========================================
    // ⏰ ALERTA INTELIGENTE (O Disparo dos 10 Minutos)
    // ==========================================
    verificarSalasProximas: (avaliacoes) => {
        if (Workspace.usuario.tipo !== 'Aluno') return;

        let minhasTurmas = [];
        const u = Workspace.usuario;
        if (u.turmas) minhasTurmas = minhasTurmas.concat(u.turmas);
        if (u.turma) minhasTurmas = minhasTurmas.concat(u.turma);
        if (u.turmaId) minhasTurmas = minhasTurmas.concat(u.turmaId);
        if (u.turmaNome) minhasTurmas = minhasTurmas.concat(u.turmaNome);
        
        const turmasSeguras = minhasTurmas.filter(t => t).map(t => String(t.id || t).toLowerCase().trim());
        const agora = new Date();

        avaliacoes.forEach(a => {
            if (a.tipo !== 'online' || a.status !== 'ativa' || !a.dataAgendada) return;

            const destinoLimpo = a.destino ? String(a.destino).toLowerCase().trim() : 'global';
            const destinoNomeLimpo = a.destinoNome ? String(a.destinoNome).toLowerCase().trim() : '';

            const isParaMim = destinoLimpo === 'global' || turmasSeguras.includes(destinoLimpo) || (destinoNomeLimpo && turmasSeguras.includes(destinoNomeLimpo));

            if (isParaMim) {
                const dataSala = new Date(a.dataAgendada);
                const diffMinutos = (dataSala - agora) / (1000 * 60);

                // Gatilho: Entre 0 a 10 Minutos restantes
                if (diffMinutos > 0 && diffMinutos <= 10) {
                    if (!Workspace.Avaliacoes.salasNotificadas.has(a.id)) {
                        Workspace.Avaliacoes.salasNotificadas.add(a.id); 
                        
                        const min = Math.ceil(diffMinutos);
                        
                        // 1. O Alerta visual que dura 10 segundos EXATOS (10000ms)
                        Workspace.mostrarAviso(`⏰ PREPARE-SE: A sessão ao vivo "${a.titulo}" começará em ${min} minutos!`, "warning", 10000);
                        
                        // 2. A Injeção no Sininho de Notificações
                        if (Workspace.Alertas && Workspace.Alertas.notificacoesAtuais) {
                            const idLocal = 'alerta_local_' + a.id;
                            if (!Workspace.Alertas.idsConhecidos.has(idLocal)) {
                                const novaNoti = {
                                    id: idLocal,
                                    remetenteNome: 'Sistema Académico',
                                    mensagem: `A sessão ao vivo "${a.titulo}" vai começar em ${min} minutos. Acesse as salas online.`,
                                    data: new Date().toISOString(),
                                    origem: 'online',
                                    origemId: a.id,
                                    destinoNome: a.destinoNome
                                };
                                // Coloca a notificação no topo da lista e avisa o Sininho
                                Workspace.Alertas.notificacoesAtuais.unshift(novaNoti);
                                Workspace.Alertas.idsConhecidos.add(novaNoti.id);
                                Workspace.Alertas.atualizarInterface();
                                
                                const bell = document.getElementById('ws-bell');
                                if(bell) { 
                                    bell.classList.add('bell-ringing'); 
                                    setTimeout(() => bell.classList.remove('bell-ringing'), 1000); 
                                }
                            }
                        }
                    }
                }
            }
        });
    },

    iniciarRadarAvaliacoes: () => {
        if (Workspace.Avaliacoes.radarInterval) clearInterval(Workspace.Avaliacoes.radarInterval);
        
        Workspace.Avaliacoes.radarInterval = setInterval(async () => {
            try {
                const resAval = await Workspace.api(`/workspace/avaliacoes?escolaId=${Workspace.usuario.escolaId}`, 'GET');
                if (resAval && resAval.success) {
                    const avaliacoesNovas = resAval.avaliacoes;
                    const idAtivo = Workspace.Avaliacoes.exameAtivo || Workspace.Avaliacoes.estudioAtivo;
                    
                    // 🚀 DISPARO DO MOTOR DE ALERTAS TEMPORIZADOS
                    Workspace.Avaliacoes.verificarSalasProximas(avaliacoesNovas);

                    if (idAtivo) {
                        const provaAtualizada = avaliacoesNovas.find(a => a.id === idAtivo);
                        const myTurma = Workspace.usuario.turmaId || (Workspace.usuario.turmas && Workspace.usuario.turmas[0]);
                        const isParaMim = provaAtualizada && (provaAtualizada.destino === 'global' || provaAtualizada.destino === myTurma || (Workspace.usuario.turmas && Workspace.usuario.turmas.some(t => t.id === provaAtualizada.destino || t === provaAtualizada.destino)));
                        
                        if (!provaAtualizada || provaAtualizada.status !== 'ativa' || !isParaMim) {
                            Workspace.Avaliacoes.expulsarAluno("O professor encerrou ou ocultou esta avaliação. A sua sessão foi interrompida.");
                        } 
                        else {
                            const provaVelha = Workspace.Avaliacoes.avaliacoesDisponiveis.find(a => a.id === idAtivo);
                            if (provaVelha && provaAtualizada.ultimaAtualizacao !== provaVelha.ultimaAtualizacao) {
                                Workspace.Avaliacoes.expulsarAluno("O professor atualizou as perguntas ou instruções deste teste. Por favor, inicie-o novamente para ver as alterações.");
                            }
                        }
                    }

                    const hashAntigo = JSON.stringify(Workspace.Avaliacoes.avaliacoesDisponiveis);
                    const hashNovo = JSON.stringify(avaliacoesNovas);
                    if (hashAntigo !== hashNovo) {
                        Workspace.Avaliacoes.avaliacoesDisponiveis = avaliacoesNovas;
                        if (!idAtivo) Workspace.Avaliacoes.renderizarLobbies();
                    }
                }
            } catch(e) {}
        }, 10000); 
    },

    expulsarAluno: (mensagem) => {
        document.body.style.overflow = '';
        const telaEscrita = document.getElementById('ws-exame-foco-tela');
        const telaOral = document.getElementById('ws-audio-foco-tela');
        if(telaEscrita) telaEscrita.style.display = 'none';
        if(telaOral) telaOral.style.display = 'none';

        if(Workspace.Avaliacoes.cronometroInterval) clearInterval(Workspace.Avaliacoes.cronometroInterval);
        if(Workspace.Avaliacoes.gravacaoInterval) clearInterval(Workspace.Avaliacoes.gravacaoInterval);
        Workspace.Avaliacoes.pararSensorFraude(); 
        
        if(Workspace.Avaliacoes.mediaRecorder && Workspace.Avaliacoes.mediaRecorder.state === 'recording') {
            Workspace.Avaliacoes.mediaRecorder.stop();
            if(Workspace.Avaliacoes.streamMicrofone) Workspace.Avaliacoes.streamMicrofone.getTracks().forEach(t => t.stop());
        }

        Workspace.Avaliacoes.exameAtivo = null;
        Workspace.Avaliacoes.estudioAtivo = null;
        Workspace.Avaliacoes.resetarInterfaceDeAudio();
        
        Workspace.Avaliacoes.renderizarLobbies();
        Workspace.Avaliacoes.confirmarDialog("Exame Interrompido 🚨", mensagem, "Entendido", "#e74c3c", () => {});
    },

    carregarLobbies: async () => {
        try {
            const resAval = await Workspace.api(`/workspace/avaliacoes?escolaId=${Workspace.usuario.escolaId}`, 'GET');
            if (resAval && resAval.success) Workspace.Avaliacoes.avaliacoesDisponiveis = resAval.avaliacoes;

            const resEntregas = await Workspace.api(`/workspace/avaliacoes/minhas-entregas/${Workspace.usuario.id}`, 'GET');
            if (resEntregas && resEntregas.success) Workspace.Avaliacoes.entregasFeitas = resEntregas.entregas;

            Workspace.Avaliacoes.renderizarLobbies();
        } catch (e) { console.error(e); }
    },

    mudarAbaEscrita: (aba) => { Workspace.Avaliacoes.abaEscrita = aba; Workspace.Avaliacoes.renderizarLobbies(); },
    mudarAbaOral: (aba) => { Workspace.Avaliacoes.abaOral = aba; Workspace.Avaliacoes.renderizarLobbies(); },

    renderizarLobbies: () => {
        // 🛡️ LÓGICA BLINDADA: Filtro ultrasseguro para encontrar a turma do aluno
        let minhasTurmas = [];
        const u = Workspace.usuario;
        if (u.turmas) minhasTurmas = minhasTurmas.concat(u.turmas);
        if (u.turma) minhasTurmas = minhasTurmas.concat(u.turma);
        if (u.turmaId) minhasTurmas = minhasTurmas.concat(u.turmaId);
        if (u.turmaNome) minhasTurmas = minhasTurmas.concat(u.turmaNome);
        
        const turmasSeguras = minhasTurmas.filter(t => t).map(t => String(t.id || t).toLowerCase().trim());

        const avalAtivas = Workspace.Avaliacoes.avaliacoesDisponiveis.filter(a => {
            if (a.status !== 'ativa') return false;
            
            const destinoLimpo = a.destino ? String(a.destino).toLowerCase().trim() : 'global';
            if (destinoLimpo === 'global') return true;

            const destinoNomeLimpo = a.destinoNome ? String(a.destinoNome).toLowerCase().trim() : '';

            return turmasSeguras.includes(destinoLimpo) || (destinoNomeLimpo && turmasSeguras.includes(destinoNomeLimpo));
        });

        const escritas = avalAtivas.filter(a => a.tipo === 'escrita');
        const orais = avalAtivas.filter(a => a.tipo === 'oral');
        const onlines = avalAtivas.filter(a => a.tipo === 'online'); 

        const entregasCount = {};
        Workspace.Avaliacoes.entregasFeitas.forEach(e => {
            entregasCount[e.avaliacaoId] = (entregasCount[e.avaliacaoId] || 0) + 1;
        });

        // TABS DA ESCRITA
        const escPendentes = escritas.filter(a => (entregasCount[a.id] || 0) < (a.tentativas || 1));
        const escConcluidas = escritas.filter(a => (entregasCount[a.id] || 0) >= (a.tentativas || 1));
        const tEscPend = document.getElementById('tab-escrita-pendentes');
        const tEscConc = document.getElementById('tab-escrita-concluidas');
        if (tEscPend && tEscConc) {
            tEscPend.innerText = `Pendentes (${escPendentes.length})`;
            tEscPend.style.background = Workspace.Avaliacoes.abaEscrita === 'pendentes' ? '#2c3e50' : 'transparent';
            tEscPend.style.color = Workspace.Avaliacoes.abaEscrita === 'pendentes' ? 'white' : '#7f8c8d';
            
            tEscConc.innerText = `Concluídas (${escConcluidas.length})`;
            tEscConc.style.background = Workspace.Avaliacoes.abaEscrita === 'concluidas' ? '#2c3e50' : 'transparent';
            tEscConc.style.color = Workspace.Avaliacoes.abaEscrita === 'concluidas' ? 'white' : '#7f8c8d';
        }

        const contEscritas = document.getElementById('ws-lista-provas-escritas');
        if (contEscritas) {
            const listaAtiva = Workspace.Avaliacoes.abaEscrita === 'pendentes' ? escPendentes : escConcluidas;
            if (listaAtiva.length === 0) {
                contEscritas.innerHTML = `<div style="text-align: center; padding: 40px; color: #7f8c8d;">🎉 Nenhuma prova nesta lista.</div>`;
            } else {
                contEscritas.innerHTML = listaAtiva.map(p => {
                    const tentativaAtual = (entregasCount[p.id] || 0) + 1;
                    const maxTentativas = p.tentativas || 1;
                    const textTentativa = Workspace.Avaliacoes.abaEscrita === 'pendentes' ? `Tentativa ${tentativaAtual} de ${maxTentativas}` : `Esgotado (${maxTentativas})`;
                    const ultimaEntrega = [...Workspace.Avaliacoes.entregasFeitas].reverse().find(e => e.avaliacaoId === p.id);

                    return `
                    <div style="background: #fff; border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin: 0 0 5px 0; color: #2c3e50;">${p.titulo}</h4>
                            <span style="font-size: 11px; color: #7f8c8d;">⏱️ ${p.tempo ? p.tempo + ' min' : 'Livre'} | 📝 ${p.questoes ? p.questoes.length : 0} Q. | 🔄 ${textTentativa}</span>
                        </div>
                        ${Workspace.Avaliacoes.abaEscrita === 'pendentes' 
                            ? `<button class="ws-btn" style="background: #3498db; padding: 8px 15px; font-size: 12px; border-radius: 20px;" onclick="Workspace.Avaliacoes.iniciarExame('${p.id}')">Iniciar Exame</button>`
                            : `<button class="ws-btn" style="background: #27ae60; padding: 8px 15px; font-size: 12px; border-radius: 20px;" onclick="Workspace.Avaliacoes.verMinhaCorrecao('${ultimaEntrega?.id}', '${p.id}')">Ver Respostas</button>`
                        }
                    </div>
                `}).join('');
            }
        }

        // TABS DO ORAL
        const orPendentes = orais.filter(a => (entregasCount[a.id] || 0) < (a.tentativas || 1));
        const orConcluidas = orais.filter(a => (entregasCount[a.id] || 0) >= (a.tentativas || 1));
        const tOrPend = document.getElementById('tab-oral-pendentes');
        const tOrConc = document.getElementById('tab-oral-concluidas');
        if (tOrPend && tOrConc) {
            tOrPend.innerText = `Para Gravar (${orPendentes.length})`;
            tOrPend.style.background = Workspace.Avaliacoes.abaOral === 'pendentes' ? '#2c3e50' : 'transparent';
            tOrPend.style.color = Workspace.Avaliacoes.abaOral === 'pendentes' ? 'white' : '#7f8c8d';
            
            tOrConc.innerText = `Enviados (${orConcluidas.length})`;
            tOrConc.style.background = Workspace.Avaliacoes.abaOral === 'concluidas' ? '#2c3e50' : 'transparent';
            tOrConc.style.color = Workspace.Avaliacoes.abaOral === 'concluidas' ? 'white' : '#7f8c8d';
        }

        const contOrais = document.getElementById('ws-lista-provas-orais');
        if (contOrais) {
            const listaAtivaOral = Workspace.Avaliacoes.abaOral === 'pendentes' ? orPendentes : orConcluidas;
            if (listaAtivaOral.length === 0) {
                contOrais.innerHTML = `<div style="text-align: center; padding: 40px; color: #7f8c8d;">🎧 Sem gravações pendentes.</div>`;
            } else {
                contOrais.innerHTML = listaAtivaOral.map(p => {
                    const ultimaEntrega = [...Workspace.Avaliacoes.entregasFeitas].reverse().find(e => e.avaliacaoId === p.id);
                    const tentativaAtual = (entregasCount[p.id] || 0) + 1;
                    const maxTentativas = p.tentativas || 1;
                    const textTentativa = Workspace.Avaliacoes.abaOral === 'pendentes' ? `Tentativa ${tentativaAtual} de ${maxTentativas}` : `Esgotado (${maxTentativas})`;

                    return `
                    <div style="background: #fff; border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin: 0 0 5px 0; color: #2c3e50;">${p.titulo}</h4>
                            <span style="font-size: 11px; color: #7f8c8d;">🎤 Conversação | 🔄 ${textTentativa}</span>
                        </div>
                        ${Workspace.Avaliacoes.abaOral === 'pendentes' 
                            ? `<button class="ws-btn" style="background: #3498db; padding: 8px 15px; font-size: 12px; border-radius: 20px;" onclick="Workspace.Avaliacoes.iniciarTesteOral('${p.id}')">Ir ao Estúdio</button>`
                            : `<button class="ws-btn" style="background: #27ae60; padding: 8px 15px; font-size: 12px; border-radius: 20px;" onclick="Workspace.Avaliacoes.verMinhaCorrecao('${ultimaEntrega?.id}', '${p.id}')">Ouvir Gravação</button>`
                        }
                    </div>
                `}).join('');
            }
        }

        // RENDERIZAÇÃO DA SALA ONLINE (VIDEOCONFERÊNCIA)
        const contOnline = document.getElementById('ws-lista-provas-online');
        if (contOnline) {
            if (onlines.length === 0) {
                contOnline.innerHTML = `<div style="text-align: center; padding: 40px; color: #7f8c8d;">Nenhuma sessão de videoconferência agendada para a sua turma.</div>`;
            } else {
                contOnline.innerHTML = onlines.map(p => {
                    const dataObj = new Date(p.dataAgendada);
                    const dataFormatada = dataObj.toLocaleDateString('pt-BR');
                    const horaFormatada = dataObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
                    
                    return `
                    <div style="background: #fff; border: 1px solid #eee; border-left: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                        <div>
                            <h4 style="margin: 0 0 5px 0; color: #2c3e50;">${p.titulo}</h4>
                            <span style="font-size: 12px; color: #8e44ad; font-weight: bold;">📅 ${dataFormatada} às ${horaFormatada}</span>
                        </div>
                        <a href="${p.linkSala}" target="_blank" class="ws-btn" style="background: #8e44ad; padding: 8px 15px; font-size: 12px; border-radius: 20px; text-decoration: none; color: white; display: inline-block;">Entrar na Sala</a>
                    </div>
                `}).join('');
            }
        }
    },

    abrirSalasOnlineAluno: async (btn) => {
        const txtOriginal = btn.innerText;
        btn.innerText = "A procurar salas... ⏳";
        
        await Workspace.Avaliacoes.carregarLobbies(); 
        Workspace.navegarPara('avaliacoes_online');   
        
        btn.innerText = txtOriginal;
    },

    iniciarExame: async (id) => {
        const examen = Workspace.Avaliacoes.avaliacoesDisponiveis.find(a => a.id === id);
        if(!examen) return;

        Workspace.mostrarAviso("A preparar ambiente seguro... ⏳", "info");
        
        try {
            const res = await Workspace.api(`/workspace/avaliacoes/${id}/iniciar`, 'POST', {
                alunoId: Workspace.usuario.id,
                alunoNome: Workspace.usuario.nome || Workspace.usuario.login
            });
            
            if (res && res.success) {
                Workspace.Avaliacoes.tentativaAtivaId = res.entregaId;
                Workspace.Avaliacoes.entrarModoFoco(examen.id, examen.titulo, examen.tempo, examen.questoes);
            } else {
                Workspace.mostrarAviso(res.error || "Limite de tentativas esgotado.", "error");
                Workspace.Avaliacoes.carregarLobbies(); 
            }
        } catch (e) { Workspace.mostrarAviso("Erro de conexão.", "error"); }
    },

    entrarModoFoco: (exameId, titulo, duracaoMinutos, questoes) => {
        Workspace.Avaliacoes.exameAtivo = exameId; 
        document.getElementById('ws-exame-titulo').innerText = titulo;
        document.body.style.overflow = 'hidden'; 
        
        const tela = document.getElementById('ws-exame-foco-tela');
        tela.style.display = 'block';
        tela.scrollTop = 0;

        const rascunho = localStorage.getItem(`ws_exame_draft_${exameId}`);
        if(rascunho) Workspace.Avaliacoes.respostas = JSON.parse(rascunho);
        else Workspace.Avaliacoes.respostas = {};

        Workspace.Avaliacoes.renderizarQuestoes(questoes);
        if(duracaoMinutos) Workspace.Avaliacoes.iniciarCronometro(duracaoMinutos * 60);
        else document.getElementById('ws-exame-cronometro').innerText = "LIVRE";
        
        Workspace.Avaliacoes.iniciarSensorFraude(); 
    },

    renderizarQuestoes: (questoes) => {
        const area = document.getElementById('ws-exame-questoes-area');
        let html = '';
        questoes.forEach(q => {
            let htmlResposta = '';
            const respostaSalva = Workspace.Avaliacoes.respostas[q.id] || '';

            if (q.tipo === 'escolha') {
                htmlResposta = `<div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">`;
                q.opcoes.forEach((opcao) => {
                    const selecionado = respostaSalva === opcao;
                    const corFundo = selecionado ? '#e8f4f8' : '#f9f9f9';
                    const corBorda = selecionado ? '#3498db' : '#eee';
                    htmlResposta += `
                        <label style="background: ${corFundo}; border: 2px solid ${corBorda}; padding: 15px; border-radius: 8px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 10px; font-size: 14px;">
                            <input type="radio" name="questao_${q.id}" value="${opcao}" ${selecionado ? 'checked' : ''} onchange="Workspace.Avaliacoes.registarResposta('${q.id}', this.value)" style="transform: scale(1.3); margin:0;">
                            <span style="color: #2c3e50; font-weight: 500;">${opcao}</span>
                        </label>
                    `;
                });
                htmlResposta += `</div>`;
            } else {
                htmlResposta = `<div style="margin-top: 15px;"><textarea rows="6" placeholder="Digite a resposta..." style="width: 100%; padding: 15px; border-radius: 8px; border: 2px solid #eee; font-family: inherit; font-size: 14px; outline: none; box-sizing: border-box; resize: vertical;" oninput="Workspace.Avaliacoes.registarResposta('${q.id}', this.value)">${respostaSalva}</textarea></div>`;
            }

            html += `<div class="ws-card" style="margin-bottom: 25px; border-left: 4px solid #3498db; box-shadow: 0 5px 20px rgba(0,0,0,0.04);"><h3 style="margin: 0; color: #2c3e50; font-size: 16px; line-height: 1.5;">${q.pergunta}</h3>${htmlResposta}</div>`;
        });
        area.innerHTML = html;
    },

    registarResposta: (questaoId, valor) => {
        Workspace.Avaliacoes.respostas[questaoId] = valor;
        localStorage.setItem(`ws_exame_draft_${Workspace.Avaliacoes.exameAtivo}`, JSON.stringify(Workspace.Avaliacoes.respostas));
    },

    guardarRascunhoManual: () => {
        const btn = event.target;
        const textoOriginal = btn.innerText;
        btn.innerText = "✅ Guardado!";
        setTimeout(() => btn.innerText = textoOriginal, 2000);
    },

    iniciarCronometro: (totalSegundos) => {
        if(Workspace.Avaliacoes.cronometroInterval) clearInterval(Workspace.Avaliacoes.cronometroInterval);
        Workspace.Avaliacoes.segundosRestantes = totalSegundos;
        const visor = document.getElementById('ws-exame-cronometro');

        Workspace.Avaliacoes.cronometroInterval = setInterval(() => {
            Workspace.Avaliacoes.segundosRestantes--;
            const s = Workspace.Avaliacoes.segundosRestantes;
            if (s <= 0) {
                clearInterval(Workspace.Avaliacoes.cronometroInterval);
                visor.innerText = "00:00:00";
                Workspace.mostrarAviso("O tempo esgotou! Prova entregue automaticamente.", "warning");
                Workspace.Avaliacoes.finalizarExame(true);
                return;
            }
            const horas = Math.floor(s / 3600).toString().padStart(2, '0');
            const minutos = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
            const seg = (s % 60).toString().padStart(2, '0');
            visor.innerText = `${horas}:${minutos}:${seg}`;
        }, 1000);
    },

    sairDoExame: () => {
        Workspace.Avaliacoes.confirmarDialog(
            "Abandonar Prova?", "⚠️ A sua tentativa já foi registada no servidor. Se desistir ou sair da página, perderá esta chance de avaliação! Deseja mesmo sair?", "Sim, Desistir", "#e74c3c", 
            () => {
                document.body.style.overflow = ''; 
                document.getElementById('ws-exame-foco-tela').style.display = 'none';
                if(Workspace.Avaliacoes.cronometroInterval) clearInterval(Workspace.Avaliacoes.cronometroInterval);
                Workspace.Avaliacoes.pararSensorFraude(); 
                Workspace.Avaliacoes.exameAtivo = null;
                Workspace.Avaliacoes.carregarLobbies(); 
            }
        );
    },

    finalizarExame: (forcar = false) => {
        const processarEntrega = async () => {
            Workspace.mostrarAviso("A entregar avaliação... ⏳", "info");
            
            const relatorio = Workspace.Avaliacoes.pararSensorFraude();

            try {
                const res = await Workspace.api(`/workspace/avaliacoes/${Workspace.Avaliacoes.exameAtivo}/entregar`, 'POST', {
                    respostas: Workspace.Avaliacoes.respostas, 
                    alunoId: Workspace.usuario.id, 
                    alunoNome: Workspace.usuario.nome || Workspace.usuario.login,
                    relatorioFraude: relatorio,
                    entregaId: Workspace.Avaliacoes.tentativaAtivaId
                });
                
                if(res && res.success) {
                    Workspace.mostrarAviso("Avaliação entregue com sucesso! 🎉", "success");
                    localStorage.removeItem(`ws_exame_draft_${Workspace.Avaliacoes.exameAtivo}`);
                    document.body.style.overflow = ''; 
                    document.getElementById('ws-exame-foco-tela').style.display = 'none';
                    if(Workspace.Avaliacoes.cronometroInterval) clearInterval(Workspace.Avaliacoes.cronometroInterval);
                    Workspace.Avaliacoes.exameAtivo = null;
                    Workspace.Avaliacoes.carregarLobbies(); 
                } else throw new Error();
            } catch(e) { Workspace.mostrarAviso("Erro ao entregar a prova.", "error"); }
        };

        if (forcar) processarEntrega();
        else Workspace.Avaliacoes.confirmarDialog("Finalizar Avaliação", "Deseja entregar a prova definitivamente? Não poderá alterar as respostas depois.", "Entregar Agora", "#27ae60", processarEntrega);
    },

    iniciarTesteOral: async (id) => {
        const teste = Workspace.Avaliacoes.avaliacoesDisponiveis.find(a => a.id === id);
        if(!teste) return;
        
        Workspace.mostrarAviso("A preparar estúdio... ⏳", "info");
        
        try {
            const res = await Workspace.api(`/workspace/avaliacoes/${id}/iniciar`, 'POST', {
                alunoId: Workspace.usuario.id,
                alunoNome: Workspace.usuario.nome || Workspace.usuario.login
            });
            
            if (res && res.success) {
                Workspace.Avaliacoes.tentativaAtivaId = res.entregaId;
                Workspace.Avaliacoes.estudioAtivo = teste.id;
                document.getElementById('ws-audio-titulo').innerText = teste.titulo;
                document.getElementById('ws-audio-pergunta').innerText = teste.instrucoes;
                document.body.style.overflow = 'hidden'; 
                document.getElementById('ws-audio-foco-tela').style.display = 'block';
                document.getElementById('ws-audio-foco-tela').scrollTop = 0;
                Workspace.Avaliacoes.resetarInterfaceDeAudio();
                
                Workspace.Avaliacoes.iniciarSensorFraude();
            } else {
                Workspace.mostrarAviso(res.error || "Limite de tentativas esgotado.", "error");
                Workspace.Avaliacoes.carregarLobbies(); 
            }
        } catch (e) { Workspace.mostrarAviso("Erro de conexão.", "error"); }
    },

    resetarInterfaceDeAudio: () => {
        document.getElementById('ws-area-gravacao').style.display = 'block';
        document.getElementById('ws-area-player').style.display = 'none';
        document.getElementById('ws-btn-iniciar-gravacao').style.display = 'inline-block';
        document.getElementById('ws-btn-parar-gravacao').style.display = 'none';
        document.getElementById('ws-audio-cronometro').innerText = '00:00';
        document.getElementById('ws-audio-cronometro').style.color = '#fff';
        document.getElementById('ws-mic-ring').style.borderColor = 'rgba(255,255,255,0.2)';
        document.getElementById('ws-mic-ring').style.background = 'rgba(255,255,255,0.05)';
        Workspace.Avaliacoes.audioBlob = null;
        Workspace.Avaliacoes.audioChunks = [];
    },

    iniciarGravacao: async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            Workspace.Avaliacoes.streamMicrofone = stream;
            Workspace.Avaliacoes.mediaRecorder = new MediaRecorder(stream);
            Workspace.Avaliacoes.audioChunks = [];

            Workspace.Avaliacoes.mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) Workspace.Avaliacoes.audioChunks.push(e.data); };
            Workspace.Avaliacoes.mediaRecorder.onstop = () => {
                Workspace.Avaliacoes.audioBlob = new Blob(Workspace.Avaliacoes.audioChunks, { type: 'audio/webm' });
                document.getElementById('ws-audio-preview').src = URL.createObjectURL(Workspace.Avaliacoes.audioBlob);
                document.getElementById('ws-area-gravacao').style.display = 'none';
                document.getElementById('ws-area-player').style.display = 'block';
                Workspace.Avaliacoes.streamMicrofone.getTracks().forEach(t => t.stop());
            };
            Workspace.Avaliacoes.mediaRecorder.start();

            document.getElementById('ws-btn-iniciar-gravacao').style.display = 'none';
            document.getElementById('ws-btn-parar-gravacao').style.display = 'inline-block';
            document.getElementById('ws-mic-ring').style.borderColor = '#e74c3c';
            document.getElementById('ws-mic-ring').style.background = 'rgba(231, 76, 60, 0.2)';
            document.getElementById('ws-audio-cronometro').style.color = '#e74c3c';

            Workspace.Avaliacoes.segundosGravados = 0;
            if(Workspace.Avaliacoes.gravacaoInterval) clearInterval(Workspace.Avaliacoes.gravacaoInterval);
            
            Workspace.Avaliacoes.gravacaoInterval = setInterval(() => {
                Workspace.Avaliacoes.segundosGravados++;
                const min = Math.floor(Workspace.Avaliacoes.segundosGravados / 60).toString().padStart(2, '0');
                const seg = (Workspace.Avaliacoes.segundosGravados % 60).toString().padStart(2, '0');
                document.getElementById('ws-audio-cronometro').innerText = `${min}:${seg}`;
                if(Workspace.Avaliacoes.segundosGravados >= 600) {
                    Workspace.Avaliacoes.pararGravacao();
                    Workspace.mostrarAviso("Tempo máximo atingido.", "info");
                }
            }, 1000);
        } catch (err) { Workspace.mostrarAviso("Microfone bloqueado. Verifique as permissões.", "error"); }
    },

    pararGravacao: () => {
        if (Workspace.Avaliacoes.mediaRecorder && Workspace.Avaliacoes.mediaRecorder.state === 'recording') {
            Workspace.Avaliacoes.mediaRecorder.stop();
            if(Workspace.Avaliacoes.gravacaoInterval) clearInterval(Workspace.Avaliacoes.gravacaoInterval);
        }
    },

    descartarAudio: () => { Workspace.Avaliacoes.confirmarDialog("Apagar Áudio", "Deseja apagar esta gravação e começar de novo?", "Apagar e Regravar", "#e74c3c", Workspace.Avaliacoes.resetarInterfaceDeAudio); },

    enviarAudio: async () => {
        if (!Workspace.Avaliacoes.audioBlob) return;
        const btn = document.getElementById('ws-btn-enviar-audio');
        btn.innerText = "A Enviar... ⏳"; btn.disabled = true;

        const relatorio = Workspace.Avaliacoes.pararSensorFraude(); 

        try {
            const formData = new FormData();
            formData.append('anexos', new File([Workspace.Avaliacoes.audioBlob], `oral_${Date.now()}.webm`, { type: 'audio/webm' }));
            const uploadRes = await fetch('/api/workspace/upload', { method: 'POST', credentials: 'include', body: formData });
            const uploadData = await uploadRes.json();
            
            if (!uploadData.success || !uploadData.anexos) throw new Error("Falha no upload.");
            const audioUrlFinal = uploadData.anexos[0].url;

            const res = await Workspace.api(`/workspace/avaliacoes/${Workspace.Avaliacoes.estudioAtivo}/entregar`, 'POST', {
                audioUrl: audioUrlFinal, alunoId: Workspace.usuario.id, alunoNome: Workspace.usuario.nome || Workspace.usuario.login, relatorioFraude: relatorio, entregaId: Workspace.Avaliacoes.tentativaAtivaId
            });

            if (res && res.success) {
                Workspace.mostrarAviso("Áudio enviado com sucesso!", "success");
                document.body.style.overflow = '';
                document.getElementById('ws-audio-foco-tela').style.display = 'none';
                Workspace.Avaliacoes.estudioAtivo = null;
                Workspace.Avaliacoes.carregarLobbies(); 
            } else throw new Error("Erro no backend.");
        } catch(e) { Workspace.mostrarAviso("Falha ao enviar o áudio.", "error"); } 
        finally { btn.innerText = "📤 Enviar Áudio"; btn.disabled = false; }
    },

    sairDoEstudio: () => {
        const mensagemSair = "⚠️ A sua tentativa já foi registada. Se sair, perderá a chance de avaliação. Deseja mesmo sair?";
        if (Workspace.Avaliacoes.mediaRecorder && Workspace.Avaliacoes.mediaRecorder.state === 'recording') {
            Workspace.Avaliacoes.confirmarDialog("Sair do Estúdio", mensagemSair, "Sim, Desistir", "#e74c3c", () => {
                Workspace.Avaliacoes.pararGravacao();
                Workspace.Avaliacoes.pararSensorFraude();
                document.body.style.overflow = '';
                document.getElementById('ws-audio-foco-tela').style.display = 'none';
                Workspace.Avaliacoes.estudioAtivo = null;
                Workspace.Avaliacoes.carregarLobbies();
            });
        } else {
            Workspace.Avaliacoes.confirmarDialog("Sair do Estúdio", mensagemSair, "Sim, Desistir", "#e74c3c", () => {
                Workspace.Avaliacoes.pararSensorFraude();
                document.body.style.overflow = '';
                document.getElementById('ws-audio-foco-tela').style.display = 'none';
                Workspace.Avaliacoes.estudioAtivo = null;
                Workspace.Avaliacoes.carregarLobbies();
            });
        }
    },

    // ==========================================
    // 🎓 PAINEL DO PROFESSOR (COM SALAS ONLINE)
    // ==========================================
    carregarTurmasProf: async () => {
        if (Workspace.Avaliacoes.turmasCarregadas) return;
        try {
            const turmas = await Workspace.api('/turmas', 'GET');
            if (turmas && turmas.length > 0) {
                const selEscrita = document.getElementById('ws-nova-prova-destino');
                const selOral = document.getElementById('ws-nova-oral-destino');
                const selOnline = document.getElementById('ws-nova-online-destino');
                let options = '<option value="global">🌍 Todas as Turmas</option>';
                turmas.forEach(t => options += `<option value="${t.id}">📚 ${Workspace.Feed.limparTexto(t.nome)}</option>`);
                
                if(selEscrita) selEscrita.innerHTML = options;
                if(selOral) selOral.innerHTML = options;
                if(selOnline) selOnline.innerHTML = options;
            }
            Workspace.Avaliacoes.turmasCarregadas = true;
        } catch(e) {}
    },

    abrirNovaEscrita: () => {
        Workspace.Avaliacoes.carregarTurmasProf();
        Workspace.Avaliacoes.avaliacaoEmEdicao = null; 
        document.getElementById('ws-btn-salvar-escrita').innerText = "🚀 Publicar Exame";
        
        document.getElementById('ws-prof-menu-avaliacoes').style.display = 'none';
        document.getElementById('ws-prof-nova-oral').style.display = 'none';
        document.getElementById('ws-prof-nova-online').style.display = 'none';
        document.getElementById('ws-prof-recebidas').style.display = 'none';
        document.getElementById('ws-prof-gerir-lista-container').style.display = 'none';
        document.getElementById('ws-prof-nova-escrita').style.display = 'block';
        
        document.getElementById('ws-nova-prova-titulo').value = '';
        document.getElementById('ws-nova-prova-tempo').value = 60;
        document.getElementById('ws-nova-prova-tentativas').value = 1;
        document.getElementById('ws-nova-prova-destino').value = 'global';
        document.getElementById('ws-builder-questoes').innerHTML = ''; 
    },

    abrirNovaOral: () => {
        Workspace.Avaliacoes.carregarTurmasProf();
        Workspace.Avaliacoes.avaliacaoEmEdicao = null; 
        document.getElementById('ws-btn-salvar-oral').innerText = "🎤 Publicar Teste Oral";

        document.getElementById('ws-prof-menu-avaliacoes').style.display = 'none';
        document.getElementById('ws-prof-nova-escrita').style.display = 'none';
        document.getElementById('ws-prof-nova-online').style.display = 'none';
        document.getElementById('ws-prof-recebidas').style.display = 'none';
        document.getElementById('ws-prof-gerir-lista-container').style.display = 'none';
        document.getElementById('ws-prof-nova-oral').style.display = 'block';

        document.getElementById('ws-nova-oral-titulo').value = '';
        document.getElementById('ws-nova-oral-instrucoes').value = '';
        document.getElementById('ws-nova-oral-tentativas').value = 1;
        document.getElementById('ws-nova-oral-destino').value = 'global';
    },

    abrirNovaOnline: () => {
        Workspace.Avaliacoes.carregarTurmasProf();
        Workspace.Avaliacoes.avaliacaoEmEdicao = null; 
        document.getElementById('ws-btn-salvar-online').innerText = "💻 Agendar Sessão Ao Vivo";

        document.getElementById('ws-prof-menu-avaliacoes').style.display = 'none';
        document.getElementById('ws-prof-nova-escrita').style.display = 'none';
        document.getElementById('ws-prof-nova-oral').style.display = 'none';
        document.getElementById('ws-prof-recebidas').style.display = 'none';
        document.getElementById('ws-prof-gerir-lista-container').style.display = 'none';
        document.getElementById('ws-prof-nova-online').style.display = 'block';

        document.getElementById('ws-nova-online-titulo').value = '';
        document.getElementById('ws-nova-online-data').value = '';
        document.getElementById('ws-nova-online-link').value = '';
        document.getElementById('ws-nova-online-destino').value = 'global';
    },

    voltarMenuProf: () => {
        document.getElementById('ws-prof-nova-escrita').style.display = 'none';
        document.getElementById('ws-prof-nova-oral').style.display = 'none';
        document.getElementById('ws-prof-nova-online').style.display = 'none';
        document.getElementById('ws-prof-recebidas').style.display = 'none';
        document.getElementById('ws-prof-gerir-lista-container').style.display = 'none';
        document.getElementById('ws-prof-menu-avaliacoes').style.display = 'grid';
    },

    abrirGerenciador: async () => {
        document.getElementById('ws-prof-menu-avaliacoes').style.display = 'none';
        document.getElementById('ws-prof-gerir-lista-container').style.display = 'block';
        
        const container = document.getElementById('ws-prof-gerir-lista');
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">A carregar base de dados... ⏳</div>';

        try {
            const res = await Workspace.api(`/workspace/avaliacoes?escolaId=${Workspace.usuario.escolaId}`, 'GET');
            const resEntregas = await Workspace.api(`/workspace/avaliacoes/entregas`, 'GET'); 

            if(res && res.success) {
                Workspace.Avaliacoes.avaliacoesGerenciadorCache = res.avaliacoes || [];
                if(resEntregas && resEntregas.success) Workspace.Avaliacoes.entregasEmCache = resEntregas.entregas || [];
                Workspace.Avaliacoes.renderizarListaGerenciador();
            }
        } catch(e) { container.innerHTML = '<div style="text-align: center; padding: 40px; color: #e74c3c;">Erro ao carregar provas.</div>'; }
    },

    renderizarListaGerenciador: () => {
        const container = document.getElementById('ws-prof-gerir-lista');
        const avaliacoes = Workspace.Avaliacoes.avaliacoesGerenciadorCache;

        if(avaliacoes.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">Ainda não criou nenhuma avaliação.</div>';
            return;
        }

        container.innerHTML = avaliacoes.map(a => {
            let icone = '✍️';
            if (a.tipo === 'oral') icone = '🎤';
            if (a.tipo === 'online') icone = '💻';

            const corStatus = a.status === 'ativa' ? '#27ae60' : '#95a5a6';
            const textoStatus = a.status === 'ativa' ? 'Online' : 'Oculta';

            const temEntrega = Workspace.Avaliacoes.entregasEmCache.some(e => e.avaliacaoId === a.id);
            const btnEditar = (temEntrega && a.tipo !== 'online')
                ? `<button class="ws-btn" style="background:#f0f2f5; color:#aaa; flex:1; font-size:12px; padding:6px; cursor:not-allowed;" title="Já possui entregas" onclick="Workspace.mostrarAviso('Esta avaliação possui entregas. Não pode editar.', 'warning')">🔒 Bloqueado</button>`
                : `<button class="ws-btn" style="background:#f0f2f5; color:#3498db; flex:1; font-size:12px; padding:6px;" onclick="Workspace.Avaliacoes.editarAvaliacao('${a.id}')">✏️ Editar</button>`;

            return `
            <div style="background: #fff; border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; flex-direction:column; gap: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h4 style="margin: 0 0 5px 0; color: #2c3e50;">${icone} ${a.titulo}</h4>
                        <span style="font-size: 11px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: ${corStatus}20; color: ${corStatus};">${textoStatus}</span>
                        <span style="font-size: 11px; color: #8e44ad; font-weight:bold; margin-left: 5px;">👥 ${a.destinoNome || 'Global'}</span>
                        <span style="font-size: 11px; color: #7f8c8d; margin-left: 5px;">Criada a: ${new Date(a.dataCriacao).toLocaleDateString('pt-BR')}</span>
                    </div>
                </div>
                <div style="display:flex; gap: 8px; border-top: 1px dashed #eee; padding-top: 10px;">
                    ${btnEditar}
                    <button class="ws-btn" style="background:#f0f2f5; color:#f39c12; flex:1; font-size:12px; padding:6px;" onclick="Workspace.Avaliacoes.mudarStatusAvaliacao('${a.id}', '${a.status === 'ativa' ? 'inativa' : 'ativa'}')">${a.status === 'ativa' ? '⏸️ Ocultar' : '▶️ Publicar'}</button>
                    <button class="ws-btn" style="background:#fdf2f2; color:#e74c3c; flex:1; font-size:12px; padding:6px;" onclick="Workspace.Avaliacoes.excluirAvaliacao('${a.id}')">🗑️ Apagar</button>
                </div>
            </div>`;
        }).join('');
    },

    mudarStatusAvaliacao: async (id, novoStatus) => {
        try {
            await Workspace.api(`/workspace/avaliacoes/${id}/status`, 'PATCH', { status: novoStatus });
            const p = Workspace.Avaliacoes.avaliacoesGerenciadorCache.find(x => x.id === id);
            if(p) p.status = novoStatus;
            Workspace.Avaliacoes.renderizarListaGerenciador();
            Workspace.mostrarAviso("Status alterado com sucesso!", "success");
        } catch(e) { Workspace.mostrarAviso("Erro ao alterar o status.", "error"); }
    },

    excluirAvaliacao: (id) => {
        Workspace.Avaliacoes.confirmarDialog("Excluir Definitivamente", "Deseja apagar esta avaliação para sempre?", "Sim, Apagar", "#e74c3c", async () => {
            try {
                await Workspace.api(`/workspace/avaliacoes/${id}`, 'DELETE');
                Workspace.Avaliacoes.avaliacoesGerenciadorCache = Workspace.Avaliacoes.avaliacoesGerenciadorCache.filter(x => x.id !== id);
                Workspace.Avaliacoes.renderizarListaGerenciador();
                Workspace.mostrarAviso("Avaliação apagada com sucesso!", "success");
            } catch(e) { Workspace.mostrarAviso("Erro ao apagar.", "error"); }
        });
    },

    editarAvaliacao: async (id) => {
        await Workspace.Avaliacoes.carregarTurmasProf();
        const prova = Workspace.Avaliacoes.avaliacoesGerenciadorCache.find(p => p.id === id);
        if(!prova) return;

        Workspace.Avaliacoes.avaliacaoEmEdicao = prova.id;

        if (prova.tipo === 'escrita') {
            document.getElementById('ws-prof-gerir-lista-container').style.display = 'none';
            document.getElementById('ws-prof-nova-escrita').style.display = 'block';
            
            document.getElementById('ws-nova-prova-titulo').value = prova.titulo;
            document.getElementById('ws-nova-prova-tempo').value = prova.tempo || 60;
            document.getElementById('ws-nova-prova-tentativas').value = prova.tentativas || 1;
            document.getElementById('ws-nova-prova-destino').value = prova.destino || 'global';
            document.getElementById('ws-btn-salvar-escrita').innerText = "💾 Guardar Alterações";
            
            document.getElementById('ws-builder-questoes').innerHTML = '';
            if(prova.questoes) {
                prova.questoes.forEach(q => Workspace.Avaliacoes.adicionarQuestaoBuilder(q.tipo, q));
            }
        } else if (prova.tipo === 'oral') {
            document.getElementById('ws-prof-gerir-lista-container').style.display = 'none';
            document.getElementById('ws-prof-nova-oral').style.display = 'block';
            
            document.getElementById('ws-nova-oral-titulo').value = prova.titulo;
            document.getElementById('ws-nova-oral-instrucoes').value = prova.instrucoes;
            document.getElementById('ws-nova-oral-tentativas').value = prova.tentativas || 1;
            document.getElementById('ws-nova-oral-destino').value = prova.destino || 'global';
            document.getElementById('ws-btn-salvar-oral').innerText = "💾 Guardar Alterações";
        } else if (prova.tipo === 'online') { 
            document.getElementById('ws-prof-gerir-lista-container').style.display = 'none';
            document.getElementById('ws-prof-nova-online').style.display = 'block';
            
            document.getElementById('ws-nova-online-titulo').value = prova.titulo;
            document.getElementById('ws-nova-online-data').value = prova.dataAgendada || '';
            document.getElementById('ws-nova-online-link').value = prova.linkSala || '';
            document.getElementById('ws-nova-online-destino').value = prova.destino || 'global';
            document.getElementById('ws-btn-salvar-online').innerText = "💾 Guardar Alterações";
        }
    },

    adicionarQuestaoBuilder: (tipo, questaoExistente = null) => {
        const area = document.getElementById('ws-builder-questoes');
        const qId = Date.now() + Math.floor(Math.random()*1000); 
        let html = '';

        let perguntaStr = questaoExistente ? questaoExistente.pergunta.replace(/^\d+\.\s*/, '') : '';
        
        const btnGuardarBanco = `<button onclick="Workspace.Avaliacoes.salvarQuestaoNoBanco(this, '${tipo}')" style="position:absolute; right:45px; top:10px; background:#f39c12; color:white; border:none; border-radius:4px; padding:4px 8px; font-size:11px; cursor:pointer; font-weight:bold; transition:0.2s;" onmouseover="this.style.background='#e67e22'" onmouseout="this.style.background='#f39c12'" title="Guardar no Banco de Questões">⭐ Guardar</button>`;

        if (tipo === 'escolha') {
            let ops = questaoExistente && questaoExistente.opcoes ? questaoExistente.opcoes : ['', '', '', ''];
            let rC = questaoExistente ? questaoExistente.respostaCorreta : ops[0];
            
            html = `
            <div class="ws-card ws-questao-build" style="border: 2px solid #3498db; position: relative; padding: 15px; margin-bottom: 0;">
                ${btnGuardarBanco}
                <button onclick="this.parentElement.remove()" style="position:absolute; right:10px; top:10px; background:#e74c3c; color:white; border:none; border-radius:50%; width:25px; height:25px; cursor:pointer; font-weight:bold;">×</button>
                <div style="font-weight:bold; color:#3498db; font-size:12px; margin-bottom:10px; text-transform:uppercase;">Múltipla Escolha</div>
                <input type="text" class="ws-post-input q-pergunta" placeholder="Digite a pergunta..." style="margin-bottom:15px; font-weight:bold;" value="${perguntaStr}">
                <div style="display:flex; flex-direction:column; gap:10px; padding-left:10px; border-left:3px solid #eee;">
                    <div style="display:flex; align-items:center; gap:10px;"><input type="radio" name="correta_${qId}" value="0" ${rC===ops[0]?'checked':''} style="transform:scale(1.2);"><input type="text" class="ws-post-input q-op" placeholder="Opção A" style="margin:0; flex:1;" value="${ops[0]}"></div>
                    <div style="display:flex; align-items:center; gap:10px;"><input type="radio" name="correta_${qId}" value="1" ${rC===ops[1]?'checked':''} style="transform:scale(1.2);"><input type="text" class="ws-post-input q-op" placeholder="Opção B" style="margin:0; flex:1;" value="${ops[1]}"></div>
                    <div style="display:flex; align-items:center; gap:10px;"><input type="radio" name="correta_${qId}" value="2" ${rC===ops[2]?'checked':''} style="transform:scale(1.2);"><input type="text" class="ws-post-input q-op" placeholder="Opção C" style="margin:0; flex:1;" value="${ops[2]}"></div>
                    <div style="display:flex; align-items:center; gap:10px;"><input type="radio" name="correta_${qId}" value="3" ${rC===ops[3]?'checked':''} style="transform:scale(1.2);"><input type="text" class="ws-post-input q-op" placeholder="Opção D" style="margin:0; flex:1;" value="${ops[3]}"></div>
                </div>
            </div>`;
        } else {
            html = `
            <div class="ws-card ws-questao-build" style="border: 2px solid #9b59b6; position: relative; padding: 15px; margin-bottom: 0;">
                ${btnGuardarBanco}
                <button onclick="this.parentElement.remove()" style="position:absolute; right:10px; top:10px; background:#e74c3c; color:white; border:none; border-radius:50%; width:25px; height:25px; cursor:pointer; font-weight:bold;">×</button>
                <div style="font-weight:bold; color:#9b59b6; font-size:12px; margin-bottom:10px; text-transform:uppercase;">Dissertativa (Texto)</div>
                <input type="text" class="ws-post-input q-pergunta" placeholder="Digite a pergunta para o aluno dissertar..." style="margin-bottom:5px; font-weight:bold;" value="${perguntaStr}">
            </div>`;
        }
        area.insertAdjacentHTML('beforeend', html);
    },

    salvarQuestaoNoBanco: async (btn, tipo) => {
        const card = btn.closest('.ws-questao-build');
        const pergunta = card.querySelector('.q-pergunta').value.trim();
        if(!pergunta) return Workspace.mostrarAviso("A pergunta não pode estar vazia.", "warning");

        let questaoData = { tipo, pergunta };

        if(tipo === 'escolha') {
            const opcoes = Array.from(card.querySelectorAll('.q-op')).map(i => i.value.trim());
            if(opcoes.some(o => o === '')) return Workspace.mostrarAviso("Preencha todas as opções antes de guardar.", "warning");
            const rds = Array.from(card.querySelectorAll('input[type="radio"]'));
            const indexCorreta = rds.findIndex(r => r.checked);
            questaoData.opcoes = opcoes;
            questaoData.respostaCorreta = opcoes[indexCorreta];
        }

        const textoOriginal = btn.innerText;
        btn.innerText = "⏳";
        btn.disabled = true;

        try {
            const res = await Workspace.api('/workspace/avaliacoes/banco-questoes', 'POST', {
                questao: questaoData, escolaId: Workspace.usuario.escolaId
            });
            if(res && res.success) {
                Workspace.mostrarAviso("Questão guardada no banco com sucesso! ⭐", "success");
                btn.innerText = "✔️ Guardada";
                btn.style.background = "#27ae60";
            } else throw new Error();
        } catch(e) {
            Workspace.mostrarAviso("Erro ao guardar questão.", "error");
            btn.innerText = textoOriginal; btn.disabled = false;
        }
    },

    abrirModalBancoQuestoes: async () => {
        const modalId = 'ws-modal-banco-questoes';
        if(document.getElementById(modalId)) document.getElementById(modalId).remove();

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:100000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px);";
        modal.innerHTML = `
            <div class="ws-card" style="width: 90%; max-width: 700px; max-height: 85vh; display:flex; flex-direction:column; overflow: hidden; padding: 0; position: relative;">
                <div style="padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
                    <h3 style="margin: 0; color: #2c3e50;">⭐ O Seu Banco de Questões</h3>
                    <button onclick="document.getElementById('${modalId}').remove()" style="background:#eee; border:none; border-radius:50%; width:35px; height:35px; cursor:pointer; font-weight:bold; color:#333; font-size:18px;">×</button>
                </div>
                <div id="ws-banco-lista" style="padding: 20px; overflow-y: auto; flex: 1; background: #fff;">
                    <div style="text-align: center; padding: 40px; color: #999;">A carregar o seu cofre de perguntas... ⏳</div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        try {
            const res = await Workspace.api(`/workspace/avaliacoes/banco-questoes?escolaId=${Workspace.usuario.escolaId}`, 'GET');
            const container = document.getElementById('ws-banco-lista');
            
            if(res && res.success && res.questoes.length > 0) {
                container.innerHTML = res.questoes.map(q => {
                    const icone = q.tipo === 'escolha' ? '🔘' : '📝';
                    return `
                    <div style="border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; background: #fdfdfd; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                        <div style="flex: 1; padding-right: 15px;">
                            <div style="font-size: 11px; font-weight: bold; color: #7f8c8d; text-transform: uppercase; margin-bottom: 5px;">${icone} ${q.tipo === 'escolha' ? 'Múltipla Escolha' : 'Texto'}</div>
                            <div style="font-weight: bold; color: #2c3e50; font-size: 14px;">${q.pergunta}</div>
                        </div>
                        <button class="ws-btn" style="background: #3498db; padding: 8px 15px; font-size: 12px; border-radius: 20px; white-space: nowrap;" onclick="Workspace.Avaliacoes.importarQuestaoDoBanco('${btoa(unescape(encodeURIComponent(JSON.stringify(q))))}'); document.getElementById('${modalId}').remove();">➕ Importar</button>
                    </div>`;
                }).join('');
            } else {
                container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;"><div style="font-size: 40px; margin-bottom: 15px;">📭</div>O seu banco está vazio. Crie uma questão no construtor e clique em "⭐ Guardar" para preencher este cofre.</div>';
            }
        } catch(e) { document.getElementById('ws-banco-lista').innerHTML = '<div style="text-align: center; padding: 40px; color: #e74c3c;">Erro ao carregar o banco de questões.</div>'; }
    },

    importarQuestaoDoBanco: (questaoBase64) => {
        try {
            const questao = JSON.parse(decodeURIComponent(escape(atob(questaoBase64))));
            Workspace.Avaliacoes.adicionarQuestaoBuilder(questao.tipo, questao);
            Workspace.mostrarAviso("Questão importada para o exame!", "success");
        } catch(e) { Workspace.mostrarAviso("Erro ao ler a questão.", "error"); }
    },

    salvarProvaEscrita: async () => {
        const titulo = document.getElementById('ws-nova-prova-titulo').value;
        const tempo = document.getElementById('ws-nova-prova-tempo').value;
        const tentativas = document.getElementById('ws-nova-prova-tentativas').value;
        const selDestino = document.getElementById('ws-nova-prova-destino');
        const destino = selDestino.value;
        const destinoNome = selDestino.options[selDestino.selectedIndex].text.replace('📚 ', '').replace('🌍 ', '');

        if(!titulo) return Workspace.mostrarAviso("Defina um título.", "warning");

        const qCards = document.querySelectorAll('.ws-questao-build');
        if(qCards.length === 0) return Workspace.mostrarAviso("Adicione perguntas.", "warning");

        const questaoData = [];
        let erro = false;

        qCards.forEach((card, index) => {
            const pergunta = card.querySelector('.q-pergunta').value.trim();
            if(!pergunta) erro = true;

            if(card.querySelector('.q-op')) { 
                const opcoes = Array.from(card.querySelectorAll('.q-op')).map(i => i.value.trim());
                if(opcoes.some(o => o === '')) erro = true;

                const rds = Array.from(card.querySelectorAll('input[type="radio"]'));
                const indexCorreta = rds.findIndex(r => r.checked);

                questaoData.push({ id: `q${index+1}`, tipo: 'escolha', pergunta: `${index+1}. ${pergunta}`, opcoes: opcoes, respostaCorreta: opcoes[indexCorreta] });
            } else { 
                questaoData.push({ id: `q${index+1}`, tipo: 'texto', pergunta: `${index+1}. ${pergunta}` });
            }
        });

        if(erro) return Workspace.mostrarAviso("Existem espaços em branco.", "warning");

        const btn = event.target;
        const txt = btn.innerText;
        btn.innerText = "⏳ A gravar..."; btn.disabled = true;

        try {
            const endpoint = Workspace.Avaliacoes.avaliacaoEmEdicao ? `/workspace/avaliacoes/${Workspace.Avaliacoes.avaliacaoEmEdicao}` : '/workspace/avaliacoes';
            const metodo = Workspace.Avaliacoes.avaliacaoEmEdicao ? 'PUT' : 'POST';

            const res = await Workspace.api(endpoint, metodo, {
                titulo, tipo: 'escrita', tempo: parseInt(tempo, 10), tentativas: parseInt(tentativas, 10), questoes: questaoData, escolaId: Workspace.usuario.escolaId, autorNome: Workspace.usuario.nome || Workspace.usuario.login, destino, destinoNome, status: 'ativa'
            });

            if (res && res.success) {
                Workspace.mostrarAviso(Workspace.Avaliacoes.avaliacaoEmEdicao ? "Atualizado!" : "Avaliação publicada!", "success");
                Workspace.Avaliacoes.voltarMenuProf();
            } else {
                Workspace.mostrarAviso(res.error || "Erro ao guardar a avaliação.", "error");
            }
        } catch (e) { 
            Workspace.mostrarAviso("Erro de ligação ao servidor.", "error"); 
        } finally { 
            btn.innerText = txt; 
            btn.disabled = false; 
        }
    },

    salvarProvaOral: async () => {
        const titulo = document.getElementById('ws-nova-oral-titulo').value.trim();
        const instrucoes = document.getElementById('ws-nova-oral-instrucoes').value.trim();
        const tentativas = document.getElementById('ws-nova-oral-tentativas').value;
        const selDestino = document.getElementById('ws-nova-oral-destino');
        const destino = selDestino.value;
        const destinoNome = selDestino.options[selDestino.selectedIndex].text.replace('📚 ', '').replace('🌍 ', '');

        if(!titulo || !instrucoes) return Workspace.mostrarAviso("Preencha título e instruções.", "warning");

        const btn = event.target;
        const txt = btn.innerText; btn.innerText = "⏳ A gravar..."; btn.disabled = true;

        try {
            const endpoint = Workspace.Avaliacoes.avaliacaoEmEdicao ? `/workspace/avaliacoes/${Workspace.Avaliacoes.avaliacaoEmEdicao}` : '/workspace/avaliacoes';
            const metodo = Workspace.Avaliacoes.avaliacaoEmEdicao ? 'PUT' : 'POST';

            const res = await Workspace.api(endpoint, metodo, {
                titulo, tipo: 'oral', tentativas: parseInt(tentativas, 10), instrucoes, escolaId: Workspace.usuario.escolaId, autorNome: Workspace.usuario.nome || Workspace.usuario.login, destino, destinoNome, status: 'ativa'
            });

            if (res && res.success) {
                Workspace.mostrarAviso(Workspace.Avaliacoes.avaliacaoEmEdicao ? "Atualizado!" : "Teste Oral publicado!", "success");
                Workspace.Avaliacoes.voltarMenuProf();
            } else {
                Workspace.mostrarAviso(res.error || "Erro ao guardar a avaliação.", "error");
            }
        } catch (e) { 
            Workspace.mostrarAviso("Erro de ligação ao servidor.", "error"); 
        } finally { 
            btn.innerText = txt; 
            btn.disabled = false; 
        }
    },

    salvarProvaOnline: async () => {
        const titulo = document.getElementById('ws-nova-online-titulo').value.trim();
        const dataHora = document.getElementById('ws-nova-online-data').value;
        const linkSala = document.getElementById('ws-nova-online-link').value.trim();
        const selDestino = document.getElementById('ws-nova-online-destino');
        const destino = selDestino.value;
        const destinoNome = selDestino.options[selDestino.selectedIndex].text.replace('📚 ', '').replace('🌍 ', '');

        if(!titulo || !dataHora || !linkSala) return Workspace.mostrarAviso("Preencha o título, a data e o link da sala.", "warning");

        const btn = event.target;
        const txt = btn.innerText; btn.innerText = "⏳ A agendar..."; btn.disabled = true;

        try {
            const endpoint = Workspace.Avaliacoes.avaliacaoEmEdicao ? `/workspace/avaliacoes/${Workspace.Avaliacoes.avaliacaoEmEdicao}` : '/workspace/avaliacoes';
            const metodo = Workspace.Avaliacoes.avaliacaoEmEdicao ? 'PUT' : 'POST';

            const res = await Workspace.api(endpoint, metodo, {
                titulo, tipo: 'online', dataAgendada: dataHora, linkSala, escolaId: Workspace.usuario.escolaId, autorNome: Workspace.usuario.nome || Workspace.usuario.login, destino, destinoNome, status: 'ativa'
            });

            if (res && res.success) {
                Workspace.mostrarAviso(Workspace.Avaliacoes.avaliacaoEmEdicao ? "Sala Atualizada!" : "Sala Agendada com sucesso!", "success");
                Workspace.Avaliacoes.voltarMenuProf();
            } else {
                Workspace.mostrarAviso(res.error || "Erro ao guardar a sala.", "error");
            }
        } catch (e) { 
            Workspace.mostrarAviso("Erro de ligação ao servidor.", "error"); 
        } finally { 
            btn.innerText = txt; 
            btn.disabled = false; 
        }
    },

    abrirRecebidas: async () => {
        document.getElementById('ws-prof-menu-avaliacoes').style.display = 'none';
        document.getElementById('ws-prof-gerir-lista-container').style.display = 'none';
        document.getElementById('ws-prof-recebidas').style.display = 'block';
        
        const container = document.getElementById('ws-prof-recebidas-lista');
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">A carregar provas recebidas da API... ⏳</div>';

        try {
            const resProvas = await Workspace.api(`/workspace/avaliacoes?escolaId=${Workspace.usuario.escolaId}`, 'GET');
            const resEntregas = await Workspace.api(`/workspace/avaliacoes/entregas`, 'GET');

            if (resEntregas && resEntregas.success && resProvas && resProvas.success) {
                const provasMap = {};
                resProvas.avaliacoes.forEach(p => provasMap[p.id] = p);

                if (resEntregas.entregas.length === 0) {
                    container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">Nenhuma prova entregue ainda.</div>';
                    return;
                }

                Workspace.Avaliacoes.entregasEmCache = resEntregas.entregas;
                Workspace.Avaliacoes.provasEmCache = provasMap;

                let totalAlertas = 0;
                const erroPorQuestao = {};
                let somaAcertos = 0;
                let totalRespostasMultipla = 0;

                resEntregas.entregas.forEach(e => {
                    if (e.relatorioFraude && e.relatorioFraude.fugas > 0) totalAlertas++;
                    
                    const prova = provasMap[e.avaliacaoId];
                    if (!prova || !prova.questoes || !e.respostas) return;
                    
                    prova.questoes.forEach(q => {
                        if (q.tipo === 'escolha') {
                            const chaveUnica = `${e.avaliacaoId}_${q.id}`;
                            if (!erroPorQuestao[chaveUnica]) {
                                erroPorQuestao[chaveUnica] = { 
                                    erros: 0, 
                                    total: 0, 
                                    pergunta: q.pergunta, 
                                    tituloProva: prova.titulo 
                                };
                            }
                            erroPorQuestao[chaveUnica].total++;
                            const respAluno = e.respostas[q.id];
                            if (respAluno !== q.respostaCorreta) {
                                erroPorQuestao[chaveUnica].erros++;
                            }
                            somaAcertos += (respAluno === q.respostaCorreta ? 1 : 0);
                            totalRespostasMultipla++;
                        }
                    });
                });

                let piorQuestao = null;
                let maiorTaxaErro = 0;

                Object.keys(erroPorQuestao).forEach(chave => {
                    const item = erroPorQuestao[chave];
                    const taxa = item.erros / item.total;
                    if (taxa > maiorTaxaErro && item.erros > 0) {
                        maiorTaxaErro = taxa;
                        piorQuestao = item;
                    }
                });

                const mediaAcertosTurma = totalRespostasMultipla > 0 ? Math.round((somaAcertos / totalRespostasMultipla) * 100) : null;
                const taxaErroFormatada = Math.round(maiorTaxaErro * 100);

                let htmlAnalytics = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 15px; margin-bottom: 25px;">
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; border-left: 4px solid #3498db; box-shadow: 0 2px 4px rgba(0,0,0,0.01);">
                        <div style="font-size: 11px; font-weight: bold; color: #7f8c8d; text-transform: uppercase; margin-bottom: 5px;">📊 Desempenho nas Objetivas</div>
                        <div style="font-size: 24px; font-weight: bold; color: #2c3e50;">${mediaAcertosTurma !== null ? mediaAcertosTurma + '%' : '---'}</div>
                        <div style="font-size: 11px; color: #95a5a6; margin-top: 2px;">Média global de acerto da escola</div>
                    </div>
                `;

                if (piorQuestao) {
                    htmlAnalytics += `
                    <div style="background: #fdf2f2; border: 1px solid #fadbd8; border-radius: 12px; padding: 15px; border-left: 4px solid #e74c3c; box-shadow: 0 2px 4px rgba(0,0,0,0.01);">
                        <div style="font-size: 11px; font-weight: bold; color: #c0392b; text-transform: uppercase; margin-bottom: 5px;">🔥 Zona Crítica (Mapa de Calor)</div>
                        <div style="font-size: 13px; font-weight: bold; color: #2c3e50; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;" title="${piorQuestao.pergunta}">${piorQuestao.pergunta}</div>
                        <div style="font-size: 11px; color: #e74c3c; font-weight: bold; margin-top: 4px;">Falha de ${taxaErroFormatada}% em: ${piorQuestao.tituloProva}</div>
                    </div>
                    `;
                } else {
                    htmlAnalytics += `
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; border-left: 4px solid #95a5a6; box-shadow: 0 2px 4px rgba(0,0,0,0.01);">
                        <div style="font-size: 11px; font-weight: bold; color: #7f8c8d; text-transform: uppercase; margin-bottom: 5px;">🔥 Zona Crítica (Mapa de Calor)</div>
                        <div style="font-size: 14px; font-weight: bold; color: #7f8c8d; margin-top: 5px;">Sem anomalias detetadas</div>
                        <div style="font-size: 11px; color: #95a5a6; margin-top: 2px;">Nenhuma questão crítica alarmante</div>
                    </div>
                    `;
                }

                htmlAnalytics += `
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; border-left: 4px solid #f39c12; box-shadow: 0 2px 4px rgba(0,0,0,0.01);">
                        <div style="font-size: 11px; font-weight: bold; color: #7f8c8d; text-transform: uppercase; margin-bottom: 5px;">🛡️ Alertas de Fraude</div>
                        <div style="font-size: 24px; font-weight: bold; color: #d35400;">${totalAlertas}</div>
                        <div style="font-size: 11px; color: #95a5a6; margin-top: 2px;">Ausências de ecrã registadas</div>
                    </div>
                </div>
                <h3 style="font-size:15px; color:#2c3e50; margin:25px 0 15px 0; font-weight:bold; border-bottom:2px solid #eee; padding-bottom:8px;">📥 Exames Recebidos para Avaliação</h3>
                `;

                const htmlListaAlunos = resEntregas.entregas.map(e => {
                    const prova = provasMap[e.avaliacaoId];
                    const tituloProva = prova ? prova.titulo : 'Prova Excluída';
                    const icone = (prova && prova.tipo === 'oral') ? '🎤' : '✍️';
                    const dataObj = new Date(e.dataEntrega);
                    const horaFormatada = dataObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
                    
                    const fraudeBadge = (e.relatorioFraude && e.relatorioFraude.fugas > 0) 
                        ? `<span style="background:#fdf2f2; color:#e74c3c; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:bold; margin-left:5px;">⚠️ ${e.relatorioFraude.fugas} Ausência(s)</span>` 
                        : '';

                    return `
                        <div style="background: #fff; border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
                            <div>
                                <h4 style="margin: 0 0 5px 0; color: #2c3e50;">${icone} ${tituloProva}</h4>
                                <span style="font-size: 11px; color: #7f8c8d;">Aluno: <strong style="color:#3498db;">${e.alunoNome}</strong> | ${dataObj.toLocaleDateString('pt-BR')} às ${horaFormatada} ${fraudeBadge}</span>
                            </div>
                            <button class="ws-btn" style="background: #27ae60; padding: 8px 15px; font-size: 12px; border-radius: 20px;" onclick="Workspace.Avaliacoes.verCorrecao('${e.id}', false)">Ver Respostas</button>
                        </div>
                    `;
                }).join('');

                container.innerHTML = htmlAnalytics + htmlListaAlunos;
            }
        } catch (err) { container.innerHTML = '<div style="text-align: center; padding: 40px; color: #e74c3c;">Erro ao carregar o dashboard de analytics.</div>'; }
    },

    verMinhaCorrecao: (entregaId, avaliacaoId) => {
        const entrega = Workspace.Avaliacoes.entregasFeitas.find(e => e.id === entregaId);
        const prova = Workspace.Avaliacoes.avaliacoesDisponiveis.find(p => p.id === avaliacaoId);
        if(!entrega || !prova) return;

        Workspace.Avaliacoes.entregasEmCache = [entrega];
        Workspace.Avaliacoes.provasEmCache = { [prova.id]: prova };
        Workspace.Avaliacoes.verCorrecao(entrega.id, true);
    },

    verCorrecao: (entregaId, isAluno = false) => {
        const entrega = Workspace.Avaliacoes.entregasEmCache.find(e => e.id === entregaId);
        const prova = Workspace.Avaliacoes.provasEmCache[entrega.avaliacaoId];
        if(!entrega || !prova) return;

        let htmlRespostas = '';
        
        let htmlAuditoria = '';
        if (!isAluno && entrega.relatorioFraude && entrega.relatorioFraude.fugas > 0) {
            htmlAuditoria = `
                <div style="background: #fdf2f2; border: 1px solid #fadbd8; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="margin:0 0 5px 0; color:#c0392b;">🚨 Relatório de Auditoria (Antifraude)</h4>
                    <p style="margin:0; font-size:13px; color:#e74c3c;">O aluno mudou de separador ou minimizou o exame <strong>${entrega.relatorioFraude.fugas} vez(es)</strong>, ficando ausente da prova por um total de <strong>${entrega.relatorioFraude.tempoFora} segundos</strong>.</p>
                </div>
            `;
        }

        const respostasAluno = entrega.respostas || {};

        if(prova.tipo === 'oral') {
            const audioHtml = entrega.audioUrl 
                ? `<audio controls src="${entrega.audioUrl}" style="width: 100%; outline: none; margin-bottom: 10px;"></audio>
                   <a href="${entrega.audioUrl}" target="_blank" style="font-size:12px; color:#3498db;">Fazer Download do Áudio</a>`
                : `<div style="padding:20px; color:#e74c3c; font-weight:bold; background:#fdf2f2; border-radius:8px;">⚠️ O aluno desistiu ou abandonou a prova sem gravar áudio.</div>`;
                
            htmlRespostas = `
                ${htmlAuditoria}
                <div style="margin-top: 20px; text-align:center;">
                    ${audioHtml}
                </div>
            `;
        } else {
            htmlRespostas = `<div style="margin-top:20px; display:flex; flex-direction:column; gap:15px;">${htmlAuditoria}`;
            prova.questoes.forEach(q => {
                const respAluno = respostasAluno[q.id] || '<span style="color:#aaa;">Não respondeu (Deixou em branco)</span>';
                let validacaoHtml = '';
                let corBg = '#f9f9f9';

                if(q.tipo === 'escolha') {
                    const acertou = (respAluno === q.respostaCorreta);
                    corBg = acertou ? '#eafaf1' : '#fdf2f2';
                    validacaoHtml = acertou 
                        ? `<div style="color:#27ae60; font-size:12px; font-weight:bold; margin-top:8px;">✅ Acertou</div>` 
                        : `<div style="color:#e74c3c; font-size:12px; font-weight:bold; margin-top:8px;">❌ Errou (Correta: ${q.respostaCorreta})</div>`;
                }

                htmlRespostas += `
                    <div style="background: ${corBg}; padding: 15px; border-radius: 8px; border: 1px solid #eee;">
                        <div style="font-weight:bold; color:#2c3e50; font-size:13px; margin-bottom:8px;">${q.pergunta}</div>
                        <div style="color:#555; font-size:13px; margin-bottom:5px;"><strong>${isAluno ? 'Sua Resposta' : 'Resposta do Aluno'}:</strong><br>${respAluno}</div>
                        ${validacaoHtml}
                    </div>
                `;
            });
            htmlRespostas += `</div>`;
        }

        const tituloModal = isAluno ? "A Minha Entrega" : `Avaliação de ${entrega.alunoNome}`;
        let dataStr = "Abandonado a meio / Não Submetido";
        if (entrega.dataEntrega) {
            const dataObj = new Date(entrega.dataEntrega);
            dataStr = `${dataObj.toLocaleDateString('pt-BR')} às ${dataObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`;
        }

        const modalId = 'modal-ver-entrega';
        if(document.getElementById(modalId)) document.getElementById(modalId).remove();

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:100000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px);";
        modal.innerHTML = `
            <div class="ws-card" style="width: 90%; max-width: 700px; max-height: 85vh; overflow-y: auto; padding: 30px; position: relative;">
                <button onclick="document.getElementById('${modalId}').remove()" style="position:absolute; right:15px; top:15px; background:#eee; border:none; border-radius:50%; width:35px; height:35px; cursor:pointer; font-weight:bold; color:#333; font-size:18px;">×</button>
                <h3 style="margin: 0 0 5px 0; color: #2c3e50;">${tituloModal}</h3>
                <span style="font-size: 13px; color: #7f8c8d; font-weight:bold;">Prova: ${prova.titulo} | Entregue: ${dataStr}</span>
                ${htmlRespostas}
            </div>
        `;
        document.body.appendChild(modal);
    }
};