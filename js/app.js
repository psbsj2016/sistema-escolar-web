// =========================================================
// SISTEMA ESCOLAR - APP.JS (V147 - BUG DO PLANO E SINTAXE CORRIGIDOS)
// =========================================================

const API_URL = CONFIG.API_URL; 

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
    { id: 'doc_dossie', nome: 'Dossiê Executivo', icon: '📁', acao: "App.renderizarRelatorio('dossie')" },
    { id: 'doc_gerador', nome: 'Documentos', icon: '🎓', acao: "App.renderizarRelatorio('documentos')" } 
];

const App = {
    usuario: null, entidadeAtual: null, idEdicao: null, idEdicaoUsuario: null, listaCache: [], 
    calendarState: { month: new Date().getMonth(), year: new Date().getFullYear() },

    escapeHTML: (str) => {
        if (str === null || str === undefined) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    },

    getTenantKey: (chaveBase) => {
        const tenantId = (App.usuario && App.usuario.id) ? App.usuario.id : 'convidado';
        return `${chaveBase}_${tenantId}`;
    },

    getPlanoAtual: () => {
        return localStorage.getItem(App.getTenantKey('escola_plano')) || 'Teste';
    },

    verificarPermissao: (funcionalidade) => {
        const plano = App.getPlanoAtual();
        if (plano === 'Premium') return true; 
        if (funcionalidade === 'whatsapp' && (plano === 'Essencial' || plano === 'Teste')) {
            App.showToast("💎 Funcionalidade Premium. Faça o upgrade para cobrar via WhatsApp num clique!", "warning");
            setTimeout(() => App.renderizarMeuPlano(), 1500); return false;
        }
        if (funcionalidade === 'dossie' && plano !== 'Premium') {
            App.showToast("💎 Exclusivo do Plano Premium. Faça o upgrade para aceder ao Dossiê Executivo!", "warning");
            setTimeout(() => App.renderizarMeuPlano(), 1500); return false;
        }
        return true;
    },

    api: async (endpoint, method = 'GET', body = null) => {
        const headers = { 'Content-Type': 'application/json' };
        const token = localStorage.getItem('token_acesso');
        if (token) { headers['Authorization'] = `Bearer ${token}`; }
        const options = { method, headers }; if (body) options.body = JSON.stringify(body);
        try {
            const response = await fetch(`${API_URL}${endpoint}`, options);
            if (!response.ok) { if (response.status === 401 || response.status === 403) { App.logout(); } throw new Error(`Erro API`); }
            if (method !== 'GET' && App.usuario) setTimeout(App.verificarNotificacoes, 800);
            return await response.json();
        } catch (error) { return method === 'GET' ? [] : null; }
    },

    setTitulo: (texto) => { const el = document.getElementById('titulo-pagina'); if(el) el.innerText = texto; },
    toggleSub: (id) => { 
        document.querySelectorAll('.submenu').forEach(el => { if (el.id !== id) el.style.display = 'none'; });
        const el = document.getElementById(id); if (el) el.style.display = (el.style.display === 'block') ? 'none' : 'block';
    },
    fecharModal: () => {
        document.getElementById('modal-overlay').style.display = 'none';
        const btn = document.querySelector('.btn-confirm');
        if(btn) { btn.style.display = 'inline-flex'; btn.setAttribute('onclick', 'App.salvarCadastro()'); btn.innerHTML = "💾 Salvar Registro"; }
    },

    init: async () => {
        localStorage.removeItem('escola_tema'); localStorage.removeItem('escola_atalhos'); localStorage.removeItem('escola_perfil');
        const salvo = localStorage.getItem('usuario_logado'); const token = localStorage.getItem('token_acesso'); const bioId = localStorage.getItem('escola_bio_id');

        if (salvo && token) { 
            App.usuario = JSON.parse(salvo); 
            
            await App.carregarDadosEscola(); 
            App.aplicarTemaSalvo();

            const keyAtalhos = App.getTenantKey('escola_atalhos');
            if (!localStorage.getItem(keyAtalhos)) { localStorage.setItem(keyAtalhos, JSON.stringify(['novo_aluno','fin_carne','ped_chamada','ped_notas','ped_plan','ped_bol'])); }

            if (bioId && window.PublicKeyCredential) {
                document.getElementById('tela-login').style.display = 'flex'; document.getElementById('tela-sistema').style.display = 'none';
                document.getElementById('btn-biometria').style.display = 'block'; App.entrarComBiometria(); 
            } else { App.entrarNoSistema(); }
        } else { 
            document.documentElement.removeAttribute('style'); document.getElementById('tela-login').style.display = 'flex'; document.getElementById('tela-sistema').style.display = 'none'; 
        }
        
        const dataEl = document.getElementById('data-hoje'); if(dataEl) dataEl.innerText = new Date().toLocaleDateString('pt-BR');
        App.setupMobileMenu(); 
        const passInput = document.getElementById('login-pass'); if(passInput) { passInput.addEventListener('keypress', function (e) { if (e.key === 'Enter') { App.fazerLogin(); } }); }
    },

    bufferToBase64: (buf) => { const bytes = new Uint8Array(buf); let str = ''; for (let i = 0; i < bytes.byteLength; i++) { str += String.fromCharCode(bytes[i]); } return btoa(str); },
    base64ToBuffer: (b64) => { const bin = atob(b64); const bytes = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) { bytes[i] = bin.charCodeAt(i); } return bytes; },

    configurarBiometria: async () => { /* ... código mantido ... */ },
    entrarComBiometria: async () => { /* ... código mantido ... */ },

    setupMobileMenu: () => {
        const header = document.querySelector('header');
        if(header && !document.getElementById('btn-mobile-menu')) {
            const btn = document.createElement('button'); btn.id = 'btn-mobile-menu'; btn.className = 'mobile-menu-btn'; btn.innerHTML = '☰';
            btn.onclick = () => { document.querySelector('.sidebar').classList.toggle('active'); const overlay = document.querySelector('.mobile-overlay') || App.criarOverlay(); overlay.classList.toggle('active'); };
            header.insertBefore(btn, header.firstChild); App.criarOverlay();
        }
    },
    criarOverlay: () => {
        if(document.querySelector('.mobile-overlay')) return document.querySelector('.mobile-overlay');
        const overlay = document.createElement('div'); overlay.className = 'mobile-overlay';
        overlay.onclick = () => { document.querySelector('.sidebar').classList.remove('active'); overlay.classList.remove('active'); };
        document.body.appendChild(overlay); return overlay;
    },

    aplicarTemaSalvo: () => { /* ... código mantido ... */ },

    UI: {
        card: (titulo, subtitulo, conteudo, maxWidth = '100%') => `<div class="card" style="max-width: ${maxWidth}; margin: 0 auto;">${titulo ? `<h3 style="margin-top:0; color:var(--card-text); border-bottom:1px solid #eee; padding-bottom:10px;">${titulo}</h3>` : ''}${subtitulo ? `<p style="color:#666; margin-bottom:20px; font-size:13px;">${subtitulo}</p>` : ''}${conteudo}</div>`,
        input: (label, id, value = '', placeholder = '', tipo = 'text', extraAttr = '') => `<div class="input-group"><label>${label}</label><input type="${tipo}" id="${id}" value="${value}" placeholder="${placeholder}" ${extraAttr}></div>`,
        botao: (texto, acao, tipo = 'primary', icone = '') => { const btnClass = tipo === 'primary' ? 'btn-primary' : (tipo === 'cancel' ? 'btn-cancel' : 'btn-edit'); return `<button class="${btnClass}" style="width: auto; padding: 10px 20px;" onclick="${acao}">${icone} ${texto}</button>`; },
        colorPicker: (label, valor, varCss) => `<div class="theme-row"><label>${label}</label><input type="color" value="${valor}" oninput="App.previewCor('${varCss}', this.value)"></div>`
    },

    renderizarConfiguracoesAparencia: () => { /* ... código mantido ... */ },
    previewCor: (varName, color) => { document.documentElement.style.setProperty(varName, color); },
    previewZoom: (valor) => { document.documentElement.style.setProperty('--zoom-level', valor); },
    validarLimiteAtalhos: (checkbox) => { const checked = document.querySelectorAll('.sc-check:checked'); if (checked.length > 8) { checkbox.checked = false; App.showToast("O limite máximo é de 8 atalhos.", "warning"); } },
    salvarTema: () => { /* ... código mantido ... */ },
    resetarTema: () => { /* ... código mantido ... */ },

    carregarDadosEscola: async () => { 
        try { 
            const escola = await App.api('/escola'); if(!escola) return;
            if (escola.plano) { localStorage.setItem(App.getTenantKey('escola_plano'), escola.plano); }
            const logoTitle = document.querySelector('.logo-area h2'); 
            const planoAtual = App.getPlanoAtual();
            let corBadge = planoAtual === 'Premium' ? '#f39c12' : (planoAtual === 'Profissional' ? '#3498db' : '#27ae60');
            const badgeHtml = `<div style="margin-top:8px;"><span style="background:${corBadge}; color:#fff; font-size:10px; font-weight:bold; padding:3px 8px; border-radius:12px; text-transform:uppercase; letter-spacing:1px; box-shadow:0 2px 4px rgba(0,0,0,0.2);">💎 ${App.escapeHTML(planoAtual)}</span></div>`;
            if(logoTitle) logoTitle.innerHTML = `${App.escapeHTML(escola.nome || 'Escola')}<br><small style="color:#aaa;">${App.escapeHTML(escola.cnpj || '')}</small>${badgeHtml}`; 
            
            const logoContainer = document.querySelector('.logo-area'); let img = logoContainer.querySelector('img'); 
            if(escola.foto && escola.foto.length > 50) { 
                if(!img) { img = document.createElement('img'); img.style.cssText = "width:80px; height:80px; border-radius:50%; object-fit:cover; margin-bottom:10px; display:block; margin: 0 auto 10px auto; border: 3px solid rgba(255,255,255,0.2);"; logoContainer.insertBefore(img, logoContainer.firstChild); } 
                img.src = escola.foto; 
            } else if(img) { img.remove(); }
            localStorage.setItem(App.getTenantKey('escola_perfil'), JSON.stringify(escola)); 
        } catch(e) { console.log("Carregando perfil..."); } 
    },
    
    otimizarImagem: (file, maxWidth, callback) => { /* ... código mantido ... */ },
    
    renderizarInicio: async () => { 
        App.verificarNotificacoes(); 
        App.setTitulo("Visão Geral"); const div = document.getElementById('app-content'); div.innerHTML = '<p style="padding:20px; text-align:center; color:#666;">Carregando painel de métricas...</p>';
        try {
            const [alunos, financeiro, turmas, cursos] = await Promise.all([ App.api('/alunos'), App.api('/financeiro'), App.api('/turmas'), App.api('/cursos') ]);
            const listaAlunos = Array.isArray(alunos) ? alunos : []; const listaFin = Array.isArray(financeiro) ? financeiro : []; const listaTurmas = Array.isArray(turmas) ? turmas : []; const listaCursos = Array.isArray(cursos) ? cursos : [];
            const dataHoje = new Date(); const mesAtual = dataHoje.getMonth() + 1; const anoAtual = dataHoje.getFullYear();
            const financasMes = listaFin.filter(f => { if(!f.vencimento) return false; const parts = f.vencimento.split('-'); return parseInt(parts[1]) === mesAtual && parseInt(parts[0]) === anoAtual; });
            const totalRecebido = financasMes.filter(f => f.status === 'Pago').reduce((acc, cur) => acc + parseFloat(cur.valor), 0);
            const totalPendente = financasMes.filter(f => f.status !== 'Pago').reduce((acc, cur) => acc + parseFloat(cur.valor), 0);
            const inadimplentesList = listaFin.filter(f => f.status === 'Pendente' && new Date(f.vencimento + 'T00:00:00') < dataHoje).sort((a,b) => new Date(a.vencimento) - new Date(b.vencimento));
            const formatarMoeda = (valor) => valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            let idsAtalhos = JSON.parse(localStorage.getItem(App.getTenantKey('escola_atalhos')));
            if (!idsAtalhos || !Array.isArray(idsAtalhos) || idsAtalhos.length === 0) { idsAtalhos = ['novo_aluno','fin_carne','ped_chamada','ped_notas','ped_plan','ped_bol']; }
            const htmlAtalhos = idsAtalhos.map(id => { const func = LISTA_FUNCIONALIDADES.find(f => f.id === id); return func ? `<div class="shortcut-btn" onclick="${func.acao}"><div>${func.icon}</div><span>${func.nome}</span></div>` : ''; }).join('');

            const htmlInadimplentes = inadimplentesList.length === 0 
                ? '<div style="text-align:center; padding:20px; color:#27ae60; font-weight:bold; font-size:14px;">🎉 Excelente! Nenhum título em atraso.</div>' 
                : inadimplentesList.map(f => {
                    const alunoInfo = listaAlunos.find(a => a.id === f.idAluno) || {}; const zap = alunoInfo.whatsapp || ''; const dataBr = f.vencimento.split('-').reverse().join('/'); const valFmt = formatarMoeda(parseFloat(f.valor));
                    return `<div style="background:#fff; border:1px solid #f5b7b1; padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 4px rgba(0,0,0,0.02);"><div><div style="font-size:13px; font-weight:bold; color:#333; margin-bottom:4px;">${App.escapeHTML(f.alunoNome || 'Desconhecido')}</div><div style="font-size:11px; color:#c0392b; font-weight:600;">Venc: ${dataBr} • R$ ${valFmt}</div></div><button onclick="App.cobrarWhatsAppDashboard('${App.escapeHTML(f.alunoNome)}', '${zap}', '${dataBr}', '${valFmt}')" style="background:#25D366; color:white; border:none; padding:8px 12px; border-radius:6px; font-size:11px; cursor:pointer; font-weight:bold; white-space:nowrap; box-shadow:0 2px 4px rgba(37,211,102,0.3); display:flex; align-items:center; gap:5px; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"><span>💬</span> Cobrar</button></div>`;
                }).join('');

            div.innerHTML = `
                <h3 style="opacity:0.7; margin-top:0; margin-bottom:20px;">Olá, ${App.escapeHTML(App.usuario ? App.usuario.nome : 'Gestor')}! 👋</h3>
                <div class="dashboard-grid">
                    <div class="stat-card card-blue" style="display:flex; flex-direction:column; align-items:flex-start; justify-content:center; gap:15px; padding:20px;">
                        <div style="width:100%; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:10px;"><div style="display:flex; align-items:center; gap:10px;"><span style="font-size:24px;">🎓</span><span style="font-size:14px; font-weight:600; color:#555; text-transform:uppercase;">Total Alunos</span></div><span style="font-size:20px; font-weight:bold; color:#3498db;">${listaAlunos.length}</span></div>
                        <div style="width:100%; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:10px;"><div style="display:flex; align-items:center; gap:10px;"><span style="font-size:24px;">🏫</span><span style="font-size:14px; font-weight:600; color:#555; text-transform:uppercase;">Total Turmas</span></div><span style="font-size:20px; font-weight:bold; color:#3498db;">${listaTurmas.length}</span></div>
                        <div style="width:100%; display:flex; justify-content:space-between; align-items:center;"><div style="display:flex; align-items:center; gap:10px;"><span style="font-size:24px;">📚</span><span style="font-size:14px; font-weight:600; color:#555; text-transform:uppercase;">Total Cursos</span></div><span style="font-size:20px; font-weight:bold; color:#3498db;">${listaCursos.length}</span></div>
                    </div>
                    <div class="stat-card card-green" style="display:block; position:relative;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;"><div class="stat-info"><h4>Receita (${mesAtual}/${anoAtual})</h4><p style="color:#27ae60; font-size:20px;">R$ ${formatarMoeda(totalRecebido)}</p></div><div class="stat-icon" style="font-size:24px;">💰</div></div>
                        <div style="height:140px; width:100%; display:flex; justify-content:center; align-items:center;"><canvas id="graficoFinanceiro"></canvas></div>
                        <div style="text-align:center; font-size:11px; color:#666; margin-top:10px; border-top:1px solid #eee; padding-top:5px;">Pendente no mês: <span style="color:#e74c3c; font-weight:bold;">R$ ${formatarMoeda(totalPendente)}</span></div>
                    </div>
                    <div class="stat-card card-red" style="display:flex; flex-direction:column; align-items:stretch; padding:15px; max-height:260px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid #fdedec; padding-bottom:8px;"><h4 style="margin:0; font-size:14px; color:#e74c3c; text-transform:uppercase; font-weight:bold;">⚠️ Títulos em Atraso (${inadimplentesList.length})</h4></div>
                        <div style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:10px; padding-right:5px;">${htmlInadimplentes}</div>
                    </div>
                </div>
                <h3 style="color:var(--card-text); font-size:16px; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">Acesso Rápido</h3>
                <div class="shortcuts-grid">${htmlAtalhos || '<p style="color:#666;">Nenhum atalho selecionado.</p>'}</div>`;

            const ctx = document.getElementById('graficoFinanceiro');
            if(ctx && (totalRecebido > 0 || totalPendente > 0)) {
                new Chart(ctx, { type: 'doughnut', data: { labels: ['Recebido', 'Pendente'], datasets: [{ data: [totalRecebido, totalPendente], backgroundColor: ['#27ae60', '#e74c3c'], borderWidth: 0, hoverOffset: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(context) { return ' R$ ' + formatarMoeda(context.raw); } } } }, cutout: '75%' } });
            } else if (ctx) { new Chart(ctx, { type: 'doughnut', data: { datasets: [{ data: [1], backgroundColor: ['#eee'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, cutout: '75%' } }); }
        } catch(e) { console.error(e); div.innerHTML = "<p>Erro ao carregar dashboard.</p>"; }
    },

    cobrarWhatsAppDashboard: (nomeAluno, telefone, dataVencimento, valorFmt) => { /* ... código mantido ... */ },
    showToast: (mensagem, tipo = 'info') => { /* ... código mantido ... */ },

    renderizarTela: async (tela) => {
        if (!App.usuario && tela !== 'login') { App.showToast("Sessão expirada. Faça login novamente.", "error"); App.logout(); return; }
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
        else if (tela === 'plano') { App.renderizarMeuPlano(); } 
        else { App.renderizarInicio(); }
    },
    
    renderizarConfig: (t) => { if(t==='perfil') App.renderizarTela('configuracoes'); else if(t==='aparencia') App.renderizarTela('aparencia'); else if(t==='conta') App.renderizarMinhaConta(); else if(t==='backup') App.renderizarTela('backup'); },
    renderizarRelatorio: (t) => { if (t === 'dossie' && !App.verificarPermissao('dossie')) return; if (typeof App.renderizarRelatorioModulo === 'function') App.renderizarRelatorioModulo(t); },
    renderizarMeuPlano: () => { /* ... código mantido ... */ },
    comprarPlano: (nomePlano, linkCheckout) => { /* ... código mantido ... */ },
    ativarNovoPlano: async () => { /* ... código mantido ... */ },
    abrirModalCadastro: async (tipo, id) => { 
        if (typeof App.abrirModalCadastroModulo === 'function') { App.abrirModalCadastroModulo(tipo, id); } 
    },
    abrirRelatorioFrequencia: async (idAluno, nomeAluno) => { /* ... código mantido ... */ },
    abrirModalVenda: (idAluno, nomeAluno) => { /* ... código mantido ... */ },
    salvarVenda: async () => { /* ... código mantido ... */ },
    
    // =========================================================
    // 1. LISTAS AVANÇADAS (PESQUISA REATIVA E AÇÕES RÁPIDAS)
    // =========================================================
    renderizarLista: async (tipo) => {
        if(document.querySelector('.sidebar')) document.querySelector('.sidebar').classList.remove('active');
        if(document.querySelector('.mobile-overlay')) document.querySelector('.mobile-overlay').classList.remove('active');

        if(tipo === 'financeiro') { App.renderizarFinanceiroPro(); return; }

        App.setTitulo(`Gerenciar ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}s`);
        const div = document.getElementById('app-content');
        div.innerHTML = '<p style="text-align:center; padding:20px; color:#666;">A carregar base de dados... ⏳</p>';

        try {
            App.dadosEmCache = await App.api(`/${tipo}s`); 
            App.tipoListaAtual = tipo;
            App.desenharTabelaLista(App.dadosEmCache);
        } catch(e) {
            div.innerHTML = '<p style="color:#e74c3c; text-align:center;">Erro ao carregar os dados.</p>';
        }
    },

    desenharTabelaLista: (dados) => {
        const div = document.getElementById('app-content');
        const tipo = App.tipoListaAtual;
        const btnNovo = `<button onclick="App.abrirModalCadastro('${tipo}')" class="btn-new-modern">➕ Novo Registro</button>`;

        let html = `
            <div class="toolbar" style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px; margin-bottom:15px;">
                <div class="search-wrapper" style="flex:1; min-width:250px;">
                    <input type="text" class="search-input-modern" placeholder="🔍 Pesquisar pelo nome..." onkeyup="App.filtrarLista(this.value)">
                </div>
                ${btnNovo}
            </div>
            <div class="table-responsive-wrapper">
                <table style="width:100%; border-collapse:collapse; text-align:left;">
                    <thead>
                        <tr>
                            <th>Nome / Descrição</th>
                            ${tipo === 'aluno' ? '<th>Turma/Curso</th>' : ''}
                            <th style="text-align:right;">Ações de Gestão</th>
                        </tr>
                    </thead>
                    <tbody>`;

        if(!dados || dados.length === 0) {
            html += `<tr><td colspan="3" style="text-align:center; padding:30px; color:#999;">Nenhum registo encontrado.</td></tr>`;
        } else {
            dados.forEach(item => {
                const nomeExibicao = item.nome || item.descricao || 'Sem Nome';
                
                let botoesExtras = '';
                if(tipo === 'aluno') {
                    botoesExtras = `
                        <button onclick="App.renderizarRelatorioModulo('ficha'); setTimeout(()=>document.getElementById('ficha-aluno').value='${item.id}', 500);" class="btn-primary" style="padding:8px 12px; font-size:12px; background:#3498db; margin-right:5px;" title="Ficha">📄</button>
                    `;
                }

                html += `
                    <tr>
                        <td style="font-weight:bold; color:#333;">${App.escapeHTML(nomeExibicao)}</td>
                        ${tipo === 'aluno' ? `<td><span style="font-size:11px; background:#eee; padding:3px 8px; border-radius:10px;">${item.turma||'S/T'}</span></td>` : ''}
                        <td style="text-align:right; white-space:nowrap;">
                            ${botoesExtras}
                            <button onclick="App.abrirModalCadastro('${tipo}', '${item.id}')" class="btn-edit">✏️ Editar</button>
                            <button onclick="App.excluir('${tipo}s', '${item.id}')" class="btn-del">🗑️</button>
                        </td>
                    </tr>`;
            });
        }
        
        html += `</tbody></table></div>`;
        div.innerHTML = App.UI.card('', '', html);
    },

    filtrarLista: (termo) => {
        const txt = termo.toLowerCase();
        const filtrados = App.dadosEmCache.filter(item => {
            const nome = (item.nome || item.descricao || '').toLowerCase();
            return nome.includes(txt);
        });
        App.desenharTabelaLista(filtrados);
    },

    excluir: async (endpoint, id) => {
        if(confirm("Tem a certeza absoluta? Esta ação não pode ser desfeita.")) {
            document.body.style.cursor = 'wait';
            try {
                await App.api(`/${endpoint}/${id}`, 'DELETE');
                App.showToast("Excluído com sucesso!", "success");
                App.renderizarLista(endpoint.slice(0, -1));
            } catch(e) { App.showToast("Erro ao excluir.", "error"); } 
            finally { document.body.style.cursor = 'default'; }
        }
    },

    // =========================================================
    // 2. CONFIGURAÇÕES COM UPLOAD DE BASE64 (IMAGENS)
    // =========================================================
    renderizarConfiguracoes: async () => {
        App.setTitulo("Perfil da Instituição");
        const div = document.getElementById('app-content');
        const escola = JSON.parse(localStorage.getItem(App.getTenantKey('escola_perfil'))) || {};
        
        const html = `
            <div class="form-grid-2">
                ${App.UI.input('Nome da Instituição', 'conf-nome', escola.nome || '')}
                ${App.UI.input('CNPJ / NIF', 'conf-cnpj', escola.cnpj || '')}
            </div>
            <div class="form-grid-2" style="margin-top:15px;">
                ${App.UI.input('Chave PIX (Para Recebimentos)', 'conf-pix', escola.chavePix || '')}
                ${App.UI.input('Email de Contacto', 'conf-email', escola.email || '')}
            </div>
            
            <h3 style="margin-top:30px; border-bottom:1px solid #eee; padding-bottom:10px; color:var(--accent);">🖼️ Personalização Visual</h3>
            <p style="font-size:12px; color:#666;">Carregue imagens quadradas. Elas serão otimizadas automaticamente.</p>
            
            <div class="form-grid-2">
                <div style="background:#f8f9fa; padding:15px; border-radius:8px; border:1px dashed #ccc; text-align:center;">
                    <label style="font-weight:bold; font-size:13px; display:block; margin-bottom:10px;">Logomarca da Escola</label>
                    ${escola.foto ? `<img src="${escola.foto}" style="height:60px; margin-bottom:10px; border-radius:8px;">` : ''}
                    <input type="file" id="conf-logo" accept="image/*" style="width:100%; font-size:12px;">
                </div>
                <div style="background:#f8f9fa; padding:15px; border-radius:8px; border:1px dashed #ccc; text-align:center;">
                    <label style="font-weight:bold; font-size:13px; display:block; margin-bottom:10px;">QR Code do PIX (Carnês)</label>
                    ${escola.qrPix ? `<img src="${escola.qrPix}" style="height:60px; margin-bottom:10px; border-radius:8px;">` : ''}
                    <input type="file" id="conf-qr" accept="image/*" style="width:100%; font-size:12px;">
                </div>
            </div>

            <div style="margin-top:25px;">
                <button class="btn-primary" onclick="App.salvarConfiguracoes()" style="width:100%; justify-content:center;">💾 GUARDAR CONFIGURAÇÕES</button>
            </div>
        `;
        div.innerHTML = App.UI.card('🏢 Identidade Oficial', 'Estes dados sairão impressos nos Carnês, Boletins e Contratos.', html);
    },

    converterBase64: (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    },

    salvarConfiguracoes: async () => {
        document.body.style.cursor = 'wait';
        try {
            const escola = JSON.parse(localStorage.getItem(App.getTenantKey('escola_perfil'))) || {};
            const payload = {
                nome: document.getElementById('conf-nome').value,
                cnpj: document.getElementById('conf-cnpj').value,
                chavePix: document.getElementById('conf-pix').value,
                email: document.getElementById('conf-email').value,
                foto: escola.foto || null,
                qrPix: escola.qrPix || null
            };

            const logoFile = document.getElementById('conf-logo').files[0];
            const qrFile = document.getElementById('conf-qr').files[0];

            if(logoFile) payload.foto = await App.converterBase64(logoFile);
            if(qrFile) payload.qrPix = await App.converterBase64(qrFile);
            
            await App.api('/escola', 'PUT', payload);
            localStorage.setItem(App.getTenantKey('escola_perfil'), JSON.stringify(payload));
            
            App.showToast("Configurações salvas! A sua logomarca foi atualizada.", "success");
            App.carregarDadosEscola(); 
        } catch(e) { App.showToast("Erro ao salvar.", "error"); } 
        finally { document.body.style.cursor = 'default'; }
    },

    // =========================================================
    // 3. MINHA CONTA (ACESSO E GESTÃO DE EQUIPA)
    // =========================================================
    renderizarMinhaConta: async () => {
        App.setTitulo("Minha Conta e Equipa");
        const div = document.getElementById('app-content');
        const u = App.usuario || {};
        
        const htmlConta = `
            <div class="form-grid-2">
                ${App.UI.input('Nome Completo', 'conta-nome', u.nome)}
                ${App.UI.input('Email de Acesso (Login)', 'conta-login', u.login)}
            </div>
            <div style="margin-top:20px; border-top:1px solid #eee; padding-top:20px;">
                <p style="font-size:13px; color:#e74c3c; font-weight:bold; margin-bottom:10px;">Para alterar dados, confirme a senha atual:</p>
                <div class="form-grid-2">
                    ${App.UI.input('Senha Atual', 'conta-senha-atual', '', 'Obrigatório', 'password')}
                    ${App.UI.input('Nova Senha', 'conta-senha-nova', '', 'Opcional', 'password')}
                </div>
            </div>
            <button class="btn-primary" onclick="App.atualizarMeusDados()" style="margin-top:20px; width:100%;">💾 Atualizar Meus Dados</button>
        `;

        div.innerHTML = App.UI.card('🔐 Dados de Acesso', 'As suas credenciais.', htmlConta);
    },

    atualizarMeusDados: async () => {
        const senhaAtual = document.getElementById('conta-senha-atual').value;
        const novoLogin = document.getElementById('conta-login').value;
        const novaSenha = document.getElementById('conta-senha-nova').value;

        if(!senhaAtual) return App.showToast("A senha atual é obrigatória!", "error");
        
        document.body.style.cursor = 'wait';
        try {
            const res = await App.api('/usuarios/atualizar-conta', 'PUT', { senhaAtual, novoLogin, novaSenha });
            if(res.error) throw new Error(res.error);
            App.showToast("Conta atualizada! Faça o login novamente.", "success");
            setTimeout(() => App.logout(), 2000);
        } catch(e) { App.showToast(e.message, "error"); } 
        finally { document.body.style.cursor = 'default'; }
    },

    // =========================================================
    // 4. MEU PLANO (VITRINE E VALIDAÇÃO DE PIN)
    // =========================================================
    renderizarMeuPlano: () => {
        App.setTitulo("Licença e Assinatura");
        const planoAtual = App.getPlanoAtual();
        const div = document.getElementById('app-content');
        
        let corBadge = planoAtual === 'Premium' ? '#f39c12' : (planoAtual === 'Profissional' ? '#3498db' : '#27ae60');

        div.innerHTML = `
            <div style="background:linear-gradient(135deg, #2c3e50, #34495e); padding:40px; border-radius:12px; color:white; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.1); margin-bottom:30px;">
                <h3 style="margin:0 0 10px 0; color:#bdc3c7;">Plano Atual Ativo</h3>
                <h1 style="margin:0; font-size:48px; color:${corBadge}; text-transform:uppercase; text-shadow:0 2px 10px rgba(0,0,0,0.3);">${planoAtual}</h1>
            </div>

            <div class="card" style="text-align:center;">
                <h3>Fez Upgrade? Insira o seu novo PIN de Liberação</h3>
                <p style="font-size:13px; color:#666; margin-bottom:20px;">Cole abaixo o código enviado pelo nosso atendimento do WhatsApp para destrancar novas funções instantaneamente.</p>
                <div style="display:flex; gap:10px; max-width:400px; margin:0 auto;">
                    <input type="text" id="novo-pin-upgrade" placeholder="Ex: PRE-A1B2C3" style="flex:1; padding:15px; border-radius:8px; border:2px solid #ddd; text-align:center; font-size:18px; font-weight:bold; text-transform:uppercase;">
                    <button onclick="App.validarPinUpgrade()" class="btn-primary">Validar 🚀</button>
                </div>
            </div>
        `;
    },

    validarPinUpgrade: async () => {
        const pin = document.getElementById('novo-pin-upgrade').value.trim();
        if(!pin) return App.showToast("Digite o PIN!", "warning");

        document.body.style.cursor = 'wait';
        try {
            const res = await App.api('/escola/validar-pin', 'POST', { pin });
            if(res.error) throw new Error(res.error);
            
            App.showToast(`Parabéns! O seu sistema foi atualizado para o plano ${res.plano}.`, "success");
            let ativacao = JSON.parse(localStorage.getItem('escola_ativacao') || '{}');
            ativacao.plano = res.plano;
            localStorage.setItem('escola_ativacao', JSON.stringify(ativacao));
            
            setTimeout(() => App.renderizarMeuPlano(), 1500);
        } catch(e) { App.showToast(e.message || "PIN inválido.", "error"); }
        finally { document.body.style.cursor = 'default'; }
    },

    // =========================================================
    // 5. SUPER SININHO (ANIVERSÁRIOS, AGENDA E INADIMPLÊNCIA)
    // =========================================================
    toggleNotificacoes: () => {
        const dropdown = document.getElementById('noti-dropdown');
        if (dropdown) dropdown.classList.toggle('active');
    },

    verificarNotificacoes: async () => {
        try {
            const badge = document.getElementById('noti-badge');
            const list = document.getElementById('noti-list');
            let alertasHTML = '';
            let contador = 0;

            const [alunos, financeiro, eventos] = await Promise.all([
                App.api('/alunos'), App.api('/financeiro'), App.api('/eventos')
            ]);

            const dataHoje = new Date();
            const diaHoje = String(dataHoje.getDate()).padStart(2, '0');
            const mesHoje = String(dataHoje.getMonth() + 1).padStart(2, '0');
            const formatHoje = `${dataHoje.getFullYear()}-${mesHoje}-${diaHoje}`;

            // 1. Aniversariantes do Dia
            alunos.forEach(a => {
                if(a.nascimento && a.nascimento.endsWith(`-${mesHoje}-${diaHoje}`)) {
                    contador++;
                    alertasHTML += `<div class="noti-item"><div class="noti-icon">🎉</div><div><strong>Aniversário!</strong><br>Dê os parabéns a ${App.escapeHTML(a.nome)}.</div></div>`;
                }
            });

            // 2. Eventos/Provas de Hoje
            eventos.forEach(e => {
                if(e.data === formatHoje) {
                    contador++;
                    alertasHTML += `<div class="noti-item"><div class="noti-icon">📅</div><div><strong>Agenda de Hoje:</strong><br>${App.escapeHTML(e.tipo)} - ${App.escapeHTML(e.descricao)}</div></div>`;
                }
            });

            // 3. Inadimplência (Faturas Vencidas)
            const vencidos = financeiro.filter(f => f.status !== 'Pago' && f.tipo === 'Receita' && new Date(f.vencimento + 'T00:00:00') < dataHoje);
            if(vencidos.length > 0) {
                contador += vencidos.length;
                alertasHTML += `<div class="noti-item"><div class="noti-icon" style="color:#e74c3c;">⚠️</div><div><strong>Financeiro Crítico:</strong><br>Existem ${vencidos.length} parcelas vencidas aguardando cobrança.</div></div>`;
            }

            // Renderizar na UI
            if (contador > 0) {
                if(badge) { badge.style.display = 'block'; badge.innerText = contador > 99 ? '99+' : contador; }
                if(list) list.innerHTML = alertasHTML;
            } else {
                if(badge) badge.style.display = 'none';
                if(list) list.innerHTML = '<div class="noti-item" style="justify-content:center; color:#27ae60; font-weight:bold;">Tudo em dia! Nenhuma pendência.</div>';
            }
        } catch (e) {
            console.log("Notificações: Erro ao procurar alertas.");
        }
    }
}; // 🚀 AQUI ESTÁ A CORREÇÃO! A CHAVE QUE FALTAVA PARA FECHAR O OBJETO APP

document.addEventListener('DOMContentLoaded', App.init);
document.addEventListener('keydown', function(event) { if (event.key === "Escape") { App.fecharModal(); if(typeof App.fecharModalInst === 'function') App.fecharModalInst(); } });
window.addEventListener('focus', () => { const telaSistema = document.getElementById('tela-sistema'); if (App.usuario && telaSistema && telaSistema.style.display !== 'none') { App.verificarNotificacoes(); } });

// PWA Logic mantida...
let deferredPrompt; window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; const installBanner = document.getElementById('pwa-install-banner'); if (installBanner) { installBanner.style.display = 'block'; } });
const btnInstall = document.getElementById('pwa-btn-install'); if (btnInstall) { btnInstall.addEventListener('click', async () => { const installBanner = document.getElementById('pwa-install-banner'); installBanner.style.display = 'none'; if (deferredPrompt) { deferredPrompt.prompt(); const { outcome } = await deferredPrompt.userChoice; deferredPrompt = null; } }); }
const btnCancel = document.getElementById('pwa-btn-cancel'); if (btnCancel) { btnCancel.addEventListener('click', () => { const installBanner = document.getElementById('pwa-install-banner'); installBanner.style.display = 'none'; }); }
window.addEventListener('appinstalled', () => { const installBanner = document.getElementById('pwa-install-banner'); if (installBanner) installBanner.style.display = 'none'; deferredPrompt = null; App.showToast('App instalada com sucesso! 🎉', 'success'); });