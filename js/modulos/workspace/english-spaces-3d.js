// js/modulos/workspace/english-spaces-3d.js
// 🏙️ MOTOR DA CIDADE 3D MULTIPLAYER (THREE.JS + AVATARES HUMANOS + PROXIMIDADE)

window.Workspace = window.Workspace || {};

const PROXIMITY_RADIUS = 6.0; // Distância máxima em metros 3D para ouvir e falar com alguém

// Coordenadas e cores dos 12 Edifícios da Cidade 3D (6 à esquerda da avenida, 6 à direita)
const CITY_BUILDINGS_LAYOUT = [
  { id: 'coffee',     col: -1, row: 0, color: 0xd97706, roof: 0x78350f, npcColor: 0xf59e0b },
  { id: 'restaurant', col:  1, row: 0, color: 0xe11d48, roof: 0x881337, npcColor: 0xfb7185 },
  { id: 'school',     col: -1, row: 1, color: 0x16a34a, roof: 0x14532d, npcColor: 0x4ade80 },
  { id: 'shopping',   col:  1, row: 1, color: 0xca8a04, roof: 0x713f12, npcColor: 0xfacc15 },
  { id: 'home',       col: -1, row: 2, color: 0x475569, roof: 0x1e293b, npcColor: 0x94a3b8 },
  { id: 'cinema',     col:  1, row: 2, color: 0xdb2777, roof: 0x831843, npcColor: 0xf472b6 },
  { id: 'taxi',       col: -1, row: 3, color: 0xeab308, roof: 0x713f12, npcColor: 0xfde047 },
  { id: 'beach',      col:  1, row: 3, color: 0x0d9488, roof: 0x134e4a, npcColor: 0x2dd4bf },
  { id: 'hotel',      col: -1, row: 4, color: 0x9333ea, roof: 0x581c87, npcColor: 0xc084fc },
  { id: 'airport',    col:  1, row: 4, color: 0x0284c7, roof: 0x0c4a6e, npcColor: 0x38bdf8 },
  { id: 'job',        col: -1, row: 5, color: 0x4f46e5, roof: 0x312e81, npcColor: 0x818cf8 },
  { id: 'hospital',   col:  1, row: 5, color: 0x059669, roof: 0x064e3b, npcColor: 0x34d399 }
];

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
    this.npcs3D = new Map();
    this.otherPlayers3D = new Map();
    this.localPlayer = null;

    this.keys = {};
    this.cameraYaw = 0;
    this.isDraggingCam = false;
    this.dragStartX = 0;

    this.nearbyTargets = [];
    this.currentZoneId = 'street';
    this.lastSyncTime = 0;
    this.sseConnection = null;
    this.pollInterval = null;
  }

  async carregarThreeJS() {
    if (window.THREE) return window.THREE;
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.onload = () => resolve(window.THREE);
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
        /* Oculta o scroll da página de fundo enquanto o Mundo 3D está aberto */
        body { overflow: hidden !important; }

        /* Contentor Fullscreen que cobre 100% do computador, tablet e telemóvel (incluindo a barra do WorkSpace) */
        #es-city-wrapper {
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          height: 100dvh !important;
          background: radial-gradient(circle at 50% 35%, #15162c 0%, #090a14 70%, #05060b 100%) !important;
          z-index: 1000020 !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
          font-family: 'Inter', 'Poppins', sans-serif !important;
          user-select: none !important;
          overflow: hidden !important;
        }

        /* 1. Remoção da poluição visual (mantendo os IDs vivos para o JS não quebrar) */
        #es-city-Hud-card,
        #es-city-teleport,
        #es-city-chat-feed {
          display: none !important;
        }

        /* 2. Topo Limpo estilo Referência */
        .es-ref-top-area {
          position: relative;
          z-index: 30;
          padding: max(12px, env(safe-area-inset-top)) 16px 0 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
        }

        .es-ref-ws-header {
          pointer-events: auto;
          background: linear-gradient(135deg, #3b66f5 0%, #254EDB 100%);
          border-radius: 20px;
          padding: 16px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 10px 28px rgba(37, 78, 219, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.25);
        }

        .es-ref-ws-title {
          color: #ffffff;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.4px;
          margin: 0;
        }

        .es-ref-ws-dots {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.18);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          letter-spacing: 1px;
          font-size: 14px;
        }

        .es-ref-subbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 4px;
        }

        /* Pílula roxa pequena de localização */
        #es-city-zone-badge {
          pointer-events: auto;
          background: rgba(124, 58, 237, 0.28) !important;
          border: 1px solid rgba(167, 139, 250, 0.45) !important;
          color: #e9d5ff !important;
          padding: 5px 12px !important;
          border-radius: 999px !important;
          font-size: 11.5px !important;
          font-weight: 700 !important;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
        }

        /* Botão discreto Exit 3D World no canto superior direito */
        #es-city-exit-btn {
          pointer-events: auto;
          background: rgba(24, 26, 42, 0.82) !important;
          border: 1px solid rgba(255, 255, 255, 0.14) !important;
          color: #e2e8f0 !important;
          padding: 6px 14px !important;
          border-radius: 999px !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          cursor: pointer;
          backdrop-filter: blur(10px);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
        }
        #es-city-exit-btn:hover {
          background: rgba(239, 68, 68, 0.85) !important;
          color: #ffffff !important;
          border-color: rgba(252, 165, 165, 0.5) !important;
        }

        /* Pílula minúscula, centralizada e translúcida de Proximidade */
        .es-ref-proximity-wrap {
          display: flex;
          justify-content: center;
          margin-top: 2px;
        }
        #es-city-proximity-badge {
          pointer-events: auto;
          background: rgba(22, 24, 38, 0.72) !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          color: #cbd5e1 !important;
          padding: 4px 14px !important;
          border-radius: 999px !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          backdrop-filter: blur(12px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.35);
          letter-spacing: 0.2px;
        }

        /* 3. Viewport 3D ocupando o ecrã limpo */
        #es-city-viewport {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 1 !important;
          overflow: hidden !important;
          touch-action: none !important;
        }

        /* Nameplates flutuantes iguais à referência */
        .es-ref-nameplate {
          background: rgba(15, 17, 30, 0.82);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #f8fafc;
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 700;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
        }

        /* 4. D-Pad Circular Único e Translúcido no Canto Inferior Direito */
        .es-dpad-circle {
          position: absolute;
          bottom: 96px;
          right: 22px;
          width: 108px;
          height: 108px;
          border-radius: 50%;
          background: rgba(20, 22, 36, 0.62);
          backdrop-filter: blur(12px);
          border: 1.5px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.08);
          z-index: 25;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .es-dpad-circle .es-move-pad {
          position: absolute;
          width: 34px;
          height: 34px;
          border: none !important;
          background: transparent !important;
          color: rgba(226, 232, 240, 0.75) !important;
          font-size: 13px !important;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 50%;
          transition: background 0.15s, color 0.15s, transform 0.1s;
        }
        .es-dpad-circle .es-move-pad:active,
        .es-dpad-circle .es-move-pad:hover {
          background: rgba(255, 255, 255, 0.12) !important;
          color: #ffffff !important;
        }
        .es-dpad-circle .es-move-pad[data-dir="up"]    { top: 4px; left: 50%; transform: translateX(-50%); }
        .es-dpad-circle .es-move-pad[data-dir="down"]  { bottom: 4px; left: 50%; transform: translateX(-50%); }
        .es-dpad-circle .es-move-pad[data-dir="left"]  { left: 4px; top: 50%; transform: translateY(-50%); }
        .es-dpad-circle .es-move-pad[data-dir="right"] { right: 4px; top: 50%; transform: translateY(-50%); }

        /* 5. Bottom Bar com 3 Itens Fixos Iguais à Referência */
        .es-ref-bottom-bar {
          position: relative;
          z-index: 30;
          margin: 0 14px max(14px, env(safe-area-inset-bottom)) 14px;
          padding: 10px 12px;
          background: rgba(16, 18, 30, 0.88);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
        }

        #es-city-voice-btn {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%) !important;
          color: #ffffff !important;
          border: none !important;
          padding: 0 16px !important;
          height: 44px !important;
          border-radius: 14px !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 7px !important;
          cursor: pointer !important;
          white-space: nowrap !important;
          box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3) !important;
          flex-shrink: 0;
        }

        #es-city-speak-nearby-pill {
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%) !important;
          color: #ffffff !important;
          border: none !important;
          padding: 0 16px !important;
          height: 44px !important;
          border-radius: 14px !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 7px !important;
          cursor: pointer !important;
          white-space: nowrap !important;
          box-shadow: 0 4px 15px rgba(124, 58, 237, 0.35) !important;
          flex-shrink: 0;
        }

        .es-ref-input-group {
          flex: 1;
          min-width: 140px;
          height: 44px;
          background: rgba(30, 33, 52, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          display: flex;
          align-items: center;
          padding: 0 6px 0 14px;
        }

        #es-city-chat-input {
          flex: 1 !important;
          width: 100% !important;
          background: transparent !important;
          border: none !important;
          color: #f8fafc !important;
          font-size: 13.5px !important;
          outline: none !important;
          padding: 0 !important;
        }
        #es-city-chat-input::placeholder {
          color: #64748b !important;
        }

        #es-city-send-btn {
          width: 34px !important;
          height: 34px !important;
          border-radius: 10px !important;
          background: transparent !important;
          color: #94a3b8 !important;
          border: none !important;
          padding: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 16px !important;
          cursor: pointer !important;
          flex-shrink: 0;
        }
        #es-city-send-btn:hover {
          color: #ffffff !important;
          background: rgba(255, 255, 255, 0.08) !important;
        }

        @media (max-width: 600px) {
          .es-ref-ws-header { padding: 12px 16px; border-radius: 16px; }
          .es-ref-ws-title { font-size: 19px; }
          .es-ref-bottom-bar { padding: 8px; gap: 6px; margin: 0 10px max(10px, env(safe-area-inset-bottom)) 10px; }
          #es-city-voice-btn, #es-city-speak-nearby-pill { padding: 0 11px !important; height: 40px !important; font-size: 12px !important; }
          .es-ref-input-group { height: 40px; }
          .es-dpad-circle { width: 96px; height: 96px; bottom: 82px; right: 14px; }
        }
      </style>

      <div id="es-city-wrapper">
        <!-- TOPO LIMPO IGUAL À REFERÊNCIA -->
        <div class="es-ref-top-area">
          <div class="es-ref-ws-header">
            <h2 class="es-ref-ws-title">WorkSpace</h2>
            <div class="es-ref-ws-dots">•••</div>
          </div>

          <div class="es-ref-subbar">
            <span id="es-city-zone-badge">🏙️ English City Boulevard</span>
            <button type="button" id="es-city-exit-btn">⇄ Exit 3D World</button>
          </div>

          <div class="es-ref-proximity-wrap">
            <span id="es-city-proximity-badge">• Out of Range</span>
          </div>
        </div>

        <!-- ELEMENTOS OCULTOS PARA PRESERVAR 100% DA LÓGICA JS -->
        <select id="es-city-teleport"><option value=""></option></select>
        <div id="es-city-Hud-card"><div id="es-city-hud-content"></div></div>
        <div id="es-city-chat-feed"></div>

        <!-- VIEWPORT 3D LIMPO + D-PAD CIRCULAR ÚNICO -->
        <div id="es-city-viewport">
          <div id="es-city-labels-layer" style="position:absolute; inset:0; pointer-events:none; z-index:10; overflow:hidden;"></div>

          <div class="es-dpad-circle">
            <button type="button" class="es-move-pad" data-dir="up">▲</button>
            <button type="button" class="es-move-pad" data-dir="left">◀</button>
            <button type="button" class="es-move-pad" data-dir="right">▶</button>
            <button type="button" class="es-move-pad" data-dir="down">▼</button>
          </div>
        </div>

        <!-- BARRA INFERIOR COM OS 3 ITENS FIXOS DA REFERÊNCIA -->
        <div class="es-ref-bottom-bar">
          <button type="button" id="es-city-voice-btn">🎤 Voice Mic</button>
          <button type="button" id="es-city-speak-nearby-pill" onclick="document.getElementById('es-city-chat-input')?.focus()">🔊 Speak Nearby</button>
          <div class="es-ref-input-group">
            <input type="text" id="es-city-chat-input" placeholder="Type message..." autocomplete="off" />
            <button type="button" id="es-city-send-btn" title="Send">➤</button>
          </div>
        </div>
      </div>
    `;

    try {
      await this.carregarThreeJS();
    } catch (e) {
      if (window.Workspace?.mostrarAviso) {
        window.Workspace.mostrarAviso('Erro ao carregar motor gráfico 3D.', 'error');
      }
      return;
    }

    this.active = true;
    this.inicializarCenaThreeJS(initialSpaceId);
    this.configurarEventosControles();
    this.iniciarMultiplayerRealtime();
  }

  // 👤 CONSTRUTOR DE BONECO HUMANO 3D ARTICULADO (Cabeça, Olhos, Cabelo, Tronco, Braços e Pernas)
  criarBonecoHumano3D(corCamisa = 0x8b5cf6, corCalca = 0x1e293b, corPele = 0xfde68a) {
    const THREE = window.THREE;
    const group = new THREE.Group();

    const matPele = new THREE.MeshLambertMaterial({ color: corPele });
    const matCamisa = new THREE.MeshLambertMaterial({ color: corCamisa });
    const matCalca = new THREE.MeshLambertMaterial({ color: corCalca });
    const matCabelo = new THREE.MeshLambertMaterial({ color: 0x27272a });
    const matOlho = new THREE.MeshBasicMaterial({ color: 0x09090b });

    // Pernas com ponto de articulação na anca (para caminhar)
    const legGeo = new THREE.BoxGeometry(0.24, 0.75, 0.24);
    legGeo.translate(0, -0.375, 0);
    const leftLeg = new THREE.Mesh(legGeo, matCalca);
    leftLeg.position.set(-0.16, 0.75, 0);
    const rightLeg = new THREE.Mesh(legGeo, matCalca);
    rightLeg.position.set(0.16, 0.75, 0);
    group.add(leftLeg, rightLeg);

    // Tronco / Camisa
    const torsoGeo = new THREE.BoxGeometry(0.62, 0.85, 0.34);
    const torso = new THREE.Mesh(torsoGeo, matCamisa);
    torso.position.set(0, 1.18, 0);
    group.add(torso);

    // Braços com ponto de articulação no ombro
    const armGeo = new THREE.BoxGeometry(0.2, 0.72, 0.2);
    armGeo.translate(0, -0.32, 0);
    const leftArm = new THREE.Mesh(armGeo, matCamisa);
    leftArm.position.set(-0.43, 1.52, 0);
    const rightArm = new THREE.Mesh(armGeo, matCamisa);
    rightArm.position.set(0.43, 1.52, 0);
    group.add(leftArm, rightArm);

    // Cabeça humana + Cabelo + Olhos
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.88, 0);
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.46, 0.46), matPele);
    const hairMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.5), matCabelo);
    hairMesh.position.set(0, 0.2, 0);

    const eyeGeo = new THREE.BoxGeometry(0.06, 0.06, 0.05);
    const leftEye = new THREE.Mesh(eyeGeo, matOlho);
    leftEye.position.set(-0.1, 0.04, 0.23);
    const rightEye = new THREE.Mesh(eyeGeo, matOlho);
    rightEye.position.set(0.1, 0.04, 0.23);

    headGroup.add(headMesh, hairMesh, leftEye, rightEye);
    group.add(headGroup);

    // Anel luminoso de Proximidade no chão (acende quando alguém se aproxima)
    const ringGeo = new THREE.RingGeometry(0.65, 0.82, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.0 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = 0.03;
    group.add(ringMesh);

    group.userData = { leftLeg, rightLeg, leftArm, rightArm, headGroup, ringMat, walkPhase: 0 };
    return group;
  }

  animarPassosBoneco(meshGroup, estaAndando, delta) {
    const ud = meshGroup?.userData;
    if (!ud) return;
    if (estaAndando) {
      ud.walkPhase += delta * 10;
      const ang = Math.sin(ud.walkPhase) * 0.55;
      ud.leftLeg.rotation.x = ang;
      ud.rightLeg.rotation.x = -ang;
      ud.leftArm.rotation.x = -ang * 0.8;
      ud.rightArm.rotation.x = ang * 0.8;
    } else {
      ud.leftLeg.rotation.x *= 0.85;
      ud.rightLeg.rotation.x *= 0.85;
      ud.leftArm.rotation.x *= 0.85;
      ud.rightArm.rotation.x *= 0.85;
    }
  }

  inicializarCenaThreeJS(initialSpaceId) {
    const THREE = window.THREE;
    const viewport = document.getElementById('es-city-viewport');
    const w = viewport.clientWidth || 900;
    const h = viewport.clientHeight || 520;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x070b19);
    this.scene.fog = new THREE.FogExp2(0x070b19, 0.012);

    this.camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 220);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    viewport.insertBefore(this.renderer.domElement, viewport.firstChild);

    // Iluminação da Cidade
    const ambLight = new THREE.AmbientLight(0xffffff, 0.72);
    this.scene.add(ambLight);
    const dirLight = new THREE.DirectionalLight(0xfef08a, 0.65);
    dirLight.position.set(25, 45, 20);
    this.scene.add(dirLight);

    // Relvado/Piso da Cidade e Avenida Central
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(140, 180),
      new THREE.MeshLambertMaterial({ color: 0x0f172a })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, -35);
    this.scene.add(ground);

    // Estrada / Avenida Principal onde os alunos caminham entre os locais
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 150),
      new THREE.MeshLambertMaterial({ color: 0x1e293b })
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.01, -35);
    this.scene.add(road);

    // Construir os 12 Edifícios com Portas Abertas e NPCs lá dentro!
    this.buildingsMeta = [];
    this.npcs3D.clear();
    const selectTeleport = document.getElementById('es-city-teleport');
    const registry = this.parentManager. getSpacesRegistry ? this.parentManager.getSpacesRegistry() : window.Workspace.EnglishSpaces.getSpacesRegistry();

    CITY_BUILDINGS_LAYOUT.forEach((bCfg) => {
      const spInfo = registry[bCfg.id];
      if (!spInfo) return;

      const centerX = bCfg.col * 13; // -13 (esquerda) ou +13 (direita)
      const centerZ = -bCfg.row * 16; // Ao longo da avenida
      const bw = 10;
      const bd = 10;
      const bh = 4.2;

      // Piso Interno do Edifício (Entrar aqui muda automaticamente de Espaço!)
      const floorMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(bw, bd),
        new THREE.MeshLambertMaterial({ color: bCfg.color })
      );
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.position.set(centerX, 0.02, centerZ);
      this.scene.add(floorMesh);

      // Paredes do Edifício (deixando a frente virada para a avenida aberta como porta!)
      const wallMat = new THREE.MeshLambertMaterial({ color: bCfg.roof });
      const backWall = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.3), wallMat);
      backWall.position.set(centerX + (bCfg.col * (bw / 2)), bh / 2, centerZ);
      backWall.rotation.y = Math.PI / 2;
      this.scene.add(backWall);

      const sideWall1 = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.3), wallMat);
      sideWall1.position.set(centerX, bh / 2, centerZ - bd / 2);
      this.scene.add(sideWall1);

      const sideWall2 = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.3), wallMat);
      sideWall2.position.set(centerX, bh / 2, centerZ + bd / 2);
      this.scene.add(sideWall2);

      // Balcão de Atendimento 3D dentro do Edifício
      const counter = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 1.1, 4.2),
        new THREE.MeshLambertMaterial({ color: 0xf8fafc })
      );
      counter.position.set(centerX + (bCfg.col * 1.8), 0.55, centerZ);
      this.scene.add(counter);

      // Criar o Boneco 3D do NPC (IA) atrás do balcão deste local
      const npcX = centerX + (bCfg.col * 3.1);
      const npcZ = centerZ;
      const npcMesh = this.criarBonecoHumano3D(bCfg.npcColor, 0x0f172a, 0xfde68a);
      npcMesh.position.set(npcX, 0, npcZ);
      npcMesh.rotation.y = bCfg.col === -1 ? (Math.PI / 2) : (-Math.PI / 2);
      this.scene.add(npcMesh);

      const labelEl = this.criarEtiquetaHTML(`${spInfo.emoji} ${spInfo.npcName}`, 'AI HOST', '#10b981');
      const signEl = this.criarPlacaEdificioHTML(`${spInfo.emoji} ${spInfo.name}`);

      this.npcs3D.set(bCfg.id, {
        id: bCfg.id,
        space: spInfo,
        name: spInfo.npcName,
        x: npcX,
        z: npcZ,
        mesh: npcMesh,
        labelEl,
        bubbleText: spInfo.dialogues?.start?.text || 'Welcome! Walk close to talk to me!'
      });

      this.buildingsMeta.push({
        id: bCfg.id,
        space: spInfo,
        centerX,
        centerZ,
        minX: centerX - bw / 2,
        maxX: centerX + bw / 2,
        minZ: centerZ - bd / 2,
        maxZ: centerZ + bd / 2,
        signPos: new THREE.Vector3(centerX - (bCfg.col * (bw / 2 - 0.5)), bh + 0.8, centerZ),
        signEl
      });

      if (selectTeleport) {
        const opt = document.createElement('option');
        opt.value = bCfg.id;
        opt.textContent = `${spInfo.emoji} ${spInfo.name}`;
        selectTeleport.appendChild(opt);
      }
    });

    // Criar o Boneco Humano 3D do Próprio Utilizador Logado
    const u = window.Workspace?.usuario || {};
    const meuNome = u.nome || u.login || 'You';
    const meuId = String(u.id || 'local_' + Date.now());
    const startBuilding = this.buildingsMeta.find(b => b.id === initialSpaceId) || this.buildingsMeta[0];

    const playerMesh = this.criarBonecoHumano3D(0x8b5cf6, 0x1e1b4b, 0xfde68a);
    const initialX = startBuilding ? (startBuilding.centerX * 0.55) : 0;
    const initialZ = startBuilding ? startBuilding.centerZ : 0;
    playerMesh.position.set(initialX, 0, initialZ);
    this.scene.add(playerMesh);

    const myLabel = this.criarEtiquetaHTML(`${meuNome} (You)`, this.parentManager.state.role || 'STUDENT', '#8b5cf6');

    this.localPlayer = {
      userId: meuId,
      nome: meuNome,
      avatar: u.avatar || null,
      role: this.parentManager.state.role || 'STUDENT',
      x: initialX,
      z: initialZ,
      targetX: null,
      targetZ: null,
      rotY: 0,
      mesh: playerMesh,
      labelEl: myLabel,
      bubbleText: ''
    };

    this.clock = new THREE.Clock();
    this.iniciarLoopRenderizacao();
  }

 criarEtiquetaHTML(nome, role, corBadge) {
    const layer = document.getElementById('es-city-labels-layer');
    const div = document.createElement('div');
    div.style.cssText = 'position:absolute; transform:translate(-50%, -100%); display:flex; flex-direction:column; align-items:center; pointer-events:none; transition:opacity 0.15s;';

    const textoLimpo = String(nome || '').replace(/^[^\w\s]+/, '').trim();
    const isYou = textoLimpo.includes('(You)');
    const icone = isYou ? '<span style="color:#38bdf8;">📍</span>' : '<span style="color:#c084fc;">✨</span>';
    const sufixoRole = isYou ? '' : ` <span style="color:#a1a1aa; font-weight:600;">[${role}]</span>`;

    div.innerHTML = `
      <div class="es-3d-bubble" style="display:none; background:#ffffff; color:#0f172a; padding:6px 12px; border-radius:12px; font-size:12px; font-weight:700; max-width:220px; text-align:center; margin-bottom:6px; box-shadow:0 6px 18px rgba(0,0,0,0.45);"></div>
      <div class="es-ref-nameplate">
        ${icone} <span>${textoLimpo}${sufixoRole}</span>
      </div>
    `;
    if (layer) layer.appendChild(div);
    return div;
  }

  criarPlacaEdificioHTML(titulo) {
    const layer = document.getElementById('es-city-labels-layer');
    const div = document.createElement('div');
    div.style.cssText = 'position:absolute; transform:translate(-50%, -50%); background:rgba(15,23,42,0.92); border:1.5px solid rgba(167,139,250,0.6); color:#fff; padding:4px 12px; border-radius:10px; font-size:12px; font-weight:900; white-space:nowrap; box-shadow:0 4px 12px rgba(0,0,0,0.5);';
    div.textContent = titulo;
    if (layer) layer.appendChild(div);
    return div;
  }

  mostrarBalaoNoBoneco(entidade, texto, duracaoMs = 6000) {
    if (!entidade || !entidade.labelEl) return;
    const bubble = entidade.labelEl.querySelector('.es-3d-bubble');
    if (!bubble) return;
    bubble.textContent = texto;
    bubble.style.display = 'block';
    clearTimeout(entidade._bubbleTimeout);
    entidade._bubbleTimeout = setTimeout(() => {
      bubble.style.display = 'none';
    }, duracaoMs);
  }

  iniciarLoopRenderizacao() {
    const THREE = window.THREE;
    const viewport = document.getElementById('es-city-viewport');

    const animar = () => {
      if (!this.active) return;
      this.animFrame = requestAnimationFrame(animar);

      const delta = Math.min(this.clock.getDelta(), 0.1);
      const p = this.localPlayer;
      if (!p) return;

      // 1. Movimento por Teclado (WASD / Setas) ou D-Pad Circular alinhado à direção da Câmara!
      let inputRight = 0;
      let inputForward = 0;
      if (this.keys['ArrowUp'] || this.keys['KeyW'] || this.keys['pad_up']) inputForward += 1;
      if (this.keys['ArrowDown'] || this.keys['KeyS'] || this.keys['pad_down']) inputForward -= 1;
      if (this.keys['ArrowLeft'] || this.keys['KeyA'] || this.keys['pad_left']) inputRight -= 1;
      if (this.keys['ArrowRight'] || this.keys['KeyD'] || this.keys['pad_right']) inputRight += 1;

      let estaAndando = false;
      const speed = 7.2;

      if (inputRight !== 0 || inputForward !== 0) {
        p.targetX = null;
        p.targetZ = null;
        const len = Math.hypot(inputRight, inputForward);
        const normR = inputRight / len;
        const normF = inputForward / len;

        // Projeta os botões na direção exata para onde a câmara está virada (cameraYaw)
        const sinY = Math.sin(this.cameraYaw);
        const cosY = Math.cos(this.cameraYaw);
        const worldDirX = normR * cosY - normF * sinY;
        const worldDirZ = -normR * sinY - normF * cosY;

        const dx = worldDirX * speed * delta;
        const dz = worldDirZ * speed * delta;
        p.x = Math.max(-20, Math.min(20, p.x + dx));
        p.z = Math.max(-92, Math.min(12, p.z + dz));
        p.rotY = Math.atan2(worldDirX, worldDirZ);
        estaAndando = true;
      }
        else if (p.targetX !== null && p.targetZ !== null) {
        const dx = p.targetX - p.x;
        const dz = p.targetZ - p.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 0.2) {
          const step = Math.min(dist, speed * delta);
          p.x += (dx / dist) * step;
          p.z += (dz / dist) * step;
          p.rotY = Math.atan2(dx, dz);
          estaAndando = true;
        } else {
          p.targetX = null;
          p.targetZ = null;
        }
      }

      p.mesh.position.set(p.x, 0, p.z);
      p.mesh.rotation.y = p.rotY;
      this.animarPassosBoneco(p.mesh, estaAndando, delta);

      // 2. Câmara em 3.ª Pessoa suave seguindo o Boneco do Aluno
      const camOffsetX = Math.sin(this.cameraYaw) * 8.5;
      const camOffsetZ = Math.cos(this.cameraYaw) * 8.5;
      this.camera.position.set(p.x + camOffsetX, 5.2, p.z + camOffsetZ);
      this.camera.lookAt(p.x, 1.5, p.z - 1.5);

      // 3. Detetar automaticamente se o Avatar entrou num dos 12 Edifícios da Cidade!
      let zonaDetetada = 'street';
      for (const b of this.buildingsMeta) {
        if (p.x >= b.minX && p.x <= b.maxX && p.z >= b.minZ && p.z <= b.maxZ) {
          zonaDetetada = b.id;
          break;
        }
      }
      if (zonaDetetada !== this.currentZoneId) {
        this.currentZoneId = zonaDetetada;
        this.atualizarHudZonaLocal(zonaDetetada);
      }

      // 4. RADAR DE PROXIMIDADE FÍSICA (Verifica que NPCs e Alunos estão a <= 6.0m)
      this.nearbyTargets = [];

      this.npcs3D.forEach((npc) => {
        const d = Math.hypot(npc.x - p.x, npc.z - p.z);
        const perto = d <= PROXIMITY_RADIUS;
        npc.mesh.userData.ringMat.opacity = perto ? 0.75 : 0.0;
        if (perto) {
          this.nearbyTargets.push({ type: 'npc', id: npc.id, name: npc.name, space: npc.space, dist: d, ref: npc });
        }
      });

      this.otherPlayers3D.forEach((op) => {
        const dx = op.targetX - op.mesh.position.x;
        const dz = op.targetZ - op.mesh.position.z;
        const movendoOp = Math.hypot(dx, dz) > 0.05;
        op.mesh.position.x += dx * 0.15;
        op.mesh.position.z += dz * 0.15;
        op.mesh.rotation.y = op.rotY || 0;
        this.animarPassosBoneco(op.mesh, movendoOp, delta);

        const d = Math.hypot(op.mesh.position.x - p.x, op.mesh.position.z - p.z);
        const perto = d <= PROXIMITY_RADIUS;
        op.mesh.userData.ringMat.opacity = perto ? 0.75 : 0.0;
        if (perto) {
          this.nearbyTargets.push({ type: 'player', id: op.userId, name: op.nome, dist: d, ref: op });
        }
      });

      p.mesh.userData.ringMat.opacity = this.nearbyTargets.length > 0 ? 0.65 : 0.0;
      this.atualizarBadgeProximidade();

      // 5. Sincronizar posição no servidor quando o aluno caminha
      if (estaAndando && Date.now() - this.lastSyncTime > 260) {
        this.lastSyncTime = Date.now();
        this.enviarMinhaPosicaoServidor();
      }

      // 6. Atualizar posição das etiquetas 2D sobre a cabeça dos bonecos 3D
      const vw = viewport.clientWidth || 900;
      const vh = viewport.clientHeight || 520;
      this.projetarEtiquetaHTML(p.mesh.position, 2.45, p.labelEl, vw, vh);
      this.npcs3D.forEach(npc => this.projetarEtiquetaHTML(npc.mesh.position, 2.45, npc.labelEl, vw, vh));
      this.otherPlayers3D.forEach(op => this.projetarEtiquetaHTML(op.mesh.position, 2.45, op.labelEl, vw, vh));
      this.buildingsMeta.forEach(b => this.projetarEtiquetaHTML(b.signPos, 0, b.signEl, vw, vh));

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
    if (v.z > 1 || v.z < -1) {
      domEl.style.opacity = '0';
      return;
    }
    const x = (v.x * 0.5 + 0.5) * vw;
    const y = (-(v.y * 0.5) + 0.5) * vh;
    domEl.style.left = `${x}px`;
    domEl.style.top = `${y}px`;
    domEl.style.opacity = '1';
  }

  atualizarHudZonaLocal(zoneId) {
    const badge = document.getElementById('es-city-zone-badge');
    const hudContent = document.getElementById('es-city-hud-content');
    if (!badge || !hudContent) return;

    if (zoneId === 'street') {
      badge.innerHTML = '🏙️ English City Boulevard (Street)';
      hudContent.innerHTML = `
        <strong style="color:#fff; font-size:13px;">🚶 Explore the City!</strong>
        <p style="margin:6px 0 0 0; line-height:1.4; color:#94a3b8;">
          Walk through the open doors of any of the <strong>12 buildings</strong> along the avenue, or walk up to another student on the street to chat in English!
        </p>
      `;
      return;
    }

    const bMeta = this.buildingsMeta.find(b => b.id === zoneId);
    if (!bMeta) return;
    const sp = bMeta.space;
    this.parentManager.state.currentSpace = sp;
    this.parentManager.registarMissaoConcluida(sp.id, 'visit', 10);

    badge.innerHTML = `${sp.emoji} Inside: ${sp.name}`;
    hudContent.innerHTML = `
      <div style="font-weight:800; color:#fff; font-size:13.5px; margin-bottom:6px;">${sp.emoji} ${sp.name}</div>
      <div style="font-size:11px; color:#a78bfa; font-weight:700; margin-bottom:6px;">🎯 LOCAL MISSIONS:</div>
      ${(sp.missions || []).map(m => {
        const done = this.parentManager.state.missionsDone.includes(m.id);
        return `<div style="margin-bottom:4px; color:${done ? '#6ee7b7' : '#e2e8f0'};">${done ? '✅' : '⬜'} ${m.title} (+${m.xp} XP)</div>`;
      }).join('')}
      <div style="font-size:11px; color:#fde047; font-weight:700; margin:8px 0 4px 0;">💡 TRY SAYING TO ${sp.npcName.toUpperCase()}:</div>
      <div style="font-style:italic; color:#cbd5e1;">"${(sp.expressions && sp.expressions[0]) || 'Hello! Can you help me?'}"</div>
    `;
  }

 atualizarBadgeProximidade() {
    const badge = document.getElementById('es-city-proximity-badge');
    const input = document.getElementById('es-city-chat-input');
    if (!badge) return;

    if (this.nearbyTargets.length === 0) {
      badge.style.background = 'rgba(22, 24, 38, 0.72)';
      badge.style.borderColor = 'rgba(255, 255, 255, 0.12)';
      badge.style.color = '#cbd5e1';
      badge.innerHTML = '<span style="color:#f87171;">•</span> Out of Range';
      if (input) input.placeholder = 'Type message...';
    } else {
      const nomes = this.nearbyTargets.map(t => t.name).join(', ');
      badge.style.background = 'rgba(16, 185, 129, 0.22)';
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
    item.style.cssText = 'padding:4px 8px; background:rgba(255,255,255,0.05); border-radius:8px; line-height:1.35;';
    item.innerHTML = `<strong style="color:${cor};">${autor}:</strong> <span style="color:#fff;">${texto}</span>`;
    feed.appendChild(item);
    feed.scrollTop = feed.scrollHeight;
  }

  async processarFalaPorProximidade(textoCru) {
    const texto = String(textoCru || '').trim();
    if (!texto || !this.localPlayer) return;

    // 🔒 Regra de Ouro: Só consegue falar se estiver próximo de outro utilizador ou de um NPC!
    if (this.nearbyTargets.length === 0) {
      if (window.Workspace?.mostrarAviso) {
        window.Workspace.mostrarAviso('🚶 Aproxime-se de outro aluno ou de um personagem (até acender o círculo verde no chão) para conversar!', 'warning');
      }
      return;
    }

    this.mostrarBalaoNoBoneco(this.localPlayer, texto);
    this.adicionarMensagemFeedProximidade(`${this.localPlayer.nome} (You)`, texto, '#c084fc');

    // 1. Transmite a fala para outros alunos reais que estejam próximos no Mundo 3D
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

    // 2. Se houver um NPC da IA dentro do raio de proximidade, a IA responde em personagem!
    const npcAlvo = this.nearbyTargets.find(t => t.type === 'npc');
    if (npcAlvo) {
      const sp = npcAlvo.space;
      try {
        const prompt = `[3D City Location: ${sp.name} | You are: ${sp.npcName} | Student (${this.localPlayer.nome}) is right in front of you and said: "${texto}"]. Reply naturally in character in 1-2 short sentences in English.`;
        const res = await window.Workspace.api('/workspace/ingles/ia-teste/groq', 'POST', {
          mensagem: prompt,
          historico: []
        });
        if (res && res.success && res.resposta) {
          this.mostrarBalaoNoBoneco(npcAlvo.ref, res.resposta, 8000);
          this.adicionarMensagemFeedProximidade(sp.npcName, res.resposta, '#34d399');
          this.parentManager.falarTexto(res.resposta);

          const missaoPendente = (sp.missions || []).find(m => !this.parentManager.state.missionsDone.includes(m.id));
          if (missaoPendente) {
            this.parentManager.state.missionsDone.push(missaoPendente.id);
            this.parentManager.registarMissaoConcluida(sp.id, missaoPendente.id, missaoPendente.xp || 75);
            this.atualizarHudZonaLocal(this.currentZoneId);
          }
        }
      } catch (e) {}
    }
  }

  configurarEventosControles() {
    this._onKeyDown = (e) => {
      if (document.activeElement?.id === 'es-city-chat-input') return;
      this.keys[e.code] = true;
      this.keys[e.key] = true;
    };
    this._onKeyUp = (e) => {
      this.keys[e.code] = false;
      this.keys[e.key] = false;
    };
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);

    // Botões de toque na tela (Telemóvel / Rato)
    document.querySelectorAll('.es-move-pad').forEach(btn => {
      const dir = 'pad_' + btn.dataset.dir;
      btn.addEventListener('pointerdown', (e) => { e.preventDefault(); this.keys[dir] = true; });
      btn.addEventListener('pointerup', () => { this.keys[dir] = false; });
      btn.addEventListener('pointerleave', () => { this.keys[dir] = false; });
    });

    // Arrastar com rato/dedo para rodar o ângulo da câmara ou clicar no chão para andar
    const domCanvas = this.renderer.domElement;
    const THREE = window.THREE;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const planeY0 = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    domCanvas.addEventListener('pointerdown', (e) => {
      this.isDraggingCam = true;
      this.dragStartX = e.clientX;
      this._movedDrag = false;
    });

    domCanvas.addEventListener('pointermove', (e) => {
      if (!this.isDraggingCam) return;
      const dx = e.clientX - this.dragStartX;
      if (Math.abs(dx) > 6) {
        this._movedDrag = true;
        this.cameraYaw -= dx * 0.006;
        this.dragStartX = e.clientX;
      }
    });

    domCanvas.addEventListener('pointerup', (e) => {
      this.isDraggingCam = false;
      if (!this._movedDrag && this.localPlayer) {
        const rect = domCanvas.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, this.camera);
        const intersectPt = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(planeY0, intersectPt)) {
          this.localPlayer.targetX = Math.max(-20, Math.min(20, intersectPt.x));
          this.localPlayer.targetZ = Math.max(-92, Math.min(12, intersectPt.z));
        }
      }
    });

    // Menu rápido para caminhar/saltar até um edifício
    document.getElementById('es-city-teleport')?.addEventListener('change', (e) => {
      const targetId = e.target.value;
      if (!targetId || !this.localPlayer) return;
      const b = this.buildingsMeta.find(x => x.id === targetId);
      if (b) {
        this.localPlayer.x = b.centerX;
        this.localPlayer.z = b.centerZ;
        this.localPlayer.targetX = null;
        this.localPlayer.targetZ = null;
        this.enviarMinhaPosicaoServidor();
      }
      e.target.value = '';
    });

    // Enviar Fala e Microfone
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
      if (data && Array.isArray(data.players)) {
        this.sincronizarListaJogadoresRemotos(data.players);
      }
    }).catch(() => {});
  }

  sincronizarListaJogadoresRemotos(lista) {
    if (!this.active || !this.scene || !this.localPlayer) return;
    const idsVivos = new Set();

    lista.forEach(pData => {
      if (!pData || !pData.userId || pData.userId === this.localPlayer.userId) return;
      idsVivos.add(pData.userId);

      let op = this.otherPlayers3D.get(pData.userId);
      if (!op) {
        const mesh = this.criarBonecoHumano3D(0x3b82f6, 0x0f172a, 0xfde68a);
        mesh.position.set(pData.x || 0, 0, pData.z || 0);
        this.scene.add(mesh);
        const labelEl = this.criarEtiquetaHTML(pData.nome || 'Student', pData.role || 'PEER', '#38bdf8');
        op = {
          userId: pData.userId,
          nome: pData.nome || 'Student',
          role: pData.role || 'PEER',
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
            // Verifica se o colega que falou está dentro do nosso Raio de Proximidade (<= 6.0m)!
            const dist = Math.hypot((data.x || 0) - this.localPlayer.x, (data.z || 0) - this.localPlayer.z);
            if (dist <= PROXIMITY_RADIUS) {
              const op = this.otherPlayers3D.get(data.speakerId);
              if (op) this.mostrarBalaoNoBoneco(op, data.text, 7000);
              this.adicionarMensagemFeedProximidade(`🧑 ${data.speakerName}`, data.text, '#38bdf8');
              this.parentManager.falarTexto(data.text);
            }
          }
        } catch (e) {}
      };
    } catch (e) {}
  }

  fecharCidade3D() {
    this.active = false;
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.sseConnection) {
      try { this.sseConnection.close(); } catch (e) {}
      this.sseConnection = null;
    }
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

    if (this.parentManager) {
      this.parentManager.navigate('home');
    }
  }
}

Workspace.EnglishSpaces3D = new EnglishSpaces3DWorld();