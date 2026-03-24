// =========================================================
// SISTEMA ESCOLAR - APP.JS (V156 - MASTER: PDV, SININHO, VITRINE E MÁSCARAS)
// =========================================================

const API_URL = CONFIG.API_URL; 

const LISTA_FUNCIONALIDADES = [
    { id: 'novo_aluno', nome: 'Novo Aluno', icon: '👨‍🎓', acao: "App.abrirModalCadastro('aluno')" },
    { id: 'fin_carne', nome: 'Gerar Carnê', icon: '💸', acao: "App.renderizarTela('mensalidades')" },
    { id: 'ped_chamada', nome: 'Fazer Chamada', icon: '📋', acao: "App.renderizarTela('chamada')" },
    { id: 'ped_notas', nome: 'Lançar Nota', icon: '📝', acao: "App.renderizarTela('avaliacoes')" },
    { id: 'ped_plan', nome: 'Planejamento', icon: '📅', acao: "App.renderizarTela('planejamento')" },
    { id: 'ped_bol', nome: 'Boletins', icon: '🖨️', acao: "App.renderizarTela('boletins')" },
    { id: 'fin_inad', nome: 'Inadimplência', icon: '⚠️', acao: "App.renderizarTela('inadimplencia')" },
    { id: 'fin_rel', nome: 'Rel. Financeiro', icon: '📊', acao: "App.renderizarRelatorio('financeiro')" },
    { id: 'doc_ficha', nome: 'Ficha Matrícula', icon: '📄', acao: "App.renderizarRelatorio('ficha')" },
    { id: 'doc_dossie', nome: 'Dossiê Executivo', icon: '📁', acao: "App.renderizarRelatorio('dossie')" },
    { id: 'doc_gerador', nome: 'Documentos', icon: '🎓', acao: "App.renderizarRelatorio('documentos')" } 
];

