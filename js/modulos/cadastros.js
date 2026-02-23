// =========================================================
// MÓDULO DE CADASTROS V100 (FICHA DE ALUNO COMPLETA)
// =========================================================

// Função conectada ao App principal
App.abrirModalCadastroModulo = async (tipo, id) => {
    App.entidadeAtual = tipo;
    App.idEdicao = id;
    
    // Abre o Modal
    const modal = document.getElementById('modal-overlay');
    if(modal) modal.style.display = 'flex';
    
    // Elementos do Modal
    const titulo = document.getElementById('modal-titulo');
    const conteudo = document.getElementById('modal-form-content');
    
    if(titulo) titulo.innerText = id ? `Editar ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}` : `Novo ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;
    if(conteudo) conteudo.innerHTML = '<p style="padding:20px; text-align:center; color:#666;">Carregando formulário...</p>';

    let dados = {};
    let listas = { cursos: [], turmas: [] };

    try {
        if (id) {
            const endpoint = tipo === 'financeiro' ? 'financeiro' : tipo + 's';
            dados = await fetch(`${API_URL}/${endpoint}/${id}`).then(r => r.json());
        }
        
        if (tipo === 'aluno' || tipo === 'turma') {
            const [c, t] = await Promise.all([
                fetch(`${API_URL}/cursos`).then(r => r.json()),
                fetch(`${API_URL}/turmas`).then(r => r.json())
            ]);
            listas.cursos = c;
            listas.turmas = t;
        }
    } catch (e) { console.error("Erro ao carregar dados:", e); }

    const v = (val) => val || '';
    let html = '';

    // Estilos
    const rowStyle = 'display: grid; grid-template-columns: 1fr 1fr; gap: 20px;';
    const row3Style = 'display: grid; grid-template-columns: 2fr 1fr; gap: 20px;'; // Para Rua e Número
    const titleStyle = 'color: #2c3e50; font-size: 14px; font-weight: 600; margin: 25px 0 10px 0; border-bottom: 1px solid #eee; padding-bottom: 5px;';

    // --- FORMULÁRIO DE ALUNO (COMPLETO) ---
    if (tipo === 'aluno') {
        const opTurma = `<option value="">-- Selecione --</option>` + listas.turmas.map(t => `<option value="${t.nome}" ${v(dados.turma)===t.nome?'selected':''}>${t.nome}</option>`).join('');
        const opCurso = `<option value="">-- Selecione --</option>` + listas.cursos.map(c => `<option value="${c.nome}" ${v(dados.curso)===c.nome?'selected':''}>${c.nome}</option>`).join('');
        
        html = `
        <div style="${titleStyle} margin-top:0;">1. Dados Pessoais</div>
        <div class="input-group"><label>Nome Completo</label><input id="a-nome" value="${v(dados.nome)}" placeholder="Ex: João da Silva"></div>
        
        <div style="${rowStyle}">
            <div class="input-group"><label>CPF</label><input id="a-cpf" value="${v(dados.cpf)}" placeholder="000.000.000-00" oninput="App.mascaraCPF(this)" maxlength="14"></div>
            <div class="input-group"><label>RG</label><input id="a-rg" value="${v(dados.rg)}"></div>
        </div>

        <div style="${rowStyle}">
            <div class="input-group"><label>Data Nascimento</label><input type="date" id="a-nasc" value="${v(dados.nascimento)}"></div>
            <div class="input-group">
                <label>Sexo</label>
                <select id="a-sexo" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px; background:#fafafa;">
                    <option value="">-- Selecione --</option>
                    <option value="Masculino" ${v(dados.sexo) === 'Masculino' ? 'selected' : ''}>Masculino</option>
                    <option value="Feminino" ${v(dados.sexo) === 'Feminino' ? 'selected' : ''}>Feminino</option>
                </select>
            </div>
        </div>

        <div style="${rowStyle}">
            <div class="input-group"><label>WhatsApp/Celular</label><input id="a-zap" value="${v(dados.whatsapp)}" placeholder="(00) 00000-0000" oninput="App.mascaraCelular(this)" maxlength="15"></div>
            <div class="input-group"><label>Profissão / Ocupação</label><input id="a-prof" value="${v(dados.profissao)}" placeholder="Ex: Estudante"></div>
        </div>

        <div style="${titleStyle}">2. Matrícula</div>
        <div style="${rowStyle}">
            <div class="input-group"><label>Curso</label><select id="a-curso">${opCurso}</select></div>
            <div class="input-group"><label>Turma</label><select id="a-turma">${opTurma}</select></div>
        </div>

        <div style="${titleStyle}">3. Endereço Completo</div>
        <div style="${row3Style}">
            <div class="input-group"><label>Logradouro (Rua/Av)</label><input id="a-rua" value="${v(dados.rua)}" placeholder="Ex: Rua das Flores"></div>
            <div class="input-group"><label>Número</label><input id="a-num" value="${v(dados.numero)}" placeholder="123"></div>
        </div>
        <div style="${rowStyle}">
            <div class="input-group"><label>Bairro</label><input id="a-bairro" value="${v(dados.bairro)}"></div>
            <div class="input-group"><label>Cidade</label><input id="a-cidade" value="${v(dados.cidade)}"></div>
        </div>
        <div style="${rowStyle}">
            <div class="input-group"><label>Estado (UF)</label><input id="a-uf" value="${v(dados.estado)}" placeholder="Ex: SP" maxlength="2"></div>
            <div class="input-group"><label>País</label><input id="a-pais" value="${v(dados.pais) || 'Brasil'}"></div>
        </div>

        <div style="${titleStyle}">4. Dados do Responsável (Se menor)</div>
        <div class="input-group"><label>Nome do Responsável</label><input id="r-nome" value="${v(dados.resp_nome)}"></div>
        <div style="${rowStyle}">
            <div class="input-group"><label>CPF do Responsável</label><input id="r-cpf" value="${v(dados.resp_cpf)}" placeholder="000.000.000-00" oninput="App.mascaraCPF(this)" maxlength="14"></div>
            <div class="input-group"><label>WhatsApp do Responsável</label><input id="r-zap" value="${v(dados.resp_zap)}" placeholder="(00) 00000-0000" oninput="App.mascaraCelular(this)" maxlength="15"></div>
        </div>
        `;
    } 
    // --- FORMULÁRIO DE TURMA ---
    else if (tipo === 'turma') {
        const opCurso = `<option value="">-- Selecione --</option>` + listas.cursos.map(c => `<option value="${c.nome}" ${v(dados.curso)===c.nome?'selected':''}>${c.nome}</option>`).join('');
        html = `
        <div class="input-group"><label>Nome da Turma</label><input id="t-nome" value="${v(dados.nome)}" placeholder="Ex: Turma A - Manhã"></div>
        <div class="input-group"><label>Curso Vinculado</label><select id="t-curso">${opCurso}</select></div>
        <div style="${rowStyle}">
            <div class="input-group"><label>Dias de Aula</label><input id="t-dia" value="${v(dados.dia)}" placeholder="Ex: Seg e Qua"></div>
            <div class="input-group"><label>Horário</label><input id="t-horario" value="${v(dados.horario)}" type="time"></div>
        </div>`;
    }
    // --- FORMULÁRIO DE CURSO ---
    else if (tipo === 'curso') {
        html = `
        <div class="input-group"><label>Nome do Curso</label><input id="c-nome" value="${v(dados.nome)}" placeholder="Ex: Inglês Básico"></div>
        <div class="input-group"><label>Carga Horária (Horas)</label><input id="c-carga" value="${v(dados.carga)}" placeholder="Ex: 40h"></div>
        `;
    }

    if(conteudo) conteudo.innerHTML = html;
};

// Função de Salvar (Atualizada para a Nuvem Multi-Tenant)
App.salvarCadastro = async () => {
    const t = App.entidadeAtual; // 'aluno', 'turma', etc.
    const ep = t === 'financeiro' ? 'financeiro' : t + 's'; // endpoint da API
    const p = {}; // Objeto payload

    try {
        // --- COLETA DE DADOS DO ALUNO ---
        if (t === 'aluno') {
            p.nome = document.getElementById('a-nome').value;
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
            
            if(!p.nome) {
                // ERRO SE NOME VAZIO
                App.showToast("O nome do aluno é obrigatório!", "error");
                return; 
            }
        } 
        // --- COLETA DE DADOS DA TURMA ---
        else if (t === 'turma') {
            p.nome = document.getElementById('t-nome').value;
            p.curso = document.getElementById('t-curso').value;
            p.dia = document.getElementById('t-dia').value;
            p.horario = document.getElementById('t-horario').value;
            
            if(!p.nome) {
                App.showToast("Nome da turma é obrigatório!", "error");
                return;
            }
        } 
        // --- COLETA DE DADOS DO CURSO ---
        else if (t === 'curso') {
            p.nome = document.getElementById('c-nome').value;
            p.carga = document.getElementById('c-carga').value;
            
            if(!p.nome) {
                App.showToast("Nome do curso é obrigatório!", "error");
                return;
            }
        }

        // --- ENVIO PARA A API (BLINDADA COM RENDER/MONGODB) ---
        // Aqui está a mudança: construímos o endpoint correto e usamos o App.api
        const endpoint = App.idEdicao ? `/${ep}/${App.idEdicao}` : `/${ep}`;
        const method = App.idEdicao ? 'PUT' : 'POST';

        // Usa o NOSSO motor em vez do fetch padrão para garantir o isolamento de dados
        const resultado = await App.api(endpoint, method, p);

        // Se o servidor retornou null, é porque deu algum erro na conexão
        if (!resultado) throw new Error("Erro de comunicação com a API");

        // --- SUCESSO! AQUI ESTÁ A MÁGICA ---
        App.showToast('Registro salvo com sucesso!', 'success');
        
        App.fecharModal();
        
        // Atualiza a lista atrás do modal
        if(typeof App.renderizarLista === 'function' && document.getElementById('container-tabela')) {
            App.renderizarLista(t);
        } else {
            if(typeof App.renderizarInicio === 'function') App.renderizarInicio();
        }

    } catch (err) {
        console.error(err);
        // --- ERRO GENÉRICO ---
        App.showToast("Erro ao salvar dados. Verifique a conexão.", "error");
    }
};