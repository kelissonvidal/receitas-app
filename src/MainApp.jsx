import { useState, useEffect } from 'react';
import { onAuthChange, logoutUser } from './firebase/auth';
import { getUserProfile } from './firebase/profile';
import AuthScreen from './components/AuthScreen';
import ProfileSetup from './components/ProfileSetup';
import App from './App';
import { Loader } from 'lucide-react';

const MainApp = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // ===================================
  // LISTEN TO AUTH CHANGES
  // ===================================
  useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        
        // Carregar perfil do usuário
        const profileResult = await getUserProfile(authUser.uid);
        if (profileResult.success && profileResult.profile) {
          setUserProfile(profileResult.profile);
          setShowProfileSetup(false);
        } else {
          // Perfil não existe, mostrar setup
          setShowProfileSetup(true);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setShowProfileSetup(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ===================================
  // HANDLE AUTH SUCCESS
  // ===================================
  const handleAuthSuccess = (authUser) => {
    setUser(authUser);
    setShowProfileSetup(true); // Novo usuário precisa configurar perfil
  };

  // ===================================
  // HANDLE PROFILE COMPLETE
  // ===================================
  const handleProfileComplete = async () => {
    // Recarregar perfil
    const profileResult = await getUserProfile(user.uid);
    if (profileResult.success) {
      setUserProfile(profileResult.profile);
    }
    setShowProfileSetup(false);
  };

  // ===================================
  // HANDLE LOGOUT
  // ===================================
  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setUserProfile(null);
    setShowProfileSetup(false);
  };

  // ===================================
  // LOADING STATE
  // ===================================
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px',
        color: 'white'
      }}>
        <Loader size={48} className="spinner" />
        <div style={{fontSize: '18px', fontWeight: '600'}}>
          Carregando...
        </div>
      </div>
    );
  }

  // ===================================
  // NOT AUTHENTICATED
  // ===================================
  if (!user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // ===================================
  // AUTHENTICATED BUT NEED PROFILE SETUP
  // ===================================
  if (showProfileSetup) {
    return <ProfileSetup user={user} onComplete={handleProfileComplete} />;
  }

  // ===================================
  // AUTHENTICATED - SHOW APP
  // ===================================
  return (
    <App
      user={user}
      userProfile={userProfile}
      onLogout={handleLogout}
      onProfileUpdate={setUserProfile}
      onEditProfile={() => setShowProfileSetup(true)}
    />
  );
};

export default MainApp;
