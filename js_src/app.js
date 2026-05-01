// =========================================================
// SISTEMA ESCOLAR - APP.JS (V158 - RBAC: PERMISSÕES DE CARGO, LIMITES E ANTI-PIRATARIA)
// =========================================================

const API_URL = CONFIG.API_URL; 

// 🛡️ Mapeamento de funcionalidades por Cargo
const LISTA_FUNCIONALIDADES = [
    { id: 'novo_aluno', nome: 'Novo Aluno', icon: '👨‍🎓', acao: "App.abrirModalCadastro('aluno')", roles: ['Gestor', 'Secretaria'] },
    { id: 'fin_carne', nome: 'Gerar Carnê', icon: '💸', acao: "App.renderizarTela('mensalidades')", roles: ['Gestor', 'Secretaria'] },
    { id: 'ped_chamada', nome: 'Fazer Chamada', icon: '📋', acao: "App.renderizarTela('chamada')", roles: ['Gestor', 'Secretaria', 'Professor'] },
    { id: 'ped_notas', nome: 'Lançar Nota', icon: '📝', acao: "App.renderizarTela('avaliacoes')", roles: ['Gestor', 'Secretaria', 'Professor'] },
    { id: 'ped_plan', nome: 'Planejamento', icon: '📅', acao: "App.renderizarTela('planejamento')", roles: ['Gestor', 'Secretaria', 'Professor'] },
    { id: 'ped_bol', nome: 'Boletins', icon: '🖨️', acao: "App.renderizarTela('boletins')", roles: ['Gestor', 'Secretaria', 'Professor'] },
    { id: 'fin_inad', nome: 'Inadimplência', icon: '⚠️', acao: "App.renderizarTela('inadimplencia')", roles: ['Gestor', 'Secretaria'] },
    { id: 'fin_rel', nome: 'Rel. Financeiro', icon: '📊', acao: "App.renderizarRelatorio('financeiro')", roles: ['Gestor', 'Secretaria'] },
    { id: 'doc_ficha', nome: 'Ficha Matrícula', icon: '📄', acao: "App.renderizarRelatorio('ficha')", roles: ['Gestor', 'Secretaria'] },
    { id: 'doc_dossie', nome: 'Dossiê Executivo', icon: '📁', acao: "App.renderizarRelatorio('dossie')", roles: ['Gestor'] },
    { id: 'doc_gerador', nome: 'Documentos', icon: '🎓', acao: "App.renderizarRelatorio('documentos')", roles: ['Gestor', 'Secretaria'] } 
];

// =========================================================
// 🛡️ CORE DA APLICAÇÃO E SISTEMA DE SEGURANÇA CONTRA XSS
// =========================================================

