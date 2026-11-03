// js/modulos/workspace/english-spaces-3d.js
// 🏙️ MOTOR DA CIDADE 3D MULTIPLAYER (THREE.JS + 12 CENÁRIOS MOBILIADOS + PROXIMIDADE + TELA CHEIA)

window.Workspace = window.Workspace || {};

const PROXIMITY_RADIUS = 6.0; // Distância máxima em metros 3D para ouvir e falar com alguém

// Coordenadas e cores dos 12 Edifícios da Cidade 3D (6 à esquerda da avenida, 6 à direita)
const CITY_BUILDINGS_LAYOUT = [
  { id: 'coffee',     col: -1, row: 0, color: 0xd97706, roof: 0x451a03, npcColor: 0xf59e0b },
  { id: 'restaurant', col:  1, row: 0, color: 0xe11d48, roof: 0x4c0519, npcColor: 0xfb7185 },
  { id: 'school',     col: -1, row: 1, color: 0x16a34a, roof: 0x052e16, npcColor: 0x4ade80 },
  { id: 'shopping',   col:  1, row: 1, color: 0xca8a04, roof: 0x422006, npcColor: 0xfacc15 },
  { id: 'home',       col: -1, row: 2, color: 0x475569, roof: 0x1e293b, npcColor: 0x94a3b8 },
  { id: 'cinema',     col:  1, row: 2, color: 0xdb2777, roof: 0x500724, npcColor: 0xf472b6 },
  { id: 'taxi',       col: -1, row: 3, color: 0xeab308, roof: 0x422006, npcColor: 0xfde047 },
  { id: 'beach',      col:  1, row: 3, color: 0x0d9488, roof: 0x042f2e, npcColor: 0x2dd4bf },
  { id: 'hotel',      col: -1, row: 4, color: 0x9333ea, roof: 0x3b0764, npcColor: 0xc084fc },
  { id: 'airport',    col:  1, row: 4, color: 0x0284c7, roof: 0x082f49, npcColor: 0x38bdf8 },
  { id: 'job',        col: -1, row: 5, color: 0x4f46e5, roof: 0x1e1b4b, npcColor: 0x818cf8 },
  { id: 'hospital',   col:  1, row: 5, color: 0x059669, roof: 0x022c22, npcColor: 0x34d399 }
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
        /* ===== TELA CHEIA 100% PURA (SEM BARRA WORKSPACE FICTÍCIA) ===== */
        body { overflow: hidden !important; }

        #es-city-wrapper {
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          height: 100dvh !important;
          background: #05070e !important;
          z-index: 1000020 !important;
          font-family: 'Inter', 'Geist', 'Poppins', sans-serif !important;
          user-select: none !important;
          overflow: hidden !important;
        }

        /* Mantém IDs vivos para o JS, mas invisíveis na tela */
        #es-city-Hud-card,
        #es-city-teleport,
        #es-city-chat-feed {
          position: absolute !important;
          width: 0 !important;
          height: 0 !important;
          overflow: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }

        /* VIEWPORT 3D OCUPANDO 100% DA TELA DE PONTA A PONTA */
        #es-city-viewport {
          position: absolute !important;
          inset: 0 !important;
          width: 100vw !important;
          height: 100dvh !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          background: transparent !important;
          z-index: 1 !important;
          touch-action: none !important;
        }

        #es-city-viewport canvas {
          display: block !important;
          width: 100% !important;
          height: 100% !important;
          border-radius: 0 !important;
        }

        #es-city-labels-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 10;
          overflow: hidden;
        }

        /* TOPO FLUTUANTE SOBRE O MUNDO 3D */
        .es-ref-top-area {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 30;
          padding: max(16px, env(safe-area-inset-top)) 20px 0 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
        }

        .es-ref-subbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        #es-city-zone-badge {
          pointer-events: auto;
          background: linear-gradient(135deg, rgba(139,92,246,0.28), rgba(124,58,237,0.22)) !important;
          border: 1px solid rgba(167,139,250,0.42) !important;
          color: #ede9fe !important;
          padding: 7px 14px !important;
          border-radius: 999px !important;
          font-size: 12px !important;
          font-weight: 800 !important;
          letter-spacing: 0.2px !important;
          backdrop-filter: blur(16px) saturate(1.2);
          box-shadow: 0 6px 18px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.14);
        }

        #es-city-exit-btn {
          pointer-events: auto;
          background: rgba(18, 20, 36, 0.82) !important;
          border: 1px solid rgba(255, 255, 255, 0.16) !important;
          color: #e2e8f0 !important;
          padding: 8px 16px !important;
          border-radius: 999px !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          cursor: pointer !important;
          backdrop-filter: blur(16px);
          box-shadow: 0 6px 18px rgba(0,0,0,0.35);
          transition: all 0.2s ease;
        }

        #es-city-exit-btn:hover {
          background: rgba(239, 68, 68, 0.88) !important;
          border-color: rgba(252, 165, 165, 0.5) !important;
          color: #fff !important;
          transform: translateY(-1px);
        }

        .es-ref-proximity-wrap {
          display: flex;
          justify-content: center;
          padding: 2px 0;
        }

        #es-city-proximity-badge {
          pointer-events: auto;
          background: rgba(18, 20, 36, 0.76) !important;
          border: 1px solid rgba(255,255,255,0.14) !important;
          color: #cbd5e1 !important;
          padding: 6px 14px !important;
          border-radius: 999px !important;
          font-size: 11.5px !important;
          font-weight: 700 !important;
          backdrop-filter: blur(16px);
          box-shadow: 0 6px 18px rgba(0,0,0,0.35);
          display: inline-flex !important;
          align-items: center !important;
          gap: 6px !important;
          transition: all 0.3s ease;
        }

        /* ETIQUETAS DOS PERSONAGENS E PLACAS DOS EDIFÍCIOS */
        .es-city-label {
          background: rgba(12, 14, 28, 0.86);
          border: 1px solid rgba(139,92,246,0.35);
          color: #e9d5ff;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 700;
          white-space: nowrap;
          backdrop-filter: blur(14px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08);
          pointer-events: none;
          letter-spacing: 0.2px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .es-city-label.me {
          background: rgba(18, 22, 48, 0.9);
          border-color: rgba(59,130,246,0.45);
          color: #dbeafe;
        }

        .es-city-sign {
          position: absolute;
          transform: translate(-50%, -50%);
          background: rgba(12, 14, 28, 0.84);
          border: 1px solid rgba(255,255,255,0.14);
          color: #fff;
          padding: 5px 11px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.3px;
          backdrop-filter: blur(12px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.35);
          pointer-events: none;
          white-space: nowrap;
        }

        /* D-PAD CIRCULAR FLUTUANTE NO CANTO INFERIOR DIREITO */
        .es-dpad-circle {
          position: absolute !important;
          right: 22px !important;
          bottom: 96px !important;
          width: 112px !important;
          height: 112px !important;
          border-radius: 50% !important;
          background: radial-gradient(circle at 35% 35%, rgba(255,255,255,0.08), rgba(18,20,36,0.74)) !important;
          border: 1px solid rgba(255,255,255,0.14) !important;
          backdrop-filter: blur(18px) saturate(1.2) !important;
          box-shadow: 0 12px 28px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12) !important;
          z-index: 25 !important;
          display: grid !important;
          grid-template-areas: ". up ." "left . right" ". down ." !important;
          place-items: center !important;
          padding: 8px !important;
        }

        .es-move-pad {
          width: 32px !important;
          height: 32px !important;
          border-radius: 50% !important;
          background: rgba(255,255,255,0.06) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          color: #cbd5e1 !important;
          font-size: 12px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          transition: all 0.15s ease !important;
          -webkit-tap-highlight-color: transparent !important;
        }

        .es-move-pad[data-dir="up"] { grid-area: up; }
        .es-move-pad[data-dir="left"] { grid-area: left; }
        .es-move-pad[data-dir="right"] { grid-area: right; }
        .es-move-pad[data-dir="down"] { grid-area: down; }

        .es-move-pad:active,
        .es-move-pad:hover {
          background: rgba(139,92,246,0.34) !important;
          color: #fff !important;
          transform: scale(0.92);
          border-color: rgba(139,92,246,0.5) !important;
        }

        /* BARRA INFERIOR FLUTUANTE SOBRE O MUNDO 3D */
        .es-ref-bottom-bar {
          position: absolute;
          left: 16px;
          right: 16px;
          bottom: max(14px, env(safe-area-inset-bottom));
          z-index: 30;
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: rgba(14, 16, 28, 0.88) !important;
          border: 1px solid rgba(255,255,255,0.10) !important;
          border-radius: 20px !important;
          backdrop-filter: blur(22px) saturate(1.25) !important;
          box-shadow: 0 16px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08) !important;
        }

        #es-city-voice-btn {
          height: 46px !important;
          padding: 0 16px !important;
          border-radius: 14px !important;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
          color: #fff !important;
          border: 1px solid rgba(255,255,255,0.14) !important;
          font-size: 13px !important;
          font-weight: 800 !important;
          letter-spacing: 0.2px !important;
          box-shadow: 0 8px 18px rgba(16,185,129,0.32) !important;
          cursor: pointer !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 6px !important;
          white-space: nowrap !important;
          transition: transform 0.15s ease !important;
        }
        #es-city-voice-btn:active { transform: scale(0.97); }

        #es-city-speak-nearby-pill {
          height: 46px !important;
          padding: 0 16px !important;
          border-radius: 14px !important;
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%) !important;
          color: #fff !important;
          border: 1px solid rgba(255,255,255,0.14) !important;
          font-size: 13px !important;
          font-weight: 800 !important;
          box-shadow: 0 8px 18px rgba(139,92,246,0.32) !important;
          cursor: pointer !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 6px !important;
          white-space: nowrap !important;
          transition: transform 0.15s ease !important;
        }
        #es-city-speak-nearby-pill:active { transform: scale(0.97); }

        .es-ref-input-group {
          flex: 1 !important;
          height: 46px !important;
          display: flex !important;
          align-items: center !important;
          background: rgba(255,255,255,0.06) !important;
          border: 1px solid rgba(255,255,255,0.10) !important;
          border-radius: 14px !important;
          padding: 0 6px 0 14px !important;
          gap: 6px !important;
          transition: border-color 0.2s ease !important;
        }

        .es-ref-input-group:focus-within {
          border-color: rgba(139,92,246,0.42) !important;
          background: rgba(255,255,255,0.08) !important;
        }

        #es-city-chat-input {
          flex: 1 !important;
          background: transparent !important;
          border: none !important;
          outline: none !important;
          color: #f8fafc !important;
          font-size: 13.5px !important;
          font-weight: 500 !important;
          width: 100% !important;
        }

        #es-city-chat-input::placeholder {
          color: #94a3b8 !important;
        }

        #es-city-send-btn {
          width: 36px !important;
          height: 36px !important;
          border-radius: 10px !important;
          background: rgba(255,255,255,0.08) !important;
          color: #e2e8f0 !important;
          border: none !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 15px !important;
          cursor: pointer !important;
          flex-shrink: 0;
          transition: all 0.15s ease !important;
        }

        #es-city-send-btn:hover {
          background: rgba(139,92,246,0.22) !important;
          color: #fff !important;
        }

        /* Balões de fala 3D acima dos avatares */
        .es-speech-bubble {
          background: #ffffff;
          color: #0f172a;
          padding: 8px 13px;
          border-radius: 14px;
          font-size: 12.5px;
          font-weight: 700;
          line-height: 1.35;
          max-width: 220px;
          text-align: center;
          margin-bottom: 8px;
          box-shadow: 0 12px 28px rgba(0,0,0,0.35);
          pointer-events: none;
          position: relative;
        }

        .es-speech-bubble::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: -5px;
          transform: translateX(-50%) rotate(45deg);
          width: 10px;
          height: 10px;
          background: #fff;
        }

        @media (max-width: 600px) {
          .es-ref-top-area { padding: max(12px, env(safe-area-inset-top)) 14px 0 14px; gap: 8px; }
          .es-ref-bottom-bar { padding: 10px; gap: 8px; left: 12px; right: 12px; bottom: max(12px, env(safe-area-inset-bottom)); border-radius: 18px; }
          #es-city-voice-btn, #es-city-speak-nearby-pill { padding: 0 12px !important; height: 42px !important; font-size: 12px !important; }
          .es-ref-input-group { height: 42px !important; }
          .es-dpad-circle { width: 100px !important; height: 100px !important; right: 14px !important; bottom: 84px !important; }
        }
      </style>

      <div id="es-city-wrapper">
        <!-- TOPO FLUTUANTE LIMPO -->
        <div class="es-ref-top-area">
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

        <!-- VIEWPORT 3D OCUPANDO 100% DO ECRÃ + D-PAD CIRCULAR -->
        <div id="es-city-viewport">
          <div id="es-city-labels-layer"></div>

          <div class="es-dpad-circle">
            <button type="button" class="es-move-pad" data-dir="up">▲</button>
            <button type="button" class="es-move-pad" data-dir="left">◀</button>
            <button type="button" class="es-move-pad" data-dir="right">▶</button>
            <button type="button" class="es-move-pad" data-dir="down">▼</button>
          </div>
        </div>

        <!-- BARRA INFERIOR COM OS 3 ITENS FIXOS -->
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

  // 👤 CONSTRUTOR DE BONECO HUMANO 3D ARTICULADO
  criarBonecoHumano3D(corCamisa = 0x8b5cf6, corCalca = 0x1e293b, corPele = 0xfde68a) {
    const THREE = window.THREE;
    const group = new THREE.Group();

    const matPele = new THREE.MeshLambertMaterial({ color: corPele });
    const matCamisa = new THREE.MeshLambertMaterial({ color: corCamisa });
    const matCalca = new THREE.MeshLambertMaterial({ color: corCalca });
    const matCabelo = new THREE.MeshLambertMaterial({ color: 0x27272a });
    const matOlho = new THREE.MeshBasicMaterial({ color: 0x09090b });

    const legGeo = new THREE.BoxGeometry(0.24, 0.75, 0.24);
    legGeo.translate(0, -0.375, 0);
    const leftLeg = new THREE.Mesh(legGeo, matCalca);
    leftLeg.position.set(-0.16, 0.75, 0);
    const rightLeg = new THREE.Mesh(legGeo, matCalca);
    rightLeg.position.set(0.16, 0.75, 0);
    group.add(leftLeg, rightLeg);

    const torsoGeo = new THREE.BoxGeometry(0.62, 0.85, 0.34);
    const torso = new THREE.Mesh(torsoGeo, matCamisa);
    torso.position.set(0, 1.18, 0);
    group.add(torso);

    const armGeo = new THREE.BoxGeometry(0.2, 0.72, 0.2);
    armGeo.translate(0, -0.32, 0);
    const leftArm = new THREE.Mesh(armGeo, matCamisa);
    leftArm.position.set(-0.43, 1.52, 0);
    const rightArm = new THREE.Mesh(armGeo, matCamisa);
    rightArm.position.set(0.43, 1.52, 0);
    group.add(leftArm, rightArm);

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

  // 🛋️ CONSTRUTOR DE MOBILIÁRIO E OBJETOS 3D ESPECÍFICOS DE CADA UM DOS 12 PRÉDIOS
  decorarInteriorEdificio3D(id, centerX, centerZ, col, bCfg) {
    const THREE = window.THREE;
    const props = new THREE.Group();
    const cX = centerX + (col * 1.8); // Posição base do balcão principal

    // Função auxiliar rápida para criar uma mesa com 2 cadeiras em coordenadas locais
    const criarConjuntoMesa = (mx, mz, corTampo = 0x78350f, corCadeira = 0x1e293b, comVela = false) => {
      const g = new THREE.Group();
      const pe = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.75, 10), new THREE.MeshLambertMaterial({ color: 0x334155 }));
      pe.position.y = 0.375;
      const tampo = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.08, 16), new THREE.MeshLambertMaterial({ color: corTampo }));
      tampo.position.y = 0.76;
      g.add(pe, tampo);

      if (comVela) {
        const vela = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
        vela.position.y = 0.86;
        g.add(vela);
      }

      [-0.85, 0.85].forEach(offsetZ => {
        const assento = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.45, 0.42), new THREE.MeshLambertMaterial({ color: corCadeira }));
        assento.position.set(0, 0.225, offsetZ);
        const encosto = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.45, 0.08), new THREE.MeshLambertMaterial({ color: corCadeira }));
        encosto.position.set(0, 0.6, offsetZ + (offsetZ > 0 ? 0.17 : -0.17));
        g.add(assento, encosto);
      });

      g.position.set(mx, 0, mz);
      return g;
    };

    switch (id) {
      case 'coffee': {
        // Balcão rústico de cafetaria (estilo Brew & Study da referência)
        const counter = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 4.4), new THREE.MeshLambertMaterial({ color: 0x451a03 }));
        counter.position.set(cX, 0.55, centerZ);
        const counterTop = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.1, 4.55), new THREE.MeshLambertMaterial({ color: 0xd97706 }));
        counterTop.position.set(cX, 1.12, centerZ);
        // Máquina de Expresso 3D + Moedor + Chávenas
        const espresso = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.6, 0.9), new THREE.MeshLambertMaterial({ color: 0x18181b }));
        espresso.position.set(cX, 1.45, centerZ - 1.1);
        const grinder = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.55, 12), new THREE.MeshLambertMaterial({ color: 0x27272a }));
        grinder.position.set(cX, 1.42, centerZ + 0.3);
        const pastryCase = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.45, 1.1), new THREE.MeshLambertMaterial({ color: 0xfde68a }));
        pastryCase.position.set(cX, 1.38, centerZ + 1.3);
        // Toldo azul-escuro na fachada da loja
        const awning = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.25, 9.6), new THREE.MeshLambertMaterial({ color: 0x1e3a8a }));
        awning.position.set(centerX - (col * 4.6), 3.7, centerZ);
        awning.rotation.z = col * 0.25;
        props.add(counter, counterTop, espresso, grinder, pastryCase, awning);
        props.add(criarConjuntoMesa(centerX - (col * 1.8), centerZ - 2.6, 0x92400e, 0x27272a));
        props.add(criarConjuntoMesa(centerX - (col * 1.8), centerZ + 2.6, 0x92400e, 0x27272a));
        break;
      }

      case 'restaurant': {
        // Balcão de receção e chef + 3 mesas com toalha vermelha e vela
        const counter = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.1, 3.8), new THREE.MeshLambertMaterial({ color: 0x881337 }));
        counter.position.set(cX, 0.55, centerZ);
        const passTop = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.1, 3.95), new THREE.MeshLambertMaterial({ color: 0xf8fafc }));
        passTop.position.set(cX, 1.12, centerZ);
        props.add(counter, passTop);
        props.add(criarConjuntoMesa(centerX - (col * 1.2), centerZ - 2.7, 0xbe123c, 0x1e293b, true));
        props.add(criarConjuntoMesa(centerX - (col * 1.2), centerZ + 2.7, 0xbe123c, 0x1e293b, true));
        props.add(criarConjuntoMesa(centerX - (col * 2.8), centerZ, 0xbe123c, 0x1e293b, true));
        break;
      }

      case 'school': {
        // Quadro verde na parede de fundo + mesa do professor + 4 carteiras de alunos
        const board = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.9, 5.4), new THREE.MeshLambertMaterial({ color: 0x064e3b }));
        board.position.set(centerX + (col * 4.75), 2.3, centerZ);
        const teacherDesk = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.85, 2.6), new THREE.MeshLambertMaterial({ color: 0x78350f }));
        teacherDesk.position.set(cX, 0.425, centerZ);
        props.add(board, teacherDesk);

        [-2.2, 2.2].forEach(dz => {
          [-0.8, -2.5].forEach(dxMult => {
            const sx = centerX + (col * dxMult);
            const sz = centerZ + dz;
            const desk = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.72, 1.1), new THREE.MeshLambertMaterial({ color: 0xd97706 }));
            desk.position.set(sx, 0.36, sz);
            const chair = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), new THREE.MeshLambertMaterial({ color: 0x1e3a8a }));
            chair.position.set(sx - (col * 0.55), 0.225, sz);
            props.add(desk, chair);
          });
        });
        break;
      }

      case 'shopping': {
        // Balcão de caixa + 2 araras de roupas coloridas + espelho de provador
        const cashier = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.05, 3.2), new THREE.MeshLambertMaterial({ color: 0xfef08a }));
        cashier.position.set(cX, 0.525, centerZ);
        const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.2, 1.4), new THREE.MeshLambertMaterial({ color: 0xbae6fd }));
        mirror.position.set(centerX + (col * 4.7), 1.2, centerZ - 2.8);
        props.add(cashier, mirror);

        [-2.6, 2.6].forEach((dz, idx) => {
          const rx = centerX - (col * 1.4);
          const rz = centerZ + dz;
          const rackBar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 8), new THREE.MeshLambertMaterial({ color: 0xe2e8f0 }));
          rackBar.rotation.x = Math.PI / 2;
          rackBar.position.set(rx, 1.45, rz);
          const garment1 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.85, 0.65), new THREE.MeshLambertMaterial({ color: idx === 0 ? 0xec4899 : 0x3b82f6 }));
          garment1.position.set(rx, 1.0, rz - 0.5);
          const garment2 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.85, 0.65), new THREE.MeshLambertMaterial({ color: idx === 0 ? 0x8b5cf6 : 0x10b981 }));
          garment2.position.set(rx, 1.0, rz + 0.5);
          props.add(rackBar, garment1, garment2);
        });
        break;
      }

      case 'home': {
        // Bancada americana + sofá de sala + tapete + mesa de centro + TV
        const island = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.05, 3.4), new THREE.MeshLambertMaterial({ color: 0xe2e8f0 }));
        island.position.set(cX, 0.525, centerZ - 1.6);
        const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.5, 2.8), new THREE.MeshLambertMaterial({ color: 0x4f46e5 }));
        sofaBase.position.set(centerX - (col * 1.5), 0.25, centerZ + 1.8);
        const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.95, 2.8), new THREE.MeshLambertMaterial({ color: 0x3730a3 }));
        sofaBack.position.set(centerX - (col * 0.95), 0.5, centerZ + 1.8);
        const rug = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshLambertMaterial({ color: 0xfde68a }));
        rug.rotation.x = -Math.PI / 2;
        rug.position.set(centerX - (col * 2.4), 0.03, centerZ + 1.8);
        const tvScreen = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.2, 2.2), new THREE.MeshBasicMaterial({ color: 0x0ea5e9 }));
        tvScreen.position.set(centerX + (col * 4.7), 1.8, centerZ + 1.8);
        props.add(island, sofaBase, sofaBack, rug, tvScreen);
        break;
      }

      case 'cinema': {
        // Grande ecrã de projeção + poltronas vermelhas de cinema + máquina de pipocas
        const screen = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.6, 6.8), new THREE.MeshBasicMaterial({ color: 0xe0f2fe }));
        screen.position.set(centerX + (col * 4.75), 2.2, centerZ);
        const popcornBox = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.5, 1.4), new THREE.MeshLambertMaterial({ color: 0xfacc15 }));
        popcornBox.position.set(cX, 0.75, centerZ + 2.8);
        const ticketCounter = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.05, 2.6), new THREE.MeshLambertMaterial({ color: 0x9d174d }));
        ticketCounter.position.set(cX, 0.525, centerZ - 1.2);
        props.add(screen, popcornBox, ticketCounter);

        [-2.2, -0.6, 1.0].forEach(zPos => {
          const seat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.75, 1.1), new THREE.MeshLambertMaterial({ color: 0xdc2626 }));
          seat.position.set(centerX - (col * 1.8), 0.375, centerZ + zPos);
          props.add(seat);
        });
        break;
      }

      case 'taxi': {
        // Cabine de despacho + Carro de Táxi Amarelo 3D estacionado!
        const booth = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.1, 2.6), new THREE.MeshLambertMaterial({ color: 0xfacc15 }));
        booth.position.set(cX, 0.55, centerZ - 1.8);

        const carGroup = new THREE.Group();
        const carBody = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.75, 4.0), new THREE.MeshLambertMaterial({ color: 0xfacc15 }));
        carBody.position.y = 0.6;
        const carCabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.65, 2.1), new THREE.MeshLambertMaterial({ color: 0x1e293b }));
        carCabin.position.set(0, 1.25, -0.1);
        const taxiSign = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.24, 0.3), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
        taxiSign.position.set(0, 1.68, -0.1);
        carGroup.add(carBody, carCabin, taxiSign);

        [[-1.05, -1.2], [1.05, -1.2], [-1.05, 1.2], [1.05, 1.2]].forEach(([wx, wz]) => {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.25, 12), new THREE.MeshLambertMaterial({ color: 0x09090b }));
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(wx, 0.35, wz);
          carGroup.add(wheel);
        });

        carGroup.position.set(centerX - (col * 1.6), 0, centerZ + 1.4);
        props.add(booth, carGroup);
        break;
      }

      case 'beach': {
        // Quiosque de madeira + faixa de mar turquesa + guarda-sol colorido + espreguiçadeiras
        const tikiBar = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.1, 3.6), new THREE.MeshLambertMaterial({ color: 0x92400e }));
        tikiBar.position.set(cX, 0.55, centerZ);
        const waterStrip = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 9.6), new THREE.MeshBasicMaterial({ color: 0x06b6d4 }));
        waterStrip.rotation.x = -Math.PI / 2;
        waterStrip.position.set(centerX + (col * 3.3), 0.03, centerZ);

        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.5, 8), new THREE.MeshLambertMaterial({ color: 0xf8fafc }));
        pole.position.set(centerX - (col * 1.8), 1.25, centerZ - 1.8);
        const umbrellaTop = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.7, 12), new THREE.MeshLambertMaterial({ color: 0xf43f5e }));
        umbrellaTop.position.set(centerX - (col * 1.8), 2.5, centerZ - 1.8);

        const lounge1 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.28, 0.8), new THREE.MeshLambertMaterial({ color: 0xf8fafc }));
        lounge1.position.set(centerX - (col * 1.8), 0.14, centerZ - 0.5);
        const lounge2 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.28, 0.8), new THREE.MeshLambertMaterial({ color: 0xf8fafc }));
        lounge2.position.set(centerX - (col * 1.8), 0.14, centerZ + 1.8);

        props.add(tikiBar, waterStrip, pole, umbrellaTop, lounge1, lounge2);
        break;
      }

      case 'hotel': {
        // Passadeira vermelha real + balcão de receção de mármore e ouro + carrinho de malas
        const redCarpet = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 2.2), new THREE.MeshLambertMaterial({ color: 0xbe123c }));
        redCarpet.rotation.x = -Math.PI / 2;
        redCarpet.position.set(centerX - (col * 1.6), 0.03, centerZ);

        const reception = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.15, 4.4), new THREE.MeshLambertMaterial({ color: 0x3b0764 }));
        reception.position.set(cX, 0.575, centerZ);
        const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 4.5), new THREE.MeshLambertMaterial({ color: 0xfacc15 }));
        goldTrim.position.set(cX, 1.16, centerZ);

        const luggageCart = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.2, 1.6), new THREE.MeshLambertMaterial({ color: 0xeab308 }));
        luggageCart.position.set(centerX - (col * 1.8), 0.2, centerZ + 2.8);
        const suitcase = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.65, 0.9), new THREE.MeshLambertMaterial({ color: 0x7c2d12 }));
        suitcase.position.set(centerX - (col * 1.8), 0.62, centerZ + 2.8);

        props.add(redCarpet, reception, goldTrim, luggageCart, suitcase);
        break;
      }

      case 'airport': {
        // Balcão de Check-in Azul + Tapete Rolante de Bagagem com Mala + Pórtico Detetor de Metais
        const desk = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.1, 3.6), new THREE.MeshLambertMaterial({ color: 0x0284c7 }));
        desk.position.set(cX, 0.55, centerZ - 1.0);
        const conveyor = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.35, 1.4), new THREE.MeshLambertMaterial({ color: 0x18181b }));
        conveyor.position.set(cX, 0.175, centerZ + 2.0);
        const bag = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.75, 0.5), new THREE.MeshLambertMaterial({ color: 0xef4444 }));
        bag.position.set(cX, 0.72, centerZ + 2.0);

        // Pórtico de segurança (Scanner)
        const archLeft = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.4, 0.25), new THREE.MeshLambertMaterial({ color: 0x94a3b8 }));
        archLeft.position.set(centerX - (col * 2.2), 1.2, centerZ - 3.2);
        const archRight = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.4, 0.25), new THREE.MeshLambertMaterial({ color: 0x94a3b8 }));
        archRight.position.set(centerX - (col * 2.2), 1.2, centerZ - 1.6);
        const archTop = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 1.85), new THREE.MeshLambertMaterial({ color: 0x38bdf8 }));
        archTop.position.set(centerX - (col * 2.2), 2.45, centerZ - 2.4);

        props.add(desk, conveyor, bag, archLeft, archRight, archTop);
        break;
      }

      case 'job': {
        // Mesa executiva de entrevista + computador portátil 3D + cadeiras de candidato + estante
        const execDesk = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.85, 3.6), new THREE.MeshLambertMaterial({ color: 0x1e1b4b }));
        execDesk.position.set(cX, 0.425, centerZ);
        const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.05, 0.6), new THREE.MeshLambertMaterial({ color: 0xcbd5e1 }));
        laptopBase.position.set(cX, 0.88, centerZ);
        const laptopScreen = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.38, 0.6), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
        laptopScreen.position.set(cX - (col * 0.2), 1.08, centerZ);

        const chair1 = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.75, 0.65), new THREE.MeshLambertMaterial({ color: 0x312e81 }));
        chair1.position.set(centerX + (col * 0.2), 0.375, centerZ - 0.8);
        const chair2 = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.75, 0.65), new THREE.MeshLambertMaterial({ color: 0x312e81 }));
        chair2.position.set(centerX + (col * 0.2), 0.375, centerZ + 0.8);

        const bookshelf = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.5, 2.4), new THREE.MeshLambertMaterial({ color: 0x451a03 }));
        bookshelf.position.set(centerX + (col * 4.5), 1.25, centerZ - 2.6);

        props.add(execDesk, laptopBase, laptopScreen, chair1, chair2, bookshelf);
        break;
      }

      case 'hospital': {
        // Mesa médica + Maca clínica branca com almofada + Biombo azul + Cruz Médica na parede
        const docDesk = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.95, 2.8), new THREE.MeshLambertMaterial({ color: 0xf8fafc }));
        docDesk.position.set(cX, 0.475, centerZ - 1.2);

        const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.65, 1.2), new THREE.MeshLambertMaterial({ color: 0xffffff }));
        bedFrame.position.set(centerX - (col * 1.4), 0.325, centerZ + 2.2);
        const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.16, 0.9), new THREE.MeshLambertMaterial({ color: 0xbae6fd }));
        pillow.position.set(centerX - (col * 0.6), 0.72, centerZ + 2.2);

        const screenDivider = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.85, 2.0), new THREE.MeshLambertMaterial({ color: 0x0284c7 }));
        screenDivider.position.set(centerX - (col * 1.4), 0.925, centerZ + 0.8);

        const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.2, 0.38), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
        crossV.position.set(centerX + (col * 4.7), 2.6, centerZ);
        const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.38, 1.2), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
        crossH.position.set(centerX + (col * 4.7), 2.6, centerZ);

        props.add(docDesk, bedFrame, pillow, screenDivider, crossV, crossH);
        break;
      }

      default: {
        const counter = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 4.2), new THREE.MeshLambertMaterial({ color: 0xf8fafc }));
        counter.position.set(cX, 0.55, centerZ);
        props.add(counter);
      }
    }

    this.scene.add(props);
  }

  // 💡 POSTES DE ILUMINAÇÃO PÚBLICA AO LONGO DA AVENIDA (IGUAL À REFERÊNCIA)
  criarPostesAvenida3D() {
    const THREE = window.THREE;
    for (let row = 0; row < 6; row++) {
      const zPos = -row * 16 + 6;
      [-5.8, 5.8].forEach(xPos => {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 4.2, 8), new THREE.MeshLambertMaterial({ color: 0x1e293b }));
        pole.position.set(xPos, 2.1, zPos);
        const lampHead = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 10), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
        lampHead.position.set(xPos, 4.3, zPos);
        this.scene.add(pole, lampHead);
      });
    }
  }

  inicializarCenaThreeJS(initialSpaceId) {
    const THREE = window.THREE;
    const viewport = document.getElementById('es-city-viewport');
    const w = viewport.clientWidth || window.innerWidth;
    const h = viewport.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x070b19);
    this.scene.fog = new THREE.FogExp2(0x070b19, 0.011);

    this.camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 220);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    viewport.insertBefore(this.renderer.domElement, viewport.firstChild);

    const ambLight = new THREE.AmbientLight(0xffffff, 0.72);
    this.scene.add(ambLight);
    const dirLight = new THREE.DirectionalLight(0xfef08a, 0.65);
    dirLight.position.set(25, 45, 20);
    this.scene.add(dirLight);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(140, 180),
      new THREE.MeshLambertMaterial({ color: 0x0f172a })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, -35);
    this.scene.add(ground);

    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 150),
      new THREE.MeshLambertMaterial({ color: 0x1e293b })
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.01, -35);
    this.scene.add(road);

    // Adiciona postes de luz ao longo da avenida central
    this.criarPostesAvenida3D();

    this.buildingsMeta = [];
    this.npcs3D.clear();
    const selectTeleport = document.getElementById('es-city-teleport');
    const registry = this.parentManager.getSpacesRegistry ? this.parentManager.getSpacesRegistry() : window.Workspace.EnglishSpaces.getSpacesRegistry();

    CITY_BUILDINGS_LAYOUT.forEach((bCfg) => {
      const spInfo = registry[bCfg.id];
      if (!spInfo) return;

      const centerX = bCfg.col * 13;
      const centerZ = -bCfg.row * 16;
      const bw = 10;
      const bd = 10;
      const bh = 4.2;

      const floorMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(bw, bd),
        new THREE.MeshStandardMaterial({ color: bCfg.color, roughness: 0.85, metalness: 0.08 })
      );
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.position.set(centerX, 0.02, centerZ);
      floorMesh.receiveShadow = true;
      this.scene.add(floorMesh);

      const shopLight = new THREE.PointLight(bCfg.npcColor || 0xf59e0b, 1.25, 15);
      shopLight.position.set(centerX, 3.2, centerZ);
      this.scene.add(shopLight);

      // Vasos de plantas decorativos nos dois lados da entrada do prédio
      [-3.8, 3.8].forEach(zSide => {
        const plantPot = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.5, 0.6),
          new THREE.MeshLambertMaterial({ color: 0x3f3f46 })
        );
        plantPot.position.set(centerX - bCfg.col * 4.5, 0.25, centerZ + zSide);
        const plantLeaves = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.8, 0.8),
          new THREE.MeshLambertMaterial({ color: 0x16a34a })
        );
        plantLeaves.position.set(centerX - bCfg.col * 4.5, 0.9, centerZ + zSide);
        this.scene.add(plantPot, plantLeaves);
      });

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

      // 🛋️ Constrói os objetos 3D, mesas, cadeiras e balcões exclusivos deste prédio!
      this.decorarInteriorEdificio3D(bCfg.id, centerX, centerZ, bCfg.col, bCfg);

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
      <div class="es-speech-bubble" style="display:none;"></div>
      <div class="es-city-label ${isYou ? 'me' : ''}">
        ${icone} <span>${textoLimpo}${sufixoRole}</span>
      </div>
    `;
    if (layer) layer.appendChild(div);
    return div;
  }

  criarPlacaEdificioHTML(titulo) {
    const layer = document.getElementById('es-city-labels-layer');
    const div = document.createElement('div');
    div.className = 'es-city-sign';
    div.textContent = titulo;
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
    entidade._bubbleTimeout = setTimeout(() => {
      bubble.style.display = 'none';
    }, duracaoMs);
  }

  iniciarLoopRenderizacao() {
    const viewport = document.getElementById('es-city-viewport');

    const animar = () => {
      if (!this.active) return;
      this.animFrame = requestAnimationFrame(animar);

      const delta = Math.min(this.clock.getDelta(), 0.1);
      const p = this.localPlayer;
      if (!p) return;

      // 1. Movimento por Teclado (WASD / Setas) ou D-Pad Circular alinhado à direção da Câmara
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
      } else if (p.targetX !== null && p.targetZ !== null) {
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

      // 2. Câmara em 3.ª Pessoa orbitando o centro exato do Boneco
      const camOffsetX = Math.sin(this.cameraYaw) * 8.2;
      const camOffsetZ = Math.cos(this.cameraYaw) * 8.2;
      this.camera.position.set(p.x + camOffsetX, 4.8, p.z + camOffsetZ);
      this.camera.lookAt(p.x, 1.4, p.z);

      // 3. Detetar automaticamente se o Avatar entrou num dos 12 Edifícios
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

      // 4. Radar de Proximidade Física
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
      const vw = viewport.clientWidth || window.innerWidth;
      const vh = viewport.clientHeight || window.innerHeight;
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

    if (this.nearbyTargets.length === 0) {
      if (window.Workspace?.mostrarAviso) {
        window.Workspace.mostrarAviso('🚶 Aproxime-se de outro aluno ou de um personagem (até acender o círculo verde no chão) para conversar!', 'warning');
      }
      return;
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

    lista.forEach(pData => {
      if (!pData || !pData.userId || pData.userId === this.localPlayer.userId) return;

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
    document.body.style.overflow = '';
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    if (this.pollInterval) clearInterval(this.pollInterval);
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

    if (this.parentManager) {
      this.parentManager.navigate('home');
    }
  }
}

Workspace.EnglishSpaces3D = new EnglishSpaces3DWorld();