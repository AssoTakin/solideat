// Données virtuelles pour le développement et les tests
// Ces données permettent d'avoir une expérience réaliste sans backend

export const mockUsers = [
  {
    id: '1',
    username: 'MarieCuisine',
    email: 'marie@example.com',
    firstName: 'Marie',
    lastName: 'Dupont',
    profilePhoto: 'https://i.pravatar.cc/150?img=47',
    globalRating: 4.8,
    addressCity: 'Paris',
    badges: [
      { id: '1', name: 'Cordon Bleu', description: '10 repas servis', icon: '👨‍🍳' },
      { id: '2', name: 'Héros anti-gaspillage', description: '5 repas sauvés', icon: '🦸' },
    ],
    mealsServed: 24,
    mealsReceived: 12,
    description: 'Cuisinière passionnée, j\'aime partager mes créations et lutter contre le gaspillage alimentaire.',
    culinaryStyle: 'Cuisine française traditionnelle',
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    username: 'ChefMarco',
    email: 'marco@example.com',
    firstName: 'Marco',
    lastName: 'Rossi',
    profilePhoto: 'https://i.pravatar.cc/150?img=33',
    globalRating: 4.9,
    addressCity: 'Paris',
    badges: [
      { id: '1', name: 'Cordon Bleu', description: '10 repas servis', icon: '👨‍🍳' },
      { id: '3', name: 'Étoile montante', description: 'Note moyenne > 4.5', icon: '⭐' },
    ],
    mealsServed: 45,
    mealsReceived: 8,
    description: 'Chef amateur spécialisé dans la cuisine italienne et méditerranéenne.',
    culinaryStyle: 'Cuisine italienne',
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    username: 'SarahL',
    email: 'sarah@example.com',
    firstName: 'Sarah',
    lastName: 'Martin',
    profilePhoto: 'https://i.pravatar.cc/150?img=20',
    globalRating: 4.7,
    addressCity: 'Paris',
    badges: [
      { id: '2', name: 'Héros anti-gaspillage', description: '5 repas sauvés', icon: '🦸' },
    ],
    mealsServed: 18,
    mealsReceived: 15,
    description: 'Adepte de la cuisine healthy et équilibrée. Je privilégie les produits frais et de saison.',
    culinaryStyle: 'Cuisine healthy',
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    username: 'Thomas',
    email: 'thomas@example.com',
    firstName: 'Thomas',
    lastName: 'Bernard',
    profilePhoto: 'https://i.pravatar.cc/150?img=12',
    globalRating: 4.2,
    addressCity: 'Paris',
    badges: [],
    mealsServed: 0,
    mealsReceived: 8,
    description: 'Passionné de cuisine et de partage. J\'adore découvrir de nouvelles saveurs !',
    culinaryStyle: 'Cuisine du monde',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockMeals = [
  {
    id: '1',
    name: 'Lasagnes aux légumes',
    photo: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&q=80',
    description: 'Lasagnes maison aux légumes de saison, préparées avec amour ce matin. Riches en saveurs et en couleurs !',
    cook: mockUsers[0],
    preparationDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Il y a 2h
    serviceDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Demain
    pickupTimeStart: new Date(Date.now() + 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000).toISOString(), // Demain 14h
    pickupTimeEnd: new Date(Date.now() + 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000).toISOString(), // Demain 16h
    pickupAddress: '123 Rue de la Paix, 75001 Paris',
    pickupLatitude: 48.8566,
    pickupLongitude: 2.3522,
    distance: 2.5,
    ingredients: [
      { name: 'Pâtes lasagnes', allergens: ['gluten'] },
      { name: 'Aubergines', allergens: [] },
      { name: 'Courgettes', allergens: [] },
      { name: 'Fromage (lactose)', allergens: ['lactose'] },
      { name: 'Basilic', allergens: [] },
      { name: 'Origan', allergens: [] },
    ],
    portions: 2,
    price: null,
    status: 'AVAILABLE',
    expirationDate: new Date(Date.now() + 70 * 60 * 60 * 1000).toISOString(), // Dans 70h
  },
  {
    id: '2',
    name: 'Curry de légumes',
    photo: 'https://images.unsplash.com/photo-1563379091339-03246963d96a?w=800&q=80',
    description: 'Curry végétarien aux légumes frais, épicé à souhait. Parfait pour un repas équilibré et savoureux.',
    cook: mockUsers[2],
    preparationDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // Il y a 4h
    serviceDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // Dans 12h
    pickupTimeStart: new Date(Date.now() + 12 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000).toISOString(), // Ce soir 19h
    pickupTimeEnd: new Date(Date.now() + 12 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000).toISOString(), // Ce soir 20h
    pickupAddress: '45 Avenue des Champs-Élysées, 75008 Paris',
    pickupLatitude: 48.8698,
    pickupLongitude: 2.3083,
    distance: 0.5,
    ingredients: [
      { name: 'Légumes de saison', allergens: [] },
      { name: 'Lait de coco', allergens: [] },
      { name: 'Curry', allergens: [] },
      { name: 'Riz basmati', allergens: [] },
    ],
    portions: 1,
    price: null,
    status: 'AVAILABLE',
    expirationDate: new Date(Date.now() + 68 * 60 * 60 * 1000).toISOString(), // Dans 68h
  },
  {
    id: '3',
    name: 'Pâtes Méditerranéennes',
    photo: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
    description: 'Pâtes fraîches aux tomates cerises, basilic et parmesan. Un classique de la cuisine italienne !',
    cook: mockUsers[1],
    preparationDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // Il y a 6h
    serviceDate: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // Dans 8h
    pickupTimeStart: new Date(Date.now() + 8 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000).toISOString(), // Aujourd'hui 12h
    pickupTimeEnd: new Date(Date.now() + 8 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000).toISOString(), // Aujourd'hui 13h
    pickupAddress: '78 Rue de Rivoli, 75004 Paris',
    pickupLatitude: 48.8606,
    pickupLongitude: 2.3376,
    distance: 1.2,
    ingredients: [
      { name: 'Pâtes', allergens: ['gluten'] },
      { name: 'Tomates cerises', allergens: [] },
      { name: 'Basilic', allergens: [] },
      { name: 'Parmesan', allergens: ['lactose'] },
      { name: 'Ail', allergens: [] },
    ],
    portions: 3,
    price: 5,
    status: 'AVAILABLE',
    expirationDate: new Date(Date.now() + 66 * 60 * 60 * 1000).toISOString(), // Dans 66h
  },
  {
    id: '4',
    name: 'Burger de bœuf Gourmet',
    photo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    description: 'Burger maison avec steak de bœuf, fromage, salade, tomate et sauce spéciale. Servi avec frites maison.',
    cook: mockUsers[1],
    preparationDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // Il y a 1h
    serviceDate: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // Dans 6h
    pickupTimeStart: new Date(Date.now() + 6 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000).toISOString(), // Ce soir 19h
    pickupTimeEnd: new Date(Date.now() + 6 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000).toISOString(), // Ce soir 19h (fixe)
    pickupAddress: '12 Boulevard Saint-Germain, 75005 Paris',
    pickupLatitude: 48.8534,
    pickupLongitude: 2.3488,
    distance: 1.5,
    ingredients: [
      { name: 'Pain à burger', allergens: ['gluten'] },
      { name: 'Steak de bœuf', allergens: [] },
      { name: 'Fromage', allergens: ['lactose'] },
      { name: 'Salade', allergens: [] },
      { name: 'Tomate', allergens: [] },
      { name: 'Frites', allergens: [] },
    ],
    portions: 1,
    price: null,
    status: 'AVAILABLE',
    expirationDate: new Date(Date.now() + 71 * 60 * 60 * 1000).toISOString(), // Dans 71h
  },
  {
    id: '5',
    name: 'Salmon Poke Bowl',
    photo: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&q=80',
    description: 'Poke bowl frais au saumon, avocat, edamame et riz. Un repas healthy et délicieux !',
    cook: mockUsers[2],
    preparationDate: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // Il y a 3h
    serviceDate: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(), // Dans 10h
    pickupTimeStart: new Date(Date.now() + 10 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000).toISOString(), // Demain 12h
    pickupTimeEnd: new Date(Date.now() + 10 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000).toISOString(), // Demain 13h
    pickupAddress: '56 Rue du Faubourg Saint-Antoine, 75011 Paris',
    pickupLatitude: 48.8522,
    pickupLongitude: 2.3697,
    distance: 3.2,
    ingredients: [
      { name: 'Saumon frais', allergens: ['poisson'] },
      { name: 'Riz', allergens: [] },
      { name: 'Avocat', allergens: [] },
      { name: 'Edamame', allergens: [] },
      { name: 'Algues', allergens: [] },
      { name: 'Sésame', allergens: ['sésame'] },
    ],
    portions: 2,
    price: 8,
    status: 'AVAILABLE',
    expirationDate: new Date(Date.now() + 69 * 60 * 60 * 1000).toISOString(), // Dans 69h
  },
  {
    id: '6',
    name: 'Tarte aux pommes',
    photo: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=800&q=80',
    description: 'Tarte aux pommes maison, pâte brisée faite main. Un dessert réconfortant et gourmand !',
    cook: mockUsers[0],
    preparationDate: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), // Il y a 20h
    serviceDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // Dans 4h
    pickupTimeStart: new Date(Date.now() + 4 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000).toISOString(), // Aujourd'hui 14h
    pickupTimeEnd: new Date(Date.now() + 4 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000).toISOString(), // Aujourd'hui 16h
    pickupAddress: '123 Rue de la Paix, 75001 Paris',
    pickupLatitude: 48.8566,
    pickupLongitude: 2.3522,
    distance: 2.5,
    ingredients: [
      { name: 'Pommes', allergens: [] },
      { name: 'Pâte brisée', allergens: ['gluten', 'œufs'] },
      { name: 'Sucre', allergens: [] },
      { name: 'Beurre', allergens: ['lactose'] },
    ],
    portions: 1,
    price: null,
    status: 'AVAILABLE',
    expirationDate: new Date(Date.now() + 52 * 60 * 60 * 1000).toISOString(), // Dans 52h (expire bientôt - Sauvez-les)
  },
  {
    id: '7',
    name: 'Wrap au Poulet',
    photo: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80',
    description: 'Wrap au poulet grillé, salade, tomate et sauce au yaourt. Parfait pour un repas sur le pouce !',
    cook: mockUsers[1],
    preparationDate: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // Il y a 18h
    serviceDate: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // Dans 6h
    pickupTimeStart: new Date(Date.now() + 6 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000).toISOString(), // Aujourd'hui 12h
    pickupTimeEnd: new Date(Date.now() + 6 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000).toISOString(), // Aujourd'hui 13h
    pickupAddress: '12 Boulevard Saint-Germain, 75005 Paris',
    pickupLatitude: 48.8534,
    pickupLongitude: 2.3488,
    distance: 0.8,
    ingredients: [
      { name: 'Tortilla', allergens: ['gluten'] },
      { name: 'Poulet grillé', allergens: [] },
      { name: 'Salade', allergens: [] },
      { name: 'Tomate', allergens: [] },
      { name: 'Sauce au yaourt', allergens: ['lactose'] },
    ],
    portions: 1,
    price: null,
    status: 'AVAILABLE',
    expirationDate: new Date(Date.now() + 54 * 60 * 60 * 1000).toISOString(), // Dans 54h (expire bientôt - Sauvez-les)
  },
];

// Repas "Sauvez-les" (expirent dans moins de 24h)
export const mockSaveThemMeals = mockMeals.filter((meal) => {
  const expiration = new Date(meal.expirationDate);
  const now = new Date();
  const hoursRemaining = (expiration.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursRemaining > 0 && hoursRemaining <= 24;
});

export const mockReviews = [
  {
    id: '1',
    mealId: '1',
    reviewerId: '4',
    cookId: '1',
    rating: 5,
    comment: 'Excellent ! Les lasagnes étaient délicieuses et généreuses. Je recommande vivement !',
    photos: [],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    reviewer: mockUsers[3],
    meal: mockMeals[0],
  },
  {
    id: '2',
    mealId: '2',
    reviewerId: '4',
    cookId: '3',
    rating: 4,
    comment: 'Très bon curry, bien épicé. Le riz était parfait. Merci !',
    photos: [],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    reviewer: mockUsers[3],
    meal: mockMeals[1],
  },
  {
    id: '3',
    mealId: '3',
    reviewerId: '4',
    cookId: '2',
    rating: 5,
    comment: 'La meilleure lasagne que j\'ai mangée depuis des années ! Tellement fraîche et savoureuse.',
    photos: [],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    reviewer: mockUsers[3],
    meal: mockMeals[2],
  },
  {
    id: '4',
    mealId: '4',
    reviewerId: '3',
    cookId: '2',
    rating: 5,
    comment: 'Burger parfait, les frites étaient excellentes. Un vrai régal !',
    photos: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    reviewer: mockUsers[2],
    meal: mockMeals[3],
  },
];

export const mockBadges = [
  {
    id: '1',
    name: 'Cordon Bleu',
    description: 'Vous avez servi 10 repas',
    icon: '👨‍🍳',
    earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    name: 'Héros anti-gaspillage',
    description: 'Vous avez sauvé 5 repas',
    icon: '🦸',
    earnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    name: 'Étoile montante',
    description: 'Note moyenne supérieure à 4.5',
    icon: '⭐',
    earnedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    name: 'Premier pas',
    description: 'Premier repas servi',
    icon: '🎯',
    earnedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    name: 'Gourmet',
    description: '20 repas servis',
    icon: '🍽️',
    earnedAt: null, // Pas encore débloqué
  },
];

export const mockReservations = [
  {
    id: '1',
    mealId: '1',
    userId: '4',
    reservedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    pickedUpAt: null,
    cancelledAt: null,
    cancellationReason: null,
    meal: {
      ...mockMeals[0],
      cook: mockUsers[0],
      status: 'RESERVED',
    },
  },
  {
    id: '2',
    mealId: '3',
    userId: '4',
    reservedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    pickedUpAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    cancelledAt: null,
    cancellationReason: null,
    meal: {
      ...mockMeals[2],
      cook: mockUsers[1],
      status: 'SERVED',
    },
  },
];

export const mockNotifications = [
  {
    id: '1',
    type: 'RESERVATION',
    title: 'Nouvelle réservation !',
    message: 'Votre repas "Lasagnes aux légumes" a été réservé par @Thomas',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    mealId: '1',
  },
  {
    id: '2',
    type: 'SAVE_THEM',
    title: '🆘 Repas à sauver !',
    message: '3 repas expirent bientôt près de chez vous. Aidez à réduire le gaspillage !',
    read: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'REVIEW',
    title: 'Nouvel avis reçu',
    message: '@Thomas a laissé un avis 5 étoiles sur votre repas "Lasagnes aux légumes"',
    read: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    mealId: '1',
  },
  {
    id: '4',
    type: 'MEAL_EXPIRING',
    title: 'Repas qui expire bientôt',
    message: 'Votre repas "Tarte aux pommes" expire dans 24h. Pensez à le proposer dans "Sauvez-les" !',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    mealId: '6',
  },
];

export const mockDashboardStats = {
  activity: {
    mealsProposed: {
      available: 2,
      reserved: 1,
    },
    mealsReserved: {
      reserved: 1,
      upcoming: 1,
    },
    mealsPendingReview: 0,
  },
  history: {
    mealsServed: 12,
    mealsReceived: 8,
    mealsExpired: 2,
    mealsCancelled: 1,
  },
  personal: {
    globalRating: 4.2,
    mealsServed: 12,
    mealsReceived: 8,
    bonusDonorsAvailable: 0,
    badges: [
      { id: '1', name: 'Cordon Bleu', description: '10 repas servis', icon: '👨‍🍳', earnedAt: new Date().toISOString() },
    ],
    registrationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  premium: {
    mealsSaved: 5,
    co2Avoided: 12.5,
    monthlyImpact: {
      mealsSaved: 3,
      co2Avoided: 7.5,
    },
    yearlyImpact: {
      mealsSaved: 5,
      co2Avoided: 12.5,
    },
  },
  quotas: {
    weekly: {
      reservations: { current: 1, limit: 1 },
      proposals: { current: 0, limit: 1 },
    },
    monthly: {
      cancellations: { current: 0, limit: 1, isReduced: false },
      notPickedUp: { current: 0, limit: 4, isReduced: false },
    },
    sanctions: {
      reservationBlocked: false,
      cancellationBlocked: false,
      activeSanctions: [],
    },
  },
};

// Conversations mockées
export const mockConversations = [
  {
    id: '1',
    mealId: '1',
    meal: mockMeals[0],
    otherUser: mockUsers[0],
    lastMessage: {
      id: '1',
      content: 'Bonjour, pouvez-vous me confirmer l\'adresse exacte de récupération ?',
      senderId: '4',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    unreadCount: 1,
  },
  {
    id: '2',
    mealId: '3',
    meal: mockMeals[2],
    otherUser: mockUsers[1],
    lastMessage: {
      id: '2',
      content: 'Merci pour le repas, c\'était délicieux !',
      senderId: '2',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    unreadCount: 0,
  },
];

export const mockMessages = [
  {
    id: '1',
    conversationId: '1',
    senderId: '4',
    content: 'Bonjour, pouvez-vous me confirmer l\'adresse exacte de récupération ?',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    sender: mockUsers[3],
  },
  {
    id: '2',
    conversationId: '1',
    senderId: '1',
    content: 'Bien sûr ! C\'est au 123 Rue de la Paix, 75001 Paris. Vous pouvez sonner à l\'interphone.',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    sender: mockUsers[0],
  },
  {
    id: '3',
    conversationId: '1',
    senderId: '4',
    content: 'Parfait, merci beaucoup ! Je passerai vers 15h.',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    sender: mockUsers[3],
  },
];

// Plans d'abonnement mockés
export const mockSubscriptionPlans = [
  {
    id: 'monthly',
    name: 'Premium Mensuel',
    price: 9.99,
    period: 'month' as const,
    pricePerMonth: 9.99,
    features: [
      'Quotas illimités (réservations et propositions)',
      'Filtres avancés de recherche',
      'Statistiques d\'impact environnemental',
      'Accès prioritaire à "Sauvez-les"',
      'Jusqu\'à 4 parts par repas',
      'Changement d\'adresse illimité',
      'Masquer son numéro de téléphone',
    ],
    savings: 0,
  },
  {
    id: 'yearly',
    name: 'Premium Annuel',
    price: 99.99,
    period: 'year' as const,
    pricePerMonth: 8.33,
    features: [
      'Tous les avantages Premium Mensuel',
      'Économisez 20€ par an',
      'Support prioritaire',
      'Badges exclusifs',
    ],
    savings: 20,
  },
];

// Mode développement : utiliser les données mockées
export const USE_MOCK_DATA = import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_DATA === 'true';
