// js/modulos/workspace/ingles.js
window.Workspace = window.Workspace || {};

Workspace.Ingles = {
    state: {
        xp: 0, streak: 1, words: [], phrases: [], quizzes: [], pictures: [], minimalPairs: [], debates: [], submissions: [], pool: [],
        errosRetidos: [], 
        itensConcluidos: [],
        magoPhrases: [] // 🧙‍♂️ NOVO: Memória de falas do Mago
    },
    mediaRecorder: null, audioChunks: [], currentAudioURL: null, audioBlob: null, streamMicrofone: null, recognition: null,
    
    // 🚀 VARIÁVEIS DE GAMIFICAÇÃO E TEMPO GLOBAL
    bauDestrancado: false, 
    tempoGlobalDefinido: false, // Controla se o Mago já perguntou
    sessaoEncerrada: false,     // Controla quando o Baú fecha
    jogoAtual: null,
    tempoRestante: 0,
    timerGlobal: null,          // O relógio agora é Global!
    xpGanhosNaSessao: 0,
    desafioAtualObj: null,
    digitandoAtivo: false,      // Controla a máquina de escrever

    defaults: {
        magoPhrases: [
            { id: 'm1', text: 'Olá, jovem aprendiz! 🎓 Quanto tempo deseja explorar os segredos do Baú do Inglês hoje?' },
            { id: 'm2', text: 'Bem-vindo de volta! Vejo que está muito empolgado! 🧙‍♂️ Quanto tempo temos hoje?' },
            { id: 'm3', text: 'Os segredos do Baú aguardam. 🗝️ Quantos minutos pretende focar-se hoje?' }
        ],
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
        wordPickers: [
            {id:'wp1', text:'I have _____ my keys. Have you seen them?', options:['lost','lose','loosed'], correct:0},
            {id:'wp2', text:'She is _____ than her sister.', options:['tall','taller','tallest'], correct:1}
        ],
        questions: [
            {id:'aq1', text:'What did you do last weekend?'},
            {id:'aq2', text:'Describe your dream house.'},
            {id:'aq3', text:'If you could live anywhere, where would you live?'}
        ],
        roleplays: [
            {id:'rp1', title:'✈️ No Aeroporto', prompt:'You are at check-in. The attendant says: "Can I see your passport and ticket?"', tip:'Use: Here you are'},
            {id:'rp2', title:'🍽️ No Restaurante', prompt:'Waiter: "Are you ready to order?"', tip:'Use: I would like...'}
        ],
        games: [
            {id:'wordSpark', title:'Word Spark', desc:'Crie uma frase com a palavra. Deteção IA.', icon:'🎲', color:'#E0E7FF', level:'B1-B2'},
            {id:'readAloud', title:'Read Aloud Lab', desc:'Fale ao microfone e a IA corrige a pronúncia.', icon:'🎙️', color:'#D1FAE5', level:'A2-C1'},
            {id:'listenType', title:'Listen & Type', desc:'Escute o áudio e escreva sem errar.', icon:'👂', color:'#FEF3C7', level:'A2-B1'},
            {id:'quiz', title:'Quiz Master', desc:'Responda corretamente para não ser penalizado.', icon:'🧩', color:'#FEE2E2', level:'A1-B2'},
            {id:'wordPicker', title:'Word Picker', desc:'Gramática rigorosa. Escolha a opção certa.', icon:'✍️', color:'#E0E7FF', level:'A2-B1'},
            {id:'sentenceShuffle', title:'Sentence Shuffle', desc:'Sorteio de frases. Transforme!', icon:'🔀', color:'#D1FAE5', level:'B1-B2'},
            {id:'answerQuest', title:'Answer Quest', desc:'Responda abertamente. Professor avalia.', icon:'💬', color:'#FEF3C7', level:'B1-C1'},
            {id:'questionMaker', title:'Question Maker', desc:'Formule perguntas em inglês.', icon:'❓', color:'#F5D0FE', level:'B1-B2'},
            {id:'contextRole', title:'Context Roleplay', desc:'Simulação de papéis. Professor avalia.', icon:'🎭', color:'#CCFBF1', level:'B1-C1'},
            {id:'debateAI', title:'AI Debate Club', desc:'Debate denso com Inteligência Artificial.', icon:'🤖', color:'#E0F2FE', level:'B2-C1'},
            {id:'minimalPairs', title:'Minimal Pairs Lab', desc:'Teste de audição extrema. ship vs sheep.', icon:'👄', color:'#FFEDD5', level:'B1-C1'},
            {id:'picturePop', title:'Picture Pop', desc:'Deteção de voz: Fale o nome da imagem.', icon:'🖼️', color:'#DCFCE7', level:'A1-B1'}
        ]
    },

    init: () => {
        Workspace.Ingles.injetarCSS();
        Workspace.Ingles.construirHTML();
        Workspace.Ingles.loadDados().then(() => {
            if (Workspace.usuario && Workspace.usuario.tipo !== 'Aluno') {
                const badge = document.getElementById('ig-pendingCount');
                if(badge) badge.textContent = Workspace.Ingles.state.submissions.filter(s=>s.status==='pending').length;
            }
        });
        if('speechSynthesis' in window) window.speechSynthesis.getVoices(); 
    },

    abrirBau: () => {
        Workspace.navegarPara('ingles');
    },

    loadDados: async () => {
        try {
            const escolaId = Workspace.usuario.escolaId || 'DEFAULT';
            const res = await Workspace.api(`/workspace/ingles/dados?escolaId=${escolaId}`, 'GET');
            
            if (res && res.success && res.dados && res.dados.words) {
                const d = res.dados;
                Workspace.Ingles.state.words = Array.isArray(d.words) ? d.words : Workspace.Ingles.defaults.words;
                Workspace.Ingles.state.phrases = Array.isArray(d.phrases) ? d.phrases : Workspace.Ingles.defaults.phrases;
                Workspace.Ingles.state.quizzes = Array.isArray(d.quizzes) ? d.quizzes : Workspace.Ingles.defaults.quizzes;
                Workspace.Ingles.state.pictures = Array.isArray(d.pictures) ? d.pictures : Workspace.Ingles.defaults.pictures;
                Workspace.Ingles.state.submissions = Array.isArray(d.submissions) ? d.submissions : [];
                Workspace.Ingles.state.pool = Array.isArray(d.pool) ? d.pool : [];
                Workspace.Ingles.state.errosRetidos = Array.isArray(d.errosRetidos) ? d.errosRetidos : [];
                Workspace.Ingles.state.magoPhrases = Array.isArray(d.magoPhrases) ? d.magoPhrases : Workspace.Ingles.defaults.magoPhrases;
            } else if (Workspace.Ingles.state.words.length === 0) {
                Workspace.Ingles.state.words = [...Workspace.Ingles.defaults.words];
                Workspace.Ingles.state.phrases = [...Workspace.Ingles.defaults.phrases];
                Workspace.Ingles.state.quizzes = [...Workspace.Ingles.defaults.quizzes];
                Workspace.Ingles.state.pictures = [...Workspace.Ingles.defaults.pictures];
                Workspace.Ingles.state.submissions = [];
                Workspace.Ingles.state.pool = [];
                Workspace.Ingles.state.errosRetidos = [];
                Workspace.Ingles.state.magoPhrases = [...Workspace.Ingles.defaults.magoPhrases];
            }

            const userK = `ws_ingles_user_${Workspace.usuario.id}`;
            Workspace.Ingles.state.xp = parseInt(localStorage.getItem(`${userK}_xp`) || '0');
            Workspace.Ingles.state.streak = parseInt(localStorage.getItem(`${userK}_streak`) || '1');
            Workspace.Ingles.state.itensConcluidos = JSON.parse(localStorage.getItem(`${userK}_concluidos`)) || []; 
        } catch (e) { console.error("Erro ao conectar ao Algoritmo.", e); }
    },

    saveDados: async () => {
        const userK = `ws_ingles_user_${Workspace.usuario.id}`;
        localStorage.setItem(`${userK}_xp`, Workspace.Ingles.state.xp);
        localStorage.setItem(`${userK}_streak`, Workspace.Ingles.state.streak);
        localStorage.setItem(`${userK}_concluidos`, JSON.stringify(Workspace.Ingles.state.itensConcluidos));

        try {
            if (Workspace.usuario && Workspace.usuario.tipo === 'Aluno') {
                Workspace.api('/workspace/ingles/xp', 'POST', { 
                    userId: Workspace.usuario.id, escolaId: Workspace.usuario.escolaId || 'DEFAULT',
                    nome: Workspace.usuario.nome || Workspace.usuario.login, xp: Workspace.Ingles.state.xp, streak: Workspace.Ingles.state.streak 
                }).catch(() => {});
            }

            await Workspace.api('/workspace/ingles/dados', 'PUT', {
                escolaId: Workspace.usuario.escolaId || 'DEFAULT',
                words: Workspace.Ingles.state.words, phrases: Workspace.Ingles.state.phrases,
                quizzes: Workspace.Ingles.state.quizzes, pictures: Workspace.Ingles.state.pictures,
                submissions: Workspace.Ingles.state.submissions, pool: Workspace.Ingles.state.pool,
                errosRetidos: Workspace.Ingles.state.errosRetidos, magoPhrases: Workspace.Ingles.state.magoPhrases
            });
        } catch (e) {}
    },

    // ============================================================================
    // 🧠 SISTEMA DE PROGRESSÃO E REPETIÇÃO ESPAÇADA
    // ============================================================================
    registrarErro: (itemOriginal, tipoConteudo) => {
        const jaExiste = Workspace.Ingles.state.errosRetidos.find(e => e.id === itemOriginal.id);
        if (!jaExiste) {
            Workspace.Ingles.state.errosRetidos.push({ ...itemOriginal, _tipoDefeito: tipoConteudo });
            Workspace.Ingles.saveDados();
        }
    },

    superarErro: (itemId) => {
        const index = Workspace.Ingles.state.errosRetidos.findIndex(e => e.id === itemId);
        if (index !== -1) {
            Workspace.Ingles.state.errosRetidos.splice(index, 1);
            Workspace.Ingles.saveDados(); 
        }
    },

    marcarComoConcluido: (itemId) => {
        if (!itemId) return;
        if (!Workspace.Ingles.state.itensConcluidos.includes(itemId)) {
            Workspace.Ingles.state.itensConcluidos.push(itemId);
            Workspace.Ingles.saveDados();
        }
    },

    obterItemInteligente: (listaPadrao, tipoConteudo) => {
        let listaDisponivel = listaPadrao.filter(item => !Workspace.Ingles.state.itensConcluidos.includes(item.id));

        if (listaDisponivel.length === 0 && listaPadrao.length > 0) {
            Workspace.mostrarAviso("🏆 Incrível! Você dominou todo este conteúdo. Vamos rever!", "success");
            Workspace.Ingles.state.itensConcluidos = [];
            Workspace.Ingles.saveDados();
            listaDisponivel = listaPadrao;
        }

        const listaErros = Workspace.Ingles.state.errosRetidos.filter(e => e._tipoDefeito === tipoConteudo && !Workspace.Ingles.state.itensConcluidos.includes(e.id));
        if (listaErros.length > 0 && Math.random() < 0.60) {
            return listaErros[Math.floor(Math.random() * listaErros.length)];
        }
        
        return listaDisponivel[Math.floor(Math.random() * listaDisponivel.length)] || listaPadrao[0];
    },

    // ============================================================================
    // 🗣️ FERRAMENTAS NATIVAS E DE INTERFACE
    // ============================================================================
    falar: (text, lang='en-US') => {
        if(!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text); u.lang = lang; u.rate = 0.9;
        const voices = window.speechSynthesis.getVoices();
        const idiomaPrincipal = lang.split('-')[0];
        const vozSelec = voices.find(v => v.lang.includes(idiomaPrincipal)) || voices.find(v => v.lang.includes('en')) || voices[0];
        if(vozSelec) u.voice = vozSelec;
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
                    Workspace.Ingles.mediaRecorder.ondataavailable = e => { if(e.data.size > 0) Workspace.Ingles.audioChunks.push(e.data); };
                    Workspace.Ingles.mediaRecorder.onstop = () => {
                        Workspace.Ingles.audioBlob = new Blob(Workspace.Ingles.audioChunks, {type:'audio/webm'});
                        Workspace.Ingles.currentAudioURL = URL.createObjectURL(Workspace.Ingles.audioBlob);
                        audioPrev.src = Workspace.Ingles.currentAudioURL;
                        audioPrev.style.display = 'block';
                        status.textContent = '✅ Áudio processado!';
                        Workspace.Ingles.streamMicrofone.getTracks().forEach(t=>t.stop());
                    };
                    Workspace.Ingles.mediaRecorder.start();
                    btn.style.animation = 'pulse 1.2s infinite'; btn.textContent = '⏹️'; isRecording = true;
                } catch(err) { Workspace.mostrarAviso('Microfone bloqueado.', 'error'); }
            } else {
                if(Workspace.Ingles.mediaRecorder && Workspace.Ingles.mediaRecorder.state !== 'inactive') Workspace.Ingles.mediaRecorder.stop();
                btn.style.animation = 'none'; btn.textContent = '🎙️'; isRecording = false;
                status.textContent = 'Processando... ⏳';
            }
        };
    },

    injetarCSS: () => {
        if(document.getElementById('ws-ingles-css')) return;
        const style = document.createElement('style');
        style.id = 'ws-ingles-css';
        style.innerHTML = `
            #ws-ingles-container { background: #F8FAFC; border-radius: 16px; overflow: hidden; min-height: 80vh; position: relative; }
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
            
            /* 🚀 ANIMAÇÕES DA FECHADURA E EXPLOSÃO */
            @keyframes pulseChest { 0% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(241,196,15,0.2)); } 50% { transform: scale(1.05); filter: drop-shadow(0 0 25px rgba(241,196,15,0.8)); } 100% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(241,196,15,0.2)); } }
            .ig-particle { position: fixed; pointer-events: none; z-index: 9999999; animation: explodirParticula 1.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards; }
            @keyframes explodirParticula { 0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) scale(0) rotate(720deg); opacity: 0; } }
            
            /* 🧙‍♂️ ANIMAÇÕES DO GUARDIÃO MÁGICO */
            .ig-guardian-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; background: #F8FAFC; position: relative; }
            .ig-guardian-avatar { font-size: 90px; animation: flutuarMago 3s ease-in-out infinite; margin-bottom: 20px; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2)); }
            .ig-balao-fala { background: white; padding: 25px 35px; border-radius: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.1); position: relative; max-width: 450px; text-align: center; font-size: 18px; font-weight: bold; color: #2c3e50; min-height: 90px; display: flex; align-items: center; justify-content: center; line-height: 1.5; }
            .ig-balao-fala::after { content: ''; position: absolute; top: -15px; left: 50%; transform: translateX(-50%); border-width: 0 15px 15px 15px; border-style: solid; border-color: transparent transparent white transparent; }
            .ig-opcoes-tempo { display: flex; gap: 15px; margin-top: 30px; opacity: 0; transform: translateY(20px); transition: all 0.6s cubic-bezier(0.25, 1, 0.5, 1); pointer-events: none; }
            .ig-opcoes-tempo.visivel { opacity: 1; transform: translateY(0); pointer-events: auto; }
            @keyframes flutuarMago { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
            
            /* ⏱️ RELÓGIO GLOBAL */
            .ig-global-timer { font-family: monospace; font-size: 16px; font-weight: 900; color: #e74c3c; background: #fdf2f2; padding: 6px 12px; border-radius: 20px; border: 2px solid #fadbd8; display: none; align-items: center; justify-content: center; }

            .ig-list-item { display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee; align-items:center; }
            @media (max-width: 900px) { .ig-sidebar { width: 100%; flex-direction: row; overflow-x: auto; padding: 10px; } .ig-side-item { white-space: nowrap; } #ig-professorView { flex-direction: column; } }
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
            if (painelPrincipal && painelPrincipal.parentNode) painelPrincipal.parentNode.appendChild(container);
        }

        container.innerHTML = `
            <div class="ig-header">
                <div class="ig-title">
                    <div class="ig-title-icon">🧰</div>
                    <div><h2 style="margin:0; font-size:22px; color:#0F172A;">Baú do Inglês</h2><p style="margin:0; font-size:13px; color:#64748B;">Estude de forma inteligente e adaptativa!</p></div>
                </div>
                <div class="ig-xp-badge">
                    <!-- 🚀 O RELÓGIO GLOBAL -->
                    <div id="ig-global-timer-display" class="ig-global-timer">00:00</div>
                    <span>🔥 <b id="ig-streakCount">1</b> dia(s)</span><span>⭐ <b id="ig-xpCount">0</b> XP</span>
                </div>
            </div>

            <!-- 🧙‍♂️ NOVO: ECRÃ DO GUARDIÃO MÁGICO -->
            <div id="ig-guardian-screen" class="ig-guardian-container" style="display:none;">
                <div class="ig-guardian-avatar">🧙‍♂️</div>
                <div class="ig-balao-fala" id="ig-guardian-text"></div>
                <div class="ig-opcoes-tempo" id="ig-guardian-options" style="display: flex; gap: 15px; margin-top: 30px; align-items: center; justify-content: center; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 10px; background: white; padding: 5px 15px; border-radius: 12px; border: 2px solid #4F46E5; box-shadow: 0 4px 10px rgba(79,70,229,0.1);">
                        <input type="number" id="ig-tempo-escolhido" class="ig-input" placeholder="Ex: 15" min="1" max="120" style="width: 80px; border: none; box-shadow: none; font-size: 20px; font-weight: 900; color: #0F172A; text-align: center; padding: 5px; outline: none;">
                        <span style="font-size: 16px; font-weight: bold; color: #4F46E5;">Minutos</span>
                    </div>
                    <button class="ws-btn" style="background:#10B981; color:white; font-size:16px; font-weight:bold; border:none; padding:15px 25px; border-radius:12px; cursor:pointer; transition:0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" onclick="
                        const campoTempo = document.getElementById('ig-tempo-escolhido');
                        const minutos = parseInt(campoTempo.value) || 0;
                        if (minutos <= 0) {
                            Workspace.mostrarAviso('O Mago avisa: Digite um tempo válido para treinar!', 'warning');
                            campoTempo.focus();
                        } else {
                            Workspace.Ingles.definirTempoGlobal(minutos);
                        }
                    ">Confirmar Mágica ✨</button>
                </div>
            </div>

            <!-- 🚀 A FECHADURA MÁGICA -->
            <div id="ig-unlock-screen" style="display:none; flex-direction:column; align-items:center; justify-content:center; min-height:60vh; position:relative; background:#F8FAFC;">
                <h1 style="font-size:32px; margin-bottom:10px; color:#1E293B; font-weight:900;">Destranque o Baú</h1>
                <p style="color:#64748B; margin-bottom:50px; font-size:16px;">O tempo começa a contar assim que a fechadura abrir!</p>
                <div style="position:relative; width:100%; max-width:400px; height:250px; display:flex; justify-content:space-between; align-items:center;">
                    <div id="ig-drag-key" style="font-size:70px; cursor:grab; user-select:none; filter:drop-shadow(0 5px 15px rgba(241,196,15,0.6)); position:absolute; left:20px; z-index:10; touch-action:none;">🗝️</div>
                    <div id="ig-chest-lock" style="font-size:130px; animation: pulseChest 2s infinite; position:absolute; right:20px; user-select:none;">🧰
                        <div id="ig-keyhole" style="position:absolute; top:55%; left:50%; transform:translate(-50%, -50%); width:30px; height:30px; border-radius:50%; background:rgba(0,0,0,0.6); box-shadow:inset 0 4px 8px rgba(0,0,0,0.9);"></div>
                    </div>
                </div>
            </div>

            <div id="ig-alunoView" style="display:none;">
                <div style="padding: 30px 30px 0 30px;">
                    <h1 style="color:#0F172A; font-size:28px; margin:0 0 10px 0;">O relógio está a contar! ⏳</h1>
                    <p style="color:#64748B; font-size:15px; max-width:800px; margin:0;">Escolha um jogo. Se errar, a IA guardará o seu erro. Só avança no ranking quem domina o conteúdo!</p>
                </div>
                <div id="ig-gamesGrid" class="ig-games-grid"></div>
            </div>

            <!-- 🔒 ECRÃ DE FIM DE TEMPO -->
            <div id="ig-timeout-screen" style="display:none; flex-direction:column; align-items:center; justify-content:center; min-height:60vh; background:#F8FAFC; text-align:center;">
                <div style="font-size:70px; margin-bottom:10px;">🔒</div>
                <h1 style="font-size:32px; color:#1E293B; margin-bottom:10px;">O tempo esgotou!</h1>
                <p style="color:#64748B; margin-bottom:20px;">O Baú fechou-se magicamente. Excelente treino!</p>
                <div style="background:#D1FAE5; border:2px solid #10B981; padding:20px; border-radius:16px; display:inline-block; margin-bottom:30px;">
                    <div style="font-size:14px; color:#065F46; font-weight:bold; text-transform:uppercase;">XP Ganho Hoje</div>
                    <div style="font-size:36px; font-weight:900; color:#10B981;" id="ig-timeout-xp">+0 XP ⭐</div>
                </div>
                <button class="ws-btn" style="background:#0F172A; color:white; padding:12px 25px; border-radius:12px; font-weight:bold; border:none; cursor:pointer;" onclick="Workspace.Ingles.encerrarSessaoBau()">Guardar e Sair</button>
            </div>

            <div id="ig-professorView" style="display:none; min-height: 70vh; display: flex;">
                <div class="ig-sidebar">
                    <button class="ig-side-item" data-tab="mago" onclick="Workspace.Ingles.renderProfessorTab('mago')">🧙‍♂️ Mago IA</button>
                    <button class="ig-side-item active" data-tab="biblioteca" onclick="Workspace.Ingles.renderProfessorTab('biblioteca')">📚 Biblioteca</button>
                    <button class="ig-side-item" data-tab="imagens" onclick="Workspace.Ingles.renderProfessorTab('imagens')">🖼️ Imagens</button>
                    <button class="ig-side-item" data-tab="envios" onclick="Workspace.Ingles.renderProfessorTab('envios')">📥 Envios <span id="ig-pendingCount" style="background:#F59E0B; color:white; padding:2px 6px; border-radius:10px; font-size:11px; margin-left:5px;">0</span></button>
                    <button class="ig-side-item" data-tab="algoritmo" onclick="Workspace.Ingles.renderProfessorTab('algoritmo')">🧠 Algoritmo</button>
                    <button class="ig-side-item" data-tab="ranking" onclick="Workspace.Ingles.renderProfessorTab('ranking')">🏆 Ranking Global</button>
                </div>
                <div id="ig-tab-content" style="flex:1; padding:30px; background:#F8FAFC;"></div>
            </div>

            <div id="ig-gameModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.85); z-index:1000000; align-items:center; justify-content:center; backdrop-filter:blur(8px);">
                <div class="ws-card" style="width:90%; max-width:650px; background:white; border-radius:24px; overflow:hidden; padding:0; display:flex; flex-direction:column; max-height:90vh; box-shadow:0 25px 50px rgba(0,0,0,0.5);">
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
            document.getElementById('ig-unlock-screen').style.display = 'none';
            document.getElementById('ig-guardian-screen').style.display = 'none';
            document.getElementById('ig-timeout-screen').style.display = 'none';
            
            const abaSalva = localStorage.getItem('ws_ingles_aba_prof') || 'envios';
            Workspace.Ingles.renderProfessorTab(abaSalva); 
        } else {
            document.getElementById('ig-professorView').style.display = 'none';

            if (Workspace.Ingles.sessaoEncerrada) {
                document.getElementById('ig-guardian-screen').style.display = 'none';
                document.getElementById('ig-unlock-screen').style.display = 'none';
                document.getElementById('ig-alunoView').style.display = 'none';
                document.getElementById('ig-gameModal').style.display = 'none';
                document.getElementById('ig-timeout-screen').style.display = 'flex';
                document.getElementById('ig-timeout-xp').innerText = `+${Workspace.Ingles.xpGanhosNaSessao} XP ⭐`;
            } 
            else if (!Workspace.Ingles.tempoGlobalDefinido) {
                document.getElementById('ig-unlock-screen').style.display = 'none';
                document.getElementById('ig-alunoView').style.display = 'none';
                document.getElementById('ig-guardian-screen').style.display = 'flex';
                Workspace.Ingles.iniciarFalaGuardiao();
            } 
            else if (!Workspace.Ingles.bauDestrancado) {
                document.getElementById('ig-guardian-screen').style.display = 'none';
                document.getElementById('ig-alunoView').style.display = 'none';
                document.getElementById('ig-unlock-screen').style.display = 'flex';
                Workspace.Ingles.ativarFisicaFechadura();
            } 
            else {
                document.getElementById('ig-guardian-screen').style.display = 'none';
                document.getElementById('ig-unlock-screen').style.display = 'none';
                document.getElementById('ig-alunoView').style.display = 'block';
                Workspace.Ingles.renderAlunoGrid();
            }
        }
    },

    renderAlunoGrid: () => {
        const grid = document.getElementById('ig-gamesGrid');
        if(!grid) return;
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
                </div>
            </div>
        `).join('');
    },

    // ============================================================================
    // 🧙‍♂️ NARRATIVA: O GUARDIÃO E A FECHADURA MÁGICA
    // ============================================================================
    encerrarSessaoBau: () => {
        Workspace.Ingles.tempoGlobalDefinido = false;
        Workspace.Ingles.sessaoEncerrada = false;
        Workspace.Ingles.bauDestrancado = false;
        Workspace.navegarPara('feed');
    },

    iniciarFalaGuardiao: () => {
        if (Workspace.Ingles.digitandoAtivo) return; 
        Workspace.Ingles.digitandoAtivo = true;
        
        const balao = document.getElementById('ig-guardian-text');
        const botoes = document.getElementById('ig-guardian-options');
        balao.innerHTML = '';
        botoes.classList.remove('visivel');

        // Sorteia frase para o Mago IA
        const frasesLivres = Workspace.Ingles.state.magoPhrases.length > 0 ? Workspace.Ingles.state.magoPhrases : Workspace.Ingles.defaults.magoPhrases;
        const fraseMago = frasesLivres[Math.floor(Math.random() * frasesLivres.length)].text;

        // Ativa a Voz do Mago
        Workspace.Ingles.falar(fraseMago, 'pt-BR');

        let i = 0;
        try { const audio = new Audio('https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg'); audio.volume = 0.2; audio.play().catch(()=>{}); } catch(e){}

        const intervalo = setInterval(() => {
            balao.innerHTML += fraseMago.charAt(i);
            i++;
            if (i >= fraseMago.length) {
                clearInterval(intervalo);
                Workspace.Ingles.digitandoAtivo = false;
                setTimeout(() => { botoes.classList.add('visivel'); }, 300);
            }
        }, 35); 
    },

    definirTempoGlobal: (minutos) => {
        Workspace.Ingles.tempoRestante = minutos * 60;
        Workspace.Ingles.xpGanhosNaSessao = 0;
        Workspace.Ingles.tempoGlobalDefinido = true;
        Workspace.Ingles.renderizarVisualizacao(); 
    },

    iniciarTimerGlobal: () => {
        const display = document.getElementById('ig-global-timer-display');
        display.style.display = 'flex';
        Workspace.Ingles.atualizarDisplayTimerGlobal();

        if (Workspace.Ingles.timerGlobal) clearInterval(Workspace.Ingles.timerGlobal);
        
        Workspace.Ingles.timerGlobal = setInterval(() => {
            Workspace.Ingles.tempoRestante--;
            Workspace.Ingles.atualizarDisplayTimerGlobal();
            
            if (Workspace.Ingles.tempoRestante <= 0) {
                clearInterval(Workspace.Ingles.timerGlobal);
                Workspace.Ingles.sessaoEncerrada = true;
                Workspace.Ingles.fecharJogo(); 
                try { const audio = new Audio('https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg'); audio.play().catch(()=>{}); } catch(e){}
                Workspace.Ingles.renderizarVisualizacao();
            }
        }, 1000);
    },

    atualizarDisplayTimerGlobal: () => {
        const d = document.getElementById('ig-global-timer-display');
        if(!d) return;
        const m = Math.floor(Workspace.Ingles.tempoRestante / 60).toString().padStart(2, '0');
        const s = (Workspace.Ingles.tempoRestante % 60).toString().padStart(2, '0');
        d.innerText = `⏱️ ${m}:${s}`;
        
        if (Workspace.Ingles.tempoRestante < 30 && Workspace.Ingles.tempoRestante > 0) { 
            d.style.color = 'white'; d.style.background = '#e74c3c'; d.style.animation = 'pulse 1s infinite'; 
        } else { 
            d.style.color = '#e74c3c'; d.style.background = '#fdf2f2'; d.style.animation = 'none'; 
        }
    },

    // ============================================================================
    // 🧲 FÍSICA E ANIMAÇÃO MÁGICA: ARRASTAR A CHAVE
    // ============================================================================
    ativarFisicaFechadura: () => {
        const key = document.getElementById('ig-drag-key');
        const lock = document.getElementById('ig-keyhole');
        if (!key || !lock) return;

        let isDragging = false;
        let currentX = 0, currentY = 0;
        let initialMouseX, initialMouseY;

        key.style.transform = `translate(0px, 0px)`;

        const startDrag = (e) => {
            isDragging = true; key.style.cursor = 'grabbing';
            const evt = e.type.includes('mouse') ? e : e.touches[0];
            initialMouseX = evt.clientX - currentX;
            initialMouseY = evt.clientY - currentY;
        };

        const onDrag = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const evt = e.type.includes('mouse') ? e : e.touches[0];
            currentX = evt.clientX - initialMouseX;
            currentY = evt.clientY - initialMouseY;
            key.style.transform = `translate(${currentX}px, ${currentY}px)`;

            const keyRect = key.getBoundingClientRect();
            const lockRect = lock.getBoundingClientRect();
            const overlap = !(keyRect.right < lockRect.left || keyRect.left > lockRect.right || keyRect.bottom < lockRect.top || keyRect.top > lockRect.bottom);

            if (overlap) { isDragging = false; Workspace.Ingles.explodirBau(lockRect.left + 15, lockRect.top + 15); }
        };

        const stopDrag = () => {
            isDragging = false; key.style.cursor = 'grab';
            if (!Workspace.Ingles.bauDestrancado) {
                currentX = 0; currentY = 0;
                key.style.transition = 'transform 0.3s ease';
                key.style.transform = `translate(0px, 0px)`;
                setTimeout(() => key.style.transition = 'none', 300);
            }
        };

        key.addEventListener('mousedown', startDrag); document.addEventListener('mousemove', onDrag); document.addEventListener('mouseup', stopDrag);
        key.addEventListener('touchstart', startDrag, {passive: false}); document.addEventListener('touchmove', onDrag, {passive: false}); document.addEventListener('touchend', stopDrag);
    },

    explodirBau: (x, y) => {
        Workspace.Ingles.bauDestrancado = true;
        document.getElementById('ig-drag-key').style.display = 'none';
        document.getElementById('ig-chest-lock').style.animation = 'none';
        document.getElementById('ig-chest-lock').style.transform = 'scale(1.3) rotate(5deg)';
        
        try { const audio = new Audio('https://actions.google.com/sounds/v1/cartoon/magic_chime_chord.ogg'); audio.play().catch(()=>{}); } catch(e){}

        const cores = ['#f1c40f', '#e67e22', '#e74c3c', '#9b59b6', '#3498db', '#2ecc71', '#ff9ff3', '#00d8d6'];
        for (let i = 0; i < 60; i++) {
            let p = document.createElement('div');
            p.className = 'ig-particle';
            document.body.appendChild(p);
            let angle = Math.random() * Math.PI * 2;
            let velocity = 100 + Math.random() * 250;
            let tx = Math.cos(angle) * velocity; let ty = Math.sin(angle) * velocity - 100;
            p.style.left = (x + 20) + 'px'; p.style.top = (y + 20) + 'px';
            p.style.setProperty('--tx', tx + 'px'); p.style.setProperty('--ty', ty + 'px');
            p.style.backgroundColor = cores[Math.floor(Math.random() * cores.length)];
            p.style.boxShadow = `0 0 8px ${p.style.backgroundColor}`;
            
            let size = (5 + Math.random() * 10) + 'px';
            p.style.width = size; p.style.height = size;
            p.style.borderRadius = Math.random() > 0.5 ? '50%' : '3px';
            
            setTimeout(() => p.remove(), 1500);
        }

        setTimeout(() => {
            const screen = document.getElementById('ig-unlock-screen');
            screen.style.opacity = '0';
            screen.style.transform = 'scale(1.1)';
            screen.style.transition = 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
            
            setTimeout(() => { 
                Workspace.Ingles.iniciarTimerGlobal();
                Workspace.Ingles.renderizarVisualizacao(); 
                const grid = document.getElementById('ig-gamesGrid');
                if (grid) {
                    grid.style.opacity = '0';
                    grid.style.transform = 'translateY(30px)';
                    requestAnimationFrame(() => {
                        grid.style.transition = 'all 0.6s ease-out';
                        grid.style.opacity = '1';
                        grid.style.transform = 'translateY(0)';
                    });
                }
            }, 600);
        }, 800);
    },

    // ============================================================================
    // 👨‍🏫 O LABORATÓRIO DO PROFESSOR
    // ============================================================================
    renderProfessorTab: (tabId) => {
        localStorage.setItem('ws_ingles_aba_prof', tabId); 
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
        else if (tabId === 'mago') {
            content.innerHTML = `
                <div class="ig-card">
                    <h3>🧙‍♂️ Inteligência do Guardião (Mago IA)</h3>
                    <p style="color:#64748B;font-size:13px">Crie falas personalizadas! Quando um aluno abrir o Baú, a Inteligência Artificial vai escolher uma destas frases aleatoriamente, lê-la em voz alta e digitá-la no ecrã.</p>
                    <div style="display:flex; gap:10px; margin-top:15px; margin-bottom:15px;">
                        <input id="nwMago" class="ig-input" placeholder="Ex: Que bom te ver de novo! Quantos minutos temos?">
                        <button class="ws-btn" style="background:#4F46E5; color:white; border:none; padding:10px 15px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="Workspace.Ingles.addMagoPhrase()">Salvar Fala</button>
                    </div>
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${state.magoPhrases.map(m => `
                        <div class="ig-list-item" style="background:#f8fafc; border-radius:8px; margin-bottom:8px; padding:12px; display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-weight:600; color:#2c3e50; font-size:14px;">💬 "${m.text}"</span>
                            <button style="background:transparent; border:none; color:#e74c3c; cursor:pointer; font-weight:bold; font-size:16px;" onclick="Workspace.Ingles.remItem('magoPhrases','${m.id}')">✕</button>
                        </div>`).join('')}
                    </div>
                </div>
            `;
        }
        else if (tabId === 'imagens') {
            content.innerHTML = `
                <div class="ig-card">
                    <h3>🖼️ Banco de Figuras (Picture Pop)</h3>
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
                            <button class="ws-btn" style="background:#F1F5F9; color:#EF4444; width:100%; border:none; padding:8px; border-radius:8px; font-weight:bold; font-size:12px; cursor:pointer;" onclick="Workspace.Ingles.remItem('pictures','${p.id}')">Remover</button>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        else if (tabId === 'envios') {
            const pendentes = state.submissions.filter(s=>s.status==='pending');
            if(pendentes.length === 0) {
                content.innerHTML = `<div class="ig-card" style="text-align:center; padding:40px; color:#999;"><div style="font-size:40px; margin-bottom:10px;">☕</div>Nenhum desafio aberto pendente.</div>`;
            } else {
                content.innerHTML = `<div class="ig-card" style="border-left: 4px solid #F59E0B;"><h3>📥 Forja do Algoritmo</h3><p style="font-size:13px; color:#666;">Aprove as respostas textuais/abertas para alimentar a Piscina Global.</p></div>` + pendentes.slice().reverse().map(s => `
                    <div class="ig-card">
                        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                            <span class="ig-badge ig-badge-pending" style="background:#FEF3C7; color:#92400E; padding:4px 8px; border-radius:12px; font-size:11px; font-weight:bold;">Aguardando Avaliação</span>
                            <span style="font-size:12px; color:#999;"><b>${s.student}</b> • Desafio: ${s.game}</span>
                        </div>
                        <p style="font-size:15px; color:#2c3e50; background:#f4f6f7; padding:10px; border-radius:8px;">${Workspace.escapeHTML(s.text)}</p>
                        ${s.audioURL ? `<audio controls src="${s.audioURL}" style="width:100%; margin-top:10px; outline:none;"></audio>` : ''}
                        <div style="margin-top:15px; display:flex; gap:10px; flex-wrap:wrap;">
                            <button class="ws-btn" style="background:#10B981; border:none; padding:10px; border-radius:8px; cursor:pointer; color:white; flex:1; font-weight:bold;" onclick="Workspace.Ingles.aprovarEnvio('${s.id}')">✅ Aprovar para a Piscina Global</button>
                            <button class="ws-btn" style="background:#e74c3c; border:none; padding:10px; border-radius:8px; cursor:pointer; color:white; font-weight:bold;" onclick="Workspace.Ingles.remItem('submissions','${s.id}')">🗑️ Rejeitar</button>
                        </div>
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
                    <p style="color:#64748B;font-size:14px;line-height:1.5;">Os erros dos alunos são detetados e forçados em jogos futuros (Repetição Espaçada).</p>
                    <div style="display:flex; gap:15px; margin-top:20px; flex-wrap:wrap;">
                        <div style="flex:1; background:#EEF2FF; border:1px solid #4F46E5; padding:20px; border-radius:12px; text-align:center; min-width:150px;">
                            <div style="font-size:30px; font-weight:900; color:#4F46E5;">${totalProfessor}</div>
                            <div style="font-size:12px; font-weight:bold; color:#333; text-transform:uppercase;">Sementes do Prof</div>
                        </div>
                        <div style="flex:1; background:#FEE2E2; border:1px solid #EF4444; padding:20px; border-radius:12px; text-align:center; min-width:150px;">
                            <div style="font-size:30px; font-weight:900; color:#EF4444;">${state.errosRetidos.length}</div>
                            <div style="font-size:12px; font-weight:bold; color:#333; text-transform:uppercase;">Erros Retidos (Memória)</div>
                        </div>
                    </div>
                </div>
            `;
        }
        else if (tabId === 'ranking') {
            content.innerHTML = `<div style="text-align:center; padding:50px; color:#94a3b8;"><div style="font-size:40px; margin-bottom:15px; animation: pulse 1s infinite;">🏆</div>A carregar o Pódio...</div>`;
            Workspace.api(`/workspace/ingles/ranking?escolaId=${Workspace.usuario.escolaId}`, 'GET').then(res => {
                if (res && res.success && res.ranking.length > 0) {
                    let htmlRanking = `<div class="ig-card" style="border-left: 4px solid #F59E0B; background:#FFFBEB;"><h3>🏆 Pódio da Escola (Leaderboard)</h3></div>`;
                    res.ranking.forEach((aluno, index) => {
                        let medalha = `<div style="font-size:16px; font-weight:900; color:#94a3b8; width:40px; text-align:center;">${index + 1}º</div>`;
                        if (index === 0) medalha = `<div style="font-size:30px; width:40px; text-align:center;">🥇</div>`;
                        if (index === 1) medalha = `<div style="font-size:26px; width:40px; text-align:center;">🥈</div>`;
                        if (index === 2) medalha = `<div style="font-size:22px; width:40px; text-align:center;">🥉</div>`;
                        htmlRanking += `
                            <div style="background:#fff; border:1px solid #E2E8F0; padding:15px 20px; border-radius:16px; margin-bottom:12px; display:flex; align-items:center; justify-content:space-between;">
                                <div style="display:flex; align-items:center; gap:20px;">
                                    ${medalha}<div style="border:2px solid #E2E8F0; border-radius:50%; padding:2px;">${window.Workspace.renderizarAvatar(aluno.nome, 45)}</div>
                                    <strong style="color:#1E293B; font-size:16px;">${aluno.nome}</strong>
                                </div>
                                <div style="display:flex; gap:12px; align-items:center;">
                                    <div style="background:#E0E7FF; color:#4F46E5; padding:6px 15px; border-radius:30px; font-weight:900; font-size:14px; border:1px solid #C7D2FE;">⭐ ${aluno.xp} XP</div>
                                </div>
                            </div>
                        `;
                    });
                    content.innerHTML = htmlRanking;
                } else content.innerHTML = `<div class="ig-card" style="text-align:center; padding:50px;">A corrida ainda não começou!</div>`;
            });
        }
    },

    addWord: async () => {
        const w = document.getElementById('nwWord').value.trim(), t = document.getElementById('nwTrans').value.trim();
        if(!w) return;
        Workspace.Ingles.state.words.unshift({id:'w'+Date.now(), word:w, translation:t, level:'B1'});
        await Workspace.Ingles.saveDados(); Workspace.Ingles.renderProfessorTab('biblioteca'); 
    },
    addMagoPhrase: async () => {
        const text = document.getElementById('nwMago').value.trim();
        if(!text) return Workspace.mostrarAviso("Escreva a fala do Mago!", "warning");
        Workspace.Ingles.state.magoPhrases.unshift({ id: 'mago_' + Date.now(), text: text });
        await Workspace.Ingles.saveDados(); 
        Workspace.Ingles.renderProfessorTab('mago');
        Workspace.mostrarAviso("A fala foi ensinada ao Mago! 🧙‍♂️", "success");
    },
    addPhrase: async () => {
        const p = document.getElementById('nwPhrase').value.trim();
        if(!p) return;
        Workspace.Ingles.state.phrases.unshift({id:'p'+Date.now(), phrase:p});
        await Workspace.Ingles.saveDados(); Workspace.Ingles.renderProfessorTab('biblioteca'); 
    },
    addQuiz: async () => {
        const q = document.getElementById('qQuestion').value.trim(), o1 = document.getElementById('qOpt1').value.trim(), o2 = document.getElementById('qOpt2').value.trim();
        if(!q || !o1 || !o2) return;
        Workspace.Ingles.state.quizzes.unshift({id:'q'+Date.now(), question:q, options:[o1, o2], correct:1, explanation:'Professor', level:'B1'});
        await Workspace.Ingles.saveDados(); Workspace.Ingles.renderProfessorTab('biblioteca'); 
    },
    addPic: async () => {
        const w = document.getElementById('picWord').value.trim(), tr = document.getElementById('picTrans').value.trim(), em = document.getElementById('picEmoji').value.trim() || '🖼️';
        if(!w) return;
        Workspace.Ingles.state.pictures.unshift({id:'pic'+Date.now(), word:w, translation:tr, emoji:em, category:'Professor'});
        await Workspace.Ingles.saveDados(); Workspace.Ingles.renderProfessorTab('imagens'); 
    },
    remItem: async (key, id) => {
        Workspace.Ingles.state[key] = Workspace.Ingles.state[key].filter(i => i.id !== id);
        await Workspace.Ingles.saveDados(); const activeTab = document.querySelector('.ig-side-item.active');
        if(activeTab) Workspace.Ingles.renderProfessorTab(activeTab.dataset.tab);
    },
    aprovarEnvio: async (id) => {
        const s = Workspace.Ingles.state.submissions.find(x => x.id === id);
        if(!s) return; s.status = 'approved';
        Workspace.Ingles.state.pool.unshift({ id: 'pool_'+Date.now(), type: s.game, text: s.text, word: s.text, origin: 'student', student: s.student, timestamp: Date.now() });
        await Workspace.Ingles.saveDados(); Workspace.Ingles.renderProfessorTab('envios'); 
    },

    // ============================================================================
    // 🎮 ABRIR JOGOS
    // ============================================================================
    abrirJogo: (id) => {
        const game = Workspace.Ingles.defaults.games.find(g => g.id === id);
        if(!game) return;
        
        Workspace.Ingles.jogoAtual = id;
        document.getElementById('ig-modalIcon').textContent = game.icon;
        document.getElementById('ig-modalTitle').textContent = game.title;
        document.getElementById('ig-gameModal').style.display = 'flex';
        Workspace.Ingles.currentAudioURL = null;
        
        Workspace.Ingles.renderDesafioAtual();
    },

    fecharJogo: () => {
        document.getElementById('ig-gameModal').style.display = 'none';
        if(Workspace.Ingles.mediaRecorder && Workspace.Ingles.mediaRecorder.state === 'recording') Workspace.Ingles.mediaRecorder.stop();
        if(Workspace.Ingles.recognition) Workspace.Ingles.recognition.stop();
    },

    // 🚀 O NOVO GESTOR VISUAL DE VITÓRIA E DERROTA
    sucessoGenerico: async (bonus) => {
        if (Workspace.Ingles.desafioAtualObj && Workspace.Ingles.desafioAtualObj.id) {
            Workspace.Ingles.marcarComoConcluido(Workspace.Ingles.desafioAtualObj.id);
        }

        Workspace.Ingles.state.xp += bonus;
        Workspace.Ingles.xpGanhosNaSessao += bonus; 
        await Workspace.Ingles.saveDados(); 
        
        document.getElementById('ig-modalBody').innerHTML = `
            <div style="text-align:center; padding:50px;">
                <div style="font-size:60px; margin-bottom:15px;">✅</div>
                <h2 style="font-size:28px; color:#10B981; margin-bottom:10px;">Excelente!</h2>
                <div style="font-size:20px; font-weight:bold; color:#0F172A;">+${bonus} XP Ganho</div>
            </div>`;
        setTimeout(() => Workspace.Ingles.proximoDesafio(), 1500);
    },

    falhaGenerica: async () => {
        document.getElementById('ig-modalBody').innerHTML = `
            <div style="text-align:center; padding:50px;">
                <div style="font-size:60px; margin-bottom:15px;">❌</div>
                <h2 style="font-size:28px; color:#EF4444; margin-bottom:10px;">Atenção!</h2>
                <div style="font-size:16px; font-weight:bold; color:#64748B;">Erro guardado na memória. Voltaremos a este ponto depois.</div>
                <div style="font-size:20px; font-weight:bold; color:#EF4444; margin-top:10px;">0 XP</div>
            </div>`;
        setTimeout(() => Workspace.Ingles.proximoDesafio(), 2500);
    },

    envioAoProfessor: async (gameId, texto, bonus = 20) => {
        if(!texto || texto.trim().length < 2) return Workspace.mostrarAviso("Responda de forma válida!", "warning");
        Workspace.Ingles.state.submissions.unshift({
            id: 'sub_' + Date.now(), student: Workspace.usuario.nome, game: gameId, text: texto, audioURL: Workspace.Ingles.currentAudioURL || '', status: 'pending', timestamp: Date.now()
        });
        Workspace.Ingles.sucessoGenerico(bonus);
    },

    renderDesafioAtual: () => {
        if (Workspace.Ingles.tempoRestante <= 0) return;
        Workspace.Ingles.currentAudioURL = null; 
        Workspace.Ingles.desafioAtualObj = null; 
        
        const id = Workspace.Ingles.jogoAtual;
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

    proximoDesafio: () => {
        if (Workspace.Ingles.tempoRestante > 0) {
            Workspace.Ingles.renderDesafioAtual();
        } else {
            // Se o tempo esgotou durante a janela de feedback, fecha o jogo.
            Workspace.Ingles.fecharJogo();
        }
    },

    // ============================================================================
    // 🎮 JOGOS INTELIGENTES
    // ============================================================================
    
    renderGameWordSpark: () => {
        Workspace.Ingles.desafioAtualObj = Workspace.Ingles.obterItemInteligente(Workspace.Ingles.state.words, 'word');
        const w = Workspace.Ingles.desafioAtualObj;
        
        document.getElementById('ig-modalBody').innerHTML = `
            <div class="ig-word-roulette"><div class="ig-roulette-word">${w.word}</div></div>
            <p style="text-align:center;margin:12px 0;color:#64748B;font-weight:bold;">${w.translation}</p>
            <div class="ig-big-phrase">Missão: Crie uma frase com a palavra <b>${w.word}</b></div>
            <textarea id="ig-input" class="ig-textarea" placeholder="Type your sentence here..."></textarea>
            
            <button class="ws-btn" style="width:100%; background:#4F46E5; color:white; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:bold; margin-top:15px;" onclick="
                const txt = document.getElementById('ig-input').value;
                if(!txt.toLowerCase().includes(Workspace.Ingles.desafioAtualObj.word.toLowerCase())) {
                    Workspace.Ingles.registrarErro(Workspace.Ingles.desafioAtualObj, 'word');
                    Workspace.Ingles.falhaGenerica();
                } else {
                    Workspace.Ingles.superarErro(Workspace.Ingles.desafioAtualObj.id);
                    Workspace.Ingles.envioAoProfessor('wordSpark', txt, 50);
                }
            ">Verificar Inteligência 🚀</button>
        `;
    },

    renderGameReadAloud: () => {
        Workspace.Ingles.desafioAtualObj = Workspace.Ingles.obterItemInteligente(Workspace.Ingles.state.phrases, 'phrase');
        const p = Workspace.Ingles.desafioAtualObj;
        
        document.getElementById('ig-modalBody').innerHTML = `
            <div class="ig-big-phrase">${p.phrase}</div>
            <div style="text-align:center; margin:15px 0;">
                <button class="ws-btn" style="background:#0F172A; color:white; border-radius:30px; border:none; padding:10px 20px; cursor:pointer;" onclick="Workspace.Ingles.falar('${p.phrase.replace(/'/g,"\\'")}')">🔊 Ouvir IA</button>
            </div>
            <div style="text-align: center; margin-top: 20px; background:#F8FAFC; padding:20px; border-radius:12px; border:1px solid #E2E8F0;">
                <p style="font-size:13px; color:#333; font-weight:bold;">Sua vez. A IA vai analisar a sua voz:</p>
                <button id="ig-btnVoz" class="ws-btn" style="background:#10B981; color:white; font-size:16px; width:100%; border-radius:30px; padding:12px; border:none; font-weight:bold; cursor:pointer; margin-top:10px;" onclick="Workspace.Ingles.iniciarReconhecimentoDeVoz('${p.phrase.replace(/'/g,"\\'")}', Workspace.Ingles.desafioAtualObj, 'phrase')">🎤 Iniciar Leitura</button>
                <div id="ig-speechResult" style="margin-top:15px;"></div>
            </div>
        `;
    },

    renderGameListenType: () => {
        Workspace.Ingles.desafioAtualObj = Workspace.Ingles.obterItemInteligente(Workspace.Ingles.state.phrases, 'phrase');
        const p = Workspace.Ingles.desafioAtualObj;
        
        document.getElementById('ig-modalBody').innerHTML = `
            <div style="text-align:center;padding:20px">
                <div style="font-size:60px; margin-bottom:10px;">👂</div>
                <h3 style="margin-bottom:5px; color:#0F172A;">Escute e digite o que ouviu</h3>
                <button class="ws-btn" style="background:#4F46E5; color:white; border-radius:30px; padding:10px 30px; font-size:16px; margin-bottom:25px; border:none; cursor:pointer;" onclick="Workspace.Ingles.falar('${p.phrase.replace(/'/g,"\\'")}')">🔊 Tocar Áudio</button>
                
                <input id="ig-listenInput" class="ig-input" placeholder="Digite exatamente o que ouviu..." style="font-size:16px; font-weight:bold; text-align:center;">
                
                <button class="ws-btn" style="width:100%; background:#10B981; color:white; margin-top:15px; font-size:16px; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:bold;" onclick="
                    const digitado = document.getElementById('ig-listenInput').value;
                    const sim = Workspace.Ingles.similaridade(digitado, Workspace.Ingles.desafioAtualObj.phrase);
                    if(sim >= 0.9) {
                        Workspace.Ingles.superarErro(Workspace.Ingles.desafioAtualObj.id);
                        Workspace.Ingles.sucessoGenerico(50);
                    } else {
                        Workspace.Ingles.registrarErro(Workspace.Ingles.desafioAtualObj, 'phrase');
                        Workspace.Ingles.falhaGenerica();
                    }
                ">Verificar Rigorosa</button>
            </div>
        `;
    },

    renderGameQuiz: () => {
        Workspace.Ingles.desafioAtualObj = Workspace.Ingles.obterItemInteligente(Workspace.Ingles.state.quizzes, 'quiz');
        const q = Workspace.Ingles.desafioAtualObj;
        
        document.getElementById('ig-modalBody').innerHTML = `
            <div class="ig-big-phrase" style="font-size:18px">${q.question}</div>
            <div style="display:flex;flex-direction:column;gap:12px;margin-top:20px" id="ig-quizOptions">
                ${q.options.map((o,i)=>`<button class="ws-btn" style="background:white; color:#0F172A; border:2px solid #E2E8F0; text-align:left; padding:15px; font-size:14px; font-weight:600; border-radius:8px; cursor:pointer;" onclick="
                    document.querySelectorAll('#ig-quizOptions button').forEach(b => b.disabled = true);
                    if(${i} === Workspace.Ingles.desafioAtualObj.correct) {
                        Workspace.Ingles.superarErro(Workspace.Ingles.desafioAtualObj.id);
                        Workspace.Ingles.sucessoGenerico(30);
                    } else {
                        Workspace.Ingles.registrarErro(Workspace.Ingles.desafioAtualObj, 'quiz');
                        Workspace.Ingles.falhaGenerica();
                    }
                ">${o}</button>`).join('')}
            </div>
        `;
    },

    renderGamePicturePop: () => {
        Workspace.Ingles.desafioAtualObj = Workspace.Ingles.obterItemInteligente(Workspace.Ingles.state.pictures, 'picture');
        const pic = Workspace.Ingles.desafioAtualObj;
        
        document.getElementById('ig-modalBody').innerHTML = `
            <div style="text-align:center">
                <div style="width:150px; height:150px; border-radius:24px; background:#F8FAFC; border:2px solid #E2E8F0; display:flex; align-items:center; justify-content:center; margin:20px auto; font-size:80px;">${pic.emoji}</div>
                <div style="margin-top:25px; background:#0F172A; padding:20px; border-radius:16px;">
                    <p style="color:white; font-size:14px; font-weight:bold; margin-bottom:15px;">Fale o nome exato:</p>
                    <button id="ig-btnVoz" class="ws-btn" style="background:#10B981; color:white; font-size:16px; width:100%; border-radius:30px; padding:12px; border:none; font-weight:bold; cursor:pointer;" onclick="Workspace.Ingles.iniciarReconhecimentoDeVoz('${pic.word}', Workspace.Ingles.desafioAtualObj, 'picture')">🎤 Falar Nome</button>
                    <div id="ig-speechResult" style="margin-top:15px;"></div>
                    
                    <div style="margin-top:15px; border-top:1px solid rgba(255,255,255,0.1); padding-top:15px;">
                        <input id="ig-input" class="ig-input" placeholder="Ou digita aqui..." style="text-align:center; font-weight:bold;">
                        <button class="ws-btn" style="width:100%; background:white; color:#0F172A; margin-top:10px; font-weight:bold; border:none; padding:10px; border-radius:8px; cursor:pointer;" onclick="
                            const sim = Workspace.Ingles.similaridade(document.getElementById('ig-input').value, Workspace.Ingles.desafioAtualObj.word);
                            if(sim >= 0.9) {
                                Workspace.Ingles.superarErro(Workspace.Ingles.desafioAtualObj.id);
                                Workspace.Ingles.sucessoGenerico(75);
                            } else {
                                Workspace.Ingles.registrarErro(Workspace.Ingles.desafioAtualObj, 'picture');
                                Workspace.Ingles.falhaGenerica();
                            }
                        ">Verificar</button>
                    </div>
                </div>
            </div>
        `;
    },

    // 🚀 MOTOR DE INTELIGÊNCIA ARTIFICIAL PARA VOZ
    iniciarReconhecimentoDeVoz: (esperado, itemObj, tipoConteudo) => {
        const btn = document.getElementById('ig-btnVoz');
        const resEl = document.getElementById('ig-speechResult');
        
        if(!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)){
            Workspace.mostrarAviso('Navegador sem suporte a deteção de voz.', 'warning'); return;
        }

        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        Workspace.Ingles.recognition = new SR();
        Workspace.Ingles.recognition.lang = 'en-US';
        Workspace.Ingles.recognition.interimResults = false;
        Workspace.Ingles.recognition.maxAlternatives = 1;
        
        btn.innerText = "🎧 Escutando..."; btn.style.background = "#F59E0B"; btn.style.animation = "pulse 1s infinite";
        Workspace.Ingles.recognition.start();

        Workspace.Ingles.recognition.onresult = (e) => {
            const falado = e.results[0][0].transcript;
            btn.style.animation = "none"; btn.style.background = "#0F172A"; btn.innerText = `Lido: "${falado}"`;
            
            const sim = Workspace.Ingles.similaridade(falado, esperado);
            if(sim >= 0.75) {
                resEl.innerHTML = `<div style="background:#D1FAE5; color:#065F46; padding:10px; border-radius:8px; font-weight:bold;">✅ Perfeito!</div>`;
                if (itemObj) Workspace.Ingles.superarErro(itemObj.id);
                setTimeout(() => Workspace.Ingles.sucessoGenerico(75), 1000);
            } else {
                resEl.innerHTML = `<div style="background:#FEE2E2; color:#B91C1C; padding:10px; border-radius:8px; font-weight:bold;">❌ IA entendeu: "${falado}"</div>`;
                if (itemObj) Workspace.Ingles.registrarErro(itemObj, tipoConteudo);
                setTimeout(() => Workspace.Ingles.falhaGenerica(), 1500);
            }
        };

        Workspace.Ingles.recognition.onerror = () => {
            btn.style.animation = "none"; btn.style.background = "#10B981"; btn.innerText = "🎤 Falar Novamente";
            Workspace.mostrarAviso("Não consegui ouvir. Tenta de novo.", "error");
        };
    },

    // ============================================================================
    // 🧩 OUTROS JOGOS (Agora 100% integrados no Spaced Repetition System)
    // ============================================================================
    renderGameWordPicker: () => {
        Workspace.Ingles.desafioAtualObj = Workspace.Ingles.obterItemInteligente(Workspace.Ingles.defaults.wordPickers, 'picker');
        const s = Workspace.Ingles.desafioAtualObj;
        
        document.getElementById('ig-modalBody').innerHTML = `
            <div class="ig-big-phrase" style="font-size:22px; color:#4F46E5;">${s.text}</div>
            <div style="display:flex; gap:10px; justify-content:center; margin-top:20px; flex-wrap:wrap;">
                ${s.options.map((o,i)=>`<button class="ws-btn" style="background:white; color:#0F172A; border:2px solid #E2E8F0; padding:12px 25px; font-weight:bold; border-radius:30px; cursor:pointer;" onclick="
                    if(${i} === Workspace.Ingles.desafioAtualObj.correct) { 
                        Workspace.Ingles.superarErro(Workspace.Ingles.desafioAtualObj.id); 
                        Workspace.Ingles.sucessoGenerico(20); 
                    } else { 
                        Workspace.Ingles.registrarErro(Workspace.Ingles.desafioAtualObj, 'picker'); 
                        Workspace.Ingles.falhaGenerica(); 
                    }
                ">${o}</button>`).join('')}
            </div>
        `;
    },

    renderGameMinimalPairs: () => {
        Workspace.Ingles.desafioAtualObj = Workspace.Ingles.obterItemInteligente(Workspace.Ingles.defaults.minimalPairs, 'minimal');
        const pair = Workspace.Ingles.desafioAtualObj;
        const target = Math.random() > 0.5 ? pair.a : pair.b;
        
        document.getElementById('ig-modalBody').innerHTML = `
            <div style="text-align:center">
                <h3 style="font-size:22px; color:#0F172A;">👄 Laboratório Fonético</h3>
                <div style="background:#0F172A; padding:20px; border-radius:16px; margin-top:20px;">
                    <button class="ws-btn" style="background:#4F46E5; color:white; padding:12px 30px; border-radius:30px; border:2px solid white; cursor:pointer; font-weight:bold;" onclick="Workspace.Ingles.falar('${target}')">🎧 Tocar a Palavra Misteriosa</button>
                    <div style="display:flex; gap:10px; justify-content:center; margin-top:15px;">
                        <button class="ws-btn" style="background:white; color:#0F172A; font-weight:bold; padding:10px 25px; border-radius:8px; cursor:pointer; border:none;" onclick="
                            if('${pair.a}' === '${target}') { Workspace.Ingles.superarErro(Workspace.Ingles.desafioAtualObj.id); Workspace.Ingles.sucessoGenerico(75); } 
                            else { Workspace.Ingles.registrarErro(Workspace.Ingles.desafioAtualObj, 'minimal'); Workspace.Ingles.falhaGenerica(); }
                        ">${pair.a}</button>
                        <button class="ws-btn" style="background:white; color:#0F172A; font-weight:bold; padding:10px 25px; border-radius:8px; cursor:pointer; border:none;" onclick="
                            if('${pair.b}' === '${target}') { Workspace.Ingles.superarErro(Workspace.Ingles.desafioAtualObj.id); Workspace.Ingles.sucessoGenerico(75); } 
                            else { Workspace.Ingles.registrarErro(Workspace.Ingles.desafioAtualObj, 'minimal'); Workspace.Ingles.falhaGenerica(); }
                        ">${pair.b}</button>
                    </div>
                </div>
            </div>
        `;
    },

    renderGameSentenceShuffle: () => {
        Workspace.Ingles.desafioAtualObj = Workspace.Ingles.obterItemInteligente(Workspace.Ingles.state.phrases, 'phrase');
        const phrase = Workspace.Ingles.desafioAtualObj;
        const task = ['Transforme numa Pergunta','Transforme numa Negativa'][Math.floor(Math.random()*2)];
        
        document.getElementById('ig-modalBody').innerHTML = `
            <div style="text-align:center"><span class="ig-badge" style="background:#0F172A; color:white; padding:6px 15px;">🎯 Missão: ${task}</span></div>
            <div class="ig-big-phrase" style="margin-top:15px; font-size:18px;">${phrase.phrase}</div>
            <textarea id="ig-input" class="ig-textarea" placeholder="Sua frase aqui..."></textarea>
            <button class="ws-btn" style="width:100%; background:#4F46E5; color:white; margin-top:15px; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="Workspace.Ingles.envioAoProfessor('sentenceShuffle', document.getElementById('ig-input').value, 50)">Submeter 🔀</button>
        `;
    },

    renderGameAnswerQuest: () => {
        Workspace.Ingles.desafioAtualObj = Workspace.Ingles.obterItemInteligente(Workspace.Ingles.defaults.questions, 'question');
        const q = Workspace.Ingles.desafioAtualObj;
        
        document.getElementById('ig-modalBody').innerHTML = `
            <div class="ig-big-phrase" style="background:#FEF3C7; border-color:#F59E0B; color:#92400E;">❓ ${q.text}</div>
            <textarea id="ig-input" class="ig-textarea" placeholder="Responda em inglês..."></textarea>
            <button class="ws-btn" style="width:100%; margin-top:15px; background:#F59E0B; color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="Workspace.Ingles.envioAoProfessor('answerQuest', document.getElementById('ig-input').value, 50)">Enviar 🚀</button>
        `;
    },

    renderGameQuestionMaker: () => {
        const poolAnswers = Workspace.Ingles.state.pool.filter(p=>p.type==='answerQuest').map(p=>({ id: p.id, text: p.text }));
        
        // Se a piscina global de alunos estiver vazia, usa uma resposta padrão forte
        const defaultAnswer = { id: 'fallback1', text: 'I go to the gym because I want to be healthy.' };
        Workspace.Ingles.desafioAtualObj = poolAnswers.length > 0 ? Workspace.Ingles.obterItemInteligente(poolAnswers, 'qmaker') : defaultAnswer;
        const a = Workspace.Ingles.desafioAtualObj;

        document.getElementById('ig-modalBody').innerHTML = `
            <p style="color:#64748B;font-size:13px;text-align:center; font-weight:bold; text-transform:uppercase;">Um aluno respondeu isto:</p>
            <div class="ig-big-phrase" style="background:#EEF2FF; color:#4F46E5; font-style:italic;">💬 "${a.text}"</div>
            <p style="margin-top:16px;font-weight:600; text-align:center;">Que pergunta em inglês gerou esta resposta?</p>
            <textarea id="ig-input" class="ig-textarea" placeholder="Ex: Why do you..."></textarea>
            <button class="ws-btn" style="width:100%; background:#4F46E5; color:white; margin-top:15px; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="
                const v = document.getElementById('ig-input').value.trim();
                if(v.includes('?') && v.split(' ').length >= 3) { 
                    Workspace.Ingles.envioAoProfessor('questionMaker', v, 50); 
                } else { 
                    Workspace.mostrarAviso('Atenção: A tua pergunta tem de conter (?) e pelo menos 3 palavras!', 'error'); 
                }
            ">Verificar ❓</button>
        `;
    },

    renderGameContextRole: () => {
        Workspace.Ingles.desafioAtualObj = Workspace.Ingles.obterItemInteligente(Workspace.Ingles.defaults.roleplays, 'roleplay');
        const c = Workspace.Ingles.desafioAtualObj;
        
        document.getElementById('ig-modalBody').innerHTML = `
            <div class="ig-big-phrase" style="font-size:18px; text-align:left;">${c.title}<br><br><span style="font-size:15px;font-weight:400;color:#64748B">${c.prompt}</span></div>
            <p style="font-size:13px;background:#FEF3C7; color:#92400E; padding:10px; border-radius:8px; font-weight:bold;">💡 Dica de Mestre: ${c.tip}</p>
            <textarea id="ig-input" class="ig-textarea" placeholder="O que dizes?..."></textarea>
            <button class="ws-btn" style="width:100%; margin-top:15px; background:#10B981; color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="Workspace.Ingles.envioAoProfessor('contextRole', document.getElementById('ig-input').value, 60)">Assumir Papel 🎭</button>
        `;
    },

    renderGameDebateAI: () => {
        Workspace.Ingles.desafioAtualObj = Workspace.Ingles.obterItemInteligente(Workspace.Ingles.defaults.debates, 'debate');
        const topic = Workspace.Ingles.desafioAtualObj;
        
        document.getElementById('ig-modalBody').innerHTML = `
            <div class="ig-big-phrase" style="font-size:18px">🤖 Clube de Debate<br><br><span style="font-size:16px;color:#4F46E5;">${topic.topic}</span></div>
            <textarea id="ig-input" class="ig-textarea" placeholder="Defende a tua posição..."></textarea>
            <button class="ws-btn" style="width:100%; background:#0F172A; color:white; margin-top:15px; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="Workspace.Ingles.envioAoProfessor('debateAI', document.getElementById('ig-input').value, 75)">Contra-Atacar 🧠</button>
        `;
    }
};