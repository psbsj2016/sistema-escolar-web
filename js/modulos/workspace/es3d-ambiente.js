// js/modulos/workspace/es3d-ambiente.js
// 🌦️🌊🌲 Ambiente Realista: Clima Automático (Chuva/Raios/Trovões + Neve com Congelamento), Mar Vivo, Praia, Píer, Mata Realista, Semáforos e Áudio 3D

// ⚙️ PARÂMETROS AJUSTÁVEIS
const AMBIENTE_CONFIG = {
  GOTAS_CHUVA: 720,            // Filetes de água caindo durante a chuva
  FLOCOS_NEVE: 950,            // Flocos de neve macios caindo durante a nevasca
  AREA_CLIMA: 66,              // Área (m) de chuva/neve ao redor do avatar
  ALTURA_CLIMA: 24,            // Altura de onde chuva e neve caem
  DURACAO_FASE_CLIMA_SEG: 75,  // Duração média (s) de cada fase climática automática
  INTERVALO_RAIO_MIN_SEG: 7,   // Intervalo mínimo (s) entre raios na tempestade
  INTERVALO_RAIO_MAX_SEG: 16,  // Intervalo máximo (s) entre raios na tempestade
  TEMPO_VERDE_SEG: 8,          // Semáforo verde (s)
  TEMPO_AMARELO_SEG: 2.2,      // Semáforo amarelo (s)
  TEMPO_VERMELHO_SEG: 6,       // Semáforo vermelho (s)
  CRUZAMENTOS_Z: [-56, -24],   // Cruzamentos com semáforo
  VOLUME_AUDIO_3D: 0.45        // Volume geral do áudio procedural (0.0 a 1.0)
};

// Ciclo orgânico de tempo (sem botão manual — evolui sozinho)
const CICLO_CLIMA = ['clear', 'cloudy', 'rain', 'clear', 'cloudy', 'snow'];

export class ES3DAmbiente {
  constructor(world) {
    this.world = world;
    this.THREE = window.THREE;

    // Clima Automático Inteligente
    this.weatherCycleIndex = 0;
    this.weatherMode = 'clear'; // 'clear' | 'cloudy' | 'rain' | 'snow'
    this.weatherTimer = 42;     // Começa ensolarado por ~42s e depois evolui naturalmente
    this.cloudDarkness = 0;     // 0 (nuvens brancas) -> 1 (nuvens carregadas e escuras)
    this.snowAccumulation = 0;  // 0 (seco) -> 1 (chão e telhados cobertos de neve e congelados)

    // Precipitação (Chuva em filetes + Neve em flocos)
    this.rainLines = null;
    this.rainPositions = null;
    this.rainSpeeds = null;
    this.snowPoints = null;
    this.snowPositions = null;
    this.snowSpeeds = null;
    this.snowFlakeTex = null;

    // Camada de Neve & Congelamento
    this.snowGroundMesh = null;
    this.snowRoofCaps = [];
    this.snowGroundTex = null;
    this.fountainIceDisc = null;

    // Raios e Trovões
    this.lightningBolt = null;
    this.lightningFlash = 0;
    this.lightningTimer = 9;

    // Reflexos PMREM
    this.envRT = null;

    // Orla, Praia, Píer, Mar Vivo e Fonte
    this.waterTexture = null;
    this.waterFountainTexture = null;
    this.foamLineMesh = null;
    this.waterMeshes = [];
    this.fountainJets = null;
    this.fountainVelocities = [];

    // Vegetação Realista e Colisores compartilhados com es3d-colisoes.js
    this.natureGroup = null;
    this.forestColliders = [];
    this.coastColliders = [];
    this.sharedMaterials = [];

    // Semáforos e Faróis
    this.trafficTimer = 0;
    this.trafficState = 'green';
    this.headlightBeams = [];

    // Áudio Espacial 3D + Clima Procedural (Chuva, Vento, Trovão, Ondas)
    this.audioEnabled = true;
    this.audioStarted = false;
    this.audioListener = null;
    this.spatialSounds = [];
    this.spatialAnchors = [];
    this.weatherRainSound = null;
    this.weatherWindSound = null;
    this._weatherToastEl = null;
  }

  init() {
    if (!this.THREE || !this.world?.scene || !this.world?.renderer) return;
    this.aplicarReflexosPMREM();
    this.criarSistemaClimaRealista();
    this.criarCamadasNeveECongelamento();
    this.criarOrlaPraiaPierEFonte();
    this.criarMataRealistaEVegetacao();
    this.criarFaroisNoturnosVeiculos();
    this.atualizarSemaforosVisuais();

    // Expõe colisores gerados para o ES3DColisoes
    this.world.forestColliders = this.forestColliders;
    this.world.coastColliders = this.coastColliders;
  }

