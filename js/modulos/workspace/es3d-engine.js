// js/modulos/workspace/es3d-engine.js
// 🚀 Fase 1 + Fase 2: Motor Three.js Moderno (ACESFilmic, HDRI Dinâmico PMREM, EffectComposer + UnrealBloomPass, Sombras Seguidoras e Seletor de Qualidade)

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

// ⚙️ PARÂMETROS AJUSTÁVEIS DE QUALIDADE, HDRI E PÓS-PROCESSAMENTO
const ENGINE_CONFIG = {
  EXPOSICAO_DIA: 1.06,
  EXPOSICAO_POR_DO_SOL: 1.02,
  EXPOSICAO_NOITE: 1.12,
  EXPOSICAO_TEMPESTADE: 0.94,
  ALCANCE_SOMBRA_METROS: 48,
  MAPA_SOMBRA_DESKTOP: 2048,
  MAPA_SOMBRA_MOBILE: 1024,
  DRACO_DECODER_URL: 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/',
  STORAGE_QUALITY_KEY: 'es3d_graphics_quality'
};

const QUALITY_ORDER = ['high', 'medium', 'low'];

let _threeGlobalPronto = null;
let _dracoSingleton = null;

// Ponte segura de compatibilidade: expõe window.THREE extensível para todos os módulos es3d-*.js
export function obterThreeModerno() {
  if (!_threeGlobalPronto) {
    _threeGlobalPronto = { ...THREE, GLTFLoader, DRACOLoader };
    window.THREE = _threeGlobalPronto;
  }
  return _threeGlobalPronto;
}

export function criarGLTFLoaderComDraco() {
  const loader = new GLTFLoader();
  if (!_dracoSingleton) {
    _dracoSingleton = new DRACOLoader();
    _dracoSingleton.setDecoderPath(ENGINE_CONFIG.DRACO_DECODER_URL);
  }
  loader.setDRACOLoader(_dracoSingleton);
  return loader;
}

export class ES3DEngine {
  constructor(world) {
    this.world = world;
    this.hemiLight = null;
    this.sunOffset = { x: 28, y: 56, z: 22 };
    this.isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');

    // Qualidade gráfica persistida (Desktop inicia em 'high', Celular inicia em 'medium')
    const savedQ = localStorage.getItem(ENGINE_CONFIG.STORAGE_QUALITY_KEY);
    this.quality = QUALITY_ORDER.includes(savedQ) ? savedQ : (this.isMobile ? 'medium' : 'high');

    // HDRI Procedural Dinâmico (PMREM)
    this.envMaps = {};
    this.activeEnvKey = null;

    // Pós-Processamento (EffectComposer + UnrealBloomPass + OutputPass)
    this.composer = null;
    this.renderPass = null;
    this.bloomPass = null;
    this.outputPass = null;
    this.baseBloomStrength = 0.24;
    this.baseExposure = ENGINE_CONFIG.EXPOSICAO_DIA;
    this.currentTimeMode = 'day';
  }

  // 1. Configura Tone Mapping cinematográfico e espaço de cor sRGB
  configurarRendererModerno(renderer) {
    if (!renderer) return;

    if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = ENGINE_CONFIG.EXPOSICAO_DIA;
    renderer.shadowMap.enabled = this.quality !== 'low';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.aplicarPixelRatioPorQualidade(renderer);
  }

  aplicarPixelRatioPorQualidade(renderer = this.world?.renderer) {
    if (!renderer) return;
    const dpr = window.devicePixelRatio || 1;
    let limite = 2;
    if (this.quality === 'high') limite = this.isMobile ? 1.5 : 2.0;
    else if (this.quality === 'medium') limite = this.isMobile ? 1.15 : 1.35;
    else limite = 1.0;
    renderer.setPixelRatio(Math.min(dpr, limite));
  }

