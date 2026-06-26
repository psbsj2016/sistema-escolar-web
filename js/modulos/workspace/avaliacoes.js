// js/modulos/workspace/avaliacoes.js
window.Workspace = window.Workspace || {};

Workspace.Avaliacoes = {
    // Variáveis da Prova Escrita (Fase 2)
    exameAtivo: null,
    cronometroInterval: null,
    segundosRestantes: 0,
    respostas: {},

    // Variáveis do Estúdio Oral (Fase 3)
    estudioAtivo: null,
    mediaRecorder: null,
    audioChunks: [],
    audioBlob: null,
    streamMicrofone: null,
    gravacaoInterval: null,
    segundosGravados: 0,

    init: () => {
        console.log("📝 Motor de Avaliações (Fase 2 e 3) iniciado. Microfones prontos.");
    },

    // ==========================================
    // ✍️ FASE 2: LÓGICA DA AVALIAÇÃO ESCRITA
    // ==========================================
    iniciarExameFalsoDeTeste: () => {
        const questoesFalsas = [
            { id: 'q1', tipo: 'escolha', pergunta: '1. Qual é a capital de Portugal?', opcoes: ['Lisboa', 'Porto', 'Faro', 'Coimbra'] },
            { id: 'q2', tipo: 'texto', pergunta: '2. Descreva por suas palavras o impacto da Inteligência Artificial na educação moderna.' }
        ];
        Workspace.Avaliacoes.entrarModoFoco('exame_demo_123', 'Exame Global de Conhecimentos', 60, questoesFalsas);
    },

    entrarModoFoco: (exameId, titulo, duracaoMinutos, questoes) => {
        Workspace.Avaliacoes.exameAtivo = exameId;
        document.getElementById('ws-exame-titulo').innerText = titulo;
        document.body.style.overflow = 'hidden'; 
        
        const tela = document.getElementById('ws-exame-foco-tela');
        tela.style.display = 'block';
        tela.style.animation = 'fadeIn 0.3s ease-out';
        tela.scrollTop = 0;

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
                q.opcoes.forEach((opcao) => {
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
                htmlResposta = `<div style="margin-top: 15px;"><textarea rows="6" placeholder="Digite a sua resposta aqui..." style="width: 100%; padding: 15px; border-radius: 8px; border: 2px solid #eee; font-family: inherit; font-size: 14px; outline: none; box-sizing: border-box; resize: vertical;" onfocus="this.style.borderColor='#3498db'" onblur="this.style.borderColor='#eee'" oninput="Workspace.Avaliacoes.registarResposta('${q.id}', this.value)">${respostaSalva}</textarea></div>`;
            }

            html += `<div class="ws-card" style="margin-bottom: 25px; border-left: 4px solid #3498db; box-shadow: 0 5px 20px rgba(0,0,0,0.04);"><h3 style="margin: 0; color: #2c3e50; font-size: 16px; line-height: 1.5;">${q.pergunta}</h3>${htmlResposta}</div>`;
        });
        area.innerHTML = html;
    },

    registarResposta: (questaoId, valor) => {
        Workspace.Avaliacoes.respostas[questaoId] = valor;
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
                Workspace.Avaliacoes.finalizarExame(true);
                return;
            }
            const horas = Math.floor(s / 3600).toString().padStart(2, '0');
            const minutos = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
            const seg = (s % 60).toString().padStart(2, '0');
            visor.innerText = `${horas}:${minutos}:${seg}`;
        }, 1000);
    },

    sairDoExame: () => {
        if (confirm("Tem a certeza que deseja abandonar a prova? O cronómetro não irá parar e poderá ficar sem tempo para concluir.")) {
            document.body.style.overflow = ''; 
            document.getElementById('ws-exame-foco-tela').style.display = 'none';
            if(Workspace.Avaliacoes.cronometroInterval) clearInterval(Workspace.Avaliacoes.cronometroInterval);
            Workspace.Avaliacoes.exameAtivo = null;
        }
    },

    finalizarExame: (forcar = false) => {
        if (!forcar && !confirm("Deseja entregar o exame de forma definitiva? Não poderá alterar as respostas depois.")) return;
        Workspace.mostrarAviso("Avaliação entregue com sucesso!", "success");
        localStorage.removeItem(`ws_exame_draft_${Workspace.Avaliacoes.exameAtivo}`);
        document.body.style.overflow = ''; 
        document.getElementById('ws-exame-foco-tela').style.display = 'none';
        if(Workspace.Avaliacoes.cronometroInterval) clearInterval(Workspace.Avaliacoes.cronometroInterval);
        Workspace.Avaliacoes.exameAtivo = null;
    },

    // ==========================================
    // 🎤 FASE 3: LÓGICA DO ESTÚDIO DE ÁUDIO
    // ==========================================
    iniciarTesteDeAudioFalso: () => {
        Workspace.Avaliacoes.abrirEstudioAudio('audio_demo_1', 'Teste de Conversação em Inglês', 'Please, introduce yourself, talk about your hobbies and explain why you want to learn English. (Speak for at least 1 minute).');
    },

    abrirEstudioAudio: (exameId, titulo, instrucoes) => {
        Workspace.Avaliacoes.estudioAtivo = exameId;
        document.getElementById('ws-audio-titulo').innerText = titulo;
        document.getElementById('ws-audio-pergunta').innerText = instrucoes;
        
        document.body.style.overflow = 'hidden'; 
        const tela = document.getElementById('ws-audio-foco-tela');
        tela.style.display = 'block';
        tela.style.animation = 'fadeIn 0.3s ease-out';
        tela.scrollTop = 0;

        Workspace.Avaliacoes.resetarInterfaceDeAudio();
    },

    resetarInterfaceDeAudio: () => {
        document.getElementById('ws-area-gravacao').style.display = 'block';
        document.getElementById('ws-area-player').style.display = 'none';
        document.getElementById('ws-btn-iniciar-gravacao').style.display = 'inline-block';
        document.getElementById('ws-btn-parar-gravacao').style.display = 'none';
        document.getElementById('ws-audio-cronometro').innerText = '00:00';
        document.getElementById('ws-audio-cronometro').style.color = '#fff';
        document.getElementById('ws-mic-ring').style.borderColor = 'rgba(255,255,255,0.2)';
        document.getElementById('ws-mic-ring').style.background = 'rgba(255,255,255,0.05)';
        Workspace.Avaliacoes.audioBlob = null;
        Workspace.Avaliacoes.audioChunks = [];
    },

    iniciarGravacao: async () => {
        try {
            // Pede permissão ao navegador para usar o microfone
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            Workspace.Avaliacoes.streamMicrofone = stream;
            
            // Prepara o Gravador
            Workspace.Avaliacoes.mediaRecorder = new MediaRecorder(stream);
            Workspace.Avaliacoes.audioChunks = [];

            Workspace.Avaliacoes.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) Workspace.Avaliacoes.audioChunks.push(event.data);
            };

            Workspace.Avaliacoes.mediaRecorder.onstop = () => {
                // Quando o aluno clica em Parar, gera o ficheiro físico (Blob)
                Workspace.Avaliacoes.audioBlob = new Blob(Workspace.Avaliacoes.audioChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(Workspace.Avaliacoes.audioBlob);
                
                // Coloca o áudio no player para o aluno ouvir
                document.getElementById('ws-audio-preview').src = audioUrl;
                document.getElementById('ws-area-gravacao').style.display = 'none';
                document.getElementById('ws-area-player').style.display = 'block';

                // Desliga o microfone para tirar a luz vermelha da aba do navegador
                Workspace.Avaliacoes.streamMicrofone.getTracks().forEach(track => track.stop());
            };

            // Inicia a gravação física
            Workspace.Avaliacoes.mediaRecorder.start();

            // Altera o visual do ecrã para "Modo de Gravação (REC)"
            document.getElementById('ws-btn-iniciar-gravacao').style.display = 'none';
            document.getElementById('ws-btn-parar-gravacao').style.display = 'inline-block';
            document.getElementById('ws-mic-ring').style.borderColor = '#e74c3c';
            document.getElementById('ws-mic-ring').style.background = 'rgba(231, 76, 60, 0.2)';
            document.getElementById('ws-audio-cronometro').style.color = '#e74c3c';

            // Inicia o cronómetro progressivo
            Workspace.Avaliacoes.segundosGravados = 0;
            if(Workspace.Avaliacoes.gravacaoInterval) clearInterval(Workspace.Avaliacoes.gravacaoInterval);
            
            Workspace.Avaliacoes.gravacaoInterval = setInterval(() => {
                Workspace.Avaliacoes.segundosGravados++;
                const min = Math.floor(Workspace.Avaliacoes.segundosGravados / 60).toString().padStart(2, '0');
                const seg = (Workspace.Avaliacoes.segundosGravados % 60).toString().padStart(2, '0');
                document.getElementById('ws-audio-cronometro').innerText = `${min}:${seg}`;
                
                // Se chegar a 10 minutos (600s), força a paragem por segurança
                if(Workspace.Avaliacoes.segundosGravados >= 600) {
                    Workspace.Avaliacoes.pararGravacao();
                    Workspace.mostrarAviso("Tempo máximo de 10 minutos atingido.", "info");
                }
            }, 1000);

        } catch (err) {
            console.error("Erro no microfone:", err);
            Workspace.mostrarAviso("O seu dispositivo bloqueou o acesso ao microfone. Verifique as permissões do navegador.", "error");
        }
    },

    pararGravacao: () => {
        if (Workspace.Avaliacoes.mediaRecorder && Workspace.Avaliacoes.mediaRecorder.state === 'recording') {
            Workspace.Avaliacoes.mediaRecorder.stop();
            if(Workspace.Avaliacoes.gravacaoInterval) clearInterval(Workspace.Avaliacoes.gravacaoInterval);
        }
    },

    descartarAudio: () => {
        if(confirm("Tem a certeza que deseja apagar esta gravação e começar de novo?")) {
            Workspace.Avaliacoes.resetarInterfaceDeAudio();
        }
    },

    enviarAudio: async () => {
        if (!Workspace.Avaliacoes.audioBlob) return;

        const btn = document.getElementById('ws-btn-enviar-audio');
        btn.innerText = "A Enviar... ⏳";
        btn.disabled = true;

        // Aqui, futuramente, faremos o envio do 'audioBlob' via FormData para a sua API!
        // O ficheiro será tratado pelo Backend exatamente como se fosse um anexo normal.
        console.log("Áudio pronto para ser enviado para o servidor!", Workspace.Avaliacoes.audioBlob);

        setTimeout(() => {
            Workspace.mostrarAviso("Áudio enviado com sucesso! O professor será notificado.", "success");
            btn.innerText = "📤 Enviar Áudio";
            btn.disabled = false;
            
            // Fecha o estúdio e limpa a casa
            document.body.style.overflow = '';
            document.getElementById('ws-audio-foco-tela').style.display = 'none';
            Workspace.Avaliacoes.estudioAtivo = null;
        }, 1500); // Simulador de atraso de rede
    },

    sairDoEstudio: () => {
        if (Workspace.Avaliacoes.mediaRecorder && Workspace.Avaliacoes.mediaRecorder.state === 'recording') {
            if(!confirm("Ainda está a gravar! Se sair agora perderá o áudio atual. Deseja mesmo sair?")) return;
            Workspace.Avaliacoes.pararGravacao();
        }
        
        document.body.style.overflow = '';
        document.getElementById('ws-audio-foco-tela').style.display = 'none';
        Workspace.Avaliacoes.estudioAtivo = null;
    },

   // ==========================================
    // 🎓 FASE 4: LÓGICA DO PROFESSOR (CONSTRUTOR)
    // ==========================================
    abrirNovaEscrita: () => {
        document.getElementById('ws-prof-menu-avaliacoes').style.display = 'none';
        document.getElementById('ws-prof-nova-oral').style.display = 'none';
        document.getElementById('ws-prof-recebidas').style.display = 'none';
        document.getElementById('ws-prof-nova-escrita').style.display = 'block';
        document.getElementById('ws-builder-questoes').innerHTML = ''; // Limpa construtor
    },

    abrirNovaOral: () => {
        document.getElementById('ws-prof-menu-avaliacoes').style.display = 'none';
        document.getElementById('ws-prof-nova-escrita').style.display = 'none';
        document.getElementById('ws-prof-recebidas').style.display = 'none';
        document.getElementById('ws-prof-nova-oral').style.display = 'block';
    },

    abrirRecebidas: () => {
        document.getElementById('ws-prof-menu-avaliacoes').style.display = 'none';
        document.getElementById('ws-prof-nova-escrita').style.display = 'none';
        document.getElementById('ws-prof-nova-oral').style.display = 'none';
        document.getElementById('ws-prof-recebidas').style.display = 'block';
        // Futuro: fetch() para carregar lista da API
    },

    voltarMenuProf: () => {
        document.getElementById('ws-prof-nova-escrita').style.display = 'none';
        document.getElementById('ws-prof-nova-oral').style.display = 'none';
        document.getElementById('ws-prof-recebidas').style.display = 'none';
        document.getElementById('ws-prof-menu-avaliacoes').style.display = 'grid';
    },

    adicionarQuestaoBuilder: (tipo) => {
        const area = document.getElementById('ws-builder-questoes');
        const qId = Date.now(); // ID único para a pergunta
        let html = '';

        if (tipo === 'escolha') {
            html = `
            <div class="ws-card ws-questao-build" style="border: 2px solid #3498db; position: relative; padding: 15px; margin-bottom: 0;">
                <button onclick="this.parentElement.remove()" style="position:absolute; right:10px; top:10px; background:#e74c3c; color:white; border:none; border-radius:50%; width:25px; height:25px; cursor:pointer; font-weight:bold;">×</button>
                <div style="font-weight:bold; color:#3498db; font-size:12px; margin-bottom:10px; text-transform:uppercase;">Múltipla Escolha</div>
                <input type="text" class="ws-post-input q-pergunta" placeholder="Digite a pergunta..." style="margin-bottom:15px; font-weight:bold;">
                <div style="display:flex; flex-direction:column; gap:10px; padding-left:10px; border-left:3px solid #eee;">
                    <div style="display:flex; align-items:center; gap:10px;"><input type="radio" name="correta_${qId}" value="0" checked style="transform:scale(1.2);"><input type="text" class="ws-post-input q-op" placeholder="Opção A" style="margin:0; flex:1;"></div>
                    <div style="display:flex; align-items:center; gap:10px;"><input type="radio" name="correta_${qId}" value="1" style="transform:scale(1.2);"><input type="text" class="ws-post-input q-op" placeholder="Opção B" style="margin:0; flex:1;"></div>
                    <div style="display:flex; align-items:center; gap:10px;"><input type="radio" name="correta_${qId}" value="2" style="transform:scale(1.2);"><input type="text" class="ws-post-input q-op" placeholder="Opção C" style="margin:0; flex:1;"></div>
                    <div style="display:flex; align-items:center; gap:10px;"><input type="radio" name="correta_${qId}" value="3" style="transform:scale(1.2);"><input type="text" class="ws-post-input q-op" placeholder="Opção D" style="margin:0; flex:1;"></div>
                </div>
                <div style="font-size:11px; color:#7f8c8d; margin-top:10px;">Selecione o "círculo" ao lado da resposta que é a correta.</div>
            </div>`;
        } else {
            html = `
            <div class="ws-card ws-questao-build" style="border: 2px solid #9b59b6; position: relative; padding: 15px; margin-bottom: 0;">
                <button onclick="this.parentElement.remove()" style="position:absolute; right:10px; top:10px; background:#e74c3c; color:white; border:none; border-radius:50%; width:25px; height:25px; cursor:pointer; font-weight:bold;">×</button>
                <div style="font-weight:bold; color:#9b59b6; font-size:12px; margin-bottom:10px; text-transform:uppercase;">Dissertativa (Texto)</div>
                <input type="text" class="ws-post-input q-pergunta" placeholder="Digite a pergunta para o aluno dissertar..." style="margin-bottom:5px; font-weight:bold;">
                <div style="font-size:11px; color:#7f8c8d; font-style:italic;">O aluno receberá uma caixa de texto grande para escrever livremente.</div>
            </div>`;
        }

        area.insertAdjacentHTML('beforeend', html);
    },

    salvarProvaEscrita: () => {
        const titulo = document.getElementById('ws-nova-prova-titulo').value;
        const tempo = document.getElementById('ws-nova-prova-tempo').value;
        
        if(!titulo) return Workspace.mostrarAviso("Defina um título para a prova.", "warning");

        const qCards = document.querySelectorAll('.ws-questao-build');
        if(qCards.length === 0) return Workspace.mostrarAviso("Adicione pelo menos uma pergunta ao exame.", "warning");

        const questaoData = [];
        let erro = false;

        qCards.forEach((card, index) => {
            const pergunta = card.querySelector('.q-pergunta').value.trim();
            if(!pergunta) erro = true;

            if(card.style.borderColor.includes('db')) { // É Múltipla Escolha
                const opcoes = Array.from(card.querySelectorAll('.q-op')).map(i => i.value.trim());
                if(opcoes.some(o => o === '')) erro = true;

                const rds = Array.from(card.querySelectorAll('input[type="radio"]'));
                const indexCorreta = rds.findIndex(r => r.checked);

                questaoData.push({
                    id: `q${index+1}`,
                    tipo: 'escolha',
                    pergunta: `${index+1}. ${pergunta}`,
                    opcoes: opcoes,
                    respostaCorreta: opcoes[indexCorreta]
                });
            } else { // É Texto
                questaoData.push({
                    id: `q${index+1}`,
                    tipo: 'texto',
                    pergunta: `${index+1}. ${pergunta}`
                });
            }
        });

        if(erro) return Workspace.mostrarAviso("Existem perguntas ou opções em branco. Preencha tudo.", "warning");

        console.log("📝 Prova Pronta para Backend:", { titulo, tempo, questoes: questaoData });
        Workspace.mostrarAviso("Simulação: Prova montada com sucesso!", "success");
        Workspace.Avaliacoes.voltarMenuProf();
    },

    salvarProvaOral: () => {
        const titulo = document.getElementById('ws-nova-oral-titulo').value;
        const instrucoes = document.getElementById('ws-nova-oral-instrucoes').value;
        
        if(!titulo || !instrucoes) return Workspace.mostrarAviso("Preencha título e instruções.", "warning");

        console.log("🎤 Teste Oral Pronto para Backend:", { titulo, instrucoes });
        Workspace.mostrarAviso("Simulação: Teste Oral criado com sucesso!", "success");
        Workspace.Avaliacoes.voltarMenuProf();
    }     

};