var App = {
    usuario: null, entidadeAtual: null, idEdicao: null, idEdicaoUsuario: null, listaCache: [], 
    motorTempoRealLigado: false,
    calendarState: { month: new Date().getMonth(), year: new Date().getFullYear() },

    escapeHTML: (str) => {
        if (str === null || str === undefined) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    },

    criarElemento: (tag, classes = [], atributos = {}, texto = '') => {
        const elemento = document.createElement(tag);
        
        // Adiciona classes
        if (classes.length > 0) elemento.classList.add(...classes);
        
        // Adiciona atributos (id, type, etc.) e Eventos (onclick)
        for (const chave in atributos) {
            // Se o atributo for um evento (ex: onClick), adicionamos o Listener de forma moderna
            if (chave.startsWith('on') && typeof atributos[chave] === 'function') {
                const nomeEvento = chave.substring(2).toLowerCase(); // transforma 'onClick' em 'click'
                elemento.addEventListener(nomeEvento, atributos[chave]);
            } else {
                elemento.setAttribute(chave, atributos[chave]);
            }
        }
        
        // Adiciona o texto de forma 100% segura (não precisa do escapeHTML)
        if (texto !== '') elemento.textContent = texto; 
        
        return elemento;
    },

    getTenantKey: (chaveBase) => {
        const tenantId = (App.usuario && App.usuario.id) ? App.usuario.id : 'convidado';
        return `${chaveBase}_${tenantId}`;
    },

    getPlanoAtual: () => { return localStorage.getItem(App.getTenantKey('escola_plano')) || 'Teste'; },

    getDeviceId: () => {
    let deviceId = localStorage.getItem('ptt_device_id');
    if (!deviceId) {
        deviceId = 'dev_' + window.crypto.randomUUID();
        localStorage.setItem('ptt_device_id', deviceId);
        }
    return deviceId;
    },

    aplicarPermissoesDeUsuario: () => {
        if (!App.usuario) return;
        const tipo = App.usuario.tipo || 'Gestor';
        
        const menuItems = document.querySelectorAll('.sidebar button, .sidebar .menu-item');
        menuItems.forEach(btn => {
            const acao = btn.getAttribute('onclick') || '';
            let visivel = true;
            
            if (tipo === 'Professor') {
                if (acao.includes('mensalidade') || acao.includes('financeiro') || acao.includes('inadimplencia') || acao.includes('relatorio') || acao.includes('configuracoes') || acao.includes('aparencia') || acao.includes('backup') || acao.includes('plano') || acao.includes('conta')) visivel = false;
            } else if (tipo === 'Secretaria') {
                if (acao.includes('configuracoes') || acao.includes('aparencia') || acao.includes('backup') || acao.includes('plano') || acao.includes('dossie') || acao.includes('conta')) visivel = false;
            }
            
            btn.style.display = visivel ? '' : 'none';
        });
    },

    // 🚀 LÓGICA DE BLOQUEIO DESTRUTIVA GERAL (30 DIAS E TESTE)
    verificarBloqueioGeral: (escola) => {
        if (!escola) return false;
        const plano = escola.plano || 'Teste';
        
        if (plano === 'Bloqueado') return true;

        const dataHoje = new Date();

        // Respeita a data de validade imposta no sistema
        if (escola.dataExpiracao) {
            const dataVenc = new Date(escola.dataExpiracao);
            return dataHoje >= dataVenc;
        } else {
            // Fallback para escolas que ainda não tem a data registrada
            const dataCriacao = escola.dataCriacao ? new Date(escola.dataCriacao) : new Date();
            const diffDays = Math.floor(Math.abs(dataHoje - dataCriacao) / (1000 * 60 * 60 * 24));
            
            if (plano === 'Teste' && diffDays >= 7) return true;
            if (plano !== 'Teste' && plano !== 'Premium' && diffDays >= 30) return true; 
        }

        return false;
    },

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

    verificarLimites: async (tipo) => {
        const plano = App.getPlanoAtual();
        if (plano === 'Premium' || plano === 'Teste') return true; 
        
        try {
            if (tipo === 'aluno') {
                const alunos = await App.api('/alunos');
                const limite = plano === 'Essencial' ? 20 : (plano === 'Profissional' ? 80 : 0);
                if (alunos.length >= limite) {
                    App.showToast(`⚠️ Limite de ${limite} alunos atingido no plano ${plano}. Faça o upgrade para continuar a crescer!`, "warning");
                    setTimeout(() => App.renderizarMeuPlano(), 2000);
                    return false;
                }
            } else if (tipo === 'usuario') {
                const usuarios = await App.api('/usuarios');
                const limite = plano === 'Essencial' ? 2 : (plano === 'Profissional' ? 4 : 0);
                if (usuarios.length >= limite) {
                    App.showToast(`⚠️ Limite de ${limite} acessos atingido no plano ${plano}. Faça o upgrade para adicionar mais equipa!`, "warning");
                    setTimeout(() => App.renderizarMeuPlano(), 2000);
                    return false;
                }
            }
            return true;
        } catch(e) { return false; }
    },

    verificarPermissao: (funcionalidade) => {
        const plano = App.getPlanoAtual();
        if (plano === 'Premium' || plano === 'Teste') return true; 
        
        if (funcionalidade === 'whatsapp' && plano === 'Essencial') {
            App.showToast("💎 Funcionalidade disponível a partir do Plano Profissional. Faça o upgrade!", "warning");
            setTimeout(() => App.renderizarMeuPlano(), 1500); return false;
        }
        if (funcionalidade === 'dossie' && plano !== 'Premium') {
            App.showToast("💎 Exclusivo do Plano Premium. Faça o upgrade para aceder ao Dossiê Executivo!", "warning");
            setTimeout(() => App.renderizarMeuPlano(), 1500); return false;
        }
        return true;
    },

    api: async (endpoint, method = 'GET', body = null) => {
        const headers = { 'Content-Type': 'application/json' };
        const token = localStorage.getItem('token_acesso');
        if (token) { headers['Authorization'] = `Bearer ${token}`; }
        
        const options = { method, headers }; 
        if (body) options.body = JSON.stringify(body);
        
        try {
            const response = await fetch(`${API_URL}${endpoint}`, options);
            
            let data;
            try { data = await response.json(); } catch(e) { data = null; }

            if (!response.ok) { 
                if ((response.status === 401 || response.status === 403) && !endpoint.startsWith('/auth/')) { 
                    App.showToast("Sessão expirada. Faça login novamente.", "warning");
                    App.logout(); 
                }
                return data || { error: `Erro HTTP: ${response.status}` };
            }
            
            if (method !== 'GET' && App.usuario) setTimeout(App.verificarNotificacoes, 800);
            return data;
        } catch (error) { 
            console.error("Erro no fetch:", error);
            return method === 'GET' ? [] : { error: 'Falha na conexão. Verifique a internet.' }; 
        }
    },

    setTitulo: (texto) => { const el = document.getElementById('titulo-pagina'); if(el) el.innerText = texto; },
    toggleSub: (id) => { 
        document.querySelectorAll('.submenu').forEach(el => { if (el.id !== id) el.style.display = 'none'; });
        const el = document.getElementById(id); if (el) el.style.display = (el.style.display === 'block') ? 'none' : 'block';
    },
    fecharModal: () => {
        document.getElementById('modal-overlay').style.display = 'none';
        const btn = document.querySelector('.btn-confirm');
        if(btn) { btn.style.display = 'inline-flex'; btn.setAttribute('onclick', 'App.salvarCadastro()'); btn.innerHTML = "💾 Salvar Registro"; }
    },

    // =========================================================
    // MÁSCARAS DE FORMATAÇÃO
    // =========================================================
    mascaraCNPJ: (i) => { let v = i.value.replace(/\D/g,""); v=v.replace(/^(\d{2})(\d)/,"$1.$2"); v=v.replace(/^(\d{2})\.(\d{3})(\d)/,"$1.$2.$3"); v=v.replace(/\.(\d{3})(\d)/,".$1/$2"); v=v.replace(/(\d{4})(\d)/,"$1-$2"); i.value = v; },
    mascaraCPF: (i) => { let v = i.value.replace(/\D/g, ""); v = v.replace(/(\d{3})(\d)/, "$1.$2"); v = v.replace(/(\d{3})(\d)/, "$1.$2"); v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2"); i.value = v; },
   mascaraCelular: (i) => { 
        let v = i.value;
        if (v.startsWith('+')) {
            // Formato Internacional: Mantém o '+' e os números livres
            i.value = '+' + v.replace(/\D/g, "");
        } else {
            // Formato Brasil: Aplica a máscara padrão (XX) XXXXX-XXXX
            v = v.replace(/\D/g, ""); 
            v = v.replace(/^(\d{2})(\d)/g, "($1) $2"); 
            v = v.replace(/(\d)(\d{4})$/, "$1-$2"); 
            i.value = v; 
        }
    },
    mascaraCEP: (i) => { let v = i.value.replace(/\D/g, ""); v = v.replace(/^(\d{5})(\d)/, "$1-$2"); i.value = v; },
    mascaraValor: (i) => { let v = i.value.replace(/\D/g, ""); v = (v / 100).toFixed(2) + ""; i.value = v; },

    // =========================================================
    // ARRANQUE E LOGIN COM FILTRO DE BLOQUEIO ABSOLUTO
    // =========================================================
    init: async () => {
        localStorage.removeItem('escola_tema'); localStorage.removeItem('escola_atalhos'); localStorage.removeItem('escola_perfil');
        const salvo = localStorage.getItem('usuario_logado'); const token = localStorage.getItem('token_acesso'); const bioId = localStorage.getItem('escola_bio_id');

        if (salvo && token) { 
            App.usuario = JSON.parse(salvo); 
            App.aplicarTemaSalvo();

            const keyAtalhos = App.getTenantKey('escola_atalhos');
            if (!localStorage.getItem(keyAtalhos)) { localStorage.setItem(keyAtalhos, JSON.stringify(['novo_aluno','fin_carne','ped_chamada','ped_notas','ped_plan','ped_bol'])); }

            let escola = await App.api('/escola');
            if (!escola || escola.error) escola = JSON.parse(localStorage.getItem(App.getTenantKey('escola_perfil'))) || {};

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
            setInterval(() => {
                const telaSistema = document.getElementById('tela-sistema');
                if (App.usuario && telaSistema && telaSistema.style.display !== 'none') {
                    App.verificarNotificacoes();
                    App.carregarDadosEscola(); 
                }
            }, 300000); 
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
                localStorage.setItem('token_acesso', res.token);
                
                if (typeof gtag === 'function') gtag('event', 'login', { method: 'Sistema PTT' });
                
                App.aplicarTemaSalvo();
                const keyAtalhos = App.getTenantKey('escola_atalhos');
                if (!localStorage.getItem(keyAtalhos)) { localStorage.setItem(keyAtalhos, JSON.stringify(['novo_aluno','fin_carne','ped_chamada','ped_notas','ped_plan','ped_bol'])); }

                let escola = await App.api('/escola');
                if (!escola || escola.error) escola = JSON.parse(localStorage.getItem(App.getTenantKey('escola_perfil'))) || {};

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
        document.getElementById('tela-login').style.display = 'none';
        document.getElementById('tela-sistema').style.display = 'flex';
        const el = document.getElementById('user-name');
        if(el && App.usuario) el.innerText = App.usuario.nome || App.usuario.login;
        App.aplicarPermissoesDeUsuario(); 
        
        await App.carregarDadosEscola();
        
        if (document.getElementById('tela-sistema').style.display !== 'none') {
            App.renderizarInicio();
        }
    },

   logout: () => {
        document.documentElement.removeAttribute('style');
        localStorage.removeItem('usuario_logado'); localStorage.removeItem('token_acesso'); App.usuario = null;
        
        const inUser = document.getElementById('login-user'); if(inUser) inUser.value = ''; 
        const inPass = document.getElementById('login-pass'); if(inPass) inPass.value = '';
        
        // 🧹 PROTOCOLO DE FAXINA TOTAL: Fechar todos os modais, menus e overlays pendentes
        const modalPadrao = document.getElementById('modal-overlay'); if(modalPadrao) modalPadrao.style.display = 'none';
        const modalInst = document.getElementById('modal-cadastro-inst'); if(modalInst) modalInst.style.display = 'none';
        const modalRec = document.getElementById('modal-recuperacao-senha'); if(modalRec) modalRec.style.display = 'none';
        
        const sidebar = document.querySelector('.sidebar'); if(sidebar) sidebar.classList.remove('active');
        const mobileOverlay = document.querySelector('.mobile-overlay'); if(mobileOverlay) mobileOverlay.classList.remove('active');
        const notiDropdown = document.getElementById('noti-dropdown'); if(notiDropdown) notiDropdown.classList.remove('active');

        // Esconde o sistema e mostra o login
        document.getElementById('tela-sistema').style.display = 'none';
        const telaLogin = document.getElementById('tela-login'); 
        if(telaLogin) telaLogin.style.display = telaLogin.classList.contains('login-wrapper') ? 'flex' : 'block';

        const blockBox = document.getElementById('box-bloqueio-conta');
        if(blockBox) blockBox.style.display = 'none';
        
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
        
        // Cria a janela de popup dinamicamente se não existir
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-recuperacao-senha';
            modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; justify-content:center; align-items:center; z-index:9999;';
            modal.innerHTML = `
                <div style="background:#fff; padding:30px; border-radius:12px; max-width:400px; width:90%; text-align:center; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
                    <span style="font-size: 40px; display:block; margin-bottom:10px;">🔐</span>
                    <h3 style="margin-top:0; color:#2c3e50;">Recuperar Senha</h3>
                    <p style="font-size:13px; color:#666; margin-bottom:20px;">Insira o e-mail registado na sua conta. Vamos gerar uma nova senha temporária e enviar para lá.</p>
                    <input type="email" id="recuperar-email-input" placeholder="O seu e-mail de acesso..." style="width:100%; padding:12px; border-radius:6px; border:1px solid #ccc; margin-bottom:15px; text-align:center;">
                    <button class="btn-primary" onclick="App.enviarRecuperacaoSenha()" style="width:100%; justify-content:center; padding:12px; margin-bottom:10px; border:none; border-radius:6px;">✉️ Enviar Nova Senha</button>
                    <button class="btn-cancel" onclick="document.getElementById('modal-recuperacao-senha').style.display='none'" style="width:100%; justify-content:center; padding:10px; background:transparent; border:1px solid #ccc; border-radius:6px; cursor:pointer;">Cancelar e Voltar</button>
                </div>
            `;
            document.body.appendChild(modal);
        }
        document.getElementById('recuperar-email-input').value = '';
        modal.style.display = 'flex';
    },

    enviarRecuperacaoSenha: async () => {
        const email = document.getElementById('recuperar-email-input').value.trim();
        if(!email || !email.includes('@')) return App.showToast("Por favor, introduza um e-mail válido.", "warning");

        const btn = document.querySelector('#modal-recuperacao-senha .btn-primary');
        const txtOriginal = btn.innerText;
        btn.innerText = "A enviar e-mail... ⏳"; btn.disabled = true;

        try {
            const res = await App.api('/auth/recuperar-senha', 'POST', { email });
            if (res && res.success) {
                App.showToast("Sucesso! Verifique a sua caixa de entrada (e o Spam).", "success");
                document.getElementById('modal-recuperacao-senha').style.display = 'none';
            } else {
                App.showToast(res.error || "E-mail não encontrado no sistema.", "error");
            }
        } catch(e) {
            App.showToast("Erro ao tentar comunicar com o servidor.", "error");
        } finally {
            btn.innerText = txtOriginal; btn.disabled = false;
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
},

// =========================================================
// CADASTRO DE NOVA INSTITUIÇÃO (LEADS COM RASTREAMENTO)
// =========================================================
abrirTelaCadastroInst: () => { document.getElementById('modal-cadastro-inst').style.display = 'flex'; App.voltarEtapa1(); },
fecharModalInst: () => { document.getElementById('modal-cadastro-inst').style.display = 'none'; },
voltarEtapa1: () => { document.getElementById('etapa-1-email').style.display = 'block'; document.getElementById('etapa-2-validacao').style.display = 'none'; document.getElementById('etapa-3-sucesso').style.display = 'none'; },

enviarCodigoInst: async () => {
    const email = document.getElementById('novo-inst-email').value; const btn = document.querySelector('#etapa-1-email button');
    if(!email || !email.includes('@')) return App.showToast('Digite um e-mail válido.', 'error');
    const txt = btn.innerText; btn.innerText = "Enviando... ⏳"; btn.disabled = true;
    try {
        const res = await App.api('/auth/enviar-codigo', 'POST', { email });
        if(res && res.success) { App.showToast('Código enviado!', 'success'); document.getElementById('etapa-1-email').style.display = 'none'; document.getElementById('etapa-2-validacao').style.display = 'block'; } 
        else { App.showToast('Erro ao enviar e-mail.', 'error'); }
    } catch(e) { App.showToast('Erro de servidor.', 'error'); } finally { btn.innerText = txt; btn.disabled = false; }
},

validarCadastroInst: async () => {
    const email = document.getElementById('novo-inst-email').value; const codigo = document.getElementById('novo-inst-codigo').value.trim(); const pin = document.getElementById('novo-inst-pin').value.trim(); const btn = document.querySelector('#etapa-2-validacao button');
    if(!codigo || !pin) return App.showToast('Preencha Código e PIN.', 'error');
    const txt = btn.innerText; btn.innerText = "A Validar... ⏳"; btn.disabled = true;
    try {
        const res = await App.api('/auth/validar-cadastro', 'POST', { email, codigo, pin });
        if(res && res.success) { 
            document.getElementById('etapa-2-validacao').style.display = 'none'; document.getElementById('etapa-3-sucesso').style.display = 'block'; 
            if(typeof confetti === 'function') confetti(); 
            if (typeof gtag === 'function') gtag('event', 'generate_lead', { currency: 'BRL', value: 0.00, tipo_conta: 'App Gestão PTT' });
        } 
        else { App.showToast(res.error || 'Dados incorretos.', 'error'); }
    } catch(e) { App.showToast('Erro de servidor.', 'error'); } finally { btn.innerText = txt; btn.disabled = false; }
},

    // =========================================================
    // UTILITÁRIOS DA INTERFACE
    // =========================================================
    showToast: (mensagem, tipo = 'info') => {
        let container = document.getElementById('toast-container'); 
        if (!container) { 
            // Usando o nosso novo criador para fazer o container
            container = App.criarElemento('div', [], { id: 'toast-container' });
            document.body.appendChild(container); 
        }

        const iconStr = tipo === 'success' ? '✅' : (tipo === 'error' ? '❌' : (tipo === 'warning' ? '⚠️' : 'ℹ️'));

        // Fabricamos a caixa do Toast
        const toast = App.criarElemento('div', ['toast', tipo]);
        
        // Fabricamos o ícone
        const iconSpan = App.criarElemento('span', ['toast-icon'], {}, iconStr);
        
        // Fabricamos o texto da mensagem (O textContent torna-o super seguro automaticamente)
        const msgSpan = App.criarElemento('span', [], {}, mensagem);

        // Juntamos os blocos (Colocamos os spans dentro do toast, e o toast no container)
        toast.appendChild(iconSpan);
        toast.appendChild(msgSpan);
        container.appendChild(toast);

        // A animação continua igual
        setTimeout(() => { 
            toast.style.animation = 'fadeOut 0.5s ease forwards'; 
            setTimeout(() => toast.remove(), 500); 
        }, 3000);
    },

    setupMobileMenu: () => {
        const header = document.querySelector('header');
        if(header && !document.getElementById('btn-mobile-menu')) {
            const btn = document.createElement('button'); btn.id = 'btn-mobile-menu'; btn.className = 'mobile-menu-btn'; btn.innerHTML = '☰';
            btn.onclick = () => { document.querySelector('.sidebar').classList.toggle('active'); const overlay = document.querySelector('.mobile-overlay') || App.criarOverlay(); overlay.classList.toggle('active'); };
            header.insertBefore(btn, header.firstChild); App.criarOverlay();
        }
    },
    criarOverlay: () => {
        if(document.querySelector('.mobile-overlay')) return document.querySelector('.mobile-overlay');
        const overlay = document.createElement('div'); overlay.className = 'mobile-overlay';
        overlay.onclick = () => { document.querySelector('.sidebar').classList.remove('active'); overlay.classList.remove('active'); };
        document.body.appendChild(overlay); return overlay;
    },

    aplicarTemaSalvo: () => { 
        const tema = JSON.parse(localStorage.getItem(App.getTenantKey('escola_tema')));
        if (tema) {
            const root = document.documentElement;
            if(tema.sidebarBg) root.style.setProperty('--sidebar-bg', tema.sidebarBg); 
            if(tema.sidebarText) root.style.setProperty('--sidebar-text', tema.sidebarText); 
            if(tema.bodyBg) root.style.setProperty('--body-bg', tema.bodyBg); 
            if(tema.textMain) root.style.setProperty('--text-main', tema.textMain); 
            if(tema.cardBg) root.style.setProperty('--card-bg', tema.cardBg); 
            if(tema.cardText) root.style.setProperty('--card-text', tema.cardText);
            if(tema.zoomLevel) root.style.setProperty('--zoom-level', tema.zoomLevel);
        } else { document.documentElement.removeAttribute('style'); }
    },

    UI: {
        card: (titulo, subtitulo, conteudo, maxWidth = '100%') => `<div class="card" style="max-width: ${maxWidth}; margin: 0 auto;">${titulo ? `<h3 style="margin-top:0; color:var(--card-text); border-bottom:1px solid #eee; padding-bottom:10px;">${titulo}</h3>` : ''}${subtitulo ? `<p style="color:#666; margin-bottom:20px; font-size:13px;">${subtitulo}</p>` : ''}${conteudo}</div>`,
        input: (label, id, value = '', placeholder = '', tipo = 'text', extraAttr = '') => `<div class="input-group"><label>${label}</label><input type="${tipo}" id="${id}" value="${value}" placeholder="${placeholder}" ${extraAttr}></div>`,
        botao: (texto, acao, tipo = 'primary', icone = '') => { const btnClass = tipo === 'primary' ? 'btn-primary' : (tipo === 'cancel' ? 'btn-cancel' : 'btn-edit'); return `<button class="${btnClass}" style="width: auto; padding: 10px 20px;" onclick="${acao}">${icone} ${texto}</button>`; },
        colorPicker: (label, valor, varCss) => `<div class="theme-row"><label>${label}</label><input type="color" value="${valor}" oninput="App.previewCor('${varCss}', this.value)"></div>`
    },

    renderizarConfiguracoesAparencia: () => { 
        App.setTitulo("Aparência do Sistema"); const div = document.getElementById('app-content'); const styles = getComputedStyle(document.documentElement);
        const temaSalvo = JSON.parse(localStorage.getItem(App.getTenantKey('escola_tema'))) || {};
        
        const c = { sbBg: styles.getPropertyValue('--sidebar-bg').trim(), sbTxt: styles.getPropertyValue('--sidebar-text').trim(), bdBg: styles.getPropertyValue('--body-bg').trim(), txtMain: styles.getPropertyValue('--text-main').trim(), cdBg: styles.getPropertyValue('--card-bg').trim(), cdTxt: styles.getPropertyValue('--card-text').trim(), zoomAtual: temaSalvo.zoomLevel || '1' };
        const atalhosSalvos = JSON.parse(localStorage.getItem(App.getTenantKey('escola_atalhos'))) || [];

        const blocoCores = `<div class="theme-section"><h4 style="margin:0 0 15px 0;">1. Cores do Sistema</h4><div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px;"><div><div style="font-weight:bold; margin-bottom:10px;">Menu Lateral</div>${App.UI.colorPicker('Fundo:', c.sbBg, '--sidebar-bg')}${App.UI.colorPicker('Texto:', c.sbTxt, '--sidebar-text')}</div><div><div style="font-weight:bold; margin-bottom:10px;">Área Principal</div>${App.UI.colorPicker('Fundo:', c.bdBg, '--body-bg')}${App.UI.colorPicker('Texto:', c.txtMain, '--text-main')}</div><div><div style="font-weight:bold; margin-bottom:10px;">Dashboard / Cards</div>${App.UI.colorPicker('Fundo:', c.cdBg, '--card-bg')}${App.UI.colorPicker('Texto:', c.cdTxt, '--card-text')}</div></div></div>`;
        const blocoAtalhos = `<div class="theme-section" style="margin-top:20px;"><h4 style="margin:0 0 5px 0;">2. Atalhos no Dashboard</h4><p style="font-size:12px; color:#666; margin-bottom:15px;">Selecione os atalhos (Mínimo: 1 | Máximo: 8).</p><div class="shortcut-selector" style="display:flex; flex-wrap:wrap; gap:10px;">${LISTA_FUNCIONALIDADES.map(f => `<label class="shortcut-item" style="background:#f9f9f9; padding:8px 12px; border-radius:6px; cursor:pointer;"><input type="checkbox" class="sc-check" value="${f.id}" ${atalhosSalvos.includes(f.id) ? 'checked' : ''} onchange="App.validarLimiteAtalhos(this)"> ${f.icon} ${f.nome}</label>`).join('')}</div></div>`;
        const blocoFonte = `<div class="theme-section" style="margin-top:20px;"><h4 style="margin:0 0 5px 0;">3. Tamanho da Fonte (Zoom)</h4><p style="font-size:12px; color:#666; margin-bottom:15px;">Ajuste o tamanho geral para facilitar a leitura.</p><div class="input-group" style="max-width: 300px;"><select id="theme-zoom" style="font-weight:bold; cursor:pointer;" onchange="App.previewZoom(this.value)"><option value="0.9" ${c.zoomAtual === '0.9' ? 'selected' : ''}>Pequena (90%)</option><option value="1" ${c.zoomAtual === '1' ? 'selected' : ''}>Padrão (100%)</option><option value="1.1" ${c.zoomAtual === '1.1' ? 'selected' : ''}>Maior (110%)</option></select></div></div>`;
        const blocoBotoes = `<div style="display:flex; gap:10px; margin-top: 25px; flex-wrap:wrap;">${App.UI.botao('💾 SALVAR ALTERAÇÕES', 'App.salvarTema()', 'primary', '')}${App.UI.botao('✖️ RESTAURAR PADRÃO', 'App.resetarTema()', 'cancel', '')}</div>`;
        div.innerHTML = App.UI.card('🎨 Personalizar Aparência', 'Personalize as cores, zoom e atalhos da tela inicial.', blocoCores + blocoFonte + blocoAtalhos + blocoBotoes, '800px');
    },

    previewCor: (varName, color) => { document.documentElement.style.setProperty(varName, color); },
    previewZoom: (valor) => { document.documentElement.style.setProperty('--zoom-level', valor); },
    validarLimiteAtalhos: (checkbox) => { const checked = document.querySelectorAll('.sc-check:checked'); if (checked.length > 8) { checkbox.checked = false; App.showToast("O limite máximo é de 8 atalhos.", "warning"); } },
    
    salvarTema: () => { 
        const root = getComputedStyle(document.documentElement);
        const tema = { sidebarBg: root.getPropertyValue('--sidebar-bg').trim(), sidebarText: root.getPropertyValue('--sidebar-text').trim(), bodyBg: root.getPropertyValue('--body-bg').trim(), textMain: root.getPropertyValue('--text-main').trim(), cardBg: root.getPropertyValue('--card-bg').trim(), cardText: root.getPropertyValue('--card-text').trim(), zoomLevel: document.getElementById('theme-zoom').value };
        const atalhos = Array.from(document.querySelectorAll('.sc-check:checked')).map(cb => cb.value);
        if(atalhos.length === 0) return App.showToast("Selecione pelo menos 1 atalho.", "warning"); 
        if(atalhos.length > 8) return App.showToast("Máximo de 8 atalhos permitidos.", "warning");
        localStorage.setItem(App.getTenantKey('escola_tema'), JSON.stringify(tema)); localStorage.setItem(App.getTenantKey('escola_atalhos'), JSON.stringify(atalhos)); 
        App.aplicarTemaSalvo(); App.showToast("Configurações salvas com sucesso! 🎉", "success"); setTimeout(() => { App.renderizarInicio(); }, 800);
    },
    
    resetarTema: () => { 
        if(!confirm("Deseja restaurar as cores e fontes padrão?")) return; 
        localStorage.removeItem(App.getTenantKey('escola_tema')); localStorage.setItem(App.getTenantKey('escola_atalhos'), JSON.stringify(['novo_aluno','fin_carne','ped_chamada','ped_notas','ped_plan','ped_bol'])); 
        document.documentElement.removeAttribute('style'); App.showToast("Aparência restaurada com sucesso! 🔄", "success"); setTimeout(() => { location.reload(); }, 1000);
    },

    // =========================================================
    // VISÃO GERAL (DASHBOARD INTELIGENTE COM FILTRO DE CARGO)
    // =========================================================
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
                const func = LISTA_FUNCIONALIDADES.find(f => f.id === id); 
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
                        <div style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:10px; padding-right:5px;">${htmlInadimplentes}</div>
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
        const msg = `🔔 LEMBRETE DE VENCIMENTO\nOlá, ${nomeAluno}!\n\nConsta no nosso sistema que a sua mensalidade venceu no dia ${dataVencimento}. Para realizar o pagamento de forma rápida, basta enviar o valor de *R$ ${valorFmt}* para a chave PIX abaixo:\n\n*Instituição:* ${nomeEscola}\n*Banco:* ${bancoPix}\n*Chave PIX:* ${chavePix}\n\nObs.: Após o pagamento, por favor, envie o comprovativo por aqui para podermos dar baixa no sistema.\n\n🙏 Agradecemos desde já e desejamos-lhe um excelente dia! 😉✅`;
        
        window.open(`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`, '_blank');
    },    

// =========================================================
    // ROTEAMENTO DE TELAS E BLOQUEIO DE CARGOS
    // =========================================================
    renderizarTela: async (tela) => {
        if (!App.usuario && tela !== 'login') { App.showToast("Sessão expirada. Faça login novamente.", "error"); App.logout(); return; }
        if(document.querySelector('.sidebar')) document.querySelector('.sidebar').classList.remove('active');
        if(document.querySelector('.mobile-overlay')) document.querySelector('.mobile-overlay').classList.remove('active');

        const tipoUtil = App.usuario ? App.usuario.tipo : 'Gestor';
        const bloqueadoProf = ['mensalidades', 'inadimplencia', 'configuracoes', 'aparencia', 'backup', 'plano', 'financeiro', 'dossie', 'documentos', 'ficha', 'conta'];
        const bloqueadoSecr = ['configuracoes', 'aparencia', 'backup', 'plano', 'dossie', 'conta'];

        if (tipoUtil === 'Professor' && bloqueadoProf.includes(tela)) {
            App.showToast("🚫 Acesso restrito. Perfil de Professor não tem permissão para esta área.", "error"); return App.renderizarInicio();
        }
        if (tipoUtil === 'Secretaria' && bloqueadoSecr.includes(tela)) {
            App.showToast("🚫 Acesso restrito. Perfil de Secretaria não tem permissão para esta área.", "error"); return App.renderizarInicio();
        }

        if (typeof gtag === 'function') gtag('event', 'page_view', { page_title: 'Tela: ' + tela, page_location: window.location.href + '#' + tela, page_path: '/' + tela });

        if (tela === 'chamada') { App.setTitulo("Chamada"); App.renderizarChamadaPro(); }
        else if (tela === 'avaliacoes') { App.setTitulo("Notas"); App.renderizarAvaliacoesPro(); }
        else if (tela === 'calendario') { App.setTitulo("Calendário"); App.renderizarCalendarioPro(); }
        else if (tela === 'planejamento') { App.setTitulo("Planejamento"); App.renderizarPlanejamentoPro(); }
        else if (tela === 'boletins') { App.setTitulo("Boletim"); App.renderizarBoletimVisual(); }
        else if (tela === 'mensalidades') { App.setTitulo("Financeiro"); App.renderizarFinanceiroPro(); }
        else if (tela === 'inadimplencia') { App.setTitulo("Inadimplência"); App.renderizarInadimplencia(); } 
        else if (tela === 'configuracoes') { App.setTitulo("Configurações"); App.renderizarConfiguracoes(); }
        else if (tela === 'aparencia') { App.renderizarConfiguracoesAparencia(); } 
        else if (tela === 'backup') { App.renderizarBackup(); }
        else if (tela === 'plano') { App.renderizarMeuPlano(); } 
        else { App.renderizarInicio(); }
    },
    
    renderizarConfig: (t) => { if(t==='perfil') App.renderizarTela('configuracoes'); else if(t==='aparencia') App.renderizarTela('aparencia'); else if(t==='conta') App.renderizarMinhaConta(); else if(t==='backup') App.renderizarTela('backup'); },
    renderizarRelatorio: (t) => { if (t === 'dossie' && !App.verificarPermissao('dossie')) return; if (typeof App.renderizarRelatorioModulo === 'function') App.renderizarRelatorioModulo(t); },

    // =========================================================
    // 💎 O MEU PLANO (PAINEL INTERNO)
    // =========================================================
    renderizarMeuPlano: () => {
        App.setTitulo("Gerenciar Assinatura");
        const div = document.getElementById('app-content');
        const planoAtual = App.getPlanoAtual();
        
        let diasRestantes = 0;
        const escola = JSON.parse(localStorage.getItem(App.getTenantKey('escola_perfil'))) || {};
        const hojeTime = new Date().getTime();
        
        // Pega os dias restantes diretos da nova arquitetura de expiração
        if (escola.dataExpiracao) {
            const diffTime = new Date(escola.dataExpiracao).getTime() - hojeTime;
            diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        } else if (escola.dataCriacao) {
            const diffTime = Math.abs(hojeTime - new Date(escola.dataCriacao).getTime());
            diasRestantes = (planoAtual === 'Teste' ? 7 : 30) - Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }
        if(diasRestantes < 0) diasRestantes = 0;

        let corPlano = planoAtual === 'Premium' ? '#f39c12' : (planoAtual === 'Profissional' ? '#3498db' : '#27ae60');
        const infoPlano = planoAtual === 'Teste' 
            ? `<strong style="color:var(--warning); background:rgba(243,156,18,0.1); padding:8px 20px; border-radius:20px; border:2px solid var(--warning); font-size:16px;">⏳ Plano Teste (${diasRestantes} dias restantes)</strong>` 
            : `<strong style="color:${corPlano}; background:rgba(0,0,0,0.02); padding:8px 20px; border-radius:20px; border:2px solid ${corPlano}; font-size:16px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">💎 PLANO ATUAL: ${App.escapeHTML(planoAtual).toUpperCase()} (${diasRestantes} dias)</strong>`;
        
        div.innerHTML = `
            <div class="card" style="text-align:center; padding: 40px 20px; border-top: 5px solid var(--accent);">
                <h2 style="margin: 0 0 15px 0; color: var(--card-text);">Evolua a sua Instituição</h2>
                <div style="margin-bottom: 30px;">${infoPlano}</div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; max-width: 500px; margin: 0 auto; border: 1px solid #eee;">
                    <h4 style="margin: 0 0 15px 0; color: #333;">Já efetuou o pagamento?</h4>
                    <div style="display:flex; gap:10px; flex-wrap:wrap;">
                        <input type="text" id="input-novo-pin" placeholder="Insira a sua Chave de Ativação (PIN)" style="flex:1; min-width: 200px; padding:12px; border-radius:6px; border:1px solid #ccc; text-align:center; letter-spacing:2px; font-weight:bold; font-size:16px;">
                        
                        <button class="btn-primary" style="width:auto; margin:0;" onclick="App.ativarNovoPlano(event)">Validar PIN</button>
                    </div>
                    <p style="font-size:11px; color:#999; margin: 10px 0 0 0;">O PIN é enviado para o seu e-mail imediatamente após a confirmação do pagamento.</p>
                </div>
            </div>

            <h3 style="text-align: center; color: var(--card-text); margin-top: 40px;">Escolha o pacote ideal para a sua escola</h3>
            
            <div class="pricing-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:20px; margin-top:20px;">
                <div class="pricing-card" style="background:#fff; border:1px solid #eee; border-radius:12px; padding:30px; text-align:center; box-shadow:0 4px 15px rgba(0,0,0,0.05);">
                    <h3 style="margin-top:0; color:#333; font-size:22px;">Essencial</h3>
                    <div style="font-size:32px; font-weight:bold; color:#27ae60; margin:15px 0;">R$ 97<span style="font-size:14px; color:#999;">/mês</span></div>
                    <p style="color:#666; font-size:13px; margin-bottom:20px;">Para pequenos cursos e professores particulares.</p>
                    <ul style="list-style:none; padding:0; margin:0 0 25px 0; text-align:left; font-size:14px; color:#555;">
                        <li style="margin-bottom:10px;">✅ Até 20 Alunos Ativos</li>
                        <li style="margin-bottom:10px;">✅ 2 Acessos (Gestor + 1 Equipa)</li>
                        <li style="margin-bottom:10px;">✅ Gestão Pedagógica</li>
                        <li style="margin-bottom:10px;">✅ Controle Financeiro</li>
                        <li style="margin-bottom:10px; color:#ccc;">❌ Cobrança via WhatsApp</li>
                        <li style="color:#ccc;">❌ Dossiê Executivo</li>
                    </ul>
                    <button class="btn-primary" style="width:100%; background:transparent; color:#27ae60; border:2px solid #27ae60; justify-content:center;" onclick="App.comprarPlano('Essencial', 'https://mpago.la/2LcgaA1')">Assinar Essencial</button>
                </div>

                <div class="pricing-card featured" style="background:#fff; border:2px solid #3498db; border-radius:12px; padding:30px; text-align:center; box-shadow:0 10px 30px rgba(52,152,219,0.15); position:relative; transform:scale(1.02);">
                    <div style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#3498db; color:#fff; font-size:11px; font-weight:bold; padding:4px 12px; border-radius:20px; text-transform:uppercase; letter-spacing:1px;">Mais Vendido</div>
                    <h3 style="margin-top:0; color:#333; font-size:22px;">Profissional</h3>
                    <div style="font-size:32px; font-weight:bold; color:#3498db; margin:15px 0;">R$ 147<span style="font-size:14px; color:#999;">/mês</span></div>
                    <p style="color:#666; font-size:13px; margin-bottom:20px;">A solução completa para acabar com a inadimplência.</p>
                    <ul style="list-style:none; padding:0; margin:0 0 25px 0; text-align:left; font-size:14px; color:#555;">
                        <li style="margin-bottom:10px;">✅ Até 80 Alunos Ativos</li>
                        <li style="margin-bottom:10px;">✅ 4 Acessos (Gestor + 3 Equipa)</li>
                        <li style="margin-bottom:10px;">✅ Gestão Pedagógica</li>
                        <li style="margin-bottom:10px;">✅ Financeiro Completo</li>
                        <li style="margin-bottom:10px;">✅ <strong>Cobrança WhatsApp</strong></li>
                        <li style="color:#ccc;">❌ Dossiê Executivo</li>
                    </ul>
                    <button class="btn-primary" style="width:100%; background:#3498db; justify-content:center;" onclick="App.comprarPlano('Profissional', 'https://mpago.la/1KmmwZf')">Assinar Profissional</button>
                </div>

                <div class="pricing-card" style="background:#fff; border:1px solid #eee; border-radius:12px; padding:30px; text-align:center; box-shadow:0 4px 15px rgba(0,0,0,0.05);">
                    <h3 style="margin-top:0; color:#333; font-size:22px;">Premium</h3>
                    <div style="font-size:32px; font-weight:bold; color:#f39c12; margin:15px 0;">R$ 297<span style="font-size:14px; color:#999;">/mês</span></div>
                    <p style="color:#666; font-size:13px; margin-bottom:20px;">Para escolas estruturadas e sem limites operacionais.</p>
                    <ul style="list-style:none; padding:0; margin:0 0 25px 0; text-align:left; font-size:14px; color:#555;">
                        <li style="margin-bottom:10px;">✅ Alunos Ilimitados</li>
                        <li style="margin-bottom:10px;">✅ Acessos Ilimitados</li>
                        <li style="margin-bottom:10px;">✅ Gestão Pedagógica</li>
                        <li style="margin-bottom:10px;">✅ Financeiro Completo</li>
                        <li style="margin-bottom:10px;">✅ Cobrança WhatsApp</li>
                        <li>✅ <strong>Dossiê Executivo</strong></li>
                    </ul>
                    <button class="btn-primary" style="width:100%; background:transparent; color:#f39c12; border:2px solid #f39c12; justify-content:center;" onclick="App.comprarPlano('Premium', 'https://mpago.la/1DNyscL')">Assinar Premium</button>
                </div>
            </div>
        `;
    },

    comprarPlano: (nomePlano, linkCheckout) => {
        App.showToast(`A redirecionar para o pagamento seguro do plano ${nomePlano}...`, "info");
        setTimeout(() => { window.open(linkCheckout, '_blank'); }, 1500);
    },

    // 🔓 RENOVAÇÃO INSTANTÂNEA DE 30 DIAS DENTRO DO SISTEMA
    ativarNovoPlano: async (event) => {
        if (event) event.preventDefault(); 

        const inputElement = document.getElementById('input-novo-pin');
        if (!inputElement) return;

        const pin = inputElement.value.trim().toUpperCase(); 
        if(!pin) return App.showToast("Por favor, insira o PIN recebido no e-mail.", "warning");

        const btn = document.querySelector('button[onclick="App.ativarNovoPlano(event)"]');
        const txt = btn ? btn.innerText : 'Validar PIN'; 
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
                    App.showToast(res.error || "PIN em formato inválido.", "error"); 
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
            
            App.showToast(`🎉 PIN validado com sucesso! Plano atualizado para ${novoPlano}. A iniciar...`, "success");
            inputElement.value = '';
            
            await App.carregarDadosEscola();
            App.renderizarInicio();
        } catch(e) { 
            App.showToast("Erro ao comunicar com a base de dados.", "error"); 
        } finally { 
            if(btn) { btn.innerText = txt; btn.disabled = false; } 
        }
    },

    // 🔗 LINK EXCLUSIVO DE MATRÍCULA
    copiarLinkMatricula: () => {
        const token = localStorage.getItem('token_acesso');
        if(!token) return App.showToast("Erro: Sessão inválida.", "error");

        try {
            // Decodifica o token para pegar o ID exato da escola no banco de dados
            const payload = JSON.parse(atob(token.split('.')[1]));
            const meuEscolaId = payload.escolaId;

            // Monta o link considerando a URL atual do navegador
            const linkBase = window.location.origin; 
            const urlPath = window.location.pathname.replace('/index.html', '').replace('/app.html', '');
            const linkExclusivo = `${linkBase}${urlPath}/matricula.html?escola=${meuEscolaId}`;

            // Tenta copiar silenciosamente
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(linkExclusivo).then(() => {
                    App.showToast("✅ Link copiado com sucesso! Envie para os alunos.", "success");
                }).catch(() => {
                    prompt("Copie o seu link manualmente abaixo:", linkExclusivo);
                });
            } else {
                // Fallback para navegadores mais antigos
                prompt("Copie o seu link manualmente abaixo:", linkExclusivo);
            }
        } catch(e) {
            App.showToast("Erro ao gerar o link.", "error");
        }
    },

    abrirModalCadastro: async (tipo, id) => { 
        if (!id && (tipo === 'aluno')) {
            const podeCadastrar = await App.verificarLimites('aluno');
            if (!podeCadastrar) return; 
        }
        if (typeof App.abrirModalCadastroModulo === 'function') { App.abrirModalCadastroModulo(tipo, id); } 
    },

    abrirRelatorioFrequencia: async (idAluno, nomeAluno) => {
        const modal = document.getElementById('modal-overlay'); if(modal) modal.style.display = 'flex';
        document.getElementById('modal-titulo').innerText = `Frequência Escolar: ${App.escapeHTML(nomeAluno)}`;
        document.getElementById('modal-form-content').innerHTML = '<p style="text-align:center; padding:20px; color:#666;">A processar o planejamento atual... ⏳</p>';
        
        const btnConfirm = document.querySelector('.btn-confirm');
        if(btnConfirm) btnConfirm.style.display = 'none'; 

        // 🧠 Guardamos o contexto na memória global para navegar entre Ativo/Arquivado
        App.contextoFrequencia = { idAluno, nomeAluno };
        await App.renderizarFrequenciaView('ativo');
    },

    // 🚀 NOVA FUNÇÃO: O MOTOR DO RELÓGIO (Ativos vs Arquivados)
    renderizarFrequenciaView: async (modo, idPlanoAlvo = null) => {
        const { idAluno, nomeAluno } = App.contextoFrequencia;
        const content = document.getElementById('modal-form-content');

        try {
            // 🚀 MAGIA DA PERFORMANCE: CACHE DE MEMÓRIA
            if (!App.contextoFrequencia.dadosCache) {
                const [chamadasFetch, planejamentosFetch] = await Promise.all([App.api('/chamadas'), App.api('/planejamentos')]);
                App.contextoFrequencia.dadosCache = { chamadas: chamadasFetch, planejamentos: planejamentosFetch };
            }
            const chamadas = App.contextoFrequencia.dadosCache.chamadas;
            const planejamentos = App.contextoFrequencia.dadosCache.planejamentos;

            const historico = chamadas.filter(c => c.idAluno === idAluno).sort((a,b) => new Date(b.data) - new Date(a.data));
            const planosAluno = planejamentos.filter(p => p.idAluno === idAluno);

            const planosAtivos = planosAluno.filter(p => p.status !== 'Arquivado');
            const planosArquivados = planosAluno.filter(p => p.status === 'Arquivado');

             // --- 🪄 GESTÃO DO RODAPÉ FIXO MÁGICO ---
            const btnCancelFixo = document.querySelector('#modal-overlay .btn-cancel');
            if (btnCancelFixo) {
                const rodape = btnCancelFixo.parentNode;
                
                // 1. Limpar botões injetados anteriormente
                document.querySelectorAll('.btn-modal-dinamico').forEach(b => b.remove());
                
                // 2. Garantir que se fechar o modal, os botões extra desaparecem
                if (!btnCancelFixo.dataset.limpezaAtiva) {
                    const onclickOriginal = btnCancelFixo.onclick;
                    btnCancelFixo.onclick = function(e) {
                        document.querySelectorAll('.btn-modal-dinamico').forEach(b => b.remove());
                        if (onclickOriginal) onclickOriginal.apply(this, arguments);
                    };
                    btnCancelFixo.dataset.limpezaAtiva = "true";
                }

                // 🖨️ INJETAR BOTÃO IMPRIMIR NA FRENTE DO CANCELAR
                if (modo === 'ativo' || modo === 'ver_arquivado') {
                    const btnPrint = document.createElement('button');
                    btnPrint.className = 'btn-modal-dinamico';
                    btnPrint.innerHTML = '🖨️ Imprimir';
                    btnPrint.style.cssText = 'background:#27ae60; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:bold; margin-right:10px; font-size: 14px; transition: background 0.2s ease;';
                    btnPrint.onmouseover = () => btnPrint.style.background = '#1e8449';
                    btnPrint.onmouseout = () => btnPrint.style.background = '#27ae60';
                    btnPrint.onclick = () => App.imprimirDossieFrequencia();
                    rodape.insertBefore(btnPrint, btnCancelFixo);
                }

                // 3. Injetar o botão correto com Efeitos Hover (UX) e Loading (ANTES DO CANCELAR)
                if (modo === 'ativo' && planosArquivados.length > 0) {
                    const btnArq = document.createElement('button');
                    btnArq.className = 'btn-modal-dinamico';
                    btnArq.innerHTML = '🗄️ Arquivados';
                    btnArq.style.cssText = 'background:#7f8c8d; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:bold; margin-right:10px; font-size: 14px; transition: background 0.2s ease, opacity 0.2s ease;';
                    btnArq.onmouseover = () => btnArq.style.background = '#95a5a6';
                    btnArq.onmouseout = () => btnArq.style.background = '#7f8c8d';
                    btnArq.onclick = (e) => {
                        e.target.innerHTML = '⏳ A abrir...'; e.target.style.opacity = '0.8';
                        setTimeout(() => App.renderizarFrequenciaView('lista_arquivados'), 10);
                    };
                    rodape.insertBefore(btnArq, btnCancelFixo);
                } else if (modo === 'lista_arquivados' || modo === 'ver_arquivado') {
                    const isLista = modo === 'lista_arquivados';
                    const btnVoltar = document.createElement('button');
                    btnVoltar.className = 'btn-modal-dinamico';
                    btnVoltar.innerHTML = isLista ? '⬅️ Voltar ao Atual' : '⬅️ Voltar à Lista';
                    btnVoltar.style.cssText = 'background:#3498db; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:bold; margin-right:10px; font-size: 14px; transition: background 0.2s ease, opacity 0.2s ease;';
                    btnVoltar.onmouseover = () => btnVoltar.style.background = '#2980b9';
                    btnVoltar.onmouseout = () => btnVoltar.style.background = '#3498db';
                    btnVoltar.onclick = (e) => {
                        e.target.innerHTML = '⏳ A voltar...'; e.target.style.opacity = '0.8';
                        setTimeout(() => App.renderizarFrequenciaView(isLista ? 'ativo' : 'lista_arquivados'), 10);
                    };
                    rodape.insertBefore(btnVoltar, btnCancelFixo);
                }
            }
            // ----------------------------------------            

            // 🗄️ MODO 1: EXIBIR LISTA DE ARQUIVADOS
            if (modo === 'lista_arquivados') {
                document.getElementById('modal-titulo').innerText = `🗄️ Histórico Arquivado: ${App.escapeHTML(nomeAluno)}`;

                if (planosArquivados.length === 0) {
                    content.innerHTML = `<p style="text-align:center; padding:30px; color:#999;">Nenhum planejamento arquivado encontrado para este aluno.</p>`;
                    return;
                }

                let listaHTML = planosArquivados.map(p => {
                    let periodo = "Sem datas registadas";
                    if (p.aulas && p.aulas.length > 0) {
                        periodo = `${p.aulas[0].data} até ${p.aulas[p.aulas.length-1].data}`;
                    }
                    return `
                    <div onclick="App.renderizarFrequenciaView('ver_arquivado', '${p.id}')" style="background:#f9f9f9; border:1px solid #eee; padding:15px; border-radius:8px; margin-bottom:10px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; transition: background 0.2s;" onmouseover="this.style.background='#f1f2f6'" onmouseout="this.style.background='#f9f9f9'">
                        <div>
                            <div style="font-weight:bold; color:#2c3e50; font-size:14px;">📄 ${App.escapeHTML(p.disciplina || 'Curso Geral')}</div>
                            <div style="font-size:12px; color:#7f8c8d; margin-top:4px;">📅 Período: ${periodo}</div>
                        </div>
                        <span style="font-size:20px; color:#aaa;">➡️</span>
                    </div>`;
                }).join('');

                content.innerHTML = `
                    <div style="max-height:50vh; overflow-y:auto; padding-right:10px;">
                        <p style="font-size:13px; color:#666; margin-bottom:15px; text-align:center;">Selecione um planejamento antigo para ver o dossiê de presenças.</p>
                        ${listaHTML}
                    </div>
                `;
                return;
            }

            // ⏱️ MODO 2: EXIBIR ESTATÍSTICAS (Ativo ou Visualizando um Arquivado)
            let planoFoco = null;
            let tituloModal = `Frequência Escolar: ${App.escapeHTML(nomeAluno)}`;

            if (modo === 'ativo') {
                planoFoco = planosAtivos.length > 0 ? planosAtivos[0] : null; 
            } else if (modo === 'ver_arquivado') {
                planoFoco = planosArquivados.find(p => p.id === idPlanoAlvo);
                tituloModal = `🗄️ Arquivo: ${App.escapeHTML(nomeAluno)}`;
            }

            document.getElementById('modal-titulo').innerText = tituloModal;

            const formatarDataIso = (dataBr) => dataBr.split('/').reverse().join('-');
            let chamadasFiltradas = historico;

            if (planoFoco && planoFoco.aulas && planoFoco.aulas.length > 0) {
                const datasPlanejadas = planoFoco.aulas.map(a => formatarDataIso(a.data)).sort();
                const dataInicio = datasPlanejadas[0];
                const dataFim = datasPlanejadas[datasPlanejadas.length - 1];
                chamadasFiltradas = historico.filter(c => c.data >= dataInicio && c.data <= dataFim);
            } else if (modo === 'ativo' && planosArquivados.length > 0) {
                const limitesArquivados = planosArquivados.map(p => {
                    if(!p.aulas || p.aulas.length === 0) return null;
                    const d = p.aulas.map(a => formatarDataIso(a.data)).sort();
                    return { inicio: d[0], fim: d[d.length-1] };
                }).filter(x => x);

                chamadasFiltradas = historico.filter(c => {
                    return !limitesArquivados.some(lim => c.data >= lim.inicio && c.data <= lim.fim);
                });
            }

            let minPresenca = 0; let minFalta = 0; let minJustificada = 0; let htmlMeses = '';
            
            if (chamadasFiltradas.length === 0) {
                htmlMeses = `<p style="text-align:center; padding:30px; color:#999; font-size:14px;">Nenhum registo de chamada encontrado para este ${modo === 'ativo' ? 'período letivo' : 'arquivo'}.</p>`;
            } else {
                const agrupado = {};
                const mesesNomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
                
                chamadasFiltradas.forEach(c => {
                    const d = new Date(c.data + 'T00:00:00');
                    const mesAno = `${mesesNomes[d.getMonth()]} de ${d.getFullYear()}`;
                    if (!agrupado[mesAno]) agrupado[mesAno] = [];
                    agrupado[mesAno].push(c);
                    
                    let mins = 0;
                    if (c.duracao) {
                        const [h, m] = c.duracao.split(':');
                        mins = (parseInt(h) || 0) * 60 + (parseInt(m) || 0);
                    }
                    
                    if (c.status === 'Presença' || c.status === 'Reposição') minPresenca += mins;
                    else if (c.status === 'Falta Justificada' || c.status === 'Justificada') minJustificada += mins;
                    else if (c.status === 'Falta') minFalta += mins;
                });
                
                for (const mes in agrupado) {
                    htmlMeses += `<div style="background:#f4f6f7; padding:10px 15px; margin-top:15px; border-radius:8px 8px 0 0; font-weight:bold; color:#2c3e50; border:1px solid #eee; border-bottom:none; font-size:13px; text-transform:uppercase;">📅 ${mes}</div>`;
                    htmlMeses += `<table style="width:100%; border-collapse:collapse; font-size:13px; border:1px solid #eee; margin-bottom:10px; background:#fff;"><tbody>`;
                    agrupado[mes].forEach(c => {
                        const dataBr = c.data.split('-').reverse().join('/');
                        const cor = (c.status === 'Presença' || c.status === 'Reposição') ? '#27ae60' : (c.status === 'Falta' ? '#e74c3c' : '#f39c12');
                        htmlMeses += `<tr style="border-bottom:1px solid #eee;">
                                        <td style="padding:10px 15px; width:30%; font-weight:500;">${dataBr}</td>
                                        <td style="padding:10px 15px; font-weight:bold; color:${cor};">${c.status}</td>
                                        <td style="padding:10px 15px; text-align:right; color:#666; font-weight:500;">${c.duracao || '00:00'} h</td>
                                      </tr>`;
                    });
                    htmlMeses += `</tbody></table>`;
                }
            }
            
            const fmtHoras = (mins) => `${String(Math.floor(mins/60)).padStart(2,'0')}:${String(mins%60).padStart(2,'0')} h`;
            
            const kpiHTML = `
                <div class="kpi-container" style="display:flex; gap:10px; margin-top:20px; flex-wrap:wrap; page-break-inside: avoid;">
                    <div style="flex:1; min-width:90px; background:#eafaf1; border:1px solid #27ae60; padding:15px 10px; border-radius:8px; text-align:center;">
                        <div style="font-size:10px; color:#27ae60; font-weight:bold; text-transform:uppercase; margin-bottom:5px;">Presenças</div>
                        <div style="font-size:18px; font-weight:bold; color:#1e8449;">${fmtHoras(minPresenca)}</div>
                    </div>
                    <div style="flex:1; min-width:90px; background:#fef5e7; border:1px solid #f39c12; padding:15px 10px; border-radius:8px; text-align:center;">
                        <div style="font-size:10px; color:#d68910; font-weight:bold; text-transform:uppercase; margin-bottom:5px;">Justificadas</div>
                        <div style="font-size:18px; font-weight:bold; color:#b9770e;">${fmtHoras(minJustificada)}</div>
                    </div>
                    <div style="flex:1; min-width:90px; background:#fdedec; border:1px solid #e74c3c; padding:15px 10px; border-radius:8px; text-align:center;">
                        <div style="font-size:10px; color:#e74c3c; font-weight:bold; text-transform:uppercase; margin-bottom:5px;">Faltas</div>
                        <div style="font-size:18px; font-weight:bold; color:#c0392b;">${fmtHoras(minFalta)}</div>
                    </div>
                </div>`;

            content.innerHTML = `
                ${modo === 'ativo' && planoFoco ? `<div style="background:#e8f4f8; border:1px solid #3498db; color:#2980b9; padding:8px 12px; border-radius:6px; margin-bottom:15px; font-size:12px; font-weight:bold; text-align:center;">🟢 Dossiê do Planejamento Letivo Atual</div>` : ''}
                ${modo === 'ver_arquivado' ? `<div style="background:#fdf2f2; border:1px solid #e74c3c; color:#c0392b; padding:8px 12px; border-radius:6px; margin-bottom:15px; font-size:12px; font-weight:bold; text-align:center;">🗄️ Exibindo Frequência do Histórico Arquivado</div>` : ''}
                <div style="max-height:45vh; overflow-y:auto; padding-right:10px;">${htmlMeses}</div>
                ${kpiHTML}
            `;
        } catch(e) { 
            content.innerHTML = '<p style="color:red; text-align:center;">Erro ao processar as horas de frequência.</p>'; 
        }
    },

    // 🖨️ NOVA FUNÇÃO: O MOTOR DE IMPRESSÃO
    // 🖨️ NOVA FUNÇÃO: O MOTOR DE IMPRESSÃO INVISÍVEL (IFRAME)
    imprimirDossieFrequencia: () => {
        const escola = JSON.parse(localStorage.getItem(App.getTenantKey('escola_perfil'))) || {};
        const nomeEscola = escola.nome || 'Instituição de Ensino';
        const cnpjEscola = escola.cnpj ? `CNPJ: ${escola.cnpj}` : '';
        const logoEscola = (escola.foto && escola.foto.length > 50 && !escola.foto.includes('placehold')) 
            ? `<img src="${escola.foto}" style="max-height:80px; max-width:120px; object-fit:contain;">` 
            : '';

        const tituloModal = document.getElementById('modal-titulo').innerText;
        const conteudoOriginal = document.getElementById('modal-form-content');

        // Clonar o conteúdo para não quebrar a tela original
        const clone = conteudoOriginal.cloneNode(true);

        // Remover barras de rolagem para que saia a folha inteira na impressão
        const divsComScroll = clone.querySelectorAll('div[style*="max-height"]');
        divsComScroll.forEach(d => {
            d.style.maxHeight = 'none';
            d.style.overflowY = 'visible';
            d.style.paddingRight = '0';
        });

        // 👻 CRIAR A PÁGINA FANTASMA (Iframe Invisível)
        const iframe = document.createElement('iframe');
        // Escondemos o iframe na tela, mas ele existe no sistema
        iframe.style.position = 'absolute';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        // Escrever o documento dentro do iframe
        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Impressão - ${tituloModal}</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        padding: 30px; 
                        color: #333; 
                        line-height: 1.5;
                    }
                    .header-escola {
                        display: flex; 
                        align-items: center; 
                        border-bottom: 2px solid #3498db; 
                        padding-bottom: 15px; 
                        margin-bottom: 25px;
                    }
                    .header-escola img { margin-right: 20px; }
                    .header-escola h2 { margin: 0; color: #2c3e50; font-size: 24px; }
                    .header-escola p { margin: 5px 0 0 0; color: #7f8c8d; font-size: 14px; }
                    
                    .titulo-doc {
                        text-align: center; 
                        color: #2c3e50; 
                        margin-bottom: 30px;
                        text-transform: uppercase;
                        font-size: 18px;
                        background: #f4f6f7;
                        padding: 10px;
                        border-radius: 8px;
                        font-weight: bold;
                    }
                    
                    /* Configurações perfeitas para folha A4 */
                    @media print {
                        body { padding: 0; }
                        @page { margin: 15mm; }
                        /* Evita que o resumo fique dividido em duas folhas */
                        .kpi-container { page-break-inside: avoid !important; margin-top: 30px !important; }
                        table { page-break-inside: auto; width: 100%; border-collapse: collapse; }
                        tr { page-break-inside: avoid; page-break-after: auto; }
                    }
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
                
                <div class="titulo-doc">📄 ${tituloModal}</div>
                
                ${clone.innerHTML}
                
                <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #999;">
                    Documento gerado em ${new Date().toLocaleString('pt-BR')} pelo Sistema Escolar
                </div>
            </body>
            </html>
        `);
        doc.close();

        // Aguarda 500ms para garantir que as imagens carregaram no iframe
        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            
            // 🧹 Faxina: Remove a página fantasma assim que a impressão for concluída ou cancelada
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1500);
        }, 500);
    },   
    
    abrirModalVenda: async (idAluno, nomeAluno) => {
        const modal = document.getElementById('modal-overlay'); if(modal) modal.style.display = 'flex';
        document.getElementById('modal-titulo').innerText = `Registrar Venda - ${App.escapeHTML(nomeAluno)}`;
        document.getElementById('modal-form-content').innerHTML = '<p style="text-align:center; padding:20px; color:#666;">A carregar estoque... ⏳</p>';

        try {
            const estoque = await App.api('/estoques');
            const listaEstoque = Array.isArray(estoque) ? estoque : [];
            
            let opcoesEstoque = '<option value="">-- Selecione um Produto/Serviço --</option>';
            listaEstoque.forEach(item => {
                const qtd = parseInt(item.quantidade) || 0;
                const valor = parseFloat(item.valor) || 0;
                opcoesEstoque += `<option value="${item.id}" data-nome="${App.escapeHTML(item.nome)}" data-valor="${valor}">📦 ${App.escapeHTML(item.nome)} (Estoque: ${qtd} | R$ ${valor.toFixed(2)})</option>`;
            });
            opcoesEstoque += '<option value="avulso">✏️ Outro Item (Digitar Manualmente)</option>';

            const hoje = new Date().toISOString().split('T')[0];
            const html = `
                <div style="background:#f4f6f7; padding:15px; border-radius:8px; margin-bottom:15px; border-left:4px solid #27ae60;">
                    <h4 style="margin:0 0 10px 0; color:#2c3e50;">🛒 Detalhes da Compra</h4>
                    
                    <div class="input-group">
                        <label>Item / Serviço Comprado</label>
                        <select id="v-item-select" onchange="App.selecionarItemVenda(this)" style="font-weight:bold; padding:12px; width:100%; border-radius:8px; border:1px solid #ccc; margin-bottom:5px; cursor:pointer;">
                            ${opcoesEstoque}
                        </select>
                        <input type="text" id="v-item" placeholder="Digite o nome do item avulso..." style="display:none; width:100%; padding:12px; border-radius:8px; border:1px solid #ccc; margin-top:5px;">
                        <input type="hidden" id="v-item-id" value="">
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top:10px;">
                        <div class="input-group"><label>Valor (R$)</label><input type="number" id="v-valor" step="0.01" placeholder="0.00" style="padding:12px; border-radius:8px;"></div>
                        <div class="input-group"><label>Data da Venda</label><input type="date" id="v-data" value="${hoje}" style="padding:12px; border-radius:8px;"></div>
                    </div>
                    
                    <div class="input-group"><label>Forma de Pagamento</label>
                        <select id="v-forma" style="font-weight:bold; padding:12px; border-radius:8px; cursor:pointer;">
                            <option value="PIX">PIX</option>
                            <option value="Cartão de Crédito">💳 Cartão de Crédito</option>
                            <option value="Cartão de Débito">💳 Cartão de Débito</option>
                            <option value="Dinheiro">💵 Dinheiro</option>
                            <option value="Pendente (Fiado)">⚠️ Deixar Pendente (Fiado)</option>
                        </select>
                    </div>
                    <div class="input-group"><label>Descrição / Observação Adicional</label><textarea id="v-desc" rows="2" placeholder="Detalhes opcionais..." style="padding:12px; border-radius:8px;"></textarea></div>
                    <input type="hidden" id="v-idaluno" value="${App.escapeHTML(idAluno)}">
                    <input type="hidden" id="v-nomealuno" value="${App.escapeHTML(nomeAluno)}">
                </div>`;
            
            document.getElementById('modal-form-content').innerHTML = html;
            const btnConfirm = document.querySelector('.btn-confirm'); 
            btnConfirm.setAttribute('onclick', 'App.salvarVenda()'); 
            btnConfirm.innerHTML = "💾 Registrar Venda";
            btnConfirm.style.display = 'inline-flex';

        } catch (e) {
            document.getElementById('modal-form-content').innerHTML = '<p style="color:red; text-align:center;">Erro ao carregar o estoque.</p>';
        }
    },

    selecionarItemVenda: (selectElement) => {
        const inputNome = document.getElementById('v-item');
        const inputValor = document.getElementById('v-valor');
        const inputId = document.getElementById('v-item-id');

        if (selectElement.value === 'avulso') {
            inputNome.style.display = 'block';
            inputNome.value = '';
            inputValor.value = '';
            inputId.value = '';
            inputNome.focus();
        } else if (selectElement.value !== '') {
            inputNome.style.display = 'none';
            const option = selectElement.options[selectElement.selectedIndex];
            inputNome.value = option.getAttribute('data-nome');
            inputValor.value = option.getAttribute('data-valor');
            inputId.value = selectElement.value;
        } else {
            inputNome.style.display = 'none';
            inputNome.value = '';
            inputValor.value = '';
            inputId.value = '';
        }
    },

    salvarVenda: async () => {
        const idAluno = document.getElementById('v-idaluno').value; 
        const alunoNome = document.getElementById('v-nomealuno').value; 
        const item = document.getElementById('v-item').value.trim(); 
        const idItemEstoque = document.getElementById('v-item-id').value;
        const valor = document.getElementById('v-valor').value; 
        const data = document.getElementById('v-data').value; 
        const forma = document.getElementById('v-forma').value; 
        const obs = document.getElementById('v-desc').value;
        
        if(!item || !valor || !data) return App.showToast("Preencha o item, valor e data.", "error");

        const status = forma === 'Pendente (Fiado)' ? 'Pendente' : 'Pago';
        const descricaoFinal = `Venda: ${item} | Pagto: ${forma} ${obs ? ' | Obs: '+obs : ''}`;
        const payload = { 
            id: window.crypto.randomUUID(), 
            idCarne: `VENDA_${window.crypto.randomUUID().split('-')[0].toUpperCase()}`, 
            idAluno: idAluno, 
            alunoNome: alunoNome, 
            valor: valor, 
            vencimento: data, 
            status: status, 
            descricao: descricaoFinal, 
            tipo: 'Receita', 
            dataGeracao: new Date().toLocaleDateString('pt-BR') 
        };

        const btn = document.querySelector('.btn-confirm'); 
        const txtOriginal = btn ? btn.innerHTML : '💾 Registrar Venda';
        if(btn) { btn.innerHTML = "⏳ Registrando..."; btn.disabled = true; } 
        document.body.style.cursor = 'wait';

        try { 
            await App.api('/financeiro', 'POST', payload); 
            
            if (idItemEstoque) {
                const itemEstoque = await App.api(`/estoques/${idItemEstoque}`);
                if (itemEstoque && itemEstoque.id) {
                    let qtdAtual = parseInt(itemEstoque.quantidade) || 0;
                    if (qtdAtual > 0) qtdAtual -= 1;
                    await App.api(`/estoques/${idItemEstoque}`, 'PUT', { ...itemEstoque, quantidade: qtdAtual });
                }
            }

            App.showToast("Venda registrada e baixa no estoque efetuada!", "success"); 
            App.fecharModal(); 
        } catch (e) { 
            App.showToast("Erro ao registrar venda.", "error"); 
        } finally { 
            if(btn) { btn.innerHTML = txtOriginal; btn.disabled = false; } 
            document.body.style.cursor = 'default'; 
        }
    },

    renderizarLista: async (tipo) => {
        if (!App.usuario) { App.logout(); return; }
        if(document.querySelector('.sidebar')) document.querySelector('.sidebar').classList.remove('active');
        if(document.querySelector('.mobile-overlay')) document.querySelector('.mobile-overlay').classList.remove('active');

        App.entidadeAtual = tipo; const titulo = tipo.charAt(0).toUpperCase() + tipo.slice(1) + 's'; App.setTitulo(`Gerenciar ${titulo}`); const div = document.getElementById('app-content'); const endpoint = tipo === 'financeiro' ? 'financeiro' : tipo + 's';

        try {
            App.listaCache = await App.api(`/${endpoint}`);
            const acaoNovo = tipo === 'financeiro' ? "App.renderizarTela('mensalidades')" : `App.abrirModalCadastro('${tipo}')`;
            
            const barraBusca = `
                <div class="toolbar" style="max-width: 800px; margin: 0 auto; display: flex; gap: 15px; text-align: left; flex-wrap:wrap;">
                    <div class="search-wrapper" style="flex: 1; min-width:250px; position: relative;">
                        <span class="search-icon" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #aaa;">🔍</span>
                        <input type="text" id="input-busca" class="search-input-modern" style="width: 100%; padding: 14px 14px 14px 45px; border-radius: 8px; border: 2px solid #eee;" placeholder="Pesquisar..." oninput="App.filtrarTabelaReativa()">
                    </div>
                    <button class="btn-new-modern" onclick="${acaoNovo}"><span>＋</span> NOVO REGISTRO</button>
                </div>`;
            
            div.innerHTML = `<div style="text-align:center; margin-bottom:30px;">${App.UI.card(`Consultar ${titulo}`, 'Utilize o campo abaixo para localizar registros.', barraBusca, '100%')}</div><div id="container-tabela"></div>`;
            App.filtrarTabelaReativa();
        } catch(e) { div.innerHTML = "Erro ao carregar lista."; }
    },

    filtrarTabelaReativa: () => {
        const termo = document.getElementById('input-busca').value.trim().toLowerCase(); const container = document.getElementById('container-tabela');
        if (!Array.isArray(App.listaCache)) { container.innerHTML = ''; return; }
        const filtrados = termo.length === 0 ? App.listaCache : App.listaCache.filter(item => { const nome = (item.nome || item.alunoNome || item.descricao || "").toLowerCase(); return nome.includes(termo); });
        container.innerHTML = `<div class="card" style="animation: fadeIn 0.3s ease; padding:0; overflow:hidden;">${App.gerarTabelaHTML(filtrados)}</div>`;
    },

    gerarTabelaHTML: (dados) => {
        if (!dados.length) return '<p style="text-align:center; padding:30px; color:#666;">Nenhum registro encontrado.</p>';
        const tipo = App.entidadeAtual;
        
        const TB = { 
            estrutura: (cabecalho, corpo) => `<div class="table-responsive-wrapper"><table style="width:100%; border-collapse:collapse;"><thead><tr>${cabecalho}</tr></thead><tbody>${corpo}</tbody></table></div>`, 
            th: (texto, align = 'left') => `<th style="text-align:${align}; padding:15px; background:#f8f9fa; border-bottom:2px solid #eee; color:#2c3e50;">${texto}</th>`, 
            td: (texto, align = 'left') => `<td style="text-align:${align}; padding:15px; border-bottom:1px solid #eee; color:#333;">${texto}</td>`, 
            tr: (celulas) => `<tr style="transition: background 0.2s;">${celulas}</tr>`, 
            acoes: (botoes) => `<div style="display:flex; gap:5px; justify-content:flex-end; align-items:center;">${botoes.join('')}</div>`, 
            btn: (icone, cor, acao, title) => `<button class="btn-edit" style="background:${cor}; border:none; color:white; padding:6px 10px; border-radius:4px; cursor:pointer;" onclick="${acao}" title="${title}">${icone}</button>` 
        };

        let cabecalho = '';
        if (tipo === 'aluno')      cabecalho = TB.th('Nome') + TB.th('Turma') + TB.th('Status') + TB.th('WhatsApp') + TB.th('Ações', 'right');
        if (tipo === 'turma')      cabecalho = TB.th('Turma') + TB.th('Dia') + TB.th('Horário') + TB.th('Curso') + TB.th('Ações', 'right');
        if (tipo === 'curso')      cabecalho = TB.th('Curso') + TB.th('Carga') + TB.th('Ações', 'right');
        if (tipo === 'financeiro') cabecalho = TB.th('Ref (Aluno)') + TB.th('Descrição') + TB.th('Vencimento') + TB.th('Valor') + TB.th('Status') + TB.th('Ações', 'right');
        if (tipo === 'estoque')    cabecalho = TB.th('Item') + TB.th('Código') + TB.th('Qtd Atual') + TB.th('Mínimo (Alerta)') + TB.th('Valor') + TB.th('Status') + TB.th('Ações', 'right');        

        const corpo = dados.map(item => {
            let celulas = '';
            if (tipo === 'aluno') { 
                const statusAluno = item.status || 'Ativo';
                const corStatus = statusAluno === 'Ativo' ? '#27ae60' : (statusAluno === 'Trancado' ? '#f39c12' : '#e74c3c');
                const badgeStatus = `<span style="background:${corStatus}20; color:${corStatus}; padding:4px 8px; border-radius:4px; font-size:11px; font-weight:bold; border: 1px solid ${corStatus}50;">${statusAluno}</span>`;
                
                celulas += TB.td(App.escapeHTML(item.nome)) + TB.td(App.escapeHTML(item.turma || '-')) + TB.td(badgeStatus) + TB.td(App.escapeHTML(item.whatsapp || '-')); 
            }

            else if (tipo === 'turma') { celulas += TB.td(App.escapeHTML(item.nome)) + TB.td(App.escapeHTML(item.dia || '-')) + TB.td(App.escapeHTML(item.horario || '-')) + TB.td(App.escapeHTML(item.curso || '-')); } 
            else if (tipo === 'curso') { celulas += TB.td(App.escapeHTML(item.nome)) + TB.td(App.escapeHTML(item.carga || '-')); } 
            else if (tipo === 'financeiro') { const dataBr = item.vencimento ? item.vencimento.split('-').reverse().join('/') : '-'; const valorFmt = `R$ ${parseFloat(item.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`; const statusFmt = `<span style="color:${item.status === 'Pago' ? '#27ae60' : '#e74c3c'}; font-weight:bold; background:${item.status === 'Pago' ? '#eafaf1' : '#fdedec'}; padding:4px 8px; border-radius:4px; font-size:12px;">${App.escapeHTML(item.status)}</span>`; celulas += TB.td(App.escapeHTML(item.alunoNome || 'Sem Nome')) + TB.td(App.escapeHTML(item.descricao)) + TB.td(App.escapeHTML(dataBr)) + TB.td(App.escapeHTML(valorFmt)) + TB.td(statusFmt); }
            else if (tipo === 'estoque') { 
                const qtd = parseInt(item.quantidade) || 0;
                const min = parseInt(item.quantidadeMinima) || 0;
                const statusFmt = qtd <= min 
                    ? `<span style="color:#e74c3c; font-weight:bold; background:#fdedec; padding:4px 8px; border-radius:4px; font-size:12px;">⚠️ Baixo</span>` 
                    : `<span style="color:#27ae60; font-weight:bold; background:#eafaf1; padding:4px 8px; border-radius:4px; font-size:12px;">✅ Normal</span>`;
                const valorFmt = item.valor ? `R$ ${parseFloat(item.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : '-';
                
                celulas += TB.td(App.escapeHTML(item.nome)) + TB.td(App.escapeHTML(item.codigo || '-')) + TB.td(qtd, 'center') + TB.td(min, 'center') + TB.td(valorFmt) + TB.td(statusFmt, 'center'); 
            }            
 
            const epExcluir = tipo === 'financeiro' ? 'financeiro' : tipo + 's';
            const acaoEdit = tipo === 'financeiro' ? `App.abrirEdicaoFinanceiro('${item.id}')` : `App.abrirModalCadastro('${tipo}', '${item.id}')`;
            const nomeSeguro = (item.nome || '').replace(/'/g, "\\'"); 
            
            let botoes = [];
            if (tipo === 'aluno') {
                const statusAluno = item.status || 'Ativo';
                botoes.push(TB.btn('🔄', '#8e44ad', `App.alterarStatusAluno('${item.id}', '${statusAluno}')`, 'Alterar Status (Ativo/Trancado/Cancelado)'));
                botoes.push(TB.btn('⏱️', '#3498db', `App.abrirRelatorioFrequencia('${item.id}', '${App.escapeHTML(nomeSeguro)}')`, 'Ver Histórico de Horas / Frequência'));
                
                if (App.usuario.tipo !== 'Professor' && statusAluno === 'Ativo') {
                    botoes.push(TB.btn('🛒', '#27ae60', `App.abrirModalVenda('${item.id}', '${App.escapeHTML(nomeSeguro)}')`, 'Registrar Venda / Extra'));
                }
            }
            if (tipo === 'financeiro') botoes.push(TB.btn('💬', '#25D366', `if(App.verificarPermissao('whatsapp')) App.enviarWhatsApp('${item.id}')`, 'Avisar por WhatsApp'));
            
            botoes.push(TB.btn('✏️', '#f39c12', acaoEdit, 'Editar'));
            botoes.push(TB.btn('🗑️', '#e74c3c', `App.excluir('${epExcluir}', '${item.id}')`, 'Excluir'));
            
            celulas += TB.td(TB.acoes(botoes), 'right'); return TB.tr(celulas);
        }).join('');
        return TB.estrutura(cabecalho, corpo);
    },

  excluir: (endpoint, id) => {
        App.abrirModalConfirmacao(
            "Tem a certeza absoluta?", 
            "Esta ação apagará este registro permanentemente. Não é possível desfazer.", 
            async (modal) => {
                document.body.style.cursor = 'wait';
                try {
                    const res = await App.api(`/${endpoint}/${id}`, 'DELETE');
                    if (res && res.error) {
                        App.showToast(res.error, "error");
                    } else {
                        App.showToast("Excluído com sucesso!", "success");
                        // Se for financeiro não corta letras, caso contrário tira o "s" final
                        const tipoLista = endpoint === 'financeiro' ? 'financeiro' : endpoint.slice(0, -1);
                        App.renderizarLista(tipoLista);
                    }
                } catch(e) { 
                    App.showToast("Erro ao excluir.", "error"); 
                } finally { 
                    document.body.style.cursor = 'default'; 
                    modal.style.opacity = '0'; setTimeout(() => modal.style.display = 'none', 300);
                }
            }
        );
    },

    alterarStatusAluno: (id, statusAtual) => {
        const modal = document.getElementById('modal-overlay');
        if(modal) modal.style.display = 'flex';
        document.getElementById('modal-titulo').innerText = "Atualizar Status de Matrícula";

        const estilos = {
            Ativo: { icon: '🟢', color: '#27ae60', desc: 'Aluno matriculado e assistindo aulas.' },
            Trancado: { icon: '🟡', color: '#f39c12', desc: 'Matrícula pausada. Histórico financeiro preservado.' },
            Cancelado: { icon: '🔴', color: '#e74c3c', desc: 'Vínculo encerrado com a instituição.' }
        };

        const htmlOptions = Object.entries(estilos).map(([key, info]) => `
            <div class="status-option-card" data-status="${key}" onclick="App.selecionarOpcaoStatus(this)" style="border: 2px solid #eee; border-radius: 8px; padding: 15px; cursor: pointer; display: flex; align-items: center; gap: 15px; margin-bottom: 10px; transition: all 0.2s;">
                <span style="font-size: 32px; filter: grayscale(1); transition: filter 0.2s;">${info.icon}</span>
                <div style="flex: 1;">
                    <div style="font-weight: bold; color: ${info.color}; font-size: 16px;">${key}</div>
                    <p style="margin: 0; color: #666; font-size: 12px; line-height: 1.4;">${info.desc}</p>
                </div>
                <div class="selection-indicator" style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid #ccc; display: flex; align-items: center; justify-content: center;"></div>
            </div>
        `).join('');

        const html = `
            <div style="background: #fdf2f2; border: 1px solid #f5b7b1; padding: 10px; border-radius: 6px; margin-bottom: 20px; text-align: center;">
                <span style="font-size: 12px; color: #7f8c8d; text-transform: uppercase;">Status Atual:</span>
                <span style="font-size: 14px; font-weight: bold; color: ${estilos[statusAtual] ? estilos[statusAtual].color : '#333'}; margin-left: 5px;">${statusAtual}</span>
            </div>
            
            <h4 style="margin: 0 0 15px 0; color: #333; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom:10px;">Selecione o novo status:</h4>
            <div id="status-options-container" data-selecionado="">
                ${htmlOptions}
            </div>
            <input type="hidden" id="status-student-id" value="${id}">
            <input type="hidden" id="status-student-orig" value="${statusAtual}">
        `;

        document.getElementById('modal-form-content').innerHTML = html;

        if (estilos[statusAtual]) {
            const targetCard = document.querySelector(`.status-option-card[data-status="${statusAtual}"]`);
            if (targetCard) App.selecionarOpcaoStatus(targetCard);
        }

        const btnConfirm = document.querySelector('.btn-confirm');
        btnConfirm.setAttribute('onclick', 'App.confirmarAlteracaoStatus()');
        btnConfirm.innerText = "💾 Salvar Novo Status";
        btnConfirm.style.display = 'inline-flex';
    },

    selecionarOpcaoStatus: (card) => {
        document.querySelectorAll('.status-option-card').forEach(c => {
            c.style.borderColor = '#eee';
            c.style.background = 'white';
            c.querySelector('span[style*="font-size: 32px"]').style.filter = 'grayscale(1)';
            c.querySelector('.selection-indicator').innerHTML = '';
            c.querySelector('.selection-indicator').style.borderColor = '#ccc';
            c.querySelector('.selection-indicator').style.background = 'white';
        });

        const status = card.getAttribute('data-status');
        const styleTextBold = card.querySelector('div[style*="font-weight: bold"]'); 
        const color = styleTextBold.style.color; 

        card.style.borderColor = color;
        card.style.background = `${color}05`; 
        card.querySelector('span[style*="font-size: 32px"]').style.filter = 'grayscale(0)'; 
        
        card.querySelector('.selection-indicator').innerHTML = `<div style="width: 12px; height: 12px; border-radius: 50%; background: ${color};"></div>`;
        card.querySelector('.selection-indicator').style.borderColor = color;
        
        document.getElementById('status-options-container').setAttribute('data-selecionado', status);
    },

    confirmarAlteracaoStatus: async () => {
        const inputId = document.getElementById('status-student-id');
        const inputOrig = document.getElementById('status-student-orig');
        const containerStatus = document.getElementById('status-options-container');

        if (!inputId || !containerStatus) return App.showToast("Erro: Janela não abriu corretamente.", "error");

        const id = inputId.value;
        const statusOriginal = inputOrig ? inputOrig.value : '';
        const novoStatus = containerStatus.getAttribute('data-selecionado');

        if (!novoStatus) return App.showToast("Selecione um status para prosseguir.", "warning");
        if (novoStatus === statusOriginal) return App.showToast("O status selecionado é o mesmo que o atual.", "warning");

        const btn = document.querySelector('.btn-confirm');
        const textOrig = btn ? btn.innerText : "Salvar";
        if(btn) { btn.innerText = "A atualizar... ⏳"; btn.disabled = true; }
        document.body.style.cursor = 'wait';

        try {
            const aluno = await App.api(`/alunos/${id}`);
            if (!aluno || aluno.error) throw new Error("Erro ao buscar dados do aluno");

            await App.api(`/alunos/${id}`, 'PUT', { ...aluno, status: novoStatus });
            
            App.showToast(`Sucesso! Aluno agora está como ${novoStatus}.`, "success");
            App.fecharModal();
            
            if (Array.isArray(App.cacheAlunos)) {
                const index = App.cacheAlunos.findIndex(a => a.id === id);
                if (index !== -1) App.cacheAlunos[index].status = novoStatus;
            }
            if (Array.isArray(App.listaCache)) {
                const index = App.listaCache.findIndex(a => a.id === id);
                if (index !== -1) App.listaCache[index].status = novoStatus;
            }
            
            if(typeof App.filtrarTabelaReativa === 'function') {
                App.filtrarTabelaReativa();
            } else if(typeof App.renderizarLista === 'function') {
                App.renderizarLista('aluno');
            } else {
                setTimeout(() => window.location.reload(), 500);
            }

            App.verificarNotificacoes();
            
            if (document.getElementById('titulo-pagina') && document.getElementById('titulo-pagina').innerText === 'Visão Geral') {
                App.renderizarInicio();
            }

        } catch (e) {
            console.error("Erro na atualização:", e);
            App.showToast("Não foi possível atualizar o status. Tente novamente.", "error");
        } finally {
            if(btn) { btn.innerText = textOrig; btn.disabled = false; }
            document.body.style.cursor = 'default';
        }
    },

    atualizarUIHeader: (escola) => {
        if (!escola) return;
        const logoTitle = document.querySelector('.logo-area h2'); 
        
        const planoAtual = escola.plano || 'Teste';
        
        let corBadge = planoAtual === 'Premium' ? '#f39c12' : (planoAtual === 'Profissional' ? '#3498db' : (planoAtual === 'Teste' ? '#e74c3c' : '#27ae60'));
        const badgeHtml = `<div style="margin-top:8px; margin-bottom:5px;"><span style="background:${corBadge}; color:#fff; font-size:10px; font-weight:bold; padding:3px 8px; border-radius:12px; text-transform:uppercase; letter-spacing:1px; box-shadow:0 2px 4px rgba(0,0,0,0.2);">💎 PLANO ${App.escapeHTML(planoAtual)}</span></div>`;
        
        const userLogin = App.usuario ? App.usuario.login : 'Desconhecido';
        const userTipo = App.usuario ? App.usuario.tipo : 'Gestor';
        const userHtml = `<div style="font-size:11px; color:#aaa; font-weight:normal; line-height:1.4; margin-top:5px; background: rgba(0,0,0,0.15); border-radius: 6px; padding: 4px;">👤 Logado como:<br><b style="color:#fff;">${App.escapeHTML(userLogin)}</b><br><span style="font-size:9px; color:#3498db; text-transform:uppercase; font-weight:bold;">${App.escapeHTML(userTipo)}</span></div>`;

        if(logoTitle) logoTitle.innerHTML = `${App.escapeHTML(escola.nome || 'Escola')}<br><small style="color:#aaa;">${App.escapeHTML(escola.cnpj || '')}</small>${badgeHtml}${userHtml}`; 
        
        const logoContainer = document.querySelector('.logo-area'); let img = logoContainer.querySelector('img'); 
        if(escola.foto && escola.foto.length > 50) { 
            if(!img) { img = document.createElement('img'); img.style.cssText = "width:80px; height:80px; border-radius:50%; object-fit:cover; margin-bottom:10px; display:block; margin: 0 auto 10px auto; border: 3px solid rgba(255,255,255,0.2);"; logoContainer.insertBefore(img, logoContainer.firstChild); } 
            img.src = escola.foto; 
        } else if(img) { img.remove(); }
    },

    carregarDadosEscola: async () => { 
        try { 
            const cacheEscola = JSON.parse(localStorage.getItem(App.getTenantKey('escola_perfil')));
            if (cacheEscola) {
                App.atualizarUIHeader(cacheEscola);
            }

            const escola = await App.api('/escola'); 
            if(!escola || escola.error) return;
            
            if (!escola.dataCriacao) {
                escola.dataCriacao = new Date().toISOString();
                await App.api('/escola', 'PUT', escola);
            }

            if (escola.plano) { localStorage.setItem(App.getTenantKey('escola_plano'), escola.plano); }
            localStorage.setItem(App.getTenantKey('escola_perfil'), JSON.stringify(escola));
            
            App.atualizarUIHeader(escola);
            
            // 🚀 CÃO DE GUARDA: Expulsa se vencer com o sistema aberto
            if (App.verificarBloqueioGeral(escola)) {
                App.mostrarTelaBloqueioLogin(escola);
            }

        } catch(e) { console.log("Carregando perfil..."); } 
    },
    
    otimizarImagem: (file, maxWidth, callback) => { 
        const reader = new FileReader(); reader.readAsDataURL(file); 
        reader.onload = (event) => { 
            const img = new Image(); img.src = event.target.result; 
            img.onload = () => { 
                const canvas = document.createElement('canvas'); let width = img.width; let height = img.height; 
                if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; } 
                canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d'); 
                ctx.drawImage(img, 0, 0, width, height); callback(canvas.toDataURL('image/jpeg', 0.8)); 
            }; 
        }; 
    },

    renderizarConfiguracoes: async () => { 
        App.setTitulo("Perfil da Escola"); const div = document.getElementById('app-content'); 
        try { 
            const escola = await App.api('/escola') || {}; 
            const imgLogo = escola.foto || 'https://placehold.co/100?text=LOGO'; 
            const imgQr = escola.qrCodeImagem || 'https://placehold.co/100?text=QR+CODE'; 
            
            div.innerHTML = `
                <div class="card" style="max-width:850px; margin:0 auto;">
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:20px; margin-bottom:30px;">
                        <div style="background:#f9f9f9; padding:20px; border-radius:10px; display:flex; align-items:center; gap:20px; color:#333;">
                            <img id="conf-preview" src="${imgLogo}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:2px solid white; box-shadow:0 2px 5px rgba(0,0,0,0.1); background:white;">
                            <div>
                                <label style="font-weight:bold; font-size:13px;">Logotipo Oficial</label>
                                <input type="file" id="conf-file" accept="image/*" onchange="App.previewImagemLocal(this, 'conf-preview')" style="font-size:12px; margin-bottom:10px; width:100%;">
                                <div style="display:flex; gap:5px;">
                                    <button class="btn-del" style="padding:5px 10px; font-size:11px;" onclick="App.removerImagemLocal('conf-preview')">🗑️ Remover Imagem</button>
                                </div>
                            </div>
                        </div>
                        <div style="background:#f9f9f9; padding:20px; border-radius:10px; display:flex; align-items:center; gap:20px; color:#333;">
                            <img id="conf-qr-preview" src="${imgQr}" style="width:100px; height:100px; object-fit:contain; border:2px solid white; box-shadow:0 2px 5px rgba(0,0,0,0.1); background:white;">
                            <div>
                                <label style="font-weight:bold; font-size:13px;">QR Code PIX</label>
                                <input type="file" id="conf-qr-file" accept="image/*" onchange="App.previewImagemLocal(this, 'conf-qr-preview')" style="font-size:12px; margin-bottom:10px; width:100%;">
                                <div style="display:flex; gap:5px;">
                                    <button class="btn-del" style="padding:5px 10px; font-size:11px;" onclick="App.removerImagemLocal('conf-qr-preview')">🗑️ Remover Imagem</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <h4 style="margin: 0 0 15px 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">📋 Dados Principais</h4>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:20px; margin-bottom:20px;">
                        <div class="input-group"><label>Nome da Instituição</label><input id="conf-nome" value="${App.escapeHTML(escola.nome||'')}"></div>
                        <div class="input-group"><label>CNPJ / NIF</label><input id="conf-cnpj" value="${App.escapeHTML(escola.cnpj||'')}" oninput="App.mascaraCNPJ(this)" maxlength="18"></div>
                    </div>
                    
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:20px;">
                        <div class="input-group"><label>Dados Bancários (Carnê)</label><input id="conf-banco" value="${App.escapeHTML(escola.banco||'')}"></div>
                        <div class="input-group"><label>Chave PIX (Texto)</label><input id="conf-pix" value="${App.escapeHTML(escola.chavePix||'')}"></div>
                    </div>

                    <h4 style="margin: 25px 0 15px 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">📍 Endereço da Instituição</h4>
                    <div style="display:grid; grid-template-columns: 1fr 2fr 1fr; gap:20px; margin-bottom:20px;">
                        <div class="input-group"><label>CEP</label><input id="conf-cep" value="${App.escapeHTML(escola.cep||'')}" oninput="App.mascaraCEP(this)" maxlength="9"></div>
                        <div class="input-group"><label>Endereço (Rua, Av.)</label><input id="conf-endereco" value="${App.escapeHTML(escola.endereco||'')}"></div>
                        <div class="input-group"><label>Número</label><input id="conf-numero" value="${App.escapeHTML(escola.numero||'')}"></div>
                    </div>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:20px;">
                        <div class="input-group"><label>Bairro</label><input id="conf-bairro" value="${App.escapeHTML(escola.bairro||'')}"></div>
                        <div class="input-group"><label>Cidade</label><input id="conf-cidade" value="${App.escapeHTML(escola.cidade||'')}"></div>
                        <div class="input-group"><label>Estado (UF)</label><input id="conf-estado" value="${App.escapeHTML(escola.estado||'')}" maxlength="2" style="text-transform: uppercase;"></div>
                    </div>

                    <button class="btn-primary" style="width:100%; margin-top:25px; padding:15px; justify-content:center;" onclick="App.salvarConfiguracoes()">💾 ATUALIZAR DADOS DA ESCOLA</button>
                </div>`; 
        } catch(e) { div.innerHTML = "Erro ao carregar."; } 
    },    

    previewImagemLocal: (input, imgId) => {
        if (!input.files || input.files.length === 0) return;
        App.otimizarImagem(input.files[0], 400, (imgBase64) => {
            const img = document.getElementById(imgId); img.src = imgBase64; img.setAttribute('data-nova', 'true');
        });
    },

    removerImagemLocal: (imgId) => {
        const img = document.getElementById(imgId);
        img.src = imgId === 'conf-preview' ? "https://placehold.co/100?text=LOGO" : "https://placehold.co/100?text=QR+CODE";
        img.setAttribute('data-nova', 'true');
        const fileInput = document.getElementById(imgId === 'conf-preview' ? 'conf-file' : 'conf-qr-file'); if(fileInput) fileInput.value = '';
    },

    salvarConfiguracoes: async () => { 
        const p = { 
            nome: document.getElementById('conf-nome').value, 
            cnpj: document.getElementById('conf-cnpj').value, 
            banco: document.getElementById('conf-banco').value, 
            chavePix: document.getElementById('conf-pix').value,
            cep: document.getElementById('conf-cep').value,
            endereco: document.getElementById('conf-endereco').value,
            numero: document.getElementById('conf-numero').value,
            bairro: document.getElementById('conf-bairro').value,
            cidade: document.getElementById('conf-cidade').value,
            estado: document.getElementById('conf-estado').value.toUpperCase()
        }; 
        
        const imgLogo = document.getElementById('conf-preview');
        if (imgLogo && imgLogo.hasAttribute('data-nova')) p.foto = imgLogo.src.includes('placehold') ? "" : imgLogo.src;

        const imgQr = document.getElementById('conf-qr-preview');
        if (imgQr && imgQr.hasAttribute('data-nova')) p.qrCodeImagem = imgQr.src.includes('placehold') ? "" : imgQr.src;

        const btn = document.querySelector('button[onclick="App.salvarConfiguracoes()"]'); 
        const txt = btn.innerText; btn.innerText = "A atualizar... ⏳"; btn.disabled = true; 
        
        try { 
            const escolaAtual = await App.api('/escola') || {};
            await App.api('/escola','PUT', { ...escolaAtual, ...p }); 
            await App.carregarDadosEscola(); 
            
            if (imgLogo) imgLogo.removeAttribute('data-nova'); if (imgQr) imgQr.removeAttribute('data-nova');
            App.showToast("Configurações atualizadas com sucesso!", "success"); 
        } catch(e) { App.showToast("Erro ao salvar perfil da escola.", "error"); } finally { btn.innerText = txt; btn.disabled = false; } 
    },

    toggleSenhaVisibilidade: (id) => { 
        const input = document.getElementById(id); 
        input.type = input.type === 'password' ? 'text' : 'password'; 
    },

    renderizarMinhaConta: async () => {
        App.setTitulo("Gestão de Usuários"); const div = document.getElementById('app-content'); App.idEdicaoUsuario = null; 
        const meuLogin = App.usuario ? App.usuario.login : ''; const meuEmail = (App.usuario && App.usuario.email) ? App.usuario.email : '';
        
        const campoSenha = (id, label) => `<div class="input-group" style="position:relative;"><label>${label}</label><input type="password" id="${id}" style="width:100%; padding-right:40px;"><span onclick="App.toggleSenhaVisibilidade('${id}')" style="position:absolute; right:12px; top:32px; cursor:pointer; font-size:16px; opacity:0.6; user-select:none;" title="Mostrar/Ocultar Senha">👁️</span></div>`;

        try { 
            const usuariosResponse = await App.api('/usuarios'); 
            const todosUsers = Array.isArray(usuariosResponse) ? usuariosResponse : []; 
            const listaUsers = todosUsers.filter(u => u.id === App.usuario.id || String(u.donoId) === String(App.usuario.id));

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
                            <p style="font-size: 12px; color: #666; margin-bottom: 15px;">Use o sensor de rosto (FaceID) ou impressão digital para entrar.</p>
                            <button class="btn-primary" style="background: #27ae60; width: 100%; justify-content:center;" onclick="App.configurarBiometria()">👆 Ativar Biometria</button>
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
            "Deseja remover o acesso deste membro da equipa? A ação não pode ser desfeita.", 
            async (modal) => {
                document.body.style.cursor = 'wait';
                try {
                    const res = await App.api(`/usuarios/${id}`, 'DELETE'); 
                    if(res && res.error) { App.showToast(res.error, "error"); }
                    else { App.showToast("Utilizador excluído.", "success"); App.renderizarMinhaConta(); }
                } catch(e) { App.showToast("Erro ao excluir.", "error"); }
                finally {
                    document.body.style.cursor = 'default';
                    modal.style.opacity = '0'; setTimeout(() => modal.style.display = 'none', 300);
                }
            }
        );
    },

    renderizarBackup: () => { 
        App.setTitulo("Backup de Dados"); 
        const div = document.getElementById('app-content');
        div.innerHTML = `
            <div style="display:flex; gap:20px; flex-wrap:wrap; margin-bottom:30px;">
                <div class="card" style="flex:1; border-left: 5px solid #27ae60; padding:25px;">
                    <h3 style="color:#27ae60; border:none; margin-top:0;">📥 Fazer Backup</h3>
                    <p style="opacity:0.7; margin-bottom:20px; font-size:13px;">Baixe uma cópia completa de todos os dados do sistema.</p>
                    <button class="btn-primary" style="width:100%; background:#27ae60; justify-content:center;" onclick="App.realizarDownloadBackup()">⬇️ BAIXAR DADOS (.JSON)</button>
                </div>
                <div class="card" style="flex:1; border-left: 5px solid #f39c12; padding:25px;">
                    <h3 style="color:#f39c12; border:none; margin-top:0;">📤 Restaurar</h3>
                    <p style="opacity:0.7; margin-bottom:15px; font-size:13px;">Carregue um arquivo de backup para recuperar dados.</p>
                    <input type="file" id="input-backup-file" accept=".json" style="width:100%; margin-bottom:15px; border:1px solid #ddd; padding:10px; border-radius:5px;">
                    <button class="btn-primary" style="width:100%; background:#f39c12; justify-content:center;" onclick="App.processarRestauracao()">⬆️ RESTAURAR DADOS</button>
                </div>
            </div>
            <div class="card" style="border:2px solid #e74c3c; background:#fff5f5; padding:30px; text-align:center;">
                <h3 style="color:#c0392b; border:none; font-size:22px; margin-top:0;">⚠️ ZONA DE PERIGO</h3>
                <p style="color:#c0392b; margin-bottom:20px;">Esta ação apagará <strong>TODOS</strong> os dados operacionais e resetará o <strong>PERFIL DA ESCOLA</strong>.<br>O seu usuário será mantido para login.</p>
                <button class="btn-primary" style="background:#c0392b; width:100%; max-width:250px; margin: 0 auto; padding:15px; font-weight:bold; border:2px solid #c0392b; justify-content:center;" onclick="App.resetarSistema()">🗑️ RESETAR TUDO</button>
            </div>
        `; 
    },

    resetarSistema: async () => {
        if(!confirm("⚠️ ATENÇÃO EXTREMA: ISSO APAGARÁ TODOS OS DADOS DA ESCOLA. Deseja continuar?")) return;
        const confirmacao = prompt("Para confirmar a exclusão TOTAL, digite: APAGAR TUDO");
        if(confirmacao !== "APAGAR TUDO") return App.showToast("Ação cancelada. Código incorreto.", "error");

        const btn = document.querySelector('button[onclick="App.resetarSistema()"]');
        if(btn) { btn.disabled = true; btn.innerText = "⏳ APAGANDO..."; } document.body.style.cursor = 'wait';
        
        try {
            const entidades = ['alunos', 'turmas', 'cursos', 'financeiro', 'eventos', 'chamadas', 'avaliacoes', 'planejamentos'];
            for (const ent of entidades) { const dados = await App.api(`/${ent}`); if (Array.isArray(dados) && dados.length > 0) { await Promise.all(dados.map(item => App.api(`/${ent}/${item.id}`, 'DELETE'))); } }
            await App.api('/escola', 'PUT', { nome: 'Escola', cnpj: '', foto: '', qrCodeImagem: '', banco: '', chavePix: '' });
            localStorage.removeItem(App.getTenantKey('escola_perfil')); alert("✅ Sistema resetado com sucesso!"); location.reload();
        } catch (e) { alert("Erro ao limpar dados."); if(btn) { btn.disabled = false; btn.innerText = "🗑️ RESETAR TUDO"; } } finally { document.body.style.cursor = 'default'; }
    },

    realizarDownloadBackup: async () => { 
        try { 
            const e=['escola','usuarios','alunos','turmas','cursos','financeiro','eventos','chamadas','avaliacoes','planejamentos']; 
            const d={}; for(const ep of e){const r=await App.api(`/${ep}`); d[ep]=r;} 
            const b=new Blob([JSON.stringify(d,null,2)],{type:"application/json"}); const a=document.createElement('a'); 
            a.href=URL.createObjectURL(b); a.download=`backup_${new Date().toISOString().split('T')[0]}.json`; 
            document.body.appendChild(a); a.click(); document.body.removeChild(a); 
        } catch(x){alert("Erro no backup.");} 
    },
    
    processarRestauracao: async () => { 
        const f = document.getElementById('input-backup-file'); 
        if (!f.files.length) return App.showToast("Por favor, selecione o ficheiro de backup.", "warning"); 
        
        if (!confirm("Tem a certeza absoluta que deseja substituir os dados atuais? Esta ação não pode ser desfeita.")) return; 
        
        const btn = document.querySelector('button[onclick="App.processarRestauracao()"]');
        if (btn) { btn.disabled = true; btn.innerText = "A Ler ficheiro... ⏳"; }
        document.body.style.cursor = 'wait';

        const r = new FileReader(); 
        r.onload = async (e) => {
            try {
                const d = JSON.parse(e.target.result); 
                const t = ['alunos','turmas','cursos','financeiro','eventos','chamadas','avaliacoes','planejamentos','usuarios','escola']; 
                
                let totalRegistos = 0;
                let processados = 0;
                
                for (const k of t) {
                    if (d[k]) {
                        if (Array.isArray(d[k])) totalRegistos += d[k].length;
                        else totalRegistos += 1; 
                    }
                }

                if (totalRegistos === 0) {
                    App.showToast("O ficheiro de backup parece estar vazio.", "warning");
                    if (btn) { btn.disabled = false; btn.innerText = "⬆️ RESTAURAR DADOS"; }
                    document.body.style.cursor = 'default';
                    return;
                }

                for (const k of t) {
                    if (d[k]) {
                        if (Array.isArray(d[k])) {
                            for (const i of d[k]) {
                                await App.api(`/${k}`, 'POST', i);
                                processados++;
                                if (btn) btn.innerText = `A Restaurar: ${processados} de ${totalRegistos} ⏳`;
                            }
                        } else {
                            await App.api('/escola', 'PUT', d[k]);
                            processados++;
                            if (btn) btn.innerText = `A Restaurar: ${processados} de ${totalRegistos} ⏳`;
                        }
                    }
                } 
                
                App.showToast("Dados restaurados com sucesso! A reiniciar...", "success"); 
                setTimeout(() => location.reload(), 1500);

            } catch (x) {
                console.error("Erro na restauração:", x);
                App.showToast("Ficheiro inválido ou erro de comunicação.", "error");
                if (btn) { btn.disabled = false; btn.innerText = "⬆️ RESTAURAR DADOS"; }
                document.body.style.cursor = 'default';
            }
        }; 
        r.readAsText(f.files[0]); 
    },

    toggleNotificacoes: () => {
        const dropdown = document.getElementById('noti-dropdown');
        if (dropdown) dropdown.classList.toggle('active');
    },

   verificarNotificacoes: async () => {
        try {
            const tipoUtilizador = App.usuario ? App.usuario.tipo : 'Gestor';
            
            let [alunos, eventos, financeiro, planejamentos, estoque, escola] = await Promise.all([
                App.api('/alunos'), App.api('/eventos'), App.api('/financeiro'), App.api('/planejamentos'), App.api('/estoques'), App.api('/escola')
            ]);
            
            if (Array.isArray(alunos)) {
                alunos = alunos.filter(a => !a.status || a.status === 'Ativo');
            }
            
            let alertas = [];
            const hoje = new Date();
            const ano = hoje.getFullYear();
            const mes = String(hoje.getMonth() + 1).padStart(2, '0');
            const dia = String(hoje.getDate()).padStart(2, '0');
            const hojeStr = `${ano}-${mes}-${dia}`;
            
            const amanha = new Date(hoje);
            amanha.setDate(amanha.getDate() + 1);
            const amanhaStr = `${amanha.getFullYear()}-${String(amanha.getMonth() + 1).padStart(2, '0')}-${String(amanha.getDate()).padStart(2, '0')}`;

            if (escola && tipoUtilizador === 'Gestor') {
                const planoAtual = escola.plano || 'Teste';
                const hojeTime = hoje.getTime();
                
                let diasRestantes = 0;
                
                if (escola.dataExpiracao) {
                    const dataVenc = new Date(escola.dataExpiracao).getTime();
                    diasRestantes = Math.ceil((dataVenc - hojeTime) / (1000 * 60 * 60 * 24));
                } else {
                    const dataCriacao = escola.dataCriacao ? new Date(escola.dataCriacao).getTime() : hojeTime;
                    const diasPassados = Math.floor(Math.abs(hojeTime - dataCriacao) / (1000 * 60 * 60 * 24));
                    diasRestantes = (planoAtual === 'Teste' ? 7 : 30) - diasPassados;
                }

                if (planoAtual !== 'Premium' && planoAtual !== 'Bloqueado') {
                    if (diasRestantes <= 3 && diasRestantes > 0) {
                        alertas.push({ 
                            icon: '⏳', 
                            texto: `<b>Atenção Gestor:</b> O seu plano <b>${planoAtual}</b> expira em <b>${diasRestantes} dia(s)</b>! Renove agora.`, 
                            acao: "App.renderizarTela('plano')" 
                        });
                    } else if (diasRestantes <= 0) {
                        alertas.push({ 
                            icon: '🚫', 
                            texto: `<b>Urgente:</b> O seu acesso <b>expirou</b>! Regularize para continuar usando o sistema.`, 
                            acao: "App.renderizarTela('plano')" 
                        });
                    }
                }
            }

            if (Array.isArray(alunos)) {
                alunos.forEach(a => {
                    if (a.nascimento && a.nascimento.substring(5) === `${mes}-${dia}`) {
                        alertas.push({ 
                            icon: '🎂', 
                            texto: `Hoje é aniversário de <b>${App.escapeHTML(a.nome)}</b>! Clique para ver.`,
                            acao: "App.renderizarLista('aluno')" 
                        });
                    }
                });
            }
           
            // ==========================================
            // 🆕 ALERTA DE NOVAS MATRÍCULAS (HOJE)
            // ==========================================
            if (Array.isArray(alunos)) {
                alunos.forEach(a => {
                    // Verifica se a dataMatricula existe e se começa com a data de hoje (YYYY-MM-DD)
                    if (a.dataMatricula && a.dataMatricula.startsWith(hojeStr)) {
                        alertas.push({ 
                            icon: '🎉', 
                            texto: `<b>Nova Matrícula!</b> O aluno <b>${App.escapeHTML(a.nome)}</b> foi registado hoje.`,
                            acao: "App.renderizarContratos()" // Leva direto para o cofre de contratos
                        });
                    }
                });
            }

            // ==========================================
            // 💸 MENSALIDADES A VENCER HOJE
            // ==========================================
            if (tipoUtilizador !== 'Professor' && Array.isArray(financeiro)) {
                const vencemHoje = financeiro.filter(f => f.vencimento === hojeStr && f.status === 'Pendente');
                if (vencemHoje.length > 0) {
                    alertas.push({ 
                        icon: '💲', 
                        texto: `<b>Caixa de Hoje:</b> Existem <b>${vencemHoje.length}</b> mensalidades a vencer no dia de hoje.`,
                        acao: "App.renderizarTela('mensalidades')" 
                    });
                }
            }

            if (Array.isArray(eventos)) {
                eventos.forEach(e => {
                    if (e.data === hojeStr) alertas.push({ 
                        icon: '🚨', 
                        texto: `<b>Hoje:</b> ${App.escapeHTML(e.tipo)} - ${App.escapeHTML(e.descricao)}`,
                        acao: "App.renderizarTela('calendario')" 
                    });
                    else if (e.data === amanhaStr) alertas.push({ 
                        icon: '⏳', 
                        texto: `<b>Amanhã:</b> ${App.escapeHTML(e.tipo)} - ${App.escapeHTML(e.descricao)}`,
                        acao: "App.renderizarTela('calendario')" 
                    });
                });
            }

            if (tipoUtilizador !== 'Professor') {
                if (Array.isArray(financeiro) && Array.isArray(alunos) && Array.isArray(planejamentos)) {
                    alunos.forEach(aluno => {
                        const plano = planejamentos.find(p => p.idAluno === aluno.id);
                        let parcelasFuturas = 0;
                        let dataUltimaMensalidade = null;
                        
                        financeiro.forEach(f => {
                            if (f.idAluno === aluno.id && f.status !== 'Cancelado' && (!f.idCarne || !f.idCarne.includes('VENDA'))) {
                                if (!dataUltimaMensalidade || f.vencimento > dataUltimaMensalidade) {
                                    dataUltimaMensalidade = f.vencimento;
                                }
                                if (f.vencimento >= hojeStr) {
                                    parcelasFuturas++;
                                }
                            }
                        });

                        if (dataUltimaMensalidade && dataUltimaMensalidade.startsWith(`${ano}-${mes}`)) {
                            alertas.push({ 
                                icon: '🎓', 
                                texto: `A última mensalidade de <b>${App.escapeHTML(aluno.nome)}</b> vence este mês. Clique para gerar renovação!`,
                                acao: "App.renderizarTela('mensalidades')" 
                            });
                        }

                        if (plano && plano.aulas) {
                            const aulasPendentes = plano.aulas.filter(a => !a.visto).length;
                            if (aulasPendentes > 0) {
                                let aulasPorMes = 4; 
                                if (plano.aulas.length > 1) {
                                    const d1 = plano.aulas[0].data.split('/');
                                    const d2 = plano.aulas[1].data.split('/');
                                    const data1 = new Date(`${d1[2]}-${d1[1]}-${d1[0]}`);
                                    const data2 = new Date(`${d2[2]}-${d2[1]}-${d2[0]}`);
                                    const diffDias = Math.abs((data2 - data1) / (1000 * 60 * 60 * 24));
                                    if (diffDias <= 4) aulasPorMes = 8; 
                                    else if (diffDias <= 2) aulasPorMes = 12; 
                                }
                                const mesesDeAulaRestantes = Math.ceil(aulasPendentes / aulasPorMes);

                                if (mesesDeAulaRestantes > parcelasFuturas && tipoUtilizador === 'Gestor') {
                                    alertas.push({ 
                                        icon: '⚠️', 
                                        texto: `<b>Faturação Perdida!</b> <b>${App.escapeHTML(aluno.nome)}</b> precisa de ${aulasPendentes} aulas, mas não tem parcelas suficientes.`,
                                        acao: "App.renderizarTela('mensalidades')"
                                    });
                                }
                            }
                        }
                    });
                }
        
                if (Array.isArray(estoque)) {
                    estoque.forEach(item => {
                        const qtd = parseInt(item.quantidade) || 0;
                        const min = parseInt(item.quantidadeMinima) || 0;
                        if (qtd <= min) {
                            alertas.push({ 
                                icon: '📦', 
                                texto: `<b>Estoque Baixo:</b> Restam apenas ${qtd} unidades de <b>${App.escapeHTML(item.nome)}</b>!`,
                                acao: "App.renderizarLista('estoque')" 
                            });
                        }
                    });
                }
            }

      
            const badge = document.getElementById('noti-badge');
            const list = document.getElementById('noti-list');
            
            if (alertas.length > 0) {
                if (badge) { badge.innerText = alertas.length; badge.style.display = 'block'; }
                if (list) list.innerHTML = alertas.map(a => `
                    <div class="noti-item" style="cursor:pointer; transition:background 0.2s;" onmouseover="this.style.background='#f1f2f6'" onmouseout="this.style.background='transparent'" onclick="${a.acao}; App.toggleNotificacoes();">
                        <span class="noti-icon">${a.icon}</span>
                        <div>${a.texto}</div>
                    </div>
                `).join('');
            } else {
                if (badge) badge.style.display = 'none';
                if (list) list.innerHTML = `<div class="noti-item" style="justify-content:center; color:#999; padding: 30px 15px;">Nenhum alerta pendente.<br>Tudo tranquilo! 🎉</div>`;
            }
        } catch (e) { console.error("Erro nas notificações", e); }
    },


// ==========================================
// MÓDULO: LINKS DE MATRÍCULA E CUSTOMIZAÇÃO
// ==========================================

// 1. Função para Gerar Link e guardar no Histórico
gerarLinkMatricula: function() {
    const escolaId = App.usuario.id; 
    const urlBase = window.location.origin + "/matricula.html";
    const linkGerado = `${urlBase}?escola=${escolaId}`;
    
    // Exibe o link no input principal para o Gestor copiar
    const inputLink = document.getElementById('inputLinkMatricula');
    if(inputLink) inputLink.value = linkGerado;
    
    // Guarda no histórico (usando o LocalStorage da escola ou a tua API)
    let historico = JSON.parse(localStorage.getItem(App.getTenantKey('historico_links')) || "[]");
    
    // Evita duplicados seguidos
    if(historico.length === 0 || historico[0].link !== linkGerado) {
        historico.unshift({
            data: new Date().toLocaleString('pt-PT'),
            link: linkGerado
        });
        // Mantém apenas os últimos 10 links para não sobrecarregar
        if(historico.length > 10) historico.pop(); 
        localStorage.setItem(App.getTenantKey('historico_links'), JSON.stringify(historico));
    }
    
    App.renderizarHistoricoLinks();
    if (typeof App.showToast === 'function') App.showToast("Link gerado com sucesso!", "success");
},

// 2. Função para Renderizar o Histórico abaixo do botão
renderizarHistoricoLinks: function() {
    const container = document.getElementById('containerHistoricoLinks');
    if(!container) return; // Se o container não existir na tela atual, ignora
    
    const historico = JSON.parse(localStorage.getItem(App.getTenantKey('historico_links')) || "[]");
    
    if(historico.length === 0) {
        container.innerHTML = "<p style='color:#7f8c8d; font-size:14px;'>Nenhum link gerado recentemente.</p>";
        return;
    }
    
    let html = `<ul style="list-style:none; padding:0; margin-top:15px;">`;
    historico.forEach(item => {
        html += `
        <li style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 13px;">
                <strong style="color:#2c3e50;">${item.data}</strong><br>
                <a href="${item.link}" target="_blank" style="color:#3498db; text-decoration:none;">${item.link}</a>
            </div>
            <button onclick="navigator.clipboard.writeText('${item.link}'); App.showToast('Copiado!', 'success');" 
                    style="background:#f4f6f7; border:1px solid #ddd; padding:5px 10px; border-radius:5px; cursor:pointer; color:#333;">
                Copiar
            </button>
        </li>`;
    });
    html += `</ul>`;
    container.innerHTML = html;
},

    // ==========================================
// MÓDULO: SALVAR CUSTOMIZAÇÃO NA API
// ==========================================
salvarCustomizacaoMatricula: async function() {
    // Monta o objeto que vai para dentro da tua coleção "escola"
    const config = {
        configMatricula: {
            titulo: document.getElementById('customTitulo').value || 'Matrícula Online',
            corSecundaria: document.getElementById('customCor').value || '#3498db',
            logoUrl: document.getElementById('customLogoUrl').value || '',
            textoContrato: document.getElementById('editorContratoHtml').value // O ID da tua textarea do contrato
        }
    };
    
    try {
        Swal.fire({ title: 'A Sincronizar com a Nuvem...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        
        // Usa a tua rota existente "PUT /escola"
        const res = await fetch(`${CONFIG.API_URL}/escola`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(App.getTenantKey('token_acesso'))}` 
            },
            body: JSON.stringify(config)
        });
        
        if(res.ok) Swal.fire('Perfeito!', 'Configurações e Contrato atualizados online.', 'success');
        else throw new Error("Falha no servidor.");
    } catch(e) {
        Swal.fire('Erro', 'Não foi possível sincronizar com o servidor.', 'error');
    }
},

     // ==========================================
// MÓDULO: COFRE DE CONTRATOS DIGITAIS
// ==========================================
renderizarCofreContratos: async function() {
    const container = document.getElementById('conteudoPrincipal');
    if(!container) return;
    container.innerHTML = `<div style="padding: 40px; text-align: center;"><i class="fas fa-spinner fa-spin fa-2x"></i><br>A aceder ao cofre...</div>`;

    try {
        const res = await fetch(`${CONFIG.API_URL}/contratos`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem(App.getTenantKey('token_acesso'))}` }
        });
        if(!res.ok) throw new Error("Erro ao carregar contratos");
        const contratos = await res.json();
        
        let html = `
            <div class="header-tela">
                <h2>🔒 Cofre de Contratos Digitais</h2>
                <p>Documentos assinados em tempo real via matrícula online.</p>
            </div>
            <div class="card-tabela">
                <table style="width:100%; text-align:left; border-collapse: collapse;">
                    <tr style="background:#f4f6f7; border-bottom:2px solid #ddd;">
                        <th style="padding:12px;">Data/Hora</th>
                        <th style="padding:12px;">Aluno</th>
                        <th style="padding:12px;">Ação</th>
                    </tr>`;
                    
        if(contratos.length === 0) {
            html += `<tr><td colspan="3" style="text-align:center; padding:20px;">Nenhum contrato encontrado.</td></tr>`;
        } else {
            // Inverte a lista para mostrar o mais recente primeiro
            contratos.reverse().forEach(c => {
                const dataFormatada = c.dataHoraRegistro ? new Date(c.dataHoraRegistro).toLocaleString('pt-BR') : '---';
                html += `
                <tr style="border-bottom:1px solid #eee;">
                    <td style="padding:12px;">${dataFormatada}</td>
                    <td style="padding:12px;"><strong>${App.escapeHTML(c.nomeAluno || 'Aluno sem nome')}</strong></td>
                    <td style="padding:12px;">
                        <button onclick="App.abrirVisualizacaoContrato('${c.id}')" 
                                style="padding:8px 15px; font-size:12px; background:#2c3e50; color:white; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">
                            👁️ Ver
                        </button>
                    </td>
                </tr>`;
            });
        }
        html += `</table></div>`;
        container.innerHTML = html;
    } catch(error) {
        container.innerHTML = `<div style="padding: 20px; color: red;">Erro ao carregar o cofre: ${error.message}</div>`;
    }
},

// ESTA É A FUNÇÃO QUE ESTAVA COM O ERRO DE "UNDEFINED"
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
        
        // 3. Mapear todos os dados do aluno (com fallback para "Não informado" caso algum campo esteja vazio)
        const nomeAluno = contrato.nome || contrato.nomeAluno || "Aluno não identificado";
        const cpf = contrato.cpf || contrato.cpfAluno || "Não informado";
        const rg = contrato.rg || contrato.rgAluno || "Não informado";
        const dataNascimento = contrato.dataNascimento || contrato.dataNasc || "Não informada";
        const responsavel = contrato.responsavel || contrato.nomeResponsavel || contrato.resp_nome || "O Próprio / Não informado";
        const telefone = contrato.telefone || contrato.celular || "Não informado";
        const email = contrato.email || "Não informado";
        const endereco = contrato.endereco || "Não informado";
        const curso = contrato.curso || contrato.plano_curso || contrato.planoCurso || "Não informado";
        
        const corpoContrato = contrato.conteudoHTML || "<p>O contrato não possui texto legível.</p>";
        const dataBr = (contrato.dataHoraRegistro || contrato.dataHora || contrato.createdAt) 
            ? new Date(contrato.dataHoraRegistro || contrato.dataHora || contrato.createdAt).toLocaleString('pt-BR') 
            : 'Data não registada';

        // 4. Montar o HTML super otimizado para Impressão e Ecrã
        document.getElementById('modal-titulo').innerText = `Matrícula: ${nomeAluno}`;
        document.getElementById('modal-form-content').innerHTML = `
            <div id="area-impressao-contrato" style="padding: 30px; border: 1px solid #ccc; background: #fff; position:relative; color: #333; font-family: Arial, sans-serif;">
                
                <div style="text-align:center; margin-bottom:20px; border-bottom:2px solid #2c3e50; padding-bottom:15px;">
                    <h2 style="margin:0; color:#2c3e50; font-size:22px; text-transform:uppercase;">Ficha de Matrícula e Contrato</h2>
                    <div style="color:#27ae60; font-size:12px; font-weight:bold; margin-top:8px; display:inline-block; border:1px solid #27ae60; padding:4px 12px; border-radius:20px; background:#eafaf1;">
                        ✅ AUTENTICADO DIGITALMENTE
                    </div>
                </div>
                
                <h4 style="background: #f0f3f4; padding: 8px; border-left: 4px solid #3498db; margin-bottom: 10px; font-size: 14px; color:#2c3e50; text-transform: uppercase;">📋 Dados do Aluno e Matrícula</h4>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 25px; line-height: 1.6;">
                    <tr>
                        <td style="padding: 6px; border-bottom: 1px solid #eee; width: 50%;"><b>Nome do Aluno:</b> ${nomeAluno}</td>
                        <td style="padding: 6px; border-bottom: 1px solid #eee; width: 50%;"><b>CPF:</b> ${cpf}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>RG:</b> ${rg}</td>
                        <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>Data Nasc.:</b> ${dataNascimento}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>Responsável:</b> ${responsavel}</td>
                        <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>Telefone:</b> ${telefone}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>E-mail:</b> ${email}</td>
                        <td style="padding: 6px; border-bottom: 1px solid #eee;"><b>Curso/Plano:</b> ${curso}</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="padding: 6px; border-bottom: 1px solid #eee;"><b>Endereço:</b> ${endereco}</td>
                    </tr>
                </table>
                
                <h4 style="background: #f0f3f4; padding: 8px; border-left: 4px solid #e67e22; margin-bottom: 10px; font-size: 14px; color:#2c3e50; text-transform: uppercase;">📜 Termos do Contrato</h4>
                <div class="box-contrato-print" style="font-size:11px; text-align:justify; line-height:1.6; padding:10px; max-height:350px; overflow-y:auto; border: 1px solid #eee; background: #fafafa; border-radius: 4px; margin-bottom:20px;">
                    ${corpoContrato}
                </div>
                
                <div style="padding:15px; background:#eafaf1; border:1px solid #27ae60; text-align:center; font-size:12px; border-radius:6px; page-break-inside: avoid;">
                    <p style="margin:0 0 5px 0; color:#333;">Pelo presente instrumento, as partes concordam com todos os termos acima descritos.</p>
                    ✅ <b>ACEITE DIGITAL REGISTADO COM VALIDADE JURÍDICA:</b><br>
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
            btnConfirm.innerHTML = '🖨️ Imprimir Ficha Completa';
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
        const token = localStorage.getItem('token_acesso');
        if(!token) return App.showToast("Erro: Sessão inválida.", "error");

        area.innerHTML = '<p style="text-align:center; padding:20px; color:#666;">A carregar campanhas... ⏳</p>';

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const meuEscolaId = payload.escolaId;
            const linkBase = window.location.origin; 
            const urlPath = window.location.pathname.replace('/index.html', '').replace('/app.html', '');
            const linkBaseEscola = `${linkBase}${urlPath}/matricula.html?escola=${meuEscolaId}`;

            // Puxar links salvos na escola
            const escola = await App.api('/escola') || {};
            const links = escola.linksMatricula || [];

            let htmlLista = links.length === 0 
                ? '<p style="text-align:center; color:#999; font-size:13px; padding:20px; border: 1px dashed #ccc; border-radius: 8px;">Nenhum link gerado ainda. Crie o seu primeiro link acima!</p>' 
                : links.map(link => {
                const urlCompleta = `${linkBaseEscola}&ref=${link.id}`;
                return `
                <div style="background:#fff; border:1px solid #eee; padding:15px; border-radius:8px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; border-left: 5px solid #3498db; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
                    <div>
                        <div style="font-weight:bold; color:#2c3e50; font-size:14px;">🏷️ ${App.escapeHTML(link.nome)}</div>
                        <div style="font-size:11px; color:#7f8c8d; margin-top:4px;">📅 Gerado em: ${link.data}</div>
                        <div style="font-size:11px; color:#3498db; margin-top:4px; font-family:monospace; background:#f4f6f7; padding:4px; border-radius:4px;">...&ref=${link.id}</div>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <button onclick="navigator.clipboard.writeText('${urlCompleta}'); App.showToast('Link copiado!', 'success');" style="padding:8px 12px; font-size:12px; background:#3498db; color:white; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">📋 Copiar</button>
                        <button onclick="window.open('${urlCompleta}', '_blank')" style="padding:8px 12px; font-size:12px; background:#27ae60; color:white; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">🌐 Testar</button>
                        <button onclick="App.excluirLinkMatricula('${link.id}')" style="padding:8px 12px; font-size:12px; background:#e74c3c; color:white; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">🗑️</button>
                    </div>
                </div>`;
            }).join('');

            area.innerHTML = `
                <div class="card" style="animation: fadeIn 0.3s ease; border: 1px solid #eee; padding:30px;">
                    <div style="text-align:center;">
                        <div style="font-size: 40px; margin-bottom: 10px;">🔗</div>
                        <h3 style="margin-top:0; color:#2c3e50;">Gerador de Links Rastreados</h3>
                        <p style="font-size:13px; color:#7f8c8d; margin-bottom:20px;">Crie links personalizados para saber de onde vêm os seus alunos (Ex: Instagram, Panfleto).</p>
                        
                        <div style="display:flex; gap:10px; justify-content:center; margin-bottom: 30px; flex-wrap:wrap;">
                            <input type="text" id="nome-novo-link" placeholder="Nome da Campanha (Ex: Promoção Maio)" style="padding:12px; border-radius:6px; border:1px solid #ccc; width: 100%; max-width: 350px;">
                            <button class="btn-primary" onclick="App.gerarNovoLinkMatricula()" style="width:auto; padding: 12px 25px; background:#27ae60; border:none;">➕ Gerar Novo Link</button>
                        </div>
                    </div>

                    <h4 style="text-align:left; border-bottom: 2px solid #eee; padding-bottom: 10px; color:#2c3e50;">📜 Histórico de Links</h4>
                    <div style="text-align:left; max-height: 350px; overflow-y: auto; padding-right: 5px;">
                        ${htmlLista}
                    </div>
                </div>
            `;
        } catch(e) {
            App.showToast("Erro ao carregar área de links.", "error");
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
                    imagemHeader: 'https://placehold.co/800x200?text=Sua+Imagem+de+Cabecalho',
                    tituloHeader: 'Matrícula Online - PTT Cursos',
                    descHeader: 'Preencha os dados abaixo com atenção para garantir a sua vaga.',
                    opcoesPlano: 'Padrão, Intensivo, Personalizado',
                    opcoesVencimento: '08, 20',
                    textoContrato: `TERMO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS<br><br>CLÁUSULA PRIMEIRA – DO OBJETO<br>O presente contrato tem como objeto...`
                };
            }

            App.configTemp = { ...escola.configMatricula };

            area.innerHTML = `
                <div style="display:flex; gap:20px; flex-wrap: nowrap; align-items: flex-start;">
                    <div style="flex: 0 0 260px; width: 260px; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); box-sizing: border-box;">
                        <h3 style="margin-top:0; color:#2c3e50; font-size:16px; border-bottom:2px solid #eee; padding-bottom:10px;">🛠️ Ferramentas</h3>
                        <button class="btn-primary" style="width:100%; background:#f1f2f6; color:#2c3e50; border:1px solid #dcdde1; margin-bottom:10px; justify-content:flex-start;" onclick="App.editarConfig('imagem')">🖼️ Imagem do Cabeçalho</button>
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
                <div style="width:100%; height:120px; background:url('${App.configTemp.imagemHeader}') center/cover no-repeat; border-radius:8px 8px 0 0;"></div>
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
            const url = prompt("Cole o link (URL) da nova imagem de cabeçalho:", App.configTemp.imagemHeader);
            if (url !== null) { App.configTemp.imagemHeader = url; App.atualizarPreviewConfigurador(); }
        } 
        else if (tipo === 'titulo') {
            const txt = prompt("Digite o novo Título Principal:", App.configTemp.tituloHeader);
            if (txt !== null) { App.configTemp.tituloHeader = txt; App.atualizarPreviewConfigurador(); }
        }
        else if (tipo === 'descricao') {
            const txt = prompt("Digite a nova Descrição:", App.configTemp.descHeader);
            if (txt !== null) { App.configTemp.descHeader = txt; App.atualizarPreviewConfigurador(); }
        }
        else if (tipo === 'opcoes') {
            const planos = prompt("Digite as opções de PLANO DE CURSO separadas por vírgula:", App.configTemp.opcoesPlano);
            if (planos !== null) App.configTemp.opcoesPlano = planos;
            
            const dias = prompt("Digite as opções de DIA DE VENCIMENTO separadas por vírgula:", App.configTemp.opcoesVencimento);
            if (dias !== null) App.configTemp.opcoesVencimento = dias;
            
            App.atualizarPreviewConfigurador();
        }
        else if (tipo === 'contrato') {
            const modal = document.getElementById('modal-overlay'); 
            if(modal) modal.style.display = 'flex';
            document.getElementById('modal-titulo').innerText = "Editar Texto do Contrato";
            
            document.getElementById('modal-form-content').innerHTML = `
                <div style="background:#eafaf1; border:1px solid #27ae60; padding:10px; border-radius:6px; margin-bottom:15px;">
                    <p style="font-size:12px; color:#1e8449; margin:0 0 5px 0;"><strong>🪄 TAGS MÁGICAS:</strong> Escreva exatamente como está abaixo e o sistema substituirá pelos dados reais do aluno:</p>
                    <div style="font-size:12px; color:#2c3e50; font-family:monospace; display:flex; flex-wrap:wrap; gap:10px;">
                        <span style="background:#fff; padding:2px 5px; border-radius:3px; border:1px solid #ccc;">[NOME_ALUNO]</span>
                        <span style="background:#fff; padding:2px 5px; border-radius:3px; border:1px solid #ccc;">[CPF_ALUNO]</span>
                        <span style="background:#fff; padding:2px 5px; border-radius:3px; border:1px solid #ccc;">[RG_ALUNO]</span>
                        <span style="background:#fff; padding:2px 5px; border-radius:3px; border:1px solid #ccc;">[NOME_RESPONSAVEL]</span>
                        <span style="background:#fff; padding:2px 5px; border-radius:3px; border:1px solid #ccc;">[PLANO_CURSO]</span>
                    </div>
                </div>
                
                <div style="background:#f8f9fa; border:1px solid #ccc; border-bottom:none; padding:8px; display:flex; gap:8px; border-radius:6px 6px 0 0;">
                    <button type="button" onclick="document.execCommand('bold', false, null)" style="padding:5px 10px; cursor:pointer; background:#fff; border:1px solid #ddd; border-radius:4px; font-weight:bold;" title="Negrito">B</button>
                    <button type="button" onclick="document.execCommand('italic', false, null)" style="padding:5px 10px; cursor:pointer; background:#fff; border:1px solid #ddd; border-radius:4px; font-style:italic;" title="Itálico">I</button>
                    <button type="button" onclick="document.execCommand('underline', false, null)" style="padding:5px 10px; cursor:pointer; background:#fff; border:1px solid #ddd; border-radius:4px; text-decoration:underline;" title="Sublinhado">U</button>
                </div>
                
                <div id="txt-edicao-contrato" contenteditable="true" style="width:100%; height:350px; padding:15px; border-radius:0 0 8px 8px; border:1px solid #ccc; font-family:sans-serif; line-height:1.5; overflow-y:auto; background:#fff; outline:none; box-sizing:border-box;">${App.configTemp.textoContrato}</div>
            `;
            
            const btnConfirm = document.querySelector('.btn-confirm');
            btnConfirm.style.display = 'inline-flex';
            btnConfirm.innerHTML = "Aplicar ao Preview";
            btnConfirm.onclick = () => {
                App.configTemp.textoContrato = document.getElementById('txt-edicao-contrato').innerHTML;
                App.atualizarPreviewConfigurador();
                App.fecharModal();
            };
        }
    },

    salvarConfiguradorMatricula: async () => {
        document.body.style.cursor = 'wait';
        try {
            const escola = await App.api('/escola') || {};
            escola.configMatricula = App.configTemp;
            await App.api('/escola', 'PUT', escola);
            App.showToast("Configurações da matrícula salvas com sucesso!", "success");
        } catch(e) {
            App.showToast("Erro ao guardar as configurações.", "error");
        } finally {
            document.body.style.cursor = 'default';
        }
    },

    abrirModalConfirmacao: (titulo, subtitulo, acaoConfirmar) => {
        let modal = document.getElementById('modal-confirmacao-bonito');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-confirmacao-bonito';
            modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); display:flex; justify-content:center; align-items:center; z-index:10000; opacity:0; transition:opacity 0.3s ease;';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div style="background:#fff; padding:30px; border-radius:24px; width:90%; max-width:380px; text-align:center; box-shadow:0 20px 50px rgba(0,0,0,0.3); transform:scale(0.8); transition:transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);" id="box-confirmacao-interno">
                <div style="width:80px; height:80px; border-radius:50%; background:#fdedec; color:#e74c3c; font-size:40px; display:flex; align-items:center; justify-content:center; margin:0 auto 20px auto; border:4px solid #f9ebea;">🗑️</div>
                <h3 style="color:#2c3e50; margin:0 0 10px 0; font-size:22px; font-weight:800;">${titulo}</h3>
                <p style="color:#7f8c8d; font-size:14px; margin-bottom:25px; line-height:1.5;">${subtitulo}</p>
                <div style="display:flex; gap:12px; justify-content:center;">
                    <button onclick="document.getElementById('modal-confirmacao-bonito').style.opacity='0'; setTimeout(()=>document.getElementById('modal-confirmacao-bonito').style.display='none', 300);" style="flex:1; padding:12px; background:#f4f6f7; color:#7f8c8d; border:1px solid #d5dbdb; border-radius:12px; font-weight:bold; cursor:pointer; font-size:14px; transition:background 0.2s;" onmouseover="this.style.background='#e5e8e8'" onmouseout="this.style.background='#f4f6f7'">Cancelar</button>
                    <button id="btn-confirmar-acao-bonita" style="flex:1; padding:12px; background:#e74c3c; color:#fff; border:none; border-radius:12px; font-weight:bold; cursor:pointer; font-size:14px; box-shadow:0 4px 15px rgba(231,76,60,0.3); transition:background 0.2s;" onmouseover="this.style.background='#c0392b'" onmouseout="this.style.background='#e74c3c'">Sim, Apagar</button>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
        setTimeout(() => {
            modal.style.opacity = '1';
            document.getElementById('box-confirmacao-interno').style.transform = 'scale(1)';
        }, 10);

        document.getElementById('btn-confirmar-acao-bonita').onclick = function() {
            const btn = this;
            btn.innerHTML = "A apagar... ⏳";
            btn.style.opacity = '0.8';
            btn.disabled = true;
            acaoConfirmar(modal); 
        };
    }

}; // <--- O OBJETO APP FECHA CORRETAMENTE AQUI!