  // ============================================================================
  // 1. ✨ REFLEXOS REALISTAS COM PMREMGenerator
  // ============================================================================
  aplicarReflexosPMREM() {
    const THREE = this.THREE;
    if (!THREE.PMREMGenerator) return;

    try {
      const pmrem = new THREE.PMREMGenerator(this.world.renderer);
      pmrem.compileEquirectangularShader();

      const envScene = new THREE.Scene();
      const c = document.createElement('canvas');
      c.width = 256; c.height = 128;
      const ctx = c.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 0, 128);
      grad.addColorStop(0.0, '#1d4ed8');
      grad.addColorStop(0.42, '#7dd3fc');
      grad.addColorStop(0.54, '#fef3c7');
      grad.addColorStop(0.60, '#475569');
      grad.addColorStop(1.0, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 128);

      const skyTex = new THREE.CanvasTexture(c);
      const skyGeo = new THREE.SphereGeometry(20, 24, 16);
      const skyMat = new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide });
      envScene.add(new THREE.Mesh(skyGeo, skyMat));

      const sunDisc = new THREE.Mesh(new THREE.SphereGeometry(2.2, 12, 12), new THREE.MeshBasicMaterial({ color: 0xfffbeb }));
      sunDisc.position.set(8, 11, -10);
      envScene.add(sunDisc);

      this.envRT = pmrem.fromScene(envScene, 0.04);
      this.world.scene.environment = this.envRT.texture;

      skyGeo.dispose(); skyMat.dispose(); skyTex.dispose();
      sunDisc.geometry.dispose(); sunDisc.material.dispose();
      pmrem.dispose();
    } catch (e) {}
  }

  // ============================================================================
  // 2. ⛈️❄️ CLIMA AUTOMÁTICO REALISTA (CHUVA EM FILETES + RAIOS + NEVE/CONGELAMENTO)
  // ============================================================================
  criarTexturaFlocoNeve() {
    const c = document.createElement('canvas');
    c.width = 32; c.height = 32;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(16, 16, 2, 16, 16, 15);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.6, 'rgba(224,242,254,0.85)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 32, 32);
    return new this.THREE.CanvasTexture(c);
  }

  criarSistemaClimaRealista() {
    const THREE = this.THREE;
    const area = AMBIENTE_CONFIG.AREA_CLIMA;
    const alt = AMBIENTE_CONFIG.ALTURA_CLIMA;

    // A) Filetes de chuva reais (LineSegments — parece água caindo de verdade!)
    const qtdChuva = AMBIENTE_CONFIG.GOTAS_CHUVA;
    const rainPos = new Float32Array(qtdChuva * 6);
    const rainSpd = new Float32Array(qtdChuva);
    for (let i = 0; i < qtdChuva; i++) {
      const rx = (Math.random() - 0.5) * area;
      const ry = Math.random() * alt;
      const rz = (Math.random() - 0.5) * area;
      const len = 0.72 + Math.random() * 0.45;
      const i6 = i * 6;
      rainPos[i6] = rx;             rainPos[i6 + 1] = ry;       rainPos[i6 + 2] = rz;
      rainPos[i6 + 3] = rx - 0.14;  rainPos[i6 + 4] = ry - len; rainPos[i6 + 5] = rz;
      rainSpd[i] = 26 + Math.random() * 10;
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute('position', new THREE.Float32BufferAttribute(rainPos, 3));
    const rainMat = new THREE.LineBasicMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.62,
      depthWrite: false
    });
    this.rainLines = new THREE.LineSegments(rainGeo, rainMat);
    this.rainLines.visible = false;
    this.rainPositions = rainPos;
    this.rainSpeeds = rainSpd;
    this.world.scene.add(this.rainLines);

    // B) Flocos de neve suaves (Points com textura circular difusa)
    const qtdNeve = AMBIENTE_CONFIG.FLOCOS_NEVE;
    const snowPos = new Float32Array(qtdNeve * 3);
    const snowSpd = new Float32Array(qtdNeve);
    for (let i = 0; i < qtdNeve; i++) {
      snowPos[i * 3] = (Math.random() - 0.5) * area;
      snowPos[i * 3 + 1] = Math.random() * alt;
      snowPos[i * 3 + 2] = (Math.random() - 0.5) * area;
      snowSpd[i] = 1.6 + Math.random() * 1.4;
    }
    this.snowFlakeTex = this.criarTexturaFlocoNeve();
    const snowGeo = new THREE.BufferGeometry();
    snowGeo.setAttribute('position', new THREE.Float32BufferAttribute(snowPos, 3));
    const snowMat = new THREE.PointsMaterial({
      color: 0xffffff,
      map: this.snowFlakeTex,
      size: 0.42,
      transparent: true,
      opacity: 0.92,
      depthWrite: false
    });
    this.snowPoints = new THREE.Points(snowGeo, snowMat);
    this.snowPoints.visible = false;
    this.snowPositions = snowPos;
    this.snowSpeeds = snowSpd;
    this.world.scene.add(this.snowPoints);

    // C) Raio 3D reutilizável no céu
    const boltPts = [];
    for (let i = 0; i < 9; i++) boltPts.push(new THREE.Vector3(0, i * 4, 0));
    const boltGeo = new THREE.BufferGeometry().setFromPoints(boltPts);
    const boltMat = new THREE.LineBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.95 });
    this.lightningBolt = new THREE.Line(boltGeo, boltMat);
    this.lightningBolt.visible = false;
    this.world.scene.add(this.lightningBolt);
  }

  criarCamadasNeveECongelamento() {
    const THREE = this.THREE;
    if (!this.world?.exteriorGroup) return;

    // Textura orgânica de neve branca e gelo cristalino
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 2400; i++) {
      const shade = 225 + Math.floor(Math.random() * 30);
      ctx.fillStyle = `rgba(${shade}, ${Math.min(255, shade + 6)}, 255, 0.35)`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 3 + Math.random() * 6, 3 + Math.random() * 6);
    }
    this.snowGroundTex = new THREE.CanvasTexture(c);
    this.snowGroundTex.wrapS = THREE.RepeatWrapping;
    this.snowGroundTex.wrapT = THREE.RepeatWrapping;
    this.snowGroundTex.repeat.set(16, 16);

    // Manto de neve sobre ruas, calçadas e terrenos (sobe progressivamente de 0% a 88%)
    const snowGroundMat = new THREE.MeshStandardMaterial({
      map: this.snowGroundTex,
      color: 0xf8fafc,
      roughness: 0.48,
      metalness: 0.08,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2
    });
    this.snowGroundMesh = new THREE.Mesh(new THREE.PlaneGeometry(280, 215), snowGroundMat);
    this.snowGroundMesh.rotation.x = -Math.PI / 2;
    this.snowGroundMesh.position.set(0, 0.098, -26);
    this.snowGroundMesh.visible = false;
    this.world.exteriorGroup.add(this.snowGroundMesh);

    // Neve acumulada no topo dos 24 prédios
    this.snowRoofCaps = [];
    const roofSnowMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.45,
      metalness: 0.06,
      transparent: true,
      opacity: 0
    });
    this.sharedMaterials.push(roofSnowMat);

    (this.world.buildingsMeta || []).forEach(b => {
      const cap = new THREE.Mesh(new THREE.BoxGeometry(b.bw + 0.55, 0.14, b.bd + 0.55), roofSnowMat);
      cap.position.set(b.centerX, b.bh + 0.42, b.centerZ);
      cap.visible = false;
      this.world.exteriorGroup.add(cap);
      this.snowRoofCaps.push(cap);
    });
  }

  mudarClimaAutomatico(novoModo) {
    if (this.weatherMode === novoModo) return;
    this.weatherMode = novoModo;

    const mensagens = {
      clear:  '☀️ O céu abriu em English City!',
      cloudy: '☁️ Nuvens escuras e carregadas estão se formando...',
      rain:   '⛈️ Tempestade com raios e trovões começou!',
      snow:   '❄️ Nevasca! A neve está cobrindo e congelando a cidade!'
    };

    if (window.Workspace?.mostrarAviso && mensagens[novoModo]) {
      window.Workspace.mostrarAviso(mensagens[novoModo], 'info', 3800);
    }
  }

  dispararRaioETrovao() {
    if (!this.lightningBolt || this.world.modoInterior) return;
    const p = this.world.localPlayer;
    const px = p?.x || 0;
    const pz = p?.z || 0;

    // Posiciona o raio em um ponto visível no céu ao redor da cidade
    const ang = Math.random() * Math.PI * 2;
    const dist = 28 + Math.random() * 44;
    const bx = px + Math.cos(ang) * dist;
    const bz = pz + Math.sin(ang) * dist;

    const posAttr = this.lightningBolt.geometry.attributes.position;
    let cx = bx;
    let cz = bz;
    for (let i = 0; i < posAttr.count; i++) {
      const y = 34 - i * 4.1;
      if (i > 0) {
        cx += (Math.random() - 0.5) * 3.8;
        cz += (Math.random() - 0.5) * 3.8;
      }
      posAttr.setXYZ(i, cx, Math.max(0.5, y), cz);
    }
    posAttr.needsUpdate = true;

    this.lightningBolt.visible = true;
    this.lightningFlash = 1.0;

    // Trovão chega com pequeno atraso realista (~0.35s)
    setTimeout(() => this.tocarTrovaoProcedural(), 350);
  }

  atualizarClimaAutomatico(delta, emInterior) {
    // 1. Relógio climático automático (transita suavemente entre as fases)
    this.weatherTimer -= delta;
    if (this.weatherTimer <= 0) {
      this.weatherCycleIndex = (this.weatherCycleIndex + 1) % CICLO_CLIMA.length;
      const proximo = CICLO_CLIMA[this.weatherCycleIndex];
      this.weatherTimer = proximo === 'cloudy'
        ? 24
        : AMBIENTE_CONFIG.DURACAO_FASE_CLIMA_SEG + Math.random() * 20;
      this.mudarClimaAutomatico(proximo);
    }

    // 2. Escurecimento e volume das nuvens carregadas
    const alvoEscuro = this.weatherMode === 'rain' ? 1.0 : (this.weatherMode === 'cloudy' ? 0.72 : (this.weatherMode === 'snow' ? 0.35 : 0.0));
    this.cloudDarkness += (alvoEscuro - this.cloudDarkness) * Math.min(1, delta * 0.45);

    if (this.world.cloudsGroup) {
      const corNuvem = new this.THREE.Color().setHex(0xffffff).lerp(new this.THREE.Color(0x283244), this.cloudDarkness);
      const escalaNuvem = 1 + this.cloudDarkness * 0.65;
      this.world.cloudsGroup.children.forEach(cloud => {
        cloud.scale.set(escalaNuvem, 1 + this.cloudDarkness * 0.35, escalaNuvem);
        cloud.children.forEach(puff => {
          if (puff.material?.color) {
            puff.material.color.copy(corNuvem);
            puff.material.opacity = 0.78 + this.cloudDarkness * 0.2;
          }
        });
      });
    }

    // 3. Acúmulo progressivo de neve e congelamento da água
    const alvoNeve = this.weatherMode === 'snow' ? 1.0 : 0.0;
    const velNeve = this.weatherMode === 'snow' ? 0.045 : 0.085; // Acumula em ~22s e derrete em ~12s
    this.snowAccumulation += (alvoNeve - this.snowAccumulation) * Math.min(1, delta * velNeve * 2.5);
    if (Math.abs(alvoNeve - this.snowAccumulation) < 0.004) this.snowAccumulation = alvoNeve;

    const temNeve = this.snowAccumulation > 0.01 && !emInterior;
    if (this.snowGroundMesh) {
      this.snowGroundMesh.visible = temNeve;
      this.snowGroundMesh.material.opacity = Math.min(0.88, this.snowAccumulation * 0.92);
    }
    this.snowRoofCaps.forEach(cap => {
      cap.visible = temNeve;
      if (cap.material) cap.material.opacity = Math.min(0.95, this.snowAccumulation);
    });
    if (this.fountainIceDisc) {
      this.fountainIceDisc.visible = this.snowAccumulation > 0.45 && !emInterior;
      this.fountainIceDisc.material.opacity = Math.min(0.92, Math.max(0, (this.snowAccumulation - 0.45) * 1.8));
    }

    // 4. Neblina, luzes e clarão de raio
    if (this.lightningFlash > 0) {
      this.lightningFlash = Math.max(0, this.lightningFlash - delta * 3.8);
      if (this.lightningBolt) {
        this.lightningBolt.visible = this.lightningFlash > 0.32 && !emInterior;
        this.lightningBolt.material.opacity = this.lightningFlash;
      }
    }

    if (this.world.scene?.fog && !emInterior) {
      const alvoNeblina = this.weatherMode === 'rain' ? 0.012 : (this.weatherMode === 'snow' ? 0.010 : (this.weatherMode === 'cloudy' ? 0.0075 : 0.005));
      this.world.scene.fog.density += (alvoNeblina - this.world.scene.fog.density) * Math.min(1, delta * 1.8);
    }

    // Escurece ligeiramente o ambiente na tempestade e dá clarão nos raios
    if (this.world.ambientLight && !emInterior) {
      const hora = new Date().getHours();
      const baseAmb = (hora >= 18 || hora < 6) ? 0.45 : (hora >= 17 ? 0.65 : 0.85);
      const fatorTempestade = 1 - this.cloudDarkness * 0.36;
      const bonusGelo = this.snowAccumulation * 0.14;
      this.world.ambientLight.intensity = baseAmb * fatorTempestade + bonusGelo + this.lightningFlash * 1.45;
    }

    // Disparo periódico de raios durante a chuva
    if (this.weatherMode === 'rain' && !emInterior) {
      this.lightningTimer -= delta;
      if (this.lightningTimer <= 0) {
        this.lightningTimer = AMBIENTE_CONFIG.INTERVALO_RAIO_MIN_SEG +
          Math.random() * (AMBIENTE_CONFIG.INTERVALO_RAIO_MAX_SEG - AMBIENTE_CONFIG.INTERVALO_RAIO_MIN_SEG);
        this.dispararRaioETrovao();
      }
    }

    // 5. Atualiza queda dos filetes de chuva
    const px = this.world.localPlayer?.x || 0;
    const pz = this.world.localPlayer?.z || 0;
    const area = AMBIENTE_CONFIG.AREA_CLIMA;
    const half = area / 2;
    const alt = AMBIENTE_CONFIG.ALTURA_CLIMA;

    if (this.rainLines) {
      const chovendo = this.weatherMode === 'rain' && !emInterior;
      this.rainLines.visible = chovendo;
      if (chovendo) {
        const arr = this.rainPositions;
        const spd = this.rainSpeeds;
        for (let i = 0; i < AMBIENTE_CONFIG.GOTAS_CHUVA; i++) {
          const i6 = i * 6;
          const dy = spd[i] * delta;
          const dx = -2.4 * delta;
          arr[i6] += dx;     arr[i6 + 1] -= dy;
          arr[i6 + 3] += dx; arr[i6 + 4] -= dy;

          if (arr[i6 + 4] < 0.05) {
            const nx = px + (Math.random() - 0.5) * area;
            const ny = alt + Math.random() * 4;
            const nz = pz + (Math.random() - 0.5) * area;
            const len = 0.78 + Math.random() * 0.5;
            arr[i6] = nx;             arr[i6 + 1] = ny;       arr[i6 + 2] = nz;
            arr[i6 + 3] = nx - 0.15;  arr[i6 + 4] = ny - len; arr[i6 + 5] = nz;
          } else {
            if (arr[i6] < px - half) { arr[i6] += area; arr[i6 + 3] += area; }
            if (arr[i6] > px + half) { arr[i6] -= area; arr[i6 + 3] -= area; }
            if (arr[i6 + 2] < pz - half) { arr[i6 + 2] += area; arr[i6 + 5] += area; }
            if (arr[i6 + 2] > pz + half) { arr[i6 + 2] -= area; arr[i6 + 5] -= area; }
          }
        }
        this.rainLines.geometry.attributes.position.needsUpdate = true;
      }
    }

    // 6. Atualiza queda dos flocos de neve
    if (this.snowPoints) {
      const nevando = this.weatherMode === 'snow' && !emInterior;
      this.snowPoints.visible = nevando;
      if (nevando) {
        const arr = this.snowPositions;
        const spd = this.snowSpeeds;
        const agora = performance.now() * 0.0014;
        for (let i = 0; i < AMBIENTE_CONFIG.FLOCOS_NEVE; i++) {
          const i3 = i * 3;
          arr[i3 + 1] -= spd[i] * delta;
          arr[i3] += Math.sin(agora + i * 0.7) * 1.15 * delta;
          arr[i3 + 2] += Math.cos(agora + i * 0.5) * 0.75 * delta;

          if (arr[i3 + 1] < 0.06) {
            arr[i3] = px + (Math.random() - 0.5) * area;
            arr[i3 + 1] = alt + Math.random() * 4;
            arr[i3 + 2] = pz + (Math.random() - 0.5) * area;
          } else {
            if (arr[i3] < px - half) arr[i3] += area;
            if (arr[i3] > px + half) arr[i3] -= area;
            if (arr[i3 + 2] < pz - half) arr[i3 + 2] += area;
            if (arr[i3 + 2] > pz + half) arr[i3 + 2] -= area;
          }
        }
        this.snowPoints.geometry.attributes.position.needsUpdate = true;
      }
    }
  }

  // ============================================================================
  // 3. 🌊🏖️ ORLA MARÍTIMA, MAR VIVO, PÍER DE MADEIRA E FONTE DA PRAÇA
  // ============================================================================
  gerarTexturaAgua() {
    const THREE = this.THREE;
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(0.5, '#0369a1');
    grad.addColorStop(1, '#0c4a6e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    for (let y = 0; y < 512; y += 22) {
      ctx.strokeStyle = y % 44 === 0 ? 'rgba(186,230,253,0.42)' : 'rgba(56,189,248,0.28)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      for (let x = 0; x <= 512; x += 24) {
        const wy = y + Math.sin((x / 512) * Math.PI * 6 + y) * 5;
        if (x === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(12, 6);
    return tex;
  }

  criarCoqueiroRealista(x, z, altura = 6.6, inclinacaoAng = 0) {
    const THREE = this.THREE;
    const palm = new THREE.Group();
    const matTronco = new THREE.MeshStandardMaterial({ color: 0x7c5434, roughness: 0.92 });
    const matFolha = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.78, side: THREE.DoubleSide });
    const matCoco = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.85 });

    const segs = 7;
    const segH = altura / segs;
    let curX = 0;
    let curY = 0;
    for (let i = 0; i < segs; i++) {
      const rBot = 0.22 - i * 0.016;
      const rTop = 0.20 - i * 0.016;
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, segH + 0.08, 8), matTronco);
      const bend = (i / segs) * 0.26;
      seg.position.set(curX, curY + segH * 0.5, 0);
      seg.rotation.z = -bend;
      palm.add(seg);
      curX += Math.sin(bend) * segH;
      curY += Math.cos(bend) * segH;
    }

    // Copa de 8 folhas arqueadas de coqueiro
    const crown = new THREE.Group();
    crown.position.set(curX, curY, 0);
    for (let f = 0; f < 8; f++) {
      const ang = (f / 8) * Math.PI * 2;
      const frondGrp = new THREE.Group();
      frondGrp.rotation.y = ang;
      const frond1 = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 1.85), matFolha);
      frond1.position.set(0, 0.12, 0.92);
      frond1.rotation.x = 0.28;
      const frond2 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 1.45), matFolha);
      frond2.position.set(0, -0.35, 2.25);
      frond2.rotation.x = 0.78;
      frondGrp.add(frond1, frond2);
      crown.add(frondGrp);
    }

    // Cocos sob a copa
    for (let c = 0; c < 3; c++) {
      const a = (c / 3) * Math.PI * 2;
      const coco = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), matCoco);
      coco.position.set(Math.cos(a) * 0.18, -0.18, Math.sin(a) * 0.18);
      crown.add(coco);
    }

    palm.add(crown);
    palm.position.set(x, 0, z);
    palm.rotation.y = inclinacaoAng;
    palm.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.world.exteriorGroup.add(palm);

    this.forestColliders.push({ x, z, r: 0.34, tag: 'palm' });
  }

  criarOrlaPraiaPierEFonte() {
    const THREE = this.THREE;
    if (!this.world.exteriorGroup) return;

    this.coastColliders = [];

    // 1. Calçadão da Orla (z = 64..70) com 6 bancos voltados para o mar
    const calcadao = new THREE.Mesh(
      new THREE.PlaneGeometry(250, 6.2),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.88 })
    );
    calcadao.rotation.x = -Math.PI / 2;
    calcadao.position.set(0, 0.075, 67);
    calcadao.receiveShadow = true;
    this.world.exteriorGroup.add(calcadao);

    const mureta = new THREE.Mesh(
      new THREE.BoxGeometry(250, 0.22, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 })
    );
    mureta.position.set(0, 0.11, 70.1);
    this.world.exteriorGroup.add(mureta);

    const benchWood = new THREE.MeshStandardMaterial({ color: 0x8b5a35, roughness: 0.78 });
    const benchMetal = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.65, roughness: 0.38 });
    [-42, -24, -10, 10, 24, 42].forEach(bx => {
      const bench = new THREE.Group();
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.12, 0.48), benchWood);
      seat.position.y = 0.56;
      const back = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.44, 0.10), benchWood);
      back.position.set(0, 0.84, -0.20);
      [-0.72, 0.72].forEach(px => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.54, 0.42), benchMetal);
        leg.position.set(px, 0.27, 0);
        bench.add(leg);
      });
      bench.add(seat, back);
      bench.position.set(bx, 0.08, 67.6);
      bench.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      this.world.exteriorGroup.add(bench);

      this.coastColliders.push({ minX: bx - 0.96, maxX: bx + 0.96, minZ: 67.3, maxZ: 67.9, tag: 'coast_bench' });
    });

    // 2. Faixa de Areia Dourada (z = 70..84) + Guarda-sóis + Coqueiros inclinados
    const areia = new THREE.Mesh(
      new THREE.PlaneGeometry(280, 15),
      new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.95 })
    );
    areia.rotation.x = -Math.PI / 2;
    areia.position.set(0, 0.04, 77.5);
    areia.receiveShadow = true;
    this.world.exteriorGroup.add(areia);

    // Guarda-sóis coloridos na areia
    const coresGuardaSol = [0xef4444, 0x0ea5e9, 0xf59e0b, 0x10b981, 0xec4899, 0x8b5cf6];
    [-38, -22, -12, 12, 22, 38].forEach((ux, idx) => {
      const ug = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 2.35, 8), new THREE.MeshStandardMaterial({ color: 0xe2e8f0 }));
      pole.position.y = 1.18;
      const top = new THREE.Mesh(
        new THREE.ConeGeometry(1.55, 0.55, 10),
        new THREE.MeshStandardMaterial({ color: coresGuardaSol[idx % coresGuardaSol.length], roughness: 0.7 })
      );
      top.position.y = 2.35;
      const chair = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.22, 1.65), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 }));
      chair.position.set(0.85, 0.14, 0.2);
      ug.add(pole, top, chair);
      ug.position.set(ux, 0.04, 75.5 + (idx % 2) * 1.6);
      this.world.exteriorGroup.add(ug);
    });

    // Coqueiros realistas ao longo da praia
    [-56, -46, -30, -16, 16, 30, 46, 56].forEach((px, i) => {
      this.criarCoqueiroRealista(px, 72.2 + (i % 2) * 1.4, 6.2 + (i % 3) * 0.7, (i % 2 === 0 ? 0.4 : -0.4));
    });

    // 3. Faixa de Espuma (Arrebentação animada) + Oceano Vivo (z = 83..185)
    this.foamLineMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(290, 2.4),
      new THREE.MeshBasicMaterial({ color: 0xf0f9ff, transparent: true, opacity: 0.62, depthWrite: false })
    );
    this.foamLineMesh.rotation.x = -Math.PI / 2;
    this.foamLineMesh.position.set(0, 0.065, 84.4);
    this.world.exteriorGroup.add(this.foamLineMesh);

    this.waterTexture = this.gerarTexturaAgua();
    const waterMat = new THREE.MeshStandardMaterial({
      map: this.waterTexture,
      color: 0x38bdf8,
      roughness: 0.14,
      metalness: 0.35,
      transparent: true,
      opacity: 0.90
    });
    const oceano = new THREE.Mesh(new THREE.PlaneGeometry(310, 105), waterMat);
    oceano.rotation.x = -Math.PI / 2;
    oceano.position.set(0, 0.055, 136);
    this.world.exteriorGroup.add(oceano);
    this.waterMeshes.push(oceano);

    // 4. Píer de Madeira avançando sobre a areia e o mar (x = -2.4..2.4, z = 72..96)
    const pierGroup = new THREE.Group();
    const matMadeiraPier = new THREE.MeshStandardMaterial({ color: 0x7c4a2d, roughness: 0.85 });
    const matEstaca = new THREE.MeshStandardMaterial({ color: 0x4a2c1a, roughness: 0.95 });
    const matLanterna = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 1.4 });

    const deckPier = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.24, 24.4), matMadeiraPier);
    deckPier.position.set(0, 0.20, 84.2);
    deckPier.receiveShadow = true;
    pierGroup.add(deckPier);

    // Estacas + postes de guarda-corpo + corda/barra lateral + lanternas
    for (let pz = 73; pz <= 95.5; pz += 3.2) {
      [-2.25, 2.25].forEach(px => {
        const estaca = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.85, 8), matEstaca);
        estaca.position.set(px, 0.45, pz);
        pierGroup.add(estaca);
        if (pz === 79.4 || pz === 89.0 || pz >= 95.0) {
          const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), matLanterna);
          lamp.position.set(px, 1.42, pz);
          pierGroup.add(lamp);
        }
      });
    }
    [-2.25, 2.25].forEach(px => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.09, 23.2), matMadeiraPier);
      rail.position.set(px, 1.18, 84.2);
      pierGroup.add(rail);
    });

    // Bancos na ponta do píer para observar o navio e veleiros
    [-1.75, 1.75].forEach(px => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.42, 1.8), benchWood);
      b.position.set(px, 0.52, 93.8);
      pierGroup.add(b);
    });

    this.world.exteriorGroup.add(pierGroup);

    // 5. Fonte da Praça Central (x=21.65, z=-99.35) + Disco de Gelo (aparece na neve!)
    const fx = 21.65;
    const fz = -99.35;
    this.waterFountainTexture = this.waterTexture.clone();
    this.waterFountainTexture.needsUpdate = true;
    this.waterFountainTexture.repeat.set(2, 2);

    const aguaFonte = new THREE.Mesh(
      new THREE.CircleGeometry(1.01, 28),
      new THREE.MeshStandardMaterial({
        map: this.waterFountainTexture,
        color: 0x7dd3fc,
        roughness: 0.12,
        metalness: 0.3,
        transparent: true,
        opacity: 0.86
      })
    );
    aguaFonte.rotation.x = -Math.PI / 2;
    aguaFonte.position.set(fx, 0.80, fz);
    this.world.exteriorGroup.add(aguaFonte);
    this.waterMeshes.push(aguaFonte);

    this.fountainIceDisc = new THREE.Mesh(
      new THREE.CircleGeometry(1.02, 28),
      new THREE.MeshStandardMaterial({
        color: 0xe0f2fe,
        roughness: 0.08,
        metalness: 0.55,
        transparent: true,
        opacity: 0
      })
    );
    this.fountainIceDisc.rotation.x = -Math.PI / 2;
    this.fountainIceDisc.position.set(fx, 0.82, fz);
    this.fountainIceDisc.visible = false;
    this.world.exteriorGroup.add(this.fountainIceDisc);

    const qtdGotas = 60;
    const jetPos = new Float32Array(qtdGotas * 3);
    this.fountainVelocities = [];
    for (let i = 0; i < qtdGotas; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 0.35 + Math.random() * 0.45;
      jetPos[i * 3] = fx; jetPos[i * 3 + 1] = 2.05; jetPos[i * 3 + 2] = fz;
      this.fountainVelocities.push({ vx: Math.cos(ang) * spd, vy: 1.4 + Math.random() * 1.1, vz: Math.sin(ang) * spd, fx, fz });
    }
    const jetGeo = new THREE.BufferGeometry();
    jetGeo.setAttribute('position', new THREE.Float32BufferAttribute(jetPos, 3));
    this.fountainJets = new THREE.Points(
      jetGeo,
      new THREE.PointsMaterial({ color: 0xe0f2fe, size: 0.12, transparent: true, opacity: 0.85, depthWrite: false })
    );
    this.world.exteriorGroup.add(this.fountainJets);
  }

  atualizarAguaEFonte(delta) {
    // Congela a velocidade das ondas suavemente se o gelo/neve estiver muito forte
    const fatorFluidez = Math.max(0.2, 1 - this.snowAccumulation * 0.7);

    if (this.waterTexture) {
      this.waterTexture.offset.x = (this.waterTexture.offset.x + delta * 0.07 * fatorFluidez) % 1;
      this.waterTexture.offset.y = (this.waterTexture.offset.y + delta * 0.035 * fatorFluidez) % 1;
    }
    if (this.foamLineMesh) {
      const t = performance.now() * 0.0018;
      this.foamLineMesh.position.z = 84.3 + Math.sin(t) * 0.55;
      this.foamLineMesh.material.opacity = 0.45 + Math.sin(t) * 0.20;
    }
    if (this.waterFountainTexture) {
      this.waterFountainTexture.offset.x = (this.waterFountainTexture.offset.x + delta * 0.14 * fatorFluidez) % 1;
      this.waterFountainTexture.offset.y = (this.waterFountainTexture.offset.y + delta * 0.09 * fatorFluidez) % 1;
    }
    if (this.fountainJets) {
      const congelada = this.snowAccumulation > 0.65;
      this.fountainJets.visible = !this.world.modoInterior && !congelada;
      if (this.fountainJets.visible) {
        const posAttr = this.fountainJets.geometry.attributes.position;
        const arr = posAttr.array;
        for (let i = 0; i < this.fountainVelocities.length; i++) {
          const v = this.fountainVelocities[i];
          const i3 = i * 3;
          v.vy -= 4.8 * delta;
          arr[i3] += v.vx * delta;
          arr[i3 + 1] += v.vy * delta;
          arr[i3 + 2] += v.vz * delta;
          if (arr[i3 + 1] < 0.80) {
            const ang = Math.random() * Math.PI * 2;
            const spd = 0.32 + Math.random() * 0.48;
            arr[i3] = v.fx; arr[i3 + 1] = 2.08; arr[i3 + 2] = v.fz;
            v.vx = Math.cos(ang) * spd; v.vy = 1.3 + Math.random() * 1.1; v.vz = Math.sin(ang) * spd;
          }
        }
        posAttr.needsUpdate = true;
      }
    }
  }

  // ============================================================================
  // 4. 🌲🌳🌿 MATA REALISTA EM ESCALA NATURAL (ÁRVORES ALTAS, BAIXAS E ARBUSTOS)
  // ============================================================================
  criarArvoreRealista(x, z, altura, tipo = 'alta', mats) {
    const THREE = this.THREE;
    const tree = new THREE.Group();

    const ehAlta = tipo === 'alta';
    const troncoH = ehAlta ? altura * 0.56 : altura * 0.45;
    const rBase = ehAlta ? 0.36 + altura * 0.015 : 0.18 + altura * 0.012;
    const rTopo = rBase * 0.54;

    // Tronco cônico + raízes aparentes na base
    const tronco = new THREE.Mesh(new THREE.CylinderGeometry(rTopo, rBase, troncoH, 9), mats.bark);
    tronco.position.y = troncoH * 0.5;
    tree.add(tronco);

    if (ehAlta) {
      for (let r = 0; r < 4; r++) {
        const ang = (r / 4) * Math.PI * 2 + 0.3;
        const raiz = new THREE.Mesh(new THREE.CylinderGeometry(rBase * 0.28, rBase * 0.48, 0.9, 6), mats.bark);
        raiz.position.set(Math.cos(ang) * rBase * 0.65, 0.32, Math.sin(ang) * rBase * 0.65);
        raiz.rotation.z = -Math.cos(ang) * 0.55;
        raiz.rotation.x = Math.sin(ang) * 0.55;
        tree.add(raiz);
      }
    }

    // Galhos principais visíveis sustentando a copa
    const qtdGalhos = ehAlta ? 4 : 3;
    for (let g = 0; g < qtdGalhos; g++) {
      const ang = (g / qtdGalhos) * Math.PI * 2 + (x * 0.13);
      const galhoLen = ehAlta ? 1.85 : 1.05;
      const galho = new THREE.Mesh(new THREE.CylinderGeometry(rTopo * 0.38, rTopo * 0.68, galhoLen, 6), mats.bark);
      galho.position.set(
        Math.cos(ang) * galhoLen * 0.36,
        troncoH * 0.84 + galhoLen * 0.25,
        Math.sin(ang) * galhoLen * 0.36
      );
      galho.rotation.z = -Math.cos(ang) * 0.72;
      galho.rotation.x = Math.sin(ang) * 0.72;
      tree.add(galho);
    }

    // Copa orgânica em múltiplas camadas irregulares (Dodecahedron suavizado com tons variados)
    const canopyY = troncoH + (ehAlta ? 1.35 : 0.72);
    const raioBaseCopa = ehAlta ? altura * 0.26 : altura * 0.30;
    const clusters = ehAlta ? 7 : 5;

    for (let c = 0; c < clusters; c++) {
      const matLeaf = c === 0 ? mats.leafDeep : (c % 2 === 0 ? mats.leafMid : mats.leafLight);
      const raio = c === 0 ? raioBaseCopa : raioBaseCopa * (0.58 + (c % 3) * 0.12);
      const blob = new THREE.Mesh(new THREE.DodecahedronGeometry(raio, 1), matLeaf);

      if (c === 0) {
        blob.position.set(0, canopyY + raio * 0.28, 0);
        blob.scale.set(1.12, 0.92, 1.08);
      } else {
        const ang = ((c - 1) / (clusters - 1)) * Math.PI * 2 + (z * 0.17);
        const offR = raioBaseCopa * 0.68;
        const offY = (c % 2 === 0 ? 0.35 : -0.22) * raioBaseCopa;
        blob.position.set(Math.cos(ang) * offR, canopyY + offY, Math.sin(ang) * offR);
        blob.scale.set(1.05, 0.84, 1.0);
      }
      tree.add(blob);
    }

    tree.position.set(x, 0, z);
    tree.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.natureGroup.add(tree);

    this.forestColliders.push({ x, z, r: rBase + 0.14, tag: 'forest_tree' });
  }

  criarArbustoRealista(x, z, escala, mats) {
    const THREE = this.THREE;
    const bush = new THREE.Group();
    const parts = 3 + Math.floor(escala * 2);

    for (let i = 0; i < parts; i++) {
      const ang = (i / parts) * Math.PI * 2;
      const r = (0.34 + (i % 2) * 0.14) * escala;
      const m = new THREE.Mesh(
        new THREE.DodecahedronGeometry(r, 1),
        i % 2 === 0 ? mats.bushDark : mats.bushLight
      );
      m.position.set(Math.cos(ang) * r * 0.65, r * 0.68, Math.sin(ang) * r * 0.65);
      m.scale.set(1.15, 0.78, 1.1);
      bush.add(m);
    }

    bush.position.set(x, 0, z);
    bush.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.natureGroup.add(bush);
  }

  criarMataRealistaEVegetacao() {
    const THREE = this.THREE;
    if (!this.world?.exteriorGroup) return;

    this.natureGroup = new THREE.Group();
    this.natureGroup.name = 'ForestAndNatureGroup';

    const mats = {
      bark:      new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.96 }),
      leafDeep:  new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.88 }),
      leafMid:   new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.86 }),
      leafLight: new THREE.MeshStandardMaterial({ color: 0x22863a, roughness: 0.84 }),
      bushDark:  new THREE.MeshStandardMaterial({ color: 0x155e34, roughness: 0.92 }),
      bushLight: new THREE.MeshStandardMaterial({ color: 0x2e8b47, roughness: 0.90 }),
      rock:      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.95 })
    };
    Object.values(mats).forEach(m => this.sharedMaterials.push(m));

    // 1. Piso de mata verde-musgo + trilha de terra na Reserva Ecológica Oeste (x = -56..-75, z = -102..+60)
    const chaoMataOeste = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 162),
      new THREE.MeshStandardMaterial({ color: 0x144528, roughness: 0.98 })
    );
    chaoMataOeste.rotation.x = -Math.PI / 2;
    chaoMataOeste.position.set(-65.5, 0.025, -21);
    chaoMataOeste.receiveShadow = true;
    this.natureGroup.add(chaoMataOeste);

    const trilhaMata = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 148),
      new THREE.MeshStandardMaterial({ color: 0x7c5836, roughness: 0.96 })
    );
    trilhaMata.rotation.x = -Math.PI / 2;
    trilhaMata.position.set(-61.5, 0.038, -20);
    this.natureGroup.add(trilhaMata);

    // Piso do Bosque Sudeste (x = +37..+78, z = +16..+60)
    const chaoBosqueLeste = new THREE.Mesh(
      new THREE.PlaneGeometry(42, 46),
      new THREE.MeshStandardMaterial({ color: 0x164e2c, roughness: 0.98 })
    );
    chaoBosqueLeste.rotation.x = -Math.PI / 2;
    chaoBosqueLeste.position.set(57, 0.025, 39);
    chaoBosqueLeste.receiveShadow = true;
    this.natureGroup.add(chaoBosqueLeste);

    // 2. Reserva Ecológica Oeste: Árvores Altas (8m-11m), Baixas (4m-5.5m), Arbustos e Pedras (deixando a trilha em x=-61.5 livre!)
    const posMataOeste = [
      [-69, -95, 10.6, 'alta'], [-57.5, -88, 5.2, 'baixa'], [-71, -80, 9.8, 'alta'],
      [-66, -70, 8.6, 'alta'],  [-57, -64, 4.4, 'baixa'],   [-72, -56, 10.8, 'alta'],
      [-67.5, -45, 9.2, 'alta'],[-71.5, -32, 10.2, 'alta'], [-66.5, -20, 8.8, 'alta'],
      [-57.5, -14, 4.8, 'baixa'],[-71, -6, 10.4, 'alta'],   [-66.5, 8, 9.0, 'alta'],
      [-57.5, 16, 4.6, 'baixa'],[-71, 24, 10.5, 'alta'],    [-66.5, 36, 9.4, 'alta'],
      [-56.5, 42, 5.0, 'baixa'],[-71.5, 48, 9.8, 'alta'],   [-65, 55, 8.2, 'alta'],
      // Transição Sudoeste (livre entre a mata e o loteamento que começa em x=-33)
      [-48, 22, 8.4, 'alta'],   [-42, 34, 4.8, 'baixa'],    [-50, 46, 9.0, 'alta'],
      [-41, 53, 4.3, 'baixa']
    ];
    posMataOeste.forEach(([x, z, alt, tipo]) => this.criarArvoreRealista(x, z, alt, tipo, mats));

    // 3. Bosque Sudeste (entre o loteamento leste e a orla)
    const posBosqueLeste = [
      [42, 22, 8.8, 'alta'],   [52, 26, 5.1, 'baixa'],  [64, 22, 10.2, 'alta'],
      [73, 30, 9.4, 'alta'],   [44, 38, 4.5, 'baixa'],  [56, 40, 9.6, 'alta'],
      [68, 44, 10.5, 'alta'],  [42, 52, 8.2, 'alta'],   [54, 54, 4.8, 'baixa'],
      [69, 55, 8.6, 'alta']
    ];
    posBosqueLeste.forEach(([x, z, alt, tipo]) => this.criarArvoreRealista(x, z, alt, tipo, mats));

    // 4. Cinturão Verde Norte (ao pé das montanhas, atrás das 3 torres residenciais)
    const posNorte = [
      [-68, -124, 10.2, 'alta'], [-42, -125, 8.8, 'alta'], [-32, -123, 4.9, 'baixa'],
      [-4, -125, 9.8, 'alta'],   [12, -126, 5.2, 'baixa'], [30, -124, 10.4, 'alta'],
      [42, -125, 4.7, 'baixa'],  [66, -125, 9.2, 'alta']
    ];
    posNorte.forEach(([x, z, alt, tipo]) => this.criarArvoreRealista(x, z, alt, tipo, mats));

    // 5. Faixa arborizada de separação entre Avenida Central e Avenidas Laterais (x = ±23.5, espaçadas e realistas)
    for (let z = -76; z <= 4; z += 16) {
      this.criarArvoreRealista(-23.8, z, z % 32 === 0 ? 7.8 : 4.8, z % 32 === 0 ? 'alta' : 'baixa', mats);
      this.criarArvoreRealista( 23.8, z, z % 32 === 0 ? 4.9 : 7.6, z % 32 === 0 ? 'baixa' : 'alta', mats);
    }

    // 6. Arbustos realistas e pedras naturais distribuídos pela mata e bosques
    const arbustosCoords = [
      [-65, -90, 1.3], [-58, -76, 1.0], [-68, -62, 1.4], [-58, -50, 1.1], [-65, -36, 1.3],
      [-68, -12, 1.4], [-58, 4, 1.0],   [-65, 20, 1.2],  [-58, 30, 1.3],  [-68, 44, 1.5],
      [-45, 28, 1.1],  [-46, 50, 1.2],  [47, 29, 1.2],   [60, 32, 1.4],   [50, 47, 1.1],
      [64, 50, 1.3],   [-36, -122, 1.2],[6, -124, 1.3],  [36, -122, 1.2]
    ];
    arbustosCoords.forEach(([x, z, esc]) => this.criarArbustoRealista(x, z, esc, mats));

    [[-64, -74, 0.8], [-67, -26, 1.1], [-58, 38, 0.9], [48, 34, 1.0], [62, 48, 0.85]].forEach(([rx, rz, rs]) => {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rs, 0), mats.rock);
      rock.scale.set(1.3, 0.65, 1.1);
      rock.position.set(rx, rs * 0.35, rz);
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.natureGroup.add(rock);
    });

    this.world.exteriorGroup.add(this.natureGroup);
  }

  // ============================================================================
  // 5. 🚦 SEMÁFOROS SINCRONIZADOS + FARÓIS NOTURNOS
  // ============================================================================
  criarFaroisNoturnosVeiculos() {
    const THREE = this.THREE;
    this.headlightBeams = [];

    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    (this.world.cars || []).forEach(car => {
      [-0.58, 0.58].forEach(x => {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.65, 3.2, 12, 1, true), beamMat);
        cone.rotation.x = Math.PI / 2;
        cone.position.set(x, 0.56, -3.55);
        cone.visible = false;
        car.add(cone);
        this.headlightBeams.push(cone);
      });
    });

    (this.world.motos || []).forEach(moto => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.55, 2.8, 12, 1, true), beamMat);
      cone.rotation.x = -Math.PI / 2;
      cone.position.set(0, 0.84, 2.25);
      cone.visible = false;
      moto.add(cone);
      this.headlightBeams.push(cone);
    });
  }

  atualizarSemaforosVisuais() {
    const mats = this.world.trafficLightMaterials;
    if (!mats) return;

    if (mats.greenMat)  mats.greenMat.emissiveIntensity  = this.trafficState === 'green'  ? 1.8 : 0.08;
    if (mats.yellowMat) mats.yellowMat.emissiveIntensity = this.trafficState === 'yellow' ? 1.8 : 0.08;
    if (mats.redMat)    mats.redMat.emissiveIntensity    = this.trafficState === 'red'    ? 1.8 : 0.08;
  }

  atualizarSemaforosEFarois(delta) {
    const cicloTotal =
      AMBIENTE_CONFIG.TEMPO_VERDE_SEG +
      AMBIENTE_CONFIG.TEMPO_AMARELO_SEG +
      AMBIENTE_CONFIG.TEMPO_VERMELHO_SEG;

    this.trafficTimer = (this.trafficTimer + delta) % cicloTotal;

    let novoEstado = 'green';
    if (this.trafficTimer < AMBIENTE_CONFIG.TEMPO_VERDE_SEG) novoEstado = 'green';
    else if (this.trafficTimer < AMBIENTE_CONFIG.TEMPO_VERDE_SEG + AMBIENTE_CONFIG.TEMPO_AMARELO_SEG) novoEstado = 'yellow';
    else novoEstado = 'red';

    if (novoEstado !== this.trafficState) {
      this.trafficState = novoEstado;
      this.atualizarSemaforosVisuais();
    }

    const hora = new Date().getHours();
    const acenderFarois = (hora >= 17 || hora < 6 || this.weatherMode === 'rain' || this.weatherMode === 'cloudy') && !this.world.modoInterior;
    for (let i = 0; i < this.headlightBeams.length; i++) {
      this.headlightBeams[i].visible = acenderFarois;
    }
  }

  devePararNoSemaforo(posZ, dir) {
    if (this.trafficState === 'green') return false;
    for (const cz of AMBIENTE_CONFIG.CRUZAMENTOS_Z) {
      if (dir > 0 && posZ < cz - 2.2 && posZ > cz - 6.8) return true;
      if (dir < 0 && posZ > cz + 2.2 && posZ < cz + 6.8) return true;
    }
    return false;
  }

  // ============================================================================
  // 6. 🔊 ÁUDIO ESPACIAL 3D + CHUVA, TROVÃO, VENTO DE INVERNO E ONDAS DO MAR
  // ============================================================================
  desbloquearAudioNoToque() {
    if (!this.audioEnabled || !this.world?.camera || !this.world?.scene) return;
    if (!this.audioStarted) {
      this.iniciarAudioEspacial3D();
    } else if (this.audioListener?.context?.state === 'suspended') {
      this.audioListener.context.resume().catch(() => {});
    }
  }

  gerarBufferFonteAgua(audioCtx) {
    const sampleRate = audioCtx.sampleRate;
    const len = Math.floor(sampleRate * 2.0);
    const buffer = audioCtx.createBuffer(1, len, sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      last = (last + 0.04 * (Math.random() * 2 - 1)) / 1.04;
      data[i] = last * 1.8 * (0.8 + 0.2 * Math.sin((i / sampleRate) * Math.PI * 3));
    }
    return buffer;
  }

  gerarBufferOndasMar(audioCtx) {
    const sampleRate = audioCtx.sampleRate;
    const len = Math.floor(sampleRate * 5.0);
    const buffer = audioCtx.createBuffer(1, len, sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const t = i / sampleRate;
      last = (last + 0.025 * (Math.random() * 2 - 1)) / 1.025;
      const onda = 0.45 + 0.55 * Math.pow(0.5 + 0.5 * Math.sin(t * Math.PI * 0.4), 1.6);
      data[i] = last * 2.6 * onda;
    }
    return buffer;
  }

  gerarBufferChuva(audioCtx) {
    const sampleRate = audioCtx.sampleRate;
    const len = Math.floor(sampleRate * 2.5);
    const buffer = audioCtx.createBuffer(1, len, sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.14 * white) / 1.14;
      data[i] = (last * 0.9 + white * 0.18) * 0.55;
    }
    return buffer;
  }

  gerarBufferVentoInverno(audioCtx) {
    const sampleRate = audioCtx.sampleRate;
    const len = Math.floor(sampleRate * 4.0);
    const buffer = audioCtx.createBuffer(1, len, sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const t = i / sampleRate;
      last = (last + 0.012 * (Math.random() * 2 - 1)) / 1.012;
      const rajada = 0.5 + 0.5 * Math.sin(t * Math.PI * 0.5);
      data[i] = last * 2.2 * rajada;
    }
    return buffer;
  }

  gerarBufferViolaoRua(audioCtx) {
    const sampleRate = audioCtx.sampleRate;
    const len = Math.floor(sampleRate * 4.0);
    const buffer = audioCtx.createBuffer(1, len, sampleRate);
    const data = buffer.getChannelData(0);
    const acordes = [
      [261.63, 329.63, 392.00], [196.00, 246.94, 392.00],
      [220.00, 261.63, 329.63], [174.61, 220.00, 349.23]
    ];
    for (let i = 0; i < len; i++) {
      const t = i / sampleRate;
      const idx = Math.min(3, Math.floor(t));
      const localT = t - idx;
      const env = Math.exp(-localT * 2.6) * Math.min(1, localT * 30);
      const notas = acordes[idx];
      let soma = 0;
      for (let n = 0; n < notas.length; n++) soma += Math.sin(2 * Math.PI * notas[n] * t);
      data[i] = (soma / notas.length) * env * 0.28;
    }
    return buffer;
  }

  gerarBufferPistaAviao(audioCtx) {
    const sampleRate = audioCtx.sampleRate;
    const len = Math.floor(sampleRate * 3.0);
    const buffer = audioCtx.createBuffer(1, len, sampleRate);
    const data = buffer.getChannelData(0);
    let smooth = 0;
    for (let i = 0; i < len; i++) {
      const t = i / sampleRate;
      smooth = (smooth + 0.015 * (Math.random() * 2 - 1)) / 1.015;
      data[i] = (smooth * 2.5 + Math.sin(2 * Math.PI * 92 * t) * 0.14) * 0.35;
    }
    return buffer;
  }

  tocarTrovaoProcedural() {
    if (!this.audioEnabled || !this.audioListener?.context) return;
    try {
      const ctx = this.audioListener.context;
      if (ctx.state === 'suspended') return;

      const dur = 2.6;
      const len = Math.floor(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const ch = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const t = i / ctx.sampleRate;
        last = (last + 0.04 * (Math.random() * 2 - 1)) / 1.04;
        const env = Math.exp(-t * 1.35) * (0.7 + 0.3 * Math.sin(t * 18));
        ch[i] = last * 3.5 * env;
      }

      const src = ctx.createBufferSource();
      src.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 180;
      const gain = ctx.createGain();
      const fatorInterior = this.world.modoInterior ? 0.28 : 1.0;
      gain.gain.value = 0.65 * AMBIENTE_CONFIG.VOLUME_AUDIO_3D * fatorInterior;

      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start();
    } catch (e) {}
  }

  iniciarAudioEspacial3D() {
    const THREE = this.THREE;
    if (!THREE.AudioListener || !THREE.PositionalAudio || this.audioStarted) return;

    try {
      this.audioStarted = true;
      this.audioListener = new THREE.AudioListener();
      this.world.camera.add(this.audioListener);
      const actx = this.audioListener.context;
      if (actx.state === 'suspended') actx.resume().catch(() => {});

      const criarPontoSonoro = (pos, buffer, refDist, maxDist, vol) => {
        const anchor = new THREE.Object3D();
        anchor.position.set(pos[0], pos[1], pos[2]);
        const sound = new THREE.PositionalAudio(this.audioListener);
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setRefDistance(refDist);
        sound.setMaxDistance(maxDist);
        sound.setRolloffFactor(1.4);
        sound.setVolume(vol * AMBIENTE_CONFIG.VOLUME_AUDIO_3D);
        sound.userData = { baseVolume: vol * AMBIENTE_CONFIG.VOLUME_AUDIO_3D };
        anchor.add(sound);
        this.world.scene.add(anchor);
        sound.play();
        this.spatialAnchors.push(anchor);
        this.spatialSounds.push(sound);
      };

      // Pontos sonoros espaciais da cidade
      criarPontoSonoro([21.65, 1.3, -99.35], this.gerarBufferFonteAgua(actx), 4, 24, 0.8);
      criarPontoSonoro([-8.8, 1.3, -24],     this.gerarBufferViolaoRua(actx), 3.5, 22, 0.85);
      criarPontoSonoro([68, 2.5, -55],       this.gerarBufferPistaAviao(actx), 10, 52, 0.65);
      criarPontoSonoro([0, 1.5, 86],         this.gerarBufferOndasMar(actx), 14, 58, 0.90);

      // Som ambiente global de chuva e vento de neve (volume controlado pelo clima atual)
      if (THREE.Audio) {
        this.weatherRainSound = new THREE.Audio(this.audioListener);
        this.weatherRainSound.setBuffer(this.gerarBufferChuva(actx));
        this.weatherRainSound.setLoop(true);
        this.weatherRainSound.setVolume(0);
        this.weatherRainSound.play();

        this.weatherWindSound = new THREE.Audio(this.audioListener);
        this.weatherWindSound.setBuffer(this.gerarBufferVentoInverno(actx));
        this.weatherWindSound.setLoop(true);
        this.weatherWindSound.setVolume(0);
        this.weatherWindSound.play();
      }
    } catch (e) {
      this.audioStarted = false;
    }
  }

  alternarAudioEspacial() {
    this.audioEnabled = !this.audioEnabled;
    const btn = document.getElementById('es-city-audio3d-btn');
    if (btn) btn.innerHTML = this.audioEnabled ? '🔊 3D SFX' : '🔇 3D SFX';

    if (this.audioEnabled && !this.audioStarted) {
      this.iniciarAudioEspacial3D();
    }
    this.spatialSounds.forEach(s => {
      try { s.setVolume(this.audioEnabled ? (s.userData?.baseVolume || 0.3) : 0); } catch (e) {}
    });
    if (!this.audioEnabled) {
      try { this.weatherRainSound?.setVolume(0); } catch (e) {}
      try { this.weatherWindSound?.setVolume(0); } catch (e) {}
    }
  }

  // ============================================================================
  // 🔄 ATUALIZAÇÃO POR FRAME & LIMPEZA DE MEMÓRIA
  // ============================================================================
  update(delta, emInterior = false) {
    this.atualizarClimaAutomatico(delta, emInterior);
    this.atualizarAguaEFonte(delta);
    this.atualizarSemaforosEFarois(delta);

    if (this.audioStarted && this.audioEnabled) {
      const fator = emInterior ? 0.14 : 1.0;
      this.spatialSounds.forEach(s => {
        try { s.setVolume((s.userData?.baseVolume || 0.3) * fator); } catch (e) {}
      });

      const volChuvaAlvo = this.weatherMode === 'rain' ? 0.48 * AMBIENTE_CONFIG.VOLUME_AUDIO_3D * (emInterior ? 0.25 : 1.0) : 0;
      const volVentoAlvo = this.weatherMode === 'snow' ? 0.42 * AMBIENTE_CONFIG.VOLUME_AUDIO_3D * (emInterior ? 0.22 : 1.0) : 0;
      try { this.weatherRainSound?.setVolume(volChuvaAlvo); } catch (e) {}
      try { this.weatherWindSound?.setVolume(volVentoAlvo); } catch (e) {}
    }
  }

  dispose() {
    this.spatialSounds.forEach(s => { try { if (s.isPlaying) s.stop(); } catch (e) {} });
    try { if (this.weatherRainSound?.isPlaying) this.weatherRainSound.stop(); } catch (e) {}
    try { if (this.weatherWindSound?.isPlaying) this.weatherWindSound.stop(); } catch (e) {}
    this.spatialSounds = [];
    this.weatherRainSound = null;
    this.weatherWindSound = null;

    this.spatialAnchors.forEach(a => { try { this.world.scene?.remove(a); } catch (e) {} });
    this.spatialAnchors = [];
    if (this.audioListener && this.world?.camera) {
      try { this.world.camera.remove(this.audioListener); } catch (e) {}
    }
    this.audioListener = null;
    this.audioStarted = false;

    [this.rainLines, this.snowPoints, this.lightningBolt].forEach(obj => {
      if (!obj) return;
      try {
        this.world.scene?.remove(obj);
        obj.geometry?.dispose();
        obj.material?.dispose();
      } catch (e) {}
    });
    this.rainLines = null; this.snowPoints = null; this.lightningBolt = null;

    if (this.natureGroup) {
      try { this.world.exteriorGroup?.remove(this.natureGroup); } catch (e) {}
      this.natureGroup = null;
    }

    [this.snowFlakeTex, this.snowGroundTex, this.waterTexture, this.waterFountainTexture].forEach(t => {
      if (t) try { t.dispose(); } catch (e) {}
    });
    this.sharedMaterials.forEach(m => { try { m.dispose(); } catch (e) {} });
    this.sharedMaterials = [];
    this.snowRoofCaps = [];
    this.forestColliders = [];
    this.coastColliders = [];
    this.waterMeshes = [];
    this.headlightBeams = [];

    if (this.envRT) {
      try {
        if (this.world?.scene) this.world.scene.environment = null;
        this.envRT.dispose();
      } catch (e) {}
      this.envRT = null;
    }
  }
}