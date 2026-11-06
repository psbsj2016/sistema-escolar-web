// js/modulos/workspace/english-spaces-3d.js
// 🏙️ MOTOR DA CIDADE 3D MULTIPLAYER - LIFE RPG EDITION (24 PRÉDIOS + ECONOMIA DOVRYX DRX + GUILDA MAGO + IMOBILIÁRIA + VEÍCULOS + GLB MODELS)

window.Workspace = window.Workspace || {};

const PROXIMITY_RADIUS = 6.0;

// Coordenadas e cores dos 24 Edifícios da Cidade 3D (Avenida Central: col -1 e 1 | Avenidas Laterais: col -3 e 3)
const CITY_BUILDINGS_LAYOUT = [
  { id: 'coffee',          col: -1, row: 0, color: 0xd97706, roof: 0x451a03, npcColor: 0xf59e0b, voiceLang: 'en-US', voicePitch: 1.15 },
  { id: 'restaurant',      col:  1, row: 0, color: 0xe11d48, roof: 0x4c0519, npcColor: 0xfb7185, voiceLang: 'en-US', voicePitch: 0.92 },
  { id: 'school',          col: -1, row: 1, color: 0x16a34a, roof: 0x052e16, npcColor: 0x4ade80, voiceLang: 'en-GB', voicePitch: 0.95 },
  { id: 'shopping',        col:  1, row: 1, color: 0xca8a04, roof: 0x422006, npcColor: 0xfacc15, voiceLang: 'en-US', voicePitch: 1.18 },
  { id: 'home',            col: -1, row: 2, color: 0x475569, roof: 0x1e293b, npcColor: 0x94a3b8, voiceLang: 'en-US', voicePitch: 1.02 },
  { id: 'cinema',          col:  1, row: 2, color: 0xdb2777, roof: 0x500724, npcColor: 0xf472b6, voiceLang: 'en-US', voicePitch: 1.14 },
  { id: 'taxi',            col: -1, row: 3, color: 0xeab308, roof: 0x422006, npcColor: 0xfde047, voiceLang: 'en-US', voicePitch: 0.88 },
  { id: 'beach',           col:  1, row: 3, color: 0x0d9488, roof: 0x042f2e, npcColor: 0x2dd4bf, voiceLang: 'en-US', voicePitch: 1.05 },
  { id: 'hotel',           col: -1, row: 4, color: 0x9333ea, roof: 0x3b0764, npcColor: 0xc084fc, voiceLang: 'en-GB', voicePitch: 1.12 },
  { id: 'airport',         col:  1, row: 4, color: 0x0284c7, roof: 0x082f49, npcColor: 0x38bdf8, voiceLang: 'en-GB', voicePitch: 0.94 },
  { id: 'job',             col: -1, row: 5, color: 0x4f46e5, roof: 0x1e1b4b, npcColor: 0x818cf8, voiceLang: 'en-US', voicePitch: 1.10 },
  { id: 'hospital',        col:  1, row: 5, color: 0x059669, roof: 0x022c22, npcColor: 0x34d399, voiceLang: 'en-GB', voicePitch: 0.90 },
  // SEGUNDA AVENIDA - 12 NOVOS ESTABELECIMENTOS E LIFE RPG
  { id: 'bank',            col: -3, row: 0, color: 0x0f766e, roof: 0x042f2e, npcColor: 0x2dd4bf, voiceLang: 'en-US', voicePitch: 0.88 },
  { id: 'clothing',        col:  3, row: 0, color: 0xec4899, roof: 0x500724, npcColor: 0xf472b6, voiceLang: 'en-US', voicePitch: 1.16 },
  { id: 'shoes',           col: -3, row: 1, color: 0x7c3aed, roof: 0x3b0764, npcColor: 0xc084fc, voiceLang: 'en-GB', voicePitch: 1.08 },
  { id: 'tools',           col:  3, row: 1, color: 0xf59e0b, roof: 0x422006, npcColor: 0xfde047, voiceLang: 'en-US', voicePitch: 0.92 },
  { id: 'petshop',         col: -3, row: 2, color: 0x10b981, roof: 0x022c22, npcColor: 0x34d399, voiceLang: 'en-US', voicePitch: 1.14 },
  { id: 'supermarket',     col:  3, row: 2, color: 0x3b82f6, roof: 0x1e3a8a, npcColor: 0x60a5fa, voiceLang: 'en-US', voicePitch: 1.00 },
  { id: 'pharmacy',        col: -3, row: 3, color: 0x06b6d4, roof: 0x083344, npcColor: 0x22d3ee, voiceLang: 'en-GB', voicePitch: 1.10 },
  { id: 'bookstore',       col:  3, row: 3, color: 0xa16207, roof: 0x422006, npcColor: 0xfacc15, voiceLang: 'en-GB', voicePitch: 0.96 },
  { id: 'real_estate',     col: -3, row: 4, color: 0x7c3aed, roof: 0x2e1065, npcColor: 0xa78bfa, voiceLang: 'en-US', voicePitch: 0.94 },
  { id: 'dealership',      col:  3, row: 4, color: 0xdc2626, roof: 0x450a0a, npcColor: 0xf87171, voiceLang: 'en-US', voicePitch: 0.90 },
  { id: 'building_supply', col: -3, row: 5, color: 0xd97706, roof: 0x78350f, npcColor: 0xfbbf24, voiceLang: 'en-US', voicePitch: 0.92 },
  { id: 'guild_bau',       col:  3, row: 5, color: 0x1e1b4b, roof: 0x312e81, npcColor: 0x818cf8, voiceLang: 'en-GB', voicePitch: 0.88 }
];

const FALLBACK_NEW_SPACES = {
  bank:            { id: 'bank',            name: 'CITY BANK',       emoji: '🏦', npcName: 'Oliver (Banker)',     roles: ['CUSTOMER', 'BANKER'],     missions: [{ id: 'm1', title: 'Open a DRX account', xp: 80 }] },
  clothing:        { id: 'clothing',        name: 'FASHION STORE',   emoji: '👗', npcName: 'Bella (Stylist)',     roles: ['SHOPPER', 'STYLIST'],     missions: [{ id: 'm1', title: 'Buy a new outfit', xp: 80 }] },
  shoes:           { id: 'shoes',           name: 'SNEAKER LAB',     emoji: '👟', npcName: 'Liam (Seller)',       roles: ['SHOPPER', 'SELLER'],      missions: [{ id: 'm1', title: 'Ask for your shoe size', xp: 80 }] },
  tools:           { id: 'tools',           name: 'HARDWARE TOOLS',  emoji: '🔨', npcName: 'Hank (Builder)',      roles: ['CUSTOMER', 'HANDYMAN'],   missions: [{ id: 'm1', title: 'Find a tool for home', xp: 80 }] },
  petshop:         { id: 'petshop',         name: 'PET SHOP',        emoji: '🐾', npcName: 'Daisy (Vet)',         roles: ['PET OWNER', 'VET'],       missions: [{ id: 'm1', title: 'Adopt or feed a pet', xp: 90 }] },
  supermarket:     { id: 'supermarket',     name: 'SUPERMARKET',     emoji: '🛒', npcName: 'Noah (Cashier)',      roles: ['SHOPPER', 'CASHIER'],     missions: [{ id: 'm1', title: 'Buy fresh groceries', xp: 80 }] },
  pharmacy:        { id: 'pharmacy',        name: 'PHARMACY',        emoji: '💊', npcName: 'Grace (Pharmacist)',  roles: ['PATIENT', 'PHARMACIST'],  missions: [{ id: 'm1', title: 'Ask for vitamins', xp: 85 }] },
  bookstore:       { id: 'bookstore',       name: 'BOOKSTORE',       emoji: '📚', npcName: 'Arthur (Librarian)',  roles: ['READER', 'LIBRARIAN'],    missions: [{ id: 'm1', title: 'Choose an English book', xp: 85 }] },
  real_estate:     { id: 'real_estate',     name: 'REAL ESTATE',     emoji: '🏡', npcName: 'Victoria (Broker)',   roles: ['BUYER', 'AGENT'],         missions: [{ id: 'm1', title: 'Upgrade your house lot', xp: 100 }] },
  dealership:      { id: 'dealership',      name: 'AUTO DEALERSHIP', emoji: '🚗', npcName: 'Max (Dealer)',        roles: ['DRIVER', 'DEALER'],       missions: [{ id: 'm1', title: 'Buy a bike, moto or car', xp: 100 }] },
  building_supply: { id: 'building_supply', name: 'BUILDING SUPPLY', emoji: '🧱', npcName: 'Bob (Foreman)',       roles: ['BUILDER', 'SUPPLIER'],    missions: [{ id: 'm1', title: 'Buy bricks and wood', xp: 90 }] },
  guild_bau:       { id: 'guild_bau',       name: 'BAÚ DO INGLÊS',   emoji: '🧙‍♂️', npcName: 'Master Wizard',       roles: ['APPRENTICE', 'MASTER'],   missions: [{ id: 'm1', title: 'Enter the Game Portal', xp: 120 }] }
};

// 💎 SISTEMA UNIFICADO DOVRYX (DRX) - Sincronizado com MongoDB e Baú do Inglês
const DOVRYX = {
  _balance: 1250,
  getBalance() {
    const world = window.Workspace?.EnglishSpaces3D;
    if (world?.parentManager?.progressData && typeof world.parentManager.progressData.xp === 'number') {
      this._balance = world.parentManager.progressData.xp;
    } else if (window.Workspace?.Ingles?.state?.coins && typeof window.Workspace.Ingles.state.coins.bronze === 'number') {
      this._balance = window.Workspace.Ingles.state.coins.bronze;
    }
    return this._balance;
  },
  setBalance(v) {
    const val = Math.max(0, Math.round(Number(v) || 0));
    this._balance = val;
    const world = window.Workspace?.EnglishSpaces3D;
    if (world?.parentManager?.progressData) world.parentManager.progressData.xp = val;
    if (window.Workspace?.Ingles?.state?.coins) window.Workspace.Ingles.state.coins.bronze = val;
    this.atualizarHud();
  },
  async add(amount, reason = '') {
    const qtd = Math.round(Number(amount) || 0);
    const novo = this.getBalance() + qtd;
    this.setBalance(novo);
    if (window.Workspace?.mostrarAviso) {
      window.Workspace.mostrarAviso(`💎 +${qtd} DRX ${reason}`, 'success');
    }
    const world = window.Workspace?.EnglishSpaces3D;
    if (world?.localPlayer) {
      await fetch('/api/workspace/english-spaces/progress/customization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: world.localPlayer.userId, bonusXP: qtd })
      }).catch(() => {});
    }
    return novo;
  },
  async spend(amount, reason = '') {
    const qtd = Math.round(Number(amount) || 0);
    const atual = this.getBalance();
    if (atual < qtd) {
      if (window.Workspace?.mostrarAviso) {
        window.Workspace.mostrarAviso(`🔒 Insufficient DOVRYX! Need ${qtd} DRX, you have ${atual} DRX.`, 'warning');
      }
      return false;
    }
    this.setBalance(atual - qtd);
    if (window.Workspace?.mostrarAviso && reason) {
      window.Workspace.mostrarAviso(`💸 -${qtd} DRX (${reason})`, 'info');
    }
    const world = window.Workspace?.EnglishSpaces3D;
    if (world?.localPlayer) {
      await fetch('/api/workspace/english-spaces/progress/customization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: world.localPlayer.userId, costXP: qtd })
      }).catch(() => {});
    }
    return true;
  },
  atualizarHud() {
    const el = document.getElementById('es-dovryx-hud');
    if (el) el.innerHTML = `💎 ${this.getBalance().toLocaleString('pt-BR')} DRX`;
  }
};
window.DOVRYX = DOVRYX;

class EnglishSpaces3DWorld {
  constructor() {
    this.active = false;
    this.parentManager = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.animFrame = null;
    this.clock = null;

    this.buildingsMeta = [];
    this.buildingMeshes = new Map();
    this.npcs3D = new Map();
    this.otherPlayers3D = new Map();
    this.localPlayer = null;

    this.keys = {};
    this.cameraYaw = 0;
    this.cameraPitch = 0.15;
    this.isDraggingCam = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this._startYaw = 0;
    this._startPitch = 0;

    this.nearbyTargets = [];
    this.currentZoneId = 'street';
    this.lastSyncTime = 0;
    this.sseConnection = null;
    this.pollInterval = null;
    this.dayNightInterval = null;
    this.flightBoardInterval = null;

    this.sunMesh = null;
    this.moonMesh = null;
    this.starsGroup = null;
    this.cloudsGroup = null;
    this.ambientLight = null;
    this.dirLight = null;

    this.cars = [];
    this.avioes = [];
    this.pedestrians = [];
    this.clickableObjects = [];
    this.outdoors = [];
    this.posteLights = [];
    this.audioCtx = null;
    this.lastDoorEnter = null;
    this.footprints = [];
    this.lastFootprint = 0;
    this.vitrines = [];
    this.musician = null;
    this.stickyNotes = [];
    this.cloudStickyNotes = [];
    this.cloudAvatarConfig = null;
    this.communityLots = [];
    this.polaroidCam = null;
    this.flightBoard = null;

    this.exteriorGroup = null;
    this.interiorGroups = new Map();
    this.doors = new Map();
    this.modoInterior = false;
    this.predioAtual = null;
    this.topLeaderText = 'Leader: Paulo - 1,250 DRX';

    this.gltfLoader = null;
    this.gltfLoadedSet = new Set();
    this.animais = { caes: [], gatos: [], passaros: [], passarosGroup: null };
    this.adoptedPet = null;

    // Life RPG: Lotes, Veículos, Trabalhos e Blitz
    this.lotes = [];
    this.houseStage = 1;
    this.materialsCount = 0;
    this.ownedVehicles = ['bicycle'];
    this.currentVehicle = null;
    this.vehicleSpeed = 7.5;
    this.vehicleMesh = null;
    this.speedBumps = [];
    this.trafficSigns = [];
    this.jobs = {};
  }

  formatarNomeCompleto(nomeBruto) {
    const limpo = String(nomeBruto ? nomeBruto : 'Student').replace(/\(@.*\)/, '').trim();
    const partes = limpo.split(/\s+/).filter(Boolean);
    if (partes.length <= 2) return partes.join(' ');
    return `${partes[0]} ${partes[partes.length - 1]}`;
  }

  detetarGeneroPadrao(u) {
    if (this.cloudAvatarConfig && typeof this.cloudAvatarConfig.isFemale === 'boolean') {
      return this.cloudAvatarConfig.isFemale;
    }
    const gen = String((u && (u.genero || u.sexo)) ? (u.genero || u.sexo) : '').toLowerCase();
    if (gen.startsWith('f') || gen.startsWith('m')) return gen.startsWith('f');
    const primeiroNome = String((u && (u.nome || u.login)) ? (u.nome || u.login) : '').trim().split(/\s+/)[0].toLowerCase();
    return primeiroNome.endsWith('a') && !['luca', 'joshua', 'nikola'].includes(primeiroNome);
  }

