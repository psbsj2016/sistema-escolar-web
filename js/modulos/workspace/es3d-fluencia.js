// js/modulos/workspace/es3d-fluencia.js
// 🛵🛂🏡⚡ Etapa 7: Entregador por Voz (Listening+Speaking), Passaporte 3D com Coach IA, House Tour e Eventos Relâmpago

// ⚙️ PARÂMETROS AJUSTÁVEIS DE JOGABILIDADE E RECOMPENSAS
const FLUENCIA_CONFIG = {
  PREMIO_ENTREGA_DRX: 85,            // Recompensa base ao concluir uma entrega
  BONUS_SEM_DICA_DRX: 20,            // Bônus extra por completar usando apenas Listening
  DESCONTO_DICA_DRX: 10,             // Redução no bônus se revelar o texto da instrução
  PREMIO_SELO_PASSAPORTE_DRX: 50,    // Bônus ao conquistar um novo selo de loja no Passaporte
  PREMIO_CONVERSA_NPC_DRX: 35,       // DRX por turno de conversa com NPC 3D
  PREMIO_HOUSE_TOUR_DRX: 90,         // Recompensa ao descrever 3 móveis da própria casa
  PREMIO_EVENTO_RELAMPAGO_DRX: 45,   // Recompensa ao acertar um Evento Relâmpago de Escuta
  INTERVALO_EVENTO_SEG: 240,         // Evento relâmpago automático a cada 4 minutos (240s)
  TEMPO_EVENTO_SEG: 35,              // Tempo (s) para responder o Evento Relâmpago
  RAIO_CHECKPOINT_ENTREGA: 5.8       // Distância até a porta/interior para coletar ou entregar
};

// 🛵 Pool de rotas de entrega com áudio real em inglês (Listening sem tradução)
const COURIER_MISSIONS_POOL = [
  {
    id: 'latte_clinic',
    item: 'an iced latte',
    emoji: '🧋',
    pickupId: 'coffee',
    deliverId: 'hospital',
    pickupAudio: 'New delivery! Go to the Coffee Shop and pick up an iced latte.',
    deliverAudio: 'Order picked up! Now deliver this iced latte to Doctor Evans at the Medical Clinic.'
  },
  {
    id: 'dict_school',
    item: 'an Oxford dictionary',
    emoji: '📖',
    pickupId: 'bookstore',
    deliverId: 'school',
    pickupAudio: 'New delivery! Head to the Bookstore and pick up an Oxford dictionary.',
    deliverAudio: 'Great! Now deliver the dictionary to Professor Carter at the School.'
  },
  {
    id: 'vitamins_hotel',
    item: 'a Vitamin C kit',
    emoji: '💊',
    pickupId: 'pharmacy',
    deliverId: 'hotel',
    pickupAudio: 'Urgent order! Go to the Pharmacy and pick up a Vitamin C kit.',
    deliverAudio: 'Got it! Take the Vitamin C kit to Sophia at the Hotel reception.'
  },
  {
    id: 'bread_home',
    item: 'fresh bakery bread',
    emoji: '🍞',
    pickupId: 'supermarket',
    deliverId: 'home',
    pickupAudio: 'New delivery! Ride to the Supermarket and pick up fresh bakery bread.',
    deliverAudio: 'Awesome! Deliver this warm bread to Sam at Home and Flatmates.'
  },
  {
    id: 'treats_fashion',
    item: 'a pack of pet treats',
    emoji: '🦴',
    pickupId: 'petshop',
    deliverId: 'clothing',
    pickupAudio: 'New order! Visit the Pet Shop and pick up a pack of pet treats.',
    deliverAudio: 'Picked up! Now take the pet treats to Bella at the Fashion Store.'
  },
  {
    id: 'salmon_airport',
    item: 'a grilled salmon meal',
    emoji: '🍽️',
    pickupId: 'restaurant',
    deliverId: 'airport',
    pickupAudio: 'Express delivery! Go to the Restaurant and pick up a grilled salmon meal.',
    deliverAudio: 'Got the meal! Hurry and deliver it to David at the Airport check-in counter.'
  },
  {
    id: 'hammer_supply',
    item: 'a power hammer',
    emoji: '🔨',
    pickupId: 'tools',
    deliverId: 'building_supply',
    pickupAudio: 'Builder order! Go to Hardware Tools and pick up a power hammer.',
    deliverAudio: 'Tool collected! Now deliver the power hammer to Bob at Building Supply.'
  },
  {
    id: 'popcorn_beach',
    item: 'a large butter popcorn',
    emoji: '🍿',
    pickupId: 'cinema',
    deliverId: 'beach',
    pickupAudio: 'Fun delivery! Stop by the Cinema and pick up a large butter popcorn.',
    deliverAudio: 'Smells delicious! Deliver the popcorn to Kai at the Beach.'
  }
];

