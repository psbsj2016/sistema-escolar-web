// =========================================================
// MÓDULO PEDAGÓGICO V160 (AJUSTADO: FILTRO DE INATIVOS INTEGRADO)
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
// 1. PLANEAMENTO
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
        // 🛡️ FILTRO: Mostra apenas alunos Ativos
        const alunosAtivos = alunos.filter(a => !a.status || a.status === 'Ativo');
        const opAlunos = `<option value="">-- Selecione --</option>` + alunosAtivos.map(a => `<option value="${a.id}" data-curso="${a.curso}">${a.nome}</option>`).join('');
        
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
    if (document.activeElement) document.activeElement.blur();
    const met = App.planoAtual.id ? 'PUT' : 'POST'; 
    const url = App.planoAtual.id ? `/planejamentos/${App.planoAtual.id}` : `/planejamentos`; 
    if(!App.planoAtual.id) App.planoAtual.id = Date.now().toString(); 
    const btn = document.querySelector('button[onclick="App.salvarPlanejamentoBanco()"]');
    if(btn) { btn.innerText = "A salvar... ⏳"; btn.disabled = true; }
    document.body.style.cursor = 'wait';
    try {
        await App.api(url, met, App.planoAtual); 
        App.showToast("Planeamento Salvo!", "success"); 
        App.renderizarPlanejamentosSalvos(); 
    } catch(e) { App.showToast("Erro ao salvar.", "error"); } 
    finally { if(btn) { btn.innerText = '💾 SALVAR'; btn.disabled = false; } document.body.style.cursor = 'default'; }
};

