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
          
          // Verificar status
          const now = new Date();
          const expiresAt = data.expiresAt?.toDate();
          const createdAt = data.createdAt?.toDate();
          
          // Trial: 3 dias após criação da conta
          if (createdAt) {
            const trialEnd = new Date(createdAt.getTime() + (3 * 24 * 60 * 60 * 1000));
            const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
            
            if (daysLeft > 0 && data.status !== 'active') {
              setIsInTrial(true);
              setDaysLeftInTrial(daysLeft);
              setIsPremium(true); // Trial tem acesso premium
            } else {
              setIsInTrial(false);
              setDaysLeftInTrial(0);
            }
          }
          
          // Assinatura ativa
          if (data.status === 'active') {
            if (!expiresAt || expiresAt > now) {
              setIsPremium(true);
            } else {
              setIsPremium(false);
            }
          } else if (data.status === 'lifetime') {
            setIsPremium(true);
          } else {
            if (!isInTrial) {
              setIsPremium(false);
            }
          }
        } else {
          // Usuário novo - criar documento de trial
          const createdAt = new Date();
          setSubscription({
            status: 'trial',
            plan: null,
            createdAt,
            expiresAt: null
          });
          
          const trialEnd = new Date(createdAt.getTime() + (3 * 24 * 60 * 60 * 1000));
          const daysLeft = Math.ceil((trialEnd - new Date()) / (1000 * 60 * 60 * 24));
          
          setIsInTrial(true);
          setDaysLeftInTrial(daysLeft);
          setIsPremium(true);
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
