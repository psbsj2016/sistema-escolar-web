// =========================================================
// SISTEMA ESCOLAR - APP.JS (V121 - GOLDEN MASTER)
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

    // --- NÚCLEO DE COMUNICAÇÃO (API CENTRALIZADA) ---
    api: async (endpoint, method = 'GET', body = null) => {
        const headers = { 'Content-Type': 'application/json' };
        if (App.usuario && App.usuario.id) {
            headers['X-User-ID'] = App.usuario.id; 
        }
        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);

        try {
            const response = await fetch(`${API_URL}${endpoint}`, options);
            if (!response.ok) throw new Error(`Erro API: ${response.status}`);
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
    logout: () => { sessionStorage.removeItem('usuario_logado'); location.reload(); },

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

        // --- NOVO: LOGIN COM ENTER (AGORA NO LUGAR CERTO) ---
        const passInput = document.getElementById('login-pass');
        if(passInput) {
            passInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    App.fazerLogin();
                }
            });
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

        div.innerHTML = `
            <div class="card" style="max-width:800px; margin:0 auto;">
                <h3>🎨 Personalizar Aparência</h3>
                <p style="color:#666; margin-bottom:20px;">Personalize as cores e os atalhos da tela inicial.</p>
                <div class="theme-section">
                    <h4 style="margin:0 0 15px 0;">1. Cores do Sistema</h4>
                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:20px;">
                        <div><div style="font-weight:bold; margin-bottom:10px;">Menu Lateral</div><div class="theme-row"><label>Fundo:</label><input type="color" value="${c.sbBg}" oninput="App.previewCor('--sidebar-bg', this.value)"></div><div class="theme-row"><label>Texto:</label><input type="color" value="${c.sbTxt}" oninput="App.previewCor('--sidebar-text', this.value)"></div></div>
                        <div><div style="font-weight:bold; margin-bottom:10px;">Área Principal</div><div class="theme-row"><label>Fundo:</label><input type="color" value="${c.bdBg}" oninput="App.previewCor('--body-bg', this.value)"></div><div class="theme-row"><label>Texto:</label><input type="color" value="${c.txtMain}" oninput="App.previewCor('--text-main', this.value)"></div></div>
                        <div><div style="font-weight:bold; margin-bottom:10px;">Dashboard / Cards</div><div class="theme-row"><label>Fundo:</label><input type="color" value="${c.cdBg}" oninput="App.previewCor('--card-bg', this.value)"></div><div class="theme-row"><label>Texto:</label><input type="color" value="${c.cdTxt}" oninput="App.previewCor('--card-text', this.value)"></div></div>
                    </div>
                </div>
                <div class="theme-section">
                    <h4 style="margin:0 0 5px 0;">2. Atalhos no Dashboard</h4>
                    <p style="font-size:12px; color:#666; margin-bottom:15px;">Selecione os atalhos (Mínimo: 1 | Máximo: 8).</p>
                    <div class="shortcut-selector">${LISTA_FUNCIONALIDADES.map(f => `<label class="shortcut-item"><input type="checkbox" class="sc-check" value="${f.id}" ${atalhosSalvos.includes(f.id)?'checked':''} onchange="App.validarLimiteAtalhos(this)"> ${f.icon} ${f.nome}</label>`).join('')}</div>
                </div>
                <div style="display:flex; gap:10px;"><button class="btn-primary" onclick="App.salvarTema()">💾 SALVAR ALTERAÇÕES</button><button class="btn-cancel" style="margin-top:10px;" onclick="App.resetarTema()">RESTAURAR PADRÃO</button></div>
            </div>`;
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

    // --- CARREGAMENTO DE DADOS ---
    carregarDadosEscola: async () => { try { const escola = await App.api('/escola'); const logoTitle = document.querySelector('.logo-area h2'); if(logoTitle) logoTitle.innerHTML = `${escola.nome || 'Escola'}<br><small>${escola.cnpj || ''}</small>`; const logoContainer = document.querySelector('.logo-area'); let img = logoContainer.querySelector('img'); if(escola.foto && escola.foto.length > 50) { if(!img) { img = document.createElement('img'); img.style.cssText = "width:80px; height:80px; border-radius:50%; object-fit:cover; margin-bottom:10px; display:block; margin: 0 auto 10px auto; border: 3px solid rgba(255,255,255,0.2);"; logoContainer.insertBefore(img, logoContainer.firstChild); } img.src = escola.foto; } localStorage.setItem('escola_perfil', JSON.stringify(escola)); } catch(e) { console.log("Carregando perfil..."); } },
    otimizarImagem: (file, maxWidth, callback) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = (event) => { const img = new Image(); img.src = event.target.result; img.onload = () => { const canvas = document.createElement('canvas'); let width = img.width; let height = img.height; if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; } canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height); callback(canvas.toDataURL('image/jpeg', 0.7)); }; }; },
    
    fazerLogin: async () => { 
        const login = document.getElementById('login-user').value; 
        const pass = document.getElementById('login-pass').value; 
        try { 
            const usuarios = await App.api('/usuarios'); 
            const user = usuarios.find(u => u.login === login && u.senha === pass); 
            if(user) { 
                App.usuario = user; 
                sessionStorage.setItem('usuario_logado', JSON.stringify(App.usuario)); 
                App.entrarNoSistema(); 
            } else { App.showToast("Usuário ou senha inválidos.", "error"); } 
        } catch (e) { alert("Erro de conexão com o servidor."); } 
    },
    entrarNoSistema: () => { 
        document.getElementById('tela-login').style.display = 'none'; 
        document.getElementById('tela-sistema').style.display = 'flex'; 
        document.getElementById('user-name').innerText = App.usuario.nome; 
        App.renderizarInicio(); 
    },

