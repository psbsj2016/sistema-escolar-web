// js/toast.js

window.Toast = {
    init: () => {
        if (document.getElementById('ws-toast-container')) return;
        
        // 🎨 1. Injeta o Design do Toast (Popup temporário)
        const style = document.createElement('style');
        style.innerHTML = `
            #ws-toast-container { position: fixed; top: 20px; right: 20px; z-index: 999999; display: flex; flex-direction: column; gap: 12px; pointer-events: none; }
            .ws-toast { background: white; color: #2c3e50; min-width: 250px; max-width: 350px; padding: 16px 20px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 12px; font-family: 'Poppins', sans-serif; font-size: 14px; position: relative; overflow: hidden; transform: translateX(120%); animation: slideInRight 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards; pointer-events: auto; cursor: pointer; border: 1px solid #eee; }
            .ws-toast.hiding { animation: slideOutRight 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards; }
            .ws-toast-icon { font-size: 22px; display: flex; align-items: center; justify-content: center; }
            .ws-toast-content { flex: 1; font-weight: 500; line-height: 1.4; }
            .ws-toast-progress { position: absolute; bottom: 0; left: 0; height: 4px; animation: progressShrink 3.5s linear forwards; }
            
            .ws-toast-success .ws-toast-progress { background: #27ae60; }
            .ws-toast-error .ws-toast-progress { background: #e74c3c; }
            .ws-toast-warning .ws-toast-progress { background: #f39c12; }
            .ws-toast-info .ws-toast-progress { background: #3498db; }

            @keyframes slideInRight { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(120%); opacity: 0; } }
            @keyframes progressShrink { from { width: 100%; } to { width: 0%; } }
            
            @media screen and (max-width: 600px) {
                #ws-toast-container { top: 10px; right: 10px; left: 10px; align-items: center; }
                .ws-toast { width: 100%; max-width: 100%; animation: slideInDown 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards; }
                .ws-toast.hiding { animation: slideOutUp 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards; }
                @keyframes slideInDown { from { transform: translateY(-120%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes slideOutUp { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-120%); opacity: 0; } }
            }
        `;
        document.head.appendChild(style);

        const container = document.createElement('div');
        container.id = 'ws-toast-container';
        document.body.appendChild(container);
    },

    show: (mensagem, tipo = 'info') => {
        const container = document.getElementById('ws-toast-container');
        if (!container) Toast.init();

        const toast = document.createElement('div');
        toast.className = `ws-toast ws-toast-${tipo}`;

        let icone = 'ℹ️';
        if (tipo === 'success') icone = '✅';
        if (tipo === 'error') icone = '❌';
        if (tipo === 'warning') icone = '⚠️';

        toast.innerHTML = `
            <div class="ws-toast-icon">${icone}</div>
            <div class="ws-toast-content">${mensagem}</div>
            <div class="ws-toast-progress"></div>
        `;

        toast.onclick = () => Toast.remove(toast);
        document.getElementById('ws-toast-container').appendChild(toast);

        setTimeout(() => { Toast.remove(toast); }, 3500);
    },

    remove: (toast) => {
        if (toast.classList.contains('hiding')) return;
        toast.classList.add('hiding');
        setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 400); 
    }
};

