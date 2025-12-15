// ===================================
// USER PROFILE SERVICE
// ===================================

import { doc, setDoc, getDoc, updateDoc, collection, query, orderBy, limit as limitQuery, getDocs } from 'firebase/firestore';
import { db } from './config';

// ===================================
// CÁLCULOS NUTRICIONAIS
// ===================================

/**
 * Calcula IMC (Índice de Massa Corporal)
 * IMC = peso (kg) / altura² (m)
 */
export const calculateIMC = (weight, height) => {
  const heightInMeters = height / 100;
  const imc = weight / (heightInMeters * heightInMeters);
  return parseFloat(imc.toFixed(2));
};

/**
 * Calcula TMB (Taxa Metabólica Basal) - Harris-Benedict
 * Homens: TMB = 88,362 + (13,397 × peso) + (4,799 × altura) - (5,677 × idade)
 * Mulheres: TMB = 447,593 + (9,247 × peso) + (3,098 × altura) - (4,330 × idade)
 */
export const calculateTMB = (weight, height, age, sex) => {
  let tmb;
  if (sex === 'M') {
    tmb = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    tmb = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
  return Math.round(tmb);
};

/**
 * Calcula GET (Gasto Energético Total)
 * GET = TMB × Fator de Atividade
 */
export const calculateGET = (tmb, activityLevel) => {
  const factors = {
    sedentario: 1.2,      // Pouco ou nenhum exercício
    leve: 1.375,          // Exercício leve 1-3 dias/semana
    moderado: 1.55,       // Exercício moderado 3-5 dias/semana
    intenso: 1.725,       // Exercício intenso 6-7 dias/semana
    muito_intenso: 1.9    // Exercício muito intenso, atletas
  };
  
  const get = tmb * (factors[activityLevel] || 1.2);
  return Math.round(get);
};

/**
 * Calcula calorias alvo baseado no objetivo
 * - Perder peso: -500 kcal/dia (déficit moderado)
 * - Manter peso: GET (manutenção)
 * - Ganhar peso: +300 kcal/dia (superávit controlado)
 */
export const calculateTargetCalories = (get, goal) => {
  switch (goal) {
    case 'perder':
      return Math.round(get - 500); // Déficit de ~0,5kg/semana
    case 'manter':
      return get;
    case 'ganhar':
      return Math.round(get + 300); // Ganho controlado
    default:
      return get;
  }
};

/**
 * Calcula distribuição de macronutrientes
 * Proteínas: 2g por kg de peso
 * Gorduras: 25% das calorias
 * Carboidratos: restante
 */
export const calculateMacros = (targetCalories, weight, goal) => {
  // Proteína: 2g/kg para perder/ganhar, 1.6g/kg para manter
  const proteinPerKg = (goal === 'perder' || goal === 'ganhar') ? 2 : 1.6;
  const proteinGrams = Math.round(weight * proteinPerKg);
  const proteinCalories = proteinGrams * 4; // 4 kcal por grama
  
  // Gordura: 25% das calorias totais
  const fatCalories = Math.round(targetCalories * 0.25);
  const fatGrams = Math.round(fatCalories / 9); // 9 kcal por grama
  
  // Carboidratos: restante
  const carbsCalories = targetCalories - proteinCalories - fatCalories;
  const carbsGrams = Math.round(carbsCalories / 4); // 4 kcal por grama
  
  return {
    protein: proteinGrams,
    carbs: carbsGrams,
    fat: fatGrams
  };
};

/**
 * Classificação do IMC
 */
export const getIMCClassification = (imc) => {
  if (imc < 18.5) return 'Abaixo do peso';
  if (imc < 25) return 'Peso normal';
  if (imc < 30) return 'Sobrepeso';
  if (imc < 35) return 'Obesidade Grau I';
  if (imc < 40) return 'Obesidade Grau II';
  return 'Obesidade Grau III';
};

// ===================================
// SAVE USER PROFILE
// ===================================
export const saveUserProfile = async (userId, profileData) => {
  try {
    const { age, sex, weight, height, activityLevel, goal, targetWeight, targetDate, health, restrictions } = profileData;
    
    // Calcular métricas
    const imc = calculateIMC(weight, height);
    const tmb = calculateTMB(weight, height, age, sex);
    const get = calculateGET(tmb, activityLevel);
    const targetCalories = calculateTargetCalories(get, goal);
    const macros = calculateMacros(targetCalories, weight, goal);
    
    const calculated = {
      imc,
      imcClassification: getIMCClassification(imc),
      tmb,
      get,
      targetCalories,
      macros,
      updatedAt: new Date()
    };
    
    // Salvar perfil completo
    await updateDoc(doc(db, 'users', userId), {
      profile: {
        age,
        sex,
        weight,
        height,
        activityLevel,
        goal,
        targetWeight,
        targetDate,
        health: health || {},
        restrictions: restrictions || [],
        calculated
      }
    });
    
    return { success: true, calculated };
  } catch (error) {
    console.error('Error saving profile:', error);
    return { success: false, error: error.message };
  }
};

// ===================================
// GET USER PROFILE
// ===================================
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { success: true, profile: userDoc.data().profile };
    }
    return { success: false, error: 'Profile not found' };
  } catch (error) {
    console.error('Error getting profile:', error);
    return { success: false, error: error.message };
  }
};

// ===================================
// UPDATE WEIGHT (para tracking)
// ===================================
export const updateWeight = async (userId, newWeight) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const profile = userDoc.data().profile;
    if (!profile) {
      throw new Error('Profile not found');
    }
    
    // Recalcular com novo peso
    const { age, sex, height, activityLevel, goal } = profile;
    const imc = calculateIMC(newWeight, height);
    const tmb = calculateTMB(newWeight, height, age, sex);
    const get = calculateGET(tmb, activityLevel);
    const targetCalories = calculateTargetCalories(get, goal);
    const macros = calculateMacros(targetCalories, newWeight, goal);
    
    await updateDoc(doc(db, 'users', userId), {
      'profile.weight': newWeight,
      'profile.calculated': {
        imc,
        imcClassification: getIMCClassification(imc),
        tmb,
        get,
        targetCalories,
        macros,
        updatedAt: new Date()
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating weight:', error);
    return { success: false, error: error.message };
  }
};

// ===================================
// WEIGHT TRACKING
// ===================================

export const saveWeight = async (userId, weight) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const weightRef = doc(db, `users/${userId}/weightHistory/${today}`);
    
    await setDoc(weightRef, {
      weight,
      date: new Date(),
      updatedAt: new Date()
    });
    
    // Atualizar peso no perfil também
    const profileRef = doc(db, 'users', userId);
    await updateDoc(profileRef, {
      weight,
      'profile.weight': weight
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error saving weight:', error);
    return { success: false, error: error.message };
  }
};

export const getWeightHistory = async (userId, limit = 30) => {
  try {
    const weightCollectionRef = collection(db, `users/${userId}/weightHistory`);
    const q = query(weightCollectionRef, orderBy('date', 'desc'), limitQuery(limit));
    const snapshot = await getDocs(q);
    
    const history = [];
    snapshot.forEach(doc => {
      history.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, history };
  } catch (error) {
    console.error('Error getting weight history:', error);
    return { success: false, error: error.message, history: [] };
  }
};
