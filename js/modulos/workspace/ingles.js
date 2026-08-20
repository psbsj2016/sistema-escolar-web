// js/modulos/workspace/ingles.js - V4 FINAL - TODOS OS 12 JOGOS CORRIGIDOS
window.Workspace = window.Workspace || {};
const VoiceService = (() => {
    let cache = null, resolver = null;
    const ready = new Promise(r => resolver = r);
    const FEMALE_BLOCK = ['female','samantha','zira','karen','victoria','tessa','moira','siri','veena','fiona','susan','heather','jenny','aria','emma','michelle'];
    const SCORE = [{k:'david',s:1000},{k:'daniel',s:950},{k:'google uk english male',s:900},{k:'mark',s:850},{k:'alex',s:800}];
    const pick = (voices) => {
        const en = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
        if(!en.length) return null;
        const pool = en.filter(v => !FEMALE_BLOCK.some(f => (v.name+v.voiceURI).toLowerCase().includes(f)));
        const base = pool.length ? pool : en;
        return base.map(v=>{ const id=(v.name+' '+v.voiceURI).toLowerCase(); let sc=100; SCORE.forEach(o=>{ if(id.includes(o.k)) sc=o.s; }); if(id.includes('male') && !id.includes('female')) sc+=200; return {v, sc}; }).sort((a,b)=>b.sc-a.sc)[0]?.v || null;
    };
    const init = () => { const vs = window.speechSynthesis?.getVoices() || []; if(vs.length){ cache = pick(vs); resolver(cache); } };
    if('speechSynthesis' in window){ window.speechSynthesis.onvoiceschanged = init; init(); setTimeout(init, 500); }
    return { ready, getVoice:()=>cache, falar: async (text, {rate=0.95, isMago=false}={})=>{ if(!('speechSynthesis' in window)) return; await ready; window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent); const voz = cache || pick(window.speechSynthesis.getVoices()); if(voz){ u.voice=voz; u.lang=voz.lang; u.pitch=isMago?(isMobile?0.6:0.8):0.92; } else { u.lang=isMobile?'en-GB':'en-US'; u.pitch=isMago?0.2:0.4; } u.rate = isMago?0.85:rate; window.speechSynthesis.speak(u); } };
})();
const TimerService = { _id:null, remaining:0, _paused:false, start(sec, onTick, onEnd){ this.stop(); this.remaining=sec; this._paused=false; onTick(this.remaining); this._id = setInterval(()=>{ if(this._paused) return; this.remaining--; onTick(this.remaining); if(this.remaining<=0){ this.stop(); onEnd&&onEnd(); } },1000); }, pause(){ this._paused=true; }, resume(){ this._paused=false; }, stop(){ if(this._id){ clearInterval(this._id); this._id=null; } } };
const ParticleEngine = { _exploding:false, explode(x,y){ if(this._exploding) return; this._exploding=true; const flash=document.createElement('div'); flash.style.cssText='position:fixed;inset:0;background:white;z-index:9999999;opacity:0.85;pointer-events:none;transition:opacity 0.6s;'; document.body.appendChild(flash); requestAnimationFrame(()=>flash.style.opacity='0'); setTimeout(()=>flash.remove(),700); const wave=document.createElement('div'); wave.style.cssText=`position:fixed;left:${x}px;top:${y}px;width:10px;height:10px;border-radius:50%;box-shadow:0 0 80px 40px #f1c40f,inset 0 0 30px #fff;z-index:9999998;pointer-events:none;transform:translate(-50%,-50%);animation:shockwave 1.2s ease-out forwards;`; document.body.appendChild(wave); setTimeout(()=>wave.remove(),1200); const frag=document.createDocumentFragment(); const forca=Math.min(window.innerWidth*0.9, 1200); const cores=['#ffeb3b','#e67e22','#c0392b','#ff9800']; for(let i=0;i<60;i++){ const el=document.createElement('div'); el.className='ig-fireball'; const ang=Math.random()*Math.PI*2, vel=300+Math.random()*forca; el.style.left=x+'px'; el.style.top=y+'px'; el.style.setProperty('--tx', Math.cos(ang)*vel+'px'); el.style.setProperty('--ty', Math.sin(ang)*vel+'px'); el.style.background=cores[i%4]; const s=15+Math.random()*25; el.style.width=s+'px'; el.style.height=s+'px'; frag.appendChild(el); } for(let i=0;i<100;i++){ const el=document.createElement('div'); el.className='ig-sparkle'; const ang=Math.random()*Math.PI*2, vel=200+Math.random()*forca*1.2; el.style.left=x+'px'; el.style.top=y+'px'; el.style.setProperty('--tx', Math.cos(ang)*vel+'px'); el.style.setProperty('--ty', Math.sin(ang)*vel+'px'); el.style.background='#fff'; const s=5+Math.random()*10; el.style.width=s+'px'; el.style.height=s+'px'; frag.appendChild(el); } document.body.appendChild(frag); setTimeout(()=>{ document.querySelectorAll('.ig-fireball,.ig-sparkle').forEach(e=>e.remove()); this._exploding=false; },2600); } };
const SRSService = { calc(success, entry){ const now=Date.now(); let {ease=2.5, interval=0, repetitions=0, lapses=0} = entry||{}; if(success){ if(repetitions===0) interval=1; else if(repetitions===1) interval=6; else interval=Math.round(interval*ease); repetitions++; ease=Math.min(3.0, ease+0.05); }else{ lapses++; repetitions=0; interval=0; ease=Math.max(1.3, ease-0.2); } const due = success ? now + interval*24*60*60*1000 : now + 2*60*1000; return {ease, interval, repetitions, lapses, due, lastSeen:now}; } };

