// =========================================================
// SISTEMA ESCOLAR - APP.JS (V127 - DASHBOARD INTERATIVO)
// =========================================================

// ATENÇÃO: Quando publicar, altere esta URL para o endereço do seu servidor na nuvem
const API_URL = "https://sistema-escolar-api-k3o8.onrender.com"; 

// LISTA MESTRA DE FUNCIONALIDADES
const LISTA_FUNCIONALIDADES = [
    { id: 'novo_aluno', nome: 'Novo Aluno', icon: '👨‍🎓', acao: "App.abrirModalCadastro('aluno')" },
    { id: 'fin_carne', nome: 'Gerar Carnê', icon: '💸', acao: "App.renderizarTela('mensalidades')" },
    { id: 'ped_chamada', nome: 'Fazer Chamada', icon: '📋', acao: "App.renderizarTela('chamada')" },
    { id: 'ped_notas', nome: 'Lançar Nota', icon: '📝', acao: "App.renderizarTela('avaliacoes')" },
    { id: 'ped_plan', nome: 'Planejamento', icon: '📅', acao: "App.renderizarTela('planejamento')" },
    { id: 'ped_bol', nome: 'Boletins', icon: '🖨️', acao: "App.renderizarTela('boletins')" },
    { id: 'fin_inad', nome: 'Inadimplência', icon: '⚠️', acao: "App.renderizarTela('inadimplencia')" },
    { id: 'fin_rel', nome: 'Rel. Financeiro', icon: '📊', acao: "App.renderizarRelatorio('financeiro')" },
    { id: 'doc_ficha', nome: 'Ficha Matrícula', icon: '📄', acao: "App.renderizarRelatorio('ficha')" },
    { id: 'doc_dossie', nome: 'Dossiê Executivo', icon: '📁', acao: "App.renderizarRelatorio('dossie')" }
];

