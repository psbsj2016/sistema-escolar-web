// js/modulos/workspace/es3d-smartphone.js
// 📱 Etapa 6: Smartphone 3D In-Game (HUD Limpo + Apps da Cidade + Caderno de Vocabulário Vivo + Ranking ao Vivo)

const PHONE_CONFIG = {
  RECOMPENSA_REVISAO_DRX: 30, // DRX ao acertar revisão relâmpago do Caderno Vivo
  COOLDOWN_REVISAO_MS: 45000  // Intervalo mínimo entre recompensas de revisão (45s)
};

export class ES3DSmartphone {
  constructor(world) {
    this.world = world;
    this.open = false;
    this.currentApp = 'home'; // 'home' | 'dict' | 'rank'
    this.phoneEl = null;
    this.vocabList = []; // [{ word, zone, learnedAt }]
    this.lastReviewReward = 0;
    this._quizAtual = null;
  }

  init() {
    this.carregarVocabularioLocal();
    this.criarSmartphoneUI();
  }

  // ============================================================================
  // 1. 📖 CADERNO DE VOCABULÁRIO VIVO (SALVA TUDO QUE O ALUNO CLICA NA CIDADE)
  // ============================================================================
  obterChaveStorageVocab() {
    const uid = this.world?.localPlayer?.userId || window.Workspace?.usuario?.id || 'guest';
    return `es3d_live_dictionary_${uid}`;
  }

  carregarVocabularioLocal() {
    try {
      const salvo = JSON.parse(localStorage.getItem(this.obterChaveStorageVocab()) || '[]');
      this.vocabList = Array.isArray(salvo) ? salvo : [];
    } catch (e) {
      this.vocabList = [];
    }
  }

  salvarVocabularioLocal() {
    try {
      localStorage.setItem(this.obterChaveStorageVocab(), JSON.stringify(this.vocabList.slice(0, 120)));
    } catch (e) {}
  }

  registrarPalavra(palavra, zona = 'street') {
    const limpa = String(palavra || '').trim();
    if (!limpa || limpa.length < 2 || limpa.length > 65) return;
    // Ignora textos genéricos ou notas de usuários
    if (/^(object|sticky note|note by)/i.test(limpa)) return;

    const existe = this.vocabList.some(v => v.word.toLowerCase() === limpa.toLowerCase());
    if (!existe) {
      this.vocabList.unshift({
        word: limpa,
        zone: String(zona || 'street'),
        learnedAt: Date.now()
      });
      this.salvarVocabularioLocal();
      this.atualizarBadgeDicionario();
      if (this.open && this.currentApp === 'dict') {
        this.renderizarAppDicionario();
      }
    }
  }

  atualizarBadgeDicionario() {
    const el = document.getElementById('es-phone-dict-count');
    if (el) el.textContent = `${this.vocabList.length}`;
  }

