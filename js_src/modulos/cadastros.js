// =========================================================
// MÓDULO DE CADASTROS V107 (MULTI-SELECT ELEGANTE PARA TURMAS E DOSSIÊ COMPLETO)
// =========================================================

// 🛡️ FUNÇÕES AUXILIARES SEGURAS
const lerInput = (id) => { 
    const el = document.getElementById(id); 
    return el ? el.value.trim() : ''; 
};

const lerNum = (id) => { 
    const el = document.getElementById(id); 
    if (!el || !el.value) return 0;
    const val = parseFloat(el.value);
    return isNaN(val) ? 0 : val;
};

// 🧠 Função Inteligente: Verifica a Idade do Aluno em tempo real
App.verificarMaioridade = () => {
    const elNasc = document.getElementById('alu-nasc');
    const boxResp = document.getElementById('box-responsavel');
    if (!elNasc || !boxResp) return;
    
    if (!elNasc.value) {
        boxResp.style.display = 'none';
        return;
    }

    const hoje = new Date();
    const nasc = new Date(elNasc.value);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
        idade--;
    }

    if (idade < 18) {
        boxResp.style.display = 'block';
        boxResp.style.animation = 'fadeIn 0.5s';
    } else {
        boxResp.style.display = 'none';
    }
};

// 🎨 Função Visual: Atualiza o texto do campo bonito de dias da Turma
App.atualizarDisplayDias = () => {
    const checkboxes = document.querySelectorAll('.turma-dia-chk:checked');
    const dias = Array.from(checkboxes).map(chk => chk.value);
    const display = document.getElementById('tur-dia-display');
    if(display) {
        display.innerText = dias.length > 0 ? dias.join(', ') : '-- Selecione os dias --';
    }
};