// --- 2. DASHBOARD COM GRÁFICO E FORMATO BRASILEIRO ---
    renderizarInicio: async () => {
        App.setTitulo("Visão Geral");
        const div = document.getElementById('app-content'); 
        div.innerHTML = '<p style="padding:20px; text-align:center; color:#666;">Carregando painel...</p>';
        
        try {
            // 1. Busca dados
            const [alunos, financeiro] = await Promise.all([
                App.api('/alunos'), 
                App.api('/financeiro')
            ]);
            
            const listaAlunos = Array.isArray(alunos) ? alunos : [];
            const listaFin = Array.isArray(financeiro) ? financeiro : [];
            
            // 2. Cálculos Financeiros (Mês Atual)
            const dataHoje = new Date(); 
            const mesAtual = dataHoje.getMonth() + 1; 
            const anoAtual = dataHoje.getFullYear();
            
            // Filtra só o que vence neste mês/ano
            const financasMes = listaFin.filter(f => { 
                if(!f.vencimento) return false;
                const parts = f.vencimento.split('-'); 
                return parseInt(parts[1]) === mesAtual && parseInt(parts[0]) === anoAtual; 
            });
            
            // Soma Recebido vs Pendente
            const totalRecebido = financasMes
                .filter(f => f.status === 'Pago')
                .reduce((acc, cur) => acc + parseFloat(cur.valor), 0);
                
            const totalPendente = financasMes
                .filter(f => f.status !== 'Pago')
                .reduce((acc, cur) => acc + parseFloat(cur.valor), 0);

            const inadimplentes = listaFin.filter(f => f.status === 'Pendente' && new Date(f.vencimento) < new Date()).length;
            
            // Função rápida para formatar R$ no padrão BR
            const formatarMoeda = (valor) => {
                return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            };

            // 3. Monta Atalhos
            let idsAtalhos = JSON.parse(localStorage.getItem('escola_atalhos'));
            if (!idsAtalhos || !Array.isArray(idsAtalhos) || idsAtalhos.length === 0) {
                idsAtalhos = ['novo_aluno','fin_carne','ped_chamada','ped_notas','ped_plan','ped_bol'];
            }
            const htmlAtalhos = idsAtalhos.map(id => { 
                const func = LISTA_FUNCIONALIDADES.find(f => f.id === id); 
                return func ? `<div class="shortcut-btn" onclick="${func.acao}"><div>${func.icon}</div><span>${func.nome}</span></div>` : ''; 
            }).join('');

            // 4. Renderiza HTML
            div.innerHTML = `
                <h3 style="opacity:0.7; margin-top:0; margin-bottom:20px;">Olá, ${App.usuario ? App.usuario.nome : 'Gestor'}! 👋</h3>
                
                <div class="dashboard-grid">
                    <div class="stat-card card-blue">
                        <div class="stat-info"><h4>Total Alunos</h4><p>${listaAlunos.length}</p></div>
                        <div class="stat-icon">🎓</div>
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

                    <div class="stat-card card-red">
                        <div class="stat-info"><h4>Títulos em Atraso</h4><p style="color:#e74c3c;">${inadimplentes}</p></div>
                        <div class="stat-icon">⚠️</div>
                    </div>
                </div>

                <h3 style="color:var(--card-text); font-size:16px; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">Acesso Rápido</h3>
                <div class="shortcuts-grid">${htmlAtalhos || '<p style="color:#666;">Nenhum atalho selecionado.</p>'}</div>`;

            // 5. Inicializa o Gráfico (Chart.js)
            const ctx = document.getElementById('graficoFinanceiro');
            if(ctx && (totalRecebido > 0 || totalPendente > 0)) {
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Recebido', 'Pendente'],
                        datasets: [{
                            data: [totalRecebido, totalPendente],
                            backgroundColor: ['#27ae60', '#e74c3c'],
                            borderWidth: 0,
                            hoverOffset: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { 
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        // Formatação com vírgula dentro do balãozinho do gráfico
                                        return ' R$ ' + formatarMoeda(context.raw);
                                    }
                                }
                            }
                        },
                        cutout: '75%'
                    }
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

     // --- NOVO: SISTEMA DE NOTIFICAÇÃO ---
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
        toast.innerHTML = `<span>${icon}</span> <span>${mensagem}</span>`;

        container.appendChild(toast);

        // Remove após 3 segundos
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.5s ease forwards';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },

   // --- ROTEAMENTO ---
    renderizarTela: async (tela) => {
        // BLINDAGEM DE SEGURANÇA
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
    
       // --- FUNÇÃO DE PONTE PARA CADASTROS (ADICIONE ISTO) ---
    abrirModalCadastro: (tipo, id) => {
        // Verifica se o arquivo cadastros.js carregou e injetou a função
        if (typeof App.abrirModalCadastroModulo === 'function') {
            App.abrirModalCadastroModulo(tipo, id);
        } else {
            console.error("Erro: O módulo cadastros.js não foi carregado corretamente.");
            alert("O módulo de cadastros ainda não foi carregado. Tente recarregar a página.");
        }
    },

    // --- MÓDULO DE VENDAS (NOVO) ---
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
        
        // Altera o botão de Salvar para registrar a venda
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

        // Se for fiado, cai nos "Inadimplentes" e Contas a Receber
        const status = forma === 'Pendente (Fiado)' ? 'Pendente' : 'Pago';
        const descricaoFinal = `Venda: ${item} | Pagto: ${forma} ${obs ? ' | Obs: '+obs : ''}`;

        const payload = {
            id: Date.now().toString(),
            idCarne: `VENDA_${Date.now()}`, // Para não dar erro caso o sistema procure um carnê
            idAluno: idAluno,
            alunoNome: alunoNome,
            valor: valor,
            vencimento: data,
            status: status,
            descricao: descricaoFinal,
            tipo: 'Receita', // Garante que entra como Receita nos Dossiês!
            dataGeracao: new Date().toLocaleDateString('pt-BR')
        };

        try {
            await App.api('/financeiro', 'POST', payload);
            App.showToast("Venda registrada com sucesso!", "success");
            App.fecharModal();
            // Ao salvar no financeiro, todos os relatórios puxam automaticamente!
        } catch (e) {
            App.showToast("Erro ao registrar venda.", "error");
        }
    },

    // --- 4. LISTAS (LAYOUT MODERNO RESTAURADO) ---
    renderizarLista: async (tipo) => {
        // 1. BLINDAGEM DE SEGURANÇA (NOVO)
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
            div.innerHTML = `
                <div class="card" style="text-align:center; padding: 40px; margin-bottom: 30px;">
                    <h3 style="border:none; margin-bottom:10px; color:var(--card-text);">Consultar ${titulo}</h3>
                    <p style="opacity:0.7; margin-bottom:30px;">Utilize o campo abaixo para localizar registros.</p>
                    <div class="toolbar" style="max-width: 800px; margin: 0 auto; display: flex; gap: 15px;">
                        <div class="search-wrapper" style="flex: 1; position: relative;">
                            <span class="search-icon" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #aaa;">🔍</span>
                            <input type="text" id="input-busca" class="search-input-modern" style="width: 100%; padding: 14px 14px 14px 45px; border-radius: 8px; border: 2px solid #eee;" placeholder="Pesquisar..." oninput="App.filtrarTabelaReativa()">
                        </div>
                        <button class="btn-new-modern" onclick="${tipo === 'financeiro' ? "App.renderizarTela('mensalidades')" : `App.abrirModalCadastro('${tipo}')`}"><span>＋</span> NOVO REGISTRO</button>
                    </div>
                </div>
                <div id="container-tabela"></div>
            `;
            App.filtrarTabelaReativa();
        } catch(e) { div.innerHTML = "Erro."; }
    },

    filtrarTabelaReativa: () => {
        const termo = document.getElementById('input-busca').value.trim().toLowerCase();
        const container = document.getElementById('container-tabela');
        if (!Array.isArray(App.listaCache)) { container.innerHTML = ''; return; }
        const filtrados = termo.length === 0 ? App.listaCache : App.listaCache.filter(item => {
            const nome = (item.nome || item.alunoNome || item.descricao || "").toLowerCase();
            return nome.includes(termo);
        });
        container.innerHTML = `<div class="card" style="animation: fadeIn 0.3s ease;">${App.gerarTabelaHTML(filtrados)}</div>`;
    },

   gerarTabelaHTML: (dados) => {
        const tipo = App.entidadeAtual;
        let thead = '';
        if(tipo === 'aluno') { thead = `<th>Nome</th><th>Turma</th><th>WhatsApp</th><th style="text-align:right;">Ações</th>`; }
        else if(tipo === 'turma') { thead = `<th>Turma</th><th>Dia</th><th>Horário</th><th>Curso</th><th style="text-align:right;">Ações</th>`; }
        else if(tipo === 'curso') { thead = `<th>Curso</th><th>Carga</th><th style="text-align:right;">Ações</th>`; }
        else if(tipo === 'financeiro') { thead = `<th>Ref (Aluno)</th><th>Descrição do Produto</th><th>Vencimento</th><th>Valor</th><th>Status</th><th style="text-align:right;">Ações</th>`; }

        let html = `<table><thead><tr>${thead}</tr></thead><tbody>`;
        dados.forEach(item => {
            html += `<tr>`;
            if(tipo === 'aluno') {
                html += `<td>${item.nome}</td><td>${item.turma||'-'}</td><td>${item.whatsapp||'-'}</td>`;
            } else if(tipo === 'turma') {
                html += `<td>${item.nome}</td><td>${item.dia||'-'}</td><td>${item.horario||'-'}</td><td>${item.curso||'-'}</td>`;
            } else if(tipo === 'curso') {
                html += `<td>${item.nome}</td><td>${item.carga||'-'}</td>`;
            } else if(tipo === 'financeiro') {
                const dataBr = item.vencimento ? item.vencimento.split('-').reverse().join('/') : '-';
                html += `<td>${item.alunoNome || 'Não informado'}</td>
                         <td>${item.descricao}</td>
                         <td style="white-space:nowrap;">${dataBr}</td>
                         <td style="white-space:nowrap;">R$ ${parseFloat(item.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                         <td><span style="color:${item.status === 'Pago' ? 'green' : 'red'}; font-weight:bold;">${item.status}</span></td>`;
            }
            
            const acaoEdit = tipo === 'financeiro' ? `App.renderizarTela('mensalidades')` : `App.abrirModalCadastro('${tipo}', '${item.id}')`;
            
            let btnVenda = '';
            let btnWhats = '';

            // Botões de ação
            if(tipo === 'aluno') {
                btnVenda = `<button class="btn-edit" style="background:#27ae60;" onclick="App.abrirModalVenda('${item.id}', \`${item.nome}\`)" title="Registrar Nova Venda">🛒</button>`;
            } else if(tipo === 'financeiro') {
                btnWhats = `<button class="btn-edit" style="background:#25D366; color:white; border-color:#25D366;" onclick="App.enviarWhatsApp('${item.id}')" title="Avisar por WhatsApp">💬</button>`;
            }

            // A Mágica do Layout: div com display:flex e flex-wrap:nowrap para não espremer os botões
            html += `<td style="text-align:right; width: 150px;">
                        <div style="display:flex; gap:5px; justify-content:flex-end; align-items:center; flex-wrap:nowrap;">
                            ${btnVenda}${btnWhats}
                            <button class="btn-edit" onclick="${acaoEdit}" title="Editar">✏️</button>
                            <button class="btn-del" onclick="App.excluir('${tipo==='financeiro'?'financeiro':tipo+'s'}', '${item.id}')" title="Excluir">🗑️</button>
                        </div>
                     </td></tr>`;
        });
        return dados.length ? html + '</tbody></table>' : '<p style="text-align:center; padding:20px; opacity:0.6;">Sem resultados.</p>';
    },

    // --- 5. MINHA CONTA (LAYOUT PREMIUM + API SEGURA) ---
    renderizarMinhaConta: async () => { 
        App.setTitulo("Gestão de Usuários"); 
        const div = document.getElementById('app-content'); 
        App.idEdicaoUsuario = null; 

        try { 
            const usuarios = await App.api('/usuarios'); 
            const listaUsers = Array.isArray(usuarios) ? usuarios : []; 
            div.innerHTML = `
                <div style="display:flex; gap:30px; flex-wrap:wrap;">
                    <div class="card" style="flex:1; height:fit-content; min-width:300px;">
                        <h3>Alterar Minha Senha</h3>
                        <div class="input-group"><label>Senha Atual</label><input type="password" id="user-senha-atual"></div>
                        <div class="input-group"><label>Nova Senha</label><input type="password" id="user-nova-senha"></div>
                        <div class="input-group"><label>Confirmar Senha</label><input type="password" id="user-conf-senha"></div>
                        <button class="btn-primary" style="width:100%; margin-top:10px;" onclick="App.alterarMinhaSenha()">ATUALIZAR SENHA</button>
                    </div>
                    <div class="card" style="flex:2; min-width:400px;">
                        <h3>Acessos ao Sistema</h3>
                        <div style="background:#f9f9f9; padding:20px; border-radius:10px; margin-bottom:20px; border:1px solid #eee;">
                            <h4 id="titulo-form-user" style="margin:0 0 15px 0; color:#2c3e50;">Novo Usuário</h4>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
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
                        <table><thead><tr><th>Nome</th><th>Login</th><th>Tipo</th><th style="text-align:right;">Ações</th></tr></thead><tbody>${listaUsers.map(u => `<tr><td>${u.nome}</td><td>${u.login}</td><td><span style="background:#eee; padding:2px 6px; border-radius:4px; font-size:11px;">${u.tipo}</span></td><td style="text-align:right;"><button class="btn-edit" onclick="App.preencherEdicaoUsuario('${u.id}', '${u.nome}', '${u.login}', '${u.tipo}')">✏️</button>${u.id !== App.usuario.id ? `<button class="btn-del" onclick="App.excluirUsuario('${u.id}')">🗑️</button>` : ''}</td></tr>`).join('')}</tbody></table>
                    </div>
                </div>`; 
        } catch(e) { div.innerHTML = "Erro ao carregar usuários."; } 
    },
    alterarMinhaSenha: async () => { const atual = document.getElementById('user-senha-atual').value; const nova = document.getElementById('user-nova-senha').value; const conf = document.getElementById('user-conf-senha').value; if (!atual || !nova) return alert("Preencha todos os campos."); if (atual !== App.usuario.senha) return alert("Senha atual incorreta."); if (nova !== conf) return alert("A nova senha e a confirmação não conferem."); const u = {...App.usuario, senha: nova}; await App.api(`/usuarios/${App.usuario.id}`, 'PUT', u); alert("Senha alterada com sucesso! Faça login novamente."); App.logout(); },
    salvarNovoUsuario: async () => { const n = document.getElementById('new-nome').value; const l = document.getElementById('new-login').value; const s = document.getElementById('new-senha').value; const t = document.getElementById('new-tipo').value; if (!n || !l) return alert("Nome e Login são obrigatórios."); if (App.idEdicaoUsuario) { const userOriginal = await App.api(`/usuarios/${App.idEdicaoUsuario}`); const payload = { nome: n, login: l, tipo: t, senha: s ? s : userOriginal.senha }; await App.api(`/usuarios/${App.idEdicaoUsuario}`, 'PUT', payload); alert("Usuário atualizado!"); } else { if (!s) return alert("Senha é obrigatória para novos usuários."); await App.api('/usuarios', 'POST', {nome:n, login:l, senha:s, tipo:t}); alert("Usuário criado!"); } App.renderizarMinhaConta(); },
    preencherEdicaoUsuario: (id, nome, login, tipo) => { App.idEdicaoUsuario = id; document.getElementById('titulo-form-user').innerText = "Editar Usuário"; document.getElementById('new-nome').value = nome; document.getElementById('new-login').value = login; document.getElementById('new-tipo').value = tipo; document.getElementById('new-senha').value = ""; document.getElementById('new-senha').placeholder = "(Deixe em branco para manter)"; document.getElementById('btn-save-user').innerText = "SALVAR ALTERAÇÕES"; document.getElementById('btn-save-user').style.background = "#f39c12"; document.getElementById('btn-cancel-user').style.display = "block"; document.querySelector('.card:nth-child(2)').scrollIntoView({behavior: 'smooth'}); },
    cancelarEdicaoUsuario: () => { App.renderizarMinhaConta(); },
    excluirUsuario: async (id) => { if(confirm("Tem certeza que deseja excluir este usuário?")) { await App.api(`/usuarios/${id}`, 'DELETE'); App.renderizarMinhaConta(); } },

