window.App = window.App || {};
const App = window.App;
// =========================================================
// MÓDULO RELATÓRIOS V160 (FOLHA A4 BLINDADA + RESPONSIVIDADE MOBILE)
// =========================================================

App.renderizarRelatorioModulo = async (tipo) => {
    if (tipo === 'fin_detalhado' || tipo === 'financeiro') { App.setTitulo("Relatórios Financeiros"); App.renderizarSelecaoRelatorio(); return; }
    if (tipo === 'dossie') { App.renderizarDossie(); return; }
    if (tipo === 'ficha') { App.gerarFichaSetup(); return; }
    if (tipo === 'documentos') { App.renderizarGeradorDocumentos(); return; }
    if (tipo === 'diario') { App.renderizarDiarioSetup(); return; } // 🚀 NOVA ROTA AQUI
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
            
            /* 🖨️ NOVAS REGRAS DE IMPRESSÃO INTELIGENTE */
            /* 1. Impede o rodapé (Total) de se repetir em todas as folhas */
            tfoot { display: table-row-group !important; }
            
            /* 2. Força as caixas de resumo a ficarem lado a lado e reduz o espaço vertical */
            .kpi-container { 
                flex-direction: row !important; 
                flex-wrap: nowrap !important; 
                gap: 10px !important; 
                margin-bottom: 15px !important; 
            }
            .kpi-box { 
                padding: 10px !important; 
                min-width: auto !important; 
                border: 1px solid #ccc !important; /* Adiciona uma borda leve na impressão */
            }
        }
    </style>
