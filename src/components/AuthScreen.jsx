import { useState } from 'react';
import { registerUser, loginUser, loginWithGoogle } from '../firebase/auth';
import { Loader, Mail, Lock, User, Chrome, Eye, EyeOff } from 'lucide-react';

const AuthScreen = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' ou 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // ===================================
  // HANDLE REGISTER
  // ===================================
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.email || !formData.password) {
      setError('Preencha todos os campos');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres');
      return;
    }
    
    setLoading(true);
    
    const result = await registerUser(formData.email, formData.password, formData.name);
    
    if (result.success) {
      onAuthSuccess(result.user);
    } else {
      setError(getErrorMessage(result.error));
    }
    
    setLoading(false);
  };

  // ===================================
  // HANDLE LOGIN
  // ===================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Preencha email e senha');
      return;
    }
    
    setLoading(true);
    
    const result = await loginUser(formData.email, formData.password);
    
    if (result.success) {
      onAuthSuccess(result.user);
    } else {
      setError(getErrorMessage(result.error));
    }
    
    setLoading(false);
  };

  // ===================================
  // HANDLE GOOGLE LOGIN
  // ===================================
  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    
    const result = await loginWithGoogle();
    
    if (result.success) {
      onAuthSuccess(result.user);
    } else {
      setError(getErrorMessage(result.error));
    }
    
    setLoading(false);
  };

  // ===================================
  // HANDLE PASSWORD RESET
  // ===================================
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!resetEmail) {
      setError('Digite seu email');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const { resetPassword } = await import('../firebase/auth');
    const result = await resetPassword(resetEmail);
    
    if (result.success) {
      setResetSuccess(true);
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetSuccess(false);
        setResetEmail('');
      }, 3000);
    } else {
      setError(getErrorMessage(result.error));
    }
    
    setLoading(false);
  };

  // ===================================
  // ERROR MESSAGES
  // ===================================
  const getErrorMessage = (error) => {
    const errorMessages = {
      'auth/email-already-in-use': 'Este email já está cadastrado',
      'auth/invalid-email': 'Email inválido',
      'auth/weak-password': 'Senha muito fraca',
      'auth/user-not-found': 'Usuário não encontrado',
      'auth/wrong-password': 'Senha incorreta',
      'auth/too-many-requests': 'Muitas tentativas. Aguarde um momento.',
      'auth/popup-closed-by-user': 'Login cancelado',
    };
    
    return errorMessages[error] || 'Erro ao autenticar. Tente novamente.';
  };

  // ===================================
  // STYLES
  // ===================================
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    },
    card: {
      background: 'white',
      borderRadius: '24px',
      padding: '40px',
      maxWidth: '440px',
      width: '100%',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    },
    logo: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    logoIcon: {
      width: '80px',
      height: '80px',
      background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px',
      fontSize: '40px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '800',
      color: '#8B4513',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '14px',
      color: '#666'
    },
    tabs: {
      display: 'flex',
      gap: '8px',
      marginBottom: '32px',
      background: '#f5f5f5',
      padding: '4px',
      borderRadius: '12px'
    },
    tab: {
      flex: 1,
      padding: '12px',
      border: 'none',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      background: 'transparent',
      color: '#666'
    },
    tabActive: {
      background: 'white',
      color: '#8B4513',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    inputGroup: {
      position: 'relative'
    },
    input: {
      width: '100%',
      padding: '14px 14px 14px 44px',
      border: '2px solid #f0f0f0',
      borderRadius: '12px',
      fontSize: '16px',
      outline: 'none',
      transition: 'all 0.3s',
      fontFamily: 'Montserrat, sans-serif'
    },
    inputIcon: {
      position: 'absolute',
      left: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#999'
    },
    eyeButton: {
      position: 'absolute',
      right: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      color: '#999',
      cursor: 'pointer',
      padding: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    forgotPassword: {
      textAlign: 'right',
      marginTop: '-8px'
    },
    forgotLink: {
      background: 'none',
      border: 'none',
      color: '#DAA520',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      textDecoration: 'none'
    },
    button: {
      width: '100%',
      padding: '16px',
      background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s',
      marginTop: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      margin: '24px 0',
      color: '#999',
      fontSize: '14px'
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      background: '#e0e0e0'
    },
    googleButton: {
      width: '100%',
      padding: '14px',
      background: 'white',
      color: '#333',
      border: '2px solid #e0e0e0',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    error: {
      background: '#fee',
      color: '#c33',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '14px',
      textAlign: 'center',
      marginTop: '16px'
    },
    trialBadge: {
      background: 'linear-gradient(135deg, #FFF8DC 0%, #FAEBD7 100%)',
      border: '2px dashed #DAA520',
      borderRadius: '12px',
      padding: '16px',
      textAlign: 'center',
      marginTop: '24px'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    },
    modalContent: {
      background: 'white',
      borderRadius: '16px',
      padding: '32px',
      maxWidth: '450px',
      width: '100%',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    },
    modalTitle: {
      fontSize: '24px',
      fontWeight: '800',
      color: '#8B4513',
      margin: '0 0 12px 0',
      textAlign: 'center'
    },
    modalText: {
      fontSize: '15px',
      color: '#666',
      margin: 0,
      textAlign: 'center',
      lineHeight: '1.5'
    },
    modalButtonPrimary: {
      flex: 1,
      padding: '14px',
      background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '15px',
      fontWeight: '700',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    modalButtonSecondary: {
      flex: 1,
      padding: '14px',
      background: '#f5f5f5',
      color: '#666',
      border: 'none',
      borderRadius: '10px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    successMessage: {
      textAlign: 'center',
      padding: '20px 0'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            👨‍🍳
          </div>
          <h1 style={styles.title}>Receitas Mais Rápidas</h1>
          <p style={styles.subtitle}>
            {mode === 'login' 
              ? 'Entre na sua conta' 
              : 'Crie sua conta grátis'}
          </p>
        </div>

        {/* TABS */}
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(mode === 'login' ? styles.tabActive : {})
            }}
            onClick={() => {
              setMode('login');
              setError('');
            }}
          >
            Entrar
          </button>
          <button
            style={{
              ...styles.tab,
              ...(mode === 'register' ? styles.tabActive : {})
            }}
            onClick={() => {
              setMode('register');
              setError('');
            }}
          >
            Criar Conta
          </button>
        </div>

        {/* FORM */}
        <form style={styles.form} onSubmit={mode === 'login' ? handleLogin : handleRegister}>
          {mode === 'register' && (
            <div style={styles.inputGroup}>
              <User style={styles.inputIcon} size={20} />
              <input
                type="text"
                placeholder="Seu nome"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={styles.input}
                disabled={loading}
                autoComplete="off"
              />
            </div>
          )}

          <div style={styles.inputGroup}>
            <Mail style={styles.inputIcon} size={20} />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={styles.input}
              disabled={loading}
              autoComplete="off"
              name="email-custom"
            />
          </div>

          <div style={styles.inputGroup}>
            <Lock style={styles.inputIcon} size={20} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha (mínimo 6 caracteres)"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              style={styles.input}
              disabled={loading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {mode === 'login' && (
            <div style={styles.forgotPassword}>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                style={styles.forgotLink}
              >
                Esqueci minha senha
              </button>
            </div>
          )}

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {})
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size={20} className="spinner" />
                {mode === 'login' ? 'Entrando...' : 'Criando conta...'}
              </>
            ) : (
              mode === 'login' ? 'Entrar' : 'Criar Conta Grátis'
            )}
          </button>
        </form>

        {/* DIVIDER */}
        <div style={styles.divider}>
          <div style={styles.dividerLine}></div>
          <span>ou</span>
          <div style={styles.dividerLine}></div>
        </div>

        {/* GOOGLE LOGIN */}
        <button
          style={styles.googleButton}
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <Chrome size={20} />
          Continuar com Google
        </button>

        {/* ERROR */}
        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {/* TRIAL BADGE */}
        {mode === 'register' && (
          <div style={styles.trialBadge}>
            <div style={{fontSize: '24px', marginBottom: '4px'}}>🎁</div>
            <div style={{fontWeight: '700', color: '#8B4513', marginBottom: '4px'}}>
              3 Dias Grátis!
            </div>
            <div style={{fontSize: '13px', color: '#666'}}>
              Sem cartão de crédito • Cancele quando quiser
            </div>
          </div>
        )}
      </div>

      {/* MODAL RECUPERAR SENHA */}
      {showForgotPassword && (
        <div style={styles.modalOverlay} onClick={() => setShowForgotPassword(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>🔑 Recuperar Senha</h3>
            
            {resetSuccess ? (
              <div style={styles.successMessage}>
                <div style={{fontSize: '48px', marginBottom: '16px'}}>✅</div>
                <p style={{margin: '0 0 8px 0', fontWeight: '600', fontSize: '16px'}}>
                  Email enviado com sucesso!
                </p>
                <p style={{margin: 0, fontSize: '14px', color: '#666'}}>
                  Verifique sua caixa de entrada e spam
                </p>
              </div>
            ) : (
              <>
                <p style={styles.modalText}>
                  Digite seu email e enviaremos um link para redefinir sua senha.
                </p>
                
                <form onSubmit={handlePasswordReset} style={{marginTop: '20px'}}>
                  <div style={styles.inputGroup}>
                    <Mail style={styles.inputIcon} size={20} />
                    <input
                      type="email"
                      placeholder="Seu email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      style={styles.input}
                      disabled={loading}
                      autoFocus
                    />
                  </div>

                  {error && (
                    <div style={{...styles.error, marginTop: '12px'}}>
                      {error}
                    </div>
                  )}

                  <div style={{display: 'flex', gap: '12px', marginTop: '20px'}}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setResetEmail('');
                        setError('');
                      }}
                      style={styles.modalButtonSecondary}
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      style={{
                        ...styles.modalButtonPrimary,
                        ...(loading && styles.buttonDisabled)
                      }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader size={16} className="spinner" />
                          Enviando...
                        </>
                      ) : (
                        'Enviar Link'
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthScreen;
