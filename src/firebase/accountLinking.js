// ===================================
// SMART ACCOUNT LINKING SYSTEM
// Sistema Inteligente de Vinculação de Contas
// ===================================

import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './config';

/**
 * Detectar se usuário já possui conta com mesmo email
 * Retorna UID da conta existente
 */
export const detectExistingAccount = async (email) => {
  try {
    // Buscar em todos os usuários (NOTA: Em produção, use índices do Firestore)
    // Por enquanto, vamos usar uma abordagem simplificada
    
    // Você precisará criar um índice composto no Firestore:
    // Coleção: users
    // Campo: email
    // Ordem: Crescente
    
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    let existingUserId = null;
    snapshot.forEach(doc => {
      if (doc.data().email === email && doc.id !== getCurrentUserId()) {
        existingUserId = doc.id;
      }
    });
    
    return { success: true, existingUserId };
  } catch (error) {
    console.error('Erro ao detectar conta:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Migrar dados entre contas
 */
export const mergeUserData = async (fromUserId, toUserId) => {
  try {
    console.log(`🔄 Migrando dados de ${fromUserId} para ${toUserId}...`);

    // 1. COPIAR DOCUMENTO PRINCIPAL
    const { getDoc } = await import('firebase/firestore');
    const fromUserDoc = await getDoc(doc(db, 'users', fromUserId));
    const toUserDoc = await getDoc(doc(db, 'users', toUserId));
    
    if (fromUserDoc.exists()) {
      const fromData = fromUserDoc.data();
      const toData = toUserDoc.data();
      
      // Mesclar dados (preservar dados mais recentes)
      const mergedData = {
        ...fromData,
        ...toData,
        email: toData.email, // Manter email da conta de destino
        mergedAt: new Date(),
        originalUserId: fromUserId
      };
      
      await setDoc(doc(db, 'users', toUserId), mergedData);
    }

    // 2. COPIAR SUBCOLEÇÕES
    const subCollections = ['diary', 'weightHistory', 'favoriteRecipes', 'supplements', 'preferences'];
    
    for (const collectionName of subCollections) {
      const fromRef = collection(db, 'users', fromUserId, collectionName);
      const snapshot = await getDocs(fromRef);
      
      let count = 0;
      for (const docSnapshot of snapshot.docs) {
        await setDoc(
          doc(db, 'users', toUserId, collectionName, docSnapshot.id),
          docSnapshot.data()
        );
        count++;
      }
      
      if (count > 0) {
        console.log(`✅ ${count} documentos de ${collectionName} migrados`);
      }
    }

    // 3. COPIAR ASSINATURA
    const subscriptionDoc = await getDoc(
      doc(db, 'users', fromUserId, 'subscription', 'current')
    );
    if (subscriptionDoc.exists()) {
      await setDoc(
        doc(db, 'users', toUserId, 'subscription', 'current'),
        subscriptionDoc.data()
      );
      console.log('✅ Assinatura migrada');
    }

    console.log('🎉 Migração concluída!');
    return { success: true };

  } catch (error) {
    console.error('❌ Erro na migração:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sistema de vinculação automática ao fazer login com Google
 */
export const handleGoogleLoginWithMerge = async (user, loginWithGoogleFunc) => {
  try {
    // 1. Fazer login com Google
    const loginResult = await loginWithGoogleFunc();
    
    if (!loginResult.success) {
      return loginResult;
    }

    const currentUser = loginResult.user;
    
    // 2. Verificar se existe conta antiga com mesmo email
    const { existingUserId } = await detectExistingAccount(currentUser.email);
    
    // 3. Se encontrou conta antiga, perguntar se quer mesclar
    if (existingUserId && existingUserId !== currentUser.uid) {
      console.log('🔍 Conta existente detectada!');
      
      // Perguntar ao usuário
      const shouldMerge = window.confirm(
        '🔄 Detectamos que você já tem uma conta com este email.\n\n' +
        'Deseja migrar seus dados anteriores para esta conta Google?\n\n' +
        '✅ Sim - Seus registros serão preservados\n' +
        '❌ Não - Começar do zero'
      );
      
      if (shouldMerge) {
        console.log('🔄 Iniciando migração...');
        const mergeResult = await mergeUserData(existingUserId, currentUser.uid);
        
        if (mergeResult.success) {
          alert('✅ Seus dados foram migrados com sucesso!\n\nFaça logout e login novamente para ver todos os seus registros.');
          return { ...loginResult, merged: true };
        } else {
          alert('⚠️ Não foi possível migrar todos os dados. Tente novamente.');
        }
      }
    }
    
    return loginResult;

  } catch (error) {
    console.error('Erro no login com merge:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Obter UID do usuário atual
 */
const getCurrentUserId = () => {
  const { auth } = require('./config');
  return auth.currentUser?.uid || null;
};

export default {
  detectExistingAccount,
  mergeUserData,
  handleGoogleLoginWithMerge
};
