// js/modulos/workspace/avaliacoes.js
window.Workspace = window.Workspace || {};

Workspace.Avaliacoes = {
    exameAtivo: null,
    cronometroInterval: null,
    segundosRestantes: 0,
    respostas: {}, // Guarda as opções escolhidas e textos digitados

    init: () => {
        console.log("📝 Motor de Avaliações (Fase 2) iniciado. Modo Foco Pronto.");
    },

    // 🚀 FUNÇÃO DE DEMONSTRAÇÃO (Para testar o layout)
    iniciarExameFalsoDeTeste: () => {
        const questoesFalsas = [
            { 
                id: 'q1', tipo: 'escolha', pergunta: '1. Qual é a capital de Portugal?', 
                opcoes: ['Lisboa', 'Porto', 'Faro', 'Coimbra'] 
            },
            { 
                id: 'q2', tipo: 'texto', pergunta: '2. Descreva por suas palavras o impacto da Inteligência Artificial na educação moderna.' 
            },
            { 
                id: 'q3', tipo: 'escolha', pergunta: '3. A água ferve a que temperatura (ao nível do mar)?', 
                opcoes: ['50°C', '100°C', '150°C', '200°C'] 
            }
        ];
        Workspace.Avaliacoes.entrarModoFoco('exame_demo_123', 'Exame Global de Conhecimentos', 60, questoesFalsas);
    },

    entrarModoFoco: (exameId, titulo, duracaoMinutos, questoes) => {
        Workspace.Avaliacoes.exameAtivo = exameId;
        document.getElementById('ws-exame-titulo').innerText = titulo;
        
        // Bloqueia a rolagem da página por baixo do exame
        document.body.style.overflow = 'hidden'; 
        
        const container = document.getElementById('ws-exame-foco-container');
        container.style.display = 'block';
        container.style.animation = 'fadeIn 0.3s ease-out';
        container.scrollTop = 0; // Garante que a prova começa no topo

        // Recupera o Rascunho (Se o aluno atualizou a página sem querer, não perde nada!)
        const rascunho = localStorage.getItem(`ws_exame_draft_${exameId}`);
        if(rascunho) Workspace.Avaliacoes.respostas = JSON.parse(rascunho);
        else Workspace.Avaliacoes.respostas = {};

        Workspace.Avaliacoes.renderizarQuestoes(questoes);
        Workspace.Avaliacoes.iniciarCronometro(duracaoMinutos * 60);
    },

    renderizarQuestoes: (questoes) => {
        const area = document.getElementById('ws-exame-questoes-area');
        let html = '';

        questoes.forEach(q => {
            let htmlResposta = '';
            const respostaSalva = Workspace.Avaliacoes.respostas[q.id] || '';

            if (q.tipo === 'escolha') {
                htmlResposta = `<div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">`;
                q.opcoes.forEach((opcao, index) => {
                    const selecionado = respostaSalva === opcao;
                    const corFundo = selecionado ? '#e8f4f8' : '#f9f9f9';
                    const corBorda = selecionado ? '#3498db' : '#eee';
                    
                    htmlResposta += `
                        <label style="background: ${corFundo}; border: 2px solid ${corBorda}; padding: 15px; border-radius: 8px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 10px; font-size: 14px;" onmouseover="this.style.borderColor='#3498db'" onmouseout="this.style.borderColor='${corBorda}'">
                            <input type="radio" name="questao_${q.id}" value="${opcao}" ${selecionado ? 'checked' : ''} onchange="Workspace.Avaliacoes.registarResposta('${q.id}', this.value)" style="transform: scale(1.3); margin:0;">
                            <span style="color: #2c3e50; font-weight: 500;">${opcao}</span>
                        </label>
                    `;
                });
                htmlResposta += `</div>`;
            } else if (q.tipo === 'texto') {
                htmlResposta = `
                    <div style="margin-top: 15px;">
                        <textarea rows="6" placeholder="Digite a sua resposta aqui..." style="width: 100%; padding: 15px; border-radius: 8px; border: 2px solid #eee; font-family: inherit; font-size: 14px; outline: none; box-sizing: border-box; resize: vertical;" onfocus="this.style.borderColor='#3498db'" onblur="this.style.borderColor='#eee'" oninput="Workspace.Avaliacoes.registarResposta('${q.id}', this.value)">${respostaSalva}</textarea>
                    </div>
                `;
            }

            html += `
                <div class="ws-card" style="margin-bottom: 25px; border-left: 4px solid #3498db; box-shadow: 0 5px 20px rgba(0,0,0,0.04);">
                    <h3 style="margin: 0; color: #2c3e50; font-size: 16px; line-height: 1.5;">${q.pergunta}</h3>
                    ${htmlResposta}
                </div>
            `;
        });

        area.innerHTML = html;
    },

    registarResposta: (questaoId, valor) => {
        Workspace.Avaliacoes.respostas[questaoId] = valor;
        // Auto-save: Guarda secretamente a cada clique ou digitação
        localStorage.setItem(`ws_exame_draft_${Workspace.Avaliacoes.exameAtivo}`, JSON.stringify(Workspace.Avaliacoes.respostas));
    },

    guardarRascunhoManual: () => {
        const btn = event.target;
        const textoOriginal = btn.innerText;
        btn.innerText = "✅ Guardado!";
        setTimeout(() => btn.innerText = textoOriginal, 2000);
    },

    iniciarCronometro: (totalSegundos) => {
        if(Workspace.Avaliacoes.cronometroInterval) clearInterval(Workspace.Avaliacoes.cronometroInterval);
        Workspace.Avaliacoes.segundosRestantes = totalSegundos;
        
        const visor = document.getElementById('ws-exame-cronometro');

        Workspace.Avaliacoes.cronometroInterval = setInterval(() => {
            Workspace.Avaliacoes.segundosRestantes--;
            const s = Workspace.Avaliacoes.segundosRestantes;
            
            if (s <= 0) {
                clearInterval(Workspace.Avaliacoes.cronometroInterval);
                visor.innerText = "00:00:00";
                Workspace.mostrarAviso("O tempo esgotou! A prova será entregue automaticamente.", "warning");
                Workspace.Avaliacoes.finalizarExame(true); // Força entrega automática
                return;
            }

            const horas = Math.floor(s / 3600).toString().padStart(2, '0');
            const minutos = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
            const seg = (s % 60).toString().padStart(2, '0');
            visor.innerText = `${horas}:${minutos}:${seg}`;

            if (s < 300) visor.style.animation = 'pulse 1s infinite'; // Últimos 5 minutos fica a piscar
            
        }, 1000);
    },

    sairDoExame: () => {
        if (confirm("Tem a certeza que deseja abandonar a prova? O cronómetro não irá parar e poderá ficar sem tempo para concluir.")) {
            Workspace.Avaliacoes.fecharModoFoco();
        }
    },

    finalizarExame: (forcar = false) => {
        if (!forcar && !confirm("Deseja entregar o exame de forma definitiva? Não poderá alterar as respostas depois.")) return;

        // Aqui enviariamos "Workspace.Avaliacoes.respostas" para o Backend (via fetch)
        console.log("Respostas Prontas para Envio Backend:", Workspace.Avaliacoes.respostas);

        Workspace.mostrarAviso("Avaliação entregue com sucesso!", "success");
        
        // Limpa o rascunho (pois já foi entregue)
        localStorage.removeItem(`ws_exame_draft_${Workspace.Avaliacoes.exameAtivo}`);
        Workspace.Avaliacoes.fecharModoFoco();
    },

    fecharModoFoco: () => {
        document.body.style.overflow = ''; // Devolve o scroll do site
        document.getElementById('ws-exame-foco-container').style.display = 'none';
        if(Workspace.Avaliacoes.cronometroInterval) clearInterval(Workspace.Avaliacoes.cronometroInterval);
        Workspace.Avaliacoes.exameAtivo = null;
    }
};