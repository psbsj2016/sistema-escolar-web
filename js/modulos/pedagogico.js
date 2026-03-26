// =========================================================
// MÓDULO PEDAGÓGICO V159 (BLINDADO + FILTRO DE CHAMADA EM TEMPO REAL)
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

// ---------------------------------------------------------
// 1. PLANEAMENTO (COM FOLHA A4 BLINDADA)
// ---------------------------------------------------------
App.renderizarPlanejamentoPro = () => {
    App.setTitulo("Planeamento");
    const div = document.getElementById('app-content');
    
    const btnStyle = (cor) => `cursor:pointer; background:white; border:2px solid #eee; padding:30px; border-radius:15px; width:250px; transition:0.3s; box-shadow:0 5px 15px rgba(0,0,0,0.05);`;
    const hoverIn = (cor) => `this.style.borderColor='${cor}'; this.style.transform='translateY(-5px)'`;
    const hoverOut = `this.style.borderColor='#eee'; this.style.transform='translateY(0)'`;

    div.innerHTML = `
        <div class="card" style="text-align:center; padding:50px;">
            <h2 style="color:#2c3e50; margin-bottom:10px;">Planeamento Pedagógico</h2>
            <p style="color:#7f8c8d; margin-bottom:40px;">Gira o conteúdo programático e o controlo de aulas.</p>
            <div style="display:flex; justify-content:center; gap:30px; flex-wrap:wrap;">
                <div onclick="App.renderizarNovoPlanejamento()" style="${btnStyle('#3498db')}" onmouseover="${hoverIn('#3498db')}" onmouseout="${hoverOut}">
                    <div style="font-size:50px; margin-bottom:15px;">📝</div>
                    <h3 style="margin:0; color:#3498db;">Novo Planeamento</h3>
                    <p style="font-size:13px; color:#999; margin-top:5px;">Gerar grelha do zero</p>
                </div>
                <div onclick="App.renderizarPlanejamentosSalvos()" style="${btnStyle('#27ae60')}" onmouseover="${hoverIn('#27ae60')}" onmouseout="${hoverOut}">
                    <div style="font-size:50px; margin-bottom:15px;">📂</div>
                    <h3 style="margin:0; color:#27ae60;">Planeamentos Salvos</h3>
                    <p style="font-size:13px; color:#999; margin-top:5px;">Editar e acompanhar</p>
                </div>
            </div>
        </div>`;
};

App.renderizarNovoPlanejamento = async () => {
    const div = document.getElementById('app-content'); div.innerHTML = 'A carregar...';
    try {
        const alunos = await App.api('/alunos');
        const opAlunos = `<option value="">-- Selecione --</option>` + alunos.map(a => `<option value="${a.id}" data-curso="${a.curso}">${a.nome}</option>`).join('');
        
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
        const planos = await App.api('/planejamentos');
        if(planos.length === 0) { 
            div.innerHTML = App.UI.card('', '', `<h3>Nenhum planeamento salvo.</h3><button onclick="App.renderizarPlanejamentoPro()" class="btn-primary">Voltar</button>`, 'text-align:center; padding:40px;'); 
            return; 
        }
        
        const cabecalho = `<tr><th style="padding:10px; text-align:left; border-bottom:2px solid #eee;">Aluno</th><th style="padding:10px; text-align:left; border-bottom:2px solid #eee;">Curso</th><th style="padding:10px; border-bottom:2px solid #eee;">Aulas</th><th style="padding:10px; text-align:right; border-bottom:2px solid #eee;">Ações</th></tr>`;
        const corpo = planos.map(p => `
            <tr style="border-bottom:1px solid #eee;">
                <td style="padding:10px;">${p.nomeAluno}</td>
                <td style="padding:10px;">${p.curso}</td>
                <td style="padding:10px; text-align:center;">${p.aulas.length}</td>
                <td style="padding:10px; text-align:right;">
                    <button onclick="App.abrirPlanejamentoEditavel('${p.id}')" style="background:#f39c12; color:white; border:none; padding:5px 10px; border-radius:4px; margin-right:5px; cursor:pointer;">✏️</button>
                    <button onclick="App.excluirPlanejamento('${p.id}')" style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">🗑️</button>
                </td>
            </tr>`).join('');

        div.innerHTML = App.UI.card('', '', `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="margin:0;">Salvos</h3>
                <button onclick="App.renderizarPlanejamentoPro()" style="background:#ddd; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">Voltar</button>
            </div>
            <div class="table-responsive-wrapper">
                <table style="width:100%; border-collapse:collapse;"><thead>${cabecalho}</thead><tbody>${corpo}</tbody></table>
            </div>
        `);
    } catch(e) { div.innerHTML = "Erro."; }
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
            // 🛡️ CORREÇÃO: Formatação manual de data à prova de bugs de navegadores cruzados
            const d = String(dataAtual.getDate()).padStart(2, '0');
            const m = String(dataAtual.getMonth() + 1).padStart(2, '0');
            const y = dataAtual.getFullYear();
            
            listaAulas.push({ num: contador, data: `${d}/${m}/${y}`, hora: horario, duracao: duracao, conteudo: '', visto: false }); 
        } 
        dataAtual.setDate(dataAtual.getDate() + 1); 
    }
    App.renderizarTelaEdicao({ id: null, idAluno, nomeAluno, curso: cursoAluno, aulas: listaAulas });
};

App.abrirPlanejamentoEditavel = async (id) => { try { const plano = await App.api(`/planejamentos/${id}`); App.renderizarTelaEdicao(plano); } catch(e) { alert("Erro."); } };

