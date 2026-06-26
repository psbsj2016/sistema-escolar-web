// js/modulos/workspace/avaliacoes.js
window.Workspace = window.Workspace || {};

Workspace.Avaliacoes = {
    // Variáveis Globais
    avaliacoesDisponiveis: [],
    
    // Variáveis da Prova Escrita
    exameAtivo: null,
    cronometroInterval: null,
    segundosRestantes: 0,
    respostas: {},

    // Variáveis do Estúdio Oral
    estudioAtivo: null,
    mediaRecorder: null,
    audioChunks: [],
    audioBlob: null,
    streamMicrofone: null,
    gravacaoInterval: null,
    segundosGravados: 0,

    init: () => {
        console.log("📝 Motor de Avaliações conectado à API.");
        // Carrega os lobbies silenciosamente em plano de fundo para quando o aluno lá clicar já estar tudo pronto
        if (Workspace.usuario && Workspace.usuario.tipo === 'Aluno') {
            Workspace.Avaliacoes.carregarLobbies();
        }
    },

    // ==========================================
    // 🌐 INTEGRAÇÃO COM O BACKEND (O LOBBY DO ALUNO)
    // ==========================================
    carregarLobbies: async () => {
        const containerEscritas = document.getElementById('ws-lista-provas-escritas');
        const containerOrais = document.getElementById('ws-lista-provas-orais');
        
        if(containerEscritas) containerEscritas.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;">A carregar os seus exames... ⏳</div>';
        if(containerOrais) containerOrais.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;">A carregar testes orais... ⏳</div>';

        try {
            const res = await Workspace.api(`/workspace/avaliacoes?escolaId=${Workspace.usuario.escolaId}`, 'GET');
            if (res && res.success) {
                // Aqui no futuro pode filtrar para mostrar apenas as "pendentes" (que ele ainda não entregou)
                Workspace.Avaliacoes.avaliacoesDisponiveis = res.avaliacoes || [];
                Workspace.Avaliacoes.renderizarLobbies();
            }
        } catch (e) {
            console.error(e);
            Workspace.mostrarAviso("Erro ao ligar ao servidor de exames.", "error");
        }
    },

    renderizarLobbies: () => {
        const escritas = Workspace.Avaliacoes.avaliacoesDisponiveis.filter(a => a.tipo === 'escrita');
        const orais = Workspace.Avaliacoes.avaliacoesDisponiveis.filter(a => a.tipo === 'oral');

        const containerEscritas = document.getElementById('ws-lista-provas-escritas');
        const containerOrais = document.getElementById('ws-lista-provas-orais');

        // Renderiza Lobbby Escrito
        if (containerEscritas) {
            if (escritas.length === 0) {
                containerEscritas.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px; color: #7f8c8d;">
                        <div style="font-size: 40px; margin-bottom: 10px;">🎉</div>
                        <h4 style="margin: 0 0 5px 0; color: #2c3e50;">Tudo em dia!</h4>
                        <p style="font-size: 13px; margin: 0;">Não há nenhuma avaliação escrita pendente no momento.</p>
                    </div>`;
            } else {
                containerEscritas.innerHTML = escritas.map(p => `
                    <div style="background: #fff; border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
                        <div>
                            <h4 style="margin: 0 0 5px 0; color: #2c3e50;">${p.titulo}</h4>
                            <span style="font-size: 11px; color: #7f8c8d;">⏱️ ${p.tempo ? p.tempo + ' min' : 'Sem limite'} | 📝 ${p.questoes ? p.questoes.length : 0} Questões</span>
                        </div>
                        <button class="ws-btn" style="background: #3498db; padding: 8px 15px; font-size: 12px; border-radius: 20px;" onclick="Workspace.Avaliacoes.iniciarExame('${p.id}')" ontouchstart="">Iniciar Exame</button>
                    </div>
                `).join('');
            }
        }

        // Renderiza Lobby Oral
        if (containerOrais) {
            if (orais.length === 0) {
                containerOrais.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px; color: #7f8c8d;">
                        <div style="font-size: 40px; margin-bottom: 10px;">🎧</div>
                        <h4 style="margin: 0 0 5px 0; color: #2c3e50;">Voz descansada!</h4>
                        <p style="font-size: 13px; margin: 0;">Não tem testes de áudio pendentes de envio.</p>
                    </div>`;
            } else {
                containerOrais.innerHTML = orais.map(p => `
                    <div style="background: #fff; border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
                        <div>
                            <h4 style="margin: 0 0 5px 0; color: #2c3e50;">${p.titulo}</h4>
                            <span style="font-size: 11px; color: #7f8c8d;">🎤 Teste de Conversação/Leitura</span>
                        </div>
                        <button class="ws-btn" style="background: #3498db; padding: 8px 15px; font-size: 12px; border-radius: 20px;" onclick="Workspace.Avaliacoes.iniciarTesteOral('${p.id}')" ontouchstart="">Entrar no Estúdio</button>
                    </div>
                `).join('');
            }
        }
    },


    // ==========================================
    // ✍️ FASE 2: LÓGICA DA AVALIAÇÃO ESCRITA
    // ==========================================
    iniciarExame: (id) => {
        const exame = Workspace.Avaliacoes.avaliacoesDisponiveis.find(a => a.id === id);
        if(!exame) return;
        Workspace.Avaliacoes.entrarModoFoco(exame.id, exame.titulo, exame.tempo, exame.questoes);
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
        if(duracaoMinutos) Workspace.Avaliacoes.iniciarCronometro(duracaoMinutos * 60);
        else document.getElementById('ws-exame-cronometro').innerText = "LIVRE";
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

    finalizarExame: async (forcar = false) => {
        if (!forcar && !confirm("Deseja entregar o exame de forma definitiva? Não poderá alterar as respostas depois.")) return;

        Workspace.mostrarAviso("A entregar avaliação... ⏳", "info");
        
        try {
            const res = await Workspace.api(`/workspace/avaliacoes/${Workspace.Avaliacoes.exameAtivo}/entregar`, 'POST', {
                respostas: Workspace.Avaliacoes.respostas,
                alunoId: Workspace.usuario.id,
                alunoNome: Workspace.usuario.nome || Workspace.usuario.login
            });

            if(res && res.success) {
                Workspace.mostrarAviso("Avaliação entregue com sucesso! 🎉", "success");
                localStorage.removeItem(`ws_exame_draft_${Workspace.Avaliacoes.exameAtivo}`);
                
                document.body.style.overflow = ''; 
                document.getElementById('ws-exame-foco-tela').style.display = 'none';
                if(Workspace.Avaliacoes.cronometroInterval) clearInterval(Workspace.Avaliacoes.cronometroInterval);
                Workspace.Avaliacoes.exameAtivo = null;
                
                Workspace.Avaliacoes.carregarLobbies(); // Refresh
            } else {
                throw new Error("Erro na entrega.");
            }
        } catch(e) {
            Workspace.mostrarAviso("Erro ao entregar a prova. Verifique a sua ligação à internet.", "error");
        }
    },

    // ==========================================
    // 🎤 FASE 3: LÓGICA DO ESTÚDIO DE ÁUDIO
    // ==========================================
    iniciarTesteOral: (id) => {
        const teste = Workspace.Avaliacoes.avaliacoesDisponiveis.find(a => a.id === id);
        if(!teste) return;
        Workspace.Avaliacoes.abrirEstudioAudio(teste.id, teste.titulo, teste.instrucoes);
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
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            Workspace.Avaliacoes.streamMicrofone = stream;
            
            Workspace.Avaliacoes.mediaRecorder = new MediaRecorder(stream);
            Workspace.Avaliacoes.audioChunks = [];

            Workspace.Avaliacoes.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) Workspace.Avaliacoes.audioChunks.push(event.data);
            };

            Workspace.Avaliacoes.mediaRecorder.onstop = () => {
                Workspace.Avaliacoes.audioBlob = new Blob(Workspace.Avaliacoes.audioChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(Workspace.Avaliacoes.audioBlob);
                
                document.getElementById('ws-audio-preview').src = audioUrl;
                document.getElementById('ws-area-gravacao').style.display = 'none';
                document.getElementById('ws-area-player').style.display = 'block';

                Workspace.Avaliacoes.streamMicrofone.getTracks().forEach(track => track.stop());
            };

            Workspace.Avaliacoes.mediaRecorder.start();

            document.getElementById('ws-btn-iniciar-gravacao').style.display = 'none';
            document.getElementById('ws-btn-parar-gravacao').style.display = 'inline-block';
            document.getElementById('ws-mic-ring').style.borderColor = '#e74c3c';
            document.getElementById('ws-mic-ring').style.background = 'rgba(231, 76, 60, 0.2)';
            document.getElementById('ws-audio-cronometro').style.color = '#e74c3c';

            Workspace.Avaliacoes.segundosGravados = 0;
            if(Workspace.Avaliacoes.gravacaoInterval) clearInterval(Workspace.Avaliacoes.gravacaoInterval);
            
            Workspace.Avaliacoes.gravacaoInterval = setInterval(() => {
                Workspace.Avaliacoes.segundosGravados++;
                const min = Math.floor(Workspace.Avaliacoes.segundosGravados / 60).toString().padStart(2, '0');
                const seg = (Workspace.Avaliacoes.segundosGravados % 60).toString().padStart(2, '0');
                document.getElementById('ws-audio-cronometro').innerText = `${min}:${seg}`;
                
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

        try {
            // 1. Converte o Blob num Arquivo e envia para a sua Rota de Uploads
            const formData = new FormData();
            const arquivoAudio = new File([Workspace.Avaliacoes.audioBlob], `oral_${Workspace.Avaliacoes.estudioAtivo}_${Date.now()}.webm`, { type: 'audio/webm' });
            formData.append('anexos', arquivoAudio);

            const uploadRes = await fetch('/api/workspace/upload', {
                method: 'POST', credentials: 'include', body: formData 
            });
            const uploadData = await uploadRes.json();
            
            if (!uploadData.success || !uploadData.anexos || uploadData.anexos.length === 0) {
                throw new Error("Falha no upload físico do áudio.");
            }

            const audioUrlFinal = uploadData.anexos[0].url;

            // 2. Envia o link final do áudio para a Rota de Entrega das Avaliações
            const res = await Workspace.api(`/workspace/avaliacoes/${Workspace.Avaliacoes.estudioAtivo}/entregar`, 'POST', {
                audioUrl: audioUrlFinal,
                alunoId: Workspace.usuario.id,
                alunoNome: Workspace.usuario.nome || Workspace.usuario.login
            });

            if (res && res.success) {
                Workspace.mostrarAviso("Áudio enviado com sucesso! O professor será notificado.", "success");
                
                document.body.style.overflow = '';
                document.getElementById('ws-audio-foco-tela').style.display = 'none';
                Workspace.Avaliacoes.estudioAtivo = null;
                Workspace.Avaliacoes.carregarLobbies(); // Refresh
            } else {
                throw new Error("Erro no backend ao gravar entrega.");
            }
        } catch(e) {
            console.error(e);
            Workspace.mostrarAviso("Falha ao enviar o áudio. Tente novamente.", "error");
        } finally {
            btn.innerText = "📤 Enviar Áudio";
            btn.disabled = false;
        }
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
        document.getElementById('ws-builder-questoes').innerHTML = ''; 
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
    },

    voltarMenuProf: () => {
        document.getElementById('ws-prof-nova-escrita').style.display = 'none';
        document.getElementById('ws-prof-nova-oral').style.display = 'none';
        document.getElementById('ws-prof-recebidas').style.display = 'none';
        document.getElementById('ws-prof-menu-avaliacoes').style.display = 'grid';
    },

    adicionarQuestaoBuilder: (tipo) => {
        const area = document.getElementById('ws-builder-questoes');
        const qId = Date.now(); 
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

    salvarProvaEscrita: async () => {
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

            if(card.style.borderColor.includes('db')) { 
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
            } else { 
                questaoData.push({
                    id: `q${index+1}`,
                    tipo: 'texto',
                    pergunta: `${index+1}. ${pergunta}`
                });
            }
        });

        if(erro) return Workspace.mostrarAviso("Existem perguntas ou opções em branco. Preencha tudo.", "warning");

        const btn = event.target;
        const txtOriginal = btn.innerText;
        btn.innerText = "⏳ A gravar...";
        btn.disabled = true;

        try {
            const res = await Workspace.api('/workspace/avaliacoes', 'POST', {
                titulo: titulo,
                tipo: 'escrita',
                tempo: parseInt(tempo, 10),
                questoes: questaoData,
                escolaId: Workspace.usuario.escolaId,
                autorNome: Workspace.usuario.nome || Workspace.usuario.login
            });

            if (res && res.success) {
                Workspace.mostrarAviso("Avaliação Escrita publicada com sucesso!", "success");
                document.getElementById('ws-nova-prova-titulo').value = '';
                document.getElementById('ws-builder-questoes').innerHTML = '';
                Workspace.Avaliacoes.voltarMenuProf();
            } else {
                throw new Error("Erro do servidor.");
            }
        } catch (e) {
            Workspace.mostrarAviso("Falha ao comunicar com o servidor.", "error");
        } finally {
            btn.innerText = txtOriginal;
            btn.disabled = false;
        }
    },

    salvarProvaOral: async () => {
        const titulo = document.getElementById('ws-nova-oral-titulo').value.trim();
        const instrucoes = document.getElementById('ws-nova-oral-instrucoes').value.trim();
        
        if(!titulo || !instrucoes) return Workspace.mostrarAviso("Preencha título e instruções.", "warning");

        const btn = event.target;
        const txtOriginal = btn.innerText;
        btn.innerText = "⏳ A gravar...";
        btn.disabled = true;

        try {
            const res = await Workspace.api('/workspace/avaliacoes', 'POST', {
                titulo: titulo,
                tipo: 'oral',
                instrucoes: instrucoes,
                escolaId: Workspace.usuario.escolaId,
                autorNome: Workspace.usuario.nome || Workspace.usuario.login
            });

            if (res && res.success) {
                Workspace.mostrarAviso("Teste Oral publicado com sucesso!", "success");
                document.getElementById('ws-nova-oral-titulo').value = '';
                document.getElementById('ws-nova-oral-instrucoes').value = '';
                Workspace.Avaliacoes.voltarMenuProf();
            } else {
                throw new Error("Erro do servidor.");
            }
        } catch (e) {
            Workspace.mostrarAviso("Falha ao comunicar com o servidor.", "error");
        } finally {
            btn.innerText = txtOriginal;
            btn.disabled = false;
        }
    }
};