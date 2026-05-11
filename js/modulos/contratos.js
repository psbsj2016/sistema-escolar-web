window.App = window.App || {};
window.CONFIG = window.CONFIG || {};

const App = window.App;
const CONFIG = window.CONFIG;

// =========================================================
// MÓDULO CONTRATOS - LINKS, MATRÍCULA ONLINE E COFRE
// =========================================================

Object.assign(App, {

abrirVisualizacaoContrato: async function(idContrato) {
    // 1. Mostrar estado de carregamento no modal
    const modal = document.getElementById('modal-overlay'); 
    if(modal) modal.style.display = 'flex';
    document.getElementById('modal-titulo').innerText = 'A abrir Ficha Completa... ⏳';
    document.getElementById('modal-form-content').innerHTML = '<p style="text-align:center; padding:30px; color:#666;">A extrair todos os dados do aluno e contrato da base de dados...</p>';
    
    const btnConfirm = document.querySelector('.btn-confirm');
    if(btnConfirm) btnConfirm.style.display = 'none';

    try {
        // 2. Procurar os dados com o motor automático (já com token)
        const contrato = await App.api(`/contratos/${idContrato}`);
        
        if (!contrato || contrato.error) {
            throw new Error(contrato ? contrato.error : "Documento não encontrado");
        }
        
        // 3. Mapear TODOS OS DADOS com exatidão do server.js
        const nomeAluno = contrato.nomeAluno || contrato.nome || "Aluno não identificado";
        const cpf = contrato.cpf || "Não informado";
        const rg = contrato.rg || "Não informado"; 
        // 🔄 CORREÇÃO: FORMATANDO A DATA PARA DIA/MÊS/ANO
        let dataNascimento = contrato.nascimento || "Não informada";
        if (dataNascimento !== "Não informada" && dataNascimento.includes('-')) {
            const partes = dataNascimento.split('-'); // Separa o Ano-Mês-Dia
            if (partes.length === 3) {
                dataNascimento = `${partes[2]}/${partes[1]}/${partes[0]}`; // Remonta como Dia/Mês/Ano
            }
        }
        const sexo = contrato.sexo || "Não informado";
        const profissao = contrato.profissao || "Não informada";
        const email = contrato.email || "Não informado";
        const telefone = contrato.whatsapp || "Não informado";
        const endereco = contrato.enderecoCompleto || "Não informado";
        
        const curso = contrato.curso || "Não informado";
        const turma = contrato.turma || "Não informada";
        const planoCurso = contrato.planoCurso || "Não informado";
        const vencimento = contrato.diaVencimento || "Não informado";
        const horario = contrato.horarioPreferencia || "Não informado";        

        const responsavel = contrato.resp_nome || "O Próprio / Não informado";
        const respParentesco = contrato.resp_parentesco || "Não informado";
        const respCpf = contrato.resp_cpf || "Não informado";
        const respZap = contrato.resp_zap || "Não informado";

        const corpoContrato = contrato.conteudoHTML
    ? App.sanitizeHTML(App.unescapeHTML(contrato.conteudoHTML))
    : "<p>O contrato não possui texto legível.</p>";
        const dataBr = (contrato.dataHoraRegistro || contrato.dataHora || contrato.createdAt) 
            ? new Date(contrato.dataHoraRegistro || contrato.dataHora || contrato.createdAt).toLocaleString('pt-BR') 
            : 'Data não registada';

        // 4. Montar o HTML super otimizado e segmentado
        document.getElementById('modal-titulo').innerText = `Matrícula: ${nomeAluno}`;
        document.getElementById('modal-form-content').innerHTML = `
            <div id="area-impressao-contrato" style="padding: 30px; border: 1px solid #ccc; background: #fff; position:relative; color: #333; font-family: Arial, sans-serif;">
                
                <div style="text-align:center; margin-bottom:20px; border-bottom:2px solid #2c3e50; padding-bottom:15px;">
                    <h2 style="margin:0; color:#2c3e50; font-size:22px; text-transform:uppercase;">Ficha de Matrícula e Contrato</h2>
                    <div style="color:#27ae60; font-size:12px; font-weight:bold; margin-top:8px; display:inline-block; border:1px solid #27ae60; padding:4px 12px; border-radius:20px; background:#eafaf1;">
                        ✅ AUTENTICADO DIGITALMENTE
                    </div>
                </div>
                
                <h4 style="background: #f0f3f4; padding: 8px; border-left: 4px solid #3498db; margin-bottom: 10px; font-size: 14px; color:#2c3e50; text-transform: uppercase;">📋 Dados do Aluno</h4>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px; line-height: 1.6;">
                    <tr>
                        <td style="padding: 6px; border-bottom: 1px solid #eee; width: 40%;"><b>Nome:</b> ${nomeAluno}</td>
                        <td style="padding: 6px; border-bottom: 1px solid #eee; width: 60%;"><b>Data de Nascimento:</b> ${dataNascimento}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>CPF:</b> ${cpf}</td>
                        <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>RG:</b> ${rg}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>Sexo:</b> ${sexo}</td>
                        <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>Profissão:</b> ${profissao}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>WhatsApp:</b> ${telefone}</td>
                        <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>E-mail:</b> ${email}</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="padding: 6px; border-bottom: 1px solid #eee;"><b>Endereço Completo:</b> ${endereco}</td>
                    </tr>
                </table>

                <h4 style="background: #f0f3f4; padding: 8px; border-left: 4px solid #9b59b6; margin-bottom: 10px; font-size: 14px; color:#2c3e50; text-transform: uppercase;">👨‍👩‍👧 Dados do Responsável</h4>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px; line-height: 1.6;">
                    <tr>
                        <td style="padding: 6px; border-bottom: 1px solid #eee; width: 40%;"><b>Nome:</b> ${responsavel}</td>
                        <td style="padding: 6px; border-bottom: 1px solid #eee; width: 60%;"><b>Parentesco:</b> ${respParentesco}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>CPF:</b> ${respCpf}</td>
                        <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>WhatsApp:</b> ${respZap}</td>
                    </tr>
                </table>

                <h4 style="background: #f0f3f4; padding: 8px; border-left: 4px solid #2ecc71; margin-bottom: 10px; font-size: 14px; color:#2c3e50; text-transform: uppercase;">🎓 Dados Acadêmicos e Financeiros</h4>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 25px; line-height: 1.6;">
                    <tr>
                        <td style="padding: 6px; border-bottom: 1px solid #eee; width: 40%;"><b>Curso:</b> ${curso}</td>
                        <td style="padding: 6px; border-bottom: 1px solid #eee; width: 60%;"><b>Turma:</b> ${turma}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>Plano de Curso:</b> ${planoCurso}</td>
                        <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>Dia de Vencimento:</b> ${vencimento}</td>
                        <td colspan="2" style="padding: 6px; border-bottom: 1px solid #eee; color: #27ae60;"><b>🕒 Horário de Preferência:</b> ${horario}</td>
                    </tr>
                </table>
                
                <h4 style="background: #f0f3f4; padding: 8px; border-left: 4px solid #e67e22; margin-bottom: 10px; font-size: 14px; color:#2c3e50; text-transform: uppercase;">📜 Termos do Contrato</h4>
                <div class="box-contrato-print" style="font-size:11px; text-align:justify; line-height:1.6; padding:10px; max-height:350px; overflow-y:auto; border: 1px solid #eee; background: #fafafa; border-radius: 4px; margin-bottom:20px;">
                    ${corpoContrato}
                </div>
                
                <div style="padding:15px; background:#eafaf1; border:1px solid #27ae60; text-align:center; font-size:12px; border-radius:6px; page-break-inside: avoid;">
                    <p style="margin:0 0 5px 0; color:#333;">Pelo presente instrumento, as partes concordam com todos os termos acima descritos.</p>
                    ✅ <b>ACEITE DIGITAL REGISTRADO COM VALIDADE JURÍDICA:</b><br>
                    <span style="font-size:16px; font-weight:bold; color:#1e8449; display:block; margin-top:5px;">📅 ${dataBr}</span>
                    <p style="margin:10px 0 0 0; font-size:10px; color:#7f8c8d;">ID da Transação: ${contrato._id || idContrato}</p>
                </div>
                
                <div style="margin-top: 50px; display: flex; justify-content: space-between; text-align: center; font-size: 12px; page-break-inside: avoid; color: #333;">
                    <div style="width: 45%;">
                        <div style="border-top: 1px solid #333; padding-top: 5px;">Assinatura do Responsável / Aluno</div>
                    </div>
                    <div style="width: 45%;">
                        <div style="border-top: 1px solid #333; padding-top: 5px;">Assinatura da Instituição</div>
                    </div>
                </div>

            </div>
        `;        

        // 5. Mostrar o botão de impressão
        if(btnConfirm) {
            btnConfirm.style.display = 'inline-flex';
            btnConfirm.style.background = '#2c3e50';
            btnConfirm.innerHTML = '🖨️ Imprimir Ficha';
            btnConfirm.setAttribute('onclick', `App.imprimirContrato()`);
        }
        
    } catch(e) {
        console.error("Falha ao abrir contrato:", e);
        document.getElementById('modal-titulo').innerText = 'Erro de Leitura';
        document.getElementById('modal-form-content').innerHTML = `<p style="color:red; text-align:center;">Não foi possível carregar a ficha completa.<br><small>${e.message}</small></p>`;
    }
},

    // =========================================================
    // 🧩 HUB CENTRAL DE CONTRATOS (CORRIGIDO E INTEGRADO)
    // =========================================================
    renderizarHubContratos: () => {
        App.setTitulo("Hub de Contratos e Matrículas");
        const div = document.getElementById('app-content');
        
        div.innerHTML = `
            <div class="card" style="margin-bottom: 20px; border-bottom: 3px solid #34495e;">
                <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center;">
                    <button class="btn-primary" onclick="App.mostrarAreaLinks()" style="background:#3498db; border:none;">🔗 Link de Matrícula</button>
                    <button class="btn-primary" onclick="App.renderizarContratos()" style="background:#2c3e50; border:none;">🗄️ Cofre de Contratos</button>
                    <button class="btn-primary" onclick="App.renderizarConfiguradorMatricula()" style="background:#f39c12; border:none;">⚙️ Configurar Formulário</button>
                </div>
            </div>
            <div id="area-dinamica-hub">
                <div class="card" style="text-align:center; padding:50px; opacity:0.6;">
                    <span style="font-size:40px;">📂</span>
                    <p>Selecione uma das opções acima para gerenciar suas matrículas e contratos.</p>
                </div>
            </div>
        `;
    },

    mostrarAreaLinks: async () => {
    const area = document.getElementById('area-dinamica-hub');
    area.innerHTML = '<p style="text-align:center; padding:20px; color:#666;">A carregar links... ⏳</p>';

    try {
        const escola = await App.api('/escola');

        if (!escola || escola.error || !escola.escolaId) {
            area.innerHTML = `
                <div class="card" style="text-align:center; color:#e74c3c;">
                    <h3>Erro ao carregar links</h3>
                    <p>Não foi possível identificar o ID da instituição.</p>
                </div>
            `;
            return;
        }

        const meuEscolaId = escola.escolaId;

        const linkBase = `${window.location.origin}${window.location.pathname.replace('index.html', '')}`;
        const linkBaseEscola = `${linkBase}matricula.html?escola=${encodeURIComponent(meuEscolaId)}`;

        const links = Array.isArray(escola.linksMatricula) ? escola.linksMatricula : [];

        const htmlLista = links.length === 0
            ? `<p style="text-align:center; color:#999; font-size:13px; padding:20px; border:1px dashed #ccc; border-radius:8px;">
                    Nenhum link/campanha gerado ainda.
               </p>`
            : links.map(link => {
                const urlCompleta = `${linkBaseEscola}&ref=${encodeURIComponent(link.id)}`;
                return `
                    <div style="background:#fff; border:1px solid #eee; padding:15px; border-radius:10px; margin-bottom:12px;">
                        <strong>${App.escapeHTML(link.nome || 'Link sem nome')}</strong>
                        <p style="font-size:12px; color:#777; margin:6px 0;">
                            Criado em: ${App.escapeHTML(link.criadoEm || '-')}
                        </p>

                        <input value="${urlCompleta}" readonly style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px; font-size:12px; margin-bottom:10px;">

                        <div style="display:flex; gap:8px; flex-wrap:wrap;">
                            <button class="btn-primary" onclick="navigator.clipboard.writeText('${urlCompleta}'); App.showToast('Link copiado!', 'success');" style="width:auto;">
                                📋 Copiar
                            </button>

                            <button class="btn-cancel" onclick="window.open('${urlCompleta}', '_blank')" style="width:auto;">
                                🔎 Abrir
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

        area.innerHTML = `
            <div class="card">
                <h3>🔗 Links de Matrícula</h3>
                <p style="font-size:13px; color:#666;">
                    Gere links públicos para matrícula online. Cada link abre o <strong>matricula.html</strong> com o ID desta instituição.
                </p>

                <div style="background:#f8f9fa; border:1px solid #eee; padding:15px; border-radius:10px; margin-bottom:20px;">
                    <label style="font-weight:bold; display:block; margin-bottom:8px;">Link principal da instituição</label>
                    <input id="link-principal-matricula" value="${linkBaseEscola}" readonly style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px; margin-bottom:10px;">

                    <div style="display:flex; gap:8px; flex-wrap:wrap;">
                        <button class="btn-primary" onclick="navigator.clipboard.writeText(document.getElementById('link-principal-matricula').value); App.showToast('Link principal copiado!', 'success');" style="width:auto;">
                            📋 Copiar Link Principal
                        </button>

                        <button class="btn-cancel" onclick="window.open(document.getElementById('link-principal-matricula').value, '_blank')" style="width:auto;">
                            🔎 Abrir Link
                        </button>
                    </div>
                </div>

                <div style="background:#fff; border:1px solid #eee; padding:15px; border-radius:10px; margin-bottom:20px;">
                    <label style="font-weight:bold; display:block; margin-bottom:8px;">Criar link personalizado / campanha</label>
                    <input id="nome-novo-link-matricula" placeholder="Ex: Instagram, WhatsApp, Turma Sábado, Campanha Maio..." style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px; margin-bottom:10px;">

                    <button class="btn-primary" onclick="App.criarLinkMatriculaCampanha()" style="width:auto;">
                        ➕ Gerar Link Personalizado
                    </button>
                </div>

                <h4>Links gerados</h4>
                ${htmlLista}
            </div>
        `;

    } catch (e) {
        console.error(e);
        area.innerHTML = `
            <div class="card" style="text-align:center; color:#e74c3c;">
                <h3>Erro</h3>
                <p>Não foi possível carregar a área de links.</p>
            </div>
        `;
    }
},    

    criarLinkMatriculaCampanha: async () => {
    const input = document.getElementById('nome-novo-link-matricula');
    const nome = input?.value?.trim();

    if (!nome) {
        return App.showToast("Digite um nome para o link.", "warning");
    }

    try {
        const escola = await App.api('/escola');

        if (!escola || escola.error || !escola.escolaId) {
            return App.showToast("Não foi possível carregar os dados da instituição.", "error");
        }

        const linksAtuais = Array.isArray(escola.linksMatricula) ? escola.linksMatricula : [];

        const novoLink = {
            id: 'REF_' + Date.now(),
            nome,
            criadoEm: new Date().toLocaleString('pt-BR')
        };

        const payload = {
            ...escola,
            linksMatricula: [novoLink, ...linksAtuais]
        };

        const res = await App.api('/escola', 'PUT', payload);

        if (res && res.error) {
            return App.showToast(res.error, "error");
        }

        App.showToast("Link personalizado criado com sucesso!", "success");
        App.mostrarAreaLinks();

    } catch (e) {
        console.error(e);
        App.showToast("Erro ao criar link personalizado.", "error");
    }
},

    gerarNovoLinkMatricula: async () => {
        const nomeInput = document.getElementById('nome-novo-link').value.trim();
        if(!nomeInput) return App.showToast("Por favor, dê um nome para a campanha/link.", "warning");

        const btn = document.querySelector('button[onclick="App.gerarNovoLinkMatricula()"]');
        const txtOriginal = btn.innerText;
        btn.innerText = "A gerar... ⏳"; btn.disabled = true;

        try {
            const escola = await App.api('/escola') || {};
            const links = escola.linksMatricula || [];
            
            const novoLink = {
                id: window.crypto.randomUUID().split('-')[0].toUpperCase(),
                nome: nomeInput,
                data: new Date().toLocaleString('pt-BR')
            };

            links.unshift(novoLink); // Adiciona no início da lista
            escola.linksMatricula = links;

            await App.api('/escola', 'PUT', escola);
            App.showToast("Link gerado com sucesso!", "success");
            App.mostrarAreaLinks(); // Recarrega a tela
        } catch(e) {
            App.showToast("Erro ao guardar o link.", "error");
        } finally {
            if(btn) { btn.innerText = txtOriginal; btn.disabled = false; }
        }
    },

    excluirLinkMatricula: async (id) => {
        if(!confirm("Tem a certeza que deseja apagar este link? O link principal continuará a funcionar.")) return;
        try {
            const escola = await App.api('/escola') || {};
            let links = escola.linksMatricula || [];
            escola.linksMatricula = links.filter(l => l.id !== id);
            
            await App.api('/escola', 'PUT', escola);
            App.showToast("Link apagado do histórico.", "success");
            App.mostrarAreaLinks();
        } catch(e) {
            App.showToast("Erro ao apagar.", "error");
        }
    },

   
    renderizarContratos: async () => {
        const area = document.getElementById('area-dinamica-hub') || document.getElementById('app-content');
        area.innerHTML = '<p style="text-align:center; padding:20px; color:#666;">A carregar o cofre... ⏳</p>';

        try {
            const contratos = await App.api('/contratos');
            const lista = Array.isArray(contratos) ? contratos : [];

            if(lista.length === 0) {
                area.innerHTML = `<div style="text-align:center; padding:40px;"><span style="font-size:50px;">🗄️</span><h3 style="color:#666;">Cofre Vazio</h3><p style="font-size:13px; color:#999;">Os recibos imutáveis aparecerão aqui quando os alunos preencherem a matrícula.</p></div>`;
                return;
            }

            lista.sort((a, b) => new Date(b.dataHoraRegistro) - new Date(a.dataHoraRegistro));

            let htmlLista = lista.map(c => {
                const dataBr = new Date(c.dataHoraRegistro).toLocaleString('pt-BR');
                return `
                <div style="background:#fff; border:1px solid #eee; padding:15px; border-radius:8px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; border-left: 5px solid #2c3e50; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <div>
                        <div style="font-weight:bold; color:#2c3e50; font-size:15px;">📄 ${App.escapeHTML(c.nomeAluno)}</div>
                        <div style="font-size:12px; color:#7f8c8d; margin-top:4px;">⏱️ Recebido em: <strong style="color:#2c3e50;">${dataBr}</strong></div>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <button onclick="App.abrirVisualizacaoContrato('${c.id}')" style="padding:8px 15px; font-size:12px; background:#2c3e50; color:white; border:none; border-radius:5px; cursor:pointer; font-weight:bold; transition: background 0.2s;">👁️ Ver</button>
                        <button onclick="App.excluirContrato('${c.id}')" style="padding:8px 15px; font-size:12px; background:#e74c3c; color:white; border:none; border-radius:5px; cursor:pointer; font-weight:bold; transition: background 0.2s;">🗑️ Apagar</button>
                    </div>
                </div>`;
            }).join('');

            area.innerHTML = `<div>
                <div style="background:#fdf2f2; border:1px solid #f5b7b1; color:#c0392b; padding:12px; border-radius:6px; margin-bottom:20px; font-size:13px; text-align:center;">
                    🔒 <strong>Zona de Segurança Jurídica:</strong> Os documentos listados abaixo são registos oficiais imutáveis.
                </div>
                ${htmlLista}
            </div>`;
            App.listaCacheContratos = lista;
        } catch(e) {
            area.innerHTML = "<p style='color:red;'>Erro ao carregar cofre.</p>";
        }
    },

    imprimirContrato: () => {
        const escola = JSON.parse(localStorage.getItem(App.getTenantKey('escola_perfil'))) || {};
        const nomeEscola = escola.nome || 'Instituição de Ensino';
        const cnpjEscola = escola.cnpj ? `CNPJ: ${escola.cnpj}` : '';
        const logoEscola = (escola.foto && escola.foto.length > 50 && !escola.foto.includes('placehold')) 
            ? `<img src="${escola.foto}" style="max-height:80px; max-width:120px; object-fit:contain;">` 
            : '';

        const conteudoOriginal = document.getElementById('area-impressao-contrato');
        const clone = conteudoOriginal.cloneNode(true);

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute'; iframe.style.top = '-10000px'; iframe.style.width = '800px'; iframe.style.height = '1000px'; iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Impressão - Contrato</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 30px; color: #333; line-height: 1.5; background: #fff; }
                    .header-escola { display: flex; align-items: center; border-bottom: 2px solid #3498db; padding-bottom: 15px; margin-bottom: 25px; }
                    .header-escola img { margin-right: 20px; }
                    .header-escola h2 { margin: 0; color: #2c3e50; font-size: 24px; }
                    .header-escola p { margin: 5px 0 0 0; color: #7f8c8d; font-size: 14px; }
                    .box-contrato-print { max-height: none !important; overflow: visible !important; border: none !important; padding: 0 !important; background: transparent !important; }
                    @media print { body { padding: 0; } @page { margin: 15mm; } }
                </style>
            </head>
            <body>
                <div class="header-escola">
                    ${logoEscola}
                    <div>
                        <h2>${App.escapeHTML(nomeEscola)}</h2>
                        <p>${App.escapeHTML(cnpjEscola)}</p>
                    </div>
                </div>
                ${clone.innerHTML}
                <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #999;">
                    Documento impresso em ${new Date().toLocaleString('pt-BR')} pelo SISTEMA PTT
                </div>
            </body>
            </html>
        `);
        doc.close();

        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            setTimeout(() => { document.body.removeChild(iframe); }, 1500);
        }, 800);
    },

    excluirContrato: (id) => {
        App.abrirModalConfirmacao(
            "Apagar Contrato Oficial?", 
            "Tem a certeza que deseja apagar este documento assinado? Esta ação é irreversível.", 
            async (modal) => {
                document.body.style.cursor = 'wait';
                try {
                    const res = await App.api(`/contratos/${id}`, 'DELETE');
                    if (res && res.error) {
                        App.showToast(res.error, "error");
                    } else {
                        App.showToast("Contrato apagado com sucesso!", "success");
                        App.renderizarContratos();
                    }
                } catch(e) { 
                    App.showToast("Erro ao apagar o contrato.", "error"); 
                } finally { 
                    document.body.style.cursor = 'default'; 
                    modal.style.opacity = '0'; setTimeout(() => modal.style.display = 'none', 300);
                }
            }
        );
    },

    renderizarConfiguradorMatricula: async () => {
        const area = document.getElementById('area-dinamica-hub');
        area.innerHTML = '<p style="text-align:center; padding: 40px; color:#666;">A carregar o construtor do contrato... ⏳</p>';

        try {
            const escola = await App.api('/escola') || {};
            
            if (!escola.configMatricula) {
                escola.configMatricula = {
                    imagemHeader: 'https://placehold.co/800x400?text=Sua+Imagem+de+Cabecalho',
                    imagemPosicao: '50% 50%', // Nova variável para guardar a posição
                    tituloHeader: 'Matrícula Digital',
                    descHeader: 'Preencha os dados abaixo com atenção para garantir a sua vaga.',
                    opcoesPlano: 'Padrão, Intensivo, Personalizado',
                    opcoesVencimento: '08, 20',
                    textoContrato: `TERMO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS<br><br>CLÁUSULA PRIMEIRA – DO OBJETO<br>O presente contrato tem como objeto...`
                };
            }

            App.configTemp = { ...escola.configMatricula };
            // Garante que a posição existe mesmo para quem já tinha gravado antes
            if (!App.configTemp.imagemPosicao) App.configTemp.imagemPosicao = '50% 50%';

            // Converte as tags protegidas da base de dados de volta para formatação visual
            if (App.configTemp.textoContrato) {
                App.configTemp.textoContrato = App.unescapeHTML(App.configTemp.textoContrato);
            }

            area.innerHTML = `
                <div style="display:flex; gap:20px; flex-wrap: nowrap; align-items: flex-start;">
                    <div style="flex: 0 0 260px; width: 260px; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); box-sizing: border-box;">
                        <h3 style="margin-top:0; color:#2c3e50; font-size:16px; border-bottom:2px solid #eee; padding-bottom:10px;">🛠️ Ferramentas</h3>
                        
                        <button class="btn-primary" style="width:100%; background:#f1f2f6; color:#2c3e50; border:1px solid #dcdde1; margin-bottom:5px; justify-content:flex-start;" onclick="App.editarConfig('imagem')">🖼️ Imagem do Cabeçalho</button>
                        <div style="font-size:11px; color:#7f8c8d; text-align:center; margin-bottom:15px; line-height:1.4;">Tamanho recomendado:<br><b style="color:#2c3e50;">800 x 400px</b></div>

                        <button class="btn-primary" style="width:100%; background:#f1f2f6; color:#2c3e50; border:1px solid #dcdde1; margin-bottom:10px; justify-content:flex-start;" onclick="App.editarConfig('titulo')">✏️ Título do Cabeçalho</button>
                        <button class="btn-primary" style="width:100%; background:#f1f2f6; color:#2c3e50; border:1px solid #dcdde1; margin-bottom:10px; justify-content:flex-start;" onclick="App.editarConfig('descricao')">📝 Descrição do Cabeçalho</button>
                        <button class="btn-primary" style="width:100%; background:#f1f2f6; color:#2c3e50; border:1px solid #dcdde1; margin-bottom:10px; justify-content:flex-start;" onclick="App.editarConfig('opcoes')">⚙️ Alterar Dados Editáveis</button>
                        <button class="btn-primary" style="width:100%; background:#34495e; color:white; border:none; margin-bottom:25px; justify-content:flex-start;" onclick="App.editarConfig('contrato')">📑 Editar Contrato Digital</button>
                        <button class="btn-primary" style="width:100%; background:#27ae60; border:none; justify-content:center; padding:15px; font-weight:bold;" onclick="App.salvarConfiguradorMatricula()">💾 Salvar Tudo</button>
                    </div>

                    <div style="flex: 1; min-width: 0;">
                        <div style="background:#e0e6ed; padding:20px; border-radius:12px; display:flex; justify-content:center; width:100%; box-sizing: border-box;">
                            <div id="preview-word-doc" style="background:white; width:100%; max-width:100%; min-height:600px; box-shadow:0 15px 35px rgba(0,0,0,0.1); border-radius:8px;">
                                </div>
                        </div>
                    </div>
                </div>
            `;

            App.atualizarPreviewConfigurador();

        } catch (e) {
            area.innerHTML = '<p style="color:red; text-align:center;">Erro ao carregar o configurador.</p>';
        }
    },

   atualizarPreviewConfigurador: () => {
        const preview = document.getElementById('preview-word-doc');
        if(preview) {
            preview.innerHTML = `
                <div id="preview-header-img" 
                     onmousedown="App.iniciarArraste(event)" 
                     ontouchstart="App.iniciarArraste(event)"
                     style="width:100%; height:120px; background:url('${App.configTemp.imagemHeader}') no-repeat; background-size: cover; background-position: ${App.configTemp.imagemPosicao}; border-radius:8px 8px 0 0; cursor:grab; position:relative; overflow:hidden; user-select:none;">
                     <div style="position:absolute; bottom:6px; right:6px; background:rgba(0,0,0,0.6); color:white; font-size:10px; padding:4px 8px; border-radius:12px; pointer-events:none; backdrop-filter:blur(2px); border:1px solid rgba(255,255,255,0.2);">🖐️ Arraste para reposicionar</div>
                </div>
                <div style="padding: 25px; text-align: center; border-bottom: 2px dashed #eee;">
                    <h2 style="color:#2c3e50; margin:0 0 10px 0;">${App.escapeHTML(App.configTemp.tituloHeader)}</h2>
                    <p style="color:#7f8c8d; font-size:14px; margin:0;">${App.escapeHTML(App.configTemp.descHeader)}</p>
                </div>
                <div style="padding: 25px;">
                    <h4 style="color:#2980b9; margin-top:0;">📋 Dados Editáveis (Preview)</h4>
                    <div style="display:flex; gap:10px; margin-bottom: 15px;">
                        <select style="flex:1; padding:8px; border:1px solid #ccc; border-radius:4px;" disabled>
                            <option>Plano de Curso: ${App.configTemp.opcoesPlano}</option>
                        </select>
                        <select style="flex:1; padding:8px; border:1px solid #ccc; border-radius:4px;" disabled>
                            <option>Vencimento: ${App.configTemp.opcoesVencimento}</option>
                        </select>
                    </div>
                    <h4 style="color:#2980b9;">📑 Texto do Contrato</h4>
                    <div style="font-size:11px; color:#555; background:#f9f9f9; padding:15px; border-radius:6px; border:1px solid #eee; height:300px; overflow-y:auto; text-align:justify;">${App.configTemp.textoContrato}</div>
                </div>
            `;
        }
    },

    editarConfig: (tipo) => {
        if (tipo === 'imagem') {
            // Cria um input de arquivo invisível
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*'; // Aceita apenas imagens
            
            // O que acontece quando o utilizador escolhe a foto:
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    App.showToast("A processar e otimizar a imagem... ⏳", "info");
                    
                    // Envia para a tua função de compressão (máx 800px de largura)
                    App.otimizarImagem(file, 800, (imgBase64) => {
                        App.configTemp.imagemHeader = imgBase64;
                        App.atualizarPreviewConfigurador();
                        App.showToast("Imagem aplicada com sucesso!", "success");
                    });
                }
            };
            
            // Aciona o clique automático para abrir a janela
            input.click();
        } 
        else if (tipo === 'titulo' || tipo === 'descricao' || tipo === 'opcoes') {
            // Função para gerar modais bonitos
            const abrirModalBonito = (tituloModal, conteudoHTML, onSave) => {
                const overlay = document.createElement('div');
                overlay.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); backdrop-filter:blur(5px); display:flex; align-items:center; justify-content:center; z-index:9999; animation: fadeIn 0.3s ease;";
                
                const modal = document.createElement('div');
                modal.style.cssText = "background:#fff; border-radius:12px; padding:24px; width:100%; max-width:450px; box-shadow:0 10px 25px rgba(0,0,0,0.2); transform: scale(0.95); animation: scaleUp 0.3s ease forwards; font-family: inherit;";
                
                modal.innerHTML = `
                    <style>
                        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                        @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                        .modal-custom-input { width: 100%; padding: 12px; border: 1px solid #ced4da; border-radius: 8px; box-sizing: border-box; font-family: inherit; font-size: 15px; margin-top: 6px; transition: border-color 0.2s; }
                        .modal-custom-input:focus { border-color: #0d6efd; outline: none; box-shadow: 0 0 0 3px rgba(13,110,253,0.2); }
                        .modal-custom-label { font-weight: 600; color: #495057; font-size: 14px; }
                        .modal-btn-cancel { padding: 10px 18px; background: #f8f9fa; color: #495057; border: 1px solid #dee2e6; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s; }
                        .modal-btn-cancel:hover { background: #e2e6ea; }
                        .modal-btn-save { padding: 10px 18px; background: #0d6efd; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s; }
                        .modal-btn-save:hover { background: #0b5ed7; }
                    </style>
                    <h3 style="margin-top:0; color:#212529; font-size:20px; border-bottom:1px solid #f1f3f5; padding-bottom:15px; margin-bottom:20px;">${tituloModal}</h3>
                    <div style="margin-bottom:24px;">
                        ${conteudoHTML}
                    </div>
                    <div style="display:flex; justify-content:flex-end; gap:12px;">
                        <button id="btnCancelarModal" class="modal-btn-cancel">Cancelar</button>
                        <button id="btnSalvarModal" class="modal-btn-save">Salvar Alterações</button>
                    </div>
                `;

                overlay.appendChild(modal);
                document.body.appendChild(overlay);

                const fecharModal = () => {
                    overlay.style.animation = "fadeIn 0.2s ease reverse forwards";
                    modal.style.animation = "scaleUp 0.2s ease reverse forwards";
                    setTimeout(() => document.body.removeChild(overlay), 200);
                };

                modal.querySelector('#btnCancelarModal').onclick = fecharModal;
                modal.querySelector('#btnSalvarModal').onclick = () => {
                    onSave(modal);
                    fecharModal();
                };
            };

            // MODAIS ESPECÍFICOS USANDO AS TUAS VARIÁVEIS EXATAS
            if (tipo === 'titulo') {
                abrirModalBonito(
                    "✏️ Editar Título",
                    `<label class="modal-custom-label">Título do Documento:</label>
                     <input type="text" id="inputTitulo" class="modal-custom-input" placeholder="Ex: Contrato de Prestação de Serviços" value="${App.configTemp.tituloHeader || ''}">`,
                    (modal) => {
                        App.configTemp.tituloHeader = modal.querySelector('#inputTitulo').value;
                        App.atualizarPreviewConfigurador();
                    }
                );
            } 
            else if (tipo === 'descricao') {
                abrirModalBonito(
                    "📝 Editar Descrição",
                    `<label class="modal-custom-label">Subtítulo ou Descrição:</label>
                     <textarea id="inputDescricao" class="modal-custom-input" style="height:110px; resize:vertical;" placeholder="Digite aqui uma breve descrição...">${App.configTemp.descHeader || ''}</textarea>`,
                    (modal) => {
                        App.configTemp.descHeader = modal.querySelector('#inputDescricao').value;
                        App.atualizarPreviewConfigurador();
                    }
                );
            } 
            else if (tipo === 'opcoes') {
                abrirModalBonito(
                    "⚙️ Dados Complementares",
                    `<div style="margin-bottom:16px;">
                        <label class="modal-custom-label">Planos de Curso</label><br>
                        <span style="font-size:12px; color:#6c757d;">Separe as opções por vírgula</span>
                        <input type="text" id="inputCursos" class="modal-custom-input" placeholder="Ex: Inglês, Informática" value="${App.configTemp.opcoesPlano || ''}">
                     </div>
                     <div style="margin-bottom:16px;">
                        <label class="modal-custom-label">Dias de Vencimento</label><br>
                        <span style="font-size:12px; color:#6c757d;">Separe as opções por vírgula</span>
                        <input type="text" id="inputDias" class="modal-custom-input" placeholder="Ex: 5, 10, 15" value="${App.configTemp.opcoesVencimento || ''}">
                     </div>
                     <div>
                        <label class="modal-custom-label">Horários Disponíveis</label><br>
                        <span style="font-size:12px; color:#6c757d;">Ex: Manhã (08h às 10h), Noite (19h às 21h)</span>
                        <input type="text" id="inputHorarios" class="modal-custom-input" placeholder="Separe por vírgula" value="${App.configTemp.horarios || ''}">
                     </div>`,
                    (modal) => {
                        App.configTemp.opcoesPlano = modal.querySelector('#inputCursos').value;
                        App.configTemp.opcoesVencimento = modal.querySelector('#inputDias').value;
                        App.configTemp.horarios = modal.querySelector('#inputHorarios').value; // 🚀 Salva os horários aqui
                        App.atualizarPreviewConfigurador();
                    }
                );
            }
        }
        else if (tipo === 'contrato') {
            const modal = document.getElementById('modal-overlay'); 
            if(modal) modal.style.display = 'flex';
            document.getElementById('modal-titulo').innerText = "Editar Texto do Contrato";
            
            // Construção do modal com o novo Editor Quill (LIMPO: Sem caixa de tags mágicas)
            document.getElementById('modal-form-content').innerHTML = `
                <div id="editor-contrato-quill" style="height:350px; background:#fff; font-family:sans-serif; line-height:1.5;">${App.sanitizeHTML(App.configTemp.textoContrato || '')}</div>
            `;
            
            // Inicializar o Editor e a sua barra de ferramentas
            setTimeout(() => {
                window.quillContrato = new Quill('#editor-contrato-quill', {
                    theme: 'snow',
                    modules: {
                        toolbar: [
                            ['bold', 'italic', 'underline'],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            [{ 'align': [] }],
                            [{ 'size': ['small', false, 'large', 'huge'] }],
                            ['clean'] // Botão mágico "Tx" que remove códigos lixo do Word!
                        ]
                    }
                });
            }, 100);

            const btnConfirm = document.querySelector('.btn-confirm');
            btnConfirm.style.display = 'inline-flex';
            btnConfirm.innerHTML = "Aplicar ao Preview";
            btnConfirm.onclick = () => {
                // Ao clicar em aplicar, ele vai buscar o HTML perfeitamente formatado gerado pelo Quill
                App.configTemp.textoContrato = window.quillContrato.root.innerHTML;
                App.atualizarPreviewConfigurador();
                App.fecharModal();
            };
        }
    },

    salvarConfiguradorMatricula: async () => {
        // Captura o botão exato que disparou a função
        const btn = document.querySelector('button[onclick="App.salvarConfiguradorMatricula()"]');
        const txtOriginal = btn ? btn.innerHTML : '💾 Salvar Tudo';
        
        // Dá o feedback visual imediato: muda o texto, desativa o clique e põe o rato a carregar
        if (btn) { 
            btn.innerHTML = "A salvar... ⏳"; 
            btn.disabled = true; 
            btn.style.opacity = '0.8'; 
        }
        document.body.style.cursor = 'wait';

        try {
            const escola = await App.api('/escola') || {};
            escola.configMatricula = App.configTemp;
            await App.api('/escola', 'PUT', escola);
            App.showToast("Configurações da matrícula salvas com sucesso!", "success");
        } catch(e) {
            App.showToast("Erro ao guardar as configurações.", "error");
        } finally {
            // Devolve o botão ao normal, independentemente de ter dado erro ou sucesso
            if (btn) { 
                btn.innerHTML = txtOriginal; 
                btn.disabled = false; 
                btn.style.opacity = '1'; 
            }
            document.body.style.cursor = 'default';
        }
    }


});