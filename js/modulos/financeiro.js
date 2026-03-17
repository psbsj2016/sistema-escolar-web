// =========================================================
// MÓDULO FINANCEIRO V108 (REESTRUTURADO EM COMPONENTES)
// =========================================================

// --- 1. PAINEL PRINCIPAL ---
App.renderizarFinanceiroPro = async () => {
    App.setTitulo("Financeiro");
    const div = document.getElementById('app-content'); 
    div.innerHTML = '<p style="text-align:center; color:#666; padding:20px;">Carregando dados financeiros...</p>';
    
    try {
        const [turmas, financeiro, alunos] = await Promise.all([App.api('/turmas'), App.api('/financeiro'), App.api('/alunos')]);
        App.financeiroCache = financeiro.sort((a,b) => { 
            if(a.status === b.status) return new Date(a.vencimento) - new Date(b.vencimento); 
            return a.status === 'Pendente' ? -1 : 1; 
        });
        
        // 🧱 ATALHOS DA FÁBRICA DE COMPONENTES LOCAIS
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

        // BLOCO 1: Gerador de Mensalidades
        const opAlunos = `<option value="">-- Selecione --</option>` + alunos.map(a => `<option value="${a.id}">${a.nome}</option>`).join('');
        const formGerador = `
            <div style="display:flex; align-items:center; margin-bottom:20px;">
                <div style="font-size:24px; margin-right:10px;">💰</div>
                <div><h3 style="margin:0; color:#2c3e50;">Gerar Mensalidades</h3><p style="margin:0; color:#666; font-size:14px;">Preencha para gerar carnê.</p></div>
            </div>
            <div style="display:flex; gap:20px; align-items:flex-end; flex-wrap:wrap;">
                <div style="flex:3; min-width:250px;">
                    <label style="display:block; font-weight:bold; margin-bottom:8px; font-size:13px; color:#555;">Selecione o Aluno:</label>
                    <select id="fin-aluno" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">${opAlunos}</select>
                </div>
                ${col('Valor (R$):', 'fin-valor', 'number', '', '0,00')}
                ${col('Parcelas:', 'fin-parcelas', 'number', '12')}
                ${col('1º Vencimento:', 'fin-vencimento', 'date', new Date().toISOString().split('T')[0])}
            </div>
            <button onclick="App.gerarCarnes()" style="margin-top:25px; width:100%; background:linear-gradient(90deg,#2980b9,#3498db); color:white; padding:12px; border:none; border-radius:5px; font-weight:bold; cursor:pointer; text-transform:uppercase;">Gerar e Imprimir Carnê</button>
        `;

        // BLOCO 2: Barra de Ferramentas da Tabela
        const barraFerramentas = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
                <div style="display:flex; gap:10px;">
                    ${botao('BAIXAR', "App.abrirModalBaixa()", 'primary', '✅')}
                    ${botao('DESFAZER', "App.acaoLote('pendente')", 'edit', '↩️')}
                    ${botao('EXCLUIR', "App.acaoLote('excluir')", 'cancel', '🗑️')}
                </div>
                <div class="search-wrapper" style="width: 300px; position:relative;">
                    <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); opacity:0.5;">🔍</span>
                    <input type="text" id="fin-busca" placeholder="Pesquisar lançamentos..." oninput="App.filtrarFinanceiro(this.value)" style="width:100%; padding:10px 10px 10px 35px; border:1px solid #ddd; border-radius:5px;">
                </div>
            </div>
            <div id="fin-lista-area" style="overflow-x:auto;">
                ${App.gerarTabelaFinanceira(App.financeiroCache)}
            </div>
        `;

        // MONTAGEM FINAL
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

// --- HELPER: GERA TABELA FINANCEIRA (Limpa e Organizada) ---
App.gerarTabelaFinanceira = (dados) => {
    if(!dados || dados.length === 0) return '<p style="text-align:center; padding:20px; color:#999;">Nenhum lançamento encontrado.</p>';
    
    const th = (texto, align='center') => `<th style="padding:12px; text-align:${align};">${texto}</th>`;
    const cabecalho = `<tr style="background:#f4f6f7; color:#7f8c8d; text-transform:uppercase; font-size:12px;">
        <th style="padding:12px; width:40px; text-align:center;"><input type="checkbox" onchange="App.toggleCheck(this)"></th>
        ${th('Aluno', 'left')}${th('Parcela')}${th('Vencimento')}${th('Valor')}${th('Status')}${th('Ações')}
    </tr>`;

    const corpo = dados.map(p => { 
        const isPago = p.status === 'Pago'; 
        const color = isPago ? '#1e8449' : (p.status === 'Pendente' ? '#f39c12' : '#e74c3c'); 
        const bgRow = isPago ? 'background-color:#eafaf1;' : '';
        const statusBadge = `<span style="background:${isPago?'#d4efdf':'#fdf2f2'}; padding:4px 8px; border-radius:4px; font-size:12px;">${p.status}</span>`;
        const parcelaStr = p.descricao.includes('/') ? p.descricao.split(' ').pop() : '-';
        const vencStr = p.vencimento.split('-').reverse().join('/');
        
        return `
        <tr style="border-bottom:1px solid #eee; ${bgRow} transition:background 0.2s;">
            <td style="padding:12px; text-align:center;"><input type="checkbox" class="fin-check" value="${p.id}"></td>
            <td style="padding:12px; font-weight:bold;">${p.alunoNome}</td>
            <td style="padding:12px; text-align:center;">${parcelaStr}</td>
            <td style="padding:12px; text-align:center;">${vencStr}</td>
            <td style="padding:12px; text-align:center;">R$ ${p.valor}</td>
            <td style="padding:12px; text-align:center; font-weight:bold; color:${color};">${statusBadge}</td>
            <td style="padding:12px; text-align:center;">
                <button onclick="App.abrirCarneExistente('${p.idCarne}')" style="background:#3498db; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer;" title="Ver Carnê">📄</button>
                <button onclick="App.editarParcela('${p.id}')" style="background:#f39c12; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer; margin-left:5px;" title="Editar Valor">✏️</button>
            </td>
        </tr>`; 
    }).join('');

    return `<table style="width:100%; border-collapse:collapse; font-size:14px; color:#555;"><thead>${cabecalho}</thead><tbody>${corpo}</tbody></table>`;
};

// --- HELPER: FILTRAR ---
App.filtrarFinanceiro = (termo) => {
    const t = termo.toLowerCase();
    const filtrados = App.financeiroCache.filter(f => (f.alunoNome && f.alunoNome.toLowerCase().includes(t)) || (f.descricao && f.descricao.toLowerCase().includes(t)) || f.vencimento.includes(t));
    document.getElementById('fin-lista-area').innerHTML = App.gerarTabelaFinanceira(filtrados);
};

// --- 2. MODAL DE BAIXA (Pagamento) ---
App.abrirModalBaixa = () => {
    const checks = document.querySelectorAll('.fin-check:checked');
    if(checks.length === 0) return App.showToast("Selecione pelo menos um lançamento para dar baixa.", "warning");

    let total = 0;
    for(const c of checks) {
        const item = App.financeiroCache.find(f => f.id == c.value);
        if(item) total += parseFloat(item.valor);
    }

    const modal = document.getElementById('modal-overlay');
    if(modal) modal.style.display = 'flex';
    document.getElementById('modal-titulo').innerText = `Confirmar Pagamento (${checks.length} item/ns)`;
    
    // 🧱 COMPONENTES PARA O MODAL
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
        const total = parseFloat(document.getElementById('baixa-total').value);
        const val1 = parseFloat(document.getElementById('baixa-valor-1').value) || 0;
        let val2 = total - val1;
        if(val2 < 0) val2 = 0;
        document.getElementById('baixa-valor-2').value = val2.toFixed(2);
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
    const totalSelected = parseFloat(document.getElementById('baixa-total').value);
    
    try {
        const btn = document.querySelector('.btn-confirm');
        btn.innerText = "Processando..."; btn.disabled = true;

        for(const c of checks) {
            const item = App.financeiroCache.find(f => f.id == c.value);
            if(item) {
                const proportion = parseFloat(item.valor) / totalSelected;
                const itemV1 = (parseFloat(v1) * proportion).toFixed(2);
                const itemV2 = qtd === '2' ? (parseFloat(v2) * proportion).toFixed(2) : null;

                const payload = { ...item, status: 'Pago', dataPagamento: dataPagamento, formaPagamento: f1, valorPago1: itemV1, formaPagamento2: f2, valorPago2: itemV2 };
                await App.api(`/financeiro/${item.id}`, 'PUT', payload);
            }
        }
        App.showToast("Pagamento registrado com sucesso!", "success");
        App.fecharModal();
        App.renderizarFinanceiroPro();
    } catch(e) { App.showToast("Erro ao processar baixa.", "error"); }
};

// --- 3. LÓGICAS DO BACKEND E UTILIDADES (MANTIDAS) ---
App.gerarCarnes=async()=>{const idA=document.getElementById('fin-aluno').value;const val=document.getElementById('fin-valor').value;const parc=document.getElementById('fin-parcelas').value;const dataIni=document.getElementById('fin-vencimento').value;if(!idA||!val||!parc||!dataIni)return alert("Preencha todos os campos.");const alunoNome=document.getElementById('fin-aluno').options[document.getElementById('fin-aluno').selectedIndex].text;let db=new Date(dataIni+'T00:00:00');const idLote=Date.now().toString();const dataGeracao=new Date().toLocaleDateString('pt-BR');for(let i=1;i<=parc;i++){const vencUS=db.toISOString().split('T')[0];await App.api('/financeiro','POST',{id:idLote+"_"+i,idCarne:idLote,dataGeracao,idAluno:idA,alunoNome,valor:val,vencimento:vencUS,status:'Pendente',descricao:`Mensalidade ${i}/${parc}`,tipo:'Receita'});db.setMonth(db.getMonth()+1);}App.abrirCarneExistente(idLote);};
App.toggleCheck=(s)=>{document.querySelectorAll('.fin-check').forEach(c=>c.checked=s.checked);};
App.acaoLote=async(a)=>{const c=document.querySelectorAll('.fin-check:checked');if(c.length===0)return alert("Selecione.");if(!confirm("Confirmar?"))return;for(const x of c){if(a==='excluir')await App.api(`/financeiro/${x.value}`,'DELETE');else{const i=await App.api(`/financeiro/${x.value}`);await App.api(`/financeiro/${x.value}`,'PUT',{...i,status:(a==='baixar'?'Pago':'Pendente')});}}App.renderizarFinanceiroPro();};
App.editarParcela=async(id)=>{const v=prompt("Novo Valor:");if(v){const i=await App.api(`/financeiro/${id}`);await App.api(`/financeiro/${id}`,'PUT',{...i,valor:v});App.renderizarFinanceiroPro();}};

App.cobrarWhatsApp = async (idAluno, valorTotal, idFinanceiro = null) => { 
    try {
        const aluno = await App.api(`/alunos/${idAluno}`);
        const zap = aluno.whatsapp;

        if(!zap || zap.length < 8 || zap === 'undefined') {
            App.showToast("Este aluno não tem um número de WhatsApp cadastrado!", "error");
            return; 
        }
        
        if(idFinanceiro) {
            const item = await App.api(`/financeiro/${idFinanceiro}`);
            await App.api(`/financeiro/${idFinanceiro}`, 'PUT', {...item, cobradoZap: true});
        }
        
        let numero = zap.replace(/\D/g, '');
        if (numero.length === 10 || numero.length === 11) numero = '55' + numero; 
        
        const msg = `Olá, ${aluno.nome.split(' ')[0]}! Tudo bem?\n\nConsta uma pendência no valor total de R$ ${valorTotal} na escola. Podemos ajudar a regularizar?\n\nQualquer dúvida, estamos à disposição!`;
        window.open(`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`, '_blank'); 
    } catch (e) { App.showToast("Erro ao processar cobrança.", "error"); }
};

App.enviarWhatsApp = async (idFinanceiro) => {
    try {
        const item = await App.api(`/financeiro/${idFinanceiro}`);
        if (!item.idAluno) return App.showToast("Este registo não está vinculado a um aluno.", "error");

        const aluno = await App.api(`/alunos/${item.idAluno}`);
        if (!aluno.whatsapp) return App.showToast("O aluno não tem número de WhatsApp registado.", "warning");

        let numero = aluno.whatsapp.replace(/\D/g, '');
        if (numero.length === 10 || numero.length === 11) numero = '55' + numero; 

        const valorFmt = parseFloat(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        const dataFmt = item.vencimento.split('-').reverse().join('/');
        
        let mensagem = "";
        const saudacao = `Olá, ${aluno.nome.split(' ')[0]}! Tudo bem?`;

        if (item.status === 'Pago') {
            mensagem = `${saudacao}\n\nPassando apenas para enviar o recibo e agradecer o pagamento referente a *${item.descricao}*, no valor de R$ ${valorFmt}.\n\nMuito obrigado! 🎓`;
        } else {
            mensagem = `${saudacao}\n\nEste é um lembrete amigável sobre o vencimento referente a *${item.descricao}*, no valor de R$ ${valorFmt}. A data de vencimento está registada para ${dataFmt}.\n\nQualquer dúvida ou se já efetuaste o pagamento, por favor avisa-nos. Estamos à disposição! 🤝`;
        }

        window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`, '_blank');
    } catch (e) { App.showToast("Erro ao processar o WhatsApp.", "error"); }
};