// =========================================================
// EVENTOS DE ARRANQUE E PWA
// =========================================================
document.addEventListener('DOMContentLoaded', App.init);
document.addEventListener('keydown', function(event) { if (event.key === "Escape") { App.fecharModal(); if(typeof App.fecharModalInst === 'function') App.fecharModalInst(); } });
window.addEventListener('focus', () => { const telaSistema = document.getElementById('tela-sistema'); if (App.usuario && telaSistema && telaSistema.style.display !== 'none') { App.verificarNotificacoes(); } });

document.addEventListener('click', (e) => {
    const container = document.querySelector('.notification-container');
    if (container && !container.contains(e.target)) {
        const dropdown = document.getElementById('noti-dropdown'); if (dropdown) dropdown.classList.remove('active');
    }
});

// =========================================================
// 📡 DETEÇÃO DE LIGAÇÃO (ONLINE / OFFLINE)
// =========================================================

// Ouvinte que dispara quando o dispositivo PERDE a internet
window.addEventListener('offline', () => {
    const banner = document.getElementById('offline-banner');
    if (banner) banner.style.display = 'block'; // Mostra o banner vermelho
    
    // Como você já tem um sistema de Toast no seu app.js, vamos usá-lo também!
    if (typeof App.showToast === 'function') {
        App.showToast("Sem ligação à Internet!", "error");
    }
});

