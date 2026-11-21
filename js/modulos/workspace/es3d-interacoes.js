// js/modulos/workspace/es3d-interacoes.js
// 🎁 Etapa 3: Caça ao Tesouro Diária (Daily Quest 3D), Sentar em Bancos/Cadeiras, Barra de Emotes e Foto Postal

// ⚙️ PARÂMETROS AJUSTÁVEIS
const INTERACOES_CONFIG = {
  QTD_TESOUROS_DIA: 4,          // Quantos tesouros escondidos aparecem por dia
  RECOMPENSA_TESOURO_DRX: 40,   // DRX ganhos por cada tesouro encontrado
  BONUS_COMPLETO_DRX: 100,      // Bônus ao completar todos os tesouros do dia
  RECOMPENSA_FOTO_DRX: 15,      // DRX por tirar um cartão-postal (com intervalo)
  COOLDOWN_FOTO_MS: 60000,      // Intervalo (ms) entre recompensas de foto (60s)
  DURACAO_EMOTE_SEG: 2.6        // Duração padrão de cada animação de emote
};

// 🗺️ Catálogo de possíveis tesouros espalhados pelos pontos icônicos da cidade
const DAILY_TREASURE_POOL = [
  { id: 'passport',   emoji: '🛂', word: 'Lost Passport',   cor: 0x38bdf8, x: 10.5,  z: -64,   clue: 'Someone dropped a blue passport near the Airport entrance!' },
  { id: 'coffee_cup', emoji: '☕', word: 'Golden Coffee',   cor: 0xf59e0b, x: -10.5, z: 0.5,   clue: 'Smells delicious! Look outside the Coffee Shop on the main boulevard.' },
  { id: 'coin_bag',   emoji: '💰', word: 'DOVRYX Pouch',    cor: 0xfacc15, x: 18.0,  z: -99.5, clue: 'A shiny pouch is floating near the Central Plaza fountain!' },
  { id: 'grammar',    emoji: '📖', word: 'Magic Dictionary',cor: 0xa855f7, x: 42.0,  z: -48,   clue: 'Check the sidewalk in front of the Bookstore on the East Avenue!' },
  { id: 'sunglasses', emoji: '🕶️', word: 'Beach Shades',    cor: 0x2dd4bf, x: 10.5,  z: -48,   clue: 'Sunny vibes! Someone left sunglasses near the Beach entrance.' },
  { id: 'wizard_gem', emoji: '🔮', word: 'Guild Crystal',   cor: 0xc084fc, x: 42.0,  z: -80,   clue: 'A purple crystal is glowing right outside the Guild Baú do Inglês!' },
  { id: 'house_key',  emoji: '🔑', word: 'Golden Key',      cor: 0x10b981, x: -27.0, z: 28.5,  clue: 'A shiny house key is waiting near the Residential Lots in the south!' },
  { id: 'school_bag', emoji: '🎒', word: 'English Backpack',cor: 0x4ade80, x: -10.5, z: -16,   clue: 'A student forgot a backpack right outside the School!' }
];

// 🪑 Coordenadas dos bancos fixos da Praça Central e da Avenida Principal
const PUBLIC_BENCH_SEATS = [
  // Praça Central (centro em x=18, z=-103)
  { name: 'Central Plaza Bench', x: 14.35, y: 0.78, z: -107.25, rotY: 0 },
  { name: 'Central Plaza Bench', x: 22.25, y: 0.78, z: -106.65, rotY: -Math.PI / 2 },
  { name: 'Central Plaza Bench', x: 13.75, y: 0.78, z: -99.35,  rotY: Math.PI / 2 },
  // Bancos da Avenida Principal (x = ±7.65, z = -82, -34, +14)
  { name: 'Boulevard Bench', x: -7.65, y: 0.72, z: -82, rotY: Math.PI / 2 },
  { name: 'Boulevard Bench', x:  7.65, y: 0.72, z: -82, rotY: -Math.PI / 2 },
  { name: 'Boulevard Bench', x: -7.65, y: 0.72, z: -34, rotY: Math.PI / 2 },
  { name: 'Boulevard Bench', x:  7.65, y: 0.72, z: -34, rotY: -Math.PI / 2 },
  { name: 'Boulevard Bench', x: -7.65, y: 0.72, z:  14, rotY: Math.PI / 2 },
  { name: 'Boulevard Bench', x:  7.65, y: 0.72, z:  14, rotY: -Math.PI / 2 }
];

