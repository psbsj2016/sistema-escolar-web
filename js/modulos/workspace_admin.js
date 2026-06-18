// js/modulos/workspace_admin.js
window.App = window.App || {};
const App = window.App;

Object.assign(App, {
    renderizarWorkspaceAdmin: async () => {
        App.setTitulo("Gestão do Workspace");
        const div = document.getElementById('app-content');
        div.innerHTML = '<p style="text-align:center; padding:40px; color:#666;">A carregar lista de alunos e acessos... ⏳</p>';

        try {
            // Vai buscar todos os alunos e utilizadores
            const alunosRes = await App.api('/alunos');
            const usuariosRes = await App.api('/usuarios');
            
            // 🛡️ Proteção extra: Garante que são listas mesmo se não houver cadastros
            const alunos = Array.isArray(alunosRes) ? alunosRes : [];
            const usuarios = Array.isArray(usuariosRes) ? usuariosRes : [];

            const alunosAtivos = alunos.filter(a => !a.status || a.status === 'Ativo');
            const usuariosAlunos = usuarios.filter(u => u.tipo === 'Aluno' || u.alunoRefId);

            // Guarda em memória para a pesquisa rápida funcionar
            App.workspaceCache = { alunos: alunosAtivos, usuarios: usuariosAlunos };

            const barraBusca = `
                <div class="toolbar" style="max-width: 800px; margin: 0 auto 20px auto; display: flex; gap: 15px;">
                    <div class="search-wrapper" style="flex: 1; position: relative;">
                        <span style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #aaa;">🔍</span>
                        <input type="text" id="ws-busca-aluno" style="width: 100%; padding: 14px 14px 14px 45px; border-radius: 8px; border: 2px solid #eee; outline:none;" placeholder="Pesquisar aluno pelo nome..." oninput="App.filtrarWorkspaceAdmin()">
                    </div>
                </div>`;

            div.innerHTML = `
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

        } catch (e) {
            console.error("Erro na gestão:", e);
            div.innerHTML = '<p style="color:#e74c3c; text-align:center; padding:40px;">Erro ao carregar a lista de alunos.</p>';
        }
    },

    filtrarWorkspaceAdmin: () => {
        const termo = (document.getElementById('ws-busca-aluno')?.value || '').toLowerCase();
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
            
            // Corrige problemas com aspas nos nomes (Ex: D'Artagnan)
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
                    <button class="btn-cancel" style="flex:1; justify-content:center; padding:12px; border-radius:8px;" onclick="document.getElementById('modal-acesso-ws').style.display='none'">Cancelar</button>
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
                App.renderizarWorkspaceAdmin(); 
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
                    App.renderizarWorkspaceAdmin();
                } catch(e) { App.showToast("Erro ao revogar.", "error"); } 
                finally { document.body.style.cursor = 'default'; modal.style.opacity = '0'; setTimeout(() => modal.style.display='none', 300); }
            }
        );
    }
});