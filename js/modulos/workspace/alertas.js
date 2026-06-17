// js/modulos/workspace/alertas.js
window.Workspace = window.Workspace || {};

Workspace.Alertas = {
    radar: null,
    notificacoesAtuais: [],

    init: () => {
        console.log("🔔 Motor de Alertas ativado.");
        Workspace.Alertas.construirDropdown();
        Workspace.Alertas.buscarNotificacoes();
        
        // O "Radar" que checa a base de dados a cada 15 segundos
        Workspace.Alertas.radar = setInterval(Workspace.Alertas.buscarNotificacoes, 15000);
    },

    construirDropdown: () => {
        const bell = document.getElementById('ws-bell');
        if (!bell) return;

        // Cria a "gaveta" flutuante de notificações
        const dropdown = document.createElement('div');
        dropdown.id = 'ws-noti-dropdown';
        dropdown.style.cssText = 'display:none; position:absolute; right:0; top:40px; width:300px; background:white; border-radius:10px; box-shadow:0 10px 25px rgba(0,0,0,0.2); z-index:9999; padding:15px; color:#333; max-height:400px; overflow-y:auto; cursor:default;';
        
        bell.appendChild(dropdown);

        // Evento de clique para abrir/fechar
        bell.addEventListener('click', async (e) => {
            // Se clicar exatamente no ícone, intercala
            if (e.target.closest('#ws-bell') && !e.target.closest('#ws-noti-dropdown')) {
                const isOpen = dropdown.style.display === 'block';
                dropdown.style.display = isOpen ? 'none' : 'block';
                
                // Se abriu e havia notificações, avisa o servidor que já as lemos!
                if (!isOpen && Workspace.Alertas.notificacoesAtuais.length > 0) {
                    await Workspace.Alertas.marcarComoLidas();
                }
            }
        });

        // Fecha se clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#ws-bell')) {
                dropdown.style.display = 'none';
            }
        });
    },

    buscarNotificacoes: async () => {
        if (!Workspace.usuario || !Workspace.usuario.nome) return;

        try {
            // Usa o nome do utilizador logado para buscar os seus avisos
            const data = await Workspace.api(`/workspace/notificacoes/${encodeURIComponent(Workspace.usuario.nome)}`);
            if (Array.isArray(data)) {
                Workspace.Alertas.notificacoesAtuais = data;
                Workspace.Alertas.atualizarInterface();
            }
        } catch (e) {
            console.error("Erro ao buscar alertas", e);
        }
    },

    atualizarInterface: () => {
        const badge = document.getElementById('ws-noti-count');
        const dropdown = document.getElementById('ws-noti-dropdown');
        const qtd = Workspace.Alertas.notificacoesAtuais.length;

        // Atualiza a bolinha vermelha
        if (badge) {
            badge.innerText = qtd > 99 ? '99+' : qtd;
            badge.style.display = qtd > 0 ? 'flex' : 'none';
            // Efeito visual de chamar a atenção
            if (qtd > 0) badge.style.animation = 'pulse 1s infinite';
            else badge.style.animation = 'none';
        }

        // Atualiza o texto dentro da gaveta
        if (dropdown) {
            if (qtd === 0) {
                dropdown.innerHTML = '<div style="text-align:center; color:#999; font-size:13px; padding:20px 0;">Nenhuma notificação nova.</div>';
            } else {
                dropdown.innerHTML = `
                    <div style="font-weight:bold; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:5px; color:#2c3e50;">Novidades (${qtd})</div>
                    ${Workspace.Alertas.notificacoesAtuais.map(n => `
                        <div style="padding:10px; border-bottom:1px solid #f5f5f5; font-size:12px; background:#fdfefe; border-radius:6px; margin-bottom:5px;">
                            <strong style="color:#3498db;">${n.remetenteNome}</strong> ${n.mensagem}
                            <div style="font-size:10px; color:#aaa; margin-top:4px;">Agora mesmo</div>
                        </div>
                    `).join('')}
                `;
            }
        }
    },

    marcarComoLidas: async () => {
        if (!Workspace.usuario || !Workspace.usuario.nome) return;
        try {
            await Workspace.api(`/workspace/notificacoes/ler/${encodeURIComponent(Workspace.usuario.nome)}`, 'PUT');
            Workspace.Alertas.notificacoesAtuais = [];
            Workspace.Alertas.atualizarInterface();
        } catch (e) { console.error("Erro ao limpar notificações"); }
    }
};