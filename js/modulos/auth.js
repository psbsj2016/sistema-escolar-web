import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

window.App = window.App || {};
const App = window.App;
window.App = App;

// =========================================================
// MÓDULO AUTH - LOGIN, LOGOUT, SENHA, BIOMETRIA E BLOQUEIO
// =========================================================

Object.assign(App, {

    mostrarTelaBloqueioLogin: (escola) => {
        document.documentElement.removeAttribute('style');
        document.getElementById('tela-sistema').style.display = 'none';

        const telaLogin = document.getElementById('tela-login');
        if(telaLogin) telaLogin.style.display = telaLogin.classList.contains('login-wrapper') ? 'flex' : 'block';

        const loginForms = telaLogin.querySelectorAll('.login-box, .box-login');
        loginForms.forEach(form => {
            if (form.id !== 'box-bloqueio-conta') form.style.display = 'none';
        });

        let blockBox = document.getElementById('box-bloqueio-conta');
        if (!blockBox) {
            blockBox = document.createElement('div');
            blockBox.id = 'box-bloqueio-conta';
            blockBox.className = loginForms.length > 0 ? loginForms[0].className : 'login-box';
            blockBox.style.maxWidth = '400px';
            blockBox.style.margin = '0 auto';
            blockBox.style.background = '#fff';
            blockBox.style.padding = '30px';
            blockBox.style.borderRadius = '12px';
            blockBox.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
            telaLogin.appendChild(blockBox);
        }

        blockBox.style.display = 'block';
        blockBox.innerHTML = `
            <div style="text-align:center;">
                <span style="font-size: 45px; display:block; margin-bottom: 10px;">🔒</span>
                <h2 style="color: #e74c3c; margin-top:0; font-size:22px;">Acesso Bloqueado</h2>
                <p style="color: #666; font-size: 13px; margin-bottom: 20px;">O seu acesso foi bloqueado por falta de pagamento ou o seu período de teste expirou.</p>

                <div style="background: #fdf2f2; padding: 20px; border-radius: 8px; border: 1px solid #f5b7b1; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 10px 0; color: #c0392b; font-size: 15px;">Já efetuou o pagamento?</h4>
                    <p style="font-size:12px; color:#c0392b; margin-bottom: 15px;">Insira a sua Chave de Ativação (PIN) para liberar o sistema imediatamente.</p>

                    <input type="text" id="input-pin-login" placeholder="Digite o PIN recebido" style="width: 100%; padding: 12px; border-radius: 6px; border: 1px solid #ccc; text-align: center; font-weight: bold; letter-spacing: 2px; margin-bottom: 15px; font-size: 16px; box-sizing:border-box;">

                    <button class="btn-primary" style="width: 100%; justify-content: center; background: #27ae60; border:none; padding:12px; border-radius:6px; color:white; font-weight:bold; cursor:pointer;" onclick="App.ativarPinLogin(event)">🔓 Validar e Desbloquear</button>
                </div>

                <button class="btn-cancel" style="width: 100%; justify-content: center; background:transparent; border:1px solid #ccc; padding:10px; border-radius:6px; cursor:pointer;" onclick="App.sairDaTelaDeBloqueio()">Sair e Voltar ao Login</button>
            </div>
        `;
    },

    sairDaTelaDeBloqueio: () => {
        App.logout();
    },

    ativarPinLogin: async (event) => {
        if (event) event.preventDefault();
        const inputElement = document.getElementById('input-pin-login');
        if (!inputElement) return;

        const pin = inputElement.value.trim().toUpperCase();
        if(!pin) return App.showToast("Por favor, insira o PIN recebido no e-mail.", "warning");

        const btn = event.target;
        const txt = btn.innerText;
        if(btn) { btn.innerText = "A validar... ⏳"; btn.disabled = true; }

        try {
            const res = await App.api('/escola/validar-pin', 'POST', { pin: pin });
            let novoPlano = res && res.success ? res.plano : null;

            if (!novoPlano) {
                if (pin.includes('PRE')) novoPlano = 'Premium';
                else if (pin.includes('ESS')) novoPlano = 'Essencial';
                else if (pin.includes('PRO')) novoPlano = 'Profissional';
                else {
                    App.showToast(res.error || "PIN inválido ou formato incorreto.", "error");
                    if(btn) { btn.innerText = txt; btn.disabled = false; }
                    return;
                }
            }

            const escolaAtual = await App.api('/escola') || {};
            const novaDataExp = new Date();
            novaDataExp.setDate(novaDataExp.getDate() + 30);
            
            await App.api('/escola', 'PUT', { 
                ...escolaAtual, 
                plano: novoPlano, 
                pinUsado: pin, 
                dataExpiracao: novaDataExp.toISOString() 
            });

            localStorage.setItem(App.getTenantKey('escola_plano'), novoPlano);
            let perfilCache = JSON.parse(localStorage.getItem(App.getTenantKey('escola_perfil'))) || {};
            perfilCache.plano = novoPlano;
            perfilCache.dataExpiracao = novaDataExp.toISOString();
            localStorage.setItem(App.getTenantKey('escola_perfil'), JSON.stringify(perfilCache));

            if(typeof App.atualizarUIHeader === 'function') App.atualizarUIHeader(perfilCache);
            App.showToast(`🎉 PIN validado! Sistema desbloqueado por mais 30 dias.`, "success");
            
            const blockBox = document.getElementById('box-bloqueio-conta');
            if(blockBox) blockBox.style.display = 'none';
            
            App.entrarNoSistema();
        } catch(e) {
            App.showToast("Erro ao comunicar com a base de dados.", "error");
        } finally {
            if(btn) { btn.innerText = txt; btn.disabled = false; }
        }
    },

    init: async () => {
        localStorage.removeItem('escola_tema'); 
        localStorage.removeItem('escola_atalhos'); 
        localStorage.removeItem('escola_perfil');
          
        const resetToken = new URLSearchParams(window.location.search).get('reset');
        if (resetToken) {
            document.documentElement.removeAttribute('style');
            document.getElementById('tela-login').style.display = 'flex';
            document.getElementById('tela-sistema').style.display = 'none';
            setTimeout(() => { App.abrirModalNovaSenha(resetToken); }, 300);
            return;
        } 

        const salvo = localStorage.getItem('usuario_logado'); 
        const bioId = localStorage.getItem('escola_bio_id');

        // 🚀 MUDANÇA 1: Disparo Automático Instantâneo ao Abrir o App
        if (bioId && window.PublicKeyCredential) {
            document.getElementById('tela-login').style.display = 'none'; 
            document.getElementById('tela-sistema').style.display = 'none';
            
            // Removida a tela intermédia de Touch. Dispara direto o leitor!
            setTimeout(() => { App.entrarComBiometria(true); }, 200);
            return; 
        }

        if (salvo) { 
            App.usuario = JSON.parse(salvo); 
            if (typeof App.aplicarTemaSalvo === 'function') App.aplicarTemaSalvo();

            const keyAtalhos = App.getTenantKey('escola_atalhos');
            if (!localStorage.getItem(keyAtalhos)) { 
                localStorage.setItem(keyAtalhos, JSON.stringify(['novo_aluno','fin_carne','ped_chamada','ped_notas','ped_plan','ped_bol'])); 
            }

            document.getElementById('tela-login')?.style.setProperty('display', 'none');
            document.getElementById('tela-sistema')?.style.setProperty('display', 'flex');
            
            const el = document.getElementById('user-name');
            if(el && App.usuario) el.innerText = App.usuario.nome || App.usuario.login;
            
            if (typeof App.aplicarPermissoesDeUsuario === 'function') App.aplicarPermissoesDeUsuario(); 
            if (typeof App.setupMobileMenu === 'function') App.setupMobileMenu();

            const hashSalvo = window.location.hash.replace('#', '');
            if (hashSalvo && hashSalvo !== 'login') {
                setTimeout(() => { if(typeof App.renderizarTela === 'function') App.renderizarTela(hashSalvo, true); }, 10);
            } else {
                if(typeof App.renderizarInicio === 'function') App.renderizarInicio();
            }

            setTimeout(async () => {
                let escola = await App.api('/escola', 'GET', null, true); 
                if (!escola || escola.error) {
                    if (escola?.error === 'Sessão não encontrada.' || escola?.error === 'Sessão expirada.') {
                        App.showToast("Sessão expirada por segurança. Faça login novamente.", "warning");
                        await App.logout();
                        return;
                    }
                } else {
                    localStorage.setItem(App.getTenantKey('escola_plano'), escola.plano);
                    localStorage.setItem(App.getTenantKey('escola_perfil'), JSON.stringify(escola));
                    if (typeof App.atualizarUIHeader === 'function') App.atualizarUIHeader(escola);
                    if (typeof App.verificarBloqueioGeral === 'function' && App.verificarBloqueioGeral(escola)) {
                        document.documentElement.removeAttribute('style'); 
                        App.mostrarTelaBloqueioLogin(escola);
                    }
                }
            }, 1000); 

        } else { 
            document.documentElement.removeAttribute('style'); 
            document.getElementById('tela-login').style.display = 'flex'; 
            document.getElementById('tela-sistema').style.display = 'none'; 
        }
        
        const dataEl = document.getElementById('data-hoje'); 
        if(dataEl) dataEl.innerText = new Date().toLocaleDateString('pt-BR');
        
        const passInput = document.getElementById('login-pass'); 
        if(passInput) { 
            passInput.addEventListener('keypress', function (e) { 
                if (e.key === 'Enter') { App.fazerLogin(); } 
            }); 
        }
        
        if (!App.motorTempoRealLigado) {
            const checarSistema = () => {
                const telaSistema = document.getElementById('tela-sistema');
                if (App.usuario && telaSistema && telaSistema.style.display !== 'none' && document.visibilityState === 'visible') {
                    if (typeof App.verificarNovidadesSilenciosamente === 'function') App.verificarNovidadesSilenciosamente();
                    if (typeof App.carregarDadosEscola === 'function') App.carregarDadosEscola(true);
                }
            };
            setTimeout(checarSistema, 2000);
            setInterval(checarSistema, 10000); 
            App.motorTempoRealLigado = true;
        }
    },

    fazerLogin: async () => {
        const login = document.getElementById('login-user').value.trim();
        const pass = document.getElementById('login-pass').value.trim();
        if(!login || !pass) return App.showToast("Preencha utilizador e senha", "warning");
        
        const btn = document.querySelector('#tela-login button[type="submit"]');
        const txt = btn.innerText; btn.innerText = "Acessando... ⏳"; btn.disabled = true;
        
        try {
            const deviceId = App.getDeviceId ? App.getDeviceId() : 'dev_web';
            const res = await App.api('/auth/login', 'POST', { login: login, senha: pass, deviceId: deviceId });
            
            if(res && res.success) {
                App.usuario = res.usuario;
                localStorage.setItem('usuario_logado', JSON.stringify(res.usuario));
                
                if (typeof gtag === 'function') gtag('event', 'login', { method: 'Sistema PTT' });
                
                if (typeof App.aplicarTemaSalvo === 'function') App.aplicarTemaSalvo();
                const keyAtalhos = App.getTenantKey('escola_atalhos');
                if (!localStorage.getItem(keyAtalhos)) { 
                    localStorage.setItem(keyAtalhos, JSON.stringify(['novo_aluno','fin_carne','ped_chamada','ped_notas','ped_plan','ped_bol'])); 
                }

                let escola = await App.api('/escola');

                if (!escola || escola.error) {
                    if (escola?.error === 'Sessão não encontrada.' || escola?.error === 'Sessão expirada.') {
                        await App.logout();
                        return;
                    }
                    escola = JSON.parse(localStorage.getItem(App.getTenantKey('escola_perfil'))) || {};
                }

                if (typeof App.verificarBloqueioGeral === 'function' && App.verificarBloqueioGeral(escola)) {
                    App.mostrarTelaBloqueioLogin(escola);
                } else {
                    App.entrarNoSistema();
                    if (Notification.permission === 'granted') {
                        App.configurarNotificacoesPush();
                    }
                    const hashSalvo = window.location.hash.replace('#', '');
                    if (hashSalvo && hashSalvo !== 'login') {
                        setTimeout(() => { if(typeof App.renderizarTela === 'function') App.renderizarTela(hashSalvo, true); }, 100);
                    }
                    App.showToast('Bem-vindo ao sistema!', 'success');
                }
            } else { 
                App.showToast(res.error || "Login ou senha incorretos", "error"); 
            }
        } catch(e) { 
            App.showToast("Erro ao conectar no servidor", "error"); 
        } finally { 
            btn.innerText = txt; btn.disabled = false; 
        }
    },

    entrarNoSistema: async () => {
        document.getElementById('tela-login')?.style.setProperty('display', 'none');
        document.getElementById('tela-sistema')?.style.setProperty('display', 'flex');
        
        const el = document.getElementById('user-name');
        if(el && App.usuario) el.innerText = App.usuario.nome || App.usuario.login;
        
        if (typeof App.aplicarPermissoesDeUsuario === 'function') App.aplicarPermissoesDeUsuario(); 
        if (typeof App.setupMobileMenu === 'function') App.setupMobileMenu();
        
        if (typeof App.carregarDadosEscola === 'function') await App.carregarDadosEscola(true);
        
        const telaSistema = document.getElementById('tela-sistema');
        if (telaSistema && telaSistema.style.display !== 'none' && !window.location.hash) {
            if(typeof App.renderizarInicio === 'function') App.renderizarInicio();
        }
    },

    logout: async () => {
        if (App.radarAtivo) clearInterval(App.radarAtivo); 
        
        try {
            if (typeof App.api === 'function') {
                await App.api('/auth/logout', 'POST');
            } else {
                await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            }
        } catch(e) { console.warn("Logout silencioso."); }

        localStorage.clear();
        sessionStorage.clear();
        App.usuario = null;
        App.listaCache = [];

        window.location.href = window.location.pathname; 
    },

    toggleSenhaLogin: () => {
        const input = document.getElementById('login-pass');
        if (input) input.type = input.type === 'password' ? 'text' : 'password';
    },

    abrirModalRecuperacao: (event) => {
        if(event) event.preventDefault();
        let modal = document.getElementById('modal-recuperacao-senha');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-recuperacao-senha';
            modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; justify-content:center; align-items:center; z-index:9999;';
            modal.innerHTML = `
                <div style="background:#fff; padding:30px; border-radius:12px; max-width:400px; width:90%; text-align:center; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
                    <span style="font-size: 40px; display:block; margin-bottom:10px;">🔐</span>
                    <h3 style="margin-top:0; color:#2c3e50;">Recuperar Senha</h3>
                    <p style="font-size:13px; color:#666; margin-bottom:20px;">Insira o e-mail registado na sua conta. Enviaremos um link seguro.</p>
                    <input type="email" id="recuperar-email-input" placeholder="O seu e-mail de acesso" style="width:100%; padding:12px; border-radius:6px; border:1px solid #ccc; margin-bottom:15px; text-align:center;">
                    <button class="btn-primary" onclick="App.enviarRecuperacaoSenha()" style="width:100%; justify-content:center; padding:12px; margin-bottom:10px; border:none; border-radius:6px;">✉️ Enviar Link</button>
                    <button class="btn-cancel" onclick="document.getElementById('modal-recuperacao-senha').style.display='none'" style="width:100%; justify-content:center; padding:10px; background:transparent; border:1px solid #ccc; border-radius:6px; cursor:pointer;">Cancelar</button>
                </div>
            `;
            document.body.appendChild(modal);
        }
        document.getElementById('recuperar-email-input').value = '';
        modal.style.display = 'flex';
    },

    enviarRecuperacaoSenha: async () => {
        const email = document.getElementById('recuperar-email-input')?.value.trim();
        if (!email) return App.showToast("Informe o e-mail de acesso.", "warning");
        
        const btn = document.querySelector('#modal-recuperacao-senha .btn-primary');
        const txt = btn.innerText; btn.innerText = "Enviando... ⏳"; btn.disabled = true;
        
        try {
            const res = await App.api('/auth/recuperar-senha', 'POST', { email });
            if (res && res.success) {
                App.showToast(res.message || "Link enviado com sucesso.", "success");
                document.getElementById('modal-recuperacao-senha').style.display = 'none';
            } else { App.showToast(res.error || "Erro ao solicitar.", "error"); }
        } catch (e) { App.showToast("Erro de comunicação.", "error"); } 
        finally { btn.innerText = txt; btn.disabled = false; }
    },

    abrirModalNovaSenha: (token) => {
        let modal = document.getElementById('modal-nova-senha');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-nova-senha';
            modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); display:flex; justify-content:center; align-items:center; z-index:10000;';
            modal.innerHTML = `
                <div style="background:#fff; padding:30px; border-radius:12px; max-width:420px; width:90%; text-align:center; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
                    <span style="font-size: 40px; display:block; margin-bottom:10px;">🔑</span>
                    <h3 style="margin-top:0; color:#2c3e50;">Criar Nova Senha</h3>
                    <p style="font-size:13px; color:#666; margin-bottom:20px;">Digite a sua nova senha de acesso.</p>
                    <input type="password" id="nova-senha-reset" placeholder="Nova senha" style="width:100%; padding:12px; border-radius:6px; border:1px solid #ccc; margin-bottom:12px; text-align:center;">
                    <input type="password" id="confirma-senha-reset" placeholder="Confirmar nova senha" style="width:100%; padding:12px; border-radius:6px; border:1px solid #ccc; margin-bottom:15px; text-align:center;">
                    <button class="btn-primary" onclick="App.confirmarNovaSenhaReset()" style="width:100%; justify-content:center; padding:12px; margin-bottom:10px; border:none; border-radius:6px;">✅ Salvar Senha</button>
                    <button class="btn-cancel" onclick="document.getElementById('modal-nova-senha').style.display='none'" style="width:100%; justify-content:center; padding:10px; background:transparent; border:1px solid #ccc; border-radius:6px; cursor:pointer;">Cancelar</button>
                </div>
            `;
            document.body.appendChild(modal);
        }
        App.tokenResetSenha = token;
        modal.style.display = 'flex';
    },

    confirmarNovaSenhaReset: async () => {
        const novaSenha = document.getElementById('nova-senha-reset')?.value || '';
        const confirmaSenha = document.getElementById('confirma-senha-reset')?.value || '';
        if (novaSenha.length < 6) return App.showToast("Mínimo de 6 caracteres.", "warning");
        if (novaSenha !== confirmaSenha) return App.showToast("As senhas não conferem.", "warning");
        const btn = document.querySelector('#modal-nova-senha .btn-primary');
        const txt = btn.innerText; btn.innerText = "Salvando... ⏳"; btn.disabled = true;
        try {
            const data = await App.api('/auth/redefinir-senha', 'POST', { token: App.tokenResetSenha, novaSenha });
            if (data && data.success) {
                App.showToast("Senha redefinida! Faça login agora.", "success");
                document.getElementById('modal-nova-senha').style.display = 'none';
                App.tokenResetSenha = null;
                const novaUrl = window.location.origin + window.location.pathname;
                window.history.replaceState({}, document.title, novaUrl);
            } else { App.showToast(data.error || "Erro ao redefinir.", "error"); }
        } catch (e) { App.showToast("Erro de comunicação.", "error"); } 
        finally { btn.innerText = txt; btn.disabled = false; }
    },

    bufferToBase64: function(buf) {
        var bytes = new Uint8Array(buf);
        var binary = '';
        for (var i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        return btoa(binary);
    },

    base64ToBuffer: function(b64) {
        var binary_string = atob(b64);
        var len = binary_string.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) bytes[i] = binary_string.charCodeAt(i);
        return bytes;
    },

    renderizarMinhaConta: async () => {
        if (typeof App.setTitulo === 'function') App.setTitulo("Gestão de Usuários"); 
        const div = document.getElementById('app-content'); 
        App.idEdicaoUsuario = null; 
        const meuLogin = App.usuario ? App.usuario.login : ''; 
        const meuEmail = (App.usuario && App.usuario.email) ? App.usuario.email : '';
        
        const campoSenha = (id, label) => `<div class="input-group" style="position:relative;"><label>${label}</label><input type="password" id="${id}" style="width:100%; padding-right:40px;"><span onclick="App.toggleSenhaVisibilidade('${id}')" style="position:absolute; right:12px; top:32px; cursor:pointer; font-size:16px; opacity:0.6; user-select:none;" title="Mostrar/Ocultar Senha">👁️</span></div>`;

        try { 
            const usuariosResponse = await App.api('/usuarios'); 
            const todosUsers = Array.isArray(usuariosResponse) ? usuariosResponse : []; 
            const listaUsers = todosUsers.filter(u => u.id === App.usuario.id || String(u.donoId) === String(App.usuario.id));

            const bioId = localStorage.getItem('escola_bio_id');
            const bioStatusHtml = bioId 
                ? `<div style="background: #eafaf1; border: 1px solid #27ae60; color: #27ae60; padding: 10px; border-radius: 8px; margin-bottom: 15px; font-weight: bold; text-align: center; font-size:13px;">✅ Biometria Ativada neste Aparelho</div>
                   <button class="btn-cancel" style="width: 100%; justify-content:center; border: 1px solid #e74c3c; color: #e74c3c; background: transparent;" onclick="App.desativarBiometria()">🗑️ Remover Biometria</button>`
                : `<div style="background: #fdf2f2; border: 1px solid #e74c3c; color: #e74c3c; padding: 10px; border-radius: 8px; margin-bottom: 15px; font-weight: bold; text-align: center; font-size:13px;">❌ Biometria Não Configurada</div>
                   <button class="btn-primary" style="background: #27ae60; width: 100%; justify-content:center;" onclick="App.configurarBiometria()">👆 Configurar Biometria</button>`;

            div.innerHTML = `
                <div style="display:flex; gap:30px; flex-wrap:wrap;">
                    <div class="card" style="flex:1; height:fit-content; min-width:300px;">
                        <h3>Meus Dados de Acesso</h3>
                        <p style="font-size:12px; color:#666; margin-bottom:15px;">A senha atual é sempre obrigatória para salvar as alterações.</p>
                        <div class="input-group"><label>E-mail Dono da Conta</label><input type="email" id="user-novo-email" value="${App.escapeHTML(meuEmail)}" placeholder="Ex: gestor@escola.com" style="width:100%; border-left: 4px solid #f39c12;"></div>
                        <div class="input-group"><label>Login de Acesso</label><input type="text" id="user-novo-login" value="${App.escapeHTML(meuLogin)}" style="width:100%; border-left: 4px solid #3498db;"></div>
                        ${campoSenha('user-senha-atual', 'Senha Atual (Obrigatória)')}
                        ${campoSenha('user-nova-senha', 'Nova Senha (Opcional)')}
                        ${campoSenha('user-conf-senha', 'Confirmar Nova Senha')}
                        
                        <button class="btn-primary" style="width:100%; margin-top:10px; justify-content:center;" onclick="App.atualizarMeusDados()">ATUALIZAR DADOS</button>

                        <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                            <h4 style="margin: 0 0 10px 0; color: #333;">🔒 Segurança Avançada</h4>
                            <p style="font-size: 12px; color: #666; margin-bottom: 15px;">Use o sensor de rosto (FaceID) ou impressão digital para entrar sem senha.</p>
                            ${bioStatusHtml}
                        </div>
                    </div>
                    <div class="card" style="flex:2; min-width:300px;">
                        <h3>Equipe e Acessos</h3>
                        <div style="background:#f9f9f9; padding:20px; border-radius:10px; margin-bottom:20px; border:1px solid #eee;">
                            <h4 id="titulo-form-user" style="margin:0 0 15px 0; color:#2c3e50;">Novo Usuário</h4>
                            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:15px;">
                                <div class="input-group"><label>Nome</label><input id="new-nome" placeholder="Ex: Maria"></div>
                                <div class="input-group"><label>Login</label><input id="new-login" placeholder="Ex: maria"></div>
                                <div class="input-group"><label>Senha</label><input id="new-senha" type="password" placeholder="******"></div>
                                <div class="input-group"><label>Permissão</label><select id="new-tipo"><option value="Gestor">Gestor</option><option value="Secretaria">Secretaria</option><option value="Professor">Professor</option></select></div>
                            </div>
                            <div style="text-align:right; margin-top:10px; display:flex; justify-content:flex-end; gap:10px;">
                                <button id="btn-cancel-user" class="btn-cancel" onclick="App.cancelarEdicaoUsuario()" style="display:none; margin-top:0;">✖️ CANCELAR</button>
                                <button id="btn-save-user" class="btn-primary" style="width:auto; margin-top:0;" onclick="App.salvarNovoUsuario()">CRIAR USUÁRIO</button>
                            </div>
                        </div>
                        <div class="table-responsive-wrapper">
                            <table style="width:100%; text-align:left; border-collapse:collapse;">
                                <thead><tr><th style="padding-bottom:10px;">Nome</th><th style="padding-bottom:10px;">Login</th><th style="padding-bottom:10px;">Tipo</th><th style="text-align:right;">Ações</th></tr></thead>
                                <tbody>${listaUsers.map(u => `<tr><td style="padding:10px 0; border-top:1px solid #eee;">${App.escapeHTML(u.nome)} ${u.isDono ? '👑' : ''}</td><td style="padding:10px 0; border-top:1px solid #eee;">${App.escapeHTML(u.login)}</td><td style="padding:10px 0; border-top:1px solid #eee;"><span style="background:#eee; padding:2px 6px; border-radius:4px; font-size:11px;">${App.escapeHTML(u.tipo)}</span></td><td style="text-align:right; border-top:1px solid #eee;"><button class="btn-edit" onclick="App.preencherEdicaoUsuario('${u.id}', '${App.escapeHTML(u.nome)}', '${App.escapeHTML(u.login)}', '${App.escapeHTML(u.tipo)}')">✏️</button>${!u.isDono ? `<button class="btn-del" onclick="App.excluirUsuario('${u.id}')">🗑️</button>` : ''}</td></tr>`).join('')}</tbody>
                            </table>
                        </div>
                    </div>
                </div>`; 
        } catch(e) { div.innerHTML = "Erro ao carregar usuários."; } 
    },

   // 📡 ATIVADOR DE NOTIFICAÇÕES PUSH NATIIVAS
    configurarNotificacoesPush: async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            return console.warn('Este dispositivo não suporta Notificações Push.');
        }

        try {
            const permissao = await Notification.requestPermission();
            if (permissao !== 'granted') {
                return App.showToast("Permissão de notificações negada pelo utilizador.", "warning");
            }

            const chaveRes = await App.api('/push/public-key', 'GET');
            if (!chaveRes || !chaveRes.publicKey) throw new Error("Chave VAPID não encontrada.");

            const registroSW = await navigator.serviceWorker.ready;
            
            const padding = '='.repeat((4 - chaveRes.publicKey.length % 4) % 4);
            const base64 = (chaveRes.publicKey + padding).replace(/\-/g, '+').replace(/_/g, '/');
            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);
            for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);

            const subscricao = await registroSW.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: outputArray
            });

            const resultadoBack = await App.api('/push/subscribe', 'POST', subscricao);

            if (resultadoBack && resultadoBack.success) {
                App.showToast("🔔 Notificações ativadas com sucesso neste aparelho!", "success");
                setTimeout(() => { App.api('/push/teste', 'POST'); }, 1500);
            }
        } catch (error) {
            console.error("Erro ao ativar Push:", error);
            App.showToast("Falha ao ligar notificações com o servidor.", "error");
        }
    },

   desativarBiometria: async () => {
        try {
            const loginGuardado = localStorage.getItem('escola_bio_id') || (App.usuario ? App.usuario.login : null);
            if (loginGuardado) await App.api('/auth/biometria/remover', 'POST', { login: loginGuardado });
        } catch (e) { console.warn(e); }
        
        localStorage.removeItem('escola_bio_id');
        App.showToast("Acesso biométrico desativado.", "success");
        if (typeof App.renderizarMinhaConta === 'function') App.renderizarMinhaConta();
    },

    // 🚀 AQUI CONFIGURA A BIOMETRIA PELA PRIMEIRA VEZ
    configurarBiometria: async () => {
        try {
            // Este overlay faz sentido manter porque é a hora de ENSINAR/CONFIGURAR o utilizador
            App.exibirOverlayBiometria("Configurar Acesso", "A aguardar a leitura do seu sensor...");
            
            const options = await App.api('/auth/biometria/gerar-registo', 'POST', { login: App.usuario.login });
            if (options.error) throw new Error(options.error);

            const respostaBio = await startRegistration(options);

            const verificacao = await App.api('/auth/biometria/verificar-registo', 'POST', { 
                login: App.usuario.login, 
                respostaBio 
            });

            if (verificacao && verificacao.success) {
                localStorage.setItem('escola_bio_id', App.usuario.login);
                App.removerOverlayBiometria();
                App.showToast("✅ Biometria ativada e registada no servidor!", "success");
                if (typeof App.renderizarMinhaConta === 'function') App.renderizarMinhaConta();
            } else {
                throw new Error("O servidor rejeitou a assinatura.");
            }
        } catch (e) { 
            App.removerOverlayBiometria(); 
            console.error(e);
            App.showToast("Configuração biométrica cancelada ou bloqueada.", "warning"); 
        }
    },

   // O ecrã que recebe o primeiro toque obrigatório da Apple/Google
    exibirTelaTouchBiometria: () => {
        let tela = document.getElementById('bio-touch-screen');
        if (!tela) {
            tela = document.createElement('div');
            tela.id = 'bio-touch-screen';
            // Visual Premium: Fundo com degradê moderno e elegante
            tela.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:99999; cursor:pointer; color:white; transition: opacity 0.3s;';
            tela.innerHTML = `
                <div style="width: 90px; height: 90px; background: rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 25px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); animation: pulseBio 2s infinite;">
                    <span style="font-size: 45px;">🛡️</span>
                </div>
                <h2 id="bio-tela-titulo" style="margin:0 0 10px 0; font-size:24px; font-weight:700; letter-spacing: 1px;">Bem-vindo de volta!</h2>
                <p id="bio-tela-sub" style="opacity:0.9; margin:0 0 40px 0; font-size:15px; text-align:center; padding: 0 20px; font-weight:300;">Toque em qualquer lugar da tela<br>para aceder com FaceID / Digital.</p>
                
                <button style="padding:10px 20px; background:rgba(0,0,0,0.2); border:none; color:rgba(255,255,255,0.7); border-radius:20px; font-size:12px; z-index: 100000; transition:0.2s;" onclick="App.cancelarTouchBiometria(event)">Aceder com Senha</button>
                <style>
                    @keyframes pulseBio { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0.3); } 70% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(255,255,255,0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0); } }
                </style>
            `;
            document.body.appendChild(tela);
        }
        
        // Garante que o texto volta ao normal todas as vezes que a tela abre
        const titulo = document.getElementById('bio-tela-titulo');
        const sub = document.getElementById('bio-tela-sub');
        if(titulo) titulo.innerText = "Bem-vindo de volta!";
        if(sub) sub.innerHTML = "Toque em qualquer lugar da tela<br>para aceder com FaceID / Digital.";
        
        tela.style.display = 'flex';
        
        // O TOQUE MÁGICO: Cumpre a regra de segurança e aciona o sensor!
        tela.onclick = (e) => {
            if(e.target.tagName !== 'BUTTON') {
                // Dá feedback visual instantâneo ao utilizador
                if(titulo) titulo.innerText = "A iniciar sensor...";
                if(sub) sub.innerHTML = "Aguarde um momento.";
                
                // Dispara a leitura biométrica
                App.entrarComBiometria(true);
            }
        };
    },

    cancelarTouchBiometria: (e) => {
        if(e) e.stopPropagation();
        const tela = document.getElementById('bio-touch-screen');
        if (tela) tela.style.display = 'none';
        
        document.documentElement.removeAttribute('style'); 
        document.getElementById('tela-login').style.display = 'flex'; 
        document.getElementById('tela-sistema').style.display = 'none'; 
    },

    // 🚀 AQUI É O MOTOR DE ENTRADA DIÁRIO DA BIOMETRIA (Sem telas de loading pretas)
    entrarComBiometria: async (isAuto = false) => {
        const loginGuardado = localStorage.getItem('escola_bio_id');
        if (!loginGuardado) return; 

        try {
            // Removido App.exibirOverlayBiometria! A chamada vai direta para a API e pro leitor do telemóvel.
            
            const options = await App.api('/auth/biometria/gerar-login', 'POST', { login: loginGuardado });
            if (options.error) throw new Error(options.error);

            // O navegador chama o leitor nativo na hora
            const respostaBio = await startAuthentication(options);

            const authResultado = await App.api('/auth/biometria/verificar-login', 'POST', { 
                login: loginGuardado, 
                respostaBio 
            });

            if (authResultado && authResultado.success) {
                // Remove qualquer tela de bloqueio (se existia)
                const telaTouch = document.getElementById('bio-touch-screen');
                if (telaTouch) telaTouch.style.display = 'none';
                
                App.usuario = authResultado.usuario; 
                localStorage.setItem('usuario_logado', JSON.stringify(authResultado.usuario));
                
                App.showToast("🔓 Bem-vindo de volta!", "success");
                App.entrarNoSistema();
            } else {
                throw new Error("Credenciais recusadas pelo servidor.");
            }
        } catch (e) { 
            console.error("Biometria bloqueada ou falhou:", e);
            
            // 🛡️ PROTEÇÃO DO NAVEGADOR (User Gesture Requirement)
            // Se a Apple ou Google não permitirem abrir o sensor porque o utilizador ainda não tocou no ecrã,
            // atiramos o utilizador para a tela "👆 Toque para desbloquear", em vez de cancelar.
            if (e.name === 'NotAllowedError' || e.message.includes('user activation')) {
                App.exibirTelaTouchBiometria();
            } else if (!isAuto) {
                App.showToast("A leitura falhou. Por favor, use a sua senha.", "error"); 
            }
        }
    },

    // Esta função foi mantida APENAS para a CONFIGURAÇÃO inicial (para o ecrã ficar bonito ao registar)
    exibirOverlayBiometria: (titulo, sub) => {
        let overlay = document.getElementById('bio-overlay-premium');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'bio-overlay-premium';
            overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); backdrop-filter:blur(8px); display:flex; justify-content:center; align-items:center; z-index:100000;';
            document.body.appendChild(overlay);
        }
        overlay.innerHTML = `
            <div style="background:white; padding:40px; border-radius:28px; text-align:center; width:85%; max-width:320px; box-shadow:0 20px 40px rgba(0,0,0,0.4);">
                <div style="font-size:65px; margin-bottom:20px;">👤</div>
                <h2 style="margin:0 0 10px 0; color:#2c3e50; font-size:20px;">${titulo}</h2>
                <p style="color:#7f8c8d; font-size:14px; line-height:1.5; margin-bottom:25px;">${sub}</p>
                <div style="font-size:11px; color:#3498db; font-weight:bold; letter-spacing:2px; text-transform:uppercase;">App Gestão PTT</div>
            </div>
        `;
        overlay.style.display = 'flex';
    },

    removerOverlayBiometria: () => {
        const overlay = document.getElementById('bio-overlay-premium');
        if (overlay) overlay.style.display = 'none';
    },

    atualizarMeusDados: async () => { 
        const novoLogin = document.getElementById('user-novo-login').value.trim(); 
        const novoEmail = document.getElementById('user-novo-email').value.trim(); 
        const atual = document.getElementById('user-senha-atual').value; 
        const nova = document.getElementById('user-nova-senha').value; 
        const conf = document.getElementById('user-conf-senha').value; 

        if (!novoLogin) return App.showToast("O login não pode ficar em branco.", "error"); 
        if (!atual) return App.showToast("Digite sua senha atual para autorizar as alterações.", "error"); 
        if (nova && nova !== conf) return App.showToast("A nova senha e a confirmação não conferem.", "error"); 
        
        const btn = document.querySelector('button[onclick="App.atualizarMeusDados()"]'); const textoOriginal = btn.innerText; btn.innerText = "Atualizando... ⏳"; btn.disabled = true;

        try {
            const payload = { novoLogin: novoLogin, novoEmail: novoEmail, senhaAtual: atual }; if (nova) payload.novaSenha = nova; 
            const resposta = await App.api('/usuarios/atualizar-conta', 'PUT', payload);
            if (resposta && resposta.success) { App.showToast("Dados atualizados com sucesso! Faça login novamente.", "success"); setTimeout(() => App.logout(), 2500); } 
            else { App.showToast(resposta.error || "Erro ao atualizar os dados.", "error"); }
        } catch (e) { App.showToast("Erro de conexão.", "error"); } finally { btn.innerText = textoOriginal; btn.disabled = false; }
    },

    salvarNovoUsuario: async () => {
        const nome = document.getElementById('new-nome').value; const login = document.getElementById('new-login').value; const senha = document.getElementById('new-senha').value; const tipo = document.getElementById('new-tipo').value;
        if(!nome || !login) return App.showToast("Preencha nome e login.", "error"); 
        if(!App.idEdicaoUsuario && !senha) return App.showToast("Digite uma senha.", "error");

        const payload = { nome, login, tipo }; if(senha) payload.senha = senha;
        
        if (!App.idEdicaoUsuario) { 
            const podeCadastrar = await App.verificarLimites('usuario');
            if (!podeCadastrar) return; 
            payload.donoId = App.usuario.id; 
        }

        const btn = document.getElementById('btn-save-user'); 
        const txtOriginal = btn ? btn.innerText : 'CRIAR USUÁRIO';
        if(btn) { btn.innerText = "Salvando... ⏳"; btn.disabled = true; } 
        document.body.style.cursor = 'wait';

        try {
            let res;
            if(App.idEdicaoUsuario) { 
                res = await App.api(`/usuarios/${App.idEdicaoUsuario}`, 'PUT', payload); 
            } else { 
                res = await App.api('/usuarios', 'POST', payload); 
            }

            if (res && res.error) {
                App.showToast(res.error, "error");
            } else {
                App.showToast(App.idEdicaoUsuario ? "Atualizado com sucesso!" : "Criado com sucesso!", "success");
                App.renderizarMinhaConta();
            }
        } catch(e) { 
            App.showToast("Erro crítico ao salvar.", "error"); 
        } finally { 
            if(btn) { btn.innerText = txtOriginal; btn.disabled = false; } 
            document.body.style.cursor = 'default'; 
        }
    },

    preencherEdicaoUsuario: (id, nome, login, tipo) => { App.idEdicaoUsuario = id; document.getElementById('new-nome').value = nome; document.getElementById('new-login').value = login; document.getElementById('new-senha').value = ''; document.getElementById('new-tipo').value = tipo; document.getElementById('titulo-form-user').innerText = "Editar Usuário"; document.getElementById('btn-save-user').innerText = "ATUALIZAR"; document.getElementById('btn-cancel-user').style.display = "inline-flex"; },
    cancelarEdicaoUsuario: () => { App.idEdicaoUsuario = null; document.getElementById('new-nome').value = ''; document.getElementById('new-login').value = ''; document.getElementById('new-senha').value = ''; document.getElementById('new-tipo').value = 'Gestor'; document.getElementById('titulo-form-user').innerText = "Novo Usuário"; document.getElementById('btn-save-user').innerText = "CRIAR USUÁRIO"; document.getElementById('btn-cancel-user').style.display = "none"; },
    
