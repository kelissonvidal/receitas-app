// ===================================
// FOOD DIARY SERVICE
// ===================================

import { doc, setDoc, getDoc, updateDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from './config';

// ===================================
// FUNÇÃO PARA OBTER DATA LOCAL (BRASÍLIA)
// ===================================
const getLocalDateString = () => {
  const now = new Date();
  // Usar timezone de Brasília (America/Sao_Paulo)
  const options = { 
    timeZone: 'America/Sao_Paulo', 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  };
  const parts = now.toLocaleDateString('pt-BR', options).split('/');
  // Retorna no formato YYYY-MM-DD (ex: 2026-01-24)
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

// ===================================
// REGISTRAR REFEIÇÃO POR TEXTO
// ===================================
export const addMealByText = async (userId, mealData) => {
  try {
    const { 
      description, 
      type,
      // Dados manuais (quando vem de foto)
      manualCalories,
      manualProtein,
      manualCarbs,
      manualFat,
      photoUrl,
      foods,
      analyzedAt
    } = mealData;
    
    let nutritionData;
    
    // Se tem dados manuais (foto), usa eles
    if (manualCalories !== undefined) {
      nutritionData = {
        foods: foods || [],
        totalCalories: manualCalories,
        totalProtein: manualProtein,
        totalCarbs: manualCarbs,
        totalFat: manualFat
      };
    } else {
      // Usar Gemini para analisar texto e extrair informações nutricionais
      const analysisPrompt = `Analise esta refeição e retorne APENAS um JSON válido com as informações nutricionais:

Refeição: "${description}"

Retorne no formato:
{
  "foods": [
    {
      "name": "nome do alimento",
      "quantity": "quantidade estimada",
      "calories": número,
      "protein": número em gramas,
      "carbs": número em gramas,
      "fat": número em gramas
    }
  ],
  "totalCalories": soma total,
  "totalProtein": soma total,
  "totalCarbs": soma total,
  "totalFat": soma total
}

Seja preciso nas estimativas. Use valores médios de porções comuns.`;

      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!GEMINI_API_KEY) {
        throw new Error('API Key do Gemini não configurada');
      }
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: analysisPrompt }] }]
          })
        }
      );

      const data = await response.json();
      
      // Verificar se há erro na resposta
      if (!response.ok) {
        console.error('Gemini API error:', data);
        throw new Error(data.error?.message || 'Erro ao comunicar com IA');
      }
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error('Invalid Gemini response:', data);
        throw new Error('Resposta inválida da IA');
      }
      
      const analysisText = data.candidates[0].content.parts[0].text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      
      nutritionData = JSON.parse(analysisText);
    }
    
    // Criar entrada no diário
    const today = getLocalDateString(); // Data no fuso horário de Brasília
    const mealId = `meal_${Date.now()}`;
    
    const meal = {
      id: mealId,
      type,
      time: new Date(),
      description,
      method: photoUrl ? 'photo' : 'text',
      foods: nutritionData.foods,
      totalCalories: nutritionData.totalCalories,
      totalProtein: nutritionData.totalProtein,
      totalCarbs: nutritionData.totalCarbs,
      totalFat: nutritionData.totalFat,
      ...(photoUrl && { photoUrl }),
      ...(analyzedAt && { analyzedAt })
    };
    
    // Buscar diário do dia ou criar novo
    const diaryRef = doc(db, 'users', userId, 'diary', today);
    const diaryDoc = await getDoc(diaryRef);
    
    if (diaryDoc.exists()) {
      // Adicionar refeição ao array existente
      const currentData = diaryDoc.data();
      const updatedMeals = [...currentData.meals, meal];
      
      // Recalcular summary
      const summary = calculateDaySummary(updatedMeals);
      
      await updateDoc(diaryRef, {
        meals: updatedMeals,
        summary
      });
    } else {
      // Criar novo documento do dia
      const summary = calculateDaySummary([meal]);
      
      await setDoc(diaryRef, {
        date: today,
        meals: [meal],
        summary
      });
    }
    
    return { success: true, meal, nutritionData };
  } catch (error) {
    console.error('Error adding meal:', error);
    return { success: false, error: error.message };
  }
};