  // ============================================================================
  // 2. 📱 INTERFACE DO SMARTPHONE IN-GAME (SUBSTITUI OS 14 BOTÕES DO TOPO)
  // ============================================================================
  criarSmartphoneUI() {
    document.getElementById('es-phone-shell')?.remove();
    const wrapper = document.getElementById('es-city-wrapper');
    if (!wrapper) return;

    const isFem = Boolean(this.world?.localPlayer?.isFemale);

    const shell = document.createElement('div');
    shell.id = 'es-phone-shell';
    shell.style.cssText = `
      display: none; position: absolute; right: 16px; top: 68px; z-index: 38;
      width: 292px; max-width: calc(100vw - 28px); max-height: calc(100dvh - 155px);
      background: linear-gradient(165deg, #0b1120 0%, #131b31 100%);
      border: 2.5px solid rgba(148, 163, 184, 0.35); border-radius: 28px;
      padding: 12px; flex-direction: column; gap: 10px; color: #f8fafc;
      box-shadow: 0 24px 60px rgba(0,0,0,0.72), inset 0 0 0 1px rgba(255,255,255,0.08);
      font-family: Inter, sans-serif; overflow: hidden;
    `;

    const tileStyle = `
      background: rgba(30, 41, 59, 0.92); border: 1px solid rgba(148, 163, 184, 0.22);
      border-radius: 14px; padding: 10px 6px; color: #f8fafc; font-size: 11px;
      font-weight: 800; cursor: pointer; display: flex; align-items: center;
      justify-content: center; text-align: center; min-height: 46px;
      transition: transform 0.14s ease, border-color 0.14s ease;
    `;

    shell.innerHTML = `
      <!-- Barra de status do celular -->
      <div style="display:flex; justify-content:space-between; align-items:center; padding: 0 4px;">
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size:11px; font-weight:900; color:#93c5fd;">📶 EnglishOS</span>
          <span id="es-phone-clock" style="font-size:11px; color:#94a3b8; font-weight:700;">12:00</span>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <button type="button" id="es-phone-back-btn" style="display:none; background:#1e293b; color:#93c5fd; border:1px solid #334155; border-radius:999px; padding:3px 9px; font-size:10.5px; font-weight:800; cursor:pointer;">← Apps</button>
          <button type="button" id="es-phone-close-btn" style="background:#1e293b; color:#cbd5e1; border:none; width:26px; height:26px; border-radius:50%; font-weight:800; cursor:pointer;">✕</button>
        </div>
      </div>

   <!-- Tela Inicial de Aplicativos (Mantém os IDs oficiais para 100% de compatibilidade!) -->
      <div id="es-phone-screen-home" style="overflow-y:auto; display:flex; flex-direction:column; gap:10px; padding-right:2px;">
        <div style="font-size:10.5px; font-weight:800; color:#fde047; text-transform:uppercase; letter-spacing:0.6px; padding:0 2px;">🎯 Fluência &amp; Missões</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:7px;">
          <button type="button" id="es-phone-app-delivery"  data-phone-autoclose="1" style="${tileStyle} border-color:rgba(245,158,11,0.5); background:rgba(245,158,11,0.14);">🛵 Delivery</button>
          <button type="button" id="es-phone-app-passport"  data-phone-autoclose="1" style="${tileStyle} border-color:rgba(168,85,247,0.5); background:rgba(168,85,247,0.15);">🛂 Passport</button>
          <button type="button" id="es-phone-app-housetour" data-phone-autoclose="1" style="${tileStyle} border-color:rgba(56,189,248,0.5); background:rgba(56,189,248,0.14);">🏡 House Tour</button>
          <button type="button" id="es-phone-app-flash"     data-phone-autoclose="1" style="${tileStyle} border-color:rgba(234,179,8,0.5); background:rgba(234,179,8,0.12);">⚡ Flash Quiz</button>
        </div>

        <div style="font-size:10.5px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.6px; padding:0 2px;">🧭 Explorar &amp; Jogar</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:7px;">
          <button type="button" id="es-city-gps-btn"      data-phone-autoclose="1" style="${tileStyle}">🗺️ GPS</button>
          <button type="button" id="es-city-quest-btn"    data-phone-autoclose="1" style="${tileStyle}">🎁 Quests 0/4</button>
          <button type="button" id="es-city-decorate-btn" data-phone-autoclose="1" style="${tileStyle}">🛋️ Decorate</button>
          <button type="button" id="es-city-gameshow-btn" data-phone-autoclose="1" style="${tileStyle}">🎤 Game Show</button>
          <button type="button" id="es-city-home-btn"     data-phone-autoclose="1" style="${tileStyle}">🏡 My Lot</button>
          <button type="button" id="es-city-bau-btn"      data-phone-autoclose="1" style="${tileStyle}">🧙‍♂️ Guild</button>
        </div>

        <div style="font-size:10.5px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.6px; padding:0 2px;">📚 Estudo &amp; Social</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:7px;">
          <button type="button" id="es-phone-app-dict" style="${tileStyle} border-color:rgba(16,185,129,0.45); background:rgba(16,185,129,0.14);">
            📖 Vocab (<span id="es-phone-dict-count">${this.vocabList.length}</span>)
          </button>
          <button type="button" id="es-phone-app-rank" style="${tileStyle} border-color:rgba(250,204,21,0.45); background:rgba(250,204,21,0.12);">
            🏆 Ranking
          </button>
          <button type="button" id="es-city-emote-btn" data-phone-autoclose="1" style="${tileStyle}">🎭 Emotes</button>
          <button type="button" id="es-city-photo-btn" data-phone-autoclose="1" style="${tileStyle}">📸 Photo</button>
        </div>

        <div style="font-size:10.5px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.6px; padding:0 2px;">⚙️ Ações Rápidas</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:7px;">
          <button type="button" id="es-city-vehicle-btn" style="${tileStyle}">🚲 Ride</button>
          <button type="button" id="es-city-weather-btn" style="${tileStyle}">☀️ Clear</button>
          <button type="button" id="es-city-audio3d-btn" style="${tileStyle}">🔊 3D SFX</button>
          <button type="button" id="es-city-gender-btn"  style="${tileStyle}">${isFem ? '👩 Female' : '🧑 Male'}</button>
        </div>
      </div>

      <!-- Tela Interna: App Caderno de Vocabulário Vivo -->
      <div id="es-phone-screen-dict" style="display:none; overflow-y:auto; flex-direction:column; gap:8px; padding-right:2px;"></div>

      <!-- Tela Interna: App Ranking da Escola -->
      <div id="es-phone-screen-rank" style="display:none; overflow-y:auto; flex-direction:column; gap:8px; padding-right:2px;"></div>
    `;

    wrapper.appendChild(shell);
    this.phoneEl = shell;

    shell.querySelector('#es-phone-close-btn')?.addEventListener('click', () => this.alternarTelefone(false));
    shell.querySelector('#es-phone-back-btn')?.addEventListener('click', () => this.abrirTela('home'));

    // Fecha o telefone ao abrir modais grandes para não tampar a visão 3D
    shell.querySelectorAll('[data-phone-autoclose="1"]').forEach(btn => {
      btn.addEventListener('click', () => {
        setTimeout(() => this.alternarTelefone(false), 60);
      });
    });

    shell.querySelector('#es-phone-app-dict')?.addEventListener('click', () => {
      this.world.garantirAudioAtivo?.();
      this.abrirTela('dict');
    });

    shell.querySelector('#es-phone-app-rank')?.addEventListener('click', () => {
      this.world.garantirAudioAtivo?.();
      this.abrirTela('rank');
    });

    shell.querySelector('#es-phone-app-delivery')?.addEventListener('click', () => {
      this.world.garantirAudioAtivo?.();
      this.world.fluenciaPro?.iniciarMissaoEntrega();
    });

    shell.querySelector('#es-phone-app-passport')?.addEventListener('click', () => {
      this.world.garantirAudioAtivo?.();
      this.world.fluenciaPro?.abrirModalPassaporte();
    });

    shell.querySelector('#es-phone-app-housetour')?.addEventListener('click', () => {
      this.world.garantirAudioAtivo?.();
      this.world.fluenciaPro?.iniciarDesafioHouseTour();
    });

    shell.querySelector('#es-phone-app-flash')?.addEventListener('click', () => {
      this.world.garantirAudioAtivo?.();
      this.world.fluenciaPro?.dispararEventoRelampago();
    });

    this.atualizarRelogio();
  }

