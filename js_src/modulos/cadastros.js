// =========================================================
// MÓDULO DE CADASTROS V105 (STATUS BLINDADO, PRESERVAÇÃO E PARSERS SEGUROS)
// =========================================================

// 🛡️ FUNÇÕES AUXILIARES SEGURAS (Evitam que o sistema quebre se um campo não existir)
const lerInput = (id) => { 
    const el = document.getElementById(id); 
    return el ? el.value.trim() : ''; 
};

const lerNum = (id) => { 
    const el = document.getElementById(id); 
    if (!el || !el.value) return 0;
    // Tenta converter, se falhar ou não for número, retorna 0
    const val = parseFloat(el.value);
    return isNaN(val) ? 0 : val;
};

App.abrirModalCadastroModulo = async (tipo, id) => {
    App.entidadeAtual = tipo;
    App.idEdicao = id;
    
    const modal = document.getElementById('modal-overlay');
    if(modal) modal.style.display = 'flex';
    
    const titulo = document.getElementById('modal-titulo');
    const conteudo = document.getElementById('modal-form-content');
    
    if(titulo) titulo.innerText = id ? `Editar ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}` : `Novo ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;
    if(conteudo) conteudo.innerHTML = '<p style="padding:20px; text-align:center; color:#666;">Carregando formulário... ⏳</p>';

    let dados = {};
    let listas = { cursos: [], turmas: [] };

    try {
        if (id) {
            const endpoint = tipo === 'financeiro' ? 'financeiro' : tipo + 's';
            dados = await App.api(`/${endpoint}/${id}`);
        }
        
        // 🛡️ Buscamos as listas com fallback para Array vazio se a API falhar
        if (tipo === 'aluno' || tipo === 'turma') {
            const [c, t] = await Promise.all([ App.api('/cursos'), App.api('/turmas') ]);
            listas.cursos = Array.isArray(c) ? c : [];
            listas.turmas = Array.isArray(t) ? t : [];
        }

        const UI = App.UI;
        let html = '';

        if (tipo === 'aluno') {
            // Se não houver turmas/cursos, criamos uma opção em branco inteligente
            const opcoesTurmas = listas.turmas.length > 0 
                ? '<option value="">-- Selecione a Turma --</option>' + listas.turmas.map(x => `<option value="${x.nome}" ${dados.turma === x.nome ? 'selected' : ''}>${App.escapeHTML(x.nome)}</option>`).join('')
                : '<option value="">-- Cadastre uma Turma Primeiro --</option>';

            const opcoesCursos = listas.cursos.length > 0 
                ? '<option value="">-- Selecione o Curso --</option>' + listas.cursos.map(x => `<option value="${x.nome}" ${dados.curso === x.nome ? 'selected' : ''}>${App.escapeHTML(x.nome)}</option>`).join('')
                : '<option value="">-- Cadastre um Curso Primeiro --</option>';

            html = `
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                    ${UI.input('Nome Completo *', 'alu-nome', dados.nome)}
                    ${UI.input('E-mail', 'alu-email', dados.email, 'email@exemplo.com', 'email')}
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                    ${UI.input('WhatsApp *', 'alu-zap', dados.whatsapp, '(00) 00000-0000', 'text', 'oninput="App.mascaraCelular(this)"')}
                    ${UI.input('CPF', 'alu-cpf', dados.cpf, '000.000.000-00', 'text', 'oninput="App.mascaraCPF(this)"')}
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                    <div class="input-group"><label>Turma / Horário</label><select id="alu-turma">${opcoesTurmas}</select></div>
                    <div class="input-group"><label>Curso Vinculado</label><select id="alu-curso">${opcoesCursos}</select></div>
                </div>
                <div class="input-group">
                    <label>Status de Matrícula</label>
                    <select id="alu-status">
                        <option value="Ativo" ${!dados.status || dados.status === 'Ativo' ? 'selected' : ''}>🟢 Ativo (Estudando)</option>
                        <option value="Trancado" ${dados.status === 'Trancado' ? 'selected' : ''}>🟡 Trancado (Matrícula Pausada)</option>
                        <option value="Cancelado" ${dados.status === 'Cancelado' ? 'selected' : ''}>🔴 Cancelado (Desistente)</option>
                    </select>
                </div>
            `;
        } 
        else if (tipo === 'turma') {
            const opcoesCursos = listas.cursos.length > 0 
                ? '<option value="">-- Sem Curso Específico --</option>' + listas.cursos.map(x => `<option value="${x.nome}" ${dados.curso === x.nome ? 'selected' : ''}>${App.escapeHTML(x.nome)}</option>`).join('')
                : '<option value="">-- Cadastre um Curso Primeiro --</option>';

            html = `
                <div class="input-group">${UI.input('Nome da Turma *', 'tur-nome', dados.nome, 'Ex: Inglês Kids T1')}</div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                    <div class="input-group"><label>Dia(s) da Aula</label><select id="tur-dia">
                        <option value="Segunda-feira" ${dados.dia === 'Segunda-feira' ? 'selected' : ''}>Segunda-feira</option>
                        <option value="Terça-feira" ${dados.dia === 'Terça-feira' ? 'selected' : ''}>Terça-feira</option>
                        <option value="Quarta-feira" ${dados.dia === 'Quarta-feira' ? 'selected' : ''}>Quarta-feira</option>
                        <option value="Quinta-feira" ${dados.dia === 'Quinta-feira' ? 'selected' : ''}>Quinta-feira</option>
                        <option value="Sexta-feira" ${dados.dia === 'Sexta-feira' ? 'selected' : ''}>Sexta-feira</option>
                        <option value="Sábado" ${dados.dia === 'Sábado' ? 'selected' : ''}>Sábado</option>
                        <option value="Diversos (Flexível)" ${dados.dia === 'Diversos (Flexível)' ? 'selected' : ''}>Diversos (Flexível)</option>
                    </select></div>
                    ${UI.input('Horário', 'tur-hora', dados.horario, 'Ex: 14:00 às 16:00')}
                </div>
                <div class="input-group"><label>Curso Padrão desta Turma</label><select id="tur-curso">${opcoesCursos}</select></div>
            `;
        } 
        else if (tipo === 'curso') {
            html = `
                <div class="input-group">${UI.input('Nome do Curso *', 'cur-nome', dados.nome, 'Ex: Informática Essencial')}</div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                    ${UI.input('Carga Horária (Horas)', 'cur-carga', dados.carga, 'Ex: 80', 'number')}
                    ${UI.input('Valor Padrão (Mensalidade) R$', 'cur-valor', dados.valor || '0.00', '0.00', 'number')}
                </div>
                <div class="input-group"><label>Descrição Breve</label><textarea id="cur-desc" rows="3" style="width:100%; padding:10px; border-radius:5px; border:1px solid #ccc;">${dados.descricao || ''}</textarea></div>
            `;
        }
        else if (tipo === 'estoque') {
            html = `
                <div class="input-group">${UI.input('Nome do Produto/Serviço *', 'est-nome', dados.nome, 'Ex: Apostila Módulo 1')}</div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                    ${UI.input('Código / SKU', 'est-codigo', dados.codigo, 'Ex: APOST01')}
                    ${UI.input('Valor de Venda (R$)', 'est-valor', dados.valor || '0.00', '0.00', 'number')}
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                    ${UI.input('Quantidade Atual', 'est-qtd', dados.quantidade || '0', '0', 'number')}
                    ${UI.input('Alerta de Mínimo', 'est-min', dados.quantidadeMinima || '5', '5', 'number')}
                </div>
                <div class="input-group"><label>Observações</label><textarea id="est-obs" rows="2" style="width:100%; padding:10px; border-radius:5px; border:1px solid #ccc;">${dados.obs || ''}</textarea></div>
            `;
        }

        if(conteudo) conteudo.innerHTML = html;
        
        const btnConfirm = document.querySelector('.btn-confirm');
        if(btnConfirm) {
            btnConfirm.setAttribute('onclick', 'App.salvarCadastro()');
            btnConfirm.innerHTML = "💾 Salvar Registro";
        }
    } catch (e) { 
        console.error("Erro no formulário:", e);
        if(conteudo) conteudo.innerHTML = '<p style="color:red; text-align:center;">Erro ao carregar o formulário. Verifique a internet.</p>'; 
    }
};

App.salvarCadastro = async () => {
    const t = App.entidadeAtual;
    const ep = t === 'financeiro' ? 'financeiro' : t + 's';
    let p = {};
    
    // Mostra estado de loading
    const btn = document.querySelector('.btn-confirm');
    const txtOriginal = btn ? btn.innerText : 'Salvar';
    if(btn) { btn.innerText = "A guardar... ⏳"; btn.disabled = true; }
    document.body.style.cursor = 'wait';

    try {
        if (t === 'aluno') {
            p.nome = lerInput('alu-nome');
            p.email = lerInput('alu-email');
            p.whatsapp = lerInput('alu-zap');
            p.cpf = lerInput('alu-cpf');
            p.turma = lerInput('alu-turma');
            p.curso = lerInput('alu-curso');
            p.status = lerInput('alu-status') || 'Ativo';
            if(!p.nome || !p.whatsapp) { App.showToast("Nome e WhatsApp são obrigatórios!", "error"); throw new Error("Validação Falhou"); }
        } 
        else if (t === 'turma') {
            p.nome = lerInput('tur-nome');
            p.dia = lerInput('tur-dia');
            p.horario = lerInput('tur-hora');
            p.curso = lerInput('tur-curso');
            if(!p.nome) { App.showToast("O nome da turma é obrigatório!", "error"); throw new Error("Validação Falhou"); }
        } 
        else if (t === 'curso') {
            p.nome = lerInput('cur-nome');
            p.carga = lerInput('cur-carga');
            p.valor = lerNum('cur-valor');
            p.descricao = lerInput('cur-desc');
            if(!p.nome) { App.showToast("O nome do curso é obrigatório!", "error"); throw new Error("Validação Falhou"); }
        }
        else if (t === 'estoque') {
            p.nome = lerInput('est-nome');
            p.codigo = lerInput('est-codigo');
            p.obs = lerInput('est-obs');
            p.valor = lerNum('est-valor');
            p.quantidade = parseInt(lerInput('est-qtd')) || 0;
            p.quantidadeMinima = parseInt(lerInput('est-min')) || 0;
            if(!p.nome) { App.showToast("O nome do item é obrigatório!", "error"); throw new Error("Validação Falhou"); }
        }

        const endpoint = App.idEdicao ? `/${ep}/${App.idEdicao}` : `/${ep}`;
        const method = App.idEdicao ? 'PUT' : 'POST';

        const resultado = await App.api(endpoint, method, p);
        if (!resultado || resultado.error) throw new Error(resultado ? resultado.error : "Erro de comunicação com a API");

        App.showToast('Registo salvo com sucesso! 🎉', 'success');
        App.fecharModal();
        
        if (typeof App.renderizarLista === 'function') {
            App.renderizarLista(t);
        } else if (typeof App.renderizarInicio === 'function') {
            App.renderizarInicio();
        }

    } catch (err) {
        if(err.message !== "Validação Falhou") {
            App.showToast(err.message || "Ocorreu um erro ao salvar.", "error");
            console.error("Erro completo:", err);
        }
    } finally {
        if(btn) { btn.innerText = txtOriginal; btn.disabled = false; }
        document.body.style.cursor = 'default';
    }
};