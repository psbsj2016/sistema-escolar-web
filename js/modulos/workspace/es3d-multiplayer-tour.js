// js/modulos/workspace/es3d-multiplayer-tour.js
// 🐾🚲🎓 Etapa 5: Pets e Veículos Visíveis nos Colegas Online + Modo Tour Guiado do Professor

// ⚙️ PARÂMETROS AJUSTÁVEIS
const TOUR_MULTI_CONFIG = {
  VELOCIDADE_SEGUIR_ALUNO: 7.4,  // Velocidade do aluno acompanhando o professor automaticamente
  DIST_MIN_SEGUIR: 0.45,         // Distância mínima para parar na formação atrás do professor
  DIST_TELEPORTE_SEGUIR: 20.0,   // Se o professor ficar mais longe que isso, teleporta junto
  BONUS_TURMA_DRX: 25,           // DRX enviados para todos os alunos ao clicar no botão de bônus
  COOLDOWN_BONUS_MS: 15000       // Intervalo mínimo (ms) entre envios de bônus do professor
};

// 🗺️ Paradas rápidas para o Professor guiar a turma com 1 clique
const TOUR_QUICK_STOPS = [
  { key: 'plaza',             icon: '⛲', label: 'Central Plaza' },
  { key: 'gameshow',          icon: '🎤', label: 'Game Show' },
  { key: 'building:coffee',   icon: '☕', label: 'Coffee Shop' },
  { key: 'building:airport',  icon: '✈️', label: 'Airport' },
  { key: 'building:restaurant',icon:'🍔', label: 'Restaurant' },
  { key: 'building:hotel',    icon: '🏨', label: 'Hotel' },
  { key: 'building:school',   icon: '🏫', label: 'School' },
  { key: 'building:hospital', icon: '🏥', label: 'Clinic' },
  { key: 'building:petshop',  icon: '🐾', label: 'Pet Shop' },
  { key: 'building:guild_bau',icon: '🧙‍♂️', label: 'Guild Baú' }
];

export class ES3DMultiplayerTour {
  constructor(world) {
    this.world = world;
    this.THREE = window.THREE;

    // 1. Pets e Veículos de colegas online (key = userId)
    this.remotePets = new Map();     // userId -> { type, mesh }
    this.remoteVehicles = new Map(); // userId -> { type, mesh, wheels }

    // 2. Estado do Modo Tour Guiado
    this.isTeacher = this.verificarEhProfessor();
    this.panelOpen = false;
    this.panelEl = null;
    this.studentBannerEl = null;

    this.activeTour = null;          // { active, teacherId, teacherName, message, followEnabled, x, y, z, rotY, spaceId, torreAtual, andarTorreAtual }
    this.seguindoProfessor = false;
    this.optOutTour = false;
    this._appliedBonusIds = new Set();
    this._lastBonusSentAt = 0;
    this._lastFollowSync = 0;
    this._lastCallTimestamp = 0;
  }

  verificarEhProfessor() {
    const tipo = String(window.Workspace?.usuario?.tipo || '').trim();
    return tipo === 'Professor' || tipo === 'Gestor';
  }

  obterEscolaId() {
    return String(window.Workspace?.usuario?.escolaId || 'DEFAULT').trim();
  }

  init() {
    if (!this.THREE || !this.world?.scene) return;

    const tourBtn = document.getElementById('es-city-tour-btn');
    if (tourBtn) {
      tourBtn.style.display = this.isTeacher ? 'inline-flex' : 'none';
    }

    if (this.isTeacher) {
      this.criarPainelProfessorUI();
    }
    this.criarBannerAlunoUI();
  }

  // ============================================================================
  // 1. 🐾🚲 PETS E VEÍCULOS 3D NOS COLEGAS ONLINE
  // ============================================================================
  hashString(str) {
    let h = 0;
    const s = String(str || '');
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h) + s.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  descartarObjeto3D(obj) {
    if (!obj) return;
    obj.traverse(ch => {
      if (ch.geometry) { try { ch.geometry.dispose(); } catch (e) {} }
      if (ch.material) {
        const mats = Array.isArray(ch.material) ? ch.material : [ch.material];
        mats.forEach(m => {
          if (m?.map) { try { m.map.dispose(); } catch (e) {} }
          if (m?.dispose) { try { m.dispose(); } catch (e) {} }
        });
      }
    });
  }

