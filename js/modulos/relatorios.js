// =========================================================
// MÓDULO RELATÓRIOS V100 (FINAL E INTEGRADO)
// =========================================================

App.renderizarRelatorioModulo = async (tipo) => {
    if (tipo === 'fin_detalhado' || tipo === 'financeiro') { App.setTitulo("Relatórios Financeiros"); App.renderizarSelecaoRelatorio(); return; }
    if (tipo === 'dossie') { App.renderizarDossie(); return; }
    if (tipo === 'ficha') { App.gerarFichaSetup(); return; }
};

// 1. RELATÓRIO FINANCEIRO (LAYOUT V99)
App.renderizarSelecaoRelatorio = () => {
    const div = document.getElementById('app-content');
    div.innerHTML = `<div class="card" style="max-width: 600px; margin: 40px auto; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);"><div style="display:flex; align-items:center; gap:10px; margin-bottom:20px;"><span style="font-size:24px;">🗓️</span><h2 style="margin:0; color:#2c3e50;">Selecionar Período</h2></div><p style="color:#666; margin-bottom:20px;">Selecione o ano para ver as opções.</p><label style="font-weight:bold; color:#333; display:block; margin-bottom:5px;">Selecione o Ano Base:</label><select id="rel-ano" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px; font-size:16px; margin-bottom:25px; background:white;"><option value="${new Date().getFullYear()+1}">${new Date().getFullYear()+1}</option><option value="${new Date().getFullYear()}" selected>${new Date().getFullYear()}</option><option value="${new Date().getFullYear()-1}">${new Date().getFullYear()-1}</option></select><button onclick="App.gerarRelatorioAnual()" style="width:100%; padding:15px; background: #8e44ad; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 14px; cursor: pointer; display:flex; justify-content:space-between; align-items:center; box-shadow: 0 4px 10px rgba(142, 68, 173, 0.3);">📄 RELATÓRIO GERAL DO ANO TODO <span>➜</span></button><div style="text-align:center; margin: 25px 0; color:#999; font-size:12px; font-weight:bold;">OU SELECIONE UM MÊS</div><div style="display:flex; gap:10px;"><select id="rel-mes" style="flex:2; padding:12px; border:1px solid #ddd; border-radius:8px; font-size:14px; background:white;">${['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'].map((m,i)=>`<option value="${i+1}" ${i===new Date().getMonth()?'selected':''}>${m}</option>`).join('')}</select><button onclick="App.gerarRelatorioMensal()" style="flex:1; background: #2980b9; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 10px rgba(41, 128, 185, 0.3);">VER MÊS</button></div></div>`;
};

