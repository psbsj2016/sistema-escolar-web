// =========================================================
// MÓDULO RELATÓRIOS V160 (FOLHA A4 BLINDADA + RESPONSIVIDADE MOBILE)
// =========================================================

App.renderizarRelatorioModulo = async (tipo) => {
    if (tipo === 'fin_detalhado' || tipo === 'financeiro') { App.setTitulo("Relatórios Financeiros"); App.renderizarSelecaoRelatorio(); return; }
    if (tipo === 'dossie') { App.renderizarDossie(); return; }
    if (tipo === 'ficha') { App.gerarFichaSetup(); return; }
    if (tipo === 'documentos') { App.renderizarGeradorDocumentos(); return; }
};

// 🧱 ATALHOS GERAIS PARA O MÓDULO DE RELATÓRIOS
const relCol = (label, id, tipo='text', val='', extra='') => `
    <div style="flex:1; min-width:150px; text-align:left;">
        <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">${label}</label>
        <input type="${tipo}" id="${id}" value="${val}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;" ${extra}>
    </div>`;

const relSelect = (label, id, options, extra='') => `
    <div style="flex:1; min-width:150px; text-align:left;">
        <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">${label}</label>
        <select id="${id}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;" ${extra}>${options}</select>
    </div>`;

// --- ESTILOS COMUNS PARA IMPRESSÃO E MOBILE ---
const reportStyles = `
    <style>
        .print-sheet { background: white; max-width: 210mm; margin: 0 auto; padding: 40px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-radius: 8px; font-family: 'Segoe UI', Arial, sans-serif; box-sizing: border-box; }
        .table-responsive { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; margin-bottom: 20px; }
        .kpi-container { display: flex; justify-content: space-between; gap: 15px; flex-wrap: wrap; }
        .kpi-box { flex: 1; min-width: 120px; padding: 15px; border-radius: 8px; text-align: center; }
        @media (max-width: 768px) {
            .print-sheet { padding: 15px !important; margin: 0 !important; width: 100% !important; border-radius: 0 !important; box-shadow: none !important; }
            .doc-header { flex-direction: column !important; align-items: flex-start !important; gap: 15px !important; }
            .doc-header > div { text-align: left !important; width: 100% !important; }
            .kpi-container { flex-direction: column; }
            .kpi-box { width: 100% !important; margin-bottom: 10px; }
        }
        @media print {
            .no-print { display: none !important; }
            body, html { background: white !important; margin: 0 !important; padding: 0 !important; }
            .print-sheet { box-shadow: none !important; margin: 0 !important; padding: 0 !important; max-width: 100% !important; width: 100% !important; border: none !important; }
            .table-responsive { overflow-x: visible !important; }
        }
    </style>
`;

// ---------------------------------------------------------
// 1. RELATÓRIOS FINANCEIROS (COM LEITURA DINÂMICA DE ANOS)
// ---------------------------------------------------------
App.renderizarSelecaoRelatorio = async () => {
    const div = document.getElementById('app-content');
    
    // Mostra um aviso rápido enquanto "vasculha" a base de dados
    div.innerHTML = '<p style="text-align:center; padding:20px; color:#666;">A carregar períodos disponíveis... ⏳</p>';
    
    try {
        // 🧠 A MÁGICA: Vai buscar todo o histórico financeiro
        const financeiro = await App.api('/financeiro');
        
        let anosSet = new Set();
        const anoAtual = new Date().getFullYear();
        
        // Garante que o ano atual e o próximo existem sempre (mesmo sem lançamentos)
        anosSet.add(anoAtual);
        anosSet.add(anoAtual + 1); 
        
        // Varre todos os registos à procura de anos antigos
        financeiro.forEach(f => {
            if (f.vencimento) {
                const anoVenc = parseInt(f.vencimento.split('-')[0]);
                if (!isNaN(anoVenc)) anosSet.add(anoVenc);
            }
            if (f.dataPagamento) {
                const anoPag = parseInt(f.dataPagamento.split('-')[0]);
                if (!isNaN(anoPag)) anosSet.add(anoPag);
            }
        });
        
        // Ordena os anos do mais recente para o mais antigo (ex: 2027, 2026, 2025, 2024...)
        const anosOrdenados = Array.from(anosSet).sort((a, b) => b - a);
        
        // Monta os botões de seleção
        const opAnos = anosOrdenados.map(ano => `<option value="${ano}" ${ano === anoAtual ? 'selected' : ''}>${ano}</option>`).join('');

        const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
        const opMeses = meses.map((m,i)=>`<option value="${i+1}" ${i===new Date().getMonth()?'selected':''}>${m}</option>`).join('');

        const formHTML = `
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px;">
                <span style="font-size:24px;">🗓️</span><h2 style="margin:0; color:#2c3e50;">Selecionar Período</h2>
            </div>
            <p style="color:#666; margin-bottom:20px;">Selecione o ano base para emitir os relatórios financeiros.</p>
            
            ${relSelect('Selecione o Ano Base:', 'rel-ano', opAnos, 'style="margin-bottom:25px; background:white; padding:12px; font-size:16px;"')}
            
            <button onclick="App.gerarRelatorioAnual()" style="width:100%; padding:15px; background:#8e44ad; color:white; border:none; border-radius:8px; font-weight:bold; font-size:14px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; box-shadow:0 4px 10px rgba(142,68,173,0.3);">
                📄 RELATÓRIO GERAL DO ANO TODO <span>➜</span>
            </button>
            
            <div style="text-align:center; margin:25px 0; color:#999; font-size:12px; font-weight:bold;">OU SELECIONE UM MÊS ESPECÍFICO</div>
            
            <div style="display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap;">
                ${relSelect('Mês:', 'rel-mes', opMeses, 'style="background:white; padding:12px; min-width:200px;"')}
                <button onclick="App.gerarRelatorioMensal()" style="flex:1; min-width:150px; background:#2980b9; color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer; height:43px; box-shadow:0 4px 10px rgba(41,128,185,0.3);">VER MÊS</button>
            </div>
        `;

        div.innerHTML = App.UI.card('', '', formHTML, '100%');
        
    } catch(e) {
        console.error("Erro ao carregar anos para relatório:", e);
        div.innerHTML = '<p style="color:red; text-align:center;">Erro ao ligar ao servidor para ler o histórico. Tente novamente.</p>';
    }
};

