// js/modulos/workspace/ingles.js - V2.1 (A+B+C) - TimerService + EventDelegation + SRS
window.Workspace = window.Workspace || {};

/* ===================== SERVICES ===================== */

// [B] VoiceService - 100% masculino blindado
const VoiceService = (() => {
    let cache = null, resolver = null;
    const ready = new Promise(r => resolver = r);
    const FEMALE_BLOCK = ['female','samantha','zira','karen','victoria','tessa','moira','siri','veena','fiona','susan','heather','jenny','aria','emma','michelle','zira'];
    const SCORE = [{k:'david',s:1000},{k:'daniel',s:950},{k:'google uk english male',s:900},{k:'mark',s:850},{k:'alex',s:800},{k:'arthur',s:700},{k:'oliver',s:700}];
    const pick = (voices) => {
        const en = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
        if(!en.length) return null;
        const pool = en.filter(v => !FEMALE_BLOCK.some(f => (v.name+v.voiceURI).toLowerCase().includes(f)));
        const base = pool.length ? pool : en;
        return base.map(v=>{
            const id=(v.name+' '+v.voiceURI).toLowerCase();
            let sc=100; SCORE.forEach(o=>{ if(id.includes(o.k)) sc=o.s; });
            if(id.includes('male') && !id.includes('female')) sc+=200;
            return {v, sc};
        }).sort((a,b)=>b.sc-a.sc)[0]?.v || null;
    };
    const init = () => {
        const vs = window.speechSynthesis?.getVoices() || [];
        if(vs.length){ cache = pick(vs); resolver(cache); }
    };
    if('speechSynthesis' in window){
        window.speechSynthesis.onvoiceschanged = init;
        init(); setTimeout(init, 500);
    }
    return {
        ready, getVoice:()=>cache,
        falar: async (text, {rate=0.95, isMago=false}={})=>{
            if(!('speechSynthesis' in window)) return;
            await ready; window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
            const voz = cache || pick(window.speechSynthesis.getVoices());
            if(voz){ u.voice=voz; u.lang=voz.lang; u.pitch=isMago?(isMobile?0.6:0.8):0.92; }
            else { u.lang=isMobile?'en-GB':'en-US'; u.pitch=isMago?0.2:0.4; }
            u.rate = isMago?0.85:rate; window.speechSynthesis.speak(u);
            return new Promise(res=>{ u.onend=res; u.onerror=res; });
        }
    };
})();

// [A] TimerService - sem leak de setInterval
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
    pause(){ this._paused=true; },
    resume(){ this._paused=false; },
    stop(){ if(this._id){ clearInterval(this._id); this._id=null; } }
};

// [A] ParticleEngine - DocumentFragment + auto-cleanup
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
            document.querySelectorAll('.ig-fireball,.ig-sparkle,.ig-magic-dust').forEach(e=>e.remove());
            this._exploding=false;
        },2600);
    }
};

