window.App = window.App || {};
const App = window.App;

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

    // 🔓 RENOVAÇÃO INSTANTÂNEA DE 30 DIAS NO LOGIN
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

            // Se falhar na API, verifica as chaves manuais (fallback)
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

            // 🚀 O SEGREDO: GRAVAR A NOVA DATA DE VALIDADE NO BANCO DE DADOS OFICIAL
            const escolaAtual = await App.api('/escola') || {};
            const novaDataExp = new Date();
            novaDataExp.setDate(novaDataExp.getDate() + 30); // Soma +30 dias ao dia de hoje
            
            await App.api('/escola', 'PUT', { 
                ...escolaAtual, 
                plano: novoPlano, 
                pinUsado: pin, 
                dataExpiracao: novaDataExp.toISOString() 
            });

            // Atualiza o Cache Local
            localStorage.setItem(App.getTenantKey('escola_plano'), novoPlano);
            let perfilCache = JSON.parse(localStorage.getItem(App.getTenantKey('escola_perfil'))) || {};
            perfilCache.plano = novoPlano;
            perfilCache.dataExpiracao = novaDataExp.toISOString();
            localStorage.setItem(App.getTenantKey('escola_perfil'), JSON.stringify(perfilCache));

            App.atualizarUIHeader(perfilCache);
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


    // =========================================================
    // ARRANQUE E LOGIN COM FILTRO DE BLOQUEIO ABSOLUTO
    // =========================================================
    init: async () => {
        localStorage.removeItem('escola_tema'); localStorage.removeItem('escola_atalhos'); localStorage.removeItem('escola_perfil');
         
        const resetToken = new URLSearchParams(window.location.search).get('reset');
        if (resetToken) {
        document.documentElement.removeAttribute('style');
        document.getElementById('tela-login').style.display = 'flex';
        document.getElementById('tela-sistema').style.display = 'none';

        setTimeout(() => {
        App.abrirModalNovaSenha(resetToken);
        }, 300);

        return;
        } 

        const salvo = localStorage.getItem('usuario_logado'); const bioId = localStorage.getItem('escola_bio_id');

        if (salvo) { 
            App.usuario = JSON.parse(salvo); 
            App.aplicarTemaSalvo();

            const keyAtalhos = App.getTenantKey('escola_atalhos');
            if (!localStorage.getItem(keyAtalhos)) { localStorage.setItem(keyAtalhos, JSON.stringify(['novo_aluno','fin_carne','ped_chamada','ped_notas','ped_plan','ped_bol'])); }

            let escola = await App.api('/escola');

if (!escola || escola.error) {

    // 🚨 Se a sessão expirou ou não existe
    if (
        escola?.error === 'Sessão não encontrada.' ||
        escola?.error === 'Sessão expirada.'
    ) {

        await App.logout();
        return;
    }

    // 📦 fallback offline/cache
    escola = JSON.parse(
        localStorage.getItem(App.getTenantKey('escola_perfil'))
    ) || {};
}

            if (App.verificarBloqueioGeral(escola)) {
                document.documentElement.removeAttribute('style'); 
                App.mostrarTelaBloqueioLogin(escola);
            } else {
                if (bioId && window.PublicKeyCredential) {
                    document.getElementById('tela-login').style.display = 'flex'; document.getElementById('tela-sistema').style.display = 'none';
                    document.getElementById('btn-biometria').style.display = 'block'; 
setTimeout(() => { App.entrarComBiometria(); }, 600); 
                } else { 
                    App.entrarNoSistema(); 
                }
            }
        } else { 
            document.documentElement.removeAttribute('style'); document.getElementById('tela-login').style.display = 'flex'; document.getElementById('tela-sistema').style.display = 'none'; 
        }
        
        const dataEl = document.getElementById('data-hoje'); if(dataEl) dataEl.innerText = new Date().toLocaleDateString('pt-BR');
        App.setupMobileMenu(); 
        
        const passInput = document.getElementById('login-pass'); if(passInput) { passInput.addEventListener('keypress', function (e) { if (e.key === 'Enter') { App.fazerLogin(); } }); }
        
        // ⏰ MOTOR DE TEMPO REAL DO SININHO E CÃO DE GUARDA
        if (!App.motorTempoRealLigado) {
            
            // 1. Separamos a lógica numa função para poder chamar na hora
            const checarSistema = () => {
                const telaSistema = document.getElementById('tela-sistema');
                if (App.usuario && telaSistema && telaSistema.style.display !== 'none') {
                    App.verificarNotificacoes();
                    App.carregarDadosEscola(); 
                }
            };

            // 2. Roda a primeira vez quase que imediatamente (2 seg) após o login
            setTimeout(checarSistema, 2000);

            // 3. Depois, fica rodando a cada 10 segundos (10000 milissegundos)
            setInterval(checarSistema, 10000); 
            
            App.motorTempoRealLigado = true;
        }
    },

    fazerLogin: async () => {
        const login = document.getElementById('login-user').value.trim();
        const pass = document.getElementById('login-pass').value.trim();
        if(!login || !pass) return App.showToast("Preencha utilizador e senha", "warning");
        
        const btn = document.querySelector('#tela-login button[type="submit"]');
        const txt = btn.innerText; btn.innerText = "Autenticando... ⏳"; btn.disabled = true;
        
        try {
            const deviceId = App.getDeviceId();
            const res = await App.api('/auth/login', 'POST', { login: login, senha: pass, deviceId: deviceId });
            
            if(res && res.success) {
                App.usuario = res.usuario;
                localStorage.setItem('usuario_logado', JSON.stringify(res.usuario));
                
                
                if (typeof gtag === 'function') gtag('event', 'login', { method: 'Sistema PTT' });
                
                App.aplicarTemaSalvo();
                const keyAtalhos = App.getTenantKey('escola_atalhos');
                if (!localStorage.getItem(keyAtalhos)) { localStorage.setItem(keyAtalhos, JSON.stringify(['novo_aluno','fin_carne','ped_chamada','ped_notas','ped_plan','ped_bol'])); }

                let escola = await App.api('/escola');

if (!escola || escola.error) {

    // 🚨 Se a sessão expirou ou não existe
    if (
        escola?.error === 'Sessão não encontrada.' ||
        escola?.error === 'Sessão expirada.'
    ) {

        await App.logout();
        return;
    }

    // 📦 fallback offline/cache
    escola = JSON.parse(
        localStorage.getItem(App.getTenantKey('escola_perfil'))
    ) || {};
}

                if (App.verificarBloqueioGeral(escola)) {
                    App.mostrarTelaBloqueioLogin(escola);
                } else {
                    App.entrarNoSistema();
                    App.showToast('Bem-vindo ao sistema!', 'success');
                }
            } else { 
                App.showToast(res.error || "Login ou senha incorretos", "error"); 
            }
        } catch(e) { App.showToast("Erro ao conectar no servidor", "error"); } 
        finally { btn.innerText = txt; btn.disabled = false; }
    },

    entrarNoSistema: async () => {
        // O operador ?. impede que o código quebre se o ID não existir na página atual
        document.getElementById('tela-login')?.style.setProperty('display', 'none');
        document.getElementById('tela-sistema')?.style.setProperty('display', 'flex');
        
        const el = document.getElementById('user-name');
        if(el && App.usuario) el.innerText = App.usuario.nome || App.usuario.login;
        
        App.aplicarPermissoesDeUsuario(); 
        
        await App.carregarDadosEscola();
        // 🚀 LIGA O RADAR AQUI!
        App.iniciarRadar();        

        const telaSistema = document.getElementById('tela-sistema');
        if (telaSistema && telaSistema.style.display !== 'none') {
            App.renderizarInicio();
        }
    },

   logout: async () => {
   // 🛑 DESLIGA O RADAR
        if (App.radarAtivo) clearInterval(App.radarAtivo); 
   try {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch(e) {}

    document.documentElement.removeAttribute('style');
    localStorage.removeItem('usuario_logado');
    localStorage.removeItem('token_acesso');
    App.usuario = null;

    const inUser = document.getElementById('login-user');
    if (inUser) inUser.value = '';

    const inPass = document.getElementById('login-pass');
    if (inPass) inPass.value = '';

    const modalPadrao = document.getElementById('modal-overlay');
    if (modalPadrao) modalPadrao.style.display = 'none';

    const modalInst = document.getElementById('modal-cadastro-inst');
    if (modalInst) modalInst.style.display = 'none';

    const modalRec = document.getElementById('modal-recuperacao-senha');
    if (modalRec) modalRec.style.display = 'none';

    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.remove('active');

    const mobileOverlay = document.querySelector('.mobile-overlay');
    if (mobileOverlay) mobileOverlay.classList.remove('active');

    const notiDropdown = document.getElementById('noti-dropdown');
    if (notiDropdown) notiDropdown.classList.remove('active');

    document.getElementById('tela-sistema').style.display = 'none';

    const telaLogin = document.getElementById('tela-login');
    if (telaLogin) telaLogin.style.display = telaLogin.classList.contains('login-wrapper') ? 'flex' : 'block';

    const blockBox = document.getElementById('box-bloqueio-conta');
    if (blockBox) blockBox.style.display = 'none';

    const loginForms = document.querySelectorAll('#tela-login .login-box, #tela-login .box-login');
    loginForms.forEach(form => {
        if (form.id !== 'box-bloqueio-conta') form.style.display = '';
    });
},
     
        // =========================================================
    // 👁️ OLHINHO E RECUPERAÇÃO DE SENHA
    // =========================================================
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
                <p style="font-size:13px; color:#666; margin-bottom:20px;">
                    Insira o e-mail registado na sua conta. Enviaremos um link seguro para criar uma nova senha.
                </p>

                <input type="email" id="recuperar-email-input" placeholder="O seu e-mail de acesso" style="width:100%; padding:12px; border-radius:6px; border:1px solid #ccc; margin-bottom:15px; text-align:center;">

                <button class="btn-primary" onclick="App.enviarRecuperacaoSenha()" style="width:100%; justify-content:center; padding:12px; margin-bottom:10px; border:none; border-radius:6px;">
                    ✉️ Enviar Link de Recuperação
                </button>

                <button class="btn-cancel" onclick="document.getElementById('modal-recuperacao-senha').style.display='none'" style="width:100%; justify-content:center; padding:10px; background:transparent; border:1px solid #ccc; border-radius:6px; cursor:pointer;">
                    Cancelar e Voltar
                </button>
            </div>
        `;

        document.body.appendChild(modal);
    }

    document.getElementById('recuperar-email-input').value = '';
    modal.style.display = 'flex';
},  
      
  enviarRecuperacaoSenha: async () => {
    const email = document.getElementById('recuperar-email-input')?.value.trim();

    if (!email) {
        return App.showToast("Informe o e-mail de acesso.", "warning");
    }

    const btn = document.querySelector('#modal-recuperacao-senha .btn-primary');
    const textoOriginal = btn.innerText;

    btn.innerText = "Enviando link... ⏳";
    btn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/auth/recuperar-senha`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await res.json();

        if (data.success) {
            App.showToast(data.message || "Se este e-mail estiver cadastrado, enviaremos um link.", "success");
            document.getElementById('modal-recuperacao-senha').style.display = 'none';
        } else {
            App.showToast(data.error || "Não foi possível solicitar a recuperação.", "error");
        }

    } catch (e) {
        App.showToast("Erro de comunicação com o servidor.", "error");
    } finally {
        btn.innerText = textoOriginal;
        btn.disabled = false;
    }
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

                <p style="font-size:13px; color:#666; margin-bottom:20px;">
                    Digite a sua nova senha de acesso.
                </p>

                <input type="password" id="nova-senha-reset" placeholder="Nova senha" style="width:100%; padding:12px; border-radius:6px; border:1px solid #ccc; margin-bottom:12px; text-align:center;">

                <input type="password" id="confirma-senha-reset" placeholder="Confirmar nova senha" style="width:100%; padding:12px; border-radius:6px; border:1px solid #ccc; margin-bottom:15px; text-align:center;">

                <button class="btn-primary" onclick="App.confirmarNovaSenhaReset()" style="width:100%; justify-content:center; padding:12px; margin-bottom:10px; border:none; border-radius:6px;">
                    ✅ Salvar Nova Senha
                </button>

                <button class="btn-cancel" onclick="document.getElementById('modal-nova-senha').style.display='none'" style="width:100%; justify-content:center; padding:10px; background:transparent; border:1px solid #ccc; border-radius:6px; cursor:pointer;">
                    Cancelar
                </button>
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

    if (novaSenha.length < 6) {
        return App.showToast("A nova senha deve ter pelo menos 6 caracteres.", "warning");
    }

    if (novaSenha !== confirmaSenha) {
        return App.showToast("As senhas não conferem.", "warning");
    }

    const btn = document.querySelector('#modal-nova-senha .btn-primary');
    const textoOriginal = btn.innerText;

    btn.innerText = "Salvando... ⏳";
    btn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/auth/redefinir-senha`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: App.tokenResetSenha,
                novaSenha
            })
        });

        const data = await res.json();

        if (data.success) {
            App.showToast("Senha redefinida com sucesso. Faça login com a nova senha.", "success");
            document.getElementById('modal-nova-senha').style.display = 'none';

            App.tokenResetSenha = null;

            const novaUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, novaUrl);
        } else {
            App.showToast(data.error || "Não foi possível redefinir a senha.", "error");
        }

    } catch (e) {
        App.showToast("Erro de comunicação com o servidor.", "error");
    } finally {
        btn.innerText = textoOriginal;
        btn.disabled = false;
    }
},

// =========================================================
// 👆 BIOMETRIA PREMIUM - EXPERIÊNCIA DE APP NATIVO
// =========================================================

// Utilitários de Conversão Ultra-Seguros
bufferToBase64: function(buf) {
    var bytes = new Uint8Array(buf);
    var binary = '';
    for (var i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
},

base64ToBuffer: function(b64) {
    var binary_string = atob(b64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
},

configurarBiometria: async () => {
    if (!window.PublicKeyCredential) return App.showToast("Este dispositivo não suporta biometria.", "error");

    try {
        // Interface de Antecipação Estilo App
        App.exibirOverlayBiometria("Configurar Acesso Seguro", "Use o sensor digital ou FaceID para registrar o seu acesso neste aparelho.");
        
        const challenge = window.crypto.getRandomValues(new Uint8Array(32));
        const userId = window.crypto.getRandomValues(new Uint8Array(16));

        const cred = await navigator.credentials.create({
            publicKey: {
                challenge: challenge,
                rp: { name: "App Gestão PTT" },
                user: { 
                    id: userId, 
                    name: App.usuario.login, 
                    displayName: App.usuario.nome 
                },
                pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
                authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
                timeout: 60000
            }
        });

        if (cred) {
            localStorage.setItem('escola_bio_id', App.bufferToBase64(cred.rawId));
            App.removerOverlayBiometria();
            App.showToast("✅ Biometria ativada com sucesso!", "success");
            App.renderizarMinhaConta();
        }
    } catch (e) {
        App.removerOverlayBiometria();
        console.error(e);
        App.showToast("Configuração cancelada ou falhou.", "warning");
    }
},

entrarComBiometria: async () => {
    const bioId = localStorage.getItem('escola_bio_id');
    if (!bioId) return;

    try {
        App.exibirOverlayBiometria("Autenticação Biométrica", "Aguardando confirmação de identidade...");
        
        const challenge = window.crypto.getRandomValues(new Uint8Array(32));
        const rawId = App.base64ToBuffer(bioId);

        const assertion = await navigator.credentials.get({
            publicKey: {
                challenge: challenge,
                allowCredentials: [{ type: "public-key", id: rawId }],
                userVerification: "required",
                timeout: 60000
            }
        });

        if (assertion) {
            App.removerOverlayBiometria();
            App.showToast("🔓 Identidade confirmada!", "success");
            App.entrarNoSistema();
        }
    } catch (e) {
        App.removerOverlayBiometria();
        console.error(e);
        App.showToast("Biometria não reconhecida. Use sua senha.", "info");
    }
},

// Interface Visual (Overlay Estilo iOS/Android)
exibirOverlayBiometria: (titulo, sub) => {
    let overlay = document.getElementById('bio-overlay-premium');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'bio-overlay-premium';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
            display: flex; justify-content: center; align-items: center;
            z-index: 10000;
        `;
        document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 28px; text-align: center; width: 85%; max-width: 320px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); animation: slideUpBio 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
            <div class="bio-icon-pulse" style="font-size: 65px; margin-bottom: 20px;">👤</div>
            <h2 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 20px; font-family: sans-serif;">${titulo}</h2>
            <p style="color: #7f8c8d; font-size: 14px; line-height: 1.5; margin-bottom: 25px; font-family: sans-serif;">${sub}</p>
            <div style="font-size: 11px; color: #3498db; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">App Gestão PTT</div>
        </div>
        <style>
            @keyframes slideUpBio { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            .bio-icon-pulse { animation: pulseBio 1.8s infinite; display: inline-block; }
            @keyframes pulseBio { 0% { transform: scale(1); } 50% { transform: scale(1.1); opacity: 0.8; } 100% { transform: scale(1); } }
        </style>
    `;
    overlay.style.display = 'flex';
},

removerOverlayBiometria: () => {
    const overlay = document.getElementById('bio-overlay-premium');
    if (overlay) overlay.style.display = 'none';
}

});