`;

// ---------------------------------------------------------
// 1. RELATÓRIOS FINANCEIROS (COM LEITURA DINÂMICA DE ANOS)
// ---------------------------------------------------------
App.renderizarSelecaoRelatorio = async () => {
    const div = document.getElementById('app-content');
    
    div.innerHTML = '<p style="text-align:center; padding:20px; color:#666;">A carregar períodos disponíveis... ⏳</p>';
    
    try {
        const financeiro = await App.api('/financeiro');
        let anosSet = new Set();
        const anoAtual = new Date().getFullYear();
        
        anosSet.add(anoAtual);
        anosSet.add(anoAtual + 1); 
        
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
        
        const anosOrdenados = Array.from(anosSet).sort((a, b) => b - a);
        const opAnos = anosOrdenados.map(ano => `<option value="${ano}" ${ano === anoAtual ? 'selected' : ''}>${ano}</option>`).join('');

        const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
        const opMeses = meses.map((m,i)=>`<option value="${i+1}" ${i===new Date().getMonth()?'selected':''}>${m}</option>`).join('');

        // 🧠 NOVO: Dropdown de Filtro Inteligente (Agora com Inadimplentes e Pendentes Ativos)
        const opFiltro = `
            <option value="geral" selected>🌟 GERAL (Todos os alunos e status)</option>
            <option value="pagos">✅ PAGOS (Mensalidades recebidas)</option>
            <option value="pendentes">⚠️ PENDENTES (Alunos ATIVOS com faturas em aberto)</option>
            <option value="inadimplentes">🚨 INADIMPLENTES (Alunos ATIVOS com faturas ATRASADAS)</option>
            <option value="excluidos">🗑️ INATIVOS/EXCLUÍDOS (Faturas de alunos que já não estudam)</option>
        `;

        const formHTML = `
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px;">
                <span style="font-size:24px;">🗓️</span><h2 style="margin:0; color:#2c3e50;">Selecionar Período</h2>
            </div>
            <p style="color:#666; margin-bottom:20px;">Selecione o ano base e aplique os filtros para emitir os relatórios financeiros.</p>
            
            <div style="display:flex; gap:15px; flex-wrap:wrap; margin-bottom:25px;">
                ${relSelect('Selecione o Ano Base:', 'rel-ano', opAnos, 'style="background:white; padding:12px; font-size:16px;"')}
                ${relSelect('🛡️ Filtro de Exibição:', 'filtro-auditoria', opFiltro, 'style="background:#fdf2f2; border:2px solid #f5b7b1; padding:12px; font-size:14px; font-weight:bold; color:#c0392b;"')}
            </div>
            
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
    const filtroSelecionado = document.getElementById('filtro-auditoria') ? document.getElementById('filtro-auditoria').value : 'geral';
    const div = document.getElementById('app-content'); div.innerHTML = '<p style="text-align:center;">A gerar relatório anual...</p>';
    
    try {
        const [financeiro, escola, alunos] = await Promise.all([
            App.api('/financeiro'),
            App.api('/escola') || { nome: 'ESCOLA', cnpj: '' },
            App.api('/alunos') || []
        ]);
        
        const logo = escola.foto ? `<img src="${escola.foto}" style="height:50px; object-fit:contain;">` : '';
        
        // 🧠 MOTOR DE DETEÇÃO AGRESSIVA: Mapeia por ID E por Nome para não escapar ninguém
        const mapaStatusId = {};
        const mapaStatusNome = {};
        alunos.forEach(a => { 
            const s = a.status ? a.status.toLowerCase() : 'ativo';
            mapaStatusId[a.id] = s; 
            if (a.nome) mapaStatusNome[a.nome.toLowerCase().trim()] = s;
        });

        let dados = financeiro.filter(f => f.vencimento && f.vencimento.startsWith(ano));
        
        // 🛡️ APLICAÇÃO DO NOVO FILTRO INTELIGENTE
        dados = dados.filter(f => {
            let statusAluno = 'desconhecido'; 
            
            if (f.idAluno && mapaStatusId[f.idAluno]) {
                statusAluno = mapaStatusId[f.idAluno];
            } else if (f.alunoNome && mapaStatusNome[f.alunoNome.toLowerCase().trim()]) {
                statusAluno = mapaStatusNome[f.alunoNome.toLowerCase().trim()];
            }

            const isAtivo = statusAluno === 'ativo';
            const isPago = f.status === 'Pago';
            
            // Verifica se a mensalidade já venceu (Atrasada)
            const hoje = new Date(); hoje.setHours(0,0,0,0);
            const dataVenc = new Date(f.vencimento + 'T00:00:00');
            const isAtrasado = !isPago && dataVenc < hoje;

            if (filtroSelecionado === 'pagos') return isPago;
            if (filtroSelecionado === 'pendentes') return !isPago && isAtivo; // Apenas alunos que ainda estudam
            if (filtroSelecionado === 'inadimplentes') return isAtivo && isAtrasado; // Ativos E com fatura vencida
            if (filtroSelecionado === 'excluidos') return !isAtivo; // Alunos que trancaram, cancelaram ou foram excluídos
            if (filtroSelecionado === 'geral') return true; 
            
            return true;
        });

        dados.sort((a,b) => new Date(a.vencimento) - new Date(b.vencimento));
        App.dadosRelatorioCache = dados; // 🧠 Guarda os dados filtrados na memória para o Excel
        
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
<button onclick="App.baixarExcelRelatorio('Anual')" class="btn-primary" style="background:#27ae60; border:none; width:auto; padding:10px 20px; margin-bottom:10px; margin-left:10px;">📊 BAIXAR EXCEL</button>
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
                            ${dados.length === 0 ? '<tr><td colspan="6" style="text-align:center; padding:20px;">Nenhum registo encontrado para este filtro.</td></tr>' : ''}
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
    const filtroSelecionado = document.getElementById('filtro-auditoria') ? document.getElementById('filtro-auditoria').value : 'geral';
    const div = document.getElementById('app-content'); div.innerHTML = '<p style="text-align:center;">A gerar relatório mensal...</p>';
    const meses = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
    const mesNome = meses[mesIdx - 1];

    try {
        const [financeiro, escola, alunos] = await Promise.all([
            App.api('/financeiro'),
            App.api('/escola') || { nome: 'ESCOLA', cnpj: '' },
            App.api('/alunos') || []
        ]);

        const logo = escola.foto ? `<img src="${escola.foto}" style="height:50px; object-fit:contain;">` : '';
        
        const mapaStatusId = {};
        const mapaStatusNome = {};
        alunos.forEach(a => { 
            const s = a.status ? a.status.toLowerCase() : 'ativo';
            mapaStatusId[a.id] = s; 
            if (a.nome) mapaStatusNome[a.nome.toLowerCase().trim()] = s;
        });

        let dados = financeiro.filter(f => { 
            if(!f.vencimento) return false; 
            const d = new Date(f.vencimento + 'T00:00:00'); 
            return d.getFullYear() == ano && (d.getMonth() + 1) == mesIdx; 
        });

        // 🛡️ APLICAÇÃO DO NOVO FILTRO INTELIGENTE NO MENSAL
        dados = dados.filter(f => {
            let statusAluno = 'desconhecido'; 
            
            if (f.idAluno && mapaStatusId[f.idAluno]) {
                statusAluno = mapaStatusId[f.idAluno];
            } else if (f.alunoNome && mapaStatusNome[f.alunoNome.toLowerCase().trim()]) {
                statusAluno = mapaStatusNome[f.alunoNome.toLowerCase().trim()];
            }

            const isAtivo = statusAluno === 'ativo';
            const isPago = f.status === 'Pago';
            
            // Verifica se a mensalidade já venceu (Atrasada)
            const hoje = new Date(); hoje.setHours(0,0,0,0);
            const dataVenc = new Date(f.vencimento + 'T00:00:00');
            const isAtrasado = !isPago && dataVenc < hoje;

            if (filtroSelecionado === 'pagos') return isPago;
            if (filtroSelecionado === 'pendentes') return !isPago && isAtivo;
            if (filtroSelecionado === 'inadimplentes') return isAtivo && isAtrasado;
            if (filtroSelecionado === 'excluidos') return !isAtivo;
            if (filtroSelecionado === 'geral') return true;
            
            return true;
        });

        dados.sort((a,b) => new Date(a.vencimento) - new Date(b.vencimento));
        App.dadosRelatorioCache = dados; // 🧠 Guarda os dados filtrados na memória para o Excel
        
        const getVal = (f) => parseFloat(f.valorPago1 || f.valor || 0) + parseFloat(f.valorPago2 || 0);

        const previsao = dados.reduce((acc, c) => acc + (parseFloat(c.valor) || 0), 0);
        const realizado = dados.filter(f => f.status === 'Pago').reduce((acc, c) => acc + getVal(c), 0);
        const pendente = dados.filter(f => f.status !== 'Pago').reduce((acc, c) => acc + (parseFloat(c.valor) || 0), 0);
        const fmt = (v) => v.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});

        div.innerHTML = `
            ${reportStyles}
            <div class="no-print" style="margin-bottom:20px; text-align:center;">
                <button onclick="App.renderizarSelecaoRelatorio()" class="btn-cancel" style="padding:10px 20px; margin-right:10px; margin-bottom:10px;">⬅ VOLTAR</button>
                <button onclick="window.print()" class="btn-primary" style="width:auto; padding:10px 20px; margin-bottom:10px;">🖨️ IMPRIMIR EXTRATO MENSAL</button>
<button onclick="App.baixarExcelRelatorio('Mensal')" class="btn-primary" style="background:#27ae60; border:none; width:auto; padding:10px 20px; margin-bottom:10px; margin-left:10px;">📊 BAIXAR EXCEL</button>
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
                            ${dados.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding:20px;">Nenhum registo encontrado para este filtro.</td></tr>' : ''}
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

// 📊 MOTOR DE EXPORTAÇÃO EXCEL (CSV)
App.baixarExcelRelatorio = (tipo) => {
    if (!App.dadosRelatorioCache || App.dadosRelatorioCache.length === 0) {
        return App.showToast("Não há dados para exportar.", "warning");
    }

    // Cria o cabeçalho do Excel
    let csv = "Vencimento;Nome do Aluno;Descricao;Status;Valor\n";
    
    // Converte os dados linha a linha
    App.dadosRelatorioCache.forEach(f => {
        const venc = f.vencimento ? f.vencimento.split('-').reverse().join('/') : '';
        const aluno = f.alunoNome || 'Desconhecido';
        const desc = f.descricao || '';
        const status = f.status === 'Pago' ? 'PAGO' : 'PENDENTE/ATRASADO';
        
        // Pega o valor exato (Pago ou Pendente)
        const getVal = (item) => parseFloat(item.valorPago1 || item.valor || 0) + parseFloat(item.valorPago2 || 0);
        const valorReal = f.status === 'Pago' ? getVal(f) : parseFloat(f.valor || 0);
        const valorFmt = valorReal.toLocaleString('pt-BR', {minimumFractionDigits: 2}).replace(/\./g, ''); // Remove pontos de milhar para não quebrar o Excel BR

        csv += `"${venc}";"${aluno}";"${desc}";"${status}";"${valorFmt}"\n`;
    });

    // Força o formato UTF-8 para os acentos funcionarem no Excel
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Relatorio_Financeiro_${tipo}_${new Date().getTime()}.csv`;
    link.click();
    App.showToast("Download iniciado!", "success");
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
    const mesesArray = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const nomeMes = mesesArray[mesIdx-1];

    const div = document.getElementById('app-content'); 
    div.innerHTML = '<p style="text-align:center; padding:20px; font-size:14px; color:#2980b9;"><b>A gerar Dossiê Corporativo...</b><br>Sincronizando layout e paginação de impressão ⏳</p>';
    document.body.style.cursor = 'wait';
    
    try {
        const [alunos, turmas, cursos, financeiro, escola, planejamentos] = await Promise.all([
            App.api('/alunos').catch(() => []), 
            App.api('/turmas').catch(() => []), 
            App.api('/cursos').catch(() => []), 
            App.api('/financeiro').catch(() => []), 
            App.api('/escola').catch(() => ({ nome: 'Instituição', cnpj: '' })),
            App.api('/planejamentos').catch(() => [])
        ]);
        
        const fmt = (v) => parseFloat(v || 0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
        const isVenda = (f) => (f.descricao && f.descricao.toLowerCase().includes('venda')) || (f.idCarne && f.idCarne.includes('VENDA'));

        const alunosAtivosIds = new Set();
        const alunosAtivosNomes = new Set();
        alunos.forEach(a => {
            const st = (a.status || 'ativo').toLowerCase();
            if (!st.includes('exclu') && !st.includes('cancel') && !st.includes('tranc')) {
                alunosAtivosIds.add(a.id);
                if (a.nome) alunosAtivosNomes.add(a.nome.toLowerCase().trim());
            }
        });

        const isAlunoAtivo = (f) => {
            if (f.idAluno && alunosAtivosIds.has(f.idAluno)) return true;
            if (f.alunoNome && alunosAtivosNomes.has(f.alunoNome.toLowerCase().trim())) return true;
            return false;
        };

        // ==========================================
        // 💰 1. PILAR FINANCEIRO
        // ==========================================
        const finAno = financeiro.filter(f => f.vencimento && f.vencimento.startsWith(ano) && f.tipo === 'Receita');
        const prevAno = finAno.filter(f => !isVenda(f) && isAlunoAtivo(f)).reduce((a, c) => a + (parseFloat(c.valor) || 0), 0);
        const entradaAno = finAno.filter(f => f.status === 'Pago').reduce((a, c) => a + (parseFloat(c.valorPago1 || c.valor) + parseFloat(c.valorPago2 || 0)), 0);
        const inadAno = finAno.filter(f => f.status !== 'Pago').reduce((a, c) => a + (parseFloat(c.valor) || 0), 0);

        const finMes = finAno.filter(f => parseInt(f.vencimento.split('-')[1]) === mesIdx);
        const prevMes = finMes.filter(f => !isVenda(f) && isAlunoAtivo(f)).reduce((a, c) => a + (parseFloat(c.valor) || 0), 0);
        const entradaMes = finMes.filter(f => f.status === 'Pago').reduce((a, c) => a + (parseFloat(c.valorPago1 || c.valor) + parseFloat(c.valorPago2 || 0)), 0);
        const inadMes = finMes.filter(f => f.status !== 'Pago').reduce((a, c) => a + (parseFloat(c.valor) || 0), 0);

        let linhasHistorico = ''; 
        let total12m = 0;
        const array12Meses = [];
        for (let i = 0; i < 12; i++) {
            let m = mesIdx - i; let y = parseInt(ano);
            if (m <= 0) { m += 12; y -= 1; }
            array12Meses.push({ mes: m, ano: y });
        }
        array12Meses.reverse();

        array12Meses.forEach(data => {
            const fM = financeiro.filter(f => f.tipo === 'Receita' && f.status === 'Pago' && f.vencimento && parseInt(f.vencimento.split('-')[1]) === data.mes && parseInt(f.vencimento.split('-')[0]) === data.ano);
            const valMensalidades = fM.filter(f => !isVenda(f)).reduce((a,c) => a + (parseFloat(c.valorPago1 || c.valor) + parseFloat(c.valorPago2 || 0)), 0);
            const valVendas = fM.filter(f => isVenda(f)).reduce((a,c) => a + (parseFloat(c.valorPago1 || c.valor) + parseFloat(c.valorPago2 || 0)), 0);
            const tot = valMensalidades + valVendas;
            total12m += tot;
            linhasHistorico += `<tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:5px 8px; font-weight:bold; color:#475569;">${mesesArray[data.mes - 1].substring(0,3)}/${data.ano}</td>
                <td style="padding:5px 8px; text-align:right; color:#2563eb;">${fmt(valMensalidades)}</td>
                <td style="padding:5px 8px; text-align:right; color:#7c3aed;">${fmt(valVendas)}</td>
                <td style="padding:5px 8px; text-align:right; font-weight:bold; color:#0f172a;">${fmt(tot)}</td>
            </tr>`;
        });

        // ==========================================
        // 🏢 2. PILAR ADMINISTRATIVO
        // ==========================================
        const statusStats = {
            Ativo: { masc: 0, fem: 0, total: 0 },
            Trancado: { masc: 0, fem: 0, total: 0 },
            Cancelado: { masc: 0, fem: 0, total: 0 },
            Excluído: { masc: 0, fem: 0, total: 0 }
        };
        const origens = {};
        let modalidadeMes = { online: 0, presencial: 0 };
        let modalidade12m = { online: 0, presencial: 0 };

        alunos.forEach(a => {
            let st = 'Ativo'; const s = (a.status || '').toLowerCase();
            if (s.includes('exclu')) st = 'Excluído';
            else if (s.includes('cancel')) st = 'Cancelado';
            else if (s.includes('tranc')) st = 'Trancado';

            statusStats[st].total++;
            if (a.sexo === 'Masculino') statusStats[st].masc++;
            else if (a.sexo === 'Feminino') statusStats[st].fem++;

            let pais = (a.pais || a.nacionalidade || 'Brasil').trim().toUpperCase();
            if (pais === '') pais = 'BRASIL';
            origens[pais] = (origens[pais] || 0) + 1;

            let mod = (a.modalidade || a.tipoMatricula || 'Presencial').toLowerCase().includes('online') ? 'online' : 'presencial';
            modalidade12m[mod]++;
            if (a.dataCadastro || a.dataMatricula) {
                const d = new Date(a.dataCadastro || a.dataMatricula);
                if (d.getFullYear() === parseInt(ano) && (d.getMonth() + 1) === mesIdx) modalidadeMes[mod]++;
            } else { modalidadeMes[mod]++; }
        });

        const totalAlunosGeral = alunos.length || 1;

        // ==========================================
        // 📚 3. PILAR PEDAGÓGICO
        // ==========================================
        const alunosTurma = {}; turmas.forEach(t => alunosTurma[t.nome] = 0);
        const alunosCurso = {}; cursos.forEach(c => alunosCurso[c.nome] = 0);
        alunos.forEach(a => { 
            if(a.turma && alunosTurma[a.turma] !== undefined) alunosTurma[a.turma]++; 
            if(a.curso && alunosCurso[a.curso] !== undefined) alunosCurso[a.curso]++;
        });
        const planAtivos = planejamentos.filter(p => !p.status || p.status.toLowerCase() !== 'arquivado').length;
        const planArq = planejamentos.filter(p => p.status && p.status.toLowerCase() === 'arquivado').length;

        const renderChips = (dataObj, color) => {
            const keys = Object.keys(dataObj).filter(k => dataObj[k] > 0);
            if (keys.length === 0) return `<div style="font-size:10px; color:#94a3b8;">Nenhum registo ativo.</div>`;
            return `<div style="display:flex; flex-wrap:wrap; gap:5px;">` + 
                keys.map(k => `<div style="background:#f1f5f9; border:1px solid #e2e8f0; padding:3px 6px; border-radius:4px; display:flex; gap:6px; align-items:center; font-size:9.5px; page-break-inside: avoid;">
                    <span style="color:#334155; font-weight:600;">${App.escapeHTML(k)}</span>
                    <strong style="background:${color}; color:#fff; padding:1px 5px; border-radius:10px; font-size:8.5px;">${dataObj[k]}</strong>
                </div>`).join('') + `</div>`;
        };

        const logo = escola.foto ? `<img src="${escola.foto}" style="height:35px; object-fit:contain;">` : '';

        div.innerHTML = `
            ${reportStyles}
            <style>
                * { box-sizing: border-box !important; }
                .dossier-wrap { font-family: 'Segoe UI', Arial, sans-serif; color:#1e293b; }
                .section-header { background: #1e293b; color: white; padding: 6px 12px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border-radius: 4px; margin: 15px 0 10px 0; display: flex; align-items: center; gap: 8px; page-break-after: avoid; }
                .fin-table { width: 100%; border-collapse: collapse; font-size: 9.5px; }
                .fin-table th { background: #f8fafc; padding: 6px 8px; text-align: left; border-bottom: 1px solid #cbd5e1; color: #475569; }
                .fin-table td { padding: 5px 8px; border-bottom: 1px solid #f1f5f9; }
                
                .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
                .grid-admin-3 { display: grid; grid-template-columns: 1.1fr 1.2fr 1fr; gap: 10px; margin-bottom: 10px; width: 100%; }
                .box-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; page-break-inside: avoid; overflow: hidden; display: flex; flex-direction: column; }
                .box-tit { font-size: 10px; text-transform: uppercase; color: #475569; border-bottom: 2px solid #f1f5f9; padding-bottom: 4px; margin-top: 0; margin-bottom: 8px; font-weight: bold; }
                
                /* MODO DE IMPRESSÃO: FORÇAR CORES E NUMERAÇÃO DE PÁGINAS */
                @media print {
                    @page { 
                        margin: 10mm 10mm 15mm 10mm; /* A margem inferior maior permite ao navegador injetar o número da página */
                        size: A4 portrait; 
                        
                        /* Injeção nativa de numeração para navegadores modernos */
                        @bottom-right {
                            content: "Página " counter(page) " de " counter(pages);
                            font-family: 'Segoe UI', Arial, sans-serif;
                            font-size: 9px;
                            color: #64748b;
                        }
                    }
                    * { 
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important; 
                        color-adjust: exact !important; 
                    }
                    .no-print { display: none !important; }
                    body { background: #fff !important; }
                    .print-sheet { padding: 0 !important; margin: 0 !important; border: none !important; box-shadow: none !important; width: 100% !important; max-width: 100% !important; }
                    .box-card { border: 1px solid #cbd5e1 !important; }
                    /* Garante que as grelhas fiquem estáticas */
                    .grid-2 { display: grid !important; grid-template-columns: 1fr 1fr !important; }
                    .grid-admin-3 { display: grid !important; grid-template-columns: 1.1fr 1.2fr 1fr !important; }
                }

                @media screen and (max-width: 992px) {
                    .grid-admin-3 { grid-template-columns: 1fr; }
                    .grid-2 { grid-template-columns: 1fr; }
                }
            </style>

            <div class="no-print" style="text-align:center; margin-bottom:20px;">
                <button onclick="App.renderizarDossie()" class="btn-cancel" style="margin-right:10px; margin-bottom:10px; padding:8px 16px;">⬅ VOLTAR</button>
                <button onclick="window.print()" class="btn-primary" style="width:auto; padding:8px 16px; margin-bottom:10px;">🖨️ IMPRIMIR DOSSIÊ</button>
            </div>
            
            <div class="print-sheet dossier-wrap">
                
                <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom: 2px solid #0f172a; padding-bottom: 8px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        ${logo} 
                        <div>
                            <h2 style="margin:0; text-transform:uppercase; color:#0f172a; font-size:15px; font-weight:900;">${App.escapeHTML(escola.nome)}</h2>
                            <div style="font-size:9px; color:#64748b;">CNPJ: ${App.escapeHTML(escola.cnpj)}</div>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-weight:900; font-size:12px; text-transform:uppercase;">Dossiê Corporativo Integrado</div>
                        <div style="font-size:8.5px; color:#64748b; margin-top:2px;">Referência: ${nomeMes}/${ano} | Emissão: ${new Date().toLocaleString('pt-BR')}</div>
                    </div>
                </div>

                <div class="section-header">💰 1. DADOS FINANCEIROS</div>
                <div class="grid-2">
                    <div class="box-card" style="background:#f8fafc;">
                        <h3 class="box-tit" style="color:#0f172a; border-color:#cbd5e1;">📊 Visão Anual (${ano})</h3>
                        <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px dashed #cbd5e1;">
                            <span style="font-size:10px; font-weight:bold; color:#475569;">Prev. Resumos (Ativos):</span>
                            <span style="font-size:12px; font-weight:900; color:#2563eb;">${fmt(prevAno)}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px dashed #cbd5e1;">
                            <span style="font-size:10px; font-weight:bold; color:#475569;">Entrada Bruta (Geral):</span>
                            <span style="font-size:12px; font-weight:900; color:#16a34a;">${fmt(entradaAno)}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; padding:4px 0;">
                            <span style="font-size:10px; font-weight:bold; color:#475569;">Inadimplência do Ano:</span>
                            <span style="font-size:12px; font-weight:900; color:#dc2626;">${fmt(inadAno)}</span>
                        </div>
                    </div>
                    <div class="box-card" style="background:#f0fdf4; border-color:#bbf7d0;">
                        <h3 class="box-tit" style="color:#166534; border-color:#bbf7d0;">📈 Visão Mensal (${nomeMes})</h3>
                        <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px dashed #86efac;">
                            <span style="font-size:10px; font-weight:bold; color:#166534;">Prev. Resumos (Ativos):</span>
                            <span style="font-size:12px; font-weight:900; color:#2563eb;">${fmt(prevMes)}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px dashed #86efac;">
                            <span style="font-size:10px; font-weight:bold; color:#166534;">Entrada Bruta (Geral):</span>
                            <span style="font-size:12px; font-weight:900; color:#16a34a;">${fmt(entradaMes)}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; padding:4px 0;">
                            <span style="font-size:10px; font-weight:bold; color:#166534;">Inadimplência do Mês:</span>
                            <span style="font-size:12px; font-weight:900; color:#dc2626;">${fmt(inadMes)}</span>
                        </div>
                    </div>
                </div>

                <div class="box-card">
                    <h3 class="box-tit">Histórico de Receitas Brutas (Últimos 12 Meses)</h3>
                    <table class="fin-table">
                        <thead><tr><th>PERÍODO</th><th style="text-align:right;">MENSALIDADES</th><th style="text-align:right;">VENDAS / LOJA</th><th style="text-align:right;">TOTAL DO MÊS</th></tr></thead>
                        <tbody>${linhasHistorico}</tbody>
                        <tfoot>
                            <tr style="background:#f8fafc; border-top:2px solid #cbd5e1;">
                                <td colspan="3" style="text-align:right; font-weight:bold; padding:6px;">TOTAL DO CICLO (1 ANO):</td>
                                <td style="text-align:right; font-weight:900; font-size:11.5px; color:#16a34a; padding:6px;">${fmt(total12m)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div class="section-header">🏢 2. DADOS ADMINISTRATIVOS</div>
                
                <div class="grid-admin-3">
                    <div class="box-card">
                        <h3 class="box-tit">Status das Matrículas</h3>
                        <div style="display:flex; align-items:center; gap:6px; justify-content:space-between; flex:1;">
                            <div style="position:relative; width:80px; height:80px; flex-shrink:0;"><canvas id="chartStatus"></canvas></div>
                            <div style="flex:1;">
                                <table class="fin-table" style="font-size:8px; line-height:1.2;">
                                    <tr><td style="padding:2px 4px;"><span style="color:#16a34a; font-weight:bold;">● Ativos</span></td><td style="text-align:right; font-weight:bold;">${statusStats['Ativo'].total} <span style="font-weight:normal; color:#888;">(${Math.round(statusStats['Ativo'].total/totalAlunosGeral*100)}%)</span></td></tr>
                                    <tr><td style="padding:2px 4px;"><span style="color:#d97706; font-weight:bold;">● Tranc.</span></td><td style="text-align:right; font-weight:bold;">${statusStats['Trancado'].total} <span style="font-weight:normal; color:#888;">(${Math.round(statusStats['Trancado'].total/totalAlunosGeral*100)}%)</span></td></tr>
                                    <tr><td style="padding:2px 4px;"><span style="color:#ea580c; font-weight:bold;">● Canc.</span></td><td style="text-align:right; font-weight:bold;">${statusStats['Cancelado'].total} <span style="font-weight:normal; color:#888;">(${Math.round(statusStats['Cancelado'].total/totalAlunosGeral*100)}%)</span></td></tr>
                                    <tr><td style="padding:2px 4px;"><span style="color:#dc2626; font-weight:bold;">● Excl.</span></td><td style="text-align:right; font-weight:bold;">${statusStats['Excluído'].total} <span style="font-weight:normal; color:#888;">(${Math.round(statusStats['Excluído'].total/totalAlunosGeral*100)}%)</span></td></tr>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div class="box-card">
                        <h3 class="box-tit">Demografia de Género por Status</h3>
                        <div style="position:relative; width:100%; height:95px; margin:auto 0;"><canvas id="chartGender"></canvas></div>
                    </div>

                    <div class="box-card">
                        <h3 class="box-tit">Canais de Captação</h3>
                        <div style="display:flex; align-items:center; justify-content:space-between; gap:6px; flex:1;">
                            <div style="text-align:center; flex-shrink:0;">
                                <div style="position:relative; width:65px; height:65px; margin:0 auto;"><canvas id="chartCaptacaoMes"></canvas></div>
                                <div style="font-size:7px; color:#64748b; font-weight:bold; margin-top:2px;">NO MÊS</div>
                            </div>
                            <div style="border-left:1px solid #e2e8f0; padding-left:6px; text-align:right; flex:1; justify-content:center; display:flex; flex-direction:column; gap:2px;">
                                <div style="font-size:7.5px; font-weight:bold; color:#64748b; text-transform:uppercase; line-height:1;">12 MESES:</div>
                                <div style="font-size:11px; font-weight:900; color:#3b82f6; line-height:1.1;">${modalidade12m.online} <span style="font-size:7.5px; color:#94a3b8; font-weight:bold;">(${Math.round(modalidade12m.online/totalAlunosGeral*100)}%)</span></div>
                                <div style="font-size:11px; font-weight:900; color:#8b5cf6; line-height:1.1;">${modalidade12m.presencial} <span style="font-size:7.5px; color:#94a3b8; font-weight:bold;">(${Math.round(modalidade12m.presencial/totalAlunosGeral*100)}%)</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="box-card" style="margin-bottom:10px;">
                    <h3 class="box-tit">Países de Origem (Top Representatividade)</h3>
                    <div style="display:flex; flex-wrap:wrap; gap:5px;">
                        ${Object.keys(origens).map(p => `<div style="background:#f8fafc; border:1px solid #e2e8f0; padding:3px 6px; border-radius:4px; font-size:9px; color:#334155;"><b>${p}</b>: ${origens[p]} <span style="color:#777;">(${Math.round(origens[p]/totalAlunosGeral*100)}%)</span></div>`).join('')}
                    </div>
                </div>

                <div class="section-header">📚 3. DADOS PEDAGÓGICOS</div>
                <div class="grid-2">
                    <div class="box-card">
                        <h3 class="box-tit">Ocupação de Cursos</h3>
                        ${renderChips(alunosCurso, '#3b82f6')}
                        <h3 class="box-tit" style="margin-top:12px;">Integração por Turmas</h3>
                        ${renderChips(alunosTurma, '#10b981')}
                    </div>
                    <div class="box-card">
                        <h3 class="box-tit">Gestão de Planejamentos de Aula</h3>
                        <div style="display:flex; gap:8px; flex:1; align-items:center;">
                            <div style="flex:1; background:#f0fdf4; border:1px solid #bbf7d0; padding:12px 6px; border-radius:6px; text-align:center;">
                                <div style="font-size:8.5px; font-weight:bold; color:#166534; text-transform:uppercase;">Ativos</div>
                                <div style="font-size:22px; font-weight:900; color:#15803d; margin-top:2px;">${planAtivos}</div>
                            </div>
                            <div style="flex:1; background:#f8fafc; border:1px solid #e2e8f0; padding:12px 6px; border-radius:6px; text-align:center;">
                                <div style="font-size:8.5px; font-weight:bold; color:#475569; text-transform:uppercase;">Arquivados</div>
                                <div style="font-size:22px; font-weight:900; color:#64748b; margin-top:2px;">${planArq}</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>`;

        // ==========================================
        // 🛠️ MOTOR DE GRAFIA ESTÁTICA EM PIZZA / ROSCA
        // ==========================================
        const pluginNumerosNoGrafico = {
            id: 'pluginNumerosNoGrafico',
            afterDatasetsDraw(chart) {
                const { ctx, data } = chart;
                ctx.save();
                chart.data.datasets.forEach((dataset, i) => {
                    const meta = chart.getDatasetMeta(i);
                    meta.data.forEach((element, index) => {
                        const val = dataset.data[index];
                        if (val === 0) return;

                        const { x, y, startAngle, endAngle, innerRadius, outerRadius } = element;
                        const midAngle = startAngle + (endAngle - startAngle) / 2;
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.55;

                        const textX = x + Math.cos(midAngle) * radius;
                        const textY = y + Math.sin(midAngle) * radius;

                        ctx.fillStyle = '#ffffff';
                        ctx.font = 'bold 9px Arial';
                        ctx.textBaseline = 'middle';
                        ctx.textAlign = 'center';
                        ctx.fillText(val, textX, textY);
                    });
                });
                ctx.restore();
            }
        };

        setTimeout(() => {
            // Função auxiliar para destruir gráficos antigos e evitar sobreposição (Flicker)
            const safeChart = (id, config) => {
                const canvas = document.getElementById(id);
                if (!canvas) return;
                const chartInst = Chart.getChart(canvas);
                if (chartInst) chartInst.destroy();
                new Chart(canvas, config);
            };

            safeChart('chartStatus', {
                type: 'doughnut',
                plugins: [pluginNumerosNoGrafico],
                data: {
                    labels: ['Ativos', 'Trancados', 'Cancelados', 'Excluídos'],
                    datasets: [{ data: [statusStats['Ativo'].total, statusStats['Trancado'].total, statusStats['Cancelado'].total, statusStats['Excluído'].total], backgroundColor: ['#16a34a', '#d97706', '#ea580c', '#dc2626'], borderWidth: 0 }]
                }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '55%' }
            });

            if(document.getElementById('chartCaptacaoMes')) {
                if (modalidadeMes.online > 0 || modalidadeMes.presencial > 0) {
                    safeChart('chartCaptacaoMes', {
                        type: 'pie',
                        plugins: [pluginNumerosNoGrafico],
                        data: {
                            labels: ['Online', 'Presencial'],
                            datasets: [{ data: [modalidadeMes.online, modalidadeMes.presencial], backgroundColor: ['#3b82f6', '#8b5cf6'], borderWidth: 1, borderColor: '#fff' }]
                        }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
                    });
                } else {
                    document.getElementById('chartCaptacaoMes').parentElement.innerHTML = '<div style="font-size:8px; color:#94a3b8; margin-top:15px; line-height:1.1; text-align:center;">Sem registros<br>no mês.</div>';
                }
            }

            safeChart('chartGender', {
                type: 'bar',
                data: {
                    labels: ['Ativ.', 'Tran.', 'Can.', 'Excl.'],
                    datasets: [
                        { label: 'Masc', data: [statusStats['Ativo'].masc, statusStats['Trancado'].masc, statusStats['Cancelado'].masc, statusStats['Excluído'].masc], backgroundColor: '#3b82f6', borderRadius: 1.5 },
                        { label: 'Fem', data: [statusStats['Ativo'].fem, statusStats['Trancado'].fem, statusStats['Cancelado'].fem, statusStats['Excluído'].fem], backgroundColor: '#ec4899', borderRadius: 1.5 }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { position: 'top', labels: { boxWidth: 6, font: { size: 7.5 }, padding: 4 } } },
                    scales: { 
                        x: { grid: { display: false }, ticks: { font: { size: 7.5 } } }, 
                        y: { beginAtZero: true, border: { display: false }, ticks: { stepSize: 1, font: { size: 7.5 } } } 
                    }
                }
            });
        }, 300);

    } catch(e) { App.showToast("Erro ao gerar dossiê corporativo.", "error"); console.error(e); } 
    finally { document.body.style.cursor = 'default'; }
};

