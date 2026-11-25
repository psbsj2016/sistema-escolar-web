// js/modulos/workspace/es3d-camera-ui.js
// 🎥 Módulo de Câmera (3ª ↔ 1ª Pessoa + Anti-Parede), Minimapa Radar ao Vivo e Otimização InstancedMesh

// ⚙️ PARÂMETROS AJUSTÁVEIS
const CAMERA_UI_CONFIG = {
  DIST_EXTERIOR: 8.4,       // Distância padrão da câmera na rua (3ª pessoa)
  DIST_INTERIOR: 3.2,       // Distância padrão da câmera dentro de lojas e torres
  DIST_MIN_ANTI_PAREDE: 1.15, // Distância mínima quando encostado numa parede
  MARGEM_PAREDE: 0.42,      // Folga para a câmera não encostar dentro do tijolo
  ALTURA_OLHOS_1P: 1.80,    // Altura dos olhos do avatar na visão em 1ª pessoa
  RADAR_ALCANCE: 82,        // Alcance do minimapa em metros ao redor do jogador
  RADAR_INTERVALO_MS: 60,   // Atualização do radar (~16 FPS, leve para celulares)
  MIN_INSTANCIAS: 4         // Quantidade mínima de peças iguais para virar InstancedMesh
};

export class ES3DCameraUI {
  constructor(world) {
    this.world = world;
    this.THREE = window.THREE;

    // Estado da Câmera
    this.firstPerson = false;
    this.currentCamDist = CAMERA_UI_CONFIG.DIST_EXTERIOR;
    this.raycaster = this.THREE ? new this.THREE.Raycaster() : null;
    this.wallColliders = [];

    // Minimapa Radar
    this.minimapWrap = null;
    this.minimapCanvas = null;
    this.minimapCtx = null;
    this.minimapCollapsed = false;
    this.lastMinimapDraw = 0;

    // InstancedMesh (para limpeza de memória ao sair)
    this.instancedMeshes = [];
  }

  init() {
    if (!this.THREE || !this.world?.scene) return;
    this.coletarParedesColisao();
    this.otimizarCenaComInstancedMesh();
    this.criarMinimapaUI();
    this.sincronizarVisibilidadeAvatar();
  }

  // ============================================================================
  // 1. 🎥 CÂMERA 3ª ↔ 1ª PESSOA + PROTEÇÃO ANTI-PAREDE (RAYCASTER)
  // ============================================================================
  coletarParedesColisao() {
    this.wallColliders = [];
    if (!this.world?.buildingMeshes) return;

    this.world.buildingMeshes.forEach(entry => {
      if (Array.isArray(entry.walls)) {
        entry.walls.forEach(w => {
          if (w && w.isMesh) this.wallColliders.push(w);
        });
      }
      if (entry.roof) {
        if (entry.roof.isMesh) {
          this.wallColliders.push(entry.roof);
        } else if (entry.roof.traverse) {
          entry.roof.traverse(obj => { if (obj.isMesh) this.wallColliders.push(obj); });
        }
      }
    });
  }

  alternarModoCamera(forcarPrimeiraPessoa = null) {
    this.firstPerson = forcarPrimeiraPessoa !== null ? Boolean(forcarPrimeiraPessoa) : !this.firstPerson;
    this.sincronizarVisibilidadeAvatar();

    const btn = document.getElementById('es-city-cam-btn');
    if (btn) {
      btn.innerHTML = this.firstPerson ? '👁️ 1st Person' : '🎥 3rd Person';
    }

    if (window.Workspace?.mostrarAviso) {
      window.Workspace.mostrarAviso(
        this.firstPerson
          ? '👁️ First-Person View ON! Press V or click the button to switch back.'
          : '🎥 Third-Person View ON!',
        'info',
        2200
      );
    }
  }

  sincronizarVisibilidadeAvatar() {
    const p = this.world?.localPlayer;
    if (!p) return;

    // Na 1ª pessoa escondemos o corpo e o nome local para não tampar a visão
    if (p.mesh) p.mesh.visible = !this.firstPerson;
    if (p.labelEl) p.labelEl.style.visibility = this.firstPerson ? 'hidden' : 'visible';
  }