// ⚡ Pool de Eventos Relâmpago de Escuta (Aeroporto, Coffee Shop e Clínica/Farmácia)
const FLASH_LISTENING_EVENTS = [
  {
    category: '✈️ Airport Boarding Call',
    spaceId: 'airport',
    audio: 'Attention passengers! Flight two zero four to London is now boarding at Gate B fourteen. Please proceed to Gate B fourteen immediately.',
    question: 'Which gate is the flight to London boarding from?',
    options: ['Gate A12 — New York', 'Gate B14 — London', 'Gate C04 — Tokyo'],
    correct: 1
  },
  {
    category: '✈️ Airport Announcement',
    spaceId: 'airport',
    audio: 'Final call for passengers flying to Tokyo! Your flight leaves in ten minutes from Gate C zero four.',
    question: 'What did the airport announcement say?',
    options: ['Tokyo flight is at Gate C04', 'London flight is delayed', 'New York flight is cancelled'],
    correct: 0
  },
  {
    category: '☕ Coffee Shop Rush Hour',
    spaceId: 'coffee',
    audio: 'Hi! I am in a hurry! Could I get a medium iced latte with oat milk and one blueberry muffin to go, please?',
    question: 'What did the customer order?',
    options: ['Hot tea + croissant (for here)', 'Medium iced latte with oat milk + blueberry muffin (to go)', 'Large black coffee + cake (to go)'],
    correct: 1
  },
  {
    category: '☕ Coffee Shop Rush Hour',
    spaceId: 'coffee',
    audio: 'Good morning! Can I have two hot cappuccinos with regular milk and a chocolate croissant for here, please?',
    question: 'Pick the exact customer order:',
    options: ['2 hot cappuccinos + chocolate croissant (for here)', '1 iced latte + muffin (to go)', '2 orange juices + sandwich (for here)'],
    correct: 0
  },
  {
    category: '🏥 Medical Clinic Emergency',
    spaceId: 'hospital',
    audio: 'Hello Doctor! I have had a terrible sore throat and a cough for two days, and I feel very tired.',
    question: 'Which symptoms did the patient describe?',
    options: ['Broken leg and earache', 'Sore throat, cough, and tiredness', 'Toothache and stomach pain'],
    correct: 1
  },
  {
    category: '💊 Pharmacy Advice',
    spaceId: 'pharmacy',
    audio: 'Take one Vitamin C tablet every morning with breakfast and drink plenty of water during the day.',
    question: 'When should the patient take the Vitamin C?',
    options: ['Once every morning with breakfast', 'Three times at midnight', 'Only on weekends'],
    correct: 0
  },
  {
    category: '🏨 Hotel Check-in Info',
    spaceId: 'hotel',
    audio: 'Welcome to the Grand Hotel! Your room is five zero eight on the fifth floor, and breakfast is served from seven to ten AM.',
    question: 'What room number and breakfast time did Sophia mention?',
    options: ['Room 302 • 6 AM to 8 AM', 'Room 508 • 7 AM to 10 AM', 'Room 105 • 9 AM to 12 PM'],
    correct: 1
  },
  {
    category: '🚕 City Taxi Dispatch',
    spaceId: 'taxi',
    audio: 'Traffic is light today! It will take twelve minutes to reach Central Station, and the total fare is fourteen DOVRYX.',
    question: 'How long is the ride and how much does it cost?',
    options: ['30 minutes • 40 DRX', '5 minutes • 8 DRX', '12 minutes • 14 DRX'],
    correct: 2
  }
];

const PASSPORT_RANKS = [
  { min: 24, label: '👑 City Legend (C1)', color: '#fde047' },
  { min: 18, label: '⭐ Ambassador (B2)',  color: '#c084fc' },
  { min: 10, label: '🏙️ Citizen (B1)',     color: '#38bdf8' },
  { min: 4,  label: '🧭 Explorer (A2)',    color: '#34d399' },
  { min: 0,  label: '🎒 Tourist (A1)',     color: '#cbd5e1' }
];

export class ES3DFluencia {
  constructor(world) {
    this.world = world;
    this.THREE = window.THREE;

    // 1. Passaporte 3D + Métricas de Fluência (pronto para a Etapa 9!)
    this.passport = { stamps: {}, turnsBySpace: {} };
    this.metrics = { spokenTurns: 0, deliveriesDone: 0, houseToursDone: 0, flashEventsWon: 0, grammarTips: [] };

    // 2. Missão de Entregador Ativa
    this.activeDelivery = null; // { mission, phase: 'pickup'|'deliver', usedHint, arrivedReady, startedAt }
    this.deliveryBeacon = null;

    // 3. Desafio House Tour Ativo
    this.activeHouseTour = null; // { steps: [{ name, emoji, prompt, furnitureUid }], index, completed }

    // 4. Evento Relâmpago de Escuta
    this.flashTimer = FLUENCIA_CONFIG.INTERVALO_EVENTO_SEG * 0.75; // Primeiro evento chega em ~3 min
    this.activeFlashEvent = null;

    // Elementos de UI flutuantes
    this.hudEl = null;
    this.coachBannerEl = null;
    this._coachTimer = null;
  }

  init() {
    this.carregarPassaporteEMetricas();
    this.criarHUDFlutuante();
  }

  // ============================================================================
  // 💾 PERSISTÊNCIA LOCAL DO PASSAPORTE E MÉTRICAS PEDAGÓGICAS
  // ============================================================================
  obterUid() {
    return String(this.world?.localPlayer?.userId || window.Workspace?.usuario?.id || 'guest');
  }

  obterChavePassport() { return `es3d_passport_${this.obterUid()}`; }
  obterChaveMetrics()  { return `es3d_fluencia_metrics_${this.obterUid()}`; }

  carregarPassaporteEMetricas() {
    try {
      const p = JSON.parse(localStorage.getItem(this.obterChavePassport()) || 'null');
      if (p && typeof p === 'object') {
        this.passport = { stamps: p.stamps || {}, turnsBySpace: p.turnsBySpace || {} };
      }
    } catch (e) {}

    try {
      const m = JSON.parse(localStorage.getItem(this.obterChaveMetrics()) || 'null');
      if (m && typeof m === 'object') {
        this.metrics = {
          spokenTurns: Number(m.spokenTurns) || 0,
          deliveriesDone: Number(m.deliveriesDone) || 0,
          houseToursDone: Number(m.houseToursDone) || 0,
          flashEventsWon: Number(m.flashEventsWon) || 0,
          grammarTips: Array.isArray(m.grammarTips) ? m.grammarTips.slice(0, 40) : []
        };
      }
    } catch (e) {}
  }

  salvarPassaporteEMetricas() {
    try {
      localStorage.setItem(this.obterChavePassport(), JSON.stringify(this.passport));
      localStorage.setItem(this.obterChaveMetrics(), JSON.stringify(this.metrics));
    } catch (e) {}
  }
  