// --- 4. RENDERIZAÇÕES DE IMPRESSÃO (Carnês e Inadimplência) ---
App.abrirCarneExistente = async (idLote) => {
    const div = document.getElementById('app-content'); div.innerHTML = '<p style="text-align:center; padding:20px;">Gerando Layout de Impressão...</p>';
    try {
        const [financeiro, alunos, escola] = await Promise.all([App.api('/financeiro'), App.api('/alunos'), App.api('/escola')]);
        const parcelas = financeiro.filter(x => x.idCarne === idLote).sort((a,b) => new Date(a.vencimento) - new Date(b.vencimento));
        if(parcelas.length === 0) return App.showToast("Carnê não encontrado.", "error");
        
        const aluno = alunos.find(a => a.id === parcelas[0].idAluno) || { nome: parcelas[0].alunoNome, cpf: '', rua: '', bairro: '', cidade: '' };
        const logo = escola.foto ? `<img src="${escola.foto}" class="carne-logo-img">` : '';
        let qrCodeImg = escola.qrCodeImagem ? `<img src="${escola.qrCodeImagem}" style="width:60px; height:60px; object-fit:contain;">` : (escola.chavePix ? `<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(escola.chavePix)}" style="width:60px; height:60px;">` : '<div style="font-size:8px;">Sem PIX</div>');
        
        const carnesHTML = parcelas.map((p, index) => { 
            const numParcela = p.descricao.includes('/') ? p.descricao.split(' ')[1] : `${index+1}/${parcelas.length}`; 
            const dataVenc = p.vencimento.split('-').reverse().join('/'); 
            const valorF = parseFloat(p.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2}); 
            
            return `
            <div class="carne-row">
                <div class="carne-canhoto">
                    <div class="carne-header-box">${logo}<div class="carne-inst-name">${escola.nome.substr(0,18)}</div><div class="carne-inst-cnpj">CNPJ: ${escola.cnpj}</div></div>
                    <div style="margin-top:5px;">
                        <span class="carne-label">Vencimento</span> <span class="carne-value">${dataVenc}</span>
                        <span class="carne-label">Parcela</span> <span class="carne-value">${numParcela}</span>
                        <span class="carne-label">Valor</span> <span class="carne-value">R$ ${valorF}</span>
                    </div>
                    <div style="margin-top:auto;"><span class="carne-label">Sacado</span><span class="carne-value" style="font-size:9px;">${aluno.nome.split(' ')[0]}</span></div>
                </div>
                <div class="carne-recibo">
                    <div class="badge-recibo">RECIBO</div>
                    <div style="display:flex; align-items:center; border-bottom:2px solid #000; padding-bottom:3px; margin-bottom:3px;">
                        ${logo}
                        <div style="margin-left:10px; flex:1;"><div style="font-weight:bold; font-size:13px; text-transform:uppercase;">${escola.nome}</div><div style="font-size:9px;">CNPJ: ${escola.cnpj}</div></div>
                    </div>
                    <div class="carne-data-grid">
                        <div class="carne-data-box"><span class="carne-label">Nosso Número</span><span class="carne-value">${p.id.substr(-10)}</span></div>
                        <div class="carne-data-box"><span class="carne-label">Vencimento</span><span class="carne-value" style="color:#c0392b;">${dataVenc}</span></div>
                        <div class="carne-data-box"><span class="carne-label">Valor</span><span class="carne-value">R$ ${valorF}</span></div>
                    </div>
                    <div class="carne-instructions">
                        <span class="carne-label">Instruções</span>Ref: ${p.descricao} - Curso: ${aluno.curso || 'Geral'}<br><i>Após vencimento, multa de 2% e juros de 1%.</i>
                    </div>
                    <div class="carne-footer">
                        <div class="carne-payer"><span class="carne-label">Pagador</span><b class="carne-value">${aluno.nome}</b><span style="font-size:8px;">CPF: ${aluno.cpf || '-'}</span><br><span style="font-size:8px;">${aluno.rua||''}, ${aluno.bairro||''}</span></div>
                        <div class="carne-qr">${qrCodeImg}</div>
                    </div>
                </div>
            </div>`; 
        }).join('');
        
        div.innerHTML = `
            <div class="no-print" style="text-align:center; padding:20px; background:#f0f0f0;">
                <button onclick="window.print()" class="btn-primary" style="padding:12px 25px;">🖨️ IMPRIMIR</button>
                <button onclick="App.renderizarFinanceiroPro()" style="background:#7f8c8d; color:white; border:none; padding:12px 25px; border-radius:5px; margin-left:10px; cursor:pointer;">VOLTAR</button>
            </div>
            <div class="print-sheet carne-layout">${carnesHTML}</div>`;
    } catch(e) { App.showToast("Erro ao gerar carnê.", "error"); }
};

