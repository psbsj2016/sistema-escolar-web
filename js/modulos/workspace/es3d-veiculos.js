// js/modulos/workspace/es3d-veiculos.js
// 🚗🏍️🚲✈️ Módulo Dedicado de Veículos Realistas (Trânsito, Ciclovias, Veículos Pilotáveis e Aeroporto)

// ⚙️ PARÂMETROS AJUSTÁVEIS DE TRÂNSITO E AEROPORTO
const VEICULOS_CONFIG = {
  QTD_CARROS_TRANSITO: 8,
  QTD_MOTOS_TRANSITO: 4,
  VEL_BASE_CARRO: 4.6,
  VEL_BASE_MOTO: 6.2,
  VEL_BASE_CICLISTA: 4.3,
  RUNWAY_X: 68,
  STROBE_INTERVALO_MS: 850,
  NIVEL_AGUA_MAR_Y: 0.06,
  LIMITE_MAR_X: 138
};

export class ES3DVeiculos {
  constructor(world) {
    this.world = world;
    this.THREE = window.THREE;
    this.radarDish = null;
    this._cachedTextures = [];
  }

  registrarTextura(tex) {
    if (tex) this._cachedTextures.push(tex);
    return tex;
  }

  // ============================================================================
  // 1. 🚗 CONSTRUTOR DE CARRO 3D REALISTA (SEDAN, SUV, TÁXI, VAN E ESPORTIVO)
  // ============================================================================
  criarCarroRealista3D(corPintura = 0xef4444, tipo = 'sedan', frenteMenosZ = true, comMotorista = true) {
    const THREE = window.THREE || this.THREE;
    const s = frenteMenosZ ? 1 : -1; // s = 1 (frente em -Z para trânsito/faróis) | s = -1 (frente em +Z para jogador)
    const carGroup = new THREE.Group();

    const ehSUV = tipo === 'suv';
    const ehVan = tipo === 'van';
    const ehTaxi = tipo === 'taxi';
    const ehSport = tipo === 'sport';

    const matPintura = new THREE.MeshStandardMaterial({ color: corPintura, roughness: 0.24, metalness: 0.35 });
    const matVidro = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.12, metalness: 0.78, transparent: true, opacity: 0.74 });
    const matPlastico = new THREE.MeshStandardMaterial({ color: 0x181c22, roughness: 0.78, metalness: 0.12 });
    const matCromo = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.88, roughness: 0.18 });
    const matPneu = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.92 });
    const matAro = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.85, roughness: 0.22 });
    const matFarol = new THREE.MeshStandardMaterial({ color: 0xfffbeb, emissive: 0xfef08a, emissiveIntensity: 0.85, roughness: 0.15 });
    const matLanterna = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.65, roughness: 0.2 });

    // Chassi inferior + saias laterais
    const chassi = new THREE.Mesh(new THREE.BoxGeometry(1.76, 0.24, 3.74), matPlastico);
    chassi.position.set(0, 0.32, 0);
    carGroup.add(chassi);

    // Carroceria principal esculpida
    const altCorpo = ehSUV || ehVan ? 0.54 : (ehSport ? 0.42 : 0.48);
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(1.78, altCorpo, 3.76), matPintura);
    corpo.position.set(0, 0.44 + altCorpo * 0.5, 0);
    carGroup.add(corpo);

    // Capô levemente inclinado na frente
    const capo = new THREE.Mesh(new THREE.BoxGeometry(1.66, 0.12, 1.15), matPintura);
    capo.position.set(0, 0.44 + altCorpo - 0.02, -1.24 * s);
    capo.rotation.x = -0.07 * s;
    carGroup.add(capo);

    // Cabine + teto + vidros angulados
    const compCabine = ehVan ? 2.45 : (ehSUV ? 2.10 : 1.72);
    const altCabine = ehVan ? 0.64 : (ehSUV ? 0.58 : (ehSport ? 0.44 : 0.50));
    const offsetCabineZ = ehVan ? 0.15 * s : (ehSUV ? 0.22 * s : 0.16 * s);
    const baseCabineY = 0.44 + altCorpo;

    // Núcleo escurecido dos vidros laterais
    const cabinGlass = new THREE.Mesh(new THREE.BoxGeometry(1.50, altCabine, compCabine), matVidro);
    cabinGlass.position.set(0, baseCabineY + altCabine * 0.48, offsetCabineZ);
    carGroup.add(cabinGlass);

    // Teto metálico pintado
    const roofLen = compCabine - 0.28;
    const teto = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.08, roofLen), matPintura);
    teto.position.set(0, baseCabineY + altCabine - 0.01, offsetCabineZ);
    carGroup.add(teto);

    // Para-brisa dianteiro inclinado
    const parabrisa = new THREE.Mesh(new THREE.BoxGeometry(1.48, altCabine * 1.06, 0.06), matVidro);
    parabrisa.position.set(0, baseCabineY + altCabine * 0.46, offsetCabineZ - (compCabine * 0.5 + 0.11) * s);
    parabrisa.rotation.x = 0.48 * s;
    carGroup.add(parabrisa);

    // Vidro traseiro inclinado
    const vidroTras = new THREE.Mesh(new THREE.BoxGeometry(1.48, altCabine * 1.02, 0.06), matVidro);
    vidroTras.position.set(0, baseCabineY + altCabine * 0.46, offsetCabineZ + (compCabine * 0.5 + 0.08) * s);
    vidroTras.rotation.x = -0.36 * s;
    carGroup.add(vidroTras);

    // Colunas A e C pintadas para moldura realista
    [-0.73, 0.73].forEach(px => {
      const pilF = new THREE.Mesh(new THREE.BoxGeometry(0.07, altCabine * 1.04, 0.09), matPintura);
      pilF.position.set(px, baseCabineY + altCabine * 0.46, offsetCabineZ - (compCabine * 0.5 + 0.09) * s);
      pilF.rotation.x = 0.48 * s;

      const pilR = new THREE.Mesh(new THREE.BoxGeometry(0.07, altCabine * 1.02, 0.11), matPintura);
      pilR.position.set(px, baseCabineY + altCabine * 0.46, offsetCabineZ + (compCabine * 0.5 + 0.06) * s);
      pilR.rotation.x = -0.36 * s;

      // Retrovisores laterais
      const mirrorArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.06), matPlastico);
      mirrorArm.position.set(px + Math.sign(px) * 0.20, baseCabineY + 0.08, offsetCabineZ - compCabine * 0.46 * s);
      const mirrorCap = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.10, 0.11), matPintura);
      mirrorCap.position.set(px + Math.sign(px) * 0.25, baseCabineY + 0.10, offsetCabineZ - compCabine * 0.46 * s);

      carGroup.add(pilF, pilR, mirrorArm, mirrorCap);
    });

    // Para-choques dianteiro e traseiro + grade cromada + placas
    const bumperF = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.20, 0.16), matPlastico);
    bumperF.position.set(0, 0.38, -1.88 * s);
    const bumperR = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.20, 0.16), matPlastico);
    bumperR.position.set(0, 0.38, 1.88 * s);

    const grille = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.20, 0.06), matPlastico);
    grille.position.set(0, 0.60, -1.89 * s);
    const grilleTrim = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.04, 0.07), matCromo);
    grilleTrim.position.set(0, 0.69, -1.90 * s);

    const plateMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const plateF = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.03), plateMat);
    plateF.position.set(0, 0.38, -1.97 * s);
    const plateR = plateF.clone();
    plateR.position.set(0, 0.38, 1.97 * s);

    carGroup.add(bumperF, bumperR, grille, grilleTrim, plateF, plateR);

    // Faróis dianteiros (alinhados exatamente a x=±0.58, z=-1.91 para os cones do es3d-ambiente.js!)
    [-0.58, 0.58].forEach(lx => {
      const farol = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.08), matFarol);
      farol.position.set(lx, 0.64, -1.91 * s);
      const lanterna = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.14, 0.08), matLanterna);
      lanterna.position.set(lx, 0.66, 1.91 * s);
      carGroup.add(farol, lanterna);
    });

    // Detalhes especiais por categoria
    if (ehTaxi) {
      const taxiSign = new THREE.Mesh(
        new THREE.BoxGeometry(0.56, 0.16, 0.22),
        new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 0.75 })
      );
      taxiSign.position.set(0, baseCabineY + altCabine + 0.11, offsetCabineZ);
      carGroup.add(taxiSign);
    } else if (ehSport) {
      const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.66, 0.06, 0.24), matPlastico);
      spoiler.position.set(0, baseCabineY + 0.20, 1.72 * s);
      [-0.58, 0.58].forEach(sx => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.10), matPlastico);
        leg.position.set(sx, baseCabineY + 0.09, 1.72 * s);
        carGroup.add(leg);
      });
      carGroup.add(spoiler);
    }

    // 4 Rodas giratórias com pneu, aro esportivo e calota central
    const rodas = [];
    [-1.22, 1.22].forEach(wz => {
      [-0.89, 0.89].forEach(wx => {
        const wheelGrp = new THREE.Group();
        const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.22, 20), matPneu);
        tire.rotation.z = Math.PI / 2;
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.23, 14), matAro);
        rim.rotation.z = Math.PI / 2;
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.245, 10), matPlastico);
        hub.rotation.z = Math.PI / 2;
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.235, 0.36, 0.045), matPlastico);
        const spoke2 = new THREE.Mesh(new THREE.BoxGeometry(0.235, 0.045, 0.36), matPlastico);

        wheelGrp.add(tire, rim, hub, spoke, spoke2);
        wheelGrp.position.set(wx, 0.34, wz);
        carGroup.add(wheelGrp);
        rodas.push(wheelGrp);
      });
    });

    // Motorista visível na cabine (para carros de trânsito)
    if (comMotorista) {
      const driver = new THREE.Group();
      const dBody = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.42, 0.28), new THREE.MeshStandardMaterial({ color: 0x334155 }));
      dBody.position.set(-0.34 * s, baseCabineY - 0.04, offsetCabineZ - 0.15 * s);
      const dHead = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), new THREE.MeshStandardMaterial({ color: 0xe8b996 }));
      dHead.position.set(-0.34 * s, baseCabineY + 0.26, offsetCabineZ - 0.15 * s);
      driver.add(dBody, dHead);
      carGroup.add(driver);
    }

    carGroup.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    carGroup.userData.rodas = rodas;
    return { group: carGroup, rodas };
  }

  // ============================================================================
  // 2. 🏍️ CONSTRUTOR DE MOTO ESPORTIVA REALISTA (FRENTE EM +Z)
  // ============================================================================
  criarMotoRealista3D(corPintura = 0xdc2626, comPiloto = true) {
    const THREE = window.THREE || this.THREE;
    const moto = new THREE.Group();

    const matPneu = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.94 });
    const matAro = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.85, roughness: 0.22 });
    const matCarenagem = new THREE.MeshStandardMaterial({ color: corPintura, metalness: 0.38, roughness: 0.24 });
    const matPreto = new THREE.MeshStandardMaterial({ color: 0x181c22, roughness: 0.72 });
    const matCromo = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.18 });
    const matBolha = new THREE.MeshStandardMaterial({ color: 0x0f172a, transparent: true, opacity: 0.62, roughness: 0.15, metalness: 0.5 });

    // 2 Rodas detalhadas com disco de freio
    const rodas = [];
    [-0.78, 0.78].forEach(z => {
      const wheel = new THREE.Group();
      const tire = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.075, 10, 24), matPneu);
      tire.rotation.y = Math.PI / 2;
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.11, 14), matAro);
      rim.rotation.z = Math.PI / 2;
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.135, 12), matCromo);
      disc.rotation.z = Math.PI / 2;
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.125, 0.38, 0.035), matPreto);

      wheel.add(tire, rim, disc, spoke);
      wheel.position.set(0, 0.35, z);
      moto.add(wheel);
      rodas.push(wheel);
    });

    // Motor, chassi e escapamento cromado lateral
    const engine = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.38, 0.62), matPreto);
    engine.position.set(0, 0.56, 0.02);
    const engineFin = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.16, 0.36), matAro);
    engineFin.position.set(0, 0.54, 0.06);

    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.042, 0.78, 10), matCromo);
    exhaust.rotation.x = Math.PI / 2 - 0.16;
    exhaust.position.set(0.23, 0.45, -0.44);

    // Tanque esculpido + carenagem frontal aerodinâmica + bolha fumê
    const tank = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 14), matCarenagem);
    tank.scale.set(0.84, 0.68, 1.48);
    tank.position.set(0, 0.90, 0.16);

    const fairing = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.38, 0.46), matCarenagem);
    fairing.position.set(0, 0.92, 0.60);
    fairing.rotation.x = 0.22;

    const windscreen = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.24, 0.04), matBolha);
    windscreen.position.set(0, 1.15, 0.64);
    windscreen.rotation.x = -0.55;

    // Rabeta esportiva + banco duplo
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.11, 0.68), matPreto);
    seat.position.set(0, 0.88, -0.34);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.14, 0.56), matCarenagem);
    tail.position.set(0, 0.92, -0.64);
    tail.rotation.x = 0.18;

    // Suspensão dianteira dupla + para-lama + guidão com retrovisores
    [-0.11, 0.11].forEach(fx => {
      const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.032, 0.78, 8), matCromo);
      fork.position.set(fx, 0.70, 0.64);
      fork.rotation.x = -0.32;
      moto.add(fork);

      const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.06, 0.03), matPreto);
      mirror.position.set(fx * 2.8, 1.24, 0.56);
      moto.add(mirror);
    });

    const fenderF = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.36), matCarenagem);
    fenderF.position.set(0, 0.66, 0.76);
    fenderF.rotation.x = 0.2;

    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.74, 8), matAro);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(0, 1.10, 0.50);

    // Farol em z=+0.82 (compatível com cone de farol do es3d-ambiente.js!) e lanterna traseira
    const headlight = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.14, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff3b0, emissiveIntensity: 0.9 })
    );
    headlight.position.set(0, 0.95, 0.82);

    const taillight = new THREE.Mesh(
      new THREE.BoxGeometry(0.20, 0.09, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.75 })
    );
    taillight.position.set(0, 0.98, -0.89);

    moto.add(engine, engineFin, exhaust, tank, fairing, windscreen, seat, tail, fenderF, handle, headlight, taillight);

    if (comPiloto) {
      const rider = new THREE.Group();
      const matJaqueta = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
      const jacket = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.56, 0.28), matJaqueta);
      jacket.position.set(0, 1.32, -0.10);
      jacket.rotation.x = 0.26;
      const pants = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.34, 0.28), matPreto);
      pants.position.set(0, 1.04, -0.34);

      [-1, 1].forEach(side => {
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.062, 0.52, 8), matJaqueta);
        arm.rotation.x = Math.PI / 2 - 0.25;
        arm.position.set(side * 0.22, 1.32, 0.22);
        const glove = new THREE.Mesh(new THREE.SphereGeometry(0.062, 8, 8), matPreto);
        glove.position.set(side * 0.33, 1.11, 0.49);
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.058, 0.48, 8), matPreto);
        leg.position.set(side * 0.20, 0.74, -0.18);
        leg.rotation.x = 0.55;
        rider.add(arm, glove, leg);
      });

      const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.205, 16, 14), matCarenagem);
      helmet.scale.set(0.96, 1.0, 1.12);
      helmet.position.set(0, 1.72, 0.06);
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.10, 0.06), matBolha);
      visor.position.set(0, 1.71, 0.26);

      rider.add(jacket, pants, helmet, visor);
      moto.add(rider);
    }

    moto.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    moto.userData.rodas = rodas;
    return { group: moto, rodas };
  }

  // ============================================================================
  // 3. 🚲 CONSTRUTOR DE BICICLETA 3D REALISTA (QUADRO TUBULAR, RAIOS E COROA)
  // ============================================================================
  criarBicicletaRealista3D(corQuadro = 0x10b981, frenteMenosZ = false) {
    const THREE = window.THREE || this.THREE;
    const s = frenteMenosZ ? -1 : 1; // s = 1 (frente em +Z) | s = -1 (frente em -Z)
    const bike = new THREE.Group();

    const frameMat = new THREE.MeshStandardMaterial({ color: corQuadro, metalness: 0.65, roughness: 0.28 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.85, roughness: 0.22 });
    const rubberMat = new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.94 });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.82 });

    const criarTubo = (a, b, raio, material, alvo = bike) => {
      const inicio = new THREE.Vector3(...a);
      const fim = new THREE.Vector3(...b);
      const direcao = new THREE.Vector3().subVectors(fim, inicio);
      const len = direcao.length();
      if (len < 0.001) return;
      const tubo = new THREE.Mesh(new THREE.CylinderGeometry(raio, raio, len, 8), material);
      tubo.position.copy(inicio).add(fim).multiplyScalar(0.5);
      tubo.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direcao.normalize());
      alvo.add(tubo);
    };

    const rodas = [];
    [-0.62 * s, 0.62 * s].forEach(z => {
      const wheel = new THREE.Group();
      const tire = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.048, 10, 26), rubberMat);
      tire.rotation.y = Math.PI / 2;
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.015, 8, 26), metalMat);
      rim.rotation.y = Math.PI / 2;
      wheel.add(tire, rim);

      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        criarTubo([0, 0, 0], [0, Math.cos(ang) * 0.275, Math.sin(ang) * 0.275], 0.006, metalMat, wheel);
      }

      const cubo = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.14, 10), metalMat);
      cubo.rotation.z = Math.PI / 2;
      wheel.add(cubo);

      wheel.position.set(0, 0.37, z);
      bike.add(wheel);
      rodas.push(wheel);
    });

    const rear = [0, 0.37, -0.62 * s];
    const front = [0, 0.37, 0.62 * s];
    const bb = [0, 0.37, -0.04 * s];
    const seatTop = [0, 0.86, -0.22 * s];
    const headTop = [0, 0.92, 0.45 * s];
    const headBot = [0, 0.74, 0.50 * s];

    criarTubo(rear, bb, 0.022, frameMat);
    criarTubo(rear, seatTop, 0.020, frameMat);
    criarTubo(bb, seatTop, 0.028, frameMat);
    criarTubo(bb, headBot, 0.030, frameMat);
    criarTubo(seatTop, headTop, 0.026, frameMat);
    criarTubo(headTop, headBot, 0.030, frameMat);
    criarTubo(headBot, front, 0.022, metalMat);

    // Canote + selim anatômico
    criarTubo(seatTop, [0, 1.04, -0.27 * s], 0.018, metalMat);
    const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.055, 0.30), seatMat);
    saddle.position.set(0, 1.07, -0.27 * s);
    bike.add(saddle);

    // Mesa + guidão + manoplas
    criarTubo(headTop, [0, 1.03, 0.43 * s], 0.022, metalMat);
    criarTubo([-0.28, 1.03, 0.43 * s], [0.28, 1.03, 0.43 * s], 0.020, metalMat);
    [-1, 1].forEach(side => {
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.12, 8), rubberMat);
      grip.rotation.z = Math.PI / 2;
      grip.position.set(side * 0.28, 1.03, 0.43 * s);
      bike.add(grip);
    });

    // Coroa + pedivela giratório
    const crankPivot = new THREE.Group();
    crankPivot.position.set(0, 0.37, -0.04 * s);
    const chainring = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.02, 14), metalMat);
    chainring.rotation.z = Math.PI / 2;
    chainring.position.x = 0.07;
    crankPivot.add(chainring);
    bike.add(crankPivot);

    // Farol dianteiro + refletor traseiro
    const light = new THREE.Mesh(
      new THREE.SphereGeometry(0.052, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xfffbeb, emissive: 0xfde047, emissiveIntensity: 0.85 })
    );
    light.position.set(0, 0.94, 0.56 * s);
    const rearLight = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.06, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.65 })
    );
    rearLight.position.set(0, 0.94, -0.44 * s);
    bike.add(light, rearLight);

    bike.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    bike.userData.rodas = rodas;
    bike.userData.crankPivot = crankPivot;
    return { group: bike, rodas, crankPivot };
  }

  // ============================================================================
  // 4. 🚴 CICLOVIAS E CICLISTAS ANIMADOS PEDALANDO
  // ============================================================================
  criarRuasAlargadasComCiclovias() {
    const THREE = window.THREE || this.THREE;
    if (!THREE || !this.world?.exteriorGroup) return;

    this.world.ciclistas = [];

    const bikeLaneMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.8 });
    [-5.6, 5.6].forEach(xLane => {
      const bikeLane = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 170), bikeLaneMat);
      bikeLane.rotation.x = -Math.PI / 2;
      bikeLane.position.set(xLane, 0.03, -36);
      this.world.exteriorGroup.add(bikeLane);
    });

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#059669';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BIKE LANE 🚲', 256, 76);

    const texBike = this.registrarTextura(new THREE.CanvasTexture(canvas));
    [-20, -50].forEach(zPos => {
      const mL = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 3.6), new THREE.MeshBasicMaterial({ map: texBike }));
      mL.rotation.x = -Math.PI / 2;
      mL.rotation.z = Math.PI / 2;
      mL.position.set(-5.6, 0.05, zPos);

      const mR = mL.clone();
      mR.position.set(5.6, 0.05, zPos);
      this.world.exteriorGroup.add(mL, mR);
    });

    const frameColors = [0x10b981, 0x3b82f6, 0xf59e0b, 0xec4899];
    const helmetColors = [0xef4444, 0x2563eb, 0xfacc15, 0x10b981];
    const shirtColors = [0x2563eb, 0xdc2626, 0xf8fafc, 0x7c3aed];

    [-5.6, 5.6].forEach((xLane, laneIndex) => {
      for (let i = 0; i < 2; i++) {
        const idxColor = laneIndex * 2 + i;
        const { group: cyclist, rodas, crankPivot } = this.criarBicicletaRealista3D(frameColors[idxColor], true);

        const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColors[idxColor], roughness: 0.72 });
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xd6a078, roughness: 0.78 });
        const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });

        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.44, 0.20), shirtMat);
        torso.position.set(0, 1.32, 0.10);
        torso.rotation.x = -0.34;

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.145, 14, 14), skinMat);
        head.position.set(0, 1.66, -0.06);

        const helmet = new THREE.Mesh(
          new THREE.SphereGeometry(0.16, 14, 12),
          new THREE.MeshStandardMaterial({ color: helmetColors[idxColor], roughness: 0.35 })
        );
        helmet.scale.set(1, 0.72, 1.12);
        helmet.position.set(0, 1.75, -0.06);

        // Braços apoiados no guidão
        [-0.14, 0.14].forEach(ax => {
          const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.038, 0.56, 8), shirtMat);
          arm.position.set(ax, 1.24, -0.22);
          arm.rotation.x = 0.88;
          cyclist.add(arm);
        });

        // Pernas articuladas para pedalar
        const criarPernaPedal = (side) => {
          const piv = new THREE.Group();
          piv.position.set(side * 0.11, 1.04, 0.22);
          const coxa = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.36, 8), pantsMat);
          coxa.position.set(0, -0.18, -0.06);
          coxa.rotation.x = 0.35;
          const canela = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.042, 0.34, 8), pantsMat);
          canela.position.set(0, -0.46, -0.12);
          piv.add(coxa, canela);
          cyclist.add(piv);
          return piv;
        };
        const legL = criarPernaPedal(-1);
        const legR = criarPernaPedal(1);

        cyclist.add(torso, head, helmet);

        const dir = laneIndex === 0 ? 1 : -1;
        cyclist.position.set(xLane, 0, -95 + i * 48);
        cyclist.rotation.y = dir > 0 ? Math.PI : 0;

        this.world.exteriorGroup.add(cyclist);
        this.world.ciclistas.push({
          mesh: cyclist,
          rodas,
          crankPivot,
          legL,
          legR,
          pedalPhase: Math.random() * Math.PI * 2,
          dir,
          speed: VEICULOS_CONFIG.VEL_BASE_CICLISTA + i * 0.5
        });
      }
    });
  }

  // ============================================================================
  // 5. 🚦 TRÂNSITO URBANO (CARROS E MOTOS REALISTAS)
  // ============================================================================
  criarTransitoInteligente() {
    this.world.cars = [];
    this.world.motos = [];

    const carModels = [
      { body: 0xdc2626, type: 'sedan' },
      { body: 0x2563eb, type: 'suv' },
      { body: 0xfacc15, type: 'taxi' },
      { body: 0xf8fafc, type: 'van' },
      { body: 0x10b981, type: 'sport' },
      { body: 0x64748b, type: 'sedan' },
      { body: 0x7c3aed, type: 'suv' },
      { body: 0xf97316, type: 'sport' }
    ];

    for (let i = 0; i < VEICULOS_CONFIG.QTD_CARROS_TRANSITO; i++) {
      const cfg = carModels[i % carModels.length];
      const { group: carGroup, rodas } = this.criarCarroRealista3D(cfg.body, cfg.type, true, true);

      const lane = i % 2 === 0 ? 1.8 : -1.8;
      const dir = i % 2 === 0 ? -1 : 1;
      carGroup.position.set(lane, 0, -80 + i * 16);
      // Frente do carro fica em -Z local -> dir=1 (+Z) usa Math.PI; dir=-1 (-Z) usa 0!
      carGroup.rotation.y = dir === 1 ? Math.PI : 0;
      carGroup.userData = {
        lane,
        dir,
        speed: VEICULOS_CONFIG.VEL_BASE_CARRO + Math.random() * 1.8,
        stopped: false,
        rodas
      };
      this.world.exteriorGroup.add(carGroup);
      this.world.cars.push(carGroup);
    }

    const motoColors = [0xdc2626, 0x2563eb, 0x181c22, 0xfacc15];
    for (let i = 0; i < VEICULOS_CONFIG.QTD_MOTOS_TRANSITO; i++) {
      const { group: moto, rodas } = this.criarMotoRealista3D(motoColors[i % motoColors.length], true);
      const dir = i % 2 === 0 ? -1 : 1;
      const lane = dir === -1 ? 3.3 : -3.3;

      moto.position.set(lane, 0, -72 + i * 34);
      moto.rotation.y = dir === 1 ? 0 : Math.PI;
      moto.userData = {
        lane,
        dir,
        speed: VEICULOS_CONFIG.VEL_BASE_MOTO + Math.random() * 1.4,
        stopped: false,
        rodas
      };
      this.world.exteriorGroup.add(moto);
      this.world.motos.push(moto);
    }
      this.criarEmbarcacoesMar();
  }

  atualizarTransito(delta) {
    const p = this.world.localPlayer;
    if (!p) return;

    // 1. Carros
    (this.world.cars || []).forEach(car => {
      const distToPlayer = Math.hypot(car.position.x - p.x, car.position.z - p.z);
      const playerOnRoad = Math.abs(p.x - car.position.x) < 2.8 && Math.abs(car.position.z - p.z) < 6;
      const pareSemaforo = this.world.ambientePro?.devePararNoSemaforo(car.position.z, car.userData.dir);
      car.userData.stopped = (playerOnRoad && distToPlayer < 5.5) || Boolean(pareSemaforo);

      if (!car.userData.stopped && !this.world.modoInterior) {
        car.position.z += car.userData.dir * car.userData.speed * delta;
        if (car.position.z > 18) car.position.z = -90;
        if (car.position.z < -90) car.position.z = 18;

        (car.userData.rodas || []).forEach(w => {
          w.rotation.x -= (car.userData.speed * delta) / 0.34;
        });
      }
    });

    // 2. Ciclistas pedalando nas ciclovias (agora também respeitam o semáforo!)
    (this.world.ciclistas || []).forEach(ciclista => {
      if (!ciclista.mesh || this.world.modoInterior) return;
      const pareSemaforoBike = this.world.ambientePro?.devePararNoSemaforo(ciclista.mesh.position.z, ciclista.dir);
      if (pareSemaforoBike) return;

      ciclista.mesh.position.z += ciclista.dir * ciclista.speed * delta;
      if (ciclista.dir > 0 && ciclista.mesh.position.z > 49) ciclista.mesh.position.z = -121;
      else if (ciclista.dir < 0 && ciclista.mesh.position.z < -121) ciclista.mesh.position.z = 49;

      (ciclista.rodas || []).forEach(roda => {
        roda.rotation.x -= (ciclista.speed * delta) / 0.33;
      });
      if (ciclista.crankPivot) {
        ciclista.crankPivot.rotation.x -= ciclista.speed * delta * 2.1;
      }
      ciclista.pedalPhase = (ciclista.pedalPhase || 0) + ciclista.speed * delta * 2.1;
      if (ciclista.legL) ciclista.legL.rotation.x = Math.sin(ciclista.pedalPhase) * 0.42;
      if (ciclista.legR) ciclista.legR.rotation.x = Math.sin(ciclista.pedalPhase + Math.PI) * 0.42;
    });

    // 3. Motocicletas
    (this.world.motos || []).forEach(moto => {
      const distToPlayer = Math.hypot(moto.position.x - p.x, moto.position.z - p.z);
      const playerOnRoad = Math.abs(p.x - moto.position.x) < 2.2 && Math.abs(moto.position.z - p.z) < 4.5;
      const pareSemaforoMoto = this.world.ambientePro?.devePararNoSemaforo(moto.position.z, moto.userData.dir);
      moto.userData.stopped = (playerOnRoad && distToPlayer < 4.5) || Boolean(pareSemaforoMoto);

      if (!moto.userData.stopped && !this.world.modoInterior) {
        moto.position.z += moto.userData.dir * moto.userData.speed * delta;
        if (moto.position.z > 18) moto.position.z = -90;
        if (moto.position.z < -90) moto.position.z = 18;

        (moto.userData.rodas || []).forEach(wheel => {
          wheel.rotation.x += (moto.userData.speed * delta) / 0.35;
        });
      }
    });
        this.atualizarEmbarcacoes(delta);
  }

  // ============================================================================
  // 6. 🚘 VEÍCULOS PILOTÁVEIS PELO JOGADOR (BICICLETA, MOTO E CARRO)
  // ============================================================================
  criarVeiculoJogador(escolhido) {
    if (escolhido === 'bicycle') {
      const { group } = this.criarBicicletaRealista3D(0x10b981, false);
      return group;
    }
    if (escolhido === 'moto') {
      const { group } = this.criarMotoRealista3D(0xef4444, false);
      return group;
    }
    const { group } = this.criarCarroRealista3D(0x2563eb, 'sport', false, false);
    group.scale.set(0.88, 0.88, 0.88);
    return group;
  }

  atualizarVeiculoJogador(delta, estaAndando) {
    const vm = this.world.vehicleMesh;
    const p = this.world.localPlayer;
    if (!vm || !p) return;

    vm.position.set(p.x, 0.02, p.z);
    vm.rotation.y = p.rotY;

    if (estaAndando) {
      const vel = this.world.vehicleSpeed || 11.5;
      (vm.userData?.rodas || []).forEach(w => {
        w.rotation.x += (vel * delta) / 0.34;
      });
      if (vm.userData?.crankPivot) {
        vm.userData.crankPivot.rotation.x += vel * delta * 1.4;
      }
    }

    // Ajusta altura e postura do avatar sentado no veículo
    const ud = p.mesh?.userData;
    if (ud?.bodyRoot) {
      ud.bodyRoot.position.y = this.world.currentVehicle === 'car' ? -0.10 : 0.24;
      if (this.world.currentVehicle === 'car') {
        if (ud.leftLeg) ud.leftLeg.rotation.x = -1.3;
        if (ud.rightLeg) ud.rightLeg.rotation.x = -1.3;
        if (ud.leftKnee) ud.leftKnee.rotation.x = 1.25;
        if (ud.rightKnee) ud.rightKnee.rotation.x = 1.25;
      }
    }
  }

  // ============================================================================
  // 7. ✈️ PISTA DO AEROPORTO + AVIÕES COMERCIAIS REALISTAS COM TREM RETRÁTIL
  // ============================================================================
  criarTexturaFuselagemAviao(corFaixaHex) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 512, 128);

    // Faixa inferior da pintura
    ctx.fillStyle = corFaixaHex;
    ctx.fillRect(0, 72, 512, 22);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 94, 512, 34);

    // Fileira de janelas ovais dos passageiros
    for (let x = 28; x < 484; x += 22) {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(x, 48, 5, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(186,230,253,0.45)';
      ctx.beginPath();
      ctx.ellipse(x - 1, 46, 2.5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    return this.registrarTextura(new this.THREE.CanvasTexture(c));
  }

  criarPistaAeroporto() {
    const THREE = window.THREE || this.THREE;
    const runwayX = VEICULOS_CONFIG.RUNWAY_X;

    const pista = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 130),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85, metalness: 0.1 })
    );
    pista.rotation.x = -Math.PI / 2;
    pista.position.set(runwayX, 0.02, -55);
    pista.receiveShadow = true;
    this.world.exteriorGroup.add(pista);

    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
    // Faixa central + "piano keys" de cabeceira da pista
    for (let z = -112; z < 4; z += 7) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 3.6), whiteMat);
      m.rotation.x = -Math.PI / 2;
      m.position.set(runwayX, 0.04, z);
      this.world.exteriorGroup.add(m);
    }
    [-117, 7].forEach(zKey => {
      for (let ox = -5.2; ox <= 5.2; ox += 1.3) {
        const key = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 3.2), whiteMat);
        key.rotation.x = -Math.PI / 2;
        key.position.set(runwayX + ox, 0.045, zKey);
        this.world.exteriorGroup.add(key);
      }
    });

    const yellowMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const edgeL = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 130), yellowMat);
    edgeL.rotation.x = -Math.PI / 2;
    edgeL.position.set(runwayX - 6.6, 0.03, -55);
    const edgeR = edgeL.clone();
    edgeR.position.set(runwayX + 6.6, 0.03, -55);
    this.world.exteriorGroup.add(edgeL, edgeR);

    const blueLightMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    for (let z = -115; z < 5; z += 9) {
      const l1 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), blueLightMat);
      l1.position.set(runwayX - 6.6, 0.18, z);
      const l2 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), blueLightMat);
      l2.position.set(runwayX + 6.6, 0.18, z);
      this.world.exteriorGroup.add(l1, l2);
    }

    // Torre de controle + antena de radar giratório
    const towerBase = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.45, 7.6, 12), new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.7 }));
    towerBase.position.set(runwayX + 10.5, 3.8, -45);
    const towerGlass = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.5, 1.45, 12), new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.78, metalness: 0.5, roughness: 0.15 }));
    towerGlass.position.set(runwayX + 10.5, 8.2, -45);
    const towerRoof = new THREE.Mesh(new THREE.ConeGeometry(2.1, 0.8, 12), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
    towerRoof.position.set(runwayX + 10.5, 9.3, -45);

    const radarGroup = new THREE.Group();
    radarGroup.position.set(runwayX + 10.5, 9.95, -45);
    const radarBar = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.24, 0.12), new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.6 }));
    const radarMast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.55, 8), new THREE.MeshStandardMaterial({ color: 0x475569 }));
    radarMast.position.y = -0.25;
    radarGroup.add(radarBar, radarMast);
    this.radarDish = radarGroup;

    this.world.exteriorGroup.add(towerBase, towerGlass, towerRoof, radarGroup);

    const liveries = [
      { name: 'Global Blue',   stripeHex: '#2563eb', tail: 0x1d4ed8, engine: 0x1e3a8a, belly: 0x94a3b8 },
      { name: 'Royal Crimson', stripeHex: '#e11d48', tail: 0xbe123c, engine: 0x881337, belly: 0xcbd5e1 },
      { name: 'Emerald Air',   stripeHex: '#10b981', tail: 0x047857, engine: 0x065f46, belly: 0x94a3b8 }
    ];

    this.world.avioes = [];
    liveries.forEach((liv, i) => {
      const aviaoGroup = new THREE.Group();

      const matWhite = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.24, metalness: 0.18 });
      const matBelly = new THREE.MeshStandardMaterial({ color: liv.belly, roughness: 0.35, metalness: 0.35 });
      const matTail = new THREE.MeshStandardMaterial({ color: liv.tail, roughness: 0.28, metalness: 0.25 });
      const matEngine = new THREE.MeshStandardMaterial({ color: liv.engine, roughness: 0.32, metalness: 0.45 });
      const matChrome = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.88, roughness: 0.2 });
      const matCockpit = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.1, metalness: 0.9 });

      // Fuselagem principal + janelas pintadas nas laterais
      const bodyCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 4.8, 22), matWhite);
      bodyCyl.rotation.x = Math.PI / 2;
      bodyCyl.position.set(0, 0.92, 0);

      const windowTex = this.criarTexturaFuselagemAviao(liv.stripeHex);
      const sideDecalMat = new THREE.MeshStandardMaterial({ map: windowTex, roughness: 0.25, metalness: 0.15 });
      [-0.585, 0.585].forEach(sx => {
        const decal = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 0.52), sideDecalMat);
        decal.position.set(sx, 0.96, 0);
        decal.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2;
        aviaoGroup.add(decal);
      });

      // Nariz aerodinâmico + cone traseiro afilado
      const noseCone = new THREE.Mesh(new THREE.SphereGeometry(0.58, 18, 16), matWhite);
      noseCone.scale.set(1.0, 0.94, 1.85);
      noseCone.position.set(0, 0.89, 2.38);

      const tailCone = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.58, 2.2, 18), matWhite);
      tailCone.rotation.x = Math.PI / 2;
      tailCone.position.set(0, 0.99, -3.48);

      // Para-brisa envolvente do cockpit
      const cockpitVisor = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.55, 0.24, 14, 1, false, -Math.PI * 0.38, Math.PI * 0.76), matCockpit);
      cockpitVisor.position.set(0, 1.13, 2.52);
      cockpitVisor.rotation.x = 0.24;

      // Asas enflechadas com leve diedro + winglets + luzes de navegação e estrobo
      const wingL = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.11, 1.25), matBelly);
      wingL.position.set(-2.1, 0.80, -0.15);
      wingL.rotation.set(0, 0.24, -0.05);

      const wingR = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.11, 1.25), matBelly);
      wingR.position.set(2.1, 0.80, -0.15);
      wingR.rotation.set(0, -0.24, 0.05);

      const wingletL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.56, 0.38), matTail);
      wingletL.position.set(-3.92, 1.12, -0.58);
      wingletL.rotation.z = 0.22;

      const wingletR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.56, 0.38), matTail);
      wingletR.position.set(3.92, 1.12, -0.58);
      wingletR.rotation.z = -0.22;

      const navRed = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff2222 }));
      navRed.position.set(-3.96, 0.92, -0.45);
      const navGreen = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), new THREE.MeshBasicMaterial({ color: 0x22ff55 }));
      navGreen.position.set(3.96, 0.92, -0.45);

      const strobeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const strobeTop = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), strobeMat);
      strobeTop.position.set(0, 1.54, 0.2);

      // 2 Turbinas turbofan com pilone, anel metálico de entrada e escape
      [-1.48, 1.48].forEach(ex => {
        const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.30, 0.65), matBelly);
        pylon.position.set(ex, 0.68, 0.18);
        const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.24, 1.15, 16), matEngine);
        eng.rotation.x = Math.PI / 2;
        eng.position.set(ex, 0.52, 0.32);
        const lip = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.032, 8, 18), matChrome);
        lip.position.set(ex, 0.52, 0.89);
        const intake = new THREE.Mesh(new THREE.CircleGeometry(0.27, 14), matCockpit);
        intake.position.set(ex, 0.52, 0.88);
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.20, 10), matChrome);
        cone.rotation.x = Math.PI / 2;
        cone.position.set(ex, 0.52, 0.94);
        aviaoGroup.add(pylon, eng, lip, intake, cone);
      });

      // Cauda vertical + estabilizadores horizontais
      const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.65, 1.38), matTail);
      tailFin.position.set(0, 1.84, -3.72);
      tailFin.rotation.x = -0.30;

      const logoCircle = new THREE.Mesh(
        new THREE.CircleGeometry(0.32, 16),
        new THREE.MeshBasicMaterial({ color: 0xfef08a, side: THREE.DoubleSide })
      );
      logoCircle.position.set(0.075, 1.96, -3.72);
      logoCircle.rotation.y = Math.PI / 2;
      const logoCircleL = logoCircle.clone();
      logoCircleL.position.x = -0.075;

      const tailStabL = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.08, 0.64), matBelly);
      tailStabL.position.set(-0.68, 1.08, -3.88);
      tailStabL.rotation.y = 0.22;
      const tailStabR = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.08, 0.64), matBelly);
      tailStabR.position.set(0.68, 1.08, -3.88);
      tailStabR.rotation.y = -0.22;

      // Trem de pouso retrátil (pernas metálicas + pneus duplos)
      const landingGear = new THREE.Group();
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
      [[0, 2.0], [-0.78, -0.25], [0.78, -0.25]].forEach(([wx, wz]) => {
        const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.52, 8), matChrome);
        strut.position.set(wx, 0.42, wz);
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.18, 12), wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.18, wz);
        landingGear.add(strut, wheel);
      });

      aviaoGroup.add(
        bodyCyl, noseCone, tailCone, cockpitVisor,
        wingL, wingR, wingletL, wingletR, navRed, navGreen, strobeTop,
        tailFin, logoCircle, logoCircleL, tailStabL, tailStabR, landingGear
      );

      const startZ = -112 + i * 38;
      aviaoGroup.position.set(runwayX, 0, startZ);
      aviaoGroup.userData = {
        runwayX,
        speed: 4.5,
        phase: i === 0 ? 'taxi' : (i === 1 ? 'roll' : 'approach'),
        timer: 0,
        landingGear,
        strobeTop,
        strobeOffset: i * 280
      };
      if (i === 2) {
        aviaoGroup.position.set(runwayX, 14, -148);
        aviaoGroup.userData.speed = 15;
      }

      this.world.exteriorGroup.add(aviaoGroup);
      this.world.avioes.push(aviaoGroup);
    });
  }

  atualizarAvioes(delta) {
    if (this.world.modoInterior) return;

    if (this.radarDish) {
      this.radarDish.rotation.y += delta * 1.4;
    }

    const agora = performance.now();
    (this.world.avioes || []).forEach(av => {
      const ud = av.userData;
      ud.timer += delta;

      // Luz estroboscópica piscando no topo da fuselagem
      if (ud.strobeTop) {
        const ciclo = (agora + (ud.strobeOffset || 0)) % VEICULOS_CONFIG.STROBE_INTERVALO_MS;
        ud.strobeTop.visible = ciclo < 110;
      }

      // Trem de pouso recolhe automaticamente em voo de subida e baixa na aproximação
      if (ud.landingGear) {
        ud.landingGear.visible = ud.phase !== 'climb';
      }

      if (ud.phase === 'taxi') {
        av.position.y = 0;
        av.rotation.x += (0 - av.rotation.x) * 0.1;
        av.rotation.z += (0 - av.rotation.z) * 0.1;
        ud.speed = 4.5;
        av.position.z += ud.speed * delta;
        if (av.position.z >= -88) ud.phase = 'roll';
      } else if (ud.phase === 'roll') {
        ud.speed = Math.min(18.5, ud.speed + delta * 6.5);
        av.position.z += ud.speed * delta;
        if (av.position.z >= -48) ud.phase = 'rotate';
      } else if (ud.phase === 'rotate') {
        ud.speed = Math.min(22.0, ud.speed + delta * 4.0);
        av.position.z += ud.speed * delta;
        av.rotation.x += (-0.28 - av.rotation.x) * delta * 3.2;
        av.position.y += delta * 4.8;
        if (av.position.y >= 6.5) ud.phase = 'climb';
      } else if (ud.phase === 'climb') {
        av.position.z += ud.speed * delta;
        av.position.y += delta * 7.2;
        av.rotation.x += (-0.22 - av.rotation.x) * delta * 2.0;
        av.rotation.z += (-0.12 - av.rotation.z) * delta * 1.5;
        if (av.position.z > 65 || av.position.y > 34) {
          av.position.set(ud.runwayX, 16, -155);
          av.rotation.set(0.08, 0, 0);
          ud.speed = 14.5;
          ud.phase = 'approach';
        }
      } else if (ud.phase === 'approach') {
        av.position.z += ud.speed * delta;
        if (av.position.y > 0) {
          av.position.y = Math.max(0, av.position.y - delta * 4.2);
          av.rotation.x += (-0.06 - av.rotation.x) * delta * 2.5;
        } else {
          av.rotation.x += (0 - av.rotation.x) * 0.15;
          ud.speed = Math.max(4.5, ud.speed - delta * 5.0);
          if (av.position.z >= -95) ud.phase = 'taxi';
        }
      }
    });
  }

  // ============================================================================
  // 8. 🚢⛵🚤 FROTA MARÍTIMA REALISTA (NAVIO, IATE, VELEIROS E LANCHAS)
  // ============================================================================
  criarTexturaCabinesNavio() {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 14, 512, 26);
    ctx.fillRect(0, 58, 512, 24);

    // Janelas iluminadas das cabines nos dois convés
    for (let x = 14; x < 498; x += 24) {
      ctx.fillStyle = x % 48 === 14 ? '#fef08a' : '#38bdf8';
      ctx.fillRect(x, 19, 14, 15);
      ctx.fillStyle = x % 72 === 14 ? '#fde047' : '#7dd3fc';
      ctx.fillRect(x, 63, 14, 14);
    }
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(0, 102, 512, 14);
    return this.registrarTextura(new (window.THREE || this.THREE).CanvasTexture(c));
  }

  // 🚢 NAVIO DE CRUZEIRO / TRANSPORTE REALISTA (PROA EM +X)
  criarNavioRealista3D() {
    const THREE = window.THREE || this.THREE;
    const ship = new THREE.Group();

    const matCasco = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.42, metalness: 0.28 });
    const matLinhaAgua = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.55 });
    const matBranco = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35, metalness: 0.12 });
    const matDeck = new THREE.MeshStandardMaterial({ color: 0xb07d4f, roughness: 0.78 });
    const matVidro = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 0.78, roughness: 0.15 });
    const matChamine = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.38 });
    const matPreto = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65 });
    const matBote = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.45 });

    // Casco principal + faixa vermelha na linha d'água
    const cascoBase = new THREE.Mesh(new THREE.BoxGeometry(19.5, 2.2, 5.2), matCasco);
    cascoBase.position.set(-1.2, 1.15, 0);
    const linhaAgua = new THREE.Mesh(new THREE.BoxGeometry(19.8, 0.55, 5.28), matLinhaAgua);
    linhaAgua.position.set(-1.2, 0.28, 0);

    // Proa afilada (bico do navio apontando para +X)
    const proa = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 2.65, 5.6, 4), matCasco);
    proa.rotation.z = -Math.PI / 2;
    proa.rotation.x = Math.PI / 4;
    proa.scale.set(0.62, 1.0, 1.0);
    proa.position.set(10.8, 1.15, 0);

    const proaBase = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 2.55, 5.4, 4), matLinhaAgua);
    proaBase.rotation.z = -Math.PI / 2;
    proaBase.rotation.x = Math.PI / 4;
    proaBase.scale.set(0.22, 1.0, 1.0);
    proaBase.position.set(10.8, 0.30, 0);

    // Convés de madeira
    const deck = new THREE.Mesh(new THREE.BoxGeometry(19.2, 0.14, 4.9), matDeck);
    deck.position.set(-1.1, 2.28, 0);

    // Superestrutura (2 andares de cabines com textura de janelas iluminadas)
    const cabinTex = this.criarTexturaCabinesNavio();
    const matCabines = new THREE.MeshStandardMaterial({ map: cabinTex, roughness: 0.3 });
    const bloco1 = new THREE.Mesh(new THREE.BoxGeometry(15.2, 2.5, 4.5), matCabines);
    bloco1.position.set(-1.4, 3.55, 0);

    const bloco2 = new THREE.Mesh(new THREE.BoxGeometry(11.4, 1.65, 3.9), matBranco);
    bloco2.position.set(-1.1, 5.60, 0);

    // Ponte de comando envidraçada (mais larga para visão lateral)
    const ponte = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.15, 5.6), matBranco);
    ponte.position.set(4.5, 5.85, 0);
    const ponteVidro = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.62, 5.45), matVidro);
    ponteVidro.position.set(5.82, 5.95, 0);

    // Botes salva-vidas laranja nas laterais
    [-2.42, 2.42].forEach(bz => {
      [-4.2, -1.4, 1.4].forEach(bx => {
        const bote = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.45, 0.50), matBote);
        bote.position.set(bx, 2.65, bz);
        ship.add(bote);
      });
    });

    // Chaminé estilizada + mastro de radar + luzes de navegação
    const chamine = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.92, 2.6, 14), matChamine);
    chamine.position.set(-3.4, 7.65, 0);
    chamine.rotation.z = 0.14;
    const chamineTopo = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.66, 0.45, 14), matPreto);
    chamineTopo.position.set(-3.55, 8.95, 0);
    chamineTopo.rotation.z = 0.14;

    const mastro = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 2.6, 8), matBranco);
    mastro.position.set(4.2, 7.6, 0);
    const luzNavL = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff2222 }));
    luzNavL.position.set(5.8, 6.2, -2.75);
    const luzNavR = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), new THREE.MeshBasicMaterial({ color: 0x22ff55 }));
    luzNavR.position.set(5.8, 6.2, 2.75);

    // Fumaça leve saindo da chaminé (animada no update)
    const smokePuffs = [];
    const matSmoke = new THREE.MeshBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.42 });
    for (let s = 0; s < 4; s++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.45 + s * 0.16, 8, 8), matSmoke.clone());
      puff.position.set(-3.6 - s * 1.1, 9.4 + s * 0.55, 0);
      puff.userData.phase = s * 0.25;
      ship.add(puff);
      smokePuffs.push(puff);
    }

    // Rastro de espuma branca na água
    const wake = new THREE.Mesh(
      new THREE.PlaneGeometry(11.5, 4.4),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.34, depthWrite: false })
    );
    wake.rotation.x = -Math.PI / 2;
    wake.position.set(-16.2, 0.08, 0);

    ship.add(cascoBase, linhaAgua, proa, proaBase, deck, bloco1, bloco2, ponte, ponteVidro, chamine, chamineTopo, mastro, luzNavL, luzNavR, wake);
    ship.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    ship.userData.smokePuffs = smokePuffs;
    return ship;
  }

  // ⛵ VELEIRO REALISTA (PROA EM +X)
  criarVeleiroRealista3D(corCasco = 0x2563eb) {
    const THREE = window.THREE || this.THREE;
    const boat = new THREE.Group();

    const matCasco = new THREE.MeshStandardMaterial({ color: corCasco, roughness: 0.35, metalness: 0.2 });
    const matDeck = new THREE.MeshStandardMaterial({ color: 0xc89b6e, roughness: 0.78 });
    const matVela = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.65, side: THREE.DoubleSide });
    const matMastro = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.8, roughness: 0.25 });

    const hull = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.75, 1.85), matCasco);
    hull.position.set(-0.2, 0.35, 0);
    const bow = new THREE.Mesh(new THREE.ConeGeometry(1.05, 1.9, 4), matCasco);
    bow.rotation.z = -Math.PI / 2;
    bow.rotation.x = Math.PI / 4;
    bow.scale.set(0.55, 1.0, 1.15);
    bow.position.set(2.9, 0.36, 0);

    const deck = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.12, 1.65), matDeck);
    deck.position.set(-0.2, 0.74, 0);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.45, 1.2), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }));
    cabin.position.set(-0.5, 0.98, 0);

    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 5.8, 10), matMastro);
    mast.position.set(0.35, 3.6, 0);
    const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.5, 8), matMastro);
    boom.rotation.z = Math.PI / 2;
    boom.position.set(-0.9, 1.48, 0);

    // Vela principal + vela de proa triangulares
    const mainSailShape = new THREE.Shape();
    mainSailShape.moveTo(0, 0);
    mainSailShape.lineTo(-2.35, 0);
    mainSailShape.lineTo(0, 4.7);
    mainSailShape.closePath();
    const mainSail = new THREE.Mesh(new THREE.ShapeGeometry(mainSailShape), matVela);
    mainSail.position.set(0.30, 1.52, 0.04);
    mainSail.rotation.y = 0.10;

    const jibShape = new THREE.Shape();
    jibShape.moveTo(0, 0);
    jibShape.lineTo(2.45, 0);
    jibShape.lineTo(0, 4.1);
    jibShape.closePath();
    const jibSail = new THREE.Mesh(new THREE.ShapeGeometry(jibShape), matVela);
    jibSail.position.set(0.42, 1.38, -0.04);
    jibSail.rotation.y = -0.10;

    const wake = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 1.25),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.28, depthWrite: false })
    );
    wake.rotation.x = -Math.PI / 2;
    wake.position.set(-4.0, 0.06, 0);

    boat.add(hull, bow, deck, cabin, mast, boom, mainSail, jibSail, wake);
    boat.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return boat;
  }

  // 🛥️ IATE DE PASSEIO REALISTA (PROA EM +X)
  criarIateRealista3D() {
    const THREE = window.THREE || this.THREE;
    const yacht = new THREE.Group();

    const matBranco = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.18 });
    const matFaixa = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.25 });
    const matVidro = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.12 });
    const matDeck = new THREE.MeshStandardMaterial({ color: 0xb67b43, roughness: 0.78 });

    const hull = new THREE.Mesh(new THREE.BoxGeometry(7.2, 1.15, 2.75), matBranco);
    hull.position.set(-0.4, 0.55, 0);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(7.3, 0.18, 2.80), matFaixa);
    stripe.position.set(-0.4, 0.82, 0);
    const bow = new THREE.Mesh(new THREE.ConeGeometry(1.55, 2.8, 4), matBranco);
    bow.rotation.z = -Math.PI / 2;
    bow.rotation.x = Math.PI / 4;
    bow.scale.set(0.55, 1.0, 1.22);
    bow.position.set(4.5, 0.58, 0);

    const deck = new THREE.Mesh(new THREE.BoxGeometry(6.9, 0.12, 2.55), matDeck);
    deck.position.set(-0.4, 1.16, 0);
    const salon = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.05, 2.25), matBranco);
    salon.position.set(-0.3, 1.72, 0);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(4.32, 0.52, 2.30), matVidro);
    glass.position.set(-0.25, 1.78, 0);

    const flybridge = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.55, 1.85), matBranco);
    flybridge.position.set(-0.8, 2.48, 0);
    const arch = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.08, 8, 16, Math.PI), matBranco);
    arch.rotation.y = Math.PI / 2;
    arch.position.set(-1.3, 2.75, 0);

    const wake = new THREE.Mesh(
      new THREE.PlaneGeometry(5.2, 2.0),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.34, depthWrite: false })
    );
    wake.rotation.x = -Math.PI / 2;
    wake.position.set(-6.4, 0.07, 0);

    yacht.add(hull, stripe, bow, deck, salon, glass, flybridge, arch, wake);
    yacht.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return yacht;
  }

  // 🚤 LANCHA ESPORTIVA RÁPIDA (PROA EM +X)
  criarLanchaRealista3D(cor = 0xef4444) {
    const THREE = window.THREE || this.THREE;
    const boat = new THREE.Group();

    const matCor = new THREE.MeshStandardMaterial({ color: cor, roughness: 0.25, metalness: 0.32 });
    const matBranco = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.28 });
    const matVidro = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.12 });
    const matMotor = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45 });

    const hull = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.58, 1.55), matBranco);
    hull.position.set(-0.2, 0.28, 0);
    const topDeck = new THREE.Mesh(new THREE.BoxGeometry(3.45, 0.18, 1.58), matCor);
    topDeck.position.set(-0.2, 0.62, 0);
    const bow = new THREE.Mesh(new THREE.ConeGeometry(0.88, 1.65, 4), matCor);
    bow.rotation.z = -Math.PI / 2;
    bow.rotation.x = Math.PI / 4;
    bow.scale.set(0.45, 1.0, 1.2);
    bow.position.set(2.3, 0.38, 0);

    const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.34, 1.32), matVidro);
    windshield.position.set(0.55, 0.84, 0);
    windshield.rotation.z = 0.42;

    const motor = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.68, 0.34), matMotor);
    motor.position.set(-2.05, 0.46, 0);

    const wake = new THREE.Mesh(
      new THREE.PlaneGeometry(4.4, 1.25),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.42, depthWrite: false })
    );
    wake.rotation.x = -Math.PI / 2;
    wake.position.set(-4.3, 0.06, 0);

    boat.add(hull, topDeck, bow, windshield, motor, wake);
    boat.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return boat;
  }

  criarEmbarcacoesMar() {
    if (!this.world?.exteriorGroup) return;
    this.world.embarcacoes = [];

    const yAgua = VEICULOS_CONFIG.NIVEL_AGUA_MAR_Y;
    const frota = [
      { mesh: this.criarNavioRealista3D(),           x: -65, z: 128, dir:  1, speed: 2.6, ampBalanco: 0.018 },
      { mesh: this.criarIateRealista3D(),            x:  50, z: 112, dir: -1, speed: 4.1, ampBalanco: 0.032 },
      { mesh: this.criarVeleiroRealista3D(0x2563eb), x: -35, z: 103, dir:  1, speed: 2.9, ampBalanco: 0.048 },
      { mesh: this.criarVeleiroRealista3D(0x10b981), x:  72, z: 107, dir: -1, speed: 2.5, ampBalanco: 0.045 },
      { mesh: this.criarLanchaRealista3D(0xef4444),  x: -95, z:  98, dir:  1, speed: 7.4, ampBalanco: 0.040 },
      { mesh: this.criarLanchaRealista3D(0xf59e0b),  x:  15, z: 118, dir: -1, speed: 6.8, ampBalanco: 0.040 }
    ];

    frota.forEach((v, idx) => {
      v.mesh.position.set(v.x, yAgua, v.z);
      v.mesh.rotation.y = v.dir === 1 ? 0 : Math.PI;
      v.phase = idx * 1.15;
      this.world.exteriorGroup.add(v.mesh);
      this.world.embarcacoes.push(v);
    });
  }

  atualizarEmbarcacoes(delta) {
    if (this.world.modoInterior || !Array.isArray(this.world.embarcacoes)) return;
    const limX = VEICULOS_CONFIG.LIMITE_MAR_X;
    const yBase = VEICULOS_CONFIG.NIVEL_AGUA_MAR_Y;

    this.world.embarcacoes.forEach(v => {
      v.phase += delta * 1.9;
      v.mesh.position.x += v.dir * v.speed * delta;
      if (v.dir > 0 && v.mesh.position.x > limX) v.mesh.position.x = -limX;
      if (v.dir < 0 && v.mesh.position.x < -limX) v.mesh.position.x = limX;

      // Balanço suave realista das ondas
      v.mesh.position.y = yBase + Math.sin(v.phase) * 0.08;
      v.mesh.rotation.x = Math.sin(v.phase * 0.9) * v.ampBalanco;
      v.mesh.rotation.z = Math.cos(v.phase * 0.7) * (v.ampBalanco * 0.65);

      // Fumaça subindo da chaminé do navio
      if (v.mesh.userData?.smokePuffs) {
        v.mesh.userData.smokePuffs.forEach(puff => {
          puff.userData.phase = (puff.userData.phase + delta * 0.35) % 1;
          const t = puff.userData.phase;
          puff.position.set(-3.55 - t * 4.2, 9.2 + t * 2.6, Math.sin(v.phase + t * 4) * 0.25);
          const sc = 0.7 + t * 1.3;
          puff.scale.set(sc, sc, sc);
          puff.material.opacity = 0.42 * (1 - t);
        });
      }
    });
  }

  dispose() {
    this._cachedTextures.forEach(t => {
      try { t.dispose(); } catch (e) {}
    });
    this._cachedTextures = [];
    this.radarDish = null;
    this.world = null;
  }
}