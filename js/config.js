// js/config.js

export const CONFIG = {
    // Usamos sempre o '/api' porque o Vite (localmente) e a Vercel (na internet) 
    // já estão configurados para reencaminhar isto para o seu backend verdadeiro!
    API_URL: '/api'
};

// Criamos a variável global AQUI diretamente.
// Isto garante que o sistema antigo (como o app.js e o auth.js)
// encontra a API_URL imediatamente, antes mesmo do main.js terminar de carregar!
window.CONFIG = CONFIG;