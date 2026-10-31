// js/modulos/workspace/english-spaces.js
// Módulo Integrado: 🌎 ENGLISH SPACES (12 Cenários Reais + Rotas Nativas sem Erro 404)

window.Workspace = window.Workspace || {};

export const SPACES_REGISTRY = {
  coffee: {
    id: 'coffee',
    name: 'COFFEE SHOP',
    emoji: '☕',
    description: 'Order drinks, customize your coffee, ask for the Wi-Fi password and pay.',
    type: 'Daily Life',
    gradient: 'es-gradient-coffee',
    roles: ['CUSTOMER', 'BARISTA', 'MANAGER'],
    npcName: 'Maya (Barista)',
    liveCount: 6,
    unlockedDefault: true,
    missions: [
      { id: 'm1', title: 'Order a drink & size', xp: 60 },
      { id: 'm2', title: 'Ask for milk option or Wi-Fi', xp: 70 },
      { id: 'm3', title: 'Pay for your order', xp: 80 }
    ],
    vocab: [
      { id: 'v1', word: 'ICED LATTE', emoji: '🧋', pron: '/aɪst ˈlɑːteɪ/', meaning: 'Café com leite gelado', example: 'Can I get a medium iced latte with oat milk?' },
      { id: 'v2', word: 'MUFFIN', emoji: '🧁', pron: '/ˈmʌfɪn/', meaning: 'Bolinho / Muffin', example: 'I would like a blueberry muffin, please.' },
      { id: 'v3', word: 'RECEIPT', emoji: '🧾', pron: '/rɪˈsiːt/', meaning: 'Recibo / Nota fiscal', example: 'Would you like your receipt?' },
      { id: 'v4', word: 'TO GO', emoji: '🥡', pron: '/tə ɡoʊ/', meaning: 'Para viagem', example: 'Is that for here or to go?' }
    ],
    expressions: ["Can I get a medium latte, please?", "Do you have oat milk?", "What's the Wi-Fi password?", "I'll pay by card."],
    dialogues: {
      start: {
        name: 'Maya (Barista)',
        text: 'Good morning! Welcome to Sunrise Café. What can I get started for you today?',
        translation: 'Bom dia! Bem-vindo ao Sunrise Café. O que posso preparar para você hoje?',
        options: [
          { label: 'A', text: "Hi! Can I get a medium cappuccino, please?", next: 'customize', missionId: 'm1', keywords: ['cappuccino', 'coffee', 'latte', 'tea', 'order', 'like'] },
          { label: 'B', text: 'Hello! What pastries do you have today?', next: 'pastries', keywords: ['pastry', 'pastries', 'food', 'eat', 'menu', 'muffin'] }
        ],
        fallback: "Sorry, it's a bit noisy here! Would you like to order a coffee or see our pastries?"
      },
      pastries: {
        name: 'Maya (Barista)',
        text: 'We have fresh blueberry muffins and chocolate croissants! Which one would you like with your drink?',
        translation: 'Temos muffins de mirtilo fresquinhos e croissants de chocolate! Qual você gostaria com a sua bebida?',
        options: [
          { label: 'A', text: "I'll take a chocolate croissant and a hot latte, please.", next: 'customize', missionId: 'm1', keywords: ['croissant', 'muffin', 'latte'] }
        ]
      },
      customize: {
        name: 'Maya (Barista)',
        text: 'Great choice! Would you like regular milk or oat milk? And is that for here or to go?',
        translation: 'Ótima escolha! Gostaria de leite normal ou leite de aveia? E é para tomar aqui ou para viagem?',
        options: [
          { label: 'A', text: 'With oat milk, for here please. Also, what is the Wi-Fi password?', next: 'pay', missionId: 'm2', keywords: ['oat', 'milk', 'wifi', 'wi-fi', 'here'] },
          { label: 'B', text: 'Regular milk, to go please! How much is it?', next: 'pay', missionId: 'm2', keywords: ['regular', 'go', 'how much', 'price'] }
        ]
      },
      pay: {
        name: 'Maya (Barista)',
        text: "The Wi-Fi is 'CoffeeLover2026' and your total is $6.50. How would you like to pay?",
        translation: "O Wi-Fi é 'CoffeeLover2026' e o total fica $6.50. Como gostaria de pagar?",
        options: [
          { label: 'A', text: "I'll pay by credit card. Here you go!", next: 'end', missionId: 'm3', keywords: ['card', 'credit', 'cash', 'pay', 'here', 'apple'] }
        ]
      },
      end: {
        name: 'Maya (Barista)',
        text: 'Payment approved! Your order will be ready at the counter in two minutes. Enjoy your day! 🎉',
        translation: 'Pagamento aprovado! O seu pedido estará pronto no balcão em dois minutos. Aproveite o seu dia! 🎉',
        options: []
      }
    }
  },

  airport: {
    id: 'airport',
    name: 'AIRPORT',
    emoji: '✈️',
    description: 'Check-in desk, luggage drop, boarding pass, security and gate changes.',
    type: 'Travel',
    gradient: 'es-gradient-airport',
    roles: ['TRAVELER', 'CHECK-IN AGENT', 'SECURITY OFFICER'],
    npcName: 'David (Check-in Agent)',
    liveCount: 8,
    unlockedDefault: false,
    unlockXP: 500,
    missions: [
      { id: 'm1', title: 'Present passport & destination', xp: 75 },
      { id: 'm2', title: 'Request window/aisle seat & check luggage', xp: 85 },
      { id: 'm3', title: 'Confirm boarding gate & time', xp: 90 }
    ],
    vocab: [
      { id: 'v1', word: 'BOARDING PASS', emoji: '🎫', pron: '/ˈbɔːrdɪŋ pæs/', meaning: 'Cartão de embarque', example: 'Here is your boarding pass for Gate B12.' },
      { id: 'v2', word: 'CARRY-ON', emoji: '🧳', pron: '/ˈkæri ɑːn/', meaning: 'Bagagem de mão', example: 'I only have one carry-on bag.' },
      { id: 'v3', word: 'AISLE SEAT', emoji: '💺', pron: '/aɪl siːt/', meaning: 'Assento no corredor', example: 'Could I have an aisle seat, please?' },
      { id: 'v4', word: 'PASSPORT', emoji: '🛂', pron: '/ˈpæspɔːrt/', meaning: 'Passaporte', example: 'May I see your passport, please?' }
    ],
    expressions: ["I'm flying to New York.", "Could I get a window seat?", "I have one suitcase to check.", "Which gate is my flight?"],
    dialogues: {
      start: {
        name: 'David (Check-in Agent)',
        text: 'Hello! Welcome to Global Airlines. May I see your passport and where are you flying today?',
        translation: 'Olá! Bem-vindo à Global Airlines. Posso ver o seu passaporte e para onde voa hoje?',
        options: [
          { label: 'A', text: 'Here is my passport. I am flying to London today.', next: 'seat', missionId: 'm1', keywords: ['passport', 'flying', 'london', 'new york'] },
          { label: 'B', text: 'Good morning! Here is my passport and booking confirmation.', next: 'seat', missionId: 'm1', keywords: ['booking', 'confirmation', 'morning'] }
        ],
        fallback: 'May I see your passport and know your final destination, please?'
      },
      seat: {
        name: 'David (Check-in Agent)',
        text: 'Thank you! Do you prefer a window seat or an aisle seat? And are you checking any bags?',
        translation: 'Obrigado! Prefere assento na janela ou no corredor? E vai despachar alguma mala?',
        options: [
          { label: 'A', text: 'A window seat, please. I have one suitcase to check and a carry-on.', next: 'gate', missionId: 'm2', keywords: ['window', 'suitcase', 'check', 'bag'] },
          { label: 'B', text: 'An aisle seat, please. I only have this carry-on bag.', next: 'gate', missionId: 'm2', keywords: ['aisle', 'carry-on', 'only'] }
        ]
      },
      gate: {
        name: 'David (Check-in Agent)',
        text: 'All set! Here is your boarding pass. Your flight boards at 3:30 PM from Gate B14.',
        translation: 'Tudo pronto! Aqui está o seu cartão de embarque. O seu voo embarca às 15h30 no Portão B14.',
        options: [
          { label: 'A', text: 'Thank you! Where is security and Gate B14 from here?', next: 'end', missionId: 'm3', keywords: ['gate', 'security', 'where', 'thank'] }
        ]
      },
      end: {
        name: 'David (Check-in Agent)',
        text: 'Go straight ahead and turn left after security. Have a safe flight! ✈️🎉',
        translation: 'Siga em frente e vire à esquerda após a segurança. Tenha um ótimo voo! ✈️🎉',
        options: []
      }
    }
  },

  hotel: {
    id: 'hotel',
    name: 'HOTEL',
    emoji: '🏨',
    description: 'Check-in at reception, breakfast hours, room service and late check-out.',
    type: 'Travel',
    gradient: 'es-gradient-hotel',
    roles: ['GUEST', 'RECEPTIONIST', 'CONCIERGE'],
    npcName: 'Sophia (Receptionist)',
    liveCount: 4,
    unlockedDefault: false,
    unlockXP: 500,
    missions: [
      { id: 'm1', title: 'Check in with your reservation name', xp: 70 },
      { id: 'm2', title: 'Ask about breakfast time & amenities', xp: 80 },
      { id: 'm3', title: 'Get your key card & room number', xp: 85 }
    ],
    vocab: [
      { id: 'v1', word: 'RESERVATION', emoji: '📅', pron: '/ˌrezərˈveɪʃn/', meaning: 'Reserva', example: 'I have a reservation under Santana.' },
      { id: 'v2', word: 'KEY CARD', emoji: '💳', pron: '/ˈkiː kɑːrd/', meaning: 'Cartão-chave do quarto', example: 'Here is your key card for room 405.' },
      { id: 'v3', word: 'CHECK-OUT', emoji: '🕚', pron: '/ˈtʃek aʊt/', meaning: 'Saída / Fecho da estadia', example: 'What time is check-out tomorrow?' }
    ],
    expressions: ["I have a reservation under...", "What time is breakfast served?", "Is breakfast included?", "Could we have a room with a view?"],
    dialogues: {
      start: {
        name: 'Sophia (Receptionist)',
        text: 'Welcome to The Grand Hotel! How may I assist you today?',
        translation: 'Bem-vindo ao Grand Hotel! Como posso ajudá-lo hoje?',
        options: [
          { label: 'A', text: 'Hi! I would like to check in. I have a reservation for two nights.', next: 'breakfast', missionId: 'm1', keywords: ['check in', 'reservation', 'room', 'booked'] }
        ],
        fallback: 'Do you have a reservation with us today?'
      },
      breakfast: {
        name: 'Sophia (Receptionist)',
        text: 'I found your reservation! A deluxe room on the 5th floor. Do you have any questions about our hotel services?',
        translation: 'Encontrei a sua reserva! Um quarto deluxe no 5.º andar. Tem alguma dúvida sobre os serviços do hotel?',
        options: [
          { label: 'A', text: 'Yes, is breakfast included and what time is it served?', next: 'key', missionId: 'm2', keywords: ['breakfast', 'time', 'included', 'pool'] }
        ]
      },
      key: {
        name: 'Sophia (Receptionist)',
        text: 'Yes, breakfast is included and served from 7 AM to 10 AM on the ground floor. Here are your key cards for Room 508!',
        translation: 'Sim, o pequeno-almoço está incluído das 7h às 10h no rés-do-chão. Aqui estão os cartões do Quarto 508!',
        options: [
          { label: 'A', text: 'Wonderful! Which way are the elevators? Thank you!', next: 'end', missionId: 'm3', keywords: ['elevator', 'lift', 'thank', 'room'] }
        ]
      },
      end: {
        name: 'Sophia (Receptionist)',
        text: 'The elevators are just around the corner to your right. Enjoy your stay with us! 🏨🎉',
        translation: 'Os elevadores ficam logo ao virar à direita. Aproveite a sua estadia! 🏨🎉',
        options: []
      }
    }
  },

  restaurant: {
    id: 'restaurant',
    name: 'RESTAURANT',
    emoji: '🍔',
    description: 'Table for two, main course recommendations, dietary needs and asking for the bill.',
    type: 'Daily Life',
    gradient: 'es-gradient-restaurant',
    roles: ['CUSTOMER', 'WAITER', 'CHEF'],
    npcName: 'Lucas (Waiter)',
    liveCount: 5,
    unlockedDefault: true,
    missions: [
      { id: 'm1', title: 'Ask for a table & see the menu', xp: 65 },
      { id: 'm2', title: 'Order your main course & drink', xp: 75 },
      { id: 'm3', title: 'Ask for the bill / check', xp: 80 }
    ],
    vocab: [
      { id: 'v1', word: 'APPETIZER', emoji: '🥗', pron: '/ˈæpɪtaɪzər/', meaning: 'Entrada / Petisco', example: 'Would you like an appetizer to start?' },
      { id: 'v2', word: 'MAIN COURSE', emoji: '🍽️', pron: '/ˈmeɪn kɔːrs/', meaning: 'Prato principal', example: 'For the main course, I will have the grilled salmon.' },
      { id: 'v3', word: 'THE BILL / CHECK', emoji: '🧾', pron: '/ðə bɪl/', meaning: 'A conta', example: 'Could we have the check, please?' }
    ],
    expressions: ["A table for two, please.", "What do you recommend?", "I'll have the grilled salmon.", "Could we have the bill, please?"],
    dialogues: {
      start: {
        name: 'Lucas (Waiter)',
        text: 'Good evening! Welcome to Bistro 360. How many people are in your party tonight?',
        translation: 'Boa noite! Bem-vindo ao Bistro 360. Mesa para quantas pessoas esta noite?',
        options: [
          { label: 'A', text: 'Good evening! A table for two, please. Could we see the menu?', next: 'order', missionId: 'm1', keywords: ['table', 'two', 'menu', 'one'] }
        ],
        fallback: 'How many people are dining with you tonight?'
      },
      order: {
        name: 'Lucas (Waiter)',
        text: 'Right this way! Here are your menus. Our special tonight is grilled salmon with roasted vegetables. Are you ready to order?',
        translation: 'Por aqui! Aqui estão os menus. O especial de hoje é salmão grelhado com legumes. Prontos para pedir?',
        options: [
          { label: 'A', text: "Yes! I'll have the grilled salmon and a sparkling water, please.", next: 'bill', missionId: 'm2', keywords: ['salmon', 'steak', 'pasta', 'water', 'have'] }
        ]
      },
      bill: {
        name: 'Lucas (Waiter)',
        text: 'How was your meal? Would you like to see the dessert menu or anything else?',
        translation: 'Como estava a refeição? Gostaria de ver o menu de sobremesas ou mais alguma coisa?',
        options: [
          { label: 'A', text: 'Everything was delicious! No dessert, just the bill please.', next: 'end', missionId: 'm3', keywords: ['bill', 'check', 'delicious', 'pay'] }
        ]
      },
      end: {
        name: 'Lucas (Waiter)',
        text: 'I will bring your check right away. Thank you for dining with us tonight! 🍽️🎉',
        translation: 'Trarei a sua conta imediatamente. Obrigado por jantar connosco esta noite! 🍽️🎉',
        options: []
      }
    }
  },

  school: {
    id: 'school',
    name: 'SCHOOL',
    emoji: '🏫',
    description: 'Classroom questions, group project discussion, library and homework deadlines.',
    type: 'Academic',
    gradient: 'es-gradient-school',
    roles: ['STUDENT', 'TEACHER', 'CLASSMATE'],
    npcName: 'Prof. Carter',
    liveCount: 7,
    unlockedDefault: true,
    missions: [
      { id: 'm1', title: 'Ask a question about the lesson', xp: 60 },
      { id: 'm2', title: 'Choose your presentation topic', xp: 70 },
      { id: 'm3', title: 'Confirm the homework deadline', xp: 80 }
    ],
    vocab: [
      { id: 'v1', word: 'ASSIGNMENT', emoji: '📝', pron: '/əˈsaɪnmənt/', meaning: 'Trabalho / Tarefa escolar', example: 'When is the assignment due?' },
      { id: 'v2', word: 'DEADLINE', emoji: '⏰', pron: '/ˈdedlaɪn/', meaning: 'Prazo final de entrega', example: 'The deadline is next Friday.' },
      { id: 'v3', word: 'PRESENTATION', emoji: '📊', pron: '/ˌpreznˈteɪʃn/', meaning: 'Apresentação oral', example: 'We are preparing our presentation.' }
    ],
    expressions: ["Could you explain that again?", "When is the assignment due?", "Can we work in pairs?", "I chose technology as my topic."],
    dialogues: {
      start: {
        name: 'Prof. Carter',
        text: 'Good morning, class! Today we are organizing our English presentations. Do you have any questions before we start?',
        translation: 'Bom dia, turma! Hoje vamos organizar as nossas apresentações em inglês. Têm alguma dúvida antes de começarmos?',
        options: [
          { label: 'A', text: 'Excuse me Professor, can we work in pairs for this presentation?', next: 'topic', missionId: 'm1', keywords: ['pairs', 'question', 'how', 'explain'] }
        ],
        fallback: 'Feel free to ask any question about our class project!'
      },
      topic: {
        name: 'Prof. Carter',
        text: 'Yes, working in pairs is a great idea! Which topic would you like to present: Technology, Travel, or Environment?',
        translation: 'Sim, trabalhar em dupla é uma ótima ideia! Qual tema gostaria de apresentar: Tecnologia, Viagens ou Meio Ambiente?',
        options: [
          { label: 'A', text: 'We would like to present about Technology and AI!', next: 'deadline', missionId: 'm2', keywords: ['technology', 'travel', 'environment', 'topic'] }
        ]
      },
      deadline: {
        name: 'Prof. Carter',
        text: 'Excellent topic! I have registered your group. Is there anything else you need to know?',
        translation: 'Excelente tema! Já registei o vosso grupo. Há mais alguma coisa que precisem de saber?',
        options: [
          { label: 'A', text: 'Yes, when is the final deadline to submit our slides?', next: 'end', missionId: 'm3', keywords: ['deadline', 'when', 'due', 'submit'] }
        ]
      },
      end: {
        name: 'Prof. Carter',
        text: 'The deadline is next Monday at 9 AM. Good luck with your research! 🏫🎉',
        translation: 'O prazo é na próxima segunda-feira às 9h. Boa sorte com a pesquisa! 🏫🎉',
        options: []
      }
    }
  },

  shopping: {
    id: 'shopping',
    name: 'SHOPPING',
    emoji: '🛍️',
    description: 'Looking for clothes, asking for sizes, trying items on in the fitting room and discounts.',
    type: 'Daily Life',
    gradient: 'es-gradient-shopping',
    roles: ['CUSTOMER', 'SALES ASSISTANT', 'CASHIER'],
    npcName: 'Emma (Sales Assistant)',
    liveCount: 3,
    unlockedDefault: true,
    missions: [
      { id: 'm1', title: 'Ask for a specific clothing item & size', xp: 60 },
      { id: 'm2', title: 'Ask where the fitting rooms are', xp: 70 },
      { id: 'm3', title: 'Ask about discounts & pay', xp: 80 }
    ],
    vocab: [
      { id: 'v1', word: 'FITTING ROOM', emoji: '🪞', pron: '/ˈfɪtɪŋ ruːm/', meaning: 'Provador de roupas', example: 'Where are the fitting rooms?' },
      { id: 'v2', word: 'MEDIUM SIZE', emoji: '👕', pron: '/ˈmiːdiəm saɪz/', meaning: 'Tamanho médio (M)', example: 'Do you have this jacket in medium?' },
      { id: 'v3', word: 'ON SALE', emoji: '🏷️', pron: '/ɑːn seɪl/', meaning: 'Em promoção / Com desconto', example: 'This item is 20% off on sale.' }
    ],
    expressions: ["Do you have this in size medium?", "Can I try this on?", "Where are the fitting rooms?", "Is this on sale?"],
    dialogues: {
      start: {
        name: 'Emma (Sales Assistant)',
        text: 'Hi there! Welcome to Urban Style. Are you looking for anything in particular today?',
        translation: 'Olá! Bem-vindo à Urban Style. Está à procura de algo em especial hoje?',
        options: [
          { label: 'A', text: "Hi! Yes, I'm looking for a denim jacket in size medium.", next: 'fitting', missionId: 'm1', keywords: ['jacket', 'shirt', 'size', 'medium', 'large'] }
        ],
        fallback: 'Let me know what clothing item and size you are looking for!'
      },
      fitting: {
        name: 'Emma (Sales Assistant)',
        text: 'Here is a medium denim jacket in blue! Would you like to try it on?',
        translation: 'Aqui está um casaco de ganga tamanho médio em azul! Gostaria de experimentá-lo?',
        options: [
          { label: 'A', text: 'Yes, please! Where are the fitting rooms?', next: 'checkout', missionId: 'm2', keywords: ['fitting', 'try', 'where', 'room'] }
        ]
      },
      checkout: {
        name: 'Emma (Sales Assistant)',
        text: 'The fitting rooms are right over there. How did it fit?',
        translation: 'Os provadores ficam logo ali. Como ficou?',
        options: [
          { label: 'A', text: "It fits perfectly! Is it on sale? I'll take it.", next: 'end', missionId: 'm3', keywords: ['fits', 'sale', 'take', 'buy', 'discount'] }
        ]
      },
      end: {
        name: 'Emma (Sales Assistant)',
        text: 'Yes, it has a 15% discount today! Let me wrap it up for you at the register. 🛍️🎉',
        translation: 'Sim, tem 15% de desconto hoje! Vou embrulhá-lo para si na caixa. 🛍️🎉',
        options: []
      }
    }
  },

  beach: {
    id: 'beach',
    name: 'BEACH',
    emoji: '🏖️',
    description: 'Renting beach chairs, ocean safety conditions, ordering cold drinks and sunset tips.',
    type: 'Leisure',
    gradient: 'es-gradient-beach',
    roles: ['TOURIST', 'LIFEGUARD', 'BEACH VENDOR'],
    npcName: 'Kai (Beach Host)',
    liveCount: 4,
    unlockedDefault: true,
    missions: [
      { id: 'm1', title: 'Rent two chairs and an umbrella', xp: 60 },
      { id: 'm2', title: 'Ask if the ocean is safe for swimming', xp: 70 },
      { id: 'm3', title: 'Order fresh coconut water', xp: 75 }
    ],
    vocab: [
      { id: 'v1', word: 'SUNSCREEN', emoji: '🧴', pron: '/ˈsʌnskriːn/', meaning: 'Protetor solar', example: "Don't forget to put on sunscreen!" },
      { id: 'v2', word: 'UMBRELLA', emoji: '⛱️', pron: '/ʌmˈbrelə/', meaning: 'Guarda-sol', example: 'We rented two chairs and an umbrella.' },
      { id: 'v3', word: 'TIDE', emoji: '🌊', pron: '/taɪd/', meaning: 'Maré', example: 'The tide is calm this morning.' }
    ],
    expressions: ["How much to rent two chairs?", "Is the water safe for swimming?", "Can we get two coconut waters?", "Where can we watch the sunset?"],
    dialogues: {
      start: {
        name: 'Kai (Beach Host)',
        text: 'Aloha! Beautiful sunny day at the beach! Would you like to set up some chairs by the water?',
        translation: 'Aloha! Lindo dia de sol na praia! Gostaria de alugar cadeiras perto da água?',
        options: [
          { label: 'A', text: 'Yes! How much is it to rent two beach chairs and an umbrella?', next: 'safety', missionId: 'm1', keywords: ['chairs', 'umbrella', 'rent', 'how much'] }
        ],
        fallback: 'Would you like to rent beach chairs and an umbrella today?'
      },
      safety: {
        name: 'Kai (Beach Host)',
        text: "It's $15 for the whole day. I've set them up for you right here!",
        translation: 'São $15 pelo dia inteiro. Já as preparei aqui para você!',
        options: [
          { label: 'A', text: 'Thanks! Is the ocean safe for swimming right now?', next: 'drink', missionId: 'm2', keywords: ['safe', 'swim', 'ocean', 'water', 'waves'] }
        ]
      },
      drink: {
        name: 'Kai (Beach Host)',
        text: 'Yes, the green flag is up and the water is super calm and warm! Can I bring you something cold to drink?',
        translation: 'Sim, a bandeira verde está hasteada e a água está super calma e morna! Posso trazer algo gelado para beber?',
        options: [
          { label: 'A', text: 'That sounds great! Could we get two cold coconut waters, please?', next: 'end', missionId: 'm3', keywords: ['coconut', 'water', 'drink', 'juice'] }
        ]
      },
      end: {
        name: 'Kai (Beach Host)',
        text: 'Two fresh coconut waters coming right up! Enjoy the sun and the ocean! 🏖️🎉',
        translation: 'Duas águas de coco fresquinhas a caminho! Aproveite o sol e o mar! 🏖️🎉',
        options: []
      }
    }
  },

  job: {
    id: 'job',
    name: 'JOB INTERVIEW',
    emoji: '💼',
    description: 'Introduce your background, highlight your strengths, and ask smart career questions.',
    type: 'Career & Business',
    gradient: 'es-gradient-job',
    roles: ['CANDIDATE', 'INTERVIEWER', 'HR MANAGER'],
    npcName: 'Rachel (HR Director)',
    liveCount: 5,
    unlockedDefault: false,
    unlockXP: 1500,
    missions: [
      { id: 'm1', title: 'Introduce yourself & your experience', xp: 100 },
      { id: 'm2', title: 'Explain your biggest professional strength', xp: 110 },
      { id: 'm3', title: 'Ask a question about the team/company', xp: 120 }
    ],
    vocab: [
      { id: 'v1', word: 'STRENGTHS', emoji: '💪', pron: '/streŋkθs/', meaning: 'Pontos fortes', example: 'One of my main strengths is problem-solving.' },
      { id: 'v2', word: 'BACKGROUND', emoji: '🎓', pron: '/ˈbækɡraʊnd/', meaning: 'Histórico / Experiência', example: 'I have a strong background in customer service.' },
      { id: 'v3', word: 'DEADLINE', emoji: '📈', pron: '/ˈdedlaɪn/', meaning: 'Prazo / Meta', example: 'I work very well under tight deadlines.' }
    ],
    expressions: ["I have experience in...", "My greatest strength is...", "I enjoy working in a team.", "What are the next steps in the hiring process?"],
    dialogues: {
      start: {
        name: 'Rachel (HR Director)',
        text: 'Welcome! Thank you for joining our interview today. To start, could you tell me a little bit about yourself and your background?',
        translation: 'Bem-vindo(a)! Obrigado por participar na entrevista hoje. Para começar, pode falar-me um pouco sobre si e a sua experiência?',
        options: [
          { label: 'A', text: 'Thank you for having me! I have experience in communication and I love solving problems.', next: 'strengths', missionId: 'm1', keywords: ['experience', 'background', 'work', 'study'] }
        ],
        fallback: 'Could you share a brief summary of your professional or academic background?'
      },
      strengths: {
        name: 'Rachel (HR Director)',
        text: 'Impressive! And what would you say is your greatest professional strength when working with a team?',
        translation: 'Impressionante! E qual diria que é o seu maior ponto forte profissional ao trabalhar em equipa?',
        options: [
          { label: 'A', text: 'My greatest strength is adaptability and clear communication under pressure.', next: 'closing', missionId: 'm2', keywords: ['strength', 'communication', 'team', 'adaptability'] }
        ]
      },
      closing: {
        name: 'Rachel (HR Director)',
        text: 'That is exactly what we value in our company. Do you have any questions for me about the role or our team?',
        translation: 'Isso é exatamente o que valorizamos na nossa empresa. Tem alguma pergunta sobre a vaga ou a nossa equipa?',
        options: [
          { label: 'A', text: 'Yes! What does a typical day look like in this role, and what are the next steps?', next: 'end', missionId: 'm3', keywords: ['typical', 'next', 'steps', 'team', 'culture'] }
        ]
      },
      end: {
        name: 'Rachel (HR Director)',
        text: 'Great question! You did a fantastic job in this interview. We will contact you by Friday! 💼🎉',
        translation: 'Ótima pergunta! Fez um trabalho fantástico nesta entrevista. Entraremos em contacto até sexta-feira! 💼🎉',
        options: []
      }
    }
  },

  taxi: {
    id: 'taxi',
    name: 'TAXI / RIDE',
    emoji: '🚕',
    description: 'Confirm your destination, suggest the fastest route, traffic talk and payment.',
    type: 'Travel',
    gradient: 'es-gradient-taxi',
    roles: ['PASSENGER', 'DRIVER'],
    npcName: 'Marco (Driver)',
    liveCount: 3,
    unlockedDefault: true,
    missions: [
      { id: 'm1', title: 'Give the destination address', xp: 60 },
      { id: 'm2', title: 'Ask how long the ride will take', xp: 70 },
      { id: 'm3', title: 'Pay the fare and thank the driver', xp: 75 }
    ],
    vocab: [
      { id: 'v1', word: 'TRAFFIC JAM', emoji: '🚦', pron: '/ˈtræfɪk dʒæm/', meaning: 'Engarrafamento / Trânsito', example: 'Is there a lot of traffic on the highway?' },
      { id: 'v2', word: 'FARE', emoji: '💵', pron: '/fer/', meaning: 'Tarifa / Valor da corrida', example: 'The total fare is $18.' },
      { id: 'v3', word: 'DROP OFF', emoji: '📍', pron: '/drɑːp ɔːf/', meaning: 'Deixar (no destino)', example: 'You can drop me off right at the corner.' }
    ],
    expressions: ["Could you take me to Central Station?", "How long will it take?", "You can drop me off here.", "Keep the change!"],
    dialogues: {
      start: {
        name: 'Marco (Driver)',
        text: 'Hello! Hop in! Where are we heading today?',
        translation: 'Olá! Pode entrar! Para onde vamos hoje?',
        options: [
          { label: 'A', text: 'Hi! Could you take me to Downtown Central Station, please?', next: 'traffic', missionId: 'm1', keywords: ['take', 'station', 'hotel', 'airport', 'downtown'] }
        ],
        fallback: 'Where would you like me to take you today?'
      },
      traffic: {
        name: 'Marco (Driver)',
        text: 'Sure thing! Fasten your seatbelt. We are on our way.',
        translation: 'Com certeza! Coloque o cinto de segurança. Estamos a caminho.',
        options: [
          { label: 'A', text: 'How is the traffic today? How long will it take to get there?', next: 'arrive', missionId: 'm2', keywords: ['how long', 'traffic', 'time', 'minutes'] }
        ]
      },
      arrive: {
        name: 'Marco (Driver)',
        text: 'Traffic is light! It will take about 12 minutes. Here we are right in front of the main entrance! The fare is $14.',
        translation: 'O trânsito está tranquilo! Levará cerca de 12 minutos. Aqui estamos em frente à entrada principal! A corrida deu $14.',
        options: [
          { label: 'A', text: 'Here is $16, please keep the change! Thanks for the ride!', next: 'end', missionId: 'm3', keywords: ['here', 'change', 'card', 'thanks', 'pay'] }
        ]
      },
      end: {
        name: 'Marco (Driver)',
        text: 'Thank you so much! Have a wonderful trip! 🚕🎉',
        translation: 'Muito obrigado! Tenha uma excelente viagem! 🚕🎉',
        options: []
      }
    }
  },

  cinema: {
    id: 'cinema',
    name: 'CINEMA',
    emoji: '🎬',
    description: 'Buy movie tickets, choose seats in the theater and order popcorn & soda.',
    type: 'Leisure',
    gradient: 'es-gradient-cinema',
    roles: ['CUSTOMER', 'TICKET ATTENDANT', 'FRIEND'],
    npcName: 'Chloe (Box Office)',
    liveCount: 4,
    unlockedDefault: true,
    missions: [
      { id: 'm1', title: 'Buy tickets for a movie & session time', xp: 60 },
      { id: 'm2', title: 'Pick your seats in the middle row', xp: 70 },
      { id: 'm3', title: 'Order popcorn and a drink', xp: 75 }
    ],
    vocab: [
      { id: 'v1', word: 'SHOWTIME', emoji: '🎟️', pron: '/ˈʃoʊtaɪm/', meaning: 'Horário da sessão', example: 'The next showtime is at 8 PM.' },
      { id: 'v2', word: 'SUBTITLES', emoji: '💬', pron: '/ˈsʌbtaɪtlz/', meaning: 'Legendas', example: 'Is the movie in English with subtitles?' },
      { id: 'v3', word: 'POPCORN', emoji: '🍿', pron: '/ˈpɑːpkɔːrn/', meaning: 'Pipoca', example: 'Can I get a large salted popcorn?' }
    ],
    expressions: ["Two tickets for the 8 PM show, please.", "Can we sit in the middle row?", "A large popcorn and two sodas.", "Which theater room is it?"],
    dialogues: {
      start: {
        name: 'Chloe (Box Office)',
        text: 'Welcome to Starlight Cinema! Which movie and showtime would you like to see tonight?',
        translation: 'Bem-vindo ao Starlight Cinema! Qual filme e sessão gostaria de ver esta noite?',
        options: [
          { label: 'A', text: 'Hi! Two tickets for the sci-fi movie at 8:00 PM, please.', next: 'seats', missionId: 'm1', keywords: ['tickets', 'movie', 'show', '8'] }
        ],
        fallback: 'How many tickets and which movie would you like?'
      },
      seats: {
        name: 'Chloe (Box Office)',
        text: 'Great! Where would you like to sit: front row, middle row, or at the back?',
        translation: 'Ótimo! Onde gostaria de se sentar: na fila da frente, no meio ou atrás?',
        options: [
          { label: 'A', text: 'In the middle row, please! Center seats if possible.', next: 'snacks', missionId: 'm2', keywords: ['middle', 'center', 'back', 'row', 'seats'] }
        ]
      },
      snacks: {
        name: 'Chloe (Box Office)',
        text: 'You got seats F7 and F8! Would you like to add any popcorn or drinks to your combo?',
        translation: 'Ficaram com os lugares F7 e F8! Gostariam de adicionar pipoca ou bebidas ao combo?',
        options: [
          { label: 'A', text: 'Yes! One large butter popcorn and two sodas, please.', next: 'end', missionId: 'm3', keywords: ['popcorn', 'soda', 'drink', 'combo'] }
        ]
      },
      end: {
        name: 'Chloe (Box Office)',
        text: 'Here are your tickets and your popcorn combo. Theater 4 is on your left. Enjoy the movie! 🎬🎉',
        translation: 'Aqui estão os bilhetes e o combo de pipoca. A Sala 4 fica à esquerda. Bom filme! 🎬🎉',
        options: []
      }
    }
  },

  home: {
    id: 'home',
    name: 'HOME & FLATMATES',
    emoji: '🏠',
    description: 'Daily conversations with flatmates, household chores, cooking dinner and bills.',
    type: 'Daily Life',
    gradient: 'es-gradient-home',
    roles: ['ROOMMATE', 'NEIGHBOR', 'GUEST'],
    npcName: 'Sam (Flatmate)',
    liveCount: 3,
    unlockedDefault: true,
    missions: [
      { id: 'm1', title: 'Decide what to cook for dinner together', xp: 60 },
      { id: 'm2', title: 'Divide the household chores', xp: 70 },
      { id: 'm3', title: 'Plan the grocery shopping list', xp: 75 }
    ],
    vocab: [
      { id: 'v1', word: 'CHORES', emoji: '🧹', pron: '/tʃɔːrz/', meaning: 'Tarefas domésticas', example: 'Let us split the household chores.' },
      { id: 'v2', word: 'GROCERIES', emoji: '🛒', pron: '/ˈɡroʊsəriz/', meaning: 'Compras de supermercado', example: 'We need to buy groceries for dinner.' },
      { id: 'v3', word: 'DISHES', emoji: '🍽️', pron: '/ˈdɪʃɪz/', meaning: 'Louça para lavar', example: "I'll do the dishes after dinner." }
    ],
    expressions: ["What should we make for dinner?", "I'll cook if you do the dishes.", "We are out of milk and eggs.", "I'll go to the supermarket."],
    dialogues: {
      start: {
        name: 'Sam (Flatmate)',
        text: "Hey! How was your day? I'm getting hungry—what should we make for dinner tonight?",
        translation: 'Ei! Como foi o teu dia? Estou a ficar com fome — o que vamos fazer para o jantar hoje?',
        options: [
          { label: 'A', text: "Hey Sam! Let's make homemade pasta with tomato sauce tonight!", next: 'chores', missionId: 'm1', keywords: ['pasta', 'pizza', 'dinner', 'cook', 'make'] }
        ],
        fallback: 'What would you like to cook for dinner tonight?'
      },
      chores: {
        name: 'Sam (Flatmate)',
        text: 'Homemade pasta sounds delicious! How should we split the chores in the kitchen?',
        translation: 'Massa caseira parece delicioso! Como dividimos as tarefas na cozinha?',
        options: [
          { label: 'A', text: 'I can cook the pasta if you wash the dishes and clean the table!', next: 'groceries', missionId: 'm2', keywords: ['cook', 'dishes', 'wash', 'clean'] }
        ]
      },
      groceries: {
        name: 'Sam (Flatmate)',
        text: 'Deal! Let me check the fridge... Oh, we are out of cheese and garlic!',
        translation: 'Combinado! Deixa-me ver o frigorífico... Oh, acabou o queijo e o alho!',
        options: [
          { label: 'A', text: 'No problem! I will run to the supermarket and buy the groceries right now.', next: 'end', missionId: 'm3', keywords: ['supermarket', 'buy', 'groceries', 'cheese'] }
        ]
      },
      end: {
        name: 'Sam (Flatmate)',
        text: "You're the best flatmate! I'll get the kitchen ready while you're at the store! 🏠🎉",
        translation: 'És o melhor colega de casa! Vou preparando a cozinha enquanto vais à loja! 🏠🎉',
        options: []
      }
    }
  },

  hospital: {
    id: 'hospital',
    name: 'MEDICAL CLINIC',
    emoji: '🏥',
    description: 'Describe symptoms to the doctor, understand medical advice and pharmacy prescriptions.',
    type: 'Health & Emergency',
    gradient: 'es-gradient-hospital',
    roles: ['PATIENT', 'DOCTOR', 'NURSE'],
    npcName: 'Dr. Evans',
    liveCount: 4,
    unlockedDefault: false,
    unlockXP: 1500,
    missions: [
      { id: 'm1', title: 'Describe your symptoms clearly', xp: 100 },
      { id: 'm2', title: 'Tell how long you have felt this way', xp: 110 },
      { id: 'm3', title: 'Understand the prescription & dosage', xp: 120 }
    ],
    vocab: [
      { id: 'v1', word: 'SYMPTOMS', emoji: '🌡️', pron: '/ˈsɪmptəmz/', meaning: 'Sintomas', example: 'What are your main symptoms?' },
      { id: 'v2', word: 'SORE THROAT', emoji: '🧣', pron: '/sɔːr θroʊt/', meaning: 'Dor de garganta', example: 'I have a sore throat and a mild headache.' },
      { id: 'v3', word: 'PRESCRIPTION', emoji: '💊', pron: '/prɪˈskrɪpʃn/', meaning: 'Receita médica', example: 'Take this prescription to the pharmacy.' }
    ],
    expressions: ["I've had a headache since yesterday.", "I have a sore throat and a cough.", "How often should I take this medicine?", "Do I need a prescription?"],
    dialogues: {
      start: {
        name: 'Dr. Evans',
        text: 'Hello! Please have a seat. What brings you to the clinic today? How are you feeling?',
        translation: 'Olá! Por favor, sente-se. O que o traz à clínica hoje? Como se está a sentir?',
        options: [
          { label: 'A', text: 'Hello Doctor. I have a sore throat, a headache, and I feel very tired.', next: 'duration', missionId: 'm1', keywords: ['throat', 'headache', 'fever', 'pain', 'cough'] }
        ],
        fallback: 'Could you tell me what symptoms you are experiencing today?'
      },
      duration: {
        name: 'Dr. Evans',
        text: 'I see. Let me check your temperature. How long have you had these symptoms, and do you have any allergies?',
        translation: 'Compreendo. Deixe-me medir a sua temperatura. Há quanto tempo tem estes sintomas e tem alguma alergia?',
        options: [
          { label: 'A', text: 'I have felt this way for two days, and I do not have any allergies.', next: 'prescription', missionId: 'm2', keywords: ['days', 'yesterday', 'allergies', 'no'] }
        ]
      },
      prescription: {
        name: 'Dr. Evans',
        text: 'It is a mild seasonal flu. I am writing you a prescription for throat lozenges and rest.',
        translation: 'É uma gripe sazonal leve. Vou passar-lhe uma receita e recomendar repouso.',
        options: [
          { label: 'A', text: 'Thank you, Doctor! How often should I take the medicine?', next: 'end', missionId: 'm3', keywords: ['how often', 'take', 'medicine', 'times'] }
        ]
      },
      end: {
        name: 'Dr. Evans',
        text: 'Take it twice a day after meals and drink plenty of water. You will feel better soon! 🏥🎉',
        translation: 'Tome duas vezes por dia após as refeições e beba muita água. Vai sentir-se melhor em breve! 🏥🎉',
        options: []
      }
    }
  }
};

