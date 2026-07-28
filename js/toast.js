// js/toast.js

window.Toast = {
    init: () => {
        if (document.getElementById('ws-toast-container')) return;
        
        const style = document.createElement('style');
        style.innerHTML = `
            #ws-toast-container { position: fixed; top: 20px; right: 20px; z-index: 999999; display: flex; flex-direction: column; gap: 15px; pointer-events: none; }
            .ws-toast { background: white; color: #2c3e50; min-width: 280px; max-width: 380px; padding: 20px; border-radius: 16px; box-shadow: 0 15px 40px rgba(0,0,0,0.2); font-family: 'Poppins', sans-serif; position: relative; overflow: hidden; transform: translateX(120%); animation: slideInRight 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards; pointer-events: auto; border: 1px solid #e2e8f0; }
            .ws-toast.hiding { animation: slideOutRight 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards !important; }
            
            /* 🚀 ESTILOS DOS CARTÕES INTERATIVOS (Aulas, Tarefas, Materiais) */
            .toast-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
            .toast-avatar { width: 50px; height: 50px; border-radius: 50%; border: 3px solid #3498db; box-shadow: 0 4px 10px rgba(0,0,0,0.1); object-fit: cover; }
            .toast-title { font-size: 15px; font-weight: 700; color: #1e293b; line-height: 1.2; }
            .toast-subtitle { font-size: 12px; color: #64748b; font-weight: 500; }
            .toast-body { font-size: 13px; color: #475569; line-height: 1.5; margin-bottom: 15px; background: #f8fafc; padding: 10px; border-radius: 8px; border-left: 4px solid #3498db; }
            
            .toast-btn { width: 100%; background: #2563eb; color: white; border: none; padding: 12px; border-radius: 10px; font-weight: bold; font-size: 14px; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3); }
            .toast-btn:hover { background: #1d4ed8; transform: translateY(-2px); }
            .toast-btn:active { transform: translateY(0); }

            .toast-theme-avaliacao .toast-btn { background: #e74c3c; box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3); }
            .toast-theme-avaliacao .toast-btn:hover { background: #c0392b; }
            .toast-theme-avaliacao .toast-body { border-left-color: #e74c3c; }

            .toast-theme-online .toast-btn { background: #9b59b6; box-shadow: 0 4px 15px rgba(155, 89, 182, 0.3); }
            .toast-theme-online .toast-btn:hover { background: #8e44ad; }
            .toast-theme-online .toast-body { border-left-color: #9b59b6; }

            .toast-theme-material .toast-btn { background: #27ae60; box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3); }
            .toast-theme-material .toast-btn:hover { background: #2ecc71; }
            .toast-theme-material .toast-body { border-left-color: #27ae60; }
            
            /* ===================================================================== */
            /* 🚀 RESTAURO: O DESIGN DO BATE-PAPO (O BALÃO PING-PONG)                */
            /* ===================================================================== */
            .ws-toast-pingpong { 
                background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%) !important; 
                color: white !important; 
                border: none !important; 
                border-radius: 50px !important; 
                padding: 10px 25px 10px 10px !important; 
                box-shadow: 0 15px 35px rgba(37, 117, 252, 0.3) !important;
                animation: slideInRight 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards, pingPongBounce 2s infinite ease-in-out !important; 
            }
            
            @keyframes pingPongBounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
            }

            @keyframes slideInRight { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(120%); opacity: 0; } }

            @media screen and (max-width: 600px) {
                #ws-toast-container { top: 15px; left: 0; right: 0; width: 100%; align-items: center; }
                .ws-toast { width: 90%; animation: slideInDown 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
                .ws-toast-pingpong { animation: slideInDown 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards, pingPongBounce 2s infinite ease-in-out !important; }
                @keyframes slideInDown { from { transform: translateY(-120%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            }
        `;
        document.head.appendChild(style);

        const container = document.createElement('div');
        container.id = 'ws-toast-container';
        document.body.appendChild(container);
    },

    // 🚀 A MÁGICA DE VOAR PARA O SININHO
    voarParaSininho: (toastElement, callback) => {
        const bell = document.getElementById('ws-bell');
        
        if (!bell) {
            Toast.remove(toastElement);
            if (callback) callback();
            return;
        }

        const bellRect = bell.getBoundingClientRect();
        const toastRect = toastElement.getBoundingClientRect();

        const deltaX = (bellRect.left + bellRect.width / 2) - (toastRect.left + toastRect.width / 2);
        const deltaY = (bellRect.top + bellRect.height / 2) - (toastRect.top + toastRect.height / 2);

        const anim = toastElement.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${deltaX}px, ${deltaY}px) scale(0.05)`, opacity: 0.8, borderRadius: '50%' },
            { transform: `translate(${deltaX}px, ${deltaY}px) scale(0)`, opacity: 0 }
        ], {
            duration: 700,
            easing: 'cubic-bezier(0.25, 1, 0.25, 1)',
            fill: 'forwards'
        });

        anim.onfinish = () => {
            bell.classList.remove('bell-ringing');
            void bell.offsetWidth; 
            bell.classList.add('bell-ringing');
            
            if (toastElement.parentNode) toastElement.parentNode.removeChild(toastElement);
            if (callback) callback();
        };
    },

    // 🚀 O MOTOR DE CARTÕES INTERATIVOS (Aulas, Avaliações, Exercícios)
    // Agora aceita uma "Ação" mágica que ocorre APÓS o clique no botão!
    showInterativo: (dados, tipoTema, onConfirmAction = null) => {
        const container = document.getElementById('ws-toast-container');
        if (!container) Toast.init();

        const toast = document.createElement('div');
        toast.className = `ws-toast toast-theme-${tipoTema}`;

        const avatarHtml = window.Workspace && window.Workspace.renderizarAvatar 
            ? window.Workspace.renderizarAvatar(dados.remetenteNome, 50)
            : `<div style="width:50px; height:50px; border-radius:50%; background:#ccc;"></div>`;

        toast.innerHTML = `
            <div class="toast-header">
                <div style="flex-shrink: 0; overflow:hidden; border-radius:50%; border:2px solid #e2e8f0;">${avatarHtml}</div>
                <div>
                    <div class="toast-title">${dados.remetenteNome}</div>
                    <div class="toast-subtitle">${dados.subtitulo}</div>
                </div>
            </div>
            <div class="toast-body">
                ${dados.mensagemCorpo}
            </div>
            <button class="toast-btn">Ciente (OK) 👍</button>
        `;

        const btn = toast.querySelector('.toast-btn');
        btn.onclick = async () => {
            btn.innerText = "Agendando... ⏳";
            
            // 🚀 A MÁGICA: Se houver uma ação enviada pelo Alertas.js, executa-a AGORA!
            if (onConfirmAction) {
                try { await onConfirmAction(); } catch(e) { console.error(e); }
            }

            Toast.voarParaSininho(toast, () => {
                if (window.Workspace && Workspace.Alertas) Workspace.Alertas.atualizarInterface();
            });
        };
        
        container.appendChild(toast);
    },

    // 🚀 RESTAURO: O Toast antigo usado para o Chat e Avisos Básicos
    show: (mensagem, tipo = 'info', duracao = 3500, onClickCallback = null) => {
        const container = document.getElementById('ws-toast-container');
        if (!container) Toast.init();
        
        const toast = document.createElement('div');
        toast.className = `ws-toast ws-toast-${tipo}`;
        
        let icone = 'ℹ️'; 
        if (tipo === 'success') icone = '✅'; 
        if (tipo === 'error') icone = '❌'; 
        if (tipo === 'warning') icone = '⚠️'; 
        if (tipo === 'pingpong') icone = '';

        // Se for pingpong, tiramos o padding para a cápsula ficar com a formatação perfeita
        toast.innerHTML = `${icone ? `<div style="font-size: 22px;">${icone}</div>` : ''}<div style="flex: 1; ${tipo === 'pingpong' ? 'padding: 0;' : 'padding-left: 10px;'}">${mensagem}</div>`;
        
        toast.onclick = () => { 
            if (onClickCallback) onClickCallback(); 
            Toast.remove(toast); 
        };
        
        container.appendChild(toast);
        setTimeout(() => Toast.remove(toast), duracao);
    },
    
    remove: (toast) => {
        if (toast.classList.contains('hiding')) return;
        toast.classList.add('hiding');
        setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 400); 
    }
};

document.addEventListener('DOMContentLoaded', Toast.init);