// [C] SRSService - SM-2 com data
const SRSService = {
    calc(success, entry){
        const now=Date.now();
        let {ease=2.5, interval=0, repetitions=0, lapses=0} = entry||{};
        if(success){
            if(repetitions===0) interval=1;
            else if(repetitions===1) interval=6;
            else interval=Math.round(interval*ease);
            repetitions++;
            ease = Math.min(3.0, ease + 0.05);
        }else{
            lapses++; repetitions=0; interval=0;
            ease = Math.max(1.3, ease - 0.2);
        }
        // se acertou: interval em dias. se errou: volta em 2 minutos (pra mesma sessão)
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
    bauDestrancado:false, tempoGlobalDefinido:false, sessaoEncerrada:false,
    jogoAtual:null, tempoRestante:0, xpGanhosNaSessao:0, desafioAtualObj:null, digitandoAtivo:false, magoIntervalTimer:null, sseListenerConfigurado:false,

    defaults: {
        magoConfig:{ vozAtiva:true, modoExibicao:'aleatorio' },
        magoPhrases:[{id:'m1',text:'Let us go! (citarAluno)'},{id:'m2',text:'Welcome again!'},{id:'m3',text:'Choose one!'}],
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
    sincronizarTempoReal: async function(){ await this.loadDados(); const hub=document.getElementById('ig-alunoView'); if(hub && hub.style.display!=='none' && Workspace.usuario.tipo==='Aluno') this.iniciarFalaGuardiao(true); const tab=document.querySelector('.ig-side-item.active'); if(tab && Workspace.usuario.tipo!=='Aluno') this.renderProfessorTab(tab.dataset.tab); },

    // [C] load/save com SRS
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
                this.state.submissions = Array.isArray(d.submissions)?d.submissions:[];
                this.state.pool = Array.isArray(d.pool)?d.pool:[];
                this.state.errosRetidos = Array.isArray(d.errosRetidos)?d.errosRetidos:[];
                this.state.magoPhrases = Array.isArray(d.magoPhrases)&&d.magoPhrases.length?d.magoPhrases:[...this.defaults.magoPhrases];
                this.state.magoConfig = (d.magoConfig&&typeof d.magoConfig==='object')?d.magoConfig:{...this.defaults.magoConfig};
                this.state.srs = (d.srs&&typeof d.srs==='object')?d.srs:{};
            }else{
                this.state.words=[...this.defaults.words]; this.state.phrases=[...this.defaults.phrases];
                this.state.quizzes=[...this.defaults.quizzes]; this.state.pictures=[...this.defaults.pictures];
                this.state.submissions=[]; this.state.pool=[]; this.state.errosRetidos=[]; this.state.magoPhrases=[...this.defaults.magoPhrases];
                this.state.magoConfig={...this.defaults.magoConfig}; this.state.srs={};
            }
            const userK=`ws_ingles_user_${Workspace.usuario.id}`;
            this.state.xp=parseInt(localStorage.getItem(`${userK}_xp`)||'0');
            this.state.streak=parseInt(localStorage.getItem(`${userK}_streak`)||'1');
            this.state.itensConcluidos=JSON.parse(localStorage.getItem(`${userK}_concluidos`)||'[]');
            // SRS local merge (local tem prioridade se mais novo)
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
                submissions:this.state.submissions, pool:this.state.pool, errosRetidos:this.state.errosRetidos,
                magoPhrases:this.state.magoPhrases, magoConfig:this.state.magoConfig, srs:this.state.srs
            });
        }catch{}
    },

    // [C] SRS core
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
        // não chama update aqui, chama no sucessoGenerico
    },
    marcarComoConcluido(itemId){
        if(!itemId) return;
        if(!this.state.itensConcluidos.includes(itemId)){
            this.state.itensConcluidos.push(itemId);
        }
    },

    // [C] obterItemInteligente com SRS de verdade
    obterItemInteligente(listaPadrao, tipoConteudo){
        if(!Array.isArray(listaPadrao) || !listaPadrao.length) return null;
        const now=Date.now();
        const concluidos=this.state.itensConcluidos||[];
        // 1. Mapeia com SRS
        const comSRS=listaPadrao.map(item=>{
            const srs=this.state.srs[item.id];
            return {item, srs, isDue: srs ? srs.due <= now : false, isNew: !srs || srs.repetitions===0};
        });
        // 2. Itens vencidos (due) - prioridade máxima
        const vencidos=comSRS.filter(e=>e.srs && e.isDue).sort((a,b)=>a.srs.due - b.srs.due);
        if(vencidos.length){
            // 80% chance de pegar o mais vencido, 20% outro vencido pra variar
            if(Math.random()<0.8) return vencidos[0].item;
            return vencidos[Math.floor(Math.random()*Math.min(3,vencidos.length))].item;
        }
        // 3. Erros retidos recentes (compatibilidade)
        const retidos=this.state.errosRetidos.filter(e=>e._tipoDefeito===tipoConteudo && !concluidos.includes(e.id));
        if(retidos.length && Math.random()<0.6){
            return retidos[Math.floor(Math.random()*retidos.length)];
        }
        // 4. Novos (nunca vistos)
        const novos=comSRS.filter(e=>e.isNew && !concluidos.includes(e.item.id));
        if(novos.length){
            return novos[Math.floor(Math.random()*novos.length)].item;
        }
        // 5. Itens ainda não feitos na sessão, mas que já foram vistos hoje (interval >0 mas não due) - evita loop
        const disponiveis=listaPadrao.filter(i=>!concluidos.includes(i.id));
        if(!disponiveis.length){
            // [C] Se tudo foi feito hoje mas tem SRS futuro, jornada acabou POR HOJE
            // Retorna null pra mostrar tela de triunfo, mas amanhã os due voltam
            return null;
        }
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

    // [B] CSS sem @import
    injetarCSS(){
        if(document.getElementById('ws-ingles-css')) return;
        if(!document.querySelector('link[data-ig-font]')){
            const l=document.createElement('link'); l.rel='stylesheet'; l.href='https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=VT323&display=swap'; l.setAttribute('data-ig-font','1'); document.head.appendChild(l);
        }
        const style=document.createElement('style'); style.id='ws-ingles-css';
        style.textContent=`
            #ws-ingles-container{background:#F8FAFC;border-radius:16px;overflow:visible;min-height:80vh;position:relative;display:flex;flex-direction:column}
            .ig-header{background:#1a1a2e;padding:15px 30px;display:flex;justify-content:space-between;align-items:center;border-bottom:4px solid #f1c40f;position:sticky;top:0;z-index:9999}
            .ig-title{display:flex;align-items:center;gap:20px}
            .ig-bau-topo{width:65px;filter:drop-shadow(0 0 10px #f1c40f);transition:0.3s}
            .ig-rpg-hud{display:flex;gap:12px;background:linear-gradient(180deg,#1a1a2e 0%,#000 100%);padding:8px 15px;border-radius:12px;border:2px solid #d4af37;color:#fff;font-family:VT323,monospace;font-size:20px;align-items:center}
            .ig-hud-stat{display:flex;gap:6px;background:rgba(255,255,255,0.1);padding:4px 10px;border-radius:6px;border:1px solid rgba(212,175,55,0.3)}
            .ig-games-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;padding:20px 0 30px 0}
            .ig-game-card{background:#fffcf0;border:2px solid #d4af37;border-radius:8px;padding:20px;cursor:pointer;transition:0.3s}
            .ig-game-card:hover{transform:translateY(-5px);box-shadow:0 10px 15px rgba(212,175,55,0.4)}
            .chest-shake{animation:chestShake 0.4s infinite} @keyframes chestShake{0%,100%{transform:translate(1px,-2px) rotate(-5deg)}50%{transform:translate(-1px,2px) rotate(5deg)}}
            .chest-explode{animation:chestExplode 1.2s forwards;z-index:9999999!important} @keyframes chestExplode{0%{transform:scale(1)}20%{transform:scale(3.5) translateY(20px);filter:brightness(2.5) drop-shadow(0 0 150px #fff)}100%{transform:scale(1)}}
            @keyframes shockwave{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(-50%,-50%) scale(400);opacity:0}}
            .ig-fireball{position:fixed;border-radius:50%;box-shadow:0 0 15px currentColor;pointer-events:none;z-index:9999999;animation:shootParticle 1.5s cubic-bezier(0.1,0.8,0.2,1) forwards}
            .ig-sparkle{position:fixed;clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);pointer-events:none;z-index:9999999;animation:shootParticle 2s forwards}
            @keyframes shootParticle{0%{transform:translate(0,0) scale(1) rotate(0deg);opacity:1}100%{transform:translate(var(--tx),var(--ty)) scale(0) rotate(1080deg);opacity:0}}
            .ig-guardian-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:55vh;background:radial-gradient(circle at center,#1a0b2e 0%,#000 100%);border-radius:0 0 16px 16px;border:4px solid #333;padding:30px 20px}
            .ig-balao-fala-static{background:linear-gradient(180deg,#0f172a 0%,#000 100%);padding:20px 25px;border-radius:12px;border:3px solid #f1c40f;color:#fff;font-family:VT323,monospace;font-size:24px}
            .ig-global-timer{font-family:VT323,monospace;font-size:24px;color:#ff4757;display:none;align-items:center;letter-spacing:2px;background:rgba(0,0,0,0.5);padding:4px 10px;border-radius:6px;border:1px dashed #ff4757}
            .ig-input,.ig-textarea{width:100%;padding:12px 15px;border:1px solid #E2E8F0;border-radius:10px;box-sizing:border-box}
            .ig-sidebar{width:250px;background:#fff;border-right:1px solid #E2E8F0;padding:20px;display:flex;flex-direction:column;gap:5px}
            .ig-side-item{background:transparent;border:none;padding:12px 15px;border-radius:10px;text-align:left;font-weight:bold;color:#64748B;cursor:pointer}
            .ig-side-item.active{background:#0F172A;color:#fff}
            .ig-card{background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:20px;margin-bottom:20px}
            .ig-list-item{display:flex;justify-content:space-between;padding:10px;border-bottom:1px solid #eee;align-items:center}
            .ig-big-phrase{font-size:22px;font-weight:bold;text-align:center;padding:20px;background:#F8FAFC;border:1px dashed #E2E8F0;border-radius:14px;margin:15px 0;color:#1E293B}
            @media(max-width:768px){#ws-ingles-container{min-height:100vh;border-radius:0}.ig-header{flex-direction:column}.ig-bau-topo{width:100px!important}.ig-rpg-hud{width:100%}.ig-guardian-container{flex:1;min-height:60vh}}
        `;
        document.head.appendChild(style);
    },

    // [B] HTML sem onclick
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
            <div id="ig-alunoView" style="display:none;padding:30px"><div id="ig-hub-mago-text" style="display:none"></div><div id="ig-gamesGrid" class="ig-games-grid"></div></div>
            <div id="ig-timeout-screen" style="display:none;flex-direction:column;align-items:center;justify-content:center;min-height:60vh"><h1 style="font-family:Cinzel">O tempo esgotou!</h1><div id="ig-timeout-xp" style="font-size:42px;color:#f1c40f">+0 XP</div><button data-action="encerrar-sessao" class="ws-btn" style="background:#d4af37;color:#fff;padding:12px 35px;border-radius:4px;border:2px solid #fff;cursor:pointer">Guardar e Sair</button></div>
            <div id="ig-professorView" style="display:none;min-height:70vh"><div class="ig-sidebar">
                <button data-action="render-tab" data-tab="mago" class="ig-side-item">🧙 Mago IA</button>
                <button data-action="render-tab" data-tab="biblioteca" class="ig-side-item active">📚 Biblioteca</button>
                <button data-action="render-tab" data-tab="imagens" class="ig-side-item">🖼 Imagens</button>
                <button data-action="render-tab" data-tab="envios" class="ig-side-item">📥 Envios <span id="ig-pendingCount" style="background:#F59E0B;color:#fff;padding:2px 6px;border-radius:10px;font-size:11px">0</span></button>
                <button data-action="render-tab" data-tab="algoritmo" class="ig-side-item">🧠 Algoritmo</button>
            </div><div id="ig-tab-content" style="flex:1;padding:30px;background:#F8FAFC"></div></div>
            <div id="ig-gameModal" style="display:none;position:fixed;inset:0;background:rgba(15,23,42,0.85);z-index:1000000;align-items:center;justify-content:center;backdrop-filter:blur(8px)">
                <div class="ws-card" style="width:90%;max-width:650px;background:#fffcf0;border:4px solid #d4af37;border-radius:8px;display:flex;flex-direction:column;max-height:90vh">
                    <div style="padding:15px 20px;border-bottom:2px dashed #d4af37;display:flex;justify-content:space-between;align-items:center"><div><span id="ig-modalIcon" style="font-size:28px"></span> <h2 id="ig-modalTitle" style="display:inline;margin:0;font-family:Cinzel"></h2></div><div style="display:flex;gap:15px"><button data-action="abrir-mini-hub" style="background:#0F172A;color:#fff;border:2px solid #d4af37;padding:8px 12px;border-radius:8px;cursor:pointer">🔄 Mudar</button><button data-action="fechar-jogo" style="background:transparent;border:none;font-size:35px;cursor:pointer;color:#e74c3c">×</button></div></div>
                    <div id="ig-modalBody" style="padding:30px;overflow-y:auto;flex:1"></div>
                </div>
            </div>`;
    },

    // [B] Delegation central
    bindEvents(){
        const root=document.getElementById('ws-ingles-container');
        if(!root || root._bound) return; root._bound=true;

        root.addEventListener('click', e=>{
            const b=e.target.closest('[data-action]'); if(!b) return;
            const a=b.dataset.action;
            switch(a){
                case 'aceitar-tempo':{
                    const campo=document.getElementById('ig-tempo-escolhido'); const m=parseInt(campo.value)||0;
                    if(m<=0){ Workspace.mostrarAviso('Digite um tempo válido!','warning'); campo.focus(); return; }
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
            }
        });
        root.addEventListener('change', e=>{
            if(e.target.id==='mago-voz-toggle' || e.target.id==='mago-modo-select') this.atualizarConfigMago();
        });

        const modal=document.getElementById('ig-modalBody');
        modal.addEventListener('click', e=>{
            const b=e.target.closest('[data-action]'); if(!b) return;
            const cur=this.desafioAtualObj;
            const input=document.getElementById('ig-input')?.value?.trim()||'';
            const listen=document.getElementById('ig-listenInput')?.value?.trim()||'';

            if(b.dataset.action==='falar-frase'){
                if(cur?.phrase) VoiceService.falar(cur.phrase);
                else if(cur?.word) VoiceService.falar(cur.word);
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
                if(b.dataset.game==='questionMaker' && (!input.includes('?') || input.split(' ').length<3)){
                    return Workspace.mostrarAviso('Pergunta precisa ter ? e 3 palavras','error');
                }
                this.envioAoProfessor(b.dataset.game, input, parseInt(b.dataset.bonus||'50'));
            }
        });
    },

    renderizarVisualizacao(){
        document.getElementById('ig-xpCount').textContent=this.state.xp;
        document.getElementById('ig-streakCount').textContent=this.state.streak;
        const chest=document.getElementById('ig-header-chest');
        if(chest){ chest.classList.remove('chest-shake','chest-explode'); chest.style.transform='scale(1)'; chest.src='/assets/bau_roxo_pixel.png'; }
        const isAluno=Workspace.usuario.tipo==='Aluno';
        if(!isAluno){
            document.getElementById('ig-professorView').style.display='flex';
            document.getElementById('ig-alunoView').style.display='none';
            document.getElementById('ig-guardian-screen').style.display='none';
            document.getElementById('ig-timeout-screen').style.display='none';
            const aba=localStorage.getItem('ws_ingles_aba_prof')||'biblioteca';
            this.renderProfessorTab(aba);
        }else{
            document.getElementById('ig-professorView').style.display='none';
            document.getElementById('ig-guardian-screen').style.display='none';
            document.getElementById('ig-alunoView').style.display='none';
            document.getElementById('ig-gameModal').style.display='none';
            document.getElementById('ig-timeout-screen').style.display='none';
            if(this.sessaoEncerrada){
                document.getElementById('ig-timeout-screen').style.display='flex';
                document.getElementById('ig-timeout-xp').innerText=`+${this.xpGanhosNaSessao} XP ⭐`;
            }else if(!this.tempoGlobalDefinido){
                document.getElementById('ig-guardian-screen').style.display='flex';
            }else{
                document.getElementById('ig-alunoView').style.display='block';
                this.renderAlunoGrid();
            }
        }
    },
    renderAlunoGrid(){
        const grid=document.getElementById('ig-gamesGrid'); if(!grid) return;
        const now=Date.now();
        const dueCount=Object.values(this.state.srs).filter(s=>s.due<=now).length;
        grid.innerHTML=this.defaults.games.map(g=>{
            const srsForGame=Object.values(this.state.srs).filter(s=>s.tipo===g.id && s.due<=now).length;
            return `<div class="ig-game-card" data-action="abrir-jogo" data-game-id="${g.id}">
                <div class="ig-top"><div class="ig-icon" style="background:${g.color}">${g.icon}</div><span class="ig-badge" style="background:#1a1a2e;color:#f1c40f">${g.level}</span></div>
                <h3>${g.title} ${srsForGame?'🔥':''}</h3><p>${g.desc}</p>
                <div class="ig-meta"><span class="ig-badge" style="background:#F1F5F9">⭐ +${['picturePop','minimalPairs','debateAI'].includes(g.id)?'75':'50'} XP</span> ${srsForGame?`<span style="font-size:11px;color:#e74c3c;font-weight:bold">${srsForGame} pra revisar</span>`:''}</div>
            </div>`;
        }).join('');
    },

    // [A] Baú com ParticleEngine + TimerService
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
            if(chest){ chest.classList.remove('chest-shake'); chest.classList.add('chest-explode'); chest.src='/assets/bau_roxo_pixel_aberto.png'; }
            const rect=chest?.getBoundingClientRect()||{left:innerWidth/2, top:50, width:0, height:0};
            ParticleEngine.explode(rect.left+rect.width/2, rect.top+rect.height/2);
            try{ new Audio('https://actions.google.com/sounds/v1/weapons/large_explosion.ogg').play().catch(()=>{}); }catch{}
            setTimeout(()=>{
                this.tempoGlobalDefinido=true; this.xpGanhosNaSessao=0;
                // [C] zera concluidos da sessão pra SRS recomeçar limpo
                const userK=`ws_ingles_user_${Workspace.usuario.id}`;
                this.state.itensConcluidos=[]; localStorage.setItem(`${userK}_concluidos`, JSON.stringify([]));
                this.iniciarTimerGlobal(minutos*60);
                this.renderizarVisualizacao();
                setTimeout(()=>this.iniciarFalaGuardiao(),500);
            },1000);
        },1500);
    },
    encerrarSessaoBau(){
        TimerService.stop(); this.tempoGlobalDefinido=false; this.sessaoEncerrada=false; this.digitandoAtivo=false;
        if(this.magoIntervalTimer) clearInterval(this.magoIntervalTimer);
        const balao=document.getElementById('ig-hub-mago-text'); if(balao) balao.style.display='none';
        Workspace.navegarPara('feed');
    },
    iniciarFalaGuardiao(forcarRestart=false){
        if(this.digitandoAtivo && !forcarRestart) return; this.digitandoAtivo=true;
        if(this.magoIntervalTimer) clearInterval(this.magoIntervalTimer);
        const balao=document.getElementById('ig-hub-mago-text')||document.getElementById('ig-guardian-screen')?.querySelector('.ig-balao-fala-static');
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
        const nome=(Workspace.usuario?.nome||Workspace.usuario?.login||'Aventureiro').split(' ')[0];
        const nomeReal=nome.toLowerCase()==='teste'?(Workspace.usuario.tipo==='Aluno'?'Aventureiro':'Professor'):nome;
        const regex=/(?:\(citarAluno\)|citarAluno|\$\{aluno\.nome\}|\{\{aluno\.nome\}\})/gi;
        const fraseAudio=fraseBruta.replace(regex, nomeReal);
        const fraseVisual=fraseBruta.replace(regex, nomeReal.toUpperCase());
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

    // Professor sem onclick
    renderProfessorTab(tabId){
        localStorage.setItem('ws_ingles_aba_prof', tabId);
        document.querySelectorAll('.ig-side-item').forEach(b=>b.classList.remove('active'));
        document.querySelector(`.ig-side-item[data-tab="${tabId}"]`)?.classList.add('active');
        const content=document.getElementById('ig-tab-content');
        const state=this.state; const configMago=state.magoConfig||this.defaults.magoConfig;
        if(tabId==='mago'){
            content.innerHTML=`<div class="ig-card"><h3>🧙 Inteligência do Guardião</h3>
                <div style="background:#f8fafc;padding:15px;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:20px;display:flex;gap:20px;flex-wrap:wrap">
                    <label style="display:flex;gap:8px;font-weight:bold;cursor:pointer"><input type="checkbox" id="mago-voz-toggle" ${configMago.vozAtiva?'checked':''}> 🔊 Voz</label>
                    <select id="mago-modo-select" class="ig-input" style="width:auto"><option value="aleatorio" ${configMago.modoExibicao==='aleatorio'?'selected':''}>🎲 Aleatório</option><option value="sequencial" ${configMago.modoExibicao==='sequencial'?'selected':''}>🔢 Sequencial</option><option value="fixa" ${configMago.modoExibicao==='fixa'?'selected':''}>📌 Fixa</option></select>
                </div>
                <div style="background:#fff;padding:15px;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:20px;display:flex;gap:10px">
                    <input id="nwMago" class="ig-input" placeholder="Nova fala... use (citarAluno)"><button data-action="salvar-mago-phrase" id="btn-salvar-mago" style="background:#4F46E5;color:#fff;border:none;padding:10px 15px;border-radius:8px;font-weight:bold;cursor:pointer">${state.editingMagoId?'Atualizar':'Salvar'}</button>
                    <button data-action="inserir-variavel-mago" style="background:#8e44ad;color:#fff;border:none;padding:6px 12px;border-radius:20px;font-size:11px;cursor:pointer">+ (citarAluno)</button>
                </div>
                <div id="ws-mago-lista-falas">${state.magoPhrases.map((m,i)=>`<div class="ig-list-item" draggable="true" data-id="${m.id}" style="background:#fff;border:1px solid #eee;border-left:4px solid #4F46E5;border-radius:8px;margin-bottom:8px"><span>${i+1}. ${Workspace.escapeHTML(m.text)}</span><div style="display:flex;gap:8px"><button data-action="editar-mago-phrase" data-id="${m.id}" style="background:#fff8e1;border:1px solid #fdebd0;border-radius:6px;color:#f39c12;cursor:pointer">✏</button><button data-action="remover-item" data-key="magoPhrases" data-id="${m.id}" style="background:#fdf2f2;border:1px solid #fadbd8;border-radius:6px;color:#e74c3c;cursor:pointer">✕</button></div></div>`).join('')}</div></div>`;
            // drag
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
                lista.addEventListener('dragend', e=>{ e.target.style.opacity='1'; });
            }
        }else if(tabId==='biblioteca'){
            content.innerHTML=`<div class="ig-card"><h3>📚 Biblioteca</h3></div>
                <div style="display:flex;gap:20px;flex-wrap:wrap"><div class="ig-card" style="flex:1;min-width:300px"><h3>Palavras (${state.words.length})</h3><div style="display:flex;gap:10px;margin-bottom:15px"><input id="nwWord" class="ig-input" placeholder="Inglês"><input id="nwTrans" class="ig-input" placeholder="Tradução"><button data-action="add-word" style="background:#4F46E5;color:#fff;border:none;padding:10px 15px;border-radius:8px;cursor:pointer">Add</button></div><div>${state.words.map(w=>`<div class="ig-list-item"><span><b>${w.word}</b> - ${w.translation}</span><button data-action="remover-item" data-key="words" data-id="${w.id}" style="color:#e74c3c;background:transparent;border:none;cursor:pointer">✕</button></div>`).join('')}</div></div>
                <div class="ig-card" style="flex:1;min-width:300px"><h3>Frases (${state.phrases.length})</h3><div style="display:flex;gap:10px;margin-bottom:15px"><textarea id="nwPhrase" class="ig-textarea" style="min-height:45px" placeholder="Nova frase"></textarea><button data-action="add-phrase" style="background:#4F46E5;color:#fff;border:none;padding:10px 15px;border-radius:8px;cursor:pointer">Add</button></div><div>${state.phrases.map(p=>`<div class="ig-list-item"><span>${p.phrase}</span><button data-action="remover-item" data-key="phrases" data-id="${p.id}" style="color:#e74c3c;background:transparent;border:none;cursor:pointer">✕</button></div>`).join('')}</div></div></div>`;
        }else if(tabId==='algoritmo'){
            const total=Object.keys(state.srs).length;
            const due=Object.values(state.srs).filter(s=>s.due<=Date.now()).length;
            const novos=state.words.length+state.phrases.length+state.quizzes.length - total;
            content.innerHTML=`<div class="ig-card"><h3>🧠 Algoritmo SRS</h3><p>Intervalo cresce: 1 dia → 6 dias → interval * ease (2.5). Erro volta em 2 min.</p><div style="display:flex;gap:15px;flex-wrap:wrap;margin-top:20px">
                <div style="flex:1;background:#EEF2FF;border:1px solid #4F46E5;padding:20px;border-radius:12px;text-align:center"><div style="font-size:30px;font-weight:900;color:#4F46E5">${total}</div><div style="font-size:12px;font-weight:bold">Itens no SRS</div></div>
                <div style="flex:1;background:#FEE2E2;border:1px solid #EF4444;padding:20px;border-radius:12px;text-align:center"><div style="font-size:30px;font-weight:900;color:#EF4444">${due}</div><div style="font-size:12px;font-weight:bold">Vencidos pra revisar</div></div>
                <div style="flex:1;background:#D1FAE5;border:1px solid #10B981;padding:20px;border-radius:12px;text-align:center"><div style="font-size:30px;font-weight:900;color:#10B981">${Math.max(0,novos)}</div><div style="font-size:12px;font-weight:bold">Novos</div></div>
            </div></div>`;
        }else{
            content.innerHTML=`<div class="ig-card">Aba ${tabId} em construção - use data-action</div>`;
        }
    },

    atualizarConfigMago: async function(){
        const voz=document.getElementById('mago-voz-toggle')?.checked;
        const modo=document.getElementById('mago-modo-select')?.value;
        if(voz===undefined||!modo) return;
        this.state.magoConfig={vozAtiva:voz, modoExibicao:modo};
        await this.saveDados(); Workspace.mostrarAviso('Configuração atualizada','success');
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
        if(!text) return Workspace.mostrarAviso('Escreva a fala','warning');
        if(this.state.editingMagoId){
            const ph=this.state.magoPhrases.find(m=>m.id===this.state.editingMagoId);
            if(ph) ph.text=text; this.state.editingMagoId=null;
        }else{
            this.state.magoPhrases.unshift({id:'mago_'+Date.now(), text});
        }
        input.value=''; await this.saveDados(); this.renderProfessorTab('mago');
    },
    editarMagoPhrase(id){
        const ph=this.state.magoPhrases.find(m=>m.id===id); if(!ph) return;
        const input=document.getElementById('nwMago'); input.value=ph.text; input.focus();
        this.state.editingMagoId=id; const btn=document.getElementById('btn-salvar-mago'); if(btn) btn.innerText='Atualizar';
    },
    addWord: async function(){ const w=document.getElementById('nwWord').value.trim(), t=document.getElementById('nwTrans').value.trim(); if(!w) return; this.state.words.unshift({id:'w'+Date.now(), word:w, translation:t, level:'B1'}); await this.saveDados(); this.renderProfessorTab('biblioteca'); },
    addPhrase: async function(){ const p=document.getElementById('nwPhrase').value.trim(); if(!p) return; this.state.phrases.unshift({id:'p'+Date.now(), phrase:p}); await this.saveDados(); this.renderProfessorTab('biblioteca'); },
    addQuiz: async function(){ const q=document.getElementById('qQuestion')?.value.trim()||'Quiz', o1=document.getElementById('qOpt1')?.value.trim()||'A', o2=document.getElementById('qOpt2')?.value.trim()||'B'; this.state.quizzes.unshift({id:'q'+Date.now(), question:q, options:[o1,o2], correct:1, explanation:'Professor', level:'B1'}); await this.saveDados(); this.renderProfessorTab('biblioteca'); },
    addPic: async function(){ const w=document.getElementById('picWord')?.value.trim()||''; if(!w) return; const tr=document.getElementById('picTrans')?.value.trim()||''; const em=document.getElementById('picEmoji')?.value.trim()||'🖼'; this.state.pictures.unshift({id:'pic'+Date.now(), word:w, translation:tr, emoji:em, category:'Professor'}); await this.saveDados(); this.renderProfessorTab('imagens'); },
    remItem: async function(key,id){ this.state[key]=this.state[key].filter(i=>i.id!==id); if(key==='magoPhrases'&&this.state.editingMagoId===id) this.state.editingMagoId=null; await this.saveDados(); const active=document.querySelector('.ig-side-item.active'); if(active) this.renderProfessorTab(active.dataset.tab); },
    aprovarEnvio: async function(id){ const s=this.state.submissions.find(x=>x.id===id); if(!s) return; s.status='approved'; this.state.pool.unshift({id:'pool_'+Date.now(), type:s.game, text:s.text, word:s.text, origin:'student', student:s.student, timestamp:Date.now()}); await this.saveDados(); this.renderProfessorTab('envios'); },

    abrirJogo(id){
        const game=this.defaults.games.find(g=>g.id===id); if(!game) return;
        this.jogoAtual=id; document.getElementById('ig-modalIcon').textContent=game.icon; document.getElementById('ig-modalTitle').textContent=game.title;
        document.getElementById('ig-gameModal').style.display='flex'; this.currentAudioURL=null; this.renderDesafioAtual();
    },
    abrirMiniHub(){
        if(this.mediaRecorder?.state==='recording') this.mediaRecorder.stop(); if(this.recognition) this.recognition.stop();
        document.getElementById('ig-modalIcon').textContent='🗺'; document.getElementById('ig-modalTitle').textContent='Mapa de Missões';
        document.getElementById('ig-modalBody').innerHTML=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px">${this.defaults.games.map(g=>`<div data-action="abrir-jogo" data-game-id="${g.id}" style="background:${g.color};padding:15px;border-radius:12px;cursor:pointer;border:2px solid rgba(0,0,0,0.05);display:flex;flex-direction:column;align-items:center;gap:10px"><div style="font-size:32px;background:rgba(255,255,255,0.6);width:55px;height:55px;border-radius:12px;display:flex;align-items:center;justify-content:center">${g.icon}</div><h4 style="margin:0;font-size:13px">${g.title}</h4></div>`).join('')}</div>`;
    },
    fecharJogo(){ document.getElementById('ig-gameModal').style.display='none'; if(this.mediaRecorder?.state==='recording') this.mediaRecorder.stop(); if(this.recognition) this.recognition.stop(); },

    sucessoGenerico: async function(bonus){
        if(this.desafioAtualObj?.id){ this.marcarComoConcluido(this.desafioAtualObj.id); this.updateSRS(this.desafioAtualObj.id, this.jogoAtual, true); }
        this.state.xp+=bonus; this.xpGanhosNaSessao+=bonus; await this.saveDados();
        document.getElementById('ig-modalBody').innerHTML=`<div style="text-align:center;padding:50px"><div style="font-size:60px">✅</div><h2 style="font-family:Cinzel;color:#10B981">Excelente!</h2><div style="font-family:VT323,monospace;font-size:30px">+${bonus} XP</div><div style="font-size:12px;color:#64748B;margin-top:10px">Próxima revisão em ${this.state.srs[this.desafioAtualObj?.id]?.interval||1} dia(s)</div></div>`;
        setTimeout(()=>this.proximoDesafio(),1500);
    },
    falhaGenerica: async function(){
        if(this.desafioAtualObj?.id) this.updateSRS(this.desafioAtualObj.id, this.jogoAtual, false);
        document.getElementById('ig-modalBody').innerHTML=`<div style="text-align:center;padding:50px"><div style="font-size:60px">❌</div><h2 style="font-family:Cinzel;color:#EF4444">Atenção!</h2><div style="font-size:14px;font-weight:bold;color:#64748B">Erro guardado. Volta em 2 min (SRS).</div></div>`;
        setTimeout(()=>this.proximoDesafio(),2000);
    },
    envioAoProfessor: async function(gameId, texto, bonus=20){
        if(!texto||texto.trim().length<2) return Workspace.mostrarAviso('Responda válido','warning');
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
        else if(id==='minimalPairs') this.renderGameMinimalPairs();
        else if(id==='picturePop') this.renderGamePicturePop();
        else document.getElementById('ig-modalBody').innerHTML=`<div style="text-align:center;padding:40px">Jogo ${id} - use data-action="verificar-envio" data-game="${id}"</div>`;
    },
    proximoDesafio(){ if(this.tempoRestante>0) this.renderDesafioAtual(); else this.fecharJogo(); },
    renderTelaFimDeJornada(){
        const due=Object.values(this.state.srs).filter(s=>s.due<=Date.now()).length;
        document.getElementById('ig-modalBody').innerHTML=`<div style="text-align:center;padding:50px 20px"><div style="font-size:70px">🏆</div><h2 style="font-family:Cinzel;color:#d4af37">Jornada Concluída!</h2><p style="color:#64748B;font-weight:bold">Você dominou tudo por hoje. ${due?`Mas tem ${due} itens vencidos!`:''} Volte amanhã que o SRS traz mais.</p><div style="background:#EEF2FF;border:1px dashed #4F46E5;padding:15px;border-radius:12px;margin:20px auto;max-width:400px">Próxima revisão: ${Object.values(this.state.srs).filter(s=>s.interval>0).sort((a,b)=>a.due-b.due)[0]? new Date(Object.values(this.state.srs).sort((a,b)=>a.due-b.due)[0].due).toLocaleDateString() : 'amanhã'}</div></div>`;
    },

    renderGameWordSpark(){
        this.desafioAtualObj=this.obterItemInteligente(this.state.words,'word'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const w=this.desafioAtualObj; const srs=this.getSRS(w.id);
        document.getElementById('ig-modalBody').innerHTML=`<div style="text-align:center"><div style="font-size:12px;color:#64748B">SRS: ${srs?`Int ${srs.interval}d | Ease ${srs.ease.toFixed(2)} | Rep ${srs.repetitions}`:'Novo'}</div><div class="ig-big-phrase" style="font-size:32px">${w.word}</div><p style="font-weight:bold;color:#64748B">${w.translation}</p><div class="ig-big-phrase">Crie uma frase com <b>${w.word}</b></div><textarea id="ig-input" class="ig-textarea" placeholder="Type your sentence..."></textarea><button data-action="verificar-wordSpark" class="ws-btn" style="width:100%;background:linear-gradient(135deg,#4F46E5,#3730A3);color:#fff;border:none;padding:15px;border-radius:8px;margin-top:15px;cursor:pointer">Lançar Feitiço ✨</button></div>`;
    },
    renderGameReadAloud(){
        this.desafioAtualObj=this.obterItemInteligente(this.state.phrases,'phrase'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const p=this.desafioAtualObj;
        document.getElementById('ig-modalBody').innerHTML=`<div class="ig-big-phrase">${p.phrase}</div><div style="text-align:center;margin:15px 0"><button data-action="falar-frase" class="ws-btn" style="background:#0F172A;color:#fff;border-radius:30px;padding:10px 20px;border:none;cursor:pointer">🔊 Ouvir Oráculo</button></div><div style="text-align:center;background:#F8FAFC;padding:20px;border-radius:12px;border:1px solid #E2E8F0"><p style="font-weight:bold">Sua vez:</p><button data-action="iniciar-voz" data-tipo="phrase" class="ws-btn" style="background:linear-gradient(135deg,#10B981,#059669);color:#fff;width:100%;border-radius:30px;padding:12px;border:none;font-weight:bold;cursor:pointer">🎤 Iniciar Sopro</button><div id="ig-speechResult" style="margin-top:15px"></div></div>`;
    },
    renderGameListenType(){
        this.desafioAtualObj=this.obterItemInteligente(this.state.phrases,'phrase'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const p=this.desafioAtualObj;
        document.getElementById('ig-modalBody').innerHTML=`<div style="text-align:center;padding:20px"><div style="font-size:60px">🦉</div><h3>Escute e transcreva</h3><button data-action="falar-frase" class="ws-btn" style="background:#4F46E5;color:#fff;border-radius:30px;padding:10px 30px;border:none;cursor:pointer">🔊 Tocar Ecos</button><input id="ig-listenInput" class="ig-input" placeholder="Transcreve..." style="margin-top:20px;text-align:center;font-weight:bold"><button data-action="verificar-listen" class="ws-btn" style="width:100%;background:#10B981;color:#fff;margin-top:15px;border:none;padding:12px;border-radius:8px;cursor:pointer">Desvendar</button></div>`;
    },
    renderGameQuiz(){
        this.desafioAtualObj=this.obterItemInteligente(this.state.quizzes,'quiz'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const q=this.desafioAtualObj;
        document.getElementById('ig-modalBody').innerHTML=`<div class="ig-big-phrase" style="font-family:Cinzel">${q.question}</div><div style="display:flex;flex-direction:column;gap:12px;margin-top:20px">${q.options.map((o,i)=>`<button data-action="verificar-quiz" data-index="${i}" class="ws-btn" style="background:#fff;border:2px solid #E2E8F0;padding:15px;border-radius:8px;cursor:pointer;text-align:left">${o}</button>`).join('')}</div>`;
    },
    renderGameWordPicker(){
        this.desafioAtualObj=this.obterItemInteligente(this.defaults.wordPickers,'picker'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const s=this.desafioAtualObj;
        document.getElementById('ig-modalBody').innerHTML=`<div class="ig-big-phrase" style="color:#4F46E5">${s.text}</div><div style="display:flex;gap:10px;justify-content:center;margin-top:20px;flex-wrap:wrap">${s.options.map((o,i)=>`<button data-action="verificar-picker" data-index="${i}" class="ws-btn" style="background:#fff;border:2px solid #E2E8F0;padding:12px 25px;border-radius:30px;cursor:pointer;font-weight:bold">${o}</button>`).join('')}</div>`;
    },
    renderGameMinimalPairs(){
        this.desafioAtualObj=this.obterItemInteligente(this.defaults.minimalPairs,'minimal'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const pair=this.desafioAtualObj; const target=Math.random()>0.5?pair.a:pair.b; this.state._minimalTarget=target;
        document.getElementById('ig-modalBody').innerHTML=`<div style="text-align:center"><h3 style="font-family:Cinzel">👄 Sussurros Gêmeos</h3><div style="background:#0F172A;padding:20px;border-radius:16px;margin-top:20px"><button data-action="falar-frase" class="ws-btn" style="background:linear-gradient(135deg,#4F46E5,#3730A3);color:#fff;padding:12px 30px;border-radius:30px;border:2px solid #fff;cursor:pointer">🎧 Ouvir Sussurro (${target})</button><div style="display:flex;gap:10px;justify-content:center;margin-top:20px"><button data-action="verificar-minimal" data-choice="${pair.a}" class="ws-btn" style="background:#fff;padding:12px 30px;border-radius:8px;cursor:pointer;font-weight:bold">${pair.a}</button><button data-action="verificar-minimal" data-choice="${pair.b}" class="ws-btn" style="background:#fff;padding:12px 30px;border-radius:8px;cursor:pointer;font-weight:bold">${pair.b}</button></div></div></div>`;
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
