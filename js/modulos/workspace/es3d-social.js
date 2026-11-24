// js/modulos/workspace/es3d-social.js
// 🎤🏘️⚔️ Etapa 8: Game Show Multiplayer + Casas Decoradas no MongoDB (Visitas & Curtidas) + Duelo 1v1 na Rua

// ⚙️ PARÂMETROS AJUSTÁVEIS
const SOCIAL_CONFIG = {
  PREMIO_VITORIA_DUELO_DRX: 60,     // DRX para o vencedor do duelo 1v1
  PREMIO_EMPATE_DUELO_DRX: 25,      // DRX em caso de empate no duelo
  PREMIO_PARTICIPACAO_DUELO_DRX: 15,// DRX para quem participou do duelo
  TEMPO_PERGUNTA_DUELO_SEG: 12,     // Segundos por pergunta no duelo 1v1
  DEBOUNCE_SYNC_MOVEIS_MS: 1200,    // Espera (ms) antes de gravar móveis no MongoDB
  DIST_PORTA_VIZINHO: 2.9           // Distância para abrir a porta da casa de um colega
};

export class ES3DSocial {
  constructor(world) {
    this.world = world;
    this.THREE = window.THREE;

    // 1. Casas da Nuvem & Vizinhos
    this.communityHouses = []; // [{ userId, ownerName, stage, furniture, likes }]
    this.neighborFurnitureGroup = null;
    this.neighborDoors = [];   // [{ lotIndex, lotX, lotZ, mesh, openRatio }]
    this._syncFurnitureTimer = null;
    this._suspendCloudSync = false;
    this.currentVisitedHouse = null;

    // 2. Game Show Multiplayer
    this.activeRoundId = null;
    this.currentPodium = [];

    // 3. Duelo 1v1 na Rua
    this.activeDuel = null; // { duelId, opponentId, opponentName, questions, idx, myScore, oppScore, finished, oppFinished, timer }
    this.pendingChallenge = null;

    // UI Flutuante
    this.duelBtnEl = null;
    this.likeHouseBtnEl = null;
  }

  obterEscolaId() {
    return String(window.Workspace?.usuario?.escolaId || 'DEFAULT').trim();
  }

  obterMeuId() {
    return String(this.world?.localPlayer?.userId || window.Workspace?.usuario?.id || 'guest').trim();
  }

  ehProfessor() {
    const tipo = String(window.Workspace?.usuario?.tipo || '').trim();
    return tipo === 'Professor' || tipo === 'Gestor';
  }

  init() {
    if (!this.THREE || !this.world?.scene) return;
    this.neighborFurnitureGroup = new this.THREE.Group();
    this.neighborFurnitureGroup.name = 'NeighborFurnitureGroup';
    this.world.exteriorGroup?.add(this.neighborFurnitureGroup);

    this.criarBotoesContextuaisUI();
    this.carregarCasasDaNuvem();
  }

  criarBotoesContextuaisUI() {
    document.getElementById('es-social-duel-btn')?.remove();
    document.getElementById('es-social-like-house-btn')?.remove();
    const proxWrap = document.querySelector('.es-ref-proximity-wrap');
    if (!proxWrap) return;

    const duelBtn = document.createElement('button');
    duelBtn.id = 'es-social-duel-btn';
    duelBtn.type = 'button';
    duelBtn.style.cssText = `
      display: none; pointer-events: auto;
      background: linear-gradient(135deg, #f59e0b, #dc2626); color: #fff;
      border: none; padding: 6px 14px; border-radius: 999px;
      font-size: 11.5px; font-weight: 900; cursor: pointer;
      box-shadow: 0 6px 16px rgba(239,68,68,0.4);
    `;
    duelBtn.addEventListener('click', () => {
      this.world.garantirAudioAtivo?.();
      const alvo = this.world.nearbyTargets?.find(t => t.type === 'player');
      if (alvo) this.desafiarColegaParaDuelo(alvo.id, alvo.name);
    });
    proxWrap.appendChild(duelBtn);
    this.duelBtnEl = duelBtn;

    const likeBtn = document.createElement('button');
    likeBtn.id = 'es-social-like-house-btn';
    likeBtn.type = 'button';
    likeBtn.style.cssText = `
      display: none; pointer-events: auto;
      background: linear-gradient(135deg, #ec4899, #be185d); color: #fff;
      border: none; padding: 6px 14px; border-radius: 999px;
      font-size: 11.5px; font-weight: 900; cursor: pointer;
      box-shadow: 0 6px 16px rgba(236,72,153,0.4);
    `;
    likeBtn.addEventListener('click', () => {
      this.world.garantirAudioAtivo?.();
      if (this.currentVisitedHouse) this.curtirCasaVizinho(this.currentVisitedHouse);
    });
    proxWrap.appendChild(likeBtn);
    this.likeHouseBtnEl = likeBtn;
  }

