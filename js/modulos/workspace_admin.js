// js/modulos/workspace_admin.js
window.App = window.App || {};
const App = window.App;

// 🚀 INJEÇÃO DINÂMICA: Ensina o Roteador Global do app.js a reconhecer estas telas sem alterá-lo!
const originalRenderizarTela = App.renderizarTela;
App.renderizarTela = async (tela, veioDoHistorico = false) => {
    if (tela === 'workspace_admin') return App.renderizarWorkspaceAdmin(veioDoHistorico);
    if (tela === 'workspace_acessos') return App.renderizarWorkspaceAcessos(veioDoHistorico);
    if (tela === 'workspace_monitoramento') return App.renderizarWorkspaceMonitoramento(veioDoHistorico);
    if (originalRenderizarTela) return originalRenderizarTela(tela, veioDoHistorico);
};

// 🚀 INJEÇÃO DINÂMICA: Ensina o restaurador de Modais a abrir a janela de acesso no F5!
const originalModalModulo = App.abrirModalCadastroModulo;
App.abrirModalCadastroModulo = (tipo, id) => {
    if (tipo === 'ws_acesso' && App.workspaceCache) {
        const aluno = App.workspaceCache.alunos.find(a => a.id === id);
        if (aluno) return App.abrirModalAcessoWorkspace(aluno.id, aluno.nome);
    }
    if (originalModalModulo) return originalModalModulo(tipo, id);
};