Workspace.Ingles = {
    state: { xp:0, streak:1, words:[], phrases:[], quizzes:[], pictures:[], minimalPairs:[], debates:[], submissions:[], pool:[], errosRetidos:[], itensConcluidos:[], magoPhrases:[], srs:{}, magoConfig:{ vozAtiva:true, modoExibicao:'aleatorio' }, _minimalTarget:null, editingMagoId:null },
    mediaRecorder:null, audioChunks:[], currentAudioURL:null, recognition:null, bauDestrancado:false, tempoGlobalDefinido:false, sessaoEncerrada:false, jogoAtual:null, tempoRestante:0, xpGanhosNaSessao:0, desafioAtualObj:null, digitandoAtivo:false, magoIntervalTimer:null,
    defaults: {
        magoConfig:{ vozAtiva:true, modoExibicao:'aleatorio' },
        magoPhrases:[{id:'m1',text:'Let us go! (citarAluno)'},{id:'m2',text:'Welcome again, (citarAluno)!'}],
        words:[{id:'w1', word:'Although', translation:'Embora'},{id:'w2', word:'Beneath', translation:'Abaixo de'},{id:'w3', word:'Achieve', translation:'Alcançar'},{id:'w4', word:'Whisper', translation:'Sussurrar'}],
        phrases:[{id:'p1', phrase:'Could you tell me where the nearest pharmacy is?'},{id:'p2', phrase:'If I had more time, I would travel the world.'},{id:'p3', phrase:'She has been learning English for three years.'}],
        quizzes:[{id:'q1', question:'Choose the correct sentence:', options:['I have been to London last year','I went to London last year','I have went to London last year'], correct:1},{id:'q2', question:'Fill: I _____ here since 2019.', options:['live','am living','have lived','lived'], correct:2}],
        pictures:[{id:'pic1', word:'apple', translation:'maçã', emoji:'🍎'},{id:'pic2', word:'bicycle', translation:'bicicleta', emoji:'🚲'},{id:'pic3', word:'laptop', translation:'notebook', emoji:'💻'},{id:'pic4', word:'umbrella', translation:'guarda-chuva', emoji:'☂'}],
        minimalPairs:[{id:'mp1', a:'ship', b:'sheep'}, {id:'mp2', a:'beach', b:'bitch'}],
        debates:[{id:'d1', topic:'Social media does more harm than good', starter:'What is your opinion?'},{id:'d2', topic:'AI will replace teachers', starter:'Can AI motivate?'}],
        wordPickers:[{id:'wp1', text:'I have _____ my keys.', options:['lost','lose','loosed'], correct:0},{id:'wp2', text:'She is _____ than her sister.', options:['tall','taller','tallest'], correct:1}],
        questions:[{id:'aq1', text:'What did you do last weekend?'},{id:'aq2', text:'Describe your dream house.'}],
        roleplays:[{id:'rp1', title:'✈ No Aeroporto', prompt:'Can I see your passport?', tip:'Here you are'},{id:'rp2', title:'🍽 No Restaurante', prompt:'Ready to order?', tip:'I would like...'}],
        games:[
            {id:'wordSpark', title:'🪄 Feitiço das Palavras', desc:'Invoque uma frase com a palavra-chave.', icon:'🪄', color:'#E0E7FF', level:'B1-B2'},
            {id:'readAloud', title:'🐉 Sopro do Dragão', desc:'Fale ao microfone.', icon:'🐉', color:'#D1FAE5', level:'A2-C1'},
            {id:'listenType', title:'🦉 Ecos da Coruja', desc:'Escute e transcreva.', icon:'🦉', color:'#FEF3C7', level:'A2-B1'},
            {id:'quiz', title:'👁 Enigma da Esfinge', desc:'Responda corretamente.', icon:'👁', color:'#FEE2E2', level:'A1-B2'},
            {id:'wordPicker', title:'🧪 Poção Sintática', desc:'Escolha o ingrediente.', icon:'🧪', color:'#E0E7FF', level:'A2-B1'},
            {id:'sentenceShuffle', title:'🌀 Labirinto Ilusório', desc:'Transforme as frases.', icon:'🌀', color:'#D1FAE5', level:'B1-B2'},
            {id:'answerQuest', title:'📜 Pergaminho do Herói', desc:'Responda abertamente.', icon:'📜', color:'#FEF3C7', level:'B1-C1'},
            {id:'questionMaker', title:'🔮 Espelho do Oráculo', desc:'Formule a pergunta.', icon:'🔮', color:'#F5D0FE', level:'B1-B2'},
            {id:'contextRole', title:'🎭 Manto do Metamorfo', desc:'Assuma a identidade.', icon:'🎭', color:'#CCFBF1', level:'B1-C1'},
            {id:'debateAI', title:'⚔ Duelo de Mentes', desc:'Debate denso.', icon:'⚔', color:'#E0F2FE', level:'B2-C1'},
            {id:'minimalPairs', title:'♊ Sussurros Gêmeos', desc:'Diferencie sons.', icon:'♊', color:'#FFEDD5', level:'B1-C1'},
            {id:'picturePop', title:'👁🗨 Visão do Alquimista', desc:'Invoque o nome.', icon:'👁🗨', color:'#DCFCE7', level:'A1-B1'}
        ]
    },
    init(){ this.injetarCSS(); this.construirHTML(); this.bindEvents(); },
    abrirBau(){ Workspace.navegarPara('ingles'); setTimeout(()=>this.renderizarVisualizacao(), 80); },
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
                this.state.magoConfig = d.magoConfig||{...this.defaults.magoConfig};
                this.state.srs = d.srs||{};
            }else{
                this.state.words=[...this.defaults.words]; this.state.phrases=[...this.defaults.phrases]; this.state.quizzes=[...this.defaults.quizzes]; this.state.pictures=[...this.defaults.pictures];
                this.state.submissions=[]; this.state.pool=[]; this.state.errosRetidos=[]; this.state.magoPhrases=[...this.defaults.magoPhrases]; this.state.magoConfig={...this.defaults.magoConfig}; this.state.srs={};
            }
            const userK=`ws_ingles_user_${Workspace.usuario.id}`;
            this.state.xp=parseInt(localStorage.getItem(`${userK}_xp`)||'0');
            this.state.streak=parseInt(localStorage.getItem(`${userK}_streak`)||'1');
            this.state.itensConcluidos=JSON.parse(localStorage.getItem(`${userK}_concluidos`)||'[]');
            try{ const localSRS=JSON.parse(localStorage.getItem(`${userK}_srs`)||'{}'); this.state.srs={...this.state.srs, ...localSRS}; }catch{}
        }catch{}
    },
    saveDados: async function(){
        const userK=`ws_ingles_user_${Workspace.usuario.id}`;
        try{ localStorage.setItem(`${userK}_xp`, String(this.state.xp)); localStorage.setItem(`${userK}_streak`, String(this.state.streak)); localStorage.setItem(`${userK}_concluidos`, JSON.stringify(this.state.itensConcluidos)); localStorage.setItem(`${userK}_srs`, JSON.stringify(this.state.srs)); }catch{}
        try{
            await Workspace.api('/workspace/ingles/dados','PUT',{ escolaId:Workspace.usuario.escolaId||'DEFAULT', words:this.state.words, phrases:this.state.phrases, quizzes:this.state.quizzes, pictures:this.state.pictures, submissions:this.state.submissions, pool:this.state.pool, errosRetidos:this.state.errosRetidos, magoPhrases:this.state.magoPhrases, magoConfig:this.state.magoConfig, srs:this.state.srs });
        }catch{}
    },
    getSRS(id){ return this.state.srs[id] || null; },
    updateSRS(id, tipo, success){ const prev=this.state.srs[id] || {ease:2.5, interval:0, repetitions:0, lapses:0, due:0, tipo}; const next=SRSService.calc(success, prev); next.tipo=tipo; next.id=id; this.state.srs[id]=next; this.saveDados(); return next; },
    registrarErro(itemOriginal, tipoConteudo){ if(!itemOriginal?.id) return; if(!this.state.errosRetidos.find(e=>e.id===itemOriginal.id)) this.state.errosRetidos.push({...itemOriginal, _tipoDefeito:tipoConteudo}); this.updateSRS(itemOriginal.id, tipoConteudo, false); },
    superarErro(itemId){ const idx=this.state.errosRetidos.findIndex(e=>e.id===itemId); if(idx!==-1) this.state.errosRetidos.splice(idx,1); },
    marcarComoConcluido(itemId){ if(!itemId) return; if(!this.state.itensConcluidos.includes(itemId)) this.state.itensConcluidos.push(itemId); },
    obterItemInteligente(listaPadrao, tipoConteudo){
        if(!Array.isArray(listaPadrao) || !listaPadrao.length) return null;
        const now=Date.now(); const concluidos=this.state.itensConcluidos||[];
        const comSRS=listaPadrao.map(item=>{ const srs=this.state.srs[item.id]; return {item, srs, isDue: srs ? srs.due <= now : false, isNew: !srs || srs.repetitions===0}; });
        const vencidos=comSRS.filter(e=>e.srs && e.isDue).sort((a,b)=>a.srs.due - b.srs.due);
        if(vencidos.length){ if(Math.random()<0.8) return vencidos[0].item; return vencidos[Math.floor(Math.random()*Math.min(3,vencidos.length))].item; }
        const retidos=this.state.errosRetidos.filter(e=>e._tipoDefeito===tipoConteudo && !concluidos.includes(e.id));
        if(retidos.length && Math.random()<0.6) return retidos[Math.floor(Math.random()*retidos.length)];
        const novos=comSRS.filter(e=>e.isNew && !concluidos.includes(e.item.id));
        if(novos.length) return novos[Math.floor(Math.random()*novos.length)].item;
        const disponiveis=listaPadrao.filter(i=>!concluidos.includes(i.id) || (this.state.srs[i.id]?.due <= now));
        if(!disponiveis.length) return null;
        return disponiveis[Math.floor(Math.random()*disponiveis.length)];
    },
    falar: (text)=> VoiceService.falar(text),
    similaridade(a,b){ const norm=s=>s.toLowerCase().trim().replace(/[^\w\s]/g,''); let nA=norm(a), nB=norm(b); if(nA===nB) return 1; if(nB.includes(nA)||nA.includes(nB)) return 0.9; return nA.split(' ').some(w=>nB.includes(w))?0.6:0; },

    injetarCSS(){
        if(document.getElementById('ws-ingles-css')) return;
        if(!document.querySelector('link[data-ig-font]')){
            const l=document.createElement('link'); l.rel='stylesheet'; l.href='https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=VT323&display=swap'; l.setAttribute('data-ig-font','1'); document.head.appendChild(l);
        }
        const style=document.createElement('style'); style.id='ws-ingles-css';
        style.textContent=`
            #ws-ingles-container{background:linear-gradient(180deg,#F8FAFC 0%,#EEF2FF 100%);border-radius:20px;overflow:visible;min-height:80vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(15,23,42,0.08);border:1px solid #E2E8F0}
            .ig-header{background:linear-gradient(135deg,#0f0f23 0%,#1a1a2e 40%,#1e1b4b 100%);padding:16px 28px;display:flex;justify-content:space-between;align-items:center;border-bottom:4px solid #d4af37;position:sticky;top:0;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,0.4)}
            .ig-title{display:flex;align-items:center;gap:18px}
            .ig-bau-topo{width:72px;filter:drop-shadow(0 0 14px rgba(241,196,15,0.8)) drop-shadow(0 4px 12px rgba(0,0,0,0.5))}
            .ig-title-text h2{font-family:'Cinzel',serif;font-size:30px;font-weight:900;margin:0;background:linear-gradient(90deg,#fde68a 0%,#f1c40f 25%,#fde68a 50%,#d4af37 75%,#fde68a 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(2px 2px 0px #000) drop-shadow(0 0 20px rgba(241,196,15,0.35));background-size:200% auto;animation:shineGold 4s linear infinite}
            @keyframes shineGold{0%{background-position:0% 50%}100%{background-position:200% 50%}}
            .ig-title-text p{margin:3px 0 0 0;font-size:11px;color:#f8fafc;font-family:'VT323',monospace;text-transform:uppercase;letter-spacing:3px;opacity:0.95;text-shadow:0 1px 0 #000}
            .ig-rpg-hud{display:flex;gap:10px;background:rgba(0,0,0,0.6);padding:8px 14px;border-radius:14px;border:1.5px solid rgba(212,175,55,0.5)}
            .ig-hud-stat{display:flex;align-items:center;gap:7px;background:rgba(255,255,255,0.08);padding:6px 12px;border-radius:10px;border:1px solid rgba(212,175,55,0.25);color:#fff;font-family:'VT323',monospace;font-size:18px}
            .ig-hud-stat span{color:#fde68a;font-size:22px}
            .ig-global-timer{font-family:'VT323',monospace;font-size:22px;color:#ff4757;display:none;align-items:center;letter-spacing:2px;background:rgba(239,68,68,0.15);padding:5px 12px;border-radius:8px;border:1.5px dashed #ef4444}
            .ig-games-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;padding:0}
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
            .ig-input,.ig-textarea{background:#ffffff;color:#0f172a;border:2.5px solid #cbd5e1;border-radius:12px;font-weight:600;font-size:15px}
            .ig-input:focus,.ig-textarea:focus{border-color:#4f46e5;outline:none;box-shadow:0 0 0 4px rgba(79,70,229,0.12)}
            .ig-input::placeholder,.ig-textarea::placeholder{color:#64748b;opacity:1}
            .ig-card{background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;padding:22px;margin-bottom:18px}
            .ig-list-item{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid #f1f5f9;color:#0f172a;font-weight:500}
            @media(max-width:768px){.ig-header{flex-direction:column;gap:14px}.ig-bau-topo{width:92px!important}.ig-games-grid{grid-template-columns:1fr}}
        `;
        document.head.appendChild(style);
    },
    construirHTML(){
        let container=document.getElementById('ws-ingles-container');
        if(!container){ container=document.createElement('div'); container.id='ws-ingles-container'; container.style.display='none'; const p=document.getElementById('ws-main-container'); if(p?.parentNode) p.parentNode.appendChild(container); }
        container.innerHTML=`
            <div class="ig-header"><div class="ig-title"><img id="ig-header-chest" src="/assets/bau_roxo_pixel.png" class="ig-bau-topo" alt="Baú" /><div class="ig-title-text"><h2>Baú do Inglês</h2><p>Treinamento Épico Adaptativo</p></div></div><div class="ig-rpg-hud"><div id="ig-global-timer-display" class="ig-global-timer">00:00</div><div class="ig-hud-stat">🔥 <span id="ig-streakCount">1</span> Dias</div><div class="ig-hud-stat">⭐ <span id="ig-xpCount">0</span> XP</div></div></div>
            <div id="ig-guardian-screen" class="ig-guardian-container" style="display:none"><div style="display:flex;align-items:center;gap:22px;max-width:680px;width:100%"><img src="/assets/mago_bau_ingles.png" class="ig-guardian-avatar" alt="Mago" /><div class="ig-balao-fala-static"><span style="color:#fde68a;font-weight:900">Mestre Mago:</span><br/><span style="color:#e2e8f0;font-size:0.95em">Quantos minutos vai treinar agora?</span></div></div><div style="display:flex;gap:14px;margin-top:24px;max-width:380px;width:100%"><div style="display:flex;align-items:center;gap:8px;background:rgba(0,0,0,0.7);padding:8px 14px;border-radius:12px;border:2px solid #d4af37;flex:1;justify-content:center"><input type="number" id="ig-tempo-escolhido" placeholder="15" min="1" max="120" style="width:60px;border:none;background:transparent;color:#fde68a;font-size:30px;font-family:VT323,monospace;text-align:center;outline:none"><span style="color:#fff;font-family:VT323,monospace;font-size:20px">MIN</span></div><button data-action="aceitar-tempo" class="ws-btn" style="flex:1;background:linear-gradient(180deg,#fde68a 0%,#d4af37 50%,#a67c00 100%);color:#000;border:2px solid #fff;padding:12px 18px;border-radius:12px;cursor:pointer;font-family:Cinzel,serif;font-weight:800">Aceitar ⚔</button></div></div>
            <div id="ig-alunoView" style="display:none;padding:28px"><div class="ig-hub-banner"><img src="/assets/mago_bau_ingles.png" class="ig-hub-mago-img" alt="Mago" /><div id="ig-hub-mago-text" class="ig-balao-fala-hub" style="display:none"></div></div><div id="ig-gamesGrid" class="ig-games-grid"></div></div>
            <div id="ig-timeout-screen" style="display:none;flex-direction:column;align-items:center;justify-content:center;min-height:65vh;text-align:center;padding:32px"><h1 style="font-family:Cinzel,serif;font-size:34px;color:#0f172a">O tempo esgotou!</h1><div id="ig-timeout-xp" style="font-family:VT323,monospace;font-size:42px;color:#fde68a">+0 XP</div><button data-action="encerrar-sessao" class="ws-btn" style="background:linear-gradient(180deg,#fde68a,#d4af37);color:#000;padding:14px 32px;border-radius:12px;border:2px solid #fff;cursor:pointer;font-weight:800;margin-top:20px">Guardar e Sair</button></div>
            <div id="ig-professorView" style="display:none;min-height:70vh"><div style="width:250px;background:#fff;border-right:1px solid #E2E8F0;padding:20px;display:flex;flex-direction:column;gap:5px"><button data-action="render-tab" data-tab="mago" class="ig-side-item">🧙 Mago IA</button><button data-action="render-tab" data-tab="biblioteca" class="ig-side-item active">📚 Biblioteca</button><button data-action="render-tab" data-tab="imagens" class="ig-side-item">🖼 Imagens</button><button data-action="render-tab" data-tab="envios" class="ig-side-item">📥 Envios</button><button data-action="render-tab" data-tab="algoritmo" class="ig-side-item">🧠 Algoritmo</button></div><div id="ig-tab-content" style="flex:1;padding:28px;background:#F8FAFC"></div></div>
            <div id="ig-gameModal" style="display:none;position:fixed;inset:0;background:rgba(15,23,42,0.82);z-index:1000000;align-items:center;justify-content:center;backdrop-filter:blur(10px)"><div class="ws-card" style="width:92%;max-width:680px;background:#fffcf0;border:3px solid #d4af37;border-radius:18px;display:flex;flex-direction:column;max-height:92vh;overflow:hidden"><div style="padding:16px 22px;border-bottom:2.5px dashed #d4af37;display:flex;justify-content:space-between;align-items:center"><div style="display:flex;align-items:center;gap:12px"><span id="ig-modalIcon" style="font-size:30px"></span><h2 id="ig-modalTitle" style="margin:0;font-family:Cinzel,serif;font-size:19px;font-weight:800;color:#0f172a"></h2></div><div style="display:flex;gap:10px"><button data-action="abrir-mini-hub" style="background:#0f172a;color:#fde68a;border:2px solid #d4af37;padding:8px 14px;border-radius:10px;cursor:pointer;font-weight:700">🔄 Mudar</button><button data-action="fechar-jogo" style="background:#fee2e2;border:1.5px solid #fecaca;color:#dc2626;width:38px;height:38px;border-radius:10px;font-size:22px;cursor:pointer;font-weight:800">✕</button></div></div><div id="ig-modalBody" style="padding:28px;overflow-y:auto;flex:1"></div></div></div>`;
    },
    bindEvents(){
        const root=document.getElementById('ws-ingles-container');
        if(!root || root._bound) return; root._bound=true;
        root.addEventListener('click', e=>{
            const b=e.target.closest('[data-action]'); if(!b) return;
            const a=b.dataset.action;
            switch(a){
                case 'aceitar-tempo':{ const campo=document.getElementById('ig-tempo-escolhido'); const m=parseInt(campo.value)||0; if(m<=0){ Workspace.mostrarAviso('Digite um tempo válido!','warning'); campo.focus(); return; } this.abrirBauMagico(m); break; }
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
                case 'aprovar-envio': this.aprovarEnvio(b.dataset.id); break;
                case 'rejeitar-envio': this.remItem('submissions', b.dataset.id); break;
            }
        });
        root.addEventListener('change', e=>{ if(e.target.id==='mago-voz-toggle' || e.target.id==='mago-modo-select') this.atualizarConfigMago(); });
        const modal=document.getElementById('ig-modalBody');
        modal.addEventListener('click', e=>{
            const b=e.target.closest('[data-action]'); if(!b) return;
            const cur=this.desafioAtualObj;
            const input=document.getElementById('ig-input')?.value?.trim()||'';
            const listen=document.getElementById('ig-listenInput')?.value?.trim()||'';
            if(b.dataset.action==='falar-frase'){ if(cur?.phrase) VoiceService.falar(cur.phrase); else if(cur?.word) VoiceService.falar(cur.word); else if(this.state._minimalTarget) VoiceService.falar(this.state._minimalTarget); }
            if(b.dataset.action==='iniciar-voz'){ const esperado=cur?.word||cur?.phrase||this.state._minimalTarget; if(esperado) this.iniciarReconhecimentoDeVoz(esperado, cur, b.dataset.tipo||'phrase'); }
            if(b.dataset.action==='verificar-wordSpark'){ if(!input.toLowerCase().includes((cur.word||'').toLowerCase())){ this.registrarErro(cur,'word'); this.falhaGenerica(); } else { this.updateSRS(cur.id,'word',true); this.superarErro(cur.id); this.envioAoProfessor('wordSpark', input, 50); } }
            if(b.dataset.action==='verificar-listen'){ const sim=this.similaridade(listen, cur.phrase); if(sim>=0.9){ this.updateSRS(cur.id,'phrase',true); this.superarErro(cur.id); this.sucessoGenerico(50); } else { this.registrarErro(cur,'phrase'); this.falhaGenerica(); } }
            if(b.dataset.action==='verificar-quiz'){ const idx=parseInt(b.dataset.index); if(idx===cur.correct){ this.updateSRS(cur.id,'quiz',true); this.superarErro(cur.id); this.sucessoGenerico(30); } else { this.registrarErro(cur,'quiz'); this.falhaGenerica(); } }
            if(b.dataset.action==='verificar-minimal'){ if(b.dataset.choice===this.state._minimalTarget){ this.updateSRS(cur.id,'minimal',true); this.superarErro(cur.id); this.sucessoGenerico(75); } else { this.registrarErro(cur,'minimal'); this.falhaGenerica(); } }
            if(b.dataset.action==='verificar-picker'){ const idx=parseInt(b.dataset.index); if(idx===cur.correct){ this.updateSRS(cur.id,'picker',true); this.superarErro(cur.id); this.sucessoGenerico(20); } else { this.registrarErro(cur,'picker'); this.falhaGenerica(); } }
            if(b.dataset.action==='verificar-picture-text'){ const sim=this.similaridade(input, cur.word); if(sim>=0.9){ this.updateSRS(cur.id,'picture',true); this.superarErro(cur.id); this.sucessoGenerico(75); } else { this.registrarErro(cur,'picture'); this.falhaGenerica(); } }
            if(b.dataset.action==='verificar-envio'){ if(input.length<2) return Workspace.mostrarAviso('Responda válido','warning'); if(b.dataset.game==='questionMaker' && (!input.includes('?') || input.split(' ').length<3)) return Workspace.mostrarAviso('Pergunta precisa ter ? e 3 palavras','error'); this.envioAoProfessor(b.dataset.game, input, parseInt(b.dataset.bonus||'50')); }
            if(b.dataset.action==='proximo-desafio'){ this.proximoDesafio(); }
        });
    },
    renderizarVisualizacao(){
        document.getElementById('ig-xpCount').textContent=this.state.xp;
        document.getElementById('ig-streakCount').textContent=this.state.streak;
        const chest=document.getElementById('ig-header-chest');
        if(chest){ chest.classList.remove('chest-shake','chest-explode'); chest.style.transform='scale(1)'; if(!this.tempoGlobalDefinido) chest.src='/assets/bau_roxo_pixel.png'; }
        const isAluno=Workspace.usuario.tipo==='Aluno';
        if(!isAluno){
            document.getElementById('ig-professorView').style.display='flex'; document.getElementById('ig-alunoView').style.display='none'; document.getElementById('ig-guardian-screen').style.display='none'; document.getElementById('ig-timeout-screen').style.display='none';
            const aba=localStorage.getItem('ws_ingles_aba_prof')||'biblioteca'; this.renderProfessorTab(aba);
        }else{
            document.getElementById('ig-professorView').style.display='none'; document.getElementById('ig-gameModal').style.display='none'; document.getElementById('ig-timeout-screen').style.display='none'; document.getElementById('ig-alunoView').style.display='none'; document.getElementById('ig-guardian-screen').style.display='none';
            if(this.sessaoEncerrada){ document.getElementById('ig-timeout-screen').style.display='flex'; document.getElementById('ig-timeout-xp').innerText=`+${this.xpGanhosNaSessao} XP ⭐`; }
            else if(!this.tempoGlobalDefinido){ const g=document.getElementById('ig-guardian-screen'); g.style.display='flex'; g.style.opacity='1'; }
            else{ document.getElementById('ig-alunoView').style.display='block'; this.renderAlunoGrid(); }
        }
    },
    renderAlunoGrid(){
        const grid=document.getElementById('ig-gamesGrid'); if(!grid) return;
        const now=Date.now();
        grid.innerHTML=this.defaults.games.map(g=>{
            const srsForGame=Object.values(this.state.srs).filter(s=>s.tipo===g.id && s.due<=now).length;
            return `<div class="ig-game-card" data-action="abrir-jogo" data-game-id="${g.id}"><div class="ig-top"><div class="ig-icon" style="background:${g.color}">${g.icon}</div><span class="ig-badge ig-badge-level">${g.level}</span></div><h3>${g.title} ${srsForGame?'🔥':''}</h3><p>${g.desc}</p><div style="display:flex;gap:8px;flex-wrap:wrap"><span class="ig-badge" style="background:#f1f5f9;color:#0f172a;border-color:#e2e8f0">⭐ +${['picturePop','minimalPairs','debateAI'].includes(g.id)?'75':'50'} XP</span> ${srsForGame?`<span style="font-size:11px;color:#dc2626;font-weight:800;background:#fee2e2;padding:4px 8px;border-radius:20px;border:1px solid #fecaca">🔥 ${srsForGame} pra revisar</span>`:''}</div></div>`;
        }).join('');
    },
    abrirBauMagico(minutos){
        if(ParticleEngine._exploding || this.tempoGlobalDefinido) return;
        try{ speechSynthesis.cancel(); }catch{}
        if(this.magoIntervalTimer) clearInterval(this.magoIntervalTimer);
        const chest=document.getElementById('ig-header-chest'); if(chest) chest.classList.add('chest-shake');
        const magoScr=document.getElementById('ig-guardian-screen'); if(magoScr) magoScr.style.opacity='0';
        setTimeout(()=>{
            if(magoScr) magoScr.style.display='none';
            if(chest){ chest.classList.remove('chest-shake'); chest.classList.add('chest-explode'); chest.src='/assets/bau_roxo_pixel_aberto.png'; }
            const rect=chest?.getBoundingClientRect()||{left:innerWidth/2, top:50, width:0, height:0};
            ParticleEngine.explode(rect.left+rect.width/2, rect.top+rect.height/2);
            setTimeout(()=>{
                this.tempoGlobalDefinido=true; this.xpGanhosNaSessao=0;
                const userK=`ws_ingles_user_${Workspace.usuario.id}`; this.state.itensConcluidos=[]; try{ localStorage.setItem(`${userK}_concluidos`, JSON.stringify([])); }catch{}
                this.iniciarTimerGlobal(minutos*60); this.renderizarVisualizacao(); setTimeout(()=>this.iniciarFalaGuardiao(), 600);
            },1000);
        },1500);
    },
    encerrarSessaoBau(){
        TimerService.stop(); this.tempoGlobalDefinido=false; this.sessaoEncerrada=false; this.bauDestrancado=false; this.tempoRestante=0; this.digitandoAtivo=false;
        if(this.magoIntervalTimer) clearInterval(this.magoIntervalTimer);
        const chest=document.getElementById('ig-header-chest'); if(chest){ chest.classList.remove('chest-shake','chest-explode'); chest.style.transform='scale(1)'; chest.src='/assets/bau_roxo_pixel.png'; }
        document.getElementById('ig-gameModal').style.display='none'; document.getElementById('ig-timeout-screen').style.display='none'; document.getElementById('ig-alunoView').style.display='none';
        const guardian=document.getElementById('ig-guardian-screen'); if(guardian){ guardian.style.display='flex'; guardian.style.opacity='1'; const inp=document.getElementById('ig-tempo-escolhido'); if(inp) inp.value=''; }
        this.renderizarVisualizacao(); Workspace.mostrarAviso('Sessão guardada! Escolha novo tempo.','success');
    },
    iniciarFalaGuardiao(forcarRestart=false){
        if(this.digitandoAtivo && !forcarRestart) return; this.digitandoAtivo=true;
        if(this.magoIntervalTimer) clearInterval(this.magoIntervalTimer);
        const balaoHub=document.getElementById('ig-hub-mago-text');
        const balaoGuardian=document.querySelector('#ig-guardian-screen .ig-balao-fala-static');
        const isHubVisible = this.tempoGlobalDefinido && balaoHub && document.getElementById('ig-alunoView').style.display!=='none';
        const balao = isHubVisible ? balaoHub : balaoGuardian;
        if(!balao) return; if(balao.id==='ig-hub-mago-text') balao.style.display='block'; balao.innerHTML='';
        const config=this.state.magoConfig||this.defaults.magoConfig;
        const frases=this.state.magoPhrases.length?this.state.magoPhrases:this.defaults.magoPhrases;
        let fraseBruta=''; if(config.modoExibicao==='sequencial'){ const userK=`ws_mago_acessos_${Workspace.usuario?.id||'default'}`; let acessos=parseInt(localStorage.getItem(userK)||'0'); fraseBruta=frases[acessos%frases.length].text; if(!forcarRestart) localStorage.setItem(userK, acessos+1); } else if(config.modoExibicao==='fixa'){ fraseBruta=frases[0].text; } else { fraseBruta=frases[Math.floor(Math.random()*frases.length)].text; }
        const nomeCompleto=Workspace.usuario?.nome||Workspace.usuario?.login||'Aventureiro'; let primeiro=nomeCompleto.split(' ')[0]; if(primeiro.toLowerCase()==='teste') primeiro=Workspace.usuario.tipo==='Aluno'?'Aventureiro':'Professor';
        const regex=/(?:\(citarAluno\)|citarAluno|\$\{aluno\.nome\}|\{\{aluno\.nome\}\})/gi;
        const fraseAudio=fraseBruta.replace(regex, primeiro); const fraseVisual=fraseBruta.replace(regex, primeiro.toUpperCase());
        if(config.vozAtiva) VoiceService.falar(fraseAudio,{isMago:true});
        let i=0, html=''; this.magoIntervalTimer=setInterval(()=>{ html+=fraseVisual.charAt(i); balao.innerText=html; i++; if(i>=fraseVisual.length){ clearInterval(this.magoIntervalTimer); this.digitandoAtivo=false; } },32);
    },
    iniciarTimerGlobal(segundos){ const display=document.getElementById('ig-global-timer-display'); if(display) display.style.display='flex'; TimerService.start(segundos, (rest)=>{ this.tempoRestante=rest; this.atualizarDisplayTimerGlobal(); }, ()=>{ this.sessaoEncerrada=true; this.fecharJogo(); this.renderizarVisualizacao(); }); },
    atualizarDisplayTimerGlobal(){ const d=document.getElementById('ig-global-timer-display'); if(!d) return; const m=Math.floor(this.tempoRestante/60).toString().padStart(2,'0'); const s=(this.tempoRestante%60).toString().padStart(2,'0'); d.innerText=`⏱ ${m}:${s}`; if(this.tempoRestante<30 && this.tempoRestante>0){ d.style.color='#fff'; d.style.background='#dc2626'; } else { d.style.color='#f87171'; d.style.background='rgba(239,68,68,0.15)'; } },
    renderProfessorTab(tabId){ localStorage.setItem('ws_ingles_aba_prof', tabId); document.querySelectorAll('.ig-side-item').forEach(b=>b.classList.remove('active')); document.querySelector(`.ig-side-item[data-tab="${tabId}"]`)?.classList.add('active'); const content=document.getElementById('ig-tab-content'); const state=this.state; const configMago=state.magoConfig||this.defaults.magoConfig; if(tabId==='mago'){ content.innerHTML=`<div class="ig-card"><h3 style="color:#0f172a">🧙 Mago IA</h3><div style="display:flex;gap:20px;flex-wrap:wrap;align-items:center"><label style="display:flex;gap:8px;font-weight:800;color:#0f172a"><input type="checkbox" id="mago-voz-toggle" ${configMago.vozAtiva?'checked':''}> Voz</label><select id="mago-modo-select" class="ig-input" style="width:auto"><option value="aleatorio" ${configMago.modoExibicao==='aleatorio'?'selected':''}>Aleatório</option><option value="sequencial" ${configMago.modoExibicao==='sequencial'?'selected':''}>Sequencial</option><option value="fixa" ${configMago.modoExibicao==='fixa'?'selected':''}>Fixa</option></select></div><div style="display:flex;gap:10px;margin-top:16px"><input id="nwMago" class="ig-input" style="flex:1" placeholder="Nova fala..."><button data-action="salvar-mago-phrase" style="background:#4F46E5;color:#fff;border:none;padding:12px 18px;border-radius:10px;font-weight:800;cursor:pointer">Salvar</button></div><div style="margin-top:16px">${state.magoPhrases.map((m,i)=>`<div class="ig-list-item" style="border:2px solid #e2e8f0;border-left:5px solid #4F46E5;border-radius:12px;margin-bottom:10px"><span>${i+1}. ${m.text}</span><div style="display:flex;gap:8px"><button data-action="editar-mago-phrase" data-id="${m.id}" style="cursor:pointer">✏</button><button data-action="remover-item" data-key="magoPhrases" data-id="${m.id}" style="cursor:pointer">✕</button></div></div>`).join('')}</div></div>`; }else if(tabId==='biblioteca'){ content.innerHTML=`<div class="ig-card"><h3 style="color:#0f172a">📚 Biblioteca</h3></div><div style="display:flex;gap:20px;flex-wrap:wrap"><div class="ig-card" style="flex:1;min-width:300px"><h3>Palavras (${state.words.length})</h3><div style="display:flex;gap:10px;margin-bottom:16px"><input id="nwWord" class="ig-input" placeholder="Inglês"><input id="nwTrans" class="ig-input" placeholder="Tradução"><button data-action="add-word" style="background:#4F46E5;color:#fff;border:none;padding:12px 16px;border-radius:10px;cursor:pointer;font-weight:800">Add</button></div><div>${state.words.map(w=>`<div class="ig-list-item"><span><b>${w.word}</b> - ${w.translation}</span><button data-action="remover-item" data-key="words" data-id="${w.id}" style="cursor:pointer">✕</button></div>`).join('')}</div></div></div>`; }else{ content.innerHTML=`<div class="ig-card">Aba ${tabId}</div>`; } },
    atualizarConfigMago: async function(){ const voz=document.getElementById('mago-voz-toggle')?.checked; const modo=document.getElementById('mago-modo-select')?.value; if(voz===undefined||!modo) return; this.state.magoConfig={vozAtiva:voz, modoExibicao:modo}; await this.saveDados(); Workspace.mostrarAviso('Configuração atualizada','success'); },
    inserirVariavelMago(){ const input=document.getElementById('nwMago'); if(!input) return; const s=input.selectionStart, e=input.selectionEnd, v='(citarAluno)'; input.value=input.value.substring(0,s)+v+input.value.substring(e); input.focus(); input.selectionStart=input.selectionEnd=s+v.length; },
    handleSalvarMago: async function(){ const input=document.getElementById('nwMago'); const text=input.value.trim(); if(!text) return Workspace.mostrarAviso('Escreva a fala','warning'); if(this.state.editingMagoId){ const ph=this.state.magoPhrases.find(m=>m.id===this.state.editingMagoId); if(ph) ph.text=text; this.state.editingMagoId=null; }else{ this.state.magoPhrases.unshift({id:'mago_'+Date.now(), text}); } input.value=''; await this.saveDados(); this.renderProfessorTab('mago'); },
    editarMagoPhrase(id){ const ph=this.state.magoPhrases.find(m=>m.id===id); if(!ph) return; const input=document.getElementById('nwMago'); input.value=ph.text; input.focus(); this.state.editingMagoId=id; },
    addWord: async function(){ const w=document.getElementById('nwWord').value.trim(), t=document.getElementById('nwTrans').value.trim(); if(!w) return; this.state.words.unshift({id:'w'+Date.now(), word:w, translation:t, level:'B1'}); await this.saveDados(); this.renderProfessorTab('biblioteca'); },
    addPhrase: async function(){ const p=document.getElementById('nwPhrase')?.value.trim(); if(!p) return; this.state.phrases.unshift({id:'p'+Date.now(), phrase:p}); await this.saveDados(); this.renderProfessorTab('biblioteca'); },
    remItem: async function(key,id){ this.state[key]=this.state[key].filter(i=>i.id!==id); await this.saveDados(); const active=document.querySelector('.ig-side-item.active'); if(active) this.renderProfessorTab(active.dataset.tab); },
    aprovarEnvio: async function(id){ const s=this.state.submissions.find(x=>x.id===id); if(!s) return; s.status='approved'; this.state.pool.unshift({id:'pool_'+Date.now(), type:s.game, text:s.text, word:s.text, origin:'student', student:s.student, timestamp:Date.now()}); await this.saveDados(); this.renderProfessorTab('envios'); },
    abrirJogo(id){ const game=this.defaults.games.find(g=>g.id===id); if(!game) return; this.jogoAtual=id; document.getElementById('ig-modalIcon').textContent=game.icon; document.getElementById('ig-modalTitle').textContent=game.title; document.getElementById('ig-gameModal').style.display='flex'; this.currentAudioURL=null; this.renderDesafioAtual(); },
    abrirMiniHub(){ if(this.recognition) this.recognition.stop(); document.getElementById('ig-modalIcon').textContent='🗺'; document.getElementById('ig-modalTitle').textContent='Mapa de Missões'; document.getElementById('ig-modalBody').innerHTML=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px">${this.defaults.games.map(g=>`<div data-action="abrir-jogo" data-game-id="${g.id}" style="background:${g.color};padding:18px;border-radius:14px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:12px"><div style="font-size:34px;background:rgba(255,255,255,0.7);width:58px;height:58px;border-radius:14px;display:flex;align-items:center;justify-content:center">${g.icon}</div><h4 style="margin:0;font-size:13px;color:#0f172a;font-family:Cinzel;font-weight:800;text-align:center">${g.title}</h4></div>`).join('')}</div>`; },
    fecharJogo(){ document.getElementById('ig-gameModal').style.display='none'; if(this.recognition) this.recognition.stop(); },
    sucessoGenerico: async function(bonus){
        if(this.desafioAtualObj?.id){ this.marcarComoConcluido(this.desafioAtualObj.id); this.updateSRS(this.desafioAtualObj.id, this.jogoAtual, true); }
        this.state.xp+=bonus; this.xpGanhosNaSessao+=bonus; await this.saveDados();
        const interval=this.state.srs[this.desafioAtualObj?.id]?.interval||1;
        document.getElementById('ig-modalBody').innerHTML=`<div style="text-align:center;padding:40px 20px"><div style="font-size:72px">✅</div><h2 style="font-family:Cinzel,serif;font-size:32px;color:#065f46">Excelente!</h2><div style="font-family:VT323,monospace;font-size:30px;color:#0f172a">+${bonus} XP ⭐</div><div style="background:#dcfce7;border:2px solid #86efac;color:#14532d;padding:10px 16px;border-radius:10px;font-weight:700;font-size:13px;display:inline-block;margin-top:12px">Próxima revisão em ${interval} dia(s)</div><div style="display:flex;gap:12px;justify-content:center;margin-top:28px;flex-wrap:wrap"><button data-action="proximo-desafio" style="background:#10b981;color:#fff;border:2px solid #fff;padding:14px 22px;border-radius:12px;cursor:pointer;font-weight:800">Próximo →</button><button data-action="abrir-mini-hub" style="background:#0f172a;color:#fde68a;border:2px solid #d4af37;padding:14px 22px;border-radius:12px;cursor:pointer;font-weight:800">🔄 Mudar de Jogo</button></div></div>`;
    },
    falhaGenerica: async function(){
        if(this.desafioAtualObj?.id) this.updateSRS(this.desafioAtualObj.id, this.jogoAtual, false);
        document.getElementById('ig-modalBody').innerHTML=`<div style="text-align:center;padding:40px 20px"><div style="font-size:72px">❌</div><h2 style="font-family:Cinzel,serif;font-size:32px;color:#991b1b">Quase lá!</h2><div style="background:#fee2e2;border:2px solid #fecaca;color:#7f1d1d;padding:12px 16px;border-radius:10px;font-weight:700;display:inline-block">Erro guardado. Volta em 2 min 🔥</div><div style="display:flex;gap:12px;justify-content:center;margin-top:28px;flex-wrap:wrap"><button data-action="proximo-desafio" style="background:#dc2626;color:#fff;border:2px solid #fff;padding:14px 22px;border-radius:12px;cursor:pointer;font-weight:800">Tentar Novamente ↻</button><button data-action="abrir-mini-hub" style="background:#0f172a;color:#fde68a;border:2px solid #d4af37;padding:14px 22px;border-radius:12px;cursor:pointer;font-weight:800">🔄 Mudar de Jogo</button></div></div>`;
    },
    envioAoProfessor: async function(gameId, texto, bonus=20){
        if(!texto||texto.trim().length<2) return Workspace.mostrarAviso('Responda válido','warning');
        this.state.submissions.unshift({id:'sub_'+Date.now(), student:Workspace.usuario.nome, game:gameId, text:texto, status:'pending', timestamp:Date.now()});
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
        else if(id==='sentenceShuffle') this.renderGameSentenceShuffle();
        else if(id==='answerQuest') this.renderGameAnswerQuest();
        else if(id==='questionMaker') this.renderGameQuestionMaker();
        else if(id==='contextRole') this.renderGameContextRole();
        else if(id==='debateAI') this.renderGameDebateAI();
    },
    proximoDesafio(){ if(this.tempoRestante>0) this.renderDesafioAtual(); else this.fecharJogo(); },
    renderTelaFimDeJornada(){ document.getElementById('ig-modalBody').innerHTML=`<div style="text-align:center;padding:50px 20px"><div style="font-size:72px">🏆</div><h2 style="font-family:Cinzel,serif;color:#a16207">Jornada Concluída!</h2><div style="display:flex;gap:12px;justify-content:center;margin-top:20px"><button data-action="abrir-mini-hub" style="background:#0f172a;color:#fde68a;border:2px solid #d4af37;padding:12px 20px;border-radius:10px;cursor:pointer;font-weight:800">🔄 Mudar</button><button data-action="fechar-jogo" style="background:#fff;border:2px solid #e2e8f0;padding:12px 20px;border-radius:10px;cursor:pointer;font-weight:800">Fechar</button></div></div>`; },
    renderGameWordSpark(){ this.desafioAtualObj=this.obterItemInteligente(this.state.words,'word'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada(); const w=this.desafioAtualObj; document.getElementById('ig-modalBody').innerHTML=`<div style="text-align:center"><div class="ig-big-phrase" style="font-size:36px">${w.word}</div><p style="color:#334155;font-weight:700">${w.translation}</p><div class="ig-big-phrase" style="font-size:18px">Crie uma frase com <b>${w.word}</b></div><textarea id="ig-input" class="ig-textarea" placeholder="Type your sentence..." style="min-height:90px"></textarea><button data-action="verificar-wordSpark" style="width:100%;background:#4F46E5;color:#fff;border:none;padding:16px;border-radius:12px;margin-top:16px;cursor:pointer;font-weight:800">Lançar Feitiço ✨</button></div>`; },
    renderGameReadAloud(){ this.desafioAtualObj=this.obterItemInteligente(this.state.phrases,'phrase'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada(); const p=this.desafioAtualObj; document.getElementById('ig-modalBody').innerHTML=`<div class="ig-big-phrase">${p.phrase}</div><div style="text-align:center;margin:16px 0"><button data-action="falar-frase" style="background:#0f172a;color:#fde68a;border:2px solid #d4af37;border-radius:30px;padding:10px 22px;cursor:pointer;font-weight:800">🔊 Ouvir</button></div><div style="text-align:center;background:#f8fafc;padding:22px;border-radius:14px;border:2px solid #e2e8f0"><button data-action="iniciar-voz" data-tipo="phrase" style="background:#10B981;color:#fff;width:100%;border-radius:30px;padding:14px;border:none;font-weight:800;cursor:pointer">🎤 Iniciar Sopro</button><div id="ig-speechResult" style="margin-top:14px"></div></div>`; },
    renderGameListenType(){ this.desafioAtualObj=this.obterItemInteligente(this.state.phrases,'phrase'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada(); document.getElementById('ig-modalBody').innerHTML=`<div style="text-align:center;padding:10px"><div style="font-size:64px">🦉</div><h3 style="font-family:Cinzel,serif;color:#0f172a">Escute e transcreva</h3><button data-action="falar-frase" style="background:#4F46E5;color:#fff;border-radius:30px;padding:12px 28px;border:none;cursor:pointer;font-weight:800">🔊 Tocar</button><input id="ig-listenInput" class="ig-input" placeholder="Transcreva..." style="margin-top:22px;text-align:center;font-weight:700"><button data-action="verificar-listen" style="width:100%;background:#10B981;color:#fff;margin-top:16px;border:none;padding:14px;border-radius:12px;cursor:pointer;font-weight:800">Desvendar</button></div>`; },
    renderGameQuiz(){ this.desafioAtualObj=this.obterItemInteligente(this.state.quizzes,'quiz'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada(); const q=this.desafioAtualObj; document.getElementById('ig-modalBody').innerHTML=`<div class="ig-big-phrase" style="font-family:Cinzel,serif;font-size:20px">${q.question}</div><div style="display:flex;flex-direction:column;gap:12px;margin-top:20px">${q.options.map((o,i)=>`<button data-action="verificar-quiz" data-index="${i}" style="background:#ffffff;border:2.5px solid #e2e8f0;padding:16px;border-radius:12px;cursor:pointer;text-align:left;font-weight:700;color:#0f172a">${o}</button>`).join('')}</div>`; },
    renderGameWordPicker(){ this.desafioAtualObj=this.obterItemInteligente(this.defaults.wordPickers,'picker'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada(); const s=this.desafioAtualObj; document.getElementById('ig-modalBody').innerHTML=`<div class="ig-big-phrase" style="color:#4338ca;background:#eef2ff;border-color:#818cf8">${s.text}</div><div style="display:flex;gap:12px;justify-content:center;margin-top:22px;flex-wrap:wrap">${s.options.map((o,i)=>`<button data-action="verificar-picker" data-index="${i}" style="background:#ffffff;border:2.5px solid #e2e8f0;padding:14px 26px;border-radius:30px;cursor:pointer;font-weight:800;color:#0f172a">${o}</button>`).join('')}</div>`; },
    renderGameMinimalPairs(){ this.desafioAtualObj=this.obterItemInteligente(this.defaults.minimalPairs,'minimal'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada(); const pair=this.desafioAtualObj; const target=Math.random()>0.5?pair.a:pair.b; this.state._minimalTarget=target; document.getElementById('ig-modalBody').innerHTML=`<div style="text-align:center"><h3 style="font-family:Cinzel,serif;font-size:22px;color:#0f172a">👄 Sussurros Gêmeos</h3><div style="background:#0f172a;padding:24px;border-radius:16px;margin-top:18px"><button data-action="falar-frase" style="background:#4F46E5;color:#fff;padding:14px 28px;border-radius:30px;border:2px solid #fff;cursor:pointer;font-weight:800">🎧 Ouvir</button><div style="display:flex;gap:12px;justify-content:center;margin-top:20px"><button data-action="verificar-minimal" data-choice="${pair.a}" style="background:#fff;padding:14px 28px;border-radius:12px;cursor:pointer;font-weight:800">${pair.a}</button><button data-action="verificar-minimal" data-choice="${pair.b}" style="background:#fff;padding:14px 28px;border-radius:12px;cursor:pointer;font-weight:800">${pair.b}</button></div></div></div>`; },
    renderGamePicturePop(){ this.desafioAtualObj=this.obterItemInteligente(this.state.pictures,'picture'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada(); const pic=this.desafioAtualObj; document.getElementById('ig-modalBody').innerHTML=`<div style="text-align:center"><div style="width:150px;height:150px;border-radius:24px;background:#f8fafc;border:4px solid #d4af37;display:flex;align-items:center;justify-content:center;margin:20px auto;font-size:80px">${pic.emoji}</div><div style="background:#0f172a;padding:22px;border-radius:16px"><button data-action="iniciar-voz" data-tipo="picture" style="background:#10B981;color:#fff;width:100%;border-radius:30px;padding:14px;border:none;font-weight:800;cursor:pointer">🎤 Falar Nome</button><div id="ig-speechResult" style="margin-top:14px"></div><input id="ig-input" class="ig-input" placeholder="Ou digita..." style="margin-top:15px;text-align:center"><button data-action="verificar-picture-text" style="width:100%;background:#f8fafc;color:#0f172a;margin-top:12px;padding:14px;border-radius:12px;cursor:pointer;font-weight:800;border:none">Verificar</button></div></div>`; },
    renderGameSentenceShuffle(){ this.desafioAtualObj=this.obterItemInteligente(this.state.phrases,'phrase'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada(); const phrase=this.desafioAtualObj; const task=['Transforme em Pergunta ❓','Transforme em Negativa 🚫'][Math.floor(Math.random()*2)]; document.getElementById('ig-modalBody').innerHTML=`<div style="text-align:center"><span style="background:#0f172a;color:#fde68a;padding:8px 16px;border-radius:20px;font-weight:800;font-size:13px;border:2px solid #d4af37">${task}</span></div><div class="ig-big-phrase" style="margin-top:16px;font-family:Cinzel,serif">${phrase.phrase}</div><textarea id="ig-input" class="ig-textarea" placeholder="Sua frase transformada..." style="min-height:110px"></textarea><button data-action="verificar-envio" data-game="sentenceShuffle" data-bonus="50" style="width:100%;margin-top:16px;background:#4F46E5;color:#fff;border:none;padding:16px;border-radius:12px;cursor:pointer;font-weight:800">Submeter 🔀</button>`; },
    renderGameAnswerQuest(){ this.desafioAtualObj=this.obterItemInteligente(this.defaults.questions,'question'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada(); const q=this.desafioAtualObj; document.getElementById('ig-modalBody').innerHTML=`<div class="ig-big-phrase" style="background:#fef3c7;border-color:#f59e0b;color:#92400e;font-family:Cinzel,serif">❓ ${q.text}</div><textarea id="ig-input" class="ig-textarea" placeholder="Sua resposta em inglês..." style="min-height:120px"></textarea><button data-action="verificar-envio" data-game="answerQuest" data-bonus="50" style="width:100%;margin-top:16px;background:#d4af37;color:#000;border:2px solid #fff;padding:16px;border-radius:12px;cursor:pointer;font-weight:800">Enviar 🚀</button>`; },
    renderGameQuestionMaker(){
        const poolAnswers=this.state.pool.filter(p=>p.type==='answerQuest').map(p=>({id:p.id, text:p.text}));
        this.desafioAtualObj = poolAnswers.length ? this.obterItemInteligente(poolAnswers,'qmaker') : null;
        if(!this.desafioAtualObj){
            document.getElementById('ig-modalBody').innerHTML=`<div style="text-align:center;padding:30px"><div style="font-size:64px">🔮</div><h3 style="color:#0f172a;font-family:Cinzel">Espelho embaçado</h3><p style="color:#475569;font-weight:600">Ninguém respondeu Pergaminho ainda. Jogue 📜 primeiro!</p><button data-action="abrir-jogo" data-game-id="answerQuest" style="background:#4F46E5;color:#fff;border:none;padding:12px 20px;border-radius:10px;cursor:pointer;font-weight:800;margin-top:14px">Ir para Pergaminho 📜</button></div>`;
            return;
        }
        const a=this.desafioAtualObj;
        document.getElementById('ig-modalBody').innerHTML=`<p style="color:#475569;font-size:12px;text-align:center;font-weight:800;text-transform:uppercase">Um aventureiro respondeu:</p><div class="ig-big-phrase" style="background:#eef2ff;color:#4338ca;font-style:italic;border-color:#818cf8">💬 "${(Workspace.escapeHTML||((t)=>t))(a.text)}"</div><p style="margin-top:18px;font-weight:800;text-align:center;color:#0f172a">Que pergunta gerou esta resposta?</p><textarea id="ig-input" class="ig-textarea" placeholder="Ex: Why do you love traveling?"></textarea><button data-action="verificar-envio" data-game="questionMaker" data-bonus="50" style="width:100%;background:#4F46E5;color:#fff;margin-top:16px;border:none;padding:16px;border-radius:12px;cursor:pointer;font-weight:800">Verificar no Espelho 🔮</button>`;
    },
    renderGameContextRole(){ this.desafioAtualObj=this.obterItemInteligente(this.defaults.roleplays,'roleplay'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada(); const c=this.desafioAtualObj; document.getElementById('ig-modalBody').innerHTML=`<div class="ig-big-phrase" style="font-family:Cinzel,serif;text-align:left"><div style="font-size:18px;color:#0f172a">${c.title}</div><div style="font-size:15px;font-weight:700;color:#334155;background:#f1f5f9;padding:10px 14px;border-radius:10px;margin-top:10px;border-left:4px solid #4F46E5">${c.prompt}</div></div><p style="font-size:13px;background:#fef3c7;color:#92400e;padding:12px 14px;border-radius:10px;font-weight:800;border:1.5px solid #fde68a">💡 Dica: ${c.tip}</p><textarea id="ig-input" class="ig-textarea" placeholder="O que você responde em inglês?..." style="min-height:110px"></textarea><button data-action="verificar-envio" data-game="contextRole" data-bonus="60" style="width:100%;margin-top:16px;background:#10B981;color:#fff;border:none;padding:16px;border-radius:12px;cursor:pointer;font-weight:800">Assumir Papel 🎭</button>`; },
    renderGameDebateAI(){ this.desafioAtualObj=this.obterItemInteligente(this.defaults.debates,'debate'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada(); const topic=this.desafioAtualObj; document.getElementById('ig-modalBody').innerHTML=`<div class="ig-big-phrase" style="font-family:Cinzel,serif"><div style="font-size:28px">⚔</div><span style="font-size:19px;color:#0f172a">${topic.topic}</span><br><span style="font-size:13px;color:#475569;font-family:sans-serif;font-weight:600;margin-top:12px;display:block;background:#f8fafc;padding:10px;border-radius:8px;border:1px solid #e2e8f0">${topic.starter||''}</span></div><textarea id="ig-input" class="ig-textarea" placeholder="Defenda sua posição em inglês..." style="min-height:130px"></textarea><button data-action="verificar-envio" data-game="debateAI" data-bonus="75" style="width:100%;background:#0f172a;color:#fde68a;border:2px solid #d4af37;margin-top:16px;padding:16px;border-radius:12px;cursor:pointer;font-weight:800">Contra-Atacar ⚔</button>`; },
    iniciarReconhecimentoDeVoz(esperado, itemObj, tipoConteudo){
        const btn=document.getElementById('ig-modalBody').querySelector('[data-action="iniciar-voz"]'); const resEl=document.getElementById('ig-speechResult');
        if(!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)){ Workspace.mostrarAviso('Navegador sem suporte a voz','warning'); return; }
        const SR=window.SpeechRecognition||window.webkitSpeechRecognition; this.recognition=new SR(); this.recognition.lang='en-US'; this.recognition.interimResults=false; this.recognition.maxAlternatives=1;
        if(btn){ btn.innerText='🎧 Escutando...'; btn.style.background='#f59e0b'; } this.recognition.start();
        this.recognition.onresult=(e)=>{ const falado=e.results[0][0].transcript; if(btn){ btn.style.background='#0f172a'; btn.innerText=`Lido: "${falado}"`; } const sim=this.similaridade(falado, esperado); if(sim>=0.75){ if(resEl) resEl.innerHTML=`<div style="background:#dcfce7;color:#14532d;padding:12px;border-radius:10px;font-weight:800;border:2px solid #86efac">✅ Perfeito!</div>`; if(itemObj) this.updateSRS(itemObj.id, tipoConteudo, true); this.superarErro(itemObj?.id); this.sucessoGenerico(75); } else { if(resEl) resEl.innerHTML=`<div style="background:#fee2e2;color:#7f1d1d;padding:12px;border-radius:10px;font-weight:800;border:2px solid #fecaca">❌ Entendi: "${falado}"</div>`; if(itemObj) this.registrarErro(itemObj, tipoConteudo); this.falhaGenerica(); } };
        this.recognition.onerror=()=>{ if(btn){ btn.style.background='#10B981'; btn.innerText='🎤 Tentar novamente'; } Workspace.mostrarAviso('Não consegui ouvir','error'); };
    }
};