App.renderizarTelaEdicao = (plano) => {
    App.planoAtual = plano; const div = document.getElementById('app-content');
    let totalMinutos = 0;
    plano.aulas.forEach(aula => { const [h, m] = aula.duracao.split(':').map(Number); totalMinutos += (h * 60) + m; });
    const totalHoras = (totalMinutos / 60).toFixed(0);
    
    const escola = JSON.parse(localStorage.getItem(App.getTenantKey('escola_perfil'))) || {}; 
    const logo = escola.foto ? `<img src="${escola.foto}" style="height:50px;">` : '';
    
    div.innerHTML = `
        <div class="no-print" style="margin-bottom:20px; background:#f4f4f4; padding:15px; border-radius:10px; display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
            <button onclick="App.salvarPlanejamentoBanco()" style="background:#27ae60; color:white; padding:10px 20px; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">💾 SALVAR</button>
            <button id="btn-sync-plan" onclick="App.sincronizarPlanejamentoComChamadasUI()" style="background:#8e44ad; color:white; padding:10px 20px; border:none; border-radius:5px; font-weight:bold; cursor:pointer; box-shadow: 0 4px 10px rgba(142,68,173,0.3);" title="Ajusta as datas de acordo com as presenças lançadas">🤖 AUTO-AJUSTAR</button>
            <button onclick="window.print()" style="background:#3498db; color:white; padding:10px 20px; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">🖨️ IMPRIMIR</button>
            <button onclick="App.renderizarPlanejamentosSalvos()" style="background:#7f8c8d; color:white; padding:10px 20px; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">FECHAR</button>
        </div>
        
        <div class="print-sheet" style="background: white; max-width: 210mm; margin: 0 auto; padding: 40px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-radius: 8px;">
            <div class="doc-header" style="display:flex; justify-content:space-between; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:20px;">
                <div style="display:flex; align-items:center; gap:15px;">${logo}<div><h2 style="margin:0; text-transform:uppercase; font-size:18px;">${escola.nome||'ESCOLA'}</h2><div style="font-size:12px;">CNPJ: ${escola.cnpj||''}</div></div></div>
                <div style="text-align:right;"><div><b>Planeamento Pedagógico</b></div><div style="font-size:12px;">Emissão: ${new Date().toLocaleDateString('pt-BR')}</div></div>
            </div>
            
            <div style="border:1px solid #000; padding:10px; font-size:12px; margin-bottom:15px; background:#fafafa;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div style="width:60%;">
                        <div style="margin-bottom:5px;"><b>ALUNO:</b> ${plano.nomeAluno}</div>
                        <div><b>TOTAL DE AULAS:</b> ${plano.aulas.length}</div>
                    </div>
                    <div style="width:40%;">
                        <div style="margin-bottom:5px;"><b>CURSO:</b> ${plano.curso}</div>
                        <div><b>CARGA HORÁRIA PREVISTA:</b> ${totalHoras}H</div>
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
                            <td style="padding:8px; border-bottom:1px solid #eee;"><input style="width:100%; border:none; border-bottom:1px dashed #ccc; text-align:center; background:transparent;" value="${a.data}" onchange="App.atualizarAula(${i},'data',this.value)"></td>
                            <td style="padding:8px; border-bottom:1px solid #eee;"><input style="width:100%; border:none; border-bottom:1px dashed #ccc; text-align:center; background:transparent;" value="${a.hora}" onchange="App.atualizarAula(${i},'hora',this.value)"></td>
                            <td style="padding:8px; border-bottom:1px solid #eee;"><input style="width:100%; border:none; border-bottom:1px dashed #ccc; text-align:center; background:transparent;" value="${a.duracao}" onchange="App.atualizarAula(${i},'duracao',this.value)"></td>
                            <td style="padding:8px; border-bottom:1px solid #eee;"><input style="width:100%; border:none; border-bottom:1px dashed #ccc; background:transparent;" placeholder="..." value="${a.conteudo}" onchange="App.atualizarAula(${i},'conteudo',this.value)"></td>
                            <td style="text-align:center; padding:8px; border-bottom:1px solid #eee;"><input type="checkbox" ${a.visto?'checked':''} onchange="App.atualizarAula(${i},'visto',this.checked)"></td>
                        </tr>`).join('')}
                        <tr style="background:#eee; font-weight:bold; border-top:2px solid #000;"><td colspan="3" style="text-align:right; padding:10px;">Carga Horária Total =</td><td style="text-align:center; padding:10px;">${totalHoras}H</td><td colspan="2"></td></tr>
                    </tbody>
                </table>
            </div>
        </div>`;
};

App.atualizarAula = (i,c,v) => { if(App.planoAtual && App.planoAtual.aulas[i]) App.planoAtual.aulas[i][c]=v; };

App.salvarPlanejamentoBanco = async () => { 
    if(!App.planoAtual) return; 
    
    // 🛡️ CORREÇÃO: Força o fecho do teclado para garantir que a última letra digitada é guardada
    if (document.activeElement) document.activeElement.blur();

    const met = App.planoAtual.id ? 'PUT' : 'POST'; 
    const url = App.planoAtual.id ? `/planejamentos/${App.planoAtual.id}` : `/planejamentos`; 
    if(!App.planoAtual.id) App.planoAtual.id = Date.now().toString(); 
    
    const btn = document.querySelector('button[onclick="App.salvarPlanejamentoBanco()"]');
    const txtOrig = btn ? btn.innerText : '💾 SALVAR';
    if(btn) { btn.innerText = "A salvar... ⏳"; btn.disabled = true; }
    document.body.style.cursor = 'wait';

    try {
        await App.api(url, met, App.planoAtual); 
        App.showToast("Planeamento Salvo!", "success"); 
        App.renderizarPlanejamentosSalvos(); 
    } catch(e) { App.showToast("Erro ao salvar.", "error"); } 
    finally { if(btn) { btn.innerText = txtOrig; btn.disabled = false; } document.body.style.cursor = 'default'; }
};

App.processarAutoAjustePlano = (plano, chamadas) => {
    if (!plano || !plano.aulas) return plano;

    const presencas = chamadas
        .filter(c => c.idAluno === plano.idAluno && (c.status === 'Presença' || c.status === 'Reposição'))
        .sort((a, b) => new Date(a.data) - new Date(b.data));

    let diasDaSemanaAulas = [];
    if (presencas.length > 0) {
        const ultimas = presencas.slice(-4);
        diasDaSemanaAulas = [...new Set(ultimas.map(p => {
            const [ano, mes, dia] = p.data.split('-');
            const d = new Date(`${ano}-${mes}-${dia}T12:00:00`);
            return d.getDay();
        }))];
    }

    if (diasDaSemanaAulas.length === 0) {
        diasDaSemanaAulas = [...new Set(plano.aulas.map(a => {
            const parts = a.data.split('/');
            if (parts.length === 3) {
                const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T12:00:00`);
                return d.getDay();
            }
            return -1;
        }).filter(d => d !== -1))];
    }
    
    if (diasDaSemanaAulas.length === 0) diasDaSemanaAulas = [1]; 

    let presencasUsadas = 0;
    let ultimaDataBase = new Date(); 
    ultimaDataBase.setHours(12, 0, 0, 0);

    for (let i = 0; i < plano.aulas.length; i++) {
        const aula = plano.aulas[i];

        if (presencasUsadas < presencas.length) {
            const dataReal = presencas[presencasUsadas].data; 
            const [ano, mes, dia] = dataReal.split('-');
            aula.data = `${dia}/${mes}/${ano}`;
            aula.visto = true;
            ultimaDataBase = new Date(`${ano}-${mes}-${dia}T12:00:00`);
            presencasUsadas++;
        } else {
            aula.visto = false;
            ultimaDataBase.setDate(ultimaDataBase.getDate() + 1);
            
            while (!diasDaSemanaAulas.includes(ultimaDataBase.getDay())) {
                ultimaDataBase.setDate(ultimaDataBase.getDate() + 1);
            }
            
            const d = String(ultimaDataBase.getDate()).padStart(2, '0');
            const m = String(ultimaDataBase.getMonth() + 1).padStart(2, '0');
            const y = ultimaDataBase.getFullYear();
            aula.data = `${d}/${m}/${y}`;
        }
    }
    return plano;
};

