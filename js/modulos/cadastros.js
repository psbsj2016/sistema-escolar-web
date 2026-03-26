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
    if(btn) { btn.innerText = "Salvando... ⏳"; btn.disabled = true; }
    document.body.style.cursor = 'wait';

    try {
        // 🛡️ CORREÇÃO PRINCIPAL: Buscar o registo original (se existir) para não perder dados que não estão no formulário
        let p = {};
        if (App.idEdicao) {
            try {
                const original = await App.api(`/${ep}/${App.idEdicao}`);
                if (original) p = { ...original };
            } catch(e) { console.warn("Aviso: Falha ao buscar dados originais", e); }
            p.id = App.idEdicao;
        }

        if (t === 'aluno') {
            p.nome = document.getElementById('a-nome').value;
            p.status = document.getElementById('a-status').value; // 👈 AGORA GUARDA FIELMENTE A ESCOLHA DO SELECT
            p.cpf = document.getElementById('a-cpf').value;
            p.rg = document.getElementById('a-rg').value;
            p.nascimento = document.getElementById('a-nasc').value;
            p.sexo = document.getElementById('a-sexo').value;
            p.whatsapp = document.getElementById('a-zap').value;
            p.profissao = document.getElementById('a-prof').value;
            p.curso = document.getElementById('a-curso').value;
            p.turma = document.getElementById('a-turma').value;
            p.rua = document.getElementById('a-rua').value;
            p.numero = document.getElementById('a-num').value;
            p.bairro = document.getElementById('a-bairro').value;
            p.cidade = document.getElementById('a-cidade').value;
            p.estado = document.getElementById('a-uf').value;
            p.pais = document.getElementById('a-pais').value;
            p.resp_nome = document.getElementById('r-nome').value;
            p.resp_cpf = document.getElementById('r-cpf').value;
            p.resp_zap = document.getElementById('r-zap').value;
            
            if(!p.nome) { App.showToast("O nome do aluno é obrigatório!", "error"); throw new Error("Validação Falhou"); }
            if(p.cpf && p.cpf.length !== 14) { App.showToast("O CPF do aluno deve estar completo (14 caracteres).", "warning"); throw new Error("Validação Falhou"); }
            if(p.resp_cpf && p.resp_cpf.length !== 14) { App.showToast("O CPF do responsável deve estar completo.", "warning"); throw new Error("Validação Falhou"); }
            if(p.whatsapp && p.whatsapp.length < 14) { App.showToast("Preencha o WhatsApp corretamente com o código de área.", "warning"); throw new Error("Validação Falhou"); }
        } 
        else if (t === 'turma') {
            p.nome = document.getElementById('t-nome').value;
            p.curso = document.getElementById('t-curso').value;
            p.dia = document.getElementById('t-dia').value;
            p.horario = document.getElementById('t-horario').value;
            if(!p.nome) { App.showToast("Nome da turma é obrigatório!", "error"); throw new Error("Validação Falhou"); }
        } 
        else if (t === 'curso') {
            p.nome = document.getElementById('c-nome').value;
            p.carga = document.getElementById('c-carga').value;
            if(!p.nome) { App.showToast("Nome do curso é obrigatório!", "error"); throw new Error("Validação Falhou"); }
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

        App.showToast('Registro salvo com sucesso!', 'success');
        App.fecharModal();
        
        if (typeof App.renderizarLista === 'function') {
            App.renderizarLista(t);
        }
    } catch (err) {
        if(err.message !== "Validação Falhou") {
            console.error(err);
            App.showToast("Erro ao salvar dados. Verifique a conexão.", "error");
        }
    } finally {
        if(btn) { btn.innerText = txtOriginal; btn.disabled = false; }
        document.body.style.cursor = 'default';
    }
};