// ===================================
// MEAL TYPES CONFIGURATION
// ===================================

export const MEAL_TYPES = {
  breakfast: {
    id: 'breakfast',
    name: 'Café da Manhã',
    icon: '☕',
    category: 'main',
    defaultTime: '07:00',
    description: 'Primeira refeição do dia'
  },
  morning_snack: {
    id: 'morning_snack',
    name: 'Lanche da Manhã',
    icon: '🍎',
    category: 'snack',
    defaultTime: '10:00',
    description: 'Entre café e almoço'
  },
  pre_workout: {
    id: 'pre_workout',
    name: 'Pré-Treino',
    icon: '💪',
    category: 'workout',
    defaultTime: '07:30',
    description: '30-45 min antes do treino'
  },
  lunch: {
    id: 'lunch',
    name: 'Almoço',
    icon: '🍱',
    category: 'main',
    defaultTime: '12:00',
    description: 'Refeição principal'
  },
  post_workout: {
    id: 'post_workout',
    name: 'Pós-Treino',
    icon: '💪',
    category: 'workout',
    defaultTime: '09:00',
    description: 'Logo após o treino'
  },
  afternoon_snack: {
    id: 'afternoon_snack',
    name: 'Lanche da Tarde',
    icon: '🍪',
    category: 'snack',
    defaultTime: '16:00',
    description: 'Entre almoço e jantar'
  },
  dinner: {
    id: 'dinner',
    name: 'Jantar',
    icon: '🍽️',
    category: 'main',
    defaultTime: '19:00',
    description: 'Última refeição principal'
  },
  supper: {
    id: 'supper',
    name: 'Ceia',
    icon: '🌙',
    category: 'snack',
    defaultTime: '22:00',
    description: 'Antes de dormir'
  },
  supplement: {
    id: 'supplement',
    name: 'Suplemento',
    icon: '💊',
    category: 'supplement',
    defaultTime: null,
    description: 'Suplemento avulso'
  }
};

export const MEAL_CATEGORIES = {
  main: { name: 'Refeições Principais', order: 1 },
  snack: { name: 'Lanches', order: 2 },
  workout: { name: 'Treino', order: 3 },
  supplement: { name: 'Suplementos', order: 4 }
};

export const getMealTypesByCategory = () => {
  const grouped = {};
  
  Object.keys(MEAL_CATEGORIES).forEach(category => {
    grouped[category] = Object.values(MEAL_TYPES).filter(
      type => type.category === category
    );
  });
  
  return grouped;
};

export const getMealTypeName = (mealTypeId) => {
  return MEAL_TYPES[mealTypeId]?.name || mealTypeId;
};

export const getMealTypeIcon = (mealTypeId) => {
  return MEAL_TYPES[mealTypeId]?.icon || '🍽️';
};