App.renderizarInadimplencia = async () => {
    const div = document.getElementById('app-content'); div.innerHTML = '<p style="text-align:center; padding:20px;">Calculando inadimplência...</p>';
    try {
        const [financeiro, alunos, escola] = await Promise.all([App.api('/financeiro'), App.api('/alunos'), App.api('/escola')]);
        const hoje = new Date(); const vencidos = financeiro.filter(f => f.status !== 'Pago' && new Date(f.vencimento + 'T00:00:00') < hoje);
        
        let totalAtraso = 0; const devedoresMap = {};
        vencidos.forEach(f => { 
            if(!devedoresMap[f.idAluno]) { 
                const aluno = alunos.find(a => a.id == f.idAluno); 
                devedoresMap[f.idAluno] = { idAluno: f.idAluno, nome: f.alunoNome, curso: aluno ? aluno.curso : '-', total: 0, detalhes: [] }; 
            } 
            devedoresMap[f.idAluno].total += parseFloat(f.valor); 
            devedoresMap[f.idAluno].detalhes.push(`${f.vencimento.split('-').reverse().join('/')} (R$ ${parseFloat(f.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})})`); 
            totalAtraso += parseFloat(f.valor); 
        });
        
        const listaDevedores = Object.values(devedoresMap); 
        const dataHojeStr = new Date().toLocaleDateString('pt-BR'); 
        const logo = escola.foto ? `<img src="${escola.foto}" style="height:50px;">` : '';
        
        const style = `<style>.inad-card-top { border-left: 5px solid #c0392b; padding: 25px; border-radius: 8px; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-bottom: 20px; } .inad-kpi-box { display: flex; gap: 20px; margin-top: 20px; } .inad-kpi { flex: 1; text-align: center; padding: 20px; border-radius: 8px; border: 1px solid #eee; } .inad-kpi-red { background: #fdf2f2; border-color: #f5b7b1; } .inad-kpi-label { font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; } .inad-kpi-val { font-size: 24px; font-weight: bold; } .inad-list-title { color: #c0392b; font-size: 18px; margin: 0; font-weight: 600; } .inad-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 15px; } .inad-table th { background: #f9f9f9; padding: 12px; text-align: left; color: #888; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #eee; } .inad-table td { padding: 12px; border-bottom: 1px solid #eee; color: #333; } .btn-cobrar { background: #27ae60; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; font-size: 11px; text-decoration: none; } @media print { .no-print { display: none !important; } .print-sheet { width: 100%; } .inad-card-top { border: 1px solid #000; box-shadow: none; } .inad-kpi-red { background: #eee !important; -webkit-print-color-adjust: exact; } }</style>`;
        
        const linhasTabela = listaDevedores.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding:20px; color:#999;">Nenhuma pendência encontrada.</td></tr>' : listaDevedores.map(d => `<tr><td style="font-weight:bold;">${d.nome}</td><td>${d.curso}</td><td style="font-size:11px; color:#666;">${d.detalhes.join('<br>')}</td><td style="color:#c0392b; font-weight:bold;">R$ ${d.total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td><td class="no-print" style="text-align:right;"><button onclick="App.cobrarWhatsApp('${d.idAluno}', '${d.total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}')" class="btn-cobrar">💬 Cobrar</button></td></tr>`).join('');

        div.innerHTML = `${style}
            <div style="margin-bottom: 20px;" class="no-print">
                <button onclick="App.renderizarFinanceiroPro()" style="background:#7f8c8d; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer; display:inline-flex; align-items:center; gap:5px;">⬅ VOLTAR</button>
            </div>
            
            <div class="print-sheet">
                <div class="doc-header">
                    <div style="display:flex; align-items:center; gap:15px;">
                        ${logo}
                        <div><h2 style="margin:0; text-transform:uppercase; font-size:18px; color:#2c3e50;">${escola.nome}</h2><div style="font-size:12px; color:#666;">CNPJ: ${escola.cnpj}</div></div>
                    </div>
                    <div style="text-align:right;"><div style="font-size:12px; color:#666;">Emissão: ${dataHojeStr}</div></div>
                </div>
                
                <div style="border-bottom: 2px solid #2c3e50; margin-bottom: 20px; padding-bottom: 10px; display:flex; align-items:center; gap:10px;">
                    <span style="font-size:24px;">📉</span><h2 style="margin:0; color:#2c3e50;">Relatório de Inadimplência</h2>
                </div>
                
                <div class="inad-card-top">
                    <p style="color:#666; margin:0; font-size:14px;">Este relatório exibe apenas parcelas com data de vencimento anterior a hoje (${dataHojeStr}).</p>
                    <div class="inad-kpi-box">
                        <div class="inad-kpi inad-kpi-red">
                            <div class="inad-kpi-label" style="color:#c0392b;">TOTAL EM ATRASO</div>
                            <div class="inad-kpi-val" style="color:#c0392b;">R$ ${totalAtraso.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                        </div>
                        <div class="inad-kpi">
                            <div class="inad-kpi-label" style="color:#555;">ALUNOS DEVEDORES</div>
                            <div class="inad-kpi-val" style="color:#333;">${listaDevedores.length}</div>
                        </div>
                    </div>
                </div>
                
                <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:30px; margin-bottom:10px;">
                    <h3 class="inad-list-title">Lista de Pendências Vencidas</h3>
                    <button onclick="window.print()" class="no-print" style="background:#34495e; color:white; border:none; padding:10px 20px; border-radius:5px; font-weight:bold; cursor:pointer;">🖨️ IMPRIMIR LISTA</button>
                </div>
                
                <table class="inad-table">
                    <thead><tr><th>ALUNO</th><th>CURSO</th><th>DETALHES (VENCIMENTOS)</th><th>TOTAL DEVIDO</th><th class="no-print" style="text-align:right;">AÇÃO</th></tr></thead>
                    <tbody>${linhasTabela}</tbody>
                </table>
            </div>`;
    } catch(e) { App.showToast("Erro ao calcular inadimplência.", "error"); }
};