Object.assign(App, {
    // =========================================================
    // 🎓 1. HUB CENTRAL DO WORKSPACE (MENU DE 2 BOTÕES)
    // =========================================================
    renderizarWorkspaceAdmin: (veioDoHistorico = false) => {
        // 🚀 GRAVA A TELA NA MEMÓRIA PROFUNDA
        if (!veioDoHistorico) window.history.pushState({ tela: 'workspace_admin' }, '', '#workspace_admin');
        if (typeof App.salvarEstadoNavegacao === 'function') App.salvarEstadoNavegacao('fundo', { tipo: 'tela', alvo: 'workspace_admin' });

        App.setTitulo("Gestão do Workspace");
        const div = document.getElementById('app-content');
        
        div.innerHTML = `
            <p style="color: #7f8c8d; font-size: 15px; margin-bottom: 25px; text-align: center;">Escolha a área que deseja aceder para administrar o ambiente virtual dos alunos.</p>
            
            <div style="display:flex; gap:20px; flex-wrap:wrap; justify-content: center;">
                <!-- BOTÃO 1: ACESSOS -->
                <div class="card" style="flex:1; min-width:280px; max-width: 450px; text-align:center; cursor:pointer; transition:all 0.3s ease; border:2px solid transparent; padding: 40px 20px; background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.05);" 
                     onmouseover="this.style.borderColor='#3498db'; this.style.transform='translateY(-5px)';" 
                     onmouseout="this.style.borderColor='transparent'; this.style.transform='translateY(0)';" 
                     onclick="App.renderizarWorkspaceAcessos()">
                    <div style="font-size:55px; margin-bottom:15px;">🔐</div>
                    <h3 style="color:#2c3e50; margin:0 0 10px 0; font-size: 20px;">Gerir Acessos</h3>
                    <p style="color:#7f8c8d; font-size:14px; margin:0; line-height: 1.5;">Criar ou revogar logins e senhas para a entrada dos alunos no Workspace.</p>
                </div>

                <!-- BOTÃO 2: MONITORAMENTO -->
                <div class="card" style="flex:1; min-width:280px; max-width: 450px; text-align:center; cursor:pointer; transition:all 0.3s ease; border:2px solid transparent; padding: 40px 20px; background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.05);" 
                     onmouseover="this.style.borderColor='#27ae60'; this.style.transform='translateY(-5px)';" 
                     onmouseout="this.style.borderColor='transparent'; this.style.transform='translateY(0)';" 
                     onclick="App.renderizarWorkspaceMonitoramento()">
                    <div style="font-size:55px; margin-bottom:15px;">📡</div>
                    <h3 style="color:#2c3e50; margin:0 0 10px 0; font-size: 20px;">Monitoramento Online</h3>
                    <p style="color:#7f8c8d; font-size:14px; margin:0; line-height: 1.5;">Acompanhe em tempo real quem está a navegar no Workspace e os últimos acessos.</p>
                </div>
            </div>
        `;
    },

    // =========================================================
    // 🔐 2. TELA DE GESTÃO DE ACESSOS (SISTEMA ORIGINAL)
    // =========================================================
    renderizarWorkspaceAcessos: async (veioDoHistorico = false) => {
        // 🚀 GRAVA A TELA NA MEMÓRIA PROFUNDA
        if (!veioDoHistorico) window.history.pushState({ tela: 'workspace_acessos' }, '', '#workspace_acessos');
        if (typeof App.salvarEstadoNavegacao === 'function') App.salvarEstadoNavegacao('fundo', { tipo: 'tela', alvo: 'workspace_acessos' });

        App.setTitulo("Acessos ao Portal");
        const div = document.getElementById('app-content');
        div.innerHTML = '<p style="text-align:center; padding:40px; color:#666;">Carregando lista de alunos e acessos... ⏳</p>';

        try {
            const alunosRes = await App.api('/alunos');
            const usuariosRes = await App.api('/usuarios');
            
            const alunos = Array.isArray(alunosRes) ? alunosRes : [];
            const usuarios = Array.isArray(usuariosRes) ? usuariosRes : [];

            const alunosAtivos = alunos.filter(a => !a.status || a.status === 'Ativo');
            const usuariosAlunos = usuarios.filter(u => u.tipo === 'Aluno' || u.alunoRefId);

            App.workspaceCache = { alunos: alunosAtivos, usuarios: usuariosAlunos };

            const barraBusca = `
                <div class="toolbar" style="max-width: 800px; margin: 0 auto 20px auto; display: flex; gap: 15px;">
                    <div class="search-wrapper" style="flex: 1; position: relative;">
                        <span style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #aaa;">🔍</span>
                        <input type="text" id="ws-busca-aluno" style="width: 100%; padding: 14px 14px 14px 45px; border-radius: 8px; border: 2px solid #eee; outline:none;" placeholder="Pesquisar aluno pelo nome..." oninput="App.filtrarWorkspaceAdmin()">
                    </div>
                </div>`;

            div.innerHTML = `
                <div style="margin-bottom: 20px;">
                    <button class="btn-cancel" style="padding: 8px 15px; font-weight: bold;" onclick="App.renderizarWorkspaceAdmin()">⬅️ Voltar ao Hub</button>
                </div>
                <div style="text-align:center; margin-bottom:20px;">
                    <div class="card" style="padding:20px;">
                        <h3 style="margin:0 0 10px 0; color:#2c3e50;">Acessos ao Portal do Aluno</h3>
                        <p style="font-size:13px; color:#7f8c8d; margin:0 0 20px 0;">Crie e gira as credenciais para os alunos acederem à plataforma interativa (Workspace).</p>
                        ${barraBusca}
                    </div>
                </div>
                <div class="card" style="padding:0; overflow:hidden;" id="ws-admin-tabela-container">
                </div>
            `;

            App.filtrarWorkspaceAdmin();

            // 🚀 HIDRATAÇÃO DO FILTRO: Injeta a pesquisa salva antes de filtrar
            const termoSalvo = sessionStorage.getItem('ws_filtro_admin_acessos');
            if (termoSalvo) {
                const inputBusca = document.getElementById('ws-busca-aluno');
                if (inputBusca) inputBusca.value = termoSalvo;
            }

            App.filtrarWorkspaceAdmin();

        } catch (e) {
            console.error("Erro na gestão:", e);
            div.innerHTML = '<p style="color:#e74c3c; text-align:center; padding:40px;">Erro ao carregar a lista de alunos.</p>';
        }
    },

    filtrarWorkspaceAdmin: () => {
        const input = document.getElementById('ws-busca-aluno');
        const termo = (input?.value || '').toLowerCase();
        
        // 🚀 MEMÓRIA DA PESQUISA: Grava na sessão
        sessionStorage.setItem('ws_filtro_admin_acessos', input?.value || '');

        const container = document.getElementById('ws-admin-tabela-container');
        if (!container || !App.workspaceCache) return;

        const { alunos, usuarios } = App.workspaceCache;
        const filtrados = alunos.filter(a => (a.nome || '').toLowerCase().includes(termo));

        if (filtrados.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding:30px; color:#666;">Nenhum aluno encontrado com este nome.</p>';
            return;
        }

        let html = `
            <div class="table-responsive-wrapper">
                <table style="width:100%; text-align:left; border-collapse:collapse;">
                    <thead>
                        <tr style="border-bottom:2px solid #eee; background:#f8f9fa;">
                            <th style="padding:15px; color:#2c3e50;">Nome do Aluno</th>
                            <th style="padding:15px; color:#2c3e50;">Login no Workspace</th>
                            <th style="padding:15px; text-align:right; color:#2c3e50;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        filtrados.forEach(aluno => {
            const conta = usuarios.find(u => u.alunoRefId === aluno.id);
            
            const statusHtml = conta 
                ? `<span style="background:#eafaf1; color:#27ae60; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:bold; border:1px solid #2ecc71;">✅ ${App.escapeHTML(conta.login)}</span>` 
                : `<span style="background:#fdf2f2; color:#e74c3c; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:bold; border:1px solid #e74c3c;">❌ Sem Acesso</span>`;
            
            const nomeSeguro = App.escapeHTML(aluno.nome).replace(/'/g, "\\'");

            const btnHtml = conta
                ? `<button class="btn-cancel" style="padding:8px 15px; font-size:12px; width:auto; font-weight:bold; color:#e74c3c; border-color:#e74c3c;" onclick="App.excluirAcessoWorkspace('${conta.id}')">🗑️ Revogar Acesso</button>`
                : `<button class="btn-primary" style="padding:8px 15px; font-size:12px; width:auto; font-weight:bold; background:#8e44ad; border-color:#8e44ad;" onclick="App.abrirModalAcessoWorkspace('${aluno.id}', '${nomeSeguro}')">🔑 Gerar Acesso</button>`;

            html += `
                <tr style="border-bottom:1px solid #f9f9f9; transition: background 0.2s;" onmouseover="this.style.background='#f4f6f7'" onmouseout="this.style.background='transparent'">
                    <td style="padding:15px; font-size:14px; font-weight:500; color:#333;">${App.escapeHTML(aluno.nome)}</td>
                    <td style="padding:15px;">${statusHtml}</td>
                    <td style="padding:15px; text-align:right;">${btnHtml}</td>
                </tr>
            `;
        });

        html += `</tbody></table></div>`;
        container.innerHTML = html;
    },

    abrirModalAcessoWorkspace: (alunoId, nomeAluno) => {
        // 🚀 GRAVA O MODAL ABERTO NA MEMÓRIA PROFUNDA
        if (typeof App.salvarEstadoNavegacao === 'function') App.salvarEstadoNavegacao('modal', { tipo: 'ws_acesso', id: alunoId });
        let modal = document.getElementById('modal-acesso-ws');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-acesso-ws';
            modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; justify-content:center; align-items:center; z-index:10000; backdrop-filter:blur(4px);';
            document.body.appendChild(modal);
        }
        
        const partes = nomeAluno.split(' ');
        const sugestao = (partes[0] + (partes.length > 1 ? partes[partes.length-1] : '')).toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(100 + Math.random() * 900);

        modal.innerHTML = `
            <div style="background:#fff; padding:30px; border-radius:16px; max-width:400px; width:90%; box-shadow:0 20px 50px rgba(0,0,0,0.3); animation: slideIn 0.3s ease;">
                <div style="text-align:center; font-size:40px; margin-bottom:10px;">🎓</div>
                <h3 style="margin-top:0; color:#2c3e50; text-align:center;">Acesso ao Workspace</h3>
                <p style="font-size:13px; color:#666; text-align:center; margin-bottom:25px;">Crie as credenciais para:<br><strong style="color:#3498db; font-size:15px;">${nomeAluno}</strong></p>
                
                <div class="input-group" style="margin-bottom:15px; text-align:left;">
                    <label style="font-weight:bold; font-size:12px; color:#555;">Login de Acesso</label>
                    <input type="text" id="ws-input-login" value="${sugestao}" style="width:100%; padding:12px; border:2px solid #eee; border-radius:8px; font-weight:bold; color:#333; outline:none;" onfocus="this.style.borderColor='#3498db'" onblur="this.style.borderColor='#eee'">
                </div>
                
                <div class="input-group" style="margin-bottom:25px; text-align:left;">
                    <label style="font-weight:bold; font-size:12px; color:#555;">Senha Provisória</label>
                    <input type="text" id="ws-input-senha" value="123456" style="width:100%; padding:12px; border:2px solid #eee; border-radius:8px; font-weight:bold; color:#333; outline:none;" onfocus="this.style.borderColor='#3498db'" onblur="this.style.borderColor='#eee'">
                    <small style="color:#999; font-size:11px; display:block; margin-top:5px;">A senha deve ter no mínimo 6 caracteres.</small>
                </div>

                <div style="display:flex; gap:10px;">
                    <button class="btn-cancel" style="flex:1; justify-content:center; padding:12px; border-radius:8px;" onclick="document.getElementById('modal-acesso-ws').style.display='none'; if(App.salvarEstadoNavegacao) App.salvarEstadoNavegacao('modal', null);">Cancelar</button>
                    <button class="btn-primary" id="ws-btn-salvar-acesso" style="flex:1; justify-content:center; padding:12px; border-radius:8px; background:#27ae60; border:none;" onclick="App.salvarAcessoWorkspace('${alunoId}', '${nomeAluno.replace(/'/g, "\\'")}')">💾 Guardar</button>
                </div>
            </div>
        `;
        modal.style.display = 'flex';
    },

    salvarAcessoWorkspace: async (alunoId, nomeAluno) => {
        const login = document.getElementById('ws-input-login').value.trim();
        const senha = document.getElementById('ws-input-senha').value.trim();

        if (!login || senha.length < 6) return App.showToast("Preencha o login e uma senha (mín. 6 caracteres).", "warning");

        const btn = document.getElementById('ws-btn-salvar-acesso');
        const originalText = btn.innerHTML;
        btn.innerHTML = "A salvar... ⏳"; btn.disabled = true;

        try {
            const payload = { nome: nomeAluno, login: login, senha: senha, tipo: 'Aluno', alunoRefId: alunoId };
            const res = await App.api('/usuarios', 'POST', payload);

            if (res && res.error) {
                App.showToast(res.error, "error");
            } else {
                App.showToast("✅ Acesso criado com sucesso!", "success");
                document.getElementById('modal-acesso-ws').style.display = 'none';
                if(typeof App.salvarEstadoNavegacao === 'function') App.salvarEstadoNavegacao('modal', null); // 🚀 Limpa a memória
                App.renderizarWorkspaceAcessos();
            }
        } catch (e) { App.showToast("Erro de ligação.", "error"); } 
        finally { btn.innerHTML = originalText; btn.disabled = false; }
    },

    excluirAcessoWorkspace: (usuarioId) => {
        App.abrirModalConfirmacao(
            "Revogar Acesso?", 
            "O aluno perderá o acesso ao Workspace. Esta ação não apaga os dados escolares do aluno, apenas o login.", 
            async (modal) => {
                document.body.style.cursor = 'wait';
                try {
                    await App.api(`/usuarios/${usuarioId}`, 'DELETE');
                    App.showToast("Acesso revogado.", "success");
                    App.renderizarWorkspaceAcessos(); // 🚀 CORRIGIDO: Volta para a lista de acessos e não para o Hub
                } catch(e) { App.showToast("Erro ao revogar.", "error"); } 
                finally { document.body.style.cursor = 'default'; modal.style.opacity = '0'; setTimeout(() => modal.style.display='none', 300); }
            }
        );
    },

    // =========================================================
    // 📡 3. TELA DE MONITORAMENTO EM TEMPO REAL
    // =========================================================
    radarMonitoramentoInterval: null,

   renderizarWorkspaceMonitoramento: async (veioDoHistorico = false) => {
        // 🚀 GRAVA A TELA NA MEMÓRIA PROFUNDA
        if (!veioDoHistorico) window.history.pushState({ tela: 'workspace_monitoramento' }, '', '#workspace_monitoramento');
        if (typeof App.salvarEstadoNavegacao === 'function') App.salvarEstadoNavegacao('fundo', { tipo: 'tela', alvo: 'workspace_monitoramento' });

        App.setTitulo("Monitoramento Online");
        const div = document.getElementById('app-content');
        
        // Injeta CSS para a bolinha a piscar (se não existir)
        if (!document.getElementById('ws-pulse-css')) {
            const style = document.createElement('style');
            style.id = 'ws-pulse-css';
            style.innerHTML = `@keyframes pulseDot { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(39, 174, 96, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(39, 174, 96, 0); } }`;
            document.head.appendChild(style);
        }

        div.innerHTML = `
            <div style="margin-bottom: 20px;">
                <button class="btn-cancel" style="padding: 8px 15px; font-weight: bold;" onclick="App.renderizarWorkspaceAdmin()">⬅️ Voltar ao Hub</button>
            </div>
            <div class="card" style="padding: 0; overflow: hidden; border: 1px solid #eee;">
                <div style="background: #f8f9fa; padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin:0; color:#2c3e50; font-size: 18px;">📡 Atividade dos Alunos no Workspace</h3>
                    <div style="font-size: 12px; color: #7f8c8d; display: flex; align-items: center; gap: 6px; font-weight:bold;">
                        <div style="width:8px; height:8px; background:#27ae60; border-radius:50%; animation: pulseDot 2s infinite;"></div>
                        Radar Ativado
                    </div>
                </div>
                <div id="lista-monitoramento" style="padding: 0;">
                    <p style="text-align:center; padding: 40px; color:#999; font-size: 14px;">A estabelecer conexão com os servidores... ⏳</p>
                </div>
            </div>
        `;

        // Busca dados pela 1ª vez
        await App.atualizarDadosRadar();

        // Limpa lixo de memória
        if (App.radarMonitoramentoInterval) clearInterval(App.radarMonitoramentoInterval);

        // Dispara o Radar a cada 10 segundos
        App.radarMonitoramentoInterval = setInterval(() => {
            const telaAtual = document.getElementById('titulo-pagina')?.innerText;
            // Se o Professor sair da tela, desliga o radar para poupar internet
            if (telaAtual !== "Monitoramento Online") {
                clearInterval(App.radarMonitoramentoInterval);
                return;
            }
            App.atualizarDadosRadar(true); 
        }, 10000);
    },

  atualizarDadosRadar: async (silencioso = false) => {
        try {
            // 1. Puxa o ID da escola (Para não misturar dados de outras instituições)
            let escolaId = 'DEFAULT';
            if (App.usuario && App.usuario.escolaId) {
                escolaId = App.usuario.escolaId;
            } else {
                const escolaCache = JSON.parse(localStorage.getItem(App.getTenantKey('escola_perfil'))) || {};
                escolaId = escolaCache.id || 'DEFAULT';
            }

            // 2. BUSCA SIMULTÂNEA: Radar + Secretaria + Usuários
            const [radarRes, alunosRes, usuariosRes] = await Promise.all([
                App.api(`/workspace/monitoramento/status?escolaId=${escolaId}`, 'GET', null, silencioso),
                App.api('/alunos', 'GET', null, true),
                App.api('/usuarios', 'GET', null, true)
            ]);
            
            const container = document.getElementById('lista-monitoramento');
            if (!container) return;

            const alunos = Array.isArray(alunosRes) ? alunosRes : [];
            const usuarios = Array.isArray(usuariosRes) ? usuariosRes : [];
            const radarDados = Array.isArray(radarRes) ? radarRes : [];

            // 3. O FILTRO DE OURO: Isola apenas os alunos estritamente ATIVOS
            const alunosAtivos = alunos.filter(a => !a.status || a.status === 'Ativo');
            const alunosAtivosIds = alunosAtivos.map(a => a.id);

            // 4. Isola apenas os utilizadores (contas) que pertencem a esses alunos ativos
            const contasAtivas = usuarios.filter(u => 
                (u.tipo === 'Aluno' || u.alunoRefId) && alunosAtivosIds.includes(u.alunoRefId)
            );

            // Se nenhum aluno ativo tiver conta criada, exibe a mensagem correta
            if (contasAtivas.length === 0) {
                container.innerHTML = '<p style="text-align:center; padding: 40px; color:#7f8c8d; font-size: 14px;">Nenhum aluno ativo possui acesso ao Workspace no momento.</p>';
                return;
            }

            // 5. CONSTRUÇÃO DA LISTA VISUAL: Mescla a Conta Ativa com o status do Radar
            const listaMonitoramento = contasAtivas.map(conta => {
                const alunoFicha = alunosAtivos.find(a => a.id === conta.alunoRefId) || {};
                const statusRadar = radarDados.find(r => r.login === conta.login) || {};
                
                return {
                    nome: alunoFicha.nome || conta.nome || conta.login,
                    login: conta.login,
                    isOnline: statusRadar.isOnline || false,
                    ultimoAcesso: statusRadar.ultimoAcesso || null
                };
            });

            // Ordena: Alunos Online no topo, seguidos por ordem alfabética
            listaMonitoramento.sort((a, b) => {
                if (b.isOnline === a.isOnline) return a.nome.localeCompare(b.nome);
                return b.isOnline ? 1 : -1;
            });

            // 6. RENDERIZAÇÃO DA TABELA
            let html = '<div class="table-responsive-wrapper"><table style="width:100%; border-collapse:collapse; text-align:left;">';
            html += '<thead><tr style="background: #fff; border-bottom: 2px solid #eee; color:#64748b; font-size: 13px; text-transform: uppercase;">';
            html += '<th style="padding:15px 20px;">Identificação do Aluno</th>';
            html += '<th style="padding:15px 20px; text-align:center;">Status Atual</th>';
            html += '<th style="padding:15px 20px; text-align:right;">Última Interação Registada</th>';
            html += '</tr></thead><tbody>';

            listaMonitoramento.forEach(aluno => {
                const isOnline = aluno.isOnline; 
                const corBola = isOnline ? '#27ae60' : '#e74c3c';
                const txtStatus = isOnline ? 'Online Agora' : 'Offline';
                const fundoStatus = isOnline ? '#eafaf1' : '#fdedec';
                const animacao = isOnline ? 'animation: pulseDot 2s infinite;' : '';
                
                const dataAcesso = aluno.ultimoAcesso 
                    ? new Date(aluno.ultimoAcesso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                    : 'Nunca acessou';

                html += `
                    <tr style="border-bottom:1px solid #f0f2f5; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                        <td style="padding:15px 20px; font-weight:bold; color:#1e293b; font-size: 14px;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="width:35px; height:35px; background:#e2e8f0; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:16px;">👤</div>
                                ${App.escapeHTML(aluno.nome)}
                                <span style="font-size: 10px; color: #94a3b8; font-weight: normal; margin-left: 5px;">(@${App.escapeHTML(aluno.login)})</span>
                            </div>
                        </td>
                        <td style="padding:15px 20px; text-align:center;">
                            <div style="background:${fundoStatus}; color:${corBola}; padding:6px 12px; border-radius:20px; font-size:12px; font-weight:bold; display:inline-flex; align-items:center; gap:6px; border: 1px solid ${corBola}40;">
                                <div style="width:8px; height:8px; background:${corBola}; border-radius:50%; ${animacao}"></div>
                                ${txtStatus}
                            </div>
                        </td>
                        <td style="padding:15px 20px; text-align:right; color:#64748b; font-size:13px; font-weight: 500;">
                            ${dataAcesso}
                        </td>
                    </tr>
                `;
            });

            html += '</tbody></table></div>';
            container.innerHTML = html;

        } catch (e) {
            // Falha invisível
        }
    }
});