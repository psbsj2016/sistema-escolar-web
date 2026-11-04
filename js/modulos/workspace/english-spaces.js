import './english-spaces-3d.js';

// js/modulos/workspace/english-spaces.js
// Módulo Integrado: 🌎 ENGLISH SPACES (24 Cenários Reais + Economia Unificada DOVRYX DRX + Sincronização Nuvem MongoDB)

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
        text: "The Wi-Fi is 'CoffeeLover2026' and your total is 15 DRX. How would you like to pay?",
        translation: "O Wi-Fi é 'CoffeeLover2026' e o total fica 15 DRX. Como gostaria de pagar?",
        options: [
          { label: 'A', text: "I'll pay with my DOVRYX card. Here you go!", next: 'end', missionId: 'm3', keywords: ['card', 'credit', 'cash', 'pay', 'here', 'drx'] }
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
    name: 'SHOPPING MALL',
    emoji: '🛍️',
    description: 'Looking for clothes, asking for sizes, trying items on in the fitting room and discounts.',
    type: 'Daily Life',
    gradient: 'es-gradient-shopping',
    roles: ['CUSTOMER', 'SALES ASSISTANT', 'CASHIER'],
    npcName: 'Emma (Sales Assistant)',
    liveCount: 4,
    unlockedDefault: true,
    missions: [
      { id: 'm1', title: 'Ask for a specific clothing item & size', xp: 60 },
      { id: 'm2', title: 'Ask where the fitting rooms are', xp: 70 },
      { id: 'm3', title: 'Ask about discounts & pay', xp: 80 }
    ],
    vocab: [
      { id: 'v1', word: 'FITTING ROOM', emoji: '🪞', pron: '/ˈfɪtɪŋ ruːm/', meaning: 'Provador de roupas', example: 'Where are the fitting rooms?' },
      { id: 'v2', word: 'MEDIUM SIZE', emoji: '👕', pron: '/ˈmiːdiəm saɪz/', meaning: 'Tamanho médio (M)', example: 'Do you have this jacket in medium?' },
      { id: 'v3', word: 'ON SALE', emoji: '🏷️', pron: '/ɑːn seɪl/', meaning: 'Em promoção', example: 'This item is 20% off on sale.' }
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
      { id: 'v2', word: 'FARE', emoji: '💵', pron: '/fer/', meaning: 'Tarifa / Valor da corrida', example: 'The total fare is 14 DRX.' },
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
        text: 'Traffic is light! It will take about 12 minutes. Here we are right in front of the main entrance! The fare is 14 DRX.',
        translation: 'O trânsito está tranquilo! Levará cerca de 12 minutos. Aqui estamos em frente à entrada principal! A corrida deu 14 DRX.',
        options: [
          { label: 'A', text: 'Here is 16 DRX, please keep the change! Thanks for the ride!', next: 'end', missionId: 'm3', keywords: ['here', 'change', 'card', 'thanks', 'pay'] }
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
        text: "It's 15 DRX for the whole day. I've set them up for you right here!",
        translation: 'São 15 DRX pelo dia inteiro. Já as preparei aqui para você!',
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
    unlockedDefault: true,
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
    unlockedDefault: true,
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
    unlockedDefault: true,
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
    unlockedDefault: true,
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
  },

  // =========================================================================
  // 🏙️ 12 NOVOS CENÁRIOS DA EXPANSÃO LIFE RPG & ECONOMIA DOVRYX (DRX)
  // =========================================================================
  bank: {
    id: 'bank',
    name: 'CITY BANK',
    emoji: '🏦',
    description: 'Open a DOVRYX bank account, deposit your earnings, and learn financial English.',
    type: 'Finance & Life RPG',
    gradient: 'es-gradient-hospital',
    roles: ['CUSTOMER', 'BANK MANAGER', 'TELLER'],
    npcName: 'Oliver (Bank Manager)',
    liveCount: 5,
    unlockedDefault: true,
    missions: [
      { id: 'm1', title: 'Ask to open a savings account', xp: 75 },
      { id: 'm2', title: 'Check your DOVRYX (DRX) balance', xp: 80 },
      { id: 'm3', title: 'Invest in a DRX Savings Bond', xp: 90 }
    ],
    vocab: [
      { id: 'v1', word: 'SAVINGS ACCOUNT', emoji: '🏦', pron: '/ˈseɪvɪŋz əˌkaʊnt/', meaning: 'Conta poupança', example: 'I would like to open a savings account.' },
      { id: 'v2', word: 'BALANCE', emoji: '💎', pron: '/ˈbæləns/', meaning: 'Saldo bancário', example: 'Could I check my current DRX balance?' },
      { id: 'v3', word: 'DEPOSIT', emoji: '💵', pron: '/dɪˈpɑːzɪt/', meaning: 'Depósito', example: 'I want to make a deposit today.' }
    ],
    expressions: ["I'd like to open a bank account.", "What is my current balance?", "How do I invest my DOVRYX?", "Can I withdraw some money?"],
    dialogues: {
      start: {
        name: 'Oliver (Bank Manager)',
        text: 'Welcome to English City Bank! How can I help you manage your DOVRYX (DRX) today?',
        translation: 'Bem-vindo ao Banco da Cidade! Como posso ajudá-lo a gerir os seus DOVRYX (DRX) hoje?',
        options: [
          { label: 'A', text: 'Good morning! I would like to open a savings account, please.', next: 'balance', missionId: 'm1', keywords: ['open', 'account', 'savings', 'bank'] }
        ],
        fallback: 'Would you like to open an account or check your DRX balance?'
      },
      balance: {
        name: 'Oliver (Bank Manager)',
        text: 'Your DOVRYX account is now active! Would you like to check your balance or make an investment?',
        translation: 'A sua conta DOVRYX já está ativa! Gostaria de consultar o saldo ou fazer um investimento?',
        options: [
          { label: 'A', text: 'Could I check my current balance and hear about the Savings Bond?', next: 'invest', missionId: 'm2', keywords: ['balance', 'check', 'bond', 'invest'] }
        ]
      },
      invest: {
        name: 'Oliver (Bank Manager)',
        text: 'Our Gold Reserve Bond helps you save for your house construction! Would you like to activate it?',
        translation: 'O nosso Título de Reserva ajuda-o a poupar para a construção da sua casa! Gostaria de ativá-lo?',
        options: [
          { label: 'A', text: 'Yes, please! I want to invest my DRX for my new house.', next: 'end', missionId: 'm3', keywords: ['yes', 'invest', 'house', 'drx'] }
        ]
      },
      end: {
        name: 'Oliver (Bank Manager)',
        text: 'All set! Your DOVRYX portfolio is growing strong. See you soon! 🏦💎',
        translation: 'Tudo pronto! O seu portefólio DOVRYX está a crescer forte. Até breve! 🏦💎',
        options: []
      }
    }
  },

  clothing: {
    id: 'clothing',
    name: 'FASHION STORE',
    emoji: '👗',
    description: 'Buy shirts, jackets and hoodies with DRX to customize your 3D avatar in real time.',
    type: 'Style & Avatar',
    gradient: 'es-gradient-cinema',
    roles: ['SHOPPER', 'STYLIST'],
    npcName: 'Bella (Stylist)',
    liveCount: 6,
    unlockedDefault: true,
    missions: [
      { id: 'm1', title: 'Ask for outfit recommendations', xp: 70 },
      { id: 'm2', title: 'Choose a color for your shirt or jacket', xp: 80 },
      { id: 'm3', title: 'Buy the outfit using DOVRYX', xp: 85 }
    ],
    vocab: [
      { id: 'v1', word: 'HOODIE', emoji: '🎽', pron: '/ˈhʊdi/', meaning: 'Moletom com capuz', example: 'This emerald hoodie looks awesome!' },
      { id: 'v2', word: 'OUTFIT', emoji: '👗', pron: '/ˈaʊtfɪt/', meaning: 'Visual / Conjunto de roupa', example: 'I love your new outfit!' },
      { id: 'v3', word: 'STYLISH', emoji: '✨', pron: '/ˈstaɪlɪʃ/', meaning: 'Estiloso / Elegante', example: 'That royal blue jacket is very stylish.' }
    ],
    expressions: ["What colors do you have?", "I love this royal blue jacket!", "Does this match my style?", "I want to buy this shirt with DRX."],
    dialogues: {
      start: {
        name: 'Bella (Stylist)',
        text: 'Welcome to Bella Fashion Boutique! Ready to upgrade your 3D avatar look today?',
        translation: 'Bem-vindo à Boutique Bella Fashion! Pronto para renovar o visual do seu avatar 3D hoje?',
        options: [
          { label: 'A', text: 'Hi Bella! Yes, what outfits do you recommend today?', next: 'color', missionId: 'm1', keywords: ['outfit', 'recommend', 'shirt', 'jacket'] }
        ]
      },
      color: {
        name: 'Bella (Stylist)',
        text: 'We have Neon Pink Shirts, Royal Blue Jackets, and Emerald Hoodies! Which color is your favorite?',
        translation: 'Temos Camisas Rosa Neon, Casacos Azul Real e Moletons Esmeralda! Qual é a sua cor favorita?',
        options: [
          { label: 'A', text: 'I love the Royal Blue Jacket and the Emerald Hoodie!', next: 'buy', missionId: 'm2', keywords: ['blue', 'pink', 'emerald', 'jacket', 'hoodie'] }
        ]
      },
      buy: {
        name: 'Bella (Stylist)',
        text: 'Fantastic choice! Remember you get 20% off in the 3D store when you order by voice!',
        translation: 'Escolha fantástica! Lembre-se de que ganha 20% de desconto na loja 3D ao pedir por voz!',
        options: [
          { label: 'A', text: 'Awesome! I will buy it right now with my DRX.', next: 'end', missionId: 'm3', keywords: ['buy', 'drx', 'voice', 'awesome'] }
        ]
      },
      end: {
        name: 'Bella (Stylist)',
        text: 'You look amazing! Everyone in the 3D City will see your new style! 👗✨',
        translation: 'Ficou incrível! Todos na Cidade 3D verão o seu novo estilo! 👗✨',
        options: []
      }
    }
  },

  shoes: {
    id: 'shoes',
    name: 'SNEAKER LAB',
    emoji: '👟',
    description: 'Try on sneakers, running shoes and boots to walk in style around the 3D boulevard.',
    type: 'Style & Avatar',
    gradient: 'es-gradient-hotel',
    roles: ['SHOPPER', 'SHOE EXPERT'],
    npcName: 'Liam (Seller)',
    liveCount: 4,
    unlockedDefault: true,
    missions: [
      { id: 'm1', title: 'Tell the seller your shoe size', xp: 70 },
      { id: 'm2', title: 'Compare sneakers and boots', xp: 75 },
      { id: 'm3', title: 'Purchase your new pair of shoes', xp: 85 }
    ],
    vocab: [
      { id: 'v1', word: 'SNEAKERS', emoji: '👟', pron: '/ˈsniːkərz/', meaning: 'Ténis desportivos', example: 'These gold sneakers are very comfortable.' },
      { id: 'v2', word: 'BOOTS', emoji: '🥾', pron: '/buːts/', meaning: 'Botas', example: 'I wear boots on rainy days.' },
      { id: 'v3', word: 'COMFORTABLE', emoji: '☁️', pron: '/ˈkʌmftəbl/', meaning: 'Confortável', example: 'Are these shoes comfortable for walking?' }
    ],
    expressions: ["Do you have size 9?", "Are these sneakers comfortable?", "I'd like to try on the gold sneakers.", "I'll take this pair!"],
    dialogues: {
      start: {
        name: 'Liam (Seller)',
        text: 'Yo! Welcome to Sneaker Lab! What shoe size do you wear?',
        translation: 'Olá! Bem-vindo ao Sneaker Lab! Qual é o tamanho do seu calçado?',
        options: [
          { label: 'A', text: 'Hi Liam! I wear size 9. What new sneakers do you have?', next: 'compare', missionId: 'm1', keywords: ['size', 'sneakers', 'shoes', 'wear'] }
        ]
      },
      compare: {
        name: 'Liam (Seller)',
        text: 'We just got Gold Sneakers, Crimson Boots, and Cyber Shoes! Which pair do you want to try?',
        translation: 'Acabámos de receber Ténis Dourados, Botas Carmesim e Sapatos Cyber! Qual par quer experimentar?',
        options: [
          { label: 'A', text: 'The Gold Sneakers look super comfortable! Can I try them?', next: 'buy', missionId: 'm2', keywords: ['gold', 'boots', 'cyber', 'try', 'comfortable'] }
        ]
      },
      buy: {
        name: 'Liam (Seller)',
        text: 'They fit you like a glove! Ready to rock them on the boulevard?',
        translation: 'Assentam-lhe como uma luva! Pronto para estreá-los na avenida?',
        options: [
          { label: 'A', text: "Yes! I'll take this pair with my DOVRYX!", next: 'end', missionId: 'm3', keywords: ['take', 'buy', 'yes', 'pair', 'dovryx'] }
        ]
      },
      end: {
        name: 'Liam (Seller)',
        text: 'Enjoy your new kicks! Listen to those footsteps on the street! 👟🔥',
        translation: 'Aproveite os seus novos ténis! Ouça só esses passos na rua! 👟🔥',
        options: []
      }
    }
  },

  tools: {
    id: 'tools',
    name: 'HARDWARE TOOLS',
    emoji: '🔨',
    description: 'Find hammers, wrenches and electric drills for your home improvement projects.',
    type: 'Life RPG',
    gradient: 'es-gradient-taxi',
    roles: ['BUILDER', 'HANDYMAN'],
    npcName: 'Hank (Handyman)',
    liveCount: 3,
    unlockedDefault: true,
    missions: [
      { id: 'm1', title: 'Explain what you are building or fixing', xp: 70 },
      { id: 'm2', title: 'Ask for a hammer or electric drill', xp: 80 },
      { id: 'm3', title: 'Complete your tool purchase', xp: 85 }
    ],
    vocab: [
      { id: 'v1', word: 'HAMMER', emoji: '🔨', pron: '/ˈhæmər/', meaning: 'Martelo', example: 'I need a hammer and some nails.' },
      { id: 'v2', word: 'WRENCH', emoji: '🔧', pron: '/rentʃ/', meaning: 'Chave inglesa', example: 'Pass me the steel wrench, please.' },
      { id: 'v3', word: 'DRILL', emoji: '🪛', pron: '/drɪl/', meaning: 'Berbequim / Furadeira', example: 'This electric drill is very powerful.' }
    ],
    expressions: ["I'm building my house.", "Where can I find a hammer?", "Do you have an electric drill?", "Thanks for your advice!"],
    dialogues: {
      start: {
        name: 'Hank (Handyman)',
        text: 'Howdy! Welcome to Hank Hardware! What project are you working on today?',
        translation: 'Olá! Bem-vindo à Ferragens do Hank! Em que projeto está a trabalhar hoje?',
        options: [
          { label: 'A', text: 'Hi Hank! I am building and furnishing my new house in the city!', next: 'tool', missionId: 'm1', keywords: ['building', 'house', 'fixing', 'project'] }
        ]
      },
      tool: {
        name: 'Hank (Handyman)',
        text: 'That is awesome! Every good builder needs a Power Hammer and an Electric Drill. Which one do you need?',
        translation: 'Isso é excelente! Todo bom construtor precisa de um Martelo e de uma Furadeira Elétrica. De qual precisa?',
        options: [
          { label: 'A', text: 'I need both the Power Hammer and the Electric Drill, please!', next: 'end', missionId: 'm2', keywords: ['hammer', 'drill', 'wrench', 'both'] }
        ]
      },
      end: {
        name: 'Hank (Handyman)',
        text: 'Here are your tools! Go build the finest house in English City! 🔨🏠',
        translation: 'Aqui estão as suas ferramentas! Vá construir a melhor casa da Cidade! 🔨🏠',
        options: []
      }
    }
  },

  petshop: {
    id: 'petshop',
    name: 'PET SHOP',
    emoji: '🐾',
    description: 'Adopt a puppy dog or cute cat that follows you around the 3D City!',
    type: 'Life RPG & Pets',
    gradient: 'es-gradient-school',
    roles: ['PET OWNER', 'VETERINARIAN'],
    npcName: 'Daisy (Vet)',
    liveCount: 6,
    unlockedDefault: true,
    missions: [
      { id: 'm1', title: 'Ask about adopting a dog or cat', xp: 80 },
      { id: 'm2', title: 'Learn how to feed and care for your pet', xp: 85 },
      { id: 'm3', title: 'Adopt your new companion', xp: 95 }
    ],
    vocab: [
      { id: 'v1', word: 'PUPPY', emoji: '🐶', pron: '/ˈpʌpi/', meaning: 'Cachorrinho / Filhote', example: 'I adopted a cute puppy at the Pet Shop!' },
      { id: 'v2', word: 'KITTEN', emoji: '🐱', pron: '/ˈkɪtn/', meaning: 'Gatinho', example: 'The kitten loves playing with yarn.' },
      { id: 'v3', word: 'PET TREATS', emoji: '🦴', pron: '/pet triːts/', meaning: 'Biscoitos / Petiscos para animais', example: 'I bought a pack of pet treats.' }
    ],
    expressions: ["I would like to adopt a puppy.", "Do you prefer dogs or cats?", "What does the puppy eat?", "I'll take good care of my pet!"],
    dialogues: {
      start: {
        name: 'Daisy (Vet)',
        text: 'Welcome to Happy Paws Pet Shop! Would you like to adopt a loyal puppy or a cute cat today?',
        translation: 'Bem-vindo ao Pet Shop Happy Paws! Gostaria de adotar um cachorrinho leal ou um gatinho fofo hoje?',
        options: [
          { label: 'A', text: 'Hi Daisy! I would love to adopt a pet to walk with me in the city!', next: 'care', missionId: 'm1', keywords: ['adopt', 'puppy', 'dog', 'cat', 'pet'] }
        ]
      },
      care: {
        name: 'Daisy (Vet)',
        text: 'Wonderful! Remember to give your pet fresh water, love, and healthy pet treats every day.',
        translation: 'Maravilhoso! Lembre-se de dar água fresca, carinho e petiscos saudáveis ao seu animal todos os dias.',
        options: [
          { label: 'A', text: 'I promise to take great care of my pet and buy some treats too!', next: 'end', missionId: 'm2', keywords: ['care', 'treats', 'promise', 'feed'] }
        ]
      },
      end: {
        name: 'Daisy (Vet)',
        text: 'Congratulations! Click on the Puppy or Cat stand in the 3D Pet Shop to walk with your new friend! 🐾🎉',
        translation: 'Parabéns! Clique no expositor do Cão ou Gato dentro do Pet Shop 3D para passear com o seu novo amigo! 🐾🎉',
        options: []
      }
    }
  },

  supermarket: {
    id: 'supermarket',
    name: 'SUPERMARKET',
    emoji: '🛒',
    description: 'Shop for fresh apples, milk and bakery bread, and practice prices at the checkout.',
    type: 'Daily Life',
    gradient: 'es-gradient-airport',
    roles: ['SHOPPER', 'CASHIER'],
    npcName: 'Noah (Cashier)',
    liveCount: 5,
    unlockedDefault: true,
    missions: [
      { id: 'm1', title: 'Ask which aisle has fruit and milk', xp: 65 },
      { id: 'm2', title: 'Pick fresh bakery bread', xp: 75 },
      { id: 'm3', title: 'Pay at the supermarket checkout', xp: 80 }
    ],
    vocab: [
      { id: 'v1', word: 'AISLE', emoji: '🛒', pron: '/aɪl/', meaning: 'Corredor do supermercado', example: 'Milk is in aisle 3.' },
      { id: 'v2', word: 'BAKERY', emoji: '🍞', pron: '/ˈbeɪkəri/', meaning: 'Padaria', example: 'The bakery bread smells amazing.' },
      { id: 'v3', word: 'ORGANIC', emoji: '🍎', pron: '/ɔːrˈɡænɪk/', meaning: 'Orgânico', example: 'I bought fresh organic apples.' }
    ],
    expressions: ["Which aisle is the milk in?", "Are these apples organic?", "Do you need a shopping bag?", "I'll pay with DOVRYX."],
    dialogues: {
      start: {
        name: 'Noah (Cashier)',
        text: 'Welcome to Fresh Mart Supermarket! Looking for any groceries today?',
        translation: 'Bem-vindo ao Supermercado Fresh Mart! À procura de compras hoje?',
        options: [
          { label: 'A', text: 'Hi Noah! Which aisle has fresh milk and organic apples?', next: 'bakery', missionId: 'm1', keywords: ['aisle', 'milk', 'apples', 'fruit'] }
        ]
      },
      bakery: {
        name: 'Noah (Cashier)',
        text: 'Dairy and fruit are right in Aisle 2! We also have warm bread straight from the bakery.',
        translation: 'Laticínios e frutas ficam no Corredor 2! Também temos pão quentinho saído da padaria.',
        options: [
          { label: 'A', text: 'Awesome! I will take a loaf of bakery bread, milk, and apples.', next: 'end', missionId: 'm2', keywords: ['bread', 'bakery', 'take', 'milk'] }
        ]
      },
      end: {
        name: 'Noah (Cashier)',
        text: 'All scanned! Thank you for shopping at Fresh Mart! 🛒🍎',
        translation: 'Tudo registado! Obrigado por comprar no Fresh Mart! 🛒🍎',
        options: []
      }
    }
  },

  pharmacy: {
    id: 'pharmacy',
    name: 'PHARMACY',
    emoji: '💊',
    description: 'Pick up vitamins, first aid kits and ask the pharmacist about health care.',
    type: 'Health & Emergency',
    gradient: 'es-gradient-beach',
    roles: ['PATIENT', 'PHARMACIST'],
    npcName: 'Grace (Pharmacist)',
    liveCount: 3,
    unlockedDefault: true,
    missions: [
      { id: 'm1', title: 'Ask for Vitamin C or a First Aid Kit', xp: 75 },
      { id: 'm2', title: 'Confirm the recommended dosage', xp: 85 }
    ],
    vocab: [
      { id: 'v1', word: 'VITAMINS', emoji: '💊', pron: '/ˈvaɪtəmɪnz/', meaning: 'Vitaminas', example: 'Vitamin C helps boost your immunity.' },
      { id: 'v2', word: 'FIRST AID KIT', emoji: '🩹', pron: '/ˌfɜːrst ˈeɪd kɪt/', meaning: 'Kit de primeiros socorros', example: 'Always keep a first aid kit at home.' },
      { id: 'v3', word: 'DOSAGE', emoji: '📋', pron: '/ˈdoʊsɪdʒ/', meaning: 'Dosagem', example: 'What is the daily dosage?' }
    ],
    expressions: ["Do you have Vitamin C?", "I need a first aid kit for my home.", "Should I take this with water?", "Thank you for your help!"],
    dialogues: {
      start: {
        name: 'Grace (Pharmacist)',
        text: 'Hello! Welcome to City Care Pharmacy. How can I help you stay healthy today?',
        translation: 'Olá! Bem-vindo à Farmácia City Care. Como posso ajudá-lo a manter-se saudável hoje?',
        options: [
          { label: 'A', text: 'Hi Grace! I would like some Vitamin C and a First Aid Kit for my house.', next: 'dosage', missionId: 'm1', keywords: ['vitamin', 'first aid', 'kit', 'medicine'] }
        ]
      },
      dosage: {
        name: 'Grace (Pharmacist)',
        text: 'Here they are! Take one Vitamin C tablet every morning with breakfast.',
        translation: 'Aqui estão! Tome um comprimido de Vitamina C todas as manhãs ao pequeno-almoço.',
        options: [
          { label: 'A', text: 'Got it! One tablet every morning. Thank you so much!', next: 'end', missionId: 'm2', keywords: ['morning', 'tablet', 'thank', 'got it'] }
        ]
      },
      end: {
        name: 'Grace (Pharmacist)',
        text: 'You are very welcome! Stay healthy and energetic! 💊✨',
        translation: 'De nada! Mantenha-se saudável e cheio de energia! 💊✨',
        options: []
      }
    }
  },

  bookstore: {
    id: 'bookstore',
    name: 'BOOKSTORE',
    emoji: '📚',
    description: 'Browse English grammar books, dictionaries and notebooks to boost your knowledge.',
    type: 'Academic',
    gradient: 'es-gradient-coffee',
    roles: ['READER', 'LIBRARIAN'],
    npcName: 'Arthur (Librarian)',
    liveCount: 4,
    unlockedDefault: true,
    missions: [
      { id: 'm1', title: 'Ask for an English learning book', xp: 75 },
      { id: 'm2', title: 'Pick a dictionary or study notebook', xp: 85 }
    ],
    vocab: [
      { id: 'v1', word: 'DICTIONARY', emoji: '📖', pron: '/ˈdɪkʃəneri/', meaning: 'Dicionário', example: 'Look up the new word in the dictionary.' },
      { id: 'v2', word: 'BESTSELLER', emoji: '📚', pron: '/ˌbestˈselər/', meaning: 'Livro mais vendido', example: 'This English book is a bestseller!' },
      { id: 'v3', word: 'NOTEBOOK', emoji: '📓', pron: '/ˈnoʊtbʊk/', meaning: 'Caderno de anotações', example: 'I write new vocabulary in my notebook.' }
    ],
    expressions: ["What English books do you recommend?", "Where is the dictionary section?", "I love reading mystery novels.", "I'll buy this grammar book!"],
    dialogues: {
      start: {
        name: 'Arthur (Librarian)',
        text: 'Welcome to Oxford Corner Bookstore! What kind of book are you looking for today?',
        translation: 'Bem-vindo à Livraria Oxford Corner! Que tipo de livro procura hoje?',
        options: [
          { label: 'A', text: 'Hello Arthur! Which book do you recommend to improve my English grammar?', next: 'pick', missionId: 'm1', keywords: ['recommend', 'grammar', 'english', 'book'] }
        ]
      },
      pick: {
        name: 'Arthur (Librarian)',
        text: "'English Grammar Pro' and the 'Oxford Dictionary' are our top bestsellers! Would you like a study notebook too?",
        translation: "'English Grammar Pro' e o 'Dicionário Oxford' são os nossos mais vendidos! Gostaria de um caderno de estudos também?",
        options: [
          { label: 'A', text: 'Yes! I will take the Grammar book and the study notebook, please.', next: 'end', missionId: 'm2', keywords: ['grammar', 'notebook', 'dictionary', 'take'] }
        ]
      },
      end: {
        name: 'Arthur (Librarian)',
        text: 'Happy reading! Knowledge is the greatest treasure in English City! 📚🌟',
        translation: 'Boa leitura! O conhecimento é o maior tesouro na Cidade do Inglês! 📚🌟',
        options: []
      }
    }
  },

  real_estate: {
    id: 'real_estate',
    name: 'REAL ESTATE AGENCY',
    emoji: '🏡',
    description: 'Buy land deeds and house upgrades to expand your personal residence in the 3D City!',
    type: 'Life RPG & Housing',
    gradient: 'es-gradient-hotel',
    roles: ['HOME BUYER', 'REAL ESTATE AGENT'],
    npcName: 'Victoria (Broker)',
    liveCount: 7,
    unlockedDefault: true,
    missions: [
      { id: 'm1', title: 'Ask about your starter residential lot', xp: 90 },
      { id: 'm2', title: 'Learn how to upgrade your house stages', xp: 100 }
    ],
    vocab: [
      { id: 'v1', word: 'REAL ESTATE', emoji: '🏡', pron: '/ˈriːəl ɪsteɪt/', meaning: 'Imobiliária / Imóveis', example: 'She works as a real estate agent.' },
      { id: 'v2', word: 'DEED', emoji: '📜', pron: '/diːd/', meaning: 'Escritura do imóvel', example: 'Here is the deed to your new house!' },
      { id: 'v3', word: 'FOUNDATION', emoji: '🧱', pron: '/faʊnˈdeɪʃn/', meaning: 'Fundação / Alicerce', example: 'Every house starts with a strong foundation.' }
    ],
    expressions: ["Where is my residential lot?", "How can I upgrade my house?", "I want to build a luxury villa!", "How many DRX is the roof upgrade?"],
    dialogues: {
      start: {
        name: 'Victoria (Broker)',
        text: 'Welcome to Prime Real Estate! Every citizen starts with a Residential Lot in the north district. Ready to build your dream house?',
        translation: 'Bem-vindo à Imobiliária Prime! Cada cidadão começa com um Lote Residencial no distrito norte. Pronto para construir a casa dos seus sonhos?',
        options: [
          { label: 'A', text: 'Hi Victoria! How do I upgrade my house from Stage 1 to a Luxury Villa?', next: 'upgrade', missionId: 'm1', keywords: ['upgrade', 'house', 'stage', 'build', 'villa'] }
        ]
      },
      upgrade: {
        name: 'Victoria (Broker)',
        text: 'You can buy upgrade deeds right here in our 3D office or click directly on your lot using your DOVRYX (DRX)!',
        translation: 'Pode comprar escrituras de melhoria aqui mesmo no nosso escritório 3D ou clicar diretamente no seu terreno usando os seus DOVRYX (DRX)!',
        options: [
          { label: 'A', text: 'That is awesome! I will earn DRX and upgrade my house to Stage 5!', next: 'end', missionId: 'm2', keywords: ['awesome', 'drx', 'stage', 'upgrade'] }
        ]
      },
      end: {
        name: 'Victoria (Broker)',
        text: 'Click "Join Live Room" below or use the "🏡 My Lot" button in the 3D City to visit your land anytime! 🏡💎',
        translation: 'Clique em "Join Live Room" abaixo ou use o botão "🏡 My Lot" na Cidade 3D para visitar o seu terreno quando quiser! 🏡💎',
        options: []
      }
    }
  },

  dealership: {
    id: 'dealership',
    name: 'AUTO DEALERSHIP',
    emoji: '🚗',
    description: 'Acquire bicycles, sport motorcycles and electric supercars to drive on the 3D streets!',
    type: 'Life RPG & Vehicles',
    gradient: 'es-gradient-restaurant',
    roles: ['DRIVER', 'CAR DEALER'],
    npcName: 'Max (Dealer)',
    liveCount: 8,
    unlockedDefault: true,
    missions: [
      { id: 'm1', title: 'Compare bicycles, motorcycles and cars', xp: 90 },
      { id: 'm2', title: 'Promise to respect speed bumps & bike lanes', xp: 100 }
    ],
    vocab: [
      { id: 'v1', word: 'DEALERSHIP', emoji: '🚗', pron: '/ˈdiːlərʃɪp/', meaning: 'Concessionária de veículos', example: 'I bought my car at the dealership.' },
      { id: 'v2', word: 'MOTORCYCLE', emoji: '🏍️', pron: '/ˈmoʊtərsaɪkl/', meaning: 'Motocicleta / Moto', example: 'This red sport motorcycle is super fast!' },
      { id: 'v3', word: 'SPEED BUMP', emoji: '⚠️', pron: '/ˈspiːd bʌmp/', meaning: 'Quebra-molas / Lombada', example: 'Slow down before the speed bump!' }
    ],
    expressions: ["How fast is the sport motorcycle?", "I want to buy an electric car.", "I will ride my bike in the bike lane.", "Can I take it for a test drive?"],
    dialogues: {
      start: {
        name: 'Max (Dealer)',
        text: 'Welcome to Turbo Auto Dealership! We have City Bicycles, Sport Motorcycles, and Electric Supercars! What is your dream ride?',
        translation: 'Bem-vindo à Concessionária Turbo Auto! Temos Bicicletas, Motos Desportivas e Supercarros Elétricos! Qual é o veículo dos seus sonhos?',
        options: [
          { label: 'A', text: 'Hi Max! Tell me about the Sport Motorcycle and the Electric Supercar!', next: 'safety', missionId: 'm1', keywords: ['motorcycle', 'car', 'bike', 'fast'] }
        ]
      },
      safety: {
        name: 'Max (Dealer)',
        text: 'The Motorcycle costs 320 DRX and the Supercar is 680 DRX! Just remember to slow down at speed bumps or the Traffic Officer will quiz you!',
        translation: 'A Moto custa 320 DRX e o Supercarro 680 DRX! Lembre-se apenas de abrandar nos quebra-molas ou o Guarda de Trânsito fará um quiz consigo!',
        options: [
          { label: 'A', text: 'I promise to respect the traffic signs, bike lanes, and speed bumps!', next: 'end', missionId: 'm2', keywords: ['respect', 'traffic', 'signs', 'speed', 'promise'] }
        ]
      },
      end: {
        name: 'Max (Dealer)',
        text: 'Step into the 3D Dealership to buy your vehicle and click "🚲 Ride" at the top of the screen to drive! 🚗💨',
        translation: 'Entre na Concessionária 3D para comprar o seu veículo e clique em "🚲 Ride" no topo do ecrã para conduzir! 🚗💨',
        options: []
      }
    }
  },

  building_supply: {
    id: 'building_supply',
    name: 'BUILDING SUPPLY',
    emoji: '🧱',
    description: 'Purchase bricks, timber beams and furniture kits to construct and decorate your house.',
    type: 'Life RPG & Construction',
    gradient: 'es-gradient-shopping',
    roles: ['BUILDER', 'FOREMAN'],
    npcName: 'Bob (Foreman)',
    liveCount: 4,
    unlockedDefault: true,
    missions: [
      { id: 'm1', title: 'Order bricks and timber beams', xp: 85 },
      { id: 'm2', title: 'Choose a furniture kit for your living room', xp: 95 }
    ],
    vocab: [
      { id: 'v1', word: 'BRICKS', emoji: '🧱', pron: '/brɪks/', meaning: 'Tijolos', example: 'We need a pallet of bricks for the walls.' },
      { id: 'v2', word: 'TIMBER', emoji: '🪵', pron: '/ˈtɪmbər/', meaning: 'Madeira de construção / Vigas', example: 'Strong timber beams support the roof.' },
      { id: 'v3', word: 'FURNITURE', emoji: '🛋️', pron: '/ˈfɜːrnɪtʃər/', meaning: 'Mobília / Móveis', example: 'We bought new furniture for the living room.' }
    ],
    expressions: ["I need bricks to build my walls.", "How much is a pallet of timber?", "Do you sell living room furniture?", "Deliver it to my lot, please!"],
    dialogues: {
      start: {
        name: 'Bob (Foreman)',
        text: 'Welcome to Bob Building Supply! Getting materials ready for your house construction?',
        translation: 'Bem-vindo aos Materiais de Construção do Bob! A preparar materiais para a obra da sua casa?',
        options: [
          { label: 'A', text: 'Hi Bob! Yes, I need bricks for the walls and timber beams for the roof!', next: 'furniture', missionId: 'm1', keywords: ['bricks', 'timber', 'walls', 'roof'] }
        ]
      },
      furniture: {
        name: 'Bob (Foreman)',
        text: 'We have heavy-duty brick pallets and timber! Once your roof is ready, we also have a complete House Furniture Kit.',
        translation: 'Temos paletes de tijolos e vigas de madeira! Assim que o telhado estiver pronto, também temos um Kit Completo de Mobília.',
        options: [
          { label: 'A', text: 'Great! I will buy the materials and the furniture kit in the 3D store.', next: 'end', missionId: 'm2', keywords: ['furniture', 'kit', 'materials', 'buy'] }
        ]
      },
      end: {
        name: 'Bob (Foreman)',
        text: 'Hard hats on! Visit our 3D store anytime to stock up on building supplies! 🧱🏗️',
        translation: 'Capacetes colocados! Visite a nossa loja 3D quando quiser para abastecer de materiais! 🧱🏗️',
        options: []
      }
    }
  },

  guild_bau: {
    id: 'guild_bau',
    name: 'GUILD BAÚ DO INGLÊS',
    emoji: '🧙‍♂️',
    description: 'Meet the Master Wizard, learn the secrets of DOVRYX, and step into the Game Room Portal!',
    type: 'Guild & Games',
    gradient: 'es-gradient-job',
    roles: ['APPRENTICE', 'GUILD MASTER'],
    npcName: 'Master Wizard',
    liveCount: 12,
    unlockedDefault: true,
    missions: [
      { id: 'm1', title: 'Greet the Master Wizard of the Guild', xp: 100 },
      { id: 'm2', title: 'Enter the Baú do Inglês Game Room', xp: 120 }
    ],
    vocab: [
      { id: 'v1', word: 'GUILD', emoji: '🛡️', pron: '/ɡɪld/', meaning: 'Guilda / Irmandade de mestres', example: 'Welcome to the Guild of English Masters!' },
      { id: 'v2', word: 'TREASURE CHEST', emoji: '🏴‍☠️', pron: '/ˈtreʒər tʃest/', meaning: 'Baú do tesouro', example: 'Unlock the treasure chest to earn DOVRYX!' },
      { id: 'v3', word: 'PORTAL', emoji: '🌀', pron: '/ˈpɔːrtl/', meaning: 'Portal mágico', example: 'Step through the portal to enter the game room.' }
    ],
    expressions: ["How can I earn more DOVRYX?", "Teach me the secrets of English!", "I am ready to enter the Game Portal!", "I will become an English Legend!"],
    dialogues: {
      start: {
        name: 'Master Wizard 🧙‍♂️',
        text: 'Greetings, young apprentice! Welcome to the Guild of Baú do Inglês. Do you seek wisdom and DOVRYX (DRX) wealth to build your life in the city?',
        translation: 'Saudações, jovem aprendiz! Bem-vindo à Guilda do Baú do Inglês. Procura sabedoria e riqueza em DOVRYX (DRX) para construir a sua vida na cidade?',
        options: [
          { label: 'A', text: 'Greetings, Master Wizard! How can I earn DOVRYX to build my house and buy vehicles?', next: 'portal', missionId: 'm1', keywords: ['earn', 'dovryx', 'drx', 'house', 'master'] }
        ]
      },
      portal: {
        name: 'Master Wizard 🧙‍♂️',
        text: 'Inside our 3D Guild Hall, step into the glowing Purple Portal! It will open the 15 magical games of Baú do Inglês right over the city.',
        translation: 'Dentro do nosso Salão 3D da Guilda, entre no Portal Roxo brilhante! Ele abrirá os 15 jogos mágicos do Baú do Inglês diretamente sobre a cidade.',
        options: [
          { label: 'A', text: 'I am ready, Master! Let us enter the 3D Guild Hall and open the Portal!', next: 'end', missionId: 'm2', keywords: ['ready', 'portal', 'enter', 'guild'] }
        ]
      },
      end: {
        name: 'Master Wizard 🧙‍♂️',
        text: 'May fluency guide your path! Click "🎙️ Join Live 3D City" on the right to meet me inside the Guild Hall! 🧙‍♂️💎✨',
        translation: 'Que a fluência guie o seu caminho! Clique em "🎙️ Join Live 3D City" à direita para encontrar-se comigo dentro do Salão da Guilda! 🧙‍♂️💎✨',
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
      xp: 1250,
      vocab: [],
      unlocked: Object.keys(SPACES_REGISTRY)
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

  getSpacesRegistry() {
    return SPACES_REGISTRY;
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
    return true;
  }

  // ☁️ Sincroniza 100% com o MongoDB (/english-spaces/progress e /workspace/ingles/dados)
  async sincronizarProgressoNuvem() {
    const u = window.Workspace?.usuario;
    if (!u || !u.id || !window.Workspace?.api) return;

    try {
      const escolaId = u.escolaId || 'DEFAULT';
      const [resDados, resSpaces] = await Promise.all([
        window.Workspace.api(`/workspace/ingles/dados?escolaId=${encodeURIComponent(escolaId)}&userId=${encodeURIComponent(u.id)}`, 'GET').catch(() => null),
        fetch(`/api/workspace/english-spaces/progress?userId=${encodeURIComponent(u.id)}`, { credentials: 'include' }).then(r => r.json()).catch(() => null)
      ]);

      if (resDados && resDados.success && resDados.dados) {
        this._statsAlunoCache = resDados.dados.statsAluno || {};
        this._srsCache = resDados.dados.srs || {};
      }

      const drxBau = Number(this._statsAlunoCache?.coins?.bronze) || 0;
      const drxSpaces = Number(resSpaces?.compatibility?.dovryx ?? resSpaces?.compatibility?.xp) || 0;
      const saldoUnificado = Math.max(this.progressData.xp || 0, drxBau, drxSpaces, 500);

      const visitadosNuvem = Array.isArray(resSpaces?.compatibility?.visited) ? resSpaces.compatibility.visited : [];
      const vocabNuvem = Array.isArray(resSpaces?.compatibility?.vocab) ? resSpaces.compatibility.vocab : [];

      this.progressData = {
        xp: saldoUnificado,
        visited: Array.from(new Set([...(this.progressData.visited || []), ...visitadosNuvem])),
        missionsCompleted: Math.max(this.progressData.missionsCompleted || 0, Number(resSpaces?.compatibility?.missionsCompleted) || 0),
        vocab: Array.from(new Set([...(this.progressData.vocab || []), ...vocabNuvem])),
        unlocked: Object.keys(SPACES_REGISTRY)
      };

      if (window.DOVRYX) window.DOVRYX.setBalance(saldoUnificado);
      this.atualizarResumoNoBannerFeed();
    } catch (e) {}
  }

  // 💎 Grava o saldo DOVRYX (DRX) diretamente no MongoDB (/workspace/ingles/xp)
  async salvarProgressoNaRotaOficial(drxAdicional = 0) {
    this.atualizarResumoNoBannerFeed();

    const u = window.Workspace?.usuario;
    if (!u || !u.id || !window.Workspace?.api) return;

    try {
      const stats = this._statsAlunoCache || {};
      const novoSaldoDRX = Math.max(0, Number(this.progressData.xp) || 0);
      const novasCoins = {
        ...(stats.coins || { bronze: 0, prata: 0, ouro: 0 }),
        bronze: novoSaldoDRX
      };
      this._statsAlunoCache = { ...stats, coins: novasCoins };
      if (window.DOVRYX) window.DOVRYX.setBalance(novoSaldoDRX);

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

  async registarMissaoConcluida(spaceId, missionId, drxAmount) {
    const ganho = Number(drxAmount) || 0;
    this.progressData.xp = (this.progressData.xp || 0) + ganho;
    if (missionId !== 'visit') {
      this.progressData.missionsCompleted = (this.progressData.missionsCompleted || 0) + 1;
    }
    if (!this.progressData.visited.includes(spaceId)) {
      this.progressData.visited.push(spaceId);
    }

    const u = window.Workspace?.usuario;
    if (u?.id) {
      fetch('/api/workspace/english-spaces/progress/mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: u.id,
          escolaId: u.escolaId || 'DEFAULT',
          nomeAluno: u.nome || u.login || 'Aluno',
          spaceId,
          level: this.state.level || 'B1',
          missionId,
          xp: ganho
        })
      }).catch(() => {});
    }

    this.mostrarAnimacaoXP(ganho);
    await this.salvarProgressoNaRotaOficial(ganho);
  }

  mostrarAnimacaoXP(amount) {
    const el = document.createElement('div');
    el.textContent = `💎 +${amount} DRX`;
    el.style.cssText = 'position:fixed;bottom:90px;right:24px;background:linear-gradient(90deg,#f59e0b,#d97706);color:#fff;padding:10px 20px;border-radius:999px;font-weight:900;font-size:14px;z-index:999999;box-shadow:0 10px 25px rgba(245,158,11,0.45);transition:all 0.5s ease;';
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(-20px)'; }, 900);
    setTimeout(() => el.remove(), 1400);
  }

  injetarBannerAntesDaImersaoNoFeed() {
    const posicionarBanner = () => {
      const feedSection = document.getElementById('ws-feed-container');
      if (!feedSection) return;

      let banner = document.getElementById('ws-card-english-spaces-feed');
      const totalSpacesCount = Object.keys(SPACES_REGISTRY).length;
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
                ✨ 3D LIFE RPG SIMULATOR • ${totalSpacesCount} SCENARIOS
              </div>
              <h3 style="margin:0 0 5px 0; font-size:20px; font-weight:800; color:#ffffff; display:flex; align-items:center; gap:8px;">
                🌎 English Spaces & 3D City
              </h3>
              <p style="margin:0; font-size:13px; color:#cbd5e1; line-height:1.4;">
                Practice English in 24 real places, earn DOVRYX (DRX), build your house, drive vehicles & visit the Guild!
              </p>
              <div id="ws-es-feed-stats" style="display:flex; gap:12px; margin-top:10px; font-size:11.5px; font-weight:800; color:#fde047;">
                <span>💎 ${(this.progressData.xp || 0).toLocaleString('pt-BR')} DRX</span>
                <span>🌍 ${(this.progressData.visited || []).length}/${totalSpacesCount} Spaces</span>
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
    const totalSpacesCount = Object.keys(SPACES_REGISTRY).length;
    if (el) {
      el.innerHTML = `
        <span>💎 ${(this.progressData.xp || 0).toLocaleString('pt-BR')} DRX</span>
        <span>🌍 ${(this.progressData.visited || []).length}/${totalSpacesCount} Spaces</span>
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
    this.sincronizarProgressoNuvem();
    this.render();
  }

  navigate(view, spaceId = null) {
    this.container = document.getElementById('english-spaces-root');
    if (!this.container) return;

    if (view === 'space' && spaceId) {
      const alvo = SPACES_REGISTRY[spaceId];
      if (!alvo) return;
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
      }, 650);
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
    const totalSpacesCount = Object.keys(SPACES_REGISTRY).length;
    this.container.innerHTML = `
      <div class="es-top-nav">
        <button type="button" class="es-back-btn" id="es-btn-voltar-feed">↩ Voltar ao Feed Principal</button>
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <button type="button" id="es-btn-open-3d-direct" style="background:linear-gradient(135deg,#10b981,#059669); color:#fff; border:none; padding:8px 18px; border-radius:999px; font-weight:900; font-size:13px; cursor:pointer; box-shadow:0 6px 18px rgba(16,185,129,0.35);">
            🏙️ Enter 3D City World
          </button>
          <div class="es-level-pills">
            <span style="font-size:12px; color:#a1a1aa; font-weight:700; margin-right:4px;">CEFR Level:</span>
            ${['A1', 'A2', 'B1', 'B2'].map(lvl => `
              <button type="button" class="es-lvl-btn ${this.state.level === lvl ? 'active' : ''}" data-set-level="${lvl}">${lvl}</button>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="es-home-hero">
        <h1 class="es-display">🌎 ENGLISH SPACES & 3D LIFE RPG</h1>
        <p style="font-size:16px; color:#d4d4d8; margin:6px 0;">Explore 24 real-world establishments, earn DOVRYX (DRX), and build your life in English!</p>
        <span style="font-size:13px; color:#a1a1aa;">Choose any establishment below to practice dialogues or enter the 3D Multiplayer City!</span>
        <div class="es-stats-bar">
          <span class="es-stat-pill" style="border-color:#facc15; color:#fef08a;">💎 ${(p.xp || 0).toLocaleString('pt-BR')} DRX</span>
          <span class="es-stat-pill">🌍 ${(p.visited || []).length}/${totalSpacesCount} Spaces Visited</span>
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

    this.container.querySelector('#es-btn-open-3d-direct')?.addEventListener('click', () => {
      if (window.Workspace?.EnglishSpaces3D) {
        window.Workspace.EnglishSpaces3D.abrirCidade3D(this, 'coffee');
      }
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
    const visitado = (this.progressData.visited || []).includes(space.id);
    return `
      <div class="es-card" data-space="${space.id}">
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
            ENTER SPACE →
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
        <button type="button" class="es-back-btn" id="es-btn-back-map">← All 24 Spaces</button>
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <span class="es-chip" style="font-size:12px; padding:6px 12px; border-color:#facc15; color:#fef08a;">💎 ${(this.progressData.xp || 0).toLocaleString('pt-BR')} DRX</span>
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
            <h4 class="es-panel-title">🏙️ 3D MULTIPLAYER CITY</h4>
            <button type="button" class="es-btn-primary" id="es-join-live" style="width:100%; height:42px; font-size:13px; background:linear-gradient(90deg,#10b981,#059669); color:#fff;">
              🎙️ Enter ${space.name} in 3D City →
            </button>
          </div>

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
                    <span style="font-weight:800; color:#facc15;">+${m.xp} DRX</span>
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

    this.container.querySelector('#es-join-live')?.addEventListener('click', () => {
      if (window.Workspace?.EnglishSpaces3D) {
        window.Workspace.EnglishSpaces3D.abrirCidade3D(this, space.id);
      }
    });

    const freeInput = this.container.querySelector('#es-free-text');
    const sendBtn = this.container.querySelector('#es-send-free');

    const processarRespostaLivre = async () => {
      const texto = (freeInput?.value || '').trim();
      if (!texto) return;
      const lower = texto.toLowerCase();

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

      const u = window.Workspace?.usuario;
      if (u?.id) {
        fetch('/api/workspace/english-spaces/progress/vocab', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ userId: u.id, word: item.word, spaceId: space.id })
        }).catch(() => {});
      }
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
    const drxTotal = Math.max(70, this.state.missionsDone.length * 75);
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
        <div style="font-size:32px; font-weight:900; color:#facc15; margin:20px 0;">💎 +${drxTotal} DRX Earned</div>
        <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
          <button type="button" class="es-btn-primary" id="es-btn-enter-3d-complete" style="padding:0 24px; max-width:240px; background:linear-gradient(90deg,#10b981,#059669); color:#fff;">🏙️ Visit ${sp ? sp.name : 'City'} in 3D</button>
          <button type="button" class="es-btn-primary" id="es-btn-again" style="padding:0 24px; max-width:200px;">🔄 Practice Again</button>
          <button type="button" class="es-btn-primary" id="es-btn-back-all" style="padding:0 24px; max-width:220px; background:linear-gradient(90deg,#8b5cf6,#d946ef); color:#fff;">🌎 All 24 Spaces</button>
        </div>
      </div>
    `;
    this.container.querySelector('#es-btn-enter-3d-complete')?.addEventListener('click', () => {
      if (window.Workspace?.EnglishSpaces3D && sp) {
        window.Workspace.EnglishSpaces3D.abrirCidade3D(this, sp.id);
      }
    });
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
      #ws-english-spaces-container .es-home-hero h1 { font-size: 32px; margin: 0; color: #fff; }
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