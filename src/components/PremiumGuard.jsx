import { useState } from 'react';
import { Lock } from 'lucide-react';
import Paywall from './Paywall';

const PremiumGuard = ({ 
  children, 
  isPremium, 
  isInTrial,
  daysLeftInTrial,
  user,
  featureName = 'esta funcionalidade'
}) => {
  const [showPaywall, setShowPaywall] = useState(false);

  // Se é premium ou está em trial, mostra o conteúdo
  if (isPremium || isInTrial) {
    return <>{children}</>;
  }

  // Se não, mostra bloqueio
  return (
    <>
      <div style={styles.container}>
        <div style={styles.overlay}>
          <div style={styles.lockIcon}>
            <Lock size={48} />
          </div>
          <h3 style={styles.title}>✨ Recurso Premium</h3>
          <p style={styles.description}>
            {featureName} está disponível apenas para assinantes Premium
          </p>
          <button 
            onClick={() => setShowPaywall(true)}
            style={styles.unlockButton}
          >
            🚀 Desbloquear Agora
          </button>
        </div>
        <div style={styles.blurredContent}>
          {children}
        </div>
      </div>

      {showPaywall && (
        <Paywall
          onClose={() => setShowPaywall(false)}
          user={user}
          isInTrial={isInTrial}
          daysLeftInTrial={daysLeftInTrial}
        />
      )}
    </>
  );
};

const styles = {
  container: {
    position: 'relative',
    minHeight: '300px'
  },
  overlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 10,
    textAlign: 'center',
    background: 'white',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    maxWidth: '400px',
    width: '90%'
  },
  lockIcon: {
    width: '80px',
    height: '80px',
    margin: '0 auto 20px',
    background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: '12px'
  },
  description: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '24px',
    lineHeight: '1.5'
  },
  unlockButton: {
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)'
  },
  blurredContent: {
    filter: 'blur(8px)',
    pointerEvents: 'none',
    userSelect: 'none',
    opacity: 0.3
  }
};

export default PremiumGuard;