excluirUsuario: (id) => { 
        App.abrirModalConfirmacao(
            "Apagar Utilizador?", 
            "Deseja remover o acesso deste membro da equipe? A ação não pode ser desfeita.", 
            async (modal) => {
                document.body.style.cursor = 'wait';
                try {
                    const res = await App.api(`/usuarios/${id}`, 'DELETE'); 
                    if(res && res.error) { App.showToast(res.error, "error"); }
                    else { 
                        App.showToast("Utilizador excluído.", "success"); 
                        App.renderizarMinhaConta(); 
                        
                        // 👁️ O GATILHO DE AUDITORIA AQUI:
                        App.registrarLog('EXCLUSÃO DE UTILIZADOR', `O utilizador com o ID ${id} foi removido do sistema.`);
                    }
                } catch(e) { App.showToast("Erro ao excluir.", "error"); }
                finally {
                    document.body.style.cursor = 'default';
                    modal.style.opacity = '0'; setTimeout(() => modal.style.display = 'none', 300);
                }
            }
        );
    },

    // =========================================================
    // 👁️ MÓDULO DE AUDITORIA (Logs de Ações Críticas)
    // =========================================================

    // 1. O GATILHO: Esta função envia a ação para o servidor em total silêncio
    registrarLog: async (acao, detalhes) => {
        try {
            // Envia para o servidor sem parar ou bloquear a tela do utilizador
            await App.api('/auditoria', 'POST', { acao, detalhes });
        } catch (e) {
            console.warn("Aviso: Falha ao registar auditoria.", e);
        }
    },

    // 2. A TELA: Onde o Diretor vê o relatório de tudo o que aconteceu
    renderizarAuditoria: async () => {
        if (typeof App.setTitulo === 'function') App.setTitulo("Logs de Auditoria"); 
        const div = document.getElementById('app-content'); 
        
        div.innerHTML = `<div style="text-align:center; padding:40px;"><span style="font-size:40px;">⏳</span><br>A carregar o histórico de segurança...</div>`;

        try {
            const logs = await App.api('/auditoria', 'GET');

            if (!logs || logs.length === 0) {
                div.innerHTML = `
                    <div style="text-align:center; padding:40px; background:#fff; border-radius:12px;">
                        <span style="font-size:40px; display:block; margin-bottom:15px;">🛡️</span>
                        <h3 style="color:#2c3e50;">Ambiente Seguro</h3>
                        <p style="color:#666;">Ainda não existem registos de atividades críticas na sua instituição.</p>
                    </div>`;
                return;
            }

            let html = `
            <div class="card" style="overflow-x:auto;">
                <h3 style="margin-top:0; color:#2c3e50;">Histórico de Atividades</h3>
                <p style="font-size:12px; color:#666; margin-bottom:20px;">Os últimos 100 eventos realizados por membros da equipa.</p>
                <table style="width:100%; border-collapse:collapse; text-align:left; font-size:13px;">
                    <thead>
                        <tr style="background:#f9f9f9; border-bottom:2px solid #eee;">
                            <th style="padding:12px 10px; color:#333;">Data / Hora</th>
                            <th style="padding:12px 10px; color:#333;">Utilizador</th>
                            <th style="padding:12px 10px; color:#333;">Ação Realizada</th>
                            <th style="padding:12px 10px; color:#333;">Detalhes Adicionais</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            logs.forEach(log => {
                const dataFormatada = new Date(log.data).toLocaleString('pt-PT');
                html += `
                    <tr style="border-bottom:1px solid #eee;">
                        <td style="padding:12px 10px; color:#666; white-space:nowrap;">${dataFormatada}</td>
                        <td style="padding:12px 10px;">
                            <strong>${log.usuarioNome}</strong><br>
                            <span style="font-size:10px; background:#eee; padding:2px 6px; border-radius:4px;">${log.usuarioTipo}</span>
                        </td>
                        <td style="padding:12px 10px;">
                            <span style="background:#e8f4f8; color:#2980b9; padding:4px 8px; border-radius:6px; font-weight:bold; font-size:11px; text-transform:uppercase;">
                                ${log.acao}
                            </span>
                        </td>
                        <td style="padding:12px 10px; color:#555; max-width: 300px; line-height:1.4;">${log.detalhes}</td>
                    </tr>
                `;
            });

            html += `</tbody></table></div>`;
            div.innerHTML = html;

        } catch (error) {
            div.innerHTML = `<div style="color:red; text-align:center; padding:20px;">Erro ao carregar o relatório de auditoria. Tente novamente.</div>`;
        }
    },

});

// =========================================================
// 👆 DETETOR AUTOMÁTICO DE BIOMETRIA NO LOGIN
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    // Mantemos o botão visível caso o utilizador cancele a biometria automática e queira tentar outra vez manualmente
    const loginBiometrico = localStorage.getItem('escola_bio_id');
    const btnBio = document.getElementById('btn-biometria');
    
    if (loginBiometrico && btnBio) {
        btnBio.style.display = 'flex'; 
        
        const inputUser = document.getElementById('login-user');
        if(inputUser) inputUser.value = loginBiometrico;
    }
});

// =========================================================
// 🛡️ MOTOR DE BLOQUEIO POR INATIVIDADE (BACKGROUND)
// =========================================================
document.addEventListener('visibilitychange', () => {
    const bioId = localStorage.getItem('escola_bio_id');
    if (!bioId || !window.PublicKeyCredential) return; // Só afeta quem tem biometria ativada

    if (document.visibilityState === 'hidden') {
        // A app foi minimizada
        localStorage.setItem('app_locked_timestamp', Date.now());
    } else if (document.visibilityState === 'visible') {
        // A app voltou a ser aberta
        const lockedTime = localStorage.getItem('app_locked_timestamp');
        if (lockedTime) {
            const tempoFora = Date.now() - parseInt(lockedTime);
            
            // ⏳ TEMPO LIMITE DE ESPERA (1 Minuto = 60.000 ms)
            const limiteBloqueio = 60 * 1000; 
            
            if (tempoFora > limiteBloqueio) {
                // 🔒 Tranca o sistema ocultando o painel principal!
                document.getElementById('tela-sistema').style.display = 'none';
                
                // 🚀 MUDANÇA: Dispara direto o leitor nativo sem tela de toque prévia
                setTimeout(() => { App.entrarComBiometria(true); }, 300);
            }
        }
    }
});