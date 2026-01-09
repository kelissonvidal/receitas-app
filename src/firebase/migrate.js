// ===================================
// SCRIPT DE MIGRAÇÃO DE DADOS
// ===================================
// Use este script no console do Firebase ou crie uma Cloud Function

import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './config';

/**
 * Migrar todos os dados de um UID antigo para um UID novo
 * USO: migrateUserData(oldUID, newUID)
 */
export const migrateUserData = async (oldUserId, newUserId) => {
  try {
    console.log('🔄 Iniciando migração de dados...');
    console.log(`   De: ${oldUserId}`);
    console.log(`   Para: ${newUserId}`);

    // 1. COPIAR DOCUMENTO PRINCIPAL DO USUÁRIO
    const oldUserDoc = await getDoc(doc(db, 'users', oldUserId));
    if (oldUserDoc.exists()) {
      await setDoc(doc(db, 'users', newUserId), oldUserDoc.data());
      console.log('✅ Perfil migrado');
    }

    // 2. COPIAR DIÁRIO ALIMENTAR
    const diaryRef = collection(db, 'users', oldUserId, 'diary');
    const diarySnapshot = await getDocs(diaryRef);
    let diaryCount = 0;
    
    for (const diaryDoc of diarySnapshot.docs) {
      await setDoc(
        doc(db, 'users', newUserId, 'diary', diaryDoc.id),
        diaryDoc.data()
      );
      diaryCount++;
    }
    console.log(`✅ ${diaryCount} registros de diário migrados`);

    // 3. COPIAR HISTÓRICO DE PESO
    const weightRef = collection(db, 'users', oldUserId, 'weightHistory');
    const weightSnapshot = await getDocs(weightRef);
    let weightCount = 0;
    
    for (const weightDoc of weightSnapshot.docs) {
      await setDoc(
        doc(db, 'users', newUserId, 'weightHistory', weightDoc.id),
        weightDoc.data()
      );
      weightCount++;
    }
    console.log(`✅ ${weightCount} registros de peso migrados`);

    // 4. COPIAR RECEITAS FAVORITAS
    const favoritesRef = collection(db, 'users', oldUserId, 'favoriteRecipes');
    const favoritesSnapshot = await getDocs(favoritesRef);
    let favoritesCount = 0;
    
    for (const favDoc of favoritesSnapshot.docs) {
      await setDoc(
        doc(db, 'users', newUserId, 'favoriteRecipes', favDoc.id),
        favDoc.data()
      );
      favoritesCount++;
    }
    console.log(`✅ ${favoritesCount} receitas favoritas migradas`);

    // 5. COPIAR ASSINATURA
    const subscriptionDoc = await getDoc(
      doc(db, 'users', oldUserId, 'subscription', 'current')
    );
    if (subscriptionDoc.exists()) {
      await setDoc(
        doc(db, 'users', newUserId, 'subscription', 'current'),
        subscriptionDoc.data()
      );
      console.log('✅ Assinatura migrada');
    }

    // 6. COPIAR SUPLEMENTOS
    const supplementsRef = collection(db, 'users', oldUserId, 'supplements');
    const supplementsSnapshot = await getDocs(supplementsRef);
    let supplementsCount = 0;
    
    for (const suppDoc of supplementsSnapshot.docs) {
      await setDoc(
        doc(db, 'users', newUserId, 'supplements', suppDoc.id),
        suppDoc.data()
      );
      supplementsCount++;
    }
    console.log(`✅ ${supplementsCount} suplementos migrados`);

    // 7. COPIAR PREFERÊNCIAS
    const preferencesDoc = await getDoc(
      doc(db, 'users', oldUserId, 'preferences', 'food')
    );
    if (preferencesDoc.exists()) {
      await setDoc(
        doc(db, 'users', newUserId, 'preferences', 'food'),
        preferencesDoc.data()
      );
      console.log('✅ Preferências migradas');
    }

    console.log('');
    console.log('🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('');
    console.log('📊 Resumo:');
    console.log(`   • Perfil: ✅`);
    console.log(`   • Diário: ${diaryCount} registros`);
    console.log(`   • Peso: ${weightCount} registros`);
    console.log(`   • Favoritos: ${favoritesCount} receitas`);
    console.log(`   • Suplementos: ${supplementsCount} itens`);
    console.log('');
    console.log('⚠️  IMPORTANTE: Faça logout e login novamente para ver os dados!');

    return {
      success: true,
      migrated: {
        diary: diaryCount,
        weight: weightCount,
        favorites: favoritesCount,
        supplements: supplementsCount
      }
    };

  } catch (error) {
    console.error('❌ Erro na migração:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Buscar UID de um email específico
 * NOTA: Firebase Auth não permite buscar UID por email via client SDK
 * Você precisará:
 * 1. Acessar Firebase Console → Authentication
 * 2. Procurar por kelissonvidal@gmail.com
 * 3. Copiar o UID da conta com provedor "Email/Password"
 * 4. Usar esse UID no script acima
 */

// ===================================
// INSTRUÇÕES DE USO
// ===================================

/*
PASSO 1: Encontrar o UID antigo
1. Firebase Console → Authentication
2. Buscar: kelissonvidal@gmail.com
3. Você verá 2 contas com mesmo email:
   - Uma com "Email/Password" ← UID antigo
   - Uma com "Google" ← UID novo (atual)
4. Copie o UID da conta "Email/Password"

PASSO 2: Executar migração
No console do navegador (F12) com o app aberto:

import { migrateUserData } from './firebase/migrate.js';

const oldUID = 'COLE_UID_ANTIGO_AQUI';
const newUID = 'SEU_UID_ATUAL_GOOGLE'; // ou pegue do auth.currentUser.uid

await migrateUserData(oldUID, newUID);

PASSO 3: Fazer logout e login
Após migração bem-sucedida, faça logout e login novamente.
Todos os dados estarão lá!
*/

export default migrateUserData;
