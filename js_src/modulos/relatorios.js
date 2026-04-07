// =========================================================
// MÓDULO RELATÓRIOS V160 (FOLHA A4 BLINDADA + RESPONSIVIDADE MOBILE)
// =========================================================

App.renderizarRelatorioModulo = async (tipo) => {
    if (tipo === 'fin_detalhado' || tipo === 'financeiro') { App.setTitulo("Relatórios Financeiros"); App.renderizarSelecaoRelatorio(); return; }
    if (tipo === 'dossie') { App.renderizarDossie(); return; }
    if (tipo === 'ficha') { App.gerarFichaSetup(); return; }
    if (tipo === 'documentos') { App.renderizarGeradorDocumentos(); return; }
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

// ---------------------------------------------------------
// 1. RELATÓRIO FINANCEIRO DETALHADO
// ---------------------------------------------------------
App.renderizarSelecaoRelatorio = async () => {
    const div = document.getElementById('app-content'); div.innerHTML = '<p style="text-align:center;">A carregar filtros...</p>';
    try {
        const [alunos, turmas] = await Promise.all([App.api('/alunos'), App.api('/turmas')]);
        
        const opAlunos = `<option value="">Todos os Alunos</option>` + alunos.map(a => `<option value="${a.id}">${App.escapeHTML(a.nome)}</option>`).join('');
        const opTurmas = `<option value="">Todas as Turmas</option>` + turmas.map(t => `<option value="${App.escapeHTML(t.nome)}">${App.escapeHTML(t.nome)}</option>`).join('');
        const opStatus = `<option value="">Todos os Status</option><option value="Pago">Apenas Pagos</option><option value="Pendente">Apenas Pendentes</option>`;
        
        const form = `
            <div style="display:flex; flex-wrap:wrap; gap:15px; margin-bottom:20px;">
                ${relSelect('Filtrar por Aluno:', 'rel-fin-aluno', opAlunos)}
                ${relSelect('Filtrar por Turma:', 'rel-fin-turma', opTurmas)}
                ${relSelect('Status da Parcela:', 'rel-fin-status', opStatus)}
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:15px; margin-bottom:20px;">
                ${relCol('Data Início (Vencimento):', 'rel-fin-inicio', 'date')}
                ${relCol('Data Fim (Vencimento):', 'rel-fin-fim', 'date')}
            </div>
            <button onclick="App.gerarRelatorioFinanceiro()" style="width:100%; background:#2c3e50; color:white; padding:15px; border:none; border-radius:5px; font-weight:bold; cursor:pointer; text-transform:uppercase;">GERAR RELATÓRIO</button>
        `;
        div.innerHTML = App.UI.card('📊 Filtros do Relatório Financeiro', 'Defina os parâmetros para a pesquisa', form, '800px') + `<div id="relatorio-fin-area" style="margin-top:30px;"></div>`;
    } catch(e) { div.innerHTML = "Erro ao carregar filtros."; }
};

App.gerarRelatorioFinanceiro = async () => {
    const area = document.getElementById('relatorio-fin-area'); area.innerHTML = '<p style="text-align:center;">A gerar... ⏳</p>';
    const idAluno = document.getElementById('rel-fin-aluno').value;
    const turma = document.getElementById('rel-fin-turma').value;
    const status = document.getElementById('rel-fin-status').value;
    const dataInicio = document.getElementById('rel-fin-inicio').value;
    const dataFim = document.getElementById('rel-fin-fim').value;

    try {
        const [financeiro, alunos, escola] = await Promise.all([App.api('/financeiro'), App.api('/alunos'), App.api('/escola')]);
        
        let dados = financeiro;
        
        // Aplicação dos Filtros
        if (idAluno) dados = dados.filter(f => f.idAluno === idAluno);
        if (turma) {
            const alunosTurma = alunos.filter(a => a.turma === turma).map(a => a.id);
            dados = dados.filter(f => alunosTurma.includes(f.idAluno));
        }
        if (status) dados = dados.filter(f => f.status === status);
        if (dataInicio) dados = dados.filter(f => new Date(f.vencimento) >= new Date(dataInicio));
        if (dataFim) dados = dados.filter(f => new Date(f.vencimento) <= new Date(dataFim));

        dados.sort((a,b) => new Date(a.vencimento) - new Date(b.vencimento));

        if(dados.length === 0) { area.innerHTML = '<div class="card"><p style="text-align:center; margin:0; color:#999;">Nenhum registo encontrado para estes filtros.</p></div>'; return; }

        let totalGeral = 0;
        let totalPago = 0;
        let totalPendente = 0;

        const linhas = dados.map(f => {
            const val = parseFloat(f.valor) || 0;
            totalGeral += val;
            if(f.status === 'Pago') totalPago += val; else totalPendente += val;
            
            const corStatus = f.status === 'Pago' ? '#27ae60' : '#e74c3c';
            return `
            <tr style="border-bottom:1px solid #eee;">
                <td style="padding:10px;">${f.vencimento.split('-').reverse().join('/')}</td>
                <td style="padding:10px; font-weight:bold;">${App.escapeHTML(f.alunoNome)}</td>
                <td style="padding:10px;">${App.escapeHTML(f.descricao)}</td>
                <td style="padding:10px; font-weight:bold; color:${corStatus};">${f.status}</td>
                <td style="padding:10px; text-align:right;">R$ ${val.toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
            </tr>`;
        }).join('');

        const logo = escola.foto ? `<img src="${escola.foto}" style="height:50px; margin-right:15px;">` : '';
        const dataHoje = new Date().toLocaleDateString('pt-BR');

        area.innerHTML = `
            <div class="no-print" style="margin-bottom:15px; text-align:right;">
                <button onclick="window.print()" class="btn-primary">🖨️ IMPRIMIR RELATÓRIO</button>
            </div>
            <div class="print-sheet" style="background: white; max-width: 210mm; margin: 0 auto; padding: 40px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-radius: 8px;">
                <style> @media print { @page { size: A4 portrait; margin: 10mm; } body { background: #fff !important; } .no-print { display: none !important; } .print-sheet { box-shadow: none !important; margin: 0 !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; } } </style>
                
                <div style="display:flex; justify-content:space-between; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:20px;">
                    <div style="display:flex; align-items:center;">
                        ${logo}
                        <div><h2 style="margin:0; text-transform:uppercase;">${App.escapeHTML(escola.nome || 'INSTITUIÇÃO')}</h2><div style="font-size:12px;">Relatório Analítico Financeiro</div></div>
                    </div>
                    <div style="text-align:right; font-size:12px; color:#666;"><div>Emissão: <b>${dataHoje}</b></div><div>Total de Registos: <b>${dados.length}</b></div></div>
                </div>

                <div style="display:flex; gap:15px; margin-bottom:20px;">
                    <div style="flex:1; background:#f8f9fa; padding:15px; border-radius:5px; border-left:4px solid #3498db; text-align:center;">
                        <div style="font-size:11px; color:#7f8c8d; text-transform:uppercase; font-weight:bold;">Total Selecionado</div>
                        <div style="font-size:18px; font-weight:bold; color:#2c3e50;">R$ ${totalGeral.toLocaleString('pt-BR', {minimumFractionDigits:2})}</div>
                    </div>
                    <div style="flex:1; background:#eafaf1; padding:15px; border-radius:5px; border-left:4px solid #27ae60; text-align:center;">
                        <div style="font-size:11px; color:#7f8c8d; text-transform:uppercase; font-weight:bold;">Total Recebido (Pago)</div>
                        <div style="font-size:18px; font-weight:bold; color:#27ae60;">R$ ${totalPago.toLocaleString('pt-BR', {minimumFractionDigits:2})}</div>
                    </div>
                    <div style="flex:1; background:#fdf2f2; padding:15px; border-radius:5px; border-left:4px solid #e74c3c; text-align:center;">
                        <div style="font-size:11px; color:#7f8c8d; text-transform:uppercase; font-weight:bold;">Total a Receber (Pendente)</div>
                        <div style="font-size:18px; font-weight:bold; color:#e74c3c;">R$ ${totalPendente.toLocaleString('pt-BR', {minimumFractionDigits:2})}</div>
                    </div>
                </div>

                <table style="width:100%; border-collapse:collapse; font-size:12px; text-align:left;">
                    <thead><tr style="background:#f4f6f7; border-bottom:2px solid #333;"><th style="padding:10px;">VENCIMENTO</th><th style="padding:10px;">ALUNO</th><th style="padding:10px;">REFERÊNCIA</th><th style="padding:10px;">STATUS</th><th style="padding:10px; text-align:right;">VALOR</th></tr></thead>
                    <tbody>${linhas}</tbody>
                </table>
            </div>
        `;
    } catch(e) { area.innerHTML = '<p style="color:red;">Erro ao processar relatório.</p>'; }
};

// ---------------------------------------------------------
// 2. GERADOR DE DOCUMENTOS, CONTRATOS E CERTIFICADOS (AJUSTADO PARA A4)
// ---------------------------------------------------------
App.renderizarGeradorDocumentos = async () => {
    App.setTitulo("Gerador de Documentos");
    const div = document.getElementById('app-content'); div.innerHTML = 'A carregar...';
    
    try {
        const alunos = await App.api('/alunos');
        const alunosAtivos = alunos.filter(a => !a.status || a.status === 'Ativo');
        const opAlunos = `<option value="">-- Selecione o Aluno --</option>` + alunosAtivos.map(a => `<option value="${a.id}" data-nome="${App.escapeHTML(a.nome)}" data-rg="${App.escapeHTML(a.rg||'')}" data-cpf="${App.escapeHTML(a.cpf||'')}" data-curso="${App.escapeHTML(a.curso||'')}">${App.escapeHTML(a.nome)}</option>`).join('');
        
        const opDocs = `
            <option value="contrato">📜 Contrato de Prestação de Serviços</option>
            <option value="declaracao">📄 Declaração de Matrícula</option>
            <option value="certificado">🎓 Certificado de Conclusão</option>
        `;

        const formDocs = `
            <div style="display:flex; flex-wrap:wrap; gap:15px; margin-bottom:20px;">
                ${relSelect('Selecione o Aluno Alvo:', 'doc-aluno', opAlunos)}
                ${relSelect('Tipo de Documento:', 'doc-tipo', opDocs, 'onchange="App.mudarOpcoesDocumento()"')}
            </div>
            
            <div id="area-opcoes-doc" style="background:#f9f9f9; padding:15px; border:1px solid #eee; border-radius:5px; margin-bottom:20px; display:none;">
                </div>

            <button onclick="App.gerarDocumentoPronto()" style="width:100%; background:#8e44ad; color:white; padding:15px; border:none; border-radius:5px; font-weight:bold; cursor:pointer; text-transform:uppercase;">GERAR E IMPRIMIR DOCUMENTO</button>
        `;

        div.innerHTML = App.UI.card('🖨️ Central de Documentos', 'Emita contratos, declarações e certificados padronizados', formDocs, '800px') + `<div id="preview-doc-area" style="margin-top:30px;"></div>`;
        App.mudarOpcoesDocumento();
    } catch(e) { div.innerHTML = "Erro ao carregar gerador."; }
};

App.mudarOpcoesDocumento = () => {
    const tipo = document.getElementById('doc-tipo').value;
    const area = document.getElementById('area-opcoes-doc');
    
    if (tipo === 'contrato') {
        area.innerHTML = `
            <h4 style="margin-top:0; color:#555;">Dados do Contrato</h4>
            <div style="display:flex; gap:15px; flex-wrap:wrap;">
                ${relCol('Valor Total do Curso (R$):', 'doc-valor-curso', 'number')}
                ${relCol('Carga Horária (Horas):', 'doc-carga-horaria', 'number')}
            </div>
        `;
        area.style.display = 'block';
    } else if (tipo === 'certificado') {
        area.innerHTML = `
            <h4 style="margin-top:0; color:#555;">Dados do Certificado</h4>
            <div style="display:flex; gap:15px; flex-wrap:wrap;">
                ${relCol('Curso Concluído:', 'doc-curso-cert', 'text', '', 'placeholder="Ex: Informática Avançada"')}
                ${relCol('Carga Horária (Horas):', 'doc-carga-cert', 'number', '40')}
                ${relCol('Data de Conclusão:', 'doc-data-cert', 'date')}
            </div>
        `;
        area.style.display = 'block';
    } else {
        area.style.display = 'none'; // Declaração não precisa de opções extras
    }
};

App.gerarDocumentoPronto = async () => {
    const idAluno = document.getElementById('doc-aluno').value;
    const tipo = document.getElementById('doc-tipo').value;
    const area = document.getElementById('preview-doc-area');
    
    if(!idAluno) return App.showToast("Selecione um aluno primeiro.", "warning");

    area.innerHTML = '<p style="text-align:center;">A construir documento... ⏳</p>';

    try {
        const [aluno, escola] = await Promise.all([App.api(`/alunos/${idAluno}`), App.api('/escola')]);
        
        const logo = escola.foto ? `<img src="${escola.foto}" style="height:60px; max-width:200px; object-fit:contain;">` : `<h2>${App.escapeHTML(escola.nome)}</h2>`;
        const dataHoje = new Date().toLocaleDateString('pt-BR');
        
        let htmlDoc = '';
        let orientacaoPapel = 'portrait';

        // ----------------------------------------------------
        // LÓGICA DO CERTIFICADO (RESOLVIDO O PROBLEMA DO CORTE)
        // ----------------------------------------------------
        if (tipo === 'certificado') {
            orientacaoPapel = 'landscape';
            const cursoCert = document.getElementById('doc-curso-cert').value || aluno.curso || 'Curso de Qualificação';
            const cargaCert = document.getElementById('doc-carga-cert').value || '0';
            const dataCert = document.getElementById('doc-data-cert').value ? document.getElementById('doc-data-cert').value.split('-').reverse().join('/') : dataHoje;

            // ADICIONADOS: box-sizing: border-box; max-width: 275mm; height: 190mm;
            htmlDoc = `
                <style> 
                    @media print { 
                        @page { size: A4 landscape; margin: 5mm; } 
                        body { background: #fff !important; margin:0; padding:0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                        .no-print { display: none !important; } 
                        .print-sheet { margin: 0 auto !important; padding: 0 !important; box-shadow: none !important; width:100% !important; background:transparent !important; border:none !important;} 
                    }
                    /* Container do Certificado Blindado */
                    .cert-box {
                        border: 8px double #2c3e50;
                        padding: 30px;
                        text-align: center;
                        background: #fff;
                        position: relative;
                        width: 100%;
                        max-width: 275mm;  /* LARGURA SEGURA P/ A4 PAISAGEM */
                        height: 190mm;     /* ALTURA SEGURA P/ A4 PAISAGEM */
                        margin: 0 auto;
                        box-sizing: border-box; /* ⚠️ CRUCIAL: Mantém a borda dentro da largura máxima */
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                        page-break-inside: avoid;
                    }
                    .cert-title { font-size: 45px; font-weight: bold; color: #2c3e50; margin: 20px 0 10px 0; text-transform: uppercase; letter-spacing: 3px; font-family: 'Times New Roman', serif; }
                    .cert-text { font-size: 18px; color: #333; line-height: 1.8; font-family: 'Arial', sans-serif; margin: 20px 40px; }
                    .cert-name { font-size: 30px; font-weight: bold; color: #000; text-transform: uppercase; margin: 15px 0; border-bottom: 2px solid #ccc; display: inline-block; padding: 0 40px; font-family: 'Times New Roman', serif; }
                </style>
                
                <div class="cert-box">
                    <div style="margin-top: 20px;">
                        ${logo}
                    </div>
                    
                    <div class="cert-title">CERTIFICADO</div>
                    
                    <div class="cert-text">
                        Certificamos para os devidos fins que<br>
                        <span class="cert-name">${App.escapeHTML(aluno.nome)}</span><br>
                        portador(a) do CPF <b>${App.escapeHTML(aluno.cpf || 'Não informado')}</b>, concluiu com êxito o curso de<br>
                        <strong style="font-size:22px;">${App.escapeHTML(cursoCert)}</strong><br>
                        promovido por <b>${App.escapeHTML(escola.nome || 'Instituição')}</b>, com carga horária de <b>${cargaCert} horas</b>, finalizado em <b>${dataCert}</b>.
                    </div>
                    
                    <div style="display:flex; justify-content:space-around; align-items:flex-end; margin-top:30px; margin-bottom:20px; flex-wrap:wrap; gap:30px;">
                        <div style="text-align:center; flex:1; min-width:200px;">
                            <div style="border-top:1px solid #000; padding-top:10px; font-size:14px; font-weight:bold;">${App.escapeHTML(escola.nome || 'Instituição')}</div>
                            <div style="font-size:12px; color:#666;">Direção Académica</div>
                        </div>
                        <div style="text-align:center; flex:1; min-width:200px;">
                            <div style="border-top:1px solid #000; padding-top:10px; font-size:14px; font-weight:bold;">${App.escapeHTML(aluno.nome)}</div>
                            <div style="font-size:12px; color:#666;">Aluno(a) Titular</div>
                        </div>
                    </div>
                </div>
            `;
        } 
        
        // ----------------------------------------------------
        // LÓGICA DA DECLARAÇÃO (A4 Retrato)
        // ----------------------------------------------------
        else if (tipo === 'declaracao') {
            htmlDoc = `
                <style> 
                    @media print { @page { size: A4 portrait; margin: 15mm; } body { background: #fff !important; } .no-print { display: none !important; } .print-sheet { box-shadow: none !important; margin: 0 !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; } } 
                </style>
                <div style="padding: 20px; font-family: Arial, sans-serif;">
                    <div style="text-align:center; margin-bottom:40px; border-bottom:2px solid #333; padding-bottom:20px;">
                        ${logo}
                        <h2 style="margin:10px 0 0 0; text-transform:uppercase; font-size:20px;">${App.escapeHTML(escola.nome || 'Instituição')}</h2>
                        <div style="font-size:12px; color:#555;">CNPJ: ${App.escapeHTML(escola.cnpj || 'Não informado')} | Contato: ${App.escapeHTML(escola.telefone || '')}</div>
                    </div>
                    
                    <h1 style="text-align:center; text-transform:uppercase; font-size:22px; margin-bottom:50px; text-decoration:underline;">Declaração de Matrícula</h1>
                    
                    <p style="font-size:16px; line-height:1.8; text-align:justify; margin-bottom:40px; text-indent:50px;">
                        Declaramos para os devidos fins de direito que o(a) aluno(a) <strong>${App.escapeHTML(aluno.nome)}</strong>, 
                        inscrito(a) sob o CPF nº <strong>${App.escapeHTML(aluno.cpf || 'Não informado')}</strong> e RG nº <strong>${App.escapeHTML(aluno.rg || 'Não informado')}</strong>, 
                        encontra-se regularmente matriculado(a) e a frequentar as aulas do curso de <strong>${App.escapeHTML(aluno.curso || 'Não especificado')}</strong>, 
                        nesta instituição de ensino.
                    </p>
                    <p style="font-size:16px; line-height:1.8; text-align:justify; margin-bottom:60px; text-indent:50px;">
                        Por ser a expressão da verdade, firmamos a presente declaração.
                    </p>
                    
                    <div style="text-align:right; font-size:16px; margin-bottom:80px;">
                        ${App.escapeHTML(escola.cidade || 'Cidade')}, ${dataHoje}.
                    </div>
                    
                    <div style="text-align:center; width:300px; margin:0 auto; border-top:1px solid #000; padding-top:10px;">
                        <b>Secretaria Académica</b><br>
                        <span style="font-size:12px; color:#555;">${App.escapeHTML(escola.nome || 'Instituição')}</span>
                    </div>
                </div>
            `;
        }

        // ----------------------------------------------------
        // LÓGICA DO CONTRATO (A4 Retrato)
        // ----------------------------------------------------
        else if (tipo === 'contrato') {
            const vCurso = document.getElementById('doc-valor-curso').value || '0';
            const cHoraria = document.getElementById('doc-carga-horaria').value || '0';
            
            htmlDoc = `
                <style> 
                    @media print { @page { size: A4 portrait; margin: 15mm; } body { background: #fff !important; } .no-print { display: none !important; } .print-sheet { box-shadow: none !important; margin: 0 !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; } } 
                    .clausula { margin-bottom:15px; text-align:justify; font-size:14px; line-height:1.6; }
                </style>
                <div style="padding: 20px; font-family: Arial, sans-serif;">
                    <div style="text-align:center; margin-bottom:30px;">
                        ${logo}
                        <h2 style="margin:10px 0 0 0; font-size:18px;">CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS</h2>
                    </div>
                    
                    <div class="clausula">
                        <strong>CONTRATADA:</strong> ${App.escapeHTML(escola.nome || 'Instituição')}, inscrita no CNPJ sob o nº ${App.escapeHTML(escola.cnpj || 'Não informado')}, sediada na cidade de ${App.escapeHTML(escola.cidade || 'Não informada')}.
                    </div>
                    <div class="clausula">
                        <strong>CONTRATANTE (Aluno/Responsável):</strong> ${App.escapeHTML(aluno.nome)}, portador(a) do CPF nº ${App.escapeHTML(aluno.cpf || 'Não informado')} e RG nº ${App.escapeHTML(aluno.rg || 'Não informado')}, residente em ${App.escapeHTML(aluno.endereco || 'Não informado')}.
                    </div>
                    
                    <h3 style="font-size:14px; text-decoration:underline; margin-top:20px;">CLÁUSULA PRIMEIRA - DO OBJETO</h3>
                    <div class="clausula">O presente instrumento tem como objeto a prestação de serviços educacionais referentes ao curso de <b>${App.escapeHTML(aluno.curso || 'Não especificado')}</b>, com carga horária total de <b>${cHoraria} horas</b>.</div>
                    
                    <h3 style="font-size:14px; text-decoration:underline;">CLÁUSULA SEGUNDA - DO VALOR E PAGAMENTO</h3>
                    <div class="clausula">Pelos serviços prestados, o CONTRATANTE pagará à CONTRATADA o valor total de <b>R$ ${parseFloat(vCurso).toLocaleString('pt-BR', {minimumFractionDigits:2})}</b>, na forma combinada no ato da matrícula e registrada no módulo financeiro desta instituição. Em caso de atraso, incidirão multas e juros conforme legislação vigente.</div>
                    
                    <h3 style="font-size:14px; text-decoration:underline;">CLÁUSULA TERCEIRA - DAS OBRIGAÇÕES</h3>
                    <div class="clausula">É dever do CONTRATANTE frequentar as aulas, manter a disciplina e o respeito. A CONTRATADA compromete-se a fornecer o ambiente, material didático básico e instrutores capacitados para o bom andamento do curso.</div>
                    
                    <div style="text-align:center; font-size:14px; margin-top:50px; margin-bottom:60px;">
                        E, por estarem de inteiro e comum acordo, as partes assinam o presente contrato.<br><br>
                        ${App.escapeHTML(escola.cidade || 'Cidade')}, ${dataHoje}.
                    </div>
                    
                    <div style="display:flex; justify-content:space-around; text-align:center; margin-top:30px;">
                        <div style="width:40%; border-top:1px solid #000; padding-top:10px;">
                            <b>CONTRATADA</b><br><span style="font-size:11px;">${App.escapeHTML(escola.nome || 'Instituição')}</span>
                        </div>
                        <div style="width:40%; border-top:1px solid #000; padding-top:10px;">
                            <b>CONTRATANTE</b><br><span style="font-size:11px;">${App.escapeHTML(aluno.nome)}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        // Renderização Final na Tela
        area.innerHTML = `
            <div class="no-print" style="margin-bottom:15px; background:#f4f4f4; padding:15px; border-radius:5px; text-align:center;">
                <button onclick="window.print()" class="btn-primary" style="font-size:16px; padding:10px 25px;">🖨️ IMPRIMIR DOCUMENTO AGORA</button>
            </div>
            <div class="print-sheet" style="background: white; margin: 0 auto; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-radius: 8px;">
                ${htmlDoc}
            </div>
        `;

    } catch(e) { area.innerHTML = '<p style="color:red; text-align:center;">Erro ao processar o documento.</p>'; }
};