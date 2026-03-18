// =========================================================
// MÓDULO FINANCEIRO - V138 (CARNÊS PREMIUM & GATILHOS MENTAIS)
// =========================================================

App.renderizarFinanceiroPro = async () => {
    App.setTitulo("Gestão Financeira");
    const div = document.getElementById('app-content');
    div.innerHTML = 'Carregando...';

    try {
        const alunos = await App.api('/alunos');
        const financeiro = await App.api('/financeiro');
        App.listaCache = financeiro;

        const htmlAlunos = alunos.map(a => `<option value="${a.id}">${a.nome}</option>`).join('');

        div.innerHTML = `
            <div style="display:flex; gap:20px; flex-wrap:wrap; margin-bottom:20px;">
                <div class="card" style="flex:1; min-width:300px; border-left: 5px solid var(--accent);">
                    <h3>💸 Lançar Mensalidade</h3>
                    <div class="input-group"><label>Aluno</label><select id="fin-aluno"><option value="">Selecione um aluno...</option>${htmlAlunos}</select></div>
                    <div style="display:flex; gap:10px;">
                        <div class="input-group" style="flex:1;"><label>Valor (R$)</label><input type="number" id="fin-valor" step="0.01" placeholder="0.00"></div>
                        <div class="input-group" style="flex:1;"><label>1º Vencimento</label><input type="date" id="fin-data"></div>
                    </div>
                    <div class="input-group"><label>Quantidade de Parcelas</label><input type="number" id="fin-parcelas" value="1" min="1" max="12"></div>
                    <div class="input-group"><label>Descrição / Referência</label><input type="text" id="fin-desc" placeholder="Ex: Mensalidade Referente a..."></div>
                    <button class="btn-primary" onclick="App.salvarFinanceiro()">💾 GERAR LANÇAMENTOS</button>
                </div>
                <div class="card" style="flex:2; min-width:300px; display:flex; flex-direction:column;">
                    <h3>📋 Gerenciar Títulos e Carnês</h3>
                    <div class="toolbar" style="display:flex; gap:10px; margin-bottom:15px;">
                        <div class="search-wrapper" style="flex:1;">
                            <input type="text" id="busca-fin" class="search-input-modern" placeholder="Pesquisar por aluno..." oninput="App.filtrarFinanceiro()">
                        </div>
                        <button class="btn-new-modern" style="height:auto; padding:10px 15px; background: #2c3e50;" onclick="App.imprimirCarneSelecionados()">🖨️ IMPRIMIR CARNÊS</button>
                    </div>
                    <div id="fin-lista-area" style="flex:1; overflow-y:auto;">
                        </div>
                </div>
            </div>
        `;
        App.filtrarFinanceiro();
    } catch (e) {
        div.innerHTML = "Erro ao carregar dados.";
    }
};