App.gerarRelatorioAnual = async () => {
    const ano = document.getElementById('rel-ano').value;
    const div = document.getElementById('app-content'); div.innerHTML = 'Gerando...';
    try {
        const financeiro = await fetch(`${API_URL}/financeiro`).then(r => r.json());
        const escola = JSON.parse(localStorage.getItem('escola_perfil')) || { nome: 'ESCOLA', cnpj: '' };
        const logo = escola.foto ? `<img src="${escola.foto}" style="height:50px;">` : '';
        const dados = financeiro.filter(f => f.vencimento && f.vencimento.startsWith(ano)).sort((a,b) => new Date(a.vencimento) - new Date(b.vencimento));
        const totalLancado = dados.reduce((acc, c) => acc + parseFloat(c.valor), 0);
        const totalRecebido = dados.filter(f => f.status === 'Pago').reduce((acc, c) => acc + parseFloat(c.valor), 0);
        const totalPendente = dados.filter(f => f.status !== 'Pago').reduce((acc, c) => acc + parseFloat(c.valor), 0);
        const fmt = (v) => v.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});

        div.innerHTML = `
            <div class="no-print" style="margin-bottom:20px;">
                <button onclick="App.renderizarSelecaoRelatorio()" style="background:#7f8c8d; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">⬅ VOLTAR</button>
            </div>
            <div class="print-sheet" style="padding:40px; font-family:'Segoe UI', sans-serif;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <div style="display:flex; gap:15px; align-items:center;">
                        ${logo}
                        <div><h2 style="margin:0; text-transform:uppercase; color:#2c3e50;">${escola.nome}</h2><div style="font-size:12px; color:#666;">CNPJ: ${escola.cnpj}<br>Relatório Analítico Anual</div></div>
                    </div>
                    <div style="text-align:right;">
                        <h1 style="margin:0; font-size:24px; color:#2c3e50;">EXERCÍCIO ${ano}</h1>
                        <div style="font-size:10px; color:#999;">Emissão: ${new Date().toLocaleString('pt-BR')}</div>
                    </div>
                </div>
                <div style="border-bottom:2px dashed #ccc; margin-bottom:20px;"></div>
                <div style="display:flex; justify-content:space-between; background:#fafafa; padding:20px; border-radius:8px; margin-bottom:30px; border:1px solid #eee;">
                    <div><div style="font-size:12px; font-weight:bold; color:#555;">TOTAL LANÇADO:</div><div style="font-size:18px; font-weight:bold; color:#333;">${fmt(totalLancado)}</div></div>
                    <div><div style="font-size:12px; font-weight:bold; color:green;">TOTAL RECEBIDO:</div><div style="font-size:18px; color:green;">${fmt(totalRecebido)}</div></div>
                    <div><div style="font-size:12px; font-weight:bold; color:red;">TOTAL PENDENTE:</div><div style="font-size:18px; color:red;">${fmt(totalPendente)}</div></div>
                </div>
                <table style="width:100%; border-collapse:collapse; font-size:11px; color:#555;">
                    <thead style="background:#f4f6f7; color:#7f8c8d; text-transform:uppercase;">
                        <tr>
                            <th style="padding:10px; text-align:left;">VENCIMENTO</th>
                            <th style="padding:10px; text-align:left;">ALUNO</th>
                            <th style="padding:10px; text-align:left;">DESCRIÇÃO DO PRODUTO</th>
                            <th style="padding:10px; text-align:center;">STATUS / FORMA</th>
                            <th style="padding:10px; text-align:right;">RECEBIDO</th>
                            <th style="padding:10px; text-align:right;">PENDENTE</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${dados.map(f => { 
                            const isPago = f.status === 'Pago'; 
                            let textoStatus = isPago ? 'PAGO' : 'ABERTO';
                            if(isPago && f.formaPagamento) {
                                textoStatus += `<br><span style="font-size:9px; color:#666; display:block; line-height:1.2; margin-top:2px;">${f.formaPagamento}${f.formaPagamento2 ? ` / ${f.formaPagamento2}` : ''}<br>Pago em: ${f.dataPagamento ? f.dataPagamento.split('-').reverse().join('/') : ''}</span>`;
                            }
                            return `<tr style="border-bottom:1px solid #eee;">
                                <td style="padding:10px;">${f.vencimento.split('-').reverse().join('/')}</td>
                                <td style="padding:10px;">${f.alunoNome || 'Não informado'}</td>
                                <td style="padding:10px;">${f.descricao}</td>
                                <td style="padding:10px; text-align:center; font-weight:bold; color:${isPago ? 'green' : 'red'};">${textoStatus}</td>
                                <td style="padding:10px; text-align:right;">${isPago ? fmt(parseFloat(f.valor)) : '-'}</td>
                                <td style="padding:10px; text-align:right;">${!isPago ? fmt(parseFloat(f.valor)) : '-'}</td>
                            </tr>`; 
                        }).join('')}
                    </tbody>
                    <tfoot>
                        <tr style="background:#f9f9f9; font-weight:bold;">
                            <td colspan="4" style="padding:15px; text-align:right;">SALDO FINAL:</td>
                            <td style="padding:15px; text-align:right; color:green;">${fmt(totalRecebido)}</td>
                            <td style="padding:15px; text-align:right; color:red;">${fmt(totalPendente)}</td>
                        </tr>
                    </tfoot>
                </table>
                <div class="no-print" style="margin-top:30px;">
                    <button onclick="window.print()" style="width:100%; padding:15px; background: #8e44ad; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; display:flex; justify-content:center; align-items:center; gap:10px;">🖨️ IMPRIMIR EXTRATO</button>
                </div>
            </div>`;
    } catch(e) { alert("Erro ao gerar relatório."); }
};

