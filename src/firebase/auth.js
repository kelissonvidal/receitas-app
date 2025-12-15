// ===================================
// AUTHENTICATION SERVICE
// ===================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
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
// GOOGLE LOGIN
// ===================================
export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
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