// Ouvinte que dispara quando o dispositivo RECUPERA a internet
window.addEventListener('online', () => {
    const banner = document.getElementById('offline-banner');
    if (banner) banner.style.display = 'none'; // Esconde o banner vermelho
    
    if (typeof App.showToast === 'function') {
        App.showToast("Ligação à Internet restaurada!", "success");
    }
});

let deferredPrompt; window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; const installBanner = document.getElementById('pwa-install-banner'); if (installBanner) { installBanner.style.display = 'block'; } });
const btnInstall = document.getElementById('pwa-btn-install'); if (btnInstall) { btnInstall.addEventListener('click', async () => { const installBanner = document.getElementById('pwa-install-banner'); installBanner.style.display = 'none'; if (deferredPrompt) { deferredPrompt.prompt(); const { outcome } = await deferredPrompt.userChoice; deferredPrompt = null; } }); }
const btnCancel = document.getElementById('pwa-btn-cancel'); if (btnCancel) { btnCancel.addEventListener('click', () => { const installBanner = document.getElementById('pwa-install-banner'); installBanner.style.display = 'none'; }); }
window.addEventListener('appinstalled', () => { 
    const installBanner = document.getElementById('pwa-install-banner'); if (installBanner) installBanner.style.display = 'none'; deferredPrompt = null; 
    if (typeof gtag === 'function') gtag('event', 'app_install', { platform: 'PWA Web' });
    App.showToast('App instalada com sucesso! 🎉', 'success'); 
});