App.sincronizarPlanejamentoComChamadasUI = async () => {
    if(!App.planoAtual || !App.planoAtual.idAluno) return;

    const btn = document.getElementById('btn-sync-plan');
    const txtOrig = btn.innerHTML;
    btn.innerHTML = "A analisar Padrões... ⏳"; btn.disabled = true;
    document.body.style.cursor = 'wait';

    try {
        const chamadas = await App.api('/chamadas');
        App.planoAtual = App.processarAutoAjustePlano(App.planoAtual, chamadas);
        
        App.renderizarTelaEdicao(App.planoAtual);
        App.showToast("Planeamento Auto-Ajustado com Base nas Últimas Aulas! 🎉", "success");

    } catch (e) { App.showToast("Erro ao sincronizar planeamento.", "error"); } 
    finally { if(btn) { btn.innerHTML = txtOrig; btn.disabled = false; } document.body.style.cursor = 'default'; }
};

App.excluirPlanejamento = async (id) => { if(confirm("Excluir?")) { await App.api(`/planejamentos/${id}`, 'DELETE'); App.renderizarPlanejamentosSalvos(); } };

// ---------------------------------------------------------
// 2. BOLETIM (COM FOLHA A4 BLINDADA)
// ---------------------------------------------------------
App.renderizarBoletimVisual = async () => {
    App.setTitulo("Boletim Escolar");
    const div = document.getElementById('app-content'); div.innerHTML = 'A carregar...';
    try {
        const alunos = await App.api('/alunos');
        const opAlunos = `<option value="">-- Selecione o Aluno --</option>` + alunos.map(a => `<option value="${a.id}">${a.nome}</option>`).join('');
        
        const formBoletim = `
            <div style="display:flex; gap:10px; align-items:center;">
                <select id="bol-aluno" style="flex:1; padding:12px; border:1px solid #ccc; border-radius:5px;">${opAlunos}</select>
                <button onclick="App.gerarBoletimTela()" style="background:#2c3e50; color:white; border:none; padding:12px 25px; border-radius:5px; font-weight:bold; cursor:pointer;">GERAR</button>
            </div>
        `;
        
        div.innerHTML = App.UI.card('📄 Emitir Boletim Escolar', '', formBoletim, '800px') + `<div id="boletim-area" style="margin-top:30px;"></div>`;
    } catch(e) { div.innerHTML = "Erro."; }
};

