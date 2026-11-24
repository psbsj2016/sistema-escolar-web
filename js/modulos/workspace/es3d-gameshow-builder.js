// js/modulos/workspace/es3d-gameshow-builder.js
// 🎤🛋️ Game Show Ao Vivo + Móveis Realistas com Duplo Clique Aceso, Arrastar Segurando (Mouse/Dedo), Spawn na Visão e Depósito Guardado

// ⚙️ PARÂMETROS AJUSTÁVEIS
const GAMESHOW_CONFIG = {
  ARENA_X: 18,                  // Centro X do palco do Game Show (lado norte da Praça Central)
  ARENA_Z: -115,                // Centro Z das plataformas A, B, C
  TEMPO_PERGUNTA_SEG: 12,       // Tempo (segundos) para correr até a plataforma certa
  PREMIO_ACERTO_DRX: 50,        // DRX por resposta correta no Game Show
  BONUS_SEQUENCIA_DRX: 25,      // Bônus extra a cada 3 acertos seguidos
  DIST_SNAP_PAREDE: 0.72,       // Distância até a parede para ativar orientação inteligente
  DUPLO_CLIQUE_MS: 380          // Intervalo máximo (ms) entre 2 cliques rápidos para acender e liberar arraste
};

// 🧠 Banco de 15 Perguntas de Inglês para o Game Show Ao Vivo
const GAMESHOW_QUESTIONS = [
  { q: 'Which sentence is in the Simple Past?', a: 'I went to London yesterday.', b: 'I go to London yesterday.', c: 'I going to London.', correct: 'A' },
  { q: 'What does "Break a leg!" mean?', a: 'Be careful!', b: 'Good luck!', c: 'Run faster!', correct: 'B' },
  { q: 'Complete: "She ____ lived here since 2022."', a: 'have', b: 'is', c: 'has', correct: 'C' },
  { q: 'What is the opposite of "Expensive"?', a: 'Cheap', b: 'Heavy', c: 'Crowded', correct: 'A' },
  { q: 'Complete: "If it rains, I ____ stay home."', a: 'would', b: 'will', c: 'did', correct: 'B' },
  { q: 'Which word means "Bagagem de mão"?', a: 'Boarding pass', b: 'Aisle seat', c: 'Carry-on', correct: 'C' },
  { q: 'Complete: "How ____ have you studied English?"', a: 'long', b: 'many', c: 'much', correct: 'A' },
  { q: 'What does the phrasal verb "Give up" mean?', a: 'Wake up early', b: 'Quit / Stop trying', c: 'Celebrate', correct: 'B' },
  { q: 'Choose the correct comparative:', a: 'More better', b: 'Gooder', c: 'Better', correct: 'C' },
  { q: 'At a restaurant, how do you ask for the check?', a: 'Could we have the bill, please?', b: 'Give me money!', c: 'Where is the airport?', correct: 'A' },
  { q: 'Complete: "They ____ watching a movie right now."', a: 'is', b: 'are', c: 'was', correct: 'B' },
  { q: 'Which word is a synonym for "Awesome"?', a: 'Boring', b: 'Tiny', c: 'Amazing', correct: 'C' },
  { q: 'Complete: "I look forward to ____ from you."', a: 'hearing', b: 'hear', c: 'heard', correct: 'A' },
  { q: 'What does "Deadline" mean?', a: 'A phone line', b: 'Final time limit', c: 'A quiet room', correct: 'B' },
  { q: 'Complete: "Neither Paulo ____ Maria was late."', a: 'or', b: 'and', c: 'nor', correct: 'C' }
];

// 🛋️ CATÁLOGO DE 12 MÓVEIS REALISTAS (cornerMode: 'wall' | 'diagonal' | 'none')
const FURNITURE_CATALOG = [
  { id: 'sofa',      emoji: '🛋️', name: 'Modern Sofa',     price: 30, w: 1.92, d: 0.88, solid: true,  cornerMode: 'wall',     phrase: 'This is a comfortable Modern Sofa!' },
  { id: 'bed',       emoji: '🛏️', name: 'Comfy Bed',       price: 50, w: 1.72, d: 2.10, solid: true,  cornerMode: 'wall',     phrase: 'Time to rest on this Comfy Bed!' },
  { id: 'tv_stand',  emoji: '📺', name: 'Smart TV Stand',  price: 65, w: 1.52, d: 0.50, solid: true,  cornerMode: 'diagonal', phrase: 'Let us watch movies in English on the Smart TV!' },
  { id: 'table',     emoji: '🍽️', name: 'Dining Table',    price: 40, w: 1.44, d: 0.98, solid: true,  cornerMode: 'wall',     phrase: 'Dinner is served on the Dining Table!' },
  { id: 'chair',     emoji: '🪑', name: 'Wooden Chair',    price: 20, w: 0.54, d: 0.54, solid: true,  cornerMode: 'wall',     phrase: 'Have a seat on this Wooden Chair!' },
  { id: 'desk_pc',   emoji: '💻', name: 'Study Desk',      price: 60, w: 1.36, d: 0.72, solid: true,  cornerMode: 'wall',     phrase: 'Studying English at my Study Desk!' },
  { id: 'bookshelf', emoji: '📚', name: 'Bookshelf',       price: 45, w: 1.16, d: 0.42, solid: true,  cornerMode: 'wall',     phrase: 'This Bookshelf is full of English books!' },
  { id: 'plant',     emoji: '🪴', name: 'Potted Plant',    price: 15, w: 0.52, d: 0.52, solid: true,  cornerMode: 'diagonal', phrase: 'A fresh Potted Plant makes the room cozy!' },
  { id: 'lamp',      emoji: '💡', name: 'Floor Lamp',      price: 25, w: 0.46, d: 0.46, solid: true,  cornerMode: 'diagonal', phrase: 'Turn on the Floor Lamp for warm light!' },
  { id: 'fridge',    emoji: '🧊', name: 'Kitchen Fridge',  price: 55, w: 0.84, d: 0.78, solid: true,  cornerMode: 'wall',     phrase: 'Cold water and fruit inside the Kitchen Fridge!' },
  { id: 'rug',       emoji: '🧶', name: 'Cozy Rug',        price: 20, w: 2.20, d: 1.50, solid: false, cornerMode: 'none',     phrase: 'This Cozy Rug looks great on the floor!' },
  { id: 'guitar',    emoji: '🎸', name: 'Acoustic Guitar', price: 35, w: 0.48, d: 0.48, solid: true,  cornerMode: 'diagonal', phrase: 'Practice songs with this Acoustic Guitar!' }
];

export class ES3DGameShowBuilder {
  constructor(world) {
    this.world = world;
    this.THREE = window.THREE;

    // Game Show State
    this.gsGroup = null;
    this.gsScreenCanvas = null;
    this.gsScreenCtx = null;
    this.gsScreenTex = null;
    this.gsPads = {};
    this.gsRunning = false;
    this.gsCurrentQ = null;
    this.gsTimer = 0;
    this.gsStreak = 0;
    this.gsLastIndex = -1;
    this.gsScreenBox = null;

    // Builder / Decoração + Depósito de Móveis Guardados
    this.builderActive = false;
    this.activeTab = 'buy'; // 'buy' | 'storage'
    this.furnitureGroup = null;
    this.placedItems = [];  // [{ uid, typeId, zoneKey, x, y, z, rotY, mesh }]
    this.storageItems = []; // [{ uid, typeId, storedAt }]
    this.selectedUid = null;
    this.selectionRing = null;
    this.panelEl = null;
    this.dragBarEl = null;

    // Controle de Duplo Clique + Arraste Direto (Mouse/Dedo)
    this._lastClickUid = null;
    this._lastClickTime = 0;
    this.isDraggingFurniture = false;
    this._dragOffsetX = 0;
    this._dragOffsetZ = 0;
    this._glowPhase = 0;
  }

  init() {
    if (!this.THREE || !this.world?.scene) return;
    this.furnitureGroup = new this.THREE.Group();
    this.furnitureGroup.name = 'CustomFurnitureGroup';
    this.world.scene.add(this.furnitureGroup);

    this.criarAnelSelecaoMovel();
    this.criarArenaGameShow();
    this.carregarMoveisSalvos();
    this.carregarDepositoSalvo();
    this.criarPainelConstrutorUI();
    this.criarBarraFlutuanteMovelAcesoUI();
  }

