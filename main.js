// main.js (Agora na raiz do projeto)
import './js/config.js';
import './js/app.js';
import './js/modulos/ui.js';
import './js/modulos/tema.js';
import './js/modulos/auth.js';
import './js/modulos/dashboard.js';
import './js/modulos/notificacoes.js';
import './js/modulos/contratos.js';
import './js/admin.js';
import './js/modulos/cadastros.js';
import './js/modulos/financeiro.js';
import './js/modulos/pedagogico.js';
import './js/modulos/relatorios.js';

// Importar o CSS
import './css/site.css';

import { registerSW } from 'virtual:pwa-register';

// Regista o Service Worker gerado pelo Vite
const updateSW = registerSW({
  onNeedRefresh() {
    // Aqui podemos invocar o seu banner de atualização se quisermos!
    console.log("Nova versão disponível!");
  },
  onOfflineReady() {
    console.log("App pronto para funcionar offline!");
  },
});