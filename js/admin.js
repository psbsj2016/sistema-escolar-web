// Use apenas esta declaração segura
const API_URL = window.CONFIG?.API_URL || 'https://api.sistemaptt.com.br';

let cacheClientes = [];

        const Admin = {
            escapeHTML: (str) => {
                if (str === null || str === undefined) return '';
                return String(str)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
            },

            init: () => {
                if(sessionStorage.getItem('token_master')) {
                    document.getElementById('login-screen').style.display = 'none';
                    document.getElementById('dashboard').style.display = 'flex';
                    Admin.carregarDados();
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
                    const res = await fetch(`${API_URL}/master/ativacoes`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    if(res.status === 401 || res.status === 403) return Admin.logout();
                    
                    const lista = await res.json();
                    cacheClientes = lista;
                    
                    document.getElementById('kpi-total').innerText = lista.length;
                    document.getElementById('kpi-ativas').innerText = lista.filter(l => l.status === 'Verificado').length;
                    document.getElementById('kpi-pendentes').innerText = lista.filter(l => l.status === 'Pendente').length;
                    document.getElementById('kpi-bloqueados').innerText = lista.filter(l => l.status === 'Bloqueado').length;

                    Admin.desenharTabela(cacheClientes);
                } catch(e) { console.error(e); Admin.showToast("Erro ao carregar lista", "error"); }
            },

            desenharTabela: (lista) => {
                const tbody = document.getElementById('tabela-clientes');
                if(lista.length === 0) { tbody.innerHTML = '<tr><td colspan="4" style="padding:20px; text-align:center; color:#64748b;">Nenhuma escola encontrada.</td></tr>'; return; }
                
                tbody.innerHTML = lista.map(c => {
                    const rawEmail = (c.email || "").trim().toLowerCase();
                    const safeEmail = Admin.escapeHTML(rawEmail);
                    
                    // 🛡️ Segurança: Substitui aspas para não quebrar os eventos 'onclick'
                    const jsSafeEmail = rawEmail.replace(/'/g, "\\'");
                    const jsSafePinAtivacao = c.pinAtivacao ? String(c.pinAtivacao).replace(/'/g, "\\'") : '';

                    let badgeClass = c.status === 'Verificado' ? 'color:var(--success); background:rgba(16, 185, 129, 0.2);' : (c.status === 'Pendente' ? 'color:var(--warning); background:rgba(245, 158, 11, 0.2);' : 'color:var(--danger); background:rgba(239, 68, 68, 0.2);');
                    let statusPin = c.status === 'Verificado' ? '<span style="color:var(--success);">✅ ATIVO</span>' : (c.pinAtivacao ? Admin.escapeHTML(c.pinAtivacao) : '<span style="color:#64748b;">Aguardando...</span>');
                    
                    let planoNome = c.plano;
                    if (!planoNome || planoNome === 'Aguardando' || planoNome === 'Teste') {
                        if (c.pinAtivacao) {
                            const pinUpper = c.pinAtivacao.toUpperCase();
                            if (pinUpper.includes('PRE')) planoNome = 'Premium';
                            else if (pinUpper.includes('PRO')) planoNome = 'Profissional';
                            else if (pinUpper.includes('ESS')) planoNome = 'Essencial';
                            else planoNome = 'Liberado'; 
                        } else {
                            planoNome = 'Pendente';
                        }
                    }

                    const jsSafePlano = planoNome ? String(planoNome).replace(/'/g, "\\'") : '';

                    let planoClass = 'bg-gray';
                    let planoDisplay = planoNome;
                    
                    if(planoNome === 'Essencial') planoClass = 'plan-essencial';
                    else if(planoNome === 'Profissional') planoClass = 'plan-profissional';
                    else if(planoNome === 'Premium') planoClass = 'plan-premium';
                    else if(planoNome === 'Liberado') { planoClass = 'plan-liberado'; planoDisplay = '💎 Liberado'; }

                    const safeStatus = Admin.escapeHTML(c.status);

                    return `
                    <tr style="border-bottom:1px solid #334155; transition: background 0.2s;" onmouseover="this.style.background='#1e293b'" onmouseout="this.style.background='transparent'">
                        <td style="padding:15px; font-weight:bold; max-width: 250px; word-break: break-all; white-space: normal;">${safeEmail}</td>
                        <td style="padding:15px;">
                            <span class="${planoClass}">${Admin.escapeHTML(planoDisplay)}</span>
                        </td>
                        <td style="padding:15px; font-family:monospace;">
                            <span style="padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-right: 10px; ${badgeClass}">${safeStatus}</span>
                            ${statusPin}
                        </td>
                        <td style="padding:15px; text-align:right; white-space: nowrap;">
                            <button onclick="Admin.abrirModalMudarPlano('${jsSafeEmail}', '${jsSafePlano}')" style="background:var(--warning); color:#0f172a; border:none; padding:8px 12px; border-radius:5px; font-size:12px; margin-right:5px; font-weight:bold; transition:0.2s;" onmouseover="this.style.background='#fbbf24'" onmouseout="this.style.background='var(--warning)'" title="Upgrade / Downgrade">🔄 Plano</button>
                            
                           ${jsSafePinAtivacao ? `<button onclick="window.open('https://wa.me/?text=${encodeURIComponent('Olá! O seu PIN de acesso ao sistema escolar é: ' + jsSafePinAtivacao)}', '_blank')" style="background:#25D366; color:white; border:none; padding:8px 12px; border-radius:5px; font-size:12px; margin-right:5px; transition:0.2s;" onmouseover="this.style.background='#22c55e'" onmouseout="this.style.background='#25D366'">💬 Zap</button>
                            <button onclick="Admin.copiarAcesso('${jsSafeEmail}', '${jsSafePinAtivacao}', '${jsSafePlano === 'Liberado' ? 'VIP' : jsSafePlano}')" style="background:#475569; color:white; border:none; padding:8px 12px; border-radius:5px; font-size:12px; margin-right:5px; transition:0.2s;" onmouseover="this.style.background='#64748b'" onmouseout="this.style.background='#475569'">📋 Copiar</button>` : ''}
                            
                            <button onclick="Admin.bloquear('${jsSafeEmail}')" style="background:var(--danger); color:white; border:none; padding:8px 12px; border-radius:5px; font-size:12px; transition:0.2s;" onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='var(--danger)'">🚫 Bloq</button>
                            <button onclick="Admin.excluir('${jsSafeEmail}')" style="background:#000000; color:white; border:none; padding:8px 12px; border-radius:5px; font-size:12px; transition:0.2s;" onmouseover="this.style.background='#333333'" onmouseout="this.style.background='#000000'" title="Excluir Definitivamente">🗑️ Excluir</button>
                        </td>
                    </tr>
                `}).join('');
            },

            filtrarTabela: (termo) => {
                const t = termo.toLowerCase().trim();
                const filtrados = cacheClientes.filter(c => 
                    (c.email && c.email.toLowerCase().includes(t)) || 
                    (c.plano && c.plano.toLowerCase().includes(t)) || 
                    (c.status && c.status.toLowerCase().includes(t)) || 
                    (c.pinAtivacao && c.pinAtivacao.toLowerCase().includes(t))
                );
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
                // 🛡️ Segurança: Trim e LowerCase obrigatório
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
                // 🛡️ Segurança: Trim e LowerCase obrigatório
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
                        
                        // 🚀 ATENÇÃO: Removi os asteriscos do *${pin}* para evitar que copiem os "estrelinhas"
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

            copiarAcesso: (email, pin, plano) => {
                const urlSistema = window.location.origin + window.location.pathname.replace('admin.html', 'index.html');
                
                // 🚀 ATENÇÃO: Removi os asteriscos do PIN para proteger contra falha no 'Colar'
                const mensagem = `Olá! A sua conta foi atualizada para o plano *${plano.toUpperCase()}* 🚀\n\n*Para ativar:* \n1. Aceda a: ${urlSistema}\n2. Vá ao menu "💎 Meu Plano"\n3. Insira o PIN Exclusivo: ${pin}\n\nQualquer dúvida, estamos à disposição!`;
                
                // 🛡️ Fallback para quando não se usa HTTPS (quebrava a função copiar silenciosamente)
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
                        // 🛡️ Segurança: Trim e LowerCase obrigatório
                        body: JSON.stringify({ email: email.trim().toLowerCase() })
                    });
                    const data = await res.json();
                    if(data.success) { Admin.showToast('Conta bloqueada.', 'success'); Admin.carregarDados(); }
                } catch(e) { Admin.showToast('Erro ao bloquear.', 'error'); }
            },
            
            // NOVAS FUNÇÕES DE EXCLUSÃO SEGURA
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
    
window.Admin = Admin;