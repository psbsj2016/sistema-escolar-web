// js/modulos/workspace/ingles.js
window.Workspace = window.Workspace || {};

Workspace.Ingles = {
    state: {
        xp: 0, streak: 1, words: [], phrases: [], quizzes: [], pictures: [], submissions: [], pool: []
    },
    mediaRecorder: null, audioChunks: [], currentAudioURL: null, recognition: null,

    // DADOS INICIAIS PADRÃO
    defaults: {
        words: [
            {id:'w1', word:'Although', translation:'Embora', level:'B2', example:'Although it was raining, we went out.', context:'Concessão'},
            {id:'w2', word:'Beneath', translation:'Abaixo de', level:'B1', example:'The keys were beneath the book.', context:'Preposição'},
            {id:'w3', word:'Achieve', translation:'Alcançar', level:'B1', example:'You can achieve anything with focus.', context:'Verbo'}
        ],
        phrases: [
            {id:'p1', phrase:'Could you tell me where the nearest pharmacy is?', translation:'Você poderia me dizer onde fica a farmácia mais próxima?', level:'A2', focus:'Politeness'},
            {id:'p2', phrase:'If I had more time, I would travel the world.', translation:'Se eu tivesse mais tempo, viajaria o mundo.', level:'B2', focus:'Second Conditional'}
        ],
        quizzes: [
            {id:'q1', question:'Choose the correct sentence:', options:['I have been to London last year','I went to London last year','I have went to London last year'], correct:1, explanation:'Use past simple with finished time (last year).', level:'B1'}
        ],
        pictures: [
            {id:'pic1', word:'apple', translation:'maçã', emoji:'🍎', category:'Food'},
            {id:'pic2', word:'bicycle', translation:'bicicleta', emoji:'🚲', category:'Transport'}
        ],
        minimalPairs: [
            {id:'mp1', a:'ship', b:'sheep', ipaA:'/ʃɪp/', ipaB:'/ʃiːp/', sentenceA:'The ship is big.', sentenceB:'The sheep is white.'},
            {id:'mp2', a:'beach', b:'bitch', ipaA:'/biːtʃ/', ipaB:'/bɪtʃ/', sentenceA:'Let\'s go to the beach.', sentenceB:'That word is offensive.'}
        ],
        debates: [
            {id:'d1', topic:'Social media does more harm than good', stance:'Do you agree?', starter:'Social media connects us, but also increases anxiety. What is your opinion?'}
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
        console.log("🏴‍☠️ Módulo Baú do Inglês Iniciado!");
        Workspace.Ingles.injetarCSS();
        Workspace.Ingles.construirHTML();
        Workspace.Ingles.loadDados();
        // Carrega as vozes antecipadamente
        if('speechSynthesis' in window) window.speechSynthesis.getVoices();
    },

    abrirBau: () => {
        Workspace.navegarPara('ingles');
        Workspace.Ingles.renderizarVisualizacao();
    },

    loadDados: () => {
        const getK = (k) => `ws_ingles_${Workspace.usuario.escolaId || 'default'}_${k}`;
        Workspace.Ingles.state.words = JSON.parse(localStorage.getItem(getK('words'))) || Workspace.Ingles.defaults.words;
        Workspace.Ingles.state.phrases = JSON.parse(localStorage.getItem(getK('phrases'))) || Workspace.Ingles.defaults.phrases;
        Workspace.Ingles.state.quizzes = JSON.parse(localStorage.getItem(getK('quizzes'))) || Workspace.Ingles.defaults.quizzes;
        Workspace.Ingles.state.pictures = JSON.parse(localStorage.getItem(getK('pictures'))) || Workspace.Ingles.defaults.pictures;
        Workspace.Ingles.state.submissions = JSON.parse(localStorage.getItem(getK('submissions'))) || [];
        Workspace.Ingles.state.pool = JSON.parse(localStorage.getItem(getK('pool'))) || [];
        
        // XP e Streak são por utilizador
        const userK = `ws_ingles_user_${Workspace.usuario.id}`;
        Workspace.Ingles.state.xp = parseInt(localStorage.getItem(`${userK}_xp`) || '0');
        Workspace.Ingles.state.streak = parseInt(localStorage.getItem(`${userK}_streak`) || '1');
    },

    saveDados: () => {
        const getK = (k) => `ws_ingles_${Workspace.usuario.escolaId || 'default'}_${k}`;
        localStorage.setItem(getK('words'), JSON.stringify(Workspace.Ingles.state.words));
        localStorage.setItem(getK('phrases'), JSON.stringify(Workspace.Ingles.state.phrases));
        localStorage.setItem(getK('quizzes'), JSON.stringify(Workspace.Ingles.state.quizzes));
        localStorage.setItem(getK('pictures'), JSON.stringify(Workspace.Ingles.state.pictures));
        localStorage.setItem(getK('submissions'), JSON.stringify(Workspace.Ingles.state.submissions));
        localStorage.setItem(getK('pool'), JSON.stringify(Workspace.Ingles.state.pool));
        
        const userK = `ws_ingles_user_${Workspace.usuario.id}`;
        localStorage.setItem(`${userK}_xp`, Workspace.Ingles.state.xp);
        localStorage.setItem(`${userK}_streak`, Workspace.Ingles.state.streak);
    },

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

    renderizarVisualizacao: () => {
        document.getElementById('ig-xpCount').textContent = Workspace.Ingles.state.xp;
        document.getElementById('ig-streakCount').textContent = Workspace.Ingles.state.streak;
        
        const isAluno = Workspace.usuario.tipo === 'Aluno';
        
        if (!isAluno) {
            document.getElementById('ig-professorView').style.display = 'flex';
            document.getElementById('ig-alunoView').style.display = 'none';
            document.getElementById('ig-pendingCount').textContent = Workspace.Ingles.state.submissions.filter(s=>s.status==='pending').length;
            Workspace.Ingles.renderProfessorTab('biblioteca');
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

    renderProfessorTab: (tabId) => {
        document.querySelectorAll('.ig-side-item').forEach(b => b.classList.remove('active'));
        const btn = document.querySelector(`.ig-side-item[data-tab="${tabId}"]`);
        if(btn) btn.classList.add('active');
        
        const content = document.getElementById('ig-tab-content');
        if (tabId === 'biblioteca') {
            content.innerHTML = `
                <div class="ig-card">
                    <h3>📚 Biblioteca de Conteúdo</h3>
                    <p style="color:#64748B;font-size:13px">Gerencie palavras, frases e quizzes do sistema global.</p>
                </div>
                <div style="display:flex; gap:20px; flex-wrap:wrap;">
                    <div class="ig-card" style="flex:1; min-width:300px;">
                        <h3>Palavras (${Workspace.Ingles.state.words.length})</h3>
                        <div style="display:flex; gap:10px; margin-bottom:15px;"><input id="nwWord" class="ig-input" placeholder="Inglês"><input id="nwTrans" class="ig-input" placeholder="Tradução"><button class="ws-btn" style="background:#4F46E5; color:white;" onclick="Workspace.Ingles.addWord()">Add</button></div>
                        <div style="max-height: 300px; overflow-y: auto;">${Workspace.Ingles.state.words.map(w=>`<div class="ig-list-item"><span><b>${w.word}</b> - ${w.translation}</span><button class="ws-btn" style="background:transparent; color:#e74c3c; padding:5px;" onclick="Workspace.Ingles.remItem('words','${w.id}')">✕</button></div>`).join('')}</div>
                    </div>
                </div>
            `;
        } else if (tabId === 'envios') {
            const pendentes = Workspace.Ingles.state.submissions.filter(s=>s.status==='pending');
            if(pendentes.length === 0) {
                content.innerHTML = `<div class="ig-card" style="text-align:center; padding:40px; color:#999;">Nenhum envio pendente dos alunos.</div>`;
            } else {
                content.innerHTML = pendentes.map(s => `
                    <div class="ig-card">
                        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                            <span class="ig-badge ig-badge-pending">Pendente</span>
                            <span style="font-size:12px; color:#999;">${s.student} • ${s.game}</span>
                        </div>
                        <p><b>Texto:</b> ${Workspace.escapeHTML(s.text)}</p>
                        ${s.audioURL ? `<audio controls src="${s.audioURL}" style="width:100%; margin-top:10px;"></audio>` : ''}
                        <div style="margin-top:15px; display:flex; gap:10px;">
                            <button class="ws-btn" style="background:#10B981; color:white;" onclick="Workspace.Ingles.aprovarEnvio('${s.id}')">✅ Aprovar para o Baú</button>
                            <button class="ws-btn" style="background:#e74c3c; color:white;" onclick="Workspace.Ingles.remItem('submissions','${s.id}')">🗑️ Rejeitar</button>
                        </div>
                    </div>
                `).join('');
            }
        }
    },

    // 🎮 FUNÇÕES DOS JOGOS
    abrirJogo: (id) => {
        const game = Workspace.Ingles.defaults.games.find(g => g.id === id);
        if(!game) return;
        
        document.getElementById('ig-modalIcon').textContent = game.icon;
        document.getElementById('ig-modalTitle').textContent = game.title;
        document.getElementById('ig-gameModal').style.display = 'flex';
        
        Workspace.Ingles.currentAudioURL = null;
        const body = document.getElementById('ig-modalBody');
        
        if(id === 'wordSpark') {
            const w = Workspace.Ingles.state.words[Math.floor(Math.random()*Workspace.Ingles.state.words.length)] || Workspace.Ingles.defaults.words[0];
            body.innerHTML = `
                <div class="ig-word-roulette"><div class="ig-roulette-word">${w.word}</div></div>
                <p style="text-align:center;margin:12px 0;color:#64748B">${w.translation} • ${w.example||''}</p>
                <div class="ig-big-phrase">Missão: Crie uma frase usando <b>${w.word}</b></div>
                <textarea id="ig-input" class="ig-textarea" placeholder="Digite sua frase em inglês..."></textarea>
                <button class="ws-btn" style="width:100%; background:#4F46E5; color:white; margin-top:15px;" onclick="Workspace.Ingles.submitSimples('${id}', document.getElementById('ig-input').value)">Enviar Missão 🚀</button>
            `;
        } else if (id === 'listenType') {
            const p = Workspace.Ingles.state.phrases[Math.floor(Math.random()*Workspace.Ingles.state.phrases.length)] || Workspace.Ingles.defaults.phrases[0];
            body.innerHTML = `
                <div style="text-align:center;padding:20px">
                    <div style="font-size:48px; margin-bottom:15px;">👂</div>
                    <h3 style="margin-bottom:10px;">Escute e digite o que ouviu</h3>
                    <button class="ws-btn" style="background:#0F172A; color:white; margin-bottom:20px;" onclick="Workspace.Ingles.falar('${p.phrase.replace(/'/g,"\\'")}')">🔊 Tocar Áudio</button>
                    <input id="ig-listenInput" class="ig-input" placeholder="Digite exatamente o que ouviu...">
                    <button class="ws-btn" style="width:100%; background:#4F46E5; color:white; margin-top:15px;" onclick="Workspace.Ingles.verificarListen('${p.phrase.replace(/'/g,"\\'")}')">Verificar</button>
                    <div id="ig-feedback" style="margin-top:15px;"></div>
                </div>
            `;
        } else {
            body.innerHTML = `<div style="text-align:center; padding:40px; color:#999;">🎮 Jogo <b>${game.title}</b> em preparação para a próxima atualização!</div>`;
        }
    },

    fecharJogo: () => {
        document.getElementById('ig-gameModal').style.display = 'none';
        if(Workspace.Ingles.mediaRecorder && Workspace.Ingles.mediaRecorder.state === 'recording') {
            Workspace.Ingles.mediaRecorder.stop();
        }
    },

    submitSimples: (gameId, texto) => {
        if(!texto || texto.trim().length < 3) return Workspace.mostrarAviso("Escreva algo válido!", "warning");
        Workspace.Ingles.state.submissions.unshift({
            id: 'sub_' + Date.now(), student: Workspace.usuario.nome, game: gameId, text: texto, status: 'pending', timestamp: Date.now()
        });
        Workspace.Ingles.state.xp += 50;
        Workspace.Ingles.saveDados();
        Workspace.mostrarAviso("Desafio Concluído! +50 XP ⭐", "success");
        Workspace.Ingles.fecharJogo();
        Workspace.Ingles.renderizarVisualizacao();
    },

    verificarListen: (correta) => {
        const digitado = document.getElementById('ig-listenInput').value.trim().toLowerCase();
        const alvo = correta.toLowerCase().replace(/[^\w\s]/g,'');
        const fb = document.getElementById('ig-feedback');
        
        if (digitado.replace(/[^\w\s]/g,'') === alvo) {
            fb.innerHTML = `<div style="background:#D1FAE5; color:#065F46; padding:10px; border-radius:8px;">✅ Perfeito! "${correta}"</div>`;
            setTimeout(() => { Workspace.Ingles.submitSimples('listenType', digitado); }, 1500);
        } else {
            fb.innerHTML = `<div style="background:#FEE2E2; color:#B91C1C; padding:10px; border-radius:8px;">❌ Tente ouvir de novo!</div>`;
        }
    },

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
            
            /* Professor Sidebar */
            .ig-sidebar { width: 250px; background: #fff; border-right: 1px solid #E2E8F0; padding: 20px; display:flex; flex-direction:column; gap:5px; }
            .ig-side-item { background: transparent; border: none; padding: 12px 15px; border-radius: 10px; text-align: left; font-weight: bold; color: #64748B; cursor: pointer; transition: 0.2s; }
            .ig-side-item:hover { background: #F1F5F9; }
            .ig-side-item.active { background: #0F172A; color: #fff; }
            .ig-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
            
            /* Inputs e Textareas Customizados */
            .ig-input, .ig-textarea { width: 100%; padding: 12px 15px; border: 1px solid #E2E8F0; border-radius: 10px; font-family: inherit; font-size: 14px; outline: none; transition: 0.2s; box-sizing: border-box; }
            .ig-input:focus, .ig-textarea:focus { border-color: #4F46E5; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
            .ig-textarea { min-height: 100px; resize: vertical; }
            
            /* Componentes do Jogo */
            .ig-word-roulette { width: 200px; height: 200px; border-radius: 50%; border: 8px solid #EEF2FF; display: flex; align-items: center; justify-content: center; margin: 0 auto; background: radial-gradient(circle at 30% 30%, #fff, #E0E7FF); }
            .ig-roulette-word { font-size: 26px; font-weight: 800; color: #0F172A; text-align: center; }
            .ig-big-phrase { font-size: 22px; font-weight: bold; text-align: center; padding: 20px; background: #F8FAFC; border: 1px dashed #E2E8F0; border-radius: 14px; margin: 15px 0; color: #1E293B; }
        `;
        document.head.appendChild(style);
    },

    construirHTML: () => {
        let container = document.getElementById('ws-ingles-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'ws-ingles-container';
            container.style.display = 'none';
            // Anexa junto aos outros ecrãs do Workspace
            const painelPrincipal = document.getElementById('ws-main-container');
            if (painelPrincipal && painelPrincipal.parentNode) {
                painelPrincipal.parentNode.appendChild(container);
            }
        }

        container.innerHTML = `
            <div class="ig-header">
                <div class="ig-title">
                    <div class="ig-title-icon">🏴‍☠️</div>
                    <div>
                        <h2 style="margin:0; font-size:22px; color:#0F172A;">Baú do Inglês</h2>
                        <p style="margin:0; font-size:13px; color:#64748B;">Estudos gamificados em tempo real</p>
                    </div>
                </div>
                <div class="ig-xp-badge">
                    <span>🔥 <b id="ig-streakCount">1</b> dias</span>
                    <span>⭐ <b id="ig-xpCount">0</b> XP</span>
                </div>
            </div>

            <!-- VISÃO DO ALUNO -->
            <div id="ig-alunoView" style="display:none;">
                <div style="padding: 30px 30px 0 30px;">
                    <h1 style="color:#0F172A; font-size:28px; margin:0 0 10px 0;">O Baú está aberto! 🗝️</h1>
                    <p style="color:#64748B; font-size:15px; max-width:800px; margin:0;">Escolha um tesouro para desbloquear hoje. Tudo que você criar aqui, quando aprovado, vira material de estudo para outros alunos.</p>
                </div>
                <div id="ig-gamesGrid" class="ig-games-grid"></div>
            </div>

            <!-- VISÃO DO PROFESSOR -->
            <div id="ig-professorView" style="display:none; min-height: 70vh;">
                <div class="ig-sidebar">
                    <button class="ig-side-item active" data-tab="biblioteca" onclick="Workspace.Ingles.renderProfessorTab('biblioteca')">📚 Biblioteca</button>
                    <button class="ig-side-item" data-tab="envios" onclick="Workspace.Ingles.renderProfessorTab('envios')">📥 Envios Pendentes <span id="ig-pendingCount" style="background:#F59E0B; color:white; padding:2px 6px; border-radius:10px; font-size:11px; margin-left:5px;">0</span></button>
                </div>
                <div id="ig-tab-content" style="flex:1; padding:30px; background:#F8FAFC;"></div>
            </div>

            <!-- MODAL DO JOGO (Isolado e por cima de tudo) -->
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
    }
};