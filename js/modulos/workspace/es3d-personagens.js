// js/modulos/workspace/es3d-personagens.js
// 👤🐾 Módulo Dedicado de Avatares Articulados (Joelhos/Cotovelos + Rosto Proporcional), NPCs, Pedestres, Músico e Animais

// ⚙️ PARÂMETROS AJUSTÁVEIS DE ANIMAÇÃO
const PERSONAGENS_CONFIG = {
  VEL_PASSO_CAMINHADA: 10.2,    // Ritmo da passada humana
  AMPLITUDE_QUADRIL: 0.52,      // Abertura da coxa ao caminhar
  DOBRA_MAX_JOELHO: 0.78,       // Quanto o joelho dobra durante a passada (rad)
  DOBRA_BASE_COTOVELO: -0.16,   // Flexão natural do cotovelo em repouso (rad)
  DOBRA_EXTRA_COTOVELO: -0.58,  // Flexão extra quando o braço vai para frente
  DIST_TELEPORTE_PET: 14.0      // Distância máxima antes do pet teleportar para o dono
};

export class ES3DPersonagens {
  constructor(world) {
    this.world = world;
    this.THREE = window.THREE;
  }

  // ============================================================================
  // 1. 👤 AVATAR HUMANO 3D REALISTA (ROSTO ENCAIXADO + JOELHOS E COTOVELOS)
  // ============================================================================
  criarBonecoHumano3D(corCamisa = 0x8b5cf6, corCalca = 0x1e293b, corPele = 0xfde68a, isFemale = false) {
    const THREE = window.THREE || this.THREE;
    const group = new THREE.Group();
    const bodyRoot = new THREE.Group();
    group.add(bodyRoot);

    const seed = Math.abs(Math.floor(Number(corCamisa) || 0));
    const tonsPeleNaturais = [0xf6d0b1, 0xe8b996, 0xd8a079, 0xbf825b, 0x8d5524];
    const corPeleFinal = corPele === 0xfde68a
      ? tonsPeleNaturais[seed % tonsPeleNaturais.length]
      : corPele;

    const coresCabeloF = [0x3b2314, 0x1f1815, 0x6b3e1e, 0x8c5523, 0x2a1a14];
    const coresCabeloM = [0x1c1917, 0x3b2718, 0x2b211c, 0x4a3321, 0x141414];
    const corCabeloFinal = isFemale
      ? coresCabeloF[seed % coresCabeloF.length]
      : coresCabeloM[seed % coresCabeloM.length];

    const coresIris = [0x5c3a21, 0x2c5282, 0x2f6b4f, 0x3f2e21];
    const corIrisFinal = coresIris[seed % coresIris.length];

    // 🎨 Materiais PBR
    const matPele = new THREE.MeshStandardMaterial({ color: corPeleFinal, roughness: 0.62, metalness: 0.03 });
    const matCamisa = new THREE.MeshStandardMaterial({ color: corCamisa, roughness: 0.72, metalness: 0.06 });
    const matCalca = new THREE.MeshStandardMaterial({ color: corCalca, roughness: 0.82, metalness: 0.05 });
    const matCabelo = new THREE.MeshStandardMaterial({ color: corCabeloFinal, roughness: 0.78, metalness: 0.08 });
    const matSapato = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.55, metalness: 0.1 });
    const matSola = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.85 });
    const matCinto = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.55 });
    const matMetal = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.82, roughness: 0.25 });
    const matGola = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.75 });
    const matBrancoOlho = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 });
    const matIris = new THREE.MeshStandardMaterial({ color: corIrisFinal, roughness: 0.25 });
    const matPupila = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.1 });
    const matGlint = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const matSobrancelha = new THREE.MeshStandardMaterial({ color: corCabeloFinal, roughness: 0.9 });
    const matBoca = new THREE.MeshStandardMaterial({ color: isFemale ? 0xd94662 : 0xa35a4e, roughness: 0.48 });
    const matBochecha = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      transparent: true,
      opacity: isFemale ? 0.22 : 0.08,
      roughness: 0.9
    });

    const hipX = isFemale ? 0.112 : 0.125;
    const shoulderX = isFemale ? 0.235 : 0.285;
    const chestScaleX = isFemale ? 0.37 : 0.45;
    const waistScaleX = isFemale ? 0.29 : 0.38;

    // 🦵 PERNAS COM ARTICULAÇÃO DE QUADRIL + JOELHO REAL (kneePivot)
    const criarPernaCompleta = (side) => {
      const legPivot = new THREE.Group();
      legPivot.position.set(side * hipX, 0.86, 0);

      // Coxa
      const coxa = new THREE.Mesh(
        new THREE.CylinderGeometry(isFemale ? 0.098 : 0.106, 0.080, 0.42, 14),
        matCalca
      );
      coxa.position.set(0, -0.21, 0);
      legPivot.add(coxa);

      // Articulação do joelho (esfera que preenche a dobra sem abrir buraco)
      const joelho = new THREE.Mesh(new THREE.SphereGeometry(0.080, 12, 12), matCalca);
      joelho.position.set(0, -0.42, 0.008);
      legPivot.add(joelho);

      // Pivô do Joelho (canela + tênis dobram juntos para trás!)
      const kneePivot = new THREE.Group();
      kneePivot.position.set(0, -0.42, 0);

      const canela = new THREE.Mesh(
        new THREE.CylinderGeometry(0.076, 0.066, 0.36, 14),
        matCalca
      );
      canela.position.set(0, -0.18, 0);
      kneePivot.add(canela);

      const tornozelo = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.056, 0.07, 12), matSola);
      tornozelo.position.set(0, -0.35, 0);
      kneePivot.add(tornozelo);

      // 👟 Tênis detalhado
      const shoeGroup = new THREE.Group();
      shoeGroup.position.set(0, -0.40, 0.045);

      const sola = new THREE.Mesh(new THREE.BoxGeometry(0.135, 0.045, 0.27), matSola);
      sola.position.set(0, -0.015, 0);

      const cabedalGeo = new THREE.SphereGeometry(0.085, 16, 12);
      cabedalGeo.scale(0.84, 0.62, 1.55);
      const cabedal = new THREE.Mesh(cabedalGeo, matSapato);
      cabedal.position.set(0, 0.032, 0.005);

      const lingua = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.04, 0.07), matSola);
      lingua.position.set(0, 0.062, 0.03);
      lingua.rotation.x = 0.25;

      shoeGroup.add(sola, cabedal, lingua);
      kneePivot.add(shoeGroup);
      legPivot.add(kneePivot);

      return { legPivot, kneePivot };
    };

    const pernaEsq = criarPernaCompleta(-1);
    const pernaDir = criarPernaCompleta(1);
    const leftLeg = pernaEsq.legPivot;
    const rightLeg = pernaDir.legPivot;
    const leftKnee = pernaEsq.kneePivot;
    const rightKnee = pernaDir.kneePivot;
    bodyRoot.add(leftLeg, rightLeg);

    // 👖 QUADRIL, CINTURA E CINTO
    const pelvisGeo = new THREE.SphereGeometry(0.5, 20, 16);
    pelvisGeo.scale(isFemale ? 0.44 : 0.43, 0.21, 0.28);
    const pelvis = new THREE.Mesh(pelvisGeo, matCalca);
    pelvis.position.set(0, 0.89, 0);
    bodyRoot.add(pelvis);

    if (isFemale) {
      const saia = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.27, 0.34, 18), matCalca);
      saia.position.set(0, 0.84, 0);
      bodyRoot.add(saia);
    }

    const cintoGeo = new THREE.CylinderGeometry(waistScaleX * 0.56, waistScaleX * 0.58, 0.065, 18);
    cintoGeo.scale(1.0, 1.0, 0.72);
    const cinto = new THREE.Mesh(cintoGeo, matCinto);
    cinto.position.set(0, 0.985, 0);
    const fivela = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.072, 0.035), matMetal);
    fivela.position.set(0, 0.985, waistScaleX * 0.41);
    bodyRoot.add(cinto, fivela);

    // 👕 TRONCO ANATÔMICO
    const torsoLower = new THREE.Mesh(
      new THREE.CylinderGeometry(chestScaleX * 0.52, waistScaleX * 0.56, 0.34, 18),
      matCamisa
    );
    torsoLower.scale.set(1, 1, 0.68);
    torsoLower.position.set(0, 1.18, 0);

    const torsoUpperGeo = new THREE.SphereGeometry(0.5, 22, 18);
    torsoUpperGeo.scale(chestScaleX, 0.42, 0.28);
    const torsoUpper = new THREE.Mesh(torsoUpperGeo, matCamisa);
    torsoUpper.position.set(0, 1.43, 0);
    bodyRoot.add(torsoLower, torsoUpper);

    if (isFemale) {
      const bustGeo = new THREE.SphereGeometry(0.095, 14, 12);
      const bustL = new THREE.Mesh(bustGeo, matCamisa);
      bustL.scale.set(1.0, 0.88, 0.68);
      bustL.position.set(-0.085, 1.39, 0.115);
      const bustR = bustL.clone();
      bustR.position.x = 0.085;
      bodyRoot.add(bustL, bustR);

      const colar = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.008, 8, 24), matMetal);
      colar.rotation.x = Math.PI / 2 + 0.25;
      colar.position.set(0, 1.56, 0.03);
      const pingente = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 10), matMetal);
      pingente.position.set(0, 1.515, 0.125);
      bodyRoot.add(colar, pingente);
    } else {
      const gola = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.022, 10, 20), matGola);
      gola.rotation.x = Math.PI / 2 + 0.15;
      gola.position.set(0, 1.585, 0.01);
      bodyRoot.add(gola);

      const estilo = seed % 3;
      if (estilo === 0) {
        for (let i = 0; i < 3; i++) {
          const bot = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), matGola);
          bot.position.set(0, 1.47 - i * 0.11, 0.145);
          bodyRoot.add(bot);
        }
      } else if (estilo === 1) {
        const bolso = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.095, 0.016), matCalca);
        bolso.position.set(-0.11, 1.41, 0.135);
        bodyRoot.add(bolso);
      }
    }

    // 💪 BRAÇOS COM ARTICULAÇÃO DE OMBRO + COTOVELO REAL (elbowPivot)
    const criarBracoCompleto = (side) => {
      const armPivot = new THREE.Group();
      armPivot.position.set(side * shoulderX, 1.53, 0);

      const ombro = new THREE.Mesh(new THREE.SphereGeometry(isFemale ? 0.082 : 0.095, 14, 12), matCamisa);
      const manga = new THREE.Mesh(
        new THREE.CylinderGeometry(isFemale ? 0.072 : 0.084, isFemale ? 0.062 : 0.072, 0.22, 14),
        matCamisa
      );
      manga.position.set(0, -0.11, 0);

      const bracoSup = new THREE.Mesh(
        new THREE.CylinderGeometry(isFemale ? 0.056 : 0.064, isFemale ? 0.050 : 0.058, 0.10, 12),
        matPele
      );
      bracoSup.position.set(0, -0.25, 0);

      const cotovelo = new THREE.Mesh(new THREE.SphereGeometry(isFemale ? 0.050 : 0.056, 10, 10), matPele);
      cotovelo.position.set(0, -0.30, 0);

      // Pivô do Cotovelo (antebraço + mão dobram naturalmente para frente!)
      const elbowPivot = new THREE.Group();
      elbowPivot.position.set(0, -0.30, 0);

      const antebraco = new THREE.Mesh(
        new THREE.CylinderGeometry(isFemale ? 0.050 : 0.056, isFemale ? 0.042 : 0.048, 0.28, 12),
        matPele
      );
      antebraco.position.set(0, -0.14, 0.005);

      const mao = new THREE.Group();
      mao.position.set(0, -0.30, 0.01);
      const palma = new THREE.Mesh(new THREE.SphereGeometry(0.056, 12, 10), matPele);
      palma.scale.set(0.82, 1.12, 0.56);
      mao.add(palma);

      for (let i = 0; i < 4; i++) {
        const dedo = new THREE.Mesh(new THREE.SphereGeometry(0.017, 8, 8), matPele);
        dedo.scale.set(0.85, 1.7, 0.85);
        dedo.position.set((-0.034 + i * 0.023), -0.060, 0.008);
        mao.add(dedo);
      }
      const polegar = new THREE.Mesh(new THREE.SphereGeometry(0.020, 8, 8), matPele);
      polegar.scale.set(0.8, 1.45, 0.9);
      polegar.position.set(-side * 0.050, -0.014, 0.018);
      polegar.rotation.z = side * 0.55;
      mao.add(polegar);

      elbowPivot.add(antebraco, mao);
      armPivot.add(ombro, manga, bracoSup, cotovelo, elbowPivot);

      return { armPivot, elbowPivot };
    };

    const bracoEsq = criarBracoCompleto(-1);
    const bracoDir = criarBracoCompleto(1);
    const leftArm = bracoEsq.armPivot;
    const rightArm = bracoDir.armPivot;
    const leftElbow = bracoEsq.elbowPivot;
    const rightElbow = bracoDir.elbowPivot;
    bodyRoot.add(leftArm, rightArm);

    // 😊 CABEÇA E ROSTO ENCAIXADOS NA CURVATURA REAL DO CRÂNIO
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.84, 0);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.088, 0.24, 14), matPele);
    neck.position.set(0, -0.21, 0);
    headGroup.add(neck);

    const headGeo = new THREE.SphereGeometry(0.215, 24, 22);
    headGeo.scale(0.92, 1.07, 0.96);
    const headMesh = new THREE.Mesh(headGeo, matPele);
    headGroup.add(headMesh);

    // Orelhas proporcionais (+ brincos para avatar feminino)
    [-1, 1].forEach(side => {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.044, 12, 10), matPele);
      ear.scale.set(0.48, 1.12, 0.70);
      ear.position.set(side * 0.193, -0.012, -0.008);
      headGroup.add(ear);

      if (isFemale) {
        const brinco = new THREE.Mesh(new THREE.SphereGeometry(0.017, 10, 10), matMetal);
        brinco.position.set(side * 0.198, -0.058, 0.008);
        headGroup.add(brinco);
      }
    });

    // Nariz rente à face (sem projetar exageradamente para frente)
    const noseBridge = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.018, 0.054, 10), matPele);
    noseBridge.position.set(0, -0.012, 0.194);
    noseBridge.rotation.x = -0.15;
    const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 10), matPele);
    noseTip.scale.set(1.04, 0.78, 0.80);
    noseTip.position.set(0, -0.036, 0.205);
    headGroup.add(noseBridge, noseTip);

    // Olhos, sobrancelhas, cílios e bochechas acompanhando a curvatura da esfera
    [-1, 1].forEach(side => {
      const ex = side * 0.068;
      const eyeYaw = side * 0.22;

      const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.034, 14, 14), matBrancoOlho);
      eyeWhite.scale.set(1.02, 0.84, 0.56);
      eyeWhite.position.set(ex, 0.028, 0.176);
      eyeWhite.rotation.y = eyeYaw;

      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.019, 12, 12), matIris);
      iris.scale.set(1.0, 1.0, 0.34);
      iris.position.set(ex, 0.028, 0.191);
      iris.rotation.y = eyeYaw;

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.0095, 10, 10), matPupila);
      pupil.scale.set(1.0, 1.0, 0.34);
      pupil.position.set(ex, 0.028, 0.1955);
      pupil.rotation.y = eyeYaw;

      const glint = new THREE.Mesh(new THREE.SphereGeometry(0.0038, 8, 8), matGlint);
      glint.position.set(ex + 0.006, 0.035, 0.199);

      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.068, isFemale ? 0.011 : 0.016, 0.010), matSobrancelha);
      brow.position.set(ex, 0.075, 0.178);
      brow.rotation.y = side * 0.25;
      brow.rotation.z = side * -0.08;

      const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 10), matBochecha);
      cheek.scale.set(1.05, 0.60, 0.25);
      cheek.position.set(side * 0.102, -0.028, 0.166);
      cheek.rotation.y = side * 0.42;

      headGroup.add(eyeWhite, iris, pupil, glint, brow, cheek);

      if (isFemale) {
        const lash = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.007, 0.009), matPupila);
        lash.position.set(ex, 0.049, 0.189);
        lash.rotation.y = eyeYaw;
        lash.rotation.z = side * -0.08;
        headGroup.add(lash);
      }
    });

    // Boca / Sorriso recuado e inclinado acompanhando a curvatura do queixo
    const mouthGroup = new THREE.Group();
    mouthGroup.position.set(0, -0.082, 0.190);
    mouthGroup.rotation.x = 0.36;

    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.034, 0.0072, 8, 16, Math.PI), matBoca);
    smile.rotation.z = Math.PI;
    smile.scale.set(1.06, 0.50, 0.68);
    mouthGroup.add(smile);

    if (isFemale) {
      const upperLip = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), matBoca);
      upperLip.scale.set(1.35, 0.24, 0.35);
      upperLip.position.set(0, -0.008, 0.002);
      mouthGroup.add(upperLip);
    }
    headGroup.add(mouthGroup);

    // 💇 CABELOS EM CAMADAS REALISTAS (RECUADOS ACIMA DA TESTA — OLHOS E SOBRANCELHAS 100% LIVRES)
    const hairStyle = seed % 3;
    const hairGroup = new THREE.Group();

    if (isFemale) {
      const capGeo = new THREE.SphereGeometry(0.226, 22, 18, 0, Math.PI * 2, 0, Math.PI * 0.43);
      capGeo.scale(0.95, 1.04, 1.0);
      const cap = new THREE.Mesh(capGeo, matCabelo);
      cap.position.set(0, 0.032, -0.02);
      cap.rotation.x = -0.25;
      hairGroup.add(cap);

      const franja = new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 12), matCabelo);
      franja.scale.set(1.35, 0.36, 0.45);
      franja.position.set(-0.045, 0.178, 0.145);
      franja.rotation.z = 0.20;
      hairGroup.add(franja);

      if (hairStyle === 0) {
        const backHair = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.205, 0.44, 16), matCabelo);
        backHair.scale.set(1.0, 1.0, 0.50);
        backHair.position.set(0, -0.17, -0.135);
        hairGroup.add(backHair);
        [-1, 1].forEach(side => {
          const strand = new THREE.Mesh(new THREE.SphereGeometry(0.068, 14, 12), matCabelo);
          strand.scale.set(0.72, 2.6, 0.80);
          strand.position.set(side * 0.185, -0.14, -0.055);
          hairGroup.add(strand);
        });
      } else if (hairStyle === 1) {
        const tie = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.013, 8, 16), matCamisa);
        tie.position.set(0, 0.045, -0.225);
        const pony = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 12), matCabelo);
        pony.scale.set(0.85, 2.0, 0.85);
        pony.position.set(0, -0.135, -0.255);
        pony.rotation.x = 0.22;
        hairGroup.add(tie, pony);
      } else {
        const bun = new THREE.Mesh(new THREE.SphereGeometry(0.10, 16, 14), matCabelo);
        bun.position.set(0, 0.235, -0.085);
        hairGroup.add(bun);
        [-1, 1].forEach(side => {
          const lock = new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 10), matCabelo);
          lock.scale.set(0.65, 1.85, 0.68);
          lock.position.set(side * 0.185, -0.05, -0.03);
          hairGroup.add(lock);
        });
      }
    } else {
      const capGeo = new THREE.SphereGeometry(0.223, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.41);
      capGeo.scale(0.95, 1.04, 0.99);
      const cap = new THREE.Mesh(capGeo, matCabelo);
      cap.position.set(0, 0.038, -0.022);
      cap.rotation.x = -0.27;
      hairGroup.add(cap);

      if (hairStyle === 0) {
        const quiff = new THREE.Mesh(new THREE.SphereGeometry(0.10, 14, 12), matCabelo);
        quiff.scale.set(1.18, 0.46, 0.72);
        quiff.position.set(0.015, 0.218, 0.075);
        quiff.rotation.z = -0.14;
        hairGroup.add(quiff);
      } else if (hairStyle === 1) {
        for (let i = 0; i < 6; i++) {
          const curl = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), matCabelo);
          curl.position.set(-0.125 + i * 0.05, 0.218 + (i % 2) * 0.015, 0.02 + (i % 2) * 0.03);
          hairGroup.add(curl);
        }
      } else {
        const sweep = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 12), matCabelo);
        sweep.scale.set(1.28, 0.35, 0.52);
        sweep.position.set(-0.015, 0.19, 0.12);
        hairGroup.add(sweep);
      }
    }

    headGroup.add(hairGroup);
    bodyRoot.add(headGroup);

    // 🟢 Anel de proximidade no chão
    const ringGeo = new THREE.RingGeometry(0.65, 0.82, 28);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.0 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = 0.03;
    ringMesh.userData.isRing = true;
    group.add(ringMesh);

    bodyRoot.traverse(obj => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    group.userData = {
      bodyRoot,
      leftLeg,
      rightLeg,
      leftKnee,
      rightKnee,
      leftArm,
      rightArm,
      leftElbow,
      rightElbow,
      headGroup,
      ringMat,
      matCamisa,
      matCalca,
      matSapato,
      walkPhase: 0,
      idlePhase: Math.random() * Math.PI * 2,
      emotePhase: 0,
      isEmoting: false,
      isFemale
    };
    return group;
  }

  // ============================================================================
  // 2. 🚶 ANIMAÇÃO NATURAL COM DOBRAS DE JOELHOS E COTOVELOS
  // ============================================================================
  animarPassosBoneco(meshGroup, estaAndando, delta) {
    const ud = meshGroup?.userData;
    if (!ud || !ud.leftLeg) return;

    const suavio = Math.min(1, delta * 11);

    if (ud.isEmoting) {
      ud.emotePhase += delta * 6.5;
      const wave = Math.sin(ud.emotePhase);
      if (ud.rightArm) {
        ud.rightArm.rotation.x = -2.05 + wave * 0.22;
        ud.rightArm.rotation.z = -0.35 + wave * 0.16;
      }
      if (ud.rightElbow) {
        ud.rightElbow.rotation.x = -0.52 + wave * 0.24;
      }
      if (ud.emotePhase > Math.PI * 2) {
        ud.isEmoting = false;
        ud.emotePhase = 0;
        if (ud.rightArm) { ud.rightArm.rotation.z = 0; ud.rightArm.rotation.x = 0; }
        if (ud.rightElbow) ud.rightElbow.rotation.x = PERSONAGENS_CONFIG.DOBRA_BASE_COTOVELO;
      }
      return;
    }

    if (estaAndando) {
      ud.walkPhase += delta * PERSONAGENS_CONFIG.VEL_PASSO_CAMINHADA;
      const fase = ud.walkPhase;

      const hipL = Math.sin(fase) * PERSONAGENS_CONFIG.AMPLITUDE_QUADRIL;
      const hipR = -hipL;

      // Dobra biomecânica dos joelhos (dobra para trás na fase de balanço para frente)
      const kneeL = 0.05 + Math.max(0, Math.sin(fase - 1.35)) * PERSONAGENS_CONFIG.DOBRA_MAX_JOELHO;
      const kneeR = 0.05 + Math.max(0, Math.sin(fase + Math.PI - 1.35)) * PERSONAGENS_CONFIG.DOBRA_MAX_JOELHO;

      // Balanço oposto dos braços + flexão natural dos cotovelos
      const armL = -hipL * 0.68;
      const armR = -hipR * 0.68;
      const elbowL = PERSONAGENS_CONFIG.DOBRA_BASE_COTOVELO + Math.max(0, -armL) * (PERSONAGENS_CONFIG.DOBRA_EXTRA_COTOVELO / 0.36);
      const elbowR = PERSONAGENS_CONFIG.DOBRA_BASE_COTOVELO + Math.max(0, -armR) * (PERSONAGENS_CONFIG.DOBRA_EXTRA_COTOVELO / 0.36);

      ud.leftLeg.rotation.x = hipL;
      ud.rightLeg.rotation.x = hipR;
      if (ud.leftKnee) ud.leftKnee.rotation.x = kneeL;
      if (ud.rightKnee) ud.rightKnee.rotation.x = kneeR;

      ud.leftArm.rotation.x = armL;
      ud.rightArm.rotation.x = armR;
      ud.leftArm.rotation.z = 0.06;
      ud.rightArm.rotation.z = -0.06;
      if (ud.leftElbow) ud.leftElbow.rotation.x = elbowL;
      if (ud.rightElbow) ud.rightElbow.rotation.x = elbowR;

      if (ud.bodyRoot) {
        ud.bodyRoot.position.y = Math.abs(Math.sin(fase)) * 0.042;
        ud.bodyRoot.rotation.y = Math.sin(fase) * 0.055;
      }
      if (ud.headGroup) {
        ud.headGroup.rotation.y *= 0.85;
      }
    } else {
      ud.idlePhase = (ud.idlePhase || 0) + delta * 2.2;
      ud.leftLeg.rotation.x += (0 - ud.leftLeg.rotation.x) * suavio;
      ud.rightLeg.rotation.x += (0 - ud.rightLeg.rotation.x) * suavio;
      if (ud.leftKnee) ud.leftKnee.rotation.x += (0.03 - ud.leftKnee.rotation.x) * suavio;
      if (ud.rightKnee) ud.rightKnee.rotation.x += (0.03 - ud.rightKnee.rotation.x) * suavio;

      ud.leftArm.rotation.x += (0 - ud.leftArm.rotation.x) * suavio;
      ud.rightArm.rotation.x += (0 - ud.rightArm.rotation.x) * suavio;
      ud.leftArm.rotation.z = 0.05;
      ud.rightArm.rotation.z = -0.05;
      if (ud.leftElbow) ud.leftElbow.rotation.x += (PERSONAGENS_CONFIG.DOBRA_BASE_COTOVELO - ud.leftElbow.rotation.x) * suavio;
      if (ud.rightElbow) ud.rightElbow.rotation.x += (PERSONAGENS_CONFIG.DOBRA_BASE_COTOVELO - ud.rightElbow.rotation.x) * suavio;

      if (ud.bodyRoot) {
        ud.bodyRoot.position.y = Math.sin(ud.idlePhase) * 0.012;
        ud.bodyRoot.rotation.y += (0 - ud.bodyRoot.rotation.y) * suavio;
      }
      if (ud.headGroup) {
        ud.headGroup.rotation.y = Math.sin(ud.idlePhase * 0.45) * 0.06;
      }
    }
  }

  animarEmote(entidade) {
    if (!entidade?.mesh?.userData) return;
    entidade.mesh.userData.isEmoting = true;
    entidade.mesh.userData.emotePhase = 0;
  }

  // ============================================================================
  // 3. 🏪 NPCs DAS LOJAS, PEDESTRES E MÚSICO DE RUA
  // ============================================================================
  criarNPCLoja(bCfg, spInfo, centerX, centerZ, signCol) {
    const npcX = centerX + (signCol * 3.1);
    const npcZ = centerZ;
    const isFemaleNPC = ['coffee', 'school', 'shopping', 'cinema', 'hotel', 'job', 'clothing', 'petshop', 'pharmacy', 'real_estate'].includes(bCfg.id);
    const npcMesh = this.criarBonecoHumano3D(bCfg.npcColor, 0x0f172a, 0xfde68a, isFemaleNPC);
    npcMesh.position.set(npcX, 0, npcZ);
    npcMesh.rotation.y = signCol === -1 ? (Math.PI / 2) : (-Math.PI / 2);
    this.world.scene.add(npcMesh);

    const labelEl = this.world.criarEtiquetaHTML(`${spInfo.emoji} ${spInfo.npcName}`, 'AI HOST', '#10b981');
    if (labelEl) labelEl.style.display = 'none';

    const npcObj = { id: bCfg.id, space: spInfo, name: spInfo.npcName, x: npcX, z: npcZ, mesh: npcMesh, labelEl, col: signCol };
    this.world.npcs3D.set(bCfg.id, npcObj);
    return npcObj;
  }

  criarPedestres() {
    this.world.pedestrians = [];
    const phrases = [
      "Beautiful day, isn't it?",
      "Hi there! Earning DOVRYX today?",
      "Check out the Guild Baú do Inglês!",
      "Have a wonderful day!"
    ];
    for (let i = 0; i < 8; i++) {
      const isLeft = i % 2 === 0;
      const isFemalePed = i % 2 === 1;
      const pedMesh = this.criarBonecoHumano3D(isLeft ? 0xf59e0b : 0x38bdf8, 0x1e293b, 0xfde68a, isFemalePed);
      const x = isLeft ? -8.8 : 8.8;
      const z = -85 + i * 12;
      pedMesh.position.set(x, 0, z);
      pedMesh.rotation.y = i % 2 === 0 ? 0 : Math.PI;
      const labelEl = this.world.criarEtiquetaHTML('Citizen', null, '#facc15');
      this.world.exteriorGroup.add(pedMesh);
      this.world.pedestrians.push({
        mesh: pedMesh,
        labelEl,
        x,
        z,
        dir: pedMesh.rotation.y === 0 ? 1 : -1,
        speed: 1.3 + Math.random() * 0.6,
        bubbleText: phrases[i % phrases.length],
        lastGreet: 0
      });
    }
  }

  atualizarPedestres(delta) {
    if (this.world.modoInterior || !this.world.localPlayer) return;
    const p = this.world.localPlayer;
    (this.world.pedestrians || []).forEach(ped => {
      ped.mesh.position.z += ped.dir * ped.speed * delta * 0.6;
      if (ped.mesh.position.z > 14) ped.mesh.position.z = -92;
      if (ped.mesh.position.z < -92) ped.mesh.position.z = 14;
      ped.mesh.rotation.y = ped.dir > 0 ? 0 : Math.PI;
      this.animarPassosBoneco(ped.mesh, true, delta);

      const d = Math.hypot(ped.mesh.position.x - p.x, ped.mesh.position.z - p.z);
      if (d < 3.2 && Date.now() - ped.lastGreet > 8000) {
        this.world.mostrarBalaoNoBoneco(ped, ped.bubbleText, 3500);
        ped.lastGreet = Date.now();
      }
    });
  }

  criarMusicoDeRua() {
    const THREE = window.THREE || this.THREE;
    const mus = this.criarBonecoHumano3D(0xf97316, 0x1e293b, 0xfde68a, false);
    mus.position.set(-8.8, 0, -24);
    mus.rotation.y = Math.PI / 3;

    const guitar = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.12, 0.6),
      new THREE.MeshLambertMaterial({ color: 0x92400e })
    );
    guitar.position.set(0, 1.2, 0.25);
    guitar.userData = { clickable: true, englishName: "Street Musician: That song is lit! Lit means amazing!" };
    this.world.clickableObjects.push(guitar);
    mus.add(guitar);

    const label = this.world.criarEtiquetaHTML('Musician 🎸', null, '#f59e0b');
    this.world.exteriorGroup.add(mus);
    this.world.musician = {
      mesh: mus,
      labelEl: label,
      x: -8.8,
      z: -24,
      lastTeach: 0,
      slangs: [
        "That song is lit! ('Lit' = amazing!)",
        "This beat is sick! ('Sick' = super cool!)",
        "I'm hyped for DOVRYX! ('Hyped' = very excited!)"
      ]
    };
  }

  atualizarMusico(delta = 0.016) {
    const mus = this.world.musician;
    if (!mus || !this.world.localPlayer || this.world.modoInterior) return;

    this.animarPassosBoneco(mus.mesh, false, delta);
    const d = Math.hypot(mus.x - this.world.localPlayer.x, mus.z - this.world.localPlayer.z);
    if (d < 3.8 && Date.now() - mus.lastTeach > 12000) {
      const slang = mus.slangs[Math.floor(Math.random() * mus.slangs.length)];
      this.world.mostrarBalaoNoBoneco(mus, slang, 5500);
      mus.lastTeach = Date.now();
    }
  }

  // ============================================================================
  // 4. 🐶🐱🐦 ANIMAIS REALISTAS + PET ADOTADO SEGUINDO SUAVEMENTE
  // ============================================================================
  criarAnimaisRua() {
    this.world.animais.caes = [];
    this.world.animais.gatos = [];
    this.world.animais.passaros = [];

    for (let i = 0; i < 2; i++) {
      const dog = this.criarCachorro3D(i === 0 ? 0xb4773e : 0x5c3a21);
      dog.position.set(-9 + i * 18, 0, -14 - i * 18);
      this.world.exteriorGroup.add(dog);
      this.world.animais.caes.push({
        mesh: dog,
        dir: i === 0 ? 1 : -1,
        speed: 1.5 + i * 0.25,
        x: dog.position.x,
        z: dog.position.z
      });
    }

    for (let i = 0; i < 2; i++) {
      const cat = this.criarGato3D(i === 0 ? 0xd97706 : 0x64748b);
      cat.position.set(i === 0 ? 8.6 : -8.6, 0, -26 - i * 20);
      this.world.exteriorGroup.add(cat);
      this.world.animais.gatos.push({
        mesh: cat,
        dir: i === 0 ? -1 : 1,
        speed: 1.05,
        x: cat.position.x,
        z: cat.position.z
      });
    }

    const THREE = window.THREE || this.THREE;
    this.world.animais.passarosGroup = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const bird = this.criarPassaro3D();
      bird.position.set((Math.random() - 0.5) * 70, 15 + Math.random() * 6, -35 + (Math.random() - 0.5) * 70);
      bird.userData.speed = 2.6 + Math.random() * 1.6;
      bird.userData.angle = Math.random() * Math.PI * 2;
      this.world.animais.passarosGroup.add(bird);
      this.world.animais.passaros.push(bird);
    }
    this.world.scene.add(this.world.animais.passarosGroup);
  }

  criarCachorro3D(corPelo = 0xc68642) {
    const THREE = window.THREE || this.THREE;
    const group = new THREE.Group();
    const bodyRoot = new THREE.Group();
    group.add(bodyRoot);

    const matPelo = new THREE.MeshStandardMaterial({ color: corPelo, roughness: 0.78 });
    const matBarriga = new THREE.MeshStandardMaterial({ color: 0xf3d5b5, roughness: 0.85 });
    const matOrelha = new THREE.MeshStandardMaterial({ color: 0x5c381a, roughness: 0.85 });
    const matFocinho = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.35 });
    const matColeira = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });
    const matTag = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.25 });
    const matOlho = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.15 });
    const matGlint = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const torso = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 14), matPelo);
    torso.scale.set(0.86, 0.88, 1.55);
    torso.position.set(0, 0.36, 0);

    const peito = new THREE.Mesh(new THREE.SphereGeometry(0.20, 14, 12), matBarriga);
    peito.scale.set(0.85, 0.9, 0.95);
    peito.position.set(0, 0.37, 0.22);

    const pescoco = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.22, 12), matPelo);
    pescoco.position.set(0, 0.49, 0.28);
    pescoco.rotation.x = 0.35;

    const coleira = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.022, 8, 18), matColeira);
    coleira.position.set(0, 0.48, 0.29);
    coleira.rotation.x = Math.PI / 2 - 0.35;

    const tag = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), matTag);
    tag.position.set(0, 0.40, 0.40);

    const head = new THREE.Group();
    head.position.set(0, 0.59, 0.36);

    const cranio = new THREE.Mesh(new THREE.SphereGeometry(0.165, 16, 14), matPelo);
    cranio.scale.set(0.95, 0.96, 1.05);

    const focinho = new THREE.Mesh(new THREE.SphereGeometry(0.088, 12, 10), matBarriga);
    focinho.scale.set(0.95, 0.78, 1.35);
    focinho.position.set(0, -0.045, 0.155);

    const nariz = new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 10), matFocinho);
    nariz.scale.set(1.1, 0.8, 0.8);
    nariz.position.set(0, -0.02, 0.255);

    const lingua = new THREE.Mesh(
      new THREE.SphereGeometry(0.028, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.4 })
    );
    lingua.scale.set(0.85, 0.4, 1.2);
    lingua.position.set(0, -0.092, 0.205);

    [-1, 1].forEach(side => {
      const olho = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 10), matOlho);
      olho.position.set(side * 0.068, 0.035, 0.135);
      const glint = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 6), matGlint);
      glint.position.set(side * 0.068 + 0.006, 0.044, 0.155);

      const orelha = new THREE.Mesh(new THREE.SphereGeometry(0.068, 10, 10), matOrelha);
      orelha.scale.set(0.45, 1.55, 0.85);
      orelha.position.set(side * 0.145, -0.015, -0.01);
      orelha.rotation.z = side * 0.22;

      head.add(olho, glint, orelha);
    });

    head.add(cranio, focinho, nariz, lingua);

    const tailPivot = new THREE.Group();
    tailPivot.position.set(0, 0.42, -0.34);
    const tailMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.045, 0.28, 10), matPelo);
    tailMesh.position.set(0, 0.11, -0.07);
    tailMesh.rotation.x = -0.65;
    tailPivot.add(tailMesh);

    const legs = [];
    const posPatas = [
      [-0.125, 0.26,  0.22],
      [ 0.125, 0.26,  0.22],
      [-0.125, 0.26, -0.22],
      [ 0.125, 0.26, -0.22]
    ];
    posPatas.forEach(([lx, ly, lz]) => {
      const pivot = new THREE.Group();
      pivot.position.set(lx, ly, lz);
      const perna = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.038, 0.24, 10), matPelo);
      perna.position.y = -0.12;
      const pata = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 8), matBarriga);
      pata.scale.set(0.95, 0.62, 1.25);
      pata.position.set(0, -0.24, 0.02);
      pivot.add(perna, pata);
      bodyRoot.add(pivot);
      legs.push(pivot);
    });

    bodyRoot.add(torso, peito, pescoco, coleira, tag, head, tailPivot);
    bodyRoot.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

    group.userData = {
      isPetModel: true,
      bodyRoot,
      legs,
      tailPivot,
      head,
      walkPhase: Math.random() * Math.PI * 2,
      tailPhase: Math.random() * Math.PI * 2
    };
    return group;
  }

  criarGato3D(corPelo = 0x9ca3af) {
    const THREE = window.THREE || this.THREE;
    const group = new THREE.Group();
    const bodyRoot = new THREE.Group();
    group.add(bodyRoot);

    const matPelo = new THREE.MeshStandardMaterial({ color: corPelo, roughness: 0.72 });
    const matClaro = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 });
    const matRosa = new THREE.MeshStandardMaterial({ color: 0xf9a8d4, roughness: 0.55 });
    const matOlho = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.2 });
    const matPupila = new THREE.MeshStandardMaterial({ color: 0x09090b });
    const matColeira = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.45 });
    const matSino = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.85, roughness: 0.2 });

    const torso = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 14), matPelo);
    torso.scale.set(0.78, 0.82, 1.55);
    torso.position.set(0, 0.29, 0);

    const peito = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), matClaro);
    peito.position.set(0, 0.30, 0.18);

    const pescoco = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.10, 0.16, 12), matPelo);
    pescoco.position.set(0, 0.40, 0.22);
    pescoco.rotation.x = 0.25;

    const coleira = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.016, 8, 16), matColeira);
    coleira.position.set(0, 0.39, 0.23);
    coleira.rotation.x = Math.PI / 2 - 0.25;

    const sino = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), matSino);
    sino.position.set(0, 0.33, 0.32);

    const head = new THREE.Group();
    head.position.set(0, 0.49, 0.28);

    const cranio = new THREE.Mesh(new THREE.SphereGeometry(0.135, 16, 14), matPelo);
    cranio.scale.set(1.06, 0.94, 0.96);

    const focinho = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), matClaro);
    focinho.scale.set(1.15, 0.78, 0.9);
    focinho.position.set(0, -0.032, 0.115);

    const nariz = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), matRosa);
    nariz.position.set(0, -0.018, 0.158);

    [-1, 1].forEach(side => {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.052, 0.12, 6), matPelo);
      ear.position.set(side * 0.082, 0.135, 0.0);
      ear.rotation.z = side * -0.22;

      const innerEar = new THREE.Mesh(new THREE.ConeGeometry(0.030, 0.08, 6), matRosa);
      innerEar.position.set(side * 0.082, 0.13, 0.022);
      innerEar.rotation.z = side * -0.22;

      const olho = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 10), matOlho);
      olho.position.set(side * 0.055, 0.02, 0.112);

      const pupila = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.034, 0.012), matPupila);
      pupila.position.set(side * 0.055, 0.02, 0.133);

      const whisker = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.004, 0.004), matClaro);
      whisker.position.set(side * 0.095, -0.035, 0.13);
      whisker.rotation.y = side * -0.25;

      head.add(ear, innerEar, olho, pupila, whisker);
    });
    head.add(cranio, focinho, nariz);

    const tailPivot = new THREE.Group();
    tailPivot.position.set(0, 0.34, -0.26);
    const tail1 = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.026, 0.24, 8), matPelo);
    tail1.position.set(0, 0.11, -0.05);
    tail1.rotation.x = -0.35;
    const tail2 = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.020, 0.18, 8), matClaro);
    tail2.position.set(0, 0.28, -0.07);
    tail2.rotation.x = 0.25;
    tailPivot.add(tail1, tail2);

    const legs = [];
    const posPatas = [
      [-0.095, 0.22,  0.17],
      [ 0.095, 0.22,  0.17],
      [-0.095, 0.22, -0.17],
      [ 0.095, 0.22, -0.17]
    ];
    posPatas.forEach(([lx, ly, lz]) => {
      const pivot = new THREE.Group();
      pivot.position.set(lx, ly, lz);
      const perna = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.026, 0.20, 10), matPelo);
      perna.position.y = -0.10;
      const pata = new THREE.Mesh(new THREE.SphereGeometry(0.034, 8, 8), matClaro);
      pata.scale.set(0.9, 0.6, 1.2);
      pata.position.set(0, -0.20, 0.015);
      pivot.add(perna, pata);
      bodyRoot.add(pivot);
      legs.push(pivot);
    });

    bodyRoot.add(torso, peito, pescoco, coleira, sino, head, tailPivot);
    bodyRoot.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

    group.userData = {
      isPetModel: true,
      bodyRoot,
      legs,
      tailPivot,
      head,
      walkPhase: Math.random() * Math.PI * 2,
      tailPhase: Math.random() * Math.PI * 2
    };
    return group;
  }

  criarPassaro3D() {
    const THREE = window.THREE || this.THREE;
    const group = new THREE.Group();

    const matCorpo = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
    const matPeito = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 });
    const matBico = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });

    const body = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), matCorpo);
    body.scale.set(0.85, 0.8, 1.65);

    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), matPeito);
    belly.scale.set(0.8, 0.65, 1.3);
    belly.position.set(0, -0.03, 0.02);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 10), matCorpo);
    head.position.set(0, 0.055, 0.16);

    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.09, 6), matBico);
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 0.045, 0.25);

    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.015, 0.16), matCorpo);
    tail.position.set(0, 0.02, -0.22);
    tail.rotation.x = 0.18;

    const wingGeo = new THREE.BoxGeometry(0.30, 0.018, 0.14);
    const wingL = new THREE.Group();
    wingL.position.set(-0.08, 0.04, 0.0);
    const meshWL = new THREE.Mesh(wingGeo, matCorpo);
    meshWL.position.x = -0.14;
    wingL.add(meshWL);

    const wingR = new THREE.Group();
    wingR.position.set(0.08, 0.04, 0.0);
    const meshWR = new THREE.Mesh(wingGeo, matCorpo);
    meshWR.position.x = 0.14;
    wingR.add(meshWR);

    group.add(body, belly, head, beak, tail, wingL, wingR);
    group.userData = { wingL, wingR, flapPhase: Math.random() * Math.PI * 2 };
    return group;
  }

  animarQuadrúpede(mesh, andando, delta) {
    const ud = mesh?.userData;
    if (!ud || !ud.legs) return;

    ud.tailPhase = (ud.tailPhase || 0) + delta * (andando ? 12 : 6);
    if (ud.tailPivot) {
      ud.tailPivot.rotation.z = Math.sin(ud.tailPhase) * (andando ? 0.55 : 0.35);
    }

    if (andando) {
      ud.walkPhase = (ud.walkPhase || 0) + delta * 13;
      const a = Math.sin(ud.walkPhase) * 0.62;
      if (ud.legs[0]) ud.legs[0].rotation.x = a;
      if (ud.legs[3]) ud.legs[3].rotation.x = a;
      if (ud.legs[1]) ud.legs[1].rotation.x = -a;
      if (ud.legs[2]) ud.legs[2].rotation.x = -a;
      if (ud.bodyRoot) ud.bodyRoot.position.y = Math.abs(Math.sin(ud.walkPhase)) * 0.035;
    } else {
      ud.legs.forEach(leg => { leg.rotation.x *= 0.82; });
      if (ud.bodyRoot) ud.bodyRoot.position.y = Math.sin(ud.tailPhase * 0.5) * 0.008;
    }
  }

  atualizarAnimais(delta) {
    if (this.world.adoptedPet && this.world.localPlayer) {
      const p = this.world.localPlayer;
      const pet = this.world.adoptedPet;

      const sinR = Math.sin(p.rotY || 0);
      const cosR = Math.cos(p.rotY || 0);
      const alvoX = p.x - sinR * 1.15 + cosR * 0.72;
      const alvoZ = p.z - cosR * 1.15 - sinR * 0.72;
      const alvoY = p.y || 0;

      const dx = alvoX - pet.position.x;
      const dz = alvoZ - pet.position.z;
      const dist = Math.hypot(dx, dz);

      let petAndando = false;

      if (dist > PERSONAGENS_CONFIG.DIST_TELEPORTE_PET) {
        pet.position.set(alvoX, alvoY, alvoZ);
        pet.rotation.y = p.rotY || 0;
      } else if (dist > 0.35) {
        const velPet = dist > 3.2 ? 9.5 : 6.2;
        const passo = Math.min(dist, velPet * delta);
        pet.position.x += (dx / dist) * passo;
        pet.position.z += (dz / dist) * passo;

        const angAlvo = Math.atan2(dx, dz);
        let diff = angAlvo - pet.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        pet.rotation.y += diff * Math.min(1, delta * 9.5);

        petAndando = dist > 0.45;
      } else {
        let diff = (p.rotY || 0) - pet.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        pet.rotation.y += diff * Math.min(1, delta * 4.0);
      }

      pet.position.y += (alvoY - pet.position.y) * Math.min(1, delta * 12);
      this.animarQuadrúpede(pet, petAndando, delta);
    }

    if (this.world.modoInterior) return;

    (this.world.animais?.caes || []).forEach(dogData => {
      dogData.mesh.position.z += dogData.dir * dogData.speed * delta;
      dogData.mesh.rotation.y = dogData.dir > 0 ? 0 : Math.PI;
      if (dogData.mesh.position.z > 10) dogData.mesh.position.z = -84;
      if (dogData.mesh.position.z < -84) dogData.mesh.position.z = 10;
      this.animarQuadrúpede(dogData.mesh, true, delta);
    });

    (this.world.animais?.gatos || []).forEach(catData => {
      catData.mesh.position.z += catData.dir * catData.speed * delta;
      catData.mesh.rotation.y = catData.dir > 0 ? 0 : Math.PI;
      if (catData.mesh.position.z > 10) catData.mesh.position.z = -84;
      if (catData.mesh.position.z < -84) catData.mesh.position.z = 10;
      this.animarQuadrúpede(catData.mesh, true, delta);
    });

    (this.world.animais?.passaros || []).forEach(bird => {
      bird.userData.angle += delta * 0.28;
      const vx = Math.cos(bird.userData.angle) * bird.userData.speed;
      const vz = Math.sin(bird.userData.angle) * bird.userData.speed;
      bird.position.x += vx * delta;
      bird.position.z += vz * delta;
      bird.rotation.y = Math.atan2(vx, vz);

      if (bird.userData.wingL) {
        bird.userData.flapPhase = (bird.userData.flapPhase || 0) + delta * 14;
        const flap = Math.sin(bird.userData.flapPhase) * 0.65;
        bird.userData.wingL.rotation.z = flap;
        bird.userData.wingR.rotation.z = -flap;
      }
    });
  }

  dispose() {
    this.world = null;
  }
}