App.gerarRelatorioAnual = async () => {
    const ano = document.getElementById('rel-ano').value;
    const div = document.getElementById('app-content'); div.innerHTML = '<p style="text-align:center;">A gerar relatório anual...</p>';
    try {
        const financeiro = await App.api('/financeiro');
        const escola = await App.api('/escola') || { nome: 'ESCOLA', cnpj: '' };
        const logo = escola.foto ? `<img src="${escola.foto}" style="height:50px; object-fit:contain;">` : '';
        const dados = financeiro.filter(f => f.vencimento && f.vencimento.startsWith(ano)).sort((a,b) => new Date(a.vencimento) - new Date(b.vencimento));
        
        // 🛡️ CORREÇÃO: Pega o valor real pago (incluindo divisões e juros)
        const getVal = (f) => parseFloat(f.valorPago1 || f.valor || 0) + parseFloat(f.valorPago2 || 0);

        const totalLancado = dados.reduce((acc, c) => acc + (parseFloat(c.valor) || 0), 0);
        const totalRecebido = dados.filter(f => f.status === 'Pago').reduce((acc, c) => acc + getVal(c), 0);
        const totalPendente = dados.filter(f => f.status !== 'Pago').reduce((acc, c) => acc + (parseFloat(c.valor) || 0), 0);
        const fmt = (v) => v.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});

        div.innerHTML = `
            ${reportStyles}
            <div class="no-print" style="margin-bottom:20px; text-align:center;">
                <button onclick="App.renderizarSelecaoRelatorio()" class="btn-cancel" style="padding:10px 20px; margin-right:10px; margin-bottom:10px;">⬅ VOLTAR</button>
                <button onclick="window.print()" class="btn-primary" style="width:auto; padding:10px 20px; margin-bottom:10px;">🖨️ IMPRIMIR EXTRATO ANUAL</button>
            </div>
            
            <div class="print-sheet">
                <div class="doc-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:20px;">
                    <div style="display:flex; gap:15px; align-items:center;">
                        ${logo}
                        <div><h2 style="margin:0; text-transform:uppercase; color:#2c3e50; font-size:18px;">${App.escapeHTML(escola.nome)}</h2><div style="font-size:12px; color:#666;">CNPJ: ${App.escapeHTML(escola.cnpj)}<br>Relatório Analítico Anual</div></div>
                    </div>
                    <div style="text-align:right;">
                        <h1 style="margin:0; font-size:22px; color:#2c3e50;">EXERCÍCIO ${ano}</h1>
                        <div style="font-size:10px; color:#999;">Emissão: ${new Date().toLocaleString('pt-BR')}</div>
                    </div>
                </div>
                
                <div class="kpi-container" style="background:#fafafa; padding:20px; border-radius:8px; margin-bottom:30px; border:1px solid #eee;">
                    <div class="kpi-box"><div style="font-size:12px; font-weight:bold; color:#555;">TOTAL LANÇADO:</div><div style="font-size:18px; font-weight:bold; color:#333;">${fmt(totalLancado)}</div></div>
                    <div class="kpi-box"><div style="font-size:12px; font-weight:bold; color:green;">TOTAL RECEBIDO:</div><div style="font-size:18px; color:green;">${fmt(totalRecebido)}</div></div>
                    <div class="kpi-box"><div style="font-size:12px; font-weight:bold; color:red;">TOTAL PENDENTE:</div><div style="font-size:18px; color:red;">${fmt(totalPendente)}</div></div>
                </div>
                
                <div class="table-responsive">
                    <table style="width:100%; border-collapse:collapse; font-size:11px; color:#555; min-width:600px;">
                        <thead style="background:#f4f6f7; color:#7f8c8d; text-transform:uppercase;">
                            <tr><th style="padding:10px; text-align:left; border-bottom:1px solid #ddd;">VENCIMENTO</th><th style="padding:10px; text-align:left; border-bottom:1px solid #ddd;">ALUNO</th><th style="padding:10px; text-align:left; border-bottom:1px solid #ddd;">DESCRIÇÃO DO PRODUTO</th><th style="padding:10px; text-align:center; border-bottom:1px solid #ddd;">STATUS / FORMA</th><th style="padding:10px; text-align:right; border-bottom:1px solid #ddd;">RECEBIDO</th><th style="padding:10px; text-align:right; border-bottom:1px solid #ddd;">PENDENTE</th></tr>
                        </thead>
                        <tbody>
                            ${dados.map(f => { 
                                const isPago = f.status === 'Pago'; 
                                let textoStatus = isPago ? 'PAGO' : 'ABERTO';
                                if(isPago && f.formaPagamento) { textoStatus += `<br><span style="font-size:9px; color:#666; display:block; line-height:1.2; margin-top:2px;">${App.escapeHTML(f.formaPagamento)}${f.formaPagamento2 ? ` / ${App.escapeHTML(f.formaPagamento2)}` : ''}<br>Pago em: ${App.escapeHTML(f.dataPagamento ? f.dataPagamento.split('-').reverse().join('/') : '')}</span>`; }
                                return `<tr style="border-bottom:1px solid #eee;"><td style="padding:10px; white-space:nowrap;">${App.escapeHTML(f.vencimento.split('-').reverse().join('/'))}</td><td style="padding:10px;">${App.escapeHTML(f.alunoNome || 'Não informado')}</td><td style="padding:10px;">${App.escapeHTML(f.descricao)}</td><td style="padding:10px; text-align:center; font-weight:bold; color:${isPago ? 'green' : 'red'};">${textoStatus}</td><td style="padding:10px; text-align:right; white-space:nowrap;">${isPago ? fmt(getVal(f)) : '-'}</td><td style="padding:10px; text-align:right; white-space:nowrap;">${!isPago ? fmt(parseFloat(f.valor) || 0) : '-'}</td></tr>`; 
                            }).join('')}
                        </tbody>
                        <tfoot>
                            <tr style="background:#f9f9f9; font-weight:bold; border-top:2px solid #333;"><td colspan="4" style="padding:15px; text-align:right;">SALDO FINAL:</td><td style="padding:15px; text-align:right; color:green; white-space:nowrap;">${fmt(totalRecebido)}</td><td style="padding:15px; text-align:right; color:red; white-space:nowrap;">${fmt(totalPendente)}</td></tr>
                        </tfoot>
                    </table>
                </div>
            </div>`;
    } catch(e) { App.showToast("Erro ao gerar relatório.", "error"); }
};

