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
        } else if (Workspace.usuario && (Workspace.usuario.tipo === 'Professor' || Workspace.usuario.tipo === 'Gestor')) {
            // 🚀 Acorda o "Detetive de Memória" para o Professor
            Workspace.Avaliacoes.restaurarTelaProfessor();
            // 🚀 Liga o radar também para o professor para atualizar números em tempo real
            Workspace.Avaliacoes.iniciarRadarAvaliacoes(); 
        }
    },

    // ========================================================================
    // 🧠 MEMÓRIA FOTOGRÁFICA DO PROFESSOR (Restauração de Tela)
    // ========================================================================
    restaurarTelaProfessor: () => {
        // 1. Pergunta ao navegador: "Onde é que o professor estava?"
        const telaSalva = localStorage.getItem('ws_avaliacoes_prof_subtela');
        
        if (!telaSalva || telaSalva === 'menu') {
            if (Workspace.Avaliacoes.voltarMenuProf) Workspace.Avaliacoes.voltarMenuProf(true);
            return;
        }

        // 2. O Roteador Automático: Executa a função correspondente de forma silenciosa (restauro = true)
        switch (telaSalva) {
            case 'submenu_criar':
                if (Workspace.Avaliacoes.mostrarSubmenuCriar) Workspace.Avaliacoes.mostrarSubmenuCriar(true);
                break;
            case 'submenu_gestao':
                if (Workspace.Avaliacoes.mostrarSubmenuGestao) Workspace.Avaliacoes.mostrarSubmenuGestao(true);
                break;
            case 'nova_escrita':
                if (Workspace.Avaliacoes.abrirNovaEscrita) Workspace.Avaliacoes.abrirNovaEscrita(true);
                break;
            case 'nova_oral':
                if (Workspace.Avaliacoes.abrirNovaOral) Workspace.Avaliacoes.abrirNovaOral(true);
                break;
            case 'nova_online':
                if (Workspace.Avaliacoes.abrirNovaOnline) Workspace.Avaliacoes.abrirNovaOnline(true);
                break;
            case 'gerir':
                // Lê também se o professor estava nas Ativas ou nas Arquivadas
                const abaGestao = localStorage.getItem('ws_aba_encontros_arquivo') || 'ativas';
                Workspace.Avaliacoes.abaEncontrosArquivo = abaGestao;
                if (Workspace.Avaliacoes.abrirGerenciador) Workspace.Avaliacoes.abrirGerenciador(true);
                break;
            case 'recebidas':
                if (Workspace.Avaliacoes.abrirRecebidas) Workspace.Avaliacoes.abrirRecebidas(true);
                break;
            default:
                if (Workspace.Avaliacoes.voltarMenuProf) Workspace.Avaliacoes.voltarMenuProf(true);
                break;
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
                const meuId = String(Workspace.usuario.id);
                const meuRefId = Workspace.usuario.alunoRefId ? String(Workspace.usuario.alunoRefId) : meuId;
                souConvidado = a.convidados.some(c => String(c.id) === meuId || String(c.id) === meuRefId || (c.userId && String(c.userId) === meuId));
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
            if (document.visibilityState === 'hidden' && !Workspace.Avaliacoes.exameAtivo && !Workspace.Avaliacoes.estudioAtivo) return;
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
        
        if (!link || link === '#') {
            Workspace.mostrarAviso("Nenhum link foi fornecido para esta sessão.", "warning");
            return;
        }

        const payloadPresenca = {
            respostas: {},
            alunoId: Workspace.usuario.id,
            alunoRefId: Workspace.usuario.alunoRefId || Workspace.usuario.id,
            alunoNome: Workspace.usuario.nome || Workspace.usuario.login,
            relatorioFraude: { fugas: 0, tempoFora: 0 }
        };

        // 1. Dispara o registo direto para o servidor IMEDIATAMENTE antes da mudança de aba
        const promessaRegisto = Workspace.api(`/workspace/avaliacoes/${id}/entregar`, 'POST', payloadPresenca);

        // 2. Abre a sala de aula online numa nova aba
        window.open(link, '_blank', 'noopener,noreferrer');

        // 3. Atualiza os lobbies locais assim que o servidor confirmar
        try {
            await promessaRegisto;
            Workspace.Avaliacoes.carregarLobbies();
        } catch (e) {
            console.log("Erro ao registar a presença silenciosa.", e);
        }
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
            
            // 🚀 O FILTRO ABSOLUTO DE TURMA E VIP (Compatível com ID de Login e alunoRefId)
            const souConvidado = a.convidados && a.convidados.some(c => String(c.id) === meuIdLogin || String(c.id) === meuIdMatricula || (c.userId && String(c.userId) === meuIdLogin));
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
                    const textTentativa = Workspace.Avaliacoes.abaEscrita === 'pendentes' ? `Tentativa ${tentativaAtual} de ${maxTentativas}` : `Concluída (${maxTentativas})`;
                    const ultimaEntrega = [...Workspace.Avaliacoes.entregasFeitas].reverse().find(e => e.avaliacaoId === p.id);
                    const badgeNotaAluno = (ultimaEntrega && ultimaEntrega.notaFinal !== undefined && ultimaEntrega.notaFinal !== null)
                        ? `<span style="background:#fef3c7; color:#b45309; border:1px solid #fde68a; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:800; margin-left:6px;">🌟 Nota: ${ultimaEntrega.notaFinal}%</span>`
                        : '';
                    const badgeFeedbackAluno = (ultimaEntrega && ultimaEntrega.feedbackProf)
                        ? `<span style="background:#ecfdf5; color:#059669; border:1px solid #a7f3d0; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:700; margin-left:4px;">💬 Com Feedback</span>`
                        : '';
                    return `
                    <div style="background: #fff; border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                        <div>
                            <h4 style="margin: 0 0 5px 0; color: #2c3e50;">${Workspace.escapeHTML(p.titulo)} ${badgeNotaAluno} ${badgeFeedbackAluno}</h4>
                            <span style="font-size: 11px; color: #7f8c8d;">⏱️ ${p.tempo ? p.tempo + ' min' : 'Livre'} | 📝 ${p.questoes ? p.questoes.length : 0} Q. | 🔄 ${textTentativa}</span>
                        </div>
                        ${Workspace.Avaliacoes.abaEscrita === 'pendentes' ? `<button class="ws-btn" style="background: #3498db; padding: 8px 15px; font-size: 12px; border-radius: 20px;" onclick="Workspace.Avaliacoes.iniciarExame('${p.id}')">Iniciar Exame</button>` : `<button class="ws-btn" style="background: #27ae60; padding: 8px 15px; font-size: 12px; border-radius: 20px;" onclick="Workspace.Avaliacoes.verMinhaCorrecao('${ultimaEntrega?.id}', '${p.id}')">Ver Respostas e Nota</button>`}
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
                    const textTentativa = Workspace.Avaliacoes.abaOral === 'pendentes' ? `Tentativa ${tentativaAtual} de ${maxTentativas}` : `Concluído (${maxTentativas})`;
                    const badgeNotaOral = (ultimaEntrega && ultimaEntrega.notaFinal !== undefined && ultimaEntrega.notaFinal !== null)
                        ? `<span style="background:#fef3c7; color:#b45309; border:1px solid #fde68a; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:800; margin-left:6px;">🌟 Nota: ${ultimaEntrega.notaFinal}%</span>`
                        : '';
                    return `
                    <div style="background: #fff; border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                        <div>
                            <h4 style="margin: 0 0 5px 0; color: #2c3e50;">${Workspace.escapeHTML(p.titulo)} ${badgeNotaOral}</h4>
                            <span style="font-size: 11px; color: #7f8c8d;">🔊 Áudio | 🔄 ${textTentativa}</span>
                        </div>
                        ${Workspace.Avaliacoes.abaOral === 'pendentes' ? `<button class="ws-btn" style="background: #3498db; padding: 8px 15px; font-size: 12px; border-radius: 20px;" onclick="Workspace.Avaliacoes.iniciarTesteOral('${p.id}')">Ir ao Estúdio</button>` : `<button class="ws-btn" style="background: #27ae60; padding: 8px 15px; font-size: 12px; border-radius: 20px;" onclick="Workspace.Avaliacoes.verMinhaCorrecao('${ultimaEntrega?.id}', '${p.id}')">Ouvir e Ver Nota</button>`}
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
                    <div id="sessao-online-${p.id}" style="background: #fff; border: 1px solid #eee; border-left: 4px solid #8e44ad; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.02); transition: 0.3s;">
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
            
            // 🚀 CORREÇÃO: Obriga a lista de turmas da Lousa a carregar imediatamente!
            if (Workspace.Avaliacoes.carregarTurmasLousaProf) {
                Workspace.Avaliacoes.carregarTurmasLousaProf();
            }
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
   // 🪄 IDEIA 1: Injeta a barra do Gerador de Provas com IA no Construtor de Questões
    injetarBarraGeradorIA: () => {
        if (document.getElementById('ws-box-gerador-ia-prova')) return;
        const builderEl = document.getElementById('ws-builder-questoes');
        if (!builderEl || !builderEl.parentElement) return;

        const barraIA = document.createElement('div');
        barraIA.id = 'ws-box-gerador-ia-prova';
        barraIA.style.cssText = 'background: linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%); border: 1.5px solid #c7d2fe; border-radius: 12px; padding: 16px; margin-bottom: 18px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.06);';
        barraIA.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
                <span style="font-size:13.5px; font-weight:800; color:#4338ca; display:flex; align-items:center; gap:6px;">🪄 Gerador Mágico de Provas com IA (1 Clique)</span>
                <span style="font-size:11px; color:#6366f1; background:#e0e7ff; padding:3px 10px; border-radius:20px; font-weight:700;">Cria perguntas e gabarito automaticamente</span>
            </div>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:10px; align-items:end;">
                <div style="grid-column: span 2; min-width: 200px;">
                    <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Tema ou Assunto da Prova *</label>
                    <input type="text" id="ws-ia-prova-tema" placeholder="Ex: Simple Past vs Present Perfect, Viagem, Restaurante..." style="width:100%; padding:10px 12px; border-radius:8px; border:1px solid #cbd5e1; font-size:13px; background:#fff; outline:none;">
                </div>
                <div>
                    <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Nível CEFR</label>
                    <select id="ws-ia-prova-nivel" style="width:100%; padding:10px; border-radius:8px; border:1px solid #cbd5e1; font-size:13px; background:#fff; cursor:pointer; font-weight:600;">
                        <option value="A1">🟢 A1 (Iniciante)</option>
                        <option value="A2">🟢 A2 (Básico)</option>
                        <option value="B1" selected>🟡 B1 (Intermediário)</option>
                        <option value="B2">🟡 B2 (Pós-Interm.)</option>
                        <option value="C1">🔴 C1 (Avançado)</option>
                    </select>
                </div>
                <div>
                    <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Quantidade</label>
                    <select id="ws-ia-prova-qtd" style="width:100%; padding:10px; border-radius:8px; border:1px solid #cbd5e1; font-size:13px; background:#fff; cursor:pointer; font-weight:600;">
                        <option value="3">3 Questões</option>
                        <option value="5" selected>5 Questões</option>
                        <option value="8">8 Questões</option>
                        <option value="10">10 Questões</option>
                    </select>
                </div>
                <div>
                    <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Formato</label>
                    <select id="ws-ia-prova-formato" style="width:100%; padding:10px; border-radius:8px; border:1px solid #cbd5e1; font-size:13px; background:#fff; cursor:pointer; font-weight:600;">
                        <option value="escolha" selected>🔘 Só Múltipla Escolha</option>
                        <option value="misto">⚖️ Misto (Escolha + Texto)</option>
                        <option value="texto">📝 Só Dissertativas</option>
                    </select>
                </div>
            </div>
            <button type="button" id="ws-btn-gerar-prova-ia" onclick="Workspace.Avaliacoes.gerarQuestoesComIA()" class="ws-btn" style="width:100%; margin-top:12px; background:linear-gradient(135deg, #4f46e5, #7c3aed); color:#fff; padding:11px; border-radius:8px; font-size:13px; font-weight:800; border:none; cursor:pointer; box-shadow:0 4px 12px rgba(79,70,229,0.25);">
                🪄 Gerar Questões com Inteligência Artificial
            </button>
        `;
        builderEl.parentElement.insertBefore(barraIA, builderEl);
    },

    gerarQuestoesComIA: async () => {
        const inputTema = document.getElementById('ws-ia-prova-tema');
        const selNivel = document.getElementById('ws-ia-prova-nivel');
        const selQtd = document.getElementById('ws-ia-prova-qtd');
        const selFormato = document.getElementById('ws-ia-prova-formato');
        const btn = document.getElementById('ws-btn-gerar-prova-ia');

        const tema = inputTema ? inputTema.value.trim() : '';
        if (!tema) {
            return Workspace.mostrarAviso("Digite o tema ou assunto para a IA criar as questões!", "warning");
        }

        const txtOriginal = btn ? btn.innerHTML : '🪄 Gerar Questões com Inteligência Artificial';
        if (btn) {
            btn.innerHTML = '🧠 A IA está a elaborar as questões e o gabarito... ⏳';
            btn.disabled = true;
            btn.style.opacity = '0.75';
        }

        try {
            const res = await Workspace.api('/workspace/avaliacoes/gerar-ia', 'POST', {
                tema: tema,
                nivel: selNivel ? selNivel.value : 'B1',
                quantidade: selQtd ? parseInt(selQtd.value, 10) : 5,
                formato: selFormato ? selFormato.value : 'escolha'
            });

            if (res && res.success && Array.isArray(res.questoes) && res.questoes.length > 0) {
                const inputTitulo = document.getElementById('ws-nova-prova-titulo');
                if (inputTitulo && !inputTitulo.value.trim() && res.tituloSugerido) {
                    inputTitulo.value = res.tituloSugerido;
                }

                res.questoes.forEach(q => {
                    const tipoQuestao = q.tipo === 'texto' ? 'texto' : 'escolha';
                    Workspace.Avaliacoes.adicionarQuestaoBuilder(tipoQuestao, q);
                });

                Workspace.mostrarAviso(`🎉 ${res.questoes.length} questões geradas com sucesso! Revise-as abaixo.`, "success");
            } else {
                Workspace.mostrarAviso((res && res.error) || "Não foi possível gerar as questões.", "error");
            }
        } catch (e) {
            Workspace.mostrarAviso("Erro de comunicação com o Gerador IA.", "error");
        } finally {
            if (btn) {
                btn.innerHTML = txtOriginal;
                btn.disabled = false;
                btn.style.opacity = '1';
            }
        }
    },

    abrirNovaEscrita: (restauro = false) => {
        if(!restauro) localStorage.setItem('ws_avaliacoes_prof_subtela', 'nova_escrita');
        Workspace.Avaliacoes.carregarTurmasProf();
        Workspace.Avaliacoes.injetarBarraGeradorIA();
        Workspace.Avaliacoes.avaliacaoEmEdicao = null;
        document.getElementById('ws-btn-salvar-escrita').innerText = "🚀 Publicar Exame";
        document.getElementById('ws-prof-submenu-criar').style.display = 'none';
        document.getElementById('ws-prof-nova-escrita').style.display = 'block';
        document.getElementById('ws-nova-prova-titulo').value = '';
        document.getElementById('ws-nova-prova-tempo').value = 60;
        document.getElementById('ws-nova-prova-tentativas').value = 1;
        document.getElementById('ws-nova-prova-destino').value = 'global';
        document.getElementById('ws-builder-questoes').innerHTML = '';
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

  // 🛡️ Verifica se o aluno está estritamente ATIVO no Sistema Principal (ignora Cancelados, Trancados, Excluídos e Inativos)
    ehAlunoAtivo: (aluno) => {
        if (!aluno) return false;
        const st = String(aluno.status || 'Ativo').trim().toLowerCase();
        if (st.includes('cancel') || st.includes('tranc') || st.includes('exclu') || st.includes('inativ') || st.includes('desist')) {
            return false;
        }
        return st === 'ativo' || st === '';
    },

    // 🔄 Cruza a ficha da secretaria (/alunos) com o perfil escolhido pelo aluno no WorkSpace (/usuarios) mantendo APENAS alunos Ativos!
    sincronizarIdentidadesAlunos: (alunosBrutos, usuariosBrutos, mapaAvatars) => {
        const listaBruta = Array.isArray(alunosBrutos) ? alunosBrutos : [];
        // Filtra imediatamente para que alunos Cancelados/Trancados/Excluídos jamais entrem nas turmas do WorkSpace!
        const alunos = listaBruta.filter(a => Workspace.Avaliacoes.ehAlunoAtivo(a));

        const usuarios = Array.isArray(usuariosBrutos) ? usuariosBrutos : [];
        const avatares = mapaAvatars && !mapaAvatars.error ? mapaAvatars : {};

        window.Workspace.avatarsCache = window.Workspace.avatarsCache || {};
        Object.entries(avatares).forEach(([k, v]) => {
            if (k && v) window.Workspace.avatarsCache[k.trim()] = v;
        });

        const mapaUsuariosPorRef = {};
        const mapaUsuariosPorNome = {};

        usuarios.forEach(u => {
            const nomeEscolhido = String(u.nome || u.login || '').trim();
            const foto = u.avatar || (nomeEscolhido && window.Workspace.avatarsCache[nomeEscolhido]) || null;

            if (nomeEscolhido && foto) {
                window.Workspace.avatarsCache[nomeEscolhido] = foto;
            }
            if (u.id) mapaUsuariosPorRef[String(u.id)] = { ...u, nomeEscolhido, foto };
            if (u.alunoRefId) mapaUsuariosPorRef[String(u.alunoRefId)] = { ...u, nomeEscolhido, foto };
            if (u.login) mapaUsuariosPorNome[String(u.login).toLowerCase().trim()] = { ...u, nomeEscolhido, foto };
            if (u.nome) mapaUsuariosPorNome[String(u.nome).toLowerCase().trim()] = { ...u, nomeEscolhido, foto };
        });

        Workspace.Avaliacoes.mapaUsuariosWorkspace = { porId: mapaUsuariosPorRef, porNome: mapaUsuariosPorNome };

        return alunos.map(a => {
            const nomeOriginal = String(a.nome || '').trim();
            const conta = (a.id && mapaUsuariosPorRef[String(a.id)])
                || (nomeOriginal && mapaUsuariosPorNome[nomeOriginal.toLowerCase()])
                || (a.login && mapaUsuariosPorNome[String(a.login).toLowerCase().trim()])
                || null;

            const nomeFinal = (conta && conta.nomeEscolhido) ? conta.nomeEscolhido : nomeOriginal;
            const fotoFinal = (conta && conta.foto)
                || a.avatar
                || window.Workspace.avatarsCache[nomeFinal]
                || window.Workspace.avatarsCache[nomeOriginal]
                || null;

            if (fotoFinal) {
                if (nomeFinal) window.Workspace.avatarsCache[nomeFinal] = fotoFinal;
                if (nomeOriginal) window.Workspace.avatarsCache[nomeOriginal] = fotoFinal;
            }

            return {
                ...a,
                userId: conta ? conta.id : a.userId,
                nomeMatricula: nomeOriginal,
                nome: nomeFinal,
                avatar: fotoFinal
            };
        });
    },

    // 🔍 Resolve o nome escolhido e a foto atual para qualquer entrega ou acesso
    resolverIdentidadeEntrega: (entregaOuNome) => {
        const mapa = Workspace.Avaliacoes.mapaUsuariosWorkspace || { porId: {}, porNome: {} };
        const cacheFotos = window.Workspace.avatarsCache || {};

        if (typeof entregaOuNome === 'string') {
            const bruto = entregaOuNome.trim();
            const matchAp = bruto.match(/^(.*?)\s*\(@([^)]+)\)\s*$/);
            const limpo = matchAp ? matchAp[2].trim() : bruto;
            const conta = mapa.porNome[limpo.toLowerCase()] || (matchAp && mapa.porNome[matchAp[1].trim().toLowerCase()]);
            const nomeFinal = (conta && conta.nomeEscolhido) ? conta.nomeEscolhido : limpo;
            const fotoFinal = (conta && conta.foto) || cacheFotos[nomeFinal] || cacheFotos[bruto] || null;
            return { nome: nomeFinal, avatar: fotoFinal };
        }

        const e = entregaOuNome || {};
        const bruto = String(e.alunoNome || 'Aluno').trim();
        const matchAp = bruto.match(/^(.*?)\s*\(@([^)]+)\)\s*$/);
        const parteApelido = matchAp ? matchAp[2].trim() : bruto;
        const parteCompleta = matchAp ? matchAp[1].trim() : bruto;

        const conta = (e.alunoId && mapa.porId[String(e.alunoId)])
            || (e.alunoRefId && mapa.porId[String(e.alunoRefId)])
            || mapa.porNome[parteApelido.toLowerCase()]
            || mapa.porNome[parteCompleta.toLowerCase()]
            || null;

        const nomeFinal = (conta && conta.nomeEscolhido) ? conta.nomeEscolhido : parteApelido;
        const fotoFinal = e.alunoAvatar || (conta && conta.foto) || cacheFotos[nomeFinal] || cacheFotos[parteCompleta] || null;

        if (fotoFinal && nomeFinal) {
            window.Workspace.avatarsCache = window.Workspace.avatarsCache || {};
            window.Workspace.avatarsCache[nomeFinal] = fotoFinal;
        }

        return { nome: nomeFinal, avatar: fotoFinal };
    },

    abrirGerenciador: async (restauro = false) => {
        if(!restauro) localStorage.setItem('ws_avaliacoes_prof_subtela', 'gerir');
        
        document.getElementById('ws-prof-menu-avaliacoes').style.display = 'none'; 
        document.getElementById('ws-prof-submenu-gestao').style.display = 'none'; 
        document.getElementById('ws-prof-menu-encontros').style.display = 'none'; 
        document.getElementById('ws-prof-gerir-lista-container').style.display = 'block';
        
        if (Workspace.Avaliacoes.avaliacoesGerenciadorCache && Workspace.Avaliacoes.avaliacoesGerenciadorCache.length > 0) {
            Workspace.Avaliacoes.renderizarListaGerenciador();
        } else {
            const container = document.getElementById('ws-prof-gerir-lista'); 
            if (container) container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">Carregando dados da nuvem... ⏳</div>';
        }

        try {
            const pAlunos = Workspace.api(`/alunos?_t=${Date.now()}`, 'GET');
            const pUsuarios = Workspace.api(`/usuarios?_t=${Date.now()}`, 'GET');
            const pAvatars = Workspace.api(`/workspace/avatars?_t=${Date.now()}`, 'GET');
            const pAvals = Workspace.api(`/workspace/avaliacoes?escolaId=${Workspace.usuario.escolaId}&_t=${Date.now()}`, 'GET');
            const pEntregas = Workspace.api(`/workspace/avaliacoes/entregas?_t=${Date.now()}`, 'GET');
            
            const [resAlunos, resUsuarios, resAvatars, resAvals, resEntregas] = await Promise.all([pAlunos, pUsuarios, pAvatars, pAvals, pEntregas]);

            let houveMudanca = false;

            if (resAlunos && !resAlunos.error) {
                Workspace.Avaliacoes.todosAlunosCache = Workspace.Avaliacoes.sincronizarIdentidadesAlunos(resAlunos, resUsuarios, resAvatars);
                houveMudanca = true;
            }
            if (resAvals && resAvals.success) {
                Workspace.Avaliacoes.avaliacoesGerenciadorCache = resAvals.avaliacoes || [];
                houveMudanca = true;
            }
            if (resEntregas && resEntregas.success) {
                Workspace.Avaliacoes.entregasEmCache = resEntregas.entregas || [];
                houveMudanca = true;
            }

            if (houveMudanca) {
                Workspace.Avaliacoes.renderizarListaGerenciador();
            }

        } catch(e) { 
            console.error("Erro no background:", e);
            if (!Workspace.Avaliacoes.avaliacoesGerenciadorCache || Workspace.Avaliacoes.avaliacoesGerenciadorCache.length === 0) {
                document.getElementById('ws-prof-gerir-lista').innerHTML = '<div style="text-align: center; padding: 40px; color: #e74c3c;">Erro ao conectar à nuvem. Verifique a internet.</div>'; 
            }
        }
    }, // <--- 🚨 VÍRGULA VITAL!

   // 🔤 Remove acentos e padroniza minúsculas para a Pesquisa Universal (OmniSearch)
    normalizarTextoBusca: (str) => {
        if (!str) return '';
        return String(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    },

    limparBuscaGerenciador: () => {
        const input = document.getElementById('ws-busca-avaliacoes');
        if (input) {
            input.value = '';
            input.focus();
        }
        Workspace.Avaliacoes.renderizarListaGerenciador('', true);
    },

    copiarLinkSala: (link) => {
        if (!link) return;
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(link).then(() => {
                Workspace.mostrarAviso("🔗 Link da sessão copiado para a área de transferência!", "success");
            });
        } else {
            const ta = document.createElement('textarea');
            ta.value = link;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            Workspace.mostrarAviso("🔗 Link da sessão copiado!", "success");
        }
    },

    renderizarListaGerenciador: (termoBusca = null, apenasCards = false) => {
        const container = document.getElementById('ws-prof-gerir-lista');
        if (!container) return;

        const inputExistente = document.getElementById('ws-busca-avaliacoes');
        if (termoBusca === null) {
            termoBusca = inputExistente ? inputExistente.value : '';
        }

        const btnLimpar = document.getElementById('ws-btn-limpar-busca-aval');
        if (btnLimpar) {
            btnLimpar.style.display = termoBusca.trim().length > 0 ? 'flex' : 'none';
        }

        const norm = Workspace.Avaliacoes.normalizarTextoBusca;
        const termoNorm = norm(termoBusca);

        let avaliacoes = Workspace.Avaliacoes.avaliacoesGerenciadorCache || [];
        const contexto = Workspace.Avaliacoes.contextoAtual;
        const abaAtiva = Workspace.Avaliacoes.abaEncontrosArquivo || 'ativas';

        if (contexto === 'encontros') {
            if (abaAtiva === 'ativas') avaliacoes = avaliacoes.filter(a => a.tipo === 'online' && a.status !== 'arquivada');
            else avaliacoes = avaliacoes.filter(a => a.tipo === 'online' && a.status === 'arquivada');
        } else {
            avaliacoes = avaliacoes.filter(a => a.tipo !== 'online');
        }

        // Cache auxiliar de alunos de cada avaliação para a OmniSearch e para o Destaque Individual (Ideia 5)
        const mapaAlunosDaSessao = {};
        const mapaPresencasDaSessao = {};

        avaliacoes.forEach(a => {
            let alunosSessao = [];
            if (Workspace.Avaliacoes.todosAlunosCache) {
                const alunosDaTurma = Workspace.Avaliacoes.todosAlunosCache.filter(aluno => {
                    return Workspace.verificarTurma(aluno, a.destino, a.destinoNome);
                });
                alunosSessao = [...alunosDaTurma];

                const convidados = a.convidados || [];
                convidados.forEach(c => {
                    if (!alunosSessao.some(al => String(al.id) === String(c.id))) {
                        const identConv = Workspace.Avaliacoes.resolverIdentidadeEntrega({ alunoId: c.id, alunoNome: c.nome });
                        alunosSessao.push({
                            id: c.id,
                            nome: identConv.nome || c.nome,
                            nomeMatricula: c.nome,
                            avatar: identConv.avatar || null,
                            isConvidado: true
                        });
                    }
                });
            }
            mapaAlunosDaSessao[a.id] = alunosSessao;
            mapaPresencasDaSessao[a.id] = (Workspace.Avaliacoes.entregasEmCache || []).filter(e => e.avaliacaoId === a.id);
        });

        // 🔍 MOTOR OMNISEARCH: Pesquisa por Título, Turma, Link, Data/Hora, Questões, Tipo e Nomes de Alunos!
        if (termoNorm !== '') {
            avaliacoes = avaliacoes.filter(a => {
                const dataCriacaoFmt = a.dataCriacao ? new Date(a.dataCriacao).toLocaleDateString('pt-BR') : '';
                let dataAgendadaFmt = '';
                if (a.dataAgendada && a.dataAgendada.includes('T')) {
                    const pT = a.dataAgendada.split('T');
                    const pD = pT[0].split('-');
                    if (pD.length === 3) dataAgendadaFmt = `${pD[2]}/${pD[1]}/${pD[0]} ${pT[1].substring(0, 5)}`;
                }

                const textosQuestoes = Array.isArray(a.questoes)
                    ? a.questoes.map(q => `${q.pergunta || ''} ${(q.opcoes || []).join(' ')}`).join(' ')
                    : '';

                const camposDiretos = norm([
                    a.titulo,
                    a.destinoNome,
                    a.destino,
                    a.linkSala,
                    a.instrucoes,
                    a.tipo === 'online' ? 'online ao vivo sessao link meet zoom' : (a.tipo === 'oral' ? 'oral audio voz' : 'escrita prova exame'),
                    a.status,
                    dataCriacaoFmt,
                    dataAgendadaFmt,
                    textosQuestoes
                ].join(' '));

                if (camposDiretos.includes(termoNorm)) return true;

                // Procura nos alunos da turma / convidados
                const alunosSessao = mapaAlunosDaSessao[a.id] || [];
                const achouAlunoTurma = alunosSessao.some(al => {
                    return norm(al.nome).includes(termoNorm)
                        || norm(al.nomeMatricula).includes(termoNorm)
                        || norm(al.login).includes(termoNorm);
                });
                if (achouAlunoTurma) return true;

                // Procura nos alunos que já entregaram/acessaram
                const presencas = mapaPresencasDaSessao[a.id] || [];
                return presencas.some(e => {
                    const ident = Workspace.Avaliacoes.resolverIdentidadeEntrega(e);
                    return norm(ident.nome).includes(termoNorm) || norm(e.alunoNome).includes(termoNorm);
                });
            });
        }

        // Constrói o HTML apenas dos cartões
        let htmlCards = '';
        if (avaliacoes.length === 0) {
            htmlCards = `<div style="text-align: center; padding: 40px; color: #94a3b8; background: #fff; border-radius: 12px; border: 1px dashed #cbd5e1;">🔍 Nenhum resultado encontrado para <strong>"${Workspace.escapeHTML(termoBusca)}"</strong>.</div>`;
        } else {
            htmlCards = avaliacoes.map(a => {
                let icone = '🖥️'; 
                if (a.tipo === 'escrita') icone = '✍️'; 
                if (a.tipo === 'oral') icone = '🎤';

                const alunosSessao = mapaAlunosDaSessao[a.id] || [];
                const totalAlunos = alunosSessao.length;
                const presencasReais = mapaPresencasDaSessao[a.id] || [];
                const presencasCount = presencasReais.length;
                const faltam = Math.max(0, totalAlunos - presencasCount);

                // 🎯 IDEIA 5: Destaque Inteligente do Aluno Pesquisado no Cartão
                let htmlDestaquePesquisaAluno = '';
                if (termoNorm.length >= 2) {
                    const alunosEncontrados = [];
                    alunosSessao.forEach(al => {
                        if (norm(al.nome).includes(termoNorm) || norm(al.nomeMatricula).includes(termoNorm) || norm(al.login).includes(termoNorm)) {
                            const registo = presencasReais.find(e =>
                                String(e.alunoId) === String(al.id) ||
                                (al.userId && String(e.alunoId) === String(al.userId)) ||
                                (e.alunoRefId && String(e.alunoRefId) === String(al.id)) ||
                                norm(e.alunoNome) === norm(al.nome) ||
                                (al.nomeMatricula && norm(e.alunoNome).includes(norm(al.nomeMatricula)))
                            );
                            alunosEncontrados.push({ nome: al.nome, avatar: al.avatar, registo, bloqueado: (a.ocultos || []).includes(String(al.id)) });
                        }
                    });

                    // Caso seja turma global sem lista prévia mas o aluno já tenha entrega/acesso registado
                    if (alunosEncontrados.length === 0) {
                        presencasReais.forEach(e => {
                            const ident = Workspace.Avaliacoes.resolverIdentidadeEntrega(e);
                            if (norm(ident.nome).includes(termoNorm) || norm(e.alunoNome).includes(termoNorm)) {
                                alunosEncontrados.push({ nome: ident.nome, avatar: ident.avatar, registo: e, bloqueado: false });
                            }
                        });
                    }

                    if (alunosEncontrados.length > 0) {
                        const badgesAlunos = alunosEncontrados.slice(0, 3).map(item => {
                            const avMini = window.Workspace.renderizarAvatar(item.nome, 22, item.avatar);
                            if (item.registo) {
                                const hora = item.registo.dataEntrega
                                    ? new Date(item.registo.dataEntrega).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                                    : '';
                                return `<div style="display:inline-flex; align-items:center; gap:6px; background:#ecfdf5; border:1px solid #6ee7b7; color:#065f46; padding:4px 10px; border-radius:20px; font-size:11.5px; font-weight:700;">${avMini} <span>${Workspace.escapeHTML(item.nome)}: ✅ ${a.tipo === 'online' ? 'Presente' : 'Entregue'}${hora ? ` às ${hora}` : ''}</span></div>`;
                            } else if (item.bloqueado) {
                                return `<div style="display:inline-flex; align-items:center; gap:6px; background:#fef2f2; border:1px solid #fecaca; color:#991b1b; padding:4px 10px; border-radius:20px; font-size:11.5px; font-weight:700;">${avMini} <span>${Workspace.escapeHTML(item.nome)}: ⏸️ Bloqueado</span></div>`;
                            } else if (a.status === 'arquivada') {
                                return `<div style="display:inline-flex; align-items:center; gap:6px; background:#fef2f2; border:1px solid #fecaca; color:#dc2626; padding:4px 10px; border-radius:20px; font-size:11.5px; font-weight:700;">${avMini} <span>${Workspace.escapeHTML(item.nome)}: ❌ Ausente</span></div>`;
                            } else {
                                return `<div style="display:inline-flex; align-items:center; gap:6px; background:#eff6ff; border:1px solid #bfdbfe; color:#1e40af; padding:4px 10px; border-radius:20px; font-size:11.5px; font-weight:700;">${avMini} <span>${Workspace.escapeHTML(item.nome)}: ⏳ Aguardando</span></div>`;
                            }
                        }).join('');

                        htmlDestaquePesquisaAluno = `<div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:8px; padding-top:8px; border-top:1px dashed #e2e8f0;">${badgesAlunos}</div>`;
                    }
                }

                // 👥 IDEIA 4: Radar Visual de Avatares Empilhados no Cartão
                let htmlAvataresEmpilhados = '';
                if (presencasReais.length > 0) {
                    const maxAvatares = 6;
                    const visiveis = presencasReais.slice(0, maxAvatares);
                    const extras = presencasReais.length - visiveis.length;

                    const pilha = visiveis.map((ent, idx) => {
                        const ident = Workspace.Avaliacoes.resolverIdentidadeEntrega(ent);
                        const av = window.Workspace.renderizarAvatar(ident.nome, 26, ident.avatar);
                        return `<div title="${Workspace.escapeHTML(ident.nome)}" style="margin-left:${idx === 0 ? '0' : '-8px'}; border:2px solid #fff; border-radius:50%; display:inline-flex; box-shadow:0 1px 3px rgba(0,0,0,0.12);">${av}</div>`;
                    }).join('');

                    const badgeExtras = extras > 0
                        ? `<div style="margin-left:-6px; width:26px; height:26px; border-radius:50%; background:#1e293b; color:#fff; font-size:10px; font-weight:800; display:inline-flex; align-items:center; justify-content:center; border:2px solid #fff;">+${extras}</div>`
                        : '';

                    htmlAvataresEmpilhados = `
                        <div onclick="Workspace.Avaliacoes.abrirModalAcessos('${a.id}', '${a.destino}')" style="display:inline-flex; align-items:center; cursor:pointer; padding:2px 6px; border-radius:20px; background:#f8fafc; border:1px solid #e2e8f0;" title="Clique para ver todos os acessos">
                            ${pilha}${badgeExtras}
                        </div>
                    `;
                }

                if (a.status === 'arquivada') {
                    const dArquivada = new Date(a.ultimaAtualizacao);
                    const dataArqFormatada = `${dArquivada.toLocaleDateString('pt-BR')} às ${dArquivada.getHours().toString().padStart(2, '0')}h${dArquivada.getMinutes().toString().padStart(2, '0')}`;
                    
                    const presentes = [];
                    const ausentes = [];
                    
                    alunosSessao.forEach(aluno => {
                        const acessou = presencasReais.some(e =>
                            String(e.alunoId) === String(aluno.id) ||
                            (aluno.userId && String(e.alunoId) === String(aluno.userId)) ||
                            (e.alunoRefId && String(e.alunoRefId) === String(aluno.id)) ||
                            norm(e.alunoNome) === norm(aluno.nome) ||
                            (aluno.nomeMatricula && norm(e.alunoNome).includes(norm(aluno.nomeMatricula)))
                        );
                        if (acessou) presentes.push(aluno);
                        else ausentes.push(aluno);
                    });

                    presentes.sort((x, y) => (x.nome || '').localeCompare(y.nome || ''));
                    ausentes.sort((x, y) => (x.nome || '').localeCompare(y.nome || ''));

                    const htmlPresentes = presentes.length > 0 
                        ? presentes.map(p => `<div style="font-size: 12px; color: #27ae60; padding: 4px 0; border-bottom: 1px dashed #eee; display:flex; align-items:center; gap:6px;">${window.Workspace.renderizarAvatar(p.nome, 20, p.avatar)} <span>✅ ${Workspace.escapeHTML(p.nome)}</span> ${p.isConvidado ? '<span style="font-size: 9px; background: #9b59b6; color: white; padding: 2px 4px; border-radius: 4px;">Convidado</span>' : ''}</div>`).join('')
                        : '<div style="font-size: 12px; color: #999; font-style: italic;">Ninguém compareceu.</div>';
                        
                    const htmlAusentes = ausentes.length > 0 
                        ? ausentes.map(p => `<div style="font-size: 12px; color: #e74c3c; padding: 4px 0; border-bottom: 1px dashed #eee; display:flex; align-items:center; gap:6px;">${window.Workspace.renderizarAvatar(p.nome, 20, p.avatar)} <span>❌ ${Workspace.escapeHTML(p.nome)}</span> ${p.isConvidado ? '<span style="font-size: 9px; background: #9b59b6; color: white; padding: 2px 4px; border-radius: 4px;">Convidado</span>' : ''}</div>`).join('')
                        : '<div style="font-size: 12px; color: #999; font-style: italic;">Não houve ausências!</div>';

                    return `
                    <div id="card-prof-${a.id}" style="background: #fff; border: 1px solid #eee; padding: 20px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.03); border-left: 5px solid #7f8c8d;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                            <div style="flex: 1; min-width: 220px;">
                                <h4 style="margin: 0 0 5px 0; color: #2c3e50; font-size: 16px;">📂 ${Workspace.escapeHTML(a.titulo)} (Relatório de Sessão)</h4>
                                <div style="font-size: 12px; color: #7f8c8d; font-weight: bold;">Arquivado em: <span style="color:#e67e22;">${dataArqFormatada}</span> &nbsp;|&nbsp; 👥 Turma: <span style="color:#8e44ad;">${Workspace.escapeHTML(a.destinoNome || 'Global')}</span></div>
                                ${htmlDestaquePesquisaAluno}
                            </div>
                            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                                <button class="ws-btn" style="background:#e8f4f8; color:#2980b9; font-size:12px; padding:8px 14px; border-radius: 8px; font-weight: bold; border: 1px solid #bde0fe; cursor: pointer;" onclick="Workspace.Avaliacoes.copiarRelatorioChamada('${a.id}')">📋 Copiar Chamada</button>
                                <button class="ws-btn" style="background:#f3e8ff; color:#7e22ce; font-size:12px; padding:8px 14px; border-radius: 8px; font-weight: bold; border: 1px solid #d8b4fe; cursor: pointer;" onclick="Workspace.Avaliacoes.clonarAvaliacao('${a.id}')" title="Duplicar esta sessão para reagendar rapidamente">📑 Clonar</button>
                                <button class="ws-btn" style="background:#f0f2f5; color:#2c3e50; font-size:12px; padding:8px 14px; border-radius: 8px; font-weight: bold; border: none; cursor: pointer;" onclick="Workspace.Avaliacoes.arquivarSessaoOnline('${a.id}', 'ativa')">📂 Desarquivar</button>
                                <button class="ws-btn" style="background:#fdf2f2; color:#e74c3c; font-size:12px; padding:8px 14px; border-radius: 8px; font-weight: bold; border: none; cursor: pointer;" onclick="Workspace.Avaliacoes.excluirAvaliacao('${a.id}')">🗑️ Apagar</button>
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
                        } else { corStatus = '#27ae60'; textoStatus = `Ativa • Entregas: ${presencasCount}`; }
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
                    let btnCopiarLink = '';
                    let resumoLinkHtml = '';
                    if (a.tipo === 'online' && a.linkSala) {
                        let linkFinal = a.linkSala.startsWith('http') ? a.linkSala : 'https://' + a.linkSala;
                        const linkSeguroJS = linkFinal.replace(/'/g, "\\'");
                        btnEntrarSala = `<a href="${linkFinal}" target="_blank" class="ws-btn" style="background: #8e44ad; color: white; text-decoration: none; font-size: 12px; padding: 8px 15px; border-radius: 8px; text-align: center; font-weight: bold;">🚀 Entrar na Sessão</a>`;
                        btnCopiarLink = `<button type="button" class="ws-btn" style="background: #f8fafc; color: #475569; border: 1px solid #cbd5e1; font-size: 12px; padding: 8px 14px; border-radius: 8px; font-weight: bold; cursor: pointer;" onclick="Workspace.Avaliacoes.copiarLinkSala('${linkSeguroJS}')" title="${Workspace.escapeHTML(linkFinal)}">🔗 Copiar Link</button>`;
                        resumoLinkHtml = `<div style="font-size: 11px; color: #64748b; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 480px;">🔗 <span style="font-family: monospace;">${Workspace.escapeHTML(a.linkSala)}</span></div>`;
                    }

                    let btnGestao = `<button class="ws-btn" style="background: #3498db; color: white; border: none; font-size: 12px; padding: 8px 15px; border-radius: 8px; font-weight: bold; cursor: pointer;" onclick="Workspace.Avaliacoes.abrirModalAcessos('${a.id}', '${a.destino}')">📊 Gestão de Acessos</button>`;

                    return `
                    <div id="card-prof-${a.id}" style="background: #fff; border: 1px solid #eee; padding: 15px; border-radius: 12px; margin-bottom: 10px; display: flex; flex-direction:column; gap: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); transition: 0.2s;" onmouseover="this.style.borderColor='#3498db'" onmouseout="this.style.borderColor='#eee'">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; flex-wrap: wrap;">
                            <div style="display: flex; gap: 12px; align-items: flex-start; flex: 1; min-width: 240px;">
                                <input type="checkbox" class="ws-check-avaliacao" value="${a.id}" style="transform: scale(1.3); cursor: pointer; accent-color: #3498db; margin-top: 5px;">
                                <div style="flex: 1; min-width: 0;">
                                    <h4 style="margin: 0 0 5px 0; color: #2c3e50; font-size: 16px;">${icone} ${Workspace.escapeHTML(a.titulo)}</h4>
                                    <div style="font-size: 11px; color: #7f8c8d; margin-bottom: 6px; font-weight: bold;">Criada em: ${dataCriacaoFmt} ${dataApresentada ? `| ${dataApresentada}` : ''}</div>
                                    ${resumoLinkHtml}
                                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
                                        <span style="font-size: 11px; color: #8e44ad; font-weight:bold; background: #f4e8f8; padding: 3px 8px; border-radius: 6px;">👥 ${Workspace.escapeHTML(a.destinoNome || 'Global')}</span>
                                        <span style="font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 6px; background: ${corStatus}20; color: ${corStatus};">${textoStatus}</span>
                                        ${htmlAvataresEmpilhados}
                                    </div>
                                    ${htmlDestaquePesquisaAluno}
                                </div>
                            </div>
                        </div>
                        <div style="display:flex; gap: 8px; border-top: 1px dashed #eee; padding-top: 10px; flex-wrap: wrap;">
                            ${btnEntrarSala}
                            ${btnCopiarLink}
                            ${btnGestao}
                            <button type="button" class="ws-btn" style="background:#e8f4f8; color:#3498db; font-size:12px; padding:8px 14px; border-radius: 8px; border: 1px solid #bde0fe; cursor: pointer; font-weight: bold; transition:0.2s;" onmouseover="this.style.background='#d5ebf6'" onmouseout="this.style.background='#e8f4f8'" onclick="Workspace.Avaliacoes.editarAvaliacao('${a.id}')">✏️ Editar</button>
                            <button type="button" class="ws-btn" style="background:#f3e8ff; color:#7e22ce; font-size:12px; padding:8px 14px; border-radius: 8px; border: 1px solid #d8b4fe; cursor: pointer; font-weight: bold; transition:0.2s;" onmouseover="this.style.background='#e9d5ff'" onmouseout="this.style.background='#f3e8ff'" onclick="Workspace.Avaliacoes.clonarAvaliacao('${a.id}')" title="Criar uma cópia pronta para reagendar ou aplicar noutra turma">📑 Clonar</button>
                        </div>
                    </div>`;
                }
            }).join('');
        }

        // 🛡️ SEPARAÇÃO CIRÚRGICA DO DOM: Se estiver apenas a digitar na barra de pesquisa, atualiza só os cartões sem tocar no <input>!
        const areaCardsExistente = document.getElementById('ws-gerir-cards-list');
        if (apenasCards && areaCardsExistente) {
            areaCardsExistente.innerHTML = htmlCards;
            return;
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
            <div id="ws-gerir-topbar-fixed">
                ${abasHtml}
                <div style="display: flex; gap: 15px; margin-bottom: 20px; align-items: center; flex-wrap: wrap; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <input type="checkbox" id="ws-check-todos" style="transform: scale(1.3); cursor: pointer; accent-color: #3498db;" onclick="const cbs = document.querySelectorAll('.ws-check-avaliacao'); cbs.forEach(cb => cb.checked = this.checked);">
                        <label for="ws-check-todos" style="font-size: 13px; font-weight: bold; color: #2c3e50; cursor: pointer;">Todos</label>
                    </div>
                    <div style="width: 1px; height: 25px; background: #cbd5e1;"></div>
                    <div style="flex: 1; min-width: 220px; position: relative;">
                        <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); opacity: 0.5; pointer-events: none;">🔍</span>
                        <input type="text" id="ws-busca-avaliacoes" placeholder="Pesquisar por aluno, título, link, turma, data ou horário..." value="${Workspace.escapeHTML(termoBusca)}" autocomplete="off" style="width: 100%; padding: 10px 34px 10px 35px; border-radius: 20px; border: 1px solid #cbd5e1; outline: none; font-size: 13px; box-sizing: border-box;" oninput="Workspace.Avaliacoes.renderizarListaGerenciador(this.value, true)">
                        <button type="button" id="ws-btn-limpar-busca-aval" onclick="Workspace.Avaliacoes.limparBuscaGerenciador()" style="display: ${termoBusca.trim().length > 0 ? 'flex' : 'none'}; position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: #e2e8f0; border: none; color: #475569; width: 22px; height: 22px; border-radius: 50%; font-size: 11px; font-weight: bold; cursor: pointer; align-items: center; justify-content: center;">✖</button>
                    </div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button class="ws-btn" style="background: #e74c3c; color: white; padding: 8px 15px; border-radius: 20px; font-weight: bold; font-size: 11px; border: none; cursor: pointer;" onclick="Workspace.Avaliacoes.excluirAvaliacoesSelecionadas()">🗑️ Apagar</button>
                        ${abaAtiva === 'ativas' ? `<button class="ws-btn" style="background: #7f8c8d; color: white; padding: 8px 15px; border-radius: 20px; font-weight: bold; font-size: 11px; border: none; cursor: pointer;" onclick="Workspace.Avaliacoes.arquivarAvaliacoesSelecionadas()">📂 Arquivar</button>` : ''}
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = `${topBar}<div id="ws-gerir-cards-list">${htmlCards}</div>`;
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
                reativadosAntigos.forEach(r => {
                    if (String(r.id) === String(acesso.alunoId) || (acesso.alunoRefId && String(r.id) === String(acesso.alunoRefId))) {
                        Workspace.Avaliacoes.removerReativado(avaliacaoId, r.id);
                    }
                });
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
                    const ident = Workspace.Avaliacoes.resolverIdentidadeEntrega({
                        alunoId: aluno.userId || aluno.id,
                        alunoRefId: aluno.id,
                        alunoNome: aluno.nome,
                        alunoAvatar: aluno.avatar
                    });
                    const nomeExibicao = ident.nome || aluno.nome || 'Aluno';
                    const fotoExibicao = ident.avatar || aluno.avatar || null;

                    const acessoFeito = acessos.find(e => 
                        String(e.alunoId) === String(aluno.id) || 
                        (aluno.userId && String(e.alunoId) === String(aluno.userId)) ||
                        (e.alunoRefId && String(e.alunoRefId) === String(aluno.id)) || 
                        (e.alunoNome && String(e.alunoNome).toLowerCase().trim() === nomeExibicao.toLowerCase().trim()) ||
                        (e.alunoNome && aluno.nomeMatricula && String(e.alunoNome).toLowerCase().includes(String(aluno.nomeMatricula).toLowerCase().trim()))
                    );
                    const avatar = window.Workspace.renderizarAvatar(nomeExibicao, 35, fotoExibicao);
                    const foiReativado = idsReativados.includes(aluno.id);
                    const nomeSeguro = nomeExibicao.replace(/'/g, "\\'");
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
                                        <div style="font-size:13px; font-weight:bold; color:#2c3e50;">${Workspace.escapeHTML(nomeExibicao)} ${badgeConvidado}</div>
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
                                        <div style="font-size:13px; font-weight:bold; color:#2c3e50;">${Workspace.escapeHTML(nomeExibicao)} ${badgeConvidado}</div>
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
                                        <div style="font-size:13px; font-weight:bold; color:#2c3e50;">${Workspace.escapeHTML(nomeExibicao)} ${badgeConvidado}</div>
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
                        const ident = Workspace.Avaliacoes.resolverIdentidadeEntrega(acesso);
                        const nomeExibicao = ident.nome || 'Aluno';
                        const avatar = window.Workspace.renderizarAvatar(nomeExibicao, 35, ident.avatar);
                        const nomeSeguro = nomeExibicao.replace(/'/g, "\\'");

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
                                        <div style="font-size:13px; font-weight:bold; color:#2c3e50;">${Workspace.escapeHTML(nomeExibicao)}</div>
                                        <div style="font-size:11px; color:#e74c3c; font-weight:bold;">${txtUsado} ${horaFormatada}</div>
                                    </div>
                                </div>
                                <button type="button" class="ws-btn" style="background:#f39c12; color:white; border:none; cursor:pointer; font-size:11px; padding:6px 12px; border-radius:15px;" onclick="Workspace.Avaliacoes.reativarAcessoAluno(event, '${acesso.id}', '${avaliacaoId}', '${destinoId}', '${acesso.alunoId}', '${nomeSeguro}')">${txtReativarBtn}</button>
                            </div>
                        `;
                    });
                    
                    reativadosLista.forEach(reativado => {
                        const ident = Workspace.Avaliacoes.resolverIdentidadeEntrega(reativado.nome);
                        const nomeExibicao = ident.nome || reativado.nome;
                        const avatar = window.Workspace.renderizarAvatar(nomeExibicao, 35, ident.avatar);
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
                                        <div style="font-size:13px; font-weight:bold; color:#2c3e50;">${Workspace.escapeHTML(nomeExibicao)}</div>
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
                    <button type="button" class="ws-btn" style="background:${todosOcultos ? '#8e44ad' : '#f39c12'}; color:white; font-size:12px; padding:8px 14px; border-radius:20px; font-weight:bold; border:none; cursor:pointer; flex: 1;" onclick="Workspace.Avaliacoes.toggleOcultarTodos('${avaliacaoId}', '${destinoId}',${todosOcultos})">
                        ${todosOcultos ? '👁️ Desbloquear Todos' : '⏸️ Bloquear Todos'}
                    </button>
                ` : '';

                const btnChamarAtrasados = (isOnline && alunosAtivosParaOcultar.length > 0) ? `
                    <button type="button" class="ws-btn" style="background:#e67e22; color:white; font-size:12px; padding:8px 14px; border-radius:20px; font-weight:bold; border:none; cursor:pointer; flex: 1;" onclick="Workspace.Avaliacoes.chamarAlunosAtrasados('${avaliacaoId}', this)" title="Envia um alerta sonoro/visual para os alunos que ainda não entraram">
                        🔔 Chamar Atrasados (${alunosAtivosParaOcultar.length})
                    </button>
                ` : '';

                boxBotoes.innerHTML = `
                    <button type="button" class="ws-btn" style="background:#27ae60; color:white; font-size:12px; padding:8px 14px; border-radius:20px; font-weight:bold; border:none; cursor:pointer; flex: 1;" onclick="Workspace.Avaliacoes.togglePesquisaConvidado('${avaliacaoId}')">➕ Adicionar Aluno</button>
                    ${btnMacroOcultar}${btnChamarAtrasados}
                    <button type="button" class="ws-btn" style="background:#3498db; color:white; font-size:12px; padding:8px 14px; border-radius:20px; font-weight:bold; border:none; cursor:pointer; flex: 1;" onclick="Workspace.Avaliacoes.reativarAcessosSelecionados('${avaliacaoId}', '${destinoId}')">🔄 Permitir Selecionados</button>
                    <button type="button" class="ws-btn" style="background:#2c3e50; color:white; font-size:12px; padding:8px 14px; border-radius:20px; font-weight:bold; border:none; cursor:pointer; flex: 1;" onclick="Workspace.Avaliacoes.copiarRelatorioChamada('${avaliacaoId}')">📋 Copiar Chamada</button>
                `;
            }

        } catch(e) { if (container) container.innerHTML = '<div style="color:#e74c3c; text-align:center; padding:20px;">Erro ao carregar os dados.</div>'; }
    },

    // 🔔 PROPOSTA B: Dispara aviso instantâneo aos alunos que ainda não clicaram na aula
    chamarAlunosAtrasados: async (avaliacaoId, btnEl) => {
        const prova = Workspace.Avaliacoes.avaliacoesGerenciadorCache.find(p => p.id === avaliacaoId) || Workspace.Avaliacoes.avaliacoesDisponiveis.find(p => p.id === avaliacaoId);
        if (!prova) return;

        const acessos = (Workspace.Avaliacoes.entregasEmCache || []).filter(e => e.avaliacaoId === avaliacaoId);
        const listaOcultos = prova.ocultos || [];
        const todosAlunos = Workspace.Avaliacoes.todosAlunosCache || [];

        const alunosDaSessao = todosAlunos.filter(aluno => {
            const ehDaTurma = Workspace.verificarTurma(aluno, prova.destino, prova.destinoNome);
            const ehConvidado = prova.convidados && prova.convidados.some(c => String(c.id) === String(aluno.id));
            return ehDaTurma || ehConvidado;
        });

        const atrasados = alunosDaSessao.filter(aluno => {
            if (listaOcultos.includes(String(aluno.id))) return false;
            const jaEntrou = acessos.some(e => 
                String(e.alunoId) === String(aluno.id) || 
                (e.alunoRefId && String(e.alunoRefId) === String(aluno.id)) ||
                (e.alunoNome && aluno.nome && String(e.alunoNome).toLowerCase().includes(String(aluno.nome).toLowerCase().trim()))
            );
            return !jaEntrou;
        }).map(a => ({ id: a.id, nome: a.nome }));

        if (atrasados.length === 0) {
            return Workspace.mostrarAviso("Todos os alunos liberados já entraram na sessão! 🎉", "info");
        }

        const txtOrig = btnEl ? btnEl.innerHTML : '🔔 Chamar Atrasados';
        if (btnEl) { btnEl.innerHTML = '⏳ Chamando...'; btnEl.disabled = true; }

        try {
            const res = await Workspace.api(`/workspace/avaliacoes/${avaliacaoId}/chamar-atrasados`, 'POST', {
                alunosPendentes: atrasados,
                professorNome: Workspace.usuario.nome || Workspace.usuario.login || 'Professor'
            });

            if (res && res.success) {
                Workspace.mostrarAviso(`🔔 Alerta enviado em tempo real para ${res.enviados} aluno(s) aguardado(s)!`, "success");
            } else {
                Workspace.mostrarAviso((res && res.error) ? res.error : "Erro ao chamar alunos.", "error");
            }
        } catch (e) {
            Workspace.mostrarAviso("Falha de comunicação ao enviar alerta.", "error");
        } finally {
            if (btnEl) { btnEl.innerHTML = txtOrig; btnEl.disabled = false; }
        }
    },

    // 📋 PROPOSTA C: Copia o relatório completo de Presentes (com hora) e Ausentes
    copiarRelatorioChamada: (avaliacaoId) => {
        const prova = Workspace.Avaliacoes.avaliacoesGerenciadorCache.find(p => p.id === avaliacaoId) || Workspace.Avaliacoes.avaliacoesDisponiveis.find(p => p.id === avaliacaoId);
        if (!prova) return;

        const acessos = (Workspace.Avaliacoes.entregasEmCache || []).filter(e => e.avaliacaoId === avaliacaoId);
        const todosAlunos = Workspace.Avaliacoes.todosAlunosCache || [];

        const alunosSessao = todosAlunos.filter(aluno => {
            const ehDaTurma = Workspace.verificarTurma(aluno, prova.destino, prova.destinoNome);
            const ehConvidado = prova.convidados && prova.convidados.some(c => String(c.id) === String(aluno.id));
            return ehDaTurma || ehConvidado;
        });

        const presentes = [];
        const ausentes = [];

        if (alunosSessao.length > 0) {
            alunosSessao.forEach(aluno => {
                const registo = acessos.find(e => 
                    String(e.alunoId) === String(aluno.id) || 
                    (e.alunoRefId && String(e.alunoRefId) === String(aluno.id)) ||
                    (e.alunoNome && aluno.nome && String(e.alunoNome).toLowerCase().includes(String(aluno.nome).toLowerCase().trim()))
                );
                if (registo) {
                    const hora = registo.dataEntrega ? new Date(registo.dataEntrega).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
                    presentes.push(`✅ ${aluno.nome}${hora ? ` (às ${hora})` : ''}`);
                } else {
                    ausentes.push(`❌ ${aluno.nome}`);
                }
            });
        } else {
            acessos.forEach(registo => {
                const hora = registo.dataEntrega ? new Date(registo.dataEntrega).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
                presentes.push(`✅ ${registo.alunoNome}${hora ? ` (às ${hora})` : ''}`);
            });
        }

        const dataSessao = prova.dataAgendada && prova.dataAgendada.includes('T')
            ? prova.dataAgendada.split('T')[0].split('-').reverse().join('/') + ' às ' + prova.dataAgendada.split('T')[1].substring(0, 5)
            : new Date().toLocaleDateString('pt-BR');

        const textoRelatorio = [
            `📋 *RELATÓRIO DE PRESENÇA - AULA ONLINE*`,
            `🖥️ *Sessão:* ${prova.titulo}`,
            `👥 *Turma:* ${prova.destinoNome || 'Global'}`,
            `📅 *Data:* ${dataSessao}`,
            ``,
            `🟢 *PRESENTES (${presentes.length}):*`,
            presentes.length > 0 ? presentes.join('\n') : 'Nenhum registo.',
            ``,
            `🔴 *AUSENTES (${ausentes.length}):*`,
            ausentes.length > 0 ? ausentes.join('\n') : 'Nenhuma ausência!'
        ].join('\n');

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(textoRelatorio).then(() => {
                Workspace.mostrarAviso("📋 Relatório de presença copiado! Pronto para colar no WhatsApp.", "success");
            });
        } else {
            const ta = document.createElement('textarea');
            ta.value = textoRelatorio;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            Workspace.mostrarAviso("📋 Relatório de presença copiado!", "success");
        }
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
        if (!container) return;
        const norm = Workspace.Avaliacoes.normalizarTextoBusca;
        const termoNorm = norm(termo);
        if (!termoNorm || termoNorm.length < 1) { container.innerHTML = ''; return; }
        
        const resultados = (Workspace.Avaliacoes.todosAlunosCache || []).filter(a => {
            return norm(a.nome).includes(termoNorm)
                || norm(a.nomeMatricula).includes(termoNorm)
                || norm(a.login).includes(termoNorm);
        }).slice(0, 12);

        if (resultados.length === 0) {
            container.innerHTML = '<div style="font-size:12px; color:#999; padding:8px; text-align:center;">Nenhum aluno encontrado com este nome.</div>';
            return;
        }

        container.innerHTML = resultados.map(aluno => {
            const nomeExibicao = aluno.nome || 'Aluno';
            const nomeSeguro = nomeExibicao.replace(/'/g, "\\'");
            const avatarMini = window.Workspace.renderizarAvatar(nomeExibicao, 28, aluno.avatar);
            return `
            <div style="display:flex; justify-content:space-between; align-items:center; background:white; padding:8px 12px; border-radius:8px; border:1px solid #e2e8f0;">
                <div style="display:flex; align-items:center; gap:10px;">
                    ${avatarMini}
                    <span style="font-size:13px; font-weight:bold; color:#2c3e50;">${Workspace.escapeHTML(nomeExibicao)}</span>
                </div>
                <button type="button" class="ws-btn" style="background:#8e44ad; font-size:11px; padding:5px 12px; border-radius:15px; border:none; color:white; cursor:pointer;" onclick="Workspace.Avaliacoes.adicionarConvidadoSessao('${avaliacaoId}', '${aluno.id}', '${nomeSeguro}')">➕ Convidar</button>
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

    // 📑 IDEIA 3: Clona qualquer Sessão Online ou Avaliação em 1 clique para reagendar ou aplicar noutra turma!
    clonarAvaliacao: async (id) => {
        await Workspace.Avaliacoes.carregarTurmasProf();
        const prova = Workspace.Avaliacoes.avaliacoesGerenciadorCache.find(p => p.id === id);
        if (!prova) return;

        // Importante: Define como null para que ao salvar seja criada uma NOVA sessão/avaliação!
        Workspace.Avaliacoes.avaliacaoEmEdicao = null;

        if (prova.tipo === 'escrita') {
            document.getElementById('ws-prof-gerir-lista-container').style.display = 'none';
            document.getElementById('ws-prof-nova-escrita').style.display = 'block';

            document.getElementById('ws-nova-prova-titulo').value = `${prova.titulo} (Cópia)`;
            document.getElementById('ws-nova-prova-tempo').value = prova.tempo || 60;
            document.getElementById('ws-nova-prova-tentativas').value = prova.tentativas || 1;
            document.getElementById('ws-nova-prova-destino').value = prova.destino || 'global';
            document.getElementById('ws-btn-salvar-escrita').innerText = "🚀 Publicar Cópia do Exame";

            document.getElementById('ws-builder-questoes').innerHTML = '';
            if (prova.questoes) {
                prova.questoes.forEach(q => Workspace.Avaliacoes.adicionarQuestaoBuilder(q.tipo, q));
            }
            Workspace.mostrarAviso("📑 Prova clonada! Ajuste a turma ou o título e clique em Publicar.", "info");
        } else if (prova.tipo === 'oral') {
            document.getElementById('ws-prof-gerir-lista-container').style.display = 'none';
            document.getElementById('ws-prof-nova-oral').style.display = 'block';

            document.getElementById('ws-nova-oral-titulo').value = `${prova.titulo} (Cópia)`;
            document.getElementById('ws-nova-oral-instrucoes').value = prova.instrucoes || '';
            document.getElementById('ws-nova-oral-tentativas').value = prova.tentativas || 1;
            document.getElementById('ws-nova-oral-destino').value = prova.destino || 'global';
            document.getElementById('ws-btn-salvar-oral').innerText = "🎤 Publicar Cópia do Teste Oral";
            Workspace.mostrarAviso("📑 Teste Oral clonado! Ajuste os detalhes e clique em Publicar.", "info");
        } else if (prova.tipo === 'online') {
            document.getElementById('ws-prof-gerir-lista-container').style.display = 'none';
            document.getElementById('ws-prof-nova-online').style.display = 'block';

            document.getElementById('ws-nova-online-titulo').value = prova.titulo || '';

            let dataSugerida = '';
            if (prova.dataAgendada && prova.dataAgendada.includes('T')) {
                dataSugerida = prova.dataAgendada.substring(0, 16);
            }
            document.getElementById('ws-nova-online-data').value = dataSugerida;
            document.getElementById('ws-nova-online-link').value = prova.linkSala || '';
            document.getElementById('ws-nova-online-destino').value = prova.destino || 'global';
            document.getElementById('ws-btn-salvar-online').innerText = "🖥️ Agendar Nova Sessão Clonada";
            Workspace.mostrarAviso("📑 Sessão clonada com o link original! Escolha a nova data/hora e publique.", "info");
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
            const [resProvas, resEntregas, resAlunos, resUsuarios, resAvatars] = await Promise.all([
                Workspace.api(`/workspace/avaliacoes?escolaId=${Workspace.usuario.escolaId}&_t=${Date.now()}`, 'GET'),
                Workspace.api(`/workspace/avaliacoes/entregas?_t=${Date.now()}`, 'GET'),
                Workspace.api(`/alunos?_t=${Date.now()}`, 'GET'),
                Workspace.api(`/usuarios?_t=${Date.now()}`, 'GET'),
                Workspace.api(`/workspace/avatars?_t=${Date.now()}`, 'GET')
            ]);

            if (resAlunos && !resAlunos.error) {
                Workspace.Avaliacoes.todosAlunosCache = Workspace.Avaliacoes.sincronizarIdentidadesAlunos(resAlunos, resUsuarios, resAvatars);
            }

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

   limparBuscaRecebidas: () => {
        const input = document.getElementById('ws-busca-recebidas');
        if (input) {
            input.value = '';
            input.focus();
        }
        Workspace.Avaliacoes.renderizarListaRecebidas('', true);
    },

    renderizarListaRecebidas: (termoBusca = null, apenasCards = false) => {
        const container = document.getElementById('ws-prof-recebidas-lista');
        if (!container) return;
        
        const inputAtual = document.getElementById('ws-busca-recebidas');
        if (termoBusca === null) {
            termoBusca = inputAtual ? inputAtual.value : '';
        }

        const btnLimparRec = document.getElementById('ws-btn-limpar-busca-rec');
        if (btnLimparRec) {
            btnLimparRec.style.display = termoBusca.trim().length > 0 ? 'flex' : 'none';
        }

        const norm = Workspace.Avaliacoes.normalizarTextoBusca;
        const termoNorm = norm(termoBusca);

        const entregasValidas = Workspace.Avaliacoes.entregasEmCache.filter(e => {
            const prova = Workspace.Avaliacoes.provasEmCache[e.avaliacaoId];
            return prova && prova.tipo !== 'online';
        });

        if (entregasValidas.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">Ainda não existem provas recebidas.</div>';
            return;
        }

        let entregasFiltradas = entregasValidas;
        if (termoNorm !== '') {
            entregasFiltradas = entregasFiltradas.filter(e => {
                const prova = Workspace.Avaliacoes.provasEmCache[e.avaliacaoId];
                const ident = Workspace.Avaliacoes.resolverIdentidadeEntrega(e);
                const dataObj = new Date(e.dataEntrega);
                const dataFormatada = dataObj.toLocaleDateString('pt-BR');
                const horaFormatada = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const respostasTxt = e.respostas ? Object.values(e.respostas).join(' ') : '';

                const tudoNorm = norm([
                    prova ? prova.titulo : '',
                    prova ? prova.destinoNome : '',
                    prova && prova.tipo === 'oral' ? 'oral audio voz' : 'escrita prova exame',
                    ident.nome,
                    e.alunoNome,
                    dataFormatada,
                    horaFormatada,
                    respostasTxt,
                    (e.relatorioFraude && e.relatorioFraude.fugas > 0) ? 'fraude ausencia alerta' : ''
                ].join(' '));

                return tudoNorm.includes(termoNorm);
            });
        }

        const htmlListaAlunos = entregasFiltradas.length === 0 
            ? `<div style="text-align: center; padding: 40px; color: #94a3b8; background: #fff; border-radius: 12px; border: 1px dashed #cbd5e1;">🔍 Nenhum exame encontrado para <strong>"${Workspace.escapeHTML(termoBusca)}"</strong>.</div>`
            : entregasFiltradas.map(e => {
                const prova = Workspace.Avaliacoes.provasEmCache[e.avaliacaoId];
                const tituloProva = prova ? prova.titulo : 'Prova Excluída';
                const icone = (prova && prova.tipo === 'oral') ? '🎤' : '✍️';
                const dataObj = new Date(e.dataEntrega);
                const horaFormatada = dataObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
                
                const ident = Workspace.Avaliacoes.resolverIdentidadeEntrega(e);
                const nomeExibicao = ident.nome || e.alunoNome || 'Aluno';
                const avatarHtml = window.Workspace.renderizarAvatar(nomeExibicao, 34, ident.avatar);

               const fraudeBadge = (e.relatorioFraude && e.relatorioFraude.fugas > 0) 
                    ? `<span style="background:#fdf2f2; color:#e74c3c; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:bold; margin-left:5px;">⚠️ ${e.relatorioFraude.fugas} Ausência(s)</span>` 
                    : '';

                const notaBadgeProf = (e.notaFinal !== undefined && e.notaFinal !== null)
                    ? `<span style="background:#ecfdf5; color:#059669; border:1px solid #6ee7b7; padding:2px 8px; border-radius:12px; font-size:10.5px; font-weight:800; margin-left:6px;">🌟 Nota: ${e.notaFinal}%</span>`
                    : `<span style="background:#fef3c7; color:#d97706; padding:2px 8px; border-radius:12px; font-size:10px; font-weight:700; margin-left:6px;">⏳ Sem Nota</span>`;

                return `
                    <div style="background: #fff; border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.02); transition: 0.2s; flex-wrap: wrap; gap: 10px;" onmouseover="this.style.borderColor='#3498db'" onmouseout="this.style.borderColor='#eee'">
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <input type="checkbox" class="ws-check-entrega" value="${e.id}" style="transform: scale(1.3); cursor: pointer;">
                            ${avatarHtml}
                            <div>
                                <h4 style="margin: 0 0 5px 0; color: #2c3e50;">${icone} ${Workspace.escapeHTML(tituloProva)} ${notaBadgeProf}</h4>
                                <span style="font-size: 11px; color: #7f8c8d;">Aluno: <strong style="color:#3498db;">${Workspace.escapeHTML(nomeExibicao)}</strong> | ${dataObj.toLocaleDateString('pt-BR')} às ${horaFormatada} ${fraudeBadge}</span>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="ws-btn" style="background: #27ae60; padding: 8px 15px; font-size: 12px; border-radius: 20px;" onclick="Workspace.Avaliacoes.verCorrecao('${e.id}', false)">${e.notaFinal !== undefined && e.notaFinal !== null ? '✏️ Ver / Editar Nota' : '📝 Corrigir Prova'}</button>
                            <button class="ws-btn" style="background: #fdf2f2; color: #e74c3c; padding: 8px 15px; font-size: 12px; border-radius: 20px; border: 1px solid #fadbd8;" title="Apagar Exame" onclick="Workspace.Avaliacoes.excluirEntregaIndividual('${e.id}')">🗑️</button>
                        </div>
                    </div>
                `;
            }).join('');

        // 🛡️ Se o utilizador estiver a digitar no campo de busca, atualiza apenas a área dos cartões sem destruir o <input>!
        const areaCardsRec = document.getElementById('ws-recebidas-cards-list');
        if (apenasCards && areaCardsRec) {
            areaCardsRec.innerHTML = htmlListaAlunos;
            return;
        }

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
                <div style="font-size: 13px; font-weight: bold; color: #2c3e50; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;" title="${Workspace.escapeHTML(piorQuestao.pergunta)}">${Workspace.escapeHTML(piorQuestao.pergunta)}</div>
                <div style="font-size: 11px; color: #e74c3c; font-weight: bold; margin-top: 4px;">Falha de ${taxaErroFormatada}% em: ${Workspace.escapeHTML(piorQuestao.tituloProva)}</div>
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

        const topBar = `
            <div id="ws-recebidas-topbar-fixed" style="display: flex; gap: 15px; margin-bottom: 20px; align-items: center; flex-wrap: wrap; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="ws-check-todos-recebidas" style="transform: scale(1.3); cursor: pointer;" onclick="const cbs = document.querySelectorAll('.ws-check-entrega'); cbs.forEach(cb => cb.checked = this.checked);">
                    <label for="ws-check-todos-recebidas" style="font-size: 13px; font-weight: bold; color: #2c3e50; cursor: pointer;">Todos</label>
                </div>
                <div style="width: 1px; height: 25px; background: #cbd5e1;"></div>
                <div style="flex: 1; min-width: 220px; position: relative;">
                    <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); opacity: 0.5; pointer-events: none;">🔍</span>
                    <input type="text" id="ws-busca-recebidas" placeholder="Pesquisar por aluno, prova, turma, data ou resposta..." value="${Workspace.escapeHTML(termoBusca)}" autocomplete="off" style="width: 100%; padding: 10px 34px 10px 35px; border-radius: 20px; border: 1px solid #cbd5e1; outline: none; font-size: 13px; box-sizing: border-box; transition: 0.3s;" onfocus="this.style.borderColor='#3498db'" onblur="this.style.borderColor='#cbd5e1'" oninput="Workspace.Avaliacoes.renderizarListaRecebidas(this.value, true)">
                    <button type="button" id="ws-btn-limpar-busca-rec" onclick="Workspace.Avaliacoes.limparBuscaRecebidas()" style="display: ${termoBusca.trim().length > 0 ? 'flex' : 'none'}; position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: #e2e8f0; border: none; color: #475569; width: 22px; height: 22px; border-radius: 50%; font-size: 11px; font-weight: bold; cursor: pointer; align-items: center; justify-content: center;">✖</button>
                </div>
                <button class="ws-btn" style="background: #e74c3c; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; border: none; cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 8px; transition: 0.2s;" onmouseover="this.style.background='#c0392b'" onmouseout="this.style.background='#e74c3c'" onclick="Workspace.Avaliacoes.excluirEntregasSelecionadas()">
                    🗑️ Apagar Selecionados
                </button>
            </div>
        `;

        const tituloLista = `<h3 style="font-size:15px; color:#2c3e50; margin:25px 0 15px 0; font-weight:bold; border-bottom:2px solid #eee; padding-bottom:8px;">📥 Exames Recebidos para Avaliação</h3>`;

        container.innerHTML = `${htmlAnalytics}${topBar}${tituloLista}<div id="ws-recebidas-cards-list">${htmlListaAlunos}</div>`;
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

   // 🤖 IDEIA 2: Pede à IA para analisar todas as respostas da prova e sugerir nota + feedback
    sugerirCorrecaoIA: async (entregaId) => {
        const btn = document.getElementById('ws-btn-sugerir-ia-prova');
        const inputNota = document.getElementById('ws-correcao-nota-input');
        const inputFeedback = document.getElementById('ws-correcao-feedback-input');

        const txtOriginal = btn ? btn.innerHTML : '🤖 Sugerir Correção e Nota com IA';
        if (btn) {
            btn.innerHTML = '🧠 A IA está a corrigir as respostas do aluno... ⏳';
            btn.disabled = true;
            btn.style.opacity = '0.75';
        }

        try {
            const res = await Workspace.api(`/workspace/avaliacoes/entregas/${entregaId}/avaliar-ia`, 'POST');
            if (res && res.success) {
                if (inputNota && res.notaSugerida !== undefined) inputNota.value = res.notaSugerida;
                if (inputFeedback && res.feedbackSugerido) inputFeedback.value = res.feedbackSugerido;
                Workspace.mostrarAviso("✨ Sugestão de nota e feedback gerada pela IA! Revise e clique em Salvar.", "success");
            } else {
                Workspace.mostrarAviso((res && res.error) || "A IA não conseguiu avaliar esta entrega agora.", "error");
            }
        } catch (e) {
            Workspace.mostrarAviso("Falha de comunicação com o Avaliador IA.", "error");
        } finally {
            if (btn) {
                btn.innerHTML = txtOriginal;
                btn.disabled = false;
                btn.style.opacity = '1';
            }
        }
    },

    // 💾 IDEIA 2: Salva a Nota Oficial e o Feedback do Professor e avisa o aluno no Sininho
    salvarCorrecaoProfessor: async (entregaId) => {
        const inputNota = document.getElementById('ws-correcao-nota-input');
        const inputFeedback = document.getElementById('ws-correcao-feedback-input');
        const btn = document.getElementById('ws-btn-salvar-correcao-prof');

        const notaVal = inputNota && inputNota.value !== '' ? Number(inputNota.value) : null;
        const feedbackVal = inputFeedback ? inputFeedback.value.trim() : '';

        if (notaVal !== null && (isNaN(notaVal) || notaVal < 0 || notaVal > 100)) {
            return Workspace.mostrarAviso("A nota deve ser um número entre 0 e 100.", "warning");
        }

        const txtOriginal = btn ? btn.innerHTML : '💾 Salvar Nota e Avisar Aluno';
        if (btn) {
            btn.innerHTML = '⏳ Guardando e notificando aluno...';
            btn.disabled = true;
        }

        try {
            const res = await Workspace.api(`/workspace/avaliacoes/entregas/${entregaId}/correcao`, 'PUT', {
                notaFinal: notaVal,
                feedbackProf: feedbackVal,
                professorNome: Workspace.usuario.nome || Workspace.usuario.login || 'Professor'
            });

            if (res && res.success) {
                const entregaCache = Workspace.Avaliacoes.entregasEmCache.find(e => e.id === entregaId);
                if (entregaCache) {
                    entregaCache.notaFinal = res.notaFinal;
                    entregaCache.feedbackProf = res.feedbackProf;
                    entregaCache.corrigidoEm = res.corrigidoEm;
                }
                Workspace.Avaliacoes.renderizarListaRecebidas();
                Workspace.mostrarAviso("✅ Correção guardada e enviada para o Sininho do aluno!", "success");

                const modalEl = document.getElementById('modal-ver-entrega');
                if (modalEl) modalEl.remove();
            } else {
                Workspace.mostrarAviso((res && res.error) || "Erro ao guardar correção.", "error");
            }
        } catch (e) {
            Workspace.mostrarAviso("Falha de ligação ao guardar a nota.", "error");
        } finally {
            if (btn) {
                btn.innerHTML = txtOriginal;
                btn.disabled = false;
            }
        }
    },

    verCorrecao: (entregaId, isAluno = false) => {
        const entrega = Workspace.Avaliacoes.entregasEmCache.find(e => e.id === entregaId);
        const prova = entrega ? Workspace.Avaliacoes.provasEmCache[entrega.avaliacaoId] : null;
        if(!entrega || !prova) return;

        const ident = Workspace.Avaliacoes.resolverIdentidadeEntrega(entrega);
        const nomeAlunoExibicao = ident.nome || entrega.alunoNome || 'Aluno';

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

        // 🌟 Cartão de Nota e Feedback para o Aluno (ou resumo no topo)
        let htmlDestaqueNotaAluno = '';
        if (entrega.notaFinal !== undefined && entrega.notaFinal !== null || entrega.feedbackProf) {
            const corNota = (entrega.notaFinal >= 70) ? '#059669' : (entrega.notaFinal >= 50 ? '#d97706' : '#dc2626');
            htmlDestaqueNotaAluno = `
                <div style="background: linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%); border: 2px solid #86efac; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:${entrega.feedbackProf ? '10px' : '0'};">
                        <span style="font-size:14px; font-weight:800; color:#1e293b;">🎓 Resultado Oficial da Avaliação</span>
                        ${entrega.notaFinal !== undefined && entrega.notaFinal !== null
                            ? `<span style="background:${corNota}; color:#fff; padding:5px 14px; border-radius:20px; font-size:15px; font-weight:900;">🌟 Nota Final: ${entrega.notaFinal}%</span>`
                            : ''}
                    </div>
                    ${entrega.feedbackProf
                        ? `<div style="font-size:13.5px; color:#334155; line-height:1.6; background:#ffffff; padding:12px 15px; border-radius:8px; border:1px solid #cbd5e1;"><strong>💬 Comentário do Professor:</strong><br>${Workspace.escapeHTML(entrega.feedbackProf).replace(/\n/g, '<br>')}</div>`
                        : ''}
                </div>
            `;
        }

        const respostasAluno = entrega.respostas || {};
        let totalEscolha = 0;
        let acertosEscolha = 0;

        if(prova.tipo === 'oral') {
            const audioHtml = entrega.audioUrl 
                ? `<audio controls src="${entrega.audioUrl}" style="width: 100%; outline: none; margin-bottom: 10px;"></audio>
                   <a href="${entrega.audioUrl}" target="_blank" style="font-size:12px; color:#3498db; font-weight:bold;">📥 Fazer Download do Áudio</a>`
                : `<div style="padding:20px; color:#e74c3c; font-weight:bold; background:#fdf2f2; border-radius:8px;">⚠️ O aluno desistiu ou abandonou a prova sem gravar áudio.</div>`;
                
            htmlRespostas = `
                ${htmlDestaqueNotaAluno}
                ${htmlAuditoria}
                <div style="margin-top: 15px; text-align:center;">
                    <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:12px; border-radius:8px; margin-bottom:15px; font-size:13px; color:#475569; text-align:left;">
                        <strong>🎙️ Instruções propostas na prova:</strong><br>${Workspace.escapeHTML(prova.instrucoes || '')}
                    </div>
                    ${audioHtml}
                </div>
            `;
        } else {
            htmlRespostas = `<div style="display:flex; flex-direction:column; gap:15px;">${htmlDestaqueNotaAluno}${htmlAuditoria}`;
            (prova.questoes || []).forEach(q => {
                const respBruta = respostasAluno[q.id];
                const respAluno = respBruta ? Workspace.escapeHTML(respBruta) : '<span style="color:#aaa;">Não respondeu (Deixou em branco)</span>';
                let validacaoHtml = '';
                let corBg = '#f9f9f9';

                if(q.tipo === 'escolha') {
                    totalEscolha++;
                    const acertou = (respBruta === q.respostaCorreta);
                    if (acertou) acertosEscolha++;
                    corBg = acertou ? '#eafaf1' : '#fdf2f2';
                    validacaoHtml = acertou 
                        ? `<div style="color:#27ae60; font-size:12px; font-weight:bold; margin-top:8px;">✅ Acertou</div>` 
                        : `<div style="color:#e74c3c; font-size:12px; font-weight:bold; margin-top:8px;">❌ Errou (Correta: ${Workspace.escapeHTML(q.respostaCorreta)})</div>`;
                }

                htmlRespostas += `
                    <div style="background: ${corBg}; padding: 15px; border-radius: 8px; border: 1px solid #eee;">
                        <div style="font-weight:bold; color:#2c3e50; font-size:13px; margin-bottom:8px;">${Workspace.escapeHTML(q.pergunta)}</div>
                        <div style="color:#555; font-size:13px; margin-bottom:5px;"><strong>${isAluno ? 'Sua Resposta' : 'Resposta do Aluno'}:</strong><br>${respAluno}</div>
                        ${validacaoHtml}
                    </div>
                `;
            });
            htmlRespostas += `</div>`;
        }

        // Painel exclusivo do Professor para atribuir Nota, Feedback e acionar o Avaliador IA
        let htmlPainelProfessor = '';
        if (!isAluno) {
            const notaInicial = (entrega.notaFinal !== undefined && entrega.notaFinal !== null)
                ? entrega.notaFinal
                : (totalEscolha > 0 ? Math.round((acertosEscolha / totalEscolha) * 100) : '');

            const btnSugerirIA = prova.tipo !== 'oral' ? `
                <button type="button" id="ws-btn-sugerir-ia-prova" onclick="Workspace.Avaliacoes.sugerirCorrecaoIA('${entrega.id}')" class="ws-btn" style="background:linear-gradient(135deg, #6366f1, #8b5cf6); color:#fff; border:none; padding:9px 16px; border-radius:8px; font-size:12px; font-weight:800; cursor:pointer; box-shadow:0 4px 10px rgba(99,102,241,0.25);">
                    🤖 Sugerir Correção e Nota com IA
                </button>
            ` : '';

            htmlPainelProfessor = `
                <div style="margin-top: 25px; background: #f8fafc; border: 2px solid #cbd5e1; border-radius: 12px; padding: 18px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:14px;">
                        <h4 style="margin:0; color:#1e293b; font-size:15px;">👩‍🏫 Painel de Correção e Nota Oficial</h4>
                        ${btnSugerirIA}
                    </div>
                    <div style="display:flex; gap:15px; flex-wrap:wrap; margin-bottom:12px;">
                        <div style="width: 160px;">
                            <label style="font-size:12px; font-weight:700; color:#475569; display:block; margin-bottom:5px;">Nota Final (0 a 100%)</label>
                            <input type="number" id="ws-correcao-nota-input" min="0" max="100" value="${notaInicial}" placeholder="Ex: 90" style="width:100%; padding:10px 12px; border-radius:8px; border:1.5px solid #94a3b8; font-size:15px; font-weight:800; color:#0f172a; background:#fff; outline:none;">
                        </div>
                        <div style="flex:1; min-width:220px;">
                            <label style="font-size:12px; font-weight:700; color:#475569; display:block; margin-bottom:5px;">Comentário / Feedback Pedagógico para o Aluno</label>
                            <textarea id="ws-correcao-feedback-input" rows="3" placeholder="Escreva os elogios e correções para o aluno (ou clique no botão roxo da IA acima)..." style="width:100%; padding:10px 12px; border-radius:8px; border:1.5px solid #cbd5e1; font-size:13px; font-family:inherit; background:#fff; outline:none; resize:vertical;">${Workspace.escapeHTML(entrega.feedbackProf || '')}</textarea>
                        </div>
                    </div>
                    <button type="button" id="ws-btn-salvar-correcao-prof" onclick="Workspace.Avaliacoes.salvarCorrecaoProfessor('${entrega.id}')" class="ws-btn" style="width:100%; background:#10b981; color:#fff; border:none; padding:12px; border-radius:10px; font-size:14px; font-weight:800; cursor:pointer; box-shadow:0 4px 12px rgba(16,185,129,0.25);">
                        💾 Salvar Nota e Avisar Aluno no Sininho
                    </button>
                </div>
            `;
        }

        const tituloModal = isAluno ? "A Minha Entrega e Correção" : `Avaliação de ${Workspace.escapeHTML(nomeAlunoExibicao)}`;
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
        
        modal.innerHTML = `
            <div class="ws-card" style="width: 95%; max-width: 750px; height: 85vh; max-height: 85vh; padding: 0; display: flex; flex-direction: column; overflow: hidden; border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.3);">
                
                <!-- CABEÇALHO INABALÁVEL -->
                <div style="padding: 20px 25px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: flex-start; background: #f8fafc; flex-shrink: 0; z-index: 10;">
                    <div style="flex: 1; padding-right: 15px;">
                        <h3 style="margin: 0 0 5px 0; color: #2c3e50; font-size: 18px;">${tituloModal}</h3>
                        <div style="font-size: 12px; color: #7f8c8d; font-weight:bold;">
                            Prova: <span style="color:#2c3e50;">${Workspace.escapeHTML(prova.titulo)}</span> &nbsp;|&nbsp; Entregue: <span style="color:#3498db;">${dataStr}</span>
                        </div>
                    </div>
                    <button onclick="document.getElementById('${modalId}').remove()" style="background:#e2e8f0; border:none; border-radius:50%; width:35px; height:35px; cursor:pointer; font-weight:bold; color:#475569; font-size:18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: 0.2s;" onmouseover="this.style.background='#e74c3c'; this.style.color='white'" onmouseout="this.style.background='#e2e8f0'; this.style.color='#475569'">✕</button>
                </div>
                
                <!-- CORPO DA PROVA (ONDE A ROLAGEM ACONTECE) -->
                <div id="ws-correcao-scroll-body" style="padding: 25px; overflow-y: auto; flex: 1; background: white;">
                    ${htmlRespostas}
                    ${htmlPainelProfessor}
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const scrollBody = document.getElementById('ws-correcao-scroll-body');
        if (scrollBody) {
            scrollBody.style.scrollbarWidth = 'thin';
            scrollBody.style.scrollbarColor = '#cbd5e1 transparent';
        }
    }, // 🚀 VÍRGULA AQUI PARA SEPARAR DA LOUSA!

    
// ========================================================================
    // 🖍 LOUSA DIGITAL - MOTOR PREMIUM V16 (COM CRONÓMETRO AO VIVO PRÓXIMO AO X)
    // ========================================================================
    lousaInterval: null,
    _lousaTimerInterval: null,
    _lousaSSE: null,
    _lousaProfState: { ativa: false, recursos: false, turmaId: 'global', ativadaEm: null },

    // ⏱️ Injeta e atualiza o cronómetro ao lado do botão X na barra superior do Professor e do Aluno
    garantirElementoCronometroLousa: () => {
        const modalProfHeader = document.querySelector('#ws-modal-lousa-prof > div:first-child');
        if (modalProfHeader && !document.getElementById('ws-lousa-timer-prof')) {
            const btnCloseProf = modalProfHeader.querySelector('button[onclick*="fecharLousaProfessor"]');
            const badgeProf = document.createElement('div');
            badgeProf.id = 'ws-lousa-timer-prof';
            badgeProf.style.cssText = 'background: rgba(15, 23, 42, 0.75); border: 1px solid #334155; color: #94a3b8; padding: 6px 12px; border-radius: 10px; font-weight: 800; font-size: 13px; font-variant-numeric: tabular-nums; display: flex; align-items: center; gap: 6px; margin-left: auto; margin-right: 12px; white-space: nowrap;';
            badgeProf.innerHTML = '⏱️ 00:00:00';
            if (btnCloseProf) modalProfHeader.insertBefore(badgeProf, btnCloseProf);
            else modalProfHeader.appendChild(badgeProf);
        }

        const modalAlunoHeader = document.querySelector('#ws-modal-lousa-aluno-fullscreen > div:first-child');
        if (modalAlunoHeader && !document.getElementById('ws-lousa-timer-aluno')) {
            const btnCloseAluno = modalAlunoHeader.querySelector('button[onclick*="fecharLousaFullscreen"]');
            const badgeAluno = document.createElement('div');
            badgeAluno.id = 'ws-lousa-timer-aluno';
            badgeAluno.style.cssText = 'background: rgba(15, 23, 42, 0.75); border: 1px solid #10b981; color: #34d399; padding: 6px 12px; border-radius: 10px; font-weight: 800; font-size: 13px; font-variant-numeric: tabular-nums; display: flex; align-items: center; gap: 6px; margin-left: auto; margin-right: 12px; white-space: nowrap;';
            badgeAluno.innerHTML = '⏱️ 00:00:00';
            if (btnCloseAluno) modalAlunoHeader.insertBefore(badgeAluno, btnCloseAluno);
            else modalAlunoHeader.appendChild(badgeAluno);
        }

        if (!Workspace.Avaliacoes._listenerMsgTimerLousa) {
            window.addEventListener('message', (e) => {
                const d = e.data || {};
                if (d.type === 'LOUSA_TIMER_SYNC') {
                    Workspace.Avaliacoes.gerirRelogioUsoLousa(!!d.ativa, d.ativadaEm || null);
                }
            });
            Workspace.Avaliacoes._listenerMsgTimerLousa = true;
        }
    },

    gerirRelogioUsoLousa: (ativa, ativadaEm) => {
        Workspace.Avaliacoes.garantirElementoCronometroLousa();
        if (Workspace.Avaliacoes._lousaTimerInterval) {
            clearInterval(Workspace.Avaliacoes._lousaTimerInterval);
            Workspace.Avaliacoes._lousaTimerInterval = null;
        }

        const elProf = document.getElementById('ws-lousa-timer-prof');
        const elAluno = document.getElementById('ws-lousa-timer-aluno');

        if (!ativa || !ativadaEm) {
            [elProf, elAluno].forEach(el => {
                if (!el) return;
                el.innerHTML = '⏱️ 00:00:00';
                el.style.color = '#94a3b8';
                el.style.borderColor = '#334155';
            });
            return;
        }

        const inicioMs = Number(ativadaEm) || Date.now();
        const atualizarVisores = () => {
            const diffSeg = Math.max(0, Math.floor((Date.now() - inicioMs) / 1000));
            const h = String(Math.floor(diffSeg / 3600)).padStart(2, '0');
            const m = String(Math.floor((diffSeg % 3600) / 60)).padStart(2, '0');
            const s = String(diffSeg % 60).padStart(2, '0');
            const texto = `⏱️ ${h}:${m}:${s}`;
            [elProf, elAluno].forEach(el => {
                if (!el) return;
                el.innerHTML = texto;
                el.style.color = '#34d399';
                el.style.borderColor = '#10b981';
            });
        };

        atualizarVisores();
        Workspace.Avaliacoes._lousaTimerInterval = setInterval(atualizarVisores, 1000);
    },

    carregarTurmasLousaProf: async () => {
        const selModal = document.getElementById('ws-prof-turma-lousa-modal');
        try {
            const turmas = await Workspace.api('/turmas', 'GET');
            const optionsHtml =
                '<option value="nenhuma">🚫 Ninguém</option>' +
                '<option value="global">🌍 Público Geral</option>' + 
                (turmas || []).map(t => `<option value="${t.id || t._id}">📚 ${Workspace.escapeHTML ? Workspace.escapeHTML(t.nome || t.name) : (t.nome || t.name)}</option>`).join('');
            if (selModal) selModal.innerHTML = optionsHtml;
        } catch(e) {
            if (selModal) {
                selModal.innerHTML = '<option value="nenhuma">🚫 Ninguém (Selecionar Turma)</option><option value="global">🌍 Público Geral</option>';
            }
        }
    },

    abrirLousaProfessor: async () => {
        // 🔒 MODO PADRÃO OBRIGATÓRIO: Inicia SEMPRE em "Ninguém" com Visualização Desativada e Recursos Desativados!
        const tid = 'nenhuma';
        Workspace.Avaliacoes.garantirElementoCronometroLousa();
        await Workspace.Avaliacoes.carregarTurmasLousaProf();

        try {
            await Workspace.api('/workspace/sala/workspace-lousa/status', 'PUT', {
                turmaId: 'nenhuma',
                ativa: false,
                recursos: false,
                desativarTodas: true,
                escolaId: Workspace.usuario?.escolaId || 'DEFAULT'
            });
        } catch (e) {}

        Workspace.Avaliacoes._lousaProfState = {
            turmaId: 'nenhuma',
            ativa: false,
            recursos: false,
            ativadaEm: null
        };
        
        const modal = document.getElementById('ws-modal-lousa-prof');
        const iframe = document.getElementById('iframeLousaProf');
        const selModal = document.getElementById('ws-prof-turma-lousa-modal');
        
        if (selModal) selModal.value = 'nenhuma';
        if (iframe) iframe.setAttribute('src', `/workspace-lousa.html?role=professor&room=nenhuma&_t=${Date.now()}`);
        
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
        Workspace.Avaliacoes.renderizarBotoesLousaProf();
    },

    mudarTurmaLousaIframe: async (turmaId) => {
        const tid = String(turmaId || 'nenhuma').trim();

        // 🛑 PARADA INSTANTÂNEA: Ao trocar de turma no seletor, desativa imediatamente a visualização e os recursos da turma anterior!
        try {
            await Workspace.api('/workspace/sala/workspace-lousa/status', 'PUT', {
                turmaId: tid,
                ativa: false,
                recursos: false,
                desativarTodas: true,
                escolaId: Workspace.usuario?.escolaId || 'DEFAULT'
            });
        } catch (e) {}

        Workspace.Avaliacoes._lousaProfState = {
            turmaId: tid,
            ativa: false,
            recursos: false,
            ativadaEm: null
        };

        // Carrega as telas numeradas exclusivas da turma selecionada
        const iframe = document.getElementById('iframeLousaProf');
        if (iframe) {
            iframe.setAttribute('src', `/workspace-lousa.html?role=professor&room=${encodeURIComponent(tid)}&_t=${Date.now()}`);
        }
        Workspace.Avaliacoes.renderizarBotoesLousaProf();
    },

    renderizarBotoesLousaProf: () => {
        const btnView = document.getElementById('btn-toggle-view');
        const btnRecursos = document.getElementById('btn-toggle-resources');
        const statusText = document.getElementById('ws-prof-lousa-status-modal');
        const { turmaId, ativa, recursos, ativadaEm } = Workspace.Avaliacoes._lousaProfState;
        const semTurma = (!turmaId || turmaId === 'nenhuma');

        if (btnView) {
            if (semTurma) {
                btnView.disabled = true;
                btnView.style.opacity = '0.45';
                btnView.style.cursor = 'not-allowed';
                btnView.style.background = '#475569';
                btnView.innerHTML = '🚫 Selecione uma Turma';
            } else {
                btnView.disabled = false;
                btnView.style.opacity = '1';
                btnView.style.cursor = 'pointer';
                btnView.innerHTML = ativa ? '🚫 Desativar Lousa' : '👁️ Ativar Lousa';
                btnView.style.background = ativa ? '#e74c3c' : '#3b82f6';
            }
        }
        if (btnRecursos) {
            if (semTurma || !ativa) {
                btnRecursos.style.display = 'inline-flex';
                btnRecursos.disabled = true;
                btnRecursos.style.opacity = '0.45';
                btnRecursos.style.cursor = 'not-allowed';
                btnRecursos.style.background = '#475569';
                btnRecursos.innerHTML = '🔒 Ferramentas (Ative a Lousa)';
            } else {
                btnRecursos.style.display = 'inline-flex';
                btnRecursos.disabled = false;
                btnRecursos.style.opacity = '1';
                btnRecursos.style.cursor = 'pointer';
                btnRecursos.innerHTML = recursos ? '🔒 Bloquear Ferramentas' : '🔓 Liberar Ferramentas';
                btnRecursos.style.background = recursos ? '#e74c3c' : '#f59e0b';
            }
        }
        if (statusText) {
            if (semTurma) {
                statusText.innerHTML = '⚪ Ninguém (Desativada)';
                statusText.style.color = '#94a3b8';
            } else {
                statusText.innerHTML = ativa ? (recursos ? '🟢 Ativa + Recursos Liberados' : '🟡 Ativa (Apenas Visualização)') : '⚪ Inativa para a Turma';
                statusText.style.color = ativa ? (recursos ? '#10B981' : '#F59E0B') : '#94a3b8';
            }
        }

        Workspace.Avaliacoes.gerirRelogioUsoLousa(ativa && !semTurma, ativadaEm);
    },

    toggleVisualizacao: async () => {
        const { turmaId, ativa } = Workspace.Avaliacoes._lousaProfState;
        if (!turmaId || turmaId === 'nenhuma') {
            Workspace.mostrarAviso('Selecione primeiro uma turma no topo antes de ativar a lousa!', 'warning');
            return;
        }
        const novoEstadoAtiva = !ativa;
        await Workspace.Avaliacoes.enviarComandoLousaStatus(turmaId, novoEstadoAtiva, false);
    },

    toggleRecursos: async () => {
        const { turmaId, ativa, recursos } = Workspace.Avaliacoes._lousaProfState;
        if (!turmaId || turmaId === 'nenhuma' || !ativa) {
            Workspace.mostrarAviso('Ative primeiro a Lousa para a turma antes de liberar os recursos!', 'warning');
            return;
        }
        await Workspace.Avaliacoes.enviarComandoLousaStatus(turmaId, true, !recursos);
    },

    enviarComandoLousaStatus: async (turmaId, ativa, recursos) => {
        const escolaId = Workspace.usuario?.escolaId || 'DEFAULT';
        const lousaAtiva = (turmaId && turmaId !== 'nenhuma') ? !!ativa : false;
        const recursosAtivos = lousaAtiva ? !!recursos : false;
        try {
            const res = await Workspace.api('/workspace/sala/workspace-lousa/status', 'PUT', {
                turmaId,
                ativa: lousaAtiva,
                recursos: recursosAtivos,
                escolaId
            });
            const ativadaEmFinal = lousaAtiva ? (res?.ativadaEm || Workspace.Avaliacoes._lousaProfState.ativadaEm || Date.now()) : null;
            Workspace.Avaliacoes._lousaProfState = {
                turmaId,
                ativa: lousaAtiva,
                recursos: recursosAtivos,
                ativadaEm: ativadaEmFinal
            };
            Workspace.Avaliacoes.renderizarBotoesLousaProf();
            
            const iframeProf = document.getElementById('iframeLousaProf');
            if (iframeProf && iframeProf.contentWindow) {
                try { 
                    iframeProf.contentWindow.postMessage({
                        type: 'STATUS_LOUSA_PROF',
                        ativa: lousaAtiva,
                        recursos: recursosAtivos,
                        turmaId: turmaId
                    }, '*');
                    if (lousaAtiva) {
                        iframeProf.contentWindow.postMessage({ type: 'FORCE_SAVE_DADOS' }, '*');
                    }
                } catch (err) {}
            }
        } catch(e) {
            Workspace.mostrarAviso('Erro ao comunicar com a Lousa.', 'error');
        }
    },

    fecharLousaProfessor: async () => {
        try {
            await Workspace.api('/workspace/sala/workspace-lousa/status', 'PUT', {
                turmaId: 'nenhuma',
                ativa: false,
                recursos: false,
                desativarTodas: true,
                escolaId: Workspace.usuario?.escolaId || 'DEFAULT'
            });
        } catch (e) {}
        Workspace.Avaliacoes.gerirRelogioUsoLousa(false, null);
        const modal = document.getElementById('ws-modal-lousa-prof');
        const iframe = document.getElementById('iframeLousaProf');
        if (modal) modal.style.display = 'none';
        if (iframe) iframe.src = '';
        document.body.style.overflow = '';
    },

    abrirLousaFullscreen: () => {
        Workspace.Avaliacoes.garantirElementoCronometroLousa();
        const modal = document.getElementById('ws-modal-lousa-aluno-fullscreen');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; 
        }
        Workspace.Avaliacoes.iniciarMonitorLousa(true);
    },

    fecharLousaFullscreen: () => {
        const modal = document.getElementById('ws-modal-lousa-aluno-fullscreen');
        if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
        if (Workspace.Avaliacoes._lousaTimerInterval) {
            clearInterval(Workspace.Avaliacoes._lousaTimerInterval);
            Workspace.Avaliacoes._lousaTimerInterval = null;
        }
        Workspace.Avaliacoes.iniciarMonitorLousa(false);
        const iframe = document.getElementById('iframeLousaAluno');
        if (iframe) iframe.setAttribute('src', ''); 
    },

    iniciarMonitorLousa: async (ligar) => {
        if (!ligar) return; 

        let turmaId = 'global';
        let userId = '';
        let alunoRefId = '';
        try {
            if (Workspace.usuario) {
                let t = Workspace.usuario.turma || Workspace.usuario.turmaId || Workspace.usuario.turmas?.[0] || 'global';
                if (typeof t === 'object') t = t.id || t._id || t.nome || 'global';
                turmaId = String(t).trim() || 'global';
                userId = String(Workspace.usuario.id || '').trim();
                alunoRefId = String(Workspace.usuario.alunoRefId || Workspace.usuario.id || '').trim();
            }
        } catch(e) {}

        const iframe = document.getElementById('iframeLousaAluno');
        const urlMagica = `/workspace-lousa.html?role=aluno&room=${encodeURIComponent(turmaId)}&userId=${encodeURIComponent(userId)}&alunoRefId=${encodeURIComponent(alunoRefId)}&_t=${Date.now()}`;
        if (iframe) {
            iframe.setAttribute('src', urlMagica);
        }
    }
}); // <--- 🚀 ESTA LINHA FECHA O Object.assign E É MUITO IMPORTANTE!

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (Workspace.usuario && Workspace.usuario.tipo !== 'Aluno') {
            // Carrega as turmas da Lousa
            if (Workspace.Avaliacoes.carregarTurmasLousaProf) Workspace.Avaliacoes.carregarTurmasLousaProf();
            
            // 🚀 GATILHO DA MEMÓRIA: Chama o detetive assim que a página termina de carregar!
            if (Workspace.Avaliacoes.restaurarTelaProfessor) {
                Workspace.Avaliacoes.restaurarTelaProfessor();
            }
        }
    }, 1500); // Aguarda o Workspace base carregar (1.5s) e ativa a memória
});