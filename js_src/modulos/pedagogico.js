// =========================================================
// MÓDULO PEDAGÓGICO V162 (MODAL BONITO + MODO EDIÇÃO BLINDADO + NO CACHE)
// =========================================================

const EVENTO_CORES = { 'Evento': {bg:'#2ecc71',text:'#fff'}, 'Feriado': {bg:'#e74c3c',text:'#fff'}, 'Prova': {bg:'#3498db',text:'#fff'}, 'Reunião': {bg:'#f39c12',text:'#fff'} };

const col = (label, id, tipo='text', val='', extra='') => `
    <div style="flex:1; min-width:150px;">
        <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">${label}</label>
        <input type="${tipo}" id="${id}" value="${val}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;" ${extra}>
    </div>`;

const selectLocal = (label, id, options, extra='') => `
    <div style="flex:1; min-width:150px;">
        <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">${label}</label>
        <select id="${id}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;" ${extra}>${options}</select>
    </div>`;

// --- MODAL DE CONFIRMAÇÃO ELEGANTE ---
App.confirmar = (titulo, mensagem, textoBtn, corBtn, callback) => {
    const id = 'modal-confirm-' + Date.now();
    const overlay = document.createElement('div');
    overlay.id = id;
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:99999; backdrop-filter:blur(3px); opacity:0; transition:opacity 0.2s;';
    
    const card = document.createElement('div');
    card.style.cssText = 'background:#fff; width:90%; max-width:400px; border-radius:12px; padding:30px; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.3); transform:scale(0.9); transition:transform 0.2s;';
    
    card.innerHTML = `
        <div style="font-size:45px; margin-bottom:15px; animation: pop 0.3s ease;">⚠️</div>
        <h3 style="margin:0 0 10px 0; color:#2c3e50; font-size:20px;">${titulo}</h3>
        <p style="color:#7f8c8d; margin-bottom:25px; line-height:1.5; font-size:14px;">${mensagem}</p>
        <div style="display:flex; gap:10px;">
            <button id="btn-no-${id}" style="flex:1; padding:12px; border:none; background:#ecf0f1; color:#7f8c8d; border-radius:8px; font-weight:bold; cursor:pointer; transition:0.2s;" onmouseover="this.style.background='#bdc3c7'" onmouseout="this.style.background='#ecf0f1'">Cancelar</button>
            <button id="btn-yes-${id}" style="flex:1; padding:12px; border:none; background:${corBtn}; color:white; border-radius:8px; font-weight:bold; cursor:pointer; transition:0.2s; opacity:0.9;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.9'">${textoBtn}</button>
        </div>
    `;
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    
    setTimeout(() => { overlay.style.opacity = '1'; card.style.transform = 'scale(1)'; }, 10);
    
    const close = () => {
        overlay.style.opacity = '0'; card.style.transform = 'scale(0.9)';
        setTimeout(() => document.body.removeChild(overlay), 200);
    };
    
    document.getElementById(`btn-no-${id}`).onclick = close;
    document.getElementById(`btn-yes-${id}`).onclick = () => { close(); callback(); };
};

// --- FUNÇÃO GERAL DE FILTRO ---
App.filtrarTabela = (inputId, tabelaId) => {
    const termo = document.getElementById(inputId).value.trim().toLowerCase();
    const linhas = document.querySelectorAll(`#${tabelaId} tbody tr`);
    if (!linhas || linhas.length === 0) return;
    linhas.forEach(linha => {
        if (linha.innerText.includes('Nenhum') || linha.innerText.includes('Nenhuma')) return;
        const textoLinha = linha.innerText.toLowerCase(); 
        linha.style.display = textoLinha.includes(termo) ? '' : 'none';
    });
};

// ---------------------------------------------------------
// 1. PLANEAMENTO (COM FOLHA A4 BLINDADA E ARQUIVAMENTO)
// ---------------------------------------------------------
App.renderizarPlanejamentoPro = () => {
    App.setTitulo("Planeamento");
    const div = document.getElementById('app-content');
    
    const btnStyle = (cor) => `cursor:pointer; background:white; border:2px solid #eee; padding:30px; border-radius:15px; width:220px; transition:0.3s; box-shadow:0 5px 15px rgba(0,0,0,0.05);`;
    const hoverIn = (cor) => `this.style.borderColor='${cor}'; this.style.transform='translateY(-5px)'`;
    const hoverOut = `this.style.borderColor='#eee'; this.style.transform='translateY(0)'`;

    div.innerHTML = `
        <div class="card" style="text-align:center; padding:50px;">
            <h2 style="color:#2c3e50; margin-bottom:10px;">Planeamento Pedagógico</h2>
            <p style="color:#7f8c8d; margin-bottom:40px;">Gira o conteúdo programático e o controlo de aulas.</p>
            <div style="display:flex; justify-content:center; gap:20px; flex-wrap:wrap;">
                <div onclick="App.renderizarNovoPlanejamento()" style="${btnStyle('#3498db')}" onmouseover="${hoverIn('#3498db')}" onmouseout="${hoverOut}">
                    <div style="font-size:50px; margin-bottom:15px;">📝</div>
                    <h3 style="margin:0; color:#3498db;">Novo Planeamento</h3>
                </div>
                <div onclick="App.renderizarPlanejamentosSalvos()" style="${btnStyle('#27ae60')}" onmouseover="${hoverIn('#27ae60')}" onmouseout="${hoverOut}">
                    <div style="font-size:50px; margin-bottom:15px;">📂</div>
                    <h3 style="margin:0; color:#27ae60;">Planeamentos Ativos</h3>
                </div>
                <div onclick="App.renderizarPlanejamentosArquivados()" style="${btnStyle('#8e44ad')}" onmouseover="${hoverIn('#8e44ad')}" onmouseout="${hoverOut}">
                    <div style="font-size:50px; margin-bottom:15px;">🗄️</div>
                    <h3 style="margin:0; color:#8e44ad;">Arquivados</h3>
                </div>
            </div>
        </div>`;
};

