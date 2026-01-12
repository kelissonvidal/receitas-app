// ===================================
// SCRIPT DE CORREÇÃO DE TMB
// Execute este script no console do navegador
// ===================================

import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './config';

/**
 * Calcular TMB corretamente (Fórmula de Harris-Benedict Revisada)
 */
const calculateCorrectTMB = (weight, height, age, sex) => {
  if (sex === 'masculino') {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
};

/**
 * Calcular necessidades calóricas baseadas em objetivo e atividade
 */
const calculateCalories = (tmb, activityLevel, goal) => {
  // Fatores de atividade
  const activityFactors = {
    sedentario: 1.2,
    leve: 1.375,
    moderado: 1.55,
    intenso: 1.725,
    muito_intenso: 1.9
  };

  const tdee = tmb * (activityFactors[activityLevel] || 1.2);

  // Ajustar baseado no objetivo
  if (goal === 'perder') {
    return Math.round(tdee - 500); // Déficit de 500 kcal
  } else if (goal === 'ganhar') {
    return Math.round(tdee + 300); // Superávit de 300 kcal
  } else {
    return Math.round(tdee); // Manutenção
  }
};

/**
 * Calcular macros
 */
const calculateMacros = (calories, weight, goal) => {
  let protein, fat, carbs;

  if (goal === 'perder') {
    protein = weight * 2.2; // 2.2g por kg (preservar massa)
    fat = calories * 0.25 / 9; // 25% das calorias
  } else if (goal === 'ganhar') {
    protein = weight * 2.0; // 2g por kg
    fat = calories * 0.30 / 9; // 30% das calorias
  } else {
    protein = weight * 1.8; // 1.8g por kg
    fat = calories * 0.28 / 9; // 28% das calorias
  }

  const proteinCalories = protein * 4;
  const fatCalories = fat * 9;
  const carbCalories = calories - proteinCalories - fatCalories;
  carbs = carbCalories / 4;

  return {
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat)
  };
};

/**
 * Corrigir TMB de um único usuário
 */
const fixUserProfile = async (userId, profileData) => {
  try {
    const { weight, height, age, sex, activityLevel, goal } = profileData;

    // Recalcular TMB correto
    const correctTMB = calculateCorrectTMB(weight, height, age, sex);
    
    // Recalcular calorias
    const calories = calculateCalories(correctTMB, activityLevel, goal);
    
    // Recalcular macros
    const macros = calculateMacros(calories, weight, goal);

    // Atualizar no Firebase
    const profileRef = doc(db, 'users', userId);
    await updateDoc(profileRef, {
      'calculated.tmb': Math.round(correctTMB),
      'calculated.calories': calories,
      'calculated.protein': macros.protein,
      'calculated.carbs': macros.carbs,
      'calculated.fat': macros.fat,
      'correctedAt': new Date()
    });

    console.log(`✅ Usuário ${profileData.name || userId} corrigido:`);
    console.log(`   TMB: ${Math.round(correctTMB)} kcal`);
    console.log(`   Calorias: ${calories} kcal`);
    console.log(`   Proteínas: ${macros.protein}g`);
    console.log(`   Carboidratos: ${macros.carbs}g`);
    console.log(`   Gorduras: ${macros.fat}g`);

    return { success: true, userId };
  } catch (error) {
    console.error(`❌ Erro ao corrigir usuário ${userId}:`, error);
    return { success: false, userId, error: error.message };
  }
};

/**
 * Corrigir TMB de todos os usuários
 */
export const fixAllProfiles = async () => {
  try {
    console.log('🔄 Iniciando correção de TMB...');
    console.log('');

    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);

    let corrected = 0;
    let errors = 0;

    for (const userDoc of snapshot.docs) {
      const profileData = userDoc.data().profile;
      
      // Verificar se tem perfil completo
      if (profileData && profileData.weight && profileData.height && 
          profileData.age && profileData.sex) {
        
        const result = await fixUserProfile(userDoc.id, profileData);
        
        if (result.success) {
          corrected++;
        } else {
          errors++;
        }
      } else {
        console.log(`⏭️  Usuário ${userDoc.id}: Perfil incompleto (ignorado)`);
      }
    }

    console.log('');
    console.log('🎉 CORREÇÃO CONCLUÍDA!');
    console.log('');
    console.log(`📊 Resultados:`);
    console.log(`   ✅ Perfis corrigidos: ${corrected}`);
    console.log(`   ❌ Erros: ${errors}`);
    console.log('');

    return { success: true, corrected, errors };

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return { success: false, error: error.message };
  }
};

// ===================================
// INSTRUÇÕES DE USO
// ===================================
/*

COMO USAR:

1. Abra o app no navegador (logado como admin)
2. Pressione F12 (abrir console)
3. Cole este código:

   const fixScript = await import('./src/firebase/fixTMB.js');
   await fixScript.fixAllProfiles();

4. Aguarde a execução (1-2 minutos)
5. Veja os resultados no console
6. Pronto! Todos os TMBs corrigidos!

*/

export default fixAllProfiles;
