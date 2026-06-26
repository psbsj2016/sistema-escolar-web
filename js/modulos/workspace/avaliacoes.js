// js/modulos/workspace/avaliacoes.js
window.Workspace = window.Workspace || {};

Workspace.Avaliacoes = {
    avaliacoesDisponiveis: [],
    entregasFeitas: [], // Guarda o histórico do aluno
    entregasEmCache: [], // Guarda entregas globais para o professor
    provasEmCache: {},
    abaEscrita: 'pendentes',
    abaOral: 'pendentes',
    
    exameAtivo: null,
    cronometroInterval: null,
    segundosRestantes: 0,
    respostas: {},

    estudioAtivo: null,
    mediaRecorder: null,
    audioChunks: [],
    audioBlob: null,
    streamMicrofone: null,
    gravacaoInterval: null,
    segundosGravados: 0,

    init: () => {
        console.log("📝 Motor de Avaliações blindado e ativo.");
        if (Workspace.usuario && Workspace.usuario.tipo === 'Aluno') {
            Workspace.Avaliacoes.carregarLobbies();
        }
    },

    // ==========================================
    // 🌐 BUG 1 RESOLVIDO: O LOBBY INTELIGENTE
    // ==========================================
    carregarLobbies: async () => {
        try {
            const resAval = await Workspace.api(`/workspace/avaliacoes?escolaId=${Workspace.usuario.escolaId}`, 'GET');
            if (resAval && resAval.success) Workspace.Avaliacoes.avaliacoesDisponiveis = resAval.avaliacoes;

            const resEntregas = await Workspace.api(`/workspace/avaliacoes/minhas-entregas/${Workspace.usuario.id}`, 'GET');
            if (resEntregas && resEntregas.success) Workspace.Avaliacoes.entregasFeitas = resEntregas.entregas;

            Workspace.Avaliacoes.renderizarLobbies();
        } catch (e) {
            console.error(e);
        }
    },

    mudarAbaEscrita: (aba) => { Workspace.Avaliacoes.abaEscrita = aba; Workspace.Avaliacoes.renderizarLobbies(); },
    mudarAbaOral: (aba) => { Workspace.Avaliacoes.abaOral = aba; Workspace.Avaliacoes.renderizarLobbies(); },

    renderizarLobbies: () => {
        const escritas = Workspace.Avaliacoes.avaliacoesDisponiveis.filter(a => a.tipo === 'escrita');
        const orais = Workspace.Avaliacoes.avaliacoesDisponiveis.filter(a => a.tipo === 'oral');

        const entreguesIds = Workspace.Avaliacoes.entregasFeitas.map(e => e.avaliacaoId);

        // Separa pendentes de concluídas
        const escPendentes = escritas.filter(a => !entreguesIds.includes(a.id));
        const escConcluidas = escritas.filter(a => entreguesIds.includes(a.id));
        const orPendentes = orais.filter(a => !entreguesIds.includes(a.id));
        const orConcluidas = orais.filter(a => entreguesIds.includes(a.id));

        // UI das Abas Escritas
        const tEscPend = document.getElementById('tab-escrita-pendentes');
        const tEscConc = document.getElementById('tab-escrita-concluidas');
        if (tEscPend && tEscConc) {
            tEscPend.innerText = `Pendentes (${escPendentes.length})`;
            tEscPend.style.background = Workspace.Avaliacoes.abaEscrita === 'pendentes' ? '#2c3e50' : 'transparent';
            tEscPend.style.color = Workspace.Avaliacoes.abaEscrita === 'pendentes' ? 'white' : '#7f8c8d';
            tEscConc.style.background = Workspace.Avaliacoes.abaEscrita === 'concluidas' ? '#2c3e50' : 'transparent';
            tEscConc.style.color = Workspace.Avaliacoes.abaEscrita === 'concluidas' ? 'white' : '#7f8c8d';
        }

        // UI das Abas Orais
        const tOrPend = document.getElementById('tab-oral-pendentes');
        const tOrConc = document.getElementById('tab-oral-concluidas');
        if (tOrPend && tOrConc) {
            tOrPend.innerText = `Para Gravar (${orPendentes.length})`;
            tOrPend.style.background = Workspace.Avaliacoes.abaOral === 'pendentes' ? '#2c3e50' : 'transparent';
            tOrPend.style.color = Workspace.Avaliacoes.abaOral === 'pendentes' ? 'white' : '#7f8c8d';
            tOrConc.style.background = Workspace.Avaliacoes.abaOral === 'concluidas' ? '#2c3e50' : 'transparent';
            tOrConc.style.color = Workspace.Avaliacoes.abaOral === 'concluidas' ? 'white' : '#7f8c8d';
        }

        // Render Escritas
        const contEscritas = document.getElementById('ws-lista-provas-escritas');
        if (contEscritas) {
            const listaAtiva = Workspace.Avaliacoes.abaEscrita === 'pendentes' ? escPendentes : escConcluidas;
            if (listaAtiva.length === 0) {
                contEscritas.innerHTML = `<div style="text-align: center; padding: 40px; color: #7f8c8d;">🎉 Nenhuma prova nesta lista.</div>`;
            } else {
                contEscritas.innerHTML = listaAtiva.map(p => `
                    <div style="background: #fff; border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin: 0 0 5px 0; color: #2c3e50;">${p.titulo}</h4>
                            <span style="font-size: 11px; color: #7f8c8d;">⏱️ ${p.tempo ? p.tempo + ' min' : 'Livre'} | 📝 ${p.questoes ? p.questoes.length : 0} Questões</span>
                        </div>
                        ${Workspace.Avaliacoes.abaEscrita === 'pendentes' 
                            ? `<button class="ws-btn" style="background: #3498db; padding: 8px 15px; font-size: 12px; border-radius: 20px;" onclick="Workspace.Avaliacoes.iniciarExame('${p.id}')">Iniciar Exame</button>`
                            : `<span style="color:#27ae60; font-size:12px; font-weight:bold;">✅ Entregue</span>`
                        }
                    </div>
                `).join('');
            }
        }

        // Render Orais
        const contOrais = document.getElementById('ws-lista-provas-orais');
        if (contOrais) {
            const listaAtivaOral = Workspace.Avaliacoes.abaOral === 'pendentes' ? orPendentes : orConcluidas;
            if (listaAtivaOral.length === 0) {
                contOrais.innerHTML = `<div style="text-align: center; padding: 40px; color: #7f8c8d;">🎧 Sem gravações pendentes.</div>`;
            } else {
                contOrais.innerHTML = listaAtivaOral.map(p => `
                    <div style="background: #fff; border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin: 0 0 5px 0; color: #2c3e50;">${p.titulo}</h4>
                            <span style="font-size: 11px; color: #7f8c8d;">🎤 Teste Oral de Idiomas/Leitura</span>
                        </div>
                        ${Workspace.Avaliacoes.abaOral === 'pendentes' 
                            ? `<button class="ws-btn" style="background: #3498db; padding: 8px 15px; font-size: 12px; border-radius: 20px;" onclick="Workspace.Avaliacoes.iniciarTesteOral('${p.id}')">Ir ao Estúdio</button>`
                            : `<span style="color:#27ae60; font-size:12px; font-weight:bold;">✅ Enviado</span>`
                        }
                    </div>
                `).join('');
            }
        }
    },


    // ==========================================
    // ✍️ EXECUÇÃO ESCRITA & ESTÚDIO ORAL (Sem alterações)
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
                        <label style="background: ${corFundo}; border: 2px solid ${corBorda}; padding: 15px; border-radius: 8px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 10px; font-size: 14px;">
                            <input type="radio" name="questao_${q.id}" value="${opcao}" ${selecionado ? 'checked' : ''} onchange="Workspace.Avaliacoes.registarResposta('${q.id}', this.value)" style="transform: scale(1.3); margin:0;">
                            <span style="color: #2c3e50; font-weight: 500;">${opcao}</span>
                        </label>
                    `;
                });
                htmlResposta += `</div>`;
            } else {
                htmlResposta = `<div style="margin-top: 15px;"><textarea rows="6" placeholder="Digite a resposta..." style="width: 100%; padding: 15px; border-radius: 8px; border: 2px solid #eee; font-family: inherit; font-size: 14px; outline: none; box-sizing: border-box; resize: vertical;" oninput="Workspace.Avaliacoes.registarResposta('${q.id}', this.value)">${respostaSalva}</textarea></div>`;
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
                Workspace.mostrarAviso("O tempo esgotou! Prova entregue automaticamente.", "warning");
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
        if (confirm("Deseja abandonar a prova? O cronómetro continuará a contar.")) {
            document.body.style.overflow = ''; 
            document.getElementById('ws-exame-foco-tela').style.display = 'none';
            if(Workspace.Avaliacoes.cronometroInterval) clearInterval(Workspace.Avaliacoes.cronometroInterval);
            Workspace.Avaliacoes.exameAtivo = null;
        }
    },

    finalizarExame: async (forcar = false) => {
        if (!forcar && !confirm("Entregar exame definitivamente? Não poderá alterar as respostas.")) return;
        Workspace.mostrarAviso("A entregar avaliação... ⏳", "info");
        
        try {
            const res = await Workspace.api(`/workspace/avaliacoes/${Workspace.Avaliacoes.exameAtivo}/entregar`, 'POST', {
                respostas: Workspace.Avaliacoes.respostas, alunoId: Workspace.usuario.id, alunoNome: Workspace.usuario.nome || Workspace.usuario.login
            });

            if(res && res.success) {
                Workspace.mostrarAviso("Avaliação entregue com sucesso! 🎉", "success");
                localStorage.removeItem(`ws_exame_draft_${Workspace.Avaliacoes.exameAtivo}`);
                document.body.style.overflow = ''; 
                document.getElementById('ws-exame-foco-tela').style.display = 'none';
                if(Workspace.Avaliacoes.cronometroInterval) clearInterval(Workspace.Avaliacoes.cronometroInterval);
                Workspace.Avaliacoes.exameAtivo = null;
                Workspace.Avaliacoes.carregarLobbies(); 
            } else throw new Error("Erro na entrega.");
        } catch(e) { Workspace.mostrarAviso("Erro ao entregar a prova. Verifique a internet.", "error"); }
    },

    iniciarTesteOral: (id) => {
        const teste = Workspace.Avaliacoes.avaliacoesDisponiveis.find(a => a.id === id);
        if(!teste) return;
        Workspace.Avaliacoes.estudioAtivo = teste.id;
        document.getElementById('ws-audio-titulo').innerText = teste.titulo;
        document.getElementById('ws-audio-pergunta').innerText = teste.instrucoes;
        document.body.style.overflow = 'hidden'; 
        document.getElementById('ws-audio-foco-tela').style.display = 'block';
        document.getElementById('ws-audio-foco-tela').scrollTop = 0;
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

            Workspace.Avaliacoes.mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) Workspace.Avaliacoes.audioChunks.push(e.data); };
            Workspace.Avaliacoes.mediaRecorder.onstop = () => {
                Workspace.Avaliacoes.audioBlob = new Blob(Workspace.Avaliacoes.audioChunks, { type: 'audio/webm' });
                document.getElementById('ws-audio-preview').src = URL.createObjectURL(Workspace.Avaliacoes.audioBlob);
                document.getElementById('ws-area-gravacao').style.display = 'none';
                document.getElementById('ws-area-player').style.display = 'block';
                Workspace.Avaliacoes.streamMicrofone.getTracks().forEach(t => t.stop());
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
                    Workspace.mostrarAviso("Tempo máximo atingido.", "info");
                }
            }, 1000);
        } catch (err) { Workspace.mostrarAviso("Microfone bloqueado. Verifique as permissões.", "error"); }
    },

    pararGravacao: () => {
        if (Workspace.Avaliacoes.mediaRecorder && Workspace.Avaliacoes.mediaRecorder.state === 'recording') {
            Workspace.Avaliacoes.mediaRecorder.stop();
            if(Workspace.Avaliacoes.gravacaoInterval) clearInterval(Workspace.Avaliacoes.gravacaoInterval);
        }
    },

    descartarAudio: () => { if(confirm("Apagar gravação e começar de novo?")) Workspace.Avaliacoes.resetarInterfaceDeAudio(); },

    enviarAudio: async () => {
        if (!Workspace.Avaliacoes.audioBlob) return;
        const btn = document.getElementById('ws-btn-enviar-audio');
        btn.innerText = "A Enviar... ⏳"; btn.disabled = true;

        try {
            const formData = new FormData();
            formData.append('anexos', new File([Workspace.Avaliacoes.audioBlob], `oral_${Date.now()}.webm`, { type: 'audio/webm' }));
            const uploadRes = await fetch('/api/workspace/upload', { method: 'POST', credentials: 'include', body: formData });
            const uploadData = await uploadRes.json();
            
            if (!uploadData.success || !uploadData.anexos) throw new Error("Falha no upload.");
            const audioUrlFinal = uploadData.anexos[0].url;

            const res = await Workspace.api(`/workspace/avaliacoes/${Workspace.Avaliacoes.estudioAtivo}/entregar`, 'POST', {
                audioUrl: audioUrlFinal, alunoId: Workspace.usuario.id, alunoNome: Workspace.usuario.nome || Workspace.usuario.login
            });

            if (res && res.success) {
                Workspace.mostrarAviso("Áudio enviado com sucesso!", "success");
                document.body.style.overflow = '';
                document.getElementById('ws-audio-foco-tela').style.display = 'none';
                Workspace.Avaliacoes.estudioAtivo = null;
                Workspace.Avaliacoes.carregarLobbies(); 
            } else throw new Error("Erro no backend.");
        } catch(e) { Workspace.mostrarAviso("Falha ao enviar o áudio.", "error"); } 
        finally { btn.innerText = "📤 Enviar Áudio"; btn.disabled = false; }
    },

    sairDoEstudio: () => {
        if (Workspace.Avaliacoes.mediaRecorder && Workspace.Avaliacoes.mediaRecorder.state === 'recording') {
            if(!confirm("Ainda está a gravar! Deseja sair e perder o áudio?")) return;
            Workspace.Avaliacoes.pararGravacao();
        }
        document.body.style.overflow = '';
        document.getElementById('ws-audio-foco-tela').style.display = 'none';
        Workspace.Avaliacoes.estudioAtivo = null;
    },

    // ==========================================
    // 🎓 FASE 4 E 5: PAINEL DO PROFESSOR (CRIAÇÃO E BUG 2 E 3 RESOLVIDOS)
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
            </div>`;
        } else {
            html = `
            <div class="ws-card ws-questao-build" style="border: 2px solid #9b59b6; position: relative; padding: 15px; margin-bottom: 0;">
                <button onclick="this.parentElement.remove()" style="position:absolute; right:10px; top:10px; background:#e74c3c; color:white; border:none; border-radius:50%; width:25px; height:25px; cursor:pointer; font-weight:bold;">×</button>
                <div style="font-weight:bold; color:#9b59b6; font-size:12px; margin-bottom:10px; text-transform:uppercase;">Dissertativa (Texto)</div>
                <input type="text" class="ws-post-input q-pergunta" placeholder="Digite a pergunta para o aluno dissertar..." style="margin-bottom:5px; font-weight:bold;">
            </div>`;
        }
        area.insertAdjacentHTML('beforeend', html);
    },

    salvarProvaEscrita: async () => {
        const titulo = document.getElementById('ws-nova-prova-titulo').value;
        const tempo = document.getElementById('ws-nova-prova-tempo').value;
        if(!titulo) return Workspace.mostrarAviso("Defina um título.", "warning");

        const qCards = document.querySelectorAll('.ws-questao-build');
        if(qCards.length === 0) return Workspace.mostrarAviso("Adicione perguntas.", "warning");

        const questaoData = [];
        let erro = false;

        qCards.forEach((card, index) => {
            const pergunta = card.querySelector('.q-pergunta').value.trim();
            if(!pergunta) erro = true;

            // 🚀 BUG 2 RESOLVIDO: Procura fisicamente pelas opções para confirmar se é múltipla escolha, em vez de depender da cor!
            if(card.querySelector('.q-op')) { 
                const opcoes = Array.from(card.querySelectorAll('.q-op')).map(i => i.value.trim());
                if(opcoes.some(o => o === '')) erro = true;

                const rds = Array.from(card.querySelectorAll('input[type="radio"]'));
                const indexCorreta = rds.findIndex(r => r.checked);

                questaoData.push({ id: `q${index+1}`, tipo: 'escolha', pergunta: `${index+1}. ${pergunta}`, opcoes: opcoes, respostaCorreta: opcoes[indexCorreta] });
            } else { 
                questaoData.push({ id: `q${index+1}`, tipo: 'texto', pergunta: `${index+1}. ${pergunta}` });
            }
        });

        if(erro) return Workspace.mostrarAviso("Existem espaços em branco.", "warning");

        const btn = event.target;
        const txt = btn.innerText;
        btn.innerText = "⏳ A gravar..."; btn.disabled = true;

        try {
            const res = await Workspace.api('/workspace/avaliacoes', 'POST', {
                titulo, tipo: 'escrita', tempo: parseInt(tempo, 10), questoes: questaoData, escolaId: Workspace.usuario.escolaId, autorNome: Workspace.usuario.nome || Workspace.usuario.login
            });
            if (res && res.success) {
                Workspace.mostrarAviso("Avaliação publicada!", "success");
                document.getElementById('ws-nova-prova-titulo').value = '';
                document.getElementById('ws-builder-questoes').innerHTML = '';
                Workspace.Avaliacoes.voltarMenuProf();
            } else throw new Error();
        } catch (e) { Workspace.mostrarAviso("Erro no servidor.", "error"); } finally { btn.innerText = txt; btn.disabled = false; }
    },

    salvarProvaOral: async () => {
        const titulo = document.getElementById('ws-nova-oral-titulo').value.trim();
        const instrucoes = document.getElementById('ws-nova-oral-instrucoes').value.trim();
        if(!titulo || !instrucoes) return Workspace.mostrarAviso("Preencha título e instruções.", "warning");

        const btn = event.target;
        const txt = btn.innerText; btn.innerText = "⏳ A gravar..."; btn.disabled = true;

        try {
            const res = await Workspace.api('/workspace/avaliacoes', 'POST', {
                titulo, tipo: 'oral', instrucoes, escolaId: Workspace.usuario.escolaId, autorNome: Workspace.usuario.nome || Workspace.usuario.login
            });
            if (res && res.success) {
                Workspace.mostrarAviso("Teste Oral publicado!", "success");
                document.getElementById('ws-nova-oral-titulo').value = '';
                document.getElementById('ws-nova-oral-instrucoes').value = '';
                Workspace.Avaliacoes.voltarMenuProf();
            } else throw new Error();
        } catch (e) { Workspace.mostrarAviso("Erro no servidor.", "error"); } finally { btn.innerText = txt; btn.disabled = false; }
    },

    // ==========================================
    // 🚀 BUG 3 RESOLVIDO: PAINEL DE CORREÇÃO DO PROFESSOR
    // ==========================================
    abrirRecebidas: async () => {
        document.getElementById('ws-prof-menu-avaliacoes').style.display = 'none';
        document.getElementById('ws-prof-nova-escrita').style.display = 'none';
        document.getElementById('ws-prof-nova-oral').style.display = 'none';
        document.getElementById('ws-prof-recebidas').style.display = 'block';
        
        const container = document.getElementById('ws-prof-recebidas-lista');
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">A carregar provas recebidas da API... ⏳</div>';

        try {
            const resProvas = await Workspace.api(`/workspace/avaliacoes?escolaId=${Workspace.usuario.escolaId}`, 'GET');
            const resEntregas = await Workspace.api(`/workspace/avaliacoes/entregas`, 'GET');

            if (resEntregas && resEntregas.success && resProvas && resProvas.success) {
                const provasMap = {};
                resProvas.avaliacoes.forEach(p => provasMap[p.id] = p);

                if (resEntregas.entregas.length === 0) {
                    container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">Nenhuma prova entregue ainda.</div>';
                    return;
                }

                Workspace.Avaliacoes.entregasEmCache = resEntregas.entregas;
                Workspace.Avaliacoes.provasEmCache = provasMap;

                container.innerHTML = resEntregas.entregas.map(e => {
                    const prova = provasMap[e.avaliacaoId];
                    const tituloProva = prova ? prova.titulo : 'Prova Excluída';
                    const icone = (prova && prova.tipo === 'oral') ? '🎤' : '✍️';

                    return `
                        <div style="background: #fff; border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
                            <div>
                                <h4 style="margin: 0 0 5px 0; color: #2c3e50;">${icone} ${tituloProva}</h4>
                                <span style="font-size: 11px; color: #7f8c8d;">Aluno: <strong style="color:#3498db;">${e.alunoNome}</strong> | Data: ${new Date(e.dataEntrega).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <button class="ws-btn" style="background: #27ae60; padding: 8px 15px; font-size: 12px; border-radius: 20px;" onclick="Workspace.Avaliacoes.verCorrecao('${e.id}')">Ver Respostas</button>
                        </div>
                    `;
                }).join('');
            }
        } catch (err) {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: #e74c3c;">Erro ao carregar.</div>';
        }
    },

    verCorrecao: (entregaId) => {
        const entrega = Workspace.Avaliacoes.entregasEmCache.find(e => e.id === entregaId);
        const prova = Workspace.Avaliacoes.provasEmCache[entrega.avaliacaoId];
        if(!entrega || !prova) return;

        let htmlRespostas = '';
        if(prova.tipo === 'oral') {
            htmlRespostas = `
                <div style="margin-top: 20px; text-align:center;">
                    <audio controls src="${entrega.audioUrl}" style="width: 100%; outline: none; margin-bottom: 10px;"></audio>
                    <a href="${entrega.audioUrl}" target="_blank" style="font-size:12px; color:#3498db;">Fazer Download do Áudio</a>
                </div>
            `;
        } else {
            htmlRespostas = `<div style="margin-top:20px; display:flex; flex-direction:column; gap:15px;">`;
            prova.questoes.forEach(q => {
                const respAluno = entrega.respostas[q.id] || '<span style="color:#aaa;">Não respondeu</span>';
                let validacaoHtml = '';
                let corBg = '#f9f9f9';

                if(q.tipo === 'escolha') {
                    const acertou = (respAluno === q.respostaCorreta);
                    corBg = acertou ? '#eafaf1' : '#fdf2f2';
                    validacaoHtml = acertou 
                        ? `<div style="color:#27ae60; font-size:12px; font-weight:bold; margin-top:8px;">✅ Acertou</div>` 
                        : `<div style="color:#e74c3c; font-size:12px; font-weight:bold; margin-top:8px;">❌ Errou (Correta: ${q.respostaCorreta})</div>`;
                }

                htmlRespostas += `
                    <div style="background: ${corBg}; padding: 15px; border-radius: 8px; border: 1px solid #eee;">
                        <div style="font-weight:bold; color:#2c3e50; font-size:13px; margin-bottom:8px;">${q.pergunta}</div>
                        <div style="color:#555; font-size:13px; margin-bottom:5px;"><strong>Resposta do Aluno:</strong><br>${respAluno}</div>
                        ${validacaoHtml}
                    </div>
                `;
            });
            htmlRespostas += `</div>`;
        }

        const modalId = 'modal-ver-entrega';
        if(document.getElementById(modalId)) document.getElementById(modalId).remove();

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:100000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px);";
        modal.innerHTML = `
            <div class="ws-card" style="width: 90%; max-width: 700px; max-height: 85vh; overflow-y: auto; padding: 30px; position: relative;">
                <button onclick="document.getElementById('${modalId}').remove()" style="position:absolute; right:15px; top:15px; background:#eee; border:none; border-radius:50%; width:35px; height:35px; cursor:pointer; font-weight:bold; color:#333; font-size:18px;">×</button>
                <h3 style="margin: 0 0 5px 0; color: #2c3e50;">Avaliação de ${entrega.alunoNome}</h3>
                <span style="font-size: 13px; color: #7f8c8d; font-weight:bold;">Prova: ${prova.titulo}</span>
                ${htmlRespostas}
            </div>
        `;
        document.body.appendChild(modal);
    }
};