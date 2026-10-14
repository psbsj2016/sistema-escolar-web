window.App = window.App || {};
const App = window.App;

// =========================================================
// MÓDULO NOTIFICAÇÕES - ETAPA 4: SOM SUAVE ("DING") E ANIMAÇÃO NO SININHO
// =========================================================

Object.assign(App, {

    // Lista em memória dos alertas gerados no ciclo atual e aba ativa
    alertasAtuaisLista: [],
    filtroNotificacaoAtual: 'todos',

    // Memória para saber quais alertas já existiam e só tocar som quando chegar algo NOVO
    idsAlertasJaConhecidos: new Set(),
    radarPrimeiraLeituraConcluida: false,

    // 🎨 Injeta o CSS que corrige a distância do sininho, cria as abas e a animação de abanar
    injetarEstilosNotificacoes: () => {
        if (document.getElementById('noti-modern-styles')) return;
        const style = document.createElement('style');
        style.id = 'noti-modern-styles';
        style.innerHTML = `
            /* Garante que o contentor do sininho é a âncora exata da caixa */
            .notification-container {
                position: relative !important;
            }

            /* Computadores e Tablets: Caixa colada exatamente abaixo do sininho */
            header.header-moderno .notification-container #noti-dropdown,
            #noti-dropdown.noti-dropdown {
                position: absolute !important;
                top: calc(100% + 10px) !important;
                right: 0 !important;
                left: auto !important;
                transform: none !important;
                width: 370px !important;
                max-width: calc(100vw - 32px) !important;
                min-width: 0 !important;
                margin: 0 !important;
                border-radius: 16px !important;
                border: 1px solid #cbd5e1 !important;
                background: #ffffff !important;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.18) !important;
                z-index: 9999 !important;
                overflow: hidden !important;
                box-sizing: border-box !important;
            }

            #noti-dropdown #noti-list {
                max-height: 65vh !important;
                overflow-y: auto !important;
                overflow-x: hidden !important;
            }

            /* Mini-abas de Filtro dentro do Sininho */
            .noti-tabs-bar {
                display: flex;
                gap: 4px;
                padding: 8px 10px;
                background: #f1f5f9;
                border-bottom: 1px solid #e2e8f0;
                overflow-x: auto;
                scrollbar-width: none;
            }
            .noti-tabs-bar::-webkit-scrollbar { display: none; }

            .noti-tab-btn {
                flex: 1;
                border: none;
                background: transparent;
                color: #64748b;
                padding: 6px 8px;
                border-radius: 8px;
                font-size: 11px;
                font-weight: 700;
                cursor: pointer;
                white-space: nowrap;
                transition: all 0.2s ease;
                text-align: center;
            }
            .noti-tab-btn:hover {
                background: rgba(255, 255, 255, 0.6);
                color: #1e293b;
            }
            .noti-tab-btn.active {
                background: #ffffff;
                color: #2563eb;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.06);
            }

            /* 🔔 Animação do Sininho a Abanar quando chega novidade */
            @keyframes sinoAbanar {
                0% { transform: rotate(0deg) scale(1); }
                15% { transform: rotate(18deg) scale(1.12); }
                30% { transform: rotate(-16deg) scale(1.12); }
                45% { transform: rotate(12deg) scale(1.08); }
                60% { transform: rotate(-10deg) scale(1.05); }
                75% { transform: rotate(6deg) scale(1.02); }
                100% { transform: rotate(0deg) scale(1); }
            }

            .sino-animando {
                animation: sinoAbanar 0.9s ease-in-out 2 !important;
                border-color: #3b82f6 !important;
                background: #eff6ff !important;
            }

            /* 📱 Telemóveis: Compensa os 50px do Avatar ao lado para nunca cortar na esquerda */
            @media (max-width: 600px) {
                header.header-moderno .notification-container #noti-dropdown,
                #noti-dropdown.noti-dropdown {
                    position: absolute !important;
                    top: calc(100% + 10px) !important;
                    right: -50px !important;
                    left: auto !important;
                    width: calc(100vw - 24px) !important;
                    max-width: 360px !important;
                }
            }
        `;
        document.head.appendChild(style);
    },

    // =========================================================
    // 🔊 MOTOR DE ÁUDIO SUAVE ("DING") E CONTROLO DE MUDO
    // =========================================================
    isSomNotificacaoAtivo: () => {
        const chave = typeof App.getTenantKey === 'function' ? App.getTenantKey('noti_som_ativo') : 'noti_som_ativo';
        const valor = localStorage.getItem(chave);
        return valor === null ? true : valor === 'true'; // Ativo por padrão
    },

    alternarSomNotificacoes: (event) => {
        if (event) event.stopPropagation();
        const chave = typeof App.getTenantKey === 'function' ? App.getTenantKey('noti_som_ativo') : 'noti_som_ativo';
        const novoEstado = !App.isSomNotificacaoAtivo();
        localStorage.setItem(chave, String(novoEstado));

        if (novoEstado) {
            App.tocarSomNotificacao(true); // Toca um som de demonstração ao ativar
            if (typeof App.showToast === 'function') App.showToast("🔔 Som de notificações ativado!", "success");
        } else {
            if (typeof App.showToast === 'function') App.showToast("🔕 Som de notificações silenciado.", "info");
        }
        App.renderizarPainelNotificacoes();
    },

    tocarSomNotificacao: (forcarTeste = false) => {
        if (!forcarTeste && !App.isSomNotificacaoAtivo()) return;

        try {
            // ⚙️ PARÂMETROS AJUSTÁVEIS DO SOM
            const VOLUME_SOM = 0.12;  // Volume suave (de 0.01 a 1.0)
            const NOTA_1_HZ = 587.33; // Nota Ré (D5)
            const NOTA_2_HZ = 880.00; // Nota Lá (A5 - toque cristalino)

            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;

            const ctx = new AudioCtx();
            const agora = ctx.currentTime;

            // Função interna para tocar cada nota do "Ding-Dong" suave
            const tocarNota = (frequencia, inicio, duracao) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(frequencia, inicio);

                gain.gain.setValueAtTime(0.0001, inicio);
                gain.gain.exponentialRampToValueAtTime(VOLUME_SOM, inicio + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(inicio);
                osc.stop(inicio + duracao);
            };

            tocarNota(NOTA_1_HZ, agora, 0.22);
            tocarNota(NOTA_2_HZ, agora + 0.14, 0.45);
        } catch (e) {
            // Ignora silenciosamente caso o navegador ainda não tenha recebido clique do utilizador
        }
    },

    animarSininhoTopo: () => {
        const btnSino = document.querySelector('.btn-bell-moderno');
        if (!btnSino) return;
        btnSino.classList.remove('sino-animando');
        void btnSino.offsetWidth; // Reinicia a animação CSS
        btnSino.classList.add('sino-animando');
        setTimeout(() => btnSino.classList.remove('sino-animando'), 2000);
    },

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

    // 🔄 Restaura todos os alertas que foram fechados no X durante o dia de hoje
    restaurarAlertasOcultosHoje: async (event) => {
        if (event) event.stopPropagation();
        localStorage.removeItem(App.getChaveAlertasOcultosHoje());
        App.filtroNotificacaoAtual = 'todos';
        if (typeof App.showToast === 'function') App.showToast("🔄 Alertas ocultos de hoje foram restaurados!", "info");
        await App.verificarNotificacoes();
    },

    // 🗂️ Troca de aba instantaneamente sem fechar o menu do sininho
    mudarAbaNotificacao: (novaAba, event) => {
        if (event) event.stopPropagation();
        App.filtroNotificacaoAtual = novaAba;
        App.renderizarPainelNotificacoes();
    },

    // Unifica a chamada que vem do app.js para evitar conflitos
    verificarNovidadesSilenciosamente: async () => {
        if (typeof App.verificarNotificacoes === 'function') {
            await App.verificarNotificacoes();
        }
    },

    // =========================================================
    // 💬 DISPARADOR DE WHATSAPP COM 1 CLIQUE NO SININHO
    // =========================================================
    abrirWhatsAppRapidoNotificacao: (telefoneBruto, tipoMensagem, nomeAluno, infoExtra, event) => {
        if (event) event.stopPropagation();

        if (typeof App.verificarPermissao === 'function' && !App.verificarPermissao('whatsapp')) {
            return;
        }

        let numeroLimpo = String(telefoneBruto || '').replace(/\D/g, '');
        if (!numeroLimpo || numeroLimpo.length < 8) {
            if (typeof App.showToast === 'function') {
                App.showToast("Este aluno não possui um número de WhatsApp válido cadastrado.", "warning");
            }
            return;
        }

        if (numeroLimpo.length === 10 || numeroLimpo.length === 11) {
            numeroLimpo = '55' + numeroLimpo;
        }

        let nomeEscola = 'nossa instituição';
        try {
            const perfilEscola = JSON.parse(localStorage.getItem(App.getTenantKey('escola_perfil'))) || {};
            if (perfilEscola.nome) nomeEscola = perfilEscola.nome;
        } catch (e) {}

        let texto = '';
        if (tipoMensagem === 'aniversario') {
            texto = `Olá, *${nomeAluno}*! 🎂🎉\n\nPassando em nome de toda a equipa da *${nomeEscola}* para lhe desejar um Feliz Aniversário! Muita saúde, alegria e sucesso nos seus estudos! 🚀✨`;
        } else if (tipoMensagem === 'renovacao') {
            texto = `Olá, *${nomeAluno}*! Tudo bem? 😊\n\nAqui é da *${nomeEscola}*. Notámos que o seu ciclo atual de parcelas está na reta final e ainda temos cerca de *${infoExtra}* de aulas pela frente para a conclusão do seu curso.\n\nPodemos programar a renovação do seu carnê para manter o seu horário garantido?`;
        } else if (tipoMensagem === 'acolhimento_faltas') {
            texto = `Olá, *${nomeAluno}*! Tudo bem consigo? 😊\n\nAqui é da *${nomeEscola}*. Sentimos a sua falta nas últimas *${infoExtra}* aulas! Está tudo bem? Conte connosco para o ajudar a manter o ritmo dos seus estudos! 📚✨`;
        }

        const urlWhatsApp = `https://wa.me/${numeroLimpo}?text=${encodeURIComponent(texto)}`;
        window.open(urlWhatsApp, '_blank');
    },

    // =========================================================
    // 📡 MOTOR PRINCIPAL DE VARREDURA DE NOTIFICAÇÕES
    // =========================================================
    verificarNotificacoes: async () => {
        if (!App.usuario) return;

        try {
            App.injetarEstilosNotificacoes();

            const tipoUtilizador = App.usuario.tipo || 'Gestor';
            const alertasOcultosHoje = App.obterAlertasOcultos();

            // Parâmetros ajustáveis do Radar Pedagógico
            const LIMITE_FALTAS_SEGUIDAS = 2;
            const AULAS_AVISO_CERTIFICADO = 2;
            const DIAS_ATRASO_CHAMADA = 7;

            // Busca todos os dados em paralelo e em MODO SILENCIOSO (true)
            const [
                notificacoesBanco,
                alunosRaw,
                eventos,
                financeiro,
                planejamentos,
                estoque,
                escola,
                cursos,
                chamadas
            ] = await Promise.all([
                App.api('/sistema/notificacoes/nao-lidas', 'GET', null, true),
                App.api('/alunos', 'GET', null, true),
                App.api('/eventos', 'GET', null, true),
                tipoUtilizador !== 'Professor' ? App.api('/financeiro', 'GET', null, true) : Promise.resolve([]),
                App.api('/planejamentos', 'GET', null, true),
                App.api('/estoques', 'GET', null, true),
                App.api('/escola', 'GET', null, true),
                App.api('/cursos', 'GET', null, true),
                App.api('/chamadas', 'GET', null, true)
            ]);

            let alunos = Array.isArray(alunosRaw) ? alunosRaw.filter(a => !a.status || a.status === 'Ativo') : [];

            // Atualização automática da tabela se chegar matrícula nova enquanto o gestor vê a lista de alunos
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
                            grupo: 'pedagogico',
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
                            grupo: 'urgente',
                            categoria: 'Assinatura',
                            corCat: '#f59e0b',
                            icon: '⏳', 
                            texto: `<b>Atenção Gestor:</b> O seu plano <b>${App.escapeHTML(planoAtual)}</b> expira em <b>${diasRestantes} dia(s)</b>! Renove agora.`, 
                            acao: "App.renderizarTela('plano')" 
                        });
                    } else if (diasRestantes <= 0) {
                        adicionarAlertaInteligente({ 
                            id: 'alerta_plano_venceu',
                            grupo: 'urgente',
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
                        
                        const nomeSeguro = App.escapeHTML(a.nome || '').replace(/'/g, "\\'");
                        const whatsSeguro = App.escapeHTML(a.whatsapp || '').replace(/'/g, "\\'");

                        const btnParabens = whatsSeguro ? `
                            <div style="margin-top: 8px;">
                                <button onclick="App.abrirWhatsAppRapidoNotificacao('${whatsSeguro}', 'aniversario', '${nomeSeguro}', '', event)" 
                                        style="background: #25D366; color: #ffffff; border: none; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 2px 5px rgba(37, 211, 102, 0.25); transition: 0.2s;"
                                        onmouseover="this.style.background='#1da851'" onmouseout="this.style.background='#25D366'">
                                    💬 Dar Parabéns no WhatsApp
                                </button>
                            </div>` : '';

                        adicionarAlertaInteligente({ 
                            id: `alerta_niver_${a.id}`,
                            grupo: 'pedagogico',
                            categoria: 'Aniversário',
                            corCat: '#ec4899',
                            icon: '🎂', 
                            texto: `Hoje é o aniversário de <b>${App.escapeHTML(a.nome)}</b>! Clique para ver a ficha.${btnParabens}`,
                            acao: acaoNiver
                        });
                    }
                }
                if (a.dataMatricula && a.dataMatricula.startsWith(hojeStr)) {
                    adicionarAlertaInteligente({ 
                        id: `alerta_matr_${a.id}`,
                        grupo: 'pedagogico',
                        categoria: 'Matrícula',
                        corCat: '#10b981',
                        icon: '🎉', 
                        texto: `<b>Nova Matrícula!</b> O aluno <b>${App.escapeHTML(a.nome)}</b> foi registado hoje.`,
                        acao: "App.renderizarHubContratos()" 
                    });
                }
            });

            // 4. Mensalidades que Vencem Hoje
            if (tipoUtilizador !== 'Professor' && Array.isArray(financeiro)) {
                const vencemHoje = financeiro.filter(f => f.vencimento === hojeStr && f.status === 'Pendente');
                if (vencemHoje.length > 0) {
                    const nomesVencemHoje = vencemHoje
                        .map(f => App.escapeHTML(f.alunoNome || 'Aluno'))
                        .slice(0, 3)
                        .join(', ');
                    const complementoNomes = vencemHoje.length > 3 ? ` e mais ${vencemHoje.length - 3}` : '';

                    adicionarAlertaInteligente({ 
                        id: `alerta_caixa_${hojeStr}`,
                        grupo: 'financeiro',
                        categoria: 'Financeiro',
                        corCat: '#16a34a',
                        icon: '💲', 
                        texto: `<b>Caixa de Hoje:</b> <b>${vencemHoje.length}</b> mensalidade(s) a vencer hoje (${nomesVencemHoje}${complementoNomes}).
                                <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap;">
                                    <button onclick="event.stopPropagation(); App.renderizarTela('mensalidades'); App.toggleNotificacoes();" style="background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; padding: 4px 9px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">💸 Receber no Caixa</button>
                                </div>`,
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
                            grupo: 'urgente',
                            categoria: 'Agenda Hoje',
                            corCat: '#ef4444',
                            icon: '🚨', 
                            texto: `<b>Hoje (${App.escapeHTML(e.tipo || 'Agenda')}):</b> ${App.escapeHTML(tituloEvt)}`,
                            acao: "App.renderizarTela('calendario')" 
                        });
                    } else if (e.data === amanhaStr) {
                        adicionarAlertaInteligente({ 
                            id: `alerta_evt_amanha_${e.id}`,
                            grupo: 'pedagogico',
                            categoria: 'Agenda Amanhã',
                            corCat: '#f59e0b',
                            icon: '📅', 
                            texto: `<b>Amanhã (${App.escapeHTML(e.tipo || 'Agenda')}):</b> ${App.escapeHTML(tituloEvt)}`,
                            acao: "App.renderizarTela('calendario')" 
                        });
                    }
                });
            }

            // 6. Radar Pedagógico Anti-Evasão (Faltas, Certificado e Chamada)
            const listaChamadas = Array.isArray(chamadas) ? chamadas : [];
            const listaPlanosAtivos = Array.isArray(planejamentos) ? planejamentos.filter(p => p.status !== 'Arquivado') : [];

            // 6.1 Alerta de Faltas Seguidas
            alunos.forEach(aluno => {
                const historicoAluno = listaChamadas
                    .filter(c => c.idAluno === aluno.id && c.data)
                    .sort((a, b) => new Date(b.data) - new Date(a.data));

                let faltasConsecutivas = 0;
                for (const registo of historicoAluno) {
                    if (registo.status === 'Falta') {
                        faltasConsecutivas++;
                    } else {
                        break;
                    }
                }

                if (faltasConsecutivas >= LIMITE_FALTAS_SEGUIDAS) {
                    const nomeSeguro = App.escapeHTML(aluno.nome || '').replace(/'/g, "\\'");
                    const whatsSeguro = App.escapeHTML(aluno.whatsapp || '').replace(/'/g, "\\'");

                    const btnWhatsFalta = whatsSeguro ? `
                        <button onclick="App.abrirWhatsAppRapidoNotificacao('${whatsSeguro}', 'acolhimento_faltas', '${nomeSeguro}', '${faltasConsecutivas}', event)" 
                                style="background: #25D366; color: #ffffff; border: none; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                            💬 Falar com Aluno
                        </button>` : '';

                    adicionarAlertaInteligente({
                        id: `alerta_evasao_${aluno.id}_${faltasConsecutivas}`,
                        grupo: 'urgente',
                        categoria: 'Anti-Evasão',
                        corCat: '#ef4444',
                        icon: '⚠️',
                        texto: `<div style="line-height:1.45;"><b>Risco de Evasão:</b> O aluno <b>${App.escapeHTML(aluno.nome)}</b> acumulou <b>${faltasConsecutivas} faltas seguidas</b>!
                                <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap;">
                                    ${btnWhatsFalta}
                                    <button onclick="event.stopPropagation(); App.abrirRelatorioFrequencia('${aluno.id}', '${nomeSeguro}'); App.toggleNotificacoes();" style="background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">⏱️ Ver Frequência</button>
                                </div></div>`,
                        acao: `App.abrirRelatorioFrequencia('${aluno.id}', '${nomeSeguro}')`
                    });
                }
            });

            // 6.2 Alerta de Reta Final de Curso (Certificado) e Chamada Pendente
            const limiteAtrasoTime = hojeTime - (DIAS_ATRASO_CHAMADA * 24 * 60 * 60 * 1000);

            listaPlanosAtivos.forEach(plano => {
                const alunoAtivo = alunos.find(a => a.id === plano.idAluno);
                if (!alunoAtivo || !Array.isArray(plano.aulas) || plano.aulas.length === 0) return;

                const totalAulas = plano.aulas.length;
                const aulasConcluidas = plano.aulas.filter(a => a.visto).length;
                const aulasRestantes = totalAulas - aulasConcluidas;

                if (totalAulas >= 4 && aulasConcluidas > 0 && aulasRestantes <= AULAS_AVISO_CERTIFICADO) {
                    const textoRestante = aulasRestantes === 0 
                        ? 'concluiu <b>100% das aulas</b> planeadas!' 
                        : `está a apenas <b>${aulasRestantes} aula(s)</b> de concluir o planeamento!`;

                    const btnCertificado = tipoUtilizador !== 'Professor' ? `
                        <button onclick="event.stopPropagation(); App.renderizarRelatorio('documentos'); App.toggleNotificacoes();" style="background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">🎓 Emitir Certificado</button>
                    ` : '';

                    adicionarAlertaInteligente({
                        id: `alerta_fimcurso_${plano.id}_${aulasRestantes}`,
                        grupo: 'pedagogico',
                        categoria: 'Pedagógico',
                        corCat: '#0ea5e9',
                        icon: '🎓',
                        texto: `<div style="line-height:1.45;"><b>Reta Final de Curso:</b> <b>${App.escapeHTML(alunoAtivo.nome)}</b> ${textoRestante}
                                <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap;">
                                    ${btnCertificado}
                                    <button onclick="event.stopPropagation(); App.renderizarTela('planejamento'); App.toggleNotificacoes();" style="background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">📋 Ver Plano</button>
                                </div></div>`,
                        acao: "App.renderizarTela('planejamento')"
                    });
                }

                let aulasSemVistoRecentes = 0;
                plano.aulas.forEach(aula => {
                    if (aula.visto || !aula.data) return;
                    const partes = aula.data.includes('/') ? aula.data.split('/') : null;
                    const dataIso = partes ? `${partes[2]}-${partes[1]}-${partes[0]}` : aula.data;
                    const dataAulaTime = new Date(dataIso + 'T00:00:00').getTime();

                    if (!isNaN(dataAulaTime) && dataAulaTime < hojeTime && dataAulaTime >= limiteAtrasoTime && dataIso !== hojeStr) {
                        aulasSemVistoRecentes++;
                    }
                });

                if (aulasSemVistoRecentes > 0) {
                    adicionarAlertaInteligente({
                        id: `alerta_semvisto_${plano.id}_${hojeStr}`,
                        grupo: 'pedagogico',
                        categoria: 'Diário de Classe',
                        corCat: '#f59e0b',
                        icon: '📋',
                        texto: `<div style="line-height:1.45;"><b>Aula Pendente de Visto:</b> <b>${App.escapeHTML(alunoAtivo.nome)}</b> possui <b>${aulasSemVistoRecentes} aula(s)</b> recente(s) sem registo de conclusão no planeamento.
                                <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap;">
                                    <button onclick="event.stopPropagation(); App.renderizarTela('planejamento'); App.toggleNotificacoes();" style="background: #fef3c7; color: #b45309; border: 1px solid #fde68a; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">📝 Atualizar Plano</button>
                                    <button onclick="event.stopPropagation(); App.renderizarTela('chamada'); App.toggleNotificacoes();" style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">📋 Ir à Chamada</button>
                                </div></div>`,
                        acao: "App.renderizarTela('planejamento')"
                    });
                }
            });

            // 7. IA Preditiva de Faturação e Carga Horária
            if (tipoUtilizador !== 'Professor' && Array.isArray(financeiro) && Array.isArray(planejamentos)) {
                const trintaDiasAtras = new Date(hojeTime - 30 * 24 * 60 * 60 * 1000);
                const listaCursos = Array.isArray(cursos) ? cursos : [];

                alunos.forEach(aluno => {
                    const plano = listaPlanosAtivos.find(p => p.idAluno === aluno.id);
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

                                const nomeSeguro = App.escapeHTML(aluno.nome || '').replace(/'/g, "\\'");
                                const whatsSeguro = App.escapeHTML(aluno.whatsapp || '').replace(/'/g, "\\'");

                                const btnRenovarWhats = whatsSeguro ? `
                                    <button onclick="App.abrirWhatsAppRapidoNotificacao('${whatsSeguro}', 'renovacao', '${nomeSeguro}', '${horasFaltantes}h', event)" 
                                            style="background: #25D366; color: #ffffff; border: none; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                                        💬 Avisar Aluno
                                    </button>` : '';

                                adicionarAlertaInteligente({ 
                                    id: `alerta_preditiva_${aluno.id}`,
                                    grupo: 'financeiro',
                                    categoria: 'IA Preditiva',
                                    corCat: '#8b5cf6',
                                    icon: '🎯', 
                                    texto: `<div style="line-height:1.45;"><b>Renovação de Carnê (${App.escapeHTML(aluno.nome)}):</b><br>
                                    Última parcela ${tempoTexto}. Faltam <b>${horasFaltantes}h</b> (~${aulasRestantesEstimadas} aulas). Previsão de término: <b style="color:#e74c3c;">${dataProjStr}</b>.
                                    <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap;">
                                        ${btnRenovarWhats}
                                        <button onclick="event.stopPropagation(); App.renderizarTela('mensalidades'); App.toggleNotificacoes();" style="background: #f3e8ff; color: #7e22ce; border: 1px solid #d8b4fe; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">💸 Gerar Novo Carnê</button>
                                    </div></div>`,
                                    acao: "App.renderizarTela('mensalidades')"
                                });
                            }
                        }
                    }
                });
            }
    
            // 8. Alerta de Estoque Baixo
            if (Array.isArray(estoque)) {
                estoque.forEach(item => {
                    const qtd = parseInt(item.quantidade) || 0;
                    const min = parseInt(item.quantidadeMinima) || 0;
                    if (qtd <= min) {
                        adicionarAlertaInteligente({ 
                            id: `alerta_estoque_${item.id}`,
                            grupo: 'urgente',
                            categoria: 'Estoque',
                            corCat: '#d97706',
                            icon: '📦', 
                            texto: `<b>Estoque Baixo:</b> Restam apenas <b>${qtd}</b> unid. de <b>${App.escapeHTML(item.nome)}</b>.`,
                            acao: "App.renderizarLista('estoque')" 
                        });
                    }
                });
            }

            // =========================================================================
            // 🔔 9. DETETOR DE NOVIDADES AO VIVO (DISPARA SOM E ANIMAÇÃO NO SININHO)
            // =========================================================================
            let chegouAlertaNovo = false;
            alertas.forEach(a => {
                const idStr = String(a.id);
                if (!App.idsAlertasJaConhecidos.has(idStr)) {
                    App.idsAlertasJaConhecidos.add(idStr);
                    if (App.radarPrimeiraLeituraConcluida) {
                        chegouAlertaNovo = true;
                    }
                }
            });

            if (!App.radarPrimeiraLeituraConcluida) {
                App.radarPrimeiraLeituraConcluida = true;
            } else if (chegouAlertaNovo) {
                App.tocarSomNotificacao(false);
                App.animarSininhoTopo();
            }

            // Guarda a lista atual e desenha o painel com as abas
            App.alertasAtuaisLista = alertas;
            App.renderizarPainelNotificacoes();

        } catch (e) {
            console.error("Erro silencioso nas notificações:", e);
        }
    },

    // =========================================================
    // 🎨 RENDERIZADOR VISUAL DO PAINEL (COM ABAS, SOM E RESTAURO)
    // =========================================================
    renderizarPainelNotificacoes: () => {
        const badge = document.getElementById('noti-badge');
        const list = document.getElementById('noti-list');
        const alertas = App.alertasAtuaisLista || [];
        const tipoUtilizador = (App.usuario && App.usuario.tipo) ? App.usuario.tipo : 'Gestor';
        const qtdOcultosHoje = App.obterAlertasOcultos().size;
        const somAtivo = App.isSomNotificacaoAtivo();

        // Atualiza a bolinha vermelha com o total geral de alertas ativos
        if (badge) {
            if (alertas.length > 0) {
                badge.innerText = alertas.length;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }

        if (!list) return;

        // Contadores por grupo para exibir nas mini-abas
        const qtdUrgentes = alertas.filter(a => a.grupo === 'urgente').length;
        const qtdFinanceiro = alertas.filter(a => a.grupo === 'financeiro').length;
        const qtdPedagogico = alertas.filter(a => a.grupo === 'pedagogico').length;

        const abaAtiva = App.filtroNotificacaoAtual || 'todos';
        const alertasFiltrados = abaAtiva === 'todos' 
            ? alertas 
            : alertas.filter(a => a.grupo === abaAtiva);

        // Barra de Mini-Abas de Filtro
        const abasHTML = `
            <div class="noti-tabs-bar" onclick="event.stopPropagation();">
                <button class="noti-tab-btn ${abaAtiva === 'todos' ? 'active' : ''}" onclick="App.mudarAbaNotificacao('todos', event)">
                    Todos (${alertas.length})
                </button>
                <button class="noti-tab-btn ${abaAtiva === 'urgente' ? 'active' : ''}" onclick="App.mudarAbaNotificacao('urgente', event)">
                    🚨 Urgentes (${qtdUrgentes})
                </button>
                ${tipoUtilizador !== 'Professor' ? `
                <button class="noti-tab-btn ${abaAtiva === 'financeiro' ? 'active' : ''}" onclick="App.mudarAbaNotificacao('financeiro', event)">
                    💰 Finanças (${qtdFinanceiro})
                </button>` : ''}
                <button class="noti-tab-btn ${abaAtiva === 'pedagogico' ? 'active' : ''}" onclick="App.mudarAbaNotificacao('pedagogico', event)">
                    🍎 Pedag. (${qtdPedagogico})
                </button>
            </div>
        `;

        // Barra de Ações Rápidas (Limpar Tudo, Ligar/Desligar Som e Testar Push)
        const barraTopoAcoes = `
            <div style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; display: flex; gap: 6px; background: #f8fafc; flex-wrap: wrap;" onclick="event.stopPropagation();">
                ${alertas.length > 0 ? `
                <button onclick="App.marcarNotificacoesComoLidas(); event.stopPropagation();" style="flex: 1; border: 1px solid #cbd5e1; background: #ffffff; color: #1e293b; padding: 7px 8px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#ffffff'">
                    ✅ Limpar
                </button>` : ''}
                <button onclick="App.alternarSomNotificacoes(event)" style="flex: 1; border: 1px solid ${somAtivo ? '#bbf7d0' : '#e2e8f0'}; background: ${somAtivo ? '#f0fdf4' : '#f1f5f9'}; color: ${somAtivo ? '#15803d' : '#64748b'}; padding: 7px 8px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; transition: 0.2s;" title="Ativar ou silenciar o toque sonoro de novas notificações">
                    ${somAtivo ? '🔔 Som: On' : '🔕 Mudo'}
                </button>
                <button onclick="App.testarPushNoAparelho(event)" style="flex: 1; border: none; background: #eff6ff; color: #2563eb; padding: 7px 8px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='#eff6ff'" title="Enviar notificação de teste para este telemóvel/PC">
                    📲 Push
                </button>
            </div>
        `;

        // Rodapé para Restaurar Alertas Fechados no Dia
        const rodapeRestaurar = qtdOcultosHoje > 0 ? `
            <div style="padding: 10px; text-align: center; background: #f8fafc; border-top: 1px solid #e2e8f0;" onclick="event.stopPropagation();">
                <button onclick="App.restaurarAlertasOcultosHoje(event)" style="background: transparent; border: 1px dashed #94a3b8; color: #475569; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; width: 100%; transition: 0.2s;" onmouseover="this.style.background='#e2e8f0'; this.style.color='#1e293b'" onmouseout="this.style.background='transparent'; this.style.color='#475569'">
                    🔄 Restaurar ${qtdOcultosHoje} alerta(s) oculto(s) hoje
                </button>
            </div>
        ` : '';

        if (alertasFiltrados.length > 0) {
            list.innerHTML = abasHTML + barraTopoAcoes + alertasFiltrados.map(a => `
                <div id="box-alerta-${a.id}" class="noti-item" style="cursor:pointer; transition:background 0.2s; display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; border-bottom: 1px solid #f1f5f9;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'" onclick="${a.acao}; App.toggleNotificacoes();">
                    <span class="noti-icon" style="font-size: 20px; margin-top: 2px;">${a.icon}</span>
                    <div style="flex: 1; min-width: 0; font-size: 13px; color: #334155;">
                        <span style="display:inline-block; background:${a.corCat || '#3b82f6'}18; color:${a.corCat || '#3b82f6'}; font-size:10px; font-weight:800; padding:2px 7px; border-radius:6px; text-transform:uppercase; margin-bottom:4px;">${a.categoria || 'Aviso'}</span>
                        <div>${a.texto}</div>
                    </div>
                    <button onclick="App.dispensarAlerta('${a.id}', event)" style="background:transparent; border:none; cursor:pointer; color:#94a3b8; padding:4px 6px; font-size:13px; border-radius:6px; transition:0.2s; align-self: flex-start;" onmouseover="this.style.color='#ef4444'; this.style.background='#fee2e2'" onmouseout="this.style.color='#94a3b8'; this.style.background='transparent'" title="Ocultar este aviso">✖</button>
                </div>
            `).join('') + rodapeRestaurar;
        } else {
            const msgVazia = abaAtiva === 'todos' 
                ? 'Nenhum alerta pendente!' 
                : 'Nenhum alerta nesta categoria!';
            list.innerHTML = abasHTML + barraTopoAcoes + `
                <div class="noti-item" style="justify-content:center; text-align:center; color:#94a3b8; padding: 30px 15px; flex-direction:column; gap:8px;">
                    <span style="font-size:26px;">🎉</span>
                    <span style="font-size:13px; font-weight:600; color:#475569;">${msgVazia}</span>
                    <span style="font-size:11px;">Tudo em dia por aqui.</span>
                </div>` + rodapeRestaurar;
        }
    },

    // =========================================================
    // ✖️ DISPENSAR UM ALERTA INDIVIDUALMENTE (PERSISTENTE NO F5)
    // =========================================================
    dispensarAlerta: async (id, event) => {
        if (event) event.stopPropagation(); 

        App.salvarAlertaOculto(String(id));

        App.alertasAtuaisLista = (App.alertasAtuaisLista || []).filter(a => String(a.id) !== String(id));
        App.renderizarPainelNotificacoes();

        if (!String(id).startsWith('alerta_')) {
            try {
                await App.api(`/sistema/notificacoes/lida/${id}`, 'PUT', null, true);
            } catch (e) {}
        }
    },

    toggleNotificacoes: () => {
        App.injetarEstilosNotificacoes();
        const dropdown = document.getElementById('noti-dropdown');
        if (dropdown) dropdown.classList.toggle('active');
    },

    // =========================================================
    // ✅ LIMPAR 100% DAS NOTIFICAÇÕES (BANCO + INTELIGENTES)
    // =========================================================
    marcarNotificacoesComoLidas: async () => {
        try {
            if (Array.isArray(App.alertasAtuaisLista)) {
                App.alertasAtuaisLista.forEach(a => App.salvarAlertaOculto(String(a.id)));
            }

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