  criarMeshVeiculoRemoto(tipo, seed = 0) {
    const THREE = this.THREE;
    const g = new THREE.Group();
    const wheels = [];

    const tireMat = new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.92 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.8, roughness: 0.25 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });

    if (tipo === 'bicycle') {
      const coresBike = [0x10b981, 0x38bdf8, 0xf59e0b, 0xec4899];
      const frameMat = new THREE.MeshStandardMaterial({
        color: coresBike[seed % coresBike.length],
        metalness: 0.65,
        roughness: 0.3
      });

      [-0.60, 0.60].forEach(z => {
        const wGrp = new THREE.Group();
        const tire = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.048, 10, 22), tireMat);
        tire.rotation.y = Math.PI / 2;
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 8), metalMat);
        hub.rotation.z = Math.PI / 2;
        wGrp.add(tire, hub);
        wGrp.position.set(0, 0.36, z);
        g.add(wGrp);
        wheels.push(wGrp);
      });

      const topTube = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.05, 8), frameMat);
      topTube.rotation.x = Math.PI / 2;
      topTube.position.set(0, 0.82, 0.02);
      const seatPost = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.68, 8), frameMat);
      seatPost.position.set(0, 0.68, -0.14);
      const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.72, 8), metalMat);
      fork.position.set(0, 0.68, 0.52);
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.56, 8), metalMat);
      handle.rotation.z = Math.PI / 2;
      handle.position.set(0, 1.02, 0.48);
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.06, 0.30), darkMat);
      seat.position.set(0, 1.04, -0.16);
      const light = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
      light.position.set(0, 0.96, 0.62);

      g.add(topTube, seatPost, fork, handle, seat, light);
    } else if (tipo === 'moto') {
      const coresMoto = [0xef4444, 0x2563eb, 0xf59e0b, 0x8b5cf6];
      const bodyMat = new THREE.MeshStandardMaterial({
        color: coresMoto[seed % coresMoto.length],
        metalness: 0.4,
        roughness: 0.28
      });

      [-0.76, 0.76].forEach(z => {
        const wGrp = new THREE.Group();
        const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.16, 16), tireMat);
        tire.rotation.z = Math.PI / 2;
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.18, 12), metalMat);
        rim.rotation.z = Math.PI / 2;
        wGrp.add(tire, rim);
        wGrp.position.set(0, 0.34, z);
        g.add(wGrp);
        wheels.push(wGrp);
      });

      const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.44, 1.25), darkMat);
      chassis.position.set(0, 0.62, 0);
      const tank = new THREE.Mesh(new THREE.SphereGeometry(0.30, 14, 12), bodyMat);
      tank.scale.set(0.9, 0.75, 1.35);
      tank.position.set(0, 0.92, 0.14);
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.12, 0.70), darkMat);
      seat.position.set(0, 0.92, -0.40);
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.78, 8), metalMat);
      handle.rotation.z = Math.PI / 2;
      handle.position.set(0, 1.16, 0.62);
      const headlight = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), new THREE.MeshBasicMaterial({ color: 0xfef9c3 }));
      headlight.position.set(0, 0.92, 0.80);
      const taillight = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.09, 0.06), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
      taillight.position.set(0, 0.94, -0.82);

      g.add(chassis, tank, seat, handle, headlight, taillight);
    } else {
      // Carro elétrico moderno
      const coresCar = [0x2563eb, 0xe11d48, 0x10b981, 0x8b5cf6, 0xf59e0b];
      const bodyMat = new THREE.MeshStandardMaterial({
        color: coresCar[seed % coresCar.length],
        metalness: 0.35,
        roughness: 0.25
      });

      const body = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.56, 3.20), bodyMat);
      body.position.set(0, 0.54, 0);
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.48, 1.55), new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        transparent: true,
        opacity: 0.62,
        roughness: 0.15,
        metalness: 0.5
      }));
      cabin.position.set(0, 1.02, -0.10);

      [[-0.82, 1.02], [0.82, 1.02], [-0.82, -1.02], [0.82, -1.02]].forEach(([wx, wz]) => {
        const wGrp = new THREE.Group();
        const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.18, 16), tireMat);
        tire.rotation.z = Math.PI / 2;
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.20, 12), metalMat);
        rim.rotation.z = Math.PI / 2;
        wGrp.add(tire, rim);
        wGrp.position.set(wx, 0.34, wz);
        g.add(wGrp);
        wheels.push(wGrp);
      });

      [-0.52, 0.52].forEach(lx => {
        const hl = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.13, 0.06), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
        hl.position.set(lx, 0.60, 1.61);
        const tl = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.12, 0.06), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
        tl.position.set(lx, 0.60, -1.61);
        g.add(hl, tl);
      });

      g.add(body, cabin);
    }

    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return { mesh: g, wheels };
  }

  sincronizarJogadorRemoto(op, pData) {
    if (!op || !pData || !this.world?.scene) return;
    const uid = op.userId;
    const seed = this.hashString(uid);

    // 1. Pet do colega online
    const novoPet = (pData.petType === 'pet_dog' || pData.petType === 'pet_cat') ? pData.petType : null;
    op.petType = novoPet;

    const petAtual = this.remotePets.get(uid);
    if (novoPet) {
      if (!petAtual || petAtual.type !== novoPet) {
        if (petAtual) {
          this.world.scene.remove(petAtual.mesh);
          this.descartarObjeto3D(petAtual.mesh);
        }
        const coresDog = [0xc68642, 0x8d5524, 0xd4a373, 0x5c3a21];
        const coresCat = [0x9ca3af, 0xd97706, 0x475569, 0xf1f5f9];
        const petMesh = novoPet === 'pet_dog'
          ? this.world.criarCachorro3D(coresDog[seed % coresDog.length])
          : this.world.criarGato3D(coresCat[seed % coresCat.length]);

        const px = op.mesh?.position?.x ?? (pData.x || 0);
        const py = op.mesh?.position?.y ?? (pData.y || 0);
        const pz = op.mesh?.position?.z ?? (pData.z || 0);
        petMesh.position.set(px + 0.75, py, pz - 0.95);
        petMesh.visible = Boolean(op.mesh?.visible);
        this.world.scene.add(petMesh);
        this.remotePets.set(uid, { type: novoPet, mesh: petMesh });
      }
    } else if (petAtual) {
      this.world.scene.remove(petAtual.mesh);
      this.descartarObjeto3D(petAtual.mesh);
      this.remotePets.delete(uid);
    }

    // 2. Veículo do colega online
    const novoVeic = ['bicycle', 'moto', 'car'].includes(pData.equippedVehicle) ? pData.equippedVehicle : null;
    op.equippedVehicle = novoVeic;

    const veicAtual = this.remoteVehicles.get(uid);
    if (novoVeic) {
      if (!veicAtual || veicAtual.type !== novoVeic) {
        if (veicAtual) {
          this.world.scene.remove(veicAtual.mesh);
          this.descartarObjeto3D(veicAtual.mesh);
        }
        const { mesh: vMesh, wheels } = this.criarMeshVeiculoRemoto(novoVeic, seed);
        vMesh.position.set(op.mesh?.position?.x ?? (pData.x || 0), 0.04, op.mesh?.position?.z ?? (pData.z || 0));
        vMesh.rotation.y = op.rotY || 0;
        vMesh.visible = Boolean(op.mesh?.visible && (!op.spaceId || op.spaceId === 'street'));
        this.world.scene.add(vMesh);
        this.remoteVehicles.set(uid, { type: novoVeic, mesh: vMesh, wheels });
      }
    } else if (veicAtual) {
      this.world.scene.remove(veicAtual.mesh);
      this.descartarObjeto3D(veicAtual.mesh);
      this.remoteVehicles.delete(uid);
    }
  }

  removerJogadorRemoto(userId) {
    const pet = this.remotePets.get(userId);
    if (pet) {
      this.world.scene?.remove(pet.mesh);
      this.descartarObjeto3D(pet.mesh);
      this.remotePets.delete(userId);
    }

    const veic = this.remoteVehicles.get(userId);
    if (veic) {
      this.world.scene?.remove(veic.mesh);
      this.descartarObjeto3D(veic.mesh);
      this.remoteVehicles.delete(userId);
    }
  }

  atualizarPetsEVeiculosRemotos(delta) {
    if (!this.world?.otherPlayers3D) return;

    // Limpa órfãos caso algum jogador tenha sido removido fora do fluxo normal
    this.remotePets.forEach((_, uid) => {
      if (!this.world.otherPlayers3D.has(uid)) this.removerJogadorRemoto(uid);
    });
    this.remoteVehicles.forEach((_, uid) => {
      if (!this.world.otherPlayers3D.has(uid)) this.removerJogadorRemoto(uid);
    });

    this.world.otherPlayers3D.forEach((op, uid) => {
      const visivel = Boolean(op.mesh?.visible);
      const px = op.mesh?.position?.x ?? 0;
      const py = op.mesh?.position?.y ?? 0;
      const pz = op.mesh?.position?.z ?? 0;
      const rotY = op.rotY || 0;
      const movendo = Math.hypot((op.targetX ?? px) - px, (op.targetZ ?? pz) - pz) > 0.08;

      // Atualiza Pet do colega
      const petReg = this.remotePets.get(uid);
      if (petReg?.mesh) {
        petReg.mesh.visible = visivel;
        if (visivel) {
          const pet = petReg.mesh;
          const sinR = Math.sin(rotY);
          const cosR = Math.cos(rotY);
          const alvoX = px - sinR * 1.15 + cosR * 0.72;
          const alvoZ = pz - cosR * 1.15 - sinR * 0.72;

          const dx = alvoX - pet.position.x;
          const dz = alvoZ - pet.position.z;
          const dist = Math.hypot(dx, dz);
          let petAndando = false;

          if (dist > 14.0) {
            pet.position.set(alvoX, py, alvoZ);
            pet.rotation.y = rotY;
          } else if (dist > 0.35) {
            const vel = dist > 3.2 ? 9.5 : 6.2;
            const passo = Math.min(dist, vel * delta);
            pet.position.x += (dx / dist) * passo;
            pet.position.z += (dz / dist) * passo;

            const angAlvo = Math.atan2(dx, dz);
            let diff = angAlvo - pet.rotation.y;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            pet.rotation.y += diff * Math.min(1, delta * 9.0);
            petAndando = dist > 0.45;
          } else {
            let diff = rotY - pet.rotation.y;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            pet.rotation.y += diff * Math.min(1, delta * 4.0);
          }

          pet.position.y += (py - pet.position.y) * Math.min(1, delta * 12);
          this.world.animarQuadrúpede?.(pet, petAndando, delta);
        }
      }

      // Atualiza Veículo do colega (visível apenas na rua)
      const veicReg = this.remoteVehicles.get(uid);
      if (veicReg?.mesh) {
        const naRua = !op.spaceId || op.spaceId === 'street';
        const mostrarVeic = visivel && naRua && !op.torreAtual;
        veicReg.mesh.visible = mostrarVeic;

        if (mostrarVeic) {
          veicReg.mesh.position.set(px, 0.04, pz);
          veicReg.mesh.rotation.y = rotY;

          if (movendo && Array.isArray(veicReg.wheels)) {
            veicReg.wheels.forEach(w => { w.rotation.x += delta * 10; });
          }

          // Eleva levemente o tronco do colega para parecer montado no veículo
          const ud = op.mesh?.userData;
          if (ud?.bodyRoot) {
            ud.bodyRoot.position.y = veicReg.type === 'car' ? 0.12 : 0.24;
          }
        }
      }
    });
  }

  // ============================================================================
  // 2. 🎓 MODO TOUR GUIADO DO PROFESSOR (UI + REDE SSE + AUTO-SEGUIR)
  // ============================================================================
  async enviarComandoTour(action, extra = {}) {
    if (!this.isTeacher || !this.world?.localPlayer) return;
    const p = this.world.localPlayer;

    const payload = {
      action,
      escolaId: this.obterEscolaId(),
      teacherId: p.userId,
      teacherName: p.nome,
      x: Math.round(p.x * 100) / 100,
      y: Math.round((p.y || 0) * 100) / 100,
      z: Math.round(p.z * 100) / 100,
      rotY: Math.round((p.rotY || 0) * 100) / 100,
      spaceId: this.world.currentZoneId || 'street',
      torreAtual: this.world.torreAtual || null,
      andarTorreAtual: this.world.andarTorreAtual || 1,
      ...extra
    };

    try {
      const res = await fetch('/api/workspace/english-spaces/world/tour', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      }).then(r => r.json()).catch(() => null);

      if (res && res.success) {
        this.activeTour = res.tour || null;
        this.atualizarUIProfessor();
      }
    } catch (e) {}
  }

  irParaParadaRapidaProfessor(stopKey) {
    const p = this.world?.localPlayer;
    if (!p) return;

    this.world.sairDeQualquerAmbienteFechado?.();

    let destinoLabel = 'English City';
    if (stopKey === 'plaza') {
      p.x = 18; p.z = -95.5;
      destinoLabel = 'Central Plaza';
    } else if (stopKey === 'gameshow') {
      p.x = 18; p.z = -110.5; p.rotY = Math.PI;
      destinoLabel = 'Live English Game Show';
    } else if (stopKey.startsWith('building:')) {
      const bId = stopKey.replace('building:', '');
      const b = this.world.buildingsMeta?.find(x => x.id === bId);
      if (b) {
        p.x = b.frontX - b.col * 2.4;
        p.z = b.centerZ;
        destinoLabel = b.space?.name || bId;
      }
    }

    p.y = 0;
    p.targetX = null;
    p.targetZ = null;
    this.world.enviarMinhaPosicaoServidor?.();

    if (this.activeTour?.active) {
      this.enviarComandoTour('CALL_HERE', {
        message: `Let's explore ${destinoLabel}! Follow me, class!`
      });
    } else if (window.Workspace?.mostrarAviso) {
      window.Workspace.mostrarAviso(`🗺️ Chegou em ${destinoLabel}. Inicie o Tour para trazer a turma!`, 'info', 2800);
    }
  }

  criarPainelProfessorUI() {
    document.getElementById('es-tour-panel')?.remove();
    const wrapper = document.getElementById('es-city-wrapper');
    if (!wrapper) return;

    const panel = document.createElement('div');
    panel.id = 'es-tour-panel';
    panel.style.cssText = `
      display: none; position: absolute; right: 16px; top: 96px; z-index: 35;
      width: 292px; max-width: calc(100vw - 28px); max-height: calc(100dvh - 190px);
      background: rgba(12, 16, 32, 0.95); backdrop-filter: blur(18px);
      border: 1.5px solid rgba(168, 85, 247, 0.55); border-radius: 18px;
      padding: 13px; flex-direction: column; gap: 10px; color: #fff;
      box-shadow: 0 20px 50px rgba(0,0,0,0.6); font-family: Inter, sans-serif;
      overflow-y: auto;
    `;

    panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:13.5px; font-weight:900; color:#e9d5ff;">🎓 Modo Tour Guiado</div>
          <div id="es-tour-online-count" style="font-size:10.5px; color:#94a3b8;">👥 0 alunos online na cidade</div>
        </div>
        <button type="button" id="es-tour-close" style="background:#1e293b;color:#cbd5e1;border:none;width:28px;height:28px;border-radius:50%;font-weight:800;cursor:pointer;">✕</button>
      </div>

      <div style="display:flex; gap:6px;">
        <button type="button" id="es-tour-toggle-btn" style="flex:1.4; padding:9px 10px; border-radius:10px; border:none; background:linear-gradient(135deg,#10b981,#059669); color:#fff; font-size:11.5px; font-weight:900; cursor:pointer;">▶️ Iniciar Tour</button>
        <button type="button" id="es-tour-follow-btn" style="flex:1; padding:9px 8px; border-radius:10px; border:1px solid #475569; background:#1e293b; color:#cbd5e1; font-size:11px; font-weight:800; cursor:pointer;">🧲 Seguir: ON</button>
      </div>

      <div style="display:flex; gap:6px;">
        <button type="button" id="es-tour-call-btn" style="flex:1.2; padding:8px; border-radius:10px; border:none; background:#2563eb; color:#fff; font-size:11.5px; font-weight:800; cursor:pointer;">📢 Trazer Turma Aqui</button>
        <button type="button" id="es-tour-bonus-btn" style="flex:1; padding:8px; border-radius:10px; border:none; background:linear-gradient(135deg,#f59e0b,#d97706); color:#fff; font-size:11.5px; font-weight:900; cursor:pointer;">💎 +${TOUR_MULTI_CONFIG.BONUS_TURMA_DRX} DRX</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:5px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:8px;">
        <div style="font-size:10.5px; font-weight:800; color:#cbd5e1;">📣 Frase / Instrução em Inglês para a Turma:</div>
        <div style="display:flex; gap:5px;">
          <input type="text" id="es-tour-msg-input" maxlength="120" placeholder="Ex: Let's order coffee in English!" style="flex:1; background:#0f172a; border:1px solid #334155; border-radius:8px; padding:7px 9px; color:#fff; font-size:11.5px; outline:none;" />
          <button type="button" id="es-tour-msg-send" style="background:#8b5cf6; color:#fff; border:none; border-radius:8px; padding:0 11px; font-weight:800; cursor:pointer;">➤</button>
        </div>
      </div>

      <div>
        <div style="font-size:10.5px; font-weight:800; color:#cbd5e1; margin-bottom:6px;">🗺️ Paradas Rápidas do Passeio:</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px;">
          ${TOUR_QUICK_STOPS.map(s => `
            <button type="button" data-tour-stop="${s.key}" style="background:#1e293b; border:1px solid #334155; border-radius:9px; padding:7px 6px; color:#f1f5f9; font-size:10.5px; font-weight:700; cursor:pointer; text-align:left; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${s.icon} ${s.label}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    wrapper.appendChild(panel);
    this.panelEl = panel;

    panel.querySelector('#es-tour-close')?.addEventListener('click', () => this.alternarPainelProfessor(false));

    panel.querySelector('#es-tour-toggle-btn')?.addEventListener('click', () => {
      this.world.garantirAudioAtivo?.();
      if (this.activeTour?.active) {
        this.enviarComandoTour('STOP');
        if (window.Workspace?.mostrarAviso) window.Workspace.mostrarAviso('🎓 Tour Guiado encerrado.', 'info', 2500);
      } else {
        this.enviarComandoTour('START', {
          followEnabled: true,
          message: 'Welcome to our Guided English Tour! Follow me around the city!'
        });
        if (window.Workspace?.mostrarAviso) window.Workspace.mostrarAviso('🎓 Tour Guiado iniciado! A turma já pode acompanhar você.', 'success', 3200);
      }
    });

    panel.querySelector('#es-tour-follow-btn')?.addEventListener('click', () => {
      if (!this.activeTour?.active) {
        if (window.Workspace?.mostrarAviso) window.Workspace.mostrarAviso('Inicie o Tour primeiro para alternar o modo Seguir.', 'warning', 2400);
        return;
      }
      const novoFollow = !this.activeTour.followEnabled;
      this.enviarComandoTour('FOLLOW_TOGGLE', { followEnabled: novoFollow });
    });

    panel.querySelector('#es-tour-call-btn')?.addEventListener('click', () => {
      this.world.garantirAudioAtivo?.();
      this.enviarComandoTour('CALL_HERE', {
        message: 'Come over here, class! Let us practice English together!'
      });
      if (window.Workspace?.mostrarAviso) window.Workspace.mostrarAviso('📢 Chamada enviada para todos os alunos na cidade!', 'success', 2600);
    });

    panel.querySelector('#es-tour-bonus-btn')?.addEventListener('click', () => {
      const agora = Date.now();
      if (agora - this._lastBonusSentAt < TOUR_MULTI_CONFIG.COOLDOWN_BONUS_MS) {
        if (window.Workspace?.mostrarAviso) window.Workspace.mostrarAviso('⏳ Aguarde alguns segundos antes de enviar outro bônus.', 'warning', 2200);
        return;
      }
      this._lastBonusSentAt = agora;
      this.enviarComandoTour('BONUS_DRX', {
        bonusAmount: TOUR_MULTI_CONFIG.BONUS_TURMA_DRX,
        bonusId: 'bonus_' + agora,
        message: `Great participation! Everyone earned +${TOUR_MULTI_CONFIG.BONUS_TURMA_DRX} DRX!`
      });
      if (window.Workspace?.mostrarAviso) window.Workspace.mostrarAviso(`💎 Bônus de +${TOUR_MULTI_CONFIG.BONUS_TURMA_DRX} DRX enviado para a turma!`, 'success', 2800);
    });

    const msgInput = panel.querySelector('#es-tour-msg-input');
    const enviarMsg = () => {
      const txt = (msgInput?.value || '').trim();
      if (!txt) return;
      msgInput.value = '';
      this.world.mostrarBalaoNoBoneco?.(this.world.localPlayer, `🎓 ${txt}`, 6000);
      this.world.falarTextoNPC?.(txt, this.world.currentZoneId);
      this.enviarComandoTour('ANNOUNCE', { message: txt });
    };
    panel.querySelector('#es-tour-msg-send')?.addEventListener('click', enviarMsg);
    msgInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') enviarMsg(); });

    panel.querySelectorAll('[data-tour-stop]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.world.garantirAudioAtivo?.();
        this.irParaParadaRapidaProfessor(btn.dataset.tourStop);
      });
    });
  }

  alternarPainelProfessor(forcar = null) {
    if (!this.isTeacher || !this.panelEl) return;
    this.panelOpen = forcar !== null ? Boolean(forcar) : !this.panelOpen;
    this.panelEl.style.display = this.panelOpen ? 'flex' : 'none';
    this.atualizarUIProfessor();
  }

  atualizarUIProfessor() {
    if (!this.panelEl) return;
    const qtdOnline = this.world?.otherPlayers3D?.size || 0;
    const countEl = this.panelEl.querySelector('#es-tour-online-count');
    if (countEl) countEl.textContent = `👥 ${qtdOnline} ${qtdOnline === 1 ? 'colega' : 'colegas'} online na cidade`;

    const ativo = Boolean(this.activeTour?.active);
    const toggleBtn = this.panelEl.querySelector('#es-tour-toggle-btn');
    if (toggleBtn) {
      toggleBtn.textContent = ativo ? '⏹️ Encerrar Tour' : '▶️ Iniciar Tour';
      toggleBtn.style.background = ativo
        ? 'linear-gradient(135deg,#ef4444,#dc2626)'
        : 'linear-gradient(135deg,#10b981,#059669)';
    }

    const followBtn = this.panelEl.querySelector('#es-tour-follow-btn');
    if (followBtn) {
      const fOn = Boolean(this.activeTour?.followEnabled);
      followBtn.textContent = fOn ? '🧲 Seguir: ON' : '🧲 Seguir: OFF';
      followBtn.style.background = fOn ? '#4f46e5' : '#1e293b';
      followBtn.style.color = fOn ? '#fff' : '#94a3b8';
    }

    const topBtn = document.getElementById('es-city-tour-btn');
    if (topBtn) {
      topBtn.innerHTML = ativo ? '🎓 Tour ON' : '🎓 Tour';
    }
  }

  // ============================================================================
  // 3. 🧑‍🎓 BANNER E ACOMPANHAMENTO AUTOMÁTICO PARA OS ALUNOS
  // ============================================================================
  criarBannerAlunoUI() {
    document.getElementById('es-tour-student-banner')?.remove();
    const wrapper = document.getElementById('es-city-wrapper');
    if (!wrapper) return;

    const banner = document.createElement('div');
    banner.id = 'es-tour-student-banner';
    banner.style.cssText = `
      display: none; position: absolute; left: 50%; top: 102px; transform: translateX(-50%);
      z-index: 31; max-width: calc(100vw - 24px); width: max-content;
      background: linear-gradient(135deg, rgba(30,27,75,0.94), rgba(15,23,42,0.94));
      border: 1.5px solid rgba(168,85,247,0.65); border-radius: 16px;
      padding: 9px 14px; color: #fff; font-family: Inter, sans-serif;
      box-shadow: 0 14px 35px rgba(0,0,0,0.5); backdrop-filter: blur(14px);
      flex-direction: column; gap: 6px; align-items: center; text-align: center;
    `;

    banner.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; justify-content:center;">
        <span id="es-tour-banner-title" style="font-size:12px; font-weight:900; color:#e9d5ff;">🎓 Guided Tour</span>
        <span id="es-tour-banner-msg" style="font-size:12px; color:#f8fafc; font-weight:600;"></span>
      </div>
      <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; justify-content:center;">
        <button type="button" id="es-tour-student-go" style="background:#2563eb; color:#fff; border:none; border-radius:999px; padding:5px 12px; font-size:11px; font-weight:800; cursor:pointer;">📍 Ir até o Professor</button>
        <button type="button" id="es-tour-student-follow" style="background:#7c3aed; color:#fff; border:none; border-radius:999px; padding:5px 12px; font-size:11px; font-weight:800; cursor:pointer;">🧲 Seguir: OFF</button>
        <button type="button" id="es-tour-student-leave" style="background:rgba(255,255,255,0.1); color:#cbd5e1; border:none; border-radius:999px; padding:5px 10px; font-size:11px; font-weight:700; cursor:pointer;">✕</button>
      </div>
    `;

    wrapper.appendChild(banner);
    this.studentBannerEl = banner;

    banner.querySelector('#es-tour-student-go')?.addEventListener('click', () => {
      this.world.garantirAudioAtivo?.();
      this.optOutTour = false;
      this.irAteOProfessor();
    });

    banner.querySelector('#es-tour-student-follow')?.addEventListener('click', () => {
      this.world.garantirAudioAtivo?.();
      this.optOutTour = false;
      this.seguindoProfessor = !this.seguindoProfessor;
      this.atualizarBannerAluno();
      if (this.seguindoProfessor) {
        this.irAteOProfessor(false);
      }
    });

    banner.querySelector('#es-tour-student-leave')?.addEventListener('click', () => {
      this.seguindoProfessor = false;
      this.optOutTour = true;
      banner.style.display = 'none';
    });
  }

  atualizarBannerAluno() {
    if (!this.studentBannerEl) return;

    const souProfessorDoTour = Boolean(
      this.activeTour?.teacherId &&
      this.world?.localPlayer?.userId === this.activeTour.teacherId
    );

    if (!this.activeTour?.active || souProfessorDoTour || this.optOutTour) {
      this.studentBannerEl.style.display = 'none';
      return;
    }

    const titleEl = this.studentBannerEl.querySelector('#es-tour-banner-title');
    const msgEl = this.studentBannerEl.querySelector('#es-tour-banner-msg');
    const followBtn = this.studentBannerEl.querySelector('#es-tour-student-follow');

    if (titleEl) titleEl.textContent = `🎓 Tour com ${this.activeTour.teacherName || 'Professor'}:`;
    if (msgEl) msgEl.textContent = this.activeTour.message ? `"${this.activeTour.message}"` : 'Explore English City together!';
    if (followBtn) {
      followBtn.textContent = this.seguindoProfessor ? '🧲 Seguindo: ON' : '🧲 Seguir: OFF';
      followBtn.style.background = this.seguindoProfessor ? '#10b981' : '#475569';
    }

    this.studentBannerEl.style.display = 'flex';
  }

  obterPosicaoProfessor() {
    if (!this.activeTour) return null;
    const opProf = this.world?.otherPlayers3D?.get(this.activeTour.teacherId);
    if (opProf?.mesh) {
      return {
        x: opProf.mesh.position.x,
        y: opProf.mesh.position.y || 0,
        z: opProf.mesh.position.z,
        rotY: opProf.rotY || 0,
        spaceId: opProf.spaceId || this.activeTour.spaceId || 'street',
        torreAtual: opProf.torreAtual || this.activeTour.torreAtual || null,
        andarTorreAtual: this.activeTour.andarTorreAtual || 1
      };
    }
    return {
      x: Number(this.activeTour.x) || 0,
      y: Number(this.activeTour.y) || 0,
      z: Number(this.activeTour.z) || 0,
      rotY: Number(this.activeTour.rotY) || 0,
      spaceId: this.activeTour.spaceId || 'street',
      torreAtual: this.activeTour.torreAtual || null,
      andarTorreAtual: this.activeTour.andarTorreAtual || 1
    };
  }

  calcularOffsetFormacao(profX, profZ, profRotY) {
    const uid = this.world?.localPlayer?.userId || 'student';
    const slot = this.hashString(uid) % 7; // 7 posições organizadas em semicírculo atrás do professor
    const angRel = (slot - 3) * 0.42;
    const raio = 2.1 + (slot % 2) * 0.75;
    const angMundo = (profRotY || 0) + Math.PI + angRel;
    return {
      x: profX + Math.sin(angMundo) * raio,
      z: profZ + Math.cos(angMundo) * raio
    };
  }

  irAteOProfessor(forcarTeleporte = true) {
    const p = this.world?.localPlayer;
    const alvo = this.obterPosicaoProfessor();
    if (!p || !alvo) return;

    const jaMesmaZona =
      (alvo.torreAtual && this.world.torreAtual === alvo.torreAtual) ||
      (!alvo.torreAtual && !this.world.torreAtual && (alvo.spaceId || 'street') === (this.world.currentZoneId || 'street'));

    const distAtual = Math.hypot(p.x - alvo.x, p.z - alvo.z);
    if (!forcarTeleporte && jaMesmaZona && distAtual < TOUR_MULTI_CONFIG.DIST_TELEPORTE_SEGUIR) {
      return;
    }

    this.world.interacoesPro?.levantar?.();
    if (this.world.currentVehicle && (alvo.torreAtual || (alvo.spaceId && alvo.spaceId !== 'street'))) {
      this.world.desmontarVeiculo?.();
    }

    const form = this.calcularOffsetFormacao(alvo.x, alvo.z, alvo.rotY);

    // Caso 1: Professor está em uma Torre Residencial
    if (alvo.torreAtual && this.world.torresResidenciais?.has(alvo.torreAtual)) {
      const torre = this.world.torresResidenciais.get(alvo.torreAtual);
      if (this.world.torreAtual !== alvo.torreAtual) {
        this.world.sairDeQualquerAmbienteFechado?.();
        this.world.posicaoExteriorTorre = { x: torre.x, z: torre.z + torre.profundidade / 2 + 2.2 };
        this.world.torreAtual = torre.id;
        this.world.torresResidenciais.forEach(t => { if (t.grupoInterior) t.grupoInterior.visible = false; });
        if (this.world.torresInterioresGroup) this.world.torresInterioresGroup.visible = true;
        if (torre.grupoInterior) torre.grupoInterior.visible = true;
      }
      const andar = Math.max(1, Math.min(torre.totalAndares, alvo.andarTorreAtual || 1));
      this.world.andarTorreAtual = andar;
      p.x = Math.max(torre.x - torre.largura / 2 + 1.2, Math.min(torre.x + torre.largura / 2 - 1.2, form.x));
      p.z = Math.max(torre.z - torre.profundidade / 2 + 1.2, Math.min(torre.z + torre.profundidade / 2 - 1.2, form.z));
      p.y = (andar - 1) * torre.alturaAndar;
      p.targetX = null;
      p.targetZ = null;
      const badge = document.getElementById('es-city-zone-badge');
      if (badge) badge.innerHTML = `🏢 ${torre.nome} • Floor ${andar}/${torre.totalAndares}`;
      this.world.enviarMinhaPosicaoServidor?.();
      return;
    }

    // Caso 2: Professor está dentro de um dos 24 prédios
    if (alvo.spaceId && alvo.spaceId !== 'street') {
      const b = this.world.buildingsMeta?.find(x => x.id === alvo.spaceId);
      if (b) {
        if (this.world.torreAtual) this.world.sairDeQualquerAmbienteFechado?.();
        p.x = Math.max(b.minX + 1.2, Math.min(b.maxX - 1.2, form.x));
        p.z = Math.max(b.minZ + 1.2, Math.min(b.maxZ - 1.2, form.z));
        p.y = 0;
        p.targetX = null;
        p.targetZ = null;
        this.world.entrarModoInterior?.(b.id);
        this.world.enviarMinhaPosicaoServidor?.();
        return;
      }
    }

    // Caso 3: Professor está na rua
    this.world.sairDeQualquerAmbienteFechado?.();
    p.x = Math.max(-74, Math.min(81, form.x));
    p.z = Math.max(-134, Math.min(69, form.z));
    p.y = 0;
    p.rotY = Math.atan2(alvo.x - p.x, alvo.z - p.z);
    p.targetX = null;
    p.targetZ = null;
    this.world.enviarMinhaPosicaoServidor?.();
  }

  sincronizarEstadoTourInicial(tourData) {
    if (!tourData || !tourData.active) {
      if (this.activeTour?.active) {
        this.activeTour = null;
        this.seguindoProfessor = false;
        this.atualizarBannerAluno();
        this.atualizarUIProfessor();
      }
      return;
    }
    this.activeTour = tourData;
    this.atualizarBannerAluno();
    this.atualizarUIProfessor();
  }

  async aoReceberEventoTour(data) {
    if (!data) return;
    const souProfessorRemetente = Boolean(
      data.tour?.teacherId &&
      this.world?.localPlayer?.userId === data.tour.teacherId
    );

    if (data.action === 'STOP' || !data.tour?.active) {
      this.activeTour = null;
      this.seguindoProfessor = false;
      this.optOutTour = false;
      this.atualizarBannerAluno();
      this.atualizarUIProfessor();
      if (!souProfessorRemetente && window.Workspace?.mostrarAviso) {
        window.Workspace.mostrarAviso('🎓 O Professor encerrou o Tour Guiado.', 'info', 3000);
      }
      return;
    }

    this.activeTour = data.tour;
    this.optOutTour = false;

    if (souProfessorRemetente) {
      this.atualizarUIProfessor();
      return;
    }

    // Reações do Aluno aos comandos do Professor
    if (data.action === 'START') {
      this.seguindoProfessor = Boolean(data.tour.followEnabled);
      this.atualizarBannerAluno();
      if (data.tour.message) this.world.falarTextoNPC?.(data.tour.message, 'street');
      if (window.Workspace?.mostrarAviso) {
        window.Workspace.mostrarAviso(`🎓 ${data.tour.teacherName} iniciou um Tour Guiado!`, 'info', 3800);
      }
    } else if (data.action === 'CALL_HERE') {
      const ts = data.timestamp || Date.now();
      if (ts !== this._lastCallTimestamp) {
        this._lastCallTimestamp = ts;
        this.seguindoProfessor = Boolean(data.tour.followEnabled);
        this.irAteOProfessor(true);
        this.atualizarBannerAluno();
        if (data.tour.message) this.world.falarTextoNPC?.(data.tour.message, data.tour.spaceId || 'street');
        if (window.Workspace?.mostrarAviso) {
          window.Workspace.mostrarAviso(`📢 ${data.tour.teacherName} chamou a turma para este local!`, 'success', 3400);
        }
      }
    } else if (data.action === 'ANNOUNCE') {
      this.atualizarBannerAluno();
      if (data.tour.message) {
        this.world.falarTextoNPC?.(data.tour.message, data.tour.spaceId || 'street');
        if (window.Workspace?.mostrarAviso) {
          window.Workspace.mostrarAviso(`🎓 ${data.tour.teacherName}: "${data.tour.message}"`, 'info', 5000);
        }
      }
    } else if (data.action === 'FOLLOW_TOGGLE') {
      this.seguindoProfessor = Boolean(data.tour.followEnabled);
      this.atualizarBannerAluno();
    } else if (data.action === 'BONUS_DRX' && data.bonusId && !this._appliedBonusIds.has(data.bonusId)) {
      this._appliedBonusIds.add(data.bonusId);
      const qtd = Number(data.bonusAmount) || TOUR_MULTI_CONFIG.BONUS_TURMA_DRX;
      this.atualizarBannerAluno();
      this.world.interacoesPro?.dispararEmote?.('jump', false);
      await window.DOVRYX?.add(qtd, `Guided Tour Bonus (${data.tour.teacherName}) 🎓`);
    }
  }

  atualizarSeguirProfessor(delta, estaAndandoManual) {
    if (!this.seguindoProfessor || !this.activeTour?.active) return;

    const p = this.world?.localPlayer;
    if (!p || p.userId === this.activeTour.teacherId) return;

    // Se o aluno usar as teclas/D-pad manualmente, libera o movimento na hora sem prender!
    if (estaAndandoManual) {
      this.seguindoProfessor = false;
      this.atualizarBannerAluno();
      if (window.Workspace?.mostrarAviso) {
        window.Workspace.mostrarAviso('🚶 Movimento livre retomado. Clique em 🧲 Seguir para voltar a acompanhar.', 'info', 2500);
      }
      return;
    }

    const alvoProf = this.obterPosicaoProfessor();
    if (!alvoProf) return;

    const mesmaZona =
      (alvoProf.torreAtual && this.world.torreAtual === alvoProf.torreAtual) ||
      (!alvoProf.torreAtual && !this.world.torreAtual && (alvoProf.spaceId || 'street') === (this.world.currentZoneId || 'street'));

    const form = this.calcularOffsetFormacao(alvoProf.x, alvoProf.z, alvoProf.rotY);
    const dx = form.x - p.x;
    const dz = form.z - p.z;
    const dist = Math.hypot(dx, dz);

    if (!mesmaZona || dist > TOUR_MULTI_CONFIG.DIST_TELEPORTE_SEGUIR) {
      this.irAteOProfessor(true);
      return;
    }

    if (dist > TOUR_MULTI_CONFIG.DIST_MIN_SEGUIR) {
      const passo = Math.min(dist, TOUR_MULTI_CONFIG.VELOCIDADE_SEGUIR_ALUNO * delta);
      const nx = p.x + (dx / dist) * passo;
      const nz = p.z + (dz / dist) * passo;

      let moveu = false;
      if (this.world.podeMoverPara(nx, nz, p.x, p.z)) {
        p.x = nx; p.z = nz; moveu = true;
      } else if (this.world.podeMoverPara(nx, p.z, p.x, p.z)) {
        p.x = nx; moveu = true;
      } else if (this.world.podeMoverPara(p.x, nz, p.x, p.z)) {
        p.z = nz; moveu = true;
      }

      if (moveu) {
        p.rotY = Math.atan2(dx, dz);
        p.mesh.position.set(p.x, p.y || 0, p.z);
        p.mesh.rotation.y = p.rotY;
        this.world.animarPassosBoneco?.(p.mesh, true, delta);

        const agora = Date.now();
        if (agora - this._lastFollowSync > 320) {
          this._lastFollowSync = agora;
          this.world.enviarMinhaPosicaoServidor?.();
        }
      }
    }
  }

  // ============================================================================
  // 🔄 LOOP & LIMPEZA DE MEMÓRIA
  // ============================================================================
  update(delta, estaAndandoManual = false) {
    this.atualizarPetsEVeiculosRemotos(delta);
    this.atualizarSeguirProfessor(delta, estaAndandoManual);

    if (this.isTeacher && this.panelOpen) {
      const countEl = this.panelEl?.querySelector('#es-tour-online-count');
      if (countEl) {
        const qtd = this.world?.otherPlayers3D?.size || 0;
        countEl.textContent = `👥 ${qtd} ${qtd === 1 ? 'colega' : 'colegas'} online na cidade`;
      }
    }
  }

  dispose() {
    // Se o professor sair da Cidade 3D com um tour ativo, encerra para a turma automaticamente
    if (this.isTeacher && this.activeTour?.active && this.activeTour.teacherId === this.world?.localPlayer?.userId) {
      this.enviarComandoTour('STOP');
    }

    this.remotePets.forEach(reg => {
      try {
        this.world.scene?.remove(reg.mesh);
        this.descartarObjeto3D(reg.mesh);
      } catch (e) {}
    });
    this.remotePets.clear();

    this.remoteVehicles.forEach(reg => {
      try {
        this.world.scene?.remove(reg.mesh);
        this.descartarObjeto3D(reg.mesh);
      } catch (e) {}
    });
    this.remoteVehicles.clear();

    this.panelEl?.remove();
    this.studentBannerEl?.remove();
    this.panelEl = null;
    this.studentBannerEl = null;
    this.activeTour = null;
    this.seguindoProfessor = false;
  }
}