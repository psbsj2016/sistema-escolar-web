// =========================================================
// MÓDULO PEDAGÓGICO V112 (PLANEJAMENTO: TOTAL SÓ NO FINAL)
// =========================================================

const EVENTO_CORES = { 'Evento': {bg:'#2ecc71',text:'#fff'}, 'Feriado': {bg:'#e74c3c',text:'#fff'}, 'Prova': {bg:'#3498db',text:'#fff'}, 'Reunião': {bg:'#f39c12',text:'#fff'} };

// ---------------------------------------------------------
// 1. PLANEJAMENTO
// ---------------------------------------------------------
App.renderizarPlanejamentoPro = () => {
    const div = document.getElementById('app-content');
    div.innerHTML = `<div class="card" style="text-align:center; padding:50px;"><h2 style="color:#2c3e50; margin-bottom:10px;">Planejamento Pedagógico</h2><p style="color:#7f8c8d; margin-bottom:40px;">Gerencie o conteúdo programático e controle de aulas.</p><div style="display:flex; justify-content:center; gap:30px; flex-wrap:wrap;"><div onclick="App.renderizarNovoPlanejamento()" style="cursor:pointer; background:white; border:2px solid #eee; padding:30px; border-radius:15px; width:250px; transition:0.3s; box-shadow:0 5px 15px rgba(0,0,0,0.05);" onmouseover="this.style.borderColor='#3498db';this.style.transform='translateY(-5px)'" onmouseout="this.style.borderColor='#eee';this.style.transform='translateY(0)'"><div style="font-size:50px; margin-bottom:15px;">📝</div><h3 style="margin:0; color:#3498db;">Novo Planejamento</h3><p style="font-size:13px; color:#999; margin-top:5px;">Gerar grade do zero</p></div><div onclick="App.renderizarPlanejamentosSalvos()" style="cursor:pointer; background:white; border:2px solid #eee; padding:30px; border-radius:15px; width:250px; transition:0.3s; box-shadow:0 5px 15px rgba(0,0,0,0.05);" onmouseover="this.style.borderColor='#27ae60';this.style.transform='translateY(-5px)'" onmouseout="this.style.borderColor='#eee';this.style.transform='translateY(0)'"><div style="font-size:50px; margin-bottom:15px;">📂</div><h3 style="margin:0; color:#27ae60;">Planejamentos Salvos</h3><p style="font-size:13px; color:#999; margin-top:5px;">Editar e acompanhar</p></div></div></div>`;
};

App.renderizarNovoPlanejamento = async () => {
    const div = document.getElementById('app-content'); div.innerHTML = 'Carregando...';
    try {
        const alunos = await fetch(`${API_URL}/alunos`).then(r => r.json());
        div.innerHTML = `<div class="card" style="max-width: 800px; margin: 0 auto; padding: 30px;"><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;"><h3 style="margin:0; color:#2c3e50;">Configurar Novo Cronograma</h3><button onclick="App.renderizarPlanejamentoPro()" style="background:#ddd; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">Voltar</button></div><div style="background:#f9f9f9; padding:20px; border-radius:8px; border:1px solid #eee;"><label style="font-weight:bold; display:block; margin-bottom:5px;">Aluno:</label><select id="plan-aluno" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; margin-bottom:15px;"><option value="">-- Selecione --</option>${alunos.map(a => `<option value="${a.id}" data-curso="${a.curso}">${a.nome}</option>`).join('')}</select><div style="display:flex; gap:20px; margin-bottom:15px;"><div style="flex:1;"><label style="font-size:12px; font-weight:bold; color:#666;">Início:</label><input type="date" id="plan-inicio" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;"></div><div style="flex:1;"><label style="font-size:12px; font-weight:bold; color:#666;">Total Aulas:</label><input type="number" id="plan-qtd" value="10" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;"></div></div><div style="display:flex; gap:20px; margin-bottom:15px;"><div style="flex:1;"><label style="font-size:12px; font-weight:bold; color:#666;">Horário:</label><input type="time" id="plan-hora" value="08:00" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;"></div><div style="flex:1;"><label style="font-size:12px; font-weight:bold; color:#666;">Duração:</label><input type="time" id="plan-duracao" value="01:00" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;"></div></div><label style="font-size:12px; font-weight:bold; color:#666; display:block; margin-bottom:8px;">Dias:</label><div style="display:flex; gap:10px; flex-wrap:wrap; background:white; padding:10px; border:1px solid #ddd; border-radius:5px;"><label><input type="checkbox" class="plan-dia" value="1"> Seg</label><label><input type="checkbox" class="plan-dia" value="2"> Ter</label><label><input type="checkbox" class="plan-dia" value="3"> Qua</label><label><input type="checkbox" class="plan-dia" value="4"> Qui</label><label><input type="checkbox" class="plan-dia" value="5"> Sex</label><label><input type="checkbox" class="plan-dia" value="6"> Sáb</label></div></div><button onclick="App.gerarGridEditavel()" style="width:100%; margin-top:20px; padding:15px; background:#3498db; color:white; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">CRIAR TABELA</button></div>`;
    } catch(e) { div.innerHTML = "Erro."; }
};