  enviarTelemetriaNuvem(dados = {}) {
    const uid = this.obterUid();
    if (!uid || uid === 'guest') return;
    fetch('/api/workspace/english-spaces/progress/fluency-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        userId: uid,
        ownerName: this.world?.localPlayer?.nome || window.Workspace?.usuario?.nome || 'Student',
        escolaId: window.Workspace?.usuario?.escolaId || 'DEFAULT',
        stampsList: Object.keys(this.passport.stamps || {}),
        ...dados
      })
    }).catch(() => {});
  }

  obterPatenteAtual() {
    const qtd = Object.keys(this.passport.stamps || {}).length;
    return PASSPORT_RANKS.find(r => qtd >= r.min) || PASSPORT_RANKS[PASSPORT_RANKS.length - 1];
  }

  // ============================================================================
  // 🎨 HUD FLUTUANTE DE MISSÃO + BANNER DO COACH IA
  // ============================================================================
  criarHUDFlutuante() {
    document.getElementById('es-fluencia-hud')?.remove();
    document.getElementById('es-coach-banner')?.remove();
    const wrapper = document.getElementById('es-city-wrapper');
    if (!wrapper) return;

    const hud = document.createElement('div');
    hud.id = 'es-fluencia-hud';
    hud.style.cssText = `
      display: none; position: absolute; left: 50%; top: 98px; transform: translateX(-50%);
      z-index: 33; max-width: calc(100vw - 24px); width: max-content;
      background: linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,27,75,0.94));
      border: 1.5px solid rgba(56,189,248,0.65); border-radius: 16px;
      padding: 9px 14px; color: #f8fafc; font-family: Inter, sans-serif;
      box-shadow: 0 14px 36px rgba(0,0,0,0.55); backdrop-filter: blur(14px);
      flex-direction: column; align-items: center; gap: 6px; text-align: center;
    `;
    wrapper.appendChild(hud);
    this.hudEl = hud;

    const coach = document.createElement('div');
    coach.id = 'es-coach-banner';
    coach.style.cssText = `
      display: none; position: absolute; left: 50%; bottom: 86px; transform: translateX(-50%);
      z-index: 35; max-width: min(480px, calc(100vw - 28px));
      background: linear-gradient(135deg, rgba(6,78,59,0.95), rgba(15,23,42,0.95));
      border: 1.5px solid #10b981; border-radius: 14px; padding: 10px 15px;
      color: #d1fae5; font-family: Inter, sans-serif; font-size: 12.5px; font-weight: 700;
      box-shadow: 0 12px 30px rgba(0,0,0,0.55); line-height: 1.4; text-align: center;
    `;
    wrapper.appendChild(coach);
    this.coachBannerEl = coach;
  }

  mostrarCoachTip(dica, duracaoMs = 7500) {
    if (!dica || !this.coachBannerEl) return;
    const limpa = String(dica).trim();
    if (!limpa) return;

    this.metrics.grammarTips.unshift({ tip: limpa, zone: this.world?.currentZoneId || 'street', at: Date.now() });
    this.metrics.grammarTips = this.metrics.grammarTips.slice(0, 40);
    this.salvarPassaporteEMetricas();

    this.coachBannerEl.innerHTML = `💡 <strong style="color:#6ee7b7;">AI Coach Tip:</strong> ${limpa}`;
    this.coachBannerEl.style.display = 'block';
    clearTimeout(this._coachTimer);
    this._coachTimer = setTimeout(() => {
      if (this.coachBannerEl) this.coachBannerEl.style.display = 'none';
    }, duracaoMs);
  }

  // ============================================================================
  // 1. 🛵 MISSÕES DE ENTREGADOR POR VOZ (LISTENING + SPEAKING)
  // ============================================================================
  criarBeaconEntrega(buildingId) {
    this.removerBeaconEntrega();
    const THREE = window.THREE || this.THREE;
    const b = this.world?.buildingsMeta?.find(x => x.id === buildingId);
    if (!THREE || !b || !this.world?.exteriorGroup) return;

    const beamGroup = new THREE.Group();
    const bx = b.frontX - b.col * 2.0;
    const bz = b.doorZ;

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.85, 1.25, 28),
      new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.08;

    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.95, 14, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false })
    );
    beam.position.y = 7.0;

    beamGroup.add(ring, beam);
    beamGroup.position.set(bx, 0, bz);
    this.world.exteriorGroup.add(beamGroup);
    this.deliveryBeacon = { group: beamGroup, ring, beam };
  }

  removerBeaconEntrega() {
    if (!this.deliveryBeacon) return;
    try {
      this.world?.exteriorGroup?.remove(this.deliveryBeacon.group);
      this.deliveryBeacon.ring?.geometry?.dispose();
      this.deliveryBeacon.ring?.material?.dispose();
      this.deliveryBeacon.beam?.geometry?.dispose();
      this.deliveryBeacon.beam?.material?.dispose();
    } catch (e) {}
    this.deliveryBeacon = null;
  }

  iniciarMissaoEntrega() {
    if (this.activeHouseTour) this.encerrarHouseTour(false);

    if (this.activeDelivery) {
      this.repetirAudioEntrega();
      return;
    }

    const sorteada = COURIER_MISSIONS_POOL[Math.floor(Math.random() * COURIER_MISSIONS_POOL.length)];
    this.activeDelivery = {
      mission: sorteada,
      phase: 'pickup',
      usedHint: false,
      arrivedReady: false,
      startedAt: Date.now()
    };

    // O beacon só aparece se o aluno pedir Dica — assim o desafio começa em Listening puro!
    this.removerBeaconEntrega();
    this.atualizarHUDEntrega();
    this.repetirAudioEntrega();

    if (window.Workspace?.mostrarAviso) {
      window.Workspace.mostrarAviso('🎧 Ouça o pedido em inglês e vá até o local de coleta! Monte na bike/moto/carro para ir mais rápido!', 'info', 4200);
    }
  }

  cancelarMissaoEntrega() {
    this.activeDelivery = null;
    this.removerBeaconEntrega();
    document.getElementById('es-delivery-speak-modal')?.remove();
    if (this.hudEl) this.hudEl.style.display = 'none';
  }

  repetirAudioEntrega() {
    if (!this.activeDelivery) return;
    const m = this.activeDelivery.mission;
    const texto = this.activeDelivery.phase === 'pickup' ? m.pickupAudio : m.deliverAudio;
    const zone = this.activeDelivery.phase === 'pickup' ? m.pickupId : m.deliverId;
    this.world?.falarTextoNPC?.(texto, zone);
  }

  revelarDicaEntrega() {
    if (!this.activeDelivery) return;
    this.activeDelivery.usedHint = true;
    const alvoId = this.activeDelivery.phase === 'pickup'
      ? this.activeDelivery.mission.pickupId
      : this.activeDelivery.mission.deliverId;
    this.criarBeaconEntrega(alvoId);
    this.atualizarHUDEntrega();
  }

  atualizarHUDEntrega() {
    if (!this.hudEl || !this.activeDelivery) return;
    const d = this.activeDelivery;
    const m = d.mission;
    const emColeta = d.phase === 'pickup';
    const textoAudio = emColeta ? m.pickupAudio : m.deliverAudio;

    this.hudEl.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; justify-content:center;">
        <span style="background:${emColeta ? '#f59e0b' : '#10b981'}; color:#0f172a; padding:2px 9px; border-radius:999px; font-size:10.5px; font-weight:900;">
          ${emColeta ? '🛵 1/2 PICKUP' : '📦 2/2 DELIVER'}
        </span>
        <span style="font-size:12px; font-weight:800; color:#e2e8f0;">
          ${d.usedHint ? `"${textoAudio}"` : '🎧 Listening Mode: Ouça o áudio e encontre o local pela cidade!'}
        </span>
      </div>
      <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; justify-content:center;">
        <button type="button" id="es-deliv-replay" style="background:#2563eb; color:#fff; border:none; border-radius:999px; padding:5px 11px; font-size:11px; font-weight:800; cursor:pointer;">🔊 Ouvir Áudio</button>
        ${!d.usedHint ? `<button type="button" id="es-deliv-hint" style="background:#334155; color:#fde047; border:1px solid #475569; border-radius:999px; padding:5px 11px; font-size:11px; font-weight:800; cursor:pointer;">💡 Dica + GPS (-${FLUENCIA_CONFIG.DESCONTO_DICA_DRX} DRX)</button>` : ''}
        ${(!emColeta && d.arrivedReady) ? `<button type="button" id="es-deliv-speak-now" style="background:linear-gradient(135deg,#10b981,#059669); color:#fff; border:none; border-radius:999px; padding:6px 14px; font-size:11.5px; font-weight:900; cursor:pointer;">🎤 Falar Entrega (+${FLUENCIA_CONFIG.PREMIO_ENTREGA_DRX} DRX)</button>` : ''}
        <button type="button" id="es-deliv-cancel" style="background:rgba(239,68,68,0.2); color:#fca5a5; border:1px solid rgba(239,68,68,0.4); border-radius:999px; padding:5px 9px; font-size:11px; font-weight:800; cursor:pointer;">✕</button>
      </div>
    `;
    this.hudEl.style.display = 'flex';

    this.hudEl.querySelector('#es-deliv-replay')?.addEventListener('click', () => this.repetirAudioEntrega());
    this.hudEl.querySelector('#es-deliv-hint')?.addEventListener('click', () => this.revelarDicaEntrega());
    this.hudEl.querySelector('#es-deliv-speak-now')?.addEventListener('click', () => this.abrirModalFalaEntrega());
    this.hudEl.querySelector('#es-deliv-cancel')?.addEventListener('click', () => this.cancelarMissaoEntrega());
  }

  abrirModalFalaEntrega() {
    if (!this.activeDelivery || this.activeDelivery.phase !== 'deliver') return;
    document.getElementById('es-delivery-speak-modal')?.remove();

    const m = this.activeDelivery.mission;
    const bDest = this.world?.buildingsMeta?.find(b => b.id === m.deliverId);
    const npcNome = bDest?.space?.npcName || 'Recipient';
    const lojaNome = bDest?.space?.name || m.deliverId.toUpperCase();

    const html = `
      <div id="es-delivery-speak-modal" style="position:fixed; inset:0; z-index:1000255; background:rgba(5,7,14,0.84); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; padding:16px; font-family:Inter,sans-serif;">
        <div style="background:#0f172a; border:2px solid #10b981; border-radius:22px; padding:22px; width:100%; max-width:430px; color:#fff; box-shadow:0 25px 65px rgba(0,0,0,0.75);">
          <div style="font-size:40px; text-align:center;">${m.emoji}📦</div>
          <h3 style="margin:6px 0 4px; text-align:center; color:#6ee7b7; font-size:18px;">Complete Delivery at ${lojaNome}</h3>
          <p style="margin:0 0 12px; text-align:center; color:#cbd5e1; font-size:13px; line-height:1.45;">
            Speak or type in English to hand <b>${m.item}</b> to <b>${npcNome}</b>:
          </p>
          <div style="background:rgba(16,185,129,0.12); border:1px dashed rgba(52,211,153,0.45); border-radius:10px; padding:8px 10px; margin-bottom:12px; font-size:12px; color:#a7f3d0;">
            💬 Example: <i>"Hello! Here is ${m.item} for you. Have a great day!"</i>
          </div>
          <input type="text" id="es-deliv-input" placeholder="Speak with mic or type your English sentence..." autocomplete="off" style="width:100%; padding:11px 12px; border-radius:10px; border:1px solid #334155; background:#1e293b; color:#fff; font-size:13.5px; margin-bottom:12px; box-sizing:border-box;" />
          <div style="display:flex; gap:8px;">
            <button type="button" id="es-deliv-mic" style="flex:1; padding:11px; background:linear-gradient(135deg,#2563eb,#0ea5e9); color:#fff; border:none; border-radius:11px; font-weight:800; cursor:pointer;">🎤 Speak</button>
            <button type="button" id="es-deliv-submit" style="flex:1.2; padding:11px; background:linear-gradient(135deg,#10b981,#059669); color:#fff; border:none; border-radius:11px; font-weight:900; cursor:pointer;">Deliver ✅</button>
            <button type="button" id="es-deliv-close" style="padding:11px 14px; background:#334155; color:#cbd5e1; border:none; border-radius:11px; font-weight:700; cursor:pointer;">✕</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    const inp = document.getElementById('es-deliv-input');
    const subBtn = document.getElementById('es-deliv-submit');

    const finalizar = async () => {
      const frase = (inp?.value || '').trim();
      if (frase.split(/\s+/).length < 3) {
        window.Workspace?.mostrarAviso?.('Fale ou digite uma frase completa em inglês (mínimo 3 palavras)!', 'warning', 2800);
        return;
      }

      if (subBtn) { subBtn.disabled = true; subBtn.textContent = '⏳...'; }
      this.metrics.spokenTurns++;

      // Avaliação real com o Coach IA do servidor
      let respostaNpc = `Thank you so much for delivering ${m.item}! You did a great job!`;
      try {
        const res = await fetch('/api/workspace/english-spaces/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            message: frase,
            spaceName: lojaNome,
            npcName: npcNome,
            npcRole: 'Customer receiving delivery',
            studentRole: 'Delivery Courier',
            level: this.world?.parentManager?.state?.level || 'B1',
            missions: [{ id: 'deliver', title: `Deliver ${m.item} politely in English` }]
          })
        }).then(r => r.json()).catch(() => null);

        if (res && res.success) {
          if (res.reply) respostaNpc = res.reply;
          if (res.grammarTip) this.mostrarCoachTip(res.grammarTip);
        }
      } catch (e) {}

      document.getElementById('es-delivery-speak-modal')?.remove();

      const semDica = !this.activeDelivery?.usedHint;
      const premio = FLUENCIA_CONFIG.PREMIO_ENTREGA_DRX + (semDica ? FLUENCIA_CONFIG.BONUS_SEM_DICA_DRX : -FLUENCIA_CONFIG.DESCONTO_DICA_DRX);

      this.world?.mostrarBalaoNoBoneco?.(this.world.localPlayer, `${m.emoji} ${frase}`, 5000);
      this.world?.falarTextoNPC?.(respostaNpc, m.deliverId);
      this.world?.interacoesPro?.dispararEmote?.('jump', false);

      this.metrics.deliveriesDone++;
      this.enviarTelemetriaNuvem({ spokenPhrase: frase, spaceId: m.deliverId, source: 'Delivery 3D', incDelivery: true });
      this.salvarPassaporteEMetricas();
      this.cancelarMissaoEntrega();

      await window.DOVRYX?.add(premio, `Voice Delivery ${semDica ? '(Listening Bonus! 🎧)' : '🛵'}`);
    };

    document.getElementById('es-deliv-close')?.addEventListener('click', () => document.getElementById('es-delivery-speak-modal')?.remove());
    subBtn?.addEventListener('click', finalizar);
    inp?.addEventListener('keypress', (e) => { if (e.key === 'Enter') finalizar(); });
    document.getElementById('es-deliv-mic')?.addEventListener('click', () => {
      this.world?.garantirAudioAtivo?.();
      this.world?.parentManager?.ouvirMicrofone?.((falado) => {
        if (inp && falado) inp.value = falado;
      });
    });
  }

  atualizarProgressoEntrega() {
    if (!this.activeDelivery || !this.world?.localPlayer) return;
    const p = this.world.localPlayer;
    const d = this.activeDelivery;
    const alvoId = d.phase === 'pickup' ? d.mission.pickupId : d.mission.deliverId;
    const b = this.world.buildingsMeta?.find(x => x.id === alvoId);
    if (!b) return;

    const dentroDaLoja = this.world.modoInterior && this.world.predioAtual === alvoId;
    const distPorta = Math.hypot(p.x - b.frontX, p.z - b.doorZ);
    const chegou = dentroDaLoja || (!this.world.modoInterior && !this.world.torreAtual && distPorta <= FLUENCIA_CONFIG.RAIO_CHECKPOINT_ENTREGA);

    if (d.phase === 'pickup' && chegou) {
      d.phase = 'deliver';
      d.arrivedReady = false;
      this.removerBeaconEntrega();
      if (d.usedHint) this.criarBeaconEntrega(d.mission.deliverId);
      this.atualizarHUDEntrega();
      this.repetirAudioEntrega();
      this.world?.mostrarBalaoNoBoneco?.(p, `${d.mission.emoji} Picked up ${d.mission.item}!`, 4000);
      window.Workspace?.mostrarAviso?.(`📦 Pedido coletado! Ouça o destino da entrega!`, 'success', 3800);
    } else if (d.phase === 'deliver' && chegou && !d.arrivedReady) {
      d.arrivedReady = true;
      this.atualizarHUDEntrega();
      window.Workspace?.mostrarAviso?.('🎯 Você chegou! Clique em "🎤 Falar Entrega" para concluir em inglês!', 'success', 3800);
    }
  }

  // ============================================================================
  // 2. 🛂 PASSAPORTE 3D (24 SELOS) + CONVERSA COM COACH IA NAS LOJAS
  // ============================================================================
  async processarConversaComNPC3D(npcAlvo, texto) {
    const sp = npcAlvo.space;
    const p = this.world?.localPlayer;
    if (!sp || !p) return;

    this.metrics.spokenTurns++;
    this.passport.turnsBySpace[sp.id] = (this.passport.turnsBySpace[sp.id] || 0) + 1;
    const turnosAqui = this.passport.turnsBySpace[sp.id];

    const nivel = this.world?.parentManager?.state?.level || 'B1';
    const missoes = Array.isArray(sp.missions) ? sp.missions : [];

    try {
      const res = await fetch('/api/workspace/english-spaces/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: texto,
          spaceName: sp.name,
          npcName: sp.npcName,
          npcRole: (sp.roles && sp.roles[1]) ? sp.roles[1] : 'Host',
          studentRole: p.role || (sp.roles && sp.roles[0]) || 'Student',
          level: nivel,
          missions: missoes
        })
      }).then(r => r.json()).catch(() => null);

      const resposta = (res && res.success && res.reply)
        ? res.reply
        : `Great! Welcome to ${sp.name}. How else can I help you today?`;

      this.world.mostrarBalaoNoBoneco?.(npcAlvo.ref, resposta, 8500);
      this.world.adicionarMensagemFeedProximidade?.(sp.npcName, resposta, '#34d399');
      this.world.falarTextoNPC?.(resposta, sp.id);

      if (res?.grammarTip) {
        this.mostrarCoachTip(res.grammarTip);
      }

      await window.DOVRYX?.add(FLUENCIA_CONFIG.PREMIO_CONVERSA_NPC_DRX, `Conversation at ${sp.name}`);

      // Carimba o Passaporte 3D se a IA validou uma missão OU após 2 turnos reais na loja
      const jaCarimbado = Boolean(this.passport.stamps[sp.id]);
      if (!jaCarimbado && (res?.completedMissionId || turnosAqui >= 2)) {
        this.passport.stamps[sp.id] = {
          spaceId: sp.id,
          name: sp.name,
          emoji: sp.emoji || '🏪',
          stampedAt: Date.now()
        };
        this.world.interacoesPro?.dispararEmote?.('jump', false);
        const totalSelos = Object.keys(this.passport.stamps).length;
        window.Workspace?.mostrarAviso?.(`🛂 Passaporte Carimbado: ${sp.emoji} ${sp.name} (${totalSelos}/24)!`, 'success', 4500);
        await window.DOVRYX?.add(FLUENCIA_CONFIG.PREMIO_SELO_PASSAPORTE_DRX, `Passport Stamp: ${sp.name} 🛂`);
      }

      this.salvarPassaporteEMetricas();
      this.enviarTelemetriaNuvem({
        spokenPhrase: texto,
        grammarTip: res?.grammarTip || null,
        spaceId: sp.id,
        source: 'NPC 3D'
      });
    } catch (e) {}
  }

  abrirModalPassaporte() {
    document.getElementById('es-passport-modal')?.remove();

    const predios = this.world?.buildingsMeta || [];
    const total = predios.length || 24;
    const carimbados = Object.keys(this.passport.stamps || {}).length;
    const patente = this.obterPatenteAtual();
    const pct = Math.round((carimbados / Math.max(1, total)) * 100);

    const html = `
      <div id="es-passport-modal" style="position:fixed; inset:0; z-index:1000255; background:rgba(5,7,14,0.85); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; padding:16px; font-family:Inter,sans-serif;">
        <div style="background:linear-gradient(155deg,#0f172a,#1e1b4b); border:2px solid #8b5cf6; border-radius:22px; padding:20px; width:100%; max-width:560px; max-height:86dvh; display:flex; flex-direction:column; gap:12px; color:#fff; box-shadow:0 25px 70px rgba(0,0,0,0.8);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <h3 style="margin:0; font-size:18px; color:#fde047;">🛂 English City 3D Passport</h3>
              <div style="font-size:12px; color:${patente.color}; font-weight:800; margin-top:2px;">${patente.label} • ${carimbados}/${total} Selos (${pct}%)</div>
            </div>
            <button type="button" id="es-pass-close" style="background:#1e293b; color:#cbd5e1; border:none; width:34px; height:34px; border-radius:50%; font-weight:800; cursor:pointer;">✕</button>
          </div>

          <div style="height:8px; border-radius:999px; background:rgba(255,255,255,0.12); overflow:hidden;">
            <div style="height:100%; width:${pct}%; background:linear-gradient(90deg,#10b981,#38bdf8,#a855f7);"></div>
          </div>

          <div style="display:flex; gap:8px; flex-wrap:wrap; font-size:11.5px; color:#cbd5e1;">
            <span style="background:rgba(255,255,255,0.06); padding:5px 10px; border-radius:999px;">🗣️ ${this.metrics.spokenTurns} falas</span>
            <span style="background:rgba(255,255,255,0.06); padding:5px 10px; border-radius:999px;">🛵 ${this.metrics.deliveriesDone} entregas</span>
            <span style="background:rgba(255,255,255,0.06); padding:5px 10px; border-radius:999px;">🏡 ${this.metrics.houseToursDone} House Tours</span>
            <span style="background:rgba(255,255,255,0.06); padding:5px 10px; border-radius:999px;">⚡ ${this.metrics.flashEventsWon} Flash Quizzes</span>
          </div>

          <div style="font-size:11.5px; color:#94a3b8;">Converse em inglês com o personagem dentro de cada local para ganhar o selo (+${FLUENCIA_CONFIG.PREMIO_SELO_PASSAPORTE_DRX} DRX). Clique em um local para ir direto até lá:</div>

          <div style="overflow-y:auto; display:grid; grid-template-columns:repeat(auto-fill, minmax(150px, 1fr)); gap:8px; padding-right:4px;">
            ${predios.map(b => {
              const ok = Boolean(this.passport.stamps[b.id]);
              return `
                <button type="button" data-pass-go="${b.id}" style="background:${ok ? 'rgba(16,185,129,0.16)' : '#1e293b'}; border:1.5px solid ${ok ? '#10b981' : '#334155'}; border-radius:12px; padding:10px 8px; color:#f8fafc; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:3px; text-align:center;">
                  <span style="font-size:22px;">${ok ? '✅' : (b.space?.emoji || '🏪')}</span>
                  <span style="font-size:11px; font-weight:800;">${b.space?.name || b.id.toUpperCase()}</span>
                  <span style="font-size:9.5px; color:${ok ? '#6ee7b7' : '#94a3b8'}; font-weight:700;">${ok ? 'STAMPED 🛂' : 'Tap to Visit →'}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    document.getElementById('es-pass-close')?.addEventListener('click', () => document.getElementById('es-passport-modal')?.remove());
    document.getElementById('es-passport-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'es-passport-modal') e.target.remove();
    });

    document.querySelectorAll('[data-pass-go]').forEach(btn => {
      btn.addEventListener('click', () => {
        const bId = btn.dataset.passGo;
        const b = this.world?.buildingsMeta?.find(x => x.id === bId);
        document.getElementById('es-passport-modal')?.remove();
        if (b && this.world?.localPlayer) {
          this.world.sairDeQualquerAmbienteFechado?.();
          this.world.localPlayer.x = b.frontX - b.col * 2.4;
          this.world.localPlayer.z = b.centerZ;
          this.world.localPlayer.y = 0;
          this.world.localPlayer.targetX = null;
          this.world.localPlayer.targetZ = null;
          this.world.enviarMinhaPosicaoServidor?.();
          window.Workspace?.mostrarAviso?.(`🗺️ Chegou em ${b.space?.name}! Entre pela porta e fale em inglês com ${b.space?.npcName}!`, 'info', 3600);
        }
      });
    });
  }

  // ============================================================================
  // 3. 🏡 DESAFIO HOUSE TOUR (DESCREVER OS PRÓPRIOS MÓVEIS DA CASA EM INGLÊS)
  // ============================================================================
  iniciarDesafioHouseTour() {
    if (this.activeDelivery) this.cancelarMissaoEntrega();

    const builder = this.world?.gameShowBuilder;
    if (!builder) return;

    // Leva o jogador para dentro da casa se ainda não estiver na casa nem em uma torre
    let zona = builder.obterZonaDecoravelAtual?.();
    if (!zona || (zona.isHouse && !builder.jogadorEstaDentroDaCasa?.())) {
      builder.entrarNaCasaParaDecorar?.();
      zona = builder.obterZonaDecoravelAtual?.();
    }
    if (!zona) return;

    // Pega até 3 móveis reais colocados pelo aluno neste ambiente
    const colocados = (builder.placedItems || []).filter(it => it.zoneKey === zona.zoneKey);
    const usados = new Set();
    const steps = [];

    colocados.forEach(it => {
      if (steps.length >= 3 || usados.has(it.typeId)) return;
      usados.add(it.typeId);
      steps.push({
        name: it.cfg?.name || it.typeId,
        emoji: it.cfg?.emoji || '🛋️',
        furnitureUid: it.uid,
        prompt: `Describe your ${it.cfg?.name} in English! (Ex: "There is a ${it.cfg?.name.toLowerCase()} in my house, and I use it to...")`
      });
    });

    // Se tiver menos de 3 móveis colocados, completa com elementos naturais da casa
    const extras = [
      { name: 'Living Room', emoji: '🏡', furnitureUid: null, prompt: 'Describe your Living Room in English! (Ex: "My living room is cozy and bright.")' },
      { name: 'Front Window', emoji: '🪟', furnitureUid: null, prompt: 'Talk about the view from your window in English! (Ex: "From my window, I can see English City.")' },
      { name: 'Dream House', emoji: '✨', furnitureUid: null, prompt: 'Tell us what you want to add to your house next in English! (Ex: "I want to buy a big sofa and a bookshelf.")' }
    ];
    for (const ex of extras) {
      if (steps.length >= 3) break;
      steps.push(ex);
    }

    this.activeHouseTour = { steps, index: 0 };
    this.abrirModalPassoHouseTour();
  }

  encerrarHouseTour(sucesso = false) {
    if (this.activeHouseTour) {
      const atual = this.activeHouseTour.steps[this.activeHouseTour.index];
      if (atual?.furnitureUid) {
        const it = this.world?.gameShowBuilder?.placedItems?.find(x => x.uid === atual.furnitureUid);
        if (it?.mesh) this.world.gameShowBuilder.aplicarBrilhoMovel?.(it.mesh, false);
      }
    }
    this.activeHouseTour = null;
    document.getElementById('es-housetour-modal')?.remove();
    if (sucesso) {
      this.metrics.houseToursDone++;
      this.salvarPassaporteEMetricas();
    }
  }

  abrirModalPassoHouseTour() {
    document.getElementById('es-housetour-modal')?.remove();
    if (!this.activeHouseTour) return;

    const { steps, index } = this.activeHouseTour;
    const step = steps[index];
    if (!step) return;

    // Acende o móvel alvo da etapa atual para destacar na sala!
    if (step.furnitureUid) {
      const it = this.world?.gameShowBuilder?.placedItems?.find(x => x.uid === step.furnitureUid);
      if (it?.mesh) this.world.gameShowBuilder.aplicarBrilhoMovel?.(it.mesh, true, 0.78);
    }

    this.world?.falarTextoNPC?.(`House Tour step ${index + 1}. Tell me about your ${step.name}!`, 'home');

    const html = `
      <div id="es-housetour-modal" style="position:fixed; left:50%; bottom:88px; transform:translateX(-50%); z-index:1000245; width:min(440px, calc(100vw - 24px)); background:rgba(12,16,32,0.96); border:2px solid #38bdf8; border-radius:20px; padding:16px; color:#fff; box-shadow:0 18px 50px rgba(0,0,0,0.7); font-family:Inter,sans-serif; backdrop-filter:blur(16px);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:13px; font-weight:900; color:#7dd3fc;">🏡 House Tour Challenge (${index + 1}/${steps.length})</span>
          <button type="button" id="es-ht-close" style="background:#1e293b; color:#cbd5e1; border:none; width:26px; height:26px; border-radius:50%; font-weight:800; cursor:pointer;">✕</button>
        </div>
        <div style="font-size:14px; font-weight:800; color:#fde047; margin-bottom:4px;">${step.emoji} Target: ${step.name}</div>
        <div style="font-size:12px; color:#cbd5e1; margin-bottom:10px; line-height:1.4;">${step.prompt}</div>
        <input type="text" id="es-ht-input" placeholder="Speak with mic or type your sentence in English..." autocomplete="off" style="width:100%; padding:10px 12px; border-radius:10px; border:1px solid #334155; background:#1e293b; color:#fff; font-size:13px; margin-bottom:10px; box-sizing:border-box;" />
        <div style="display:flex; gap:8px;">
          <button type="button" id="es-ht-mic" style="flex:1; padding:10px; background:linear-gradient(135deg,#2563eb,#0ea5e9); color:#fff; border:none; border-radius:10px; font-weight:800; cursor:pointer;">🎤 Speak</button>
          <button type="button" id="es-ht-send" style="flex:1.2; padding:10px; background:linear-gradient(135deg,#10b981,#059669); color:#fff; border:none; border-radius:10px; font-weight:900; cursor:pointer;">Enviar ➤</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    const inp = document.getElementById('es-ht-input');
    const sendBtn = document.getElementById('es-ht-send');

    const enviarPasso = async () => {
      const frase = (inp?.value || '').trim();
      if (frase.split(/\s+/).length < 3) {
        window.Workspace?.mostrarAviso?.('Faça uma frase completa em inglês (mínimo 3 palavras)!', 'warning', 2600);
        return;
      }

      if (sendBtn) { sendBtn.disabled = true; sendBtn.textContent = '⏳...'; }
      this.metrics.spokenTurns++;
      this.world?.mostrarBalaoNoBoneco?.(this.world.localPlayer, `${step.emoji} ${frase}`, 4500);

      try {
        const res = await fetch('/api/workspace/english-spaces/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            message: frase,
            spaceName: 'My House Tour',
            npcName: 'English Coach',
            npcRole: 'Friendly Home Tour Host',
            studentRole: 'Homeowner',
            level: this.world?.parentManager?.state?.level || 'B1',
            missions: [{ id: 'ht', title: `Describe ${step.name} in English` }]
          })
        }).then(r => r.json()).catch(() => null);

        if (res?.grammarTip) this.mostrarCoachTip(res.grammarTip);
        this.enviarTelemetriaNuvem({
        spokenPhrase: frase,
        grammarTip: res?.grammarTip || null,
        spaceId: 'home',
        source: 'House Tour',
        incHouseTour: (this.activeHouseTour.index + 1 >= this.activeHouseTour.steps.length)
      });
        if (res?.reply) this.world?.falarTextoNPC?.(res.reply, 'home');
      } catch (e) {}

      // Apaga brilho do móvel atual antes de avançar
      if (step.furnitureUid) {
        const it = this.world?.gameShowBuilder?.placedItems?.find(x => x.uid === step.furnitureUid);
        if (it?.mesh) this.world.gameShowBuilder.aplicarBrilhoMovel?.(it.mesh, false);
      }

      if (this.activeHouseTour.index + 1 >= this.activeHouseTour.steps.length) {
        this.encerrarHouseTour(true);
        this.world?.interacoesPro?.dispararEmote?.('dance', false);
        await window.DOVRYX?.add(FLUENCIA_CONFIG.PREMIO_HOUSE_TOUR_DRX, 'House Tour Complete! 🏡✨');
      } else {
        this.activeHouseTour.index++;
        this.abrirModalPassoHouseTour();
      }
    };

    document.getElementById('es-ht-close')?.addEventListener('click', () => this.encerrarHouseTour(false));
    sendBtn?.addEventListener('click', enviarPasso);
    inp?.addEventListener('keypress', (e) => { if (e.key === 'Enter') enviarPasso(); });
    document.getElementById('es-ht-mic')?.addEventListener('click', () => {
      this.world?.garantirAudioAtivo?.();
      this.world?.parentManager?.ouvirMicrofone?.((falado) => {
        if (inp && falado) inp.value = falado;
      });
    });
  }

  // ============================================================================
  // 4. ⚡ EVENTOS RELÂMPAGO DE ESCUTA (FLASH LISTENING)
  // ============================================================================
  dispararEventoRelampago() {
    if (this.activeFlashEvent) return;
    if (document.getElementById('es-flash-modal') || document.getElementById('es-delivery-speak-modal') || document.getElementById('es-housetour-modal')) return;

    const ev = FLASH_LISTENING_EVENTS[Math.floor(Math.random() * FLASH_LISTENING_EVENTS.length)];
    this.activeFlashEvent = {
      ev,
      remaining: FLUENCIA_CONFIG.TEMPO_EVENTO_SEG
    };

    this.world?.falarTextoNPC?.(ev.audio, ev.spaceId);

    const html = `
      <div id="es-flash-modal" style="position:fixed; inset:0; z-index:1000260; background:rgba(5,7,14,0.82); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; padding:16px; font-family:Inter,sans-serif;">
        <div style="background:linear-gradient(155deg,#0f172a,#1e1b4b); border:2px solid #f59e0b; border-radius:22px; padding:22px; width:100%; max-width:440px; color:#fff; box-shadow:0 25px 70px rgba(0,0,0,0.8);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="font-size:13px; font-weight:900; color:#fde047;">⚡ FLASH LISTENING EVENT</span>
            <span id="es-flash-timer" style="font-size:12.5px; font-weight:900; color:#38bdf8;">⏱️ ${FLUENCIA_CONFIG.TEMPO_EVENTO_SEG}s</span>
          </div>
          <div style="font-size:12px; color:#94a3b8; font-weight:700; margin-bottom:10px;">${ev.category}</div>

          <div style="background:rgba(245,158,11,0.14); border:1px solid rgba(251,191,36,0.45); border-radius:14px; padding:12px; text-align:center; margin-bottom:12px;">
            <div style="font-size:12.5px; color:#fef08a; font-weight:700; margin-bottom:8px;">🎧 Ouça com atenção o aviso em inglês!</div>
            <button type="button" id="es-flash-replay" style="background:#2563eb; color:#fff; border:none; border-radius:999px; padding:7px 16px; font-size:12px; font-weight:800; cursor:pointer;">🔊 Ouvir Novamente</button>
          </div>

          <div style="font-size:14px; font-weight:800; margin-bottom:10px;">${ev.question}</div>
          <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
            ${ev.options.map((opt, idx) => `
              <button type="button" data-flash-opt="${idx}" style="background:#1e293b; border:1px solid #334155; color:#f8fafc; border-radius:12px; padding:11px 12px; font-size:13px; font-weight:700; cursor:pointer; text-align:left; transition:0.15s;">
                ${String.fromCharCode(65 + idx)}) ${opt}
              </button>
            `).join('')}
          </div>
          <button type="button" id="es-flash-skip" style="width:100%; background:transparent; border:none; color:#94a3b8; font-size:12px; font-weight:700; cursor:pointer;">Ignorar evento</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    document.getElementById('es-flash-replay')?.addEventListener('click', () => {
      this.world?.falarTextoNPC?.(ev.audio, ev.spaceId);
    });
    document.getElementById('es-flash-skip')?.addEventListener('click', () => this.fecharEventoRelampago());

    document.querySelectorAll('[data-flash-opt]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const idx = parseInt(btn.dataset.flashOpt, 10);
        this.fecharEventoRelampago();
        if (idx === ev.correct) {
          this.metrics.flashEventsWon++;
          this.enviarTelemetriaNuvem({ spaceId: ev.spaceId, source: 'Flash Event', incFlashWin: true });
          this.salvarPassaporteEMetricas();
          this.world?.interacoesPro?.dispararEmote?.('jump', false);
          this.world?.falarTextoNPC?.('Spot on! Amazing listening skills!', 'street');
          await window.DOVRYX?.add(FLUENCIA_CONFIG.PREMIO_EVENTO_RELAMPAGO_DRX, 'Flash Listening Event ⚡');
        } else {
          window.Workspace?.mostrarAviso?.(`❌ Quase! A resposta certa era: "${ev.options[ev.correct]}"`, 'warning', 4500);
          this.world?.falarTextoNPC?.('Good try! Listen closely next time.', 'street');
        }
      });
    });
  }

  fecharEventoRelampago() {
    this.activeFlashEvent = null;
    this.flashTimer = FLUENCIA_CONFIG.INTERVALO_EVENTO_SEG;
    document.getElementById('es-flash-modal')?.remove();
  }

  // ============================================================================
  // 🔄 LOOP DE ATUALIZAÇÃO & LIMPEZA DE MEMÓRIA
  // ============================================================================
  update(delta) {
    // 1. Anima beacon dourado da entrega + checa chegada
    if (this.activeDelivery) {
      this.atualizarProgressoEntrega();
      if (this.deliveryBeacon?.ring) {
        const s = 1 + Math.sin(performance.now() * 0.005) * 0.14;
        this.deliveryBeacon.ring.scale.set(s, s, 1);
      }
    }

    // 2. Cronômetro do Evento Relâmpago (ativo ou contagem regressiva para o próximo)
    if (this.activeFlashEvent) {
      this.activeFlashEvent.remaining -= delta;
      const timerEl = document.getElementById('es-flash-timer');
      if (timerEl) {
        const seg = Math.max(0, Math.ceil(this.activeFlashEvent.remaining));
        timerEl.textContent = `⏱️ ${seg}s`;
        timerEl.style.color = seg <= 8 ? '#f87171' : '#38bdf8';
      }
      if (this.activeFlashEvent.remaining <= 0) {
        this.fecharEventoRelampago();
        window.Workspace?.mostrarAviso?.('⏱️ Tempo esgotado no Evento Relâmpago de Escuta!', 'info', 2800);
      }
    } else if (!this.activeDelivery && !this.activeHouseTour && !this.world?.gameShowBuilder?.gsRunning) {
      this.flashTimer -= delta;
      if (this.flashTimer <= 0) {
        this.flashTimer = FLUENCIA_CONFIG.INTERVALO_EVENTO_SEG;
        this.dispararEventoRelampago();
      }
    }
  }

  dispose() {
    this.cancelarMissaoEntrega();
    this.encerrarHouseTour(false);
    this.fecharEventoRelampago();
    clearTimeout(this._coachTimer);
    this.hudEl?.remove();
    this.coachBannerEl?.remove();
    this.hudEl = null;
    this.coachBannerEl = null;
    this.world = null;
  }
}