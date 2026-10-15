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

    // Memória das mensagens salvas para reutilização rápida
    mensagensSalvasWorkspace: [],

    // =========================================================
    // 🎓 1. HUB CENTRAL DO WORKSPACE (MENU DE 2 BOTÕES + AVISO GERAL)
    // =========================================================
    renderizarWorkspaceAdmin: (veioDoHistorico = false) => {
        if (!veioDoHistorico) window.history.pushState({ tela: 'workspace_admin' }, '', '#workspace_admin');
        if (typeof App.salvarEstadoNavegacao === 'function') App.salvarEstadoNavegacao('fundo', { tipo: 'tela', alvo: 'workspace_admin' });

        App.setTitulo("Gestão do Workspace");
        const div = document.getElementById('app-content');
        
        div.innerHTML = `
            <p style="color: #7f8c8d; font-size: 15px; margin-bottom: 20px; text-align: center;">Escolha a área que deseja aceder para administrar o ambiente virtual dos alunos.</p>
            
            <div style="text-align: center; margin-bottom: 25px;">
                <button class="btn-primary" style="background: #2563eb; border: none; padding: 12px 22px; border-radius: 10px; font-weight: bold; font-size: 14px; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);" onclick="App.abrirModalAvisoWorkspace('TODOS', '', 'Todos os Alunos do Workspace')">
                    📢 Enviar Aviso Push para Todos os Alunos
                </button>
            </div>

            <div style="display:flex; gap:20px; flex-wrap:wrap; justify-content: center;">
                <!-- BOTÃO 1: ACESSOS -->
                <div class="card" style="flex:1; min-width:280px; max-width: 450px; text-align:center; cursor:pointer; transition:all 0.3s ease; border:2px solid transparent; padding: 40px 20px; background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.05);" 
                     onmouseover="this.style.borderColor='#3498db'; this.style.transform='translateY(-5px)';" 
                     onmouseout="this.style.borderColor='transparent'; this.style.transform='translateY(0)';" 
                     onclick="App.renderizarWorkspaceAcessos()">
                    <div style="font-size:55px; margin-bottom:15px;">🔐</div>
                    <h3 style="color:#2c3e50; margin:0 0 10px 0; font-size: 20px;">Gerir Acessos e Avisos</h3>
                    <p style="color:#7f8c8d; font-size:14px; margin:0; line-height: 1.5;">Criar logins, revogar senhas ou enviar notificações individuais para alunos no Workspace.</p>
                </div>

                <!-- BOTÃO 2: MONITORAMENTO -->
                <div class="card" style="flex:1; min-width:280px; max-width: 450px; text-align:center; cursor:pointer; transition:all 0.3s ease; border:2px solid transparent; padding: 40px 20px; background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.05);" 
                     onmouseover="this.style.borderColor='#27ae60'; this.style.transform='translateY(-5px)';" 
                     onmouseout="this.style.borderColor='transparent'; this.style.transform='translateY(0)';" 
                     onclick="App.renderizarWorkspaceMonitoramento()">
                    <div style="font-size:55px; margin-bottom:15px;">📡</div>
                    <h3 style="color:#2c3e50; margin:0 0 10px 0; font-size: 20px;">Monitoramento Online</h3>
                    <p style="color:#7f8c8d; font-size:14px; margin:0; line-height: 1.5;">Acompanhe em tempo real quem está a navegar no Workspace e envie alertas rápidos.</p>
                </div>
            </div>
        `;
    },

    // Função auxiliar que garante que temos a lista de alunos e logins do Workspace carregada
    garantirCacheWorkspace: async () => {
        if (App.workspaceCache && Array.isArray(App.workspaceCache.usuarios) && App.workspaceCache.usuarios.length > 0) {
            return App.workspaceCache;
        }
        try {
            const [alunosRes, usuariosRes] = await Promise.all([
                App.api('/alunos', 'GET', null, true),
                App.api('/usuarios', 'GET', null, true)
            ]);
            const alunos = Array.isArray(alunosRes) ? alunosRes : [];
            const usuarios = Array.isArray(usuariosRes) ? usuariosRes : [];
            const alunosAtivos = alunos.filter(a => !a.status ? true : a.status === 'Ativo');
            const usuariosAlunos = usuarios.filter(u => u.tipo === 'Aluno' ? true : Boolean(u.alunoRefId));
            App.workspaceCache = { alunos: alunosAtivos, usuarios: usuariosAlunos };
        } catch (e) {
            App.workspaceCache = { alunos: [], usuarios: [] };
        }
        return App.workspaceCache;
    },

    // =========================================================
    // 🔐 2. TELA DE GESTÃO DE ACESSOS E AVISOS
    // =========================================================
    renderizarWorkspaceAcessos: async (veioDoHistorico = false) => {
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

            const alunosAtivos = alunos.filter(a => !a.status ? true : a.status === 'Ativo');
            const usuariosAlunos = usuarios.filter(u => u.tipo === 'Aluno' ? true : Boolean(u.alunoRefId));

            App.workspaceCache = { alunos: alunosAtivos, usuarios: usuariosAlunos };

            const barraBusca = `
                <div class="toolbar" style="max-width: 800px; margin: 0 auto 20px auto; display: flex; gap: 15px; flex-wrap: wrap;">
                    <div class="search-wrapper" style="flex: 1; min-width: 240px; position: relative;">
                        <span style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #aaa;">🔍</span>
                        <input type="text" id="ws-busca-aluno" style="width: 100%; padding: 14px 14px 14px 45px; border-radius: 8px; border: 2px solid #eee; outline:none; box-sizing: border-box;" placeholder="Pesquisar aluno pelo nome..." oninput="App.filtrarWorkspaceAdmin()">
                    </div>
                    <button class="btn-primary" style="background: #2563eb; border: none; padding: 12px 18px; border-radius: 8px; font-weight: bold; cursor: pointer;" onclick="App.abrirModalAvisoWorkspace('TODOS', '', 'Todos os Alunos do Workspace')">
                        📢 Avisar Todos
                    </button>
                </div>`;

            div.innerHTML = `
                <div style="margin-bottom: 20px;">
                    <button class="btn-cancel" style="padding: 8px 15px; font-weight: bold;" onclick="App.renderizarWorkspaceAdmin()">⬅️ Voltar ao Hub</button>
                </div>
                <div style="text-align:center; margin-bottom:20px;">
                    <div class="card" style="padding:20px;">
                        <h3 style="margin:0 0 10px 0; color:#2c3e50;">Acessos ao Portal do Aluno</h3>
                        <p style="font-size:13px; color:#7f8c8d; margin:0 0 20px 0;">Crie credenciais ou envie notificações diretas para os alunos no Workspace.</p>
                        ${barraBusca}
                    </div>
                </div>
                <div class="card" style="padding:0; overflow:hidden;" id="ws-admin-tabela-container">
                </div>
            `;

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
        const valorInput = input && input.value ? input.value : '';
        const termo = valorInput.toLowerCase();
        
        sessionStorage.setItem('ws_filtro_admin_acessos', valorInput);

        const container = document.getElementById('ws-admin-tabela-container');
        if (!container || !App.workspaceCache) return;

        const { alunos, usuarios } = App.workspaceCache;
        const filtrados = alunos.filter(a => (a.nome ? a.nome : '').toLowerCase().includes(termo));

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
            const conta = usuarios.find(u => String(u.alunoRefId) === String(aluno.id));
            
            const statusHtml = conta 
                ? `<span style="background:#eafaf1; color:#27ae60; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:bold; border:1px solid #2ecc71;">✅ ${App.escapeHTML(conta.login)}</span>` 
                : `<span style="background:#fdf2f2; color:#e74c3c; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:bold; border:1px solid #e74c3c;">❌ Sem Acesso</span>`;
            
            const nomeRealWorkspace = conta ? (conta.nome ? conta.nome : (aluno.nome ? aluno.nome : conta.login)) : aluno.nome;
            const nomeSeguro = App.escapeHTML(nomeRealWorkspace).replace(/'/g, "\\'");

            const btnHtml = conta
                ? `<div style="display:inline-flex; gap:8px; flex-wrap:wrap; justify-content:flex-end;">
                       <button class="btn-primary" style="padding:8px 12px; font-size:12px; width:auto; font-weight:bold; background:#2563eb; border:none; border-radius:6px; cursor:pointer;" onclick="App.abrirModalAvisoWorkspace('${conta.id}', '${aluno.id}', '${nomeSeguro}')">🔔 Avisar</button>
                       <button class="btn-cancel" style="padding:8px 12px; font-size:12px; width:auto; font-weight:bold; color:#e74c3c; border-color:#e74c3c;" onclick="App.excluirAcessoWorkspace('${conta.id}')">🗑️ Revogar</button>
                   </div>`
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

    // =========================================================
    // 💾 3. MOTOR DE MENSAGENS SALVAS (PARA REUTILIZAR QUANDO PRECISAR)
    // =========================================================
    getChaveLocalAvisosSalvos: () => {
        return typeof App.getTenantKey === 'function' ? App.getTenantKey('ws_avisos_salvos_cache') : 'ws_avisos_salvos_cache';
    },

    carregarMensagensSalvasWS: async () => {
        const container = document.getElementById('ws-lista-mensagens-salvas');
        if (container) {
            container.innerHTML = '<div style="font-size:12px; color:#94a3b8; text-align:center; padding:10px;">A carregar mensagens salvas... ⏳</div>';
        }

        try {
            const res = await App.api('/push/avisos-salvos', 'GET', null, true);
            if (Array.isArray(res)) {
                App.mensagensSalvasWorkspace = res;
                localStorage.setItem(App.getChaveLocalAvisosSalvos(), JSON.stringify(res));
            } else {
                const local = JSON.parse(localStorage.getItem(App.getChaveLocalAvisosSalvos()) ? localStorage.getItem(App.getChaveLocalAvisosSalvos()) : '[]');
                App.mensagensSalvasWorkspace = Array.isArray(local) ? local : [];
            }
        } catch (e) {
            const local = JSON.parse(localStorage.getItem(App.getChaveLocalAvisosSalvos()) ? localStorage.getItem(App.getChaveLocalAvisosSalvos()) : '[]');
            App.mensagensSalvasWorkspace = Array.isArray(local) ? local : [];
        }

        App.renderizarListaMensagensSalvasWS();
    },

    renderizarListaMensagensSalvasWS: () => {
        const container = document.getElementById('ws-lista-mensagens-salvas');
        const badgeCount = document.getElementById('ws-count-mensagens-salvas');
        if (!container) return;

        const lista = App.mensagensSalvasWorkspace ? App.mensagensSalvasWorkspace : [];
        if (badgeCount) badgeCount.innerText = lista.length;

        if (lista.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:12px; color:#94a3b8; font-size:12px; background:#f8fafc; border-radius:8px; border:1px dashed #cbd5e1;">
                    Nenhuma mensagem salva ainda. As mensagens que enviar ou guardar aparecerão aqui para reutilizar com 1 clique!
                </div>`;
            return;
        }

        container.innerHTML = lista.map((item, idx) => {
            const resumoMsg = item.mensagem && item.mensagem.length > 70 
                ? item.mensagem.substring(0, 70) + '...' 
                : (item.mensagem ? item.mensagem : '');

            return `
                <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; background:#f8fafc; border:1px solid #e2e8f0; padding:8px 10px; border-radius:8px; margin-bottom:6px; transition:0.2s;" onmouseover="this.style.borderColor='#93c5fd'" onmouseout="this.style.borderColor='#e2e8f0'">
                    <div style="flex:1; min-width:0; cursor:pointer;" onclick="App.usarMensagemSalvaWS(${idx})" title="Clique para preencher este aviso">
                        <div style="font-size:12px; font-weight:700; color:#1e293b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">📌 ${App.escapeHTML(item.titulo)}</div>
                        <div style="font-size:11px; color:#64748b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${App.escapeHTML(resumoMsg)}</div>
                    </div>
                    <div style="display:flex; gap:4px; flex-shrink:0;">
                        <button type="button" onclick="App.usarMensagemSalvaWS(${idx})" style="background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer;" title="Carregar texto nos campos">📂 Usar</button>
                        <button type="button" onclick="App.excluirMensagemSalvaWS('${item.id}', ${idx})" style="background:#fef2f2; color:#ef4444; border:1px solid #fecaca; padding:4px 7px; border-radius:6px; font-size:11px; cursor:pointer;" title="Apagar das salvas">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    },

    usarMensagemSalvaWS: (idx) => {
        const item = App.mensagensSalvasWorkspace && App.mensagensSalvasWorkspace[idx];
        if (!item) return;

        const inputTitulo = document.getElementById('ws-aviso-titulo');
        const inputMsg = document.getElementById('ws-aviso-mensagem');
        if (inputTitulo) inputTitulo.value = item.titulo ? item.titulo : '';
        if (inputMsg) inputMsg.value = item.mensagem ? item.mensagem : '';

        if (typeof App.showToast === 'function') {
            App.showToast("📂 Mensagem carregada! Pode enviar ou ajustar o texto.", "info");
        }
    },

    salvarApenasModeloAvisoWS: async () => {
        const elTitulo = document.getElementById('ws-aviso-titulo');
        const elMsg = document.getElementById('ws-aviso-mensagem');
        const titulo = elTitulo && elTitulo.value ? elTitulo.value.trim() : '';
        const mensagem = elMsg && elMsg.value ? elMsg.value.trim() : '';

        if (!titulo || !mensagem) {
            return App.showToast("Preencha o título e a mensagem antes de guardar na lista.", "warning");
        }

        try {
            const res = await App.api('/push/avisos-salvos', 'POST', { titulo, mensagem });
            if (res && res.success) {
                App.showToast(res.message ? res.message : "💾 Mensagem guardada na lista!", "success");
                await App.carregarMensagensSalvasWS();
            } else {
                // Fallback local caso o servidor ainda não tenha sido reiniciado
                const novo = { id: 'local_' + Date.now(), titulo, mensagem, dataCriacao: new Date().toISOString() };
                App.mensagensSalvasWorkspace.unshift(novo);
                localStorage.setItem(App.getChaveLocalAvisosSalvos(), JSON.stringify(App.mensagensSalvasWorkspace));
                App.renderizarListaMensagensSalvasWS();
                App.showToast("💾 Mensagem guardada na lista!", "success");
            }
        } catch (e) {
            App.showToast("Erro ao guardar mensagem.", "error");
        }
    },

    excluirMensagemSalvaWS: async (id, idx) => {
        try {
            App.mensagensSalvasWorkspace.splice(idx, 1);
            localStorage.setItem(App.getChaveLocalAvisosSalvos(), JSON.stringify(App.mensagensSalvasWorkspace));
            App.renderizarListaMensagensSalvasWS();

            if (id && !String(id).startsWith('local_')) {
                await App.api(`/push/avisos-salvos/${id}`, 'DELETE', null, true);
            }
            if (typeof App.showToast === 'function') App.showToast("🗑️ Mensagem removida da lista.", "info");
        } catch (e) {}
    },

    // =========================================================
    // 🔔 4. MODAL DE ENVIO DE AVISO PARA ALUNOS NO WORKSPACE
    // =========================================================
    abrirModalAvisoWorkspace: (alvoUserId, alunoRefId, nomeDestino) => {
        let modal = document.getElementById('modal-aviso-ws');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-aviso-ws';
            modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.75); display:flex; justify-content:center; align-items:center; z-index:10001; backdrop-filter:blur(4px); padding:15px; box-sizing:border-box;';
            document.body.appendChild(modal);
        }

        const nomeBase = nomeDestino ? nomeDestino : 'Aluno';
        const primeiroNome = nomeBase.split(' ')[0];
        const primeiroNomeSeguro = App.escapeHTML(primeiroNome).replace(/'/g, "\\'");
        const nomeDestinoSeguro = App.escapeHTML(nomeBase).replace(/'/g, "\\'");

        modal.innerHTML = `
            <div style="background:#fff; padding:22px; border-radius:16px; max-width:500px; width:100%; max-height:90vh; overflow-y:auto; box-shadow:0 20px 50px rgba(0,0,0,0.3); animation: slideIn 0.25s ease; box-sizing:border-box;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <h3 style="margin:0; color:#1e293b; font-size:18px;">📲 Enviar Aviso para o Workspace</h3>
                    <button type="button" onclick="document.getElementById('modal-aviso-ws').style.display='none'" style="background:none; border:none; font-size:20px; color:#94a3b8; cursor:pointer;">✖</button>
                </div>
                <p style="font-size:13px; color:#64748b; margin:0 0 15px 0; text-align:left;">Destinatário: <strong style="color:#2563eb;">${App.escapeHTML(nomeBase)}</strong></p>

                <!-- MODELOS FIXOS RÁPIDOS -->
                <div style="margin-bottom:14px; text-align:left;">
                    <label style="font-weight:bold; font-size:11px; color:#64748b; text-transform:uppercase; display:block; margin-bottom:6px;">⚡ Modelos Rápidos (1 Clique):</label>
                    <div style="display:flex; gap:6px; flex-wrap:wrap;">
                        <button type="button" onclick="App.preencherModeloAvisoWS('aula', '${primeiroNomeSeguro}')" style="background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; padding:6px 10px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer;">📚 Lembrete de Aula</button>
                        <button type="button" onclick="App.preencherModeloAvisoWS('nota', '${primeiroNomeSeguro}')" style="background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; padding:6px 10px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer;">✅ Nota Lançada</button>
                        <button type="button" onclick="App.preencherModeloAvisoWS('evento', '${primeiroNomeSeguro}')" style="background:#fef3c7; color:#d97706; border:1px solid #fde68a; padding:6px 10px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer;">📅 Evento / Feriado</button>
                    </div>
                </div>

                <!-- 🗂️ GALERIA DE MENSAGENS SALVAS -->
                <div style="margin-bottom:15px; text-align:left; background:#f1f5f9; padding:10px; border-radius:10px; border:1px solid #e2e8f0;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <span style="font-weight:800; font-size:11px; color:#334155; text-transform:uppercase;">💾 Mensagens Salvas (<span id="ws-count-mensagens-salvas">0</span>)</span>
                        <button type="button" onclick="App.salvarApenasModeloAvisoWS()" style="background:#ffffff; color:#0f172a; border:1px solid #cbd5e1; padding:4px 9px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer;" title="Guardar o título e texto atuais na lista sem enviar agora">➕ Guardar Texto Atual</button>
                    </div>
                    <div id="ws-lista-mensagens-salvas" style="max-height:135px; overflow-y:auto; padding-right:2px;"></div>
                </div>

                <!-- CAMPOS DO AVISO -->
                <div style="margin-bottom:12px; text-align:left;">
                    <label style="font-weight:bold; font-size:12px; color:#334155; display:block; margin-bottom:4px;">Título da Notificação</label>
                    <input type="text" id="ws-aviso-titulo" placeholder="Ex: 📚 Lembrete da sua aula de hoje!" style="width:100%; padding:11px; border:1.5px solid #cbd5e1; border-radius:8px; font-size:14px; outline:none; box-sizing:border-box;">
                </div>

                <div style="margin-bottom:12px; text-align:left;">
                    <label style="font-weight:bold; font-size:12px; color:#334155; display:block; margin-bottom:4px;">Mensagem</label>
                    <textarea id="ws-aviso-mensagem" rows="3" placeholder="Escreva a mensagem que aparecerá no sininho e na tela do aluno no Workspace..." style="width:100%; padding:11px; border:1.5px solid #cbd5e1; border-radius:8px; font-size:14px; outline:none; resize:vertical; font-family:inherit; box-sizing:border-box;"></textarea>
                </div>

                <label style="display:flex; align-items:center; gap:8px; font-size:12px; color:#475569; margin-bottom:18px; cursor:pointer; text-align:left; font-weight:600;">
                    <input type="checkbox" id="ws-aviso-salvar-check" checked style="width:16px; height:16px; cursor:pointer;">
                    Guardar automaticamente esta mensagem nas "Mensagens Salvas" para usar outras vezes
                </label>

                <div style="display:flex; gap:10px;">
                    <button class="btn-cancel" style="flex:1; justify-content:center; padding:12px; border-radius:8px;" onclick="document.getElementById('modal-aviso-ws').style.display='none'">Cancelar</button>
                    <button class="btn-primary" id="ws-btn-disparar-aviso" style="flex:1.4; justify-content:center; padding:12px; border-radius:8px; background:#2563eb; border:none; font-weight:bold; cursor:pointer;" onclick="App.enviarAvisoWorkspace('${alvoUserId}', '${alunoRefId}', '${nomeDestinoSeguro}')">🚀 Enviar para o Workspace</button>
                </div>
            </div>
        `;
        modal.style.display = 'flex';
        App.carregarMensagensSalvasWS();
    },

    preencherModeloAvisoWS: (tipo, primeiroNome) => {
        const inputTitulo = document.getElementById('ws-aviso-titulo');
        const inputMsg = document.getElementById('ws-aviso-mensagem');
        if (!inputTitulo || !inputMsg) return;

        const saudacao = primeiroNome === 'Todos' ? 'Olá, turma!' : `Olá, ${primeiroNome}!`;

        if (tipo === 'aula') {
            inputTitulo.value = '📚 Lembrete de Aula Hoje!';
            inputMsg.value = `${saudacao} Passando para lembrar da nossa aula de hoje. Já preparou o seu material no Workspace? Até já!`;
        } else if (tipo === 'nota') {
            inputTitulo.value = '✅ Nova Avaliação Disponível!';
            inputMsg.value = `${saudacao} Acabámos de atualizar o seu desempenho académico. Aceda ao seu portal para conferir!`;
        } else if (tipo === 'evento') {
            inputTitulo.value = '📅 Aviso Importante na Agenda';
            inputMsg.value = `${saudacao} Temos uma atualização importante no calendário de aulas da escola. Confira no seu Workspace!`;
        }
    },

    enviarAvisoWorkspace: async (alvoUserId, alunoRefId, nomeDestino) => {
        const elTitulo = document.getElementById('ws-aviso-titulo');
        const elMsg = document.getElementById('ws-aviso-mensagem');
        const elSalvar = document.getElementById('ws-aviso-salvar-check');

        const titulo = elTitulo && elTitulo.value ? elTitulo.value.trim() : '';
        const mensagem = elMsg && elMsg.value ? elMsg.value.trim() : '';
        const salvarMensagem = elSalvar ? elSalvar.checked : true;

        if (!titulo || !mensagem) {
            return App.showToast("Preencha o título e a mensagem do aviso.", "warning");
        }

        const btn = document.getElementById('ws-btn-disparar-aviso');
        const txtOriginal = btn.innerHTML;
        btn.innerHTML = "A enviar... ⏳";
        btn.disabled = true;

        try {
            // Garante que conhecemos todos os alunos com acesso ativo ao Workspace
            const cache = await App.garantirCacheWorkspace();
            const nomesListaFrontend = [];

            if (alvoUserId === 'TODOS') {
                cache.usuarios.forEach(u => {
                    const nomePrincipal = u.nome ? u.nome.trim() : (u.login ? u.login.trim() : '');
                    if (nomePrincipal) nomesListaFrontend.push(nomePrincipal);
                });
            } else {
                const conta = cache.usuarios.find(u => String(u.id) === String(alvoUserId) ? true : String(u.alunoRefId) === String(alunoRefId));
                if (conta) {
                    const nomePrincipal = conta.nome ? conta.nome.trim() : (conta.login ? conta.login.trim() : '');
                    if (nomePrincipal) nomesListaFrontend.push(nomePrincipal);
                } else if (nomeDestino) {
                    nomesListaFrontend.push(nomeDestino.trim());
                }
            }

            const res = await App.api('/push/enviar-aviso-aluno', 'POST', {
                alvoUserId,
                alunoRefId,
                nomeDestino,
                nomesListaFrontend,
                titulo,
                mensagem,
                salvarMensagem
            });

            if (res && res.success) {
                App.showToast(res.message ? res.message : "✅ Aviso entregue no Workspace!", "success");
                document.getElementById('modal-aviso-ws').style.display = 'none';
            } else {
                App.showToast((res && res.error) ? res.error : "Não foi possível enviar o aviso.", "error");
            }
        } catch (e) {
            App.showToast("Erro de comunicação ao enviar o aviso.", "error");
        } finally {
            btn.innerHTML = txtOriginal;
            btn.disabled = false;
        }
    },

    abrirModalAcessoWorkspace: (alunoId, nomeAluno) => {
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
                if(typeof App.salvarEstadoNavegacao === 'function') App.salvarEstadoNavegacao('modal', null);
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
                    App.renderizarWorkspaceAcessos();
                } catch(e) { App.showToast("Erro ao revogar.", "error"); } 
                finally { document.body.style.cursor = 'default'; modal.style.opacity = '0'; setTimeout(() => modal.style.display='none', 300); }
            }
        );
    },

    // =========================================================
    // 📡 5. TELA DE MONITORAMENTO EM TEMPO REAL
    // =========================================================
    radarMonitoramentoInterval: null,

    renderizarWorkspaceMonitoramento: async (veioDoHistorico = false) => {
        if (!veioDoHistorico) window.history.pushState({ tela: 'workspace_monitoramento' }, '', '#workspace_monitoramento');
        if (typeof App.salvarEstadoNavegacao === 'function') App.salvarEstadoNavegacao('fundo', { tipo: 'tela', alvo: 'workspace_monitoramento' });

        App.setTitulo("Monitoramento Online");
        const div = document.getElementById('app-content');
        
        if (!document.getElementById('ws-pulse-css')) {
            const style = document.createElement('style');
            style.id = 'ws-pulse-css';
            style.innerHTML = `@keyframes pulseDot { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(39, 174, 96, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(39, 174, 96, 0); } }`;
            document.head.appendChild(style);
        }

        div.innerHTML = `
            <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <button class="btn-cancel" style="padding: 8px 15px; font-weight: bold;" onclick="App.renderizarWorkspaceAdmin()">⬅️ Voltar ao Hub</button>
                <button class="btn-primary" style="background: #2563eb; border: none; padding: 9px 16px; border-radius: 8px; font-weight: bold; font-size: 13px; cursor: pointer;" onclick="App.abrirModalAvisoWorkspace('TODOS', '', 'Todos os Alunos do Workspace')">
                    📢 Avisar Todos os Alunos
                </button>
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

        await App.atualizarDadosRadar();

        if (App.radarMonitoramentoInterval) clearInterval(App.radarMonitoramentoInterval);

        App.radarMonitoramentoInterval = setInterval(() => {
            const elTitulo = document.getElementById('titulo-pagina');
            const telaAtual = elTitulo ? elTitulo.innerText : '';
            if (telaAtual !== "Monitoramento Online") {
                clearInterval(App.radarMonitoramentoInterval);
                return;
            }
            App.atualizarDadosRadar(true); 
        }, 10000);
    },

    atualizarDadosRadar: async (silencioso = false) => {
        try {
            let escolaId = 'DEFAULT';
            if (App.usuario && App.usuario.escolaId) {
                escolaId = App.usuario.escolaId;
            } else {
                const rawCache = localStorage.getItem(App.getTenantKey('escola_perfil'));
                const escolaCache = rawCache ? JSON.parse(rawCache) : {};
                escolaId = escolaCache.id ? escolaCache.id : 'DEFAULT';
            }

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

            const alunosAtivos = alunos.filter(a => !a.status ? true : a.status === 'Ativo');
            const alunosAtivosIds = alunosAtivos.map(a => a.id);

            const contasAtivas = usuarios.filter(u => 
                (u.tipo === 'Aluno' ? true : Boolean(u.alunoRefId)) && alunosAtivosIds.includes(u.alunoRefId)
            );

            App.workspaceCache = { alunos: alunosAtivos, usuarios: contasAtivas };

            if (contasAtivas.length === 0) {
                container.innerHTML = '<p style="text-align:center; padding: 40px; color:#7f8c8d; font-size: 14px;">Nenhum aluno ativo possui acesso ao Workspace no momento.</p>';
                return;
            }

            const listaMonitoramento = contasAtivas.map(conta => {
                const alunoFound = alunosAtivos.find(a => a.id === conta.alunoRefId);
                const alunoFicha = alunoFound ? alunoFound : {};
                
                const statusFound = radarDados.find(r => 
                    (r.id && String(r.id) === String(conta.id)) ? true :
                    (r.usuarioId && String(r.usuarioId) === String(conta.id)) ? true :
                    (r.alunoRefId && String(r.alunoRefId) === String(alunoFicha.id)) ? true :
                    (r.login && conta.login && r.login.toLowerCase() === conta.login.toLowerCase()) ? true :
                    Boolean(r.nome && alunoFicha.nome && r.nome.trim().toLowerCase() === alunoFicha.nome.trim().toLowerCase())
                );
                const statusRadar = statusFound ? statusFound : {};
                
                return {
                    contaId: conta.id,
                    alunoRefId: conta.alunoRefId,
                    nome: conta.nome ? conta.nome : (alunoFicha.nome ? alunoFicha.nome : conta.login),
                    login: conta.login,
                    avatar: conta.avatar ? conta.avatar : null,
                    isOnline: statusRadar.isOnline === true ? true : String(statusRadar.isOnline) === 'true',
                    ultimoAcesso: statusRadar.ultimoAcesso ? statusRadar.ultimoAcesso : null
                };
            });

            listaMonitoramento.sort((a, b) => {
                if (b.isOnline === a.isOnline) return a.nome.localeCompare(b.nome);
                return b.isOnline ? 1 : -1;
            });

            let html = '<div class="table-responsive-wrapper"><table style="width:100%; border-collapse:collapse; text-align:left;">';
            html += '<thead><tr style="background: #fff; border-bottom: 2px solid #eee; color:#64748b; font-size: 13px; text-transform: uppercase;">';
            html += '<th style="padding:15px 20px;">Identificação do Aluno</th>';
            html += '<th style="padding:15px 20px; text-align:center;">Status Atual</th>';
            html += '<th style="padding:15px 20px; text-align:right;">Última Interação / Ação</th>';
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

                let avatarHtml = '';
                if (aluno.avatar) {
                    avatarHtml = `<img src="${aluno.avatar}" style="width:35px; height:35px; min-width:35px; border-radius:50%; object-fit:cover; border: 2px solid #e2e8f0; cursor: zoom-in; transition: 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" onclick="App.verFotoRadar('${aluno.avatar}', '${App.escapeHTML(aluno.nome)}')">`;
                } else {
                    const inicial = App.escapeHTML(aluno.nome).charAt(0).toUpperCase();
                    avatarHtml = `<div style="width:35px; height:35px; min-width:35px; background:#3498db; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:bold; border: 2px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">${inicial}</div>`;
                }

                const nomeSeguro = App.escapeHTML(aluno.nome).replace(/'/g, "\\'");

                html += `
                    <tr style="border-bottom:1px solid #f0f2f5; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                        <td style="padding:15px 20px; font-weight:bold; color:#1e293b; font-size: 14px;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                ${avatarHtml}
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
                            <div style="display:flex; align-items:center; justify-content:flex-end; gap:10px; flex-wrap:wrap;">
                                <span>${dataAcesso}</span>
                                <button onclick="App.abrirModalAvisoWorkspace('${aluno.contaId}', '${aluno.alunoRefId}', '${nomeSeguro}')" style="background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; padding:5px 10px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer;">🔔 Avisar</button>
                            </div>
                        </td>
                    </tr>
                `;
            });

            html += '</tbody></table></div>';
            container.innerHTML = html;

        } catch (e) {}
    },
       
    // =========================================================
    // 📸 6. VISUALIZADOR DE FOTOS DO RADAR (ZOOM DA IMAGEM)
    // =========================================================
    verFotoRadar: (url, nome) => {
        const id = 'admin-foto-viewer';
        let viewer = document.getElementById(id);
        if (viewer) viewer.remove();

        viewer = document.createElement('div');
        viewer.id = id;
        viewer.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 9999999; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s ease; backdrop-filter: blur(5px);";

        viewer.innerHTML = `
            <div style="position: absolute; top: 0; left: 0; width: 100%; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent); box-sizing: border-box;">
                <span style="color: white; font-weight: 500; font-size: 16px;">Foto de Perfil: ${App.escapeHTML(nome)}</span>
                <button onclick="document.getElementById('${id}').style.opacity='0'; setTimeout(()=>document.getElementById('${id}').remove(), 200)" style="background: transparent; border: none; color: white; font-size: 35px; cursor: pointer; padding: 0; line-height: 1;">&times;</button>
            </div>
            <img src="${url}" style="max-width: 90vw; max-height: 80vh; object-fit: contain; box-shadow: 0 5px 25px rgba(0,0,0,0.5); border-radius: 8px; transform: scale(0.9); transition: transform 0.2s ease;" id="admin-viewer-img">
        `;

        document.body.appendChild(viewer);
        
        requestAnimationFrame(() => {
            viewer.style.opacity = '1';
            document.getElementById('admin-viewer-img').style.transform = 'scale(1)';
        });
    }

});