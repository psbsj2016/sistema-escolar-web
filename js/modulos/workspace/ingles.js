// js/modulos/workspace/ingles.js - V4 (Layout Direto + Loop Infinito + Vozes Neurais + Apenas Coins)
window.Workspace = window.Workspace || {};
if(!window.Workspace.escapeHTML){
    window.Workspace.escapeHTML = (s)=> String(s||'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}

// ===================== VOICE SERVICE - VOZES FEMININAS NEURAIS =====================
const VoiceService = (() => {
    let cacheMago = null, resolver = null;
    let femalePool = []; 
    const ready = new Promise(r => resolver = r);

    const MALE_BLOCK = ['male','david','alex','daniel','arthur','oliver','mark','guy','james','thomas','fred','bot'];
    
    // Prioridade MÁXIMA para vozes neurais e online
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
            
            // INTELIGÊNCIA: Locutora diferente por jogo (Hash algorithm)
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
        streak:1, coins:{bronze:0, prata:0, ouro:0}, words:[], phrases:[], quizzes:[], pictures:[], minimalPairs:[], debates:[], submissions:[], pool:[],
        errosRetidos:[], itensConcluidos:[], srs:{}, _minimalTarget:null
    },
    recognition:null, jogoAtual:null, desafioAtualObj:null,

    defaults: {
        words:[
            {id:'w1', word:'Although', translation:'Embora', level:'B2'},
            {id:'w2', word:'Beneath', translation:'Abaixo de', level:'B1'}
        ],
        phrases:[
            {id:'p1', phrase:'Could you tell me where the nearest pharmacy is?', translation:'Você poderia me dizer onde fica a farmácia mais próxima?', level:'A2'},
            {id:'p2', phrase:'If I had more time, I would travel the world.', translation:'Se eu tivesse mais tempo, viajaria o mundo.', level:'B2'}
        ],
        quizzes:[
            {id:'q1', question:'Choose the correct sentence:', options:['I have been to London last year','I went to London last year'], correct:1, level:'B1'}
        ],
        pictures:[
            {id:'pic1', word:'apple', translation:'maçã', emoji:'🍎', category:'Food'}
        ],
        minimalPairs:[
            {id:'mp1', a:'ship', b:'sheep'}
        ],
        debates:[
            {id:'d1', topic:'Social media does more harm than good', starter:'Social media connects us, but also increases anxiety. What is your opinion?'}
        ],
        wordPickers:[
            {id:'wp1', text:'I have _____ my keys.', options:['lost','lose'], correct:0}
        ],
        questions:[
            {id:'aq1', text:'What did you do last weekend?'}
        ],
        roleplays:[
            {id:'rp1', title:'✈ No Aeroporto', prompt:'Attendant: Can I see your passport?', tip:'Use: Here you are'}
        ],
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
                if(c) c.style.display=(tela==='ingles')?'block':'none';
                orig(tela,hist);
            }; this.navConfigurada=true;
        }
    },

    abrirBau(){ 
        Workspace.navegarPara('ingles'); 
        this.loadDados().then(() => {
            this.renderAlunoGrid();
            this.atualizarHUD();
        });
    },

    async loadDados(){
        try{
            const escolaId = Workspace.usuario?.escolaId || 'DEFAULT';
            const res = await Workspace.api(`/workspace/ingles/dados?escolaId=${escolaId}`,'GET');
            if(res && res.success && res.dados){
                const d = res.dados;
                this.state.words = Array.isArray(d.words) && d.words.length ? d.words : [...this.defaults.words];
                this.state.phrases = Array.isArray(d.phrases) && d.phrases.length ? d.phrases : [...this.defaults.phrases];
                this.state.quizzes = Array.isArray(d.quizzes) && d.quizzes.length ? d.quizzes : [...this.defaults.quizzes];
                this.state.pictures = Array.isArray(d.pictures) && d.pictures.length ? d.pictures : [...this.defaults.pictures];
                this.state.wordPickers = Array.isArray(d.wordPickers) && d.wordPickers.length ? d.wordPickers : [...this.defaults.wordPickers];
                this.state.minimalPairs = Array.isArray(d.minimalPairs) && d.minimalPairs.length ? d.minimalPairs : [...this.defaults.minimalPairs];
                this.state.debates = Array.isArray(d.debates) && d.debates.length ? d.debates : [...this.defaults.debates];
                this.state.roleplays = Array.isArray(d.roleplays) && d.roleplays.length ? d.roleplays : [...this.defaults.roleplays];
                this.state.questions = Array.isArray(d.questions) && d.questions.length ? d.questions : [...this.defaults.questions];
                this.state.submissions = Array.isArray(d.submissions) ? d.submissions : [];
                this.state.pool = Array.isArray(d.pool) ? d.pool : [];
                this.state.errosRetidos = Array.isArray(d.errosRetidos) ? d.errosRetidos : [];
                this.state.srs = (d.srs && typeof d.srs==='object') ? d.srs : {};
            }else{
                this.state.words=[...this.defaults.words]; this.state.phrases=[...this.defaults.phrases];
                this.state.quizzes=[...this.defaults.quizzes]; this.state.pictures=[...this.defaults.pictures];
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
        }catch(e){ console.error('loadDados erro',e); }
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
            await Workspace.api('/workspace/ingles/dados','PUT',{
                escolaId: Workspace.usuario?.escolaId||'DEFAULT',
                words:this.state.words, phrases:this.state.phrases, quizzes:this.state.quizzes, pictures:this.state.pictures,
                wordPickers:this.state.wordPickers, minimalPairs:this.state.minimalPairs, debates:this.state.debates, roleplays:this.state.roleplays, questions:this.state.questions,
                submissions:this.state.submissions, pool:this.state.pool, errosRetidos:this.state.errosRetidos, srs:this.state.srs
            });
        }catch{}
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
        
        // 🚀 LIMPEZA DA MEMÓRIA (LOOP INFINITO)
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
            .bau-header { display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 16px 24px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.02); margin-bottom: 24px; flex-wrap: wrap; gap: 15px; }
            .bau-title { display: flex; align-items: center; gap: 16px; }
            .bau-icon { font-size: 40px; background: #FEF3C7; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; border-radius: 16px; border: 2px solid #F59E0B; }
            .bau-title h2 { margin: 0; font-size: 22px; color: #0F172A; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; }
            .bau-title p { margin: 4px 0 0 0; font-size: 13px; color: #64748B; font-weight: 500; }
            .bau-actions { display: flex; align-items: center; gap: 16px; }
            .xp-badge { display: flex; gap: 10px; background: #F1F5F9; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 700; color: #334155; }
            .xp-badge b { color: #0F172A; }
            .toggle-wrap { display: flex; background: #E2E8F0; padding: 4px; border-radius: 12px; }
            .toggle-btn { background: transparent; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 700; color: #64748B; cursor: pointer; transition: 0.2s; font-size: 13px; }
            .toggle-btn.active { background: #fff; color: #0F172A; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
            
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
            
            /* Modal Styles */
            .modal { position: fixed; inset: 0; background: rgba(15,23,42,0.85); display: flex; align-items: center; justify-content: center; z-index: 100000; backdrop-filter: blur(5px); }
            .modal.hidden { display: none !important; }
            .modal-content { background: #fff; width: 95%; max-width: 650px; border-radius: 20px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.25); border: 1px solid #E2E8F0; }
            .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border-bottom: 1px solid #E2E8F0; background: #F8FAFC; }
            .modal-title { display: flex; align-items: center; gap: 12px; }
            .modal-title h2 { margin: 0; font-size: 18px; color: #0F172A; font-weight: 800; }
            .close-btn { background: #FEE2E2; border: none; width: 32px; height: 32px; border-radius: 8px; color: #EF4444; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
            .close-btn:hover { background: #EF4444; color: #fff; }
            .modal-body { padding: 24px; overflow-y: auto; flex: 1; }
            
            /* Game Inner Elements */
            .ig-big-phrase { background: #F1F5F9; border: 2px solid #E2E8F0; color: #0F172A; font-weight: 700; font-size: 20px; text-align: center; padding: 20px; border-radius: 12px; margin: 16px 0; }
            .ig-input, .ig-textarea { background: #fff; color: #0F172A; border: 2px solid #CBD5E1; border-radius: 12px; font-weight: 500; font-size: 16px; width: 100%; padding: 14px; box-sizing: border-box; outline: none; transition: 0.2s; }
            .ig-input:focus, .ig-textarea:focus { border-color: #4F46E5; box-shadow: 0 0 0 4px rgba(79,70,229,0.1); }
            .ws-btn { font-weight: 700; font-family: 'Inter', sans-serif; transition: 0.2s; }
            .ws-btn:hover { transform: translateY(-2px); opacity: 0.95; }
            
            .hidden { display: none !important; }
            
            /* Toast */
            .toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #F59E0B; color: #fff; padding: 12px 24px; border-radius: 30px; font-weight: 800; z-index: 100001; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: opacity 0.3s; }
            
            /* Professor Sidebar */
            #professorView { display: flex; gap: 20px; min-height: 60vh; }
            .sidebar { width: 220px; display: flex; flex-direction: column; gap: 8px; }
            .side-item { background: #fff; border: 1px solid #E2E8F0; padding: 12px 16px; border-radius: 10px; text-align: left; font-weight: 600; color: #475569; cursor: pointer; transition: 0.2s; display: flex; justify-content: space-between; }
            .side-item.active { background: #EEF2FF; border-color: #4F46E5; color: #4F46E5; }
            .content { flex: 1; background: #fff; border-radius: 16px; border: 1px solid #E2E8F0; padding: 24px; }
            .tab-panel { display: none; }
            .tab-panel.active { display: block; }

            @media (max-width: 768px) {
                #professorView { flex-direction: column; }
                .sidebar { width: 100%; flex-direction: row; overflow-x: auto; }
                .side-item { flex-shrink: 0; }
                .bau-header { flex-direction: column; }
                .bau-actions { width: 100%; justify-content: space-between; }
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
                        <aside class="sidebar">
                            <button class="side-item active" data-tab="biblioteca">📚 Biblioteca</button>
                            <button class="side-item" data-tab="envios">📥 Envios <span class="count" id="pendingCount">0</span></button>
                            <button class="side-item" data-tab="imagens">🖼️ Figuras</button>
                        </aside>
                        <div class="content">
                            <div id="tab-biblioteca" class="tab-panel active"></div>
                            <div id="tab-envios" class="tab-panel"></div>
                            <div id="tab-imagens" class="tab-panel"></div>
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

            <!-- GAME MODAL -->
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
        // Lógica de conversão
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
            
            if(a === 'toggle-prof') {
                if(Workspace.usuario?.tipo === 'Aluno') { this.mostrarAvisoLocal('Apenas para Mestres!','error'); return; }
                document.getElementById('btnProfessor').classList.add('active');
                document.getElementById('btnAluno').classList.remove('active');
                document.getElementById('professorView').classList.remove('hidden');
                document.getElementById('alunoView').classList.add('hidden');
                this.renderProfessorTab('biblioteca');
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

            // Lógica de Respostas Internas dos Jogos
            const cur = this.desafioAtualObj;
            const input = document.getElementById('ig-input')?.value?.trim()||'';
            const listen = document.getElementById('ig-listenInput')?.value?.trim()||'';
            
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
                if(!input.toLowerCase().includes((cur.word||'').toLowerCase())){ this.registrarErro(cur,'word'); this.falhaGenerica(); }
                else { this.updateSRS(cur.id,'word',true); this.superarErro(cur.id); this.sucessoGenerico(50); }
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
                const sim = this.similaridade(input, cur.word);
                if(sim>=0.9){ this.updateSRS(cur.id,'picture',true); this.superarErro(cur.id); this.sucessoGenerico(75); }
                else { this.registrarErro(cur,'picture'); this.falhaGenerica(); }
            }
            if(a === 'verificar-envio'){
                if(input.length<2) return this.mostrarAvisoLocal('Responda válido','error');
                this.state.submissions.unshift({id:'sub_'+Date.now(), student:Workspace.usuario?.nome||'Aluno', game:b.dataset.game, text:input, status:'pending'});
                if(cur?.id) this.updateSRS(cur.id, b.dataset.game, true);
                this.sucessoGenerico(parseInt(b.dataset.bonus||'50'));
            }
            if(a === 'verificar-debate'){
                const texto = document.getElementById('ig-input')?.value?.trim()||'';
                if(texto.length<3) return this.mostrarAvisoLocal('Escreva o seu argumento','error');
                
                this.state._debateChat.push({role:'user', text:texto});
                this.ganharCoins('bronze', 15);
                this.renderGameDebateAI(); // Mostra a mensagem do user
                
                setTimeout(() => {
                    const poolTexts = this.state.pool.filter(p=>p.text).slice(0,3).map(p=>p.text.substring(0,60)).join(' | ');
                    const respIAs = [
                        `Interesting point. But what if we consider that "${texto.substring(0,30)}..." might have side effects?`,
                        `I disagree. Other students mentioned: "${poolTexts}". How do you defend your stance against that?`,
                        `Very well articulated. But tell me, how would you apply that in a real-world scenario?`
                    ];
                    this.state._debateChat.push({role:'ai', text: respIAs[Math.floor(Math.random()*respIAs.length)], inteligencia: 'Mago IA'});
                    this.renderGameDebateAI();
                    document.getElementById('ig-input').value = '';
                }, 1500);
            }
            
            // Ações do Professor
            if(a === 'render-tab') this.renderProfessorTab(b.dataset.tab);
            if(a === 'add-word') { const w=document.getElementById('nwWord').value; const t=document.getElementById('nwTrans').value; if(w){ this.state.words.unshift({id:'w'+Date.now(), word:w, translation:t}); this.saveDados(); this.renderProfessorTab('biblioteca'); } }
            if(a === 'add-phrase') { const p=document.getElementById('nwPhrase').value; if(p){ this.state.phrases.unshift({id:'p'+Date.now(), phrase:p}); this.saveDados(); this.renderProfessorTab('biblioteca'); } }
            if(a === 'remover-item') { this.state[b.dataset.key] = this.state[b.dataset.key].filter(i=>i.id!==b.dataset.id); this.saveDados(); this.renderProfessorTab('biblioteca'); }
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

    // 🚀 LÓGICA DO LOOP INFINITO - O SEGREDO ESTÁ AQUI
    sucessoGenerico: async function(bonusBase){
        if(this.desafioAtualObj?.id){ 
            this.marcarComoConcluido(this.desafioAtualObj.id); 
            this.updateSRS(this.desafioAtualObj.id, this.jogoAtual, true); 
        }
        
        this.ganharCoins('bronze', bonusBase);
        this.tocarSom('coin'); 
        
        const srs = this.state.srs[this.desafioAtualObj?.id];
        this.mostrarAvisoLocal(`🪙 +${bonusBase} Bronze! Próxima revisão em ${srs?.interval||1} dia(s)`, 'success');

        // Loop sem bloqueios - Avança direto para a próxima após 1.2 segundos
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
        const id=this.jogoAtual;
        if(id==='wordSpark') return (this.state.words&&this.state.words.length)?this.state.words:this.defaults.words;
        if(['readAloud','listenType','sentenceShuffle'].includes(id)) return (this.state.phrases&&this.state.phrases.length)?this.state.phrases:this.defaults.phrases;
        if(id==='quiz') return (this.state.quizzes&&this.state.quizzes.length)?this.state.quizzes:this.defaults.quizzes;
        if(id==='wordPicker') return (this.state.wordPickers&&this.state.wordPickers.length)?this.state.wordPickers:this.defaults.wordPickers;
        if(id==='minimalPairs') return (this.state.minimalPairs&&this.state.minimalPairs.length)?this.state.minimalPairs:this.defaults.minimalPairs;
        if(id==='picturePop') return (this.state.pictures&&this.state.pictures.length)?this.state.pictures:this.defaults.pictures;
        if(id==='answerQuest') return (this.state.questions&&this.state.questions.length)?this.state.questions:this.defaults.questions;
        if(id==='contextRole') return (this.state.roleplays&&this.state.roleplays.length)?this.state.roleplays:this.defaults.roleplays;
        if(id==='debateAI') return (this.state.debates&&this.state.debates.length)?this.state.debates:this.defaults.debates;
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

        // Limpa a memória só deste jogo para reiniciar a roleta
        const ids = colecao.map(i=>i.id);
        this.state.itensConcluidos = (this.state.itensConcluidos||[]).filter(id=>!ids.includes(id));
        this.saveDados();
        
        // Retoma imediatamente sem bloquear a tela
        this.renderDesafioAtual();
    },

    // ========= TELAS DOS JOGOS (Mapeadas para #modalBody) =========
    renderGameCapa(){
        const game = this.defaults.games.find(g=>g.id===this.jogoAtual);
        const totalItens = (this.getColecaoDoJogoAtual()||[]).length;
        document.getElementById('modalBody').innerHTML=`
            <div style="text-align:center; padding:20px 0;">
                <div style="font-size:60px; margin-bottom:16px;">${game.icon}</div>
                <h2 style="font-family:'Plus Jakarta Sans'; color:#0F172A; margin:0 0 8px 0;">${game.title}</h2>
                <p style="color:#64748B; font-size:15px; margin:0 0 20px 0;">${game.desc}</p>
                <div style="display:inline-flex; gap:10px; background:#F8FAFC; padding:10px 16px; border-radius:12px; border:1px solid #E2E8F0; margin-bottom:24px;">
                    <span style="font-weight:700; font-size:13px; color:#475569;">📦 ${totalItens} Desafios (SRS)</span>
                    <span style="font-weight:700; font-size:13px; color:#D97706;">🪙 Recompensa Contínua</span>
                </div>
                <button data-action="iniciar-jogo" class="ws-btn" style="width:100%; background:#4F46E5; color:#fff; border:none; padding:16px; border-radius:12px; font-size:16px; cursor:pointer;">Começar Treino Infinito ▶</button>
            </div>
        `;
    },

    renderGameWordSpark(){
        const col = (this.state.words?.length) ? this.state.words : this.defaults.words;
        this.desafioAtualObj = this.obterItemInteligente(col, 'word'); 
        if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const w = this.desafioAtualObj;
        
        document.getElementById('modalBody').innerHTML=`
            <div style="text-align:center;">
                <div class="ig-big-phrase" style="font-size:32px; color:#4F46E5;">${Workspace.escapeHTML(w.word)}</div>
                <p style="font-weight:700; color:#64748B;">Tradução: ${Workspace.escapeHTML(w.translation||'')}</p>
                <p style="font-weight:600; margin-top:20px;">Crie uma frase usando esta palavra:</p>
                <textarea id="ig-input" class="ig-textarea" placeholder="Type your sentence here..." style="min-height:100px; margin-top:10px;"></textarea>
                <button data-action="verificar-wordSpark" class="ws-btn" style="width:100%; background:#4F46E5; color:#fff; border:none; padding:16px; border-radius:12px; margin-top:16px; cursor:pointer;">Lançar Feitiço ✨</button>
            </div>`;
    },

    renderGameReadAloud(){
        this.desafioAtualObj = this.obterItemInteligente(this.state.phrases, 'phrase'); 
        if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const p = this.desafioAtualObj;
        document.getElementById('modalBody').innerHTML=`
            <div class="ig-big-phrase">${Workspace.escapeHTML(p.phrase)}</div>
            <div style="text-align:center; margin:15px 0;">
                <button data-action="falar-frase" class="ws-btn" style="background:#0F172A; color:#fff; padding:10px 20px; border-radius:20px; border:none; cursor:pointer;">🔊 Ouvir</button>
            </div>
            <div style="background:#F8FAFC; padding:20px; border-radius:12px; border:1px solid #E2E8F0; text-align:center;">
                <p style="font-weight:600; margin:0 0 10px 0;">Sua vez de ler:</p>
                <button data-action="iniciar-voz" data-tipo="phrase" class="ws-btn" style="background:#10B981; color:#fff; width:100%; padding:14px; border-radius:12px; border:none; cursor:pointer;">🎤 Gravar</button>
                <div id="ig-speechResult" style="margin-top:15px; font-weight:600;"></div>
            </div>`;
    },

    renderGameListenType(){
        this.desafioAtualObj = this.obterItemInteligente(this.state.phrases, 'phrase'); 
        if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        document.getElementById('modalBody').innerHTML=`
            <div style="text-align:center;">
                <div style="font-size:48px; margin-bottom:10px;">🦉</div>
                <button data-action="falar-frase" class="ws-btn" style="background:#4F46E5; color:#fff; padding:12px 30px; border-radius:20px; border:none; cursor:pointer; margin-bottom:20px;">🔊 Tocar Áudio</button>
                <input id="ig-listenInput" class="ig-input" placeholder="Transcreva exatamente o que ouviu..." style="text-align:center;">
                <button data-action="verificar-listen" class="ws-btn" style="width:100%; background:#10B981; color:#fff; margin-top:16px; padding:16px; border-radius:12px; border:none; cursor:pointer;">Desvendar Mistério</button>
            </div>`;
    },

    renderGameQuiz(){
        this.desafioAtualObj = this.obterItemInteligente(this.state.quizzes, 'quiz'); 
        if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const q = this.desafioAtualObj;
        document.getElementById('modalBody').innerHTML=`
            <div class="ig-big-phrase" style="font-size:22px;">${Workspace.escapeHTML(q.question)}</div>
            <div style="display:flex; flex-direction:column; gap:12px; margin-top:20px;">
                ${q.options.map((o,i)=>`<button data-action="verificar-quiz" data-index="${i}" class="ws-btn" style="background:#fff; border:2px solid #E2E8F0; padding:16px; border-radius:12px; cursor:pointer; text-align:left; font-size:16px;">${Workspace.escapeHTML(o)}</button>`).join('')}
            </div>`;
    },

    renderGameWordPicker(){
        const col = (this.state.wordPickers?.length) ? this.state.wordPickers : this.defaults.wordPickers;
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
        this.desafioAtualObj = this.obterItemInteligente(this.state.phrases, 'phrase'); 
        if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const phrase = this.desafioAtualObj; 
        const task = ['Transforme em Pergunta','Transforme em Negativa'][Math.floor(Math.random()*2)];
        document.getElementById('modalBody').innerHTML=`
            <div style="text-align:center; margin-bottom:10px;"><span style="background:#0F172A; color:#fff; padding:6px 12px; border-radius:20px; font-size:13px; font-weight:700;">${task}</span></div>
            <div class="ig-big-phrase">${Workspace.escapeHTML(phrase.phrase)}</div>
            <textarea id="ig-input" class="ig-textarea" placeholder="Sua nova frase aqui..." style="min-height:80px;"></textarea>
            <button data-action="verificar-envio" data-game="sentenceShuffle" class="ws-btn" style="width:100%; background:#4F46E5; color:#fff; margin-top:16px; border:none; padding:16px; border-radius:12px; cursor:pointer;">Submeter</button>`;
    },

    renderGameAnswerQuest(){
        const col = (this.state.questions?.length) ? this.state.questions : this.defaults.questions;
        this.desafioAtualObj = this.obterItemInteligente(col, 'question'); 
        if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        document.getElementById('modalBody').innerHTML=`
            <div class="ig-big-phrase" style="background:#FEF3C7; border-color:#F59E0B; color:#92400E;">❓ ${Workspace.escapeHTML(this.desafioAtualObj.text)}</div>
            <textarea id="ig-input" class="ig-textarea" placeholder="Sua resposta em inglês..." style="min-height:100px;"></textarea>
            <button data-action="verificar-envio" data-game="answerQuest" class="ws-btn" style="width:100%; margin-top:16px; background:#D97706; color:#fff; border:none; padding:16px; border-radius:12px; cursor:pointer;">Enviar Resposta</button>`;
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
            <button data-action="verificar-envio" data-game="questionMaker" class="ws-btn" style="width:100%; background:#4F46E5; color:#fff; margin-top:16px; border:none; padding:16px; border-radius:12px; cursor:pointer;">Testar Pergunta</button>`;
    },

    renderGameContextRole(){
        const col = (this.state.roleplays?.length) ? this.state.roleplays : this.defaults.roleplays;
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
            <button data-action="verificar-envio" data-game="contextRole" class="ws-btn" style="width:100%; margin-top:16px; background:#10B981; color:#fff; border:none; padding:16px; border-radius:12px; cursor:pointer;">Atuar e Enviar</button>`;
    },

    renderGameDebateAI(){
        const col = (this.state.debates?.length) ? this.state.debates : this.defaults.debates;
        this.desafioAtualObj = this.obterItemInteligente(col, 'debate');
        if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        
        if(!this.state._debateChat) this.state._debateChat=[];
        if(this.state._debateChat.length === 0){
            this.state._debateChat = [{role:'ai', text: this.desafioAtualObj.starter}];
        }
        
        const chatHtml = this.state._debateChat.map(m=>{
            if(m.role==='user'){
                return `<div style="display:flex; justify-content:flex-end; margin-bottom:12px;"><div style="background:#4F46E5; color:#fff; padding:12px 16px; border-radius:16px 16px 4px 16px; max-width:80%; font-size:14px;">${Workspace.escapeHTML(m.text)}</div></div>`;
            }else{
                return `<div style="display:flex; margin-bottom:12px;"><div style="background:#F1F5F9; border:1px solid #E2E8F0; color:#0F172A; padding:12px 16px; border-radius:4px 16px 16px 16px; max-width:80%; font-size:14px;"><div style="font-size:11px; color:#64748B; font-weight:700; margin-bottom:4px;">🤖 MAGO IA</div>${Workspace.escapeHTML(m.text)}</div></div>`;
            }
        }).join('');

        document.getElementById('modalBody').innerHTML=`
            <div style="background:#F8FAFC; padding:16px; border-radius:12px; border:1px solid #E2E8F0; margin-bottom:16px;">
                <div style="font-weight:800; color:#0F172A; font-size:15px;">⚔️ Tópico: ${Workspace.escapeHTML(this.desafioAtualObj.topic)}</div>
            </div>
            <div id="ig-debate-chat" style="height:250px; overflow-y:auto; padding:10px; margin-bottom:16px;">${chatHtml}</div>
            <div style="display:flex; gap:10px;">
                <textarea id="ig-input" class="ig-textarea" placeholder="Escreva seu argumento..." style="flex:1; min-height:50px; border-radius:12px;"></textarea>
                <button data-action="verificar-debate" class="ws-btn" style="background:#4F46E5; color:#fff; border:none; border-radius:12px; padding:0 20px; font-size:20px; cursor:pointer;">➤</button>
            </div>`;
        const div = document.getElementById('ig-debate-chat');
        if(div) div.scrollTop = div.scrollHeight;
    },

    renderGameMinimalPairs(){
        const col = (this.state.minimalPairs?.length) ? this.state.minimalPairs : this.defaults.minimalPairs;
        this.desafioAtualObj = this.obterItemInteligente(col, 'minimal'); 
        if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        
        const pair = this.desafioAtualObj; 
        const target = Math.random()>0.5 ? pair.a : pair.b; 
        this.state._minimalTarget = target;
        
        document.getElementById('modalBody').innerHTML=`
            <div style="text-align:center; padding:20px 0;">
                <div style="font-size:48px; margin-bottom:16px;">👄</div>
                <button data-action="falar-frase" data-text="${target}" class="ws-btn" style="background:#4F46E5; color:#fff; padding:16px 40px; border-radius:30px; border:none; cursor:pointer; font-size:16px;">🎧 Ouvir Palavra</button>
                <div style="display:flex; gap:16px; justify-content:center; margin-top:30px;">
                    <button data-action="verificar-minimal" data-choice="${pair.a}" class="ws-btn" style="flex:1; background:#fff; border:2px solid #E2E8F0; padding:20px; border-radius:16px; cursor:pointer; font-size:20px; font-weight:800;">${pair.a}</button>
                    <button data-action="verificar-minimal" data-choice="${pair.b}" class="ws-btn" style="flex:1; background:#fff; border:2px solid #E2E8F0; padding:20px; border-radius:16px; cursor:pointer; font-size:20px; font-weight:800;">${pair.b}</button>
                </div>
            </div>`;
    },

    renderGamePicturePop(){
        const col = (this.state.pictures?.length) ? this.state.pictures : this.defaults.pictures;
        this.desafioAtualObj = this.obterItemInteligente(col, 'picture'); 
        if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const pic = this.desafioAtualObj;
        
        document.getElementById('modalBody').innerHTML=`
            <div style="text-align:center;">
                <div style="width:160px; height:160px; border-radius:30px; background:#F8FAFC; border:4px solid #E2E8F0; display:flex; align-items:center; justify-content:center; margin:0 auto 24px auto; font-size:80px; box-shadow:0 10px 20px rgba(0,0,0,0.05);">${pic.emoji}</div>
                <div style="background:#fff; border:2px solid #E2E8F0; padding:24px; border-radius:20px;">
                    <button data-action="iniciar-voz" data-tipo="picture" class="ws-btn" style="background:#10B981; color:#fff; width:100%; border-radius:16px; padding:16px; border:none; font-size:16px; cursor:pointer;">🎤 Falar o Nome em Inglês</button>
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
    },

    renderProfessorTab(tabId){
        document.querySelectorAll('.side-item').forEach(b=>b.classList.remove('active'));
        const activeBtn = document.querySelector(`.side-item[data-tab="${tabId}"]`);
        if(activeBtn) activeBtn.classList.add('active');
        
        document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
        const panel = document.getElementById(`tab-${tabId}`);
        if(panel) panel.classList.add('active');

        const esc = Workspace.escapeHTML;

        if(tabId === 'biblioteca'){
            document.getElementById('tab-biblioteca').innerHTML=`
                <h3 style="margin-top:0;">📚 Biblioteca de Conteúdo (Algoritmo SRS)</h3>
                <p style="color:#64748B; font-size:14px; margin-bottom:20px;">Tudo que você adicionar aqui alimenta os jogos dos alunos. O algoritmo controla a repetição e fixação automaticamente.</p>
                
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                    <div style="background:#F8FAFC; border:1px solid #E2E8F0; padding:16px; border-radius:12px;">
                        <h4 style="margin-top:0;">Vocabulário (${this.state.words.length})</h4>
                        <div style="display:flex; gap:8px; margin-bottom:12px;">
                            <input id="nwWord" class="ig-input" placeholder="Palavra">
                            <input id="nwTrans" class="ig-input" placeholder="Tradução">
                            <button data-action="add-word" class="ws-btn" style="background:#4F46E5; color:#fff; border:none; border-radius:8px; padding:0 16px;">+</button>
                        </div>
                        <div style="max-height:200px; overflow-y:auto; font-size:13px;">
                            ${this.state.words.map(w=>`<div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #E2E8F0;"><span><b>${esc(w.word)}</b> - ${esc(w.translation)}</span><button data-action="remover-item" data-key="words" data-id="${w.id}" style="color:red;border:none;background:none;cursor:pointer;">✕</button></div>`).join('')}
                        </div>
                    </div>
                    
                    <div style="background:#F8FAFC; border:1px solid #E2E8F0; padding:16px; border-radius:12px;">
                        <h4 style="margin-top:0;">Frases e Expressões (${this.state.phrases.length})</h4>
                        <div style="display:flex; gap:8px; margin-bottom:12px;">
                            <input id="nwPhrase" class="ig-input" placeholder="Frase em inglês">
                            <button data-action="add-phrase" class="ws-btn" style="background:#4F46E5; color:#fff; border:none; border-radius:8px; padding:0 16px;">+</button>
                        </div>
                        <div style="max-height:200px; overflow-y:auto; font-size:13px;">
                            ${this.state.phrases.map(p=>`<div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #E2E8F0;"><span>${esc(p.phrase)}</span><button data-action="remover-item" data-key="phrases" data-id="${p.id}" style="color:red;border:none;background:none;cursor:pointer;">✕</button></div>`).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
        else if (tabId === 'envios'){
            const pendentes = this.state.submissions.filter(s=>s.status==='pending');
            document.getElementById('pendingCount').textContent = pendentes.length;
            document.getElementById('tab-envios').innerHTML=`
                <h3 style="margin-top:0;">📥 Envios e Construção do Algoritmo</h3>
                <p style="color:#64748B; font-size:14px; margin-bottom:20px;">Respostas dos alunos alimentam a "Piscina Global", criando perguntas e debates dinâmicos.</p>
                ${pendentes.length===0 ? '<p style="color:#94a3b8; padding:20px; text-align:center;">Nenhum envio pendente. Vá descansar, professor!</p>' : 
                pendentes.map(s=>`
                    <div style="background:#fff; border:1px solid #E2E8F0; border-left:4px solid #F59E0B; padding:16px; border-radius:8px; margin-bottom:12px;">
                        <div style="font-size:12px; color:#64748B; margin-bottom:8px;"><b>${esc(s.student)}</b> • Jogo: ${esc(s.game)}</div>
                        <div style="font-size:15px; color:#0F172A; margin-bottom:12px;">${esc(s.text)}</div>
                        <div style="display:flex; gap:10px;">
                            <button data-action="aprovar-envio" data-id="${s.id}" class="ws-btn" style="background:#10B981; color:#fff; border:none; padding:8px 16px; border-radius:6px; cursor:pointer;">✅ Aprovar para a Piscina</button>
                            <button data-action="rejeitar-envio" data-id="${s.id}" class="ws-btn" style="background:#FEE2E2; color:#EF4444; border:none; padding:8px 16px; border-radius:6px; cursor:pointer;">🗑 Rejeitar</button>
                        </div>
                    </div>
                `).join('')}
            `;
        }
        else {
            const panel = document.getElementById(`tab-${tabId}`);
            if(panel) panel.innerHTML = `<div style="padding:40px;text-align:center;color:#64748B;">Seção ${tabId} em desenvolvimento...</div>`;
        }
    }
};

setTimeout(()=> Workspace.Ingles.init(), 100);