// js/modulos/workspace/es3d-colisoes.js
// 🛡️ Motor de Colisões Realistas (Paredes, Casas, Móveis, Trânsito, Mobiliário Urbano e Pessoas)

// ⚙️ PARÂMETROS AJUSTÁVEIS DE FÍSICA
const COLISAO_CONFIG = {
  RAIO_JOGADOR: 0.36,           // Espessura física do corpo do avatar
  RAIO_PESSOA: 0.42,            // Raio sólido de NPCs, pedestres e outros jogadores
  DIST_ABRIR_PORTA_CASA: 2.8,   // Distância para abrir a porta da tua casa residencial
  FOLGA_MOVEL_INTERIOR: 0.08    // Pequena folga nos móveis das lojas para corredores livres
};

export class ES3DColisoes {
  constructor(world) {
    this.world = world;
    this.THREE = window.THREE;

    this.staticBoxes = [];       // [{ minX, maxX, minZ, maxZ, tag }]
    this.staticCircles = [];     // [{ x, z, r, tag }]
    this.lotWallBoxes = [];      // Paredes das casas nos 8 lotes residenciais
    this.interiorBoxesMap = new Map(); // Cache de móveis sólidos de cada uma das 24 lojas
    this.lastHouseStage = -1;
    this.houseDoorMesh = null;
    this.houseDoorOpenRatio = 0;
  }

  init() {
    if (!this.THREE || !this.world?.scene) return;
    this.construirColisoresFixosRua();
    this.reconstruirColisoresLotes();
    this.construirColisoresInteriores();
  }

  // ============================================================================
  // 1. 🌳 COLISORES FIXOS DA RUA (ÁRVORES, BANCOS, POSTES, FONTE, PLACAS, AEROPORTO)
  // ============================================================================
  construirColisoresFixosRua() {
    this.staticBoxes = [];
    this.staticCircles = [];

    const addBox = (cx, cz, w, d, tag = 'prop') => {
      this.staticBoxes.push({
        minX: cx - w / 2,
        maxX: cx + w / 2,
        minZ: cz - d / 2,
        maxZ: cz + d / 2,
        tag
      });
    };

    const addCircle = (x, z, r, tag = 'prop') => {
      this.staticCircles.push({ x, z, r, tag });
    };

    // 1. Bancos e lixeiras da Avenida Principal
    for (let z = -82; z <= 14; z += 48) {
      [-1, 1].forEach(side => {
        addBox(side * 7.65, z, 1.55, 0.52, 'bench');
        addCircle(side * 10.25, z + 5.5, 0.32, 'bin');
      });
    }

    // 2. Árvores e canteiros ornamentais da avenida
    for (let z = -105; z <= 39; z += 24) {
      [-9.55, 9.55].forEach(x => {
        addBox(x, z, 1.05, 1.65, 'tree_planter');
      });
    }

    // 3. Postes de iluminação das avenidas
    for (let row = 0; row < 6; row++) {
      const zPos = -row * 16 + 6;
      [-6.8, 6.8, -28.5, -39.5, 28.5, 39.5].forEach(xPos => {
        addCircle(xPos, zPos, 0.24, 'pole');
      });
    }

    // 4. Semáforos e placas de trânsito
    [-56, -24].forEach(zPos => {
      [-1, 1].forEach(side => addCircle(side * 6.1, zPos, 0.22, 'signal'));
    });
    [[-7.2, -72], [7.2, -40], [-7.2, -8], [7.2, 16]].forEach(([x, z]) => {
      addCircle(x, z, 0.20, 'sign');
    });

    // 5. Outdoors da avenida
    for (let row = 0; row < 3; row++) {
      const zPos = -row * 32 - 8;
      [-11.5, 11.5].forEach(xPos => addCircle(xPos, zPos, 0.85, 'outdoor'));
    }

    // 6. Árvores laterais de fundo
    for (let z = -80; z < 10; z += 10) {
      addCircle(-23.5, z, 0.45, 'tree');
      addCircle(23.5, z, 0.45, 'tree');
    }

    // 7. Praça Central (centro em x=18, z=-103): fonte, bancos, mesa, postes, lixeiras e placa
    const px = 18;
    const pz = -103;
    addCircle(px + 3.65, pz + 3.65, 1.52, 'fountain');       // Fonte ornamental
    addCircle(px - 3.65, pz - 3.65, 0.62, 'plaza_table');    // Mesa de convivência
    addBox(px - 3.65, pz - 4.25, 1.85, 0.55, 'plaza_bench'); // Banco 1
    addBox(px + 4.25, pz - 3.65, 0.55, 1.85, 'plaza_bench'); // Banco 2
    addBox(px - 4.25, pz + 3.65, 0.55, 1.85, 'plaza_bench'); // Banco 3
    addBox(px, pz - 6.1, 1.95, 0.35, 'plaza_sign');          // Painel Praça Central
    [[-5.8, -5.8], [5.8, -5.8], [-5.8, 5.8], [5.8, 5.8]].forEach(([ox, oz]) => {
      addCircle(px + ox, pz + oz, 0.28, 'plaza_lamp');
    });
    addCircle(px - 5.2, pz + 1.8, 0.28, 'plaza_bin');
    addCircle(px + 5.2, pz - 1.8, 0.28, 'plaza_bin');

    // 8. Torre de controle do aeroporto
    addCircle(78.5, -45, 1.55, 'airport_tower');
  }

