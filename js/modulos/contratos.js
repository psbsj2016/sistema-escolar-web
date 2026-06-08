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
            
            // 🔄 CORREÇÃO: Adicionámos o 'contrato.dataCriacao' à verificação
            const dataBr = (contrato.dataHoraRegistro || contrato.dataCriacao || contrato.dataHora || contrato.createdAt) 
                ? new Date(contrato.dataHoraRegistro || contrato.dataCriacao || contrato.dataHora || contrato.createdAt).toLocaleString('pt-BR') 
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
                            <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>Curso Adquirido:</b> ${planoCurso}</td>
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
    // 🧩 HUB CENTRAL DE CONTRATOS E LINKS
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
                    <button class="btn-primary" onclick="App.renderizarConfiguradorHub()" style="background:#8e44ad; border:none;">🎨 Configurar Hub</button>
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
            const linkBaseEscola = `${window.location.origin}/hub-matriculas.html?escola=${encodeURIComponent(meuEscolaId)}`;
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
                                <button type="button" class="btn-primary" onclick="navigator.clipboard.writeText('${urlCompleta}'); App.showToast('Link copiado!', 'success');" style="width:auto;">
                                    📋 Copiar
                                </button>

                                <button type="button" class="btn-cancel" onclick="window.open('${urlCompleta}', '_blank')" style="width:auto;">
                                    🔎 Abrir
                                </button>

                                <button type="button" onclick="App.excluirLinkMatricula('${link.id}')" style="width:auto; background-color:#e74c3c; color:white; border:none; padding:10px 15px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:13px; transition:0.3s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                                    🗑️ Excluir
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');

            area.innerHTML = `
                <div class="card">
                    <h3>🔗 Links de Matrícula</h3>
                    <p style="font-size:13px; color:#666;">
                        Gere links públicos para matrícula. Cada link abre o <strong>Hub de Seleção (Presencial/Online)</strong> com o ID desta instituição.
                    </p>

                    <div style="background:#f8f9fa; border:1px solid #eee; padding:15px; border-radius:10px; margin-bottom:20px;">
                        <label style="font-weight:bold; display:block; margin-bottom:8px;">Link principal da instituição</label>
                        <input id="link-principal-matricula" value="${linkBaseEscola}" readonly style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px; margin-bottom:10px;">

                        <div style="display:flex; gap:8px; flex-wrap:wrap;">
                            <button type="button" class="btn-primary" onclick="navigator.clipboard.writeText(document.getElementById('link-principal-matricula').value); App.showToast('Link principal copiado!', 'success');" style="width:auto;">
                                📋 Copiar Link Principal
                            </button>

                            <button type="button" class="btn-cancel" onclick="window.open(document.getElementById('link-principal-matricula').value, '_blank')" style="width:auto;">
                                🔎 Abrir Link
                            </button>
                        </div>
                    </div>

                    <div style="background:#fff; border:1px solid #eee; padding:15px; border-radius:10px; margin-bottom:20px;">
                        <label style="font-weight:bold; display:block; margin-bottom:8px;">Criar link personalizado / campanha</label>
                        <input id="nome-novo-link-matricula" placeholder="Ex: Instagram, WhatsApp, Turma Sábado, Campanha Maio..." style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px; margin-bottom:10px;">

                        <button type="button" class="btn-primary" onclick="App.criarLinkMatriculaCampanha()" style="width:auto;">
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
            App.mostrarAreaLinks(); // Atualiza instantaneamente a tela sem piscar!

        } catch (e) {
            console.error(e);
            App.showToast("Erro ao criar link personalizado.", "error");
        }
    },

    excluirLinkMatricula: (idDoLink) => {
        // Usa o modal elegante que já existe no seu sistema!
        App.abrirModalConfirmacao(
            "🗑️ Excluir Link Personalizado?", 
            "Tem a certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita.", 
            async (modal) => {
                document.body.style.cursor = 'wait';
                try {
                    const escola = await App.api('/escola') || {};
                    
                    if (escola.linksMatricula) {
                        escola.linksMatricula = escola.linksMatricula.filter(link => link.id !== idDoLink);
                        await App.api('/escola', 'PUT', escola);
                        
                        App.showToast("Link excluído com sucesso!", "success");
                        App.mostrarAreaLinks(); // Recarrega suavemente sem piscar a página!
                    }
                } catch (error) {
                    console.error(error);
                    App.showToast("Erro ao excluir o link.", "error");
                } finally {
                    document.body.style.cursor = 'default';
                    // Fecha o modal elegantemente com a animação
                    modal.style.opacity = '0'; 
                    setTimeout(() => modal.style.display = 'none', 300);
                }
            }
        );
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

            // Ordena os contratos do mais recente para o mais antigo
            lista.sort((a, b) => new Date(b.dataHoraRegistro || b.dataCriacao) - new Date(a.dataHoraRegistro || a.dataCriacao));

            // Função que desenha o layout do documento (agora dinâmico com cores)
           // 🚀 RESETA AS SELEÇÕES SEMPRE QUE ABRIR O COFRE
            App.contratosSelecionados = []; 

            // 1. Função que desenha o layout do documento (AGORA COM CHECKBOX)
            const desenharCard = (c, corBorda, icone) => {
                const dataRegistro = c.dataHoraRegistro || c.dataCriacao || new Date().toISOString();
                const dataBr = new Date(dataRegistro).toLocaleString('pt-BR');
                const nomeSeguro = App.escapeHTML(c.nomeAluno || c.nome || 'Aluno Indefinido');
                
                return `
                <div style="background:#fff; border:1px solid #eee; padding:15px; border-radius:8px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; border-left: 5px solid ${corBorda}; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <input type="checkbox" class="chk-contrato" value="${c.id}" onchange="App.toggleSelecaoContrato(this)" style="width:18px; height:18px; cursor:pointer; accent-color: #e74c3c; flex-shrink: 0;">
                        <div>
                            <div style="font-weight:bold; color:#2c3e50; font-size:15px;">${icone} ${nomeSeguro}</div>
                            <div style="font-size:12px; color:#7f8c8d; margin-top:4px;">⏱️ Recebido em: <strong style="color:#2c3e50;">${dataBr}</strong></div>
                        </div>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <button onclick="App.abrirVisualizacaoContrato('${c.id}')" style="padding:8px 15px; font-size:12px; background:${corBorda}; color:white; border:none; border-radius:5px; cursor:pointer; font-weight:bold; transition: background 0.2s;">👁️ Ver</button>
                        <button onclick="App.excluirContrato('${c.id}')" style="padding:8px 15px; font-size:12px; background:#e74c3c; color:white; border:none; border-radius:5px; cursor:pointer; font-weight:bold; transition: background 0.2s;">🗑️ Apagar</button>
                    </div>
                </div>`;
            };

            // 🚀 SEPARAÇÃO DO EAD E PRESENCIAL
            const ead = lista.filter(c => c.modalidade === 'Online' || c.modalidade_escolhida === 'Online' || (c.planoCurso && c.planoCurso.toLowerCase().includes('online')));
            const presencial = lista.filter(c => !(c.modalidade === 'Online' || c.modalidade_escolhida === 'Online' || (c.planoCurso && c.planoCurso.toLowerCase().includes('online'))));

            const htmlEAD = ead.length > 0 
                ? ead.map(c => desenharCard(c, '#27ae60', '💻')).join('') 
                : '<p style="text-align:center; color:#999; font-size:12px; padding:20px; border:1px dashed #bbf7d0; border-radius:8px;">Nenhuma matrícula online.</p>';
                
            const htmlPresencial = presencial.length > 0 
                ? presencial.map(c => desenharCard(c, '#2c3e50', '🏫')).join('') 
                : '<p style="text-align:center; color:#999; font-size:12px; padding:20px; border:1px dashed #e2e8f0; border-radius:8px;">Nenhuma matrícula presencial.</p>';

            // Monta as duas colunas lado a lado
            area.innerHTML = `
            <div>
                <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; background:#fdf2f2; border:1px solid #f5b7b1; color:#c0392b; padding:12px 15px; border-radius:6px; margin-bottom:15px; font-size:13px; gap: 10px;">
                    <div>🔒 <strong>Zona de Segurança Jurídica:</strong> Documentos imutáveis.</div>
                    <button onclick="App.selecionarTodosContratos()" style="background:transparent; border:1px solid #c0392b; color:#c0392b; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:11px; font-weight:bold; transition: 0.2s;">
                        ☑️ Marcar / Desmarcar Todos
                    </button>
                </div>
                
                <div id="barra-exclusao-massa" style="display:none; flex-wrap:wrap; gap:10px; background:#ffe5e5; border:1px solid #ffb3b3; color:#d93025; padding:12px 20px; border-radius:8px; margin-bottom:20px; justify-content:space-between; align-items:center; box-shadow:0 4px 10px rgba(217,48,37,0.15);">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-size:20px;">⚠️</span>
                        <span id="texto-exclusao-massa" style="font-weight:bold; font-size:14px;">0 contratos selecionados</span>
                    </div>
                    <button onclick="App.excluirContratosMassa()" style="background:#d93025; color:white; border:none; padding:10px 18px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:13px; transition:0.2s; box-shadow:0 2px 5px rgba(217,48,37,0.3);">
                        🗑️ Apagar Selecionados
                    </button>
                </div>
                
                <div style="display:flex; gap:20px; flex-wrap:wrap; align-items: flex-start;">
                    <div style="flex:1; min-width:300px; background:#f8f9fa; padding:15px; border-radius:10px; border-top: 4px solid #2c3e50; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <h3 style="text-align:center; color:#2c3e50; margin-top:0; border-bottom:2px solid #e2e8f0; padding-bottom:10px;">
                            🏫 Curso Presencial 
                            <span style="font-size:12px; background:#2c3e50; color:white; padding:3px 8px; border-radius:12px; vertical-align:middle; margin-left:5px;">${presencial.length}</span>
                        </h3>
                        ${htmlPresencial}
                    </div>

                    <div style="flex:1; min-width:300px; background:#f0fdf4; padding:15px; border-radius:10px; border-top: 4px solid #27ae60; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <h3 style="text-align:center; color:#27ae60; margin-top:0; border-bottom:2px solid #bbf7d0; padding-bottom:10px;">
                            💻 Curso Online 
                            <span style="font-size:12px; background:#27ae60; color:white; padding:3px 8px; border-radius:12px; vertical-align:middle; margin-left:5px;">${ead.length}</span>
                        </h3>
                        ${htmlEAD}
                    </div>
                </div>
            </div>`;
     
            App.listaCacheContratos = lista;
        } catch(e) {
            console.error(e);
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

    // =========================================================
    // 🗑️ FUNÇÕES DE EXCLUSÃO EM MASSA
    // =========================================================
    toggleSelecaoContrato: (checkbox) => {
        if (!App.contratosSelecionados) App.contratosSelecionados = [];
        
        if (checkbox.checked) {
            if (!App.contratosSelecionados.includes(checkbox.value)) {
                App.contratosSelecionados.push(checkbox.value);
            }
        } else {
            App.contratosSelecionados = App.contratosSelecionados.filter(id => id !== checkbox.value);
        }
        App.atualizarBarraExclusaoMassa();
    },

    selecionarTodosContratos: () => {
        const checkboxes = document.querySelectorAll('.chk-contrato');
        let todosMarcados = true;
        
        // Verifica se todos já estão marcados
        checkboxes.forEach(chk => { if (!chk.checked) todosMarcados = false; });
        
        App.contratosSelecionados = []; // Zera a lista para remontar
        
        // Inverte o estado de todos (Se todos estiverem marcados, ele desmarca tudo)
        checkboxes.forEach(chk => {
            chk.checked = !todosMarcados; 
            if (!todosMarcados) {
                App.contratosSelecionados.push(chk.value);
            }
        });
        
        App.atualizarBarraExclusaoMassa();
    },

    atualizarBarraExclusaoMassa: () => {
        const barra = document.getElementById('barra-exclusao-massa');
        const texto = document.getElementById('texto-exclusao-massa');
        if (!barra || !texto) return;

        const qtd = App.contratosSelecionados ? App.contratosSelecionados.length : 0;
        if (qtd > 0) {
            barra.style.display = 'flex';
            texto.innerText = `${qtd} contrato(s) selecionado(s)`;
        } else {
            barra.style.display = 'none';
        }
    },

    excluirContratosMassa: () => {
        const ids = App.contratosSelecionados || [];
        if (ids.length === 0) return;

        App.abrirModalConfirmacao(
            "🗑️ Excluir em Massa?", 
            `Tem a certeza absoluta que deseja apagar <b>${ids.length}</b> contrato(s)?<br><br><span style="color:red; font-size:12px;">⚠️ Esta ação é irreversível e excluirá os registos permanentemente do banco de dados.</span>`, 
            async (modal) => {
                document.body.style.cursor = 'wait';
                try {
                    let sucessos = 0;
                    
                    // 🚀 FANTÁSTICO: Dispara todas as requisições de exclusão ao mesmo tempo (Paralelo)
                    const promessas = ids.map(id => App.api(`/contratos/${id}`, 'DELETE'));
                    const resultados = await Promise.allSettled(promessas);

                    resultados.forEach(res => {
                        // Verifica quais as exclusões que funcionaram
                        if (res.status === 'fulfilled' && res.value && !res.value.error) {
                            sucessos++;
                        }
                    });

                    if (sucessos === ids.length) {
                        App.showToast(`✅ ${sucessos} contratos apagados com sucesso!`, "success");
                    } else {
                        App.showToast(`⚠️ Excluídos: ${sucessos} de ${ids.length}. Atualize a página e tente de novo.`, "warning");
                    }

                    App.contratosSelecionados = []; // Limpa a seleção da memória
                    App.renderizarContratos(); // Recarrega o cofre instantaneamente

                } catch(e) { 
                    console.error(e);
                    App.showToast("Erro crítico durante a exclusão em massa.", "error"); 
                } finally { 
                    document.body.style.cursor = 'default'; 
                    modal.style.opacity = '0'; 
                    setTimeout(() => modal.style.display = 'none', 300);
                }
            }
        );
    },

    renderizarConfiguradorMatricula: async () => {
        const area = document.getElementById('area-dinamica-hub');
        area.innerHTML = '<p style="text-align:center; padding: 40px; color:#666;">A carregar o construtor do contrato... ⏳</p>';

        try {
            const escola = await App.api('/escola') || {};
            
            const configPadrao = {
                imagemHeader: 'https://placehold.co/1000x500?text=Sua+Imagem+de+Cabecalho',
                imagemPosicao: '50% 50%', 
                tituloHeader: 'Matrícula Digital',
                descHeader: 'Preencha os dados abaixo com atenção para garantir a sua vaga.',
                opcoesPlano: 'Padrão, Intensivo, Personalizado',
                opcoesVencimento: '08, 20',
                horarios: '',
                textoContrato: `TERMO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS<br><br>CLÁUSULA PRIMEIRA...`
            };

            // Puxa a caixa de configurações principal que o banco de dados aceita
            const configBD = escola.configMatricula || {};

            // 1. O Presencial recebe a caixa principal (ignorando o EAD que está lá dentro)
            let configPresencial = { ...configBD };
            delete configPresencial.online; // Limpa o EAD para não sujar o Presencial
            
            if (!configPresencial.tituloHeader) configPresencial = { ...configPadrao };
            if (configPresencial.textoContrato) configPresencial.textoContrato = App.unescapeHTML(configPresencial.textoContrato);

            // 2. O Online puxa do compartimento secreto "online"
            let configOnline = configBD.online || { 
                ...configPadrao, 
                tituloHeader: 'Matrícula Digital EAD',
                opcoesPlano: 'Curso Online VIP, Curso Online Básico',
                horarios: '100% Online'
            };
            if (configOnline.textoContrato) configOnline.textoContrato = App.unescapeHTML(configOnline.textoContrato);

            // Guarda as duas na memória para podermos editar
            App.configTemp = {
                presencial: configPresencial,
                online: configOnline
            };
            
            App.abaAtiva = 'presencial';

        
            // Renderiza as abas e o container interno
            area.innerHTML = `
                <div style="display:flex; gap:10px; margin-bottom: 20px; justify-content: center; background: #fff; padding: 10px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <button id="btn-aba-presencial" onclick="App.alternarAbaConfig('presencial')" style="flex:1; max-width: 200px; padding: 12px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.3s; background: #2c3e50; color: white;">🏫 Contrato Presencial</button>
                    <button id="btn-aba-online" onclick="App.alternarAbaConfig('online')" style="flex:1; max-width: 200px; padding: 12px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.3s; background: #e0e6ed; color: #2c3e50;">💻 Contrato Online</button>
                </div>
                <div id="container-config-interno"></div>
            `;

            App.alternarAbaConfig('presencial');

        } catch (e) {
            console.error(e);
            area.innerHTML = '<p style="color:red; text-align:center;">Erro ao carregar o configurador.</p>';
        }
    },

    alternarAbaConfig: (aba) => {
        App.abaAtiva = aba;
        
        const btnPresencial = document.getElementById('btn-aba-presencial');
        const btnOnline = document.getElementById('btn-aba-online');
        
        if (aba === 'presencial') {
            if(btnPresencial) { btnPresencial.style.background = '#2c3e50'; btnPresencial.style.color = 'white'; }
            if(btnOnline) { btnOnline.style.background = '#e0e6ed'; btnOnline.style.color = '#2c3e50'; }
        } else {
            if(btnOnline) { btnOnline.style.background = '#27ae60'; btnOnline.style.color = 'white'; }
            if(btnPresencial) { btnPresencial.style.background = '#e0e6ed'; btnPresencial.style.color = '#2c3e50'; }
        }

        const container = document.getElementById('container-config-interno');
        container.innerHTML = `
            <div style="display:flex; gap:20px; flex-wrap: nowrap; align-items: flex-start;">
                <div style="flex: 0 0 260px; width: 260px; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); box-sizing: border-box;">
                    <h3 style="margin-top:0; color:#2c3e50; font-size:16px; border-bottom:2px solid #eee; padding-bottom:10px;">🛠️ Ferramentas (${aba === 'presencial' ? 'Presencial' : 'Online'})</h3>
                    
                    <button class="btn-primary" style="width:100%; background:#f1f2f6; color:#2c3e50; border:1px solid #dcdde1; margin-bottom:5px; justify-content:flex-start;" onclick="App.editarConfig('imagem')">🖼️ Imagem do Cabeçalho</button>
                    <div style="font-size:11px; color:#7f8c8d; text-align:center; margin-bottom:15px; line-height:1.4;">Tamanho recomendado:<br><b style="color:#2c3e50;">1000 x 500px</b></div>

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
    },

    atualizarPreviewConfigurador: () => {
        const preview = document.getElementById('preview-word-doc');
        const config = App.configTemp[App.abaAtiva]; 
        
        if(preview) {
            preview.innerHTML = `
                <div id="preview-header-img" 
                     onmousedown="App.iniciarArraste(event)" 
                     ontouchstart="App.iniciarArraste(event)"
                     style="width:100%; height:250px; background:url('${config.imagemHeader}') no-repeat; background-size: cover; background-position: ${config.imagemPosicao}; border-radius:8px 8px 0 0; cursor:grab; position:relative; overflow:hidden; user-select:none;">
                     <div style="position:absolute; bottom:6px; right:6px; background:rgba(0,0,0,0.6); color:white; font-size:10px; padding:4px 8px; border-radius:12px; pointer-events:none; backdrop-filter:blur(2px); border:1px solid rgba(255,255,255,0.2);">🖐️ Arraste para reposicionar</div>
                </div>
                <div style="padding: 25px; text-align: center; border-bottom: 2px dashed #eee;">
                    <h2 style="color:#2c3e50; margin:0 0 10px 0;">${App.escapeHTML(config.tituloHeader)}</h2>
                    <p style="color:#7f8c8d; font-size:14px; margin:0;">${App.escapeHTML(config.descHeader)}</p>
                </div>
                <div style="padding: 25px;">
                    <h4 style="color:#2980b9; margin-top:0;">📋 Dados Editáveis (Preview)</h4>
                    <div style="display:flex; gap:10px; margin-bottom: 15px;">
                        <select style="flex:1; padding:8px; border:1px solid #ccc; border-radius:4px;" disabled>
                            <option>Plano de Curso: ${config.opcoesPlano}</option>
                        </select>
                        <select style="flex:1; padding:8px; border:1px solid #ccc; border-radius:4px;" disabled>
                            <option>Vencimento: ${config.opcoesVencimento}</option>
                        </select>
                    </div>
                    <h4 style="color:#2980b9;">📑 Texto do Contrato</h4>
                    <div style="font-size:11px; color:#555; background:#f9f9f9; padding:15px; border-radius:6px; border:1px solid #eee; height:300px; overflow-y:auto; text-align:justify;">${config.textoContrato}</div>
                </div>
            `;
        }
    },

    editarConfig: (tipo) => {
        const config = App.configTemp[App.abaAtiva];

        if (tipo === 'imagem') {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*'; 
            
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    App.showToast("A processar e otimizar a imagem... ⏳", "info");
                    
                    App.otimizarImagem(file, 1000, (imgBase64) => {
                        App.configTemp[App.abaAtiva].imagemHeader = imgBase64;
                        App.atualizarPreviewConfigurador();
                        App.showToast("Imagem aplicada com sucesso!", "success");
                    });
                }
            };
            input.click();
        }
        else if (tipo === 'titulo' || tipo === 'descricao' || tipo === 'opcoes') {
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

            if (tipo === 'titulo') {
                abrirModalBonito(
                    "✏️ Editar Título",
                    `<label class="modal-custom-label">Título do Documento:</label>
                     <input type="text" id="inputTitulo" class="modal-custom-input" placeholder="Ex: Contrato de Prestação de Serviços" value="${config.tituloHeader || ''}">`,
                    (modal) => {
                        App.configTemp[App.abaAtiva].tituloHeader = modal.querySelector('#inputTitulo').value;
                        App.atualizarPreviewConfigurador();
                    }
                );
            } 
            else if (tipo === 'descricao') {
                abrirModalBonito(
                    "📝 Editar Descrição",
                    `<label class="modal-custom-label">Subtítulo ou Descrição:</label>
                     <textarea id="inputDescricao" class="modal-custom-input" style="height:110px; resize:vertical;" placeholder="Digite aqui uma breve descrição...">${config.descHeader || ''}</textarea>`,
                    (modal) => {
                        App.configTemp[App.abaAtiva].descHeader = modal.querySelector('#inputDescricao').value;
                        App.atualizarPreviewConfigurador();
                    }
                );
            } 
            else if (tipo === 'opcoes') {
                abrirModalBonito(
                    "⚙️ Dados Complementares",
                    `<div style="margin-bottom:16px;">
                        <label class="modal-custom-label">Curso Adquirido</label><br>
                        <span style="font-size:12px; color:#6c757d;">Separe as opções por vírgula</span>
                        <input type="text" id="inputCursos" class="modal-custom-input" placeholder="Ex: Inglês, Informática" value="${config.opcoesPlano || ''}">
                     </div>
                     <div style="margin-bottom:16px;">
                        <label class="modal-custom-label">Dia de Vencimento</label><br>
                        <span style="font-size:12px; color:#6c757d;">Separe as opções por vírgula</span>
                        <input type="text" id="inputDias" class="modal-custom-input" placeholder="Ex: 5, 10, 15" value="${config.opcoesVencimento || ''}">
                     </div>
                     <div>
                        <label class="modal-custom-label">Horários Disponíveis</label><br>
                        <span style="font-size:12px; color:#6c757d;">Ex: Manhã (08h às 10h), Noite (19h às 21h)</span>
                        <input type="text" id="inputHorarios" class="modal-custom-input" placeholder="Separe por vírgula" value="${config.horarios || ''}">
                     </div>`,
                    (modal) => {
                        App.configTemp[App.abaAtiva].opcoesPlano = modal.querySelector('#inputCursos').value;
                        App.configTemp[App.abaAtiva].opcoesVencimento = modal.querySelector('#inputDias').value;
                        App.configTemp[App.abaAtiva].horarios = modal.querySelector('#inputHorarios').value; 
                        App.atualizarPreviewConfigurador();
                    }
                );
            }
        }
        else if (tipo === 'contrato') {
            const modal = document.getElementById('modal-overlay'); 
            if(modal) modal.style.display = 'flex';
            document.getElementById('modal-titulo').innerText = `Editar Texto do Contrato (${App.abaAtiva === 'presencial' ? 'Presencial' : 'Online'})`;
            
            document.getElementById('modal-form-content').innerHTML = `
                <div id="editor-contrato-quill" style="height:350px; background:#fff; font-family:sans-serif; line-height:1.5;">${App.sanitizeHTML(config.textoContrato || '')}</div>
            `;
            
            setTimeout(() => {
                window.quillContrato = new Quill('#editor-contrato-quill', {
                    theme: 'snow',
                    modules: {
                        toolbar: [
                            ['bold', 'italic', 'underline'],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            [{ 'align': [] }],
                            [{ 'size': ['small', false, 'large', 'huge'] }],
                            ['clean'] 
                        ]
                    }
                });
            }, 100);

            const btnConfirm = document.querySelector('.btn-confirm');
            btnConfirm.style.display = 'inline-flex';
            btnConfirm.innerHTML = "Aplicar ao Preview";
            btnConfirm.onclick = () => {
                App.configTemp[App.abaAtiva].textoContrato = window.quillContrato.root.innerHTML;
                App.atualizarPreviewConfigurador();
                App.fecharModal();
            };
        }
    },

    iniciarArraste: (e) => {
        const img = document.getElementById('preview-header-img');
        if (!img) return;

        e.preventDefault();
        let isDragging = true;
        
        let currentPos = App.configTemp[App.abaAtiva].imagemPosicao || '50% 50%';
        let [posX, posY] = currentPos.split(' ').map(p => parseFloat(p) || 50);

        const startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        const initialPosY = posY;

        const onMove = (moveEvent) => {
            if (!isDragging) return;
            const currentY = moveEvent.type.includes('touch') ? moveEvent.touches[0].clientY : moveEvent.clientY;
            const diffY = currentY - startY;
            
            posY = initialPosY - (diffY * 0.2); 
            
            if (posY < 0) posY = 0;
            if (posY > 100) posY = 100;

            const novaPosicao = `50% ${posY}%`;
            img.style.backgroundPosition = novaPosicao;
        };

        const onEnd = () => {
            isDragging = false;
            App.configTemp[App.abaAtiva].imagemPosicao = img.style.backgroundPosition;
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onEnd);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onEnd);
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);
    },

   salvarConfiguradorMatricula: async () => {
        const btn = document.querySelector('button[onclick="App.salvarConfiguradorMatricula()"]');
        const txtOriginal = btn ? btn.innerHTML : '💾 Salvar Tudo';
        
        if (btn) { 
            btn.innerHTML = "A salvar... ⏳"; 
            btn.disabled = true; 
            btn.style.opacity = '0.8'; 
        }
        document.body.style.cursor = 'wait';

        try {
            const escola = await App.api('/escola') || {};
            
            // 🚀 O TRUQUE NINJA: Colocamos o EAD DENTRO da variável que o Banco de Dados já aceita!
            escola.configMatricula = {
                ...App.configTemp.presencial,
                online: App.configTemp.online
            };
            
            await App.api('/escola', 'PUT', escola);
            App.showToast("Configurações salvas para Presencial e Online!", "success");
        } catch(e) {
            App.showToast("Erro ao guardar as configurações.", "error");
        } finally {
            if (btn) { 
                btn.innerHTML = txtOriginal; 
                btn.disabled = false; 
                btn.style.opacity = '1'; 
            }
            document.body.style.cursor = 'default';
        }
    },

    // =========================================================
    // 🎨 CONFIGURADOR DO HUB DE MATRÍCULAS (VITRINE)
    // =========================================================
    renderizarConfiguradorHub: async () => {
        const area = document.getElementById('area-dinamica-hub');
        area.innerHTML = '<p style="text-align:center; padding: 40px; color:#666;">A carregar o construtor do Hub... ⏳</p>';

        try {
            const escola = await App.api('/escola') || {};
            
            const configPadrao = {
                tituloHeader: 'Bem-vindo(a) à Área de Matrículas',
                descHeader: 'Estamos muito felizes em tê-lo(a) connosco! Por favor, selecione abaixo a modalidade do curso que pretende frequentar.',
                iconePresencial: '🏫',
                tituloPresencial: 'Curso Presencial',
                descPresencial: 'Aulas presenciais na nossa unidade física. Acesso completo à infraestrutura, laboratórios e contacto direto com os nossos professores.',
                btnPresencial: 'Matrícula Presencial',
                iconeOnline: '💻',
                tituloOnline: 'Curso Online (EAD)',
                descOnline: 'Estude a partir de casa e ao seu próprio ritmo. Acesso imediato à plataforma virtual de aprendizagem, materiais e suporte 100% online.',
                btnOnline: 'Matrícula Online'
            };

            // Mistura as configurações do BD com as padrões
            App.configHubTemp = escola.configHub ? { ...configPadrao, ...escola.configHub } : { ...configPadrao };

            // O mesmo layout protegido que o configurador de formulários usa!
            area.innerHTML = `
                <div id="container-config-interno">
                    <div style="display:flex; gap:20px; flex-wrap: nowrap; align-items: flex-start;">
                        <div style="flex: 0 0 260px; width: 260px; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); box-sizing: border-box;">
                            <h3 style="margin-top:0; color:#8e44ad; font-size:16px; border-bottom:2px solid #eee; padding-bottom:10px;">🎨 Ferramentas da Vitrine</h3>
                            
                            <button class="btn-primary" style="width:100%; background:#f1f2f6; color:#2c3e50; border:1px solid #dcdde1; margin-bottom:10px; justify-content:flex-start;" onclick="App.editarConfigHub('header')">📝 Textos do Topo</button>
                            <button class="btn-primary" style="width:100%; background:#f1f2f6; color:#2c3e50; border:1px solid #dcdde1; margin-bottom:10px; justify-content:flex-start;" onclick="App.editarConfigHub('presencial')">🏫 Cartão Presencial</button>
                            <button class="btn-primary" style="width:100%; background:#f1f2f6; color:#2c3e50; border:1px solid #dcdde1; margin-bottom:25px; justify-content:flex-start;" onclick="App.editarConfigHub('online')">💻 Cartão Online</button>
                            
                            <button class="btn-primary" style="width:100%; background:#8e44ad; border:none; justify-content:center; padding:15px; font-weight:bold;" onclick="App.salvarConfiguradorHub()">💾 Salvar Hub</button>
                        </div>

                        <div style="flex: 1; min-width: 0;">
                            <div style="background:#e0e6ed; padding:20px; border-radius:12px; display:flex; justify-content:center; width:100%; box-sizing: border-box;">
                                <div id="preview-hub-page" style="background:#f4f7f6; width:100%; max-width:100%; min-height:500px; box-shadow:0 15px 35px rgba(0,0,0,0.1); border-radius:8px; padding: 30px; font-family: 'Segoe UI', sans-serif; position: relative;">
                                    </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            App.atualizarPreviewHub();
        } catch (e) {
            console.error(e);
            area.innerHTML = '<p style="color:red; text-align:center;">Erro ao carregar o configurador do Hub.</p>';
        }
    },

    atualizarPreviewHub: () => {
        const preview = document.getElementById('preview-hub-page');
        if(!preview) return;
        const config = App.configHubTemp;
        
        preview.innerHTML = `
            <div style="position:absolute; top:10px; left:10px; background:rgba(0,0,0,0.6); color:white; font-size:10px; padding:4px 8px; border-radius:12px;">👁️ Pré-visualização ao Vivo</div>
            
            <div style="text-align: center; padding: 20px 10px 20px; max-width: 600px; margin: 20px auto 0;">
                <h1 style="color: #2c3e50; font-size: 1.8rem; margin-bottom: 10px; margin-top:0;">${App.escapeHTML(config.tituloHeader)}</h1>
                <p style="color: #666; font-size: 0.95rem; line-height: 1.5;">${App.escapeHTML(config.descHeader)}</p>
            </div>
            
            <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; margin-top: 10px;">
                <div style="background: #fff; border-radius: 20px; padding: 25px 20px; width: 100%; max-width: 250px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.06); display: flex; flex-direction: column; justify-content: space-between;">
                    <div style="font-size: 45px; margin-bottom: 10px;">${App.escapeHTML(config.iconePresencial)}</div>
                    <h2 style="color: #2c3e50; margin-bottom: 10px; font-size: 1.2rem; margin-top:0;">${App.escapeHTML(config.tituloPresencial)}</h2>
                    <p style="color: #666; line-height: 1.4; margin-bottom: 20px; font-size: 0.85rem; flex-grow: 1;">${App.escapeHTML(config.descPresencial)}</p>
                    <div style="background-color: #3498db; color: white; padding: 10px 15px; border-radius: 8px; font-weight: bold; font-size: 0.9rem;">${App.escapeHTML(config.btnPresencial)}</div>
                </div>

                <div style="background: #fff; border-radius: 20px; padding: 25px 20px; width: 100%; max-width: 250px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.06); display: flex; flex-direction: column; justify-content: space-between;">
                    <div style="font-size: 45px; margin-bottom: 10px;">${App.escapeHTML(config.iconeOnline)}</div>
                    <h2 style="color: #2c3e50; margin-bottom: 10px; font-size: 1.2rem; margin-top:0;">${App.escapeHTML(config.tituloOnline)}</h2>
                    <p style="color: #666; line-height: 1.4; margin-bottom: 20px; font-size: 0.85rem; flex-grow: 1;">${App.escapeHTML(config.descOnline)}</p>
                    <div style="background-color: #3498db; color: white; padding: 10px 15px; border-radius: 8px; font-weight: bold; font-size: 0.9rem;">${App.escapeHTML(config.btnOnline)}</div>
                </div>
            </div>
        `;
    },

    editarConfigHub: (tipo) => {
        const config = App.configHubTemp;
        
        const abrirModalBonito = (tituloModal, conteudoHTML, onSave) => {
            const overlay = document.createElement('div');
            overlay.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); backdrop-filter:blur(5px); display:flex; align-items:center; justify-content:center; z-index:9999; animation: fadeIn 0.3s ease;";
            
            const modal = document.createElement('div');
            modal.style.cssText = "background:#fff; border-radius:12px; padding:24px; width:100%; max-width:450px; box-shadow:0 10px 25px rgba(0,0,0,0.2); transform: scale(0.95); animation: scaleUp 0.3s ease forwards; font-family: inherit;";
            
            modal.innerHTML = `
                <style>
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                    .modal-custom-input { width: 100%; padding: 12px; border: 1px solid #ced4da; border-radius: 8px; box-sizing: border-box; font-family: inherit; font-size: 15px; margin-top: 6px; margin-bottom: 15px; transition: border-color 0.2s; }
                    .modal-custom-input:focus { border-color: #8e44ad; outline: none; box-shadow: 0 0 0 3px rgba(142,68,173,0.2); }
                    .modal-custom-label { font-weight: 600; color: #495057; font-size: 14px; display:block; }
                    .modal-btn-cancel { padding: 10px 18px; background: #f8f9fa; color: #495057; border: 1px solid #dee2e6; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s; }
                    .modal-btn-cancel:hover { background: #e2e6ea; }
                    .modal-btn-save { padding: 10px 18px; background: #8e44ad; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s; }
                    .modal-btn-save:hover { background: #732d91; }
                </style>
                <h3 style="margin-top:0; color:#212529; font-size:20px; border-bottom:1px solid #f1f3f5; padding-bottom:15px; margin-bottom:20px;">${tituloModal}</h3>
                <div style="margin-bottom:24px; max-height: 60vh; overflow-y: auto; padding-right: 10px;">
                    ${conteudoHTML}
                </div>
                <div style="display:flex; justify-content:flex-end; gap:12px;">
                    <button id="btnCancelarModal" class="modal-btn-cancel">Cancelar</button>
                    <button id="btnSalvarModal" class="modal-btn-save">Aplicar</button>
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

        if (tipo === 'header') {
            abrirModalBonito(
                "📝 Textos do Topo",
                `<label class="modal-custom-label">Título Principal:</label>
                 <input type="text" id="iTitulo" class="modal-custom-input" value="${config.tituloHeader || ''}">
                 <label class="modal-custom-label">Mensagem de Boas-vindas:</label>
                 <textarea id="iDesc" class="modal-custom-input" style="height:100px; resize:vertical;">${config.descHeader || ''}</textarea>`,
                (modal) => {
                    App.configHubTemp.tituloHeader = modal.querySelector('#iTitulo').value;
                    App.configHubTemp.descHeader = modal.querySelector('#iDesc').value;
                    App.atualizarPreviewHub();
                }
            );
        } 
        else if (tipo === 'presencial') {
            abrirModalBonito(
                "🏫 Cartão Presencial",
                `<label class="modal-custom-label">Ícone (Emoji):</label>
                 <input type="text" id="iIcone" class="modal-custom-input" value="${config.iconePresencial || ''}" maxlength="5" style="width: 80px; text-align: center; font-size: 20px;">
                 <label class="modal-custom-label">Título do Cartão:</label>
                 <input type="text" id="iTitulo" class="modal-custom-input" value="${config.tituloPresencial || ''}">
                 <label class="modal-custom-label">Descrição Curta:</label>
                 <textarea id="iDesc" class="modal-custom-input" style="height:100px; resize:vertical;">${config.descPresencial || ''}</textarea>
                 <label class="modal-custom-label">Texto do Botão:</label>
                 <input type="text" id="iBtn" class="modal-custom-input" value="${config.btnPresencial || ''}">`,
                (modal) => {
                    App.configHubTemp.iconePresencial = modal.querySelector('#iIcone').value;
                    App.configHubTemp.tituloPresencial = modal.querySelector('#iTitulo').value;
                    App.configHubTemp.descPresencial = modal.querySelector('#iDesc').value;
                    App.configHubTemp.btnPresencial = modal.querySelector('#iBtn').value;
                    App.atualizarPreviewHub();
                }
            );
        }
        else if (tipo === 'online') {
            abrirModalBonito(
                "💻 Cartão Online",
                `<label class="modal-custom-label">Ícone (Emoji):</label>
                 <input type="text" id="iIcone" class="modal-custom-input" value="${config.iconeOnline || ''}" maxlength="5" style="width: 80px; text-align: center; font-size: 20px;">
                 <label class="modal-custom-label">Título do Cartão:</label>
                 <input type="text" id="iTitulo" class="modal-custom-input" value="${config.tituloOnline || ''}">
                 <label class="modal-custom-label">Descrição Curta:</label>
                 <textarea id="iDesc" class="modal-custom-input" style="height:100px; resize:vertical;">${config.descOnline || ''}</textarea>
                 <label class="modal-custom-label">Texto do Botão:</label>
                 <input type="text" id="iBtn" class="modal-custom-input" value="${config.btnOnline || ''}">`,
                (modal) => {
                    App.configHubTemp.iconeOnline = modal.querySelector('#iIcone').value;
                    App.configHubTemp.tituloOnline = modal.querySelector('#iTitulo').value;
                    App.configHubTemp.descOnline = modal.querySelector('#iDesc').value;
                    App.configHubTemp.btnOnline = modal.querySelector('#iBtn').value;
                    App.atualizarPreviewHub();
                }
            );
        }
    },

    salvarConfiguradorHub: async () => {
        const btn = document.querySelector('button[onclick="App.salvarConfiguradorHub()"]');
        const txtOriginal = btn ? btn.innerHTML : '💾 Salvar Hub';
        
        if (btn) { 
            btn.innerHTML = "A salvar... ⏳"; 
            btn.disabled = true; 
            btn.style.opacity = '0.8'; 
        }
        document.body.style.cursor = 'wait';

        try {
            const escola = await App.api('/escola') || {};
            escola.configHub = App.configHubTemp;
            
            await App.api('/escola', 'PUT', escola);
            App.showToast("Vitrine salva e pronta para os alunos!", "success");
        } catch(e) {
            App.showToast("Erro ao guardar as configurações da vitrine.", "error");
        } finally {
            if (btn) { 
                btn.innerHTML = txtOriginal; 
                btn.disabled = false; 
                btn.style.opacity = '1'; 
            }
            document.body.style.cursor = 'default';
        }
    }

});