App.gerarRelatorioMensal = async () => {
    const ano = document.getElementById('rel-ano').value;
    const mesIdx = parseInt(document.getElementById('rel-mes').value);
    const div = document.getElementById('app-content'); div.innerHTML = 'Gerando...';
    const meses = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
    const mesNome = meses[mesIdx - 1];

    try {
        const financeiro = await fetch(`${API_URL}/financeiro`).then(r => r.json());
        const escola = JSON.parse(localStorage.getItem('escola_perfil')) || { nome: 'ESCOLA', cnpj: '' };
        const logo = escola.foto ? `<img src="${escola.foto}" style="height:50px;">` : '';
        const dados = financeiro.filter(f => { if(!f.vencimento) return false; const d = new Date(f.vencimento + 'T00:00:00'); return d.getFullYear() == ano && (d.getMonth() + 1) == mesIdx; }).sort((a,b) => new Date(a.vencimento) - new Date(b.vencimento));
        const previsao = dados.reduce((acc, c) => acc + parseFloat(c.valor), 0);
        const realizado = dados.filter(f => f.status === 'Pago').reduce((acc, c) => acc + parseFloat(c.valor), 0);
        const pendente = dados.filter(f => f.status !== 'Pago').reduce((acc, c) => acc + parseFloat(c.valor), 0);
        const fmt = (v) => v.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});

        div.innerHTML = `
            <div class="no-print" style="margin-bottom:20px;">
                <button onclick="App.renderizarSelecaoRelatorio()" style="background:#7f8c8d; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">⬅ VOLTAR</button>
            </div>
            <div class="print-sheet" style="padding:40px; font-family:'Segoe UI', sans-serif;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                    <div style="display:flex; gap:15px; align-items:center;">
                        ${logo}<div><h3 style="margin:0; text-transform:uppercase; color:#2c3e50;">${escola.nome}</h3><div style="font-size:11px; color:#666;">CNPJ: ${escola.cnpj}</div></div>
                    </div>
                    <div style="text-align:right;">
                        <h2 style="margin:0; font-size:20px; color:#2980b9;">${mesNome} / ${ano}</h2><div style="font-size:10px; color:#999;">Relatório Mensal<br>Emissão: ${new Date().toLocaleString('pt-BR')}</div>
                    </div>
                </div>
                <div style="display:flex; gap:15px; margin-bottom:30px;">
                    <div style="flex:1; background:#34495e; color:white; padding:15px; border-radius:8px; text-align:center;"><div style="font-size:10px; text-transform:uppercase; opacity:0.8;">PREVISÃO</div><div style="font-size:20px; font-weight:bold;">${fmt(previsao)}</div></div>
                    <div style="flex:1; background:#27ae60; color:white; padding:15px; border-radius:8px; text-align:center;"><div style="font-size:10px; text-transform:uppercase; opacity:0.8;">REALIZADO</div><div style="font-size:20px; font-weight:bold;">${fmt(realizado)}</div></div>
                    <div style="flex:1; background:#e74c3c; color:white; padding:15px; border-radius:8px; text-align:center;"><div style="font-size:10px; text-transform:uppercase; opacity:0.8;">PENDENTE</div><div style="font-size:20px; font-weight:bold;">${fmt(pendente)}</div></div>
                </div>
                <table style="width:100%; border-collapse:collapse; font-size:11px; color:#555;">
                    <thead style="background:#f4f6f7; color:#7f8c8d; text-transform:uppercase;">
                        <tr>
                            <th style="padding:10px; text-align:left;">VENCIMENTO</th>
                            <th style="padding:10px; text-align:left;">ALUNO</th>
                            <th style="padding:10px; text-align:left;">DESCRIÇÃO DO PRODUTO</th>
                            <th style="padding:10px; text-align:center;">STATUS / FORMA</th>
                            <th style="padding:10px; text-align:right;">VALOR</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${dados.map(f => { 
                            const isPago = f.status === 'Pago'; 
                            let textoStatus = isPago ? 'PAGO' : 'PENDENTE';
                            if(isPago && f.formaPagamento) {
                                textoStatus += `<br><span style="font-size:9px; color:#666; display:block; line-height:1.2; margin-top:2px;">${f.formaPagamento}${f.formaPagamento2 ? ` / ${f.formaPagamento2}` : ''}<br>Pago em: ${f.dataPagamento ? f.dataPagamento.split('-').reverse().join('/') : ''}</span>`;
                            }
                            return `<tr style="border-bottom:1px solid #eee;">
                                <td style="padding:10px;">${f.vencimento.split('-').reverse().join('/')}</td>
                                <td style="padding:10px;">${f.alunoNome || 'Não informado'}</td>
                                <td style="padding:10px;">${f.descricao}</td>
                                <td style="padding:10px; text-align:center; font-weight:bold; color:${isPago ? 'green' : 'red'};">${textoStatus}</td>
                                <td style="padding:10px; text-align:right;">${fmt(parseFloat(f.valor))}</td>
                            </tr>`; 
                        }).join('')}
                    </tbody>
                </table>
                <div class="no-print" style="margin-top:30px;">
                    <button onclick="window.print()" style="width:100%; padding:15px; background: #34495e; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; display:flex; justify-content:center; align-items:center; gap:10px;">🖨️ IMPRIMIR</button>
                </div>
            </div>`;
    } catch(e) { alert("Erro ao gerar relatório mensal."); }
};

