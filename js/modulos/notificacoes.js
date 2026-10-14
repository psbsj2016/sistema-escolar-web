window.App = window.App || {};
const App = window.App;

// =========================================================
// MÓDULO NOTIFICAÇÕES - SININHO, RADAR E ALERTAS INTELIGENTES
// =========================================================

Object.assign(App, {

    // Lista em memória dos alertas gerados no ciclo atual
    alertasAtuaisLista: [],

    // 🧠 Obtém a chave de memória diária do utilizador (reseta automaticamente no dia seguinte)
    getChaveAlertasOcultosHoje: () => {
        const hoje = new Date();
        const dataStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
        const baseKey = typeof App.getTenantKey === 'function' ? App.getTenantKey('alertas_ocultos') : 'alertas_ocultos';
        return `${baseKey}_${dataStr}`;
    },

    // Lê do localStorage quais alertas o utilizador já fechou hoje (sobrevive ao F5)
    obterAlertasOcultos: () => {
        try {
            const salvos = JSON.parse(localStorage.getItem(App.getChaveAlertasOcultosHoje())) || [];
            return new Set(salvos);
        } catch (e) {
            return new Set();
        }
    },

    // Guarda no localStorage um ID de alerta que o utilizador fechou
    salvarAlertaOculto: (id) => {
        try {
            const ocultos = App.obterAlertasOcultos();
            ocultos.add(id);
            localStorage.setItem(App.getChaveAlertasOcultosHoje(), JSON.stringify([...ocultos]));
        } catch (e) {}
    },

    // Unifica a chamada que vem do app.js para evitar conflitos
    verificarNovidadesSilenciosamente: async () => {
        if (typeof App.verificarNotificacoes === 'function') {
            await App.verificarNotificacoes();
        }
    },

    // =========================================================
    // 📡 MOTOR PRINCIPAL DE VARREDURA DE NOTIFICAÇÕES
    // =========================================================
    verificarNotificacoes: async () => {
        if (!App.usuario) return;

        try {
            const tipoUtilizador = App.usuario.tipo || 'Gestor';
            const alertasOcultosHoje = App.obterAlertasOcultos();

            // 🚀 Busca todos os dados em paralelo e em MODO SILENCIOSO (true) para máxima velocidade
            const [
                notificacoesBanco,
                alunosRaw,
                eventos,
                financeiro,
                planejamentos,
                estoque,
                escola,
                cursos
            ] = await Promise.all([
                App.api('/sistema/notificacoes/nao-lidas', 'GET', null, true),
                App.api('/alunos', 'GET', null, true),
                App.api('/eventos', 'GET', null, true),
                tipoUtilizador !== 'Professor' ? App.api('/financeiro', 'GET', null, true) : Promise.resolve([]),
                App.api('/planejamentos', 'GET', null, true),
                App.api('/estoques', 'GET', null, true),
                App.api('/escola', 'GET', null, true),
                App.api('/cursos', 'GET', null, true)
            ]);

            let alunos = Array.isArray(alunosRaw) ? alunosRaw.filter(a => !a.status || a.status === 'Ativo') : [];

            // 🔄 Atualização automática da tabela se chegar matrícula nova enquanto o gestor vê a lista de alunos
            if (App.entidadeAtual === 'aluno' && Array.isArray(alunosRaw) && Array.isArray(App.listaCache)) {
                const idsAtuais = App.listaCache.map(a => a.id);
                const existeNovoAluno = alunosRaw.some(a => !idsAtuais.includes(a.id));

                if (existeNovoAluno) {
                    if (typeof App.showToast === 'function') App.showToast("🎉 Novo aluno recebido pela matrícula online!", "success");
                    App.listaCache = alunosRaw;
                    if (typeof App.filtrarTabelaReativa === 'function') App.filtrarTabelaReativa();
                }
            }

            let alertas = [];

            // Função auxiliar: Só adiciona à lista se não tiver sido fechado hoje pelo utilizador
            const adicionarAlertaInteligente = (alerta) => {
                if (!alertasOcultosHoje.has(String(alerta.id))) {
                    alertas.push(alerta);
                }
            };

            // 1. Notificações Oficiais da Base de Dados
            if (Array.isArray(notificacoesBanco)) {
                notificacoesBanco
                    .filter(n => !n.lida)
                    .sort((a, b) => new Date(b.dataCriacao || 0) - new Date(a.dataCriacao || 0))
                    .slice(0, 10)
                    .forEach(n => {
                        adicionarAlertaInteligente({
                            id: String(n.id),
                            oficial: true,
                            categoria: 'Sistema',
                            corCat: '#3b82f6',
                            icon: n.tipo === 'matricula_contrato' ? '📝' : '🔔',
                            texto: `<b>${App.escapeHTML(n.titulo || 'Nova notificação')}</b><br>${App.escapeHTML(n.mensagem || '')}`,
                            acao: "App.renderizarHubContratos()"
                        });
                    });
            }

            // Datas de referência (Hoje e Amanhã)
            const hoje = new Date();
            const ano = hoje.getFullYear();
            const mes = String(hoje.getMonth() + 1).padStart(2, '0');
            const dia = String(hoje.getDate()).padStart(2, '0');
            const hojeStr = `${ano}-${mes}-${dia}`;
            const hojeTime = hoje.getTime();
            
            const amanha = new Date(hoje);
            amanha.setDate(amanha.getDate() + 1);
            const amanhaStr = `${amanha.getFullYear()}-${String(amanha.getMonth() + 1).padStart(2, '0')}-${String(amanha.getDate()).padStart(2, '0')}`;

            // 2. Alertas de Vencimento do Plano do Sistema (Exclusivo Gestor)
            if (escola && !escola.error && tipoUtilizador === 'Gestor') {
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
                            id: 'alerta_plano_vence',
                            categoria: 'Assinatura',
                            corCat: '#f59e0b',
                            icon: '⏳', 
                            texto: `<b>Atenção Gestor:</b> O seu plano <b>${App.escapeHTML(planoAtual)}</b> expira em <b>${diasRestantes} dia(s)</b>! Renove agora.`, 
                            acao: "App.renderizarTela('plano')" 
                        });
                    } else if (diasRestantes <= 0) {
                        adicionarAlertaInteligente({ 
                            id: 'alerta_plano_venceu',
                            categoria: 'Urgente',
                            corCat: '#ef4444',
                            icon: '🚫', 
                            texto: `<b>Urgente:</b> O seu acesso <b>expirou</b>! Regularize para continuar a usar o sistema.`, 
                            acao: "App.renderizarTela('plano')" 
                        });
                    }
                }
            }

            // 3. Aniversários do Dia e Novas Matrículas
            alunos.forEach(a => {
                if (a.nascimento) {
                    const dataNasc = a.nascimento.includes('/') 
                        ? a.nascimento.split('/').reverse().join('-') 
                        : a.nascimento;
                    if (dataNasc.substring(5) === `${mes}-${dia}`) {
                        const acaoNiver = typeof App.abrirFichaAluno === 'function' 
                            ? `App.abrirFichaAluno('${a.id}')` 
                            : `App.renderizarLista('aluno')`;
                        adicionarAlertaInteligente({ 
                            id: `alerta_niver_${a.id}`,
                            categoria: 'Aniversário',
                            corCat: '#ec4899',
                            icon: '🎂', 
                            texto: `Hoje é o aniversário de <b>${App.escapeHTML(a.nome)}</b>! Clique para abrir a ficha.`,
                            acao: acaoNiver
                        });
                    }
                }
                if (a.dataMatricula && a.dataMatricula.startsWith(hojeStr)) {
                    adicionarAlertaInteligente({ 
                        id: `alerta_matr_${a.id}`,
                        categoria: 'Matrícula',
                        corCat: '#10b981',
                        icon: '🎉', 
                        texto: `<b>Nova Matrícula!</b> O aluno <b>${App.escapeHTML(a.nome)}</b> foi registado hoje.`,
                        acao: "App.renderizarHubContratos()" 
                    });
                }
            });

            // 4. Mensalidades que Vencem Hoje e Atrasadas
            if (tipoUtilizador !== 'Professor' && Array.isArray(financeiro)) {
                const vencemHoje = financeiro.filter(f => f.vencimento === hojeStr && f.status === 'Pendente');
                if (vencemHoje.length > 0) {
                    adicionarAlertaInteligente({ 
                        id: `alerta_caixa_${hojeStr}`,
                        categoria: 'Financeiro',
                        corCat: '#16a34a',
                        icon: '💲', 
                        texto: `<b>Caixa de Hoje:</b> Existem <b>${vencemHoje.length}</b> mensalidade(s) a vencer hoje.`,
                        acao: "App.renderizarTela('mensalidades')" 
                    });
                }
            }

            // 5. Eventos do Calendário Escolar (Hoje e Amanhã)
            if (Array.isArray(eventos)) {
                eventos.forEach(e => {
                    const tituloEvt = e.descricao || e.titulo || e.nome || 'Evento Escolar';
                    if (e.data === hojeStr) {
                        adicionarAlertaInteligente({ 
                            id: `alerta_evt_hoje_${e.id}`,
                            categoria: 'Agenda Hoje',
                            corCat: '#ef4444',
                            icon: '🚨', 
                            texto: `<b>Hoje (${App.escapeHTML(e.tipo || 'Agenda')}):</b> ${App.escapeHTML(tituloEvt)}`,
                            acao: "App.renderizarTela('calendario')" 
                        });
                    } else if (e.data === amanhaStr) {
                        adicionarAlertaInteligente({ 
                            id: `alerta_evt_amanha_${e.id}`,
                            categoria: 'Agenda Amanhã',
                            corCat: '#f59e0b',
                            icon: '📅', 
                            texto: `<b>Amanhã (${App.escapeHTML(e.tipo || 'Agenda')}):</b> ${App.escapeHTML(tituloEvt)}`,
                            acao: "App.renderizarTela('calendario')" 
                        });
                    }
                });
            }

            // 6. IA Preditiva de Faturação e Carga Horária
            if (tipoUtilizador !== 'Professor' && Array.isArray(financeiro) && Array.isArray(planejamentos)) {
                const trintaDiasAtras = new Date(hojeTime - 30 * 24 * 60 * 60 * 1000);
                const listaCursos = Array.isArray(cursos) ? cursos : [];

                alunos.forEach(aluno => {
                    const plano = planejamentos.find(p => p.idAluno === aluno.id && p.status !== 'Arquivado');
                    let dataUltimaMensalidade = null;
                    
                    financeiro.forEach(f => {
                        if (f.idAluno === aluno.id && f.status !== 'Cancelado' && (!f.idCarne || !f.idCarne.includes('VENDA'))) {
                            if (!dataUltimaMensalidade || f.vencimento > dataUltimaMensalidade) {
                                dataUltimaMensalidade = f.vencimento;
                            }
                        }
                    });

                    if (dataUltimaMensalidade && plano && Array.isArray(plano.aulas)) {
                        const dataUltima = new Date(dataUltimaMensalidade);
                        const diffDias = Math.ceil((dataUltima.getTime() - hojeTime) / (1000 * 3600 * 24));
                        
                        if (diffDias <= 30) {
                            const cursoInfo = listaCursos.find(c => c.id === aluno.cursoId || c.nome === aluno.planoCurso || c.nome === plano.curso);
                            const cargaHorariaTotal = cursoInfo && (cursoInfo.cargaHoraria || cursoInfo.carga) 
                                ? parseInt(cursoInfo.cargaHoraria || cursoInfo.carga) 
                                : (plano.aulas.length * 2);

                            let horasCumpridas = 0;
                            let aulasNoUltimoMes = 0;
                            let horasNoUltimoMes = 0;
                            let dataUltimaAulaLogada = hojeTime;

                            plano.aulas.forEach(aula => {
                                if (!aula.data) return;
                                const partesData = aula.data.includes('/') ? aula.data.split('/') : null;
                                let dataAulaObj = partesData ? new Date(`${partesData[2]}-${partesData[1]}-${partesData[0]}`) : new Date(aula.data);
                                if (isNaN(dataAulaObj.getTime())) dataAulaObj = new Date();
                                
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

                                let tempoTexto = diffDias < 0 ? `venceu há ${Math.abs(diffDias)} dias` : (diffDias === 0 ? `vence hoje` : `vence em ${diffDias} dias`);

                                adicionarAlertaInteligente({ 
                                    id: `alerta_preditiva_${aluno.id}`,
                                    categoria: 'IA Preditiva',
                                    corCat: '#8b5cf6',
                                    icon: '🎯', 
                                    texto: `<div style="line-height:1.45;"><b>Renovação de Carnê (${App.escapeHTML(aluno.nome)}):</b><br>
                                    Última parcela ${tempoTexto}. Faltam <b>${horasFaltantes}h</b> (~${aulasRestantesEstimadas} aulas). Previsão de término: <b style="color:#e74c3c;">${dataProjStr}</b>.</div>`,
                                    acao: "App.renderizarTela('mensalidades')"
                                });
                            }
                        }
                    }
                });
            }
    
            // 7. Alerta de Estoque Baixo
            if (Array.isArray(estoque)) {
                estoque.forEach(item => {
                    const qtd = parseInt(item.quantidade) || 0;
                    const min = parseInt(item.quantidadeMinima) || 0;
                    if (qtd <= min) {
                        adicionarAlertaInteligente({ 
                            id: `alerta_estoque_${item.id}`,
                            categoria: 'Estoque',
                            corCat: '#d97706',
                            icon: '📦', 
                            texto: `<b>Estoque Baixo:</b> Restam apenas <b>${qtd}</b> unid. de <b>${App.escapeHTML(item.nome)}</b>.`,
                            acao: "App.renderizarLista('estoque')" 
                        });
                    }
                });
            }

            // Guarda a lista atual para o botão "Limpar tudo" saber quais IDs dispensar
            App.alertasAtuaisLista = alertas;

            // ==========================================
            // 🎨 RENDERIZAÇÃO VISUAL NO DROPDOWN DO SININHO
            // ==========================================
            const badge = document.getElementById('noti-badge');
            const list = document.getElementById('noti-list');
            
            const barraTopoAcoes = `
                <div style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; display: flex; gap: 8px; background: #f8fafc;">
                    ${alertas.length > 0 ? `
                    <button onclick="App.marcarNotificacoesComoLidas(); event.stopPropagation();" style="flex: 1; border: 1px solid #cbd5e1; background: #ffffff; color: #1e293b; padding: 8px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#ffffff'">
                        ✅ Limpar Tudo (${alertas.length})
                    </button>` : ''}
                    <button onclick="App.testarPushNoAparelho(event)" style="flex: 1; border: none; background: #eff6ff; color: #2563eb; padding: 8px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='#eff6ff'" title="Enviar notificação de teste para este telemóvel/PC">
                        📲 Testar Push
                    </button>
                </div>`;

            if (alertas.length > 0) {
                if (badge) { badge.innerText = alertas.length; badge.style.display = 'flex'; }
                
                if (list) {
                    list.innerHTML = barraTopoAcoes + alertas.map(a => `
                        <div id="box-alerta-${a.id}" class="noti-item" style="cursor:pointer; transition:background 0.2s; display: flex; align-items: flex-start; gap: 12px; padding: 12px 15px; border-bottom: 1px solid #f1f5f9;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'" onclick="${a.acao}; App.toggleNotificacoes();">
                            <span class="noti-icon" style="font-size: 20px; margin-top: 2px;">${a.icon}</span>
                            <div style="flex: 1; min-width: 0; font-size: 13px; color: #334155;">
                                <span style="display:inline-block; background:${a.corCat || '#3b82f6'}18; color:${a.corCat || '#3b82f6'}; font-size:10px; font-weight:800; padding:2px 7px; border-radius:6px; text-transform:uppercase; margin-bottom:4px;">${a.categoria || 'Aviso'}</span>
                                <div>${a.texto}</div>
                            </div>
                            <button onclick="App.dispensarAlerta('${a.id}', event)" style="background:transparent; border:none; cursor:pointer; color:#94a3b8; padding:4px 6px; font-size:13px; border-radius:6px; transition:0.2s; align-self: flex-start;" onmouseover="this.style.color='#ef4444'; this.style.background='#fee2e2'" onmouseout="this.style.color='#94a3b8'; this.style.background='transparent'" title="Ocultar este aviso">✖</button>
                        </div>
                    `).join('');
                }
            } else {
                if (badge) badge.style.display = 'none';
                if (list) {
                    list.innerHTML = barraTopoAcoes + `
                        <div class="noti-item" style="justify-content:center; text-align:center; color:#94a3b8; padding: 35px 15px; flex-direction:column; gap:8px;">
                            <span style="font-size:28px;">🎉</span>
                            <span style="font-size:13px; font-weight:600; color:#475569;">Nenhum alerta pendente!</span>
                            <span style="font-size:11px;">Tudo em dia na sua instituição.</span>
                        </div>`;
                }
            }
        } catch (e) {
            console.error("Erro silencioso nas notificações:", e);
        }
    },

    // =========================================================
    // ✖️ DISPENSAR UM ALERTA INDIVIDUALMENTE (PERSISTENTE NO F5)
    // =========================================================
    dispensarAlerta: async (id, event) => {
        if (event) event.stopPropagation(); 

        // Guarda na memória persistente do dia (localStorage)
        App.salvarAlertaOculto(String(id));

        // Remove da lista em memória e da interface
        App.alertasAtuaisLista = (App.alertasAtuaisLista || []).filter(a => String(a.id) !== String(id));
        const itemVisual = document.getElementById(`box-alerta-${id}`);
        if (itemVisual) itemVisual.remove();

        // Atualiza o contador vermelho no sino
        const badge = document.getElementById('noti-badge');
        const qtdRestante = App.alertasAtuaisLista.length;

        if (badge) {
            if (qtdRestante > 0) {
                badge.innerText = qtdRestante;
            } else {
                badge.style.display = 'none';
                await App.verificarNotificacoes();
            }
        }

        // Se for uma notificação oficial do banco de dados, marca como lida no servidor
        if (!String(id).startsWith('alerta_')) {
            try {
                await App.api(`/sistema/notificacoes/lida/${id}`, 'PUT', null, true);
            } catch (e) {}
        }
    },

    toggleNotificacoes: () => {
        const dropdown = document.getElementById('noti-dropdown');
        if (dropdown) dropdown.classList.toggle('active');
    },

    // =========================================================
    // ✅ LIMPAR 100% DAS NOTIFICAÇÕES (BANCO + INTELIGENTES)
    // =========================================================
    marcarNotificacoesComoLidas: async () => {
        try {
            // 1. Oculta todos os alertas inteligentes visíveis hoje no localStorage
            if (Array.isArray(App.alertasAtuaisLista)) {
                App.alertasAtuaisLista.forEach(a => App.salvarAlertaOculto(String(a.id)));
            }

            // 2. Marca todas as notificações do banco como lidas em segundo plano
            const notificacoes = await App.api('/sistema/notificacoes/nao-lidas', 'GET', null, true);
            if (Array.isArray(notificacoes)) {
                const naoLidas = notificacoes.filter(n => !n.lida);
                if (naoLidas.length > 0) {
                    await Promise.all(naoLidas.map(n => App.api(`/sistema/notificacoes/lida/${n.id}`, 'PUT', null, true)));
                }
            }

            if (typeof App.showToast === 'function') App.showToast("Todos os alertas foram limpos! ✅", "success");
            await App.verificarNotificacoes();
        } catch (e) {
            if (typeof App.showToast === 'function') App.showToast("Erro ao limpar notificações.", "error");
        }
    },

    // =========================================================
    // 📲 TESTAR NOTIFICAÇÃO PUSH NO APARELHO ATUAL
    // =========================================================
    testarPushNoAparelho: async (event) => {
        if (event) event.stopPropagation();
        try {
            const res = await App.api('/push/teste', 'POST');
            if (res && res.success) {
                App.showToast("📲 Notificação Push enviada! Verifique o seu aparelho.", "success");
            } else if (res && res.error) {
                // Se o aparelho ainda não estiver inscrito, chama o ativador automaticamente
                if (typeof App.configurarNotificacoesPush === 'function') {
                    App.showToast("Ativando notificações neste aparelho...", "info");
                    App.configurarNotificacoesPush();
                }
            }
        } catch (e) {
            App.showToast("Não foi possível disparar o teste Push.", "error");
        }
    },

    iniciarRadar: () => {
        if (App.radarAtivo) clearInterval(App.radarAtivo);

        const rodarRadar = async () => {
            if (!App.usuario || document.visibilityState === 'hidden') return;
            if (typeof App.verificarNotificacoes === 'function') await App.verificarNotificacoes();
        };

        rodarRadar();
        App.radarAtivo = setInterval(rodarRadar, 15000);
    }

});