App.gerarBoletimTela = async () => {
    const idAluno = document.getElementById('bol-aluno').value; if(!idAluno) return App.showToast("Selecione um aluno.", "error");
    const divArea = document.getElementById('boletim-area'); divArea.innerHTML = '<p style="text-align:center;">A gerar boletim...</p>';
    
    try {
        const [aluno, avaliacoes, chamadas, escola, planejamentos] = await Promise.all([
            App.api(`/alunos/${idAluno}`), App.api('/avaliacoes'), App.api('/chamadas'), App.api('/escola'), App.api('/planejamentos')
        ]);
        
        const presencas = chamadas.filter(c => c.idAluno === idAluno && (c.status === 'Presença' || c.status === 'Reposição')).map(c => c.data).sort();
        const primAula = presencas.length > 0 ? presencas[0].split('-').reverse().join('/') : new Date().toLocaleDateString('pt-BR');
        
        let ultAula = '__/__/____';
        const planoAluno = planejamentos.find(p => p.idAluno === idAluno);
        if (planoAluno && planoAluno.aulas && planoAluno.aulas.length > 0) { ultAula = planoAluno.aulas[planoAluno.aulas.length - 1].data; } 
        else if (presencas.length > 0) { ultAula = presencas[presencas.length - 1].split('-').reverse().join('/'); }

        const notasAluno = avaliacoes.filter(n => n.idAluno === idAluno); const disciplinasMap = {};
        
        // 🛡️ CORREÇÃO: parseFloat(n.nota) || 0 evita o temido erro NaN (Not a Number) no Boletim
        notasAluno.forEach(n => { 
            const disc = n.disciplina || 'Geral'; 
            if(!disciplinasMap[disc]) disciplinasMap[disc] = { nome: disc, notas: [], total: 0 }; 
            disciplinasMap[disc].notas.push(n); 
            disciplinasMap[disc].total += (parseFloat(n.nota) || 0); 
        });
        
        let linhasHTML = '';
        if(Object.keys(disciplinasMap).length === 0) linhasHTML = '<tr><td colspan="4" style="text-align:center; padding:15px;">Sem notas lançadas.</td></tr>';
        else Object.keys(disciplinasMap).forEach(chave => {
            const d = disciplinasMap[chave];
            const situacao = d.total >= 6 ? '<span style="color:green; font-weight:bold;">APROVADO</span>' : '<span style="color:orange;">EM CURSO</span>';
            const detalhe = d.notas.map(n => `<span style="font-size:11px;">${n.tipo}: <b>${n.nota}</b></span>`).join(', ');
            linhasHTML += `<tr><td style="padding:10px; border-bottom:1px solid #eee;">${d.nome}</td><td style="padding:10px; border-bottom:1px solid #eee;">${detalhe}</td><td style="text-align:center; padding:10px; border-bottom:1px solid #eee;"><b>${d.total.toFixed(1)}</b></td><td style="text-align:center; padding:10px; border-bottom:1px solid #eee;">${situacao}</td></tr>`;
        });

        const logo = escola.foto ? `<img src="${escola.foto}" style="height:60px; object-fit:contain;">` : '';
        const dataHoje = new Date().toLocaleDateString('pt-BR');

        divArea.innerHTML = `
            <div class="no-print" style="text-align:center; margin-bottom:20px;"><button onclick="window.print()" class="btn-primary">🖨️ IMPRIMIR BOLETIM</button></div>
            
            <div class="print-sheet" style="background: white; max-width: 210mm; margin: 0 auto; padding: 40px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-radius: 8px;">
                <div class="doc-header" style="display:flex; justify-content:space-between; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:20px;">
                    <div style="display:flex; align-items:center; gap:20px;">${logo}<div><h2 style="margin:0; text-transform:uppercase;">${escola.nome}</h2><div style="font-size:12px;">CNPJ: ${escola.cnpj}</div></div></div>
                    <div style="text-align:right;"><div><b>BOLETIM ESCOLAR</b></div><div style="font-size:10px; color:#999;">Emissão: ${dataHoje}</div></div>
                </div>
                <div style="padding:15px; background:#fafafa; border:1px solid #000; margin-bottom:15px;">
                    <div style="font-weight:bold; font-size:16px; margin-bottom:5px;">ALUNO: ${aluno.nome.toUpperCase()}</div>
                    <div style="font-size:13px; margin-bottom:10px;"><b>CURSO:</b> ${aluno.curso || '-'} &nbsp;&nbsp;|&nbsp;&nbsp; <b>TURMA:</b> ${aluno.turma || '-'}</div>
                    <div style="display:flex; justify-content:space-between; border-top:1px solid #ccc; padding-top:5px; font-size:12px;"><div>INÍCIO DAS AULAS: <b>${primAula}</b></div><div>PREVISÃO DE TÉRMINO: <b>${ultAula}</b></div></div>
                </div>
                <div class="table-responsive-wrapper">
                    <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left;">
                        <thead><tr style="border-bottom:2px solid #000;"><th style="padding:10px;">DISCIPLINA</th><th style="padding:10px;">AVALIAÇÕES</th><th style="text-align:center; padding:10px;">NOTA</th><th style="text-align:center; padding:10px;">RESULTADO</th></tr></thead>
                        <tbody>${linhasHTML}</tbody>
                    </table>
                </div>
                <div style="padding:40px 30px; text-align:center;"><div style="width:300px; margin:0 auto; border-top:1px solid #333; padding-top:5px; font-size:12px;">Coordenação Pedagógica</div></div>
            </div>`;
    } catch(e) { App.showToast("Erro ao gerar boletim.", "error"); }
};