// ---------------------------------------------------------
// 📝 DIÁRIO DE CLASSE (PAUTA DE FREQUÊNCIA PARA PROFESSORES)
// ---------------------------------------------------------
App.renderizarDiarioSetup = async () => {
    App.setTitulo("Diário de Classe");
    const div = document.getElementById('app-content'); div.innerHTML = '<p style="text-align:center;">Carregando turmas... ⏳</p>';
    
    try {
        const turmas = await App.api('/turmas');
        const opTurmas = `<option value="">-- Selecione a Turma --</option>` + turmas.map(t => `<option value="${t.nome}">${App.escapeHTML(t.nome)}</option>`).join('');
        
        const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
        const opMeses = meses.map((m,i)=>`<option value="${m}" ${i===new Date().getMonth()?'selected':''}>${m}</option>`).join('');

        const formFicha = `
            <div style="display:flex; gap:15px; align-items:flex-end; flex-wrap:wrap; margin-bottom: 20px;">
                ${relSelect('Turma:', 'diario-turma', opTurmas, 'style="min-width:250px;"')}
                ${relSelect('Mês de Referência:', 'diario-mes', opMeses, 'style="min-width:150px;"')}
                <button onclick="App.gerarDiarioImprimir()" class="btn-primary" style="height:41px; padding:0 25px; margin-bottom:5px;">GERAR DIÁRIO</button>
            </div>
        `;
        
        div.innerHTML = App.UI.card('📝 Gerar Pauta de Frequência', '', formFicha, '100%') + `<div id="diario-area" style="margin-top:30px;"></div>`;
    } catch(e) { div.innerHTML = "Erro ao carregar as turmas."; }
};

App.gerarDiarioImprimir = async () => {
    const nomeTurma = document.getElementById('diario-turma').value;
    const mesRef = document.getElementById('diario-mes').value;
    if(!nomeTurma) return App.showToast("Selecione uma turma.", "warning");
    
    const divArea = document.getElementById('diario-area'); 
    divArea.innerHTML = '<p style="text-align:center;">Desenhando grelha... ⏳</p>';
    document.body.style.cursor = 'wait';
    
    try {
        const [alunos, escola, turmas] = await Promise.all([ App.api('/alunos'), App.api('/escola'), App.api('/turmas') ]);
        const turmaObj = turmas.find(t => t.nome === nomeTurma) || { dia: '-', horario: '-', curso: '-' };
        const logo = escola.foto ? `<img src="${escola.foto}" style="height:45px; object-fit:contain;">` : '';
        
        // Puxa apenas alunos ativos dessa turma
        const alunosTurma = alunos.filter(a => a.turma === nomeTurma && (!a.status || a.status === 'Ativo'))
                                  .sort((a,b) => a.nome.localeCompare(b.nome));

        // Cria colunas para até 31 dias
        let diasHtml = '';
        for(let i=1; i<=31; i++) { diasHtml += `<th style="border: 1px solid #000; width: 2.5%; text-align: center; font-size: 10px; padding: 2px;">${i}</th>`; }

        let linhasHtml = '';
        if(alunosTurma.length === 0) {
            linhasHtml = `<tr><td colspan="32" style="text-align:center; padding: 20px;">Nenhum aluno ativo matriculado nesta turma.</td></tr>`;
        } else {
            alunosTurma.forEach((aluno, idx) => {
                let caixasDia = '';
                for(let i=1; i<=31; i++) { caixasDia += `<td style="border: 1px solid #000;"></td>`; }
                linhasHtml += `
                    <tr>
                        <td style="border: 1px solid #000; padding: 4px 6px; font-size: 11px;">${idx + 1}. ${App.escapeHTML(aluno.nome)}</td>
                        ${caixasDia}
                    </tr>`;
            });
        }

        // Tabela A4 em Paisagem
        divArea.innerHTML = `
            ${reportStyles}
            <style>
                @media print { 
                    @page { size: A4 landscape; margin: 10mm; }
                    .print-sheet { max-width: 100% !important; }
                }
            </style>
            <div class="no-print" style="text-align:center; margin-bottom:20px;">
                <button onclick="window.print()" class="btn-primary" style="width:auto; padding:10px 20px; background:#2980b9; border:none;">🖨️ IMPRIMIR DIÁRIO (PAISAGEM)</button>
            </div>
            <div class="print-sheet" style="padding: 20px;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #000; padding-bottom:10px; margin-bottom:15px;">
                    <div style="display:flex; align-items:center; gap:15px;">${logo}<div><h2 style="margin:0; font-size:16px; text-transform:uppercase;">${App.escapeHTML(escola.nome)}</h2><div style="font-size:11px;">Diário de Classe / Pauta de Frequência</div></div></div>
                    <div style="text-align:right; font-size:12px; font-weight:bold;">
                        Turma: <span style="color:#2980b9;">${App.escapeHTML(nomeTurma)}</span><br>
                        Mês: <span style="color:#27ae60;">${mesRef}</span><br>
                        Horário: ${App.escapeHTML(turmaObj.horario)}
                    </div>
                </div>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f0f0f0;">
                            <th style="border: 1px solid #000; text-align: left; padding: 5px; width: 25%; font-size: 11px;">NOME DO ALUNO</th>
                            ${diasHtml}
                        </tr>
                    </thead>
                    <tbody>${linhasHtml}</tbody>
                </table>
                <div style="margin-top: 15px; font-size: 10px; color: #555;">Legenda de Preenchimento: (P) Presente | (F) Falta | (J) Falta Justificada</div>
            </div>
        `;
    } catch(e) { App.showToast("Erro ao gerar o Diário.", "error"); }
    finally { document.body.style.cursor = 'default'; }
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
        // 🚀 CORREÇÃO: Pega a lista toda e filtra, evitando erro de ID inexistente no servidor
        const [alunosLista, escola, financeiro, turmas] = await Promise.all([ 
            App.api('/alunos'), 
            App.api('/escola'),
            App.api('/financeiro'),
            App.api('/turmas')
        ]);
        const aluno = alunosLista.find(a => a.id === idAluno) || {};
        
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
                    <div><b>CPF do Responsável:</b> ${App.escapeHTML(aluno.resp_cpf || '-')}</div>
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
                        <div><b>Data Nascimento:</b> ${App.escapeHTML(aluno.nascimento ? aluno.nascimento.split('-').reverse().join('/') : '-')}</div>
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
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15x; margin-bottom: 20px; font-size:13px;">
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
// 🎓 4. FÁBRICA DE DOCUMENTOS (HUB: OFICIAIS VS CERTIFICADOS)
// =========================================================

// --- 4.1 HUB PRINCIPAL DE ESCOLHA ---
App.renderizarGeradorDocumentos = () => {
    App.setTitulo("Fábrica de Documentos");
    const div = document.getElementById('app-content');

    // Estilos dinâmicos para os botões gigantes
    const btnStyle = (cor) => `cursor:pointer; background:white; border:2px solid #eee; padding:40px 20px; border-radius:15px; width:45%; min-width:250px; transition:0.3s; box-shadow:0 5px 15px rgba(0,0,0,0.05); text-align:center;`;
    const hoverIn = (cor) => `this.style.borderColor='${cor}'; this.style.transform='translateY(-5px)'`;
    const hoverOut = `this.style.borderColor='#eee'; this.style.transform='translateY(0)'`;

    const menuHub = `
        <div style="text-align:center; padding:20px;">
            <h2 style="color:#2c3e50; margin-bottom:10px;">O que deseja emitir hoje?</h2>
            <p style="color:#7f8c8d; margin-bottom:40px;">Escolha a categoria do documento para abrir o ambiente de formatação adequado.</p>
            
            <div style="display:flex; justify-content:center; gap:30px; flex-wrap:wrap;">
                <div onclick="App.renderizarMenuDocumentosOficiais()" style="${btnStyle('#3498db')}" onmouseover="${hoverIn('#3498db')}" onmouseout="${hoverOut}">
                    <div style="font-size:60px; margin-bottom:15px;">📄</div>
                    <h3 style="margin:0 0 10px 0; color:#3498db;">Documentos Oficiais</h3>
                    <p style="color:#666; font-size:13px; margin:0;">Contratos de Serviços e Declarações de Matrícula (A4 Retrato).</p>
                </div>
                
                <div onclick="App.renderizarMenuCertificados()" style="${btnStyle('#f39c12')}" onmouseover="${hoverIn('#f39c12')}" onmouseout="${hoverOut}">
                    <div style="font-size:60px; margin-bottom:15px;">🎓</div>
                    <h3 style="margin:0 0 10px 0; color:#f39c12;">Certificados de Conclusão</h3>
                    <p style="color:#666; font-size:13px; margin:0;">Diplomas oficiais com carga horária e selos (A4 Paisagem).</p>
                </div>

                <div onclick="App.renderizarDiarioSetup()" style="${btnStyle('#27ae60')}" onmouseover="${hoverIn('#27ae60')}" onmouseout="${hoverOut}">
                    <div style="font-size:60px; margin-bottom:15px;">📝</div>
                    <h3 style="margin:0 0 10px 0; color:#27ae60;">Diários de Classe</h3>
                    <p style="color:#666; font-size:13px; margin:0;">Grelhas de frequência com 31 dias para turmas ativas (A4 Paisagem).</p>
                </div>
            </div>
        </div>
    `;
    
    div.innerHTML = App.UI.card('', '', menuHub, '100%');
};

// --- 4.2 AMBIENTE DE DOCUMENTOS OFICIAIS (Contratos/Declarações) ---
App.renderizarMenuDocumentosOficiais = async () => {
    const div = document.getElementById('app-content');
    div.innerHTML = '<p style="text-align:center; padding:20px; color:#666;">A carregar base de alunos... ⏳</p>';
    
    try {
        const alunos = await App.api('/alunos');
        const alunosAtivos = alunos.filter(a => !a.status || a.status === 'Ativo');
        const alunosOptions = alunosAtivos.length > 0 
            ? `<option value="">-- Selecione o Aluno --</option>` + alunosAtivos.map(a => `<option value="${a.id}">${App.escapeHTML(a.nome)} (Turma: ${App.escapeHTML(a.turma || '-')})</option>`).join('')
            : `<option value="">Nenhum aluno ativo encontrado</option>`;

        const formHTML = `
            <div class="card" style="max-width: 700px; margin: 0 auto; border-top: 4px solid #3498db;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding-bottom:15px; margin-bottom:25px;">
                    <h3 style="color:#2c3e50; margin:0; display:flex; align-items:center; gap:10px; font-size:18px;">
                        📄 Emissão de Documentos Oficiais
                    </h3>
                    <button onclick="App.renderizarGeradorDocumentos()" style="background:#ecf0f1; border:none; padding:8px 15px; border-radius:5px; cursor:pointer; font-weight:bold; color:#7f8c8d;">Voltar</button>
                </div>
                
                <div style="display:flex; flex-direction:column; gap:20px;">
                    <div style="display:flex; gap:15px; flex-wrap:wrap;">
                        <div style="flex:2; min-width:250px; text-align:left;">
                            <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">1. Selecione o Aluno:</label>
                            <select id="doc-aluno-oficial" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; font-weight:bold; cursor:pointer;">${alunosOptions}</select>
                        </div>
                        
                        <div style="flex:2; min-width:250px; text-align:left;">
                            <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">2. Qual documento deseja emitir?</label>
                            <select id="doc-tipo-oficial" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; font-weight:bold; cursor:pointer;">
                                <option value="declaracao">📝 Declaração de Matrícula / Frequência</option>
                                <option value="contrato">📄 Contrato de Prestação de Serviços</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div style="margin-top:30px; display:flex; gap:10px;">
                    <button class="btn-primary" style="flex:1; padding:15px; font-size:14px; background:#3498db; border:none; box-shadow:0 4px 10px rgba(52, 152, 219, 0.3); justify-content:center; border-radius:8px; cursor:pointer;" onclick="App.gerarDocumentoOficialPrint()">🖨️ GERAR DOCUMENTO</button>
                </div>
            </div>
            
            <div id="doc-area-oficial" style="margin-top: 30px;"></div>
        `;
        div.innerHTML = formHTML;
    } catch (e) { div.innerHTML = '<p>Erro ao carregar dados.</p>'; }
};

// --- FUNÇÃO AUXILIAR PARA LISTAS JURÍDICAS ---
App.formatarLista = (estilo) => {
    document.execCommand('insertOrderedList', false, null);
    
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        let currentNode = selection.anchorNode;
        if (currentNode && currentNode.nodeType === 3) {
            currentNode = currentNode.parentNode;
        }
        if (currentNode) {
            const ol = currentNode.closest('ol');
            if (ol) {
                ol.style.listStyleType = estilo;
            }
        }
    }
};

