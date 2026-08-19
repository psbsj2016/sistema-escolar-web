// js/modulos/workspace/ingles.js
window.Workspace = window.Workspace || {};

Workspace.Ingles = {
    state: {
        xp: 0, streak: 1, words: [], phrases: [], quizzes: [], pictures: [], minimalPairs: [], debates: [], submissions: [], pool: [],
        errosRetidos: [], 
        itensConcluidos: [],
        magoPhrases: [], 
        magoConfig: { vozAtiva: true, modoExibicao: 'aleatorio' } 
    },
    mediaRecorder: null, audioChunks: [], currentAudioURL: null, audioBlob: null, streamMicrofone: null, recognition: null,
    
    // 🚀 VARIÁVEIS DE GAMIFICAÇÃO E TEMPO GLOBAL
    bauDestrancado: false, 
    tempoGlobalDefinido: false, 
    sessaoEncerrada: false,     
    jogoAtual: null,
    tempoRestante: 0,
    timerGlobal: null,          
    xpGanhosNaSessao: 0,
    desafioAtualObj: null,
    digitandoAtivo: false,      
    magoIntervalTimer: null, 
    sseListenerConfigurado: false, 

    defaults: {
        magoConfig: { vozAtiva: true, modoExibicao: 'aleatorio' },
        magoPhrases: [
            { id: 'm1', text: 'Saudações, (citarAluno)! 🎓 O conhecimento é o maior dos tesouros. Que os teus reflexos sejam rápidos!' },
            { id: 'm2', text: 'Bem-vindo à tua provação, (citarAluno)! Sinto uma aura de sabedoria à tua volta. 🧙‍♂️' },
            { id: 'm3', text: 'Os segredos da magia aguardam, (citarAluno). 🗝️ Escolhe o teu primeiro desafio!' }
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
        // 🚀 O BATISMO MÁGICO DOS JOGOS (RPG)
        games: [
            {id:'wordSpark', title:'🪄 Feitiço das Palavras', desc:'Invoque uma frase com a palavra-chave. Deteção de Magia IA.', icon:'🪄', color:'#E0E7FF', level:'B1-B2'},
            {id:'readAloud', title:'🐉 Sopro do Dragão', desc:'Fale ao microfone e a IA avaliará o poder da sua pronúncia.', icon:'🐉', color:'#D1FAE5', level:'A2-C1'},
            {id:'listenType', title:'🦉 Ecos da Coruja', desc:'Escute o áudio misterioso e transcreva sem errar.', icon:'🦉', color:'#FEF3C7', level:'A2-B1'},
            {id:'quiz', title:'👁️ Enigma da Esfinge', desc:'Responda corretamente para não perder energia vital.', icon:'👁️', color:'#FEE2E2', level:'A1-B2'},
            {id:'wordPicker', title:'🧪 Poção Sintática', desc:'Gramática rigorosa. Escolha o ingrediente (palavra) certo.', icon:'🧪', color:'#E0E7FF', level:'A2-B1'},
            {id:'sentenceShuffle', title:'🌀 Labirinto Ilusório', desc:'Sorteio de frases. Transforme-as para escapar!', icon:'🌀', color:'#D1FAE5', level:'B1-B2'},
            {id:'answerQuest', title:'📜 Pergaminho do Herói', desc:'Responda abertamente. O Mestre avaliará a sua sabedoria.', icon:'📜', color:'#FEF3C7', level:'B1-C1'},
            {id:'questionMaker', title:'🔮 Espelho do Oráculo', desc:'Formule a pergunta em inglês que revela a resposta oculta.', icon:'🔮', color:'#F5D0FE', level:'B1-B2'},
            {id:'contextRole', title:'🎭 Manto do Metamorfo', desc:'Assuma a identidade do personagem. O Mestre avalia a atuação.', icon:'🎭', color:'#CCFBF1', level:'B1-C1'},
            {id:'debateAI', title:'⚔️ Duelo de Mentes', desc:'Enfrente a Inteligência Artificial num debate denso e argumentativo.', icon:'⚔️', color:'#E0F2FE', level:'B2-C1'},
            {id:'minimalPairs', title:'♊ Sussurros Gêmeos', desc:'Teste de audição extrema: diferencie sons quase idênticos.', icon:'♊', color:'#FFEDD5', level:'B1-C1'},
            {id:'picturePop', title:'👁️‍🗨️ Visão do Alquimista', desc:'Deteção de voz: Invoque o nome exato da relíquia (imagem).', icon:'👁️‍🗨️', color:'#DCFCE7', level:'A1-B1'}
        ]
    },

    init: () => {
        Workspace.Ingles.injetarCSS();
        Workspace.Ingles.construirHTML();
        
        // 📡 A ANTENA DE TEMPO REAL
        if (!Workspace.Ingles.sseListenerConfigurado && Workspace.usuario) {
            const escolaId = Workspace.usuario.escolaId || 'DEFAULT';
            const evtSource = new EventSource(`/api/workspace/stream?escolaId=${escolaId}`);
            evtSource.onmessage = (event) => {
                try {
                    const dados = JSON.parse(event.data);
                    if (dados.type === 'BAU_INGLES_UPDATE') {
                        Workspace.Ingles.sincronizarTempoReal();
                    }
                } catch(e) {}
            };
            Workspace.Ingles.sseListenerConfigurado = true;
        }

        if('speechSynthesis' in window) window.speechSynthesis.getVoices(); 
    },

    abrirBau: () => { Workspace.navegarPara('ingles'); },

    sincronizarTempoReal: async () => {
        await Workspace.Ingles.loadDados();
        const telaHub = document.getElementById('ig-alunoView');
        if (telaHub && telaHub.style.display !== 'none' && Workspace.usuario.tipo === 'Aluno') {
            Workspace.Ingles.iniciarFalaGuardiao(true); 
        }
        const activeTab = document.querySelector('.ig-side-item.active');
        if (activeTab && Workspace.usuario.tipo !== 'Aluno') {
            Workspace.Ingles.renderProfessorTab(activeTab.dataset.tab);
        }
    },

    loadDados: async () => {
        try {
            const escolaId = Workspace.usuario.escolaId || 'DEFAULT';
            const res = await Workspace.api(`/workspace/ingles/dados?escolaId=${escolaId}`, 'GET');
            
            // 🚀 CORREÇÃO: Agora o sistema carrega os dados independentemente de haver palavras ou não!
            if (res && res.success && res.dados) {
                const d = res.dados;
                Workspace.Ingles.state.words = Array.isArray(d.words) && d.words.length > 0 ? d.words : Workspace.Ingles.defaults.words;
                Workspace.Ingles.state.phrases = Array.isArray(d.phrases) && d.phrases.length > 0 ? d.phrases : Workspace.Ingles.defaults.phrases;
                Workspace.Ingles.state.quizzes = Array.isArray(d.quizzes) && d.quizzes.length > 0 ? d.quizzes : Workspace.Ingles.defaults.quizzes;
                Workspace.Ingles.state.pictures = Array.isArray(d.pictures) && d.pictures.length > 0 ? d.pictures : Workspace.Ingles.defaults.pictures;
                Workspace.Ingles.state.submissions = Array.isArray(d.submissions) ? d.submissions : [];
                Workspace.Ingles.state.pool = Array.isArray(d.pool) ? d.pool : [];
                Workspace.Ingles.state.errosRetidos = Array.isArray(d.errosRetidos) ? d.errosRetidos : [];
                Workspace.Ingles.state.magoPhrases = Array.isArray(d.magoPhrases) && d.magoPhrases.length > 0 ? d.magoPhrases : Workspace.Ingles.defaults.magoPhrases;
                
                // Salva o comportamento exato do Mago escolhido pelo Professor!
                Workspace.Ingles.state.magoConfig = (d.magoConfig && typeof d.magoConfig === 'object') ? d.magoConfig : Workspace.Ingles.defaults.magoConfig;
            } else {
                Workspace.Ingles.state.words = [...Workspace.Ingles.defaults.words];
                Workspace.Ingles.state.phrases = [...Workspace.Ingles.defaults.phrases];
                Workspace.Ingles.state.quizzes = [...Workspace.Ingles.defaults.quizzes];
                Workspace.Ingles.state.pictures = [...Workspace.Ingles.defaults.pictures];
                Workspace.Ingles.state.submissions = [];
                Workspace.Ingles.state.pool = [];
                Workspace.Ingles.state.errosRetidos = [];
                Workspace.Ingles.state.magoPhrases = [...Workspace.Ingles.defaults.magoPhrases];
                Workspace.Ingles.state.magoConfig = { ...Workspace.Ingles.defaults.magoConfig };
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
                errosRetidos: Workspace.Ingles.state.errosRetidos, magoPhrases: Workspace.Ingles.state.magoPhrases,
                magoConfig: Workspace.Ingles.state.magoConfig 
            });
        } catch (e) {}
    },

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
        // 🚀 HIGIENE DE DADOS: Garante que os arrays não estão corrompidos
        const concluidos = Workspace.Ingles.state.itensConcluidos || [];
        const retidos = Workspace.Ingles.state.errosRetidos || [];
        
        let listaDisponivel = listaPadrao.filter(item => !concluidos.includes(item.id));
        
        if (listaDisponivel.length === 0 && listaPadrao.length > 0) {
            Workspace.mostrarAviso("🏆 Incrível! Dominaste este nível da magia. Vamos rever!", "success");
            Workspace.Ingles.state.itensConcluidos = [];
            Workspace.Ingles.saveDados();
            listaDisponivel = listaPadrao;
        }
        
        const listaErros = retidos.filter(e => e._tipoDefeito === tipoConteudo && !concluidos.includes(e.id));
        if (listaErros.length > 0 && Math.random() < 0.60) {
            return listaErros[Math.floor(Math.random() * listaErros.length)];
        }
        
        return listaDisponivel[Math.floor(Math.random() * listaDisponivel.length)] || listaPadrao[0];
    },

    // ============================================================================
    // 🗣️ FERRAMENTAS NATIVAS DE VOZ (Inteligência Mobile/Desktop)
    // ============================================================================
    falar: (text, lang='pt-BR', pitch = 1.0, rate = 0.95, isMago = false) => {
        if(!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        
        const u = new SpeechSynthesisUtterance(text); 
        u.lang = lang; 
        
        const voices = window.speechSynthesis.getVoices();
        let vozSelec = null;

        // 📱 DETEÇÃO DE DISPOSITIVO MÓVEL: Essencial para não quebrar motores de voz simples
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMago) {
            // 🧙‍♂️ O FEITIÇO DA VOZ DO MAGO: Se for mobile, mantemos o tom natural (1.0) para evitar som robótico.
            u.pitch = isMobile ? 1.0 : 0.85; 
            u.rate = isMobile ? 1.0 : 0.85; 
            const vozesPT = voices.filter(v => v.lang.includes('pt'));
            vozSelec = vozesPT.find(v => v.name.toLowerCase().includes('antonio') || v.name.toLowerCase().includes('daniel') || v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('masculino')) || vozesPT[0];
        } else {
            // 🇺🇸 Voz Americana Premium para os Jogos
            u.pitch = pitch;
            u.rate = rate;
            const idiomaPrincipal = lang.split('-')[0];
            vozSelec = voices.find(v => v.lang.includes(idiomaPrincipal) && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))) || voices.find(v => v.lang.includes(idiomaPrincipal)) || voices.find(v => v.lang.includes('en')) || voices[0];
        }

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

   // ============================================================================
    // 🎨 CSS MÁGICO (Design Imersivo, Partículas e Responsividade Mobile)
    // ============================================================================
    injetarCSS: () => {
        if(document.getElementById('ws-ingles-css')) return;
        const style = document.createElement('style');
        style.id = 'ws-ingles-css';
        style.innerHTML = `
            /* FONTES E CORES GERAIS RPG */
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=VT323&display=swap');
            
            #ws-ingles-container { background: #F8FAFC; border-radius: 16px; overflow: hidden; min-height: 80vh; position: relative; }
            
            /* 🛡️ NOVO HUD DE RPG (CABEÇALHO EM DUAS LINHAS) */
            .ig-header { background: #1a1a2e; padding: 15px 30px; border-bottom: 4px solid #f1c40f; box-shadow: 0 4px 15px rgba(0,0,0,0.5); z-index: 10; position: relative; display: flex; flex-direction: column; gap: 15px;}
            .ig-header-linha { display: flex; justify-content: space-between; align-items: center; width: 100%; }
            .ig-header-linha-base { display: flex; justify-content: space-between; align-items: flex-end; width: 100%; }
            
            .ig-title-box h2 { font-family: 'Cinzel', serif; margin:0; font-size:26px; color:#f1c40f; text-shadow: 2px 2px 4px #000; letter-spacing: 1px;}
            .ig-title-box p { margin:0; font-size:12px; color:#a0a0b0; font-family: monospace; text-transform: uppercase;}
            .ig-bau-topo { width: 75px; height: auto; mix-blend-mode: screen; transition: 0.3s; filter: drop-shadow(0 0 10px #f1c40f); }
            
            .ig-status-coluna { display: flex; flex-direction: column; gap: 6px; align-items: flex-end; }
            .ig-hud-stat { display: flex; align-items: center; gap: 8px; background: rgba(0, 0, 0, 0.4); padding: 4px 12px; border-radius: 6px; border: 1px solid rgba(212,175,55,0.3); color: #fff; font-family: 'VT323', monospace; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;}
            .ig-hud-stat span { color: #f1c40f; font-weight: bold; font-size: 24px; text-shadow: 1px 1px 0 #000;}
            
            .ig-global-timer { font-family: 'VT323', monospace; font-size: 28px; color: #ff4757; text-shadow: 1px 1px 0 #000; display: none; align-items: center; justify-content: center; letter-spacing: 2px; background: rgba(0,0,0,0.5); padding: 6px 15px; border-radius: 8px; border: 1px dashed #ff4757; margin-bottom: 4px;}

            /* GRELHA DE JOGOS */
            .ig-games-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; padding: 0 0 30px 0; }
            .ig-game-card { background: #fffcf0; border: 2px solid #d4af37; border-radius: 8px; padding: 20px; cursor: pointer; transition: 0.3s; position: relative; box-shadow: inset 0 0 20px rgba(212, 175, 55, 0.1), 0 4px 6px rgba(0,0,0,0.1); }
            .ig-game-card:hover { transform: translateY(-5px); box-shadow: inset 0 0 20px rgba(212, 175, 55, 0.3), 0 10px 15px rgba(212, 175, 55, 0.4); border-color: #f1c40f; }
            .ig-top { display: flex; justify-content: space-between; margin-bottom: 15px; }
            .ig-icon { width: 50px; height: 50px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 28px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); border: 1px solid rgba(0,0,0,0.1); }
            .ig-game-card h3 { font-family: 'Cinzel', serif; color: #2c3e50; font-size: 18px; font-weight: bold; margin-bottom: 8px; border-bottom: 1px dashed #d4af37; padding-bottom: 5px; }
            .ig-badge { font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 4px; border: 1px solid currentColor; }
            .ig-badge-level { background: #1a1a2e; color: #f1c40f; }
            
            /* 🚀 EXPLOSÃO DO BAÚ E PARTÍCULAS */
            .chest-shake { animation: chestShake 0.4s ease-in-out infinite; }
            @keyframes chestShake { 0%, 100% { transform: translate(1px, -2px) rotate(-5deg); } 50% { transform: translate(-1px, 2px) rotate(5deg); } }
            .chest-explode { animation: chestExplode 1s ease-out forwards; }
            @keyframes chestExplode { 0% { transform: scale(1); filter: brightness(1) drop-shadow(0 0 10px #f1c40f); } 20% { transform: scale(3) translateY(20px); filter: brightness(2.5) drop-shadow(0 0 100px #fff); } 100% { transform: scale(1); filter: drop-shadow(0 0 15px #f1c40f); } }
            @keyframes shockwave { 0% { transform: translate(-50%, -50%) scale(1); opacity: 1; border: 5px solid #fff; } 100% { transform: translate(-50%, -50%) scale(400); opacity: 0; border: 80px solid #e67e22; } }
            .ig-fireball { position: fixed; border-radius: 50%; box-shadow: 0 0 15px currentColor, 0 0 40px currentColor; pointer-events: none; z-index: 9999999; animation: shootParticle 1.5s cubic-bezier(0.1, 0.8, 0.2, 1) forwards; }
            .ig-sparkle { position: fixed; clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); box-shadow: 0 0 10px #fff, 0 0 30px #f1c40f; pointer-events: none; z-index: 9999999; animation: shootParticle 2s cubic-bezier(0.1, 0.8, 0.2, 1) forwards; }
            .ig-magic-dust { position: fixed; border-radius: 50%; background: #fff; box-shadow: 0 0 5px #fff, 0 0 15px #f1c40f; pointer-events: none; z-index: 9999999; animation: shootParticle 2.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards; }
            @keyframes shootParticle { 0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) scale(0) rotate(1080deg); opacity: 0; } }
            
            /* 🧙‍♂️ CENÁRIO INICIAL (PREPARAÇÃO) */
            .ig-guardian-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 55vh; position: relative; background: radial-gradient(circle at center, #1a0b2e 0%, #000 100%); overflow: hidden; border-radius: 0 0 16px 16px; border: 4px solid #333; box-shadow: inset 0 0 50px rgba(0,0,0,0.8); padding: 30px 20px;}
            .ig-guardian-stars { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: transparent url('data:image/svg+xml;utf8,<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="1" fill="white" opacity="0.3"/><circle cx="150" cy="80" r="1.5" fill="white" opacity="0.5"/><circle cx="80" cy="180" r="1" fill="white" opacity="0.2"/></svg>') repeat; z-index: 0; animation: starDrift 60s linear infinite; }
            @keyframes starDrift { from { background-position: 0 0; } to { background-position: -1000px 500px; } }
            .ig-prep-layout { display: flex; align-items: center; justify-content: center; gap: 25px; max-width: 700px; width: 100%; z-index: 2; margin-bottom: 20px; }
            img.ig-guardian-avatar { width: 130px; height: auto; animation: flutuarMago 4s ease-in-out infinite; filter: drop-shadow(0 0 30px rgba(142, 68, 173, 0.8)); mix-blend-mode: screen; flex-shrink: 0; }
            @keyframes flutuarMago { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); filter: drop-shadow(0 0 40px rgba(142, 68, 173, 1)); } }
            .ig-balao-fala-static { background: linear-gradient(180deg, #0f172a 0%, #000 100%); padding: 20px 25px; border-radius: 12px; border: 3px solid #f1c40f; box-shadow: 0 0 0 2px #000, inset 0 0 0 1px rgba(255,255,255,0.2), 0 15px 35px rgba(0,0,0,0.8); position: relative; text-align: left; font-family: 'VT323', monospace; font-size: 24px; color: #fff; line-height: 1.3; text-shadow: 2px 2px 0px #000; flex: 1; opacity: 0; transform: translateY(20px) scale(0.9); transform-origin: left center; animation: balaoRise 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
            @keyframes balaoRise { to { opacity: 1; transform: translateY(0) scale(1); } }
            .ig-balao-fala-static::before { content: ''; position: absolute; top: 50%; left: -15px; transform: translateY(-50%); border-width: 12px 15px 12px 0; border-style: solid; border-color: transparent #000 transparent transparent; z-index: 2; }
            .ig-balao-fala-static::after { content: ''; position: absolute; top: 50%; left: -20px; transform: translateY(-50%); border-width: 15px 20px 15px 0; border-style: solid; border-color: transparent #f1c40f transparent transparent; z-index: 1; }
            .ig-opcoes-tempo { display: flex; gap: 15px; align-items: stretch; justify-content: center; z-index: 2; }
            
            /* 🧙‍♂️ BANNER DO HUB DE JOGOS (NOVO DESIGN TIPO CARTA) */
            .ig-hub-banner { display: flex; align-items: center; gap: 20px; padding: 20px 30px; background: radial-gradient(circle at left, #1a0b2e 0%, #000 100%); border-radius: 12px; margin-bottom: 25px; border: 3px solid #d4af37; box-shadow: 0 8px 20px rgba(0,0,0,0.5), inset 0 0 20px rgba(212,175,55,0.2); position: relative; overflow: hidden; }
            img.ig-hub-mago-img { width: 100px; height: auto; animation: flutuarMago 4s ease-in-out infinite; filter: drop-shadow(0 0 20px rgba(142, 68, 173, 0.8)); mix-blend-mode: screen; z-index: 2; flex-shrink: 0;}
            
            .ig-hub-banner-content { flex: 1; z-index: 2; display: flex; flex-direction: column; justify-content: center;}
            .ig-hub-banner h1 { font-family: 'Cinzel', serif; color:#f1c40f; font-size:28px; margin:0 0 5px 0; text-shadow: 2px 2px 4px #000; line-height: 1.1;}
            .ig-hub-banner p { color:#cbd5e1; font-size:14px; margin:0 0 10px 0;}
            
            .ig-balao-fala-hub { background: linear-gradient(180deg, #0f172a 0%, #000 100%); padding: 12px 20px; border-radius: 8px; border: 2px solid #f1c40f; box-shadow: 0 0 0 2px #000, inset 0 0 0 1px rgba(255,255,255,0.2), 0 5px 15px rgba(0,0,0,0.8); position: relative; width: 100%; text-align: left; font-family: 'VT323', monospace; font-size: 20px; color: #fff; line-height: 1.3; text-shadow: 2px 2px 0px #000; margin-top: 5px;}
            .ig-balao-fala-hub::before { content: ''; position: absolute; top: 15px; left: -10px; border-width: 8px 10px 8px 0; border-style: solid; border-color: transparent #000 transparent transparent; z-index: 2;}
            .ig-balao-fala-hub::after { content: ''; position: absolute; top: 13px; left: -14px; border-width: 10px 14px 10px 0; border-style: solid; border-color: transparent #f1c40f transparent transparent; z-index: 1;}
            
            /* Modais e Professor */
            .ig-input, .ig-textarea { width: 100%; padding: 12px 15px; border: 1px solid #E2E8F0; border-radius: 10px; font-family: inherit; font-size: 14px; outline: none; transition: 0.2s; box-sizing: border-box; }
            .ig-sidebar { width: 250px; background: #fff; border-right: 1px solid #E2E8F0; padding: 20px; display:flex; flex-direction:column; gap:5px; }
            .ig-side-item { background: transparent; border: none; padding: 12px 15px; border-radius: 10px; text-align: left; font-weight: bold; color: #64748B; cursor: pointer; transition: 0.2s; }
            .ig-side-item.active { background: #0F172A; color: #fff; }
            .ig-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
            .ig-list-item { display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee; align-items:center; }
            .ig-big-phrase { font-size: 22px; font-weight: bold; text-align: center; padding: 20px; background: #F8FAFC; border: 1px dashed #E2E8F0; border-radius: 14px; margin: 15px 0; color: #1E293B; }
            
            /* 📱 RESPONSIVIDADE MAXIMIZADA PARA TELEMÓVEL (HUD e Carta do Mago) */
            @media (max-width: 768px) { 
                /* O HUD agora é super limpo no mobile */
                .ig-header { padding: 15px; gap: 15px; }
                .ig-title-box h2 { font-size: 20px; }
                .ig-title-box p { font-size: 10px; }
                .ig-bau-topo { width: 65px; }
                .ig-hud-stat { font-size: 14px; padding: 2px 10px; gap: 6px;}
                .ig-hud-stat span { font-size: 18px; }
                .ig-global-timer { font-size: 24px; padding: 4px 12px; }
                
                .ig-guardian-container { min-height: 65vh; padding: 40px 15px 30px 15px; justify-content: space-around; }
                .ig-prep-layout { flex-direction: row; gap: 12px; margin-bottom: 0; }
                img.ig-guardian-avatar { width: 90px; }
                .ig-balao-fala-static { font-size: 18px; padding: 12px 15px; }
                .ig-opcoes-tempo { flex-wrap: nowrap; gap: 10px; margin-top: 20px; width: 100%; max-width: 350px;}
                
                /* 🚀 O BANNER DO MAGO COMO CARTA (Tudo cabe na tela sem scroll) */
                .ig-hub-banner { flex-direction: row; padding: 12px; gap: 12px; border-radius: 10px; align-items: center; margin-bottom: 15px;}
                img.ig-hub-mago-img { width: 75px; align-self: flex-start;}
                
                .ig-hub-banner h1 { font-size: 18px; margin-bottom: 2px;}
                /* Esconde o texto secundário para dar total foco à fala do mago e economizar espaço */
                .ig-hub-banner p { display: none; } 
                
                .ig-balao-fala-hub { font-size: 16px; padding: 10px 12px; margin-top: 0; }
                .ig-balao-fala-hub::before, .ig-balao-fala-hub::after { display: none; }
                
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
            if (painelPrincipal && painelPrincipal.parentNode) painelPrincipal.parentNode.appendChild(container);
        }

        container.innerHTML = `
            <div class="ig-header">
                <div class="ig-title">
                    <img id="ig-header-chest" src="/assets/bau_roxo_pixel.png" onerror="this.onerror=null; this.src='/public/assets/bau_roxo_pixel.png';" alt="Baú" style="width: 55px; height: auto; mix-blend-mode: screen; transition: 0.3s; filter: drop-shadow(0 0 10px #f1c40f);" />
                    <div><h2>Baú do Inglês</h2><p>Treinamento Épico Adaptativo</p></div>
                </div>
                <div class="ig-rpg-hud">
                    <div id="ig-global-timer-display" class="ig-global-timer">00:00</div>
                    <div class="ig-hud-stat">🔥 <span id="ig-streakCount">1</span> Dias</div>
                    <div class="ig-hud-stat">⭐ <span id="ig-xpCount">0</span> XP</div>
                </div>
            </div>

            <div id="ig-guardian-screen" class="ig-guardian-container" style="display:none; transition: opacity 0.5s ease-out;">
                <div class="ig-guardian-stars"></div>
                
                <div class="ig-prep-layout">
                    <img src="/assets/mago_bau_ingles.png" onerror="this.onerror=null; this.src='/public/assets/mago_bau_ingles.png';" class="ig-guardian-avatar" alt="Mago" />
                    
                    <div class="ig-balao-fala-static">
                        <span style="color: #f1c40f; font-weight: 900;">Mestre Mago:</span><br/>
                        <span style="color: #e2e8f0; font-size: 0.9em;">O feitiço requer o teu tempo de foco. Quantos minutos vais treinar hoje?</span>
                    </div>
                </div>
                
                <div class="ig-opcoes-tempo" id="ig-guardian-options" style="opacity: 1; pointer-events: auto;">
                    <div style="display: flex; align-items: center; gap: 6px; background: rgba(0,0,0,0.8); padding: 5px 10px; border-radius: 8px; border: 2px solid #f1c40f; box-shadow: 0 4px 15px rgba(0,0,0,0.8); flex: 1; justify-content: center;">
                        <input type="number" id="ig-tempo-escolhido" placeholder="15" min="1" max="120" style="width: 50px; border: none; box-shadow: none; font-size: 26px; font-family: 'VT323', monospace; color: #f1c40f; background: transparent; text-align: center; padding: 0; outline: none; text-shadow: 2px 2px 0 #000;">
                        <span style="font-size: 20px; font-family: 'VT323', monospace; color: #fff; text-shadow: 2px 2px 0 #000;">MIN</span>
                    </div>
                    <button class="ws-btn" style="flex: 1; display:flex; align-items:center; justify-content:center; background: linear-gradient(180deg, #d4af37, #996515); color:#fff; font-family: 'Cinzel', serif; font-size:16px; font-weight:bold; border: 2px solid #fff; padding:10px 15px; border-radius:8px; cursor:pointer; transition:0.2s; box-shadow: 0 4px 0 #000, inset 0 2px 4px rgba(255,255,255,0.5);" onmouseover="this.style.transform='translateY(2px)'; this.style.boxShadow='0 2px 0 #000, inset 0 2px 4px rgba(255,255,255,0.5)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 0 #000, inset 0 2px 4px rgba(255,255,255,0.5)';" onclick="
                        const campoTempo = document.getElementById('ig-tempo-escolhido');
                        const minutos = parseInt(campoTempo.value) || 0;
                        if (minutos <= 0) {
                            Workspace.mostrarAviso('O Mestre avisa: Digita um tempo de treino válido!', 'warning');
                            campoTempo.focus();
                        } else {
                            Workspace.Ingles.abrirBauMagico(minutos);
                        }
                    ">Aceitar ⚔️</button>
                </div>
            </div>

            <div id="ig-alunoView" style="display:none; padding: 30px 30px 40px 30px;">
                <div class="ig-hub-banner">
                    <div class="ig-guardian-stars"></div>
                    
                    <img src="/assets/mago_bau_ingles.png" onerror="this.onerror=null; this.src='/public/assets/mago_bau_ingles.png';" class="ig-hub-mago-img" alt="Mago" />
                    
                    <div style="flex: 1; z-index: 2;">
                        <h1 style="font-family: 'Cinzel', serif; color:#f1c40f; font-size:32px; margin:0 0 10px 0; text-shadow: 2px 2px 4px #000;">A tua jornada começou! ⏳</h1>
                        <p style="color:#cbd5e1; font-size:16px; margin:0;">Escolha um pergaminho ou poção. A Inteligência guardará os teus erros para os refazeres. Domina a magia!</p>
                        <div class="ig-balao-fala-hub" id="ig-hub-mago-text" style="display:none;"></div>
                    </div>
                </div>
                <div id="ig-gamesGrid" class="ig-games-grid"></div>
            </div>

            <div id="ig-timeout-screen" style="display:none; flex-direction:column; align-items:center; justify-content:center; min-height:60vh; background:#F8FAFC; text-align:center;">
                <img src="/assets/bau_roxo_pixel.png" onerror="this.onerror=null; this.src='/public/assets/bau_roxo_pixel.png';" alt="Baú Fechado" style="width: 140px; mix-blend-mode: screen; filter: grayscale(100%) opacity(0.6); margin-bottom: 20px;" />
                <h1 style="font-family: 'Cinzel', serif; font-size:36px; color:#1E293B; margin-bottom:10px;">O tempo esgotou!</h1>
                <p style="color:#64748B; margin-bottom:20px; font-size: 18px;">O Baú fechou-se magicamente. Missão Concluída!</p>
                <div style="background:#1a1a2e; border:4px solid #d4af37; padding:25px; border-radius:8px; display:inline-block; margin-bottom:30px; box-shadow: 0 10px 20px rgba(0,0,0,0.3);">
                    <div style="font-size:16px; color:#fff; font-family: 'VT323', monospace; text-transform:uppercase; letter-spacing: 2px;">XP Ganho Hoje</div>
                    <div style="font-size:42px; font-family: 'VT323', monospace; color:#f1c40f; text-shadow: 2px 2px 0 #000;" id="ig-timeout-xp">+0 XP ⭐</div>
                </div>
                <button class="ws-btn" style="background: linear-gradient(180deg, #d4af37, #996515); color:#fff; font-family: 'Cinzel', serif; padding:12px 35px; border-radius:4px; font-size: 18px; font-weight:bold; border: 2px solid #fff; cursor:pointer; box-shadow: 0 4px 0 #000;" onclick="Workspace.Ingles.encerrarSessaoBau()">Guardar e Sair</button>
            </div>

            <div id="ig-professorView" style="display: none; min-height: 70vh;">
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
                <div class="ws-card" style="width:90%; max-width:650px; background:#fffcf0; border: 4px solid #d4af37; border-radius:8px; overflow:hidden; padding:0; display:flex; flex-direction:column; max-height:90vh; box-shadow:0 25px 50px rgba(0,0,0,0.8), inset 0 0 30px rgba(212,175,55,0.2);">
                    <div style="padding: 20px 25px; border-bottom: 2px dashed #d4af37; display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.5);">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span id="ig-modalIcon" style="font-size: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));"></span>
                            <h2 id="ig-modalTitle" style="margin: 0; color: #0F172A; font-family: 'Cinzel', serif; font-size: 22px; font-weight: bold;"></h2>
                        </div>
                        <button onclick="Workspace.Ingles.fecharJogo()" style="background:transparent; border:none; font-size:30px; cursor:pointer; color:#64748B; transition: 0.2s;" onmouseover="this.style.color='#e74c3c'" onmouseout="this.style.color='#64748B'">×</button>
                    </div>
                    <div id="ig-modalBody" style="padding: 30px; overflow-y: auto; flex: 1;"></div>
                </div>
            </div>
        `;
    },

    // 🚀 HIGIENE VISUAL ABSOLUTA 
    renderizarVisualizacao: () => {
        document.getElementById('ig-xpCount').textContent = Workspace.Ingles.state.xp;
        document.getElementById('ig-streakCount').textContent = Workspace.Ingles.state.streak;
        
        const isAluno = Workspace.usuario.tipo === 'Aluno';
        
        // Restaura o baú do cabeçalho caso tenha saído após explodir
        const chest = document.getElementById('ig-header-chest');
        if (chest) {
            chest.classList.remove('chest-shake', 'chest-explode');
            chest.style.transform = 'scale(1)';
            
            // 🚀 O FEITIÇO DO RESET: Garante que a imagem volta a ser o Baú Fechado!
            chest.src = '/assets/bau_roxo_pixel.png';
            chest.onerror = function() { 
                this.onerror=null; 
                this.src='/public/assets/bau_roxo_pixel.png'; 
            };
        }
        
        if (!isAluno) {
            document.getElementById('ig-professorView').style.display = 'flex';
            document.getElementById('ig-alunoView').style.display = 'none';
            document.getElementById('ig-guardian-screen').style.display = 'none';
            document.getElementById('ig-timeout-screen').style.display = 'none';
            
            const abaSalva = localStorage.getItem('ws_ingles_aba_prof') || 'envios';
            Workspace.Ingles.renderProfessorTab(abaSalva); 
        } else {
            document.getElementById('ig-professorView').style.display = 'none';

            // Oculta tudo primeiro
            document.getElementById('ig-guardian-screen').style.display = 'none';
            document.getElementById('ig-alunoView').style.display = 'none';
            document.getElementById('ig-gameModal').style.display = 'none';
            document.getElementById('ig-timeout-screen').style.display = 'none';

            if (Workspace.Ingles.sessaoEncerrada) {
                document.getElementById('ig-timeout-screen').style.display = 'flex';
                document.getElementById('ig-timeout-xp').innerText = `+${Workspace.Ingles.xpGanhosNaSessao} XP ⭐`;
            } 
            else if (!Workspace.Ingles.tempoGlobalDefinido) {
                const magoScr = document.getElementById('ig-guardian-screen');
                magoScr.style.display = 'flex';
                magoScr.style.opacity = '1';
                // O Mago só fala após explodir e entrar no Hub!
            } 
            else {
                document.getElementById('ig-alunoView').style.display = 'block';
                Workspace.Ingles.renderAlunoGrid();
            }
        }
    },

    // 🚀 LÓGICA BLINDADA DO HUB DE JOGOS
    renderAlunoGrid: () => {
        const grid = document.getElementById('ig-gamesGrid');
        if(!grid) return;
        // Limpa a classe de entrada caso exista de uma sessão anterior
        grid.classList.remove('grid-entrance');
        
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
    // ✨ ANIMAÇÃO CINEMÁTICA SUPREMA: EXPLOSÃO DE ECRÃ INTEIRO
    // ============================================================================
    abrirBauMagico: (minutos) => {
        try {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            if (Workspace.Ingles.magoIntervalTimer) clearInterval(Workspace.Ingles.magoIntervalTimer);

            // Som de carregamento da magia
            try { const a1 = new Audio('https://actions.google.com/sounds/v1/science_fiction/force_field_loop.ogg'); a1.volume = 0.5; a1.play().catch(()=>{}); setTimeout(()=>a1.pause(), 1500); } catch(e){}

            // Anima o Baú no Cabeçalho (Fase de Carregamento)
            const chest = document.getElementById('ig-header-chest');
            if (chest) chest.classList.add('chest-shake');

            const magoScr = document.getElementById('ig-guardian-screen');
            if(magoScr) magoScr.style.opacity = '0';

            // 💥 O BAÚ EXPLODE APÓS 1.5 SEGUNDOS
            setTimeout(() => {
                if(magoScr) magoScr.style.display = 'none';

                if (chest) {
                    chest.classList.remove('chest-shake');
                    chest.classList.add('chest-explode'); // CSS aumenta muito o baú e dá muito brilho
                    
                    // A TROCA DE SPRITE (SWAP): O Baú Abre!
                    chest.src = '/assets/bau_roxo_pixel_aberto.png';
                    chest.onerror = function() { this.onerror=null; this.src='/public/assets/bau_roxo_pixel_aberto.png'; };
                }

                // ⚡ CLARÃO DE ECRÃ (Flash Bang) para impacto máximo
                let flash = document.createElement('div');
                flash.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:white; z-index:9999999; opacity:0.8; transition:opacity 0.6s ease-out; pointer-events:none;';
                document.body.appendChild(flash);
                setTimeout(() => { flash.style.opacity = '0'; }, 50);
                setTimeout(() => { flash.remove(); }, 800);

                // 🔊 Sons de Impacto (Explosão e Magia intensa)
                try { const a2 = new Audio('https://actions.google.com/sounds/v1/weapons/large_explosion.ogg'); a2.volume = 0.9; a2.play().catch(()=>{}); } catch(e){}
                try { const a3 = new Audio('https://actions.google.com/sounds/v1/science_fiction/magic_sparkle.ogg'); a3.volume = 1.0; a3.play().catch(()=>{}); } catch(e){}

                // 🎯 O PONTO DE ORIGEM (Exatamente do centro do Baú)
                const rect = chest ? chest.getBoundingClientRect() : { left: window.innerWidth / 2, top: 50 };
                const originX = rect.left + (rect.width / 2); 
                const originY = rect.top + (rect.height / 2);

                // 🌊 1. ONDA DE CHOQUE GIGANTE
                let wave = document.createElement('div');
                wave.style.cssText = `position:fixed; left:${originX}px; top:${originY}px; width:10px; height:10px; border-radius:50%; box-shadow:0 0 80px 40px #f1c40f, inset 0 0 30px #fff; background:transparent; z-index:9999998; pointer-events:none; transform:translate(-50%, -50%); animation:shockwave 1.2s ease-out forwards;`;
                document.body.appendChild(wave);
                setTimeout(() => wave.remove(), 1200);

                // 🚀 O MOTOR DE FÍSICA PARA COBRIR O ECRÃ INTEIRO
                // Baseamos a força na largura da tela do utilizador para que as partículas cheguem a todos os cantos
                const forcaMaxima = window.innerWidth * 0.9; 
                const coresFogo = ['#ffeb3b', '#e67e22', '#c0392b', '#ff9800'];

                // 🔥 2. BOLAS DE FOGO (60 partículas pesadas e rápidas)
                for (let i = 0; i < 60; i++) {
                    let fb = document.createElement('div');
                    fb.className = 'ig-fireball';
                    document.body.appendChild(fb);
                    
                    let angle = Math.random() * Math.PI * 2; // 360 graus
                    let velocity = 300 + Math.random() * forcaMaxima; // Muito rápido
                    let tx = Math.cos(angle) * velocity;
                    let ty = Math.sin(angle) * velocity; 
                    
                    fb.style.left = originX + 'px'; fb.style.top = originY + 'px';
                    fb.style.setProperty('--tx', tx + 'px'); fb.style.setProperty('--ty', ty + 'px');
                    fb.style.backgroundColor = coresFogo[Math.floor(Math.random() * coresFogo.length)];
                    
                    let size = (15 + Math.random() * 25) + 'px';
                    fb.style.width = size; fb.style.height = size;
                    setTimeout(() => fb.remove(), 1500);
                }

                // ✨ 3. PURPURINA (100 Estrelas Brilhantes)
                for (let i = 0; i < 100; i++) {
                    let gl = document.createElement('div');
                    gl.className = 'ig-sparkle';
                    document.body.appendChild(gl);
                    
                    let angle = Math.random() * Math.PI * 2;
                    let velocity = 200 + Math.random() * (forcaMaxima * 1.2); // Vão ainda mais longe
                    
                    gl.style.left = originX + 'px'; gl.style.top = originY + 'px';
                    gl.style.setProperty('--tx', (Math.cos(angle) * velocity) + 'px'); 
                    gl.style.setProperty('--ty', (Math.sin(angle) * velocity) + 'px');
                    gl.style.backgroundColor = '#fff';
                    
                    let size = (5 + Math.random() * 10) + 'px';
                    gl.style.width = size; gl.style.height = size;
                    setTimeout(() => gl.remove(), 2000);
                }

                // 💫 4. PÓ MÁGICO (150 partículas minúsculas douradas flutuantes)
                for (let i = 0; i < 150; i++) {
                    let dust = document.createElement('div');
                    dust.className = 'ig-magic-dust';
                    document.body.appendChild(dust);
                    
                    let angle = Math.random() * Math.PI * 2;
                    let velocity = 100 + Math.random() * forcaMaxima; 
                    
                    dust.style.left = originX + 'px'; dust.style.top = originY + 'px';
                    dust.style.setProperty('--tx', (Math.cos(angle) * velocity) + 'px'); 
                    dust.style.setProperty('--ty', (Math.sin(angle) * velocity) + 'px');
                    
                    let size = (2 + Math.random() * 4) + 'px';
                    dust.style.width = size; dust.style.height = size;
                    setTimeout(() => dust.remove(), 2500);
                }

                // 🚀 REVELA O HUB DE JOGOS
                setTimeout(() => {
                    Workspace.Ingles.tempoRestante = minutos * 60;
                    Workspace.Ingles.xpGanhosNaSessao = 0;
                    Workspace.Ingles.tempoGlobalDefinido = true;
                    
                    Workspace.Ingles.iniciarTimerGlobal();
                    Workspace.Ingles.renderizarVisualizacao(); 
                    
                    // Entrada animada
                    const grid = document.getElementById('ig-gamesGrid');
                    if (grid) {
                        grid.classList.add('grid-entrance');
                    }

                    // O Mago fala as instruções do Professor no Hub!
                    setTimeout(() => {
                        Workspace.Ingles.iniciarFalaGuardiao();
                    }, 500);

                }, 1000);

            }, 1500); 
        } catch (error) {
            // FALLBACK DE SEGURANÇA
            console.error("Erro na transição mágica:", error);
            Workspace.Ingles.tempoRestante = minutos * 60;
            Workspace.Ingles.tempoGlobalDefinido = true;
            Workspace.Ingles.iniciarTimerGlobal();
            Workspace.Ingles.renderizarVisualizacao();
            setTimeout(() => { Workspace.Ingles.iniciarFalaGuardiao(); }, 500);
        }
    },

    // ============================================================================
    // 🧙‍♂️ NARRATIVA: O CÉREBRO DO GUARDIÃO
    // ============================================================================
    encerrarSessaoBau: () => {
        Workspace.Ingles.tempoGlobalDefinido = false;
        Workspace.Ingles.sessaoEncerrada = false;
        Workspace.Ingles.bauDestrancado = false;
        Workspace.Ingles.digitandoAtivo = false;
        
        if (Workspace.Ingles.timerGlobal) clearInterval(Workspace.Ingles.timerGlobal);
        if (Workspace.Ingles.magoIntervalTimer) clearInterval(Workspace.Ingles.magoIntervalTimer);
        
        const balao = document.getElementById('ig-hub-mago-text');
        if (balao) balao.style.display = 'none';

        Workspace.navegarPara('feed');
    },

  iniciarFalaGuardiao: (forcarRestart = false) => {
        if (Workspace.Ingles.digitandoAtivo && !forcarRestart) return; 
        Workspace.Ingles.digitandoAtivo = true;
        if(Workspace.Ingles.magoIntervalTimer) clearInterval(Workspace.Ingles.magoIntervalTimer);
        
        // 🚀 AGORA FALA NO BALÃO DO HUB DE JOGOS!
        const balao = document.getElementById('ig-hub-mago-text');
        if (!balao) return;
        
        balao.style.display = 'flex';
        balao.innerHTML = '';

        const config = Workspace.Ingles.state.magoConfig || Workspace.Ingles.defaults.magoConfig;
        const frasesLivres = Workspace.Ingles.state.magoPhrases.length > 0 ? Workspace.Ingles.state.magoPhrases : Workspace.Ingles.defaults.magoPhrases;

        let fraseBruta = "";

        // 🚀 LÓGICA DE SEQUÊNCIA MÁGICA: Aqui o Mago decide que frase puxar baseado no acesso!
        if (config.modoExibicao === 'sequencial') {
            const userK = `ws_mago_acessos_${Workspace.usuario ? Workspace.usuario.id : 'default'}`;
            let acessos = parseInt(localStorage.getItem(userK) || '0');
            const indice = acessos % frasesLivres.length; 
            fraseBruta = frasesLivres[indice].text;
            if (!forcarRestart) localStorage.setItem(userK, acessos + 1); 
        } else if (config.modoExibicao === 'fixa') {
            fraseBruta = frasesLivres[0].text;
        } else {
            fraseBruta = frasesLivres[Math.floor(Math.random() * frasesLivres.length)].text;
        }

        // 🚀 O FILTRO BLINDADO: Apanha o nome limpo para não quebrar a máquina de escrever!
        const regexCitar = /(?:\(citarAluno\)|citarAluno|\$\{aluno\.nome\}|\{\{aluno\.nome\}\})/gi;
        const nomeDoAluno = Workspace.Ingles.getNomeAlunoReal();

        // O áudio usa o nome normal, o visual usa o nome em MAIÚSCULAS para destaque RPG!
        const fraseAudio = fraseBruta.replace(regexCitar, nomeDoAluno);
        const fraseVisual = fraseBruta.replace(regexCitar, nomeDoAluno.toUpperCase());

        if (config.vozAtiva) {
            // Mudamos de 'pt-BR' para 'en-US' para que o Mago leia em inglês perfeito!
            Workspace.Ingles.falar(fraseAudio, 'en-US', 1.0, 0.95, true);
        } else if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); 
        }

        let i = 0;
        let htmlAcumulado = "";

        // Som de "Boing" ou bolhas ao aparecer o balão
        try { const audio = new Audio('https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg'); audio.volume = 0.1; audio.play().catch(()=>{}); } catch(e){}

        // Máquina de Escrever Perfeita (Sem HTML quebrado)
        Workspace.Ingles.magoIntervalTimer = setInterval(() => {
            htmlAcumulado += fraseVisual.charAt(i);
            balao.innerText = htmlAcumulado; // innerText é 100% à prova de balas para injeções

            i++;
            if (i >= fraseVisual.length) {
                clearInterval(Workspace.Ingles.magoIntervalTimer);
                Workspace.Ingles.digitandoAtivo = false;
            }
        }, 35); 
    },

    definirTempoGlobal: (minutos) => {
        // Redireciona a chamada velha para a nova explosão
        Workspace.Ingles.abrirBauMagico(minutos);
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
    // 👨‍🏫 O LABORATÓRIO DO PROFESSOR (GESTÃO DRAG & DROP DO MAGO)
    // ============================================================================
    renderProfessorTab: (tabId) => {
        localStorage.setItem('ws_ingles_aba_prof', tabId); 
        document.querySelectorAll('.ig-side-item').forEach(b => b.classList.remove('active'));
        const btn = document.querySelector(`.ig-side-item[data-tab="${tabId}"]`);
        if(btn) btn.classList.add('active');
        
        const content = document.getElementById('ig-tab-content');
        const state = Workspace.Ingles.state;
        const configMago = state.magoConfig || Workspace.Ingles.defaults.magoConfig;
        
        if (tabId === 'mago') {
            content.innerHTML = `
                <div class="ig-card">
                    <h3>🧙‍♂️ Inteligência do Guardião (Mago IA)</h3>
                    <p style="color:#64748B;font-size:13px">Configure o comportamento do Mago e crie falas personalizadas.</p>
                    
                    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
                        <h4 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 14px;">⚙️ Painel de Controle de Comportamento</h4>
                        <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
                            <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: bold; cursor: pointer; color: #2c3e50;">
                                <input type="checkbox" id="mago-voz-toggle" ${configMago.vozAtiva ? 'checked' : ''} onchange="Workspace.Ingles.atualizarConfigMago()" style="transform: scale(1.2);"> 
                                🔊 Ativar Voz do Mago
                            </label>
                            <div style="width: 1px; height: 20px; background: #cbd5e1;"></div>
                            <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: bold; color: #2c3e50;">
                                <span>Ordem das Falas:</span>
                                <select id="mago-modo-select" class="ig-input" style="width: auto; padding: 6px 12px; height: 32px;" onchange="Workspace.Ingles.atualizarConfigMago()">
                                    <option value="aleatorio" ${configMago.modoExibicao === 'aleatorio' ? 'selected' : ''}>🎲 Modo Aleatório</option>
                                    <option value="sequencial" ${configMago.modoExibicao === 'sequencial' ? 'selected' : ''}>🔢 Modo Sequencial (Por Acesso)</option>
                                    <option value="fixa" ${configMago.modoExibicao === 'fixa' ? 'selected' : ''}>📌 Modo Fixo (Apenas a 1ª da lista)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style="background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                            <label style="font-size:13px; font-weight:bold; color:#2c3e50;">Nova Fala do Mago:</label>
                            <button class="ws-btn" style="background:#8e44ad; color:white; border:none; padding:6px 12px; border-radius:20px; font-size:11px; font-weight:bold; cursor:pointer; box-shadow: 0 2px 4px rgba(142, 68, 173, 0.2);" onclick="Workspace.Ingles.inserirVariavelMago()">+ Inserir Nome (citarAluno)</button>
                        </div>
                        <div style="display:flex; gap:10px;">
                            <input id="nwMago" class="ig-input" placeholder="Clique no campo de texto e adicione o código mágico...">
                            <button class="ws-btn" id="btn-salvar-mago" style="background:#4F46E5; color:white; border:none; padding:10px 15px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="Workspace.Ingles.addMagoPhrase()">Salvar Fala</button>
                        </div>
                    </div>

                    <h4 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 14px;">Lista de Falas Cadastradas (Arraste para reordenar)</h4>
                    <div id="ws-mago-lista-falas" style="max-height: 300px; overflow-y: auto; padding-right: 5px;">
                        ${state.magoPhrases.map((m, index) => `
                        <div class="ig-list-item ws-mago-drag" draggable="true" data-id="${m.id}" ondragstart="Workspace.Ingles.dragStart(event)" ondragover="Workspace.Ingles.dragOver(event)" ondragleave="Workspace.Ingles.dragLeave(event)" ondrop="Workspace.Ingles.drop(event)" ondragend="Workspace.Ingles.dragEnd(event)" style="background:#fff; border: 1px solid #eee; border-left: 4px solid #4F46E5; border-radius:8px; margin-bottom:8px; padding:12px; display:flex; justify-content:space-between; align-items:center; cursor: grab; transition: border 0.2s;">
                            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                                <span style="font-weight:900; color:#cbd5e1; font-size:16px; width: 25px;">${index + 1}.</span>
                                <span style="font-size:18px; color:#94a3b8; cursor:grab;" title="Segure aqui para arrastar">↕</span>
                                <div style="font-weight:600; color:#2c3e50; font-size:13px; flex: 1;">${Workspace.escapeHTML(m.text)}</div>
                            </div>
                            <div style="display:flex; gap: 8px;">
                                <button style="background:#fff8e1; border:1px solid #fdebd0; border-radius:6px; color:#f39c12; cursor:pointer; font-weight:bold; font-size:11px; padding:4px 8px;" onclick="Workspace.Ingles.editarMagoPhrase('${m.id}')">✏️ Editar</button>
                                <button style="background:#fdf2f2; border:1px solid #fadbd8; border-radius:6px; color:#e74c3c; cursor:pointer; font-weight:bold; font-size:11px; padding:4px 8px;" onclick="Workspace.Ingles.remItem('magoPhrases','${m.id}')">✕</button>
                            </div>
                        </div>`).join('')}
                    </div>
                </div>
            `;
        }
        else if (tabId === 'biblioteca') {
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

    atualizarConfigMago: async () => {
        const voz = document.getElementById('mago-voz-toggle').checked;
        const modo = document.getElementById('mago-modo-select').value;
        Workspace.Ingles.state.magoConfig = { vozAtiva: voz, modoExibicao: modo };
        await Workspace.Ingles.saveDados();
        Workspace.mostrarAviso("Configuração de comportamento atualizada!", "success");
    },

    dragStart: (e) => {
        e.dataTransfer.setData('text/plain', e.target.closest('.ws-mago-drag').dataset.id);
        e.dataTransfer.effectAllowed = 'move';
        e.target.closest('.ws-mago-drag').style.opacity = '0.5';
    },
    dragOver: (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const target = e.target.closest('.ws-mago-drag');
        if (target) target.style.borderTop = '3px solid #4F46E5';
    },
    dragLeave: (e) => {
        const target = e.target.closest('.ws-mago-drag');
        if (target) target.style.borderTop = '1px solid #eee';
    },
    drop: async (e) => {
        e.preventDefault();
        const target = e.target.closest('.ws-mago-drag');
        if (target) target.style.borderTop = '1px solid #eee';

        const draggedId = e.dataTransfer.getData('text/plain');
        const targetId = target ? target.dataset.id : null;

        if (draggedId && targetId && draggedId !== targetId) {
            const arr = Workspace.Ingles.state.magoPhrases;
            const idxDrag = arr.findIndex(i => i.id === draggedId);
            const idxDrop = arr.findIndex(i => i.id === targetId);

            if (idxDrag > -1 && idxDrop > -1) {
                const [item] = arr.splice(idxDrag, 1);
                arr.splice(idxDrop, 0, item);
                await Workspace.Ingles.saveDados();
                Workspace.Ingles.renderProfessorTab('mago');
            }
        }
    },
    dragEnd: (e) => {
        const el = e.target.closest('.ws-mago-drag');
        if(el) el.style.opacity = '1';
        document.querySelectorAll('.ws-mago-drag').forEach(node => node.style.borderTop = '1px solid #eee');
    },

 inserirVariavelMago: () => {
    const input = document.getElementById('nwMago');
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const variable = "(citarAluno)";
    input.value = input.value.substring(0, start) + variable + input.value.substring(end);
    input.focus();
    input.selectionStart = input.selectionEnd = start + variable.length;
},

getNomeAlunoReal: () => {
        // 1. Tenta pegar o nome ou login do utilizador logado
        const nomeCompleto = Workspace.usuario?.nome || Workspace.usuario?.login || 'Aventureiro';
        const tipoUser = Workspace.usuario?.tipo || 'Aluno';
        
        // 2. Extrai apenas o primeiro nome[cite: 7]
        let primeiroNome = nomeCompleto.split(' ')[0];

        // 3. 🚀 FILTRO DE IMERSÃO: Se a conta logada se chamar "Teste", substituímos por um título digno!
        if (primeiroNome.toLowerCase() === 'teste') {
            primeiroNome = tipoUser === 'Aluno' ? 'Aventureiro' : 'Professor';
        }

        return primeiroNome;
    },

    

    editarMagoPhrase: (id) => {
        const phrase = Workspace.Ingles.state.magoPhrases.find(m => m.id === id);
        if (!phrase) return;
        const input = document.getElementById('nwMago');
        const btn = document.getElementById('btn-salvar-mago');
        input.value = phrase.text;
        input.focus();
        btn.innerText = "Atualizar Fala";
        btn.style.background = "#f39c12"; 
        
        btn.onclick = async () => {
            if(!input.value.trim()) return Workspace.mostrarAviso("A fala não pode estar vazia!", "warning");
            phrase.text = input.value.trim();
            
            btn.innerText = "Salvar Fala";
            btn.style.background = "#4F46E5";
            btn.onclick = Workspace.Ingles.addMagoPhrase;
            input.value = '';
            
            await Workspace.Ingles.saveDados();
            Workspace.Ingles.renderProfessorTab('mago');
            Workspace.mostrarAviso("Fala atualizada!", "success");
        };
    },

    addMagoPhrase: async () => {
        const text = document.getElementById('nwMago').value.trim();
        if(!text) return Workspace.mostrarAviso("Escreva a fala do Mago!", "warning");
        Workspace.Ingles.state.magoPhrases.unshift({ id: 'mago_' + Date.now(), text: text });
        await Workspace.Ingles.saveDados(); 
        Workspace.Ingles.renderProfessorTab('mago');
        Workspace.mostrarAviso("A fala foi ensinada ao Mago! 🧙‍♂️", "success");
        document.getElementById('nwMago').value = '';
    },

    addWord: async () => {
        const w = document.getElementById('nwWord').value.trim(), t = document.getElementById('nwTrans').value.trim();
        if(!w) return;
        Workspace.Ingles.state.words.unshift({id:'w'+Date.now(), word:w, translation:t, level:'B1'});
        await Workspace.Ingles.saveDados(); Workspace.Ingles.renderProfessorTab('biblioteca'); 
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
                <h2 style="font-family:'Cinzel', serif; font-size:32px; color:#10B981; margin-bottom:10px;">Excelente!</h2>
                <div style="font-family:'VT323', monospace; font-size:30px; color:#0F172A;">+${bonus} XP Ganho</div>
            </div>`;
        setTimeout(() => Workspace.Ingles.proximoDesafio(), 1500);
    },

    falhaGenerica: async () => {
        document.getElementById('ig-modalBody').innerHTML = `
            <div style="text-align:center; padding:50px;">
                <div style="font-size:60px; margin-bottom:15px;">❌</div>
                <h2 style="font-family:'Cinzel', serif; font-size:32px; color:#EF4444; margin-bottom:10px;">Atenção!</h2>
                <div style="font-size:16px; font-weight:bold; color:#64748B;">A Inteligência guardou este erro. Irás enfrentá-lo novamente em breve.</div>
                <div style="font-family:'VT323', monospace; font-size:30px; color:#EF4444; margin-top:15px;">0 XP</div>
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
            
            <button class="ws-btn" style="width:100%; background:linear-gradient(135deg, #4F46E5, #3730A3); color:white; border:none; padding:15px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:16px; margin-top:15px;" onclick="
                const txt = document.getElementById('ig-input').value;
                if(!txt.toLowerCase().includes(Workspace.Ingles.desafioAtualObj.word.toLowerCase())) {
                    Workspace.Ingles.registrarErro(Workspace.Ingles.desafioAtualObj, 'word');
                    Workspace.Ingles.falhaGenerica();
                } else {
                    Workspace.Ingles.superarErro(Workspace.Ingles.desafioAtualObj.id);
                    Workspace.Ingles.envioAoProfessor('wordSpark', txt, 50);
                }
            ">Lançar Feitiço ✨</button>
        `;
    },

    renderGameReadAloud: () => {
        Workspace.Ingles.desafioAtualObj = Workspace.Ingles.obterItemInteligente(Workspace.Ingles.state.phrases, 'phrase');
        const p = Workspace.Ingles.desafioAtualObj;
        
        document.getElementById('ig-modalBody').innerHTML = `
            <div class="ig-big-phrase">${p.phrase}</div>
            <div style="text-align:center; margin:15px 0;">
                <button class="ws-btn" style="background:#0F172A; color:white; border-radius:30px; border:none; padding:10px 20px; cursor:pointer;" onclick="Workspace.Ingles.falar('${p.phrase.replace(/'/g,"\\'")}')">🔊 Ouvir o Oráculo</button>
            </div>
            <div style="text-align: center; margin-top: 20px; background:#F8FAFC; padding:20px; border-radius:12px; border:1px solid #E2E8F0;">
                <p style="font-size:13px; color:#333; font-weight:bold;">Sua vez. A Magia analisará a tua voz:</p>
                <button id="ig-btnVoz" class="ws-btn" style="background:linear-gradient(135deg, #10B981, #059669); color:white; font-size:16px; width:100%; border-radius:30px; padding:12px; border:none; font-weight:bold; cursor:pointer; margin-top:10px;" onclick="Workspace.Ingles.iniciarReconhecimentoDeVoz('${p.phrase.replace(/'/g,"\\'")}', Workspace.Ingles.desafioAtualObj, 'phrase')">🎤 Iniciar Sopro</button>
                <div id="ig-speechResult" style="margin-top:15px;"></div>
            </div>
        `;
    },

    renderGameListenType: () => {
        Workspace.Ingles.desafioAtualObj = Workspace.Ingles.obterItemInteligente(Workspace.Ingles.state.phrases, 'phrase');
        const p = Workspace.Ingles.desafioAtualObj;
        
        document.getElementById('ig-modalBody').innerHTML = `
            <div style="text-align:center;padding:20px">
                <div style="font-size:60px; margin-bottom:10px;">🦉</div>
                <h3 style="margin-bottom:5px; color:#0F172A; font-family:'Cinzel', serif;">Escute e transcreva</h3>
                <button class="ws-btn" style="background:#4F46E5; color:white; border-radius:30px; padding:10px 30px; font-size:16px; margin-bottom:25px; border:none; cursor:pointer;" onclick="Workspace.Ingles.falar('${p.phrase.replace(/'/g,"\\'")}')">🔊 Tocar Ecos</button>
                
                <input id="ig-listenInput" class="ig-input" placeholder="Transcreve exatamente o que ouviste..." style="font-size:16px; font-weight:bold; text-align:center;">
                
                <button class="ws-btn" style="width:100%; background:linear-gradient(135deg, #10B981, #059669); color:white; margin-top:15px; font-size:16px; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:bold;" onclick="
                    const digitado = document.getElementById('ig-listenInput').value;
                    const sim = Workspace.Ingles.similaridade(digitado, Workspace.Ingles.desafioAtualObj.phrase);
                    if(sim >= 0.9) {
                        Workspace.Ingles.superarErro(Workspace.Ingles.desafioAtualObj.id);
                        Workspace.Ingles.sucessoGenerico(50);
                    } else {
                        Workspace.Ingles.registrarErro(Workspace.Ingles.desafioAtualObj, 'phrase');
                        Workspace.Ingles.falhaGenerica();
                    }
                ">Desvendar</button>
            </div>
        `;
    },

    renderGameQuiz: () => {
        Workspace.Ingles.desafioAtualObj = Workspace.Ingles.obterItemInteligente(Workspace.Ingles.state.quizzes, 'quiz');
        const q = Workspace.Ingles.desafioAtualObj;
        
        document.getElementById('ig-modalBody').innerHTML = `
            <div class="ig-big-phrase" style="font-size:20px; font-family:'Cinzel', serif;">${q.question}</div>
            <div style="display:flex;flex-direction:column;gap:12px;margin-top:20px" id="ig-quizOptions">
                ${q.options.map((o,i)=>`<button class="ws-btn" style="background:white; color:#0F172A; border:2px solid #E2E8F0; text-align:left; padding:15px; font-size:16px; font-weight:600; border-radius:8px; cursor:pointer; transition:0.2s;" onmouseover="this.style.borderColor='#d4af37'" onmouseout="this.style.borderColor='#E2E8F0'" onclick="
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
                <div style="width:150px; height:150px; border-radius:24px; background:#F8FAFC; border:4px solid #d4af37; display:flex; align-items:center; justify-content:center; margin:20px auto; font-size:80px; box-shadow: inset 0 0 20px rgba(212,175,55,0.3);">${pic.emoji}</div>
                <div style="margin-top:25px; background:#0F172A; padding:20px; border-radius:16px; border:2px solid #333;">
                    <p style="color:white; font-size:14px; font-weight:bold; margin-bottom:15px;">Fale o nome exato:</p>
                    <button id="ig-btnVoz" class="ws-btn" style="background:linear-gradient(135deg, #10B981, #059669); color:white; font-size:16px; width:100%; border-radius:30px; padding:12px; border:none; font-weight:bold; cursor:pointer;" onclick="Workspace.Ingles.iniciarReconhecimentoDeVoz('${pic.word}', Workspace.Ingles.desafioAtualObj, 'picture')">🎤 Falar Nome</button>
                    <div id="ig-speechResult" style="margin-top:15px;"></div>
                    
                    <div style="margin-top:15px; border-top:1px solid rgba(255,255,255,0.1); padding-top:15px;">
                        <input id="ig-input" class="ig-input" placeholder="Ou digita a resposta..." style="text-align:center; font-weight:bold;">
                        <button class="ws-btn" style="width:100%; background:white; color:#0F172A; margin-top:10px; font-weight:bold; border:none; padding:12px; border-radius:8px; cursor:pointer;" onclick="
                            const sim = Workspace.Ingles.similaridade(document.getElementById('ig-input').value, Workspace.Ingles.desafioAtualObj.word);
                            if(sim >= 0.9) {
                                Workspace.Ingles.superarErro(Workspace.Ingles.desafioAtualObj.id);
                                Workspace.Ingles.sucessoGenerico(75);
                            } else {
                                Workspace.Ingles.registrarErro(Workspace.Ingles.desafioAtualObj, 'picture');
                                Workspace.Ingles.falhaGenerica();
                            }
                        ">Verificar Visão</button>
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
            Workspace.mostrarAviso('O teu navegador não suporta Deteção de Voz.', 'warning'); return;
        }

        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        Workspace.Ingles.recognition = new SR();
        Workspace.Ingles.recognition.lang = 'en-US';
        Workspace.Ingles.recognition.interimResults = false;
        Workspace.Ingles.recognition.maxAlternatives = 1;
        
        btn.innerText = "🎧 A Escutar Magia..."; btn.style.background = "#F59E0B"; btn.style.animation = "pulse 1s infinite";
        Workspace.Ingles.recognition.start();

        Workspace.Ingles.recognition.onresult = (e) => {
            const falado = e.results[0][0].transcript;
            btn.style.animation = "none"; btn.style.background = "#0F172A"; btn.innerText = `Lido: "${falado}"`;
            
            const sim = Workspace.Ingles.similaridade(falado, esperado);
            if(sim >= 0.75) {
                resEl.innerHTML = `<div style="background:#D1FAE5; color:#065F46; padding:10px; border-radius:8px; font-weight:bold;">✅ Magia Perfeita!</div>`;
                if (itemObj) Workspace.Ingles.superarErro(itemObj.id);
                setTimeout(() => Workspace.Ingles.sucessoGenerico(75), 1000);
            } else {
                resEl.innerHTML = `<div style="background:#FEE2E2; color:#B91C1C; padding:10px; border-radius:8px; font-weight:bold;">❌ O Mestre entendeu: "${falado}"</div>`;
                if (itemObj) Workspace.Ingles.registrarErro(itemObj, tipoConteudo);
                setTimeout(() => Workspace.Ingles.falhaGenerica(), 1500);
            }
        };

        Workspace.Ingles.recognition.onerror = () => {
            btn.style.animation = "none"; btn.style.background = "#10B981"; btn.innerText = "🎤 Falar Novamente";
            Workspace.mostrarAviso("Não consegui ouvir. Lança o feitiço novamente.", "error");
        };
    },

    renderGameWordPicker: () => {
        Workspace.Ingles.desafioAtualObj = Workspace.Ingles.obterItemInteligente(Workspace.Ingles.defaults.wordPickers, 'picker');
        const s = Workspace.Ingles.desafioAtualObj;
        
        document.getElementById('ig-modalBody').innerHTML = `
            <div class="ig-big-phrase" style="font-size:22px; color:#4F46E5;">${s.text}</div>
            <div style="display:flex; gap:10px; justify-content:center; margin-top:20px; flex-wrap:wrap;">
                ${s.options.map((o,i)=>`<button class="ws-btn" style="background:white; color:#0F172A; border:2px solid #E2E8F0; padding:12px 25px; font-size:16px; font-weight:bold; border-radius:30px; cursor:pointer;" onmouseover="this.style.borderColor='#d4af37'" onmouseout="this.style.borderColor='#E2E8F0'" onclick="
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
                <h3 style="font-family:'Cinzel', serif; font-size:24px; color:#0F172A;">👄 Sussurros Gêmeos</h3>
                <div style="background:#0F172A; padding:20px; border-radius:16px; margin-top:20px; border:2px solid #333;">
                    <button class="ws-btn" style="background:linear-gradient(135deg, #4F46E5, #3730A3); color:white; padding:12px 30px; border-radius:30px; border:2px solid white; cursor:pointer; font-weight:bold; font-size:16px;" onclick="Workspace.Ingles.falar('${target}')">🎧 Ouvir o Sussurro</button>
                    <div style="display:flex; gap:10px; justify-content:center; margin-top:20px;">
                        <button class="ws-btn" style="background:white; color:#0F172A; font-weight:bold; font-size:18px; padding:12px 30px; border-radius:8px; cursor:pointer; border:none;" onclick="
                            if('${pair.a}' === '${target}') { Workspace.Ingles.superarErro(Workspace.Ingles.desafioAtualObj.id); Workspace.Ingles.sucessoGenerico(75); } 
                            else { Workspace.Ingles.registrarErro(Workspace.Ingles.desafioAtualObj, 'minimal'); Workspace.Ingles.falhaGenerica(); }
                        ">${pair.a}</button>
                        <button class="ws-btn" style="background:white; color:#0F172A; font-weight:bold; font-size:18px; padding:12px 30px; border-radius:8px; cursor:pointer; border:none;" onclick="
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
            <div style="text-align:center"><span class="ig-badge" style="background:#0F172A; color:white; padding:8px 15px; font-size:14px;">🎯 Missão: ${task}</span></div>
            <div class="ig-big-phrase" style="margin-top:15px; font-size:20px; font-family:'Cinzel', serif;">${phrase.phrase}</div>
            <textarea id="ig-input" class="ig-textarea" placeholder="Sua frase aqui..."></textarea>
            <button class="ws-btn" style="width:100%; background:linear-gradient(135deg, #4F46E5, #3730A3); color:white; margin-top:15px; border:none; padding:15px; border-radius:8px; font-weight:bold; font-size:16px; cursor:pointer;" onclick="Workspace.Ingles.envioAoProfessor('sentenceShuffle', document.getElementById('ig-input').value, 50)">Submeter 🔀</button>
        `;
    },

    renderGameAnswerQuest: () => {
        Workspace.Ingles.desafioAtualObj = Workspace.Ingles.obterItemInteligente(Workspace.Ingles.defaults.questions, 'question');
        const q = Workspace.Ingles.desafioAtualObj;
        
        document.getElementById('ig-modalBody').innerHTML = `
            <div class="ig-big-phrase" style="background:#FEF3C7; border-color:#d4af37; color:#92400E; font-family:'Cinzel', serif;">❓ ${q.text}</div>
            <textarea id="ig-input" class="ig-textarea" placeholder="A tua resposta em inglês..."></textarea>
            <button class="ws-btn" style="width:100%; margin-top:15px; background:linear-gradient(180deg, #d4af37, #996515); color:white; border:none; padding:15px; border-radius:8px; font-weight:bold; font-size:16px; cursor:pointer;" onclick="Workspace.Ingles.envioAoProfessor('answerQuest', document.getElementById('ig-input').value, 50)">Enviar para o Mestre 🚀</button>
        `;
    },

    renderGameQuestionMaker: () => {
        const poolAnswers = Workspace.Ingles.state.pool.filter(p=>p.type==='answerQuest').map(p=>({ id: p.id, text: p.text }));
        
        const defaultAnswer = { id: 'fallback1', text: 'I go to the gym because I want to be healthy.' };
        Workspace.Ingles.desafioAtualObj = poolAnswers.length > 0 ? Workspace.Ingles.obterItemInteligente(poolAnswers, 'qmaker') : defaultAnswer;
        const a = Workspace.Ingles.desafioAtualObj;

        document.getElementById('ig-modalBody').innerHTML = `
            <p style="color:#64748B;font-size:14px;text-align:center; font-weight:bold; text-transform:uppercase;">Um aventureiro respondeu isto:</p>
            <div class="ig-big-phrase" style="background:#EEF2FF; color:#4F46E5; font-style:italic;">💬 "${a.text}"</div>
            <p style="margin-top:16px;font-weight:600; font-size:16px; text-align:center; color:#2c3e50;">Que pergunta em inglês gerou esta resposta?</p>
            <textarea id="ig-input" class="ig-textarea" placeholder="Ex: Why do you..."></textarea>
            <button class="ws-btn" style="width:100%; background:linear-gradient(135deg, #4F46E5, #3730A3); color:white; margin-top:15px; border:none; padding:15px; border-radius:8px; font-weight:bold; font-size:16px; cursor:pointer;" onclick="
                const v = document.getElementById('ig-input').value.trim();
                if(v.includes('?') && v.split(' ').length >= 3) { 
                    Workspace.Ingles.envioAoProfessor('questionMaker', v, 50); 
                } else { 
                    Workspace.mostrarAviso('Atenção: A tua pergunta tem de conter (?) e pelo menos 3 palavras!', 'error'); 
                }
            ">Verificar no Espelho 🔮</button>
        `;
    },

    renderGameContextRole: () => {
        Workspace.Ingles.desafioAtualObj = Workspace.Ingles.obterItemInteligente(Workspace.Ingles.defaults.roleplays, 'roleplay');
        const c = Workspace.Ingles.desafioAtualObj;
        
        document.getElementById('ig-modalBody').innerHTML = `
            <div class="ig-big-phrase" style="font-family:'Cinzel', serif; font-size:22px; text-align:left;">${c.title}<br><br><span style="font-size:16px;font-weight:bold;color:#64748B;font-family:sans-serif;">${c.prompt}</span></div>
            <p style="font-size:14px;background:#FEF3C7; color:#92400E; padding:12px; border-radius:8px; font-weight:bold;">💡 Dica de Mestre: ${c.tip}</p>
            <textarea id="ig-input" class="ig-textarea" placeholder="O que dizes?..."></textarea>
            <button class="ws-btn" style="width:100%; margin-top:15px; background:linear-gradient(135deg, #10B981, #059669); color:white; border:none; padding:15px; border-radius:8px; font-weight:bold; font-size:16px; cursor:pointer;" onclick="Workspace.Ingles.envioAoProfessor('contextRole', document.getElementById('ig-input').value, 60)">Assumir Papel 🎭</button>
        `;
    },

    renderGameDebateAI: () => {
        Workspace.Ingles.desafioAtualObj = Workspace.Ingles.obterItemInteligente(Workspace.Ingles.defaults.debates, 'debate');
        const topic = Workspace.Ingles.desafioAtualObj;
        
        document.getElementById('ig-modalBody').innerHTML = `
            <div class="ig-big-phrase" style="font-family:'Cinzel', serif; font-size:22px;">🤖 Duelo de Mentes<br><br><span style="font-size:18px;color:#4F46E5;font-family:sans-serif;font-weight:bold;">${topic.topic}</span></div>
            <textarea id="ig-input" class="ig-textarea" placeholder="Defende a tua posição..."></textarea>
            <button class="ws-btn" style="width:100%; background:#0F172A; color:white; margin-top:15px; border:none; padding:15px; border-radius:8px; font-weight:bold; font-size:16px; cursor:pointer;" onclick="Workspace.Ingles.envioAoProfessor('debateAI', document.getElementById('ig-input').value, 75)">Contra-Atacar ⚔️</button>
        `;
    }
};