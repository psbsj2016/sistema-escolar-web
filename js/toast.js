// js/toast.js

window.Toast = {
    init: () => {
        if (document.getElementById('ws-toast-container')) return;
        
        // 🎨 1. Injeta o Design do Toast (Agora com o efeito Ping-Pong)
        const style = document.createElement('style');
        style.innerHTML = `
            #ws-toast-container { position: fixed; top: 20px; right: 20px; z-index: 999999; display: flex; flex-direction: column; gap: 12px; pointer-events: none; }
            .ws-toast { background: white; color: #2c3e50; min-width: 250px; max-width: 350px; padding: 16px 20px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 12px; font-family: 'Poppins', sans-serif; font-size: 14px; position: relative; overflow: hidden; transform: translateX(120%); animation: slideInRight 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards; pointer-events: auto; cursor: pointer; border: 1px solid #eee; }
            .ws-toast.hiding { animation: slideOutRight 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards !important; }
            .ws-toast-icon { font-size: 22px; display: flex; align-items: center; justify-content: center; }
            .ws-toast-content { flex: 1; font-weight: 500; line-height: 1.4; }
            .ws-toast-progress { position: absolute; bottom: 0; left: 0; height: 4px; animation: progressShrink linear forwards; }
            
            .ws-toast-success .ws-toast-progress { background: #27ae60; }
            .ws-toast-error .ws-toast-progress { background: #e74c3c; }
            .ws-toast-warning .ws-toast-progress { background: #f39c12; }
            .ws-toast-info .ws-toast-progress { background: #3498db; }
            
            /* 🚀 NOVO DESIGN: Notificação Animada de Chat (Ping-Pong) */
            .ws-toast-pingpong { 
                background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); 
                color: white; 
                border: none; 
                border-radius: 50px; /* Formato de Pílula Arredondada */
                padding: 10px 25px 10px 10px; 
                box-shadow: 0 15px 35px rgba(37, 117, 252, 0.3);
                /* Combina a entrada com a flutuação contínua */
                animation: slideInRight 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards, pingPongBounce 2s infinite ease-in-out; 
            }
            .ws-toast-pingpong .ws-toast-progress { background: rgba(255, 255, 255, 0.4); }
            
            /* 🏓 Animação Ping-Pong (Salta suavemente) */
            @keyframes pingPongBounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
            }

            @keyframes slideInRight { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(120%); opacity: 0; } }
            @keyframes progressShrink { from { width: 100%; } to { width: 0%; } }
            
            @media screen and (max-width: 600px) {
                #ws-toast-container { top: 10px; right: 10px; left: 10px; align-items: center; }
                .ws-toast { width: 100%; max-width: 100%; animation: slideInDown 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards; }
                .ws-toast.hiding { animation: slideOutUp 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards !important; }
                .ws-toast-pingpong { animation: slideInDown 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards, pingPongBounce 2s infinite ease-in-out; }
                
                @keyframes slideInDown { from { transform: translateY(-120%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes slideOutUp { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-120%); opacity: 0; } }
            }
        `;
        document.head.appendChild(style);

        const container = document.createElement('div');
        container.id = 'ws-toast-container';
        document.body.appendChild(container);
    },

    show: (mensagem, tipo = 'info', duracao = 3500, onClickCallback = null) => {
        const container = document.getElementById('ws-toast-container');
        if (!container) Toast.init();

        const toast = document.createElement('div');
        toast.className = `ws-toast ws-toast-${tipo}`;

        let icone = 'ℹ️';
        if (tipo === 'success') icone = '✅';
        if (tipo === 'error') icone = '❌';
        if (tipo === 'warning') icone = '⚠️';
        if (tipo === 'pingpong') icone = ''; // Sem ícone padrão, usaremos a foto de perfil!

        toast.innerHTML = `
            ${icone ? `<div class="ws-toast-icon">${icone}</div>` : ''}
            <div class="ws-toast-content" style="${tipo === 'pingpong' ? 'padding: 0;' : ''}">${mensagem}</div>
            <div class="ws-toast-progress" style="animation-duration: ${duracao}ms;"></div>
        `;

        toast.onclick = () => {
            if (onClickCallback && typeof onClickCallback === 'function') {
                onClickCallback(); 
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

document.addEventListener('DOMContentLoaded', Toast.init);