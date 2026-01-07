import { X, Check, Zap, Crown } from 'lucide-react';

const Paywall = ({ onClose, user, isInTrial, daysLeftInTrial }) => {
  const plans = [
    {
      id: 'monthly',
      name: 'Mensal',
      price: 19.90,
      period: '/mês',
      installments: null,
      icon: '📅',
      color: '#1976D2',
      popular: false,
      features: [
        'Acesso completo',
        'Análise de fotos ilimitada',
        'Receitas personalizadas',
        'Plano semanal',
        'Gráficos completos',
        'Cancele quando quiser'
      ],
      hotmartLink: 'https://pay.hotmart.com/SEU_PRODUTO_MENSAL' // Substituir
    },
    {
      id: 'annual',
      name: 'Anual',
      price: 179.70,
      originalPrice: 238.80,
      period: '/ano',
      installments: '3x de R$ 59,90',
      icon: '⭐',
      color: '#2E7D32',
      popular: true,
      discount: '25% OFF',
      features: [
        'Tudo do plano mensal',
        'Economize R$ 59,10',
        'R$ 14,97/mês',
        'Pagamento facilitado',
        'Melhor custo-benefício',
        '3x sem juros'
      ],
      hotmartLink: 'https://pay.hotmart.com/SEU_PRODUTO_ANUAL' // Substituir
    },
    {
      id: 'lifetime',
      name: 'Vitalício',
      price: 197.00,
      period: 'pagamento único',
      installments: '6x de R$ 32,83',
      icon: '🚀',
      color: '#F57C00',
      popular: false,
      badge: 'ACESSO VITALÍCIO',
      features: [
        'Tudo do plano anual',
        'Acesso para sempre',
        'Sem mensalidade',
        'Todas as atualizações',
        'Suporte vitalício',
        '6x sem juros'
      ],
      hotmartLink: 'https://pay.hotmart.com/SEU_PRODUTO_VITALICIO' // Substituir
    }
  ];

  const handleSubscribe = (plan) => {
    // Adicionar email do usuário na URL
    const url = new URL(plan.hotmartLink);
    url.searchParams.append('email', user.email);
    url.searchParams.append('name', user.displayName || '');
    url.searchParams.append('userId', user.uid);
    
    // Abrir checkout Hotmart
    window.open(url.toString(), '_blank');
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        {/* Hero */}
        <div style={styles.hero}>
          <div style={styles.heroIcon}>💪</div>
          <h2 style={styles.heroTitle}>Desbloqueie todo o poder do VigorAI</h2>
          <p style={styles.heroSubtitle}>
            {isInTrial 
              ? `Você tem ${daysLeftInTrial} ${daysLeftInTrial === 1 ? 'dia' : 'dias'} restantes no seu trial gratuito!`
              : 'Transforme sua saúde com inteligência artificial'
            }
          </p>
        </div>

        {/* Plans */}
        <div style={styles.plansContainer}>
          {plans.map((plan) => (
            <div 
              key={plan.id}
              style={{
                ...styles.planCard,
                ...(plan.popular && styles.planCardPopular),
                borderColor: plan.color
              }}
            >
              {plan.popular && (
                <div style={{...styles.popularBadge, background: plan.color}}>
                  <Crown size={14} />
                  MAIS POPULAR
                </div>
              )}
              
              {plan.badge && (
                <div style={{...styles.badge, background: plan.color}}>
                  <Zap size={14} />
                  {plan.badge}
                </div>
              )}

              <div style={styles.planIcon}>{plan.icon}</div>
              <h3 style={styles.planName}>{plan.name}</h3>
              
              {plan.discount && (
                <div style={styles.discount}>{plan.discount}</div>
              )}
              
              <div style={styles.priceContainer}>
                {plan.originalPrice && (
                  <div style={styles.originalPrice}>
                    R$ {plan.originalPrice.toFixed(2)}
                  </div>
                )}
                <div style={styles.price}>
                  R$ {plan.price.toFixed(2)}
                </div>
                <div style={styles.period}>{plan.period}</div>
                {plan.installments && (
                  <div style={styles.installments}>{plan.installments}</div>
                )}
              </div>

              <div style={styles.features}>
                {plan.features.map((feature, index) => (
                  <div key={index} style={styles.feature}>
                    <Check size={16} style={{color: plan.color, flexShrink: 0}} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribe(plan)}
                style={{
                  ...styles.subscribeButton,
                  background: `linear-gradient(135deg, ${plan.color} 0%, ${plan.color}dd 100%)`
                }}
              >
                Assinar Agora
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            🔒 Pagamento 100% seguro via Hotmart
          </p>
          <p style={styles.footerText}>
            ✓ Garantia de 7 dias • ✓ Cancele quando quiser
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px',
    overflowY: 'auto'
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    maxWidth: '1200px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative'
  },
  header: {
    padding: '20px',
    display: 'flex',
    justifyContent: 'flex-end'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    color: '#666'
  },
  hero: {
    textAlign: 'center',
    padding: '0 20px 40px'
  },
  heroIcon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  heroTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: '12px',
    lineHeight: '1.2'
  },
  heroSubtitle: {
    fontSize: '16px',
    color: '#666',
    maxWidth: '600px',
    margin: '0 auto'
  },
  plansContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    padding: '0 20px 40px',
    maxWidth: '1100px',
    margin: '0 auto'
  },
  planCard: {
    border: '3px solid',
    borderRadius: '16px',
    padding: '24px',
    position: 'relative',
    background: 'white',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  planCardPopular: {
    transform: 'scale(1.05)',
    boxShadow: '0 8px 32px rgba(46, 125, 50, 0.2)'
  },
  popularBadge: {
    position: 'absolute',
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '6px 16px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
  },
  badge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    padding: '6px 12px',
    borderRadius: '6px',
    color: 'white',
    fontSize: '10px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  planIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    textAlign: 'center'
  },
  planName: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '8px',
    textAlign: 'center'
  },
  discount: {
    display: 'inline-block',
    padding: '4px 12px',
    background: '#FFD700',
    color: '#333',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    marginBottom: '16px',
    alignSelf: 'center'
  },
  priceContainer: {
    textAlign: 'center',
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '2px solid #f0f0f0'
  },
  originalPrice: {
    fontSize: '14px',
    color: '#999',
    textDecoration: 'line-through',
    marginBottom: '4px'
  },
  price: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#2E7D32',
    lineHeight: '1'
  },
  period: {
    fontSize: '14px',
    color: '#666',
    marginTop: '4px'
  },
  installments: {
    fontSize: '13px',
    color: '#2E7D32',
    fontWeight: '600',
    marginTop: '8px'
  },
  features: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px'
  },
  feature: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    fontSize: '14px',
    color: '#333'
  },
  subscribeButton: {
    width: '100%',
    padding: '16px',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  },
  footer: {
    textAlign: 'center',
    padding: '20px',
    borderTop: '1px solid #f0f0f0',
    background: '#f9f9f9'
  },
  footerText: {
    fontSize: '13px',
    color: '#666',
    margin: '4px 0'
  }
};

export default Paywall;
