// js/modulos/workspace/english-spaces-3d.js
// 🏙️ VERSÃO GLTF FECHADA + PORTA AUTOMÁTICA + MUNDO INTERIOR BLOQUEADO
// ✅ Mantém toda lógica original, só visual mais realista com fallback
// ✅ Fachada 100% fechada, só vê dentro pela vitrine, porta abre sozinha, sem atravessar parede

window.Workspace = window.Workspace || {};
const PROXIMITY_RADIUS = 6.0;
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
    // NOVOS - MUNDO FECHADO
    this.exteriorGroup = null;
    this.interiorGroups = new Map();
    this.doors = new Map();
    this.modoInterior = false;
    this.predioAtual = null;
    this.gltfLoader = null;
    this.gltfCache = new Map();
  }

  async carregarThreeJS() {
    if (window.THREE) {
      await this.carregarGLTFLoader();
      return window.THREE;
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.onload = async () => { await this.carregarGLTFLoader(); resolve(window.THREE); };
      script.onerror = reject;
      document.head.appendChild(script);
    });
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
        #es-city-exit-btn { pointer-events: auto; background: rgba(18, 20, 36, 0.82) !important; border: 1px solid rgba(255, 255, 255, 0.16) !important; color: #e2e8f0 !important; padding: 8px 16px !important; border-radius: 999px !important; font-size: 12px !important; font-weight: 700 !important; cursor: pointer !important; backdrop-filter: blur(16px); box-shadow: 0 6px 18px rgba(0,0,0,0.35); }
        .es-ref-proximity-wrap { display: flex; justify-content: center; padding: 2px 0; }
        #es-city-proximity-badge { pointer-events: auto; background: rgba(18, 20, 36, 0.76) !important; border: 1px solid rgba(255,255,255,0.14) !important; color: #cbd5e1 !important; padding: 6px 14px !important; border-radius: 999px !important; font-size: 11.5px !important; font-weight: 700 !important; backdrop-filter: blur(16px); box-shadow: 0 6px 18px rgba(0,0,0,0.28); display: inline-flex !important; align-items: center !important; gap: 6px !important; }
        .es-city-label { position: absolute; transform: translate(-50%, -100%); background: rgba(12,14,28,0.86); border: 1px solid rgba(139,92,246,0.32); color: #e9d5ff; padding: 6px 12px; border-radius: 999px; font-size: 11.5px; font-weight: 700; white-space: nowrap; backdrop-filter: blur(14px); box-shadow: 0 8px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08); pointer-events: none; }
        .es-city-label.me { background: rgba(18,22,48,0.9); border-color: rgba(59,130,246,0.4); color: #dbeafe; }
        .es-city-sign { position: absolute; transform: translate(-50%, -50%); background: rgba(12,14,28,0.82); border: 1px solid rgba(255,255,255,0.12); color: #fff; padding: 5px 10px; border-radius: 10px; font-size: 11px; font-weight: 800; letter-spacing: 0.3px; backdrop-filter: blur(12px); box-shadow: 0 6px 16px rgba(0,0,0,0.3); pointer-events: none; }
        .es-dpad-circle { position: absolute !important; right: 22px !important; bottom: 108px !important; width: 112px !important; height: 112px !important; border-radius: 50% !important; background: radial-gradient(circle at 35% 35%, rgba(255,255,255,0.08), rgba(18,20,36,0.72)) !important; border: 1px solid rgba(255,255,255,0.14) !important; backdrop-filter: blur(18px) saturate(1.2) !important; box-shadow: 0 12px 28px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12) !important; z-index: 20 !important; display: grid !important; grid-template-areas: ". up ." "left . right" ". down ." !important; place-items: center !important; padding: 8px !important; }
        .es-move-pad { width: 32px !important; height: 32px !important; border-radius: 50% !important; background: rgba(255,255,255,0.06) !important; border: 1px solid rgba(255,255,255,0.1) !important; color: #cbd5e1 !important; font-size: 12px !important; display: flex !important; align-items: center !important; justify-content: center !important; cursor: pointer !important; }
        .es-move-pad[data-dir="up"] { grid-area: up; } .es-move-pad[data-dir="left"] { grid-area: left; } .es-move-pad[data-dir="right"] { grid-area: right; } .es-move-pad[data-dir="down"] { grid-area: down; }
        .es-ref-bottom-bar { position: absolute; bottom: 0; left: 0; right: 0; z-index: 30; pointer-events: auto; display: flex; align-items: center; gap: 10px; padding: 12px; margin: 0 16px max(14px, env(safe-area-inset-bottom)) 16px; background: rgba(14, 16, 28, 0.88) !important; border: 1px solid rgba(255,255,255,0.10) !important; border-radius: 20px !important; backdrop-filter: blur(22px) saturate(1.25) !important; box-shadow: 0 16px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08) !important; }
        #es-city-voice-btn { height: 46px !important; padding: 0 16px !important; border-radius: 14px !important; background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important; color: #fff !important; border: 1px solid rgba(255,255,255,0.14) !important; font-size: 13px !important; font-weight: 800 !important; box-shadow: 0 8px 18px rgba(16,185,129,0.32) !important; cursor: pointer !important; display: inline-flex !important; align-items: center !important; gap: 6px !important; white-space: nowrap !important; }
        #es-city-speak-nearby-pill { height: 46px !important; padding: 0 16px !important; border-radius: 14px !important; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%) !important; color: #fff !important; border: 1px solid rgba(255,255,255,0.14) !important; font-size: 13px !important; font-weight: 800 !important; box-shadow: 0 8px 18px rgba(139,92,246,0.32) !important; cursor: pointer !important; display: inline-flex !important; align-items: center !important; gap: 6px !important; white-space: nowrap !important; }
        .es-ref-input-group { flex: 1 !important; height: 46px !important; display: flex !important; align-items: center !important; background: rgba(255,255,255,0.06) !important; border: 1px solid rgba(255,255,255,0.10) !important; border-radius: 14px !important; padding: 0 6px 0 14px !important; gap: 6px !important; }
        #es-city-chat-input { flex: 1 !important; background: transparent !important; border: none !important; outline: none !important; color: #f8fafc !important; font-size: 13.5px !important; font-weight: 500 !important; width: 100% !important; }
        #es-city-send-btn { width: 36px !important; height: 36px !important; border-radius: 10px !important; background: rgba(255,255,255,0.08) !important; color: #e2e8f0 !important; border: none !important; display: flex !important; align-items: center !important; justify-content: center !important; font-size: 15px !important; cursor: pointer !important; flex-shrink: 0; }
        .es-speech-bubble { position: absolute; transform: translate(-50%, -120%); background: #ffffff; color: #0f172a; padding: 10px 14px; border-radius: 16px; font-size: 13px; font-weight: 600; line-height: 1.35; max-width: 220px; box-shadow: 0 12px 28px rgba(0,0,0,0.28); pointer-events: none; z-index: 15; animation: esBubbleIn 0.22s ease; }
        .es-speech-bubble::after { content: ''; position: absolute; left: 50%; bottom: -6px; transform: translateX(-50%) rotate(45deg); width: 12px; height: 12px; background: #fff; }
        @keyframes esBubbleIn { from { opacity: 0; transform: translate(-50%, -100%) scale(0.9); } to { opacity: 1; transform: translate(-50%, -120%) scale(1); } }
        @media (max-width: 600px) { .es-ref-bottom-bar { padding: 10px; gap: 8px; margin: 0 12px max(12px, env(safe-area-inset-bottom)) 12px; border-radius: 18px; } #es-city-voice-btn, #es-city-speak-nearby-pill { padding: 0 12px !important; height: 42px !important; font-size: 12px !important; } .es-dpad-circle { width: 102px !important; height: 102px !important; right: 14px !important; bottom: 92px !important; } }
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
          <button type="button" id="es-city-speak-nearby-pill">🔊 Speak Nearby</button>
          <div class="es-ref-input-group">
            <input type="text" id="es-city-chat-input" placeholder="Type message..." autocomplete="off" />
            <button type="button" id="es-city-send-btn">➤</button>
          </div>
        </div>
      </div>
    `;
    try { await this.carregarThreeJS(); } catch (e) { return; }
    this.active = true;
    this.inicializarCenaThreeJS(initialSpaceId);
    this.configurarEventosControles();
    this.iniciarMultiplayerRealtime();
  }

  criarBonecoHumano3D(corCamisa = 0x8b5cf6, corCalca = 0x1e293b, corPele = 0xfde68a) {
    const THREE = window.THREE;
    const group = new THREE.Group();
    const tryGLTF = this.gltfCache.get('avatar');
    if (tryGLTF) {
      const clone = tryGLTF.clone(true);
      clone.traverse(o=>{ if(o.isMesh){ o.castShadow=true; }});
      group.add(clone);
    }
    const matPele = new THREE.MeshStandardMaterial({ color: corPele, roughness: 0.55, metalness: 0.05 });
    const matCamisa = new THREE.MeshStandardMaterial({ color: corCamisa, roughness: 0.7, metalness: 0.08 });
    const matCalca = new THREE.MeshStandardMaterial({ color: corCalca, roughness: 0.8, metalness: 0.1 });
    const matCabelo = new THREE.MeshStandardMaterial({ color: 0x1e1e22, roughness: 0.9 });
    const matOlho = new THREE.MeshStandardMaterial({ color: 0x0a0a0a });
    const matBrancoOlho = new THREE.MeshStandardMaterial({ color: 0xfffffe });
    const matSapato = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 });
    if (!tryGLTF) {
      const footGeo = new THREE.BoxGeometry(0.22, 0.14, 0.32);
      const leftFoot = new THREE.Mesh(footGeo, matSapato); leftFoot.position.set(-0.14, 0.07, 0.05);
      const rightFoot = new THREE.Mesh(footGeo, matSapato); rightFoot.position.set(0.14, 0.07, 0.05);
      group.add(leftFoot, rightFoot);
      const legGeo = new THREE.CylinderGeometry(0.11, 0.095, 0.82, 12); legGeo.translate(0, -0.41, 0);
      const leftLeg = new THREE.Mesh(legGeo, matCalca); leftLeg.position.set(-0.14, 0.88, 0);
      const rightLeg = new THREE.Mesh(legGeo, matCalca); rightLeg.position.set(0.14, 0.88, 0);
      group.add(leftLeg, rightLeg);
      const hipGeo = new THREE.BoxGeometry(0.52, 0.16, 0.26);
      const hip = new THREE.Mesh(hipGeo, matCalca); hip.position.set(0, 0.9, 0); group.add(hip);
      const torsoGeo = new THREE.BoxGeometry(0.52, 0.68, 0.26);
      const torso = new THREE.Mesh(torsoGeo, matCamisa); torso.position.set(0, 1.32, 0); group.add(torso);
      const shoulderGeo = new THREE.SphereGeometry(0.11, 10, 10);
      const leftShoulder = new THREE.Mesh(shoulderGeo, matCamisa); leftShoulder.position.set(-0.31, 1.6, 0);
      const rightShoulder = new THREE.Mesh(shoulderGeo, matCamisa); rightShoulder.position.set(0.31, 1.6, 0);
      group.add(leftShoulder, rightShoulder);
      const armGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.62, 10); armGeo.translate(0, -0.31, 0);
      const leftArm = new THREE.Mesh(armGeo, matPele); leftArm.position.set(-0.31, 1.6, 0);
      const rightArm = new THREE.Mesh(armGeo, matPele); rightArm.position.set(0.31, 1.6, 0);
      const sleeveGeo = new THREE.CylinderGeometry(0.09, 0.085, 0.22, 10); sleeveGeo.translate(0, -0.11, 0);
      const leftSleeve = new THREE.Mesh(sleeveGeo, matCamisa); leftSleeve.position.set(-0.31, 1.6, 0);
      const rightSleeve = new THREE.Mesh(sleeveGeo, matCamisa); rightSleeve.position.set(0.31, 1.6, 0);
      group.add(leftArm, rightArm, leftSleeve, rightSleeve);
      const neckGeo = new THREE.CylinderGeometry(0.09, 0.1, 0.14, 10);
      const neck = new THREE.Mesh(neckGeo, matPele); neck.position.set(0, 1.72, 0); group.add(neck);
      const headGroup = new THREE.Group(); headGroup.position.set(0, 1.92, 0);
      const headGeo = new THREE.SphereGeometry(0.27, 18, 18);
      const headMesh = new THREE.Mesh(headGeo, matPele);
      const hairGeo = new THREE.SphereGeometry(0.29, 16, 16, 0, Math.PI*2, 0, Math.PI*0.62);
      const hairMesh = new THREE.Mesh(hairGeo, matCabelo); hairMesh.position.set(0, 0.06, 0);
      const eyeWhiteGeo = new THREE.SphereGeometry(0.055, 10, 10);
      const eyePupilGeo = new THREE.SphereGeometry(0.022, 8, 8);
      const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, matBrancoOlho); leftEyeWhite.position.set(-0.09, 0.05, 0.22);
      const leftEyePupil = new THREE.Mesh(eyePupilGeo, matOlho); leftEyePupil.position.set(-0.09, 0.05, 0.26);
      const rightEyeWhite = new THREE.Mesh(eyeWhiteGeo, matBrancoOlho); rightEyeWhite.position.set(0.09, 0.05, 0.22);
      const rightEyePupil = new THREE.Mesh(eyePupilGeo, matOlho); rightEyePupil.position.set(0.09, 0.05, 0.26);
      headGroup.add(headMesh, hairMesh, leftEyeWhite, leftEyePupil, rightEyeWhite, rightEyePupil);
      group.add(headGroup);
      const ringGeo = new THREE.RingGeometry(0.65, 0.82, 24); ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.0 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat); ringMesh.position.y = 0.03; group.add(ringMesh);
      group.userData = { leftLeg, rightLeg, leftArm, rightArm, headGroup, ringMat, walkPhase: 0, emotePhase: 0, isEmoting: false, leftFoot, rightFoot };
      if (this.gltfLoader && !this.gltfCache.has('avatar_loading')) {
        this.gltfCache.set('avatar_loading', true);
        this.gltfLoader.load('https://threejs.org/examples/models/gltf/Soldier.glb', (gltf)=>{
          const model = gltf.scene; model.scale.set(0.32,0.32,0.32); model.position.set(0,0,0);
          this.gltfCache.set('avatar', model);
        }, null, ()=>{});
      }
      return group;
    } else {
      const ringGeo = new THREE.RingGeometry(0.65, 0.82, 24); ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.0 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat); ringMesh.position.y = 0.03; group.add(ringMesh);
      const dummyLeg = new THREE.Group(); const dummyArm = new THREE.Group(); const headGroup = new THREE.Group();
      group.userData = { leftLeg: dummyLeg, rightLeg: dummyLeg, leftArm: dummyArm, rightArm: dummyArm, headGroup, ringMat, walkPhase: 0, emotePhase: 0, isEmoting: false };
      return group;
    }
  }

  animarPassosBoneco(meshGroup, estaAndando, delta) {
    const ud = meshGroup?.userData; if (!ud || !ud.leftLeg) return;
    if (ud.isEmoting) {
      ud.emotePhase += delta * 6;
      const wave = Math.sin(ud.emotePhase) * 1.2;
      if (ud.rightArm && ud.rightArm.rotation) { ud.rightArm.rotation.x = -1.8 + wave * 0.3; ud.rightArm.rotation.z = -0.3; }
      if (ud.emotePhase > Math.PI * 2) { ud.isEmoting = false; ud.emotePhase = 0; }
      return;
    }
    if (estaAndando) {
      ud.walkPhase += delta * 10;
      const ang = Math.sin(ud.walkPhase) * 0.55;
      if (ud.leftLeg.rotation) { ud.leftLeg.rotation.x = ang; ud.rightLeg.rotation.x = -ang; ud.leftArm.rotation.x = -ang * 0.8; ud.rightArm.rotation.x = ang * 0.8; }
    } else {
      if (ud.leftLeg.rotation) { ud.leftLeg.rotation.x *= 0.85; ud.rightLeg.rotation.x *= 0.85; ud.leftArm.rotation.x *= 0.85; ud.rightArm.rotation.x *= 0.85; }
    }
  }

  animarEmote(entidade, tipo = 'wave') {
    if (!entidade?.mesh?.userData) return;
    entidade.mesh.userData.isEmoting = true;
    entidade.mesh.userData.emotePhase = 0;
  }

  // COLISÃO 100% FECHADA - NENHUM BONECO ATRAVESSA PAREDE
  podeMoverPara(newX, newZ, oldX, oldZ) {
    const doorHalfWidth = 1.05;
    const wallThick = 0.38;
    const doorDepth = 0.85;
    for (const b of this.buildingsMeta) {
      const insideNew = newX > b.minX + 0.25 && newX < b.maxX - 0.25 && newZ > b.minZ + 0.25 && newZ < b.maxZ - 0.25;
      const insideOld = oldX > b.minX + 0.25 && oldX < b.maxX - 0.25 && oldZ > b.minZ + 0.25 && oldZ < b.maxZ - 0.25;
      if (insideNew === insideOld) {
        if (!insideNew) {
          // Fora - verifica se está colidindo com qualquer parede da fachada
          const walls = this.buildingMeshes.get(b.id)?.walls || [];
          for (const w of walls) {
            const wp = w.position; const isFront = Math.abs(wp.x - b.frontX) < 0.5;
            if (isFront) {
              if (Math.abs(newZ - b.doorZ) < doorHalfWidth) continue;
              if (Math.abs(newX - b.frontX) < wallThick && newZ >= b.minZ && newZ <= b.maxZ) return false;
            }
            if (Math.abs(newX - wp.x) < 1.2 && Math.abs(newZ - wp.z) < 3.0 && !isFront) {
              if (Math.abs(newX - b.centerX) < b.bw/2 -0.3 && Math.abs(newZ - b.centerZ) < b.bd/2 -0.3) {}
              else {
                // parede lateral ou traseira
                const dx = Math.abs(newX - wp.x); const dz = Math.abs(newZ - wp.z);
                if (dx < 0.8 && dz < (b.bw/2)) return false;
              }
            }
          }
        }
        continue;
      }
      const frontX = b.frontX;
      const doorZ = b.doorZ;
      const door = this.doors.get(b.id);
      const isDoorOpen = door ? door.userData.isOpen : false;
      const crossingDoor = Math.abs(newZ - doorZ) < doorHalfWidth && Math.abs(oldX - frontX) < 2.5;
      const nearDoor = Math.abs(newX - frontX) < doorDepth || Math.abs(oldX - frontX) < doorDepth;
      if (crossingDoor && nearDoor) {
        if (!isDoorOpen) return false;
        if (b.id !== this.lastDoorEnter) {
          this.tocarSinoPorta();
          this.lastDoorEnter = b.id;
          setTimeout(()=>{ if(this.lastDoorEnter===b.id) this.lastDoorEnter=null; }, 1200);
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
    } catch(e){}
  }

  decorarInteriorEdificio3D(id, centerX, centerZ, col, bCfg) {
    const THREE = window.THREE;
    const cX = centerX + (col * 1.8);
    const props = new THREE.Group();
    const makeClickable = (mesh, name) => { mesh.userData.clickable=true; mesh.userData.englishName=name; mesh.userData.xp=15; this.clickableObjects.push(mesh); return mesh; };
    switch(id){
      case 'coffee': {
        const counter = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 4.2), new THREE.MeshLambertMaterial({ color: 0xf8fafc })), 'Counter'); counter.position.set(cX, 0.55, centerZ);
        const espresso = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.7), new THREE.MeshLambertMaterial({ color: 0x1f2937 })), 'Espresso Machine'); espresso.position.set(cX, 1.25, centerZ - 0.8);
        props.add(counter, espresso); break;
      }
      case 'school': {
        const board = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.0, 4.0), new THREE.MeshBasicMaterial({ color: 0x14532d })), 'Blackboard'); board.position.set(centerX + (col * 4.6), 1.6, centerZ);
        props.add(board); break;
      }
      default: {
        const counter = makeClickable(new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 4.2), new THREE.MeshLambertMaterial({ color: 0xf8fafc })), 'Counter'); counter.position.set(cX, 0.55, centerZ); props.add(counter);
      }
    }
    this.scene.add(props);
    if (!this.interiorGroups.has(id)) this.interiorGroups.set(id, new THREE.Group());
    this.interiorGroups.get(id).add(props);
  }

  criarPostesAvenida3D() {
    const THREE = window.THREE;
    this.posteLights = [];
    for (let row=0; row<6; row++) {
      const zPos = -row*16+6;
      [-5.8,5.8].forEach(xPos=>{
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.12,4.2,8), new THREE.MeshLambertMaterial({ color:0x1e293b })); pole.position.set(xPos,2.1,zPos);
        const lampHead = new THREE.Mesh(new THREE.SphereGeometry(0.28,10,10), new THREE.MeshBasicMaterial({ color:0xfef08a })); lampHead.position.set(xPos,4.3,zPos);
        const light = new THREE.PointLight(0xfef08a,0.0,18); light.position.set(xPos,4.3,zPos);
        this.exteriorGroup.add(pole, lampHead); this.scene.add(light); this.posteLights.push({ light, lampHead });
      });
    }
  }

  criarCeuRealista() {
    const THREE = window.THREE;
    const sunGeo = new THREE.SphereGeometry(2.2,24,24); const sunMat = new THREE.MeshBasicMaterial({ color:0xffd60a }); this.sunMesh = new THREE.Mesh(sunGeo,sunMat); this.scene.add(this.sunMesh);
    const moonGeo = new THREE.SphereGeometry(1.6,20,20); const moonMat = new THREE.MeshBasicMaterial({ color:0xe2e8f0 }); this.moonMesh = new THREE.Mesh(moonGeo,moonMat); this.scene.add(this.moonMesh);
    this.starsGroup = new THREE.Group(); for(let i=0;i<220;i++){ const star = new THREE.Mesh(new THREE.SphereGeometry(0.06+Math.random()*0.08,4,4), new THREE.MeshBasicMaterial({ color:0xffffff })); const r=85+Math.random()*30; const theta=Math.random()*Math.PI*2; const phi=Math.random()*Math.PI*0.6+0.1; star.position.set(r*Math.sin(phi)*Math.cos(theta),25+r*Math.cos(phi)*0.6,r*Math.sin(phi)*Math.sin(theta)-35); star.userData.twinkle=Math.random()*Math.PI*2; this.starsGroup.add(star); } this.scene.add(this.starsGroup);
    this.cloudsGroup = new THREE.Group(); for(let c=0;c<8;c++){ const cloud=new THREE.Group(); const cloudMat=new THREE.MeshLambertMaterial({ color:0xffffff, transparent:true, opacity:0.82 }); for(let j=0;j<4;j++){ const puff=new THREE.Mesh(new THREE.SphereGeometry(0.9+Math.random()*0.7,8,8),cloudMat); puff.position.set((Math.random()-0.5)*2.5,(Math.random()-0.5)*0.6,(Math.random()-0.5)*2.5); cloud.add(puff); } cloud.position.set((Math.random()-0.5)*90,22+Math.random()*10,(Math.random()-0.5)*100-35); cloud.userData.speed=0.2+Math.random()*0.4; this.cloudsGroup.add(cloud); } this.scene.add(this.cloudsGroup);
  }

  atualizarCicloDiaNoite() {
    const hour = new Date().getHours(); const THREE = window.THREE; let mode='day'; if(hour>=17&&hour<18) mode='sunset'; else if(hour>=18||hour<6) mode='night'; else mode='day';
    if(mode==='day'){ this.scene.background=new THREE.Color(0x87ceeb); this.scene.fog=new THREE.FogExp2(0x87ceeb,0.007); if(this.ambientLight){this.ambientLight.color.setHex(0xffffff); this.ambientLight.intensity=0.85;} if(this.dirLight){this.dirLight.color.setHex(0xffffff); this.dirLight.intensity=0.9; this.dirLight.position.set(25,55,20);} if(this.sunMesh){this.sunMesh.visible=true; this.sunMesh.position.set(20,45,-40);} if(this.moonMesh) this.moonMesh.visible=false; if(this.starsGroup) this.starsGroup.visible=false; if(this.cloudsGroup) this.cloudsGroup.visible=true; this.posteLights.forEach(p=>{p.light.intensity=0; p.lampHead.material.color.setHex(0x334155);}); }
    else if(mode==='sunset'){ this.scene.background=new THREE.Color(0xff8c42); this.scene.fog=new THREE.FogExp2(0xff8c42,0.010); if(this.ambientLight){this.ambientLight.color.setHex(0xffb26b); this.ambientLight.intensity=0.65;} if(this.dirLight){this.dirLight.color.setHex(0xff9a4d); this.dirLight.intensity=0.55; this.dirLight.position.set(35,8,-15);} if(this.sunMesh){this.sunMesh.visible=true; this.sunMesh.position.set(55,9,-25); this.sunMesh.material.color.setHex(0xff6b35);} if(this.moonMesh) this.moonMesh.visible=false; if(this.starsGroup) this.starsGroup.visible=false; if(this.cloudsGroup) this.cloudsGroup.visible=true; this.posteLights.forEach(p=>{p.light.intensity=0.6; p.lampHead.material.color.setHex(0xfef08a);}); }
    else { this.scene.background=new THREE.Color(0x070b1a); this.scene.fog=new THREE.FogExp2(0x070b1a,0.012); if(this.ambientLight){this.ambientLight.color.setHex(0x8b9dc3); this.ambientLight.intensity=0.38;} if(this.dirLight){this.dirLight.color.setHex(0x8b9dc3); this.dirLight.intensity=0.22; this.dirLight.position.set(-20,35,15);} if(this.sunMesh) this.sunMesh.visible=false; if(this.moonMesh){this.moonMesh.visible=true; this.moonMesh.position.set(-18,32,-35);} if(this.starsGroup){this.starsGroup.visible=true; this.starsGroup.children.forEach(s=>{s.userData.twinkle+=0.04; s.material.opacity=0.6+Math.sin(s.userData.twinkle)*0.4; s.material.transparent=true;});} if(this.cloudsGroup) this.cloudsGroup.visible=true; this.posteLights.forEach(p=>{p.light.intensity=1.4; p.lampHead.material.color.setHex(0xfef08a);}); }
  }

  criarAvenidaRealista() {
    const THREE = window.THREE;
    const sidewalkMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const leftSidewalk = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 160), sidewalkMat); leftSidewalk.rotation.x=-Math.PI/2; leftSidewalk.position.set(-8.5,0.04,-35);
    const rightSidewalk = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 160), sidewalkMat); rightSidewalk.rotation.x=-Math.PI/2; rightSidewalk.position.set(8.5,0.04,-35);
    this.exteriorGroup.add(leftSidewalk, rightSidewalk);
    const laneMat = new THREE.MeshBasicMaterial({ color:0xf8fafc });
    for(let z=-75; z<15; z+=6){ const dash=new THREE.Mesh(new THREE.PlaneGeometry(0.25,1.8),laneMat); dash.rotation.x=-Math.PI/2; dash.position.set(0,0.06,z); this.exteriorGroup.add(dash); }
    for(let row=0; row<6; row++){ const zPos=-row*16; for(let i=-4;i<5;i++){ const stripe=new THREE.Mesh(new THREE.PlaneGeometry(0.35,2.6),laneMat); stripe.rotation.x=-Math.PI/2; stripe.position.set(i*0.9,0.07,zPos); this.exteriorGroup.add(stripe); } }
  }

  criarTransitoInteligente() {
    const THREE = window.THREE; this.cars=[];
    const carColors=[0xef4444,0x3b82f6,0xf8fafc,0x1f2937];
    for(let i=0;i<6;i++){ const carGroup=new THREE.Group(); const body=new THREE.Mesh(new THREE.BoxGeometry(1.8,0.7,3.6), new THREE.MeshLambertMaterial({ color: carColors[i%carColors.length] })); body.position.y=0.55; const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.55,1.8), new THREE.MeshLambertMaterial({ color:0x0f172a })); cabin.position.set(0,1.05,-0.1); carGroup.add(body,cabin); const lane=i%2===0?1.6:-1.6; const dir=i%2===0?-1:1; carGroup.position.set(lane,0,-80+i*18); carGroup.rotation.y=dir===1?0:Math.PI; carGroup.userData={ lane, dir, speed:3.5+Math.random()*1.5, baseSpeed:3.5+Math.random()*1.5, stopped:false }; this.exteriorGroup.add(carGroup); this.cars.push(carGroup); }
  }

  criarPedestres() {
    const THREE = window.THREE; this.pedestrians=[];
    const phrases=["Beautiful night, isn't it?","Lovely day today!","Hi there! Nice weather!","Good evening!","Hey! How's it going?"];
    for(let i=0;i<8;i++){ const isLeft=i%2===0; const pedMesh=this.criarBonecoHumano3D(isLeft?0xf59e0b:0x38bdf8,0x1e293b,0xfde68a); const x=isLeft?-8.5+(Math.random()-0.5):8.5+(Math.random()-0.5); const z=-90+Math.random()*100; pedMesh.position.set(x,0,z); pedMesh.rotation.y=Math.random()>0.5?0:Math.PI; const labelEl=this.criarEtiquetaHTML(`Pedestrian`,'PEDESTRIAN','#facc15'); this.exteriorGroup.add(pedMesh); this.pedestrians.push({ mesh:pedMesh, labelEl, x, z, dir: pedMesh.rotation.y===0?1:-1, speed:1.2+Math.random(), bubbleText: phrases[Math.floor(Math.random()*phrases.length)], lastGreet:0, isLeft }); }
  }

  criarOutdoorsInteligentes() {
    const THREE = window.THREE; const expressions=["Expression: 'Break a leg!'", "Word: Serendipity", "Leader: Paulo - 1,250 XP"];
    for(let row=0;row<3;row++){ const zPos=-row*32-8; [-11.5,11.5].forEach((xPos,idx)=>{ const canvas=document.createElement('canvas'); canvas.width=512; canvas.height=256; const ctx=canvas.getContext('2d'); ctx.fillStyle='#0f172a'; ctx.fillRect(0,0,512,256); ctx.fillStyle='#8b5cf6'; ctx.font='bold 26px Inter'; ctx.fillText(expressions[(row+idx)%expressions.length],20,60); ctx.fillStyle='#e2e8f0'; ctx.font='18px Inter'; ctx.fillText('Walk closer to chat in English!',20,110); const tex=new THREE.CanvasTexture(canvas); const board=new THREE.Mesh(new THREE.PlaneGeometry(3.2,1.6), new THREE.MeshBasicMaterial({ map:tex })); board.position.set(xPos,2.0,zPos); board.rotation.y=xPos<0?Math.PI/2.5:-Math.PI/2.5; this.exteriorGroup.add(board); this.outdoors.push(board); }); }
  }

  criarLetreiro3D(texto, pos) {
    const THREE = window.THREE;
    const canvas = document.createElement('canvas'); canvas.width=512; canvas.height=128;
    const ctx=canvas.getContext('2d'); ctx.fillStyle='#0f0f1a'; ctx.fillRect(0,0,512,128); ctx.strokeStyle='#8b5cf6'; ctx.lineWidth=4; ctx.strokeRect(2,2,508,124); ctx.fillStyle='#ffffff'; ctx.font='900 38px Inter'; ctx.textAlign='center'; ctx.fillText(texto.toUpperCase(),256,78);
    const tex=new THREE.CanvasTexture(canvas); const mesh=new THREE.Mesh(new THREE.PlaneGeometry(3.8,0.95), new THREE.MeshBasicMaterial({ map:tex })); mesh.position.copy(pos); this.scene.add(mesh); return mesh;
  }

  inicializarCenaThreeJS(initialSpaceId) {
    const THREE = window.THREE;
    const viewport = document.getElementById('es-city-viewport');
    const w = viewport.clientWidth || window.innerWidth; const h = viewport.clientHeight || window.innerHeight;
    this.scene = new THREE.Scene(); this.clock = new THREE.Clock();
    this.exteriorGroup = new THREE.Group(); this.scene.add(this.exteriorGroup);
    this.ambientLight = new THREE.AmbientLight(0xffffff,0.72); this.scene.add(this.ambientLight);
    this.dirLight = new THREE.DirectionalLight(0xfef08a,0.65); this.dirLight.position.set(25,45,20); this.dirLight.castShadow=true; this.scene.add(this.dirLight);
    this.camera = new THREE.PerspectiveCamera(58, w/h, 0.1, 300);
    this.renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true }); this.renderer.setSize(w,h); this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)); this.renderer.shadowMap.enabled=true; this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    viewport.insertBefore(this.renderer.domElement, viewport.firstChild);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 200), new THREE.MeshLambertMaterial({ color:0x0f172a })); ground.rotation.x=-Math.PI/2; ground.position.set(0,0,-35); ground.receiveShadow=true; this.exteriorGroup.add(ground);
    const road = new THREE.Mesh(new THREE.PlaneGeometry(10, 150), new THREE.MeshLambertMaterial({ color:0x1e293b })); road.rotation.x=-Math.PI/2; road.position.set(0,0.01,-35); this.exteriorGroup.add(road);
    this.criarCeuRealista(); this.criarAvenidaRealista(); this.criarPostesAvenida3D(); this.criarTransitoInteligente(); this.criarPedestres(); this.criarOutdoorsInteligentes(); this.atualizarCicloDiaNoite(); setInterval(()=>this.atualizarCicloDiaNoite(),60000);
    this.buildingsMeta=[]; this.buildingMeshes.clear(); this.npcs3D.clear(); this.clickableObjects=[]; this.doors.clear(); this.interiorGroups.clear();
    const selectTeleport=document.getElementById('es-city-teleport');
    const registry=this.parentManager.getSpacesRegistry ? this.parentManager.getSpacesRegistry() : window.Workspace.EnglishSpaces.getSpacesRegistry();
    CITY_BUILDINGS_LAYOUT.forEach((bCfg)=>{
      const spInfo=registry[bCfg.id]; if(!spInfo) return;
      const centerX=bCfg.col*16; const centerZ=-bCfg.row*16; const bw=10; const bd=10; const bh=4.4; const frontX=centerX - bCfg.col*(bw/2); const doorHalfW=1.05;
      const floorMesh=new THREE.Mesh(new THREE.PlaneGeometry(bw,bd), new THREE.MeshStandardMaterial({ color:bCfg.color, roughness:0.85, metalness:0.08 })); floorMesh.rotation.x=-Math.PI/2; floorMesh.position.set(centerX,0.02,centerZ); floorMesh.receiveShadow=true; this.scene.add(floorMesh);
      const shopLight=new THREE.PointLight(bCfg.npcColor||0xf59e0b,1.25,15); shopLight.position.set(centerX,3.2,centerZ); this.scene.add(shopLight);
      const wallMat=new THREE.MeshStandardMaterial({ color:bCfg.roof, roughness:0.85, metalness:0.1 });
      const wallMatsTransp=[];
      const backWall=new THREE.Mesh(new THREE.BoxGeometry(bw,bh,0.38), wallMat.clone()); backWall.position.set(centerX + (bCfg.col*(bw/2)), bh/2, centerZ); backWall.rotation.y=Math.PI/2; backWall.castShadow=true; this.scene.add(backWall); wallMatsTransp.push(backWall);
      const sideWall1=new THREE.Mesh(new THREE.BoxGeometry(bw,bh,0.38), wallMat.clone()); sideWall1.position.set(centerX,bh/2,centerZ-bd/2); sideWall1.castShadow=true; this.scene.add(sideWall1); wallMatsTransp.push(sideWall1);
      const sideWall2=new THREE.Mesh(new THREE.BoxGeometry(bw,bh,0.38), wallMat.clone()); sideWall2.position.set(centerX,bh/2,centerZ+bd/2); sideWall2.castShadow=true; this.scene.add(sideWall2); wallMatsTransp.push(sideWall2);
      const frontLeftW=(bd/2 - doorHalfW -0.15);
      const frontLeft=new THREE.Mesh(new THREE.BoxGeometry(frontLeftW,bh,0.38), wallMat.clone()); frontLeft.position.set(frontX,bh/2,centerZ-(doorHalfW+frontLeftW/2+0.15)); frontLeft.castShadow=true; this.scene.add(frontLeft); wallMatsTransp.push(frontLeft);
      const frontRight=new THREE.Mesh(new THREE.BoxGeometry(frontLeftW,bh,0.38), wallMat.clone()); frontRight.position.set(frontX,bh/2,centerZ+(doorHalfW+frontLeftW/2+0.15)); frontRight.castShadow=true; this.scene.add(frontRight); wallMatsTransp.push(frontRight);
      const topDoor=new THREE.Mesh(new THREE.BoxGeometry(0.38,bh-2.7,doorHalfW*2), wallMat.clone()); topDoor.position.set(frontX,(2.7+bh)/2,centerZ); topDoor.castShadow=true; this.scene.add(topDoor); wallMatsTransp.push(topDoor);
      const roof=new THREE.Mesh(new THREE.BoxGeometry(bw+0.6,0.36,bd+0.6), new THREE.MeshStandardMaterial({ color:bCfg.roof, roughness:0.9 })); roof.position.set(centerX,bh+0.18,centerZ); roof.castShadow=true; this.scene.add(roof); wallMatsTransp.push(roof);
      // PORTA QUE ABRE SOZINHA
      const doorGroup=new THREE.Group(); doorGroup.position.set(frontX,0,centerZ);
      const doorMesh=new THREE.Mesh(new THREE.BoxGeometry(0.12,2.6,1.95), new THREE.MeshStandardMaterial({ color:0x3f3f46, roughness:0.6, metalness:0.2 })); doorMesh.position.set(0,1.3,0); doorMesh.castShadow=true;
      const doorHandle=new THREE.Mesh(new THREE.SphereGeometry(0.09,8,8), new THREE.MeshStandardMaterial({ color:0xfacc15 })); doorHandle.position.set(0.08,1.3,0.75); doorMesh.add(doorHandle);
      doorGroup.add(doorMesh);
      doorGroup.userData={ isOpen:false, isOpening:false, baseX:frontX, baseZ:centerZ, openAngle:0, doorMesh };
      this.scene.add(doorGroup); this.doors.set(bCfg.id, doorGroup);
      // VITRINE SÓ ONDE TEM
      if(bCfg.id==='shopping' || bCfg.id==='home' || bCfg.id==='coffee'){
        const vitrineGlass=new THREE.Mesh(new THREE.PlaneGeometry(2.4,2.2), new THREE.MeshStandardMaterial({ color:0xffffff, transparent:true, opacity:0.18, roughness:0.05, metalness:0.1 })); vitrineGlass.position.set(frontX + (bCfg.col*0.08),1.4,centerZ+2.6); vitrineGlass.rotation.y=bCfg.col===-1?Math.PI/2:-Math.PI/2; this.scene.add(vitrineGlass);
      }
      const signPos=new THREE.Vector3(frontX + (bCfg.col*0.6), bh+0.85, centerZ); this.criarLetreiro3D(spInfo.name, signPos);
      this.buildingMeshes.set(bCfg.id, { walls: wallMatsTransp, roof, frontX, doorZ:centerZ, centerX, centerZ, bw, bd, bh, floor: floorMesh, doorGroup });
      this.decorarInteriorEdificio3D(bCfg.id, centerX, centerZ, bCfg.col, bCfg);
      const npcX=centerX + (bCfg.col*3.1); const npcZ=centerZ;
      const npcMesh=this.criarBonecoHumano3D(bCfg.npcColor,0x0f172a,0xfde68a); npcMesh.position.set(npcX,0,npcZ); npcMesh.rotation.y=bCfg.col===-1?(Math.PI/2):(-Math.PI/2); this.scene.add(npcMesh);
      const labelEl=this.criarEtiquetaHTML(`${spInfo.emoji} ${spInfo.npcName}`,'AI HOST','#10b981');
      const signEl=this.criarPlacaEdificioHTML(`${spInfo.emoji} ${spInfo.name}`);
      this.npcs3D.set(bCfg.id, { id:bCfg.id, space:spInfo, name:spInfo.npcName, x:npcX, z:npcZ, mesh:npcMesh, labelEl, bubbleText: spInfo.dialogues?.start?.text || 'Welcome!' });
      this.buildingsMeta.push({ id:bCfg.id, space:spInfo, centerX, centerZ, bw, bd, bh, minX:centerX-bw/2, maxX:centerX+bw/2, minZ:centerZ-bd/2, maxZ:centerZ+bd/2, frontX, doorZ:centerZ, signPos:new THREE.Vector3(frontX - (bCfg.col*0.5), bh+0.8, centerZ), signEl });
      if(selectTeleport){ const opt=document.createElement('option'); opt.value=bCfg.id; opt.textContent=`${spInfo.emoji} ${spInfo.name}`; selectTeleport.appendChild(opt); }
    });
    const u=window.Workspace?.usuario||{}; const meuNome=u.nome||u.login||'You'; const meuId=String(u.id||'local_'+Date.now());
    const startBuilding=this.buildingsMeta.find(b=>b.id===initialSpaceId)||this.buildingsMeta[0];
    const playerMesh=this.criarBonecoHumano3D(0x8b5cf6,0x1e1b4b,0xfde68a);
    const initialX=startBuilding?(startBuilding.centerX*0.55):0; const initialZ=startBuilding?startBuilding.centerZ:0;
    playerMesh.position.set(initialX,0,initialZ); this.scene.add(playerMesh);
    const myLabel=this.criarEtiquetaHTML(`${meuNome} (You)`, this.parentManager.state.role||'STUDENT','#8b5cf6');
    this.localPlayer={ userId:meuId, nome:meuNome, avatar:u.avatar||null, role:this.parentManager.state.role||'STUDENT', x:initialX, z:initialZ, targetX:null, targetZ:null, rotY:0, mesh:playerMesh, labelEl:myLabel, bubbleText:'' };
    this.iniciarLoopRenderizacao();
  }

  criarEtiquetaHTML(nome, role, corBadge) {
    const layer=document.getElementById('es-city-labels-layer'); const div=document.createElement('div');
    div.style.cssText='position:absolute; transform:translate(-50%, -100%); display:flex; flex-direction:column; align-items:center; pointer-events:none; transition:opacity 0.15s;';
    const textoLimpo=String(nome||'').replace(/^[^\w\s]+/, '').trim(); const isYou=textoLimpo.includes('(You)');
    const icone=isYou?'<span style="color:#38bdf8;">📍</span>':'<span style="color:#c084fc;">✨</span>';
    const sufixoRole=isYou?'':` <span style="color:#a1a1aa; font-weight:600;">[${role}]</span>`;
    div.innerHTML=`<div class="es-speech-bubble" style="display:none;"></div><div class="es-city-label ${isYou?'me':''}">${icone} <span>${textoLimpo}${sufixoRole}</span></div>`;
    if(layer) layer.appendChild(div); return div;
  }

  criarPlacaEdificioHTML(titulo) {
    const layer=document.getElementById('es-city-labels-layer'); const div=document.createElement('div'); div.className='es-city-sign'; div.textContent=titulo; if(layer) layer.appendChild(div); return div;
  }

  mostrarBalaoNoBoneco(entidade, texto, duracaoMs=6000) {
    if(!entidade||!entidade.labelEl) return; const bubble=entidade.labelEl.querySelector('.es-speech-bubble'); if(!bubble) return;
    bubble.textContent=texto; bubble.style.display='block'; clearTimeout(entidade._bubbleTimeout);
    entidade._bubbleTimeout=setTimeout(()=>{ bubble.style.display='none'; }, duracaoMs);
  }

  // PORTA AUTOMÁTICA
  atualizarPortas() {
    if(!this.localPlayer) return;
    this.doors.forEach((doorGroup, id)=>{
      const b=this.buildingsMeta.find(x=>x.id===id); if(!b) return;
      const dist=Math.hypot(b.frontX - this.localPlayer.x, b.doorZ - this.localPlayer.z);
      const shouldOpen=dist<2.6;
      if(shouldOpen && !doorGroup.userData.isOpen){
        doorGroup.userData.isOpen=true; doorGroup.userData.isOpening=true;
      } else if(!shouldOpen && doorGroup.userData.isOpen && !this.modoInterior){
        doorGroup.userData.isOpen=false; doorGroup.userData.isOpening=false;
      }
      const targetAngle=doorGroup.userData.isOpen? (b.col===-1? Math.PI/2 : -Math.PI/2) : 0;
      doorGroup.userData.openAngle += (targetAngle - doorGroup.userData.openAngle)*0.12;
      doorGroup.rotation.y=doorGroup.userData.openAngle;
    });
  }

  entrarModoInterior(id) {
    if(this.modoInterior && this.predioAtual===id) return;
    this.modoInterior=true; this.predioAtual=id;
    this.exteriorGroup.visible=false;
    this.cars.forEach(c=>c.visible=false);
    this.pedestrians.forEach(p=>{p.mesh.visible=false; if(p.labelEl) p.labelEl.style.display='none';});
    this.buildingsMeta.forEach(b=>{
      if(b.id!==id){
        const meshes=this.buildingMeshes.get(b.id);
        if(meshes){ meshes.walls.forEach(w=>w.visible=false); if(meshes.roof) meshes.roof.visible=false; if(meshes.floor) meshes.floor.visible=false; }
        const door=this.doors.get(b.id); if(door) door.visible=false;
        const npc=this.npcs3D.get(b.id); if(npc){ npc.mesh.visible=false; if(npc.labelEl) npc.labelEl.style.display='none'; if(b.signEl) b.signEl.style.display='none'; }
      }
    });
    this.currentZoneId=id; this.atualizarHudZonaLocal(id);
  }

  sairModoInterior() {
    if(!this.modoInterior) return;
    this.modoInterior=false; this.predioAtual=null;
    this.exteriorGroup.visible=true;
    this.cars.forEach(c=>c.visible=true);
    this.pedestrians.forEach(p=>{p.mesh.visible=true; if(p.labelEl) p.labelEl.style.display='flex';});
    this.buildingsMeta.forEach(b=>{
      const meshes=this.buildingMeshes.get(b.id);
      if(meshes){ meshes.walls.forEach(w=>w.visible=true); if(meshes.roof) meshes.roof.visible=true; if(meshes.floor) meshes.floor.visible=true; }
      const door=this.doors.get(b.id); if(door) door.visible=true;
      const npc=this.npcs3D.get(b.id); if(npc){ npc.mesh.visible=true; if(npc.labelEl) npc.labelEl.style.display='flex'; if(b.signEl) b.signEl.style.display='block'; }
    });
    this.currentZoneId='street'; this.atualizarHudZonaLocal('street');
  }

  iniciarLoopRenderizacao() {
    const viewport=document.getElementById('es-city-viewport');
    const animar=()=>{
      if(!this.active) return; this.animFrame=requestAnimationFrame(animar);
      const delta=Math.min(this.clock.getDelta(),0.1);
      const p=this.localPlayer; if(!p) return;
      let inputRight=0; let inputForward=0;
      if(this.keys['ArrowUp']||this.keys['KeyW']||this.keys['pad_up']) inputForward+=1;
      if(this.keys['ArrowDown']||this.keys['KeyS']||this.keys['pad_down']) inputForward-=1;
      if(this.keys['ArrowLeft']||this.keys['KeyA']||this.keys['pad_left']) inputRight-=1;
      if(this.keys['ArrowRight']||this.keys['KeyD']||this.keys['pad_right']) inputRight+=1;
      let estaAndando=false; const speed=7.2;
      if(inputRight!==0||inputForward!==0){
        p.targetX=null; p.targetZ=null;
        const len=Math.hypot(inputRight,inputForward); const normR=inputRight/len; const normF=inputForward/len;
        const sinY=Math.sin(this.cameraYaw); const cosY=Math.cos(this.cameraYaw);
        const worldDirX=normR*cosY - normF*sinY; const worldDirZ=-normR*sinY - normF*cosY;
        const nextX=p.x + worldDirX*speed*delta; const nextZ=p.z + worldDirZ*speed*delta;
        if(this.podeMoverPara(nextX,nextZ,p.x,p.z)){ p.x=Math.max(-24,Math.min(24,nextX)); p.z=Math.max(-98,Math.min(18,nextZ)); p.rotY=Math.atan2(worldDirX,worldDirZ); estaAndando=true; }
      } else if(p.targetX!==null&&p.targetZ!==null){
        const dx=p.targetX-p.x; const dz=p.targetZ-p.z; const dist=Math.hypot(dx,dz);
        if(dist>0.2){ const step=Math.min(dist,speed*delta); const nx=p.x+(dx/dist)*step; const nz=p.z+(dz/dist)*step; if(this.podeMoverPara(nx,nz,p.x,p.z)){ p.x=nx; p.z=nz; p.rotY=Math.atan2(dx,dz); estaAndando=true; } else { p.targetX=null; p.targetZ=null; } } else { p.targetX=null; p.targetZ=null; }
      }
      p.mesh.position.set(p.x,0,p.z); p.mesh.rotation.y=p.rotY; this.animarPassosBoneco(p.mesh,estaAndando,delta);
      const yaw=this.cameraYaw; const pitch=this.cameraPitch; const dist=8.2+ pitch*0.6; const camHeight=4.8 - pitch*2.4; const camOffsetX=Math.sin(yaw)*dist; const camOffsetZ=Math.cos(yaw)*dist;
      this.camera.position.set(p.x+camOffsetX, camHeight, p.z+camOffsetZ);
      const lookAtY=1.4 + pitch*10; const lookAtX=p.x - Math.sin(yaw)*pitch*1.2; const lookAtZ=p.z - Math.cos(yaw)*pitch*1.2;
      this.camera.lookAt(lookAtX, lookAtY, lookAtZ);
      this.atualizarPortas();
      let zonaDetetada='street'; let buildingInside=null;
      for(const b of this.buildingsMeta){ if(p.x>=b.minX&&p.x<=b.maxX&&p.z>=b.minZ&&p.z<=b.maxZ){ zonaDetetada=b.id; buildingInside=b; break; } }
      if(zonaDetetada!=='street' && !this.modoInterior){ this.entrarModoInterior(zonaDetetada); }
      else if(zonaDetetada==='street' && this.modoInterior){
        const curDoor=this.doors.get(this.predioAtual); if(curDoor){ const d=Math.hypot(curDoor.position.x - p.x, curDoor.position.z - p.z); if(d<1.6){ this.sairModoInterior(); } }
      }
      if(zonaDetetada!==this.currentZoneId && !this.modoInterior){ this.currentZoneId=zonaDetetada; this.atualizarHudZonaLocal(zonaDetetada); }
      this.nearbyTargets=[];
      this.npcs3D.forEach((npc)=>{ const d=Math.hypot(npc.x - p.x, npc.z - p.z); const perto=d<=PROXIMITY_RADIUS && (!this.modoInterior || this.predioAtual===npc.id); npc.mesh.userData.ringMat.opacity=perto?0.75:0.0; if(perto) this.nearbyTargets.push({ type:'npc', id:npc.id, name:npc.name, space:npc.space, dist:d, ref:npc }); });
      this.otherPlayers3D.forEach((op)=>{ const dx=op.targetX - op.mesh.position.x; const dz=op.targetZ - op.mesh.position.z; const movendoOp=Math.hypot(dx,dz)>0.05; op.mesh.position.x+=dx*0.15; op.mesh.position.z+=dz*0.15; op.mesh.rotation.y=op.rotY||0; this.animarPassosBoneco(op.mesh,movendoOp,delta); const d=Math.hypot(op.mesh.position.x - p.x, op.mesh.position.z - p.z); if(d<=PROXIMITY_RADIUS && (!this.modoInterior || this.predioAtual===this.currentZoneId)) this.nearbyTargets.push({ type:'player', id:op.userId, name:op.nome, dist:d, ref:op }); op.mesh.userData.ringMat.opacity=d<=PROXIMITY_RADIUS?0.75:0.0; });
      this.cars.forEach(car=>{ const distToPlayer=Math.hypot(car.position.x - p.x, car.position.z - p.z); const playerOnRoad=Math.abs(p.x)<3.2 && Math.abs(car.position.z - p.z)<6; if(playerOnRoad && distToPlayer<5.5) car.userData.stopped=true; else car.userData.stopped=false; if(!car.userData.stopped && !this.modoInterior){ car.position.z+=car.userData.dir*car.userData.speed*delta; if(car.position.z>18) car.position.z=-90; if(car.position.z<-90) car.position.z=18; } });
      this.pedestrians.forEach(ped=>{ if(this.modoInterior) return; ped.mesh.position.z+=ped.dir*ped.speed*delta*0.6; if(ped.mesh.position.z>14) ped.mesh.position.z=-92; if(ped.mesh.position.z<-92) ped.mesh.position.z=14; ped.mesh.rotation.y=ped.dir>0?0:Math.PI; this.animarPassosBoneco(ped.mesh,true,delta); const d=Math.hypot(ped.mesh.position.x - p.x, ped.mesh.position.z - p.z); if(d<3.2 && Date.now()-ped.lastGreet>8000){ this.mostrarBalaoNoBoneco(ped, ped.bubbleText,3500); ped.lastGreet=Date.now(); } });
      if(this.cloudsGroup && !this.modoInterior){ this.cloudsGroup.children.forEach(cloud=>{ cloud.position.x+=cloud.userData.speed*delta; if(cloud.position.x>50) cloud.position.x=-50; }); }
      p.mesh.userData.ringMat.opacity=this.nearbyTargets.length>0?0.65:0.0; this.atualizarBadgeProximidade();
      if(estaAndando && Date.now()-this.lastSyncTime>260){ this.lastSyncTime=Date.now(); this.enviarMinhaPosicaoServidor(); }
      const vw=viewport.clientWidth||window.innerWidth; const vh=viewport.clientHeight||window.innerHeight;
      this.projetarEtiquetaHTML(p.mesh.position,2.45,p.labelEl,vw,vh);
      this.npcs3D.forEach(npc=>{ if(!this.modoInterior || this.predioAtual===npc.id) this.projetarEtiquetaHTML(npc.mesh.position,2.45,npc.labelEl,vw,vh); });
      this.otherPlayers3D.forEach(op=>this.projetarEtiquetaHTML(op.mesh.position,2.45,op.labelEl,vw,vh));
      this.pedestrians.forEach(ped=>{ if(!this.modoInterior) this.projetarEtiquetaHTML(ped.mesh.position,2.2,ped.labelEl,vw,vh); });
      this.buildingsMeta.forEach(b=>{ if(!this.modoInterior || this.predioAtual===b.id) this.projetarEtiquetaHTML(b.signPos,0,b.signEl,vw,vh); });
      this.renderer.render(this.scene,this.camera);
    };
    this.atualizarHudZonaLocal('street'); animar();
  }

  projetarEtiquetaHTML(pos3D, offsetY, domEl, vw, vh) {
    if(!domEl||!this.camera) return; const THREE=window.THREE;
    const v=new THREE.Vector3(pos3D.x,pos3D.y+offsetY,pos3D.z); v.project(this.camera);
    if(v.z>1||v.z<-1){ domEl.style.opacity='0'; return; }
    const x=(v.x*0.5+0.5)*vw; const y=(-(v.y*0.5)+0.5)*vh;
    domEl.style.left=`${x}px`; domEl.style.top=`${y}px`; domEl.style.opacity='1';
  }

  atualizarHudZonaLocal(zoneId) {
    const badge=document.getElementById('es-city-zone-badge'); const hudContent=document.getElementById('es-city-hud-content'); if(!badge||!hudContent) return;
    if(zoneId==='street'){ badge.innerHTML='🏙️ English City Boulevard (Street)'; return; }
    const bMeta=this.buildingsMeta.find(b=>b.id===zoneId); if(!bMeta) return;
    const sp=bMeta.space; this.parentManager.state.currentSpace=sp; this.parentManager.registarMissaoConcluida(sp.id,'visit',10);
    badge.innerHTML=`${sp.emoji} Inside: ${sp.name}`;
  }

  atualizarBadgeProximidade() {
    const badge=document.getElementById('es-city-proximity-badge'); const input=document.getElementById('es-city-chat-input'); if(!badge) return;
    if(this.nearbyTargets.length===0){ badge.style.background='rgba(22, 24, 38, 0.76)'; badge.style.borderColor='rgba(255, 255, 255, 0.14)'; badge.style.color='#cbd5e1'; badge.innerHTML='<span style="color:#f87171;">•</span> Out of Range'; if(input) input.placeholder='Type message...'; }
    else { const nomes=this.nearbyTargets.map(t=>t.name).join(', '); badge.style.background='rgba(16, 185, 129, 0.24)'; badge.style.borderColor='#10b981'; badge.style.color='#6ee7b7'; badge.innerHTML=`<span style="color:#34d399;">•</span> Near: ${nomes}`; if(input) input.placeholder=`Message ${nomes}...`; }
  }

  adicionarMensagemFeedProximidade(autor, texto, cor='#e2e8f0') {
    const feed=document.getElementById('es-city-chat-feed'); if(!feed) return; const item=document.createElement('div'); item.innerHTML=`<strong style="color:${cor};">${autor}:</strong> <span>${texto}</span>`; feed.appendChild(item);
  }

  async processarFalaPorProximidade(textoCru) {
    const texto=String(textoCru||'').trim(); if(!texto||!this.localPlayer) return; const lower=texto.toLowerCase();
    if(lower.includes('take me to')||lower.includes('go to')){
      const taxiTarget=this.buildingsMeta.find(b=>lower.includes(b.id)||lower.includes(b.space.name.toLowerCase()));
      if(taxiTarget && !this.modoInterior){
        const distToTaxi=this.buildingsMeta.find(b=>b.id==='taxi'); const d=distToTaxi?Math.hypot(distToTaxi.centerX - this.localPlayer.x, distToTaxi.centerZ - this.localPlayer.z):999;
        if(d<8){ this.localPlayer.x=taxiTarget.centerX*0.55; this.localPlayer.z=taxiTarget.centerZ; this.localPlayer.targetX=null; this.localPlayer.targetZ=null; if(window.Workspace?.mostrarAviso) window.Workspace.mostrarAviso(`🚕 Taking you to ${taxiTarget.space.name}!`, 'success'); this.enviarMinhaPosicaoServidor(); return; }
      }
    }
    if(this.nearbyTargets.length===0){ if(window.Workspace?.mostrarAviso) window.Workspace.mostrarAviso('🚶 Aproxime-se de outro aluno ou de um personagem (até acender o círculo verde no chão) para conversar!', 'warning'); return; }
    if(lower.includes('hello')||lower.includes('hi')||lower.includes('thank you')||lower.includes('bye')||lower.includes('hey')){ this.animarEmote(this.localPlayer,'wave'); this.nearbyTargets.forEach(t=>{ if(t.ref) this.animarEmote(t.ref,'wave'); }); }
    this.mostrarBalaoNoBoneco(this.localPlayer, texto); this.adicionarMensagemFeedProximidade(`${this.localPlayer.nome} (You)`, texto, '#c084fc');
    fetch('/api/workspace/english-spaces/world/speak', { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body:JSON.stringify({ userId:this.localPlayer.userId, nome:this.localPlayer.nome, role:this.localPlayer.role, text:texto, x:this.localPlayer.x, z:this.localPlayer.z, spaceId:this.currentZoneId }) }).catch(()=>{});
    const npcAlvo=this.nearbyTargets.find(t=>t.type==='npc');
    if(npcAlvo){ const sp=npcAlvo.space; try{ const prompt=`[3D City Location: ${sp.name} | You are: ${sp.npcName} | Student (${this.localPlayer.nome}) is right in front of you and said: "${texto}"]. Reply naturally in character in 1-2 short sentences in English.`; const res=await window.Workspace.api('/workspace/ingles/ia-teste/groq','POST',{ mensagem:prompt, historico:[] }); if(res&&res.success&&res.resposta){ this.mostrarBalaoNoBoneco(npcAlvo.ref,res.resposta,8000); this.adicionarMensagemFeedProximidade(sp.npcName,res.resposta,'#34d399'); this.parentManager.falarTexto(res.resposta); const missaoPendente=(sp.missions||[]).find(m=>!this.parentManager.state.missionsDone.includes(m.id)); if(missaoPendente){ this.parentManager.state.missionsDone.push(missaoPendente.id); this.parentManager.registarMissaoConcluida(sp.id,missaoPendente.id,missaoPendente.xp||75); this.atualizarHudZonaLocal(this.currentZoneId); } } } catch(e){} }
  }

  configurarEventosControles() {
    this._onResize=()=>{ const vp=document.getElementById('es-city-viewport'); if(!vp||!this.renderer||!this.camera) return; const w=vp.clientWidth||window.innerWidth; const h=vp.clientHeight||window.innerHeight; this.camera.aspect=w/h; this.camera.updateProjectionMatrix(); this.renderer.setSize(w,h); };
    window.addEventListener('resize',this._onResize);
    this._onKeyDown=(e)=>{ if(document.activeElement?.id==='es-city-chat-input') return; this.keys[e.code]=true; this.keys[e.key]=true; };
    this._onKeyUp=(e)=>{ this.keys[e.code]=false; this.keys[e.key]=false; };
    window.addEventListener('keydown',this._onKeyDown); window.addEventListener('keyup',this._onKeyUp);
    document.querySelectorAll('.es-move-pad').forEach(btn=>{ const dir='pad_'+btn.dataset.dir; btn.addEventListener('pointerdown',(e)=>{ e.preventDefault(); this.keys[dir]=true; }); btn.addEventListener('pointerup',()=>{ this.keys[dir]=false; }); btn.addEventListener('pointerleave',()=>{ this.keys[dir]=false; }); });
    const domCanvas=this.renderer.domElement; const THREE=window.THREE; const raycaster=new THREE.Raycaster(); const mouse=new THREE.Vector2(); const planeY0=new THREE.Plane(new THREE.Vector3(0,1,0),0);
    domCanvas.addEventListener('pointerdown',(e)=>{ this.isDraggingCam=true; this.dragStartX=e.clientX; this.dragStartY=e.clientY; this._startYaw=this.cameraYaw; this._startPitch=this.cameraPitch; this._movedDrag=false; });
    domCanvas.addEventListener('pointermove',(e)=>{ if(!this.isDraggingCam) return; const dx=e.clientX-this.dragStartX; const dy=e.clientY-this.dragStartY; if(Math.abs(dx)>4||Math.abs(dy)>4) this._movedDrag=true; this.cameraYaw=this._startYaw - dx*0.006; this.cameraPitch=Math.max(-0.45,Math.min(1.35,this._startPitch + dy*0.0045)); });
    domCanvas.addEventListener('pointerup',(e)=>{
      this.isDraggingCam=false;
      if(!this._movedDrag && this.localPlayer){
        const rect=domCanvas.getBoundingClientRect(); mouse.x=((e.clientX-rect.left)/rect.width)*2-1; mouse.y=-((e.clientY-rect.top)/rect.height)*2+1; raycaster.setFromCamera(mouse,this.camera);
        const hits=raycaster.intersectObjects(this.clickableObjects,false);
        if(hits.length>0){ const obj=hits[0].object; const name=obj.userData.englishName||'Object'; const origColor=obj.material.color.clone(); obj.material.color.set(0xffff99); obj.material.emissive=new THREE.Color(0x444400); setTimeout(()=>{ obj.material.color.copy(origColor); obj.material.emissive=new THREE.Color(0x000000); },450); if(this.parentManager.falarTexto) this.parentManager.falarTexto(name); this.mostrarBalaoNoBoneco(this.localPlayer,name+'!',3000); this.parentManager.registarMissaoConcluida(this.currentZoneId,'click_'+name.toLowerCase().replace(/\s+/g,'_'),15); if(window.Workspace?.mostrarAviso) window.Workspace.mostrarAviso(`💡 ${name} - Click-to-Learn +15 XP!`,'success'); return; }
        const intersectPt=new THREE.Vector3(); if(raycaster.ray.intersectPlane(planeY0,intersectPt)){ const tx=Math.max(-24,Math.min(24,intersectPt.x)); const tz=Math.max(-98,Math.min(18,intersectPt.z)); if(this.podeMoverPara(tx,tz,this.localPlayer.x,this.localPlayer.z)){ this.localPlayer.targetX=tx; this.localPlayer.targetZ=tz; } }
      }
    });
    const inputEl=document.getElementById('es-city-chat-input'); const sendBtn=document.getElementById('es-city-send-btn');
    const dispararEnvio=()=>{ if(!inputEl||!inputEl.value.trim()) return; const txt=inputEl.value.trim(); inputEl.value=''; this.processarFalaPorProximidade(txt); };
    sendBtn?.addEventListener('click',dispararEnvio); inputEl?.addEventListener('keypress',(e)=>{ if(e.key==='Enter') dispararEnvio(); });
    document.getElementById('es-city-voice-btn')?.addEventListener('click',()=>{ this.parentManager.ouvirMicrofone((falado)=>{ if(inputEl) inputEl.value=falado; this.processarFalaPorProximidade(falado); }); });
    document.getElementById('es-city-exit-btn')?.addEventListener('click',()=>{ this.fecharCidade3D(); });
  }

  enviarMinhaPosicaoServidor() {
    if(!this.localPlayer) return;
    fetch('/api/workspace/english-spaces/world/move', { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body:JSON.stringify({ userId:this.localPlayer.userId, nome:this.localPlayer.nome, avatar:this.localPlayer.avatar, role:this.localPlayer.role, x:Math.round(this.localPlayer.x*100)/100, z:Math.round(this.localPlayer.z*100)/100, rotY:Math.round(this.localPlayer.rotY*100)/100, spaceId:this.currentZoneId }) }).then(r=>r.json()).then(data=>{ if(data&&Array.isArray(data.players)) this.sincronizarListaJogadoresRemotos(data.players); }).catch(()=>{});
  }

  sincronizarListaJogadoresRemotos(lista) {
    if(!this.active||!this.scene||!this.localPlayer) return;
    lista.forEach(pData=>{
      if(!pData||!pData.userId||pData.userId===this.localPlayer.userId) return;
      let op=this.otherPlayers3D.get(pData.userId);
      if(!op){ const mesh=this.criarBonecoHumano3D(0x3b82f6,0x0f172a,0xfde68a); mesh.position.set(pData.x||0,0,pData.z||0); this.scene.add(mesh); const labelEl=this.criarEtiquetaHTML(pData.nome||'Student',pData.role||'PEER','#38bdf8'); op={ userId:pData.userId, nome:pData.nome||'Student', role:pData.role||'PEER', mesh, labelEl, targetX:pData.x||0, targetZ:pData.z||0, rotY:pData.rotY||0 }; this.otherPlayers3D.set(pData.userId,op); }
      else { op.targetX=Number(pData.x)||0; op.targetZ=Number(pData.z)||0; op.rotY=Number(pData.rotY)||0; }
    });
  }

  iniciarMultiplayerRealtime() {
    this.enviarMinhaPosicaoServidor(); this.pollInterval=setInterval(()=>this.enviarMinhaPosicaoServidor(),4000);
    try{
      let escolaId='DEFAULT'; try{ escolaId=JSON.parse(localStorage.getItem('ws_usuario_logado'))?.escolaId||'DEFAULT'; } catch(e){}
      this.sseConnection=new EventSource(`/api/workspace/stream?escolaId=${encodeURIComponent(escolaId)}`);
      this.sseConnection.onmessage=(ev)=>{
        if(!this.active||!this.localPlayer) return;
        try{
          const data=JSON.parse(ev.data);
          if(data.type==='ES_WORLD_MOVE'&&data.player) this.sincronizarListaJogadoresRemotos([data.player]);
          if(data.type==='ES_WORLD_LEAVE'&&data.userId){ const rem=this.otherPlayers3D.get(data.userId); if(rem){ this.scene.remove(rem.mesh); if(rem.labelEl) rem.labelEl.remove(); this.otherPlayers3D.delete(data.userId); } }
          if(data.type==='ES_WORLD_SPEAK'&&data.speakerId!==this.localPlayer.userId){ const dist=Math.hypot((data.x||0)-this.localPlayer.x,(data.z||0)-this.localPlayer.z); if(dist<=PROXIMITY_RADIUS){ const op=this.otherPlayers3D.get(data.speakerId); if(op){ this.mostrarBalaoNoBoneco(op,data.text,7000); this.animarEmote(op,'wave'); } this.adicionarMensagemFeedProximidade(`🧑 ${data.speakerName}`,data.text,'#38bdf8'); this.parentManager.falarTexto(data.text); } }
        } catch(e){}
      };
    } catch(e){}
  }

  fecharCidade3D() {
    this.active=false; document.body.style.overflow=''; if(this.animFrame) cancelAnimationFrame(this.animFrame); if(this.pollInterval) clearInterval(this.pollInterval);
    if(this.sseConnection){ try{ this.sseConnection.close(); } catch(e){} this.sseConnection=null; }
    window.removeEventListener('resize',this._onResize); window.removeEventListener('keydown',this._onKeyDown); window.removeEventListener('keyup',this._onKeyUp);
    if(this.localPlayer){ fetch('/api/workspace/english-spaces/world/leave',{ method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body:JSON.stringify({ userId:this.localPlayer.userId }) }).catch(()=>{}); }
    if(this.parentManager) this.parentManager.navigate('home');
  }
}

Workspace.EnglishSpaces3D = new EnglishSpaces3DWorld();