// --- NOVA FUNÇÃO: GERE O MENU SUSPENSO DE FORMATAÇÃO ---
App.aplicarFormatacaoDropdown = (selectElement) => {
    const valor = selectElement.value;
    if (!valor) return; // Se for a opção padrão, não faz nada

    // Devolve o foco para o editor para garantir que insere no sítio certo
    const editor = document.getElementById('editor-documento');
    if (editor) editor.focus();

    if (valor === 'unorderedList') {
        document.execCommand('insertUnorderedList', false, null);
    } else if (valor === 'paragrafo') {
        document.execCommand('insertText', false, '§ ');
    } else {
        // Aplica os estilos de listas numéricas (decimal, alíneas, incisos)
        App.formatarLista(valor);
    }

    // Reinicia o campo de seleção para o estado inicial
    selectElement.value = "";
};

// Motor de Impressão EXCLUSIVO para Documentos Oficiais (A4 Retrato) com Editor Estilo Word Limpo e Busca Financeira
App.gerarDocumentoOficialPrint = async () => {
    const idAluno = document.getElementById('doc-aluno-oficial').value;
    const tipo = document.getElementById('doc-tipo-oficial').value;
    
    // 🧠 Motor Inteligente de Data por Extenso
    const hoje = new Date();
    const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    const dataPorExtenso = `${hoje.getDate()} de ${meses[hoje.getMonth()]} de ${hoje.getFullYear()}`;
    const dataHojeSimples = hoje.toLocaleDateString('pt-BR');
    
    if (!idAluno) return App.showToast("Selecione um aluno na lista.", "warning");

    const btn = document.querySelector('button[onclick="App.gerarDocumentoOficialPrint()"]');
    const txtOriginal = btn.innerText;
    btn.innerText = "A Preparar Editor... ⏳"; btn.disabled = true; document.body.style.cursor = 'wait';

    try {
        const alunosLista = await App.api('/alunos');
        const aluno = alunosLista.find(a => a.id === idAluno) || {};
        const escola = await App.api('/escola') || { nome: 'A INSTITUIÇÃO', cnpj: '00.000.000/0000-00' };
        
        // Tentativa de buscar os dados financeiros silenciosamente
        let financeiroLista = [];
        try { financeiroLista = await App.api('/financeiro'); } catch(e) {}
        
        // 💰 MOTOR FINANCEIRO INTELIGENTE (Buscando Valor e Dia Real)
        let valorMensalidade = parseFloat(aluno.valorMensalidade || aluno.mensalidade || aluno.valor || 0);
        let diaVencimento = aluno.diaVencimento || aluno.vencimento || aluno.dia_vencimento || '';

        // Se o cadastro estiver vazio, o sistema atua como detetive no módulo financeiro
        if (valorMensalidade === 0 || !diaVencimento) {
            const mensalidadesAluno = financeiroLista.filter(f => f.idAluno === idAluno && f.tipo === 'Receita' && (!f.descricao || !f.descricao.toLowerCase().includes('venda')));
            if (mensalidadesAluno.length > 0) {
                const ref = mensalidadesAluno[0]; // Pega a primeira mensalidade como referência
                if (valorMensalidade === 0) valorMensalidade = parseFloat(ref.valor || 0);
                if (!diaVencimento && ref.vencimento) {
                    diaVencimento = ref.vencimento.split('-')[2]; // Extrai apenas o dia de YYYY-MM-DD
                }
            }
        }
        if (!diaVencimento) diaVencimento = '10'; // Fallback final de segurança
        const valorFmt = valorMensalidade.toLocaleString('pt-BR', {minimumFractionDigits: 2});
        
        const enderecoFormatado = escola.endereco ? `${escola.endereco}, ${escola.numero || 'S/N'} - ${escola.bairro || ''}. ${escola.cidade || ''}-${escola.estado || ''} | CEP: ${escola.cep || ''}` : '';
        
        // Construção Dinâmica: Local e Data
        let localEscola = 'Local não informado';
        if (escola.cidade && escola.estado) {
            localEscola = `${App.escapeHTML(escola.cidade)} - ${App.escapeHTML(escola.estado)}`;
        } else if (escola.cidade) {
            localEscola = App.escapeHTML(escola.cidade);
        }
        const localDataCompleta = `${localEscola}, ${dataPorExtenso}.`;

        const printContainer = document.getElementById('doc-area-oficial');
        printContainer.innerHTML = '<p style="text-align:center;">Gerando Layout... ⏳</p>';

        const logo = escola.foto ? `<img src="${escola.foto}" style="height:60px; object-fit:contain;">` : '';
        
        // 1. CABEÇALHO ESTÁTICO E PROTEGIDO
        const docHeader = `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:15px; flex-wrap:wrap; gap:15px;">
                <div style="display:flex; align-items:center; gap:20px;">${logo}<div><h2 style="margin:0; text-transform:uppercase; font-size:18px;">${App.escapeHTML(escola.nome)}</h2><div style="font-size:12px; color:#555;">CNPJ: ${App.escapeHTML(escola.cnpj)}<br>${App.escapeHTML(enderecoFormatado)}</div></div></div>
                <div style="text-align:right;">
<div style="font-size:10px; color:#999;">Emissão: ${dataHojeSimples}</div>
</div>
            </div>`;

        // 2. BARRA DE FERRAMENTAS DO EDITOR (Limpa e com Dropdown)
        const btnToolbarStyle = "padding: 6px 12px; cursor: pointer; font-size: 13px; background: #fff; border: 1px solid #bdc3c7; border-radius: 4px; transition: 0.2s;";
        
        const editorToolbar = `
            <div class="no-print" style="background: #f8f9fa; padding: 10px; border: 1px solid #ccc; border-radius: 5px 5px 0 0; display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: -1px; position: sticky; top: 0; z-index: 10; box-shadow: 0 2px 4px rgba(0,0,0,0.05); align-items: center;">
                
                <button type="button" onclick="document.execCommand('bold', false, null)" style="${btnToolbarStyle} font-weight: bold;" onmouseover="this.style.background='#ecf0f1'" onmouseout="this.style.background='#fff'" title="Negrito">B</button>
                <button type="button" onclick="document.execCommand('italic', false, null)" style="${btnToolbarStyle} font-style: italic; font-family: serif;" onmouseover="this.style.background='#ecf0f1'" onmouseout="this.style.background='#fff'" title="Itálico">I</button>
                <button type="button" onclick="document.execCommand('underline', false, null)" style="${btnToolbarStyle} text-decoration: underline;" onmouseover="this.style.background='#ecf0f1'" onmouseout="this.style.background='#fff'" title="Sublinhado">U</button>
                
                <span style="border-left: 1px solid #ccc; margin: 0 2px; height: 24px;"></span>
                
                <button type="button" onclick="document.execCommand('justifyLeft', false, null)" style="${btnToolbarStyle}" onmouseover="this.style.background='#ecf0f1'" onmouseout="this.style.background='#fff'" title="Alinhar à Esquerda">⫷</button>
                <button type="button" onclick="document.execCommand('justifyCenter', false, null)" style="${btnToolbarStyle}" onmouseover="this.style.background='#ecf0f1'" onmouseout="this.style.background='#fff'" title="Centralizar">≣</button>
                <button type="button" onclick="document.execCommand('justifyRight', false, null)" style="${btnToolbarStyle}" onmouseover="this.style.background='#ecf0f1'" onmouseout="this.style.background='#fff'" title="Alinhar à Direita">⫸</button>
                <button type="button" onclick="document.execCommand('justifyFull', false, null)" style="${btnToolbarStyle}" onmouseover="this.style.background='#ecf0f1'" onmouseout="this.style.background='#fff'" title="Justificar Texto">⇹</button>
                
                <span style="border-left: 1px solid #ccc; margin: 0 2px; height: 24px;"></span>
                
                <select onchange="App.aplicarFormatacaoDropdown(this)" style="padding: 6px 10px; font-size: 13px; border: 1px solid #bdc3c7; border-radius: 4px; background: #fff; cursor: pointer; color: #333; outline: none;">
                    <option value="">➕ Inserir Elemento...</option>
                    <option value="unorderedList">• Lista com Pontos</option>
                    <option value="decimal">1. Lista Numerada</option>
                    <option value="lower-alpha">a. Alíneas</option>
                    <option value="upper-roman">I. Incisos</option>
                    <option value="paragrafo">§ Símbolo de Parágrafo</option>
                </select>
                
                <div style="flex-grow: 1; text-align: right; font-size: 12px; font-weight: bold; color: #3498db; display:flex; align-items:center; justify-content:flex-end; gap:5px;">
                    ✍️ MODO DE EDIÇÃO
                </div>
            </div>
        `;

        let corpoTexto = '';
        let docFooter = '';
        let numPaginacaoHtml = '';

        // 3. O CORPO DO TEXTO (Que vai dentro do Editor)
        if (tipo === 'contrato') {
            corpoTexto = `
                <h2 style="text-align: center; margin-top: 40px; margin-bottom: 40px; text-transform: uppercase; font-family: Arial, sans-serif;">Contrato de Serviços</h2>
                <div style="text-align: justify; margin-top: 5px; font-size:14px; font-family: Arial, sans-serif;">
                    Pelo presente instrumento particular, de um lado <b>${App.escapeHTML(escola.nome || 'A INSTITUIÇÃO')}</b>, 
                    inscrita no CNPJ sob o nº <b>${App.escapeHTML(escola.cnpj || '00.000.000/0000-00')}</b>, doravante denominada <b>CONTRATADA</b>, e de outro lado 
                    <b>${App.escapeHTML(aluno.nome)}</b>, portador(a) do CPF nº <b>${App.escapeHTML(aluno.cpf || '___________')}</b> e RG nº <b>${App.escapeHTML(aluno.rg || '___________')}</b>, 
                    residente e domiciliado(a) na ${App.escapeHTML(aluno.rua || '')}, ${App.escapeHTML(aluno.numero || '')} - ${App.escapeHTML(aluno.bairro || '')}, 
                    ${App.escapeHTML(aluno.cidade || '')}/${App.escapeHTML(aluno.estado || '')}, doravante denominado(a) <b>CONTRATANTE</b>.
                </div>

                <h4 style="margin-top:20px; margin-bottom: 5px; font-family: Arial, sans-serif;">CLÁUSULA PRIMEIRA - DO OBJETO</h4>
                <div style="text-align: justify; margin-top:0; font-size:14px; font-family: Arial, sans-serif;">O presente contrato tem como objeto a prestação de serviços educacionais por parte da CONTRATADA ao CONTRATANTE, referente ao curso de <b>${App.escapeHTML(aluno.curso || 'Não especificado')}</b>, a ser ministrado na turma <b>${App.escapeHTML(aluno.turma || 'Não especificada')}</b>.</div>

                <h4 style="margin-top:20px; margin-bottom: 5px; font-family: Arial, sans-serif;">CLÁUSULA SEGUNDA - DOS VALORES E FORMA DE PAGAMENTO</h4>
                <div style="text-align: justify; margin-top:0; font-size:14px; font-family: Arial, sans-serif;">Pelos serviços educacionais prestados, o CONTRATANTE pagará à CONTRATADA a mensalidade no valor estipulado de <b>R$ ${valorFmt}</b>, com vencimento programado para todo dia <b>${App.escapeHTML(diaVencimento)}</b> de cada mês. O atraso no pagamento sujeitará o CONTRATANTE a multas e juros moratórios conforme a legislação vigente.</div>

                <h4 style="margin-top:20px; margin-bottom: 5px; font-family: Arial, sans-serif;">CLÁUSULA TERCEIRA - DAS RESPONSABILIDADES</h4>
                <div style="text-align: justify; margin-top:0; font-size:14px; font-family: Arial, sans-serif;">É responsabilidade do CONTRATANTE zelar pelo patrimônio da instituição, além de manter o mínimo de 75% de frequência nas aulas. A CONTRATADA compromete-se a fornecer o material pedagógico e o corpo docente adequado para o perfeito desenvolvimento das aulas.</div>

                <h4 style="margin-top:20px; margin-bottom: 5px; font-family: Arial, sans-serif;">CLÁUSULA QUARTA - DISPOSIÇÕES GERAIS</h4>
                <div style="text-align: justify; margin-top:0; font-size:14px; font-family: Arial, sans-serif;">Este contrato tem validade a partir da data de sua assinatura. As partes elegem o foro da comarca da sede da CONTRATADA para dirimir quaisquer dúvidas ou litígios oriundos deste instrumento, renunciando a qualquer outro, por mais privilegiado que seja.</div>
            `;
            
            // 💡 MARGENS REDUZIDAS PARA O CONTRATO
            docFooter = `
                <div style="text-align: right; margin-top: 50px; font-size:14px; font-family: Arial, sans-serif;">${localDataCompleta}</div>
                <div style="display: flex; justify-content: space-between; margin-top: 50px; text-align: center; flex-wrap:wrap; gap:30px; font-family: Arial, sans-serif;">
                    <div style="flex:1; min-width:200px; border-top: 1px solid #000; padding-top: 5px; font-size:12px;">
                        <b>${App.escapeHTML(escola.nome || 'A INSTITUIÇÃO')}</b><br>CONTRATADA
                    </div>
                    <div style="flex:1; min-width:200px; border-top: 1px solid #000; padding-top: 5px; font-size:12px;">
                        <b>${App.escapeHTML(aluno.nome)}</b><br>CONTRATANTE
                    </div>
                </div>
            `;

            // Elemento fixo que simula a paginação no canto inferior em navegadores suportados
            numPaginacaoHtml = `<div class="rodape-paginacao"></div>`;

        } else if (tipo === 'declaracao') {
            corpoTexto = `
                <h2 style="text-align: center; margin-top: 40px; margin-bottom: 40px; text-transform: uppercase; font-family: Arial, sans-serif;">Declaração de Matrícula</h2>
                
                <div style="text-align: justify; font-size: 16px; line-height: 2; margin-bottom: 20px; font-family: Arial, sans-serif;">
                    Declaramos para os devidos fins que <b>${App.escapeHTML(aluno.nome)}</b>, inscrito(a) no CPF sob o nº <b>${App.escapeHTML(aluno.cpf || '___________')}</b>, 
                    encontra-se regularmente matriculado(a) e frequentando o curso de <b>${App.escapeHTML(aluno.curso || 'Não especificado')}</b> 
                    (Turma: <b>${App.escapeHTML(aluno.turma || 'Não especificada')}</b>) nesta instituição de ensino.
                </div>
                
                <div style="text-align: justify; font-size: 16px; line-height: 2; margin-bottom: 30px; font-family: Arial, sans-serif;">
                    Esta declaração é emitida a pedido do(a) interessado(a) para que produza os seus efeitos legais.
                </div>
            `;
            
            // 💡 MARGENS REDUZIDAS PARA A DECLARAÇÃO
            docFooter = `
                <div style="text-align: right; font-size: 14px; margin-bottom: 70px; margin-top: 60px; font-family: Arial, sans-serif;">
                    ${localDataCompleta}
                </div>
                
                <div style="width: 100%; max-width: 400px; margin: auto auto 0 auto; border-top: 1px solid #000; padding-top: 10px; text-align: center; font-size: 14px; font-family: Arial, sans-serif;">
                    <b>A Direção / Secretaria</b><br>
                    ${App.escapeHTML(escola.nome)}
                </div>
            `;
        }

        const painelImpressao = `
            <div class="no-print" style="text-align:center; margin-bottom:20px; display: flex; flex-direction: column; align-items: center; gap: 5px;">
                <button onclick="window.print()" class="btn-primary" style="width:auto; padding:15px 30px; background:#27ae60; border:none; border-radius:8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(39, 174, 96, 0.3); cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#219a52'" onmouseout="this.style.background='#27ae60'">🖨️ CONFIRMAR E IMPRIMIR DOCUMENTO</button>
                <div style="font-size: 12px; color: #7f8c8d;">Pode editar o texto abaixo livremente. As margens foram reduzidas para otimização de folha.</div>
            </div>
        `;

        // 4. A MONTAGEM FINAL DO SANDUÍCHE
        printContainer.innerHTML = `
            ${reportStyles}
            ${painelImpressao}
            <div class="print-sheet" style="font-family: Arial, sans-serif; color: #000; display:flex; flex-direction:column; position: relative; padding: 40px; min-height: 200mm;">
                
                <div class="header-estatico">
                    ${docHeader}
                </div>
                
                ${editorToolbar}
                <div id="editor-documento" contenteditable="true" style="cursor: text; border: 1px solid #ccc; border-top: none; border-radius: 0 0 5px 5px; padding: 15px; outline: none; background: #fff; min-height: 100px; line-height: 1.6; margin-bottom: 10px; transition: 0.3s;" onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 5px rgba(52,152,219,0.3)'" onblur="this.style.borderColor='#ccc'; this.style.boxShadow='none'">
                    ${corpoTexto}
                </div>
                
                <div class="footer-estatico" style="margin-top: auto;">
                    ${docFooter}
                </div>

                ${numPaginacaoHtml}
            </div>
        `;
        
        // CSS Dinâmico: Impressão e Paginação
        let style = document.createElement('style'); 
        
        // Regra para criar e incrementar a página (Ativo apenas no contrato)
        let cssPaginacao = '';
        if (tipo === 'contrato') {
            cssPaginacao = `
                /* Define a contagem base na impressão */
                body { counter-reset: pagina; }
                
                /* Configuração oficial Paged Media (W3C Standard) */
                @page {
                    @bottom-right {
                        content: "Página " counter(page);
                        font-family: Arial, sans-serif;
                        font-size: 10px;
                        color: #555;
                    }
                }
                
                /* Fallback para navegadores modernos (Chrome/Edge) */
                .rodape-paginacao {
                    display: block !important;
                    position: fixed;
                    bottom: 10mm;
                    right: 15mm;
                    font-size: 11px;
                    color: #555;
                }
                .rodape-paginacao::after {
                    counter-increment: pagina;
                    content: "Página " counter(pagina);
                }
            `;
        }
     
        style.innerHTML = `
            .rodape-paginacao { display: none; }
            
            @media print { 
                @page { size: A4 portrait; margin: 15mm 15mm 20mm 15mm; }
                #editor-documento { border: none !important; padding: 0 !important; margin: 0 !important; box-shadow: none !important; min-height: auto !important; }
                .print-sheet { box-shadow: none !important; padding: 0 !important; min-height: auto !important; }
                ${cssPaginacao}
            }
        `; 
        printContainer.appendChild(style);

    } catch (e) { App.showToast("Erro ao gerar o documento.", "error"); } 
    finally { btn.innerText = txtOriginal; btn.disabled = false; document.body.style.cursor = 'default'; }
};