App.renderizarNovoPlanejamento = async () => {
    const div = document.getElementById('app-content'); div.innerHTML = 'A carregar...';
    try {
        const alunos = await App.api('/alunos');
        const alunosAtivos = alunos.filter(a => !a.status || a.status === 'Ativo');
        const opAlunos = `<option value="">-- Selecione --</option>` + alunosAtivos.map(a => `<option value="${a.id}" data-curso="${App.escapeHTML(a.curso || 'Geral')}">${App.escapeHTML(a.nome)}</option>`).join('');
        
        const formPlan = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="margin:0; color:#2c3e50;">Configurar Novo Cronograma</h3>
                <button onclick="App.renderizarPlanejamentoPro()" style="background:#ddd; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">Voltar</button>
            </div>
            <div style="background:#f9f9f9; padding:20px; border-radius:8px; border:1px solid #eee;">
                ${selectLocal('Aluno:', 'plan-aluno', opAlunos, 'style="margin-bottom:15px;"')}
                <div style="display:flex; gap:20px; margin-bottom:15px;">
                    ${col('Início:', 'plan-inicio', 'date')}
                    ${col('Total Aulas:', 'plan-qtd', 'number', '10')}
                </div>
                <div style="display:flex; gap:20px; margin-bottom:15px;">
                    ${col('Horário:', 'plan-hora', 'time', '08:00')}
                    ${col('Duração:', 'plan-duracao', 'time', '01:00')}
                </div>
                <label style="font-size:12px; font-weight:bold; color:#666; display:block; margin-bottom:8px;">Dias da Semana:</label>
                <div style="display:flex; gap:10px; flex-wrap:wrap; background:white; padding:10px; border:1px solid #ddd; border-radius:5px;">
                    ${['Seg','Ter','Qua','Qui','Sex','Sáb'].map((dia, i) => `<label><input type="checkbox" class="plan-dia" value="${i+1}"> ${dia}</label>`).join('')}
                </div>
            </div>
            <button onclick="App.gerarGridEditavel()" style="width:100%; margin-top:20px; padding:15px; background:#3498db; color:white; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">CRIAR TABELA</button>
        `;
        div.innerHTML = App.UI.card('', '', formPlan, '800px');
    } catch(e) { div.innerHTML = "Erro."; }
};

App.renderizarPlanejamentosSalvos = async () => {
    const div = document.getElementById('app-content'); div.innerHTML = 'A carregar...';
    try {
        // Cache-buster para garantir que os dados são frescos
        const planos = await App.api(`/planejamentos?_t=${Date.now()}`);
        const planosAtivos = planos.filter(p => p.status !== 'Arquivado');
        
        if(planosAtivos.length === 0) { 
            div.innerHTML = App.UI.card('', '', `<h3>Nenhum planeamento ativo.</h3><button onclick="App.renderizarPlanejamentoPro()" class="btn-primary">Voltar</button>`, 'text-align:center; padding:40px;'); 
            return; 
        }
        
        const cabecalho = `<tr><th style="padding:10px; text-align:left; border-bottom:2px solid #eee;">Aluno</th><th style="padding:10px; text-align:left; border-bottom:2px solid #eee;">Curso</th><th style="padding:10px; border-bottom:2px solid #eee; text-align:center;">Aulas</th><th style="padding:10px; text-align:right; border-bottom:2px solid #eee;">Ações</th></tr>`;
        const corpo = planosAtivos.map(p => `
            <tr style="border-bottom:1px solid #eee;">
                <td style="padding:10px; font-weight:500;">${App.escapeHTML(p.nomeAluno)}</td>
                <td style="padding:10px;">${App.escapeHTML(p.curso)}</td>
                <td style="padding:10px; text-align:center;">${p.aulas ? p.aulas.length : 0}</td>
                <td style="padding:10px; text-align:right;">
                    <button onclick="App.abrirPlanejamentoEditavel('${p.id}')" style="background:#f39c12; color:white; border:none; padding:5px 10px; border-radius:4px; margin-right:5px; cursor:pointer;" title="Editar">✏️</button>
                    <button onclick="App.arquivarPlanejamento('${p.id}')" style="background:#8e44ad; color:white; border:none; padding:5px 10px; border-radius:4px; margin-right:5px; cursor:pointer;" title="Arquivar">🗄️</button>
                    <button onclick="App.excluirPlanejamento('${p.id}')" style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;" title="Excluir">🗑️</button>
                </td>
            </tr>`).join('');

        const buscaHtml = `
            <div style="background: #fff; padding: 10px 15px; border-radius: 8px; border: 1px solid #eee; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <span style="font-size: 18px; color: #aaa;">🔍</span>
                <input type="text" id="input-busca-plan-ativos" 
                       placeholder="Pesquisar planeamento ativo pelo nome do aluno ou curso..." 
                       oninput="App.filtrarTabela('input-busca-plan-ativos', 'tabela-plan-ativos')" 
                       style="flex: 1; border: none; outline: none; font-size: 14px; padding: 5px; background: transparent; width: 100%;">
            </div>
        `;

        div.innerHTML = App.UI.card('', '', `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="margin:0; color:#27ae60;">Planeamentos Ativos</h3>
                <button onclick="App.renderizarPlanejamentoPro()" style="background:#ddd; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">Voltar</button>
            </div>
            ${buscaHtml}
            <div class="table-responsive-wrapper">
                <table id="tabela-plan-ativos" style="width:100%; border-collapse:collapse;"><thead>${cabecalho}</thead><tbody>${corpo}</tbody></table>
            </div>
        `);
    } catch(e) { div.innerHTML = "Erro."; }
};

App.renderizarPlanejamentosArquivados = async () => {
    const div = document.getElementById('app-content'); div.innerHTML = 'A carregar arquivados...';
    try {
        // Cache-buster para fresco
        const planos = await App.api(`/planejamentos?_t=${Date.now()}`);
        const planosArquivados = planos.filter(p => p.status === 'Arquivado');
        
        if(planosArquivados.length === 0) { 
            div.innerHTML = App.UI.card('', '', `<h3>Nenhum planeamento no arquivo morto.</h3><button onclick="App.renderizarPlanejamentoPro()" class="btn-primary">Voltar</button>`, 'text-align:center; padding:40px;'); 
            return; 
        }
        
        const cabecalho = `<tr><th style="padding:10px; text-align:left; border-bottom:2px solid #eee;">Aluno</th><th style="padding:10px; text-align:left; border-bottom:2px solid #eee;">Curso</th><th style="padding:10px; border-bottom:2px solid #eee; text-align:center;">Aulas</th><th style="padding:10px; text-align:right; border-bottom:2px solid #eee;">Ações</th></tr>`;
        const corpo = planosArquivados.map(p => `
            <tr style="border-bottom:1px solid #ddd; background:#f9f9f9;">
                <td style="padding:10px; color:#7f8c8d; font-weight:500;">${App.escapeHTML(p.nomeAluno)}</td>
                <td style="padding:10px; color:#7f8c8d;">${App.escapeHTML(p.curso)}</td>
                <td style="padding:10px; text-align:center; color:#7f8c8d;">${p.aulas ? p.aulas.length : 0}</td>
                <td style="padding:10px; text-align:right;">
                    <button onclick="App.abrirPlanejamentoVisualizacao('${p.id}')" style="background:#3498db; color:white; border:none; padding:5px 10px; border-radius:4px; margin-right:5px; cursor:pointer;" title="Visualizar">👁️</button>
                    <button onclick="App.restaurarPlanejamento('${p.id}')" style="background:#27ae60; color:white; border:none; padding:5px 10px; border-radius:4px; margin-right:5px; cursor:pointer;" title="Restaurar / Reativar">♻️</button>
                    <button onclick="App.excluirPlanejamentoArquivado('${p.id}')" style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;" title="Excluir Definitivamente">🗑️</button>
                </td>
            </tr>`).join('');

        const buscaHtml = `
            <div style="background: #fff; padding: 10px 15px; border-radius: 8px; border: 1px solid #eee; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <span style="font-size: 18px; color: #aaa;">🔍</span>
                <input type="text" id="input-busca-plan-arquivados" 
                       placeholder="Pesquisar arquivo morto..." 
                       oninput="App.filtrarTabela('input-busca-plan-arquivados', 'tabela-plan-arquivados')" 
                       style="flex: 1; border: none; outline: none; font-size: 14px; padding: 5px; background: transparent; width: 100%;">
            </div>
        `;

        div.innerHTML = App.UI.card('', '', `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h3 style="margin:0; color:#8e44ad;">🗄️ Planeamentos Arquivados</h3>
                <button onclick="App.renderizarPlanejamentoPro()" style="background:#ddd; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">Voltar</button>
            </div>
            <p style="color:#666; font-size:13px; margin-bottom:20px;">Estes planeamentos foram finalizados/arquivados. Não são contabilizados no boletim nem no auto-ajuste de presenças.</p>
            ${buscaHtml}
            <div class="table-responsive-wrapper">
                <table id="tabela-plan-arquivados" style="width:100%; border-collapse:collapse;"><thead>${cabecalho}</thead><tbody>${corpo}</tbody></table>
            </div>
        `);
    } catch(e) { div.innerHTML = "Erro ao ler arquivados."; }
};

App.gerarGridEditavel = () => {
    const alunoSelect = document.getElementById('plan-aluno'); const idAluno = alunoSelect.value;
    if(!idAluno) return alert("Selecione um aluno.");
    const nomeAluno = alunoSelect.options[alunoSelect.selectedIndex].text;
    const cursoAluno = alunoSelect.options[alunoSelect.selectedIndex].getAttribute('data-curso') || "Geral";
    const dataInicio = document.getElementById('plan-inicio').value; const qtdAulas = parseInt(document.getElementById('plan-qtd').value);
    const horario = document.getElementById('plan-hora').value; const duracao = document.getElementById('plan-duracao').value;
    const dias = Array.from(document.querySelectorAll('.plan-dia:checked')).map(cb => parseInt(cb.value));
    
    if(!dataInicio || dias.length === 0) return alert("Preencha os dados corretamente.");
    
    const listaAulas = []; let dataAtual = new Date(dataInicio + 'T00:00:00'); let contador = 0;
    while(contador < qtdAulas) { 
        if(dias.includes(dataAtual.getDay())) { 
            contador++; 
            const d = String(dataAtual.getDate()).padStart(2, '0');
            const m = String(dataAtual.getMonth() + 1).padStart(2, '0');
            const y = dataAtual.getFullYear();
            
            listaAulas.push({ num: contador, data: `${d}/${m}/${y}`, hora: horario, duracao: duracao, conteudo: '', visto: false }); 
        } 
        dataAtual.setDate(dataAtual.getDate() + 1); 
    }
    App.renderizarTelaEdicao({ id: null, idAluno, nomeAluno, curso: cursoAluno, status: 'Ativo', aulas: listaAulas });
};

App.abrirPlanejamentoEditavel = async (id) => { try { const plano = await App.api(`/planejamentos/${id}?_t=${Date.now()}`); App.renderizarTelaEdicao(plano); } catch(e) { alert("Erro."); } };

App.abrirPlanejamentoVisualizacao = async (id) => { 
    try { 
        const plano = await App.api(`/planejamentos/${id}?_t=${Date.now()}`); 
        App.renderizarTelaEdicao(plano, true); // O 'true' ativa o Modo Blindado de Leitura!
    } catch(e) { 
        alert("Erro ao abrir."); 
    } 
};

App.renderizarTelaEdicao = (plano, isReadOnly = false) => {
    App.planoAtual = plano; const div = document.getElementById('app-content');
    
    let totalMinutos = 0;
    plano.aulas.forEach(aula => { 
        if(aula.duracao && aula.duracao.includes(':')) {
            const [h, m] = aula.duracao.split(':').map(Number); 
            totalMinutos += (h * 60) + (m || 0); 
        }
    });
    const horasInt = Math.floor(totalMinutos / 60);
    const minutosRest = totalMinutos % 60;
    const totalHorasText = minutosRest > 0 ? `${horasInt}h ${minutosRest}m` : `${horasInt}H`;
    
    const escola = JSON.parse(localStorage.getItem(App.getTenantKey ? App.getTenantKey('escola_perfil') : 'escola_perfil')) || {}; 
    const logo = escola.foto ? `<img src="${escola.foto}" style="height:50px;">` : '';
    
    // Se for leitura, o botão fechar volta para os Arquivados, senão volta para os Ativos
    const acaoVoltar = isReadOnly ? 'App.renderizarPlanejamentosArquivados()' : 'App.renderizarPlanejamentosSalvos()';
    const tagArquivado = isReadOnly ? '<br><span style="color:#e74c3c; font-size:12px;">(ARQUIVADO - APENAS LEITURA)</span>' : '';

    div.innerHTML = `
        <div class="no-print" style="margin-bottom:20px; background:#f4f4f4; padding:15px; border-radius:10px; display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
            ${!isReadOnly ? `
            <button onclick="App.salvarPlanejamentoBanco()" style="background:#27ae60; color:white; padding:10px 20px; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">💾 SALVAR</button>
            <button id="btn-sync-plan" onclick="App.sincronizarPlanejamentoComChamadasUI()" style="background:#8e44ad; color:white; padding:10px 20px; border:none; border-radius:5px; font-weight:bold; cursor:pointer; box-shadow: 0 4px 10px rgba(142,68,173,0.3);" title="Ajusta datas e a duração exata registada na chamada de presença!">🤖 AUTO-AJUSTAR</button>
            ` : ''}
            <button onclick="window.print()" style="background:#3498db; color:white; padding:10px 20px; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">🖨️ IMPRIMIR</button>
            <button onclick="${acaoVoltar}" style="background:#7f8c8d; color:white; padding:10px 20px; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">FECHAR</button>
        </div>
        
        <div class="print-sheet" style="background: white; max-width: 210mm; margin: 0 auto; padding: 40px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-radius: 8px;">
            <div class="doc-header" style="display:flex; justify-content:space-between; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:20px;">
                <div style="display:flex; align-items:center; gap:15px;">${logo}<div><h2 style="margin:0; text-transform:uppercase; font-size:18px;">${App.escapeHTML(escola.nome||'ESCOLA')}</h2><div style="font-size:12px;">CNPJ: ${App.escapeHTML(escola.cnpj||'')}</div></div></div>
                <div style="text-align:right;"><div><b>Planeamento Pedagógico</b> ${tagArquivado}</div><div style="font-size:12px;">Emissão: ${new Date().toLocaleDateString('pt-BR')}</div></div>
            </div>
            
            <div style="border:1px solid #000; padding:10px; font-size:12px; margin-bottom:15px; background:#fafafa;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div style="width:60%;">
                        <div style="margin-bottom:5px;"><b>ALUNO:</b> ${App.escapeHTML(plano.nomeAluno)}</div>
                        <div><b>TOTAL DE AULAS:</b> ${plano.aulas.length}</div>
                    </div>
                    <div style="width:40%;">
                        <div style="margin-bottom:5px;"><b>CURSO:</b> ${App.escapeHTML(plano.curso)}</div>
                        <div><b>CARGA HORÁRIA PREVISTA:</b> ${totalHorasText}</div>
                    </div>
                </div>
            </div>
            
            <div class="table-responsive-wrapper">
                <table style="width:100%; border-collapse:collapse; font-size:12px; text-align:left;">
                    <thead><tr style="border-bottom:1px solid #000;"><th style="width:5%; padding:8px;">Nº</th><th style="width:15%; padding:8px;">DATA</th><th style="width:12%; padding:8px;">HORÁRIO</th><th style="width:12%; padding:8px;">DURAÇÃO</th><th style="padding:8px;">CONTEÚDO / OBS</th><th style="width:5%; padding:8px;">OK</th></tr></thead>
                    <tbody>
                        ${plano.aulas.map((a,i)=>`
                        <tr>
                            <td style="text-align:center; padding:8px; border-bottom:1px solid #eee;">${a.num}</td>
                            <td style="padding:8px; border-bottom:1px solid #eee;"><input ${isReadOnly ? 'disabled' : ''} style="width:100%; border:none; border-bottom:1px dashed #ccc; text-align:center; background:transparent;" value="${App.escapeHTML(a.data)}" onchange="App.atualizarAula(${i},'data',this.value)"></td>
                            <td style="padding:8px; border-bottom:1px solid #eee;"><input ${isReadOnly ? 'disabled' : ''} style="width:100%; border:none; border-bottom:1px dashed #ccc; text-align:center; background:transparent;" value="${App.escapeHTML(a.hora)}" onchange="App.atualizarAula(${i},'hora',this.value)"></td>
                            <td style="padding:8px; border-bottom:1px solid #eee;"><input ${isReadOnly ? 'disabled' : ''} style="width:100%; border:none; border-bottom:1px dashed #ccc; text-align:center; background:transparent; font-weight:bold; color:#2980b9;" value="${App.escapeHTML(a.duracao)}" onchange="App.atualizarAula(${i},'duracao',this.value)"></td>
                            <td style="padding:8px; border-bottom:1px solid #eee;"><input ${isReadOnly ? 'disabled' : ''} style="width:100%; border:none; border-bottom:1px dashed #ccc; background:transparent;" placeholder="..." value="${App.escapeHTML(a.conteudo)}" onchange="App.atualizarAula(${i},'conteudo',this.value)"></td>
                            <td style="text-align:center; padding:8px; border-bottom:1px solid #eee;"><input type="checkbox" ${isReadOnly ? 'disabled' : ''} ${a.visto?'checked':''} onchange="App.atualizarAula(${i},'visto',this.checked)"></td>
                        </tr>`).join('')}
                        <tr style="background:#eee; font-weight:bold; border-top:2px solid #000;"><td colspan="3" style="text-align:right; padding:10px;">Carga Horária Total =</td><td style="text-align:center; padding:10px; color:#2980b9;">${totalHorasText}</td><td colspan="2"></td></tr>
                    </tbody>
                </table>
            </div>
        </div>`;
};

App.atualizarAula = (i,c,v) => { 
    if(App.planoAtual && App.planoAtual.aulas[i]) App.planoAtual.aulas[i][c]=v; 
    if(c === 'duracao') App.renderizarTelaEdicao(App.planoAtual);
};

App.salvarPlanejamentoBanco = async () => { 
    if(!App.planoAtual) return; 
    if (document.activeElement) document.activeElement.blur();

    const met = App.planoAtual.id ? 'PUT' : 'POST'; 
    const url = App.planoAtual.id ? `/planejamentos/${App.planoAtual.id}` : `/planejamentos`; 
    if(!App.planoAtual.id) App.planoAtual.id = Date.now().toString(); 
    
    if(!App.planoAtual.status) App.planoAtual.status = 'Ativo'; 
    
    const btn = document.querySelector('button[onclick="App.salvarPlanejamentoBanco()"]');
    const txtOrig = btn ? btn.innerText : '💾 SALVAR';
    if(btn) { btn.innerText = "A guardar e sincronizar... ⏳"; btn.disabled = true; }
    document.body.style.cursor = 'wait';

    try {
        // 1. Salva o planeamento normalmente na base de dados
        await App.api(url, met, App.planoAtual); 
        
        // 🚀 2. NOVA REGRA: Automação Inteligente de Frequências (Apenas Passado e Hoje)
        const chamadasExistentes = await App.api(`/chamadas?_t=${Date.now()}`);
        const chamadasDoAluno = chamadasExistentes.filter(c => c.idAluno === App.planoAtual.idAluno);
        
        const hojeStr = new Date().toISOString().split('T')[0];
        const promessasAutomacao = [];
        let chamadasCriadas = 0;

        // Analisa todas as datas que estão na grelha do planeamento
        App.planoAtual.aulas.forEach((aula, index) => {
            // Converte a data da aula de DD/MM/YYYY para YYYY-MM-DD para comparar com a trava
            const partesData = aula.data.split('/');
            if(partesData.length === 3) {
                const dataAulaISO = `${partesData[2]}-${partesData[1]}-${partesData[0]}`;
                
                // 🛡️ A BARREIRA: Só cria chamada automática se a aula for no Passado ou Hoje
                if (dataAulaISO <= hojeStr) {
                    
                    // Verifica se JÁ EXISTE uma chamada para este aluno neste dia exato
                    const jaExiste = chamadasDoAluno.find(c => c.data === dataAulaISO);
                    
                    if (!jaExiste) {
                        const payloadChamada = {
                            id: Date.now().toString() + Math.floor(Math.random()*1000) + index,
                            idAluno: App.planoAtual.idAluno,
                            nomeAluno: App.planoAtual.nomeAluno,
                            data: dataAulaISO,
                            status: 'Presença',
                            duracao: aula.duracao || '01:00'
                        };
                        promessasAutomacao.push(App.api('/chamadas', 'POST', payloadChamada));
                        chamadasCriadas++;
                    }
                }
            }
        });

        // Se encontrou chamadas do passado/hoje que ainda não estavam no sistema, envia todas de uma vez!
        if (promessasAutomacao.length > 0) {
            await Promise.all(promessasAutomacao);
        }

        // 3. Feedback visual dinâmico (mostra quantas presenças foram criadas sozinhas)
        if (chamadasCriadas > 0) {
            App.showToast(`Plano Salvo e ${chamadasCriadas} presença(s) lançada(s) automaticamente! 🎉`, "success"); 
        } else {
            App.showToast("Planeamento Salvo com sucesso!", "success"); 
        }
        
        App.renderizarPlanejamentosSalvos(); 
    } catch(e) { 
        App.showToast("Erro ao salvar.", "error"); 
        console.error(e);
    } 
    finally { 
        if(btn) { btn.innerText = txtOrig; btn.disabled = false; } 
        document.body.style.cursor = 'default'; 
    }
};

App.arquivarPlanejamento = (id) => {
    App.confirmar("Arquivar Planeamento", "Tem a certeza que deseja enviar este planeamento para o arquivo morto? Ele deixará de aparecer na sua lista principal.", "Sim, Arquivar", "#8e44ad", async () => {
        try {
            // Busca a lista segura e localiza o plano (evita bugs de API com query params)
            const planos = await App.api(`/planejamentos?_t=${Date.now()}`);
            const planoAtual = planos.find(p => String(p.id) === String(id));
            
            if (!planoAtual) return App.showToast("Planeamento não encontrado.", "error");

            // Atualiza o status
            planoAtual.status = 'Arquivado';
            
            // Salva a alteração de forma limpa na base de dados
            await App.api(`/planejamentos/${id}`, 'PUT', planoAtual);
            
            App.showToast("Planeamento Arquivado com sucesso!", "success");
            App.renderizarPlanejamentosSalvos(); // Remove da tela na hora
        } catch(e) { 
            App.showToast("Erro ao arquivar.", "error"); 
        }
    });
};

App.restaurarPlanejamento = (id) => {
    App.confirmar("Restaurar Planeamento", "Deseja reativar este planeamento e devolvê-lo para a lista ativa?", "Restaurar", "#27ae60", async () => {
        try {
            // Mesma lógica segura para restaurar
            const planos = await App.api(`/planejamentos?_t=${Date.now()}`);
            const planoAtual = planos.find(p => String(p.id) === String(id));
            
            if (!planoAtual) return App.showToast("Planeamento não encontrado.", "error");

            // Volta para ativo
            planoAtual.status = 'Ativo';
            
            // Salva a alteração
            await App.api(`/planejamentos/${id}`, 'PUT', planoAtual);
            
            App.showToast("Planeamento Reativado com sucesso!", "success");
            App.renderizarPlanejamentosArquivados(); // Remove do arquivo morto
        } catch(e) { 
            App.showToast("Erro ao reativar.", "error"); 
        }
    });
};

App.excluirPlanejamento = (id) => { 
    App.confirmar("Atenção!", "Deseja excluir DEFINITIVAMENTE este planeamento? Esta ação é irreversível.", "Excluir", "#e74c3c", async () => {
        await App.api(`/planejamentos/${id}`, 'DELETE'); App.renderizarPlanejamentosSalvos(); 
    });
};
App.excluirPlanejamentoArquivado = (id) => { 
    App.confirmar("Atenção!", "Deseja limpar este registo do arquivo morto para sempre?", "Excluir", "#e74c3c", async () => {
        await App.api(`/planejamentos/${id}`, 'DELETE'); App.renderizarPlanejamentosArquivados(); 
    });
};

App.processarAutoAjustePlano = (plano, chamadas) => {
    if (!plano || !plano.aulas || plano.aulas.length === 0) return plano;

    // 🚀 NOVA REGRA 2: A BARREIRA DO TEMPO
    // Descobre a data da 1ª aula do planeamento atual (converte DD/MM/YYYY para YYYY-MM-DD)
    const primeiraAulaArr = plano.aulas[0].data.split('/');
    const dataInicioPlano = `${primeiraAulaArr[2]}-${primeiraAulaArr[1]}-${primeiraAulaArr[0]}`;

    // Agora só puxa as presenças que aconteceram DEPOIS do início deste planeamento! (Adeus, fantasmas do passado!)
    const presencas = chamadas
        .filter(c => c.idAluno === plano.idAluno && (c.status === 'Presença' || c.status === 'Reposição') && c.data >= dataInicioPlano)
        .sort((a, b) => new Date(a.data) - new Date(b.data));

    let diasDaSemanaAulas = [];
    if (presencas.length > 0) {
        const ultimas = presencas.slice(-4);
        diasDaSemanaAulas = [...new Set(ultimas.map(p => { const [ano, mes, dia] = p.data.split('-'); const d = new Date(`${ano}-${mes}-${dia}T12:00:00`); return d.getDay(); }))];
    }

    if (diasDaSemanaAulas.length === 0) {
        diasDaSemanaAulas = [...new Set(plano.aulas.map(a => { const parts = a.data.split('/'); if (parts.length === 3) { const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T12:00:00`); return d.getDay(); } return -1; }).filter(d => d !== -1))];
    }
    
    if (diasDaSemanaAulas.length === 0) diasDaSemanaAulas = [1]; 

    let presencasUsadas = 0; let ultimaDataBase = new Date(); ultimaDataBase.setHours(12, 0, 0, 0);
    let ultimoHorarioBase = plano.aulas.length > 0 ? plano.aulas[0].hora : '08:00';

    for (let i = 0; i < plano.aulas.length; i++) {
        const aula = plano.aulas[i];
        if (aula.hora) ultimoHorarioBase = aula.hora;

        if (presencasUsadas < presencas.length) {
            const presencaDia = presencas[presencasUsadas]; const dataReal = presencaDia.data; const [ano, mes, dia] = dataReal.split('-');
            aula.data = `${dia}/${mes}/${ano}`;
            if(presencaDia.duracao) aula.duracao = presencaDia.duracao;
            aula.visto = true; ultimaDataBase = new Date(`${ano}-${mes}-${dia}T12:00:00`); presencasUsadas++;
        } else {
            aula.visto = false; ultimaDataBase.setDate(ultimaDataBase.getDate() + 1);
            while (!diasDaSemanaAulas.includes(ultimaDataBase.getDay())) { ultimaDataBase.setDate(ultimaDataBase.getDate() + 1); }
            const d = String(ultimaDataBase.getDate()).padStart(2, '0'); const m = String(ultimaDataBase.getMonth() + 1).padStart(2, '0'); const y = ultimaDataBase.getFullYear();
            aula.data = `${d}/${m}/${y}`;
        }
    }

    while (presencasUsadas < presencas.length) {
        const presencaDia = presencas[presencasUsadas]; const [ano, mes, dia] = presencaDia.data.split('-');
        plano.aulas.push({ num: plano.aulas.length + 1, data: `${dia}/${mes}/${ano}`, hora: ultimoHorarioBase, duracao: presencaDia.duracao || '01:00', conteudo: 'Aula Adicional (Auto-Ajuste)', visto: true });
        presencasUsadas++;
    }
    return plano;
};

