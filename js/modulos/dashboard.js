window.App = window.App || {};
const App = window.App;

// =========================================================
// 🎨 COMPONENTES VISUAIS (As nossas "Peças de Lego")
// =========================================================

// Componente 1: Linha de Estatística
const CardEstatistica = (titulo, valor, icone) => `
    <div style="width:100%; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:10px;">
        <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:24px;">${icone}</span>
            <span style="font-size:14px; font-weight:600; color:#555; text-transform:uppercase;">${titulo}</span>
        </div>
        <span style="font-size:20px; font-weight:bold; color:#3498db;">${valor}</span>
    </div>
`;

// Componente 2: Cartão de Aluno Inadimplente (AGORA INTERATIVO!)
const CardInadimplente = (idFatura, nome, dataBr, valFmt, zap) => `
    <div onclick="App.irParaFinanceiroDestacado('${idFatura}', '${App.escapeHTML(nome)}')" style="background:#fff; border:1px solid #f5b7b1; padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 4px rgba(0,0,0,0.02); cursor:pointer; transition:all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 15px rgba(231,76,60,0.2)'; this.style.borderColor='#e74c3c';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.02)'; this.style.borderColor='#f5b7b1';">
        <div>
            <div style="font-size:13px; font-weight:bold; color:#333; margin-bottom:4px;">${App.escapeHTML(nome)}</div>
            <div style="font-size:11px; color:#c0392b; font-weight:600;">Venc: ${dataBr} • R$ ${valFmt}</div>
        </div>
        <button onclick="event.stopPropagation(); App.cobrarWhatsAppDashboard('${App.escapeHTML(nome)}', '${zap}', '${dataBr}', '${valFmt}')" style="background:#25D366; color:white; border:none; padding:8px 12px; border-radius:6px; font-size:11px; cursor:pointer; font-weight:bold; white-space:nowrap; box-shadow:0 2px 4px rgba(37,211,102,0.3); display:flex; align-items:center; gap:5px; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            <span>💬</span> Cobrar
        </button>
    </div>
`;

// =========================================================
// ⚙️ MÓDULO DASHBOARD - LÓGICA DE NEGÓCIO
// =========================================================