  // ============================================================================
  // 2. 🏡 PAREDES DAS CASAS DOS LOTES (COM PORTA QUE ABRE PARA VOCÊ ENTRAR!)
  // ============================================================================
  reconstruirColisoresLotes() {
    this.lotWallBoxes = [];
    this.houseDoorMesh = null;
    this.lastHouseStage = this.world?.houseStage || 1;

    const addLotWall = (cx, cz, w, d) => {
      this.lotWallBoxes.push({
        minX: cx - w / 2,
        maxX: cx + w / 2,
        minZ: cz - d / 2,
        maxZ: cz + d / 2,
        tag: 'house_wall'
      });
    };

    for (let i = 0; i < 8; i++) {
      const col = (i % 4) - 1.5;
      const row = Math.floor(i / 4);
      const lotX = col * 18;
      const lotZ = 34 + row * 18;

      const isMeuLote = i === 0;
      const commLot = this.world.communityLots && this.world.communityLots[i] ? this.world.communityLots[i] : null;
      const stage = isMeuLote ? (this.world.houseStage || 1) : (commLot ? (commLot.stage || 1) : 1);

      // Placa do terreno e caixa de correio
      addLotWall(lotX, lotZ - 5.8, 3.6, 0.28);
      addLotWall(lotX + 2.8, lotZ - 4.5, 0.65, 0.45);

      if (stage >= 2) {
        // Paredes traseira, esquerda e direita da casa
        addLotWall(lotX, lotZ + 3.35, 7.0, 0.38);
        addLotWall(lotX - 3.35, lotZ, 0.38, 7.0);
        addLotWall(lotX + 3.35, lotZ, 0.38, 7.0);

        // Fachada frontal dividida (deixa o vão da porta aberto no centro!)
        addLotWall(lotX - 2.25, lotZ - 3.35, 2.5, 0.38);
        addLotWall(lotX + 2.25, lotZ - 3.35, 2.5, 0.38);

        // Localiza a porta da casa do jogador (Lote 0) para animar a abertura automática
        if (isMeuLote && this.world.lotes && this.world.lotes[0]) {
          this.world.lotes[0].children.forEach(ch => {
            if (ch.isMesh && Math.abs(ch.position.x) < 0.05 && Math.abs(ch.position.y - 1.3) < 0.1 && Math.abs(ch.position.z + 3.48) < 0.15) {
              this.houseDoorMesh = ch;
            }
          });
        }
      }
    }
  }

  // ============================================================================
  // 3. 🏪 MÓVEIS INTERNOS DAS 24 LOJAS (LEITURA AUTOMÁTICA VIA THREE.Box3)
  // ============================================================================
  construirColisoresInteriores() {
    const THREE = this.THREE;
    this.interiorBoxesMap.clear();
    if (!this.world?.interiorGroups) return;

    const tempBox = new THREE.Box3();
    const size = new THREE.Vector3();

    this.world.interiorGroups.forEach((grp, id) => {
      const boxes = [];
      grp.updateMatrixWorld(true);

      grp.traverse(obj => {
        if (!obj.isMesh) return;
        const ud = obj.userData || {};
        // Ignora portais, post-its, quadros de parede e planos finos
        if (ud.isPortal || ud.isStickyWall || ud.isIndividualSticky || ud.isBlackboard || ud.isMage) return;

        tempBox.setFromObject(obj);
        if (tempBox.isEmpty()) return;
        tempBox.getSize(size);

        // Ignora peças altas acima da cabeça (guarda-sóis/telas no alto), pisos finos ou cascas GLB inteiras
        if (tempBox.min.y > 1.35) return;
        if (size.y < 0.22) return;
        if (size.x > 5.0 || size.z > 5.0) return;
        if (size.x < 0.18 && size.z > 1.2) return; // Quadro fino na parede X
        if (size.z < 0.18 && size.x > 1.2) return; // Quadro fino na parede Z

        const pad = COLISAO_CONFIG.FOLGA_MOVEL_INTERIOR;
        boxes.push({
          minX: tempBox.min.x + pad,
          maxX: tempBox.max.x - pad,
          minZ: tempBox.min.z + pad,
          maxZ: tempBox.max.z - pad,
          tag: 'interior_prop'
        });
      });

      this.interiorBoxesMap.set(id, boxes);
    });
  }

