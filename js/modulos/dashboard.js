window.App = window.App || {};
const App = window.App;

// =========================================================
// MÓDULO DASHBOARD - VISÃO GERAL E MÉTRICAS INICIAIS
// =========================================================

Object.assign(App, {

    renderizarInicio: async () => { 
        App.verificarNotificacoes(); 
        App.setTitulo("Visão Geral"); const div = document.getElementById('app-content'); div.innerHTML = '<p style="padding:20px; text-align:center; color:#666;">Carregando painel de métricas...</p>';
        try {
            const [alunos, financeiro, turmas, cursos] = await Promise.all([ App.api('/alunos'), App.api('/financeiro'), App.api('/turmas'), App.api('/cursos') ]);
            const todosAlunos = Array.isArray(alunos) ? alunos : [];
            const listaAlunos = todosAlunos.filter(a => !a.status || a.status === 'Ativo'); 
            const listaFin = Array.isArray(financeiro) ? financeiro : []; const listaTurmas = Array.isArray(turmas) ? turmas : []; const listaCursos = Array.isArray(cursos) ? cursos : [];
            const dataHoje = new Date(); const mesAtual = dataHoje.getMonth() + 1; const anoAtual = dataHoje.getFullYear();
            
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

            let idsAtalhos = JSON.parse(localStorage.getItem(App.getTenantKey('escola_atalhos')));
            if (!idsAtalhos || !Array.isArray(idsAtalhos) || idsAtalhos.length === 0) { idsAtalhos = ['novo_aluno','fin_carne','ped_chamada','ped_notas','ped_plan','ped_bol']; }
            
            const htmlAtalhos = idsAtalhos.map(id => { 
                const func = (window.LISTA_FUNCIONALIDADES || []).find(f => f.id === id); 
                if (func && func.roles.includes(tipoUtilizador)) {
                    return `<div class="shortcut-btn" onclick="${func.acao}"><div>${func.icon}</div><span>${func.nome}</span></div>`;
                }
                return ''; 
            }).join('');

            const htmlInadimplentes = inadimplentesList.length === 0 
                ? '<div style="text-align:center; padding:20px; color:#27ae60; font-weight:bold; font-size:14px;">🎉 Excelente! Nenhum título em atraso.</div>' 
                : inadimplentesList.map(f => {
                    const alunoInfo = listaAlunos.find(a => a.id === f.idAluno) || {}; const zap = alunoInfo.whatsapp || ''; const dataBr = f.vencimento.split('-').reverse().join('/'); const valFmt = formatarMoeda(parseFloat(f.valor));
                    return `<div style="background:#fff; border:1px solid #f5b7b1; padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 4px rgba(0,0,0,0.02);"><div><div style="font-size:13px; font-weight:bold; color:#333; margin-bottom:4px;">${App.escapeHTML(f.alunoNome || 'Desconhecido')}</div><div style="font-size:11px; color:#c0392b; font-weight:600;">Venc: ${dataBr} • R$ ${valFmt}</div></div><button onclick="App.cobrarWhatsAppDashboard('${App.escapeHTML(f.alunoNome)}', '${zap}', '${dataBr}', '${valFmt}')" style="background:#25D366; color:white; border:none; padding:8px 12px; border-radius:6px; font-size:11px; cursor:pointer; font-weight:bold; white-space:nowrap; box-shadow:0 2px 4px rgba(37,211,102,0.3); display:flex; align-items:center; gap:5px; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"><span>💬</span> Cobrar</button></div>`;
                }).join('');

            div.innerHTML = `
                <h3 style="opacity:0.7; margin-top:0; margin-bottom:20px;">Olá, ${App.escapeHTML(App.usuario ? App.usuario.nome : 'Gestor')}! 👋</h3>
                <div class="dashboard-grid">
                    <div class="stat-card card-blue" style="display:flex; flex-direction:column; align-items:flex-start; justify-content:center; gap:15px; padding:20px;">
                        <div style="width:100%; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:10px;"><div style="display:flex; align-items:center; gap:10px;"><span style="font-size:24px;">🎓</span><span style="font-size:14px; font-weight:600; color:#555; text-transform:uppercase;">Total Alunos</span></div><span style="font-size:20px; font-weight:bold; color:#3498db;">${listaAlunos.length}</span></div>
                        <div style="width:100%; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:10px;"><div style="display:flex; align-items:center; gap:10px;"><span style="font-size:24px;">🏫</span><span style="font-size:14px; font-weight:600; color:#555; text-transform:uppercase;">Total Turmas</span></div><span style="font-size:20px; font-weight:bold; color:#3498db;">${listaTurmas.length}</span></div>
                        <div style="width:100%; display:flex; justify-content:space-between; align-items:center;"><div style="display:flex; align-items:center; gap:10px;"><span style="font-size:24px;">📚</span><span style="font-size:14px; font-weight:600; color:#555; text-transform:uppercase;">Total Cursos</span></div><span style="font-size:20px; font-weight:bold; color:#3498db;">${listaCursos.length}</span></div>
                    </div>
                    ${mostraFinanceiro ? `
                    <div class="stat-card card-green" style="display:block; position:relative;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;"><div class="stat-info"><h4>Receita (${mesAtual}/${anoAtual})</h4><p style="color:#27ae60; font-size:20px;">R$ ${formatarMoeda(totalRecebido)}</p></div><div class="stat-icon" style="font-size:24px;">💰</div></div>
                        <div style="height:140px; width:100%; display:flex; justify-content:center; align-items:center;"><canvas id="graficoFinanceiro"></canvas></div>
                        <div style="text-align:center; font-size:11px; color:#666; margin-top:10px; border-top:1px solid #eee; padding-top:5px;">Pendente no mês: <span style="color:#e74c3c; font-weight:bold;">R$ ${formatarMoeda(totalPendente)}</span></div>
                    </div>
                    <div class="stat-card card-red" style="display:flex; flex-direction:column; align-items:stretch; padding:15px; height:100%;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid #fdedec; padding-bottom:8px;"><h4 style="margin:0; font-size:14px; color:#e74c3c; text-transform:uppercase; font-weight:bold;">⚠️ Títulos em Atraso (${inadimplentesList.length})</h4></div>
                        <div class="lista-atrasados" style="flex:1; overflow-y:auto; max-height: 300px; display:flex; flex-direction:column; gap:10px; padding-right:5px;">${htmlInadimplentes}</div>
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
        } catch(e) { console.error(e); div.innerHTML = "<p>Erro ao carregar dashboard.</p>"; }
    },

    cobrarWhatsAppDashboard: (nomeAluno, telefone, dataVencimento, valorFmt) => {
        if (!App.verificarPermissao('whatsapp')) return;
        if (!telefone || telefone.trim() === '' || telefone === 'undefined') { App.showToast("Este aluno não tem um número de WhatsApp registado no sistema!", "error"); return; }
        
        let numero = telefone.replace(/\D/g, ''); 
        if (telefone.trim().startsWith('+')) {
            // Se já tem '+', usamos exatamente os números com o DDI que foi digitado
            numero = telefone.replace(/\D/g, ''); 
        } else if (numero.length === 10 || numero.length === 11) {
            // Se for nacional (sem DDI), injeta o 55 por defeito
            numero = '55' + numero;
        }

        // 1. Puxar os dados da Escola registados no sistema
        const escola = JSON.parse(localStorage.getItem(App.getTenantKey('escola_perfil'))) || {};
        const nomeEscola = escola.nome || 'Nossa Instituição';
        const chavePix = escola.chavePix || 'Não informada';
        const bancoPix = escola.banco || 'Não informado';

        // 2. Montar a mensagem de forma dinâmica
        const msg = `🔔 *LEMBRETE DE VENCIMENTO*\nOlá, ${nomeAluno}!\n\nConsta no nosso sistema que a sua mensalidade venceu no dia ${dataVencimento}. Para realizar o pagamento de forma rápida, basta enviar o valor de *R$ ${valorFmt}* para a chave PIX abaixo:\n\n*Instituição:* ${nomeEscola}\n*Banco:* ${bancoPix}\n*Chave PIX:* ${chavePix}\n\n*Obs.:* _Após o pagamento, por favor, envie o comprovante por aqui para podermos dar baixa no sistema._\n\n🙏 Agradecemos desde já e desejamos-lhe um excelente dia! 😉✅`;
        
        window.open(`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`, '_blank');
    } 

});