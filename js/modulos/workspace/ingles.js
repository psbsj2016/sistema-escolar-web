// js/modulos/workspace/ingles.js - V3 FINAL (A+B+C + Painel Professor Completo + Voz Mago Mobile Grave)
window.Workspace = window.Workspace || {};
if(!window.Workspace.escapeHTML){
    window.Workspace.escapeHTML = (s)=> String(s||'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}

// ===================== VOICE SERVICE - MASCULINA BONITA E GRAVE =====================
const VoiceService = (() => {
    let cacheNormal = null, cacheMago = null, resolver = null;
    const ready = new Promise(r => resolver = r);

    const FEMALE_BLOCK = ['female','samantha','zira','karen','victoria','tessa','moira','siri','veena','fiona','susan','heather','jenny','aria','emma','michelle','linda','karen','tessa'];
    
    // PC tem David ótimo. Mobile precisa de Alex (iOS) e Google UK Male (Android) - os mais graves e naturais
    const SCORE_NORMAL = [
        {k:'david', s:1000}, {k:'alex', s:950}, {k:'daniel', s:900}, 
        {k:'google uk english male', s:880}, {k:'mark', s:850}, {k:'arthur', s:800}, {k:'oliver', s:790}, {k:'aaron', s:780}
    ];
    const SCORE_MAGO = [ // Mago quer grave e encorpado
        {k:'david', s:1000}, {k:'alex', s:990}, // Alex no iPhone é MUITO grave e bonito
        {k:'daniel', s:950}, {k:'google uk english male', s:930}, 
        {k:'arthur', s:900}, {k:'oliver', s:890}, {k:'mark', s:850}, {k:'guy', s:800}
    ];

    const pick = (voices, isMago) => {
        const en = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
        if(!en.length) return null;
        const pool = en.filter(v => !FEMALE_BLOCK.some(f => (v.name+v.voiceURI).toLowerCase().includes(f)));
        const base = pool.length ? pool : en;
        const map = isMago ? SCORE_MAGO : SCORE_NORMAL;
        
        // [MOBILE] Prioriza voz local (offline) que é mais natural e grave no celular
        const scored = base.map(v=>{
            const id=(v.name+' '+v.voiceURI).toLowerCase();
            let sc=100; 
            map.forEach(o=>{ if(id.includes(o.k)) sc=o.s; });
            if(id.includes('male') && !id.includes('female')) sc+=200;
            // bônus pra voz local no mobile - soa mais bonita
            if(v.localService) sc+=80;
            if(v.default) sc+=50;
            return {v, sc, id};
        }).sort((a,b)=>b.sc-a.sc);

        // Log pra debug no celular
        // console.log('Voices rank:', scored.slice(0,5).map(x=>`${x.v.name} (${x.sc})`));
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
            // Força reload de vozes no gesto do usuário (crucial pro celular)
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
                    // MAGO: Grave e bonito
                    if(isIOS){
                        // iOS Alex fica perfeito grave com 0.75
                        u.pitch = 0.75; u.rate = 0.88;
                    } else if(isMobile){
                        // Android Google UK Male fica lindo grave com 0.7
                        u.pitch = 0.70; u.rate = 0.88;
                    } else {
                        // PC David já é grave natural
                        u.pitch = 0.80; u.rate = 0.85;
                    }
                }else{
                    // NORMAL: Masculina natural
                    u.pitch = isMobile ? 0.85 : 0.92;
                    u.rate = rate;
                }
            }else{
                // Fallback absoluto - força grave na marra
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
        xp:0, streak:1, words:[], phrases:[], quizzes:[], pictures:[], minimalPairs:[], debates:[], submissions:[], pool:[],
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
            {id:'picturePop', title:'👁🗨 Visão do Alquimista', desc:'Invoque o nome da relíquia.', icon:'👁🗨', color:'#DCFCE7', level:'A1-B1'}
        ]
    },

    init(){
        this.injetarCSS(); this.construirHTML(); this.bindEvents();
        if(typeof Workspace.navegarPara==='function' && !this.navConfigurada){
            const orig=Workspace.navegarPara;
            Workspace.navegarPara=(tela,hist)=>{
                const c=document.getElementById('ws-ingles-container');
                if(c) c.style.display=(tela==='ingles')?'block':'none';
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
    abrirBau(){ Workspace.navegarPara('ingles'); },
    sincronizarTempoReal: async function(){ await this.loadDados(); const modal=document.getElementById('ig-gameModal'); if(modal && modal.style.display!=='none') return; const hub=document.getElementById('ig-alunoView'); if(hub && hub.style.display!=='none' && Workspace.usuario.tipo==='Aluno') this.iniciarFalaGuardiao(true); const tab=document.querySelector('.ig-side-item.active'); if(tab && Workspace.usuario.tipo!=='Aluno') this.renderProfessorTab(tab.dataset.tab); },

    loadDados: async function(){
        try{
            const escolaId=Workspace.usuario.escolaId||'DEFAULT';
            const res=await Workspace.api(`/workspace/ingles/dados?escolaId=${escolaId}`,'GET');
            if(res && res.success && res.dados){
                const d=res.dados;
                this.state.words = Array.isArray(d.words)&&d.words.length?d.words:[...this.defaults.words];
                this.state.phrases = Array.isArray(d.phrases)&&d.phrases.length?d.phrases:[...this.defaults.phrases];
                this.state.quizzes = Array.isArray(d.quizzes)&&d.quizzes.length?d.quizzes:[...this.defaults.quizzes];
                this.state.pictures = Array.isArray(d.pictures)&&d.pictures.length?d.pictures:[...this.defaults.pictures];
                this.state.wordPickers = Array.isArray(d.wordPickers)&&d.wordPickers.length?d.wordPickers:[...this.defaults.wordPickers];
                this.state.minimalPairs = Array.isArray(d.minimalPairs)&&d.minimalPairs.length?d.minimalPairs:[...this.defaults.minimalPairs];
                this.state.debates = Array.isArray(d.debates)&&d.debates.length?d.debates:[...this.defaults.debates];
                this.state.roleplays = Array.isArray(d.roleplays)&&d.roleplays.length?d.roleplays:[...this.defaults.roleplays];
                this.state.questions = Array.isArray(d.questions)&&d.questions.length?d.questions:[...this.defaults.questions];
                this.state.submissions = Array.isArray(d.submissions)?d.submissions:[];
                this.state.pool = Array.isArray(d.pool)?d.pool:[];
                this.state.errosRetidos = Array.isArray(d.errosRetidos)?d.errosRetidos:[];
                this.state.magoPhrases = Array.isArray(d.magoPhrases)&&d.magoPhrases.length?d.magoPhrases:[...this.defaults.magoPhrases];
                this.state.magoConfig = (d.magoConfig&&typeof d.magoConfig==='object')?d.magoConfig:{...this.defaults.magoConfig};
                this.state.srs = (d.srs&&typeof d.srs==='object')?d.srs:{};
            }else{
                this.state.words=[...this.defaults.words]; this.state.phrases=[...this.defaults.phrases];
                this.state.quizzes=[...this.defaults.quizzes]; this.state.pictures=[...this.defaults.pictures];
                this.state.wordPickers=[...this.defaults.wordPickers]; this.state.minimalPairs=[...this.defaults.minimalPairs];
                this.state.debates=[...this.defaults.debates]; this.state.roleplays=[...this.defaults.roleplays]; this.state.questions=[...this.defaults.questions];
                this.state.submissions=[]; this.state.pool=[]; this.state.errosRetidos=[]; this.state.magoPhrases=[...this.defaults.magoPhrases];
                this.state.magoConfig={...this.defaults.magoConfig}; this.state.srs={};
            }
            const userK=`ws_ingles_user_${Workspace.usuario.id}`;
            this.state.xp=parseInt(localStorage.getItem(`${userK}_xp`)||'0');
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
            localStorage.setItem(`${userK}_concluidos`, JSON.stringify(this.state.itensConcluidos));
            localStorage.setItem(`${userK}_srs`, JSON.stringify(this.state.srs));
        }catch{}
        try{
            if(Workspace.usuario?.tipo==='Aluno'){
                Workspace.api('/workspace/ingles/xp','POST',{userId:Workspace.usuario.id, escolaId:Workspace.usuario.escolaId||'DEFAULT', nome:Workspace.usuario.nome||Workspace.usuario.login, xp:this.state.xp, streak:this.state.streak}).catch(()=>{});
            }
            await Workspace.api('/workspace/ingles/dados','PUT',{
                escolaId:Workspace.usuario.escolaId||'DEFAULT',
                words:this.state.words, phrases:this.state.phrases, quizzes:this.state.quizzes, pictures:this.state.pictures,
                wordPickers:this.state.wordPickers, minimalPairs:this.state.minimalPairs, debates:this.state.debates, roleplays:this.state.roleplays, questions:this.state.questions,
                submissions:this.state.submissions, pool:this.state.pool, errosRetidos:this.state.errosRetidos,
                magoPhrases:this.state.magoPhrases, magoConfig:this.state.magoConfig, srs:this.state.srs
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

    // SRS verdadeiro
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
        if(!disponiveis.length) return null;
        return disponiveis[Math.floor(Math.random()*disponiveis.length)];
    },

    falar: (text, lang='en-US', pitch=1, rate=0.95, isMago=false)=> VoiceService.falar(text,{lang,pitch,rate,isMago}),
    similaridade(a,b){
        const norm=s=>s.toLowerCase().trim().replace(/[^\w\s]/g,'');
        let nA=norm(a), nB=norm(b);
        if(nA===nB) return 1;
        if(nB.includes(nA)||nA.includes(nB)) return 0.9;
        return nA.split(' ').some(w=>nB.includes(w))?0.6:0;
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
            .ig-card{background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;padding:22px;margin-bottom:18px}
            .ig-list-item{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid #f1f5f9;color:#0f172a;font-weight:500}
            .ig-sidebar{width:250px;background:#fff;border-right:1px solid #E2E8F0;padding:20px;display:flex;flex-direction:column;gap:5px;flex-shrink:0}
            .ig-side-item{background:transparent;border:none;padding:12px 15px;border-radius:10px;text-align:left;font-weight:bold;color:#64748B;cursor:pointer;transition:0.2s;white-space:nowrap}
            .ig-side-item.active{background:#0F172A;color:#fff}
            #ig-professorView{display:flex;min-height:70vh}
            #ig-tab-content{flex:1;padding:28px;background:#F8FAFC;overflow-y:auto}
            /* FIX BOTÕES - APENAS DENTRO DO BAÚ DO INGLÊS, NÃO AFETA OUTROS WORKSPACES */
            #ws-ingles-container .ws-btn, #ig-gameModal .ws-btn{font-weight:800!important}
            #ws-ingles-container .ws-btn[style*="background:#fff"], #ig-gameModal .ws-btn[style*="background:#fff"]{color:#0f172a!important;border:2px solid #cbd5e1!important}
            #ws-ingles-container .ws-btn[style*="background:#ffffff"], #ig-gameModal .ws-btn[style*="background:#ffffff"]{color:#0f172a!important}
            #ws-ingles-container .ws-btn[style*="background:#0f172a"], #ig-gameModal .ws-btn[style*="background:#0f172a"]{color:#fde68a!important}
            #ws-ingles-container .ws-btn[style*="background:#4F46E5"], #ig-gameModal .ws-btn[style*="background:#4F46E5"]{color:#ffffff!important}
            #ws-ingles-container .ws-btn[style*="background:#10B981"], #ig-gameModal .ws-btn[style*="background:#10B981"]{color:#ffffff!important}
            #ws-ingles-container .ig-game-card .ws-btn, #ig-gameModal .ig-game-card .ws-btn{background:#fff!important;color:#0f172a!important;border:2px solid #e2e8f0!important}

            @media(max-width:768px){
              #ws-ingles-container{min-height:100vh;border-radius:0}
              .ig-header{flex-direction:column;gap:14px;padding:12px 16px;position:relative}
              .ig-bau-topo{width:92px!important}
              .ig-title-text h2{font-size:24px}
              .ig-games-grid{grid-template-columns:1fr;padding:0 16px 30px 16px}
              .ig-hub-banner{flex-direction:column;text-align:center;padding:14px}
              #ig-professorView{flex-direction:column}
              .ig-sidebar{width:100%;flex-direction:row;overflow-x:auto;gap:8px;padding:12px;border-right:none;border-bottom:2px solid #E2E8F0;scrollbar-width:thin;-webkit-overflow-scrolling:touch}
              .ig-side-item{flex-shrink:0;padding:10px 14px;font-size:13px}
              #ig-tab-content{padding:16px}
              .ig-guardian-container{padding:20px 16px;min-height:60vh}
              .ig-balao-fala-static{font-size:18px}
            }
        `;
        document.head.appendChild(style);
    },


    construirHTML(){
        let container=document.getElementById('ws-ingles-container');
        if(!container){ container=document.createElement('div'); container.id='ws-ingles-container'; container.style.display='none'; const p=document.getElementById('ws-main-container'); if(p?.parentNode) p.parentNode.appendChild(container); }
        container.innerHTML=`
            <div class="ig-header">
                <div class="ig-title"><img id="ig-header-chest" src="/assets/bau_roxo_pixel.png" class="ig-bau-topo" /><div class="ig-title-text"><h2>Baú do Inglês</h2><p>Treinamento Épico Adaptativo</p></div></div>
                <div class="ig-rpg-hud"><div id="ig-global-timer-display" class="ig-global-timer">00:00</div><div class="ig-hud-stat">🔥 <span id="ig-streakCount">1</span> Dias</div><div class="ig-hud-stat">⭐ <span id="ig-xpCount">0</span> XP</div></div>
            </div>
            <div id="ig-guardian-screen" class="ig-guardian-container" style="display:none">
                <div class="ig-prep-layout" style="display:flex;gap:25px;align-items:center"><img src="/assets/mago_bau_ingles.png" class="ig-guardian-avatar" style="width:130px;mix-blend-mode:screen" /><div class="ig-balao-fala-static"><span style="color:#f1c40f">Mestre Mago:</span><br/>Quantos minutos vai treinar agora?</div></div>
                <div class="ig-opcoes-tempo" style="display:flex;gap:15px;margin-top:20px"><div style="display:flex;align-items:center;gap:6px;background:rgba(0,0,0,0.8);padding:5px 10px;border-radius:8px;border:2px solid #f1c40f;flex:1;justify-content:center"><input type="number" id="ig-tempo-escolhido" placeholder="15" min="1" max="120" style="width:50px;border:none;background:transparent;color:#f1c40f;font-size:26px;text-align:center;outline:none"><span style="color:#fff">MIN</span></div><button data-action="aceitar-tempo" class="ws-btn" style="flex:1;background:linear-gradient(#d4af37,#996515);color:#fff;border:2px solid #fff;padding:10px 15px;border-radius:8px;cursor:pointer">Aceitar ⚔</button></div>
            </div>
            <div id="ig-alunoView" style="display:none;padding:28px"><div class="ig-hub-banner"><img src="/assets/mago_bau_ingles.png" class="ig-hub-mago-img" alt="Mago" /><div id="ig-hub-mago-text" class="ig-balao-fala-hub" style="display:none"></div></div><div id="ig-gamesGrid" class="ig-games-grid"></div></div>
            <div id="ig-timeout-screen" style="display:none;flex-direction:column;align-items:center;justify-content:center;min-height:60vh"><h1 style="font-family:Cinzel">O tempo esgotou!</h1><div id="ig-timeout-xp" style="font-size:42px;color:#f1c40f">+0 XP</div><button data-action="encerrar-sessao" class="ws-btn" style="background:#d4af37;color:#fff;padding:12px 35px;border-radius:4px;border:2px solid #fff;cursor:pointer">Guardar e Sair</button></div>
            <div id="ig-professorView" style="display:none;min-height:70vh"><div class="ig-sidebar">
                <button data-action="render-tab" data-tab="mago" class="ig-side-item">🧙 Mago IA</button>
                <button data-action="render-tab" data-tab="biblioteca" class="ig-side-item active">📚 Biblioteca</button>
                <button data-action="render-tab" data-tab="imagens" class="ig-side-item">🖼 Imagens</button>
                <button data-action="render-tab" data-tab="envios" class="ig-side-item">📥 Envios <span id="ig-pendingCount" style="background:#F59E0B;color:#fff;padding:2px 6px;border-radius:10px;font-size:11px">0</span></button>
                <button data-action="render-tab" data-tab="algoritmo" class="ig-side-item">🧠 Algoritmo</button>
                <button data-action="render-tab" data-tab="ranking" class="ig-side-item">🏆 Ranking</button>
            </div><div id="ig-tab-content" style="flex:1;padding:30px;background:#F8FAFC;overflow-y:auto"></div></div>
            <div id="ig-gameModal" style="display:none;position:fixed;inset:0;background:rgba(15,23,42,0.85);z-index:1000000;align-items:center;justify-content:center;backdrop-filter:blur(8px)">
                <div class="ws-card" style="width:90%;max-width:650px;background:#fffcf0;border:4px solid #d4af37;border-radius:8px;display:flex;flex-direction:column;max-height:90vh">
                    <div style="padding:15px 20px;border-bottom:2px dashed #d4af37;display:flex;justify-content:space-between;align-items:center"><div><span id="ig-modalIcon" style="font-size:28px"></span> <h2 id="ig-modalTitle" style="display:inline;margin:0;font-family:Cinzel"></h2></div><div style="display:flex;gap:15px"><button data-action="abrir-mini-hub" style="background:#0F172A;color:#fff;border:2px solid #d4af37;padding:8px 12px;border-radius:8px;cursor:pointer">🔄 Mudar</button><button data-action="fechar-jogo" style="background:transparent;border:none;font-size:35px;cursor:pointer;color:#e74c3c">×</button></div></div>
                    <div id="ig-modalBody" style="padding:30px;overflow-y:auto;flex:1"></div>
                </div>
            </div>`;
    },

    bindEvents(){
        const root=document.getElementById('ws-ingles-container');
        if(!root || root._bound) return; root._bound=true;
        root.addEventListener('click', async e=>{
            const b=e.target.closest('[data-action]'); if(!b) return;
            const a=b.dataset.action;
            switch(a){
                case 'aceitar-tempo':{
                    const campo=document.getElementById('ig-tempo-escolhido'); const m=parseInt(campo.value)||0;
                    if(m<=0){ Workspace.mostrarAviso('Digite um tempo válido!','warning'); campo.focus(); return; }
                    // Força load de vozes no gesto do usuário (crucial pro mobile ficar bonito)
                    window.speechSynthesis.getVoices();
                    this.abrirBauMagico(m); break;
                }
                case 'encerrar-sessao': this.encerrarSessaoBau(); break;
                case 'abrir-mini-hub': this.abrirMiniHub(); break;
                case 'fechar-jogo': this.fecharJogo(); break;
                case 'abrir-jogo': this.abrirJogo(b.dataset.gameId); break;
                case 'render-tab': this.renderProfessorTab(b.dataset.tab); break;
                case 'inserir-variavel-mago': this.inserirVariavelMago(); break;
                case 'salvar-mago-phrase': this.handleSalvarMago(); break;
                case 'editar-mago-phrase': this.editarMagoPhrase(b.dataset.id); break;
                case 'remover-item': this.remItem(b.dataset.key, b.dataset.id); break;
                case 'add-word': this.addWord(); break;
                case 'add-phrase': this.addPhrase(); break;
                case 'add-quiz': this.addQuiz(); break;
                case 'add-pic': this.addPic(); break;
                case 'aprovar-envio': this.aprovarEnvio(b.dataset.id); break;
                case 'rejeitar-envio': this.remItem('submissions', b.dataset.id); break;
                case 'proximo-desafio': this.proximoDesafio(); break;
                case 'testar-voz-mago': VoiceService.falar('Greetings, brave adventurer '+this.getNomeAlunoReal()+', your quest begins now!', {isMago:true}); break;
            }
        });
        root.addEventListener('change', e=>{
            if(e.target.id==='mago-voz-toggle' || e.target.id==='mago-modo-select') this.atualizarConfigMago();
        });
        const modal=document.getElementById('ig-modalBody');
        modal.addEventListener('click', async e=>{
            const b=e.target.closest('[data-action]'); if(!b) return;
            if(b.dataset.action==='iniciar-jogo'){ e.preventDefault(); this.renderDesafioAtual(); return; }
            // existing handler continues
            e.target.closest('[data-action]'); if(!b) return;
            const cur=this.desafioAtualObj;
            const input=document.getElementById('ig-input')?.value?.trim()||'';
            const listen=document.getElementById('ig-listenInput')?.value?.trim()||'';
            if(b.dataset.action==='falar-frase'){
                if(cur?.phrase) VoiceService.falar(cur.phrase, {isMago:false});
                else if(cur?.word) VoiceService.falar(cur.word);
                else if(b.dataset.text) VoiceService.falar(b.dataset.text);
            }
            if(b.dataset.action==='iniciar-voz'){
                const esperado=cur?.word||cur?.phrase||this.state._minimalTarget;
                if(esperado) this.iniciarReconhecimentoDeVoz(esperado, cur, b.dataset.tipo||'phrase');
            }
            if(b.dataset.action==='verificar-wordSpark'){
                if(!input.toLowerCase().includes((cur.word||'').toLowerCase())){ this.registrarErro(cur,'word'); this.falhaGenerica(); }
                else { this.updateSRS(cur.id,'word',true); this.superarErro(cur.id); this.envioAoProfessor('wordSpark', input, 50); }
            }
            if(b.dataset.action==='verificar-listen'){
                const sim=this.similaridade(listen, cur.phrase);
                if(sim>=0.9){ this.updateSRS(cur.id,'phrase',true); this.superarErro(cur.id); this.sucessoGenerico(50); }
                else { this.registrarErro(cur,'phrase'); this.falhaGenerica(); }
            }
            if(b.dataset.action==='verificar-quiz'){
                const idx=parseInt(b.dataset.index);
                if(idx===cur.correct){ this.updateSRS(cur.id,'quiz',true); this.superarErro(cur.id); this.sucessoGenerico(30); }
                else { this.registrarErro(cur,'quiz'); this.falhaGenerica(); }
            }
            if(b.dataset.action==='verificar-minimal'){
                if(b.dataset.choice===this.state._minimalTarget){ this.updateSRS(cur.id,'minimal',true); this.superarErro(cur.id); this.sucessoGenerico(75); }
                else { this.registrarErro(cur,'minimal'); this.falhaGenerica(); }
            }
            if(b.dataset.action==='verificar-picker'){
                const idx=parseInt(b.dataset.index);
                if(idx===cur.correct){ this.updateSRS(cur.id,'picker',true); this.superarErro(cur.id); this.sucessoGenerico(20); }
                else { this.registrarErro(cur,'picker'); this.falhaGenerica(); }
            }
            if(b.dataset.action==='verificar-picture-text'){
                const sim=this.similaridade(input, cur.word);
                if(sim>=0.9){ this.updateSRS(cur.id,'picture',true); this.superarErro(cur.id); this.sucessoGenerico(75); }
                else { this.registrarErro(cur,'picture'); this.falhaGenerica(); }
            }

            if(b.dataset.action==='verificar-envio'){
                if(input.length<2) return Workspace.mostrarAviso('Responda válido','warning');
                if(b.dataset.game==='questionMaker' && (!input.includes('?') || input.split(' ').length<3)) return Workspace.mostrarAviso('Pergunta precisa ter ? e 3 palavras','error');
                this.envioAoProfessor(b.dataset.game, input, parseInt(b.dataset.bonus||'50'));
            }
            if(b.dataset.action==='verificar-debate'){
                const texto=document.getElementById('ig-input')?.value?.trim()||'';
                if(texto.length<3) return Workspace.mostrarAviso('Escreva seu argumento','warning');
                const topic=this.desafioAtualObj;
                // Add user message
                this.state._debateChat.push({role:'user', text:texto});
                // XP for participation
                this.state.xp+=15; this.xpGanhosNaSessao+=15; await this.saveDados();
                // Show typing
                const typing=document.getElementById('ig-debate-typing');
                if(typing) typing.style.display='block';
                // Generate AI response after delay
                setTimeout(()=>{
                    const aiResp=this.gerarContraArgumentoIA(topic, texto, this.state._debateChat.length);
                    this.state._debateChat.push({role:'ai', text:aiResp});
                    this.renderGameDebateAI();
                    // Auto scroll
                    const inputEl=document.getElementById('ig-input'); if(inputEl) inputEl.value='';
                    // Bonus XP after 3 exchanges
                    if(this.state._debateChat.filter(m=>m.role==='user').length>=3){
                        this.state.xp+=60; this.xpGanhosNaSessao+=60; this.saveDados();
                        const toast=document.createElement('div');
                        toast.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#d4af37,#996515);color:#000;padding:10px 18px;border-radius:20px;font-weight:800;z-index:1000001';
                        toast.innerHTML='⚔ Duelo épico! +60 XP bônus';
                        document.body.appendChild(toast); setTimeout(()=>toast.remove(),2000);
                    }
                }, 1200 + Math.random()*800);
                // Clear input immediately and re-render to show user message
                document.getElementById('ig-input').value='';
                this.renderGameDebateAI();
            }

        });
    },

    renderizarVisualizacao(){
        const xpEl=document.getElementById('ig-xpCount'); if(xpEl) xpEl.textContent=this.state.xp;
        const stEl=document.getElementById('ig-streakCount'); if(stEl) stEl.textContent=this.state.streak;
        const chest=document.getElementById('ig-header-chest');
        if(chest){ chest.classList.remove('chest-shake','chest-explode'); chest.style.transform='scale(1)'; chest.src='/assets/bau_roxo_pixel.png'; chest.onerror=function(){ this.src='/public/assets/bau_roxo_pixel.png'; }; }
        const isAluno=Workspace.usuario.tipo==='Aluno';
        const guardian=document.getElementById('ig-guardian-screen');
        const alunoView=document.getElementById('ig-alunoView');
        const profView=document.getElementById('ig-professorView');
        const timeout=document.getElementById('ig-timeout-screen');
        const modal=document.getElementById('ig-gameModal');
        if(modal) modal.style.display='none';
        if(!isAluno){
            if(profView) profView.style.display='flex';
            if(alunoView) alunoView.style.display='none';
            if(guardian) guardian.style.display='none';
            if(timeout) timeout.style.display='none';
            const aba=localStorage.getItem('ws_ingles_aba_prof')||'biblioteca';
            this.renderProfessorTab(aba);
            const pend=document.getElementById('ig-pendingCount');
            if(pend) pend.textContent=this.state.submissions.filter(s=>s.status==='pending').length;
        }else{
            if(profView) profView.style.display='none';
            if(guardian) guardian.style.display='none';
            if(alunoView) alunoView.style.display='none';
            if(timeout) timeout.style.display='none';
            if(this.sessaoEncerrada){
                if(timeout){ timeout.style.display='flex'; const xpEl2=document.getElementById('ig-timeout-xp'); if(xpEl2) xpEl2.innerText=`+${this.xpGanhosNaSessao} XP ⭐`; }
            }else if(!this.tempoGlobalDefinido){
                if(guardian){ guardian.style.display='flex'; guardian.style.opacity='1'; }
            }else{
                if(alunoView){ alunoView.style.display='block'; this.renderAlunoGrid(); }
            }
        }
    },
    renderAlunoGrid(){
        const grid=document.getElementById('ig-gamesGrid'); if(!grid) return;
        grid.innerHTML=this.defaults.games.map(g=>{
            const vencidos=Object.values(this.state.srs).filter(s=>s.tipo===g.id && s.due<=Date.now()).length;
            return `<div class="ig-game-card" data-action="abrir-jogo" data-game-id="${g.id}">
                <div class="ig-top" style="display:flex;justify-content:space-between;margin-bottom:15px"><div class="ig-icon" style="background:${g.color};width:50px;height:50px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:28px">${g.icon}</div><span class="ig-badge" style="background:#1a1a2e;color:#f1c40f;padding:4px 10px;border-radius:4px;font-size:11px;font-weight:bold">${g.level}</span></div>
                <h3 style="font-family:Cinzel">${g.title} ${vencidos?'🔥':''}</h3><p style="color:#64748B;font-size:13px">${g.desc}</p>
                <div style="margin-top:10px;display:flex;gap:8px;align-items:center"><span style="background:#F1F5F9;padding:4px 8px;border-radius:4px;font-size:11px;font-weight:bold">⭐ +${['picturePop','minimalPairs','debateAI'].includes(g.id)?'75':'50'} XP</span> ${vencidos?`<span style="font-size:11px;color:#e74c3c;font-weight:bold">${vencidos} pra revisar</span>`:''}</div>
            </div>`;
        }).join('');
    },

    abrirBauMagico(minutos){
        if(ParticleEngine._exploding || this.tempoGlobalDefinido) return;
        try{ speechSynthesis.cancel(); }catch{}
        if(this.magoIntervalTimer) clearInterval(this.magoIntervalTimer);
        const chest=document.getElementById('ig-header-chest');
        if(chest) chest.classList.add('chest-shake');
        const magoScr=document.getElementById('ig-guardian-screen');
        if(magoScr) magoScr.style.opacity='0';
        setTimeout(()=>{
            if(magoScr) magoScr.style.display='none';
            if(chest){ chest.classList.remove('chest-shake'); chest.classList.add('chest-explode'); chest.src='/assets/bau_roxo_pixel_aberto.png'; chest.onerror=function(){ this.src='/public/assets/bau_roxo_pixel_aberto.png'; }; }
            const rect=chest?.getBoundingClientRect()||{left:innerWidth/2, top:50, width:0, height:0};
            ParticleEngine.explode(rect.left+rect.width/2, rect.top+rect.height/2);
            try{ const a=new Audio('https://actions.google.com/sounds/v1/weapons/large_explosion.ogg'); a.volume=0.9; a.play().catch(()=>{}); }catch{}
            setTimeout(()=>{
                this.tempoGlobalDefinido=true; this.xpGanhosNaSessao=0;
                const userK=`ws_ingles_user_${Workspace.usuario.id}`;
                this.state.itensConcluidos=[]; try{ localStorage.setItem(`${userK}_concluidos`, JSON.stringify([])); }catch{}
                this.iniciarTimerGlobal(minutos*60);
                this.renderizarVisualizacao();
                setTimeout(()=>this.iniciarFalaGuardiao(),500);
            },1000);
        },1500);
    },
    
    encerrarSessaoBau(){
        TimerService.stop();
        this.tempoGlobalDefinido=false;
        this.sessaoEncerrada=false;
        this.bauDestrancado=false;
        this.tempoRestante=0;
        this.digitandoAtivo=false;
        if(this.magoIntervalTimer) clearInterval(this.magoIntervalTimer);
        const chest=document.getElementById('ig-header-chest');
        if(chest){ chest.classList.remove('chest-shake','chest-explode'); chest.style.transform='scale(1)'; chest.src='/assets/bau_roxo_pixel.png'; chest.onerror=function(){ this.src='/public/assets/bau_roxo_pixel.png'; }; }
        document.getElementById('ig-gameModal').style.display='none';
        document.getElementById('ig-timeout-screen').style.display='none';
        document.getElementById('ig-alunoView').style.display='none';
        const guardian=document.getElementById('ig-guardian-screen');
        if(guardian){ guardian.style.display='flex'; guardian.style.opacity='1'; const inp=document.getElementById('ig-tempo-escolhido'); if(inp) inp.value=''; }
        this.renderizarVisualizacao();
        Workspace.mostrarAviso('Sessão guardada! Escolha novo tempo para voltar a jogar.','success');
    },

    iniciarFalaGuardiao(forcarRestart=false){
        // FIX: nunca fala durante jogo, só no hub
        const modal=document.getElementById('ig-gameModal');
        if(modal && modal.style.display!=='none') return;
        if(this.digitandoAtivo && !forcarRestart) return; this.digitandoAtivo=true;
        if(this.magoIntervalTimer) clearInterval(this.magoIntervalTimer);
        const balao=document.getElementById('ig-hub-mago-text');
        if(!balao) return; balao.style.display='block'; balao.innerHTML='';
        const config=this.state.magoConfig||this.defaults.magoConfig;
        const frases=this.state.magoPhrases.length?this.state.magoPhrases:this.defaults.magoPhrases;
        let fraseBruta='';
        if(config.modoExibicao==='sequencial'){
            const userK=`ws_mago_acessos_${Workspace.usuario?.id||'default'}`;
            let acessos=parseInt(localStorage.getItem(userK)||'0'); fraseBruta=frases[acessos%frases.length].text;
            if(!forcarRestart) localStorage.setItem(userK, acessos+1);
        }else if(config.modoExibicao==='fixa'){ fraseBruta=frases[0].text; }
        else { fraseBruta=frases[Math.floor(Math.random()*frases.length)].text; }
        const nomeCompleto=Workspace.usuario?.nome||Workspace.usuario?.login||'Aventureiro';
        let primeiro=nomeCompleto.split(' ')[0];
        if(primeiro.toLowerCase()==='teste') primeiro=Workspace.usuario.tipo==='Aluno'?'Aventureiro':'Professor';
        const regex=/(?:\(citarAluno\)|citarAluno|\$\{aluno\.nome\}|\{\{aluno\.nome\}\})/gi;
        const fraseAudio=fraseBruta.replace(regex, primeiro);
        const fraseVisual=fraseBruta.replace(regex, primeiro.toUpperCase());
        if(config.vozAtiva) VoiceService.falar(fraseAudio,{isMago:true}); else try{speechSynthesis.cancel()}catch{}
        let i=0, html='';
        this.magoIntervalTimer=setInterval(()=>{
            html+=fraseVisual.charAt(i); balao.innerText=html; i++;
            if(i>=fraseVisual.length){ clearInterval(this.magoIntervalTimer); this.digitandoAtivo=false; }
        },35);
    },
    iniciarTimerGlobal(segundos){
        const display=document.getElementById('ig-global-timer-display'); if(display) display.style.display='flex';
        TimerService.start(segundos, (rest)=>{
            this.tempoRestante=rest; this.atualizarDisplayTimerGlobal();
        }, ()=>{
            this.sessaoEncerrada=true; this.fecharJogo(); this.renderizarVisualizacao();
        });
    },
    atualizarDisplayTimerGlobal(){
        const d=document.getElementById('ig-global-timer-display'); if(!d) return;
        const m=Math.floor(this.tempoRestante/60).toString().padStart(2,'0');
        const s=(this.tempoRestante%60).toString().padStart(2,'0');
        d.innerText=`⏱ ${m}:${s}`;
        if(this.tempoRestante<30 && this.tempoRestante>0){ d.style.color='white'; d.style.background='#e74c3c'; }
        else { d.style.color='#e74c3c'; d.style.background='#fdf2f2'; }
    },

    // ===================== PAINEL PROFESSOR COMPLETO - RESTAURADO =====================
    renderProfessorTab(tabId){
        localStorage.setItem('ws_ingles_aba_prof', tabId);
        document.querySelectorAll('.ig-side-item').forEach(b=>b.classList.remove('active'));
        const activeBtn=document.querySelector(`.ig-side-item[data-tab="${tabId}"]`);
        if(activeBtn) activeBtn.classList.add('active');
        const content=document.getElementById('ig-tab-content');
        const state=this.state; const configMago=state.magoConfig||this.defaults.magoConfig;
        const esc=Workspace.escapeHTML;

        if(tabId==='mago'){
            content.innerHTML=`
                <div class="ig-card">
                    <h3>🧙 Inteligência do Guardião (Mago IA)</h3>
                    <p style="color:#64748B;font-size:13px">Configure o comportamento e crie falas. Use (citarAluno) para citar nome.</p>
                    <div style="background:#f8fafc;padding:15px;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:20px;display:flex;gap:20px;flex-wrap:wrap;align-items:center">
                        <label style="display:flex;gap:8px;font-weight:bold;cursor:pointer"><input type="checkbox" id="mago-voz-toggle" ${configMago.vozAtiva?'checked':''}> 🔊 Voz do Mago</label>
                        <select id="mago-modo-select" class="ig-input" style="width:auto"><option value="aleatorio" ${configMago.modoExibicao==='aleatorio'?'selected':''}>🎲 Aleatório</option><option value="sequencial" ${configMago.modoExibicao==='sequencial'?'selected':''}>🔢 Sequencial</option><option value="fixa" ${configMago.modoExibicao==='fixa'?'selected':''}>📌 Fixa (1ª)</option></select>
                        <button data-action="testar-voz-mago" style="background:#1a1a2e;color:#f1c40f;border:2px solid #d4af37;padding:6px 12px;border-radius:8px;cursor:pointer;font-weight:bold">🔊 Testar voz grave no celular</button>
                    </div>
                    <div style="background:#fff;padding:15px;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:20px">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><label style="font-size:13px;font-weight:bold">Nova Fala do Mago:</label><button data-action="inserir-variavel-mago" style="background:#8e44ad;color:#fff;border:none;padding:6px 12px;border-radius:20px;font-size:11px;font-weight:bold;cursor:pointer">+ Inserir (citarAluno)</button></div>
                        <div style="display:flex;gap:10px"><input id="nwMago" class="ig-input" placeholder="Ex: Bravo, (citarAluno)! Sua magia está forte!"><button data-action="salvar-mago-phrase" id="btn-salvar-mago" style="background:#4F46E5;color:#fff;border:none;padding:10px 15px;border-radius:8px;font-weight:bold;cursor:pointer">${state.editingMagoId?'Atualizar':'Salvar'}</button></div>
                        <p style="font-size:11px;color:#94a3b8;margin-top:8px">Dica mobile: Voz Alex (iPhone) e Google UK Male (Android) são as mais graves e bonitas. Testamos pitch 0.70 no mobile e 0.80 no PC.</p>
                    </div>
                    <h4 style="margin:0 0 10px 0">Lista de Falas (${state.magoPhrases.length}) - arraste para reordenar</h4>
                    <div id="ws-mago-lista-falas" style="max-height:400px;overflow-y:auto">${state.magoPhrases.map((m,i)=>`<div class="ig-list-item" draggable="true" data-id="${m.id}" style="background:#fff;border:1px solid #eee;border-left:4px solid #4F46E5;border-radius:8px;margin-bottom:8px;cursor:grab"><div style="display:flex;align-items:center;gap:10px;flex:1"><span style="font-weight:900;color:#cbd5e1;width:25px">${i+1}.</span><span style="color:#94a3b8">↕</span><div style="font-weight:600;color:#2c3e50;font-size:13px;flex:1">${esc(m.text)}</div></div><div style="display:flex;gap:8px"><button data-action="editar-mago-phrase" data-id="${m.id}" style="background:#fff8e1;border:1px solid #fdebd0;border-radius:6px;color:#f39c12;cursor:pointer;padding:4px 8px">✏ Editar</button><button data-action="remover-item" data-key="magoPhrases" data-id="${m.id}" style="background:#fdf2f2;border:1px solid #fadbd8;border-radius:6px;color:#e74c3c;cursor:pointer;padding:4px 8px">✕</button></div></div>`).join('')}</div>
                </div>`;
            const lista=document.getElementById('ws-mago-lista-falas');
            if(lista){
                lista.addEventListener('dragstart', e=>{ e.dataTransfer.setData('text/plain', e.target.closest('[data-id]')?.dataset.id); e.target.style.opacity='0.5'; });
                lista.addEventListener('dragover', e=>{ e.preventDefault(); e.target.closest('.ig-list-item')?.style.setProperty('border-top','3px solid #4F46E5'); });
                lista.addEventListener('dragleave', e=>{ e.target.closest('.ig-list-item')?.style.setProperty('border-top','1px solid #eee'); });
                lista.addEventListener('drop', async e=>{
                    e.preventDefault(); const dragged=e.dataTransfer.getData('text/plain'); const target=e.target.closest('[data-id]')?.dataset.id;
                    if(dragged&&target&&dragged!==target){
                        const arr=Workspace.Ingles.state.magoPhrases; const i1=arr.findIndex(x=>x.id===dragged); const i2=arr.findIndex(x=>x.id===target);
                        if(i1>-1&&i2>-1){ const [it]=arr.splice(i1,1); arr.splice(i2,0,it); await Workspace.Ingles.saveDados(); Workspace.Ingles.renderProfessorTab('mago'); }
                    }
                });
                lista.addEventListener('dragend', e=>{ e.target.style.opacity='1'; document.querySelectorAll('.ig-list-item').forEach(n=>n.style.borderTop='1px solid #eee'); });
            }
        }else if(tabId==='biblioteca'){
            content.innerHTML=`
                <div class="ig-card"><h3>📚 Biblioteca do Algoritmo - Poderosa</h3><p style="color:#64748B;font-size:13px">Tudo que você adicionar aqui alimenta instantaneamente os jogos dos alunos. SRS cuida da revisão.</p></div>
                <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">
                    <div class="ig-card" style="flex:1;min-width:320px"><h3>Palavras Raiz (${state.words.length})</h3><div style="display:flex;gap:8px;margin-bottom:15px;flex-wrap:wrap"><input id="nwWord" class="ig-input" style="flex:2" placeholder="Inglês (ex: resilient)"><input id="nwTrans" class="ig-input" style="flex:1" placeholder="Tradução"><button data-action="add-word" style="background:#4F46E5;color:#fff;border:none;padding:10px 15px;border-radius:8px;cursor:pointer;font-weight:bold">Add</button></div><div style="max-height:300px;overflow-y:auto">${state.words.map(w=>`<div class="ig-list-item"><span><b>${esc(w.word)}</b> - ${esc(w.translation)} <small style="color:#94a3b8">[${w.level||'B1'}]</small></span><button data-action="remover-item" data-key="words" data-id="${w.id}" style="color:#e74c3c;background:transparent;border:none;cursor:pointer;font-weight:bold">✕</button></div>`).join('')}</div></div>
                    <div class="ig-card" style="flex:1;min-width:320px"><h3>Frases (${state.phrases.length})</h3><div style="display:flex;gap:10px;margin-bottom:15px"><textarea id="nwPhrase" class="ig-textarea" style="min-height:45px;flex:1" placeholder="Nova frase em inglês..."></textarea><button data-action="add-phrase" style="background:#4F46E5;color:#fff;border:none;padding:10px 15px;border-radius:8px;cursor:pointer;font-weight:bold">Add</button></div><div style="max-height:300px;overflow-y:auto">${state.phrases.map(p=>`<div class="ig-list-item"><span style="font-size:13px">${esc(p.phrase)}</span><button data-action="remover-item" data-key="phrases" data-id="${p.id}" style="color:#e74c3c;background:transparent;border:none;cursor:pointer">✕</button></div>`).join('')}</div></div>
                </div>
                <div class="ig-card" style="margin-top:20px"><h3>Quizzes (${state.quizzes.length})</h3><div style="display:flex;gap:10px;margin-bottom:15px;flex-wrap:wrap"><input id="qQuestion" class="ig-input" style="flex:2;min-width:200px" placeholder="Pergunta"><input id="qOpt1" class="ig-input" style="flex:1;min-width:120px" placeholder="Opção 1 (errada)"><input id="qOpt2" class="ig-input" style="flex:1;min-width:120px" placeholder="Opção 2 (correta)"><button data-action="add-quiz" style="background:#4F46E5;color:#fff;border:none;padding:10px 15px;border-radius:8px;cursor:pointer;font-weight:bold">Add Quiz</button></div><div style="max-height:250px;overflow-y:auto">${state.quizzes.map(q=>`<div class="ig-list-item"><span><b>${esc(q.question)}</b> | Correta: ${esc(q.options[q.correct])}</span><button data-action="remover-item" data-key="quizzes" data-id="${q.id}" style="color:#e74c3c;background:transparent;border:none;cursor:pointer">✕</button></div>`).join('')}</div></div>
                <div style="display:flex;gap:20px;flex-wrap:wrap;margin-top:20px">
                    <div class="ig-card" style="flex:1;min-width:300px"><h3>WordPickers (${this.defaults.wordPickers.length}) - Poção Sintática</h3><p style="font-size:12px;color:#64748B">Edição rápida: esses vêm do código, mas você pode alimentar via Envios → Piscina</p><div>${this.defaults.wordPickers.map(s=>`<div class="ig-list-item"><span>${esc(s.text)}</span></div>`).join('')}</div></div>
                    <div class="ig-card" style="flex:1;min-width:300px"><h3>Perguntas Abertas (${this.defaults.questions.length})</h3><div>${this.defaults.questions.map(q=>`<div class="ig-list-item"><span>${esc(q.text)}</span></div>`).join('')}</div></div>
                </div>`;
        }else if(tabId==='imagens'){
            content.innerHTML=`
                <div class="ig-card"><h3>🖼 Banco de Figuras (PicturePop) - Alimenta Visão do Alquimista</h3><div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:15px"><input id="picWord" class="ig-input" style="flex:2;min-width:150px" placeholder="Palavra inglês (watermelon)"><input id="picTrans" class="ig-input" style="flex:2;min-width:150px" placeholder="Tradução"><input id="picEmoji" class="ig-input" style="flex:1;min-width:80px" placeholder="Emoji 🍉"><button data-action="add-pic" style="background:#4F46E5;color:#fff;border:none;padding:10px 15px;border-radius:8px;cursor:pointer;font-weight:bold">Add Imagem</button></div></div>
                <div style="display:flex;flex-wrap:wrap;gap:15px">${state.pictures.map(p=>`<div class="ig-card" style="width:160px;text-align:center;padding:15px;display:flex;flex-direction:column;align-items:center"><div style="font-size:48px;margin-bottom:10px">${p.emoji}</div><b style="color:#1E293B">${esc(p.word)}</b><small style="color:#64748B">${esc(p.translation||'')}</small><button data-action="remover-item" data-key="pictures" data-id="${p.id}" style="background:#F1F5F9;color:#EF4444;width:100%;border:none;padding:8px;border-radius:8px;font-weight:bold;font-size:12px;cursor:pointer;margin-top:10px">Remover</button></div>`).join('')}</div>`;
        }else if(tabId==='envios'){
            const pendentes=state.submissions.filter(s=>s.status==='pending');
            document.getElementById('ig-pendingCount').textContent=pendentes.length;
            if(!pendentes.length){
                content.innerHTML=`<div class="ig-card" style="text-align:center;padding:40px;color:#999"><div style="font-size:40px;margin-bottom:10px">☕</div>Nenhum desafio aberto pendente. Quando aluno envia resposta aberta, aparece aqui pra você aprovar e alimentar a Piscina Global.</div>
                <div class="ig-card"><h3>🌊 Piscina Global (${state.pool.length} itens)</h3><p style="font-size:12px;color:#64748B">Respostas aprovadas dos alunos que alimentam Espelho do Oráculo e outros jogos.</p><div style="max-height:300px;overflow-y:auto">${state.pool.slice(0,50).map(p=>`<div class="ig-list-item"><span><b>${esc(p.student||'Aluno')}</b>: ${esc(p.text).substring(0,120)}</span><small style="color:#94a3b8">${p.type}</small></div>`).join('')}</div></div>`;
            }else{
                content.innerHTML=`<div class="ig-card" style="border-left:4px solid #F59E0B"><h3>📥 Forja do Algoritmo - Envios para Aprovar</h3><p style="font-size:13px;color:#666">Aprove respostas boas para alimentar a Piscina Global. Elas virarão conteúdo automático nos jogos de Pergunta, Debate e Roleplay. Isso faz a inteligência crescer sozinha.</p></div>`+pendentes.slice().reverse().map(s=>`
                    <div class="ig-card">
                        <div style="display:flex;justify-content:space-between;margin-bottom:10px"><span style="background:#FEF3C7;color:#92400E;padding:4px 8px;border-radius:12px;font-size:11px;font-weight:bold">Aguardando Avaliação</span><span style="font-size:12px;color:#999"><b>${esc(s.student)}</b> • ${esc(s.game)} • ${new Date(s.timestamp).toLocaleString()}</span></div>
                        <p style="font-size:15px;color:#2c3e50;background:#f4f6f7;padding:12px;border-radius:8px;white-space:pre-wrap">${esc(s.text)}</p>
                        ${s.audioURL?`<audio controls src="${s.audioURL}" style="width:100%;margin-top:10px"></audio>`:''}
                        <div style="margin-top:15px;display:flex;gap:10px;flex-wrap:wrap"><button data-action="aprovar-envio" data-id="${s.id}" style="background:#10B981;border:none;padding:10px;border-radius:8px;cursor:pointer;color:#fff;flex:1;font-weight:bold">✅ Aprovar para Piscina Global</button><button data-action="rejeitar-envio" data-id="${s.id}" style="background:#e74c3c;border:none;padding:10px;border-radius:8px;cursor:pointer;color:#fff;font-weight:bold">🗑 Rejeitar</button></div>
                    </div>
                `).join('')+`<div class="ig-card"><h3>🌊 Piscina Global (${state.pool.length})</h3><div style="max-height:200px;overflow-y:auto">${state.pool.slice(0,20).map(p=>`<div class="ig-list-item"><span>${esc(p.text).substring(0,100)}</span></div>`).join('')}</div></div>`;
            }
        }else if(tabId==='algoritmo'){
            const totalProf=state.words.length+state.phrases.length+state.quizzes.length+state.pictures.length;
            const totalSRS=Object.keys(state.srs).length;
            const vencidos=Object.values(state.srs).filter(s=>s.due<=Date.now()).length;
            const taxaAcerto = totalSRS ? Math.round(Object.values(state.srs).filter(s=>s.repetitions>0).length/totalSRS*100) : 0;
            content.innerHTML=`
                <div class="ig-card"><h3>🧠 Inteligência do Baú - SRS + Algoritmo</h3><p style="color:#64748B;font-size:14px;line-height:1.5">Erros voltam em 2 min. Acertos: 1 dia → 6 dias → interval * ease. A Piscina Global alimenta jogos automaticamente.</p>
                    <div style="display:flex;gap:15px;margin-top:20px;flex-wrap:wrap">
                        <div style="flex:1;background:#EEF2FF;border:1px solid #4F46E5;padding:20px;border-radius:12px;text-align:center;min-width:150px"><div style="font-size:30px;font-weight:900;color:#4F46E5">${totalProf}</div><div style="font-size:12px;font-weight:bold">Sementes do Prof</div></div>
                        <div style="flex:1;background:#FEE2E2;border:1px solid #EF4444;padding:20px;border-radius:12px;text-align:center;min-width:150px"><div style="font-size:30px;font-weight:900;color:#EF4444">${state.errosRetidos.length}</div><div style="font-size:12px;font-weight:bold">Erros Retidos (memória curta)</div></div>
                        <div style="flex:1;background:#D1FAE5;border:1px solid #10B981;padding:20px;border-radius:12px;text-align:center;min-width:150px"><div style="font-size:30px;font-weight:900;color:#10B981">${totalSRS}</div><div style="font-size:12px;font-weight:bold">Itens no SRS</div></div>
                        <div style="flex:1;background:#FEF3C7;border:1px solid #F59E0B;padding:20px;border-radius:12px;text-align:center;min-width:150px"><div style="font-size:30px;font-weight:900;color:#D97706">${vencidos}</div><div style="font-size:12px;font-weight:bold">Vencidos pra revisar agora</div></div>
                    </div>
                    <div style="margin-top:20px;background:#f8fafc;padding:15px;border-radius:8px;border:1px solid #e2e8f0"><h4>📊 Detalhe SRS</h4><p style="font-size:13px">Taxa de aprendizado: ${taxaAcerto}% • Piscina Global: ${state.pool.length} respostas de alunos • Envios pendentes: ${state.submissions.filter(s=>s.status==='pending').length}</p><div style="max-height:250px;overflow-y:auto;margin-top:10px">${Object.entries(state.srs).slice(0,30).map(([id, s])=>`<div class="ig-list-item"><span><b>${id}</b> - Int ${s.interval}d | Ease ${s.ease.toFixed(2)} | Rep ${s.repetitions} | ${s.due<=Date.now()?'🔴 VENCIDO':'🟢 '+new Date(s.due).toLocaleDateString()}</span></div>`).join('')}</div></div>
                </div>`;
        }else if(tabId==='ranking'){
            content.innerHTML=`<div style="text-align:center;padding:50px;color:#94a3b8"><div style="font-size:40px;margin-bottom:15px;animation:pulse 1s infinite">🏆</div>A carregar o Pódio...</div>`;
            Workspace.api(`/workspace/ingles/ranking?escolaId=${Workspace.usuario.escolaId}`,'GET').then(res=>{
                if(res && res.success && res.ranking?.length){
                    let html=`<div class="ig-card" style="border-left:4px solid #F59E0B;background:#FFFBEB"><h3>🏆 Pódio da Escola (Leaderboard) - XP + SRS</h3><p style="font-size:12px;color:#64748B">Ranking considera XP ganho e itens dominados no SRS.</p></div>`;
                    res.ranking.forEach((aluno, idx)=>{
                        let medalha=`<div style="font-size:16px;font-weight:900;color:#94a3b8;width:40px;text-align:center">${idx+1}º</div>`;
                        if(idx===0) medalha=`<div style="font-size:30px;width:40px;text-align:center">🥇</div>`;
                        if(idx===1) medalha=`<div style="font-size:26px;width:40px;text-align:center">🥈</div>`;
                        if(idx===2) medalha=`<div style="font-size:22px;width:40px;text-align:center">🥉</div>`;
                        html+=`<div style="background:#fff;border:1px solid #E2E8F0;padding:15px 20px;border-radius:16px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between"><div style="display:flex;align-items:center;gap:20px">${medalha}<div style="border:2px solid #E2E8F0;border-radius:50%;padding:2px">${window.Workspace.renderizarAvatar?window.Workspace.renderizarAvatar(aluno.nome,45):'👤'}</div><strong style="color:#1E293B">${Workspace.escapeHTML(aluno.nome)}</strong></div><div style="display:flex;gap:12px;align-items:center"><div style="background:#E0E7FF;color:#4F46E5;padding:6px 15px;border-radius:30px;font-weight:900;font-size:14px;border:1px solid #C7D2FE">⭐ ${aluno.xp} XP</div></div></div>`;
                    });
                    content.innerHTML=html;
                }else content.innerHTML=`<div class="ig-card" style="text-align:center;padding:50px">A corrida ainda não começou! Alunos precisam ganhar XP.</div>`;
            }).catch(()=>{ content.innerHTML=`<div class="ig-card" style="text-align:center;padding:50px;color:#e74c3c">Erro ao carregar ranking.</div>`; });
        }
    },

    atualizarConfigMago: async function(){
        const voz=document.getElementById('mago-voz-toggle')?.checked;
        const modo=document.getElementById('mago-modo-select')?.value;
        if(voz===undefined||!modo) return;
        this.state.magoConfig={vozAtiva:voz, modoExibicao:modo};
        await this.saveDados(); Workspace.mostrarAviso('Configuração de comportamento atualizada!','success');
    },
    inserirVariavelMago(){
        const input=document.getElementById('nwMago'); if(!input) return;
        const s=input.selectionStart, e=input.selectionEnd, v='(citarAluno)';
        input.value=input.value.substring(0,s)+v+input.value.substring(e); input.focus(); input.selectionStart=input.selectionEnd=s+v.length;
    },
    getNomeAlunoReal(){
        const nomeCompleto=Workspace.usuario?.nome||Workspace.usuario?.login||'Aventureiro';
        let primeiro=nomeCompleto.split(' ')[0];
        if(primeiro.toLowerCase()==='teste') primeiro=Workspace.usuario.tipo==='Aluno'?'Aventureiro':'Professor';
        return primeiro;
    },
    handleSalvarMago: async function(){
        const input=document.getElementById('nwMago'); const text=input.value.trim();
        if(!text) return Workspace.mostrarAviso('Escreva a fala do Mago!','warning');
        if(this.state.editingMagoId){
            const ph=this.state.magoPhrases.find(m=>m.id===this.state.editingMagoId);
            if(ph) ph.text=text; this.state.editingMagoId=null;
        }else{
            this.state.magoPhrases.unshift({id:'mago_'+Date.now(), text});
        }
        input.value=''; const btn=document.getElementById('btn-salvar-mago'); if(btn) btn.innerText='Salvar';
        await this.saveDados(); this.renderProfessorTab('mago'); Workspace.mostrarAviso('Fala ensinada ao Mago! 🧙','success');
    },
    editarMagoPhrase(id){
        const ph=this.state.magoPhrases.find(m=>m.id===id); if(!ph) return;
        const input=document.getElementById('nwMago'); input.value=ph.text; input.focus();
        this.state.editingMagoId=id; const btn=document.getElementById('btn-salvar-mago'); if(btn){ btn.innerText='Atualizar Fala'; btn.style.background='#f39c12'; }
    },
    addWord: async function(){ const w=document.getElementById('nwWord').value.trim(), t=document.getElementById('nwTrans').value.trim(); if(!w) return Workspace.mostrarAviso('Digite a palavra','warning'); this.state.words.unshift({id:'w'+Date.now(), word:w, translation:t, level:'B1'}); await this.saveDados(); this.renderProfessorTab('biblioteca'); Workspace.mostrarAviso('Palavra adicionada!','success'); },
    addPhrase: async function(){ const p=document.getElementById('nwPhrase').value.trim(); if(!p) return; this.state.phrases.unshift({id:'p'+Date.now(), phrase:p}); await this.saveDados(); this.renderProfessorTab('biblioteca'); },
    addQuiz: async function(){
        const q=document.getElementById('qQuestion'); const qVal=q?.value.trim();
        const o1=document.getElementById('qOpt1')?.value.trim(); const o2=document.getElementById('qOpt2')?.value.trim();
        if(!qVal||!o1||!o2) return Workspace.mostrarAviso('Preencha pergunta e 2 opções','warning');
        this.state.quizzes.unshift({id:'q'+Date.now(), question:qVal, options:[o1,o2], correct:1, explanation:'Professor', level:'B1'}); await this.saveDados(); this.renderProfessorTab('biblioteca');
    },

    addPic: async function(){ const w=document.getElementById('picWord')?.value.trim()||''; if(!w) return; const tr=document.getElementById('picTrans')?.value.trim()||''; const em=document.getElementById('picEmoji')?.value.trim()||'🖼'; this.state.pictures.unshift({id:'pic'+Date.now(), word:w, translation:tr, emoji:em, category:'Professor'}); await this.saveDados(); this.renderProfessorTab('imagens'); },
    addWordPicker: async function(){ const text=document.getElementById('wpText')?.value.trim(); const o1=document.getElementById('wpOpt1')?.value.trim(); const o2=document.getElementById('wpOpt2')?.value.trim(); const o3=document.getElementById('wpOpt3')?.value.trim(); const correct=parseInt(document.getElementById('wpCorrect')?.value||'0'); if(!text||!o1) return Workspace.mostrarAviso('Preencha texto e opções','warning'); const opts=[o1,o2,o3].filter(Boolean); this.state.wordPickers.unshift({id:'wp'+Date.now(), text, options:opts, correct}); await this.saveDados(); this.renderProfessorTab('biblioteca'); Workspace.mostrarAviso('Poção adicionada!','success'); },
    addMinimal: async function(){ const a=document.getElementById('mpA')?.value.trim(); const b=document.getElementById('mpB')?.value.trim(); if(!a||!b) return; this.state.minimalPairs.unshift({id:'mp'+Date.now(), a, b}); await this.saveDados(); this.renderProfessorTab('biblioteca'); },
    addRoleplay: async function(){ const title=document.getElementById('rpTitle')?.value.trim(); const prompt=document.getElementById('rpPrompt')?.value.trim(); const tip=document.getElementById('rpTip')?.value.trim()||'Use inglês natural'; if(!title||!prompt) return; this.state.roleplays.unshift({id:'rp'+Date.now(), title, prompt, tip}); await this.saveDados(); this.renderProfessorTab('biblioteca'); },
    addQuestion: async function(){ const text=document.getElementById('aqText')?.value.trim(); if(!text) return; this.state.questions.unshift({id:'aq'+Date.now(), text}); await this.saveDados(); this.renderProfessorTab('biblioteca'); },
    addDebate: async function(){ const topic=document.getElementById('dbTopic')?.value.trim(); const starter=document.getElementById('dbStarter')?.value.trim()||'What is your opinion?'; if(!topic) return; this.state.debates.unshift({id:'d'+Date.now(), topic, starter}); await this.saveDados(); this.renderProfessorTab('biblioteca'); Workspace.mostrarAviso('Duelo adicionado com IA!','success'); },

    remItem: async function(key,id){ this.state[key]=this.state[key].filter(i=>i.id!==id); if(key==='magoPhrases'&&this.state.editingMagoId===id) this.state.editingMagoId=null; await this.saveDados(); const active=document.querySelector('.ig-side-item.active'); if(active) this.renderProfessorTab(active.dataset.tab); },
    aprovarEnvio: async function(id){ const s=this.state.submissions.find(x=>x.id===id); if(!s) return; s.status='approved'; this.state.pool.unshift({id:'pool_'+Date.now(), type:s.game, text:s.text, word:s.text, origin:'student', student:s.student, timestamp:Date.now()}); await this.saveDados(); this.renderProfessorTab('envios'); Workspace.mostrarAviso('Aprovado para Piscina Global!','success'); },

    abrirJogo(id){
        // FIX: silencia mago imediatamente ao entrar no jogo - evita repetição bugada
        try{ speechSynthesis.cancel(); }catch{}
        if(this.magoIntervalTimer){ clearInterval(this.magoIntervalTimer); this.magoIntervalTimer=null; }
        this.digitandoAtivo=false;
        const balao=document.getElementById('ig-hub-mago-text'); if(balao) balao.style.display='none';
        const game=this.defaults.games.find(g=>g.id===id); if(!game) return;
        if(id!=='debateAI'){
            this.state._debateChat=[];
            this.state._debateTopicId=null;
        }
        if(id==='wordSpark'){
            this.state._minimalTarget=null;
        }
        this.jogoAtual=id; 
        const iconEl=document.getElementById('ig-modalIcon'); if(iconEl) iconEl.textContent=game.icon;
        const titleEl=document.getElementById('ig-modalTitle'); if(titleEl) titleEl.textContent=game.title;
        const modal=document.getElementById('ig-gameModal'); if(modal) modal.style.display='flex'; 
        this.currentAudioURL=null; 
        this.renderGameCapa();
    },
    renderGameCapa(){
        const game=this.defaults.games.find(g=>g.id===this.jogoAtual);
        if(!game) return;
        const intro = this.defaults.intros ? this.defaults.intros[this.jogoAtual] : null;
        const como = intro ? intro.como : game.desc;
        const objetivo = intro ? intro.objetivo : 'Treine inglês de forma épica.';
        const dica = intro ? intro.dica : 'Foque e divirta-se!';
        const xp = intro ? intro.xp : '+50 XP';
        const totalItens = (()=>{ const c=this.getColecaoDoJogoAtual(); return c?c.length:0; })();
        const vencidos = Object.values(this.state.srs).filter(s=>s.tipo===this.jogoAtual && s.due<=Date.now()).length;
        document.getElementById('ig-modalBody').innerHTML=`
            <div style="text-align:center;padding:10px 0">
                <div style="width:84px;height:84px;border-radius:20px;background:${game.color};display:flex;align-items:center;justify-content:center;font-size:42px;margin:0 auto 14px auto;box-shadow:0 8px 24px rgba(0,0,0,0.15);border:3px solid #fff">${game.icon}</div>
                <h2 style="font-family:Cinzel,serif;color:#0f172a;margin:0;font-size:22px">${game.title}</h2>
                <span style="background:#0f172a;color:#fde68a;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:800;margin-top:8px;display:inline-block;border:1px solid #d4af37">${game.level} • ${totalItens} desafios • ${vencidos? vencidos+' para revisar 🔥': 'SRS ativo'}</span>
                <div style="text-align:left;background:linear-gradient(180deg,#ffffff 0%,#F8FAFC 100%);border:2px solid #E2E8F0;border-radius:16px;padding:18px;margin-top:18px">
                    <div style="margin-bottom:14px"><div style="font-size:11px;font-weight:800;color:#4F46E5;letter-spacing:1px;margin-bottom:4px">📖 COMO FUNCIONA</div><div style="font-size:14px;color:#0f172a;line-height:1.5">${como}</div></div>
                    <div style="margin-bottom:14px"><div style="font-size:11px;font-weight:800;color:#059669;letter-spacing:1px;margin-bottom:4px">🎯 OBJETIVO</div><div style="font-size:13px;color:#334155;line-height:1.5">${objetivo}</div></div>
                    <div style="margin-bottom:14px"><div style="font-size:11px;font-weight:800;color:#d97706;letter-spacing:1px;margin-bottom:4px">💡 DICA DO MAGO</div><div style="font-size:13px;color:#334155;line-height:1.5;background:#FFFBEB;border:1px solid #fde68a;padding:10px;border-radius:10px">${dica}</div></div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><span style="background:#EEF2FF;color:#4338ca;padding:6px 10px;border-radius:20px;font-size:11px;font-weight:800;border:1px solid #c7d2fe">⭐ ${xp}</span><span style="background:#F1F5F9;color:#475569;padding:6px 10px;border-radius:20px;font-size:11px;font-weight:600">⏱ Só acaba no X, Mudar ou tempo</span><span style="background:#D1FAE5;color:#065f46;padding:6px 10px;border-radius:20px;font-size:11px;font-weight:600">♾️ Treino infinito - nunca expulsa</span></div>
                </div>
                <button data-action="iniciar-jogo" style="width:100%;background:linear-gradient(135deg,#4F46E5,#3730A3);color:#fff;border:none;padding:16px;border-radius:14px;margin-top:18px;cursor:pointer;font-weight:800;font-size:16px;box-shadow:0 6px 0 #312e81, 0 8px 24px rgba(79,70,229,0.3)">▶ Iniciar Treino Épico</button>
                <p style="font-size:11px;color:#94a3b8;margin-top:10px">Depois de iniciar, fica treinando no mesmo jogo até clicar em Mudar 🗺, X ou acabar o tempo global</p>
            </div>
        `;
    },
    abrirMiniHub(){
        if(this.mediaRecorder?.state==='recording') this.mediaRecorder.stop(); if(this.recognition) this.recognition.stop();
        document.getElementById('ig-modalIcon').textContent='🗺'; document.getElementById('ig-modalTitle').textContent='Mapa de Missões';
        document.getElementById('ig-modalBody').innerHTML=`<div style="text-align:center;margin-bottom:20px"><p style="color:#64748B;font-weight:bold">A magia não para. Escolha sua próxima missão!</p></div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px">${this.defaults.games.map(g=>`<div data-action="abrir-jogo" data-game-id="${g.id}" style="background:${g.color};padding:15px;border-radius:12px;cursor:pointer;border:2px solid rgba(0,0,0,0.05);display:flex;flex-direction:column;align-items:center;gap:10px"><div style="font-size:32px;background:rgba(255,255,255,0.6);width:55px;height:55px;border-radius:12px;display:flex;align-items:center;justify-content:center">${g.icon}</div><h4 style="margin:0;font-size:13px">${g.title}</h4><div style="font-size:10px;background:rgba(255,255,255,0.6);padding:2px 8px;border-radius:4px">${g.level}</div></div>`).join('')}</div>`;
    },
    fecharJogo(){ try{ speechSynthesis.cancel(); }catch{} if(this.magoIntervalTimer){ clearInterval(this.magoIntervalTimer); this.magoIntervalTimer=null; } this.digitandoAtivo=false; document.getElementById('ig-gameModal').style.display='none'; if(this.mediaRecorder?.state==='recording') this.mediaRecorder.stop(); if(this.recognition) this.recognition.stop(); },


    sucessoGenerico: async function(bonus){
        if(this.desafioAtualObj?.id){ this.marcarComoConcluido(this.desafioAtualObj.id); this.updateSRS(this.desafioAtualObj.id, this.jogoAtual, true); }
        this.state.xp+=bonus; this.xpGanhosNaSessao+=bonus; await this.saveDados();
        const srs=this.state.srs[this.desafioAtualObj?.id];
        const toast=document.createElement('div');
        toast.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#10B981,#059669);color:#fff;padding:12px 22px;border-radius:30px;font-weight:800;z-index:1000001';
        toast.innerHTML=`✅ +${bonus} XP • Próxima revisão em ${srs?.interval||1}d`;
        document.body.appendChild(toast);
        setTimeout(()=>toast.remove(),1500);
        setTimeout(()=>{
            const modal=document.getElementById('ig-gameModal');
            if(modal && modal.style.display!=='none' && this.tempoRestante>0){
                this.renderDesafioAtual();
            }
        }, 800);
    },


    falhaGenerica: async function(){
        if(this.desafioAtualObj?.id) this.updateSRS(this.desafioAtualObj.id, this.jogoAtual, false);
        const toast=document.createElement('div');
        toast.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#EF4444,#B91C1C);color:#fff;padding:12px 22px;border-radius:30px;font-weight:800;z-index:1000001';
        toast.innerHTML=`❌ Erro guardado • Volta em 2 min`;
        document.body.appendChild(toast);
        setTimeout(()=>toast.remove(),1800);
        setTimeout(()=>{
            const modal=document.getElementById('ig-gameModal');
            if(modal && modal.style.display!=='none' && this.tempoRestante>0){
                this.renderDesafioAtual();
            }
        }, 1200);
    },

    envioAoProfessor: async function(gameId, texto, bonus=20){
        if(!texto||texto.trim().length<2) return Workspace.mostrarAviso('Responda válido!','warning');
        this.state.submissions.unshift({id:'sub_'+Date.now(), student:Workspace.usuario.nome, game:gameId, text:texto, audioURL:this.currentAudioURL||'', status:'pending', timestamp:Date.now()});
        if(this.desafioAtualObj?.id) this.updateSRS(this.desafioAtualObj.id, gameId, true);
        this.sucessoGenerico(bonus);
    },

    renderDesafioAtual(){
        if(this.tempoRestante<=0) return; this.currentAudioURL=null; this.desafioAtualObj=null;
        const id=this.jogoAtual;
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
    proximoDesafio(){ 
        if(this.jogoAtual==='debateAI'){
            this.renderGameDebateAI();
            return;
        }
        if(this.tempoRestante>0){
            this.renderDesafioAtual();
        }else{
            this.fecharJogo();
        }
    },
    getColecaoDoJogoAtual(){
        const id=this.jogoAtual;
        if(id==='wordSpark') return (this.state.words&&this.state.words.length)?this.state.words:this.defaults.words;
        if(id==='readAloud' || id==='listenType' || id==='sentenceShuffle') return (this.state.phrases&&this.state.phrases.length)?this.state.phrases:this.defaults.phrases;
        if(id==='quiz') return (this.state.quizzes&&this.state.quizzes.length)?this.state.quizzes:this.defaults.quizzes;
        if(id==='wordPicker') return (this.state.wordPickers&&this.state.wordPickers.length)?this.state.wordPickers:this.defaults.wordPickers;
        if(id==='minimalPairs') return (this.state.minimalPairs&&this.state.minimalPairs.length)?this.state.minimalPairs:this.defaults.minimalPairs;
        if(id==='picturePop') return this.state.pictures;
        if(id==='answerQuest') return (this.state.questions&&this.state.questions.length)?this.state.questions:this.defaults.questions;
        if(id==='contextRole') return (this.state.roleplays&&this.state.roleplays.length)?this.state.roleplays:this.defaults.roleplays;
        if(id==='debateAI') return (this.state.debates&&this.state.debates.length)?this.state.debates:this.defaults.debates;
        if(id==='questionMaker') return this.state.pool.filter(p=>p.type==='answerQuest');
        return null;
    },
    renderTelaFimDeJornada(){
        if(this.jogoAtual){
            const colecao = this.getColecaoDoJogoAtual();
            if(colecao && colecao.length){
                const ids = colecao.map(i=>i.id);
                this.state.itensConcluidos = this.state.itensConcluidos.filter(id=>!ids.includes(id));
                const k=`ws_ingles_user_${Workspace.usuario.id}`;
                try{ localStorage.setItem(k+`_concluidos`, JSON.stringify(this.state.itensConcluidos)); }catch{}
                this.renderDesafioAtual();
                return;
            }
        }
        this.renderDesafioAtual();
    },

    renderGameWordSpark(){
        this.state._debateChat=[];
        this.state._debateTopicId=null;
        this.state._minimalTarget=null;
        const colecaoWords = (this.state.words && this.state.words.length) ? this.state.words : this.defaults.words;
        this.desafioAtualObj=this.obterItemInteligente(colecaoWords,'word'); 
        if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const w=this.desafioAtualObj; 
        const srs=this.getSRS(w.id);
        document.getElementById('ig-modalBody').innerHTML=`
            <div style="text-align:center">
                <div style="font-size:11px;color:#94a3b8;background:#F1F5F9;padding:6px 10px;border-radius:20px;display:inline-block;margin-bottom:10px">SRS: ${srs?`Int ${srs.interval}d | Ease ${srs.ease.toFixed(2)} | Rep ${srs.repetitions}`:'Novo'} • Feitiço puro isolado</div>
                <div class="ig-big-phrase" style="font-size:38px;background:linear-gradient(180deg,#EEF2FF 0%,#E0E7FF 100%);border-color:#818cf8;color:#4338ca">${Workspace.escapeHTML(w.word)}</div>
                <p style="font-weight:800;color:#64748B;margin:8px 0">Significado: ${Workspace.escapeHTML(w.translation||'')}</p>
                <div class="ig-big-phrase" style="font-size:18px">Crie frase com <b style="color:#4F46E5">${Workspace.escapeHTML(w.word)}</b></div>
                <textarea id="ig-input" class="ig-textarea" placeholder="Ex: Although it was raining..." style="min-height:100px;margin-top:12px"></textarea>
                <button data-action="verificar-wordSpark" class="ws-btn" style="width:100%;background:linear-gradient(135deg,#4F46E5,#3730A3);color:#fff;border:none;padding:16px;border-radius:12px;margin-top:14px;cursor:pointer;font-weight:800">Lançar Feitiço ✨ +50 XP</button>
            </div>`;
    },
    renderGameReadAloud(){
        this.desafioAtualObj=this.obterItemInteligente(this.state.phrases,'phrase'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const p=this.desafioAtualObj;
        document.getElementById('ig-modalBody').innerHTML=`<div class="ig-big-phrase">${Workspace.escapeHTML(p.phrase)}</div><div style="text-align:center;margin:15px 0"><button data-action="falar-frase" class="ws-btn" style="background:#0F172A;color:#fff;border-radius:30px;padding:10px 20px;border:none;cursor:pointer">🔊 Ouvir Oráculo</button></div><div style="text-align:center;background:#F8FAFC;padding:20px;border-radius:12px;border:1px solid #E2E8F0"><p style="font-weight:bold">Sua vez:</p><button data-action="iniciar-voz" data-tipo="phrase" class="ws-btn" style="background:linear-gradient(135deg,#10B981,#059669);color:#fff;width:100%;border-radius:30px;padding:12px;border:none;font-weight:bold;cursor:pointer">🎤 Iniciar Sopro</button><div id="ig-speechResult" style="margin-top:15px"></div></div>`;
    },
    renderGameListenType(){
        this.desafioAtualObj=this.obterItemInteligente(this.state.phrases,'phrase'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        document.getElementById('ig-modalBody').innerHTML=`<div style="text-align:center;padding:20px"><div style="font-size:60px">🦉</div><h3>Escute e transcreva</h3><button data-action="falar-frase" class="ws-btn" style="background:#4F46E5;color:#fff;border-radius:30px;padding:10px 30px;border:none;cursor:pointer">🔊 Tocar Ecos</button><input id="ig-listenInput" class="ig-input" placeholder="Transcreve..." style="margin-top:20px;text-align:center;font-weight:bold"><button data-action="verificar-listen" class="ws-btn" style="width:100%;background:#10B981;color:#fff;margin-top:15px;border:none;padding:12px;border-radius:8px;cursor:pointer;font-weight:bold">Desvendar</button></div>`;
    },
    renderGameQuiz(){
        this.desafioAtualObj=this.obterItemInteligente(this.state.quizzes,'quiz'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const q=this.desafioAtualObj;
        document.getElementById('ig-modalBody').innerHTML=`<div class="ig-big-phrase" style="font-family:Cinzel">${Workspace.escapeHTML(q.question)}</div><div style="display:flex;flex-direction:column;gap:12px;margin-top:20px">${q.options.map((o,i)=>`<button data-action="verificar-quiz" data-index="${i}" class="ws-btn" style="background:#fff;border:2px solid #E2E8F0;padding:15px;border-radius:8px;cursor:pointer;text-align:left">${Workspace.escapeHTML(o)}</button>`).join('')}</div>`;
    },
    renderGameWordPicker(){
        this.desafioAtualObj=this.obterItemInteligente((this.state.wordPickers&&this.state.wordPickers.length?this.state.wordPickers:this.defaults.wordPickers),'picker'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const s=this.desafioAtualObj;
        document.getElementById('ig-modalBody').innerHTML=`<div class="ig-big-phrase" style="color:#4F46E5">${Workspace.escapeHTML(s.text)}</div><div style="display:flex;gap:10px;justify-content:center;margin-top:20px;flex-wrap:wrap">${s.options.map((o,i)=>`<button data-action="verificar-picker" data-index="${i}" class="ws-btn" style="background:#fff;border:2px solid #E2E8F0;padding:12px 25px;border-radius:30px;cursor:pointer;font-weight:bold">${Workspace.escapeHTML(o)}</button>`).join('')}</div>`;
    },
    renderGameSentenceShuffle(){
        this.desafioAtualObj=this.obterItemInteligente(this.state.phrases,'phrase'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const phrase=this.desafioAtualObj; const task=['Transforme numa Pergunta','Transforme numa Negativa'][Math.floor(Math.random()*2)];
        document.getElementById('ig-modalBody').innerHTML=`<div style="text-align:center"><span style="background:#0F172A;color:#fff;padding:8px 15px;border-radius:20px;font-size:12px">${task}</span></div><div class="ig-big-phrase" style="margin-top:15px">${Workspace.escapeHTML(phrase.phrase)}</div><textarea id="ig-input" class="ig-textarea" placeholder="Sua frase aqui..."></textarea><button data-action="verificar-envio" data-game="sentenceShuffle" data-bonus="50" class="ws-btn" style="width:100%;background:linear-gradient(135deg,#4F46E5,#3730A3);color:#fff;margin-top:15px;border:none;padding:15px;border-radius:8px;cursor:pointer;font-weight:bold">Submeter 🔀</button>`;
    },
    renderGameAnswerQuest(){
        this.desafioAtualObj=this.obterItemInteligente((this.state.questions&&this.state.questions.length?this.state.questions:this.defaults.questions),'question'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const q=this.desafioAtualObj;
        document.getElementById('ig-modalBody').innerHTML=`<div class="ig-big-phrase" style="background:#FEF3C7;border-color:#d4af37;color:#92400E;font-family:Cinzel">❓ ${Workspace.escapeHTML(q.text)}</div><textarea id="ig-input" class="ig-textarea" placeholder="Sua resposta em inglês..."></textarea><button data-action="verificar-envio" data-game="answerQuest" data-bonus="50" class="ws-btn" style="width:100%;margin-top:15px;background:linear-gradient(180deg,#d4af37,#996515);color:#fff;border:none;padding:15px;border-radius:8px;cursor:pointer;font-weight:bold">Enviar para o Mestre 🚀</button>`;
    },
    renderGameQuestionMaker(){
        const poolAnswers=this.state.pool.filter(p=>p.type==='answerQuest').map(p=>({id:p.id, text:p.text}));
        this.desafioAtualObj=poolAnswers.length?this.obterItemInteligente(poolAnswers,'qmaker'):null;
        if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const a=this.desafioAtualObj;
        document.getElementById('ig-modalBody').innerHTML=`<p style="color:#64748B;font-size:13px;text-align:center;font-weight:bold">Um aventureiro respondeu:</p><div class="ig-big-phrase" style="background:#EEF2FF;color:#4F46E5;font-style:italic">💬 "${Workspace.escapeHTML(a.text)}"</div><p style="margin-top:16px;font-weight:600;text-align:center">Que pergunta gerou esta resposta?</p><textarea id="ig-input" class="ig-textarea" placeholder="Ex: Why do you...?"></textarea><button data-action="verificar-envio" data-game="questionMaker" data-bonus="50" class="ws-btn" style="width:100%;background:linear-gradient(135deg,#4F46E5,#3730A3);color:#fff;margin-top:15px;border:none;padding:15px;border-radius:8px;cursor:pointer;font-weight:bold">Verificar no Espelho 🔮</button>`;
    },
    renderGameContextRole(){
        this.desafioAtualObj=this.obterItemInteligente((this.state.roleplays&&this.state.roleplays.length?this.state.roleplays:this.defaults.roleplays),'roleplay'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const c=this.desafioAtualObj;
        document.getElementById('ig-modalBody').innerHTML=`<div class="ig-big-phrase" style="font-family:Cinzel;text-align:left">${Workspace.escapeHTML(c.title)}<br><br><span style="font-size:14px;color:#64748B">${Workspace.escapeHTML(c.prompt)}</span></div><p style="font-size:12px;background:#FEF3C7;color:#92400E;padding:12px;border-radius:8px;font-weight:bold">💡 Dica: ${Workspace.escapeHTML(c.tip)}</p><textarea id="ig-input" class="ig-textarea" placeholder="O que dizes?"></textarea><button data-action="verificar-envio" data-game="contextRole" data-bonus="60" class="ws-btn" style="width:100%;margin-top:15px;background:linear-gradient(135deg,#10B981,#059669);color:#fff;border:none;padding:15px;border-radius:8px;cursor:pointer;font-weight:bold">Assumir Papel 🎭</button>`;
    },
    renderGameDebateAI(){
        if(!this.state._debateChat) this.state._debateChat=[];
        if(!this.desafioAtualObj || this.state._debateTopicId !== (this.desafioAtualObj?.id)){
            this.desafioAtualObj=this.obterItemInteligente((this.state.debates&&this.state.debates.length?this.state.debates:this.defaults.debates),'debate');
            if(!this.desafioAtualObj){
                this.desafioAtualObj={id:'temp_'+Date.now(), topic:'Is technology making us less human?', starter:'Technology connects us, but are we losing real connection?'};
            }
            this.state._debateTopicId=this.desafioAtualObj.id;
            if(this.state._debateChat.length===0){
                this.state._debateChat=[{role:'ai', text: this.desafioAtualObj.starter, source:'professor', inteligencia:'Mago Sábio'}];
            }
        }
        const topic=this.desafioAtualObj;
        const poolRelacionado = this.state.pool.filter(p=>p.type==='debateAI' || p.type==='answerQuest').slice(0,2);
        const inteligencias = {
            'Mago Sábio': {emoji:'🧙‍♂️', color:'#4F46E5', desc:'Socrático'},
            'Mago Rebelde': {emoji:'😈', color:'#dc2626', desc:'Advogado do Diabo'},
            'Mago Coletivo': {emoji:'🧠', color:'#d97706', desc:'Coletivo'},
            'Mago Gramático': {emoji:'📝', color:'#059669', desc:'Correção'},
            'Mago IA': {emoji:'🤖', color:'#0f172a', desc:'Contra'}
        };
        const chatHtml=this.state._debateChat.map(m=>{
            const isUser=m.role==='user';
            const intel = inteligencias[m.inteligencia||'Mago IA'] || inteligencias['Mago IA'];
            if(isUser){
                return `<div style="display:flex;gap:10px;margin-bottom:14px;justify-content:flex-end"><div style="background:linear-gradient(135deg,#4F46E5,#3730A3);color:#fff;padding:12px 16px;border-radius:18px 18px 4px 18px;max-width:78%;box-shadow:0 4px 12px rgba(79,70,229,0.25)"><div style="font-size:10px;opacity:0.8;letter-spacing:1px">VOCÊ</div><div style="font-size:14px;margin-top:4px;line-height:1.5;word-break:break-word">${Workspace.escapeHTML(m.text)}</div></div><div style="width:36px;height:36px;border-radius:50%;background:#E0E7FF;border:2px solid #818cf8;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">🧑‍🎓</div></div>`;
            }else{
                return `<div style="display:flex;gap:10px;margin-bottom:14px"><div style="width:36px;height:36px;border-radius:50%;background:#fff;border:2px solid ${intel.color};display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0"><img src="/assets/mago_bau_ingles.png" style="width:28px;height:28px;object-fit:cover" onerror="this.style.display='none'"><span style="font-size:16px">${intel.emoji}</span></div><div style="background:#fff;border:1.5px solid #E2E8F0;border-radius:4px 18px 18px 18px;padding:12px 14px;max-width:78%;box-shadow:0 2px 12px rgba(0,0,0,0.06)"><div style="display:flex;align-items:center;gap:6px"><b style="font-size:10px;color:${intel.color}">${(m.inteligencia||'Mago IA').toUpperCase()}</b><span style="font-size:9px;background:${intel.color}15;color:${intel.color};padding:2px 6px;border-radius:10px">${intel.desc}</span></div><div style="font-size:14px;color:#0f172a;margin-top:6px;line-height:1.5;word-break:break-word">${Workspace.escapeHTML(m.text)}</div>${m.grammar?`<div style="margin-top:8px;background:#FFFBEB;border:1px solid #fde68a;border-radius:8px;padding:8px;font-size:11px;color:#92400E">💡 ${Workspace.escapeHTML(m.grammar)}</div>`:''}</div></div>`;
            }
        }).join('');
        const coletivoHtml = poolRelacionado.length ? `<div style="background:linear-gradient(135deg,#FFFBEB,#FEF3C7);border:1.5px solid #f59e0b;border-radius:12px;padding:12px 14px;margin-bottom:14px"><div style="font-size:11px;font-weight:800;color:#92400E;margin-bottom:8px">🧠 COLETIVO • ${this.state.pool.length} debates</div>${poolRelacionado.map(p=>`<div style="font-size:12px;background:#fff;padding:8px 10px;border-radius:8px;margin-bottom:6px;border-left:3px solid #f59e0b">${Workspace.escapeHTML(p.text.substring(0,110))}...</div>`).join('')}</div>` : '';
        document.getElementById('ig-modalBody').innerHTML=`
            <div style="background:linear-gradient(135deg,#0f0f23 0%,#1e1b4b 100%);padding:14px 18px;border-radius:14px;margin-bottom:14px;border:2px solid #d4af37">
                <div style="display:flex;align-items:center;gap:12px">
                    <img src="/assets/mago_bau_ingles.png" style="width:48px;height:48px;border-radius:50%;border:2px solid #d4af37" />
                    <div style="flex:1"><div style="color:#fde68a;font-family:Cinzel,serif;font-weight:800;font-size:15px">⚔ ${Workspace.escapeHTML(topic.topic)} <span style="background:#d4af37;color:#000;font-size:9px;padding:2px 6px;border-radius:10px">CHAT AO VIVO</span></div><div style="color:#cbd5e1;font-size:11px;margin-top:2px">4 inteligências • ${this.state._debateChat.filter(m=>m.role==='user').length} trocas • Treino infinito</div></div>
                </div>
            </div>
            ${coletivoHtml}
            <div id="ig-debate-chat" style="display:flex;flex-direction:column;gap:4px;max-height:380px;overflow-y:auto;padding:14px;background:linear-gradient(180deg,#F8FAFC 0%,#F1F5F9 100%);border:2px solid #E2E8F0;border-radius:16px;margin-bottom:14px">${chatHtml}<div id="ig-debate-typing" style="display:none"><div style="display:flex;gap:10px;margin-bottom:14px"><div style="width:36px;height:36px;border-radius:50%;background:#fff;border:2px solid #4F46E5;display:flex;align-items:center;justify-content:center"><img src="/assets/mago_bau_ingles.png" style="width:28px;height:28px" /></div><div style="background:#fff;border:1.5px solid #E2E8F0;border-radius:4px 18px 18px 18px;padding:12px 16px"><div style="display:flex;gap:4px"><span style="width:8px;height:8px;background:#4F46E5;border-radius:50%;animation:bounce 1.4s infinite"></span><span style="width:8px;height:8px;background:#4F46E5;border-radius:50%;animation:bounce 1.4s infinite 0.2s"></span><span style="width:8px;height:8px;background:#4F46E5;border-radius:50%;animation:bounce 1.4s infinite 0.4s"></span></div><div style="font-size:10px;color:#64748B;margin-top:6px">Mago consultando 4 inteligências + Pollinations...</div></div></div></div>
            <div style="background:#fff;border:2px solid #E2E8F0;border-radius:14px;padding:10px;display:flex;gap:10px;align-items:flex-end"><textarea id="ig-input" class="ig-textarea" placeholder="Argumente em inglês..." style="min-height:70px;flex:1;border:none;box-shadow:none;resize:none" onkeydown="if(event.key==='Enter' && !event.shiftKey){event.preventDefault(); document.querySelector('[data-action=verificar-debate]')?.click();}"></textarea><button data-action="verificar-debate" style="background:linear-gradient(135deg,#4F46E5,#3730A3);color:#fff;border:none;width:48px;height:48px;border-radius:12px;cursor:pointer;font-size:20px;display:flex;align-items:center;justify-content:center;flex-shrink:0">➤</button></div>
            <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap"><span style="font-size:10px;background:#EEF2FF;color:#4338ca;padding:4px 8px;border-radius:20px">🧙‍♂️ Sábio</span><span style="font-size:10px;background:#FEE2E2;color:#dc2626;padding:4px 8px;border-radius:20px">😈 Rebelde</span><span style="font-size:10px;background:#FFFBEB;color:#d97706;padding:4px 8px;border-radius:20px">🧠 Coletivo</span><span style="font-size:10px;background:#D1FAE5;color:#059669;padding:4px 8px;border-radius:20px">📝 Gramático</span></div><style>@keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}</style>
        `;
        const chatDiv=document.getElementById('ig-debate-chat');
        if(chatDiv) chatDiv.scrollTop=chatDiv.scrollHeight;
    },

    async checarGramaticaIngles(texto){
        try{
            const params = new URLSearchParams();
            params.append('language','en-US');
            params.append('text', texto);
            const res = await fetch('https://api.languagetool.org/v2/check', {method:'POST', body:params});
            if(res.ok){
                const data = await res.json();
                if(data.matches && data.matches.length>0){
                    const first = data.matches[0];
                    return first.message + (first.replacements && first.replacements[0] ? ` → "${first.replacements[0].value}"` : '');
                }
            }
        }catch(e){}
        return null;
    },
    async gerarContraArgumentoIA(topic, userText, historico){
        const poolTexts = this.state.pool.filter(p=>p.text).slice(0,5).map(p=>p.text.substring(0,100)).join(' | ');
        const inteligenciasPool = ['Mago Sábio','Mago Rebelde','Mago Coletivo','Mago IA'];
        const intelEscolhida = inteligenciasPool[historico % inteligenciasPool.length];
        let promptBase = '';
        if(intelEscolhida==='Mago Sábio'){
            promptBase = `You are Mago Sábio, Socratic tutor. Ask deep Socratic question. Topic: "${topic.topic}". Student: "${userText}". B2, concise.`;
        }else if(intelEscolhida==='Mago Rebelde'){
            promptBase = `You are Mago Rebelde, Devil's Advocate. Strongly counter-argue. Topic: "${topic.topic}". Student: "${userText}". Collective: "${poolTexts}". Be provocative, 2 sentences, B2.`;
        }else if(intelEscolhida==='Mago Coletivo'){
            promptBase = `You are Mago Coletivo, collective intelligence. Topic: "${topic.topic}". Student: "${userText}". Others said: "${poolTexts}". Synthesize and challenge. B2, 2 sentences.`;
        }else{
            promptBase = `You are Mago IA, debate opponent. Topic: "${topic.topic}". Professor: "${topic.starter||''}". Student: "${userText}". Collective: "${poolTexts}". Counter-argument, B2, 2-3 sentences, with question.`;
        }
        try{
            const controller = new AbortController();
            const timeout = setTimeout(()=>controller.abort(), 7000);
            const res = await fetch('https://text.pollinations.ai/' + encodeURIComponent(promptBase), { signal: controller.signal });
            clearTimeout(timeout);
            if(res.ok){
                let txt = await res.text();
                txt = txt.trim().replace(/^["']|["']$/g,'').substring(0,400);
                if(txt.length>20) return {text: txt, inteligencia: intelEscolhida};
            }
        }catch(e){}
        const fallbacks={
            'Mago Sábio': `If "${userText.substring(0,50)}..." is true, what would happen if everyone thought like you? What hidden assumptions are there?`,
            'Mago Rebelde': `You defend "${userText.substring(0,40)}...", but ${this.state.pool.length} students argued differently: "${poolTexts.substring(0,80)}...". How do you respond?`,
            'Mago Coletivo': `Collective intelligence: ${this.state.pool.length} debates. Some said "${poolTexts.substring(0,100)}...". Where do you stand?`,
            'Mago IA': `Valid, but long-term impact? Can you give concrete example for "${userText.substring(0,30)}..."?`
        };
        return {text: fallbacks[intelEscolhida] || fallbacks['Mago IA'], inteligencia: intelEscolhida};
    },
    renderGameMinimalPairs(){

        this.desafioAtualObj=this.obterItemInteligente((this.state.minimalPairs&&this.state.minimalPairs.length?this.state.minimalPairs:this.defaults.minimalPairs),'minimal'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const pair=this.desafioAtualObj; const target=Math.random()>0.5?pair.a:pair.b; this.state._minimalTarget=target;
        document.getElementById('ig-modalBody').innerHTML=`<div style="text-align:center"><h3 style="font-family:Cinzel">👄 Sussurros Gêmeos</h3><div style="background:#0F172A;padding:20px;border-radius:16px;margin-top:20px"><button data-action="falar-frase" data-text="${target}" class="ws-btn" style="background:linear-gradient(135deg,#4F46E5,#3730A3);color:#fff;padding:12px 30px;border-radius:30px;border:2px solid #fff;cursor:pointer">🎧 Ouvir Sussurro</button><div style="display:flex;gap:10px;justify-content:center;margin-top:20px"><button data-action="verificar-minimal" data-choice="${pair.a}" class="ws-btn" style="background:#fff;padding:12px 30px;border-radius:8px;cursor:pointer;font-weight:bold">${pair.a}</button><button data-action="verificar-minimal" data-choice="${pair.b}" class="ws-btn" style="background:#fff;padding:12px 30px;border-radius:8px;cursor:pointer;font-weight:bold">${pair.b}</button></div></div></div>`;
    },
    renderGamePicturePop(){
        this.desafioAtualObj=this.obterItemInteligente(this.state.pictures,'picture'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const pic=this.desafioAtualObj;
        document.getElementById('ig-modalBody').innerHTML=`<div style="text-align:center"><div style="width:150px;height:150px;border-radius:24px;background:#F8FAFC;border:4px solid #d4af37;display:flex;align-items:center;justify-content:center;margin:20px auto;font-size:80px">${pic.emoji}</div><div style="background:#0F172A;padding:20px;border-radius:16px;border:2px solid #333"><p style="color:#fff;font-weight:bold">Fale o nome:</p><button data-action="iniciar-voz" data-tipo="picture" class="ws-btn" style="background:linear-gradient(135deg,#10B981,#059669);color:#fff;width:100%;border-radius:30px;padding:12px;border:none;font-weight:bold;cursor:pointer">🎤 Falar Nome</button><div id="ig-speechResult" style="margin-top:15px"></div><input id="ig-input" class="ig-input" placeholder="Ou digita..." style="margin-top:15px;text-align:center"><button data-action="verificar-picture-text" class="ws-btn" style="width:100%;background:#fff;color:#0F172A;margin-top:10px;padding:12px;border-radius:8px;cursor:pointer;font-weight:bold">Verificar Visão</button></div></div>`;
    },
    iniciarReconhecimentoDeVoz(esperado, itemObj, tipoConteudo){
        const btn=document.getElementById('ig-modalBody').querySelector('[data-action="iniciar-voz"]');
        const resEl=document.getElementById('ig-speechResult');
        if(!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)){ Workspace.mostrarAviso('Navegador sem voz','warning'); return; }
        const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
        this.recognition=new SR(); this.recognition.lang='en-US'; this.recognition.interimResults=false; this.recognition.maxAlternatives=1;
        if(btn){ btn.innerText='🎧 Escutando...'; btn.style.background='#F59E0B'; }
        this.recognition.start();
        this.recognition.onresult=(e)=>{
            const falado=e.results[0][0].transcript;
            if(btn){ btn.style.background='#0F172A'; btn.innerText=`Lido: "${falado}"`; }
            const sim=this.similaridade(falado, esperado);
            if(sim>=0.75){ if(resEl) resEl.innerHTML=`<div style="background:#D1FAE5;color:#065F46;padding:10px;border-radius:8px;font-weight:bold">✅ Perfeito!</div>`; if(itemObj) this.updateSRS(itemObj.id, tipoConteudo, true); this.superarErro(itemObj?.id); this.sucessoGenerico(75); }
            else { if(resEl) resEl.innerHTML=`<div style="background:#FEE2E2;color:#B91C1C;padding:10px;border-radius:8px">❌ Entendi: "${falado}"</div>`; if(itemObj) this.registrarErro(itemObj, tipoConteudo); this.falhaGenerica(); }
        };
        this.recognition.onerror=()=>{ if(btn){ btn.style.background='#10B981'; btn.innerText='🎤 Tentar novamente'; } Workspace.mostrarAviso('Não ouvi','error'); };
    }
};