  // ============================================================================
  // 1. 🎤 GAME SHOW AO VIVO NA PRAÇA CENTRAL
  // ============================================================================
  criarArenaGameShow() {
    const THREE = this.THREE;
    if (!this.world?.exteriorGroup) return;

    const ax = GAMESHOW_CONFIG.ARENA_X;
    const az = GAMESHOW_CONFIG.ARENA_Z;

    this.gsGroup = new THREE.Group();

    const stageBase = new THREE.Mesh(
      new THREE.BoxGeometry(14.5, 0.14, 7.6),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7, metalness: 0.2 })
    );
    stageBase.position.set(ax, 0.07, az);
    stageBase.receiveShadow = true;
    this.gsGroup.add(stageBase);

    const matMetal = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.75, roughness: 0.3 });
    [-4.2, 4.2].forEach(ox => {
      const pilar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 4.6, 12), matMetal);
      pilar.position.set(ax + ox, 2.3, az - 3.6);
      this.gsGroup.add(pilar);
    });

    const frame = new THREE.Mesh(new THREE.BoxGeometry(9.6, 4.3, 0.35), matMetal);
    frame.position.set(ax, 3.6, az - 3.6);
    this.gsGroup.add(frame);

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 460;
    this.gsScreenCanvas = canvas;
    this.gsScreenCtx = canvas.getContext('2d');
    this.gsScreenTex = new THREE.CanvasTexture(canvas);

    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(9.1, 3.9),
      new THREE.MeshBasicMaterial({ map: this.gsScreenTex })
    );
    screenMesh.position.set(ax, 3.6, az - 3.41);
    screenMesh.userData = {
      clickable: true,
      isGameShowScreen: true,
      englishName: 'English Game Show Screen'
    };
    this.gsGroup.add(screenMesh);
    this.world.clickableObjects.push(screenMesh);

    this.gsScreenBox = { minX: ax - 4.8, maxX: ax + 4.8, minZ: az - 4.0, maxZ: az - 3.2, tag: 'gameshow_screen' };

    const padsCfg = [
      { key: 'A', x: ax - 4.2, color: 0x2563eb, hexStr: '#3b82f6' },
      { key: 'B', x: ax,       color: 0x9333ea, hexStr: '#a855f7' },
      { key: 'C', x: ax + 4.2, color: 0x059669, hexStr: '#10b981' }
    ];

    padsCfg.forEach(p => {
      const padMat = new THREE.MeshStandardMaterial({
        color: p.color,
        emissive: p.color,
        emissiveIntensity: 0.45,
        roughness: 0.35
      });
      const padMesh = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.12, 3.2), padMat);
      padMesh.position.set(p.x, 0.16, az + 0.8);

      const lc = document.createElement('canvas');
      lc.width = 128; lc.height = 128;
      const lctx = lc.getContext('2d');
      lctx.fillStyle = p.hexStr;
      lctx.fillRect(0, 0, 128, 128);
      lctx.strokeStyle = '#ffffff';
      lctx.lineWidth = 8;
      lctx.strokeRect(4, 4, 120, 120);
      lctx.fillStyle = '#ffffff';
      lctx.font = '900 76px Inter, sans-serif';
      lctx.textAlign = 'center';
      lctx.textBaseline = 'middle';
      lctx.fillText(p.key, 64, 68);

      const labelPlate = new THREE.Mesh(
        new THREE.PlaneGeometry(2.8, 2.8),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(lc) })
      );
      labelPlate.rotation.x = -Math.PI / 2;
      labelPlate.position.set(p.x, 0.23, az + 0.8);

      this.gsGroup.add(padMesh, labelPlate);
      this.gsPads[p.key] = { mesh: padMesh, mat: padMat, x: p.x, z: az + 0.8, baseColor: p.color };
    });

    this.world.exteriorGroup.add(this.gsGroup);
    this.desenharTelaoIdle();
  }

  desenharTelaoIdle(msgTopo = '🎤 LIVE ENGLISH GAME SHOW', sub = 'Click this screen or open 📱 Phone → Game Show to start!') {
    const ctx = this.gsScreenCtx;
    if (!ctx) return;
    ctx.fillStyle = '#090d1e';
    ctx.fillRect(0, 0, 1024, 460);
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, 1010, 446);

    ctx.fillStyle = '#fde047';
    ctx.font = '900 48px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(msgTopo, 512, 140);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '700 28px Inter, sans-serif';
    ctx.fillText(sub, 512, 235);

    ctx.fillStyle = '#34d399';
    ctx.font = '800 26px Inter, sans-serif';
    ctx.fillText(`Step on Platform A, B or C to win +${GAMESHOW_CONFIG.PREMIO_ACERTO_DRX} DRX!`, 512, 330);

    this.gsScreenTex.needsUpdate = true;
  }

  desenharTelaoPergunta() {
    const ctx = this.gsScreenCtx;
    const q = this.gsCurrentQ;
    if (!ctx || !q) return;

    const segs = Math.max(0, Math.ceil(this.gsTimer));
    ctx.fillStyle = '#0b1120';
    ctx.fillRect(0, 0, 1024, 460);
    ctx.strokeStyle = segs <= 3 ? '#ef4444' : '#38bdf8';
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, 1010, 446);

    ctx.fillStyle = segs <= 3 ? '#f87171' : '#fde047';
    ctx.font = '900 32px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`⏱️ ${segs}s remaining`, 42, 62);

    ctx.fillStyle = '#a78bfa';
    ctx.textAlign = 'right';
    ctx.fillText(`🔥 Streak: ${this.gsStreak}`, 982, 62);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 34px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(q.q, 512, 138);

    const opts = [
      { key: 'A', txt: q.a, bg: '#1d4ed8', y: 205 },
      { key: 'B', txt: q.b, bg: '#7e22ce', y: 285 },
      { key: 'C', txt: q.c, bg: '#047857', y: 365 }
    ];

    opts.forEach(o => {
      ctx.fillStyle = o.bg;
      ctx.fillRect(64, o.y, 896, 62);
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 26px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${o.key})  ${o.txt}`, 92, o.y + 40);
    });

    this.gsScreenTex.needsUpdate = true;
  }

  irParaGameShowEIniciar() {
    if (!this.world?.localPlayer) return;
    this.world.sairDeQualquerAmbienteFechado?.();

    const p = this.world.localPlayer;
    const distArena = Math.hypot(p.x - GAMESHOW_CONFIG.ARENA_X, p.z - GAMESHOW_CONFIG.ARENA_Z);
    if (distArena > 10) {
      p.x = GAMESHOW_CONFIG.ARENA_X;
      p.z = GAMESHOW_CONFIG.ARENA_Z + 4.4;
      p.y = 0;
      p.rotY = Math.PI;
      p.targetX = null;
      p.targetZ = null;
      this.world.cameraYaw = 0;
      this.world.enviarMinhaPosicaoServidor?.();
    }

    this.iniciarRodadaGameShow();
  }

  iniciarRodadaGameShow() {
    if (this.gsRunning) return;

    let idx = Math.floor(Math.random() * GAMESHOW_QUESTIONS.length);
    if (idx === this.gsLastIndex) idx = (idx + 1) % GAMESHOW_QUESTIONS.length;
    this.gsLastIndex = idx;

    this.gsCurrentQ = GAMESHOW_QUESTIONS[idx];
    this.gsTimer = GAMESHOW_CONFIG.TEMPO_PERGUNTA_SEG;
    this.gsRunning = true;

    Object.values(this.gsPads).forEach(pad => {
      pad.mat.color.setHex(pad.baseColor);
      pad.mat.emissive.setHex(pad.baseColor);
      pad.mat.emissiveIntensity = 0.55;
    });

    this.desenharTelaoPergunta();
    this.world.falarTextoNPC?.(`${this.gsCurrentQ.q}`, 'street');

    if (window.Workspace?.mostrarAviso) {
      window.Workspace.mostrarAviso('🎤 Game Show Started! Run onto Platform A, B or C before time runs out!', 'info', 3500);
    }
  }

  obterPlataformaDoJogador() {
    const p = this.world?.localPlayer;
    if (!p || this.world.modoInterior || this.world.torreAtual) return null;
    for (const [key, pad] of Object.entries(this.gsPads)) {
      if (Math.abs(p.x - pad.x) <= 1.75 && Math.abs(p.z - pad.z) <= 1.75) {
        return key;
      }
    }
    return null;
  }

  async avaliarRodadaGameShow() {
    this.gsRunning = false;
    const q = this.gsCurrentQ;
    if (!q) return;

    const escolha = this.obterPlataformaDoJogador();
    const correta = q.correct;

    Object.entries(this.gsPads).forEach(([k, pad]) => {
      const cor = k === correta ? 0x22c55e : 0x7f1d1d;
      pad.mat.color.setHex(cor);
      pad.mat.emissive.setHex(cor);
      pad.mat.emissiveIntensity = k === correta ? 1.4 : 0.25;
    });

    if (escolha === correta) {
      this.gsStreak++;
      let premio = GAMESHOW_CONFIG.PREMIO_ACERTO_DRX;
      if (this.gsStreak % 3 === 0) premio += GAMESHOW_CONFIG.BONUS_SEQUENCIA_DRX;

      this.desenharTelaoIdle(`✅ CORRECT! Answer: ${correta}`, `Awesome! You earned +${premio} DRX! Click screen for next round.`);
      this.world.falarTextoNPC?.(`Correct! Platform ${correta} wins! Great job!`, 'street');
      this.world.interacoesPro?.dispararEmote?.('jump', false);
      await window.DOVRYX?.add(premio, `Game Show (${this.gsStreak}x Streak)`);
    } else {
      this.gsStreak = 0;
      const msg = escolha ? `You stepped on ${escolha}. Correct answer was ${correta}!` : `Time is up! Correct answer was ${correta}!`;
      this.desenharTelaoIdle(`❌ ANSWER WAS ${correta}`, `${msg} Click screen to try again!`);
      this.world.falarTextoNPC?.(`Time is up! The right answer was ${correta}. Try the next question!`, 'street');
    }
  }

  // ============================================================================
  // 2. 🏡 ZONA INTERNA DA CASA / APARTAMENTO + INTELIGÊNCIA DE PAREDE E CANTO
  // ============================================================================
  obterZonaPorChave(zoneKey) {
    const w = this.world;
    if (!zoneKey) return null;

    if (zoneKey === 'lot_0') {
      return {
        zoneKey: 'lot_0',
        label: '🏡 Inside My House',
        isHouse: true,
        isTower: false,
        y: 0.35,
        minX: -30.15,
        maxX: -23.85,
        minZ: 30.85,
        maxZ: 37.15,
        doorX: -27.0,
        doorZ: 30.85,
        obstacles: []
      };
    }

    if (w?.torresResidenciais && zoneKey.includes('_floor_')) {
      const [torreId, floorStr] = zoneKey.split('_floor_');
      const torre = w.torresResidenciais.get(torreId);
      const andar = parseInt(floorStr, 10) || 1;
      if (torre) {
        return {
          zoneKey,
          label: `🏢 ${torre.nome} (Floor ${andar})`,
          isHouse: false,
          isTower: true,
          y: (andar - 1) * torre.alturaAndar,
          minX: torre.x - torre.largura / 2 + 0.50,
          maxX: torre.x + torre.largura / 2 - 0.50,
          minZ: torre.z - torre.profundidade / 2 + 0.50,
          maxZ: torre.z + torre.profundidade / 2 - 0.50,
          obstacles: [
            { minX: torre.x - 1.15, maxX: torre.x + 1.15, minZ: torre.z - 0.88, maxZ: torre.z + 1.35 },
            { minX: torre.x + 1.15, maxX: torre.x + 5.05, minZ: torre.z - 0.75, maxZ: torre.z + 0.75 }
          ]
        };
      }
    }

    return null;
  }

  obterZonaDecoravelAtual() {
    const w = this.world;
    if (!w?.localPlayer) return null;

    if (w.torreAtual) {
      const andar = w.andarTorreAtual || 1;
      return this.obterZonaPorChave(`${w.torreAtual}_floor_${andar}`);
    }

    if (!w.modoInterior) {
      const p = w.localPlayer;
      if (p.x >= -33.5 && p.x <= -20.5 && p.z >= 27.5 && p.z <= 40.5) {
        return this.obterZonaPorChave('lot_0');
      }
    }

    return null;
  }

  obterAlturaPisoAtual() {
    const zona = this.obterZonaDecoravelAtual();
    if (zona) return zona.y;
    return this.world?.localPlayer?.y || 0;
  }

  jogadorEstaDentroDaCasa() {
    const p = this.world?.localPlayer;
    if (!p || this.world.modoInterior || this.world.torreAtual) return false;
    return p.x >= -30.1 && p.x <= -23.9 && p.z >= 31.1 && p.z <= 37.0;
  }

  entrarNaCasaParaDecorar() {
    const p = this.world?.localPlayer;
    if (!p) return;
    this.world.sairDeQualquerAmbienteFechado?.();
    if (this.world.currentVehicle) this.world.desmontarVeiculo?.();

    p.x = -27.0;
    p.z = 32.35;
    p.y = 0;
    p.rotY = 0;
    p.targetX = null;
    p.targetZ = null;
    this.world.cameraYaw = Math.PI;
    this.world.enviarMinhaPosicaoServidor?.();
  }

  calcularOrientacaoInteligente(zona, x, z, cfg, rotYAtual = 0) {
    if (!zona || !cfg || cfg.cornerMode === 'none') return rotYAtual;

    const limiar = GAMESHOW_CONFIG.DIST_SNAP_PAREDE;
    const raioBase = Math.max(cfg.w || 0.8, cfg.d || 0.8) * 0.5;

    const dWest = x - zona.minX;
    const dEast = zona.maxX - x;
    const dNorth = z - zona.minZ;
    const dSouth = zona.maxZ - z;

    let nearWest = dWest <= raioBase + limiar;
    let nearEast = dEast <= raioBase + limiar;
    let nearNorth = dNorth <= raioBase + limiar;
    let nearSouth = dSouth <= raioBase + limiar;

    if (nearWest && nearEast) {
      if (dWest <= dEast) nearEast = false; else nearWest = false;
    }
    if (nearNorth && nearSouth) {
      if (dNorth <= dSouth) nearSouth = false; else nearNorth = false;
    }

    const emCanto = (nearWest || nearEast) && (nearNorth || nearSouth);

    if (emCanto) {
      if (cfg.cornerMode === 'diagonal') {
        if (nearWest && nearNorth) return Math.PI / 4;
        if (nearEast && nearNorth) return -Math.PI / 4;
        if (nearWest && nearSouth) return (3 * Math.PI) / 4;
        if (nearEast && nearSouth) return -(3 * Math.PI) / 4;
      }

      const distX = nearWest ? dWest : dEast;
      const distZ = nearNorth ? dNorth : dSouth;
      const pertoDaPortaNorte = Boolean(zona.isHouse && nearNorth && Math.abs(x - zona.doorX) < 1.8);

      if (pertoDaPortaNorte || distX < distZ) {
        return nearWest ? Math.PI / 2 : -Math.PI / 2;
      }
      return nearNorth ? 0 : Math.PI;
    }

    if (nearNorth) return 0;
    if (nearSouth) return Math.PI;
    if (nearWest)  return Math.PI / 2;
    if (nearEast)  return -Math.PI / 2;

    return rotYAtual;
  }

  limitarComColisoes(zona, rawX, rawZ, cfg, rotY) {
    if (this.world?.colisoesPro?.ajustarPosicaoMovelNoComodo) {
      return this.world.colisoesPro.ajustarPosicaoMovelNoComodo(zona, rawX, rawZ, cfg, rotY);
    }
    const cos = Math.abs(Math.cos(rotY));
    const sin = Math.abs(Math.sin(rotY));
    const halfW = ((cfg.w || 0.8) * cos + (cfg.d || 0.8) * sin) * 0.5 + 0.05;
    const halfD = ((cfg.w || 0.8) * sin + (cfg.d || 0.8) * cos) * 0.5 + 0.05;
    return {
      x: Math.max(zona.minX + halfW, Math.min(zona.maxX - halfW, rawX)),
      z: Math.max(zona.minZ + halfD, Math.min(zona.maxZ - halfD, rawZ))
    };
  }

  // ============================================================================
  // 3. 🎨 MODELOS 3D REALISTAS DOS 12 MÓVEIS + EFEITO ACESO AO SELECIONAR
  // ============================================================================
  criarTexturaTelaTV() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 288;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 512, 288);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.55, '#1e3a8a');
    grad.addColorStop(1, '#312e81');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 288);

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(0, 0, 512, 46);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 22px Inter, sans-serif';
    ctx.fillText('ENGLISH+ STREAM', 22, 31);
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText('4K UHD', 425, 30);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 30px Inter, sans-serif';
    ctx.fillText('LONDON STORIES', 26, 118);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 16px Inter, sans-serif';
    ctx.fillText('Season 2 • Episode 4 • English Subtitles', 26, 148);

    const cardColors = ['#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];
    cardColors.forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.fillRect(26 + i * 118, 182, 104, 78);
      ctx.fillStyle = 'rgba(15,23,42,0.45)';
      ctx.fillRect(26 + i * 118, 232, 104, 28);
    });

    return new this.THREE.CanvasTexture(c);
  }

  criarTexturaMonitorPC() {
    const c = document.createElement('canvas');
    c.width = 384; c.height = 224;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 384, 224);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(10, 10, 105, 204);
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(126, 10, 248, 56);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillText('WorkSpace English', 140, 44);
    ctx.fillStyle = '#334155';
    ctx.fillRect(126, 78, 248, 54);
    ctx.fillRect(126, 144, 248, 70);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(20, 28, 84, 14);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(20, 56, 72, 10);
    ctx.fillRect(20, 78, 80, 10);
    ctx.fillRect(20, 100, 64, 10);
    return new this.THREE.CanvasTexture(c);
  }

  criarTexturaTapete() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 384;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#f5f0e6';
    ctx.fillRect(0, 0, 512, 384);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 18;
    ctx.strokeRect(20, 20, 472, 344);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 6;
    ctx.strokeRect(42, 42, 428, 300);

    ctx.strokeStyle = 'rgba(51, 65, 85, 0.28)';
    ctx.lineWidth = 4;
    for (let x = 90; x <= 422; x += 66) {
      for (let y = 96; y <= 288; y += 64) {
        ctx.beginPath();
        ctx.moveTo(x, y - 24);
        ctx.lineTo(x + 26, y);
        ctx.lineTo(x, y + 24);
        ctx.lineTo(x - 26, y);
        ctx.closePath();
        ctx.stroke();
      }
    }
    return new this.THREE.CanvasTexture(c);
  }

  criarAnelSelecaoMovel() {
    const THREE = this.THREE;
    const ringGeo = new THREE.RingGeometry(0.68, 0.90, 36);
    ringGeo.rotateX(-Math.PI / 2);
    this.selectionRing = new THREE.Mesh(
      ringGeo,
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.92 })
    );
    this.selectionRing.visible = false;
    this.world.scene.add(this.selectionRing);
  }

  aplicarBrilhoMovel(mesh, aceso, intensidade = 0.68) {
    if (!mesh) return;
    mesh.traverse(obj => {
      if (!obj.isMesh || !obj.material) return;
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach(m => {
        if (!m || !m.emissive) return;
        if (!m.userData._esOrigEmissive) {
          m.userData._esOrigEmissive = {
            hex: m.emissive.getHex(),
            intensity: typeof m.emissiveIntensity === 'number' ? m.emissiveIntensity : 1
          };
        }
        if (aceso) {
          m.emissive.setHex(0x38bdf8);
          m.emissiveIntensity = intensidade;
        } else {
          m.emissive.setHex(m.userData._esOrigEmissive.hex);
          m.emissiveIntensity = m.userData._esOrigEmissive.intensity;
        }
      });
    });
  }

  criarMeshMovel3D(typeId) {
    const THREE = this.THREE;
    const g = new THREE.Group();

    const matWalnut = new THREE.MeshStandardMaterial({ color: 0x5c341d, roughness: 0.62, metalness: 0.05 });
    const matOak = new THREE.MeshStandardMaterial({ color: 0xb67b43, roughness: 0.68, metalness: 0.04 });
    const matFabric = new THREE.MeshStandardMaterial({ color: 0x3b4d71, roughness: 0.90 });
    const matFabricLight = new THREE.MeshStandardMaterial({ color: 0x4c6088, roughness: 0.92 });
    const matCream = new THREE.MeshStandardMaterial({ color: 0xf8f6f0, roughness: 0.78 });
    const matDark = new THREE.MeshStandardMaterial({ color: 0x18202c, roughness: 0.35, metalness: 0.35 });
    const matChrome = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.85, roughness: 0.2 });
    const matBrass = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.78, roughness: 0.25 });

    switch (typeId) {
      case 'sofa': {
        [[-0.84, -0.34], [0.84, -0.34], [-0.84, 0.34], [0.84, 0.34]].forEach(([lx, lz]) => {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.022, 0.14, 10), matWalnut);
          leg.position.set(lx, 0.07, lz);
          g.add(leg);
        });
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.14, 0.82), matWalnut);
        plinth.position.set(0, 0.20, 0);

        [-0.54, 0, 0.54].forEach(cx => {
          const seat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.16, 0.64), matFabricLight);
          seat.position.set(cx, 0.35, 0.06);
          const backCush = new THREE.Mesh(new THREE.BoxGeometry(0.51, 0.42, 0.18), matFabricLight);
          backCush.position.set(cx, 0.62, -0.22);
          backCush.rotation.x = -0.14;
          g.add(seat, backCush);
        });

        const backFrame = new THREE.Mesh(new THREE.BoxGeometry(1.90, 0.64, 0.14), matFabric);
        backFrame.position.set(0, 0.56, -0.36);
        [-0.86, 0.86].forEach(ax => {
          const arm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.44, 0.84), matFabric);
          arm.position.set(ax, 0.44, 0);
          const armTop = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.84, 10), matFabricLight);
          armTop.rotation.x = Math.PI / 2;
          armTop.position.set(ax, 0.66, 0);
          g.add(arm, armTop);
        });

        const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.30, 0.11), new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.9 }));
        p1.position.set(-0.62, 0.55, -0.06); p1.rotation.set(-0.2, 0.28, 0.14);
        const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.28, 0.11), new THREE.MeshStandardMaterial({ color: 0x14b8a6, roughness: 0.9 }));
        p2.position.set(0.62, 0.54, -0.06); p2.rotation.set(-0.2, -0.25, -0.12);

        g.add(plinth, backFrame, p1, p2);
        break;
      }

      case 'bed': {
        [[-0.78, -0.96], [0.78, -0.96], [-0.78, 0.96], [0.78, 0.96]].forEach(([lx, lz]) => {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.08), matWalnut);
          leg.position.set(lx, 0.08, lz);
          g.add(leg);
        });
        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.70, 0.20, 2.06), matWalnut);
        frame.position.set(0, 0.24, 0);

        const headboard = new THREE.Mesh(new THREE.BoxGeometry(1.72, 1.05, 0.11), matWalnut);
        headboard.position.set(0, 0.62, -1.0);
        const headPad = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.66, 0.07), new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 }));
        headPad.position.set(0, 0.72, -0.93);

        const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.24, 1.94), matCream);
        mattress.position.set(0, 0.44, 0.02);

        const duvet = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.26, 1.32), new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.9 }));
        duvet.position.set(0, 0.46, 0.34);

        const sheetFold = new THREE.Mesh(new THREE.BoxGeometry(1.63, 0.09, 0.22), matCream);
        sheetFold.position.set(0, 0.56, -0.24);

        const runner = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.04, 0.36), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 }));
        runner.position.set(0, 0.59, 0.72);

        [-0.38, 0.38].forEach(px => {
          const pil = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), matCream);
          pil.scale.set(1.15, 0.36, 0.75);
          pil.position.set(px, 0.64, -0.68);
          pil.rotation.x = 0.22;
          g.add(pil);
        });

        g.add(frame, headboard, headPad, mattress, duvet, sheetFold, runner);
        break;
      }

      case 'tv_stand': {
        [[-0.68, -0.18], [0.68, -0.18], [-0.68, 0.18], [0.68, 0.18]].forEach(([lx, lz]) => {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.018, 0.14, 8), matDark);
          leg.position.set(lx, 0.07, lz);
          g.add(leg);
        });
        const rack = new THREE.Mesh(new THREE.BoxGeometry(1.50, 0.40, 0.46), matWalnut);
        rack.position.set(0, 0.34, 0);
        const topPlate = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.04, 0.48), matOak);
        topPlate.position.set(0, 0.55, 0);

        [-0.48, 0.48].forEach(dx => {
          const door = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.32, 0.03), matOak);
          door.position.set(dx, 0.34, 0.23);
          const handle = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.02, 0.03), matBrass);
          handle.position.set(dx, 0.42, 0.255);
          g.add(door, handle);
        });
        const niche = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.28, 0.05), matDark);
        niche.position.set(0, 0.34, 0.22);
        const soundbar = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.06, 0.09), matDark);
        soundbar.position.set(0, 0.60, 0.12);

        const baseStand = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.03, 0.20), matChrome);
        baseStand.position.set(0, 0.585, -0.02);
        const neck = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.16, 0.05), matChrome);
        neck.position.set(0, 0.67, -0.04);

        const tvBezel = new THREE.Mesh(new THREE.BoxGeometry(1.34, 0.78, 0.055), matDark);
        tvBezel.position.set(0, 1.08, -0.02);
        const tvTex = this.criarTexturaTelaTV();
        const screen = new THREE.Mesh(
          new THREE.PlaneGeometry(1.26, 0.70),
          new THREE.MeshBasicMaterial({ map: tvTex })
        );
        screen.position.set(0, 1.08, 0.012);

        g.add(rack, topPlate, niche, soundbar, baseStand, neck, tvBezel, screen);
        break;
      }

      case 'table': {
        const top = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.07, 0.96), matOak);
        top.position.set(0, 0.76, 0);
        const apron = new THREE.Mesh(new THREE.BoxGeometry(1.26, 0.08, 0.80), matWalnut);
        apron.position.set(0, 0.69, 0);

        [[-0.60, -0.38], [0.60, -0.38], [-0.60, 0.38], [0.60, 0.38]].forEach(([lx, lz]) => {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.026, 0.72, 10), matWalnut);
          leg.position.set(lx, 0.36, lz);
          g.add(leg);
        });

        const runner = new THREE.Mesh(new THREE.BoxGeometry(1.43, 0.012, 0.28), matCream);
        runner.position.set(0, 0.80, 0);

        const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.09, 0.08, 14), matChrome);
        bowl.position.set(0, 0.84, 0);
        const fruit1 = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
        fruit1.position.set(-0.04, 0.89, 0.02);
        const fruit2 = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), new THREE.MeshStandardMaterial({ color: 0x22c55e }));
        fruit2.position.set(0.04, 0.89, -0.02);

        g.add(top, apron, runner, bowl, fruit1, fruit2);
        break;
      }

      case 'chair': {
        [[-0.21, -0.21], [0.21, -0.21], [-0.21, 0.21], [0.21, 0.21]].forEach(([lx, lz]) => {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.018, 0.45, 8), matWalnut);
          leg.position.set(lx, 0.225, lz);
          g.add(leg);
        });
        const seatBase = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.05, 0.48), matWalnut);
        seatBase.position.set(0, 0.46, 0);
        const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.055, 0.44), matFabricLight);
        cushion.position.set(0, 0.505, 0.01);

        [-0.20, 0.20].forEach(px => {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.024, 0.52, 8), matWalnut);
          post.position.set(px, 0.72, -0.21);
          post.rotation.x = -0.08;
          g.add(post);
        });
        [0.72, 0.92].forEach(ry => {
          const slat = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.09, 0.035), matOak);
          slat.position.set(0, ry, -0.22);
          g.add(slat);
        });

        g.add(seatBase, cushion);
        break;
      }

      case 'desk_pc': {
        const top = new THREE.Mesh(new THREE.BoxGeometry(1.34, 0.055, 0.68), matOak);
        top.position.set(0, 0.75, 0);

        [-0.28, 0.28].forEach(lz => {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.73, 0.05), matDark);
          leg.position.set(-0.58, 0.365, lz);
          g.add(leg);
        });
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.56), matDark);
        bar.position.set(-0.58, 0.14, 0);

        const drawerBox = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.72, 0.62), matWalnut);
        drawerBox.position.set(0.44, 0.36, 0);
        [0.16, 0.38, 0.58].forEach(dy => {
          const front = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.17, 0.025), matOak);
          front.position.set(0.44, dy, 0.315);
          const pull = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.018, 0.025), matChrome);
          pull.position.set(0.44, dy, 0.335);
          g.add(front, pull);
        });

        const monBase = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.025, 0.16), matChrome);
        monBase.position.set(-0.12, 0.79, -0.15);
        const monNeck = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.04), matChrome);
        monNeck.position.set(-0.12, 0.87, -0.18);
        const monFrame = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.40, 0.04), matDark);
        monFrame.position.set(-0.12, 1.07, -0.16);
        const pcTex = this.criarTexturaMonitorPC();
        const monScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.34), new THREE.MeshBasicMaterial({ map: pcTex }));
        monScreen.position.set(-0.12, 1.07, -0.138);

        const pad = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.008, 0.28), matDark);
        pad.position.set(-0.08, 0.782, 0.14);
        const kb = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.022, 0.14), new THREE.MeshStandardMaterial({ color: 0x334155 }));
        kb.position.set(-0.16, 0.795, 0.14);
        const mouse = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), matDark);
        mouse.scale.set(0.85, 0.55, 1.3);
        mouse.position.set(0.16, 0.795, 0.15);
        const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.095, 12), matCream);
        mug.position.set(0.46, 0.825, 0.14);

        g.add(top, bar, drawerBox, monBase, monNeck, monFrame, monScreen, pad, kb, mouse, mug);
        break;
      }

      case 'bookshelf': {
        const backPanel = new THREE.Mesh(new THREE.BoxGeometry(1.12, 1.78, 0.04), matWalnut);
        backPanel.position.set(0, 0.89, -0.18);
        [-0.54, 0.54].forEach(sx => {
          const side = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.80, 0.40), matWalnut);
          side.position.set(sx, 0.90, 0);
          g.add(side);
        });

        [0.08, 0.50, 0.92, 1.34, 1.76].forEach(sy => {
          const board = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.045, 0.39), matOak);
          board.position.set(0, sy, 0);
          g.add(board);
        });

        const coresLivros = [0xdc2626, 0x2563eb, 0x059669, 0xd97706, 0x7c3aed, 0x0891b2, 0x475569];
        [0.52, 0.94, 1.36].forEach((baseY, rowIdx) => {
          let curX = -0.45;
          for (let b = 0; b < 8; b++) {
            const bw = 0.07 + ((rowIdx + b) % 3) * 0.022;
            const bh = 0.24 + ((rowIdx * 2 + b) % 4) * 0.032;
            const book = new THREE.Mesh(
              new THREE.BoxGeometry(bw, bh, 0.24),
              new THREE.MeshStandardMaterial({ color: coresLivros[(rowIdx * 3 + b) % coresLivros.length], roughness: 0.72 })
            );
            book.position.set(curX + bw * 0.5, baseY + bh * 0.5, 0.02);
            if (b === 7 && rowIdx === 1) {
              book.rotation.z = -0.22;
              book.position.x += 0.05;
            }
            g.add(book);
            curX += bw + 0.015;
            if (curX > 0.42) break;
          }
        });

        const globeBase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.04, 10), matBrass);
        globeBase.position.set(0.28, 1.80, 0.02);
        const globe = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.4 }));
        globe.position.set(0.28, 1.94, 0.02);

        g.add(backPanel, globeBase, globe);
        break;
      }

      case 'plant': {
        const potMat = new THREE.MeshStandardMaterial({ color: 0xb4532a, roughness: 0.75 });
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.16, 0.42, 16), potMat);
        pot.position.y = 0.21;
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.028, 8, 18), potMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 0.41;
        const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.04, 14), new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 1 }));
        soil.position.y = 0.39;

        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.036, 0.48, 8), new THREE.MeshStandardMaterial({ color: 0x4d331f }));
        stem.position.y = 0.62;

        const leafDark = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.78 });
        const leafLight = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.80 });
        for (let i = 0; i < 8; i++) {
          const ang = (i / 8) * Math.PI * 2;
          const alto = i % 2 === 0;
          const leaf = new THREE.Mesh(new THREE.SphereGeometry(alto ? 0.17 : 0.14, 10, 8), alto ? leafDark : leafLight);
          leaf.scale.set(0.85, 0.32, 1.45);
          leaf.position.set(Math.sin(ang) * 0.18, alto ? 0.86 : 0.68, Math.cos(ang) * 0.18);
          leaf.rotation.set(0.45, ang, 0);
          g.add(leaf);
        }
        const topLeaf = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), leafLight);
        topLeaf.scale.set(1.0, 0.65, 1.0);
        topLeaf.position.y = 0.98;

        g.add(pot, rim, soil, stem, topLeaf);
        break;
      }

      case 'lamp': {
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.22, 0.045, 18), matBrass);
        base.position.y = 0.022;
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, 1.46, 12), matBrass);
        pole.position.y = 0.75;
        const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.08, 12), matBrass);
        collar.position.y = 1.45;
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), new THREE.MeshBasicMaterial({ color: 0xfffbeb }));
        bulb.position.y = 1.54;
        const shade = new THREE.Mesh(
          new THREE.CylinderGeometry(0.16, 0.27, 0.36, 20, 1, true),
          new THREE.MeshStandardMaterial({
            color: 0xfef3c7,
            emissive: 0xfde047,
            emissiveIntensity: 0.72,
            roughness: 0.6,
            side: THREE.DoubleSide
          })
        );
        shade.position.y = 1.60;

        g.add(base, pole, collar, bulb, shade);
        break;
      }

      case 'fridge': {
        const matInox = new THREE.MeshStandardMaterial({ color: 0xdbe2ea, metalness: 0.58, roughness: 0.24 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.80, 1.80, 0.70), matInox);
        body.position.set(0, 0.92, -0.02);

        const baseGrille = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.08, 0.70), matDark);
        baseGrille.position.set(0, 0.04, -0.01);

        const upperDoor = new THREE.Mesh(new THREE.BoxGeometry(0.78, 1.08, 0.06), matInox);
        upperDoor.position.set(0, 1.24, 0.35);
        const lowerDoor = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.58, 0.06), matInox);
        lowerDoor.position.set(0, 0.38, 0.35);

        const dispenser = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.30, 0.03), matDark);
        dispenser.position.set(0.06, 1.18, 0.375);
        const dispLed = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.015), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
        dispLed.position.set(0.06, 1.28, 0.392);

        const handle1 = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.52, 8), matChrome);
        handle1.position.set(-0.30, 1.18, 0.415);
        const handle2 = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.36, 8), matChrome);
        handle2.position.set(-0.30, 0.42, 0.415);

        g.add(body, baseGrille, upperDoor, lowerDoor, dispenser, dispLed, handle1, handle2);
        break;
      }

      case 'rug': {
        const rugTex = this.criarTexturaTapete();
        const rug = new THREE.Mesh(
          new THREE.BoxGeometry(2.18, 0.024, 1.48),
          new THREE.MeshStandardMaterial({ map: rugTex, roughness: 0.96 })
        );
        rug.position.y = 0.014;
        g.add(rug);
        break;
      }

      case 'guitar': {
        const standBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.05, 12), matDark);
        standBase.position.y = 0.025;
        const standBack = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.58, 8), matDark);
        standBack.position.set(0, 0.31, -0.10);
        standBack.rotation.x = 0.14;

        const guitarGrp = new THREE.Group();
        guitarGrp.position.set(0, 0.10, 0.02);
        guitarGrp.rotation.x = -0.14;

        const lowerBout = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.10, 18), matOak);
        lowerBout.rotation.x = Math.PI / 2;
        lowerBout.position.set(0, 0.22, 0);

        const upperBout = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.10, 16), matOak);
        upperBout.rotation.x = Math.PI / 2;
        upperBout.position.set(0, 0.44, 0);

        const soundhole = new THREE.Mesh(new THREE.CircleGeometry(0.062, 16), matDark);
        soundhole.position.set(0, 0.36, 0.053);

        const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.032, 0.02), matWalnut);
        bridge.position.set(0, 0.21, 0.055);

        const neck = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.54, 0.032), matWalnut);
        neck.position.set(0, 0.78, 0.01);

        const headstock = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.14, 0.028), matWalnut);
        headstock.position.set(0, 1.10, 0.01);

        [-0.05, 0.05].forEach(tx => {
          [1.06, 1.10, 1.14].forEach(ty => {
            const peg = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6), matBrass);
            peg.position.set(tx, ty, 0.01);
            guitarGrp.add(peg);
          });
        });

        guitarGrp.add(lowerBout, upperBout, soundhole, bridge, neck, headstock);
        g.add(standBase, standBack, guitarGrp);
        break;
      }

      default: {
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), matOak);
        box.position.y = 0.4;
        g.add(box);
      }
    }

    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return g;
  }

  descartarMeshMovel(mesh) {
    if (!mesh) return;
    mesh.traverse(obj => {
      if (obj.geometry) { try { obj.geometry.dispose(); } catch (e) {} }
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach(m => {
          if (m?.map) { try { m.map.dispose(); } catch (e) {} }
          if (m?.dispose) { try { m.dispose(); } catch (e) {} }
        });
      }
    });
  }

  // ============================================================================
  // 4. 💾 PERSISTÊNCIA LOCAL (MÓVEIS NA CENA + DEPÓSITO DO PROPRIETÁRIO)
  // ============================================================================
  obterChaveStorageMoveis() {
    const uid = this.world?.localPlayer?.userId || window.Workspace?.usuario?.id || 'guest';
    return `es3d_custom_furniture_${uid}`;
  }

  obterChaveDepositoMoveis() {
    const uid = this.world?.localPlayer?.userId || window.Workspace?.usuario?.id || 'guest';
    return `es3d_furniture_storage_${uid}`;
  }

  salvarMoveisLocal() {
    try {
      const dados = this.placedItems.map(it => ({
        uid: it.uid,
        typeId: it.typeId,
        zoneKey: it.zoneKey,
        x: Math.round(it.x * 100) / 100,
        y: Math.round(it.y * 100) / 100,
        z: Math.round(it.z * 100) / 100,
        rotY: Math.round(it.rotY * 100) / 100
      }));
      localStorage.setItem(this.obterChaveStorageMoveis(), JSON.stringify(dados));
    } catch (e) {}
  }

  salvarDepositoLocal() {
    try {
      localStorage.setItem(this.obterChaveDepositoMoveis(), JSON.stringify(this.storageItems));
    } catch (e) {}
    this.renderizarConteudoPainel();
  }

  carregarMoveisSalvos() {
    try {
      const lista = JSON.parse(localStorage.getItem(this.obterChaveStorageMoveis()) || '[]');
      if (!Array.isArray(lista)) return;
      let corrigiuAlgum = false;

      lista.forEach(item => {
        const cfg = FURNITURE_CATALOG.find(c => c.id === item.typeId);
        const zona = this.obterZonaPorChave(item.zoneKey);
        if (cfg && zona) {
          const ajustado = this.limitarComColisoes(zona, item.x, item.z, cfg, item.rotY || 0);
          if (Math.abs(ajustado.x - item.x) > 0.01 || Math.abs(ajustado.z - item.z) > 0.01 || item.y !== zona.y) {
            item.x = ajustado.x;
            item.z = ajustado.z;
            item.y = zona.y;
            corrigiuAlgum = true;
          }
        }
        this.instanciarMovelNaCena(item, false);
      });

      if (corrigiuAlgum) this.salvarMoveisLocal();
    } catch (e) {}
  }

  carregarDepositoSalvo() {
    try {
      const lista = JSON.parse(localStorage.getItem(this.obterChaveDepositoMoveis()) || '[]');
      this.storageItems = Array.isArray(lista) ? lista : [];
    } catch (e) {
      this.storageItems = [];
    }
  }

  instanciarMovelNaCena(itemData, salvar = true) {
    const cfg = FURNITURE_CATALOG.find(c => c.id === itemData.typeId);
    if (!cfg || !this.furnitureGroup) return null;

    const mesh = this.criarMeshMovel3D(cfg.id);
    mesh.position.set(itemData.x, itemData.y || 0, itemData.z);
    mesh.rotation.y = itemData.rotY || 0;

    const ud = {
      clickable: true,
      isCustomFurniture: true,
      furnitureUid: itemData.uid,
      englishName: cfg.name,
      furniturePhrase: cfg.phrase
    };
    mesh.userData = { ...mesh.userData, ...ud };
    mesh.traverse(ch => { if (ch.isMesh) ch.userData = { ...ch.userData, ...ud }; });

    this.furnitureGroup.add(mesh);
    this.world.clickableObjects.push(mesh);

    const registro = { ...itemData, cfg, mesh };
    this.placedItems.push(registro);

    if (salvar) this.salvarMoveisLocal();
    return registro;
  }

  // 👁️ SPAWN NA FRENTE DA VISÃO REAL DO AVATAR / CÂMERA (SEMPRE DENTRO DO CÔMODO)
  colocarMovelNaFrenteDoAvatar(cfg, uidExistente = null) {
    let zona = this.obterZonaDecoravelAtual();
    if (!zona) {
      this.entrarNaCasaParaDecorar();
      zona = this.obterZonaDecoravelAtual();
    } else if (zona.isHouse && !this.jogadorEstaDentroDaCasa()) {
      this.entrarNaCasaParaDecorar();
    }
    if (!zona) return null;

    const p = this.world.localPlayer;
    // Direção exata para onde a câmera/visão do jogador está olhando
    const yawVisao = this.world.cameraYaw || 0;
    const visX = -Math.sin(yawVisao);
    const visZ = -Math.cos(yawVisao);

    // Alinha o avatar para encarar o ponto onde o móvel vai surgir
    p.rotY = Math.atan2(visX, visZ);
    if (p.mesh) p.mesh.rotation.y = p.rotY;

    const distFrente = Math.max(1.45, (cfg.d || 0.8) * 0.65 + 0.85);
    const rawX = p.x + visX * distFrente;
    const rawZ = p.z + visZ * distFrente;

    // Começa voltado de frente para o jogador, respeitando paredes/cantos se nascer encostado
    const angParaJogador = Math.atan2(p.x - rawX, p.z - rawZ);
    const rotBase = Math.round(angParaJogador / (Math.PI / 2)) * (Math.PI / 2);

    const limIni = this.limitarComColisoes(zona, rawX, rawZ, cfg, rotBase);
    const rotFinal = this.calcularOrientacaoInteligente(zona, limIni.x, limIni.z, cfg, rotBase);
    const posFinal = this.limitarComColisoes(zona, limIni.x, limIni.z, cfg, rotFinal);

    const novo = this.instanciarMovelNaCena({
      uid: uidExistente || ('furn_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)),
      typeId: cfg.id,
      zoneKey: zona.zoneKey,
      x: posFinal.x,
      y: zona.y,
      z: posFinal.z,
      rotY: rotFinal
    }, true);

    if (novo) {
      this.selecionarMovel(novo.uid);
      this.world.falarTextoNPC?.(cfg.phrase, 'home');
      if (window.Workspace?.mostrarAviso) {
        window.Workspace.mostrarAviso(`✨ ${cfg.name} aceso na sua frente! Clique, segure e arraste para posicionar.`, 'info', 3000);
      }
    }
    return novo;
  }

  async comprarEColocarMovel(typeId) {
    const cfg = FURNITURE_CATALOG.find(c => c.id === typeId);
    if (!cfg) return;

    const pagou = window.DOVRYX ? await window.DOVRYX.spend(cfg.price, cfg.name) : true;
    if (!pagou) return;

    this.colocarMovelNaFrenteDoAvatar(cfg);
  }

  colocarMovelDoDeposito(typeId) {
    const idx = this.storageItems.findIndex(it => it.typeId === typeId);
    if (idx === -1) return;

    const cfg = FURNITURE_CATALOG.find(c => c.id === typeId);
    if (!cfg) return;

    const guardado = this.storageItems[idx];
    const colocado = this.colocarMovelNaFrenteDoAvatar(cfg, guardado.uid);
    if (colocado) {
      this.storageItems.splice(idx, 1);
      this.salvarDepositoLocal();
    }
  }

  // 💡 SELECIONA E ACENDE O MÓVEL PARA MOVIMENTAÇÃO POR ARRASTE (MOUSE/DEDO)
  selecionarMovel(uid) {
    // Apaga o brilho do móvel anteriormente aceso
    if (this.selectedUid) {
      const anterior = this.placedItems.find(it => it.uid === this.selectedUid);
      if (anterior?.mesh) this.aplicarBrilhoMovel(anterior.mesh, false);
    }

    this.selectedUid = uid;
    this.isDraggingFurniture = false;
    const item = this.placedItems.find(it => it.uid === uid);

    if (item?.mesh) {
      this.aplicarBrilhoMovel(item.mesh, true, 0.72);
    }

    if (this.selectionRing) {
      if (item) {
        const raio = Math.max(0.68, Math.max(item.cfg?.w || 0.8, item.cfg?.d || 0.8) * 0.60);
        this.selectionRing.scale.set(raio, 1, raio);
        this.selectionRing.position.set(item.x, (item.y || 0) + 0.04, item.z);
        this.selectionRing.visible = true;
      } else {
        this.selectionRing.visible = false;
      }
    }

    if (this.dragBarEl) {
      if (item) {
        const titleEl = this.dragBarEl.querySelector('#es-drag-bar-title');
        if (titleEl) titleEl.textContent = `✨ ${item.cfg.emoji} ${item.cfg.name} aceso — Segure e arraste`;
        this.dragBarEl.style.display = 'flex';
      } else {
        this.dragBarEl.style.display = 'none';
      }
    }
  }

  moverMovelSelecionadoPara(nx, nz, usarInteligenciaCanto = true, salvarAgora = true) {
    const item = this.placedItems.find(it => it.uid === this.selectedUid);
    const zona = this.obterZonaPorChave(item?.zoneKey) || this.obterZonaDecoravelAtual();
    if (!item || !zona) return;

    const rotAlvo = usarInteligenciaCanto
      ? this.calcularOrientacaoInteligente(zona, nx, nz, item.cfg, item.rotY || 0)
      : (item.rotY || 0);

    const posSegura = this.limitarComColisoes(zona, nx, nz, item.cfg, rotAlvo);

    item.x = posSegura.x;
    item.z = posSegura.z;
    item.y = zona.y;
    item.rotY = rotAlvo;
    item.mesh.position.set(item.x, item.y, item.z);
    item.mesh.rotation.y = item.rotY;

    if (this.selectionRing) {
      this.selectionRing.position.set(item.x, item.y + 0.04, item.z);
    }
    if (salvarAgora) this.salvarMoveisLocal();
  }

  girarMovelSelecionado() {
    const item = this.placedItems.find(it => it.uid === this.selectedUid);
    const zona = this.obterZonaPorChave(item?.zoneKey) || this.obterZonaDecoravelAtual();
    if (!item || !zona) return;

    item.rotY = (item.rotY || 0) + Math.PI / 4;
    const posSegura = this.limitarComColisoes(zona, item.x, item.z, item.cfg, item.rotY);
    item.x = posSegura.x;
    item.z = posSegura.z;
    item.mesh.position.set(item.x, item.y || 0, item.z);
    item.mesh.rotation.y = item.rotY;

    if (this.selectionRing) {
      this.selectionRing.position.set(item.x, (item.y || 0) + 0.04, item.z);
    }
    this.salvarMoveisLocal();
  }

  guardarMovelSelecionado() {
    const idx = this.placedItems.findIndex(it => it.uid === this.selectedUid);
    if (idx === -1) return;

    const item = this.placedItems[idx];
    this.aplicarBrilhoMovel(item.mesh, false);
    this.furnitureGroup?.remove(item.mesh);
    const cIdx = this.world.clickableObjects.indexOf(item.mesh);
    if (cIdx > -1) this.world.clickableObjects.splice(cIdx, 1);
    this.descartarMeshMovel(item.mesh);

    this.placedItems.splice(idx, 1);
    this.storageItems.push({
      uid: item.uid,
      typeId: item.typeId,
      storedAt: Date.now()
    });

    this.selecionarMovel(null);
    this.salvarMoveisLocal();
    this.salvarDepositoLocal();

    if (window.Workspace?.mostrarAviso) {
      window.Workspace.mostrarAviso(`📦 ${item.cfg?.name || 'Móvel'} guardado na aba 📦 Guardados!`, 'info', 2800);
    }
  }

  async removerMovelSelecionado() {
    const idx = this.placedItems.findIndex(it => it.uid === this.selectedUid);
    if (idx === -1) return;

    const item = this.placedItems[idx];
    this.aplicarBrilhoMovel(item.mesh, false);
    this.furnitureGroup?.remove(item.mesh);
    const cIdx = this.world.clickableObjects.indexOf(item.mesh);
    if (cIdx > -1) this.world.clickableObjects.splice(cIdx, 1);
    this.descartarMeshMovel(item.mesh);

    this.placedItems.splice(idx, 1);
    this.selecionarMovel(null);
    this.salvarMoveisLocal();

    const reembolso = Math.round((item.cfg?.price || 20) * 0.5);
    await window.DOVRYX?.add(reembolso, `Sold ${item.cfg?.name || 'Furniture'}`);
  }

  // ============================================================================
  // 5. 🖐️ MOTOR DE ARRASTE DIRETO COM MOUSE OU DEDO (SEGURAR E MOVER)
  // ============================================================================
  obterPontoNoPisoPorEvento(e, domCanvas, raycaster, mouse, alturaY) {
    const rect = domCanvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, this.world.camera);

    const floorPlane = new this.THREE.Plane(new this.THREE.Vector3(0, 1, 0), -alturaY);
    const pt = new this.THREE.Vector3();
    return raycaster.ray.intersectPlane(floorPlane, pt) ? pt : null;
  }

  aoIniciarArrasteMovel(e, domCanvas, raycaster, mouse) {
    if (!this.selectedUid || !this.world?.camera) return false;
    const item = this.placedItems.find(it => it.uid === this.selectedUid);
    if (!item || !item.mesh?.visible) return false;

    const rect = domCanvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, this.world.camera);

    const alvos = [item.mesh];
    if (this.selectionRing?.visible) alvos.push(this.selectionRing);
    const hits = raycaster.intersectObjects(alvos, true);
    if (hits.length === 0) return false;

    const zona = this.obterZonaPorChave(item.zoneKey) || this.obterZonaDecoravelAtual();
    const alturaY = zona ? zona.y : (item.y || 0);
    const pt = this.obterPontoNoPisoPorEvento(e, domCanvas, raycaster, mouse, alturaY);
    if (!pt) return false;

    this.isDraggingFurniture = true;
    this._dragOffsetX = item.x - pt.x;
    this._dragOffsetZ = item.z - pt.z;
    domCanvas.style.cursor = 'grabbing';
    return true;
  }

  aoMoverArrasteMovel(e, domCanvas, raycaster, mouse) {
    if (!this.isDraggingFurniture || !this.selectedUid) return false;
    const item = this.placedItems.find(it => it.uid === this.selectedUid);
    if (!item) return false;

    const zona = this.obterZonaPorChave(item.zoneKey) || this.obterZonaDecoravelAtual();
    const alturaY = zona ? zona.y : (item.y || 0);
    const pt = this.obterPontoNoPisoPorEvento(e, domCanvas, raycaster, mouse, alturaY);
    if (!pt) return true;

    this.moverMovelSelecionadoPara(pt.x + this._dragOffsetX, pt.z + this._dragOffsetZ, true, false);
    return true;
  }

  aoFinalizarArrasteMovel(domCanvas = null) {
    if (!this.isDraggingFurniture) return false;
    this.isDraggingFurniture = false;
    if (domCanvas) domCanvas.style.cursor = '';
    this.salvarMoveisLocal();
    return true;
  }

  // ============================================================================
  // 6. 🎨 UI DO CATÁLOGO/DEPÓSITO + BARRA FLUTUANTE DO MÓVEL ACESO
  // ============================================================================
  alternarModoConstrutor(forcarAbrir = null) {
    const querAbrir = forcarAbrir !== null ? Boolean(forcarAbrir) : !this.builderActive;

    if (querAbrir) {
      const zona = this.obterZonaDecoravelAtual();
      if (!zona || (zona.isHouse && !this.jogadorEstaDentroDaCasa())) {
        this.entrarNaCasaParaDecorar();
      }
    }

    this.builderActive = querAbrir;
    const btn = document.getElementById('es-city-decorate-btn');
    if (btn) btn.innerHTML = this.builderActive ? '✅ Done Decorating' : '🛋️ Decorate';

    if (this.panelEl) {
      this.panelEl.style.display = this.builderActive ? 'flex' : 'none';
      const title = document.getElementById('es-builder-zone-label');
      const zonaAtual = this.obterZonaDecoravelAtual();
      if (title) title.textContent = zonaAtual ? zonaAtual.label : '🏡 Inside My House';
      if (this.builderActive) this.renderizarConteudoPainel();
    }

    if (!this.builderActive) {
      this.selecionarMovel(null);
    }
  }

  mudarAbaConstrutor(aba) {
    this.activeTab = aba === 'storage' ? 'storage' : 'buy';
    this.renderizarConteudoPainel();
  }

  renderizarConteudoPainel() {
    if (!this.panelEl) return;

    const tabBuy = this.panelEl.querySelector('#es-tab-buy');
    const tabStorage = this.panelEl.querySelector('#es-tab-storage');
    const grid = this.panelEl.querySelector('#es-builder-grid');
    const hint = this.panelEl.querySelector('#es-builder-hint');
    if (!grid) return;

    const totalGuardados = this.storageItems.length;
    if (tabStorage) tabStorage.textContent = `📦 Guardados (${totalGuardados})`;

    if (tabBuy && tabStorage) {
      tabBuy.style.background = this.activeTab === 'buy' ? '#2563eb' : '#1e293b';
      tabBuy.style.color = this.activeTab === 'buy' ? '#fff' : '#94a3b8';
      tabStorage.style.background = this.activeTab === 'storage' ? '#7c3aed' : '#1e293b';
      tabStorage.style.color = this.activeTab === 'storage' ? '#fff' : '#94a3b8';
    }

    if (this.activeTab === 'buy') {
      if (hint) hint.textContent = 'Toque em um item para colocar na sua frente. Para mover depois, dê DUPLO CLIQUE rápido no móvel e arraste:';

      const contGuardados = {};
      this.storageItems.forEach(s => { contGuardados[s.typeId] = (contGuardados[s.typeId] || 0) + 1; });

      grid.innerHTML = FURNITURE_CATALOG.map(c => {
        const qtdG = contGuardados[c.id] || 0;
        return `
          <button type="button" data-buy-furn="${c.id}" style="position:relative; background:#1e293b; border:1px solid #334155; border-radius:10px; padding:8px 6px; color:#f8fafc; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:2px; transition:0.15s;">
            ${qtdG > 0 ? `<span style="position:absolute; top:4px; right:4px; background:#7c3aed; color:#fff; font-size:9px; font-weight:900; padding:1px 5px; border-radius:999px;">📦${qtdG}</span>` : ''}
            <span style="font-size:20px;">${c.emoji}</span>
            <span style="font-size:10.5px; font-weight:800; text-align:center;">${c.name}</span>
            <span style="font-size:10px; font-weight:900; color:#facc15;">${c.price} DRX</span>
          </button>
        `;
      }).join('');

      grid.querySelectorAll('[data-buy-furn]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.world.garantirAudioAtivo?.();
          this.comprarEColocarMovel(btn.dataset.buyFurn);
        });
      });
    } else {
      if (hint) hint.textContent = 'Móveis pertencentes a você (clique para colocar na sua frente de graça):';

      if (totalGuardados === 0) {
        grid.innerHTML = `
          <div style="grid-column:1/-1; text-align:center; padding:22px 10px; background:rgba(30,41,59,0.65); border:1px dashed #475569; border-radius:12px; color:#94a3b8; font-size:11.5px; line-height:1.45;">
            📦 Seu depósito está vazio.<br><br>
            Dê <b>duplo clique rápido</b> em um móvel da casa para acendê-lo e clique em <b>📦 Guardar</b>.
          </div>
        `;
        return;
      }

      const agrupado = new Map();
      this.storageItems.forEach(s => {
        agrupado.set(s.typeId, (agrupado.get(s.typeId) || 0) + 1);
      });

      grid.innerHTML = Array.from(agrupado.entries()).map(([typeId, qtd]) => {
        const cfg = FURNITURE_CATALOG.find(c => c.id === typeId);
        if (!cfg) return '';
        return `
          <button type="button" data-place-stored="${cfg.id}" style="position:relative; background:#1e1b4b; border:1px solid #7c3aed; border-radius:10px; padding:8px 6px; color:#f8fafc; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:2px; transition:0.15s;">
            <span style="position:absolute; top:4px; right:5px; background:#10b981; color:#fff; font-size:9.5px; font-weight:900; padding:1px 6px; border-radius:999px;">x${qtd}</span>
            <span style="font-size:20px;">${cfg.emoji}</span>
            <span style="font-size:10.5px; font-weight:800; text-align:center;">${cfg.name}</span>
            <span style="font-size:10px; font-weight:900; color:#34d399;">Colocar (Grátis)</span>
          </button>
        `;
      }).join('');

      grid.querySelectorAll('[data-place-stored]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.world.garantirAudioAtivo?.();
          this.colocarMovelDoDeposito(btn.dataset.placeStored);
        });
      });
    }
  }

  criarPainelConstrutorUI() {
    document.getElementById('es-builder-panel')?.remove();
    const wrapper = document.getElementById('es-city-wrapper');
    if (!wrapper) return;

    const panel = document.createElement('div');
    panel.id = 'es-builder-panel';
    panel.style.cssText = `
      display: none; position: absolute; left: 14px; top: 82px; z-index: 34;
      width: 266px; max-width: calc(100vw - 28px); max-height: calc(100dvh - 180px);
      background: rgba(12, 16, 32, 0.95); backdrop-filter: blur(18px);
      border: 1.5px solid rgba(96, 165, 250, 0.45); border-radius: 18px;
      padding: 12px; flex-direction: column; gap: 9px; color: #fff;
      box-shadow: 0 18px 45px rgba(0,0,0,0.55); font-family: Inter, sans-serif;
    `;

    panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:13px; font-weight:900; color:#93c5fd;">🛋️ Home Decorator</div>
          <div id="es-builder-zone-label" style="font-size:10.5px; color:#94a3b8;">🏡 Inside My House</div>
        </div>
        <button type="button" id="es-builder-close" style="background:#1e293b;color:#cbd5e1;border:none;width:28px;height:28px;border-radius:50%;font-weight:800;cursor:pointer;">✕</button>
      </div>

      <div style="display:flex; gap:6px;">
        <button type="button" id="es-tab-buy" style="flex:1; padding:7px 8px; border-radius:10px; border:none; background:#2563eb; color:#fff; font-size:11px; font-weight:800; cursor:pointer;">🛒 Loja</button>
        <button type="button" id="es-tab-storage" style="flex:1; padding:7px 8px; border-radius:10px; border:none; background:#1e293b; color:#94a3b8; font-size:11px; font-weight:800; cursor:pointer;">📦 Guardados (0)</button>
      </div>

      <div id="es-builder-hint" style="font-size:10.5px; color:#cbd5e1; line-height:1.35;"></div>

      <div id="es-builder-grid" style="overflow-y:auto; display:grid; grid-template-columns:1fr 1fr; gap:6px; padding-right:2px;"></div>
    `;

    wrapper.appendChild(panel);
    this.panelEl = panel;

    panel.querySelector('#es-builder-close')?.addEventListener('click', () => this.alternarModoConstrutor(false));
    panel.querySelector('#es-tab-buy')?.addEventListener('click', () => this.mudarAbaConstrutor('buy'));
    panel.querySelector('#es-tab-storage')?.addEventListener('click', () => this.mudarAbaConstrutor('storage'));

    this.renderizarConteudoPainel();
  }

  criarBarraFlutuanteMovelAcesoUI() {
    document.getElementById('es-furniture-drag-bar')?.remove();
    const wrapper = document.getElementById('es-city-wrapper');
    if (!wrapper) return;

    const bar = document.createElement('div');
    bar.id = 'es-furniture-drag-bar';
    bar.style.cssText = `
      display: none; position: absolute; left: 50%; bottom: 88px; transform: translateX(-50%);
      z-index: 36; background: rgba(12, 18, 36, 0.94); backdrop-filter: blur(16px);
      border: 1.5px solid rgba(56, 189, 248, 0.65); border-radius: 18px; padding: 8px 12px;
      flex-direction: column; align-items: center; gap: 7px; color: #fff;
      box-shadow: 0 14px 35px rgba(0,0,0,0.55); font-family: Inter, sans-serif;
      max-width: calc(100vw - 24px);
    `;

    bar.innerHTML = `
      <div id="es-drag-bar-title" style="font-size:11.5px; font-weight:900; color:#7dd3fc; text-align:center;">✨ Móvel aceso — Segure e arraste</div>
      <div style="display:flex; gap:6px; flex-wrap:wrap; justify-content:center;">
        <button type="button" id="es-drag-rotate" style="background:#2563eb; color:#fff; border:none; border-radius:999px; padding:6px 12px; font-size:11px; font-weight:800; cursor:pointer;">↻ Girar</button>
        <button type="button" id="es-drag-store"  style="background:#7c3aed; color:#fff; border:none; border-radius:999px; padding:6px 12px; font-size:11px; font-weight:800; cursor:pointer;">📦 Guardar</button>
        <button type="button" id="es-drag-sell"   style="background:#dc2626; color:#fff; border:none; border-radius:999px; padding:6px 12px; font-size:11px; font-weight:800; cursor:pointer;">💰 Vender</button>
        <button type="button" id="es-drag-done"   style="background:#10b981; color:#fff; border:none; border-radius:999px; padding:6px 12px; font-size:11px; font-weight:900; cursor:pointer;">✅ Travar</button>
      </div>
    `;

    wrapper.appendChild(bar);
    this.dragBarEl = bar;

    bar.querySelector('#es-drag-rotate')?.addEventListener('click', () => this.girarMovelSelecionado());
    bar.querySelector('#es-drag-store')?.addEventListener('click', () => this.guardarMovelSelecionado());
    bar.querySelector('#es-drag-sell')?.addEventListener('click', () => this.removerMovelSelecionado());
    bar.querySelector('#es-drag-done')?.addEventListener('click', () => this.selecionarMovel(null));
  }

  // ============================================================================
  // 7. 🔗 CLIQUES, COLISÕES E LOOP
  // ============================================================================
  aoClicarObjeto3D(ud) {
    if (!ud) return false;

    if (ud.isGameShowScreen) {
      this.iniciarRodadaGameShow();
      return true;
    }

    if (ud.isCustomFurniture && ud.furnitureUid) {
      const agora = performance.now();
      const ehDuploClique = (
        this._lastClickUid === ud.furnitureUid &&
        (agora - this._lastClickTime) <= GAMESHOW_CONFIG.DUPLO_CLIQUE_MS
      );

      this._lastClickUid = ud.furnitureUid;
      this._lastClickTime = agora;

      // 🖱️ DUPLO CLIQUE RÁPIDO: Acende o móvel para arrastar direto (ou apaga se já estava aceso!)
      if (ehDuploClique) {
        this._lastClickUid = null;
        this._lastClickTime = 0;

        this.world.interacoesPro?.levantar?.();

        if (this.selectedUid === ud.furnitureUid) {
          this.selecionarMovel(null);
          return true;
        }

        this.selecionarMovel(ud.furnitureUid);
        const itemSel = this.placedItems.find(it => it.uid === ud.furnitureUid);
        if (window.Workspace?.mostrarAviso && itemSel) {
          window.Workspace.mostrarAviso(`✨ ${itemSel.cfg.name} aceso! Clique, segure e arraste para mover.`, 'info', 2600);
        }
        return true;
      }

      // 👆 1 CLIQUE SIMPLES: Apenas interação normal (fala em inglês, salva no Caderno Vivo e senta se não estiver aceso)
      const item = this.placedItems.find(it => it.uid === ud.furnitureUid);
      if (item) {
        this.world.falarTextoNPC?.(item.cfg.phrase, 'home');
        this.world.mostrarBalaoNoBoneco?.(this.world.localPlayer, `${item.cfg.emoji} ${item.cfg.name}`, 3000);
        this.world.smartphone?.registrarPalavra?.(item.cfg.name, 'home');

        if (!this.selectedUid && (item.typeId === 'sofa' || item.typeId === 'chair') && this.world.interacoesPro) {
          this.world.interacoesPro.sentarNoLocal({
            name: item.cfg.name,
            x: item.x,
            y: item.y || 0,
            z: item.z,
            rotY: item.rotY || 0
          });
        }
        return true;
      }
    }

    return false;
  }

  // Não move mais clicando no chão — movimento é EXCLUSIVAMENTE por clique duplo + segurar e arrastar!
  aoClicarNoChao() {
    return false;
  }

  obterColisoresMoveisAtivos() {
    const boxes = [];
    if (!this.world.modoInterior && !this.world.torreAtual && this.gsScreenBox) {
      boxes.push(this.gsScreenBox);
    }

    const zonaAtual = this.world.torreAtual
      ? `${this.world.torreAtual}_floor_${this.world.andarTorreAtual || 1}`
      : (!this.world.modoInterior ? 'lot_0' : null);

    if (!zonaAtual) return boxes;

    this.placedItems.forEach(it => {
      if (it.zoneKey !== zonaAtual || !it.cfg?.solid) return;
      const cos = Math.abs(Math.cos(it.rotY || 0));
      const sin = Math.abs(Math.sin(it.rotY || 0));
      const effW = it.cfg.w * cos + it.cfg.d * sin;
      const effD = it.cfg.w * sin + it.cfg.d * cos;
      boxes.push({
        minX: it.x - effW / 2,
        maxX: it.x + effW / 2,
        minZ: it.z - effD / 2,
        maxZ: it.z + effD / 2,
        tag: 'custom_furniture'
      });
    });

    return boxes;
  }

  update(delta) {
    const zonaVisivel = this.world.torreAtual
      ? `${this.world.torreAtual}_floor_${this.world.andarTorreAtual || 1}`
      : (!this.world.modoInterior ? 'lot_0' : null);

    this.placedItems.forEach(it => {
      it.mesh.visible = Boolean(zonaVisivel && it.zoneKey === zonaVisivel);
    });

    // Pulso luminoso suave enquanto um móvel está aceso para movimentação
    if (this.selectedUid) {
      const sel = this.placedItems.find(it => it.uid === this.selectedUid);
      if (!sel || !sel.mesh?.visible) {
        this.selecionarMovel(null);
      } else {
        this._glowPhase += delta * 5.2;
        const pulso = 0.58 + Math.sin(this._glowPhase) * 0.22;
        this.aplicarBrilhoMovel(sel.mesh, true, pulso);
        if (this.selectionRing) {
          this.selectionRing.material.opacity = 0.65 + Math.sin(this._glowPhase) * 0.28;
        }
      }
    }

    if (this.builderActive && !this.obterZonaDecoravelAtual()) {
      this.alternarModoConstrutor(false);
    }

    if (this.gsRunning) {
      const segAntes = Math.ceil(this.gsTimer);
      this.gsTimer -= delta;
      const segAgora = Math.ceil(this.gsTimer);

      if (this.gsTimer <= 0) {
        this.avaliarRodadaGameShow();
      } else if (segAgora !== segAntes) {
        this.desenharTelaoPergunta();
      }
    }
  }

  dispose() {
    this.selecionarMovel(null);
    this.builderActive = false;
    this.gsRunning = false;
    this.isDraggingFurniture = false;
    this.panelEl?.remove();
    this.panelEl = null;
    this.dragBarEl?.remove();
    this.dragBarEl = null;

    if (this.selectionRing) {
      this.world.scene?.remove(this.selectionRing);
      this.selectionRing.geometry?.dispose();
      this.selectionRing.material?.dispose();
      this.selectionRing = null;
    }

    if (this.gsScreenTex) {
      try { this.gsScreenTex.dispose(); } catch (e) {}
      this.gsScreenTex = null;
    }

    this.placedItems.forEach(it => this.descartarMeshMovel(it.mesh));
    if (this.furnitureGroup) {
      this.world.scene?.remove(this.furnitureGroup);
      this.furnitureGroup = null;
    }
    this.placedItems = [];
  }
}