  objetoEstaRealmenteVisivel(obj) {
    let cur = obj;
    while (cur) {
      if (cur.visible === false) return false;
      cur = cur.parent;
    }
    return true;
  }

  atualizarCamera(delta = 0.016) {
    const p = this.world?.localPlayer;
    const cam = this.world?.camera;
    const THREE = this.THREE;
    if (!p || !cam || !THREE) return;

    const yaw = this.world.cameraYaw || 0;
    const pitch = this.world.cameraPitch || 0.15;
    const baseY = p.y || 0;

    // 👁️ MODO 1ª PESSOA (pelos olhos do personagem)
    if (this.firstPerson) {
      const eyeX = p.x;
      const eyeY = baseY + CAMERA_UI_CONFIG.ALTURA_OLHOS_1P;
      const eyeZ = p.z;

      const lookPitch = Math.max(-0.68, Math.min(0.68, (pitch - 0.15) * 1.15));
      const cosP = Math.cos(lookPitch);
      const targetX = eyeX - Math.sin(yaw) * cosP * 10;
      const targetY = eyeY + Math.sin(lookPitch) * 10;
      const targetZ = eyeZ - Math.cos(yaw) * cosP * 10;

      cam.position.set(eyeX, eyeY, eyeZ);
      cam.lookAt(targetX, targetY, targetZ);
      return;
    }

    // 🎥 MODO 3ª PESSOA + SENSOR ANTI-PAREDE
    const dentroAmbiente = Boolean(this.world.modoInterior || this.world.torreAtual);
    const distBase = dentroAmbiente ? CAMERA_UI_CONFIG.DIST_INTERIOR : CAMERA_UI_CONFIG.DIST_EXTERIOR;
    const distDesejada = distBase + pitch * 0.35;
    const tetoMaximoLoja = this.world.modoInterior ? 3.82 : Infinity;
    const camHeightDesejada = Math.min(tetoMaximoLoja, Math.max(0.85, (dentroAmbiente ? 2.75 : 4.8) - pitch * 1.8 + baseY));

    const pivot = new THREE.Vector3(p.x, baseY + 1.55, p.z);
    const idealPos = new THREE.Vector3(
      p.x + Math.sin(yaw) * distDesejada,
      camHeightDesejada,
      p.z + Math.cos(yaw) * distDesejada
    );

    const dir = idealPos.clone().sub(pivot);
    const totalDist = dir.length();
    let distAlvo = totalDist;

    // Lança um raio do avatar até a câmera para evitar atravessar paredes
    if (this.raycaster && totalDist > 0.3 && this.wallColliders.length > 0) {
      dir.normalize();
      this.raycaster.set(pivot, dir);
      this.raycaster.near = 0.25;
      this.raycaster.far = totalDist;

      const hits = this.raycaster.intersectObjects(this.wallColliders, false);
      for (let i = 0; i < hits.length; i++) {
        if (this.objetoEstaRealmenteVisivel(hits[i].object)) {
          distAlvo = Math.max(CAMERA_UI_CONFIG.DIST_MIN_ANTI_PAREDE, hits[i].distance - CAMERA_UI_CONFIG.MARGEM_PAREDE);
          break;
        }
      }
    }

    // Transição suave (sem tremedeira quando encosta na parede)
    const fatorSuave = Math.min(1, delta * 14);
    this.currentCamDist += (distAlvo - this.currentCamDist) * fatorSuave;

    const ratio = totalDist > 0.001 ? Math.min(1, this.currentCamDist / totalDist) : 1;
    const finalPos = pivot.clone().lerp(idealPos, ratio);
    const finalY = Math.min(tetoMaximoLoja, Math.max(0.75 + baseY, finalPos.y));
    cam.position.set(finalPos.x, finalY, finalPos.z);

    const lookAtY = baseY + 1.4 + pitch * 10;
    const lookAtX = p.x - Math.sin(yaw) * pitch * 1.2;
    const lookAtZ = p.z - Math.cos(yaw) * pitch * 1.2;
    cam.lookAt(lookAtX, lookAtY, lookAtZ);
  }

