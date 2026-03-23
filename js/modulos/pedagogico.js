// =========================================================
// MÓDULO PEDAGÓGICO V158 (BLINDADO CONTRA CACHE: FOLHA A4 E GRID)
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
            listaAulas.push({ num: contador, data: dataAtual.toLocaleDateString('pt-BR'), hora: horario, duracao: duracao, conteudo: '', visto: false }); 
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
        notasAluno.forEach(n => { const disc = n.disciplina || 'Geral'; if(!disciplinasMap[disc]) disciplinasMap[disc] = { nome: disc, notas: [], total: 0 }; disciplinasMap[disc].notas.push(n); disciplinasMap[disc].total += parseFloat(n.nota); });
        
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
        html += `<div style="background:#f9f9f9; min-height:90px;"></div>`; 
    }
    
    for(let d=1; d<=daysInMonth; d++){ 
        const dataISO = `${ano}-${String(mes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; 
        const hojeObj = new Date();
        const isHoje = (d === hojeObj.getDate() && mes === hojeObj.getMonth() && ano === hojeObj.getFullYear()); 
        
        const evs = eventos.filter(e => e.data === dataISO); 
        // As "Pílulas" coloridas restauradas com estilos inline
        const tags = evs.map(e => `<div style="background:${(EVENTO_CORES[e.tipo]||EVENTO_CORES['Evento']).bg}; color:#fff; font-size:10px; padding:3px 5px; border-radius:4px; margin-bottom:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${e.descricao}">${e.descricao}</div>`).join(''); 
        
        // Desenha a célula do dia
        html += `<div id="cal-day-${dataISO}" class="cal-day" onclick="App.selecionarDia('${dataISO}')" style="background:${isHoje ? '#eafaf1' : '#fff'}; min-height:90px; padding:5px; cursor:pointer; border-top:${isHoje ? '4px solid #27ae60' : 'none'};">
                    <div style="text-align:right; font-weight:bold; font-size:13px; color:${isHoje ? '#27ae60' : '#555'}; margin-bottom:5px;">${d}</div>
                    ${tags}
                 </div>`; 
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