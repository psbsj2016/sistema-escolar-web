// js/modulos/workspace/es3d-gameshow-builder.js
// 🎤 Etapa 4: Game Show Ao Vivo na Praça Central + Modo Construtor com 12 Móveis 3D Movimentáveis

// ⚙️ PARÂMETROS AJUSTÁVEIS
const GAMESHOW_CONFIG = {
  ARENA_X: 18,                  // Centro X do palco do Game Show (lado norte da Praça Central)
  ARENA_Z: -115,                // Centro Z das plataformas A, B, C
  TEMPO_PERGUNTA_SEG: 12,       // Tempo (segundos) para correr até a plataforma certa
  PREMIO_ACERTO_DRX: 50,        // DRX por resposta correta no Game Show
  BONUS_SEQUENCIA_DRX: 25,      // Bônus extra a cada 3 acertos seguidos
  PASSO_NUDGE_MOVEL: 0.45       // Distância (metros) que os botões ↑↓←→ movem um móvel
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

// 🛋️ CATÁLOGO DE 12 MÓVEIS E ITENS DE CASA MOVIMENTÁVEIS
const FURNITURE_CATALOG = [
  { id: 'sofa',       emoji: '🛋️', name: 'Modern Sofa',    price: 30, w: 1.9, d: 0.85, solid: true,  phrase: 'This is a comfortable Modern Sofa!' },
  { id: 'bed',        emoji: '🛏️', name: 'Comfy Bed',      price: 50, w: 1.7, d: 2.1,  solid: true,  phrase: 'Time to rest on this Comfy Bed!' },
  { id: 'tv_stand',   emoji: '📺', name: 'Smart TV Stand', price: 65, w: 1.5, d: 0.5,  solid: true,  phrase: 'Let us watch movies in English on the Smart TV!' },
  { id: 'table',      emoji: '🍽️', name: 'Dining Table',   price: 40, w: 1.4, d: 1.0,  solid: true,  phrase: 'Dinner is served on the Dining Table!' },
  { id: 'chair',      emoji: '🪑', name: 'Wooden Chair',   price: 20, w: 0.55, d: 0.55, solid: true, phrase: 'Have a seat on this Wooden Chair!' },
  { id: 'desk_pc',    emoji: '💻', name: 'Study Desk',     price: 60, w: 1.35, d: 0.72, solid: true, phrase: 'Studying English at my Study Desk!' },
  { id: 'bookshelf',  emoji: '📚', name: 'Bookshelf',      price: 45, w: 1.15, d: 0.42, solid: true, phrase: 'This Bookshelf is full of English books!' },
  { id: 'plant',      emoji: '🪴', name: 'Potted Plant',   price: 15, w: 0.48, d: 0.48, solid: true, phrase: 'A fresh Potted Plant makes the room cozy!' },
  { id: 'lamp',       emoji: '💡', name: 'Floor Lamp',     price: 25, w: 0.42, d: 0.42, solid: true, phrase: 'Turn on the Floor Lamp for warm light!' },
  { id: 'fridge',     emoji: '🧊', name: 'Kitchen Fridge', price: 55, w: 0.82, d: 0.78, solid: true, phrase: 'Cold water and fruit inside the Kitchen Fridge!' },
  { id: 'rug',        emoji: '🧶', name: 'Cozy Rug',       price: 20, w: 2.2, d: 1.5,  solid: false, phrase: 'This Cozy Rug looks great on the floor!' },
  { id: 'guitar',     emoji: '🎸', name: 'Acoustic Guitar',price: 35, w: 0.45, d: 0.45, solid: true, phrase: 'Practice songs with this Acoustic Guitar!' }
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

    // Builder / Decoração State
    this.builderActive = false;
    this.furnitureGroup = null;
    this.placedItems = []; // [{ uid, typeId, zoneKey, x, y, z, rotY, mesh }]
    this.selectedUid = null;
    this.selectionRing = null;
    this.panelEl = null;
  }

  init() {
    if (!this.THREE || !this.world?.scene) return;
    this.furnitureGroup = new this.THREE.Group();
    this.furnitureGroup.name = 'CustomFurnitureGroup';
    this.world.scene.add(this.furnitureGroup);

    this.criarAnelSelecaoMovel();
    this.criarArenaGameShow();
    this.carregarMoveisSalvos();
    this.criarPainelConstrutorUI();
  }

  // ============================================================================
  // 1. 🎤 GAME SHOW AO VIVO NA PRAÇA CENTRAL (TELÃO 3D + PLATAFORMAS A, B, C)
  // ============================================================================
  criarArenaGameShow() {
    const THREE = this.THREE;
    if (!this.world?.exteriorGroup) return;

    const ax = GAMESHOW_CONFIG.ARENA_X;
    const az = GAMESHOW_CONFIG.ARENA_Z;

    this.gsGroup = new THREE.Group();

    // Palco base com borda neon
    const stageBase = new THREE.Mesh(
      new THREE.BoxGeometry(14.5, 0.14, 7.6),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7, metalness: 0.2 })
    );
    stageBase.position.set(ax, 0.07, az);
    stageBase.receiveShadow = true;
    this.gsGroup.add(stageBase);

    // Suportes do telão
    const matMetal = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.75, roughness: 0.3 });
    [-4.2, 4.2].forEach(ox => {
      const pilar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 4.6, 12), matMetal);
      pilar.position.set(ax + ox, 2.3, az - 3.6);
      this.gsGroup.add(pilar);
    });

    // Moldura + Telão LED interativo
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

    // Caixa de colisão do telão (impede atravessar a estrutura)
    this.gsScreenBox = { minX: ax - 4.8, maxX: ax + 4.8, minZ: az - 4.0, maxZ: az - 3.2, tag: 'gameshow_screen' };

    // 3 Plataformas Luminosas (A, B, C) no chão
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

      // Letra gigante pintada no chão da plataforma
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

  desenharTelaoIdle(msgTopo = '🎤 LIVE ENGLISH GAME SHOW', sub = 'Click this screen or the 🎤 Game Show button to start!') {
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

    // Cabeçalho com cronômetro e sequência
    ctx.fillStyle = segs <= 3 ? '#f87171' : '#fde047';
    ctx.font = '900 32px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`⏱️ ${segs}s remaining`, 42, 62);

    ctx.fillStyle = '#a78bfa';
    ctx.textAlign = 'right';
    ctx.fillText(`🔥 Streak: ${this.gsStreak}`, 982, 62);

    // Pergunta principal
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 34px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(q.q, 512, 138);

    // 3 opções coloridas alinhadas com as plataformas
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
      p.rotY = Math.PI; // Olha direto para o telão!
      p.targetX = null;
      p.targetZ = null;
      this.world.cameraYaw = 0;
      this.world.enviarMinhaPosicaoServidor?.();
    }

    this.iniciarRodadaGameShow();
  }

  iniciarRodadaGameShow() {
    if (this.gsRunning) return;

    // Sorteia pergunta diferente da anterior
    let idx = Math.floor(Math.random() * GAMESHOW_QUESTIONS.length);
    if (idx === this.gsLastIndex) idx = (idx + 1) % GAMESHOW_QUESTIONS.length;
    this.gsLastIndex = idx;

    this.gsCurrentQ = GAMESHOW_QUESTIONS[idx];
    this.gsTimer = GAMESHOW_CONFIG.TEMPO_PERGUNTA_SEG;
    this.gsRunning = true;

    // Restaura cores das plataformas
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

    // Destaca a plataforma certa de verde brilhante e as outras de vermelho escuro
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
  // 2. 🛋️ MODO CONSTRUTOR & DECORAÇÃO MOVIMENTÁVEL (CASAS E APARTAMENTOS)
  // ============================================================================
  obterZonaDecoravelAtual() {
    const w = this.world;
    if (!w?.localPlayer) return null;

    // 1. Dentro de um apartamento em qualquer uma das 3 Torres Residenciais
    if (w.torreAtual) {
      const torre = w.torresResidenciais?.get(w.torreAtual);
      if (!torre) return null;
      const andar = w.andarTorreAtual || 1;
      return {
        zoneKey: `${w.torreAtual}_floor_${andar}`,
        label: `🏢 ${torre.nome} (Floor ${andar})`,
        y: (andar - 1) * torre.alturaAndar,
        minX: torre.x - torre.largura / 2 + 0.9,
        maxX: torre.x + torre.largura / 2 - 0.9,
        minZ: torre.z - torre.profundidade / 2 + 0.9,
        maxZ: torre.z + torre.profundidade / 2 - 0.9
      };
    }

    // 2. No Lote Residencial do Jogador (Lote #0 centrado em x=-27, z=34)
    if (!w.modoInterior) {
      const p = w.localPlayer;
      if (p.x >= -34 && p.x <= -20 && p.z >= 25 && p.z <= 42) {
        return {
          zoneKey: 'lot_0',
          label: '🏡 My House & Garden Lot',
          y: (w.houseStage >= 1 && Math.abs(p.x + 27) < 3.4 && Math.abs(p.z - 34) < 3.4) ? 0.35 : 0.02,
          minX: -32.2,
          maxX: -21.8,
          minZ: 28.8,
          maxZ: 39.2
        };
      }
    }

    return null;
  }

  criarAnelSelecaoMovel() {
    const THREE = this.THREE;
    const ringGeo = new THREE.RingGeometry(0.65, 0.85, 28);
    ringGeo.rotateX(-Math.PI / 2);
    this.selectionRing = new THREE.Mesh(
      ringGeo,
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
    );
    this.selectionRing.visible = false;
    this.world.scene.add(this.selectionRing);
  }

  criarMeshMovel3D(typeId) {
    const THREE = this.THREE;
    const g = new THREE.Group();

    const matWood = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.72 });
    const matWoodLight = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.75 });
    const matFabric = new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.88 });
    const matWhite = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.65 });
    const matDark = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.3 });
    const matMetal = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.78, roughness: 0.25 });

    switch (typeId) {
      case 'sofa': {
        const base = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.34, 0.82), matFabric); base.position.y = 0.24;
        const back = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.56, 0.20), matFabric); back.position.set(0, 0.62, -0.31);
        const armL = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.45, 0.82), matFabric); armL.position.set(-0.84, 0.44, 0);
        const armR = armL.clone(); armR.position.x = 0.84;
        const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.14), new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.9 }));
        pillow.position.set(-0.45, 0.52, -0.14); pillow.rotation.z = 0.15;
        g.add(base, back, armL, armR, pillow);
        break;
      }
      case 'bed': {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.28, 2.08), matWood); frame.position.y = 0.18;
        const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.24, 1.98), matWhite); mattress.position.y = 0.42;
        const blanket = new THREE.Mesh(new THREE.BoxGeometry(1.60, 0.26, 1.25), new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.9 }));
        blanket.position.set(0, 0.43, 0.36);
        const headboard = new THREE.Mesh(new THREE.BoxGeometry(1.70, 0.95, 0.14), matWood); headboard.position.set(0, 0.55, -0.98);
        [-0.4, 0.4].forEach(px => {
          const pil = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.14, 0.36), matWhite);
          pil.position.set(px, 0.60, -0.72);
          g.add(pil);
        });
        g.add(frame, mattress, blanket, headboard);
        break;
      }
      case 'tv_stand': {
        const rack = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.52, 0.48), matWood); rack.position.y = 0.26;
        const tvFrame = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.78, 0.08), matDark); tvFrame.position.set(0, 0.98, 0);
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.22, 0.68), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
        screen.position.set(0, 0.98, 0.045);
        const stand = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 0.18), matMetal); stand.position.set(0, 0.56, 0);
        g.add(rack, tvFrame, screen, stand);
        break;
      }
      case 'table': {
        const top = new THREE.Mesh(new THREE.BoxGeometry(1.40, 0.09, 0.96), matWoodLight); top.position.y = 0.78;
        [[-0.6, -0.38], [0.6, -0.38], [-0.6, 0.38], [0.6, 0.38]].forEach(([lx, lz]) => {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.76, 0.08), matWood);
          leg.position.set(lx, 0.38, lz);
          g.add(leg);
        });
        g.add(top);
        break;
      }
      case 'chair': {
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.07, 0.50), matWoodLight); seat.position.y = 0.46;
        const back = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.52, 0.07), matWoodLight); back.position.set(0, 0.74, -0.22);
        [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].forEach(([lx, lz]) => {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.46, 0.06), matWood);
          leg.position.set(lx, 0.23, lz);
          g.add(leg);
        });
        g.add(seat, back);
        break;
      }
      case 'desk_pc': {
        const top = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.07, 0.68), matWoodLight); top.position.y = 0.75;
        [-0.58, 0.58].forEach(lx => {
          const side = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.74, 0.64), matDark);
          side.position.set(lx, 0.37, 0);
          g.add(side);
        });
        const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.38, 0.05), matDark); monitor.position.set(0, 1.05, -0.15);
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.32), new THREE.MeshBasicMaterial({ color: 0x0ea5e9 }));
        screen.position.set(0, 1.05, -0.12);
        const kb = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.025, 0.14), matDark); kb.position.set(0, 0.80, 0.14);
        g.add(top, monitor, screen, kb);
        break;
      }
      case 'bookshelf': {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.12, 1.75, 0.38), matWood); frame.position.y = 0.88;
        const coresLivros = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0xa855f7];
        for (let row = 0; row < 3; row++) {
          for (let b = 0; b < 5; b++) {
            const book = new THREE.Mesh(
              new THREE.BoxGeometry(0.14, 0.30, 0.26),
              new THREE.MeshStandardMaterial({ color: coresLivros[(row + b) % coresLivros.length], roughness: 0.7 })
            );
            book.position.set(-0.36 + b * 0.18, 0.36 + row * 0.50, 0.08);
            g.add(book);
          }
        }
        g.add(frame);
        break;
      }
      case 'plant': {
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.38, 14), new THREE.MeshStandardMaterial({ color: 0x9a5738, roughness: 0.8 }));
        pot.position.y = 0.19;
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.85 });
        const bush1 = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), leafMat); bush1.position.y = 0.58;
        const bush2 = new THREE.Mesh(new THREE.SphereGeometry(0.20, 10, 10), leafMat); bush2.position.set(0.1, 0.80, 0.04);
        g.add(pot, bush1, bush2);
        break;
      }
      case 'lamp': {
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.20, 0.06, 14), matMetal); base.position.y = 0.03;
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 1.48, 10), matMetal); pole.position.y = 0.76;
        const shade = new THREE.Mesh(
          new THREE.CylinderGeometry(0.16, 0.26, 0.32, 16),
          new THREE.MeshStandardMaterial({ color: 0xfef3c7, emissive: 0xfde047, emissiveIntensity: 0.75, roughness: 0.5 })
        );
        shade.position.y = 1.56;
        g.add(base, pole, shade);
        break;
      }
      case 'fridge': {
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.80, 1.78, 0.74), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.45, roughness: 0.28 }));
        body.position.y = 0.89;
        const line = new THREE.Mesh(new THREE.BoxGeometry(0.81, 0.03, 0.75), matDark); line.position.y = 1.24;
        const handle1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.30, 0.06), matMetal); handle1.position.set(-0.28, 1.48, 0.40);
        const handle2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.45, 0.06), matMetal); handle2.position.set(-0.28, 0.92, 0.40);
        g.add(body, line, handle1, handle2);
        break;
      }
      case 'rug': {
        const rug = new THREE.Mesh(
          new THREE.BoxGeometry(2.15, 0.025, 1.45),
          new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.95 })
        );
        rug.position.y = 0.015;
        const inner = new THREE.Mesh(
          new THREE.BoxGeometry(1.75, 0.03, 1.10),
          new THREE.MeshStandardMaterial({ color: 0xc4b5fd, roughness: 0.95 })
        );
        inner.position.y = 0.018;
        g.add(rug, inner);
        break;
      }
      case 'guitar': {
        const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.20, 0.08, 12), matDark); stand.position.y = 0.04;
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.20, 12, 12), matWoodLight);
        body.scale.set(0.95, 1.2, 0.35); body.position.set(0, 0.36, 0);
        const neck = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.56, 0.04), matWood); neck.position.set(0, 0.78, 0);
        g.add(stand, body, neck);
        break;
      }
      default: {
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), matWoodLight);
        box.position.y = 0.4;
        g.add(box);
      }
    }

    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return g;
  }

  obterChaveStorageMoveis() {
    const uid = this.world?.localPlayer?.userId || window.Workspace?.usuario?.id || 'guest';
    return `es3d_custom_furniture_${uid}`;
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

  carregarMoveisSalvos() {
    try {
      const lista = JSON.parse(localStorage.getItem(this.obterChaveStorageMoveis()) || '[]');
      if (!Array.isArray(lista)) return;
      lista.forEach(item => this.instanciarMovelNaCena(item, false));
    } catch (e) {}
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

  async comprarEColocarMovel(typeId) {
    const zona = this.obterZonaDecoravelAtual();
    if (!zona) {
      if (window.Workspace?.mostrarAviso) {
        window.Workspace.mostrarAviso('🏡 Go to your House Lot or inside a Tower Apartment to place furniture!', 'warning', 3500);
      }
      return;
    }

    const cfg = FURNITURE_CATALOG.find(c => c.id === typeId);
    if (!cfg) return;

    const pagou = window.DOVRYX ? await window.DOVRYX.spend(cfg.price, cfg.name) : true;
    if (!pagou) return;

    // Coloca o móvel 1.6m à frente do jogador, respeitando os limites do ambiente
    const p = this.world.localPlayer;
    const rawX = p.x + Math.sin(p.rotY || 0) * 1.6;
    const rawZ = p.z + Math.cos(p.rotY || 0) * 1.6;
    const x = Math.max(zona.minX, Math.min(zona.maxX, rawX));
    const z = Math.max(zona.minZ, Math.min(zona.maxZ, rawZ));

    const novo = this.instanciarMovelNaCena({
      uid: 'furn_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      typeId: cfg.id,
      zoneKey: zona.zoneKey,
      x,
      y: zona.y,
      z,
      rotY: 0
    }, true);

    if (novo) {
      this.selecionarMovel(novo.uid);
      this.world.falarTextoNPC?.(cfg.phrase, 'home');
    }
  }

  selecionarMovel(uid) {
    this.selectedUid = uid;
    const item = this.placedItems.find(it => it.uid === uid);

    if (this.selectionRing) {
      if (item && this.builderActive) {
        this.selectionRing.position.set(item.x, (item.y || 0) + 0.06, item.z);
        this.selectionRing.visible = true;
      } else {
        this.selectionRing.visible = false;
      }
    }

    const controlsBox = document.getElementById('es-builder-selected-controls');
    const nameEl = document.getElementById('es-builder-selected-name');
    if (controlsBox && nameEl) {
      if (item) {
        controlsBox.style.display = 'flex';
        nameEl.textContent = `${item.cfg.emoji} ${item.cfg.name} (Click floor to move!)`;
      } else {
        controlsBox.style.display = 'none';
      }
    }
  }

  moverMovelSelecionadoPara(nx, nz) {
    const item = this.placedItems.find(it => it.uid === this.selectedUid);
    const zona = this.obterZonaDecoravelAtual();
    if (!item || !zona || item.zoneKey !== zona.zoneKey) return;

    item.x = Math.max(zona.minX, Math.min(zona.maxX, nx));
    item.z = Math.max(zona.minZ, Math.min(zona.maxZ, nz));
    item.mesh.position.set(item.x, item.y || 0, item.z);

    if (this.selectionRing) {
      this.selectionRing.position.set(item.x, (item.y || 0) + 0.06, item.z);
    }
    this.salvarMoveisLocal();
  }

  empurrarMovelSelecionado(dx, dz) {
    const item = this.placedItems.find(it => it.uid === this.selectedUid);
    if (!item) return;
    this.moverMovelSelecionadoPara(item.x + dx, item.z + dz);
  }

  girarMovelSelecionado() {
    const item = this.placedItems.find(it => it.uid === this.selectedUid);
    if (!item) return;
    item.rotY = (item.rotY || 0) + Math.PI / 4;
    item.mesh.rotation.y = item.rotY;
    this.salvarMoveisLocal();
  }

  async removerMovelSelecionado() {
    const idx = this.placedItems.findIndex(it => it.uid === this.selectedUid);
    if (idx === -1) return;

    const item = this.placedItems[idx];
    this.furnitureGroup?.remove(item.mesh);
    const cIdx = this.world.clickableObjects.indexOf(item.mesh);
    if (cIdx > -1) this.world.clickableObjects.splice(cIdx, 1);

    this.placedItems.splice(idx, 1);
    this.selecionarMovel(null);
    this.salvarMoveisLocal();

    const reembolso = Math.round((item.cfg?.price || 20) * 0.5);
    await window.DOVRYX?.add(reembolso, `Sold ${item.cfg?.name || 'Furniture'}`);
  }

  alternarModoConstrutor() {
    const zona = this.obterZonaDecoravelAtual();
    if (!this.builderActive && !zona) {
      // Se não está na casa nem num apartamento, leva direto para a frente da casa do jogador!
      this.world.sairDeQualquerAmbienteFechado?.();
      this.world.localPlayer.x = -27;
      this.world.localPlayer.z = 32.2;
      this.world.localPlayer.y = 0;
      this.world.localPlayer.targetX = null;
      this.world.localPlayer.targetZ = null;
      this.world.enviarMinhaPosicaoServidor?.();
    }

    this.builderActive = !this.builderActive;
    const btn = document.getElementById('es-city-decorate-btn');
    if (btn) btn.innerHTML = this.builderActive ? '✅ Done Decorating' : '🛋️ Decorate';

    if (this.panelEl) {
      this.panelEl.style.display = this.builderActive ? 'flex' : 'none';
      const title = document.getElementById('es-builder-zone-label');
      const zonaAtual = this.obterZonaDecoravelAtual();
      if (title) title.textContent = zonaAtual ? zonaAtual.label : '🏡 My House Lot';
    }

    if (!this.builderActive) {
      this.selecionarMovel(null);
    }
  }

  criarPainelConstrutorUI() {
    document.getElementById('es-builder-panel')?.remove();
    const wrapper = document.getElementById('es-city-wrapper');
    if (!wrapper) return;

    const panel = document.createElement('div');
    panel.id = 'es-builder-panel';
    panel.style.cssText = `
      display: none; position: absolute; left: 14px; top: 96px; z-index: 34;
      width: 268px; max-width: calc(100vw - 28px); max-height: calc(100dvh - 190px);
      background: rgba(12, 16, 32, 0.94); backdrop-filter: blur(18px);
      border: 1.5px solid rgba(96, 165, 250, 0.45); border-radius: 18px;
      padding: 12px; flex-direction: column; gap: 10px; color: #fff;
      box-shadow: 0 18px 45px rgba(0,0,0,0.55); font-family: Inter, sans-serif;
    `;

    panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:13px; font-weight:900; color:#93c5fd;">🛋️ Home Decorator</div>
          <div id="es-builder-zone-label" style="font-size:10.5px; color:#94a3b8;">🏡 My House Lot</div>
        </div>
        <button type="button" id="es-builder-close" style="background:#1e293b;color:#cbd5e1;border:none;width:28px;height:28px;border-radius:50%;font-weight:800;cursor:pointer;">✕</button>
      </div>

      <!-- Controles do Móvel Selecionado (Mover, Girar e Apagar) -->
      <div id="es-builder-selected-controls" style="display:none; flex-direction:column; gap:7px; background:rgba(37,99,235,0.18); border:1px solid #3b82f6; border-radius:12px; padding:9px;">
        <div id="es-builder-selected-name" style="font-size:11.5px; font-weight:800; color:#dbeafe; text-align:center;">Selected Item</div>
        <div style="display:flex; justify-content:center; gap:5px;">
          <button type="button" id="es-mv-up"    style="width:32px;height:30px;border-radius:8px;border:none;background:#1e293b;color:#fff;font-weight:900;cursor:pointer;">▲</button>
          <button type="button" id="es-mv-down"  style="width:32px;height:30px;border-radius:8px;border:none;background:#1e293b;color:#fff;font-weight:900;cursor:pointer;">▼</button>
          <button type="button" id="es-mv-left"  style="width:32px;height:30px;border-radius:8px;border:none;background:#1e293b;color:#fff;font-weight:900;cursor:pointer;">◀</button>
          <button type="button" id="es-mv-right" style="width:32px;height:30px;border-radius:8px;border:none;background:#1e293b;color:#fff;font-weight:900;cursor:pointer;">▶</button>
        </div>
        <div style="display:flex; gap:6px;">
          <button type="button" id="es-mv-rotate" style="flex:1;padding:7px;border-radius:8px;border:none;background:#2563eb;color:#fff;font-size:11.5px;font-weight:800;cursor:pointer;">↻ Rotate</button>
          <button type="button" id="es-mv-delete" style="flex:1;padding:7px;border-radius:8px;border:none;background:#dc2626;color:#fff;font-size:11.5px;font-weight:800;cursor:pointer;">🗑️ Sell</button>
        </div>
      </div>

      <div style="font-size:10.5px; color:#cbd5e1;">Click an item below to buy &amp; place, or click any furniture in the room to move it:</div>

      <div style="overflow-y:auto; display:grid; grid-template-columns:1fr 1fr; gap:6px; padding-right:2px;">
        ${FURNITURE_CATALOG.map(c => `
          <button type="button" data-buy-furn="${c.id}" style="background:#1e293b; border:1px solid #334155; border-radius:10px; padding:8px 6px; color:#f8fafc; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:2px; transition:0.15s;">
            <span style="font-size:20px;">${c.emoji}</span>
            <span style="font-size:10.5px; font-weight:800; text-align:center;">${c.name}</span>
            <span style="font-size:10px; font-weight:900; color:#facc15;">${c.price} DRX</span>
          </button>
        `).join('')}
      </div>
    `;

    wrapper.appendChild(panel);
    this.panelEl = panel;

    panel.querySelector('#es-builder-close')?.addEventListener('click', () => this.alternarModoConstrutor());
    panel.querySelector('#es-mv-up')?.addEventListener('click', () => this.empurrarMovelSelecionado(0, -GAMESHOW_CONFIG.PASSO_NUDGE_MOVEL));
    panel.querySelector('#es-mv-down')?.addEventListener('click', () => this.empurrarMovelSelecionado(0, GAMESHOW_CONFIG.PASSO_NUDGE_MOVEL));
    panel.querySelector('#es-mv-left')?.addEventListener('click', () => this.empurrarMovelSelecionado(-GAMESHOW_CONFIG.PASSO_NUDGE_MOVEL, 0));
    panel.querySelector('#es-mv-right')?.addEventListener('click', () => this.empurrarMovelSelecionado(GAMESHOW_CONFIG.PASSO_NUDGE_MOVEL, 0));
    panel.querySelector('#es-mv-rotate')?.addEventListener('click', () => this.girarMovelSelecionado());
    panel.querySelector('#es-mv-delete')?.addEventListener('click', () => this.removerMovelSelecionado());

    panel.querySelectorAll('[data-buy-furn]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.world.garantirAudioAtivo?.();
        this.comprarEColocarMovel(btn.dataset.buyFurn);
      });
    });
  }

  // ============================================================================
  // 3. 🔗 INTEGRAÇÃO DE CLIQUES, COLISÕES E LOOP
  // ============================================================================
  aoClicarObjeto3D(ud) {
    if (!ud) return false;

    if (ud.isGameShowScreen) {
      this.iniciarRodadaGameShow();
      return true;
    }

    if (ud.isCustomFurniture && ud.furnitureUid) {
      if (this.builderActive) {
        this.selecionarMovel(ud.furnitureUid);
        return true;
      }
      // Fora do modo construtor: pronuncia a frase em inglês (e senta se for sofá/cadeira!)
      const item = this.placedItems.find(it => it.uid === ud.furnitureUid);
      if (item) {
        this.world.falarTextoNPC?.(item.cfg.phrase, 'home');
        this.world.mostrarBalaoNoBoneco?.(this.world.localPlayer, `${item.cfg.emoji} ${item.cfg.name}`, 3600);
        if ((item.typeId === 'sofa' || item.typeId === 'chair') && this.world.interacoesPro) {
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

  aoClicarNoChao(intersectPt) {
    if (!this.builderActive || !this.selectedUid || !intersectPt) return false;
    this.moverMovelSelecionadoPara(intersectPt.x, intersectPt.z);
    return true;
  }

  // Fornece as caixas sólidas do telão e dos móveis visíveis para o ES3DColisoes
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
    // 1. Mantém visíveis apenas os móveis do ambiente atual (Lote na rua vs Andar da torre)
    const zonaVisivel = this.world.torreAtual
      ? `${this.world.torreAtual}_floor_${this.world.andarTorreAtual || 1}`
      : (!this.world.modoInterior ? 'lot_0' : null);

    this.placedItems.forEach(it => {
      it.mesh.visible = Boolean(zonaVisivel && it.zoneKey === zonaVisivel);
    });

    // Fecha o painel construtor se o jogador sair para longe da casa/torre
    if (this.builderActive && !this.obterZonaDecoravelAtual()) {
      this.alternarModoConstrutor();
    }

    // 2. Cronômetro ao vivo do Game Show
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
    this.builderActive = false;
    this.gsRunning = false;
    this.panelEl?.remove();
    this.panelEl = null;

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

    if (this.furnitureGroup) {
      this.world.scene?.remove(this.furnitureGroup);
      this.furnitureGroup = null;
    }
    this.placedItems = [];
  }
}