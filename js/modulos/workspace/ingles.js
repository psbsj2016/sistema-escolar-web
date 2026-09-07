// js/modulos/workspace/ingles.js - Módulo Central e Motor de Jogos (Aluno/Professor)
window.Workspace = window.Workspace || {};
if(!window.Workspace.escapeHTML){
    window.Workspace.escapeHTML = (s)=> String(s||'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}

const VoiceService = (() => {
    let cacheNormal = null, cacheMago = null, resolver = null;
    let femalePool = []; 
    const ready = new Promise(r => resolver = r);
    const MALE_BLOCK = ['male','david','alex','daniel','arthur','oliver','mark','guy','james','thomas','fred','bot'];
    
    const SCORE_NORMAL = [
        {k:'online', s:2000}, {k:'natural', s:1900}, {k:'microsoft jenny', s:1800}, {k:'microsoft aria', s:1700},
        {k:'samantha', s:1000}, {k:'google uk english female', s:980}, {k:'google us english female', s:950},
        {k:'aria', s:900}, {k:'jenny', s:890}, {k:'zira', s:850}, {k:'karen', s:800}, {k:'victoria', s:790}
    ];

    const init = () => {
        const vs = window.speechSynthesis?.getVoices() || [];
        if(vs.length){ 
            const en = vs.filter(v => v.lang.toLowerCase().startsWith('en'));
            const pool = en.filter(v => {
                const id = (v.name+' '+v.voiceURI).toLowerCase();
                if (id.includes('female') || id.includes('samantha') || id.includes('aria') || id.includes('jenny')) return true;
                if (/\bmale\b/.test(id)) return false; 
                return !MALE_BLOCK.some(m => id.includes(m));
            });
            
            const scored = (pool.length ? pool : en).map(v=>{
                const id=(v.name+' '+v.voiceURI).toLowerCase();
                let sc=100; 
                SCORE_NORMAL.forEach(o=>{ if(id.includes(o.k)) sc+=o.s; });
                if(id.includes('online') || id.includes('neural') || id.includes('natural')) sc+=300; 
                if(id.includes('female')) sc+=200;
                if(v.localService) sc+=80;
                if(v.default) sc+=50;
                return {v, sc, id};
            }).sort((a,b)=>b.sc-a.sc);

            femalePool = scored.map(x => x.v); 
            cacheMago = femalePool[0]; 
            if(resolver) resolver(true);
        }
    };

    if('speechSynthesis' in window){
        window.speechSynthesis.onvoiceschanged = init;
        init(); setTimeout(init, 300); setTimeout(init, 1000);
    }

    return {
        ready,
        falar: async (text, {rate=0.95, isMago=false}={})=>{
            if(!('speechSynthesis' in window)) return;
            await ready; 
            
            const freshVoices = window.speechSynthesis.getVoices();
            if(freshVoices.length && femalePool.length === 0) init();
            window.speechSynthesis.cancel();
            
            const u = new SpeechSynthesisUtterance(text);
            const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
            
            let vozSelecionada = femalePool[0]; 
            
            const currentJogo = window.Workspace?.Ingles?.jogoAtual;
            if(!isMago && currentJogo && femalePool.length > 0) {
                let hash = 0;
                for (let i = 0; i < currentJogo.length; i++) {
                    hash = currentJogo.charCodeAt(i) + ((hash << 5) - hash);
                }
                const index = Math.abs(hash) % Math.min(femalePool.length, 4); 
                vozSelecionada = femalePool[index];
            } else if (isMago) {
                vozSelecionada = cacheMago;
            }

            if(vozSelecionada){
                u.voice = vozSelecionada; 
                u.lang = vozSelecionada.lang;
                u.pitch = isMago ? 0.90 : 1.0; 
                u.rate = isMago ? 0.90 : rate;
            } else {
                u.lang = isMobile ? 'en-GB' : 'en-US';
                u.pitch = isMago ? 0.90 : 1.0;
                u.rate = isMago ? 0.90 : rate;
            }
            u.volume = 1;
            window.speechSynthesis.speak(u);
            return new Promise(res=>{ u.onend=res; u.onerror=res; });
        }
    };
})();

const SRSService = {
    calc(success, entry){
        const now=Date.now();
        let {ease=2.5, interval=0, repetitions=0, lapses=0} = entry||{};
        if(success){
            if(repetitions===0) interval=1;
            else if(repetitions===1) interval=6;
            else interval=Math.round(interval*ease);
            repetitions++; ease=Math.min(3.0, ease+0.05);
        }else{
            lapses++; repetitions=0; interval=0; ease=Math.max(1.3, ease-0.2);
        }
        const due = success ? now + interval*24*60*60*1000 : now + 2*60*1000;
        return {ease, interval, repetitions, lapses, due, lastSeen:now, updatedAt:now};
    }
};

Workspace.Ingles = {
    state: {
        _dbLoaded: false, 
        _roleplayChat: [],
        streak:1, coins:{bronze:0, prata:0, ouro:0}, words:[], phrases:[], quizzes:[], pictures:[], minimalPairs:[], debates:[], submissions:[], pool:[],
        errosRetidos:[], itensConcluidos:[], srs:{}, _minimalTarget:null, _debateChat:[]
    },
    recognition:null, jogoAtual:null, desafioAtualObj:null,

    defaults: {
        words:[{id:'w1', word:'Although', translation:'Embora', level:'B2'}],
        phrases:[{id:'p1', phrase:'Could you tell me where the nearest pharmacy is?', translation:'Você poderia me dizer onde fica a farmácia mais próxima?', level:'A2'}],
        quizzes:[{id:'q1', question:'Choose the correct sentence:', options:['I have been to London last year','I went to London last year'], correct:1, level:'B1'}],
        pictures:[{id:'pic1', word:'apple', translation:'maçã', emoji:'🍎', category:'Food'}],
        minimalPairs:[{id:'mp1', a:'ship', b:'sheep'}],
        debates:[{id:'d1', topic:'Social media does more harm than good', starter:'Social media connects us, but also increases anxiety. What is your opinion?'}],
        wordPickers:[{id:'wp1', text:'I have _____ my keys.', options:['lost','lose'], correct:0}],
        questions:[{id:'aq1', text:'What did you do last weekend?'}],
        roleplays:[{id:'rp1', title:'✈ No Aeroporto', prompt:'Attendant: Can I see your passport?', tip:'Use: Here you are'}],
        games:[
            {id:'wordSpark', title:'🪄 Feitiço das Palavras', desc:'Crie uma frase com a palavra.', icon:'🪄', color:'#E0E7FF'},
            {id:'readAloud', title:'🐉 Sopro do Dragão', desc:'Fale ao microfone.', icon:'🐉', color:'#D1FAE5'},
            {id:'listenType', title:'🦉 Ecos da Coruja', desc:'Escute e transcreva.', icon:'🦉', color:'#FEF3C7'},
            {id:'quiz', title:'👁 Enigma da Esfinge', desc:'Responda corretamente.', icon:'👁', color:'#FEE2E2'},
            {id:'wordPicker', title:'🧪 Poção Sintática', desc:'Escolha a palavra certa.', icon:'🧪', color:'#E0E7FF'},
            {id:'sentenceShuffle', title:'🌀 Labirinto Ilusório', desc:'Transforme frases.', icon:'🌀', color:'#D1FAE5'},
            {id:'answerQuest', title:'📜 Pergaminho do Herói', desc:'Responda abertamente.', icon:'📜', color:'#FEF3C7'},
            {id:'questionMaker', title:'🔮 Espelho do Oráculo', desc:'Crie a pergunta.', icon:'🔮', color:'#F5D0FE'},
            {id:'contextRole', title:'🎭 Manto do Metamorfo', desc:'Assuma o papel.', icon:'🎭', color:'#CCFBF1'},
            {id:'debateAI', title:'⚔ Duelo de Mentes', desc:'Debata com a IA.', icon:'⚔', color:'#E0F2FE'},
            {id:'minimalPairs', title:'♊ Sussurros Gêmeos', desc:'Diferencie os sons.', icon:'♊', color:'#FFEDD5'},
            {id:'picturePop', title:'👁🗨 Visão do Alquimista', desc:'Fale o que vê.', icon:'👁🗨', color:'#DCFCE7'},
            {id:'memoryGame', title:'🃏 Ilusão do Mago', desc:'Encontre os pares ocultos.', icon:'🃏', color:'#FBCFE8'},
            {id:'hangman', title:'🔤 Enigma das Letras', desc:'Adivinhe a palavra (Forca).', icon:'🔤', color:'#FEE2E2'},
            {id:'videoQuiz', title:'🎬 Cinema do Mago', desc:'Assista e responda.', icon:'🎬', color:'#E0E7FF'}
        ]
    },

    init(){
        this.injetarCSS(); 
        this.construirHTML(); 
        this.bindEvents();
        
        if(typeof Workspace.navegarPara==='function' && !this.navConfigurada){
            const orig=Workspace.navegarPara;
            Workspace.navegarPara=(tela,hist)=>{
                const c=document.getElementById('ws-ingles-container');
                if(c) {
                    if(tela==='ingles') {
                        c.style.display='block';
                        this.abrirBau();
                    } else {
                        c.style.display='none';
                    }
                }
                orig(tela,hist);
            }; this.navConfigurada=true;
        }
    },

    renderizarVisualizacao: function() {
        this.abrirBau();
    },

    abrirBau(){ 
        this.loadDados().then(() => {
            this.renderAlunoGrid();
            this.atualizarHUD();
            
            const isProfessor = Workspace.usuario?.tipo !== 'Aluno';
            const btnProf = document.getElementById('btnProfessor');
            const btnAluno = document.getElementById('btnAluno');
            
            if(isProfessor) {
                if(btnProf) { btnProf.style.display = 'inline-block'; btnProf.classList.add('active'); }
                if(btnAluno) btnAluno.classList.remove('active');
                
                document.getElementById('professorView').classList.remove('hidden');
                document.getElementById('alunoView').classList.add('hidden');
                if (Workspace.InglesProfessor) Workspace.InglesProfessor.handleAction('render-tab', { dataset: { tab: 'biblioteca' } });
            } else {
                if(btnProf) btnProf.style.display = 'none';
                if(btnAluno) btnAluno.classList.add('active');
                
                document.getElementById('alunoView').classList.remove('hidden');
                document.getElementById('professorView').classList.add('hidden');
  
                // 🚀 Dispara a montagem do letreiro para os alunos
                this.renderizarMarquee();
            }
        });
    },

    async loadDados(){
        try{
            const escolaId = Workspace.usuario?.escolaId || 'DEFAULT';
            const res = await Workspace.api(`/workspace/ingles/dados?escolaId=${escolaId}`,'GET');
            
            if(res && res.success && res.dados){
                const d = res.dados;
                const dbJaFoiSalvo = !!d.ultimaAtualizacao;

                if (dbJaFoiSalvo) {
                    this.state._dbLoaded = true; 
                    this.state.words = Array.isArray(d.words) ? d.words : [];
                    this.state.phrases = Array.isArray(d.phrases) ? d.phrases : [];
                    this.state.quizzes = Array.isArray(d.quizzes) ? d.quizzes : [];
                    this.state.pictures = Array.isArray(d.pictures) ? d.pictures : [];
                    this.state.wordPickers = Array.isArray(d.wordPickers) ? d.wordPickers : [];
                    this.state.minimalPairs = Array.isArray(d.minimalPairs) ? d.minimalPairs : [];
                    this.state.debates = Array.isArray(d.debates) ? d.debates : [];
                    this.state.roleplays = Array.isArray(d.roleplays) ? d.roleplays : [];
                    this.state.questions = Array.isArray(d.questions) ? d.questions : [];
                } else {
                    this.state._dbLoaded = false;
                    this.state.words = [...this.defaults.words];
                    this.state.phrases = [...this.defaults.phrases];
                    this.state.quizzes = [...this.defaults.quizzes];
                    this.state.pictures = [...this.defaults.pictures];
                    this.state.wordPickers = [...this.defaults.wordPickers];
                    this.state.minimalPairs = [...this.defaults.minimalPairs];
                    this.state.debates = [...this.defaults.debates];
                    this.state.roleplays = [...this.defaults.roleplays];
                    this.state.questions = [...this.defaults.questions];
                }

                this.state.submissions = Array.isArray(d.submissions) ? d.submissions : [];
                this.state.pool = Array.isArray(d.pool) ? d.pool : [];
                this.state.errosRetidos = Array.isArray(d.errosRetidos) ? d.errosRetidos : [];
                this.state.srs = (d.srs && typeof d.srs==='object') ? d.srs : {};
            }else{
                this.state._dbLoaded = false;
                this.state.words=[...this.defaults.words]; this.state.phrases=[...this.defaults.phrases];
                this.state.quizzes=[...this.defaults.quizzes]; this.state.pictures=[...this.defaults.pictures];
                this.state.wordPickers=[...this.defaults.wordPickers]; this.state.minimalPairs=[...this.defaults.minimalPairs];
                this.state.debates=[...this.defaults.debates]; this.state.roleplays=[...this.defaults.roleplays];
                this.state.questions=[...this.defaults.questions];
                this.state.srs={};
            }
            
            const userK = `ws_ingles_user_${Workspace.usuario?.id||'default'}`;
            try{ this.state.coins = JSON.parse(localStorage.getItem(`${userK}_coins`)||'{"bronze":0,"prata":0,"ouro":0}'); }catch{ this.state.coins={bronze:0,prata:0,ouro:0}; }
            this.state.streak = parseInt(localStorage.getItem(`${userK}_streak`)||'1');
            this.state.itensConcluidos = JSON.parse(localStorage.getItem(`${userK}_concluidos`)||'[]');
            try{
                const localSRS = JSON.parse(localStorage.getItem(`${userK}_srs`)||'{}');
                this.state.srs = {...this.state.srs, ...localSRS};
            }catch{}
        }catch(e){ 
            console.error('Erro de conexão ao ler Banco de Dados:', e); 
        }
    },

    async saveDados(){
        const userK = `ws_ingles_user_${Workspace.usuario?.id||'default'}`;
        try{
            localStorage.setItem(`${userK}_coins`, JSON.stringify(this.state.coins));
            localStorage.setItem(`${userK}_streak`, String(this.state.streak));
            localStorage.setItem(`${userK}_concluidos`, JSON.stringify(this.state.itensConcluidos));
            localStorage.setItem(`${userK}_srs`, JSON.stringify(this.state.srs));
        }catch{}
        
        try{
            if(Workspace.usuario?.tipo==='Aluno'){
                Workspace.api('/workspace/ingles/xp','POST', {
                    userId: Workspace.usuario.id, 
                    escolaId: Workspace.usuario.escolaId, 
                    coins: this.state.coins,
                    streak: this.state.streak
                }).catch(()=>{});
            }
            
            const res = await Workspace.api('/workspace/ingles/dados','PUT',{
                escolaId: Workspace.usuario?.escolaId||'DEFAULT',
                words:this.state.words, phrases:this.state.phrases, quizzes:this.state.quizzes, pictures:this.state.pictures,
                wordPickers:this.state.wordPickers, minimalPairs:this.state.minimalPairs, debates:this.state.debates, roleplays:this.state.roleplays, questions:this.state.questions,
                submissions:this.state.submissions, pool:this.state.pool, errosRetidos:this.state.errosRetidos, srs:this.state.srs
            });
            if(res && res.success) {
                this.state._dbLoaded = true; 
            } else {
                this.mostrarAvisoLocal("Falha ao salvar na nuvem.", "error");
            }
        }catch(e){
            this.mostrarAvisoLocal("Erro de conexão ao salvar.", "error");
        }
    },

    getSRS(id){ return this.state.srs[id] || null; },
    updateSRS(id, tipo, success){
        const prev = this.state.srs[id] || {ease:2.5, interval:0, repetitions:0, lapses:0, due:0, tipo};
        const next = SRSService.calc(success, prev);
        next.tipo = tipo; next.id = id;
        this.state.srs[id] = next;
        this.saveDados();
        return next;
    },
    registrarErro(itemOriginal, tipoConteudo){
        if(!itemOriginal?.id) return;
        const ja = this.state.errosRetidos.find(e=>e.id===itemOriginal.id);
        if(!ja) this.state.errosRetidos.push({...itemOriginal, _tipoDefeito:tipoConteudo});
        this.updateSRS(itemOriginal.id, tipoConteudo, false);
    },
    superarErro(itemId){
        const idx = this.state.errosRetidos.findIndex(e=>e.id===itemId);
        if(idx!==-1) this.state.errosRetidos.splice(idx,1);
    },
    marcarComoConcluido(itemId){
        if(!itemId) return;
        if(!this.state.itensConcluidos.includes(itemId)) this.state.itensConcluidos.push(itemId);
    },

    obterItemInteligente(listaPadrao, tipoConteudo){
        if(!Array.isArray(listaPadrao) || !listaPadrao.length) return null;
        const now = Date.now();
        let concluidos = this.state.itensConcluidos || [];
        
        const comSRS = listaPadrao.map(item=>{
            const srs = this.state.srs[item.id];
            return {item, srs, isDue: srs ? srs.due <= now : false, isNew: !srs || srs.repetitions===0};
        });
        
        const vencidos = comSRS.filter(e=>e.srs && e.isDue).sort((a,b)=>a.srs.due - b.srs.due);
        if(vencidos.length){
            if(Math.random()<0.8) return vencidos[0].item;
            return vencidos[Math.floor(Math.random()*Math.min(3,vencidos.length))].item;
        }
        
        const retidos = this.state.errosRetidos.filter(e=>e._tipoDefeito===tipoConteudo && !concluidos.includes(e.id));
        if(retidos.length && Math.random()<0.6){
            return retidos[Math.floor(Math.random()*retidos.length)];
        }
        
        const novos = comSRS.filter(e=>e.isNew && !concluidos.includes(e.item.id));
        if(novos.length){
            return novos[Math.floor(Math.random()*novos.length)].item;
        }
        
        const disponiveis = listaPadrao.filter(i=>!concluidos.includes(i.id) || (this.state.srs[i.id]?.due||0) <= now);
        
        if(!disponiveis.length) {
            const idsDesteJogo = listaPadrao.map(i => i.id);
            this.state.itensConcluidos = concluidos.filter(id => !idsDesteJogo.includes(id));
            this.saveDados(); 
            return listaPadrao[Math.floor(Math.random() * listaPadrao.length)];
        }
        
        return disponiveis[Math.floor(Math.random()*disponiveis.length)];
    },

    tocarSom(tipo){
        try{
            const ctx = new (window.AudioContext||window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            if(tipo==='coin'){ 
                osc.frequency.value=800; gain.gain.setValueAtTime(0.3, ctx.currentTime); 
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime+0.3); 
                osc.start(); osc.stop(ctx.currentTime+0.3); 
            }
        }catch{}
    },

    similaridade(a,b){
        const norm = s=>s.toLowerCase().trim().replace(/[^\w\s]/g,'');
        let nA = norm(a), nB = norm(b);
        if(nA===nB) return 1;
        if(nB.includes(nA)||nA.includes(nB)) return 0.9;
        return nA.split(' ').some(w=>nB.includes(w))?0.6:0;
    },

    injetarCSS(){
        if(document.getElementById('ws-ingles-css')) return;
        const style = document.createElement('style'); style.id = 'ws-ingles-css';
        style.textContent = `
            #ws-ingles-container { background: #f8fafc; min-height: 80vh; font-family: 'Inter', sans-serif; }
            #bau-do-ingles-module { max-width: 1200px; margin: 0 auto; padding: 20px; }
            
            /* HEADER PREMIUM */
            .bau-header { display: flex; justify-content: space-between; align-items: center; background: #ffffff; padding: 20px 24px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); margin-bottom: 30px; flex-wrap: wrap; gap: 20px; border: 1px solid #f1f5f9; }
            .bau-title { display: flex; align-items: center; gap: 18px; }
            .bau-icon { font-size: 38px; background: linear-gradient(135deg, #fef3c7, #fde68a); width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; border-radius: 18px; border: 2px solid #f59e0b; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.2); }
            .bau-title h2 { margin: 0; font-size: 24px; color: #0f172a; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; letter-spacing: -0.5px; }
            .bau-title p { margin: 4px 0 0 0; font-size: 14px; color: #64748b; font-weight: 600; }
            
            .bau-actions { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
            
           /* CARTEIRA DO ALUNO E LIGAS (HUD RPG) */
            .ig-wallet { display: flex; align-items: center; gap: 12px; }
            .ig-league-badge { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 12px; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: all 0.3s; }
            .liga-bronze { background: #fff7ed; color: #b45309; border: 1px solid #fcd34d; }
            .liga-prata { background: #f8fafc; color: #475569; border: 1px solid #cbd5e1; }
            .liga-ouro { background: #fefce8; color: #d97706; border: 1px solid #fde047; box-shadow: 0 0 12px rgba(253,224,71,0.4); }
            .liga-diamante { background: #f0fdfa; color: #0f766e; border: 1px solid #5eead4; box-shadow: 0 0 15px rgba(45,212,191,0.6); }
            
            .ig-coin-bag { display: flex; align-items: center; gap: 8px; background: #fff; padding: 6px 16px; border-radius: 14px; font-size: 16px; font-weight: 900; color: #d97706; border: 2px solid #fef08a; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.15); transition: transform 0.1s ease-out; }
            .ig-wallet-item.streak { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 12px; font-size: 14px; font-weight: 800; color: #e11d48; border-bottom: 2px solid #fca5a5; background: #fef2f2; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
            
            @keyframes bagBounce { 0% { transform: scale(1); } 40% { transform: scale(1.2) rotate(3deg); } 60% { transform: scale(0.9) rotate(-3deg); } 100% { transform: scale(1); } }
            .bounce-active { animation: bagBounce 0.5s cubic-bezier(0.25, 0.8, 0.25, 1); }

            /* TOGGLE PREMIUM */
            .toggle-wrap { display: flex; background: #f1f5f9; padding: 5px; border-radius: 14px; border: 1px solid #e2e8f0; }
            .toggle-btn { background: transparent; border: none; padding: 10px 18px; border-radius: 10px; font-weight: 800; color: #64748b; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); font-size: 13px; }
            .toggle-btn.active { background: #fff; color: #0f172a; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            
            /* ALUNO VIEW */
            .welcome { text-align: center; margin-bottom: 30px; }
            .welcome h1 { font-family: 'Plus Jakarta Sans', sans-serif; color: #0F172A; margin: 0 0 8px 0; font-size: 28px; }
            .welcome p { color: #475569; max-width: 600px; margin: 0 auto; line-height: 1.5; font-size: 15px; }
            .games-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
            .ig-game-card { background: #fff; border: 2px solid #E2E8F0; border-radius: 16px; padding: 20px; cursor: pointer; transition: 0.2s; }
            .ig-game-card:hover { border-color: #4F46E5; transform: translateY(-4px); box-shadow: 0 10px 25px rgba(79,70,229,0.1); }
            .ig-game-card .ig-top { display: flex; justify-content: space-between; margin-bottom: 12px; align-items: flex-start; }
            .ig-game-card .ig-icon { font-size: 32px; width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
            .ig-game-card h3 { margin: 0 0 6px 0; color: #0F172A; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 18px; }
            .ig-game-card p { margin: 0; color: #64748B; font-size: 13px; line-height: 1.4; }
            
           /* MODAL GERAL (CORREÇÃO DO MODO FOCO TELA INTEIRA) */
            .modal { position: fixed; inset: 0; background: rgba(15,23,42,0.95); display: flex; align-items: center; justify-content: center; z-index: 2147483647 !important; backdrop-filter: blur(10px); transition: opacity 0.3s ease; }
            .modal.hidden { display: none !important; opacity: 0; pointer-events: none; }
            
            .modal-content { background: #fff; width: 100vw; height: 100dvh; max-width: none; max-height: none; border-radius: 0; display: flex; flex-direction: column; overflow: hidden; border: none; transform: scale(0.98); animation: appZoomIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; box-shadow: none; }
            @keyframes appZoomIn { to { transform: scale(1); } }
            
            .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; border-bottom: 1px solid rgba(0,0,0,0.05); background: transparent; z-index: 10; }
            .modal-title { display: flex; align-items: center; gap: 14px; }
            .modal-title h2 { margin: 0; font-size: 22px; color: #0F172A; font-weight: 800; font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.5px; }
            .close-btn { background: rgba(239, 68, 68, 0.1); border: none; width: 40px; height: 40px; border-radius: 12px; color: #EF4444; font-size: 18px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
            .close-btn:hover { background: #EF4444; color: #fff; transform: scale(1.05); }
            
            /* O "Palco" que mantém o jogo centralizado mesmo num ecrã gigante */
            .modal-body { padding: 30px 20px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; align-items: center; }
            .modal-body > * { width: 100%; max-width: 650px; margin: auto; }
            
            /* INPUTS & TEXT */
            .ig-big-phrase { background: #F1F5F9; border: 2px solid #E2E8F0; color: #0F172A; font-weight: 700; font-size: 20px; text-align: center; padding: 20px; border-radius: 12px; margin: 16px 0; }
            .ig-input, .ig-textarea { background: #fff; color: #0F172A; border: 2px solid #CBD5E1; border-radius: 10px; font-weight: 500; font-size: 14px; width: 100%; padding: 12px 14px; box-sizing: border-box; outline: none; transition: 0.2s; font-family:'Inter', sans-serif;}
            .ig-input:focus, .ig-textarea:focus { border-color: #4F46E5; box-shadow: 0 0 0 4px rgba(79,70,229,0.1); }
            
            .ws-btn { font-weight: 700; font-family: 'Inter', sans-serif; transition: 0.2s; cursor: pointer;}
            .hidden { display: none !important; }
            
            /* TOAST (MENSAGENS DE AVISO) */
            .toast { position: fixed; top: 70px; left: 50%; transform: translateX(-50%); background: #F59E0B; color: #fff; padding: 12px 24px; border-radius: 30px; font-weight: 800; z-index: 2147483647; box-shadow: 0 6px 16px rgba(0,0,0,0.25); transition: opacity 0.3s, transform 0.3s; width: auto; max-width: 85vw; box-sizing: border-box; text-align: center; word-wrap: break-word; }
            
            /* 🚀 DASHBOARD DO PROFESSOR (NOVO E POLIDO) */
            #professorView { display: flex; gap: 24px; min-height: 60vh; align-items: stretch; margin-top: 10px; }
            
            /* BARRA LATERAL */
            .ig-sidebar { width: 240px; background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
            .ig-side-item { background: transparent; border: 1px solid transparent; padding: 12px 16px; border-radius: 10px; text-align: left; font-weight: 600; color: #475569; cursor: pointer; transition: 0.2s; display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-family: 'Inter', sans-serif;}
            .ig-side-item:hover { background: #F8FAFC; color: #0F172A; }
            .ig-side-item.active { background: #EEF2FF; border-color: #4F46E5; color: #4F46E5; font-weight: 800; box-shadow: 0 4px 10px rgba(79,70,229,0.1); }
            
            /* ÁREA DE CONTEÚDO */
            .content { flex: 1; background: #fff; border-radius: 16px; border: 1px solid #E2E8F0; padding: 24px; min-width: 0; overflow-x: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.02); } 
            .tab-panel { display: none; animation: fadeIn 0.3s ease; }
            .tab-panel.active { display: block; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            
            /* GRELHAS E CARTÕES INTERNOS */
            .grid-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; align-items: start; }
            .prof-card { background: #fff; border: 1px solid #e2e8f0; padding: 20px; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); display: flex; flex-direction: column; transition: 0.2s; }
            .prof-card:hover { border-color: #cbd5e1; box-shadow: 0 6px 20px rgba(0,0,0,0.06); }
            .ig-prof-header { display: flex; align-items: center; justify-content: space-between; font-family: 'Plus Jakarta Sans', sans-serif; color: #0f172a; font-weight: 800; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; }
            
            /* LISTAS DE ITENS */
            .prof-list-scroll { max-height: 220px; overflow-y: auto; padding-right: 8px; display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
            .prof-list-scroll::-webkit-scrollbar { width: 6px; }
            .prof-list-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
            .prof-list-item { display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 12px 14px; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 13px; color: #1e293b; line-height: 1.4; transition: 0.2s; }
            .prof-list-item:hover { border-color: #cbd5e1; background: #fff; }

            /* BOTÕES PREMIUM */
            .ws-btn-primary { background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff; border: none; padding: 10px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(79,70,229,0.25); transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 6px; flex-shrink: 0; font-size: 14px;}
            .ws-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(79,70,229,0.4); }
            
            .ws-btn-danger { background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; border: none; padding: 8px 14px; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 10px rgba(239,68,68,0.2); transition: 0.2s; flex-shrink: 0; font-size: 13px;}
            .ws-btn-danger:hover { transform: translateY(-2px); box-shadow: 0 6px 14px rgba(239,68,68,0.3); }
            
            .ws-btn-success { background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: none; padding: 10px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(16,185,129,0.2); transition: 0.2s; font-size: 14px;}
            .ws-btn-success:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(16,185,129,0.3); }
            
            /* 🚀 ANIMAÇÕES PREMIUM (Moedas e Ondas Sonoras) */
            @keyframes coinFly { 0% { transform: translate(-50%, 0) scale(1); opacity: 1; } 100% { transform: translate(-50%, -120px) scale(1.8); opacity: 0; } }
            .coin-anim { position: absolute; font-size: 28px; font-weight: 900; color: #D97706; text-shadow: 0 4px 10px rgba(0,0,0,0.3); animation: coinFly 1s cubic-bezier(0.25, 0.8, 0.25, 1) forwards; pointer-events: none; z-index: 100001; }
            
            @keyframes pulseWave { 0%, 100% { height: 6px; } 50% { height: 24px; } }
            .soundwave { display: flex; align-items: center; justify-content: center; gap: 4px; height: 24px; margin-top: 8px; }
            .soundwave div { width: 5px; background: #fff; border-radius: 3px; animation: pulseWave 0.8s infinite ease-in-out; }
            .soundwave div:nth-child(1) { animation-delay: 0.1s; }
            .soundwave div:nth-child(2) { animation-delay: 0.3s; }
            .soundwave div:nth-child(3) { animation-delay: 0.0s; }
            .soundwave div:nth-child(4) { animation-delay: 0.2s; }
            .soundwave div:nth-child(5) { animation-delay: 0.4s; }

            /* 🚀 BARRA DE DOMÍNIO DOS JOGOS */
            .ig-progress-bg { background: rgba(226, 232, 240, 0.5); border-radius: 10px; height: 8px; width: 100%; overflow: hidden; margin-top: 15px; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05); }
            .ig-progress-fill { height: 100%; border-radius: 10px; transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); }

            /* 🚀 JOGO DA MEMÓRIA 3D */
            .memory-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 20px; perspective: 1000px; }
            @media (min-width: 600px) { .memory-grid { grid-template-columns: repeat(4, 1fr); } }
            .memory-card { width: 100%; aspect-ratio: 1; position: relative; cursor: pointer; transform-style: preserve-3d; transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1); }
            .memory-card.is-flipped { transform: rotateY(180deg); }
            .memory-face { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: bold; text-align: center; padding: 10px; box-sizing: border-box; box-shadow: 0 4px 6px rgba(0,0,0,0.1); word-break: break-word; user-select: none; }
            .memory-front { background: linear-gradient(135deg, #c026d3, #db2777); color: transparent; font-size: 30px; }
            .memory-front::after { content: "🪄"; color: white; position: absolute; font-size: 35px; }
            .memory-back { background: white; color: #1e293b; transform: rotateY(180deg); border: 2px solid #e2e8f0; }
            .memory-back.correct { border-color: #10b981; background: #ecfdf5; color: #064e3b; box-shadow: 0 0 15px rgba(16, 185, 129, 0.4); }
            .memory-back.wrong { border-color: #ef4444; background: #fef2f2; color: #7f1d1d; }

            /* 🚀 FORCA (TECLADO VIRTUAL) E VÍDEO QUIZ */
            .hangman-word { font-size: 32px; letter-spacing: 8px; font-weight: 900; color: #0F172A; margin: 20px 0; font-family: monospace; text-transform: uppercase; word-wrap: break-word; }
            .keyboard-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; max-width: 350px; margin: 15px auto 0; }
            .key-btn { width: 38px; height: 38px; background: #fff; border: 2px solid #E2E8F0; border-radius: 8px; font-weight: 800; font-size: 16px; cursor: pointer; transition: 0.2s; color: #1E293B; }
            .key-btn:disabled { background: #F1F5F9; color: #94A3B8; cursor: not-allowed; border-color: #E2E8F0; }
            .key-btn.correct { background: #10B981; color: white; border-color: #10B981; }
            .key-btn.wrong { background: #EF4444; color: white; border-color: #EF4444; opacity: 0.5; }
            .lives-box { font-size: 24px; letter-spacing: 4px; }
            
            .video-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px; margin-bottom: 20px; background: #000; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
            .video-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; }

            /* 🚀 CARROSSEL DE HONRA (LÍDERES) */
            .marquee-wrapper { width: 100%; overflow: hidden; position: relative; margin-bottom: 30px; background: #fff; padding: 24px 0; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.02); }
            .marquee-title { text-align: center; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16px; font-weight: 800; color: #0F172A; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1.5px; }
            .marquee-track { display: flex; width: max-content; animation: scrollMarquee 35s linear infinite; }
            .marquee-track:hover { animation-play-state: paused; }
            @keyframes scrollMarquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
            
            .marquee-card { display: flex; align-items: center; gap: 12px; padding: 12px 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; margin: 0 10px; min-width: 260px; flex-shrink: 0; transition: transform 0.2s; }
            .marquee-card:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0,0,0,0.06); }
            
            /* Destaques do Top 3 */
            .marquee-rank-1 { background: #fffbeb; border-color: #fde68a; box-shadow: 0 4px 15px rgba(251,191,36,0.15); }
            .marquee-rank-2 { background: #f8fafc; border-color: #cbd5e1; box-shadow: 0 4px 15px rgba(148,163,184,0.15); }
            .marquee-rank-3 { background: #fff7ed; border-color: #fcd34d; box-shadow: 0 4px 15px rgba(217,119,6,0.15); }
            
            .marquee-avatar { width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: #e2e8f0; font-size: 20px; flex-shrink: 0; overflow: hidden; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
            .marquee-avatar img, .marquee-avatar > div { width: 100% !important; height: 100% !important; object-fit: cover !important; }
            .marquee-info { display: flex; flex-direction: column; }
            .marquee-name { font-weight: 800; font-size: 15px; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
            .marquee-stats { font-size: 12px; color: #64748b; font-weight: 700; display: flex; align-items: center; gap: 6px; margin-top: 2px; }
            .marquee-medal { font-size: 22px; font-weight: 900; color: #94a3b8; width: 28px; text-align: center; }

            /* RESPONSIVIDADE MOBILE */
            @media (max-width: 768px) {
                #professorView { flex-direction: column; gap: 16px; }
                .ig-sidebar { width: 100%; flex-direction: row; overflow-x: auto; padding: 12px; -webkit-overflow-scrolling: touch; scrollbar-width: none; border-radius: 12px;}
                .ig-sidebar::-webkit-scrollbar { display: none; } 
                .ig-side-item { flex-shrink: 0; padding: 10px 16px; font-size: 13px; }
                .bau-header { flex-direction: column; }
                .bau-actions { width: 100%; justify-content: space-between; }
                .content { padding: 16px; }
                .grid-cards { grid-template-columns: 1fr; }
                .toast { top: 70px; font-size: 13px; padding: 10px 20px; }
            }
        `;
        document.head.appendChild(style);
    },

    construirHTML(){
        let container = document.getElementById('ws-ingles-container');
        if(!container){ 
            container = document.createElement('div'); 
            container.id = 'ws-ingles-container'; 
            container.style.display = 'none'; 
            const p = document.getElementById('ws-main-container'); 
            if(p && p.parentNode) p.parentNode.appendChild(container); 
            else document.body.appendChild(container);
        }
        
        container.innerHTML = `
            <div id="bau-do-ingles-module">
                <div class="bau-header">
                    <div class="bau-title">
                        <div class="bau-icon">🏴‍☠️</div>
                        <div>
                            <h2>Baú do Inglês</h2>
                            <p>O seu treino contínuo guiado por Inteligência Artificial</p>
                        </div>
                    </div>
                    <div class="bau-actions">
                        <!-- 🚀 A NOVA CARTEIRA FINANCEIRA (SISTEMA DE LIGAS) -->
                        <div class="ig-wallet" id="xpBadge">
                            <div id="leagueBadge" class="ig-league-badge liga-bronze">🥉 Bronze</div>
                            <div class="ig-wallet-item streak" title="Dias Seguidos de Estudo">🔥 <span id="streakCount">1</span>d</div>
                            <div id="coinBag" class="ig-coin-bag" title="Total de Moedas Acumuladas">💰 <span id="coinsCount">0</span></div>
                        </div>
                        
                        <!-- 🚀 O NOVO TOGGLE MODERNO -->
                        <div class="toggle-wrap">
                            <button id="btnProfessor" class="toggle-btn" data-action="toggle-prof">👨‍🏫 Professor</button>
                            <button id="btnAluno" class="toggle-btn active" data-action="toggle-aluno">🎓 Aluno</button>
                        </div>
                    </div>
                </div>

                <main id="app">
                    <section id="professorView" class="view hidden">
                        <div class="ig-sidebar">
                            <button class="ig-side-item active" data-action="render-tab" data-tab="biblioteca">📚 Biblioteca</button>
                            <button class="ig-side-item" data-action="render-tab" data-tab="imagens">🖼️ Figuras</button>
                            <button class="ig-side-item" data-action="render-tab" data-tab="envios">📥 Envios <span class="count" id="pendingCount" style="background:#F59E0B; color:#fff; padding:2px 6px; border-radius:10px; font-size:11px;">0</span></button>
                            <button class="ig-side-item" data-action="render-tab" data-tab="algoritmo">🧠 Algoritmo</button>
                            <button class="ig-side-item" data-action="render-tab" data-tab="ranking">🏆 Ranking</button>
                            <button class="ig-side-item" data-action="render-tab" data-tab="laboratorio" style="border-color:#10B981; color:#059669; background:#ECFDF5; font-weight:800;">🧪 Laboratório IA</button>
                        </div>
                        <div class="content">
                            <!-- Os painéis são renderizados via JS -->
                            <div id="tab-biblioteca" class="tab-panel active"></div>
                            <div id="tab-imagens" class="tab-panel"></div>
                            <div id="tab-envios" class="tab-panel"></div>
                            <div id="tab-algoritmo" class="tab-panel"></div>
                            <div id="tab-ranking" class="tab-panel"></div>
                            <div id="tab-laboratorio" class="tab-panel"></div>
                        </div>
                    </section>

                  <section id="alunoView" class="view">
                        <!-- 🚀 O Letreiro Animado (Ranking Top 9) -->
                        <div class="marquee-wrapper" id="ig-marquee-wrapper" style="display:none;">
                            <div class="marquee-title">🏆 Top 9 Bilionários da Escola 🏆</div>
                            <div class="marquee-track" id="ig-marquee-track"></div>
                        </div>

                        <!-- 🚀 A GRELHA DE JOGOS (Corrigido: Este elemento não pode sumir!) -->
                        <div class="games-grid" id="gamesGrid"></div>
                    </section>
                </main>
            </div>

            <div id="gameModal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="modal-title">
                            <span id="modalIcon" style="font-size:24px;"></span>
                            <h2 id="modalTitle"></h2>
                        </div>
                        <button data-action="fechar-jogo" class="close-btn">✕</button>
                    </div>
                    <div id="modalBody" class="modal-body"></div>
                </div>
            </div>

            <div id="toast" class="toast hidden"></div>
        `;
    },

  atualizarHUD(valorAntigo = null){
        // 🚀 MIGRAR MOEDAS ANTIGAS SILENCIOSAMENTE: Converte a carteira velha para o saldo unificado!
        if (this.state.coins && (this.state.coins.prata > 0 || this.state.coins.ouro > 0)) {
            this.state.coins.bronze = (this.state.coins.bronze || 0) + (this.state.coins.prata * 100) + (this.state.coins.ouro * 10000);
            this.state.coins.prata = 0;
            this.state.coins.ouro = 0;
            this.saveDados();
        }

        const bzEl = document.getElementById('coinsCount');
        const stEl = document.getElementById('streakCount');
        const leagueBadge = document.getElementById('leagueBadge');
        const coinBag = document.getElementById('coinBag');
        
        const totalMoedas = this.state.coins?.bronze || 0;
        
        // 🚀 O NOVO SISTEMA DE LIGAS
        let ligaInfo = { classe: 'liga-bronze', texto: '🥉 Bronze' };
        if (totalMoedas >= 500000000) {
            ligaInfo = { classe: 'liga-diamante', texto: '💎 Diamante' };
        } else if (totalMoedas >= 1000000) {
            ligaInfo = { classe: 'liga-ouro', texto: '🥇 Ouro' };
        } else if (totalMoedas >= 100000) {
            ligaInfo = { classe: 'liga-prata', texto: '🥈 Prata' };
        }

        if (leagueBadge) {
            leagueBadge.className = `ig-league-badge ${ligaInfo.classe}`;
            leagueBadge.innerHTML = ligaInfo.texto;
        }

        // 🚀 O EFEITO VÍCIO: Rola os números e faz o saco pular!
        if (bzEl) {
            if (valorAntigo !== null && valorAntigo !== totalMoedas) {
                this.animarContador('coinsCount', valorAntigo, totalMoedas, 1200); // 1.2 segundos rodando
                if (coinBag) {
                    coinBag.classList.remove('bounce-active');
                    void coinBag.offsetWidth; // Força recomeço da animação
                    coinBag.classList.add('bounce-active');
                }
            } else {
                bzEl.textContent = totalMoedas.toLocaleString('pt-BR');
            }
        }
        if (stEl) stEl.textContent = this.state.streak || 1;
    },

    ganharCoins(tipo, qtd){
        this.state.coins = this.state.coins || {bronze:0, prata:0, ouro:0};
        
        // Guarda o valor que tínhamos antes do acerto
        const valorAntigo = this.state.coins.bronze || 0;
        
        // Agora usamos o "bronze" como a moeda única universal do jogo
        this.state.coins.bronze += qtd; 
        
        this.tocarSom('coin'); 
        
        // Passa o valor antigo para o HUD calcular a animação de rolagem
        this.atualizarHUD(valorAntigo);
        this.saveDados();
    },

    animarContador: function(id, start, end, duration) {
        const obj = document.getElementById(id);
        if (!obj) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3); // Deixa mais lento no final
            const current = Math.floor(easeOut * (end - start) + start);
            obj.innerHTML = current.toLocaleString('pt-BR');
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = end.toLocaleString('pt-BR');
            }
        };
        window.requestAnimationFrame(step);
    },

    mostrarAvisoLocal(msg, tipo='success'){
        const toast = document.getElementById('toast');
        if(!toast) return;
        toast.innerHTML = msg;
        toast.style.background = tipo==='success' ? '#10B981' : (tipo==='error'?'#EF4444':'#F59E0B');
        toast.classList.remove('hidden');
        setTimeout(()=>toast.classList.add('hidden'), 2000);
    },


    bindEvents(){
        const root = document.getElementById('ws-ingles-container');
        if(!root || root._bound) return; root._bound=true;
        
        root.addEventListener('click', async e=>{
            const b = e.target.closest('[data-action]'); if(!b) return;
            const a = b.dataset.action;
            
           // 🚀 LISTA OFICIAL DE TODAS AS AÇÕES DO PROFESSOR
            const profActions = [
                'render-tab', 'remover-item', 'add-word', 'add-phrase', 
                'add-quiz', 'add-pic', 'add-wordPicker', 'add-minimal', 
                'add-debate', 'add-roleplay', 'add-question', 'aprovar-envio', 
                'rejeitar-envio', 'atualizar-ranking', 'ensinar-ia', 'falar-ia',
                'ensinar-correcao', 'falar-groq' // <--- A NOVA AÇÃO ADICIONADA AQUI!
            ];
            
            if (profActions.includes(a)) {
                if (Workspace.InglesProfessor && typeof Workspace.InglesProfessor.handleAction === 'function') {
                    Workspace.InglesProfessor.handleAction(a, b);
                } else {
                    this.mostrarAvisoLocal('Módulo do Professor não carregado.', 'error');
                }
                return;
            }

            if(a === 'toggle-prof') {
                if(Workspace.usuario?.tipo === 'Aluno') { this.mostrarAvisoLocal('Apenas para Mestres!','error'); return; }
                document.getElementById('btnProfessor').classList.add('active');
                document.getElementById('btnAluno').classList.remove('active');
                document.getElementById('professorView').classList.remove('hidden');
                document.getElementById('alunoView').classList.add('hidden');
                
                this.loadDados().then(() => {
                    if (Workspace.InglesProfessor) Workspace.InglesProfessor.handleAction('render-tab', { dataset: { tab: 'biblioteca' } });
                });
            }
            if(a === 'toggle-aluno') {
                document.getElementById('btnAluno').classList.add('active');
                document.getElementById('btnProfessor').classList.remove('active');
                document.getElementById('alunoView').classList.remove('hidden');
                document.getElementById('professorView').classList.add('hidden');
            }

            if(a === 'fechar-jogo') this.fecharJogo();
            if(a === 'abrir-jogo') this.abrirJogo(b.dataset.gameId);
            if(a === 'iniciar-jogo') { e.preventDefault(); this.renderDesafioAtual(); }

            const cur = this.desafioAtualObj;
            const listen = document.getElementById('ig-listenInput')?.value?.trim()||'';
            const inputGenerico = document.getElementById('ig-input')?.value?.trim()||'';
            
            if(a === 'falar-frase'){
                if(cur?.phrase) VoiceService.falar(cur.phrase, {isMago:false});
                else if(cur?.word) VoiceService.falar(cur.word);
                else if(b.dataset.text) VoiceService.falar(b.dataset.text);
            }
            if(a === 'iniciar-voz'){
                const esperado = cur?.word||cur?.phrase||this.state._minimalTarget;
                if(esperado) this.iniciarReconhecimentoDeVoz(esperado, cur, b.dataset.tipo||'phrase');
            }
            if(a === 'verificar-wordSpark'){
                // 🚀 Removemos o bloqueio rígido do '.includes()'. A IA é que vai julgar se a palavra (ou conjugação) foi usada!
                if(inputGenerico.length < 2){
                    this.mostrarAvisoLocal(`Escreva uma frase válida!`, 'warning');
                    return;
                }
                b.disabled = true; b.innerText = '🧙 Avaliando com IA...';
                
                // Nota: O prefixo /workspace é necessário na rota dependendo da configuração do servidor
                Workspace.api('/workspace/ingles/jogo/avaliar','POST',{
                    jogo: 'wordSpark',
                    palavra: cur.word,
                    fraseAluno: inputGenerico
                }).then(r=>{
                    b.disabled = false; b.innerText = 'Lançar Feitiço ✨';
                    if(r.success && r.correto){
                        document.getElementById('modalBody').innerHTML += `<div style="margin-top:15px; background:#ECFDF5; border:1px solid #10B981; padding:12px; border-radius:10px; font-size:13px; animation: fadeIn 0.3s;"><b>✅ ${r.feedback}</b><br>📝 ${Workspace.escapeHTML(r.correcao)}</div>`;
                        setTimeout(()=>{ this.updateSRS(cur.id,'word',true); this.superarErro(cur.id); this.sucessoGenerico(r.coins||50); }, 2000);
                    } else {
                        this.registrarErro(cur,'word');
                        document.getElementById('modalBody').innerHTML += `<div style="margin-top:15px; background:#FEF2F2; border:1px solid #EF4444; padding:12px; border-radius:10px; font-size:13px; animation: fadeIn 0.3s;">❌ ${Workspace.escapeHTML(r.feedback || 'Tente melhorar')}<br>💡 Sugestão: ${Workspace.escapeHTML(r.correcao || '')}</div>`;
                        setTimeout(()=> this.falhaGenerica(), 3000);
                    }
                }).catch(()=>{
                    b.disabled = false; b.innerText = 'Lançar Feitiço ✨';
                    this.mostrarAvisoLocal('Erro de ligação.', 'error');
                });
            }
            if(a === 'verificar-listen'){
                const sim = this.similaridade(listen, cur.phrase);
                if(sim>=0.9){ this.updateSRS(cur.id,'phrase',true); this.superarErro(cur.id); this.sucessoGenerico(50); }
                else { this.registrarErro(cur,'phrase'); this.falhaGenerica(); }
            }
            if(a === 'verificar-quiz'){
                const idx = parseInt(b.dataset.index);
                if(idx===cur.correct){ this.updateSRS(cur.id,'quiz',true); this.superarErro(cur.id); this.sucessoGenerico(30); }
                else { this.registrarErro(cur,'quiz'); this.falhaGenerica(); }
            }
            if(a === 'verificar-minimal'){
                if(b.dataset.choice===this.state._minimalTarget){ this.updateSRS(cur.id,'minimal',true); this.superarErro(cur.id); this.sucessoGenerico(75); }
                else { this.registrarErro(cur,'minimal'); this.falhaGenerica(); }
            }
            if(a === 'verificar-picker'){
                const idx = parseInt(b.dataset.index);
                if(idx===cur.correct){ this.updateSRS(cur.id,'picker',true); this.superarErro(cur.id); this.sucessoGenerico(20); }
                else { this.registrarErro(cur,'picker'); this.falhaGenerica(); }
            }
            if(a === 'verificar-picture-text'){
                const sim = this.similaridade(inputGenerico, cur.word);
                if(sim>=0.9){ this.updateSRS(cur.id,'picture',true); this.superarErro(cur.id); this.sucessoGenerico(75); }
                else { this.registrarErro(cur,'picture'); this.falhaGenerica(); }
            }
            if(a === 'verificar-forca'){
                const letra = b.dataset.letra;
                if(!this.state._hangmanGuessed.includes(letra)) {
                    this.state._hangmanGuessed.push(letra);
                    if(!this.state._hangmanWord.includes(letra)) {
                        this.state._hangmanLives--; // Perde uma vida
                    }
                    this.atualizarTelaForca();
                }
            }
          if(a === 'verificar-envio'){
                const caixaDeTexto = document.querySelector('#modalBody #ig-input') || document.getElementById('ig-input');
                const respostaDoAluno = caixaDeTexto?.value?.trim() || '';

                if(respostaDoAluno.length < 2) return this.mostrarAvisoLocal('Responda com conteúdo válido', 'error');
                
                const gameId = b.dataset.game;

                // 🚀 ADICIONADO: 'picturePop' na lista e captura da palavra alvo!
                if(['contextRole','answerQuest','sentenceShuffle','questionMaker','picturePop'].includes(gameId)){
                    b.disabled = true; b.innerText = '🤖 A IA está a avaliar a sua resposta...';
                    
                    const payload = {
                        jogo: gameId === 'sentenceShuffle' ? 'answerQuest' : gameId,
                        pergunta: cur.text || cur.phrase || cur.title,
                        palavra: cur.word || '', // 🚀 Enviamos a palavra que o emoji representa!
                        tarefaEspecifica: cur.taskType || '',
                        respostaAluno: respostaDoAluno,
                        cenario: cur,
                        historico: this.state._roleplayChat || []
                    };
                    
                    Workspace.api('/workspace/ingles/jogo/avaliar','POST', payload).then(r=>{
                        b.disabled = false;
                        b.innerText = 'Submeter Resposta';
                        
                        if(!r.success) {
                            return this.mostrarAvisoLocal('Ocorreu um erro na IA. Tente de novo!', 'error');
                        }

                        if(gameId === 'contextRole'){
                            if(!this.state._roleplayChat) this.state._roleplayChat = [];
                            this.state._roleplayChat.push({role:'user', content: respostaDoAluno});
                            this.state._roleplayChat.push({role:'assistant', content: r.npcResponse});
                            
                            document.getElementById('modalBody').innerHTML = `
                                <div style="background:#FEF3C7; padding:10px; border-radius:8px; font-size:12px; margin-bottom:12px; border-left:4px solid #D97706;">
                                    ${r.correcao && r.correcao !== 'null' ? `💡 <b>Dica:</b> ${Workspace.escapeHTML(r.correcao)}` : `✅ ${Workspace.escapeHTML(r.feedback || 'Muito bem!')}`}
                                </div>
                                <div class="ig-big-phrase" style="text-align:left; background:#EEF2FF; border-color:#818CF8; font-size:16px;">
                                    🎭 <b>Personagem:</b> <br><br> ${Workspace.escapeHTML(r.npcResponse)}
                                </div>
                                <textarea id="ig-input" class="ig-textarea" placeholder="O que responde agora?..." style="min-height:80px; margin-top:12px; border-color:#818CF8;"></textarea>
                                <button data-action="verificar-envio" data-game="contextRole" class="ws-btn" style="width:100%; background:linear-gradient(135deg, #10b981, #059669); color:#fff; margin-top:12px; padding:14px; border-radius:12px; border:none; font-weight:bold; cursor:pointer;">Continuar a Conversa 🎭</button>
                            `;
                            this.ganharCoins('bronze', 20);
                        } else {
                            if(r.correto){
                                document.getElementById('modalBody').innerHTML += `<div style="margin-top:15px; background:#ECFDF5; border:1px solid #10B981; padding:12px; border-radius:10px; font-size:13px; animation: fadeIn 0.3s;"><b>✅ ${r.feedback}</b><br>✨ Sugestão: ${Workspace.escapeHTML(r.correcao)}</div>`;
                                setTimeout(()=>{ this.sucessoGenerico(50); }, 2000);
                            } else {
                                this.registrarErro(cur, gameId);
                                // 🚀 CORREÇÃO DO ERRO DE SINTAXE: Substituído ']' por ')' em getElementById
                                document.getElementById('modalBody').innerHTML += `<div style="margin-top:15px; background:#FEF2F2; border:1px solid #EF4444; padding:12px; border-radius:10px; font-size:13px; animation: fadeIn 0.3s;">❌ ${Workspace.escapeHTML(r.feedback)}<br>💡 Sugestão: ${Workspace.escapeHTML(r.correcao)}</div>`;
                                setTimeout(()=> this.renderDesafioAtual(), 2500);
                            }
                        }
                    }).catch(() => {
                        b.disabled = false;
                        b.innerText = 'Submeter Resposta';
                        this.mostrarAvisoLocal('Ligação interrompida.','error');
                    });
                    return;
                }

                this.state.submissions.unshift({id:'sub_'+Date.now(), student:Workspace.usuario?.nome||'Aluno', game:gameId, text:respostaDoAluno, status:'pending'});
                if(cur?.id) this.updateSRS(cur.id, gameId, true);
                this.sucessoGenerico(parseInt(b.dataset.bonus||'50'));
            }

            if(a === 'verificar-debate'){
                const inputEl = document.getElementById('ig-input');
                const texto = inputEl?.value?.trim() || '';
                
                if(texto.length < 3) return this.mostrarAvisoLocal('Escreva o seu argumento para o debate!', 'error');
                
                this.state._debateChat.push({ role: 'user', text: texto });
                this.ganharCoins('bronze', 15);
                this.renderGameDebateAI(); 
                
                inputEl.value = '';
                
                const chatDiv = document.getElementById('ig-debate-chat');
                const loadingId = 'loading-mago-' + Date.now();
                chatDiv.insertAdjacentHTML('beforeend', `
                    <div id="${loadingId}" style="display:flex; margin-bottom:12px; animation: fadeIn 0.3s;">
                        <div style="background:#F1F5F9; border:1px solid #E2E8F0; color:#64748B; padding:12px 16px; border-radius:4px 16px 16px 16px; font-size:13px; font-weight:600;">
                            🤖 A IA está a formular uma resposta... ⏳
                        </div>
                    </div>
                `);
                chatDiv.scrollTop = chatDiv.scrollHeight;

                Workspace.api('/workspace/ingles/debate', 'POST', {
                    topico: this.desafioAtualObj.topic,
                    historico: this.state._debateChat
                }).then(res => {
                    const loadingEl = document.getElementById(loadingId);
                    if(loadingEl) loadingEl.remove();

                    if(res && res.success) {
                        this.state._debateChat.push({ role: 'ai', text: res.resposta });
                        this.renderGameDebateAI();
                        if (this.state.magoConfig?.vozAtiva) {
                            VoiceService.falar(res.resposta, { isMago: true });
                        }
                    } else {
                        this.mostrarAvisoLocal('A magia falhou.', 'error');
                    }
                }).catch(() => {
                    const loadingEl = document.getElementById(loadingId);
                    if(loadingEl) loadingEl.remove();
                    this.mostrarAvisoLocal('Falha de conexão com a IA.', 'error');
                });
            }
        }); 
        
        root.addEventListener('change', e=>{
            if(e.target.id==='mago-voz-toggle' || e.target.id==='mago-modo-select') {
                if(Workspace.InglesProfessor && typeof Workspace.InglesProfessor.atualizarConfigMago === 'function') Workspace.InglesProfessor.atualizarConfigMago();
            }
        });
    },

   renderAlunoGrid(){
        const grid = document.getElementById('gamesGrid'); if(!grid) return;
        const concluidos = this.state.itensConcluidos || [];

        grid.innerHTML = this.defaults.games.map(g=>{
            const vencidos = Object.values(this.state.srs).filter(s=>s.tipo===g.id && s.due<=Date.now()).length;
            
            // 🚀 CÁLCULO DE DOMÍNIO (PROGRESSO)
            const colecao = this.getColecaoPorJogo(g.id);
            const total = colecao.length;
            const feitos = colecao.filter(item => concluidos.includes(item.id)).length;
            const percentagem = total > 0 ? Math.round((feitos / total) * 100) : 0;
            const corBarra = g.color.replace('E0E7FF','#4F46E5').replace('FEF3C7','#D97706').replace('D1FAE5','#059669').replace('FEE2E2','#EF4444').replace('F5D0FE','#C026D3').replace('CCFBF1','#0D9488').replace('E0F2FE','#0284C7').replace('FFEDD5','#EA580C').replace('DCFCE7','#16A34A');

            return `
            <div class="ig-game-card" data-action="abrir-jogo" data-game-id="${g.id}">
                <div class="ig-top">
                    <div class="ig-icon" style="background:${g.color}40; color:${corBarra}">${g.icon}</div>
                </div>
                <h3>${g.title} ${vencidos?'🔥':''}</h3>
                <p>${g.desc}</p>
                
                <!-- 🚀 A NOVA BARRA DE DOMÍNIO -->
                <div class="ig-progress-bg" title="Domínio: ${percentagem}%">
                    <div class="ig-progress-fill" style="width: ${percentagem}%; background: ${corBarra};"></div>
                </div>

                <div style="margin-top:12px; display:flex; gap:8px; justify-content:space-between; align-items:center;">
                    <span style="background:#F1F5F9; color:#475569; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:700;">🪙 +${['picturePop','minimalPairs'].includes(g.id)?'75':'50'} BZ</span>
                    ${vencidos ? `<span style="color:#EF4444; font-size:11px; font-weight:700;">${vencidos} para revisar</span>` : `<span style="color:#64748B; font-size:11px; font-weight:700;">${percentagem}% Concluído</span>`}
                </div>
            </div>`;
        }).join('');
    },

    abrirJogo(id){
        try{ speechSynthesis.cancel(); }catch{}
        this.jogoAtual = id;
        const game = this.defaults.games.find(g=>g.id===id); if(!game) return;
        if(id !== 'debateAI') { this.state._debateChat=[]; }
        if(id !== 'contextRole') { this.state._roleplayChat=[]; }
        
        document.getElementById('modalIcon').textContent = game.icon;
        document.getElementById('modalTitle').textContent = game.title;
        
        // 🚀 TEMATIZAÇÃO MÁGICA: O gradiente agora desce de forma mais imersiva
        const modalContent = document.querySelector('#gameModal .modal-content');
        if (modalContent) {
            modalContent.style.background = `linear-gradient(to bottom, #ffffff 30%, ${game.color}60 100%)`;
            modalContent.style.borderColor = 'transparent'; // Sem borda na tela inteira
        }

        // 🚀 TRAVA O SCROLL DO FUNDO (UX de Aplicação Nativa)
        document.body.style.overflow = 'hidden';

        document.getElementById('gameModal').classList.remove('hidden');
        this.renderGameCapa();
    },

    fecharJogo(){
        try{ speechSynthesis.cancel(); }catch{}
        document.getElementById('gameModal').classList.add('hidden');
        
        // 🚀 DESTRAVA O SCROLL DO FUNDO ao voltar ao Hub
        document.body.style.overflow = '';
        
        this.renderAlunoGrid();
    },

   sucessoGenerico: async function(bonusBase){
        if(this.desafioAtualObj?.id){ 
            this.marcarComoConcluido(this.desafioAtualObj.id); 
            this.updateSRS(this.desafioAtualObj.id, this.jogoAtual, true); 
        }
        
        this.ganharCoins('bronze', bonusBase);
        this.tocarSom('coin'); 
        
        // 🚀 A INJEÇÃO DA MOEDA VOADORA
        const modalBody = document.getElementById('modalBody');
        if (modalBody) {
            const coinAnim = document.createElement('div');
            coinAnim.className = 'coin-anim';
            coinAnim.innerText = `🪙 +${bonusBase}`;
            coinAnim.style.left = '50%';
            coinAnim.style.top = '30%';
            modalBody.appendChild(coinAnim);
            setTimeout(() => coinAnim.remove(), 1000); // Limpa após a animação
        }

        const srs = this.state.srs[this.desafioAtualObj?.id];
        this.mostrarAvisoLocal(`Próxima revisão em ${srs?.interval||1} dia(s)`, 'success');

        setTimeout(() => {
            const modal = document.getElementById('gameModal');
            if(modal && !modal.classList.contains('hidden')){
                this.renderDesafioAtual();
            }
        }, 1200); 
    },
    
    falhaGenerica: async function(){
        if(this.desafioAtualObj?.id) this.updateSRS(this.desafioAtualObj.id, this.jogoAtual, false);
        this.mostrarAvisoLocal(`❌ Erro guardado para revisão. Voltará em breve!`, 'error');
        
        setTimeout(() => {
            const modal = document.getElementById('gameModal');
            if(modal && !modal.classList.contains('hidden')){
                this.renderDesafioAtual();
            }
        }, 1500);
    },

    getColecaoDoJogoAtual(){
        const id = this.jogoAtual;
        const db = this.state._dbLoaded; 
        
        if(id==='wordSpark') return db ? this.state.words : this.defaults.words;
        if(['readAloud','listenType','sentenceShuffle'].includes(id)) return db ? this.state.phrases : this.defaults.phrases;
        if(id==='quiz') return db ? this.state.quizzes : this.defaults.quizzes;
        if(id==='wordPicker') return db ? this.state.wordPickers : this.defaults.wordPickers;
        if(id==='minimalPairs') return db ? this.state.minimalPairs : this.defaults.minimalPairs;
        if(id==='picturePop') return db ? this.state.pictures : this.defaults.pictures;
        if(id==='answerQuest') return db ? this.state.questions : this.defaults.questions;
        if(id==='contextRole') return db ? this.state.roleplays : this.defaults.roleplays;
        if(id==='debateAI') return db ? this.state.debates : this.defaults.debates;
        if(id==='questionMaker') return this.state.pool.filter(p=>p.type==='answerQuest');
        if(id==='hangman') return db ? this.state.words : this.defaults.words;
        if(id==='videoQuiz') {
            const todosQuizzes = db ? this.state.quizzes : this.defaults.quizzes;
            return todosQuizzes.filter(q => q.videoUrl && q.videoUrl.trim() !== ''); // Puxa só os que têm vídeo
        }
        return null;
    },

   getColecaoPorJogo: function(id){
        const db = this.state._dbLoaded; 
        if(id==='wordSpark') return db ? this.state.words : this.defaults.words;
        if(['readAloud','listenType','sentenceShuffle'].includes(id)) return db ? this.state.phrases : this.defaults.phrases;
        if(id==='quiz') return db ? this.state.quizzes : this.defaults.quizzes;
        if(id==='wordPicker') return db ? this.state.wordPickers : this.defaults.wordPickers;
        if(id==='minimalPairs') return db ? this.state.minimalPairs : this.defaults.minimalPairs;
        if(id==='picturePop') return db ? this.state.pictures : this.defaults.pictures;
        if(id==='answerQuest') return db ? this.state.questions : this.defaults.questions;
        if(id==='contextRole') return db ? this.state.roleplays : this.defaults.roleplays;
        if(id==='debateAI') return db ? this.state.debates : this.defaults.debates;
        if(id==='questionMaker') return this.state.pool.filter(p=>p.type==='answerQuest');
        if(id==='hangman') return db ? this.state.words : this.defaults.words;
        if(id==='videoQuiz') {
            const todosQuizzes = db ? this.state.quizzes : this.defaults.quizzes;
            return todosQuizzes.filter(q => q.videoUrl && q.videoUrl.trim() !== ''); // Puxa só os que têm vídeo
        }
        return [];
    },

    renderDesafioAtual(){
        this.desafioAtualObj = null;
        const id = this.jogoAtual;
        if(id==='wordSpark') this.renderGameWordSpark();
        else if(id==='readAloud') this.renderGameReadAloud();
        else if(id==='listenType') this.renderGameListenType();
        else if(id==='quiz') this.renderGameQuiz();
        else if(id==='wordPicker') this.renderGameWordPicker();
        else if(id==='sentenceShuffle') this.renderGameSentenceShuffle();
        else if(id==='answerQuest') this.renderGameAnswerQuest();
        else if(id==='questionMaker') this.renderGameQuestionMaker();
        else if(id==='contextRole') this.renderGameContextRole();
        else if(id==='debateAI') this.renderGameDebateAI();
        else if(id==='minimalPairs') this.renderGameMinimalPairs();
        else if(id==='picturePop') this.renderGamePicturePop();
        else if(id==='memoryGame') this.renderGameMemory();
        else if(id==='hangman') this.renderGameHangman();
        else if(id==='videoQuiz') this.renderGameVideoQuiz();
    },

    renderTelaFimDeJornada(){
        const colecao = this.getColecaoDoJogoAtual();
        if(!colecao || colecao.length === 0){
            document.getElementById('modalBody').innerHTML = `<div style="text-align:center;padding:40px;"><h3 style="color:#64748B;">Ainda não há conteúdo criado para este jogo.</h3></div>`;
            return;
        }

        const ids = colecao.map(i=>i.id);
        this.state.itensConcluidos = (this.state.itensConcluidos||[]).filter(id=>!ids.includes(id));
        this.saveDados();
        
        this.renderDesafioAtual();
    },

    renderGameCapa(){
        const game = this.defaults.games.find(g=>g.id===this.jogoAtual);
        const col = this.getColecaoDoJogoAtual();
        const totalItens = (col||[]).length;
        document.getElementById('modalBody').innerHTML=`
            <div style="text-align:center; padding:20px 0;">
                <div style="font-size:60px; margin-bottom:16px;">${game.icon}</div>
                <h2 style="font-family:'Plus Jakarta Sans'; color:#0F172A; margin:0 0 8px 0;">${game.title}</h2>
                <p style="color:#64748B; font-size:15px; margin:0 0 20px 0;">${game.desc}</p>
                <div style="display:inline-flex; gap:10px; background:#F8FAFC; padding:10px 16px; border-radius:12px; border:1px solid #E2E8F0; margin-bottom:24px;">
                    <span style="font-weight:700; font-size:13px; color:#475569;">📦 ${totalItens} Desafios (SRS)</span>
                    <span style="font-weight:700; font-size:13px; color:#D97706;">🪙 Recompensa Contínua</span>
                </div>
                <button data-action="iniciar-jogo" class="ws-btn" style="width:100%; background:linear-gradient(135deg, #6366f1, #4f46e5); color:#fff; border:none; padding:16px; border-radius:12px; font-size:16px; font-weight:bold; cursor:pointer; box-shadow: 0 4px 12px rgba(79,70,229,0.3);">Começar Treino Infinito ▶</button>
            </div>
        `;
    },

    renderGameWordSpark(){
        const col = this.getColecaoDoJogoAtual();
        this.desafioAtualObj = this.obterItemInteligente(col, 'word'); 
        if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const w = this.desafioAtualObj;
        
        document.getElementById('modalBody').innerHTML=`
            <div style="text-align:center;">
                <div class="ig-big-phrase" style="font-size:32px; color:#4F46E5;">${Workspace.escapeHTML(w.word)}</div>
                <p style="font-weight:700; color:#64748B;">Tradução: ${Workspace.escapeHTML(w.translation||'')}</p>
                <p style="font-weight:600; margin-top:20px;">Crie uma frase usando esta palavra:</p>
                <textarea id="ig-input" class="ig-textarea" placeholder="Type your sentence here..." style="min-height:100px; margin-top:10px;"></textarea>
                <button data-action="verificar-wordSpark" class="ws-btn" style="width:100%; background:linear-gradient(135deg, #6366f1, #4f46e5); color:#fff; border:none; padding:16px; border-radius:12px; margin-top:16px; cursor:pointer;">Lançar Feitiço ✨</button>
            </div>`;
    },

    renderGameReadAloud(){
        const col = this.getColecaoDoJogoAtual();
        this.desafioAtualObj = this.obterItemInteligente(col, 'phrase'); 
        if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const p = this.desafioAtualObj;
        document.getElementById('modalBody').innerHTML=`
            <div class="ig-big-phrase">${Workspace.escapeHTML(p.phrase)}</div>
            <div style="text-align:center; margin:15px 0;">
                <button data-action="falar-frase" class="ws-btn" style="background:#0F172A; color:#fff; padding:10px 20px; border-radius:20px; border:none; cursor:pointer;">🔊 Ouvir</button>
            </div>
            <div style="background:#F8FAFC; padding:20px; border-radius:12px; border:1px solid #E2E8F0; text-align:center;">
                <p style="font-weight:600; margin:0 0 10px 0;">Sua vez de ler:</p>
                <button data-action="iniciar-voz" data-tipo="phrase" class="ws-btn" style="background:linear-gradient(135deg, #10b981, #059669); color:#fff; width:100%; padding:14px; border-radius:12px; border:none; cursor:pointer;">🎤 Gravar</button>
                <div id="ig-speechResult" style="margin-top:15px; font-weight:600;"></div>
            </div>`;
    },

    renderGameListenType(){
        const col = this.getColecaoDoJogoAtual();
        this.desafioAtualObj = this.obterItemInteligente(col, 'phrase'); 
        if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        document.getElementById('modalBody').innerHTML=`
            <div style="text-align:center;">
                <div style="font-size:48px; margin-bottom:10px;">🦉</div>
                <button data-action="falar-frase" class="ws-btn" style="background:#4F46E5; color:#fff; padding:12px 30px; border-radius:20px; border:none; cursor:pointer; margin-bottom:20px;">🔊 Tocar Áudio</button>
                <input id="ig-listenInput" class="ig-input" placeholder="Transcreva exatamente o que ouviu..." style="text-align:center;">
                <button data-action="verificar-listen" class="ws-btn" style="width:100%; background:linear-gradient(135deg, #10b981, #059669); color:#fff; margin-top:16px; padding:16px; border-radius:12px; border:none; cursor:pointer;">Desvendar Mistério</button>
            </div>`;
    },

  renderGameQuiz(){
        const col = this.getColecaoDoJogoAtual();
        this.desafioAtualObj = this.obterItemInteligente(col, 'quiz'); 
        if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const q = this.desafioAtualObj;
        document.getElementById('modalBody').innerHTML=`
            <div class="ig-big-phrase" style="font-size:22px;">${Workspace.escapeHTML(q.question)}</div>
            <div style="display:flex; flex-direction:column; gap:12px; margin-top:20px;">
                ${q.options.map((o,i)=>`<button data-action="verificar-quiz" data-index="${i}" class="ws-btn" style="background:#fff; color:#0F172A; border:2px solid #E2E8F0; padding:16px; border-radius:12px; cursor:pointer; text-align:left; font-size:16px; transition: 0.2s;" onmouseover="this.style.borderColor='#4F46E5'" onmouseout="this.style.borderColor='#E2E8F0'">${Workspace.escapeHTML(o)}</button>`).join('')}
            </div>`;
    },

    renderGameWordPicker(){
        const col = this.getColecaoDoJogoAtual();
        this.desafioAtualObj = this.obterItemInteligente(col, 'picker'); 
        if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const s = this.desafioAtualObj;
        document.getElementById('modalBody').innerHTML=`
            <div class="ig-big-phrase" style="color:#4F46E5;">${Workspace.escapeHTML(s.text)}</div>
            <div style="display:flex; gap:12px; justify-content:center; margin-top:20px; flex-wrap:wrap;">
                ${s.options.map((o,i)=>`<button data-action="verificar-picker" data-index="${i}" class="ws-btn" style="background:#fff; color:#0F172A; border:2px solid #E2E8F0; padding:14px 30px; border-radius:30px; cursor:pointer; font-size:16px; transition: 0.2s;" onmouseover="this.style.borderColor='#4F46E5'" onmouseout="this.style.borderColor='#E2E8F0'">${Workspace.escapeHTML(o)}</button>`).join('')}
            </div>`;
    },

   renderGameSentenceShuffle(){
        const col = this.getColecaoDoJogoAtual();
        this.desafioAtualObj = this.obterItemInteligente(col, 'phrase'); 
        if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const phrase = this.desafioAtualObj; 
        
        // 🚀 Sorteia a tarefa e guarda diretamente no objeto do desafio atual
        const task = ['Transforme em Pergunta (Interrogativa)', 'Transforme em Negativa'][Math.floor(Math.random()*2)];
        this.desafioAtualObj.taskType = task;

        document.getElementById('modalBody').innerHTML=`
            <div style="text-align:center; margin-bottom:10px;"><span style="background:#0F172A; color:#fff; padding:6px 12px; border-radius:20px; font-size:13px; font-weight:700;">${task}</span></div>
            <div class="ig-big-phrase">${Workspace.escapeHTML(phrase.phrase)}</div>
            <textarea id="ig-input" class="ig-textarea" placeholder="Sua nova frase aqui..." style="min-height:80px;"></textarea>
            <button data-action="verificar-envio" data-game="sentenceShuffle" class="ws-btn" style="width:100%; background:linear-gradient(135deg, #6366f1, #4f46e5); color:#fff; margin-top:16px; border:none; padding:16px; border-radius:12px; cursor:pointer;">Submeter</button>`;
    },

    renderGameAnswerQuest(){
        const col = this.getColecaoDoJogoAtual();
        this.desafioAtualObj = this.obterItemInteligente(col, 'question'); 
        if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        document.getElementById('modalBody').innerHTML=`
            <div class="ig-big-phrase" style="background:#FEF3C7; border-color:#F59E0B; color:#92400E;">❓ ${Workspace.escapeHTML(this.desafioAtualObj.text)}</div>
            <textarea id="ig-input" class="ig-textarea" placeholder="Sua resposta em inglês..." style="min-height:100px;"></textarea>
            <button data-action="verificar-envio" data-game="answerQuest" class="ws-btn" style="width:100%; margin-top:16px; background:linear-gradient(135deg, #d97706, #b45309); color:#fff; border:none; padding:16px; border-radius:12px; cursor:pointer;">Enviar Resposta</button>`;
    },

    renderGameQuestionMaker(){
        const pool = this.state.pool.filter(p=>p.type==='answerQuest');
        this.desafioAtualObj = pool.length ? this.obterItemInteligente(pool, 'qmaker') : null;
        if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        document.getElementById('modalBody').innerHTML=`
            <p style="color:#64748B; font-weight:700; text-align:center;">Alguém respondeu isto:</p>
            <div class="ig-big-phrase" style="background:#EEF2FF; color:#4F46E5; font-style:italic;">💬 "${Workspace.escapeHTML(this.desafioAtualObj.text)}"</div>
            <p style="text-align:center; font-weight:600; margin-top:20px;">Qual pergunta em inglês gerou essa resposta?</p>
            <textarea id="ig-input" class="ig-textarea" placeholder="Ex: Why do you..."></textarea>
            <button data-action="verificar-envio" data-game="questionMaker" class="ws-btn" style="width:100%; background:linear-gradient(135deg, #6366f1, #4f46e5); color:#fff; margin-top:16px; border:none; padding:16px; border-radius:12px; cursor:pointer;">Testar Pergunta</button>`;
    },

    renderGameContextRole(){
        const col = this.getColecaoDoJogoAtual();
        this.desafioAtualObj = this.obterItemInteligente(col, 'roleplay'); 
        if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const c = this.desafioAtualObj;
        document.getElementById('modalBody').innerHTML=`
            <div class="ig-big-phrase" style="text-align:left;">
                <div style="font-size:18px; font-weight:800; margin-bottom:8px;">${Workspace.escapeHTML(c.title)}</div>
                <div style="font-size:16px; color:#475569; font-weight:500;">${Workspace.escapeHTML(c.prompt)}</div>
            </div>
            <p style="font-size:13px; background:#FEF3C7; color:#92400E; padding:12px; border-radius:8px; font-weight:700;">💡 Dica: ${Workspace.escapeHTML(c.tip)}</p>
            <textarea id="ig-input" class="ig-textarea" placeholder="O que você responderia em inglês?..." style="min-height:80px;"></textarea>
            <button data-action="verificar-envio" data-game="contextRole" class="ws-btn" style="width:100%; margin-top:16px; background:linear-gradient(135deg, #10b981, #059669); color:#fff; border:none; padding:16px; border-radius:12px; cursor:pointer;">Atuar e Enviar</button>`;
    },

    renderGameDebateAI(){
        const col = this.getColecaoDoJogoAtual();
        this.desafioAtualObj = this.obterItemInteligente(col, 'debate');
        if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        
        if(!this.state._debateChat) this.state._debateChat=[];
        if(this.state._debateChat.length === 0){
            this.state._debateChat = [{role:'ai', text: this.desafioAtualObj.starter}];
        }
        
        const chatHtml = this.state._debateChat.map(m=>{
            if(m.role==='user'){
                return `<div style="display:flex; justify-content:flex-end; margin-bottom:12px;"><div style="background:linear-gradient(135deg, #6366f1, #4f46e5); color:#fff; padding:12px 16px; border-radius:16px 16px 4px 16px; max-width:80%; font-size:14px; box-shadow:0 4px 10px rgba(79,70,229,0.2);">${Workspace.escapeHTML(m.text)}</div></div>`;
            }else{
                return `<div style="display:flex; margin-bottom:12px;"><div style="background:#F1F5F9; border:1px solid #E2E8F0; color:#0F172A; padding:12px 16px; border-radius:4px 16px 16px 16px; max-width:80%; font-size:14px;"><div style="font-size:11px; color:#64748B; font-weight:700; margin-bottom:4px;">🤖 MAGO IA</div>${Workspace.escapeHTML(m.text)}</div></div>`;
            }
        }).join('');

        document.getElementById('modalBody').innerHTML=`
            <div style="background:#F8FAFC; padding:16px; border-radius:12px; border:1px solid #E2E8F0; margin-bottom:16px;">
                <div style="font-weight:800; color:#0F172A; font-size:15px;">⚔️ Tópico: ${Workspace.escapeHTML(this.desafioAtualObj.topic)}</div>
            </div>
            <div id="ig-debate-chat" style="height:250px; overflow-y:auto; padding:10px; margin-bottom:16px; border:1px solid #E2E8F0; border-radius:12px;">${chatHtml}</div>
            <div style="display:flex; gap:10px;">
                <textarea id="ig-input" class="ig-textarea" placeholder="Escreva seu argumento..." style="flex:1; min-height:50px; border-radius:12px;"></textarea>
                <button data-action="verificar-debate" class="ws-btn" style="background:linear-gradient(135deg, #6366f1, #4f46e5); color:#fff; border:none; border-radius:12px; padding:0 20px; font-size:20px; cursor:pointer;">➤</button>
            </div>`;
        const div = document.getElementById('ig-debate-chat');
        if(div) div.scrollTop = div.scrollHeight;
    },

   renderGameMinimalPairs(){
        const col = this.getColecaoDoJogoAtual();
        this.desafioAtualObj = this.obterItemInteligente(col, 'minimal'); 
        if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        
        const pair = this.desafioAtualObj; 
        const target = Math.random()>0.5 ? pair.a : pair.b; 
        this.state._minimalTarget = target;
        
        document.getElementById('modalBody').innerHTML=`
            <div style="text-align:center; padding:20px 0;">
                <div style="font-size:48px; margin-bottom:16px;">👄</div>
                <button data-action="falar-frase" data-text="${target}" class="ws-btn" style="background:linear-gradient(135deg, #6366f1, #4f46e5); color:#fff; padding:16px 40px; border-radius:30px; border:none; cursor:pointer; font-size:16px; box-shadow:0 4px 12px rgba(79,70,229,0.3);">🎧 Ouvir Palavra</button>
                <div style="display:flex; gap:16px; justify-content:center; margin-top:30px;">
                    <button data-action="verificar-minimal" data-choice="${this.desafioAtualObj.a}" class="ws-btn" style="flex:1; background:#fff; color:#0F172A; border:2px solid #E2E8F0; padding:20px; border-radius:16px; cursor:pointer; font-size:20px; font-weight:800; transition: 0.2s;" onmouseover="this.style.borderColor='#4F46E5'" onmouseout="this.style.borderColor='#E2E8F0'">${this.desafioAtualObj.a}</button>
                    <button data-action="verificar-minimal" data-choice="${this.desafioAtualObj.b}" class="ws-btn" style="flex:1; background:#fff; color:#0F172A; border:2px solid #E2E8F0; padding:20px; border-radius:16px; cursor:pointer; font-size:20px; font-weight:800; transition: 0.2s;" onmouseover="this.style.borderColor='#4F46E5'" onmouseout="this.style.borderColor='#E2E8F0'">${this.desafioAtualObj.b}</button>
                </div>
            </div>`;
    },

   renderGamePicturePop(){
        const col = this.getColecaoDoJogoAtual();
        this.desafioAtualObj = this.obterItemInteligente(col, 'picture'); 
        if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const pic = this.desafioAtualObj;
        
        document.getElementById('modalBody').innerHTML=`
            <div style="text-align:center;">
                <div style="width:160px; height:160px; border-radius:30px; background:#F8FAFC; border:4px solid #E2E8F0; display:flex; align-items:center; justify-content:center; margin:0 auto 24px auto; font-size:80px; box-shadow:0 10px 20px rgba(0,0,0,0.05);">${pic.emoji}</div>
                <div style="background:#fff; border:2px solid #E2E8F0; padding:24px; border-radius:20px;">
                    <p style="font-weight:800; color:#4F46E5; margin-bottom:15px;">O Alquimista pede: Crie uma frase sobre esta figura!</p>
                    <textarea id="ig-input" class="ig-textarea" placeholder="Ex: This is a delicious apple..." style="min-height:80px; text-align:center;"></textarea>
                    <button data-action="verificar-envio" data-game="picturePop" class="ws-btn" style="width:100%; background:linear-gradient(135deg, #10b981, #059669); color:#fff; margin-top:16px; padding:16px; border-radius:12px; border:none; cursor:pointer; font-weight:bold;">Submeter Visão 👁️‍🗨️</button>
                </div>
            </div>`;
    },

   // =========================================================================
   // 🃏 JOGO DA MEMÓRIA: ILUSÃO DO MAGO
   // =========================================================================
   renderGameMemory(){
        // Usa a base de palavras do WordSpark
        const col = this.getColecaoPorJogo('wordSpark'); 
        if(!col || col.length < 3) {
            document.getElementById('modalBody').innerHTML = `<div style="text-align:center;padding:40px;color:#64748B;">Para jogar, precisa ter pelo menos 3 palavras no Banco de Vocabulário do Professor.</div>`;
            return;
        }
        
        // Pesca até 6 palavras aleatórias
        let selectedItems = [...col].sort(()=> 0.5 - Math.random()).slice(0, 6);
        
        // Cria os pares (Inglês e Português)
        let cards = [];
        selectedItems.forEach((item, index) => {
            cards.push({ id: `card_w_${index}`, text: item.word, matchId: index, type: 'en', originalId: item.id });
            cards.push({ id: `card_t_${index}`, text: item.translation, matchId: index, type: 'pt', originalId: item.id });
        });
        
        // Baralha as cartas
        cards.sort(()=> 0.5 - Math.random());
        
        // Variáveis de Estado do Jogo da Memória
        this.state._memoryCards = cards;
        this.state._memorySelected = [];
        this.state._memoryMatches = 0;
        this.state._memoryLock = false;
        this.state._memoryAttempts = 0;
        this.state._memoryOriginalIds = selectedItems.map(i => i.id);

        let gridHtml = cards.map((c, i) => `
            <div class="memory-card" id="mem-card-${i}" onclick="Workspace.Ingles.virarCartaMemoria(${i})">
                <div class="memory-face memory-front"></div>
                <div class="memory-face memory-back" id="mem-back-${i}">${Workspace.escapeHTML(c.text)}</div>
            </div>
        `).join('');

        document.getElementById('modalBody').innerHTML = `
            <div style="text-align:center;">
                <p style="font-weight:700; color:#4F46E5; margin-bottom:15px; font-size: 15px;">Combine a palavra em Inglês com a sua tradução!</p>
                <div class="memory-grid">${gridHtml}</div>
            </div>
        `;
    },

    virarCartaMemoria(index) {
        if (this.state._memoryLock) return; // Trava se já houver 2 cartas viradas
        const cardEl = document.getElementById(`mem-card-${index}`);
        if (cardEl.classList.contains('is-flipped')) return; // Trava se a carta já estiver virada

        // Vira a carta visualmente
        cardEl.classList.add('is-flipped');
        const cardData = this.state._memoryCards[index];
        
        // Se for a palavra em Inglês, a IA dita a pronúncia!
        if (cardData.type === 'en') VoiceService.falar(cardData.text);

        this.state._memorySelected.push({ index, el: cardEl, data: cardData });

        // Verifica se formou o par
        if (this.state._memorySelected.length === 2) {
            this.state._memoryLock = true;
            this.state._memoryAttempts++;
            const [c1, c2] = this.state._memorySelected;

            if (c1.data.matchId === c2.data.matchId) {
                // ACERTOU O PAR
                this.state._memoryMatches++;
                document.getElementById(`mem-back-${c1.index}`).classList.add('correct');
                document.getElementById(`mem-back-${c2.index}`).classList.add('correct');
                this.tocarSom('coin');
                
                this.state._memorySelected = [];
                this.state._memoryLock = false;
                
                // Se encontrou todos os pares, vence o jogo!
                if (this.state._memoryMatches === (this.state._memoryCards.length / 2)) {
                    setTimeout(() => this.vencerJogoMemoria(), 800);
                }
            } else {
                // ERROU O PAR
                document.getElementById(`mem-back-${c1.index}`).classList.add('wrong');
                document.getElementById(`mem-back-${c2.index}`).classList.add('wrong');
                
                // Aguarda 1.2s para o aluno decorar e desvira as cartas
                setTimeout(() => {
                    c1.el.classList.remove('is-flipped');
                    c2.el.classList.remove('is-flipped');
                    document.getElementById(`mem-back-${c1.index}`).classList.remove('wrong');
                    document.getElementById(`mem-back-${c2.index}`).classList.remove('wrong');
                    this.state._memorySelected = [];
                    this.state._memoryLock = false;
                }, 1200);
            }
        }
    },

    vencerJogoMemoria() {
        // Regista o progresso no Algoritmo SRS para todas as palavras treinadas!
        this.state._memoryOriginalIds.forEach(id => {
            this.updateSRS(id, 'memoryGame', true);
            this.marcarComoConcluido(id);
            this.superarErro(id);
        });
        
        // Sistema Dinâmico de Recompensa (Baseado na quantidade de erros)
        const pares = this.state._memoryCards.length / 2;
        let bonus = 100; // Excelente (poucos erros)
        if (this.state._memoryAttempts > pares + 2) bonus = 60; // Médio
        if (this.state._memoryAttempts > pares + 5) bonus = 30; // Sofreu muito
        
        // Ativa a sua função fantástica de recompensa e fecha o jogo!
        this.sucessoGenerico(bonus);
    },

    // =========================================================================
   // 🔤 JOGO DA FORCA E VÍDEO QUIZ
   // =========================================================================
   renderGameHangman() {
        const col = this.getColecaoDoJogoAtual();
        this.desafioAtualObj = this.obterItemInteligente(col, 'word'); 
        if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        
        const w = this.desafioAtualObj;
        // Prepara o estado do jogo da forca
        this.state._hangmanWord = w.word.toUpperCase().trim();
        this.state._hangmanGuessed = [];
        this.state._hangmanLives = 3;
        
        this.atualizarTelaForca();
    },

    atualizarTelaForca() {
        const w = this.state._hangmanWord;
        const guessed = this.state._hangmanGuessed;
        
        let displayWord = '';
        let won = true;
        // Desenha a palavra ou os espaços em branco
        for(let char of w) {
            if(char === ' ' || char === '-') {
                displayWord += char;
            } else if(guessed.includes(char)) {
                displayWord += char;
            } else {
                displayWord += '_';
                won = false;
            }
        }
        
        // Desenha o teclado virtual
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
        const keyboardHtml = alphabet.map(letter => {
            let extraClass = ''; let disabled = '';
            if(guessed.includes(letter)) {
                disabled = 'disabled';
                if(w.includes(letter)) extraClass = 'correct';
                else extraClass = 'wrong';
            }
            return `<button class="key-btn ${extraClass}" ${disabled} data-action="verificar-forca" data-letra="${letter}">${letter}</button>`;
        }).join('');
        
        // Corações de vida
        let hearts = '❤️'.repeat(this.state._hangmanLives) + '🤍'.repeat(3 - this.state._hangmanLives);
        
        document.getElementById('modalBody').innerHTML = `
            <div style="text-align:center;">
                <div style="background:#F8FAFC; padding:10px; border-radius:10px; border:1px solid #E2E8F0; margin-bottom:15px;">
                    <p style="font-weight:700; color:#64748B; margin:0; font-size:14px;">Tradução / Pista:</p>
                    <p style="font-weight:800; color:#0F172A; margin:5px 0 0 0; font-size:18px;">${Workspace.escapeHTML(this.desafioAtualObj.translation)}</p>
                </div>
                <div class="lives-box" title="Vidas restantes">${hearts}</div>
                <div class="hangman-word">${displayWord}</div>
                <div class="keyboard-grid">${keyboardHtml}</div>
            </div>
        `;
        
        // Valida Vitória ou Derrota
        if(won) {
            setTimeout(() => {
                this.updateSRS(this.desafioAtualObj.id, 'hangman', true);
                this.superarErro(this.desafioAtualObj.id);
                this.sucessoGenerico(75);
            }, 600);
        } else if (this.state._hangmanLives <= 0) {
            document.getElementById('modalBody').innerHTML += `<div style="margin-top:20px; background:#FEF2F2; border:1px solid #EF4444; color:#991B1B; padding:15px; border-radius:10px; font-weight:800; font-size:16px;">💀 Fim de jogo! A palavra era:<br><span style="font-size:24px;">${w}</span></div>`;
            this.registrarErro(this.desafioAtualObj, 'hangman');
            setTimeout(() => this.falhaGenerica(), 3500);
        }
    },

    renderGameVideoQuiz() {
        const col = this.getColecaoDoJogoAtual();
        this.desafioAtualObj = this.obterItemInteligente(col, 'quiz');
        if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const q = this.desafioAtualObj;
        
        // Converte links normais do YouTube para formato iframe embed
        let embedUrl = q.videoUrl || '';
        if(embedUrl.includes('youtube.com/watch?v=')) {
            embedUrl = embedUrl.replace('watch?v=', 'embed/');
        } else if(embedUrl.includes('youtu.be/')) {
            embedUrl = embedUrl.replace('youtu.be/', 'youtube.com/embed/');
        }
        if(embedUrl.includes('&')) embedUrl = embedUrl.split('&')[0]; // Remove tempos ou playlists anexadas
        
        document.getElementById('modalBody').innerHTML = `
            <div class="video-container">
                <iframe src="${Workspace.escapeHTML(embedUrl)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
            <div class="ig-big-phrase" style="font-size:18px; padding:15px; margin-top:0;">${Workspace.escapeHTML(q.question)}</div>
            <div style="display:flex; flex-direction:column; gap:10px;">
                ${q.options.map((o,i)=>`<button data-action="verificar-quiz" data-index="${i}" class="ws-btn" style="background:#fff; color:#0F172A; border:2px solid #E2E8F0; padding:14px; border-radius:12px; cursor:pointer; text-align:left; font-size:15px; transition: 0.2s;" onmouseover="this.style.borderColor='#4F46E5'" onmouseout="this.style.borderColor='#E2E8F0'">${Workspace.escapeHTML(o)}</button>`).join('')}
            </div>
        `;
    },

    iniciarReconhecimentoDeVoz(esperado, itemObj, tipoConteudo){
        const btn = document.getElementById('modalBody').querySelector('[data-action="iniciar-voz"]');
        const resEl = document.getElementById('ig-speechResult');
        if(!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)){ this.mostrarAvisoLocal('O seu navegador não suporta voz','error'); return; }
        
        const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
        this.recognition = new SR(); this.recognition.lang='en-US'; this.recognition.interimResults=false; this.recognition.maxAlternatives=1;
        
        if(btn){ 
            btn.innerHTML=`🎧 Escutando... Fale agora! <div class="soundwave"><div></div><div></div><div></div><div></div><div></div></div>`; 
            btn.style.background='#F59E0B'; 
            btn.style.display = 'flex';
            btn.style.flexDirection = 'column';
            btn.style.alignItems = 'center';
        }
        this.recognition.start();
        
        this.recognition.onresult=(e)=>{
            const falado = e.results[0][0].transcript;
            if(btn){ btn.style.background='#10B981'; btn.innerText=`Avaliando a pronúncia... 🤖`; btn.disabled = true; }
            
            // 🚀 A MÁGICA AQUI: Identifica se é o Sopro do Dragão ou a Visão do Alquimista por Voz
            const gameId = tipoConteudo === 'phrase' ? 'readAloud' : 'picturePopSpeech';

            Workspace.api('/workspace/ingles/jogo/avaliar', 'POST', {
                jogo: gameId,
                pergunta: esperado, // A frase ou palavra que ele devia ler
                respostaAluno: falado // O que o microfone ouviu
            }).then(r => {
                if(btn){ btn.innerText=`🎤 Tentar novamente`; btn.disabled = false; }
                
                if (r.success && r.correto) {
                    if(resEl) resEl.innerHTML=`<div style="background:#ECFDF5; border:1px solid #10B981; padding:12px; border-radius:10px; font-size:13px; animation: fadeIn 0.3s; color:#064E3B; margin-top:10px;"><b>✅ ${r.feedback}</b><br>🎙️ O microfone ouviu: <i>"${falado}"</i></div>`;
                    if(itemObj) this.updateSRS(itemObj.id, tipoConteudo, true);
                    this.superarErro(itemObj?.id);
                    this.sucessoGenerico(tipoConteudo === 'picture' ? 75 : 50);
                } else {
                    if(resEl) resEl.innerHTML=`<div style="background:#FEF2F2; border:1px solid #EF4444; padding:12px; border-radius:10px; font-size:13px; animation: fadeIn 0.3s; color:#7F1D1D; margin-top:10px;">❌ ${r.feedback}<br>🎙️ O microfone ouviu: <i>"${falado}"</i><br>💡 Dica de Pronúncia: ${r.correcao}</div>`;
                    if(itemObj) this.registrarErro(itemObj, tipoConteudo);
                    this.falhaGenerica();
                }
            }).catch(() => {
                if(btn){ btn.style.background='#10B981'; btn.innerText='🎤 Tentar novamente'; btn.disabled = false; }
                this.mostrarAvisoLocal('Erro de ligação com o servidor de IA.', 'error');
            });
        };
        
        this.recognition.onerror=()=>{ if(btn){ btn.style.background='#10B981'; btn.innerText='🎤 Tentar novamente (Erro no Microfone)'; btn.disabled = false; } };
    },