  // ============================================================================
  // 1. 🏘️ CASAS DECORADAS NO MONGODB + VISITAS & CURTIDAS
  // ============================================================================
  agendarSyncMoveisNuvem() {
    if (this._suspendCloudSync) return;
    clearTimeout(this._syncFurnitureTimer);
    this._syncFurnitureTimer = setTimeout(() => {
      this.salvarMoveisNaNuvem();
    }, SOCIAL_CONFIG.DEBOUNCE_SYNC_MOVEIS_MS);
  }

  async salvarMoveisNaNuvem() {
    const builder = this.world?.gameShowBuilder;
    const p = this.world?.localPlayer;
    if (!builder || !p || !p.userId) return;

    const customFurniture = (builder.placedItems || []).map(it => ({
      uid: it.uid,
      typeId: it.typeId,
      zoneKey: it.zoneKey,
      x: Math.round(it.x * 100) / 100,
      y: Math.round((it.y || 0) * 100) / 100,
      z: Math.round(it.z * 100) / 100,
      rotY: Math.round((it.rotY || 0) * 100) / 100
    }));

    const furnitureStorage = Array.isArray(builder.storageItems) ? builder.storageItems : [];

    try {
      await fetch('/api/workspace/english-spaces/progress/furniture', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: p.userId,
          ownerName: p.nome,
          escolaId: this.obterEscolaId(),
          customFurniture,
          furnitureStorage
        })
      });
    } catch (e) {}
  }

  async carregarCasasDaNuvem() {
    const meuId = this.obterMeuId();
    try {
      const res = await fetch(
        `/api/workspace/english-spaces/world/houses?escolaId=${encodeURIComponent(this.obterEscolaId())}&userId=${encodeURIComponent(meuId)}`,
        { credentials: 'include' }
      ).then(r => r.json()).catch(() => null);

      if (!res || !res.success) return;

      // 1. Hidrata os móveis da própria conta vindos da nuvem caso o aparelho atual esteja sem eles
      const builder = this.world?.gameShowBuilder;
      if (builder && res.myHouse) {
        const cloudPlaced = Array.isArray(res.myHouse.furniture) ? res.myHouse.furniture : [];
        const cloudStored = Array.isArray(res.myHouse.storage) ? res.myHouse.storage : [];

        if (builder.placedItems.length === 0 && cloudPlaced.length > 0) {
          this._suspendCloudSync = true;
          cloudPlaced.forEach(item => builder.instanciarMovelNaCena(item, false));
          builder.salvarMoveisLocal();
          this._suspendCloudSync = false;
        } else if (builder.placedItems.length > 0 && cloudPlaced.length === 0) {
          // Migra automaticamente móveis locais antigos para o MongoDB!
          this.salvarMoveisNaNuvem();
        }

        if (builder.storageItems.length === 0 && cloudStored.length > 0) {
          this._suspendCloudSync = true;
          builder.storageItems = cloudStored;
          builder.salvarDepositoLocal();
          this._suspendCloudSync = false;
        }
      }

      // 2. Organiza os 7 vizinhos nos Lotes #1 até #7 (deixando o Lote #0 sempre como a casa do jogador!)
      const lista = Array.isArray(res.houses) ? res.houses : [];
      const vizinhos = lista.filter(h => String(h.userId) !== meuId).slice(0, 7);
      this.communityHouses = vizinhos;

      const meuResumo = {
        userId: meuId,
        ownerName: this.world.localPlayer?.nome || 'You',
        stage: this.world.houseStage || 1
      };
      this.world.communityLots = [meuResumo, ...vizinhos];
      this.world.criarLoteamentoResidencial?.();

      this.mapearPortasVizinhos();
      this.renderizarMoveisDosVizinhos();
    } catch (e) {}
  }

  mapearPortasVizinhos() {
    this.neighborDoors = [];
    if (!Array.isArray(this.world?.lotes)) return;

    for (let i = 1; i < this.world.lotes.length; i++) {
      const lotGrp = this.world.lotes[i];
      if (!lotGrp) continue;
      const col = (i % 4) - 1.5;
      const row = Math.floor(i / 4);
      const lotX = col * 18;
      const lotZ = 34 + row * 18;

      lotGrp.children.forEach(ch => {
        if (ch.isMesh && Math.abs(ch.position.x) < 0.05 && Math.abs(ch.position.y - 1.3) < 0.1 && Math.abs(ch.position.z + 3.48) < 0.15) {
          this.neighborDoors.push({ lotIndex: i, lotX, lotZ, mesh: ch, openRatio: 0 });
        }
      });
    }
  }

  renderizarMoveisDosVizinhos() {
    const builder = this.world?.gameShowBuilder;
    if (!this.neighborFurnitureGroup || !builder) return;

    // Limpa móveis antigos dos vizinhos
    while (this.neighborFurnitureGroup.children.length > 0) {
      const child = this.neighborFurnitureGroup.children[0];
      this.neighborFurnitureGroup.remove(child);
      builder.descartarMeshMovel?.(child);
    }

    this.communityHouses.forEach((house, idx) => {
      const lotIndex = idx + 1;
      if (lotIndex >= 8) return;
      const col = (lotIndex % 4) - 1.5;
      const row = Math.floor(lotIndex / 4);
      const lotX = col * 18;
      const lotZ = 34 + row * 18;

      const offsetX = lotX + 27; // Lote 0 tem centro em x = -27
      const offsetZ = lotZ - 34; // Lote 0 tem centro em z = 34

      const itensCasa = (house.furniture || []).filter(it => it && it.zoneKey === 'lot_0');
      itensCasa.forEach(it => {
        const mesh = builder.criarMeshMovel3D(it.typeId);
        mesh.position.set(it.x + offsetX, it.y || 0.35, it.z + offsetZ);
        mesh.rotation.y = it.rotY || 0;
        this.neighborFurnitureGroup.add(mesh);
      });
    });
  }

  abrirModalVisitarVizinhos() {
    document.getElementById('es-neighbors-modal')?.remove();
    const meuId = this.obterMeuId();

    const html = `
      <div id="es-neighbors-modal" style="position:fixed; inset:0; z-index:1000255; background:rgba(5,7,14,0.84); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; padding:16px; font-family:Inter,sans-serif;">
        <div style="background:linear-gradient(155deg,#0f172a,#1e1b4b); border:2px solid #10b981; border-radius:22px; padding:20px; width:100%; max-width:500px; max-height:82dvh; display:flex; flex-direction:column; gap:12px; color:#fff; box-shadow:0 25px 70px rgba(0,0,0,0.8);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <h3 style="margin:0; font-size:18px; color:#6ee7b7;">🏘️ Casas dos Colegas (Nuvem)</h3>
              <div style="font-size:11.5px; color:#94a3b8; margin-top:2px;">Visite a casa mobiliada dos amigos e curta a decoração!</div>
            </div>
            <button type="button" id="es-neigh-close" style="background:#1e293b; color:#cbd5e1; border:none; width:34px; height:34px; border-radius:50%; font-weight:800; cursor:pointer;">✕</button>
          </div>

          <div style="overflow-y:auto; display:flex; flex-direction:column; gap:8px; padding-right:2px;">
            ${this.communityHouses.length === 0 ? `
              <div style="text-align:center; padding:28px 12px; color:#94a3b8; font-size:13px;">
                🏡 Ainda não há casas de outros colegas registradas.<br>Quando seus amigos decorarem a casa deles, aparecerão aqui!
              </div>
            ` : this.communityHouses.map((h, idx) => {
              const lotNum = idx + 2;
              const qtdMoveis = (h.furniture || []).filter(it => it.zoneKey === 'lot_0').length;
              const likes = Array.isArray(h.likes) ? h.likes : [];
              const jaCurti = likes.includes(meuId);
              const nome = this.world.formatarNomeCompleto?.(h.ownerName || 'Student') || h.ownerName;
              return `
                <div style="background:#1e293b; border:1px solid #334155; border-radius:14px; padding:12px; display:flex; justify-content:space-between; align-items:center; gap:10px;">
                  <div style="min-width:0;">
                    <div style="font-size:13.5px; font-weight:800; color:#f8fafc;">🏡 Lot #${lotNum} — ${nome}</div>
                    <div style="font-size:11px; color:#94a3b8; margin-top:2px;">
                      Stage ${h.stage || 1}/5 • 🛋️ ${qtdMoveis} móveis • ${jaCurti ? '❤️' : '🤍'} ${likes.length} curtidas
                    </div>
                  </div>
                  <button type="button" data-visit-idx="${idx}" style="background:linear-gradient(135deg,#10b981,#059669); color:#fff; border:none; border-radius:999px; padding:8px 14px; font-size:11.5px; font-weight:900; cursor:pointer; white-space:nowrap;">Visitar →</button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    document.getElementById('es-neigh-close')?.addEventListener('click', () => document.getElementById('es-neighbors-modal')?.remove());
    document.getElementById('es-neighbors-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'es-neighbors-modal') e.target.remove();
    });

    document.querySelectorAll('[data-visit-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.visitIdx, 10);
        document.getElementById('es-neighbors-modal')?.remove();
        this.visitarCasaVizinho(idx);
      });
    });
  }

  visitarCasaVizinho(idx) {
    const house = this.communityHouses[idx];
    const p = this.world?.localPlayer;
    if (!house || !p) return;

    const lotIndex = idx + 1;
    const col = (lotIndex % 4) - 1.5;
    const row = Math.floor(lotIndex / 4);
    const lotX = col * 18;
    const lotZ = 34 + row * 18;

    this.world.sairDeQualquerAmbienteFechado?.();
    p.x = lotX;
    p.z = lotZ - 4.8;
    p.y = 0;
    p.rotY = 0;
    p.targetX = null;
    p.targetZ = null;
    this.world.cameraYaw = Math.PI;
    this.world.enviarMinhaPosicaoServidor?.();

    const nome = this.world.formatarNomeCompleto?.(house.ownerName || 'Student') || house.ownerName;
    window.Workspace?.mostrarAviso?.(`🏡 Visitando a casa de ${nome}! Aproxime-se da porta para entrar.`, 'success', 3400);
  }

  async curtirCasaVizinho(house) {
    if (!house || !house.userId) return;
    const meuId = this.obterMeuId();
    try {
      const res = await fetch('/api/workspace/english-spaces/world/houses/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ownerUserId: house.userId,
          likerId: meuId,
          likerName: this.world.localPlayer?.nome || 'Student',
          escolaId: this.obterEscolaId()
        })
      }).then(r => r.json()).catch(() => null);

      if (res && res.success && Array.isArray(res.likes)) {
        house.likes = res.likes;
        const curtiu = res.likes.includes(meuId);
        window.Workspace?.mostrarAviso?.(
          curtiu ? `❤️ Você curtiu a casa de ${house.ownerName}!` : `🤍 Curtida removida.`,
          'info',
          2400
        );
      }
    } catch (e) {}
  }

  // ============================================================================
  // 2. 🎤 GAME SHOW MULTIPLAYER SINCRONIZADO + PERGUNTA DO PROFESSOR + PÓDIO
  // ============================================================================
  async dispararRodadaGameShowMultiplayer(perguntaCustom = null) {
    const p = this.world?.localPlayer;
    if (!p) return;

    try {
      const res = await fetch('/api/workspace/english-spaces/world/gameshow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'START',
          escolaId: this.obterEscolaId(),
          hostId: p.userId,
          hostName: p.nome,
          customQuestion: perguntaCustom || null
        })
      }).then(r => r.json()).catch(() => null);

      if (res && res.success && res.round) {
        this.aplicarRodadaGameShowSincronizada(res.round);
      }
    } catch (e) {
      // Fallback local se offline
      const b = this.world?.gameShowBuilder;
      if (b) {
        b._fromSocialSync = true;
        b.iniciarRodadaGameShow();
        b._fromSocialSync = false;
      }
    }
  }

  aplicarRodadaGameShowSincronizada(round) {
    const builder = this.world?.gameShowBuilder;
    if (!builder || !round || !round.question) return;
    if (this.activeRoundId === round.roundId && builder.gsRunning) return;

    this.activeRoundId = round.roundId;
    builder.gsCurrentQ = round.question;
    builder.gsTimer = Number(round.duration) || 12;
    builder.gsRunning = true;

    Object.values(builder.gsPads || {}).forEach(pad => {
      pad.mat.color.setHex(pad.baseColor);
      pad.mat.emissive.setHex(pad.baseColor);
      pad.mat.emissiveIntensity = 0.55;
    });

    builder.desenharTelaoPergunta();

    // Só fala em voz alta se o jogador estiver perto da Praça Central (ou for quem iniciou)
    const p = this.world?.localPlayer;
    const distArena = p ? Math.hypot(p.x - 18, p.z - (-115)) : 999;
    if (distArena < 28 && !this.world.modoInterior && !this.world.torreAtual) {
      this.world.falarTextoNPC?.(round.question.q, 'street');
      window.Workspace?.mostrarAviso?.(`🎤 Live Game Show (${round.hostName})! Corra para A, B ou C!`, 'info', 3400);
    }
  }

  async registrarRespostaGameShow(escolha, correta) {
    const p = this.world?.localPlayer;
    if (!p || !this.activeRoundId) return;

    const distArena = Math.hypot(p.x - 18, p.z - (-115));
    if (distArena > 22 || this.world.modoInterior || this.world.torreAtual) return;

    try {
      const res = await fetch('/api/workspace/english-spaces/world/gameshow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'SUBMIT',
          escolaId: this.obterEscolaId(),
          roundId: this.activeRoundId,
          userId: p.userId,
          nome: p.nome,
          acertou: Boolean(escolha && escolha === correta)
        })
      }).then(r => r.json()).catch(() => null);

      if (res && res.success && Array.isArray(res.podium)) {
        this.desenharPodioNoTelao(correta, res.podium);
      }
    } catch (e) {}
  }

  desenharPodioNoTelao(correta, podium) {
    const builder = this.world?.gameShowBuilder;
    if (!builder?.gsScreenCtx || !Array.isArray(podium) || podium.length === 0) return;

    this.currentPodium = podium;
    const ctx = builder.gsScreenCtx;

    ctx.fillStyle = '#090d1e';
    ctx.fillRect(0, 0, 1024, 460);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, 1010, 446);

    ctx.fillStyle = '#34d399';
    ctx.font = '900 40px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🏆 LIVE PODIUM • Correct Answer: ${correta}`, 512, 74);

    const medalhas = ['🥇', '🥈', '🥉'];
    const cores = ['#fde047', '#e2e8f0', '#fdba74'];
    podium.slice(0, 3).forEach((entry, i) => {
      const y = 152 + i * 86;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.92)';
      ctx.fillRect(110, y - 42, 804, 66);
      ctx.strokeStyle = cores[i];
      ctx.lineWidth = 3;
      ctx.strokeRect(110, y - 42, 804, 66);

      ctx.fillStyle = cores[i];
      ctx.font = '900 30px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${medalhas[i]}  ${entry.nome}`, 140, y);

      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'right';
      ctx.fillText(`${entry.pts} pts`, 884, y);
    });

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Click the screen to start the next multiplayer round!', 512, 424);

    builder.gsScreenTex.needsUpdate = true;
  }

  abrirModalPerguntaProfessorGameShow() {
    if (!this.ehProfessor()) return;
    document.getElementById('es-gs-prof-modal')?.remove();

    const html = `
      <div id="es-gs-prof-modal" style="position:fixed; inset:0; z-index:1000260; background:rgba(5,7,14,0.85); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; padding:16px; font-family:Inter,sans-serif;">
        <div style="background:#0f172a; border:2px solid #a855f7; border-radius:22px; padding:22px; width:100%; max-width:450px; color:#fff; box-shadow:0 25px 70px rgba(0,0,0,0.8);">
          <h3 style="margin:0 0 6px; color:#e9d5ff; font-size:18px;">🎓 Pergunta Ao Vivo no Telão 3D</h3>
          <p style="margin:0 0 12px; color:#94a3b8; font-size:12px;">A pergunta aparecerá ao vivo no telão da Praça Central para toda a turma!</p>
          <input id="es-gsp-q" placeholder="Pergunta em inglês (Ex: Past tense of GO?)" style="width:100%; padding:10px; border-radius:10px; border:1px solid #334155; background:#1e293b; color:#fff; font-size:13px; margin-bottom:8px; box-sizing:border-box;" />
          <input id="es-gsp-a" placeholder="Opção A" style="width:100%; padding:9px; border-radius:10px; border:1px solid #1d4ed8; background:#1e293b; color:#fff; font-size:12.5px; margin-bottom:6px; box-sizing:border-box;" />
          <input id="es-gsp-b" placeholder="Opção B" style="width:100%; padding:9px; border-radius:10px; border:1px solid #7e22ce; background:#1e293b; color:#fff; font-size:12.5px; margin-bottom:6px; box-sizing:border-box;" />
          <input id="es-gsp-c" placeholder="Opção C" style="width:100%; padding:9px; border-radius:10px; border:1px solid #047857; background:#1e293b; color:#fff; font-size:12.5px; margin-bottom:10px; box-sizing:border-box;" />
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px;">
            <span style="font-size:12px; font-weight:800; color:#cbd5e1;">Resposta Certa:</span>
            <select id="es-gsp-correct" style="flex:1; padding:8px; border-radius:9px; background:#1e293b; color:#fde047; border:1px solid #475569; font-weight:900;">
              <option value="A">Plataforma A</option>
              <option value="B">Plataforma B</option>
              <option value="C">Plataforma C</option>
            </select>
          </div>
          <div style="display:flex; gap:8px;">
            <button type="button" id="es-gsp-cancel" style="flex:1; padding:11px; background:#334155; color:#cbd5e1; border:none; border-radius:11px; font-weight:700; cursor:pointer;">Cancelar</button>
            <button type="button" id="es-gsp-launch" style="flex:1.5; padding:11px; background:linear-gradient(135deg,#8b5cf6,#ec4899); color:#fff; border:none; border-radius:11px; font-weight:900; cursor:pointer;">🚀 Lançar no Telão!</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    document.getElementById('es-gsp-cancel')?.addEventListener('click', () => document.getElementById('es-gs-prof-modal')?.remove());
    document.getElementById('es-gsp-launch')?.addEventListener('click', () => {
      const q = (document.getElementById('es-gsp-q')?.value || '').trim();
      const a = (document.getElementById('es-gsp-a')?.value || '').trim();
      const b = (document.getElementById('es-gsp-b')?.value || '').trim();
      const c = (document.getElementById('es-gsp-c')?.value || '').trim();
      const correct = document.getElementById('es-gsp-correct')?.value || 'A';

      if (!q || !a || !b || !c) {
        window.Workspace?.mostrarAviso?.('Preencha a pergunta e as 3 opções A, B e C!', 'warning', 2600);
        return;
      }

      document.getElementById('es-gs-prof-modal')?.remove();
      this.world.gameShowBuilder?.irParaGameShowEIniciar?.();
      this.dispararRodadaGameShowMultiplayer({ q, a, b, c, correct });
    });
  }

  // ============================================================================
  // 3. ⚔️ DUELO RÁPIDO 1v1 NA RUA (STREET QUIZ DUEL VIA SSE)
  // ============================================================================
  async desafiarColegaParaDuelo(targetId, targetName) {
    if (this.activeDuel) return;
    const p = this.world?.localPlayer;
    if (!p) return;

    window.Workspace?.mostrarAviso?.(`⚔️ Convite de duelo enviado para ${targetName}! Aguardando resposta...`, 'info', 3500);
    try {
      await fetch('/api/workspace/english-spaces/world/duel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'CHALLENGE',
          escolaId: this.obterEscolaId(),
          challengerId: p.userId,
          challengerName: p.nome,
          targetId,
          targetName
        })
      });
    } catch (e) {}
  }

  mostrarConviteDueloRecebido(data) {
    if (this.activeDuel) return;
    document.getElementById('es-duel-invite-modal')?.remove();

    const html = `
      <div id="es-duel-invite-modal" style="position:fixed; inset:0; z-index:1000265; background:rgba(5,7,14,0.82); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; padding:16px; font-family:Inter,sans-serif;">
        <div style="background:linear-gradient(145deg,#1e1b4b,#0f172a); border:2px solid #f59e0b; border-radius:22px; padding:24px; max-width:380px; width:100%; text-align:center; color:#fff; box-shadow:0 25px 70px rgba(0,0,0,0.8);">
          <div style="font-size:48px;">⚔️</div>
          <h3 style="margin:6px 0; color:#fde047; font-size:19px;">Street Quiz Duel!</h3>
          <p style="color:#cbd5e1; font-size:13.5px; margin:0 0 16px;">
            <b>${data.challengerName}</b> desafiou você para uma melhor de 3 perguntas em inglês!<br>
            <span style="color:#34d399; font-weight:800;">🏆 Prêmio: +${SOCIAL_CONFIG.PREMIO_VITORIA_DUELO_DRX} DRX</span>
          </p>
          <div style="display:flex; gap:10px;">
            <button type="button" id="es-duel-decline" style="flex:1; padding:11px; background:#334155; color:#cbd5e1; border:none; border-radius:12px; font-weight:700; cursor:pointer;">Recusar</button>
            <button type="button" id="es-duel-accept" style="flex:1.4; padding:11px; background:linear-gradient(135deg,#f59e0b,#dc2626); color:#fff; border:none; border-radius:12px; font-weight:900; cursor:pointer;">⚔️ Aceitar!</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    const responder = async (action) => {
      document.getElementById('es-duel-invite-modal')?.remove();
      await fetch('/api/workspace/english-spaces/world/duel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action,
          escolaId: this.obterEscolaId(),
          duelId: data.duelId,
          challengerId: data.challengerId,
          challengerName: data.challengerName,
          targetId: this.obterMeuId(),
          targetName: this.world.localPlayer?.nome || 'Student'
        })
      }).catch(() => {});
    };

    document.getElementById('es-duel-decline')?.addEventListener('click', () => responder('DECLINE'));
    document.getElementById('es-duel-accept')?.addEventListener('click', () => responder('ACCEPT'));
  }

  iniciarDueloLocal(data) {
    const meuId = this.obterMeuId();
    const souDesafiante = String(data.challengerId) === meuId;
    const opponentId = souDesafiante ? data.targetId : data.challengerId;
    const opponentName = souDesafiante ? data.targetName : data.challengerName;

    this.activeDuel = {
      duelId: data.duelId,
      opponentId,
      opponentName,
      questions: Array.isArray(data.questions) ? data.questions : [],
      idx: 0,
      myScore: 0,
      oppScore: 0,
      finished: false,
      oppFinished: false,
      timer: SOCIAL_CONFIG.TEMPO_PERGUNTA_DUELO_SEG
    };

    this.renderizarModalDuelo();
  }

  renderizarModalDuelo() {
    document.getElementById('es-duel-play-modal')?.remove();
    const d = this.activeDuel;
    if (!d) return;

    const q = d.questions[d.idx];
    const html = `
      <div id="es-duel-play-modal" style="position:fixed; inset:0; z-index:1000270; background:rgba(5,7,14,0.88); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; padding:16px; font-family:Inter,sans-serif;">
        <div style="background:linear-gradient(155deg,#0f172a,#1e1b4b); border:2px solid #f59e0b; border-radius:22px; padding:22px; width:100%; max-width:450px; color:#fff; box-shadow:0 25px 75px rgba(0,0,0,0.85);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span style="font-size:13px; font-weight:900; color:#fde047;">⚔️ DUELO 1v1 • ${Math.min(d.idx + 1, d.questions.length)}/${d.questions.length}</span>
            <span id="es-duel-timer" style="font-size:13px; font-weight:900; color:#38bdf8;">${d.finished ? '⏳ Aguardando...' : `⏱️ ${Math.ceil(d.timer)}s`}</span>
          </div>

          <div style="display:flex; justify-content:space-between; background:rgba(255,255,255,0.06); border-radius:12px; padding:10px 14px; margin-bottom:14px; font-size:13px; font-weight:900;">
            <span style="color:#6ee7b7;">Você: ${d.myScore}</span>
            <span style="color:#94a3b8;">VS</span>
            <span style="color:#fca5a5;">${d.opponentName}: ${d.oppScore}</span>
          </div>

          ${d.finished || !q ? `
            <div style="text-align:center; padding:22px 10px; color:#cbd5e1; font-size:14px; font-weight:700;">
              ⏳ Você concluiu suas 3 perguntas!<br>Aguardando ${d.opponentName} finalizar...
            </div>
          ` : `
            <div style="font-size:15px; font-weight:800; margin-bottom:12px; line-height:1.4;">${q.q}</div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${q.opts.map((opt, idx) => `
                <button type="button" data-duel-opt="${idx}" style="background:#1e293b; border:1px solid #334155; color:#f8fafc; border-radius:12px; padding:11px 12px; font-size:13px; font-weight:700; cursor:pointer; text-align:left;">
                  ${String.fromCharCode(65 + idx)}) ${opt}
                </button>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    document.querySelectorAll('[data-duel-opt]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.responderPerguntaDuelo(parseInt(btn.dataset.duelOpt, 10));
      });
    });
  }

  async responderPerguntaDuelo(optIdx) {
    const d = this.activeDuel;
    if (!d || d.finished) return;
    const q = d.questions[d.idx];
    const acertou = Boolean(q && optIdx === q.correct);
    if (acertou) d.myScore++;

    d.idx++;
    d.timer = SOCIAL_CONFIG.TEMPO_PERGUNTA_DUELO_SEG;
    if (d.idx >= d.questions.length) d.finished = true;

    await fetch('/api/workspace/english-spaces/world/duel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        action: 'ANSWER',
        escolaId: this.obterEscolaId(),
        duelId: d.duelId,
        userId: this.obterMeuId(),
        score: d.myScore,
        finished: d.finished
      })
    }).catch(() => {});

    if (d.finished && d.oppFinished) {
      this.finalizarDuelo();
    } else {
      this.renderizarModalDuelo();
    }
  }

  async finalizarDuelo() {
    const d = this.activeDuel;
    if (!d) return;
    document.getElementById('es-duel-play-modal')?.remove();
    this.activeDuel = null;

    let premio = SOCIAL_CONFIG.PREMIO_PARTICIPACAO_DUELO_DRX;
    let titulo = `🤝 Empate ${d.myScore} x ${d.oppScore}!`;

    if (d.myScore > d.oppScore) {
      premio = SOCIAL_CONFIG.PREMIO_VITORIA_DUELO_DRX;
      titulo = `🏆 Você venceu ${d.opponentName} (${d.myScore} x ${d.oppScore})!`;
      this.world.interacoesPro?.dispararEmote?.('dance', false);
      this.world.falarTextoNPC?.('Victory! You won the street English duel!', 'street');
    } else if (d.myScore === d.oppScore) {
      premio = SOCIAL_CONFIG.PREMIO_EMPATE_DUELO_DRX;
      this.world.interacoesPro?.dispararEmote?.('clap', false);
    } else {
      titulo = `⚔️ ${d.opponentName} venceu (${d.oppScore} x ${d.myScore})!`;
      this.world.interacoesPro?.dispararEmote?.('clap', false);
    }

    this.world.mostrarBalaoNoBoneco?.(this.world.localPlayer, titulo, 5000);
    await window.DOVRYX?.add(premio, `Street Quiz Duel ⚔️`);
  }

  // ============================================================================
  // 4. 📡 RECEPÇÃO DOS EVENTOS SSE DA ETAPA 8
  // ============================================================================
  aoReceberEventoSSE(data) {
    if (!data) return;
    const meuId = this.obterMeuId();

    if (data.type === 'ES_GAMESHOW_EVENT') {
      if (data.action === 'START' && data.round) {
        this.aplicarRodadaGameShowSincronizada(data.round);
      } else if (data.action === 'PODIUM' && Array.isArray(data.podium)) {
        this.desenharPodioNoTelao(data.correct || '', data.podium);
      }
      return;
    }

    if (data.type === 'ES_HOUSE_UPDATE' && String(data.userId) !== meuId) {
      this.carregarCasasDaNuvem();
      return;
    }

    if (data.type === 'ES_HOUSE_LIKE') {
      const h = this.communityHouses.find(x => String(x.userId) === String(data.ownerUserId));
      if (h && Array.isArray(data.likes)) h.likes = data.likes;
      if (String(data.ownerUserId) === meuId && String(data.likerId) !== meuId && data.liked) {
        window.Workspace?.mostrarAviso?.(`❤️ ${data.likerName} curtiu a decoração da sua casa!`, 'success', 3800);
      }
      return;
    }

    if (data.type === 'ES_WORLD_DUEL') {
      if (data.action === 'CHALLENGE' && String(data.targetId) === meuId) {
        this.mostrarConviteDueloRecebido(data);
      } else if (data.action === 'DECLINE' && String(data.challengerId) === meuId) {
        window.Workspace?.mostrarAviso?.(`⚔️ ${data.targetName} recusou o duelo agora.`, 'info', 3000);
      } else if (data.action === 'START' && (String(data.challengerId) === meuId || String(data.targetId) === meuId)) {
        this.iniciarDueloLocal(data);
      } else if (data.action === 'ANSWER' && this.activeDuel && this.activeDuel.duelId === data.duelId && String(data.userId) !== meuId) {
        this.activeDuel.oppScore = Number(data.score) || 0;
        this.activeDuel.oppFinished = Boolean(data.finished);
        if (this.activeDuel.finished && this.activeDuel.oppFinished) {
          this.finalizarDuelo();
        } else {
          this.renderizarModalDuelo();
        }
      }
    }
  }

  // ============================================================================
  // 🔄 LOOP POR FRAME (PORTAS DOS VIZINHOS + BOTÃO DUELO/CURTIR + TIMER DUELO)
  // ============================================================================
  update(delta) {
    const p = this.world?.localPlayer;
    if (!p) return;

    // 1. Portas automáticas das casas dos colegas (Lotes #1..#7) + detecção de visita para botão Curtir
    let casaVisitada = null;
    if (!this.world.modoInterior && !this.world.torreAtual) {
      this.neighborDoors.forEach(nd => {
        const distPorta = Math.hypot(p.x - nd.lotX, p.z - (nd.lotZ - 3.35));
        const alvo = distPorta < SOCIAL_CONFIG.DIST_PORTA_VIZINHO ? 1 : 0;
        nd.openRatio += (alvo - nd.openRatio) * Math.min(1, delta * 6);
        nd.mesh.position.x = nd.openRatio * 1.18;
      });

      this.communityHouses.forEach((h, idx) => {
        const lotIndex = idx + 1;
        const col = (lotIndex % 4) - 1.5;
        const row = Math.floor(lotIndex / 4);
        const lx = col * 18;
        const lz = 34 + row * 18;
        if (Math.abs(p.x - lx) <= 5.5 && Math.abs(p.z - lz) <= 5.5) {
          casaVisitada = h;
        }
      });
    }

    this.currentVisitedHouse = casaVisitada;
    if (this.likeHouseBtnEl) {
      if (casaVisitada) {
        const likes = Array.isArray(casaVisitada.likes) ? casaVisitada.likes : [];
        const curti = likes.includes(this.obterMeuId());
        this.likeHouseBtnEl.style.display = 'inline-flex';
        this.likeHouseBtnEl.innerHTML = `${curti ? '❤️' : '🤍'} Casa de ${this.world.formatarNomeCompleto?.(casaVisitada.ownerName) || casaVisitada.ownerName} (${likes.length})`;
      } else {
        this.likeHouseBtnEl.style.display = 'none';
      }
    }

    // 2. Botão contextual de Duelo 1v1 quando há colega próximo
    if (this.duelBtnEl) {
      const colegaPerto = !this.activeDuel ? this.world.nearbyTargets?.find(t => t.type === 'player') : null;
      if (colegaPerto) {
        this.duelBtnEl.style.display = 'inline-flex';
        this.duelBtnEl.innerHTML = `⚔️ Duelar com ${colegaPerto.name}`;
      } else {
        this.duelBtnEl.style.display = 'none';
      }
    }

    // 3. Cronômetro do duelo ativo
    if (this.activeDuel && !this.activeDuel.finished) {
      this.activeDuel.timer -= delta;
      const tEl = document.getElementById('es-duel-timer');
      if (tEl) tEl.textContent = `⏱️ ${Math.max(0, Math.ceil(this.activeDuel.timer))}s`;
      if (this.activeDuel.timer <= 0) {
        this.responderPerguntaDuelo(-1);
      }
    }
  }

  dispose() {
    clearTimeout(this._syncFurnitureTimer);
    ['es-neighbors-modal', 'es-gs-prof-modal', 'es-duel-invite-modal', 'es-duel-play-modal'].forEach(id => {
      document.getElementById(id)?.remove();
    });
    this.duelBtnEl?.remove();
    this.likeHouseBtnEl?.remove();
    if (this.neighborFurnitureGroup) {
      this.world?.exteriorGroup?.remove(this.neighborFurnitureGroup);
      this.neighborFurnitureGroup = null;
    }
    this.activeDuel = null;
    this.world = null;
  }
}