// Fecha o dropdown se clicar fora dele
document.addEventListener('click', function(e) {
    const wrapper = document.getElementById('tur-dia-wrapper');
    const options = document.getElementById('tur-dia-options');
    if (options && wrapper && !wrapper.contains(e.target)) {
        options.style.display = 'none';
    }
});

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
        
        if (tipo === 'aluno' || tipo === 'turma') {
            const [c, t] = await Promise.all([ App.api('/cursos'), App.api('/turmas') ]);
            listas.cursos = Array.isArray(c) ? c : [];
            listas.turmas = Array.isArray(t) ? t : [];
        }

        const UI = App.UI;
        let html = '';

        if (tipo === 'aluno') {
            const opcoesTurmas = listas.turmas.length > 0 
                ? '<option value="">-- Selecione a Turma --</option>' + listas.turmas.map(x => `<option value="${x.nome}" ${dados.turma === x.nome ? 'selected' : ''}>${App.escapeHTML(x.nome)}</option>`).join('')
                : '<option value="">-- Cadastre uma Turma Primeiro --</option>';

            const opcoesCursos = listas.cursos.length > 0 
                ? '<option value="">-- Selecione o Curso --</option>' + listas.cursos.map(x => `<option value="${x.nome}" ${dados.curso === x.nome ? 'selected' : ''}>${App.escapeHTML(x.nome)}</option>`).join('')
                : '<option value="">-- Cadastre um Curso Primeiro --</option>';

            html = `
                <h4 style="margin: 0 0 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; color:#2c3e50;">1. Dados Pessoais</h4>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                    ${UI.input('Nome Completo *', 'alu-nome', dados.nome)}
                    ${UI.input('E-mail', 'alu-email', dados.email, 'email@exemplo.com', 'email')}
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                    ${UI.input('WhatsApp *', 'alu-zap', dados.whatsapp, '(00) 00000-0000', 'text', 'oninput="App.mascaraCelular(this)"')}
                    ${UI.input('CPF', 'alu-cpf', dados.cpf, '000.000.000-00', 'text', 'oninput="App.mascaraCPF(this)"')}
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                    ${UI.input('RG', 'alu-rg', dados.rg, '00.000.000-0', 'text')}
                    ${UI.input('Data de Nascimento', 'alu-nasc', dados.nascimento, '', 'date', 'onchange="App.verificarMaioridade()" onblur="App.verificarMaioridade()"')}
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px;">
                    <div class="input-group">
                        <label>Sexo</label>
                        <select id="alu-sexo">
                            <option value="">-- Selecione --</option>
                            <option value="Masculino" ${dados.sexo === 'Masculino' ? 'selected' : ''}>Masculino</option>
                            <option value="Feminino" ${dados.sexo === 'Feminino' ? 'selected' : ''}>Feminino</option>
                        </select>
                    </div>
                    ${UI.input('Profissão / Ocupação', 'alu-prof', dados.profissao, 'Ex: Estudante')}
                </div>

                <div id="box-responsavel" style="display: none; background: #fff3e0; padding: 15px; border-radius: 8px; border: 1px dashed #e67e22; margin-bottom: 20px;">
                    <h4 style="margin-top: 0; color: #d35400; margin-bottom: 10px;">👤 Dados do Responsável Legal (Menor de Idade)</h4>
                    <div style="display:grid; grid-template-columns:2fr 1fr; gap:15px; margin-bottom:10px;">
                        ${UI.input('Nome do Responsável', 'alu-resp-nome', dados.resp_nome, 'Ex: Maria da Silva')}
                        <div class="input-group">
                            <label>Grau de Parentesco</label>
                            <select id="alu-resp-parentesco">
                                <option value="">-- Selecione --</option>
                                <option value="Pai" ${dados.resp_parentesco === 'Pai' ? 'selected' : ''}>Pai</option>
                                <option value="Mãe" ${dados.resp_parentesco === 'Mãe' ? 'selected' : ''}>Mãe</option>
                                <option value="Avô/Avó" ${dados.resp_parentesco === 'Avô/Avó' ? 'selected' : ''}>Avô/Avó</option>
                                <option value="Tio/Tia" ${dados.resp_parentesco === 'Tio/Tia' ? 'selected' : ''}>Tio/Tia</option>
                                <option value="Outro" ${dados.resp_parentesco === 'Outro' ? 'selected' : ''}>Outro</option>
                            </select>
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                        ${UI.input('CPF do Responsável', 'alu-resp-cpf', dados.resp_cpf, '000.000.000-00', 'text', 'oninput="App.mascaraCPF(this)"')}
                        ${UI.input('WhatsApp do Responsável', 'alu-resp-zap', dados.resp_zap, '(00) 00000-0000', 'text', 'oninput="App.mascaraCelular(this)"')}
                    </div>
                </div>

                <h4 style="margin: 0 0 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; color:#2c3e50;">2. Endereço Completo</h4>
                <div style="display:grid; grid-template-columns:2fr 1fr; gap:15px; margin-bottom:15px;">
                    ${UI.input('Logradouro (Rua/Av)', 'alu-rua', dados.rua, 'Ex: Rua das Flores')}
                    ${UI.input('Número', 'alu-num', dados.numero, '123', 'text')}
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                    ${UI.input('Bairro', 'alu-bairro', dados.bairro)}
                    ${UI.input('Cidade', 'alu-cidade', dados.cidade)}
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px;">
                    ${UI.input('Estado (UF)', 'alu-uf', dados.estado, 'Ex: SP', 'text', 'maxlength="2"')}
                    ${UI.input('País', 'alu-pais', dados.pais || 'Brasil')}
                </div>

                <h4 style="margin: 0 0 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; color:#2c3e50;">3. Matrícula</h4>
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

            // 🧠 Componente Customizado: Select com Checkboxes!
            const diasSalvos = dados.dia ? dados.dia.split(',').map(d => d.trim()) : [];
            const checkDia = (dia) => `
                <label style="display:flex; align-items:center; gap:8px; padding:10px; cursor:pointer; border-bottom:1px solid #f0f0f0; margin:0; transition: background 0.2s;" onmouseover="this.style.background='#f9f9f9'" onmouseout="this.style.background='transparent'">
                    <input type="checkbox" class="turma-dia-chk" value="${dia}" ${diasSalvos.includes(dia) ? 'checked' : ''} onchange="App.atualizarDisplayDias()">
                    <span style="font-weight: normal;">${dia}</span>
                </label>
            `;

            html = `
                <div class="input-group">${UI.input('Nome da Turma *', 'tur-nome', dados.nome, 'Ex: Inglês Kids T1')}</div>
                
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                    <div class="input-group" id="tur-dia-wrapper" style="position: relative;">
                        <label>Dia(s) da Aula</label>
                        <div id="tur-dia-display" 
                             style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; background: #fff url('data:image/svg+xml;utf8,<svg fill=%22%23333%22 height=%2224%22 viewBox=%220 0 24 24%22 width=%2224%22 xmlns=%22http://www.w3.org/2000/svg%22><path d=%22M7 10l5 5 5-5z%22/><path d=%22M0 0h24v24H0z%22 fill=%22none%22/></svg>') no-repeat right 10px center; cursor: pointer; min-height: 41px; display: flex; align-items: center; padding-right: 30px; font-size: 14px; box-sizing: border-box;" 
                             onclick="const opt = document.getElementById('tur-dia-options'); opt.style.display = opt.style.display === 'block' ? 'none' : 'block';">
                            ${diasSalvos.length > 0 ? diasSalvos.join(', ') : '-- Selecione os dias --'}
                        </div>
                        <div id="tur-dia-options" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: #fff; border: 1px solid #ccc; border-radius: 5px; z-index: 999; max-height: 200px; overflow-y: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-top: 2px;">
                            ${checkDia('Segunda-feira')}
                            ${checkDia('Terça-feira')}
                            ${checkDia('Quarta-feira')}
                            ${checkDia('Quinta-feira')}
                            ${checkDia('Sexta-feira')}
                            ${checkDia('Sábado')}
                            ${checkDia('Diversos (Flexível)')}
                        </div>
                    </div>
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

        if(conteudo) {
            conteudo.innerHTML = html;
            if (tipo === 'aluno') setTimeout(() => App.verificarMaioridade(), 100);
        }
        
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
            p.rg = lerInput('alu-rg');
            p.nascimento = lerInput('alu-nasc');
            p.sexo = lerInput('alu-sexo');
            p.profissao = lerInput('alu-prof');

            p.rua = lerInput('alu-rua');
            p.numero = lerInput('alu-num');
            p.bairro = lerInput('alu-bairro');
            p.cidade = lerInput('alu-cidade');
            p.estado = lerInput('alu-uf');
            p.pais = lerInput('alu-pais');

            p.turma = lerInput('alu-turma');
            p.curso = lerInput('alu-curso');
            p.status = lerInput('alu-status') || 'Ativo';

            // 🧠 NOVA LÓGICA DO RESPONSÁVEL: Direta, Visual e à prova de falhas
            const boxResp = document.getElementById('box-responsavel');
            const isMenorVisivel = boxResp && boxResp.style.display !== 'none';

            if (isMenorVisivel) {
                p.resp_nome = lerInput('alu-resp-nome');
                p.resp_parentesco = lerInput('alu-resp-parentesco'); // Salva o select perfeitamente
                p.resp_cpf = lerInput('alu-resp-cpf');
                p.resp_zap = lerInput('alu-resp-zap');
            } else {
                p.resp_nome = '';
                p.resp_parentesco = '';
                p.resp_cpf = '';
                p.resp_zap = '';
            }

            if(!p.nome || !p.whatsapp) { App.showToast("Nome e WhatsApp são obrigatórios!", "error"); throw new Error("Validação Falhou"); }
        } 
        else if (t === 'turma') {
            p.nome = lerInput('tur-nome');
            p.horario = lerInput('tur-hora');
            p.curso = lerInput('tur-curso');
            const checkboxes = document.querySelectorAll('.turma-dia-chk:checked');
            p.dia = Array.from(checkboxes).map(chk => chk.value).join(', ');
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