App.gerarRelatorioMensal = async () => {
    const ano = document.getElementById('rel-ano').value;
    const mesIdx = parseInt(document.getElementById('rel-mes').value);
    const div = document.getElementById('app-content'); div.innerHTML = '<p style="text-align:center;">A gerar relatório mensal...</p>';
    const meses = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
    const mesNome = meses[mesIdx - 1];

    try {
        const financeiro = await App.api('/financeiro');
        const escola = await App.api('/escola') || { nome: 'ESCOLA', cnpj: '' };
        const logo = escola.foto ? `<img src="${escola.foto}" style="height:50px; object-fit:contain;">` : '';
        const dados = financeiro.filter(f => { if(!f.vencimento) return false; const d = new Date(f.vencimento + 'T00:00:00'); return d.getFullYear() == ano && (d.getMonth() + 1) == mesIdx; }).sort((a,b) => new Date(a.vencimento) - new Date(b.vencimento));
        
        // 🛡️ CORREÇÃO: Lógica segura de valores
        const getVal = (f) => parseFloat(f.valorPago1 || f.valor || 0) + parseFloat(f.valorPago2 || 0);

        const previsao = dados.reduce((acc, c) => acc + (parseFloat(c.valor) || 0), 0);
        const realizado = dados.filter(f => f.status === 'Pago').reduce((acc, c) => acc + getVal(c), 0);
        const pendente = dados.filter(f => f.status !== 'Pago').reduce((acc, c) => acc + (parseFloat(c.valor) || 0), 0);
        const fmt = (v) => v.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});

        div.innerHTML = `
            ${reportStyles}
            <div class="no-print" style="margin-bottom:20px; text-align:center;">
                <button onclick="App.renderizarSelecaoRelatorio()" class="btn-cancel" style="padding:10px 20px; margin-right:10px; margin-bottom:10px;">⬅ VOLTAR</button>
                <button onclick="window.print()" class="btn-primary" style="width:auto; padding:10px 20px; margin-bottom:10px;">🖨️ IMPRIMIR MÊS</button>
            </div>
            
            <div class="print-sheet">
                <div class="doc-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:30px;">
                    <div style="display:flex; gap:15px; align-items:center;">
                        ${logo}
                        <div><h3 style="margin:0; text-transform:uppercase; color:#2c3e50; font-size:18px;">${App.escapeHTML(escola.nome)}</h3><div style="font-size:11px; color:#666;">CNPJ: ${App.escapeHTML(escola.cnpj)}</div></div>
                    </div>
                    <div style="text-align:right;">
                        <h2 style="margin:0; font-size:20px; color:#2980b9;">${mesNome} / ${ano}</h2>
                        <div style="font-size:10px; color:#999;">Relatório Mensal<br>Emissão: ${new Date().toLocaleString('pt-BR')}</div>
                    </div>
                </div>
                
                <div class="kpi-container" style="margin-bottom:30px;">
                    <div class="kpi-box" style="background:#34495e; color:white;"><div style="font-size:10px; text-transform:uppercase; opacity:0.8;">PREVISÃO</div><div style="font-size:20px; font-weight:bold;">${fmt(previsao)}</div></div>
                    <div class="kpi-box" style="background:#27ae60; color:white;"><div style="font-size:10px; text-transform:uppercase; opacity:0.8;">REALIZADO</div><div style="font-size:20px; font-weight:bold;">${fmt(realizado)}</div></div>
                    <div class="kpi-box" style="background:#e74c3c; color:white;"><div style="font-size:10px; text-transform:uppercase; opacity:0.8;">PENDENTE</div><div style="font-size:20px; font-weight:bold;">${fmt(pendente)}</div></div>
                </div>
                
                <div class="table-responsive">
                    <table style="width:100%; border-collapse:collapse; font-size:11px; color:#555; min-width:500px;">
                        <thead style="background:#f4f6f7; color:#7f8c8d; text-transform:uppercase;">
                            <tr><th style="padding:10px; text-align:left; border-bottom:1px solid #ddd;">VENCIMENTO</th><th style="padding:10px; text-align:left; border-bottom:1px solid #ddd;">ALUNO</th><th style="padding:10px; text-align:left; border-bottom:1px solid #ddd;">DESCRIÇÃO DO PRODUTO</th><th style="padding:10px; text-align:center; border-bottom:1px solid #ddd;">STATUS / FORMA</th><th style="padding:10px; text-align:right; border-bottom:1px solid #ddd;">VALOR</th></tr>
                        </thead>
                        <tbody>
                            ${dados.map(f => { 
                                const isPago = f.status === 'Pago'; 
                                let textoStatus = isPago ? 'PAGO' : 'PENDENTE';
                                if(isPago && f.formaPagamento) { textoStatus += `<br><span style="font-size:9px; color:#666; display:block; line-height:1.2; margin-top:2px;">${App.escapeHTML(f.formaPagamento)}${f.formaPagamento2 ? ` / ${App.escapeHTML(f.formaPagamento2)}` : ''}<br>Pago em: ${App.escapeHTML(f.dataPagamento ? f.dataPagamento.split('-').reverse().join('/') : '')}</span>`; }
                                return `<tr style="border-bottom:1px solid #eee;"><td style="padding:10px; white-space:nowrap;">${App.escapeHTML(f.vencimento.split('-').reverse().join('/'))}</td><td style="padding:10px;">${App.escapeHTML(f.alunoNome || 'Não informado')}</td><td style="padding:10px;">${App.escapeHTML(f.descricao)}</td><td style="padding:10px; text-align:center; font-weight:bold; color:${isPago ? 'green' : 'red'};">${textoStatus}</td><td style="padding:10px; text-align:right; white-space:nowrap;">${fmt(isPago ? getVal(f) : parseFloat(f.valor) || 0)}</td></tr>`; 
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
    } catch(e) { App.showToast("Erro ao gerar relatório mensal.", "error"); }
};

// ---------------------------------------------------------
// 2. SUPER DOSSIÊ EXECUTIVO (BI)
// ---------------------------------------------------------
App.renderizarDossie = () => {
    App.setTitulo("Dossiê Executivo BI");
    const div = document.getElementById('app-content');
    const anoAtual = new Date().getFullYear();
    const mesAtual = new Date().getMonth() + 1;
    
    const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const opMeses = meses.map((m,i)=>`<option value="${i+1}" ${i+1===mesAtual?'selected':''}>${m}</option>`).join('');

    const formDossie = `
        <div style="text-align:center;">
            <div style="font-size:48px; margin-bottom:15px;">📊</div>
            <h2 style="margin:0 0 10px 0; color:#2c3e50;">Dossiê Executivo (BI)</h2>
            <p style="color:#666; margin-bottom:25px;">Selecione o período de referência para gerar a análise profunda da sua escola.</p>
            
            <div style="display:flex; gap:15px; margin-bottom:25px; text-align:left; flex-wrap:wrap;">
                ${relSelect('Mês Vigente:', 'dossie-mes', opMeses, 'style="padding:12px;"')}
                ${relCol('Ano:', 'dossie-ano', 'number', anoAtual, 'style="padding:12px; text-align:center;"')}
            </div>
            
            <button onclick="App.gerarDossie()" class="btn-primary" style="padding:15px; font-size:16px; width:100%; justify-content:center;">GERAR DOSSIÊ ➜</button>
        </div>
    `;
    
    div.innerHTML = App.UI.card('', '', formDossie, '500px');
};

App.gerarDossie = async () => {
    const ano = document.getElementById('dossie-ano').value;
    const mesIdx = parseInt(document.getElementById('dossie-mes').value);
    const nomeMes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][mesIdx-1];
    
    const div = document.getElementById('app-content'); 
    div.innerHTML = '<p style="text-align:center; padding:20px;">Processando Inteligência de Negócios... ⏳</p>';
    document.body.style.cursor = 'wait';
    
    try {
        const [alunos, turmas, cursos, financeiro, escola] = await Promise.all([
            App.api('/alunos'), App.api('/turmas'), App.api('/cursos'), 
            App.api('/financeiro'), App.api('/escola')
        ]);
        
        const dataHoje = new Date();
        const fmt = (v) => parseFloat(v || 0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
        const getVal = (f) => parseFloat(f.valorPago1 || f.valor) + parseFloat(f.valorPago2 || 0);
        const isVenda = (f) => (f.descricao && f.descricao.toLowerCase().includes('venda')) || (f.idCarne && f.idCarne.includes('VENDA'));

        const finAno = financeiro.filter(f => f.vencimento && f.vencimento.startsWith(ano) && f.tipo === 'Receita');
        const finMes = finAno.filter(f => parseInt(f.vencimento.split('-')[1]) === mesIdx);
        
        // 🛡️ CORREÇÃO: || 0 inserido para blindar contra falhas e NaN
        const entradaBrutaAno = finAno.filter(f => f.status === 'Pago').reduce((a, c) => a + getVal(c), 0);
        const esperadoAnoMensalidade = finAno.filter(f => !isVenda(f)).reduce((a, c) => a + (parseFloat(c.valor) || 0), 0);
        const esperadoMesMensalidade = finMes.filter(f => !isVenda(f)).reduce((a, c) => a + (parseFloat(c.valor) || 0), 0);
        const inadimplenciaGeral = financeiro.filter(f => f.status === 'Pendente' && f.tipo === 'Receita' && new Date(f.vencimento + 'T00:00:00') < dataHoje).reduce((a, c) => a + (parseFloat(c.valor) || 0), 0);
        
        const entradaMesMensalidade = finMes.filter(f => f.status === 'Pago' && !isVenda(f)).reduce((a, c) => a + getVal(c), 0);
        const entradaMesVenda = finMes.filter(f => f.status === 'Pago' && isVenda(f)).reduce((a, c) => a + getVal(c), 0);
        const entradaMesTotal = entradaMesMensalidade + entradaMesVenda;

        const formasMensalidade = {}; const formasVenda = {};
        finMes.filter(f => f.status === 'Pago').forEach(p => {
            const target = isVenda(p) ? formasVenda : formasMensalidade;
            const fp1 = p.formaPagamento || 'Outros'; const fp2 = p.formaPagamento2;
            target[fp1] = (target[fp1] || 0) + parseFloat(p.valorPago1 || p.valor);
            if(fp2) target[fp2] = (target[fp2] || 0) + parseFloat(p.valorPago2 || 0);
        });

        let linhasHistorico = ''; let acumuladoHistorico = 0;
        for(let i = 1; i <= mesIdx; i++) {
            const fM = finAno.filter(f => parseInt(f.vencimento.split('-')[1]) === i && f.status === 'Pago');
            const vM = fM.filter(f => !isVenda(f)).reduce((a,c) => a+getVal(c), 0);
            const vV = fM.filter(f => isVenda(f)).reduce((a,c) => a+getVal(c), 0);
            const tot = vM + vV;
            acumuladoHistorico += tot;
            linhasHistorico += `<tr><td>${['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][i-1]}</td><td style="text-align:right; color:#2980b9; white-space:nowrap;">${fmt(vM)}</td><td style="text-align:right; color:#8e44ad; white-space:nowrap;">${fmt(vV)}</td><td style="text-align:right; font-weight:bold; white-space:nowrap;">${fmt(tot)}</td></tr>`;
        }

        const alunosTurma = {}; turmas.forEach(t => alunosTurma[t.nome] = 0);
        const alunosCurso = {}; cursos.forEach(c => alunosCurso[c.nome] = 0);
        alunos.forEach(a => { 
            if(a.turma && alunosTurma[a.turma] !== undefined) alunosTurma[a.turma]++; 
            if(a.curso && alunosCurso[a.curso] !== undefined) alunosCurso[a.curso]++;
        });
        
        const masc = alunos.filter(a => a.sexo === 'Masculino').length;
        const fem = alunos.filter(a => a.sexo === 'Feminino').length;
        const totalSexo = masc + fem || 1;
        const percMasc = ((masc / totalSexo) * 100).toFixed(1);
        const percFem = ((fem / totalSexo) * 100).toFixed(1);

        const listInad = financeiro.filter(f => f.status === 'Pendente' && f.tipo === 'Receita' && new Date(f.vencimento + 'T00:00:00') < dataHoje);
        let linhasInad = '';
        listInad.forEach(f => {
            const cobrado = f.cobradoZap ? '<span style="color:#27ae60;font-weight:bold;">✅ Sim</span>' : '<span style="color:#e74c3c;font-weight:bold;">❌ Não</span>';
            linhasInad += `<tr><td>${App.escapeHTML(f.alunoNome || 'Desconhecido')}</td><td>${App.escapeHTML(f.descricao)}</td><td style="color:#c0392b; font-weight:bold; white-space:nowrap;">${fmt(parseFloat(f.valor))}</td><td style="white-space:nowrap;">${App.escapeHTML(f.vencimento.split('-').reverse().join('/'))}</td><td style="text-align:center;">${cobrado}</td></tr>`;
        });

        const logo = escola.foto ? `<img src="${escola.foto}" style="height:50px; object-fit:contain;">` : '';

        div.innerHTML = `
            ${reportStyles}
            <style>
                .d-kpi { flex:1; background:#fff; padding:15px; border-radius:8px; border:1px solid #ddd; text-align:center; min-width:140px; }
                .d-kpi-tit { font-size:10px; color:#777; text-transform:uppercase; margin-bottom:5px; font-weight:bold; line-height:1.2; }
                .d-kpi-val { font-size:18px; font-weight:bold; }
                .d-box { background:#fff; padding:20px; border-radius:8px; border:1px solid #eee; margin-bottom:20px; overflow: hidden; }
                .d-table { width:100%; border-collapse:collapse; font-size:12px; }
                .d-table th { background:#f4f6f7; padding:10px; text-align:left; border-bottom:2px solid #ddd; }
                .d-table td { padding:10px; border-bottom:1px solid #eee; }
                .list-card { background:#f8f9fa; border:1px solid #e9ecef; padding:10px 15px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
                .list-card span:first-child { font-size:13px; font-weight:500; color:#333; }
                .badge-curso { background:#3498db; color:white; padding:4px 10px; border-radius:12px; font-size:11px; font-weight:bold; }
                .badge-turma { background:#2ecc71; color:white; padding:4px 10px; border-radius:12px; font-size:11px; font-weight:bold; }
                .flex-container { display: flex; flex-wrap: wrap; gap: 30px; align-items: center; justify-content: space-between; }
                .flex-item { flex: 1; min-width: 300px; }
                @media (max-width: 768px) {
                    .d-kpi { min-width: 100%; margin-bottom: 10px; }
                    .flex-item { min-width: 100%; }
                    .d-box { padding: 10px; }
                }
                @media print { .d-box { page-break-inside: avoid; border:1px solid #000; } }
            </style>

            <div class="no-print" style="text-align:center; margin-bottom:20px;">
                <button onclick="App.renderizarDossie()" class="btn-cancel" style="margin-right:10px; margin-bottom:10px;">⬅ VOLTAR</button>
                <button onclick="window.print()" class="btn-primary" style="width:auto; padding:10px 20px; margin-bottom:10px;">🖨️ IMPRIMIR DOSSIÊ</button>
            </div>
            
            <div class="print-sheet">
                <div class="doc-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom: 2px solid #2c3e50; padding-bottom: 15px; margin-bottom:20px; flex-wrap:wrap; gap:15px;">
                    <div style="display:flex; align-items:center; gap:20px;">
                        ${logo} <div><h2 style="margin:0; text-transform:uppercase; color:#2c3e50; font-size:18px;">${App.escapeHTML(escola.nome)}</h2><div style="font-size:12px; color:#666;">CNPJ: ${App.escapeHTML(escola.cnpj)}</div></div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-weight:bold; font-size:16px;">DOSSIÊ DE GESTÃO - ${nomeMes}/${ano}</div>
                        <div style="font-size:11px; color:#666;">Emissão: ${dataHoje.toLocaleDateString('pt-BR')}</div>
                    </div>
                </div>
                
                <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px;">
                    <div class="d-kpi" style="border-bottom:3px solid #34495e;">
                        <div class="d-kpi-tit">Esperado do Ano<br>(Só Mensalidades)</div>
                        <div class="d-kpi-val" style="color:#34495e;">${fmt(esperadoAnoMensalidade)}</div>
                    </div>
                    <div class="d-kpi" style="border-bottom:3px solid #f39c12;">
                        <div class="d-kpi-tit">Esperado no Mês Vigente<br>(Mensalidades)</div>
                        <div class="d-kpi-val" style="color:#f39c12;">${fmt(esperadoMesMensalidade)}</div>
                    </div>
                    <div class="d-kpi" style="border-bottom:3px solid #27ae60;">
                        <div class="d-kpi-tit">Entrada Bruta Ano<br>(Mensalidades + Vendas)</div>
                        <div class="d-kpi-val" style="color:#27ae60;">${fmt(entradaBrutaAno)}</div>
                    </div>
                    <div class="d-kpi" style="border-bottom:3px solid #3498db;">
                        <div class="d-kpi-tit">Entrada Mês Vigente<br>(Mensalidades + Vendas)</div>
                        <div class="d-kpi-val" style="color:#3498db;">${fmt(entradaMesTotal)}</div>
                    </div>
                    <div class="d-kpi" style="border-bottom:3px solid #e74c3c;">
                        <div class="d-kpi-tit">Total Inadimplência<br>(Geral)</div>
                        <div class="d-kpi-val" style="color:#e74c3c;">${fmt(inadimplenciaGeral)}</div>
                    </div>
                </div>

                <div class="d-box">
                    <h3 style="margin-top:0; color:#2c3e50; border-bottom:1px solid #eee; padding-bottom:10px; font-size:15px;">📊 Resultados Financeiros: ${nomeMes} / ${ano}</h3>
                    <div class="flex-container">
                        <div class="flex-item">
                            <table class="d-table">
                                <tr><td><strong>Entradas em Mensalidades:</strong></td><td style="text-align:right; font-size:16px; color:#2980b9; font-weight:bold; white-space:nowrap;">${fmt(entradaMesMensalidade)}</td></tr>
                                <tr><td><strong>Entradas em Vendas:</strong></td><td style="text-align:right; font-size:16px; color:#8e44ad; font-weight:bold; white-space:nowrap;">${fmt(entradaMesVenda)}</td></tr>
                                <tr style="background:#f9f9f9;"><td><strong>TOTAL ARRECADADO NO MÊS:</strong></td><td style="text-align:right; font-size:18px; color:#27ae60; font-weight:bold; white-space:nowrap;">${fmt(entradaMesTotal)}</td></tr>
                            </table>
                        </div>
                        <div class="flex-item" style="display:flex; justify-content:space-evenly; gap:10px; align-items:center;">
                            <div style="text-align:center;">
                                <div style="font-size:10px; font-weight:bold; color:#777; margin-bottom:5px;">FORMAS (MENSALIDADES)</div>
                                <div style="position: relative; width: 120px; height: 120px; margin: 0 auto;"><canvas id="grafMensalidade"></canvas></div>
                            </div>
                            <div style="text-align:center;">
                                <div style="font-size:10px; font-weight:bold; color:#777; margin-bottom:5px;">FORMAS (VENDAS)</div>
                                <div style="position: relative; width: 120px; height: 120px; margin: 0 auto;"><canvas id="grafVenda"></canvas></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="d-box">
                    <h3 style="margin-top:0; color:#2c3e50; border-bottom:1px solid #eee; padding-bottom:10px; font-size:15px;">📈 Histórico de Entradas (${ano})</h3>
                    <div class="table-responsive">
                        <table class="d-table" style="min-width:400px;">
                            <thead><tr><th>Mês</th><th style="text-align:right;">Mensalidades</th><th style="text-align:right;">Vendas</th><th style="text-align:right;">Total do Mês</th></tr></thead>
                            <tbody>${linhasHistorico}</tbody>
                            <tfoot><tr style="background:#e8f6f3; font-weight:bold; font-size:13px;"><td colspan="3" style="text-align:right;">TOTAL BRUTO (JAN ATÉ ${nomeMes.toUpperCase()}):</td><td style="text-align:right; color:#27ae60; white-space:nowrap;">${fmt(acumuladoHistorico)}</td></tr></tfoot>
                        </table>
                    </div>
                </div>

                <div class="d-box">
                    <div class="flex-container">
                        <div class="flex-item">
                            <h3 style="margin-top:0; color:#2c3e50; border-bottom:1px solid #eee; padding-bottom:10px; font-size:15px;">📚 Cursos (${cursos.length})</h3>
                            <div>${cursos.length ? cursos.map(c => `<div class="list-card"><span>${App.escapeHTML(c.nome)}</span><span class="badge-curso">${alunosCurso[c.nome] || 0} alunos</span></div>`).join('') : '<div style="color:#999; font-size:12px;">Nenhum curso.</div>'}</div>
                        </div>
                        <div class="flex-item">
                            <h3 style="margin-top:0; color:#2c3e50; border-bottom:1px solid #eee; padding-bottom:10px; font-size:15px;">🏫 Turmas (${turmas.length})</h3>
                            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:10px;">${turmas.length ? turmas.map(t => `<div class="list-card" style="margin-bottom:0;"><span>${App.escapeHTML(t.nome)}</span><span class="badge-turma">${alunosTurma[t.nome] || 0} alunos</span></div>`).join('') : '<div style="color:#999; font-size:12px;">Nenhuma turma.</div>'}</div>
                        </div>
                    </div>
                </div>

                <div class="d-box">
                    <h3 style="margin-top:0; color:#2c3e50; border-bottom:1px solid #eee; padding-bottom:10px; font-size:15px;">👥 Demografia dos Alunos</h3>
                    <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-around; gap:20px;">
                        <div style="background:#f4f6f7; padding:20px; border-radius:8px; text-align:center; border:1px solid #e9ecef; min-width: 120px;"><div style="display:flex; flex-direction:column; gap:10px;">
                            <div style="background:#f4f6f7; padding:15px; border-radius:8px; text-align:center; border:1px solid #e9ecef; min-width: 140px;">
                                <div style="font-size:28px; font-weight:bold; color:#27ae60; line-height:1; margin-bottom:5px;">${alunos.filter(a => !a.status || a.status === 'Ativo').length}</div>
                                <div style="font-size:10px; font-weight:bold; color:#7f8c8d; text-transform:uppercase;">🟢 Ativos</div>
                            </div>
                            <div style="background:#fdf2f2; padding:10px; border-radius:8px; text-align:center; border:1px solid #f5b7b1; min-width: 140px;">
                                <div style="font-size:20px; font-weight:bold; color:#e74c3c; line-height:1; margin-bottom:5px;">${alunos.filter(a => a.status && a.status !== 'Ativo').length}</div>
                                <div style="font-size:10px; font-weight:bold; color:#c0392b; text-transform:uppercase;">🔴 Inativos (Evasão)</div>
                            </div>
                        </div>
                        <div style="position: relative; width: 140px; height: 140px; margin: 0 auto;"><canvas id="grafDemografia"></canvas></div>
                        <div style="display:flex; flex-direction:column; gap:10px; min-width:180px;">
                            <div style="background:#ebf5fb; border-left:4px solid #3498db; padding:10px; border-radius:4px; display:flex; justify-content:space-between; align-items:center;"><div><div style="font-size:11px; color:#555; text-transform:uppercase; font-weight:bold;">👨 Masculino</div><div style="font-size:16px; font-weight:bold; color:#3498db;">${masc}</div></div><div style="font-size:14px; color:#999; font-weight:bold;">${percMasc}%</div></div>
                            <div style="background:#fdedec; border-left:4px solid #e74c3c; padding:10px; border-radius:4px; display:flex; justify-content:space-between; align-items:center;"><div><div style="font-size:11px; color:#555; text-transform:uppercase; font-weight:bold;">👩 Feminino</div><div style="font-size:16px; font-weight:bold; color:#e74c3c;">${fem}</div></div><div style="font-size:14px; color:#999; font-weight:bold;">${percFem}%</div></div>
                        </div>
                    </div>
                </div>

                <div class="d-box">
                    <h3 style="margin-top:0; color:#e74c3c; border-bottom:1px solid #eee; padding-bottom:10px; font-size:15px;">⚠️ Relatório Analítico de Inadimplência</h3>
                    <div class="table-responsive">
                        <table class="d-table" style="min-width:600px;">
                            <thead><tr><th>Nome do Aluno</th><th>Descrição (Mensalidade)</th><th>Valor</th><th>Vencimento</th><th style="text-align:center;">Cobrado no WhatsApp?</th></tr></thead>
                            <tbody>${linhasInad || '<tr><td colspan="5" style="text-align:center; color:#999; padding:20px;">Nenhum inadimplente! 🎉</td></tr>'}</tbody>
                        </table>
                    </div>
                </div>
            </div>`;

        setTimeout(() => {
            const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '65%' };
            const bgColors = ['#3498db', '#9b59b6', '#f1c40f', '#2ecc71', '#e67e22', '#95a5a6'];

            if(Object.keys(formasMensalidade).length > 0 && document.getElementById('grafMensalidade')) { new Chart(document.getElementById('grafMensalidade'), { type: 'doughnut', data: { labels: Object.keys(formasMensalidade), datasets: [{ data: Object.values(formasMensalidade), backgroundColor: bgColors, borderWidth: 0 }] }, options: chartOptions }); }
            if(Object.keys(formasVenda).length > 0 && document.getElementById('grafVenda')) { new Chart(document.getElementById('grafVenda'), { type: 'doughnut', data: { labels: Object.keys(formasVenda), datasets: [{ data: Object.values(formasVenda), backgroundColor: bgColors, borderWidth: 0 }] }, options: chartOptions }); }
            if(alunos.length > 0 && document.getElementById('grafDemografia')) { new Chart(document.getElementById('grafDemografia'), { type: 'doughnut', data: { labels: ['Masculino','Feminino'], datasets: [{ data: [masc, fem], backgroundColor: ['#3498db', '#e74c3c'], borderWidth: 0 }] }, options: chartOptions }); }
        }, 300);

    } catch(e) { App.showToast("Erro ao gerar dossiê.", "error"); } finally { document.body.style.cursor = 'default'; }
};