// ---------------------------------------------------------
// 3. AVALIAÇÕES E NOTAS (HÍBRIDO: TURMA OU ALUNO)
// ---------------------------------------------------------
App.renderizarAvaliacoesPro = async () => {
    App.setTitulo("Avaliações e Notas");
    const div = document.getElementById('app-content');
    div.innerHTML = '<p style="text-align:center; padding:20px; color:#666;">A carregar dados...</p>';
    try {
        // 🚀 AQUI: Adicionámos a busca aos cursos cadastrados
        const [alunos, turmas, cursos, avaliacoes] = await Promise.all([App.api('/alunos'), App.api('/turmas'), App.api('/cursos'), App.api('/avaliacoes')]);
        App.cacheAlunos = alunos;
        const historico = avaliacoes.sort((a,b) => b.id - a.id);

        const opTurmas = `<option value="">-- Turma Completa --</option>` + turmas.map(t => `<option value="${t.nome}">${App.escapeHTML(t.nome)}</option>`).join('');
        const opAlunos = `<option value="">-- Aluno Específico --</option>` + alunos.map(a => `<option value="${a.id}">${App.escapeHTML(a.nome)}</option>`).join('');
        
        // 🚀 AQUI: Criámos as opções baseadas nos seus cursos reais
        const opCursos = `<option value="Geral">Geral / Curso Padrão</option>` + cursos.map(c => `<option value="${c.nome}">${App.escapeHTML(c.nome)}</option>`).join('');
        
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
                ${col('Data da Avaliação:', 'nota-data', 'date', hoje)}
                ${col('Valor Máximo (Pts):', 'nota-max', 'number', '10', 'step="0.1"')}
                <button onclick="App.carregarListaNotas()" class="btn-primary" style="height:41px; padding:0 20px;">📋 ABRIR PAUTA</button>
            </div>
        `;

        // ✨ IMPLEMENTAÇÃO: BARRA DE PESQUISA ADICIONADA AQUI LOGO ACIMA DA TABELA ✨
        const tabelaHistorico = `
            <div style="background: #fff; padding: 10px 15px; border-radius: 8px; border: 1px solid #eee; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <span style="font-size: 18px; color: #aaa;">🔍</span>
                <input type="text" id="input-busca-notas" 
                       placeholder="Pesquisar histórico pelo nome do aluno, disciplina ou tipo..." 
                       oninput="App.filtrarHistoricoNotas()" 
                       style="flex: 1; border: none; outline: none; font-size: 14px; padding: 5px; background: transparent; width: 100%;">
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
                                <td style="padding:12px;">${h.data ? h.data.split('-').reverse().join('/') : '-'}</td>
                                <td style="padding:12px;">${App.escapeHTML(h.tipo)}</td>
                                <td style="padding:12px;">${App.escapeHTML(h.bimestre)}</td>
                                <td style="padding:12px; text-align:center;"><strong style="color:${parseFloat(h.nota) >= parseFloat(h.valorMax)*0.6 ? '#27ae60' : '#c0392b'}">${h.nota}</strong> <span style="color:#999; font-size:11px;">/ ${h.valorMax}</span></td>
                                <td style="padding:12px; text-align:right;">
                                    <button onclick="App.editarAvaliacao('${h.id}')" style="background:#f39c12; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer; margin-right:5px;" title="Editar">✏️</button>
                                    <button onclick="App.excluirAvaliacao('${h.id}')" style="background:#e74c3c; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer;" title="Excluir">🗑️</button>
                                </td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        `;

        div.innerHTML = App.UI.card('📝 Lançamento de Notas (Híbrido)', 'Gere a pauta para a turma inteira ou para um aluno isolado.', formFiltros, '100%') + 
                        `<div id="area-lista-notas" style="margin-top:20px;"></div>` +
                        '<div style="margin-top:20px;">' + App.UI.card('Histórico de Notas Lançadas', '', tabelaHistorico, '100%') + '</div>';
    } catch(e) { div.innerHTML="Erro ao carregar avaliações."; }
};

App.toggleTipoOutroNota = () => { const tipo = document.getElementById('nota-tipo').value; document.getElementById('div-outro-nota').style.display = (tipo==='Outro')?'block':'none'; };

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

    const area = document.getElementById('area-lista-notas');
    area.innerHTML = '<p style="text-align:center; padding:20px;">A preparar pauta de lançamento... ⏳</p>';

    try {
        const [alunos, avaliacoes] = await Promise.all([App.api('/alunos'), App.api('/avaliacoes')]);
        
        let alunosAlvo = [];
        if (idAluno) { alunosAlvo = alunos.filter(a => a.id === idAluno); } 
        else { alunosAlvo = alunos.filter(a => a.turma === turma); }

        if(alunosAlvo.length === 0) { area.innerHTML = '<div class="card"><p style="text-align:center; color:#999; margin:0;">Nenhum aluno encontrado para este filtro.</p></div>'; return; }

        let linhas = '';
        alunosAlvo.forEach(a => {
            let regExistente = null;
            
            // 🎯 NOVO: Se estiver a editar, procura pelo ID exato. Se não, usa o filtro normal.
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
                    <input type="number" class="valor-nota" style="width:100%; padding:8px; border-radius:5px; border:1px solid #ccc; text-align:center; font-weight:bold; color:var(--accent);" step="0.1" max="${max}" placeholder="0.0" value="${notaAtual}">
                </td>
            </tr>`;
        });
        
        // 🎯 NOVO: Limpa a memória após gerar a tabela
        App.idAvaliacaoEditando = null;

        area.innerHTML = `
            <div class="card" style="padding:0; overflow:hidden; border:2px solid #2980b9;">
                <div style="padding:15px; background:#e8f4f8; border-bottom:1px solid #d1e8f0; font-size:13px; color:#2980b9; display:flex; justify-content:space-between; align-items:center;">
                    <span><b>Lançamento:</b> ${App.escapeHTML(tipo)} de ${App.escapeHTML(disc)}</span>
                    <span style="background:#2980b9; color:white; padding:4px 10px; border-radius:12px; font-weight:bold;">Máx: ${max} pts</span>
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

    const btn = document.querySelector('button[onclick="App.salvarNotasLote()"]');
    const txt = btn.innerText; btn.innerText = "A arquivar... ⏳"; btn.disabled = true; document.body.style.cursor = 'wait';

    try {
        const promessas = [];
        const avaliacoesExistentes = await App.api('/avaliacoes');

        linhas.forEach(linha => {
            const idAluno = linha.getAttribute('data-id'); const nomeAluno = linha.getAttribute('data-nome');
            const idEdicao = linha.getAttribute('data-id-avaliacao'); // 🎯 NOVO: Recupera o ID exato escondido
            const notaInput = linha.querySelector('.valor-nota').value;
            if (notaInput === '') return; // Ignora se estiver em branco

            let regExistente = null;
            if (idEdicao) {
                regExistente = avaliacoesExistentes.find(av => av.id === idEdicao);
            } else {
                regExistente = avaliacoesExistentes.find(av => av.idAluno === idAluno && av.data === data && av.disciplina === disc && av.tipo === tipo);
            }

            const payload = { idAluno, nomeAluno, disciplina: disc, tipo, data, valorMax: max, nota: notaInput, bimestre, dataLancamento: new Date().toISOString().split('T')[0] };

            if (regExistente) { 
                // 🎯 NOVO: Usa o PUT com TODOS os campos novos (atualizando também data, tipo e disciplina)
                promessas.push(App.api(`/avaliacoes/${regExistente.id}`, 'PUT', { ...regExistente, nota: notaInput, valorMax: max, data: data, disciplina: disc, tipo: tipo, bimestre: bimestre })); 
            } 
            else { 
                payload.id = Date.now().toString() + Math.floor(Math.random()*1000); 
                promessas.push(App.api('/avaliacoes', 'POST', payload)); 
            }
        });

        await Promise.all(promessas);
        App.showToast("Pauta de notas arquivada com sucesso!", "success");
        App.renderizarAvaliacoesPro(); // Recarrega histórico
    } catch(e) { App.showToast("Erro ao salvar as notas.", "error"); }
    finally { if(btn){btn.innerText = txt; btn.disabled = false;} document.body.style.cursor = 'default'; }
};

App.excluirAvaliacao = async (id) => { if(confirm("Excluir nota?")) { await App.api(`/avaliacoes/${id}`, 'DELETE'); App.renderizarAvaliacoesPro(); }};
App.editarAvaliacao = async (id) => { 
    const n = await App.api(`/avaliacoes/${id}`); 
    document.getElementById('nota-aluno').value = n.idAluno; document.getElementById('nota-turma').value = "";
    document.getElementById('nota-disc').value = n.disciplina || 'Geral';
    if(["Teste","Prova","Pesquisa","Trabalho"].includes(n.tipo)) { document.getElementById('nota-tipo').value=n.tipo; document.getElementById('div-outro-nota').style.display='none'; } 
    else { document.getElementById('nota-tipo').value='Outro'; App.toggleTipoOutroNota(); document.getElementById('nota-outro-desc').value=n.tipo; } 
    document.getElementById('nota-max').value = n.valorMax; document.getElementById('nota-bimestre').value = n.bimestre; document.getElementById('nota-data').value = n.data || new Date().toISOString().split('T')[0];
    document.querySelector('.card').scrollIntoView({behavior:'smooth'}); 
    
    // 🎯 NOVO: Guarda o ID exato na memória antes de carregar a lista
    App.idAvaliacaoEditando = id; 
    App.carregarListaNotas(); 
};

// ✨ IMPLEMENTAÇÃO: FUNÇÃO DE FILTRAGEM INSTANTÂNEA DE NOTAS ✨
App.filtrarHistoricoNotas = () => {
    const termo = document.getElementById('input-busca-notas').value.trim().toLowerCase();
    const linhas = document.querySelectorAll('#tabela-historico-notas tbody tr');
    
    if (!linhas || linhas.length === 0) return;

    linhas.forEach(linha => {
        // Ignora a linha de "Nenhuma nota lançada" para não gerar erros visuais
        if (linha.innerText.includes('Nenhuma nota lançada')) return;
        
        const textoLinha = linha.innerText.toLowerCase(); 
        
        if (textoLinha.includes(termo)) {
            linha.style.display = '';
        } else {
            linha.style.display = 'none';
        }
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
        const [alunos, turmas, chamadas] = await Promise.all([App.api('/alunos'), App.api('/turmas'), App.api('/chamadas')]); 
        const historico = Array.isArray(chamadas) ? chamadas.sort((a,b) => new Date(b.data) - new Date(a.data)) : []; 
        
        const opTurmas = `<option value="">-- Turma Completa --</option>` + turmas.map(t => `<option value="${t.nome}">${App.escapeHTML(t.nome)}</option>`).join('');
        const opAlunos = `<option value="">-- Aluno Específico --</option>` + alunos.map(a => `<option value="${a.id}">${App.escapeHTML(a.nome)}</option>`).join('');
        const hoje = new Date().toISOString().split('T')[0];

        const formChamada = `
            <div style="display:flex; gap:15px; flex-wrap:wrap; align-items:flex-end; margin-bottom:15px; background:#f9f9f9; padding:15px; border-radius:8px; border:1px solid #eee;">
                ${selectLocal('Filtrar por Turma:', 'chamada-turma', opTurmas)}
                <span style="padding-bottom:10px; font-weight:bold; color:#999; text-transform:uppercase; font-size:12px;">Ou</span>
                ${selectLocal('Buscar Aluno Único:', 'chamada-aluno', opAlunos)}
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-end;">
                ${col('Data da Aula:', 'chamada-data', 'date', hoje)}
                ${col('Duração (Ex: 01:30):', 'chamada-duracao', 'time', '01:00')}
                <button onclick="App.carregarListaChamada()" class="btn-primary" style="height:41px; padding:0 20px;">📋 ABRIR CHAMADA</button>
            </div>
        `;

        // ✨ IMPLEMENTAÇÃO: BARRA DE PESQUISA ADICIONADA AQUI LOGO ACIMA DA TABELA ✨
        const tabelaChamada = `
            <div style="background: #fff; padding: 10px 15px; border-radius: 8px; border: 1px solid #eee; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <span style="font-size: 18px; color: #aaa;">🔍</span>
                <input type="text" id="input-busca-chamada" 
                       placeholder="Pesquisar histórico pelo nome do aluno ou status..." 
                       oninput="App.filtrarHistoricoChamada()" 
                       style="flex: 1; border: none; outline: none; font-size: 14px; padding: 5px; background: transparent; width: 100%;">
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
                            return `<tr style="border-bottom:1px solid #eee;"><td style="padding:12px; color:#555;">${h.data.split('-').reverse().join('/')}</td><td style="padding:12px; font-weight:bold;">${App.escapeHTML(h.nomeAluno)}</td><td style="padding:12px; font-weight:bold; color:${color};">${h.status}</td><td style="padding:12px; color:#555;">${h.duracao}</td><td style="padding:12px; text-align:right;"><button onclick="App.editarLancamentoChamada('${h.id}')" style="background:none; border:none; cursor:pointer; font-size:16px; margin-right:5px;" title="Editar">✏️</button><button onclick="App.excluirLancamentoChamada('${h.id}')" style="background:none; border:none; cursor:pointer; font-size:16px; color:#999;" title="Excluir">🗑️</button></td></tr>`; 
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

        div.innerHTML = App.UI.card('📝 Registo de Frequência (Híbrido)', 'Faça a chamada para a turma ou ajuste as faltas de um único aluno.', formChamada, '100%') + 
                        `<div id="area-lista-chamada" style="margin-top:20px;"></div>` +
                        '<div style="margin-top:20px;">' + App.UI.card('Histórico Completo de Lançamentos', '', tabelaChamada, '100%') + '</div>';
    } catch(e) { div.innerHTML = "Erro ao carregar módulo de chamada."; } 
};

