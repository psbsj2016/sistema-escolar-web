// =========================================================
// MÓDULO FINANCEIRO V162 (CARNÊ BANCÁRIO A4 BLINDADO E QR OFICIAL)
// =========================================================

// --- 1. PAINEL PRINCIPAL ---
App.renderizarFinanceiroPro = async () => {
    App.setTitulo("Financeiro");
    const div = document.getElementById('app-content'); 
    div.innerHTML = '<p style="text-align:center; color:#666; padding:20px;">Carregando dados financeiros...</p>';
    
    try {
        const [turmas, financeiro, alunos] = await Promise.all([App.api('/turmas'), App.api('/financeiro'), App.api('/alunos')]);
        
        // 🛡️ BLINDAGEM FINANCEIRA: 
        const alunosAtivosIds = alunos.filter(a => !a.status || a.status === 'Ativo').map(a => a.id);

        const financeiroLimpo = financeiro.filter(f => {
            if (f.status === 'Pendente' && !alunosAtivosIds.includes(f.idAluno)) {
                return false;
            }
            return true; 
        });

        App.financeiroCache = financeiroLimpo.sort((a,b) => { 
            if(a.status === b.status) return new Date(a.vencimento) - new Date(b.vencimento); 
            return a.status === 'Pendente' ? -1 : 1; 
        });
        
        const input = App.UI.input;
        const botao = App.UI.botao;
        const select = (label, id, options) => `
            <div style="flex:1; min-width:120px;">
                <label style="display:block; font-weight:bold; margin-bottom:8px; font-size:13px; color:#555;">${label}</label>
                <select id="${id}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">${options}</select>
            </div>`;
        const col = (label, id, tipo='text', val='', placeholder='') => `
            <div style="flex:1; min-width:120px;">
                <label style="display:block; font-weight:bold; margin-bottom:8px; font-size:13px; color:#555;">${label}</label>
                <input type="${tipo}" id="${id}" value="${val}" placeholder="${placeholder}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">
            </div>`;

        const alunosAtivos = alunos.filter(a => !a.status || a.status === 'Ativo');
        const opAlunos = `<option value="">-- Selecione --</option>` + alunosAtivos.map(a => `<option value="${a.id}">${App.escapeHTML(a.nome)}</option>`).join('');
        const formGerador = `
            <div style="display:flex; align-items:center; margin-bottom:20px;">
                <div style="font-size:24px; margin-right:10px;">💰</div>
                <div><h3 style="margin:0; color:#2c3e50;">Gerar Mensalidades</h3><p style="margin:0; color:#666; font-size:14px;">Preencha para gerar carnê.</p></div>
            </div>
            <div style="display:flex; gap:20px; align-items:flex-end; flex-wrap:wrap;">
                <div style="flex:2; min-width:250px;">
                    <label style="display:block; font-weight:bold; margin-bottom:8px; font-size:13px; color:#555;">Selecione o Aluno:</label>
                    <select id="fin-aluno" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">${opAlunos}</select>
                </div>
                ${select('Tipo de Faturação:', 'fin-tipo', '<option value="padrao">🟢 Mensalidade Padrão</option><option value="extra">🟠 Parcela Extra (Reposição)</option>')}
                ${col('Valor (R$):', 'fin-valor', 'number', '', '0,00')}
                ${col('Parcelas:', 'fin-parcelas', 'number', '12')}
                ${col('1º Vencimento:', 'fin-vencimento', 'date', new Date().toISOString().split('T')[0])}
            </div>
            <button id="btn-gerar-carne" onclick="App.gerarCarnes()" style="margin-top:25px; width:100%; background:linear-gradient(90deg,#2980b9,#3498db); color:white; padding:12px; border:none; border-radius:5px; font-weight:bold; cursor:pointer; text-transform:uppercase; box-shadow: 0 4px 10px rgba(52,152,219,0.3);">Gerar e Imprimir Carnê</button>
        `;

        // 🧠 Gerar lista de Anos e Meses dinamicamente para os filtros
        let anosSet = new Set();
        const anoAtual = new Date().getFullYear();
        anosSet.add(anoAtual);
        financeiroLimpo.forEach(f => {
            if (f.vencimento) anosSet.add(parseInt(f.vencimento.split('-')[0]));
        });
        const anosOrdenados = Array.from(anosSet).sort((a, b) => b - a);
        
        const opStatusBusca = '<option value="">Todos os Status</option><option value="Pago">🟢 Pagos</option><option value="Pendente">🟠 Pendentes</option>';
        const opAnosBusca = '<option value="" selected>Todos os Anos</option>' + anosOrdenados.map(a => `<option value="${a}">${a}</option>`).join('');
        const mesesNome = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
        const opMesesBusca = '<option value="" selected>Todos os Meses</option>' + mesesNome.map((m, i) => `<option value="${(i+1).toString().padStart(2, '0')}">${m}</option>`).join('');

        const barraFerramentas = `
            <div class="toolbar" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px; flex-wrap:wrap; gap:15px;">
                <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:5px;">
                    ${botao('BAIXAR', "App.abrirModalBaixa()", 'primary', '✅')}
                    ${botao('DESFAZER', "App.acaoLote('pendente')", 'edit', '↩️')}
                    ${botao('EXCLUIR', "App.acaoLote('excluir')", 'cancel', '🗑️')}
                </div>
                
                <div style="display:flex; flex-direction:column; gap:10px; flex:1; min-width:300px; max-width:650px;">
                    <div class="search-wrapper" style="width: 100%; position:relative;">
                        <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); opacity:0.5;">🔍</span>
                        <input type="text" id="fin-busca" placeholder="Pesquisar por nome ou descrição..." oninput="App.filtrarFinanceiro()" style="width:100%; padding:10px 10px 10px 35px; border:1px solid #ddd; border-radius:5px;">
                    </div>
                    <div style="display:flex; gap:10px; flex-wrap:wrap;">
                        <select id="fin-filtro-status" onchange="App.filtrarFinanceiro()" style="flex:1; min-width:130px; padding:10px; border:1px solid #ddd; border-radius:5px; background:white; font-size:13px;">
                            ${opStatusBusca}
                        </select>
                        <select id="fin-filtro-mes" onchange="App.filtrarFinanceiro()" style="flex:1; min-width:130px; padding:10px; border:1px solid #ddd; border-radius:5px; background:white; font-size:13px;">
                            ${opMesesBusca}
                        </select>
                        <select id="fin-filtro-ano" onchange="App.filtrarFinanceiro()" style="flex:1; min-width:100px; padding:10px; border:1px solid #ddd; border-radius:5px; background:white; font-size:13px;">
                            ${opAnosBusca}
                        </select>
                    </div>
                </div>
            </div>
            <div id="fin-lista-area" class="table-responsive-wrapper" style="overflow-x:auto;">
                ${App.gerarTabelaFinanceira(App.financeiroCache)}
            </div>
        `;

        div.innerHTML = `
            <div style="margin-bottom:20px; text-align:right;">
                <button onclick="App.renderizarTela('inadimplencia')" style="background:#c0392b; color:white; border:none; padding:10px 20px; border-radius:5px; font-weight:bold; cursor:pointer; box-shadow: 0 4px 6px rgba(192, 57, 43, 0.3);">📉 RELATÓRIO DE INADIMPLÊNCIA</button>
            </div>
            <div class="card" style="border-left:5px solid #2980b9; padding:25px; margin-bottom:30px;">
                ${formGerador}
            </div>
            ${App.UI.card('', '', barraFerramentas)}
        `;
    } catch(e) { div.innerHTML = "Erro ao carregar dados financeiros."; }
};

