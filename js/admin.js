// Use apenas esta declaração segura
const API_URL = '/api';

let cacheClientes = [];

const Admin = {
    // 🛡️ Protege o HTML contra quebras visuais
    escapeHTML: (str) => {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    // 🛡️ NOVO: Protege os eventos 'onclick' dos botões contra caracteres invisíveis e aspas
    escapeJS: (str) => {
        if (str === null || str === undefined) return '';
        return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    },

    init: () => {
        if(sessionStorage.getItem('token_master')) {
            const loginScreen = document.getElementById('login-screen');
            const dashboard = document.getElementById('dashboard');

            // 🛡️ TRAVA DE SEGURANÇA: Só tenta alterar o layout se estivermos no admin.html
            if (loginScreen && dashboard) {
                loginScreen.style.display = 'none';
                dashboard.style.display = 'flex';
                Admin.carregarDados();
            }
        }
    },

    showToast: (msg, type='success') => {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.innerHTML = `<span>${type === 'success' ? '✅' : (type === 'error' ? '❌' : 'ℹ️')}</span> <span>${Admin.escapeHTML(msg)}</span>`;
        toast.style.background = 'var(--card)';
        toast.style.borderLeft = `4px solid ${type === 'success' ? 'var(--success)' : (type === 'error' ? 'var(--danger)' : 'var(--warning)')}`;
        toast.style.color = 'white'; toast.style.padding = '15px 20px'; toast.style.borderRadius = '6px';
        toast.style.boxShadow = '0 10px 15px rgba(0,0,0,0.5)'; toast.style.display = 'flex'; toast.style.alignItems = 'center'; toast.style.gap = '10px'; toast.style.fontSize = '14px'; toast.style.animation = 'fadeIn 0.3s ease';
        container.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
    },

    login: async () => {
        const pwd = document.getElementById('master-pwd').value;
        if(!pwd) return Admin.showToast("Digite a senha.", "warning");

        const btn = document.querySelector('.login-box button');
        const txtOrig = btn.innerText;
        btn.innerText = "Autenticando... ⏳";
        btn.disabled = true;
        
        const errEl = document.getElementById('login-error');
        errEl.style.display = 'none';

        try {
            const res = await fetch(`${API_URL}/master/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ senha: pwd })
            });
            
            let data;
            try { data = await res.json(); } catch(e) { data = { error: "Erro crítico no servidor." }; }
            
            if(res.ok && data.success && data.token) {
                sessionStorage.setItem('token_master', data.token);
                document.getElementById('master-pwd').value = '';
                Admin.init();
            } else {
                errEl.innerText = data.error || "Acesso negado!";
                errEl.style.display = 'block';
            }
        } catch(e) { 
            Admin.showToast("Erro de rede. O servidor pode estar a iniciar, aguarde...", "error"); 
        } finally {
            btn.innerText = txtOrig;
            btn.disabled = false;
        }
    },

    logout: () => {
        sessionStorage.removeItem('token_master');
        window.location.reload();
    },

  carregarDados: async () => {
        const token = sessionStorage.getItem('token_master');
        try {
            const urlSemCache = `${API_URL}/master/ativacoes?t=${new Date().getTime()}`;
            const res = await fetch(urlSemCache, { headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-store' });
            
            if(res.status === 401 || res.status === 403) return Admin.logout();
            
            const lista = await res.json();
            
            if (Array.isArray(lista)) {
                cacheClientes = lista;
                
                document.getElementById('kpi-total').innerText = lista.length;
                document.getElementById('kpi-ativas').innerText = lista.filter(l => l.status === 'Verificado' || l.status === 'Ativo').length;
                document.getElementById('kpi-pendentes').innerText = lista.filter(l => l.status === 'Pendente' || l.status === 'Aguardando Ativação' || l.status === 'Aguardando').length;
                document.getElementById('kpi-bloqueados').innerText = lista.filter(l => l.status === 'Bloqueado').length;

                // 🚀 A MÁGICA AQUI: Força a limpeza da barra de pesquisa para nenhum e-mail ficar "preso"!
                const campoBusca = document.getElementById('busca-tabela-escolas') || document.getElementById('pesquisa-admin');
                if (campoBusca) {
                    campoBusca.value = ''; 
                }

                Admin.desenharTabela(cacheClientes);
                Admin.carregarNotificacoes();
            }
        } catch(e) { console.error("🚨 Erro no carregarDados:", e); }
    },

    toggleNotificacoes: () => {
        const drop = document.getElementById('dropdown-notificacoes');
        if (drop.style.display === 'none' || drop.style.display === '') {
            drop.style.display = 'block';
            drop.style.animation = 'fadeIn 0.2s ease';
        } else {
            drop.style.display = 'none';
        }
    },

    carregarNotificacoes: async () => {
        const token = sessionStorage.getItem('token_master');
        try {
            const res = await fetch(`${API_URL}/master/notificacoes?t=${new Date().getTime()}`, {
                headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-store'
            });
            
            if (res.ok) {
                const notificacoes = await res.json();
                const badge = document.getElementById('badge-notificacao');
                const lista = document.getElementById('lista-notificacoes');
                
                if (notificacoes.length > 0) {
                    badge.innerText = notificacoes.length;
                    badge.style.display = 'block';
                    
                    lista.innerHTML = notificacoes.map(n => {
                        let icon = '🔔';
                        let corTitulo = '#94a3b8';
                        let bgCor = 'transparent';
                        
                        if(n.tipo === 'perigo') { icon = '🚨'; corTitulo = 'var(--danger)'; bgCor = 'rgba(239, 68, 68, 0.05)'; }
                        if(n.tipo === 'aviso') { icon = '⚠️'; corTitulo = 'var(--warning)'; bgCor = 'rgba(245, 158, 11, 0.05)'; }
                        if(n.tipo === 'info') { icon = '💡'; corTitulo = '#3b82f6'; bgCor = 'rgba(59, 130, 246, 0.05)'; }
                        
                        return `
                        <div style="padding: 15px; border-bottom: 1px solid #334155; display: flex; gap: 15px; align-items: start; background: ${bgCor}; transition: 0.2s;" onmouseover="this.style.background='#1e293b'" onmouseout="this.style.background='${bgCor}'">
                            <span style="font-size: 20px;">${icon}</span>
                            <div>
                                <div style="color: ${corTitulo}; font-size: 13px; font-weight: bold; margin-bottom: 4px;">${n.titulo}</div>
                                <div style="color: #cbd5e1; font-size: 12px; line-height: 1.5;">${n.mensagem}</div>
                            </div>
                        </div>`;
                    }).join('');
                } else {
                    badge.style.display = 'none';
                    lista.innerHTML = `
                    <div style="padding: 30px 20px; text-align: center;">
                        <div style="font-size: 30px; margin-bottom: 10px;">🎉</div>
                        <div style="color: #94a3b8; font-size: 13px;">Tudo tranquilo!<br>Nenhum alerta no momento.</div>
                    </div>`;
                }
            }
        } catch(e) {
            console.error("Erro ao carregar notificações", e);
        }
    },

    desenharTabela: (lista) => {
        const tbody = document.getElementById('tabela-clientes');
        tbody.innerHTML = ''; // Limpa a tabela antes de desenhar a nova
        
        if(!lista || lista.length === 0) { 
            tbody.innerHTML = '<tr><td colspan="4" style="padding:20px; text-align:center; color:#64748b;">Nenhuma escola encontrada.</td></tr>'; 
            return; 
        }
        
        // 🚀 O SEGREDO: Constrói as linhas uma a uma no DOM!
        lista.forEach(c => {
            try {
                const rawEmail = (c.email || "").trim().toLowerCase();
                const safeEmail = Admin.escapeHTML(rawEmail);
                const jsSafeEmail = Admin.escapeJS(rawEmail);
                const jsSafePinAtivacao = c.pinAtivacao ? Admin.escapeJS(c.pinAtivacao) : '';
                const safeStatus = Admin.escapeHTML(c.status || 'Pendente');

                // 1. Cores do Status
                let badgeClass = 'color:var(--warning); background:rgba(245, 158, 11, 0.2);'; 
                if (safeStatus === 'Verificado' || safeStatus === 'Ativo') badgeClass = 'color:var(--success); background:rgba(16, 185, 129, 0.2);';
                else if (safeStatus === 'Bloqueado') badgeClass = 'color:var(--danger); background:rgba(239, 68, 68, 0.2);';
                
                // 2. O Texto do PIN
                let statusPinHTML = '';
                if (safeStatus === 'Verificado' || safeStatus === 'Ativo') {
                    statusPinHTML = '<span style="color:var(--success); font-weight:bold;">✅ ATIVO</span>';
                } else if (jsSafePinAtivacao) {
                    statusPinHTML = `<span style="font-weight:bold; letter-spacing: 1px;">${Admin.escapeHTML(c.pinAtivacao)}</span>`;
                } else {
                    statusPinHTML = '<span style="color:#f59e0b; font-weight:bold; font-size:11px;">⚠️ AGUARDANDO PIN</span>';
                }
                
                // 3. O Plano
                let planoNome = c.plano || 'Pendente';
                if (planoNome === 'Aguardando' || planoNome === 'Teste' || planoNome === 'Pendente') {
                    if (c.pinAtivacao) {
                        const pinUpper = String(c.pinAtivacao).toUpperCase();
                        if (pinUpper.includes('PRE')) planoNome = 'Premium';
                        else if (pinUpper.includes('PRO')) planoNome = 'Profissional';
                        else if (pinUpper.includes('ESS')) planoNome = 'Essencial';
                        else planoNome = 'Liberado'; 
                    } else {
                        planoNome = 'Pendente';
                    }
                }

                const jsSafePlano = Admin.escapeJS(planoNome);
                let planoClass = 'bg-gray';
                let planoDisplay = planoNome;
                
                if(planoNome === 'Essencial') planoClass = 'plan-essencial';
                else if(planoNome === 'Profissional') planoClass = 'plan-profissional';
                else if(planoNome === 'Premium') planoClass = 'plan-premium';
                else if(planoNome === 'Liberado') { planoClass = 'plan-liberado'; planoDisplay = '💎 Liberado'; }

                // 4. Os Botões de Ação (Separados para não quebrar a visualização)
                let botoesAcaoHTML = '';
                if (jsSafePinAtivacao) {
                    const zapLink = `https://wa.me/?text=${encodeURIComponent('Olá! O seu PIN de acesso ao sistema escolar é: ' + jsSafePinAtivacao)}`;
                    botoesAcaoHTML = `
                        <button onclick="Admin.abrirModalMudarPlano('${jsSafeEmail}', '${jsSafePlano}')" style="background:var(--warning); color:#0f172a; border:none; padding:8px 12px; border-radius:5px; font-size:12px; margin-right:5px; font-weight:bold; cursor:pointer; transition:0.2s;">🔄 Plano</button>
                        <button onclick="window.open('${zapLink}', '_blank')" style="background:#25D366; color:white; border:none; cursor:pointer; padding:8px 12px; border-radius:5px; font-size:12px; margin-right:5px; transition:0.2s;">💬 Zap</button>
                        <button onclick="Admin.copiarAcesso('${jsSafeEmail}', '${jsSafePinAtivacao}', '${jsSafePlano === 'Liberado' ? 'VIP' : jsSafePlano}')" style="background:#475569; color:white; border:none; cursor:pointer; padding:8px 12px; border-radius:5px; font-size:12px; margin-right:5px; transition:0.2s;">📋 Copiar</button>
                    `;
                } else {
                    botoesAcaoHTML = `
                        <button onclick="Admin.abrirModalMudarPlano('${jsSafeEmail}', 'Profissional')" style="background:#10b981; color:white; border:none; padding:8px 12px; border-radius:5px; font-size:12px; margin-right:5px; font-weight:bold; cursor:pointer; transition:0.2s;">✅ Aprovar / Gerar PIN</button>
                    `;
                }

                botoesAcaoHTML += `
                    <button onclick="Admin.bloquear('${jsSafeEmail}')" style="background:var(--danger); color:white; border:none; padding:8px 12px; cursor:pointer; border-radius:5px; font-size:12px; transition:0.2s;">🚫 Bloq</button>
                    <button onclick="Admin.excluir('${jsSafeEmail}')" style="background:#000000; color:white; border:none; padding:8px 12px; cursor:pointer; border-radius:5px; font-size:12px; transition:0.2s; margin-left: 5px;">🗑️ Excluir</button>
                `;

                // 5. A MÁGICA DA BLINDAGEM: Cria o elemento "tr" e insere no ecrã. Impossível falhar!
                const tr = document.createElement('tr');
                tr.style.borderBottom = "1px solid #334155";
                tr.style.transition = "background 0.2s";
                tr.onmouseover = () => tr.style.background = '#1e293b';
                tr.onmouseout = () => tr.style.background = 'transparent';
                
                tr.innerHTML = `
                    <td style="padding:15px; font-weight:bold; max-width: 250px; word-break: break-all; white-space: normal;">${safeEmail}</td>
                    <td style="padding:15px;"><span class="${planoClass}">${Admin.escapeHTML(planoDisplay)}</span></td>
                    <td style="padding:15px; font-family:monospace;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; ${badgeClass}">${safeStatus}</span>
                            ${statusPinHTML}
                        </div>
                    </td>
                    <td style="padding:15px; text-align:right; white-space: nowrap;">${botoesAcaoHTML}</td>
                `;
                
                tbody.appendChild(tr);

            } catch (err) {
                console.error("🚨 ERRO AO DESENHAR A LINHA:", c.email, err);
            }
        });
    },

    // 🚀 NOVO: Pesquisa à prova de falhas (Aceita nulos, números, e caracteres perdidos)
 filtrarTabela: (termo) => {
        // Se a barra estiver vazia, desenha tudo!
        if (!termo || termo.trim() === '') {
            Admin.desenharTabela(cacheClientes);
            return;
        }
        
        const t = termo.toLowerCase().trim();
        const filtrados = cacheClientes.filter(c => {
            const emailStr = c.email ? String(c.email).toLowerCase() : '';
            const planoStr = c.plano ? String(c.plano).toLowerCase() : '';
            const statusStr = c.status ? String(c.status).toLowerCase() : '';
            const pinStr = c.pinAtivacao ? String(c.pinAtivacao).toLowerCase() : '';
            
            return emailStr.includes(t) || planoStr.includes(t) || statusStr.includes(t) || pinStr.includes(t);
        });
        
        Admin.desenharTabela(filtrados);
    },

    abrirModalMudarPlano: (email, planoAtual) => {
        document.getElementById('mp-email').value = email;
        const select = document.getElementById('mp-plano');
        for(let i = 0; i < select.options.length; i++) {
            if(select.options[i].value === planoAtual) select.selectedIndex = i;
        }
        document.getElementById('modal-mudar-plano').style.display = 'flex';
    },

    fecharModalMudarPlano: () => { document.getElementById('modal-mudar-plano').style.display = 'none'; },

    confirmarMudancaPlano: async () => {
        const email = document.getElementById('mp-email').value.trim().toLowerCase();
        const plano = document.getElementById('mp-plano').value;
        const token = sessionStorage.getItem('token_master');
        const btn = document.getElementById('btn-confirmar-mp');
        btn.innerText = "A atualizar... ⏳"; btn.disabled = true;
        
        try {
            const res = await fetch(`${API_URL}/master/gerar-pin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ email, plano })
            });
            const data = await res.json();
            
            if(data.success) {
                Admin.showToast(`Plano atualizado para ${plano}! Novo PIN gerado: ${data.pin}`, 'success');
                Admin.fecharModalMudarPlano();
                Admin.carregarDados(); 
            } else { Admin.showToast(data.error || "Erro ao gerar novo PIN da API.", "error"); }
        } catch(e) { Admin.showToast("Erro de comunicação com o servidor.", "error"); } 
        finally { btn.innerText = "Atualizar Plano"; btn.disabled = false; }
    },

    abrirModalVip: () => {
        document.getElementById('vip-email').value = '';
        document.getElementById('vip-zap').value = '';
        document.getElementById('vip-plano').value = 'Essencial';
        document.getElementById('vip-form-area').style.display = 'block';
        document.getElementById('vip-result-area').style.display = 'none';
        document.getElementById('modal-vip').style.display = 'flex';
    },

    fecharModalVip: () => { document.getElementById('modal-vip').style.display = 'none'; },

    gerarAcessoVip: async () => {
        const email = document.getElementById('vip-email').value.trim().toLowerCase();
        const zap = document.getElementById('vip-zap').value.replace(/\D/g, ''); 
        const plano = document.getElementById('vip-plano').value;
        
        if(!email) return Admin.showToast("E-mail é obrigatório!", "error");

        const btn = document.getElementById('btn-gerar-vip');
        btn.innerText = "A processar... ⏳"; btn.disabled = true;

        const token = sessionStorage.getItem('token_master');
        try {
            const res = await fetch(`${API_URL}/master/gerar-pin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ email, plano })
            });
            const data = await res.json();
            
            if(data.success) {
                const pin = data.pin;
                const urlSistema = window.location.origin + window.location.pathname.replace('admin.html', 'index.html');
                
                const msg = `Olá! A sua conta VIP foi criada no plano *${plano.toUpperCase()}* 🚀\n\n*Para ativar o seu sistema agora mesmo:* \n1. Aceda ao portal: ${urlSistema}\n2. Clique em "Nova Instituição" e coloque o seu e-mail: *${email}*\n3. O sistema enviará um código de segurança rápido para o seu e-mail.\n4. Insira esse código junto com o seu PIN de Ativação VIP: ${pin}\n\nPronto! O seu sistema será destravado automaticamente. Boas vendas!`;
                
                const linkZap = zap ? `https://wa.me/${zap.length <= 11 ? '55'+zap : zap}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
                
                document.getElementById('vip-pin-display').innerText = pin;
                document.getElementById('vip-zap-link').href = linkZap;
                
                document.getElementById('vip-form-area').style.display = 'none';
                document.getElementById('vip-result-area').style.display = 'block';
                
                Admin.showToast("Acesso VIP gerado!", "success");
                Admin.carregarDados(); 
            } else { Admin.showToast(data.error || "Erro ao gerar PIN da API.", "error"); }
        } catch(e) { Admin.showToast("Erro de comunicação com o servidor.", "error"); } 
        finally { btn.innerText = "Gerar PIN e Acesso Direto"; btn.disabled = false; }
    },

    // 🚀 NOVO: Cópia Reforçada (Evita saltos na página e bloqueios de navegador)
    copiarAcesso: (email, pin, plano) => {
        const urlSistema = window.location.origin + window.location.pathname.replace('admin.html', 'index.html');
        const mensagem = `Olá! A sua conta foi atualizada para o plano *${plano.toUpperCase()}* 🚀\n\n*Para ativar:* \n1. Aceda a: ${urlSistema}\n2. Vá ao menu "💎 Meu Plano"\n3. Insira o PIN Exclusivo: ${pin}\n\nQualquer dúvida, estamos à disposição!`;
        
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(mensagem).then(() => {
                Admin.showToast("Copiado! Só colar no WhatsApp do cliente.", "success");
            }).catch(err => {
                Admin.showToast("Erro ao copiar.", "error");
            });
        } else {
            let textArea = document.createElement("textarea");
            textArea.value = mensagem;
            textArea.style.position = "fixed";
            textArea.style.top = "0"; // Previne que a página pule para baixo!
            textArea.style.left = "-9999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                Admin.showToast("Copiado! Só colar no WhatsApp do cliente.", "success");
            } catch (err) {
                Admin.showToast("Erro ao copiar. Use o botão do WhatsApp.", "error");
            }
            document.body.removeChild(textArea);
        }
    },

    bloquear: async (email) => {
        if(!confirm(`Tem a certeza que deseja bloquear o acesso de ${email}?`)) return;
        const token = sessionStorage.getItem('token_master');
        try {
            const res = await fetch(`${API_URL}/master/bloquear`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ email: email.trim().toLowerCase() })
            });
            const data = await res.json();
            if(data.success) { Admin.showToast('Conta bloqueada.', 'success'); Admin.carregarDados(); }
        } catch(e) { Admin.showToast('Erro ao bloquear.', 'error'); }
    },
    
    abrirModalExcluir: (email) => {
        document.getElementById('excluir-email').value = email;
        document.getElementById('excluir-email-display').innerText = email;
        document.getElementById('input-confirmar-exclusao').value = '';
        document.getElementById('modal-excluir').style.display = 'flex';
    },

    fecharModalExcluir: () => {
        document.getElementById('modal-excluir').style.display = 'none';
    },

    excluir: (email) => {
        Admin.abrirModalExcluir(email);
    },

    confirmarExclusao: async () => {
        const email = document.getElementById('excluir-email').value;
        const confirmacao = document.getElementById('input-confirmar-exclusao').value.trim().toUpperCase();

        if(confirmacao !== "EXCLUIR") {
            return Admin.showToast("Palavra de segurança incorreta. Digite EXCLUIR.", "warning");
        }

        const token = sessionStorage.getItem('token_master');
        const btn = document.getElementById('btn-confirmar-exclusao');
        btn.innerText = "Apagando... ⏳"; btn.disabled = true;

        try {
            const res = await fetch(`${API_URL}/master/excluir-conta`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ email: email })
            });
            
            const data = await res.json();
            if(data.success) { 
                Admin.showToast('Conta obliterada com sucesso!', 'success'); 
                Admin.fecharModalExcluir();
                Admin.carregarDados(); 
            } else {
                Admin.showToast(data.error || 'Erro ao excluir conta.', 'error');
            }
        } catch(e) { 
            Admin.showToast('Erro crítico de comunicação com o servidor.', 'error'); 
        } finally {
            btn.innerText = "Apagar Tudo"; btn.disabled = false;
        }
    }
};

document.addEventListener('DOMContentLoaded', Admin.init);

// Exporta para o Escopo Global (Essencial para o HTML encontrar as funções)
window.Admin = Admin;