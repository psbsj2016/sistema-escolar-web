window.App = window.App || {};
const App = window.App;

// =========================================================
// MÓDULO NOTIFICAÇÕES - SININHO, RADAR E ALERTAS (COM IA PEDAGÓGICA)
// =========================================================

Object.assign(App, {

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
            const mes = String(hoje.getMonth() + 1).padStart(2, '0');
            const dia = String(hoje.getDate()).padStart(2, '0');
            const hojeStr = `${ano}-${mes}-${dia}`;
            
            const amanha = new Date(hoje);
            amanha.setDate(amanha.getDate() + 1);
            const amanhaStr = `${amanha.getFullYear()}-${String(amanha.getMonth() + 1).padStart(2, '0')}-${String(amanha.getDate()).padStart(2, '0')}`;

            if (escola && tipoUtilizador === 'Gestor') {
                const planoAtual = escola.plano || 'Teste';
                const hojeTime = hoje.getTime();
                
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
                    if (a.nascimento && a.nascimento.substring(5) === `${mes}-${dia}`) {
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

            if (Array.isArray(eventos)) {
                eventos.forEach(e => {
                    if (e.data === hojeStr) alertas.push({ 
                        icon: '🚨', 
                        texto: `<b>Hoje:</b> ${App.escapeHTML(e.tipo)} - ${App.escapeHTML(e.descricao)}`,
                        acao: "App.renderizarTela('calendario')" 
                    });
                    else if (e.data === amanhaStr) alertas.push({ 
                        icon: '⏳', 
                        texto: `<b>Amanhã:</b> ${App.escapeHTML(e.tipo)} - ${App.escapeHTML(e.descricao)}`,
                        acao: "App.renderizarTela('calendario')" 
                    });
                });
            }

            // ==========================================
            // 🤖 INTELIGÊNCIA FINANCEIRA / PEDAGÓGICA (FATURAÇÃO PERDIDA)
            // ==========================================
            if (tipoUtilizador !== 'Professor') {
                if (Array.isArray(financeiro) && Array.isArray(alunos) && Array.isArray(planejamentos)) {
                    
                    alunos.forEach(aluno => {
                        const plano = planejamentos.find(p => p.idAluno === aluno.id);
                        let dataUltimaMensalidade = null;
                        
                        // 1. Descobrir a data da ÚLTIMA parcela do aluno
                        financeiro.forEach(f => {
                            if (f.idAluno === aluno.id && f.status !== 'Cancelado' && (!f.idCarne || !f.idCarne.includes('VENDA'))) {
                                if (!dataUltimaMensalidade || f.vencimento > dataUltimaMensalidade) {
                                    dataUltimaMensalidade = f.vencimento;
                                }
                            }
                        });

                        // Se o aluno tem um histórico financeiro, iniciamos o cruzamento
                        if (dataUltimaMensalidade) {
                            
                            // A) Raio-X Financeiro
                            const dataUltima = new Date(dataUltimaMensalidade);
                            // Limpa a hora para calcular apenas os dias corretos
                            const dataHojeLimpa = new Date(hojeStr); 
                            
                            const diffTempo = dataUltima.getTime() - dataHojeLimpa.getTime();
                            const diffDias = Math.ceil(diffTempo / (1000 * 3600 * 24));
                            
                            // B) Raio-X Pedagógico
                            let aulasPendentes = 0;
                            if (plano && plano.aulas) {
                                // Conta quantas aulas faltam ministrar (ou que o aluno faltou e terá de repor)
                                aulasPendentes = plano.aulas.filter(a => !a.visto).length;
                            }

                            // C) O Match Inteligente: Se falta 1 mês ou menos para a última fatura, E ainda tem aulas para ter...
                            if (diffDias <= 30 && aulasPendentes > 0 && tipoUtilizador === 'Gestor') {
                                
                                let tempoTexto = '';
                                if (diffDias < 0) tempoTexto = `já venceu há ${Math.abs(diffDias)} dias`;
                                else if (diffDias === 0) tempoTexto = `vence hoje`;
                                else tempoTexto = `vence em ${diffDias} dias`;

                                alertas.push({ 
                                    icon: '⚠️', 
                                    texto: `<b>Faturação Perdida!</b> A última mensalidade de <b>${App.escapeHTML(aluno.nome)}</b> ${tempoTexto}, mas o aluno ainda tem <b>${aulasPendentes} aula(s) pendente(s)</b>. Considere gerar parcela extra!`,
                                    acao: "App.renderizarTela('mensalidades')"
                                });
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
                        <span class="noti-icon">${a.icon}</span>
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