// ---------------------------------------------------------
// 3. FICHA DE MATRÍCULA
// ---------------------------------------------------------
App.gerarFichaSetup = async () => {
    App.setTitulo("Ficha de Matrícula");
    const div = document.getElementById('app-content'); div.innerHTML = '<p style="text-align:center;">Carregando...</p>';
    try {
        const alunos = await App.api('/alunos');
        const alunosAtivos = alunos.filter(a => !a.status || a.status === 'Ativo');
        const opAlunos = `<option value="">-- Selecione o Aluno --</option>` + alunosAtivos.map(a => `<option value="${a.id}">${App.escapeHTML(a.nome)}</option>`).join('');
        
        const formFicha = `
            <div style="display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap;">
                ${relSelect('Selecione o Aluno:', 'ficha-aluno', opAlunos)}
                <button onclick="App.gerarFichaImprimir()" class="btn-primary" style="height:41px; padding:0 25px; margin-bottom:5px;">GERAR FICHA</button>
            </div>
        `;
        
        div.innerHTML = App.UI.card('📄 Imprimir Ficha de Matrícula', '', formFicha, '100%') + `<div id="ficha-area" style="margin-top:30px;"></div>`;
    } catch(e) { div.innerHTML = "Erro ao carregar os alunos."; }
};

