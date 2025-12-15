import { useState } from 'react';
import { saveWeight, getWeightHistory } from '../firebase/profile';
import { Scale, Loader, TrendingDown, TrendingUp } from 'lucide-react';

const WeightTracker = ({ user, userProfile, onUpdate }) => {
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleSaveWeight = async (e) => {
    e.preventDefault();
    
    if (!weight || parseFloat(weight) <= 0) {
      alert('Digite um peso válido');
      return;
    }
    
    setLoading(true);
    
    const result = await saveWeight(user.uid, parseFloat(weight));
    
    if (result.success) {
      setWeight('');
      alert('Peso registrado com sucesso! ✅');
      if (onUpdate) onUpdate();
    } else {
      alert('Erro ao salvar peso: ' + result.error);
    }
    
    setLoading(false);
  };

  const loadHistory = async () => {
    const result = await getWeightHistory(user.uid);
    if (result.success) {
      setHistory(result.history);
      setShowHistory(true);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-BR');
  };

  const calculateDifference = () => {
    if (history.length < 2) return null;
    const latest = history[0].weight;
    const oldest = history[history.length - 1].weight;
    const diff = latest - oldest;
    return {
      value: Math.abs(diff).toFixed(1),
      isLoss: diff < 0
    };
  };

  const diff = calculateDifference();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.icon}>⚖️</div>
        <div>
          <h3 style={styles.title}>Registrar Peso</h3>
          <p style={styles.subtitle}>Acompanhe sua evolução</p>
        </div>
      </div>

      {/* CURRENT WEIGHT */}
      {userProfile?.weight && (
        <div style={styles.currentWeight}>
          <div style={styles.currentLabel}>Peso Atual no Perfil</div>
          <div style={styles.currentValue}>{userProfile.weight} kg</div>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSaveWeight} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Peso de Hoje (kg)</label>
          <input
            type="number"
            step="0.1"
            placeholder="Ex: 75.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            disabled={loading}
            style={styles.input}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{...styles.button, ...(loading && styles.buttonDisabled)}}
        >
          {loading ? (
            <><Loader size={18} className="spinner" /> Salvando...</>
          ) : (
            <><Scale size={18} /> Registrar Peso</>
          )}
        </button>
      </form>

      {/* HISTORY */}
      <div style={styles.historySection}>
        {!showHistory ? (
          <button onClick={loadHistory} style={styles.historyButton}>
            Ver Histórico de Peso
          </button>
        ) : (
          <div>
            <h4 style={styles.historyTitle}>Histórico</h4>
            
            {diff && (
              <div style={{
                ...styles.diffCard,
                ...(diff.isLoss ? styles.diffCardGreen : styles.diffCardRed)
              }}>
                <div style={styles.diffIcon}>
                  {diff.isLoss ? <TrendingDown size={24} /> : <TrendingUp size={24} />}
                </div>
                <div>
                  <div style={styles.diffValue}>
                    {diff.isLoss ? '-' : '+'}{diff.value} kg
                  </div>
                  <div style={styles.diffLabel}>
                    {diff.isLoss ? 'Perdeu' : 'Ganhou'} desde o primeiro registro
                  </div>
                </div>
              </div>
            )}
            
            {history.length === 0 ? (
              <p style={styles.emptyHistory}>Nenhum registro ainda</p>
            ) : (
              <div style={styles.historyList}>
                {history.map((entry, index) => (
                  <div key={index} style={styles.historyItem}>
                    <div style={styles.historyDate}>{formatDate(entry.date)}</div>
                    <div style={styles.historyWeight}>{entry.weight} kg</div>
                  </div>
                ))}
              </div>
            )}

            <button 
              onClick={() => setShowHistory(false)} 
              style={styles.closeButton}
            >
              Fechar Histórico
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: 'linear-gradient(135deg, #FFF8DC 0%, #FAEBD7 100%)',
    border: '2px solid #DAA520',
    borderRadius: '12px',
    padding: '24px',
    marginTop: '24px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px'
  },
  icon: {
    fontSize: '32px'
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#8B4513',
    margin: 0
  },
  subtitle: {
    fontSize: '13px',
    color: '#666',
    margin: '4px 0 0 0'
  },
  currentWeight: {
    background: 'white',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
    marginBottom: '20px'
  },
  currentLabel: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '8px'
  },
  currentValue: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#8B4513'
  },
  form: {
    marginBottom: '20px'
  },
  inputGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  },
  button: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  historySection: {
    borderTop: '1px dashed #DAA520',
    paddingTop: '20px'
  },
  historyButton: {
    width: '100%',
    padding: '10px',
    background: 'white',
    color: '#8B4513',
    border: '2px solid #DAA520',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  historyTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: '16px'
  },
  diffCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '16px'
  },
  diffCardGreen: {
    background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
    border: '2px solid #4CAF50'
  },
  diffCardRed: {
    background: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
    border: '2px solid #f44336'
  },
  diffIcon: {
    fontSize: '24px'
  },
  diffValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#8B4513'
  },
  diffLabel: {
    fontSize: '13px',
    color: '#666'
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
    maxHeight: '200px',
    overflowY: 'auto'
  },
  historyItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px',
    background: 'white',
    borderRadius: '6px'
  },
  historyDate: {
    fontSize: '14px',
    color: '#666'
  },
  historyWeight: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#8B4513'
  },
  emptyHistory: {
    textAlign: 'center',
    color: '#999',
    fontSize: '14px',
    padding: '20px'
  },
  closeButton: {
    width: '100%',
    padding: '8px',
    background: '#f5f5f5',
    color: '#666',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

export default WeightTracker;