const App = {
    usuario: null, entidadeAtual: null, idEdicao: null, idEdicaoUsuario: null, listaCache: [], 
    calendarState: { month: new Date().getMonth(), year: new Date().getFullYear() },

    escapeHTML: (str) => {
        if (str === null || str === undefined) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    },

    getTenantKey: (chaveBase) => {
        const tenantId = (App.usuario && App.usuario.id) ? App.usuario.id : 'convidado';
        return `${chaveBase}_${tenantId}`;
    },

    getPlanoAtual: () => { return localStorage.getItem(App.getTenantKey('escola_plano')) || 'Teste'; },

    verificarPermissao: (funcionalidade) => {
        const plano = App.getPlanoAtual();
        if (plano === 'Premium') return true; 
        if (funcionalidade === 'whatsapp' && (plano === 'Essencial' || plano === 'Teste')) {
            App.showToast("💎 Funcionalidade Premium. Faça o upgrade para cobrar via WhatsApp num clique!", "warning");
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
            
            // LER A RESPOSTA MESMO COM ERRO (Para pegar as mensagens do servidor)
            let data;
            try { data = await response.json(); } catch(e) { data = null; }

            if (!response.ok) { 
                // Se for 401/403 e NÃO for a rota de login, a sessão expirou
                if ((response.status === 401 || response.status === 403) && !endpoint.startsWith('/auth/')) { 
                    App.showToast("Sessão expirada. Faça login novamente.", "warning");
                    App.logout(); 
                }
                // Retorna os dados de erro para o ecrã poder mostrar a mensagem (Ex: "Senha incorreta")
                return data || { error: `Erro HTTP: ${response.status}` };
            }
            
            if (method !== 'GET' && App.usuario) setTimeout(App.verificarNotificacoes, 800);
            return data;
        } catch (error) { 
            console.error("Erro no fetch:", error);
            // Nunca retornar nulo. Retornamos um objeto padronizado para evitar falhas no ecrã
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
    // MÁSCARAS DE FORMATAÇÃO (RESTAURADAS)
    // =========================================================
    mascaraCNPJ: (i) => { let v = i.value.replace(/\D/g,""); v=v.replace(/^(\d{2})(\d)/,"$1.$2"); v=v.replace(/^(\d{2})\.(\d{3})(\d)/,"$1.$2.$3"); v=v.replace(/\.(\d{3})(\d)/,".$1/$2"); v=v.replace(/(\d{4})(\d)/,"$1-$2"); i.value = v; },
    mascaraCPF: (i) => { let v = i.value.replace(/\D/g, ""); v = v.replace(/(\d{3})(\d)/, "$1.$2"); v = v.replace(/(\d{3})(\d)/, "$1.$2"); v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2"); i.value = v; },
    mascaraCelular: (i) => { let v = i.value.replace(/\D/g, ""); v = v.replace(/^(\d{2})(\d)/g, "($1) $2"); v = v.replace(/(\d)(\d{4})$/, "$1-$2"); i.value = v; },
    mascaraCEP: (i) => { let v = i.value.replace(/\D/g, ""); v = v.replace(/^(\d{5})(\d)/, "$1-$2"); i.value = v; },
    mascaraValor: (i) => { let v = i.value.replace(/\D/g, ""); v = (v / 100).toFixed(2) + ""; i.value = v; },

    // =========================================================
    // ARRANQUE E LOGIN (COM GATILHOS DE RASTREAMENTO GA4)
    // =========================================================
    init: async () => {
        localStorage.removeItem('escola_tema'); localStorage.removeItem('escola_atalhos'); localStorage.removeItem('escola_perfil');
        const salvo = localStorage.getItem('usuario_logado'); const token = localStorage.getItem('token_acesso'); const bioId = localStorage.getItem('escola_bio_id');

        if (salvo && token) { 
            App.usuario = JSON.parse(salvo); 
            App.aplicarTemaSalvo();

            const keyAtalhos = App.getTenantKey('escola_atalhos');
            if (!localStorage.getItem(keyAtalhos)) { localStorage.setItem(keyAtalhos, JSON.stringify(['novo_aluno','fin_carne','ped_chamada','ped_notas','ped_plan','ped_bol'])); }

            if (bioId && window.PublicKeyCredential) {
                document.getElementById('tela-login').style.display = 'flex'; document.getElementById('tela-sistema').style.display = 'none';
                document.getElementById('btn-biometria').style.display = 'block'; App.entrarComBiometria(); 
            } else { App.entrarNoSistema(); }
        } else { 
            document.documentElement.removeAttribute('style'); document.getElementById('tela-login').style.display = 'flex'; document.getElementById('tela-sistema').style.display = 'none'; 
        }
        
        const dataEl = document.getElementById('data-hoje'); if(dataEl) dataEl.innerText = new Date().toLocaleDateString('pt-BR');
        App.setupMobileMenu(); 
        
        if (App.usuario) { await App.carregarDadosEscola(); }

        const passInput = document.getElementById('login-pass'); if(passInput) { passInput.addEventListener('keypress', function (e) { if (e.key === 'Enter') { App.fazerLogin(); } }); }
    },

    fazerLogin: async () => {
        const login = document.getElementById('login-user').value.trim();
        const pass = document.getElementById('login-pass').value.trim();
        if(!login || !pass) return App.showToast("Preencha utilizador e senha", "warning");
        
        const btn = document.querySelector('#tela-login button[type="submit"]');
        const txt = btn.innerText; btn.innerText = "Autenticando... ⏳"; btn.disabled = true;
        
        try {
            const res = await App.api('/auth/login', 'POST', { login: login, senha: pass });
            if(res && res.success) {
                App.usuario = res.usuario;
                localStorage.setItem('usuario_logado', JSON.stringify(res.usuario));
                localStorage.setItem('token_acesso', res.token);
                
                // 🚀 RASTREAMENTO GA4: Evento de Login
                if (typeof gtag === 'function') gtag('event', 'login', { method: 'Sistema PTT' });
                
                App.aplicarTemaSalvo();
                const keyAtalhos = App.getTenantKey('escola_atalhos');
                if (!localStorage.getItem(keyAtalhos)) { localStorage.setItem(keyAtalhos, JSON.stringify(['novo_aluno','fin_carne','ped_chamada','ped_notas','ped_plan','ped_bol'])); }

                App.entrarNoSistema();
                App.showToast('Bem-vindo ao sistema!', 'success');
            } else { App.showToast(res.error || "Login ou senha incorretos", "error"); }
        } catch(e) { App.showToast("Erro ao conectar no servidor", "error"); } 
        finally { btn.innerText = txt; btn.disabled = false; }
    },

    entrarNoSistema: () => {
        document.getElementById('tela-login').style.display = 'none';
        document.getElementById('tela-sistema').style.display = 'flex';
        const el = document.getElementById('user-name');
        if(el && App.usuario) el.innerText = App.usuario.nome || App.usuario.login;
        App.renderizarInicio();
    },

    logout: () => {
        document.documentElement.removeAttribute('style');
        localStorage.removeItem('usuario_logado'); localStorage.removeItem('token_acesso'); App.usuario = null;
        document.getElementById('login-user').value = ''; document.getElementById('login-pass').value = '';
        document.getElementById('tela-sistema').style.display = 'none';
        const telaLogin = document.getElementById('tela-login'); telaLogin.style.display = telaLogin.classList.contains('login-wrapper') ? 'flex' : 'block';
    },

    // =========================================================
    // BIOMETRIA REAL (WEBAUTHN)
    // =========================================================
    bufferToBase64: (buf) => { const bytes = new Uint8Array(buf); let str = ''; for (let i = 0; i < bytes.byteLength; i++) { str += String.fromCharCode(bytes[i]); } return btoa(str); },
    base64ToBuffer: (b64) => { const bin = atob(b64); const bytes = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) { bytes[i] = bin.charCodeAt(i); } return bytes; },

    configurarBiometria: async () => {
        if (!window.PublicKeyCredential) return App.showToast("O seu dispositivo não suporta biometria na Web.", "error");
        try {
            App.showToast("Aguardando verificação biométrica...", "info");
            const challenge = new Uint8Array(32); window.crypto.getRandomValues(challenge);
            const userId = new Uint8Array(16); window.crypto.getRandomValues(userId);
            const cred = await navigator.credentials.create({
                publicKey: {
                    challenge: challenge, rp: { name: "Sistema Escolar" },
                    user: { id: userId, name: App.usuario.login, displayName: App.usuario.nome },
                    pubKeyCredParams: [{type: "public-key", alg: -7}, {type: "public-key", alg: -257}],
                    authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
                    timeout: 60000
                }
            });
            localStorage.setItem('escola_bio_id', App.bufferToBase64(cred.rawId));
            App.showToast("✅ Biometria ativada com sucesso!", "success");
            App.renderizarMinhaConta();
        } catch (e) { console.error(e); App.showToast("Erro ao configurar. Verifique se tem FaceID/Digital ativo.", "error"); }
    },

    entrarComBiometria: async () => {
        const bioId = localStorage.getItem('escola_bio_id');
        if (!bioId) return App.showToast("Biometria não configurada para este utilizador.", "warning");
        try {
            const challenge = new Uint8Array(32); window.crypto.getRandomValues(challenge);
            const rawId = App.base64ToBuffer(bioId);
            const assertion = await navigator.credentials.get({
                publicKey: { challenge: challenge, allowCredentials: [{ type: "public-key", id: rawId }], userVerification: "required" }
            });
            if (assertion) { App.showToast("🔓 Identidade confirmada!", "success"); App.entrarNoSistema(); }
        } catch (e) { console.error(e); App.showToast("Falha na validação. Por favor, insira a sua senha.", "error"); }
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
                // 🚀 RASTREAMENTO GA4: Novo Lead/Escola
                if (typeof gtag === 'function') gtag('event', 'generate_lead', { currency: 'BRL', value: 0.00, tipo_conta: 'Nova Escola' });
            } 
            else { App.showToast(res.error || 'Dados incorretos.', 'error'); }
        } catch(e) { App.showToast('Erro de servidor.', 'error'); } finally { btn.innerText = txt; btn.disabled = false; }
    },

    // =========================================================
    // UTILITÁRIOS DA INTERFACE
    // =========================================================
    showToast: (mensagem, tipo = 'info') => {
        let container = document.getElementById('toast-container'); if (!container) { container = document.createElement('div'); container.id = 'toast-container'; document.body.appendChild(container); }
        const toast = document.createElement('div'); toast.className = `toast ${tipo}`; const icon = tipo === 'success' ? '✅' : (tipo === 'error' ? '❌' : (tipo === 'warning' ? '⚠️' : 'ℹ️'));
        toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${App.escapeHTML(mensagem)}</span>`; container.appendChild(toast);
        setTimeout(() => { toast.style.animation = 'fadeOut 0.5s ease forwards'; setTimeout(() => toast.remove(), 500); }, 3000);
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
    // VISÃO GERAL (DASHBOARD)
    // =========================================================
    renderizarInicio: async () => { 
        App.verificarNotificacoes(); 
        App.setTitulo("Visão Geral"); const div = document.getElementById('app-content'); div.innerHTML = '<p style="padding:20px; text-align:center; color:#666;">Carregando painel de métricas...</p>';
        try {
            const [alunos, financeiro, turmas, cursos] = await Promise.all([ App.api('/alunos'), App.api('/financeiro'), App.api('/turmas'), App.api('/cursos') ]);
            const listaAlunos = Array.isArray(alunos) ? alunos : []; const listaFin = Array.isArray(financeiro) ? financeiro : []; const listaTurmas = Array.isArray(turmas) ? turmas : []; const listaCursos = Array.isArray(cursos) ? cursos : [];
            const dataHoje = new Date(); const mesAtual = dataHoje.getMonth() + 1; const anoAtual = dataHoje.getFullYear();
            const financasMes = listaFin.filter(f => { if(!f.vencimento) return false; const parts = f.vencimento.split('-'); return parseInt(parts[1]) === mesAtual && parseInt(parts[0]) === anoAtual; });
            const totalRecebido = financasMes.filter(f => f.status === 'Pago').reduce((acc, cur) => acc + parseFloat(cur.valor), 0);
            const totalPendente = financasMes.filter(f => f.status !== 'Pago').reduce((acc, cur) => acc + parseFloat(cur.valor), 0);
            const inadimplentesList = listaFin.filter(f => f.status === 'Pendente' && new Date(f.vencimento + 'T00:00:00') < dataHoje).sort((a,b) => new Date(a.vencimento) - new Date(b.vencimento));
            const formatarMoeda = (valor) => valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            let idsAtalhos = JSON.parse(localStorage.getItem(App.getTenantKey('escola_atalhos')));
            if (!idsAtalhos || !Array.isArray(idsAtalhos) || idsAtalhos.length === 0) { idsAtalhos = ['novo_aluno','fin_carne','ped_chamada','ped_notas','ped_plan','ped_bol']; }
            const htmlAtalhos = idsAtalhos.map(id => { const func = LISTA_FUNCIONALIDADES.find(f => f.id === id); return func ? `<div class="shortcut-btn" onclick="${func.acao}"><div>${func.icon}</div><span>${func.nome}</span></div>` : ''; }).join('');

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
                    <div class="stat-card card-green" style="display:block; position:relative;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;"><div class="stat-info"><h4>Receita (${mesAtual}/${anoAtual})</h4><p style="color:#27ae60; font-size:20px;">R$ ${formatarMoeda(totalRecebido)}</p></div><div class="stat-icon" style="font-size:24px;">💰</div></div>
                        <div style="height:140px; width:100%; display:flex; justify-content:center; align-items:center;"><canvas id="graficoFinanceiro"></canvas></div>
                        <div style="text-align:center; font-size:11px; color:#666; margin-top:10px; border-top:1px solid #eee; padding-top:5px;">Pendente no mês: <span style="color:#e74c3c; font-weight:bold;">R$ ${formatarMoeda(totalPendente)}</span></div>
                    </div>
                    <div class="stat-card card-red" style="display:flex; flex-direction:column; align-items:stretch; padding:15px; max-height:260px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid #fdedec; padding-bottom:8px;"><h4 style="margin:0; font-size:14px; color:#e74c3c; text-transform:uppercase; font-weight:bold;">⚠️ Títulos em Atraso (${inadimplentesList.length})</h4></div>
                        <div style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:10px; padding-right:5px;">${htmlInadimplentes}</div>
                    </div>
                </div>
                <h3 style="color:var(--card-text); font-size:16px; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">Acesso Rápido</h3>
                <div class="shortcuts-grid">${htmlAtalhos || '<p style="color:#666;">Nenhum atalho selecionado.</p>'}</div>`;

            const ctx = document.getElementById('graficoFinanceiro');
            if(ctx && (totalRecebido > 0 || totalPendente > 0)) {
                new Chart(ctx, { type: 'doughnut', data: { labels: ['Recebido', 'Pendente'], datasets: [{ data: [totalRecebido, totalPendente], backgroundColor: ['#27ae60', '#e74c3c'], borderWidth: 0, hoverOffset: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '75%' } });
            } else if (ctx) { new Chart(ctx, { type: 'doughnut', data: { datasets: [{ data: [1], backgroundColor: ['#eee'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, cutout: '75%' } }); }
        } catch(e) { console.error(e); div.innerHTML = "<p>Erro ao carregar dashboard.</p>"; }
    },

    cobrarWhatsAppDashboard: (nomeAluno, telefone, dataVencimento, valorFmt) => {
        if (!App.verificarPermissao('whatsapp')) return;
        if (!telefone || telefone.trim() === '' || telefone === 'undefined') { App.showToast("Este aluno não tem um número de WhatsApp registado no sistema!", "error"); return; }
        let numero = telefone.replace(/\D/g, ''); if (numero.length === 10 || numero.length === 11) numero = '55' + numero;
        const msg = `🔔 LEMBRETE\nHello! Are you ok?\n\nVenceu em ${dataVencimento} a mensalidade do seu curso de inglês. Para realizar o pagamento, basta enviar o valor de R$ ${valorFmt} para o PIX CELULAR abaixo:\n\n(73) 98890-9273\nPTT CURSOS\nPaulo Sérgio Bispo Santana Júnior\nCORA\n\nObs.: Após o pagamento, por favor, enviar o comprovante para baixa no sistema.\n\n🙏 Agradeço desde já e desejo a você um excelente dia! 😉✅`;
        window.open(`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`, '_blank');
    },

    // =========================================================
    // ROTEAMENTO DE TELAS
    // =========================================================
    renderizarTela: async (tela) => {
        if (!App.usuario && tela !== 'login') { App.showToast("Sessão expirada. Faça login novamente.", "error"); App.logout(); return; }
        if(document.querySelector('.sidebar')) document.querySelector('.sidebar').classList.remove('active');
        if(document.querySelector('.mobile-overlay')) document.querySelector('.mobile-overlay').classList.remove('active');

        // 🚀 RASTREAMENTO GA4: Pageview Virtual
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
    // 💎 O MEU PLANO (VITRINE DO MERCADO PAGO RESTAURADA DA V145)
    // =========================================================
    renderizarMeuPlano: () => {
        App.setTitulo("Gerenciar Assinatura");
        const div = document.getElementById('app-content');
        
        const planoAtual = App.getPlanoAtual();
        let corPlano = planoAtual === 'Premium' ? '#f39c12' : (planoAtual === 'Profissional' ? '#3498db' : '#27ae60');
        const infoPlano = planoAtual === 'Teste' ? '<strong style="color:var(--warning); background:rgba(243,156,18,0.1); padding:4px 10px; border-radius:20px;">Plano Teste (7 dias restantes)</strong>' : `<strong style="color:${corPlano}; background:rgba(0,0,0,0.02); padding:8px 20px; border-radius:20px; border:2px solid ${corPlano}; font-size:16px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">💎 PLANO ATUAL: ${App.escapeHTML(planoAtual).toUpperCase()}</strong>`;
        
        div.innerHTML = `
            <div class="card" style="text-align:center; padding: 40px 20px; border-top: 5px solid var(--accent);">
                <h2 style="margin: 0 0 15px 0; color: var(--card-text);">Evolua a sua Instituição</h2>
                <div style="margin-bottom: 30px;">${infoPlano}</div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; max-width: 500px; margin: 0 auto; border: 1px solid #eee;">
                    <h4 style="margin: 0 0 15px 0; color: #333;">Já efetuou o pagamento?</h4>
                    <div style="display:flex; gap:10px; flex-wrap:wrap;">
                        <input type="text" id="input-novo-pin" placeholder="Insira a sua Chave de Ativação (PIN)" style="flex:1; min-width: 200px; padding:12px; border-radius:6px; border:1px solid #ccc; text-align:center; letter-spacing:2px; font-weight:bold; font-size:16px;">
                        <button class="btn-primary" style="width:auto; margin:0;" onclick="App.ativarNovoPlano()">Validar PIN</button>
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
                        <li style="margin-bottom:10px;">✅ Até 60 Alunos Ativos</li><li style="margin-bottom:10px;">✅ 2 Acessos (Gestor + Sec)</li><li style="margin-bottom:10px;">✅ Gestão Pedagógica</li><li style="margin-bottom:10px;">✅ Controlo Financeiro</li><li style="margin-bottom:10px; color:#ccc;">❌ Cobrança WhatsApp</li><li style="color:#ccc;">❌ Dossiê Executivo</li>
                    </ul>
                    <button class="btn-primary" style="width:100%; background:transparent; color:#27ae60; border:2px solid #27ae60; justify-content:center;" onclick="App.comprarPlano('Essencial', 'https://mpago.la/2LcgaA1')">Assinar Essencial</button>
                </div>

                <div class="pricing-card featured" style="background:#fff; border:2px solid #3498db; border-radius:12px; padding:30px; text-align:center; box-shadow:0 10px 30px rgba(52,152,219,0.15); position:relative; transform:scale(1.02);">
                    <div style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#3498db; color:#fff; font-size:11px; font-weight:bold; padding:4px 12px; border-radius:20px; text-transform:uppercase; letter-spacing:1px;">Mais Vendido</div>
                    <h3 style="margin-top:0; color:#333; font-size:22px;">Profissional</h3>
                    <div style="font-size:32px; font-weight:bold; color:#3498db; margin:15px 0;">R$ 147<span style="font-size:14px; color:#999;">/mês</span></div>
                    <p style="color:#666; font-size:13px; margin-bottom:20px;">A solução completa para acabar com a inadimplência.</p>
                    <ul style="list-style:none; padding:0; margin:0 0 25px 0; text-align:left; font-size:14px; color:#555;">
                        <li style="margin-bottom:10px;">✅ Até 200 Alunos Ativos</li><li style="margin-bottom:10px;">✅ 5 Acessos (Equipa)</li><li style="margin-bottom:10px;">✅ Gestão Pedagógica</li><li style="margin-bottom:10px;">✅ Financeiro Completo</li><li style="margin-bottom:10px;">✅ <strong>Cobrança WhatsApp</strong></li><li style="color:#ccc;">❌ Dossiê Executivo</li>
                    </ul>
                    <button class="btn-primary" style="width:100%; background:#3498db; justify-content:center;" onclick="App.comprarPlano('Profissional', 'https://mpago.la/1KmmwZf')">Assinar Profissional</button>
                </div>

                <div class="pricing-card" style="background:#fff; border:1px solid #eee; border-radius:12px; padding:30px; text-align:center; box-shadow:0 4px 15px rgba(0,0,0,0.05);">
                    <h3 style="margin-top:0; color:#333; font-size:22px;">Premium</h3>
                    <div style="font-size:32px; font-weight:bold; color:#f39c12; margin:15px 0;">R$ 297<span style="font-size:14px; color:#999;">/mês</span></div>
                    <p style="color:#666; font-size:13px; margin-bottom:20px;">Para escolas estruturadas e sem limites operacionais.</p>
                    <ul style="list-style:none; padding:0; margin:0 0 25px 0; text-align:left; font-size:14px; color:#555;">
                        <li style="margin-bottom:10px;">✅ Alunos Ilimitados</li><li style="margin-bottom:10px;">✅ Acessos Ilimitados</li><li style="margin-bottom:10px;">✅ Gestão Pedagógica</li><li style="margin-bottom:10px;">✅ Financeiro Completo</li><li style="margin-bottom:10px;">✅ Cobrança WhatsApp</li><li>✅ <strong>Dossiê Executivo</strong></li>
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

    ativarNovoPlano: async () => {
        const pin = document.getElementById('input-novo-pin').value.trim().toUpperCase();
        if(!pin) return App.showToast("Por favor, insira o PIN recebido no e-mail.", "warning");

        const btn = document.querySelector('button[onclick="App.ativarNovoPlano()"]');
        const txt = btn.innerText; btn.innerText = "A validar... ⏳"; btn.disabled = true;

        try {
            const res = await App.api('/escola/validar-pin', 'POST', { pin: pin });
            if (res && res.success) {
                localStorage.setItem(App.getTenantKey('escola_plano'), res.plano);
                App.showToast(`🎉 PIN validado! O seu novo plano é: ${res.plano}. A reiniciar o sistema...`, "success");
                document.getElementById('input-novo-pin').value = '';
                setTimeout(() => { window.location.reload(); }, 2000);
            } else { App.showToast(res.error || "PIN inválido ou expirado.", "error"); }
        } catch(e) { 
            let novoPlano = 'Profissional';
            if (pin.includes('PRE')) novoPlano = 'Premium';
            else if (pin.includes('ESS')) novoPlano = 'Essencial';
            else if (pin.includes('PRO')) novoPlano = 'Profissional';
            else { App.showToast("PIN em formato inválido.", "error"); btn.innerText = txt; btn.disabled = false; return; }
            
            try {
                const escolaAtual = await App.api('/escola') || {};
                await App.api('/escola', 'PUT', { ...escolaAtual, plano: novoPlano, pinUsado: pin });
                localStorage.setItem(App.getTenantKey('escola_plano'), novoPlano);
                App.showToast(`🎉 PIN validado com sucesso! Plano atualizado para ${novoPlano}. A reiniciar...`, "success");
                document.getElementById('input-novo-pin').value = '';
                setTimeout(() => { window.location.reload(); }, 2000);
            } catch(errFallback) { App.showToast("Erro ao comunicar com a base de dados.", "error"); }
        } finally { btn.innerText = txt; btn.disabled = false; }
    },

    abrirModalCadastro: async (tipo, id) => { 
        if (typeof App.abrirModalCadastroModulo === 'function') { App.abrirModalCadastroModulo(tipo, id); } 
    },
    abrirRelatorioFrequencia: async (idAluno, nomeAluno) => {
        const modal = document.getElementById('modal-overlay'); if(modal) modal.style.display = 'flex';
        document.getElementById('modal-titulo').innerText = `Frequência Escolar: ${App.escapeHTML(nomeAluno)}`;
        document.getElementById('modal-form-content').innerHTML = '<p style="text-align:center; padding:20px; color:#666;">A calcular horas e presenças... ⏳</p>';
        
        const btnConfirm = document.querySelector('.btn-confirm');
        if(btnConfirm) btnConfirm.style.display = 'none'; // Esconde botão de salvar, pois é apenas um relatório

        try {
            const chamadas = await App.api('/chamadas');
            const historico = chamadas.filter(c => c.idAluno === idAluno).sort((a,b) => new Date(b.data) - new Date(a.data));
            
            let minPresenca = 0; let minFalta = 0; let htmlMeses = '';
            
            if (historico.length === 0) {
                htmlMeses = '<p style="text-align:center; padding:30px; color:#999; font-size:14px;">Nenhum registo de chamada encontrado para este aluno.</p>';
            } else {
                const agrupado = {};
                const mesesNomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
                
                // Agrupar por Mês e somar minutos
                historico.forEach(c => {
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
                    else if (c.status === 'Falta') minFalta += mins;
                });
                
                // Desenhar as tabelas separadas por mês
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
                <div style="display:flex; gap:15px; margin-top:20px;">
                    <div style="flex:1; background:#eafaf1; border:1px solid #27ae60; padding:15px; border-radius:8px; text-align:center;">
                        <div style="font-size:11px; color:#27ae60; font-weight:bold; text-transform:uppercase; margin-bottom:5px;">Total Presenças</div>
                        <div style="font-size:20px; font-weight:bold; color:#1e8449;">${fmtHoras(minPresenca)}</div>
                    </div>
                    <div style="flex:1; background:#fdedec; border:1px solid #e74c3c; padding:15px; border-radius:8px; text-align:center;">
                        <div style="font-size:11px; color:#e74c3c; font-weight:bold; text-transform:uppercase; margin-bottom:5px;">Total Faltas</div>
                        <div style="font-size:20px; font-weight:bold; color:#c0392b;">${fmtHoras(minFalta)}</div>
                    </div>
                </div>`;
                
            document.getElementById('modal-form-content').innerHTML = `
                <div style="max-height:50vh; overflow-y:auto; padding-right:10px;">${htmlMeses}</div>
                ${kpiHTML}
            `;
        } catch(e) { document.getElementById('modal-form-content').innerHTML = '<p style="color:red; text-align:center;">Erro ao processar as horas de frequência.</p>'; }
    },
    
    // =========================================================
    // O VERDADEIRO PDV (VENDA RÁPIDA - RESTAURADO DA V145)
    // =========================================================
    abrirModalVenda: (idAluno, nomeAluno) => {
        const modal = document.getElementById('modal-overlay'); if(modal) modal.style.display = 'flex';
        document.getElementById('modal-titulo').innerText = `Registrar Venda - ${App.escapeHTML(nomeAluno)}`;
        
        const hoje = new Date().toISOString().split('T')[0];
        const html = `
            <div style="background:#f4f6f7; padding:15px; border-radius:8px; margin-bottom:15px; border-left:4px solid #27ae60;">
                <h4 style="margin:0 0 10px 0; color:#2c3e50;">🛒 Detalhes da Compra</h4>
                <div class="input-group"><label>Item / Serviço Comprado</label><input id="v-item" placeholder="Ex: Uniforme M, Livro de Matemática, etc."></div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="input-group"><label>Valor (R$)</label><input type="number" id="v-valor" step="0.01" placeholder="0.00"></div>
                    <div class="input-group"><label>Data da Venda</label><input type="date" id="v-data" value="${hoje}"></div>
                </div>
                <div class="input-group"><label>Forma de Pagamento</label>
                    <select id="v-forma" style="font-weight:bold;">
                        <option value="PIX">PIX</option>
                        <option value="Cartão de Crédito">💳 Cartão de Crédito</option>
                        <option value="Cartão de Débito">💳 Cartão de Débito</option>
                        <option value="Dinheiro">💵 Dinheiro</option>
                        <option value="Pendente (Fiado)">⚠️ Deixar Pendente (Fiado)</option>
                    </select>
                </div>
                <div class="input-group"><label>Descrição / Observação Adicional</label><textarea id="v-desc" rows="2" placeholder="Detalhes opcionais..."></textarea></div>
                <input type="hidden" id="v-idaluno" value="${App.escapeHTML(idAluno)}"><input type="hidden" id="v-nomealuno" value="${App.escapeHTML(nomeAluno)}">
            </div>`;
        
        document.getElementById('modal-form-content').innerHTML = html;
        const btnConfirm = document.querySelector('.btn-confirm'); btnConfirm.setAttribute('onclick', 'App.salvarVenda()'); btnConfirm.innerHTML = "💾 Registrar Venda";
    },

    salvarVenda: async () => {
        const idAluno = document.getElementById('v-idaluno').value; const alunoNome = document.getElementById('v-nomealuno').value; const item = document.getElementById('v-item').value; const valor = document.getElementById('v-valor').value; const data = document.getElementById('v-data').value; const forma = document.getElementById('v-forma').value; const obs = document.getElementById('v-desc').value;
        if(!item || !valor || !data) return App.showToast("Preencha o item, valor e data.", "error");

        const status = forma === 'Pendente (Fiado)' ? 'Pendente' : 'Pago';
        const descricaoFinal = `Venda: ${item} | Pagto: ${forma} ${obs ? ' | Obs: '+obs : ''}`;
        const payload = { id: Date.now().toString(), idCarne: `VENDA_${Date.now()}`, idAluno: idAluno, alunoNome: alunoNome, valor: valor, vencimento: data, status: status, descricao: descricaoFinal, tipo: 'Receita', dataGeracao: new Date().toLocaleDateString('pt-BR') };

        const btn = document.querySelector('.btn-confirm'); const txtOriginal = btn ? btn.innerHTML : '💾 Registrar Venda';
        if(btn) { btn.innerHTML = "⏳ Registrando..."; btn.disabled = true; } document.body.style.cursor = 'wait';

        try { await App.api('/financeiro', 'POST', payload); App.showToast("Venda registrada com sucesso!", "success"); App.fecharModal(); } catch (e) { App.showToast("Erro ao registrar venda.", "error"); } finally { if(btn) { btn.innerHTML = txtOriginal; btn.disabled = false; } document.body.style.cursor = 'default'; }
    },

    // =========================================================
    // MOTOR DE LISTAS AVANÇADAS (RESTAURADO DA V145)
    // =========================================================
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

    // 🎨 MOTOR VISUAL DE TABELAS (TB) - COMPACTO E ELEGANTE (RESTAURADO DA V145)
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
        if (tipo === 'aluno')      cabecalho = TB.th('Nome') + TB.th('Turma') + TB.th('WhatsApp') + TB.th('Ações', 'right');
        if (tipo === 'turma')      cabecalho = TB.th('Turma') + TB.th('Dia') + TB.th('Horário') + TB.th('Curso') + TB.th('Ações', 'right');
        if (tipo === 'curso')      cabecalho = TB.th('Curso') + TB.th('Carga') + TB.th('Ações', 'right');
        if (tipo === 'financeiro') cabecalho = TB.th('Ref (Aluno)') + TB.th('Descrição') + TB.th('Vencimento') + TB.th('Valor') + TB.th('Status') + TB.th('Ações', 'right');
        if (tipo === 'estoque')    cabecalho = TB.th('Item') + TB.th('Código') + TB.th('Qtd Atual') + TB.th('Mínimo (Alerta)') + TB.th('Valor') + TB.th('Status') + TB.th('Ações', 'right');        

        const corpo = dados.map(item => {
            let celulas = '';
            if (tipo === 'aluno') { celulas += TB.td(App.escapeHTML(item.nome)) + TB.td(App.escapeHTML(item.turma || '-')) + TB.td(App.escapeHTML(item.whatsapp || '-')); } 
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
            const acaoEdit = tipo === 'financeiro' ? `App.renderizarTela('mensalidades')` : `App.abrirModalCadastro('${tipo}', '${item.id}')`;
            const nomeSeguro = (item.nome || '').replace(/'/g, "\\'"); 
            
            let botoes = [];
            if (tipo === 'aluno') {
                botoes.push(TB.btn('⏱️', '#3498db', `App.abrirRelatorioFrequencia('${item.id}', '${App.escapeHTML(nomeSeguro)}')`, 'Ver Histórico de Horas / Frequência'));
                botoes.push(TB.btn('🛒', '#27ae60', `App.abrirModalVenda('${item.id}', '${App.escapeHTML(nomeSeguro)}')`, 'Registrar Venda / Extra'));
            }
            if (tipo === 'financeiro') botoes.push(TB.btn('💬', '#25D366', `if(App.verificarPermissao('whatsapp')) App.enviarWhatsApp('${item.id}')`, 'Avisar por WhatsApp'));
            
            botoes.push(TB.btn('✏️', '#f39c12', acaoEdit, 'Editar'));
            botoes.push(TB.btn('🗑️', '#e74c3c', `App.excluir('${epExcluir}', '${item.id}')`, 'Excluir'));

            celulas += TB.td(TB.acoes(botoes), 'right'); return TB.tr(celulas);
        }).join('');
        return TB.estrutura(cabecalho, corpo);
    },

    excluir: async (endpoint, id) => {
        if(confirm("Tem a certeza absoluta? Esta ação não pode ser desfeita.")) {
            document.body.style.cursor = 'wait';
            try {
                await App.api(`/${endpoint}/${id}`, 'DELETE');
                App.showToast("Excluído com sucesso!", "success");
                App.renderizarLista(endpoint.slice(0, -1));
            } catch(e) { App.showToast("Erro ao excluir.", "error"); } 
            finally { document.body.style.cursor = 'default'; }
        }
    },

    // =========================================================
    // CONFIGURAÇÕES, ESCOLA E MÁSCARAS (RESTAURADO DA V145)
    // =========================================================
    carregarDadosEscola: async () => { 
        try { 
            const escola = await App.api('/escola'); if(!escola) return;
            if (escola.plano) { localStorage.setItem(App.getTenantKey('escola_plano'), escola.plano); }
            const logoTitle = document.querySelector('.logo-area h2'); 
            const planoAtual = App.getPlanoAtual();
            let corBadge = planoAtual === 'Premium' ? '#f39c12' : (planoAtual === 'Profissional' ? '#3498db' : '#27ae60');
            const badgeHtml = `<div style="margin-top:8px;"><span style="background:${corBadge}; color:#fff; font-size:10px; font-weight:bold; padding:3px 8px; border-radius:12px; text-transform:uppercase; letter-spacing:1px; box-shadow:0 2px 4px rgba(0,0,0,0.2);">💎 ${App.escapeHTML(planoAtual)}</span></div>`;
            if(logoTitle) logoTitle.innerHTML = `${App.escapeHTML(escola.nome || 'Escola')}<br><small style="color:#aaa;">${App.escapeHTML(escola.cnpj || '')}</small>${badgeHtml}`; 
            
            const logoContainer = document.querySelector('.logo-area'); let img = logoContainer.querySelector('img'); 
            if(escola.foto && escola.foto.length > 50) { 
                if(!img) { img = document.createElement('img'); img.style.cssText = "width:80px; height:80px; border-radius:50%; object-fit:cover; margin-bottom:10px; display:block; margin: 0 auto 10px auto; border: 3px solid rgba(255,255,255,0.2);"; logoContainer.insertBefore(img, logoContainer.firstChild); } 
                img.src = escola.foto; 
            } else if(img) { img.remove(); }
            localStorage.setItem(App.getTenantKey('escola_perfil'), JSON.stringify(escola)); 
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
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:20px; margin-bottom:20px;">
                        <div class="input-group"><label>Nome da Instituição</label><input id="conf-nome" value="${App.escapeHTML(escola.nome||'')}"></div>
                        <div class="input-group"><label>CNPJ / NIF</label><input id="conf-cnpj" value="${App.escapeHTML(escola.cnpj||'')}" oninput="App.mascaraCNPJ(this)" maxlength="18"></div>
                    </div>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:20px;">
                        <div class="input-group"><label>Dados Bancários (Carnê)</label><input id="conf-banco" value="${App.escapeHTML(escola.banco||'')}"></div>
                        <div class="input-group"><label>Chave PIX (Texto)</label><input id="conf-pix" value="${App.escapeHTML(escola.chavePix||'')}"></div>
                    </div>
                    <button class="btn-primary" style="width:100%; margin-top:20px; padding:15px; justify-content:center;" onclick="App.salvarConfiguracoes()">💾 ATUALIZAR DADOS DA ESCOLA</button>
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
            nome: document.getElementById('conf-nome').value, cnpj: document.getElementById('conf-cnpj').value, 
            banco: document.getElementById('conf-banco').value, chavePix: document.getElementById('conf-pix').value 
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

    // =========================================================
    // MINHA CONTA E GESTÃO DE EQUIPA (COM "OLHO" DA SENHA - RESTAURADO DA V145)
    // =========================================================
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
                        <h3>Equipa e Acessos</h3>
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
                                <tbody>${listaUsers.map(u => `<tr><td style="padding:10px 0; border-top:1px solid #eee;">${App.escapeHTML(u.nome)}</td><td style="padding:10px 0; border-top:1px solid #eee;">${App.escapeHTML(u.login)}</td><td style="padding:10px 0; border-top:1px solid #eee;"><span style="background:#eee; padding:2px 6px; border-radius:4px; font-size:11px;">${App.escapeHTML(u.tipo)}</span></td><td style="text-align:right; border-top:1px solid #eee;"><button class="btn-edit" onclick="App.preencherEdicaoUsuario('${u.id}', '${App.escapeHTML(u.nome)}', '${App.escapeHTML(u.login)}', '${App.escapeHTML(u.tipo)}')">✏️</button>${u.id !== App.usuario.id ? `<button class="btn-del" onclick="App.excluirUsuario('${u.id}')">🗑️</button>` : ''}</td></tr>`).join('')}</tbody>
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
        if (!App.idEdicaoUsuario) { payload.donoId = App.usuario.id; }

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

            // 🛡️ NOVA VALIDAÇÃO: Verifica se o servidor recusou (Ex: Login já existe)
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
    excluirUsuario: async (id) => { if(confirm("Deseja excluir este usuário?")) { await App.api(`/usuarios/${id}`, 'DELETE'); App.showToast("Excluído.", "success"); App.renderizarMinhaConta(); } },

    // =========================================================
    // BACKUP E RESET (ZONA DE PERIGO) RESTAURADA
    // =========================================================
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
        const f=document.getElementById('input-backup-file'); if(!f.files.length)return alert("Selecione o arquivo."); 
        if(!confirm("Substituir dados atuais?"))return; const r=new FileReader(); 
        r.onload=async(e)=>{
            try{
                const d=JSON.parse(e.target.result); const t=['alunos','turmas','cursos','financeiro','eventos','chamadas','avaliacoes','planejamentos','usuarios','escola']; 
                for(const k of t){if(d[k]){if(Array.isArray(d[k])){for(const i of d[k])await App.api(`/${k}`,'POST',i)}else{await App.api('/escola','PUT',d[k])}}} 
                alert("Restaurado com sucesso!"); location.reload();
            }catch(x){alert("Arquivo inválido.");}
        }; 
        r.readAsText(f.files[0]); 
    },

    // =========================================================
    // 🔔 SUPER SININHO COM "TELETRANSPORTE" (RESTAURADO DA V145)
    // =========================================================
    toggleNotificacoes: () => {
        const dropdown = document.getElementById('noti-dropdown');
        if (dropdown) dropdown.classList.toggle('active');
    },

    verificarNotificacoes: async () => {
        try {
            const [alunos, eventos, financeiro, planejamentos, estoque] = await Promise.all([
                App.api('/alunos'), App.api('/eventos'), App.api('/financeiro'), App.api('/planejamentos'), App.api('/estoques')
            ]);
            
            let alertas = [];
            const hoje = new Date();
            const ano = hoje.getFullYear();
            const mes = String(hoje.getMonth() + 1).padStart(2, '0');
            const dia = String(hoje.getDate()).padStart(2, '0');
            const hojeStr = `${ano}-${mes}-${dia}`;
            
            const amanha = new Date(hoje);
            amanha.setDate(amanha.getDate() + 1);
            const amanhaStr = `${amanha.getFullYear()}-${String(amanha.getMonth() + 1).padStart(2, '0')}-${String(amanha.getDate()).padStart(2, '0')}`;

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

                            if (mesesDeAulaRestantes > parcelasFuturas) {
                                alertas.push({ 
                                    icon: '⚠️', 
                                    texto: `<b>Faturação Perdida!</b> <b>${App.escapeHTML(aluno.nome)}</b> precisa de ${aulasPendentes} aulas, mas não tem parcelas suficientes. Clique para faturar!`,
                                    acao: "App.renderizarTela('mensalidades')"
                                });
                            }
                        }
                    }
                });
            }
       
          // 📦 ALERTA DE ESTOQUE INTELIGENTE
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
    }
}; 

// =========================================================
// EVENTOS DE ARRANQUE E PWA
// =========================================================
document.addEventListener('DOMContentLoaded', App.init);
document.addEventListener('keydown', function(event) { if (event.key === "Escape") { App.fecharModal(); if(typeof App.fecharModalInst === 'function') App.fecharModalInst(); } });
window.addEventListener('focus', () => { const telaSistema = document.getElementById('tela-sistema'); if (App.usuario && telaSistema && telaSistema.style.display !== 'none') { App.verificarNotificacoes(); } });

// Fechar Sininho ao clicar fora
document.addEventListener('click', (e) => {
    const container = document.querySelector('.notification-container');
    if (container && !container.contains(e.target)) {
        const dropdown = document.getElementById('noti-dropdown'); if (dropdown) dropdown.classList.remove('active');
    }
});

let deferredPrompt; window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; const installBanner = document.getElementById('pwa-install-banner'); if (installBanner) { installBanner.style.display = 'block'; } });
const btnInstall = document.getElementById('pwa-btn-install'); if (btnInstall) { btnInstall.addEventListener('click', async () => { const installBanner = document.getElementById('pwa-install-banner'); installBanner.style.display = 'none'; if (deferredPrompt) { deferredPrompt.prompt(); const { outcome } = await deferredPrompt.userChoice; deferredPrompt = null; } }); }
const btnCancel = document.getElementById('pwa-btn-cancel'); if (btnCancel) { btnCancel.addEventListener('click', () => { const installBanner = document.getElementById('pwa-install-banner'); installBanner.style.display = 'none'; }); }
window.addEventListener('appinstalled', () => { 
    const installBanner = document.getElementById('pwa-install-banner'); if (installBanner) installBanner.style.display = 'none'; deferredPrompt = null; 
    
    // 🚀 RASTREAMENTO GA4: Instalação do PWA
    if (typeof gtag === 'function') gtag('event', 'app_install', { platform: 'PWA Web' });
    
    App.showToast('App instalada com sucesso! 🎉', 'success'); 
});