// =========================================================
// 2. SUPER DOSSIÊ EXECUTIVO (BI)
// =========================================================

// Função 1: Abre a tela para escolher Mês e Ano
App.renderizarDossie = () => {
    App.setTitulo("Dossiê Executivo BI");
    const div = document.getElementById('app-content');
    const anoAtual = new Date().getFullYear();
    const mesAtual = new Date().getMonth() + 1;
    
    div.innerHTML = `
        <div class="card" style="max-width: 600px; margin: 40px auto; padding: 40px; border-radius: 15px; text-align:center;">
            <div style="font-size:48px; margin-bottom:15px;">📊</div>
            <h2 style="margin:0 0 10px 0; color:#2c3e50;">Dossiê Executivo (BI)</h2>
            <p style="color:#666; margin-bottom:25px;">Selecione o período de referência para gerar a análise profunda.</p>
            
            <div style="display:flex; gap:15px; max-width: 400px; margin: 0 auto 25px auto;">
                <div style="flex:1; text-align:left;">
                    <label style="font-weight:bold; color:#333; display:block; margin-bottom:5px;">Mês Vigente:</label>
                    <select id="dossie-mes" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px;">
                        ${['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'].map((m,i)=>`<option value="${i+1}" ${i+1===mesAtual?'selected':''}>${m}</option>`).join('')}
                    </select>
                </div>
                <div style="flex:1; text-align:left;">
                    <label style="font-weight:bold; color:#333; display:block; margin-bottom:5px;">Ano:</label>
                    <input type="number" id="dossie-ano" value="${anoAtual}" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px; text-align:center;">
                </div>
            </div>
            
            <button onclick="App.gerarDossie()" class="btn-primary" style="padding:15px; font-size:16px; width:100%; max-width:400px;">GERAR DOSSIÊ ➜</button>
        </div>
    `;
};