App.gerarTabelaFinanceira = (dados) => {
    if(!dados || dados.length === 0) return '<p style="text-align:center; padding:20px; color:#999;">Nenhum lançamento encontrado.</p>';
    
    const th = (texto, align='center') => `<th style="padding:12px; text-align:${align}; border-bottom:2px solid #eee;">${texto}</th>`;
    const cabecalho = `<tr style="background:#f4f6f7; color:#7f8c8d; text-transform:uppercase; font-size:12px;">
        <th style="padding:12px; width:40px; text-align:center; border-bottom:2px solid #eee;"><input type="checkbox" onchange="App.toggleCheck(this)"></th>
        ${th('Aluno', 'left')}${th('Parcela')}${th('Vencimento')}${th('Valor')}${th('Status')}${th('Ações')}
    </tr>`;

    // 🧠 Inteligência de Datas (Para pintar os atrasados)
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const corpo = dados.map(p => { 
        const isPago = p.status === 'Pago'; 
        const isPendente = p.status === 'Pendente';
        const dataVencimento = new Date(p.vencimento + 'T00:00:00');
        
        // Verifica se a parcela está pendente E o vencimento já passou
        const isAtrasado = isPendente && dataVencimento < hoje;

        // Regras de Cores do Status
        let color = isPago ? '#1e8449' : (isPendente ? '#f39c12' : '#e74c3c'); 
        if (isAtrasado) color = '#c0392b'; // Vermelho mais forte se atrasar

        // 🎨 GESTÃO À VISTA: Regras de fundo da linha
        let bgRow = '';
        if (isPago) {
            bgRow = 'background-color:#eafaf1;'; // Verde claro para Pagos
        } else if (isAtrasado) {
            bgRow = 'background-color:#fdf2f2;'; // Vermelho claro para Atrasados
        }

        const textoStatus = isAtrasado ? 'Atrasado' : p.status;
        const bgBadge = isPago ? '#d4efdf' : (isAtrasado ? '#fadbd8' : '#fcf3cf');
        const statusBadge = `<span style="background:${bgBadge}; padding:4px 8px; border-radius:4px; font-size:12px;">${textoStatus}</span>`;
        
        const parcelaStr = p.descricao.includes('/') ? p.descricao.split(' ').pop() : '-';
        const vencStr = p.vencimento.split('-').reverse().join('/');
        const valorFormatado = parseFloat(p.valor).toLocaleString('pt-BR', {minimumFractionDigits:2});
        
        // 💬 Botão do WhatsApp (Só aparece se a conta NÃO estiver paga)
        const btnWhatsApp = !isPago 
            ? `<button onclick="App.cobrarWhatsApp('${p.idAluno}', '${valorFormatado}')" style="background:#27ae60; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer; margin-left:5px;" title="Cobrar no WhatsApp">💬</button>` 
            : '';

        return `
        <tr style="border-bottom:1px solid #eee; ${bgRow} transition:background 0.2s;">
            <td style="padding:12px; text-align:center;"><input type="checkbox" class="fin-check" value="${p.id}"></td>
            <td style="padding:12px; font-weight:bold;">${App.escapeHTML(p.alunoNome)}</td>
            <td style="padding:12px; text-align:center;">${App.escapeHTML(parcelaStr)}</td>
            <td style="padding:12px; text-align:center; ${isAtrasado ? 'color:#c0392b; font-weight:bold;' : ''}">${vencStr}</td>
            <td style="padding:12px; text-align:center;">R$ ${valorFormatado}</td>
            <td style="padding:12px; text-align:center; font-weight:bold; color:${color};">${statusBadge}</td>
            <td style="padding:12px; text-align:center; white-space:nowrap;">
                <button onclick="App.abrirCarneExistente('${p.idCarne}')" style="background:#3498db; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer;" title="Ver Carnê">📄</button>
                <button onclick="App.abrirEdicaoFinanceiro('${p.id}')" style="background:#f39c12; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer; margin-left:5px;" title="Editar Valor">✏️</button>
                ${btnWhatsApp}
            </td>
        </tr>`; 
    }).join('');

    return `<table style="width:100%; border-collapse:collapse; font-size:14px; color:#555; min-width:600px;"><thead>${cabecalho}</thead><tbody>${corpo}</tbody></table>`;
};

// 🧠 O NOVO MOTOR DE BUSCA COM CRUZAMENTO QUÁDRUPLO
App.filtrarFinanceiro = () => {
    const inputBusca = document.getElementById('fin-busca');
    const selectMes = document.getElementById('fin-filtro-mes');
    const selectAno = document.getElementById('fin-filtro-ano');
    const selectStatus = document.getElementById('fin-filtro-status');
    
    const termo = inputBusca ? inputBusca.value.toLowerCase() : '';
    const mes = selectMes ? selectMes.value : '';
    const ano = selectAno ? selectAno.value : '';
    const status = selectStatus ? selectStatus.value : '';

    let filtrados = App.financeiroCache.filter(f => {
        const matchTermo = !termo || 
            (f.alunoNome && f.alunoNome.toLowerCase().includes(termo)) || 
            (f.descricao && f.descricao.toLowerCase().includes(termo));
        
        const dataStr = f.vencimento || '';
        const fAno = dataStr.substring(0, 4);
        const fMes = dataStr.substring(5, 7);

        const matchAno = !ano || fAno === ano;
        const matchMes = !mes || fMes === mes;
        const matchStatus = !status || f.status === status;

        // Cruza os 4 filtros!
        return matchTermo && matchAno && matchMes && matchStatus;
    });

    if (mes || ano || status) {
        filtrados.sort((a, b) => new Date(b.vencimento) - new Date(a.vencimento));
    } else {
        filtrados.sort((a, b) => { 
            if(a.status === b.status) return new Date(a.vencimento) - new Date(b.vencimento); 
            return a.status === 'Pendente' ? -1 : 1; 
        });
    }

    document.getElementById('fin-lista-area').innerHTML = App.gerarTabelaFinanceira(filtrados);
};