App.processarAutoAjustePlano = (plano, chamadas) => {
    if (!plano || !plano.aulas) return plano;
    const presencas = chamadas.filter(c => c.idAluno === plano.idAluno && (c.status === 'Presença' || c.status === 'Reposição')).sort((a, b) => new Date(a.data) - new Date(b.data));
    let diasDaSemanaAulas = [];
    if (presencas.length > 0) {
        const ultimas = presencas.slice(-4);
        diasDaSemanaAulas = [...new Set(ultimas.map(p => {
            const [ano, mes, dia] = p.data.split('-');
            return new Date(`${ano}-${mes}-${dia}T12:00:00`).getDay();
        }))];
    }
    if (diasDaSemanaAulas.length === 0) {
        diasDaSemanaAulas = [...new Set(plano.aulas.map(a => {
            const parts = a.data.split('/');
            return parts.length === 3 ? new Date(`${parts[2]}-${parts[1]}-${parts[0]}T12:00:00`).getDay() : -1;
        }).filter(d => d !== -1))];
    }
    if (diasDaSemanaAulas.length === 0) diasDaSemanaAulas = [1]; 
    let presencasUsadas = 0;
    let ultimaDataBase = new Date(); ultimaDataBase.setHours(12, 0, 0, 0);
    for (let i = 0; i < plano.aulas.length; i++) {
        const aula = plano.aulas[i];
        if (presencasUsadas < presencas.length) {
            const [ano, mes, dia] = presencas[presencasUsadas].data.split('-');
            aula.data = `${dia}/${mes}/${ano}`; aula.visto = true;
            ultimaDataBase = new Date(`${ano}-${mes}-${dia}T12:00:00`); presencasUsadas++;
        } else {
            aula.visto = false; ultimaDataBase.setDate(ultimaDataBase.getDate() + 1);
            while (!diasDaSemanaAulas.includes(ultimaDataBase.getDay())) { ultimaDataBase.setDate(ultimaDataBase.getDate() + 1); }
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
    btn.innerHTML = "A analisar... ⏳"; btn.disabled = true;
    try {
        const chamadas = await App.api('/chamadas');
        App.planoAtual = App.processarAutoAjustePlano(App.planoAtual, chamadas);
        App.renderizarTelaEdicao(App.planoAtual);
        App.showToast("Planeamento Ajustado!", "success");
    } catch (e) { App.showToast("Erro.", "error"); } 
    finally { if(btn) { btn.innerHTML = "🤖 AUTO-AJUSTAR"; btn.disabled = false; } }
};

App.excluirPlanejamento = async (id) => { if(confirm("Excluir?")) { await App.api(`/planejamentos/${id}`, 'DELETE'); App.renderizarPlanejamentosSalvos(); } };

// ---------------------------------------------------------
// 2. BOLETIM
// ---------------------------------------------------------
App.renderizarBoletimVisual = async () => {
    App.setTitulo("Boletim Escolar");
    const div = document.getElementById('app-content'); div.innerHTML = 'A carregar...';
    try {
        const alunos = await App.api('/alunos');
        // 🛡️ FILTRO: Apenas alunos ativos
        const alunosAtivos = alunos.filter(a => !a.status || a.status === 'Ativo');
        const opAlunos = `<option value="">-- Selecione o Aluno --</option>` + alunosAtivos.map(a => `<option value="${a.id}">${a.nome}</option>`).join('');
        const formBoletim = `<div style="display:flex; gap:10px; align-items:center;"><select id="bol-aluno" style="flex:1; padding:12px; border:1px solid #ccc; border-radius:5px;">${opAlunos}</select><button onclick="App.gerarBoletimTela()" style="background:#2c3e50; color:white; border:none; padding:12px 25px; border-radius:5px; font-weight:bold; cursor:pointer;">GERAR</button></div>`;
        div.innerHTML = App.UI.card('📄 Emitir Boletim Escolar', '', formBoletim, '800px') + `<div id="boletim-area" style="margin-top:30px;"></div>`;
    } catch(e) { div.innerHTML = "Erro."; }
};

App.gerarBoletimTela = async () => {
    const idAluno = document.getElementById('bol-aluno').value; if(!idAluno) return App.showToast("Selecione.", "error");
    const divArea = document.getElementById('boletim-area'); divArea.innerHTML = 'A gerar...';
    try {
        const [aluno, avaliacoes, chamadas, escola, planejamentos] = await Promise.all([App.api(`/alunos/${idAluno}`), App.api('/avaliacoes'), App.api('/chamadas'), App.api('/escola'), App.api('/planejamentos')]);
        const presencas = chamadas.filter(c => c.idAluno === idAluno && (c.status === 'Presença' || c.status === 'Reposição')).map(c => c.data).sort();
        const primAula = presencas.length > 0 ? presencas[0].split('-').reverse().join('/') : new Date().toLocaleDateString('pt-BR');
        let ultAula = '__/__/____';
        const planoAluno = planejamentos.find(p => p.idAluno === idAluno);
        if (planoAluno && planoAluno.aulas?.length > 0) ultAula = planoAluno.aulas[planoAluno.aulas.length - 1].data;
        const notasAluno = avaliacoes.filter(n => n.idAluno === idAluno); const disciplinasMap = {};
        notasAluno.forEach(n => { const disc = n.disciplina || 'Geral'; if(!disciplinasMap[disc]) disciplinasMap[disc] = { nome: disc, notas: [], total: 0 }; disciplinasMap[disc].notas.push(n); disciplinasMap[disc].total += (parseFloat(n.nota) || 0); });
        let linhasHTML = '';
        if(Object.keys(disciplinasMap).length === 0) linhasHTML = '<tr><td colspan="4" style="text-align:center; padding:15px;">Sem notas lançadas.</td></tr>';
        else Object.keys(disciplinasMap).forEach(chave => {
            const d = disciplinasMap[chave]; const situacao = d.total >= 6 ? '<span style="color:green;">APROVADO</span>' : '<span style="color:orange;">EM CURSO</span>';
            const detalhe = d.notas.map(n => `<span style="font-size:11px;">${n.tipo}: <b>${n.nota}</b></span>`).join(', ');
            linhasHTML += `<tr><td style="padding:10px;">${d.nome}</td><td>${detalhe}</td><td style="text-align:center;"><b>${d.total.toFixed(1)}</b></td><td style="text-align:center;">${situacao}</td></tr>`;
        });
        const logo = escola.foto ? `<img src="${escola.foto}" style="height:60px;">` : '';
        divArea.innerHTML = `<div class="no-print" style="text-align:center; margin-bottom:20px;"><button onclick="window.print()" class="btn-primary">🖨️ IMPRIMIR</button></div><div class="print-sheet" style="background: white; max-width: 210mm; margin: 0 auto; padding: 40px; border-radius: 8px;"><div class="doc-header" style="display:flex; justify-content:space-between; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:20px;"><div style="display:flex; align-items:center; gap:20px;">${logo}<div><h2 style="margin:0;">${escola.nome}</h2><div style="font-size:12px;">CNPJ: ${escola.cnpj}</div></div></div><div style="text-align:right;"><div><b>BOLETIM</b></div><div style="font-size:10px;">${new Date().toLocaleDateString('pt-BR')}</div></div></div><div style="padding:15px; background:#fafafa; border:1px solid #000; margin-bottom:15px;"><div style="font-weight:bold; font-size:16px;">ALUNO: ${aluno.nome.toUpperCase()}</div><div style="font-size:13px;"><b>CURSO:</b> ${aluno.curso || '-'} | <b>TURMA:</b> ${aluno.turma || '-'}</div><div style="display:flex; justify-content:space-between; font-size:12px;"><div>INÍCIO: <b>${primAula}</b></div><div>TÉRMINO: <b>${ultAula}</b></div></div></div><div class="table-responsive-wrapper"><table style="width:100%; border-collapse:collapse; font-size:13px;"><thead><tr style="border-bottom:2px solid #000;"><th style="padding:10px; text-align:left;">DISCIPLINA</th><th style="text-align:left;">AVALIAÇÕES</th><th style="text-align:center;">NOTA</th><th style="text-align:center;">RESULTADO</th></tr></thead><tbody>${linhasHTML}</tbody></table></div></div>`;
    } catch(e) { App.showToast("Erro.", "error"); }
};

// ---------------------------------------------------------
// 3. AVALIAÇÕES E NOTAS
// ---------------------------------------------------------
App.renderizarAvaliacoesPro = async () => {
    App.setTitulo("Avaliações e Notas");
    const div = document.getElementById('app-content'); div.innerHTML = 'A carregar...';
    try {
        const [alunos, turmas, cursos, avaliacoes] = await Promise.all([App.api('/alunos'), App.api('/turmas'), App.api('/cursos'), App.api('/avaliacoes')]);
        App.cacheAlunos = alunos;
        const historico = avaliacoes.sort((a,b) => b.id - a.id);
        // 🛡️ FILTRO: Apenas alunos ativos
        const alunosAtivos = alunos.filter(a => !a.status || a.status === 'Ativo');
        const opTurmas = `<option value="">-- Turma Completa --</option>` + turmas.map(t => `<option value="${t.nome}">${App.escapeHTML(t.nome)}</option>`).join('');
        const opAlunos = `<option value="">-- Aluno Específico --</option>` + alunosAtivos.map(a => `<option value="${a.id}">${App.escapeHTML(a.nome)}</option>`).join('');
        const opCursos = `<option value="Geral">Geral</option>` + cursos.map(c => `<option value="${c.nome}">${App.escapeHTML(c.nome)}</option>`).join('');
        const formFiltros = `<div style="display:flex; gap:15px; flex-wrap:wrap; margin-bottom:15px; background:#f9f9f9; padding:15px; border-radius:8px;">${selectLocal('Turma:', 'nota-turma', opTurmas)}<span style="padding-top:25px;">OU</span>${selectLocal('Aluno:', 'nota-aluno', opAlunos)}</div><div style="display:flex; gap:15px; flex-wrap:wrap; margin-bottom:15px;">${selectLocal('Disciplina:', 'nota-disc', opCursos)}${selectLocal('Tipo:', 'nota-tipo', '<option value="Teste">Teste</option><option value="Prova">Prova</option><option value="Outro">Outro</option>')}</div><div style="display:flex; gap:15px;">${col('Data:', 'nota-data', 'date', new Date().toISOString().split('T')[0])}${col('Máx:', 'nota-max', 'number', '10')}<button onclick="App.carregarListaNotas()" class="btn-primary" style="height:41px;">📋 ABRIR PAUTA</button></div>`;
        const tabelaHistorico = `<div style="background:#fff; padding:10px; margin-bottom:15px; border-radius:8px; border:1px solid #eee;"><input type="text" id="input-busca-notas" placeholder="🔍 Pesquisar..." oninput="App.filtrarHistoricoNotas()" style="width:100%; border:none; outline:none;"></div><div class="table-responsive-wrapper"><table id="tabela-historico-notas" style="width:100%; border-collapse:collapse; font-size:13px;"><thead><tr style="background:#f4f6f7; text-align:left;"><th style="padding:12px;">Aluno</th><th>Data</th><th>Avaliação</th><th style="text-align:center;">Nota</th><th style="text-align:right;">Ações</th></tr></thead><tbody>${historico.map(h => `<tr style="border-bottom:1px solid #eee;"><td style="padding:12px; font-weight:bold;">${App.escapeHTML(h.nomeAluno)}</td><td>${h.data?.split('-').reverse().join('/')}</td><td>${h.tipo}</td><td style="text-align:center;"><b>${h.nota}</b></td><td style="text-align:right;"><button onclick="App.editarAvaliacao('${h.id}')" style="background:none; border:none; cursor:pointer;">✏️</button><button onclick="App.excluirAvaliacao('${h.id}')" style="background:none; border:none; cursor:pointer;">🗑️</button></td></tr>`).join('')}</tbody></table></div>`;
        div.innerHTML = App.UI.card('📝 Notas', '', formFiltros, '100%') + `<div id="area-lista-notas" style="margin-top:20px;"></div>` + '<div style="margin-top:20px;">' + App.UI.card('Histórico', '', tabelaHistorico, '100%') + '</div>';
    } catch(e) { div.innerHTML="Erro."; }
};

App.carregarListaNotas = async () => {
    const turma = document.getElementById('nota-turma').value;
    const idAluno = document.getElementById('nota-aluno').value;
    const disc = document.getElementById('nota-disc').value;
    const data = document.getElementById('nota-data').value;
    const max = document.getElementById('nota-max').value;
    if(!turma && !idAluno) return App.showToast("Selecione.", "warning");
    const area = document.getElementById('area-lista-notas'); area.innerHTML = 'A preparar...';
    try {
        const [alunos, avaliacoes] = await Promise.all([App.api('/alunos'), App.api('/avaliacoes')]);
        let alunosAlvo = idAluno ? alunos.filter(a => a.id === idAluno) : alunos.filter(a => a.turma === turma);
        // 🛡️ FILTRO: Impede inativos de aparecerem na pauta
        alunosAlvo = alunosAlvo.filter(a => !a.status || a.status === 'Ativo');
        if(alunosAlvo.length === 0) { area.innerHTML = '<p>Nenhum aluno ativo.</p>'; return; }
        let linhas = '';
        alunosAlvo.forEach(a => {
            const reg = avaliacoes.find(av => av.idAluno === a.id && av.data === data && av.disciplina === disc);
            linhas += `<tr class="linha-nota" data-id="${a.id}" data-nome="${App.escapeHTML(a.nome)}"><td style="padding:12px;">${App.escapeHTML(a.nome)}</td><td style="width:150px;"><input type="number" class="valor-nota" style="width:100%; text-align:center;" value="${reg?.nota || ''}"></td></tr>`;
        });
        area.innerHTML = `<div class="card" style="border:2px solid #2980b9;"><div class="table-responsive-wrapper"><table style="width:100%;"><thead><tr><th>ALUNO</th><th>NOTA</th></tr></thead><tbody>${linhas}</tbody></table></div><div style="padding:15px; text-align:right;"><button onclick="App.salvarNotasLote()" class="btn-primary">💾 SALVAR NOTAS</button></div></div>`;
    } catch(e) { area.innerHTML = 'Erro.'; }
};

App.salvarNotasLote = async () => {
    const disc = document.getElementById('nota-disc').value; const tipo = document.getElementById('nota-tipo').value;
    const data = document.getElementById('nota-data').value; const max = document.getElementById('nota-max').value;
    const linhas = document.querySelectorAll('.linha-nota');
    try {
        const avaliacoesExistentes = await App.api('/avaliacoes');
        const promessas = [];
        linhas.forEach(l => {
            const idAluno = l.getAttribute('data-id'); const nomeAluno = l.getAttribute('data-nome');
            const nota = l.querySelector('.valor-nota').value; if(nota === '') return;
            const reg = avaliacoesExistentes.find(av => av.idAluno === idAluno && av.data === data && av.disciplina === disc);
            if(reg) promessas.push(App.api(`/avaliacoes/${reg.id}`, 'PUT', {...reg, nota, valorMax: max}));
            else promessas.push(App.api('/avaliacoes', 'POST', {id: Date.now()+Math.random(), idAluno, nomeAluno, disciplina: disc, tipo, data, valorMax: max, nota}));
        });
        await Promise.all(promessas); App.showToast("Salvo!", "success"); App.renderizarAvaliacoesPro();
    } catch(e) { App.showToast("Erro.", "error"); }
};

App.excluirAvaliacao = async (id) => { if(confirm("Excluir?")) { await App.api(`/avaliacoes/${id}`, 'DELETE'); App.renderizarAvaliacoesPro(); }};
App.editarAvaliacao = async (id) => { 
    const n = await App.api(`/avaliacoes/${id}`); 
    document.getElementById('nota-aluno').value = n.idAluno; document.getElementById('nota-disc').value = n.disciplina || 'Geral';
    document.getElementById('nota-data').value = n.data; App.carregarListaNotas(); 
};

App.filtrarHistoricoNotas = () => {
    const termo = document.getElementById('input-busca-notas').value.toLowerCase();
    document.querySelectorAll('#tabela-historico-notas tbody tr').forEach(l => l.style.display = l.innerText.toLowerCase().includes(termo) ? '' : 'none');
};

// ---------------------------------------------------------
// 4. CHAMADA
// ---------------------------------------------------------
App.renderizarChamadaPro = async () => { 
    App.setTitulo("Controlo de Presença");
    const div = document.getElementById('app-content'); div.innerHTML = 'A carregar...';
    try { 
        const [alunos, turmas, chamadas] = await Promise.all([App.api('/alunos'), App.api('/turmas'), App.api('/chamadas')]); 
        const historico = chamadas.sort((a,b) => new Date(b.data) - new Date(a.data));
        // 🛡️ FILTRO: Apenas alunos ativos
        const alunosAtivos = alunos.filter(a => !a.status || a.status === 'Ativo');
        const opTurmas = `<option value="">-- Turma --</option>` + turmas.map(t => `<option value="${t.nome}">${App.escapeHTML(t.nome)}</option>`).join('');
        const opAlunos = `<option value="">-- Aluno --</option>` + alunosAtivos.map(a => `<option value="${a.id}">${App.escapeHTML(a.nome)}</option>`).join('');
        const formChamada = `<div style="display:flex; gap:15px; flex-wrap:wrap; margin-bottom:15px; background:#f9f9f9; padding:15px;">${selectLocal('Turma:', 'ch-turma', opTurmas)}<span>OU</span>${selectLocal('Aluno:', 'ch-aluno', opAlunos)}</div><div style="display:flex; gap:15px;">${col('Data:', 'ch-data', 'date', new Date().toISOString().split('T')[0])}${col('Duração:', 'ch-duracao', 'time', '01:00')}<button onclick="App.carregarListaChamada()" class="btn-primary">📋 ABRIR CHAMADA</button></div>`;
        const tabelaChamada = `<div style="background:#fff; padding:10px; margin-bottom:15px; border-radius:8px; border:1px solid #eee;"><input type="text" id="input-busca-chamada" placeholder="🔍 Pesquisar..." oninput="App.filtrarHistoricoChamada()" style="width:100%; border:none; outline:none;"></div><div class="table-responsive-wrapper"><table id="tabela-historico-chamadas" style="width:100%; border-collapse:collapse; font-size:13px;"><thead><tr style="background:#f4f6f7;"><th>Data</th><th>Aluno</th><th>Status</th><th style="text-align:right;">Ações</th></tr></thead><tbody>${historico.map(h => `<tr style="border-bottom:1px solid #eee;"><td>${h.data.split('-').reverse().join('/')}</td><td style="font-weight:bold;">${App.escapeHTML(h.nomeAluno)}</td><td style="color:${h.status==='Falta'?'red':'green'}">${h.status}</td><td style="text-align:right;"><button onclick="App.excluirLancamentoChamada('${h.id}')" style="background:none; border:none; cursor:pointer;">🗑️</button></td></tr>`).join('')}</tbody></table></div>`;
        div.innerHTML = App.UI.card('📝 Chamada', '', formChamada, '100%') + `<div id="area-lista-chamada" style="margin-top:20px;"></div>` + '<div style="margin-top:20px;">' + App.UI.card('Histórico', '', tabelaChamada, '100%') + '</div>';
    } catch(e) { div.innerHTML = "Erro."; } 
};

App.carregarListaChamada = async () => {
    const turma = document.getElementById('ch-turma').value;
    const idAluno = document.getElementById('ch-aluno').value;
    const data = document.getElementById('ch-data').value;
    if(!turma && !idAluno) return App.showToast("Selecione.", "warning");
    const area = document.getElementById('area-lista-chamada'); area.innerHTML = 'A preparar...';
    try {
        const [alunos, chamadas] = await Promise.all([App.api('/alunos'), App.api('/chamadas')]);
        let alunosAlvo = idAluno ? alunos.filter(a => a.id === idAluno) : alunos.filter(a => a.turma === turma);
        // 🛡️ FILTRO: Impede inativos de aparecerem na grelha de chamada
        alunosAlvo = alunosAlvo.filter(a => !a.status || a.status === 'Ativo');
        if(alunosAlvo.length === 0) { area.innerHTML = '<p>Nenhum aluno ativo.</p>'; return; }
        let linhas = '';
        alunosAlvo.forEach(a => {
            const reg = chamadas.find(c => c.idAluno === a.id && c.data === data);
            const status = reg ? reg.status : 'Presença';
            linhas += `<tr class="linha-chamada" data-id="${a.id}" data-nome="${App.escapeHTML(a.nome)}"><td style="padding:12px;">${App.escapeHTML(a.nome)}</td><td><select class="status-chamada"><option value="Presença" ${status==='Presença'?'selected':''}>✅ Presença</option><option value="Falta" ${status==='Falta'?'selected':''}>❌ Falta</option></select></td></tr>`;
        });
        area.innerHTML = `<div class="card" style="border:2px solid #27ae60;"><div class="table-responsive-wrapper"><table style="width:100%;"><thead><tr><th>NOME</th><th>STATUS</th></tr></thead><tbody>${linhas}</tbody></table></div><div style="padding:15px; text-align:right;"><button onclick="App.salvarChamadaLote()" class="btn-primary">💾 SALVAR CHAMADA</button></div></div>`;
    } catch(e) { area.innerHTML = 'Erro.'; }
};

App.salvarChamadaLote = async () => {
    const data = document.getElementById('ch-data').value; const duracao = document.getElementById('ch-duracao').value;
    const linhas = document.querySelectorAll('.linha-chamada');
    try {
        const chamadasExistentes = await App.api('/chamadas'); const planejamentos = await App.api('/planejamentos');
        const promessas = [];
        linhas.forEach(l => {
            const idAluno = l.getAttribute('data-id'); const nomeAluno = l.getAttribute('data-nome');
            const status = l.querySelector('.status-chamada').value;
            const reg = chamadasExistentes.find(c => c.idAluno === idAluno && c.data === data);
            if(reg) promessas.push(App.api(`/chamadas/${reg.id}`, 'PUT', {...reg, status}));
            else promessas.push(App.api('/chamadas', 'POST', {id: Date.now()+Math.random(), idAluno, nomeAluno, data, status, duracao}));
            
            // Auto-ajuste de planeamento
            let plano = planejamentos.find(p => p.idAluno === idAluno);
            if(plano && typeof App.processarAutoAjustePlano === 'function') {
                 plano = App.processarAutoAjustePlano(plano, [...chamadasExistentes, {idAluno, status, data}]);
                 promessas.push(App.api(`/planejamentos/${plano.id}`, 'PUT', plano));
            }
        });
        await Promise.all(promessas); App.showToast("Salvo!", "success"); App.renderizarChamadaPro();
    } catch(e) { App.showToast("Erro.", "error"); }
};

App.excluirLancamentoChamada = async (id) => { if(confirm("Excluir?")) { await App.api(`/chamadas/${id}`, 'DELETE'); App.renderizarChamadaPro(); } };
App.filtrarHistoricoChamada = () => {
    const termo = document.getElementById('input-busca-chamada').value.toLowerCase();
    document.querySelectorAll('#tabela-historico-chamadas tbody tr').forEach(l => l.style.display = l.innerText.toLowerCase().includes(termo) ? '' : 'none');
};

// ---------------------------------------------------------
// 5. CALENDÁRIO
// ---------------------------------------------------------
App.renderizarCalendarioPro = async () => { 
    App.setTitulo("Calendário");
    const div = document.getElementById('app-content'); div.innerHTML = 'A carregar...'; 
    if (!App.calendarState) App.calendarState = { month: new Date().getMonth(), year: new Date().getFullYear() }; 
    try { 
        const eventos = await App.api('/eventos'); 
        const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']; 
        const mesNome = meses[App.calendarState.month]; const ano = App.calendarState.year; 
        const gridCalendario = `<div style="display:flex; justify-content:space-between; margin-bottom:20px;"><button onclick="App.mudarMes(-1)">◀</button><h2>${mesNome} ${ano}</h2><button onclick="App.mudarMes(1)">▶</button></div><div id="calendar-grid" style="display:grid; grid-template-columns:repeat(7,1fr); gap:2px; background:#eee;">${App.gerarDiasCalendario(App.calendarState.month, App.calendarState.year, eventos)}</div>`;
        const formEvento = `<div id="box-gerir-evento"><h3>Gerir Evento</h3><div style="display:flex; gap:10px; flex-wrap:wrap;">${col('Data:', 'evt-data', 'date')}${selectLocal('Tipo:', 'evt-tipo', '<option value="Evento">Evento</option><option value="Feriado">Feriado</option>')}${col('Desc:', 'evt-desc', 'text')}</div><button onclick="App.salvarEvento()" class="btn-primary" style="margin-top:10px;">Salvar</button></div>`;
        div.innerHTML = App.UI.card('', '', gridCalendario, '100%') + App.UI.card('', '', formEvento, '100%'); 
    } catch(e) { div.innerHTML = "Erro."; } 
};

App.gerarDiasCalendario = (mes, ano, eventos) => { 
    const startDay = new Date(ano, mes, 1).getDay(); const daysInMonth = new Date(ano, mes + 1, 0).getDate(); 
    let html = ''; for(let i=0; i<startDay; i++) html += `<div class="cal-day empty"></div>`;
    for(let d=1; d<=daysInMonth; d++){ 
        const dataISO = `${ano}-${String(mes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; 
        const evs = eventos.filter(e => e.data === dataISO); 
        html += `<div class="cal-day" onclick="App.selecionarDia('${dataISO}')"><div class="dia-num">${d}</div>${evs.map(e=>`<div class="evt-pilula" style="background:${(EVENTO_CORES[e.tipo]||{}).bg}">${e.descricao}</div>`).join('')}</div>`; 
    } 
    return html; 
};

App.mudarMes = (d) => { App.calendarState.month+=d; if(App.calendarState.month>11){App.calendarState.month=0;App.calendarState.year++}else if(App.calendarState.month<0){App.calendarState.month=11;App.calendarState.year--}; App.renderizarCalendarioPro(); };
App.selecionarDia = (dt) => { document.getElementById('evt-data').value = dt; document.getElementById('evt-desc').focus(); };
App.salvarEvento = async () => { 
    const pl = { data: document.getElementById('evt-data').value, tipo: document.getElementById('evt-tipo').value, descricao: document.getElementById('evt-desc').value }; 
    if(!pl.data || !pl.descricao) return; 
    try { await App.api('/eventos', 'POST', pl); App.renderizarCalendarioPro(); App.showToast("Salvo!", "success"); } catch(e) { App.showToast("Erro.", "error"); }
};