// =========================================================
// 🎓 4.3 AMBIENTE DE CERTIFICADOS (Coleção Top 15 Mega Premium)
// =========================================================

App.renderizarMenuCertificados = async () => {
    const div = document.getElementById('app-content');
    div.innerHTML = '<p style="text-align:center; padding:20px; color:#666;">Preparando estúdio de design avançado... 🎓</p>';
    
    try {
        const alunos = await App.api('/alunos');
        const alunosAtivos = alunos.filter(a => !a.status || a.status === 'Ativo');
        const alunosOptions = alunosAtivos.length > 0 
            ? `<option value="">-- Selecione o Aluno Titular --</option>` + alunosAtivos.map(a => `<option value="${a.id}">${App.escapeHTML(a.nome)} (Curso: ${App.escapeHTML(a.curso || '-')})</option>`).join('')
            : `<option value="">Nenhum aluno ativo encontrado</option>`;

        const dh = new Date();
        const dataHojeIso = new Date(dh.getTime() - (dh.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

        const formHTML = `
            <div class="card" style="max-width: 800px; margin: 0 auto; border-top: 4px solid #f39c12;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding-bottom:15px; margin-bottom:25px;">
                    <h3 style="color:#2c3e50; margin:0; display:flex; align-items:center; gap:10px; font-size:18px;">
                        🎓 Emissão de Certificados (Coleção de Luxo)
                    </h3>
                    <button onclick="App.renderizarGeradorDocumentos()" style="background:#ecf0f1; border:none; padding:8px 15px; border-radius:5px; cursor:pointer; font-weight:bold; color:#7f8c8d;">Voltar</button>
                </div>
                
                <p style="font-size:13px; color:#666; margin-bottom:20px;">Selecione os dados e escolha um dos nossos 15 layouts de design internacional extravagante. Visualize no ecrã e descarregue em PDF.</p>
                
                <div style="display:flex; flex-direction:column; gap:20px;">
                    
                    <div style="background:#e8f4f8; padding:15px; border-radius:8px; border:1px solid #3498db; width: 100%; box-sizing: border-box;">
                        <label style="font-weight:bold; font-size:14px; color:#2980b9; display:block; margin-bottom:10px;">1. Destinatário (Aluno Único OU Turma Inteira):</label>
                        <div style="display:grid; grid-template-columns: 1fr auto 1fr; gap:15px; align-items:center;">
                            <select id="cert-aluno" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; cursor:pointer;" onchange="document.getElementById('cert-turma').value='';">${alunosOptions}</select>
                            <span style="font-weight:bold; color:#7f8c8d; text-align:center;">OU</span>
                            <select id="cert-turma" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; cursor:pointer;" onchange="document.getElementById('cert-aluno').value='';">
                                <option value="">-- Por Turma (Gerar em Lote) --</option>
                                ${(await App.api('/turmas')).map(t => `<option value="${t.nome}">${App.escapeHTML(t.nome)}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <div style="background:#fffcf5; padding:15px; border-radius:8px; border:1px solid #e67e22; width: 100%; box-sizing: border-box;">
                        <label style="font-weight:bold; font-size:14px; color:#d35400; display:block; margin-bottom:10px;">2. Coleção Top 15 Design Internacional:</label>
                        <select id="cert-modelo" style="width:100%; padding:12px; border:1px solid #ccc; border-radius:5px; font-weight:bold; cursor:pointer; font-size:15px; color: #2c3e50;">
                            <optgroup label="🌟 Os 5 Novos Modelos Extravagantes">
                                <option value="goldenwaves">🥇 11. Golden Waves Extravaganza (Ondas e Selo Ouro)</option>
                                <option value="silvergeo">🥈 12. Silver Geometric Pro (Geometria e Selo Prata)</option>
                                <option value="bronzeheritage">🥉 13. Bronze Heritage Classic (Tradição e Selo Bronze)</option>
                                <option value="diamond">💎 14. Diamond Holographic (Prismas e Holografia)</option>
                                <option value="imperial">👑 15. Imperial Crimson & Gold (Assimetria Imperial)</option>
                            </optgroup>
                            <optgroup label="✨ A Coleção Elite Anterior">
                                <option value="bluevintage">✨ 01. Blue Vintage Elegant (Modelo PDF Overlayer)</option>
                                <option value="royalgold">👑 02. Executive Royal Gold (Luxo Corporativo Dourado)</option>
                                <option value="moderntech">🚀 03. Modern Tech Innovator (Dark Mode & Neon Ciano)</option>
                                <option value="vibrant">🎨 04. Creative Vibrant Splash (Gradiente Design/Artes)</option>
                                <option value="emerald">🏛️ 05. Classic Emerald University (Verde Ivy League)</option>
                                <option value="artdeco">🍸 06. Art Deco Glamour (Negro e Geometria Ouro 1920)</option>
                                <option value="ruby">🔴 07. Ruby Prestige (Bordô Clássico com Barra Lateral)</option>
                                <option value="startup">⚡ 08. Startup Neo-Brutalism (Impacto Amarelo e Sombras Duras)</option>
                                <option value="ocean">🌊 09. Ocean Flow Abstract (Fluidez Abstrata Ciano)</option>
                                <option value="botanical">🌿 10. Botanical Soft Nature (Verde Sálvia e Creme Bem-estar)</option>
                            </optgroup>
                        </select>
                    </div>

                    <div style="background:#f9f9f9; padding:15px; border-radius:8px; border:1px dashed #ccc; display:flex; gap:15px; flex-wrap:wrap; width: 100%; box-sizing: border-box;">
                        <div style="flex:1; min-width:120px;">
                            <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">Carga Horária (h):</label>
                            <input type="number" id="cert-carga" value="96" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; font-weight:bold; color:#d35400;">
                        </div>
                        <div style="flex:1; min-width:140px;">
                            <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">Data de Início:</label>
                            <input type="date" id="cert-data-inicio" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">
                        </div>
                        <div style="flex:1; min-width:140px;">
                            <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">Data de Conclusão:</label>
                            <input type="date" id="cert-data-fim" value="${dataHojeIso}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">
                        </div>
                    </div>
                </div>

                <div style="margin-top:30px; display:flex; gap:10px;">
                    <button class="btn-primary" style="flex:1; padding:15px; font-size:16px; background:#2c3e50; border:none; box-shadow:0 4px 10px rgba(44, 62, 80, 0.3); justify-content:center; border-radius:8px; cursor:pointer;" onclick="App.abrirPreviewCertificado()">👁️ VISUALIZAR ARTE NO ECRÃ</button>
                </div>
            </div>
            
            <div id="cert-area" style="margin-top: 30px;"></div>
        `;
        div.innerHTML = formHTML;
    } catch (e) { div.innerHTML = '<p>Erro ao carregar dados.</p>'; }
};

// -------------------------------------------------------------------------
// 🏗️ FONTE ÚNICA DE VERDADE: O MEGA-ESTÚDIO DE DESIGN (AGORA COM 15 MODELOS)
// -------------------------------------------------------------------------
App.construirArteCertificado = (aluno, modelo, cargaHoraria, dataInicioStr, dataFimStr, escola) => {
    
    const textoLegal = `inscrito no CPF <b>${App.escapeHTML(aluno.cpf || '___________')}</b> concluiu com êxito o Curso de <b>${App.escapeHTML(aluno.curso || 'Inglês')}</b> com carga horária total de <b>${cargaHoraria} horas</b> entre <b>${dataInicioStr}</b> e <b>${dataFimStr}</b> através da Instituição de Ensino ativa no CNPJ <b>${App.escapeHTML(escola.cnpj || '___________')}</b>. Curso em conformidade com a Lei nº. 9394/96 - Decreto nº. 5.154/04.`;
    const logoImg = escola.foto ? `<img src="${escola.foto}" style="max-height:80px; object-fit:contain; position:relative; z-index:10;">` : `<div style="font-size:24px; font-weight:bold; letter-spacing:2px; position:relative; z-index:10;">${App.escapeHTML(escola.nome)}</div>`;

    // --- SVGs DE SELOS METÁLICOS (Ouro, Prata e Bronze) ---
    const seloOuroSvg = `<svg width="110" height="110" viewBox="0 0 100 100"><defs><linearGradient id="gld" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#F9D423"/><stop offset="50%" stop-color="#FF4E50"/><stop offset="100%" stop-color="#F9D423"/></linearGradient></defs><circle cx="50" cy="50" r="46" fill="none" stroke="#d4af37" stroke-width="2"/><circle cx="50" cy="50" r="41" fill="none" stroke="#d4af37" stroke-width="1" stroke-dasharray="3 3"/><path d="M50 10 L58 35 L85 35 L62 52 L70 80 L50 62 L30 80 L38 52 L15 35 L42 35 Z" fill="url(#gld)" opacity="0.95"/><circle cx="50" cy="50" r="22" fill="#000"/><text x="50" y="52" font-size="8" font-family="Georgia" fill="#d4af37" text-anchor="middle" font-weight="bold">SELO</text><text x="50" y="60" font-size="5" font-family="Arial" fill="#d4af37" text-anchor="middle" letter-spacing="1">OFICIAL</text></svg>`;
    
    const seloPrataSvg = `<svg width="110" height="110" viewBox="0 0 100 100"><defs><linearGradient id="slv" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="50%" stop-color="#C0C0C0"/><stop offset="100%" stop-color="#707070"/></linearGradient></defs><circle cx="50" cy="50" r="46" fill="none" stroke="url(#slv)" stroke-width="3"/><circle cx="50" cy="50" r="41" fill="none" stroke="#999" stroke-width="1" stroke-dasharray="2 2"/><path d="M50 10 L58 35 L85 35 L62 52 L70 80 L50 62 L30 80 L38 52 L15 35 L42 35 Z" fill="url(#slv)" opacity="0.95"/><circle cx="50" cy="50" r="22" fill="#2c3e50"/><text x="50" y="52" font-size="8" font-family="Georgia" fill="#FFF" text-anchor="middle" font-weight="bold">PRATA</text><text x="50" y="60" font-size="5" font-family="Arial" fill="#FFF" text-anchor="middle" letter-spacing="1">PREMIUM</text></svg>`;
    
    const seloBronzeSvg = `<svg width="110" height="110" viewBox="0 0 100 100"><defs><linearGradient id="brz" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#CD7F32"/><stop offset="50%" stop-color="#8C7853"/><stop offset="100%" stop-color="#3b2f2f"/></linearGradient></defs><circle cx="50" cy="50" r="46" fill="none" stroke="url(#brz)" stroke-width="3"/><circle cx="50" cy="50" r="41" fill="none" stroke="#CD7F32" stroke-width="1" stroke-dasharray="4 4"/><path d="M50 10 L58 35 L85 35 L62 52 L70 80 L50 62 L30 80 L38 52 L15 35 L42 35 Z" fill="url(#brz)" opacity="0.95"/><circle cx="50" cy="50" r="22" fill="#3b2f2f"/><text x="50" y="52" font-size="8" font-family="Georgia" fill="#CD7F32" text-anchor="middle" font-weight="bold">BRONZE</text><text x="50" y="60" font-size="5" font-family="Arial" fill="#CD7F32" text-anchor="middle" letter-spacing="1">HERITAGE</text></svg>`;

    // ==========================================
    // 🌟 OS 5 NOVOS MODELOS EXTRAVAGANTES
    // ==========================================

    // 11. GOLDEN WAVES EXTRAVAGANZA
    if (modelo === 'goldenwaves') {
        return `
            <div style="width: 1122px; height: 793px; background-color: #fffdf5; box-sizing: border-box; position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Georgia', serif; padding: 60px;">
                <!-- Ondas de Fundo (Radiant Gradients Multiplos) -->
                <div style="position:absolute; top:-200px; left:-200px; width:700px; height:700px; border-radius:50%; background: radial-gradient(circle, rgba(212,175,55,0.15) 0%, rgba(255,255,255,0) 70%);"></div>
                <div style="position:absolute; bottom:-300px; right:-100px; width:900px; height:900px; border-radius:50%; background: radial-gradient(circle, rgba(212,175,55,0.2) 0%, rgba(255,255,255,0) 70%);"></div>
                <div style="position:absolute; top:40px; left:40px; right:40px; bottom:40px; border: 2px solid #d4af37; z-index:2;"></div>
                
                <div style="z-index:10; margin-bottom: 20px;">${logoImg}</div>
                <h1 style="z-index:10; font-size: 55px; color: #b8860b; letter-spacing: 5px; font-weight: normal; margin-bottom: 10px; text-transform: uppercase;">Certificado de Excelência</h1>
                <p style="z-index:10; font-size: 22px; font-style: italic; color: #555; margin-bottom: 30px;">Temos a suprema honra de certificar</p>
                
                <h2 style="z-index:10; font-size: 60px; color: #000; border-bottom: 3px solid #d4af37; padding: 0 50px 10px 50px; margin-bottom: 30px; font-weight: normal; font-style: italic;">${App.escapeHTML(aluno.nome)}</h2>
                
                <p style="z-index:10; font-size: 20px; line-height: 1.8; color: #444; max-width: 850px; text-align: justify; text-align-last: center; margin-bottom: auto;">${textoLegal}</p>
                
                <div style="z-index:10; display: flex; justify-content: space-between; align-items: flex-end; width: 100%; padding: 0 60px; margin-top: auto; margin-bottom: 20px;">
                    <div style="width: 250px; text-align: center; border-top: 1px solid #b8860b; padding-top: 10px; color: #b8860b; font-size: 16px; font-style:italic;">O Corpo Diretivo</div>
                    <div style="width: 150px; display: flex; justify-content: center; filter: drop-shadow(0 10px 15px rgba(212,175,55,0.4));">${seloOuroSvg}</div>
                    <div style="width: 250px; text-align: center; border-top: 1px solid #b8860b; padding-top: 10px; color: #b8860b; font-size: 16px; font-style:italic;">O Aluno Galardoado</div>
                </div>
            </div>
        `;
    }

    // 12. SILVER GEOMETRIC PRO
    else if (modelo === 'silvergeo') {
        return `
            <div style="width: 1122px; height: 793px; background-color: #ffffff; color: #333; box-sizing: border-box; position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Helvetica Neue', Arial, sans-serif; padding: 60px;">
                <!-- Geometria de Fundo (Clip Path) -->
                <div style="position:absolute; top:0; right:0; width:600px; height:100%; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); clip-path: polygon(30% 0, 100% 0, 100% 100%, 0% 100%); z-index:1;"></div>
                <div style="position:absolute; bottom:0; left:0; width:400px; height:400px; background: #e2e2e2; clip-path: polygon(0 0, 0% 100%, 100% 100%); z-index:1;"></div>
                
                <div style="z-index:10; margin-bottom:20px; align-self:flex-start; margin-left: 40px;">${logoImg}</div>
                
                <h1 style="z-index:10; font-size: 65px; color: #2c3e50; letter-spacing: -2px; font-weight: 900; margin-bottom: 5px; align-self:flex-start; margin-left: 40px; text-transform: uppercase;">CERTIFICADO</h1>
                <p style="z-index:10; font-size: 20px; color: #7f8c8d; margin-bottom: 40px; align-self:flex-start; margin-left: 40px; letter-spacing: 2px;">RECONHECIMENTO DE MÉRITO ACADÉMICO</p>
                
                <h2 style="z-index:10; font-size: 55px; color: #000; background: #fff; padding: 15px 40px; border-left: 8px solid #95a5a6; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); align-self:flex-start; margin-left: 40px; width:80%;">
                    ${App.escapeHTML(aluno.nome)}
                </h2>
                
                <p style="z-index:10; font-size: 19px; line-height: 1.8; color: #444; max-width: 900px; text-align: justify; margin-bottom: auto; background: rgba(255,255,255,0.85); padding: 20px; align-self:flex-start; margin-left: 40px;">${textoLegal}</p>
                
                <div style="z-index:10; display: flex; justify-content: space-between; align-items: flex-end; width: 100%; padding: 0 60px; margin-top: auto; margin-bottom: 20px;">
                    <div style="width: 250px; text-align: center; border-top: 2px solid #7f8c8d; padding-top: 10px; color: #2c3e50; font-size: 14px; font-weight:bold;">A DIREÇÃO</div>
                    <div style="width: 150px; display: flex; justify-content: center;">${seloPrataSvg}</div>
                    <div style="width: 250px; text-align: center; border-top: 2px solid #7f8c8d; padding-top: 10px; color: #2c3e50; font-size: 14px; font-weight:bold;">O ALUNO</div>
                </div>
            </div>
        `;
    }

    // 13. BRONZE HERITAGE CLASSIC
    else if (modelo === 'bronzeheritage') {
        return `
            <div style="width: 1122px; height: 793px; background-color: #2b2118; color: #f4ecd8; box-sizing: border-box; position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, serif; padding: 60px;">
                <div style="position: absolute; top: 25px; left: 25px; right: 25px; bottom: 25px; border: 6px double #CD7F32;"></div>
                <div style="position: absolute; top: 40px; left: 40px; right: 40px; bottom: 40px; border: 1px solid rgba(205,127,50,0.5);"></div>
                
                <div style="z-index:10; margin-bottom:20px;">${logoImg.replace('<img', '<img style="max-height:80px; filter: sepia(1) hue-rotate(-30deg) saturate(1.5) brightness(0.8);"')}</div>
                <h1 style="z-index:10; font-size: 55px; color: #CD7F32; letter-spacing: 8px; font-weight: normal; margin-bottom: 10px; text-transform: uppercase;">Diploma de Honra</h1>
                <p style="z-index:10; font-size: 20px; font-style: italic; color: #b89f81; margin-bottom: 40px;">É com imenso prestígio que outorgamos este título a</p>
                
                <h2 style="z-index:10; font-size: 60px; color: #fff; border-bottom: 1px solid #CD7F32; padding: 0 60px 15px 60px; margin-bottom: 35px; font-weight: normal; font-style: italic; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                    ${App.escapeHTML(aluno.nome)}
                </h2>
                
                <p style="z-index:10; font-size: 19px; line-height: 1.8; color: #d3c4b1; max-width: 850px; text-align: justify; text-align-last: center; margin-bottom: auto;">${textoLegal}</p>
                
                <div style="z-index:10; display: flex; justify-content: space-between; align-items: flex-end; width: 100%; padding: 0 50px; margin-top: auto; margin-bottom: 20px;">
                    <div style="width: 250px; text-align: center; border-top: 1px solid #CD7F32; padding-top: 10px; color: #CD7F32; font-size: 16px;">Assinatura do Diretor</div>
                    <div style="width: 150px; display: flex; justify-content: center; filter: drop-shadow(0 5px 15px rgba(0,0,0,0.8));">${seloBronzeSvg}</div>
                    <div style="width: 250px; text-align: center; border-top: 1px solid #CD7F32; padding-top: 10px; color: #CD7F32; font-size: 16px;">Assinatura do Aluno</div>
                </div>
            </div>
        `;
    }

    // 14. DIAMOND HOLOGRAPHIC (GLASSMORPHISM)
    else if (modelo === 'diamond') {
        return `
            <div style="width: 1122px; height: 793px; background: linear-gradient(45deg, #e6e6fa, #e0ffff, #ffb6c1, #fff0f5); box-sizing: border-box; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; padding: 40px; font-family: 'Segoe UI', Tahoma, sans-serif;">
                <!-- Prismas de Fundo -->
                <div style="position:absolute; top:-100px; left:-50px; width:400px; height:400px; background: rgba(255,255,255,0.4); transform: rotate(45deg); z-index:1;"></div>
                <div style="position:absolute; bottom:-150px; right:-100px; width:600px; height:600px; background: rgba(255,255,255,0.3); transform: rotate(30deg); border: 2px solid rgba(255,255,255,0.8); z-index:1;"></div>
                
                <!-- Painel de Vidro Central (Glassmorphism) -->
                <div style="width: 100%; height: 100%; background: rgba(255, 255, 255, 0.55); border: 1px solid rgba(255,255,255,0.8); border-radius: 20px; z-index: 10; padding: 50px; display: flex; flex-direction: column; align-items: center; text-align: center; box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);">
                    <div style="margin-bottom: 20px;">${logoImg}</div>
                    <h1 style="font-size: 50px; color: #2c3e50; letter-spacing: 10px; font-weight: 300; margin-bottom: 10px; text-transform: uppercase;">CERTIFICADO</h1>
                    <p style="font-size: 18px; color: #7f8c8d; letter-spacing: 3px; margin-bottom: 40px;">DIAMOND EXCELLENCE AWARD</p>
                    
                    <h2 style="font-size: 55px; color: #34495e; margin-bottom: 30px; font-weight: bold; background: linear-gradient(90deg, #8e44ad, #3498db); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        ${App.escapeHTML(aluno.nome)}
                    </h2>
                    
                    <p style="font-size: 18px; line-height: 2; color: #444; max-width: 850px; text-align: justify; text-align-last: center; margin-bottom: auto; font-weight: 500;">${textoLegal}</p>
                    
                    <div style="display: flex; justify-content: space-between; width: 100%; padding: 0 80px; margin-top: auto;">
                        <div style="width: 250px; text-align: center; border-top: 2px solid #bdc3c7; padding-top: 10px; color: #2c3e50; font-size: 13px; font-weight:bold; letter-spacing:1px;">A DIREÇÃO</div>
                        <div style="width: 250px; text-align: center; border-top: 2px solid #bdc3c7; padding-top: 10px; color: #2c3e50; font-size: 13px; font-weight:bold; letter-spacing:1px;">O ALUNO</div>
                    </div>
                </div>
            </div>
        `;
    }

    // 15. IMPERIAL CRIMSON & GOLD
    else if (modelo === 'imperial') {
        return `
            <div style="width: 1122px; height: 793px; background-color: #5a0000; box-sizing: border-box; position: relative; overflow: hidden; display: flex; font-family: 'Times New Roman', serif;">
                <!-- Faixas de Ouro Imperiais -->
                <div style="position: absolute; top: -100px; left: 250px; width: 40px; height: 1200px; background: #d4af37; transform: rotate(20deg); z-index: 1;"></div>
                <div style="position: absolute; top: -100px; left: 320px; width: 10px; height: 1200px; background: #f9d423; transform: rotate(20deg); z-index: 1;"></div>
                
                <!-- Bloco de Texto Principal -->
                <div style="flex: 1; z-index: 10; background: rgba(255,255,255,0.95); margin: 30px 30px 30px 380px; padding: 60px; box-shadow: -15px 0 30px rgba(0,0,0,0.5); display: flex; flex-direction: column; justify-content: center; text-align: left;">
                    
                    <h1 style="font-size: 55px; color: #5a0000; margin-bottom: 5px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Certificado Imperial</h1>
                    <p style="font-size: 20px; color: #666; font-style: italic; margin-bottom: 40px;">É concedida a honraria de conclusão a</p>
                    
                    <h2 style="font-size: 50px; color: #000; border-bottom: 3px solid #d4af37; padding-bottom: 15px; margin-bottom: 30px; display: inline-block; width: 100%;">
                        ${App.escapeHTML(aluno.nome)}
                    </h2>
                    
                    <p style="font-size: 18px; line-height: 1.9; color: #333; text-align: justify; margin-bottom: auto;">${textoLegal}</p>
                    
                    <div style="display: flex; justify-content: space-between; width: 100%; margin-top: auto; margin-bottom: 10px;">
                        <div style="width: 200px; text-align: center; border-top: 1px solid #5a0000; padding-top: 10px; color: #5a0000; font-size: 15px; font-weight:bold;">A Direção Geral</div>
                        <div style="width: 200px; text-align: center; border-top: 1px solid #5a0000; padding-top: 10px; color: #5a0000; font-size: 15px; font-weight:bold;">O Aluno Titular</div>
                    </div>
                </div>

                <!-- Painel Esquerdo Escuro (Logo e Selo) -->
                <div style="position: absolute; top: 0; left: 0; width: 380px; height: 100%; z-index: 5; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 80px 0;">
                    ${logoImg.replace('<img', '<img style="max-height:120px; filter: brightness(0) invert(1) drop-shadow(0 5px 10px rgba(0,0,0,0.5));"')}
                    <div style="filter: drop-shadow(0 15px 20px rgba(0,0,0,0.8)); margin-bottom: 50px;">
                        ${seloOuroSvg}
                    </div>
                </div>
            </div>
        `;
    }

    // ==========================================
    // ✨ A COLEÇÃO ELITE ANTERIOR (1 A 10)
    // ==========================================
    else if (modelo === 'bluevintage') {
        return `
            <div style="width: 1122px; height: 793px; position: relative; background-image: url('Blue Vintage Elegant Achievement Certificate.jpg'); background-size: cover; background-position: center; background-repeat: no-repeat; background-color: #fdfbf7; box-sizing: border-box; overflow: hidden;">
                <div style="position: absolute; top: 130px; width: 100%; text-align: center; color: #1e3799; font-size: 55px; letter-spacing: 5px; font-family: 'Times New Roman', serif;">CERTIFICADO</div>
                <div style="position: absolute; top: 195px; width: 100%; text-align: center; color: #1e3799; font-size: 20px; letter-spacing: 2px; font-family: 'Times New Roman', serif;">DO CURSO DE INGLÊS</div>
                <div style="position: absolute; top: 330px; width: 100%; text-align: center; color: #8B4513; font-size: 55px; font-style: italic; font-family: 'Georgia', serif; font-weight: bold;">${App.escapeHTML(aluno.nome)}</div>
                <div style="position: absolute; top: 460px; left: 111px; width: 900px; text-align: center; color: #222; font-size: 19px; line-height: 1.8; font-family: 'Times New Roman', serif;">${textoLegal}</div>
                <div style="position: absolute; bottom: 120px; left: 160px; width: 300px; text-align: center; font-size: 15px; color: #333; font-family: 'Arial', sans-serif;"><div style="border-bottom: 1px solid #000; margin-bottom: 5px;"></div><b>Assinatura do Diretor e Professor</b></div>
                <div style="position: absolute; bottom: 120px; right: 160px; width: 300px; text-align: center; font-size: 15px; color: #333; font-family: 'Arial', sans-serif;"><div style="border-bottom: 1px solid #000; margin-bottom: 5px;"></div><b>Assinatura do aluno</b></div>
            </div>
        `;
    } 
    else if (modelo === 'royalgold') {
        return `
            <div style="width: 1122px; height: 793px; background-color: #051024; color: #fff; box-sizing: border-box; position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Georgia', serif; padding: 60px;">
                <div style="position: absolute; top: 20px; left: 20px; right: 20px; bottom: 20px; border: 3px solid #d4af37;"></div>
                <div style="position: absolute; top: 30px; left: 30px; right: 30px; bottom: 30px; border: 1px solid #d4af37;"></div>
                <h1 style="font-size: 50px; color: #d4af37; letter-spacing: 6px; font-weight: normal; margin-bottom: 5px; text-transform: uppercase;">Certificado de Conclusão</h1>
                <p style="font-size: 22px; font-style: italic; color: #ccc; margin-bottom: 40px; font-family: 'Times New Roman', serif;">Atestamos com orgulho que</p>
                <h2 style="font-size: 55px; color: #fff; border-bottom: 2px solid #d4af37; padding: 0 60px 10px 60px; margin-bottom: 40px; font-weight: normal; font-style: italic;">${App.escapeHTML(aluno.nome)}</h2>
                <p style="font-size: 20px; line-height: 1.8; color: #ccc; max-width: 850px; text-align: justify; text-align-last: center; margin-bottom: auto; font-family: 'Times New Roman', serif;">${textoLegal}</p>
                <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%; padding: 0 40px; margin-top: auto; margin-bottom: 20px;">
                    <div style="width: 250px; text-align: center; border-top: 1px solid #d4af37; padding-top: 10px; color: #d4af37; font-size: 16px;">A Direção</div>
                    <div style="width: 150px; display: flex; justify-content: center;">${seloOuroSvg}</div>
                    <div style="width: 250px; text-align: center; border-top: 1px solid #d4af37; padding-top: 10px; color: #d4af37; font-size: 16px;">O Aluno Titular</div>
                </div>
            </div>
        `;
    }
    else if (modelo === 'moderntech') {
        return `<div style="width: 1122px; height: 793px; background-color: #0b0c10; color: #c5c6c7; font-family: 'Courier New', monospace; box-sizing: border-box; position: relative; overflow: hidden; padding: 60px; display:flex; flex-direction:column; align-items:center;"><div style="position: absolute; top: 20px; left: 20px; right: 20px; bottom: 20px; border: 2px solid #66fcf1; box-shadow: 0 0 15px rgba(102,252,241,0.5) inset;"></div><div style="margin-bottom: 20px;">${logoImg.replace('<img', '<img style="max-height:60px; filter: brightness(0) invert(1) drop-shadow(0 0 5px #66fcf1);"')}</div><h1 style="color: #66fcf1; text-transform: uppercase; font-size: 45px; letter-spacing: 8px; margin-bottom: 10px;">CERTIFICADO_TECH</h1><p style="color: #45a29e; font-size: 18px; letter-spacing: 2px;">> RECONHECIMENTO DE CONCLUSÃO_</p><h2 style="color: #fff; font-size: 55px; border-bottom: 1px dashed #45a29e; display: inline-block; padding: 10px 40px; margin: 40px 0;">${App.escapeHTML(aluno.nome)}</h2><p style="font-family: Arial, sans-serif; font-size: 18px; line-height: 1.9; color: #c5c6c7; max-width: 850px; text-align: justify; text-align-last: center; margin-bottom: auto;">${textoLegal}</p><div style="display: flex; justify-content: space-between; width: 100%; padding: 0 60px; margin-top: auto; margin-bottom: 20px;"><div style="width: 250px; text-align: center; border-top: 1px solid #66fcf1; padding-top: 10px; color: #66fcf1; font-size: 14px; font-weight:bold;">> DIRETORIA_</div><div style="width: 250px; text-align: center; border-top: 1px solid #66fcf1; padding-top: 10px; color: #66fcf1; font-size: 14px; font-weight:bold;">> ALUNO_</div></div></div>`;
    }
    else if (modelo === 'vibrant') {
        return `<div style="width: 1122px; height: 793px; background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%); padding: 40px; box-sizing: border-box; display: flex; align-items: center; justify-content: center;"><div style="width: 100%; height: 100%; background: rgba(255,255,255,0.92); border-radius: 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.1); padding: 50px; text-align: center; position: relative; display:flex; flex-direction:column; align-items:center;"><div style="margin-bottom:20px;">${logoImg}</div><h1 style="color: #ff758c; font-size: 45px; font-family: Arial, sans-serif; font-weight: 900; letter-spacing: 4px; margin-bottom:10px;">CERTIFICADO</h1><h2 style="color: #333; font-size: 55px; font-family: 'Georgia', serif; font-style: italic; margin: 30px 0; border-bottom: 4px solid #ff758c; display: inline-block; padding-bottom:5px;">${App.escapeHTML(aluno.nome)}</h2><p style="color: #555; font-size: 18px; line-height: 1.9; max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif; text-align: justify; text-align-last: center; margin-bottom: auto;">${textoLegal}</p><div style="display: flex; justify-content: space-between; width: 100%; padding: 0 60px; margin-top: auto;"><div style="width: 250px; text-align: center; border-top: 2px solid #ff758c; padding-top: 10px; color: #ff758c; font-size: 14px; font-weight:bold;">A DIREÇÃO</div><div style="width: 250px; text-align: center; border-top: 2px solid #ff758c; padding-top: 10px; color: #ff758c; font-size: 14px; font-weight:bold;">O ALUNO</div></div></div></div>`;
    }
    else if (modelo === 'emerald') {
        return `<div style="width: 1122px; height: 793px; background-color: #0f4c3a; padding: 40px; box-sizing: border-box; font-family: 'Georgia', serif; position:relative;"><div style="width: 100%; height: 100%; border: 4px solid #d4af37; padding: 10px; box-sizing: border-box;"><div style="width: 100%; height: 100%; border: 1px solid #d4af37; background: #fffcf5; padding: 50px; box-sizing: border-box; display:flex; flex-direction:column; align-items:center;"><div style="margin-bottom:15px;">${logoImg}</div><h1 style="color: #0f4c3a; font-size: 45px; letter-spacing: 6px; margin-bottom: 10px;">CERTIFICADO</h1><p style="color: #777; font-size: 18px; font-style: italic;">Concedido com todas as honras a</p><h2 style="color: #0f4c3a; font-size: 55px; margin: 30px 0; font-weight: normal; border-bottom: 2px solid #d4af37; display: inline-block; padding-bottom: 10px;">${App.escapeHTML(aluno.nome)}</h2><p style="color: #333; font-size: 18px; line-height: 1.9; max-width: 800px; text-align: justify; text-align-last: center; margin-bottom: auto;">${textoLegal}</p><div style="display: flex; justify-content: space-between; width: 100%; padding: 0 40px; margin-top: auto;"><div style="width: 250px; text-align: center; border-top: 1px solid #0f4c3a; padding-top: 10px; color: #0f4c3a; font-size: 15px;">Membro da Direção</div><div style="width: 250px; text-align: center; border-top: 1px solid #0f4c3a; padding-top: 10px; color: #0f4c3a; font-size: 15px;">Assinatura do Aluno</div></div></div></div></div>`;
    }
    else if (modelo === 'artdeco') {
        return `<div style="width: 1122px; height: 793px; background-color: #111; padding: 40px; box-sizing: border-box; position: relative; font-family: 'Trebuchet MS', sans-serif; display:flex; flex-direction:column; align-items:center;"><div style="position: absolute; top: 30px; left: 30px; right: 30px; bottom: 30px; border: 2px solid #f1c40f;"></div><div style="position: absolute; top: 45px; left: 45px; right: 45px; bottom: 45px; border: 1px solid #f1c40f;"></div><div style="margin-top:40px; margin-bottom:20px;">${logoImg.replace('<img', '<img style="max-height:70px; filter: brightness(0) invert(1) sepia(100%) hue-rotate(10deg) saturate(200%);"')}</div><h1 style="color: #f1c40f; font-size: 45px; letter-spacing: 12px; font-weight: 300; margin-bottom:10px;">CERTIFICADO</h1><h2 style="color: #fff; font-size: 50px; margin: 40px 0; font-weight: 300; border-bottom: 1px solid #f1c40f; display: inline-block; padding-bottom: 10px; font-family:'Georgia', serif; font-style:italic;">${App.escapeHTML(aluno.nome)}</h2><p style="color: #ccc; font-size: 18px; line-height: 1.9; max-width: 800px; text-align: justify; text-align-last: center; margin-bottom: auto; font-family: Arial, sans-serif;">${textoLegal}</p><div style="display: flex; justify-content: space-between; width: 100%; padding: 0 80px; margin-top: auto; margin-bottom: 40px;"><div style="width: 250px; text-align: center; border-top: 1px solid #f1c40f; padding-top: 10px; color: #f1c40f; font-size: 14px; letter-spacing:2px;">DIRETORIA</div><div style="width: 250px; text-align: center; border-top: 1px solid #f1c40f; padding-top: 10px; color: #f1c40f; font-size: 14px; letter-spacing:2px;">ALUNO</div></div></div>`;
    }
    else if (modelo === 'ruby') {
        return `<div style="width: 1122px; height: 793px; background-color: #fdfbf7; box-sizing: border-box; position: relative; display: flex;"><div style="width: 280px; background-color: #780000; height: 100%; border-right: 12px solid #d4af37; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px;">${logoImg.replace('<img', '<img style="max-height:100px; filter: brightness(0) invert(1);"')}</div><div style="flex: 1; padding: 70px 60px; text-align: left; font-family: 'Georgia', serif; display:flex; flex-direction:column;"><h1 style="color: #780000; font-size: 55px; letter-spacing: 2px; margin-bottom: 10px; text-transform:uppercase;">Certificado</h1><p style="color: #666; font-size: 20px; font-style: italic;">Certificamos com distinção que</p><h2 style="color: #000; font-size: 50px; margin: 40px 0; border-bottom: 3px solid #d4af37; padding-bottom: 10px; display: inline-block; width:fit-content;">${App.escapeHTML(aluno.nome)}</h2><p style="color: #333; font-size: 18px; line-height: 1.9; max-width: 700px; text-align: justify; margin-bottom: auto;">${textoLegal}</p><div style="display: flex; justify-content: space-between; width: 100%; padding-right: 40px; margin-top: auto;"><div style="width: 250px; text-align: center; border-top: 1px solid #780000; padding-top: 10px; color: #780000; font-size: 15px;">Assinatura da Direção</div><div style="width: 250px; text-align: center; border-top: 1px solid #780000; padding-top: 10px; color: #780000; font-size: 15px;">Assinatura do Aluno</div></div></div></div>`;
    }
    else if (modelo === 'startup') {
        return `<div style="width: 1122px; height: 793px; background-color: #f1c40f; padding: 50px; box-sizing: border-box; font-family: 'Arial Black', Arial, sans-serif;"><div style="width: 100%; height: 100%; background: #fff; border: 8px solid #000; box-shadow: 15px 15px 0px #000; padding: 50px; box-sizing: border-box; display: flex; flex-direction: column; position:relative;"><div style="position:absolute; top:40px; right:40px;">${logoImg}</div><h1 style="color: #000; font-size: 60px; text-transform: uppercase; margin: 0; letter-spacing: -2px;">CERTIFICADO_</h1><p style="color: #000; font-size: 18px; font-weight: bold; margin-bottom: 40px;">PROJETO CONCLUÍDO COM SUCESSO</p><h2 style="color: #e74c3c; font-size: 55px; border-bottom: 8px solid #000; display: inline-block; padding-bottom: 5px; margin-bottom: 30px; width:fit-content;">${App.escapeHTML(aluno.nome)}</h2><p style="color: #000; font-size: 18px; font-family: Arial, sans-serif; font-weight: bold; line-height: 1.8; max-width: 850px; text-align:justify; margin-bottom:auto;">${textoLegal}</p><div style="display: flex; justify-content: flex-start; gap:80px; width: 100%; margin-top: auto;"><div style="width: 250px; border-top: 4px solid #000; padding-top: 10px; color: #000; font-size: 16px; font-weight:900;">ADMINISTRAÇÃO //</div><div style="width: 250px; border-top: 4px solid #000; padding-top: 10px; color: #000; font-size: 16px; font-weight:900;">ALUNO //</div></div></div></div>`;
    }
    else if (modelo === 'ocean') {
        return `<div style="width: 1122px; height: 793px; background: linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%); padding: 40px; box-sizing: border-box; display:flex; align-items:center; justify-content:center;"><div style="width: 100%; height: 100%; background: rgba(255,255,255,0.85); border-radius: 20px; padding: 60px; text-align: center; font-family: 'Segoe UI', Tahoma, sans-serif; box-sizing: border-box; display:flex; flex-direction:column; align-items:center;"><div style="margin-bottom:20px;">${logoImg}</div><h1 style="color: #3498db; font-size: 45px; font-weight: 300; letter-spacing: 5px; margin-bottom:10px;">CERTIFICADO</h1><h2 style="color: #2c3e50; font-size: 55px; font-weight: bold; margin: 30px 0; border-bottom: 2px solid #3498db; display: inline-block; padding-bottom: 10px;">${App.escapeHTML(aluno.nome)}</h2><p style="color: #555; font-size: 18px; line-height: 1.9; max-width: 800px; text-align: justify; text-align-last: center; margin-bottom: auto;">${textoLegal}</p><div style="display: flex; justify-content: space-between; width: 100%; padding: 0 60px; margin-top: auto;"><div style="width: 250px; text-align: center; border-top: 1px solid #3498db; padding-top: 10px; color: #3498db; font-size: 14px; font-weight:bold;">A Direção</div><div style="width: 250px; text-align: center; border-top: 1px solid #3498db; padding-top: 10px; color: #3498db; font-size: 14px; font-weight:bold;">O Aluno</div></div></div></div>`;
    }
    else if (modelo === 'botanical') {
        return `<div style="width: 1122px; height: 793px; background-color: #F8EFE6; padding: 50px; box-sizing: border-box; font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, serif;"><div style="width: 100%; height: 100%; border: 2px solid #C1D5C0; padding: 15px; box-sizing: border-box;"><div style="width: 100%; height: 100%; border: 1px solid #C1D5C0; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 50px; box-sizing: border-box; text-align: center;"><div style="margin-bottom:15px;">${logoImg}</div><h1 style="color: #5c715e; font-size: 40px; letter-spacing: 4px; margin-bottom: 10px; font-weight: normal;">CERTIFICADO DE CONCLUSÃO</h1><h2 style="color: #333; font-size: 55px; margin: 30px 0; font-style: italic; font-weight: normal; border-bottom: 1px solid #8ba888; padding-bottom: 10px;">${App.escapeHTML(aluno.nome)}</h2><p style="color: #555; font-size: 18px; line-height: 1.9; max-width: 750px; text-align: justify; text-align-last: center; margin-bottom: auto;">${textoLegal}</p><div style="display: flex; justify-content: space-between; width: 100%; padding: 0 40px; margin-top: auto;"><div style="width: 250px; text-align: center; border-top: 1px solid #C1D5C0; padding-top: 10px; color: #5c715e; font-size: 15px;">Membro da Direção</div><div style="width: 250px; text-align: center; border-top: 1px solid #C1D5C0; padding-top: 10px; color: #5c715e; font-size: 15px;">O Aluno Titular</div></div></div></div></div>`;
    }
};

// -------------------------------------------------------------------------
// 👁️ O CINEMA PRIVADO: FUNÇÃO PARA VISUALIZAR O CERTIFICADO NO ECRÃ
// -------------------------------------------------------------------------
App.abrirPreviewCertificado = async () => {
    const idAluno = document.getElementById('cert-aluno').value;
    const nomeTurmaLote = document.getElementById('cert-turma').value;
    const modelo = document.getElementById('cert-modelo').value;
    const cargaHoraria = document.getElementById('cert-carga').value || '40';
    
    const inputInicio = document.getElementById('cert-data-inicio');
    const dataInicioStr = (inputInicio && inputInicio.value) ? inputInicio.value.split('-').reverse().join('/') : '-';
    
    const inputFim = document.getElementById('cert-data-fim');
    const dataFimStr = (inputFim && inputFim.value) ? inputFim.value.split('-').reverse().join('/') : new Date().toLocaleDateString('pt-BR');

    if (!idAluno && !nomeTurmaLote) return App.showToast("Selecione um aluno ou uma turma para visualizar.", "warning");

    try {
        const [alunosLista, escola] = await Promise.all([ App.api('/alunos'), App.api('/escola') || { nome: 'A INSTITUIÇÃO', cnpj: '00.000.000/0000-00' } ]);

        let alunoAmostra = null;
        let infoLoteText = '';

        if (nomeTurmaLote) {
            const turmaBusca = nomeTurmaLote.trim().toLowerCase();
            const alunosTurma = alunosLista.filter(a => a.turma && a.turma.trim().toLowerCase() === turmaBusca && (!a.status || a.status === 'Ativo'));
            if (alunosTurma.length === 0) throw new Error("A turma selecionada não tem alunos ativos.");
            alunoAmostra = alunosTurma[0]; 
            infoLoteText = `(Mostrando 1 de ${alunosTurma.length} alunos da turma)`;
        } else {
            alunoAmostra = alunosLista.find(a => a.id === idAluno);
        }

        const arteHtml = App.construirArteCertificado(alunoAmostra, modelo, cargaHoraria, dataInicioStr, dataFimStr, escola);

        let modal = document.getElementById('modal-preview-cert');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-preview-cert';
            modal.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:9999; display:flex; flex-direction:column; align-items:center; justify-content:center; backdrop-filter:blur(5px); opacity:0; transition: opacity 0.3s;';
            document.body.appendChild(modal);
        }

        const scale = Math.min((window.innerWidth * 0.9) / 1122, (window.innerHeight * 0.75) / 793);

        modal.innerHTML = `
            <div style="background: white; padding: 15px 30px; border-radius: 8px 8px 0 0; width: 100%; max-width: 1122px; display: flex; justify-content: space-between; align-items: center; box-sizing: border-box;">
                <div style="color: #2c3e50; font-weight: bold; font-size: 16px;">👁️ Pré-Visualização da Arte ${infoLoteText}</div>
                <button onclick="document.getElementById('modal-preview-cert').style.opacity='0'; setTimeout(()=>document.getElementById('modal-preview-cert').style.display='none', 300);" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #c0392b;">✖</button>
            </div>
            
            <div style="width: 100%; display: flex; justify-content: center; align-items: center; flex: 1; overflow: hidden; padding: 20px;">
                <div style="width: 1122px; height: 793px; transform: scale(${scale}); transform-origin: center center; box-shadow: 0 15px 35px rgba(0,0,0,0.5);">
                    ${arteHtml}
                </div>
            </div>

            <div style="background: white; padding: 15px 30px; border-radius: 0 0 8px 8px; width: 100%; max-width: 1122px; display: flex; justify-content: center; gap: 20px; box-sizing: border-box;">
                <button onclick="document.getElementById('modal-preview-cert').style.opacity='0'; setTimeout(()=>document.getElementById('modal-preview-cert').style.display='none', 300);" style="padding: 12px 25px; border-radius: 5px; border: 1px solid #ccc; background: #fff; cursor: pointer; font-weight: bold; color: #555;">VOLTAR PARA EDIÇÃO</button>
                <button onclick="App.gerarPdfAltaResolucao()" style="padding: 12px 25px; border-radius: 5px; border: none; background: #27ae60; cursor: pointer; font-weight: bold; color: white; box-shadow: 0 4px 10px rgba(39, 174, 96, 0.3);">📥 APROVAR E GERAR PDF</button>
            </div>
        `;

        modal.style.display = 'flex';
        setTimeout(() => modal.style.opacity = '1', 50);

    } catch (e) {
        App.showToast(e.message || "Erro ao gerar pré-visualização.", "error");
    }
};

// -------------------------------------------------------------------------
// 🖨️ MOTOR INVISÍVEL: GERAÇÃO DE PDF EM LOTE (JSPDF + HTML2CANVAS)
// -------------------------------------------------------------------------
App.gerarPdfAltaResolucao = async () => {
    const modal = document.getElementById('modal-preview-cert');
    if(modal) { modal.style.opacity = '0'; setTimeout(() => modal.style.display = 'none', 300); }

    const idAluno = document.getElementById('cert-aluno').value;
    const nomeTurmaLote = document.getElementById('cert-turma').value;
    const modelo = document.getElementById('cert-modelo').value;
    const cargaHoraria = document.getElementById('cert-carga').value || '40';
    
    const inputInicio = document.getElementById('cert-data-inicio');
    const dataInicioStr = (inputInicio && inputInicio.value) ? inputInicio.value.split('-').reverse().join('/') : '-';
    
    const inputFim = document.getElementById('cert-data-fim');
    const dataFimStr = (inputFim && inputFim.value) ? inputFim.value.split('-').reverse().join('/') : new Date().toLocaleDateString('pt-BR');

    App.showToast("Iniciando Renderização Fotográfica. Aguarde... ⏳", "info");
    document.body.style.cursor = 'wait';

    try {
        if (!window.jspdf || !window.html2canvas) {
            throw new Error("Bibliotecas de PDF não instaladas. Certifique-se de que colou os links no index.html!");
        }

        const [alunosLista, escola] = await Promise.all([ App.api('/alunos'), App.api('/escola') || { nome: 'A INSTITUIÇÃO', cnpj: '00.000.000/0000-00' } ]);

        let alunosParaEmitir = [];
        if (nomeTurmaLote) {
            const turmaBusca = nomeTurmaLote.trim().toLowerCase();
            alunosParaEmitir = alunosLista.filter(a => a.turma && a.turma.trim().toLowerCase() === turmaBusca && (!a.status || a.status === 'Ativo'));
        } else {
            alunosParaEmitir.push(alunosLista.find(a => a.id === idAluno));
        }

        let studio = document.getElementById('pdf-photo-studio');
        if (!studio) {
            studio = document.createElement('div');
            studio.id = 'pdf-photo-studio';
            studio.style.cssText = 'position:fixed; top:-9999px; left:-9999px; z-index:-1;';
            document.body.appendChild(studio);
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

        for (let i = 0; i < alunosParaEmitir.length; i++) {
            const aluno = alunosParaEmitir[i];
            
            studio.innerHTML = App.construirArteCertificado(aluno, modelo, cargaHoraria, dataInicioStr, dataFimStr, escola);
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(studio.children[0], {
                scale: 2, 
                useCORS: true, 
                logging: false,
                backgroundColor: null
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);

            if (i > 0) doc.addPage();
            doc.addImage(imgData, 'JPEG', 0, 0, 297, 210);
            
            if (alunosParaEmitir.length > 5) App.showToast(`Processando ${i+1}/${alunosParaEmitir.length}...`, "info");
        }

        const nomeArquivo = alunosParaEmitir.length > 1 ? `Certificados_Lote_${nomeTurmaLote.replace(/\s+/g, '_')}.pdf` : `Certificado_${alunosParaEmitir[0].nome.replace(/\s+/g, '_')}.pdf`;
        doc.save(nomeArquivo);
        App.showToast("✅ PDF da Coleção Elite gerado com sucesso!", "success");

    } catch (e) { 
        App.showToast(e.message || "Erro na geração do PDF.", "error"); 
    } finally { 
        document.body.style.cursor = 'default'; 
        const studioCleanup = document.getElementById('pdf-photo-studio');
        if (studioCleanup) studioCleanup.remove();
    }
};