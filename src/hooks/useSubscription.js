import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useSubscription = (userId) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [isInTrial, setIsInTrial] = useState(false);
  const [daysLeftInTrial, setDaysLeftInTrial] = useState(0);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Listener em tempo real
    const unsubscribe = onSnapshot(
      doc(db, 'users', userId, 'subscription', 'current'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSubscription(data);
          
          const now = new Date();
          
          // Verificar trial
          if (data.status === 'trial' && data.trialEnd) {
            const trialEnd = data.trialEnd.toDate();
            const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
            
            if (daysLeft > 0) {
              setIsInTrial(true);
              setDaysLeftInTrial(daysLeft);
              setIsPremium(true); // Trial tem acesso premium
            } else {
              // Trial expirado
              setIsInTrial(false);
              setDaysLeftInTrial(0);
              setIsPremium(false);
            }
          }
          // Assinatura ativa
          else if (data.status === 'active') {
            const expiresAt = data.expiresAt?.toDate();
            
            if (!expiresAt || expiresAt > now) {
              setIsPremium(true);
              setIsInTrial(false);
            } else {
              setIsPremium(false);
              setIsInTrial(false);
            }
          }
          // Vitalício
          else if (data.status === 'lifetime') {
            setIsPremium(true);
            setIsInTrial(false);
            setDaysLeftInTrial(0);
          }
          // Outros status
          else {
            setIsPremium(false);
            setIsInTrial(false);
            setDaysLeftInTrial(0);
          }
        } else {
          // Documento não existe - usuário muito antigo sem subscription
          setSubscription(null);
          setIsPremium(false);
          setIsInTrial(false);
          setDaysLeftInTrial(0);
        }
        
        setLoading(false);
      },
      (error) => {
        console.error('Error loading subscription:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return {
    subscription,
    loading,
    isPremium,
    isInTrial,
    daysLeftInTrial
  };
};