export class ES3DInteracoes {
  constructor(world) {
    this.world = world;
    this.THREE = window.THREE;

    // Daily Quest 3D
    this.dailyItems = [];
    this.foundIds = new Set();
    this.treasureMeshes = new Map();
    this.todayKey = new Date().toISOString().slice(0, 10);

    // Sentar
    this.isSitting = false;
    this.seatPos = null;
    this.seatHitboxes = [];

    // Emotes
    this.activeEmote = null; // { type, timer, duration }
    this.emoteBarEl = null;
    this.standBtnEl = null;

    // Foto Postal
    this.lastPhotoRewardTime = 0;
  }

  init() {
    if (!this.THREE || !this.world?.scene) return;
    this.injetarUIInteracoes();
    this.carregarDailyQuestDoDia();
    this.criarTesourosNaCidade();
    this.criarPontosDeAssentoPublicos();
    this.atualizarBotaoQuest();
  }

  // ============================================================================
  // 🎨 UI FLUTUANTE (BARRA DE EMOTES + BOTÃO LEVANTAR)
  // ============================================================================
  injetarUIInteracoes() {
    document.getElementById('es-emote-bar')?.remove();
    document.getElementById('es-stand-btn')?.remove();

    const wrapper = document.getElementById('es-city-wrapper');
    if (!wrapper) return;

    // Barra compacta de Emotes (abre ao clicar no botão 🎭 Emotes no topo)
    const emoteBar = document.createElement('div');
    emoteBar.id = 'es-emote-bar';
    emoteBar.style.cssText = `
      display: none; position: absolute; left: 50%; bottom: 86px; transform: translateX(-50%);
      z-index: 32; background: rgba(14, 16, 30, 0.92); backdrop-filter: blur(16px);
      border: 1px solid rgba(139, 92, 246, 0.45); border-radius: 999px; padding: 6px 10px;
      gap: 6px; align-items: center; box-shadow: 0 12px 30px rgba(0,0,0,0.45);
    `;
    emoteBar.innerHTML = `
      <button type="button" data-emote="wave"  style="background:rgba(255,255,255,0.08);color:#fff;border:none;padding:7px 12px;border-radius:999px;font-size:12px;font-weight:800;cursor:pointer;">👋 Wave</button>
      <button type="button" data-emote="clap"  style="background:rgba(255,255,255,0.08);color:#fff;border:none;padding:7px 12px;border-radius:999px;font-size:12px;font-weight:800;cursor:pointer;">👏 Clap</button>
      <button type="button" data-emote="jump"  style="background:rgba(255,255,255,0.08);color:#fff;border:none;padding:7px 12px;border-radius:999px;font-size:12px;font-weight:800;cursor:pointer;">🎉 Cheer</button>
      <button type="button" data-emote="dance" style="background:rgba(255,255,255,0.08);color:#fff;border:none;padding:7px 12px;border-radius:999px;font-size:12px;font-weight:800;cursor:pointer;">💃 Dance</button>
    `;
    wrapper.appendChild(emoteBar);
    this.emoteBarEl = emoteBar;

    emoteBar.querySelectorAll('[data-emote]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.world.garantirAudioAtivo?.();
        this.dispararEmote(btn.dataset.emote);
        emoteBar.style.display = 'none';
      });
    });

    // Botão rápido para levantar quando estiver sentado
    const standBtn = document.createElement('button');
    standBtn.id = 'es-stand-btn';
    standBtn.type = 'button';
    standBtn.innerHTML = '🚶 Stand Up';
    standBtn.style.cssText = `
      display: none; position: absolute; left: 50%; bottom: 138px; transform: translateX(-50%);
      z-index: 32; background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff;
      border: 1px solid rgba(255,255,255,0.25); padding: 8px 18px; border-radius: 999px;
      font-size: 12.5px; font-weight: 900; cursor: pointer; box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    `;
    standBtn.addEventListener('click', () => this.levantar());
    wrapper.appendChild(standBtn);
    this.standBtnEl = standBtn;
  }

  alternarBarraEmotes() {
    if (!this.emoteBarEl) return;
    this.emoteBarEl.style.display = this.emoteBarEl.style.display === 'flex' ? 'none' : 'flex';
  }

  // ============================================================================
  // 1. 🎁 CAÇA AO TESOURO DIÁRIA EM INGLÊS (DAILY QUEST 3D)
  // ============================================================================
  obterChaveStorageQuest() {
    const uid = this.world?.localPlayer?.userId || window.Workspace?.usuario?.id || 'guest';
    return `es3d_daily_quest_${uid}_${this.todayKey}`;
  }

  carregarDailyQuestDoDia() {
    // Seleciona sempre 4 tesouros diferentes baseados no dia atual
    const dayNum = parseInt(this.todayKey.replace(/-/g, ''), 10) || 1;
    const pool = [...DAILY_TREASURE_POOL];
    const selecionados = [];
    for (let i = 0; i < INTERACOES_CONFIG.QTD_TESOUROS_DIA && pool.length > 0; i++) {
      const idx = (dayNum + i * 3) % pool.length;
      selecionados.push(pool.splice(idx, 1)[0]);
    }
    this.dailyItems = selecionados;

    try {
      const salvo = JSON.parse(localStorage.getItem(this.obterChaveStorageQuest()) || '[]');
      this.foundIds = new Set(Array.isArray(salvo) ? salvo : []);
    } catch (e) {
      this.foundIds = new Set();
    }
  }

  salvarProgressoDailyQuest() {
    try {
      localStorage.setItem(this.obterChaveStorageQuest(), JSON.stringify(Array.from(this.foundIds)));
    } catch (e) {}
    this.atualizarBotaoQuest();
  }

  atualizarBotaoQuest() {
    const btn = document.getElementById('es-city-quest-btn');
    if (!btn) return;
    const feitos = this.dailyItems.filter(it => this.foundIds.has(it.id)).length;
    const total = this.dailyItems.length;
    btn.innerHTML = feitos >= total ? `🏆 Quests ${feitos}/${total}` : `🎁 Quests ${feitos}/${total}`;
  }

  criarTesourosNaCidade() {
    const THREE = this.THREE;
    if (!this.world?.exteriorGroup) return;

    this.treasureMeshes.clear();

    this.dailyItems.forEach(item => {
      if (this.foundIds.has(item.id)) return;

      const group = new THREE.Group();

      // Cristal brilhante giratório
      const gem = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.42, 0),
        new THREE.MeshStandardMaterial({
          color: item.cor,
          emissive: item.cor,
          emissiveIntensity: 0.75,
          roughness: 0.2,
          metalness: 0.5
        })
      );
      gem.position.y = 1.25;

      // Halo dourado girando em volta do item
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.62, 0.045, 10, 28),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
      );
      ring.position.y = 1.25;
      ring.rotation.x = Math.PI / 3;

      // Pedestal luminoso no chão para chamar a atenção de longe
      const baseGlow = new THREE.Mesh(
        new THREE.RingGeometry(0.45, 0.75, 24),
        new THREE.MeshBasicMaterial({ color: item.cor, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
      );
      baseGlow.rotation.x = -Math.PI / 2;
      baseGlow.position.y = 0.06;

      // Etiqueta flutuante com o emoji e nome do tesouro
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 96;
      const ctx = c.getContext('2d');
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(0, 0, 256, 96);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 5;
      ctx.strokeRect(3, 3, 250, 90);
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${item.emoji} DAILY QUEST`, 128, 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 19px Inter, sans-serif';
      ctx.fillText('Click to collect!', 128, 74);

      const tex = new THREE.CanvasTexture(c);
      const tag = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 0.56),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
      );
      tag.position.y = 2.15;

      const ud = {
        clickable: true,
        isDailyTreasure: true,
        treasureId: item.id,
        englishName: item.word
      };
      [gem, ring, baseGlow, tag, group].forEach(m => { m.userData = { ...m.userData, ...ud }; });

      group.add(gem, ring, baseGlow, tag);
      group.position.set(item.x, 0, item.z);
      group.userData._anim = { gem, ring, tag, phase: Math.random() * Math.PI * 2 };

      this.world.exteriorGroup.add(group);
      this.world.clickableObjects.push(group);
      this.treasureMeshes.set(item.id, group);
    });
  }

  async coletarTesouro(treasureId) {
    const item = this.dailyItems.find(it => it.id === treasureId);
    if (!item || this.foundIds.has(treasureId)) return;

    this.foundIds.add(treasureId);
    this.salvarProgressoDailyQuest();

    // Remove o item da cena e da lista clicável
    const mesh = this.treasureMeshes.get(treasureId);
    if (mesh) {
      this.world.exteriorGroup?.remove(mesh);
      const idx = this.world.clickableObjects.indexOf(mesh);
      if (idx > -1) this.world.clickableObjects.splice(idx, 1);
      this.treasureMeshes.delete(treasureId);
    }

    const frase = `Awesome! You found the ${item.word}!`;
    this.world.mostrarBalaoNoBoneco?.(this.world.localPlayer, `${item.emoji} Found: ${item.word}!`, 5000);
    this.world.falarTextoNPC?.(frase, 'street');
    this.dispararEmote('jump', false);

    if (window.DOVRYX) {
      await window.DOVRYX.add(INTERACOES_CONFIG.RECOMPENSA_TESOURO_DRX, `Daily Quest: ${item.word}`);
    }

    // Verifica se completou todos os tesouros do dia
    const completos = this.dailyItems.every(it => this.foundIds.has(it.id));
    if (completos && window.DOVRYX) {
      setTimeout(async () => {
        await window.DOVRYX.add(INTERACOES_CONFIG.BONUS_COMPLETO_DRX, 'Daily Treasure Hunt Complete! 🏆');
        this.world.falarTextoNPC?.('Congratulations! You completed the Daily Treasure Hunt!', 'street');
      }, 900);
    }
  }

  abrirModalDailyQuests() {
    document.getElementById('es-quest-modal')?.remove();
    const feitos = this.dailyItems.filter(it => this.foundIds.has(it.id)).length;
    const total = this.dailyItems.length;

    const html = `
      <div id="es-quest-modal" style="position:fixed; inset:0; z-index:1000240; background:rgba(5,7,14,0.82); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; padding:16px; font-family:Inter,sans-serif;">
        <div style="background:#0f172a; border:2px solid #f59e0b; border-radius:22px; padding:22px; width:100%; max-width:460px; color:#fff; box-shadow:0 25px 60px rgba(0,0,0,0.75);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div>
              <h3 style="margin:0; font-size:18px; color:#fde047;">🎁 Daily Treasure Hunt (${feitos}/${total})</h3>
              <div style="font-size:11.5px; color:#94a3b8; margin-top:2px;">Read the English clues &amp; click the glowing items in the city!</div>
            </div>
            <button type="button" id="es-quest-close" style="background:#1e293b; color:#cbd5e1; border:none; width:34px; height:34px; border-radius:50%; font-weight:800; cursor:pointer;">✕</button>
          </div>

          <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:14px;">
            ${this.dailyItems.map(it => {
              const achou = this.foundIds.has(it.id);
              return `
                <div style="background:${achou ? 'rgba(16,185,129,0.14)' : '#1e293b'}; border:1px solid ${achou ? '#10b981' : '#334155'}; border-radius:14px; padding:12px; display:flex; align-items:flex-start; gap:10px;">
                  <div style="font-size:26px; line-height:1;">${achou ? '✅' : it.emoji}</div>
                  <div style="flex:1;">
                    <div style="font-size:13.5px; font-weight:800; color:${achou ? '#6ee7b7' : '#f8fafc'};">
                      ${it.word} <span style="color:#facc15; font-size:11.5px;">(+${INTERACOES_CONFIG.RECOMPENSA_TESOURO_DRX} DRX)</span>
                    </div>
                    <div style="font-size:12px; color:#cbd5e1; margin-top:3px; line-height:1.4;">
                      ${achou ? 'Collected today! Great job!' : `"${it.clue}"`}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div style="background:rgba(250,204,21,0.12); border:1px solid rgba(250,204,21,0.35); border-radius:12px; padding:10px; text-align:center; font-size:12.5px; color:#fef08a; font-weight:700;">
            🏆 Complete all ${total} items today for a +${INTERACOES_CONFIG.BONUS_COMPLETO_DRX} DRX bonus!
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    document.getElementById('es-quest-close')?.addEventListener('click', () => document.getElementById('es-quest-modal')?.remove());
    document.getElementById('es-quest-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'es-quest-modal') e.target.remove();
    });
  }

  // ============================================================================
  // 2. 🪑 SENTAR NOS BANCOS DA PRAÇA, AVENIDA E CADEIRAS DAS LOJAS
  // ============================================================================
  criarPontosDeAssentoPublicos() {
    const THREE = this.THREE;
    if (!this.world?.exteriorGroup) return;

    this.seatHitboxes = [];
    const hitMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });

    PUBLIC_BENCH_SEATS.forEach(seat => {
      const box = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.9, 0.75), hitMat);
      box.position.set(seat.x, seat.y, seat.z);
      box.userData = {
        clickable: true,
        isSittable: true,
        seatInfo: seat,
        englishName: seat.name
      };
      this.world.exteriorGroup.add(box);
      this.world.clickableObjects.push(box);
      this.seatHitboxes.push(box);
    });
  }

  sentarNoLocal(seatInfo) {
    const p = this.world?.localPlayer;
    if (!p || !seatInfo) return;

    if (this.world.currentVehicle) this.world.desmontarVeiculo?.();

    this.isSitting = true;
    this.activeEmote = null;
    this.seatPos = { x: seatInfo.x, y: seatInfo.y || 0, z: seatInfo.z, rotY: seatInfo.rotY ?? p.rotY };

    p.x = seatInfo.x;
    p.z = seatInfo.z;
    p.rotY = this.seatPos.rotY;
    p.targetX = null;
    p.targetZ = null;

    if (this.standBtnEl) this.standBtnEl.style.display = 'inline-flex';
    this.world.mostrarBalaoNoBoneco?.(p, `🪑 Sitting on the ${seatInfo.name || 'bench'}!`, 3200);
    this.world.falarTextoNPC?.(`Taking a break on the ${seatInfo.name || 'bench'}!`, this.world.currentZoneId);
    this.world.enviarMinhaPosicaoServidor?.();
  }

  levantar() {
    if (!this.isSitting) return;
    this.isSitting = false;
    this.seatPos = null;

    const ud = this.world?.localPlayer?.mesh?.userData;
    if (ud) {
      if (ud.bodyRoot) ud.bodyRoot.position.y = 0;
      if (ud.leftLeg) ud.leftLeg.rotation.x = 0;
      if (ud.rightLeg) ud.rightLeg.rotation.x = 0;
      if (ud.leftKnee) ud.leftKnee.rotation.x = 0;
      if (ud.rightKnee) ud.rightKnee.rotation.x = 0;
      if (ud.leftArm) ud.leftArm.rotation.x = 0;
      if (ud.rightArm) ud.rightArm.rotation.x = 0;
      if (ud.leftElbow) ud.leftElbow.rotation.x = -0.16;
      if (ud.rightElbow) ud.rightElbow.rotation.x = -0.16;
    }
    if (this.standBtnEl) this.standBtnEl.style.display = 'none';
  }

  // ============================================================================
  // 3. 🎭 BARRA DE EMOTES ANIMADOS (WAVE, CLAP, CHEER/JUMP, DANCE)
  // ============================================================================
  dispararEmote(tipo, falar = true) {
    const p = this.world?.localPlayer;
    if (!p) return;

    const falas = {
      wave:  { bubble: '👋 Hello everyone!',       voice: 'Hello everyone!' },
      clap:  { bubble: '👏 Great job!',            voice: 'Great job! Well done!' },
      jump:  { bubble: '🎉 Woohoo! Awesome!',      voice: 'Woohoo! That is awesome!' },
      dance: { bubble: '💃 Let\'s celebrate!',     voice: 'Let us celebrate in English City!' }
    };

    if (tipo === 'jump' || tipo === 'dance') {
      this.levantar();
    }

    this.activeEmote = {
      type: tipo,
      timer: 0,
      duration: INTERACOES_CONFIG.DURACAO_EMOTE_SEG
    };

    const info = falas[tipo];
    if (info && falar) {
      this.world.mostrarBalaoNoBoneco?.(p, info.bubble, 3500);
      this.world.falarTextoNPC?.(info.voice, this.world.currentZoneId);
    }
  }

 aplicarAnimacoesAvatar(delta, estaAndando) {
    const p = this.world?.localPlayer;
    const ud = p?.mesh?.userData;
    if (!p || !ud) return;

    // Se o jogador começou a andar ou foi teleportado para longe do banco, levanta automaticamente
    if (this.isSitting) {
      const distAssento = this.seatPos ? Math.hypot(p.x - this.seatPos.x, p.z - this.seatPos.z) : 99;
      if (estaAndando || distAssento > 0.9) {
        this.levantar();
      } else {
        if (ud.bodyRoot) ud.bodyRoot.position.y = -0.26;
        if (ud.leftLeg) ud.leftLeg.rotation.x = -1.42;
        if (ud.rightLeg) ud.rightLeg.rotation.x = -1.42;
        if (ud.leftKnee) ud.leftKnee.rotation.x = 1.42;
        if (ud.rightKnee) ud.rightKnee.rotation.x = 1.42;
        if (!this.activeEmote) {
          if (ud.leftArm) { ud.leftArm.rotation.x = -0.32; ud.leftArm.rotation.z = 0.08; }
          if (ud.rightArm) { ud.rightArm.rotation.x = -0.32; ud.rightArm.rotation.z = -0.08; }
          if (ud.leftElbow) ud.leftElbow.rotation.x = -0.58;
          if (ud.rightElbow) ud.rightElbow.rotation.x = -0.58;
        }
      }
    }

    // Executa emote ativo
    if (this.activeEmote) {
      if (estaAndando) {
        this.activeEmote = null;
        return;
      }

      this.activeEmote.timer += delta;
      const t = this.activeEmote.timer;
      const tipo = this.activeEmote.type;

      if (tipo === 'wave') {
        if (ud.rightArm) {
          ud.rightArm.rotation.x = -2.45;
          ud.rightArm.rotation.z = -0.45 + Math.sin(t * 14) * 0.35;
        }
        if (ud.rightElbow) ud.rightElbow.rotation.x = -0.45 + Math.sin(t * 14) * 0.25;
      } else if (tipo === 'clap') {
        const batida = Math.abs(Math.sin(t * 11));
        if (ud.leftArm) {
          ud.leftArm.rotation.x = -1.15;
          ud.leftArm.rotation.z = -0.15 - batida * 0.42;
        }
        if (ud.rightArm) {
          ud.rightArm.rotation.x = -1.15;
          ud.rightArm.rotation.z = 0.15 + batida * 0.42;
        }
        if (ud.leftElbow) ud.leftElbow.rotation.x = -0.85;
        if (ud.rightElbow) ud.rightElbow.rotation.x = -0.85;
      } else if (tipo === 'jump') {
        const pulo = Math.abs(Math.sin(t * 7.5)) * 0.55;
        if (ud.bodyRoot) ud.bodyRoot.position.y = pulo;
        if (ud.leftArm) { ud.leftArm.rotation.x = -2.6; ud.leftArm.rotation.z = 0.35; }
        if (ud.rightArm) { ud.rightArm.rotation.x = -2.6; ud.rightArm.rotation.z = -0.35; }
      } else if (tipo === 'dance') {
        const ritmo = Math.sin(t * 9);
        if (ud.bodyRoot) ud.bodyRoot.position.y = Math.abs(ritmo) * 0.14;
        if (ud.leftArm) { ud.leftArm.rotation.x = -1.6 + ritmo * 0.55; ud.leftArm.rotation.z = 0.45; }
        if (ud.rightArm) { ud.rightArm.rotation.x = -1.6 - ritmo * 0.55; ud.rightArm.rotation.z = -0.45; }
        if (ud.leftLeg) ud.leftLeg.rotation.x = ritmo * 0.32;
        if (ud.rightLeg) ud.rightLeg.rotation.x = -ritmo * 0.32;
        if (ud.headGroup) ud.headGroup.rotation.y = ritmo * 0.25;
      }

      if (t >= this.activeEmote.duration) {
        this.activeEmote = null;
        if (ud.bodyRoot && !this.isSitting) ud.bodyRoot.position.y = 0;
      }
    }
  }

  // ============================================================================
  // 4. 📸 MODO FOTO POSTAL LIVRE EM QUALQUER PONTO DA CIDADE
  // ============================================================================
  tirarFotoPostal() {
    if (!this.world?.renderer || !this.world?.scene || !this.world?.camera) return;

    try {
      this.world.renderer.render(this.world.scene, this.world.camera);
      const srcCanvas = this.world.renderer.domElement;

      const out = document.createElement('canvas');
      out.width = 1080;
      out.height = 760;
      const ctx = out.getContext('2d');

      // Moldura branca estilo Cartão-Postal Polaroid
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, out.width, out.height);

      // Área da foto 3D recortada proporcionalmente
      const pad = 34;
      const photoW = out.width - pad * 2;
      const photoH = 570;

      const srcRatio = srcCanvas.width / Math.max(1, srcCanvas.height);
      const dstRatio = photoW / photoH;
      let sx = 0, sy = 0, sw = srcCanvas.width, sh = srcCanvas.height;
      if (srcRatio > dstRatio) {
        sw = srcCanvas.height * dstRatio;
        sx = (srcCanvas.width - sw) / 2;
      } else {
        sh = srcCanvas.width / dstRatio;
        sy = (srcCanvas.height - sh) / 2;
      }

      ctx.drawImage(srcCanvas, sx, sy, sw, sh, pad, pad, photoW, photoH);

      // Borda fina ao redor da foto
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3;
      ctx.strokeRect(pad, pad, photoW, photoH);

      // Selo postal no canto superior direito da foto
      ctx.save();
      ctx.translate(out.width - 148, 86);
      ctx.rotate(0.08);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.86)';
      ctx.fillRect(-85, -30, 170, 60);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.strokeRect(-81, -26, 162, 52);
      ctx.fillStyle = '#fde047';
      ctx.font = '900 15px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ENGLISH CITY ✈️', 0, -4);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '700 12px Inter, sans-serif';
      ctx.fillText('POSTCARD • 3D', 0, 16);
      ctx.restore();

      // Legenda inferior do cartão-postal
      const zoneTxt = (document.getElementById('es-city-zone-badge')?.textContent || 'English City Boulevard').trim();
      const playerNome = this.world?.localPlayer?.nome || 'Student';
      const dataStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      ctx.fillStyle = '#0f172a';
      ctx.font = '800 30px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Greetings from ${zoneTxt}!`, pad, 658);

      ctx.fillStyle = '#64748b';
      ctx.font = '600 19px Inter, sans-serif';
      ctx.fillText(`Captured by ${playerNome} • ${dataStr}`, pad, 698);

      ctx.fillStyle = '#2563eb';
      ctx.font = '800 18px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('🌎 WorkSpace English Spaces', out.width - pad, 698);

      const dataURL = out.toDataURL('image/png');
      this.abrirModalPreviewFoto(dataURL, zoneTxt);

      // Recompensa em DRX com cooldown de 60s
      const agora = Date.now();
      if (agora - this.lastPhotoRewardTime > INTERACOES_CONFIG.COOLDOWN_FOTO_MS) {
        this.lastPhotoRewardTime = agora;
        window.DOVRYX?.add(INTERACOES_CONFIG.RECOMPENSA_FOTO_DRX, 'City Postcard Photo 📸');
      }
      this.world.falarTextoNPC?.('Cheese! Your English City postcard is ready!', this.world.currentZoneId);
    } catch (e) {}
  }

  abrirModalPreviewFoto(dataURL, zoneTxt) {
    document.getElementById('es-postcard-modal')?.remove();
    const html = `
      <div id="es-postcard-modal" style="position:fixed; inset:0; z-index:1000250; background:rgba(5,7,14,0.86); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; padding:16px; font-family:Inter,sans-serif;">
        <div style="background:#0f172a; border:2px solid #38bdf8; border-radius:20px; padding:18px; max-width:560px; width:100%; text-align:center; color:#fff; box-shadow:0 25px 65px rgba(0,0,0,0.75);">
          <h3 style="margin:0 0 10px; color:#7dd3fc; font-size:17px;">📸 English City Postcard</h3>
          <img src="${dataURL}" alt="Postcard" style="width:100%; border-radius:10px; box-shadow:0 12px 30px rgba(0,0,0,0.45); margin-bottom:14px;" />
          <div style="display:flex; gap:10px;">
            <button type="button" id="es-postcard-close" style="flex:1; padding:11px; background:#1e293b; color:#cbd5e1; border:none; border-radius:12px; font-weight:700; cursor:pointer;">Close</button>
            <button type="button" id="es-postcard-download" style="flex:1.6; padding:11px; background:linear-gradient(135deg,#2563eb,#0ea5e9); color:#fff; border:none; border-radius:12px; font-weight:900; cursor:pointer;">💾 Download Postcard (PNG)</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    document.getElementById('es-postcard-close')?.addEventListener('click', () => document.getElementById('es-postcard-modal')?.remove());
    document.getElementById('es-postcard-download')?.addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = `english-city-postcard-${Date.now()}.png`;
      link.href = dataURL;
      link.click();
    });
  }

  // ============================================================================
  // 🖱️ TRATADOR DE CLIQUES 3D (TESOUROS + BANCOS/CADEIRAS/SOFÁS)
  // ============================================================================
  aoClicarObjeto3D(ud, obj) {
    if (!ud) return false;

    // 1. Tesouro Diário
    if (ud.isDailyTreasure && ud.treasureId) {
      this.coletarTesouro(ud.treasureId);
      return true;
    }

    // 2. Bancos públicos (Praça Central e Avenida)
    if (ud.isSittable && ud.seatInfo) {
      this.sentarNoLocal(ud.seatInfo);
      return true;
    }

    // 3. Cadeiras, Sofás e Espreguiçadeiras dentro das lojas
    const nome = String(ud.englishName || '').toLowerCase();
    if (obj && (nome === 'chair' || nome.includes('sofa') || nome.includes('lounge chair'))) {
      const worldPos = new this.THREE.Vector3();
      obj.getWorldPosition(worldPos);
      this.sentarNoLocal({
        name: ud.englishName,
        x: worldPos.x,
        y: 0,
        z: worldPos.z,
        rotY: this.world.localPlayer?.rotY || 0
      });
      return true;
    }

    return false;
  }

  // ============================================================================
  // 🔄 LOOP DE ATUALIZAÇÃO & LIMPEZA DE MEMÓRIA
  // ============================================================================
  update(delta, estaAndando = false) {
    // Animação flutuante dos tesouros na rua
    if (!this.world.modoInterior) {
      const t = performance.now() * 0.0025;
      this.treasureMeshes.forEach(group => {
        const a = group.userData?._anim;
        if (!a) return;
        const bob = Math.sin(t + a.phase) * 0.16;
        a.gem.position.y = 1.25 + bob;
        a.gem.rotation.y += delta * 1.8;
        a.ring.position.y = 1.25 + bob;
        a.ring.rotation.z += delta * 2.2;
        if (this.world.camera) {
          a.tag.lookAt(this.world.camera.position);
        }
      });
    }

    this.aplicarAnimacoesAvatar(delta, estaAndando);
  }

  dispose() {
    this.levantar();
    this.emoteBarEl?.remove();
    this.standBtnEl?.remove();
    document.getElementById('es-quest-modal')?.remove();
    document.getElementById('es-postcard-modal')?.remove();

    this.treasureMeshes.forEach(group => {
      try {
        this.world.exteriorGroup?.remove(group);
        const idx = this.world.clickableObjects.indexOf(group);
        if (idx > -1) this.world.clickableObjects.splice(idx, 1);
      } catch (e) {}
    });
    this.treasureMeshes.clear();

    this.seatHitboxes.forEach(box => {
      try {
        this.world.exteriorGroup?.remove(box);
        const idx = this.world.clickableObjects.indexOf(box);
        if (idx > -1) this.world.clickableObjects.splice(idx, 1);
      } catch (e) {}
    });
    this.seatHitboxes = [];
  }
}