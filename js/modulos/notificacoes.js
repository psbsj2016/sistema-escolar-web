window.App = window.App || {};
const App = window.App;

// =========================================================
// MÓDULO NOTIFICAÇÕES - SININHO, RADAR E ALERTAS (COM IA PREDITIVA DE FATURAÇÃO)
// =========================================================

Object.assign(App, {

    verificarNotificacoes: async () => {
        try {
            const tipoUtilizador = App.usuario ? App.usuario.tipo : 'Gestor';

            // Puxa TODOS os dados diretos da fonte (Tempo Real)
            const notificacoesBanco = await App.api('/sistema/notificacoes/nao-lidas');
            let alunos = await App.api('/alunos');
            const eventos = await App.api('/eventos');
            const financeiro = await App.api('/financeiro');
            const planejamentos = await App.api('/planejamentos');
            const estoque = await App.api('/estoques');
            const escola = await App.api('/escola');
            const cursos = await App.api('/cursos').catch(() => []); 
            const chamadas = await App.api('/chamadas').catch(() => []); // 🚀 A nova Fonte da Verdade!

            if (Array.isArray(alunos)) {
                alunos = alunos.filter(a => !a.status || a.status === 'Ativo');
            }

            // 🔄 Atualização automática da tela de alunos quando chegar matrícula pública
            if (
                App.entidadeAtual === 'aluno' &&
                Array.isArray(alunos) &&
                Array.isArray(App.listaCache)
            ) {
                const idsAtuais = App.listaCache.map(a => a.id);
                const existeNovoAluno = alunos.some(a => !idsAtuais.includes(a.id));

                if (existeNovoAluno) {
                    App.showToast("Novo aluno recebido pela matrícula online.", "success");
                    App.listaCache = alunos;
                    const inputBusca = document.getElementById('input-busca');
                    if (inputBusca) inputBusca.value = '';

                    if (typeof App.filtrarTabelaReativa === 'function') {
                        App.filtrarTabelaReativa();
                    }
                }
            }

            let alertas = [];

            if (Array.isArray(notificacoesBanco)) {
                notificacoesBanco
                    .filter(n => !n.lida)
                    .sort((a, b) => new Date(b.dataCriacao || 0) - new Date(a.dataCriacao || 0))
                    .slice(0, 10)
                    .forEach(n => {
                        alertas.push({
                            icon: n.tipo === 'matricula_contrato' ? '📝' : '🔔',
                            texto: `<b>${App.escapeHTML(n.titulo || 'Nova notificação')}</b><br>${App.escapeHTML(n.mensagem || '')}<br><small>Origem: ${App.escapeHTML(n.refLink || 'Direto')}</small>`,
                            prioridade: 1,
                            acao: "App.renderizarContratos()"
                        });
                    });
            }

            const hoje = new Date();
            const ano = hoje.getFullYear();
            const mes = hoje.getMonth();
            const dia = hoje.getDate();
            const hojeStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            const hojeTime = hoje.getTime();
            
            const amanha = new Date(hoje);
            amanha.setDate(amanha.getDate() + 1);
            const amanhaStr = `${amanha.getFullYear()}-${String(amanha.getMonth() + 1).padStart(2, '0')}-${String(amanha.getDate()).padStart(2, '0')}`;

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
                        alertas.push({ 
                            icon: '⏳', 
                            texto: `<b>Atenção Gestor:</b> O seu plano <b>${planoAtual}</b> expira em <b>${diasRestantes} dia(s)</b>! Renove agora.`, 
                            acao: "App.renderizarTela('plano')" 
                        });
                    } else if (diasRestantes <= 0) {
                        alertas.push({ 
                            icon: '🚫', 
                            texto: `<b>Urgente:</b> O seu acesso <b>expirou</b>! Regularize para continuar a usar o sistema.`, 
                            acao: "App.renderizarTela('plano')" 
                        });
                    }
                }
            }

            if (Array.isArray(alunos)) {
                alunos.forEach(a => {
                    if (a.nascimento && a.nascimento.substring(5) === `${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`) {
                        alertas.push({ 
                            icon: '🎂', 
                            texto: `Hoje é o aniversário de <b>${App.escapeHTML(a.nome)}</b>! Clique para ver.`,
                            acao: "App.renderizarLista('aluno')" 
                        });
                    }
                });
            }
            
            // ==========================================
            // 🆕 ALERTA DE NOVAS MATRÍCULAS (HOJE)
            // ==========================================
            if (Array.isArray(alunos)) {
                alunos.forEach(a => {
                    if (a.dataMatricula && a.dataMatricula.startsWith(hojeStr)) {
                        alertas.push({ 
                            icon: '🎉', 
                            texto: `<b>Nova Matrícula!</b> O aluno <b>${App.escapeHTML(a.nome)}</b> foi registado hoje.`,
                            acao: "App.renderizarContratos()" 
                        });
                    }
                });
            }

            // ==========================================
            // 💸 MENSALIDADES A VENCER HOJE
            // ==========================================
            if (tipoUtilizador !== 'Professor' && Array.isArray(financeiro)) {
                const vencemHoje = financeiro.filter(f => f.vencimento === hojeStr && f.status === 'Pendente');
                if (vencemHoje.length > 0) {
                    alertas.push({ 
                        icon: '💲', 
                        texto: `<b>Caixa de Hoje:</b> Existem <b>${vencemHoje.length}</b> mensalidades a vencer no dia de hoje.`,
                        acao: "App.renderizarTela('mensalidades')" 
                    });
                }
            }

            // ==========================================
            // 🤖 IA PREDITIVA DE FATURAÇÃO PERDIDA (EXATIDÃO MÁXIMA)
            // ==========================================
            if (tipoUtilizador !== 'Professor') {
                if (Array.isArray(financeiro) && Array.isArray(alunos) && Array.isArray(planejamentos) && Array.isArray(chamadas)) {
                    
                    const trintaDiasAtras = new Date(hojeTime - 30 * 24 * 60 * 60 * 1000);

                    alunos.forEach(aluno => {
                        const plano = planejamentos.find(p => p.idAluno === aluno.id);
                        let dataUltimaMensalidade = null;
                        
                        // 1. Descobrir a data da ÚLTIMA parcela financeira absoluta
                        financeiro.forEach(f => {
                            if (f.idAluno === aluno.id && f.status !== 'Cancelado' && (!f.idCarne || !f.idCarne.includes('VENDA'))) {
                                if (!dataUltimaMensalidade || f.vencimento > dataUltimaMensalidade) {
                                    dataUltimaMensalidade = f.vencimento;
                                }
                            }
                        });

                        if (dataUltimaMensalidade && plano) {
                            
                            // A) Raio-X Financeiro (Garante cálculo de dias perfeitos via Timezone local)
                            const partesVenc = dataUltimaMensalidade.split('-');
                            const dataUltimaLocal = new Date(partesVenc[0], partesVenc[1] - 1, partesVenc[2]);
                            const dataHojeLocal = new Date(ano, mes, dia);
                            
                            const diffTempo = dataUltimaLocal.getTime() - dataHojeLocal.getTime();
                            const diffDias = Math.ceil(diffTempo / (1000 * 3600 * 24));
                            
                            if (diffDias <= 30) {
                                // B) Raio-X da Carga Horária Exigida (Curso do Aluno)
                                const cursoInfo = cursos.find(c => c.id === aluno.cursoId || c.nome === aluno.planoCurso);
                                const cargaHorariaTotal = cursoInfo && cursoInfo.cargaHoraria ? parseFloat(cursoInfo.cargaHoraria) : (plano.aulas ? plano.aulas.length * 2 : 40);

                                // C) Auditoria Fria na Base de Chamadas (Ignora o Planejamento, lê a realidade)
                                let horasCumpridas = 0;
                                let aulasNoUltimoMes = 0;
                                let horasNoUltimoMes = 0;
                                let dataUltimaAulaLogada = hojeTime;
                                
                                const chamadasAluno = chamadas.filter(c => c.idAluno === aluno.id);

                                chamadasAluno.forEach(c => {
                                    if (!c.data) return;
                                    
                                    const partesData = c.data.includes('/') ? c.data.split('/') : c.data.split('-');
                                    let dataAulaObj = new Date();
                                    if (c.data.includes('/')) {
                                        dataAulaObj = new Date(partesData[2], partesData[1] - 1, partesData[0], 12, 0, 0);
                                    } else {
                                        dataAulaObj = new Date(partesData[0], partesData[1] - 1, partesData[2], 12, 0, 0);
                                    }

                                    if(isNaN(dataAulaObj.getTime())) dataAulaObj = new Date();
                                    
                                    // Parse da duração da aula (Ex: "01:30" vira 1.5 horas)
                                    let duracaoAula = 2; // Padrão
                                    if (c.duracao && c.duracao.includes(':')) {
                                        const [h, m] = c.duracao.split(':').map(Number);
                                        duracaoAula = h + ((m || 0) / 60);
                                    } else if (c.duracao) {
                                        duracaoAula = parseFloat(c.duracao) || 2;
                                    }

                                    dataUltimaAulaLogada = Math.max(dataUltimaAulaLogada, dataAulaObj.getTime());
                                    
                                    // SÓ CONTA COMO HORA CUMPRIDA SE O ALUNO FOI! (Faltas injustificadas ou justificadas são ignoradas = tem de pagar e repor)
                                    if (c.status === 'Presença' || c.status === 'Reposição') {
                                        horasCumpridas += duracaoAula;
                                    }

                                    // Para calcular o Ritmo, contamos TUDO o que aconteceu no último mês (mesmo que ele tenha faltado)
                                    if (dataAulaObj.getTime() >= trintaDiasAtras.getTime() && dataAulaObj.getTime() <= hojeTime) {
                                        aulasNoUltimoMes++;
                                        horasNoUltimoMes += duracaoAula; 
                                    }
                                });

                                // O Défice Exato
                                const horasFaltantes = cargaHorariaTotal - horasCumpridas;

                                // D) O Alarme Preditivo Cirúrgico
                                if (horasFaltantes > 0) {
                                    
                                    // Projeção baseada na velocidade do aluno
                                    const ritmoHorasMensal = horasNoUltimoMes > 0 ? horasNoUltimoMes : 8; // Mínimo de 8h/mês se estiver congelado
                                    const duracaoMediaAula = aulasNoUltimoMes > 0 ? (horasNoUltimoMes / aulasNoUltimoMes) : 2;
                                    
                                    const aulasRestantesEstimadas = Math.ceil(horasFaltantes / duracaoMediaAula);
                                    const mesesNecessarios = horasFaltantes / ritmoHorasMensal;
                                    
                                    // Calculadora do dia da Formatura
                                    const dataProjetada = new Date(dataUltimaAulaLogada);
                                    dataProjetada.setDate(dataProjetada.getDate() + Math.ceil(mesesNecessarios * 30));
                                    const dataProjStr = `${String(dataProjetada.getDate()).padStart(2, '0')}/${String(dataProjetada.getMonth() + 1).padStart(2, '0')}/${dataProjetada.getFullYear()}`;

                                    let tempoTexto = diffDias < 0 ? `já venceu há ${Math.abs(diffDias)} dias` : (diffDias === 0 ? `vence hoje` : `vence em ${diffDias} dias`);
                                    
                                    const txtFaltas = (cargaHorariaTotal - horasCumpridas) > 0 ? `<br>Devido a faltas ou atrasos, cumpriu apenas <b>${parseFloat(horasCumpridas.toFixed(1))}h</b> das <b>${parseFloat(cargaHorariaTotal.toFixed(1))}h</b> do curso.` : '';

                                    alertas.push({ 
                                        icon: '🎯', 
                                        texto: `<div style="line-height:1.5;"><b>Auditoria Preditiva (Mensalidade Extra):</b><br>
                                        A última mensalidade de <b style="color:#3498db;">${App.escapeHTML(aluno.nome)}</b> ${tempoTexto}.${txtFaltas}<br>
                                        Ainda restam <b>${parseFloat(horasFaltantes.toFixed(1))}h pendentes</b> (aprox. ${aulasRestantesEstimadas} aulas). Ao ritmo atual (${parseFloat(ritmoHorasMensal.toFixed(1))}h/mês), a conclusão será apenas em <b style="color:#e74c3c;">${dataProjStr}</b>.<br>
                                        <i>Sugerimos gerar parcelas adicionais!</i></div>`,
                                        acao: "App.renderizarTela('mensalidades')"
                                    });
                                }
                            }
                        }
                    });
                }
        
                if (Array.isArray(estoque)) {
                    estoque.forEach(item => {
                        const qtd = parseInt(item.quantidade) || 0;
                        const min = parseInt(item.quantidadeMinima) || 0;
                        if (qtd <= min) {
                            alertas.push({ 
                                icon: '📦', 
                                texto: `<b>Estoque Baixo:</b> Restam apenas ${qtd} unidades de <b>${App.escapeHTML(item.nome)}</b>!`,
                                acao: "App.renderizarLista('estoque')" 
                            });
                        }
                    });
                }
            }

            const badge = document.getElementById('noti-badge');
            const list = document.getElementById('noti-list');
            
            if (alertas.length > 0) {
                if (badge) { badge.innerText = alertas.length; badge.style.display = 'block'; }
                const btnMarcarLidas = alertas.length > 0
    ? `
        <div style="padding:8px; border-bottom:1px solid #eee;">
            <button
                onclick="App.marcarNotificacoesComoLidas()"
                style="
                    width:100%;
                    border:none;
                    background:#f4f6f7;
                    color:#2c3e50;
                    padding:10px;
                    border-radius:8px;
                    font-size:12px;
                    font-weight:bold;
                    cursor:pointer;
                    transition:0.2s;
                "
                onmouseover="this.style.background='#e5e7e9'"
                onmouseout="this.style.background='#f4f6f7'"
            >
                ✅ Marcar notificações como lidas
            </button>
        </div>
    `
    : '';
                
if (list) list.innerHTML = btnMarcarLidas + alertas.map(a => `
                    <div class="noti-item" style="cursor:pointer; transition:background 0.2s;" onmouseover="this.style.background='#f1f2f6'" onmouseout="this.style.background='transparent'" onclick="${a.acao}; App.toggleNotificacoes();">
                        <span class="noti-icon" style="font-size: 20px;">${a.icon}</span>
                        <div>${a.texto}</div>
                    </div>
                `).join('');
            } else {
                if (badge) badge.style.display = 'none';
                if (list) list.innerHTML = `<div class="noti-item" style="justify-content:center; color:#999; padding: 30px 15px;">Nenhum alerta pendente.<br>Tudo tranquilo! 🎉</div>`;
            }
        } catch (e) { console.error("Erro nas notificações", e); }
    },

    toggleNotificacoes: () => {
        const dropdown = document.getElementById('noti-dropdown');
        if (dropdown) dropdown.classList.toggle('active');
    },

   marcarNotificacoesComoLidas: async () => {
    try {
        const notificacoes = await App.api('/sistema/notificacoes/nao-lidas');

        if (!Array.isArray(notificacoes)) {
            return App.showToast("Não foi possível carregar notificações.", "error");
        }

        const naoLidas = notificacoes.filter(n => !n.lida);

        if (naoLidas.length === 0) {
            return App.showToast("Não há notificações novas.", "info");
        }

       await Promise.all(
            naoLidas.map(n =>
                App.api(`/sistema/notificacoes/lida/${n.id}`, 'PUT')
            )
        );

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

        if (typeof App.verificarNotificacoes === 'function') {
            await App.verificarNotificacoes();
        }
    };

    rodarRadar();
    App.radarAtivo = setInterval(rodarRadar, 10000);
}

});