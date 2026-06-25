// 🚀 CORREÇÃO 2: O import fica obrigatoriamente na linha 1 do script
        import './pwa-updater.js';   

        const urlParams = new URLSearchParams(window.location.search);
        const escolaId = urlParams.get('escola');
        const API_BASE = '/api';

        // 🚀 FORÇAR ATUALIZAÇÃO DE CACHE (COLE ISTO AQUI)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                for (let registration of registrations) { registration.update(); }
            });
        }

        async function carregarHubPersonalizado() {
            if (!escolaId) {
                document.body.innerHTML = "<h2 style='text-align:center; padding:50px; color:red;'>Link da instituição inválido.</h2>";
                return;
            }

            try {
                // Vai buscar as configurações exatas desta escola!
                // O '?v=' cria um link único a cada milissegundo, obrigando o navegador a trazer os dados novos!
                const res = await fetch(`${API_BASE}/public/escola/${escolaId}?v=${new Date().getTime()}`);
                if(!res.ok) throw new Error("Escola não encontrada");
                
                const dados = await res.json();
                const configHub = dados.configHub || {}; // Puxa as configs que gravamos no admin

                // 1. Aplica Textos do Topo (Se não existir usa o padrão do HTML)
                if(configHub.tituloHeader) document.getElementById('hub-titulo').innerText = configHub.tituloHeader;
                if(configHub.descHeader) document.getElementById('hub-desc').innerText = configHub.descHeader;

                // 2. Aplica Cartão Presencial
                if(configHub.iconePresencial) document.getElementById('hub-icone-presencial').innerText = configHub.iconePresencial;
                if(configHub.tituloPresencial) document.getElementById('hub-tit-presencial').innerText = configHub.tituloPresencial;
                if(configHub.descPresencial) document.getElementById('hub-desc-presencial').innerText = configHub.descPresencial;
                if(configHub.btnPresencial) document.getElementById('hub-btn-presencial').innerText = configHub.btnPresencial;

                // 3. Aplica Cartão Online
                if(configHub.iconeOnline) document.getElementById('hub-icone-online').innerText = configHub.iconeOnline;
                if(configHub.tituloOnline) document.getElementById('hub-tit-online').innerText = configHub.tituloOnline;
                if(configHub.descOnline) document.getElementById('hub-desc-online').innerText = configHub.descOnline;
                if(configHub.btnOnline) document.getElementById('hub-btn-online').innerText = configHub.btnOnline;

                // 4. Monta os links com a referência exata para o próximo passo
                const paramsString = window.location.search; 
                document.getElementById("link-presencial").href = "matricula.html" + paramsString;
                document.getElementById("link-online").href = "matricula-online.html" + paramsString;

                // 5. Esconde o Loading e mostra o ecrã lindíssimo!
                document.getElementById('loading-tela').style.display = 'none';
                document.getElementById('conteudo-hub').style.display = 'flex';

            } catch (error) {
                console.error("Erro:", error);
                document.body.innerHTML = `
                    <div style="text-align:center; padding:40px 20px;">
                        <div style="font-size:50px; margin-bottom:15px;">⚠️</div>
                        <h2 style="color:#c0392b;">Link inválido</h2>
                        <p style="color:#666;">Não foi possível carregar a vitrine desta instituição.</p>
                    </div>
                `;
            }
        }

        // Inicia o processo assim que a página abre
        document.addEventListener("DOMContentLoaded", carregarHubPersonalizado);