App.gerarFichaImprimir = async () => {
    const idAluno = document.getElementById('ficha-aluno').value;
    if(!idAluno) return App.showToast("Por favor, selecione um aluno.", "warning");
    
    const divArea = document.getElementById('ficha-area'); 
    divArea.innerHTML = '<p style="text-align:center;">Gerando ficha... ⏳</p>';
    document.body.style.cursor = 'wait';
    
    try {
        const [aluno, escola, financeiro, turmas] = await Promise.all([ 
            App.api(`/alunos/${idAluno}`), 
            App.api('/escola'),
            App.api('/financeiro'),
            App.api('/turmas')
        ]);
        
        const logo = escola.foto ? `<img src="${escola.foto}" style="height:60px; object-fit:contain;">` : '';
        const turmaObj = turmas.find(t => t.nome === aluno.turma) || { dia: '-', horario: '-' };
        
        // 💰 NOVA AUDITORIA FINANCEIRA: SEPARA CURSO E LOJA
        const financeiroAluno = financeiro.filter(f => f.idAluno === idAluno && f.tipo === 'Receita');
        const isVenda = (f) => (f.descricao && f.descricao.toLowerCase().includes('venda')) || (f.idCarne && f.idCarne.includes('VENDA'));
        
        const totalCurso = financeiroAluno.filter(f => !isVenda(f)).reduce((acc, p) => acc + (parseFloat(p.valor) || 0), 0);
        const totalLoja = financeiroAluno.filter(f => isVenda(f)).reduce((acc, p) => acc + (parseFloat(p.valor) || 0), 0);
        const totalGeral = totalCurso + totalLoja;
        
        const fmt = (val) => `R$ ${val.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;

        // 👤 MÓDULO DO RESPONSÁVEL LEGAL
        let htmlResponsavel = '';
        if (aluno.resp_nome && aluno.resp_nome.trim() !== '') {
            htmlResponsavel = `
                <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 20px; color:#d35400; font-size:15px;">👤 DADOS DO RESPONSÁVEL LEGAL (Menor de Idade)</h3>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px; font-size:13px; background:#fff3e0; padding:15px; border-radius:5px; border:1px dashed #e67e22;">
                    <div><b>Nome do Responsável:</b> ${App.escapeHTML(aluno.resp_nome)}</div>
                    <div><b>Grau Parentesco:</b> ${App.escapeHTML(aluno.resp_parentesco || '-')}</div>
                    <div><b>CPF do Respons.:</b> ${App.escapeHTML(aluno.resp_cpf || '-')}</div>
                    <div><b>WhatsApp:</b> ${App.escapeHTML(aluno.resp_zap || '-')}</div>
                </div>
            `;
        }
        
        divArea.innerHTML = `
            ${reportStyles}
            <div class="no-print" style="text-align:center; margin-bottom:20px;">
                <button onclick="window.print()" class="btn-primary" style="width:auto; padding:10px 20px;">🖨️ IMPRIMIR FICHA</button>
            </div>
            
            <div class="print-sheet">
                <div class="doc-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:20px;">
                    <div style="display:flex; align-items:center; gap:20px;">${logo}<div><h2 style="margin:0; text-transform:uppercase; font-size:18px;">${App.escapeHTML(escola.nome)}</h2><div style="font-size:12px;">CNPJ: ${App.escapeHTML(escola.cnpj)}</div></div></div>
                    <div style="text-align:right;"><div><b>FICHA DE MATRÍCULA</b></div><div style="font-size:10px; color:#999;">Emissão: ${new Date().toLocaleDateString('pt-BR')}</div></div>
                </div>
                <div style="border: 1px solid #ccc; padding: 20px; margin-top: 20px; background:#fafafa;">
                    
                    <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 0; color:#2c3e50; font-size:15px;">1. DADOS DO ALUNO</h3>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px; font-size:13px;">
                        <div><b>Nome:</b> ${App.escapeHTML(aluno.nome || '-')}</div>
                        <div><b>Data Nasc:</b> ${App.escapeHTML(aluno.nascimento ? aluno.nascimento.split('-').reverse().join('/') : '-')}</div>
                        <div><b>CPF:</b> ${App.escapeHTML(aluno.cpf || '-')}</div>
                        <div><b>RG:</b> ${App.escapeHTML(aluno.rg || '-')}</div>
                        <div><b>Sexo:</b> ${App.escapeHTML(aluno.sexo || '-')}</div>
                        <div><b>WhatsApp:</b> ${App.escapeHTML(aluno.whatsapp || '-')}</div>
                    </div>

                    ${htmlResponsavel}

                    <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 20px; color:#2c3e50; font-size:15px;">2. CURSO E MATRÍCULA</h3>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 10px; font-size:13px;">
                        <div><b>Curso:</b> ${App.escapeHTML(aluno.curso || '-')}</div>
                        <div><b>Turma:</b> ${App.escapeHTML(aluno.turma || '-')}</div>
                        <div><b>Dias de Aula:</b> ${App.escapeHTML(turmaObj.dia || '-')}</div>
                        <div><b>Horário:</b> ${App.escapeHTML(turmaObj.horario || '-')}</div>
                    </div>

                    <div style="grid-column: 1 / -1; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 5px; overflow: hidden;">
                        <div style="background: #2c3e50; color: white; padding: 6px 10px; font-weight: bold; font-size: 12px; text-transform: uppercase;">
                            📊 Auditoria Financeira do Aluno
                        </div>
                        <div style="display: flex; background: #fafafa; text-align: center; flex-wrap: wrap;">
                            <div style="flex: 1; padding: 10px; border-right: 1px solid #eee; min-width: 100px;">
                                <div style="font-size: 10px; color: #666; text-transform: uppercase; font-weight:bold;">Investimento do Curso</div>
                                <div style="font-size: 14px; font-weight: bold; color: #2980b9;">${totalCurso > 0 ? fmt(totalCurso) : '-'}</div>
                            </div>
                            <div style="flex: 1; padding: 10px; border-right: 1px solid #eee; min-width: 100px;">
                                <div style="font-size: 10px; color: #666; text-transform: uppercase; font-weight:bold;">Materiais / Lojinha</div>
                                <div style="font-size: 14px; font-weight: bold; color: #8e44ad;">${totalLoja > 0 ? fmt(totalLoja) : '-'}</div>
                            </div>
                            <div style="flex: 1; padding: 10px; background: #ffffd0; min-width: 100px;">
                                <div style="font-size: 10px; color: #d35400; text-transform: uppercase; font-weight: bold;">Investimento Total</div>
                                <div style="font-size: 15px; font-weight: bold; color: #d35400;">${totalGeral > 0 ? fmt(totalGeral) : 'Isento'}</div>
                            </div>
                        </div>
                    </div>

                    <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; color:#2c3e50; font-size:15px;">3. ENDEREÇO</h3>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px; font-size:13px;">
                        <div style="grid-column: 1 / -1;"><b>Logradouro:</b> ${App.escapeHTML(aluno.rua || '-')}, ${App.escapeHTML(aluno.numero || '-')}</div>
                        <div><b>Bairro:</b> ${App.escapeHTML(aluno.bairro || '-')}</div>
                        <div><b>Cidade/UF:</b> ${App.escapeHTML(aluno.cidade || '-')}/${App.escapeHTML(aluno.estado || '-')}</div>
                    </div>
                </div>
                <div style="margin-top:50px; display:flex; justify-content:space-between; text-align:center; flex-wrap:wrap; gap:30px;">
                    <div style="flex:1; min-width:200px; border-top:1px solid #000; padding-top:5px; font-weight:bold; font-size:12px;">Assinatura do Aluno${aluno.resp_nome ? ' / Responsável Legal' : ''}</div>
                    <div style="flex:1; min-width:200px; border-top:1px solid #000; padding-top:5px; font-weight:bold; font-size:12px;">Direção da Escola</div>
                </div>
            </div>
        `;
    } catch(e) { App.showToast("Erro ao gerar ficha. O aluno não foi encontrado.", "error"); }
    finally { document.body.style.cursor = 'default'; }
};

// =========================================================
// 🎓 4. FÁBRICA DE DOCUMENTOS (CONTRATOS E DECLARAÇÕES)
// =========================================================
App.renderizarGeradorDocumentos = async () => {
    App.setTitulo("Gerador de Documentos");
    const div = document.getElementById('app-content');
    div.innerHTML = '<p style="text-align:center; padding:20px; color:#666;">Carregando base de alunos...</p>';
    
    try {
        const alunos = await App.api('/alunos');
        const alunosAtivos = alunos.filter(a => !a.status || a.status === 'Ativo');
        const alunosOptions = alunosAtivos.length > 0 
            ? `<option value="">-- Selecione o Aluno --</option>` + alunosAtivos.map(a => `<option value="${a.id}">${App.escapeHTML(a.nome)} (Turma: ${App.escapeHTML(a.turma || '-')})</option>`).join('')
            : `<option value="">Nenhum aluno ativo encontrado</option>`;

        const formHTML = `
            <div class="card" style="max-width: 600px; margin: 0 auto; border-top: 4px solid var(--accent);">
                <h3 style="color:var(--card-text); margin-top:0; border-bottom:1px solid #eee; padding-bottom:15px; display:flex; align-items:center; gap:10px; font-size:18px;">
                    🎓 Emissão de Documentos Oficiais
                </h3>
                <p style="font-size:13px; color:#666; margin-bottom:25px;">O sistema irá preencher os dados automaticamente para impressão profissional.</p>
                
                <div style="display:flex; flex-direction:column; gap:20px;">
                    <div style="flex:1; min-width:150px; text-align:left;">
                        <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">1. Selecione o Aluno:</label>
                        <select id="doc-aluno" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; font-weight:bold; cursor:pointer;">${alunosOptions}</select>
                    </div>
                    
                    <div style="flex:1; min-width:150px; text-align:left;">
                        <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">2. Qual documento deseja emitir?</label>
                        <select id="doc-tipo" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; font-weight:bold; cursor:pointer;">
                            <option value="declaracao">📝 Declaração de Matrícula / Frequência</option>
                            <option value="contrato">📄 Contrato de Prestação de Serviços</option>
                            <option value="certificado">🎓 Certificado de Conclusão de Curso (Diploma)</option>
                        </select>
                    </div>
                </div>

                <div style="margin-top:30px; display:flex; gap:10px;">
                    <button class="btn-primary" style="flex:1; padding:15px; font-size:14px; box-shadow:0 4px 10px rgba(52, 152, 219, 0.3); justify-content:center;" onclick="App.gerarDocumentoPrint()">🖨️ GERAR DOCUMENTO</button>
                </div>
            </div>
            
            <div id="doc-area" style="margin-top: 30px;"></div>
        `;
        div.innerHTML = formHTML;
    } catch (e) {
        div.innerHTML = '<p>Erro ao carregar dados.</p>';
    }
};

App.gerarDocumentoPrint = async () => {
    const idAluno = document.getElementById('doc-aluno').value;
    const tipo = document.getElementById('doc-tipo').value;
    
    if (!idAluno) return App.showToast("Selecione um aluno na lista.", "warning");

    const btn = document.querySelector('button[onclick="App.gerarDocumentoPrint()"]');
    const txtOriginal = btn.innerText;
    btn.innerText = "A Processar... ⏳"; btn.disabled = true;
    document.body.style.cursor = 'wait';

    try {
        const aluno = await App.api(`/alunos/${idAluno}`);
        const escola = await App.api('/escola') || { nome: 'A INSTITUIÇÃO', cnpj: '00.000.000/0000-00' };

        // 🛡️ CORREÇÃO: Usa a área delimitada em vez de jogar direto no Body
        const printContainer = document.getElementById('doc-area');
        printContainer.innerHTML = '<p style="text-align:center;">Gerando Layout... ⏳</p>';

        const dataHoje = new Date().toLocaleDateString('pt-BR');
        const logo = escola.foto ? `<img src="${escola.foto}" style="height:60px; object-fit:contain;">` : '';
        
        const docHeader = `
            <div class="doc-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:30px; flex-wrap:wrap; gap:15px;">
                <div style="display:flex; align-items:center; gap:20px;">${logo}<div><h2 style="margin:0; text-transform:uppercase; font-size:18px;">${App.escapeHTML(escola.nome)}</h2><div style="font-size:12px;">CNPJ: ${App.escapeHTML(escola.cnpj)}</div></div></div>
                <div style="text-align:right;"><div><b>${tipo === 'contrato' ? 'CONTRATO DE SERVIÇOS' : 'DECLARAÇÃO'}</b></div><div style="font-size:10px; color:#999;">Emissão: ${dataHoje}</div></div>
            </div>`;
            
        const painelImpressao = `
            <div class="no-print" style="text-align:center; margin-bottom:20px;">
                <button onclick="window.print()" class="btn-primary" style="width:auto; padding:10px 20px;">🖨️ IMPRIMIR ESTE DOCUMENTO</button>
            </div>
        `;

        if (tipo === 'contrato') {
            const valorFmt = parseFloat(aluno.valorMensalidade || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2});
            
            printContainer.innerHTML = `
                ${reportStyles}
                ${painelImpressao}
                <div class="print-sheet" style="font-family: Arial, sans-serif; color: #000; line-height: 1.6;">
                    ${docHeader}
                    
                    <p style="text-align: justify; margin-top: 20px; font-size:14px;">
                        Pelo presente instrumento particular, de um lado <b>${App.escapeHTML(escola.nome || 'A INSTITUIÇÃO')}</b>, 
                        inscrita no CNPJ sob o nº <b>${App.escapeHTML(escola.cnpj || '00.000.000/0000-00')}</b>, doravante denominada <b>CONTRATADA</b>, e de outro lado 
                        <b>${App.escapeHTML(aluno.nome)}</b>, portador(a) do CPF nº <b>${App.escapeHTML(aluno.cpf || '___________')}</b> e RG nº <b>${App.escapeHTML(aluno.rg || '___________')}</b>, 
                        residente e domiciliado(a) na ${App.escapeHTML(aluno.rua || '')}, ${App.escapeHTML(aluno.numero || '')} - ${App.escapeHTML(aluno.bairro || '')}, 
                        ${App.escapeHTML(aluno.cidade || '')}/${App.escapeHTML(aluno.estado || '')}, doravante denominado(a) <b>CONTRATANTE</b>.
                    </p>

                    <h4 style="margin-top:25px; margin-bottom: 5px;">CLÁUSULA PRIMEIRA - DO OBJETO</h4>
                    <p style="text-align: justify; margin-top:0; font-size:14px;">O presente contrato tem como objeto a prestação de serviços educacionais por parte da CONTRATADA ao CONTRATANTE, referente ao curso de <b>${App.escapeHTML(aluno.curso || 'Não especificado')}</b>, a ser ministrado na turma <b>${App.escapeHTML(aluno.turma || 'Não especificada')}</b>.</p>

                    <h4 style="margin-top:25px; margin-bottom: 5px;">CLÁUSULA SEGUNDA - DOS VALORES E FORMA DE PAGAMENTO</h4>
                    <p style="text-align: justify; margin-top:0; font-size:14px;">Pelos serviços educacionais prestados, o CONTRATANTE pagará à CONTRATADA a mensalidade no valor estipulado de <b>R$ ${valorFmt}</b>, com vencimento programado para todo dia <b>${App.escapeHTML(aluno.diaVencimento || '10')}</b> de cada mês. O atraso no pagamento sujeitará o CONTRATANTE a multas e juros moratórios conforme a legislação vigente.</p>

                    <h4 style="margin-top:25px; margin-bottom: 5px;">CLÁUSULA TERCEIRA - DAS RESPONSABILIDADES</h4>
                    <p style="text-align: justify; margin-top:0; font-size:14px;">É responsabilidade do CONTRATANTE zelar pelo patrimônio da instituição, além de manter o mínimo de 75% de frequência nas aulas para ter direito ao certificado de conclusão. A CONTRATADA compromete-se a fornecer o material pedagógico e o corpo docente adequado para o perfeito desenvolvimento das aulas.</p>

                    <h4 style="margin-top:25px; margin-bottom: 5px;">CLÁUSULA QUARTA - DISPOSIÇÕES GERAIS</h4>
                    <p style="text-align: justify; margin-top:0; font-size:14px;">Este contrato tem validade a partir da data de sua assinatura. As partes elegem o foro da comarca da sede da CONTRATADA para dirimir quaisquer dúvidas ou litígios oriundos deste instrumento, renunciando a qualquer outro, por mais privilegiado que seja.</p>
                    
                    <p style="text-align: right; margin-top: 50px; font-size:14px;">Local e Data: ____________________________, ${dataHoje}</p>
                    
                    <div style="display: flex; justify-content: space-between; margin-top: 60px; text-align: center; flex-wrap:wrap; gap:30px;">
                        <div style="flex:1; min-width:200px; border-top: 1px solid #000; padding-top: 10px; font-size:12px;">
                            <b>${App.escapeHTML(escola.nome || 'A INSTITUIÇÃO')}</b><br>CONTRATADA
                        </div>
                        <div style="flex:1; min-width:200px; border-top: 1px solid #000; padding-top: 10px; font-size:12px;">
                            <b>${App.escapeHTML(aluno.nome)}</b><br>CONTRATANTE
                        </div>
                    </div>
                </div>
            `;
            let style = document.createElement('style'); style.innerHTML = `@media print { @page { size: A4 portrait; margin: 15mm; } }`; printContainer.appendChild(style);

        } else if (tipo === 'declaracao') {
            printContainer.innerHTML = `
                ${reportStyles}
                ${painelImpressao}
                <div class="print-sheet" style="font-family: Arial, sans-serif; color: #000; min-height: 297mm; display:flex; flex-direction:column;">
                    ${docHeader}
                    
                    <h2 style="text-align: center; margin-top: 40px; margin-bottom: 40px; text-transform: uppercase;">Declaração de Matrícula</h2>
                    
                    <p style="text-align: justify; font-size: 16px; line-height: 2; margin-bottom: 30px;">
                        Declaramos para os devidos fins que <b>${App.escapeHTML(aluno.nome)}</b>, inscrito(a) no CPF sob o nº <b>${App.escapeHTML(aluno.cpf || '___________')}</b>, 
                        encontra-se regularmente matriculado(a) e frequentando o curso de <b>${App.escapeHTML(aluno.curso || 'Não especificado')}</b> 
                        (Turma: ${App.escapeHTML(aluno.turma || 'Não especificada')}) nesta instituição de ensino.
                    </p>
                    
                    <p style="text-align: justify; font-size: 16px; line-height: 2; margin-bottom: 60px;">
                        Esta declaração é emitida a pedido do(a) interessado(a) para que produza os seus efeitos legais.
                    </p>
                    
                    <p style="text-align: right; font-size: 14px; margin-bottom: 80px;">
                        Local e Data: ____________________________, ${dataHoje}.
                    </p>
                    
                    <div style="width: 100%; max-width: 400px; margin: auto auto 0 auto; border-top: 1px solid #000; padding-top: 10px; text-align: center; font-size: 14px;">
                        <b>A Direção / Secretaria</b><br>
                        ${App.escapeHTML(escola.nome)}
                    </div>
                </div>
            `;
            let style = document.createElement('style'); style.innerHTML = `@media print { @page { size: A4 portrait; margin: 15mm; } }`; printContainer.appendChild(style);

        } else if (tipo === 'certificado') {
            printContainer.innerHTML = `
                ${reportStyles}
                ${painelImpressao}
                <div style="padding: 30px; font-family: 'Times New Roman', serif; color: #000; text-align: center; border: 15px solid #2c3e50; outline: 4px solid #d4af37; outline-offset: -8px; min-height: 90vh; display: flex; flex-direction: column; justify-content: center; box-sizing: border-box; background: #fff;">
                    
                    <h1 style="font-size: 38px; color: #2c3e50; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 5px;">Certificado de Conclusão</h1>
                    <p style="font-size: 20px; color: #555; margin-bottom: 30px; font-style: italic;">Certificamos que</p>
                    
                    <h2 style="font-size: 36px; color: #b71c1c; margin: 0 auto 30px auto; border-bottom: 2px solid #ccc; display: inline-block; padding: 0 30px; font-family: Arial, sans-serif; word-break: break-word;">
                        ${App.escapeHTML(aluno.nome)}
                    </h2>
                    
                    <p style="font-size: 18px; color: #333; max-width: 800px; margin: 0 auto; line-height: 1.6;">
                        concluiu com êxito todos os requisitos acadêmicos do curso de <b>${App.escapeHTML(aluno.curso || 'Não especificado')}</b>, 
                        com a carga horária correspondente e aproveitamento plenamente satisfatório.
                    </p>
                    
                    <p style="font-size: 16px; color: #555; margin-top: 40px;">
                        Emitido por <b>${App.escapeHTML(escola.nome || 'Instituição de Ensino')}</b> em ${dataHoje}.
                    </p>
                    
                    <div style="display: flex; justify-content: space-around; margin-top: 60px; padding-bottom: 20px; flex-wrap:wrap; gap:20px;">
                        <div style="flex:1; min-width:200px; border-top: 1px solid #000; padding-top: 10px; font-size: 16px;">
                            <b>A Direção</b>
                        </div>
                        <div style="flex:1; min-width:200px; border-top: 1px solid #000; padding-top: 10px; font-size: 16px;">
                            <b>Instrutor / Coordenação</b>
                        </div>
                    </div>
                </div>
            `;
            let style = document.createElement('style'); style.innerHTML = `@media print { @page { size: A4 landscape; margin: 10mm; } }`; printContainer.appendChild(style);
        }

        // Removido setTimeout forçado - O Gestor clica no botão azul de imprimir!
    } catch (e) {
        App.showToast("Erro ao gerar o documento.", "error");
    } finally {
        btn.innerText = txtOriginal; btn.disabled = false;
        document.body.style.cursor = 'default';
    }
};