// ==========================================
// 🔔 MOTOR DO SININHO (NOTIFICAÇÕES PERSISTENTES)
// ==========================================
window.Notificacoes = {
    intervalo: null,
    cache: [],
    idsConhecidos: new Set(),
    aberto: false,

    init: () => {
        // 🚀 Aguarda até a sessão do utilizador estar carregada
        const aguardarUsuario = setInterval(() => {
            if (window.Workspace && Workspace.usuario && Workspace.api) {
                clearInterval(aguardarUsuario);
                Notificacoes.injetarUI();
                Notificacoes.buscar();
                // O Radar do Sininho bate a cada 10 segundos
                Notificacoes.intervalo = setInterval(Notificacoes.buscar, 10000);
            }
        }, 1000);
    },

    injetarUI: () => {
        if (document.getElementById('ws-notif-fab')) return;

        const style = document.createElement('style');
        style.innerHTML = `
            #ws-notif-fab { position: fixed; bottom: 30px; left: 30px; width: 55px; height: 55px; background: #2c3e50; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; cursor: pointer; box-shadow: 0 10px 25px rgba(0,0,0,0.2); z-index: 999990; transition: transform 0.2s, background 0.2s; border: none; }
            #ws-notif-fab:hover { transform: scale(1.08); background: #34495e; }
            #ws-notif-badge { position: absolute; top: -5px; right: -5px; background: #e74c3c; color: white; font-size: 12px; font-weight: bold; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; transform: scale(0); transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
            #ws-notif-badge.show { transform: scale(1); }
            
            #ws-notif-panel { position: fixed; bottom: 95px; left: 30px; width: 340px; max-height: 480px; background: white; border-radius: 16px; box-shadow: 0 15px 40px rgba(0,0,0,0.2); z-index: 999990; display: none; flex-direction: column; overflow: hidden; border: 1px solid #eee; font-family: 'Poppins', sans-serif; opacity: 0; transform: translateY(20px); transition: all 0.3s ease; }
            #ws-notif-panel.open { display: flex; opacity: 1; transform: translateY(0); }
            
            .ws-notif-header { padding: 15px 20px; background: #f8fafc; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
            .ws-notif-body { flex: 1; overflow-y: auto; background: #fff; padding: 0; margin: 0; max-height: 400px; }
            .ws-notif-body::-webkit-scrollbar { width: 6px; }
            .ws-notif-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
            
            .ws-notif-item { padding: 15px 20px; border-bottom: 1px solid #f1f5f9; display: flex; gap: 12px; align-items: flex-start; cursor: pointer; transition: background 0.2s; position: relative; }
            .ws-notif-item:hover { background: #f8fafc; }
            .ws-notif-item.riscando { animation: slideOutLeft 0.3s forwards; }
            
            .ws-notif-avatar { width: 36px; height: 36px; border-radius: 50%; background: #e0e7ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; flex-shrink: 0; }
            .ws-notif-close { background: transparent; border: none; color: #cbd5e1; cursor: pointer; font-size: 16px; padding: 5px; transition: color 0.2s; }
            .ws-notif-close:hover { color: #e74c3c; }

            @keyframes slideOutLeft { to { transform: translateX(-100%); opacity: 0; } }
            @keyframes pulseBell { 0% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(231, 76, 60, 0); } 100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); } }
            .bell-ringing { animation: pulseBell 1.5s infinite; }

            @media screen and (max-width: 600px) {
                #ws-notif-panel { width: calc(100vw - 40px); left: 20px; }
                #ws-notif-fab { bottom: 20px; left: 20px; }
            }
        `;
        document.head.appendChild(style);

        // O Botão do Sininho
        const fab = document.createElement('button');
        fab.id = 'ws-notif-fab';
        fab.innerHTML = `🔔 <span id="ws-notif-badge">0</span>`;
        fab.onclick = Notificacoes.togglePainel;
        document.body.appendChild(fab);

        // A Gaveta de Notificações
        const painel = document.createElement('div');
        painel.id = 'ws-notif-panel';
        painel.innerHTML = `
            <div class="ws-notif-header">
                <h4 style="margin: 0; color: #2c3e50; font-size: 15px;">Notificações</h4>
                <span style="font-size: 12px; color: #3498db; font-weight: bold; cursor: pointer;" onclick="Notificacoes.togglePainel()">Fechar</span>
            </div>
            <div class="ws-notif-body" id="ws-notif-lista"></div>
        `;
        document.body.appendChild(painel);
    },

    buscar: async () => {
        try {
            const url = `/workspace/notificacoes/${encodeURIComponent(Workspace.usuario.nome)}`;
            const res = await Workspace.api(url, 'GET');
            
            if (Array.isArray(res)) {
                Notificacoes.cache = res;
                
                // Atualiza o contador vermelho
                const badge = document.getElementById('ws-notif-badge');
                if (badge) {
                    badge.innerText = res.length;
                    if (res.length > 0) badge.classList.add('show');
                    else badge.classList.remove('show');
                }

                // Verifica se há ALGO NOVO para disparar o Toast e o Ring do Sininho
                const idsAtuais = res.map(n => n.id);
                const novas = res.filter(n => !Notificacoes.idsConhecidos.has(n.id));

                if (novas.length > 0 && Notificacoes.idsConhecidos.size > 0) {
                    // O Toast avisa visualmente o utilizador
                    Toast.show(`🔔 Tem ${novas.length} nova(s) notificação(ões)!`, 'info');
                    
                    // O sininho vibra
                    const fab = document.getElementById('ws-notif-fab');
                    if(fab) {
                        fab.classList.add('bell-ringing');
                        setTimeout(() => fab.classList.remove('bell-ringing'), 4500);
                    }
                }
                
                Notificacoes.idsConhecidos = new Set(idsAtuais);
                if (Notificacoes.aberto) Notificacoes.renderizar();
            }
        } catch (e) { console.log("Radar de Notificações Silenciado (Offline)"); }
    },

    togglePainel: () => {
        const painel = document.getElementById('ws-notif-panel');
        if (!painel) return;
        
        Notificacoes.aberto = !Notificacoes.aberto;
        if (Notificacoes.aberto) {
            painel.classList.add('open');
            Notificacoes.renderizar();
        } else {
            painel.classList.remove('open');
        }
    },

    renderizar: () => {
        const lista = document.getElementById('ws-notif-lista');
        if (!lista) return;

        if (Notificacoes.cache.length === 0) {
            lista.innerHTML = `
                <div style="padding: 40px 20px; text-align: center; color: #94a3b8;">
                    <div style="font-size: 40px; margin-bottom: 10px;">📭</div>
                    <div style="font-size: 14px; font-weight: 500;">Tudo limpo!</div>
                    <div style="font-size: 12px; margin-top: 5px;">Não tem notificações pendentes.</div>
                </div>`;
            return;
        }

        lista.innerHTML = Notificacoes.cache.map(n => {
            const inicial = n.remetenteNome ? n.remetenteNome.charAt(0).toUpperCase() : '👤';
            const tempoStr = Notificacoes.tempoRelativo(n.data);
            
            return `
            <div class="ws-notif-item" id="notif-item-${n.id}">
                <div class="ws-notif-avatar">${inicial}</div>
                <div style="flex: 1; min-width: 0;" onclick="Notificacoes.lerEIr('${n.id}', '${n.origem}', '${n.origemId}')">
                    <div style="font-weight: 600; color: #1e293b; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${n.remetenteNome}</div>
                    <div style="color: #475569; font-size: 12px; line-height: 1.4; margin-top: 2px;">${n.mensagem}</div>
                    <div style="color: #94a3b8; font-size: 10px; margin-top: 5px; font-weight: 600;">${tempoStr}</div>
                </div>
                <button class="ws-notif-close" onclick="Notificacoes.riscar('${n.id}', event)" title="Marcar como lida e dispensar">✖</button>
            </div>
            `;
        }).join('');
    },

    // 🚀 LER E IR: O Utilizador clica para ler e é levado para o local
    lerEIr: async (id, origem, origemId) => {
        try {
            await Workspace.api(`/workspace/notificacoes/${id}/ler`, 'PUT');
            Notificacoes.togglePainel(); // Fecha o painel
            
            // Navegação Dinâmica: Onde aconteceu a ação?
            if (origem === 'post') {
                window.location.href = '#post-' + origemId;
            } else if (origem === 'chat') {
                window.location.href = '#chat-' + origemId;
            }
            
            // Remove localmente para não esperar a próxima requisição
            Notificacoes.cache = Notificacoes.cache.filter(n => n.id !== id);
            Notificacoes.buscar(); // Atualiza contador
        } catch (e) { }
    },

    // 🚀 RISCAR: O Utilizador cruza a notificação sem querer ir para o local
    riscar: async (id, event) => {
        event.stopPropagation(); // Impede que o clique acione o 'lerEIr'
        
        const itemUI = document.getElementById(`notif-item-${id}`);
        if(itemUI) itemUI.classList.add('riscando'); // Animação de saída para a esquerda

        try {
            await Workspace.api(`/workspace/notificacoes/${id}/ler`, 'PUT');
            setTimeout(() => {
                Notificacoes.cache = Notificacoes.cache.filter(n => n.id !== id);
                Notificacoes.buscar(); // Atualiza contador
                Notificacoes.renderizar(); // Re-renderiza a lista sem o item
            }, 300); // Tempo da animação
        } catch (e) { 
            if(itemUI) itemUI.classList.remove('riscando');
        }
    },

    tempoRelativo: (dataString) => {
        if (!dataString) return '';
        const dataPost = new Date(dataString);
        const agora = new Date();
        const diffSegundos = Math.floor((agora - dataPost) / 1000);

        if (diffSegundos < 60) return 'Agora mesmo';
        const diffMinutos = Math.floor(diffSegundos / 60);
        if (diffMinutos < 60) return `Há ${diffMinutos} min`;
        const diffHoras = Math.floor(diffMinutos / 60);
        if (diffHoras < 24) return `Há ${diffHoras} h`;
        const diffDias = Math.floor(diffHoras / 24);
        if (diffDias === 1) return `Ontem`;
        return `Há ${diffDias} dias`;
    }
};

// Arranca os dois motores (Visual Rápido e Persistente) assim que o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    Toast.init();
    Notificacoes.init();
});