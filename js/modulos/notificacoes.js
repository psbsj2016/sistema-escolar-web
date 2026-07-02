window.App = window.App || {};
const App = window.App;

// =========================================================
// MÓDULO NOTIFICAÇÕES - SININHO, RADAR E ALERTAS (COM IA PREDITIVA E BOTÃO X)
// =========================================================

Object.assign(App, {

    // 🧠 Memória da sessão para guardar os alertas inteligentes que o utilizador já fechou (clicou no X)
    alertasOcultos: new Set(),

    verificarNotificacoes: async () => {
        try {
            const tipoUtilizador = App.usuario ? App.usuario.tipo : 'Gestor';

            const notificacoesBanco = await App.api('/sistema/notificacoes/nao-lidas');
            let alunos = await App.api('/alunos');
            const eventos = await App.api('/eventos');
            const financeiro = await App.api('/financeiro');
            const planejamentos = await App.api('/planejamentos');
            const estoque = await App.api('/estoques');
            const escola = await App.api('/escola');
            const cursos = await App.api('/cursos').catch(() => []); 

            if (Array.isArray(alunos)) {
                alunos = alunos.filter(a => !a.status || a.status === 'Ativo');
            }

            // 🔄 Atualização automática da tela de alunos
            if (App.entidadeAtual === 'aluno' && Array.isArray(alunos) && Array.isArray(App.listaCache)) {
                const idsAtuais = App.listaCache.map(a => a.id);
                const existeNovoAluno = alunos.some(a => !idsAtuais.includes(a.id));

                if (existeNovoAluno) {
                    App.showToast("Novo aluno recebido pela matrícula online.", "success");
                    App.listaCache = alunos;
                    const inputBusca = document.getElementById('input-busca');
                    if (inputBusca) inputBusca.value = '';
                    if (typeof App.filtrarTabelaReativa === 'function') App.filtrarTabelaReativa();
                }
            }

            let alertas = [];

            // 🛠️ Função auxiliar: Só adiciona o alerta se o utilizador ainda não tiver clicado no X
            const adicionarAlertaInteligente = (alerta) => {
                if (!App.alertasOcultos.has(alerta.id)) {
                    alertas.push(alerta);
                }
            };

            // 1. Notificações normais da Base de Dados
            if (Array.isArray(notificacoesBanco)) {
                notificacoesBanco
                    .filter(n => !n.lida)
                    .sort((a, b) => new Date(b.dataCriacao || 0) - new Date(a.dataCriacao || 0))
                    .slice(0, 10)
                    .forEach(n => {
                        adicionarAlertaInteligente({
                            id: n.id, // ID real do banco
                            icon: n.tipo === 'matricula_contrato' ? '📝' : '🔔',
                            texto: `<b>${App.escapeHTML(n.titulo || 'Nova notificação')}</b><br>${App.escapeHTML(n.mensagem || '')}<br><small>Origem: ${App.escapeHTML(n.refLink || 'Direto')}</small>`,
                            acao: "App.renderizarContratos()"
                        });
                    });
            }

            const hoje = new Date();
            const ano = hoje.getFullYear();
            const mes = String(hoje.getMonth() + 1).padStart(2, '0');
            const dia = String(hoje.getDate()).padStart(2, '0');
            const hojeStr = `${ano}-${mes}-${dia}`;
            const hojeTime = hoje.getTime();
            
            const amanha = new Date(hoje);
            amanha.setDate(amanha.getDate() + 1);
            const amanhaStr = `${amanha.getFullYear()}-${String(amanha.getMonth() + 1).padStart(2, '0')}-${String(amanha.getDate()).padStart(2, '0')}`;

            // 2. Alertas de Vencimento do Plano do Sistema
            if (escola && tipoUtilizador === 'Gestor') {
                const planoAtual = escola.plano || 'Teste';
                let diasRestantes = 0;
                
                if (escola.dataExpiracao) {
                    const dataVenc = new Date(escola.dataExpiracao).getTime();
                    diasRestantes = Math.ceil((dataVenc - hojeTime) / (1000 * 60 * 60 * 24));
                } else {
                    const dataCriacao = escola.dataCriacao ? new Date(escola.dataCriacao).getTime() : hojeTime;
                    const diasPassados = Math.floor(Math.abs(hojeTime - dataCriacao) / (1000 * 60 * 60 * 24));
                    diasRestantes = (planoAtual === 'Teste' ? 7 : 30) - diasPassados;
                }

                if (planoAtual !== 'Premium' && planoAtual !== 'Bloqueado') {
                    if (diasRestantes <= 3 && diasRestantes > 0) {
                        adicionarAlertaInteligente({ 
                            id: 'alerta_plano_vence', // ID Fictício Inteligente
                            icon: '⏳', 
                            texto: `<b>Atenção Gestor:</b> O seu plano <b>${planoAtual}</b> expira em <b>${diasRestantes} dia(s)</b>! Renove agora.`, 
                            acao: "App.renderizarTela('plano')" 
                        });
                    } else if (diasRestantes <= 0) {
                        adicionarAlertaInteligente({ 
                            id: 'alerta_plano_venceu',
                            icon: '🚫', 
                            texto: `<b>Urgente:</b> O seu acesso <b>expirou</b>! Regularize para continuar a usar o sistema.`, 
                            acao: "App.renderizarTela('plano')" 
                        });
                    }
                }
            }

            // 3. Aniversários e Novas Matrículas
            if (Array.isArray(alunos)) {
                alunos.forEach(a => {
                    if (a.nascimento && a.nascimento.substring(5) === `${mes}-${dia}`) {
                        adicionarAlertaInteligente({ 
                            id: `alerta_niver_${a.id}`,
                            icon: '🎂', 
                            texto: `Hoje é o aniversário de <b>${App.escapeHTML(a.nome)}</b>! Clique para ver.`,
                            acao: "App.renderizarLista('aluno')" 
                        });
                    }
                    if (a.dataMatricula && a.dataMatricula.startsWith(hojeStr)) {
                        adicionarAlertaInteligente({ 
                            id: `alerta_matr_${a.id}`,
                            icon: '🎉', 
                            texto: `<b>Nova Matrícula!</b> O aluno <b>${App.escapeHTML(a.nome)}</b> foi registado hoje.`,
                            acao: "App.renderizarContratos()" 
                        });
                    }
                });
            }

            // 4. Mensalidades de Hoje e Eventos do Calendário
            if (tipoUtilizador !== 'Professor' && Array.isArray(financeiro)) {
                const vencemHoje = financeiro.filter(f => f.vencimento === hojeStr && f.status === 'Pendente');
                if (vencemHoje.length > 0) {
                    adicionarAlertaInteligente({ 
                        id: `alerta_caixa_${hojeStr}`,
                        icon: '💲', 
                        texto: `<b>Caixa de Hoje:</b> Existem <b>${vencemHoje.length}</b> mensalidades a vencer no dia de hoje.`,
                        acao: "App.renderizarTela('mensalidades')" 
                    });
                }
            }

            if (Array.isArray(eventos)) {
                eventos.forEach(e => {
                    if (e.data === hojeStr) adicionarAlertaInteligente({ 
                        id: `alerta_evt_${e.id}`,
                        icon: '🚨', 
                        texto: `<b>Hoje:</b> ${App.escapeHTML(e.tipo)} - ${App.escapeHTML(e.descricao)}`,
                        acao: "App.renderizarTela('calendario')" 
                    });
                    else if (e.data === amanhaStr) adicionarAlertaInteligente({ 
                        id: `alerta_evt_${e.id}`,
                        icon: '⏳', 
                        texto: `<b>Amanhã:</b> ${App.escapeHTML(e.tipo)} - ${App.escapeHTML(e.descricao)}`,
                        acao: "App.renderizarTela('calendario')" 
                    });
                });
            }

            // 5. IA PREDITIVA DE FATURAÇÃO PERDIDA
            if (tipoUtilizador !== 'Professor' && Array.isArray(financeiro) && Array.isArray(alunos) && Array.isArray(planejamentos)) {
                const trintaDiasAtras = new Date(hojeTime - 30 * 24 * 60 * 60 * 1000);

                alunos.forEach(aluno => {
                    const plano = planejamentos.find(p => p.idAluno === aluno.id);
                    let dataUltimaMensalidade = null;
                    
                    financeiro.forEach(f => {
                        if (f.idAluno === aluno.id && f.status !== 'Cancelado' && (!f.idCarne || !f.idCarne.includes('VENDA'))) {
                            if (!dataUltimaMensalidade || f.vencimento > dataUltimaMensalidade) {
                                dataUltimaMensalidade = f.vencimento;
                            }
                        }
                    });

                    if (dataUltimaMensalidade && plano && plano.aulas) {
                        const dataUltima = new Date(dataUltimaMensalidade);
                        const diffTempo = dataUltima.getTime() - hojeTime;
                        const diffDias = Math.ceil(diffTempo / (1000 * 3600 * 24));
                        
                        if (diffDias <= 30) {
                            const cursoInfo = cursos.find(c => c.id === aluno.cursoId || c.nome === aluno.planoCurso);
                            const cargaHorariaTotal = cursoInfo && cursoInfo.cargaHoraria ? parseInt(cursoInfo.cargaHoraria) : (plano.aulas.length * 2);

                            let horasCumpridas = 0;
                            let aulasNoUltimoMes = 0;
                            let horasNoUltimoMes = 0;
                            let dataUltimaAulaLogada = hojeTime;

                            plano.aulas.forEach(aula => {
                                if (!aula.data) return;
                                
                                const partesData = aula.data.includes('/') ? aula.data.split('/') : null;
                                let dataAulaObj = partesData ? new Date(`${partesData[2]}-${partesData[1]}-${partesData[0]}`) : new Date(aula.data);
                                if(isNaN(dataAulaObj.getTime())) dataAulaObj = new Date();
                                
                                const duracaoAula = parseFloat(aula.duracao) || 2; 

                                if (aula.visto) { 
                                    dataUltimaAulaLogada = Math.max(dataUltimaAulaLogada, dataAulaObj.getTime());
                                    const isFalta = aula.status === 'Falta' || aula.status === 'Justificada' || aula.status === 'Faltou' || aula.presenca === false;
                                    
                                    if (!isFalta) horasCumpridas += duracaoAula;

                                    if (dataAulaObj >= trintaDiasAtras && dataAulaObj <= hojeTime) {
                                        aulasNoUltimoMes++;
                                        horasNoUltimoMes += duracaoAula; 
                                    }
                                }
                            });

                            const horasFaltantes = cargaHorariaTotal - horasCumpridas;

                            if (horasFaltantes > 0) {
                                const ritmoHorasMensal = horasNoUltimoMes > 0 ? horasNoUltimoMes : 8; 
                                const duracaoMediaAula = aulasNoUltimoMes > 0 ? (horasNoUltimoMes / aulasNoUltimoMes) : 2;
                                
                                const aulasRestantesEstimadas = Math.ceil(horasFaltantes / duracaoMediaAula);
                                const mesesNecessarios = horasFaltantes / ritmoHorasMensal;
                                
                                const dataProjetada = new Date(dataUltimaAulaLogada);
                                dataProjetada.setDate(dataProjetada.getDate() + Math.ceil(mesesNecessarios * 30));
                                const dataProjStr = `${String(dataProjetada.getDate()).padStart(2, '0')}/${String(dataProjetada.getMonth() + 1).padStart(2, '0')}/${dataProjetada.getFullYear()}`;

                                let tempoTexto = diffDias < 0 ? `já venceu há ${Math.abs(diffDias)} dias` : (diffDias === 0 ? `vence hoje` : `vence em ${diffDias} dias`);

                                adicionarAlertaInteligente({ 
                                    id: `alerta_preditiva_${aluno.id}`,
                                    icon: '🎯', 
                                    texto: `<div style="line-height:1.5;"><b>Auditoria Preditiva (Mensalidade Extra):</b><br>
                                    A última mensalidade de <b style="color:#3498db;">${App.escapeHTML(aluno.nome)}</b> ${tempoTexto}.<br>
                                    O curso exige <b>${cargaHorariaTotal}h</b>, mas o aluno cumpriu <b>${horasCumpridas}h</b>.<br>
                                    Faltam <b>${horasFaltantes}h</b> (aprox. ${aulasRestantesEstimadas} aulas). Pelo seu ritmo (${ritmoHorasMensal}h/mês), a formatura acontecerá em <b style="color:#e74c3c;">${dataProjStr}</b>.</div>`,
                                    acao: "App.renderizarTela('mensalidades')"
                                });
                            }
                        }
                    }
                });
            }
    
            // 6. Alerta de Estoque
            if (Array.isArray(estoque)) {
                estoque.forEach(item => {
                    const qtd = parseInt(item.quantidade) || 0;
                    const min = parseInt(item.quantidadeMinima) || 0;
                    if (qtd <= min) {
                        adicionarAlertaInteligente({ 
                            id: `alerta_estoque_${item.id}`,
                            icon: '📦', 
                            texto: `<b>Estoque Baixo:</b> Restam apenas ${qtd} unidades de <b>${App.escapeHTML(item.nome)}</b>!`,
                            acao: "App.renderizarLista('estoque')" 
                        });
                    }
                });
            }

            // ==========================================
            // 🎨 RENDERIZAÇÃO DA INTERFACE COM O NOVO BOTÃO X
            // ==========================================
            const badge = document.getElementById('noti-badge');
            const list = document.getElementById('noti-list');
            
            if (alertas.length > 0) {
                if (badge) { badge.innerText = alertas.length; badge.style.display = 'block'; }
                const btnMarcarLidas = `
                    <div style="padding:8px; border-bottom:1px solid #eee;">
                        <button onclick="App.marcarNotificacoesComoLidas()" style="width:100%; border:none; background:#f4f6f7; color:#2c3e50; padding:10px; border-radius:8px; font-size:12px; font-weight:bold; cursor:pointer; transition:0.2s;" onmouseover="this.style.background='#e5e7e9'" onmouseout="this.style.background='#f4f6f7'">
                            ✅ Limpar tudo o que foi lido
                        </button>
                    </div>`;
                
                // 🖌️ Aqui está a injeção do Botão "X" elegante e funcional
                if (list) list.innerHTML = btnMarcarLidas + alertas.map(a => `
                    <div id="box-alerta-${a.id}" class="noti-item" style="cursor:pointer; transition:background 0.2s; display: flex; align-items: flex-start; gap: 10px; padding: 12px 15px; border-bottom: 1px solid #f1f5f9;" onmouseover="this.style.background='#f1f2f6'" onmouseout="this.style.background='transparent'" onclick="${a.acao}; App.toggleNotificacoes();">
                        <span class="noti-icon" style="font-size: 20px;">${a.icon}</span>
                        <div style="flex: 1;">${a.texto}</div>
                        <button onclick="App.dispensarAlerta('${a.id}', event)" style="background:transparent; border:none; cursor:pointer; color:#9ca3af; padding:4px; font-size:14px; border-radius:4px; transition:0.2s; align-self: flex-start; margin-top: -2px;" onmouseover="this.style.color='#e74c3c'; this.style.background='#fee2e2'" onmouseout="this.style.color='#9ca3af'; this.style.background='transparent'" title="Remover este aviso">✖</button>
                    </div>
                `).join('');
            } else {
                if (badge) badge.style.display = 'none';
                if (list) list.innerHTML = `<div class="noti-item" style="justify-content:center; color:#999; padding: 30px 15px;">Nenhum alerta pendente.<br>Tudo tranquilo! 🎉</div>`;
            }
        } catch (e) { console.error("Erro nas notificações", e); }
    },

    // 🚀 NOVA FUNÇÃO: DISPENSAR UM ALERTA ESPECÍFICO
    dispensarAlerta: async (id, event) => {
        // Impede que o clique no "X" acione o evento de abrir a notificação
        event.stopPropagation(); 

        // Esconde imediatamente a notificação da interface para resposta rápida
        const itemVisual = document.getElementById(`box-alerta-${id}`);
        if (itemVisual) itemVisual.style.display = 'none';

        // Atualiza a bolinha vermelha no sino instantaneamente
        const badge = document.getElementById('noti-badge');
        if (badge) {
            let qtdAtual = parseInt(badge.innerText) || 0;
            qtdAtual = qtdAtual - 1;
            
            if (qtdAtual > 0) {
                badge.innerText = qtdAtual;
            } else {
                badge.style.display = 'none';
                const list = document.getElementById('noti-list');
                if (list) list.innerHTML = `<div class="noti-item" style="justify-content:center; color:#999; padding: 30px 15px;">Nenhum alerta pendente.<br>Tudo tranquilo! 🎉</div>`;
            }
        }

        // Se o ID começar por 'alerta_', é um alerta inteligente gerado na hora (não está no banco de dados)
        if (id.startsWith('alerta_')) {
            App.alertasOcultos.add(id); // Guarda na memória da sessão para não o voltar a mostrar hoje
        } else {
            // Se for uma notificação oficial da Base de Dados, pede à API para marcar como lida
            try {
                await App.api(`/sistema/notificacoes/lida/${id}`, 'PUT');
            } catch (e) {
                console.error("Erro ao dispensar notificação oficial", e);
            }
        }
    },

    toggleNotificacoes: () => {
        const dropdown = document.getElementById('noti-dropdown');
        if (dropdown) dropdown.classList.toggle('active');
    },

   marcarNotificacoesComoLidas: async () => {
        try {
            const notificacoes = await App.api('/sistema/notificacoes/nao-lidas');
            if (!Array.isArray(notificacoes)) return App.showToast("Não foi possível carregar notificações.", "error");

            const naoLidas = notificacoes.filter(n => !n.lida);
            if (naoLidas.length === 0) return App.showToast("Não há notificações novas.", "info");

            await Promise.all(naoLidas.map(n => App.api(`/sistema/notificacoes/lida/${n.id}`, 'PUT')));

            App.showToast("Notificações marcadas como lidas.", "success");
            await App.verificarNotificacoes();
        } catch (e) {
            console.error(e);
            App.showToast("Erro ao marcar notificações.", "error");
        }
    },

    iniciarRadar: () => {
        if (App.radarAtivo) clearInterval(App.radarAtivo);

        const rodarRadar = async () => {
            if (!App.usuario) return;
            if (typeof App.verificarNotificacoes === 'function') await App.verificarNotificacoes();
        };

        rodarRadar();
        App.radarAtivo = setInterval(rodarRadar, 10000);
    }

});