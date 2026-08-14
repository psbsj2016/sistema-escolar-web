// js/modulos/workspace/ingles.js
window.Workspace = window.Workspace || {};

Workspace.Ingles = {
    state: {
        xp: 0, streak: 1, words: [], phrases: [], quizzes: [], pictures: [], minimalPairs: [], debates: [], submissions: [], pool: []
    },
    mediaRecorder: null, audioChunks: [], currentAudioURL: null, audioBlob: null, streamMicrofone: null, recognition: null,

    // 📚 DADOS INICIAIS (A Semente do Algoritmo)
    defaults: {
        words: [
            {id:'w1', word:'Although', translation:'Embora', level:'B2', example:'Although it was raining, we went out.', context:'Concessão'},
            {id:'w2', word:'Beneath', translation:'Abaixo de', level:'B1', example:'The keys were beneath the book.', context:'Preposição'},
            {id:'w3', word:'Achieve', translation:'Alcançar', level:'B1', example:'You can achieve anything with focus.', context:'Verbo'},
            {id:'w4', word:'Whisper', translation:'Sussurrar', level:'B2', example:'She whispered a secret.', context:'Verbo'}
        ],
        phrases: [
            {id:'p1', phrase:'Could you tell me where the nearest pharmacy is?', translation:'Você poderia me dizer onde fica a farmácia mais próxima?', level:'A2', focus:'Politeness'},
            {id:'p2', phrase:'If I had more time, I would travel the world.', translation:'Se eu tivesse mais tempo, viajaria o mundo.', level:'B2', focus:'Second Conditional'},
            {id:'p3', phrase:'She has been learning English for three years.', translation:'Ela está aprendendo inglês há três anos.', level:'B1', focus:'Present Perfect Continuous'}
        ],
        quizzes: [
            {id:'q1', question:'Choose the correct sentence:', options:['I have been to London last year','I went to London last year','I have went to London last year'], correct:1, explanation:'Use past simple with finished time (last year).', level:'B1'},
            {id:'q2', question:'Fill: I _____ here since 2019.', options:['live','am living','have lived','lived'], correct:2, explanation:'Present perfect with since.', level:'B1'}
        ],
        pictures: [
            {id:'pic1', word:'apple', translation:'maçã', emoji:'🍎', category:'Food'},
            {id:'pic2', word:'bicycle', translation:'bicicleta', emoji:'🚲', category:'Transport'},
            {id:'pic3', word:'laptop', translation:'notebook', emoji:'💻', category:'Tech'},
            {id:'pic4', word:'umbrella', translation:'guarda-chuva', emoji:'☂️', category:'Objects'}
        ],
        minimalPairs: [
            {id:'mp1', a:'ship', b:'sheep', ipaA:'/ʃɪp/', ipaB:'/ʃiːp/', sentenceA:'The ship is big.', sentenceB:'The sheep is white.'},
            {id:'mp2', a:'beach', b:'bitch', ipaA:'/biːtʃ/', ipaB:'/bɪtʃ/', sentenceA:'Let\'s go to the beach.', sentenceB:'That word is offensive.'}
        ],
        debates: [
            {id:'d1', topic:'Social media does more harm than good', stance:'Do you agree?', starter:'Social media connects us, but also increases anxiety. What is your opinion?'},
            {id:'d2', topic:'AI will replace teachers', stance:'You defend teachers', starter:'AI can give exercises, but can it motivate a student?'}
        ],
        games: [
            {id:'wordSpark', title:'Word Spark', desc:'Sorteio de palavra. Crie frase e grave áudio.', icon:'🎲', color:'#E0E7FF', level:'B1-B2'},
            {id:'readAloud', title:'Read Aloud Lab', desc:'Leia em voz alta e compare com nativo.', icon:'🎙️', color:'#D1FAE5', level:'A2-C1'},
            {id:'listenType', title:'Listen & Type', desc:'Escreva o que ouviu. Treino de ouvido.', icon:'👂', color:'#FEF3C7', level:'A2-B1'},
            {id:'quiz', title:'Quiz Master', desc:'Quiz contextual com explicação.', icon:'🧩', color:'#FEE2E2', level:'A1-B2'},
            {id:'wordPicker', title:'Word Picker', desc:'Escolha a palavra certa para a lacuna.', icon:'✍️', color:'#E0E7FF', level:'A2-B1'},
            {id:'sentenceShuffle', title:'Sentence Shuffle', desc:'Sorteio de frases. Transforme!', icon:'🔀', color:'#D1FAE5', level:'B1-B2'},
            {id:'answerQuest', title:'Answer Quest', desc:'Responda perguntas abertas com áudio.', icon:'💬', color:'#FEF3C7', level:'B1-C1'},
            {id:'questionMaker', title:'Question Maker', desc:'Receba a resposta, crie a pergunta.', icon:'❓', color:'#F5D0FE', level:'B1-B2'},
            {id:'contextRole', title:'Context Roleplay', desc:'Simule aeroporto, entrevista, restaurante.', icon:'🎭', color:'#CCFBF1', level:'B1-C1'},
            {id:'debateAI', title:'AI Debate Club', desc:'Debata com IA e use conectores.', icon:'🤖', color:'#E0F2FE', level:'B2-C1'},
            {id:'minimalPairs', title:'Minimal Pairs Lab', desc:'ship vs sheep, beach vs bitch.', icon:'👄', color:'#FFEDD5', level:'B1-C1'},
            {id:'picturePop', title:'Picture Pop', desc:'Veja a figura, fale e escreva o nome.', icon:'🖼️', color:'#DCFCE7', level:'A1-B1'}
        ]
    },

    init: () => {
        console.log("🏴‍☠️ Módulo Baú do Inglês Iniciado com 12 Motores!");
        Workspace.Ingles.injetarCSS();
        Workspace.Ingles.construirHTML();
        
        // 🚀 O SEGREDO DO ARRANQUE: Puxa logo a nuvem ao abrir!
        Workspace.Ingles.loadDados().then(() => {
            if (Workspace.usuario && Workspace.usuario.tipo !== 'Aluno') {
                const badge = document.getElementById('ig-pendingCount');
                if(badge) badge.textContent = Workspace.Ingles.state.submissions.filter(s=>s.status==='pending').length;
            }
        });
        
        if('speechSynthesis' in window) window.speechSynthesis.getVoices(); 
    },

    abrirBau: async () => {
        Workspace.navegarPara('ingles');
        // 🚀 HIGIENE INTELIGENTE: Puxa os desafios novos da Nuvem EM TEMPO REAL ao clicar na aba
        await Workspace.Ingles.loadDados();
        Workspace.Ingles.renderizarVisualizacao();
    },

   // ============================================================================
    // 🧠 SISTEMA DE MEMÓRIA E INTEGRAÇÃO MONGODB (ALGORITMO VIVO)
    // ============================================================================
    loadDados: async () => {
        try {
            const escolaId = Workspace.usuario.escolaId || 'DEFAULT';
            // 🚀 Puxa o cérebro global enviando a Escola exata na rota
            const res = await Workspace.api(`/workspace/ingles/dados?escolaId=${escolaId}`, 'GET');
            
            // 🛡️ Prevenção Antimagnética: Confirma que o MongoDB enviou dados válidos
            if (res && res.success && res.dados && res.dados.words) {
                const d = res.dados;
                Workspace.Ingles.state.words = Array.isArray(d.words) ? d.words : Workspace.Ingles.defaults.words;
                Workspace.Ingles.state.phrases = Array.isArray(d.phrases) ? d.phrases : Workspace.Ingles.defaults.phrases;
                Workspace.Ingles.state.quizzes = Array.isArray(d.quizzes) ? d.quizzes : Workspace.Ingles.defaults.quizzes;
                Workspace.Ingles.state.pictures = Array.isArray(d.pictures) ? d.pictures : Workspace.Ingles.defaults.pictures;
                Workspace.Ingles.state.submissions = Array.isArray(d.submissions) ? d.submissions : [];
                Workspace.Ingles.state.pool = Array.isArray(d.pool) ? d.pool : [];
            } else {
                // Semente Básica de Fábrica para escolas virgens
                Workspace.Ingles.state.words = Workspace.Ingles.defaults.words;
                Workspace.Ingles.state.phrases = Workspace.Ingles.defaults.phrases;
                Workspace.Ingles.state.quizzes = Workspace.Ingles.defaults.quizzes;
                Workspace.Ingles.state.pictures = Workspace.Ingles.defaults.pictures;
                Workspace.Ingles.state.submissions = [];
                Workspace.Ingles.state.pool = [];
            }

            const userK = `ws_ingles_user_${Workspace.usuario.id}`;
            Workspace.Ingles.state.xp = parseInt(localStorage.getItem(`${userK}_xp`) || '0');
            Workspace.Ingles.state.streak = parseInt(localStorage.getItem(`${userK}_streak`) || '1');
        } catch (e) {
            console.error("Erro ao conectar ao Algoritmo Coletivo.", e);
        }
    },

    saveDados: async () => {
        // Salva localmente para respostas instantâneas (UX)
        const userK = `ws_ingles_user_${Workspace.usuario.id}`;
        localStorage.setItem(`${userK}_xp`, Workspace.Ingles.state.xp);
        localStorage.setItem(`${userK}_streak`, Workspace.Ingles.state.streak);

        try {
            // 🚀 Envia o XP para a base de dados com Identificação Completa!
            if (Workspace.usuario && Workspace.usuario.tipo === 'Aluno') {
                Workspace.api('/workspace/ingles/xp', 'POST', { 
                    userId: Workspace.usuario.id,
                    escolaId: Workspace.usuario.escolaId || 'DEFAULT',
                    nome: Workspace.usuario.nome || Workspace.usuario.login,
                    xp: Workspace.Ingles.state.xp, 
                    streak: Workspace.Ingles.state.streak 
                }).catch(() => {});
            }

            // 🚀 Envia as Palavras e Envios para a base de dados com Identificação Completa!
            await Workspace.api('/workspace/ingles/dados', 'PUT', {
                escolaId: Workspace.usuario.escolaId || 'DEFAULT',
                words: Workspace.Ingles.state.words,
                phrases: Workspace.Ingles.state.phrases,
                quizzes: Workspace.Ingles.state.quizzes,
                pictures: Workspace.Ingles.state.pictures,
                submissions: Workspace.Ingles.state.submissions,
                pool: Workspace.Ingles.state.pool
            });
        } catch (e) {
            console.log("Sincronização do algoritmo executada em background.");
        }
    },

    // ============================================================================
    // 🗣️ FERRAMENTAS NATIVAS DE IA (Voz e Deteção)
    // ============================================================================
    falar: (text, lang='en-US') => {
        if(!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang; u.rate = 0.9;
        const voices = window.speechSynthesis.getVoices();
        const enVoice = voices.find(v => v.lang.includes('en')) || voices[0];
        if(enVoice) u.voice = enVoice;
        window.speechSynthesis.speak(u);
    },

    similaridade: (a, b) => {
        const norm = (s) => s.toLowerCase().trim().replace(/[^\w\s]/g,'');
        let nA = norm(a), nB = norm(b);
        if(nA === nB) return 1;
        if(nB.includes(nA) || nA.includes(nB)) return 0.9;
        return nA.split(' ').some(w => nB.includes(w)) ? 0.6 : 0;
    },

    setupRecorder: () => {
        const btn = document.getElementById('ig-recBtn');
        const status = document.getElementById('ig-recStatus');
        const audioPrev = document.getElementById('ig-audioPrev');
        if(!btn) return;
        let isRecording = false;

        btn.onclick = async () => {
            if(!isRecording) {
                status.textContent = '🔴 Gravando... clique para parar';
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({audio:true});
                    Workspace.Ingles.streamMicrofone = stream;
                    Workspace.Ingles.mediaRecorder = new MediaRecorder(stream);
                    Workspace.Ingles.audioChunks = [];

                    Workspace.Ingles.mediaRecorder.ondataavailable = e => {
                        if(e.data.size > 0) Workspace.Ingles.audioChunks.push(e.data);
                    };

                    Workspace.Ingles.mediaRecorder.onstop = () => {
                        Workspace.Ingles.audioBlob = new Blob(Workspace.Ingles.audioChunks, {type:'audio/webm'});
                        Workspace.Ingles.currentAudioURL = URL.createObjectURL(Workspace.Ingles.audioBlob);
                        audioPrev.src = Workspace.Ingles.currentAudioURL;
                        audioPrev.style.display = 'block';
                        status.textContent = '✅ Áudio processado! Podes ouvir ou enviar.';
                        Workspace.Ingles.streamMicrofone.getTracks().forEach(t=>t.stop());
                    };

                    Workspace.Ingles.mediaRecorder.start();
                    btn.style.animation = 'pulse 1.2s infinite';
                    btn.textContent = '⏹️';
                    isRecording = true;
                } catch(err) {
                    Workspace.mostrarAviso('O teu navegador bloqueou o microfone. Dá permissão!', 'error');
                }
            } else {
                if(Workspace.Ingles.mediaRecorder && Workspace.Ingles.mediaRecorder.state !== 'inactive') {
                    Workspace.Ingles.mediaRecorder.stop();
                }
                btn.style.animation = 'none';
                btn.textContent = '🎙️';
                isRecording = false;
                status.textContent = 'A processar as frequências sonoras... ⏳';
            }
        };
    },

    // ============================================================================
    // 🎨 RENDERIZAÇÃO DE INTERFACE E HTML
    // ============================================================================
    injetarCSS: () => {
        if(document.getElementById('ws-ingles-css')) return;
        const style = document.createElement('style');
        style.id = 'ws-ingles-css';
        style.innerHTML = `
            #ws-ingles-container { background: #F8FAFC; border-radius: 16px; overflow: hidden; min-height: 80vh; }
            .ig-header { background: #fff; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E2E8F0; }
            .ig-title { display: flex; align-items: center; gap: 15px; }
            .ig-title-icon { font-size: 35px; background: linear-gradient(135deg, #4F46E5, #7C3AED); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .ig-xp-badge { display: flex; gap: 12px; background: #0F172A; color: #fff; padding: 8px 16px; border-radius: 30px; font-size: 13px; font-weight: bold; }
            
            .ig-games-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; padding: 30px; }
            .ig-game-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px; cursor: pointer; transition: 0.3s; position: relative; }
            .ig-game-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(15,23,42,0.1); border-color: #C7D2FE; }
            .ig-top { display: flex; justify-content: space-between; margin-bottom: 15px; }
            .ig-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
            .ig-badge { font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 20px; }
            .ig-badge-level { background: #E0E7FF; color: #4F46E5; }
            .ig-badge-approved { background: #D1FAE5; color: #065F46; }
            .ig-badge-pending { background: #FEF3C7; color: #92400E; }
            .ig-meta { display: flex; gap: 10px; margin-top: 15px; }
            
            .ig-sidebar { width: 250px; background: #fff; border-right: 1px solid #E2E8F0; padding: 20px; display:flex; flex-direction:column; gap:5px; }
            .ig-side-item { background: transparent; border: none; padding: 12px 15px; border-radius: 10px; text-align: left; font-weight: bold; color: #64748B; cursor: pointer; transition: 0.2s; }
            .ig-side-item:hover { background: #F1F5F9; }
            .ig-side-item.active { background: #0F172A; color: #fff; }
            .ig-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
            
            .ig-input, .ig-textarea { width: 100%; padding: 12px 15px; border: 1px solid #E2E8F0; border-radius: 10px; font-family: inherit; font-size: 14px; outline: none; transition: 0.2s; box-sizing: border-box; }
            .ig-input:focus, .ig-textarea:focus { border-color: #4F46E5; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
            .ig-textarea { min-height: 100px; resize: vertical; }
            
            .ig-word-roulette { width: 200px; height: 200px; border-radius: 50%; border: 8px solid #EEF2FF; display: flex; align-items: center; justify-content: center; margin: 0 auto; background: radial-gradient(circle at 30% 30%, #fff, #E0E7FF); }
            .ig-roulette-word { font-size: 26px; font-weight: 800; color: #0F172A; text-align: center; }
            .ig-big-phrase { font-size: 22px; font-weight: bold; text-align: center; padding: 20px; background: #F8FAFC; border: 1px dashed #E2E8F0; border-radius: 14px; margin: 15px 0; color: #1E293B; }
            
            /* Melhorias de Responsividade para Tabelas Internas */
            .ig-list-item { display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee; align-items:center; }
            @media (max-width: 900px) {
                .ig-sidebar { width: 100%; flex-direction: row; overflow-x: auto; padding: 10px; }
                .ig-side-item { white-space: nowrap; }
                #ig-professorView { flex-direction: column; }
            }
        `;
        document.head.appendChild(style);
    },

    construirHTML: () => {
        let container = document.getElementById('ws-ingles-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'ws-ingles-container';
            container.style.display = 'none';
            const painelPrincipal = document.getElementById('ws-main-container');
            if (painelPrincipal && painelPrincipal.parentNode) {
                painelPrincipal.parentNode.appendChild(container);
            }
        }

        container.innerHTML = `
            <div class="ig-header">
                <div class="ig-title">
                    <div class="ig-title-icon">🧰</div>
                    <div>
                        <h2 style="margin:0; font-size:22px; color:#0F172A;">Baú do Inglês</h2>
                        <p style="margin:0; font-size:13px; color:#64748B;">Estude de forma divertida!</p>
                    </div>
                </div>
                <div class="ig-xp-badge">
                    <span>🔥 <b id="ig-streakCount">1</b> dias</span>
                    <span>⭐ <b id="ig-xpCount">0</b> XP</span>
                </div>
            </div>

            <div id="ig-alunoView" style="display:none;">
                <div style="padding: 30px 30px 0 30px;">
                    <h1 style="color:#0F172A; font-size:28px; margin:0 0 10px 0;">O Baú está aberto! 🗝️</h1>
                    <p style="color:#64748B; font-size:15px; max-width:800px; margin:0;">Escolha um tesouro para desbloquear hoje. Tudo que você criar aqui, quando aprovado, vira material de estudo para outros alunos.</p>
                </div>
                <div id="ig-gamesGrid" class="ig-games-grid"></div>
            </div>

            <div id="ig-professorView" style="display:none; min-height: 70vh; display: flex;">
                <div class="ig-sidebar">
                    <button class="ig-side-item active" data-tab="biblioteca" onclick="Workspace.Ingles.renderProfessorTab('biblioteca')">📚 Biblioteca</button>
                    <button class="ig-side-item" data-tab="imagens" onclick="Workspace.Ingles.renderProfessorTab('imagens')">🖼️ Imagens</button>
                    <button class="ig-side-item" data-tab="envios" onclick="Workspace.Ingles.renderProfessorTab('envios')">📥 Envios <span id="ig-pendingCount" style="background:#F59E0B; color:white; padding:2px 6px; border-radius:10px; font-size:11px; margin-left:5px;">0</span></button>
                    <button class="ig-side-item" data-tab="algoritmo" onclick="Workspace.Ingles.renderProfessorTab('algoritmo')">🧠 Algoritmo</button>
                    <button class="ig-side-item" data-tab="ranking" onclick="Workspace.Ingles.renderProfessorTab('ranking')">🏆 Ranking Global</button>
                </div>
                <div id="ig-tab-content" style="flex:1; padding:30px; background:#F8FAFC;"></div>
            </div>

            <div id="ig-gameModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.7); z-index:1000000; align-items:center; justify-content:center; backdrop-filter:blur(5px);">
                <div class="ws-card" style="width:90%; max-width:650px; background:white; border-radius:20px; overflow:hidden; padding:0; display:flex; flex-direction:column; max-height:90vh;">
                    <div style="padding: 20px 25px; border-bottom: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center; background: #F8FAFC;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span id="ig-modalIcon" style="font-size: 24px;"></span>
                            <h2 id="ig-modalTitle" style="margin: 0; color: #0F172A; font-size: 18px;"></h2>
                        </div>
                        <button onclick="Workspace.Ingles.fecharJogo()" style="background:transparent; border:none; font-size:24px; cursor:pointer; color:#64748B;">×</button>
                    </div>
                    <div id="ig-modalBody" style="padding: 30px; overflow-y: auto; flex: 1;"></div>
                </div>
            </div>
        `;
    },

    renderizarVisualizacao: () => {
        document.getElementById('ig-xpCount').textContent = Workspace.Ingles.state.xp;
        document.getElementById('ig-streakCount').textContent = Workspace.Ingles.state.streak;
        
        const isAluno = Workspace.usuario.tipo === 'Aluno';
        
        if (!isAluno) {
            document.getElementById('ig-professorView').style.display = 'flex';
            document.getElementById('ig-alunoView').style.display = 'none';
            document.getElementById('ig-pendingCount').textContent = Workspace.Ingles.state.submissions.filter(s=>s.status==='pending').length;
            Workspace.Ingles.renderProfessorTab('envios'); 
        } else {
            document.getElementById('ig-alunoView').style.display = 'block';
            document.getElementById('ig-professorView').style.display = 'none';
            Workspace.Ingles.renderAlunoGrid();
        }
    },

    renderAlunoGrid: () => {
        const grid = document.getElementById('ig-gamesGrid');
        grid.innerHTML = Workspace.Ingles.defaults.games.map(g => `
            <div class="ig-game-card" onclick="Workspace.Ingles.abrirJogo('${g.id}')">
                <div class="ig-top">
                    <div class="ig-icon" style="background:${g.color}">${g.icon}</div>
                    <span class="ig-badge ig-badge-level">${g.level}</span>
                </div>
                <h3>${g.title}</h3>
                <p>${g.desc}</p>
                <div class="ig-meta">
                    <span class="ig-badge" style="background:#F1F5F9; color: #333;">⭐ +${['picturePop','minimalPairs','debateAI'].includes(g.id) ? '75' : '50'} XP</span>
                    ${['debateAI','minimalPairs','picturePop'].includes(g.id) ? '<span class="ig-badge ig-badge-approved">NOVO</span>' : ''}
                </div>
            </div>
        `).join('');
    },

    // ============================================================================
    // 👨‍🏫 O LABORATÓRIO DO PROFESSOR (Interface Cloud Atualizada)
    // ============================================================================
    renderProfessorTab: (tabId) => {
        document.querySelectorAll('.ig-side-item').forEach(b => b.classList.remove('active'));
        const btn = document.querySelector(`.ig-side-item[data-tab="${tabId}"]`);
        if(btn) btn.classList.add('active');
        
        const content = document.getElementById('ig-tab-content');
        const state = Workspace.Ingles.state;
        
        if (tabId === 'biblioteca') {
            content.innerHTML = `
                <div class="ig-card">
                    <h3>📚 Biblioteca do Algoritmo</h3>
                    <p style="color:#64748B;font-size:13px">Adicione palavras, frases e quizzes. Eles estarão disponíveis nos jogos dos alunos instantaneamente.</p>
                </div>
                <div style="display:flex; gap:20px; flex-wrap:wrap; align-items:flex-start;">
                    <div class="ig-card" style="flex:1; min-width:300px;">
                        <h3>Palavras Raiz (${state.words.length})</h3>
                        <div style="display:flex; gap:10px; margin-bottom:15px;"><input id="nwWord" class="ig-input" placeholder="Inglês (Ex: resilient)"><input id="nwTrans" class="ig-input" placeholder="Tradução"><button class="ws-btn" style="background:#4F46E5; color:white; border:none; padding:10px 15px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="Workspace.Ingles.addWord()">Add</button></div>
                        <div style="max-height: 250px; overflow-y: auto;">${state.words.map(w=>`<div class="ig-list-item"><span><b>${w.word}</b> - ${w.translation}</span><button style="background:transparent; border:none; color:#e74c3c; cursor:pointer; font-weight:bold; font-size:16px;" onclick="Workspace.Ingles.remItem('words','${w.id}')">✕</button></div>`).join('')}</div>
                    </div>
                    <div class="ig-card" style="flex:1; min-width:300px;">
                        <h3>Frases (${state.phrases.length})</h3>
                        <div style="display:flex; gap:10px; margin-bottom:15px;"><textarea id="nwPhrase" class="ig-textarea" style="min-height:45px;" placeholder="Nova frase em inglês..."></textarea><button class="ws-btn" style="background:#4F46E5; color:white; border:none; padding:10px 15px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="Workspace.Ingles.addPhrase()">Add</button></div>
                        <div style="max-height: 250px; overflow-y: auto;">${state.phrases.map(p=>`<div class="ig-list-item"><span>${p.phrase}</span><button style="background:transparent; border:none; color:#e74c3c; cursor:pointer; font-weight:bold; font-size:16px;" onclick="Workspace.Ingles.remItem('phrases','${p.id}')">✕</button></div>`).join('')}</div>
                    </div>
                </div>
                <div class="ig-card" style="margin-top:20px;">
                    <h3>Quizzes (${state.quizzes.length})</h3>
                    <div style="display:flex; gap:10px; margin-bottom:15px; flex-wrap:wrap;">
                        <input id="qQuestion" class="ig-input" style="flex:2; min-width:200px;" placeholder="Pergunta">
                        <input id="qOpt1" class="ig-input" style="flex:1; min-width:100px;" placeholder="Opção 1 (Incorreta)">
                        <input id="qOpt2" class="ig-input" style="flex:1; min-width:100px;" placeholder="Opção 2 (Correta)">
                        <button class="ws-btn" style="background:#4F46E5; color:white; border:none; padding:10px 15px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="Workspace.Ingles.addQuiz()">Add Quiz</button>
                    </div>
                    <div style="max-height: 250px; overflow-y: auto;">${state.quizzes.map(q=>`<div class="ig-list-item"><span><b>${q.question}</b> | Correta: ${q.options[q.correct]}</span><button style="background:transparent; border:none; color:#e74c3c; cursor:pointer; font-weight:bold; font-size:16px;" onclick="Workspace.Ingles.remItem('quizzes','${q.id}')">✕</button></div>`).join('')}</div>
                </div>
            `;
        } 
        else if (tabId === 'imagens') {
            content.innerHTML = `
                <div class="ig-card">
                    <h3>🖼️ Banco de Figuras (Picture Pop)</h3>
                    <p style="color:#64748B;font-size:13px;margin-bottom:15px;">Alimente o jogo de deteção de voz com novas imagens/emojis.</p>
                    <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:15px;">
                        <input id="picWord" class="ig-input" style="flex:2; min-width:150px;" placeholder="Palavra em inglês (Ex: watermelon)">
                        <input id="picTrans" class="ig-input" style="flex:2; min-width:150px;" placeholder="Tradução">
                        <input id="picEmoji" class="ig-input" style="flex:1; min-width:80px;" placeholder="Emoji 🍉">
                        <button class="ws-btn" style="background:#4F46E5; color:white; border:none; padding:10px 15px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="Workspace.Ingles.addPic()">Add Imagem</button>
                    </div>
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:15px;">
                    ${state.pictures.map(p=>`
                        <div class="ig-card" style="width:160px; text-align:center; padding:15px; display:flex; flex-direction:column; align-items:center;">
                            <div style="font-size:48px; margin-bottom:10px;">${p.emoji}</div>
                            <b style="color:#1E293B;">${p.word}</b>
                            <div style="font-size:12px; color:#64748B; margin-bottom:10px;">${p.translation}</div>
                            <button class="ws-btn" style="background:#F1F5F9; color:#EF4444; width:100%; border:none; padding:8px; border-radius:8px; font-weight:bold; font-size:12px; cursor:pointer;" onclick="Workspace.Ingles.remItem('pictures','${p.id}')">Remover</button>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        else if (tabId === 'envios') {
            const pendentes = state.submissions.filter(s=>s.status==='pending');
            if(pendentes.length === 0) {
                content.innerHTML = `<div class="ig-card" style="text-align:center; padding:40px; color:#999;"><div style="font-size:40px; margin-bottom:10px;">☕</div>Nenhum desafio pendente. Os alunos estão calmos hoje!</div>`;
            } else {
                content.innerHTML = `<div class="ig-card" style="border-left: 4px solid #F59E0B;"><h3>📥 Forja do Algoritmo</h3><p style="font-size:13px; color:#666;">Aprove as respostas para alimentar a Piscina Global de estudos.</p></div>` + pendentes.slice().reverse().map(s => `
                    <div class="ig-card">
                        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                            <span class="ig-badge ig-badge-pending" style="background:#FEF3C7; color:#92400E; padding:4px 8px; border-radius:12px; font-size:11px; font-weight:bold;">Aguardando Avaliação</span>
                            <span style="font-size:12px; color:#999;"><b>${s.student}</b> • Desafio: ${s.game}</span>
                        </div>
                        <p style="font-size:15px; color:#2c3e50; background:#f4f6f7; padding:10px; border-radius:8px;">${Workspace.escapeHTML(s.text)}</p>
                        ${s.audioURL ? `<audio controls src="${s.audioURL}" style="width:100%; margin-top:10px; outline:none;"></audio>` : ''}
                        <div style="margin-top:15px; display:flex; gap:10px; flex-wrap:wrap;">
                            <button class="ws-btn" style="background:#10B981; border:none; padding:10px; border-radius:8px; cursor:pointer; color:white; flex:1; font-weight:bold;" onclick="Workspace.Ingles.aprovarEnvio('${s.id}')">✅ Aprovar para a Piscina Global</button>
                            <button class="ws-btn" style="background:#F59E0B; border:none; padding:10px; border-radius:8px; cursor:pointer; color:white; flex:1; font-weight:bold;" onclick="Workspace.Ingles.enviarFeedbackEnvio('${s.id}')">💬 Dar Feedback</button>
                            <button class="ws-btn" style="background:#e74c3c; border:none; padding:10px; border-radius:8px; cursor:pointer; color:white; font-weight:bold;" onclick="Workspace.Ingles.remItem('submissions','${s.id}')">🗑️ Rejeitar</button>
                        </div>
                        ${s.feedback ? `<div style="margin-top:10px;background:#FEF3C7;padding:10px;border-radius:8px;font-size:13px;color:#92400E;"><b>Seu feedback:</b> ${Workspace.escapeHTML(s.feedback)}</div>` : ''}
                    </div>
                `).join('');
            }
        }
        else if (tabId === 'algoritmo') {
            const totalCreated = state.pool.length;
            const totalProfessor = state.words.length + state.phrases.length + state.quizzes.length + state.pictures.length;
            
            content.innerHTML = `
                <div class="ig-card">
                    <h3>🧠 A Inteligência do Seu Baú</h3>
                    <p style="color:#64748B;font-size:14px;line-height:1.5;">O Baú alimenta-se do que os alunos enviam. Cada frase aprovada torna o sistema mais inteligente, criando um ecossistema auto-sustentável.</p>
                    <div style="display:flex; gap:15px; margin-top:20px; flex-wrap:wrap;">
                        <div style="flex:1; background:#EEF2FF; border:1px solid #4F46E5; padding:20px; border-radius:12px; text-align:center; min-width:150px;">
                            <div style="font-size:30px; font-weight:900; color:#4F46E5;">${totalProfessor}</div>
                            <div style="font-size:12px; font-weight:bold; color:#333; text-transform:uppercase;">Sementes do Prof</div>
                        </div>
                        <div style="flex:1; background:#D1FAE5; border:1px solid #10B981; padding:20px; border-radius:12px; text-align:center; min-width:150px;">
                            <div style="font-size:30px; font-weight:900; color:#10B981;">${totalCreated}</div>
                            <div style="font-size:12px; font-weight:bold; color:#333; text-transform:uppercase;">Criado por Alunos</div>
                        </div>
                        <div style="flex:1; background:#F8FAFC; border:1px solid #E2E8F0; padding:20px; border-radius:12px; text-align:center; min-width:150px;">
                            <div style="font-size:30px; font-weight:900; color:#0F172A;">${state.submissions.length}</div>
                            <div style="font-size:12px; font-weight:bold; color:#333; text-transform:uppercase;">Envios Totais</div>
                        </div>
                    </div>
                </div>
                <div class="ig-card" style="margin-top:20px;">
                    <h3>🌍 Piscina Global (Itens Aprovados)</h3>
                    <div style="max-height:300px; overflow-y:auto; border:1px solid #E2E8F0; border-radius:8px; padding:10px;">
                        ${state.pool.length===0 ? '<p style="color:#64748B; text-align:center; padding:20px;">Nenhum item aprovado ainda. Aprove os desafios na aba Envios.</p>' : 
                        state.pool.map(p=>`<div style="padding:10px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; font-size:13px;"><span style="color:#1E293B;"><b>[${p.type}]</b> ${Workspace.escapeHTML(p.text||p.word)}</span><span style="color:#10B981; font-weight:bold; font-size:11px;">Aprovado</span></div>`).join('')}
                    </div>
                </div>
            `;
        }
        else if (tabId === 'ranking') {
            content.innerHTML = `<div style="text-align:center; padding:50px; color:#94a3b8;"><div style="font-size:40px; margin-bottom:15px; animation: pulse 1s infinite;">🏆</div>A carregar o Pódio de Honra da Escola... ⏳</div>`;
            Workspace.api(`/workspace/ingles/ranking?escolaId=${Workspace.usuario.escolaId}`, 'GET').then(res => {
                if (res && res.success) {
                    if (res.ranking.length === 0) {
                        content.innerHTML = `<div class="ig-card" style="text-align:center; padding:50px;"><div style="font-size:50px; margin-bottom:15px;">🏁</div><h3 style="color:#2c3e50;">A corrida ainda não começou!</h3><p style="color:#64748B;">Nenhum aluno conquistou XP no Baú do Inglês até o momento.</p></div>`;
                        return;
                    }
                    let htmlRanking = `<div class="ig-card" style="border-left: 4px solid #F59E0B; background:#FFFBEB;"><h3>🏆 Pódio da Escola (Leaderboard)</h3><p style="color:#92400E; font-size:13px; font-weight:bold;">Acompanhe o ranking em tempo real dos alunos com maior pontuação.</p></div>`;
                    res.ranking.forEach((aluno, index) => {
                        let medalha = `<div style="font-size:16px; font-weight:900; color:#94a3b8; width:40px; text-align:center;">${index + 1}º</div>`;
                        if (index === 0) medalha = `<div style="font-size:30px; width:40px; text-align:center; filter: drop-shadow(0 4px 6px rgba(245,158,11,0.4));">🥇</div>`;
                        if (index === 1) medalha = `<div style="font-size:26px; width:40px; text-align:center;">🥈</div>`;
                        if (index === 2) medalha = `<div style="font-size:22px; width:40px; text-align:center;">🥉</div>`;
                        
                        htmlRanking += `
                            <div style="background:#fff; border:1px solid #E2E8F0; padding:15px 20px; border-radius:16px; margin-bottom:12px; display:flex; align-items:center; justify-content:space-between; box-shadow:0 4px 10px rgba(0,0,0,0.02); transition:0.3s;" onmouseover="this.style.transform='scale(1.02)'; this.style.borderColor='#4F46E5';">
                                <div style="display:flex; align-items:center; gap:20px;">
                                    ${medalha}
                                    <div style="border:2px solid #E2E8F0; border-radius:50%; padding:2px;">
                                        ${window.Workspace.renderizarAvatar(aluno.nome, 45)}
                                    </div>
                                    <strong style="color:#1E293B; font-size:16px;">${aluno.nome}</strong>
                                </div>
                                <div style="display:flex; gap:12px; align-items:center;">
                                    <div style="background:#FEF3C7; color:#B45309; padding:6px 15px; border-radius:30px; font-weight:bold; font-size:12px; border:1px solid #FDE68A;">🔥 ${aluno.streak} Dias</div>
                                    <div style="background:#E0E7FF; color:#4F46E5; padding:6px 15px; border-radius:30px; font-weight:900; font-size:14px; border:1px solid #C7D2FE; box-shadow:0 2px 8px rgba(79,70,229,0.15);">⭐ ${aluno.xp} XP</div>
                                </div>
                            </div>
                        `;
                    });
                    content.innerHTML = htmlRanking;
                } else {
                    content.innerHTML = `<div class="ig-card" style="text-align:center; color:#e74c3c; padding:40px; font-weight:bold;">Erro ao carregar o ranking da base de dados.</div>`;
                }
            });
        }
    },

    // ============================================================================
    // ⚙️ AÇÕES DE INJEÇÃO EM TEMPO REAL NA NUVEM (MongoDB Assíncrono)
    // ============================================================================
    addWord: async () => {
        const w = document.getElementById('nwWord').value.trim();
        const t = document.getElementById('nwTrans').value.trim();
        if(!w) return Workspace.mostrarAviso('Digite a palavra', 'warning');
        Workspace.Ingles.state.words.unshift({id:'w'+Date.now(), word:w, translation:t, level:'B1', example:'', context:'Professor'});
        
        await Workspace.Ingles.saveDados(); // 🚀 Sincroniza com a Nuvem!
        Workspace.Ingles.renderProfessorTab('biblioteca'); 
        Workspace.mostrarAviso('Palavra injetada no algoritmo! Já disponível para os alunos.', 'success');
    },

    addPhrase: async () => {
        const p = document.getElementById('nwPhrase').value.trim();
        if(!p) return Workspace.mostrarAviso('Digite a frase', 'warning');
        Workspace.Ingles.state.phrases.unshift({id:'p'+Date.now(), phrase:p});
        
        await Workspace.Ingles.saveDados(); // 🚀 Sincroniza com a Nuvem!
        Workspace.Ingles.renderProfessorTab('biblioteca'); 
        Workspace.mostrarAviso('Frase injetada no algoritmo!', 'success');
    },

    addQuiz: async () => {
        const q = document.getElementById('qQuestion').value.trim();
        const o1 = document.getElementById('qOpt1').value.trim();
        const o2 = document.getElementById('qOpt2').value.trim();
        if(!q || !o1 || !o2) return Workspace.mostrarAviso('Preencha a pergunta e as opções', 'warning');
        
        Workspace.Ingles.state.quizzes.unshift({id:'q'+Date.now(), question:q, options:[o1, o2], correct:1, explanation:'Parabéns, você acertou!', level:'B1'});
        
        await Workspace.Ingles.saveDados(); // 🚀 Sincroniza com a Nuvem!
        Workspace.Ingles.renderProfessorTab('biblioteca'); 
        Workspace.mostrarAviso('Quiz injetado no algoritmo!', 'success');
    },

    addPic: async () => {
        const w = document.getElementById('picWord').value.trim();
        const tr = document.getElementById('picTrans').value.trim();
        const em = document.getElementById('picEmoji').value.trim() || '🖼️';
        if(!w) return Workspace.mostrarAviso('Digite a palavra', 'warning');
        Workspace.Ingles.state.pictures.unshift({id:'pic'+Date.now(), word:w, translation:tr, emoji:em, category:'Geral'});
        
        await Workspace.Ingles.saveDados(); // 🚀 Sincroniza com a Nuvem!
        Workspace.Ingles.renderProfessorTab('imagens'); 
        Workspace.mostrarAviso('Imagem injetada no algoritmo!', 'success');
    },

    remItem: async (key, id) => {
        Workspace.Ingles.state[key] = Workspace.Ingles.state[key].filter(i => i.id !== id);
        
        await Workspace.Ingles.saveDados(); // 🚀 Sincroniza com a Nuvem!
        const activeTab = document.querySelector('.ig-side-item.active');
        if(activeTab) Workspace.Ingles.renderProfessorTab(activeTab.dataset.tab);
    },

    aprovarEnvio: async (id) => {
        const s = Workspace.Ingles.state.submissions.find(x => x.id === id);
        if(!s) return;
        s.status = 'approved';
        
        // Injeta na piscina global
        Workspace.Ingles.state.pool.unshift({
            id: 'pool_'+Date.now(), type: s.game, text: s.text, word: s.text, origin: 'student', student: s.student, timestamp: Date.now()
        });
        
        if(s.game === 'picturePop' && s.text) {
            Workspace.Ingles.state.pictures.push({id:'pic'+Date.now(), word:s.text, translation:'(criado por aluno)', emoji:'✨', category:'Aluno'});
        }
        
        await Workspace.Ingles.saveDados(); // 🚀 Sincroniza com a Nuvem!
        Workspace.Ingles.renderProfessorTab('envios'); 
        Workspace.mostrarAviso('Aprovado! Material injetado na Piscina Global 🌍', 'success');
        
        const badge = document.getElementById('ig-pendingCount');
        if(badge) badge.textContent = Workspace.Ingles.state.submissions.filter(sub=>sub.status==='pending').length;
    },

    enviarFeedbackEnvio: async (id) => {
        const fb = prompt('Digite o feedback ou correção para o aluno:');
        if(fb === null || fb.trim() === '') return;
        const s = Workspace.Ingles.state.submissions.find(x => x.id === id);
        if(!s) return;
        s.feedback = fb;
        
        await Workspace.Ingles.saveDados(); // 🚀 Sincroniza com a Nuvem!
        Workspace.Ingles.renderProfessorTab('envios');
        Workspace.mostrarAviso('Feedback anexado com sucesso!', 'success');
    },

    // ============================================================================
    // 🎮 OS 12 MOTORES DOS JOGOS (Totalmente Integrados no Workspace)
    // ============================================================================
    abrirJogo: (id) => {
        const game = Workspace.Ingles.defaults.games.find(g => g.id === id);
        if(!game) return;
        
        document.getElementById('ig-modalIcon').textContent = game.icon;
        document.getElementById('ig-modalTitle').textContent = game.title;
        document.getElementById('ig-gameModal').style.display = 'flex';
        
        Workspace.Ingles.currentAudioURL = null;
        
        if(id === 'wordSpark') Workspace.Ingles.renderGameWordSpark();
        else if(id === 'readAloud') Workspace.Ingles.renderGameReadAloud();
        else if(id === 'listenType') Workspace.Ingles.renderGameListenType();
        else if(id === 'quiz') Workspace.Ingles.renderGameQuiz();
        else if(id === 'wordPicker') Workspace.Ingles.renderGameWordPicker();
        else if(id === 'sentenceShuffle') Workspace.Ingles.renderGameSentenceShuffle();
        else if(id === 'answerQuest') Workspace.Ingles.renderGameAnswerQuest();
        else if(id === 'questionMaker') Workspace.Ingles.renderGameQuestionMaker();
        else if(id === 'contextRole') Workspace.Ingles.renderGameContextRole();
        else if(id === 'debateAI') Workspace.Ingles.renderGameDebateAI();
        else if(id === 'minimalPairs') Workspace.Ingles.renderGameMinimalPairs();
        else if(id === 'picturePop') Workspace.Ingles.renderGamePicturePop();
    },

    fecharJogo: () => {
        document.getElementById('ig-gameModal').style.display = 'none';
        if(Workspace.Ingles.mediaRecorder && Workspace.Ingles.mediaRecorder.state === 'recording') Workspace.Ingles.mediaRecorder.stop();
        if(Workspace.Ingles.recognition) Workspace.Ingles.recognition.stop();
    },

    envioGenerico: async (gameId, texto, bonus = 50) => {
        if(!texto || texto.trim().length < 2) return Workspace.mostrarAviso("Responda ao desafio de forma válida!", "warning");
        
        Workspace.Ingles.state.submissions.unshift({
            id: 'sub_' + Date.now(), student: Workspace.usuario.nome, game: gameId, text: texto, audioURL: Workspace.Ingles.currentAudioURL || '', status: 'pending', timestamp: Date.now()
        });
        Workspace.Ingles.state.xp += bonus;
        
        await Workspace.Ingles.saveDados(); // 🚀 Sincroniza com a Nuvem a submissão e o XP!
        Workspace.mostrarAviso(`Desafio Concluído! +${bonus} XP ⭐`, "success");
        Workspace.Ingles.fecharJogo();
        Workspace.Ingles.renderizarVisualizacao();
    },

    // 🎲 1. WORD SPARK (Criar Frase com Áudio)
    renderGameWordSpark: () => {
        const allWords = [...Workspace.Ingles.state.words, ...Workspace.Ingles.state.pool.filter(p=>p.word).map(p=>({word:p.word, translation:'(Enviado por um aluno)', example:''}))];
        const w = allWords[Math.floor(Math.random()*allWords.length)] || Workspace.Ingles.defaults.words[0];
        document.getElementById('ig-modalBody').innerHTML = `
            <div class="ig-word-roulette"><div class="ig-roulette-word">${w.word}</div></div>
            <p style="text-align:center;margin:12px 0;color:#64748B;font-weight:bold;">${w.translation} <br><span style="font-weight:normal;">${w.example||''}</span></p>
            <div class="ig-big-phrase">Missão: Crie uma frase nova usando a palavra <b>${w.word}</b></div>
            <textarea id="ig-input" class="ig-textarea" placeholder="Type your sentence here..."></textarea>
            
            <div style="text-align: center; margin-top: 20px;">
                <p style="font-size:12px; color:#666; font-weight:bold;">Para ganhar +XP, grave um áudio lendo a sua frase:</p>
                <button id="ig-recBtn" style="font-size: 30px; border-radius: 50%; width: 60px; height: 60px; border: none; cursor: pointer; box-shadow: 0 5px 15px rgba(0,0,0,0.2);">🎙️</button>
                <div id="ig-recStatus" style="font-size:12px; color:#666; margin-top:5px;"></div>
                <audio id="ig-audioPrev" controls style="display:none; width:100%; margin-top:10px; outline:none;"></audio>
            </div>

            <div style="display:flex; gap:10px; margin-top:20px;">
                <button class="ws-btn" style="flex:1; background:#95a5a6; color:white; border:none; padding:12px; border-radius:8px; cursor:pointer;" onclick="Workspace.Ingles.abrirJogo('wordSpark')">🎲 Sortear Outra</button>
                <button class="ws-btn" style="flex:2; background:#4F46E5; color:white; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:bold;" onclick="
                    const txt = document.getElementById('ig-input').value;
                    if(!txt.toLowerCase().includes('${w.word.toLowerCase()}')) return Workspace.mostrarAviso('A frase tem de conter a palavra sorteada!', 'warning');
                    Workspace.Ingles.envioGenerico('wordSpark', txt);
                ">Enviar para o Professor 🚀</button>
            </div>
        `;
        Workspace.Ingles.setupRecorder();
    },

    // 🎙️ 2. READ ALOUD (Ler e Comparar)
    renderGameReadAloud: () => {
        const allPhrases = [...Workspace.Ingles.state.phrases, ...Workspace.Ingles.state.pool.filter(p=>p.text && p.type==='readAloud').map(p=>({phrase:p.text}))];
        const p = allPhrases[Math.floor(Math.random()*allPhrases.length)] || Workspace.Ingles.defaults.phrases[0];
        const phraseText = p.phrase || p.text;
        document.getElementById('ig-modalBody').innerHTML = `
            <div class="ig-big-phrase">${phraseText}</div>
            <div style="text-align:center; margin:15px 0;">
                <button class="ws-btn" style="background:#0F172A; color:white; border-radius:30px; border:none; padding:10px 20px; cursor:pointer;" onclick="Workspace.Ingles.falar('${phraseText.replace(/'/g,"\\'")}')">🔊 Ouvir a Pronúncia do Professor (IA)</button>
            </div>
            <div style="text-align: center; margin-top: 20px; background:#F8FAFC; padding:20px; border-radius:12px; border:1px solid #E2E8F0;">
                <p style="font-size:13px; color:#333; font-weight:bold;">Sua vez de brilhar. Grave você lendo:</p>
                <button id="ig-recBtn" style="font-size: 30px; border-radius: 50%; width: 60px; height: 60px; border: none; cursor: pointer; box-shadow: 0 5px 15px rgba(0,0,0,0.2); background:white;">🎙️</button>
                <div id="ig-recStatus" style="font-size:12px; color:#666; margin-top:5px;"></div>
                <audio id="ig-audioPrev" controls style="display:none; width:100%; margin-top:10px; outline:none;"></audio>
            </div>
            <button class="ws-btn" style="width:100%; margin-top:15px; background:#10B981; color:white; font-size:16px; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:bold;" onclick="Workspace.Ingles.envioGenerico('readAloud', '${phraseText.replace(/'/g,"\\'")}')">Enviar Áudio 📤</button>
        `;
        Workspace.Ingles.setupRecorder();
    },

    // 👂 3. LISTEN & TYPE
    renderGameListenType: () => {
        const p = Workspace.Ingles.state.phrases[Math.floor(Math.random()*Workspace.Ingles.state.phrases.length)] || Workspace.Ingles.defaults.phrases[0];
        document.getElementById('ig-modalBody').innerHTML = `
            <div style="text-align:center;padding:20px">
                <div style="font-size:60px; margin-bottom:10px;">👂</div>
                <h3 style="margin-bottom:5px; color:#0F172A;">Escute e digite o que ouviu</h3>
                <p style="color:#64748B;font-size:13px; margin-bottom:20px;">Afine os seus ouvidos. Pode ouvir as vezes que quiser.</p>
                <button class="ws-btn" style="background:#4F46E5; color:white; border-radius:30px; padding:10px 30px; font-size:16px; margin-bottom:25px; box-shadow:0 10px 20px rgba(79,70,229,0.3); border:none; cursor:pointer;" onclick="Workspace.Ingles.falar('${p.phrase.replace(/'/g,"\\'")}')">🔊 Tocar Áudio</button>
                
                <input id="ig-listenInput" class="ig-input" placeholder="Digite exatamente o que ouviu..." style="font-size:16px; font-weight:bold; text-align:center;">
                <div id="ig-feedback" style="margin-top:15px;"></div>
                
                <button class="ws-btn" style="width:100%; background:#10B981; color:white; margin-top:15px; font-size:16px; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:bold;" onclick="
                    const digitado = document.getElementById('ig-listenInput').value;
                    const sim = Workspace.Ingles.similaridade(digitado, '${p.phrase.replace(/'/g,"\\'")}');
                    const fb = document.getElementById('ig-feedback');
                    if(sim >= 0.9) {
                        fb.innerHTML = '<div style=\\'background:#D1FAE5; color:#065F46; padding:10px; border-radius:8px; font-weight:bold;\\'>✅ Perfeito! Escuta apurada!</div>';
                        setTimeout(() => Workspace.Ingles.envioGenerico('listenType', digitado), 1500);
                    } else if (sim >= 0.5) {
                        fb.innerHTML = '<div style=\\'background:#FEF3C7; color:#92400E; padding:10px; border-radius:8px; font-weight:bold;\\'>⚠️ Estás quase! Faltam pequenos detalhes. Ouve outra vez.</div>';
                    } else {
                        fb.innerHTML = '<div style=\\'background:#FEE2E2; color:#B91C1C; padding:10px; border-radius:8px; font-weight:bold;\\'>❌ Não foi isso. Ouve com atenção.</div>';
                    }
                ">Verificar Escrita</button>
            </div>
        `;
    },

    // 🧩 4. QUIZ MASTER
    renderGameQuiz: () => {
        const q = Workspace.Ingles.state.quizzes[Math.floor(Math.random()*Workspace.Ingles.state.quizzes.length)] || Workspace.Ingles.defaults.quizzes[0];
        document.getElementById('ig-modalBody').innerHTML = `
            <div class="ig-big-phrase" style="font-size:18px">${q.question}</div>
            <div style="display:flex;flex-direction:column;gap:12px;margin-top:20px" id="ig-quizOptions">
                ${q.options.map((o,i)=>`<button class="ws-btn" style="background:white; color:#0F172A; border:2px solid #E2E8F0; text-align:left; justify-content:flex-start; padding:15px; font-size:14px; font-weight:600; border-radius:8px; cursor:pointer;" onclick="
                    document.querySelectorAll('#ig-quizOptions button').forEach(b => b.disabled = true);
                    const isCorrect = ${i} === ${q.correct};
                    this.style.background = isCorrect ? '#D1FAE5' : '#FEE2E2';
                    this.style.borderColor = isCorrect ? '#10B981' : '#EF4444';
                    
                    const fb = document.getElementById('ig-quizFb');
                    fb.innerHTML = '<div style=\\'background:'+(isCorrect?'#D1FAE5':'#FEE2E2')+'; color:'+(isCorrect?'#065F46':'#B91C1C')+'; padding:15px; border-radius:10px; font-weight:bold; margin-top:15px;\\'>'+(isCorrect?'✅':'❌')+' ${q.explanation.replace(/'/g,"\\'")}</div>';
                    
                    if(isCorrect) {
                        Workspace.Ingles.state.xp += 30; 
                        Workspace.Ingles.saveDados(); // Sincroniza XP na Nuvem
                        Workspace.Ingles.renderizarVisualizacao();
                        setTimeout(() => Workspace.Ingles.fecharJogo(), 2500);
                    }
                ">${o}</button>`).join('')}
            </div>
            <div id="ig-quizFb"></div>
        `;
    },

    // ✍️ 5. WORD PICKER
    renderGameWordPicker: () => {
        const sentences = [
            {text:'I have _____ my keys. Have you seen them?', options:['lost','lose','loosed'], correct:0},
            {text:'She is _____ than her sister.', options:['tall','taller','tallest'], correct:1},
            {text:'We _____ to the beach yesterday.', options:['go','went','gone'], correct:1}
        ];
        const s = sentences[Math.floor(Math.random()*sentences.length)];
        document.getElementById('ig-modalBody').innerHTML = `
            <div class="ig-big-phrase" style="font-size:22px; color:#4F46E5;">${s.text}</div>
            <div style="display:flex; gap:10px; justify-content:center; margin-top:20px; flex-wrap:wrap;" id="ig-pickerOptions">
                ${s.options.map((o,i)=>`<button class="ws-btn" style="background:white; color:#0F172A; border:2px solid #E2E8F0; padding:12px 25px; font-size:16px; font-weight:bold; border-radius:30px; cursor:pointer;" onclick="
                    const isCorrect = ${i} === ${s.correct};
                    const fb = document.getElementById('ig-pickerFb');
                    if(isCorrect) {
                        this.style.background = '#D1FAE5'; this.style.borderColor = '#10B981';
                        fb.innerHTML = '<div style=\\'background:#D1FAE5; color:#065F46; padding:12px; border-radius:10px; font-weight:bold; text-align:center;\\'>✅ Excelente! A gramática está em dia.</div>';
                        Workspace.Ingles.state.xp += 20; 
                        Workspace.Ingles.saveDados(); // Sincroniza XP na Nuvem
                        Workspace.Ingles.renderizarVisualizacao();
                        setTimeout(() => Workspace.Ingles.renderGameWordPicker(), 1500);
                    } else {
                        this.style.background = '#FEE2E2'; this.style.borderColor = '#EF4444';
                        fb.innerHTML = '<div style=\\'background:#FEE2E2; color:#B91C1C; padding:12px; border-radius:10px; font-weight:bold; text-align:center;\\'>❌ Não é bem essa. Pensa na regra temporal!</div>';
                    }
                ">${o}</button>`).join('')}
            </div>
            <div id="ig-pickerFb" style="margin-top:20px"></div>
        `;
    },

    // 🔀 6. SENTENCE SHUFFLE
    renderGameSentenceShuffle: () => {
        const tasks = ['Transforme numa Pergunta (Question)','Transforme numa Negativa (Negative)','Passe para o Passado (Past Tense)'];
        const task = tasks[Math.floor(Math.random()*tasks.length)];
        const phrase = Workspace.Ingles.defaults.phrases[Math.floor(Math.random()*Workspace.Ingles.defaults.phrases.length)];
        document.getElementById('ig-modalBody').innerHTML = `
            <div style="text-align:center"><span class="ig-badge" style="background:#0F172A; color:white; font-size:13px; padding:6px 15px;">🎯 Missão: ${task}</span></div>
            <div class="ig-big-phrase" style="margin-top:15px; font-size:18px;">${phrase.phrase}</div>
            <textarea id="ig-input" class="ig-textarea" placeholder="A sua transformação inteligente aqui..."></textarea>
            <button class="ws-btn" style="width:100%; background:#4F46E5; color:white; margin-top:15px; font-size:15px; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="Workspace.Ingles.envioGenerico('sentenceShuffle', document.getElementById('ig-input').value)">Submeter Transformação 🔀</button>
        `;
    },

    // 💬 7. ANSWER QUEST
    renderGameAnswerQuest: () => {
        const questions = ['What did you do last weekend?', 'Describe your dream house.', 'If you could live anywhere, where would you live?'];
        const q = questions[Math.floor(Math.random()*questions.length)];
        document.getElementById('ig-modalBody').innerHTML = `
            <div class="ig-big-phrase" style="background:#FEF3C7; border-color:#F59E0B; color:#92400E;">❓ ${q}</div>
            <textarea id="ig-input" class="ig-textarea" placeholder="Responda em inglês com o máximo de detalhes possível..."></textarea>
            <div style="text-align:center; margin-top:15px;">
                <p style="font-size:11px; color:#64748B;">Se a sua resposta for boa, o professor aprovará para alimentar o "Question Maker" dos colegas!</p>
                <button id="ig-recBtn" style="font-size: 25px; border-radius: 50%; width: 50px; height: 50px; border: none; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.1); background:white;">🎙️</button>
                <div id="ig-recStatus" style="font-size:11px; color:#999; margin-top:5px;">Gravar voz (opcional)</div>
                <audio id="ig-audioPrev" controls style="display:none; width:100%; outline:none; margin-top:5px;"></audio>
            </div>
            <button class="ws-btn" style="width:100%; margin-top:15px; background:#F59E0B; color:white; font-size:16px; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="Workspace.Ingles.envioGenerico('answerQuest', document.getElementById('ig-input').value)">Enviar Resposta Mestra 🚀</button>
        `;
        Workspace.Ingles.setupRecorder();
    },

    // ❓ 8. QUESTION MAKER
    renderGameQuestionMaker: () => {
        const poolAnswers = Workspace.Ingles.state.pool.filter(p=>p.type==='answerQuest').map(p=>p.text);
        const a = poolAnswers.length > 0 ? poolAnswers[0] : 'I go to the gym because I want to be healthy.';
        document.getElementById('ig-modalBody').innerHTML = `
            <p style="color:#64748B;font-size:13px;text-align:center; font-weight:bold; text-transform:uppercase;">Um aluno respondeu isto:</p>
            <div class="ig-big-phrase" style="background:#EEF2FF; color:#4F46E5; font-style:italic;">💬 "${a}"</div>
            <p style="margin-top:16px;font-weight:600; text-align:center;">Que pergunta em inglês gerou esta resposta?</p>
            <textarea id="ig-input" class="ig-textarea" placeholder="Ex: Why do you... / Where did you..."></textarea>
            <button class="ws-btn" style="width:100%; background:#4F46E5; color:white; margin-top:15px; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="
                const v = document.getElementById('ig-input').value.trim();
                if(v.includes('?') && v.split(' ').length >= 3) {
                    Workspace.Ingles.envioGenerico('questionMaker', v);
                } else {
                    Workspace.mostrarAviso('Atenção: A tua pergunta tem de conter um Ponto de Interrogação (?) e pelo menos 3 palavras!', 'error');
                }
            ">Verificar e Enviar Lógica ❓</button>
        `;
    },

    // 🎭 9. CONTEXT ROLEPLAY
    renderGameContextRole: () => {
        const contexts = [
            {title:'✈️ No Aeroporto', prompt:'You are at check-in. The attendant says: "Can I see your passport and ticket?" Answer.', tip:'Use: Here you are / Sure...'},
            {title:'🍽️ No Restaurante', prompt:'Waiter: "Are you ready to order?"', tip:'Use: I would like... / Could I have...'}
        ];
        const c = contexts[Math.floor(Math.random()*contexts.length)];
        document.getElementById('ig-modalBody').innerHTML = `
            <div class="ig-big-phrase" style="font-size:18px; text-align:left;">${c.title}<br><br><span style="font-size:15px;font-weight:400;color:#64748B">${c.prompt}</span></div>
            <p style="font-size:13px;background:#FEF3C7; color:#92400E; padding:10px; border-radius:8px; font-weight:bold;">💡 Dica de Mestre: ${c.tip}</p>
            <textarea id="ig-input" class="ig-textarea" placeholder="Imagina que estás na situação real. O que dizes?..." style="margin-top:12px;"></textarea>
            <button class="ws-btn" style="width:100%; margin-top:15px; background:#10B981; color:white; font-size:16px; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="Workspace.Ingles.envioGenerico('contextRole', document.getElementById('ig-input').value, 60)">Assumir Papel (Roleplay) 🎭</button>
        `;
    },

    // 🤖 10. DEBATE AI
    renderGameDebateAI: () => {
        const topic = Workspace.Ingles.defaults.debates[0];
        document.getElementById('ig-modalBody').innerHTML = `
            <div class="ig-big-phrase" style="font-size:18px">🤖 Clube de Debate (Inteligência Artificial)<br><br><span style="font-size:16px;color:#4F46E5; font-weight:900;">${topic.topic}</span></div>
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:15px; margin-top:12px; border-left: 4px solid #4F46E5;">
                <b style="font-size:13px; color:#4F46E5;">🤖 AI Agent diz:</b> <span style="font-size:14px; font-weight:600;">${topic.starter}</span>
                <button class="ws-btn" style="padding:4px 8px;margin-left:8px; background:white; color:#0F172A; border:1px solid #ddd; border-radius:6px; cursor:pointer;" onclick="Workspace.Ingles.falar('${topic.starter.replace(/'/g,"\\'")}')">🔊 Ouvir</button>
            </div>
            <div id="ig-debateHistory" style="margin-top:15px;display:flex;flex-direction:column;gap:10px;max-height:200px;overflow-y:auto; padding-right:5px;"></div>
            
            <textarea id="ig-input" class="ig-textarea" placeholder="Defende a tua posição usando conectores ingleses (In my opinion, However, Therefore...)" style="margin-top:15px; border-color:#4F46E5;"></textarea>
            
            <button class="ws-btn" style="width:100%; background:#0F172A; color:white; margin-top:15px; font-size:16px; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="
                const v = document.getElementById('ig-input').value;
                if(v.trim().split(' ').length < 8) return Workspace.mostrarAviso('O teu argumento é muito curto. Desenvolve a ideia! (Mín. 8 palavras)', 'error');
                
                const history = document.getElementById('ig-debateHistory');
                history.innerHTML += '<div style=\\'background:#E0E7FF; padding:12px; border-radius:10px; font-size:13px; border-bottom-right-radius:0; align-self:flex-end; max-width:85%;\\'><b>Tu:</b> '+Workspace.escapeHTML(v)+'</div>';
                
                // IA Responde
                setTimeout(() => {
                    const aiCounters = ['Interesting point, but have you considered the opposite side?', 'That is true, however data shows otherwise. What do you think?', 'Good argument! Moreover, how would you solve this problem?'];
                    const counter = aiCounters[Math.floor(Math.random()*aiCounters.length)];
                    history.innerHTML += '<div style=\\'background:#F1F5F9; padding:12px; border-radius:10px; font-size:13px; border-bottom-left-radius:0; align-self:flex-start; max-width:85%;\\'><b>🤖 AI:</b> '+counter+'</div>';
                    history.scrollTop = history.scrollHeight;
                    Workspace.Ingles.falar(counter);
                    Workspace.Ingles.envioGenerico('debateAI', v + ' | AI reply: ' + counter, 75);
                }, 1000);
            ">Contra-Atacar 🧠</button>
        `;
    },

    // 👄 11. MINIMAL PAIRS
    renderGameMinimalPairs: () => {
        const pair = Workspace.Ingles.defaults.minimalPairs[Math.floor(Math.random()*Workspace.Ingles.defaults.minimalPairs.length)];
        const target = Math.random() > 0.5 ? pair.a : pair.b;
        document.getElementById('ig-modalBody').innerHTML = `
            <div style="text-align:center">
                <h3 style="font-size:22px; color:#0F172A;">👄 Laboratório Fonético</h3>
                <p style="color:#64748B;font-size:13px; margin-bottom:20px;">Estes sons são quase iguais. Ouve com atenção e descobre o alvo!</p>
                <div style="display:flex;gap:15px;justify-content:center;margin-bottom:20px">
                    <div style="background:#fff;border:2px solid #E2E8F0;border-radius:16px;padding:20px;flex:1;box-shadow:0 4px 10px rgba(0,0,0,0.05);"><div style="font-size:30px;font-weight:900;color:#2c3e50;">${pair.a}</div><div style="font-size:12px;color:#64748B;margin-bottom:10px;">${pair.ipaA}</div><button class="ws-btn" style="background:#F8FAFC; color:#333; border:1px solid #ddd; width:100%; padding:8px; border-radius:6px; cursor:pointer; font-weight:bold;" onclick="Workspace.Ingles.falar('${pair.a}')">🔊 Ouvir</button></div>
                    <div style="background:#fff;border:2px solid #E2E8F0;border-radius:16px;padding:20px;flex:1;box-shadow:0 4px 10px rgba(0,0,0,0.05);"><div style="font-size:30px;font-weight:900;color:#2c3e50;">${pair.b}</div><div style="font-size:12px;color:#64748B;margin-bottom:10px;">${pair.ipaB}</div><button class="ws-btn" style="background:#F8FAFC; color:#333; border:1px solid #ddd; width:100%; padding:8px; border-radius:6px; cursor:pointer; font-weight:bold;" onclick="Workspace.Ingles.falar('${pair.b}')">🔊 Ouvir</button></div>
                </div>
                
                <div style="background:#0F172A; padding:20px; border-radius:16px; margin-bottom:20px;">
                    <button class="ws-btn" style="background:#4F46E5; color:white; font-size:16px; padding:12px 30px; border-radius:30px; border:2px solid white; box-shadow:0 0 15px rgba(79,70,229,0.5); cursor:pointer; font-weight:bold;" onclick="Workspace.Ingles.falar('${target}')">🎧 Tocar a Palavra Misteriosa</button>
                    <p style="color:white; font-size:14px; margin-top:15px; font-weight:bold;">Qual palavra foi lida pela máquina?</p>
                    <div style="display:flex; gap:10px; justify-content:center; margin-top:10px;">
                        <button class="ws-btn" style="background:white; color:#0F172A; font-weight:bold; font-size:16px; padding:10px 25px; border-radius:8px; cursor:pointer; border:none;" onclick="Workspace.Ingles.verificarMinimal('${pair.a}', '${target}')">${pair.a}</button>
                        <button class="ws-btn" style="background:white; color:#0F172A; font-weight:bold; font-size:16px; padding:10px 25px; border-radius:8px; cursor:pointer; border:none;" onclick="Workspace.Ingles.verificarMinimal('${pair.b}', '${target}')">${pair.b}</button>
                    </div>
                </div>
                <div id="ig-minimalFb"></div>
            </div>
        `;
    },

    verificarMinimal: (escolha, alvo) => {
        const fb = document.getElementById('ig-minimalFb');
        if (escolha === alvo) {
            fb.innerHTML = '<div style="background:#D1FAE5; color:#065F46; padding:15px; border-radius:10px; font-weight:bold; font-size:15px;">✅ Ouvido Absoluto! Acertaste!</div>';
            setTimeout(() => Workspace.Ingles.envioGenerico('minimalPairs', 'Acertou o par fonético: ' + alvo, 75), 1500);
        } else {
            fb.innerHTML = '<div style="background:#FEE2E2; color:#B91C1C; padding:15px; border-radius:10px; font-weight:bold; font-size:15px;">❌ Armadilha sónica. A resposta era a outra palavra! Tenta outra vez.</div>';
        }
    },

    // 🖼️ 12. PICTURE POP (Deteção Vocal Nativa)
    renderGamePicturePop: () => {
        const pic = Workspace.Ingles.state.pictures[Math.floor(Math.random()*Workspace.Ingles.state.pictures.length)] || Workspace.Ingles.defaults.pictures[0];
        document.getElementById('ig-modalBody').innerHTML = `
            <div style="text-align:center">
                <h3 style="font-size:22px; color:#0F172A; font-weight:900;">🖼️ Picture Pop</h3>
                <div style="width:150px; height:150px; border-radius:24px; background:#F8FAFC; border:2px solid #E2E8F0; display:flex; align-items:center; justify-content:center; margin:20px auto; box-shadow:0 10px 30px rgba(0,0,0,0.05); font-size:80px; transition:0.3s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                    ${pic.emoji}
                </div>
                <p style="color:#64748B;font-size:14px; font-weight:bold;">Categoria: <span style="color:#4F46E5;">${pic.category || 'Geral'}</span></p>
                <div style="margin-top:25px; background:#0F172A; padding:20px; border-radius:16px;">
                    <p style="color:white; font-size:14px; font-weight:bold; margin-bottom:15px;">Como se chama isto em inglês?</p>
                    <button id="ig-btnVoz" class="ws-btn" style="background:#10B981; color:white; font-size:16px; width:100%; border-radius:30px; padding:12px; box-shadow:0 0 15px rgba(16,185,129,0.4); border:none; font-weight:bold; cursor:pointer;" onclick="Workspace.Ingles.ouvirPicturePop('${pic.word}')">🎤 Falar o Nome ao Microfone</button>
                    
                    <div id="ig-speechResult" style="margin-top:15px;"></div>
                    
                    <div style="margin-top:15px; border-top:1px solid rgba(255,255,255,0.1); padding-top:15px;">
                        <input id="ig-input" class="ig-input" placeholder="Ou se fores tímido(a), digita aqui..." style="text-align:center; font-weight:bold;">
                        <button class="ws-btn" style="width:100%; background:white; color:#0F172A; margin-top:10px; font-weight:bold; border:none; padding:10px; border-radius:8px; cursor:pointer;" onclick="
                            const sim = Workspace.Ingles.similaridade(document.getElementById('ig-input').value, '${pic.word}');
                            if(sim >= 0.9) Workspace.Ingles.envioGenerico('picturePop', '${pic.word}', 75);
                            else Workspace.mostrarAviso('Escrita incorreta. Tenta novamente!', 'error');
                        ">Verificar Escrita</button>
                    </div>
                </div>
            </div>
        `;
    },

    ouvirPicturePop: (esperado) => {
        const btn = document.getElementById('ig-btnVoz');
        const resEl = document.getElementById('ig-speechResult');
        
        if(!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)){
            Workspace.mostrarAviso('Navegador sem suporte a deteção de voz. Usa a opção de escrever!', 'warning');
            return;
        }

        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        Workspace.Ingles.recognition = new SR();
        Workspace.Ingles.recognition.lang = 'en-US';
        Workspace.Ingles.recognition.interimResults = false;
        Workspace.Ingles.recognition.maxAlternatives = 1;
        
        btn.innerText = "🎧 A Ouvir as Tuas Cordas Vocais...";
        btn.style.background = "#F59E0B";
        btn.style.animation = "pulse 1s infinite";
        
        Workspace.Ingles.recognition.start();

        Workspace.Ingles.recognition.onresult = (e) => {
            const falado = e.results[0][0].transcript;
            btn.style.animation = "none";
            btn.style.background = "#10B981";
            btn.innerText = `Tu disseste: "${falado}"`;
            
            const sim = Workspace.Ingles.similaridade(falado, esperado);
            if(sim >= 0.8) {
                resEl.innerHTML = `<div style="background:#D1FAE5; color:#065F46; padding:10px; border-radius:8px; font-weight:bold;">✅ Pronúncia Perfeita!</div>`;
                setTimeout(() => Workspace.Ingles.envioGenerico('picturePop', esperado, 75), 1500);
            } else {
                resEl.innerHTML = `<div style="background:#FEE2E2; color:#B91C1C; padding:10px; border-radius:8px; font-weight:bold;">❌ Quase! Pareceu "${falado}". Ouve o robô: <span style="cursor:pointer;" onclick="Workspace.Ingles.falar('${esperado}')">🔊</span></div>`;
            }
        };

        Workspace.Ingles.recognition.onerror = () => {
            btn.style.animation = "none";
            btn.style.background = "#10B981";
            btn.innerText = "🎤 Falar o Nome ao Microfone";
            Workspace.mostrarAviso("Não consegui ouvir bem. Tenta de novo ou escreve abaixo.", "error");
        };
    }
};