  // ============================================================================
  // 4. 📐 TESTES MATEMÁTICOS DE COLISÃO (COM REGRA ANTI-TRAVAMENTO!)
  // ============================================================================
  colideComCaixa(x, z, r, box) {
    const closestX = Math.max(box.minX, Math.min(x, box.maxX));
    const closestZ = Math.max(box.minZ, Math.min(z, box.maxZ));
    const dx = x - closestX;
    const dz = z - closestZ;
    return (dx * dx + dz * dz) < (r * r);
  }

  distanciaAteCentroCaixa(x, z, box) {
    const cx = (box.minX + box.maxX) * 0.5;
    const cz = (box.minZ + box.maxZ) * 0.5;
    return Math.hypot(x - cx, z - cz);
  }

  bloquearCaixaComEscape(newX, newZ, oldX, oldZ, r, box) {
    if (!this.colideComCaixa(newX, newZ, r, box)) return false;
    // Regra Anti-Travamento: se o jogador já estava encostado/dentro, permite sair para longe do centro
    if (this.colideComCaixa(oldX, oldZ, r, box)) {
      const distOld = this.distanciaAteCentroCaixa(oldX, oldZ, box);
      const distNew = this.distanciaAteCentroCaixa(newX, newZ, box);
      if (distNew > distOld + 0.001) return false;
    }
    return true;
  }

  bloquearCirculoComEscape(newX, newZ, oldX, oldZ, rTotal, cx, cz) {
    const distNew = Math.hypot(newX - cx, newZ - cz);
    if (distNew >= rTotal) return false;
    const distOld = Math.hypot(oldX - cx, oldZ - cz);
    if (distOld < rTotal && distNew > distOld + 0.001) return false;
    return true;
  }