  async carregarGLTFLoader() {
    if (window.THREE && window.THREE.GLTFLoader) {
      this.gltfLoader = new window.THREE.GLTFLoader();
      return;
    }
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/three@0.128.0/examples/js/loaders/GLTFLoader.js';
      s.onload = () => {
        try { this.gltfLoader = new window.THREE.GLTFLoader(); } catch (e) {}
        resolve();
      };
      s.onerror = () => resolve();
      document.head.appendChild(s);
    });
  }

  async carregarThreeJS() {
    if (window.THREE) {
      await this.carregarGLTFLoader();
      return window.THREE;
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.onload = async () => {
        await this.carregarGLTFLoader();
        resolve(window.THREE);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  garantirAudioAtivo() {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    } catch (e) {}
    return this.audioCtx;
  }

  async carregarEstadoInicialNuvem() {
    const u = window.Workspace?.usuario || {};
    const uid = String(u.id ? u.id : 'demo_user');
    const escolaId = String(u.escolaId ? u.escolaId : 'DEFAULT');
    try {
      const [resProg, resStickies] = await Promise.all([
        fetch(`/api/workspace/english-spaces/progress?userId=${encodeURIComponent(uid)}`, { credentials: 'include' }).then(r => r.json()).catch(() => null),
        fetch(`/api/workspace/english-spaces/world/stickies?escolaId=${encodeURIComponent(escolaId)}`, { credentials: 'include' }).then(r => r.json()).catch(() => null)
      ]);

      if (resProg && resProg.success) {
        const cfg = (resProg.data && resProg.data.avatarConfig) ? resProg.data.avatarConfig : ((resProg.compatibility && resProg.compatibility.avatarConfig) ? resProg.compatibility.avatarConfig : {});
        this.cloudAvatarConfig = cfg;

        if (Array.isArray(resProg.communityLots)) {
          this.communityLots = resProg.communityLots;
        }

        const drxNuvem = typeof resProg.compatibility?.dovryx === 'number'
          ? resProg.compatibility.dovryx
          : (typeof resProg.compatibility?.xp === 'number' ? resProg.compatibility.xp : 1250);
        DOVRYX.setBalance(drxNuvem);

        this.houseStage = typeof cfg.houseStage === 'number' ? cfg.houseStage : 1;
        this.materialsCount = typeof cfg.materialsCount === 'number' ? cfg.materialsCount : 0;
        if (Array.isArray(cfg.ownedVehicles) && cfg.ownedVehicles.length > 0) {
          this.ownedVehicles = cfg.ownedVehicles;
        }

        this.criarLoteamentoResidencial();

        if (this.localPlayer) {
          const femSalvo = typeof cfg.isFemale === 'boolean' ? cfg.isFemale : this.localPlayer.isFemale;
          const corCamisaSalva = typeof cfg.shirtColor === 'number' ? cfg.shirtColor : (femSalvo ? 0xec4899 : 0x8b5cf6);
          const corSapatoSalvo = typeof cfg.shoeColor === 'number' ? cfg.shoeColor : 0x111111;

          this.localPlayer.isFemale = femSalvo;
          this.localPlayer.shirtColor = corCamisaSalva;
          this.localPlayer.shoeColor = corSapatoSalvo;
          this.localPlayer.petType = cfg.petType ? cfg.petType : null;

          const btn = document.getElementById('es-city-gender-btn');
          if (btn) btn.innerHTML = femSalvo ? '👩 Female' : '🧑 Male';

          const oldMesh = this.localPlayer.mesh;
          const newMesh = this.criarBonecoHumano3D(corCamisaSalva, 0x1e1b4b, 0xfde68a, femSalvo);
          if (newMesh.userData?.matSapato) newMesh.userData.matSapato.color.setHex(corSapatoSalvo);
          newMesh.position.set(this.localPlayer.x, 0, this.localPlayer.z);
          newMesh.rotation.y = this.localPlayer.rotY;
          this.scene.remove(oldMesh);
          this.scene.add(newMesh);
          this.localPlayer.mesh = newMesh;

          if (cfg.petType === 'pet_dog' || cfg.petType === 'pet_cat') {
            this.aplicarItemCompradoNoAvatar({ tipo: cfg.petType });
          }
          this.enviarMinhaPosicaoServidor();
        }
      }

      if (resStickies && resStickies.success && Array.isArray(resStickies.notes)) {
        this.cloudStickyNotes = resStickies.notes;
        this.renderizarStickyNotesNoCoffee();
      }
    } catch (e) {}
  }

  async abrirCidade3D(parentManager, initialSpaceId = 'coffee') {
    this.parentManager = parentManager;
    const containerRoot = document.getElementById('english-spaces-root');
    if (!containerRoot) return;

    const u = window.Workspace?.usuario || {};
    const isFemInicial = this.detetarGeneroPadrao(u);

    containerRoot.innerHTML = `
      <style>
        body { overflow: hidden !important; }
        #es-city-wrapper { position: fixed !important; inset: 0 !important; width: 100vw !important; height: 100dvh !important; background: #05070e !important; z-index: 1000020 !important; font-family: 'Inter','Geist','Poppins',sans-serif !important; user-select: none !important; overflow: hidden !important; }
        #es-city-Hud-card, #es-city-teleport, #es-city-chat-feed { position: absolute !important; width: 0 !important; height: 0 !important; overflow: hidden !important; opacity: 0 !important; pointer-events: none !important; }
        #es-city-viewport { position: absolute !important; inset: 0 !important; width: 100vw !important; height: 100dvh !important; z-index: 1 !important; touch-action: none !important; }
        #es-city-viewport canvas { display: block !important; width: 100% !important; height: 100% !important; }
        #es-city-labels-layer { position: absolute; inset: 0; pointer-events: none; z-index: 10; overflow: hidden; }
        .es-ref-top-area { position: absolute; top: 0; left: 0; right: 0; z-index: 30; padding: max(14px, env(safe-area-inset-top)) 18px 0 18px; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
        .es-ref-subbar { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
        #es-city-zone-badge { pointer-events: auto; background: linear-gradient(135deg, rgba(139,92,246,0.28), rgba(124,58,237,0.22)) !important; border: 1px solid rgba(167,139,250,0.42) !important; color: #ede9fe !important; padding: 7px 14px !important; border-radius: 999px !important; font-size: 12px !important; font-weight: 800 !important; backdrop-filter: blur(16px); box-shadow: 0 6px 18px rgba(0,0,0,0.35); }
        .es-top-right-btns { display: flex; align-items: center; gap: 6px; pointer-events: auto; flex-wrap: wrap; }
        #es-dovryx-hud { background: linear-gradient(135deg, rgba(245,158,11,0.28), rgba(217,119,6,0.24)) !important; border: 1px solid rgba(251,191,36,0.5) !important; color: #fef08a !important; padding: 7px 13px !important; border-radius: 999px !important; font-size: 12px !important; font-weight: 900 !important; backdrop-filter: blur(16px); box-shadow: 0 6px 18px rgba(0,0,0,0.35); }
        .es-top-btn { background: rgba(18, 20, 36, 0.84) !important; border: 1px solid rgba(255, 255, 255, 0.16) !important; color: #e2e8f0 !important; padding: 7px 13px !important; border-radius: 999px !important; font-size: 11.5px !important; font-weight: 700 !important; cursor: pointer !important; backdrop-filter: blur(16px); box-shadow: 0 6px 18px rgba(0,0,0,0.35); transition: 0.2s; }
        .es-top-btn:hover { background: rgba(139, 92, 246, 0.45) !important; color: #fff !important; }
        #es-city-exit-btn:hover { background: rgba(239, 68, 68, 0.88) !important; color: #fff !important; }
        .es-ref-proximity-wrap { display: flex; justify-content: center; gap: 8px; align-items: center; padding: 2px 0; }
        #es-city-proximity-badge { pointer-events: auto; background: rgba(18, 20, 36, 0.76) !important; border: 1px solid rgba(255,255,255,0.14) !important; color: #cbd5e1 !important; padding: 6px 14px !important; border-radius: 999px !important; font-size: 11.5px !important; font-weight: 700 !important; backdrop-filter: blur(16px); display: inline-flex !important; align-items: center !important; gap: 6px !important; }
        #es-city-work-btn { pointer-events: auto; display: none; background: linear-gradient(135deg, #10b981, #059669) !important; color: #fff !important; border: none !important; padding: 6px 14px !important; border-radius: 999px !important; font-size: 11.5px !important; font-weight: 800 !important; cursor: pointer !important; box-shadow: 0 6px 16px rgba(16,185,129,0.35); }
        .es-city-label { position: relative; background: rgba(12,14,28,0.86); border: 1px solid rgba(139,92,246,0.32); color: #e9d5ff; padding: 6px 12px; border-radius: 999px; font-size: 11.5px; font-weight: 700; white-space: nowrap; backdrop-filter: blur(14px); box-shadow: 0 8px 20px rgba(0,0,0,0.35); pointer-events: none; display: inline-flex; align-items: center; gap: 6px; }
        .es-city-label.me { background: rgba(18,22,48,0.92); border-color: rgba(59,130,246,0.5); color: #dbeafe; }
        .es-dpad-circle { position: absolute !important; right: 22px !important; bottom: 96px !important; width: 112px !important; height: 112px !important; border-radius: 50% !important; background: radial-gradient(circle at 35% 35%, rgba(255,255,255,0.08), rgba(18,20,36,0.72)) !important; border: 1px solid rgba(255,255,255,0.14) !important; backdrop-filter: blur(18px) !important; box-shadow: 0 12px 28px rgba(0,0,0,0.4) !important; z-index: 20 !important; display: grid !important; grid-template-areas: ". up ." "left . right" ". down ." !important; place-items: center !important; padding: 8px !important; }
        .es-move-pad { width: 32px !important; height: 32px !important; border-radius: 50% !important; background: rgba(255,255,255,0.06) !important; border: 1px solid rgba(255,255,255,0.1) !important; color: #cbd5e1 !important; font-size: 12px !important; display: flex !important; align-items: center !important; justify-content: center !important; cursor: pointer !important; }
        .es-move-pad[data-dir="up"] { grid-area: up; } .es-move-pad[data-dir="left"] { grid-area: left; } .es-move-pad[data-dir="right"] { grid-area: right; } .es-move-pad[data-dir="down"] { grid-area: down; }
        .es-move-pad:active, .es-move-pad:hover { background: rgba(139,92,246,0.34) !important; color: #fff !important; }
        .es-ref-bottom-bar { position: absolute; bottom: 0; left: 0; right: 0; z-index: 30; pointer-events: auto; display: flex; align-items: center; gap: 10px; padding: 12px; margin: 0 16px max(14px, env(safe-area-inset-bottom)) 16px; background: rgba(14, 16, 28, 0.88) !important; border: 1px solid rgba(255,255,255,0.10) !important; border-radius: 20px !important; backdrop-filter: blur(22px) !important; box-shadow: 0 16px 40px rgba(0,0,0,0.45) !important; }
        #es-city-voice-btn { height: 46px !important; padding: 0 16px !important; border-radius: 14px !important; background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important; color: #fff !important; border: 1px solid rgba(255,255,255,0.14) !important; font-size: 13px !important; font-weight: 800 !important; cursor: pointer !important; display: inline-flex !important; align-items: center !important; gap: 6px !important; white-space: nowrap !important; }
        #es-city-speak-nearby-pill { height: 46px !important; padding: 0 16px !important; border-radius: 14px !important; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%) !important; color: #fff !important; border: 1px solid rgba(255,255,255,0.14) !important; font-size: 13px !important; font-weight: 800 !important; cursor: pointer !important; display: inline-flex !important; align-items: center !important; gap: 6px !important; white-space: nowrap !important; }
        .es-ref-input-group { flex: 1 !important; height: 46px !important; display: flex !important; align-items: center !important; background: rgba(255,255,255,0.06) !important; border: 1px solid rgba(255,255,255,0.10) !important; border-radius: 14px !important; padding: 0 6px 0 14px !important; gap: 6px !important; }
        #es-city-chat-input { flex: 1 !important; background: transparent !important; border: none !important; outline: none !important; color: #f8fafc !important; font-size: 13.5px !important; font-weight: 500 !important; width: 100% !important; }
        #es-city-send-btn { width: 36px !important; height: 36px !important; border-radius: 10px !important; background: rgba(255,255,255,0.08) !important; color: #e2e8f0 !important; border: none !important; display: flex !important; align-items: center !important; justify-content: center !important; font-size: 15px !important; cursor: pointer !important; flex-shrink: 0; }
        .es-speech-bubble { position: relative; background: #ffffff; color: #0f172a; padding: 8px 13px; border-radius: 14px; font-size: 12.5px; font-weight: 700; line-height: 1.35; max-width: 220px; text-align: center; margin-bottom: 8px; box-shadow: 0 12px 28px rgba(0,0,0,0.35); pointer-events: none; z-index: 15; }
        .es-speech-bubble::after { content: ''; position: absolute; left: 50%; bottom: -5px; transform: translateX(-50%) rotate(45deg); width: 10px; height: 10px; background: #fff; }
        @media (max-width: 600px) { .es-ref-bottom-bar { padding: 10px; gap: 8px; margin: 0 12px max(12px, env(safe-area-inset-bottom)) 12px; border-radius: 18px; } #es-city-voice-btn, #es-city-speak-nearby-pill { padding: 0 12px !important; height: 42px !important; font-size: 12px !important; } .es-dpad-circle { width: 100px !important; height: 100px !important; right: 14px !important; bottom: 84px !important; } }
      </style>
      <div id="es-city-wrapper">
        <div class="es-ref-top-area">
          <div class="es-ref-subbar">
            <span id="es-city-zone-badge">🏙️ English City Boulevard</span>
            <div class="es-top-right-btns">
              <span id="es-dovryx-hud">💎 ${DOVRYX.getBalance().toLocaleString('pt-BR')} DRX</span>
              <button type="button" class="es-top-btn" id="es-city-vehicle-btn" title="Mount / Switch Vehicle">🚲 Ride</button>
              <button type="button" class="es-top-btn" id="es-city-home-btn" title="Teleport to My House Lot">🏡 My Lot</button>
              <button type="button" class="es-top-btn" id="es-city-bau-btn" title="Teleport to Guild Baú do Inglês">🧙‍♂️ Guild</button>
              <button type="button" class="es-top-btn" id="es-city-gender-btn">${isFemInicial ? '👩 Female' : '🧑 Male'}</button>
              <button type="button" class="es-top-btn" id="es-city-exit-btn">⇄ Exit 3D</button>
            </div>
          </div>
          <div class="es-ref-proximity-wrap">
            <span id="es-city-proximity-badge">• Out of Range</span>
            <button type="button" id="es-city-work-btn">💼 Work Shift (+DRX)</button>
          </div>
        </div>
        <select id="es-city-teleport"><option value=""></option></select>
        <div id="es-city-Hud-card"><div id="es-city-hud-content"></div></div>
        <div id="es-city-chat-feed"></div>
        <div id="es-city-viewport">
          <div id="es-city-labels-layer"></div>
          <div class="es-dpad-circle">
            <button type="button" class="es-move-pad" data-dir="up">▲</button>
            <button type="button" class="es-move-pad" data-dir="left">◀</button>
            <button type="button" class="es-move-pad" data-dir="right">▶</button>
            <button type="button" class="es-move-pad" data-dir="down">▼</button>
          </div>
        </div>
        <div class="es-ref-bottom-bar">
          <button type="button" id="es-city-voice-btn">🎤 Voice Mic</button>
          <button type="button" id="es-city-speak-nearby-pill" onclick="document.getElementById('es-city-chat-input')?.focus()">🔊 Speak Nearby</button>
          <div class="es-ref-input-group">
            <input type="text" id="es-city-chat-input" placeholder="Type message..." autocomplete="off" />
            <button type="button" id="es-city-send-btn">➤</button>
          </div>
        </div>
      </div>
    `;

    try { await this.carregarThreeJS(); } catch (e) { return; }
    this.active = true;
    this.modoInterior = false;
    this.predioAtual = null;
    this.gltfLoadedSet.clear();
    this.carregarLiderRankingReal();
    this.inicializarCenaThreeJS(initialSpaceId);
    this.carregarEstadoInicialNuvem();
    this.configurarEventosControles();
    this.iniciarMultiplayerRealtime();
  }

  async carregarLiderRankingReal() {
    if (!window.Workspace?.api) return;
    try {
      const escolaId = window.Workspace?.usuario?.escolaId || 'DEFAULT';
      const res = await window.Workspace.api(`/workspace/ingles/ranking?escolaId=${encodeURIComponent(escolaId)}`, 'GET');
      if (res && res.success && Array.isArray(res.ranking) && res.ranking.length > 0) {
        const top1 = res.ranking[0];
        const drx = top1.coins?.bronze || 1250;
        this.topLeaderText = `Leader: ${this.formatarNomeCompleto(top1.nome)} - ${drx} DRX`;
      }
    } catch (e) {}
  }

  falarTextoNPC(texto, spaceId = null) {
    if (!('speechSynthesis' in window) || !texto) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    const cfg = CITY_BUILDINGS_LAYOUT.find(b => b.id === (spaceId || this.currentZoneId));
    u.lang = cfg?.voiceLang || 'en-US';
    u.pitch = cfg?.voicePitch || 1.0;
    u.rate = 0.94;
    window.speechSynthesis.speak(u);
  }

  // 📦 CARREGADOR DE MODELOS GLB DA PASTA /models/ (AUTO-AJUSTE DE ESCALA E POSIÇÃO)
  tentarCarregarGLTFsTodos() {
    if (!this.gltfLoader) return;
    const THREE = window.THREE;
    CITY_BUILDINGS_LAYOUT.forEach(bCfg => {
      const id = bCfg.id;
      if (this.gltfLoadedSet.has(id)) return;
      const bMeta = this.buildingsMeta.find(b => b.id === id);
      const interiorGrp = this.interiorGroups.get(id);
      if (!bMeta || !interiorGrp) return;

      this.gltfLoader.load(
        `/models/${id}.glb`,
        (gltf) => {
          if (this.gltfLoadedSet.has(id)) return;
          this.gltfLoadedSet.add(id);
          const model = gltf.scene;

          const box = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3();
          box.getSize(size);
          const maxDim = Math.max(size.x, size.y, size.z);
          if (maxDim > 7.8) {
            const scaleFactor = 7.2 / maxDim;
            model.scale.set(scaleFactor, scaleFactor, scaleFactor);
          } else if (maxDim < 1.2 && maxDim > 0) {
            const scaleFactor = 3.2 / maxDim;
            model.scale.set(scaleFactor, scaleFactor, scaleFactor);
          }

          const newBox = new THREE.Box3().setFromObject(model);
          const center = new THREE.Vector3();
          newBox.getCenter(center);

          model.position.set(
            bMeta.centerX - center.x,
            Math.max(0.03, -newBox.min.y),
            bMeta.centerZ - center.z
          );

          model.traverse(o => {
            if (o.isMesh) {
              o.castShadow = true;
              o.receiveShadow = true;
            }
          });
          interiorGrp.add(model);
        },
        undefined,
        () => {}
      );
    });
  }

  // 🧙‍♂️ TRANSFORMA O PERSONAGEM 3D DA GUILDA NO MESTRE MAGO + CRIA O PORTAL E PLACA
  criarGuildaMago() {
    const THREE = window.THREE;
    const bGuild = this.buildingsMeta.find(b => b.id === 'guild_bau');
    const grp = this.interiorGroups.get('guild_bau');
    const npcGuild = this.npcs3D.get('guild_bau');
    if (!bGuild || !grp) return;

    // 1. Transforma o boneco 3D que já fica na loja num Mago 3D completo!
    if (npcGuild && npcGuild.mesh) {
      const wizMesh = npcGuild.mesh;
      const ud = wizMesh.userData || {};

      // Pinta a roupa de Roxo Místico Real
      if (ud.matCamisa) ud.matCamisa.color.setHex(0x4c1d95);
      if (ud.matCalca) ud.matCalca.color.setHex(0x2e1065);

      const matRobe = new THREE.MeshStandardMaterial({ color: 0x4c1d95, roughness: 0.65, metalness: 0.1 });
      const matGold = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3, metalness: 0.8 });
      const matBeard = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.85 });

      // Túnica longa de Mago (cobre as pernas com borda dourada)
      const robeSkirt = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.38, 0.92, 16), matRobe);
      robeSkirt.position.set(0, 0.52, 0);
      const goldBelt = new THREE.Mesh(new THREE.CylinderGeometry(0.265, 0.265, 0.08, 16), matGold);
      goldBelt.position.set(0, 0.98, 0);
      const goldHem = new THREE.Mesh(new THREE.CylinderGeometry(0.382, 0.385, 0.05, 16), matGold);
      goldHem.position.set(0, 0.09, 0);
      wizMesh.add(robeSkirt, goldBelt, goldHem);

      // Chapéu Pontudo de Mago + Barba Longa Branca presos à cabeça (headGroup)
      if (ud.headGroup) {
        const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.04, 18), matRobe);
        hatBrim.position.set(0, 0.21, 0);
        const hatBand = new THREE.Mesh(new THREE.CylinderGeometry(0.285, 0.295, 0.06, 16), matGold);
        hatBand.position.set(0, 0.25, 0);
        const hatCone = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.78, 16), matRobe);
        hatCone.position.set(0, 0.64, -0.03);
        hatCone.rotation.x = -0.12;

        const beard = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.48, 12), matBeard);
        beard.rotation.x = Math.PI; // Ponta da barba virada para baixo
        beard.position.set(0, -0.26, 0.21);

        ud.headGroup.add(hatBrim, hatBand, hatCone, beard);
      }

      // Cajado Mágico com Orbe de Cristal Brilhante ao lado direito do Mago
      const staffGroup = new THREE.Group();
      const staffWood = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.025, 2.05, 10),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
      );
      staffWood.position.set(0, 1.02, 0);
      const staffRing = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.025, 10, 20), matGold);
      staffRing.position.set(0, 2.12, 0);
      const staffOrb = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 14, 14),
        new THREE.MeshBasicMaterial({ color: 0xc084fc })
      );
      staffOrb.position.set(0, 2.12, 0);
      const staffLight = new THREE.PointLight(0xa855f7, 1.2, 6);
      staffLight.position.set(0, 2.2, 0);

      staffGroup.add(staffWood, staffRing, staffOrb, staffLight);
      staffGroup.position.set(0.38, 0, 0.22);
      wizMesh.add(staffGroup);

      // Torna todas as partes do Mago 3D clicáveis para abrir o diálogo da Guilda
      const mageData = {
        clickable: true,
        isMage: true,
        englishName: 'Master Wizard of the English Chest'
      };
      wizMesh.userData = { ...wizMesh.userData, ...mageData };
      wizMesh.traverse(child => {
        if (child.isMesh) {
          child.userData = { ...child.userData, ...mageData };
        }
      });
      this.clickableObjects.push(wizMesh);
    }

    // 2. Portal Mágico Roxo para a Sala de Jogos do Baú do Inglês
    const portalGroup = new THREE.Group();
    const ringOuter = new THREE.Mesh(
      new THREE.TorusGeometry(1.25, 0.12, 16, 40),
      new THREE.MeshBasicMaterial({ color: 0xa855f7 })
    );
    const portalCore = new THREE.Mesh(
      new THREE.CircleGeometry(1.18, 32),
      new THREE.MeshBasicMaterial({ color: 0x4c1d95, transparent: true, opacity: 0.78, side: THREE.DoubleSide })
    );
    const portalData = {
      clickable: true,
      isPortal: true,
      englishName: 'Portal to Baú do Inglês Game Room'
    };
    ringOuter.userData = portalData;
    portalCore.userData = portalData;
    portalGroup.userData = portalData;
    portalGroup.add(ringOuter, portalCore);
    portalGroup.position.set(bGuild.centerX + 1.8, 1.55, bGuild.centerZ + 2.5);
    portalGroup.rotation.y = -Math.PI / 2;
    grp.add(portalGroup);
    this.clickableObjects.push(portalGroup);

    // 3. Placa Dourada Explicativa na Parede da Guilda
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 0, 512, 256);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 504, 248);
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillText('🧙‍♂️ GUILD: BAÚ DO INGLÊS', 24, 52);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 17px Inter, sans-serif';
    ctx.fillText('1. Click the 3D Master Wizard to talk', 24, 110);
    ctx.fillText('2. Click the Purple Portal to play games', 24, 150);
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillText('💎 Earn DOVRYX (DRX) to build your house!', 24, 205);

    const tex = new THREE.CanvasTexture(canvas);
    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 1.6),
      new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
    );
    board.position.set(bGuild.centerX + 4.4, 2.2, bGuild.centerZ);
    board.rotation.y = -Math.PI / 2;
    board.userData = portalData;
    grp.add(board);
    this.clickableObjects.push(board);
  }

  interagirComMestreMago() {
    const msg = "Welcome, young apprentice! Step through the glowing Purple Portal to play the English Chest games and earn DOVRYX (DRX). Use your DRX to build your house, buy vehicles, and master English!";
    const npcGuild = this.npcs3D.get('guild_bau');
    if (npcGuild) {
      this.mostrarBalaoNoBoneco(npcGuild, "🧙‍♂️ Enter the Purple Portal to earn DOVRYX (DRX)!", 6500);
      this.animarEmote(npcGuild);
    }
    this.falarTextoNPC(msg, 'guild_bau');

    document.getElementById('es-mage-dialog')?.remove();
    const html = `
      <div id="es-mage-dialog" style="position:fixed; inset:0; z-index:1000250; background:rgba(5,7,14,0.82); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; padding:16px; font-family:Inter,sans-serif;">
        <div style="background:linear-gradient(145deg,#1e1b4b,#0f172a); border:2px solid #a855f7; border-radius:24px; padding:26px; max-width:440px; width:100%; text-align:center; color:#fff; box-shadow:0 25px 70px rgba(0,0,0,0.75);">
          <div style="width:84px; height:84px; border-radius:50%; background:radial-gradient(circle, rgba(168,85,247,0.35), rgba(30,27,75,0.9)); border:2px solid #facc15; display:flex; align-items:center; justify-content:center; font-size:46px; margin:0 auto 12px; box-shadow:0 0 25px rgba(168,85,247,0.5);">🧙‍♂️</div>
          <h2 style="margin:0 0 8px; color:#fde047; font-size:21px;">Master Wizard of the Guild</h2>
          <p style="color:#e2e8f0; font-size:14px; line-height:1.55; margin:0 0 18px;">
            "${msg}"
          </p>
          <div style="background:rgba(168,85,247,0.18); border:1px solid rgba(192,132,252,0.4); border-radius:14px; padding:10px; margin-bottom:18px; font-size:13px; color:#e9d5ff;">
            💎 Your Wallet: <b>${DOVRYX.getBalance().toLocaleString('pt-BR')} DRX</b>
          </div>
          <div style="display:flex; gap:10px;">
            <button id="es-mage-close" style="flex:1; padding:12px; background:#1e293b; color:#cbd5e1; border:none; border-radius:12px; font-weight:700; cursor:pointer;">Stay in Guild</button>
            <button id="es-mage-enter-portal" style="flex:1.5; padding:12px; background:linear-gradient(135deg,#8b5cf6,#d946ef); color:#fff; border:none; border-radius:12px; font-weight:900; cursor:pointer; box-shadow:0 8px 20px rgba(139,92,246,0.4);">🌀 Enter Game Portal →</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    document.getElementById('es-mage-close')?.addEventListener('click', () => document.getElementById('es-mage-dialog')?.remove());
    document.getElementById('es-mage-enter-portal')?.addEventListener('click', () => {
      document.getElementById('es-mage-dialog')?.remove();
      this.abrirPortalBauIngles();
    });
  }

  // 🎮 ABRE OS 15 JOGOS REAIS DO BAÚ DO INGLÊS POR CIMA DA CIDADE 3D SEM SAIR DELA!
  abrirPortalBauIngles() {
    const bauContainer = document.getElementById('ws-ingles-container');
    if (bauContainer && window.Workspace?.Ingles) {
      bauContainer.style.cssText = 'display:block !important; position:fixed !important; inset:0 !important; width:100vw !important; height:100dvh !important; overflow-y:auto !important; z-index:1000300 !important; background:#f8fafc !important;';
      window.Workspace.Ingles.abrirBau();

      let topReturnBar = document.getElementById('es-bau-return-bar');
      if (!topReturnBar) {
        topReturnBar = document.createElement('div');
        topReturnBar.id = 'es-bau-return-bar';
        topReturnBar.style.cssText = 'position:sticky; top:0; left:0; right:0; z-index:1000350; background:linear-gradient(90deg,#1e1b4b,#312e81); color:#fff; padding:12px 24px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 8px 25px rgba(0,0,0,0.35); font-family:Inter,sans-serif;';
        topReturnBar.innerHTML = `
          <div style="display:flex; align-items:center; gap:10px; font-weight:800; font-size:14px;">
            <span style="font-size:22px;">🧙‍♂️</span>
            <span>Guild Game Room • Earn DOVRYX (DRX) and return to the 3D City!</span>
          </div>
          <button type="button" id="es-btn-return-city" style="background:linear-gradient(135deg,#10b981,#059669); color:#fff; border:none; padding:9px 18px; border-radius:999px; font-weight:900; font-size:13px; cursor:pointer; box-shadow:0 4px 14px rgba(16,185,129,0.4);">
            🏙️ ↩ Back to 3D City
          </button>
        `;
        bauContainer.prepend(topReturnBar);
        topReturnBar.querySelector('#es-btn-return-city')?.addEventListener('click', () => {
          window.Workspace.Ingles.fecharJogo?.();
          bauContainer.style.display = 'none';
          bauContainer.style.position = '';
          bauContainer.style.zIndex = '';
          topReturnBar.remove();
          const novoSaldo = window.Workspace?.Ingles?.state?.coins?.bronze || DOVRYX.getBalance();
          DOVRYX.setBalance(novoSaldo);
          if (window.Workspace?.mostrarAviso) {
            window.Workspace.mostrarAviso(`🏙️ Welcome back! Wallet synced: ${DOVRYX.getBalance()} DRX 💎`, 'success');
          }
        });
      }
      return;
    }
  }

  // 📌 MODAIS DE POST-IT (CRIAÇÃO, LEITURA AMPLIADA E EDIÇÃO/EXCLUSÃO EXCLUSIVA DO AUTOR NO MONGODB)
  abrirModalCriarStickyNote(notaParaEditar = null) {
    document.getElementById('es-sticky-modal')?.remove();
    const textoInicial = notaParaEditar ? notaParaEditar.text : '';
    const tituloModal = notaParaEditar ? '✏️ Edit Your Sticky Note' : '📌 New English Sticky Note';

    const html = `
      <div id="es-sticky-modal" style="position:fixed; inset:0; z-index:1000200; background:rgba(5,7,14,0.78); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; font-family:Inter,sans-serif; padding:16px;">
        <div style="background:#fef08a; border:2px solid #ca8a04; border-radius:16px; padding:24px; width:100%; max-width:360px; text-align:center; box-shadow:0 20px 50px rgba(0,0,0,0.5); transform:rotate(-1deg);">
          <h3 style="color:#422006; margin:0 0 10px; font-size:18px;">${tituloModal}</h3>
          <p style="color:#78350f; font-size:12.5px; margin:0 0 12px;">Write a short message or tip for the Coffee Shop wall:</p>
          <textarea id="es-sticky-text" maxlength="80" placeholder="Type here in English..." style="width:100%; height:95px; background:#fffdf0; border:1px solid #d97706; border-radius:10px; padding:10px; color:#422006; font-size:14.5px; font-weight:600; resize:none; outline:none; box-sizing:border-box;">${textoInicial}</textarea>
          <div style="display:flex; gap:8px; margin-top:14px;">
            <button id="es-sticky-cancel" style="flex:1; padding:10px; background:#f3f4f6; color:#4b5563; border:none; border-radius:10px; font-weight:700; cursor:pointer;">Cancel</button>
            <button id="es-sticky-save" style="flex:1.3; padding:10px; background:#d97706; color:#fff; border:none; border-radius:10px; font-weight:800; cursor:pointer;">${notaParaEditar ? 'Save Changes ✅' : 'Pin to Wall 📌'}</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    document.getElementById('es-sticky-text')?.focus();

    document.getElementById('es-sticky-cancel')?.addEventListener('click', () => document.getElementById('es-sticky-modal')?.remove());
    document.getElementById('es-sticky-save')?.addEventListener('click', () => {
      const txt = document.getElementById('es-sticky-text')?.value;
      if (txt && txt.trim()) {
        if (notaParaEditar && notaParaEditar.id) {
          this.editarStickyNote(notaParaEditar.id, txt.trim());
        } else {
          this.adicionarStickyNote(txt.trim(), true);
        }
      }
      document.getElementById('es-sticky-modal')?.remove();
    });
  }

  abrirModalLerStickyNote(notaObj) {
    document.getElementById('es-sticky-view-modal')?.remove();
    const meuId = String(this.localPlayer ? this.localPlayer.userId : '');
    const isAutor = Boolean(notaObj.userId && String(notaObj.userId) === meuId);
    const nomeAutor = notaObj.author ? notaObj.author : 'Student';

    const botoesAutor = isAutor ? `
      <button id="es-sticky-edit" style="flex:1; padding:10px; background:#d97706; color:#fff; border:none; border-radius:10px; font-weight:800; cursor:pointer;">Edit ✏️</button>
      <button id="es-sticky-delete" style="flex:1; padding:10px; background:#dc2626; color:#fff; border:none; border-radius:10px; font-weight:800; cursor:pointer;">Delete 🗑️</button>
    ` : '';

    const html = `
      <div id="es-sticky-view-modal" style="position:fixed; inset:0; z-index:1000200; background:rgba(5,7,14,0.78); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; font-family:Inter,sans-serif; padding:16px;">
        <div style="background:#fef08a; border:2px solid #ca8a04; border-radius:18px; padding:24px; width:100%; max-width:340px; text-align:center; box-shadow:0 25px 60px rgba(0,0,0,0.6); transform:rotate(1deg);">
          <div style="font-size:28px; margin-bottom:4px;">📌</div>
          <p style="color:#78350f; font-size:11.5px; font-weight:800; margin:0 0 8px; text-transform:uppercase; letter-spacing:0.5px;">Note by ${nomeAutor}</p>
          <div style="background:#fffdf0; border:1px solid #d97706; border-radius:12px; padding:16px; color:#422006; font-size:15.5px; font-weight:700; line-height:1.45; word-break:break-word; margin-bottom:16px; min-height:60px; display:flex; align-items:center; justify-content:center;">
            "${notaObj.text}"
          </div>
          <div style="display:flex; gap:8px;">
            <button id="es-sticky-close" style="flex:1; padding:10px; background:#f3f4f6; color:#4b5563; border:none; border-radius:10px; font-weight:700; cursor:pointer;">Close</button>
            ${botoesAutor}
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    document.getElementById('es-sticky-close')?.addEventListener('click', () => document.getElementById('es-sticky-view-modal')?.remove());
    if (isAutor) {
      document.getElementById('es-sticky-edit')?.addEventListener('click', () => {
        document.getElementById('es-sticky-view-modal')?.remove();
        this.abrirModalCriarStickyNote(notaObj);
      });
      document.getElementById('es-sticky-delete')?.addEventListener('click', () => {
        document.getElementById('es-sticky-view-modal')?.remove();
        this.removerStickyNote(notaObj.id);
      });
    }
  }

  criarStickyNotesParede() {
    const b = this.buildingsMeta.find(x => x.id === 'coffee');
    if (!b) return;
    this.renderizarStickyNotesNoCoffee();

    const THREE = window.THREE;
    const addArea = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 1.8),
      new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.16, side: THREE.DoubleSide })
    );
    addArea.position.set(b.centerX, 1.6, b.centerZ - 4.76);
    addArea.userData = { clickable: true, isStickyWall: true, englishName: 'Sticky Note Wall' };
    this.clickableObjects.push(addArea);
    const grp = this.interiorGroups.get('coffee');
    if (grp) grp.add(addArea);
  }

  renderizarStickyNotesNoCoffee() {
    const THREE = window.THREE;
    const b = this.buildingsMeta.find(x => x.id === 'coffee');
    if (!b) return;
    const grp = this.interiorGroups.get('coffee') ? this.interiorGroups.get('coffee') : this.scene;
    this.stickyNotes.forEach(n => {
      grp.remove(n);
      const idx = this.clickableObjects.indexOf(n);
      if (idx > -1) this.clickableObjects.splice(idx, 1);
    });
    this.stickyNotes = [];

    const saved = (Array.isArray(this.cloudStickyNotes) && this.cloudStickyNotes.length > 0)
      ? this.cloudStickyNotes
      : [
          { id: 'seed_1', author: 'Paulo', text: 'Hello from Bahia!', userId: 'seed' },
          { id: 'seed_2', author: 'Teacher', text: 'Earn DRX and build your house!', userId: 'seed' }
        ];

    saved.slice(0, 8).forEach((item, i) => {
      const txt = typeof item === 'string' ? item : (item.text ? item.text : '');
      const author = typeof item === 'string' ? 'Student' : (item.author ? item.author : 'Student');
      const noteId = typeof item === 'string' ? ('seed_' + i) : (item.id ? item.id : ('seed_' + i));
      const uId = typeof item === 'string' ? '' : (item.userId ? item.userId : '');

      const c = document.createElement('canvas'); c.width = 256; c.height = 256;
      const ctx = c.getContext('2d');
      ctx.fillStyle = i % 2 === 0 ? '#fef08a' : '#fed7aa';
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 6; ctx.strokeRect(3, 3, 250, 250);
      ctx.fillStyle = '#422006'; ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillText(String(txt).slice(0, 18), 14, 65);
      if (txt.length > 18) ctx.fillText(String(txt).slice(18, 36), 14, 98);
      if (txt.length > 36) ctx.fillText(String(txt).slice(36, 54) + '...', 14, 131);
      ctx.fillStyle = '#78350f'; ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText('- ' + author, 14, 222);

      const tex = new THREE.CanvasTexture(c);
      const note = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.52), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
      note.position.set(b.centerX - 0.9 + (i % 4) * 0.6, 1.9 - Math.floor(i / 4) * 0.65, b.centerZ - 4.68);
      note.userData = {
        clickable: true,
        isIndividualSticky: true,
        stickyData: { id: noteId, author, text: txt, userId: uId },
        englishName: 'Sticky Note by ' + author
      };
      this.clickableObjects.push(note);
      grp.add(note);
      this.stickyNotes.push(note);
    });
  }

  async adicionarStickyNote(texto, emitirRede = true) {
    const limpo = String(texto ? texto : '').trim();
    if (!limpo || !this.localPlayer) return;
    const escolaId = window.Workspace?.usuario?.escolaId ? window.Workspace.usuario.escolaId : 'DEFAULT';

    const res = await fetch('/api/workspace/english-spaces/world/stickies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        escolaId,
        author: this.localPlayer.nome,
        userId: this.localPlayer.userId,
        text: limpo
      })
    }).then(r => r.json()).catch(() => null);

    if (res && res.success && Array.isArray(res.notes)) {
      this.cloudStickyNotes = res.notes;
      this.renderizarStickyNotesNoCoffee();
    }
    if (emitirRede) {
      await DOVRYX.add(20, 'Sticky Note');
    }
  }

  async editarStickyNote(noteId, novoTexto) {
    if (!noteId || !novoTexto || !this.localPlayer) return;
    const escolaId = window.Workspace?.usuario?.escolaId ? window.Workspace.usuario.escolaId : 'DEFAULT';
    const res = await fetch(`/api/workspace/english-spaces/world/stickies/${encodeURIComponent(noteId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        escolaId,
        userId: this.localPlayer.userId,
        text: novoTexto
      })
    }).then(r => r.json()).catch(() => null);

    if (res && res.success && Array.isArray(res.notes)) {
      this.cloudStickyNotes = res.notes;
      this.renderizarStickyNotesNoCoffee();
      if (window.Workspace?.mostrarAviso) window.Workspace.mostrarAviso('✏️ Sticky note updated!', 'success');
    }
  }

  async removerStickyNote(noteId) {
    if (!noteId || !this.localPlayer) return;
    const escolaId = window.Workspace?.usuario?.escolaId ? window.Workspace.usuario.escolaId : 'DEFAULT';
    const url = `/api/workspace/english-spaces/world/stickies/${encodeURIComponent(noteId)}?userId=${encodeURIComponent(this.localPlayer.userId)}&escolaId=${encodeURIComponent(escolaId)}`;
    const res = await fetch(url, { method: 'DELETE', credentials: 'include' }).then(r => r.json()).catch(() => null);

    if (res && res.success && Array.isArray(res.notes)) {
      this.cloudStickyNotes = res.notes;
      this.renderizarStickyNotesNoCoffee();
      if (window.Workspace?.mostrarAviso) window.Workspace.mostrarAviso('🗑️ Sticky note deleted!', 'info');
    }
  }

