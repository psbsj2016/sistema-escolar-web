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
            case 'remover-item':
                state[b.dataset.key] = state[b.dataset.key].filter(i => i.id !== b.dataset.id);
                await Ingles.saveDados();
                const activeTab = document.querySelector('.ig-side-item.active')?.dataset.tab || 'biblioteca';
                Workspace.InglesProfessor.renderProfessorTab(activeTab);
                Ingles.mostrarAvisoLocal('Item removido com sucesso!', 'success');
                break;
            case 'add-word':
                const iW = document.getElementById('ig-nwWord'), iT = document.getElementById('ig-nwTrans'); 
                const w = iW?.value.trim(), t = iT?.value.trim(); 
                if(!w) return Ingles.mostrarAvisoLocal('Digite a palavra!', 'warning'); 
                state.words.unshift({id: 'w'+Date.now(), word: w, translation: t, level: 'B1'}); 
                await Ingles.saveDados(); 
                if(iW) iW.value = ''; if(iT) iT.value = ''; 
                Workspace.InglesProfessor.renderProfessorTab('biblioteca'); 
                Ingles.mostrarAvisoLocal('Palavra adicionada!', 'success'); 
                break;
            case 'add-phrase':
                const iP = document.getElementById('ig-nwPhrase'); const p = iP?.value.trim(); 
                if(!p) return Ingles.mostrarAvisoLocal('Digite a frase!', 'warning'); 
                state.phrases.unshift({id: 'p'+Date.now(), phrase: p, level: 'A2'}); 
                await Ingles.saveDados(); 
                if(iP) iP.value = '';
                Workspace.InglesProfessor.renderProfessorTab('biblioteca'); 
                Ingles.mostrarAvisoLocal('Frase adicionada!', 'success'); 
                break;
            case 'add-quiz':
                const iQ = document.getElementById('ig-qQuestion'), iO1 = document.getElementById('ig-qOpt1'), iO2 = document.getElementById('ig-qOpt2'); 
                const q = iQ?.value.trim(), o1 = iO1?.value.trim(), o2 = iO2?.value.trim(); 
                if(!q || !o1 || !o2) return Ingles.mostrarAvisoLocal('Preencha a pergunta e as duas opções!', 'warning'); 
                state.quizzes.unshift({id: 'q'+Date.now(), question: q, options: [o1, o2], correct: 1, level: 'B1'}); 
                await Ingles.saveDados(); 
                if(iQ) iQ.value=''; if(iO1) iO1.value=''; if(iO2) iO2.value='';
                Workspace.InglesProfessor.renderProfessorTab('biblioteca'); 
                Ingles.mostrarAvisoLocal('Quiz adicionado!', 'success'); 
                break;
            case 'add-pic':
                const iPicW = document.getElementById('ig-picWord'), iPicT = document.getElementById('ig-picTrans'), iPicE = document.getElementById('ig-picEmoji'); 
                const picW = iPicW?.value.trim(), picT = iPicT?.value.trim(), picE = iPicE?.value.trim() || '🖼';
                if(!picW) return Ingles.mostrarAvisoLocal('Digite a palavra em Inglês!', 'warning'); 
                state.pictures.unshift({id: 'pic'+Date.now(), word: picW, translation: picT, emoji: picE, category: 'Custom'}); 
                await Ingles.saveDados(); 
                if(iPicW) iPicW.value=''; if(iPicT) iPicT.value=''; if(iPicE) iPicE.value='';
                Workspace.InglesProfessor.renderProfessorTab('imagens'); 
                Ingles.mostrarAvisoLocal('Figura adicionada!', 'success'); 
                break;
            case 'add-wordPicker':
                const iWpT = document.getElementById('ig-wpText'), iWpO1 = document.getElementById('ig-wpOpt1'), iWpO2 = document.getElementById('ig-wpOpt2');
                const wpText = iWpT?.value.trim(), wpO1 = iWpO1?.value.trim(), wpO2 = iWpO2?.value.trim();
                if(!wpText || !wpO1 || !wpO2) return Ingles.mostrarAvisoLocal('Preencha o texto base e as opções!', 'warning');
                state.wordPickers.unshift({id: 'wp'+Date.now(), text: wpText, options: [wpO1, wpO2], correct: 1});
                await Ingles.saveDados();
                if(iWpT) iWpT.value=''; if(iWpO1) iWpO1.value=''; if(iWpO2) iWpO2.value='';
                Workspace.InglesProfessor.renderProfessorTab('biblioteca'); Ingles.mostrarAvisoLocal('Poção adicionada!','success');
                break;
            case 'add-minimal':
                const iMpA = document.getElementById('ig-mpA'), iMpB = document.getElementById('ig-mpB');
                const mpA = iMpA?.value.trim(), mpB = iMpB?.value.trim();
                if(!mpA || !mpB) return Ingles.mostrarAvisoLocal('Preencha os dois sons (pares)!', 'warning');
                state.minimalPairs.unshift({id: 'mp'+Date.now(), a: mpA, b: mpB});
                await Ingles.saveDados();
                if(iMpA) iMpA.value=''; if(iMpB) iMpB.value='';
                Workspace.InglesProfessor.renderProfessorTab('biblioteca'); Ingles.mostrarAvisoLocal('Sons adicionados!','success');
                break;
            case 'add-debate':
                const iDbT = document.getElementById('ig-dbTopic'), iDbS = document.getElementById('ig-dbStarter');
                const dbTopic = iDbT?.value.trim(), dbStarter = iDbS?.value.trim() || 'What is your opinion?';
                if(!dbTopic) return Ingles.mostrarAvisoLocal('Preencha o tópico do debate!', 'warning');
                state.debates.unshift({id: 'd'+Date.now(), topic: dbTopic, starter: dbStarter});
                await Ingles.saveDados();
                if(iDbT) iDbT.value=''; if(iDbS) iDbS.value='';
                Workspace.InglesProfessor.renderProfessorTab('biblioteca'); Ingles.mostrarAvisoLocal('Debate adicionado!','success');
                break;
            case 'add-roleplay':
                const iRpT = document.getElementById('ig-rpTitle'), iRpP = document.getElementById('ig-rpPrompt'), iRpTip = document.getElementById('ig-rpTip');
                const rpTitle = iRpT?.value.trim(), rpPrompt = iRpP?.value.trim(), rpTip = iRpTip?.value.trim() || 'Use inglês natural';
                if(!rpTitle || !rpPrompt) return Ingles.mostrarAvisoLocal('Preencha o título e a fala inicial!', 'warning');
                state.roleplays.unshift({id: 'rp'+Date.now(), title: rpTitle, prompt: rpPrompt, tip: rpTip});
                await Ingles.saveDados();
                if(iRpT) iRpT.value=''; if(iRpP) iRpP.value=''; if(iRpTip) iRpTip.value='';
                Workspace.InglesProfessor.renderProfessorTab('biblioteca'); Ingles.mostrarAvisoLocal('Roleplay adicionado!','success');
                break;
            case 'add-question':
                const iAqT = document.getElementById('ig-aqText'); const aqTxt = iAqT?.value.trim();
                if(!aqTxt) return Ingles.mostrarAvisoLocal('Digite a pergunta aberta!', 'warning');
                state.questions.unshift({id: 'aq'+Date.now(), text: aqTxt});
                await Ingles.saveDados();
                if(iAqT) iAqT.value='';
                Workspace.InglesProfessor.renderProfessorTab('biblioteca'); Ingles.mostrarAvisoLocal('Pergunta adicionada!','success');
                break;
            case 'ensinar-ia':
                const inputFrase = document.getElementById('ig-ia-frase')?.value?.trim();
                const inputCat = document.getElementById('ig-ia-categoria')?.value?.trim().toLowerCase();
                
                if(!inputFrase || !inputCat) return Ingles.mostrarAvisoLocal('Preencha a frase e a categoria!', 'warning');
                
                const btnEnsinar = b;
                btnEnsinar.innerText = 'A ensinar...';
                
                Workspace.api('/workspace/ingles/ia-teste/ensinar', 'POST', { frase: inputFrase, categoria: inputCat })
                    .then(res => {
                        btnEnsinar.innerText = '🧠 Ensinar Frase';
                        if(res && res.success) {
                            Ingles.mostrarAvisoLocal('Ptt AI aprendeu com sucesso!', 'success');
                            document.getElementById('ig-ia-frase').value = '';
                        } else {
                            Ingles.mostrarAvisoLocal('Falha ao ensinar.', 'error');
                        }
                    }).catch(() => { btnEnsinar.innerText = '🧠 Ensinar Frase'; Ingles.mostrarAvisoLocal('Erro de ligação.', 'error'); });
                break;
                
            case 'falar-ia':
                const inputFalar = document.getElementById('ig-ia-chat-input')?.value?.trim();
                if(!inputFalar) return;
                
                const chatContainer = document.getElementById('ig-ia-chat-history');
                // Mostra o que o professor escreveu
                chatContainer.innerHTML += `<div style="text-align:right; margin-bottom:10px;"><span style="background:#4F46E5; color:#fff; padding:8px 12px; border-radius:12px; display:inline-block;">${Workspace.escapeHTML(inputFalar)}</span></div>`;
                document.getElementById('ig-ia-chat-input').value = '';
                
                Workspace.api('/workspace/ingles/ia-teste/falar', 'POST', { mensagem: inputFalar })
                    .then(res => {
                        if(res && res.success) {
                            // Mostra a resposta da IA e os bastidores (o que ela pensou)
                            chatContainer.innerHTML += `
                                <div style="text-align:left; margin-bottom:10px;">
                                    <span style="background:#F1F5F9; border:1px solid #E2E8F0; color:#0F172A; padding:8px 12px; border-radius:12px; display:inline-block;">
                                        🤖 <b>Ptt AI:</b> ${Workspace.escapeHTML(res.resposta)}
                                        <div style="font-size:10px; color:#10B981; margin-top:4px; font-weight:bold;">${Workspace.escapeHTML(res.bastidores)}</div>
                                    </span>
                                </div>`;
                            chatContainer.scrollTop = chatContainer.scrollHeight;
                        }
                    });
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
                Ingles.mostrarAvisoLocal('Aprovado para a Piscina Global! 🌊', 'success');
                break;
            case 'rejeitar-envio':
                state.submissions = state.submissions.filter(i => i.id !== b.dataset.id); 
                await Ingles.saveDados(); 
                Workspace.InglesProfessor.renderProfessorTab('envios'); 
                Ingles.mostrarAvisoLocal('Envio apagado!', 'success');
                break;
        }
    },

    carregarRanking: async function() {
        const listEl = document.getElementById('ig-ranking-list');
        if(!listEl) return;
        listEl.innerHTML = '<div style="text-align:center;padding:40px;color:#94a3b8;font-weight:600;">A carregar o pódio da escola... ⏳</div>';
        
        try {
            const escolaId = Workspace.usuario.escolaId || 'DEFAULT';
            const res = await Workspace.api(`/workspace/ingles/ranking?escolaId=${escolaId}`,'GET');
            
            if(!res?.success) { listEl.innerHTML = '<div style="text-align:center;padding:40px;color:#e74c3c;font-weight:700;">Erro ao carregar o ranking. Verifique a ligação.</div>'; return; }
            
            const ranking = res.ranking || [];
            
            if(!ranking.length) { 
                listEl.innerHTML = '<div style="text-align:center;padding:40px;color:#94a3b8;font-weight:600;">Nenhum treino registado ainda. A corrida começa agora!</div>'; 
                return; 
            }
            
            listEl.innerHTML = ranking.map((r, i) => {
                const liga = r.liga || 'aprendiz';
                const medalha = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
                const bordaStyle = liga === 'ouro' ? 'border-color:#fde68a;box-shadow:0 0 10px rgba(253,230,138,0.3)' : liga === 'prata' ? 'border-color:#94a3b8' : liga === 'bronze' ? 'border-color:#d97706' : '';
                
                return `<div class="ig-rank-item ${liga}" style="display:flex; align-items:center; gap:12px; padding:16px; background:#fff; border:2px solid #e2e8f0; border-radius:14px; margin-bottom:10px; transition:0.2s; ${bordaStyle}">
                    <div style="width:40px;height:40px;background:${liga==='ouro'?'linear-gradient(135deg,#fde68a,#d4af37)': liga==='prata'?'#e2e8f0': liga==='bronze'?'#fed7aa':'#f1f5f9'};border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;flex-shrink:0">${medalha || (i+1)}</div>
                    <div style="flex:1;min-width:0">
                        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                            <b style="color:#0f172a;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${Workspace.escapeHTML(r.nome||'Aluno')}</b>
                            <span style="font-size:10px;background:${liga==='ouro'?'#fde68a': liga==='prata'?'#e2e8f0':'#ffedd5'};color:#000;padding:4px 8px;border-radius:12px;font-weight:800;text-transform:uppercase">${liga}</span>
                        </div>
                        <div style="display:flex;gap:12px;margin-top:6px;font-size:12px;color:#64748B;font-weight:600;">
                            <span>🔥 Streak: ${r.streak||1}d</span>
                        </div>
                    </div>
                    <div style="text-align:right;flex-shrink:0">
                        <div style="font-size:14px;background:#FFFBEB;color:#D97706;padding:8px 16px;border-radius:20px;font-weight:800; border:1px solid #FDE68A;">🪙 ${(r.coins?.bronze || 0)} BZ</div>
                    </div>
                </div>`;
            }).join('');
        } catch(e) { 
            listEl.innerHTML = `<div style="text-align:center;padding:40px;color:#e74c3c;">Erro: ${e.message}</div>`; 
        }
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
                <div class="ig-prof-header" style="border:none; margin-bottom:5px;">📚 Biblioteca Principal (SRS)</div>
                <p style="color:#64748B; font-size:14px; margin-bottom:24px;">Os itens criados aqui serão treinados de forma inteligente pelo algoritmo na área do aluno.</p>
                
                <div class="grid-cards">
                    <!-- Vocabulário -->
                    <div class="prof-card">
                        <div class="ig-prof-header">Vocabulário <span style="color:#64748B;font-size:14px">(${state.words.length})</span></div>
                        <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px;">
                            <input id="ig-nwWord" class="ig-input" style="flex:1; min-width:110px;" placeholder="Inglês (ex: apple)">
                            <input id="ig-nwTrans" class="ig-input" style="flex:1; min-width:110px;" placeholder="Tradução">
                            <button data-action="add-word" class="ws-btn-primary">➕ Adicionar</button>
                        </div>
                        <div class="prof-list-scroll">
                            ${state.words.map(w=>`<div class="prof-list-item"><span><b>${esc(w.word)}</b> <span style="color:#cbd5e1;margin:0 4px">|</span> ${esc(w.translation)}</span><button data-action="remover-item" data-key="words" data-id="${w.id}" class="ws-btn-danger" style="padding:4px 8px;font-size:11px">✕</button></div>`).join('')}
                        </div>
                    </div>
                    
                    <!-- Frases -->
                    <div class="prof-card">
                        <div class="ig-prof-header">Frases e Expressões <span style="color:#64748B;font-size:14px">(${state.phrases.length})</span></div>
                        <div style="display:flex; gap:8px; margin-bottom:12px;">
                            <input id="ig-nwPhrase" class="ig-input" placeholder="Digite uma frase inteira em inglês..." style="flex:1;">
                            <button data-action="add-phrase" class="ws-btn-primary">➕ Adicionar</button>
                        </div>
                        <div class="prof-list-scroll">
                            ${state.phrases.map(p=>`<div class="prof-list-item"><span>${esc(p.phrase)}</span><button data-action="remover-item" data-key="phrases" data-id="${p.id}" class="ws-btn-danger" style="padding:4px 8px;font-size:11px">✕</button></div>`).join('')}
                        </div>
                    </div>

                    <!-- Quizzes -->
                    <div class="prof-card">
                        <div class="ig-prof-header">Testes Rápidos (Quiz) <span style="color:#64748B;font-size:14px">(${state.quizzes.length})</span></div>
                        <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
                            <input id="ig-qQuestion" class="ig-input" placeholder="Pergunta em Inglês">
                            <div style="display:flex; gap:8px;">
                                <input id="ig-qOpt1" class="ig-input" placeholder="Opção Errada" style="flex:1;">
                                <input id="ig-qOpt2" class="ig-input" placeholder="Opção Correta" style="flex:1;">
                                <button data-action="add-quiz" class="ws-btn-primary">➕</button>
                            </div>
                        </div>
                        <div class="prof-list-scroll">
                            ${state.quizzes.map(q=>`<div class="prof-list-item"><span><b>${esc(q.question)}</b> <br><small style="color:#10b981;font-weight:700;">Correta: ${esc(q.options[q.correct])}</small></span><button data-action="remover-item" data-key="quizzes" data-id="${q.id}" class="ws-btn-danger" style="padding:4px 8px;font-size:11px">✕</button></div>`).join('')}
                        </div>
                    </div>

                    <!-- WordPickers -->
                    <div class="prof-card">
                        <div class="ig-prof-header">Poção Sintática (Lacunas) <span style="color:#64748B;font-size:14px">(${state.wordPickers.length})</span></div>
                        <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
                            <input id="ig-wpText" class="ig-input" placeholder="Ex: I have ___ keys. (Use ___ para a lacuna)">
                            <div style="display:flex; gap:8px;">
                                <input id="ig-wpOpt1" class="ig-input" placeholder="Errada" style="flex:1;">
                                <input id="ig-wpOpt2" class="ig-input" placeholder="Correta" style="flex:1;">
                                <button data-action="add-wordPicker" class="ws-btn-primary">➕</button>
                            </div>
                        </div>
                        <div class="prof-list-scroll">
                            ${state.wordPickers.map(s=>`<div class="prof-list-item"><span><b>${esc(s.text)}</b> <br><small style="color:#10b981;font-weight:700;">Correta: ${esc(s.options[s.correct])}</small></span><button data-action="remover-item" data-key="wordPickers" data-id="${s.id}" class="ws-btn-danger" style="padding:4px 8px;font-size:11px">✕</button></div>`).join('')}
                        </div>
                    </div>

                    <!-- Minimal Pairs -->
                    <div class="prof-card">
                        <div class="ig-prof-header">Sussurros Gêmeos (Sons) <span style="color:#64748B;font-size:14px">(${state.minimalPairs.length})</span></div>
                        <div style="display:flex; gap:8px; margin-bottom:12px;">
                            <input id="ig-mpA" class="ig-input" placeholder="Som 1 (ex: ship)" style="flex:1;">
                            <input id="ig-mpB" class="ig-input" placeholder="Som 2 (ex: sheep)" style="flex:1;">
                            <button data-action="add-minimal" class="ws-btn-primary">➕ Adicionar</button>
                        </div>
                        <div class="prof-list-scroll">
                            ${state.minimalPairs.map(m=>`<div class="prof-list-item"><span>${esc(m.a)} <b>vs</b> ${esc(m.b)}</span><button data-action="remover-item" data-key="minimalPairs" data-id="${m.id}" class="ws-btn-danger" style="padding:4px 8px;font-size:11px">✕</button></div>`).join('')}
                        </div>
                    </div>

                    <!-- Debates -->
                    <div class="prof-card">
                        <div class="ig-prof-header">Duelo de Mentes (Debate IA) <span style="color:#64748B;font-size:14px">(${state.debates.length})</span></div>
                        <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
                            <input id="ig-dbTopic" class="ig-input" placeholder="Tópico (ex: AI in schools)">
                            <div style="display:flex; gap:8px;">
                                <input id="ig-dbStarter" class="ig-input" placeholder="Fala inicial da IA..." style="flex:1;">
                                <button data-action="add-debate" class="ws-btn-primary">➕</button>
                            </div>
                        </div>
                        <div class="prof-list-scroll">
                            ${state.debates.map(d=>`<div class="prof-list-item"><span><b>Tema:</b> ${esc(d.topic)}</span><button data-action="remover-item" data-key="debates" data-id="${d.id}" class="ws-btn-danger" style="padding:4px 8px;font-size:11px">✕</button></div>`).join('')}
                        </div>
                    </div>

                    <!-- Roleplays -->
                    <div class="prof-card">
                        <div class="ig-prof-header">Interpretação (Roleplays) <span style="color:#64748B;font-size:14px">(${state.roleplays.length})</span></div>
                        <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
                            <input id="ig-rpTitle" class="ig-input" placeholder="Título (ex: No Restaurante)">
                            <input id="ig-rpPrompt" class="ig-input" placeholder="Situação inicial / Fala do NPC">
                            <div style="display:flex; gap:8px;">
                                <input id="ig-rpTip" class="ig-input" placeholder="Dica de gramática (Opcional)" style="flex:1;">
                                <button data-action="add-roleplay" class="ws-btn-primary">➕</button>
                            </div>
                        </div>
                        <div class="prof-list-scroll">
                            ${state.roleplays.map(r=>`<div class="prof-list-item"><span><b>${esc(r.title)}</b></span><button data-action="remover-item" data-key="roleplays" data-id="${r.id}" class="ws-btn-danger" style="padding:4px 8px;font-size:11px">✕</button></div>`).join('')}
                        </div>
                    </div>

                    <!-- Perguntas Abertas -->
                    <div class="prof-card">
                        <div class="ig-prof-header">Perguntas Abertas <span style="color:#64748B;font-size:14px">(${state.questions.length})</span></div>
                        <div style="display:flex; gap:8px; margin-bottom:12px;">
                            <input id="ig-aqText" class="ig-input" placeholder="Escreva uma pergunta..." style="flex:1;">
                            <button data-action="add-question" class="ws-btn-primary">➕ Adicionar</button>
                        </div>
                        <div class="prof-list-scroll">
                            ${state.questions.map(q=>`<div class="prof-list-item"><span>${esc(q.text)}</span><button data-action="remover-item" data-key="questions" data-id="${q.id}" class="ws-btn-danger" style="padding:4px 8px;font-size:11px">✕</button></div>`).join('')}
                        </div>
                    </div>

                </div>`;
        }
        else if (tabId === 'envios'){
            const pendentes = state.submissions.filter(s=>s.status==='pending');
            document.getElementById('pendingCount').textContent = pendentes.length;
            document.getElementById('tab-envios').innerHTML=`
                <div class="ig-prof-header" style="border:none; margin-bottom:5px;">📥 Forja de Conteúdo (Respostas dos Alunos)</div>
                <p style="color:#64748B; font-size:14px; margin-bottom:24px;">As respostas criativas dos alunos aparecem aqui. Ao aprovar, elas entram na <b>Piscina Global</b> e tornam o algoritmo da IA mais inteligente e personalizado.</p>
                
                ${pendentes.length===0 ? '<div style="background:#fff; border:1px dashed #cbd5e1; border-radius:16px; padding:40px; text-align:center;"><span style="font-size:40px;">📭</span><h3 style="color:#475569;margin-top:15px;">Nenhum envio pendente. A forja está vazia!</h3></div>' : 
                pendentes.map(s=>`
                    <div class="prof-card" style="border-left: 4px solid #6366f1; margin-bottom:16px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
                        <div style="font-size:12px; color:#64748B; margin-bottom:10px; display:flex; justify-content:space-between;">
                            <span><b>👤 ${esc(s.student)}</b> no jogo 🎮 ${esc(s.game)}</span>
                        </div>
                        <div style="font-size:16px; color:#0F172A; margin-bottom:16px; font-weight:600; background:#f8fafc; padding:15px; border-radius:8px; border:1px solid #e2e8f0;">"${esc(s.text)}"</div>
                        <div style="display:flex; flex-wrap:wrap; gap:12px;">
                            <button data-action="aprovar-envio" data-id="${s.id}" class="ws-btn-success">🌟 Aprovar (Enviar p/ Piscina)</button>
                            <button data-action="rejeitar-envio" data-id="${s.id}" class="ws-btn-danger">🗑 Rejeitar</button>
                        </div>
                    </div>
                `).join('')}
                
                <div class="ig-prof-header" style="margin-top:40px;">🌊 Piscina Global <span style="color:#64748B;font-size:14px">(${state.pool.length} Aprovados)</span></div>
                <div class="prof-list-scroll" style="max-height:300px; background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:15px;">
                    ${state.pool.length === 0 ? '<div style="text-align:center; color:#94a3b8; padding:20px;">A piscina está vazia. Aprove respostas para a encher!</div>' : state.pool.map(p=>`
                        <div class="prof-list-item">
                            <span style="font-size:13px;"><b>${esc(p.student||'Anónimo')}:</b> "${esc(p.text).substring(0,80)}..." <span style="color:#94a3b8;font-size:11px;margin-left:10px;">(${esc(p.type)})</span></span>
                            <button data-action="remover-item" data-key="pool" data-id="${p.id}" class="ws-btn-danger" style="padding:4px 8px;font-size:11px;">✕</button>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        else if (tabId === 'imagens'){
            document.getElementById('tab-imagens').innerHTML=`
                <div class="ig-prof-header" style="border:none; margin-bottom:5px;">🖼 Banco de Figuras (Visão do Alquimista)</div>
                <p style="color:#64748B; font-size:14px; margin-bottom:24px;">Adicione palavras e o emoji correspondente. O jogo vai pedir ao aluno para invocar o nome em Inglês quando vir a imagem.</p>
                
                <div class="prof-card" style="margin-bottom:24px;">
                    <div style="display:flex; flex-wrap:wrap; gap:10px;">
                        <input id="ig-picWord" class="ig-input" placeholder="Palavra Inglês" style="flex:2; min-width:140px;">
                        <input id="ig-picTrans" class="ig-input" placeholder="Tradução" style="flex:2; min-width:140px;">
                        <input id="ig-picEmoji" class="ig-input" placeholder="Emoji 🍎" style="flex:1; min-width:80px; font-size:20px; text-align:center;">
                        <button data-action="add-pic" class="ws-btn-primary">➕ Adicionar Figura</button>
                    </div>
                </div>
                <div class="grid-cards">
                    ${state.pictures.map(p=>`
                    <div class="prof-card" style="align-items:center; justify-content:center; text-align:center;">
                        <div style="font-size:55px; margin-bottom:10px; filter:drop-shadow(0 5px 10px rgba(0,0,0,0.1));">${p.emoji}</div>
                        <h4 style="margin:0; font-size:18px; color:#1e293b;">${esc(p.word)}</h4>
                        <p style="margin:4px 0 16px 0; color:#64748B; font-size:13px; font-weight:600;">${esc(p.translation||'')}</p>
                        <button data-action="remover-item" data-key="pictures" data-id="${p.id}" class="ws-btn-danger" style="width:100%;">✕ Remover</button>
                    </div>`).join('')}
                </div>
            `;
        }
        else if (tabId === 'algoritmo'){
            const totalProf = state.words.length + state.phrases.length + state.quizzes.length + state.pictures.length + state.wordPickers.length + state.minimalPairs.length + state.debates.length + state.roleplays.length + state.questions.length;
            document.getElementById('tab-algoritmo').innerHTML=`
                <div class="ig-prof-header">🧠 Estatísticas do SRS (Inteligência Artificial)</div>
                <p style="color:#64748B; font-size:14px; margin-bottom:24px;">Visão global da saúde da sua base de dados educacional. O algoritmo equilibra automaticamente estes números para os alunos.</p>
                <div class="grid-cards">
                    <div class="prof-card" style="text-align:center; border-top:4px solid #4F46E5; justify-content:center;">
                        <div style="font-size:45px; font-weight:900; color:#4F46E5; font-family:'Plus Jakarta Sans', sans-serif;">${totalProf}</div>
                        <h4 style="margin:5px 0; color:#1e293b;">Desafios Criados</h4>
                        <p style="margin:0; font-size:12px; color:#64748B;">Sementes na Biblioteca</p>
                    </div>
                    <div class="prof-card" style="text-align:center; border-top:4px solid #EF4444; justify-content:center;">
                        <div style="font-size:45px; font-weight:900; color:#EF4444; font-family:'Plus Jakarta Sans', sans-serif;">${state.errosRetidos.length}</div>
                        <h4 style="margin:5px 0; color:#1e293b;">Erros Retidos</h4>
                        <p style="margin:0; font-size:12px; color:#64748B;">Em memória de curto-prazo</p>
                    </div>
                    <div class="prof-card" style="text-align:center; border-top:4px solid #F59E0B; justify-content:center;">
                        <div style="font-size:45px; font-weight:900; color:#F59E0B; font-family:'Plus Jakarta Sans', sans-serif;">${state.pool.length}</div>
                        <h4 style="margin:5px 0; color:#1e293b;">Piscina Global</h4>
                        <p style="margin:0; font-size:12px; color:#64748B;">Respostas aprovadas de alunos</p>
                    </div>
                </div>
            `;
        }
        else if (tabId === 'ranking'){
            document.getElementById('tab-ranking').innerHTML=`
                <div class="ig-prof-header">🏆 Pódio Oficial da Escola</div>
                <p style="color:#64748B; font-size:14px; margin-bottom:24px;">A tabela de classificação atualizada em tempo real. Baseada na recolha de Moedas de Bronze (BZ).</p>
                <div id="ig-ranking-list" style="max-width:800px; margin:0 auto;"><div style="text-align:center;padding:40px;color:#94a3b8;font-weight:600;">A carregar o pódio da escola... ⏳</div></div>
            `;
            this.carregarRanking();
        }

else if (tabId === 'laboratorio'){
            document.getElementById('tab-laboratorio').innerHTML=`
                <div class="ig-prof-header" style="color:#059669; border-bottom:2px solid #10B981;">🧪 Laboratório de Machine Learning (Ptt AI)</div>
                <p style="color:#64748B; font-size:14px; margin-bottom:24px;">Esta é uma sandbox isolada. Aqui, pode ensinar à máquina como classificar intenções e testar como o cérebro dela reage antes de implementá-la em jogos reais.</p>
                
                <div class="grid-cards" style="grid-template-columns: 1fr 1fr;">
                    
                    <!-- CENTRO DE TREINAMENTO -->
                    <div class="prof-card" style="border-top:4px solid #10B981;">
                        <h3 style="margin:0 0 15px 0; color:#0F172A;">🏋️‍♂️ Centro de Treinamento</h3>
                        <p style="font-size:13px; color:#64748B; margin-bottom:15px;">Diga à máquina que tipo de frase é esta (ex: Categoria: "discordar", "elogio", "duvida").</p>
                        
                        <div style="display:flex; flex-direction:column; gap:10px;">
                            <input id="ig-ia-frase" class="ig-input" placeholder="Escreva a frase em Inglês...">
                            <input id="ig-ia-categoria" class="ig-input" placeholder="Nome da Categoria (ex: concordar)">
                            <button data-action="ensinar-ia" class="ws-btn-success" style="width:100%;">🧠 Ensinar Frase</button>
                        </div>
                    </div>

                    <!-- CHAT DE TESTE -->
                    <div class="prof-card" style="border-top:4px solid #4F46E5; display:flex; flex-direction:column;">
                        <h3 style="margin:0 0 15px 0; color:#0F172A;">💬 Chat de Teste</h3>
                        
                        <div id="ig-ia-chat-history" style="flex:1; min-height:150px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:10px; overflow-y:auto; margin-bottom:10px; font-size:14px;">
                            <div style="text-align:center; color:#94A3B8; font-size:12px;">Escreva algo para testar as respostas da Ptt AI...</div>
                        </div>
                        
                        <div style="display:flex; gap:8px;">
                            <input id="ig-ia-chat-input" class="ig-input" placeholder="Diga algo à Ptt AI..." style="flex:1;">
                            <button data-action="falar-ia" class="ws-btn-primary">Enviar</button>
                        </div>
                    </div>

                </div>
            `;
        }
    }

};