App.abrirModalBaixa = () => {
    const checks = document.querySelectorAll('.fin-check:checked');
    if(checks.length === 0) return App.showToast("Selecione pelo menos um lançamento para dar baixa.", "warning");

    // 🛡️ CORREÇÃO MATEMÁTICA: Somar em cêntimos (inteiros) para evitar erros
    let totalCentavos = 0;
    for(const c of checks) {
        const item = App.financeiroCache.find(f => f.id == c.value);
        if(item) {
            totalCentavos += Math.round(parseFloat(item.valor) * 100);
        }
    }
    const total = totalCentavos / 100;

    const modal = document.getElementById('modal-overlay');
    if(modal) modal.style.display = 'flex';
    document.getElementById('modal-titulo').innerText = `Confirmar Pagamento (${checks.length} item/ns)`;
    
    const input = App.UI.input;
    const select = (label, id, options, extraAttr='') => `
        <div class="input-group" style="margin:0;">
            <label>${label}</label>
            <select id="${id}" ${extraAttr}>${options}</select>
        </div>`;
    const row = (conteudo, id='', display='grid') => `<div id="${id}" style="display:${display}; grid-template-columns:2fr 1fr; gap:10px; margin-bottom:10px;">${conteudo}</div>`;

    const opFormas = `<option value="PIX">PIX</option><option value="Cartão de Crédito">Cartão de Crédito</option><option value="Cartão de Débito">Cartão de Débito</option><option value="Dinheiro">Dinheiro</option>`;
    
    const html = `
        <div style="background:#f4f6f7; padding:15px; border-radius:8px; margin-bottom:15px; border-left:4px solid #27ae60;">
            <div style="display:flex; justify-content:space-between; margin-bottom:15px; align-items:center; border-bottom:1px solid #ddd; padding-bottom:10px;">
                <span style="font-weight:bold; color:#2c3e50;">Total Selecionado:</span>
                <span style="font-weight:bold; color:#27ae60; font-size:20px;">R$ ${total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
            </div>
            
            ${input('Data do Pagamento', 'baixa-data', new Date().toISOString().split('T')[0], '', 'date')}
            ${select('Divisão de Pagamento', 'baixa-qtd', '<option value="1">1 Forma de Pagamento</option><option value="2">2 Formas de Pagamento (Dividir Valor)</option>', 'onchange="App.mudarQtdFormasBaixa()"')}
            
            ${row(
                select('Forma 1', 'baixa-forma-1', opFormas) + 
                input('Valor (R$)', 'baixa-valor-1', total.toFixed(2), '', 'number', 'step="0.01" oninput="App.calcValorBaixa()" style="margin:0;"'),
                'forma-1-container'
            )}
            
            ${row(
                select('Forma 2', 'baixa-forma-2', '<option value="Dinheiro">Dinheiro</option>' + opFormas) + 
                input('Valor (R$)', 'baixa-valor-2', '0.00', '', 'number', 'step="0.01" readonly style="background:#eee; margin:0;"'),
                'forma-2-container', 'none'
            )}
            
            <input type="hidden" id="baixa-total" value="${total}">
        </div>`;
        
    document.getElementById('modal-form-content').innerHTML = html;
    
    const btnConfirm = document.querySelector('.btn-confirm');
    btnConfirm.setAttribute('onclick', 'App.confirmarBaixa()');
    btnConfirm.innerText = "CONFIRMAR PAGAMENTO";
};

App.mudarQtdFormasBaixa = () => {
    const qtd = document.getElementById('baixa-qtd').value;
    const container2 = document.getElementById('forma-2-container');
    const valor1 = document.getElementById('baixa-valor-1');
    const total = parseFloat(document.getElementById('baixa-total').value);

    if(qtd === '2') {
        container2.style.display = 'grid'; valor1.value = (total / 2).toFixed(2); App.calcValorBaixa();
    } else { container2.style.display = 'none'; valor1.value = total.toFixed(2); }
};

App.calcValorBaixa = () => {
    const qtd = document.getElementById('baixa-qtd').value;
    if(qtd === '2') {
        const totalCentavos = Math.round(parseFloat(document.getElementById('baixa-total').value) * 100);
        const val1Centavos = Math.round(parseFloat(document.getElementById('baixa-valor-1').value) * 100) || 0;
        
        let val2Centavos = totalCentavos - val1Centavos;
        if(val2Centavos < 0) val2Centavos = 0; 
        
        document.getElementById('baixa-valor-2').value = (val2Centavos / 100).toFixed(2);
    }
};

App.confirmarBaixa = async () => {
    const dataPagamento = document.getElementById('baixa-data').value;
    const qtd = document.getElementById('baixa-qtd').value;
    const f1 = document.getElementById('baixa-forma-1').value;
    const v1 = document.getElementById('baixa-valor-1').value;
    const f2 = qtd === '2' ? document.getElementById('baixa-forma-2').value : null;
    const v2 = qtd === '2' ? document.getElementById('baixa-valor-2').value : null;

    if(!dataPagamento) return App.showToast("Informe a data de pagamento.", "error");

    const checks = document.querySelectorAll('.fin-check:checked');
    const totalSelected = parseFloat(document.getElementById('baixa-total').value) || 0;
    
    const btn = document.querySelector('.btn-confirm');
    const textoOriginal = btn.innerText;
    btn.innerText = "Processando... ⏳"; 
    btn.disabled = true;

    try {
        const promessas = []; 
        for(const c of checks) {
            const item = App.financeiroCache.find(f => f.id == c.value);
            if(item) {
                const proportion = totalSelected > 0 ? (parseFloat(item.valor) / totalSelected) : 0;
                const itemV1 = totalSelected > 0 ? (parseFloat(v1) * proportion).toFixed(2) : "0.00";
                const itemV2 = (qtd === '2' && totalSelected > 0) ? (parseFloat(v2) * proportion).toFixed(2) : null;

                const payload = { ...item, status: 'Pago', dataPagamento: dataPagamento, formaPagamento: f1, valorPago1: itemV1, formaPagamento2: f2, valorPago2: itemV2 };
                promessas.push(App.api(`/financeiro/${item.id}`, 'PUT', payload));
            }
        }
        
        await Promise.all(promessas);
        
        App.showToast("Pagamento registrado com sucesso!", "success");
        App.fecharModal();
        App.renderizarFinanceiroPro();
    } catch(e) { 
        App.showToast("Erro ao processar baixa.", "error"); 
    } finally {
        btn.innerText = textoOriginal; 
        btn.disabled = false;
    }
};

