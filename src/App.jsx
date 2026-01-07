import React, { useState, useEffect } from 'react';
import { LogOut, User as UserIcon, BookOpen, Home as HomeIcon, BarChart2, Menu, X, Crown } from 'lucide-react';
import FoodDiary from './components/FoodDiary';
import Dashboard from './components/Dashboard';
import WeightTracker from './components/WeightTracker';
import RecipeGenerator from './components/RecipeGenerator';
import Paywall from './components/Paywall';
import { useSubscription } from './hooks/useSubscription';

const App = ({ user, userProfile, onLogout, onEditProfile }) => {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'recipes' | 'diary' | 'dashboard' | 'profile'
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showPaywall, setShowPaywall] = useState(false);

  // Subscription hook
  const { subscription, loading: subLoading, isPremium, isInTrial, daysLeftInTrial } = useSubscription(user?.uid);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const MenuItem = ({ view, icon: Icon, label, onClick }) => (
    <button
      onClick={() => {
        if (onClick) {
          onClick();
        } else {
          setCurrentView(view);
        }
        setMenuOpen(false);
      }}
      style={{
        padding: '12px 20px',
        background: currentView === view ? 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)' : '#f5f5f5',
        color: currentView === view ? 'white' : '#333',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        fontWeight: '600',
        width: '100%',
        justifyContent: 'flex-start'
      }}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
      padding: '20px',
      overflowX: 'hidden'
    }}>
      {/* HEADER */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          {/* LOGO */}
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '800',
              margin: 0,
              background: 'linear-gradient(135deg, #2E7D32 0%, #1976D2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              💪 VigorAI
            </h1>
            <p style={{
              fontSize: '12px',
              color: '#666',
              margin: '4px 0 0 0'
            }}>
              Olá, {user?.displayName || user?.email?.split('@')[0] || 'Usuário'}!
            </p>
          </div>

          {/* DESKTOP MENU - Esconde no mobile */}
          <div style={{
            display: isMobile ? 'none' : 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <button
              onClick={() => setCurrentView('home')}
              style={{
                padding: '10px 16px',
                background: currentView === 'home' ? 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)' : '#f5f5f5',
                color: currentView === 'home' ? 'white' : '#333',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}
            >
              <HomeIcon size={16} />
              Início
            </button>

            <button
              onClick={() => setCurrentView('diary')}
              style={{
                padding: '10px 16px',
                background: currentView === 'diary' ? 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)' : '#f5f5f5',
                color: currentView === 'diary' ? 'white' : '#333',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}
            >
              <BookOpen size={16} />
              Diário
            </button>

            <button
              onClick={() => setCurrentView('dashboard')}
              style={{
                padding: '10px 16px',
                background: currentView === 'dashboard' ? 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)' : '#f5f5f5',
                color: currentView === 'dashboard' ? 'white' : '#333',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}
            >
              <BarChart2 size={16} />
              Dashboard
            </button>

            <button
              onClick={() => setCurrentView('profile')}
              style={{
                padding: '10px 16px',
                background: currentView === 'profile' ? 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)' : '#f5f5f5',
                color: currentView === 'profile' ? 'white' : '#333',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}
            >
              <UserIcon size={16} />
              Perfil
            </button>

            <button
              onClick={onLogout}
              style={{
                padding: '10px 16px',
                background: '#fee',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#c33',
                whiteSpace: 'nowrap'
              }}
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>

          {/* MOBILE MENU BUTTON - Mostra só no mobile */}
          {isMobile && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                padding: '10px',
                background: '#f5f5f5',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex'
              }}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {menuOpen && isMobile && (
          <div style={{
            marginTop: '16px',
            padding: '16px',
            background: '#f9f9f9',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <MenuItem view="home" icon={HomeIcon} label="Início" />
            <MenuItem view="diary" icon={BookOpen} label="Diário" />
            <MenuItem view="dashboard" icon={BarChart2} label="Dashboard" />
            <MenuItem view="profile" icon={UserIcon} label="Perfil" />
            <button
              onClick={() => {
                onLogout();
                setMenuOpen(false);
              }}
              style={{
                padding: '12px 20px',
                background: '#fee',
                color: '#c33',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
                width: '100%',
                justifyContent: 'flex-start'
              }}
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        )}
      </div>

      {/* TRIAL BANNER */}
      {isInTrial && daysLeftInTrial > 0 && (
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto 20px',
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          borderRadius: '12px',
          padding: '16px 20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{fontSize: '18px', fontWeight: '700', color: '#333', marginBottom: '4px'}}>
              🎁 Trial Gratuito Ativo
            </div>
            <div style={{fontSize: '14px', color: '#666'}}>
              Você tem {daysLeftInTrial} {daysLeftInTrial === 1 ? 'dia' : 'dias'} restantes de acesso premium!
            </div>
          </div>
          <button
            onClick={() => setShowPaywall(true)}
            style={{
              padding: '12px 24px',
              background: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            <Crown size={18} />
            Assinar Agora
          </button>
        </div>
      )}

      {/* PREMIUM BUTTON (Se não for premium e trial acabou) */}
      {!isPremium && !isInTrial && (
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto 20px',
          background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{fontSize: '20px', fontWeight: '700', marginBottom: '8px'}}>
            ⚠️ Seu trial expirou
          </div>
          <div style={{fontSize: '14px', marginBottom: '16px', opacity: 0.9}}>
            Assine agora para continuar usando todas as funcionalidades
          </div>
          <button
            onClick={() => setShowPaywall(true)}
            style={{
              padding: '14px 32px',
              background: 'white',
              color: '#2E7D32',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Crown size={20} />
            Ver Planos Premium
          </button>
        </div>
      )}

      {/* CONTENT */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        {currentView === 'profile' && (
          // PERFIL
          <div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#8B4513',
              marginBottom: '24px'
            }}>
              Seu Perfil
            </h2>

            <div style={{
              background: '#f9f9f9',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '20px'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#8B4513' }}>Email:</strong>
                <p style={{ margin: '4px 0 0 0', color: '#666' }}>{user?.email}</p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#8B4513' }}>Nome:</strong>
                <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                  {user?.displayName || 'Não informado'}
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#8B4513' }}>Status da Conta:</strong>
                <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                  ✅ Trial Ativo (3 dias grátis)
                </p>
              </div>

              <div>
                <strong style={{ color: '#8B4513' }}>Perfil Nutricional:</strong>
                <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                  {userProfile ? 'Configurado ✅' : 'Não configurado ⚠️'}
                </p>
              </div>
            </div>

            {!userProfile && (
              <div style={{
                background: 'linear-gradient(135deg, #FFF8DC 0%, #FAEBD7 100%)',
                border: '2px dashed #DAA520',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚡</div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#8B4513',
                  marginBottom: '8px'
                }}>
                  Complete seu Perfil Nutricional!
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '16px'
                }}>
                  Configure seus dados para receber:
                  <br />
                  • Plano alimentar personalizado
                  <br />
                  • Cálculo de calorias ideal
                  <br />
                  • Acompanhamento de progresso
                </p>
                <button 
                  onClick={onEditProfile}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Configurar Agora
                </button>
              </div>
            )}

            {userProfile && (
              <WeightTracker 
                user={user} 
                userProfile={userProfile}
                onUpdate={() => window.location.reload()}
              />
            )}
          </div>
        )}

        {currentView === 'diary' && (
          <FoodDiary user={user} userProfile={userProfile} />
        )}

        {currentView === 'recipes' && (
          <RecipeGenerator user={user} userProfile={userProfile} />
        )}

        {currentView === 'dashboard' && (
          <Dashboard user={user} userProfile={userProfile} />
        )}

        {currentView === 'home' && (
          // HOME - RECEITAS
          <div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#8B4513',
              marginBottom: '8px'
            }}>
              Bem-vindo ao App de Receitas! 🎉
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#666',
              marginBottom: '32px'
            }}>
              Sistema de autenticação funcionando perfeitamente!
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {/* CARD 1 */}
              <div style={{
                background: 'linear-gradient(135deg, #FFF8DC 0%, #FAEBD7 100%)',
                borderRadius: '12px',
                padding: '24px',
                border: '2px solid #DAA520'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🍳</div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#8B4513',
                  marginBottom: '8px'
                }}>
                  Criar Receita com IA
                </h3>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                  Use a inteligência artificial para criar receitas personalizadas
                </p>
                <button 
                  onClick={() => setCurrentView('recipes')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Criar Receita
                </button>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
                borderRadius: '12px',
                padding: '24px',
                border: '2px solid #4CAF50'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#2E7D32',
                  marginBottom: '8px'
                }}>
                  Diário Alimentar
                </h3>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                  Registre suas refeições e acompanhe suas calorias
                </p>
                <button 
                  onClick={() => setCurrentView('diary')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Abrir Diário
                </button>
              </div>

              {/* CARD 3 */}
              <div style={{
                background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
                borderRadius: '12px',
                padding: '24px',
                border: '2px solid #2196F3'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📈</div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1565C0',
                  marginBottom: '8px'
                }}>
                  Dashboard
                </h3>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                  Veja seu progresso e estatísticas nutricionais
                </p>
                <button 
                  onClick={() => setCurrentView('dashboard')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #42A5F5 0%, #2196F3 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Ver Dashboard
                </button>
              </div>
            </div>

            {/* INFO */}
            <div style={{
              marginTop: '32px',
              padding: '20px',
              background: '#f9f9f9',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#8B4513',
                marginBottom: '8px'
              }}>
                🚀 Estamos Construindo Algo Incrível!
              </h4>
              <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                As funcionalidades completas estarão disponíveis em breve.
                <br />
                Continue acompanhando o desenvolvimento!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* PAYWALL MODAL */}
      {showPaywall && (
        <Paywall
          onClose={() => setShowPaywall(false)}
          user={user}
          isInTrial={isInTrial}
          daysLeftInTrial={daysLeftInTrial}
        />
      )}
    </div>
  );
};

export default App;