export const renderizarInicio = async (veioDoHistorico = false) => {
    // 🚀 BLINDAGEM DO F5: Grava o Dashboard na Memória Profunda imediatamente
    if (typeof App.salvarEstadoNavegacao === 'function') App.salvarEstadoNavegacao('fundo', { tipo: 'tela', alvo: 'inicio' });
    if (!veioDoHistorico) window.history.pushState({ tela: 'inicio' }, '', '#inicio');

    App.verificarNotificacoes(); 
    App.setTitulo("Dashboard"); 
    const div = document.getElementById('app-content');
    
    const nomeUsuario = App.escapeHTML(App.usuario ? App.usuario.nome : 'Gestor');

    // 🚀 AÇÃO IMEDIATA 2: Desenha a Saudação e o Esqueleto de Carregamento (Sem esperar pela rede!)
    div.innerHTML = `
        <h3 style="opacity:0.7; margin-top:0; margin-bottom:20px;">Olá, ${nomeUsuario}! 👋</h3>
        <div id="dashboard-dinamico">
            <div style="text-align:center; padding: 60px; color:#94a3b8; background: #fff; border-radius: 12px; border: 1px solid #eee;">
                <span style="font-size: 35px; display: block; margin-bottom: 15px; animation: piscarSuave 1s infinite;">⏳</span>
                <span style="font-weight: bold; font-size: 15px;">A processar métricas e gráficos...</span>
                <p style="font-size: 12px; color: #aaa; margin-top: 5px;">Isto leva apenas um segundo.</p>
            </div>
        </div>
    `;
    
    try {
        // 🚀 BUSCA SILENCIOSA: O ecrã já está desenhado enquanto aguardamos estes dados pesados
        const [alunos, financeiro, turmas, cursos] = await Promise.all([ App.api('/alunos'), App.api('/financeiro'), App.api('/turmas'), App.api('/cursos') ]);
        
        const todosAlunos = Array.isArray(alunos) ? alunos : [];
        const listaAlunos = todosAlunos.filter(a => !a.status || a.status === 'Ativo'); 
        const listaFin = Array.isArray(financeiro) ? financeiro : []; 
        const listaTurmas = Array.isArray(turmas) ? turmas : []; 
        const listaCursos = Array.isArray(cursos) ? cursos : [];
        
        const dataHoje = new Date(); 
        const mesAtual = dataHoje.getMonth() + 1; 
        const anoAtual = dataHoje.getFullYear();
        const ativosIds = listaAlunos.map(a => a.id);

        const financasMes = listaFin.filter(f => { if(!f.vencimento) return false; const parts = f.vencimento.split('-'); return parseInt(parts[1]) === mesAtual && parseInt(parts[0]) === anoAtual; });
        const totalRecebido = financasMes.filter(f => f.status === 'Pago').reduce((acc, cur) => acc + parseFloat(cur.valor), 0);
        const totalPendente = financasMes.filter(f => f.status !== 'Pago' && ativosIds.includes(f.idAluno)).reduce((acc, cur) => acc + parseFloat(cur.valor), 0);
        
        const inadimplentesList = listaFin.filter(f => 
            f.status === 'Pendente' && 
            new Date(f.vencimento + 'T00:00:00') < dataHoje &&
            ativosIds.includes(f.idAluno) 
        ).sort((a,b) => new Date(a.vencimento) - new Date(b.vencimento));

        const formatarMoeda = (valor) => valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const tipoUtilizador = App.usuario ? App.usuario.tipo : 'Gestor';
        const mostraFinanceiro = tipoUtilizador !== 'Professor'; 

        const htmlInadimplentes = inadimplentesList.length === 0 
            ? '<div style="text-align:center; padding:20px; color:#27ae60; font-weight:bold; font-size:14px;">🎉 Excelente! Nenhum título em atraso.</div>' 
            : inadimplentesList.map(f => {
                const alunoInfo = listaAlunos.find(a => a.id === f.idAluno) || {}; 
                const zap = alunoInfo.whatsapp || ''; 
                const dataBr = f.vencimento.split('-').reverse().join('/'); 
                const valFmt = formatarMoeda(parseFloat(f.valor));
                // 🚀 PASSAMOS O ID DA FATURA AQUI (f.id)
                return CardInadimplente(f.id, f.alunoNome || 'Desconhecido', dataBr, valFmt, zap);
            }).join('');

        let idsAtalhos = JSON.parse(localStorage.getItem(App.getTenantKey('escola_atalhos')));
        if (!idsAtalhos || !Array.isArray(idsAtalhos) || idsAtalhos.length === 0) { idsAtalhos = ['novo_aluno','fin_carne','ped_chamada','ped_notas','ped_plan','ped_bol']; }
        
        const htmlAtalhos = idsAtalhos.map(id => { 
            const func = (window.LISTA_FUNCIONALIDADES || []).find(f => f.id === id); 
            if (func && func.roles.includes(tipoUtilizador)) {
                return `<div class="shortcut-btn" onclick="${func.acao}"><div>${func.icon}</div><span>${func.nome}</span></div>`;
            }
            return ''; 
        }).join('');

        // 🚀 SUBSTITUIÇÃO SUAVE: Os dados chegaram! Trocamos o esqueleto pelo Dashboard real.
        const containerDinamico = document.getElementById('dashboard-dinamico');
        if (containerDinamico) {
            containerDinamico.innerHTML = `
                <div class="dashboard-grid">
                    <div class="stat-card card-blue" style="display:flex; flex-direction:column; align-items:flex-start; justify-content:center; gap:15px; padding:20px;">
                        ${CardEstatistica('Total Alunos', listaAlunos.length, '🎓')}
                        ${CardEstatistica('Total Turmas', listaTurmas.length, '🏫')}
                        ${CardEstatistica('Total Cursos', listaCursos.length, '📚')}
                    </div>
                    ${mostraFinanceiro ? `
                    <div class="stat-card card-green" style="display:block; position:relative;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                            <div class="stat-info"><h4>Receita (${mesAtual}/${anoAtual})</h4><p style="color:#27ae60; font-size:20px;">R$ ${formatarMoeda(totalRecebido)}</p></div>
                            <div class="stat-icon" style="font-size:24px;">💰</div>
                        </div>
                        <div style="height:140px; width:100%; display:flex; justify-content:center; align-items:center;"><canvas id="graficoFinanceiro"></canvas></div>
                        <div style="text-align:center; font-size:11px; color:#666; margin-top:10px; border-top:1px solid #eee; padding-top:5px;">Pendente no mês: <span style="color:#e74c3c; font-weight:bold;">R$ ${formatarMoeda(totalPendente)}</span></div>
                    </div>
                    <div class="stat-card card-red" style="display:flex; flex-direction:column; align-items:stretch; padding:15px; height:100%;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid #fdedec; padding-bottom:8px;">
                            <h4 style="margin:0; font-size:14px; color:#e74c3c; text-transform:uppercase; font-weight:bold;">⚠️ Títulos em Atraso (${inadimplentesList.length})</h4>
                        </div>
                        <div class="lista-atrasados" style="flex:1; overflow-y:auto; max-height: 300px; display:flex; flex-direction:column; gap:10px; padding-right:5px;">
                            ${htmlInadimplentes}
                        </div>
                    </div>
                    ` : ''}
                </div>
                <h3 style="color:var(--card-text); font-size:16px; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">Acesso Rápido</h3>
                <div class="shortcuts-grid">${htmlAtalhos || '<p style="color:#666;">Nenhum atalho selecionado ou permitido.</p>'}</div>`;

            if (mostraFinanceiro) {
                const ctx = document.getElementById('graficoFinanceiro');
                if(ctx && (totalRecebido > 0 || totalPendente > 0)) {
                    new Chart(ctx, { type: 'doughnut', data: { labels: ['Recebido', 'Pendente'], datasets: [{ data: [totalRecebido, totalPendente], backgroundColor: ['#27ae60', '#e74c3c'], borderWidth: 0, hoverOffset: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '75%' } });
                } else if (ctx) { new Chart(ctx, { type: 'doughnut', data: { datasets: [{ data: [1], backgroundColor: ['#eee'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, cutout: '75%' } }); }
            }
        }
    } catch(e) { 
        console.error(e); 
        const containerDinamico = document.getElementById('dashboard-dinamico');
        if(containerDinamico) containerDinamico.innerHTML = "<p style='color:red;'>Erro ao carregar dashboard. Tente atualizar a página.</p>"; 
    }
};

export const cobrarWhatsAppDashboard = (nomeAluno, telefone, dataVencimento, valorFmt) => {
    if (!App.verificarPermissao('whatsapp')) return;
    if (!telefone || telefone.trim() === '' || telefone === 'undefined') { App.showToast("Este aluno não tem um número de WhatsApp registado no sistema!", "error"); return; }
    
    let numero = telefone.replace(/\D/g, ''); 
    if (telefone.trim().startsWith('+')) {
        numero = telefone.replace(/\D/g, ''); 
    } else if (numero.length === 10 || numero.length === 11) {
        numero = '55' + numero;
    }

    const escola = JSON.parse(localStorage.getItem(App.getTenantKey('escola_perfil'))) || {};
    const nomeEscola = escola.nome || 'Nossa Instituição';
    const chavePix = escola.chavePix || 'Não informada';
    const bancoPix = escola.banco || 'Não informado';

    const msg = `🔔 *LEMBRETE DE VENCIMENTO*\nOlá, ${nomeAluno}!\n\nConsta no nosso sistema que a sua mensalidade venceu no dia ${dataVencimento}. Para realizar o pagamento de forma rápida, basta enviar o valor de *R$ ${valorFmt}* para a chave PIX abaixo:\n\n*Instituição:* ${nomeEscola}\n*Banco:* ${bancoPix}\n*Chave PIX:* ${chavePix}\n\n*Obs.:* _Após o pagamento, por favor, envie o comprovante por aqui para podermos dar baixa no sistema._\n\n🙏 Agradecemos desde já e desejamos-lhe um excelente dia! 😉✅`;
    
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`, '_blank');
};

// =========================================================
// 🔦 NAVEGADOR INTELIGENTE (EFEITO HOLOFOTE NO FINANCEIRO)
// =========================================================
App.irParaFinanceiroDestacado = async (idFatura, nomeAluno) => { // 🚀 Adicionámos o "async"
    
    // 1. Aciona o Roteador e ESPERA (await) a lista carregar 100%, independentemente da velocidade da internet
    if (typeof App.renderizarLista === 'function') {
        await App.renderizarLista('financeiro');
    }
    
    // 2. Injeta a Pesquisa Automática (A tabela já existe garantidamente aqui)
    const inputBusca = document.getElementById('input-busca');
    if (inputBusca) {
        inputBusca.value = nomeAluno;
        sessionStorage.setItem('ws_filtro_financeiro', nomeAluno);
        if (typeof App.filtrarTabelaReativa === 'function') App.filtrarTabelaReativa();
    }

    // 3. Aguarda apenas uma fração de segundo para o HTML da tabela se desenhar após o filtro
    setTimeout(() => {
        const checkboxLinha = document.querySelector(`.chk-cadastro[value="${idFatura}"]`);
        if (checkboxLinha) {
            const linha = checkboxLinha.closest('tr');
            if (linha) {
                // Rola o ecrã até à fatura
                linha.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // 🌟 A Magia: Pinta os <td> (Células) individualmente, o que funciona em qualquer navegador!
                const celulas = linha.querySelectorAll('td');
                celulas.forEach(td => {
                    td.style.transition = 'background-color 0.4s ease, border 0.4s ease';
                    td.style.backgroundColor = '#fff3cd'; // Amarelo brilhante
                    td.style.borderTop = '2px solid #f1c40f'; // Borda superior destacada
                    td.style.borderBottom = '2px solid #f1c40f'; // Borda inferior destacada
                });

                // Desliga o holofote após 3 segundos, voltando ao design original
                setTimeout(() => {
                    celulas.forEach(td => {
                        td.style.backgroundColor = 'transparent';
                        td.style.borderTop = '1px solid #eee'; 
                        td.style.borderBottom = '1px solid #eee';
                    });
                }, 3000);
            }
        } else {
            // Caso a fatura já tenha sido paga noutro separador, por exemplo
            App.showToast("Fatura selecionada já não está na lista.", "info");
        }
    }, 150); 
};