  // 2. Gera HDRI procedural com luz solar/lunar HDR (> 1.0) para reflexos realistas em vidros, água e veículos
  obterOuCriarHDRI(modo) {
    if (this.envMaps[modo]) return this.envMaps[modo];
    const renderer = this.world?.renderer;
    if (!renderer) return null;

    const presets = {
      day: {
        stops: ['#0c4a6e', '#2563eb', '#7dd3fc', '#fef3c7', '#475569', '#0f172a'],
        orbColor: new THREE.Color(6.5, 6.0, 4.8),
        orbPos: [10, 13, -10],
        orbSize: 2.6,
        fillColor: new THREE.Color(1.4, 1.8, 2.4)
      },
      sunset: {
        stops: ['#1e1b4b', '#7c2d12', '#f97316', '#fde047', '#3f2e3e', '#0f172a'],
        orbColor: new THREE.Color(7.5, 3.6, 1.4),
        orbPos: [15, 4.5, -8],
        orbSize: 3.1,
        fillColor: new THREE.Color(2.0, 1.1, 0.7)
      },
      night: {
        stops: ['#020617', '#0a1433', '#172554', '#1e293b', '#0f172a', '#020617'],
        orbColor: new THREE.Color(2.4, 2.8, 4.2),
        orbPos: [-9, 12, -10],
        orbSize: 1.9,
        fillColor: new THREE.Color(0.55, 0.75, 1.35)
      },
      storm: {
        stops: ['#0f172a', '#1e293b', '#334155', '#475569', '#1e293b', '#090d16'],
        orbColor: new THREE.Color(1.8, 2.0, 2.4),
        orbPos: [6, 11, -9],
        orbSize: 2.2,
        fillColor: new THREE.Color(0.7, 0.85, 1.05)
      }
    };

    const cfg = presets[modo] || presets.day;

    try {
      const pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();

      const envScene = new THREE.Scene();
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0.00, cfg.stops[0]);
      grad.addColorStop(0.26, cfg.stops[1]);
      grad.addColorStop(0.46, cfg.stops[2]);
      grad.addColorStop(0.53, cfg.stops[3]);
      grad.addColorStop(0.62, cfg.stops[4]);
      grad.addColorStop(1.00, cfg.stops[5]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 256);

      // Faixas sutis de nuvens iluminadas no horizonte para reflexo natural na água
      ctx.fillStyle = modo === 'night' ? 'rgba(96, 165, 250, 0.10)' : 'rgba(255, 255, 255, 0.18)';
      for (let i = 0; i < 14; i++) {
        const cx = (i * 41) % 512;
        const cy = 78 + (i % 4) * 14;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 42 + (i % 3) * 18, 8 + (i % 2) * 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      const skyTex = new THREE.CanvasTexture(canvas);
      if ('colorSpace' in skyTex && THREE.SRGBColorSpace) {
        skyTex.colorSpace = THREE.SRGBColorSpace;
      }

      const skyGeo = new THREE.SphereGeometry(24, 32, 18);
      const skyMat = new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide });
      envScene.add(new THREE.Mesh(skyGeo, skyMat));

      // Disco solar/lunar com intensidade HDR para gerar reflexos especulares reais
      const orbGeo = new THREE.SphereGeometry(cfg.orbSize, 16, 16);
      const orbMat = new THREE.MeshBasicMaterial({ color: cfg.orbColor, toneMapped: false });
      const orbMesh = new THREE.Mesh(orbGeo, orbMat);
      orbMesh.position.set(cfg.orbPos[0], cfg.orbPos[1], cfg.orbPos[2]);
      envScene.add(orbMesh);

      // Painel superior suave para enriquecer superfícies metálicas e vidros
      const fillGeo = new THREE.PlaneGeometry(18, 18);
      const fillMat = new THREE.MeshBasicMaterial({ color: cfg.fillColor, side: THREE.DoubleSide, toneMapped: false });
      const fillMesh = new THREE.Mesh(fillGeo, fillMat);
      fillMesh.position.set(0, 18, 0);
      fillMesh.rotation.x = Math.PI / 2;
      envScene.add(fillMesh);

      const rt = pmrem.fromScene(envScene, 0.035);
      this.envMaps[modo] = rt;

      skyGeo.dispose(); skyMat.dispose(); skyTex.dispose();
      orbGeo.dispose(); orbMat.dispose();
      fillGeo.dispose(); fillMat.dispose();
      pmrem.dispose();