// --- NOVO CÓDIGO PARA CONFIGURAÇÕES (Correção de Imagem) ---
    
    renderizarConfiguracoes: async () => { 
        App.setTitulo("Perfil da Escola"); 
        const div = document.getElementById('app-content'); 
        div.innerHTML = 'Carregando...'; 
        
        try { 
            const escola = await App.api('/escola'); 
            // CORREÇÃO AQUI: Trocamos via.placeholder.com por placehold.co
            const imgLogo = escola.foto || 'https://placehold.co/100?text=LOGO'; 
            const imgQr = escola.qrCodeImagem || 'https://placehold.co/100?text=QR+CODE'; 
            
            div.innerHTML = `
                <div class="card" style="max-width:850px; margin:0 auto;">
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:30px;">
                        <div style="background:#f9f9f9; padding:20px; border-radius:10px; display:flex; align-items:center; gap:20px; color:#333;">
                            <img id="conf-preview" src="${imgLogo}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:2px solid white; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
                            <div>
                                <label style="font-weight:bold; font-size:13px;">Logotipo Oficial</label>
                                <input type="file" id="conf-file" accept="image/*" style="font-size:12px; margin-bottom:10px;">
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
                                <input type="file" id="conf-qr-file" accept="image/*" style="font-size:12px; margin-bottom:10px;">
                                <div style="display:flex; gap:5px;">
                                    <button class="btn-primary" style="padding:5px 10px; font-size:11px;" onclick="App.processarQrCode()">💾 Salvar</button>
                                    <button class="btn-del" style="padding:5px 10px; font-size:11px;" onclick="App.removerQrCode()">🗑️</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px; margin-bottom:20px;">
                        <div class="input-group"><label>Nome da Instituição</label><input id="conf-nome" value="${escola.nome||''}"></div>
                        <div class="input-group"><label>CNPJ</label><input id="conf-cnpj" value="${escola.cnpj||''}" oninput="App.mascaraCNPJ(this)" maxlength="18"></div>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                        <div class="input-group"><label>Dados Bancários</label><input id="conf-banco" value="${escola.banco||''}"></div>
                        <div class="input-group"><label>Chave PIX (Texto)</label><input id="conf-pix" value="${escola.chavePix||''}" placeholder="Ex: email@escola.com"></div>
                    </div>
                    <button class="btn-primary" style="width:100%; margin-top:20px; padding:15px;" onclick="App.salvarConfiguracoes()">ATUALIZAR DADOS</button>
                </div>`; 
        } catch(e) { div.innerHTML = "Erro ao carregar."; } 
    },

    // Correção também nas funções de remover:
    removerLogo: async () => { 
        if(confirm("Apagar logotipo?")){
            const s=JSON.parse(localStorage.getItem('escola_perfil')); 
            await App.api('/escola','PUT',{...s,foto:""}); 
            App.carregarDadosEscola(); 
            // CORREÇÃO AQUI
            document.getElementById('conf-preview').src="https://placehold.co/100?text=LOGO";
        } 
    },

    removerQrCode: async () => { 
        if(confirm("Apagar QR Code?")){
            const s=JSON.parse(localStorage.getItem('escola_perfil')); 
            await App.api('/escola','PUT',{...s,qrCodeImagem:""}); 
            localStorage.setItem('escola_perfil', JSON.stringify({...s,qrCodeImagem:""})); 
            // CORREÇÃO AQUI
            document.getElementById('conf-qr-preview').src="https://placehold.co/100?text=QR+CODE";
        } 
    },
    mascaraCNPJ: (i) => { let v = i.value.replace(/\D/g,""); v=v.replace(/^(\d{2})(\d)/,"$1.$2"); v=v.replace(/^(\d{2})\.(\d{3})(\d)/,"$1.$2.$3"); v=v.replace(/\.(\d{3})(\d)/,".$1/$2"); v=v.replace(/(\d{4})(\d)/,"$1-$2"); i.value = v; },
    salvarConfiguracoes: async () => { const s=JSON.parse(localStorage.getItem('escola_perfil')); const p={...s, nome:document.getElementById('conf-nome').value, cnpj:document.getElementById('conf-cnpj').value, banco:document.getElementById('conf-banco').value, chavePix:document.getElementById('conf-pix').value}; await App.api('/escola','PUT',p); App.showToast("Configurações atualizadas!", "success"); App.carregarDadosEscola(); },
    