App.sincronizarPlanejamentoComChamadasUI = async () => {
    if(!App.planoAtual || !App.planoAtual.idAluno) return;
    const btn = document.getElementById('btn-sync-plan');
    const txtOrig = btn.innerHTML; btn.innerHTML = "A analisar Padrões... ⏳"; btn.disabled = true; document.body.style.cursor = 'wait';
    try {
        const chamadas = await App.api(`/chamadas?_t=${Date.now()}`);
        App.planoAtual = App.processarAutoAjustePlano(App.planoAtual, chamadas);
        App.renderizarTelaEdicao(App.planoAtual);
        App.showToast("Datas, Tempos e Aulas Extra Sincronizados! 🎉", "success");
    } catch (e) { App.showToast("Erro ao sincronizar planeamento.", "error"); } 
    finally { if(btn) { btn.innerHTML = txtOrig; btn.disabled = false; } document.body.style.cursor = 'default'; }
};

// ---------------------------------------------------------
// 2. BOLETIM (CÁLCULO INTELIGENTE DE APROVAÇÃO E METAS)
// ---------------------------------------------------------
App.renderizarBoletimVisual = async () => {
    App.setTitulo("Boletim Escolar");
    const div = document.getElementById('app-content'); div.innerHTML = 'A carregar...';
    try {
        const alunos = await App.api('/alunos');
        const alunosAtivos = alunos.filter(a => !a.status || a.status === 'Ativo');
        const opAlunos = `<option value="">-- Selecione o Aluno --</option>` + alunosAtivos.map(a => `<option value="${a.id}">${App.escapeHTML(a.nome)}</option>`).join('');
        
        const formBoletim = `
            <div style="display:flex; gap:10px; align-items:center;">
                <select id="bol-aluno" style="flex:1; padding:12px; border:1px solid #ccc; border-radius:5px;">${opAlunos}</select>
                <button onclick="App.gerarBoletimTela()" style="background:#2c3e50; color:white; border:none; padding:12px 25px; border-radius:5px; font-weight:bold; cursor:pointer;">GERAR BOLETIM</button>
            </div>
        `;
        div.innerHTML = App.UI.card('📄 Emitir Boletim Escolar', '', formBoletim, '800px') + `<div id="boletim-area" style="margin-top:30px;"></div>`;
    } catch(e) { div.innerHTML = "Erro."; }
};

