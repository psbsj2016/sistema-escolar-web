// js/modulos/workspace/inglesprofessor.js - Módulo de Gestão de Conteúdo (Professor)
window.Workspace = window.Workspace || {};

Workspace.InglesProfessor = {
    
    // 🚀 ROTEADOR DE AÇÕES DO PROFESSOR (Com Referências Absolutas)
    handleAction: async function(acao, b) {
        const Ingles = Workspace.Ingles;
        const state = Ingles.state;

        switch(acao) {
            case 'render-tab':
                Workspace.InglesProfessor.renderProfessorTab(b.dataset.tab);
                break;
            case 'testar-voz-mago':
                const nomeCompleto = Workspace.usuario?.nome || 'Aventureiro';
                const primeiroNome = nomeCompleto.split(' ')[0];
                Ingles.falar(`Greetings, brave adventurer ${primeiroNome}, your quest begins now!`, 'en-US', 1, 0.95, true);
                break;
            case 'inserir-variavel-mago':
                const inputMago = document.getElementById('ig-nwMago');
                if(inputMago) {
                    const s = inputMago.selectionStart, e = inputMago.selectionEnd, v = '(citarAluno)';
                    inputMago.value = inputMago.value.substring(0, s) + v + inputMago.value.substring(e);
                    inputMago.focus();
                    inputMago.selectionStart = inputMago.selectionEnd = s + v.length;
                }
                break;
            case 'salvar-mago-phrase':
                const inputPh = document.getElementById('ig-nwMago'); 
                const textPh = inputPh?.value.trim();
                if(!textPh) return Ingles.mostrarAvisoLocal('Escreva a fala do Mago!', 'warning');
                if(state.editingMagoId) {
                    const ph = state.magoPhrases.find(m => m.id === state.editingMagoId);
                    if(ph) ph.text = textPh; 
                    state.editingMagoId = null;
                } else {
                    state.magoPhrases.unshift({id: 'mago_' + Date.now(), text: textPh});
                }
                if(inputPh) inputPh.value = '';
                const btnMago = document.getElementById('btn-salvar-mago'); 
                if(btnMago) btnMago.innerText = 'Salvar';
                await Ingles.saveDados(); 
                Workspace.InglesProfessor.renderProfessorTab('mago'); 
                Ingles.mostrarAvisoLocal('Fala ensinada ao Mago! 🧙', 'success');
                break;
            case 'editar-mago-phrase':
                const phToEdit = state.magoPhrases.find(m => m.id === b.dataset.id); 
                if(!phToEdit) return;
                const inputEdit = document.getElementById('ig-nwMago'); 
                inputEdit.value = phToEdit.text; 
                inputEdit.focus();
                state.editingMagoId = b.dataset.id; 
                const btnEdit = document.getElementById('btn-salvar-mago'); 
                if(btnEdit) { btnEdit.innerText = 'Atualizar Fala'; btnEdit.style.background = '#f39c12'; }
                break;
            case 'remover-item':
                state[b.dataset.key] = state[b.dataset.key].filter(i => i.id !== b.dataset.id);
                if(b.dataset.key === 'magoPhrases' && state.editingMagoId === b.dataset.id) state.editingMagoId = null;
                await Ingles.saveDados();
                const activeTab = document.querySelector('.ig-side-item.active')?.dataset.tab || 'biblioteca';
                Workspace.InglesProfessor.renderProfessorTab(activeTab);
                Ingles.mostrarAvisoLocal('Removido!', 'success');
                break;
            case 'add-word':
                const iW = document.getElementById('ig-nwWord'), iT = document.getElementById('ig-nwTrans'); 
                const w = iW?.value.trim(), t = iT?.value.trim(); 
                if(!w) return Ingles.mostrarAvisoLocal('Digite a palavra', 'warning'); 
                state.words.unshift({id: 'w'+Date.now(), word: w, translation: t, level: 'B1'}); 
                await Ingles.saveDados(); 
                if(iW) iW.value = ''; if(iT) iT.value = ''; 
                Workspace.InglesProfessor.renderProfessorTab('biblioteca'); 
                Ingles.mostrarAvisoLocal('Palavra adicionada!', 'success'); 
                break;
            case 'add-phrase':
                const iP = document.getElementById('ig-nwPhrase'); const p = iP?.value.trim(); 
                if(!p) return Ingles.mostrarAvisoLocal('Digite a frase', 'warning'); 
                state.phrases.unshift({id: 'p'+Date.now(), phrase: p, level: 'A2'}); 
                await Ingles.saveDados(); 
                if(iP) iP.value = '';
                Workspace.InglesProfessor.renderProfessorTab('biblioteca'); 
                Ingles.mostrarAvisoLocal('Frase adicionada!', 'success'); 
                break;
            case 'add-quiz':
                const iQ = document.getElementById('ig-qQuestion'), iO1 = document.getElementById('ig-qOpt1'), iO2 = document.getElementById('ig-qOpt2'); 
                const q = iQ?.value.trim(), o1 = iO1?.value.trim(), o2 = iO2?.value.trim(); 
                if(!q || !o1 || !o2) return Ingles.mostrarAvisoLocal('Preencha pergunta e opções', 'warning'); 
                state.quizzes.unshift({id: 'q'+Date.now(), question: q, options: [o1, o2], correct: 1, level: 'B1'}); 
                await Ingles.saveDados(); 
                if(iQ) iQ.value=''; if(iO1) iO1.value=''; if(iO2) iO2.value='';
                Workspace.InglesProfessor.renderProfessorTab('biblioteca'); 
                Ingles.mostrarAvisoLocal('Quiz adicionado!', 'success'); 
                break;
            case 'add-pic':
                const iPicW = document.getElementById('ig-picWord'), iPicT = document.getElementById('ig-picTrans'), iPicE = document.getElementById('ig-picEmoji'); 
                const picW = iPicW?.value.trim(), picT = iPicT?.value.trim(), picE = iPicE?.value.trim() || '🖼';
                if(!picW) return Ingles.mostrarAvisoLocal('Digite a palavra', 'warning'); 
                state.pictures.unshift({id: 'pic'+Date.now(), word: picW, translation: picT, emoji: picE, category: 'Custom'}); 
                await Ingles.saveDados(); 
                if(iPicW) iPicW.value=''; if(iPicT) iPicT.value=''; if(iPicE) iPicE.value='';
                Workspace.InglesProfessor.renderProfessorTab('imagens'); 
                Ingles.mostrarAvisoLocal('Imagem adicionada!', 'success'); 
                break;
            case 'add-wordPicker':
                const iWpT = document.getElementById('ig-wpText'), iWpO1 = document.getElementById('ig-wpOpt1'), iWpO2 = document.getElementById('ig-wpOpt2');
                const wpText = iWpT?.value.trim(), wpO1 = iWpO1?.value.trim(), wpO2 = iWpO2?.value.trim();
                if(!wpText || !wpO1 || !wpO2) return Ingles.mostrarAvisoLocal('Preencha texto e opções', 'warning');
                state.wordPickers.unshift({id: 'wp'+Date.now(), text: wpText, options: [wpO1, wpO2], correct: 1});
                await Ingles.saveDados();
                if(iWpT) iWpT.value=''; if(iWpO1) iWpO1.value=''; if(iWpO2) iWpO2.value='';
                Workspace.InglesProfessor.renderProfessorTab('biblioteca'); 
                Ingles.mostrarAvisoLocal('Poção adicionada!','success');
                break;
            case 'add-minimal':
                const iMpA = document.getElementById('ig-mpA'), iMpB = document.getElementById('ig-mpB');
                const mpA = iMpA?.value.trim(), mpB = iMpB?.value.trim();
                if(!mpA || !mpB) return Ingles.mostrarAvisoLocal('Preencha os dois sons', 'warning');
                state.minimalPairs.unshift({id: 'mp'+Date.now(), a: mpA, b: mpB});
                await Ingles.saveDados();
                if(iMpA) iMpA.value=''; if(iMpB) iMpB.value='';
                Workspace.InglesProfessor.renderProfessorTab('biblioteca'); 
                Ingles.mostrarAvisoLocal('Sons adicionados!','success');
                break;
            case 'add-debate':
                const iDbT = document.getElementById('ig-dbTopic'), iDbS = document.getElementById('ig-dbStarter');
                const dbTopic = iDbT?.value.trim(), dbStarter = iDbS?.value.trim() || 'What is your opinion?';
                if(!dbTopic) return Ingles.mostrarAvisoLocal('Preencha tópico', 'warning');
                state.debates.unshift({id: 'd'+Date.now(), topic: dbTopic, starter: dbStarter});
                await Ingles.saveDados();
                if(iDbT) iDbT.value=''; if(iDbS) iDbS.value='';
                Workspace.InglesProfessor.renderProfessorTab('biblioteca'); 
                Ingles.mostrarAvisoLocal('Debate adicionado!','success');
                break;
            case 'add-roleplay':
                const iRpT = document.getElementById('ig-rpTitle'), iRpP = document.getElementById('ig-rpPrompt'), iRpTip = document.getElementById('ig-rpTip');
                const rpTitle = iRpT?.value.trim(), rpPrompt = iRpP?.value.trim(), rpTip = iRpTip?.value.trim() || 'Use inglês natural';
                if(!rpTitle || !rpPrompt) return Ingles.mostrarAvisoLocal('Preencha título e fala', 'warning');
                state.roleplays.unshift({id: 'rp'+Date.now(), title: rpTitle, prompt: rpPrompt, tip: rpTip});
                await Ingles.saveDados();
                if(iRpT) iRpT.value=''; if(iRpP) iRpP.value=''; if(iRpTip) iRpTip.value='';
                Workspace.InglesProfessor.renderProfessorTab('biblioteca'); 
                Ingles.mostrarAvisoLocal('Roleplay adicionado!','success');
                break;
            case 'add-question':
                const iAqT = document.getElementById('ig-aqText'); const aqTxt = iAqT?.value.trim();
                if(!aqTxt) return Ingles.mostrarAvisoLocal('Digite a pergunta', 'warning');
                state.questions.unshift({id: 'aq'+Date.now(), text: aqTxt});
                await Ingles.saveDados();
                if(iAqT) iAqT.value='';
                Workspace.InglesProfessor.renderProfessorTab('biblioteca'); 
                Ingles.mostrarAvisoLocal('Pergunta adicionada!','success');
                break;
            case 'add-quest':
                const iQT = document.getElementById('ig-qTexto'), iQA = document.getElementById('ig-qAlvo'), iQX = document.getElementById('ig-qXP'), iQI = document.getElementById('ig-qIcone'), iQTi = document.getElementById('ig-qTipo');
                const qTexto = iQT?.value.trim(), qAlvo = parseInt(iQA?.value||'3'), qXP = parseInt(iQX?.value||'100'), qIcone = iQI?.value.trim()||'🎯', qTipo = iQTi?.value||'diaria';
                if(!qTexto) return Ingles.mostrarAvisoLocal('Digite texto da missão', 'warning');
                state.quests.push({id: 'q_'+Date.now(), texto: qTexto, alvo: qAlvo, recompensaXP: qXP, icone: qIcone, tipo: qTipo});
                await Ingles.saveDados(); 
                if(iQT) iQT.value='';
                Workspace.InglesProfessor.renderProfessorTab('quests'); 
                Ingles.mostrarAvisoLocal('Missão criada!', 'success');
                break;
            case 'rem-quest':
                state.quests = state.quests.filter(q => q.id !== b.dataset.id);
                await Ingles.saveDados(); 
                Workspace.InglesProfessor.renderProfessorTab('quests');
                break;
            case 'add-loot':
                const rar = b.dataset.rar;
                const inputLootId = rar==='comum'? 'ig-lootNomeComum' : rar==='epico'? 'ig-lootNomeEpico' : 'ig-lootNomeLendario';
                const inpLoot = document.getElementById(inputLootId); 
                const lootNome = inpLoot?.value.trim();
                if(!lootNome) return;
                if(!state.lootTables[rar]) state.lootTables[rar] = [];
                state.lootTables[rar].push({id: 'loot_'+Date.now(), nome: lootNome, tipo: 'cosmetico', chance: 50});
                await Ingles.saveDados(); 
                if(inpLoot) inpLoot.value = '';
                Workspace.InglesProfessor.renderProfessorTab('loja');
                break;
            case 'rem-loot':
                const rarl = b.dataset.rar;
                if(state.lootTables[rarl]) { 
                    state.lootTables[rarl] = state.lootTables[rarl].filter(i => i.id !== b.dataset.id); 
                    await Ingles.saveDados(); 
                    Workspace.InglesProfessor.renderProfessorTab('loja'); 
                }
                break;
            case 'salvar-season':
                const sNome = document.getElementById('ig-seasonNome')?.value.trim() || 'Era dos Feitiços';
                const sMult = parseFloat(document.getElementById('ig-seasonMult')?.value || '1');
                state.season = {...state.season, nome: sNome, xpMultiplier: sMult, id: state.season.id || 'S1'};
                await Ingles.saveDados(); 
                Ingles.mostrarAvisoLocal('Temporada salva!', 'success'); 
                Workspace.InglesProfessor.renderProfessorTab('season');
                break;
            case 'reset-season':
                if(!confirm('Resetar temporada? Isso zera XP semanal da escola e guarda histórico. Continuar?')) return;
                try {
                    const res = await Workspace.api('/workspace/ingles/season/reset','POST',{escolaId: Workspace.usuario.escolaId || 'DEFAULT', novaSeason: {id: 'S'+Date.now(), nome: 'Nova Era', xpMultiplier: 1, ativa: true}});
                    if(res?.success) { Ingles.mostrarAvisoLocal('Season resetada!', 'success'); await Ingles.loadDados(); Workspace.InglesProfessor.renderProfessorTab('season'); }
                } catch(e) { Ingles.mostrarAvisoLocal('Erro ao resetar', 'error'); }
                break;
            case 'atualizar-ranking':
                Workspace.InglesProfessor.carregarRanking();
                break;
            case 'aprovar-envio':
                const sApp = state.submissions.find(x => x.id === b.dataset.id); 
                if(!sApp) return; 
                sApp.status = 'approved'; 
                state.pool.unshift({id: 'pool_'+Date.now(), type: sApp.game, text: sApp.text, word: sApp.text, origin: 'student', student: sApp.student, timestamp: Date.now()}); 
                await Ingles.saveDados(); 
                Workspace.InglesProfessor.renderProfessorTab('envios'); 
                Ingles.mostrarAvisoLocal('Aprovado para Piscina Global!', 'success');
                break;
            case 'rejeitar-envio':
                state.submissions = state.submissions.filter(i => i.id !== b.dataset.id); 
                await Ingles.saveDados(); 
                Workspace.InglesProfessor.renderProfessorTab('envios'); 
                break;
        }
    },

    atualizarConfigMago: async function() {
        const voz = document.getElementById('mago-voz-toggle')?.checked;
        const modo = document.getElementById('mago-modo-select')?.value;
        if(voz === undefined || !modo) return;
        Workspace.Ingles.state.magoConfig = {vozAtiva: voz, modoExibicao: modo};
        await Workspace.Ingles.saveDados(); 
        Workspace.Ingles.mostrarAvisoLocal('Configuração do Mago atualizada!', 'success');
    },

    carregarRanking: async function() {
        const listEl = document.getElementById('ig-ranking-list');
        const loadEl = document.getElementById('ig-ranking-loading');
        if(!listEl) return;
        try {
            const escolaId = Workspace.usuario.escolaId || 'DEFAULT';
            const res = await Workspace.api(`/workspace/ingles/ranking?escolaId=${escolaId}`,'GET');
            if(!res?.success) { if(loadEl) loadEl.textContent = 'Erro ao carregar'; return; }
            const ranking = res.ranking || [];
            if(loadEl) loadEl.style.display = 'none';
            if(!ranking.length) { listEl.innerHTML = '<div style="text-align:center;padding:20px;color:#94a3b8">Nenhum XP ainda. Alunos precisam jogar!</div>'; return; }
            listEl.innerHTML = ranking.map((r, i) => {
                const liga = r.liga || (i < 3 ? 'ouro' : i < 10 ? 'prata' : i < 20 ? 'bronze' : 'aprendiz');
                const medalha = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
                const borda = r.bordaEquipada || '';
                const bordaStyle = borda.includes('ouro') ? 'border-color:#fde68a;box-shadow:0 0 10px rgba(253,230,138,0.3)' : borda.includes('prata') ? 'border-color:#94a3b8' : borda.includes('bronze') ? 'border-color:#d97706' : '';
                return `<div class="ig-rank-item ${liga}" style="${bordaStyle}">
                    <div style="width:36px;height:36px;background:${liga==='ouro'?'linear-gradient(135deg,#fde68a,#d4af37)': liga==='prata'?'#e2e8f0': liga==='bronze'?'#fed7aa':'#f1f5f9'};border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;flex-shrink:0">${medalha || (i+1)}</div>
                    <div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><b style="color:#0f172a;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${Workspace.escapeHTML(r.nome||'Aluno')}</b><span style="background:#0F172A;color:#fde68a;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:800">${Workspace.escapeHTML(r.tituloEquipado||r.titulo||'Aprendiz')}</span><span style="font-size:10px;background:${liga==='ouro'?'#fde68a': liga==='prata'?'#e2e8f0':'#ffedd5'};color:#000;padding:2px 6px;border-radius:10px;font-weight:700;text-transform:uppercase">${liga}</span></div><div style="display:flex;gap:8px;margin-top:4px;font-size:11px;color:#64748B"><span>⭐ ${r.xp||0} XP</span><span>📶 Nível ${r.level||1}</span><span>🔥 ${r.streak||1}d</span><span>🎒 ${(r.inventario||[]).length} itens</span></div></div>
                    <div style="text-align:right;flex-shrink:0"><div style="font-size:11px;background:#EEF2FF;color:#4338ca;padding:4px 8px;border-radius:20px;font-weight:700">${(r.medalhas||[]).length} 🏆</div></div>
                </div>`;
            }).join('');
        } catch(e) { if(loadEl) loadEl.textContent = 'Erro: ' + e.message; }
    },

    renderProfessorTab: function(tabId) {
        document.querySelectorAll('.ig-side-item').forEach(b=>b.classList.remove('active'));
        const activeBtn = document.querySelector(`.ig-side-item[data-tab="${tabId}"]`);
        if(activeBtn) activeBtn.classList.add('active');
        
        document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
        const panel = document.getElementById(`tab-${tabId}`);
        if(panel) panel.classList.add('active');

        const esc = Workspace.escapeHTML;
        const state = Workspace.Ingles.state; 

        if(tabId === 'biblioteca'){
            document.getElementById('tab-biblioteca').innerHTML=`
                <h3 style="margin-top:0;">📚 Biblioteca de Conteúdo (Algoritmo SRS)</h3>
                <p style="color:#64748B; font-size:14px; margin-bottom:20px;">Tudo que você adicionar aqui alimenta os jogos dos alunos. O algoritmo controla a repetição e fixação automaticamente.</p>
                <div class="grid-cards">
                    <!-- Vocabulário -->
                    <div class="prof-card">
                        <h4 style="margin-top:0;">Vocabulário (${state.words.length})</h4>
                        <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px;">
                            <input id="ig-nwWord" class="ig-input" style="flex:1; min-width:100px;" placeholder="Palavra">
                            <input id="ig-nwTrans" class="ig-input" style="flex:1; min-width:100px;" placeholder="Tradução">
                            <button data-action="add-word" class="ws-btn" style="background:#4F46E5; color:#fff; border:none; border-radius:8px; padding:10px 16px;">+</button>
                        </div>
                        <div style="max-height:200px; overflow-y:auto; font-size:13px;">
                            ${state.words.map(w=>`<div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #E2E8F0;"><span><b>${esc(w.word)}</b> - ${esc(w.translation)}</span><button data-action="remover-item" data-key="words" data-id="${w.id}" style="color:red;border:none;background:none;cursor:pointer;">✕</button></div>`).join('')}
                        </div>
                    </div>
                    
                    <!-- Frases -->
                    <div class="prof-card">
                        <h4 style="margin-top:0;">Frases e Expressões (${state.phrases.length})</h4>
                        <div style="display:flex; gap:8px; margin-bottom:12px;">
                            <input id="ig-nwPhrase" class="ig-input" placeholder="Frase em inglês" style="flex:1;">
                            <button data-action="add-phrase" class="ws-btn" style="background:#4F46E5; color:#fff; border:none; border-radius:8px; padding:10px 16px;">+</button>
                        </div>
                        <div style="max-height:200px; overflow-y:auto; font-size:13px;">
                            ${state.phrases.map(p=>`<div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #E2E8F0;"><span>${esc(p.phrase)}</span><button data-action="remover-item" data-key="phrases" data-id="${p.id}" style="color:red;border:none;background:none;cursor:pointer;">✕</button></div>`).join('')}
                        </div>
                    </div>

                    <!-- Quizzes -->
                    <div class="prof-card">
                        <h4 style="margin-top:0;">Quizzes (${state.quizzes.length})</h4>
                        <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
                            <input id="ig-qQuestion" class="ig-input" placeholder="Pergunta">
                            <div style="display:flex; gap:8px;">
                                <input id="ig-qOpt1" class="ig-input" placeholder="Opção Errada" style="flex:1;">
                                <input id="ig-qOpt2" class="ig-input" placeholder="Opção Correta" style="flex:1;">
                                <button data-action="add-quiz" class="ws-btn" style="background:#4F46E5; color:#fff; border:none; border-radius:8px; padding:10px 16px;">+</button>
                            </div>
                        </div>
                        <div style="max-height:150px; overflow-y:auto; font-size:13px;">
                            ${state.quizzes.map(q=>`<div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #E2E8F0;"><span><b>${esc(q.question)}</b> | Correta: ${esc(q.options[q.correct])}</span><button data-action="remover-item" data-key="quizzes" data-id="${q.id}" style="color:red;border:none;background:none;cursor:pointer;">✕</button></div>`).join('')}
                        </div>
                    </div>

                    <!-- WordPickers -->
                    <div class="prof-card">
                        <h4 style="margin-top:0;">Poção Sintática (${state.wordPickers.length})</h4>
                        <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
                            <input id="ig-wpText" class="ig-input" placeholder="I have ___ keys">
                            <div style="display:flex; gap:8px;">
                                <input id="ig-wpOpt1" class="ig-input" placeholder="Op1 (errada)" style="flex:1;">
                                <input id="ig-wpOpt2" class="ig-input" placeholder="Op2 (correta)" style="flex:1;">
                                <button data-action="add-wordPicker" class="ws-btn" style="background:#4F46E5; color:#fff; border:none; border-radius:8px; padding:10px 16px;">+</button>
                            </div>
                        </div>
                        <div style="max-height:150px; overflow-y:auto; font-size:13px;">
                            ${state.wordPickers.map(s=>`<div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #E2E8F0;"><span><b>${esc(s.text)}</b> | Correta: ${esc(s.options[s.correct])}</span><button data-action="remover-item" data-key="wordPickers" data-id="${s.id}" style="color:red;border:none;background:none;cursor:pointer;">✕</button></div>`).join('')}
                        </div>
                    </div>

                    <!-- Minimal Pairs -->
                    <div class="prof-card">
                        <h4 style="margin-top:0;">Sussurros Gêmeos (${state.minimalPairs.length})</h4>
                        <div style="display:flex; gap:8px; margin-bottom:12px;">
                            <input id="ig-mpA" class="ig-input" placeholder="Som A (ex: ship)" style="flex:1;">
                            <input id="ig-mpB" class="ig-input" placeholder="Som B (ex: sheep)" style="flex:1;">
                            <button data-action="add-minimal" class="ws-btn" style="background:#4F46E5; color:#fff; border:none; border-radius:8px; padding:10px 16px;">+</button>
                        </div>
                        <div style="max-height:150px; overflow-y:auto; font-size:13px;">
                            ${state.minimalPairs.map(m=>`<div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #E2E8F0;"><span>${esc(m.a)} vs ${esc(m.b)}</span><button data-action="remover-item" data-key="minimalPairs" data-id="${m.id}" style="color:red;border:none;background:none;cursor:pointer;">✕</button></div>`).join('')}
                        </div>
                    </div>

                    <!-- Debates -->
                    <div class="prof-card">
                        <h4 style="margin-top:0;">Debates IA (${state.debates.length})</h4>
                        <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
                            <input id="ig-dbTopic" class="ig-input" placeholder="Tópico (ex: AI in schools)">
                            <div style="display:flex; gap:8px;">
                                <input id="ig-dbStarter" class="ig-input" placeholder="Fala da IA" style="flex:1;">
                                <button data-action="add-debate" class="ws-btn" style="background:#4F46E5; color:#fff; border:none; border-radius:8px; padding:10px 16px;">+</button>
                            </div>
                        </div>
                        <div style="max-height:150px; overflow-y:auto; font-size:13px;">
                            ${state.debates.map(d=>`<div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #E2E8F0;"><span>${esc(d.topic)}</span><button data-action="remover-item" data-key="debates" data-id="${d.id}" style="color:red;border:none;background:none;cursor:pointer;">✕</button></div>`).join('')}
                        </div>
                    </div>

                    <!-- Roleplays -->
                    <div class="prof-card">
                        <h4 style="margin-top:0;">Roleplays (${state.roleplays.length})</h4>
                        <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
                            <input id="ig-rpTitle" class="ig-input" placeholder="Título (ex: No Restaurante)">
                            <input id="ig-rpPrompt" class="ig-input" placeholder="Fala do NPC">
                            <div style="display:flex; gap:8px;">
                                <input id="ig-rpTip" class="ig-input" placeholder="Dica" style="flex:1;">
                                <button data-action="add-roleplay" class="ws-btn" style="background:#4F46E5; color:#fff; border:none; border-radius:8px; padding:10px 16px;">+</button>
                            </div>
                        </div>
                        <div style="max-height:150px; overflow-y:auto; font-size:13px;">
                            ${state.roleplays.map(r=>`<div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #E2E8F0;"><span><b>${esc(r.title)}</b></span><button data-action="remover-item" data-key="roleplays" data-id="${r.id}" style="color:red;border:none;background:none;cursor:pointer;">✕</button></div>`).join('')}
                        </div>
                    </div>

                    <!-- Perguntas Abertas -->
                    <div class="prof-card">
                        <h4 style="margin-top:0;">Perguntas Abertas (${state.questions.length})</h4>
                        <div style="display:flex; gap:8px; margin-bottom:12px;">
                            <input id="ig-aqText" class="ig-input" placeholder="Pergunta aberta..." style="flex:1;">
                            <button data-action="add-question" class="ws-btn" style="background:#4F46E5; color:#fff; border:none; border-radius:8px; padding:10px 16px;">+</button>
                        </div>
                        <div style="max-height:150px; overflow-y:auto; font-size:13px;">
                            ${state.questions.map(q=>`<div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #E2E8F0;"><span>${esc(q.text)}</span><button data-action="remover-item" data-key="questions" data-id="${q.id}" style="color:red;border:none;background:none;cursor:pointer;">✕</button></div>`).join('')}
                        </div>
                    </div>
                </div>`;
        }
        else if (tabId === 'envios'){
            const pendentes = state.submissions.filter(s=>s.status==='pending');
            document.getElementById('pendingCount').textContent = pendentes.length;
            document.getElementById('tab-envios').innerHTML=`
                <h3 style="margin-top:0;">📥 Envios e Construção do Algoritmo</h3>
                <p style="color:#64748B; font-size:14px; margin-bottom:20px;">Respostas dos alunos alimentam a "Piscina Global", criando perguntas e debates dinâmicos.</p>
                ${pendentes.length===0 ? '<p style="color:#94a3b8; padding:20px; text-align:center;">Nenhum envio pendente. Vá descansar, professor!</p>' : 
                pendentes.map(s=>`
                    <div style="background:#fff; border:1px solid #E2E8F0; border-left:4px solid #F59E0B; padding:16px; border-radius:8px; margin-bottom:12px;">
                        <div style="font-size:12px; color:#64748B; margin-bottom:8px;"><b>${esc(s.student)}</b> • Jogo: ${esc(s.game)}</div>
                        <div style="font-size:15px; color:#0F172A; margin-bottom:12px;">${esc(s.text)}</div>
                        <div style="display:flex; flex-wrap:wrap; gap:10px;">
                            <button data-action="aprovar-envio" data-id="${s.id}" class="ws-btn" style="background:#10B981; color:#fff; border:none; padding:8px 16px; border-radius:6px; cursor:pointer;">✅ Aprovar para a Piscina</button>
                            <button data-action="rejeitar-envio" data-id="${s.id}" class="ws-btn" style="background:#FEE2E2; color:#EF4444; border:none; padding:8px 16px; border-radius:6px; cursor:pointer;">🗑 Rejeitar</button>
                        </div>
                    </div>
                `).join('')}
            `;
        }
        else if (tabId === 'imagens'){
            document.getElementById('tab-imagens').innerHTML=`
                <h3 style="margin-top:0;">🖼 Banco de Figuras (Visão do Alquimista)</h3>
                <div class="prof-card" style="margin-bottom:20px;">
                    <div style="display:flex; flex-wrap:wrap; gap:8px;">
                        <input id="ig-picWord" class="ig-input" placeholder="Palavra Inglês" style="flex:2; min-width:120px;">
                        <input id="ig-picTrans" class="ig-input" placeholder="Tradução" style="flex:2; min-width:120px;">
                        <input id="ig-picEmoji" class="ig-input" placeholder="Emoji 🍎" style="flex:1; min-width:60px;">
                        <button data-action="add-pic" class="ws-btn" style="background:#4F46E5; color:#fff; border:none; padding:10px 16px; border-radius:8px;">Adicionar</button>
                    </div>
                </div>
                <div class="grid-cards">
                    ${state.pictures.map(p=>`
                    <div style="background:#fff; border:1px solid #E2E8F0; text-align:center; padding:15px; border-radius:12px;">
                        <div style="font-size:40px;">${p.emoji}</div>
                        <b>${esc(p.word)}</b><br><small style="color:#64748B">${esc(p.translation||'')}</small><br>
                        <button data-action="remover-item" data-key="pictures" data-id="${p.id}" class="ws-btn" style="margin-top:10px; background:#FEE2E2; color:#EF4444; border:none; width:100%; padding:6px; border-radius:6px;">Remover</button>
                    </div>`).join('')}
                </div>
            `;
        }
        else if (tabId === 'mago'){
            document.getElementById('tab-mago').innerHTML=`
                <h3 style="margin-top:0;">🧙 Inteligência do Guardião</h3>
                <div class="prof-card" style="margin-bottom:16px;">
                    <label style="font-weight:700; display:flex; align-items:center; gap:8px;"><input type="checkbox" id="mago-voz-toggle" ${state.magoConfig.vozAtiva?'checked':''}> Ativar Voz do Mago ao Entrar</label>
                    <div style="margin-top:10px; display:flex; gap:10px;">
                        <select id="mago-modo-select" class="ig-input" style="flex:1;"><option value="aleatorio" ${state.magoConfig.modoExibicao==='aleatorio'?'selected':''}>Falas Aleatórias</option><option value="sequencial" ${state.magoConfig.modoExibicao==='sequencial'?'selected':''}>Em Sequência</option></select>
                        <button data-action="testar-voz-mago" class="ws-btn" style="background:#1E293B; color:#FDE68A; border:none; border-radius:8px; padding:10px;">🔊 Testar Locutora do Mago</button>
                    </div>
                </div>
                <div class="prof-card">
                    <h4 style="margin-top:0;">Nova Fala do Mago</h4>
                    <div style="display:flex; gap:10px; margin-bottom:10px;">
                        <input id="ig-nwMago" class="ig-input" placeholder="Ex: Bravo, (citarAluno)!" style="flex:1;">
                        <button data-action="inserir-variavel-mago" class="ws-btn" style="background:#8B5CF6; color:#fff; border:none; padding:10px; border-radius:8px;">+(citarAluno)</button>
                        <button data-action="salvar-mago-phrase" id="btn-salvar-mago" class="ws-btn" style="background:#4F46E5; color:#fff; border:none; padding:10px; border-radius:8px;">Salvar</button>
                    </div>
                    <div style="max-height:200px; overflow-y:auto; font-size:13px;">
                        ${state.magoPhrases.map((m,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px;border-bottom:1px solid #E2E8F0;"><span>${i+1}. ${esc(m.text)}</span><div><button data-action="editar-mago-phrase" data-id="${m.id}" style="color:#D97706;border:none;background:none;cursor:pointer;margin-right:10px;">✏️</button><button data-action="remover-item" data-key="magoPhrases" data-id="${m.id}" style="color:red;border:none;background:none;cursor:pointer;">✕</button></div></div>`).join('')}
                    </div>
                </div>
            `;
            const lista = document.getElementById('ws-mago-lista-falas');
            if(lista){
                lista.addEventListener('dragstart', e=>{ e.dataTransfer.setData('text/plain', e.target.closest('[data-id]')?.dataset.id); e.target.style.opacity='0.5'; });
                lista.addEventListener('dragover', e=>{ e.preventDefault(); e.target.closest('.ig-list-item')?.style.setProperty('border-top','3px solid #4F46E5'); });
                lista.addEventListener('dragleave', e=>{ e.target.closest('.ig-list-item')?.style.setProperty('border-top','1px solid #eee'); });
                lista.addEventListener('drop', async e=>{
                    e.preventDefault(); const dragged=e.dataTransfer.getData('text/plain'); const target=e.target.closest('[data-id]')?.dataset.id;
                    if(dragged&&target&&dragged!==target){
                        const arr = state.magoPhrases; const i1=arr.findIndex(x=>x.id===dragged); const i2=arr.findIndex(x=>x.id===target);
                        if(i1>-1&&i2>-1){ const [it]=arr.splice(i1,1); arr.splice(i2,0,it); await Workspace.Ingles.saveDados(); Workspace.InglesProfessor.renderProfessorTab('mago'); }
                    }
                });
                lista.addEventListener('dragend', e=>{ e.target.style.opacity='1'; document.querySelectorAll('.ig-list-item').forEach(n=>n.style.borderTop='1px solid #eee'); });
            }
        }
        else if (tabId === 'quests'){
            document.getElementById('tab-quests').innerHTML=`
                <h3 style="margin-top:0;">🎯 Missões Diárias e Desafios</h3>
                <div class="prof-card" style="margin-bottom:20px;">
                    <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:10px;">
                        <input id="ig-qTexto" class="ig-input" placeholder="Texto (Ex: Acerte 5 Quizzes)" style="flex:2; min-width:150px;">
                        <input id="ig-qAlvo" type="number" class="ig-input" placeholder="Alvo (Qtd)" style="flex:1; min-width:80px;">
                        <input id="ig-qXP" type="number" class="ig-input" placeholder="BZ Bônus" style="flex:1; min-width:80px;">
                        <input id="ig-qIcone" class="ig-input" placeholder="Ícone 🎯" value="🎯" style="flex:1; min-width:60px;">
                    </div>
                    <div style="display:flex; gap:10px;">
                        <select id="ig-qTipo" class="ig-input" style="flex:1;"><option value="diaria">Diária</option><option value="semanal">Semanal</option></select>
                        <button data-action="add-quest" class="ws-btn" style="background:#4F46E5; color:#fff; border:none; padding:10px 16px; border-radius:8px;">Adicionar Missão</button>
                    </div>
                </div>
                <div class="grid-cards">
                    ${state.quests.map(q=>`<div class="prof-card"><b>${q.icone} ${esc(q.texto)}</b><br><small>Alvo: ${q.alvo} | +${q.recompensaXP} BZ | ${q.tipo}</small><br><button data-action="rem-quest" data-id="${q.id}" class="ws-btn" style="margin-top:10px; background:#FEE2E2; color:#EF4444; border:none; width:100%; padding:6px; border-radius:6px;">Remover</button></div>`).join('')}
                </div>
            `;
        }
        else if (tabId === 'loja'){
            const loot = state.lootTables || {};
            document.getElementById('tab-loja').innerHTML=`
                <h3 style="margin-top:0;">🛍 Tabelas de Recompensa (Loot dos Baús)</h3>
                <div class="grid-cards">
                    <div class="prof-card">
                        <h4>📦 Comum</h4>
                        <div style="display:flex; gap:5px; margin-bottom:10px;"><input id="ig-lootNomeComum" class="ig-input" placeholder="Item Comum"><button data-action="add-loot" data-rar="comum" class="ws-btn" style="background:#475569; color:#fff; border:none; border-radius:6px; padding:0 12px;">+</button></div>
                        ${(loot.comum||[]).map(i=>`<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;"><span>${esc(i.nome)}</span><button data-action="rem-loot" data-rar="comum" data-id="${i.id}" style="color:red;border:none;background:none;cursor:pointer;">✕</button></div>`).join('')}
                    </div>
                    <div class="prof-card" style="border-color:#8B5CF6; background:#F5F3FF;">
                        <h4 style="color:#6D28D9;">💎 Épico</h4>
                        <div style="display:flex; gap:5px; margin-bottom:10px;"><input id="ig-lootNomeEpico" class="ig-input" placeholder="Item Épico"><button data-action="add-loot" data-rar="epico" class="ws-btn" style="background:#8B5CF6; color:#fff; border:none; border-radius:6px; padding:0 12px;">+</button></div>
                        ${(loot.epico||[]).map(i=>`<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;"><span>${esc(i.nome)}</span><button data-action="rem-loot" data-rar="epico" data-id="${i.id}" style="color:red;border:none;background:none;cursor:pointer;">✕</button></div>`).join('')}
                    </div>
                    <div class="prof-card" style="border-color:#F59E0B; background:#FFFBEB;">
                        <h4 style="color:#B45309;">👑 Lendário</h4>
                        <div style="display:flex; gap:5px; margin-bottom:10px;"><input id="ig-lootNomeLendario" class="ig-input" placeholder="Item Lendário"><button data-action="add-loot" data-rar="lendario" class="ws-btn" style="background:#F59E0B; color:#fff; border:none; border-radius:6px; padding:0 12px;">+</button></div>
                        ${(loot.lendario||[]).map(i=>`<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;"><span>${esc(i.nome)}</span><button data-action="rem-loot" data-rar="lendario" data-id="${i.id}" style="color:red;border:none;background:none;cursor:pointer;">✕</button></div>`).join('')}
                    </div>
                </div>
            `;
        }
        else if (tabId === 'season'){
            const s = state.season;
            document.getElementById('tab-season').innerHTML=`
                <h3 style="margin-top:0;">⚙️ Configuração da Temporada</h3>
                <div class="prof-card">
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                        <div><label style="font-weight:700;font-size:12px;">Nome da Temporada</label><input id="ig-seasonNome" class="ig-input" value="${esc(s.nome||'')}"></div>
                        <div><label style="font-weight:700;font-size:12px;">Multiplicador de Moedas</label><input id="ig-seasonMult" type="number" step="0.1" class="ig-input" value="${s.xpMultiplier||1}"></div>
                    </div>
                    <div style="margin-top:16px; display:flex; flex-wrap:wrap; gap:10px;">
                        <button data-action="salvar-season" class="ws-btn" style="background:#4F46E5; color:#fff; border:none; padding:12px 20px; border-radius:8px;">Salvar Temporada</button>
                        <button data-action="reset-season" class="ws-btn" style="background:#e74c3c; color:#fff; border:none; padding:12px 20px; border-radius:8px;">🔄 Resetar Season</button>
                    </div>
                </div>
            `;
        }
        else if (tabId === 'algoritmo'){
            const totalProf = state.words.length + state.phrases.length + state.quizzes.length + state.pictures.length;
            document.getElementById('tab-algoritmo').innerHTML=`
                <h3 style="margin-top:0;">🧠 Estatísticas do SRS (Algoritmo)</h3>
                <div class="grid-cards">
                    <div class="prof-card" style="text-align:center; border-color:#4F46E5;"><div style="font-size:32px; font-weight:900; color:#4F46E5;">${totalProf}</div><b>Desafios Criados</b></div>
                    <div class="prof-card" style="text-align:center; border-color:#EF4444;"><div style="font-size:32px; font-weight:900; color:#EF4444;">${state.errosRetidos.length}</div><b>Erros Retidos</b></div>
                    <div class="prof-card" style="text-align:center; border-color:#F59E0B;"><div style="font-size:32px; font-weight:900; color:#F59E0B;">${state.pool.length}</div><b>Piscina Global (Envios)</b></div>
                </div>
            `;
        }
        else if (tabId === 'ranking'){
            document.getElementById('tab-ranking').innerHTML=`
                <h3 style="margin-top:0;">🏆 Ranking da Escola</h3>
                <div id="ig-ranking-list"><div style="text-align:center;padding:40px;color:#94a3b8;">A carregar o ranking...</div></div>
            `;
            this.carregarRanking();
        }
    }
};