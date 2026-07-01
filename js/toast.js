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

// Arranca o motor visual assim que o script carrega
document.addEventListener('DOMContentLoaded', Toast.init);