App.gerarCarnes = async () => {
    const idA = document.getElementById('fin-aluno').value;
    const val = document.getElementById('fin-valor').value;
    const parc = parseInt(document.getElementById('fin-parcelas').value);
    const dataIni = document.getElementById('fin-vencimento').value;
    const tipoFaturamento = document.getElementById('fin-tipo').value; 
    
    if(!idA || !val || !parc || !dataIni) return App.showToast("Preencha todos os campos do gerador.", "error");
    if(parseFloat(val) <= 0) return App.showToast("O valor da mensalidade deve ser maior que zero.", "warning");

    const alunoNome = document.getElementById('fin-aluno').options[document.getElementById('fin-aluno').selectedIndex].text;
    const idLote = Date.now().toString();
    const dataGeracao = new Date().toLocaleDateString('pt-BR');

    const btn = document.getElementById('btn-gerar-carne');
    const txtOrig = btn.innerText;
    btn.innerText = `Gerando ${parc} parcelas... ⏳`;
    btn.disabled = true;
    document.body.style.cursor = 'wait';

    try {
        const promessas = [];
        
        const dataBaseOriginal = new Date(dataIni + 'T00:00:00');
        const diaEsperado = dataBaseOriginal.getDate();

        for(let i = 1; i <= parc; i++) {
            let db = new Date(dataBaseOriginal.getTime());
            db.setMonth(dataBaseOriginal.getMonth() + (i - 1));
            
            if (db.getDate() !== diaEsperado) {
                db.setDate(0); 
            }
            
            const vencUS = db.toISOString().split('T')[0];
            
            let descricaoParcela = `Mensalidade ${i}/${parc}`;
            if (tipoFaturamento === 'extra') {
                descricaoParcela = `Parcela Extra (Extensão de Curso) - ${i}/${parc}`;
            }

            const payload = {
                id: idLote + "_" + i, idCarne: idLote, dataGeracao, idAluno: idA, 
                alunoNome, valor: val, vencimento: vencUS, status: 'Pendente', 
                descricao: descricaoParcela, tipo: 'Receita'
            };
            promessas.push(App.api('/financeiro', 'POST', payload));
        }

        await Promise.all(promessas);
        App.showToast("Carnê gerado com sucesso!", "success");
        App.abrirCarneExistente(idLote);
    } catch(e) {
        App.showToast("Erro ao gerar parcelas.", "error");
    } finally {
        btn.innerText = txtOrig;
        btn.disabled = false;
        document.body.style.cursor = 'default';
    }
};

App.toggleCheck = (s) => { document.querySelectorAll('.fin-check').forEach(c => c.checked = s.checked); };

App.acaoLote = async (acao) => {
    const checks = document.querySelectorAll('.fin-check:checked');
    if (checks.length === 0) return App.showToast("Selecione pelo menos um lançamento.", "warning");
    
    const acaoTexto = acao === 'excluir' ? 'EXCLUIR' : 'ALTERAR';
    if (!confirm(`Tem certeza que deseja ${acaoTexto} os ${checks.length} itens selecionados?`)) return;

    App.showToast("Processando requisições em lote... ⏳", "info");
    document.body.style.cursor = 'wait';

    try {
        const operacoes = Array.from(checks).map(async (check) => {
            const id = check.value;
            if (acao === 'excluir') {
                return App.api(`/financeiro/${id}`, 'DELETE');
            } else {
                const item = App.financeiroCache.find(f => f.id == id);
                if (item) {
                    return App.api(`/financeiro/${id}`, 'PUT', { ...item, status: (acao === 'baixar' ? 'Pago' : 'Pendente') });
                }
            }
        });

        await Promise.all(operacoes);
        App.showToast(`Ação concluída com sucesso!`, "success");
        App.renderizarFinanceiroPro(); 
    } catch (e) {
        App.showToast("Erro ao processar lote.", "error");
    } finally { document.body.style.cursor = 'default'; }
};

