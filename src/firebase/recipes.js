// ===================================
// RECIPE GENERATION SERVICE
// ===================================

import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from './config';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export const generateRecipe = async ({
  ingredients,
  mealType,
  difficulty,
  maxTime,
  restrictions = [],
  healthConditions = [],
  targetCalories
}) => {
  try {
    const mealTypeNames = {
      breakfast: 'café da manhã',
      lunch: 'almoço',
      snack: 'lanche',
      dinner: 'jantar'
    };

    const difficultyNames = {
      easy: 'fácil',
      medium: 'médio',
      hard: 'difícil'
    };

    const restrictionsText = restrictions.length > 0 
      ? `\nRestrições alimentares: ${restrictions.join(', ')}`
      : '';

    const healthConditionsText = healthConditions.length > 0
      ? `\nCondições de saúde para considerar: ${healthConditions.join(', ')}`
      : '';

    const caloriesText = targetCalories
      ? `\nCalorias alvo por refeição: aproximadamente ${Math.round(targetCalories / 4)} kcal`
      : '';

    const prompt = `Você é um chef profissional e nutricionista especializado em criar receitas saudáveis e personalizadas.

Crie uma receita de ${mealTypeNames[mealType]} usando os seguintes ingredientes disponíveis: ${ingredients}

Requisitos:
- Dificuldade: ${difficultyNames[difficulty]}
- Tempo máximo de preparo: ${maxTime} minutos
${restrictionsText}
${healthConditionsText}
${caloriesText}

IMPORTANTE: Responda APENAS com um JSON válido (sem markdown, sem \`\`\`json), no seguinte formato:

{
  "name": "Nome da Receita",
  "prepTime": 30,
  "difficulty": "${difficulty}",
  "calories": 450,
  "protein": 30,
  "carbs": 40,
  "fat": 15,
  "ingredients": [
    "200g de frango",
    "1 xícara de arroz",
    "2 dentes de alho"
  ],
  "instructions": [
    "Passo 1: Tempere o frango com sal e pimenta",
    "Passo 2: Refogue o alho no azeite",
    "Passo 3: Adicione o frango e doure"
  ],
  "tips": "Dica opcional para melhorar a receita"
}

Regras importantes:
1. Use APENAS os ingredientes listados ou substitutos comuns
2. Respeite todas as restrições alimentares
3. Mantenha o tempo de preparo dentro do limite
4. Calcule valores nutricionais realistas
5. Seja criativo mas prático
6. Instruções claras e detalhadas`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Erro na API do Gemini');
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Resposta inválida da API');
    }

    let recipeText = data.candidates[0].content.parts[0].text.trim();
    
    // Remove markdown code blocks se existirem
    recipeText = recipeText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const recipe = JSON.parse(recipeText);

    // Validar estrutura
    if (!recipe.name || !recipe.ingredients || !recipe.instructions) {
      throw new Error('Receita incompleta gerada pela IA');
    }

    return {
      success: true,
      recipe
    };

  } catch (error) {
    console.error('Error generating recipe:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Salvar receita favorita no Firestore
export const saveFavoriteRecipe = async (userId, recipe) => {
  try {
    const favoritesRef = collection(db, `users/${userId}/favoriteRecipes`);
    await addDoc(favoritesRef, {
      ...recipe,
      savedAt: new Date()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error saving favorite recipe:', error);
    return { success: false, error: error.message };
  }
};

// Buscar receitas favoritas
export const getFavoriteRecipes = async (userId) => {
  try {
    const favoritesRef = collection(db, `users/${userId}/favoriteRecipes`);
    const q = query(favoritesRef, orderBy('savedAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const recipes = [];
    snapshot.forEach(doc => {
      recipes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, recipes };
  } catch (error) {
    console.error('Error getting favorite recipes:', error);
    return { success: true, recipes: [] }; // Retorna array vazio em caso de erro
  }
};

// Remover receita favorita
export const deleteFavoriteRecipe = async (userId, recipeId) => {
  try {
    const recipeRef = doc(db, `users/${userId}/favoriteRecipes/${recipeId}`);
    await deleteDoc(recipeRef);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting favorite recipe:', error);
    return { success: false, error: error.message };
  }
};
