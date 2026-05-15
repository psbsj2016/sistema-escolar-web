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

import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    console.log('Nova versão detetada! A atualizar forçadamente...');
    // A linha abaixo é a magia que faltava! Força o PWA a deitar o cache velho fora.
    updateSW(true); 
  },
  onOfflineReady() {
    console.log('App pronta para trabalhar offline!')
  },
});