// js/modulos/workspace/ingles.js - Módulo Central e RPG do Aluno (Refatorado V13)
window.Workspace = window.Workspace || {};
if(!window.Workspace.escapeHTML){
    window.Workspace.escapeHTML = (s)=> String(s||'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}

const VoiceService = (() => {
    let cacheNormal = null, cacheMago = null, resolver = null;
    const ready = new Promise(r => resolver = r);
    const FEMALE_BLOCK = ['female','samantha','zira','karen','victoria','tessa','moira','siri','veena','fiona','susan','heather','jenny','aria','emma','michelle','linda','karen'];
    const SCORE_NORMAL = [{k:'david', s:1000}, {k:'alex', s:950}, {k:'daniel', s:900}, {k:'google uk english male', s:880}, {k:'mark', s:850}, {k:'arthur', s:800}];
    const SCORE_MAGO = [{k:'david', s:1000}, {k:'alex', s:990}, {k:'daniel', s:950}, {k:'google uk english male', s:930}, {k:'arthur', s:900}];

    const pick = (voices, isMago) => {
        const en = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
        if(!en.length) return null;
        const pool = en.filter(v => !FEMALE_BLOCK.some(f => (v.name+v.voiceURI).toLowerCase().includes(f)));
        const base = pool.length ? pool : en;
        const map = isMago ? SCORE_MAGO : SCORE_NORMAL;
        const scored = base.map(v=>{
            const id=(v.name+' '+v.voiceURI).toLowerCase();
            let sc=100; map.forEach(o=>{ if(id.includes(o.k)) sc=o.s; });
            if(id.includes('male') && !id.includes('female')) sc+=200;
            if(v.localService) sc+=80; if(v.default) sc+=50;
            return {v, sc, id};
        }).sort((a,b)=>b.sc-a.sc);
        return scored[0]?.v || null;
    };

    const init = () => {
        const vs = window.speechSynthesis?.getVoices() || [];
        if(vs.length){ 
            cacheNormal = pick(vs, false); cacheMago = pick(vs, true) || cacheNormal;
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
            if(freshVoices.length && !cacheNormal){
                cacheNormal = pick(freshVoices, false); cacheMago = pick(freshVoices, true) || cacheNormal;
            }
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
            const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
            const voz = isMago ? (cacheMago || cacheNormal) : cacheNormal;

            if(voz){
                u.voice = voz; u.lang = voz.lang;
                if(isMago){
                    if(isIOS){ u.pitch = 0.75; u.rate = 0.88; } else if(isMobile){ u.pitch = 0.70; u.rate = 0.88; } else { u.pitch = 0.80; u.rate = 0.85; }
                } else { u.pitch = isMobile ? 0.85 : 0.92; u.rate = rate; }
            }else{
                u.lang = isMobile ? 'en-GB' : 'en-US'; u.pitch = isMago ? 0.30 : 0.45; u.rate = isMago ? 0.85 : rate;
            }
            window.speechSynthesis.speak(u);
            return new Promise(res=>{ u.onend=res; u.onerror=res; });
        }
    };
})();

const SRSService = {
    calc(success, entry){
        const now=Date.now(); let {ease=2.5, interval=0, repetitions=0, lapses=0} = entry||{};
        if(success){
            if(repetitions===0) interval=1; else if(repetitions===1) interval=6; else interval=Math.round(interval*ease);
            repetitions++; ease=Math.min(3.0, ease+0.05);
        }else{ lapses++; repetitions=0; interval=0; ease=Math.max(1.3, ease-0.2); }
        return {ease, interval, repetitions, lapses, due: success ? now + interval*24*60*60*1000 : now + 2*60*1000, lastSeen:now, updatedAt:now};
    }
};

Workspace.Ingles = {
    state: {
        _dbLoaded: false,
        xp:0, streak:1, avatarEquipado:null, inventario:[], coins:{bronze:150, prata:20, ouro:2}, diamantes:250, energia:5, 
        words:[], phrases:[], quizzes:[], pictures:[], minimalPairs:[], debates:[], submissions:[], pool:[],
        errosRetidos:[], itensConcluidos:[], magoPhrases:[], srs:{}, magoConfig:{ vozAtiva:true, modoExibicao:'aleatorio' }
    },
    jogoAtual:null, desafioAtualObj:null,

    defaults: {
        words:[{id:'w1', word:'Although', translation:'Embora', level:'B2'}, {id:'w2', word:'Beneath', translation:'Abaixo de', level:'B1'}],
        phrases:[{id:'p1', phrase:'Could you tell me where the nearest pharmacy is?', translation:'Você poderia me dizer onde fica a farmácia mais próxima?', level:'A2'}],
        quizzes:[{id:'q1', question:'Choose the correct sentence:', options:['I have been to London last year','I went to London last year'], correct:1}],
        pictures:[{id:'pic1', word:'apple', translation:'maçã', emoji:'🍎', category:'Food'}],
        minimalPairs:[{id:'mp1', a:'ship', b:'sheep'}],
        debates:[{id:'d1', topic:'Social media does more harm than good', starter:'Social media connects us. What is your opinion?'}],
        wordPickers:[{id:'wp1', text:'I have _____ my keys.', options:['lost','lose'], correct:0}],
        questions:[{id:'aq1', text:'What did you do last weekend?'}],
        roleplays:[{id:'rp1', title:'✈ No Aeroporto', prompt:'Attendant: Can I see your passport?', tip:'Use: Here you are'}],
        magoConfig:{ vozAtiva:true, modoExibicao:'aleatorio' },
        magoPhrases:[{id:'m1', text:'Let us go! (citarAluno)'}],
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
    },

    renderizarVisualizacao: function() { this.abrirBau(); },
    abrirBau(){ Workspace.navegarPara('ingles'); if(this.loadDados) this.loadDados().then(() => this.verificarAcesso()); },
    
    verificarAcesso() {
        const isProfessor = Workspace.usuario?.tipo !== 'Aluno';
        if(isProfessor) {
            document.getElementById('professorView').classList.remove('hidden');
            document.getElementById('alunoView').classList.add('hidden');
            if(Workspace.InglesProfessor) Workspace.InglesProfessor.renderProfessorTab('biblioteca');
        } else {
            document.getElementById('alunoView').classList.remove('hidden');
            document.getElementById('professorView').classList.add('hidden');
            this.renderAlunoGrid();
            this.atualizarHUD();
        }
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
                    this.state.words = [...this.defaults.words]; this.state.phrases = [...this.defaults.phrases];
                    this.state.quizzes = [...this.defaults.quizzes]; this.state.pictures = [...this.defaults.pictures];
                    this.state.wordPickers = [...this.defaults.wordPickers]; this.state.minimalPairs = [...this.defaults.minimalPairs];
                    this.state.debates = [...this.defaults.debates]; this.state.roleplays = [...this.defaults.roleplays];
                    this.state.questions = [...this.defaults.questions];
                }

                this.state.submissions = Array.isArray(d.submissions) ? d.submissions : [];
                this.state.pool = Array.isArray(d.pool) ? d.pool : [];
                this.state.errosRetidos = Array.isArray(d.errosRetidos) ? d.errosRetidos : [];
                this.state.srs = (d.srs && typeof d.srs==='object') ? d.srs : {};
                this.state.magoPhrases = Array.isArray(d.magoPhrases) ? d.magoPhrases : [...this.defaults.magoPhrases];
                this.state.quests = Array.isArray(d.quests) ? d.quests : [];
                this.state.lootTables = (d.lootTables && typeof d.lootTables === 'object') ? d.lootTables : {comum:[], epico:[], lendario:[]};
                this.state.season = (d.season && typeof d.season === 'object') ? d.season : {id:'S1', nome:'Era Inicial', xpMultiplier:1};
            }
        } catch(e) { console.error('Erro de conexão ao ler Banco de Dados:', e); }
    },

    async saveDados(){
        try{
            if(Workspace.usuario?.tipo==='Aluno'){
                Workspace.api('/workspace/ingles/xp','POST', {
                    userId: Workspace.usuario.id, escolaId: Workspace.usuario.escolaId, xp: this.state.xp
                }).catch(()=>{});
            }
            
            const res = await Workspace.api('/workspace/ingles/dados','PUT',{
                escolaId: Workspace.usuario?.escolaId||'DEFAULT',
                words:this.state.words, phrases:this.state.phrases, quizzes:this.state.quizzes, pictures:this.state.pictures,
                wordPickers:this.state.wordPickers, minimalPairs:this.state.minimalPairs, debates:this.state.debates, roleplays:this.state.roleplays, questions:this.state.questions,
                submissions:this.state.submissions, pool:this.state.pool, errosRetidos:this.state.errosRetidos, srs:this.state.srs,
                magoPhrases:this.state.magoPhrases, quests:this.state.quests, lootTables:this.state.lootTables, season:this.state.season
            });
            if(res && res.success) this.state._dbLoaded = true; 
        }catch(e){}
    },

    getSRS(id){ return this.state.srs[id] || null; },
    updateSRS(id, tipo, success){
        const next = SRSService.calc(success, this.state.srs[id] || {ease:2.5, interval:0, repetitions:0, lapses:0, due:0, tipo});
        next.tipo = tipo; next.id = id; this.state.srs[id] = next; this.saveDados(); return next;
    },
    registrarErro(item, tipoConteudo){
        if(!item?.id) return;
        if(!this.state.errosRetidos.find(e=>e.id===item.id)) this.state.errosRetidos.push({...item, _tipoDefeito:tipoConteudo});
        this.updateSRS(item.id, tipoConteudo, false);
    },
    superarErro(itemId){
        this.state.errosRetidos = this.state.errosRetidos.filter(e=>e.id!==itemId);
    },
    marcarComoConcluido(itemId){
        if(itemId && !this.state.itensConcluidos.includes(itemId)) this.state.itensConcluidos.push(itemId);
    },

    obterItemInteligente(listaPadrao, tipoConteudo){
        if(!Array.isArray(listaPadrao) || !listaPadrao.length) return null;
        const now = Date.now();
        const concluidos = this.state.itensConcluidos || [];
        
        const comSRS = listaPadrao.map(item=>{
            const srs = this.state.srs[item.id];
            return {item, srs, isDue: srs ? srs.due <= now : false, isNew: !srs || srs.repetitions===0};
        });
        
        const vencidos = comSRS.filter(e=>e.srs && e.isDue).sort((a,b)=>a.srs.due - b.srs.due);
        if(vencidos.length) return vencidos[Math.floor(Math.random()*Math.min(3,vencidos.length))].item;
        
        const retidos = this.state.errosRetidos.filter(e=>e._tipoDefeito===tipoConteudo && !concluidos.includes(e.id));
        if(retidos.length && Math.random()<0.6) return retidos[Math.floor(Math.random()*retidos.length)];
        
        const novos = comSRS.filter(e=>e.isNew && !concluidos.includes(e.item.id));
        if(novos.length) return novos[Math.floor(Math.random()*novos.length)].item;
        
        const disponiveis = listaPadrao.filter(i=>!concluidos.includes(i.id) || (this.state.srs[i.id]?.due||0) <= now);
        if(!disponiveis.length) {
            const idsDesteJogo = listaPadrao.map(i => i.id);
            this.state.itensConcluidos = concluidos.filter(id => !idsDesteJogo.includes(id));
            this.saveDados(); return listaPadrao[Math.floor(Math.random() * listaPadrao.length)];
        }
        return disponiveis[Math.floor(Math.random()*disponiveis.length)];
    },

    tocarSom(tipo){
        try{
            const ctx = new (window.AudioContext||window.webkitAudioContext)();
            const osc = ctx.createOscillator(); const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            if(tipo==='coin'){ osc.frequency.value=800; gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime+0.3); osc.start(); osc.stop(ctx.currentTime+0.3); }
        }catch{}
    },
    similaridade(a,b){
        const norm = s=>s.toLowerCase().trim().replace(/[^\w\s]/g,'');
        let nA = norm(a), nB = norm(b);
        if(nA===nB) return 1; if(nB.includes(nA)||nA.includes(nB)) return 0.9;
        return nA.split(' ').some(w=>nB.includes(w))?0.6:0;
    },
    falar: (text, lang='en-US', pitch=1, rate=0.95, isMago=false) => VoiceService.falar(text,{rate, isMago}),
    mostrarAvisoLocal(msg, tipo='success'){
        const toast = document.getElementById('toast'); if(!toast) return;
        toast.innerHTML = msg; toast.style.background = tipo==='success' ? '#10B981' : (tipo==='error'?'#EF4444':'#F59E0B');
        toast.classList.remove('hidden'); setTimeout(()=>toast.classList.add('hidden'), 2000);
    },

    injetarCSS(){
        if(document.getElementById('ws-ingles-css')) return;
        const style = document.createElement('style'); style.id = 'ws-ingles-css';
        style.textContent = `
            #ws-ingles-container { background: #f8fafc; min-height: 80vh; font-family: 'Inter', sans-serif; }
            #bau-do-ingles-module { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .bau-header { display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 16px 24px; border-radius: 16px; border: 1px solid #e2e8f0; margin-bottom: 24px; flex-wrap: wrap; gap: 15px; }
            .bau-title { display: flex; align-items: center; gap: 16px; }
            .bau-icon { font-size: 40px; background: #FEF3C7; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; border-radius: 16px; border: 2px solid #F59E0B; }
            .bau-title h2 { margin: 0; font-size: 22px; color: #0F172A; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; }
            .bau-actions { display: flex; align-items: center; gap: 16px; }
            .toggle-wrap { display: flex; background: #E2E8F0; padding: 4px; border-radius: 12px; }
            .toggle-btn { background: transparent; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 700; color: #64748B; cursor: pointer; transition: 0.2s; font-size: 13px; }
            .toggle-btn.active { background: #fff; color: #0F172A; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
            .games-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
            .ig-game-card { background: #fff; border: 2px solid #E2E8F0; border-radius: 16px; padding: 20px; cursor: pointer; transition: 0.2s; }
            .ig-game-card:hover { border-color: #4F46E5; transform: translateY(-4px); box-shadow: 0 10px 25px rgba(79,70,229,0.1); }
            .ig-game-card .ig-icon { font-size: 32px; width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
            .modal { position: fixed; inset: 0; background: rgba(15,23,42,0.85); display: flex; align-items: center; justify-content: center; z-index: 100000; backdrop-filter: blur(5px); }
            .modal.hidden { display: none !important; }
            .modal-content { background: #fff; width: 95%; max-width: 650px; border-radius: 20px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.25); border: 1px solid #E2E8F0; }
            .close-btn { background: #FEE2E2; border: none; width: 32px; height: 32px; border-radius: 8px; color: #EF4444; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
            .ig-big-phrase { background: #F1F5F9; border: 2px solid #E2E8F0; color: #0F172A; font-weight: 700; font-size: 20px; text-align: center; padding: 20px; border-radius: 12px; margin: 16px 0; }
            .ig-input, .ig-textarea { background: #fff; color: #0F172A; border: 2px solid #CBD5E1; border-radius: 12px; font-weight: 500; font-size: 14px; width: 100%; padding: 12px; box-sizing: border-box; outline: none; transition: 0.2s; }
            .ws-btn { font-weight: 700; font-family: 'Inter', sans-serif; transition: 0.2s; cursor: pointer;}
            .hidden { display: none !important; }
            .toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #F59E0B; color: #fff; padding: 12px 24px; border-radius: 30px; font-weight: 800; z-index: 100001; }
        `;
        document.head.appendChild(style);
    },

    construirHTML(){
        let container = document.getElementById('ws-ingles-container');
        if(!container){ 
            container = document.createElement('div'); container.id = 'ws-ingles-container'; container.style.display = 'none'; 
            document.getElementById('ws-main-container')?.parentNode.appendChild(container);
        }
        container.innerHTML = `
            <div id="bau-do-ingles-module">
                <div class="bau-header">
                    <div class="bau-title"><div class="bau-icon">🏴‍☠️</div><div><h2>Baú do Inglês</h2><p>Treino contínuo e inteligente</p></div></div>
                    <div class="bau-actions">
                        <div class="toggle-wrap">
                            <button id="btnProfessor" class="toggle-btn" data-action="toggle-prof">👨‍🏫 Professor</button>
                            <button id="btnAluno" class="toggle-btn active" data-action="toggle-aluno">🎓 Aluno</button>
                        </div>
                    </div>
                </div>
                <main id="app">
                    <section id="professorView" class="hidden"></section>
                    <section id="alunoView"><div class="games-grid" id="gamesGrid"></div></section>
                </main>
            </div>
            <div id="gameModal" class="modal hidden">
                <div class="modal-content">
                    <div style="padding:16px 24px; border-bottom:1px solid #E2E8F0; background:#F8FAFC; display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:12px;"><span id="modalIcon" style="font-size:24px;"></span><h2 id="modalTitle" style="margin:0; font-size:18px; color:#0F172A; font-weight:800;"></h2></div>
                        <button data-action="fechar-jogo" class="close-btn">✕</button>
                    </div>
                    <div id="modalBody" style="padding:24px; overflow-y:auto; flex:1;"></div>
                </div>
            </div>
            <div id="toast" class="toast hidden"></div>
        `;
    },

    atualizarHUD() {}, // Reservado

    bindEvents(){
        const root = document.getElementById('ws-ingles-container');
        if(!root || root._bound) return; root._bound=true;
        
        root.addEventListener('click', async e=>{
            const b = e.target.closest('[data-action]'); if(!b) return;
            const a = b.dataset.action;
            
            // 🚀 REDIRECIONA AÇÕES DO PROFESSOR PARA O NOVO FICHEIRO
            const profActions = ['render-tab', 'testar-voz-mago', 'inserir-variavel-mago', 'salvar-mago-phrase', 'editar-mago-phrase', 'remover-item', 'add-word', 'add-phrase', 'add-quiz', 'add-pic', 'add-wordPicker', 'add-minimal', 'add-debate', 'add-roleplay', 'add-question', 'add-quest', 'add-loot', 'aprovar-envio', 'rejeitar-envio', 'rem-quest', 'rem-loot', 'salvar-season', 'reset-season', 'atualizar-ranking'];
            
            if (profActions.includes(a)) {
                if (Workspace.InglesProfessor && typeof Workspace.InglesProfessor.handleAction === 'function') {
                    Workspace.InglesProfessor.handleAction(a, b);
                } else {
                    this.mostrarAvisoLocal('Módulo do Professor não carregado.', 'error');
                }
                return;
            }

            if(a === 'toggle-prof') {
                if(Workspace.usuario?.tipo === 'Aluno') return this.mostrarAvisoLocal('Apenas para Mestres!','error');
                document.getElementById('btnProfessor').classList.add('active'); document.getElementById('btnAluno').classList.remove('active');
                document.getElementById('professorView').classList.remove('hidden'); document.getElementById('alunoView').classList.add('hidden');
                if(Workspace.InglesProfessor) Workspace.InglesProfessor.renderProfessorTab('biblioteca');
            }
            if(a === 'toggle-aluno') {
                document.getElementById('btnAluno').classList.add('active'); document.getElementById('btnProfessor').classList.remove('active');
                document.getElementById('alunoView').classList.remove('hidden'); document.getElementById('professorView').classList.add('hidden');
            }

            if(a === 'fechar-jogo') this.fecharJogo();
            if(a === 'abrir-jogo') this.abrirJogo(b.dataset.gameId);
            if(a === 'iniciar-jogo') { e.preventDefault(); this.renderDesafioAtual(); }

            const cur = this.desafioAtualObj;
            const input = document.getElementById('ig-input')?.value?.trim()||'';
            const listen = document.getElementById('ig-listenInput')?.value?.trim()||'';
            
            if(a === 'falar-frase') VoiceService.falar(cur?.phrase || cur?.word || b.dataset.text);
            if(a === 'iniciar-voz') this.iniciarReconhecimentoDeVoz(cur?.word||cur?.phrase||this.state._minimalTarget, cur, b.dataset.tipo||'phrase');
            
            if(a === 'verificar-wordSpark') { if(!input.toLowerCase().includes((cur.word||'').toLowerCase())){ this.registrarErro(cur,'word'); this.falhaGenerica(); } else { this.updateSRS(cur.id,'word',true); this.superarErro(cur.id); this.sucessoGenerico(50); } }
            if(a === 'verificar-listen') { if(this.similaridade(listen, cur.phrase)>=0.9){ this.updateSRS(cur.id,'phrase',true); this.superarErro(cur.id); this.sucessoGenerico(50); } else { this.registrarErro(cur,'phrase'); this.falhaGenerica(); } }
            if(a === 'verificar-quiz') { if(parseInt(b.dataset.index)===cur.correct){ this.updateSRS(cur.id,'quiz',true); this.superarErro(cur.id); this.sucessoGenerico(30); } else { this.registrarErro(cur,'quiz'); this.falhaGenerica(); } }
            if(a === 'verificar-minimal') { if(b.dataset.choice===this.state._minimalTarget){ this.updateSRS(cur.id,'minimal',true); this.superarErro(cur.id); this.sucessoGenerico(75); } else { this.registrarErro(cur,'minimal'); this.falhaGenerica(); } }
            if(a === 'verificar-picker') { if(parseInt(b.dataset.index)===cur.correct){ this.updateSRS(cur.id,'picker',true); this.superarErro(cur.id); this.sucessoGenerico(20); } else { this.registrarErro(cur,'picker'); this.falhaGenerica(); } }
            if(a === 'verificar-picture-text') { if(this.similaridade(input, cur.word)>=0.9){ this.updateSRS(cur.id,'picture',true); this.superarErro(cur.id); this.sucessoGenerico(75); } else { this.registrarErro(cur,'picture'); this.falhaGenerica(); } }
            if(a === 'verificar-envio') {
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
                this.renderGameDebateAI(); 
                setTimeout(() => {
                    this.state._debateChat.push({role:'ai', text: `Interesting point. But what if we consider that "${texto.substring(0,30)}..." might have side effects?` });
                    this.renderGameDebateAI();
                }, 1500);
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
                <div class="ig-top"><div class="ig-icon" style="background:${g.color}30; color:${g.color.replace('E0E7FF','#4F46E5').replace('FEF3C7','#D97706').replace('D1FAE5','#059669')}">${g.icon}</div></div>
                <h3 style="margin: 0 0 6px 0; color: #0F172A; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 18px;">${g.title} ${vencidos?'🔥':''}</h3>
                <p style="margin: 0; color: #64748B; font-size: 13px; line-height: 1.4;">${g.desc}</p>
            </div>`;
        }).join('');
    },

    abrirJogo(id){
        try{ speechSynthesis.cancel(); }catch{}
        this.jogoAtual = id; const game = this.defaults.games.find(g=>g.id===id); if(!game) return;
        if(id !== 'debateAI') this.state._debateChat=[];
        document.getElementById('modalIcon').textContent = game.icon; document.getElementById('modalTitle').textContent = game.title;
        document.getElementById('gameModal').classList.remove('hidden'); this.renderGameCapa();
    },

    fecharJogo(){
        try{ speechSynthesis.cancel(); }catch{}
        document.getElementById('gameModal').classList.add('hidden'); this.renderAlunoGrid();
    },

    sucessoGenerico: async function(bonusBase){
        if(this.desafioAtualObj?.id){ this.marcarComoConcluido(this.desafioAtualObj.id); this.updateSRS(this.desafioAtualObj.id, this.jogoAtual, true); }
        this.ganharCoins('bronze', bonusBase); this.tocarSom('coin'); 
        this.mostrarAvisoLocal(`🪙 +${bonusBase} Bronze!`, 'success');
        setTimeout(() => { if(!document.getElementById('gameModal').classList.contains('hidden')) this.renderDesafioAtual(); }, 1200); 
    },
    
    falhaGenerica: async function(){
        if(this.desafioAtualObj?.id) this.updateSRS(this.desafioAtualObj.id, this.jogoAtual, false);
        this.mostrarAvisoLocal(`❌ Erro guardado para revisão. Voltará em breve!`, 'error');
        setTimeout(() => { if(!document.getElementById('gameModal').classList.contains('hidden')) this.renderDesafioAtual(); }, 1500);
    },

    getColecaoDoJogoAtual(){
        const id = this.jogoAtual; const db = this.state._dbLoaded; 
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
        this.desafioAtualObj = null; const id = this.jogoAtual;
        if(id==='wordSpark') this.renderGameWordSpark(); else if(id==='readAloud') this.renderGameReadAloud();
        else if(id==='listenType') this.renderGameListenType(); else if(id==='quiz') this.renderGameQuiz();
        else if(id==='wordPicker') this.renderGameWordPicker(); else if(id==='sentenceShuffle') this.renderGameSentenceShuffle();
        else if(id==='answerQuest') this.renderGameAnswerQuest(); else if(id==='questionMaker') this.renderGameQuestionMaker();
        else if(id==='contextRole') this.renderGameContextRole(); else if(id==='debateAI') this.renderGameDebateAI();
        else if(id==='minimalPairs') this.renderGameMinimalPairs(); else if(id==='picturePop') this.renderGamePicturePop();
    },

    renderTelaFimDeJornada(){
        const colecao = this.getColecaoDoJogoAtual();
        if(!colecao || colecao.length === 0){
            document.getElementById('modalBody').innerHTML = `<div style="text-align:center;padding:40px;"><h3 style="color:#64748B;">Ainda não há conteúdo criado para este jogo.</h3></div>`;
            return;
        }
        const ids = colecao.map(i=>i.id);
        this.state.itensConcluidos = (this.state.itensConcluidos||[]).filter(id=>!ids.includes(id));
        this.saveDados(); this.renderDesafioAtual();
    },

    renderGameCapa(){
        const game = this.defaults.games.find(g=>g.id===this.jogoAtual);
        const totalItens = (this.getColecaoDoJogoAtual()||[]).length;
        document.getElementById('modalBody').innerHTML=`
            <div style="text-align:center; padding:20px 0;">
                <div style="font-size:60px; margin-bottom:16px;">${game.icon}</div><h2 style="font-family:'Plus Jakarta Sans'; color:#0F172A; margin:0 0 8px 0;">${game.title}</h2><p style="color:#64748B; font-size:15px; margin:0 0 20px 0;">${game.desc}</p>
                <div style="display:inline-flex; gap:10px; background:#F8FAFC; padding:10px 16px; border-radius:12px; border:1px solid #E2E8F0; margin-bottom:24px;"><span style="font-weight:700; font-size:13px; color:#475569;">📦 ${totalItens} Desafios (SRS)</span></div>
                <button data-action="iniciar-jogo" class="ws-btn" style="width:100%; background:#4F46E5; color:#fff; border:none; padding:16px; border-radius:12px; font-size:16px; cursor:pointer;">Começar Treino ▶</button>
            </div>
        `;
    },

    renderGameWordSpark(){
        this.desafioAtualObj = this.obterItemInteligente(this.getColecaoDoJogoAtual(), 'word'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        document.getElementById('modalBody').innerHTML=`<div style="text-align:center;"><div class="ig-big-phrase" style="font-size:32px; color:#4F46E5;">${Workspace.escapeHTML(this.desafioAtualObj.word)}</div><p style="font-weight:700; color:#64748B;">Tradução: ${Workspace.escapeHTML(this.desafioAtualObj.translation||'')}</p><p style="font-weight:600; margin-top:20px;">Crie uma frase usando esta palavra:</p><textarea id="ig-input" class="ig-textarea" placeholder="Type your sentence here..." style="min-height:100px; margin-top:10px;"></textarea><button data-action="verificar-wordSpark" class="ws-btn" style="width:100%; background:#4F46E5; color:#fff; border:none; padding:16px; border-radius:12px; margin-top:16px; cursor:pointer;">Verificar ✨</button></div>`;
    },
    renderGameReadAloud(){
        this.desafioAtualObj = this.obterItemInteligente(this.getColecaoDoJogoAtual(), 'phrase'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        document.getElementById('modalBody').innerHTML=`<div class="ig-big-phrase">${Workspace.escapeHTML(this.desafioAtualObj.phrase)}</div><div style="text-align:center; margin:15px 0;"><button data-action="falar-frase" class="ws-btn" style="background:#0F172A; color:#fff; padding:10px 20px; border-radius:20px; border:none; cursor:pointer;">🔊 Ouvir</button></div><div style="text-align:center;"><button data-action="iniciar-voz" data-tipo="phrase" class="ws-btn" style="background:#10B981; color:#fff; width:100%; padding:14px; border-radius:12px; border:none; cursor:pointer;">🎤 Gravar</button><div id="ig-speechResult" style="margin-top:15px; font-weight:600;"></div></div>`;
    },
    renderGameListenType(){
        this.desafioAtualObj = this.obterItemInteligente(this.getColecaoDoJogoAtual(), 'phrase'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        document.getElementById('modalBody').innerHTML=`<div style="text-align:center;"><div style="font-size:48px; margin-bottom:10px;">🦉</div><button data-action="falar-frase" class="ws-btn" style="background:#4F46E5; color:#fff; padding:12px 30px; border-radius:20px; border:none; cursor:pointer; margin-bottom:20px;">🔊 Tocar Áudio</button><input id="ig-listenInput" class="ig-input" placeholder="Transcreva exatamente o que ouviu..." style="text-align:center;"><button data-action="verificar-listen" class="ws-btn" style="width:100%; background:#10B981; color:#fff; margin-top:16px; padding:16px; border-radius:12px; border:none; cursor:pointer;">Desvendar</button></div>`;
    },
    renderGameQuiz(){
        this.desafioAtualObj = this.obterItemInteligente(this.getColecaoDoJogoAtual(), 'quiz'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        document.getElementById('modalBody').innerHTML=`<div class="ig-big-phrase" style="font-size:22px;">${Workspace.escapeHTML(this.desafioAtualObj.question)}</div><div style="display:flex; flex-direction:column; gap:12px; margin-top:20px;">${this.desafioAtualObj.options.map((o,i)=>`<button data-action="verificar-quiz" data-index="${i}" class="ws-btn" style="background:#fff; border:2px solid #E2E8F0; padding:16px; border-radius:12px; cursor:pointer; text-align:left; font-size:16px;">${Workspace.escapeHTML(o)}</button>`).join('')}</div>`;
    },
    renderGameWordPicker(){
        this.desafioAtualObj = this.obterItemInteligente(this.getColecaoDoJogoAtual(), 'picker'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        document.getElementById('modalBody').innerHTML=`<div class="ig-big-phrase" style="color:#4F46E5;">${Workspace.escapeHTML(this.desafioAtualObj.text)}</div><div style="display:flex; gap:12px; justify-content:center; margin-top:20px; flex-wrap:wrap;">${this.desafioAtualObj.options.map((o,i)=>`<button data-action="verificar-picker" data-index="${i}" class="ws-btn" style="background:#fff; border:2px solid #E2E8F0; padding:14px 30px; border-radius:30px; cursor:pointer; font-size:16px;">${Workspace.escapeHTML(o)}</button>`).join('')}</div>`;
    },
    renderGameSentenceShuffle(){
        this.desafioAtualObj = this.obterItemInteligente(this.getColecaoDoJogoAtual(), 'phrase'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        document.getElementById('modalBody').innerHTML=`<div style="text-align:center; margin-bottom:10px;"><span style="background:#0F172A; color:#fff; padding:6px 12px; border-radius:20px; font-size:13px; font-weight:700;">Transforme a frase</span></div><div class="ig-big-phrase">${Workspace.escapeHTML(this.desafioAtualObj.phrase)}</div><textarea id="ig-input" class="ig-textarea" placeholder="Sua nova frase aqui..." style="min-height:80px;"></textarea><button data-action="verificar-envio" data-game="sentenceShuffle" class="ws-btn" style="width:100%; background:#4F46E5; color:#fff; margin-top:16px; border:none; padding:16px; border-radius:12px; cursor:pointer;">Submeter</button>`;
    },
    renderGameAnswerQuest(){
        this.desafioAtualObj = this.obterItemInteligente(this.getColecaoDoJogoAtual(), 'question'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        document.getElementById('modalBody').innerHTML=`<div class="ig-big-phrase" style="background:#FEF3C7; border-color:#F59E0B; color:#92400E;">❓ ${Workspace.escapeHTML(this.desafioAtualObj.text)}</div><textarea id="ig-input" class="ig-textarea" placeholder="Sua resposta em inglês..." style="min-height:100px;"></textarea><button data-action="verificar-envio" data-game="answerQuest" class="ws-btn" style="width:100%; margin-top:16px; background:#D97706; color:#fff; border:none; padding:16px; border-radius:12px; cursor:pointer;">Enviar Resposta</button>`;
    },
    renderGameQuestionMaker(){
        this.desafioAtualObj = this.obterItemInteligente(this.getColecaoDoJogoAtual(), 'qmaker'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        document.getElementById('modalBody').innerHTML=`<div class="ig-big-phrase" style="background:#EEF2FF; color:#4F46E5; font-style:italic;">💬 "${Workspace.escapeHTML(this.desafioAtualObj.text)}"</div><p style="text-align:center; font-weight:600; margin-top:20px;">Qual pergunta gerou essa resposta?</p><textarea id="ig-input" class="ig-textarea" placeholder="Ex: Why do you..."></textarea><button data-action="verificar-envio" data-game="questionMaker" class="ws-btn" style="width:100%; background:#4F46E5; color:#fff; margin-top:16px; border:none; padding:16px; border-radius:12px; cursor:pointer;">Testar Pergunta</button>`;
    },
    renderGameContextRole(){
        this.desafioAtualObj = this.obterItemInteligente(this.getColecaoDoJogoAtual(), 'roleplay'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        document.getElementById('modalBody').innerHTML=`<div class="ig-big-phrase" style="text-align:left;"><div style="font-size:18px; font-weight:800; margin-bottom:8px;">${Workspace.escapeHTML(this.desafioAtualObj.title)}</div><div style="font-size:16px; color:#475569; font-weight:500;">${Workspace.escapeHTML(this.desafioAtualObj.prompt)}</div></div><textarea id="ig-input" class="ig-textarea" placeholder="O que você responderia em inglês?..." style="min-height:80px;"></textarea><button data-action="verificar-envio" data-game="contextRole" class="ws-btn" style="width:100%; margin-top:16px; background:#10B981; color:#fff; border:none; padding:16px; border-radius:12px; cursor:pointer;">Atuar e Enviar</button>`;
    },
    renderGameDebateAI(){
        this.desafioAtualObj = this.obterItemInteligente(this.getColecaoDoJogoAtual(), 'debate'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        if(this.state._debateChat.length === 0) this.state._debateChat = [{role:'ai', text: this.desafioAtualObj.starter}];
        const chatHtml = this.state._debateChat.map(m=> m.role==='user'? `<div style="display:flex; justify-content:flex-end; margin-bottom:12px;"><div style="background:#4F46E5; color:#fff; padding:12px 16px; border-radius:16px 16px 4px 16px; max-width:80%; font-size:14px;">${Workspace.escapeHTML(m.text)}</div></div>` : `<div style="display:flex; margin-bottom:12px;"><div style="background:#F1F5F9; border:1px solid #E2E8F0; color:#0F172A; padding:12px 16px; border-radius:4px 16px 16px 16px; max-width:80%; font-size:14px;">${Workspace.escapeHTML(m.text)}</div></div>`).join('');
        document.getElementById('modalBody').innerHTML=`<div style="font-weight:800; color:#0F172A; font-size:15px; margin-bottom:10px;">⚔️ Tópico: ${Workspace.escapeHTML(this.desafioAtualObj.topic)}</div><div id="ig-debate-chat" style="height:250px; overflow-y:auto; padding:10px; margin-bottom:16px; border:1px solid #E2E8F0; border-radius:12px;">${chatHtml}</div><div style="display:flex; gap:10px;"><textarea id="ig-input" class="ig-textarea" placeholder="Escreva seu argumento..." style="flex:1; min-height:50px; border-radius:12px;"></textarea><button data-action="verificar-debate" class="ws-btn" style="background:#4F46E5; color:#fff; border:none; border-radius:12px; padding:0 20px; font-size:20px; cursor:pointer;">➤</button></div>`;
        const div = document.getElementById('ig-debate-chat'); if(div) div.scrollTop = div.scrollHeight;
    },
    renderGameMinimalPairs(){
        this.desafioAtualObj = this.obterItemInteligente(this.getColecaoDoJogoAtual(), 'minimal'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        const target = Math.random()>0.5 ? this.desafioAtualObj.a : this.desafioAtualObj.b; this.state._minimalTarget = target;
        document.getElementById('modalBody').innerHTML=`<div style="text-align:center; padding:20px 0;"><div style="font-size:48px; margin-bottom:16px;">👄</div><button data-action="falar-frase" data-text="${target}" class="ws-btn" style="background:#4F46E5; color:#fff; padding:16px 40px; border-radius:30px; border:none; cursor:pointer; font-size:16px;">🎧 Ouvir Palavra</button><div style="display:flex; gap:16px; justify-content:center; margin-top:30px;"><button data-action="verificar-minimal" data-choice="${this.desafioAtualObj.a}" class="ws-btn" style="flex:1; background:#fff; border:2px solid #E2E8F0; padding:20px; border-radius:16px; cursor:pointer; font-size:20px; font-weight:800;">${this.desafioAtualObj.a}</button><button data-action="verificar-minimal" data-choice="${this.desafioAtualObj.b}" class="ws-btn" style="flex:1; background:#fff; border:2px solid #E2E8F0; padding:20px; border-radius:16px; cursor:pointer; font-size:20px; font-weight:800;">${this.desafioAtualObj.b}</button></div></div>`;
    },
    renderGamePicturePop(){
        this.desafioAtualObj = this.obterItemInteligente(this.getColecaoDoJogoAtual(), 'picture'); if(!this.desafioAtualObj) return this.renderTelaFimDeJornada();
        document.getElementById('modalBody').innerHTML=`<div style="text-align:center;"><div style="width:160px; height:160px; border-radius:30px; background:#F8FAFC; border:4px solid #E2E8F0; display:flex; align-items:center; justify-content:center; margin:0 auto 24px auto; font-size:80px; box-shadow:0 10px 20px rgba(0,0,0,0.05);">${this.desafioAtualObj.emoji}</div><div style="background:#fff; border:2px solid #E2E8F0; padding:24px; border-radius:20px;"><button data-action="iniciar-voz" data-tipo="picture" class="ws-btn" style="background:#10B981; color:#fff; width:100%; border-radius:16px; padding:16px; border:none; font-size:16px; cursor:pointer;">🎤 Falar o Nome em Inglês</button><div id="ig-speechResult" style="margin-top:16px; font-weight:700;"></div><div style="margin:20px 0; border-top:2px dashed #E2E8F0;"></div><input id="ig-input" class="ig-input" placeholder="Ou digite a palavra..." style="text-align:center;"><button data-action="verificar-picture-text" class="ws-btn" style="width:100%; background:#F1F5F9; color:#0F172A; margin-top:12px; padding:16px; border-radius:12px; border:none; cursor:pointer;">Verificar</button></div></div>`;
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
            if(this.similaridade(falado, esperado)>=0.75){ 
                if(resEl) resEl.innerHTML=`<span style="color:#059669;">✅ Excelente!</span>`; 
                if(itemObj) this.updateSRS(itemObj.id, tipoConteudo, true); this.superarErro(itemObj?.id); this.sucessoGenerico(75); 
            } else { 
                if(resEl) resEl.innerHTML=`<span style="color:#DC2626;">❌ Ouvi: "${falado}"</span>`; 
                if(itemObj) this.registrarErro(itemObj, tipoConteudo); this.falhaGenerica(); 
            }
        };
        this.recognition.onerror=()=>{ if(btn){ btn.style.background='#10B981'; btn.innerText='🎤 Tentar novamente'; } };
    }
};

setTimeout(()=> Workspace.Ingles.init(), 100);