  // ============================================================================
  // 5. 🚦 VERIFICAÇÃO GLOBAL (CHAMADA PELO podeMoverPara DO JOGO)
  // ============================================================================
  podePassar(newX, newZ, oldX, oldZ) {
    const r = COLISAO_CONFIG.RAIO_JOGADOR;
    const w = this.world;
    if (!w) return true;

    // A) DENTRO DE UMA TORRE RESIDENCIAL (Poço do Elevador + Escadas + Móveis do Apartamento)
    if (w.torreAtual) {
      const torre = w.torresResidenciais?.get(w.torreAtual);
      if (torre) {
        const cabine = torre.grupoInterior?.userData?.elevadorCabine;
        const portaAberta = (cabine?.userData?.aberturaPortas || 0) > 0.35;

        // 3 paredes de vidro do poço do elevador (traseira, esquerda, direita)
        const shaftWalls = [
          { minX: torre.x - 1.05, maxX: torre.x + 1.05, minZ: torre.z - 0.80, maxZ: torre.z - 0.65 },
          { minX: torre.x - 1.08, maxX: torre.x - 0.92, minZ: torre.z - 0.78, maxZ: torre.z + 0.78 },
          { minX: torre.x + 0.92, maxX: torre.x + 1.08, minZ: torre.z - 0.78, maxZ: torre.z + 0.78 }
        ];
        // Se a porta do elevador estiver fechada, bloqueia também a frente do poço
        if (!portaAberta) {
          shaftWalls.push({ minX: torre.x - 1.05, maxX: torre.x + 1.05, minZ: torre.z + 0.65, maxZ: torre.z + 0.80 });
        }

        for (const sw of shaftWalls) {
          if (this.bloquearCaixaComEscape(newX, newZ, oldX, oldZ, r, sw)) return false;
        }
      }

      // Móveis colocados pelo jogador neste andar do apartamento
      const moveisAndar = w.gameShowBuilder?.obterColisoresMoveisAtivos() || [];
      for (const box of moveisAndar) {
        if (this.bloquearCaixaComEscape(newX, newZ, oldX, oldZ, r, box)) return false;
      }
      return true;
    }

    // B) DENTRO DE UMA DAS 24 LOJAS (Móveis da loja + NPC da loja + Colegas na loja)
    if (w.modoInterior && w.predioAtual) {
      const boxesLoja = this.interiorBoxesMap.get(w.predioAtual) || [];
      for (const box of boxesLoja) {
        if (this.bloquearCaixaComEscape(newX, newZ, oldX, oldZ, r, box)) return false;
      }

      const npc = w.npcs3D?.get(w.predioAtual);
      if (npc && this.bloquearCirculoComEscape(newX, newZ, oldX, oldZ, r + COLISAO_CONFIG.RAIO_PESSOA, npc.x, npc.z)) {
        return false;
      }

      if (w.otherPlayers3D) {
        for (const op of w.otherPlayers3D.values()) {
          if (!op.mesh?.visible) continue;
          const ox = op.mesh.position.x;
          const oz = op.mesh.position.z;
          if (this.bloquearCirculoComEscape(newX, newZ, oldX, oldZ, r + COLISAO_CONFIG.RAIO_PESSOA, ox, oz)) {
            return false;
          }
        }
      }
      return true;
    }

    // C) NA RUA (EXTERIOR): Mobiliário urbano, Casas dos Lotes, Móveis do Lote, Trânsito e Pessoas
    for (const box of this.staticBoxes) {
      if (this.bloquearCaixaComEscape(newX, newZ, oldX, oldZ, r, box)) return false;
    }
    for (const c of this.staticCircles) {
      if (this.bloquearCirculoComEscape(newX, newZ, oldX, oldZ, r + c.r, c.x, c.z)) return false;
    }
    for (const wall of this.lotWallBoxes) {
      if (this.bloquearCaixaComEscape(newX, newZ, oldX, oldZ, r, wall)) return false;
    }

    // Telão do Game Show na Praça Central + Móveis decorativos do Lote
    const colisoresBuilder = w.gameShowBuilder?.obterColisoresMoveisAtivos() || [];
    for (const box of colisoresBuilder) {
      if (this.bloquearCaixaComEscape(newX, newZ, oldX, oldZ, r, box)) return false;
    }

    // Músico de rua
    if (w.musician && this.bloquearCirculoComEscape(newX, newZ, oldX, oldZ, r + COLISAO_CONFIG.RAIO_PESSOA, w.musician.x, w.musician.z)) {
      return false;
    }

    // Pedestres da calçada
    if (Array.isArray(w.pedestrians)) {
      for (const ped of w.pedestrians) {
        if (!ped.mesh?.visible) continue;
        if (this.bloquearCirculoComEscape(newX, newZ, oldX, oldZ, r + COLISAO_CONFIG.RAIO_PESSOA, ped.mesh.position.x, ped.mesh.position.z)) {
          return false;
        }
      }
    }

    // Outros alunos online na rua
    if (w.otherPlayers3D) {
      for (const op of w.otherPlayers3D.values()) {
        if (!op.mesh?.visible) continue;
        if (this.bloquearCirculoComEscape(newX, newZ, oldX, oldZ, r + COLISAO_CONFIG.RAIO_PESSOA, op.mesh.position.x, op.mesh.position.z)) {
          return false;
        }
      }
    }

    // Carros, Motos e Ciclistas no trânsito
    if (Array.isArray(w.cars)) {
      for (const car of w.cars) {
        if (!car.visible) continue;
        const carBox = { minX: car.position.x - 0.95, maxX: car.position.x + 0.95, minZ: car.position.z - 2.0, maxZ: car.position.z + 2.0 };
        if (this.bloquearCaixaComEscape(newX, newZ, oldX, oldZ, r, carBox)) return false;
      }
    }
    if (Array.isArray(w.motos)) {
      for (const moto of w.motos) {
        if (!moto.visible) continue;
        if (this.bloquearCirculoComEscape(newX, newZ, oldX, oldZ, r + 0.65, moto.position.x, moto.position.z)) return false;
      }
    }
    if (Array.isArray(w.ciclistas)) {
      for (const cic of w.ciclistas) {
        if (!cic.mesh?.visible) continue;
        if (this.bloquearCirculoComEscape(newX, newZ, oldX, oldZ, r + 0.55, cic.mesh.position.x, cic.mesh.position.z)) return false;
      }
    }

    return true;
  }

  // 🔄 Atualiza colisões de lote se a casa evoluiu de estágio e anima a porta da casa do jogador
  update(delta) {
    if ((this.world?.houseStage || 1) !== this.lastHouseStage) {
      this.reconstruirColisoresLotes();
    }

    if (this.houseDoorMesh && this.world?.localPlayer && !this.world.modoInterior && !this.world.torreAtual) {
      const distPorta = Math.hypot(this.world.localPlayer.x - (-27), this.world.localPlayer.z - 30.65);
      const alvo = distPorta < COLISAO_CONFIG.DIST_ABRIR_PORTA_CASA ? 1 : 0;
      this.houseDoorOpenRatio += (alvo - this.houseDoorOpenRatio) * Math.min(1, delta * 6);
      this.houseDoorMesh.position.x = this.houseDoorOpenRatio * 1.18;
    }
  }

  dispose() {
    this.staticBoxes = [];
    this.staticCircles = [];
    this.lotWallBoxes = [];
    this.interiorBoxesMap.clear();
    this.houseDoorMesh = null;
  }
}