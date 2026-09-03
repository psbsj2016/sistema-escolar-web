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
            {id:'picturePop', title:'👁🗨 Visão do Alquimista', desc:'Fale o que vê.', icon:'👁🗨', color:'#DCFCE7'}
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
            
            /* HEADER */
            .bau-header { display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 16px 24px; border-radius: 16px; border: 1px solid #e2e8f0; margin-bottom: 24px; flex-wrap: wrap; gap: 15px; }
            .bau-title { display: flex; align-items: center; gap: 16px; }
            .bau-icon { font-size: 40px; background: #FEF3C7; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; border-radius: 16px; border: 2px solid #F59E0B; }
            .bau-title h2 { margin: 0; font-size: 22px; color: #0F172A; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; }
            .bau-title p { margin: 4px 0 0 0; font-size: 13px; color: #64748B; font-weight: 500; }
            .bau-actions { display: flex; align-items: center; gap: 16px; }
            
            /* BADGES & BUTTONS */
            .xp-badge { display: flex; gap: 10px; background: #F1F5F9; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 700; color: #334155; }
            .xp-badge b { color: #0F172A; }
            .toggle-wrap { display: flex; background: #E2E8F0; padding: 4px; border-radius: 12px; }
            .toggle-btn { background: transparent; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 700; color: #64748B; cursor: pointer; transition: 0.2s; font-size: 13px; }
            .toggle-btn.active { background: #fff; color: #0F172A; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
            
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
            
            /* MODAL GERAL */
            .modal { position: fixed; inset: 0; background: rgba(15,23,42,0.85); display: flex; align-items: center; justify-content: center; z-index: 100000; backdrop-filter: blur(5px); }
            .modal.hidden { display: none !important; }
            .modal-content { background: #fff; width: 95%; max-width: 650px; border-radius: 20px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.25); border: 1px solid #E2E8F0; }
            .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border-bottom: 1px solid #E2E8F0; background: #F8FAFC; }
            .modal-title { display: flex; align-items: center; gap: 12px; }
            .modal-title h2 { margin: 0; font-size: 18px; color: #0F172A; font-weight: 800; }
            .close-btn { background: #FEE2E2; border: none; width: 32px; height: 32px; border-radius: 8px; color: #EF4444; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
            .close-btn:hover { background: #EF4444; color: #fff; }
            .modal-body { padding: 24px; overflow-y: auto; flex: 1; }
            
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
                            <p>12 jogos • O seu treino contínuo e inteligente</p>
                        </div>
                    </div>
                    <div class="bau-actions">
                        <div class="xp-badge" id="xpBadge">
                            <span>🔥 <b id="streakCount">1</b> dias</span>
                            <span>🪙 <b id="coinsCount">0</b> BZ</span>
                        </div>
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
                        <div class="welcome">
                            <h1>Baú do Inglês aberto! 🗝️</h1>
                            <p>Escolha um treino. Jogue sem parar, acumule Moedas de Bronze e deixe o algoritmo guiar a sua memória.</p>
                        </div>
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

    atualizarHUD(){
        const bzEl = document.getElementById('coinsCount');
        const stEl = document.getElementById('streakCount');
        if(bzEl) bzEl.textContent = this.state.coins?.bronze || 0;
        if(stEl) stEl.textContent = this.state.streak || 1;
    },

    mostrarAvisoLocal(msg, tipo='success'){
        const toast = document.getElementById('toast');
        if(!toast) return;
        toast.innerHTML = msg;
        toast.style.background = tipo==='success' ? '#10B981' : (tipo==='error'?'#EF4444':'#F59E0B');
        toast.classList.remove('hidden');
        setTimeout(()=>toast.classList.add('hidden'), 2000);
    },

    ganharCoins(tipo, qtd){
        this.state.coins = this.state.coins || {bronze:0, prata:0, ouro:0};
        this.state.coins[tipo] = (this.state.coins[tipo]||0) + qtd;
        if(this.state.coins.bronze >= 100){ 
            let c = Math.floor(this.state.coins.bronze/100); 
            this.state.coins.bronze -= c*100; 
            this.state.coins.prata = (this.state.coins.prata||0) + c; 
        }
        if(this.state.coins.prata >= 100){ 
            let c2 = Math.floor(this.state.coins.prata/100); 
            this.state.coins.prata -= c2*100; 
            this.state.coins.ouro = (this.state.coins.ouro||0) + c2; 
        }
        this.atualizarHUD();
        this.saveDados();
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
          if(a === 'verificar-envio'){
                const caixaDeTexto = document.querySelector('#modalBody #ig-input') || document.getElementById('ig-input');
                const respostaDoAluno = caixaDeTexto?.value?.trim() || '';

                if(respostaDoAluno.length < 2) return this.mostrarAvisoLocal('Responda com conteúdo válido', 'error');
                
                const gameId = b.dataset.game;

                if(['contextRole','answerQuest','sentenceShuffle'].includes(gameId)){
                    b.disabled = true; b.innerText = '🤖 A IA está a avaliar a sua resposta...';
                    
                    const payload = {
                        jogo: gameId === 'sentenceShuffle' ? 'answerQuest' : gameId,
                        pergunta: cur.text || cur.phrase || cur.title,
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
        grid.innerHTML = this.defaults.games.map(g=>{
            const vencidos = Object.values(this.state.srs).filter(s=>s.tipo===g.id && s.due<=Date.now()).length;
            return `
            <div class="ig-game-card" data-action="abrir-jogo" data-game-id="${g.id}">
                <div class="ig-top">
                    <div class="ig-icon" style="background:${g.color}30; color:${g.color.replace('E0E7FF','#4F46E5').replace('FEF3C7','#D97706').replace('D1FAE5','#059669')}">${g.icon}</div>
                </div>
                <h3>${g.title} ${vencidos?'🔥':''}</h3>
                <p>${g.desc}</p>
                <div style="margin-top:12px; display:flex; gap:8px;">
                    <span style="background:#F1F5F9; color:#475569; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:700;">🪙 +${['picturePop','minimalPairs'].includes(g.id)?'75':'50'} BZ</span>
                    ${vencidos ? `<span style="color:#EF4444; font-size:11px; font-weight:700;">${vencidos} para revisar</span>` : ''}
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
        document.getElementById('gameModal').classList.remove('hidden');
        
        this.renderGameCapa();
    },

    fecharJogo(){
        try{ speechSynthesis.cancel(); }catch{}
        document.getElementById('gameModal').classList.add('hidden');
        this.renderAlunoGrid();
    },

    sucessoGenerico: async function(bonusBase){
        if(this.desafioAtualObj?.id){ 
            this.marcarComoConcluido(this.desafioAtualObj.id); 
            this.updateSRS(this.desafioAtualObj.id, this.jogoAtual, true); 
        }
        
        this.ganharCoins('bronze', bonusBase);
        this.tocarSom('coin'); 
        
        const srs = this.state.srs[this.desafioAtualObj?.id];
        this.mostrarAvisoLocal(`🪙 +${bonusBase} Bronze! Próxima revisão em ${srs?.interval||1} dia(s)`, 'success');

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
        return null;
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
                ${q.options.map((o,i)=>`<button data-action="verificar-quiz" data-index="${i}" class="ws-btn" style="background:#fff; border:2px solid #E2E8F0; padding:16px; border-radius:12px; cursor:pointer; text-align:left; font-size:16px;">${Workspace.escapeHTML(o)}</button>`).join('')}
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
                ${s.options.map((o,i)=>`<button data-action="verificar-picker" data-index="${i}" class="ws-btn" style="background:#fff; border:2px solid #E2E8F0; padding:14px 30px; border-radius:30px; cursor:pointer; font-size:16px;">${Workspace.escapeHTML(o)}</button>`).join('')}
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
                    <button data-action="verificar-minimal" data-choice="${this.desafioAtualObj.a}" class="ws-btn" style="flex:1; background:#fff; border:2px solid #E2E8F0; padding:20px; border-radius:16px; cursor:pointer; font-size:20px; font-weight:800;">${this.desafioAtualObj.a}</button>
                    <button data-action="verificar-minimal" data-choice="${this.desafioAtualObj.b}" class="ws-btn" style="flex:1; background:#fff; border:2px solid #E2E8F0; padding:20px; border-radius:16px; cursor:pointer; font-size:20px; font-weight:800;">${this.desafioAtualObj.b}</button>
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
                    <button data-action="iniciar-voz" data-tipo="picture" class="ws-btn" style="background:linear-gradient(135deg, #10b981, #059669); color:#fff; width:100%; border-radius:16px; padding:16px; border:none; font-size:16px; cursor:pointer;">🎤 Falar o Nome em Inglês</button>
                    <div id="ig-speechResult" style="margin-top:16px; font-weight:700;"></div>
                    <div style="margin:20px 0; border-top:2px dashed #E2E8F0;"></div>
                    <input id="ig-input" class="ig-input" placeholder="Ou digite a palavra..." style="text-align:center;">
                    <button data-action="verificar-picture-text" class="ws-btn" style="width:100%; background:#F1F5F9; color:#0F172A; margin-top:12px; padding:16px; border-radius:12px; border:none; cursor:pointer;">Verificar</button>
                </div>
            </div>`;
    },

    iniciarReconhecimentoDeVoz(esperado, itemObj, tipoConteudo){
        const btn = document.getElementById('modalBody').querySelector('[data-action="iniciar-voz"]');
        const resEl = document.getElementById('ig-speechResult');
        if(!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)){ this.mostrarAvisoLocal('Navegador não suporta voz','error'); return; }
        
        const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
        this.recognition = new SR(); this.recognition.lang='en-US'; this.recognition.interimResults=false; this.recognition.maxAlternatives=1;
        
        if(btn){ btn.innerText='🎧 Escutando...'; btn.style.background='#F59E0B'; }
        this.recognition.start();
        
        this.recognition.onresult=(e)=>{
            const falado = e.results[0][0].transcript;
            if(btn){ btn.style.background='#10B981'; btn.innerText=`Lido: "${falado}"`; }
            
            const sim = this.similaridade(falado, esperado);
            if(sim>=0.75){ 
                if(resEl) resEl.innerHTML=`<span style="color:#059669;">✅ Excelente!</span>`; 
                if(itemObj) this.updateSRS(itemObj.id, tipoConteudo, true); 
                this.superarErro(itemObj?.id); 
                this.sucessoGenerico(75); 
            } else { 
                if(resEl) resEl.innerHTML=`<span style="color:#DC2626;">❌ Ouvi: "${falado}"</span>`; 
                if(itemObj) this.registrarErro(itemObj, tipoConteudo); 
                this.falhaGenerica(); 
            }
        };
        this.recognition.onerror=()=>{ if(btn){ btn.style.background='#10B981'; btn.innerText='🎤 Tentar novamente'; } };
    }
};

setTimeout(()=> Workspace.Ingles.init(), 100);