// 🛣️ RUAS ALARGADAS COM CICLOVIAS (CORRIGIDO COM DECLARAÇÃO SEGURA DE CANVAS)
  criarRuasAlargadasComCiclovias() {
    const THREE = window.THREE;
    if (!THREE || !this.exteriorGroup) return;

    const bikeLaneMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.8 });
    [-5.6, 5.6].forEach(xLane => {
      const bikeLane = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 170), bikeLaneMat);
      bikeLane.rotation.x = -Math.PI / 2;
      bikeLane.position.set(xLane, 0.03, -36);
      this.exteriorGroup.add(bikeLane);
    });

    // Declara tanto 'canvas' quanto 'canvasBike' para evitar qualquer ReferenceError
    const canvas = document.createElement('canvas');
    const canvasBike = canvas;
    canvas.width = 512;
    canvas.height = 128;

    const ctx = canvas.getContext('2d');
    const ctxB = ctx;
    ctxB.fillStyle = '#059669';
    ctxB.fillRect(0, 0, 512, 128);
    ctxB.fillStyle = '#ffffff';
    ctxB.font = 'bold 34px Inter, sans-serif';
    ctxB.textAlign = 'center';
    ctxB.fillText('BIKE LANE 🚲', 256, 76);

    const texBike = new THREE.CanvasTexture(canvas);
    [-20, -50].forEach(zPos => {
      const mL = new THREE.Mesh(
        new THREE.PlaneGeometry(1.3, 3.6),
        new THREE.MeshBasicMaterial({ map: texBike })
      );
      mL.rotation.x = -Math.PI / 2;
      mL.rotation.z = Math.PI / 2;
      mL.position.set(-5.6, 0.05, zPos);

      const mR = mL.clone();
      mR.position.set(5.6, 0.05, zPos);
      this.exteriorGroup.add(mL, mR);
    });
  }

  criarQuebraMolasESinalizacao() {
    const THREE = window.THREE;
    this.speedBumps = [];
    this.trafficSigns = [];

    [-72, -40, -8, 16].forEach(zPos => {
      const bumpGroup = new THREE.Group();
      const bump = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.22, 1.0), new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.7 }));
      bump.position.set(0, 0.11, 0);
      bumpGroup.add(bump);
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
      for (let x = -3.6; x <= 3.6; x += 1.2) {
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.95), stripeMat);
        stripe.rotation.x = -Math.PI / 2; stripe.position.set(x, 0.23, 0);
        bumpGroup.add(stripe);
      }
      bumpGroup.position.set(0, 0, zPos);
      this.exteriorGroup.add(bumpGroup);
      this.speedBumps.push({ mesh: bumpGroup, z: zPos, x: 0, triggered: 0 });
    });

    const placas = [
      { pos: [-7.2, -72], tipo: 'STOP',  texto: 'STOP' },
      { pos: [ 7.2, -40], tipo: 'YIELD', texto: 'YIELD' },
      { pos: [-7.2,  -8], tipo: 'BIKE',  texto: 'BIKE LANE' },
      { pos: [ 7.2,  16], tipo: 'SPEED', texto: 'SPEED BUMP' }
    ];
    placas.forEach(p => {
      const signGroup = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 8), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
      pole.position.set(0, 1.3, 0);
      signGroup.add(pole);

      const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 256;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = p.tipo === 'STOP' ? '#dc2626' : (p.tipo === 'YIELD' || p.tipo === 'SPEED' ? '#facc15' : '#059669');
      ctx.fillRect(16, 16, 224, 224);
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 10; ctx.strokeRect(20, 20, 216, 216);
      ctx.fillStyle = (p.tipo === 'YIELD' || p.tipo === 'SPEED') ? '#0f172a' : '#ffffff';
      ctx.font = 'bold 34px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(p.texto, 128, 140);
      const tex = new THREE.CanvasTexture(canvas);
      const board = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 1.05), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
      board.position.set(0, 2.5, 0);
      board.userData = { clickable: true, englishName: `Traffic Sign: ${p.texto}` };
      this.clickableObjects.push(board);
      signGroup.add(board);
      signGroup.position.set(p.pos[0], 0, p.pos[1]);
      this.exteriorGroup.add(signGroup);
    });
  }

  triggerBlitzEducativa(reason) {
    if (document.getElementById('blitz-modal')) return;
    const questions = [
      { q: 'What does a STOP sign require you to do?', a: ['Come to a complete stop', 'Drive faster'], correct: 0 },
      { q: 'What does a YIELD sign mean in traffic?', a: ['Slow down and give way', 'Honk the horn'], correct: 0 },
      { q: 'Who is allowed to ride in the green BIKE LANE?', a: ['Bicycles only', 'Heavy trucks'], correct: 0 },
      { q: 'What should you do before a SPEED BUMP?', a: ['Reduce your speed', 'Accelerate'], correct: 0 }
    ];
    const quiz = questions[Math.floor(Math.random() * questions.length)];
    const html = `
      <div id="blitz-modal" style="position:fixed; inset:0; z-index:1000220; background:rgba(15,23,42,0.85); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; padding:16px; font-family:Inter,sans-serif;">
        <div style="background:#0f172a; border:2px solid #ef4444; border-radius:20px; padding:24px; max-width:400px; width:100%; text-align:center; color:#fff;">
          <div style="font-size:46px;">🚨👮‍♂️</div>
          <h3 style="color:#f87171; margin:8px 0;">Traffic Safety Blitz!</h3>
          <p style="color:#cbd5e1; font-size:13px; margin:0 0 12px;">You passed fast over a <b>${reason}</b>. Answer the officer's question in English to avoid a 20 DRX fine:</p>
          <div style="background:#1e293b; padding:12px; border-radius:12px; font-weight:700; font-size:14.5px; margin-bottom:14px;">"${quiz.q}"</div>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${quiz.a.map((opt, i) => `<button class="blitz-opt" data-i="${i}" style="padding:12px; background:#334155; color:#fff; border:1px solid #475569; border-radius:10px; font-weight:700; cursor:pointer;">${opt}</button>`).join('')}
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    document.querySelectorAll('.blitz-opt').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.i);
        document.getElementById('blitz-modal')?.remove();
        if (idx === quiz.correct) {
          DOVRYX.add(15, 'Traffic Quiz Bonus');
        } else {
          DOVRYX.spend(20, 'Traffic Fine');
        }
      });
    });
  }

  // 🏘️ LOTEAMENTO RESIDENCIAL DOS ALUNOS (CONSTRUÇÃO EM 5 ETAPAS SALVA NO MONGODB)
  criarLoteamentoResidencial() {
    const THREE = window.THREE;
    if (!this.exteriorGroup) return;
    if (this.lotes && this.lotes.length > 0) {
      this.lotes.forEach(l => this.exteriorGroup.remove(l));
    }
    this.lotes = [];

    const u = window.Workspace?.usuario || {};
    const meuNome = this.formatarNomeCompleto(u.nome || u.login || 'You');

    for (let i = 0; i < 8; i++) {
      const col = (i % 4) - 1.5;
      const row = Math.floor(i / 4);
      const lotX = col * 18;
      const lotZ = 34 + row * 18;
      const lotGroup = new THREE.Group();

      const isMeuLote = i === 0;
      const commLot = this.communityLots && this.communityLots[i] ? this.communityLots[i] : null;
      const donoNome = isMeuLote ? `${meuNome} (You)` : (commLot ? this.formatarNomeCompleto(commLot.ownerName) : `Residential Lot #${i + 1}`);
      const stage = isMeuLote ? (this.houseStage || 1) : (commLot ? (commLot.stage || 1) : 1);

      const terreno = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 }));
      terreno.rotation.x = -Math.PI / 2;
      lotGroup.add(terreno);

      const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = isMeuLote ? '#1e1b4b' : '#0f172a'; ctx.fillRect(0, 0, 512, 128);
      ctx.strokeStyle = isMeuLote ? '#facc15' : '#8b5cf6'; ctx.lineWidth = 6; ctx.strokeRect(3, 3, 506, 122);
      ctx.fillStyle = '#fde047'; ctx.font = 'bold 22px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(`🏡 House of ${donoNome}`, 256, 52);
      ctx.fillStyle = '#a7f3d0'; ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillText(`Stage ${stage}/5 • Click to Build/Inspect`, 256, 96);
      const tex = new THREE.CanvasTexture(canvas);
      const placa = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 0.95), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
      placa.position.set(0, 1.2, -5.8);
      lotGroup.add(placa);

      if (stage >= 1) {
        const fund = new THREE.Mesh(new THREE.BoxGeometry(7, 0.35, 7), new THREE.MeshStandardMaterial({ color: 0x64748b }));
        fund.position.set(0, 0.175, 0);
        lotGroup.add(fund);
      }
      if (stage >= 2) {
        const wallMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7 });
        const wBack = new THREE.Mesh(new THREE.BoxGeometry(7, 2.8, 0.3), wallMat); wBack.position.set(0, 1.6, 3.35);
        const wLeft = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.8, 7), wallMat); wLeft.position.set(-3.35, 1.6, 0);
        const wRight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.8, 7), wallMat); wRight.position.set(3.35, 1.6, 0);
        lotGroup.add(wBack, wLeft, wRight);
      }
      if (stage >= 3) {
        const roof = new THREE.Mesh(new THREE.ConeGeometry(5.6, 2.2, 4), new THREE.MeshStandardMaterial({ color: 0xb91c1c }));
        roof.position.set(0, 4.1, 0); roof.rotation.y = Math.PI / 4;
        lotGroup.add(roof);
      }
      if (stage >= 4) {
        const sofa = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.7, 0.9), new THREE.MeshStandardMaterial({ color: 0x8b5cf6 }));
        sofa.position.set(0, 0.7, 1.2);
        const table = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.6, 12), new THREE.MeshStandardMaterial({ color: 0x78350f }));
        table.position.set(0, 0.65, -0.8);
        lotGroup.add(sofa, table);
      }

      const lotData = { clickable: true, isLot: true, lotIndex: i, isMeuLote, ownerName: donoNome, stage };
      placa.userData = lotData;
      terreno.userData = lotData;
      lotGroup.userData = lotData;
      lotGroup.position.set(lotX, 0, lotZ);
      this.clickableObjects.push(lotGroup);
      this.exteriorGroup.add(lotGroup);
      this.lotes.push(lotGroup);
    }
  }

  abrirModalConstrucaoCasa() {
    document.getElementById('es-house-modal')?.remove();
    const nomesEtapas = [
      'Empty Land',
      'Stage 1: Stone Foundation',
      'Stage 2: Brick Walls',
      'Stage 3: Colonial Roof',
      'Stage 4: Furnished Living Room',
      'Stage 5: Luxury Smart Villa'
    ];
    const stageAtual = this.houseStage || 1;
    const proxStage = Math.min(5, stageAtual + 1);
    const custoDRX = proxStage * 180;

    const html = `
      <div id="es-house-modal" style="position:fixed; inset:0; z-index:1000220; background:rgba(5,7,14,0.82); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; padding:16px; font-family:Inter,sans-serif;">
        <div style="background:#0f172a; border:2px solid #10b981; border-radius:22px; padding:24px; max-width:410px; width:100%; text-align:center; color:#fff; box-shadow:0 25px 60px rgba(0,0,0,0.7);">
          <div style="font-size:48px;">🏡🧱</div>
          <h2 style="margin:6px 0; color:#6ee7b7; font-size:20px;">My Residential Lot</h2>
          <p style="color:#cbd5e1; font-size:13.5px; margin:0 0 12px;">Current Status: <b>${nomesEtapas[stageAtual]}</b></p>
          <div style="background:#1e293b; border-radius:12px; padding:12px; margin-bottom:16px; font-size:13px; color:#e2e8f0;">
            🧱 Building Materials Owned: <b style="color:#facc15;">${this.materialsCount || 0} units</b><br>
            💎 Wallet Balance: <b style="color:#34d399;">${DOVRYX.getBalance().toLocaleString('pt-BR')} DRX</b>
          </div>
          ${stageAtual < 5 ? `
            <button id="es-house-upgrade-btn" style="width:100%; padding:13px; background:linear-gradient(135deg,#10b981,#059669); color:#fff; border:none; border-radius:12px; font-weight:900; font-size:14px; cursor:pointer; margin-bottom:8px;">
              🔨 Upgrade to ${nomesEtapas[proxStage]} (${custoDRX} DRX)
            </button>
          ` : `<div style="color:#fde047; font-weight:800; margin-bottom:12px;">🌟 Maximum Luxury Villa Reached!</div>`}
          <button id="es-house-close-btn" style="width:100%; padding:10px; background:#334155; color:#cbd5e1; border:none; border-radius:12px; font-weight:700; cursor:pointer;">Close</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    document.getElementById('es-house-close-btn')?.addEventListener('click', () => document.getElementById('es-house-modal')?.remove());
    document.getElementById('es-house-upgrade-btn')?.addEventListener('click', async () => {
      const pagou = await DOVRYX.spend(custoDRX, `House Upgrade Stage ${proxStage}`);
      if (!pagou) return;
      this.houseStage = proxStage;
      document.getElementById('es-house-modal')?.remove();
      this.criarLoteamentoResidencial();
      this.falarTextoNPC(`Congratulations! Your house is now at stage ${proxStage}!`, 'real_estate');
      await fetch('/api/workspace/english-spaces/progress/customization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: this.localPlayer.userId,
          ownerName: this.localPlayer.nome,
          houseStage: this.houseStage
        })
      }).catch(() => {});
    });
  }

  // 🚲🏍️🚗 VEÍCULOS PILOTÁVEIS (BICICLETA, MOTO E CARRO)
  alternarOuMontarVeiculo(tipoForcado = null) {
    if (this.currentVehicle && !tipoForcado) {
      this.desmontarVeiculo();
      return;
    }
    const lista = Array.isArray(this.ownedVehicles) && this.ownedVehicles.length > 0 ? this.ownedVehicles : ['bicycle'];
    const escolhido = tipoForcado || lista[lista.length - 1];
    const velocidades = { bicycle: 11.5, moto: 15.5, car: 19.0 };
    const nomes = { bicycle: 'City Bicycle 🚲', moto: 'Sport Motorcycle 🏍️', car: 'Electric Supercar 🚗' };

    this.currentVehicle = escolhido;
    this.vehicleSpeed = velocidades[escolhido] || 11.5;

    const btn = document.getElementById('es-city-vehicle-btn');
    if (btn) btn.innerHTML = '🚶 Dismount';

    if (this.vehicleMesh) this.scene.remove(this.vehicleMesh);
    const THREE = window.THREE;
    const vm = new THREE.Group();
    if (escolhido === 'bicycle') {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.55, 1.35), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
      frame.position.set(0, 0.35, 0); vm.add(frame);
    } else if (escolhido === 'moto') {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 1.75), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
      body.position.set(0, 0.4, 0); vm.add(body);
    } else {
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.65, 2.8), new THREE.MeshStandardMaterial({ color: 0x2563eb }));
      body.position.set(0, 0.45, 0); vm.add(body);
    }
    this.vehicleMesh = vm;
    this.scene.add(vm);
    if (window.Workspace?.mostrarAviso) {
      window.Workspace.mostrarAviso(`🚀 Riding ${nomes[escolhido] || 'Vehicle'}! Use Bike Lanes & watch out for Speed Bumps!`, 'success');
    }
  }

  desmontarVeiculo() {
    this.currentVehicle = null;
    this.vehicleSpeed = 7.5;
    if (this.vehicleMesh) {
      this.scene.remove(this.vehicleMesh);
      this.vehicleMesh = null;
    }
    const btn = document.getElementById('es-city-vehicle-btn');
    if (btn) btn.innerHTML = '🚲 Ride';
  }

  // 💼 TRABALHOS REMUNERADOS NAS LOJAS (PART-TIME JOBS PARA GANHAR DRX)
  iniciarTrabalhoPartTime(buildingId) {
    const bMeta = this.buildingsMeta.find(b => b.id === buildingId);
    const nomeLoja = bMeta?.space?.name || 'Shop';
    const pagamento = 60;

    document.getElementById('job-modal')?.remove();
    const html = `
      <div id="job-modal" style="position:fixed; inset:0; z-index:1000220; background:rgba(5,7,14,0.82); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; padding:16px; font-family:Inter,sans-serif;">
        <div style="background:#0f172a; border:2px solid #10b981; border-radius:20px; padding:24px; max-width:420px; width:100%; color:#fff;">
          <h3 style="color:#34d399; margin:0 0 8px;">💼 Part-Time Shift at ${nomeLoja}</h3>
          <p style="color:#cbd5e1; font-size:13.5px; margin:0 0 12px;">Greet a customer and offer help in English (at least 3 words) to earn <b>+${pagamento} DRX 💎</b>:</p>
          <input id="job-answer" placeholder="Ex: Good morning! How can I help you today?" style="width:100%; padding:12px; border-radius:10px; border:1px solid #334155; background:#1e293b; color:#fff; font-size:14px; margin-bottom:14px; box-sizing:border-box;" />
          <div style="display:flex; gap:8px;">
            <button id="job-cancel" style="flex:1; padding:11px; background:#334155; color:#cbd5e1; border:none; border-radius:10px; font-weight:700; cursor:pointer;">Cancel</button>
            <button id="job-complete" style="flex:1.4; padding:11px; background:#10b981; color:#fff; border:none; border-radius:10px; font-weight:900; cursor:pointer;">Complete Shift (+${pagamento} DRX)</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    document.getElementById('job-cancel')?.addEventListener('click', () => document.getElementById('job-modal')?.remove());
    document.getElementById('job-complete')?.addEventListener('click', async () => {
      const ans = (document.getElementById('job-answer')?.value || '').trim();
      if (ans.split(/\s+/).length < 3) {
        if (window.Workspace?.mostrarAviso) window.Workspace.mostrarAviso('Write a complete greeting in English!', 'warning');
        return;
      }
      document.getElementById('job-modal')?.remove();
      this.mostrarBalaoNoBoneco(this.localPlayer, ans, 5000);
      this.falarTextoNPC("Great job! Here is your payment in DOVRYX!", buildingId);
      await DOVRYX.add(pagamento, `from ${nomeLoja} Shift`);
    });
  }

  // 👤 CONSTRUTOR DE BONECO HUMANO 3D (DIFERENCIAÇÃO REAL HOMEM vs MULHER)
  criarBonecoHumano3D(corCamisa = 0x8b5cf6, corCalca = 0x1e293b, corPele = 0xfde68a, isFemale = false) {
    const THREE = window.THREE;
    const group = new THREE.Group();

    const matPele = new THREE.MeshStandardMaterial({ color: corPele, roughness: 0.55, metalness: 0.05 });
    const matCamisa = new THREE.MeshStandardMaterial({ color: corCamisa, roughness: 0.7, metalness: 0.08 });
    const matCalca = new THREE.MeshStandardMaterial({ color: corCalca, roughness: 0.8, metalness: 0.1 });
    const matCabelo = new THREE.MeshStandardMaterial({ color: isFemale ? 0x5c2b0e : 0x1e1e22, roughness: 0.85 });
    const matOlho = new THREE.MeshStandardMaterial({ color: 0x0a0a0a });
    const matBrancoOlho = new THREE.MeshStandardMaterial({ color: 0xfffffe });
    const matSapato = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 });
    const matBoca = new THREE.MeshStandardMaterial({ color: isFemale ? 0xe11d48 : 0x8b4a3e });
    const matSobrancelha = new THREE.MeshStandardMaterial({ color: 0x2b2b2b });

    const torsoW = isFemale ? 0.43 : 0.54;
    const shoulderW = isFemale ? 0.24 : 0.34;
    const hipW = isFemale ? 0.50 : 0.48;

    const footGeo = new THREE.BoxGeometry(0.2, 0.14, 0.3);
    const leftFoot = new THREE.Mesh(footGeo, matSapato); leftFoot.position.set(-0.13, 0.07, 0.05);
    const rightFoot = new THREE.Mesh(footGeo, matSapato); rightFoot.position.set(0.13, 0.07, 0.05);
    group.add(leftFoot, rightFoot);

    const legGeo = new THREE.CylinderGeometry(0.1, 0.085, 0.82, 12); legGeo.translate(0, -0.41, 0);
    const leftLeg = new THREE.Mesh(legGeo, matCalca); leftLeg.position.set(-0.13, 0.88, 0);
    const rightLeg = new THREE.Mesh(legGeo, matCalca); rightLeg.position.set(0.13, 0.88, 0);
    group.add(leftLeg, rightLeg);

    const hipGeo = new THREE.BoxGeometry(hipW, 0.18, 0.28);
    const hip = new THREE.Mesh(hipGeo, matCalca); hip.position.set(0, 0.9, 0); group.add(hip);

    const torsoGeo = new THREE.BoxGeometry(torsoW, 0.70, 0.28);
    const torso = new THREE.Mesh(torsoGeo, matCamisa); torso.position.set(0, 1.34, 0); group.add(torso);

    if (isFemale) {
      const skirtGeo = new THREE.CylinderGeometry(0.22, 0.31, 0.34, 14);
      const skirt = new THREE.Mesh(skirtGeo, matCalca); skirt.position.set(0, 0.86, 0);
      const chestGeo = new THREE.SphereGeometry(0.12, 10, 10);
      const chestL = new THREE.Mesh(chestGeo, matCamisa); chestL.position.set(-0.11, 1.43, 0.15); chestL.scale.set(1, 0.85, 0.55);
      const chestR = new THREE.Mesh(chestGeo, matCamisa); chestR.position.set(0.11, 1.43, 0.15); chestR.scale.set(1, 0.85, 0.55);
      group.add(skirt, chestL, chestR);
    }

    const shoulderGeo = new THREE.SphereGeometry(0.105, 10, 10);
    const leftShoulder = new THREE.Mesh(shoulderGeo, matCamisa); leftShoulder.position.set(-shoulderW, 1.62, 0);
    const rightShoulder = new THREE.Mesh(shoulderGeo, matCamisa); rightShoulder.position.set(shoulderW, 1.62, 0);
    group.add(leftShoulder, rightShoulder);

    const armGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.62, 10); armGeo.translate(0, -0.31, 0);
    const leftArm = new THREE.Mesh(armGeo, matPele); leftArm.position.set(-shoulderW, 1.62, 0);
    const rightArm = new THREE.Mesh(armGeo, matPele); rightArm.position.set(shoulderW, 1.62, 0);
    group.add(leftArm, rightArm);

    const headGroup = new THREE.Group(); headGroup.position.set(0, 1.96, 0);
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.27, 18, 18), matPele);
    const noseGeo = new THREE.SphereGeometry(0.025, 6, 6); noseGeo.scale(1, 1.2, 1.5);
    const noseMesh = new THREE.Mesh(noseGeo, matPele); noseMesh.position.set(0, -0.02, 0.27);

    let hairMesh;
    if (isFemale) {
      const hairTopGeo = new THREE.SphereGeometry(0.305, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.85);
      hairMesh = new THREE.Mesh(hairTopGeo, matCabelo); hairMesh.position.set(0, 0.02, -0.02);
      const ponytailGeo = new THREE.CylinderGeometry(0.08, 0.13, 0.42, 10); ponytailGeo.translate(0, -0.21, 0);
      const ponytail = new THREE.Mesh(ponytailGeo, matCabelo); ponytail.position.set(0, -0.05, -0.27); ponytail.rotation.x = 0.28;
      headGroup.add(ponytail);
    } else {
      const hairGeo = new THREE.SphereGeometry(0.285, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.62);
      hairMesh = new THREE.Mesh(hairGeo, matCabelo); hairMesh.position.set(0, 0.07, 0);
    }

    const eyeWhiteGeo = new THREE.SphereGeometry(0.052, 10, 10);
    const eyePupilGeo = new THREE.SphereGeometry(0.022, 8, 8);
    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, matBrancoOlho); leftEyeWhite.position.set(-0.09, 0.06, 0.22);
    const leftEyePupil = new THREE.Mesh(eyePupilGeo, matOlho); leftEyePupil.position.set(-0.09, 0.06, 0.255);
    const rightEyeWhite = new THREE.Mesh(eyeWhiteGeo, matBrancoOlho); rightEyeWhite.position.set(0.09, 0.06, 0.22);
    const rightEyePupil = new THREE.Mesh(eyePupilGeo, matOlho); rightEyePupil.position.set(0.09, 0.06, 0.255);

    const browGeo = new THREE.BoxGeometry(0.09, 0.015, 0.01);
    const leftBrow = new THREE.Mesh(browGeo, matSobrancelha); leftBrow.position.set(-0.09, 0.12, 0.235);
    const rightBrow = new THREE.Mesh(browGeo, matSobrancelha); rightBrow.position.set(0.09, 0.12, 0.235);
    const mouthMesh = new THREE.Mesh(new THREE.BoxGeometry(isFemale ? 0.075 : 0.06, 0.02, 0.01), matBoca);
    mouthMesh.position.set(0, -0.11, 0.25);

    headGroup.add(headMesh, hairMesh, noseMesh, leftEyeWhite, leftEyePupil, rightEyeWhite, rightEyePupil, leftBrow, rightBrow, mouthMesh);
    group.add(headGroup);

    const ringGeo = new THREE.RingGeometry(0.65, 0.82, 24); ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.0 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat); ringMesh.position.y = 0.03; ringMesh.userData.isRing = true;
    group.add(ringMesh);

    group.userData = { leftLeg, rightLeg, leftArm, rightArm, headGroup, ringMat, matCamisa, matCalca, matSapato, walkPhase: 0, emotePhase: 0, isEmoting: false, isFemale };
    return group;
  }

  async alternarGeneroMeuAvatar() {
    if (!this.localPlayer || !this.scene) return;
    const novoFem = !this.localPlayer.isFemale;
    this.localPlayer.isFemale = novoFem;

    const btn = document.getElementById('es-city-gender-btn');
    if (btn) btn.innerHTML = novoFem ? '👩 Female' : '🧑 Male';

    const oldMesh = this.localPlayer.mesh;
    const corCamisaAtual = this.localPlayer.shirtColor || (novoFem ? 0xec4899 : 0x8b5cf6);
    const corSapatoAtual = this.localPlayer.shoeColor || 0x111111;
    const newMesh = this.criarBonecoHumano3D(corCamisaAtual, 0x1e1b4b, 0xfde68a, novoFem);
    if (newMesh.userData?.matSapato) newMesh.userData.matSapato.color.setHex(corSapatoAtual);
    newMesh.position.set(this.localPlayer.x, 0, this.localPlayer.z);
    newMesh.rotation.y = this.localPlayer.rotY;
    this.scene.remove(oldMesh);
    this.scene.add(newMesh);
    this.localPlayer.mesh = newMesh;

    await fetch('/api/workspace/english-spaces/progress/customization', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        userId: this.localPlayer.userId,
        isFemale: novoFem,
        shirtColor: corCamisaAtual,
        shoeColor: corSapatoAtual,
        petType: this.localPlayer.petType || null
      })
    }).catch(() => {});
    this.enviarMinhaPosicaoServidor();
  }

  aplicarItemCompradoNoAvatar(item) {
    if (!this.localPlayer?.mesh?.userData || !item) return;
    const ud = this.localPlayer.mesh.userData;
    if (item.tipo === 'shirt' && ud.matCamisa) {
      ud.matCamisa.color.setHex(item.cor);
      this.localPlayer.shirtColor = item.cor;
    } else if (item.tipo === 'shoes' && ud.matSapato) {
      ud.matSapato.color.setHex(item.cor);
      this.localPlayer.shoeColor = item.cor;
    } else if (item.tipo === 'pet_dog' || item.tipo === 'pet_cat') {
      if (this.adoptedPet) this.scene.remove(this.adoptedPet);
      const petMesh = item.tipo === 'pet_dog' ? this.criarCachorro3D() : this.criarGato3D();
      petMesh.position.set(this.localPlayer.x - 0.9, 0, this.localPlayer.z + 0.9);
      this.scene.add(petMesh);
      this.adoptedPet = petMesh;
      this.localPlayer.petType = item.tipo;
    } else if (item.tipo === 'vehicle' && item.vehicleType) {
      if (!this.ownedVehicles.includes(item.vehicleType)) {
        this.ownedVehicles.push(item.vehicleType);
      }
      this.alternarOuMontarVeiculo(item.vehicleType);
    } else if (item.tipo === 'material') {
      this.materialsCount = (this.materialsCount || 0) + (item.units || 1);
    } else if (item.tipo === 'house_upgrade') {
      this.houseStage = Math.min(5, Math.max(this.houseStage || 1, item.targetStage || (this.houseStage + 1)));
      this.criarLoteamentoResidencial();
    }
  }

  abrirLojaXPModal(buildingId, item) {
    document.getElementById('shop-modal')?.remove();
    const saldoDRX = DOVRYX.getBalance();
    const precoVoz = Math.max(10, Math.round(item.preco * 0.8));

    const html = `
      <div id="shop-modal" style="position:fixed; inset:0; z-index:1000100; background:rgba(5,7,14,0.78); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; font-family:Inter,sans-serif; padding:16px;">
        <div style="background:#0f172a; border:2px solid #8b5cf6; border-radius:20px; padding:24px; width:100%; max-width:380px; text-align:center; box-shadow:0 20px 60px rgba(0,0,0,0.65);">
          <div style="font-size:52px;">${item.emoji}</div>
          <h2 style="color:#f8fafc; margin:10px 0 6px; font-size:20px;">${item.nome}</h2>
          <p style="color:#94a3b8; font-size:13.5px; margin:0 0 12px;">Price: <b style="color:#facc15;">${item.preco} DRX</b> • Wallet: <b style="color:#34d399;">${saldoDRX.toLocaleString('pt-BR')} DRX 💎</b></p>
          <div style="background:rgba(139,92,246,0.15); border:1px solid rgba(167,139,250,0.35); border-radius:12px; padding:10px; margin-bottom:16px; color:#e9d5ff; font-size:13px;">
            🎙️ <b>Voice Discount (-20%):</b> Say:<br><i>"I would like to buy ${item.nome}"</i>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px;">
            <button id="shop-voice-buy" style="padding:12px; background:linear-gradient(135deg,#10b981,#059669); color:#fff; border:none; border-radius:12px; font-weight:800; cursor:pointer; font-size:13.5px;">🎤 Speak in English (${precoVoz} DRX)</button>
            <div style="display:flex; gap:8px;">
              <button id="shop-cancel" style="flex:1; padding:11px; background:#1e293b; color:#cbd5e1; border:none; border-radius:12px; font-weight:700; cursor:pointer;">Cancel</button>
              <button id="shop-buy" style="flex:1.3; padding:11px; background:#8b5cf6; color:#fff; border:none; border-radius:12px; font-weight:800; cursor:pointer;">💎 Buy (${item.preco} DRX)</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    const finalizarCompra = async (custo, viaVoz = false) => {
      if (DOVRYX.getBalance() < custo) {
        if (window.Workspace?.mostrarAviso) {
          window.Workspace.mostrarAviso(`🔒 Need ${custo} DRX! Visit the Guild Baú do Inglês or work a shift to earn more DRX!`, 'warning');
        }
        return;
      }
      document.getElementById('shop-modal')?.remove();
      this.aplicarItemCompradoNoAvatar(item);
      this.falarTextoNPC(`Thank you! Enjoy your new ${item.nome}!`, buildingId);

      const res = await fetch('/api/workspace/english-spaces/progress/customization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: this.localPlayer.userId,
          ownerName: this.localPlayer.nome,
          isFemale: this.localPlayer.isFemale,
          shirtColor: this.localPlayer.shirtColor,
          shoeColor: this.localPlayer.shoeColor,
          petType: this.localPlayer.petType,
          equippedVehicle: this.currentVehicle,
          ownedVehicles: this.ownedVehicles,
          houseStage: this.houseStage,
          materialsCount: this.materialsCount,
          purchasedItem: item,
          costXP: custo,
          bonusXP: 15
        })
      }).then(r => r.json()).catch(() => null);

      if (res && res.success && typeof res.totalXP === 'number') {
        DOVRYX.setBalance(res.totalXP);
      } else {
        DOVRYX.setBalance(DOVRYX.getBalance() - custo + 15);
      }
      if (window.Workspace?.mostrarAviso) {
        window.Workspace.mostrarAviso(`🛍️ Purchased ${item.nome}${viaVoz ? ' (20% Voice Discount)' : ''}!`, 'success');
      }
      this.enviarMinhaPosicaoServidor();
    };

    document.getElementById('shop-cancel')?.addEventListener('click', () => document.getElementById('shop-modal')?.remove());
    document.getElementById('shop-buy')?.addEventListener('click', () => finalizarCompra(item.preco, false));
    document.getElementById('shop-voice-buy')?.addEventListener('click', () => {
      this.parentManager?.ouvirMicrofone((falado) => {
        if (falado && falado.trim().length > 2) {
          this.mostrarBalaoNoBoneco(this.localPlayer, falado, 5000);
          finalizarCompra(precoVoz, true);
        }
      });
    });
  }

  animarPassosBoneco(meshGroup, estaAndando, delta) {
    const ud = meshGroup?.userData; if (!ud || !ud.leftLeg) return;
    if (ud.isEmoting) {
      ud.emotePhase += delta * 6;
      const wave = Math.sin(ud.emotePhase) * 1.2;
      if (ud.rightArm && ud.rightArm.rotation) { ud.rightArm.rotation.x = -1.8 + wave * 0.3; ud.rightArm.rotation.z = -0.3; }
      if (ud.emotePhase > Math.PI * 2) {
        ud.isEmoting = false; ud.emotePhase = 0;
        if (ud.rightArm && ud.rightArm.rotation) ud.rightArm.rotation.z = 0;
      }
      return;
    }
    if (estaAndando) {
      ud.walkPhase += delta * 10;
      const ang = Math.sin(ud.walkPhase) * 0.55;
      if (ud.leftLeg.rotation) {
        ud.leftLeg.rotation.x = ang;
        ud.rightLeg.rotation.x = -ang;
        ud.leftArm.rotation.x = -ang * 0.8;
        ud.rightArm.rotation.x = ang * 0.8;
      }
    } else if (ud.leftLeg.rotation) {
      ud.leftLeg.rotation.x *= 0.85;
      ud.rightLeg.rotation.x *= 0.85;
      ud.leftArm.rotation.x *= 0.85;
      ud.rightArm.rotation.x *= 0.85;
    }
  }

  animarEmote(entidade) {
    if (!entidade?.mesh?.userData) return;
    entidade.mesh.userData.isEmoting = true;
    entidade.mesh.userData.emotePhase = 0;
  }

  podeMoverPara(newX, newZ, oldX, oldZ) {
    const doorHalfWidth = 1.15;
    const wallThick = 0.42;
    const doorDepth = 1.15;

    for (const b of this.buildingsMeta) {
      const insideNew = newX > b.minX + 0.25 && newX < b.maxX - 0.25 && newZ > b.minZ + 0.25 && newZ < b.maxZ - 0.25;
      const insideOld = oldX > b.minX + 0.25 && oldX < b.maxX - 0.25 && oldZ > b.minZ + 0.25 && oldZ < b.maxZ - 0.25;

      if (insideNew === insideOld) {
        if (!insideNew) {
          const touchingBox = newX >= b.minX - wallThick && newX <= b.maxX + wallThick && newZ >= b.minZ - wallThick && newZ <= b.maxZ + wallThick;
          if (touchingBox) {
            const nearFrontDoor = Math.abs(newX - b.frontX) < 1.25 && Math.abs(newZ - b.doorZ) < doorHalfWidth;
            if (!nearFrontDoor) return false;
          }
        }
        continue;
      }

      const frontX = b.frontX;
      const doorZ = b.doorZ;
      const door = this.doors.get(b.id);
      const isDoorOpen = door ? door.userData.isOpen : true;
      const crossingDoor = Math.abs(newZ - doorZ) < doorHalfWidth && Math.abs(oldX - frontX) < 2.8;
      const nearDoor = Math.abs(newX - frontX) < doorDepth || Math.abs(oldX - frontX) < doorDepth;

      if (crossingDoor && nearDoor) {
        if (!isDoorOpen) return false;
        if (b.id !== this.lastDoorEnter) {
          this.tocarSinoPorta();
          this.lastDoorEnter = b.id;
          setTimeout(() => { if (this.lastDoorEnter === b.id) this.lastDoorEnter = null; }, 1200);
        }
        continue;
      }
      return false;
    }
    if (newX < -75 || newX > 82 || newZ < -135 || newZ > 70) return false;
    return true;
  }

  tocarSinoPorta() {
    try {
      const ctx = this.garantirAudioAtivo();
      if (!ctx) return;
      const playTone = (freq, start, dur, vol) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.frequency.value = freq; osc.type = 'sine';
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start); osc.stop(ctx.currentTime + start + dur);
      };
      playTone(880, 0, 0.18, 0.22); playTone(1320, 0.12, 0.28, 0.18);
    } catch (e) {}
  }

  tocarSomPasso(volume = 0.26) {
    try {
      const ctx = this.garantirAudioAtivo();
      if (!ctx) return;
      const now = ctx.currentTime;
      const isIndoor = this.modoInterior;

      const osc = ctx.createOscillator();
      const gainOsc = ctx.createGain();
      osc.type = isIndoor ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isIndoor ? 190 : 135, now);
      osc.frequency.exponentialRampToValueAtTime(48, now + 0.075);
      gainOsc.gain.setValueAtTime(volume, now);
      gainOsc.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gainOsc);
      gainOsc.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.085);

      const bufferSize = Math.floor(ctx.sampleRate * 0.045);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = isIndoor ? 1100 : 1650;
      const gainNoise = ctx.createGain();
      gainNoise.gain.setValueAtTime(volume * 0.7, now);
      gainNoise.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      whiteNoise.connect(filter);
      filter.connect(gainNoise);
      gainNoise.connect(ctx.destination);
      whiteNoise.start(now);
    } catch (e) {}
  }

  soltarPegada() {
    const THREE = window.THREE;
    if (Date.now() - this.lastFootprint < 330) return;
    this.lastFootprint = Date.now();

    const peg = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 0.42),
      new THREE.MeshBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.32 })
    );
    peg.rotation.x = -Math.PI / 2;
    peg.position.set(this.localPlayer.x + (Math.random() - 0.5) * 0.2, 0.03, this.localPlayer.z + (Math.random() - 0.5) * 0.2);
    peg.rotation.z = this.localPlayer.rotY;
    this.scene.add(peg);
    this.footprints.push({ mesh: peg, born: Date.now() });

    this.tocarSomPasso(0.28);
  }

  decorarInteriorEdificio3D(id, centerX, centerZ, col, bCfg) {
    const THREE = window.THREE;
    const signCol = Math.sign(col);
    const cX = centerX + (signCol * 1.8);
    const props = new THREE.Group();

    const makeClickable = (mesh, name, extraData = {}) => {
      mesh.userData = { ...mesh.userData, clickable: true, englishName: name, xp: 15, ...extraData };
      this.clickableObjects.push(mesh);
      return mesh;
    };

    const criarConjuntoMesa = (mx, mz, corTampo = 0x78350f, corCadeira = 0x1e293b, nomeMesa = 'Table') => {
      const g = new THREE.Group();
      const pe = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.75, 10), new THREE.MeshLambertMaterial({ color: 0x334155 }));
      pe.position.y = 0.375;
      const tampo = makeClickable(new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.08, 16), new THREE.MeshLambertMaterial({ color: corTampo })), nomeMesa);
      tampo.position.y = 0.76;
      g.add(pe, tampo);

      [-0.85, 0.85].forEach(offsetZ => {
        const assento = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.45, 0.42), new THREE.MeshLambertMaterial({ color: corCadeira })), 'Chair');
        assento.position.set(0, 0.225, offsetZ);
        g.add(assento);
      });
      g.position.set(mx, 0, mz);
      return g;
    };

    switch (id) {
      case 'coffee': {
        const counter = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 4.4), new THREE.MeshLambertMaterial({ color: 0x451a03 })), 'Coffee Counter');
        counter.position.set(cX, 0.55, centerZ);
        const espresso = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.6, 0.9), new THREE.MeshLambertMaterial({ color: 0x18181b })), 'Espresso Machine');
        espresso.position.set(cX, 1.4, centerZ - 1.1);
        const pastryCase = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.45, 1.1), new THREE.MeshLambertMaterial({ color: 0xfde68a })), 'Pastry Display');
        pastryCase.position.set(cX, 1.35, centerZ + 1.1);
        props.add(counter, espresso, pastryCase);
        props.add(criarConjuntoMesa(centerX - (signCol * 1.6), centerZ - 2.5, 0x92400e, 0x27272a, 'Coffee Table'));
        props.add(criarConjuntoMesa(centerX - (signCol * 1.6), centerZ + 2.5, 0x92400e, 0x27272a, 'Coffee Table'));
        break;
      }
      case 'restaurant': {
        const counter = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.1, 3.8), new THREE.MeshLambertMaterial({ color: 0x881337 })), 'Chef Counter');
        counter.position.set(cX, 0.55, centerZ);
        props.add(counter);
        props.add(criarConjuntoMesa(centerX - (signCol * 1.2), centerZ - 2.6, 0xbe123c, 0x1e293b, 'Dining Table'));
        props.add(criarConjuntoMesa(centerX - (signCol * 1.2), centerZ + 2.6, 0xbe123c, 0x1e293b, 'Dining Table'));
        break;
      }
      case 'school': {
        const teacherDesk = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.85, 2.6), new THREE.MeshLambertMaterial({ color: 0x78350f })), 'Teacher Desk');
        teacherDesk.position.set(cX, 0.425, centerZ);
        props.add(teacherDesk);
        [-2.0, 2.0].forEach(dz => {
          const desk = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.72, 1.1), new THREE.MeshLambertMaterial({ color: 0xd97706 })), 'Student Desk');
          desk.position.set(centerX - (signCol * 1.4), 0.36, centerZ + dz);
          props.add(desk);
        });
        break;
      }
      case 'shopping': {
        const cashier = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.05, 3.2), new THREE.MeshLambertMaterial({ color: 0xfef08a })), 'Cash Register');
        cashier.position.set(cX, 0.525, centerZ);
        const rack = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.4, 2.2), new THREE.MeshLambertMaterial({ color: 0xec4899 })), 'Clothing Rack');
        rack.position.set(centerX - (signCol * 1.5), 0.7, centerZ - 2.3);
        const mirror = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.1, 1.3), new THREE.MeshLambertMaterial({ color: 0xbae6fd })), 'Fitting Room Mirror');
        mirror.position.set(centerX + (signCol * 4.5), 1.15, centerZ + 2.6);
        props.add(cashier, rack, mirror);
        break;
      }
      case 'home': {
        const kitchen = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.05, 3.2), new THREE.MeshLambertMaterial({ color: 0xe2e8f0 })), 'Kitchen Island');
        kitchen.position.set(cX, 0.525, centerZ - 1.4);
        const sofa = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.65, 2.6), new THREE.MeshLambertMaterial({ color: 0x4f46e5 })), 'Living Room Sofa');
        sofa.position.set(centerX - (signCol * 1.5), 0.325, centerZ + 1.8);
        const tv = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.1, 2.0), new THREE.MeshBasicMaterial({ color: 0x0ea5e9 })), 'Smart TV');
        tv.position.set(centerX + (signCol * 4.5), 1.7, centerZ + 1.8);
        props.add(kitchen, sofa, tv);
        break;
      }
      case 'cinema': {
        const screen = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.4, 6.2), new THREE.MeshBasicMaterial({ color: 0xe0f2fe })), 'Movie Screen');
        screen.position.set(centerX + (signCol * 4.6), 2.1, centerZ);
        const popcorn = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.4, 1.3), new THREE.MeshLambertMaterial({ color: 0xfacc15 })), 'Popcorn Machine');
        popcorn.position.set(cX, 0.7, centerZ + 2.5);
        const seat = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.75, 2.4), new THREE.MeshLambertMaterial({ color: 0xdc2626 })), 'Theater Seats');
        seat.position.set(centerX - (signCol * 1.5), 0.375, centerZ - 1.2);
        props.add(screen, popcorn, seat);
        break;
      }
      case 'taxi': {
        const booth = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.1, 2.6), new THREE.MeshLambertMaterial({ color: 0xfacc15 })), 'Taxi Dispatch Radio', { isTaxiRadio: true });
        booth.position.set(cX, 0.55, centerZ - 1.5);
        const taxiCar = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.85, 3.4), new THREE.MeshLambertMaterial({ color: 0xeab308 })), 'Yellow Taxi Cab', { isTaxiRadio: true });
        taxiCar.position.set(centerX - (signCol * 1.4), 0.425, centerZ + 1.6);
        props.add(booth, taxiCar);
        break;
      }
      case 'beach': {
        const tikiBar = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.1, 3.4), new THREE.MeshLambertMaterial({ color: 0x92400e })), 'Coconut Beach Bar');
        tikiBar.position.set(cX, 0.55, centerZ);
        const lounge = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.3, 0.85), new THREE.MeshLambertMaterial({ color: 0xf8fafc })), 'Beach Lounge Chair');
        lounge.position.set(centerX - (signCol * 1.6), 0.15, centerZ + 1.8);
        const umbrella = makeClickable(new THREE.Mesh(new THREE.ConeGeometry(1.4, 0.65, 10), new THREE.MeshLambertMaterial({ color: 0xf43f5e })), 'Beach Umbrella');
        umbrella.position.set(centerX - (signCol * 1.6), 2.2, centerZ + 1.8);
        props.add(tikiBar, lounge, umbrella);
        break;
      }
      case 'hotel': {
        const reception = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.15, 4.2), new THREE.MeshLambertMaterial({ color: 0x3b0764 })), 'Hotel Reception Desk');
        reception.position.set(cX, 0.575, centerZ);
        const luggage = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.75, 1.1), new THREE.MeshLambertMaterial({ color: 0xeab308 })), 'Luggage Cart');
        luggage.position.set(centerX - (signCol * 1.6), 0.375, centerZ + 2.4);
        props.add(reception, luggage);
        break;
      }
      case 'airport': {
        const desk = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.1, 3.4), new THREE.MeshLambertMaterial({ color: 0x0284c7 })), 'Check-in Counter');
        desk.position.set(cX, 0.55, centerZ - 1.0);
        const scanner = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.3, 1.6), new THREE.MeshLambertMaterial({ color: 0x38bdf8 })), 'Security Scanner');
        scanner.position.set(centerX - (signCol * 1.8), 1.15, centerZ + 2.2);
        props.add(desk, scanner);
        break;
      }
      case 'job': {
        const execDesk = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.85, 3.4), new THREE.MeshLambertMaterial({ color: 0x1e1b4b })), 'Interview Desk');
        execDesk.position.set(cX, 0.425, centerZ);
        const laptop = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.35, 0.55), new THREE.MeshLambertMaterial({ color: 0x38bdf8 })), 'Laptop Computer');
        laptop.position.set(cX, 1.0, centerZ);
        const bookshelf = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.3, 2.2), new THREE.MeshLambertMaterial({ color: 0x451a03 })), 'Career Bookshelf');
        bookshelf.position.set(centerX + (signCol * 4.4), 1.15, centerZ - 2.4);
        props.add(execDesk, laptop, bookshelf);
        break;
      }
      case 'hospital': {
        const docDesk = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.95, 2.8), new THREE.MeshLambertMaterial({ color: 0xf8fafc })), 'Doctor Desk');
        docDesk.position.set(cX, 0.475, centerZ - 1.2);
        const medBed = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.65, 1.1), new THREE.MeshLambertMaterial({ color: 0xbae6fd })), 'Examination Bed');
        medBed.position.set(centerX - (signCol * 1.4), 0.325, centerZ + 2.1);
        props.add(docDesk, medBed);
        break;
      }
      default: {
        const shopCounter = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.05, 3.6), new THREE.MeshLambertMaterial({ color: bCfg.color || 0x334155 })), `${id.toUpperCase()} Counter`);
        shopCounter.position.set(cX, 0.525, centerZ);
        props.add(shopCounter);
        break;
      }
    }

    this.scene.add(props);
    this.interiorGroups.set(id, props);
  }

 criarPostesAvenida3D() {
  const THREE = window.THREE;
  if (!THREE || !this.exteriorGroup || !this.scene) return;

  this.posteLights = [];

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x263442,
    metalness: 0.72,
    roughness: 0.38
  });

  const housingMat = new THREE.MeshStandardMaterial({
    color: 0x374151,
    metalness: 0.65,
    roughness: 0.42
  });

  const lampOffMat = new THREE.MeshBasicMaterial({
    color: 0x64748b
  });

  const lampOnMat = new THREE.MeshBasicMaterial({
    color: 0xffe2a8
  });

  for (let row = 0; row < 6; row++) {
    const zPos = -row * 16 + 6;

    [-6.8, 6.8, -28.5, -39.5, 28.5, 39.5].forEach((xPos, idx) => {

      const direction = xPos > 0 ? -1 : 1;

      // Corpo principal do poste
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.12, 4.2, 12),
        metalMat
      );

      pole.position.set(xPos, 2.1, zPos);
      pole.castShadow = true;

      // Braço horizontal
      const arm = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.07, 0.07),
        metalMat
      );

      arm.position.set(
        xPos + direction * 0.38,
        4.12,
        zPos
      );

      // Estrutura da luminária
      const housing = new THREE.Mesh(
        new THREE.BoxGeometry(0.72, 0.13, 0.34),
        housingMat
      );

      housing.position.set(
        xPos + direction * 0.78,
        4.19,
        zPos
      );

      housing.castShadow = true;

      // Difusor de luz
      const lampHead = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.025, 0.24),
        lampOffMat.clone()
      );

      lampHead.position.set(
        xPos + direction * 0.78,
        4.11,
        zPos
      );

      this.exteriorGroup.add(
        pole,
        arm,
        housing,
        lampHead
      );

      // Luzes principais da avenida
      if (idx < 2) {
        const light = new THREE.PointLight(
          0xffd6a0,
          0,
          13,
          2
        );

        light.position.set(
          xPos + direction * 0.78,
          4.05,
          zPos
        );

        this.scene.add(light);

        this.posteLights.push({
          light,
          lampHead
        });
      }
    });
  }
}

  criarCeuRealista() {
    const THREE = window.THREE;
    const sunGeo = new THREE.SphereGeometry(2.2, 24, 24); const sunMat = new THREE.MeshBasicMaterial({ color: 0xffd60a }); this.sunMesh = new THREE.Mesh(sunGeo, sunMat); this.scene.add(this.sunMesh);
    const moonGeo = new THREE.SphereGeometry(1.6, 20, 20); const moonMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 }); this.moonMesh = new THREE.Mesh(moonGeo, moonMat); this.scene.add(this.moonMesh);
    this.starsGroup = new THREE.Group();
    for (let i = 0; i < 220; i++) {
      const star = new THREE.Mesh(new THREE.SphereGeometry(0.06 + Math.random() * 0.08, 4, 4), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      const r = 95 + Math.random() * 35; const theta = Math.random() * Math.PI * 2; const phi = Math.random() * Math.PI * 0.6 + 0.1;
      star.position.set(r * Math.sin(phi) * Math.cos(theta), 25 + r * Math.cos(phi) * 0.6, r * Math.sin(phi) * Math.sin(theta) - 35);
      star.userData.twinkle = Math.random() * Math.PI * 2;
      this.starsGroup.add(star);
    }
    this.scene.add(this.starsGroup);

    this.cloudsGroup = new THREE.Group();
    for (let c = 0; c < 8; c++) {
      const cloud = new THREE.Group();
      const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.82 });
      for (let j = 0; j < 4; j++) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(0.9 + Math.random() * 0.7, 8, 8), cloudMat);
        puff.position.set((Math.random() - 0.5) * 2.5, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 2.5);
        cloud.add(puff);
      }
      cloud.position.set((Math.random() - 0.5) * 110, 24 + Math.random() * 10, (Math.random() - 0.5) * 100 - 35);
      cloud.userData.speed = 0.2 + Math.random() * 0.4;
      this.cloudsGroup.add(cloud);
    }
    this.scene.add(this.cloudsGroup);
  }

  atualizarCicloDiaNoite() {
    if (!this.scene) return;
    const hour = new Date().getHours();
    const THREE = window.THREE;
    let mode = 'day';
    if (hour >= 17 && hour < 18) mode = 'sunset';
    else if (hour >= 18 || hour < 6) mode = 'night';

    if (mode === 'day') {
      this.scene.background = new THREE.Color(0x87ceeb); this.scene.fog = new THREE.FogExp2(0x87ceeb, 0.005);
      if (this.ambientLight) { this.ambientLight.color.setHex(0xffffff); this.ambientLight.intensity = 0.85; }
      if (this.dirLight) { this.dirLight.color.setHex(0xffffff); this.dirLight.intensity = 0.9; this.dirLight.position.set(25, 55, 20); }
      if (this.sunMesh) { this.sunMesh.visible = true; this.sunMesh.position.set(20, 48, -40); }
      if (this.moonMesh) this.moonMesh.visible = false;
      if (this.starsGroup) this.starsGroup.visible = false;
      if (this.cloudsGroup) this.cloudsGroup.visible = true;
      this.posteLights.forEach(p => { p.light.intensity = 0; p.lampHead.material.color.setHex(0x334155); });
    } else if (mode === 'sunset') {
      this.scene.background = new THREE.Color(0xff8c42); this.scene.fog = new THREE.FogExp2(0xff8c42, 0.007);
      if (this.ambientLight) { this.ambientLight.color.setHex(0xffb26b); this.ambientLight.intensity = 0.65; }
      if (this.dirLight) { this.dirLight.color.setHex(0xff9a4d); this.dirLight.intensity = 0.55; this.dirLight.position.set(35, 8, -15); }
      if (this.sunMesh) { this.sunMesh.visible = true; this.sunMesh.position.set(55, 9, -25); this.sunMesh.material.color.setHex(0xff6b35); }
      if (this.moonMesh) this.moonMesh.visible = false;
      if (this.starsGroup) this.starsGroup.visible = false;
      if (this.cloudsGroup) this.cloudsGroup.visible = true;
      this.posteLights.forEach(p => {
  p.light.intensity = 0.35;
  p.lampHead.material.color.setHex(0xffe2a8);
});
    } else {
      this.scene.background = new THREE.Color(0x070b1a); this.scene.fog = new THREE.FogExp2(0x070b1a, 0.008);
      if (this.ambientLight) { this.ambientLight.color.setHex(0x8b9dc3); this.ambientLight.intensity = 0.45; }
      if (this.dirLight) { this.dirLight.color.setHex(0x8b9dc3); this.dirLight.intensity = 0.25; this.dirLight.position.set(-20, 35, 15); }
      if (this.sunMesh) this.sunMesh.visible = false;
      if (this.moonMesh) { this.moonMesh.visible = true; this.moonMesh.position.set(-18, 32, -35); }
      if (this.starsGroup) {
        this.starsGroup.visible = true;
        this.starsGroup.children.forEach(s => { s.userData.twinkle += 0.04; s.material.opacity = 0.6 + Math.sin(s.userData.twinkle) * 0.4; s.material.transparent = true; });
      }
      if (this.cloudsGroup) this.cloudsGroup.visible = true;
      this.posteLights.forEach(p => {
  p.light.intensity = 0.85;
  p.lampHead.material.color.setHex(0xffe2a8);
});
    }
  }

  gerarTexturaPisoPremium(tipo) {
    const THREE = window.THREE;
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (tipo === 'wood') {
      ctx.fillStyle = '#7c4a2d'; ctx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 512; i += 64) { ctx.fillStyle = i % 128 === 0 ? '#6b3f24' : '#8b5e3c'; ctx.fillRect(0, i, 512, 12); }
    } else if (tipo === 'tile-check') {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 512, 512);
      for (let y = 0; y < 512; y += 64) for (let x = 0; x < 512; x += 64) { ctx.fillStyle = ((x + y) % 128 === 0) ? '#111827' : '#f3f4f6'; ctx.fillRect(x + 2, y + 2, 60, 60); }
    } else if (tipo === 'marble') {
      ctx.fillStyle = '#e5e7eb'; ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = 'rgba(139,92,246,0.18)'; ctx.lineWidth = 2;
      for (let i = 0; i < 20; i++) { ctx.beginPath(); ctx.moveTo(512 * Math.random(), 0); ctx.bezierCurveTo(512 * Math.random(), 170, 512 * Math.random(), 340, 512 * Math.random(), 512); ctx.stroke(); }
    } else if (tipo === 'carpet') {
      ctx.fillStyle = '#dc2626'; ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = 'rgba(0,0,0,0.15)'; for (let i = 0; i < 512; i += 16) ctx.fillRect(0, i, 512, 2);
    } else if (tipo === 'sand') {
      ctx.fillStyle = '#fde68a'; ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = 'rgba(180,120,60,0.18)'; for (let i = 0; i < 300; i++) ctx.fillRect(512 * Math.random(), 512 * Math.random(), 3, 3);
    } else {
      ctx.fillStyle = '#334155'; ctx.fillRect(0, 0, 512, 512);
    }
    const tex = new THREE.CanvasTexture(canvas); tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(3, 3); return tex;
  }

  gerarTexturaParalelepipedo() {
  const THREE = window.THREE;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;

  const ctx = canvas.getContext('2d');

  // Base escura dos rejuntes
  ctx.fillStyle = '#343b40';
  ctx.fillRect(0, 0, 512, 512);

  const cores = [
    '#a7aaa5',
    '#b8b9b2',
    '#999f9d',
    '#c2c1b8',
    '#8f9795',
    '#adb2ac',
    '#c8c5bb'
  ];

  const blockW = 64;
  const blockH = 32;

  for (let y = 0; y < 512; y += blockH) {
    const offset =
      Math.floor(y / blockH) % 2 === 0
        ? 0
        : blockW / 2;

    for (
      let x = -blockW;
      x < 512 + blockW;
      x += blockW
    ) {
      const px = x + offset + 2;
      const py = y + 2;

      const cor =
        cores[Math.floor(Math.random() * cores.length)];

      ctx.fillStyle = cor;

      // Pedra principal
      ctx.fillRect(
        px,
        py,
        blockW - 4,
        blockH - 4
      );

      // Variação de iluminação na superfície
      const gradient = ctx.createLinearGradient(
        px,
        py,
        px,
        py + blockH
      );

      gradient.addColorStop(
        0,
        'rgba(255,255,255,0.12)'
      );

      gradient.addColorStop(
        1,
        'rgba(0,0,0,0.16)'
      );

      ctx.fillStyle = gradient;

      ctx.fillRect(
        px,
        py,
        blockW - 4,
        blockH - 4
      );

      // Pequenas marcas naturais
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = 'rgba(40,45,45,0.07)';

        ctx.fillRect(
          px + Math.random() * (blockW - 10),
          py + Math.random() * (blockH - 8),
          2 + Math.random() * 5,
          1 + Math.random() * 2
        );
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);

  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 18);
  tex.anisotropy = 8;

  return tex;
}

criarAvenidaRealista() {
    const THREE = window.THREE;
    const paralelepipedoTex = this.gerarTexturaParalelepipedo();
    const sidewalkMat = new THREE.MeshStandardMaterial({ map: paralelepipedoTex, roughness: 0.92, metalness: 0.04 });
    const leftSidewalk = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 170), sidewalkMat); leftSidewalk.rotation.x = -Math.PI / 2; leftSidewalk.position.set(-8.8, 0.08, -36); leftSidewalk.receiveShadow = true;
    const rightSidewalk = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 170), sidewalkMat); rightSidewalk.rotation.x = -Math.PI / 2; rightSidewalk.position.set(8.8, 0.08, -36); rightSidewalk.receiveShadow = true;
    this.exteriorGroup.add(leftSidewalk, rightSidewalk);

    const curbMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 });
    const leftCurb = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 170), curbMat); leftCurb.position.set(-6.55, 0.11, -36);
    const rightCurb = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 170), curbMat); rightCurb.position.set(6.55, 0.11, -36);
    this.exteriorGroup.add(leftCurb, rightCurb);

    const laneMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    for (let z = -85; z < 20; z += 6) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 1.8), laneMat); dash.rotation.x = -Math.PI / 2; dash.position.set(0, 0.06, z);
      this.exteriorGroup.add(dash);
    }
    for (let row = 0; row < 6; row++) {
      const zPos = -row * 16;
      for (let i = -4; i < 5; i++) {
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 2.8), laneMat); stripe.rotation.x = -Math.PI / 2; stripe.position.set(i * 0.95, 0.07, zPos);
        this.exteriorGroup.add(stripe);
      }
    }
  }

  criarSegundaAvenida() {
    const THREE = window.THREE;
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const road2Left = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 160), roadMat);
    road2Left.rotation.x = -Math.PI / 2; road2Left.position.set(-34, 0.01, -36);
    const road2Right = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 160), roadMat);
    road2Right.rotation.x = -Math.PI / 2; road2Right.position.set(34, 0.01, -36);
    this.exteriorGroup.add(road2Left, road2Right);

    [12, -56, -88].forEach(zCross => {
      const crossRoad = new THREE.Mesh(new THREE.PlaneGeometry(130, 7.0), roadMat);
      crossRoad.rotation.x = -Math.PI / 2; crossRoad.position.set(8, 0.015, zCross);
      this.exteriorGroup.add(crossRoad);
    });

    const laneMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    for (let z = -85; z < 20; z += 6) {
      const d1 = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 1.6), laneMat); d1.rotation.x = -Math.PI / 2; d1.position.set(-34, 0.06, z);
      const d2 = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 1.6), laneMat); d2.rotation.x = -Math.PI / 2; d2.position.set(34, 0.06, z);
      this.exteriorGroup.add(d1, d2);
    }

    const tex = this.gerarTexturaParalelepipedo();
    const matSide = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.92 });
    [-40.5, -27.5, 27.5, 40.5].forEach(xSw => {
      const sw = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 160), matSide);
      sw.rotation.x = -Math.PI / 2; sw.position.set(xSw, 0.08, -36);
      this.exteriorGroup.add(sw);
    });
  }

  criarCenarioFundoMontanhasArvores() {
    const THREE = window.THREE;
    const fundoGroup = new THREE.Group();
    const montanhaCores = [0x334155, 0x475569, 0x1e293b, 0x3f4a5a];
    for (let i = -4; i <= 4; i++) {
      const h = 18 + Math.random() * 14 + Math.abs(i) * 1.5;
      const geo = new THREE.ConeGeometry(10 + Math.random() * 6, h, 7);
      const mat = new THREE.MeshStandardMaterial({ color: montanhaCores[Math.abs(i) % montanhaCores.length], roughness: 0.95, flatShading: true });
      const mont = new THREE.Mesh(geo, mat);
      mont.position.set(i * 24 + (Math.random() - 0.5) * 6, h / 2 - 2, -124 - Math.random() * 12);
      fundoGroup.add(mont);

      const neve = new THREE.Mesh(new THREE.ConeGeometry(3.2, 4.5, 6), new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.8 }));
      neve.position.set(0, h / 2 - 1.2, 0);
      mont.add(neve);
    }

    const criarArvore = (x, z, scale = 1) => {
      const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * scale, 0.18 * scale, 1.2 * scale, 6), new THREE.MeshStandardMaterial({ color: 0x422006, roughness: 0.9 }));
      tronco.position.set(x, 0.6 * scale, z);
      const copa = new THREE.Mesh(new THREE.ConeGeometry(0.85 * scale, 2.2 * scale, 7), new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.8, flatShading: true }));
      copa.position.set(x, 1.8 * scale, z);
      const copa2 = new THREE.Mesh(new THREE.ConeGeometry(0.65 * scale, 1.6 * scale, 6), new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.85, flatShading: true }));
      copa2.position.set(x, 2.6 * scale, z);
      fundoGroup.add(tronco, copa, copa2);
    };

    for (let z = -80; z < 10; z += 10) {
      criarArvore(-23.5, z, 1.1);
      criarArvore(23.5, z, 1.1);
    }
    this.exteriorGroup.add(fundoGroup);
  }

  criarPistaAeroporto() {
    const THREE = window.THREE;
    const runwayX = 68;
    const pista = new THREE.Mesh(new THREE.PlaneGeometry(14, 130), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85, metalness: 0.1 }));
    pista.rotation.x = -Math.PI / 2; pista.position.set(runwayX, 0.02, -55); pista.receiveShadow = true;
    this.exteriorGroup.add(pista);

    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    for (let z = -115; z < 5; z += 7) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 3.6), whiteMat);
      m.rotation.x = -Math.PI / 2; m.position.set(runwayX, 0.04, z);
      this.exteriorGroup.add(m);
    }

    const yellowMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const edgeL = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 130), yellowMat); edgeL.rotation.x = -Math.PI / 2; edgeL.position.set(runwayX - 6.6, 0.03, -55);
    const edgeR = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 130), yellowMat); edgeR.rotation.x = -Math.PI / 2; edgeR.position.set(runwayX + 6.6, 0.03, -55);
    this.exteriorGroup.add(edgeL, edgeR);

    const blueLightMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    for (let z = -115; z < 5; z += 9) {
      const l1 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), blueLightMat); l1.position.set(runwayX - 6.6, 0.18, z);
      const l2 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), blueLightMat); l2.position.set(runwayX + 6.6, 0.18, z);
      this.exteriorGroup.add(l1, l2);
    }

    const towerBase = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.4, 7.5, 10), new THREE.MeshStandardMaterial({ color: 0xcbd5e1 }));
    towerBase.position.set(runwayX + 10.5, 3.75, -45);
    const towerGlass = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.5, 1.4, 10), new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 }));
    towerGlass.position.set(runwayX + 10.5, 8.1, -45);
    const towerRoof = new THREE.Mesh(new THREE.ConeGeometry(2.0, 0.8, 10), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
    towerRoof.position.set(runwayX + 10.5, 9.2, -45);
    this.exteriorGroup.add(towerBase, towerGlass, towerRoof);

    const liveries = [
      { name: 'Global Blue',   stripe: 0x2563eb, tail: 0x1d4ed8, engine: 0x1e3a8a, belly: 0x94a3b8 },
      { name: 'Royal Crimson', stripe: 0xe11d48, tail: 0xbe123c, engine: 0x881337, belly: 0xcbd5e1 },
      { name: 'Emerald Air',   stripe: 0x10b981, tail: 0x047857, engine: 0x065f46, belly: 0x94a3b8 }
    ];

    this.avioes = [];
    liveries.forEach((liv, i) => {
      const aviaoGroup = new THREE.Group();
      const matWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25, metalness: 0.15 });
      const matBelly = new THREE.MeshStandardMaterial({ color: liv.belly, roughness: 0.4, metalness: 0.3 });
      const matStripe = new THREE.MeshStandardMaterial({ color: liv.stripe, roughness: 0.3, metalness: 0.2 });
      const matTail = new THREE.MeshStandardMaterial({ color: liv.tail, roughness: 0.3, metalness: 0.2 });
      const matEngine = new THREE.MeshStandardMaterial({ color: liv.engine, roughness: 0.35, metalness: 0.4 });
      const matCockpit = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.1, metalness: 0.9 });

      const bodyCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 4.4, 18), matWhite);
      bodyCyl.rotation.x = Math.PI / 2; bodyCyl.position.set(0, 0.85, 0);
      const noseCone = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), matWhite);
      noseCone.scale.set(1, 0.95, 1.65); noseCone.position.set(0, 0.82, 2.2);
      const tailCone = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.55, 1.8, 16), matWhite);
      tailCone.rotation.x = Math.PI / 2; tailCone.position.set(0, 0.92, -3.1);

      const stripeL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 4.5), matStripe); stripeL.position.set(0.54, 0.92, 0.1);
      const stripeR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 4.5), matStripe); stripeR.position.set(-0.54, 0.92, 0.1);
      const cockpitVisor = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.22, 0.55), matCockpit);
      cockpitVisor.position.set(0, 1.06, 2.35); cockpitVisor.rotation.x = 0.25;

      const wingL = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.1, 1.15), matBelly);
      wingL.position.set(-1.9, 0.72, -0.1); wingL.rotation.y = 0.22;
      const wingR = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.1, 1.15), matBelly);
      wingR.position.set(1.9, 0.72, -0.1); wingR.rotation.y = -0.22;
      const wingletL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.35), matTail); wingletL.position.set(-3.55, 0.92, -0.45);
      const wingletR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.35), matTail); wingletR.position.set(3.55, 0.92, -0.45);

      const navRed = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff2222 })); navRed.position.set(-3.6, 0.75, -0.3);
      const navGreen = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), new THREE.MeshBasicMaterial({ color: 0x22ff55 })); navGreen.position.set(3.6, 0.75, -0.3);

      [-1.35, 1.35].forEach(ex => {
        const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.22, 0.95, 14), matEngine);
        eng.rotation.x = Math.PI / 2; eng.position.set(ex, 0.48, 0.25);
        const intake = new THREE.Mesh(new THREE.CircleGeometry(0.23, 12), matCockpit);
        intake.position.set(ex, 0.48, 0.73);
        aviaoGroup.add(eng, intake);
      });

      const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.45, 1.25), matTail);
      tailFin.position.set(0, 1.7, -3.35); tailFin.rotation.x = -0.28;
      const logoCircle = new THREE.Mesh(new THREE.CircleGeometry(0.28, 14), new THREE.MeshBasicMaterial({ color: 0xfef08a, side: THREE.DoubleSide }));
      logoCircle.position.set(0.07, 1.8, -3.35); logoCircle.rotation.y = Math.PI / 2;
      const tailStab = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 0.65), matBelly);
      tailStab.position.set(0, 1.0, -3.45);

      const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
      [[0, 0.2, 1.8], [-0.65, 0.2, -0.3], [0.65, 0.2, -0.3]].forEach(([wx, wy, wz]) => {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.14, 10), wheelMat);
        wheel.rotation.z = Math.PI / 2; wheel.position.set(wx, wy, wz);
        aviaoGroup.add(wheel);
      });

      aviaoGroup.add(bodyCyl, noseCone, tailCone, stripeL, stripeR, cockpitVisor, wingL, wingR, wingletL, wingletR, navRed, navGreen, tailFin, logoCircle, tailStab);

      const startZ = -112 + i * 38;
      aviaoGroup.position.set(runwayX, 0, startZ);
      aviaoGroup.userData = {
        runwayX,
        speed: 4.5,
        phase: i === 0 ? 'taxi' : (i === 1 ? 'roll' : 'approach'),
        timer: 0
      };
      if (i === 2) {
        aviaoGroup.position.set(runwayX, 14, -148);
        aviaoGroup.userData.speed = 15;
      }

      this.exteriorGroup.add(aviaoGroup);
      this.avioes.push(aviaoGroup);
    });
  }

  atualizarAvioes(delta) {
    if (this.modoInterior || !this.avioes) return;
    this.avioes.forEach(av => {
      const ud = av.userData;
      ud.timer += delta;

      if (ud.phase === 'taxi') {
        av.position.y = 0;
        av.rotation.x += (0 - av.rotation.x) * 0.1;
        av.rotation.z += (0 - av.rotation.z) * 0.1;
        ud.speed = 4.5;
        av.position.z += ud.speed * delta;
        if (av.position.z >= -88) ud.phase = 'roll';
      } else if (ud.phase === 'roll') {
        ud.speed = Math.min(18.5, ud.speed + delta * 6.5);
        av.position.z += ud.speed * delta;
        if (av.position.z >= -48) ud.phase = 'rotate';
      } else if (ud.phase === 'rotate') {
        ud.speed = Math.min(22.0, ud.speed + delta * 4.0);
        av.position.z += ud.speed * delta;
        av.rotation.x += (-0.28 - av.rotation.x) * delta * 3.2;
        av.position.y += delta * 4.8;
        if (av.position.y >= 6.5) ud.phase = 'climb';
      } else if (ud.phase === 'climb') {
        av.position.z += ud.speed * delta;
        av.position.y += delta * 7.2;
        av.rotation.x += (-0.22 - av.rotation.x) * delta * 2.0;
        av.rotation.z += (-0.12 - av.rotation.z) * delta * 1.5;
        if (av.position.z > 65 || av.position.y > 34) {
          av.position.set(ud.runwayX, 16, -155);
          av.rotation.set(0.08, 0, 0);
          ud.speed = 14.5;
          ud.phase = 'approach';
        }
      } else if (ud.phase === 'approach') {
        av.position.z += ud.speed * delta;
        if (av.position.y > 0) {
          av.position.y = Math.max(0, av.position.y - delta * 4.2);
          av.rotation.x += (-0.06 - av.rotation.x) * delta * 2.5;
        } else {
          av.rotation.x += (0 - av.rotation.x) * 0.15;
          ud.speed = Math.max(4.5, ud.speed - delta * 5.0);
          if (av.position.z >= -95) ud.phase = 'taxi';
        }
      }
    });
  }

  // 🛍️ CATÁLOGO COMPLETO DAS 11 LOJAS COMERCIAIS + IMOBILIÁRIA + CONCESSIONÁRIA + MATERIAIS DE CONSTRUÇÃO (EM DRX)
  criarLojaComprável(id) {
    const itensPorLoja = {
      clothing:        [{ nome: 'Neon Pink Shirt', emoji: '👕', preco: 60, cor: 0xec4899, tipo: 'shirt' }, { nome: 'Royal Blue Jacket', emoji: '🧥', preco: 90, cor: 0x2563eb, tipo: 'shirt' }, { nome: 'Emerald Hoodie', emoji: '🎽', preco: 80, cor: 0x10b981, tipo: 'shirt' }],
      shoes:           [{ nome: 'Gold Sneakers', emoji: '👟', preco: 70, cor: 0xfacc15, tipo: 'shoes' }, { nome: 'Crimson Boots', emoji: '🥾', preco: 85, cor: 0xe11d48, tipo: 'shoes' }, { nome: 'Cyber Shoes', emoji: '⚡', preco: 95, cor: 0x38bdf8, tipo: 'shoes' }],
      petshop:         [{ nome: 'Adopt Puppy Dog', emoji: '🐶', preco: 100, cor: 0xd97706, tipo: 'pet_dog' }, { nome: 'Adopt Cute Cat', emoji: '🐱', preco: 100, cor: 0x9ca3af, tipo: 'pet_cat' }, { nome: 'Pet Treat Pack', emoji: '🦴', preco: 40, cor: 0x10b981, tipo: 'item' }],
      tools:           [{ nome: 'Power Hammer', emoji: '🔨', preco: 50, cor: 0xf59e0b, tipo: 'item' }, { nome: 'Steel Wrench', emoji: '🔧', preco: 45, cor: 0x64748b, tipo: 'item' }, { nome: 'Electric Drill', emoji: '🪛', preco: 80, cor: 0xef4444, tipo: 'item' }],
      supermarket:     [{ nome: 'Organic Apples', emoji: '🍎', preco: 25, cor: 0xef4444, tipo: 'item' }, { nome: 'Fresh Milk', emoji: '🥛', preco: 30, cor: 0x38bdf8, tipo: 'item' }, { nome: 'Bakery Bread', emoji: '🍞', preco: 35, cor: 0xf59e0b, tipo: 'item' }],
      bookstore:       [{ nome: 'English Grammar Pro', emoji: '📚', preco: 60, cor: 0xa16207, tipo: 'item' }, { nome: 'Oxford Dictionary', emoji: '📖', preco: 75, cor: 0x0f766e, tipo: 'item' }, { nome: 'Study Notebook', emoji: '📓', preco: 40, cor: 0x8b5cf6, tipo: 'item' }],
      bank:            [{ nome: 'DRX Savings Bond', emoji: '🏦', preco: 50, cor: 0x0f766e, tipo: 'item' }, { nome: 'Gold Reserve Bar', emoji: '💎', preco: 120, cor: 0xfacc15, tipo: 'item' }],
      pharmacy:        [{ nome: 'Vitamin C Boost', emoji: '💊', preco: 45, cor: 0x06b6d4, tipo: 'item' }, { nome: 'First Aid Kit', emoji: '🩹', preco: 65, cor: 0xef4444, tipo: 'item' }],
      real_estate:     [{ nome: 'Brick Walls Deed', emoji: '🧱', preco: 250, cor: 0x7c3aed, tipo: 'house_upgrade', targetStage: 2 }, { nome: 'Colonial Roof Deed', emoji: '🏠', preco: 400, cor: 0xa855f7, tipo: 'house_upgrade', targetStage: 3 }, { nome: 'Luxury Villa Deed', emoji: '🏡', preco: 650, cor: 0xfacc15, tipo: 'house_upgrade', targetStage: 5 }],
      dealership:      [{ nome: 'City Bicycle', emoji: '🚲', preco: 80, cor: 0x10b981, tipo: 'vehicle', vehicleType: 'bicycle' }, { nome: 'Sport Motorcycle', emoji: '🏍️', preco: 320, cor: 0xef4444, tipo: 'vehicle', vehicleType: 'moto' }, { nome: 'Electric Supercar', emoji: '🚗', preco: 680, cor: 0x2563eb, tipo: 'vehicle', vehicleType: 'car' }],
      building_supply: [{ nome: 'Brick Pallet (x5)', emoji: '🧱', preco: 75, cor: 0xd97706, tipo: 'material', units: 5 }, { nome: 'Timber Beams (x10)', emoji: '🪵', preco: 130, cor: 0x92400e, tipo: 'material', units: 10 }, { nome: 'House Furniture Kit', emoji: '🛋️', preco: 300, cor: 0x4f46e5, tipo: 'house_upgrade', targetStage: 4 }]
    };
    const lista = itensPorLoja[id];
    if (!lista) return;
    const THREE = window.THREE;
    const bMeta = this.buildingsMeta.find(b => b.id === id);
    const grp = this.interiorGroups.get(id);
    if (!bMeta || !grp) return;

    lista.forEach((item, i) => {
      const stand = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.95, 0.95), new THREE.MeshStandardMaterial({ color: item.cor, roughness: 0.6 }));
      base.position.y = 0.475;
      const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, 256, 128);
      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 6; ctx.strokeRect(3, 3, 250, 122);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 21px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(`${item.emoji} ${item.nome.slice(0, 15)}`, 128, 48);
      ctx.fillStyle = '#fde047'; ctx.font = 'bold 25px Inter, sans-serif';
      ctx.fillText(`${item.preco} DRX`, 128, 95);
      const tex = new THREE.CanvasTexture(canvas);
      const label = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.48), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
      label.position.set(0, 1.25, 0);
      label.rotation.y = Math.sign(bMeta.col) === -1 ? Math.PI / 2 : -Math.PI / 2;

      const shopData = { clickable: true, englishName: item.nome, isShopItem: true, shopId: id, item };
      base.userData = shopData;
      label.userData = shopData;
      stand.userData = shopData;
      stand.add(base, label);
      stand.position.set(bMeta.centerX - Math.sign(bMeta.col) * 1.4, 0, bMeta.centerZ + (i - 1) * 2.2);
      grp.add(stand);
      this.clickableObjects.push(stand);
    });
  }

  criarTransitoInteligente() {
    const THREE = window.THREE;
    this.cars = [];
    const carModels = [
      { body: 0xef4444, type: 'sedan' },
      { body: 0x3b82f6, type: 'suv' },
      { body: 0xfacc15, type: 'taxi' },
      { body: 0xf8fafc, type: 'van' },
      { body: 0x10b981, type: 'sedan' }
    ];
    for (let i = 0; i < 8; i++) {
      const cfg = carModels[i % carModels.length];
      const carGroup = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.62, 3.8), new THREE.MeshStandardMaterial({ color: cfg.body, roughness: 0.35, metalness: 0.25 }));
      body.position.y = 0.58;
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.52, 1.8), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.15, metalness: 0.6 }));
      cabin.position.set(0, 1.1, -0.1);
      carGroup.add(body, cabin);

      const lane = i % 2 === 0 ? 1.8 : -1.8;
      const dir = i % 2 === 0 ? -1 : 1;
      carGroup.position.set(lane, 0, -80 + i * 16);
      carGroup.rotation.y = dir === 1 ? 0 : Math.PI;
      carGroup.userData = { lane, dir, speed: 4.5 + Math.random() * 1.8, stopped: false };
      this.exteriorGroup.add(carGroup);
      this.cars.push(carGroup);
    }
  }

  criarPedestres() {
    this.pedestrians = [];
    const phrases = [
      "Beautiful day, isn't it?",
      "Hi there! Earning DOVRYX today?",
      "Check out the Guild Baú do Inglês!",
      "Have a wonderful day!"
    ];
    for (let i = 0; i < 8; i++) {
      const isLeft = i % 2 === 0;
      const isFemalePed = i % 2 === 1;
      const pedMesh = this.criarBonecoHumano3D(isLeft ? 0xf59e0b : 0x38bdf8, 0x1e293b, 0xfde68a, isFemalePed);
      const x = isLeft ? -8.8 : 8.8;
      const z = -85 + i * 12;
      pedMesh.position.set(x, 0, z);
      pedMesh.rotation.y = i % 2 === 0 ? 0 : Math.PI;
      const labelEl = this.criarEtiquetaHTML('Citizen', null, '#facc15');
      this.exteriorGroup.add(pedMesh);
      this.pedestrians.push({
        mesh: pedMesh,
        labelEl,
        x,
        z,
        dir: pedMesh.rotation.y === 0 ? 1 : -1,
        speed: 1.3 + Math.random() * 0.6,
        bubbleText: phrases[i % phrases.length],
        lastGreet: 0
      });
    }
  }

  criarOutdoorsInteligentes() {
    const THREE = window.THREE;
    this.outdoors = [];
    const expressions = [
      "Currency: DOVRYX (DRX) 💎",
      "Tip: Speak to buy with 20% off!",
      this.topLeaderText
    ];
    for (let row = 0; row < 3; row++) {
      const zPos = -row * 32 - 8;
      [-11.5, 11.5].forEach((xPos, idx) => {
        const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, 512, 256);
        ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 6; ctx.strokeRect(4, 4, 504, 248);
        ctx.fillStyle = '#a78bfa'; ctx.font = 'bold 24px Inter, sans-serif';
        ctx.fillText(expressions[(row + idx) % expressions.length], 22, 70);
        ctx.fillStyle = '#e2e8f0'; ctx.font = '18px Inter, sans-serif';
        ctx.fillText('Visit Guild Baú do Inglês to earn DRX!', 22, 135);
        const tex = new THREE.CanvasTexture(canvas);
        const board = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.6), new THREE.MeshBasicMaterial({ map: tex }));
        board.position.set(xPos, 2.2, zPos);
        board.rotation.y = xPos < 0 ? Math.PI / 2.5 : -Math.PI / 2.5;
        this.exteriorGroup.add(board);
        this.outdoors.push(board);
      });
    }
  }

  criarVitrinesVivas() {
    this.vitrines = [];
    ['shopping', 'clothing'].forEach(id => {
      const b = this.buildingsMeta.find(x => x.id === id);
      if (!b) return;
      const mannequin = this.criarBonecoHumano3D(0xec4899, 0x0f172a, 0xfde68a, true);
      mannequin.position.set(b.frontX + Math.sign(b.col) * 0.5, 0, b.doorZ + 2.2);
      mannequin.scale.set(0.9, 0.9, 0.9);
      this.exteriorGroup.add(mannequin);
      this.vitrines.push({ mesh: mannequin });
    });
  }

  ativarSombrasReais() {
    if (!this.renderer) return;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = window.THREE.PCFSoftShadowMap;
    if (this.dirLight) {
      this.dirLight.castShadow = true;
      this.dirLight.shadow.mapSize.set(1024, 1024);
    }
  }

  criarQuadroNegroVivo() {
    const THREE = window.THREE;
    const b = this.buildingsMeta.find(x => x.id === 'school');
    if (!b) return;
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const phrases = [
      "Past Tense: I WAS, You WERE, They WERE",
      "Vocabulary: Serendipity = Happy accident",
      "Idiom: Break a leg! = Good luck!",
      "Modal Verbs: COULD you help me, please?"
    ];
    let idx = 0;
    const desenharQuadro = () => {
      const phrase = phrases[idx % phrases.length];
      ctx.fillStyle = '#064e3b'; ctx.fillRect(0, 0, 512, 256);
      ctx.strokeStyle = '#92400e'; ctx.lineWidth = 10; ctx.strokeRect(5, 5, 502, 246);
      ctx.fillStyle = '#fef08a'; ctx.font = 'bold 22px Inter, sans-serif';
      ctx.fillText('🏫 ENGLISH CLASSBOARD', 24, 48);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 20px Inter, sans-serif';
      ctx.fillText(phrase, 24, 115);
      ctx.fillStyle = '#a7f3d0'; ctx.font = '16px Inter, sans-serif';
      ctx.fillText('👆 Click this board to change lesson & listen!', 24, 195);
      return phrase;
    };
    const fraseInicial = desenharQuadro();
    const tex = new THREE.CanvasTexture(canvas);
    const board = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 1.9), new THREE.MeshBasicMaterial({ map: tex }));
    board.position.set(b.centerX + (Math.sign(b.col) * 4.55), 2.0, b.centerZ);
    board.rotation.y = Math.sign(b.col) === -1 ? -Math.PI / 2 : Math.PI / 2;
    board.userData = {
      clickable: true,
      isBlackboard: true,
      englishName: fraseInicial,
      nextLesson: () => {
        idx++;
        const nova = desenharQuadro();
        tex.needsUpdate = true;
        board.userData.englishName = nova;
        return nova;
      }
    };
    this.clickableObjects.push(board);
    const grp = this.interiorGroups.get('school');
    if (grp) grp.add(board); else this.scene.add(board);
  }

  criarCardapioFalado() {
    const THREE = window.THREE;
    const b = this.buildingsMeta.find(x => x.id === 'restaurant');
    if (!b) return;
    const items = ['Grilled Salmon - 18 DRX', 'Cheeseburger - 12 DRX', 'Homemade Pasta - 15 DRX'];
    for (let i = 0; i < 3; i++) {
      const standCanvas = document.createElement('canvas'); standCanvas.width = 256; standCanvas.height = 320;
      const sctx = standCanvas.getContext('2d');
      sctx.fillStyle = '#fffbeb'; sctx.fillRect(0, 0, 256, 320);
      sctx.strokeStyle = '#be123c'; sctx.lineWidth = 8; sctx.strokeRect(4, 4, 248, 312);
      sctx.fillStyle = '#881337'; sctx.font = 'bold 24px Inter, sans-serif'; sctx.fillText('MENU', 85, 45);
      sctx.fillStyle = '#1e293b'; sctx.font = 'bold 18px Inter, sans-serif'; sctx.fillText(items[i], 24, 150);
      const tex = new THREE.CanvasTexture(standCanvas);
      const stand = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.8), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
      stand.position.set(b.centerX - (Math.sign(b.col) * 0.5), 1.05, b.centerZ - 1.5 + i * 1.5);
      stand.userData = { clickable: true, englishName: `I would like to order the ${items[i].split(' - ')[0]}, please.` };
      this.clickableObjects.push(stand);
      const grp = this.interiorGroups.get('restaurant');
      if (grp) grp.add(stand);
    }
  }

  criarPainelVoosVivo() {
    const THREE = window.THREE;
    const b = this.buildingsMeta.find(x => x.id === 'airport');
    if (!b) return;
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 280;
    const ctx = canvas.getContext('2d');
    const statusList = ['ON TIME', 'BOARDING', 'GATE OPEN', 'FINAL CALL'];
    const updateBoard = () => {
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, 512, 280);
      ctx.strokeStyle = '#0284c7'; ctx.lineWidth = 6; ctx.strokeRect(3, 3, 506, 274);
      ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 22px Inter, sans-serif';
      ctx.fillText('✈️ DEPARTURES - CLICK TO HEAR', 20, 38);
      const flights = [
        ['NEW YORK (JFK)', statusList[Math.floor(Math.random() * statusList.length)], 'B12'],
        ['LONDON (LHR)', statusList[Math.floor(Math.random() * statusList.length)], 'B14'],
        ['TOKYO (HND)', 'ON TIME', 'C04']
      ];
      flights.forEach((f, i) => {
        ctx.fillStyle = '#fde047'; ctx.font = 'bold 17px monospace';
        ctx.fillText(`${f[0]}   ${f[1]}   Gate ${f[2]}`, 20, 95 + i * 48);
      });
      if (this.flightBoard) this.flightBoard.texture.needsUpdate = true;
    };
    const tex = new THREE.CanvasTexture(canvas);
    const board = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.85), new THREE.MeshBasicMaterial({ map: tex }));
    board.position.set(b.centerX + (Math.sign(b.col) * 4.55), 2.1, b.centerZ);
    board.rotation.y = Math.sign(b.col) === -1 ? -Math.PI / 2 : Math.PI / 2;
    board.userData = { clickable: true, englishName: 'Attention passengers: Flight to London is now boarding at Gate B14.' };
    this.clickableObjects.push(board);
    const grp = this.interiorGroups.get('airport');
    if (grp) grp.add(board);
    this.flightBoard = { mesh: board, texture: tex };
    updateBoard();
    this.flightBoardInterval = setInterval(updateBoard, 20000);
  }

  tocarRadioTaxi() {
    const facts = [
      "Did you know? The word Taxi comes from taximeter!",
      "Fun fact: In London, black cab drivers memorize 25,000 streets!",
      "Useful phrase: Could you take me to the airport, please?"
    ];
    const fact = facts[Math.floor(Math.random() * facts.length)];
    this.mostrarBalaoNoBoneco(this.localPlayer, "📻 " + fact, 8000);
    this.falarTextoNPC(fact, 'taxi');
  }

  criarMusicoDeRua() {
    const THREE = window.THREE;
    const mus = this.criarBonecoHumano3D(0xf97316, 0x1e293b, 0xfde68a, false);
    mus.position.set(-8.8, 0, -24);
    mus.rotation.y = Math.PI / 3;
    const guitar = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.6), new THREE.MeshLambertMaterial({ color: 0x92400e }));
    guitar.position.set(0, 1.2, 0.25);
    guitar.userData = { clickable: true, englishName: "Street Musician: That song is lit! Lit means amazing!" };
    this.clickableObjects.push(guitar);
    mus.add(guitar);
    const label = this.criarEtiquetaHTML('Musician 🎸', null, '#f59e0b');
    this.exteriorGroup.add(mus);
    this.musician = {
      mesh: mus,
      labelEl: label,
      x: -8.8,
      z: -24,
      lastTeach: 0,
      slangs: [
        "That song is lit! ('Lit' = amazing!)",
        "This beat is sick! ('Sick' = super cool!)",
        "I'm hyped for DOVRYX! ('Hyped' = very excited!)"
      ]
    };
  }

  atualizarMusico() {
    if (!this.musician || !this.localPlayer || this.modoInterior) return;
    const d = Math.hypot(this.musician.x - this.localPlayer.x, this.musician.z - this.localPlayer.z);
    if (d < 3.8 && Date.now() - this.musician.lastTeach > 12000) {
      const slang = this.musician.slangs[Math.floor(Math.random() * this.musician.slangs.length)];
      this.mostrarBalaoNoBoneco(this.musician, slang, 5500);
      this.musician.lastTeach = Date.now();
    }
  }

  criarFotoPolaroid() {
    const THREE = window.THREE;
    const b = this.buildingsMeta.find(x => x.id === 'beach');
    if (!b) return;
    const camModel = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.38, 0.28), new THREE.MeshLambertMaterial({ color: 0xf43f5e }));
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.2, 12), new THREE.MeshLambertMaterial({ color: 0x111827 }));
    lens.rotation.x = Math.PI / 2; lens.position.set(0, 0, 0.2);
    body.userData = { clickable: true, isPolaroidCam: true, englishName: 'Polaroid Camera' };
    lens.userData = { clickable: true, isPolaroidCam: true, englishName: 'Polaroid Camera' };
    camModel.add(body, lens);
    camModel.position.set(b.centerX - (Math.sign(b.col) * 1.2), 1.0, b.centerZ - 2.2);
    camModel.userData = { clickable: true, isPolaroidCam: true, englishName: 'Polaroid Camera' };
    this.clickableObjects.push(camModel);
    const grp = this.interiorGroups.get('beach');
    if (grp) grp.add(camModel);
    this.polaroidCam = camModel;
  }

  tirarFotoPolaroid() {
    try {
      this.renderer.render(this.scene, this.camera);
      const dataURL = this.renderer.domElement.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `english-city-${Date.now()}.png`;
      link.href = dataURL;
      link.click();
      DOVRYX.add(25, 'Beach Polaroid Photo');
      this.falarTextoNPC('Cheese! Great photo at the beach!', 'beach');
    } catch (e) {}
  }

  criarAnimaisRua() {
    this.animais.caes = [];
    this.animais.gatos = [];
    this.animais.passaros = [];
    for (let i = 0; i < 2; i++) {
      const dog = this.criarCachorro3D();
      dog.position.set(-9 + i * 18, 0, -14 - i * 18);
      this.exteriorGroup.add(dog);
      this.animais.caes.push({ mesh: dog, dir: 1, speed: 1.1, x: dog.position.x, z: dog.position.z, walkPhase: 0 });
    }
    for (let i = 0; i < 2; i++) {
      const cat = this.criarGato3D();
      cat.position.set(8.8, 0, -24 - i * 16);
      this.exteriorGroup.add(cat);
      this.animais.gatos.push({ mesh: cat, dir: 1, speed: 0.7, x: cat.position.x, z: cat.position.z, idleTime: 0 });
    }
    const THREE = window.THREE;
    this.animais.passarosGroup = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const bird = this.criarPassaro3D();
      bird.position.set((Math.random() - 0.5) * 70, 15 + Math.random() * 6, -35 + (Math.random() - 0.5) * 70);
      bird.userData = { speed: 2.5 + Math.random() * 1.5, angle: Math.random() * Math.PI * 2 };
      this.animais.passarosGroup.add(bird);
      this.animais.passaros.push(bird);
    }
    this.scene.add(this.animais.passarosGroup);
  }

  criarCachorro3D() {
    const THREE = window.THREE;
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.8 });
    const headMat = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.8 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.32, 0.42), bodyMat); body.position.set(0, 0.28, 0);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), headMat); head.position.set(0.42, 0.42, 0);
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.16), new THREE.MeshStandardMaterial({ color: 0x2b1d12 })); snout.position.set(0.62, 0.38, 0);
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.02, 0.28, 6), bodyMat); tail.position.set(-0.38, 0.38, 0); tail.rotation.z = 0.8;
    group.add(body, head, snout, tail);
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.28, 6), bodyMat);
      leg.position.set((i < 2 ? 0.22 : -0.22), 0.14, (i % 2 === 0 ? 0.14 : -0.14));
      group.add(leg);
    }
    return group;
  }

  criarGato3D() {
    const THREE = window.THREE;
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.7 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.22, 0.32), bodyMat); body.position.set(0, 0.22, 0);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), bodyMat); head.position.set(0.32, 0.38, 0);
    const earGeo = new THREE.ConeGeometry(0.06, 0.12, 4);
    const ear1 = new THREE.Mesh(earGeo, bodyMat); ear1.position.set(0.32, 0.54, 0.08);
    const ear2 = new THREE.Mesh(earGeo, bodyMat); ear2.position.set(0.32, 0.54, -0.08);
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.015, 0.42, 6), bodyMat); tail.position.set(-0.32, 0.32, 0); tail.rotation.z = 1.1;
    group.add(body, head, ear1, ear2, tail);
    return group;
  }

  criarPassaro3D() {
    const THREE = window.THREE;
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), new THREE.MeshStandardMaterial({ color: 0x1f2937 }));
    const wingGeo = new THREE.PlaneGeometry(0.22, 0.06);
    const wingMat = new THREE.MeshBasicMaterial({ color: 0x111827, side: THREE.DoubleSide });
    const wingL = new THREE.Mesh(wingGeo, wingMat); wingL.position.set(0, 0.04, 0.12);
    const wingR = new THREE.Mesh(wingGeo, wingMat); wingR.position.set(0, 0.04, -0.12);
    group.add(body, wingL, wingR);
    group.userData = { wingL, wingR };
    return group;
  }

  atualizarAnimais(delta) {
    if (this.adoptedPet && this.localPlayer) {
      const targetX = this.localPlayer.x - Math.sin(this.localPlayer.rotY) * 1.2;
      const targetZ = this.localPlayer.z - Math.cos(this.localPlayer.rotY) * 1.2;
      this.adoptedPet.position.x += (targetX - this.adoptedPet.position.x) * 0.08;
      this.adoptedPet.position.z += (targetZ - this.adoptedPet.position.z) * 0.08;
      this.adoptedPet.rotation.y = this.localPlayer.rotY + Math.PI / 2;
    }
    if (this.modoInterior) return;
    this.animais.caes.forEach(dogData => {
      dogData.walkPhase += delta * 6;
      dogData.mesh.position.z += dogData.dir * dogData.speed * delta * 0.5;
      if (dogData.mesh.position.z > 8) dogData.mesh.position.z = -82;
      if (dogData.mesh.position.z < -82) dogData.mesh.position.z = 8;
    });
    this.animais.passaros.forEach(bird => {
      bird.userData.angle += delta * 0.25;
      bird.position.x += Math.cos(bird.userData.angle) * delta * bird.userData.speed;
      bird.position.z += Math.sin(bird.userData.angle) * delta * bird.userData.speed;
      bird.rotation.y = bird.userData.angle;
      if (bird.userData.wingL) {
        const flap = Math.sin(Date.now() * 0.02) * 0.65;
        bird.userData.wingL.rotation.z = 0.2 + flap;
        bird.userData.wingR.rotation.z = -0.2 - flap;
      }
    });
  }

  criarLetreiro3D(texto, pos, col, isMastered = false) {
    const THREE = window.THREE;
    const signCol = Math.sign(col);
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const corBorda = isMastered ? '#10b981' : '#8b5cf6';
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#1e293b'); grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 1024, 256);
    ctx.strokeStyle = corBorda; ctx.lineWidth = 10; ctx.strokeRect(5, 5, 1014, 246);
    ctx.fillStyle = '#f8fafc'; ctx.font = '900 70px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText((isMastered ? '★ ' : '') + texto.toUpperCase(), 512, 134);

    const tex = new THREE.CanvasTexture(canvas); tex.anisotropy = 4;
    const placaGroup = new THREE.Group();
    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(5.0, 1.2, 0.24), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6, metalness: 0.2 }));
    const frontMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.9, 1.1), new THREE.MeshBasicMaterial({ map: tex }));
    frontMesh.position.set(0, 0, 0.13);
    const backMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.9, 1.1), new THREE.MeshBasicMaterial({ map: tex }));
    backMesh.position.set(0, 0, -0.13); backMesh.rotation.y = Math.PI;

    placaGroup.add(baseMesh, frontMesh, backMesh);
    placaGroup.position.copy(pos);
    placaGroup.rotation.y = signCol === -1 ? Math.PI / 2 : -Math.PI / 2;
    this.scene.add(placaGroup);
    return placaGroup;
  }

  inicializarCenaThreeJS(initialSpaceId) {
    const THREE = window.THREE;
    const viewport = document.getElementById('es-city-viewport');
    const w = viewport.clientWidth || window.innerWidth;
    const h = viewport.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    this.exteriorGroup = new THREE.Group();
    this.scene.add(this.exteriorGroup);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.72);
    this.scene.add(this.ambientLight);
    this.dirLight = new THREE.DirectionalLight(0xfef08a, 0.65);
    this.dirLight.position.set(25, 45, 20);
    this.dirLight.castShadow = true;
    this.scene.add(this.dirLight);

    this.camera = new THREE.PerspectiveCamera(58, w / h, 0.1, 340);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    viewport.insertBefore(this.renderer.domElement, viewport.firstChild);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(280, 340), new THREE.MeshLambertMaterial({ color: 0x0f172a }));
    ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0, -35); ground.receiveShadow = true;
    this.exteriorGroup.add(ground);

    const road = new THREE.Mesh(new THREE.PlaneGeometry(13.2, 170), new THREE.MeshLambertMaterial({ color: 0x1e293b }));
    road.rotation.x = -Math.PI / 2; road.position.set(0, 0.01, -36);
    this.exteriorGroup.add(road);

    try {
      this.criarCeuRealista();
      this.criarAvenidaRealista();
      this.criarSegundaAvenida();
      this.criarRuasAlargadasComCiclovias();
      this.criarQuebraMolasESinalizacao();
      this.criarPostesAvenida3D();
      this.criarTransitoInteligente();
      this.criarPedestres();
      this.criarOutdoorsInteligentes();
      this.atualizarCicloDiaNoite();
      this.dayNightInterval = setInterval(() => this.atualizarCicloDiaNoite(), 60000);
      this.criarCenarioFundoMontanhasArvores();
    } catch (errCenario) {
      console.warn('Aviso ao renderizar decoração de rua:', errCenario);
    }

    this.buildingsMeta = [];
    this.buildingMeshes.clear();
    this.npcs3D.clear();
    this.clickableObjects = [];
    this.doors.clear();
    this.interiorGroups.clear();

    const registry = this.parentManager.getSpacesRegistry ? this.parentManager.getSpacesRegistry() : window.Workspace.EnglishSpaces.getSpacesRegistry();
    const visitados = this.parentManager?.progressData?.visited || [];

    CITY_BUILDINGS_LAYOUT.forEach((bCfg) => {
      const spInfo = registry[bCfg.id] || FALLBACK_NEW_SPACES[bCfg.id] || {
        id: bCfg.id,
        name: bCfg.id.toUpperCase(),
        emoji: '🏪',
        npcName: 'Host',
        roles: ['CUSTOMER', 'HOST']
      };

      const signCol = Math.sign(bCfg.col);
      const centerX = bCfg.col * 16;
      const centerZ = -bCfg.row * 16;
      const bw = 10; const bd = 10; const bh = 4.4;
      const frontX = centerX - signCol * (bw / 2);
      const doorHalfW = 1.05;

      const tipoPiso = {
        coffee: 'wood', restaurant: 'tile-check', school: 'tile-check', shopping: 'marble',
        home: 'carpet', cinema: 'carpet', taxi: 'tile-check', beach: 'sand',
        hotel: 'wood', airport: 'marble', job: 'carpet', hospital: 'tile-check',
        bank: 'marble', clothing: 'wood', shoes: 'carpet', tools: 'tile-check',
        petshop: 'sand', supermarket: 'tile-check', pharmacy: 'tile-check', bookstore: 'wood',
        real_estate: 'marble', dealership: 'tile-check', building_supply: 'wood', guild_bau: 'carpet'
      }[bCfg.id] || 'tile-check';

      const texPiso = this.gerarTexturaPisoPremium(tipoPiso);
      const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(bw, bd), new THREE.MeshStandardMaterial({ map: texPiso, color: 0xffffff, roughness: 0.85, metalness: 0.08 }));
      floorMesh.rotation.x = -Math.PI / 2; floorMesh.position.set(centerX, 0.02, centerZ); floorMesh.receiveShadow = true;
      this.scene.add(floorMesh);

      const shopLight = new THREE.PointLight(bCfg.npcColor || 0xf59e0b, 1.25, 15);
      shopLight.position.set(centerX, 3.2, centerZ);
      this.scene.add(shopLight);

      const wallMat = new THREE.MeshStandardMaterial({ color: bCfg.roof, roughness: 0.85, metalness: 0.1 });
      const wallMatsTransp = [];

      const backWall = new THREE.Mesh(new THREE.BoxGeometry(0.38, bh, bd), wallMat.clone());
      backWall.position.set(centerX + (signCol * (bw / 2)), bh / 2, centerZ);
      this.scene.add(backWall); wallMatsTransp.push(backWall);

      const sideWall1 = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.38), wallMat.clone());
      sideWall1.position.set(centerX, bh / 2, centerZ - bd / 2);
      this.scene.add(sideWall1); wallMatsTransp.push(sideWall1);

      const sideWall2 = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.38), wallMat.clone());
      sideWall2.position.set(centerX, bh / 2, centerZ + bd / 2);
      this.scene.add(sideWall2); wallMatsTransp.push(sideWall2);

      const frontSideLen = (bd / 2) - doorHalfW;
      const frontLeft = new THREE.Mesh(new THREE.BoxGeometry(0.38, bh, frontSideLen), wallMat.clone());
      frontLeft.position.set(frontX, bh / 2, centerZ - (doorHalfW + frontSideLen / 2));
      this.scene.add(frontLeft); wallMatsTransp.push(frontLeft);

      const frontRight = new THREE.Mesh(new THREE.BoxGeometry(0.38, bh, frontSideLen), wallMat.clone());
      frontRight.position.set(frontX, bh / 2, centerZ + (doorHalfW + frontSideLen / 2));
      this.scene.add(frontRight); wallMatsTransp.push(frontRight);

      const topDoor = new THREE.Mesh(new THREE.BoxGeometry(0.38, bh - 2.7, doorHalfW * 2), wallMat.clone());
      topDoor.position.set(frontX, (2.7 + bh) / 2, centerZ);
      this.scene.add(topDoor); wallMatsTransp.push(topDoor);

      const roof = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.6, 0.36, bd + 0.6), new THREE.MeshStandardMaterial({ color: bCfg.roof, roughness: 0.9 }));
      roof.position.set(centerX, bh + 0.18, centerZ);
      this.scene.add(roof);

      const doorGroup = new THREE.Group();
      doorGroup.position.set(frontX, 0, centerZ);
      const doorMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.65, 2.0), new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45, roughness: 0.2 }));
      doorMesh.position.set(0, 1.32, 0);
      const doorHandle = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
      doorHandle.position.set(0.1, 1.3, 0.75);
      doorMesh.add(doorHandle);
      doorGroup.add(doorMesh);
      doorGroup.userData = { isOpen: false, openAngle: 0, doorMesh };
      this.scene.add(doorGroup);
      this.doors.set(bCfg.id, doorGroup);

      const signPos = new THREE.Vector3(frontX - (signCol * 0.25), bh + 0.95, centerZ);
      const jaVisitou = visitados.includes(bCfg.id);
      const placa3D = this.criarLetreiro3D(spInfo.name, signPos, signCol, jaVisitou);

      this.buildingMeshes.set(bCfg.id, { walls: wallMatsTransp, roof, frontX, doorZ: centerZ, centerX, centerZ, bw, bd, bh, floor: floorMesh, doorGroup, placa3D, shopLight });
      this.decorarInteriorEdificio3D(bCfg.id, centerX, centerZ, signCol, bCfg);

      const npcX = centerX + (signCol * 3.1);
      const npcZ = centerZ;
      const isFemaleNPC = ['coffee', 'school', 'shopping', 'cinema', 'hotel', 'job', 'clothing', 'petshop', 'pharmacy', 'real_estate'].includes(bCfg.id);
      const npcMesh = this.criarBonecoHumano3D(bCfg.npcColor, 0x0f172a, 0xfde68a, isFemaleNPC);
      npcMesh.position.set(npcX, 0, npcZ);
      npcMesh.rotation.y = signCol === -1 ? (Math.PI / 2) : (-Math.PI / 2);
      this.scene.add(npcMesh);

      const labelEl = this.criarEtiquetaHTML(`${spInfo.emoji} ${spInfo.npcName}`, 'AI HOST', '#10b981');
      if (labelEl) labelEl.style.display = 'none';
      this.npcs3D.set(bCfg.id, { id: bCfg.id, space: spInfo, name: spInfo.npcName, x: npcX, z: npcZ, mesh: npcMesh, labelEl, col: signCol });

      this.buildingsMeta.push({
        id: bCfg.id,
        space: spInfo,
        col: signCol,
        centerX,
        centerZ,
        bw,
        bd,
        bh,
        minX: centerX - bw / 2,
        maxX: centerX + bw / 2,
        minZ: centerZ - bd / 2,
        maxZ: centerZ + bd / 2,
        frontX,
        doorZ: centerZ
      });
    });

    // ✅ Inicializa os GLBs da pasta /models/, a Guilda do Mago, os Lotes e as Lojas DEPOIS de buildingsMeta estar pronto!
    this.tentarCarregarGLTFsTodos();
    this.criarGuildaMago();
    this.criarLoteamentoResidencial();
    this.criarAnimaisRua();
    this.criarPistaAeroporto();
    ['bank', 'clothing', 'shoes', 'tools', 'petshop', 'supermarket', 'pharmacy', 'bookstore', 'real_estate', 'dealership', 'building_supply'].forEach(id => {
      this.criarLojaComprável(id);
    });
    this.criarMusicoDeRua();
    this.criarVitrinesVivas();
    this.criarQuadroNegroVivo();
    this.criarCardapioFalado();
    this.criarPainelVoosVivo();
    this.criarStickyNotesParede();
    this.criarFotoPolaroid();
    this.ativarSombrasReais();

    const startBuilding = this.buildingsMeta.find(b => b.id === initialSpaceId) || this.buildingsMeta[0];
    const u = window.Workspace?.usuario || {};
    const meuNomeCurto = this.formatarNomeCompleto(u.nome || u.login || 'You');
    const meuId = String(u.id || 'local_' + Date.now());
    const isFemaleUser = this.detetarGeneroPadrao(u);

    const playerMesh = this.criarBonecoHumano3D(isFemaleUser ? 0xec4899 : 0x8b5cf6, 0x1e1b4b, 0xfde68a, isFemaleUser);
    const initialX = startBuilding ? (startBuilding.frontX - startBuilding.col * 2.4) : 0;
    const initialZ = startBuilding ? startBuilding.centerZ : 0;
    playerMesh.position.set(initialX, 0, initialZ);
    this.scene.add(playerMesh);

    const myLabel = this.criarEtiquetaHTML(meuNomeCurto, null, '#38bdf8', true);

    this.localPlayer = {
      userId: meuId,
      nome: meuNomeCurto,
      avatar: u.avatar || null,
      role: this.parentManager.state.role || 'STUDENT',
      actingRole: null,
      isFemale: isFemaleUser,
      shirtColor: isFemaleUser ? 0xec4899 : 0x8b5cf6,
      shoeColor: 0x111111,
      petType: null,
      x: initialX,
      z: initialZ,
      targetX: null,
      targetZ: null,
      rotY: 0,
      mesh: playerMesh,
      labelEl: myLabel,
      bubbleText: ''
    };

    this.iniciarLoopRenderizacao();
  }

  criarEtiquetaHTML(nome, role, corBadge, isLocalUser = false) {
    const layer = document.getElementById('es-city-labels-layer');
    const div = document.createElement('div');
    div.style.cssText = 'position:absolute; transform:translate(-50%, -100%); display:flex; flex-direction:column; align-items:center; pointer-events:none; transition:opacity 0.15s;';
    const textoLimpo = String(nome || '').trim();
    const icone = isLocalUser ? '<span style="color:#38bdf8;">📍</span>' : '<span style="color:#c084fc;">✨</span>';
    const sufixoRole = role ? ` <span class="es-role-tag" style="color:#a1a1aa; font-weight:700;">[${role}]</span>` : '';
    div.innerHTML = `<div class="es-speech-bubble" style="display:none;"></div><div class="es-city-label ${isLocalUser ? 'me' : ''}">${icone} <span>${textoLimpo}${sufixoRole}</span></div>`;
    if (layer) layer.appendChild(div);
    return div;
  }

  mostrarBalaoNoBoneco(entidade, texto, duracaoMs = 6000) {
    if (!entidade || !entidade.labelEl) return;
    entidade.labelEl.style.display = 'flex';
    const bubble = entidade.labelEl.querySelector('.es-speech-bubble');
    if (!bubble) return;
    bubble.textContent = texto;
    bubble.style.display = 'block';
    clearTimeout(entidade._bubbleTimeout);
    entidade._bubbleTimeout = setTimeout(() => { bubble.style.display = 'none'; }, duracaoMs);
  }

  atualizarPortas() {
    if (!this.localPlayer) return;
    this.doors.forEach((doorGroup, id) => {
      const b = this.buildingsMeta.find(x => x.id === id);
      if (!b) return;
      const dist = Math.hypot(b.frontX - this.localPlayer.x, b.doorZ - this.localPlayer.z);
      const shouldOpen = dist < 3.2;
      doorGroup.userData.isOpen = shouldOpen;
      const targetAngle = shouldOpen ? (b.col === -1 ? Math.PI / 2.2 : -Math.PI / 2.2) : 0;
      doorGroup.userData.openAngle += (targetAngle - doorGroup.userData.openAngle) * 0.15;
      doorGroup.rotation.y = doorGroup.userData.openAngle;
    });
  }

  entrarModoInterior(id) {
    if (this.modoInterior && this.predioAtual === id) return;
    if (this.currentVehicle) this.desmontarVeiculo();
    this.modoInterior = true;
    this.predioAtual = id;
    this.exteriorGroup.visible = false;
    this.cars.forEach(c => { c.visible = false; });
    this.pedestrians.forEach(p => { p.mesh.visible = false; if (p.labelEl) p.labelEl.style.display = 'none'; });
    if (this.musician?.labelEl) this.musician.labelEl.style.display = 'none';

    const workBtn = document.getElementById('es-city-work-btn');
    if (workBtn) workBtn.style.display = 'inline-flex';

    this.buildingsMeta.forEach(b => {
      const meshes = this.buildingMeshes.get(b.id);
      const interiorGrp = this.interiorGroups.get(b.id);
      const door = this.doors.get(b.id);
      const npc = this.npcs3D.get(b.id);

      if (b.id === id) {
        if (meshes) {
          meshes.walls.forEach(w => { w.visible = true; });
          if (meshes.roof) meshes.roof.visible = false;
          if (meshes.floor) meshes.floor.visible = true;
          if (meshes.placa3D) meshes.placa3D.visible = false;
        }
        if (interiorGrp) interiorGrp.visible = true;
        if (door) door.visible = true;
        if (npc) { npc.mesh.visible = true; if (npc.labelEl) npc.labelEl.style.display = 'flex'; }
      } else {
        if (meshes) {
          meshes.walls.forEach(w => { w.visible = false; });
          if (meshes.roof) meshes.roof.visible = false;
          if (meshes.floor) meshes.floor.visible = false;
          if (meshes.placa3D) meshes.placa3D.visible = false;
        }
        if (interiorGrp) interiorGrp.visible = false;
        if (door) door.visible = false;
        if (npc) { npc.mesh.visible = false; if (npc.labelEl) npc.labelEl.style.display = 'none'; }
      }
    });
    this.currentZoneId = id;
    this.atualizarHudZonaLocal(id);
    this.enviarMinhaPosicaoServidor();
  }

  sairModoInterior() {
    if (!this.modoInterior) return;
    this.modoInterior = false;
    this.predioAtual = null;
    this.exteriorGroup.visible = true;
    this.cars.forEach(c => { c.visible = true; });
    this.pedestrians.forEach(p => { p.mesh.visible = true; });

    const workBtn = document.getElementById('es-city-work-btn');
    if (workBtn) workBtn.style.display = 'none';

    this.buildingsMeta.forEach(b => {
      const meshes = this.buildingMeshes.get(b.id);
      const interiorGrp = this.interiorGroups.get(b.id);
      const door = this.doors.get(b.id);
      const npc = this.npcs3D.get(b.id);
      if (meshes) {
        meshes.walls.forEach(w => { w.visible = true; });
        if (meshes.roof) meshes.roof.visible = true;
        if (meshes.floor) meshes.floor.visible = true;
        if (meshes.placa3D) meshes.placa3D.visible = true;
      }
      if (interiorGrp) interiorGrp.visible = true;
      if (door) door.visible = true;
      if (npc) { npc.mesh.visible = true; if (npc.labelEl) npc.labelEl.style.display = 'none'; }
    });
    this.currentZoneId = 'street';
    this.atualizarHudZonaLocal('street');
    this.enviarMinhaPosicaoServidor();
  }

  iniciarLoopRenderizacao() {
    const viewport = document.getElementById('es-city-viewport');
    const animar = () => {
      if (!this.active) return;
      this.animFrame = requestAnimationFrame(animar);

      const delta = Math.min(this.clock.getDelta(), 0.1);
      const p = this.localPlayer;
      if (!p) return;

      let inputRight = 0; let inputForward = 0;
      if (this.keys['ArrowUp'] || this.keys['KeyW'] || this.keys['pad_up']) inputForward += 1;
      if (this.keys['ArrowDown'] || this.keys['KeyS'] || this.keys['pad_down']) inputForward -= 1;
      if (this.keys['ArrowLeft'] || this.keys['KeyA'] || this.keys['pad_left']) inputRight -= 1;
      if (this.keys['ArrowRight'] || this.keys['KeyD'] || this.keys['pad_right']) inputRight += 1;

      let estaAndando = false;
      const speed = this.currentVehicle ? (this.vehicleSpeed || 12.0) : 7.5;

      if (inputRight !== 0 || inputForward !== 0) {
        p.targetX = null; p.targetZ = null;
        const len = Math.hypot(inputRight, inputForward);
        const normR = inputRight / len; const normF = inputForward / len;
        const sinY = Math.sin(this.cameraYaw); const cosY = Math.cos(this.cameraYaw);
        const worldDirX = normR * cosY - normF * sinY;
        const worldDirZ = -normR * sinY - normF * cosY;
        const nextX = p.x + worldDirX * speed * delta;
        const nextZ = p.z + worldDirZ * speed * delta;
        if (this.podeMoverPara(nextX, nextZ, p.x, p.z)) {
          p.x = Math.max(-75, Math.min(82, nextX));
          p.z = Math.max(-135, Math.min(70, nextZ));
          p.rotY = Math.atan2(worldDirX, worldDirZ);
          estaAndando = true;
        }
      } else if (p.targetX !== null && p.targetZ !== null) {
        const dx = p.targetX - p.x; const dz = p.targetZ - p.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 0.2) {
          const step = Math.min(dist, speed * delta);
          const nx = p.x + (dx / dist) * step;
          const nz = p.z + (dz / dist) * step;
          if (this.podeMoverPara(nx, nz, p.x, p.z)) {
            p.x = nx; p.z = nz; p.rotY = Math.atan2(dx, dz); estaAndando = true;
          } else { p.targetX = null; p.targetZ = null; }
        } else { p.targetX = null; p.targetZ = null; }
      }

      p.mesh.position.set(p.x, 0, p.z);
      p.mesh.rotation.y = p.rotY;
      this.animarPassosBoneco(p.mesh, estaAndando, delta);

      if (this.vehicleMesh) {
        this.vehicleMesh.position.set(p.x, 0.05, p.z);
        this.vehicleMesh.rotation.y = p.rotY;
      }

      if (this.currentVehicle && this.speedBumps) {
        this.speedBumps.forEach(bump => {
          const dist = Math.hypot(bump.x - p.x, bump.z - p.z);
          if (dist < 2.6 && speed > 13.0 && Date.now() - bump.triggered > 15000) {
            bump.triggered = Date.now();
            this.triggerBlitzEducativa('Speed Bump');
          }
        });
      }

      const yaw = this.cameraYaw;
      const pitch = this.cameraPitch;
      const distBase = this.modoInterior ? 4.4 : 8.4;
      const dist = distBase + pitch * 0.6;
      const camHeight = (this.modoInterior ? 3.4 : 4.8) - pitch * 2.2;
      const camOffsetX = Math.sin(yaw) * dist;
      const camOffsetZ = Math.cos(yaw) * dist;
      this.camera.position.set(p.x + camOffsetX, Math.max(0.8, camHeight), p.z + camOffsetZ);

      const lookAtY = 1.4 + pitch * 10;
      const lookAtX = p.x - Math.sin(yaw) * pitch * 1.2;
      const lookAtZ = p.z - Math.cos(yaw) * pitch * 1.2;
      this.camera.lookAt(lookAtX, lookAtY, lookAtZ);

      this.atualizarPortas();
      this.atualizarAnimais(delta);
      this.atualizarAvioes(delta);
      this.atualizarMusico();
      if (estaAndando) this.soltarPegada();
      this.vitrines.forEach(v => { v.mesh.rotation.y += delta * 0.6; });
      this.footprints = this.footprints.filter(f => {
        const age = Date.now() - f.born;
        if (age > 4200) { this.scene.remove(f.mesh); return false; }
        f.mesh.material.opacity = 0.28 * (1 - age / 4200);
        return true;
      });

      let zonaDetetada = 'street';
      for (const b of this.buildingsMeta) {
        if (p.x >= b.minX && p.x <= b.maxX && p.z >= b.minZ && p.z <= b.maxZ) {
          zonaDetetada = b.id;
          break;
        }
      }
      if (zonaDetetada !== 'street' && !this.modoInterior) {
        this.entrarModoInterior(zonaDetetada);
      } else if (zonaDetetada === 'street' && this.modoInterior) {
        this.sairModoInterior();
      }

      this.nearbyTargets = [];
      this.npcs3D.forEach((npc) => {
        const d = Math.hypot(npc.x - p.x, npc.z - p.z);
        const perto = d <= PROXIMITY_RADIUS && (!this.modoInterior || this.predioAtual === npc.id);
        npc.mesh.userData.ringMat.opacity = perto ? 0.75 : 0.0;
        if (perto) this.nearbyTargets.push({ type: 'npc', id: npc.id, name: npc.name, space: npc.space, dist: d, ref: npc });
      });

      this.otherPlayers3D.forEach((op) => {
        const isStreet = !this.modoInterior;
        const opIsStreet = !op.spaceId || op.spaceId === 'street';
        const sameBuilding = this.modoInterior && op.spaceId === this.predioAtual;
        const naMesmaZona = isStreet ? opIsStreet : sameBuilding;

        op.mesh.visible = naMesmaZona;
        if (op.labelEl) op.labelEl.style.display = naMesmaZona ? 'flex' : 'none';

        const dx = op.targetX - op.mesh.position.x;
        const dz = op.targetZ - op.mesh.position.z;
        const movendoOp = Math.hypot(dx, dz) > 0.05;
        op.mesh.position.x += dx * 0.15;
        op.mesh.position.z += dz * 0.15;
        op.mesh.rotation.y = op.rotY || 0;
        this.animarPassosBoneco(op.mesh, movendoOp, delta);

        const d = Math.hypot(op.mesh.position.x - p.x, op.mesh.position.z - p.z);
        const perto = naMesmaZona && d <= PROXIMITY_RADIUS;
        if (perto) this.nearbyTargets.push({ type: 'player', id: op.userId, name: op.nome, dist: d, ref: op });
        if (op.mesh.userData?.ringMat) op.mesh.userData.ringMat.opacity = perto ? 0.75 : 0.0;
      });

      this.cars.forEach(car => {
        const distToPlayer = Math.hypot(car.position.x - p.x, car.position.z - p.z);
        const playerOnRoad = Math.abs(p.x - car.position.x) < 2.8 && Math.abs(car.position.z - p.z) < 6;
        car.userData.stopped = playerOnRoad && distToPlayer < 5.5;
        if (!car.userData.stopped && !this.modoInterior) {
          car.position.z += car.userData.dir * car.userData.speed * delta;
          if (car.position.z > 18) car.position.z = -90;
          if (car.position.z < -90) car.position.z = 18;
        }
      });

      this.pedestrians.forEach(ped => {
        if (this.modoInterior) return;
        ped.mesh.position.z += ped.dir * ped.speed * delta * 0.6;
        if (ped.mesh.position.z > 14) ped.mesh.position.z = -92;
        if (ped.mesh.position.z < -92) ped.mesh.position.z = 14;
        ped.mesh.rotation.y = ped.dir > 0 ? 0 : Math.PI;
        this.animarPassosBoneco(ped.mesh, true, delta);
        const d = Math.hypot(ped.mesh.position.x - p.x, ped.mesh.position.z - p.z);
        if (d < 3.2 && Date.now() - ped.lastGreet > 8000) {
          this.mostrarBalaoNoBoneco(ped, ped.bubbleText, 3500);
          ped.lastGreet = Date.now();
        }
      });

      if (this.cloudsGroup && !this.modoInterior) {
        this.cloudsGroup.children.forEach(cloud => {
          cloud.position.x += cloud.userData.speed * delta;
          if (cloud.position.x > 60) cloud.position.x = -60;
        });
      }

      p.mesh.userData.ringMat.opacity = this.nearbyTargets.length > 0 ? 0.65 : 0.0;
      this.atualizarBadgeProximidade();

      if (estaAndando && Date.now() - this.lastSyncTime > 260) {
        this.lastSyncTime = Date.now();
        this.enviarMinhaPosicaoServidor();
      }

      const vw = viewport.clientWidth || window.innerWidth;
      const vh = viewport.clientHeight || window.innerHeight;
      this.projetarEtiquetaHTML(p.mesh.position, 2.45, p.labelEl, vw, vh);
      this.otherPlayers3D.forEach(op => {
        if (op.mesh.visible) this.projetarEtiquetaHTML(op.mesh.position, 2.45, op.labelEl, vw, vh);
      });
      this.npcs3D.forEach(npc => {
        const mostrarNpc = (this.modoInterior && this.predioAtual === npc.id);
        if (npc.labelEl) npc.labelEl.style.display = mostrarNpc ? 'flex' : 'none';
        if (mostrarNpc) this.projetarEtiquetaHTML(npc.mesh.position, 2.45, npc.labelEl, vw, vh);
      });
      this.pedestrians.forEach(ped => {
        const bubble = ped.labelEl?.querySelector('.es-speech-bubble');
        const falando = !this.modoInterior && bubble && bubble.style.display === 'block';
        if (ped.labelEl) ped.labelEl.style.display = falando ? 'flex' : 'none';
        if (falando) this.projetarEtiquetaHTML(ped.mesh.position, 2.35, ped.labelEl, vw, vh);
      });
      if (this.musician) {
        const bubble = this.musician.labelEl?.querySelector('.es-speech-bubble');
        const falando = !this.modoInterior && bubble && bubble.style.display === 'block';
        if (this.musician.labelEl) this.musician.labelEl.style.display = falando ? 'flex' : 'none';
        if (falando) this.projetarEtiquetaHTML(this.musician.mesh.position, 2.35, this.musician.labelEl, vw, vh);
      }

      this.renderer.render(this.scene, this.camera);
    };
    this.atualizarHudZonaLocal('street');
    animar();
  }

  projetarEtiquetaHTML(pos3D, offsetY, domEl, vw, vh) {
    if (!domEl || !this.camera) return;
    const THREE = window.THREE;
    const v = new THREE.Vector3(pos3D.x, pos3D.y + offsetY, pos3D.z);
    v.project(this.camera);
    if (v.z > 1 || v.z < -1) { domEl.style.opacity = '0'; return; }
    const x = (v.x * 0.5 + 0.5) * vw;
    const y = (-(v.y * 0.5) + 0.5) * vh;
    domEl.style.left = `${x}px`;
    domEl.style.top = `${y}px`;
    domEl.style.opacity = '1';
  }

  atualizarHudZonaLocal(zoneId) {
    const badge = document.getElementById('es-city-zone-badge');
    if (!badge) return;
    if (zoneId === 'street') {
      badge.innerHTML = '🏙️ English City Boulevard (Street)';
      return;
    }
    const bMeta = this.buildingsMeta.find(b => b.id === zoneId);
    if (!bMeta) return;
    const sp = bMeta.space;
    this.parentManager.state.currentSpace = sp;
    this.parentManager.registarMissaoConcluida(sp.id, 'visit', 10);
    DOVRYX.atualizarHud();
    badge.innerHTML = `${sp.emoji} Inside: ${sp.name}`;
  }

  atualizarBadgeProximidade() {
    const badge = document.getElementById('es-city-proximity-badge');
    const input = document.getElementById('es-city-chat-input');
    if (!badge) return;
    if (this.nearbyTargets.length === 0) {
      badge.style.background = 'rgba(22, 24, 38, 0.76)';
      badge.style.borderColor = 'rgba(255, 255, 255, 0.14)';
      badge.style.color = '#cbd5e1';
      badge.innerHTML = '<span style="color:#f87171;">•</span> Out of Range';
      if (input) input.placeholder = 'Type message...';
    } else {
      const nomes = this.nearbyTargets.map(t => t.name).join(', ');
      badge.style.background = 'rgba(16, 185, 129, 0.24)';
      badge.style.borderColor = '#10b981';
      badge.style.color = '#6ee7b7';
      badge.innerHTML = `<span style="color:#34d399;">•</span> Near: ${nomes}`;
      if (input) input.placeholder = `Message ${nomes}...`;
    }
  }

  adicionarMensagemFeedProximidade(autor, texto, cor = '#e2e8f0') {
    const feed = document.getElementById('es-city-chat-feed');
    if (!feed) return;
    const item = document.createElement('div');
    item.innerHTML = `<strong style="color:${cor};">${autor}:</strong> <span>${texto}</span>`;
    feed.appendChild(item);
  }

  async processarFalaPorProximidade(textoCru) {
    const texto = String(textoCru || '').trim();
    if (!texto || !this.localPlayer) return;
    const lower = texto.toLowerCase();

    if (lower.includes('take me to') || lower.includes('go to')) {
      const taxiTarget = this.buildingsMeta.find(b => lower.includes(b.id) || lower.includes(b.space.name.toLowerCase()));
      if (taxiTarget) {
        if (this.modoInterior) this.sairModoInterior();
        this.localPlayer.x = taxiTarget.frontX - taxiTarget.col * 2.5;
        this.localPlayer.z = taxiTarget.centerZ;
        this.localPlayer.targetX = null;
        this.localPlayer.targetZ = null;
        if (window.Workspace?.mostrarAviso) window.Workspace.mostrarAviso(`🚕 Taxi taking you to ${taxiTarget.space.name}!`, 'success');
        this.enviarMinhaPosicaoServidor();
        return;
      }
    }

    if (this.nearbyTargets.length === 0) {
      if (window.Workspace?.mostrarAviso) {
        window.Workspace.mostrarAviso('🚶 Aproxime-se de outro aluno ou personagem (até acender o círculo verde no chão) para conversar!', 'warning');
      }
      return;
    }

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('thank') || lower.includes('bye') || lower.includes('hey')) {
      this.animarEmote(this.localPlayer);
      this.nearbyTargets.forEach(t => { if (t.ref) this.animarEmote(t.ref); });
    }

    this.mostrarBalaoNoBoneco(this.localPlayer, texto);
    this.adicionarMensagemFeedProximidade(this.localPlayer.nome, texto, '#c084fc');

    fetch('/api/workspace/english-spaces/world/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        userId: this.localPlayer.userId,
        nome: this.localPlayer.nome,
        role: this.localPlayer.role,
        text: texto,
        x: this.localPlayer.x,
        z: this.localPlayer.z,
        spaceId: this.currentZoneId
      })
    }).catch(() => {});

    const npcAlvo = this.nearbyTargets.find(t => t.type === 'npc');
    if (npcAlvo) {
      const sp = npcAlvo.space;
      try {
        const prompt = `[3D City Location: ${sp.name} | You are: ${sp.npcName} | Student (${this.localPlayer.nome}) is right in front of you and said: "${texto}"]. Reply naturally in character in 1-2 short sentences in English.`;
        const res = await window.Workspace.api('/workspace/ingles/ia-teste/groq', 'POST', { mensagem: prompt, historico: [] });
        if (res && res.success && res.resposta) {
          this.mostrarBalaoNoBoneco(npcAlvo.ref, res.resposta, 8000);
          this.adicionarMensagemFeedProximidade(sp.npcName, res.resposta, '#34d399');
          this.falarTextoNPC(res.resposta, sp.id);
          await DOVRYX.add(35, `Conversation at ${sp.name}`);
        }
      } catch (e) {}
    }
  }

  configurarEventosControles() {
    this._onResize = () => {
      const vp = document.getElementById('es-city-viewport');
      if (!vp || !this.renderer || !this.camera) return;
      const w = vp.clientWidth || window.innerWidth;
      const h = vp.clientHeight || window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };
    window.addEventListener('resize', this._onResize);

    this._onKeyDown = (e) => {
      this.garantirAudioAtivo();
      if (['es-city-chat-input', 'es-sticky-text', 'job-answer'].includes(document.activeElement?.id)) return;
      this.keys[e.code] = true;
      this.keys[e.key] = true;
    };
    this._onKeyUp = (e) => { this.keys[e.code] = false; this.keys[e.key] = false; };
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);

    document.querySelectorAll('.es-move-pad').forEach(btn => {
      const dir = 'pad_' + btn.dataset.dir;
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.garantirAudioAtivo();
        this.keys[dir] = true;
      });
      btn.addEventListener('pointerup', () => { this.keys[dir] = false; });
      btn.addEventListener('pointerleave', () => { this.keys[dir] = false; });
    });

    document.getElementById('es-city-gender-btn')?.addEventListener('click', () => {
      this.garantirAudioAtivo();
      this.alternarGeneroMeuAvatar();
    });

    document.getElementById('es-city-vehicle-btn')?.addEventListener('click', () => {
      this.garantirAudioAtivo();
      this.alternarOuMontarVeiculo();
    });

    document.getElementById('es-city-home-btn')?.addEventListener('click', () => {
      this.garantirAudioAtivo();
      if (this.modoInterior) this.sairModoInterior();
      this.localPlayer.x = -27;
      this.localPlayer.z = 26;
      this.localPlayer.targetX = null;
      this.localPlayer.targetZ = null;
      this.abrirModalConstrucaoCasa();
    });

    document.getElementById('es-city-bau-btn')?.addEventListener('click', () => {
      this.garantirAudioAtivo();
      const bGuild = this.buildingsMeta.find(b => b.id === 'guild_bau');
      if (bGuild) {
        if (this.modoInterior) this.sairModoInterior();
        this.localPlayer.x = bGuild.frontX - bGuild.col * 2.2;
        this.localPlayer.z = bGuild.centerZ;
        this.localPlayer.targetX = null;
        this.localPlayer.targetZ = null;
        if (window.Workspace?.mostrarAviso) {
          window.Workspace.mostrarAviso('🧙‍♂️ Arrived at Guild Baú do Inglês! Walk through the door to meet the Master Wizard!', 'info');
        }
      }
    });

    document.getElementById('es-city-work-btn')?.addEventListener('click', () => {
      if (this.predioAtual) this.iniciarTrabalhoPartTime(this.predioAtual);
    });

    const domCanvas = this.renderer.domElement;
    const THREE = window.THREE;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const planeY0 = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    domCanvas.addEventListener('pointerdown', (e) => {
      this.garantirAudioAtivo();
      this.isDraggingCam = true;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this._startYaw = this.cameraYaw;
      this._startPitch = this.cameraPitch;
      this._movedDrag = false;
    });

    domCanvas.addEventListener('pointermove', (e) => {
      if (!this.isDraggingCam) return;
      const dx = e.clientX - this.dragStartX;
      const dy = e.clientY - this.dragStartY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) this._movedDrag = true;
      this.cameraYaw = this._startYaw - dx * 0.006;
      this.cameraPitch = Math.max(-0.45, Math.min(1.35, this._startPitch + dy * 0.0045));
    });

    domCanvas.addEventListener('pointerup', (e) => {
      this.isDraggingCam = false;
      if (!this._movedDrag && this.localPlayer) {
        const rect = domCanvas.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, this.camera);

        const hits = raycaster.intersectObjects(this.clickableObjects, true);
        if (hits.length > 0) {
          let obj = hits[0].object;
          while (obj && !obj.userData?.clickable && obj.parent) obj = obj.parent;
          const ud = obj?.userData || hits[0].object.userData || {};

          if (ud.isMage) { this.interagirComMestreMago(); return; }
          if (ud.isPortal) { this.abrirPortalBauIngles(); return; }
          if (ud.isLot) { this.abrirModalConstrucaoCasa(); return; }
          if (ud.isShopItem && ud.item) { this.abrirLojaXPModal(ud.shopId, ud.item); return; }
          if (ud.isPolaroidCam) { this.tirarFotoPolaroid(); return; }
          if (ud.isIndividualSticky && ud.stickyData) { this.abrirModalLerStickyNote(ud.stickyData); return; }
          if (ud.isStickyWall) { this.abrirModalCriarStickyNote(); return; }
          if (ud.isTaxiRadio) { this.tocarRadioTaxi(); return; }
          if (ud.isBlackboard && typeof ud.nextLesson === 'function') {
            const licao = ud.nextLesson();
            this.falarTextoNPC(licao, 'school');
            this.mostrarBalaoNoBoneco(this.localPlayer, `📖 ${licao}`, 5000);
            DOVRYX.add(15, 'Classboard Lesson');
            return;
          }

          const name = ud.englishName || 'Object';
          this.falarTextoNPC(name, this.currentZoneId);
          this.mostrarBalaoNoBoneco(this.localPlayer, `💡 ${name}`, 3500);
          DOVRYX.add(15, name);
          return;
        }

        const intersectPt = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(planeY0, intersectPt)) {
          const tx = Math.max(-75, Math.min(82, intersectPt.x));
          const tz = Math.max(-135, Math.min(70, intersectPt.z));
          if (this.podeMoverPara(tx, tz, this.localPlayer.x, this.localPlayer.z)) {
            this.localPlayer.targetX = tx;
            this.localPlayer.targetZ = tz;
          }
        }
      }
    });

    const inputEl = document.getElementById('es-city-chat-input');
    const sendBtn = document.getElementById('es-city-send-btn');
    const dispararEnvio = () => {
      if (!inputEl || !inputEl.value.trim()) return;
      const txt = inputEl.value.trim();
      inputEl.value = '';
      this.processarFalaPorProximidade(txt);
    };
    sendBtn?.addEventListener('click', dispararEnvio);
    inputEl?.addEventListener('keypress', (e) => { if (e.key === 'Enter') dispararEnvio(); });

    document.getElementById('es-city-voice-btn')?.addEventListener('click', () => {
      this.garantirAudioAtivo();
      this.parentManager.ouvirMicrofone((falado) => {
        if (inputEl) inputEl.value = falado;
        this.processarFalaPorProximidade(falado);
      });
    });

    document.getElementById('es-city-exit-btn')?.addEventListener('click', () => {
      this.fecharCidade3D();
    });
  }

  enviarMinhaPosicaoServidor() {
    if (!this.localPlayer) return;
    fetch('/api/workspace/english-spaces/world/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        userId: this.localPlayer.userId,
        nome: this.localPlayer.nome,
        avatar: this.localPlayer.avatar,
        role: this.localPlayer.role,
        isFemale: Boolean(this.localPlayer.isFemale),
        shirtColor: this.localPlayer.shirtColor || null,
        shoeColor: this.localPlayer.shoeColor || null,
        petType: this.localPlayer.petType || null,
        equippedVehicle: this.currentVehicle || null,
        houseStage: this.houseStage || 1,
        x: Math.round(this.localPlayer.x * 100) / 100,
        z: Math.round(this.localPlayer.z * 100) / 100,
        rotY: Math.round(this.localPlayer.rotY * 100) / 100,
        spaceId: this.currentZoneId
      })
    }).then(r => r.json()).then(data => {
      if (data && Array.isArray(data.players)) this.sincronizarListaJogadoresRemotos(data.players);
    }).catch(() => {});
  }

  sincronizarListaJogadoresRemotos(lista) {
    if (!this.active || !this.scene || !this.localPlayer) return;
    lista.forEach(pData => {
      if (!pData || !pData.userId || pData.userId === this.localPlayer.userId) return;
      let op = this.otherPlayers3D.get(pData.userId);
      const nomeCurto = this.formatarNomeCompleto(pData.nome || 'Student');
      const isFem = typeof pData.isFemale === 'boolean'
        ? pData.isFemale
        : String(pData.nome || '').trim().split(/\s+/)[0].toLowerCase().endsWith('a');
      const corCamisa = typeof pData.shirtColor === 'number' ? pData.shirtColor : (isFem ? 0xec4899 : 0x3b82f6);
      const corSapato = typeof pData.shoeColor === 'number' ? pData.shoeColor : 0x111111;

      if (!op) {
        const mesh = this.criarBonecoHumano3D(corCamisa, 0x0f172a, 0xfde68a, isFem);
        if (mesh.userData?.matSapato) mesh.userData.matSapato.color.setHex(corSapato);
        mesh.position.set(pData.x || 0, 0, pData.z || 0);
        this.scene.add(mesh);
        const labelEl = this.criarEtiquetaHTML(nomeCurto, null, '#38bdf8');
        op = {
          userId: pData.userId,
          nome: nomeCurto,
          role: pData.role || 'PEER',
          isFemale: isFem,
          shirtColor: corCamisa,
          shoeColor: corSapato,
          spaceId: pData.spaceId || 'street',
          mesh,
          labelEl,
          targetX: pData.x || 0,
          targetZ: pData.z || 0,
          rotY: pData.rotY || 0
        };
        this.otherPlayers3D.set(pData.userId, op);
      } else {
        op.targetX = Number(pData.x) || 0;
        op.targetZ = Number(pData.z) || 0;
        op.rotY = Number(pData.rotY) || 0;
        op.spaceId = pData.spaceId || 'street';

        if (op.isFemale !== isFem) {
          this.scene.remove(op.mesh);
          const novoMesh = this.criarBonecoHumano3D(corCamisa, 0x0f172a, 0xfde68a, isFem);
          if (novoMesh.userData?.matSapato) novoMesh.userData.matSapato.color.setHex(corSapato);
          novoMesh.position.copy(op.mesh.position);
          this.scene.add(novoMesh);
          op.mesh = novoMesh;
          op.isFemale = isFem;
        } else {
          if (op.shirtColor !== corCamisa && op.mesh.userData?.matCamisa) {
            op.mesh.userData.matCamisa.color.setHex(corCamisa);
            op.shirtColor = corCamisa;
          }
          if (op.shoeColor !== corSapato && op.mesh.userData?.matSapato) {
            op.mesh.userData.matSapato.color.setHex(corSapato);
            op.shoeColor = corSapato;
          }
        }
      }
    });
  }

 iniciarMultiplayerRealtime() {
    this.enviarMinhaPosicaoServidor();
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = setInterval(() => {
      if (!document.hidden) this.enviarMinhaPosicaoServidor();
    }, 4000);

    const conectarSSE = () => {
      if (!this.active) return;
      if (this.sseConnection) {
        try { this.sseConnection.close(); } catch (e) {}
        this.sseConnection = null;
      }

      try {
        const escolaId = window.Workspace?.usuario?.escolaId || 'DEFAULT';
        this.sseConnection = new EventSource(`/api/workspace/stream?escolaId=${encodeURIComponent(escolaId)}`, {
          withCredentials: true
        });

        this.sseConnection.onmessage = (ev) => {
          if (!this.active || !this.localPlayer) return;
          try {
            const data = JSON.parse(ev.data);
            if (data.type === 'ES_WORLD_MOVE' && data.player) {
              this.sincronizarListaJogadoresRemotos([data.player]);
            }
            if (data.type === 'ES_STICKY_UPDATE' && Array.isArray(data.notes)) {
              this.cloudStickyNotes = data.notes;
              this.renderizarStickyNotesNoCoffee();
            }
            if (data.type === 'ES_WORLD_LEAVE' && data.userId) {
              const rem = this.otherPlayers3D.get(data.userId);
              if (rem) {
                this.scene.remove(rem.mesh);
                if (rem.labelEl) rem.labelEl.remove();
                this.otherPlayers3D.delete(data.userId);
              }
            }
            if (data.type === 'ES_WORLD_SPEAK' && data.speakerId !== this.localPlayer.userId) {
              const dist = Math.hypot((data.x || 0) - this.localPlayer.x, (data.z || 0) - this.localPlayer.z);
              if (dist <= PROXIMITY_RADIUS) {
                const op = this.otherPlayers3D.get(data.speakerId);
                if (op) {
                  this.mostrarBalaoNoBoneco(op, data.text, 7000);
                  this.animarEmote(op);
                }
                this.adicionarMensagemFeedProximidade(`🧑 ${data.speakerName}`, data.text, '#38bdf8');
                this.falarTextoNPC(data.text, data.spaceId);
              }
            }
          } catch (e) {}
        };

        // 🛡️ Se o navegador suspender a rede (ERR_NETWORK_IO_SUSPENDED), fecha limpo e reconecta após 5s
        this.sseConnection.onerror = () => {
          if (this.sseConnection) {
            try { this.sseConnection.close(); } catch (e) {}
            this.sseConnection = null;
          }
          clearTimeout(this._sseRetryTimer);
          if (this.active && !document.hidden) {
            this._sseRetryTimer = setTimeout(() => conectarSSE(), 5000);
          }
        };
      } catch (e) {}
    };

    conectarSSE();

    // 🔄 Quando o utilizador volta para a aba do navegador, reativa o túnel imediatamente
    this._onVisibilityChange = () => {
      if (!this.active) return;
      if (document.hidden) {
        if (this.sseConnection) {
          try { this.sseConnection.close(); } catch (e) {}
          this.sseConnection = null;
        }
      } else {
        this.enviarMinhaPosicaoServidor();
        if (!this.sseConnection) conectarSSE();
      }
    };
    document.addEventListener('visibilitychange', this._onVisibilityChange);
  }

  fecharCidade3D() {
    this.active = false;
    document.body.style.overflow = '';
    ['shop-modal', 'es-sticky-modal', 'es-sticky-view-modal', 'es-mage-dialog', 'es-house-modal', 'job-modal', 'blitz-modal'].forEach(id => {
      document.getElementById(id)?.remove();
    });
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.dayNightInterval) clearInterval(this.dayNightInterval);
    if (this.flightBoardInterval) clearInterval(this.flightBoardInterval);
    clearTimeout(this._sseRetryTimer);
    if (this.audioCtx) {
      try { this.audioCtx.close(); } catch (e) {}
      this.audioCtx = null;
    }
    if (this.sseConnection) {
      try { this.sseConnection.close(); } catch (e) {}
      this.sseConnection = null;
    }
    if (this._onVisibilityChange) {
      document.removeEventListener('visibilitychange', this._onVisibilityChange);
    }
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    if (this.localPlayer) {
      fetch('/api/workspace/english-spaces/world/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: this.localPlayer.userId })
      }).catch(() => {});
    }
    if (this.parentManager) this.parentManager.navigate('home');
  }
}

Workspace.EnglishSpaces3D = new EnglishSpaces3DWorld();