      return rt;
    } catch (e) {
      return null;
    }
  }

  aplicarHDRIDinamico(modoAlvo) {
    const scene = this.world?.scene;
    if (!scene) return;
    if (this.activeEnvKey === modoAlvo && scene.environment) return;

    const rt = this.obterOuCriarHDRI(modoAlvo);
    if (!rt) return;

    this.activeEnvKey = modoAlvo;
    scene.environment = rt.texture;
    if ('environmentIntensity' in scene) {
      const intensidades = { day: 0.92, sunset: 0.85, night: 0.55, storm: 0.62 };
      scene.environmentIntensity = intensidades[modoAlvo] ?? 0.85;
    }
  }

  // 3. Configura EffectComposer + RenderPass + UnrealBloomPass + OutputPass
  configurarPosProcessamento() {
    const w = this.world;
    if (!w?.renderer || !w?.scene || !w?.camera) return;

    this.descartarPosProcessamento();
    if (this.quality !== 'high') return;

    const vp = document.getElementById('es-city-viewport');
    const width = Math.max(1, vp?.clientWidth || window.innerWidth);
    const height = Math.max(1, vp?.clientHeight || window.innerHeight);

    try {
      let renderTarget = null;
      try {
        renderTarget = new THREE.WebGLRenderTarget(width, height, {
          type: THREE.HalfFloatType,
          samples: this.isMobile ? 0 : 2
        });
      } catch (e) {
        renderTarget = null;
      }

      this.composer = renderTarget
        ? new EffectComposer(w.renderer, renderTarget)
        : new EffectComposer(w.renderer);

      this.composer.setPixelRatio(w.renderer.getPixelRatio());
      this.composer.setSize(width, height);

      this.renderPass = new RenderPass(w.scene, w.camera);
      this.bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        0.26, // strength inicial (ajustado dinamicamente por horário)
        0.45, // radius
        0.92  // threshold alto: apenas luzes, semáforos, faróis e portal brilham
      );
      this.outputPass = new OutputPass();

      this.composer.addPass(this.renderPass);
      this.composer.addPass(this.bloomPass);
      this.composer.addPass(this.outputPass);

      this.aplicarParametrosBloomPorHorario(this.currentTimeMode);
    } catch (err) {
      console.warn('⚠️ Pós-processamento desativado por fallback WebGL:', err);
      this.descartarPosProcessamento();
    }
  }

  descartarPosProcessamento() {
    if (this.bloomPass) {
      try { this.bloomPass.dispose(); } catch (e) {}
      this.bloomPass = null;
    }
    if (this.outputPass) {
      try { this.outputPass.dispose(); } catch (e) {}
      this.outputPass = null;
    }
    if (this.composer) {
      try { this.composer.dispose(); } catch (e) {}
      this.composer = null;
    }
    this.renderPass = null;
  }

  aplicarParametrosBloomPorHorario(mode) {
    if (!this.bloomPass) return;
    if (mode === 'day') {
      this.bloomPass.threshold = 0.98;
      this.baseBloomStrength = 0.20;
      this.bloomPass.radius = 0.40;
    } else if (mode === 'sunset') {
      this.bloomPass.threshold = 0.88;
      this.baseBloomStrength = 0.32;
      this.bloomPass.radius = 0.50;
    } else {
      this.bloomPass.threshold = 0.78;
      this.baseBloomStrength = 0.46;
      this.bloomPass.radius = 0.56;
    }
    this.bloomPass.strength = this.baseBloomStrength;
  }

  // 4. Configura HemisphereLight + Sombras de alta nitidez + HDRI + Pós-Processamento
  configurarIluminacaoESombrasPro() {
    const w = this.world;
    if (!w?.scene || !w?.dirLight) return;

    if (!this.hemiLight) {
      this.hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x334155, 0.58);
      this.hemiLight.position.set(0, 60, 0);
      w.scene.add(this.hemiLight);
    }

    const d = ENGINE_CONFIG.ALCANCE_SOMBRA_METROS;
    const mapSize = this.isMobile ? ENGINE_CONFIG.MAPA_SOMBRA_MOBILE : ENGINE_CONFIG.MAPA_SOMBRA_DESKTOP;
    const dir = w.dirLight;

    dir.castShadow = this.quality !== 'low';
    dir.shadow.mapSize.set(mapSize, mapSize);
    dir.shadow.camera.near = 4;
    dir.shadow.camera.far = 170;
    dir.shadow.camera.left = -d;
    dir.shadow.camera.right = d;
    dir.shadow.camera.top = d;
    dir.shadow.camera.bottom = -d;
    dir.shadow.bias = -0.0004;
    dir.shadow.normalBias = 0.035;
    dir.shadow.camera.updateProjectionMatrix();

    if (!dir.target.parent) {
      w.scene.add(dir.target);
    }

    this.atualizarIluminacaoPorHorario();
    this.configurarPosProcessamento();
    this.atualizarBotaoQualidadeUI();
    this.atualizarSombraNoJogador();
  }

  // 5. Ajusta espaço de cor sRGB das texturas + atenuação física das luzes internas e postes
  calibrarCenaModerna() {
    const w = this.world;
    if (!w?.scene) return;

    w.scene.traverse(obj => {
      if (!obj.isMesh || !obj.material) return;
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach(m => {
        if (m && m.map && 'colorSpace' in m.map && m.map.colorSpace !== THREE.SRGBColorSpace) {
          m.map.colorSpace = THREE.SRGBColorSpace;
          m.map.needsUpdate = true;
        }
      });
    });

    if (w.buildingMeshes) {
      w.buildingMeshes.forEach(entry => {
        if (entry?.shopLight) {
          entry.shopLight.decay = 1.25;
          entry.shopLight.distance = 16;
          entry.shopLight.intensity = 7.5;
        }
      });
    }

    (w.posteLights || []).forEach(p => {
      if (p?.light) {
        p.light.decay = 1.35;
        p.light.distance = 16;
      }
    });

    this.atualizarIluminacaoPorHorario();
  }

  // 6. Sincroniza luz do sol/lua, HemisphereLight, HDRI, exposição e bloom no ciclo Dia / Pôr do Sol / Noite
  atualizarIluminacaoPorHorario() {
    const w = this.world;
    if (!w?.dirLight) return;

    const hour = new Date().getHours();
    let mode = 'day';
    if (hour >= 17 && hour < 18) mode = 'sunset';
    else if (hour >= 18 || hour < 6) mode = 'night';
    this.currentTimeMode = mode;

    const emTempestade = w.ambientePro?.weatherMode === 'rain';
    const chaveHdri = emTempestade && mode !== 'night' ? 'storm' : mode;

    if (mode === 'day') {
      this.sunOffset = { x: 28, y: 56, z: 22 };
      this.baseExposure = emTempestade ? ENGINE_CONFIG.EXPOSICAO_TEMPESTADE : ENGINE_CONFIG.EXPOSICAO_DIA;
      w.dirLight.color.setHex(0xfffbeb);
      w.dirLight.intensity = emTempestade ? 1.25 : 2.15;
      if (this.hemiLight) {
        this.hemiLight.color.setHex(emTempestade ? 0x94a3b8 : 0xdbeafe);
        this.hemiLight.groundColor.setHex(0x475569);
        this.hemiLight.intensity = emTempestade ? 0.48 : 0.62;
      }
      (w.posteLights || []).forEach(p => { if (p?.light) p.light.intensity = emTempestade ? 3.5 : 0; });
    } else if (mode === 'sunset') {
      this.sunOffset = { x: 46, y: 18, z: -18 };
      this.baseExposure = ENGINE_CONFIG.EXPOSICAO_POR_DO_SOL;
      w.dirLight.color.setHex(0xff9e5e);
      w.dirLight.intensity = 1.65;
      if (this.hemiLight) {
        this.hemiLight.color.setHex(0xfdba74);
        this.hemiLight.groundColor.setHex(0x3b2f4a);
        this.hemiLight.intensity = 0.52;
      }
      (w.posteLights || []).forEach(p => { if (p?.light) p.light.intensity = 4.2; });
    } else {
      this.sunOffset = { x: -24, y: 42, z: 18 };
      this.baseExposure = ENGINE_CONFIG.EXPOSICAO_NOITE;
      w.dirLight.color.setHex(0x93c5fd);
      w.dirLight.intensity = 0.68;
      if (this.hemiLight) {
        this.hemiLight.color.setHex(0x3b5284);
        this.hemiLight.groundColor.setHex(0x0f172a);
        this.hemiLight.intensity = 0.40;
      }
      (w.posteLights || []).forEach(p => { if (p?.light) p.light.intensity = 8.5; });
    }

    if (w.renderer) {
      w.renderer.toneMappingExposure = this.baseExposure;
    }
    this.aplicarHDRIDinamico(chaveHdri);
    this.aplicarParametrosBloomPorHorario(mode);
  }

  // 7. Atualização contínua por frame (Sombras + HDRI dinâmico de tempestade + pulso de Bloom nos raios)
  update() {
    const w = this.world;
    if (!w) return;

    this.atualizarSombraNoJogador();

    const amb = w.ambientePro;
    if (amb) {
      const emTempestade = amb.weatherMode === 'rain' || amb.cloudDarkness > 0.65;
      const chaveHdri = emTempestade && this.currentTimeMode !== 'night' ? 'storm' : this.currentTimeMode;
      if (this.activeEnvKey !== chaveHdri) {
        this.aplicarHDRIDinamico(chaveHdri);
      }

      const flash = amb.lightningFlash || 0;
      if (w.renderer) {
        const expAlvo = this.baseExposure * (1 - (amb.cloudDarkness || 0) * 0.14) + flash * 0.42;
        w.renderer.toneMappingExposure = Math.max(0.75, Math.min(1.65, expAlvo));
      }
      if (this.bloomPass) {
        this.bloomPass.strength = this.baseBloomStrength + flash * 0.45;
      }
    }
  }

  // 8. Move o foco da sombra acompanhando o avatar sem cintilação
  atualizarSombraNoJogador() {
    const w = this.world;
    const p = w?.localPlayer;
    if (!p || !w?.dirLight || this.quality === 'low') return;

    const tx = Math.round(p.x * 2) * 0.5;
    const tz = Math.round(p.z * 2) * 0.5;

    w.dirLight.position.set(tx + this.sunOffset.x, this.sunOffset.y, tz + this.sunOffset.z);
    w.dirLight.target.position.set(tx, 0, tz);
    w.dirLight.target.updateMatrixWorld();
  }

  // 9. Renderização centralizada (usa EffectComposer no modo Ultra e render direto no Médio/Leve)
  renderizarFrame() {
    const w = this.world;
    if (!w?.renderer || !w?.scene || !w?.camera) return;

    if (this.quality === 'high' && this.composer) {
      this.composer.render();
    } else {
      w.renderer.render(w.scene, w.camera);
    }
  }

  // 10. Redimensionamento sincronizado (Renderer + EffectComposer + BloomPass)
  redimensionar(width, height) {
    const w = Math.max(1, width);
    const h = Math.max(1, height);
    if (this.world?.renderer) {
      this.aplicarPixelRatioPorQualidade(this.world.renderer);
      this.world.renderer.setSize(w, h);
    }
    if (this.composer) {
      this.composer.setPixelRatio(this.world?.renderer?.getPixelRatio() || 1);
      this.composer.setSize(w, h);
    }
    if (this.bloomPass) {
      this.bloomPass.setSize(w, h);
    }
  }

  // 11. Alternador de Qualidade Gráfica (Alto / Médio / Leve) com feedback visual
  alternarQualidadeGrafica(novoNivel = null) {
    const prox = novoNivel && QUALITY_ORDER.includes(novoNivel)
      ? novoNivel
      : QUALITY_ORDER[(QUALITY_ORDER.indexOf(this.quality) + 1) % QUALITY_ORDER.length];

    this.quality = prox;
    localStorage.setItem(ENGINE_CONFIG.STORAGE_QUALITY_KEY, prox);

    const w = this.world;
    if (w?.renderer) {
      const usarSombras = prox !== 'low';
      w.renderer.shadowMap.enabled = usarSombras;
      if (w.dirLight) w.dirLight.castShadow = usarSombras;
      this.aplicarPixelRatioPorQualidade(w.renderer);
    }

    if (prox === 'high') {
      this.configurarPosProcessamento();
    } else {
      this.descartarPosProcessamento();
    }

    this.atualizarBotaoQualidadeUI();

    const avisos = {
      high: '✨ Gráficos: ULTRA (HDRI + Água Shader + Bloom)',
      medium: '⚡ Gráficos: MÉDIO (HDRI + Água Shader, sem Bloom)',
      low: '🪶 Gráficos: LEVE (Máximo desempenho)'
    };
    if (window.Workspace?.mostrarAviso) {
      window.Workspace.mostrarAviso(avisos[prox], 'info', 2600);
    }
  }

  atualizarBotaoQualidadeUI() {
    const btn = document.getElementById('es-city-quality-btn');
    if (!btn) return;
    const labels = { high: '✨ Ultra', medium: '⚡ Médio', low: '🪶 Leve' };
    btn.innerHTML = labels[this.quality] || '✨ Ultra';
  }

  dispose() {
    this.descartarPosProcessamento();

    Object.values(this.envMaps).forEach(rt => {
      try { rt.dispose(); } catch (e) {}
    });
    this.envMaps = {};
    this.activeEnvKey = null;

    if (this.world?.scene) {
      this.world.scene.environment = null;
      if (this.hemiLight) {
        try { this.world.scene.remove(this.hemiLight); } catch (e) {}
      }
    }
    this.hemiLight = null;
    this.world = null;
  }
}