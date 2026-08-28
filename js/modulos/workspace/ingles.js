// js/modulos/workspace/ingles.js - V11 FINAL (RPG Completo + Conexão Absoluta ao MongoDB)
window.Workspace = window.Workspace || {};
if(!window.Workspace.escapeHTML){
    window.Workspace.escapeHTML = (s)=> String(s||'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}

// ===================== VOICE SERVICE - MASCULINA BONITA E GRAVE =====================
const VoiceService = (() => {
    let cacheNormal = null, cacheMago = null, resolver = null;
    const ready = new Promise(r => resolver = r);

    const FEMALE_BLOCK = ['female','samantha','zira','karen','victoria','tessa','moira','siri','veena','fiona','susan','heather','jenny','aria','emma','michelle','linda','karen','tessa'];
    
    const SCORE_NORMAL = [
        {k:'david', s:1000}, {k:'alex', s:950}, {k:'daniel', s:900}, 
        {k:'google uk english male', s:880}, {k:'mark', s:850}, {k:'arthur', s:800}, {k:'oliver', s:790}, {k:'aaron', s:780}
    ];
    const SCORE_MAGO = [ 
        {k:'david', s:1000}, {k:'alex', s:990}, 
        {k:'daniel', s:950}, {k:'google uk english male', s:930}, 
        {k:'arthur', s:900}, {k:'oliver', s:890}, {k:'mark', s:850}, {k:'guy', s:800}
    ];

    const pick = (voices, isMago) => {
        const en = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
        if(!en.length) return null;
        const pool = en.filter(v => !FEMALE_BLOCK.some(f => (v.name+v.voiceURI).toLowerCase().includes(f)));
        const base = pool.length ? pool : en;
        const map = isMago ? SCORE_MAGO : SCORE_NORMAL;
        
        const scored = base.map(v=>{
            const id=(v.name+' '+v.voiceURI).toLowerCase();
            let sc=100; 
            map.forEach(o=>{ if(id.includes(o.k)) sc=o.s; });
            if(id.includes('male') && !id.includes('female')) sc+=200;
            if(v.localService) sc+=80;
            if(v.default) sc+=50;
            return {v, sc, id};
        }).sort((a,b)=>b.sc-a.sc);

        return scored[0]?.v || null;
    };

    const init = () => {
        const vs = window.speechSynthesis?.getVoices() || [];
        if(vs.length){ 
            cacheNormal = pick(vs, false);
            cacheMago = pick(vs, true) || cacheNormal;
            if(resolver) resolver(true);
        }
    };

    if('speechSynthesis' in window){
        window.speechSynthesis.onvoiceschanged = init;
        init(); setTimeout(init, 300); setTimeout(init, 1000);
    }

    return {
        ready,
        getVoice: (isMago=false) => isMago ? (cacheMago||cacheNormal) : cacheNormal,
        falar: async (text, {rate=0.95, isMago=false}={})=>{
            if(!('speechSynthesis' in window)) return;
            await ready; 
            const freshVoices = window.speechSynthesis.getVoices();
            if(freshVoices.length && !cacheNormal){
                cacheNormal = pick(freshVoices, false);
                cacheMago = pick(freshVoices, true) || cacheNormal;
            }
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
            const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
            const voz = isMago ? (cacheMago || cacheNormal) : cacheNormal;

            if(voz){
                u.voice = voz; 
                u.lang = voz.lang;
                if(isMago){
                    if(isIOS){
                        u.pitch = 0.75; u.rate = 0.88;
                    } else if(isMobile){
                        u.pitch = 0.70; u.rate = 0.88;
                    } else {
                        u.pitch = 0.80; u.rate = 0.85;
                    }
                }else{
                    u.pitch = isMobile ? 0.85 : 0.92;
                    u.rate = rate;
                }
            }else{
                u.lang = isMobile ? 'en-GB' : 'en-US';
                u.pitch = isMago ? 0.30 : 0.45;
                u.rate = isMago ? 0.85 : rate;
            }
            u.volume = 1;
            window.speechSynthesis.speak(u);
            return new Promise(res=>{ u.onend=res; u.onerror=res; });
        }
    };
})();

const TimerService = {
    _id:null, remaining:0, _paused:false,
    start(sec, onTick, onEnd){
        this.stop(); this.remaining=sec; this._paused=false;
        onTick(this.remaining);
        this._id = setInterval(()=>{
            if(this._paused) return;
            this.remaining--; onTick(this.remaining);
            if(this.remaining<=0){ this.stop(); onEnd&&onEnd(); }
        },1000);
    },
    pause(){ this._paused=true; }, resume(){ this._paused=false; },
    stop(){ if(this._id){ clearInterval(this._id); this._id=null; } }
};

const ParticleEngine = {
    _exploding:false,
    explode(x,y){
        if(this._exploding) return; this._exploding=true;
        const flash=document.createElement('div');
        flash.style.cssText='position:fixed;inset:0;background:white;z-index:9999999;opacity:0.85;pointer-events:none;transition:opacity 0.6s;';
        document.body.appendChild(flash);
        requestAnimationFrame(()=>flash.style.opacity='0');
        setTimeout(()=>flash.remove(),700);
        const wave=document.createElement('div');
        wave.style.cssText=`position:fixed;left:${x}px;top:${y}px;width:10px;height:10px;border-radius:50%;box-shadow:0 0 80px 40px #f1c40f,inset 0 0 30px #fff;z-index:9999998;pointer-events:none;transform:translate(-50%,-50%);animation:shockwave 1.2s ease-out forwards;`;
        document.body.appendChild(wave); setTimeout(()=>wave.remove(),1200);
        const frag=document.createDocumentFragment();
        const forca=Math.min(window.innerWidth*0.9, 1200);
        const cores=['#ffeb3b','#e67e22','#c0392b','#ff9800'];
        for(let i=0;i<60;i++){
            const el=document.createElement('div'); el.className='ig-fireball';
            const ang=Math.random()*Math.PI*2, vel=300+Math.random()*forca;
            el.style.left=x+'px'; el.style.top=y+'px';
            el.style.setProperty('--tx', Math.cos(ang)*vel+'px');
            el.style.setProperty('--ty', Math.sin(ang)*vel+'px');
            el.style.background=cores[i%4]; const s=15+Math.random()*25; el.style.width=s+'px'; el.style.height=s+'px';
            frag.appendChild(el);
        }
        for(let i=0;i<100;i++){
            const el=document.createElement('div'); el.className='ig-sparkle';
            const ang=Math.random()*Math.PI*2, vel=200+Math.random()*forca*1.2;
            el.style.left=x+'px'; el.style.top=y+'px';
            el.style.setProperty('--tx', Math.cos(ang)*vel+'px');
            el.style.setProperty('--ty', Math.sin(ang)*vel+'px');
            el.style.background='#fff'; const s=5+Math.random()*10; el.style.width=s+'px'; el.style.height=s+'px';
            frag.appendChild(el);
        }
        document.body.appendChild(frag);
        setTimeout(()=>{
            document.querySelectorAll('.ig-fireball,.ig-sparkle').forEach(e=>e.remove());
            this._exploding=false;
        },2600);
    }
};

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
        xp:0, streak:1, avatarEquipado:null, inventario:[], coins:{bronze:150, prata:20, ouro:2}, diamantes:250, energia:5, words:[], phrases:[], quizzes:[], pictures:[], minimalPairs:[], debates:[], submissions:[], pool:[],
        errosRetidos:[], itensConcluidos:[], magoPhrases:[], srs:{},
        magoConfig:{ vozAtiva:true, modoExibicao:'aleatorio' },
        _minimalTarget:null, editingMagoId:null
    },
    mediaRecorder:null, audioChunks:[], currentAudioURL:null, audioBlob:null, streamMicrofone:null, recognition:null,
    bauDestrancado:false, tempoGlobalDefinido:false, sessaoEncerrada:false, jogoAtual:null, tempoRestante:0, xpGanhosNaSessao:0, desafioAtualObj:null, digitandoAtivo:false, magoIntervalTimer:null, sseListenerConfigurado:false,

    defaults: {
        magoConfig:{ vozAtiva:true, modoExibicao:'aleatorio' },
        magoPhrases:[
            {id:'m1', text:'Let us go! (citarAluno)'},
            {id:'m2', text:'Welcome again, brave (citarAluno)!'},
            {id:'m3', text:'Choose one, young wizard!'}
        ],
        words:[
            {id:'w1', word:'Although', translation:'Embora', level:'B2', example:'Although it was raining, we went out.', context:'Concessão'},
            {id:'w2', word:'Beneath', translation:'Abaixo de', level:'B1', example:'The keys were beneath the book.', context:'Preposição'},
            {id:'w3', word:'Achieve', translation:'Alcançar', level:'B1', example:'You can achieve anything with focus.', context:'Verbo'},
            {id:'w4', word:'Whisper', translation:'Sussurrar', level:'B2', example:'She whispered a secret.', context:'Verbo'}
        ],
        phrases:[
            {id:'p1', phrase:'Could you tell me where the nearest pharmacy is?', translation:'Você poderia me dizer onde fica a farmácia mais próxima?', level:'A2', focus:'Politeness'},
            {id:'p2', phrase:'If I had more time, I would travel the world.', translation:'Se eu tivesse mais tempo, viajaria o mundo.', level:'B2', focus:'Second Conditional'},
            {id:'p3', phrase:'She has been learning English for three years.', translation:'Ela está aprendendo inglês há três anos.', level:'B1', focus:'Present Perfect Continuous'}
        ],
        quizzes:[
            {id:'q1', question:'Choose the correct sentence:', options:['I have been to London last year','I went to London last year','I have went to London last year'], correct:1, explanation:'Use past simple with finished time.', level:'B1'},
            {id:'q2', question:'Fill: I _____ here since 2019.', options:['live','am living','have lived','lived'], correct:2, explanation:'Present perfect with since.', level:'B1'}
        ],
        pictures:[
            {id:'pic1', word:'apple', translation:'maçã', emoji:'🍎', category:'Food'},
            {id:'pic2', word:'bicycle', translation:'bicicleta', emoji:'🚲', category:'Transport'},
            {id:'pic3', word:'laptop', translation:'notebook', emoji:'💻', category:'Tech'},
            {id:'pic4', word:'umbrella', translation:'guarda-chuva', emoji:'☂', category:'Objects'}
        ],
        minimalPairs:[
            {id:'mp1', a:'ship', b:'sheep', ipaA:'/ʃɪp/', ipaB:'/ʃiːp/', sentenceA:'The ship is big.', sentenceB:'The sheep is white.'},
            {id:'mp2', a:'beach', b:'bitch', ipaA:'/biːtʃ/', ipaB:'/bɪtʃ/', sentenceA:'Let\'s go to the beach.', sentenceB:'That word is offensive.'}
        ],
        debates:[
            {id:'d1', topic:'Social media does more harm than good', stance:'Do you agree?', starter:'Social media connects us, but also increases anxiety. What is your opinion?'},
            {id:'d2', topic:'AI will replace teachers', stance:'You defend teachers', starter:'AI can give exercises, but can it motivate a student?'}
        ],
        wordPickers:[
            {id:'wp1', text:'I have _____ my keys. Have you seen them?', options:['lost','lose','loosed'], correct:0},
            {id:'wp2', text:'She is _____ than her sister.', options:['tall','taller','tallest'], correct:1}
        ],
        questions:[
            {id:'aq1', text:'What did you do last weekend?'},
            {id:'aq2', text:'Describe your dream house.'},
            {id:'aq3', text:'If you could live anywhere, where would you live?'}
        ],
        roleplays:[
            {id:'rp1', title:'✈ No Aeroporto', prompt:'You are at check-in. The attendant says: "Can I see your passport and ticket?"', tip:'Use: Here you are'},
            {id:'rp2', title:'🍽 No Restaurante', prompt:'Waiter: "Are you ready to order?"', tip:'Use: I would like...'}
        ],
        games:[
            {id:'wordSpark', title:'🪄 Feitiço das Palavras', desc:'Invoque uma frase com a palavra-chave.', icon:'🪄', color:'#E0E7FF', level:'B1-B2'},
            {id:'readAloud', title:'🐉 Sopro do Dragão', desc:'Fale ao microfone e a IA avaliará.', icon:'🐉', color:'#D1FAE5', level:'A2-C1'},
            {id:'listenType', title:'🦉 Ecos da Coruja', desc:'Escute o áudio e transcreva.', icon:'🦉', color:'#FEF3C7', level:'A2-B1'},
            {id:'quiz', title:'👁 Enigma da Esfinge', desc:'Responda corretamente.', icon:'👁', color:'#FEE2E2', level:'A1-B2'},
            {id:'wordPicker', title:'🧪 Poção Sintática', desc:'Escolha o ingrediente certo.', icon:'🧪', color:'#E0E7FF', level:'A2-B1'},
            {id:'sentenceShuffle', title:'🌀 Labirinto Ilusório', desc:'Transforme as frases.', icon:'🌀', color:'#D1FAE5', level:'B1-B2'},
            {id:'answerQuest', title:'📜 Pergaminho do Herói', desc:'Responda abertamente.', icon:'📜', color:'#FEF3C7', level:'B1-C1'},
            {id:'questionMaker', title:'🔮 Espelho do Oráculo', desc:'Formule a pergunta.', icon:'🔮', color:'#F5D0FE', level:'B1-B2'},
            {id:'contextRole', title:'🎭 Manto do Metamorfo', desc:'Assuma a identidade.', icon:'🎭', color:'#CCFBF1', level:'B1-C1'},
            {id:'debateAI', title:'⚔ Duelo de Mentes', desc:'Debate denso.', icon:'⚔', color:'#E0F2FE', level:'B2-C1'},
            {id:'minimalPairs', title:'♊ Sussurros Gêmeos', desc:'Diferencie sons.', icon:'♊', color:'#FFEDD5', level:'B1-C1'},
            {id:'picturePop', title:'👁🗨 Visão do Alquimista', desc:'Invoque o nome da relíquia.', icon:'👁🗨', color:'#DCFCE7', level:'A1-B1'},
            {id:'portalMagico', title:'🌀 Portal Mágico', desc:'Viaje no tempo entre desafios! 5 vitórias = magia do mago + XP bônus!', icon:'🌀', color:'#E0E7FF', level:'A1-C1'}
        ],
        avatares:[
            {id:'av1', nome:'Aprendiz', emoji:'🧙‍♂️', preco:0, desc:'Primeiro avatar grátis', raridade:'comum', bonus:'+5% XP'},
            {id:'av2', nome:'Guerreiro', emoji:'⚔️', preco:100, desc:'Corajoso', raridade:'raro', bonus:'+10% Coins'},
            {id:'av3', nome:'Maga', emoji:'🧝‍♀️', preco:200, desc:'Sábia', raridade:'epico', bonus:'+15% XP'},
            {id:'av4', nome:'Arqueiro', emoji:'🏹', preco:300, desc:'Preciso', raridade:'epico', bonus:'+20% Coins'},
            {id:'av5', nome:'Dragão', emoji:'🐉', preco:500, desc:'Lendário', raridade:'lendario', bonus:'+30% Tudo'}
        ]
    },

    init(){
        this.injetarCSS(); this.construirHTML(); this.bindEvents();
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
        if(!this.sseListenerConfigurado && Workspace.usuario){
            const escolaId=Workspace.usuario.escolaId||'DEFAULT';
            try{
                const evt=new EventSource(`/api/workspace/stream?escolaId=${escolaId}`);
                evt.onmessage=(ev)=>{ try{ const d=JSON.parse(ev.data); if(d.type==='BAU_INGLES_UPDATE') this.sincronizarTempoReal(); }catch{} };
                this.sseListenerConfigurado=true;
            }catch{}
        }
    },

    renderizarVisualizacao: function() {
        this.abrirBau();
    },

    abrirBau(){ 
        this.loadDados().then(() => {
            this.atualizarHubV2();
            
            const isProfessor = Workspace.usuario?.tipo !== 'Aluno';
            const btnProf = document.getElementById('btnProfessor');
            const btnAluno = document.getElementById('btnAluno');
            const alunoView = document.getElementById('ig-alunoView');
            const profView = document.getElementById('ig-professorView');
            const guardian = document.getElementById('ig-guardian-screen');
            const timeout = document.getElementById('ig-timeout-screen');
            
            if(isProfessor) {
                if(btnProf) { btnProf.style.display = 'inline-block'; btnProf.classList.add('active'); }
                if(btnAluno) btnAluno.classList.remove('active');
                
                if(profView) profView.style.display='flex';
                if(alunoView) alunoView.style.display='none';
                if(guardian) guardian.style.display='none';
                if(timeout) timeout.style.display='none';
                this.renderProfessorTab('biblioteca');
            } else {
                if(btnProf) btnProf.style.display = 'none';
                if(btnAluno) btnAluno.classList.add('active');
                
                if(profView) profView.style.display='none';
                if(this.sessaoEncerrada){
                    if(timeout) timeout.style.display='flex';
                    if(guardian) guardian.style.display='none';
                    if(alunoView) alunoView.style.display='none';
                }else if(!this.tempoGlobalDefinido){
                    if(guardian) guardian.style.display='flex';
                    if(timeout) timeout.style.display='none';
                    if(alunoView) alunoView.style.display='none';
                }else{
                    if(alunoView){ 
                        alunoView.style.display='block'; 
                        this.renderAlunoGrid(); 
                    }
                    if(guardian) guardian.style.display='none';
                    if(timeout) timeout.style.display='none';
                }
            }
        });
    },

    sincronizarTempoReal: async function(){ 
        const modal=document.getElementById('ig-gameModal'); 
        if(modal && modal.style.display!=='none') return; 
        await this.loadDados(); 
        const hub=document.getElementById('ig-alunoView'); 
        if(hub && hub.style.display!=='none' && Workspace.usuario.tipo==='Aluno' && !this.digitandoAtivo) this.iniciarFalaGuardiao(false); 
        const tab=document.querySelector('.ig-menu-btn.active'); 
        if(tab && Workspace.usuario.tipo!=='Aluno') this.renderProfessorTab(tab.dataset.tab); 
    },

    async loadDados(){
        try{
            const escolaId=Workspace.usuario.escolaId||'DEFAULT';
            const res=await Workspace.api(`/workspace/ingles/dados?escolaId=${escolaId}`,'GET');
            if(res && res.success && res.dados){
                const d=res.dados;
                // 🚀 LÓGICA DE HIDRATAÇÃO: Respeita DB, ignora Defaults se já houver salvamento
                const dbJaFoiSalvo = !!d.ultimaAtualizacao;

                if (dbJaFoiSalvo) {
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

                this.state.submissions = Array.isArray(d.submissions)?d.submissions:[];
                this.state.pool = Array.isArray(d.pool)?d.pool:[];
                this.state.errosRetidos = Array.isArray(d.errosRetidos)?d.errosRetidos:[];
                this.state.magoPhrases = Array.isArray(d.magoPhrases)&&d.magoPhrases.length?d.magoPhrases:[...this.defaults.magoPhrases];
                this.state.magoConfig = (d.magoConfig&&typeof d.magoConfig==='object')?d.magoConfig:{...this.defaults.magoConfig};
                this.state.srs = (d.srs&&typeof d.srs==='object')?d.srs:{};
                this.state.quests = Array.isArray(d.quests)&&d.quests.length?d.quests:[];
                this.state.achievements = Array.isArray(d.achievements)?d.achievements:[];
                this.state.season = (d.season&&typeof d.season==='object')?d.season:{id:'S1', nome:'Era dos Feitiços', xpMultiplier:1, ativa:true};
                this.state.lootTables = (d.lootTables&&typeof d.lootTables==='object')?d.lootTables:{};
                this.state.levelCurve = Array.isArray(d.levelCurve)&&d.levelCurve.length?d.levelCurve:[0,100,250,450,700,1000,1400,1900,2500,3200,4000,5000,6200];
            }else{
                this.state.words=[...this.defaults.words]; this.state.phrases=[...this.defaults.phrases];
                this.state.quizzes=[...this.defaults.quizzes]; this.state.pictures=[...this.defaults.pictures];
                this.state.submissions=[]; this.state.pool=[]; this.state.errosRetidos=[]; this.state.magoPhrases=[...this.defaults.magoPhrases];
                this.state.magoConfig={...this.defaults.magoConfig}; this.state.srs={};
            }
            const userK=`ws_ingles_user_${Workspace.usuario.id}`;
            this.state.xp=parseInt(localStorage.getItem(`${userK}_xp`)||'0');
            this.state.tituloEquipado=localStorage.getItem(`${userK}_tituloEquipado`)||'Aprendiz';
            this.state.bordaEquipada=localStorage.getItem(`${userK}_bordaEquipada`)||'';
            try{ this.state.inventario=JSON.parse(localStorage.getItem(`${userK}_inventario`)||'[]'); }catch{ this.state.inventario=[]; }
            try{ this.state.medalhas=JSON.parse(localStorage.getItem(`${userK}_medalhas`)||'[]'); }catch{ this.state.medalhas=[]; }
            this.state.streak=parseInt(localStorage.getItem(`${userK}_streak`)||'1');
            this.state.itensConcluidos=JSON.parse(localStorage.getItem(`${userK}_concluidos`)||'[]');
            try{
                const localSRS=JSON.parse(localStorage.getItem(`${userK}_srs`)||'{}');
                this.state.srs = {...this.state.srs, ...localSRS};
            }catch{}
        }catch(e){ console.error('loadDados',e); }
    },
    
    saveDados: async function(){
        const userK=`ws_ingles_user_${Workspace.usuario.id}`;
        try{
            localStorage.setItem(`${userK}_xp`, String(this.state.xp));
            localStorage.setItem(`${userK}_streak`, String(this.state.streak));
            localStorage.setItem(`${userK}_tituloEquipado`, this.state.tituloEquipado||'Aprendiz');
            localStorage.setItem(`${userK}_bordaEquipada`, this.state.bordaEquipada||'');
            localStorage.setItem(`${userK}_inventario`, JSON.stringify(this.state.inventario||[]));
            localStorage.setItem(`${userK}_medalhas`, JSON.stringify(this.state.medalhas||[]));
            localStorage.setItem(`${userK}_concluidos`, JSON.stringify(this.state.itensConcluidos));
            localStorage.setItem(`${userK}_srs`, JSON.stringify(this.state.srs));
        }catch{}
        try{
            // 🚀 SALVA O XP E RANKING DO ALUNO NO MONGO DB
            if(Workspace.usuario?.tipo==='Aluno'){
                const lvl = this.calcularLevel(this.state.xp).level;
                Workspace.api('/workspace/ingles/xp','POST',{
                    userId:Workspace.usuario.id, 
                    escolaId:Workspace.usuario.escolaId||'DEFAULT', 
                    nome:Workspace.usuario.nome||Workspace.usuario.login, 
                    xp:this.state.xp, 
                    streak:this.state.streak, 
                    level:lvl, 
                    titulo:this.state.titulo, 
                    tituloEquipado:this.state.tituloEquipado, 
                    bordaEquipada:this.state.bordaEquipada, 
                    inventario:this.state.inventario, 
                    medalhas:this.state.medalhas, 
                    questsProgress:this.state.questsProgress, 
                    portalStreak:this.portalStreak||this.state.portalStreak||0, 
                    portalRodada:this.portalRodada||1, 
                    portalTarget:this.portalTarget||5, 
                    portalRecorde:Math.max(this.portalStreak||0, this.state.portalRecorde||0)
                }).catch(()=>{});
            }
            
            // 🚀 SALVA OS DADOS DO PROFESSOR NO MONGO DB
            await Workspace.api('/workspace/ingles/dados','PUT',{
                escolaId:Workspace.usuario.escolaId||'DEFAULT',
                words:this.state.words, phrases:this.state.phrases, quizzes:this.state.quizzes, pictures:this.state.pictures,
                wordPickers:this.state.wordPickers, minimalPairs:this.state.minimalPairs, debates:this.state.debates, roleplays:this.state.roleplays, questions:this.state.questions,
                submissions:this.state.submissions, pool:this.state.pool, errosRetidos:this.state.errosRetidos,
                magoPhrases:this.state.magoPhrases, magoConfig:this.state.magoConfig, srs:this.state.srs,
                quests:this.state.quests, lootTables:this.state.lootTables, season:this.state.season
            });
        }catch{}
    },

    getSRS(id){ return this.state.srs[id] || null; },
    updateSRS(id, tipo, success){
        const prev=this.state.srs[id] || {ease:2.5, interval:0, repetitions:0, lapses:0, due:0, tipo};
        const next=SRSService.calc(success, prev);
        next.tipo=tipo; next.id=id;
        this.state.srs[id]=next;
        this.saveDados();
        return next;
    },
    registrarErro(itemOriginal, tipoConteudo){
        if(!itemOriginal?.id) return;
        const ja=this.state.errosRetidos.find(e=>e.id===itemOriginal.id);
        if(!ja) this.state.errosRetidos.push({...itemOriginal, _tipoDefeito:tipoConteudo});
        this.updateSRS(itemOriginal.id, tipoConteudo, false);
    },
    superarErro(itemId){
        const idx=this.state.errosRetidos.findIndex(e=>e.id===itemId);
        if(idx!==-1) this.state.errosRetidos.splice(idx,1);
    },
    marcarComoConcluido(itemId){
        if(!itemId) return;
        if(!this.state.itensConcluidos.includes(itemId)) this.state.itensConcluidos.push(itemId);
    },

    obterItemInteligente(listaPadrao, tipoConteudo){
        if(!Array.isArray(listaPadrao) || !listaPadrao.length) return null;
        const now=Date.now();
        const concluidos=this.state.itensConcluidos||[];
        const comSRS=listaPadrao.map(item=>{
            const srs=this.state.srs[item.id];
            return {item, srs, isDue: srs ? srs.due <= now : false, isNew: !srs || srs.repetitions===0};
        });
        const vencidos=comSRS.filter(e=>e.srs && e.isDue).sort((a,b)=>a.srs.due - b.srs.due);
        if(vencidos.length){
            if(Math.random()<0.8) return vencidos[0].item;
            return vencidos[Math.floor(Math.random()*Math.min(3,vencidos.length))].item;
        }
        const retidos=this.state.errosRetidos.filter(e=>e._tipoDefeito===tipoConteudo && !concluidos.includes(e.id));
        if(retidos.length && Math.random()<0.6){
            return retidos[Math.floor(Math.random()*retidos.length)];
        }
        const novos=comSRS.filter(e=>e.isNew && !concluidos.includes(e.item.id));
        if(novos.length){
            return novos[Math.floor(Math.random()*novos.length)].item;
        }
        const disponiveis=listaPadrao.filter(i=>!concluidos.includes(i.id) || (this.state.srs[i.id]?.due||0) <= now);
        
        // 🚀 LOOP INFINITO: Zera o progresso local deste jogo quando todos os itens forem concluídos
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
            if(tipo==='xp'){ osc.frequency.value=800; gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime+0.3); osc.start(); osc.stop(ctx.currentTime+0.3); }
            else if(tipo==='level'){ osc.frequency.value=600; osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime+0.5); gain.gain.setValueAtTime(0.4, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime+0.6); osc.start(); osc.stop(ctx.currentTime+0.6); }
            else if(tipo==='quest'){ osc.frequency.value=400; osc.frequency.linearRampToValueAtTime(900, ctx.currentTime+0.3); gain.gain.setValueAtTime(0.3, ctx.currentTime); osc.start(); osc.stop(ctx.currentTime+0.3); }
            else if(tipo==='coin'){ osc.frequency.value=800; gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime+0.3); osc.start(); osc.stop(ctx.currentTime+0.3); }
        }catch{}
    },
    confete(){
        try{
            const c=document.createElement('div');
            c.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:999999;overflow:hidden';
            document.body.appendChild(c);
            for(let i=0;i<30;i++){
                const p=document.createElement('div');
                p.style.cssText=`position:absolute;left:${Math.random()*100}%;top:-10px;width:8px;height:12px;background:hsl(${Math.random()*60+30},100%,50%);transform:rotate(${Math.random()*360}deg);animation:confettiFall ${1+Math.random()}s ease forwards`;
                c.appendChild(p);
            }
            const style=document.createElement('style');
            style.textContent='@keyframes confettiFall{0%{transform:translateY(0) rotate(0deg)}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}';
            document.head.appendChild(style);
            setTimeout(()=>c.remove(),2000);
        }catch{}
    },
    mostrarLevelUp(oldLevel, newLevel){
        this.tocarSom('level');
        this.confete();
        const modal=document.createElement('div');
        modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:1000005;animation:popIn 0.4s ease';
        modal.innerHTML=`<div style="background:linear-gradient(180deg,#0F172A 0%,#1E293B 100%);border:4px solid #fde68a;border-radius:24px;padding:32px;text-align:center;max-width:360px;box-shadow:0 0 60px rgba(253,230,138,0.4)"><div style="font-size:70px;animation:bounce 1s infinite">🎉</div><div style="font-family:Cinzel,serif;font-size:28px;font-weight:900;color:#fde68a;margin:10px 0">LEVEL UP!</div><div style="font-size:18px;color:#fff">Nível <span style="color:#fde68a;font-weight:900">${oldLevel}</span> → <span style="color:#fde68a;font-weight:900;font-size:24px">${newLevel}</span></div><div style="margin-top:12px;color:#94a3b8;font-size:13px">Você desbloqueou: ${newLevel>=3?'Borda Prata':''} ${newLevel>=5?'• Manto Azul':''} ${newLevel>=7?'• Título Arquimago':''}</div><button id="btn-fechar-levelup" style="margin-top:20px;width:100%;background:linear-gradient(135deg,#fde68a,#d4af37);color:#000;border:none;padding:14px;border-radius:12px;font-weight:900;font-size:16px;cursor:pointer">Continuar Épico ⚔️</button></div>`;
        document.body.appendChild(modal);
        modal.querySelector('#btn-fechar-levelup').onclick=()=>modal.remove();
        setTimeout(()=>{ if(document.body.contains(modal)) modal.remove(); },4000);
    },
    abrirInventario(){
        const inv = this.state.inventario||[];
        const medalhas = this.state.medalhas||[];
        const allAch = this.state.achievements||[];
        const bordas = inv.filter(i=>i.tipo==='cosmetico' || i.id?.includes('borda'));
        const titulos = inv.filter(i=>i.tipo==='titulo' || i.id?.includes('titulo')).map(i=>i.nome||i.id);
        const skins = inv.filter(i=>i.tipo==='skin');
        const modal=document.createElement('div');
        modal.id='ig-inv-modal';
        modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:1000006;padding:20px';
        modal.innerHTML=`
            <div style="background:linear-gradient(180deg,#fff,#F8FAFC);border:3px solid #d4af37;border-radius:20px;max-width:500px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.5)">
                <div style="background:linear-gradient(135deg,#0F172A,#1E293B);padding:16px 20px;border-radius:17px 17px 0 0;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:1">
                    <div style="color:#fde68a;font-family:Cinzel;font-weight:900;font-size:18px">🎒 Inventário Épico</div>
                    <button data-action="fechar-inventario" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;width:32px;height:32px;border-radius:8px;cursor:pointer">✕</button>
                </div>
                <div style="padding:18px">
                    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap"><span style="background:#0F172A;color:#fde68a;padding:6px 12px;border-radius:20px;font-size:12px;font-weight:800">Nível ${this.calcularLevel(this.state.xp).level}</span><span style="background:#EEF2FF;color:#4338ca;padding:6px 12px;border-radius:20px;font-size:12px;font-weight:800">${this.state.tituloEquipado}</span><span style="background:#FEF3C7;color:#92400e;padding:6px 12px;border-radius:20px;font-size:12px;font-weight:800">${inv.length} itens</span><span style="background:#D1FAE5;color:#065f46;padding:6px 12px;border-radius:20px;font-size:12px;font-weight:800">${medalhas.length} medalhas</span></div>
                    
                    <h4 style="font-family:Cinzel;margin:12px 0 8px 0;font-size:14px">👑 Títulos (${titulos.length})</h4>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px">${titulos.length? titulos.map(t=>`<button data-action="equipar-titulo" data-titulo="${Workspace.escapeHTML(t)}" style="background:${this.state.tituloEquipado===t?'#0F172A':'#fff'};color:${this.state.tituloEquipado===t?'#fde68a':'#0f172a'};border:2px solid ${this.state.tituloEquipado===t?'#d4af37':'#e2e8f0'};padding:8px 14px;border-radius:20px;font-size:12px;font-weight:800;cursor:pointer">${Workspace.escapeHTML(t)} ${this.state.tituloEquipado===t?'✅':''}</button>`).join('') : '<span style="color:#94a3b8;font-size:12px">Nenhum título ainda. Abra baús épicos!</span>'}</div>

                    <h4 style="font-family:Cinzel;margin:12px 0 8px 0;font-size:14px">🖼 Bordas (${bordas.length})</h4>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px">${bordas.length? bordas.map(b=>`<button data-action="equipar-borda" data-borda="${Workspace.escapeHTML(b.id||b.nome)}" style="background:${this.state.bordaEquipada===(b.id||b.nome)?'#0F172A':'#fff'};color:${this.state.bordaEquipada===(b.id||b.nome)?'#fde68a':'#0f172a'};border:2px solid ${this.state.bordaEquipada===(b.id||b.nome)?'#d4af37':'#e2e8f0'};padding:8px 14px;border-radius:12px;font-size:12px;font-weight:700;cursor:pointer">${Workspace.escapeHTML(b.nome||b.id)} ${this.state.bordaEquipada===(b.id||b.nome)?'✅':''}</button>`).join('') : '<span style="color:#94a3b8;font-size:12px">Nenhuma borda ainda. Faça 150+ XP numa sessão!</span>'}</div>

                    <h4 style="font-family:Cinzel;margin:12px 0 8px 0;font-size:14px">🎨 Skins (${skins.length})</h4>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px">${skins.length? skins.map(s=>`<div style="background:#fff;border:1.5px solid #e2e8f0;padding:8px 12px;border-radius:10px;font-size:12px">🎭 ${Workspace.escapeHTML(s.nome||s.id)}</div>`).join('') : '<span style="color:#94a3b8;font-size:12px">Nenhuma skin ainda.</span>'}</div>

                    <h4 style="font-family:Cinzel;margin:12px 0 8px 0;font-size:14px">🏆 Medalhas (${medalhas.length})</h4>
                    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px">${allAch.map(a=>{ const tem=medalhas.includes(a.id); return `<div style="background:${tem?'#D1FAE5':'#f8fafc'};border:1.5px solid ${tem?'#10B981':'#e2e8f0'};border-radius:10px;padding:10px;text-align:center;opacity:${tem?1:0.5}"><div style="font-size:28px">${a.icone||'🏆'}</div><div style="font-size:11px;font-weight:800;color:#0f172a;margin-top:4px">${Workspace.escapeHTML(a.nome)}</div><div style="font-size:10px;color:#64748B">${Workspace.escapeHTML(a.desc)}</div><div style="font-size:9px;margin-top:4px;color:${tem?'#065f46':'#94a3b8'}">${tem?'✅ Desbloqueada':'🔒 Bloqueada'}</div></div>`}).join('')}</div>

                    <div style="margin-top:16px;background:#FFFBEB;border:1px solid #fde68a;border-radius:10px;padding:10px;font-size:11px;color:#92400E"><b>💡 Dica:</b> Equipe títulos e bordas para aparecerem no ranking! Faça sessões com +300 XP para baús lendários.</div>
                </div>
            </div>`;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e)=>{
            const b=e.target.closest('[data-action]');
            if(!b) return;
            if(b.dataset.action==='fechar-inventario'){ modal.remove(); return; }
            if(b.dataset.action==='equipar-titulo'){ this.equiparTitulo(b.dataset.titulo); modal.remove(); this.abrirInventario(); this.renderizarVisualizacao(); return; }
            if(b.dataset.action==='equipar-borda'){ this.equiparBorda(b.dataset.borda); modal.remove(); this.abrirInventario(); this.renderizarVisualizacao(); return; }
        });
        modal.addEventListener('click', (e)=>{ if(e.target===modal) modal.remove(); });
    },
    equiparTitulo(titulo){
        this.state.tituloEquipado=titulo;
        this.state.titulo=titulo;
        this.saveDados();
        Workspace.mostrarAviso(`Título equipado: ${titulo}`,'success');
    },
    equiparBorda(bordaId){
        this.state.bordaEquipada=bordaId;
        this.saveDados();
        Workspace.mostrarAviso(`Borda equipada: ${bordaId}`,'success');
    },

    // ================= PORTAL MÁGICO - JOGO ESPECIAL =================
    efeitoPortalTempo(){
        return new Promise(resolve=>{
            const overlay=document.createElement('div');
            overlay.style.cssText='position:fixed;inset:0;background:radial-gradient(circle at center,#1e1b4b 0%,#0f0f23 40%,#000 100%);z-index:1000007;display:flex;align-items:center;justify-content:center;overflow:hidden';
            overlay.innerHTML=`
                <div style="position:absolute;inset:0">
                    <div style="position:absolute;top:50%;left:50%;width:2px;height:2px;background:#fff;box-shadow:0 0 10px #fff, ${Array.from({length:40},()=>`${(Math.random()-0.5)*200}vw ${(Math.random()-0.5)*200}vh 0 1px #fff`).join(',')};animation:warpStars 0.8s linear"></div>
                    <div style="position:absolute;top:50%;left:50%;width:200vmax;height:200vmax;background:conic-gradient(from 0deg,#fde68a,#8b5cf6,#4f46e5,#fde68a);border-radius:50%;transform:translate(-50%,-50%) scale(0);animation:portalExpand 0.8s ease-out forwards;opacity:0.8"></div>
                </div>
                <div style="position:relative;z-index:2;text-align:center;color:#fde68a;font-family:Cinzel;font-weight:900">
                    <div style="font-size:60px;animation:spin 0.6s linear infinite">🌀</div>
                    <div style="font-size:18px;margin-top:12px;letter-spacing:3px;animation:pulse 0.4s ease infinite">VIAJANDO NO TEMPO...</div>
                </div>
                <style>@keyframes portalExpand{0%{transform:translate(-50%,-50%) scale(0) rotate(0deg)}100%{transform:translate(-50%,-50%) scale(1) rotate(180deg)}}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:0.6}50%{opacity:1}}@keyframes warpStars{0%{transform:translate(-50%,-50%) scale(0)}100%{transform:translate(-50%,-50%) scale(2)}}</style>
            `;
            document.body.appendChild(overlay);
            try{
                const ctx=new (window.AudioContext||window.webkitAudioContext)();
                const osc=ctx.createOscillator(); const gain=ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination);
                osc.frequency.setValueAtTime(200, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime+0.7);
                gain.gain.setValueAtTime(0.4, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime+0.8);
                osc.start(); osc.stop(ctx.currentTime+0.8);
            }catch{}
            setTimeout(()=>{ overlay.style.transition='opacity 0.3s'; overlay.style.opacity='0'; setTimeout(()=>{ overlay.remove(); resolve(); },300); },800);
        });
    },
    efeitoExplosaoPortal(){
        const expl=document.createElement('div');
        expl.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:20px;height:20px;background:radial-gradient(circle,#fde68a,#f59e0b);border-radius:50%;z-index:1000007;pointer-events:none;animation:explodePortal 0.6s ease-out forwards';
        const style=document.createElement('style');
        style.textContent='@keyframes explodePortal{0%{transform:translate(-50%,-50%) scale(1);opacity:1}50%{transform:translate(-50%,-50%) scale(15);opacity:0.8;box-shadow:0 0 40px #fde68a, 0 0 80px #8b5cf6}100%{transform:translate(-50%,-50%) scale(30);opacity:0}}';
        document.head.appendChild(style);
        document.body.appendChild(expl);
        try{
            const ctx=new (window.AudioContext||window.webkitAudioContext)();
            const osc=ctx.createOscillator(); const gain=ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime+0.4);
            gain.gain.setValueAtTime(0.5, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime+0.5);
            osc.start(); osc.stop(ctx.currentTime+0.5);
        }catch{}
        setTimeout(()=>expl.remove(),600);
    },
    async renderGamePortalMagico(){
        this.portalAtivo=true;
        if(!this.portalRodada) { this.portalRodada=1; this.portalTarget=5; this.portalStreak=0; }
        if(this.portalStreak===0 && this.portalRodada===1){
            await this.efeitoPortalTempo();
        }
        this.renderDesafioPortal();
    },
    async renderDesafioPortal(){
        const possiveis=this.state.portalJogosPossiveis||['wordSpark','quiz','wordPicker','picturePop'];
        let proximo=possiveis[Math.floor(Math.random()*possiveis.length)];
        if(proximo===this.state.portalJogoInterno && possiveis.length>1){
            proximo=possiveis.filter(g=>g!==this.state.portalJogoInterno)[Math.floor(Math.random()*(possiveis.length-1))];
        }
        this.state.portalJogoInterno=proximo;
        if(this.portalStreak>0){
            await this.efeitoPortalTempo();
        }
        this.efeitoExplosaoPortal();
        setTimeout(()=>{
            const body=document.getElementById('ig-modalBody');
            if(!body) return;
            const headerPortal=`
                <div style="background:linear-gradient(135deg,#0f0f23 0%,#1e1b4b 50%,#312e81 100%);border:2px solid #fde68a;border-radius:14px;padding:12px 16px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 0 20px rgba(253,230,138,0.2)">
                    <div style="display:flex;align-items:center;gap:10px"><div style="font-size:24px;animation:spin 2s linear infinite">🌀</div><div><div style="color:#fde68a;font-family:Cinzel;font-weight:900;font-size:13px;letter-spacing:1px">PORTAL MÁGICO • RODADA ${this.portalRodada}</div><div style="color:#cbd5e1;font-size:11px">Meta: ${this.portalTarget} vitórias seguidas • Jogo: ${proximo}</div></div></div>
                    <div style="text-align:right"><div style="background:rgba(253,230,138,0.15);border:1px solid #fde68a;color:#fde68a;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:800">🔥 ${this.portalStreak}/${this.portalTarget}</div><div style="font-size:10px;color:#94a3b8;margin-top:4px">${this.portalStreak>=this.portalTarget*0.8?'Quase lá!':''}</div></div>
                </div>`;
            this._portalHeader=headerPortal;
            this.jogoAtual=proximo; 
            this.renderDesafioAtualInternoPortal();
        },300);
    },
    renderDesafioAtualInternoPortal(){
        this.currentAudioURL=null; this.desafioAtualObj=null; const isPortal=true;
        const id=this.state.portalJogoInterno;
        if(id==='wordSpark') this.renderGameWordSpark(true);
        else if(id==='readAloud') this.renderGameReadAloud(true);
        else if(id==='listenType') this.renderGameListenType(true);
        else if(id==='quiz') this.renderGameQuiz(true);
        else if(id==='wordPicker') this.renderGameWordPicker(true);
        else if(id==='sentenceShuffle') this.renderGameSentenceShuffle(true);
        else if(id==='answerQuest') this.renderGameAnswerQuest(true);
        else if(id==='questionMaker') this.renderGameQuestionMaker(true);
        else if(id==='contextRole') this.renderGameContextRole(true);
        else if(id==='debateAI') this.renderGameDebateAI(true);
        else if(id==='minimalPairs') this.renderGameMinimalPairs(true);
        else if(id==='picturePop') this.renderGamePicturePop(true);
        else this.renderGameWordSpark(true);
    },
    injetarHeaderPortalSeNecessario(){
        try{
            if(this.portalAtivo && this._portalHeader){
                const body=document.getElementById('ig-modalBody');
                if(body && !body.innerHTML.includes('PORTAL MÁGICO')){
                    body.innerHTML = this._portalHeader + body.innerHTML;
                }
            }
        }catch{}
    },
    async sucessoPortal(bonusBase){
        const mult=this.state.season?.xpMultiplier||1;
        const bonus = Math.floor((bonusBase*1.5)*mult);
        this.portalStreak++; this.state.portalStreak=this.portalStreak;
        this.state.xp+=bonus; this.xpGanhosNaSessao+=bonus;
        await this.saveDados();

        this.tocarSom('xp');
        const toast=document.createElement('div');
        toast.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#8B5CF6,#6D28D9);color:#fff;padding:12px 22px;border-radius:30px;font-weight:800;z-index:1000001;border:2px solid #fde68a';
        toast.innerHTML=`🌀 +${bonus} XP • Streak ${this.portalStreak}/${this.portalTarget} 🔥`;
        document.body.appendChild(toast);
        setTimeout(()=>toast.remove(),1200);

        if(this.portalStreak >= this.portalTarget){
            await this.magiaDoMagoBonus();
            this.portalRodada++;
            this.portalTarget = 5 * this.portalRodada; 
            this.portalStreak=0;
        }
        setTimeout(()=>{ if(this.portalAtivo && this.tempoRestante>0) this.renderDesafioPortal(); },900);
    },
    async falhaPortal(){
        const perda=Math.floor(20 * (this.state.season?.xpMultiplier||1));
        this.state.xp=Math.max(0, this.state.xp - perda);
        this.xpGanhosNaSessao=Math.max(0, this.xpGanhosNaSessao - perda);
        this.portalStreak=0; this.state.portalStreak=0;
        await this.saveDados();

        this.tocarSom('quest'); 
        const toast=document.createElement('div');
        toast.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#EF4444,#B91C1C);color:#fff;padding:12px 22px;border-radius:30px;font-weight:800;z-index:1000001';
        toast.innerHTML=`💥 -${perda} XP • Streak zerado!`;
        document.body.appendChild(toast);
        setTimeout(()=>toast.remove(),1500);
        setTimeout(()=>{ if(this.portalAtivo && this.tempoRestante>0) this.renderDesafioPortal(); },1100);
    },
    async magiaDoMagoBonus(){
        const bonusBase = 300 + (this.portalRodada * 100);
        const mult=this.state.season?.xpMultiplier||1;
        const bonus=Math.floor(bonusBase*mult);
        this.state.xp+=bonus; this.xpGanhosNaSessao+=bonus;
        await this.saveDados();

        this.tocarSom('level'); this.confete();
        const modal=document.createElement('div');
        modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;z-index:1000008;animation:popIn 0.5s ease';
        modal.innerHTML=`
            <div style="text-align:center;max-width:400px;padding:20px">
                <img src="/assets/mago_bau_ingles.png" style="width:180px;height:180px;object-fit:contain;filter:drop-shadow(0 0 30px #fde68a);animation:floatMago 1.5s ease infinite" onerror="this.style.display='none'"/>
                <div style="font-size:60px;margin:-20px 0 10px 0">✨🪄✨</div>
                <div style="font-family:Cinzel;font-size:26px;font-weight:900;color:#fde68a;text-shadow:0 0 20px rgba(253,230,138,0.8)">MAGIA DO MAGO!</div>
                <div style="color:#fff;font-size:16px;margin-top:10px">${this.portalRodada===1?'5 vitórias seguidas! Incrível!': this.portalRodada===2?'10 vitórias! Lendário!': (this.portalTarget-5)+' vitórias! Você é imbatível!'}</div>
                <div style="background:linear-gradient(135deg,#fde68a,#d4af37);color:#000;padding:14px 24px;border-radius:30px;font-weight:900;font-size:22px;margin-top:16px;display:inline-block;box-shadow:0 0 30px rgba(253,230,138,0.5)">+${bonus} XP BÔNUS!</div>
                <div style="color:#94a3b8;font-size:12px;margin-top:12px">Próxima meta: ${5*(this.portalRodada+1)} vitórias seguidas</div>
            </div>
            <style>@keyframes floatMago{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}</style>`;
        document.body.appendChild(modal);
        setTimeout(()=>{ modal.style.transition='opacity 0.4s'; modal.style.opacity='0'; setTimeout(()=>modal.remove(),400); },2800);
        await new Promise(r=>setTimeout(r,3000));
    },

    falar: (text, lang='en-US', pitch=1, rate=0.95, isMago=false)=> VoiceService.falar(text,{lang,pitch,rate,isMago}),
    calcularLevel(xpTotal){
        const curve = this.state.levelCurve || [0,100,250,450,700,1000,1400,1900,2500,3200,4000,5000,6200];
        let level=1, proximo=curve[1]||100;
        for(let i=0;i<curve.length;i++){
            if(xpTotal >= curve[i]){ level=i+1; proximo=curve[i+1]||curve[i]; }
            else { proximo=curve[i]; break; }
        }
        const atualBase = curve[level-2] || 0;
        const proxBase = curve[level-1] || curve[curve.length-1];
        const progresso = proxBase>atualBase ? Math.min(100, Math.max(0, ((xpTotal - atualBase)/(proxBase - atualBase))*100)) : 100;
        return { level, proximo, progresso, atualBase, proxBase, xpTotal };
    },
    verificarQuests(tipoJogo){
        if(!this.state.quests?.length) return;
        this.state.quests.forEach(q=>{
            const deveContar = (q.texto||'').toLowerCase().includes(tipoJogo) || (q.id||'').includes(tipoJogo) || q.tipo==='diaria';
            if(!deveContar) return;
            const prog = this.state.questsProgress[q.id] || {atual:0, coletado:false};
            if(prog.coletado) return;
            prog.atual = (prog.atual||0)+1;
            this.state.questsProgress[q.id]=prog;
            if(prog.atual >= q.alvo){
                this.completarQuest(q);
            }
            this.saveDados();
        });
    },
    async completarQuest(quest){
        const bonus = Math.floor((quest.recompensaXP||100)*(this.state.season?.xpMultiplier||1));
        this.state.xp+=bonus;
        this.state.questsProgress[quest.id].coletado=true;
        await this.saveDados();
        try{
            await Workspace.api('/workspace/ingles/quests/completar','POST',{userId:Workspace.usuario.id, questId:quest.id, escolaId:Workspace.usuario.escolaId||'DEFAULT'});
        }catch{}
        const toast=document.createElement('div');
        toast.style.cssText='position:fixed;top:80px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#8B5CF6,#6D28D9);color:#fff;padding:14px 24px;border-radius:14px;font-weight:800;z-index:1000002;box-shadow:0 8px 24px rgba(0,0,0,0.3);border:2px solid #fff;text-align:center';
        toast.innerHTML=`🎯 Missão Completa: ${quest.texto||quest.id}<br/>+${bonus} XP Bônus!`;
        document.body.appendChild(toast);
        setTimeout(()=>toast.remove(),3000);
        this.renderQuestsPanel();
    },
    async tentarDesbloquearAchievement(condicaoTipo, qtdAtual){
        const ach = this.state.achievements.find(a=>a.condicao?.tipo===condicaoTipo && qtdAtual >= (a.condicao?.qtd||999) && !this.state.medalhas.includes(a.id));
        if(!ach) return;
        this.state.medalhas.push(ach.id);
        this.state.xp+= (ach.xpBonus||100);
        await this.saveDados();
        const toast=document.createElement('div');
        toast.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,#0F172A,#1E293B);color:#fde68a;padding:24px;border-radius:20px;font-weight:800;z-index:1000003;box-shadow:0 20px 60px rgba(0,0,0,0.5);border:3px solid #d4af37;text-align:center;animation:popIn 0.5s ease';
        toast.innerHTML=`<div style="font-size:50px">${ach.icone||'🏆'}</div><div style="font-family:Cinzel;font-size:18px;margin:10px 0">${ach.nome}</div><div style="font-size:13px;color:#fff">${ach.desc}</div><div style="margin-top:10px;background:#fde68a;color:#000;padding:6px 12px;border-radius:20px;display:inline-block">+${ach.xpBonus} XP</div>`;
        document.body.appendChild(toast);
        setTimeout(()=>toast.remove(),4000);
    },

    injetarCSS(){
        if(document.getElementById('ws-ingles-css')) return;
        if(!document.querySelector('link[data-ig-font]')){
            const l=document.createElement('link'); l.rel='stylesheet'; l.href='https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=VT323&display=swap'; l.setAttribute('data-ig-font','1'); document.head.appendChild(l);
        }
        const style=document.createElement('style'); style.id='ws-ingles-css';
        style.textContent=`
            #ws-ingles-container{background:linear-gradient(180deg,#F8FAFC 0%,#EEF2FF 100%);border-radius:20px;overflow:visible;min-height:80vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(15,23,42,0.08);border:1px solid #E2E8F0}
            .ig-header{background:linear-gradient(135deg,#0f0f23 0%,#1a1a2e 40%,#1e1b4b 100%);padding:16px 28px;display:flex;justify-content:space-between;align-items:center;border-bottom:4px solid #d4af37;position:relative;top:0;z-index:100;box-shadow:0 8px 32px rgba(0,0,0,0.4)}
            .ig-title{display:flex;align-items:center;gap:18px}
            .ig-bau-topo{width:72px;filter:drop-shadow(0 0 14px rgba(241,196,15,0.8)) drop-shadow(0 4px 12px rgba(0,0,0,0.5));transition:0.3s}
            .ig-title-text h2{font-family:'Cinzel',serif;font-size:30px;font-weight:900;margin:0;background:linear-gradient(90deg,#fde68a 0%,#f1c40f 25%,#fde68a 50%,#d4af37 75%,#fde68a 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(2px 2px 0px #000) drop-shadow(0 0 20px rgba(241,196,15,0.35));background-size:200% auto;animation:shineGold 4s linear infinite}
            @keyframes shineGold{0%{background-position:0% 50%}100%{background-position:200% 50%}}
            .ig-title-text p{margin:3px 0 0 0;font-size:11px;color:#f8fafc;font-family:'VT323',monospace;text-transform:uppercase;letter-spacing:3px;opacity:0.95;text-shadow:0 1px 0 #000}
            .ig-rpg-hud{display:flex;gap:10px;background:rgba(0,0,0,0.6);padding:8px 14px;border-radius:14px;border:1.5px solid rgba(212,175,55,0.5)}
            .ig-hud-stat{display:flex;align-items:center;gap:7px;background:rgba(255,255,255,0.08);padding:6px 12px;border-radius:10px;border:1px solid rgba(212,175,55,0.25);color:#fff;font-family:'VT323',monospace;font-size:18px}
            .ig-hud-stat span{color:#fde68a;font-size:22px}
            .ig-global-timer{font-family:'VT323',monospace;font-size:22px;color:#ff4757;display:none;align-items:center;letter-spacing:2px;background:rgba(239,68,68,0.15);padding:5px 12px;border-radius:8px;border:1.5px dashed #ef4444}
            .ig-games-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;padding:0 0 30px 0}
            .ig-game-card{background:linear-gradient(180deg,#ffffff 0%,#fffcf0 100%);border:2px solid #eab308;border-radius:16px;padding:22px;cursor:pointer;transition:0.3s;box-shadow:0 4px 0 #d4af37, 0 8px 24px rgba(0,0,0,0.06)}
            .ig-game-card:hover{transform:translateY(-6px) scale(1.02);box-shadow:0 8px 0 #d4af37, 0 16px 32px rgba(212,175,55,0.25)}
            .ig-game-card h3{font-family:'Cinzel',serif;color:#0f172a;font-size:17px;font-weight:800;margin:12px 0 8px 0}
            .ig-game-card p{color:#334155;font-size:13.5px;font-weight:500;margin:0 0 12px 0}
            .ig-top{display:flex;justify-content:space-between;align-items:center}
            .ig-icon{width:52px;height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:28px}
            .ig-badge{font-size:11px;font-weight:800;padding:5px 10px;border-radius:20px;border:1px solid}
            .ig-badge-level{background:#0f172a;color:#fde68a;border-color:#d4af37}
            .chest-shake{animation:chestShake 0.4s infinite} @keyframes chestShake{0%,100%{transform:translate(1px,-2px) rotate(-5deg)}50%{transform:translate(-1px,2px) rotate(5deg)}}
            .chest-explode{animation:chestExplode 1.2s forwards;z-index:9999999!important} @keyframes chestExplode{0%{transform:scale(1)}20%{transform:scale(3.5) translateY(20px);filter:brightness(2.5)}100%{transform:scale(1)}}
            @keyframes shockwave{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(-50%,-50%) scale(400);opacity:0}}
            .ig-fireball{position:fixed;border-radius:50%;pointer-events:none;z-index:9999999;animation:shootParticle 1.5s forwards}
            .ig-sparkle{position:fixed;clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);pointer-events:none;z-index:9999999;animation:shootParticle 2s forwards}
            @keyframes shootParticle{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0}}
            .ig-guardian-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:62vh;background:radial-gradient(ellipse at 30% 20%, #2a1a4a 0%, #1a0b2e 25%, #0f0f23 60%, #000 100%);border-radius:0 0 20px 20px;border:4px solid #1e1b4b;border-top:none;padding:32px 24px}
            .ig-guardian-avatar{width:92px;animation:flutuarMago 3.5s ease-in-out infinite;filter:drop-shadow(0 0 28px rgba(142,68,173,0.9))}
            @keyframes flutuarMago{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
            .ig-balao-fala-static{background:linear-gradient(180deg,#0f172a 0%,#020617 100%);padding:20px 22px;border-radius:14px;border:2.5px solid #f1c40f;color:#fff;font-family:'VT323',monospace;font-size:22px;flex:1;box-shadow:0 8px 24px rgba(0,0,0,0.6);position:relative}
            .ig-hub-banner{display:flex;align-items:center;gap:18px;padding:18px 22px;background:linear-gradient(135deg, #0f0f23 0%, #1a1a2e 30%, #1e1b4b 70%, #0f172a 100%);border:2px solid #d4af37;border-radius:18px;margin:0 0 26px 0;box-shadow:0 12px 32px rgba(0,0,0,0.4)}
            .ig-hub-mago-img{width:68px;animation:flutuarMago 3.5s ease-in-out infinite;filter:drop-shadow(0 0 18px rgba(142,68,173,0.9));flex-shrink:0}
            .ig-balao-fala-hub{background:linear-gradient(180deg, #0f172a 0%, #020617 100%);color:#f8fafc;padding:14px 18px;border-radius:14px;border:2px solid #f1c40f;font-family:'VT323',monospace;font-size:20px;flex:1;position:relative}
            .ig-big-phrase{background:#ffffff;border:2.5px solid #cbd5e1;color:#0f172a;font-weight:800;font-size:22px;text-align:center;padding:22px;border-radius:16px;margin:16px 0;box-shadow:0 6px 20px rgba(15,23,42,0.06)}
            .ig-input,.ig-textarea{background:#ffffff;color:#0f172a;border:2.5px solid #cbd5e1;border-radius:12px;font-weight:600;font-size:15px;width:100%;padding:12px 15px;box-sizing:border-box}
            .ig-input:focus,.ig-textarea:focus{border-color:#4f46e5;outline:none;box-shadow:0 0 0 4px rgba(79,70,229,0.12)}
            .ig-input::placeholder,.ig-textarea::placeholder{color:#64748b;opacity:1}
            .ig-card{background:#ffffff;border:1.5px solid #e2e8f0;border-radius:20px;padding:24px;margin-bottom:20px;box-shadow:0 4px 20px rgba(15,23,42,0.04)}
            .ig-card-prof{background:linear-gradient(180deg,#ffffff 0%,#f8fafc 100%);border:2px solid #e2e8f0;border-radius:20px;padding:24px;margin-bottom:20px;box-shadow:0 8px 24px rgba(15,23,42,0.06);transition:0.2s}
            .ig-card-prof:hover{border-color:#cbd5e1;box-shadow:0 12px 32px rgba(15,23,42,0.08)}
            .ig-card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;padding-bottom:14px;border-bottom:2px solid #f1f5f9}
            .ig-card-header h3{font-family:Cinzel,serif;font-size:18px;font-weight:800;color:#0f172a;margin:0}
            .ig-card-header p{font-size:12px;color:#64748b;margin:4px 0 0 0}
            .ig-list-item{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border:1px solid #f1f5f9;border-radius:12px;margin-bottom:8px;background:#fff;color:#0f172a;font-weight:500;transition:0.2s}
            .ig-list-item:hover{border-color:#e2e8f0;background:#f8fafc}
            
            /* 🚀 ISOLAMENTO TOTAL DO CSS DA ÁREA DO PROFESSOR */
            #ig-professorView { display: flex; gap: 20px; min-height: 60vh; align-items: flex-start; }
            .ig-menu-prof { width: 220px !important; display: flex !important; flex-direction: column !important; gap: 8px !important; flex-shrink: 0 !important; background: transparent !important; border: none !important; box-shadow: none !important; position: relative !important; z-index: 1 !important; height: auto !important; padding: 0 !important; margin: 0 !important; }
            .ig-menu-btn { background: #fff; border: 1px solid #E2E8F0; padding: 12px 16px; border-radius: 10px; text-align: left; font-weight: 600; color: #475569; cursor: pointer; transition: 0.2s; white-space: nowrap; display: flex; justify-content: space-between; align-items: center; width: 100%; font-family: inherit; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
            .ig-menu-btn.active { background: #EEF2FF !important; border-color: #4F46E5 !important; color: #4F46E5 !important; font-weight: 800 !important; box-shadow: 0 4px 10px rgba(79,70,229,0.1) !important; }
            #ig-tab-content { flex: 1; background: #fff; border-radius: 16px; border: 1px solid #E2E8F0; padding: 24px; min-width: 0; overflow-x: hidden; } 
            
            .ig-rank-item{display:flex;align-items:center;gap:12px;padding:14px;background:#fff;border:2px solid #f1f5f9;border-radius:14px;margin-bottom:8px;transition:0.2s}
            .ig-rank-item.ouro{border-color:#fde68a;background:linear-gradient(180deg,#FFFBEB 0%,#fff 100%);box-shadow:0 4px 12px rgba(253,230,138,0.2)}
            .ig-rank-item.prata{border-color:#cbd5e1;background:linear-gradient(180deg,#f8fafc 0%,#fff 100%)}
            .ig-rank-item.bronze{border-color:#d97706;background:linear-gradient(180deg,#FFFBEB 0%,#fff 100%)}

            /* FIX BOTÕES - APENAS DENTRO DO BAÚ DO INGLÊS */
            #ws-ingles-container .ws-btn, #ig-gameModal .ws-btn{font-weight:800!important}
            #ws-ingles-container .ws-btn[style*="background:#fff"], #ig-gameModal .ws-btn[style*="background:#fff"]{color:#0f172a!important;border:2px solid #cbd5e1!important}
            #ws-ingles-container .ws-btn[style*="background:#ffffff"], #ig-gameModal .ws-btn[style*="background:#ffffff"]{color:#0f172a!important}
            #ws-ingles-container .ws-btn[style*="background:#0f172a"], #ig-gameModal .ws-btn[style*="background:#0f172a"]{color:#fde68a!important}
            #ws-ingles-container .ws-btn[style*="background:#4F46E5"], #ig-gameModal .ws-btn[style*="background:#4F46E5"]{color:#ffffff!important}
            #ws-ingles-container .ws-btn[style*="background:#10B981"], #ig-gameModal .ws-btn[style*="background:#10B981"]{color:#ffffff!important}
            #ws-ingles-container .ig-game-card .ws-btn, #ig-gameModal .ig-game-card .ws-btn{background:#fff!important;color:#0f172a!important;border:2px solid #e2e8f0!important}

            @keyframes popIn{0%{transform:translate(-50%,-50%) scale(0.5);opacity:0}100%{transform:translate(-50%,-50%) scale(1);opacity:1}}
            
            /* 🎯 FIX CONTEUDO ABAIXO BARRA WORKSPACE */
            #ws-ingles-container{ padding-top:0 !important; margin-top:0 !important; position:relative; z-index:1; }
            #ws-ingles-container .ig-header{ position:relative !important; z-index:2; }
            #ig-alunoView{ position:relative !important; z-index:1; margin-top:0 !important; }
            
            /* 📱 CELULAR - FIX PILULAS E NAVEGACAO */
            @media(max-width:768px){
                #ig-topBarRecursos{ position:sticky !important; top:56px !important; z-index:20 !important; padding:8px 10px !important; gap:6px !important; overflow-x:auto !important; -webkit-overflow-scrolling:touch; background:rgba(10,14,42,0.98) !important; margin-top:0 !important; }
                #ig-topBarRecursos::-webkit-scrollbar{ display:none; }
                #ig-topBarRecursos > div{ flex-shrink:0 !important; white-space:nowrap !important; }
                #ig-mainIlha{ min-height:auto !important; height:auto !important; position:relative !important; display:flex !important; flex-direction:column !important; gap:0 !important; padding-bottom:100px !important; overflow:visible !important; }
                #ig-cardConta{ position:relative !important; top:auto !important; right:auto !important; left:auto !important; margin:12px 12px 8px 12px !important; order:1; }
                #ig-tituloIlha{ position:relative !important; top:auto !important; left:auto !important; right:auto !important; text-align:left !important; margin:8px 14px !important; order:2; }
                #ig-tituloIlha div div:nth-child(2){ font-size:38px !important; background:linear-gradient(180deg,#FFFBEB 0%,#fde68a 30%,#fbbf24 60%,#d97706 100%) !important; -webkit-background-clip:text !important; -webkit-text-fill-color:transparent !important; }
                #ig-botoesTopRight{ position:relative !important; top:auto !important; right:auto !important; left:auto !important; justify-content:flex-start !important; margin:0 14px 14px 14px !important; order:3; display:flex !important; flex-direction:row !important; gap:10px !important; }
                #ig-cardsContainer{ position:relative !important; bottom:auto !important; left:auto !important; right:auto !important; top:auto !important; flex-direction:column !important; overflow:visible !important; padding:0 12px 20px 12px !important; order:4; display:flex !important; gap:12px !important; }
                #ig-cardsContainer .ilha-card{ min-width:100% !important; width:100% !important; flex-direction:row !important; padding:12px !important; position:relative !important; left:auto !important; top:auto !important; right:auto !important; bottom:auto !important; transform:none !important; }
                #ig-cardsContainer .ilha-card > div:first-child{ width:48px !important; height:48px !important; font-size:28px !important; }
                #ig-missoesDiarias{ display:none !important; }
                #ig-alunoView div[data-action="continuar-jornada"]{ position:fixed !important; bottom:20px !important; left:50% !important; right:auto !important; transform:translateX(-50%) !important; width:90% !important; max-width:320px; z-index:25 !important; }
                #ig-mainIlha > div{ position:relative !important; z-index:2; }
                
                #ig-professorView{ flex-direction:column; gap:12px; }
                .ig-menu-prof{ width:100%!important; flex-direction:row!important; overflow-x:auto!important; gap:8px!important; padding:12px!important; border-bottom:3px solid #d4af37!important; scrollbar-width:none!important; -webkit-overflow-scrolling:touch!important; }
                .ig-menu-prof::-webkit-scrollbar{ display:none!important; }
                .ig-menu-btn{ flex-shrink:0!important; padding:11px 16px!important; font-size:12px!important; border-radius:20px!important; white-space:nowrap!important; }
                #ig-tab-content{ padding:14px; background:#F1F5F9; }
                .ig-card-prof{ padding:18px; border-radius:16px; }
                .ig-prof-grid{ grid-template-columns:1fr; }
                .ig-guardian-container{ padding:20px 14px; min-height:60vh; }
                .ig-balao-fala-static{ font-size:17px; padding:14px; }
                .ig-opcoes-tempo{ flex-direction:column; }
                #ig-gameModal > div{ width:95%!important; max-height:92vh!important; margin:10px; }
                #ig-modalBody{ max-height:70vh; overflow-y:auto; }
                .ig-rank-item{ padding:12px; gap:10px; }
            }

            /* 💻 DESKTOP */
            @media(min-width:769px){
                #ig-topBarRecursos{ top:0 !important; position:sticky !important; }
                #ig-alunoView{ max-width:100% !important; margin:0 auto !important; background:linear-gradient(180deg,#1a1a4a 0%,#0f0f3a 20%,#1e3a8a 50%,#0f172a 100%) !important; min-height:100vh; box-shadow:0 0 40px rgba(0,0,0,0.5); }
                #ig-mainIlha{ min-height:calc(100vh - 50px); background:linear-gradient(rgba(10,14,42,0.4), rgba(10,14,42,0.6)), url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200') center/cover; }
                #ig-cardsContainer{ bottom:80px !important; left:16px !important; right:300px !important; }
                #ig-missoesDiarias{ display:block !important; }
                #ig-tituloIlha{ left:24px !important; top:20px !important; }
            }
            @media(min-width:1440px){
                #ig-alunoView > div[style*="position:relative;width:100%;height:100vh"]{ max-width:1400px; margin:0 auto; }
                .ilha-predio{ transform:scale(1.1); }
                .ilha-predio:hover{ transform:scale(1.15) !important; }
            }
            /* ⏱ Timer conta do tempo preenchido no inicio */
            #ig-timerTop{ font-variant-numeric:tabular-nums; }
            #ig-botoesTopRight{ flex-direction:row !important; }
        `;
        document.head.appendChild(style);
    },

    renderQuestsPanel(){
        const panel=document.getElementById('ig-questsPanel');
        const list=document.getElementById('ig-questsList');
        const seasonBadge=document.getElementById('ig-seasonBadge');
        if(!panel||!list) return;
        if(!this.state.quests?.length){ panel.style.display='none'; return; }
        panel.style.display='block';
        if(seasonBadge) seasonBadge.textContent=`${this.state.season?.nome||'S1'} • x${this.state.season?.xpMultiplier||1}`;
        list.innerHTML = this.state.quests.map(q=>{
            const prog = this.state.questsProgress[q.id] || {atual:0, coletado:false};
            const pct = Math.min(100, (prog.atual/q.alvo)*100);
            const done = prog.atual >= q.alvo;
            return `<div style="background:${done? (prog.coletado?'#D1FAE5':'#FEF3C7') : '#fff'};border:1.5px solid ${done?'#10B981':'#E2E8F0'};border-radius:10px;padding:10px 12px;display:flex;align-items:center;gap:10px"><div style="font-size:22px">${q.icone||'🎯'}</div><div style="flex:1"><div style="font-size:13px;font-weight:700;color:#0f172a">${q.texto||q.id}</div><div style="background:#E2E8F0;height:6px;border-radius:10px;margin-top:6px;overflow:hidden"><div style="background:${done?'#10B981':'#4F46E5'};height:100%;width:${pct}%;transition:width 0.4s"></div></div><div style="font-size:11px;color:#64748B;margin-top:2px">${prog.atual}/${q.alvo} • +${q.recompensaXP} XP</div></div><div style="font-size:12px;font-weight:800;color:${done? (prog.coletado?'#065f46':'#92400e') : '#64748B'}">${prog.coletado?'✅ Coletado': done? '🎁 Coletar' : ''}</div></div>`;
        }).join('');
    },

    construirHTML(){
        let container=document.getElementById('ws-ingles-container');
        if(!container){ container=document.createElement('div'); container.id='ws-ingles-container'; container.style.display='none'; const p=document.getElementById('ws-main-container'); if(p?.parentNode) p.parentNode.appendChild(container); }
        container.innerHTML=`
            <div class="ig-header" id="ig-header-principal" style="transition:all 0.4s ease">
                <div class="ig-title"><img id="ig-header-chest" src="/assets/bau_roxo_pixel.png" class="ig-bau-topo" style="transition:all 0.4s ease" /><div class="ig-title-text"><h2>Baú do Inglês</h2><p>Treinamento Épico Adaptativo</p></div></div>
                <div class="ig-rpg-hud"><div id="ig-global-timer-display" class="ig-global-timer">00:00</div><div class="ig-hud-stat">🔥 <span id="ig-streakCount">1</span> Dias</div><div class="ig-hud-stat">⭐ <span id="ig-xpCount">0</span> XP</div></div>
            </div>
            <div id="ig-guardian-screen" class="ig-guardian-container" style="display:none">
                <div class="ig-prep-layout" style="display:flex;gap:25px;align-items:center"><img src="/assets/mago_bau_ingles.png" class="ig-guardian-avatar" style="width:130px;mix-blend-mode:screen" /><div class="ig-balao-fala-static"><span style="color:#f1c40f">Mestre Mago:</span><br/>Quantos minutos vai treinar agora?</div></div>
                <div class="ig-opcoes-tempo" style="display:flex;gap:15px;margin-top:20px"><div style="display:flex;align-items:center;gap:6px;background:rgba(0,0,0,0.8);padding:5px 10px;border-radius:8px;border:2px solid #f1c40f;flex:1;justify-content:center"><input type="number" id="ig-tempo-escolhido" placeholder="15" min="1" max="120" style="width:50px;border:none;background:transparent;color:#f1c40f;font-size:26px;text-align:center;outline:none"><span style="color:#fff">MIN</span></div><button data-action="aceitar-tempo" class="ws-btn" style="flex:1;background:linear-gradient(#d4af37,#996515);color:#fff;border:2px solid #fff;padding:10px 15px;border-radius:8px;cursor:pointer">Aceitar ⚔</button></div>
            </div>
            <div id="ig-alunoView" style="display:none;position:relative;width:100%;min-height:100vh;background:linear-gradient(180deg,#0a0e2a 0%,#1a237e 30%,#0d47a1 60%,#0f172a 100%);padding-top:0;box-sizing:border-box;overflow-y:auto">
                <!-- BARRA RECURSOS - ABAIXO DA BARRA WORKSPACE -->
                <div style="position:sticky;top:0;z-index:30;background:rgba(10,14,42,0.98);backdrop-filter:blur(12px);border-bottom:2px solid rgba(255,255,255,0.1);padding:8px 10px;display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;align-items:center" id="ig-topBarRecursos">
                    <div style="display:flex;align-items:center;gap:4px;background:rgba(0,0,0,0.5);border:1.5px solid #fbbf24;border-radius:20px;padding:6px 10px;white-space:nowrap;flex-shrink:0"><span style="font-size:14px">⏱️</span><span style="color:#fde68a;font-weight:900;font-size:12px" id="ig-timerTop">03:45</span></div>
                    <div style="display:flex;align-items:center;gap:6px;background:rgba(0,0,0,0.4);border:1.5px solid #3b82f6;border-radius:20px;padding:6px 10px;white-space:nowrap;flex-shrink:0"><span style="font-size:18px">💎</span><span style="color:#fff;font-weight:900;font-size:13px" id="ig-hubDiamante">250</span><button style="background:rgba(255,255,255,0.15);border:none;color:#fff;width:18px;height:18px;border-radius:50%;font-weight:900;font-size:12px;cursor:pointer;margin-left:4px">+</button></div>
                    <div style="display:flex;align-items:center;gap:6px;background:rgba(0,0,0,0.4);border:1.5px solid #fbbf24;border-radius:20px;padding:6px 10px;white-space:nowrap;flex-shrink:0"><span style="font-size:18px">🪙</span><span style="color:#fff;font-weight:900;font-size:13px" id="ig-hubCoins">1.280</span><button style="background:rgba(255,255,255,0.15);border:none;color:#fff;width:18px;height:18px;border-radius:50%;font-weight:900;font-size:12px;cursor:pointer;margin-left:4px">+</button></div>
                    <div style="display:flex;align-items:center;gap:6px;background:rgba(0,0,0,0.4);border:1.5px solid #22c55e;border-radius:20px;padding:6px 10px;white-space:nowrap;flex-shrink:0;position:relative"><span style="font-size:18px">⚡</span><span style="color:#fff;font-weight:900;font-size:13px" id="ig-hubEnergiaTop">85/100</span><button style="background:rgba(255,255,255,0.15);border:none;color:#fff;width:18px;height:18px;border-radius:50%;font-weight:900;font-size:12px;cursor:pointer;margin-left:4px">+</button></div>
                    <div style="display:flex;align-items:center;gap:6px;background:rgba(0,0,0,0.4);border:1.5px solid #a855f7;border-radius:20px;padding:6px 12px;white-space:nowrap;flex-shrink:0;position:relative;min-width:max-content"><span style="font-size:18px">🎁</span><span style="color:#fff;font-size:11px;font-weight:700">Bônus diário</span><span style="position:absolute;top:-6px;right:-6px;background:#ef4444;color:#fff;font-size:9px;font-weight:900;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center">1</span></div>
                </div>
                <!-- CONTEUDO PRINCIPAL -->
                <div id="ig-mainIlha" style="position:relative;min-height:calc(100vh - 60px);background:linear-gradient(180deg,#1e3a8a 0%,#0f172a 100%)">
                    <div id="ig-cardConta" style="position:absolute;top:16px;right:16px;z-index:20;background:linear-gradient(135deg,rgba(15,23,42,0.95),rgba(30,41,59,0.95));border:1.5px solid #3b82f6;border-radius:16px;padding:10px 12px;display:flex;align-items:center;gap:12px;box-shadow:0 4px 16px rgba(0,0,0,0.4);backdrop-filter:blur(8px)">
                        <img src="/assets/mago_bau_ingles.png" style="width:48px;height:48px;border-radius:50%;border:2px solid #fde68a;object-fit:cover;background:#fff;flex-shrink:0">
                        <div style="flex:1"><div style="display:flex;align-items:center;gap:8px"><span style="color:#fff;font-weight:900;font-size:13px">CONTA</span><span style="background:#fde68a;color:#000;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:900">Nv. <span id="ig-hubNivel">1</span></span></div><div style="background:rgba(0,0,0,0.5);height:8px;border-radius:10px;overflow:hidden;margin:6px 0 4px 0;border:1px solid rgba(255,255,255,0.1);width:120px"><div id="ig-hubXpBar" style="height:100%;background:linear-gradient(90deg,#22c55e,#16a34a);width:35%;transition:width 0.6s"></div></div><div style="color:#fff;font-size:11px;font-weight:700"><span id="ig-hubXpTexto">350</span> / 1.000 XP</div></div>
                        <div style="display:none"><span id="ig-hubNome">Explorador</span><span id="ig-hubStreak">1</span></div>
                    </div>
                    <div style="position:absolute;top:16px;left:16px;right:16px;z-index:15;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap">
                        <div id="ig-tituloIlha" style="text-align:left">
                            <div style="font-family:Cinzel,serif;font-weight:900;line-height:0.9;text-shadow:0 3px 0 #000, 0 0 20px rgba(0,0,0,0.9), 0 0 40px rgba(253,230,138,0.5)"><div style="color:#fde68a;font-size:12px;letter-spacing:3px;display:flex;align-items:center;gap:6px;text-shadow:0 0 12px rgba(253,230,138,1)"><span>✨</span> ILHA <span>✨</span></div><div style="background:linear-gradient(180deg,#FFFFFF 0%,#FFFBEB 10%,#fde68a 25%,#fbbf24 50%,#f59e0b 75%,#d97706 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-size:48px;filter:drop-shadow(0 3px 0 #000) drop-shadow(0 0 20px rgba(251,191,36,0.8));letter-spacing:1px;font-weight:900">MÁGICA</div><div style="background:linear-gradient(90deg,#7c3aed,#4f46e5);color:#fff;padding:5px 14px;border-radius:12px;font-size:11px;letter-spacing:1.5px;display:inline-block;margin-top:6px;border:1px solid rgba(255,255,255,0.3);box-shadow:0 2px 10px rgba(124,58,237,0.4)">APRENDA • JOGUE • EVOLUA</div></div>
                        </div>
                        <div id="ig-botoesTopRight" style="display:flex;gap:10px;align-items:flex-start">
                        <button data-action="abrir-recompensas" style="background:linear-gradient(135deg,rgba(30,58,138,0.9),rgba(30,64,175,0.9));border:1.5px solid #3b82f6;border-radius:14px;padding:8px 10px;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3);backdrop-filter:blur(8px)"><div style="width:36px;height:36px;background:linear-gradient(135deg,#fde68a,#d97706);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px">🏆</div><span style="color:#fff;font-size:9px;font-weight:800">Recompensas</span></button>
                        <button data-action="abrir-conquistas" style="background:linear-gradient(135deg,rgba(30,58,138,0.9),rgba(30,64,175,0.9));border:1.5px solid #ef4444;border-radius:14px;padding:8px 10px;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3);backdrop-filter:blur(8px)"><div style="width:36px;height:36px;background:linear-gradient(135deg,#fde68a,#ef4444);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px">🎯</div><span style="color:#fff;font-size:9px;font-weight:800">Conquistas</span></button>
                        </div>
                    </div>
                    <div id="ig-cardsContainer" style="position:absolute;bottom:100px;left:16px;right:16px;z-index:15;display:flex;gap:14px;overflow-x:auto;scrollbar-width:none;padding-bottom:8px">
                        <div data-action="abrir-aprender" class="ilha-card" style="min-width:160px;flex:1;background:linear-gradient(180deg,rgba(20,40,100,0.9),rgba(10,25,70,0.9));border:2px solid #3b82f6;border-radius:16px;padding:14px;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,0.4)"><div style="width:80px;height:60px;background:#fff;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:40px">🏫</div><div style="text-align:center"><div style="color:#fff;font-weight:900;font-size:14px">APRENDER</div><div style="color:#93c5fd;font-size:10px;margin-top:2px">Lições e desafios</div></div><div style="width:28px;height:28px;background:rgba(255,255,255,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;margin-top:4px">❯</div></div>
                        <div data-action="abrir-missoes" class="ilha-card" style="min-width:160px;flex:1;background:linear-gradient(180deg,rgba(80,30,10,0.9),rgba(50,20,5,0.9));border:2px solid #f97316;border-radius:16px;padding:14px;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,0.4)"><div style="width:80px;height:60px;background:#fff;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:36px">🔭</div><div style="text-align:center"><div style="color:#fff;font-weight:900;font-size:14px">MISSÕES</div><div style="color:#fdba74;font-size:10px;margin-top:2px">Tarefas diárias</div></div><div style="width:28px;height:28px;background:rgba(255,255,255,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;margin-top:4px">❯</div></div>
                        <div data-action="abrir-tesouros" class="ilha-card" style="min-width:160px;flex:1;background:linear-gradient(180deg,rgba(60,20,100,0.9),rgba(40,10,70,0.9));border:2px solid #a855f7;border-radius:16px;padding:14px;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,0.4)"><div style="width:80px;height:60px;background:#fff;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:36px">💎</div><div style="text-align:center"><div style="color:#fff;font-weight:900;font-size:14px">TESOUROS</div><div style="color:#c4b5fd;font-size:10px;margin-top:2px">Colete e descubra</div></div><div style="width:28px;height:28px;background:rgba(255,255,255,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;margin-top:4px">❯</div></div>
                        <div data-action="abrir-jogar" class="ilha-card" style="min-width:160px;flex:1;background:linear-gradient(180deg,rgba(10,60,30,0.9),rgba(5,40,20,0.9));border:2px solid #22c55e;border-radius:16px;padding:14px;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,0.4)"><div style="width:80px;height:60px;background:#fff;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:36px">🏰</div><div style="text-align:center"><div style="color:#fff;font-weight:900;font-size:14px">JOGAR</div><div style="color:#86efac;font-size:10px;margin-top:2px">Mini games</div></div><div style="width:28px;height:28px;background:rgba(255,255,255,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;margin-top:4px">❯</div></div>
                        <div data-action="abrir-loja" class="ilha-card" style="min-width:160px;flex:1;background:linear-gradient(180deg,rgba(80,30,10,0.9),rgba(60,20,5,0.9));border:2px solid #f97316;border-radius:16px;padding:14px;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,0.4)"><div style="width:80px;height:60px;background:#fff;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:32px">🏪</div><div style="text-align:center"><div style="color:#fff;font-weight:900;font-size:14px">LOJA</div><div style="color:#fdba74;font-size:10px;margin-top:2px">Itens e melhorias</div></div><div style="width:28px;height:28px;background:rgba(255,255,255,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;margin-top:4px">❯</div></div>
                    </div>
                    <div data-action="continuar-jornada" style="position:absolute;bottom:20px;left:50%;transform:translateX(-50%);z-index:20;background:linear-gradient(135deg,#fde68a 0%,#fbbf24 50%,#d97706 100%);border:2px solid #92400e;border-radius:28px;padding:12px 24px;display:flex;align-items:center;gap:12px;cursor:pointer;box-shadow:0 8px 24px rgba(251,191,36,0.5)">
                        <div style="width:48px;height:48px;background:#fff;border:2px solid #92400e;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px">🧭</div>
                        <div><div style="color:#92400e;font-size:12px;font-weight:800;line-height:1">Continue sua</div><div style="color:#000;font-weight:900;font-size:20px;font-family:Cinzel,serif;line-height:1">JORNADA!</div></div>
                        <div style="width:32px;height:32px;background:rgba(0,0,0,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#000;font-size:16px">❯</div>
                    </div>
                    <div id="ig-missoesDiarias" style="position:absolute;top:220px;right:16px;z-index:15;width:260px;background:linear-gradient(180deg,rgba(15,23,42,0.95),rgba(10,15,35,0.95));border:1.5px solid #334155;border-radius:16px;padding:14px;backdrop-filter:blur(12px);box-shadow:0 6px 20px rgba(0,0,0,0.4);display:none">
                        <div style="color:#fff;font-weight:900;font-size:12px;letter-spacing:1px;text-align:center;margin-bottom:12px">MISSÕES DIÁRIAS</div>
                        <div style="display:flex;flex-direction:column;gap:10px">
                            <div style="display:flex;gap:10px;align-items:center"><div style="width:28px;height:28px;background:#fff;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:16px">📖</div><div style="flex:1"><div style="color:#fff;font-size:11px">Complete 3 lições</div><div style="display:flex;align-items:center;gap:6px;margin-top:4px"><div style="flex:1;background:rgba(0,0,0,0.5);height:6px;border-radius:6px;overflow:hidden"><div style="width:66%;height:100%;background:#3b82f6"></div></div><span style="color:#93c5fd;font-size:10px">2/3</span><span style="background:#1e3a8a;color:#93c5fd;padding:2px 6px;border-radius:6px;font-size:8px">XP 50</span></div></div></div>
                        </div>
                        <button style="width:100%;margin-top:12px;background:#1e293b;color:#fff;border:1px solid #334155;padding:8px;border-radius:10px;font-size:11px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:space-between">Ver todas <span>❯</span></button>
                    </div>
                </div>
                <div style="display:none"><div id="ig-gamesGrid" class="ig-games-grid"></div><div id="ig-questsPanel"></div><div id="ig-xp-bar-container"></div></div>
            </div>

            <div id="ig-timeout-screen" style="display:none;flex-direction:column;align-items:center;justify-content:center;min-height:60vh"><h1 style="font-family:Cinzel">O tempo esgotou!</h1><div id="ig-timeout-xp" style="font-size:42px;color:#f1c40f">+0 XP</div><button data-action="encerrar-sessao" class="ws-btn" style="background:#d4af37;color:#fff;padding:12px 35px;border-radius:4px;border:2px solid #fff;cursor:pointer">Guardar e Sair</button></div>
            <div id="ig-professorView" style="display:none;min-height:70vh">
                <div class="ig-menu-prof">
                    <button data-action="render-tab" data-tab="ranking" class="ig-menu-btn">🏆 Ranking & Ligas</button>
                    <button data-action="render-tab" data-tab="mago" class="ig-menu-btn">🧙 Mago IA</button>
                    <button data-action="render-tab" data-tab="quests" class="ig-menu-btn">🎯 Missões</button>
                    <button data-action="render-tab" data-tab="loja" class="ig-menu-btn">🛍 Loja do Mago</button>
                    <button data-action="render-tab" data-tab="season" class="ig-menu-btn">⚙️ Temporada</button>
                    <button data-action="render-tab" data-tab="biblioteca" class="ig-menu-btn active">📚 Biblioteca</button>
                    <button data-action="render-tab" data-tab="imagens" class="ig-menu-btn">🖼 Imagens</button>
                    <button data-action="render-tab" data-tab="envios" class="ig-menu-btn">📥 Envios <span id="ig-pendingCount" style="background:#F59E0B;color:#fff;padding:2px 6px;border-radius:10px;font-size:11px">0</span></button>
                    <button data-action="render-tab" data-tab="algoritmo" class="ig-menu-btn">🧠 Algoritmo</button>
                </div>
                <div id="ig-tab-content" style="flex:1;padding:30px;background:#F8FAFC;overflow-y:auto"></div>
            </div>
            <div id="ig-gameModal" style="display:none;position:fixed;inset:0;background:rgba(15,23,42,0.85);z-index:1000000;align-items:center;justify-content:center;backdrop-filter:blur(8px)">
                <div class="ws-card" style="width:90%;max-width:650px;background:#fffcf0;border:4px solid #d4af37;border-radius:8px;display:flex;flex-direction:column;max-height:90vh">
                    <div style="padding:15px 20px;border-bottom:2px dashed #d4af37;display:flex;justify-content:space-between;align-items:center"><div><span id="ig-modalIcon" style="font-size:28px"></span> <h2 id="ig-modalTitle" style="display:inline;margin:0;font-family:Cinzel"></h2></div><div style="display:flex;gap:15px"><button data-action="abrir-mini-hub" style="background:#0F172A;color:#fff;border:2px solid #d4af37;padding:8px 12px;border-radius:8px;cursor:pointer">🔄 Mudar</button><button data-action="fechar-jogo" style="background:transparent;border:none;font-size:35px;cursor:pointer;color:#e74c3c">×</button></div></div>
                    <div id="ig-modalBody" style="padding:30px;overflow-y:auto;flex:1"></div>
                </div>
            </div>
        `;
    },

    atualizarHubV2(){
        var stats = this.state;
        var elNivel = document.getElementById('ig-hubNivel');
        var elXpBar = document.getElementById('ig-hubXpBar');
        var elXpTexto = document.getElementById('ig-hubXpTexto');
        var elNome = document.getElementById('ig-hubNome');
        var elStreak = document.getElementById('ig-hubStreak');
        var elCoins = document.getElementById('ig-hubCoins');
        var elDiamante = document.getElementById('ig-hubDiamante');
        var elEnergiaTop = document.getElementById('ig-hubEnergiaTop');
        if(elNivel) elNivel.textContent = this.calcularLevel(stats.xp).level;
        if(elNome) elNome.textContent = (Workspace.usuario && Workspace.usuario.nome ? Workspace.usuario.nome.split(' ')[0] : 'Explorador');
        var xpAtual = stats.xp||0;
        var lvlInfo = this.calcularLevel(xpAtual);
        var pct = lvlInfo.progresso;
        if(elXpBar) elXpBar.style.width = Math.min(100, Math.max(0, pct))+'%';
        if(elXpTexto) elXpTexto.textContent = xpAtual+' / '+lvlInfo.proximo+' XP';
        if(elStreak) elStreak.textContent = stats.streak||1;
        var coins = stats.coins||{bronze:150, prata:20, ouro:2};
        var total = (coins.ouro||0)*10000 + (coins.prata||0)*100 + (coins.bronze||0);
        if(elCoins) elCoins.textContent = total>=1000 ? (total/1000).toFixed(1)+'k' : total;
        if(elDiamante) elDiamante.textContent = stats.diamantes||250;
        if(elEnergiaTop) elEnergiaTop.textContent = stats.energia||5;
    },
    abrirAprender(){
        var grid = document.getElementById('ig-gamesGrid');
        var modal = document.getElementById('ig-gameModal');
        if(!modal) return;
        modal.style.display='flex';
        var body = document.getElementById('ig-modalBody');
        if(body){
            var htmlGrid = grid ? grid.innerHTML : '<div>Carregando jogos...</div>';
            body.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px"><div style="display:flex;align-items:center;gap:10px"><div style="font-size:36px">📚</div><div><h2 style="font-family:Cinzel;color:#0F172A;margin:0;font-size:18px">Casa do Aprender</h2><p style="color:#64748B;font-size:11px;margin:2px 0 0 0">Ganhe Coins jogando!</p></div></div><div style="display:flex;gap:6px"><div style="background:#FEF3C7;border:1px solid #fbbf24;padding:4px 8px;border-radius:10px;font-size:11px;font-weight:800">🪙 <span id="ig-modalCoins">'+(this.state.coins.ouro||0)+' Ouro</span></div><div style="background:#EDE9FE;border:1px solid #8b5cf6;padding:4px 8px;border-radius:10px;font-size:11px;font-weight:800">💎 '+(this.state.diamantes||0)+'</div></div></div><div class="ig-games-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px">'+htmlGrid+'</div><div style="margin-top:12px;background:#F0FDF4;border:1px solid #bbf7d0;border-radius:10px;padding:8px;display:flex;justify-content:space-between;align-items:center"><div style="display:flex;gap:12px"><div style="text-align:center"><div style="font-size:10px;color:#065f46;font-weight:800">⏱️ TEMPO</div><div style="font-weight:900;font-size:14px" id="ig-gameTempo">'+Math.floor(this.tempoRestante/60)+':'+String(this.tempoRestante%60).padStart(2,'0')+'</div></div><div style="text-align:center"><div style="font-size:10px;color:#065f46;font-weight:800">🪙 GANHO</div><div style="font-weight:900;font-size:14px;color:#d97706" id="ig-gameCoinsGanho">0 Bronze</div></div></div><div style="text-align:center"><div style="font-size:10px;color:#065f46;font-weight:800">⭐ XP SESSÃO</div><div style="font-weight:900;font-size:12px" id="ig-gameXpSessao">'+(this.xpGanhosNaSessao||0)+' XP</div></div></div>';
            document.getElementById('ig-modalTitle').textContent='APRENDER - Lições e Desafios';
            document.getElementById('ig-modalIcon').textContent='📚';
        }
    },
    abrirJogarIlha(){
        var modal = document.getElementById('ig-gameModal');
        if(!modal) return;
        modal.style.display='flex';
        var body = document.getElementById('ig-modalBody');
        if(body){
            body.innerHTML = '<div style="text-align:center"><div style="font-size:40px">🌴</div><h2 style="font-family:Cinzel">Este é seu campo de criação!</h2><p style="color:#64748B;font-size:12px">Use sua imaginação para construir sua ilha mágica</p><div style="background:radial-gradient(ellipse at center,#4ade80 0%,#22c55e 30%,#16a34a 60%,#0e7490 100%);height:300px;border-radius:20px;border:3px solid #fde68a;margin:16px 0;display:flex;align-items:center;justify-content:center;position:relative"><div style="font-size:50px">🏝️</div><div style="position:absolute;bottom:10px;right:10px;background:#fff;padding:6px 10px;border-radius:12px;font-size:10px">🌴 Palmeiras • 🪨 Pedras • ⛵ Cais</div></div><button data-action="abrir-construir" style="background:linear-gradient(135deg,#fde68a,#d4af37);color:#000;border:none;padding:12px 24px;border-radius:20px;font-weight:900;cursor:pointer">🔨 Construir</button><div style="margin-top:16px;background:#FEF2F2;border:1px solid #ef4444;border-radius:10px;padding:10px"><div style="font-weight:900;color:#b91c1c">⚔️ Invadir e Saquear</div><div style="font-size:11px;color:#7f1d1d;margin-top:4px">Escolha uma ilha abaixo para saquear apenas itens de Coins (Diamantes são protegidos)</div><div id="ig-listaInvasao" style="margin-top:8px;display:flex;flex-direction:column;gap:6px"></div></div></div>';
            document.getElementById('ig-modalTitle').textContent='JOGAR - Campo de Criação';
            document.getElementById('ig-modalIcon').textContent='🎮';
            var lista = document.getElementById('ig-listaInvasao');
            if(lista){
                var outras = this.state.ilhasOutras||[{nome:'Ilha do João', nivel:3, cristais:200, coins:{ouro:1, prata:10, bronze:50}, userId:'1'},{nome:'Ilha da Maria', nivel:5, cristais:500, coins:{ouro:3, prata:20, bronze:100}, userId:'2'}];
                var h = '';
                outras.forEach(function(ilha){
                    h += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:8px;display:flex;justify-content:space-between;align-items:center"><div><div style="font-weight:800;font-size:11px">'+ilha.nome+' Nv.'+ilha.nivel+'</div><div style="font-size:10px;color:#64748B">🪙 '+(ilha.coins.ouro||0)+' Ouro • 💎 0 (protegido)</div></div><button data-action="invadir-ilha" data-alvo="'+ilha.userId+'" style="background:#ef4444;color:#fff;border:none;padding:6px 12px;border-radius:20px;font-size:10px;font-weight:800;cursor:pointer">Saquear</button></div>';
                });
                lista.innerHTML = h;
            }
        }
    },
    abrirLojaIlha(){
        var modal = document.getElementById('ig-gameModal');
        if(!modal) return;
        modal.style.display='flex';
        var body = document.getElementById('ig-modalBody');
        var coins = this.state.coins||{bronze:150, prata:20, ouro:2};
        var diamantes = this.state.diamantes||250;
        if(body){
            body.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px"><h2 style="font-family:Cinzel;margin:0">🛍️ Loja da Ilha</h2><div style="display:flex;gap:8px"><div style="background:#FEF3C7;border:2px solid #fbbf24;padding:6px 10px;border-radius:12px;font-weight:900;font-size:12px">🪙 '+coins.ouro+' Ouro | '+coins.prata+' Prata | '+coins.bronze+' Bronze</div><div style="background:#EDE9FE;border:2px solid #8b5cf6;padding:6px 10px;border-radius:12px;font-weight:900;font-size:12px">💎 '+diamantes+'</div></div></div><div style="display:flex;gap:6px;margin-bottom:12px"><button data-action="loja-tab" data-loja="avatares" style="background:#fde68a;color:#000;border:none;padding:8px 12px;border-radius:20px;font-weight:800;font-size:11px;cursor:pointer">🧙 Avatares</button><button data-action="loja-tab" data-loja="ferramentas" style="background:#e2e8f0;color:#000;border:none;padding:8px 12px;border-radius:20px;font-weight:700;font-size:11px;cursor:pointer">🛠️ Ferramentas</button><button data-action="loja-tab" data-loja="animais" style="background:#e2e8f0;color:#000;border:none;padding:8px 12px;border-radius:20px;font-weight:700;font-size:11px;cursor:pointer">🐾 Animais</button><button data-action="loja-tab" data-loja="decoracoes" style="background:#e2e8f0;color:#000;border:none;padding:8px 12px;border-radius:20px;font-weight:700;font-size:11px;cursor:pointer">🌳 Decorações</button><button data-action="loja-tab" data-loja="magicos" style="background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#fff;border:none;padding:8px 12px;border-radius:20px;font-weight:800;font-size:11px;cursor:pointer">✨ Mágicos (💎)</button></div><div id="ig-lojaConteudo"></div><div style="margin-top:12px;background:#FFFBEB;border:1px solid #fde68a;border-radius:10px;padding:8px;font-size:10px;color:#92400e">💡 Itens de Coins (bronze/prata/ouro) podem ser roubados em invasões. Itens de Diamante são protegidos e nunca são roubados!</div>';
            document.getElementById('ig-modalTitle').textContent='LOJA - Itens e Melhorias';
            document.getElementById('ig-modalIcon').textContent='🛒';
            this.renderLojaTab('avatares');
        }
    },
    renderLojaTab(tipo){
        var el = document.getElementById('ig-lojaConteudo');
        if(!el) return;
        if(tipo==='avatares'){
            var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px">';
            var avatares = this.defaults.avatares||[];
            for(var i=0;i<avatares.length;i++){
                var av = avatares[i];
                var precoOuro = Math.floor(av.preco/100);
                var tem = false;
                for(var j=0;j<(this.state.inventario||[]).length;j++){ if(this.state.inventario[j].id===av.id) tem=true; }
                var btn = tem ? '<span style="background:#10B981;color:#fff;padding:4px 8px;border-radius:10px;font-size:10px">✅ Possui</span>' : '<button data-action="comprar-item" data-item-id="'+av.id+'" data-tipo="avatar" data-preco="'+precoOuro+'" data-moeda="ouro" style="background:linear-gradient(135deg,#fbbf24,#d97706);color:#000;border:none;padding:6px 12px;border-radius:20px;font-weight:900;font-size:10px;cursor:pointer">'+precoOuro+' Ouro 🪙</button>';
                html += '<div style="background:'+(tem?'#f1f5f9':'#fff')+';border:2px solid '+(tem?'#94a3b8':'#e2e8f0')+';border-radius:14px;padding:10px;text-align:center"><div style="font-size:36px">'+(av.emoji||'🧙')+'</div><div style="font-weight:900;font-size:11px">'+av.nome+'</div><div style="font-size:9px;color:#64748B;margin:4px 0">'+(av.desc||'')+'</div><div style="margin-top:6px">'+btn+'</div></div>';
            }
            html += '</div>';
            el.innerHTML = html;
        } else if(tipo==='magicos'){
            var itens = [{id:'vara_magica', nome:'Vara Mágica', emoji:'🪄', preco:50, desc:'Rouba +10%'},{id:'anel_magico', nome:'Anel Mágico', emoji:'💍', preco:80, desc:'Defesa +20%'},{id:'po_magico', nome:'Pó Mágico', emoji:'✨', preco:30, desc:'+100 XP'},{id:'capa_invisivel', nome:'Capa Invisibilidade', emoji:'🧥', preco:120, desc:'Invisível 2h'},{id:'chapeu_magico', nome:'Chapéu Mágico', emoji:'🎩', preco:100, desc:'Produção 2x 1h'},{id:'energia_batalha', nome:'Energia Batalha', emoji:'⚡', preco:20, desc:'+10 energia'}];
            var html2 = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px">';
            for(var k=0;k<itens.length;k++){
                var it = itens[k];
                html2 += '<div style="background:linear-gradient(180deg,#F5F3FF,#fff);border:2px solid #8b5cf6;border-radius:14px;padding:10px;text-align:center"><div style="font-size:36px">'+it.emoji+'</div><div style="font-weight:900;font-size:11px">'+it.nome+'</div><div style="font-size:9px;color:#64748B">'+it.desc+'</div><button data-action="comprar-item" data-item-id="'+it.id+'" data-tipo="magico" data-preco="'+it.preco+'" data-moeda="diamante" style="margin-top:6px;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#fff;border:none;padding:6px 12px;border-radius:20px;font-weight:900;font-size:10px;cursor:pointer">'+it.preco+' 💎</button><div style="font-size:8px;color:#8b5cf6;margin-top:4px">🔒 Protegido</div></div>';
            }
            html2 += '</div>';
            el.innerHTML = html2;
        } else {
            el.innerHTML = '<div style="text-align:center;padding:20px;color:#94a3b8"><div style="font-size:32px">🚧</div><div>Em breve - '+tipo+'</div></div>';
        }
    },
    abrirTesouros(){
        var modal = document.getElementById('ig-gameModal');
        if(!modal) return;
        modal.style.display='flex';
        var body = document.getElementById('ig-modalBody');
        var coins = this.state.coins||{bronze:150, prata:20, ouro:1};
        var diamantes = this.state.diamantes||250;
        if(body){
            body.innerHTML = '<div style="text-align:center;margin-bottom:16px"><div style="font-size:60px">💰</div><h2 style="font-family:Cinzel">Tesouros</h2><p style="color:#64748B;font-size:12px">Coins podem ser roubadas, Diamantes não!</p></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px"><div style="background:linear-gradient(135deg,#FEF3C7,#fde68a);border:2px solid #d97706;border-radius:14px;padding:12px;text-align:center"><div style="font-size:28px">🥉</div><div style="font-weight:900;font-size:12px">Bronze</div><div style="font-size:20px;font-weight:900">'+(coins.bronze||0)+'</div><div style="font-size:9px;color:#92400e">Comum</div></div><div style="background:linear-gradient(135deg,#E5E7EB,#d1d5db);border:2px solid #6b7280;border-radius:14px;padding:12px;text-align:center"><div style="font-size:28px">🥈</div><div style="font-weight:900;font-size:12px">Prata</div><div style="font-size:20px;font-weight:900">'+(coins.prata||0)+'</div><div style="font-size:9px;color:#4b5563">Raro</div></div><div style="background:linear-gradient(135deg,#FEF3C7,#fbbf24);border:2px solid #f59e0b;border-radius:14px;padding:12px;text-align:center"><div style="font-size:28px">🥇</div><div style="font-weight:900;font-size:12px">Ouro</div><div style="font-size:20px;font-weight:900">'+(coins.ouro||0)+'</div><div style="font-size:9px;color:#92400e">Épico</div></div></div><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px"><div style="background:linear-gradient(135deg,#EDE9FE,#ddd6fe);border:2px solid #8b5cf6;border-radius:14px;padding:12px;text-align:center"><div style="font-size:28px">💎</div><div style="font-weight:900">Diamantes</div><div style="font-size:20px;font-weight:900">'+diamantes+'</div><div style="font-size:9px;color:#6d28d9">Nunca roubado 🔒</div></div><div style="background:linear-gradient(135deg,#D1FAE5,#a7f3d0);border:2px solid #10b981;border-radius:14px;padding:12px;text-align:center"><div style="font-size:28px">⚡</div><div style="font-weight:900">Energia</div><div style="font-size:20px;font-weight:900">'+(this.state.energia||5)+'</div><div style="font-size:9px;color:#065f46">Batalhas</div></div></div>';
            document.getElementById('ig-modalTitle').textContent='TESOUROS';
        }
    },
    abrirMissoesIlha(){
        var modal = document.getElementById('ig-gameModal');
        if(!modal) return;
        modal.style.display='flex';
        var body = document.getElementById('ig-modalBody');
        if(body){
            body.innerHTML = '<div style="text-align:center;margin-bottom:16px"><div style="font-size:60px">📜</div><h2 style="font-family:Cinzel">Missões</h2><p style="color:#64748B;font-size:12px">Professor posta missões aqui - complete nos jogos!</p></div><div id="ig-questsListHub"></div><div style="margin-top:16px;background:#EFF6FF;border:2px solid #3b82f6;border-radius:12px;padding:12px"><div style="font-weight:900;color:#1e40af;font-size:12px">👨‍🏫 Para Professores:</div><div style="font-size:11px;color:#1e3a8a;margin-top:4px">Painel Professor → Missões → Criar. Ex: Treine 5x WordPicker = 50 prata. Aparece aqui!</div></div>';
            document.getElementById('ig-modalTitle').textContent='MISSÕES';
            var src = document.getElementById('ig-questsList');
            var dst = document.getElementById('ig-questsListHub');
            if(src && dst) dst.innerHTML = src.innerHTML;
        }
    },
    coletarBonusDiario(){
        this.state.coins = this.state.coins||{bronze:0, prata:0, ouro:0};
        this.state.coins.bronze = (this.state.coins.bronze||0)+50;
        this.state.diamantes = (this.state.diamantes||0)+5;
        this.saveDados();
        this.atualizarHubV2();
        Workspace.mostrarAviso('🎁 Bônus! +50 Bronze +5 💎','success');
    },
    continuarJornada(){ this.abrirJogarIlha(); }
};

setTimeout(()=> Workspace.Ingles.init(), 100);