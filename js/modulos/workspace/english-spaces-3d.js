// js/modulos/workspace/english-spaces-3d.js
// 🏙️ MOTOR DA CIDADE 3D MULTIPLAYER (FACHADAS FECHADAS + PORTAS AUTOMÁTICAS + 12 INTERIORES COMPLETOS + 14 MARAVILHAS)

window.Workspace = window.Workspace || {};

const PROXIMITY_RADIUS = 6.0; // Distância máxima em metros 3D para ouvir e falar com alguém

// Coordenadas e cores dos 12 Edifícios da Cidade 3D (6 à esquerda da avenida, 6 à direita)
const CITY_BUILDINGS_LAYOUT = [
  { id: 'coffee',     col: -1, row: 0, color: 0xd97706, roof: 0x451a03, npcColor: 0xf59e0b, voiceLang: 'en-US', voicePitch: 1.15 },
  { id: 'restaurant', col:  1, row: 0, color: 0xe11d48, roof: 0x4c0519, npcColor: 0xfb7185, voiceLang: 'en-US', voicePitch: 0.92 },
  { id: 'school',     col: -1, row: 1, color: 0x16a34a, roof: 0x052e16, npcColor: 0x4ade80, voiceLang: 'en-GB', voicePitch: 0.95 },
  { id: 'shopping',   col:  1, row: 1, color: 0xca8a04, roof: 0x422006, npcColor: 0xfacc15, voiceLang: 'en-US', voicePitch: 1.18 },
  { id: 'home',       col: -1, row: 2, color: 0x475569, roof: 0x1e293b, npcColor: 0x94a3b8, voiceLang: 'en-US', voicePitch: 1.02 },
  { id: 'cinema',     col:  1, row: 2, color: 0xdb2777, roof: 0x500724, npcColor: 0xf472b6, voiceLang: 'en-US', voicePitch: 1.14 },
  { id: 'taxi',       col: -1, row: 3, color: 0xeab308, roof: 0x422006, npcColor: 0xfde047, voiceLang: 'en-US', voicePitch: 0.88 },
  { id: 'beach',      col:  1, row: 3, color: 0x0d9488, roof: 0x042f2e, npcColor: 0x2dd4bf, voiceLang: 'en-US', voicePitch: 1.05 },
  { id: 'hotel',      col: -1, row: 4, color: 0x9333ea, roof: 0x3b0764, npcColor: 0xc084fc, voiceLang: 'en-GB', voicePitch: 1.12 },
  { id: 'airport',    col:  1, row: 4, color: 0x0284c7, roof: 0x082f49, npcColor: 0x38bdf8, voiceLang: 'en-GB', voicePitch: 0.94 },
  { id: 'job',        col: -1, row: 5, color: 0x4f46e5, roof: 0x1e1b4b, npcColor: 0x818cf8, voiceLang: 'en-US', voicePitch: 1.10 },
  { id: 'hospital',   col:  1, row: 5, color: 0x059669, roof: 0x022c22, npcColor: 0x34d399, voiceLang: 'en-GB', voicePitch: 0.90 }
];

class EnglishSpaces3DWorld {
  formatarNomeCompleto(nomeBruto) {
    const limpo = String(nomeBruto || 'User').trim();
    const partes = limpo.split(/\s+/);
    if (partes.length <= 1) return limpo;
    return `${partes[0]} ${partes[partes.length - 1]}`;
  }

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
    this.pedestrians = [];
    this.clickableObjects = [];
    this.outdoors = [];
    this.posteLights = [];
    this.audioCtx = null;
    this.lastDoorEnter = null;
    this.audioZones = [];
    this.footprints = [];
    this.lastFootprint = 0;
    this.vitrines = [];
    this.rainGroup = null;
    this.fogPlane = null;
    this.nightMarketGroup = null;
    this.musician = null;
    this.stickyNotes = [];
    this.ghost = null;
    this.ghostPath = [];
    this.ghostIdx = 0;
    this.polaroidCam = null;
    this.flightBoard = null;
    this.blackboard = null;
    this.menuStands = [];