App.carregarListaChamada = async () => {
    const turma = document.getElementById('chamada-turma').value;
    const idAluno = document.getElementById('chamada-aluno').value;
    const data = document.getElementById('chamada-data').value;
    
    if(!turma && !idAluno) return App.showToast("Selecione uma Turma OU um Aluno específico.", "warning");
    if(!data) return App.showToast("Preencha a Data da aula.", "warning");

    const area = document.getElementById('area-lista-chamada');
    area.innerHTML = '<p style="text-align:center; padding:20px;">A preparar diário de classe... ⏳</p>';

    try {
        const [alunos, chamadas] = await Promise.all([App.api('/alunos'), App.api('/chamadas')]);
        
        let alunosAlvo = [];
        if (idAluno) { alunosAlvo = alunos.filter(a => a.id === idAluno); } 
        else { alunosAlvo = alunos.filter(a => a.turma === turma); }

        if(alunosAlvo.length === 0) { area.innerHTML = '<div class="card"><p style="text-align:center; color:#999; margin:0;">Nenhum aluno encontrado para este filtro.</p></div>'; return; }

        const chamadasDia = chamadas.filter(c => c.data === data);
        let linhas = '';
        
        alunosAlvo.forEach(a => {
            const regExistente = chamadasDia.find(c => c.idAluno === a.id);
            const status = regExistente ? regExistente.status : 'Presença';
            
            linhas += `
            <tr style="border-bottom:1px solid #eee;" class="linha-chamada" data-id="${a.id}" data-nome="${App.escapeHTML(a.nome)}">
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

        area.innerHTML = `
            <div class="card" style="padding:0; overflow:hidden; border:2px solid #27ae60;">
                <div style="padding:15px; background:#eafaf1; border-bottom:1px solid #d5f5e3; font-size:13px; color:#27ae60; font-weight:bold;">
                    Grelha de Frequência - ${data.split('-').reverse().join('/')}
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

    const btn = document.querySelector('button[onclick="App.salvarChamadaLote()"]');
    const txt = btn.innerText; btn.innerText = "A processar... ⏳"; btn.disabled = true; document.body.style.cursor = 'wait';

    try {
        const promessasChamadas = [];
        const chamadasExistentes = await App.api('/chamadas');
        const alunosAfetados = [];

        linhas.forEach(linha => {
            const idAluno = linha.getAttribute('data-id'); const nomeAluno = linha.getAttribute('data-nome');
            const status = linha.querySelector('.status-chamada').value;
            
            alunosAfetados.push(idAluno); // Guardar para o auto-ajuste

            const regExistente = chamadasExistentes.find(c => c.idAluno === idAluno && c.data === data);
            const payload = { idAluno, nomeAluno, data, status, duracao };

            if (regExistente) { promessasChamadas.push(App.api(`/chamadas/${regExistente.id}`, 'PUT', { ...regExistente, status, duracao })); } 
            else { payload.id = Date.now().toString() + Math.floor(Math.random()*1000); promessasChamadas.push(App.api('/chamadas', 'POST', payload)); }
        });

        // 1. Guarda todas as presenças
        await Promise.all(promessasChamadas);
        
        // 2. 🧠 MOTOR PREDITIVO EM MASSA (AUTO-AJUSTE SILENCIOSO)
        let avisoExtra = "";
        try {
            // Puxa as chamadas fresquinhas (já com as gravadas acima) e os planeamentos
            const [planejamentos, chamadasAtualizadas] = await Promise.all([App.api('/planejamentos'), App.api('/chamadas')]);
            const promessasPlano = [];

            alunosAfetados.forEach(idAluno => {
                let planoDoAluno = planejamentos.find(p => p.idAluno === idAluno);
                if (planoDoAluno && typeof App.processarAutoAjustePlano === 'function') {
                    planoDoAluno = App.processarAutoAjustePlano(planoDoAluno, chamadasAtualizadas);
                    promessasPlano.push(App.api(`/planejamentos/${planoDoAluno.id}`, 'PUT', planoDoAluno));
                }
            });

            if (promessasPlano.length > 0) {
                await Promise.all(promessasPlano);
                avisoExtra = " e Planeamento(s) Auto-Ajustado(s)!";
            }
        } catch (erroPlano) { console.log("Aviso: Falha no auto-ajuste de fundo.", erroPlano); }

        App.showToast(`Frequência registada${avisoExtra}`, "success");
        App.renderizarChamadaPro(); // Recarrega histórico
    } catch(e) { App.showToast("Erro ao guardar a chamada.", "error"); }
    finally { if(btn){btn.innerText = txt; btn.disabled = false;} document.body.style.cursor = 'default'; }
};

App.excluirLancamentoChamada = async (id) => { if(confirm("Excluir este registo?")) { await App.api(`/chamadas/${id}`, 'DELETE'); App.renderizarChamadaPro(); } };
App.editarLancamentoChamada = async (id) => { 
    const registro = await App.api(`/chamadas/${id}`); 
    document.getElementById('chamada-aluno').value = registro.idAluno; document.getElementById('chamada-turma').value = "";
    document.getElementById('chamada-data').value = registro.data; document.getElementById('chamada-duracao').value = registro.duracao; 
    document.querySelector('.card').scrollIntoView({ behavior: 'smooth' }); 
    App.carregarListaChamada(); // Abre a grelha automaticamente só para este aluno!
};

// ✨ IMPLEMENTAÇÃO: FUNÇÃO DE FILTRAGEM INSTANTÂNEA ✨
App.filtrarHistoricoChamada = () => {
    const termo = document.getElementById('input-busca-chamada').value.trim().toLowerCase();
    const linhas = document.querySelectorAll('#tabela-historico-chamadas tbody tr');
    
    if (!linhas || linhas.length === 0) return;

    linhas.forEach(linha => {
        // Ignora a linha de "Nenhum registo encontrado" para não gerar erros visuais
        if (linha.innerText.includes('Nenhum registo encontrado')) return;
        
        const textoLinha = linha.innerText.toLowerCase(); 
        
        if (textoLinha.includes(termo)) {
            linha.style.display = '';
        } else {
            linha.style.display = 'none';
        }
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
        const eventos = await App.api('/eventos'); 
        const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']; 
        const mesNome = meses[App.calendarState.month]; const ano = App.calendarState.year; 
        
        // CSS INLINE DE GRID APLICADO DIRETAMENTE AQUI
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

        div.innerHTML = App.UI.card('', '', gridCalendario, '100%') + 
                        '<div style="margin-top:20px;">' + App.UI.card('', '', formEvento, '100%') + '</div>' + 
                        '<div style="margin-top:20px;">' + App.UI.card(`Lista de Eventos (${mesNome})`, '', tabelaEventos, '100%') + '</div>'; 
                        
        document.getElementById('evt-data').value = new Date().toISOString().split('T')[0]; 
    } catch(e) { div.innerHTML = "Erro ao carregar calendário."; } 
};

App.gerarDiasCalendario = (mes, ano, eventos) => { 
    const startDay = new Date(ano, mes, 1).getDay(); 
    const daysInMonth = new Date(ano, mes + 1, 0).getDate(); 
    let html = ''; 
    
    // Espaços vazios no calendário
    for(let i=0; i<startDay; i++) {
        html += `<div class="cal-day empty"></div>`; 
    }
    
    for(let d=1; d<=daysInMonth; d++){ 
        const dataISO = `${ano}-${String(mes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; 
        const hojeObj = new Date();
        const isHoje = (d === hojeObj.getDate() && mes === hojeObj.getMonth() && ano === hojeObj.getFullYear()); 
        
        const evs = eventos.filter(e => e.data === dataISO); 
        
        // 🎨 Injetamos os eventos com uma classe limpa em vez de estilos complexos inline
        const tags = evs.map(e => `
            <div class="evt-pilula" style="--bg-cor: ${(EVENTO_CORES[e.tipo]||EVENTO_CORES['Evento']).bg};" title="${e.descricao}">
                <span class="evt-texto">${e.descricao}</span>
            </div>
        `).join(''); 
        
        // Célula do dia limpa
        html += `
            <div id="cal-day-${dataISO}" class="cal-day ${isHoje ? 'hoje' : ''}" onclick="App.selecionarDia('${dataISO}')">
                <div class="dia-num">${d}</div>
                <div class="evt-container">${tags}</div>
            </div>
        `; 
    } 
    return html; 
};

App.gerarListaEventosHTML = (mes, ano, eventos) => { const evs = eventos.filter(e => { const d = new Date(e.data+'T00:00:00'); return d.getMonth()===mes && d.getFullYear()===ano; }).sort((a,b)=>new Date(a.data)-new Date(b.data)); if(evs.length===0) return '<tr><td colspan="5" style="padding:20px; text-align:center; color:#999;">Nenhum evento.</td></tr>'; return evs.map(e => `<tr style="border-bottom:1px solid #eee;"><td style="padding:10px; font-weight:bold;">${e.data.split('-')[2]}</td><td style="padding:10px;">${e.inicio||'-'}</td><td style="padding:10px; font-weight:bold; color:${(EVENTO_CORES[e.tipo]||EVENTO_CORES['Evento']).bg}">${e.tipo}</td><td style="padding:10px;">${e.descricao}</td><td style="padding:10px; text-align:right;"><button onclick="App.preencherEdicaoEvento('${e.id}')" style="background:#f39c12; color:white; border:none; padding:5px 8px; border-radius:4px; margin-right:5px; cursor:pointer;">✏️</button><button onclick="App.excluirEvento('${e.id}')" style="background:#e74c3c; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer;">🗑️</button></td></tr>`).join(''); };
App.mudarMes = (d) => { App.calendarState.month+=d; if(App.calendarState.month>11){App.calendarState.month=0;App.calendarState.year++}else if(App.calendarState.month<0){App.calendarState.month=11;App.calendarState.year--}; App.renderizarCalendarioPro(); };

App.selecionarDia = (dt) => { 
    // Remove o border selecionado antigo (se houver) e adiciona ao novo
    document.querySelectorAll('.cal-day').forEach(el => el.style.border = 'none');
    const diaAtivo = document.getElementById(`cal-day-${dt}`);
    if(diaAtivo) diaAtivo.style.border = '2px solid #3498db';
    
    const dataInput = document.getElementById('evt-data');
    dataInput.value = dt; 
    
    const descInput = document.getElementById('evt-desc');
    descInput.value = '';
    App.idEdicaoEvento = null; 
    
    setTimeout(() => {
        document.getElementById('box-gerir-evento').scrollIntoView({ behavior: 'smooth', block: 'start' });
        descInput.focus();
    }, 100);
};

App.salvarEvento = async () => { 
    // 1. FECHA O TECLADO DO TELEMÓVEL FORÇADAMENTE (EVITA O CORTE DO ECRÃ)
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

        // 2. DELAY ESTRATÉGICO: Aguarda 300ms para o teclado descer
        setTimeout(() => {
            App.renderizarCalendarioPro(); 
            
            // 3. DESLIZA SUAVEMENTE ATÉ À TABELA PARA MOSTRAR O RESULTADO
            setTimeout(() => {
                const tabelaEventos = document.querySelector('.table-responsive-wrapper');
                if(tabelaEventos) tabelaEventos.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }, 100);

        }, 300);

        App.showToast("Evento salvo com sucesso!", "success");

    } catch(e) { App.showToast("Erro ao salvar evento.", "error"); } 
    finally { if(btn) { btn.innerText = txtOrig; btn.disabled = false; } document.body.style.cursor = 'default'; }
};

App.preencherEdicaoEvento = async (id) => { const e = await App.api(`/eventos/${id}`); document.getElementById('evt-data').value=e.data; document.getElementById('evt-tipo').value=e.tipo; document.getElementById('evt-desc').value=e.descricao; document.getElementById('evt-inicio').value=e.inicio; document.getElementById('evt-fim').value=e.fim; App.idEdicaoEvento=id; document.getElementById('box-gerir-evento').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
App.excluirEvento = async (id) => { if(confirm("Excluir?")){ await App.api(`/eventos/${id}`, 'DELETE'); App.renderizarCalendarioPro(); }};
App.limparFormEvento = () => { document.getElementById('evt-desc').value=''; App.idEdicaoEvento=null; };