// --- MÁSCARAS DE INPUT (ADICIONE ESTE BLOCO) ---
    
    // Formata CPF: 000.000.000-00
    mascaraCPF: (i) => {
        let v = i.value.replace(/\D/g, ""); // Remove tudo que não é dígito
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        i.value = v;
    },

    // Formata Celular: (00) 00000-0000
    mascaraCelular: (i) => {
        let v = i.value.replace(/\D/g, "");
        v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
        v = v.replace(/(\d)(\d{4})$/, "$1-$2");
        i.value = v;
    },

    // Formata CEP: 00000-000
    mascaraCEP: (i) => {
        let v = i.value.replace(/\D/g, "");
        v = v.replace(/^(\d{5})(\d)/, "$1-$2");
        i.value = v;
    },
    
    // Formata Moeda simples: 0.00 (Permite apenas numeros e um ponto)
    mascaraValor: (i) => {
        let v = i.value.replace(/\D/g, ""); // Remove não dígitos
        v = (v / 100).toFixed(2) + ""; // Divide por 100 para ter os centavos
        i.value = v;
    },

    // --- NOTIFICAÇÕES TOAST ---
    showToast: (mensagem, tipo = 'info') => {
        // 1. Cria o container se não existir
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        // 2. Define ícone baseando no tipo
        const icones = {
            'success': '✅',
            'error': '❌',
            'info': 'ℹ️'
        };
        const icone = icones[tipo] || 'ℹ️';

        // 3. Cria o elemento do Toast
        const toast = document.createElement('div');
        toast.className = `toast ${tipo}`;
        toast.innerHTML = `<span class="toast-icon">${icone}</span> <span>${mensagem}</span>`;

        // 4. Adiciona na tela
        container.appendChild(toast);

        // 5. Remove automaticamente após 3 segundos
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.5s ease forwards';
            // Espera a animação terminar para remover do HTML
            setTimeout(() => {
                if(toast.parentNode) toast.parentNode.removeChild(toast);
            }, 500);
        }, 3000);
    },

    // --- BACKUP & SEGURANÇA (ROBUSTO + ESCOLA RESET) ---
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
            // Apaga dados das tabelas
            const entidades = ['alunos', 'turmas', 'cursos', 'financeiro', 'eventos', 'chamadas', 'avaliacoes', 'planejamentos'];
            for (const ent of entidades) {
                const dados = await App.api(`/${ent}`);
                if (Array.isArray(dados) && dados.length > 0) {
                    await Promise.all(dados.map(item => App.api(`/${ent}/${item.id}`, 'DELETE')));
                }
            }
            // Reseta Perfil da Escola
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
    excluir: async (ep, id) => { if(confirm("Excluir?")) { await App.api(`/${ep}/${id}`, 'DELETE'); App.renderizarLista(App.entidadeAtual); } }
};

