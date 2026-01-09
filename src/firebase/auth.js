// ===================================
// AUTHENTICATION SERVICE
// ===================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

// ===================================
// REGISTER USER
// ===================================
export const registerUser = async (email, password, name) => {
  try {
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document in Firestore
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 3); // 3 days trial

    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      name: name,
      createdAt: serverTimestamp(),
      trialEnds: trialEnds,
      subscription: {
        active: false,
        plan: null,
        startDate: null,
        expirationDate: null,
        transactionId: null
      },
      profile: null,
      mealPlan: null
    });

    return { success: true, user };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
};

// ===================================
// LOGIN USER
// ===================================
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
};

// ===================================
// GOOGLE LOGIN (com vinculação automática)
// ===================================
export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // NOVO: Verificar se existe conta antiga com mesmo email
      const { detectExistingAccount, mergeUserData } = await import('./accountLinking');
      const { existingUserId } = await detectExistingAccount(user.email);
      
      if (existingUserId) {
        // Perguntar se quer migrar dados
        const shouldMerge = window.confirm(
          '🔄 Detectamos que você já tem uma conta!\n\n' +
          'Deseja migrar seus registros anteriores?\n\n' +
          '✅ Sim - Seus dados serão preservados\n' +
          '❌ Não - Começar do zero'
        );
        
        if (shouldMerge) {
          console.log('🔄 Migrando dados...');
          const mergeResult = await mergeUserData(existingUserId, user.uid);
          
          if (mergeResult.success) {
            alert('✅ Dados migrados! Faça logout e login novamente para ver tudo.');
            return { success: true, user, merged: true };
          }
        }
      }
      
      // Create user document for new Google user
      const trialEnds = new Date();
      trialEnds.setDate(trialEnds.getDate() + 3);

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        name: user.displayName,
        createdAt: serverTimestamp(),
        trialEnds: trialEnds,
        subscription: {
          active: false,
          plan: null,
          startDate: null,
          expirationDate: null,
          transactionId: null
        },
        profile: null,
        mealPlan: null
      });
    }

    return { success: true, user };
  } catch (error) {
    console.error('Google login error:', error);
    return { success: false, error: error.message };
  }
};

// ===================================
// LOGOUT USER
// ===================================
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
};

// ===================================
// AUTH STATE OBSERVER
// ===================================
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// ===================================
// GET CURRENT USER
// ===================================
export const getCurrentUser = () => {
  return auth.currentUser;
};

// ===================================
// RESET PASSWORD
// ===================================
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email, {
      url: window.location.origin,
      handleCodeInApp: false
    });
    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, error: error.message };
  }
};

// ===================================
// CHECK IF EMAIL EXISTS
// ===================================
export const checkEmailExists = async (email) => {
  try {
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    return { 
      success: true, 
      exists: signInMethods.length > 0,
      methods: signInMethods 
    };
  } catch (error) {
    console.error('Check email error:', error);
    return { success: false, error: error.message };
  }
};

// ===================================
// LINK ACCOUNTS (Email/Password + Google)
// ===================================
export const linkEmailPasswordToGoogleAccount = async (email, password) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'Nenhum usuário logado' };
    }

    // Criar credential
    const credential = EmailAuthProvider.credential(email, password);
    
    // Vincular conta
    await linkWithCredential(user, credential);
    
    return { success: true };
  } catch (error) {
    console.error('Link accounts error:', error);
    return { success: false, error: error.message };
  }
};

