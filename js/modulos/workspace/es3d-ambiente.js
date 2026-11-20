// js/modulos/workspace/es3d-ambiente.js
// 🌦️ Etapa 1: Reflexos PMREM, Clima Dinâmico, Água Viva, Semáforos Reais e Áudio Espacial 3D

// ⚙️ PARÂMETROS AJUSTÁVEIS (Mude aqui se quiser ajustar intensidade, tempos ou volume)
const AMBIENTE_CONFIG = {
  PARTICULAS_CLIMA: 1200,      // Quantidade de gotas de chuva / flocos de neve
  AREA_CLIMA: 64,              // Área (em metros) de clima que acompanha o avatar
  ALTURA_CLIMA: 24,            // Altura máxima de onde a chuva/neve cai
  TEMPO_VERDE_SEG: 8,          // Segundos de semáforo verde
  TEMPO_AMARELO_SEG: 2.2,      // Segundos de semáforo amarelo
  TEMPO_VERMELHO_SEG: 6,       // Segundos de semáforo vermelho
  CRUZAMENTOS_Z: [-56, -24],   // Posições Z das faixas de pedestres com semáforo
  VOLUME_AUDIO_3D: 0.45        // Volume geral do áudio 3D (de 0.0 até 1.0)
};

export class ES3DAmbiente {
  constructor(world) {
    this.world = world;
    this.THREE = window.THREE;

    // Clima
    this.weatherMode = 'clear'; // 'clear' | 'rain' | 'snow'
    this.weatherPoints = null;
    this.weatherPositions = null;
    this.weatherSpeeds = null;

    // Reflexos PMREM
    this.envRT = null;

    // Água viva e jatos da fonte
    this.waterTexture = null;
    this.waterFountainTexture = null;
    this.waterMeshes = [];
    this.fountainJets = null;
    this.fountainVelocities = [];

    // Semáforos e faróis noturnos
    this.trafficTimer = 0;
    this.trafficState = 'green'; // 'green' | 'yellow' | 'red'
    this.headlightBeams = [];

    // Áudio Espacial 3D
    this.audioEnabled = true;
    this.audioStarted = false;
    this.audioListener = null;
    this.spatialSounds = [];
    this.spatialAnchors = [];
  }

  init() {
    if (!this.THREE || !this.world?.scene || !this.world?.renderer) return;
    this.aplicarReflexosPMREM();
    this.criarSistemaClima();
    this.criarAguaVivaEJatosFonte();
    this.criarFaroisNoturnosVeiculos();
    this.atualizarSemaforosVisuais();
  }