App.gerarBoletimTela = async () => {
    const idAluno = document.getElementById('bol-aluno').value; if(!idAluno) return App.showToast("Selecione um aluno.", "error");
    const divArea = document.getElementById('boletim-area'); divArea.innerHTML = '<p style="text-align:center;">A gerar boletim...</p>';
    const mediaConfig = parseFloat(localStorage.getItem(App.getTenantKey ? App.getTenantKey('media_aprovacao') : 'media_aprovacao')) || 6.0;

    try {
        const [aluno, avaliacoes, chamadas, escola, planejamentos] = await Promise.all([ App.api(`/alunos/${idAluno}`), App.api(`/avaliacoes?_t=${Date.now()}`), App.api(`/chamadas?_t=${Date.now()}`), App.api('/escola'), App.api(`/planejamentos?_t=${Date.now()}`) ]);
        
        const presencas = chamadas.filter(c => c.idAluno === idAluno && (c.status === 'Presença' || c.status === 'Reposição')).map(c => c.data).sort();
        const primAula = presencas.length > 0 ? presencas[0].split('-').reverse().join('/') : new Date().toLocaleDateString('pt-BR');
        
        let ultAula = '__/__/____';
        const planoAluno = planejamentos.find(p => p.idAluno === idAluno && p.status !== 'Arquivado');
        if (planoAluno && planoAluno.aulas && planoAluno.aulas.length > 0) { ultAula = App.escapeHTML(planoAluno.aulas[planoAluno.aulas.length - 1].data); } 
        else if (presencas.length > 0) { ultAula = presencas[presencas.length - 1].split('-').reverse().join('/'); }

        const notasAluno = avaliacoes.filter(n => n.idAluno === idAluno); 
        const disciplinasMap = {};
        
        notasAluno.forEach(n => { 
            const disc = n.disciplina || 'Geral'; 
            if(!disciplinasMap[disc]) disciplinasMap[disc] = { nome: disc, notas: [], total: 0, bimestres: new Set() }; 
            disciplinasMap[disc].notas.push(n); 
            disciplinasMap[disc].total += (parseFloat(n.nota) || 0); 
            if (n.bimestre) disciplinasMap[disc].bimestres.add(n.bimestre);
        });
        
        let linhasHTML = '';
        if(Object.keys(disciplinasMap).length === 0) {
            linhasHTML = '<tr><td colspan="4" style="text-align:center; padding:15px; color:#999;">Sem notas lançadas para este aluno.</td></tr>';
        } else {
            Object.keys(disciplinasMap).forEach(chave => {
                const d = disciplinasMap[chave];
                const qtdBimestresLancados = d.bimestres.size > 0 ? d.bimestres.size : 1;
                const metaAtual = mediaConfig * qtdBimestresLancados;
                
                const isAprovado = d.total >= metaAtual;
                const corStatus = isAprovado ? '#27ae60' : '#c0392b';
                
                const situacao = isAprovado ? `<span style="color:${corStatus}; font-weight:bold; font-size:14px;">APROVADO</span>` : `<span style="color:${corStatus}; font-weight:bold; font-size:14px;">RECUPERAÇÃO</span>`;
                const detalhe = d.notas.map(n => `<span style="font-size:11px;">${App.escapeHTML(n.bimestre)} - ${App.escapeHTML(n.tipo)}: <b>${App.escapeHTML(n.nota)}</b></span>`).join('<br>');
                
                linhasHTML += `
                <tr>
                    <td style="padding:10px; border-bottom:1px solid #eee; vertical-align:middle;"><b>${App.escapeHTML(d.nome)}</b></td>
                    <td style="padding:10px; border-bottom:1px solid #eee;">${detalhe}</td>
                    <td style="text-align:center; padding:10px; border-bottom:1px solid #eee; vertical-align:middle;"><span style="font-size:16px; font-weight:bold; color:${corStatus};">${d.total.toFixed(1)}</span></td>
                    <td style="text-align:center; padding:10px; border-bottom:1px solid #eee; vertical-align:middle;">${situacao}<br><span style="font-size:10px; color:#7f8c8d;">Meta p/ Aprovação: ${metaAtual.toFixed(1)} pts</span></td>
                </tr>`;
            });
        }

        const logo = escola.foto ? `<img src="${escola.foto}" style="height:60px; object-fit:contain;">` : '';
        const dataHoje = new Date().toLocaleDateString('pt-BR');

        divArea.innerHTML = `
            <div class="no-print" style="text-align:center; margin-bottom:20px;"><button onclick="window.print()" class="btn-primary">🖨️ IMPRIMIR BOLETIM</button></div>
            <div class="print-sheet" style="background: white; max-width: 210mm; margin: 0 auto; padding: 40px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-radius: 8px;">
                <div class="doc-header" style="display:flex; justify-content:space-between; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:20px;">
                    <div style="display:flex; align-items:center; gap:20px;">${logo}<div><h2 style="margin:0; text-transform:uppercase;">${App.escapeHTML(escola.nome || 'INSTITUIÇÃO')}</h2><div style="font-size:12px;">CNPJ: ${App.escapeHTML(escola.cnpj || '')}</div></div></div>
                    <div style="text-align:right;"><div><b>BOLETIM ESCOLAR</b></div><div style="font-size:10px; color:#999;">Emissão: ${dataHoje}</div></div>
                </div>
                <div style="padding:15px; background:#fafafa; border:1px solid #000; margin-bottom:15px;">
                    <div style="font-weight:bold; font-size:16px; margin-bottom:5px;">ALUNO: ${App.escapeHTML(aluno.nome).toUpperCase()}</div>
                    <div style="font-size:13px; margin-bottom:10px;"><b>CURSO:</b> ${App.escapeHTML(aluno.curso || '-')} &nbsp;&nbsp;|&nbsp;&nbsp; <b>TURMA:</b> ${App.escapeHTML(aluno.turma || '-')}</div>
                    <div style="display:flex; justify-content:space-between; border-top:1px solid #ccc; padding-top:5px; font-size:12px;"><div>INÍCIO DAS AULAS: <b>${primAula}</b></div><div>PREVISÃO DE TÉRMINO: <b>${ultAula}</b></div></div>
                </div>
                <div class="table-responsive-wrapper">
                    <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left;">
                        <thead><tr style="border-bottom:2px solid #000;"><th style="padding:10px; width:30%;">DISCIPLINA</th><th style="padding:10px; width:30%;">AVALIAÇÕES (BIMESTRE)</th><th style="text-align:center; padding:10px; width:15%;">NOTA TOTAL</th><th style="text-align:center; padding:10px; width:25%;">RESULTADO</th></tr></thead>
                        <tbody>${linhasHTML}</tbody>
                    </table>
                </div>
                <div style="padding:40px 30px 10px 30px; text-align:center;"><div style="width:300px; margin:0 auto; border-top:1px solid #333; padding-top:5px; font-size:12px;">Coordenação Pedagógica</div></div>
            </div>`;
    } catch(e) { App.showToast("Erro ao gerar boletim.", "error"); }
};

