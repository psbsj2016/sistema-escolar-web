window.Workspace = window.Workspace || {};

// 🚀 O MOTOR ABSOLUTO DE VERIFICAÇÃO DE TURMAS (À Prova de Falhas e Fantasmas)
if (!Workspace.verificarTurma) {
    Workspace.verificarTurma = (aluno, destinoId, destinoNome) => {
        if (!aluno) return false;
        const dId = String(destinoId || '').toLowerCase().trim();
        const dNome = String(destinoNome || '').toLowerCase().trim();
        if (dId === 'global') return true;
        if (!dId && !dNome) return false;

        let turmas = [];
        const extrato = (v) => {
            if (!v) return;
            if (Array.isArray(v)) v.forEach(extrato);
            else if (typeof v === 'object') {
                if (v.id) turmas.push(String(v.id).toLowerCase().trim());
                if (v.nome) turmas.push(String(v.nome).toLowerCase().trim());
            } else turmas.push(String(v).toLowerCase().trim());
        };
        
        extrato(aluno.turmas); 
        extrato(aluno.turma); 
        extrato(aluno.turmaId); 
        extrato(aluno.turmaNome);
        
        return (dId && turmas.includes(dId)) || (dNome && turmas.includes(dNome));
    };
}

Workspace.Avaliacoes = Workspace.Avaliacoes || {};
Object.assign(Workspace.Avaliacoes, {
    avaliacoesDisponiveis: [],
    avaliacoesGerenciadorCache: [],
    entregasFeitas: [], 
    entregasEmCache: [], 
    provasEmCache: {},
    abaEscrita: 'pendentes',
    abaOral: 'pendentes',
    abaOnline: 'abertas',
    avaliacaoEmEdicao: null,
    turmasCarregadas: false, 
    contextoAtual: 'avaliacoes',

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
    monitorandoFraude: false,
    fugasCount: 0,
    tempoFora: 0,
    ultimoTick: null,
    heartbeatInterval: null,
    momentoSaidaBlur: null,
    salasNotificadas: new Set(), 

 init: () => {
        console.log("📝 Motor de Avaliações e Frequência Inteligente Ativado.");
        Workspace.Avaliacoes.injetarCSSAvaliacoes(); // 🚀 Injeta a nova barra de rolagem
        if (Workspace.usuario && Workspace.usuario.tipo === 'Aluno') {
            Workspace.Avaliacoes.carregarLobbies();
            Workspace.Avaliacoes.iniciarRadarAvaliacoes(); 
        }
    },

    injetarCSSAvaliacoes: () => {
        if (document.getElementById('ws-aval-css')) return;
        const style = document.createElement('style');
        style.id = 'ws-aval-css';
        style.innerHTML = `
            /* 🚀 BARRAS DE ROLAGEM PREMIUM PARA AS PROVAS */
            #ws-exame-foco-tela > div:nth-child(2)::-webkit-scrollbar,
            #ws-audio-foco-tela > div:nth-child(2)::-webkit-scrollbar { width: 6px; }
            #ws-exame-foco-tela > div:nth-child(2)::-webkit-scrollbar-track,
            #ws-audio-foco-tela > div:nth-child(2)::-webkit-scrollbar-track { background: transparent; }
            #ws-exame-foco-tela > div:nth-child(2)::-webkit-scrollbar-thumb,
            #ws-audio-foco-tela > div:nth-child(2)::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        `;
        document.head.appendChild(style);
    },

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
            // Se não for sessão online, não estiver ativa ou não tiver data, o sistema ignora
            if (a.tipo !== 'online' || a.status !== 'ativa' || !a.dataAgendada) return;

            const destinoLimpo = a.destino ? String(a.destino).toLowerCase().trim() : 'global';
            const destinoNomeLimpo = a.destinoNome ? String(a.destinoNome).toLowerCase().trim() : '';
            
            // ========================================================================
            // 🚀 A NOVA LÓGICA VIP: Verifica se o aluno logado foi convidado!
            // ========================================================================
            let souConvidado = false;
            if (a.convidados && Array.isArray(a.convidados)) {
                // O método .some() varre a lista e retorna "true" se encontrar um ID igual
                souConvidado = a.convidados.some(c => String(c.id) === String(Workspace.usuario.id));
            }

            // O Aluno recebe o aviso se for da Turma (isParaMim base) OU se for convidado VIP (souConvidado)
            const isParaMim = destinoLimpo === 'global' || turmasSeguras.includes(destinoLimpo) || (destinoNomeLimpo && turmasSeguras.includes(destinoNomeLimpo)) || souConvidado;

            if (isParaMim) {
                const dataSala = new Date(a.dataAgendada);
                const diffMinutos = (dataSala - agora) / (1000 * 60);

                // O alerta soa quando faltam entre 10 minutos e 0 minutos
                if (diffMinutos > 0 && diffMinutos <= 10) {
                    if (!Workspace.Avaliacoes.salasNotificadas.has(a.id)) {
                        Workspace.Avaliacoes.salasNotificadas.add(a.id); 
                        const min = Math.ceil(diffMinutos);
                        Workspace.mostrarAviso(`⏰ PREPARE-SE: A sessão ao vivo "${a.titulo}" começará em ${min} minutos!`, "warning", 10000);
                        
                        // Também cria uma notificação na aba do sininho para o aluno não esquecer
                        if (Workspace.Alertas && Workspace.Alertas.notificacoesAtuais) {
                            const idLocal = 'alerta_local_' + a.id;
                            if (!Workspace.Alertas.idsConhecidos.has(idLocal)) {
                                const novaNoti = { 
                                    id: idLocal, 
                                    remetenteNome: '🖥️ AULA AO VIVO', 
                                    mensagem: `A sessão "${a.titulo}" começa em ${min} minutos. Prepare-se para entrar na aula. Vá para a <strong>Sala de Acessos</strong>.`, 
                                    data: new Date().toISOString(), 
                                    origem: 'online', 
                                    origemId: a.id, 
                                    destinoNome: a.destinoNome 
                                };
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
                // 🚀 DESTRUIDOR DE CACHE: O timestamp ?_t= força o navegador a buscar os dados reais
                const resAval = await Workspace.api(`/workspace/avaliacoes?escolaId=${Workspace.usuario.escolaId}&_t=${Date.now()}`, 'GET');
                if (resAval && resAval.success) {
                    const avaliacoesNovas = resAval.avaliacoes;
                    const idAtivo = Workspace.Avaliacoes.exameAtivo || Workspace.Avaliacoes.estudioAtivo;
                    
                    Workspace.Avaliacoes.verificarSalasProximas(avaliacoesNovas);

                    if (idAtivo) {
                        const provaAtualizada = avaliacoesNovas.find(a => a.id === idAtivo);
                        
                        
                        // 🚀 LÓGICA BLINDADA DE TURMAS: Usa o Motor Absoluto!
                        let isParaMim = false;
                        if (provaAtualizada) {
                            isParaMim = Workspace.verificarTurma(Workspace.usuario, provaAtualizada.destino, provaAtualizada.destinoNome);
                        }
                        
                        if (!provaAtualizada || provaAtualizada.status !== 'ativa' || !isParaMim) {
                            Workspace.Avaliacoes.expulsarAluno("O professor encerrou ou ocultou esta avaliação. A sua sessão foi interrompida.");
                        } else {
                            const provaVelha = Workspace.Avaliacoes.avaliacoesDisponiveis.find(a => a.id === idAtivo);
                            if (provaVelha && provaAtualizada.ultimaAtualizacao !== provaVelha.ultimaAtualizacao) {
                                Workspace.Avaliacoes.expulsarAluno("O professor atualizou as perguntas ou instruções deste teste. Por favor, inicie-o novamente para ver as alterações.");
                            }
                        }
                    }

                    const hashAntigo = JSON.stringify(Workspace.Avaliacoes.avaliacoesDisponiveis);
                    const hashNovo = JSON.stringify(avaliacoesNovas);
                    let precisaAtualizar = (hashAntigo !== hashNovo);

                    if (precisaAtualizar) {
                        Workspace.Avaliacoes.avaliacoesDisponiveis = avaliacoesNovas;
                    }

                   // 🚀 INTELIGÊNCIA MÁXIMA: O Radar agora trabalha para o Aluno E para o Professor!
                    if (Workspace.usuario.tipo === 'Aluno') {
                        const resEntregas = await Workspace.api(`/workspace/avaliacoes/minhas-entregas/${Workspace.usuario.id}?_t=${Date.now()}`, 'GET');
                        if (resEntregas && resEntregas.success) {
                            const hashEntregasAntigo = JSON.stringify(Workspace.Avaliacoes.entregasFeitas);
                            const hashEntregasNovo = JSON.stringify(resEntregas.entregas);
                            if (hashEntregasAntigo !== hashEntregasNovo) {
                                Workspace.Avaliacoes.entregasFeitas = resEntregas.entregas;
                                precisaAtualizar = true; 
                            }
                        }
                    } else {
                        // 🚀 O NOVO SENSOR DO PROFESSOR: Verifica se o painel de Gestão está aberto na tela
                        const painelAberto = document.getElementById('ws-prof-gerir-lista-container');
                        if (painelAberto && painelAberto.style.display !== 'none') {
                            
                            // Vai à nuvem perguntar silenciosamente se houve novos cliques de alunos
                            const resEntregas = await Workspace.api(`/workspace/avaliacoes/entregas?_t=${Date.now()}`, 'GET');
                            if (resEntregas && resEntregas.success) {
                                
                                // Compara se a quantidade/IDs de acessos mudou em relação ao que está na tela
                                const hashAntigo = JSON.stringify(Workspace.Avaliacoes.entregasEmCache);
                                const hashNovo = JSON.stringify(resEntregas.entregas);
                                
                                if (hashAntigo !== hashNovo) {
                                    // Se alguém entrou, atualiza a memória e muda a cor da Sala e os Números na hora!
                                    Workspace.Avaliacoes.entregasEmCache = resEntregas.entregas;
                                    Workspace.Avaliacoes.renderizarListaGerenciador(); 
                                    
                                    // Se a janelinha preta de "Acessos" estiver aberta por cima, atualiza-a também sem piscar!
                                    if (Workspace.Avaliacoes.modalAcessosAberto) {
                                        Workspace.Avaliacoes.abrirModalAcessos(Workspace.Avaliacoes.modalAcessosAberto.avaliacaoId, Workspace.Avaliacoes.modalAcessosAberto.destinoId, true);
                                    }
                                }
                            }
                        }
                    }

                    if (precisaAtualizar && !idAtivo && Workspace.usuario.tipo === 'Aluno') {
                        Workspace.Avaliacoes.renderizarLobbies();
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

    mudarAbaEscrita: (aba, restauro = false) => { 
        if(!restauro) localStorage.setItem('ws_aba_avaliacoes_escrita', aba);
        Workspace.Avaliacoes.abaEscrita = aba; Workspace.Avaliacoes.renderizarLobbies(); 
    },
    mudarAbaOral: (aba, restauro = false) => { 
        if(!restauro) localStorage.setItem('ws_aba_avaliacoes_oral', aba);
        Workspace.Avaliacoes.abaOral = aba; Workspace.Avaliacoes.renderizarLobbies(); 
    },
    mudarAbaOnline: (aba, restauro = false) => { 
        if(!restauro) localStorage.setItem('ws_aba_avaliacoes_online', aba);
        Workspace.Avaliacoes.abaOnline = aba; Workspace.Avaliacoes.renderizarLobbies(); 
    },

    registrarPresencaOnline: async (event, id, link) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        if (link && link !== '#') {
            window.open(link, '_blank', 'noopener,noreferrer');
        } else {
            Workspace.mostrarAviso("Nenhum link foi fornecido para esta sessão.", "warning");
            return;
        }
        
        try {
            const resInic = await Workspace.api(`/workspace/avaliacoes/${id}/iniciar`, 'POST', { alunoId: Workspace.usuario.id, alunoNome: Workspace.usuario.nome || Workspace.usuario.login });
            if (resInic && resInic.success) {
                await Workspace.api(`/workspace/avaliacoes/${id}/entregar`, 'POST', { respostas: {}, alunoId: Workspace.usuario.id, alunoNome: Workspace.usuario.nome || Workspace.usuario.login, relatorioFraude: { fugas: 0, tempoFora: 0 }, entregaId: resInic.entregaId });
                Workspace.Avaliacoes.carregarLobbies();
            }
        } catch(e) { console.log("Erro ao registar a presença silenciosa.", e); }
    },

    renderizarLobbies: () => {
        let minhasTurmas = [];
        const u = Workspace.usuario;
        if (u.turmas) minhasTurmas = minhasTurmas.concat(u.turmas);
        if (u.turma) minhasTurmas = minhasTurmas.concat(u.turma);
        if (u.turmaId) minhasTurmas = minhasTurmas.concat(u.turmaId);
        if (u.turmaNome) minhasTurmas = minhasTurmas.concat(u.turmaNome);
        
        const turmasSeguras = minhasTurmas.filter(t => t).map(t => String(t.id || t).toLowerCase().trim());

     const avalAtivas = Workspace.Avaliacoes.avaliacoesDisponiveis.filter(a => {
            if (a.tipo !== 'online' && a.status !== 'ativa') return false;
            
            // 🚀 A BARREIRA DE OCULTAMENTO
            const meuIdLogin = String(Workspace.usuario.id);
            const meuIdMatricula = Workspace.usuario.alunoRefId ? String(Workspace.usuario.alunoRefId) : meuIdLogin;
            if (a.ocultos && (a.ocultos.includes(meuIdLogin) || a.ocultos.includes(meuIdMatricula))) return false; 
            
            // 🚀 O FILTRO ABSOLUTO DE TURMA E VIP
            const souConvidado = a.convidados && a.convidados.some(c => String(c.id) === String(Workspace.usuario.id));
            return Workspace.verificarTurma(Workspace.usuario, a.destino, a.destinoNome) || souConvidado;
        });

        const escritas = avalAtivas.filter(a => a.tipo === 'escrita');
        const orais = avalAtivas.filter(a => a.tipo === 'oral');
        const onlines = avalAtivas.filter(a => a.tipo === 'online'); 

        const entregasCount = {};
        Workspace.Avaliacoes.entregasFeitas.forEach(e => { entregasCount[e.avaliacaoId] = (entregasCount[e.avaliacaoId] || 0) + 1; });

        // ESCRITAS
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
                        ${Workspace.Avaliacoes.abaEscrita === 'pendentes' ? `<button class="ws-btn" style="background: #3498db; padding: 8px 15px; font-size: 12px; border-radius: 20px;" onclick="Workspace.Avaliacoes.iniciarExame('${p.id}')">Iniciar Exame</button>` : `<button class="ws-btn" style="background: #27ae60; padding: 8px 15px; font-size: 12px; border-radius: 20px;" onclick="Workspace.Avaliacoes.verMinhaCorrecao('${ultimaEntrega?.id}', '${p.id}')">Ver Respostas</button>`}
                    </div>`}).join('');
            }
        }

        // ORAIS
        const orPendentes = orais.filter(a => (entregasCount[a.id] || 0) < (a.tentativas || 1));
        const orConcluidas = orais.filter(a => (entregasCount[a.id] || 0) >= (a.tentativas || 1));
        const tOrPend = document.getElementById('tab-oral-pendentes');
        const tOrConc = document.getElementById('tab-oral-concluidas');
        if (tOrPend && tOrConc) {
            tOrPend.innerText = `Aguardando Gravação (${orPendentes.length})`;
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
                            <span style="font-size: 11px; color: #7f8c8d;">🔊 Áudio | 🔄 ${textTentativa}</span>
                        </div>
                        ${Workspace.Avaliacoes.abaOral === 'pendentes' ? `<button class="ws-btn" style="background: #3498db; padding: 8px 15px; font-size: 12px; border-radius: 20px;" onclick="Workspace.Avaliacoes.iniciarTesteOral('${p.id}')">Ir ao Estúdio</button>` : `<button class="ws-btn" style="background: #27ae60; padding: 8px 15px; font-size: 12px; border-radius: 20px;" onclick="Workspace.Avaliacoes.verMinhaCorrecao('${ultimaEntrega?.id}', '${p.id}')">Ouvir Gravação</button>`}
                    </div>`}).join('');
            }
        }

       // ONLINES
        // 🚀 O ROTEADOR INTELIGENTE: Se a sessão está ativa e o aluno não esgotou tentativas, fica em "Links Ativos"
        const onPendentes = onlines.filter(a => a.status === 'ativa' && (entregasCount[a.id] || 0) < (a.tentativas || 1));
        // Se a sessão foi arquivada pelo gestor OU o aluno já entrou, vai direto para o "Histórico"
        const onHistorico = onlines.filter(a => a.status !== 'ativa' || (entregasCount[a.id] || 0) >= (a.tentativas || 1));
        
        // 🚀 INTELIGÊNCIA DO ALUNO (Salto Dinâmico)
        Workspace.Avaliacoes.qtdPendentesAnterior = Workspace.Avaliacoes.qtdPendentesAnterior || 0;
        
        if (onPendentes.length > Workspace.Avaliacoes.qtdPendentesAnterior) {
            Workspace.Avaliacoes.abaOnline = 'abertas'; 
        }
        Workspace.Avaliacoes.qtdPendentesAnterior = onPendentes.length;

        const tOnPend = document.getElementById('tab-online-abertas');
        const tOnHist = document.getElementById('tab-online-historico');
        if (tOnPend && tOnHist) {
            tOnPend.innerText = `Links Ativos (${onPendentes.length})`;
            tOnPend.style.background = Workspace.Avaliacoes.abaOnline === 'abertas' ? '#2c3e50' : 'transparent';
            tOnPend.style.color = Workspace.Avaliacoes.abaOnline === 'abertas' ? 'white' : '#7f8c8d';
            tOnHist.innerText = `Histórico (${onHistorico.length})`;
            tOnHist.style.background = Workspace.Avaliacoes.abaOnline === 'historico' ? '#2c3e50' : 'transparent';
            tOnHist.style.color = Workspace.Avaliacoes.abaOnline === 'historico' ? 'white' : '#7f8c8d';
        }
   const contOnline = document.getElementById('ws-lista-provas-online');
        if (contOnline) {
            const listaAtivaOnline = Workspace.Avaliacoes.abaOnline === 'abertas' ? onPendentes : onHistorico;
            if (listaAtivaOnline.length === 0) {
                contOnline.innerHTML = `<div style="text-align: center; padding: 40px; color: #7f8c8d;">Nenhuma sessão nesta lista.</div>`;
            } else {
                contOnline.innerHTML = listaAtivaOnline.map(p => {
                    // 🚀 LEITURA MANUAL DA DATA E HORA
                    let dataFormatada = 'Carregando a data e o horário... ⏳';
                    let horaFormatada = '';

                    if (p.dataAgendada && p.dataAgendada.includes('T')) {
                        const partes = p.dataAgendada.split('T');
                        const dataPartes = partes[0].split('-');
                        if (dataPartes.length === 3) {
                            dataFormatada = `${dataPartes[2]}/${dataPartes[1]}/${dataPartes[0]}`;
                            horaFormatada = partes[1].substring(0, 5);
                        }
                    }

                    // 🚀 TRATAMENTO DO LINK SEGURO
                    let linkSeguro = p.linkSala || '#';
                    if (linkSeguro !== '#' && !linkSeguro.startsWith('http')) linkSeguro = 'https://' + linkSeguro;
                    
                    const publicoAlvo = p.destinoNome || 'Global';

                    // 🚀 BOTÃO PROTEGIDO COM event.stopPropagation() E linkSeguro
                    const btnAcao = Workspace.Avaliacoes.abaOnline === 'abertas' 
                        ? `<button type="button" class="ws-btn" style="background: #8e44ad; padding: 8px 15px; font-size: 12px; border-radius: 20px; color: white; border: none; cursor: pointer;" onclick="event.stopPropagation(); Workspace.Avaliacoes.registrarPresencaOnline(event, '${p.id}', '${linkSeguro}')">Entrar na Sessão</button>` 
                        : `<span style="background: #f0f2f5; color: #7f8c8d; padding: 8px 15px; font-size: 12px; border-radius: 20px; font-weight: bold;">Sessão Concluída</span>`;
                    
                    return `
                    <div style="background: #fff; border: 1px solid #eee; border-left: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                        <div>
                            <h4 style="margin: 0 0 5px 0; color: #2c3e50;">${p.titulo}</h4>
                            <div style="display: flex; gap: 10px; align-items: center; margin-top: 5px;">
                                <span style="font-size: 12px; color: #8e44ad; font-weight: bold;">📅 ${dataFormatada}  ${horaFormatada}</span>
                                <span style="font-size: 10px; color: #7f8c8d; font-weight: bold; background: #f0f2f5; padding: 3px 8px; border-radius: 12px;">👥 ${publicoAlvo}</span>
                            </div>
                        </div>
                        ${btnAcao}
                    </div>`}).join('');
            }
        }
    },

    abrirSalasOnlineAluno: async (btn) => {
        const txtOriginal = btn.innerText; btn.innerText = "Preparando o ambiente... ⏳";
        await Workspace.Avaliacoes.carregarLobbies(); 
        Workspace.navegarPara('avaliacoes_online'); btn.innerText = txtOriginal;
    },

  iniciarExame: async (id) => {
        const examen = Workspace.Avaliacoes.avaliacoesDisponiveis.find(a => a.id === id);
        if(!examen) return;
        
        Workspace.mostrarAviso("Preparando um ambiente seguro... ⏳", "info");
        try {
            const res = await Workspace.api(`/workspace/avaliacoes/${id}/iniciar`, 'POST', { alunoId: Workspace.usuario.id, alunoNome: Workspace.usuario.nome || Workspace.usuario.login });
            if (res && res.success) {
                Workspace.Avaliacoes.tentativaAtivaId = res.entregaId;
                
                // 🚀 ESCUDO 1: Garante que as questões existem para não quebrar o ecrã
                const questoesSeguras = examen.questoes || [];
                Workspace.Avaliacoes.entrarModoFoco(examen.id, examen.titulo || 'Exame', examen.tempo, questoesSeguras);
            } else { 
                Workspace.mostrarAviso(res.error || "Limite de tentativas esgotado.", "error"); 
                Workspace.Avaliacoes.carregarLobbies(); 
            }
        } catch (e) { 
            // 🚀 TIRAR A MÁSCARA: O erro real aparece no console do navegador
            console.error("🚨 Erro Crítico ao iniciar Exame Escrito:", e);
            Workspace.mostrarAviso("Falha ao abrir a interface da prova. Estrutura ausente.", "error"); 
        }
    },

    entrarModoFoco: (exameId, titulo, duracaoMinutos, questoes = []) => {
        try {
            Workspace.Avaliacoes.exameAtivo = exameId; 
            
            // 🚀 ESCUDOS DE INTERFACE
            const elTitulo = document.getElementById('ws-exame-titulo');
            if (elTitulo) elTitulo.innerText = titulo; 
            
            document.body.style.overflow = 'hidden'; 
            
            const tela = document.getElementById('ws-exame-foco-tela'); 
            if (tela) {
                // 🚀 NOVA ARQUITETURA VISUAL (FLEXBOX): O cabeçalho fica preso, as questões rolam!
                tela.style.display = 'flex'; 
                tela.style.flexDirection = 'column';
                tela.style.height = '100dvh'; // Respeita a barra de navegação dos telemóveis
                tela.style.maxHeight = '100dvh';
                tela.style.overflow = 'hidden'; // Impede o ecrã inteiro de rolar

                const header = tela.firstElementChild;
                if (header) {
                    header.style.position = 'relative'; // Remove o sticky que falha em mobile
                    header.style.flexShrink = '0'; // O cabeçalho nunca encolhe
                    header.style.zIndex = '20';
                    header.style.boxShadow = '0 4px 10px rgba(0,0,0,0.05)';
                }

                const areaConteudo = tela.children[1];
                if (areaConteudo) {
                    areaConteudo.style.flex = '1'; // Preenche o resto do ecrã
                    areaConteudo.style.overflowY = 'auto'; // 🚀 A BARRA DE ROLAGEM NASCE AQUI
                    areaConteudo.style.width = '100%';
                    areaConteudo.style.paddingBottom = '80px'; // Espaço extra para respirar no final
                    areaConteudo.style.boxSizing = 'border-box';
                    areaConteudo.scrollTop = 0; // Volta ao topo para cada prova
                }
            } else {
                console.warn("⚠️ Aviso: O elemento 'ws-exame-foco-tela' não existe no HTML.");
            }

            const rascunho = localStorage.getItem(`ws_exame_draft_${exameId}`);
            if(rascunho) Workspace.Avaliacoes.respostas = JSON.parse(rascunho); else Workspace.Avaliacoes.respostas = {};
            
            Workspace.Avaliacoes.renderizarQuestoes(questoes);
            
            const elCronometro = document.getElementById('ws-exame-cronometro');
            if(duracaoMinutos) {
                Workspace.Avaliacoes.iniciarCronometro(duracaoMinutos * 60); 
            } else if (elCronometro) {
                elCronometro.innerText = "LIVRE";
            }
            
            Workspace.Avaliacoes.iniciarSensorFraude(); 
        } catch (e) {
            console.error("🚨 Erro Crítico no Modo Foco:", e);
            Workspace.mostrarAviso("Falha ao preparar o ambiente da prova.", "error");
        }
    },

    renderizarQuestoes: (questoes) => {
        const area = document.getElementById('ws-exame-questoes-area'); 
        
        // 🚀 ESCUDO VITAL: Se a área de perguntas não existir, aborta para não crashar
        if (!area) {
            console.error("🚨 Erro: O elemento 'ws-exame-questoes-area' não foi encontrado.");
            return;
        }

        let html = '';
        questoes.forEach(q => {
            let htmlResposta = ''; const respostaSalva = Workspace.Avaliacoes.respostas[q.id] || '';
            if (q.tipo === 'escolha') {
                htmlResposta = `<div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">`;
                q.opcoes.forEach((opcao) => {
                    const selecionado = respostaSalva === opcao;
                    htmlResposta += `<label style="background: ${selecionado ? '#e8f4f8' : '#f9f9f9'}; border: 2px solid ${selecionado ? '#3498db' : '#eee'}; padding: 15px; border-radius: 8px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 10px; font-size: 14px;"><input type="radio" name="questao_${q.id}" value="${opcao}" ${selecionado ? 'checked' : ''} onchange="Workspace.Avaliacoes.registarResposta('${q.id}', this.value)" style="transform: scale(1.3); margin:0;"><span style="color: #2c3e50; font-weight: 500;">${opcao}</span></label>`;
                });
                htmlResposta += `</div>`;
            } else { 
                htmlResposta = `<div style="margin-top: 15px;"><textarea rows="6" placeholder="Digite a resposta..." style="width: 100%; padding: 15px; border-radius: 8px; border: 2px solid #eee; font-family: inherit; font-size: 14px; outline: none; box-sizing: border-box; resize: vertical;" oninput="Workspace.Avaliacoes.registarResposta('${q.id}', this.value)">${respostaSalva}</textarea></div>`; 
            }
            html += `<div class="ws-card" style="margin-bottom: 25px; border-left: 4px solid #3498db; box-shadow: 0 5px 20px rgba(0,0,0,0.04);"><h3 style="margin: 0; color: #2c3e50; font-size: 16px; line-height: 1.5;">${q.pergunta}</h3>${htmlResposta}</div>`;
        });
        area.innerHTML = html;
    },

    registarResposta: (questaoId, valor) => { Workspace.Avaliacoes.respostas[questaoId] = valor; localStorage.setItem(`ws_exame_draft_${Workspace.Avaliacoes.exameAtivo}`, JSON.stringify(Workspace.Avaliacoes.respostas)); },
    
    guardarRascunhoManual: () => { const btn = event.target; const textoOriginal = btn.innerText; btn.innerText = "✅ Guardado!"; setTimeout(() => btn.innerText = textoOriginal, 2000); },
    
    iniciarCronometro: (totalSegundos) => {
        if(Workspace.Avaliacoes.cronometroInterval) clearInterval(Workspace.Avaliacoes.cronometroInterval);
        Workspace.Avaliacoes.segundosRestantes = totalSegundos; const visor = document.getElementById('ws-exame-cronometro');
        Workspace.Avaliacoes.cronometroInterval = setInterval(() => {
            Workspace.Avaliacoes.segundosRestantes--; const s = Workspace.Avaliacoes.segundosRestantes;
            if (s <= 0) { clearInterval(Workspace.Avaliacoes.cronometroInterval); if(visor) visor.innerText = "00:00:00"; Workspace.mostrarAviso("O tempo esgotou! Prova entregue automaticamente.", "warning"); Workspace.Avaliacoes.finalizarExame(true); return; }
            if(visor) visor.innerText = `${Math.floor(s / 3600).toString().padStart(2, '0')}:${Math.floor((s % 3600) / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
        }, 1000);
    },
    
    sairDoExame: () => { Workspace.Avaliacoes.confirmarDialog("Abandonar Prova?", "⚠️ A sua tentativa já foi registada no servidor. Se desistir ou sair da página, perderá esta chance de avaliação! Deseja mesmo sair?", "Sim, desistir", "#e74c3c", () => { document.body.style.overflow = ''; const tela = document.getElementById('ws-exame-foco-tela'); if(tela) tela.style.display = 'none'; if(Workspace.Avaliacoes.cronometroInterval) clearInterval(Workspace.Avaliacoes.cronometroInterval); Workspace.Avaliacoes.pararSensorFraude(); Workspace.Avaliacoes.exameAtivo = null; Workspace.Avaliacoes.carregarLobbies(); }); },
    
    finalizarExame: (forcar = false) => {
        const processarEntrega = async () => {
            Workspace.mostrarAviso("Entregando avaliação... ⏳", "info"); const relatorio = Workspace.Avaliacoes.pararSensorFraude();
            try {
                const res = await Workspace.api(`/workspace/avaliacoes/${Workspace.Avaliacoes.exameAtivo}/entregar`, 'POST', { respostas: Workspace.Avaliacoes.respostas, alunoId: Workspace.usuario.id, alunoNome: Workspace.usuario.nome || Workspace.usuario.login, relatorioFraude: relatorio, entregaId: Workspace.Avaliacoes.tentativaAtivaId });
                if(res && res.success) { 
                    Workspace.mostrarAviso("Avaliação entregue com sucesso! 🎉", "success"); 
                    localStorage.removeItem(`ws_exame_draft_${Workspace.Avaliacoes.exameAtivo}`); 
                    document.body.style.overflow = ''; 
                    const tela = document.getElementById('ws-exame-foco-tela'); 
                    if(tela) tela.style.display = 'none'; 
                    if(Workspace.Avaliacoes.cronometroInterval) clearInterval(Workspace.Avaliacoes.cronometroInterval); 
                    Workspace.Avaliacoes.exameAtivo = null; 
                    Workspace.Avaliacoes.carregarLobbies(); 
                } else throw new Error();
            } catch(e) { Workspace.mostrarAviso("Erro ao entregar a prova.", "error"); }
        };
        if (forcar) processarEntrega(); else Workspace.Avaliacoes.confirmarDialog("Finalizar Avaliação", "Deseja entregar a prova definitivamente? Não poderá alterar as respostas depois.", "Entregar Agora", "#27ae60", processarEntrega);
    },

   iniciarTesteOral: async (id) => {
        const teste = Workspace.Avaliacoes.avaliacoesDisponiveis.find(a => a.id === id); 
        if(!teste) return;
        
        Workspace.mostrarAviso("Preparando estúdio... ⏳", "info");
        try {
            const res = await Workspace.api(`/workspace/avaliacoes/${id}/iniciar`, 'POST', { alunoId: Workspace.usuario.id, alunoNome: Workspace.usuario.nome || Workspace.usuario.login });
            if (res && res.success) { 
                Workspace.Avaliacoes.tentativaAtivaId = res.entregaId; 
                Workspace.Avaliacoes.estudioAtivo = teste.id; 
                
                const elTitulo = document.getElementById('ws-audio-titulo');
                const elPergunta = document.getElementById('ws-audio-pergunta');
                const elTela = document.getElementById('ws-audio-foco-tela');

                if (elTitulo) elTitulo.innerText = teste.titulo || 'Teste Oral'; 
                if (elPergunta) elPergunta.innerText = teste.instrucoes || 'Leia as instruções e grave.'; 
                
                document.body.style.overflow = 'hidden'; 
                
                // 🚀 BLINDAGEM MÁXIMA E NOVA ARQUITETURA FOCADA (FLEXBOX)
                if (elTela) {
                    elTela.style.display = 'flex'; 
                    elTela.style.flexDirection = 'column';
                    elTela.style.height = '100dvh';
                    elTela.style.maxHeight = '100dvh';
                    elTela.style.overflow = 'hidden';
                    
                    const header = elTela.firstElementChild;
                    if (header) {
                        header.style.position = 'relative';
                        header.style.flexShrink = '0';
                        header.style.zIndex = '20';
                        header.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
                    }

                    const areaConteudo = elTela.children[1];
                    if (areaConteudo) {
                        areaConteudo.style.flex = '1';
                        areaConteudo.style.overflowY = 'auto'; // 🚀 Barra de rolagem independente
                        areaConteudo.style.width = '100%';
                        areaConteudo.style.paddingBottom = '80px';
                        areaConteudo.style.boxSizing = 'border-box';
                        areaConteudo.scrollTop = 0;
                    }
                } else {
                    console.error("🚨 Erro Crítico: O elemento 'ws-audio-foco-tela' não existe no HTML.");
                    Workspace.mostrarAviso("A estrutura visual do estúdio está em falta na página.", "error");
                    return; // 🛑 TRAVÃO DE EMERGÊNCIA AQUI
                }

                Workspace.Avaliacoes.resetarInterfaceDeAudio(); 
                Workspace.Avaliacoes.iniciarSensorFraude(); 
            } else { 
                Workspace.mostrarAviso(res.error || "Limite de tentativas esgotado.", "error"); 
                Workspace.Avaliacoes.carregarLobbies(); 
            }
        } catch (e) { 
            console.error("🚨 Erro interno ao iniciar Estúdio de Áudio:", e);
            Workspace.mostrarAviso("Falha ao abrir o estúdio. Estrutura ausente.", "error"); 
        }
    },

    resetarInterfaceDeAudio: () => { 
        const areaGravacao = document.getElementById('ws-area-gravacao');
        const areaPlayer = document.getElementById('ws-area-player');
        const btnIniciar = document.getElementById('ws-btn-iniciar-gravacao');
        const btnParar = document.getElementById('ws-btn-parar-gravacao');
        const cronometro = document.getElementById('ws-audio-cronometro');
        const micRing = document.getElementById('ws-mic-ring');

        if (areaGravacao) areaGravacao.style.display = 'block'; 
        if (areaPlayer) areaPlayer.style.display = 'none'; 
        if (btnIniciar) btnIniciar.style.display = 'inline-block'; 
        if (btnParar) btnParar.style.display = 'none'; 
        
        if (cronometro) {
            cronometro.innerText = '00:00'; 
            cronometro.style.color = '#fff'; 
        }
        if (micRing) {
            micRing.style.borderColor = 'rgba(255,255,255,0.2)'; 
            micRing.style.background = 'rgba(255,255,255,0.05)'; 
        }
        
        Workspace.Avaliacoes.audioBlob = null; 
        Workspace.Avaliacoes.audioChunks = []; 
    },

    // 🚀 RESTAURAÇÃO: A Função que tinha sumido foi trazida de volta e blindada!
    iniciarGravacao: async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); 
            Workspace.Avaliacoes.streamMicrofone = stream; 
            Workspace.Avaliacoes.mediaRecorder = new MediaRecorder(stream); 
            Workspace.Avaliacoes.audioChunks = [];
            
            Workspace.Avaliacoes.mediaRecorder.ondataavailable = (e) => { 
                if (e.data.size > 0) Workspace.Avaliacoes.audioChunks.push(e.data); 
            };
            
            Workspace.Avaliacoes.mediaRecorder.onstop = () => { 
                Workspace.Avaliacoes.audioBlob = new Blob(Workspace.Avaliacoes.audioChunks, { type: 'audio/webm' }); 
                
                const preview = document.getElementById('ws-audio-preview');
                if (preview) preview.src = URL.createObjectURL(Workspace.Avaliacoes.audioBlob); 
                
                const areaGravacao = document.getElementById('ws-area-gravacao');
                const areaPlayer = document.getElementById('ws-area-player');
                
                if (areaGravacao) areaGravacao.style.display = 'none'; 
                if (areaPlayer) areaPlayer.style.display = 'block'; 
                
                if (Workspace.Avaliacoes.streamMicrofone) {
                    Workspace.Avaliacoes.streamMicrofone.getTracks().forEach(t => t.stop()); 
                }
            };
            
            Workspace.Avaliacoes.mediaRecorder.start(); 
            
            const btnIniciar = document.getElementById('ws-btn-iniciar-gravacao');
            const btnParar = document.getElementById('ws-btn-parar-gravacao');
            const micRing = document.getElementById('ws-mic-ring');
            const cronometro = document.getElementById('ws-audio-cronometro');

            if (btnIniciar) btnIniciar.style.display = 'none'; 
            if (btnParar) btnParar.style.display = 'inline-block'; 
            if (micRing) {
                micRing.style.borderColor = '#e74c3c'; 
                micRing.style.background = 'rgba(231, 76, 60, 0.2)'; 
            }
            if (cronometro) cronometro.style.color = '#e74c3c'; 
            
            Workspace.Avaliacoes.segundosGravados = 0; 
            if(Workspace.Avaliacoes.gravacaoInterval) clearInterval(Workspace.Avaliacoes.gravacaoInterval);
            
            Workspace.Avaliacoes.gravacaoInterval = setInterval(() => { 
                Workspace.Avaliacoes.segundosGravados++; 
                if (cronometro) {
                    cronometro.innerText = `${Math.floor(Workspace.Avaliacoes.segundosGravados / 60).toString().padStart(2, '0')}:${(Workspace.Avaliacoes.segundosGravados % 60).toString().padStart(2, '0')}`; 
                }
                if(Workspace.Avaliacoes.segundosGravados >= 600) { 
                    Workspace.Avaliacoes.pararGravacao(); 
                    Workspace.mostrarAviso("Tempo máximo atingido.", "info"); 
                } 
            }, 1000);
        } catch (err) { 
            console.error("Erro no microfone:", err);
            Workspace.mostrarAviso("Microfone bloqueado. Verifique as permissões.", "error"); 
        }
    },

    pararGravacao: () => { if (Workspace.Avaliacoes.mediaRecorder && Workspace.Avaliacoes.mediaRecorder.state === 'recording') { Workspace.Avaliacoes.mediaRecorder.stop(); if(Workspace.Avaliacoes.gravacaoInterval) clearInterval(Workspace.Avaliacoes.gravacaoInterval); } },
    
    descartarAudio: () => { Workspace.Avaliacoes.confirmarDialog("Apagar Áudio", "Deseja apagar esta gravação e começar de novo?", "Apagar e Regravar", "#e74c3c", Workspace.Avaliacoes.resetarInterfaceDeAudio); },
    
    enviarAudio: async () => {
        if (!Workspace.Avaliacoes.audioBlob) return; 
        const btn = document.getElementById('ws-btn-enviar-audio'); 
        if(btn) { btn.innerText = "Enviando... ⏳"; btn.disabled = true; }
        
        const relatorio = Workspace.Avaliacoes.pararSensorFraude(); 
        try {
            const formData = new FormData(); 
            formData.append('anexos', new File([Workspace.Avaliacoes.audioBlob], `oral_${Date.now()}.webm`, { type: 'audio/webm' })); 
            
            const uploadRes = await fetch('/api/workspace/upload', { method: 'POST', credentials: 'include', body: formData }); 
            const uploadData = await uploadRes.json();
            
            if (!uploadData.success || !uploadData.anexos) throw new Error("Falha no upload."); 
            const audioUrlFinal = uploadData.anexos[0].url;
            
            const res = await Workspace.api(`/workspace/avaliacoes/${Workspace.Avaliacoes.estudioAtivo}/entregar`, 'POST', { audioUrl: audioUrlFinal, alunoId: Workspace.usuario.id, alunoNome: Workspace.usuario.nome || Workspace.usuario.login, relatorioFraude: relatorio, entregaId: Workspace.Avaliacoes.tentativaAtivaId });
            
            if (res && res.success) { 
                Workspace.mostrarAviso("Áudio enviado com sucesso!", "success"); 
                document.body.style.overflow = ''; 
                const tela = document.getElementById('ws-audio-foco-tela');
                if (tela) tela.style.display = 'none'; 
                Workspace.Avaliacoes.estudioAtivo = null; 
                Workspace.Avaliacoes.carregarLobbies(); 
            } else {
                throw new Error("Erro no backend.");
            }
        } catch(e) { 
            Workspace.mostrarAviso("Falha ao enviar o áudio.", "error"); 
        } finally { 
            if(btn) { btn.innerText = "📤 Enviar Áudio"; btn.disabled = false; }
        }
    },

    sairDoEstudio: () => {
        const mensagemSair = "⚠️ A sua tentativa já foi registada. Se sair, perderá a chance de avaliação. Deseja mesmo sair?";
        Workspace.Avaliacoes.confirmarDialog("Sair do Estúdio", mensagemSair, "Sim, Desistir", "#e74c3c", () => {
            if (Workspace.Avaliacoes.mediaRecorder && Workspace.Avaliacoes.mediaRecorder.state === 'recording') {
                Workspace.Avaliacoes.pararGravacao();
            }
            Workspace.Avaliacoes.pararSensorFraude(); 
            document.body.style.overflow = ''; 
            
            const tela = document.getElementById('ws-audio-foco-tela');
            if (tela) tela.style.display = 'none'; 
            
            Workspace.Avaliacoes.estudioAtivo = null; 
            Workspace.Avaliacoes.carregarLobbies();
        });
    },

    setContextoProf: (contexto) => {
        Workspace.Avaliacoes.contextoAtual = contexto;
        const ocultar = ['ws-prof-nova-escrita', 'ws-prof-nova-oral', 'ws-prof-nova-online', 'ws-prof-recebidas', 'ws-prof-gerir-lista-container', 'ws-prof-submenu-criar', 'ws-prof-submenu-gestao'];
        ocultar.forEach(id => { const el = document.getElementById(id); if(el) el.style.display = 'none'; });
        const titulo = document.getElementById('ws-titulo-painel-prof');
        const menuAvaliacoes = document.getElementById('ws-prof-menu-avaliacoes');
        const menuEncontros = document.getElementById('ws-prof-menu-encontros');
        if (contexto === 'encontros') {
            if(titulo) titulo.innerHTML = '<span>🖥️ Painel do Professor: Sala de Acessos</span>';
            if(menuAvaliacoes) menuAvaliacoes.style.display = 'none';
            if(menuEncontros) menuEncontros.style.display = 'grid';
        } else {
            if(titulo) titulo.innerHTML = '<span>🎓 Painel do Professor: Avaliações</span>';
            if(menuEncontros) menuEncontros.style.display = 'none';
            if(menuAvaliacoes) menuAvaliacoes.style.display = 'grid';
        }
    },
    mostrarSubmenuCriar: (restauro = false) => { 
        if(!restauro) localStorage.setItem('ws_avaliacoes_prof_subtela', 'submenu_criar');
        document.getElementById('ws-prof-menu-avaliacoes').style.display = 'none'; document.getElementById('ws-prof-submenu-criar').style.display = 'grid'; 
    },
    mostrarSubmenuGestao: (restauro = false) => { 
        if(!restauro) localStorage.setItem('ws_avaliacoes_prof_subtela', 'submenu_gestao');
        document.getElementById('ws-prof-menu-avaliacoes').style.display = 'none'; document.getElementById('ws-prof-submenu-gestao').style.display = 'grid'; 
    },
    voltarSubmenus: (restauro = false) => { 
        if(!restauro) localStorage.setItem('ws_avaliacoes_prof_subtela', 'menu');
        document.getElementById('ws-prof-submenu-criar').style.display = 'none'; document.getElementById('ws-prof-submenu-gestao').style.display = 'none'; document.getElementById('ws-prof-menu-avaliacoes').style.display = 'grid'; 
    },
    voltarMenuProf: (restauro = false) => {
        if(!restauro) localStorage.setItem('ws_avaliacoes_prof_subtela', 'menu');
        const ocultar = ['ws-prof-nova-escrita', 'ws-prof-nova-oral', 'ws-prof-nova-online', 'ws-prof-recebidas', 'ws-prof-gerir-lista-container'];
        ocultar.forEach(id => { const el = document.getElementById(id); if(el) el.style.display = 'none'; });
        Workspace.Avaliacoes.setContextoProf(Workspace.Avaliacoes.contextoAtual);
    },
    carregarTurmasProf: async () => {
        if (Workspace.Avaliacoes.turmasCarregadas) return;
        try {
            const turmas = await Workspace.api('/turmas', 'GET');
            if (turmas && turmas.length > 0) {
                const selEscrita = document.getElementById('ws-nova-prova-destino'); const selOral = document.getElementById('ws-nova-oral-destino'); const selOnline = document.getElementById('ws-nova-online-destino');
                let options = '<option value="global">🌍 Todas as Turmas</option>';
                turmas.forEach(t => options += `<option value="${t.id}">📚 ${Workspace.Feed.limparTexto(t.nome)}</option>`);
                if(selEscrita) selEscrita.innerHTML = options; if(selOral) selOral.innerHTML = options; if(selOnline) selOnline.innerHTML = options;
            }
            Workspace.Avaliacoes.turmasCarregadas = true;
        } catch(e) {}
    },
    abrirNovaEscrita: (restauro = false) => {
        if(!restauro) localStorage.setItem('ws_avaliacoes_prof_subtela', 'nova_escrita');
        Workspace.Avaliacoes.carregarTurmasProf(); Workspace.Avaliacoes.avaliacaoEmEdicao = null; document.getElementById('ws-btn-salvar-escrita').innerText = "🚀 Publicar Exame";
        document.getElementById('ws-prof-submenu-criar').style.display = 'none'; document.getElementById('ws-prof-nova-escrita').style.display = 'block';
        document.getElementById('ws-nova-prova-titulo').value = ''; document.getElementById('ws-nova-prova-tempo').value = 60; document.getElementById('ws-nova-prova-tentativas').value = 1; document.getElementById('ws-nova-prova-destino').value = 'global'; document.getElementById('ws-builder-questoes').innerHTML = ''; 
    },
    abrirNovaOral: (restauro = false) => {
        if(!restauro) localStorage.setItem('ws_avaliacoes_prof_subtela', 'nova_oral');
        Workspace.Avaliacoes.carregarTurmasProf(); Workspace.Avaliacoes.avaliacaoEmEdicao = null; document.getElementById('ws-btn-salvar-oral').innerText = "🎤 Publicar Teste Oral";
        document.getElementById('ws-prof-submenu-criar').style.display = 'none'; document.getElementById('ws-prof-nova-oral').style.display = 'block';
        document.getElementById('ws-nova-oral-titulo').value = ''; document.getElementById('ws-nova-oral-instrucoes').value = ''; document.getElementById('ws-nova-oral-tentativas').value = 1; document.getElementById('ws-nova-oral-destino').value = 'global';
    },
    abrirNovaOnline: (restauro = false) => {
        if(!restauro) localStorage.setItem('ws_avaliacoes_prof_subtela', 'nova_online');
        Workspace.Avaliacoes.carregarTurmasProf(); Workspace.Avaliacoes.avaliacaoEmEdicao = null; document.getElementById('ws-btn-salvar-online').innerText = "🖥️ Agendar Sessão Ao Vivo";
        document.getElementById('ws-prof-menu-encontros').style.display = 'none'; document.getElementById('ws-prof-nova-online').style.display = 'block';
        document.getElementById('ws-nova-online-titulo').value = ''; document.getElementById('ws-nova-online-data').value = ''; document.getElementById('ws-nova-online-link').value = ''; document.getElementById('ws-nova-online-destino').value = 'global';
    },

   abrirGerenciador: async (restauro = false) => {
        if(!restauro) localStorage.setItem('ws_avaliacoes_prof_subtela', 'gerir');
        document.getElementById('ws-prof-menu-avaliacoes').style.display = 'none'; document.getElementById('ws-prof-submenu-gestao').style.display = 'none'; document.getElementById('ws-prof-menu-encontros').style.display = 'none'; document.getElementById('ws-prof-gerir-lista-container').style.display = 'block';
        const container = document.getElementById('ws-prof-gerir-lista'); container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">Carregando Painel Inteligente... ⏳</div>';
        try {
            const resAlunos = await Workspace.api(`/alunos?_t=${Date.now()}`, 'GET');
            if (resAlunos && !resAlunos.error) {
                Workspace.Avaliacoes.todosAlunosCache = resAlunos;
            }

            const res = await Workspace.api(`/workspace/avaliacoes?escolaId=${Workspace.usuario.escolaId}&_t=${Date.now()}`, 'GET');
            const resEntregas = await Workspace.api(`/workspace/avaliacoes/entregas?_t=${Date.now()}`, 'GET'); 
            if(res && res.success) {
                Workspace.Avaliacoes.avaliacoesGerenciadorCache = res.avaliacoes || [];
                if(resEntregas && resEntregas.success) Workspace.Avaliacoes.entregasEmCache = resEntregas.entregas || [];
                Workspace.Avaliacoes.renderizarListaGerenciador();
            }
        } catch(e) { container.innerHTML = '<div style="text-align: center; padding: 40px; color: #e74c3c;">Erro ao carregar provas.</div>'; }
    }, // <--- 🚨 ESTA VÍRGULA E CHAVETA SÃO VITAIS!

    renderizarListaGerenciador: (termoBusca = null) => {
        const container = document.getElementById('ws-prof-gerir-lista');
        if (!container) return;

        if (termoBusca === null) {
            const inputAtual = document.getElementById('ws-busca-avaliacoes');
            termoBusca = inputAtual ? inputAtual.value : '';
        }

        let avaliacoes = Workspace.Avaliacoes.avaliacoesGerenciadorCache;
        const contexto = Workspace.Avaliacoes.contextoAtual;
        const abaAtiva = Workspace.Avaliacoes.abaEncontrosArquivo || 'ativas';

        if (contexto === 'encontros') {
            if (abaAtiva === 'ativas') avaliacoes = avaliacoes.filter(a => a.tipo === 'online' && a.status !== 'arquivada');
            else avaliacoes = avaliacoes.filter(a => a.tipo === 'online' && a.status === 'arquivada');
        } else {
            avaliacoes = avaliacoes.filter(a => a.tipo !== 'online');
        }

        if (termoBusca.trim() !== '') {
            const termo = termoBusca.toLowerCase().trim();
            avaliacoes = avaliacoes.filter(a => {
                const titulo = (a.titulo || '').toLowerCase();
                const destino = (a.destinoNome || '').toLowerCase();
                return titulo.includes(termo) || destino.includes(termo);
            });
        }

        let abasHtml = '';
        if (contexto === 'encontros') {
            abasHtml = `
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <button class="ws-btn" style="background: ${abaAtiva === 'ativas' ? '#2c3e50' : '#f0f2f5'}; color: ${abaAtiva === 'ativas' ? 'white' : '#555'}; padding: 6px 15px; border-radius: 20px; font-size: 12px; font-weight: bold;" onclick="Workspace.Avaliacoes.mudarAbaEncontros('ativas')">Sessões Ativas</button>
                    <button class="ws-btn" style="background: ${abaAtiva === 'arquivadas' ? '#2c3e50' : '#f0f2f5'}; color: ${abaAtiva === 'arquivadas' ? 'white' : '#555'}; padding: 6px 15px; border-radius: 20px; font-size: 12px; font-weight: bold;" onclick="Workspace.Avaliacoes.mudarAbaEncontros('arquivadas')">📂 Arquivadas</button>
                </div>
            `;
        }

        const topBar = `
            ${abasHtml}
            <div style="display: flex; gap: 15px; margin-bottom: 20px; align-items: center; flex-wrap: wrap; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="ws-check-todos" style="transform: scale(1.3); cursor: pointer; accent-color: #3498db;" onclick="const cbs = document.querySelectorAll('.ws-check-avaliacao'); cbs.forEach(cb => cb.checked = this.checked);">
                    <label for="ws-check-todos" style="font-size: 13px; font-weight: bold; color: #2c3e50; cursor: pointer;">Todos</label>
                </div>
                <div style="width: 1px; height: 25px; background: #cbd5e1;"></div>
                <div style="flex: 1; min-width: 200px; position: relative;">
                    <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); opacity: 0.5;">🔍</span>
                    <input type="text" id="ws-busca-avaliacoes" placeholder="Pesquisar por título ou turma..." value="${termoBusca}" style="width: 100%; padding: 10px 10px 10px 35px; border-radius: 20px; border: 1px solid #cbd5e1; outline: none; font-size: 13px; box-sizing: border-box;" onkeyup="Workspace.Avaliacoes.renderizarListaGerenciador(this.value)">
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="ws-btn" style="background: #e74c3c; color: white; padding: 8px 15px; border-radius: 20px; font-weight: bold; font-size: 11px; border: none; cursor: pointer;" onclick="Workspace.Avaliacoes.excluirAvaliacoesSelecionadas()">🗑️ Apagar</button>
                    ${abaAtiva === 'ativas' ? `<button class="ws-btn" style="background: #7f8c8d; color: white; padding: 8px 15px; border-radius: 20px; font-weight: bold; font-size: 11px; border: none; cursor: pointer;" onclick="Workspace.Avaliacoes.arquivarAvaliacoesSelecionadas()">📂 Arquivar</button>` : ''}
                </div>
            </div>
        `;

        if (avaliacoes.length === 0) {
            container.innerHTML = topBar + '<div style="text-align: center; padding: 40px; color: #999;">Nenhuma sessão encontrada.</div>';
            return;
        }

        const htmlLista = avaliacoes.map(a => {
            let icone = '🖥️'; 
            if (a.tipo === 'escrita') icone = '✍️'; 
            if (a.tipo === 'oral') icone = '🎤';

            let alunosSessao = [];
            if (Workspace.Avaliacoes.todosAlunosCache) {
                // 🚀 O FILTRO ABSOLUTO ENTRA AQUI! Garante que apenas alunos da turma exata aparecem.
                const alunosDaTurma = Workspace.Avaliacoes.todosAlunosCache.filter(aluno => {
                    return Workspace.verificarTurma(aluno, a.destino, a.destinoNome);
                });
                
                alunosSessao = [...alunosDaTurma];

                const convidados = a.convidados || [];
                convidados.forEach(c => { 
                    if (!alunosSessao.some(al => al.id === c.id)) {
                        alunosSessao.push({ id: c.id, nome: c.nome, isConvidado: true });
                    }
                });
            }

            const totalAlunos = alunosSessao.length;
            const presencasReais = Workspace.Avaliacoes.entregasEmCache.filter(e => e.avaliacaoId === a.id);
            const presencasCount = presencasReais.length;
            const faltam = totalAlunos - presencasCount;

            if (a.status === 'arquivada') {
                const dArquivada = new Date(a.ultimaAtualizacao);
                const dataArqFormatada = `${dArquivada.toLocaleDateString('pt-BR')} às ${dArquivada.getHours().toString().padStart(2, '0')}h${dArquivada.getMinutes().toString().padStart(2, '0')}`;
                
                const presentes = [];
                const ausentes = [];
                
                alunosSessao.forEach(aluno => {
                    const acessou = presencasReais.some(e => String(e.alunoId) === String(aluno.id) || (e.alunoNome && aluno.nome && String(e.alunoNome).toLowerCase().trim() === String(aluno.nome).toLowerCase().trim()));
                    if (acessou) presentes.push(aluno);
                    else ausentes.push(aluno);
                });

                presentes.sort((x, y) => (x.nome || '').localeCompare(y.nome || ''));
                ausentes.sort((x, y) => (x.nome || '').localeCompare(y.nome || ''));

                const htmlPresentes = presentes.length > 0 
                    ? presentes.map(p => `<div style="font-size: 12px; color: #27ae60; padding: 4px 0; border-bottom: 1px dashed #eee;">✅ ${Workspace.escapeHTML(p.nome)} ${p.isConvidado ? '<span style="font-size: 9px; background: #9b59b6; color: white; padding: 2px 4px; border-radius: 4px; margin-left: 5px;">Convidado</span>' : ''}</div>`).join('')
                    : '<div style="font-size: 12px; color: #999; font-style: italic;">Ninguém compareceu.</div>';
                    
                const htmlAusentes = ausentes.length > 0 
                    ? ausentes.map(p => `<div style="font-size: 12px; color: #e74c3c; padding: 4px 0; border-bottom: 1px dashed #eee;">❌ ${Workspace.escapeHTML(p.nome)} ${p.isConvidado ? '<span style="font-size: 9px; background: #9b59b6; color: white; padding: 2px 4px; border-radius: 4px; margin-left: 5px;">Convidado</span>' : ''}</div>`).join('')
                    : '<div style="font-size: 12px; color: #999; font-style: italic;">Não houve ausências!</div>';

                return `
                <div style="background: #fff; border: 1px solid #eee; padding: 20px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.03); border-left: 5px solid #7f8c8d;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px;">
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 5px 0; color: #2c3e50; font-size: 16px;">📂 ${a.titulo} (Relatório de Sessão)</h4>
                            <div style="font-size: 12px; color: #7f8c8d; font-weight: bold;">Arquivado em: <span style="color:#e67e22;">${dataArqFormatada}</span> &nbsp;|&nbsp; 👥 Turma: <span style="color:#8e44ad;">${a.destinoNome || 'Global'}</span></div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="ws-btn" style="background:#f0f2f5; color:#2c3e50; font-size:12px; padding:8px 15px; border-radius: 8px; font-weight: bold; border: none; cursor: pointer;" onclick="Workspace.Avaliacoes.arquivarSessaoOnline('${a.id}', 'ativa')">📂 Desarquivar</button>
                            <button class="ws-btn" style="background:#fdf2f2; color:#e74c3c; font-size:12px; padding:8px 15px; border-radius: 8px; font-weight: bold; border: none; cursor: pointer;" onclick="Workspace.Avaliacoes.excluirAvaliacao('${a.id}')">🗑️ Apagar</button>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div>
                            <h5 style="margin: 0 0 10px 0; color: #27ae60; border-bottom: 2px solid #27ae60; padding-bottom: 5px;">Presentes (${presentes.length})</h5>
                            <div style="max-height: 200px; overflow-y: auto; padding-right: 5px;">${htmlPresentes}</div>
                        </div>
                        <div>
                            <h5 style="margin: 0 0 10px 0; color: #e74c3c; border-bottom: 2px solid #e74c3c; padding-bottom: 5px;">Ausentes (${ausentes.length})</h5>
                            <div style="max-height: 200px; overflow-y: auto; padding-right: 5px;">${htmlAusentes}</div>
                        </div>
                    </div>
                </div>`;
            } else {
                let corStatus = '#27ae60'; let textoStatus = 'Online';

                if (a.status === 'ativa') {
                    if (a.tipo === 'online') {
                        if (totalAlunos === 0) { textoStatus = `Acessos: ${presencasCount}`; corStatus = '#3498db'; } 
                        else if (presencasCount === 0) { textoStatus = 'Acesso Online (Todos)'; corStatus = '#27ae60'; } 
                        else if (presencasCount >= totalAlunos) { textoStatus = 'Acesso Offline (Todos)'; corStatus = '#e74c3c'; } 
                        else { textoStatus = `Acesso Online (${faltam}) e Acesso Offline (${presencasCount})`; corStatus = '#f39c12'; }
                    } else { corStatus = '#27ae60'; textoStatus = 'Online'; }
                }

                const dataCriacaoFmt = new Date(a.dataCriacao).toLocaleDateString('pt-BR');
                let dataApresentada = '';
                if (a.dataAgendada && a.dataAgendada.includes('T')) {
                    const partesTempo = a.dataAgendada.split('T'); 
                    const partesData = partesTempo[0].split('-');
                    const horaExata = partesTempo[1].substring(0, 5); 
                    if(partesData.length === 3) dataApresentada = `📅 Agendada para: ${partesData[2]}/${partesData[1]}/${partesData[0]} às ${horaExata}`;
                }

                let btnEntrarSala = '';
                if (a.tipo === 'online' && a.linkSala) {
                    let linkFinal = a.linkSala.startsWith('http') ? a.linkSala : 'https://' + a.linkSala;
                    btnEntrarSala = `<a href="${linkFinal}" target="_blank" class="ws-btn" style="background: #8e44ad; color: white; text-decoration: none; font-size: 12px; padding: 8px 15px; border-radius: 8px; text-align: center; font-weight: bold;">🚀 Entrar na Sessão</a>`;
                }

                let btnGestao = `<button class="ws-btn" style="background: #3498db; color: white; border: none; font-size: 12px; padding: 8px 15px; border-radius: 8px; font-weight: bold; cursor: pointer;" onclick="Workspace.Avaliacoes.abrirModalAcessos('${a.id}', '${a.destino}')">📊 Gestão de Acessos</button>`;

                return `
                <div style="background: #fff; border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; flex-direction:column; gap: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); transition: 0.2s;" onmouseover="this.style.borderColor='#3498db'" onmouseout="this.style.borderColor='#eee'">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="display: flex; gap: 12px; align-items: flex-start;">
                            <input type="checkbox" class="ws-check-avaliacao" value="${a.id}" style="transform: scale(1.3); cursor: pointer; accent-color: #3498db; margin-top: 5px;">
                            <div style="flex: 1; min-width: 0;">
                                <h4 style="margin: 0 0 5px 0; color: #2c3e50; font-size: 16px;">${icone} ${a.titulo}</h4>
                                <div style="font-size: 11px; color: #7f8c8d; margin-bottom: 8px; font-weight: bold;">Criada em: ${dataCriacaoFmt} ${dataApresentada ? `| ${dataApresentada}` : ''}</div>
                                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                    <span style="font-size: 11px; color: #8e44ad; font-weight:bold; background: #f4e8f8; padding: 3px 8px; border-radius: 6px;">👥 ${a.destinoNome || 'Global'}</span>
                                    <span style="font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 6px; background: ${corStatus}20; color: ${corStatus};">${textoStatus}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style="display:flex; gap: 10px; border-top: 1px dashed #eee; padding-top: 10px; flex-wrap: wrap;">
                        ${btnEntrarSala}
                        ${btnGestao}
                        <button type="button" class="ws-btn" style="background:#e8f4f8; color:#3498db; font-size:12px; padding:8px 15px; border-radius: 8px; border: 1px solid #bde0fe; cursor: pointer; font-weight: bold; transition:0.2s;" onmouseover="this.style.background='#d5ebf6'" onmouseout="this.style.background='#e8f4f8'" onclick="Workspace.Avaliacoes.editarAvaliacao('${a.id}')">✏️ Editar</button>
                    </div>
                </div>`;
            }
        }).join('');

        container.innerHTML = topBar + htmlLista;
        
        const inputNovo = document.getElementById('ws-busca-avaliacoes');
        if (inputNovo && termoBusca !== '') {
            inputNovo.focus(); const val = inputNovo.value; inputNovo.value = ''; inputNovo.value = val;
        }
    },

   // ========================================================================
    // 🚀 AS FUNÇÕES QUE FALTAVAM: NAVEGAÇÃO E ARQUIVAMENTO
    // ========================================================================
    mudarAbaEncontros: (aba, restauro = false) => {
        if(!restauro) localStorage.setItem('ws_aba_encontros_arquivo', aba);
        Workspace.Avaliacoes.abaEncontrosArquivo = aba;
        Workspace.Avaliacoes.renderizarListaGerenciador();
    },

    arquivarSessaoOnline: async (id, novoStatus) => {
        try {
            await Workspace.api(`/workspace/avaliacoes/${id}/status`, 'PATCH', { status: novoStatus });
            const p = Workspace.Avaliacoes.avaliacoesGerenciadorCache.find(x => x.id === id);
            if(p) p.status = novoStatus;
            Workspace.Avaliacoes.renderizarListaGerenciador();
            Workspace.mostrarAviso(novoStatus === 'arquivada' ? "Sessão arquivada com sucesso!" : "Sessão restaurada para Ativas!", "success");
        } catch(e) {
            Workspace.mostrarAviso("Erro ao alterar o estado da sessão.", "error");
        }
    },

  // 🧠 MEMÓRIA INTELIGENTE DE REATIVAÇÕES
    getReativados: (avaliacaoId) => {
        try { return JSON.parse(localStorage.getItem(`ws_reativados_${avaliacaoId}`)) || []; }
        catch(e) { return []; }
    },
    marcarReativado: (avaliacaoId, alunoId, alunoNome) => {
        const lista = Workspace.Avaliacoes.getReativados(avaliacaoId);
        if (!lista.some(r => r.id === alunoId)) {
            lista.push({ id: alunoId, nome: alunoNome || 'Aluno' });
            localStorage.setItem(`ws_reativados_${avaliacaoId}`, JSON.stringify(lista));
        }
    },
    marcarVariosReativados: (avaliacaoId, alunosArray) => {
        const lista = Workspace.Avaliacoes.getReativados(avaliacaoId);
        alunosArray.forEach(aluno => { 
            if (!lista.some(r => r.id === aluno.id)) lista.push({ id: aluno.id, nome: aluno.nome || 'Aluno' }); 
        });
        localStorage.setItem(`ws_reativados_${avaliacaoId}`, JSON.stringify(lista));
    },
    // 🚀 O AUTO-CORRETOR: Apaga o aluno da memória de "reativados" se ele usar a sala outra vez!
    removerReativado: (avaliacaoId, alunoId) => {
        let lista = Workspace.Avaliacoes.getReativados(avaliacaoId);
        const tamanhoAntes = lista.length;
        lista = lista.filter(r => r.id !== alunoId);
        if (lista.length !== tamanhoAntes) {
            localStorage.setItem(`ws_reativados_${avaliacaoId}`, JSON.stringify(lista));
        }
    },

   
abrirModalAcessos: async (avaliacaoId, destinoId, isSilent = false) => {
        Workspace.Avaliacoes.modalAcessosAberto = { avaliacaoId, destinoId };

        const prova = Workspace.Avaliacoes.avaliacoesGerenciadorCache.find(p => p.id === avaliacaoId) || Workspace.Avaliacoes.avaliacoesDisponiveis.find(p => p.id === avaliacaoId);
        if(!prova) return;

        // 🚀 O DICIONÁRIO INTELIGENTE: Adapta o texto se for aula ao vivo ou avaliação (prova)
        const isOnline = prova.tipo === 'online';
        const txtSessao = isOnline ? 'Sessão' : 'Avaliação';
        const txtResumo = isOnline ? 'acessos utilizados' : 'entregas realizadas';
        const txtVazio = isOnline ? 'Ninguém acessou à sessão online ainda.' : 'Nenhum aluno submeteu esta avaliação ainda.';
        const txtUsado = isOnline ? '🔴 Acesso Usado' : '🔴 Entrega Realizada';
        const txtAtivo = isOnline ? '🟢 Acesso Ativo' : '🟢 Prova Liberada';
        const txtReativado = isOnline ? '🔵 Link Reativado' : '🔵 Nova Chance';
        const txtReativarBtn = isOnline ? '🔄 Reativar Acesso' : '🔄 Nova Tentativa';

        const modalId = 'ws-modal-acessos-online';
        let container = document.getElementById('ws-acessos-lista');

        if (!isSilent || !document.getElementById(modalId)) {
            if(document.getElementById(modalId)) document.getElementById(modalId).remove();

            const modal = document.createElement('div');
            modal.id = modalId;
            modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:100000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px);";
            
            modal.innerHTML = `
                <div class="ws-card" style="width: 90%; max-width: 600px; max-height: 85vh; padding: 25px; position: relative; display:flex; flex-direction:column; overflow: hidden;">
                    <button type="button" onclick="Workspace.Avaliacoes.modalAcessosAberto = null; document.getElementById('${modalId}').remove()" style="position:absolute; right:15px; top:15px; background:#eee; border:none; border-radius:50%; width:35px; height:35px; cursor:pointer; font-weight:bold; color:#333; font-size:18px;">×</button>
                    <h3 style="margin: 0 0 5px 0; color: #2c3e50;">📊 Gestão de Acessos</h3>
                    <span style="font-size: 13px; color: #7f8c8d; font-weight:bold; margin-bottom: 20px;">${txtSessao}: ${Workspace.escapeHTML(prova.titulo)}</span>
                    
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                        <div id="ws-botoes-topo-acessos" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap; width: 100%;">
                            <div style="text-align:center; width:100%; font-size:12px; color:#999;">Preparando ferramentas...</div>
                        </div>
                    </div>

                    <div id="ws-busca-convidado-container-${avaliacaoId}" style="display:none; margin-bottom: 15px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #cbd5e1;">
                        <input type="text" id="ws-input-convidado-${avaliacaoId}" placeholder="Pesquisar nome do aluno em toda a escola..." style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #cbd5e1; outline: none; font-size: 13px;" onkeyup="Workspace.Avaliacoes.buscarConvidado('${avaliacaoId}', this.value)">
                        <div id="ws-lista-convidados-${avaliacaoId}" style="max-height: 150px; overflow-y: auto; margin-top: 10px; display: flex; flex-direction: column; gap: 5px;"></div>
                    </div>

                    <div id="ws-acessos-lista" style="flex:1; overflow-y:auto; padding-right:5px;">
                        <div style="text-align: center; padding: 30px; color: #999;">Carregando a lista de alunos... ⏳</div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            container = document.getElementById('ws-acessos-lista');
        }

       try {
            let acessosSource = Workspace.Avaliacoes.entregasEmCache;
            
            if (!isSilent) {
                const entregasRes = await Workspace.api(`/workspace/avaliacoes/entregas?_t=${Date.now()}`, 'GET');
                if(entregasRes && entregasRes.success) {
                    Workspace.Avaliacoes.entregasEmCache = entregasRes.entregas;
                    acessosSource = entregasRes.entregas;
                }
            }

            let acessos = acessosSource.filter(e => e.avaliacaoId === avaliacaoId);
            const reativadosAntigos = Workspace.Avaliacoes.getReativados(avaliacaoId);
            
            acessos.forEach(acesso => {
                if (reativadosAntigos.some(r => r.id === acesso.alunoId)) {
                    Workspace.Avaliacoes.removerReativado(avaliacaoId, acesso.alunoId);
                }
            });

            const reativadosLista = Workspace.Avaliacoes.getReativados(avaliacaoId);
            const idsReativados = reativadosLista.map(r => r.id);
            
            let alunosLista = [];

          if (Workspace.Avaliacoes.todosAlunosCache) {
                // 🚀 O FILTRO ABSOLUTO ENTRA AQUI TAMBÉM!
                alunosLista = Workspace.Avaliacoes.todosAlunosCache.filter(aluno => {
                    const ehDaTurma = Workspace.verificarTurma(aluno, destinoId, prova.destinoNome);
                    const ehConvidado = prova.convidados && prova.convidados.some(c => String(c.id) === String(aluno.id));
                    return ehDaTurma || ehConvidado;
                });
            }

            let htmlLista = '';
            
            const listaOcultos = prova.ocultos || [];
            const alunosAtivosParaOcultar = [];

            const btnSelecionarTodos = acessos.length > 0 ? `
                <div style="display:flex; align-items:center; gap:8px; padding: 10px 15px; background: #f8fafc; border-radius: 8px; margin-bottom: 10px; border: 1px solid #e2e8f0;">
                    <input type="checkbox" id="ws-check-todos-reativar" style="transform: scale(1.3); cursor: pointer;" onclick="const cbs = document.querySelectorAll('.ws-check-reativar'); cbs.forEach(cb => cb.checked = this.checked);">
                    <label for="ws-check-todos-reativar" style="font-size: 13px; font-weight: bold; color: #2c3e50; cursor: pointer;">Selecionar alunos pendentes</label>
                </div>
            ` : '';

            if (alunosLista.length > 0) {
                htmlLista += `<div style="background:#f0f2f5; padding:10px; border-radius:8px; margin-bottom:15px; font-size:13px; font-weight:bold; color:#2c3e50; text-align:center;">Resumo: ${acessos.length} de ${alunosLista.length} ${txtResumo}.</div>`;
                htmlLista += btnSelecionarTodos;

                alunosLista.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));

                alunosLista.forEach(aluno => {
                    const acessoFeito = acessos.find(e => e.alunoId === aluno.id || e.alunoNome === aluno.nome);
                    const avatar = window.Workspace.renderizarAvatar(aluno.nome, 35);
                    const foiReativado = idsReativados.includes(aluno.id);
                    const nomeSeguro = aluno.nome ? aluno.nome.replace(/'/g, "\\'") : 'Aluno';
                    const badgeConvidado = (prova.convidados && prova.convidados.some(c => c.id === aluno.id)) ? `<span style="font-size: 9px; background: #9b59b6; color: white; padding: 2px 5px; border-radius: 4px; margin-left: 5px;">Convidado</span>` : '';
                    
                    const taOculto = listaOcultos.includes(String(aluno.id));
                    
                    let btnOcultarHtml = '';
                    if (!acessoFeito) {
                        alunosAtivosParaOcultar.push(String(aluno.id));
                        if (taOculto) {
                            btnOcultarHtml = `<button type="button" class="ws-btn" style="background:#8e44ad; color:white; border:none; cursor:pointer; font-size:11px; padding:6px 12px; border-radius:15px;" onclick="Workspace.Avaliacoes.toggleOcultarIndividual(event, '${avaliacaoId}', '${destinoId}', '${aluno.id}', 'desocultar')">👁️ Desbloquear</button>`;
                        } else {
                            btnOcultarHtml = `<button type="button" class="ws-btn" style="background:#f39c12; color:white; border:none; cursor:pointer; font-size:11px; padding:6px 12px; border-radius:15px;" onclick="Workspace.Avaliacoes.toggleOcultarIndividual(event, '${avaliacaoId}', '${destinoId}', '${aluno.id}', 'ocultar')">⏸️ Bloquear</button>`;
                        }
                    }

                    if (acessoFeito) {
                        let horaFormatada = '';
                        if (acessoFeito.dataEntrega) {
                            const d = new Date(acessoFeito.dataEntrega);
                            horaFormatada = `às ${d.getHours().toString().padStart(2, '0')}h${d.getMinutes().toString().padStart(2, '0')}`;
                        }

                        htmlLista += `
                            <div style="display:flex; justify-content:space-between; align-items:center; background:#fff; border:1px solid #eee; padding:12px; border-radius:8px; margin-bottom:8px; border-left:4px solid #e74c3c;">
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <input type="checkbox" class="ws-check-reativar" value="${acessoFeito.id}" data-alunoid="${aluno.id}" data-alunonome="${nomeSeguro}" style="transform: scale(1.3); cursor: pointer;">
                                    ${avatar}
                                    <div>
                                        <div style="font-size:13px; font-weight:bold; color:#2c3e50;">${aluno.nome} ${badgeConvidado}</div>
                                        <div style="font-size:11px; color:#e74c3c; font-weight:bold;">${txtUsado} ${horaFormatada}</div>
                                    </div>
                                </div>
                                <button type="button" class="ws-btn" style="background:#f39c12; color:white; border:none; cursor:pointer; font-size:11px; padding:6px 12px; border-radius:15px;" onclick="Workspace.Avaliacoes.reativarAcessoAluno(event, '${acessoFeito.id}', '${avaliacaoId}', '${destinoId}', '${aluno.id}', '${nomeSeguro}')">${txtReativarBtn}</button>
                            </div>
                        `;
                    } else if (foiReativado) {
                        htmlLista += `
                            <div style="display:flex; justify-content:space-between; align-items:center; background:${taOculto ? '#f8f9fa' : '#fff'}; border:1px solid #eee; padding:12px; border-radius:8px; margin-bottom:8px; border-left:4px solid ${taOculto ? '#bdc3c7' : '#3498db'}; opacity: ${taOculto ? '0.7' : '1'};">
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <div style="width: 17px;"></div>
                                    ${avatar}
                                    <div>
                                        <div style="font-size:13px; font-weight:bold; color:#2c3e50;">${aluno.nome} ${badgeConvidado}</div>
                                        <div style="font-size:11px; color:${taOculto ? '#95a5a6' : '#3498db'}; font-weight:bold;">${txtReativado} (Aguardando) ${taOculto ? '<span style="color:#e74c3c;">[Bloqueado]</span>' : ''}</div>
                                    </div>
                                </div>
                                ${btnOcultarHtml}
                            </div>
                        `;
                    } else {
                        htmlLista += `
                            <div style="display:flex; justify-content:space-between; align-items:center; background:${taOculto ? '#f8f9fa' : '#fff'}; border:1px solid #eee; padding:12px; border-radius:8px; margin-bottom:8px; border-left:4px solid ${taOculto ? '#bdc3c7' : '#27ae60'}; opacity: ${taOculto ? '0.7' : '1'};">
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <div style="width: 17px;"></div>
                                    ${avatar}
                                    <div>
                                        <div style="font-size:13px; font-weight:bold; color:#2c3e50;">${aluno.nome} ${badgeConvidado}</div>
                                        <div style="font-size:11px; color:${taOculto ? '#95a5a6' : '#27ae60'}; font-weight:bold;">${txtAtivo} (Aguardando) ${taOculto ? '<span style="color:#e74c3c;">[Bloqueado]</span>' : ''}</div>
                                    </div>
                                </div>
                                ${btnOcultarHtml}
                            </div>
                        `;
                    }
                });
            } else {
                htmlLista += `<div style="background:#fdf2f2; color:#c0392b; padding:10px; border-radius:8px; margin-bottom:15px; font-size:12px; text-align:center;">Mostrando apenas entregas/acessos (Turma Global).</div>`;
                htmlLista += btnSelecionarTodos;
                
                if(acessos.length === 0 && reativadosLista.length === 0) {
                    htmlLista += `<div style="text-align: center; padding: 20px; color: #999;">${txtVazio}</div>`;
                } else {
                    acessos.forEach(acesso => {
                        const avatar = window.Workspace.renderizarAvatar(acesso.alunoNome, 35);
                        const nomeSeguro = acesso.alunoNome ? acesso.alunoNome.replace(/'/g, "\\'") : 'Aluno';

                        let horaFormatada = '';
                        if (acesso.dataEntrega) {
                            const d = new Date(acesso.dataEntrega);
                            horaFormatada = `às ${d.getHours().toString().padStart(2, '0')}h${d.getMinutes().toString().padStart(2, '0')}`;
                        }

                        htmlLista += `
                            <div style="display:flex; justify-content:space-between; align-items:center; background:#fff; border:1px solid #eee; padding:12px; border-radius:8px; margin-bottom:8px; border-left:4px solid #e74c3c;">
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <input type="checkbox" class="ws-check-reativar" value="${acesso.id}" data-alunoid="${acesso.alunoId}" data-alunonome="${nomeSeguro}" style="transform: scale(1.3); cursor: pointer;">
                                    ${avatar}
                                    <div>
                                        <div style="font-size:13px; font-weight:bold; color:#2c3e50;">${acesso.alunoNome}</div>
                                        <div style="font-size:11px; color:#e74c3c; font-weight:bold;">${txtUsado} ${horaFormatada}</div>
                                    </div>
                                </div>
                                <button type="button" class="ws-btn" style="background:#f39c12; color:white; border:none; cursor:pointer; font-size:11px; padding:6px 12px; border-radius:15px;" onclick="Workspace.Avaliacoes.reativarAcessoAluno(event, '${acesso.id}', '${avaliacaoId}', '${destinoId}', '${acesso.alunoId}', '${nomeSeguro}')">${txtReativarBtn}</button>
                            </div>
                        `;
                    });
                    
                    reativadosLista.forEach(reativado => {
                        const avatar = window.Workspace.renderizarAvatar(reativado.nome, 35);
                        const taOculto = listaOcultos.includes(String(reativado.id));
                        alunosAtivosParaOcultar.push(String(reativado.id));

                        let btnOcultarHtml = '';
                        if (taOculto) {
                            btnOcultarHtml = `<button type="button" class="ws-btn" style="background:#8e44ad; color:white; border:none; cursor:pointer; font-size:11px; padding:6px 12px; border-radius:15px;" onclick="Workspace.Avaliacoes.toggleOcultarIndividual(event, '${avaliacaoId}', '${destinoId}', '${reativado.id}', 'desocultar')">👁️ Desbloquear</button>`;
                        } else {
                            btnOcultarHtml = `<button type="button" class="ws-btn" style="background:#f39c12; color:white; border:none; cursor:pointer; font-size:11px; padding:6px 12px; border-radius:15px;" onclick="Workspace.Avaliacoes.toggleOcultarIndividual(event, '${avaliacaoId}', '${destinoId}', '${reativado.id}', 'ocultar')">⏸️ Bloquear</button>`;
                        }

                        htmlLista += `
                            <div style="display:flex; justify-content:space-between; align-items:center; background:${taOculto ? '#f8f9fa' : '#fff'}; border:1px solid #eee; padding:12px; border-radius:8px; margin-bottom:8px; border-left:4px solid ${taOculto ? '#bdc3c7' : '#3498db'}; opacity: ${taOculto ? '0.7' : '1'};">
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <div style="width: 17px;"></div>
                                    ${avatar}
                                    <div>
                                        <div style="font-size:13px; font-weight:bold; color:#2c3e50;">${reativado.nome}</div>
                                        <div style="font-size:11px; color:${taOculto ? '#95a5a6' : '#3498db'}; font-weight:bold;">${txtReativado} (Aguardando) ${taOculto ? '<span style="color:#e74c3c;">[Bloqueado]</span>' : ''}</div>
                                    </div>
                                </div>
                                ${btnOcultarHtml}
                            </div>
                        `;
                    });
                }
            }
            if(container) container.innerHTML = htmlLista;

            const boxBotoes = document.getElementById('ws-botoes-topo-acessos');
            if (boxBotoes) {
                Workspace.Avaliacoes.alunosParaOcultarCache = alunosAtivosParaOcultar;
                const todosOcultos = alunosAtivosParaOcultar.length > 0 && alunosAtivosParaOcultar.every(id => listaOcultos.includes(id));
                
                const btnMacroOcultar = alunosAtivosParaOcultar.length > 0 ? `
                    <button type="button" class="ws-btn" style="background:${todosOcultos ? '#8e44ad' : '#f39c12'}; color:white; font-size:12px; padding:8px 15px; border-radius:20px; font-weight:bold; border:none; cursor:pointer; flex: 1;" onclick="Workspace.Avaliacoes.toggleOcultarTodos('${avaliacaoId}', '${destinoId}', ${todosOcultos})">
                        ${todosOcultos ? '👁️ Desbloquear Todos' : '⏸️ Bloquear Todos'}
                    </button>
                ` : '';

                boxBotoes.innerHTML = `
                    <button type="button" class="ws-btn" style="background:#27ae60; color:white; font-size:12px; padding:8px 15px; border-radius:20px; font-weight:bold; border:none; cursor:pointer; flex: 1;" onclick="Workspace.Avaliacoes.togglePesquisaConvidado('${avaliacaoId}')">➕ Adicionar Aluno</button>
                    ${btnMacroOcultar}
                    <button type="button" class="ws-btn" style="background:#3498db; color:white; font-size:12px; padding:8px 15px; border-radius:20px; font-weight:bold; border:none; cursor:pointer; flex: 1;" onclick="Workspace.Avaliacoes.reativarAcessosSelecionados('${avaliacaoId}', '${destinoId}')">🔄 Permitir Selecionados</button>
                `;
            }

        } catch(e) { if (container) container.innerHTML = '<div style="color:#e74c3c; text-align:center; padding:20px;">Erro ao carregar os dados.</div>'; }
    },

    toggleOcultarIndividual: async (event, avaliacaoId, destinoId, alunoId, acao) => {
        const btn = event.target;
        const txt = btn.innerText; btn.innerText = "⏳"; btn.disabled = true;
        try {
            await Workspace.api(`/workspace/avaliacoes/${avaliacaoId}/ocultar-acesso`, 'PUT', { alunoId, acao });
            
            // Atualiza o Cache Local instantaneamente
            const prova = Workspace.Avaliacoes.avaliacoesGerenciadorCache.find(p => p.id === avaliacaoId) || Workspace.Avaliacoes.avaliacoesDisponiveis.find(p => p.id === avaliacaoId);
            if (prova) {
                if (!prova.ocultos) prova.ocultos = [];
                if (acao === 'ocultar') prova.ocultos.push(String(alunoId));
                else prova.ocultos = prova.ocultos.filter(id => id !== String(alunoId));
            }
            
            // Atualiza a tela silenciosamente sem fechar o menu
            Workspace.Avaliacoes.abrirModalAcessos(avaliacaoId, destinoId, true);
        } catch (e) {
            Workspace.mostrarAviso("Erro ao alterar visibilidade.", "error");
            btn.innerText = txt; btn.disabled = false;
        }
    },

    toggleOcultarTodos: async (avaliacaoId, destinoId, desocultar) => {
        const alunosIds = Workspace.Avaliacoes.alunosParaOcultarCache || [];
        if (alunosIds.length === 0) return;

        const acao = desocultar ? 'desocultar' : 'ocultar';
        Workspace.mostrarAviso(`${desocultar ? 'Desocultando' : 'Ocultando'} acessos no ecrã dos alunos... ⏳`, "info");
        
        try {
            await Workspace.api(`/workspace/avaliacoes/${avaliacaoId}/ocultar-massa`, 'PUT', { alunoIds: alunosIds, acao });
            
            // Atualiza o Cache Local em massa
            const prova = Workspace.Avaliacoes.avaliacoesGerenciadorCache.find(p => p.id === avaliacaoId) || Workspace.Avaliacoes.avaliacoesDisponiveis.find(p => p.id === avaliacaoId);
            if (prova) {
                if (!prova.ocultos) prova.ocultos = [];
                if (acao === 'ocultar') {
                    prova.ocultos = [...new Set([...prova.ocultos, ...alunosIds])];
                } else {
                    prova.ocultos = prova.ocultos.filter(id => !alunosIds.includes(id));
                }
            }
            
            // Recarrega o modal silenciosamente
            Workspace.Avaliacoes.abrirModalAcessos(avaliacaoId, destinoId, true);
            Workspace.mostrarAviso("Visibilidade atualizada com sucesso!", "success");
        } catch (e) {
            Workspace.mostrarAviso("Erro ao processar a ação em massa.", "error");
        }
    },

  // 🚀 LÓGICA DO CONVIDADO VIP
    togglePesquisaConvidado: (avaliacaoId) => {
        const box = document.getElementById(`ws-busca-convidado-container-${avaliacaoId}`);
        if (box) {
            box.style.display = box.style.display === 'none' ? 'block' : 'none';
            if (box.style.display === 'block') document.getElementById(`ws-input-convidado-${avaliacaoId}`).focus();
        }
    },

    buscarConvidado: (avaliacaoId, termo) => {
        const container = document.getElementById(`ws-lista-convidados-${avaliacaoId}`);
        if (!termo || termo.trim().length < 2) { container.innerHTML = ''; return; }
        
        termo = termo.toLowerCase().trim();
        const resultados = (Workspace.Avaliacoes.todosAlunosCache || []).filter(a => (a.nome || '').toLowerCase().includes(termo)).slice(0, 10);

        if (resultados.length === 0) { container.innerHTML = '<div style="font-size:12px; color:#999; padding:5px;">Nenhum aluno encontrado.</div>'; return; }

        container.innerHTML = resultados.map(aluno => {
            const nomeSeguro = aluno.nome ? aluno.nome.replace(/'/g, "\\'") : 'Aluno';
            return `
            <div style="display:flex; justify-content:space-between; align-items:center; background:white; padding:8px 12px; border-radius:6px; border:1px solid #eee;">
                <span style="font-size:13px; font-weight:bold; color:#2c3e50;">${aluno.nome}</span>
                <button class="ws-btn" style="background:#8e44ad; font-size:11px; padding:4px 10px; border-radius:15px; border:none; color:white; cursor:pointer;" onclick="Workspace.Avaliacoes.adicionarConvidadoSessao('${avaliacaoId}', '${aluno.id}', '${nomeSeguro}')">Adicionar</button>
            </div>`;
        }).join('');
    },

    adicionarConvidadoSessao: async (avaliacaoId, alunoId, alunoNome) => {
        Workspace.mostrarAviso(`Adicionando ${alunoNome} à sessão... ⏳`, "info");
        try {
            const res = await Workspace.api(`/workspace/avaliacoes/${avaliacaoId}/convidados`, 'POST', { alunoId, alunoNome });
            if (res && res.success) {
                // Atualiza a memória local
                const prova = Workspace.Avaliacoes.avaliacoesGerenciadorCache.find(p => p.id === avaliacaoId);
                if (prova) {
                    if (!prova.convidados) prova.convidados = [];
                    prova.convidados.push({ id: alunoId, nome: alunoNome });
                }
                Workspace.mostrarAviso(`${alunoNome} adicionado com sucesso! 🎉`, "success");
                // Recarrega o modal instantaneamente para o aluno aparecer na lista verde
                Workspace.Avaliacoes.abrirModalAcessos(avaliacaoId, prova.destino, true);
                // Limpa a barra de pesquisa
                document.getElementById(`ws-input-convidado-${avaliacaoId}`).value = '';
                document.getElementById(`ws-lista-convidados-${avaliacaoId}`).innerHTML = '';
            }
        } catch(e) { Workspace.mostrarAviso("Erro ao adicionar convidado.", "error"); }
    },

    arquivarAvaliacoesSelecionadas: () => {
        const checkboxes = document.querySelectorAll('.ws-check-avaliacao:checked');
        const ids = Array.from(checkboxes).map(cb => cb.value);
        if (ids.length === 0) return Workspace.mostrarAviso("Selecione os itens usando as caixas à esquerda.", "warning");

        Workspace.Avaliacoes.confirmarDialog("Arquivar Múltiplos", `Deseja arquivar ${ids.length} aula(s) selecionada(s)?`, "Sim, arquivar", "#7f8c8d", async () => {
            Workspace.mostrarAviso("Arquivando... ⏳", "info");
            try {
                await Promise.all(ids.map(id => Workspace.api(`/workspace/avaliacoes/${id}/status`, 'PATCH', { status: 'arquivada' })));
                Workspace.Avaliacoes.avaliacoesGerenciadorCache.forEach(a => { if(ids.includes(a.id)) a.status = 'arquivada'; });
                Workspace.Avaliacoes.renderizarListaGerenciador();
                Workspace.mostrarAviso(`${ids.length} aula(s) arquivada(s) com sucesso!`, "success");
            } catch(e) { Workspace.mostrarAviso("Erro ao arquivar aula(s).", "error"); }
        });
    },

  reativarAcessoAluno: async (event, entregaId, avaliacaoId, destinoId, alunoId, alunoNome) => {
        const btn = event ? event.target : null;
        const originalTxt = btn ? btn.innerText : "🔄 Reativar";
        if(btn) { btn.innerText = "⏳"; btn.disabled = true; }

        try {
            await Workspace.api(`/workspace/avaliacoes/entregas/${entregaId}`, 'DELETE');
            
            if (alunoId) Workspace.Avaliacoes.marcarReativado(avaliacaoId, alunoId, alunoNome);
            
            // Apaga da memória instantaneamente
            Workspace.Avaliacoes.entregasFeitas = Workspace.Avaliacoes.entregasFeitas.filter(e => e.id !== entregaId);
            Workspace.Avaliacoes.entregasEmCache = Workspace.Avaliacoes.entregasEmCache.filter(e => e.id !== entregaId);
            
            // 🚀 O COMANDO DE MAGIA (SILENT UPDATE): 
            // 1. Redesenha a lista por trás (A etiqueta fica Verde/Online e os números atualizam)
            Workspace.Avaliacoes.renderizarListaGerenciador(); 
            // 2. Atualiza a janela preta sem a fechar (O Aluno fica Azul)
            Workspace.Avaliacoes.abrirModalAcessos(avaliacaoId, destinoId, true); 
            
            Workspace.mostrarAviso("Acesso reativado para este aluno!", "success");
        } catch(e) {
            Workspace.mostrarAviso("Erro ao reativar aluno.", "error");
            if(btn) { btn.innerText = originalTxt; btn.disabled = false; }
        }
    },

   // 🚀 LÓGICA DE REATIVAÇÃO EM MASSA (COM OPTIMISTIC UI)
    reativarAcessosSelecionados: (avaliacaoId, destinoId) => {
        const checkboxes = document.querySelectorAll('.ws-check-reativar:checked');
        
        if (checkboxes.length === 0) {
            return Workspace.mostrarAviso("Selecione pelo menos um aluno marcando a caixa correspondente.", "warning");
        }

        Workspace.Avaliacoes.confirmarDialog("Reativar Acessos", `Tem a certeza de que deseja devolver a permissão de entrada na sessão online aos ${checkboxes.length} alunos selecionados?`, "Sim, reativar", "#3498db", async () => {
            Workspace.mostrarAviso("Reativando os acessos... ⏳", "info");
            
            try {
                const alunosAfetados = [];
                
                // Dispara todos os pedidos de apagamento simultaneamente
                const promessas = Array.from(checkboxes).map(cb => {
                    const entregaId = cb.value;
                    const alunoId = cb.getAttribute('data-alunoid');
                    const alunoNome = cb.getAttribute('data-alunonome');
                    
                    if (alunoId && alunoNome) {
                        alunosAfetados.push({ id: alunoId, nome: alunoNome });
                    }
                    
                    // Limpeza visual instantânea na memória (Optimistic UI)
                    Workspace.Avaliacoes.entregasFeitas = Workspace.Avaliacoes.entregasFeitas.filter(e => e.id !== entregaId);
                    Workspace.Avaliacoes.entregasEmCache = Workspace.Avaliacoes.entregasEmCache.filter(e => e.id !== entregaId);
                    
                    return Workspace.api(`/workspace/avaliacoes/entregas/${entregaId}`, 'DELETE');
                });

                await Promise.all(promessas);

                // Marca todos os afetados como reativados para a etiqueta Azul!
                if (alunosAfetados.length > 0) {
                    Workspace.Avaliacoes.marcarVariosReativados(avaliacaoId, alunosAfetados);
                }

                Workspace.mostrarAviso(`${checkboxes.length} acesso(s) reativado(s) com sucesso!`, "success");
                
                // Recarrega o background e o modal silenciosamente
                Workspace.Avaliacoes.renderizarListaGerenciador();
                Workspace.Avaliacoes.abrirModalAcessos(avaliacaoId, destinoId, true);

            } catch(e) { 
                Workspace.mostrarAviso("Ocorreu um erro na ligação com a nuvem.", "error"); 
            }
        });
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
        Workspace.Avaliacoes.confirmarDialog("Excluir Definitivamente", "Deseja apagar este item para sempre?", "Sim, Apagar", "#e74c3c", async () => {
            try {
                await Workspace.api(`/workspace/avaliacoes/${id}`, 'DELETE');
                Workspace.Avaliacoes.avaliacoesGerenciadorCache = Workspace.Avaliacoes.avaliacoesGerenciadorCache.filter(x => x.id !== id);
                Workspace.Avaliacoes.renderizarListaGerenciador();
                Workspace.mostrarAviso("Apagado com sucesso!", "success");
            } catch(e) { Workspace.mostrarAviso("Erro ao apagar.", "error"); }
        });
    },

    // 🚀 LÓGICA DE ELIMINAÇÃO EM MASSA (PROMISE.ALL)
    excluirAvaliacoesSelecionadas: () => {
        const checkboxes = document.querySelectorAll('.ws-check-avaliacao:checked');
        const idsSelecionados = Array.from(checkboxes).map(cb => cb.value);

        if (idsSelecionados.length === 0) {
            return Workspace.mostrarAviso("Selecione pelo menos um item usando as caixas à esquerda.", "warning");
        }

        Workspace.Avaliacoes.confirmarDialog(
            "Apagar Múltiplos", 
            `Deseja apagar definitivamente os ${idsSelecionados.length} item(s) selecionado(s)? Esta ação é irreversível.`, 
            "Sim, apagar todos", 
            "#e74c3c", 
            async () => {
                Workspace.mostrarAviso("Apagando sessões selecionadas... ⏳", "info");
                try {
                    // Executa todas as deleções em paralelo para não bloquear o servidor!
                    const promessas = idsSelecionados.map(id => Workspace.api(`/workspace/avaliacoes/${id}`, 'DELETE'));
                    await Promise.all(promessas);

                    // Limpa a cache local removendo todos os IDs selecionados
                    Workspace.Avaliacoes.avaliacoesGerenciadorCache = Workspace.Avaliacoes.avaliacoesGerenciadorCache.filter(x => !idsSelecionados.includes(x.id));
                    
                    // Atualiza o ecrã (a função vai manter a barra de pesquisa como estava)
                    Workspace.Avaliacoes.renderizarListaGerenciador();
                    Workspace.mostrarAviso(`${idsSelecionados.length} itens apagados com sucesso!`, "success");
                } catch(e) { 
                    Workspace.mostrarAviso("Ocorreu um erro ao apagar alguns itens.", "error"); 
                }
            }
        );
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
            document.getElementById('ws-btn-salvar-escrita').innerText = "💾 Salvar Alterações";
            
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
            document.getElementById('ws-btn-salvar-oral').innerText = "💾 Salvar Alterações";
     } else if (prova.tipo === 'online') { 
            document.getElementById('ws-prof-gerir-lista-container').style.display = 'none';
            document.getElementById('ws-prof-nova-online').style.display = 'block';
            
            document.getElementById('ws-nova-online-titulo').value = prova.titulo || '';
            
            // 🚀 Formatação rigorosa para YYYY-MM-DDThh:mm
            let dataFormatadaInput = '';
            if (prova.dataAgendada && prova.dataAgendada.includes('T')) {
                dataFormatadaInput = prova.dataAgendada.substring(0, 16);
            }
            
            document.getElementById('ws-nova-online-data').value = dataFormatadaInput;
            document.getElementById('ws-nova-online-link').value = prova.linkSala || '';
            document.getElementById('ws-nova-online-destino').value = prova.destino || 'global';
            document.getElementById('ws-btn-salvar-online').innerText = "💾 Salvar Alterações";
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
                    <div style="text-align: center; padding: 40px; color: #999;">Carregando o seu cofre de perguntas... ⏳</div>
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
        btn.innerText = "⏳ Gravando..."; btn.disabled = true;

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
        const txt = btn.innerText; btn.innerText = "⏳ Publicando..."; btn.disabled = true;

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

        if(!titulo || !dataHora || !linkSala) return Workspace.mostrarAviso("Preencha o título, a data e o link da sessão.", "warning");

        const btn = event.target;
        const txt = btn.innerText; btn.innerText = "Agendando ⏳ ..."; btn.disabled = true;

        try {
            const isEdicao = Workspace.Avaliacoes.avaliacaoEmEdicao !== null;
            const endpoint = isEdicao ? `/workspace/avaliacoes/${Workspace.Avaliacoes.avaliacaoEmEdicao}` : '/workspace/avaliacoes';
            const metodo = isEdicao ? 'PUT' : 'POST';

            const payload = {
                titulo, tipo: 'online', dataAgendada: dataHora, linkSala, escolaId: Workspace.usuario.escolaId, autorNome: Workspace.usuario.nome || Workspace.usuario.login, destino, destinoNome, status: 'ativa'
            };

            const res = await Workspace.api(endpoint, metodo, payload);

            if (res && res.success) {
                // 🚀 O DOUBLE-TAP SAVE FOI REMOVIDO! O servidor agora faz tudo de primeira!
                Workspace.mostrarAviso(isEdicao ? "Sessão atualizada!" : "Sessão agendada com sucesso!", "success");
                Workspace.Avaliacoes.voltarMenuProf();
            } else {
                Workspace.mostrarAviso(res.error || "Erro ao guardar a sessão.", "error");
            }
        } catch (e) { 
            Workspace.mostrarAviso("Erro de ligação ao servidor.", "error"); 
        } finally { 
            btn.innerText = txt; 
            btn.disabled = false; 
        }
    },

   abrirRecebidas: async (restauro = false) => {
        if(!restauro) localStorage.setItem('ws_avaliacoes_prof_subtela', 'recebidas');
        document.getElementById('ws-prof-menu-avaliacoes').style.display = 'none';
        document.getElementById('ws-prof-submenu-gestao').style.display = 'none';
        document.getElementById('ws-prof-gerir-lista-container').style.display = 'none';
        document.getElementById('ws-prof-recebidas').style.display = 'block';
        
        const container = document.getElementById('ws-prof-recebidas-lista');
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">Carregando provas recebidas... ⏳</div>';

        try {
            const resProvas = await Workspace.api(`/workspace/avaliacoes?escolaId=${Workspace.usuario.escolaId}&_t=${Date.now()}`, 'GET');
            const resEntregas = await Workspace.api(`/workspace/avaliacoes/entregas?_t=${Date.now()}`, 'GET');

            if (resEntregas && resEntregas.success && resProvas && resProvas.success) {
                const provasMap = {};
                resProvas.avaliacoes.forEach(p => provasMap[p.id] = p);

                Workspace.Avaliacoes.entregasEmCache = resEntregas.entregas;
                Workspace.Avaliacoes.provasEmCache = provasMap;

                Workspace.Avaliacoes.renderizarListaRecebidas();
            } else {
                throw new Error("Dados incompletos");
            }
        } catch (err) { 
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: #e74c3c;">Erro ao carregar o dashboard de analytics.</div>'; 
        }
    },

    renderizarListaRecebidas: (termoBusca = null) => {
        const container = document.getElementById('ws-prof-recebidas-lista');
        
        if (termoBusca === null) {
            const inputAtual = document.getElementById('ws-busca-recebidas');
            termoBusca = inputAtual ? inputAtual.value : '';
        }

        // 🚀 FILTRO 1: Remove "online". Ficam estritamente provas escritas e orais!
        const entregasValidas = Workspace.Avaliacoes.entregasEmCache.filter(e => {
            const prova = Workspace.Avaliacoes.provasEmCache[e.avaliacaoId];
            return prova && prova.tipo !== 'online';
        });

        // ==========================================
        // 📊 DASHBOARD ANALYTICS (Baseado nas provas válidas)
        // ==========================================
        let totalAlertas = 0;
        const erroPorQuestao = {};
        let somaAcertos = 0;
        let totalRespostasMultipla = 0;

        entregasValidas.forEach(e => {
            if (e.relatorioFraude && e.relatorioFraude.fugas > 0) totalAlertas++;
            
            const prova = Workspace.Avaliacoes.provasEmCache[e.avaliacaoId];
            if (!prova || !prova.questoes || !e.respostas) return;
            
            prova.questoes.forEach(q => {
                if (q.tipo === 'escolha') {
                    const chaveUnica = `${e.avaliacaoId}_${q.id}`;
                    if (!erroPorQuestao[chaveUnica]) {
                        erroPorQuestao[chaveUnica] = { erros: 0, total: 0, pergunta: q.pergunta, tituloProva: prova.titulo };
                    }
                    erroPorQuestao[chaveUnica].total++;
                    const respAluno = e.respostas[q.id];
                    if (respAluno !== q.respostaCorreta) { erroPorQuestao[chaveUnica].erros++; }
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
        `;

        // 🚀 FILTRO 2: Barra de Pesquisa
        let entregasFiltradas = entregasValidas;
        if (termoBusca.trim() !== '') {
            const termo = termoBusca.toLowerCase().trim();
            entregasFiltradas = entregasFiltradas.filter(e => {
                const prova = Workspace.Avaliacoes.provasEmCache[e.avaliacaoId];
                const tituloProva = prova ? prova.titulo.toLowerCase() : '';
                const alunoNome = (e.alunoNome || '').toLowerCase();
                const dataFormatada = new Date(e.dataEntrega).toLocaleDateString('pt-BR');
                return tituloProva.includes(termo) || alunoNome.includes(termo) || dataFormatada.includes(termo);
            });
        }

        // 🚀 BARRA DE FERRAMENTAS COM CHECKBOX "TODOS"
        const topBar = `
            <div style="display: flex; gap: 15px; margin-bottom: 20px; align-items: center; flex-wrap: wrap; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="ws-check-todos-recebidas" style="transform: scale(1.3); cursor: pointer;" onclick="const cbs = document.querySelectorAll('.ws-check-entrega'); cbs.forEach(cb => cb.checked = this.checked);">
                    <label for="ws-check-todos-recebidas" style="font-size: 13px; font-weight: bold; color: #2c3e50; cursor: pointer;">Todos</label>
                </div>
                <div style="width: 1px; height: 25px; background: #cbd5e1;"></div>
                <div style="flex: 1; min-width: 200px; position: relative;">
                    <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); opacity: 0.5;">🔍</span>
                    <input type="text" id="ws-busca-recebidas" placeholder="Pesquisar por aluno, prova ou data..." value="${termoBusca}" style="width: 100%; padding: 10px 10px 10px 35px; border-radius: 20px; border: 1px solid #cbd5e1; outline: none; font-size: 13px; box-sizing: border-box; transition: 0.3s;" onfocus="this.style.borderColor='#3498db'" onblur="this.style.borderColor='#cbd5e1'" onkeyup="Workspace.Avaliacoes.renderizarListaRecebidas(this.value)">
                </div>
                <button class="ws-btn" style="background: #e74c3c; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; border: none; cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 8px; transition: 0.2s;" onmouseover="this.style.background='#c0392b'" onmouseout="this.style.background='#e74c3c'" onclick="Workspace.Avaliacoes.excluirEntregasSelecionadas()">
                    🗑️ Apagar Selecionados
                </button>
            </div>
        `;

        if (entregasValidas.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">Ainda não existem provas recebidas.</div>';
            return;
        }

        const tituloLista = `<h3 style="font-size:15px; color:#2c3e50; margin:25px 0 15px 0; font-weight:bold; border-bottom:2px solid #eee; padding-bottom:8px;">📥 Exames Recebidos para Avaliação</h3>`;

        const htmlListaAlunos = entregasFiltradas.length === 0 
            ? '<div style="text-align: center; padding: 40px; color: #999;">Nenhum exame encontrado nesta pesquisa.</div>'
            : entregasFiltradas.map(e => {
                const prova = Workspace.Avaliacoes.provasEmCache[e.avaliacaoId];
                const tituloProva = prova ? prova.titulo : 'Prova Excluída';
                const icone = (prova && prova.tipo === 'oral') ? '🎤' : '✍️';
                const dataObj = new Date(e.dataEntrega);
                const horaFormatada = dataObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
                
                const fraudeBadge = (e.relatorioFraude && e.relatorioFraude.fugas > 0) 
                    ? `<span style="background:#fdf2f2; color:#e74c3c; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:bold; margin-left:5px;">⚠️ ${e.relatorioFraude.fugas} Ausência(s)</span>` 
                    : '';

                return `
                    <div style="background: #fff; border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.02); transition: 0.2s;" onmouseover="this.style.borderColor='#3498db'" onmouseout="this.style.borderColor='#eee'">
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <input type="checkbox" class="ws-check-entrega" value="${e.id}" style="transform: scale(1.3); cursor: pointer;">
                            <div>
                                <h4 style="margin: 0 0 5px 0; color: #2c3e50;">${icone} ${tituloProva}</h4>
                                <span style="font-size: 11px; color: #7f8c8d;">Aluno: <strong style="color:#3498db;">${e.alunoNome}</strong> | ${dataObj.toLocaleDateString('pt-BR')} às ${horaFormatada} ${fraudeBadge}</span>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="ws-btn" style="background: #27ae60; padding: 8px 15px; font-size: 12px; border-radius: 20px;" onclick="Workspace.Avaliacoes.verCorrecao('${e.id}', false)">Ver Respostas</button>
                            <button class="ws-btn" style="background: #fdf2f2; color: #e74c3c; padding: 8px 15px; font-size: 12px; border-radius: 20px; border: 1px solid #fadbd8;" title="Apagar Exame" onclick="Workspace.Avaliacoes.excluirEntregaIndividual('${e.id}')">🗑️</button>
                        </div>
                    </div>
                `;
            }).join('');

        container.innerHTML = htmlAnalytics + topBar + tituloLista + htmlListaAlunos;

        // Repor o foco no input sem perder o que o professor escreveu
        const inputNovo = document.getElementById('ws-busca-recebidas');
        if (inputNovo && termoBusca !== '') {
            inputNovo.focus();
            const val = inputNovo.value;
            inputNovo.value = '';
            inputNovo.value = val;
        }
    },

    excluirEntregaIndividual: (id) => {
        Workspace.Avaliacoes.confirmarDialog("Apagar Prova?", "Deseja apagar definitivamente esta prova? O aluno perderá a nota/correção associada.", "Sim, Apagar", "#e74c3c", async () => {
            try {
                // A mesma rota usada para reativar online funciona aqui para apagar a entrega permanentemente!
                await Workspace.api(`/workspace/avaliacoes/entregas/${id}`, 'DELETE');
                Workspace.Avaliacoes.entregasEmCache = Workspace.Avaliacoes.entregasEmCache.filter(e => e.id !== id);
                Workspace.Avaliacoes.renderizarListaRecebidas();
                Workspace.mostrarAviso("Prova apagada com sucesso!", "success");
            } catch(e) { Workspace.mostrarAviso("Erro ao apagar a prova.", "error"); }
        });
    },

    excluirEntregasSelecionadas: () => {
        const checkboxes = document.querySelectorAll('.ws-check-entrega:checked');
        const idsSelecionados = Array.from(checkboxes).map(cb => cb.value);

        if (idsSelecionados.length === 0) return Workspace.mostrarAviso("Selecione pelo menos uma prova usando as caixas à esquerda.", "warning");

        Workspace.Avaliacoes.confirmarDialog("Apagar Múltiplas Provas", `Deseja apagar as ${idsSelecionados.length} provas selecionadas? A ação é irreversível.`, "Sim, Apagar Todas", "#e74c3c", async () => {
            Workspace.mostrarAviso("Apagando provas... ⏳", "info");
            try {
                // Execução paralela (metralhadora de eliminação)
                const promessas = idsSelecionados.map(id => Workspace.api(`/workspace/avaliacoes/entregas/${id}`, 'DELETE'));
                await Promise.all(promessas);
                
                // Limpeza visual imediata
                Workspace.Avaliacoes.entregasEmCache = Workspace.Avaliacoes.entregasEmCache.filter(e => !idsSelecionados.includes(e.id));
                Workspace.Avaliacoes.renderizarListaRecebidas();
                Workspace.mostrarAviso(`${idsSelecionados.length} provas apagadas com sucesso!`, "success");
            } catch(e) { Workspace.mostrarAviso("Ocorreu um erro ao apagar algumas provas.", "error"); }
        });
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
        modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:100000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); animation: fadeIn 0.2s;";
        
        // 🚀 A MÁGICA DA ARQUITETURA FLEXBOX: Cabeçalho inabalável e corpo elástico!
        modal.innerHTML = `
            <div class="ws-card" style="width: 95%; max-width: 750px; height: 85vh; max-height: 85vh; padding: 0; display: flex; flex-direction: column; overflow: hidden; border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.3);">
                
                <!-- CABEÇALHO INABALÁVEL -->
                <div style="padding: 20px 25px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: flex-start; background: #f8fafc; flex-shrink: 0; z-index: 10;">
                    <div style="flex: 1; padding-right: 15px;">
                        <h3 style="margin: 0 0 5px 0; color: #2c3e50; font-size: 18px;">${tituloModal}</h3>
                        <div style="font-size: 12px; color: #7f8c8d; font-weight:bold;">
                            Prova: <span style="color:#2c3e50;">${Workspace.Sidebar.escapeHTML(prova.titulo)}</span> &nbsp;|&nbsp; Entregue: <span style="color:#3498db;">${dataStr}</span>
                        </div>
                    </div>
                    <button onclick="document.getElementById('${modalId}').remove()" style="background:#e2e8f0; border:none; border-radius:50%; width:35px; height:35px; cursor:pointer; font-weight:bold; color:#475569; font-size:18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: 0.2s;" onmouseover="this.style.background='#e74c3c'; this.style.color='white'" onmouseout="this.style.background='#e2e8f0'; this.style.color='#475569'">✕</button>
                </div>
                
                <!-- CORPO DA PROVA (ONDE A ROLAGEM ACONTECE) -->
                <div id="ws-correcao-scroll-body" style="padding: 25px; overflow-y: auto; flex: 1; background: white;">
                    ${htmlRespostas}
                </div>
            </div>
        `;
        document.body.appendChild(modal);

       // Bónus Visual: Deixa a barra de rolagem fininha e elegante (se o navegador suportar)
        const scrollBody = document.getElementById('ws-correcao-scroll-body');
        if (scrollBody) {
            scrollBody.style.scrollbarWidth = 'thin';
            scrollBody.style.scrollbarColor = '#cbd5e1 transparent';
        }
    }, // 🚀 VÍRGULA AQUI PARA SEPARAR DA LOUSA!

    // ========================================================================
    // 🖍️ LOUSA DIGITAL - MOTOR EM TEMPO REAL (VITE READY)
    // ========================================================================
    lousaInterval: null,
    _lousaSSE: null,
    _ultimoEstadoLousa: { ativa: false, recursos: false, turmaId: null },

    carregarTurmasLousaProf: async () => {
        const sel = document.getElementById('ws-prof-turma-lousa');
        if(!sel) return;
        try {
            const turmas = await Workspace.api('/turmas', 'GET');
            sel.innerHTML = '<option value="global">🌍 Público Geral</option>';
            if(turmas && turmas.length > 0) {
                turmas.forEach(t => {
                    const id = t.id || t._id || '';
                    const nome = t.nome || t.name || id;
                    if(id) sel.innerHTML += `<option value="${id}">📚 ${Workspace.escapeHTML ? Workspace.escapeHTML(nome) : nome}</option>`;
                });
            }
        } catch(e){ console.warn('Erro carregar turmas lousa', e); }
    },

    enviarComandoLousaDireto: async (tipo) => {
        const sel = document.getElementById('ws-prof-turma-lousa');
        const statusEl = document.getElementById('ws-lousa-prof-status');
        if (!sel) return alert('Selecione a turma');
        const turmaId = String(sel.value || 'global').trim();
        
        const payload = { turmaId, escolaId: Workspace.usuario?.escolaId || 'DEFAULT' };
        if(tipo === 'ativar') { payload.ativa = true; payload.recursos = false; }
        if(tipo === 'liberar') { payload.ativa = true; payload.recursos = true; }
        if(tipo === 'desativar') { payload.ativa = false; payload.recursos = false; }
        
        if(statusEl) statusEl.textContent = '⏳ Sincronizando...';
        if(window.Workspace.mostrarAvisoLocal) Workspace.mostrarAvisoLocal('Sincronizando com a turma... ⏳', 'info');
        
        try {
            await Workspace.api('/workspace/sala/workspace-lousa/status', 'PUT', payload);
            if(statusEl){
                if(tipo === 'ativar') statusEl.innerHTML = '🟡 Visualização ativa - Alunos vendo a sua lousa';
                if(tipo === 'liberar') statusEl.innerHTML = '🟢 Liberada - Alunos podem desenhar';
                if(tipo === 'desativar') statusEl.innerHTML = '⚪ Encerrada';
            }
            if(window.Workspace.mostrarAvisoLocal) Workspace.mostrarAvisoLocal('✅ Comando ativado! Alunos verão em instantes.', 'success');
        } catch(e) {
            if(statusEl) statusEl.textContent = '❌ Erro ao sincronizar';
            if(window.Workspace.mostrarAvisoLocal) Workspace.mostrarAvisoLocal('Erro ao sincronizar.', 'error');
        }
    },

    abrirLousaProfessor: (turmaId) => {
        const tid = String(turmaId || 'global').trim();
        const modal = document.getElementById('ws-modal-lousa-prof');
        const iframe = document.getElementById('iframeLousaProf');
        const label = document.getElementById('ws-prof-lousa-turma-label');
        const status = document.getElementById('ws-prof-lousa-status');
        if(label) label.textContent = tid === 'global' ? 'Público Geral' : tid;
        if(status) status.textContent = 'Ao vivo';
        if(iframe){
            iframe.setAttribute('src', `/workspace-lousa.html?role=professor&room=${encodeURIComponent(tid)}`);
        }
        if(modal){
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    },

    fecharLousaProfessor: () => {
        const modal = document.getElementById('ws-modal-lousa-prof');
        const iframe = document.getElementById('iframeLousaProf');
        if(modal) modal.style.display = 'none';
        if(iframe) iframe.setAttribute('src', '');
        document.body.style.overflow = '';
    },

    abrirLousaFullscreen: async () => {
        const modal = document.getElementById('ws-modal-lousa-aluno-fullscreen');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; 
        }
        Workspace.Avaliacoes.iniciarMonitorLousa(true);
        if (Workspace.usuario?.id) {
            try { await Workspace.api('/workspace/sala/workspace-lousa/aguardando', 'POST', { usuarioId: Workspace.usuario.id }); } catch(e){}
        }
    },

    fecharLousaFullscreen: () => {
        const modal = document.getElementById('ws-modal-lousa-aluno-fullscreen');
        if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
        Workspace.Avaliacoes.iniciarMonitorLousa(false);
        const iframe = document.getElementById('iframeLousaAluno');
        if (iframe) iframe.setAttribute('src', ''); 
        Workspace.Avaliacoes._ultimoEstadoLousa = { ativa: false, recursos: false, turmaId: null };
    },

    iniciarMonitorLousa: async (ligar) => {
        if (Workspace.Avaliacoes.lousaInterval) { clearInterval(Workspace.Avaliacoes.lousaInterval); Workspace.Avaliacoes.lousaInterval = null; }
        if (Workspace.Avaliacoes._lousaSSE) { try { Workspace.Avaliacoes._lousaSSE.close(); } catch(e){} Workspace.Avaliacoes._lousaSSE = null; }
        if (!ligar) return; 

        Workspace.Avaliacoes.falhasConexaoLousa = 0; // Memória de falhas
        let turmaId = 'global';
        let turmaIdNome = null;
        try {
            if (Workspace.usuario) {
                let t = Workspace.usuario.turma || Workspace.usuario.turmaId || Workspace.usuario.turmas?.[0] || 'global';
                if(Array.isArray(t)) t = t[0];
                if(typeof t === 'object' && t !== null){
                    turmaId = String(t.id || t._id || '').trim() || 'global';
                    turmaIdNome = String(t.nome || t.name || '').trim() || null;
                    if(turmaId === 'global' && turmaIdNome) turmaId = turmaIdNome;
                } else {
                    turmaId = String(t).trim() || 'global';
                }
            }
            try {
                const turmas = await Workspace.api('/turmas', 'GET');
                if(turmas && Array.isArray(turmas)){
                    const match = turmas.find(x => String(x.id) === turmaId || String(x.nome) === turmaId || String(x.nome) === turmaIdNome || String(x.id) === turmaIdNome);
                    if(match){ turmaIdNome = match.nome; turmaId = String(match.id); }
                }
            } catch(e){}
        } catch(e){ turmaId = 'global'; }

        const aplicarEstadoNaTela = (ativa, recursos) => {
            const placeholder = document.getElementById('ws-lousa-aluno-placeholder');
            const iframeDiv = document.getElementById('ws-lousa-aluno-ativa');
            const iframe = document.getElementById('iframeLousaAluno');
            const statusText = document.getElementById('statusLousaText');
            
            const locked = !recursos;

            if (ativa) {
                if (placeholder) placeholder.style.display = 'none';
                if (iframeDiv) iframeDiv.style.display = 'block';
                
                const urlMagica = `/workspace-lousa.html?role=aluno&room=${encodeURIComponent(turmaId)}&locked=${locked}`;
                
                if (iframe) {
                    const cur = iframe.getAttribute('src') || '';
                    if(!cur.includes(`room=${encodeURIComponent(turmaId)}`)) {
                        iframe.setAttribute('src', urlMagica);
                    } else {
                        // Mensagem mágica para destrancar a caneta sem recarregar o iframe!
                        iframe.contentWindow.postMessage({ type: 'LOCK_STATE', locked: locked }, '*');
                    }
                }
                if (statusText) {
                    statusText.innerHTML = recursos ? '<span style="color:#10B981; font-weight:bold;">🟢 Desenho Liberado</span>' : '<span style="color:#F59E0B; font-weight:bold;">🟡 Visualização ao vivo (Somente Leitura)</span>';
                }
            } else {
                if (placeholder) placeholder.style.display = 'flex';
                if (iframeDiv) iframeDiv.style.display = 'none';
                if (iframe) iframe.setAttribute('src', '');
                if (statusText) statusText.innerHTML = '💤 Aguardando o Professor ativar...';
            }
        };

        const verificarStatus = async () => {
            try {
                let res = await Workspace.api(`/workspace/sala/workspace-lousa/status/${encodeURIComponent(turmaId)}`, 'GET');
                if((!res?.ativa) && turmaIdNome && turmaIdNome !== turmaId){
                    const resNome = await Workspace.api(`/workspace/sala/workspace-lousa/status/${encodeURIComponent(turmaIdNome)}`, 'GET');
                    if(resNome?.ativa) res = resNome;
                }
                
                if (res?.success) {
                    Workspace.Avaliacoes.falhasConexaoLousa = 0; 
                    if (res.ativa) {
                        aplicarEstadoNaTela(res.ativa, res.recursos);
                    } else if(turmaId !== 'global'){
                        const rg = await Workspace.api(`/workspace/sala/workspace-lousa/status/global`, 'GET');
                        if(rg?.success && rg.ativa) aplicarEstadoNaTela(rg.ativa, rg.recursos);
                        else aplicarEstadoNaTela(false, false);
                    } else {
                        aplicarEstadoNaTela(false, false);
                    }
                } else {
                    throw new Error("Falha na API");
                }
            } catch(e) { 
                Workspace.Avaliacoes.falhasConexaoLousa++;
                if (Workspace.Avaliacoes.falhasConexaoLousa >= 3) {
                    aplicarEstadoNaTela(false, false); 
                }
            }
        };

        verificarStatus(); 
        Workspace.Avaliacoes.lousaInterval = setInterval(verificarStatus, 3000);

        try {
            const escolaId = Workspace.usuario?.escolaId || 'DEFAULT';
            const es = new EventSource(`/api/workspace/stream?escolaId=${encodeURIComponent(escolaId)}`);
            Workspace.Avaliacoes._lousaSSE = es;
            es.onmessage = (ev) => {
                try {
                    const data = JSON.parse(ev.data);
                    if(data.type === 'LOUSA_STATUS_CHANGED' && (data.turmaId === turmaId || data.turmaId === 'global' || turmaId === 'global')){
                        aplicarEstadoNaTela(data.ativa, data.recursos);
                    }
                } catch(e){}
            };
        } catch(e){}
    }
}); // <--- 🚀 ESTA LINHA FECHA O Object.assign E É MUITO IMPORTANTE!

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (Workspace.usuario && Workspace.usuario.tipo !== 'Aluno') {
            if (Workspace.Avaliacoes.carregarTurmasLousaProf) Workspace.Avaliacoes.carregarTurmasLousaProf();
        }
    }, 1500);
});
