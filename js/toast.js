// js/toast.js

window.Toast = {
    init: () => {
        if (document.getElementById('ws-toast-container')) return;
        
        // 🎨 1. Injeta o Design do Toast
        const style = document.createElement('style');
        style.innerHTML = `
            #ws-toast-container { position: fixed; top: 20px; right: 20px; z-index: 999999; display: flex; flex-direction: column; gap: 12px; pointer-events: none; }
            .ws-toast { background: white; color: #2c3e50; min-width: 250px; max-width: 350px; padding: 16px 20px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 12px; font-family: 'Poppins', sans-serif; font-size: 14px; position: relative; overflow: hidden; transform: translateX(120%); animation: slideInRight 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards; pointer-events: auto; cursor: pointer; border: 1px solid #eee; }
            .ws-toast.hiding { animation: slideOutRight 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards; }
            .ws-toast-icon { font-size: 22px; display: flex; align-items: center; justify-content: center; }
            .ws-toast-content { flex: 1; font-weight: 500; line-height: 1.4; }
            .ws-toast-progress { position: absolute; bottom: 0; left: 0; height: 4px; animation: progressShrink linear forwards; }
            
            .ws-toast-success .ws-toast-progress { background: #27ae60; }
            .ws-toast-error .ws-toast-progress { background: #e74c3c; }
            .ws-toast-warning .ws-toast-progress { background: #f39c12; }
            .ws-toast-info .ws-toast-progress { background: #3498db; }
            
            /* 🚀 NOVO: Design Específico para o Chat (Verde e Pulsante) */
            .ws-toast-chat { border-left: 4px solid #128c7e; animation: slideInRight 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards, pulseChat 1.5s infinite; }
            .ws-toast-chat .ws-toast-progress { background: #128c7e; }
            @keyframes pulseChat {
                0% { box-shadow: 0 0 0 0 rgba(18, 140, 126, 0.4); }
                70% { box-shadow: 0 0 0 10px rgba(18, 140, 126, 0); }
                100% { box-shadow: 0 0 0 0 rgba(18, 140, 126, 0); }
            }

            @keyframes slideInRight { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(120%); opacity: 0; } }
            @keyframes progressShrink { from { width: 100%; } to { width: 0%; } }
            
            @media screen and (max-width: 600px) {
                #ws-toast-container { top: 10px; right: 10px; left: 10px; align-items: center; }
                .ws-toast { width: 100%; max-width: 100%; animation: slideInDown 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards; }
                .ws-toast.hiding { animation: slideOutUp 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards; }
                @keyframes slideInDown { from { transform: translateY(-120%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes slideOutUp { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-120%); opacity: 0; } }
                /* Efeito pulsante adaptado para telemóvel */
                .ws-toast-chat { animation: slideInDown 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards, pulseChat 1.5s infinite; }
            }
        `;
        document.head.appendChild(style);

        const container = document.createElement('div');
        container.id = 'ws-toast-container';
        document.body.appendChild(container);
    },

    // 🚀 ATUALIZADO: Recebe também uma função onClickCallback
    show: (mensagem, tipo = 'info', duracao = 3500, onClickCallback = null) => {
        const container = document.getElementById('ws-toast-container');
        if (!container) Toast.init();

        const toast = document.createElement('div');
        toast.className = `ws-toast ws-toast-${tipo}`;

        let icone = 'ℹ️';
        if (tipo === 'success') icone = '✅';
        if (tipo === 'error') icone = '❌';
        if (tipo === 'warning') icone = '⚠️';
        if (tipo === 'chat') icone = '💬';

        toast.innerHTML = `
            <div class="ws-toast-icon">${icone}</div>
            <div class="ws-toast-content">${mensagem}</div>
            <div class="ws-toast-progress" style="animation-duration: ${duracao}ms;"></div>
        `;

        // 🎯 O GATILHO DO CLIQUE MÁGICO
        toast.onclick = () => {
            if (onClickCallback && typeof onClickCallback === 'function') {
                onClickCallback(); // Executa o atalho para o chat
            }
            Toast.remove(toast);
        };
        
        document.getElementById('ws-toast-container').appendChild(toast);

        setTimeout(() => { Toast.remove(toast); }, duracao);
    },

    remove: (toast) => {
        if (toast.classList.contains('hiding')) return;
        toast.classList.add('hiding');
        setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 400); 
    }
};

// Arranca o motor visual assim que o script carrega
document.addEventListener('DOMContentLoaded', Toast.init);