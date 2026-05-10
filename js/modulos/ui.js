window.App = window.App || {};
const App = window.App;
 
// =========================================================
// MÓDULO UI - TOASTS, MENU MOBILE, COMPONENTES E MÁSCARAS
// =========================================================

Object.assign(App, {   
 
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
    const telaSistema = document.getElementById('tela-sistema');
    const header = telaSistema
        ? telaSistema.querySelector('header')
        : document.querySelector('header');

    const sidebar = document.querySelector('.sidebar');

    if (!header || !sidebar) {
        console.warn("Menu mobile não iniciado: header ou sidebar não encontrado.");
        return;
    }

    if (!document.getElementById('btn-mobile-menu')) {
        const btn = document.createElement('button');
        btn.id = 'btn-mobile-menu';
        btn.className = 'mobile-menu-btn';
        btn.type = 'button';
        btn.innerHTML = '☰';

        btn.onclick = () => {
            sidebar.classList.toggle('active');

            const overlay = document.querySelector('.mobile-overlay') || App.criarOverlay();
            overlay.classList.toggle('active');
        };

        header.insertBefore(btn, header.firstChild);
    }

    App.criarOverlay();
},

    criarOverlay: () => {
    const existente = document.querySelector('.mobile-overlay');
    if (existente) return existente;

    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';

    overlay.onclick = () => {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.remove('active');
        overlay.classList.remove('active');
    };

    document.body.appendChild(overlay);
    return overlay;
},

   UI: {
        card: (titulo, subtitulo, conteudo, maxWidth = '100%') => `<div class="card" style="max-width: ${maxWidth}; margin: 0 auto;">${titulo ? `<h3 style="margin-top:0; color:var(--card-text); border-bottom:1px solid #eee; padding-bottom:10px;">${titulo}</h3>` : ''}${subtitulo ? `<p style="color:#666; margin-bottom:20px; font-size:13px;">${subtitulo}</p>` : ''}${conteudo}</div>`,
        input: (label, id, value = '', placeholder = '', tipo = 'text', extraAttr = '') => `<div class="input-group"><label>${label}</label><input type="${tipo}" id="${id}" value="${value}" placeholder="${placeholder}" ${extraAttr}></div>`,
        botao: (texto, acao, tipo = 'primary', icone = '') => { const btnClass = tipo === 'primary' ? 'btn-primary' : (tipo === 'cancel' ? 'btn-cancel' : 'btn-edit'); return `<button class="${btnClass}" style="width: auto; padding: 10px 20px;" onclick="${acao}">${icone} ${texto}</button>`; },
        colorPicker: (label, valor, varCss) => `<div class="theme-row"><label>${label}</label><input type="color" value="${valor}" oninput="App.previewCor('${varCss}', this.value)"></div>`
    }

});

  