class EnglishSpacesManager {
  constructor() {
    this.container = null;
    this.progressData = {
      visited: [],
      missionsCompleted: 0,
      xp: 0,
      vocab: [],
      unlocked: ['home', 'school', 'coffee', 'shopping', 'restaurant', 'beach', 'taxi', 'cinema']
    };
    this.state = {
      view: 'home',
      currentSpace: null,
      level: 'B1',
      role: null,
      dialogueState: 'start',
      immersion: true,
      missionsDone: [],
      aiCustomReply: null,
      aiCustomTranslation: null,
      aiGrammarTip: null,
      liveSession: null
    };
    this.recognition = null;
    this._statsAlunoCache = null;
    this.initSpeech();
  }

  init() {
    this.injetarCSS();
    this.injetarBannerAntesDaImersaoNoFeed();
    this.sincronizarProgressoNuvem();
  }

  initSpeech() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SR();
      this.recognition.lang = 'en-US';
      this.recognition.interimResults = false;
    }
  }

  falarTexto(texto) {
    if ('speechSynthesis' in window && texto) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = 'en-US';
      u.rate = 0.92;
      window.speechSynthesis.speak(u);
    }
  }

  ouvirMicrofone(callback) {
    if (this.recognition) {
      try {
        this.recognition.onresult = (e) => {
          const transcript = e.results[0][0].transcript;
          if (callback) callback(transcript);
        };
        this.recognition.start();
        if (window.Workspace?.mostrarAviso) {
          window.Workspace.mostrarAviso("🎤 Ouvindo em Inglês... Fale agora!", "info", 2500);
        }
      } catch (err) {
        const fallback = prompt('🎤 Digite ou fale a sua resposta em Inglês:');
        if (fallback && callback) callback(fallback);
      }
    } else {
      const fallback = prompt('🎤 Digite a sua resposta em Inglês:');
      if (fallback && callback) callback(fallback);
    }
  }

  ehProfessorOuGestor() {
    const tipo = window.Workspace?.usuario?.tipo || '';
    return tipo === 'Professor' || tipo === 'Gestor';
  }

  espacoEstaDesbloqueado(space) {
    if (this.ehProfessorOuGestor()) return true;
    if (space.unlockedDefault) return true;
    if (this.progressData.unlocked && this.progressData.unlocked.includes(space.id)) return true;
    if (space.unlockXP && (this.progressData.xp || 0) >= space.unlockXP) return true;
    return false;
  }

  // 🚀 Usa a rota já existente no teu servidor (/workspace/ingles/dados) — Zero Erro 404!
  async sincronizarProgressoNuvem() {
    try {
      const saved = localStorage.getItem('ws_english_spaces_progress_v2');
      if (saved) this.progressData = { ...this.progressData, ...JSON.parse(saved) };
    } catch (e) {}

    const u = window.Workspace?.usuario;
    if (!u || !u.id || !window.Workspace?.api) return;

    try {
      const escolaId = u.escolaId || 'DEFAULT';
      const res = await window.Workspace.api(`/workspace/ingles/dados?escolaId=${encodeURIComponent(escolaId)}&userId=${encodeURIComponent(u.id)}`, 'GET');
      if (res && res.success && res.dados) {
        this._statsAlunoCache = res.dados.statsAluno || {};
        this._srsCache = res.dados.srs || {};
        const remoto = this._srsCache._englishSpaces;
        if (remoto && typeof remoto === 'object') {
          this.progressData = {
            xp: Math.max(this.progressData.xp || 0, remoto.xp || 0),
            visited: Array.from(new Set([...(this.progressData.visited || []), ...(remoto.visited || [])])),
            missionsCompleted: Math.max(this.progressData.missionsCompleted || 0, remoto.missionsCompleted || 0),
            vocab: Array.from(new Set([...(this.progressData.vocab || []), ...(remoto.vocab || [])])),
            unlocked: Array.from(new Set([...(this.progressData.unlocked || []), ...(remoto.unlocked || [])]))
          };
          localStorage.setItem('ws_english_spaces_progress_v2', JSON.stringify(this.progressData));
          this.atualizarResumoNoBannerFeed();
        }
      }
    } catch (e) {}
  }

  // 🚀 Grava o progresso e soma Moedas de Bronze usando a rota já ativa (/workspace/ingles/xp) — Zero Erro 404!
  async salvarProgressoNaRotaOficial(xpAdicional = 0) {
    localStorage.setItem('ws_english_spaces_progress_v2', JSON.stringify(this.progressData));
    this.atualizarResumoNoBannerFeed();

    const u = window.Workspace?.usuario;
    if (!u || !u.id || !window.Workspace?.api) return;

    try {
      const stats = this._statsAlunoCache || {};
      const coinsAtuais = stats.coins || { bronze: 0, prata: 0, ouro: 0 };
      const novasCoins = {
        ...coinsAtuais,
        bronze: (Number(coinsAtuais.bronze) || 0) + (Number(xpAdicional) || 0)
      };
      this._statsAlunoCache = { ...stats, coins: novasCoins };

      const srsAtualizado = {
        ...(this._srsCache || {}),
        _englishSpaces: this.progressData
      };
      this._srsCache = srsAtualizado;

      await window.Workspace.api('/workspace/ingles/xp', 'POST', {
        userId: u.id,
        escolaId: u.escolaId || 'DEFAULT',
        nome: u.nome || u.login || 'Aluno',
        coins: novasCoins,
        streak: stats.streak || 1,
        streakFreeze: stats.streakFreeze || 0,
        srs: srsAtualizado
      });
    } catch (e) {}
  }

  async registarMissaoConcluida(spaceId, missionId, xpAmount) {
    this.progressData.xp = (this.progressData.xp || 0) + xpAmount;
    if (missionId !== 'visit') {
      this.progressData.missionsCompleted = (this.progressData.missionsCompleted || 0) + 1;
    }
    if (!this.progressData.visited.includes(spaceId)) {
      this.progressData.visited.push(spaceId);
    }
    if (this.progressData.xp >= 500) {
      ['airport', 'hotel'].forEach(id => {
        if (!this.progressData.unlocked.includes(id)) this.progressData.unlocked.push(id);
      });
    }
    if (this.progressData.xp >= 1500) {
      ['job', 'hospital'].forEach(id => {
        if (!this.progressData.unlocked.includes(id)) this.progressData.unlocked.push(id);
      });
    }

    this.mostrarAnimacaoXP(xpAmount);
    await this.salvarProgressoNaRotaOficial(xpAmount);
  }

  mostrarAnimacaoXP(amount) {
    const el = document.createElement('div');
    el.textContent = `🌟 +${amount} XP`;
    el.style.cssText = 'position:fixed;bottom:90px;right:24px;background:linear-gradient(90deg,#8b5cf6,#d946ef);color:#fff;padding:10px 20px;border-radius:999px;font-weight:800;font-size:14px;z-index:999999;box-shadow:0 10px 25px rgba(139,92,246,0.45);transition:all 0.5s ease;';
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(-20px)'; }, 900);
    setTimeout(() => el.remove(), 1400);
  }

  injetarBannerAntesDaImersaoNoFeed() {
    const posicionarBanner = () => {
      const feedSection = document.getElementById('ws-feed-container');
      if (!feedSection) return;

      let banner = document.getElementById('ws-card-english-spaces-feed');
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'ws-card-english-spaces-feed';
        banner.style.cssText = `
          background: linear-gradient(135deg, #090912 0%, #1e1b4b 55%, #3b0764 100%);
          border: 1px solid rgba(139, 92, 246, 0.45);
          border-radius: 20px; padding: 20px 24px; margin-bottom: 18px;
          color: #ffffff; position: relative; overflow: hidden;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.16);
          cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease;
        `;
        banner.onmouseover = () => { banner.style.transform = 'translateY(-2px)'; banner.style.boxShadow = '0 16px 35px rgba(139, 92, 246, 0.28)'; };
        banner.onmouseout = () => { banner.style.transform = 'translateY(0)'; banner.style.boxShadow = '0 12px 30px rgba(15, 23, 42, 0.16)'; };
        banner.onclick = () => this.abrirPainel();

        banner.innerHTML = `
          <div style="position:absolute; right:-15px; top:-25px; font-size:110px; opacity:0.12; pointer-events:none;">🌎</div>
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px; position:relative; z-index:2;">
            <div style="flex:1; min-width:220px;">
              <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(139,92,246,0.25); border:1px solid rgba(167,139,250,0.4); color:#e9d5ff; padding:4px 12px; border-radius:999px; font-size:11px; font-weight:800; margin-bottom:8px; letter-spacing:0.5px;">
                ✨ REAL-LIFE SIMULATOR • 12 SCENARIOS
              </div>
              <h3 style="margin:0 0 5px 0; font-size:20px; font-weight:800; color:#ffffff; display:flex; align-items:center; gap:8px;">
                🌎 English Spaces
              </h3>
              <p style="margin:0; font-size:13px; color:#cbd5e1; line-height:1.4;">
                Explore real situations (Airport, Coffee Shop, Hotel, Restaurant, Job Interview) & practice real spoken English!
              </p>
              <div id="ws-es-feed-stats" style="display:flex; gap:12px; margin-top:10px; font-size:11.5px; font-weight:700; color:#c4b5fd;">
                <span>🔥 ${this.progressData.xp || 0} XP</span>
                <span>🌍 ${(this.progressData.visited || []).length}/12 Spaces</span>
                <span>🎯 ${this.progressData.missionsCompleted || 0} Missions</span>
              </div>
            </div>
            <button type="button" style="background:linear-gradient(90deg, #8b5cf6, #d946ef); color:#ffffff; border:none; padding:12px 22px; border-radius:999px; font-weight:800; font-size:13px; cursor:pointer; box-shadow:0 6px 20px rgba(217,70,239,0.35); white-space:nowrap;">
              Enter Spaces →
            </button>
          </div>
        `;
      }

      const candidatos = Array.from(feedSection.children);
      const blocoImersao = candidatos.find(el =>
        el.id !== 'ws-card-english-spaces-feed' &&
        el.id !== 'ws-criar-post' &&
        (
          (el.id && el.id.toLowerCase().includes('imersao')) ||
          (el.innerHTML && (el.innerHTML.includes('Imersão Específica') || el.innerHTML.includes('abrirImersao') || el.innerHTML.includes('imersao-especifica')))
        )
      );

      if (blocoImersao) {
        if (banner.nextElementSibling !== blocoImersao) {
          feedSection.insertBefore(banner, blocoImersao);
        }
      } else if (!banner.parentElement) {
        const boxCriarPost = document.getElementById('ws-criar-post');
        if (boxCriarPost && boxCriarPost.nextSibling) {
          feedSection.insertBefore(banner, boxCriarPost.nextSibling);
        } else {
          feedSection.prepend(banner);
        }
      }
    };

    posicionarBanner();
    const feedEl = document.getElementById('ws-feed-container');
    if (feedEl && !this._observerFeedConfigurado) {
      const obs = new MutationObserver(() => posicionarBanner());
      obs.observe(feedEl, { childList: true });
      this._observerFeedConfigurado = true;
    }
  }

  atualizarResumoNoBannerFeed() {
    const el = document.getElementById('ws-es-feed-stats');
    if (el) {
      el.innerHTML = `
        <span>🔥 ${this.progressData.xp || 0} XP</span>
        <span>🌍 ${(this.progressData.visited || []).length}/12 Spaces</span>
        <span>🎯 ${this.progressData.missionsCompleted || 0} Missions</span>
      `;
    }
  }

  abrirPainel() {
    if (window.Workspace?.navegarPara) {
      window.Workspace.navegarPara('english_spaces');
    }
    this.container = document.getElementById('english-spaces-root');
    this.state.view = 'home';
    this.render();
  }

  navigate(view, spaceId = null) {
    this.container = document.getElementById('english-spaces-root');
    if (!this.container) return;

    if (view === 'space' && spaceId) {
      const alvo = SPACES_REGISTRY[spaceId];
      if (!alvo) return;
      if (!this.espacoEstaDesbloqueado(alvo)) {
        if (window.Workspace?.mostrarAviso) {
          window.Workspace.mostrarAviso(`🔒 Alcance ${alvo.unlockXP} XP nos outros cenários para desbloquear ${alvo.name}!`, 'warning');
        }
        return;
      }
      this.state.currentSpace = alvo;
      this.state.view = 'entering';
      this.render();
      setTimeout(() => {
        this.state.view = 'space';
        this.state.dialogueState = 'start';
        this.state.missionsDone = [];
        this.state.role = alvo.roles[0];
        this.state.aiCustomReply = null;
        this.state.aiCustomTranslation = null;
        this.state.aiGrammarTip = null;
        this.registarMissaoConcluida(spaceId, 'visit', 10);
        this.render();
      }, 850);
    } else {
      this.state.view = view;
      this.render();
    }
  }

  render() {
    this.container = document.getElementById('english-spaces-root');
    if (!this.container) return;

    if (this.state.view === 'home') this.renderHome();
    else if (this.state.view === 'entering') this.renderEntering();
    else if (this.state.view === 'space') this.renderSpace();
    else if (this.state.view === 'complete') this.renderComplete();
  }

  renderHome() {
    const p = this.progressData;
    this.container.innerHTML = `
      <div class="es-top-nav">
        <button type="button" class="es-back-btn" id="es-btn-voltar-feed">↩ Voltar ao Feed Principal</button>
        <div class="es-level-pills">
          <span style="font-size:12px; color:#a1a1aa; font-weight:700; margin-right:4px;">CEFR Level:</span>
          ${['A1', 'A2', 'B1', 'B2'].map(lvl => `
            <button type="button" class="es-lvl-btn ${this.state.level === lvl ? 'active' : ''}" data-set-level="${lvl}">${lvl}</button>
          `).join('')}
        </div>
      </div>

      <div class="es-home-hero">
        <h1 class="es-display">🌎 ENGLISH SPACES</h1>
        <p style="font-size:16px; color:#d4d4d8; margin:6px 0;">Explore real situations. Practice real English.</p>
        <span style="font-size:13px; color:#a1a1aa;">Choose a place below, step into the roleplay, and speak or type in English!</span>
        <div class="es-stats-bar">
          <span class="es-stat-pill">🔥 ${p.xp || 0} XP</span>
          <span class="es-stat-pill">🌍 ${(p.visited || []).length}/12 Spaces Visited</span>
          <span class="es-stat-pill">🎯 ${p.missionsCompleted || 0} Missions Completed</span>
          <span class="es-stat-pill">📖 ${(p.vocab || []).length} Words Discovered</span>
        </div>
      </div>

      <div class="es-spaces-grid">
        ${Object.values(SPACES_REGISTRY).map(space => this.renderCard(space)).join('')}
      </div>
    `;

    this.container.querySelector('#es-btn-voltar-feed')?.addEventListener('click', () => {
      if (window.Workspace?.voltarAoFeed) window.Workspace.voltarAoFeed();
    });

    this.container.querySelectorAll('[data-set-level]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.level = btn.dataset.setLevel;
        this.renderHome();
      });
    });

    this.container.querySelectorAll('[data-enter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.enter;
        this.navigate('space', id);
      });
    });
  }

  renderCard(space) {
    const desbloqueado = this.espacoEstaDesbloqueado(space);
    const visitado = (this.progressData.visited || []).includes(space.id);

    return `
      <div class="es-card ${!desbloqueado ? 'es-locked' : ''}" data-space="${space.id}">
        <div class="${space.gradient} es-card-visual">
          <span style="font-size:52px;">${space.emoji}</span>
          <div style="display:flex; gap:6px; align-items:center;">
            ${visitado ? `<span class="es-chip" style="background:rgba(16,185,129,0.25); border-color:#10b981; color:#6ee7b7;">✔ Visited</span>` : ''}
            <span class="es-chip">${space.type}</span>
          </div>
        </div>
        <div class="es-card-body">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <h3 style="margin:0; font-size:18px; color:#fff;">${space.name}</h3>
            <span style="font-size:11px; color:#a78bfa; font-weight:700;">🟢 ${space.liveCount} online</span>
          </div>
          <p style="font-size:13px; color:#a1a1aa; margin:8px 0 14px 0; line-height:1.45; min-height:38px;">${space.description}</p>
          <div style="display:flex; gap:6px; margin-bottom:16px; flex-wrap:wrap;">
            ${space.roles.map(r => `<span class="es-chip">${r}</span>`).join('')}
          </div>
          <button type="button" class="es-btn-primary" data-enter="${space.id}">
            ${desbloqueado ? 'ENTER SPACE →' : `🔒 Unlock at ${space.unlockXP} XP`}
          </button>
        </div>
      </div>
    `;
  }

  renderEntering() {
    const sp = this.state.currentSpace;
    this.container.innerHTML = `
      <div class="es-entering-box">
        <div style="font-size:64px; animation:esPulse 1s infinite;">${sp ? sp.emoji : '🌎'}</div>
        <h2 style="margin:14px 0 4px 0; font-size:24px; letter-spacing:1px;">ENTERING SPACE...</h2>
        <p style="color:#a78bfa; font-weight:700; font-size:16px; margin:0;">${sp ? sp.name : 'ENGLISH SPACE'} • Level ${this.state.level}</p>
      </div>
    `;
  }

  renderSpace() {
    const space = this.state.currentSpace;
    const node = space.dialogues[this.state.dialogueState] || space.dialogues.start;
    const missions = space.missions || [];

    const textoExibido = this.state.aiCustomReply || node.text;
    const traducaoExibida = this.state.aiCustomTranslation !== null ? this.state.aiCustomTranslation : (node.translation || '');

    this.container.innerHTML = `
      <div class="es-top-nav">
        <button type="button" class="es-back-btn" id="es-btn-back-map">← All Spaces</button>
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <span class="es-chip" style="font-size:12px; padding:6px 12px;">${space.emoji} ${space.name}</span>
          <div class="es-level-pills">
            ${['A1', 'A2', 'B1', 'B2'].map(lvl => `
              <button type="button" class="es-lvl-btn ${this.state.level === lvl ? 'active' : ''}" data-space-level="${lvl}">${lvl}</button>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="es-space-layout">
        <div class="es-space-main">
          <div class="es-npc-bubble ${space.gradient}">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <strong style="font-size:15px; color:#f4f4f5; display:flex; align-items:center; gap:8px;">
                <span style="font-size:22px;">${space.emoji}</span> ${node.name || space.npcName}
              </strong>
              <button type="button" class="es-audio-btn" id="es-btn-listen-npc" title="Ouvir pronúncia">🔊 Listen</button>
            </div>
            <p id="es-npc-text" style="font-size:17px; line-height:1.55; color:#ffffff; margin:0; font-weight:600;">"${textoExibido}"</p>
            ${!this.state.immersion && traducaoExibida ? `
              <div style="margin-top:10px; padding-top:8px; border-top:1px dashed rgba(255,255,255,0.2); font-size:13px; color:#fde047;">
                🇧🇷 ${traducaoExibida}
              </div>
            ` : ''}
            ${this.state.aiGrammarTip ? `
              <div style="margin-top:10px; background:rgba(16,185,129,0.2); border:1px solid #10b981; padding:8px 12px; border-radius:10px; font-size:12.5px; color:#a7f3d0;">
                💡 <strong>Coach Tip:</strong> ${this.state.aiGrammarTip}
              </div>
            ` : ''}
          </div>

          <div class="es-options-list">
            ${(node.options || []).map(opt => `
              <button type="button" class="es-option-btn" data-next="${opt.next}" data-mission="${opt.missionId || ''}">
                <span class="es-opt-badge">${opt.label}</span>
                <span>${opt.text}</span>
              </button>
            `).join('')}
          </div>

          <div class="es-free-input-box">
            <input type="text" id="es-free-text" placeholder="Type your own response in English (AI Roleplay)..." autocomplete="off" />
            <button type="button" class="es-send-btn" id="es-send-free">Send ➤</button>
            <button type="button" class="es-speak-btn" id="es-speak-btn">🎤 Speak</button>
          </div>
        </div>

        <div class="es-space-side">
          <div class="es-panel">
            <h4 class="es-panel-title">🎭 YOUR ROLE: <span style="color:#a78bfa;">${this.state.role}</span></h4>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              ${space.roles.map(r => `
                <button type="button" class="es-role-btn ${r === this.state.role ? 'active' : ''}" data-role="${r}">${r}</button>
              `).join('')}
            </div>
          </div>

          <div class="es-panel">
            <h4 class="es-panel-title">🎯 MISSIONS (${this.state.missionsDone.length}/${missions.length})</h4>
            <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:10px;">
              ${missions.map(m => {
                const feita = this.state.missionsDone.includes(m.id);
                return `
                  <div class="es-mission-item ${feita ? 'done' : ''}">
                    <span>${feita ? '✅' : '⬜'} ${m.title}</span>
                    <span style="font-weight:800; color:#c084fc;">+${m.xp} XP</span>
                  </div>
                `;
              }).join('')}
            </div>
            <div class="es-progress-bar">
              <div class="es-progress-fill" style="width:${missions.length ? (this.state.missionsDone.length / missions.length) * 100 : 0}%"></div>
            </div>
          </div>

          <div class="es-panel">
            <h4 class="es-panel-title">🧰 VOCABULARY OBJECTS (Click to learn)</h4>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              ${(space.vocab || []).map(v => `
                <button type="button" class="es-vocab-btn" data-vocab="${v.id}">${v.emoji} ${v.word}</button>
              `).join('')}
            </div>
          </div>

          <div class="es-panel">
            <div style="display:flex; gap:8px;">
              <button type="button" class="es-util-btn" id="es-help-btn">💡 Useful Phrases</button>
              <button type="button" class="es-util-btn" id="es-immersion-toggle">
                ${this.state.immersion ? '🌎 Immersion ON' : '🇧🇷 PT-BR Support'}
              </button>
            </div>
          </div>

          <div class="es-panel">
            <h4 class="es-panel-title">🟢 LIVE PRACTICE ROOM</h4>
            <button type="button" class="es-btn-primary" id="es-join-live" style="width:100%; height:38px; font-size:12px;">
              ${this.state.liveSession ? '🔴 Connected to Room' : '🎙️ Join Live Room'}
            </button>
            ${this.state.liveSession ? `
              <div style="margin-top:10px; font-size:12px; color:#a7f3d0;">
                Room: <strong>${this.state.liveSession.roomName}</strong><br>
                Participants: ${(this.state.liveSession.session?.participants || []).map(p => `${p.displayName} (${p.role})`).join(', ')}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
      <div id="es-modal-slot"></div>
    `;

    this.bindSpaceEvents(space, node);
  }

  bindSpaceEvents(space, node) {
    this.container.querySelector('#es-btn-back-map')?.addEventListener('click', () => this.navigate('home'));

    this.container.querySelector('#es-btn-listen-npc')?.addEventListener('click', () => {
      const txt = this.state.aiCustomReply || node.text;
      this.falarTexto(txt);
    });

    this.container.querySelectorAll('[data-space-level]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.level = btn.dataset.spaceLevel;
        this.renderSpace();
      });
    });

    this.container.querySelectorAll('[data-role]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.role = btn.dataset.role;
        this.renderSpace();
      });
    });

    this.container.querySelectorAll('[data-next]').forEach(btn => {
      btn.addEventListener('click', () => {
        const next = btn.dataset.next;
        const missionId = btn.dataset.mission;
        this.state.aiCustomReply = null;
        this.state.aiCustomTranslation = null;
        this.state.aiGrammarTip = null;

        if (missionId && !this.state.missionsDone.includes(missionId)) {
          this.state.missionsDone.push(missionId);
          const mObj = (space.missions || []).find(x => x.id === missionId);
          this.registarMissaoConcluida(space.id, missionId, mObj ? mObj.xp : 60);
        }

        if (next === 'end') {
          this.state.view = 'complete';
          this.render();
        } else {
          this.state.dialogueState = next;
          this.render();
        }
      });
    });

    this.container.querySelectorAll('[data-vocab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const vId = btn.dataset.vocab;
        const item = (space.vocab || []).find(v => v.id === vId);
        if (!item) return;
        this.falarTexto(`${item.word}. ${item.example}`);
        this.abrirModalVocab(space, item);
      });
    });

    this.container.querySelector('#es-help-btn')?.addEventListener('click', () => {
      this.abrirModalAjuda(space);
    });

    this.container.querySelector('#es-immersion-toggle')?.addEventListener('click', () => {
      this.state.immersion = !this.state.immersion;
      this.renderSpace();
    });

    // Sala Live instantânea (sem gerar erro 404)
    this.container.querySelector('#es-join-live')?.addEventListener('click', () => {
      const u = window.Workspace?.usuario || {};
      const meuNome = u.nome || u.login || 'You';
      this.state.liveSession = {
        roomName: `${space.id}-${this.state.level}`.toLowerCase(),
        session: {
          participants: [
            { displayName: meuNome, role: this.state.role },
            { displayName: space.npcName, role: space.roles[1] || 'HOST' }
          ]
        }
      };
      if (window.Workspace?.mostrarAviso) {
        window.Workspace.mostrarAviso(`🎙️ Conectado à sala ${this.state.liveSession.roomName}!`, 'success', 2500);
      }
      this.renderSpace();
    });

    // Resposta Livre (Casamento de intenção ou IA da Groq na rota já existente /workspace/ingles/ia-teste/groq!)
    const freeInput = this.container.querySelector('#es-free-text');
    const sendBtn = this.container.querySelector('#es-send-free');

    const processarRespostaLivre = async () => {
      const texto = (freeInput?.value || '').trim();
      if (!texto) return;
      const lower = texto.toLowerCase();

      // 1. Verifica se bate com palavras-chave das opções do diálogo
      let matchedOpt = null;
      for (const opt of (node.options || [])) {
        if (opt.keywords && opt.keywords.some(kw => lower.includes(kw.toLowerCase()))) {
          matchedOpt = opt;
          break;
        }
      }

      if (matchedOpt) {
        this.state.aiCustomReply = null;
        this.state.aiCustomTranslation = null;
        this.state.aiGrammarTip = null;
        if (matchedOpt.missionId && !this.state.missionsDone.includes(matchedOpt.missionId)) {
          this.state.missionsDone.push(matchedOpt.missionId);
          const mObj = (space.missions || []).find(x => x.id === matchedOpt.missionId);
          this.registarMissaoConcluida(space.id, matchedOpt.missionId, mObj ? mObj.xp : 65);
        }
        if (matchedOpt.next === 'end') {
          this.state.view = 'complete';
          this.render();
        } else {
          this.state.dialogueState = matchedOpt.next;
          this.render();
        }
        return;
      }

      // 2. Usa a rota oficial já existente no teu servidor (/workspace/ingles/ia-teste/groq) — Zero Erro 404!
      if (sendBtn) { sendBtn.disabled = true; sendBtn.textContent = '⏳...'; }
      try {
        const promptContextual = `[Scenario: ${space.name} | Your Role: ${node.name || space.npcName} | Student Role: ${this.state.role} | Level: ${this.state.level}]. Reply in character in 1-2 short sentences to what the student just said: "${texto}"`;
        const res = await window.Workspace.api('/workspace/ingles/ia-teste/groq', 'POST', {
          mensagem: promptContextual,
          historico: []
        });

        if (res && res.success && res.resposta) {
          this.state.aiCustomReply = res.resposta;
          this.state.aiCustomTranslation = '';
          this.state.aiGrammarTip = null;

          // Bonifica a prática de conversação livre na missão pendente
          const missaoPendente = (space.missions || []).find(m => !this.state.missionsDone.includes(m.id));
          if (missaoPendente && texto.split(/\s+/).length >= 3) {
            this.state.missionsDone.push(missaoPendente.id);
            this.registarMissaoConcluida(space.id, missaoPendente.id, missaoPendente.xp || 70);
          }

          this.falarTexto(res.resposta);
          this.renderSpace();
        } else {
          const pEl = this.container.querySelector('#es-npc-text');
          if (pEl) pEl.textContent = node.fallback || "Could you say that again in another way?";
          if (sendBtn) { sendBtn.disabled = false; sendBtn.textContent = 'Send ➤'; }
        }
      } catch (e) {
        const pEl = this.container.querySelector('#es-npc-text');
        if (pEl) pEl.textContent = node.fallback || "Could you say that again in another way?";
        if (sendBtn) { sendBtn.disabled = false; sendBtn.textContent = 'Send ➤'; }
      }
    };

    sendBtn?.addEventListener('click', processarRespostaLivre);
    freeInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') processarRespostaLivre();
    });

    this.container.querySelector('#es-speak-btn')?.addEventListener('click', () => {
      this.ouvirMicrofone((falado) => {
        if (freeInput) freeInput.value = falado;
        processarRespostaLivre();
      });
    });
  }

  abrirModalVocab(space, item) {
    const slot = this.container.querySelector('#es-modal-slot');
    if (!slot) return;

    if (!this.progressData.vocab.includes(item.word)) {
      this.progressData.vocab.push(item.word);
      this.progressData.xp = (this.progressData.xp || 0) + 15;
      this.mostrarAnimacaoXP(15);
      this.salvarProgressoNaRotaOficial(15);
    }

    slot.innerHTML = `
      <div class="es-modal-backdrop" id="es-close-modal">
        <div class="es-modal-box" onclick="event.stopPropagation()">
          <div style="font-size:48px; margin-bottom:8px;">${item.emoji}</div>
          <h3 style="margin:0; font-size:22px; color:#fff;">${item.word}</h3>
          <div style="color:#a78bfa; font-size:14px; margin:4px 0 12px 0;">${item.pron} • <strong>${item.meaning}</strong></div>
          <div style="background:rgba(255,255,255,0.06); padding:12px; border-radius:12px; font-size:14px; color:#e4e4e7; margin-bottom:16px;">
            "${item.example}"
          </div>
          <div style="display:flex; gap:10px; justify-content:center;">
            <button type="button" class="es-btn-primary" id="es-speak-vocab-again" style="padding:0 18px;">🔊 Listen Again</button>
            <button type="button" class="es-back-btn" id="es-btn-fechar-v">Close ✕</button>
          </div>
        </div>
      </div>
    `;
    slot.querySelector('#es-speak-vocab-again')?.addEventListener('click', () => this.falarTexto(`${item.word}. ${item.example}`));
    slot.querySelector('#es-close-modal')?.addEventListener('click', () => { slot.innerHTML = ''; });
    slot.querySelector('#es-btn-fechar-v')?.addEventListener('click', () => { slot.innerHTML = ''; });
  }

  abrirModalAjuda(space) {
    const slot = this.container.querySelector('#es-modal-slot');
    if (!slot) return;
    slot.innerHTML = `
      <div class="es-modal-backdrop" id="es-close-help">
        <div class="es-modal-box" onclick="event.stopPropagation()">
          <h3 style="margin:0 0 12px 0; font-size:18px; color:#fff;">💡 Useful Expressions (${space.name})</h3>
          <div style="display:flex; flex-direction:column; gap:8px; text-align:left; margin-bottom:16px;">
            ${(space.expressions || []).map(exp => `
              <div style="background:rgba(255,255,255,0.06); padding:10px 14px; border-radius:10px; display:flex; justify-content:space-between; align-items:center; gap:10px;">
                <span style="font-size:13.5px; color:#f4f4f5;">"${exp}"</span>
                <button type="button" class="es-audio-btn" data-say-exp="${exp.replace(/"/g, '&quot;')}">🔊</button>
              </div>
            `).join('')}
          </div>
          <button type="button" class="es-btn-primary" id="es-btn-fechar-h" style="width:100%;">Got it!</button>
        </div>
      </div>
    `;
    slot.querySelectorAll('[data-say-exp]').forEach(b => {
      b.addEventListener('click', () => this.falarTexto(b.dataset.sayExp));
    });
    slot.querySelector('#es-close-help')?.addEventListener('click', () => { slot.innerHTML = ''; });
    slot.querySelector('#es-btn-fechar-h')?.addEventListener('click', () => { slot.innerHTML = ''; });
  }

  renderComplete() {
    const sp = this.state.currentSpace;
    const xpTotal = Math.max(70, this.state.missionsDone.length * 75);
    this.container.innerHTML = `
      <div class="es-complete-card">
        <div style="font-size:60px; margin-bottom:10px;">🎉</div>
        <h1 class="es-display" style="margin:0 0 8px 0;">EXPERIENCE COMPLETE!</h1>
        <p style="color:#a1a1aa; margin:0 0 20px 0;">You mastered the <strong>${sp ? sp.name : 'English Space'}</strong> scenario!</p>
        <div class="es-scores-grid">
          <div class="es-score-box"><span>Communication</span><strong>94/100</strong></div>
          <div class="es-score-box"><span>Vocabulary</span><strong>90/100</strong></div>
          <div class="es-score-box"><span>Fluency</span><strong>92/100</strong></div>
          <div class="es-score-box"><span>Missions</span><strong>100%</strong></div>
        </div>
        <div style="font-size:32px; font-weight:900; color:#c084fc; margin:20px 0;">+${xpTotal} XP Earned</div>
        <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
          <button type="button" class="es-btn-primary" id="es-btn-again" style="padding:0 24px;">🔄 Practice Again</button>
          <button type="button" class="es-btn-primary" id="es-btn-back-all" style="padding:0 24px; background:linear-gradient(90deg,#8b5cf6,#d946ef); color:#fff;">🌎 Explore Other Spaces</button>
        </div>
      </div>
    `;
    this.container.querySelector('#es-btn-again')?.addEventListener('click', () => this.navigate('space', sp.id));
    this.container.querySelector('#es-btn-back-all')?.addEventListener('click', () => this.navigate('home'));
  }

  injetarCSS() {
    if (document.getElementById('ws-english-spaces-css')) return;
    const style = document.createElement('style');
    style.id = 'ws-english-spaces-css';
    style.innerHTML = `
      #ws-english-spaces-container {
        background: #07070b; color: #e9e9ef; border-radius: 20px;
        padding: 24px !important; min-height: 82vh;
        box-shadow: 0 20px 50px rgba(0,0,0,0.25);
      }
      #ws-english-spaces-container .es-display { font-family: 'Poppins', 'Inter', sans-serif; font-weight: 800; }
      #ws-english-spaces-container .es-top-nav {
        display: flex; justify-content: space-between; align-items: center;
        flex-wrap: wrap; gap: 12px; margin-bottom: 20px; padding-bottom: 14px;
        border-bottom: 1px solid rgba(255,255,255,0.08);
      }
      #ws-english-spaces-container .es-back-btn {
        background: rgba(255,255,255,0.08); color: #fff; border: 1px solid rgba(255,255,255,0.14);
        padding: 8px 16px; border-radius: 999px; font-weight: 700; font-size: 13px; cursor: pointer;
      }
      #ws-english-spaces-container .es-back-btn:hover { background: rgba(255,255,255,0.16); }
      #ws-english-spaces-container .es-level-pills { display: flex; align-items: center; gap: 6px; }
      #ws-english-spaces-container .es-lvl-btn {
        background: rgba(255,255,255,0.06); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.12);
        padding: 5px 12px; border-radius: 999px; font-weight: 700; font-size: 12px; cursor: pointer;
      }
      #ws-english-spaces-container .es-lvl-btn.active { background: #8b5cf6; color: #fff; border-color: #a78bfa; }
      #ws-english-spaces-container .es-home-hero { text-align: center; padding: 12px 0 24px 0; }
      #ws-english-spaces-container .es-home-hero h1 { font-size: 34px; margin: 0; color: #fff; }
      #ws-english-spaces-container .es-stats-bar {
        display: flex; justify-content: center; flex-wrap: wrap; gap: 10px; margin-top: 16px;
      }
      #ws-english-spaces-container .es-stat-pill {
        background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.35);
        color: #ddd6fe; padding: 6px 14px; border-radius: 999px; font-size: 12.5px; font-weight: 700;
      }
      #ws-english-spaces-container .es-spaces-grid {
        display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px;
      }
      #ws-english-spaces-container .es-card {
        border-radius: 20px; border: 1px solid rgba(255,255,255,0.09);
        background: #11111a; overflow: hidden; transition: transform 0.25s ease, box-shadow 0.25s ease;
        display: flex; flex-direction: column;
      }
      #ws-english-spaces-container .es-card:hover {
        transform: translateY(-4px); border-color: rgba(139,92,246,0.45);
        box-shadow: 0 16px 40px -15px rgba(139,92,246,0.45);
      }
      #ws-english-spaces-container .es-card.es-locked { opacity: 0.72; }
      #ws-english-spaces-container .es-card-visual {
        padding: 20px; display: flex; justify-content: space-between; align-items: flex-start;
      }
      #ws-english-spaces-container .es-card-body { padding: 18px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
      .es-gradient-coffee{background:radial-gradient(120% 120% at 30% 20%, rgba(245,158,11,0.35), transparent), linear-gradient(135deg,#1a140a,#2a1f0f)}
      .es-gradient-airport{background:radial-gradient(120% 120% at 30% 20%, rgba(56,189,248,0.35), transparent), linear-gradient(135deg,#0a1a2a,#0f2a3a)}
      .es-gradient-hotel{background:radial-gradient(120% 120% at 30% 20%, rgba(168,85,247,0.35), transparent), linear-gradient(135deg,#1a0f2a,#2a1a3a)}
      .es-gradient-restaurant{background:radial-gradient(120% 120% at 30% 20%, rgba(251,113,133,0.35), transparent), linear-gradient(135deg,#2a0f14,#3a1a1f)}
      .es-gradient-school{background:radial-gradient(120% 120% at 30% 20%, rgba(74,222,128,0.35), transparent), linear-gradient(135deg,#0f2a14,#1a3a1f)}
      .es-gradient-shopping{background:radial-gradient(120% 120% at 30% 20%, rgba(250,204,21,0.35), transparent), linear-gradient(135deg,#2a240a,#3a320f)}
      .es-gradient-beach{background:radial-gradient(120% 120% at 30% 20%, rgba(45,212,191,0.35), transparent), linear-gradient(135deg,#0a2a26,#0f3a32)}
      .es-gradient-job{background:radial-gradient(120% 120% at 30% 20%, rgba(99,102,241,0.35), transparent), linear-gradient(135deg,#14142a,#1f1f3a)}
      .es-gradient-taxi{background:radial-gradient(120% 120% at 30% 20%, rgba(251,191,36,0.35), transparent), linear-gradient(135deg,#2a2205,#3a300a)}
      .es-gradient-cinema{background:radial-gradient(120% 120% at 30% 20%, rgba(236,72,153,0.35), transparent), linear-gradient(135deg,#2a0f1f,#3a142a)}
      .es-gradient-home{background:radial-gradient(120% 120% at 30% 20%, rgba(148,163,184,0.35), transparent), linear-gradient(135deg,#1a1e2a,#222a3a)}
      .es-gradient-hospital{background:radial-gradient(120% 120% at 30% 20%, rgba(16,185,129,0.35), transparent), linear-gradient(135deg,#0a2a1f,#0f3a2a)}
      #ws-english-spaces-container .es-btn-primary {
        height: 42px; border-radius: 999px; background: #ffffff; color: #09090b;
        font-weight: 800; font-size: 13px; border: none; cursor: pointer; transition: 0.2s; width: 100%;
      }
      #ws-english-spaces-container .es-btn-primary:hover {
        background: linear-gradient(90deg, #8b5cf6, #d946ef); color: #ffffff;
      }
      #ws-english-spaces-container .es-chip {
        padding: 4px 10px; border-radius: 999px; font-size: 10.5px; font-weight: 700;
        border: 1px solid rgba(255,255,255,0.14); background: rgba(0,0,0,0.35); color: #e4e4e7;
      }
      #ws-english-spaces-container .es-space-layout {
        display: grid; grid-template-columns: 1.35fr 1fr; gap: 20px; align-items: start;
      }
      #ws-english-spaces-container .es-npc-bubble {
        padding: 22px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.14); margin-bottom: 16px;
      }
      #ws-english-spaces-container .es-audio-btn {
        background: rgba(255,255,255,0.14); color: #fff; border: none; padding: 6px 12px;
        border-radius: 999px; font-size: 12px; font-weight: 700; cursor: pointer;
      }
      #ws-english-spaces-container .es-options-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
      #ws-english-spaces-container .es-option-btn {
        background: #141420; border: 1px solid rgba(255,255,255,0.12); color: #f4f4f5;
        padding: 14px 16px; border-radius: 14px; text-align: left; font-size: 14px; font-weight: 600;
        cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.2s;
      }
      #ws-english-spaces-container .es-option-btn:hover {
        border-color: #8b5cf6; background: rgba(139,92,246,0.14);
      }
      #ws-english-spaces-container .es-opt-badge {
        background: #8b5cf6; color: #fff; width: 26px; height: 26px; border-radius: 50%;
        display: inline-flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; flex-shrink: 0;
      }
      #ws-english-spaces-container .es-free-input-box {
        display: flex; gap: 8px; background: #141420; padding: 8px; border-radius: 14px;
        border: 1px solid rgba(255,255,255,0.12); flex-wrap: wrap;
      }
      #ws-english-spaces-container #es-free-text {
        flex: 1; min-width: 180px; background: transparent; border: none; color: #fff;
        padding: 8px 10px; font-size: 14px; outline: none;
      }
      #ws-english-spaces-container .es-send-btn {
        background: #8b5cf6; color: #fff; border: none; padding: 8px 16px; border-radius: 10px; font-weight: 700; cursor: pointer;
      }
      #ws-english-spaces-container .es-speak-btn {
        background: #10b981; color: #fff; border: none; padding: 8px 14px; border-radius: 10px; font-weight: 700; cursor: pointer;
      }
      #ws-english-spaces-container .es-panel {
        background: #12121c; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px;
        padding: 16px; margin-bottom: 14px;
      }
      #ws-english-spaces-container .es-panel-title { margin: 0 0 10px 0; font-size: 12px; letter-spacing: 0.5px; color: #a1a1aa; }
      #ws-english-spaces-container .es-role-btn, #ws-english-spaces-container .es-vocab-btn, #ws-english-spaces-container .es-util-btn {
        background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #e4e4e7;
        padding: 7px 12px; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer;
      }
      #ws-english-spaces-container .es-role-btn.active { background: #8b5cf6; color: #fff; border-color: #a78bfa; }
      #ws-english-spaces-container .es-mission-item {
        display: flex; justify-content: space-between; font-size: 13px; padding: 8px 10px;
        border-radius: 10px; background: rgba(255,255,255,0.04);
      }
      #ws-english-spaces-container .es-mission-item.done { background: rgba(16,185,129,0.16); color: #6ee7b7; }
      #ws-english-spaces-container .es-progress-bar { height: 6px; border-radius: 999px; background: rgba(255,255,255,0.1); overflow: hidden; }
      #ws-english-spaces-container .es-progress-fill { height: 100%; background: linear-gradient(90deg,#8b5cf6,#d946ef); transition: width 0.4s ease; }
      #ws-english-spaces-container .es-entering-box, #ws-english-spaces-container .es-complete-card {
        text-align: center; padding: 60px 20px;
      }
      #ws-english-spaces-container .es-scores-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; max-width: 600px; margin: 0 auto;
      }
      #ws-english-spaces-container .es-score-box {
        background: #141420; border: 1px solid rgba(255,255,255,0.1); padding: 14px; border-radius: 14px;
        display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #a1a1aa;
      }
      #ws-english-spaces-container .es-score-box strong { font-size: 18px; color: #10b981; }
      #ws-english-spaces-container .es-modal-backdrop {
        position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px);
        z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 16px;
      }
      #ws-english-spaces-container .es-modal-box {
        background: #141420; border: 1px solid rgba(139,92,246,0.4); border-radius: 20px;
        padding: 24px; max-width: 440px; width: 100%; text-align: center;
      }
      @keyframes esPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
      @media (max-width: 820px) {
        #ws-english-spaces-container .es-space-layout { grid-template-columns: 1fr !important; }
      }
    `;
    document.head.appendChild(style);
  }
}

Workspace.EnglishSpaces = new EnglishSpacesManager();