// ---------------------------------------------------------
// 3. AVALIAÇÕES E NOTAS (HÍBRIDO COM CONFIG. DE MÉDIA)
// ---------------------------------------------------------
App.salvarMediaConfig = (val) => { 
    localStorage.setItem(App.getTenantKey ? App.getTenantKey('media_aprovacao') : 'media_aprovacao', val); 
    App.showToast("Média atualizada!", "info"); App.renderizarAvaliacoesPro();
};

App.renderizarAvaliacoesPro = async () => {
    App.setTitulo("Avaliações e Notas");
    const div = document.getElementById('app-content');
    div.innerHTML = '<p style="text-align:center; padding:20px; color:#666;">A carregar dados...</p>';
    
    const mediaSalva = localStorage.getItem(App.getTenantKey ? App.getTenantKey('media_aprovacao') : 'media_aprovacao') || '6.0';
    const percentualAprovacao = parseFloat(mediaSalva) / 10;

    try {
        const [alunos, turmas, cursos, avaliacoes] = await Promise.all([App.api('/alunos'), App.api('/turmas'), App.api('/cursos'), App.api(`/avaliacoes?_t=${Date.now()}`)]);
        App.cacheAlunos = alunos;
        const historico = avaliacoes.sort((a,b) => b.id - a.id);
        const alunosAtivos = alunos.filter(a => !a.status || a.status === 'Ativo');

        const opTurmas = `<option value="">-- Turma Completa --</option>` + turmas.map(t => `<option value="${App.escapeHTML(t.nome)}">${App.escapeHTML(t.nome)}</option>`).join('');
        const opAlunos = `<option value="">-- Aluno Específico --</option>` + alunosAtivos.map(a => `<option value="${a.id}">${App.escapeHTML(a.nome)}</option>`).join('');
        const opCursos = `<option value="Geral">Geral / Curso Padrão</option>` + cursos.map(c => `<option value="${App.escapeHTML(c.nome)}">${App.escapeHTML(c.nome)}</option>`).join('');
        
        const opTipos = `<option value="Teste">Teste</option><option value="Prova">Prova</option><option value="Pesquisa">Pesquisa</option><option value="Trabalho">Trabalho</option><option value="Outro">Outro (Especificar)</option>`;
        const opBimestres = `<option value="1º Bimestre">1º Bimestre</option><option value="2º Bimestre">2º Bimestre</option><option value="3º Bimestre">3º Bimestre</option><option value="4º Bimestre">4º Bimestre</option>`;
        const hoje = new Date().toISOString().split('T')[0];

        const formFiltros = `
            <div style="display:flex; gap:15px; flex-wrap:wrap; align-items:flex-end; margin-bottom:15px; background:#f9f9f9; padding:15px; border-radius:8px; border:1px solid #eee;">
                ${selectLocal('Filtrar por Turma:', 'nota-turma', opTurmas)}
                <span style="padding-bottom:10px; font-weight:bold; color:#999; text-transform:uppercase; font-size:12px;">Ou</span>
                ${selectLocal('Buscar Aluno Único:', 'nota-aluno', opAlunos)}
            </div>
            <div style="display:flex; gap:15px; flex-wrap:wrap; align-items:flex-end; margin-bottom:15px;">
                ${selectLocal('Disciplina/Curso:', 'nota-disc', opCursos)}
                ${selectLocal('Tipo de Avaliação:', 'nota-tipo', opTipos, 'onchange="App.toggleTipoOutroNota()"')}
                <div id="div-outro-nota" style="flex: 1; min-width: 150px; display:none;">
                    <label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">Especifique:</label>
                    <input type="text" id="nota-outro-desc" placeholder="Ex: Seminário" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">
                </div>
                ${selectLocal('Bimestre:', 'nota-bimestre', opBimestres)}
            </div>
            <div style="display:flex; gap:15px; flex-wrap:wrap; align-items:flex-end;">
                ${col('Média Mín. (Aprovação):', 'nota-media', 'number', mediaSalva, 'step="0.1" onchange="App.salvarMediaConfig(this.value)"')}
                ${col('Valor Máximo (Pts):', 'nota-max', 'number', '10', 'step="0.1"')}
                ${col('Data da Avaliação:', 'nota-data', 'date', hoje, `max="${hoje}"`)}
                <button onclick="App.carregarListaNotas()" class="btn-primary" style="height:41px; padding:0 20px;">📋 ABRIR PAUTA</button>
                <button onclick="App.cancelarEdicaoNota()" id="btn-cancel-nota" style="height:41px; padding:0 20px; background:#95a5a6; color:white; border:none; border-radius:5px; display:none; cursor:pointer;">❌ Cancelar Edição</button>
            </div>
        `;

        const tabelaHistorico = `
            <div style="background: #fff; padding: 10px 15px; border-radius: 8px; border: 1px solid #eee; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <span style="font-size: 18px; color: #aaa;">🔍</span>
                <input type="text" id="input-busca-notas" placeholder="Pesquisar histórico..." oninput="App.filtrarTabela('input-busca-notas', 'tabela-historico-notas')" style="flex: 1; border: none; outline: none; font-size: 14px; padding: 5px; background: transparent; width: 100%;">
            </div>
            <div class="table-responsive-wrapper">
                <table id="tabela-historico-notas" style="width:100%; border-collapse:collapse; font-size:13px;">
                    <thead>
                        <tr style="background:#f4f6f7; color:#7f8c8d; text-align:left; text-transform:uppercase; font-size:11px;">
                            <th style="padding:12px;">Aluno</th><th style="padding:12px;">Curso/Disc.</th><th style="padding:12px;">Data</th><th style="padding:12px;">Avaliação</th><th style="padding:12px;">Bimestre</th><th style="padding:12px; text-align:center;">Nota / Valor</th><th style="padding:12px; text-align:right;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${historico.length === 0 ? '<tr><td colspan="7" style="padding:20px; text-align:center; color:#999;">Nenhuma nota lançada.</td></tr>' : ''}
                        ${historico.map(h => `
                            <tr style="border-bottom:1px solid #eee;">
                                <td style="padding:12px; font-weight:bold;">${App.escapeHTML(h.nomeAluno)}</td>
                                <td style="padding:12px; color:#555;">${App.escapeHTML(h.disciplina || '-')}</td>
                                <td style="padding:12px;">${h.data ? App.escapeHTML(h.data.split('-').reverse().join('/')) : '-'}</td>
                                <td style="padding:12px;">${App.escapeHTML(h.tipo)}</td>
                                <td style="padding:12px;">${App.escapeHTML(h.bimestre)}</td>
                                <td style="padding:12px; text-align:center;"><strong style="color:${parseFloat(h.nota) >= parseFloat(h.valorMax) * percentualAprovacao ? '#27ae60' : '#c0392b'}">${App.escapeHTML(h.nota)}</strong> <span style="color:#999; font-size:11px;">/ ${App.escapeHTML(h.valorMax)}</span></td>
                                <td style="padding:12px; text-align:right;">
                                    <button onclick="App.editarAvaliacao('${h.id}')" style="background:#f39c12; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer; margin-right:5px;" title="Editar">✏️</button>
                                    <button onclick="App.excluirAvaliacao('${h.id}')" style="background:#e74c3c; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer;" title="Excluir">🗑️</button>
                                </td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        `;

        div.innerHTML = App.UI.card('📝 Lançamento de Notas', '', formFiltros, '100%') + `<div id="area-lista-notas" style="margin-top:20px;"></div>` + '<div style="margin-top:20px;">' + App.UI.card('Histórico de Notas Lançadas', '', tabelaHistorico, '100%') + '</div>';
    } catch(e) { div.innerHTML="Erro ao carregar avaliações."; }
};

App.toggleTipoOutroNota = () => { const tipo = document.getElementById('nota-tipo').value; document.getElementById('div-outro-nota').style.display = (tipo==='Outro')?'block':'none'; };

App.editarAvaliacao = async (id) => { 
    const n = await App.api(`/avaliacoes/${id}?_t=${Date.now()}`); 
    document.getElementById('nota-aluno').value = n.idAluno; document.getElementById('nota-turma').value = "";
    document.getElementById('nota-disc').value = n.disciplina || 'Geral';
    if(["Teste","Prova","Pesquisa","Trabalho"].includes(n.tipo)) { document.getElementById('nota-tipo').value=n.tipo; document.getElementById('div-outro-nota').style.display='none'; } 
    else { document.getElementById('nota-tipo').value='Outro'; App.toggleTipoOutroNota(); document.getElementById('nota-outro-desc').value=n.tipo; } 
    document.getElementById('nota-max').value = n.valorMax; document.getElementById('nota-bimestre').value = n.bimestre; document.getElementById('nota-data').value = n.data || new Date().toISOString().split('T')[0];
    
    document.getElementById('btn-cancel-nota').style.display = 'inline-block';
    App.idAvaliacaoEditando = id; 
    App.carregarListaNotas(); 
    document.querySelector('.card').scrollIntoView({behavior:'smooth'}); 
};

App.cancelarEdicaoNota = () => {
    App.idAvaliacaoEditando = null;
    document.getElementById('nota-aluno').value = "";
    document.getElementById('btn-cancel-nota').style.display = 'none';
    document.getElementById('area-lista-notas').innerHTML = "";
    App.showToast("Modo de edição cancelado.", "info");
};

App.carregarListaNotas = async () => {
    const turma = document.getElementById('nota-turma').value;
    const idAluno = document.getElementById('nota-aluno').value;
    const disc = document.getElementById('nota-disc').value;
    let tipo = document.getElementById('nota-tipo').value;
    if(tipo === 'Outro') tipo = document.getElementById('nota-outro-desc').value || 'Outro';
    const data = document.getElementById('nota-data').value;
    const max = document.getElementById('nota-max').value;

    if(!turma && !idAluno) return App.showToast("Selecione uma Turma OU um Aluno específico.", "warning");
    if(!disc || !data) return App.showToast("Preencha Disciplina e Data.", "warning");
    // 🛡️ TRAVA ANTI-FUTURO
    const hojeStr = new Date().toISOString().split('T')[0];
    if (data > hojeStr) {
        return App.showToast("Não é permitido abrir pautas para datas futuras.", "warning");
    }    

    const area = document.getElementById('area-lista-notas');
    area.innerHTML = '<p style="text-align:center; padding:20px;">A preparar pauta de lançamento... ⏳</p>';

    try {
        const [alunos, avaliacoes] = await Promise.all([App.api('/alunos'), App.api(`/avaliacoes?_t=${Date.now()}`)]);
        
        let alunosAlvo = [];
        if (idAluno) { alunosAlvo = alunos.filter(a => a.id === idAluno); } else { alunosAlvo = alunos.filter(a => a.turma === turma); }
        alunosAlvo = alunosAlvo.filter(a => !a.status || a.status === 'Ativo');
        
        if(alunosAlvo.length === 0) { area.innerHTML = '<div class="card"><p style="text-align:center; color:#999; margin:0;">Nenhum aluno ativo encontrado para este filtro.</p></div>'; return; }

        let linhas = '';
        alunosAlvo.forEach(a => {
            let regExistente = null;
            if (App.idAvaliacaoEditando && a.id === document.getElementById('nota-aluno').value) {
                regExistente = avaliacoes.find(av => av.id === App.idAvaliacaoEditando);
            } else {
                regExistente = avaliacoes.find(av => av.idAluno === a.id && av.data === data && av.disciplina === disc && av.tipo === tipo);
            }

            const notaAtual = regExistente ? regExistente.nota : '';
            const idEdicaoTag = (App.idAvaliacaoEditando && regExistente) ? `data-id-avaliacao="${regExistente.id}"` : '';

            linhas += `
            <tr style="border-bottom:1px solid #eee;" class="linha-nota" data-id="${a.id}" data-nome="${App.escapeHTML(a.nome)}" ${idEdicaoTag}>
                <td style="padding:12px; font-weight:500;">${App.escapeHTML(a.nome)}</td>
                <td style="padding:12px; width:150px;">
                    <input type="number" class="valor-nota" style="width:100%; padding:8px; border-radius:5px; border:1px solid #ccc; text-align:center; font-weight:bold; color:var(--accent);" step="0.1" max="${max}" placeholder="0.0" value="${App.escapeHTML(notaAtual)}">
                </td>
            </tr>`;
        });

        let alertaEdicao = App.idAvaliacaoEditando ? `<div style="background:#f39c12; color:#fff; padding:10px; text-align:center; font-weight:bold; margin-bottom:10px; border-radius:5px; animation: pop 0.3s;">⚠️ MODO DE EDIÇÃO ATIVO</div>` : '';

        area.innerHTML = alertaEdicao + `
            <div class="card" style="padding:0; overflow:hidden; border:2px solid #2980b9;">
                <div style="padding:15px; background:#e8f4f8; border-bottom:1px solid #d1e8f0; font-size:13px; color:#2980b9; display:flex; justify-content:space-between; align-items:center;">
                    <span><b>Lançamento:</b> ${App.escapeHTML(tipo)} de ${App.escapeHTML(disc)}</span>
                    <span style="background:#2980b9; color:white; padding:4px 10px; border-radius:12px; font-weight:bold;">Máx: ${App.escapeHTML(max)} pts</span>
                </div>
                <div class="table-responsive-wrapper" style="margin:0; border:none;">
                    <table style="width:100%; border-collapse:collapse; min-width:400px;">
                        <thead style="background:#f8f9fa;"><tr><th style="padding:15px; text-align:left;">ALUNO</th><th style="padding:15px; text-align:center;">NOTA OBTIDA</th></tr></thead>
                        <tbody>${linhas}</tbody>
                    </table>
                </div>
                <div style="padding:20px; background:#f9f9f9; border-top:1px solid #eee; text-align:right;">
                    <button onclick="App.salvarNotasLote()" class="btn-primary">💾 SALVAR NOTAS NO BOLETIM</button>
                </div>
            </div>
        `;
    } catch(e) { area.innerHTML = '<p style="color:red; text-align:center;">Erro ao carregar a pauta.</p>'; }
};

App.salvarNotasLote = async () => {
    const disc = document.getElementById('nota-disc').value;
    let tipo = document.getElementById('nota-tipo').value;
    if(tipo === 'Outro') tipo = document.getElementById('nota-outro-desc').value || 'Outro';
    const data = document.getElementById('nota-data').value;
    const max = document.getElementById('nota-max').value;
    const bimestre = document.getElementById('nota-bimestre').value;
    const linhas = document.querySelectorAll('.linha-nota');
    if(linhas.length === 0) return;
    // 🛡️ TRAVA ANTI-FUTURO
    const hojeStr = new Date().toISOString().split('T')[0];
    if (data > hojeStr) {
        return App.showToast("Bloqueado: Não é possível gravar notas com datas futuras.", "error");
    }

    const btn = document.querySelector('button[onclick="App.salvarNotasLote()"]');
    const txt = btn.innerText; btn.innerText = "A arquivar... ⏳"; btn.disabled = true; document.body.style.cursor = 'wait';

    try {
        const promessas = [];
        const avaliacoesExistentes = await App.api(`/avaliacoes?_t=${Date.now()}`);

        linhas.forEach(linha => {
            const idAluno = linha.getAttribute('data-id'); const nomeAluno = linha.getAttribute('data-nome');
            const idEdicao = linha.getAttribute('data-id-avaliacao');
            const notaInput = linha.querySelector('.valor-nota').value;
            if (notaInput === '') return; 

            let regExistente = null;
            if (idEdicao) { regExistente = avaliacoesExistentes.find(av => av.id === idEdicao); } 
            else { regExistente = avaliacoesExistentes.find(av => av.idAluno === idAluno && av.data === data && av.disciplina === disc && av.tipo === tipo); }

            const payload = { idAluno, nomeAluno, disciplina: disc, tipo, data, valorMax: max, nota: notaInput, bimestre, dataLancamento: new Date().toISOString().split('T')[0] };

            if (regExistente) { 
                promessas.push(App.api(`/avaliacoes/${regExistente.id}`, 'PUT', { ...regExistente, nota: notaInput, valorMax: max, data: data, disciplina: disc, tipo: tipo, bimestre: bimestre })); 
            } else { 
                payload.id = Date.now().toString() + Math.floor(Math.random()*1000); 
                promessas.push(App.api('/avaliacoes', 'POST', payload)); 
            }
        });

        await Promise.all(promessas);
        App.showToast("Pauta de notas arquivada com sucesso!", "success");
        App.cancelarEdicaoNota(); 
        App.renderizarAvaliacoesPro(); 
    } catch(e) { App.showToast("Erro ao salvar as notas.", "error"); }
    finally { if(btn){btn.innerText = txt; btn.disabled = false;} document.body.style.cursor = 'default'; }
};

App.excluirAvaliacao = (id) => { 
    App.confirmar("Excluir Nota", "Deseja mesmo excluir esta avaliação? Isto irá afetar o boletim do aluno.", "Excluir", "#e74c3c", async () => {
        await App.api(`/avaliacoes/${id}`, 'DELETE'); App.renderizarAvaliacoesPro(); 
    });
};

// ---------------------------------------------------------
// 4. CHAMADA HÍBRIDA + AUTO-AJUSTE PREDITIVO EM MASSA
// ---------------------------------------------------------
App.renderizarChamadaPro = async () => { 
    App.setTitulo("Controlo de Presença");
    const div = document.getElementById('app-content'); 
    div.innerHTML = '<p style="text-align:center; padding:20px; color:#666;">A carregar dados...</p>';
    try { 
        const [alunos, turmas, chamadas] = await Promise.all([App.api('/alunos'), App.api('/turmas'), App.api(`/chamadas?_t=${Date.now()}`)]); 
        const historico = Array.isArray(chamadas) ? chamadas.sort((a,b) => new Date(b.data) - new Date(a.data)) : []; 
        const alunosAtivos = alunos.filter(a => !a.status || a.status === 'Ativo');

        const opTurmas = `<option value="">-- Turma Completa --</option>` + turmas.map(t => `<option value="${App.escapeHTML(t.nome)}">${App.escapeHTML(t.nome)}</option>`).join('');
        const opAlunos = `<option value="">-- Aluno Específico --</option>` + alunosAtivos.map(a => `<option value="${a.id}">${App.escapeHTML(a.nome)}</option>`).join('');
        const hoje = new Date().toISOString().split('T')[0];

        const formChamada = `
            <div style="display:flex; gap:15px; flex-wrap:wrap; align-items:flex-end; margin-bottom:15px; background:#f9f9f9; padding:15px; border-radius:8px; border:1px solid #eee;">
                ${selectLocal('Filtrar por Turma:', 'chamada-turma', opTurmas)}
                <span style="padding-bottom:10px; font-weight:bold; color:#999; text-transform:uppercase; font-size:12px;">Ou</span>
                ${selectLocal('Buscar Aluno Único:', 'chamada-aluno', opAlunos)}
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-end;">
                ${col('Data da Aula:', 'chamada-data', 'date', hoje, `max="${hoje}"`)}
                ${col('Duração (Ex: 01:30):', 'chamada-duracao', 'time', '01:00')}
                <button onclick="App.carregarListaChamada()" class="btn-primary" style="height:41px; padding:0 20px;">📋 ABRIR CHAMADA</button>
                <button onclick="App.cancelarEdicaoChamada()" id="btn-cancel-chamada" style="height:41px; padding:0 20px; background:#95a5a6; color:white; border:none; border-radius:5px; display:none; cursor:pointer;">❌ Cancelar Edição</button>
            </div>
        `;

        const tabelaChamada = `
            <div style="background: #fff; padding: 10px 15px; border-radius: 8px; border: 1px solid #eee; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <span style="font-size: 18px; color: #aaa;">🔍</span>
                <input type="text" id="input-busca-chamada" placeholder="Pesquisar histórico..." oninput="App.filtrarTabela('input-busca-chamada', 'tabela-historico-chamadas')" style="flex: 1; border: none; outline: none; font-size: 14px; padding: 5px; background: transparent; width: 100%;">
            </div>
            <div class="table-responsive-wrapper">
                <table id="tabela-historico-chamadas" style="width:100%; border-collapse:collapse; font-size:13px;">
                    <thead>
                        <tr style="background:#f4f6f7; color:#7f8c8d; text-align:left; text-transform:uppercase; font-size:11px;">
                            <th style="padding:12px; border-bottom:2px solid #eee;">Data</th><th style="padding:12px; border-bottom:2px solid #eee;">Aluno</th><th style="padding:12px; border-bottom:2px solid #eee;">Status</th><th style="padding:12px; border-bottom:2px solid #eee;">Tempo</th><th style="padding:12px; border-bottom:2px solid #eee; text-align:right;">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${historico.length === 0 ? '<tr><td colspan="5" style="padding:20px; text-align:center; color:#999;">Nenhum registo encontrado.</td></tr>' : ''}
                        ${historico.map(h => { 
                            let color = '#333'; if(h.status === 'Presença') color = 'green'; else if(h.status === 'Falta') color = 'red'; else if(h.status === 'Reposição') color = '#2980b9'; 
                            return `<tr style="border-bottom:1px solid #eee;"><td style="padding:12px; color:#555;">${h.data.split('-').reverse().join('/')}</td><td style="padding:12px; font-weight:bold;">${App.escapeHTML(h.nomeAluno)}</td><td style="padding:12px; font-weight:bold; color:${color};">${App.escapeHTML(h.status)}</td><td style="padding:12px; color:#555;">${App.escapeHTML(h.duracao)}</td><td style="padding:12px; text-align:right;"><button onclick="App.editarLancamentoChamada('${h.id}')" style="background:none; border:none; cursor:pointer; font-size:16px; margin-right:5px;" title="Editar">✏️</button><button onclick="App.excluirLancamentoChamada('${h.id}')" style="background:none; border:none; cursor:pointer; font-size:16px; color:#999;" title="Excluir">🗑️</button></td></tr>`; 
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

        div.innerHTML = App.UI.card('📝 Registo de Frequência', '', formChamada, '100%') + `<div id="area-lista-chamada" style="margin-top:20px;"></div>` + '<div style="margin-top:20px;">' + App.UI.card('Histórico Completo de Lançamentos', '', tabelaChamada, '100%') + '</div>';
    } catch(e) { div.innerHTML = "Erro ao carregar módulo de chamada."; } 
};

App.editarLancamentoChamada = async (id) => { 
    const registro = await App.api(`/chamadas/${id}?_t=${Date.now()}`); 
    document.getElementById('chamada-aluno').value = registro.idAluno; 
    document.getElementById('chamada-turma').value = "";
    document.getElementById('chamada-data').value = registro.data; 
    document.getElementById('chamada-duracao').value = registro.duracao; 
    
    document.getElementById('btn-cancel-chamada').style.display = 'inline-block';
    App.idChamadaEditando = id; 
    App.carregarListaChamada(); 
    document.querySelector('.card').scrollIntoView({ behavior: 'smooth' }); 
};

App.cancelarEdicaoChamada = () => {
    App.idChamadaEditando = null;
    document.getElementById('chamada-aluno').value = "";
    document.getElementById('btn-cancel-chamada').style.display = 'none';
    document.getElementById('area-lista-chamada').innerHTML = "";
    App.showToast("Modo de edição cancelado.", "info");
};

App.carregarListaChamada = async () => {
    const turma = document.getElementById('chamada-turma').value;
    const idAluno = document.getElementById('chamada-aluno').value;
    const data = document.getElementById('chamada-data').value;
    
    if(!turma && !idAluno) return App.showToast("Selecione uma Turma OU um Aluno específico.", "warning");
    if(!data) return App.showToast("Preencha a Data da aula.", "warning");
    // 🛡️ TRAVA ANTI-FUTURO
    const hojeStr = new Date().toISOString().split('T')[0];
    if (data > hojeStr) {
        return App.showToast("Não é permitido abrir grelhas de frequência para datas futuras.", "warning");
    }

    const area = document.getElementById('area-lista-chamada');
    area.innerHTML = '<p style="text-align:center; padding:20px;">A preparar diário de classe... ⏳</p>';

    try {
        const [alunos, chamadas] = await Promise.all([App.api('/alunos'), App.api(`/chamadas?_t=${Date.now()}`)]);
        
        let alunosAlvo = [];
        if (idAluno) { alunosAlvo = alunos.filter(a => a.id === idAluno); } else { alunosAlvo = alunos.filter(a => a.turma === turma); }
        alunosAlvo = alunosAlvo.filter(a => !a.status || a.status === 'Ativo');

        if(alunosAlvo.length === 0) { area.innerHTML = '<div class="card"><p style="text-align:center; color:#999; margin:0;">Nenhum aluno ativo encontrado para este filtro.</p></div>'; return; }

        const chamadasDia = chamadas.filter(c => c.data === data);
        let linhas = '';
        
        alunosAlvo.forEach(a => {
            let regExistente = null;
            if (App.idChamadaEditando && a.id === document.getElementById('chamada-aluno').value) {
                regExistente = chamadas.find(c => c.id === App.idChamadaEditando);
            } else {
                regExistente = chamadasDia.find(c => c.idAluno === a.id);
            }

            const status = regExistente ? regExistente.status : 'Presença';
            const idEdicaoTag = (App.idChamadaEditando && regExistente) ? `data-id-chamada="${regExistente.id}"` : '';
            
            linhas += `
            <tr style="border-bottom:1px solid #eee;" class="linha-chamada" data-id="${a.id}" data-nome="${App.escapeHTML(a.nome)}" ${idEdicaoTag}>
                <td style="padding:12px; font-weight:500;">${App.escapeHTML(a.nome)}</td>
                <td style="padding:12px; width:250px;">
                    <select class="status-chamada" style="width:100%; padding:8px; border-radius:5px; border:1px solid #ccc; font-weight:bold; color:${status==='Falta'?'#e74c3c':'#27ae60'};" onchange="this.style.color = this.value==='Falta'?'#e74c3c': (this.value==='Reposição'?'#f39c12':'#27ae60')">
                        <option value="Presença" ${status==='Presença'?'selected':''}>✅ Presença</option>
                        <option value="Falta" ${status==='Falta'?'selected':''}>❌ Falta</option>
                        <option value="Reposição" ${status==='Reposição'?'selected':''}>🔄 Reposição</option>
                        <option value="Falta Justificada" ${status==='Falta Justificada'?'selected':''}>⚠️ Falta Justificada</option>
                        <option value="Feriado" ${status==='Feriado'?'selected':''}>📅 Feriado</option>
                        <option value="Recesso" ${status==='Recesso'?'selected':''}>🏖️ Recesso</option>
                    </select>
                </td>
            </tr>`;
        });
        
        let alertaEdicao = App.idChamadaEditando ? `<div style="background:#f39c12; color:#fff; padding:10px; text-align:center; font-weight:bold; margin-bottom:10px; border-radius:5px; animation: pop 0.3s;">⚠️ MODO DE EDIÇÃO ATIVO (A atualizar o registo existente)</div>` : '';

        area.innerHTML = alertaEdicao + `
            <div class="card" style="padding:0; overflow:hidden; border:2px solid #27ae60;">
                <div style="padding:15px; background:#eafaf1; border-bottom:1px solid #d5f5e3; font-size:13px; color:#27ae60; font-weight:bold;">
                    Grelha de Frequência - ${App.escapeHTML(data.split('-').reverse().join('/'))}
                </div>
                <div class="table-responsive-wrapper" style="margin:0; border:none;">
                    <table style="width:100%; border-collapse:collapse; min-width:400px;">
                        <thead style="background:#f8f9fa;"><tr><th style="padding:15px; text-align:left;">NOME DO ALUNO</th><th style="padding:15px; text-align:left;">STATUS DA AULA</th></tr></thead>
                        <tbody>${linhas}</tbody>
                    </table>
                </div>
                <div style="padding:20px; background:#f9f9f9; border-top:1px solid #eee; text-align:right;">
                    <button onclick="App.salvarChamadaLote()" class="btn-primary" style="background:#27ae60; border-color:#27ae60;">💾 SALVAR FREQUÊNCIA</button>
                </div>
            </div>
        `;
    } catch(e) { area.innerHTML = '<p style="color:red; text-align:center;">Erro ao carregar a lista.</p>'; }
};

App.salvarChamadaLote = async () => {
    const data = document.getElementById('chamada-data').value;
    const duracao = document.getElementById('chamada-duracao').value || '01:00';
    const linhas = document.querySelectorAll('.linha-chamada');
    if(linhas.length === 0) return;

    // 🛡️ TRAVA ANTI-FUTURO
    const hojeStr = new Date().toISOString().split('T')[0];
    if (data > hojeStr) {
        return App.showToast("Bloqueado: Não é possível registar frequência em datas futuras.", "error");
    }

    const btn = document.querySelector('button[onclick="App.salvarChamadaLote()"]');
    const txt = btn.innerText; btn.innerText = "A validar dados... ⏳"; btn.disabled = true; document.body.style.cursor = 'wait';

    try {
        // 🚀 NOVA REGRA 1: VERIFICAR PLANEAMENTO ATIVO ANTES DE GRAVAR
        const planejamentos = await App.api(`/planejamentos?_t=${Date.now()}`);
        const alunosSemPlano = [];

        linhas.forEach(linha => {
            const idAluno = linha.getAttribute('data-id');
            const nomeAluno = linha.getAttribute('data-nome');
            
            // Verifica se o aluno tem pelo menos um planeamento que NÃO esteja arquivado
            const temPlanoAtivo = planejamentos.some(p => p.idAluno === idAluno && p.status !== 'Arquivado');
            if (!temPlanoAtivo) {
                alunosSemPlano.push(nomeAluno);
            }
        });

        // Se encontrou alunos sem planeamento, ABORTA o salvamento!
        if (alunosSemPlano.length > 0) {
            App.showToast(`Bloqueado: Crie um Planeamento para: ${alunosSemPlano.join(', ')}`, "error");
            if(btn){btn.innerText = txt; btn.disabled = false;} document.body.style.cursor = 'default';
            return; 
        }

        const promessasChamadas = [];
        const chamadasExistentes = await App.api(`/chamadas?_t=${Date.now()}`);
        const alunosAfetados = [];

        linhas.forEach(linha => {
            const idAluno = linha.getAttribute('data-id'); const nomeAluno = linha.getAttribute('data-nome');
            const status = linha.querySelector('.status-chamada').value;
            const idEdicao = linha.getAttribute('data-id-chamada'); 
            
            alunosAfetados.push(idAluno); 

            let regExistente = null;
            if (idEdicao) { regExistente = chamadasExistentes.find(c => c.id === idEdicao); } 
            else { regExistente = chamadasExistentes.find(c => c.idAluno === idAluno && c.data === data); }

            const payload = { idAluno, nomeAluno, data, status, duracao };

            if (regExistente) { 
                promessasChamadas.push(App.api(`/chamadas/${regExistente.id}`, 'PUT', { ...regExistente, data: data, status: status, duracao: duracao })); 
            } else { 
                payload.id = Date.now().toString() + Math.floor(Math.random()*1000); 
                promessasChamadas.push(App.api('/chamadas', 'POST', payload)); 
            }
        });

        await Promise.all(promessasChamadas);
        
        let avisoExtra = "";
        try {
            const [planejamentosAjuste, chamadasAtualizadas] = await Promise.all([App.api(`/planejamentos?_t=${Date.now()}`), App.api(`/chamadas?_t=${Date.now()}`)]);
            const promessasPlano = [];

            alunosAfetados.forEach(idAluno => {
                let planoDoAluno = planejamentosAjuste.find(p => p.idAluno === idAluno && p.status !== 'Arquivado');
                if (planoDoAluno && typeof App.processarAutoAjustePlano === 'function') {
                    planoDoAluno = App.processarAutoAjustePlano(planoDoAluno, chamadasAtualizadas);
                    promessasPlano.push(App.api(`/planejamentos/${planoDoAluno.id}`, 'PUT', planoDoAluno));
                }
            });

            if (promessasPlano.length > 0) { await Promise.all(promessasPlano); avisoExtra = " e Planeamento(s) Auto-Ajustado(s)!"; }
        } catch (erroPlano) { console.log("Aviso: Falha no auto-ajuste de fundo.", erroPlano); }

        App.showToast(`Frequência registada${avisoExtra}`, "success");
        App.cancelarEdicaoChamada(); 
        App.renderizarChamadaPro(); 
    } catch(e) { App.showToast("Erro ao guardar a chamada.", "error"); }
    finally { if(btn){btn.innerText = txt; btn.disabled = false;} document.body.style.cursor = 'default'; }
};

App.excluirLancamentoChamada = (id) => { 
    App.confirmar("Excluir Frequência", "Tem a certeza que deseja excluir esta chamada do sistema?", "Excluir", "#e74c3c", async () => {
        await App.api(`/chamadas/${id}`, 'DELETE'); App.renderizarChamadaPro(); 
    });
};

// ---------------------------------------------------------
// 5. CALENDÁRIO (BLINDADO COM GRID CSS INLINE E PÍLULAS)
// ---------------------------------------------------------
App.renderizarCalendarioPro = async () => { 
    App.setTitulo("Calendário");
    const div = document.getElementById('app-content'); div.innerHTML = 'A carregar calendário...'; 
    if (!App.calendarState) App.calendarState = { month: new Date().getMonth(), year: new Date().getFullYear() }; 
    
    try { 
        const eventos = await App.api(`/eventos?_t=${Date.now()}`); 
        const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']; 
        const mesNome = meses[App.calendarState.month]; const ano = App.calendarState.year; 
        
        const gridCalendario = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="App.mudarMes(-1)" style="background:none; border:none; font-size:24px; cursor:pointer; color:#555;">◀</button>
                <h2 style="margin:0; color:#2c3e50; text-transform:uppercase; font-size:22px;">${mesNome} ${ano}</h2>
                <button onclick="App.mudarMes(1)" style="background:none; border:none; font-size:24px; cursor:pointer; color:#555;">▶</button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-weight: bold; color: #7f8c8d; margin-bottom: 10px; font-size:12px; text-transform:uppercase;">
                <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
            </div>
            <div id="calendar-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; background: #eee; border: 1px solid #eee;">
                ${App.gerarDiasCalendario(App.calendarState.month, App.calendarState.year, eventos)}
            </div>
        `;

        const formEvento = `
            <div id="box-gerir-evento" style="display:flex; align-items:center; gap:10px; margin-bottom:15px;"><span style="font-size:20px;">🗓️</span><h3 style="margin:0; color:#2c3e50;">Gerir Evento</h3></div>
            <div style="display: flex; flex-wrap: wrap; gap: 15px; align-items: flex-end;">
                ${col('Data:', 'evt-data', 'date')}
                ${selectLocal('Tipo:', 'evt-tipo', '<option value="Evento">🟢 Evento</option><option value="Feriado">🔴 Feriado</option><option value="Prova">🔵 Prova</option><option value="Reunião">🟠 Reunião</option>')}
                ${col('Descrição:', 'evt-desc', 'text', '', 'placeholder="Ex: Prova de História / Carnaval" style="flex:3;"')}
            </div>
            <div style="display: flex; gap: 15px; margin-top: 15px; align-items: flex-end;">
                ${col('Início:', 'evt-inicio', 'time')}
                ${col('Término:', 'evt-fim', 'time')}
                <div style="flex: 1; text-align: right;">
                    <button onclick="App.limparFormEvento()" style="background:#95a5a6; color:white; border:none; padding:10px 20px; border-radius:5px; margin-right:5px;">Cancelar</button>
                    <button onclick="App.salvarEvento()" style="background:#6c5ce7; color:white; border:none; padding:10px 20px; border-radius:5px; font-weight:bold;">Salvar</button>
                </div>
            </div>
        `;

        const tabelaEventos = `
            <div class="table-responsive-wrapper">
                <table style="width:100%; border-collapse:collapse; font-size:14px; text-align:left;">
                    <thead><tr style="background:#f8f9fa; color:#7f8c8d; border-bottom:2px solid #eee;"><th style="padding:10px;">DIA</th><th style="padding:10px;">HORÁRIO</th><th style="padding:10px;">TIPO</th><th style="padding:10px;">DESCRIÇÃO</th><th style="padding:10px; text-align:right;">AÇÕES</th></tr></thead>
                    <tbody>${App.gerarListaEventosHTML(App.calendarState.month, App.calendarState.year, eventos)}</tbody>
                </table>
            </div>
        `;

        div.innerHTML = App.UI.card('', '', gridCalendario, '100%') + '<div style="margin-top:20px;">' + App.UI.card('', '', formEvento, '100%') + '</div>' + '<div style="margin-top:20px;">' + App.UI.card(`Lista de Eventos (${mesNome})`, '', tabelaEventos, '100%') + '</div>'; 
        document.getElementById('evt-data').value = new Date().toISOString().split('T')[0]; 
    } catch(e) { div.innerHTML = "Erro ao carregar calendário."; } 
};

App.gerarDiasCalendario = (mes, ano, eventos) => { 
    const startDay = new Date(ano, mes, 1).getDay(); 
    const daysInMonth = new Date(ano, mes + 1, 0).getDate(); 
    let html = ''; 
    for(let i=0; i<startDay; i++) { html += `<div class="cal-day empty"></div>`; }
    for(let d=1; d<=daysInMonth; d++){ 
        const dataISO = `${ano}-${String(mes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; 
        const hojeObj = new Date();
        const isHoje = (d === hojeObj.getDate() && mes === hojeObj.getMonth() && ano === hojeObj.getFullYear()); 
        const evs = eventos.filter(e => e.data === dataISO); 
        const tags = evs.map(e => `<div class="evt-pilula" style="--bg-cor: ${(EVENTO_CORES[e.tipo]||EVENTO_CORES['Evento']).bg};" title="${App.escapeHTML(e.descricao)}"><span class="evt-texto">${App.escapeHTML(e.descricao)}</span></div>`).join(''); 
        html += `<div id="cal-day-${dataISO}" class="cal-day ${isHoje ? 'hoje' : ''}" onclick="App.selecionarDia('${dataISO}')"><div class="dia-num">${d}</div><div class="evt-container">${tags}</div></div>`; 
    } 
    return html; 
};

App.gerarListaEventosHTML = (mes, ano, eventos) => { const evs = eventos.filter(e => { const d = new Date(e.data+'T00:00:00'); return d.getMonth()===mes && d.getFullYear()===ano; }).sort((a,b)=>new Date(a.data)-new Date(b.data)); if(evs.length===0) return '<tr><td colspan="5" style="padding:20px; text-align:center; color:#999;">Nenhum evento.</td></tr>'; return evs.map(e => `<tr style="border-bottom:1px solid #eee;"><td style="padding:10px; font-weight:bold;">${e.data.split('-')[2]}</td><td style="padding:10px;">${App.escapeHTML(e.inicio||'-')}</td><td style="padding:10px; font-weight:bold; color:${(EVENTO_CORES[e.tipo]||EVENTO_CORES['Evento']).bg}">${App.escapeHTML(e.tipo)}</td><td style="padding:10px;">${App.escapeHTML(e.descricao)}</td><td style="padding:10px; text-align:right;"><button onclick="App.preencherEdicaoEvento('${e.id}')" style="background:#f39c12; color:white; border:none; padding:5px 8px; border-radius:4px; margin-right:5px; cursor:pointer;">✏️</button><button onclick="App.excluirEvento('${e.id}')" style="background:#e74c3c; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer;">🗑️</button></td></tr>`).join(''); };
App.mudarMes = (d) => { App.calendarState.month+=d; if(App.calendarState.month>11){App.calendarState.month=0;App.calendarState.year++}else if(App.calendarState.month<0){App.calendarState.month=11;App.calendarState.year--}; App.renderizarCalendarioPro(); };

App.selecionarDia = (dt) => { 
    document.querySelectorAll('.cal-day').forEach(el => el.style.border = 'none');
    const diaAtivo = document.getElementById(`cal-day-${dt}`);
    if(diaAtivo) diaAtivo.style.border = '2px solid #3498db';
    document.getElementById('evt-data').value = dt; 
    document.getElementById('evt-desc').value = '';
    App.idEdicaoEvento = null; 
    setTimeout(() => { document.getElementById('box-gerir-evento').scrollIntoView({ behavior: 'smooth', block: 'start' }); document.getElementById('evt-desc').focus(); }, 100);
};

App.salvarEvento = async () => { 
    if (document.activeElement) document.activeElement.blur();
    const pl = { data: document.getElementById('evt-data').value, tipo: document.getElementById('evt-tipo').value, descricao: document.getElementById('evt-desc').value, inicio: document.getElementById('evt-inicio').value, fim: document.getElementById('evt-fim').value }; 
    if(!pl.data || !pl.descricao) return App.showToast("Preencha data e descrição.", "error"); 
    
    const btn = document.querySelector('button[onclick="App.salvarEvento()"]');
    const txtOrig = btn ? btn.innerText : 'Salvar';
    if(btn) { btn.innerText = "A salvar... ⏳"; btn.disabled = true; }
    document.body.style.cursor = 'wait';

    try {
        if(App.idEdicaoEvento) await App.api(`/eventos/${App.idEdicaoEvento}`, 'PUT', pl); 
        else await App.api('/eventos', 'POST', pl); 
        App.idEdicaoEvento=null; 
        setTimeout(() => { App.renderizarCalendarioPro(); setTimeout(() => { const tabelaEventos = document.querySelector('.table-responsive-wrapper'); if(tabelaEventos) tabelaEventos.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, 100); }, 300);
        App.showToast("Evento salvo com sucesso!", "success");
    } catch(e) { App.showToast("Erro ao salvar evento.", "error"); } 
    finally { if(btn) { btn.innerText = txtOrig; btn.disabled = false; } document.body.style.cursor = 'default'; }
};

App.preencherEdicaoEvento = async (id) => { const e = await App.api(`/eventos/${id}`); document.getElementById('evt-data').value=e.data; document.getElementById('evt-tipo').value=e.tipo; document.getElementById('evt-desc').value=e.descricao; document.getElementById('evt-inicio').value=e.inicio; document.getElementById('evt-fim').value=e.fim; App.idEdicaoEvento=id; document.getElementById('box-gerir-evento').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
App.excluirEvento = (id) => { App.confirmar("Excluir Evento", "Pretende remover este evento do calendário?", "Excluir", "#e74c3c", async () => { await App.api(`/eventos/${id}`, 'DELETE'); App.renderizarCalendarioPro(); }); };
App.limparFormEvento = () => { document.getElementById('evt-desc').value=''; App.idEdicaoEvento=null; };