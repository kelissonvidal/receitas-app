import React, { useState } from 'react';
import { LogOut, User as UserIcon, BookOpen, Home as HomeIcon, BarChart2 } from 'lucide-react';
import FoodDiary from './components/FoodDiary';
import Dashboard from './components/Dashboard';
import WeightTracker from './components/WeightTracker';

const App = ({ user, userProfile, onLogout, onEditProfile }) => {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'profile' | 'diary' | 'dashboard'

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
      padding: '20px'
    }}>
      {/* HEADER */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '800',
            color: '#8B4513',
            margin: 0
          }}>
            👨‍🍳 Receitas Mais Rápidas
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#666',
            margin: '4px 0 0 0'
          }}>
            Olá, {user?.displayName || user?.email?.split('@')[0] || 'Usuário'}!
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => setCurrentView('home')}
            style={{
              padding: '10px 16px',
              background: currentView === 'home' ? 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)' : '#f5f5f5',
              color: currentView === 'home' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            <HomeIcon size={18} />
            Início
          </button>

          <button
            onClick={() => setCurrentView('diary')}
            style={{
              padding: '10px 16px',
              background: currentView === 'diary' ? 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)' : '#f5f5f5',
              color: currentView === 'diary' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            <BookOpen size={18} />
            Diário
          </button>

          <button
            onClick={() => setCurrentView('dashboard')}
            style={{
              padding: '10px 16px',
              background: currentView === 'dashboard' ? 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)' : '#f5f5f5',
              color: currentView === 'dashboard' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            <BarChart2 size={18} />
            Dashboard
          </button>

          <button
            onClick={() => setCurrentView('profile')}
            style={{
              padding: '10px 16px',
              background: currentView === 'profile' ? 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)' : '#f5f5f5',
              color: currentView === 'profile' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            <UserIcon size={18} />
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
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#c33'
            }}
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </div>

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
                <button style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Em breve
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
    </div>
  );
};

export default App;
