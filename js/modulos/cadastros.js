// =========================================================
// MÓDULO DE CADASTROS V104 (STATUS BLINDADO E PRESERVAÇÃO DE DADOS)
// =========================================================

App.abrirModalCadastroModulo = async (tipo, id) => {
    App.entidadeAtual = tipo;
    App.idEdicao = id;
    
    const modal = document.getElementById('modal-overlay');
    if(modal) modal.style.display = 'flex';
    
    const titulo = document.getElementById('modal-titulo');
    const conteudo = document.getElementById('modal-form-content');
    
    if(titulo) titulo.innerText = id ? `Editar ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}` : `Novo ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;
    if(conteudo) conteudo.innerHTML = '<p style="padding:20px; text-align:center; color:#666;">Carregando formulário...</p>';

    let dados = {};
    let listas = { cursos: [], turmas: [] };

    try {
        if (id) {
            const endpoint = tipo === 'financeiro' ? 'financeiro' : tipo + 's';
            dados = await App.api(`/${endpoint}/${id}`);
        }
        
        if (tipo === 'aluno' || tipo === 'turma') {
            const [c, t] = await Promise.all([ App.api('/cursos'), App.api('/turmas') ]);
            listas.cursos = Array.isArray(c) ? c : [];
            listas.turmas = Array.isArray(t) ? t : [];
        }
    } catch (e) { console.error("Erro ao carregar dados:", e); }

    const v = (val) => val || '';
    let html = '';

    const input = App.UI.input; 
    
    const select = (label, id, options) => `
        <div class="input-group">
            <label>${label}</label>
            <select id="${id}">${options}</select>
        </div>
    `;
    
    // Utilizando as novas classes CSS Responsivas
    const row = (conteudo) => `<div class="form-grid-2">${conteudo}</div>`;
    const row3 = (conteudo) => `<div class="form-grid-3">${conteudo}</div>`;
    const section = (title, margin = '25px') => `<div style="color:#2c3e50; font-size:14px; font-weight:600; margin:${margin} 0 10px 0; border-bottom:1px solid #eee; padding-bottom:5px;">${title}</div>`;

    if (tipo === 'aluno') {
        const opTurma = `<option value="">-- Selecione --</option>` + listas.turmas.map(t => `<option value="${t.nome}" ${v(dados.turma)===t.nome?'selected':''}>${t.nome}</option>`).join('');
        const opCurso = `<option value="">-- Selecione --</option>` + listas.cursos.map(c => `<option value="${c.nome}" ${v(dados.curso)===c.nome?'selected':''}>${c.nome}</option>`).join('');
        const opSexo = `
            <option value="">-- Selecione --</option>
            <option value="Masculino" ${v(dados.sexo) === 'Masculino' ? 'selected' : ''}>Masculino</option>
            <option value="Feminino" ${v(dados.sexo) === 'Feminino' ? 'selected' : ''}>Feminino</option>
        `;
        
        // 🛡️ CORREÇÃO: Força o HTML a focar no status real guardado na base de dados
        const statusAtual = dados.status || 'Ativo';
        const opStatus = `
            <option value="Ativo" ${statusAtual === 'Ativo' ? 'selected' : ''}>🟢 Ativo</option>
            <option value="Trancado" ${statusAtual === 'Trancado' ? 'selected' : ''}>🟡 Trancado / Pausado</option>
            <option value="Cancelado" ${statusAtual === 'Cancelado' ? 'selected' : ''}>🔴 Cancelado</option>
        `;
        
        html = 
            section('1. Dados Pessoais', '0') +
            row(
                input('Nome Completo', 'a-nome', v(dados.nome), 'Ex: João da Silva') +
                select('Status da Matrícula', 'a-status', opStatus)
            ) +
            row(
                input('CPF', 'a-cpf', v(dados.cpf), '000.000.000-00', 'tel', 'oninput="App.mascaraCPF(this)" maxlength="14"') +
                input('RG', 'a-rg', v(dados.rg), '', 'text')
            ) +
            row(
                input('Data Nascimento', 'a-nasc', v(dados.nascimento), '', 'date') +
                select('Sexo', 'a-sexo', opSexo)
            ) +
            row(
                input('WhatsApp/Celular', 'a-zap', v(dados.whatsapp), '(00) 00000-0000', 'tel', 'oninput="App.mascaraCelular(this)" maxlength="15"') +
                input('Profissão / Ocupação', 'a-prof', v(dados.profissao), 'Ex: Estudante')
            ) +

            section('2. Matrícula') +
            row(
                select('Curso', 'a-curso', opCurso) +
                select('Turma', 'a-turma', opTurma)
            ) +

            section('3. Endereço Completo') +
            row3(
                input('Logradouro (Rua/Av)', 'a-rua', v(dados.rua), 'Ex: Rua das Flores') +
                input('Número', 'a-num', v(dados.numero), '123', 'tel')
            ) +
            row(
                input('Bairro', 'a-bairro', v(dados.bairro)) +
                input('Cidade', 'a-cidade', v(dados.cidade))
            ) +
            row(
                input('Estado (UF)', 'a-uf', v(dados.estado), 'Ex: SP', 'text', 'maxlength="2"') +
                input('País', 'a-pais', v(dados.pais) || 'Brasil')
            ) +

            section('4. Dados do Responsável (Se menor)') +
            input('Nome do Responsável', 'r-nome', v(dados.resp_nome)) +
            row(
                input('CPF do Responsável', 'r-cpf', v(dados.resp_cpf), '000.000.000-00', 'tel', 'oninput="App.mascaraCPF(this)" maxlength="14"') +
                input('WhatsApp do Responsável', 'r-zap', v(dados.resp_zap), '(00) 00000-0000', 'tel', 'oninput="App.mascaraCelular(this)" maxlength="15"')
            );
    }

    else if (tipo === 'turma') {
        const opCurso = `<option value="">-- Selecione --</option>` + listas.cursos.map(c => `<option value="${c.nome}" ${v(dados.curso)===c.nome?'selected':''}>${c.nome}</option>`).join('');
        
        html = 
            input('Nome da Turma', 't-nome', v(dados.nome), 'Ex: Turma A - Manhã') +
            select('Curso Vinculado', 't-curso', opCurso) +
            row(
                input('Dias de Aula', 't-dia', v(dados.dia), 'Ex: Seg e Qua') +
                input('Horário', 't-horario', v(dados.horario), '', 'time')
            );
    }
    else if (tipo === 'curso') {
        html = 
            input('Nome do Curso', 'c-nome', v(dados.nome), 'Ex: Inglês Básico') +
            input('Carga Horária (Horas)', 'c-carga', v(dados.carga), 'Ex: 40h');
    }
    
     else if (tipo === 'estoque') {
        html = 
            section('1. Identificação do Item', '0') +
            input('Nome do Produto / Item', 'est-nome', v(dados.nome), 'Ex: Apostila de Inglês Módulo 1') +
            row(
                input('Código (Barras/Referência)', 'est-codigo', v(dados.codigo), 'Ex: 789102030') +
                input('Valor Unitário (R$)', 'est-valor', v(dados.valor), '0.00', 'number', 'step="0.01"')
            ) +
            section('2. Controle de Quantidade') +
            row(
                input('Quantidade Atual em Estoque', 'est-qtd', v(dados.quantidade), 'Ex: 50', 'number') +
                input('Quantidade Mínima (Para o Alerta 🔔)', 'est-min', v(dados.quantidadeMinima), 'Ex: 10', 'number')
            ) +
            input('Observações Adicionais', 'est-obs', v(dados.obs), 'Opcional...');
    }

    if(conteudo) conteudo.innerHTML = html;
};

App.salvarCadastro = async () => {
    const t = App.entidadeAtual;
    const ep = t === 'financeiro' ? 'financeiro' : t + 's';
    
    const btn = document.querySelector('.btn-confirm');
    const txtOriginal = btn ? btn.innerText : 'Salvar Registro';
    if(btn) { btn.innerText = "A guardar... ⏳"; btn.disabled = true; }
    document.body.style.cursor = 'wait';

    try {
        // 🛡️ O SEGREDO MÁGICO: Buscar os dados antigos primeiro para não apagar o status!
        let p = {};
        if (App.idEdicao) {
            const dadosAntigos = await App.api(`/${ep}/${App.idEdicao}`);
            if (dadosAntigos) p = { ...dadosAntigos }; 
        }

        if (t === 'aluno') {
            p.nome = document.getElementById('alu-nome').value;
            p.nascimento = document.getElementById('alu-nasc').value;
            p.cpf = document.getElementById('alu-cpf').value;
            p.rg = document.getElementById('alu-rg').value;
            p.endereco = document.getElementById('alu-end').value;
            p.bairro = document.getElementById('alu-bairro').value;
            p.cidade = document.getElementById('alu-cidade').value;
            p.cep = document.getElementById('alu-cep').value;
            p.email = document.getElementById('alu-email').value;
            p.telefone = document.getElementById('alu-tel').value;
            p.responsavel = document.getElementById('alu-resp').value;
            p.telResponsavel = document.getElementById('alu-tel-resp').value;
            p.curso = document.getElementById('alu-curso').value;
            p.turma = document.getElementById('alu-turma').value;
            p.vencimento = document.getElementById('alu-venc').value;
            p.valorMensalidade = parseFloat(document.getElementById('alu-val').value) || 0;
            p.bolsa = parseFloat(document.getElementById('alu-bolsa').value) || 0;
            
            // Garante que o status não fique vazio se for um aluno novo
            if (!p.status) p.status = 'Ativo';
            
            if(!p.nome || !p.curso) { App.showToast("Nome e Curso são obrigatórios!", "error"); throw new Error("Validação Falhou"); }
        }
        else if (t === 'curso') {
            p.nome = document.getElementById('cur-nome').value;
            p.cargaHoraria = document.getElementById('cur-ch').value;
            p.valorPadrao = parseFloat(document.getElementById('cur-val').value) || 0;
            if(!p.nome) { App.showToast("O nome do curso é obrigatório!", "error"); throw new Error("Validação Falhou"); }
        }
        else if (t === 'turma') {
            p.nome = document.getElementById('tur-nome').value;
            p.curso = document.getElementById('tur-curso').value;
            p.horario = document.getElementById('tur-hora').value;
            p.dias = document.getElementById('tur-dias').value;
            p.limiteAlunos = parseInt(document.getElementById('tur-limite').value) || 0;
            if(!p.nome || !p.curso) { App.showToast("Nome e Curso são obrigatórios!", "error"); throw new Error("Validação Falhou"); }
        }
        else if (t === 'usuario') {
            p.nome = document.getElementById('usu-nome').value;
            p.email = document.getElementById('usu-email').value;
            p.senha = document.getElementById('usu-senha').value;
            p.cargo = document.getElementById('usu-cargo').value;
            p.pin = document.getElementById('usu-pin').value;
            if(!p.nome || !p.email || !p.cargo) { App.showToast("Preencha os dados obrigatórios!", "error"); throw new Error("Validação Falhou"); }
        }
        else if (t === 'estoque') {
            p.nome = document.getElementById('est-nome').value;
            p.codigo = document.getElementById('est-codigo').value;
            p.obs = document.getElementById('est-obs').value;
            p.valor = parseFloat(document.getElementById('est-valor').value) || 0;
            p.quantidade = parseInt(document.getElementById('est-qtd').value) || 0;
            p.quantidadeMinima = parseInt(document.getElementById('est-min').value) || 0;
            if(!p.nome) { App.showToast("O nome do item é obrigatório!", "error"); throw new Error("Validação Falhou"); }
        }

        const endpoint = App.idEdicao ? `/${ep}/${App.idEdicao}` : `/${ep}`;
        const method = App.idEdicao ? 'PUT' : 'POST';

        const resultado = await App.api(endpoint, method, p);
        if (!resultado) throw new Error("Erro de comunicação com a API");

        App.showToast('Registo salvo com sucesso!', 'success');
        App.fecharModal();
        
        if (typeof App.renderizarLista === 'function') {
            App.renderizarLista(t);
        }
    } catch (err) {
        if(err.message !== "Validação Falhou") {
            console.error(err);
            App.showToast("Erro ao guardar dados. Verifique a ligação.", "error");
        }
    } finally {
        if(btn) { btn.innerText = txtOriginal; btn.disabled = false; }
        document.body.style.cursor = 'default';
    }
};