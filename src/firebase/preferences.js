// ===================================
// USER PREFERENCES SERVICE
// ===================================

import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './config';

/**
 * Salvar preferências alimentares do usuário
 */
export const saveUserPreferences = async (userId, preferences) => {
  try {
    const preferencesRef = doc(db, 'users', userId, 'preferences', 'food');
    
    await setDoc(preferencesRef, {
      ...preferences,
      updatedAt: new Date()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error saving preferences:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Carregar preferências alimentares do usuário
 */
export const getUserPreferences = async (userId) => {
  try {
    const preferencesRef = doc(db, 'users', userId, 'preferences', 'food');
    const docSnap = await getDoc(preferencesRef);
    
    if (docSnap.exists()) {
      return { success: true, preferences: docSnap.data() };
    } else {
      return { success: true, preferences: null };
    }
  } catch (error) {
    console.error('Error loading preferences:', error);
    return { success: false, error: error.message, preferences: null };
  }
};

/**
 * Salvar suplemento
 */
export const saveSupplement = async (userId, supplement) => {
  try {
    const supplementId = supplement.id || `sup_${Date.now()}`;
    const supplementRef = doc(db, 'users', userId, 'supplements', supplementId);
    
    await setDoc(supplementRef, {
      ...supplement,
      id: supplementId,
      createdAt: supplement.createdAt || new Date(),
      updatedAt: new Date()
    });
    
    return { success: true, supplementId };
  } catch (error) {
    console.error('Error saving supplement:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Carregar suplementos do usuário
 */
export const getUserSupplements = async (userId) => {
  try {
    const { collection, getDocs, query } = await import('firebase/firestore');
    const supplementsRef = collection(db, 'users', userId, 'supplements');
    const q = query(supplementsRef);
    const snapshot = await getDocs(q);
    
    const supplements = [];
    snapshot.forEach(doc => {
      supplements.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, supplements };
  } catch (error) {
    console.error('Error loading supplements:', error);
    return { success: false, error: error.message, supplements: [] };
  }
};

/**
 * Deletar suplemento
 */
export const deleteSupplement = async (userId, supplementId) => {
  try {
    const { deleteDoc } = await import('firebase/firestore');
    const supplementRef = doc(db, 'users', userId, 'supplements', supplementId);
    await deleteDoc(supplementRef);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting supplement:', error);
    return { success: false, error: error.message };
  }
};
