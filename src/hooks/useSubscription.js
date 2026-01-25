import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

// =============================================
// 🔓 ACESSO LIBERADO TEMPORARIAMENTE
// Para reativar a verificação de trial/assinatura,
// mude LIBERAR_ACESSO para false
// =============================================
const LIBERAR_ACESSO = true;

export const useSubscription = (userId) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(LIBERAR_ACESSO);
  const [isInTrial, setIsInTrial] = useState(false);
  const [daysLeftInTrial, setDaysLeftInTrial] = useState(0);

  useEffect(() => {
    // 🔓 Se acesso liberado, não verificar nada
    if (LIBERAR_ACESSO) {
      console.log('🔓 ACESSO LIBERADO - Todos os usuários têm acesso premium');
      setIsPremium(true);
      setIsInTrial(false);
      setLoading(false);
      return;
    }

    if (!userId) {
      setLoading(false);
      return;
    }

    // Listener em tempo real
    const unsubscribe = onSnapshot(
      doc(db, 'users', userId, 'subscription', 'current'),
      (docSnap) => {
        console.log('📊 Subscription snapshot:', {
          exists: docSnap.exists(),
          data: docSnap.data()
        });

        if (docSnap.exists()) {
          const data = docSnap.data();
          setSubscription(data);
          
          const now = new Date();
          console.log('⏰ Data atual:', now);
          
          // Verificar trial
          if (data.status === 'trial') {
            console.log('🎁 Status é TRIAL');
            
            if (data.trialEnd) {
              const trialEnd = data.trialEnd.toDate();
              console.log('📅 Trial termina em:', trialEnd);
              
              const diffMs = trialEnd - now;
              const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
              console.log('⏳ Dias restantes:', daysLeft);
              
              if (daysLeft > 0) {
                console.log('✅ TRIAL ATIVO - Dando acesso premium');
                setIsInTrial(true);
                setDaysLeftInTrial(daysLeft);
                setIsPremium(true);
              } else {
                console.log('❌ TRIAL EXPIRADO');
                setIsInTrial(false);
                setDaysLeftInTrial(0);
                setIsPremium(false);
              }
            } else {
              console.log('⚠️ trialEnd não existe no documento!');
              setIsInTrial(false);
              setDaysLeftInTrial(0);
              setIsPremium(false);
            }
          }
          // Assinatura ativa
          else if (data.status === 'active') {
            console.log('💎 Status é ACTIVE');
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
            console.log('👑 Status é LIFETIME');
            setIsPremium(true);
            setIsInTrial(false);
            setDaysLeftInTrial(0);
          }
          // Outros status
          else {
            console.log('⚠️ Status desconhecido:', data.status);
            setIsPremium(false);
            setIsInTrial(false);
            setDaysLeftInTrial(0);
          }
        } else {
          console.log('❌ Documento de subscription NÃO EXISTE');
          setSubscription(null);
          setIsPremium(false);
          setIsInTrial(false);
          setDaysLeftInTrial(0);
        }
        
        setLoading(false);
      },
      (error) => {
        console.error('❌ Error loading subscription:', error);
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