// ===================================
// CALCULAR RESUMO DO DIA
// ===================================
const calculateDaySummary = (meals) => {
  const totalCalories = meals.reduce((sum, meal) => sum + meal.totalCalories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.totalProtein, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.totalCarbs, 0);
  const totalFat = meals.reduce((sum, meal) => sum + meal.totalFat, 0);
  
  return {
    totalCalories: Math.round(totalCalories),
    totalProtein: Math.round(totalProtein),
    totalCarbs: Math.round(totalCarbs),
    totalFat: Math.round(totalFat),
    mealsCount: meals.length
  };
};

// ===================================
// GET DIARY BY DATE
// ===================================
export const getDiaryByDate = async (userId, date) => {
  try {
    const diaryRef = doc(db, 'users', userId, 'diary', date);
    const diaryDoc = await getDoc(diaryRef);
    
    if (diaryDoc.exists()) {
      return { success: true, diary: diaryDoc.data() };
    }
    
    // Retornar diário vazio se não existir
    return {
      success: true,
      diary: {
        date,
        meals: [],
        summary: {
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          mealsCount: 0
        }
      }
    };
  } catch (error) {
    console.error('Error getting diary:', error);
    return { success: false, error: error.message };
  }
};

// ===================================
// GET TODAY'S DIARY
// ===================================
export const getTodayDiary = async (userId) => {
  const today = getLocalDateString(); // Data no fuso horário de Brasília
  return getDiaryByDate(userId, today);
};

// ===================================
// CALCULATE DEFICIT/SURPLUS
// ===================================
export const calculateDeficitSurplus = async (userId, date = null) => {
  try {
    // Get user profile for target calories
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const profile = userDoc.data().profile;
    if (!profile || !profile.calculated) {
      throw new Error('Profile not configured');
    }
    
    const targetCalories = profile.calculated.targetCalories;
    
    // Get diary for specified date or today
    const targetDate = date || getLocalDateString(); // Data no fuso horário de Brasília
    const diaryResult = await getDiaryByDate(userId, targetDate);
    
    if (!diaryResult.success) {
      throw new Error(diaryResult.error);
    }
    
    const consumedCalories = diaryResult.diary.summary.totalCalories;
    const difference = consumedCalories - targetCalories;
    
    return {
      success: true,
      result: {
        targetCalories,
        consumedCalories,
        difference,
        status: difference > 0 ? 'surplus' : difference < 0 ? 'deficit' : 'balanced',
        percentage: Math.round((consumedCalories / targetCalories) * 100)
      }
    };
  } catch (error) {
    console.error('Error calculating deficit/surplus:', error);
    return { success: false, error: error.message };
  }
};

// ===================================
// DELETE MEAL
// ===================================
export const deleteMeal = async (userId, date, mealId) => {
  try {
    const diaryRef = doc(db, 'users', userId, 'diary', date);
    const diaryDoc = await getDoc(diaryRef);
    
    if (!diaryDoc.exists()) {
      throw new Error('Diary not found');
    }
    
    const currentData = diaryDoc.data();
    const updatedMeals = currentData.meals.filter(meal => meal.id !== mealId);
    
    // Recalcular summary
    const summary = calculateDaySummary(updatedMeals);
    
    await updateDoc(diaryRef, {
      meals: updatedMeals,
      summary
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting meal:', error);
    return { success: false, error: error.message };
  }
};

// ===================================
// GET WEEK SUMMARY
// ===================================
export const getWeekSummary = async (userId) => {
  try {
    const today = new Date();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const diaryResult = await getDiaryByDate(userId, dateStr);
      weekData.push({
        date: dateStr,
        ...diaryResult.diary.summary
      });
    }
    
    return { success: true, weekData };
  } catch (error) {
    console.error('Error getting week summary:', error);
    return { success: false, error: error.message };
  }
};
