// js/config.js

export const CONFIG = {
    API_URL: import.meta.env.VITE_API_URL || 'https://api.sistemaptt.com.br'
};

// Criamos a variável global AQUI diretamente.
// Isto garante que o sistema antigo (como o app.js e o auth.js)
// encontra a API_URL imediatamente, antes mesmo do main.js terminar de carregar!
window.CONFIG = CONFIG;