  // ============================================================================
  // 1. ✨ REFLEXOS REALISTAS COM PMREMGenerator (VIDROS, CARROS E METAIS)
  // ============================================================================
  aplicarReflexosPMREM() {
    const THREE = this.THREE;
    if (!THREE.PMREMGenerator) return;

    try {
      const pmrem = new THREE.PMREMGenerator(this.world.renderer);
      pmrem.compileEquirectangularShader();

      const envScene = new THREE.Scene();

      // Gradiente de céu + horizonte + solo para criar reflexos naturais sem imagem externa
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 128;
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
      const skyDome = new THREE.Mesh(skyGeo, skyMat);
      envScene.add(skyDome);

      const sunDisc = new THREE.Mesh(
        new THREE.SphereGeometry(2.2, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xfffbeb })
      );
      sunDisc.position.set(8, 11, -10);
      envScene.add(sunDisc);

      this.envRT = pmrem.fromScene(envScene, 0.04);
      this.world.scene.environment = this.envRT.texture;

      // Limpa os objetos temporários usados apenas para gerar o mapa de reflexo
      skyGeo.dispose();
      skyMat.dispose();
      skyTex.dispose();
      sunDisc.geometry.dispose();
      sunDisc.material.dispose();
      pmrem.dispose();
    } catch (e) {}
  }

  // ============================================================================
  // 2. 🌧️❄️ CLIMA DINÂMICO COM PARTÍCULAS (THREE.Points)
  // ============================================================================
  criarSistemaClima() {
    const THREE = this.THREE;
    const qtd = AMBIENTE_CONFIG.PARTICULAS_CLIMA;
    const area = AMBIENTE_CONFIG.AREA_CLIMA;
    const alt = AMBIENTE_CONFIG.ALTURA_CLIMA;

    const positions = new Float32Array(qtd * 3);
    const speeds = new Float32Array(qtd);

    for (let i = 0; i < qtd; i++) {
      positions[i * 3] = (Math.random() - 0.5) * area;
      positions[i * 3 + 1] = Math.random() * alt;
      positions[i * 3 + 2] = (Math.random() - 0.5) * area;
      speeds[i] = 0.75 + Math.random() * 0.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xbae6fd,
      size: 0.22,
      transparent: true,
      opacity: 0.78,
      depthWrite: false
    });

    this.weatherPoints = new THREE.Points(geo, mat);
    this.weatherPoints.visible = false;
    this.weatherPositions = positions;
    this.weatherSpeeds = speeds;
    this.world.scene.add(this.weatherPoints);
  }

  alternarClima(modoForcado = null) {
    const ordem = ['clear', 'rain', 'snow'];
    if (modoForcado && ordem.includes(modoForcado)) {
      this.weatherMode = modoForcado;
    } else {
      const idx = ordem.indexOf(this.weatherMode);
      this.weatherMode = ordem[(idx + 1) % ordem.length];
    }

    if (this.weatherPoints) {
      if (this.weatherMode === 'clear') {
        this.weatherPoints.visible = false;
      } else if (this.weatherMode === 'rain') {
        this.weatherPoints.visible = !this.world.modoInterior;
        this.weatherPoints.material.color.setHex(0x93c5fd);
        this.weatherPoints.material.size = 0.19;
        this.weatherPoints.material.opacity = 0.78;
      } else if (this.weatherMode === 'snow') {
        this.weatherPoints.visible = !this.world.modoInterior;
        this.weatherPoints.material.color.setHex(0xffffff);
        this.weatherPoints.material.size = 0.32;
        this.weatherPoints.material.opacity = 0.92;
      }
    }

    const btn = document.getElementById('es-city-weather-btn');
    const infoClima = {
      clear: { label: '☀️ Clear', phrase: "What a bright and sunny day in English City!" },
      rain:  { label: '🌧️ Rain',  phrase: "It's raining outside! Don't forget your umbrella!" },
      snow:  { label: '❄️ Snow',  phrase: "Look! It's snowing! Put on your warm coat!" }
    }[this.weatherMode];

    if (btn && infoClima) btn.innerHTML = infoClima.label;
    if (infoClima) {
      if (window.Workspace?.mostrarAviso) {
        window.Workspace.mostrarAviso(`${infoClima.label} — "${infoClima.phrase}"`, 'info', 3800);
      }
      this.world.falarTextoNPC?.(infoClima.phrase, 'street');
    }
  }

  atualizarParticulasClima(delta, emInterior) {
    // Mantém a neblina coerente com o clima ativo mesmo após a atualização do ciclo dia/noite
    if (this.world.scene?.fog && !emInterior) {
      const alvoNeblina = this.weatherMode === 'rain' ? 0.011 : (this.weatherMode === 'snow' ? 0.0095 : 0.0055);
      this.world.scene.fog.density += (alvoNeblina - this.world.scene.fog.density) * Math.min(1, delta * 2.5);
    }

    if (!this.weatherPoints) return;
    if (this.weatherMode === 'clear' || emInterior) {
      this.weatherPoints.visible = false;
      return;
    }

    this.weatherPoints.visible = true;
    const pos = this.weatherPositions;
    const speeds = this.weatherSpeeds;
    const qtd = AMBIENTE_CONFIG.PARTICULAS_CLIMA;
    const area = AMBIENTE_CONFIG.AREA_CLIMA;
    const half = area / 2;
    const alt = AMBIENTE_CONFIG.ALTURA_CLIMA;

    const px = this.world.localPlayer?.x || 0;
    const pz = this.world.localPlayer?.z || 0;
    const isRain = this.weatherMode === 'rain';
    const velBase = isRain ? 24.0 : 2.8;
    const agora = performance.now() * 0.0015;

    for (let i = 0; i < qtd; i++) {
      const i3 = i * 3;
      pos[i3 + 1] -= velBase * speeds[i] * delta;

      if (isRain) {
        pos[i3] -= 1.8 * delta; // Leve inclinação de vento na chuva
      } else {
        pos[i3] += Math.sin(agora + i) * 0.9 * delta;
        pos[i3 + 2] += Math.cos(agora + i * 0.7) * 0.6 * delta;
      }

      if (pos[i3 + 1] < 0.05) {
        pos[i3] = px + (Math.random() - 0.5) * area;
        pos[i3 + 1] = alt + Math.random() * 4;
        pos[i3 + 2] = pz + (Math.random() - 0.5) * area;
      } else {
        if (pos[i3] < px - half) pos[i3] += area;
        if (pos[i3] > px + half) pos[i3] -= area;
        if (pos[i3 + 2] < pz - half) pos[i3 + 2] += area;
        if (pos[i3 + 2] > pz + half) pos[i3 + 2] -= area;
      }
    }

    this.weatherPoints.geometry.attributes.position.needsUpdate = true;
  }

  // ============================================================================
  // 3. 🌊 ÁGUA VIVA ANIMADA (FONTE DA PRAÇA CENTRAL + OCEANO NA COSTA SUL)
  // ============================================================================
  gerarTexturaAgua() {
    const THREE = this.THREE;
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 0, 256, 256);

    for (let y = 0; y < 256; y += 16) {
      ctx.strokeStyle = y % 32 === 0 ? 'rgba(186,230,253,0.45)' : 'rgba(56,189,248,0.35)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 0; x <= 256; x += 16) {
        const wy = y + Math.sin((x / 256) * Math.PI * 4) * 4;
        if (x === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 4);
    return tex;
  }

  criarAguaVivaEJatosFonte() {
    const THREE = this.THREE;
    if (!this.world.exteriorGroup) return;

    this.waterTexture = this.gerarTexturaAgua();
    const waterMat = new THREE.MeshStandardMaterial({
      map: this.waterTexture,
      color: 0x38bdf8,
      roughness: 0.14,
      metalness: 0.35,
      transparent: true,
      opacity: 0.88
    });

    // 1. Faixa de areia + oceano animado na Costa Sul (logo após o loteamento)
    const areiaCosta = new THREE.Mesh(
      new THREE.PlaneGeometry(240, 14),
      new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.95 })
    );
    areiaCosta.rotation.x = -Math.PI / 2;
    areiaCosta.position.set(0, 0.03, 72);
    this.world.exteriorGroup.add(areiaCosta);

    const oceano = new THREE.Mesh(new THREE.PlaneGeometry(260, 75), waterMat);
    oceano.rotation.x = -Math.PI / 2;
    oceano.position.set(0, 0.05, 114);
    this.world.exteriorGroup.add(oceano);
    this.waterMeshes.push(oceano, areiaCosta);

    // 2. Superfície ondulada + jatos vivos na fonte da Praça Central (x=21.65, z=-99.35)
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

    // 60 gotas animadas jorrando do topo da fonte
    const qtdGotas = 60;
    const jetPos = new Float32Array(qtdGotas * 3);
    this.fountainVelocities = [];

    for (let i = 0; i < qtdGotas; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 0.35 + Math.random() * 0.45;
      jetPos[i * 3] = fx;
      jetPos[i * 3 + 1] = 2.05;
      jetPos[i * 3 + 2] = fz;
      this.fountainVelocities.push({
        vx: Math.cos(ang) * spd,
        vy: 1.4 + Math.random() * 1.1,
        vz: Math.sin(ang) * spd,
        fx,
        fz
      });
    }

    const jetGeo = new THREE.BufferGeometry();
    jetGeo.setAttribute('position', new THREE.Float32BufferAttribute(jetPos, 3));
    const jetMat = new THREE.PointsMaterial({
      color: 0xe0f2fe,
      size: 0.12,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    this.fountainJets = new THREE.Points(jetGeo, jetMat);
    this.world.exteriorGroup.add(this.fountainJets);
  }

  atualizarAguaEFonte(delta) {
    if (this.waterTexture) {
      this.waterTexture.offset.x = (this.waterTexture.offset.x + delta * 0.08) % 1;
      this.waterTexture.offset.y = (this.waterTexture.offset.y + delta * 0.04) % 1;
    }
    if (this.waterFountainTexture) {
      this.waterFountainTexture.offset.x = (this.waterFountainTexture.offset.x + delta * 0.14) % 1;
      this.waterFountainTexture.offset.y = (this.waterFountainTexture.offset.y + delta * 0.09) % 1;
    }
    if (this.fountainJets && !this.world.modoInterior) {
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
          arr[i3] = v.fx;
          arr[i3 + 1] = 2.08;
          arr[i3 + 2] = v.fz;
          v.vx = Math.cos(ang) * spd;
          v.vy = 1.3 + Math.random() * 1.1;
          v.vz = Math.sin(ang) * spd;
        }
      }
      posAttr.needsUpdate = true;
    }
  }

  // ============================================================================
  // 4. 🚦 SEMÁFOROS SINCRONIZADOS COM TRÂNSITO + FARÓIS NOTURNOS
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

    // Cones leves para carros (alinhados aos faróis em z = -1.91)
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

    // Cone leve para motos (alinhado ao farol em z = +0.82)
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

    if (mats.greenMat)  mats.greenMat.emissiveIntensity  = this.trafficState === 'green'  ? 1.6 : 0.08;
    if (mats.yellowMat) mats.yellowMat.emissiveIntensity = this.trafficState === 'yellow' ? 1.6 : 0.08;
    if (mats.redMat)    mats.redMat.emissiveIntensity    = this.trafficState === 'red'    ? 1.6 : 0.08;
  }

  atualizarSemaforosEFarois(delta) {
    const cicloTotal =
      AMBIENTE_CONFIG.TEMPO_VERDE_SEG +
      AMBIENTE_CONFIG.TEMPO_AMARELO_SEG +
      AMBIENTE_CONFIG.TEMPO_VERMELHO_SEG;

    this.trafficTimer = (this.trafficTimer + delta) % cicloTotal;

    let novoEstado = 'green';
    if (this.trafficTimer < AMBIENTE_CONFIG.TEMPO_VERDE_SEG) {
      novoEstado = 'green';
    } else if (this.trafficTimer < AMBIENTE_CONFIG.TEMPO_VERDE_SEG + AMBIENTE_CONFIG.TEMPO_AMARELO_SEG) {
      novoEstado = 'yellow';
    } else {
      novoEstado = 'red';
    }

    if (novoEstado !== this.trafficState) {
      this.trafficState = novoEstado;
      this.atualizarSemaforosVisuais();
    }

    // Liga faróis no pôr do sol, à noite ou quando está chovendo
    const hora = new Date().getHours();
    const acenderFarois = (hora >= 17 || hora < 6 || this.weatherMode === 'rain') && !this.world.modoInterior;
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
  // 5. 🔊 ÁUDIO ESPACIAL 3D PROCEDURAL (THREE.PositionalAudio — ZERO MP3 EXTERNO)
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
    const duracao = 2.0;
    const sampleRate = audioCtx.sampleRate;
    const len = Math.floor(sampleRate * duracao);
    const buffer = audioCtx.createBuffer(1, len, sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.04 * white) / 1.04;
      const mod = 0.8 + 0.2 * Math.sin((i / sampleRate) * Math.PI * 3);
      data[i] = last * 1.8 * mod;
    }
    return buffer;
  }

  gerarBufferViolaoRua(audioCtx) {
    const duracao = 4.0;
    const sampleRate = audioCtx.sampleRate;
    const len = Math.floor(sampleRate * duracao);
    const buffer = audioCtx.createBuffer(1, len, sampleRate);
    const data = buffer.getChannelData(0);
    const acordes = [
      [261.63, 329.63, 392.00],
      [196.00, 246.94, 392.00],
      [220.00, 261.63, 329.63],
      [174.61, 220.00, 349.23]
    ];
    for (let i = 0; i < len; i++) {
      const t = i / sampleRate;
      const idx = Math.min(3, Math.floor(t));
      const localT = t - idx;
      const env = Math.exp(-localT * 2.6) * Math.min(1, localT * 30);
      const notas = acordes[idx];
      let soma = 0;
      for (let n = 0; n < notas.length; n++) {
        soma += Math.sin(2 * Math.PI * notas[n] * t);
      }
      data[i] = (soma / notas.length) * env * 0.28;
    }
    return buffer;
  }

  gerarBufferPistaAviao(audioCtx) {
    const duracao = 3.0;
    const sampleRate = audioCtx.sampleRate;
    const len = Math.floor(sampleRate * duracao);
    const buffer = audioCtx.createBuffer(1, len, sampleRate);
    const data = buffer.getChannelData(0);
    let smooth = 0;
    for (let i = 0; i < len; i++) {
      const t = i / sampleRate;
      smooth = (smooth + 0.015 * (Math.random() * 2 - 1)) / 1.015;
      const turbine = Math.sin(2 * Math.PI * 92 * t) * 0.14;
      data[i] = (smooth * 2.5 + turbine) * 0.35;
    }
    return buffer;
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

      // 1. Fonte da Praça Central
      criarPontoSonoro([21.65, 1.3, -99.35], this.gerarBufferFonteAgua(actx), 4, 24, 0.8);
      // 2. Músico de Rua na avenida
      criarPontoSonoro([-8.8, 1.3, -24], this.gerarBufferViolaoRua(actx), 3.5, 22, 0.85);
      // 3. Pista do Aeroporto
      criarPontoSonoro([68, 2.5, -55], this.gerarBufferPistaAviao(actx), 10, 52, 0.65);
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
      try {
        s.setVolume(this.audioEnabled ? (s.userData?.baseVolume || 0.3) : 0);
      } catch (e) {}
    });
  }

  // ============================================================================
  // 🔄 ATUALIZAÇÃO POR FRAME & LIMPEZA DE MEMÓRIA
  // ============================================================================
  update(delta, emInterior = false) {
    this.atualizarParticulasClima(delta, emInterior);
    this.atualizarAguaEFonte(delta);
    this.atualizarSemaforosEFarois(delta);

    // Abaixa o som da rua quando o avatar entra em uma loja
    if (this.audioStarted && this.audioEnabled) {
      const fator = emInterior ? 0.12 : 1.0;
      this.spatialSounds.forEach(s => {
        try {
          s.setVolume((s.userData?.baseVolume || 0.3) * fator);
        } catch (e) {}
      });
    }
  }

  dispose() {
    this.spatialSounds.forEach(s => {
      try { if (s.isPlaying) s.stop(); } catch (e) {}
    });
    this.spatialSounds = [];
    this.spatialAnchors.forEach(a => {
      try { this.world.scene?.remove(a); } catch (e) {}
    });
    this.spatialAnchors = [];

    if (this.audioListener && this.world?.camera) {
      try { this.world.camera.remove(this.audioListener); } catch (e) {}
    }
    this.audioListener = null;
    this.audioStarted = false;

    if (this.weatherPoints) {
      try {
        this.world.scene?.remove(this.weatherPoints);
        this.weatherPoints.geometry?.dispose();
        this.weatherPoints.material?.dispose();
      } catch (e) {}
      this.weatherPoints = null;
    }

    if (this.fountainJets) {
      try {
        this.world.exteriorGroup?.remove(this.fountainJets);
        this.fountainJets.geometry?.dispose();
        this.fountainJets.material?.dispose();
      } catch (e) {}
      this.fountainJets = null;
    }

    if (this.waterTexture) {
      try { this.waterTexture.dispose(); } catch (e) {}
      this.waterTexture = null;
    }
    if (this.waterFountainTexture) {
      try { this.waterFountainTexture.dispose(); } catch (e) {}
      this.waterFountainTexture = null;
    }
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