// =========================================================
// MÓDULO DE CADASTRO DE NOVAS INSTITUIÇÕES (SAAS)
// =========================================================

App.abrirTelaCadastroInst = () => {
    document.getElementById('modal-cadastro-inst').style.display = 'flex';
    App.voltarEtapa1(); // Garante que sempre abra na etapa 1
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
// MOTOR DE E-MAILS (SAAS) - VERSÃO REAL
// =========================================================

// Variável invisível para guardar o código gerado pelo servidor
App.codigoGeradoInst = null;

App.enviarCodigoInst = async () => {
    const email = document.getElementById('novo-inst-email').value;
    const btn = document.querySelector('#etapa-1-email button');
    
    if(!email || !email.includes('@')) {
        App.showToast('Por favor, digite um e-mail válido.', 'error');
        return;
    }

    // Efeito visual: Muda o texto do botão e bloqueia para não clicarem 2 vezes
    const textoOriginal = btn.innerText;
    btn.innerText = "Enviando E-mail... ⏳";
    btn.disabled = true;
    btn.style.opacity = "0.7";

    try {
        // Chama a sua API no Render de verdade!
        const response = await App.api('/auth/enviar-codigo', 'POST', { email: email });
        
        if (response && response.success) {
            // Guarda o código na memória do navegador para comparar depois
            App.codigoGeradoInst = response.codigo;
            
            App.showToast('Código enviado! Verifique sua caixa de entrada.', 'success');
            
            // Avança para a tela do PIN
            document.getElementById('etapa-1-email').style.display = 'none';
            document.getElementById('etapa-2-validacao').style.display = 'block';
        } else {
            App.showToast('Erro ao enviar e-mail. Verifique o servidor.', 'error');
        }
    } catch (error) {
        App.showToast('Erro de conexão com o servidor.', 'error');
    } finally {
        // Restaura o botão ao normal
        btn.innerText = textoOriginal;
        btn.disabled = false;
        btn.style.opacity = "1";
    }
};

App.validarCadastroInst = () => {
    const codigoDigitado = document.getElementById('novo-inst-codigo').value.trim();
    const pinDigitado = document.getElementById('novo-inst-pin').value.trim();

    // 🔐 PIN MESTRE PROVISÓRIO (Depois criamos uma tela para você mudar isso)
    const PIN_MESTRE = "7777";

    if(!codigoDigitado || !pinDigitado) {
        App.showToast('Preencha o Código e o PIN exclusivo.', 'error');
        return;
    }

    // 1. O código bate com o que o e-mail mandou?
    if (codigoDigitado !== App.codigoGeradoInst) {
        App.showToast('Código de e-mail incorreto!', 'error');
        return;
    }

    // 2. O PIN de liberação é o seu PIN de Dono?
    if (pinDigitado !== PIN_MESTRE) {
        App.showToast('PIN Exclusivo de Gestor incorreto!', 'error');
        return;
    }

    // TUDO CERTO! A MÁGICA ACONTECE:
    document.getElementById('etapa-2-validacao').style.display = 'none';
    document.getElementById('etapa-3-sucesso').style.display = 'block';
    
    // Chuva de confetes!
    if(typeof confetti === 'function') confetti();
};

// =========================================================
// INICIALIZAÇÃO DO SISTEMA (SEMPRE A ÚLTIMA LINHA)
// =========================================================
document.addEventListener('DOMContentLoaded', App.init);

// Fechar modais com a tecla ESC
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        App.fecharModal();
        if(typeof App.fecharModalInst === 'function') App.fecharModalInst();
    }
});