    // Controlo de Mundo Fechado e Interiores
    this.exteriorGroup = null;
    this.interiorGroups = new Map();
    this.doors = new Map();
    this.modoInterior = false;
    this.predioAtual = null;
    this.topLeaderText = 'Leader: Paulo - 1,250 XP';
    // GLTF e Animais
    this.gltfLoader = null;
    this.gltfCache = new Map();
    this.animais = { caes: [], gatos: [], passaros: [], passarosGroup: null };
  }

  async carregarGLTFLoader() {
    if (window.THREE && window.THREE.GLTFLoader) { this.gltfLoader = new window.THREE.GLTFLoader(); return; }
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/three@0.128.0/examples/js/loaders/GLTFLoader.js';
      s.onload = () => { try { this.gltfLoader = new window.THREE.GLTFLoader(); } catch(e){} resolve(); };
      s.onerror = () => resolve();
      document.head.appendChild(s);
    });
  }

  async carregarThreeJS() {
    if (window.THREE) { await this.carregarGLTFLoader(); return window.THREE; }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.onload = async () => { await this.carregarGLTFLoader(); resolve(window.THREE); };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async abrirCidade3D(parentManager, initialSpaceId = 'coffee') {
    this.parentManager = parentManager;
    const containerRoot = document.getElementById('english-spaces-root');
    if (!containerRoot) return;

    containerRoot.innerHTML = `
      <style>
        body { overflow: hidden !important; }
        #es-city-wrapper { position: fixed !important; inset: 0 !important; width: 100vw !important; height: 100dvh !important; background: #05070e !important; z-index: 1000020 !important; font-family: 'Inter','Geist','Poppins',sans-serif !important; user-select: none !important; overflow: hidden !important; }
        #es-city-Hud-card, #es-city-teleport, #es-city-chat-feed { position: absolute !important; width: 0 !important; height: 0 !important; overflow: hidden !important; opacity: 0 !important; pointer-events: none !important; }
        #es-city-viewport { position: absolute !important; inset: 0 !important; width: 100vw !important; height: 100dvh !important; z-index: 1 !important; touch-action: none !important; }
        #es-city-viewport canvas { display: block !important; width: 100% !important; height: 100% !important; }
        #es-city-labels-layer { position: absolute; inset: 0; pointer-events: none; z-index: 10; overflow: hidden; }
        .es-ref-top-area { position: absolute; top: 0; left: 0; right: 0; z-index: 30; padding: max(16px, env(safe-area-inset-top)) 20px 0 20px; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
        .es-ref-subbar { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        #es-city-zone-badge { pointer-events: auto; background: linear-gradient(135deg, rgba(139,92,246,0.28), rgba(124,58,237,0.22)) !important; border: 1px solid rgba(167,139,250,0.42) !important; color: #ede9fe !important; padding: 7px 14px !important; border-radius: 999px !important; font-size: 12px !important; font-weight: 800 !important; backdrop-filter: blur(16px) saturate(1.2); box-shadow: 0 6px 18px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.14); }
        #es-city-exit-btn { pointer-events: auto; background: rgba(18, 20, 36, 0.82) !important; border: 1px solid rgba(255, 255, 255, 0.16) !important; color: #e2e8f0 !important; padding: 8px 16px !important; border-radius: 999px !important; font-size: 12px !important; font-weight: 700 !important; cursor: pointer !important; backdrop-filter: blur(16px); box-shadow: 0 6px 18px rgba(0,0,0,0.35); transition: 0.2s; }
        #es-city-exit-btn:hover { background: rgba(239, 68, 68, 0.88) !important; color: #fff !important; }
        .es-ref-proximity-wrap { display: flex; justify-content: center; padding: 2px 0; }
        #es-city-proximity-badge { pointer-events: auto; background: rgba(18, 20, 36, 0.76) !important; border: 1px solid rgba(255,255,255,0.14) !important; color: #cbd5e1 !important; padding: 6px 14px !important; border-radius: 999px !important; font-size: 11.5px !important; font-weight: 700 !important; backdrop-filter: blur(16px); box-shadow: 0 6px 18px rgba(0,0,0,0.28); display: inline-flex !important; align-items: center !important; gap: 6px !important; }
        /* Etiquetas sem position:absolute duplicado para alinhar perfeitamente com os balões */
        .es-city-label { position: relative; background: rgba(12,14,28,0.86); border: 1px solid rgba(139,92,246,0.32); color: #e9d5ff; padding: 6px 12px; border-radius: 999px; font-size: 11.5px; font-weight: 700; white-space: nowrap; backdrop-filter: blur(14px); box-shadow: 0 8px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08); pointer-events: none; display: inline-flex; align-items: center; gap: 6px; }
        .es-city-label.me { background: rgba(18,22,48,0.9); border-color: rgba(59,130,246,0.4); color: #dbeafe; }
        .es-dpad-circle { position: absolute !important; right: 22px !important; bottom: 96px !important; width: 112px !important; height: 112px !important; border-radius: 50% !important; background: radial-gradient(circle at 35% 35%, rgba(255,255,255,0.08), rgba(18,20,36,0.72)) !important; border: 1px solid rgba(255,255,255,0.14) !important; backdrop-filter: blur(18px) saturate(1.2) !important; box-shadow: 0 12px 28px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12) !important; z-index: 20 !important; display: grid !important; grid-template-areas: ". up ." "left . right" ". down ." !important; place-items: center !important; padding: 8px !important; }
        .es-move-pad { width: 32px !important; height: 32px !important; border-radius: 50% !important; background: rgba(255,255,255,0.06) !important; border: 1px solid rgba(255,255,255,0.1) !important; color: #cbd5e1 !important; font-size: 12px !important; display: flex !important; align-items: center !important; justify-content: center !important; cursor: pointer !important; }
        .es-move-pad[data-dir="up"] { grid-area: up; } .es-move-pad[data-dir="left"] { grid-area: left; } .es-move-pad[data-dir="right"] { grid-area: right; } .es-move-pad[data-dir="down"] { grid-area: down; }
        .es-move-pad:active, .es-move-pad:hover { background: rgba(139,92,246,0.34) !important; color: #fff !important; }
        .es-ref-bottom-bar { position: absolute; bottom: 0; left: 0; right: 0; z-index: 30; pointer-events: auto; display: flex; align-items: center; gap: 10px; padding: 12px; margin: 0 16px max(14px, env(safe-area-inset-bottom)) 16px; background: rgba(14, 16, 28, 0.88) !important; border: 1px solid rgba(255,255,255,0.10) !important; border-radius: 20px !important; backdrop-filter: blur(22px) saturate(1.25) !important; box-shadow: 0 16px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08) !important; }
        #es-city-voice-btn { height: 46px !important; padding: 0 16px !important; border-radius: 14px !important; background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important; color: #fff !important; border: 1px solid rgba(255,255,255,0.14) !important; font-size: 13px !important; font-weight: 800 !important; box-shadow: 0 8px 18px rgba(16,185,129,0.32) !important; cursor: pointer !important; display: inline-flex !important; align-items: center !important; gap: 6px !important; white-space: nowrap !important; }
        #es-city-speak-nearby-pill { height: 46px !important; padding: 0 16px !important; border-radius: 14px !important; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%) !important; color: #fff !important; border: 1px solid rgba(255,255,255,0.14) !important; font-size: 13px !important; font-weight: 800 !important; box-shadow: 0 8px 18px rgba(139,92,246,0.32) !important; cursor: pointer !important; display: inline-flex !important; align-items: center !important; gap: 6px !important; white-space: nowrap !important; }
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
            <button type="button" id="es-city-exit-btn">⇄ Exit 3D World</button>
          </div>
          <div class="es-ref-proximity-wrap">
            <span id="es-city-proximity-badge">• Out of Range</span>
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
    this.carregarLiderRankingReal();
    this.inicializarCenaThreeJS(initialSpaceId);
    this.configurarEventosControles();
    this.iniciarMultiplayerRealtime();
  }

  // 🏆 Busca o Top 1 real do Ranking da Escola no Backend (/workspace/ingles/ranking)
  async carregarLiderRankingReal() {
    if (!window.Workspace?.api) return;
    try {
      const escolaId = window.Workspace?.usuario?.escolaId || 'DEFAULT';
      const res = await window.Workspace.api(`/workspace/ingles/ranking?escolaId=${encodeURIComponent(escolaId)}`, 'GET');
      if (res && res.success && Array.isArray(res.ranking) && res.ranking.length > 0) {
        const top1 = res.ranking[0];
        const xp = top1.coins?.bronze || 1250;
        this.topLeaderText = `Leader: ${top1.nome} - ${xp} XP`;
        if (this.ghost && this.ghost.labelEl) {
          const span = this.ghost.labelEl.querySelector('.es-city-label span:last-child');
          if (span) span.innerHTML = `${top1.nome} (Top 1 👻) <span style="color:#a1a1aa; font-weight:600;">[LEADER]</span>`;
        }
      }
    } catch (e) {}
  }

  // 🔊 Voz personalizada por NPC (Sotaque US/UK e timbre masculino/feminino)
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

  // 👤 CONSTRUTOR DE BONECO HUMANO 3D ARTICULADO E CONSISTENTE
 criarBonecoHumano3D(corCamisa = 0x8b5cf6, corCalca = 0x1e293b, corPele = 0xfde68a, isFemale = false) {
    const THREE = window.THREE;
    const group = new THREE.Group();

    // Tenta usar cache GLTF de avatar se existir
    const cachedAvatar = this.gltfCache?.get('avatar');
    if (cachedAvatar) {
      const clone = cachedAvatar.clone(true);
      clone.traverse(o=>{ if(o.isMesh){ o.castShadow=true; }});
      group.add(clone);
      const ringGeo = new THREE.RingGeometry(0.65, 0.82, 24); ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.0 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat); ringMesh.position.y = 0.03; group.add(ringMesh);
      const dummy = new THREE.Group();
      group.userData = { leftLeg: dummy, rightLeg: dummy, leftArm: dummy, rightArm: dummy, headGroup: dummy, ringMat, walkPhase: 0, emotePhase: 0, isEmoting: false, isFemale };
      return group;
    }

    const matPele = new THREE.MeshStandardMaterial({ color: corPele, roughness: 0.55, metalness: 0.05 });
    const matCamisa = new THREE.MeshStandardMaterial({ color: corCamisa, roughness: 0.7, metalness: 0.08 });
    const matCalca = new THREE.MeshStandardMaterial({ color: corCalca, roughness: 0.8, metalness: 0.1 });
    const matCabeloFem = new THREE.MeshStandardMaterial({ color: 0x5c2b0e, roughness: 0.85 });
    const matCabeloMasc = new THREE.MeshStandardMaterial({ color: 0x1e1e22, roughness: 0.9 });
    const matCabelo = isFemale ? matCabeloFem : matCabeloMasc;
    const matOlho = new THREE.MeshStandardMaterial({ color: 0x0a0a0a });
    const matBrancoOlho = new THREE.MeshStandardMaterial({ color: 0xfffffe });
    const matSapato = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 });
    const matBoca = new THREE.MeshStandardMaterial({ color: isFemale ? 0xc94c6a : 0x8b4a3e });
    const matSobrancelha = new THREE.MeshStandardMaterial({ color: 0x2b2b2b });

    const torsoW = isFemale ? 0.44 : 0.54;
    const shoulderW = isFemale ? 0.24 : 0.34;
    const hipW = isFemale ? 0.52 : 0.48;

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
      const chestGeo = new THREE.SphereGeometry(0.13, 10, 10);
      const chestL = new THREE.Mesh(chestGeo, matCamisa); chestL.position.set(-0.12, 1.42, 0.16); chestL.scale.set(1,0.8,0.5);
      const chestR = new THREE.Mesh(chestGeo, matCamisa); chestR.position.set(0.12, 1.42, 0.16); chestR.scale.set(1,0.8,0.5);
      group.add(chestL, chestR);
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
    
    // Nariz
    const noseGeo = new THREE.SphereGeometry(0.025, 6, 6); noseGeo.scale(1,1.2,1.5);
    const noseMesh = new THREE.Mesh(noseGeo, matPele); noseMesh.position.set(0, -0.02, 0.27);

    // Cabelo diferenciado
    let hairMesh;
    if (isFemale) {
      const hairTopGeo = new THREE.SphereGeometry(0.31, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.88);
      hairMesh = new THREE.Mesh(hairTopGeo, matCabelo); hairMesh.position.set(0, 0.02, -0.02);
      const ponytailGeo = new THREE.CylinderGeometry(0.09, 0.12, 0.38, 8); ponytailGeo.translate(0, -0.19, 0);
      const ponytail = new THREE.Mesh(ponytailGeo, matCabelo); ponytail.position.set(0, -0.08, -0.28); ponytail.rotation.x = -0.3;
      headGroup.add(ponytail);
    } else {
      const hairGeo = new THREE.SphereGeometry(0.285, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.65);
      hairMesh = new THREE.Mesh(hairGeo, matCabelo); hairMesh.position.set(0, 0.07, 0);
    }

    const eyeWhiteGeo = new THREE.SphereGeometry(0.052, 10, 10);
    const eyePupilGeo = new THREE.SphereGeometry(0.022, 8, 8);
    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, matBrancoOlho); leftEyeWhite.position.set(-0.09, 0.06, 0.22);
    const leftEyePupil = new THREE.Mesh(eyePupilGeo, matOlho); leftEyePupil.position.set(-0.09, 0.06, 0.255);
    const rightEyeWhite = new THREE.Mesh(eyeWhiteGeo, matBrancoOlho); rightEyeWhite.position.set(0.09, 0.06, 0.22);
    const rightEyePupil = new THREE.Mesh(eyePupilGeo, matOlho); rightEyePupil.position.set(0.09, 0.06, 0.255);

    const browGeo = new THREE.BoxGeometry(0.09, 0.015, 0.01);
    const leftBrow = new THREE.Mesh(browGeo, matSobrancelha); leftBrow.position.set(-0.09, 0.12, 0.235); leftBrow.rotation.z = isFemale ? 0.12 : -0.08;
    const rightBrow = new THREE.Mesh(browGeo, matSobrancelha); rightBrow.position.set(0.09, 0.12, 0.235); rightBrow.rotation.z = isFemale ? -0.12 : 0.08;

    const mouthGeo = new THREE.BoxGeometry(isFemale ? 0.07 : 0.06, 0.018, 0.01);
    const mouthMesh = new THREE.Mesh(mouthGeo, matBoca); mouthMesh.position.set(0, -0.11, 0.25);

    headGroup.add(headMesh, hairMesh, noseMesh, leftEyeWhite, leftEyePupil, rightEyeWhite, rightEyePupil, leftBrow, rightBrow, mouthMesh);
    group.add(headGroup);

    const ringGeo = new THREE.RingGeometry(0.65, 0.82, 24); ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.0 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat); ringMesh.position.y = 0.03; group.add(ringMesh);

    group.userData = { leftLeg, rightLeg, leftArm, rightArm, headGroup, ringMat, walkPhase: 0, emotePhase: 0, isEmoting: false, isFemale };
    // Tenta carregar GLTF avatar em background (fallback já existe)
    if (this.gltfLoader && !this.gltfCache.has('avatar_loading')) {
      this.gltfCache.set('avatar_loading', true);
      this.gltfLoader.load('https://threejs.org/examples/models/gltf/Soldier.glb', (gltf)=>{
        const model = gltf.scene; model.scale.set(0.32,0.32,0.32);
        this.gltfCache.set('avatar', model);
      }, null, ()=>{});
    }
    return group;
  }

  animarPassosBoneco(meshGroup, estaAndando, delta) {
    const ud = meshGroup?.userData; if (!ud || !ud.leftLeg) return;
    if (ud.isEmoting) {
      ud.emotePhase += delta * 6;
      const wave = Math.sin(ud.emotePhase) * 1.2;
      if (ud.rightArm && ud.rightArm.rotation) { ud.rightArm.rotation.x = -1.8 + wave * 0.3; ud.rightArm.rotation.z = -0.3; }
      if (ud.emotePhase > Math.PI * 2) {
        ud.isEmoting = false;
        ud.emotePhase = 0;
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
    } else {
      if (ud.leftLeg.rotation) {
        ud.leftLeg.rotation.x *= 0.85;
        ud.rightLeg.rotation.x *= 0.85;
        ud.leftArm.rotation.x *= 0.85;
        ud.rightArm.rotation.x *= 0.85;
      }
    }
  }

  animarEmote(entidade) {
    if (!entidade?.mesh?.userData) return;
    entidade.mesh.userData.isEmoting = true;
    entidade.mesh.userData.emotePhase = 0;
  }

  // 🛡️ COLISÃO 100% FECHADA - SÓ PASSA PELA PORTA AUTOMÁTICA
  podeMoverPara(newX, newZ, oldX, oldZ) {
    const doorHalfWidth = 1.15;
    const wallThick = 0.42;
    const doorDepth = 1.1;

    for (const b of this.buildingsMeta) {
      const insideNew = newX > b.minX + 0.25 && newX < b.maxX - 0.25 && newZ > b.minZ + 0.25 && newZ < b.maxZ - 0.25;
      const insideOld = oldX > b.minX + 0.25 && oldX < b.maxX - 0.25 && oldZ > b.minZ + 0.25 && oldZ < b.maxZ - 0.25;

      if (insideNew === insideOld) {
        if (!insideNew) {
          const touchingBox = newX >= b.minX - wallThick && newX <= b.maxX + wallThick && newZ >= b.minZ - wallThick && newZ <= b.maxZ + wallThick;
          if (touchingBox) {
            const nearFrontDoor = Math.abs(newX - b.frontX) < 1.2 && Math.abs(newZ - b.doorZ) < doorHalfWidth;
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
    if (newX < -24 || newX > 24 || newZ < -98 || newZ > 18) return false;
    return true;
  }

  tocarSinoPorta() {
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = this.audioCtx;
      const playTone = (freq, start, dur, vol) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.frequency.value = freq; osc.type = 'sine';
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start); osc.stop(ctx.currentTime + start + dur);
      };
      playTone(880, 0, 0.18, 0.18); playTone(1320, 0.12, 0.28, 0.16);
    } catch (e) {}
  }

  // 🛋️ MOBILIÁRIO COMPLETO E CLICÁVEL DOS 12 EDIFÍCIOS (CORRIGIDO E VISÍVEL NA CENA)
  decorarInteriorEdificio3D(id, centerX, centerZ, col, bCfg) {
    const THREE = window.THREE;
    const cX = centerX + (col * 1.8);
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
        props.add(criarConjuntoMesa(centerX - (col * 1.6), centerZ - 2.5, 0x92400e, 0x27272a, 'Coffee Table'));
        props.add(criarConjuntoMesa(centerX - (col * 1.6), centerZ + 2.5, 0x92400e, 0x27272a, 'Coffee Table'));
        break;
      }
      case 'restaurant': {
        const counter = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.1, 3.8), new THREE.MeshLambertMaterial({ color: 0x881337 })), 'Chef Counter');
        counter.position.set(cX, 0.55, centerZ);
        props.add(counter);
        props.add(criarConjuntoMesa(centerX - (col * 1.2), centerZ - 2.6, 0xbe123c, 0x1e293b, 'Dining Table'));
        props.add(criarConjuntoMesa(centerX - (col * 1.2), centerZ + 2.6, 0xbe123c, 0x1e293b, 'Dining Table'));
        break;
      }
      case 'school': {
        const teacherDesk = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.85, 2.6), new THREE.MeshLambertMaterial({ color: 0x78350f })), 'Teacher Desk');
        teacherDesk.position.set(cX, 0.425, centerZ);
        props.add(teacherDesk);
        [-2.0, 2.0].forEach(dz => {
          const desk = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.72, 1.1), new THREE.MeshLambertMaterial({ color: 0xd97706 })), 'Student Desk');
          desk.position.set(centerX - (col * 1.4), 0.36, centerZ + dz);
          props.add(desk);
        });
        break;
      }
      case 'shopping': {
        const cashier = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.05, 3.2), new THREE.MeshLambertMaterial({ color: 0xfef08a })), 'Cash Register');
        cashier.position.set(cX, 0.525, centerZ);
        const rack = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.4, 2.2), new THREE.MeshLambertMaterial({ color: 0xec4899 })), 'Clothing Rack');
        rack.position.set(centerX - (col * 1.5), 0.7, centerZ - 2.3);
        const mirror = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.1, 1.3), new THREE.MeshLambertMaterial({ color: 0xbae6fd })), 'Fitting Room Mirror');
        mirror.position.set(centerX + (col * 4.5), 1.15, centerZ + 2.6);
        props.add(cashier, rack, mirror);
        break;
      }
      case 'home': {
        const kitchen = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.05, 3.2), new THREE.MeshLambertMaterial({ color: 0xe2e8f0 })), 'Kitchen Island');
        kitchen.position.set(cX, 0.525, centerZ - 1.4);
        const sofa = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.65, 2.6), new THREE.MeshLambertMaterial({ color: 0x4f46e5 })), 'Living Room Sofa');
        sofa.position.set(centerX - (col * 1.5), 0.325, centerZ + 1.8);
        const tv = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.1, 2.0), new THREE.MeshBasicMaterial({ color: 0x0ea5e9 })), 'Smart TV');
        tv.position.set(centerX + (col * 4.5), 1.7, centerZ + 1.8);
        props.add(kitchen, sofa, tv);
        break;
      }
      case 'cinema': {
        const screen = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.4, 6.2), new THREE.MeshBasicMaterial({ color: 0xe0f2fe })), 'Movie Screen');
        screen.position.set(centerX + (col * 4.6), 2.1, centerZ);
        const popcorn = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.4, 1.3), new THREE.MeshLambertMaterial({ color: 0xfacc15 })), 'Popcorn Machine');
        popcorn.position.set(cX, 0.7, centerZ + 2.5);
        const seat = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.75, 2.4), new THREE.MeshLambertMaterial({ color: 0xdc2626 })), 'Theater Seats');
        seat.position.set(centerX - (col * 1.5), 0.375, centerZ - 1.2);
        props.add(screen, popcorn, seat);
        break;
      }
      case 'taxi': {
        const booth = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.1, 2.6), new THREE.MeshLambertMaterial({ color: 0xfacc15 })), 'Taxi Dispatch Radio', { isTaxiRadio: true });
        booth.position.set(cX, 0.55, centerZ - 1.5);
        const taxiCar = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.85, 3.4), new THREE.MeshLambertMaterial({ color: 0xeab308 })), 'Yellow Taxi Cab', { isTaxiRadio: true });
        taxiCar.position.set(centerX - (col * 1.4), 0.425, centerZ + 1.6);
        props.add(booth, taxiCar);
        break;
      }
      case 'beach': {
        const tikiBar = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.1, 3.4), new THREE.MeshLambertMaterial({ color: 0x92400e })), 'Coconut Beach Bar');
        tikiBar.position.set(cX, 0.55, centerZ);
        const lounge = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.3, 0.85), new THREE.MeshLambertMaterial({ color: 0xf8fafc })), 'Beach Lounge Chair');
        lounge.position.set(centerX - (col * 1.6), 0.15, centerZ + 1.8);
        const umbrella = makeClickable(new THREE.Mesh(new THREE.ConeGeometry(1.4, 0.65, 10), new THREE.MeshLambertMaterial({ color: 0xf43f5e })), 'Beach Umbrella');
        umbrella.position.set(centerX - (col * 1.6), 2.2, centerZ + 1.8);
        props.add(tikiBar, lounge, umbrella);
        break;
      }
      case 'hotel': {
        const reception = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.15, 4.2), new THREE.MeshLambertMaterial({ color: 0x3b0764 })), 'Hotel Reception Desk');
        reception.position.set(cX, 0.575, centerZ);
        const luggage = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.75, 1.1), new THREE.MeshLambertMaterial({ color: 0xeab308 })), 'Luggage Cart');
        luggage.position.set(centerX - (col * 1.6), 0.375, centerZ + 2.4);
        props.add(reception, luggage);
        break;
      }
      case 'airport': {
        const desk = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.1, 3.4), new THREE.MeshLambertMaterial({ color: 0x0284c7 })), 'Check-in Counter');
        desk.position.set(cX, 0.55, centerZ - 1.0);
        const scanner = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.3, 1.6), new THREE.MeshLambertMaterial({ color: 0x38bdf8 })), 'Security Scanner');
        scanner.position.set(centerX - (col * 1.8), 1.15, centerZ + 2.2);
        props.add(desk, scanner);
        break;
      }
      case 'job': {
        const execDesk = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.85, 3.4), new THREE.MeshLambertMaterial({ color: 0x1e1b4b })), 'Interview Desk');
        execDesk.position.set(cX, 0.425, centerZ);
        const laptop = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.35, 0.55), new THREE.MeshLambertMaterial({ color: 0x38bdf8 })), 'Laptop Computer');
        laptop.position.set(cX, 1.0, centerZ);
        const bookshelf = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.3, 2.2), new THREE.MeshLambertMaterial({ color: 0x451a03 })), 'Career Bookshelf');
        bookshelf.position.set(centerX + (col * 4.4), 1.15, centerZ - 2.4);
        props.add(execDesk, laptop, bookshelf);
        break;
      }
      case 'hospital': {
        const docDesk = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.95, 2.8), new THREE.MeshLambertMaterial({ color: 0xf8fafc })), 'Doctor Desk');
        docDesk.position.set(cX, 0.475, centerZ - 1.2);
        const medBed = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.65, 1.1), new THREE.MeshLambertMaterial({ color: 0xbae6fd })), 'Examination Bed');
        medBed.position.set(centerX - (col * 1.4), 0.325, centerZ + 2.1);
        props.add(docDesk, medBed);
        break;
      }
    }

    // Corrige o bug: adiciona o grupo de interior diretamente à cena para nunca ficar invisível!
    this.scene.add(props);
    this.interiorGroups.set(id, props);
  }

  criarPostesAvenida3D() {
    const THREE = window.THREE;
    this.posteLights = [];
    for (let row = 0; row < 6; row++) {
      const zPos = -row * 16 + 6;
      [-5.8, 5.8].forEach(xPos => {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 4.2, 8), new THREE.MeshLambertMaterial({ color: 0x1e293b })); pole.position.set(xPos, 2.1, zPos);
        const lampHead = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 10), new THREE.MeshBasicMaterial({ color: 0xfef08a })); lampHead.position.set(xPos, 4.3, zPos);
        const light = new THREE.PointLight(0xfef08a, 0.0, 18); light.position.set(xPos, 4.3, zPos);
        this.exteriorGroup.add(pole, lampHead); this.scene.add(light); this.posteLights.push({ light, lampHead });
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
      const r = 85 + Math.random() * 30; const theta = Math.random() * Math.PI * 2; const phi = Math.random() * Math.PI * 0.6 + 0.1;
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
      cloud.position.set((Math.random() - 0.5) * 90, 22 + Math.random() * 10, (Math.random() - 0.5) * 100 - 35);
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
      this.scene.background = new THREE.Color(0x87ceeb); this.scene.fog = new THREE.FogExp2(0x87ceeb, 0.007);
      if (this.ambientLight) { this.ambientLight.color.setHex(0xffffff); this.ambientLight.intensity = 0.85; }
      if (this.dirLight) { this.dirLight.color.setHex(0xffffff); this.dirLight.intensity = 0.9; this.dirLight.position.set(25, 55, 20); }
      if (this.sunMesh) { this.sunMesh.visible = true; this.sunMesh.position.set(20, 45, -40); }
      if (this.moonMesh) this.moonMesh.visible = false;
      if (this.starsGroup) this.starsGroup.visible = false;
      if (this.cloudsGroup) this.cloudsGroup.visible = true;
      this.posteLights.forEach(p => { p.light.intensity = 0; p.lampHead.material.color.setHex(0x334155); });
    } else if (mode === 'sunset') {
      this.scene.background = new THREE.Color(0xff8c42); this.scene.fog = new THREE.FogExp2(0xff8c42, 0.010);
      if (this.ambientLight) { this.ambientLight.color.setHex(0xffb26b); this.ambientLight.intensity = 0.65; }
      if (this.dirLight) { this.dirLight.color.setHex(0xff9a4d); this.dirLight.intensity = 0.55; this.dirLight.position.set(35, 8, -15); }
      if (this.sunMesh) { this.sunMesh.visible = true; this.sunMesh.position.set(55, 9, -25); this.sunMesh.material.color.setHex(0xff6b35); }
      if (this.moonMesh) this.moonMesh.visible = false;
      if (this.starsGroup) this.starsGroup.visible = false;
      if (this.cloudsGroup) this.cloudsGroup.visible = true;
      this.posteLights.forEach(p => { p.light.intensity = 0.6; p.lampHead.material.color.setHex(0xfef08a); });
    } else {
      this.scene.background = new THREE.Color(0x070b1a); this.scene.fog = new THREE.FogExp2(0x070b1a, 0.012);
      if (this.ambientLight) { this.ambientLight.color.setHex(0x8b9dc3); this.ambientLight.intensity = 0.45; }
      if (this.dirLight) { this.dirLight.color.setHex(0x8b9dc3); this.dirLight.intensity = 0.25; this.dirLight.position.set(-20, 35, 15); }
      if (this.sunMesh) this.sunMesh.visible = false;
      if (this.moonMesh) { this.moonMesh.visible = true; this.moonMesh.position.set(-18, 32, -35); }
      if (this.starsGroup) {
        this.starsGroup.visible = true;
        this.starsGroup.children.forEach(s => { s.userData.twinkle += 0.04; s.material.opacity = 0.6 + Math.sin(s.userData.twinkle) * 0.4; s.material.transparent = true; });
      }
      if (this.cloudsGroup) this.cloudsGroup.visible = true;
      this.posteLights.forEach(p => { p.light.intensity = 1.4; p.lampHead.material.color.setHex(0xfef08a); });
    }
  }

  gerarTexturaParalelepipedo() {
    const THREE = window.THREE;
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#2a2f3a'; ctx.fillRect(0, 0, 512, 512);
    const cores = ['#94a3b8', '#9aa8bd', '#a1b0c5', '#b0becf', '#c2d0e2', '#cbd5e1'];
    const blockW = 64, blockH = 32;
    for (let y = 0; y < 512; y += blockH) {
      const offset = (Math.floor(y / blockH) % 2 === 0) ? 0 : blockW / 2;
      for (let x = -blockW; x < 512 + blockW; x += blockW) {
        ctx.fillStyle = cores[Math.floor(Math.random() * cores.length)];
        const px = x + offset + 2; const py = y + 2;
        ctx.fillRect(px, py, blockW - 4, blockH - 4);
        ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(px, py + blockH - 8, blockW - 4, 4);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 18); tex.anisotropy = 4;
    return tex;
  }

  criarAvenidaRealista() {
    const THREE = window.THREE;
    const paralelepipedoTex = this.gerarTexturaParalelepipedo();
    const sidewalkMat = new THREE.MeshStandardMaterial({ map: paralelepipedoTex, roughness: 0.92, metalness: 0.04 });
    const leftSidewalk = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 170), sidewalkMat); leftSidewalk.rotation.x = -Math.PI / 2; leftSidewalk.position.set(-9.1, 0.08, -36); leftSidewalk.receiveShadow = true;
    const rightSidewalk = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 170), sidewalkMat); rightSidewalk.rotation.x = -Math.PI / 2; rightSidewalk.position.set(9.1, 0.08, -36); rightSidewalk.receiveShadow = true;
    this.exteriorGroup.add(leftSidewalk, rightSidewalk);

    const curbMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 });
    const curbMatYellow = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.6 });
    const leftCurb = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 170), curbMat); leftCurb.position.set(-6.45, 0.11, -36);
    const rightCurb = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 170), curbMat); rightCurb.position.set(6.45, 0.11, -36);
    const leftCurbOut = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 170), curbMatYellow); leftCurbOut.position.set(-11.65, 0.11, -36);
    const rightCurbOut = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 170), curbMatYellow); rightCurbOut.position.set(11.65, 0.11, -36);
    this.exteriorGroup.add(leftCurb, rightCurb, leftCurbOut, rightCurbOut);

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

 criarCenarioFundoMontanhasArvores() {
    const THREE = window.THREE;
    const fundoGroup = new THREE.Group();
    const montanhaCores = [0x334155, 0x475569, 0x1e293b, 0x3f4a5a];
    for (let i = -4; i <= 4; i++) {
      const h = 18 + Math.random() * 14 + Math.abs(i) * 1.5;
      const geo = new THREE.ConeGeometry(10 + Math.random() * 6, h, 7);
      const mat = new THREE.MeshStandardMaterial({ color: montanhaCores[Math.abs(i) % montanhaCores.length], roughness: 0.95, flatShading: true });
      const mont = new THREE.Mesh(geo, mat);
      mont.position.set(i * 22 + (Math.random() - 0.5) * 6, h / 2 - 2, -118 - Math.random() * 12);
      mont.rotation.y = (Math.random() - 0.5) * 0.4;
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

    for (let i = 0; i < 28; i++) {
      const x = (Math.random() - 0.5) * 90;
      const z = -88 - Math.random() * 38;
      if (Math.abs(x) < 13) continue;
      criarArvore(x, z, 0.9 + Math.random() * 0.7);
    }

    for (let z = -80; z < 10; z += 8) {
      criarArvore(-18.5 + (Math.random() - 0.5) * 0.8, z, 1.1);
      criarArvore(18.5 + (Math.random() - 0.5) * 0.8, z, 1.1);
    }
    this.exteriorGroup.add(fundoGroup);
  }

  criarTransitoInteligente() {
    const THREE = window.THREE;
    this.cars = [];
    const carColors = [0xef4444, 0x3b82f6, 0xf8fafc, 0x1f2937];
    for (let i = 0; i < 6; i++) {
      const carGroup = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 3.6), new THREE.MeshLambertMaterial({ color: carColors[i % carColors.length] }));
      body.position.y = 0.55;
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.55, 1.8), new THREE.MeshLambertMaterial({ color: 0x0f172a }));
      cabin.position.set(0, 1.05, -0.1);
      carGroup.add(body, cabin);

      const lane = i % 2 === 0 ? 1.6 : -1.6;
      const dir = i % 2 === 0 ? -1 : 1;
      carGroup.position.set(lane, 0, -80 + i * 18);
      carGroup.rotation.y = dir === 1 ? 0 : Math.PI;
      carGroup.userData = { lane, dir, speed: 3.5 + Math.random() * 1.5, stopped: false };
      this.exteriorGroup.add(carGroup);
      this.cars.push(carGroup);
    }
  }

  criarPedestres() {
    this.pedestrians = [];
    const phrases = [
      "Beautiful night, isn't it?",
      "Lovely day today!",
      "Hi there! Nice weather!",
      "Good evening!",
      "Hey! How's it going?"
    ];
    for (let i = 0; i < 8; i++) {
      const isLeft = i % 2 === 0;
      const isFemalePed = i % 3 === 0;
      const pedMesh = this.criarBonecoHumano3D(isLeft ? 0xf59e0b : 0x38bdf8, 0x1e293b, 0xfde68a, isFemalePed);
      const x = isLeft ? -8.5 + (Math.random() - 0.5) : 8.5 + (Math.random() - 0.5);
      const z = -90 + Math.random() * 100;
      pedMesh.position.set(x, 0, z);
      pedMesh.rotation.y = Math.random() > 0.5 ? 0 : Math.PI;
      const labelEl = this.criarEtiquetaHTML('Pedestrian', 'CITIZEN', '#facc15');
      this.exteriorGroup.add(pedMesh);
      this.pedestrians.push({
        mesh: pedMesh,
        labelEl,
        x,
        z,
        dir: pedMesh.rotation.y === 0 ? 1 : -1,
        speed: 1.2 + Math.random(),
        bubbleText: phrases[i % phrases.length],
        lastGreet: 0,
        isLeft
      });
    }
  }

  criarOutdoorsInteligentes() {
    const THREE = window.THREE;
    this.outdoors = [];
    const expressions = [
      "Expression: 'Break a leg!'",
      "Word: Serendipity",
      this.topLeaderText
    ];
    for (let row = 0; row < 3; row++) {
      const zPos = -row * 32 - 8;
      [-11.5, 11.5].forEach((xPos, idx) => {
        const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, 512, 256);
        ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 6; ctx.strokeRect(4, 4, 504, 248);
        ctx.fillStyle = '#a78bfa'; ctx.font = 'bold 25px Inter, sans-serif';
        ctx.fillText(expressions[(row + idx) % expressions.length], 22, 65);
        ctx.fillStyle = '#e2e8f0'; ctx.font = '18px Inter, sans-serif';
        ctx.fillText('Walk into any shop to practice English!', 22, 125);
        const tex = new THREE.CanvasTexture(canvas);
        const board = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.6), new THREE.MeshBasicMaterial({ map: tex }));
        board.position.set(xPos, 2.2, zPos);
        board.rotation.y = xPos < 0 ? Math.PI / 2.5 : -Math.PI / 2.5;
        this.exteriorGroup.add(board);
        this.outdoors.push({ mesh: board, canvas, ctx, tex, idx: (row + idx) % expressions.length });
      });
    }
  }

  // ===== AS 14 MARAVILHAS INTERATIVAS (EXECUTADAS 1 ÚNICA VEZ FORA DO LOOP) =====

  criarAudioZones3D() {
    this.audioZones = [];
    const zoneSounds = {
      coffee: { freq: 220, type: 'espresso' },
      restaurant: { freq: 180, type: 'kitchen' },
      airport: { freq: 300, type: 'announcement' },
      beach: { freq: 120, type: 'waves' },
      cinema: { freq: 80, type: 'bass' }
    };
    this.buildingsMeta.forEach(b => {
      const cfg = zoneSounds[b.id];
      if (!cfg) return;
      try {
        if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const panner = this.audioCtx.createPanner();
        panner.panningModel = 'HRTF'; panner.distanceModel = 'inverse';
        panner.refDistance = 4; panner.maxDistance = 18; panner.rolloffFactor = 1.2;
        panner.positionX.value = b.centerX; panner.positionY.value = 1.5; panner.positionZ.value = b.centerZ;
        const gain = this.audioCtx.createGain(); gain.gain.value = 0;
        panner.connect(gain); gain.connect(this.audioCtx.destination);
        this.audioZones.push({ id: b.id, panner, gain, cfg });
      } catch (e) {}
    });
  }

  atualizarAudioZones() {
    if (!this.localPlayer || !this.audioZones.length || !this.audioCtx) return;
    this.audioZones.forEach(zone => {
      const b = this.buildingsMeta.find(x => x.id === zone.id);
      if (!b) return;
      const dist = Math.hypot(b.centerX - this.localPlayer.x, b.centerZ - this.localPlayer.z);
      const inside = this.currentZoneId === zone.id;
      let targetGain = 0;
      if (inside) targetGain = 0.15;
      else if (dist < 12) targetGain = (1 - dist / 12) * 0.06;
      try {
        zone.gain.gain.linearRampToValueAtTime(targetGain, this.audioCtx.currentTime + 0.4);
      } catch (e) {}
    });
  }

 soltarPegada() {
    const THREE = window.THREE;
    if (Date.now() - this.lastFootprint < 380) return;
    this.lastFootprint = Date.now();
    
    const peg = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 0.42),
      new THREE.MeshBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.28 })
    );
    peg.rotation.x = -Math.PI / 2;
    peg.position.set(this.localPlayer.x + (Math.random() - 0.5) * 0.2, 0.03, this.localPlayer.z + (Math.random() - 0.5) * 0.2);
    peg.rotation.z = this.localPlayer.rotY;
    this.scene.add(peg);
    this.footprints.push({ mesh: peg, born: Date.now() });

    // 🔊 Som de passo procedural ativado!
    try {
      if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator(); 
      const g = ctx.createGain();
      osc.frequency.value = this.currentZoneId === 'street' ? 170 : 240; 
      osc.type = 'triangle';
      g.gain.setValueAtTime(0.14, ctx.currentTime); 
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
      osc.connect(g); 
      g.connect(ctx.destination); 
      osc.start(); 
      osc.stop(ctx.currentTime + 0.09);
    } catch (e) {}
  }

  criarVitrinesVivas() {
    this.vitrines = [];
    ['shopping', 'home'].forEach(id => {
      const b = this.buildingsMeta.find(x => x.id === id);
      if (!b) return;
      const vitrineGroup = new THREE.Group();
      for (let i = 0; i < 2; i++) {
        const mannequin = this.criarBonecoHumano3D(i === 0 ? 0xec4899 : 0x3b82f6, 0x0f172a, 0xfde68a);
        mannequin.position.set(b.frontX + (b.col * 0.45), 0, b.doorZ + (i === 0 ? -2.2 : 2.2));
        mannequin.scale.set(0.9, 0.9, 0.9);
        mannequin.rotation.y = b.col === -1 ? Math.PI / 2 : -Math.PI / 2;
        vitrineGroup.add(mannequin);
        this.vitrines.push({ mesh: mannequin });
      }
      this.exteriorGroup.add(vitrineGroup);
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
    board.position.set(b.centerX + (b.col * 4.55), 2.0, b.centerZ);
    board.rotation.y = b.col === -1 ? -Math.PI / 2 : Math.PI / 2;
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
    this.blackboard = board;
  }

  criarCardapioFalado() {
    const THREE = window.THREE;
    const b = this.buildingsMeta.find(x => x.id === 'restaurant');
    if (!b) return;
    this.menuStands = [];
    const items = [
      'Grilled Salmon with Vegetables - $18',
      'Classic Cheeseburger & Fries - $12',
      'Italian Homemade Pasta - $15'
    ];
    for (let i = 0; i < 3; i++) {
      const standCanvas = document.createElement('canvas'); standCanvas.width = 256; standCanvas.height = 320;
      const sctx = standCanvas.getContext('2d');
      sctx.fillStyle = '#fffbeb'; sctx.fillRect(0, 0, 256, 320);
      sctx.strokeStyle = '#be123c'; sctx.lineWidth = 8; sctx.strokeRect(4, 4, 248, 312);
      sctx.fillStyle = '#881337'; sctx.font = 'bold 24px Inter, sans-serif'; sctx.fillText('MENU', 85, 45);
      sctx.fillStyle = '#1e293b'; sctx.font = 'bold 16px Inter, sans-serif';
      sctx.fillText(items[i].split(' - ')[0], 18, 130);
      sctx.fillStyle = '#be123c'; sctx.font = 'bold 22px Inter, sans-serif';
      sctx.fillText(items[i].split(' - ')[1], 90, 195);
      const tex = new THREE.CanvasTexture(standCanvas);
      const stand = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.8), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
      stand.position.set(b.centerX - (b.col * 0.5), 1.05, b.centerZ - 1.5 + i * 1.5);
      stand.userData = { clickable: true, isMenuStand: true, englishName: `I would like to order the ${items[i].split(' - ')[0]}, please.` };
      this.clickableObjects.push(stand);
      const grp = this.interiorGroups.get('restaurant');
      if (grp) grp.add(stand); else this.scene.add(stand);
      this.menuStands.push(stand);
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
    board.position.set(b.centerX + (b.col * 4.55), 2.1, b.centerZ);
    board.rotation.y = b.col === -1 ? -Math.PI / 2 : Math.PI / 2;
    board.userData = { clickable: true, englishName: 'Attention passengers: Flight to London is now boarding at Gate B14.' };
    this.clickableObjects.push(board);
    const grp = this.interiorGroups.get('airport');
    if (grp) grp.add(board); else this.scene.add(board);
    this.flightBoard = { mesh: board, texture: tex };
    updateBoard();
    this.flightBoardInterval = setInterval(updateBoard, 20000);
  }

  tocarRadioTaxi() {
    const facts = [
      "Did you know? The word Taxi comes from taximeter!",
      "Fun fact: In London, black cab drivers memorize 25,000 streets!",
      "Useful phrase: Could you drop me off at the airport, please?"
    ];
    const fact = facts[Math.floor(Math.random() * facts.length)];
    this.mostrarBalaoNoBoneco(this.localPlayer, "📻 " + fact, 8000);
    this.falarTextoNPC(fact, 'taxi');
  }

  criarSistemaChuvaNeblina() {
    const THREE = window.THREE;
    const rainGeo = new THREE.BufferGeometry();
    const rainCount = 600;
    const pos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 120;
      pos[i * 3 + 1] = Math.random() * 50 + 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 120 - 35;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const rainMat = new THREE.PointsMaterial({ color: 0x93c5fd, size: 0.12, transparent: true, opacity: 0.0 });
    this.rainGroup = new THREE.Points(rainGeo, rainMat);
    this.exteriorGroup.add(this.rainGroup);
  }

  atualizarChuvaNeblina(delta) {
    if (!this.rainGroup || this.modoInterior) return;
    const hour = new Date().getHours();
    const shouldRain = hour % 4 === 0;
    const targetRain = shouldRain ? 0.45 : 0.0;
    this.rainGroup.material.opacity += (targetRain - this.rainGroup.material.opacity) * delta * 0.8;
    if (shouldRain) {
      const pos = this.rainGroup.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) - delta * 18;
        if (y < 0) y = 50 + Math.random() * 10;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }
  }

  criarNightMarket() {
    const THREE = window.THREE;
    this.nightMarketGroup = new THREE.Group();
    const items = ['Tacos & Burritos', 'Fresh Sushi', 'Sweet Crepes', 'Tropical Juice'];
    for (let i = 0; i < 4; i++) {
      const stall = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.95, 0.9), new THREE.MeshLambertMaterial({ color: 0xf59e0b }));
      stall.position.set(-8.8, 0.475, -10 - i * 16);
      stall.userData = { clickable: true, englishName: `Night Market Stall: ${items[i]}` };
      this.clickableObjects.push(stall);
      this.nightMarketGroup.add(stall);
    }
    this.exteriorGroup.add(this.nightMarketGroup);
  }

  atualizarNightMarket() {
    if (!this.nightMarketGroup) return;
    const hour = new Date().getHours();
    this.nightMarketGroup.visible = !this.modoInterior && (hour >= 18 || hour < 6);
  }

  criarMusicoDeRua() {
    const THREE = window.THREE;
    const mus = this.criarBonecoHumano3D(0xf97316, 0x1e293b, 0xfde68a);
    mus.position.set(-8.5, 0, -24);
    mus.rotation.y = Math.PI / 3;
    const guitar = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.6), new THREE.MeshLambertMaterial({ color: 0x92400e }));
    guitar.position.set(0, 1.2, 0.25);
    guitar.userData = { clickable: true, englishName: "Street Musician: That song is lit! Lit means amazing!" };
    this.clickableObjects.push(guitar);
    mus.add(guitar);
    const label = this.criarEtiquetaHTML('Street Musician 🎸', 'SLANG COACH', '#f59e0b');
    this.exteriorGroup.add(mus);
    this.musician = {
      mesh: mus,
      labelEl: label,
      x: -8.5,
      z: -24,
      lastTeach: 0,
      slangs: [
        "That song is lit! ('Lit' = amazing!)",
        "This beat is sick! ('Sick' = super cool!)",
        "I'm hyped for English! ('Hyped' = very excited!)"
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

  criarStickyNotesParede() {
    const b = this.buildingsMeta.find(x => x.id === 'coffee');
    if (!b) return;
    this.renderizarStickyNotesNoCoffee();

    const THREE = window.THREE;
    const addArea = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 1.8),
      new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.18, side: THREE.DoubleSide })
    );
    addArea.position.set(b.centerX, 1.6, b.centerZ - 4.75);
    addArea.userData = { clickable: true, isStickyWall: true, englishName: 'Sticky Note Wall' };
    this.clickableObjects.push(addArea);
    const grp = this.interiorGroups.get('coffee');
    if (grp) grp.add(addArea); else this.scene.add(addArea);
  }

  renderizarStickyNotesNoCoffee() {
    const THREE = window.THREE;
    const b = this.buildingsMeta.find(x => x.id === 'coffee');
    if (!b) return;
    const grp = this.interiorGroups.get('coffee') || this.scene;
    this.stickyNotes.forEach(n => grp.remove(n));
    this.stickyNotes = [];

    const saved = JSON.parse(localStorage.getItem('es_sticky_notes') || '["Hello from Bahia!","Coffee first, English second!"]');
    saved.slice(0, 8).forEach((txt, i) => {
      const c = document.createElement('canvas'); c.width = 256; c.height = 256;
      const ctx = c.getContext('2d');
      ctx.fillStyle = i % 2 === 0 ? '#fef08a' : '#fed7aa';
      ctx.fillRect(0, 0, 256, 256);
      ctx.fillStyle = '#422006'; ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillText(String(txt).slice(0, 20), 14, 70);
      if (txt.length > 20) ctx.fillText(String(txt).slice(20, 40), 14, 105);
      const tex = new THREE.CanvasTexture(c);
      const note = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
      note.position.set(b.centerX - 0.9 + (i % 4) * 0.6, 1.9 - Math.floor(i / 4) * 0.65, b.centerZ - 4.72);
      grp.add(note);
      this.stickyNotes.push(note);
    });
  }

  adicionarStickyNote(texto, emitirRede = true) {
    const limpo = String(texto || '').trim();
    if (!limpo) return;
    const arr = JSON.parse(localStorage.getItem('es_sticky_notes') || '[]');
    if (!arr.includes(limpo)) {
      arr.unshift(limpo);
      localStorage.setItem('es_sticky_notes', JSON.stringify(arr.slice(0, 16)));
    }
    this.renderizarStickyNotesNoCoffee();
    if (emitirRede && this.localPlayer) {
      this.parentManager?.registarMissaoConcluida('coffee', 'sticky_note', 20);
      if (window.Workspace?.mostrarAviso) window.Workspace.mostrarAviso('📝 Post-it colado na parede do Coffee Shop (+20 XP)!', 'success');
      fetch('/api/workspace/english-spaces/world/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: this.localPlayer.userId,
          nome: this.localPlayer.nome,
          role: this.localPlayer.role,
          text: `[STICKY_NOTE] ${limpo}`,
          x: this.localPlayer.x,
          z: this.localPlayer.z,
          spaceId: 'coffee'
        })
      }).catch(() => {});
    }
  }

  criarFantasmaLider() {
    this.ghostPath = [];
    for (let i = 0; i < 60; i++) {
      this.ghostPath.push({ x: Math.sin(i * 0.12) * 3.5, z: -80 + i * 1.5 });
    }
    const ghostMesh = this.criarBonecoHumano3D(0x10b981, 0x064e3b, 0xd1fae5);
    ghostMesh.traverse(o => {
      if (o.isMesh) {
        o.material = o.material.clone();
        o.material.transparent = true;
        o.material.opacity = 0.35;
      }
    });
    ghostMesh.position.set(this.ghostPath[0].x, 0, this.ghostPath[0].z);
    const label = this.criarEtiquetaHTML('Top 1 Leader 👻', 'LEADER', '#10b981');
    this.exteriorGroup.add(ghostMesh);
    this.ghost = { mesh: ghostMesh, labelEl: label };
  }

  atualizarFantasma(delta) {
    if (!this.ghost || !this.ghostPath.length || this.modoInterior) return;
    this.ghostIdx = (this.ghostIdx + delta * 0.7) % this.ghostPath.length;
    const idx = Math.floor(this.ghostIdx);
    const p = this.ghostPath[idx];
    this.ghost.mesh.position.x += (p.x - this.ghost.mesh.position.x) * 0.08;
    this.ghost.mesh.position.z += (p.z - this.ghost.mesh.position.z) * 0.08;
    this.animarPassosBoneco(this.ghost.mesh, true, delta);
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
    camModel.position.set(b.centerX - (b.col * 1.2), 1.0, b.centerZ - 2.2);
    camModel.userData = { clickable: true, isPolaroidCam: true, englishName: 'Polaroid Camera' };
    this.clickableObjects.push(camModel);
    const grp = this.interiorGroups.get('beach');
    if (grp) grp.add(camModel); else this.scene.add(camModel);
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
      if (window.Workspace?.mostrarAviso) {
        window.Workspace.mostrarAviso('📸 Polaroid guardada! Diga: "I love the beach!" (+25 XP)', 'success');
      }
      this.parentManager?.registarMissaoConcluida('beach', 'polaroid', 25);
      this.falarTextoNPC('Cheese! Great photo at the beach!', 'beach');
    } catch (e) {}
  }


  // 🐾 ANIMAIS NA RUA - CACHORRO, GATO E PÁSSAROS
  criarAnimaisRua() {
    const THREE = window.THREE;
    this.animais.caes = [];
    this.animais.gatos = [];
    this.animais.passaros = [];
    // 2 cachorros
    for(let i=0;i<2;i++){
      const dog = this.criarCachorro3D();
      dog.position.set(-9 + i*5.5, 0, -12 - i*7);
      dog.rotation.y = Math.random()*Math.PI;
      this.exteriorGroup.add(dog);
      this.animais.caes.push({ mesh: dog, dir: Math.random()>0.5?1:-1, speed: 0.9+Math.random()*0.6, x: dog.position.x, z: dog.position.z, walkPhase: Math.random()*Math.PI });
    }
    // 2 gatos
    for(let i=0;i<2;i++){
      const cat = this.criarGato3D();
      cat.position.set(8.8 + (Math.random()-0.5)*1.5, 0, -22 - i*11);
      this.exteriorGroup.add(cat);
      this.animais.gatos.push({ mesh: cat, dir: 1, speed: 0.6+Math.random()*0.4, x: cat.position.x, z: cat.position.z, walkPhase: Math.random()*Math.PI, idleTime: 0 });
    }
    // Pássaros no céu
    this.animais.passarosGroup = new THREE.Group();
    for(let i=0;i<9;i++){
      const bird = this.criarPassaro3D();
      bird.position.set((Math.random()-0.5)*70, 14+Math.random()*8, -35 + (Math.random()-0.5)*80);
      bird.userData = { speed: 2.5+Math.random()*2, angle: Math.random()*Math.PI*2, radius: 8+Math.random()*12 };
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
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.65,0.32,0.42), bodyMat); body.position.set(0,0.28,0);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22,10,10), headMat); head.position.set(0.42,0.42,0);
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.18,0.12,0.16), new THREE.MeshStandardMaterial({ color: 0x2b1d12 })); snout.position.set(0.62,0.38,0);
    const ear1 = new THREE.Mesh(new THREE.BoxGeometry(0.08,0.14,0.02), headMat); ear1.position.set(0.38,0.56,0.12); ear1.rotation.z=-0.3;
    const ear2 = new THREE.Mesh(new THREE.BoxGeometry(0.08,0.14,0.02), headMat); ear2.position.set(0.38,0.56,-0.12); ear2.rotation.z=-0.3;
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.02,0.28,6), bodyMat); tail.position.set(-0.38,0.38,0); tail.rotation.z=0.8;
    group.add(body,head,snout,ear1,ear2,tail);
    for(let i=0;i<4;i++){
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.04,0.28,6), bodyMat); leg.position.set((i<2?0.22:-0.22),0.14,(i%2===0?0.14:-0.14)); group.add(leg);
    }
    group.userData = { isDog: true };
    return group;
  }

  criarGato3D() {
    const THREE = window.THREE;
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.7 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.48,0.22,0.32), bodyMat); body.position.set(0,0.22,0);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18,10,10), bodyMat); head.position.set(0.32,0.38,0);
    const earGeo = new THREE.ConeGeometry(0.06,0.12,4);
    const ear1 = new THREE.Mesh(earGeo, bodyMat); ear1.position.set(0.32,0.54,0.08);
    const ear2 = new THREE.Mesh(earGeo, bodyMat); ear2.position.set(0.32,0.54,-0.08);
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.015,0.42,6), bodyMat); tail.position.set(-0.32,0.32,0); tail.rotation.z=1.1;
    group.add(body,head,ear1,ear2,tail);
    return group;
  }

  criarPassaro3D() {
    const THREE = window.THREE;
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.09,6,6), new THREE.MeshStandardMaterial({ color: 0x1f2937 }));
    const wingGeo = new THREE.PlaneGeometry(0.22,0.06);
    const wingMat = new THREE.MeshBasicMaterial({ color: 0x111827, side: THREE.DoubleSide });
    const wingL = new THREE.Mesh(wingGeo, wingMat); wingL.position.set(0,0.04,0.12); wingL.rotation.z=0.2;
    const wingR = new THREE.Mesh(wingGeo, wingMat); wingR.position.set(0,0.04,-0.12); wingR.rotation.z=-0.2;
    group.add(body,wingL,wingR);
    group.userData.wingL = wingL; group.userData.wingR = wingR;
    return group;
  }

  atualizarAnimais(delta) {
    if (this.modoInterior) return;
    const THREE = window.THREE;
    // Cães andando e abanando rabo
    this.animais.caes.forEach(dogData=>{
      dogData.walkPhase += delta*6;
      dogData.mesh.position.z += dogData.dir * dogData.speed * delta * 0.5;
      if (dogData.mesh.position.z > 8) dogData.mesh.position.z = -82;
      if (dogData.mesh.position.z < -82) dogData.mesh.position.z = 8;
      dogData.mesh.position.x = dogData.x + Math.sin(dogData.walkPhase*0.5)*0.6;
      // abanar rabo
      const tail = dogData.mesh.children.find(c=>c.geometry && c.geometry.type==='CylinderGeometry' && c.position.x< -0.3);
      if (tail) tail.rotation.z = 0.8 + Math.sin(dogData.walkPhase*2)*0.6;
    });
    // Gatos mais parados, às vezes deitam
    this.animais.gatos.forEach(catData=>{
      catData.idleTime += delta;
      if (catData.idleTime > 4 + Math.random()*3) {
        catData.dir *= -1; catData.idleTime = 0;
        catData.mesh.rotation.y += Math.PI;
      }
      if (catData.idleTime < 2) {
        catData.mesh.position.z += catData.dir * catData.speed * delta * 0.35;
      }
    });
    // Pássaros voando em círculos
    this.animais.passaros.forEach(bird=>{
      bird.userData.angle += delta * 0.6 * bird.userData.speed * 0.15;
      bird.position.x += Math.cos(bird.userData.angle) * delta * bird.userData.speed;
      bird.position.z += Math.sin(bird.userData.angle) * delta * bird.userData.speed;
      bird.rotation.y = bird.userData.angle;
      if (bird.userData.wingL) {
        bird.userData.wingL.rotation.z = 0.2 + Math.sin(Date.now()*0.02 + bird.position.x)*0.7;
        bird.userData.wingR.rotation.z = -0.2 - Math.sin(Date.now()*0.02 + bird.position.x)*0.7;
      }
    });
  }

  // GLTF - COFFEE COM FALLBACK
  tentarCarregarGLTFCoffee() {
    if (!this.gltfLoader) return;
    const bMeta = this.buildingsMeta.find(b=>b.id==='coffee');
    if (!bMeta) return;
    const interiorGrp = this.interiorGroups.get('coffee');
    if (!interiorGrp) return;
    // Tenta carregar /models/coffee.glb - se falhar, mantém Box temático
    this.gltfLoader.load('/models/coffee.glb', (gltf)=>{
      const model = gltf.scene;
      model.scale.set(1.2,1.2,1.2);
      model.position.set(bMeta.centerX,0,bMeta.centerZ);
      model.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; }});
      interiorGrp.add(model);
      console.log('☕ GLTF Coffee carregado com sucesso');
      // Esconde os Boxes antigos para não duplicar
      interiorGrp.children.forEach(child=>{
        if (child !== model && child.isMesh && child.geometry && child.geometry.type==='BoxGeometry') {
          child.visible = false;
        }
      });
    }, null, (err)=>{
      console.log('☕ GLTF Coffee não encontrado, usando fallback Box (normal)');
    });
  }

    criarLetreiro3D(texto, pos, col, isMastered = false) {
    const THREE = window.THREE;
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const corBorda = isMastered ? '#10b981' : '#8b5cf6';
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#1e293b'); grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 1024, 256);
    ctx.strokeStyle = corBorda; ctx.lineWidth = 10; ctx.strokeRect(5, 5, 1014, 246);
    ctx.fillStyle = '#f8fafc'; ctx.font = '900 74px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
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
    placaGroup.rotation.y = col === -1 ? Math.PI / 2 : -Math.PI / 2;
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

    this.camera = new THREE.PerspectiveCamera(58, w / h, 0.1, 300);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    viewport.insertBefore(this.renderer.domElement, viewport.firstChild);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 200), new THREE.MeshLambertMaterial({ color: 0x0f172a }));
    ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0, -35); ground.receiveShadow = true;
    this.exteriorGroup.add(ground);

    const road = new THREE.Mesh(new THREE.PlaneGeometry(10, 150), new THREE.MeshLambertMaterial({ color: 0x1e293b }));
    road.rotation.x = -Math.PI / 2; road.position.set(0, 0.01, -35);
    this.exteriorGroup.add(road);

    this.criarCeuRealista();
    this.criarAvenidaRealista();
    this.criarPostesAvenida3D();
    this.criarTransitoInteligente();
    this.criarPedestres();
    this.criarOutdoorsInteligentes();
    this.atualizarCicloDiaNoite();
    this.dayNightInterval = setInterval(() => this.atualizarCicloDiaNoite(), 60000);
    this.criarCenarioFundoMontanhasArvores();
    // GLTF Coffee será carregado após buildingsMeta existir

    this.buildingsMeta = [];
    this.buildingMeshes.clear();
    this.npcs3D.clear();
    this.clickableObjects = [];
    this.doors.clear();
    this.interiorGroups.clear();

    const selectTeleport = document.getElementById('es-city-teleport');
    const registry = this.parentManager.getSpacesRegistry ? this.parentManager.getSpacesRegistry() : window.Workspace.EnglishSpaces.getSpacesRegistry();
    const visitados = this.parentManager?.progressData?.visited || [];

    CITY_BUILDINGS_LAYOUT.forEach((bCfg) => {
      const spInfo = registry[bCfg.id];
      if (!spInfo) return;

      const centerX = bCfg.col * 16;
      const centerZ = -bCfg.row * 16;
      const bw = 10; const bd = 10; const bh = 4.4;
      const frontX = centerX - bCfg.col * (bw / 2);
      const doorHalfW = 1.05;

      const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(bw, bd), new THREE.MeshStandardMaterial({ color: bCfg.color, roughness: 0.85, metalness: 0.08 }));
      floorMesh.rotation.x = -Math.PI / 2; floorMesh.position.set(centerX, 0.02, centerZ); floorMesh.receiveShadow = true;
      this.scene.add(floorMesh);

      const shopLight = new THREE.PointLight(bCfg.npcColor || 0xf59e0b, 1.25, 15);
      shopLight.position.set(centerX, 3.2, centerZ);
      this.scene.add(shopLight);

      const wallMat = new THREE.MeshStandardMaterial({ color: bCfg.roof, roughness: 0.85, metalness: 0.1 });
      const wallMatsTransp = [];

      // Paredes com geometria orientada corretamente no eixo da fachada e laterais
      const backWall = new THREE.Mesh(new THREE.BoxGeometry(0.38, bh, bd), wallMat.clone());
      backWall.position.set(centerX + (bCfg.col * (bw / 2)), bh / 2, centerZ);
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

      // Porta com abertura automática
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

      const signPos = new THREE.Vector3(frontX - (bCfg.col * 0.25), bh + 0.95, centerZ);
      const jaVisitou = visitados.includes(bCfg.id);
      const placa3D = this.criarLetreiro3D(spInfo.name, signPos, bCfg.col, jaVisitou);

      this.buildingMeshes.set(bCfg.id, { walls: wallMatsTransp, roof, frontX, doorZ: centerZ, centerX, centerZ, bw, bd, bh, floor: floorMesh, doorGroup, placa3D, shopLight });
      this.decorarInteriorEdificio3D(bCfg.id, centerX, centerZ, bCfg.col, bCfg);

      const npcX = centerX + (bCfg.col * 3.1);
      const npcZ = centerZ;
      const isFemaleNPC = ['coffee','school','shopping','cinema','beach','hotel','hospital'].includes(bCfg.id);
      const npcMesh = this.criarBonecoHumano3D(bCfg.npcColor, 0x0f172a, 0xfde68a, isFemaleNPC);
      npcMesh.position.set(npcX, 0, npcZ);
      npcMesh.rotation.y = bCfg.col === -1 ? (Math.PI / 2) : (-Math.PI / 2);
      this.scene.add(npcMesh);

      const labelEl = this.criarEtiquetaHTML(`${spInfo.emoji} ${spInfo.npcName}`, 'AI HOST', '#10b981');
      this.npcs3D.set(bCfg.id, { id: bCfg.id, space: spInfo, name: spInfo.npcName, x: npcX, z: npcZ, mesh: npcMesh, labelEl, col: bCfg.col });

   this.buildingsMeta.push({
        id: bCfg.id,
        space: spInfo,
        col: bCfg.col,
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

      if (selectTeleport) {
        const opt = document.createElement('option');
        opt.value = bCfg.id;
        opt.textContent = `${spInfo.emoji} ${spInfo.name}`;
        selectTeleport.appendChild(opt);
      }
    }); // Fim do forEach dos edifícios

    // Tenta carregar GLTF do Coffee com fallback
    setTimeout(()=>{ this.tentarCarregarGLTFCoffee(); }, 800);

    // 🎯 CORREÇÃO DO ERRO: Calculamos o startBuilding aqui, com segurança, 
    // sabendo que this.buildingsMeta já está totalmente preenchido!
    const startBuilding = this.buildingsMeta.find(b => b.id === initialSpaceId) || this.buildingsMeta[0];

    // Inicializa as 14 Maravilhas interativas
    this.criarAnimaisRua();
    this.criarAudioZones3D();
    this.criarSistemaChuvaNeblina();
    this.criarNightMarket();
    this.criarMusicoDeRua();
    this.criarFantasmaLider();
    this.criarVitrinesVivas();
    this.criarQuadroNegroVivo();
    this.criarCardapioFalado();
    this.criarPainelVoosVivo();
    this.criarStickyNotesParede();
    this.criarFotoPolaroid();
    this.ativarSombrasReais();

    // Dados do utilizador logado e criação do avatar local
    const u = window.Workspace?.usuario || {};
    const meuNome = u.nome || u.login || 'You';
    const meuId = String(u.id || 'local_' + Date.now());

    const playerMesh = this.criarBonecoHumano3D(0x8b5cf6, 0x1e1b4b, 0xfde68a);
    const initialX = startBuilding ? (startBuilding.centerX * 0.45) : 0;
    const initialZ = startBuilding ? startBuilding.centerZ : 0;
    
    playerMesh.position.set(initialX, 0, initialZ);
    this.scene.add(playerMesh);

    const roleInicial = this.parentManager.state.role || 'STUDENT';
    const myLabel = this.criarEtiquetaHTML(`${meuNome} (You)`, roleInicial, '#8b5cf6');
    
    this.localPlayer = {
      userId: meuId,
      nome: meuNome,
      avatar: u.avatar || null,
      role: roleInicial,
      actingRole: null,
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

  criarEtiquetaHTML(nome, role, corBadge) {
    const layer = document.getElementById('es-city-labels-layer');
    const div = document.createElement('div');
    div.style.cssText = 'position:absolute; transform:translate(-50%, -100%); display:flex; flex-direction:column; align-items:center; pointer-events:none; transition:opacity 0.15s;';
    const textoLimpo = String(nome || '').replace(/^[^\w\s]+/, '').trim();
    const isYou = textoLimpo.includes('(You)');
    const icone = isYou ? '<span style="color:#38bdf8;">📍</span>' : '<span style="color:#c084fc;">✨</span>';
    const sufixoRole = role ? ` <span class="es-role-tag" style="color:${isYou ? '#93c5fd' : '#a1a1aa'}; font-weight:700;">[${role}]</span>` : '';
    div.innerHTML = `<div class="es-speech-bubble" style="display:none;"></div><div class="es-city-label ${isYou ? 'me' : ''}">${icone} <span>${textoLimpo}${sufixoRole}</span></div>`;
    if (layer) layer.appendChild(div);
    return div;
  }

  mostrarBalaoNoBoneco(entidade, texto, duracaoMs = 6000) {
    if (!entidade || !entidade.labelEl) return;
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
      const shouldOpen = dist < 3.0;
      doorGroup.userData.isOpen = shouldOpen;
      const targetAngle = shouldOpen ? (b.col === -1 ? Math.PI / 2.2 : -Math.PI / 2.2) : 0;
      doorGroup.userData.openAngle += (targetAngle - doorGroup.userData.openAngle) * 0.15;
      doorGroup.rotation.y = doorGroup.userData.openAngle;
    });
  }

  // 🏠 MODO INTERIOR: Oculta o exterior e remove o teto da loja atual para a câmara nunca ficar tapada!
  entrarModoInterior(id) {
    if (this.modoInterior && this.predioAtual === id) return;
    this.modoInterior = true;
    this.predioAtual = id;
    this.exteriorGroup.visible = false;
    this.cars.forEach(c => { c.visible = false; });
    this.pedestrians.forEach(p => { p.mesh.visible = false; if (p.labelEl) p.labelEl.style.display = 'none'; });
    if (this.musician?.labelEl) this.musician.labelEl.style.display = 'none';
    if (this.ghost?.labelEl) this.ghost.labelEl.style.display = 'none';

    this.buildingsMeta.forEach(b => {
      const meshes = this.buildingMeshes.get(b.id);
      const interiorGrp = this.interiorGroups.get(b.id);
      const door = this.doors.get(b.id);
      const npc = this.npcs3D.get(b.id);

      if (b.id === id) {
        if (meshes) {
          meshes.walls.forEach(w => { w.visible = true; });
          if (meshes.roof) meshes.roof.visible = false; // Retira o teto enquanto está lá dentro para visão limpa!
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
    this.pedestrians.forEach(p => { p.mesh.visible = true; if (p.labelEl) p.labelEl.style.display = 'flex'; });
    if (this.musician?.labelEl) this.musician.labelEl.style.display = 'flex';
    if (this.ghost?.labelEl) this.ghost.labelEl.style.display = 'flex';

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
      if (npc) { npc.mesh.visible = true; if (npc.labelEl) npc.labelEl.style.display = 'flex'; }
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
      const speed = 7.2;

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
          p.x = Math.max(-24, Math.min(24, nextX));
          p.z = Math.max(-98, Math.min(18, nextZ));
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

      // Câmara inteligente: aproxima-se suavemente quando está dentro de uma loja para não atravessar as paredes
      const yaw = this.cameraYaw;
      const pitch = this.cameraPitch;
      const distBase = this.modoInterior ? 4.4 : 8.2;
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
      this.atualizarAudioZones();
      this.atualizarChuvaNeblina(delta);
      this.atualizarNightMarket();
      this.atualizarMusico();
      this.atualizarFantasma(delta);
      if (estaAndando) this.soltarPegada();
      this.vitrines.forEach(v => { v.mesh.rotation.y += delta * 0.6; });
      this.footprints = this.footprints.filter(f => {
        const age = Date.now() - f.born;
        if (age > 4200) { this.scene.remove(f.mesh); return false; }
        f.mesh.material.opacity = 0.28 * (1 - age / 4200);
        return true;
      });

      // Deteta se o aluno entrou ou saiu de um dos 12 edifícios
      let zonaDetetada = 'street';
      let buildingInside = null;
      for (const b of this.buildingsMeta) {
        if (p.x >= b.minX && p.x <= b.maxX && p.z >= b.minZ && p.z <= b.maxZ) {
          zonaDetetada = b.id;
          buildingInside = b;
          break;
        }
      }
      if (zonaDetetada !== 'street' && !this.modoInterior) {
        this.entrarModoInterior(zonaDetetada);
      } else if (zonaDetetada === 'street' && this.modoInterior) {
        this.sairModoInterior();
      }

      // 🎭 Roleplay Dinâmico: se o aluno for para trás do balcão da loja, assume o papel de anfitrião (ex: ACTING BARISTA)
      if (buildingInside) {
        const atrasDoBalcao = Math.abs(p.x - (buildingInside.centerX + buildingInside.col * 2.4)) < 1.6;
        const novoRole = atrasDoBalcao ? `ACTING ${buildingInside.space.roles[1] || 'HOST'}` : (this.parentManager.state.role || 'STUDENT');
        if (novoRole !== p.actingRole) {
          p.actingRole = novoRole;
          p.role = novoRole;
          const tagEl = p.labelEl?.querySelector('.es-role-tag');
          if (tagEl) tagEl.textContent = `[${novoRole}]`;
        }
      }

      this.nearbyTargets = [];
      this.npcs3D.forEach((npc) => {
        const d = Math.hypot(npc.x - p.x, npc.z - p.z);
        const perto = d <= PROXIMITY_RADIUS && (!this.modoInterior || this.predioAtual === npc.id);
        npc.mesh.userData.ringMat.opacity = perto ? 0.75 : 0.0;
        if (perto) this.nearbyTargets.push({ type: 'npc', id: npc.id, name: npc.name, space: npc.space, dist: d, ref: npc });
      });

           this.otherPlayers3D.forEach((op) => {
        // FIX: nunca esconder quem tá na mesma rua. Só esconder se um tá dentro e outro fora
        const isStreet = !this.modoInterior;
        const opIsStreet = !op.spaceId || op.spaceId === 'street';
        const sameBuilding = this.modoInterior && op.spaceId === this.predioAtual;
        const naMesmaZona = isStreet ? opIsStreet : sameBuilding;

        // Força visível quando na mesma zona - antes tava sumindo o mesh
        op.mesh.visible = naMesmaZona;
        // Garante que todos os filhos do boneco fiquem opacos (bug do GLTF cache que deixava só o círculo)
        if (naMesmaZona) {
          op.mesh.traverse(o => {
            if (o.isMesh && o.material) {
              o.material.transparent = false;
              o.material.opacity = 1;
              o.visible = true;
            }
          });
        }
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
        const playerOnRoad = Math.abs(p.x) < 3.2 && Math.abs(car.position.z - p.z) < 6;
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
          if (cloud.position.x > 50) cloud.position.x = -50;
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
      // IA só mostra nome quando entra no espaço dela - fora só personagens e avatares
      this.npcs3D.forEach(npc => {
        if (this.modoInterior && this.predioAtual === npc.id) this.projetarEtiquetaHTML(npc.mesh.position, 2.45, npc.labelEl, vw, vh);
      });
      this.otherPlayers3D.forEach(op => {
        if (op.mesh.visible) this.projetarEtiquetaHTML(op.mesh.position, 2.45, op.labelEl, vw, vh);
      });
      this.pedestrians.forEach(ped => {
        if (!this.modoInterior) this.projetarEtiquetaHTML(ped.mesh.position, 2.2, ped.labelEl, vw, vh);
      });
      if (this.musician && !this.modoInterior) this.projetarEtiquetaHTML(this.musician.mesh.position, 2.2, this.musician.labelEl, vw, vh);
      if (this.ghost && !this.modoInterior) this.projetarEtiquetaHTML(this.ghost.mesh.position, 2.4, this.ghost.labelEl, vw, vh);

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

    // 🚕 Táxi inteligente por comando de voz/texto
    if (lower.includes('take me to') || lower.includes('go to')) {
      const taxiTarget = this.buildingsMeta.find(b => lower.includes(b.id) || lower.includes(b.space.name.toLowerCase()));
      if (taxiTarget) {
        if (this.modoInterior) this.sairModoInterior();
        this.localPlayer.x = taxiTarget.centerX * 0.45;
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
        window.Workspace.mostrarAviso('🚶 Aproxime-se de outro aluno ou de um personagem (até acender o círculo verde no chão) para conversar!', 'warning');
      }
      return;
    }

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('thank') || lower.includes('bye') || lower.includes('hey')) {
      this.animarEmote(this.localPlayer);
      this.nearbyTargets.forEach(t => { if (t.ref) this.animarEmote(t.ref); });
    }

    this.mostrarBalaoNoBoneco(this.localPlayer, texto);
    this.adicionarMensagemFeedProximidade(`${this.localPlayer.nome} (You)`, texto, '#c084fc');

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

          const missaoPendente = (sp.missions || []).find(m => !this.parentManager.state.missionsDone.includes(m.id));
          if (missaoPendente) {
            this.parentManager.state.missionsDone.push(missaoPendente.id);
            this.parentManager.registarMissaoConcluida(sp.id, missaoPendente.id, missaoPendente.xp || 75);
          }
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

    this._onKeyDown = (e) => { if (document.activeElement?.id === 'es-city-chat-input') return; this.keys[e.code] = true; this.keys[e.key] = true; };
    this._onKeyUp = (e) => { this.keys[e.code] = false; this.keys[e.key] = false; };
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);

    document.querySelectorAll('.es-move-pad').forEach(btn => {
      const dir = 'pad_' + btn.dataset.dir;
      btn.addEventListener('pointerdown', (e) => { e.preventDefault(); this.keys[dir] = true; });
      btn.addEventListener('pointerup', () => { this.keys[dir] = false; });
      btn.addEventListener('pointerleave', () => { this.keys[dir] = false; });
    });

    const domCanvas = this.renderer.domElement;
    const THREE = window.THREE;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const planeY0 = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    domCanvas.addEventListener('pointerdown', (e) => {
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

        // ✅ Busca recursiva (true) para detetar cliques em objetos compostos como a Câmara Polaroid
        const hits = raycaster.intersectObjects(this.clickableObjects, true);
        if (hits.length > 0) {
          let obj = hits[0].object;
          while (obj && !obj.userData?.clickable && obj.parent) obj = obj.parent;
          const ud = obj?.userData || hits[0].object.userData || {};

          if (ud.isPolaroidCam) { this.tirarFotoPolaroid(); return; }
          if (ud.isStickyWall) {
            const nota = prompt('📝 Write a short Sticky Note in English for the Coffee Shop wall:');
            if (nota && nota.trim()) this.adicionarStickyNote(nota.trim(), true);
            return;
          }
          if (ud.isTaxiRadio) { this.tocarRadioTaxi(); return; }
          if (ud.isBlackboard && typeof ud.nextLesson === 'function') {
            const licao = ud.nextLesson();
            this.falarTextoNPC(licao, 'school');
            this.mostrarBalaoNoBoneco(this.localPlayer, `📖 ${licao}`, 5000);
            this.parentManager?.registarMissaoConcluida('school', 'blackboard', 15);
            return;
          }

          const name = ud.englishName || 'Object';
          this.falarTextoNPC(name, this.currentZoneId);
          this.mostrarBalaoNoBoneco(this.localPlayer, `💡 ${name}`, 3500);
          this.parentManager?.registarMissaoConcluida(this.currentZoneId, 'click_' + name.toLowerCase().replace(/\s+/g, '_'), 15);
          if (window.Workspace?.mostrarAviso) window.Workspace.mostrarAviso(`💡 ${name} (+15 XP)`, 'info');
          return;
        }

        const intersectPt = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(planeY0, intersectPt)) {
          const tx = Math.max(-24, Math.min(24, intersectPt.x));
          const tz = Math.max(-98, Math.min(18, intersectPt.z));
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
      if (!op) {
                const isFemale = String(pData.nome||'').toLowerCase().endsWith('a');
        // Força criar Box realista, não usa cache GLTF do Soldier que fica só com círculo
        const _cacheTemp = this.gltfCache.get('avatar');
        this.gltfCache.delete('avatar');
        const mesh = this.criarBonecoHumano3D(0x3b82f6, 0x0f172a, 0xfde68a, isFemale);
        if (_cacheTemp) this.gltfCache.set('avatar', _cacheTemp);
        mesh.position.set(pData.x || 0, 0, pData.z || 0);
        this.scene.add(mesh);
        const labelEl = this.criarEtiquetaHTML(pData.nome || 'Student', pData.role || 'PEER', '#38bdf8');
        op = {
          userId: pData.userId,
          nome: pData.nome || 'Student',
          role: pData.role || 'PEER',
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
        if (pData.role && pData.role !== op.role) {
          op.role = pData.role;
          const tagEl = op.labelEl?.querySelector('.es-role-tag');
          if (tagEl) tagEl.textContent = `[${pData.role}]`;
        }
      }
    });
  }

  iniciarMultiplayerRealtime() {
    this.enviarMinhaPosicaoServidor();
    this.pollInterval = setInterval(() => this.enviarMinhaPosicaoServidor(), 4000);
    try {
      let escolaId = 'DEFAULT';
      try { escolaId = JSON.parse(localStorage.getItem('ws_usuario_logado'))?.escolaId || 'DEFAULT'; } catch (e) {}
      this.sseConnection = new EventSource(`/api/workspace/stream?escolaId=${encodeURIComponent(escolaId)}`);
      this.sseConnection.onmessage = (ev) => {
        if (!this.active || !this.localPlayer) return;
        try {
          const data = JSON.parse(ev.data);
          if (data.type === 'ES_WORLD_MOVE' && data.player) {
            this.sincronizarListaJogadoresRemotos([data.player]);
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
            if (String(data.text || '').startsWith('[STICKY_NOTE] ')) {
              const notaRemota = String(data.text).replace('[STICKY_NOTE] ', '').trim();
              this.adicionarStickyNote(notaRemota, false);
              return;
            }
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
    } catch (e) {}
  }

  fecharCidade3D() {
    this.active = false;
    document.body.style.overflow = '';
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.dayNightInterval) clearInterval(this.dayNightInterval);
    if (this.flightBoardInterval) clearInterval(this.flightBoardInterval);
    if (this.audioCtx) {
      try { this.audioCtx.close(); } catch (e) {}
      this.audioCtx = null;
    }
    if (this.sseConnection) {
      try { this.sseConnection.close(); } catch (e) {}
      this.sseConnection = null;
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