async renderizarMarquee() {
        const track = document.getElementById('ig-marquee-track');
        const wrapper = document.getElementById('ig-marquee-wrapper');
        if(!track || !wrapper) return;

        try {
            const escolaId = Workspace.usuario?.escolaId || 'DEFAULT';
            const res = await Workspace.api(`/workspace/ingles/ranking?escolaId=${escolaId}`,'GET');
            
            if(res && res.success && res.ranking && res.ranking.length > 0) {
                const top9 = res.ranking.slice(0, 9);
                
                let htmlCartoes = top9.map((aluno, index) => {
                    const posicao = index + 1;
                    let classeDestaque = '';
                    let medalha = '';
                    
                    if(posicao === 1) { classeDestaque = 'marquee-rank-1'; medalha = '🥇'; }
                    else if(posicao === 2) { classeDestaque = 'marquee-rank-2'; medalha = '🥈'; }
                    else if(posicao === 3) { classeDestaque = 'marquee-rank-3'; medalha = '🥉'; }
                    else { medalha = `<span>#${posicao}</span>`; }
                    
                    // 🚀 Traz a foto real do aluno ou cria o selo padrão
                    let avatarSrc = '';
                    if (aluno.avatar) {
                        avatarSrc = `<img src="${aluno.avatar}" style="width:100%; height:100%; object-fit:cover;">`;
                    } else if (window.Workspace.renderizarAvatar) {
                        avatarSrc = window.Workspace.renderizarAvatar(aluno.nome, 46);
                    } else {
                        avatarSrc = `<div style="background:#e2e8f0;width:100%;height:100%;"></div>`;
                    }

                    return `
                    <div class="marquee-card ${classeDestaque}">
                        <div class="marquee-medal">${medalha}</div>
                        <div class="marquee-avatar">${avatarSrc}</div>
                        <div class="marquee-info">
                            <span class="marquee-name">${Workspace.escapeHTML(aluno.nome)}</span>
                            <span class="marquee-stats">
                                <span style="color:#d97706;">💰 ${totalMoedas.toLocaleString('pt-BR')}</span> 
                                <span style="color:#cbd5e1;">|</span>
                                <span>${ligaTexto}</span>
                            </span>
                        </div>
                    </div>`;
                }).join('');
                
                track.innerHTML = htmlCartoes + htmlCartoes;
                wrapper.style.display = 'block';
            }
        } catch(e) { console.error("Falha ao carregar letreiro de líderes", e); }
    }

};

setTimeout(()=> Workspace.Ingles.init(), 100);