// js/modulos/workspace/es3d-engine.js
// 🚀 Fase 1: Motor Three.js Moderno no Vite (ACESFilmic, SRGB, Sombras Dinâmicas Seguidoras, HemisphereLight e DRACOLoader)

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// ⚙️ PARÂMETROS AJUSTÁVEIS DE QUALIDADE E ILUMINAÇÃO
const ENGINE_CONFIG = {
  EXPOSICAO_CINEMATOGRAFICA: 1.06,  // Brilho geral do ACESFilmicToneMapping
  ALCANCE_SOMBRA_METROS: 48,        // Metade do quadrado de sombras ao redor do avatar (96x96m)
  MAPA_SOMBRA_DESKTOP: 2048,        // Resolução de sombra no PC
  MAPA_SOMBRA_MOBILE: 1024,         // Resolução leve no celular
  DRACO_DECODER_URL: 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/'
};

let _threeGlobalPronto = null;
let _dracoSingleton = null;

// Ponte segura de compatibilidade: expõe um objeto window.THREE extensível para todos os módulos es3d-*.js
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
  }

  // 1. Configura Tone Mapping de cinema e espaço de cor sRGB no WebGLRenderer
  configurarRendererModerno(renderer) {
    if (!renderer) return;

    if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = ENGINE_CONFIG.EXPOSICAO_CINEMATOGRAFICA;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  // 2. Configura HemisphereLight natural + Sombras de alta nitidez que acompanham o jogador
  configurarIluminacaoESombrasPro() {
    const w = this.world;
    if (!w?.scene || !w?.dirLight) return;

    // Luz hemisférica (azul do céu vindo de cima + rebote quente do chão por baixo)
    if (!this.hemiLight) {
      this.hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x334155, 0.55);
      this.hemiLight.position.set(0, 60, 0);
      w.scene.add(this.hemiLight);
    }

    // Calibra a câmera de sombra do sol para cobrir 96x96 metros sem manchas ("shadow acne")
    const d = ENGINE_CONFIG.ALCANCE_SOMBRA_METROS;
    const mapSize = this.isMobile ? ENGINE_CONFIG.MAPA_SOMBRA_MOBILE : ENGINE_CONFIG.MAPA_SOMBRA_DESKTOP;
    const dir = w.dirLight;

    dir.castShadow = true;
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
    this.atualizarSombraNoJogador();
  }

  // 3. Ajusta espaço de cor das texturas difusas + intensidade física das luzes de lojas e postes
  calibrarCenaModerna() {
    const w = this.world;
    if (!w?.scene) return;

    // Garante cores vivas e fiéis em todas as texturas de cor (placas, pisos, fachadas, água, navio)
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

    // Compensa a atenuação física (decay) das luzes internas das 24 lojas
    if (w.buildingMeshes) {
      w.buildingMeshes.forEach(entry => {
        if (entry?.shopLight) {
          entry.shopLight.decay = 1.25;
          entry.shopLight.distance = 16;
          entry.shopLight.intensity = 7.5;
        }
      });
    }

    // Compensa a atenuação física dos postes da avenida
    (w.posteLights || []).forEach(p => {
      if (p?.light) {
        p.light.decay = 1.35;
        p.light.distance = 16;
      }
    });

    this.atualizarIluminacaoPorHorario();
  }

  // 4. Sincroniza luz do sol/lua, luz hemisférica e postes no ciclo Dia / Pôr do Sol / Noite
  atualizarIluminacaoPorHorario() {
    const w = this.world;
    if (!w?.dirLight) return;

    const hour = new Date().getHours();
    let mode = 'day';
    if (hour >= 17 && hour < 18) mode = 'sunset';
    else if (hour >= 18 || hour < 6) mode = 'night';

    if (mode === 'day') {
      this.sunOffset = { x: 28, y: 56, z: 22 };
      w.dirLight.color.setHex(0xfffbeb);
      w.dirLight.intensity = 2.15;
      if (this.hemiLight) {
        this.hemiLight.color.setHex(0xdbeafe);
        this.hemiLight.groundColor.setHex(0x475569);
        this.hemiLight.intensity = 0.62;
      }
      (w.posteLights || []).forEach(p => { if (p?.light) p.light.intensity = 0; });
    } else if (mode === 'sunset') {
      this.sunOffset = { x: 46, y: 18, z: -18 };
      w.dirLight.color.setHex(0xff9e5e);
      w.dirLight.intensity = 1.65;
      if (this.hemiLight) {
        this.hemiLight.color.setHex(0xfdba74);
        this.hemiLight.groundColor.setHex(0x3b2f4a);
        this.hemiLight.intensity = 0.52;
      }
      (w.posteLights || []).forEach(p => { if (p?.light) p.light.intensity = 3.8; });
    } else {
      this.sunOffset = { x: -24, y: 42, z: 18 };
      w.dirLight.color.setHex(0x93c5fd);
      w.dirLight.intensity = 0.68;
      if (this.hemiLight) {
        this.hemiLight.color.setHex(0x3b5284);
        this.hemiLight.groundColor.setHex(0x0f172a);
        this.hemiLight.intensity = 0.38;
      }
      (w.posteLights || []).forEach(p => { if (p?.light) p.light.intensity = 8.5; });
    }
  }

  // 5. Move o foco da sombra suavemente acompanhando o avatar pela cidade inteira
  atualizarSombraNoJogador() {
    const w = this.world;
    const p = w?.localPlayer;
    if (!p || !w?.dirLight) return;

    // Arredondamento em passos de 0.5m evita cintilação (shadow shimmering) ao caminhar
    const tx = Math.round(p.x * 2) * 0.5;
    const tz = Math.round(p.z * 2) * 0.5;

    w.dirLight.position.set(tx + this.sunOffset.x, this.sunOffset.y, tz + this.sunOffset.z);
    w.dirLight.target.position.set(tx, 0, tz);
    w.dirLight.target.updateMatrixWorld();
  }

  dispose() {
    if (this.hemiLight && this.world?.scene) {
      try { this.world.scene.remove(this.hemiLight); } catch (e) {}
    }
    this.hemiLight = null;
    this.world = null;
  }
}