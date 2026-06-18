// js/modulos/workspace_admin.js
window.App = window.App || {};
const App = window.App;

Object.assign(App, {
    renderizarWorkspaceAdmin: async () => {
        App.setTitulo("Gestão do Workspace");
        const div = document.getElementById('app-content');
        div.innerHTML = '<p style="text-align:center; padding:40px; color:#666;">A carregar alunos e acessos... ⏳</p>';

        try {
            const [alunos, usuarios] = await Promise.all([ App.api('/alunos'), App.api('/usuarios') ]);
            const alunosAtivos = alunos.filter(a => !a.status || a.status === 'Ativo');
            
            // Filtra utilizadores que são alunos
            const usuariosAlunos = usuarios.filter(u => u.tipo === 'Aluno' || u.alunoRefId);

            let html = `
                <div class="card" style="animation: fadeIn 0.3s ease;">
                    <div style="margin-bottom:20px;">
                        <h3 style="margin:0; color:#2c3e50;">Acessos ao Portal do Aluno</h3>
                        <p style="font-size:13px; color:#7f8c8d; margin:5px 0 0 0;">Crie e gira as credenciais para os alunos acederem à plataforma de atividades (Workspace).</p>
                    </div>
                    
                    <div class="table-responsive-wrapper">
                        <table style="width:100%; text-align:left; border-collapse:collapse;">
                            <thead>
                                <tr style="border-bottom:2px solid #eee;">
                                    <th style="padding:12px 10px; color:#2c3e50;">Nome do Aluno</th>
                                    <th style="padding:12px 10px; color:#2c3e50;">Login no Workspace</th>
                                    <th style="padding:12px 10px; text-align:right; color:#2c3e50;">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
            `;

            alunosAtivos.forEach(aluno => {
                const conta = usuariosAlunos.find(u => u.alunoRefId === aluno.id);
                const statusHtml = conta 
                    ? `<span style="background:#eafaf1; color:#27ae60; padding:4px 8px; border-radius:6px; font-size:12px; font-weight:bold; border:1px solid #2ecc71;">✅ ${App.escapeHTML(conta.login)}</span>` 
                    : `<span style="background:#fdf2f2; color:#e74c3c; padding:4px 8px; border-radius:6px; font-size:12px; font-weight:bold; border:1px solid #e74c3c;">❌ Sem Acesso</span>`;
                
                const btnHtml = conta
                    ? `<button class="btn-cancel" style="padding:6px 12px; font-size:12px; width:auto;" onclick="App.excluirAcessoWorkspace('${conta.id}')">Revogar Acesso</button>`
                    : `<button class="btn-primary" style="padding:6px 12px; font-size:12px; width:auto;" onclick="App.abrirModalAcessoWorkspace('${aluno.id}', '${App.escapeHTML(aluno.nome)}')">Gerar Acesso</button>`;

                html += `
                    <tr style="border-bottom:1px solid #f9f9f9;">
                        <td style="padding:12px 10px; font-size:14px; font-weight:500;">${App.escapeHTML(aluno.nome)}</td>
                        <td style="padding:12px 10px;">${statusHtml}</td>
                        <td style="padding:12px 10px; text-align:right;">${btnHtml}</td>
                    </tr>
                `;
            });

            html += `</tbody></table></div></div>`;
            div.innerHTML = html;

        } catch (e) {
            div.innerHTML = '<p style="color:#e74c3c; text-align:center; padding:40px;">Erro ao carregar a lista de alunos.</p>';
        }
    },

    abrirModalAcessoWorkspace: (alunoId, nomeAluno) => {
        let modal = document.getElementById('modal-acesso-ws');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-acesso-ws';
            modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; justify-content:center; align-items:center; z-index:9999;';
            document.body.appendChild(modal);
        }
        
        // Sugestão de login automático (ex: maria123)
        const partes = nomeAluno.split(' ');
        const sugestao = (partes[0] + (partes.length > 1 ? partes[partes.length-1] : '')).toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(100 + Math.random() * 900);

        modal.innerHTML = `
            <div style="background:#fff; padding:30px; border-radius:12px; max-width:400px; width:90%; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
                <h3 style="margin-top:0; color:#2c3e50; text-align:center;">🎓 Acesso ao Workspace</h3>
                <p style="font-size:13px; color:#666; text-align:center; margin-bottom:20px;">Crie as credenciais para:<br><strong style="color:#3498db; font-size:15px;">${nomeAluno}</strong></p>
                
                <div class="input-group" style="margin-bottom:15px;">
                    <label>Login de Acesso</label>
                    <input type="text" id="ws-input-login" value="${sugestao}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:6px;">
                </div>
                
                <div class="input-group" style="margin-bottom:20px;">
                    <label>Senha Provisória</label>
                    <input type="text" id="ws-input-senha" value="123456" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:6px;">
                    <small style="color:#999; font-size:11px;">O aluno poderá alterar a senha depois.</small>
                </div>

                <div style="display:flex; gap:10px;">
                    <button class="btn-cancel" style="flex:1; justify-content:center;" onclick="document.getElementById('modal-acesso-ws').style.display='none'">Cancelar</button>
                    <button class="btn-primary" id="ws-btn-salvar-acesso" style="flex:1; justify-content:center;" onclick="App.salvarAcessoWorkspace('${alunoId}', '${nomeAluno}')">💾 Guardar</button>
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
            // A mágica: Criamos um utilizador do tipo "Aluno", vinculado ao ID do cadastro
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
        App.abrirModalConfirmacao("Revogar Acesso?", "O aluno perderá o acesso ao Workspace. Esta ação não apaga os dados escolares do aluno, apenas o login.", async (modal) => {
                document.body.style.cursor = 'wait';
                try {
                    await App.api(`/usuarios/${usuarioId}`, 'DELETE');
                    App.showToast("Acesso revogado.", "success");
                    App.renderizarWorkspaceAdmin();
                } catch(e) { App.showToast("Erro ao revogar.", "error"); } 
                finally { document.body.style.cursor = 'default'; modal.style.display = 'none'; }
            }
        );
    }
});