// ---------------------------------------------------------
// 🚀 RENDERIZAÇÃO DO CARNÊ
// ---------------------------------------------------------
App.abrirCarneExistente = async (idLote) => {
    const div = document.getElementById('app-content');
    div.innerHTML = '<p style="text-align:center; padding:20px;">Gerando Carnê Profissional...</p>';
    try {
        const [financeiro, alunos, escola] = await Promise.all([App.api('/financeiro'), App.api('/alunos'), App.api('/escola')]);
        const parcelas = financeiro.filter(x => x.idCarne === idLote).sort((a,b) => new Date(a.vencimento) - new Date(b.vencimento));
        if(parcelas.length === 0) return App.showToast("Carnê não encontrado.", "error");

        const aluno = alunos.find(a => a.id === parcelas[0].idAluno) || { nome: 'Aluno', cpf: 'Não informado' };
        const logo = escola.foto ? `<img src="${escola.foto}" style="height:35px; object-fit:contain; margin-right:10px;">` : '';
        const nomeEscolaResumo = (escola.nome || 'INSTITUIÇÃO').substring(0, 20);
        const primeiroNomeAluno = (aluno.nome || 'Aluno').split(' ')[0];
        const bancoNome = escola.banco || 'Não Configurado';
        const chavePix = escola.chavePix || 'Não Configurada';

        const carnesHTML = parcelas.map((p) => {
            const dataVenc = p.vencimento.split('-').reverse().join('/');
            const valorF = parseFloat(p.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2});
            const nossoNumero = p.id.slice(-8).toUpperCase();
            
            const qrCodeDisplay = (escola.qrCodeImagem && escola.qrCodeImagem.length > 50 && !escola.qrCodeImagem.includes('placehold'))
                ? `<img src="${escola.qrCodeImagem}" style="width: 70px; height: 70px; object-fit: contain; border: 1px solid #ccc; border-radius: 4px; padding: 2px; background: #fff;">`
                : `<div id="qr-${p.id}" style="width: 70px; height: 70px; padding: 5px; background: #fff; border: 1px solid #ccc; border-radius: 4px; display:flex; align-items:center; justify-content:center;"></div>`;

            return `
            <div class="carne-wrapper" style="display: flex; border: 1px solid #000; margin-bottom: 5mm; font-family: Arial, sans-serif; background: #fff; color: #000; border-radius: 8px; overflow: hidden; width: 100%; max-width: 210mm; height: 65mm; margin-left: auto; margin-right: auto; page-break-inside: avoid; box-sizing: border-box;">
                
                <div class="carne-canhoto" style="width: 28%; border-right: 2px dashed #999; padding: 10px; display: flex; flex-direction: column; background: #fafafa; box-sizing: border-box; justify-content: space-between;">
                    <div style="border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 5px; text-align: center;">
                        ${logo}
                        <div style="font-weight: bold; font-size: 10px; text-transform: uppercase; margin-top:3px;">${App.escapeHTML(nomeEscolaResumo)}</div>
                    </div>
                    <div style="font-size: 10px; margin-bottom: 4px;"><b>Parcela:</b> ${App.escapeHTML(p.descricao)}</div>
                    <div style="font-size: 10px; margin-bottom: 4px;"><b>Vencimento:</b> <span style="color: red; font-weight: bold;">${dataVenc}</span></div>
                    <div style="font-size: 10px; margin-bottom: 4px;"><b>Valor:</b> R$ ${valorF}</div>
                    <div style="font-size: 10px; margin-bottom: 4px;"><b>Nº Doc:</b> ${nossoNumero}</div>
                    <div style="margin-top: auto; font-size: 9px; border-top: 1px solid #ccc; padding-top: 5px;"><b>Sacado:</b> ${App.escapeHTML(primeiroNomeAluno)}</div>
                </div>
                
                <div class="carne-recibo" style="width: 72%; padding: 10px 15px; display: flex; flex-direction: column; position: relative; box-sizing: border-box;">
                    
                    <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 5px; margin-bottom: 8px; align-items: center;">
                        <div style="display: flex; align-items: center;">
                            ${logo} 
                            <div>
                                <div style="font-weight: bold; font-size: 12px; text-transform: uppercase;">${App.escapeHTML(escola.nome || 'INSTITUIÇÃO')}</div>
                                <div style="font-size: 9px; color: #555;">CNPJ: ${App.escapeHTML(escola.cnpj || '00.000.000/0000-00')} | Banco: <b>${App.escapeHTML(bancoNome)}</b></div>
                            </div>
                        </div>
                        <div style="text-align: right; font-size: 10px; font-weight: bold; color: #555; border-left: 2px solid #ccc; padding-left:10px;">
                            RECIBO DO<br>PAGADOR
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; background: #fdfdfd; border: 1px solid #ddd; padding: 6px 10px; border-radius: 4px;">
                        <div><div style="font-size: 9px; color: #777; text-transform: uppercase;">Nosso Número</div><div style="font-weight: bold; font-size: 12px;">${nossoNumero}</div></div>
                        <div><div style="font-size: 9px; color: #777; text-transform: uppercase;">Vencimento</div><div style="font-weight: bold; font-size: 12px; color: #c0392b;">${dataVenc}</div></div>
                        <div><div style="font-size: 9px; color: #777; text-transform: uppercase;">Valor do Documento</div><div style="font-weight: bold; font-size: 12px;">R$ ${valorF}</div></div>
                    </div>

                    <div style="background: #fff8e1; border: 1px solid #f1c40f; padding: 4px 8px; border-radius: 4px; margin-bottom: 8px; text-align: center;">
                        <span style="font-size: 9px; font-weight: bold; color: #d35400;">⚠️ Informação Importante:</span> 
                        <span style="font-size: 9px; color: #555;">Evite a perda de descontos e benefícios. Após o vencimento, o valor da mensalidade será atualizado.</span>
                    </div>
                    
                    <div style="font-size: 10px; margin-bottom: auto; border-bottom: 1px solid #eee; padding-bottom: 5px; line-height:1.4;">
                        <div><b>Ref:</b> ${App.escapeHTML(p.descricao)} &nbsp;|&nbsp; <b>Pagador:</b> ${App.escapeHTML(aluno.nome)} &nbsp;|&nbsp; <b>CPF:</b> ${App.escapeHTML(aluno.cpf || 'Não informado')}</div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-top: 5px; align-items: flex-end; gap:15px;">
                        <div style="flex:1;">
                            <div style="font-size: 10px; font-weight: bold; margin-bottom: 2px; color:#27ae60;">PAGAMENTO VIA PIX</div>
                            <div style="font-size: 9px; margin-bottom: 3px; color:#555;">Leia o QR Code ao lado ou utilize a chave manual abaixo:</div>
                            <div style="background: #eee; padding: 4px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; word-break: break-all; border:1px dashed #ccc;">
                                🔑 ${App.escapeHTML(chavePix)}
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center;">
                            ${qrCodeDisplay}
                            <div style="font-size: 8px; color: #999; margin-top: 3px;">Autenticação Mecânica</div>
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');

        div.innerHTML = `
            <style>
                @media print {
                    body, html { background: white !important; margin: 0 !important; padding: 0 !important; }
                    .no-print { display: none !important; }
                    .print-bg { background: transparent !important; padding: 0 !important; }
                    .print-sheet { box-shadow: none !important; border: none !important; margin: 0 !important; padding: 0 !important; max-width: 100% !important; width: 100% !important; }
                    
                    /* 🖨️ MATEMÁTICA DA IMPRESSÃO: 4 POR PÁGINA A4 */
                    @page { size: A4 portrait; margin: 10mm; }
                    .carne-wrapper { 
                        border: 1px solid #000 !important; 
                        box-shadow: none !important; 
                        margin-bottom: 5mm !important; 
                        height: 65mm !important; 
                        flex-direction: row !important;
                        page-break-inside: avoid !important;
                    }
                    .carne-canhoto { width: 28% !important; border-right: 2px dashed #999 !important; border-bottom: none !important; }
                    .carne-recibo { width: 72% !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                @media (max-width: 768px) {
                    .carne-wrapper { flex-direction: column !important; height: auto !important; }
                    .carne-canhoto { width: 100% !important; border-right: none !important; border-bottom: 2px dashed #999 !important; }
                    .carne-recibo { width: 100% !important; }
                    .print-sheet { padding: 10px !important; }
                }
            </style>
            
            <div class="no-print" style="text-align:center; padding:20px; background:#fff; border-radius: 8px; margin-bottom: 20px; border: 1px solid #eee; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <h2 style="margin-top:0; color:#2c3e50;">Carnê Gerado com Sucesso! 🎉</h2>
                <p style="font-size: 14px; color: #666; margin-bottom: 20px;">O layout de impressão foi travado para emitir 4 carnês por página perfeitamente.</p>
                <button onclick="window.print()" class="btn-primary" style="padding:12px 25px; font-size:16px; width:auto;">🖨️ IMPRIMIR CARNÊ</button>
                <button onclick="App.renderizarFinanceiroPro()" class="btn-cancel" style="margin-left:10px; padding:12px 25px; width:auto;">VOLTAR</button>
            </div>
            
            <div class="print-bg" style="background: #f4f6f7; padding: 30px 15px; border-radius: 8px;">
                <div class="print-sheet" style="background: white; max-width: 210mm; margin: 0 auto; padding: 20px 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-radius: 8px; box-sizing: border-box;">
                    ${carnesHTML}
                </div>
            </div>`;

        if (!escola.qrCodeImagem || escola.qrCodeImagem.length <= 50 || escola.qrCodeImagem.includes('placehold')) {
            parcelas.forEach(p => {
                const el = document.getElementById(`qr-${p.id}`);
                if(el && typeof QRCode !== 'undefined') {
                    new QRCode(el, { text: chavePix, width: 60, height: 60, colorDark : "#000000", colorLight : "#ffffff", correctLevel : QRCode.CorrectLevel.L });
                } else if(el) {
                    el.innerHTML = '<span style="font-size:8px; color:#999; text-align:center;">QR Code<br>Indisponível</span>';
                }
            });
        }
    } catch(e) { console.error(e); App.showToast("Erro ao gerar carnê.", "error"); }
};

// ---------------------------------------------------------
// 📉 RELATÓRIO DE INADIMPLÊNCIA (CORRIGIDO)
// ---------------------------------------------------------
App.renderizarInadimplencia = async () => {
    App.setTitulo("Relatório de Inadimplência");
    const div = document.getElementById('app-content');
    div.innerHTML = '<p style="text-align:center; color:#666; padding:20px;">Calculando inadimplência... ⏳</p>';

    try {
        const [financeiro, alunos, escola] = await Promise.all([
            App.api('/financeiro'), 
            App.api('/alunos'), 
            App.api('/escola')
        ]);

        const alunosAtivosIds = alunos.filter(a => !a.status || a.status === 'Ativo').map(a => a.id);

        const hoje = new Date(); 
        const vencidos = financeiro.filter(f => 
            f.status !== 'Pago' && 
            new Date(f.vencimento + 'T00:00:00') < hoje &&
            alunosAtivosIds.includes(f.idAluno) 
        );
        
        let totalAtrasoCentavos = 0; 
        const devedoresMap = {};
        
        vencidos.forEach(f => { 
            const valorCentavos = Math.round(parseFloat(f.valor) * 100);

            if(!devedoresMap[f.idAluno]) { 
                const aluno = alunos.find(a => a.id == f.idAluno); 
                devedoresMap[f.idAluno] = { 
                    idAluno: f.idAluno, 
                    nome: f.alunoNome, 
                    curso: aluno ? aluno.curso : '-', 
                    totalCentavos: 0, 
                    detalhes: [] 
                }; 
            } 
            devedoresMap[f.idAluno].totalCentavos += valorCentavos;
            devedoresMap[f.idAluno].detalhes.push(`${f.vencimento.split('-').reverse().join('/')} (R$ ${parseFloat(f.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})})`); 
            totalAtrasoCentavos += valorCentavos;
        });
        
        const listaDevedores = Object.values(devedoresMap).map(d => ({ ...d, total: d.totalCentavos / 100 }));
        const totalAtraso = totalAtrasoCentavos / 100;

        const dataHojeStr = new Date().toLocaleDateString('pt-BR'); 
        const logo = escola.foto ? `<img src="${escola.foto}" style="height:50px;">` : '';
                
        const style = `
        <style>
            .inad-card-top { border-left: 5px solid #c0392b; padding: 25px; border-radius: 8px; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-bottom: 20px; } 
            .inad-kpi-box { display: flex; gap: 20px; margin-top: 20px; flex-wrap:wrap; } 
            .inad-kpi { flex: 1; text-align: center; padding: 20px; border-radius: 8px; border: 1px solid #eee; min-width:150px; } 
            .inad-kpi-red { background: #fdf2f2; border-color: #f5b7b1; } 
            .inad-kpi-label { font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; } 
            .inad-kpi-val { font-size: 24px; font-weight: bold; } 
            .inad-list-title { color: #c0392b; font-size: 18px; margin: 0; font-weight: 600; } 
            .inad-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 15px; min-width:600px; } 
            .inad-table th { background: #f9f9f9; padding: 12px; text-align: left; color: #888; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #eee; } 
            .inad-table td { padding: 12px; border-bottom: 1px solid #eee; color: #333; } 
            .btn-cobrar { background: #27ae60; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; font-size: 11px; text-decoration: none; white-space:nowrap; } 
            @media print { 
                .no-print { display: none !important; } 
                .inad-card-top { border: 1px solid #000; box-shadow: none; } 
                .inad-kpi-red { background: #eee !important; -webkit-print-color-adjust: exact; } 
            }
        </style>`;
        
        const linhasTabela = listaDevedores.length === 0 
            ? '<tr><td colspan="5" style="text-align:center; padding:20px; color:#999;">Nenhuma pendência encontrada.</td></tr>' 
            : listaDevedores.map(d => `
                <tr>
                    <td style="font-weight:bold;">${App.escapeHTML(d.nome)}</td>
                    <td>${App.escapeHTML(d.curso)}</td>
                    <td style="font-size:11px; color:#666;">${d.detalhes.join('<br>')}</td>
                    <td style="color:#c0392b; font-weight:bold; white-space:nowrap;">R$ ${d.total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                    <td class="no-print" style="text-align:right;">
                        <button onclick="App.cobrarWhatsApp('${d.idAluno}', '${d.total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}')" class="btn-cobrar">💬 Cobrar</button>
                    </td>
                </tr>`).join('');

        div.innerHTML = `${style}
            <div style="margin-bottom: 20px;" class="no-print">
                <button onclick="App.renderizarFinanceiroPro()" style="background:#7f8c8d; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">⬅ VOLTAR</button>
            </div>
            
            <div class="print-sheet" style="background:white; padding:30px; border-radius:8px;">
                <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:2px solid #eee; padding-bottom:15px; margin-bottom:30px;">
                    <div style="display:flex; align-items:center; gap:15px;">
                        ${logo}
                        <div><h2 style="margin:0;">${App.escapeHTML(escola.nome || '')}</h2><div style="font-size:12px;">CNPJ: ${App.escapeHTML(escola.cnpj || '')}</div></div>
                    </div>
                    <div style="font-size:12px; color:#666;">Emissão: ${dataHojeStr}</div>
                </div>
                
                <h2 style="color:#2c3e50; margin-bottom:20px;">📉 Relatório de Inadimplência</h2>
                
                <div class="inad-card-top">
                    <div class="inad-kpi-box">
                        <div class="inad-kpi inad-kpi-red">
                            <div class="inad-kpi-label" style="color:#c0392b;">TOTAL EM ATRASO</div>
                            <div class="inad-kpi-val" style="color:#c0392b;">R$ ${totalAtraso.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                        </div>
                        <div class="inad-kpi">
                            <div class="inad-kpi-label">ALUNOS DEVEDORES</div>
                            <div class="inad-kpi-val">${listaDevedores.length}</div>
                        </div>
                    </div>
                </div>
                
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:30px;">
                    <h3 class="inad-list-title">Lista de Pendências Vencidas</h3>
                    <button onclick="window.print()" class="no-print" style="background:#34495e; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer;">🖨️ IMPRIMIR</button>
                </div>
                
                <table class="inad-table">
                    <thead><tr><th>ALUNO</th><th>CURSO</th><th>DETALHES</th><th>TOTAL DEVIDO</th><th class="no-print">AÇÃO</th></tr></thead>
                    <tbody>${linhasTabela}</tbody>
                </table>
            </div>`;
    } catch(e) { 
        console.error(e);
        App.showToast("Erro ao calcular inadimplência.", "error"); 
    }
};

// =======================================================================
// NOVAS FUNÇÕES DE EDIÇÃO INTELIGENTE (PROTEÇÃO DE VENCIMENTO)
// =======================================================================

App.abrirEdicaoFinanceiro = async (id) => {
    App.idEdicaoFinanceiro = id;
    
    const modal = document.getElementById('modal-overlay');
    if(modal) modal.style.display = 'flex';
    
    const titulo = document.getElementById('modal-titulo');
    const conteudo = document.getElementById('modal-form-content');
    
    if(titulo) titulo.innerText = "Editar Lançamento";
    if(conteudo) conteudo.innerHTML = '<p style="padding:20px; text-align:center; color:#666;">Carregando dados da parcela... ⏳</p>';

    try {
        const parcela = await App.api(`/financeiro/${id}`);
        App.parcelaEdicaoAtual = parcela;

        const isPago = parcela.status === 'Pago';
        
        const labelData = isPago ? 'Data Efetiva do Pagamento' : 'Nova Data de Vencimento';
        const dataAtual = isPago ? (parcela.dataPagamento || parcela.vencimento) : parcela.vencimento;
        
        const aviso = isPago 
            ? '<div style="background:#e8f4f8; color:#2980b9; padding:12px; border-radius:5px; margin-bottom:15px; font-size:13px; border-left:4px solid #2980b9;">ℹ️ <b>Parcela Paga:</b> Você está alterando apenas o dia em que o aluno efetuou o pagamento. <b>O vencimento original do carnê ficará intacto.</b></div>'
            : '<div style="background:#fff3e0; color:#d35400; padding:12px; border-radius:5px; margin-bottom:15px; font-size:13px; border-left:4px solid #d35400;">⚠️ <b>Parcela Pendente:</b> Alterar a data mudará o dia de vencimento no carnê do aluno.</div>';

        let html = `
            ${aviso}
            <div class="input-group" style="margin-bottom:15px;">
                <label style="font-weight:bold; color:#2c3e50;">${labelData}</label>
                <input type="date" id="edit-fin-data" value="${dataAtual || ''}" style="width:100%; padding:10px; border-radius:5px; border:1px solid #ccc; font-size:15px;">
            </div>
            <div class="input-group" style="margin-bottom:15px;">
                <label style="font-weight:bold; color:#2c3e50;">Valor Registado (R$)</label>
                <input type="number" step="0.01" id="edit-fin-valor" value="${parcela.valor || ''}" style="width:100%; padding:10px; border-radius:5px; border:1px solid #ccc; font-size:15px;">
            </div>
        `;

        conteudo.innerHTML = html;

        const btnConfirm = document.querySelector('.btn-confirm');
        if(btnConfirm) {
            btnConfirm.setAttribute('onclick', 'App.salvarEdicaoFinanceiro()');
            btnConfirm.innerHTML = "💾 Salvar Alterações";
        }
    } catch (e) {
        console.error("Erro ao carregar edição:", e);
        if(conteudo) conteudo.innerHTML = '<p style="color:red; text-align:center;">Erro ao carregar dados. Tente novamente.</p>';
    }
};

App.salvarEdicaoFinanceiro = async () => {
    const novaData = document.getElementById('edit-fin-data').value;
    const novoValorStr = document.getElementById('edit-fin-valor').value;

    if (!novaData || !novoValorStr) {
        return App.showToast("Por favor, preencha a data e o valor.", "warning");
    }

    let novoValor = novoValorStr.toString().trim();
    if (novoValor.includes(',') && novoValor.includes('.')) {
        novoValor = novoValor.replace(/\./g, '').replace(',', '.'); 
    } else if (novoValor.includes(',')) {
        novoValor = novoValor.replace(',', '.'); 
    }
    novoValor = parseFloat(novoValor) || 0;

    const btn = document.querySelector('.btn-confirm');
    const txtOrig = btn ? btn.innerHTML : 'Salvar';
    if (btn) { btn.innerHTML = "⏳ A guardar..."; btn.disabled = true; }
    document.body.style.cursor = 'wait';

    try {
        const isPago = App.parcelaEdicaoAtual.status === 'Pago';
        
        const parcelaAtualizada = {
            ...App.parcelaEdicaoAtual,
            valor: novoValor
        };

        if (isPago) {
            parcelaAtualizada.dataPagamento = novaData;
            parcelaAtualizada.valorPago1 = novoValor;
            parcelaAtualizada.valorPago2 = 0; 
        } else {
            parcelaAtualizada.vencimento = novaData;
        }

        await App.api(`/financeiro/${App.idEdicaoFinanceiro}`, 'PUT', parcelaAtualizada);
        
        App.showToast("Alteração financeira guardada com sucesso! 💼", "success");
        App.fecharModal();
        
        if (typeof App.renderizarFinanceiroPro === 'function' && document.getElementById('titulo-pagina').innerText.includes('Financeiro')) {
            App.renderizarFinanceiroPro();
        } else if (typeof App.filtrarTabelaReativa === 'function') {
            App.renderizarLista('financeiro');
        }

    } catch (e) {
        console.error("Erro ao guardar edição:", e);
        App.showToast("Ocorreu um erro ao atualizar.", "error");
    } finally {
        if (btn) { btn.innerHTML = txtOrig; btn.disabled = false; }
        document.body.style.cursor = 'default';
    }
};

// =======================================================================
// 🗂️ TELA EXCLUSIVA DE HISTÓRICO DE LANÇAMENTOS (COM FILTROS AVANÇADOS)
// =======================================================================

App.renderizarHistoricoFinanceiro = async () => {
    App.setTitulo("Histórico de Lançamentos");
    const div = document.getElementById('app-content'); 
    div.innerHTML = '<p style="text-align:center; color:#666; padding:20px;">Carregando histórico financeiro... ⏳</p>';
    
    try {
        const [financeiro, alunos] = await Promise.all([App.api('/financeiro'), App.api('/alunos')]);
        
        const alunosAtivosIds = alunos.filter(a => !a.status || a.status === 'Ativo').map(a => a.id);
        const financeiroLimpo = financeiro.filter(f => {
            if (f.status === 'Pendente' && !alunosAtivosIds.includes(f.idAluno)) return false;
            return true; 
        });

        App.financeiroCache = financeiroLimpo.sort((a,b) => { 
            if(a.status === b.status) return new Date(a.vencimento) - new Date(b.vencimento); 
            return a.status === 'Pendente' ? -1 : 1; 
        });
        
        const botao = App.UI.botao;

        let anosSet = new Set();
        const anoAtual = new Date().getFullYear();
        anosSet.add(anoAtual);
        financeiroLimpo.forEach(f => {
            if (f.vencimento) anosSet.add(parseInt(f.vencimento.split('-')[0]));
        });
        const anosOrdenados = Array.from(anosSet).sort((a, b) => b - a);
        
        const opStatusBusca = '<option value="">Todos os Status</option><option value="Pago">🟢 Pagos</option><option value="Pendente">🟠 Pendentes</option>';
        const opAnosBusca = '<option value="" selected>Todos os Anos</option>' + anosOrdenados.map(a => `<option value="${a}">${a}</option>`).join('');
        const mesesNome = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
        const opMesesBusca = '<option value="" selected>Todos os Meses</option>' + mesesNome.map((m, i) => `<option value="${(i+1).toString().padStart(2, '0')}">${m}</option>`).join('');

        const barraFerramentas = `
            <div class="toolbar" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px; flex-wrap:wrap; gap:15px;">
                <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:5px;">
                    ${botao('BAIXAR', "App.abrirModalBaixa()", 'primary', '✅')}
                    ${botao('DESFAZER', "App.acaoLote('pendente')", 'edit', '↩️')}
                    ${botao('EXCLUIR', "App.acaoLote('excluir')", 'cancel', '🗑️')}
                </div>
                
                <div style="display:flex; flex-direction:column; gap:10px; flex:1; min-width:300px; max-width:650px;">
                    <div class="search-wrapper" style="width: 100%; position:relative;">
                        <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); opacity:0.5;">🔍</span>
                        <input type="text" id="fin-busca" placeholder="Pesquisar por nome ou descrição..." oninput="App.filtrarFinanceiro()" style="width:100%; padding:10px 10px 10px 35px; border:1px solid #ddd; border-radius:5px;">
                    </div>
                    <div style="display:flex; gap:10px; flex-wrap:wrap;">
                        <select id="fin-filtro-status" onchange="App.filtrarFinanceiro()" style="flex:1; min-width:130px; padding:10px; border:1px solid #ddd; border-radius:5px; background:white; font-size:13px;">
                            ${opStatusBusca}
                        </select>
                        <select id="fin-filtro-mes" onchange="App.filtrarFinanceiro()" style="flex:1; min-width:130px; padding:10px; border:1px solid #ddd; border-radius:5px; background:white; font-size:13px;">
                            ${opMesesBusca}
                        </select>
                        <select id="fin-filtro-ano" onchange="App.filtrarFinanceiro()" style="flex:1; min-width:100px; padding:10px; border:1px solid #ddd; border-radius:5px; background:white; font-size:13px;">
                            ${opAnosBusca}
                        </select>
                    </div>
                </div>
            </div>
            <div id="fin-lista-area" class="table-responsive-wrapper" style="overflow-x:auto;">
                ${App.gerarTabelaFinanceira(App.financeiroCache)}
            </div>
        `;

        div.innerHTML = `
            <div style="margin-top: 20px;">
                ${App.UI.card('', '', barraFerramentas)}
            </div>
        `;
    } catch(e) { div.innerHTML = "Erro ao carregar dados financeiros."; }
};

// 🔗 INTERCEPTADOR (HOOK)
if (typeof App.renderizarLista === 'function') {
    const _renderizarListaOriginal = App.renderizarLista;
    App.renderizarLista = (colecao) => {
        if (colecao === 'financeiro') {
            return App.renderizarHistoricoFinanceiro();
        }
        return _renderizarListaOriginal(colecao);
    };
}

// =======================================================================
// 💬 INTEGRAÇÃO DE COBRANÇA PROFISSIONAL VIA WHATSAPP
// =======================================================================

App.cobrarWhatsApp = async (idAluno, valorPendente) => {
    try {
        App.showToast("A preparar mensagem...", "info");

        // 1. Buscar os dados atualizados do aluno e da instituição
        const [alunos, escola] = await Promise.all([
            App.api('/alunos'), 
            App.api('/escola')
        ]);

        const aluno = alunos.find(a => a.id === idAluno);
        if (!aluno) return App.showToast("Erro: Aluno não encontrado.", "error");
        if (!aluno.telefone) return App.showToast("O aluno não tem número de WhatsApp registado.", "warning");

        // 2. Limpar e formatar o número de telefone (remover espaços, traços, etc.)
        let telefone = aluno.telefone.replace(/\D/g, '');
        
        // Se o número for do Brasil e não tiver o DDI (55), o sistema adiciona automaticamente
        if (telefone.length === 10 || telefone.length === 11) {
            telefone = '55' + telefone;
        }

        // 3. Organizar as variáveis para o texto
        const primeiroNome = aluno.nome.split(' ')[0]; // Pega só o primeiro nome para ser mais pessoal
        const nomeEscola = escola.nome || 'Nossa Instituição';
        const cnpjEscola = escola.cnpj || 'Não informado';
        const bancoEscola = escola.banco || 'Não informado';
        const pixEscola = escola.chavePix || 'Não informada';

        // 4. Montar a mensagem de "Lembrete" (Formatada com Negritos e Itálicos)
        const mensagem = 
`Olá, *${primeiroNome}*! Tudo bem? ✨

Passando apenas para deixar um lembrete sobre a sua mensalidade no valor de *R$ ${valorPendente}*, que se encontra em aberto no nosso sistema.

Para sua maior comodidade, deixamos abaixo os nossos dados para pagamento via PIX:

🏦 *Dados da Instituição:*
*Instituição:* _${nomeEscola}_
*CNPJ:* _${cnpjEscola}_
*Banco:* _${bancoEscola}_

🔑 *Chave PIX:* *${pixEscola}*

_Caso o pagamento já tenha sido realizado, por favor, desconsidere esta mensagem._ 🙏

Qualquer dúvida, estamos à inteira disposição. Tenha um excelente dia! 🌟`;

        // 5. Transformar o texto num link válido para a internet e abrir o WhatsApp
        const textoCodificado = encodeURIComponent(mensagem);
        const urlWhatsApp = `https://api.whatsapp.com/send?phone=${telefone}&text=${textoCodificado}`;
        
        window.open(urlWhatsApp, '_blank'); // Abre em nova aba (ou App do celular)

    } catch (error) {
        console.error("Erro ao gerar link do WhatsApp:", error);
        App.showToast("Erro ao processar a mensagem.", "error");
    }
};