  // ============================================================================
  // 2. 🧭 MINIMAPA / RADAR AO VIVO NO CANTO DA TELA
  // ============================================================================
  criarMinimapaUI() {
    document.getElementById('es-minimap-wrap')?.remove();
    document.getElementById('es-cam-ui-css')?.remove();

    const wrapper = document.getElementById('es-city-wrapper');
    if (!wrapper) return;

    const style = document.createElement('style');
    style.id = 'es-cam-ui-css';
    style.textContent = `
      #es-minimap-wrap {
        position: absolute; left: 16px; bottom: 88px; z-index: 24;
        width: 126px; height: 126px; border-radius: 50%;
        background: rgba(10, 15, 30, 0.84);
        border: 2px solid rgba(96, 165, 250, 0.55);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45), inset 0 0 18px rgba(59, 130, 246, 0.18);
        backdrop-filter: blur(10px);
        overflow: hidden; cursor: pointer;
        transition: width 0.2s ease, height 0.2s ease, opacity 0.2s ease;
      }
      #es-minimap-wrap.collapsed {
        width: 44px; height: 44px;
        display: flex; align-items: center; justify-content: center;
      }
      #es-minimap-canvas {
        width: 100%; height: 100%; display: block;
      }
      #es-minimap-wrap.collapsed #es-minimap-canvas,
      #es-minimap-wrap.collapsed #es-minimap-north {
        display: none;
      }
      #es-minimap-north {
        position: absolute; top: 4px; left: 50%; transform: translateX(-50%);
        font-size: 9px; font-weight: 900; color: #f87171;
        text-shadow: 0 1px 3px #000; pointer-events: none;
      }
      #es-minimap-toggle {
        position: absolute; right: 4px; top: 4px; z-index: 5;
        width: 22px; height: 22px; border-radius: 50%;
        background: rgba(15, 23, 42, 0.88); color: #cbd5e1;
        border: 1px solid rgba(255, 255, 255, 0.22);
        font-size: 11px; font-weight: 900; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
      }
      #es-minimap-wrap.collapsed #es-minimap-toggle {
        position: static; width: 100%; height: 100%; border: none; background: transparent; font-size: 18px;
      }
      @media (max-width: 600px) {
        #es-minimap-wrap { width: 96px; height: 96px; left: 10px; bottom: 80px; }
      }
    `;
    document.head.appendChild(style);

    const wrap = document.createElement('div');
    wrap.id = 'es-minimap-wrap';
    wrap.title = 'Radar da Cidade (Clique no mapa para abrir o GPS)';
    wrap.innerHTML = `
      <span id="es-minimap-north">N</span>
      <button type="button" id="es-minimap-toggle" title="Minimizar / Expandir Radar">−</button>
      <canvas id="es-minimap-canvas" width="220" height="220"></canvas>
    `;
    wrapper.appendChild(wrap);

    this.minimapWrap = wrap;
    this.minimapCanvas = wrap.querySelector('#es-minimap-canvas');
    this.minimapCtx = this.minimapCanvas?.getContext('2d') || null;

    const toggleBtn = wrap.querySelector('#es-minimap-toggle');
    toggleBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.minimapCollapsed = !this.minimapCollapsed;
      wrap.classList.toggle('collapsed', this.minimapCollapsed);
      toggleBtn.textContent = this.minimapCollapsed ? '🧭' : '−';
    });

    wrap.addEventListener('click', () => {
      if (this.minimapCollapsed) return;
      this.world.abrirModalGPS?.();
    });
  }

  atualizarMinimapa() {
    if (this.minimapCollapsed || !this.minimapCtx || !this.world?.localPlayer) return;

    const agora = performance.now();
    if (agora - this.lastMinimapDraw < CAMERA_UI_CONFIG.RADAR_INTERVALO_MS) return;
    this.lastMinimapDraw = agora;

    const ctx = this.minimapCtx;
    const W = this.minimapCanvas.width;
    const H = this.minimapCanvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const p = this.world.localPlayer;
    const escala = (W / 2) / CAMERA_UI_CONFIG.RADAR_ALCANCE;

    const mapX = (wx) => cx + (wx - p.x) * escala;
    const mapY = (wz) => cy + (wz - p.z) * escala;

    ctx.clearRect(0, 0, W, H);

    // Fundo circular do radar + anéis de distância
    ctx.fillStyle = '#0b1224';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
    ctx.lineWidth = 1.5;
    [35, 70, 102].forEach(r => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    });
  
     // Reserva Ecológica Oeste, Bosque Sudeste e Cinturão Verde Norte
    ctx.fillStyle = 'rgba(21, 128, 61, 0.55)';
    ctx.fillRect(mapX(-77), mapY(-102), 23 * escala, 162 * escala);
    ctx.fillRect(mapX(37),  mapY(16),   42 * escala, 46 * escala);
    ctx.fillRect(mapX(-72), mapY(-132), 142 * escala, 12 * escala);

    // Praia, Mar Vivo e Píer de Madeira na Costa Sul
    ctx.fillStyle = 'rgba(253, 230, 138, 0.72)';
    ctx.fillRect(mapX(-140), mapY(70), 280 * escala, 14 * escala);
    ctx.fillStyle = 'rgba(14, 165, 233, 0.75)';
    ctx.fillRect(mapX(-150), mapY(84), 300 * escala, 90 * escala);
    ctx.fillStyle = '#a16207';
    ctx.fillRect(mapX(-2.4), mapY(72), 4.8 * escala, 24 * escala);
     
    // Avenidas principais (x = 0, -34, +34)
    ctx.fillStyle = 'rgba(100, 116, 139, 0.35)';
    [0, -34, 34].forEach(ax => {
      const rw = (ax === 0 ? 13 : 8.5) * escala;
      ctx.fillRect(mapX(ax) - rw / 2, mapY(-120), rw, 175 * escala);
    });

    // Praça Central (x=18, z=-103)
    ctx.fillStyle = 'rgba(16, 185, 129, 0.55)';
    ctx.fillRect(mapX(11), mapY(-110), 14 * escala, 14 * escala);

    // Loteamento Residencial (z=34..52)
    ctx.fillStyle = 'rgba(34, 197, 94, 0.45)';
    for (let i = 0; i < 8; i++) {
      const col = (i % 4) - 1.5;
      const row = Math.floor(i / 4);
      const lx = col * 18;
      const lz = 34 + row * 18;
      ctx.fillRect(mapX(lx - 5), mapY(lz - 5), 10 * escala, 10 * escala);
    }

    // 24 Prédios da Cidade
    (this.world.buildingsMeta || []).forEach(b => {
      const ativo = this.world.predioAtual === b.id;
      ctx.fillStyle = ativo ? '#facc15' : 'rgba(139, 92, 246, 0.72)';
      ctx.fillRect(mapX(b.minX), mapY(b.minZ), b.bw * escala, b.bd * escala);
      if (ativo) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(mapX(b.minX), mapY(b.minZ), b.bw * escala, b.bd * escala);
      }
    });

    // 3 Torres Residenciais
    if (this.world.torresResidenciais) {
      this.world.torresResidenciais.forEach(t => {
        const naTorre = this.world.torreAtual === t.id;
        ctx.fillStyle = naTorre ? '#facc15' : '#38bdf8';
        ctx.fillRect(
          mapX(t.x - t.largura / 2),
          mapY(t.z - t.profundidade / 2),
          t.largura * escala,
          t.profundidade * escala
        );
      });
    }

    // Colegas Online (bolinhas ciano brilhantes)
    if (this.world.otherPlayers3D) {
      this.world.otherPlayers3D.forEach(op => {
        const ox = mapX(op.mesh?.position?.x ?? op.targetX ?? 0);
        const oz = mapY(op.mesh?.position?.z ?? op.targetZ ?? 0);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(ox, oz, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      });
    }

    // Cone de visão do jogador (direção da câmera)
    const yaw = this.world.cameraYaw || 0;
    const dirAng = Math.atan2(-Math.cos(yaw), -Math.sin(yaw));
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, 34, dirAng - 0.45, dirAng + 0.45);
    ctx.closePath();
    ctx.fill();

    // Ponto do jogador no centro
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // ============================================================================
  // 3. ⚡ OTIMIZAÇÃO DE FPS COM THREE.InstancedMesh (AUTO-INSTANCER SEGURO)
  // ============================================================================
  otimizarCenaComInstancedMesh() {
    const THREE = this.THREE;
    const ext = this.world?.exteriorGroup;
    if (!THREE?.InstancedMesh || !ext) return;

    // Lista de proteção: nunca mexe em nada clicável, animado ou que muda de cor à noite
    const protegidos = new Set();
    (this.world.posteLights || []).forEach(p => { if (p?.lampHead) protegidos.add(p.lampHead); });
    (this.world.clickableObjects || []).forEach(o => protegidos.add(o));
    (this.world.vitrines || []).forEach(v => { if (v?.mesh) protegidos.add(v.mesh); });
    (this.world.outdoors || []).forEach(o => protegidos.add(o));

    const grupos = new Map();

    // Analisa apenas filhos diretos do tipo Mesh em exteriorGroup (preserva Groups de carros, motos, árvores especiais, lotes e torres)
    ext.children.forEach(child => {
      if (!child || !child.isMesh) return;
      if (protegidos.has(child) || child.userData?.clickable) return;

      const geo = child.geometry;
      const mat = child.material;
      if (!geo || !mat || Array.isArray(mat) || mat.map) return;

      const paramsGeo = geo.parameters ? JSON.stringify(geo.parameters) : '';
      if (!paramsGeo) return;

      const corHex = mat.color ? mat.color.getHex() : 0;
      const chave = [
        geo.type,
        paramsGeo,
        mat.type,
        corHex,
        mat.roughness ?? '',
        mat.metalness ?? '',
        mat.opacity ?? 1,
        Boolean(mat.transparent),
        Boolean(child.castShadow),
        Boolean(child.receiveShadow)
      ].join('|');

      if (!grupos.has(chave)) grupos.set(chave, []);
      grupos.get(chave).push(child);
    });

    let totalAgrupados = 0;
    let totalInstancias = 0;

    grupos.forEach(lista => {
      if (lista.length < CAMERA_UI_CONFIG.MIN_INSTANCIAS) return;

      const primeiro = lista[0];
      const baseGeo = primeiro.geometry.clone();
      const baseMat = primeiro.material.clone();
      const inst = new THREE.InstancedMesh(baseGeo, baseMat, lista.length);
      inst.castShadow = primeiro.castShadow;
      inst.receiveShadow = primeiro.receiveShadow;

      lista.forEach((mesh, idx) => {
        mesh.updateMatrix();
        inst.setMatrixAt(idx, mesh.matrix);
        ext.remove(mesh);
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) mesh.material.dispose();
      });

      inst.instanceMatrix.needsUpdate = true;
      ext.add(inst);
      this.instancedMeshes.push(inst);

      totalAgrupados += lista.length;
      totalInstancias++;
    });

    if (totalInstancias > 0) {
      console.log(`⚡ [ES3D Performance] ${totalAgrupados} objetos estáticos agrupados em ${totalInstancias} InstancedMeshes!`);
    }
  }

  // ============================================================================
  // 🧹 LIMPEZA DE MEMÓRIA AO SAIR DA CIDADE 3D
  // ============================================================================
  dispose() {
    this.minimapWrap?.remove();
    document.getElementById('es-cam-ui-css')?.remove();
    this.minimapWrap = null;
    this.minimapCanvas = null;
    this.minimapCtx = null;

    this.instancedMeshes.forEach(inst => {
      try {
        this.world?.exteriorGroup?.remove(inst);
        inst.geometry?.dispose();
        inst.material?.dispose();
      } catch (e) {}
    });
    this.instancedMeshes = [];
    this.wallColliders = [];
  }
}