App.renderizarPlanejamentosSalvos = async () => {
    const div = document.getElementById('app-content'); div.innerHTML = 'Carregando...';
    try {
        const planos = await fetch(`${API_URL}/planejamentos`).then(r => r.json());
        if(planos.length === 0) { div.innerHTML = `<div class="card" style="text-align:center; padding:40px;"><h3>Nenhum planejamento salvo.</h3><button onclick="App.renderizarPlanejamentoPro()" class="btn-primary">Voltar</button></div>`; return; }
        div.innerHTML = `<div class="card"><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;"><h3 style="margin:0;">Salvos</h3><button onclick="App.renderizarPlanejamentoPro()" style="background:#ddd; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">Voltar</button></div><table><thead><tr><th>Aluno</th><th>Curso</th><th>Aulas</th><th>Ações</th></tr></thead><tbody>${planos.map(p => `<tr><td>${p.nomeAluno}</td><td>${p.curso}</td><td>${p.aulas.length}</td><td><button onclick="App.abrirPlanejamentoEditavel('${p.id}')" style="background:#f39c12; color:white; border:none; padding:5px 10px; border-radius:4px; margin-right:5px;">✏️</button><button onclick="App.excluirPlanejamento('${p.id}')" style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:4px;">🗑️</button></td></tr>`).join('')}</tbody></table></div>`;
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
    if(!dataInicio || dias.length === 0) return alert("Preencha dados.");
    const listaAulas = []; let dataAtual = new Date(dataInicio + 'T00:00:00'); let contador = 0;
    while(contador < qtdAulas) { if(dias.includes(dataAtual.getDay())) { contador++; listaAulas.push({ num: contador, data: dataAtual.toLocaleDateString('pt-BR'), hora: horario, duracao: duracao, conteudo: '', visto: false }); } dataAtual.setDate(dataAtual.getDate() + 1); }
    App.renderizarTelaEdicao({ id: null, idAluno, nomeAluno, curso: cursoAluno, aulas: listaAulas });
};

App.abrirPlanejamentoEditavel = async (id) => { try { const plano = await fetch(`${API_URL}/planejamentos/${id}`).then(r => r.json()); App.renderizarTelaEdicao(plano); } catch(e) { alert("Erro."); } };

App.renderizarTelaEdicao = (plano) => {
    App.planoAtual = plano; const div = document.getElementById('app-content');
    
    // Cálculo da Carga Horária Total
    let totalMinutos = 0;
    plano.aulas.forEach(aula => {
        const [h, m] = aula.duracao.split(':').map(Number);
        totalMinutos += (h * 60) + m;
    });
    const totalHoras = (totalMinutos / 60).toFixed(0);

    const escola = JSON.parse(localStorage.getItem('escola_perfil')) || {}; const logo = escola.foto ? `<img src="${escola.foto}" style="height:50px;">` : '';
    
    div.innerHTML = `
        <div class="no-print" style="margin-bottom:20px; text-align:center; background:#f4f4f4; padding:15px; border-radius:10px;">
            <button onclick="App.salvarPlanejamentoBanco()" style="background:#27ae60; color:white; padding:10px 20px; border:none; border-radius:5px; margin-right:10px; font-weight:bold; cursor:pointer;">💾 SALVAR</button>
            <button onclick="window.print()" style="background:#3498db; color:white; padding:10px 20px; border:none; border-radius:5px; margin-right:10px; font-weight:bold; cursor:pointer;">🖨️ IMPRIMIR</button>
            <button onclick="App.renderizarPlanejamentosSalvos()" style="background:#7f8c8d; color:white; padding:10px 20px; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">FECHAR</button>
        </div>
        <div class="print-sheet">
            <div class="doc-header">
                <div style="display:flex; align-items:center; gap:15px;">${logo}<div><h2 style="margin:0; text-transform:uppercase; font-size:18px;">${escola.nome||'ESCOLA'}</h2><div style="font-size:12px;">CNPJ: ${escola.cnpj||''}</div></div></div>
                <div style="text-align:right;"><div><b>Planejamento Pedagógico</b></div><div style="font-size:12px;">Emissão: ${new Date().toLocaleDateString('pt-BR')}</div></div>
            </div>

            <div style="border:1px solid #000; padding:10px; font-size:12px; margin-bottom:15px;">
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

            <table class="doc-table">
                <thead>
                    <tr>
                        <th style="width:5%;">Nº</th>
                        <th style="width:12%;">DATA</th>
                        <th style="width:10%;">HORÁRIO</th>
                        <th style="width:10%;">DURAÇÃO</th>
                        <th>CONTEÚDO / OBS</th>
                        <th style="width:5%;">OK</th>
                    </tr>
                </thead>
                <tbody>
                    ${plano.aulas.map((a,i)=>`
                    <tr>
                        <td style="text-align:center;">${a.num}</td>
                        <td><input class="plan-input-print" style="text-align:center;" value="${a.data}" onchange="App.atualizarAula(${i},'data',this.value)"></td>
                        <td><input class="plan-input-print" style="text-align:center;" value="${a.hora}" onchange="App.atualizarAula(${i},'hora',this.value)"></td>
                        <td><input class="plan-input-print" style="text-align:center;" value="${a.duracao}" onchange="App.atualizarAula(${i},'duracao',this.value)"></td>
                        <td><input class="plan-input-print" placeholder="..." value="${a.conteudo}" onchange="App.atualizarAula(${i},'conteudo',this.value)"></td>
                        <td style="text-align:center;"><input type="checkbox" ${a.visto?'checked':''} onchange="App.atualizarAula(${i},'visto',this.checked)"></td>
                    </tr>`).join('')}
                    
                    <tr style="background:#eee; font-weight:bold; border-top:2px solid #000;">
                        <td colspan="3" style="text-align:right; padding-right:10px;">Carga Horária Total =</td>
                        <td style="text-align:center;">${totalHoras}H</td>
                        <td colspan="2"></td>
                    </tr>
                </tbody>
            </table>
            
            <div style="margin-top:50px; display:flex; justify-content:space-between; text-align:center;">
                <div style="width:40%; border-top:1px solid #000; padding-top:5px; font-size:12px;">COORDENAÇÃO</div>
                <div style="width:40%; border-top:1px solid #000; padding-top:5px; font-size:12px;">ALUNO</div>
            </div>
        </div>`;
};

App.atualizarAula = (i,c,v) => { if(App.planoAtual && App.planoAtual.aulas[i]) App.planoAtual.aulas[i][c]=v; };
App.salvarPlanejamentoBanco = async () => { if(!App.planoAtual) return; const met = App.planoAtual.id ? 'PUT' : 'POST'; const url = App.planoAtual.id ? `${API_URL}/planejamentos/${App.planoAtual.id}` : `${API_URL}/planejamentos`; if(!App.planoAtual.id) App.planoAtual.id = Date.now().toString(); await fetch(url, {method:met, headers:{'Content-Type':'application/json'}, body:JSON.stringify(App.planoAtual)}); alert("Salvo!"); App.renderizarPlanejamentosSalvos(); };
App.excluirPlanejamento = async (id) => { if(confirm("Excluir?")) { await fetch(`${API_URL}/planejamentos/${id}`, {method:'DELETE'}); App.renderizarPlanejamentosSalvos(); } };

// ---------------------------------------------------------
// 2. BOLETIM (MANTIDO)
// ---------------------------------------------------------
App.renderizarBoletimVisual = async () => {
    const div = document.getElementById('app-content'); div.innerHTML = 'Carregando...';
    try {
        const alunos = await fetch(`${API_URL}/alunos`).then(r => r.json());
        div.innerHTML = `<div class="card" style="padding: 30px; max-width: 800px; margin: 0 auto;"><h3 style="margin-top:0; color:#2c3e50;">📄 Emitir Boletim Escolar</h3><div style="display:flex; gap:10px; align-items:center;"><select id="bol-aluno" style="flex:1; padding:12px; border:1px solid #ccc; border-radius:5px;"><option value="">-- Selecione --</option>${alunos.map(a => `<option value="${a.id}">${a.nome}</option>`).join('')}</select><button onclick="App.gerarBoletimTela()" style="background:#2c3e50; color:white; border:none; padding:12px 25px; border-radius:5px; font-weight:bold; cursor:pointer;">GERAR</button></div></div><div id="boletim-area" style="margin-top:30px;"></div>`;
    } catch(e) { div.innerHTML = "Erro."; }
};

App.gerarBoletimTela = async () => {
    const idAluno = document.getElementById('bol-aluno').value; if(!idAluno) return alert("Selecione um aluno.");
    const divArea = document.getElementById('boletim-area'); divArea.innerHTML = 'Gerando boletim...';
    try {
        const [aluno, avaliacoes, chamadas, escola, planejamentos] = await Promise.all([
            fetch(`${API_URL}/alunos/${idAluno}`).then(r => r.json()), 
            fetch(`${API_URL}/avaliacoes`).then(r => r.json()), 
            fetch(`${API_URL}/chamadas`).then(r => r.json()), 
            fetch(`${API_URL}/escola`).then(r => r.json()),
            fetch(`${API_URL}/planejamentos`).then(r => r.json())
        ]);
        
        const presencas = chamadas.filter(c => c.idAluno === idAluno && (c.status === 'Presença' || c.status === 'Reposição')).map(c => c.data).sort();
        const primAula = presencas.length > 0 ? presencas[0].split('-').reverse().join('/') : new Date().toLocaleDateString('pt-BR');
        
        let ultAula = '__/__/____';
        const planoAluno = planejamentos.find(p => p.idAluno === idAluno);
        if (planoAluno && planoAluno.aulas && planoAluno.aulas.length > 0) {
            ultAula = planoAluno.aulas[planoAluno.aulas.length - 1].data;
        } else if (presencas.length > 0) {
            ultAula = presencas[presencas.length - 1].split('-').reverse().join('/');
        }

        const notasAluno = avaliacoes.filter(n => n.idAluno === idAluno); const disciplinasMap = {};
        notasAluno.forEach(n => { const disc = n.disciplina || 'Geral'; if(!disciplinasMap[disc]) disciplinasMap[disc] = { nome: disc, notas: [], total: 0 }; disciplinasMap[disc].notas.push(n); disciplinasMap[disc].total += parseFloat(n.nota); });
        
        let linhasHTML = '';
        if(Object.keys(disciplinasMap).length === 0) linhasHTML = '<tr><td colspan="4" style="text-align:center; padding:15px;">Sem notas lançadas.</td></tr>';
        else Object.keys(disciplinasMap).forEach(chave => {
            const d = disciplinasMap[chave];
            const situacao = d.total >= 6 ? '<span style="color:green; font-weight:bold;">APROVADO</span>' : '<span style="color:orange;">EM CURSO</span>';
            const detalhe = d.notas.map(n => `<span style="font-size:11px;">${n.tipo}: <b>${n.nota}</b></span>`).join(', ');
            linhasHTML += `<tr><td>${d.nome}</td><td>${detalhe}</td><td style="text-align:center;"><b>${d.total.toFixed(1)}</b></td><td style="text-align:center;">${situacao}</td></tr>`;
        });

        const logo = escola.foto ? `<img src="${escola.foto}" style="height:60px; object-fit:contain;">` : '';
        const dataHoje = new Date().toLocaleDateString('pt-BR');

        divArea.innerHTML = `
            <div class="no-print" style="text-align:center; margin-bottom:20px;"><button onclick="window.print()" class="btn-primary">🖨️ IMPRIMIR BOLETIM</button></div>
            <div class="print-sheet">
                <div class="doc-header">
                    <div style="display:flex; align-items:center; gap:20px;">${logo}<div><h2 style="margin:0; text-transform:uppercase;">${escola.nome}</h2><div style="font-size:12px;">CNPJ: ${escola.cnpj}</div></div></div>
                    <div style="text-align:right;"><div><b>BOLETIM ESCOLAR</b></div><div style="font-size:10px; color:#999;">Emissão: ${dataHoje}</div></div>
                </div>
                <div style="padding:15px; background:#eee; border:1px solid #000; margin-bottom:15px;">
                    <div style="font-weight:bold; font-size:16px; margin-bottom:5px;">ALUNO: ${aluno.nome.toUpperCase()}</div>
                    <div style="font-size:13px; margin-bottom:10px;">
                        <b>CURSO:</b> ${aluno.curso || '-'} &nbsp;&nbsp;|&nbsp;&nbsp; <b>TURMA:</b> ${aluno.turma || '-'}
                    </div>
                    <div style="display:flex; justify-content:space-between; border-top:1px solid #ccc; padding-top:5px; font-size:12px;">
                        <div>INÍCIO DAS AULAS: <b>${primAula}</b></div>
                        <div>PREVISÃO DE TÉRMINO: <b>${ultAula}</b></div>
                    </div>
                </div>
                <table class="doc-table"><thead><tr><th>DISCIPLINA</th><th>AVALIAÇÕES</th><th style="text-align:center;">NOTA</th><th style="text-align:center;">RESULTADO</th></tr></thead><tbody>${linhasHTML}</tbody></table>
                <div style="padding:40px 30px; text-align:center;"><div style="width:300px; margin:0 auto; border-top:1px solid #333; padding-top:5px; font-size:12px;">Coordenação Pedagógica</div></div>
            </div>`;
    } catch(e) { console.error(e); divArea.innerHTML = "<p style='color:red; text-align:center;'>Erro ao gerar boletim.</p>"; }
};

// ---------------------------------------------------------
// 3. AVALIAÇÕES (MANTIDO)
// ---------------------------------------------------------
App.renderizarAvaliacoesPro = async () => {
    const div = document.getElementById('app-content'); div.innerHTML = 'Carregando...';
    try {
        const [alunos, avaliacoes] = await Promise.all([fetch(`${API_URL}/alunos`).then(r=>r.json()), fetch(`${API_URL}/avaliacoes`).then(r=>r.json())]);
        App.cacheAlunos = alunos;
        const historico = avaliacoes.sort((a,b) => b.id - a.id);
        div.innerHTML = `<div class="card" style="padding: 25px; margin-bottom: 25px;"><h3 style="margin-top:0; color:#2c3e50;">📝 Lançamento de Notas</h3><div style="display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-end; margin-bottom: 15px;"><div style="flex: 1; min-width: 250px;"><label style="font-weight:bold; font-size:12px; color:#555;">Selecione o Aluno:</label><select id="av-aluno" onchange="App.carregarCursoDoAluno()" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;"><option value="">-- Selecione --</option>${alunos.map(a => `<option value="${a.id}">${a.nome}</option>`).join('')}</select></div><div style="flex: 1; min-width: 250px;"><label style="font-weight:bold; font-size:12px; color:#555;">Curso / Disciplina:</label><select id="av-curso" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; background:#f9f9f9;"><option value="">(Selecione o aluno primeiro)</option></select></div></div><div style="display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-end; margin-bottom: 15px;"><div style="flex: 1; min-width: 150px;"><label style="font-weight:bold; font-size:12px; color:#555;">Tipo de Avaliação:</label><select id="av-tipo" onchange="App.toggleTipoOutro()" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;"><option value="Teste">Teste</option><option value="Prova">Prova</option><option value="Pesquisa">Pesquisa</option><option value="Trabalho">Trabalho</option><option value="Outro">Outro (Especificar)</option></select></div><div id="div-outro" style="flex: 1; min-width: 150px; display:none;"><label style="font-weight:bold; font-size:12px; color:#555;">Especifique:</label><input type="text" id="av-outro-desc" placeholder="Ex: Seminário" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;"></div><div style="flex: 1; min-width: 100px;"><label style="font-weight:bold; font-size:12px; color:#555;">Valor (Max):</label><input type="number" id="av-valor-max" value="10" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;"></div><div style="flex: 1; min-width: 100px;"><label style="font-weight:bold; font-size:12px; color:#555;">Nota Obtida:</label><input type="number" id="av-nota" placeholder="0.0" step="0.1" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; border-left: 4px solid #2ecc71;"></div></div><div style="display:flex; gap:10px;"><select id="av-bimestre" style="width:150px; padding:10px; border:1px solid #ccc; border-radius:5px;"><option>1º Bimestre</option><option>2º Bimestre</option><option>3º Bimestre</option><option>4º Bimestre</option></select><button onclick="App.salvarAvaliacaoDetalhada()" style="flex:1; background:#2980b9; color:white; border:none; padding:12px; border-radius:5px; font-weight:bold; cursor:pointer;">LANÇAR NOTA</button></div></div><div class="card"><h3 style="margin:0 0 15px 0; color:#555; font-size:16px;">Histórico de Notas Lançadas</h3><table style="width:100%; border-collapse:collapse; font-size:13px;"><thead><tr style="background:#f4f6f7; color:#7f8c8d; text-align:left; text-transform:uppercase; font-size:11px;"><th style="padding:12px;">Aluno</th><th style="padding:12px;">Curso/Disc.</th><th style="padding:12px;">Avaliação</th><th style="padding:12px;">Bimestre</th><th style="padding:12px; text-align:center;">Nota / Valor</th><th style="padding:12px; text-align:right;">Ações</th></tr></thead><tbody>${historico.length === 0 ? '<tr><td colspan="6" style="padding:20px; text-align:center; color:#999;">Nenhuma nota lançada.</td></tr>' : ''}${historico.map(h => `<tr style="border-bottom:1px solid #eee;"><td style="padding:12px; font-weight:bold;">${h.nomeAluno}</td><td style="padding:12px; color:#555;">${h.disciplina || '-'}</td><td style="padding:12px;">${h.tipo} <span style="font-size:10px; color:#999;">(${h.descricao || ''})</span></td><td style="padding:12px;">${h.bimestre}</td><td style="padding:12px; text-align:center;"><strong style="color:${parseFloat(h.nota) >= parseFloat(h.valorMax)*0.6 ? '#27ae60' : '#c0392b'}">${h.nota}</strong> <span style="color:#999; font-size:11px;">/ ${h.valorMax}</span></td><td style="padding:12px; text-align:right;"><button onclick="App.editarAvaliacao('${h.id}')" style="background:#f39c12; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer; margin-right:5px;">✏️</button><button onclick="App.excluirAvaliacao('${h.id}')" style="background:#e74c3c; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer;">🗑️</button></td></tr>`).join('')}</tbody></table></div>`;
    } catch(e) { div.innerHTML="Erro."; }
};

App.carregarCursoDoAluno = () => {
    const id = document.getElementById('av-aluno').value;
    const select = document.getElementById('av-curso');
    select.innerHTML = ''; 
    if(!id) { select.innerHTML = '<option>(Selecione um aluno)</option>'; return; }
    const aluno = App.cacheAlunos ? App.cacheAlunos.find(a => a.id == id) : null;
    if(aluno && aluno.curso) {
        const opt = document.createElement('option'); opt.value = aluno.curso; opt.text = aluno.curso; select.appendChild(opt);
    } else {
        const opt = document.createElement('option'); opt.value = "Geral"; opt.text = "Geral / Curso Padrão"; select.appendChild(opt);
    }
};

App.toggleTipoOutro = () => { const tipo = document.getElementById('av-tipo').value; document.getElementById('div-outro').style.display = (tipo==='Outro')?'block':'none'; };
App.salvarAvaliacaoDetalhada = async () => { const idA = document.getElementById('av-aluno').value; const nota = document.getElementById('av-nota').value; const max = document.getElementById('av-valor-max').value; if(!idA || !nota) return alert("Dados incompletos."); let tipo = document.getElementById('av-tipo').value; if(tipo==='Outro') tipo = document.getElementById('av-outro-desc').value; const nomeA = document.getElementById('av-aluno').options[document.getElementById('av-aluno').selectedIndex].text; const pl = { idAluno:idA, nomeAluno:nomeA, disciplina:document.getElementById('av-curso').value, tipo, valorMax:max, nota, bimestre:document.getElementById('av-bimestre').value, dataLancamento: new Date().toLocaleDateString() }; if(App.idEdicaoNota) await fetch(`${API_URL}/avaliacoes/${App.idEdicaoNota}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(pl)}); else await fetch(`${API_URL}/avaliacoes`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(pl)}); App.idEdicaoNota=null; App.renderizarAvaliacoesPro(); };
App.excluirAvaliacao = async (id) => { if(confirm("Excluir?")) { await fetch(`${API_URL}/avaliacoes/${id}`,{method:'DELETE'}); App.renderizarAvaliacoesPro(); }};
App.editarAvaliacao = async (id) => { 
    const n = await fetch(`${API_URL}/avaliacoes/${id}`).then(r=>r.json()); 
    document.getElementById('av-aluno').value=n.idAluno; 
    App.carregarCursoDoAluno(); 
    setTimeout(()=>{ if(document.getElementById('av-curso').options.length > 0) { document.getElementById('av-curso').value = n.disciplina; } }, 100); 
    if(["Teste","Prova","Pesquisa","Trabalho"].includes(n.tipo)) document.getElementById('av-tipo').value=n.tipo; 
    else { document.getElementById('av-tipo').value='Outro'; App.toggleTipoOutro(); document.getElementById('av-outro-desc').value=n.tipo; } 
    document.getElementById('av-valor-max').value=n.valorMax; document.getElementById('av-nota').value=n.nota; document.getElementById('av-bimestre').value=n.bimestre; App.idEdicaoNota=id; 
    document.querySelector('.card').scrollIntoView({behavior:'smooth'}); 
};

// 4. CHAMADA (MANTIDO)
App.renderizarChamadaPro = async () => { const div = document.getElementById('app-content'); try { const [alunos, chamadas] = await Promise.all([fetch(`${API_URL}/alunos`).then(r=>r.json()), fetch(`${API_URL}/chamadas`).then(r=>r.json())]); const historico = Array.isArray(chamadas) ? chamadas.sort((a,b) => new Date(b.data) - new Date(a.data)) : []; div.innerHTML = `<div class="card" style="padding: 25px; margin-bottom: 25px;"><div style="display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-end;"><div style="flex: 1; min-width: 250px;"><label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">Aluno:</label><select id="cham-aluno" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;"><option value="">-- Selecione --</option>${alunos.map(a => `<option value="${a.id}">${a.nome}</option>`).join('')}</select></div><div style="flex: 1; min-width: 150px;"><label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">Data:</label><input type="date" id="cham-data" value="${new Date().toISOString().split('T')[0]}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;"></div></div><div style="display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-end; margin-top: 15px;"><div style="flex: 1; min-width: 200px;"><label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">Status:</label><select id="cham-status" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;"><option value="Presença">✅ Presença</option><option value="Falta">❌ Falta</option><option value="Reposição">🔄 Reposição</option><option value="Feriado">📅 Feriado</option><option value="Recesso">🏖️ Recesso</option></select></div><div style="flex: 1; min-width: 150px;"><label style="font-weight:bold; font-size:12px; color:#555; display:block; margin-bottom:5px;">Duração:</label><input type="time" id="cham-duracao" value="02:00" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;"></div></div><button onclick="App.salvarLancamentoChamada()" style="margin-top:25px; width:100%; background: #2980b9; color:white; padding:12px; border:none; border-radius:5px; font-weight:bold; cursor:pointer; text-transform:uppercase;">💾 SALVAR LANÇAMENTO</button></div><div class="card"><h3 style="margin:0 0 15px 0; color:#2c3e50; font-size:16px;">Histórico Completo de Lançamentos</h3><table style="width:100%; border-collapse:collapse; font-size:13px;"><thead><tr style="background:#f4f6f7; color:#7f8c8d; text-align:left; text-transform:uppercase; font-size:11px;"><th style="padding:12px; border-bottom:2px solid #eee;">DATA</th><th style="padding:12px; border-bottom:2px solid #eee;">ALUNO</th><th style="padding:12px; border-bottom:2px solid #eee;">STATUS</th><th style="padding:12px; border-bottom:2px solid #eee;">TEMPO</th><th style="padding:12px; border-bottom:2px solid #eee; text-align:right;">AÇÃO</th></tr></thead><tbody>${historico.length === 0 ? '<tr><td colspan="5" style="padding:20px; text-align:center; color:#999;">Nenhum registro encontrado.</td></tr>' : ''}${historico.map(h => { let color = '#333'; if(h.status === 'Presença') color = 'green'; else if(h.status === 'Falta') color = 'red'; else if(h.status === 'Reposição') color = '#2980b9'; return `<tr style="border-bottom:1px solid #eee;"><td style="padding:12px; color:#555;">${h.data.split('-').reverse().join('/')}</td><td style="padding:12px; font-weight:bold;">${h.nomeAluno}</td><td style="padding:12px; font-weight:bold; color:${color};">${h.status}</td><td style="padding:12px; color:#555;">${h.duracao}</td><td style="padding:12px; text-align:right;"><button onclick="App.editarLancamentoChamada('${h.id}')" style="background:none; border:none; cursor:pointer; font-size:16px; margin-right:5px;" title="Editar">✏️</button><button onclick="App.excluirLancamentoChamada('${h.id}')" style="background:none; border:none; cursor:pointer; font-size:16px; color:#999;" title="Excluir">🗑️</button></td></tr>`; }).join('')}</tbody></table></div>`; } catch(e) { div.innerHTML = "Erro ao carregar módulo de chamada."; } };
App.salvarLancamentoChamada = async () => { const idAluno = document.getElementById('cham-aluno').value; const data = document.getElementById('cham-data').value; const status = document.getElementById('cham-status').value; const duracao = document.getElementById('cham-duracao').value; if(!idAluno || !data) return alert("Selecione o aluno e a data."); const nomeAluno = document.getElementById('cham-aluno').options[document.getElementById('cham-aluno').selectedIndex].text; const payload = { idAluno, nomeAluno, data, status, duracao }; if (App.idEdicaoChamada) { await fetch(`${API_URL}/chamadas/${App.idEdicaoChamada}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) }); App.idEdicaoChamada = null; } else { await fetch(`${API_URL}/chamadas`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) }); } App.renderizarChamadaPro(); };
App.excluirLancamentoChamada = async (id) => { if(confirm("Excluir este registro?")) { await fetch(`${API_URL}/chamadas/${id}`, { method: 'DELETE' }); App.renderizarChamadaPro(); } };
App.editarLancamentoChamada = async (id) => { const registro = await fetch(`${API_URL}/chamadas/${id}`).then(r => r.json()); document.getElementById('cham-aluno').value = registro.idAluno; document.getElementById('cham-data').value = registro.data; document.getElementById('cham-status').value = registro.status; document.getElementById('cham-duracao').value = registro.duracao; App.idEdicaoChamada = id; document.querySelector('.card').scrollIntoView({ behavior: 'smooth' }); const btn = document.querySelector('button[onclick="App.salvarLancamentoChamada()"]'); btn.innerText = "💾 ATUALIZAR LANÇAMENTO"; btn.style.background = "#f39c12"; };

// 5. CALENDÁRIO (MANTIDO)
App.renderizarCalendarioPro = async () => { const div = document.getElementById('app-content'); div.innerHTML = 'Carregando calendário...'; if (!App.calendarState) App.calendarState = { month: new Date().getMonth(), year: new Date().getFullYear() }; try { const eventos = await fetch(`${API_URL}/eventos`).then(r => r.json()); const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']; const mesNome = meses[App.calendarState.month]; const ano = App.calendarState.year; div.innerHTML = `<div class="card" style="margin-bottom: 20px; padding: 20px;"><div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;"><button onclick="App.mudarMes(-1)" style="background:none; border:none; font-size:24px; cursor:pointer;">◀</button><h2 style="margin:0; color:#2c3e50; text-transform:uppercase;">${mesNome} ${ano}</h2><button onclick="App.mudarMes(1)" style="background:none; border:none; font-size:24px; cursor:pointer;">▶</button></div><div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-weight: bold; color: #e74c3c; margin-bottom: 10px;"><div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div></div><div id="calendar-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px;">${App.gerarDiasCalendario(App.calendarState.month, App.calendarState.year, eventos)}</div></div><div class="card" style="background:#f4f6f7; border-left: 5px solid #2c3e50;"><div style="display:flex; align-items:center; gap:10px; margin-bottom:15px;"><span style="font-size:20px;">🗓️</span><h3 style="margin:0; color:#2c3e50;">Gerenciar Evento</h3></div><div style="display: flex; flex-wrap: wrap; gap: 15px; align-items: flex-end;"><div style="flex: 1; min-width: 150px;"><label style="font-weight:bold; font-size:12px; color:#555;">Data:</label><input type="date" id="evt-data" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;"></div><div style="flex: 1; min-width: 150px;"><label style="font-weight:bold; font-size:12px; color:#555;">Tipo:</label><select id="evt-tipo" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;"><option value="Evento">🟢 Evento</option><option value="Feriado">🔴 Feriado</option><option value="Prova">🔵 Prova</option><option value="Reunião">🟠 Reunião</option></select></div><div style="flex: 3; min-width: 250px;"><label style="font-weight:bold; font-size:12px; color:#555;">Descrição:</label><input type="text" id="evt-desc" placeholder="Ex: Prova de História / Carnaval" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;"></div></div><div style="display: flex; gap: 15px; margin-top: 15px; align-items: flex-end;"><div style="flex: 1; max-width: 120px;"><label style="font-size:11px; color:#555;">Início:</label><input type="time" id="evt-inicio" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:5px;"></div><div style="flex: 1; max-width: 120px;"><label style="font-size:11px; color:#555;">Término:</label><input type="time" id="evt-fim" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:5px;"></div><div style="flex: 1; text-align: right;"><button onclick="App.limparFormEvento()" style="background:#95a5a6; color:white; border:none; padding:10px 20px; border-radius:5px; margin-right:5px;">CANCELAR</button><button onclick="App.salvarEvento()" style="background:#6c5ce7; color:white; border:none; padding:10px 20px; border-radius:5px; font-weight:bold;">SALVAR</button></div></div></div><div class="card" style="margin-top: 20px;"><h4 style="margin:0 0 15px 0; color:#2c3e50;">Lista de Eventos (${mesNome})</h4><table style="width:100%; border-collapse:collapse; font-size:14px;"><thead><tr style="background:#f8f9fa; color:#7f8c8d; text-align:left;"><th style="padding:10px;">DIA</th><th style="padding:10px;">HORÁRIO</th><th style="padding:10px;">TIPO</th><th style="padding:10px;">DESCRIÇÃO</th><th style="padding:10px; text-align:right;">AÇÕES</th></tr></thead><tbody>${App.gerarListaEventosHTML(App.calendarState.month, App.calendarState.year, eventos)}</tbody></table></div>`; document.getElementById('evt-data').value = new Date().toISOString().split('T')[0]; } catch(e) { div.innerHTML = "Erro ao carregar calendário."; } };
App.gerarDiasCalendario = (mes, ano, eventos) => { const startDay = new Date(ano, mes, 1).getDay(); const daysInMonth = new Date(ano, mes + 1, 0).getDate(); let html = ''; for(let i=0; i<startDay; i++) html += `<div style="height:100px; border:1px solid #eee; background:#fdfdfd;"></div>`; for(let d=1; d<=daysInMonth; d++){ const dataISO = new Date(ano, mes, d).toISOString().split('T')[0]; const isHoje = (d === new Date().getDate() && mes === new Date().getMonth() && ano === new Date().getFullYear()); const evs = eventos.filter(e => e.data === dataISO); const tags = evs.map(e => `<div style="background:${(EVENTO_CORES[e.tipo]||EVENTO_CORES['Evento']).bg}; color:white; font-size:10px; padding:2px 4px; border-radius:3px; margin-top:2px;">${e.descricao}</div>`).join(''); html += `<div onclick="App.selecionarDia('${dataISO}')" style="${isHoje?'border:2px solid #2ecc71; background:#eafaf1;':'border:1px solid #eee; background:white;'} height:100px; padding:5px; cursor:pointer;"><div style="text-align:right; font-weight:bold; color:#555;">${d}</div>${tags}</div>`; } return html; };
App.gerarListaEventosHTML = (mes, ano, eventos) => { const evs = eventos.filter(e => { const d = new Date(e.data+'T00:00:00'); return d.getMonth()===mes && d.getFullYear()===ano; }).sort((a,b)=>new Date(a.data)-new Date(b.data)); if(evs.length===0) return '<tr><td colspan="5" style="padding:20px; text-align:center; color:#999;">Nenhum evento.</td></tr>'; return evs.map(e => `<tr style="border-bottom:1px solid #eee;"><td style="padding:10px; font-weight:bold;">${e.data.split('-')[2]}</td><td style="padding:10px;">${e.inicio||'-'}</td><td style="padding:10px; font-weight:bold; color:${(EVENTO_CORES[e.tipo]||EVENTO_CORES['Evento']).bg}">${e.tipo}</td><td style="padding:10px;">${e.descricao}</td><td style="padding:10px; text-align:right;"><button onclick="App.preencherEdicaoEvento('${e.id}')" style="background:#f39c12; color:white; border:none; padding:5px; border-radius:4px; margin-right:5px;">✏️</button><button onclick="App.excluirEvento('${e.id}')" style="background:#e74c3c; color:white; border:none; padding:5px; border-radius:4px;">🗑️</button></td></tr>`).join(''); };
App.mudarMes = (d) => { App.calendarState.month+=d; if(App.calendarState.month>11){App.calendarState.month=0;App.calendarState.year++}else if(App.calendarState.month<0){App.calendarState.month=11;App.calendarState.year--}; App.renderizarCalendarioPro(); };
App.selecionarDia = (dt) => { document.getElementById('evt-data').value = dt; document.getElementById('evt-desc').focus(); App.idEdicaoEvento=null; };
App.salvarEvento = async () => { const pl = { data: document.getElementById('evt-data').value, tipo: document.getElementById('evt-tipo').value, descricao: document.getElementById('evt-desc').value, inicio: document.getElementById('evt-inicio').value, fim: document.getElementById('evt-fim').value }; if(!pl.data || !pl.descricao) return alert("Preencha data e descrição."); if(App.idEdicaoEvento) await fetch(`${API_URL}/eventos/${App.idEdicaoEvento}`, {method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(pl)}); else await fetch(`${API_URL}/eventos`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(pl)}); App.idEdicaoEvento=null; App.renderizarCalendarioPro(); };
App.preencherEdicaoEvento = async (id) => { const e = await fetch(`${API_URL}/eventos/${id}`).then(r=>r.json()); document.getElementById('evt-data').value=e.data; document.getElementById('evt-tipo').value=e.tipo; document.getElementById('evt-desc').value=e.descricao; document.getElementById('evt-inicio').value=e.inicio; document.getElementById('evt-fim').value=e.fim; App.idEdicaoEvento=id; };
App.excluirEvento = async (id) => { if(confirm("Excluir?")){ await fetch(`${API_URL}/eventos/${id}`, {method:'DELETE'}); App.renderizarCalendarioPro(); }};
App.limparFormEvento = () => { document.getElementById('evt-desc').value=''; App.idEdicaoEvento=null; };