  atualizarRelogio() {
    const el = this.phoneEl?.querySelector('#es-phone-clock');
    if (!el) return;
    const agora = new Date();
    el.textContent = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  alternarTelefone(forcar = null) {
    if (!this.phoneEl) return;
    this.open = forcar !== null ? Boolean(forcar) : !this.open;
    this.phoneEl.style.display = this.open ? 'flex' : 'none';

    const btn = document.getElementById('es-city-phone-btn');
    if (btn) btn.innerHTML = this.open ? '📱 Fechar' : '📱 Phone';

    if (this.open) {
      this.atualizarRelogio();
      this.abrirTela('home');
    }
  }

  abrirTela(app) {
    this.currentApp = app;
    if (!this.phoneEl) return;

    const home = this.phoneEl.querySelector('#es-phone-screen-home');
    const dict = this.phoneEl.querySelector('#es-phone-screen-dict');
    const rank = this.phoneEl.querySelector('#es-phone-screen-rank');
    const back = this.phoneEl.querySelector('#es-phone-back-btn');

    if (home) home.style.display = app === 'home' ? 'flex' : 'none';
    if (dict) dict.style.display = app === 'dict' ? 'flex' : 'none';
    if (rank) rank.style.display = app === 'rank' ? 'flex' : 'none';
    if (back) back.style.display = app === 'home' ? 'none' : 'inline-flex';

    if (app === 'dict') this.renderizarAppDicionario();
    if (app === 'rank') this.renderizarAppRanking();
  }

  // ============================================================================
  // 3. ⚡ APP CADERNO VIVO + REVISÃO RELÂMPAGO POR ESCUTA (LISTENING)
  // ============================================================================
  renderizarAppDicionario() {
    const box = this.phoneEl?.querySelector('#es-phone-screen-dict');
    if (!box) return;

    if (this.vocabList.length === 0) {
      box.innerHTML = `
        <div style="text-align:center; padding:24px 10px; background:rgba(30,41,59,0.6); border:1px dashed #475569; border-radius:14px; color:#94a3b8; font-size:12px; line-height:1.5;">
          📖 <b>Seu Caderno Vivo está vazio!</b><br><br>
          Clique em objetos, móveis, placas e itens das lojas na Cidade 3D para colecionar palavras em inglês aqui.
        </div>
      `;
      return;
    }

    const podeQuiz = this.vocabList.length >= 3;
    box.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:12px; font-weight:900; color:#6ee7b7;">📖 ${this.vocabList.length} palavras descobertas</span>
        ${podeQuiz ? `<button type="button" id="es-dict-quiz-btn" style="background:linear-gradient(135deg,#10b981,#059669); color:#fff; border:none; border-radius:999px; padding:5px 10px; font-size:10.5px; font-weight:900; cursor:pointer;">⚡ Revisar (+${PHONE_CONFIG.RECOMPENSA_REVISAO_DRX} DRX)</button>` : ''}
      </div>
      <div id="es-dict-quiz-slot"></div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        ${this.vocabList.slice(0, 40).map((item, idx) => `
          <div style="background:#1e293b; border:1px solid #334155; border-radius:11px; padding:8px 10px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
            <div style="min-width:0;">
              <div style="font-size:12px; font-weight:800; color:#f8fafc; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.word}</div>
              <div style="font-size:10px; color:#94a3b8; text-transform:uppercase;">📍 ${item.zone}</div>
            </div>
            <button type="button" data-say-idx="${idx}" style="background:rgba(56,189,248,0.18); color:#7dd3fc; border:1px solid rgba(56,189,248,0.35); border-radius:8px; padding:5px 8px; font-size:12px; cursor:pointer; flex-shrink:0;">🔊</button>
          </div>
        `).join('')}
      </div>
    `;

    box.querySelectorAll('[data-say-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        const it = this.vocabList[parseInt(btn.dataset.sayIdx, 10)];
        if (it) this.world.falarTextoNPC?.(it.word, it.zone);
      });
    });

    box.querySelector('#es-dict-quiz-btn')?.addEventListener('click', () => this.iniciarRevisaoRelampago());
  }

  iniciarRevisaoRelampago() {
    const slot = this.phoneEl?.querySelector('#es-dict-quiz-slot');
    if (!slot || this.vocabList.length < 3) return;

    const pool = [...this.vocabList].sort(() => Math.random() - 0.5).slice(0, 3);
    const correta = pool[Math.floor(Math.random() * pool.length)];
    this.world.falarTextoNPC?.(correta.word, correta.zone);

    slot.innerHTML = `
      <div style="background:rgba(37,99,235,0.16); border:1px solid #3b82f6; border-radius:12px; padding:10px; display:flex; flex-direction:column; gap:7px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:11px; font-weight:900; color:#93c5fd;">🎧 Ouça e escolha a palavra:</span>
          <button type="button" id="es-dict-replay" style="background:#1e293b; color:#fff; border:none; border-radius:8px; padding:4px 8px; font-size:11px; cursor:pointer;">🔊 Ouvir</button>
        </div>
        ${pool.map((opt, i) => `
          <button type="button" data-dict-opt="${i}" style="background:#0f172a; border:1px solid #334155; color:#fff; border-radius:9px; padding:8px; font-size:11.5px; font-weight:700; cursor:pointer; text-align:left;">
            ${opt.word}
          </button>
        `).join('')}
      </div>
    `;

    slot.querySelector('#es-dict-replay')?.addEventListener('click', () => {
      this.world.falarTextoNPC?.(correta.word, correta.zone);
    });

    slot.querySelectorAll('[data-dict-opt]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const escolha = pool[parseInt(btn.dataset.dictOpt, 10)];
        if (escolha && escolha.word === correta.word) {
          const agora = Date.now();
          if (agora - this.lastReviewReward > PHONE_CONFIG.COOLDOWN_REVISAO_MS) {
            this.lastReviewReward = agora;
            await window.DOVRYX?.add(PHONE_CONFIG.RECOMPENSA_REVISAO_DRX, 'Vocabulary Review 📖');
          } else if (window.Workspace?.mostrarAviso) {
            window.Workspace.mostrarAviso(`✅ Correto: "${correta.word}"!`, 'success', 2200);
          }
          this.world.falarTextoNPC?.('Correct! Great listening!', 'street');
          slot.innerHTML = '';
        } else {
          btn.style.borderColor = '#ef4444';
          btn.style.color = '#fca5a5';
          this.world.falarTextoNPC?.(correta.word, correta.zone);
        }
      });
    });
  }

  // ============================================================================
  // 4. 🏆 APP RANKING DA ESCOLA AO VIVO
  // ============================================================================
  async renderizarAppRanking() {
    const box = this.phoneEl?.querySelector('#es-phone-screen-rank');
    if (!box) return;

    box.innerHTML = `<div style="text-align:center; padding:24px; color:#94a3b8; font-size:12px;">⏳ Carregando ranking da escola...</div>`;

    try {
      const escolaId = window.Workspace?.usuario?.escolaId || 'DEFAULT';
      const res = await window.Workspace?.api?.(`/workspace/ingles/ranking?escolaId=${encodeURIComponent(escolaId)}`, 'GET');
      const lista = (res && res.success && Array.isArray(res.ranking)) ? res.ranking.slice(0, 15) : [];

      if (lista.length === 0) {
        box.innerHTML = `<div style="text-align:center; padding:24px; color:#94a3b8; font-size:12px;">Nenhum aluno pontuado ainda.</div>`;
        return;
      }

      const meuId = String(this.world?.localPlayer?.userId || '');
      const medalhas = ['🥇', '🥈', '🥉'];

      box.innerHTML = `
        <div style="font-size:12px; font-weight:900; color:#fde047;">🏆 Top Citizens (DOVRYX DRX)</div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          ${lista.map((r, i) => {
            const souEu = String(r.userId || '') === meuId;
            const drx = Number(r.coins?.bronze) || 0;
            const nome = this.world.formatarNomeCompleto?.(r.nome || 'Student') || r.nome || 'Student';
            return `
              <div style="background:${souEu ? 'rgba(59,130,246,0.22)' : '#1e293b'}; border:1px solid ${souEu ? '#60a5fa' : '#334155'}; border-radius:11px; padding:8px 10px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
                <div style="display:flex; align-items:center; gap:7px; min-width:0;">
                  <span style="font-size:14px; font-weight:900; width:22px; text-align:center;">${medalhas[i] || `#${i + 1}`}</span>
                  <span style="font-size:12px; font-weight:800; color:#f8fafc; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${nome}</span>
                </div>
                <span style="font-size:11.5px; font-weight:900; color:#fde047; white-space:nowrap;">💎 ${drx.toLocaleString('pt-BR')}</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } catch (e) {
      box.innerHTML = `<div style="text-align:center; padding:20px; color:#f87171; font-size:12px;">Não foi possível carregar o ranking agora.</div>`;
    }
  }

  dispose() {
    this.phoneEl?.remove();
    this.phoneEl = null;
    this.open = false;
  }
}