App.gerarDossie = async () => {
    const ano = document.getElementById('dossie-ano').value;
    const mesIdx = parseInt(document.getElementById('dossie-mes').value);
    const nomeMes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][mesIdx-1];
    
    const div = document.getElementById('app-content'); 
    div.innerHTML = '<p style="text-align:center; padding:20px;">Processando Inteligência de Negócios...</p>';
    
    try {
        const [alunos, turmas, cursos, financeiro, escola] = await Promise.all([
            App.api('/alunos'), App.api('/turmas'), App.api('/cursos'), 
            App.api('/financeiro'), App.api('/escola')
        ]);
        
        const dataHoje = new Date();
        const fmt = (v) => parseFloat(v || 0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
        const getVal = (f) => parseFloat(f.valorPago1 || f.valor) + parseFloat(f.valorPago2 || 0);
        const isVenda = (f) => (f.descricao && f.descricao.toLowerCase().includes('venda')) || (f.idCarne && f.idCarne.includes('VENDA'));

        // --- DADOS FINANCEIROS ---
        const finAno = financeiro.filter(f => f.vencimento && f.vencimento.startsWith(ano) && f.tipo === 'Receita');
        const finMes = finAno.filter(f => parseInt(f.vencimento.split('-')[1]) === mesIdx);
        
        const entradaBrutaAno = finAno.filter(f => f.status === 'Pago').reduce((a, c) => a + getVal(c), 0);
        const esperadoAnoMensalidade = finAno.filter(f => !isVenda(f)).reduce((a, c) => a + parseFloat(c.valor), 0);
        const esperadoMesMensalidade = finMes.filter(f => !isVenda(f)).reduce((a, c) => a + parseFloat(c.valor), 0);
        const inadimplenciaGeral = financeiro.filter(f => f.status === 'Pendente' && f.tipo === 'Receita' && new Date(f.vencimento + 'T00:00:00') < dataHoje).reduce((a, c) => a + parseFloat(c.valor), 0);
        
        const entradaMesMensalidade = finMes.filter(f => f.status === 'Pago' && !isVenda(f)).reduce((a, c) => a + getVal(c), 0);
        const entradaMesVenda = finMes.filter(f => f.status === 'Pago' && isVenda(f)).reduce((a, c) => a + getVal(c), 0);
        const entradaMesTotal = entradaMesMensalidade + entradaMesVenda;

        // Formas de Pagamento (Mês)
        const formasMensalidade = {}; const formasVenda = {};
        finMes.filter(f => f.status === 'Pago').forEach(p => {
            const target = isVenda(p) ? formasVenda : formasMensalidade;
            const fp1 = p.formaPagamento || 'Outros'; const fp2 = p.formaPagamento2;
            target[fp1] = (target[fp1] || 0) + parseFloat(p.valorPago1 || p.valor);
            if(fp2) target[fp2] = (target[fp2] || 0) + parseFloat(p.valorPago2 || 0);
        });

        // Histórico de Meses
        let linhasHistorico = '';
        let acumuladoHistorico = 0;
        for(let i = 1; i <= mesIdx; i++) {
            const fM = finAno.filter(f => parseInt(f.vencimento.split('-')[1]) === i && f.status === 'Pago');
            const vM = fM.filter(f => !isVenda(f)).reduce((a,c) => a+getVal(c), 0);
            const vV = fM.filter(f => isVenda(f)).reduce((a,c) => a+getVal(c), 0);
            const tot = vM + vV;
            acumuladoHistorico += tot;
            linhasHistorico += `<tr><td>${['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][i-1]}</td><td style="text-align:right; color:#2980b9;">${fmt(vM)}</td><td style="text-align:right; color:#8e44ad;">${fmt(vV)}</td><td style="text-align:right; font-weight:bold;">${fmt(tot)}</td></tr>`;
        }

        // --- DADOS PEDAGÓGICOS ---
        const alunosTurma = {}; turmas.forEach(t => alunosTurma[t.nome] = 0);
        const alunosCurso = {}; cursos.forEach(c => alunosCurso[c.nome] = 0);
        alunos.forEach(a => { 
            if(a.turma && alunosTurma[a.turma] !== undefined) alunosTurma[a.turma]++; 
            if(a.curso && alunosCurso[a.curso] !== undefined) alunosCurso[a.curso]++;
        });
        
        // --- DEMOGRAFIA ---
        const masc = alunos.filter(a => a.sexo === 'Masculino').length;
        const fem = alunos.filter(a => a.sexo === 'Feminino').length;
        const totalSexo = masc + fem || 1;
        const percMasc = ((masc / totalSexo) * 100).toFixed(1);
        const percFem = ((fem / totalSexo) * 100).toFixed(1);

        // --- INADIMPLENTES ---
        const listInad = financeiro.filter(f => f.status === 'Pendente' && f.tipo === 'Receita' && new Date(f.vencimento + 'T00:00:00') < dataHoje);
        let linhasInad = '';
        listInad.forEach(f => {
            const cobrado = f.cobradoZap ? '<span style="color:#27ae60;font-weight:bold;">✅ Sim</span>' : '<span style="color:#e74c3c;font-weight:bold;">❌ Não</span>';
            linhasInad += `<tr><td>${f.alunoNome || 'Desconhecido'}</td><td>${f.descricao}</td><td style="color:#c0392b; font-weight:bold;">${fmt(parseFloat(f.valor))}</td><td>${f.vencimento.split('-').reverse().join('/')}</td><td style="text-align:center;">${cobrado}</td></tr>`;
        });

        const logo = escola.foto ? `<img src="${escola.foto}" style="height:50px;">` : '';

        // --- RENDERIZAÇÃO ---
        div.innerHTML = `
            <style>
                .d-kpi { flex:1; background:#fff; padding:15px; border-radius:8px; border:1px solid #ddd; text-align:center; min-width:140px; }
                .d-kpi-tit { font-size:10px; color:#777; text-transform:uppercase; margin-bottom:5px; font-weight:bold; line-height:1.2; }
                .d-kpi-val { font-size:18px; font-weight:bold; }
                .d-box { background:#fff; padding:20px; border-radius:8px; border:1px solid #eee; margin-bottom:20px; overflow: hidden; }
                .d-table { width:100%; border-collapse:collapse; font-size:12px; }
                .d-table th { background:#f4f6f7; padding:10px; text-align:left; border-bottom:2px solid #ddd; }
                .d-table td { padding:10px; border-bottom:1px solid #eee; }
                
                /* Listas Bonitas para Cursos e Turmas */
                .list-card { background:#f8f9fa; border:1px solid #e9ecef; padding:10px 15px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
                .list-card span:first-child { font-size:13px; font-weight:500; color:#333; }
                .badge-curso { background:#3498db; color:white; padding:4px 10px; border-radius:12px; font-size:11px; font-weight:bold; }
                .badge-turma { background:#2ecc71; color:white; padding:4px 10px; border-radius:12px; font-size:11px; font-weight:bold; }

                /* Utilizando Flex em vez de Grid para evitar overlap */
                .flex-container { display: flex; flex-wrap: wrap; gap: 30px; align-items: center; justify-content: space-between; }
                .flex-item { flex: 1; min-width: 300px; }
                
                @media print { .no-print { display: none !important; } .print-sheet { width: 100%; font-size:11px; } .d-box { page-break-inside: avoid; border:1px solid #000; } }
            </style>

            <div class="no-print" style="text-align:center; margin-bottom:20px;">
                <button onclick="App.renderizarDossie()" style="background:#7f8c8d; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer; margin-right:10px;">⬅ VOLTAR</button>
                <button onclick="window.print()" class="btn-primary" style="width:auto; padding:10px 20px;">🖨️ IMPRIMIR DOSSIÊ</button>
            </div>
            
            <div class="print-sheet">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 2px solid #2c3e50; padding-bottom: 15px; margin-bottom:20px; flex-wrap:wrap; gap:15px;">
                    <div style="display:flex; align-items:center; gap:20px;">
                        ${logo} <div><h2 style="margin:0; text-transform:uppercase; color:#2c3e50;">${escola.nome}</h2><div style="font-size:12px; color:#666;">CNPJ: ${escola.cnpj}</div></div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-weight:bold; font-size:16px;">DOSSIÊ DE GESTÃO - ${nomeMes}/${ano}</div>
                        <div style="font-size:11px; color:#666;">Emissão: ${dataHoje.toLocaleDateString('pt-BR')}</div>
                    </div>
                </div>
                
                <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px;">
                    <div class="d-kpi" style="border-bottom:3px solid #27ae60;"><div class="d-kpi-tit">Entrada Bruta Ano<br>(Mens + Vendas)</div><div class="d-kpi-val" style="color:#27ae60;">${fmt(entradaBrutaAno)}</div></div>
                    <div class="d-kpi" style="border-bottom:3px solid #34495e;"><div class="d-kpi-tit">Esperado do Ano<br>(Só Mensalidades)</div><div class="d-kpi-val" style="color:#34495e;">${fmt(esperadoAnoMensalidade)}</div></div>
                    <div class="d-kpi" style="border-bottom:3px solid #f39c12;"><div class="d-kpi-tit">Esperado Mês Vigente<br>(${nomeMes})</div><div class="d-kpi-val" style="color:#f39c12;">${fmt(esperadoMesMensalidade)}</div></div>
                    <div class="d-kpi" style="border-bottom:3px solid #3498db;"><div class="d-kpi-tit">Entrada Mês Vigente<br>(Mens + Vendas)</div><div class="d-kpi-val" style="color:#3498db;">${fmt(entradaMesTotal)}</div></div>
                    <div class="d-kpi" style="border-bottom:3px solid #e74c3c;"><div class="d-kpi-tit">Total Inadimplência<br>(Geral)</div><div class="d-kpi-val" style="color:#e74c3c;">${fmt(inadimplenciaGeral)}</div></div>
                </div>

                <div class="d-box">
                    <h3 style="margin-top:0; color:#2c3e50; border-bottom:1px solid #eee; padding-bottom:10px;">📊 Resultados Financeiros: ${nomeMes} / ${ano}</h3>
                    <div class="flex-container">
                        
                        <div class="flex-item">
                            <table class="d-table">
                                <tr><td><strong>Entradas em Mensalidades:</strong></td><td style="text-align:right; font-size:16px; color:#2980b9; font-weight:bold;">${fmt(entradaMesMensalidade)}</td></tr>
                                <tr><td><strong>Entradas em Vendas:</strong></td><td style="text-align:right; font-size:16px; color:#8e44ad; font-weight:bold;">${fmt(entradaMesVenda)}</td></tr>
                                <tr style="background:#f9f9f9;"><td><strong>TOTAL ARRECADADO NO MÊS:</strong></td><td style="text-align:right; font-size:18px; color:#27ae60; font-weight:bold;">${fmt(entradaMesTotal)}</td></tr>
                            </table>
                        </div>
                        
                        <div class="flex-item" style="display:flex; justify-content:space-evenly; gap:10px; align-items:center;">
                            <div style="text-align:center;">
                                <div style="font-size:10px; font-weight:bold; color:#777; margin-bottom:5px;">FORMAS (MENSALIDADES)</div>
                                <div style="position: relative; width: 130px; height: 130px; margin: 0 auto;">
                                    <canvas id="grafMensalidade"></canvas>
                                </div>
                            </div>
                            <div style="text-align:center;">
                                <div style="font-size:10px; font-weight:bold; color:#777; margin-bottom:5px;">FORMAS (VENDAS)</div>
                                <div style="position: relative; width: 130px; height: 130px; margin: 0 auto;">
                                    <canvas id="grafVenda"></canvas>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div class="d-box">
                    <h3 style="margin-top:0; color:#2c3e50; border-bottom:1px solid #eee; padding-bottom:10px;">📈 Histórico de Entradas (${ano})</h3>
                    <table class="d-table">
                        <thead><tr><th>Mês</th><th style="text-align:right;">Mensalidades</th><th style="text-align:right;">Vendas</th><th style="text-align:right;">Total do Mês</th></tr></thead>
                        <tbody>${linhasHistorico}</tbody>
                        <tfoot>
                            <tr style="background:#e8f6f3; font-weight:bold; font-size:14px;">
                                <td colspan="3" style="text-align:right;">TOTAL BRUTO (JAN ATÉ ${nomeMes.toUpperCase()}):</td>
                                <td style="text-align:right; color:#27ae60;">${fmt(acumuladoHistorico)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div class="d-box">
                    <div class="flex-container">
                        <div class="flex-item">
                            <h3 style="margin-top:0; color:#2c3e50; border-bottom:1px solid #eee; padding-bottom:10px;">📚 Cursos (${cursos.length})</h3>
                            <div>
                                ${cursos.length ? cursos.map(c => `
                                    <div class="list-card">
                                        <span>${c.nome}</span>
                                        <span class="badge-curso">${alunosCurso[c.nome] || 0} alunos</span>
                                    </div>
                                `).join('') : '<div style="color:#999; font-size:12px;">Nenhum curso.</div>'}
                            </div>
                        </div>
                        <div class="flex-item">
                            <h3 style="margin-top:0; color:#2c3e50; border-bottom:1px solid #eee; padding-bottom:10px;">🏫 Turmas (${turmas.length})</h3>
                            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:10px;">
                                ${turmas.length ? turmas.map(t => `
                                    <div class="list-card" style="margin-bottom:0;">
                                        <span>${t.nome}</span>
                                        <span class="badge-turma">${alunosTurma[t.nome] || 0} alunos</span>
                                    </div>
                                `).join('') : '<div style="color:#999; font-size:12px;">Nenhuma turma.</div>'}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="d-box">
                    <h3 style="margin-top:0; color:#2c3e50; border-bottom:1px solid #eee; padding-bottom:10px;">👥 Demografia dos Alunos</h3>
                    <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-around; gap:30px;">
                        
                        <div style="background:#f4f6f7; padding:20px; border-radius:8px; text-align:center; border:1px solid #e9ecef; min-width: 150px;">
                            <div style="font-size:32px; font-weight:bold; color:#2c3e50; line-height:1; margin-bottom:5px;">${alunos.length}</div>
                            <div style="font-size:12px; font-weight:bold; color:#7f8c8d; text-transform:uppercase;">Alunos Ativos</div>
                        </div>

                        <div style="position: relative; width: 150px; height: 150px; margin: 0 auto;">
                            <canvas id="grafDemografia"></canvas>
                        </div>

                        <div style="display:flex; flex-direction:column; gap:10px; min-width:200px;">
                            <div style="background:#ebf5fb; border-left:4px solid #3498db; padding:12px; border-radius:4px; display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <div style="font-size:11px; color:#555; text-transform:uppercase; font-weight:bold;">👨 Masculino</div>
                                    <div style="font-size:18px; font-weight:bold; color:#3498db;">${masc}</div>
                                </div>
                                <div style="font-size:16px; color:#999; font-weight:bold;">${percMasc}%</div>
                            </div>
                            <div style="background:#fdedec; border-left:4px solid #e74c3c; padding:12px; border-radius:4px; display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <div style="font-size:11px; color:#555; text-transform:uppercase; font-weight:bold;">👩 Feminino</div>
                                    <div style="font-size:18px; font-weight:bold; color:#e74c3c;">${fem}</div>
                                </div>
                                <div style="font-size:16px; color:#999; font-weight:bold;">${percFem}%</div>
                            </div>
                        </div>

                    </div>
                </div>

                <div class="d-box" style="overflow-x:auto;">
                    <h3 style="margin-top:0; color:#e74c3c; border-bottom:1px solid #eee; padding-bottom:10px;">⚠️ Relatório Analítico de Inadimplência</h3>
                    <table class="d-table" style="min-width:600px;">
                        <thead><tr><th>Nome do Aluno</th><th>Descrição (Mensalidade)</th><th>Valor</th><th>Vencimento</th><th style="text-align:center;">Cobrado no WhatsApp?</th></tr></thead>
                        <tbody>${linhasInad || '<tr><td colspan="5" style="text-align:center; color:#999; padding:20px;">Nenhum inadimplente! 🎉</td></tr>'}</tbody>
                    </table>
                </div>
            </div>`;

        // --- INICIALIZA OS GRÁFICOS ---
        setTimeout(() => {
            const chartOptions = { 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { legend: { display: false } },
                cutout: '65%'
            };
            const bgColors = ['#3498db', '#9b59b6', '#f1c40f', '#2ecc71', '#e67e22', '#95a5a6'];

            if(Object.keys(formasMensalidade).length > 0 && document.getElementById('grafMensalidade')) {
                new Chart(document.getElementById('grafMensalidade'), { type: 'doughnut', data: { labels: Object.keys(formasMensalidade), datasets: [{ data: Object.values(formasMensalidade), backgroundColor: bgColors, borderWidth: 0 }] }, options: chartOptions });
            }
            if(Object.keys(formasVenda).length > 0 && document.getElementById('grafVenda')) {
                new Chart(document.getElementById('grafVenda'), { type: 'doughnut', data: { labels: Object.keys(formasVenda), datasets: [{ data: Object.values(formasVenda), backgroundColor: bgColors, borderWidth: 0 }] }, options: chartOptions });
            }
            if(alunos.length > 0 && document.getElementById('grafDemografia')) {
                new Chart(document.getElementById('grafDemografia'), { type: 'doughnut', data: { labels: ['Masculino','Feminino'], datasets: [{ data: [masc, fem], backgroundColor: ['#3498db', '#e74c3c'], borderWidth: 0 }] }, options: chartOptions });
            }
        }, 300);

    } catch(e) { 
        console.error(e);
        div.innerHTML = "<p style='text-align:center; color:red;'>Erro ao gerar dossiê. Verifique a base de dados.</p>"; 
    }
};