const App = {
    usuario: null,
    entidadeAtual: null,
    idEdicao: null,
    idEdicaoUsuario: null, 
    listaCache: [], 
    calendarState: { month: new Date().getMonth(), year: new Date().getFullYear() },

    // --- NÚCLEO DE COMUNICAÇÃO (API CENTRALIZADA E BLINDADA) ---
    api: async (endpoint, method = 'GET', body = null) => {
        const headers = { 'Content-Type': 'application/json' };
        
        // Em vez de enviar apenas o ID, enviamos o Token inviolável!
        const token = sessionStorage.getItem('token_acesso');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`; 
        }

        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);

        try {
            const response = await fetch(`${API_URL}${endpoint}`, options);
            if (!response.ok) {
                // Se o servidor recusar a pulseira (ex: expirou), forçamos o logout
                if (response.status === 401 || response.status === 403) {
                    App.logout();
                }
                throw new Error(`Erro API: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Erro conexão:", error);
            return method === 'GET' ? [] : null;
        }
    },

    // --- UTILS ---
    setTitulo: (texto) => { const el = document.getElementById('titulo-pagina'); if(el) el.innerText = texto; },
    
    toggleSub: (id) => { 
        document.querySelectorAll('.submenu').forEach(el => { if (el.id !== id) el.style.display = 'none'; });
        const el = document.getElementById(id); if (el) el.style.display = (el.style.display === 'block') ? 'none' : 'block';
    },

   fecharModal: () => {
        document.getElementById('modal-overlay').style.display = 'none';
        // Restaura o botão caso tenha sido alterado pela Venda
        const btn = document.querySelector('.btn-confirm');
        if(btn) {
            btn.setAttribute('onclick', 'App.salvarCadastro()');
            btn.innerText = "Salvar Registro";
        }
    },

    // --- 1. INICIALIZAÇÃO ---
    init: async () => {
        App.aplicarTemaSalvo();
        if (!localStorage.getItem('escola_atalhos')) {
            const padrao = ['novo_aluno','fin_carne','ped_chamada','ped_notas','ped_plan','ped_bol'];
            localStorage.setItem('escola_atalhos', JSON.stringify(padrao));
        }
        const salvo = sessionStorage.getItem('usuario_logado');
        if (salvo) { 
            App.usuario = JSON.parse(salvo); 
            App.entrarNoSistema(); 
        } else {
            document.getElementById('tela-login').style.display = 'flex';
            document.getElementById('tela-sistema').style.display = 'none';
        }
        const dataEl = document.getElementById('data-hoje');
        if(dataEl) dataEl.innerText = new Date().toLocaleDateString('pt-BR');
        App.setupMobileMenu();
        await App.carregarDadosEscola();

        // --- NOVO: LOGIN COM ENTER ---
        const passInput = document.getElementById('login-pass');
        if(passInput) {
            passInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    App.fazerLogin();
                }
            });
        }

        // --- GATILHO SECRETO DO PAINEL MASTER ---
        const tituloPortal = document.querySelector('.login-box h1');
        if (tituloPortal) {
            tituloPortal.style.cursor = 'pointer';
            tituloPortal.style.userSelect = 'none';
            tituloPortal.addEventListener('click', App.verificarCliqueMaster);
        }
    },

    // --- LÓGICA MOBILE ---
    setupMobileMenu: () => {
        const header = document.querySelector('header');
        if(header && !document.getElementById('btn-mobile-menu')) {
            const btn = document.createElement('button');
            btn.id = 'btn-mobile-menu';
            btn.className = 'mobile-menu-btn';
            btn.innerHTML = '☰';
            btn.onclick = () => {
                document.querySelector('.sidebar').classList.toggle('active');
                const overlay = document.querySelector('.mobile-overlay') || App.criarOverlay();
                overlay.classList.toggle('active');
            };
            header.insertBefore(btn, header.firstChild);
            App.criarOverlay();
        }
    },
    criarOverlay: () => {
        if(document.querySelector('.mobile-overlay')) return document.querySelector('.mobile-overlay');
        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        overlay.onclick = () => {
            document.querySelector('.sidebar').classList.remove('active');
            overlay.classList.remove('active');
        };
        document.body.appendChild(overlay);
        return overlay;
    },

    // --- TEMA E APARÊNCIA ---
    aplicarTemaSalvo: () => {
        const tema = JSON.parse(localStorage.getItem('escola_tema'));
        if (tema) {
            const root = document.documentElement;
            root.style.setProperty('--sidebar-bg', tema.sidebarBg);
            root.style.setProperty('--sidebar-text', tema.sidebarText);
            root.style.setProperty('--body-bg', tema.bodyBg);
            root.style.setProperty('--text-main', tema.textMain);
            root.style.setProperty('--card-bg', tema.cardBg);
            root.style.setProperty('--card-text', tema.cardText);
        }
    },

    UI: {
        card: (titulo, subtitulo, conteudo, maxWidth = '100%') => `
            <div class="card" style="max-width: ${maxWidth}; margin: 0 auto;">
                ${titulo ? `<h3 style="margin-top:0; color:var(--card-text); border-bottom:1px solid #eee; padding-bottom:10px;">${titulo}</h3>` : ''}
                ${subtitulo ? `<p style="color:#666; margin-bottom:20px; font-size:13px;">${subtitulo}</p>` : ''}
                ${conteudo}
            </div>
        `,
        input: (label, id, value = '', placeholder = '', tipo = 'text', extraAttr = '') => `
            <div class="input-group">
                <label>${label}</label>
                <input type="${tipo}" id="${id}" value="${value}" placeholder="${placeholder}" ${extraAttr}>
            </div>
        `,
        botao: (texto, acao, tipo = 'primary', icone = '') => {
            const btnClass = tipo === 'primary' ? 'btn-primary' : (tipo === 'cancel' ? 'btn-cancel' : 'btn-edit');
            return `<button class="${btnClass}" style="width: auto; padding: 10px 20px;" onclick="${acao}">${icone} ${texto}</button>`;
        },
        colorPicker: (label, valor, varCss) => `
            <div class="theme-row">
                <label>${label}</label>
                <input type="color" value="${valor}" oninput="App.previewCor('${varCss}', this.value)">
            </div>
        `
    },

    renderizarConfiguracoesAparencia: () => {
        App.setTitulo("Aparência do Sistema");
        const div = document.getElementById('app-content');
        const styles = getComputedStyle(document.documentElement);
        
        const c = {
            sbBg: styles.getPropertyValue('--sidebar-bg').trim(),
            sbTxt: styles.getPropertyValue('--sidebar-text').trim(),
            bdBg: styles.getPropertyValue('--body-bg').trim(),
            txtMain: styles.getPropertyValue('--text-main').trim(),
            cdBg: styles.getPropertyValue('--card-bg').trim(),
            cdTxt: styles.getPropertyValue('--card-text').trim()
        };
        const atalhosSalvos = JSON.parse(localStorage.getItem('escola_atalhos')) || [];

        const blocoCores = `
            <div class="theme-section">
                <h4 style="margin:0 0 15px 0;">1. Cores do Sistema</h4>
                <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:20px;">
                    <div>
                        <div style="font-weight:bold; margin-bottom:10px;">Menu Lateral</div>
                        ${App.UI.colorPicker('Fundo:', c.sbBg, '--sidebar-bg')}
                        ${App.UI.colorPicker('Texto:', c.sbTxt, '--sidebar-text')}
                    </div>
                    <div>
                        <div style="font-weight:bold; margin-bottom:10px;">Área Principal</div>
                        ${App.UI.colorPicker('Fundo:', c.bdBg, '--body-bg')}
                        ${App.UI.colorPicker('Texto:', c.txtMain, '--text-main')}
                    </div>
                    <div>
                        <div style="font-weight:bold; margin-bottom:10px;">Dashboard / Cards</div>
                        ${App.UI.colorPicker('Fundo:', c.cdBg, '--card-bg')}
                        ${App.UI.colorPicker('Texto:', c.cdTxt, '--card-text')}
                    </div>
                </div>
            </div>
        `;

        const blocoAtalhos = `
            <div class="theme-section">
                <h4 style="margin:0 0 5px 0;">2. Atalhos no Dashboard</h4>
                <p style="font-size:12px; color:#666; margin-bottom:15px;">Selecione os atalhos (Mínimo: 1 | Máximo: 8).</p>
                <div class="shortcut-selector">
                    ${LISTA_FUNCIONALIDADES.map(f => `
                        <label class="shortcut-item">
                            <input type="checkbox" class="sc-check" value="${f.id}" ${atalhosSalvos.includes(f.id) ? 'checked' : ''} onchange="App.validarLimiteAtalhos(this)"> 
                            ${f.icon} ${f.nome}
                        </label>
                    `).join('')}
                </div>
            </div>
        `;

        const blocoBotoes = `
            <div style="display:flex; gap:10px; margin-top: 15px;">
                ${App.UI.botao('SALVAR ALTERAÇÕES', 'App.salvarTema()', 'primary', '💾')}
                ${App.UI.botao('RESTAURAR PADRÃO', 'App.resetarTema()', 'cancel', '🔄')}
            </div>
        `;

        div.innerHTML = App.UI.card(
            '🎨 Personalizar Aparência', 
            'Personalize as cores e os atalhos da tela inicial.', 
            blocoCores + blocoAtalhos + blocoBotoes, 
            '800px'
        );
    },

    previewCor: (varName, color) => { document.documentElement.style.setProperty(varName, color); },
    validarLimiteAtalhos: (checkbox) => { const checked = document.querySelectorAll('.sc-check:checked'); if (checked.length > 8) { checkbox.checked = false; alert("O limite máximo é de 8 atalhos."); } },
    salvarTema: () => {
        const root = getComputedStyle(document.documentElement);
        const tema = { sidebarBg: root.getPropertyValue('--sidebar-bg').trim(), sidebarText: root.getPropertyValue('--sidebar-text').trim(), bodyBg: root.getPropertyValue('--body-bg').trim(), textMain: root.getPropertyValue('--text-main').trim(), cardBg: root.getPropertyValue('--card-bg').trim(), cardText: root.getPropertyValue('--card-text').trim() };
        const atalhos = Array.from(document.querySelectorAll('.sc-check:checked')).map(cb => cb.value);
        if(atalhos.length === 0) return alert("Selecione pelo menos 1 atalho.");
        if(atalhos.length > 8) return alert("Máximo de 8 atalhos permitidos.");
        localStorage.setItem('escola_tema', JSON.stringify(tema));
        localStorage.setItem('escola_atalhos', JSON.stringify(atalhos));
        alert("Configurações salvas com sucesso!");
        App.renderizarInicio();
    },
    resetarTema: () => { if(!confirm("Restaurar padrão?")) return; localStorage.removeItem('escola_tema'); localStorage.setItem('escola_atalhos', JSON.stringify(['novo_aluno','fin_carne','ped_chamada','ped_notas','ped_plan','ped_bol'])); location.reload(); },

    carregarDadosEscola: async () => { try { const escola = await App.api('/escola'); const logoTitle = document.querySelector('.logo-area h2'); if(logoTitle) logoTitle.innerHTML = `${escola.nome || 'Escola'}<br><small>${escola.cnpj || ''}</small>`; const logoContainer = document.querySelector('.logo-area'); let img = logoContainer.querySelector('img'); if(escola.foto && escola.foto.length > 50) { if(!img) { img = document.createElement('img'); img.style.cssText = "width:80px; height:80px; border-radius:50%; object-fit:cover; margin-bottom:10px; display:block; margin: 0 auto 10px auto; border: 3px solid rgba(255,255,255,0.2);"; logoContainer.insertBefore(img, logoContainer.firstChild); } img.src = escola.foto; } localStorage.setItem('escola_perfil', JSON.stringify(escola)); } catch(e) { console.log("Carregando perfil..."); } },
    otimizarImagem: (file, maxWidth, callback) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = (event) => { const img = new Image(); img.src = event.target.result; img.onload = () => { const canvas = document.createElement('canvas'); let width = img.width; let height = img.height; if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; } canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height); callback(canvas.toDataURL('image/jpeg', 0.7)); }; }; },
    
    // =========================================================
    // 2. DASHBOARD COM GRÁFICO, MÉTRICAS E WHATSAPP COBRANÇA
    // =========================================================
    renderizarInicio: async () => {
        App.setTitulo("Visão Geral");
        const div = document.getElementById('app-content'); 
        div.innerHTML = '<p style="padding:20px; text-align:center; color:#666;">Carregando painel de métricas...</p>';
        
        try {
            // 1. Busca todos os dados para o Dashboard
            const [alunos, financeiro, turmas, cursos] = await Promise.all([
                App.api('/alunos'), 
                App.api('/financeiro'),
                App.api('/turmas'),
                App.api('/cursos')
            ]);
            
            const listaAlunos = Array.isArray(alunos) ? alunos : [];
            const listaFin = Array.isArray(financeiro) ? financeiro : [];
            const listaTurmas = Array.isArray(turmas) ? turmas : [];
            const listaCursos = Array.isArray(cursos) ? cursos : [];
            
            // 2. Cálculos Financeiros (Mês Atual)
            const dataHoje = new Date(); 
            const mesAtual = dataHoje.getMonth() + 1; 
            const anoAtual = dataHoje.getFullYear();
            
            const financasMes = listaFin.filter(f => { 
                if(!f.vencimento) return false;
                const parts = f.vencimento.split('-'); 
                return parseInt(parts[1]) === mesAtual && parseInt(parts[0]) === anoAtual; 
            });
            
            const totalRecebido = financasMes.filter(f => f.status === 'Pago').reduce((acc, cur) => acc + parseFloat(cur.valor), 0);
            const totalPendente = financasMes.filter(f => f.status !== 'Pago').reduce((acc, cur) => acc + parseFloat(cur.valor), 0);

            // Filtra os inadimplentes (Antes de hoje e status Pendente) e ordena do mais antigo ao mais recente
            const inadimplentesList = listaFin.filter(f => f.status === 'Pendente' && new Date(f.vencimento + 'T00:00:00') < dataHoje).sort((a,b) => new Date(a.vencimento) - new Date(b.vencimento));
            
            const formatarMoeda = (valor) => valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            // 3. Monta Atalhos
            let idsAtalhos = JSON.parse(localStorage.getItem('escola_atalhos'));
            if (!idsAtalhos || !Array.isArray(idsAtalhos) || idsAtalhos.length === 0) {
                idsAtalhos = ['novo_aluno','fin_carne','ped_chamada','ped_notas','ped_plan','ped_bol'];
            }
            const htmlAtalhos = idsAtalhos.map(id => { 
                const func = LISTA_FUNCIONALIDADES.find(f => f.id === id); 
                return func ? `<div class="shortcut-btn" onclick="${func.acao}"><div>${func.icon}</div><span>${func.nome}</span></div>` : ''; 
            }).join('');

            // 4. HTML DO TERCEIRO CARD (Lista de Inadimplentes c/ Cobrança WhatsApp)
            const htmlInadimplentes = inadimplentesList.length === 0 
                ? '<div style="text-align:center; padding:20px; color:#27ae60; font-weight:bold; font-size:14px;">🎉 Excelente! Nenhum título em atraso.</div>' 
                : inadimplentesList.map(f => {
                    const alunoInfo = listaAlunos.find(a => a.id === f.idAluno) || {};
                    const zap = alunoInfo.whatsapp || '';
                    const dataBr = f.vencimento.split('-').reverse().join('/');
                    const valFmt = formatarMoeda(parseFloat(f.valor));
                    
                    return `
                        <div style="background:#fff; border:1px solid #f5b7b1; padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 4px rgba(0,0,0,0.02);">
                            <div>
                                <div style="font-size:13px; font-weight:bold; color:#333; margin-bottom:4px;">${f.alunoNome || 'Desconhecido'}</div>
                                <div style="font-size:11px; color:#c0392b; font-weight:600;">Venc: ${dataBr} • R$ ${valFmt}</div>
                            </div>
                            <button onclick="App.cobrarWhatsAppDashboard('${f.alunoNome}', '${zap}', '${dataBr}', '${valFmt}')" style="background:#25D366; color:white; border:none; padding:8px 12px; border-radius:6px; font-size:11px; cursor:pointer; font-weight:bold; white-space:nowrap; box-shadow:0 2px 4px rgba(37,211,102,0.3); display:flex; align-items:center; gap:5px; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"><span>💬</span> Cobrar</button>
                        </div>
                    `;
                }).join('');

            // 5. Renderiza a Tela Principal
            div.innerHTML = `
                <h3 style="opacity:0.7; margin-top:0; margin-bottom:20px;">Olá, ${App.usuario ? App.usuario.nome : 'Gestor'}! 👋</h3>
                
                <div class="dashboard-grid">
                    
                    <div class="stat-card card-blue" style="display:flex; flex-direction:column; align-items:flex-start; justify-content:center; gap:15px; padding:20px;">
                        <div style="width:100%; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:10px;">
                            <div style="display:flex; align-items:center; gap:10px;">
                                <span style="font-size:24px;">🎓</span>
                                <span style="font-size:14px; font-weight:600; color:#555; text-transform:uppercase;">Total Alunos</span>
                            </div>
                            <span style="font-size:20px; font-weight:bold; color:#3498db;">${listaAlunos.length}</span>
                        </div>
                        <div style="width:100%; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:10px;">
                            <div style="display:flex; align-items:center; gap:10px;">
                                <span style="font-size:24px;">🏫</span>
                                <span style="font-size:14px; font-weight:600; color:#555; text-transform:uppercase;">Total Turmas</span>
                            </div>
                            <span style="font-size:20px; font-weight:bold; color:#3498db;">${listaTurmas.length}</span>
                        </div>
                        <div style="width:100%; display:flex; justify-content:space-between; align-items:center;">
                            <div style="display:flex; align-items:center; gap:10px;">
                                <span style="font-size:24px;">📚</span>
                                <span style="font-size:14px; font-weight:600; color:#555; text-transform:uppercase;">Total Cursos</span>
                            </div>
                            <span style="font-size:20px; font-weight:bold; color:#3498db;">${listaCursos.length}</span>
                        </div>
                    </div>
                    
                    <div class="stat-card card-green" style="display:block; position:relative;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                            <div class="stat-info">
                                <h4>Receita (${mesAtual}/${anoAtual})</h4>
                                <p style="color:#27ae60; font-size:20px;">R$ ${formatarMoeda(totalRecebido)}</p>
                            </div>
                            <div class="stat-icon" style="font-size:24px;">💰</div>
                        </div>
                        <div style="height:140px; width:100%; display:flex; justify-content:center; align-items:center;">
                            <canvas id="graficoFinanceiro"></canvas>
                        </div>
                        <div style="text-align:center; font-size:11px; color:#666; margin-top:10px; border-top:1px solid #eee; padding-top:5px;">
                            Pendente no mês: <span style="color:#e74c3c; font-weight:bold;">R$ ${formatarMoeda(totalPendente)}</span>
                        </div>
                    </div>

                    <div class="stat-card card-red" style="display:flex; flex-direction:column; align-items:stretch; padding:15px; max-height:260px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid #fdedec; padding-bottom:8px;">
                            <h4 style="margin:0; font-size:14px; color:#e74c3c; text-transform:uppercase; font-weight:bold;">⚠️ Títulos em Atraso (${inadimplentesList.length})</h4>
                        </div>
                        <div style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:10px; padding-right:5px;">
                            ${htmlInadimplentes}
                        </div>
                    </div>

                </div>

                <h3 style="color:var(--card-text); font-size:16px; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">Acesso Rápido</h3>
                <div class="shortcuts-grid">${htmlAtalhos || '<p style="color:#666;">Nenhum atalho selecionado.</p>'}</div>`;

            // 6. Inicializa o Gráfico (Chart.js)
            const ctx = document.getElementById('graficoFinanceiro');
            if(ctx && (totalRecebido > 0 || totalPendente > 0)) {
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Recebido', 'Pendente'],
                        datasets: [{ data: [totalRecebido, totalPendente], backgroundColor: ['#27ae60', '#e74c3c'], borderWidth: 0, hoverOffset: 4 }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(context) { return ' R$ ' + formatarMoeda(context.raw); } } } }, cutout: '75%' }
                });
            } else if (ctx) {
                new Chart(ctx, {
                    type: 'doughnut',
                    data: { datasets: [{ data: [1], backgroundColor: ['#eee'], borderWidth: 0 }] },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, cutout: '75%' }
                });
            }

        } catch(e) { 
            console.error(e); 
            div.innerHTML = "<p>Erro ao carregar dashboard.</p>"; 
        }
    },

    // FUNÇÃO EXCLUSIVA DE COBRANÇA PARA O DASHBOARD (COM MENSAGEM PERSONALIZADA PTT CURSOS)
    cobrarWhatsAppDashboard: (nomeAluno, telefone, dataVencimento, valorFmt) => {
        if (!telefone || telefone.trim() === '' || telefone === 'undefined') {
            App.showToast("Este aluno não tem um número de WhatsApp registado no sistema!", "error");
            return;
        }
        
        let numero = telefone.replace(/\D/g, '');
        if (numero.length === 10 || numero.length === 11) numero = '55' + numero;
        
        // Mensagem Exata e Estruturada
        const msg = `🔔 LEMBRETE\nHello! Are you ok?\n\nVenceu em ${dataVencimento} a mensalidade do seu curso de inglês. Para realizar o pagamento, basta enviar o valor de R$ ${valorFmt} para o PIX CELULAR abaixo:\n\n(73) 98890-9273\nPTT CURSOS\nPaulo Sérgio Bispo Santana Júnior\nCORA\n\nObs.: Após o pagamento, por favor, enviar o comprovante para baixa no sistema.\n\n🙏 Agradeço desde já e desejo a você uma excelente dia! 😉✅`;
        
        window.open(`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`, '_blank');
    },

     // --- SISTEMA DE NOTIFICAÇÃO ---
    showToast: (mensagem, tipo = 'info') => {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${tipo}`;
        
        const icon = tipo === 'success' ? '✅' : (tipo === 'error' ? '❌' : 'ℹ️');
        toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${mensagem}</span>`;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.5s ease forwards';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },

   // --- ROTEAMENTO ---
    renderizarTela: async (tela) => {
        if (!App.usuario && tela !== 'login') {
            App.showToast("Sessão expirada. Faça login novamente.", "error");
            App.logout();
            return;
        }

        if(document.querySelector('.sidebar')) document.querySelector('.sidebar').classList.remove('active');
        if(document.querySelector('.mobile-overlay')) document.querySelector('.mobile-overlay').classList.remove('active');

        if (tela === 'chamada') { App.setTitulo("Chamada"); App.renderizarChamadaPro(); }
        else if (tela === 'avaliacoes') { App.setTitulo("Notas"); App.renderizarAvaliacoesPro(); }
        else if (tela === 'calendario') { App.setTitulo("Calendário"); App.renderizarCalendarioPro(); }
        else if (tela === 'planejamento') { App.setTitulo("Planejamento"); App.renderizarPlanejamentoPro(); }
        else if (tela === 'boletins') { App.setTitulo("Boletim"); App.renderizarBoletimVisual(); }
        else if (tela === 'mensalidades') { App.setTitulo("Financeiro"); App.renderizarFinanceiroPro(); }
        else if (tela === 'inadimplencia') { App.setTitulo("Inadimplência"); App.renderizarInadimplencia(); } 
        else if (tela === 'configuracoes') { App.setTitulo("Configurações"); App.renderizarConfiguracoes(); }
        else if (tela === 'aparencia') { App.renderizarConfiguracoesAparencia(); } 
        else if (tela === 'backup') { App.renderizarBackup(); }
        else { App.renderizarInicio(); }
    },
    renderizarConfig: (t) => { if(t==='perfil') App.renderizarTela('configuracoes'); else if(t==='aparencia') App.renderizarTela('aparencia'); else if(t==='conta') App.renderizarMinhaConta(); else if(t==='backup') App.renderizarTela('backup'); },
    renderizarRelatorio: (t) => { if (typeof App.renderizarRelatorioModulo === 'function') App.renderizarRelatorioModulo(t); },
    
    abrirModalCadastro: (tipo, id) => {
        if (typeof App.abrirModalCadastroModulo === 'function') {
            App.abrirModalCadastroModulo(tipo, id);
        } else {
            console.error("Erro: O módulo cadastros.js não foi carregado corretamente.");
            alert("O módulo de cadastros ainda não foi carregado. Tente recarregar a página.");
        }
    },

    // --- MÓDULO DE VENDAS ---
    abrirModalVenda: (idAluno, nomeAluno) => {
        const modal = document.getElementById('modal-overlay');
        if(modal) modal.style.display = 'flex';
        
        document.getElementById('modal-titulo').innerText = `Registrar Venda - ${nomeAluno}`;
        
        const hoje = new Date().toISOString().split('T')[0];
        
        const html = `
            <div style="background:#f4f6f7; padding:15px; border-radius:8px; margin-bottom:15px; border-left:4px solid #27ae60;">
                <h4 style="margin:0 0 10px 0; color:#2c3e50;">🛒 Detalhes da Compra</h4>
                <div class="input-group">
                    <label>Item / Serviço Comprado</label>
                    <input id="v-item" placeholder="Ex: Uniforme M, Livro de Matemática, etc.">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="input-group">
                        <label>Valor (R$)</label>
                        <input type="number" id="v-valor" step="0.01" placeholder="0.00">
                    </div>
                    <div class="input-group">
                        <label>Data da Venda</label>
                        <input type="date" id="v-data" value="${hoje}">
                    </div>
                </div>
                <div class="input-group">
                    <label>Forma de Pagamento</label>
                    <select id="v-forma" style="font-weight:bold;">
                        <option value="PIX">PIX</option>
                        <option value="Cartão de Crédito">💳 Cartão de Crédito</option>
                        <option value="Cartão de Débito">💳 Cartão de Débito</option>
                        <option value="Dinheiro">💵 Dinheiro</option>
                        <option value="Pendente (Fiado)">⚠️ Deixar Pendente (Fiado)</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>Descrição / Observação Adicional</label>
                    <textarea id="v-desc" rows="2" placeholder="Detalhes opcionais..."></textarea>
                </div>
                <input type="hidden" id="v-idaluno" value="${idAluno}">
                <input type="hidden" id="v-nomealuno" value="${nomeAluno}">
            </div>
        `;
        
        document.getElementById('modal-form-content').innerHTML = html;
        
        const btnConfirm = document.querySelector('.btn-confirm');
        btnConfirm.setAttribute('onclick', 'App.salvarVenda()');
        btnConfirm.innerText = "Registrar Venda";
    },

    salvarVenda: async () => {
        const idAluno = document.getElementById('v-idaluno').value;
        const alunoNome = document.getElementById('v-nomealuno').value;
        const item = document.getElementById('v-item').value;
        const valor = document.getElementById('v-valor').value;
        const data = document.getElementById('v-data').value;
        const forma = document.getElementById('v-forma').value;
        const obs = document.getElementById('v-desc').value;

        if(!item || !valor || !data) {
            App.showToast("Preencha o item, valor e data.", "error");
            return;
        }

        const status = forma === 'Pendente (Fiado)' ? 'Pendente' : 'Pago';
        const descricaoFinal = `Venda: ${item} | Pagto: ${forma} ${obs ? ' | Obs: '+obs : ''}`;

        const payload = {
            id: Date.now().toString(),
            idCarne: `VENDA_${Date.now()}`,
            idAluno: idAluno,
            alunoNome: alunoNome,
            valor: valor,
            vencimento: data,
            status: status,
            descricao: descricaoFinal,
            tipo: 'Receita',
            dataGeracao: new Date().toLocaleDateString('pt-BR')
        };

        const btn = document.querySelector('.btn-confirm');
        const txtOriginal = btn ? btn.innerText : 'Registrar Venda';
        if(btn) { btn.innerText = "Registrando... ⏳"; btn.disabled = true; }
        document.body.style.cursor = 'wait';

        try {
            await App.api('/financeiro', 'POST', payload);
            App.showToast("Venda registrada com sucesso!", "success");
            App.fecharModal();
        } catch (e) {
            App.showToast("Erro ao registrar venda.", "error");
        } finally { 
            if(btn) { btn.innerText = txtOriginal; btn.disabled = false; } 
            document.body.style.cursor = 'default'; 
        }
    },

    // --- 4. LISTAS ---
    renderizarLista: async (tipo) => {
        if (!App.usuario) {
            App.logout();
            return;
        }

        App.entidadeAtual = tipo;
        const titulo = tipo.charAt(0).toUpperCase() + tipo.slice(1) + 's';
        App.setTitulo(`Gerenciar ${titulo}`);
        const div = document.getElementById('app-content');
        const endpoint = tipo === 'financeiro' ? 'financeiro' : tipo + 's';

        try {
            App.listaCache = await App.api(`/${endpoint}`);
            
            const acaoNovo = tipo === 'financeiro' ? "App.renderizarTela('mensalidades')" : `App.abrirModalCadastro('${tipo}')`;

            const barraBusca = `
                <div class="toolbar" style="max-width: 800px; margin: 0 auto; display: flex; gap: 15px; text-align: left;">
                    <div class="search-wrapper" style="flex: 1; position: relative;">
                        <span class="search-icon" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #aaa;">🔍</span>
                        <input type="text" id="input-busca" class="search-input-modern" style="width: 100%; padding: 14px 14px 14px 45px; border-radius: 8px; border: 2px solid #eee;" placeholder="Pesquisar..." oninput="App.filtrarTabelaReativa()">
                    </div>
                    <button class="btn-new-modern" onclick="${acaoNovo}"><span>＋</span> NOVO REGISTRO</button>
                </div>
            `;

            div.innerHTML = `
                <div style="text-align:center; margin-bottom:30px;">
                    ${App.UI.card(`Consultar ${titulo}`, 'Utilize o campo abaixo para localizar registros.', barraBusca, '100%')}
                </div>
                <div id="container-tabela"></div>
            `;
            App.filtrarTabelaReativa();
        } catch(e) { div.innerHTML = "Erro ao carregar lista."; }
    },

    filtrarTabelaReativa: () => {
        const termo = document.getElementById('input-busca').value.trim().toLowerCase();
        const container = document.getElementById('container-tabela');
        if (!Array.isArray(App.listaCache)) { container.innerHTML = ''; return; }
        
        const filtrados = termo.length === 0 ? App.listaCache : App.listaCache.filter(item => {
            const nome = (item.nome || item.alunoNome || item.descricao || "").toLowerCase();
            return nome.includes(termo);
        });
        
        container.innerHTML = `<div class="card" style="animation: fadeIn 0.3s ease; padding:0; overflow:hidden;">${App.gerarTabelaHTML(filtrados)}</div>`;
    },

    gerarTabelaHTML: (dados) => {
        if (!dados.length) return '<p style="text-align:center; padding:30px; color:#666;">Nenhum registro encontrado.</p>';

        const tipo = App.entidadeAtual;
        
        const TB = {
            estrutura: (cabecalho, corpo) => `<div class="table-responsive-wrapper"><table style="width:100%; border-collapse:collapse;"><thead><tr>${cabecalho}</tr></thead><tbody>${corpo}</tbody></table></div>`,
            th: (texto, align = 'left') => `<th style="text-align:${align}; padding:15px; background:#f8f9fa; border-bottom:2px solid #eee; color:#2c3e50;">${texto}</th>`,
            td: (texto, align = 'left') => `<td style="text-align:${align}; padding:15px; border-bottom:1px solid #eee; color:#333;">${texto}</td>`,
            tr: (celulas) => `<tr style="transition: background 0.2s;">${celulas}</tr>`,
            acoes: (botoes) => `<div style="display:flex; gap:5px; justify-content:flex-end; align-items:center;">${botoes.join('')}</div>`,
            btn: (icone, cor, acao, title) => `<button class="btn-edit" style="background:${cor}; border:none; color:white; padding:6px 10px; border-radius:4px; cursor:pointer;" onclick="${acao}" title="${title}">${icone}</button>`
        };

        let cabecalho = '';
        if (tipo === 'aluno')      cabecalho = TB.th('Nome') + TB.th('Turma') + TB.th('WhatsApp') + TB.th('Ações', 'right');
        if (tipo === 'turma')      cabecalho = TB.th('Turma') + TB.th('Dia') + TB.th('Horário') + TB.th('Curso') + TB.th('Ações', 'right');
        if (tipo === 'curso')      cabecalho = TB.th('Curso') + TB.th('Carga') + TB.th('Ações', 'right');
        if (tipo === 'financeiro') cabecalho = TB.th('Ref (Aluno)') + TB.th('Descrição') + TB.th('Vencimento') + TB.th('Valor') + TB.th('Status') + TB.th('Ações', 'right');

        const corpo = dados.map(item => {
            let celulas = '';
            
            if (tipo === 'aluno') {
                celulas += TB.td(item.nome) + TB.td(item.turma || '-') + TB.td(item.whatsapp || '-');
            } 
            else if (tipo === 'turma') {
                celulas += TB.td(item.nome) + TB.td(item.dia || '-') + TB.td(item.horario || '-') + TB.td(item.curso || '-');
            } 
            else if (tipo === 'curso') {
                celulas += TB.td(item.nome) + TB.td(item.carga || '-');
            } 
            else if (tipo === 'financeiro') {
                const dataBr = item.vencimento ? item.vencimento.split('-').reverse().join('/') : '-';
                const valorFmt = `R$ ${parseFloat(item.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
                const statusFmt = `<span style="color:${item.status === 'Pago' ? '#27ae60' : '#e74c3c'}; font-weight:bold; background:${item.status === 'Pago' ? '#eafaf1' : '#fdedec'}; padding:4px 8px; border-radius:4px; font-size:12px;">${item.status}</span>`;
                celulas += TB.td(item.alunoNome || 'Sem Nome') + TB.td(item.descricao) + TB.td(dataBr) + TB.td(valorFmt) + TB.td(statusFmt);
            }

            const epExcluir = tipo === 'financeiro' ? 'financeiro' : tipo + 's';
            const acaoEdit = tipo === 'financeiro' ? `App.renderizarTela('mensalidades')` : `App.abrirModalCadastro('${tipo}', '${item.id}')`;
            const nomeSeguro = (item.nome || '').replace(/'/g, "\\'"); 
            
            let botoes = [];
            if (tipo === 'aluno') botoes.push(TB.btn('🛒', '#27ae60', `App.abrirModalVenda('${item.id}', '${nomeSeguro}')`, 'Registrar Venda'));
            if (tipo === 'financeiro') botoes.push(TB.btn('💬', '#25D366', `App.enviarWhatsApp('${item.id}')`, 'Avisar por WhatsApp'));
            
            botoes.push(TB.btn('✏️', '#f39c12', acaoEdit, 'Editar'));
            botoes.push(TB.btn('🗑️', '#e74c3c', `App.excluir('${epExcluir}', '${item.id}')`, 'Excluir'));

            celulas += TB.td(TB.acoes(botoes), 'right');
            return TB.tr(celulas);
        }).join('');

        return TB.estrutura(cabecalho, corpo);
    },

 // --- 5. MINHA CONTA ---
    renderizarMinhaConta: async () => { 
        App.setTitulo("Gestão de Usuários"); 
        const div = document.getElementById('app-content'); 
        App.idEdicaoUsuario = null; 

        const meuLogin = App.usuario ? App.usuario.login : '';
        const meuEmail = (App.usuario && App.usuario.email) ? App.usuario.email : '';

        const campoSenha = (id, label) => `
            <div class="input-group" style="position:relative;">
                <label>${label}</label>
                <input type="password" id="${id}" style="width:100%; padding-right:40px;">
                <span onclick="App.toggleSenhaVisibilidade('${id}')" style="position:absolute; right:12px; top:32px; cursor:pointer; font-size:16px; opacity:0.6; user-select:none;" title="Mostrar/Ocultar Senha">👁️</span>
            </div>`;

        try { 
            const usuarios = await App.api('/usuarios'); 
            const listaUsers = Array.isArray(usuarios) ? usuarios : []; 
            div.innerHTML = `
                <div style="display:flex; gap:30px; flex-wrap:wrap;">
                    <div class="card" style="flex:1; height:fit-content; min-width:300px;">
                        <h3>Meus Dados de Acesso</h3>
                        <p style="font-size:12px; color:#666; margin-bottom:15px;">A senha atual é sempre obrigatória para salvar as alterações.</p>
                        
                        <div class="input-group">
                            <label>E-mail Dono da Conta</label>
                            <input type="email" id="user-novo-email" value="${meuEmail}" placeholder="Ex: gestor@escola.com" style="width:100%; border-left: 4px solid #f39c12;">
                        </div>

                        <div class="input-group">
                            <label>Login de Acesso</label>
                            <input type="text" id="user-novo-login" value="${meuLogin}" style="width:100%; border-left: 4px solid #3498db;">
                        </div>

                        ${campoSenha('user-senha-atual', 'Senha Atual (Obrigatória)')}
                        ${campoSenha('user-nova-senha', 'Nova Senha (Opcional)')}
                        ${campoSenha('user-conf-senha', 'Confirmar Nova Senha')}
                        <button class="btn-primary" style="width:100%; margin-top:10px;" onclick="App.atualizarMeusDados()">ATUALIZAR DADOS</button>
                    </div>
                    <div class="card" style="flex:2; min-width:300px;">
                        <h3>Acessos ao Sistema</h3>
                        <div style="background:#f9f9f9; padding:20px; border-radius:10px; margin-bottom:20px; border:1px solid #eee;">
                            <h4 id="titulo-form-user" style="margin:0 0 15px 0; color:#2c3e50;">Novo Usuário</h4>
                            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:15px;">
                                <div class="input-group"><label>Nome Completo</label><input id="new-nome" placeholder="Ex: Maria Silva"></div>
                                <div class="input-group"><label>Login de Acesso</label><input id="new-login" placeholder="Ex: maria.silva"></div>
                                <div class="input-group"><label>Senha</label><input id="new-senha" type="password" placeholder="******"></div>
                                <div class="input-group"><label>Tipo de Permissão</label>
                                    <select id="new-tipo">
                                        <option value="Gestor">Gestor (Acesso Total)</option>
                                        <option value="Secretaria">Secretaria (Sem Financeiro)</option>
                                        <option value="Professor">Professor (Só Pedagógico)</option>
                                    </select>
                                </div>
                            </div>
                            <div style="text-align:right; margin-top:10px; display:flex; justify-content:flex-end; gap:10px;">
                                <button id="btn-cancel-user" onclick="App.cancelarEdicaoUsuario()" style="display:none; background:#95a5a6; color:white; border:none; padding:10px 20px; border-radius:6px; font-weight:bold; cursor:pointer;">CANCELAR</button>
                                <button id="btn-save-user" class="btn-primary" style="width:auto; margin-top:0;" onclick="App.salvarNovoUsuario()">CRIAR USUÁRIO</button>
                            </div>
                        </div>
                        <div class="table-responsive-wrapper">
                            <table><thead><tr><th>Nome</th><th>Login</th><th>Tipo</th><th style="text-align:right;">Ações</th></tr></thead><tbody>${listaUsers.map(u => `<tr><td>${u.nome}</td><td>${u.login}</td><td><span style="background:#eee; padding:2px 6px; border-radius:4px; font-size:11px;">${u.tipo}</span></td><td style="text-align:right;"><button class="btn-edit" onclick="App.preencherEdicaoUsuario('${u.id}', '${u.nome}', '${u.login}', '${u.tipo}')">✏️</button>${u.id !== App.usuario.id ? `<button class="btn-del" onclick="App.excluirUsuario('${u.id}')">🗑️</button>` : ''}</td></tr>`).join('')}</tbody></table>
                        </div>
                    </div>
                </div>`; 
        } catch(e) { div.innerHTML = "Erro ao carregar usuários."; } 
    },

    toggleSenhaVisibilidade: (id) => {
        const input = document.getElementById(id);
        if (input.type === 'password') {
            input.type = 'text';
        } else {
            input.type = 'password';
        }
    },

    atualizarMeusDados: async () => { 
        const novoLogin = document.getElementById('user-novo-login').value.trim();
        const novoEmail = document.getElementById('user-novo-email').value.trim();
        const atual = document.getElementById('user-senha-atual').value; 
        const nova = document.getElementById('user-nova-senha').value; 
        const conf = document.getElementById('user-conf-senha').value; 

        if (!novoLogin) return App.showToast("O login não pode ficar em branco.", "error"); 
        if (!atual) return App.showToast("Digite sua senha atual para autorizar as alterações.", "error"); 
        if (nova && nova !== conf) return App.showToast("A nova senha e a confirmação não conferem.", "error"); 
        
        const btn = document.querySelector('button[onclick="App.atualizarMeusDados()"]');
        const textoOriginal = btn.innerText;
        btn.innerText = "Atualizando... ⏳";
        btn.disabled = true;

        try {
            const payload = { novoLogin: novoLogin, novoEmail: novoEmail, senhaAtual: atual };
            if (nova) payload.novaSenha = nova; 

            const resposta = await App.api('/usuarios/atualizar-conta', 'PUT', payload);
            
            if (resposta && resposta.success) {
                App.showToast("Dados atualizados com sucesso! Faça login novamente.", "success"); 
                setTimeout(() => App.logout(), 2500);
            } else {
                App.showToast(resposta.error || "Erro ao atualizar os dados.", "error");
            }
        } catch (e) {
            App.showToast("Erro de conexão.", "error");
        } finally {
            btn.innerText = textoOriginal;
            btn.disabled = false;
        }
    },

    salvarNovoUsuario: async () => {
        const nome = document.getElementById('new-nome').value;
        const login = document.getElementById('new-login').value;
        const senha = document.getElementById('new-senha').value;
        const tipo = document.getElementById('new-tipo').value;

        if(!nome || !login) return App.showToast("Preencha nome e login.", "error");
        if(!App.idEdicaoUsuario && !senha) return App.showToast("Digite uma senha para o novo usuário.", "error");

        const payload = { nome, login, tipo };
        if(senha) payload.senha = senha;

        const btn = document.getElementById('btn-save-user');
        const txtOriginal = btn ? btn.innerText : 'CRIAR USUÁRIO';
        if(btn) { btn.innerText = "Salvando... ⏳"; btn.disabled = true; }
        document.body.style.cursor = 'wait';

        try {
            if(App.idEdicaoUsuario) {
                await App.api(`/usuarios/${App.idEdicaoUsuario}`, 'PUT', payload);
                App.showToast("Usuário atualizado com sucesso!", "success");
            } else {
                await App.api('/usuarios', 'POST', payload);
                App.showToast("Usuário criado com sucesso!", "success");
            }
            App.renderizarMinhaConta();
        } catch(e) {
            App.showToast("Erro ao salvar usuário.", "error");
        } finally { 
            if(btn) { btn.innerText = txtOriginal; btn.disabled = false; } 
            document.body.style.cursor = 'default'; 
        }
    },

    preencherEdicaoUsuario: (id, nome, login, tipo) => {
        App.idEdicaoUsuario = id;
        document.getElementById('new-nome').value = nome;
        document.getElementById('new-login').value = login;
        document.getElementById('new-senha').value = ''; 
        document.getElementById('new-tipo').value = tipo;
        
        document.getElementById('titulo-form-user').innerText = "Editar Usuário";
        document.getElementById('btn-save-user').innerText = "ATUALIZAR";
        document.getElementById('btn-cancel-user').style.display = "inline-block";
    },

    cancelarEdicaoUsuario: () => {
        App.idEdicaoUsuario = null;
        document.getElementById('new-nome').value = '';
        document.getElementById('new-login').value = '';
        document.getElementById('new-senha').value = '';
        document.getElementById('new-tipo').value = 'Gestor';
        
        document.getElementById('titulo-form-user').innerText = "Novo Usuário";
        document.getElementById('btn-save-user').innerText = "CRIAR USUÁRIO";
        document.getElementById('btn-cancel-user').style.display = "none";
    },

    excluirUsuario: async (id) => {
        if(confirm("Tem certeza que deseja excluir este usuário? Ele perderá o acesso ao sistema imediatamente.")) {
            await App.api(`/usuarios/${id}`, 'DELETE');
            App.showToast("Usuário excluído com sucesso.", "success");
            App.renderizarMinhaConta();
        }
    },

    renderizarConfiguracoes: async () => { 
        App.setTitulo("Perfil da Escola"); 
        const div = document.getElementById('app-content'); 
        div.innerHTML = 'Carregando...'; 
        
        try { 
            const escola = await App.api('/escola'); 
            const imgLogo = escola.foto || 'https://placehold.co/100?text=LOGO'; 
            const imgQr = escola.qrCodeImagem || 'https://placehold.co/100?text=QR+CODE'; 
            
            div.innerHTML = `
                <div class="card" style="max-width:850px; margin:0 auto;">
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:20px; margin-bottom:30px;">
                        <div style="background:#f9f9f9; padding:20px; border-radius:10px; display:flex; align-items:center; gap:20px; color:#333;">
                            <img id="conf-preview" src="${imgLogo}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:2px solid white; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
                            <div>
                                <label style="font-weight:bold; font-size:13px;">Logotipo Oficial</label>
                                <input type="file" id="conf-file" accept="image/*" style="font-size:12px; margin-bottom:10px; width:100%;">
                                <div style="display:flex; gap:5px;">
                                    <button class="btn-primary" style="padding:5px 10px; font-size:11px;" onclick="App.processarLogo()">💾 Salvar</button>
                                    <button class="btn-del" style="padding:5px 10px; font-size:11px;" onclick="App.removerLogo()">🗑️</button>
                                </div>
                            </div>
                        </div>
                        <div style="background:#f9f9f9; padding:20px; border-radius:10px; display:flex; align-items:center; gap:20px; color:#333;">
                            <img id="conf-qr-preview" src="${imgQr}" style="width:100px; height:100px; object-fit:contain; border:2px solid white; box-shadow:0 2px 5px rgba(0,0,0,0.1); background:white;">
                            <div>
                                <label style="font-weight:bold; font-size:13px;">QR Code PIX</label>
                                <input type="file" id="conf-qr-file" accept="image/*" style="font-size:12px; margin-bottom:10px; width:100%;">
                                <div style="display:flex; gap:5px;">
                                    <button class="btn-primary" style="padding:5px 10px; font-size:11px;" onclick="App.processarQrCode()">💾 Salvar</button>
                                    <button class="btn-del" style="padding:5px 10px; font-size:11px;" onclick="App.removerQrCode()">🗑️</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:20px; margin-bottom:20px;">
                        <div class="input-group"><label>Nome da Instituição</label><input id="conf-nome" value="${escola.nome||''}"></div>
                        <div class="input-group"><label>CNPJ</label><input id="conf-cnpj" value="${escola.cnpj||''}" oninput="App.mascaraCNPJ(this)" maxlength="18"></div>
                    </div>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:20px;">
                        <div class="input-group"><label>Dados Bancários</label><input id="conf-banco" value="${escola.banco||''}"></div>
                        <div class="input-group"><label>Chave PIX (Texto)</label><input id="conf-pix" value="${escola.chavePix||''}" placeholder="Ex: email@escola.com"></div>
                    </div>
                    <button class="btn-primary" style="width:100%; margin-top:20px; padding:15px;" onclick="App.salvarConfiguracoes()">ATUALIZAR DADOS</button>
                </div>`; 
        } catch(e) { div.innerHTML = "Erro ao carregar."; } 
    },

    processarLogo: () => {
        const fileInput = document.getElementById('conf-file');
        if (!fileInput.files || fileInput.files.length === 0) return App.showToast("Selecione uma imagem do seu computador primeiro.", "warning");
        App.showToast("Processando imagem... ⏳", "info");
        App.otimizarImagem(fileInput.files[0], 400, async (imgBase64) => {
            document.getElementById('conf-preview').src = imgBase64;
            const perfilAtual = JSON.parse(localStorage.getItem('escola_perfil')) || {};
            const novoPerfil = { ...perfilAtual, foto: imgBase64 };
            try {
                await App.api('/escola', 'PUT', novoPerfil);
                localStorage.setItem('escola_perfil', JSON.stringify(novoPerfil));
                App.carregarDadosEscola(); 
                App.showToast("Logotipo salvo com sucesso! ✅", "success");
            } catch(e) { App.showToast("Erro ao salvar no servidor.", "error"); }
        });
    },

    processarQrCode: () => {
        const fileInput = document.getElementById('conf-qr-file');
        if (!fileInput.files || fileInput.files.length === 0) return App.showToast("Selecione a imagem do QR Code primeiro.", "warning");
        App.showToast("Processando QR Code... ⏳", "info");
        App.otimizarImagem(fileInput.files[0], 400, async (imgBase64) => {
            document.getElementById('conf-qr-preview').src = imgBase64;
            const perfilAtual = JSON.parse(localStorage.getItem('escola_perfil')) || {};
            const novoPerfil = { ...perfilAtual, qrCodeImagem: imgBase64 };
            try {
                await App.api('/escola', 'PUT', novoPerfil);
                localStorage.setItem('escola_perfil', JSON.stringify(novoPerfil));
                App.showToast("QR Code PIX salvo com sucesso! ✅", "success");
            } catch(e) { App.showToast("Erro ao salvar no servidor.", "error"); }
        });
    },

    removerLogo: async () => { 
        if(confirm("Deseja realmente apagar o logotipo da escola?")){
            const s = JSON.parse(localStorage.getItem('escola_perfil')) || {}; 
            await App.api('/escola','PUT',{...s, foto: ""}); 
            localStorage.setItem('escola_perfil', JSON.stringify({...s, foto: ""}));
            App.carregarDadosEscola(); 
            document.getElementById('conf-preview').src = "https://placehold.co/100?text=LOGO";
            App.showToast("Logotipo removido.", "info");
        } 
    },

    removerQrCode: async () => { 
        if(confirm("Deseja realmente apagar o QR Code PIX?")){
            const s = JSON.parse(localStorage.getItem('escola_perfil')) || {}; 
            await App.api('/escola','PUT',{...s, qrCodeImagem: ""}); 
            localStorage.setItem('escola_perfil', JSON.stringify({...s, qrCodeImagem: ""})); 
            document.getElementById('conf-qr-preview').src = "https://placehold.co/100?text=QR+CODE";
            App.showToast("QR Code removido.", "info");
        } 
    },

    mascaraCNPJ: (i) => { let v = i.value.replace(/\D/g,""); v=v.replace(/^(\d{2})(\d)/,"$1.$2"); v=v.replace(/^(\d{2})\.(\d{3})(\d)/,"$1.$2.$3"); v=v.replace(/\.(\d{3})(\d)/,".$1/$2"); v=v.replace(/(\d{4})(\d)/,"$1-$2"); i.value = v; },
    
    salvarConfiguracoes: async () => { 
        const s = JSON.parse(localStorage.getItem('escola_perfil')) || {}; 
        const p = {
            ...s, 
            nome: document.getElementById('conf-nome').value, 
            cnpj: document.getElementById('conf-cnpj').value, 
            banco: document.getElementById('conf-banco').value, 
            chavePix: document.getElementById('conf-pix').value
        }; 
        
        const btn = document.querySelector('button[onclick="App.salvarConfiguracoes()"]');
        const txt = btn.innerText; btn.innerText = "Salvando... ⏳"; btn.disabled = true;
        
        try {
            await App.api('/escola','PUT',p); 
            localStorage.setItem('escola_perfil', JSON.stringify(p));
            App.showToast("Configurações atualizadas!", "success"); 
            App.carregarDadosEscola(); 
        } catch(e) { App.showToast("Erro ao salvar.", "error"); }
        finally { btn.innerText = txt; btn.disabled = false; }
    },   

// --- MÁSCARAS DE INPUT ---
    mascaraCPF: (i) => {
        let v = i.value.replace(/\D/g, ""); 
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        i.value = v;
    },

    mascaraCelular: (i) => {
        let v = i.value.replace(/\D/g, "");
        v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
        v = v.replace(/(\d)(\d{4})$/, "$1-$2");
        i.value = v;
    },

    mascaraCEP: (i) => {
        let v = i.value.replace(/\D/g, "");
        v = v.replace(/^(\d{5})(\d)/, "$1-$2");
        i.value = v;
    },
    
    mascaraValor: (i) => {
        let v = i.value.replace(/\D/g, ""); 
        v = (v / 100).toFixed(2) + ""; 
        i.value = v;
    },

    // --- BACKUP & SEGURANÇA ---
    renderizarBackup: () => { 
        App.setTitulo("Backup de Dados"); 
        const div = document.getElementById('app-content');
        div.innerHTML = `
            <div style="display:flex; gap:20px; flex-wrap:wrap; margin-bottom:30px;">
                <div class="card" style="flex:1; border-left: 5px solid #27ae60; padding:25px;">
                    <h3 style="color:#27ae60; border:none; margin-top:0;">📥 Fazer Backup</h3>
                    <p style="opacity:0.7; margin-bottom:20px; font-size:13px;">Baixe uma cópia completa de todos os dados do sistema.</p>
                    <button class="btn-primary" style="width:100%; background:#27ae60;" onclick="App.realizarDownloadBackup()">⬇️ BAIXAR DADOS (.JSON)</button>
                </div>
                <div class="card" style="flex:1; border-left: 5px solid #f39c12; padding:25px;">
                    <h3 style="color:#f39c12; border:none; margin-top:0;">📤 Restaurar</h3>
                    <p style="opacity:0.7; margin-bottom:15px; font-size:13px;">Carregue um arquivo de backup para recuperar dados.</p>
                    <input type="file" id="input-backup-file" accept=".json" style="width:100%; margin-bottom:15px; border:1px solid #ddd; padding:10px; border-radius:5px;">
                    <button class="btn-primary" style="width:100%; background:#f39c12;" onclick="App.processarRestauracao()">⬆️ RESTAURAR DADOS</button>
                </div>
            </div>
            <div class="card" style="border:2px solid #e74c3c; background:#fff5f5; padding:30px; text-align:center;">
                <h3 style="color:#c0392b; border:none; font-size:22px; margin-top:0;">⚠️ ZONA DE PERIGO</h3>
                <p style="color:#c0392b; margin-bottom:20px;">Esta ação apagará <strong>TODOS</strong> os dados operacionais (Alunos, Notas, Financeiro, etc) e resetará o <strong>PERFIL DA ESCOLA</strong>.<br>Seu usuário será mantido para login.</p>
                <button class="btn-primary" style="background:#c0392b; width:200px; padding:15px; font-weight:bold; border:2px solid #c0392b;" onclick="App.resetarSistema()">🗑️ RESETAR TUDO</button>
            </div>
        `; 
    },

    resetarSistema: async () => {
        if(!confirm("⚠️ ATENÇÃO EXTREMA: ISSO APAGARÁ TODOS OS DADOS DA ESCOLA (Alunos, Notas, Financeiro...) e limpará o perfil da instituição.\n\nSeu usuário será mantido para login.\n\nDeseja continuar?")) return;
        const confirmacao = prompt("Para confirmar a exclusão TOTAL, digite: APAGAR TUDO");
        if(confirmacao !== "APAGAR TUDO") return App.showToast("Ação cancelada. Código incorreto.", "error");

        const btn = document.querySelector('button[onclick="App.resetarSistema()"]');
        if(btn) { btn.disabled = true; btn.innerText = "⏳ APAGANDO..."; }
        document.body.style.cursor = 'wait';
        
        try {
            const entidades = ['alunos', 'turmas', 'cursos', 'financeiro', 'eventos', 'chamadas', 'avaliacoes', 'planejamentos'];
            for (const ent of entidades) {
                const dados = await App.api(`/${ent}`);
                if (Array.isArray(dados) && dados.length > 0) {
                    await Promise.all(dados.map(item => App.api(`/${ent}/${item.id}`, 'DELETE')));
                }
            }
            await App.api('/escola', 'PUT', { nome: 'Nome da Escola', cnpj: '', foto: '', qrCodeImagem: '', banco: '', chavePix: '' });
            localStorage.removeItem('escola_perfil');

            alert("✅ Sistema resetado com sucesso!");
            location.reload();
        } catch (e) {
            alert("Erro ao limpar dados.");
            if(btn) { btn.disabled = false; btn.innerText = "🗑️ RESETAR TUDO"; }
        } finally { document.body.style.cursor = 'default'; }
    },

    realizarDownloadBackup: async () => { try { const e=['escola','usuarios','alunos','turmas','cursos','financeiro','eventos','chamadas','avaliacoes','planejamento']; const d={}; for(const ep of e){const r=await App.api(`/${ep}`); d[ep]=r;} const b=new Blob([JSON.stringify(d,null,2)],{type:"application/json"}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=`backup_${new Date().toISOString().split('T')[0]}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); } catch(x){alert("Erro backup");} },
    processarRestauracao: async () => { const f=document.getElementById('input-backup-file'); if(!f.files.length)return alert("Selecione arquivo."); if(!confirm("Substituir dados?"))return; const r=new FileReader(); r.onload=async(e)=>{try{const d=JSON.parse(e.target.result); const t=['alunos','turmas','cursos','financeiro','eventos','chamadas','avaliacoes','planejamento','usuarios','escola']; for(const k of t){if(d[k]){if(Array.isArray(d[k])){for(const i of d[k])await App.api(`/${k}`,'POST',i)}else{await App.api('/escola','PUT',d[k])}}} alert("Restaurado!"); location.reload();}catch(x){alert("Arquivo inválido.");}}; r.readAsText(f.files[0]); },
    excluir: async (ep, id) => { if(confirm("Excluir?")) { await App.api(`/${ep}/${id}`, 'DELETE'); App.renderizarLista(App.entidadeAtual); } },

    // =========================================================
    // 👑 MÓDULO SECRETO DO DONO (LICENÇAS E ATIVAÇÕES)
    // =========================================================
    clicksMaster: 0,

    verificarCliqueMaster: () => {
        App.clicksMaster++;
        if (App.clicksMaster >= 5) {
            App.clicksMaster = 0;
            App.abrirModalMasterLogin();
        }
    },

    abrirModalMasterLogin: () => {
        const senha = prompt("👑 ÁREA RESTRITA DO DONO\n\nDigite a Senha Mestra do Sistema:");
        if (senha) {
            App.fazerLoginMaster(senha);
        }
    },

    fazerLoginMaster: async (senha) => {
        try {
            const response = await fetch(`${API_URL}/master/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ senha })
            });
            const data = await response.json();
            
            if (data.success) {
                sessionStorage.setItem('token_master', data.token);
                App.renderizarPainelMaster();
                App.showToast("Bem-vindo ao Painel do Dono!", "success");
            } else {
                App.showToast("Senha Mestra Incorreta!", "error");
            }
        } catch(e) {
            App.showToast("Erro de conexão com o servidor.", "error");
        }
    },

    renderizarPainelMaster: async () => {
        const token = sessionStorage.getItem('token_master');
        if (!token) return;

        const modal = document.getElementById('modal-overlay');
        if(modal) modal.style.display = 'flex';
        
        document.getElementById('modal-titulo').innerText = "👑 PAINEL DO DONO (Gerador de Licenças)";
        document.getElementById('modal-form-content').innerHTML = "<p style='text-align:center; padding:30px;'>Carregando banco de licenças...</p>";
        
        document.querySelector('.modal-footer').innerHTML = `<button class="btn-cancel" style="width:100%; background:#2c3e50;" onclick="App.fecharModal()">Encerrar Sessão do Dono</button>`;

        try {
            const res = await fetch(`${API_URL}/master/ativacoes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const lista = await res.json();
            
            const total = lista.length;
            const verificados = lista.filter(l => l.status === 'Verificado').length;
            const pendentes = lista.filter(l => l.status === 'Pendente').length;
            const bloqueados = lista.filter(l => l.status === 'Bloqueado').length;

            let html = `
                <div style="display:flex; gap:10px; margin-bottom:20px; text-align:center; flex-wrap:wrap;">
                    <div style="flex:1; background:#f4f6f7; padding:15px; border-radius:8px; border:1px solid #ddd; min-width:100px;">
                        <h4 style="margin:0; font-size:11px; color:#666; text-transform:uppercase;">Total Cadastros</h4><span style="font-size:26px; font-weight:bold; color:#2c3e50;">${total}</span>
                    </div>
                    <div style="flex:1; background:#eafaf1; padding:15px; border-radius:8px; border:1px solid #2ecc71; min-width:100px;">
                        <h4 style="margin:0; font-size:11px; color:#27ae60; text-transform:uppercase;">Ativos 🟢</h4><span style="font-size:26px; font-weight:bold; color:#27ae60;">${verificados}</span>
                    </div>
                    <div style="flex:1; background:#fef5e7; padding:15px; border-radius:8px; border:1px solid #f1c40f; min-width:100px;">
                        <h4 style="margin:0; font-size:11px; color:#f39c12; text-transform:uppercase;">Pendentes 🟡</h4><span style="font-size:26px; font-weight:bold; color:#f39c12;">${pendentes}</span>
                    </div>
                    <div style="flex:1; background:#fdedec; padding:15px; border-radius:8px; border:1px solid #e74c3c; min-width:100px;">
                        <h4 style="margin:0; font-size:11px; color:#c0392b; text-transform:uppercase;">Bloqueados 🔴</h4><span style="font-size:26px; font-weight:bold; color:#c0392b;">${bloqueados}</span>
                    </div>
                </div>
                <div class="table-responsive-wrapper">
                    <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left;">
                        <thead style="background:#2c3e50; color:white;">
                            <tr>
                                <th style="padding:12px;">E-mail do Cliente</th>
                                <th style="padding:12px;">Status</th>
                                <th style="padding:12px;">PIN Único</th>
                                <th style="padding:12px; text-align:right;">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            if(lista.length === 0) {
                html += `<tr><td colspan="4" style="text-align:center; padding:20px; color:#666;">Ainda não há solicitações de escolas.</td></tr>`;
            } else {
                lista.forEach(item => {
                    let cor = item.status === 'Verificado' ? 'green' : (item.status === 'Pendente' ? '#f39c12' : 'red');
                    let bolinha = item.status === 'Verificado' ? '🟢' : (item.status === 'Pendente' ? '🟡' : '🔴');
                    
                    html += `
                        <tr style="border-bottom:1px solid #eee; background:${item.status === 'Verificado' ? '#f9fff9' : '#fff'};">
                            <td style="padding:12px; font-weight:bold; color:#333;">${item.email}</td>
                            <td style="padding:12px; color:${cor}; font-weight:bold;">${bolinha} ${item.status}</td>
                            <td style="padding:12px; font-family:monospace; font-size:16px; font-weight:bold; color:#8e44ad; letter-spacing:2px;">
                                ${item.pinAtivacao || '<span style="font-size:11px; font-weight:normal; letter-spacing:normal; color:#999;">Aguardando geração...</span>'}
                            </td>
                            <td style="padding:12px; text-align:right; display:flex; gap:5px; justify-content:flex-end;">
                                ${item.status === 'Pendente' ? `<button onclick="App.gerarPinMaster('${item.email}')" style="background:#3498db; color:white; border:none; padding:6px 12px; border-radius:4px; font-weight:bold; cursor:pointer; font-size:11px;">🔑 Gerar PIN</button> <button onclick="App.bloquearEmailMaster('${item.email}')" style="background:#e74c3c; color:white; border:none; padding:6px 12px; border-radius:4px; font-weight:bold; cursor:pointer; font-size:11px;">🚫</button>` : ''}
                                ${item.status === 'Verificado' ? `<span style="color:green; font-weight:bold; font-size:11px;">CONTA ATIVA</span>` : ''}
                                ${item.status === 'Bloqueado' ? `<button onclick="App.gerarPinMaster('${item.email}')" style="background:#f39c12; color:white; border:none; padding:6px 12px; border-radius:4px; font-weight:bold; cursor:pointer; font-size:11px;">♻️ Reativar e Gerar PIN</button>` : ''}
                            </td>
                        </tr>
                    `;
                });
            }

            html += `</tbody></table></div>`;
            document.getElementById('modal-form-content').innerHTML = html;
            
        } catch(e) {
            document.getElementById('modal-form-content').innerHTML = "<p style='color:red;'>Erro ao carregar dados do banco.</p>";
        }
    },

    gerarPinMaster: async (email) => {
        const token = sessionStorage.getItem('token_master');
        document.getElementById('modal-form-content').innerHTML = "<p style='text-align:center;'>Gerando Código Único...</p>";
        try {
            const res = await fetch(`${API_URL}/master/gerar-pin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if(data.success) {
                App.showToast(`PIN gerado com sucesso! Envie para o cliente.`, 'success');
                App.renderizarPainelMaster();
            }
        } catch(e) { App.showToast("Erro ao gerar PIN", "error"); }
    },

    bloquearEmailMaster: async (email) => {
        if(!confirm(`Deseja bloquear permanentemente o cadastro de ${email}?`)) return;
        const token = sessionStorage.getItem('token_master');
        document.getElementById('modal-form-content').innerHTML = "<p style='text-align:center;'>Bloqueando acesso...</p>";
        try {
            const res = await fetch(`${API_URL}/master/bloquear`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if(data.success) {
                App.showToast(`E-mail bloqueado.`, 'error');
                App.renderizarPainelMaster(); 
            }
        } catch(e) { App.showToast("Erro ao bloquear", "error"); }
    }
}; 

// =========================================================
// MÓDULO DE CADASTRO DE NOVAS INSTITUIÇÕES (SAAS)
// =========================================================

App.abrirTelaCadastroInst = () => {
    document.getElementById('modal-cadastro-inst').style.display = 'flex';
    App.voltarEtapa1();
};

App.fecharModalInst = () => {
    document.getElementById('modal-cadastro-inst').style.display = 'none';
};

App.voltarEtapa1 = () => {
    document.getElementById('etapa-1-email').style.display = 'block';
    document.getElementById('etapa-2-validacao').style.display = 'none';
    document.getElementById('etapa-3-sucesso').style.display = 'none';
};

// =========================================================
// MOTOR DE E-MAILS E VALIDAÇÃO DE REGISTO
// =========================================================

App.enviarCodigoInst = async () => {
    const email = document.getElementById('novo-inst-email').value;
    const btn = document.querySelector('#etapa-1-email button');
    
    if(!email || !email.includes('@')) {
        App.showToast('Por favor, digite um e-mail válido.', 'error');
        return;
    }

    const textoOriginal = btn.innerText;
    btn.innerText = "Enviando E-mail... ⏳";
    btn.disabled = true;
    btn.style.opacity = "0.7";

    try {
        const response = await App.api('/auth/enviar-codigo', 'POST', { email: email });
        
        if (response && response.success) {
            App.showToast('Código enviado! Verifique a sua caixa de entrada.', 'success');
            
            document.getElementById('etapa-1-email').style.display = 'none';
            document.getElementById('etapa-2-validacao').style.display = 'block';
        } else {
            App.showToast('Erro ao enviar e-mail. Verifique o servidor.', 'error');
        }
    } catch (error) {
        App.showToast('Erro de ligação ao servidor.', 'error');
    } finally {
        btn.innerText = textoOriginal;
        btn.disabled = false;
        btn.style.opacity = "1";
    }
};

App.validarCadastroInst = async () => {
    const emailDigitado = document.getElementById('novo-inst-email').value; 
    const codigoDigitado = document.getElementById('novo-inst-codigo').value.trim();
    const pinDigitado = document.getElementById('novo-inst-pin').value.trim();
    const btn = document.querySelector('#etapa-2-validacao button');

    if(!codigoDigitado || !pinDigitado) {
        App.showToast('Preencha o Código e o PIN exclusivo.', 'error');
        return;
    }

    const textoOriginal = btn.innerText;
    btn.innerText = "A Validar... ⏳";
    btn.disabled = true;

    try {
        const response = await App.api('/auth/validar-cadastro', 'POST', { 
            email: emailDigitado, 
            codigo: codigoDigitado, 
            pin: pinDigitado 
        });

        if (response && response.success) {
            document.getElementById('etapa-2-validacao').style.display = 'none';
            document.getElementById('etapa-3-sucesso').style.display = 'block';
            
            if(typeof confetti === 'function') confetti();
        } else {
            App.showToast(response.error || 'Dados incorretos.', 'error');
        }
    } catch (error) {
        App.showToast('Erro ao validar com o servidor.', 'error');
    } finally {
        btn.innerText = textoOriginal;
        btn.disabled = false;
    }
};

// =========================================================
// SISTEMA DE AUTENTICAÇÃO E LOGIN
// =========================================================

App.usuarioLogado = null;

App.entrarNoSistema = () => { 
    document.getElementById('tela-login').style.display = 'none'; 
    document.getElementById('tela-sistema').style.display = 'flex'; 
    if(App.usuario && App.usuario.nome) {
        document.getElementById('user-name').innerText = App.usuario.nome; 
    }
    App.renderizarInicio(); 
};

App.fazerLogin = async () => {
    const userStr = document.getElementById('login-user').value.trim();
    const passStr = document.getElementById('login-pass').value.trim();
    const btnLogin = document.querySelector('#tela-login button[type="submit"]');

    if (!userStr || !passStr) {
        App.showToast('Por favor, preencha o utilizador e a senha.', 'error');
        return;
    }

    const textoOriginal = btnLogin.innerText;
    btnLogin.innerText = "Autenticando... ⏳";
    btnLogin.disabled = true;

    try {
        const response = await App.api('/auth/login', 'POST', { login: userStr, senha: passStr });

        if (response && response.success) {
            App.usuario = response.usuario; 
            sessionStorage.setItem('usuario_logado', JSON.stringify(App.usuario));
            sessionStorage.setItem('token_acesso', response.token);
            
            App.entrarNoSistema();
            App.showToast('Bem-vindo ao sistema!', 'success');
        } else {
            App.showToast('Utilizador ou senha incorretos.', 'error');
        }
    } catch (error) {
        console.error("Erro no login:", error);
        App.showToast('Erro de conexão. Tente novamente.', 'error');
    } finally {
        btnLogin.innerText = textoOriginal;
        btnLogin.disabled = false;
    }
};

App.logout = () => {
    App.usuarioLogado = null;
    sessionStorage.removeItem('usuario_logado');
    sessionStorage.removeItem('token_acesso');

    document.getElementById('login-user').value = '';
    document.getElementById('login-pass').value = '';

    document.getElementById('tela-sistema').style.display = 'none';
    
    const telaLogin = document.getElementById('tela-login');
    telaLogin.style.display = telaLogin.classList.contains('login-wrapper') ? 'flex' : 'block';
};

// =========================================================
// INICIALIZAÇÃO DO SISTEMA
// =========================================================
document.addEventListener('DOMContentLoaded', App.init);

document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        App.fecharModal();
        if(typeof App.fecharModalInst === 'function') App.fecharModalInst();
    }
});