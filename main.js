// main.js (Agora na raiz do projeto)
import { CONFIG } from './js/config.js';
import './js/app.js';
import './js/modulos/ui.js';
import './js/modulos/tema.js';
import './js/modulos/auth.js';
// Importamos tudo o que o dashboard exporta e guardamos na variável Dashboard
import * as Dashboard from './js/modulos/dashboard.js';

// Juntamos as funções do dashboard ao nosso App global para não quebrar o HTML
Object.assign(window.App, Dashboard);
import './js/modulos/notificacoes.js';
import './js/modulos/contratos.js';
import './js/admin.js';
import './js/modulos/cadastros.js';
import './js/modulos/workspace_admin.js';
import * as Financeiro from './js/modulos/financeiro.js';
Object.assign(window.App, Financeiro);
import './js/modulos/pedagogico.js';
import './js/modulos/relatorios.js';

// Importar o CSS
import './css/site.css';

import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    console.log('Nova versão detetada! A exibir notificação de update...');
    
    const banner = document.getElementById('update-banner');
    if (banner) {
        banner.style.display = 'block';
        banner.style.animation = 'slideIn 0.3s ease forwards';
        
        // Conecta o botão "Atualizar Agora" do HTML ao motor do PWA
        window.atualizarApp = () => {
            const btn = banner.querySelector('button');
            if(btn) { btn.innerText = "A instalar... ⏳"; btn.disabled = true; }
            updateSW(true); // Confirma a atualização só ao clicar
        };
    } else {
        updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App pronta para trabalhar offline!');
  },
});