App.filtrarFinanceiro = () => {
    const termo = document.getElementById('busca-fin').value.trim().toLowerCase();
    const container = document.getElementById('fin-lista-area');
    let lista = App.listaCache || [];
    
    if(termo) lista = lista.filter(i => (i.alunoNome || '').toLowerCase().includes(termo));
    
    if(!lista.length) { container.innerHTML = '<p style="text-align:center; color:#666; padding:20px;">Nenhum lançamento encontrado.</p>'; return; }

    let html = '<div class="table-responsive-wrapper"><table style="width:100%; font-size:13px; border-collapse: collapse;"><thead><tr><th style="padding:10px; border-bottom:2px solid #eee;"><input type="checkbox" onchange="App.toggleAllFin(this)"></th><th style="padding:10px; border-bottom:2px solid #eee; text-align:left;">Aluno</th><th style="padding:10px; border-bottom:2px solid #eee; text-align:left;">Descrição</th><th style="padding:10px; border-bottom:2px solid #eee; text-align:left;">Vencimento</th><th style="padding:10px; border-bottom:2px solid #eee; text-align:left;">Valor</th><th style="padding:10px; border-bottom:2px solid #eee; text-align:left;">Status</th><th style="padding:10px; border-bottom:2px solid #eee; text-align:right;">Ações</th></tr></thead><tbody>';
    
    lista.sort((a,b) => new Date(a.vencimento) - new Date(b.vencimento)).forEach(f => {
        const dataBr = f.vencimento ? f.vencimento.split('-').reverse().join('/') : '-';
        const val = parseFloat(f.valor).toLocaleString('pt-BR', {minimumFractionDigits:2});
        let st = f.status === 'Pago' ? '<span style="color:#27ae60; font-weight:bold; background:#eafaf1; padding:3px 8px; border-radius:4px;">Pago</span>' : '<span style="color:#e74c3c; font-weight:bold; background:#fdedec; padding:3px 8px; border-radius:4px;">Pendente</span>';
        let btnAcao = f.status === 'Pendente' ? `<button class="btn-edit" style="background:#27ae60; font-size:11px; padding:6px 10px;" onclick="App.baixarFinanceiro('${f.id}')">✔️ Dar Baixa</button>` : '';
        
        html += `<tr style="border-bottom: 1px solid #eee;">
            <td style="padding:10px;"><input type="checkbox" class="chk-fin" value="${f.id}"></td>
            <td style="padding:10px; font-weight:600;">${f.alunoNome || ''}</td>
            <td style="padding:10px; color:#555;">${f.descricao || ''}</td>
            <td style="padding:10px; font-weight:bold; color:${f.status === 'Pendente' && new Date(f.vencimento+'T00:00:00') < new Date() ? '#e74c3c' : '#333'};">${dataBr}</td>
            <td style="padding:10px;">R$ ${val}</td>
            <td style="padding:10px;">${st}</td>
            <td style="padding:10px; text-align:right;">${btnAcao} <button class="btn-del" style="font-size:11px; padding:6px 10px;" onclick="App.excluir('financeiro', '${f.id}')">🗑️</button></td>
        </tr>`;
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;
};

App.toggleAllFin = (cb) => {
    document.querySelectorAll('.chk-fin').forEach(c => c.checked = cb.checked);
};

App.salvarFinanceiro = async () => {
    const idAluno = document.getElementById('fin-aluno').value;
    const sel = document.getElementById('fin-aluno');
    const alunoNome = sel.options[sel.selectedIndex].text;
    const valor = document.getElementById('fin-valor').value;
    const dataStr = document.getElementById('fin-data').value;
    const parcelas = parseInt(document.getElementById('fin-parcelas').value) || 1;
    const descBase = document.getElementById('fin-desc').value;

    if(!idAluno || !valor || !dataStr) return App.showToast('Preencha Aluno, Valor e Data.', 'error');
    
    const btn = document.querySelector('button[onclick="App.salvarFinanceiro()"]');
    btn.innerHTML = 'Gerando... ⏳'; btn.disabled = true;

    try {
        const baseDate = new Date(dataStr + 'T12:00:00');
        const carneId = 'CRN_' + Date.now();
        
        for(let i = 0; i < parcelas; i++) {
            let d = new Date(baseDate);
            d.setMonth(d.getMonth() + i);
            let venc = d.toISOString().split('T')[0];
            let desc = parcelas > 1 ? `${descBase} (${i+1}/${parcelas})` : descBase;
            
            await App.api('/financeiro', 'POST', {
                id: Date.now().toString() + i,
                idCarne: carneId,
                idAluno: idAluno,
                alunoNome: alunoNome,
                valor: valor,
                vencimento: venc,
                status: 'Pendente',
                descricao: desc,
                tipo: 'Receita',
                dataGeracao: new Date().toLocaleDateString('pt-BR')
            });
        }
        App.showToast('Lançamentos gerados com sucesso!', 'success');
        App.renderizarFinanceiroPro();
    } catch(e) {
        App.showToast('Erro ao gerar lançamentos.', 'error');
    } finally {
        btn.innerHTML = '💾 GERAR LANÇAMENTOS'; btn.disabled = false;
    }
};

App.baixarFinanceiro = async (id) => {
    if(!confirm('Confirmar o pagamento desta parcela?')) return;
    try {
        const item = App.listaCache.find(i => i.id === id);
        item.status = 'Pago';
        await App.api(`/financeiro/${id}`, 'PUT', item);
        App.showToast('Baixa realizada com sucesso!', 'success');
        App.renderizarFinanceiroPro();
    } catch(e) {
        App.showToast('Erro ao realizar a baixa.', 'error');
    }
};

// =========================================================================
// O NOVO GERADOR DE CARNÊS PREMIUM (MODELO BOLETO DE ALTA CONVERSÃO)
// =========================================================================

App.gerarCarneHTML = (f, escola) => {
    const logo = escola.foto ? `<img src="${escola.foto}" class="carne-logo-img">` : '';
    // Aumentamos a caixa do QR Code para 120x120 para melhor leitura
    const qrCode = escola.qrCodeImagem ? `<img src="${escola.qrCodeImagem}" class="carne-qr-img">` : '<div style="width:120px; height:120px; border:1px dashed #ccc; display:flex; align-items:center; justify-content:center; font-size:10px; color:#999; text-align:center;">Nenhum<br>QR Code</div>';
    
    const valorFmt = parseFloat(f.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    const dataBr = f.vencimento ? f.vencimento.split('-').reverse().join('/') : '';
    
    return `
    <div class="carne-row">
        <div class="carne-canhoto">
            <div class="carne-header-box">
                ${logo}
                <div class="carne-inst-info"><div class="carne-inst-name">${escola.nome || 'Instituição de Ensino'}</div></div>
            </div>
            <div class="carne-field"><span class="carne-label">Aluno(a)</span><span class="carne-value">${f.alunoNome || ''}</span></div>
            <div class="carne-field"><span class="carne-label">Vencimento</span><span class="carne-value">${dataBr}</span></div>
            <div class="carne-field"><span class="carne-label">Valor</span><span class="carne-value">R$ ${valorFmt}</span></div>
            <div class="carne-field"><span class="carne-label">Referência / Documento</span><span class="carne-value">${f.descricao || ''}</span></div>
            <div style="margin-top:auto; text-align:center; font-size:9px; border-top:1px solid #ccc; padding-top:5px; color:#555;">Assinatura / Visto do Caixa</div>
        </div>

        <div class="carne-recibo">
            <div class="carne-header-box">
                ${logo}
                <div class="carne-inst-info">
                    <div class="carne-inst-name">${escola.nome || 'Instituição de Ensino'}</div>
                    <div class="carne-inst-cnpj">${escola.cnpj ? 'CNPJ: ' + escola.cnpj : ''}</div>
                </div>
                <div class="badge-recibo">RECIBO DO ALUNO</div>
            </div>
            
            <div class="carne-body">
                <div class="carne-details">
                    <div class="carne-field"><span class="carne-label">Pagador / Aluno(a)</span><span class="carne-value">${f.alunoNome || ''}</span></div>
                    
                    <div style="display:flex; gap:10px;">
                        <div class="carne-field highlight" style="flex:1;">
                            <span class="carne-label">Data de Vencimento</span>
                            <span class="carne-value large" style="color:#27ae60;">${dataBr}</span>
                        </div>
                        <div class="carne-field highlight" style="flex:1;">
                            <span class="carne-label">Valor do Documento</span>
                            <span class="carne-value large" style="color:#c0392b;">R$ ${valorFmt}</span>
                        </div>
                    </div>
                    
                    <div class="carne-field"><span class="carne-label">Referência / Descrição</span><span class="carne-value" style="font-weight:normal;">${f.descricao || ''}</span></div>
                    
                    <div class="carne-instructions">
                        <strong>⚠️ INSTRUÇÕES DE PAGAMENTO</strong>
                        Após o vencimento, perda de descontos e benefícios.<br>
                        <span style="font-size:9px; color:#555; font-weight:normal;">O pagamento em dia garante a manutenção das suas condições especiais.</span>
                    </div>
                </div>
                
                <div class="carne-qr-area">
                    ${qrCode}
                    <div class="carne-qr-text">📸 ESCANEIE AQUI</div>
                    <div style="font-size:8px; text-align:center; margin-top:5px; color:#666; font-weight:bold;">Pague via PIX com<br>qualquer app de banco.</div>
                </div>
            </div>
        </div>
    </div>
    `;
};

App.imprimirCarneSelecionados = () => {
    const marcados = Array.from(document.querySelectorAll('.chk-fin:checked')).map(c => c.value);
    if(!marcados.length) return App.showToast('Selecione pelo menos um lançamento para imprimir.', 'warning');
    
    const perfil = JSON.parse(localStorage.getItem(App.getTenantKey('escola_perfil'))) || {};
    const itens = App.listaCache.filter(i => marcados.includes(i.id)).sort((a,b) => new Date(a.vencimento) - new Date(b.vencimento));
    
    const html = itens.map(f => App.gerarCarneHTML(f, perfil)).join('');
    
    const win = window.open('', '_blank');
    win.document.write(`
        <html><head><title>Impressão de Carnês</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #fff; }
            
            /* Estrutura Premium do Boleto */
            .carne-row { display: flex; width: 100%; height: 280px; border: 1px solid #999; margin-bottom: 20px; color: black; box-sizing: border-box; }
            .carne-canhoto { width: 30%; border-right: 2px dashed #999; padding: 12px; display: flex; flex-direction: column; justify-content: space-between; background: #fdfdfd; box-sizing: border-box; }
            .carne-recibo { width: 70%; padding: 12px; display: flex; flex-direction: column; position: relative; background: #fff; box-sizing: border-box; }
            
            /* Cabeçalho */
            .carne-header-box { display: flex; align-items: center; border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 8px; }
            .carne-logo-img { height: 40px; width: auto; object-fit: contain; margin-right: 12px; }
            .carne-inst-info { flex: 1; }
            .carne-inst-name { font-size: 14px; font-weight: 900; text-transform: uppercase; color: #222; }
            .carne-inst-cnpj { font-size: 10px; color: #555; margin-top: 2px; }
            .badge-recibo { background: #333; color: #fff; font-size: 10px; font-weight: bold; padding: 4px 8px; border-radius: 3px; position: absolute; top: 12px; right: 12px; }
            
            /* Corpo */
            .carne-body { display: flex; gap: 15px; flex: 1; }
            .carne-details { flex: 1; display: flex; flex-direction: column; gap: 6px; }
            .carne-qr-area { width: 150px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-left: 2px solid #eee; padding-left: 15px; }
            
            /* Campos de Dados */
            .carne-field { border: 1px solid #ddd; padding: 6px 8px; border-radius: 4px; background: #fff; }
            .carne-field.highlight { background: #f4f6f7; border-color: #bdc3c7; }
            .carne-label { font-size: 9px; color: #555; text-transform: uppercase; display: block; margin-bottom: 3px; font-weight: bold; }
            .carne-value { font-size: 12px; font-weight: 800; color: #111; display: block; }
            .carne-value.large { font-size: 16px; }
            
            /* Gatilho Mental */
            .carne-instructions { background: #fffaf0; border: 1px dashed #e74c3c; padding: 10px; font-size: 11px; margin-top: auto; border-radius: 4px; text-align: center; }
            .carne-instructions strong { color: #c0392b; font-size: 12px; display: block; margin-bottom: 4px; text-transform: uppercase; }
            
            /* QR Code Maior */
            .carne-qr-img { width: 120px; height: 120px; object-fit: contain; border: 1px solid #ddd; padding: 3px; border-radius: 6px; margin-bottom: 8px; background:#fff; }
            .carne-qr-text { font-size: 10px; font-weight: bold; text-align: center; background: #27ae60; color: #fff; padding: 4px 10px; border-radius: 12px; width: 100%; box-sizing: border-box; }
            
            @media print { 
                @page { size: A4; margin: 10mm; }
                body { padding: 0; }
                .carne-row { page-break-inside: avoid; border-color: #000; }
                .carne-canhoto { border-right-color: #000; }
                .carne-header-box { border-bottom-color: #000; }
                .carne-instructions { border-color: #000; background: #eee !important; color: #000; }
                .carne-instructions strong { color: #000; }
                .carne-value.large { color: #000 !important; }
                .carne-qr-text { background: #000 !important; color: #fff !important; }
            }
        </style>
        </head><body onload="window.print()">${html}</body></html>
    `);
};

App.renderizarInadimplencia = async () => {
    App.setTitulo("Relatório de Inadimplência");
    const div = document.getElementById('app-content');
    div.innerHTML = 'Carregando...';
    
    try {
        const alunos = await App.api('/alunos');
        const financeiro = await App.api('/financeiro');
        
        const hoje = new Date();
        const inadimplentes = financeiro.filter(f => f.status === 'Pendente' && new Date(f.vencimento + 'T00:00:00') < hoje);
        
        if(!inadimplentes.length) {
            div.innerHTML = '<div class="card" style="text-align:center; padding:50px;"><h2 style="color:#27ae60;">🎉 Excelente!</h2><p>Nenhuma mensalidade em atraso.</p></div>';
            return;
        }

        let totalAtraso = inadimplentes.reduce((acc, cur) => acc + parseFloat(cur.valor), 0);
        
        let html = `
            <div class="card" style="border-left: 5px solid #e74c3c;">
                <h3>⚠️ Visão Geral da Inadimplência</h3>
                <div style="display:flex; gap:20px; align-items:center;">
                    <div style="font-size:24px; font-weight:bold; color:#e74c3c;">R$ ${totalAtraso.toLocaleString('pt-BR', {minimumFractionDigits:2})}</div>
                    <div style="font-size:14px; color:#666;">Total em Atraso (${inadimplentes.length} títulos)</div>
                </div>
            </div>
            <div class="table-responsive-wrapper">
            <table class="doc-table" style="width:100%;"><thead><tr><th style="text-align:left;">Aluno</th><th style="text-align:left;">Descrição</th><th style="text-align:left;">Vencimento</th><th style="text-align:left;">Valor</th><th style="text-align:right;">Ação</th></tr></thead><tbody>
        `;
        
        inadimplentes.sort((a,b) => new Date(a.vencimento) - new Date(b.vencimento)).forEach(f => {
            const dataBr = f.vencimento.split('-').reverse().join('/');
            const valFmt = parseFloat(f.valor).toLocaleString('pt-BR', {minimumFractionDigits:2});
            const alunoInfo = alunos.find(a => a.id === f.idAluno) || {};
            const zap = alunoInfo.whatsapp || '';
            
            html += `<tr style="border-bottom: 1px solid #eee;">
                <td style="padding:12px;"><strong>${f.alunoNome || ''}</strong></td>
                <td style="padding:12px;">${f.descricao || ''}</td>
                <td style="padding:12px; color:#e74c3c; font-weight:bold;">${dataBr}</td>
                <td style="padding:12px;">R$ ${valFmt}</td>
                <td style="padding:12px; text-align:right;"><button class="btn-primary" style="background:#25D366; padding:6px 12px; margin:0; width:auto;" onclick="if(App.verificarPermissao('whatsapp')) App.cobrarWhatsAppDashboard('${f.alunoNome}', '${zap}', '${dataBr}', '${valFmt}')">💬 Cobrar</button></td>
            </tr>`;
        });
        html += '</tbody></table></div>';
        div.innerHTML = html;

    } catch (e) { div.innerHTML = 'Erro ao carregar inadimplência.'; }
};