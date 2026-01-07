import { useState, useEffect } from 'react';
import { saveWeight, getWeightHistory } from '../firebase/profile';
import { Scale, Loader, TrendingDown, TrendingUp, Minus, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const WeightTracker = ({ user, userProfile, onUpdate }) => {
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [filter, setFilter] = useState('30'); // '7', '30', '90', 'all'
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Carregar histórico ao montar
  useEffect(() => {
    if (user?.uid) {
      loadHistory();
    }
  }, [user]);

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
      await loadHistory(); // Recarregar histórico
      if (onUpdate) onUpdate();
    } else {
      alert('Erro ao salvar peso: ' + result.error);
    }
    
    setLoading(false);
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    const result = await getWeightHistory(user.uid);
    if (result.success) {
      setHistory(result.history);
      setShowHistory(true);
    }
    setLoadingHistory(false);
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

  const getFilteredHistory = () => {
    if (!history.length) return [];
    
    const now = new Date();
    let filtered = [...history];
    
    if (filter === '7') {
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      filtered = history.filter(h => {
        const date = h.timestamp.toDate ? h.timestamp.toDate() : new Date(h.timestamp);
        return date >= weekAgo;
      });
    } else if (filter === '30') {
      const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
      filtered = history.filter(h => {
        const date = h.timestamp.toDate ? h.timestamp.toDate() : new Date(h.timestamp);
        return date >= monthAgo;
      });
    } else if (filter === '90') {
      const threeMonthsAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);
      filtered = history.filter(h => {
        const date = h.timestamp.toDate ? h.timestamp.toDate() : new Date(h.timestamp);
        return date >= threeMonthsAgo;
      });
    }
    
    return filtered.reverse(); // Mais antigo primeiro para o gráfico
  };

  const getChartData = () => {
    const filtered = getFilteredHistory();
    return filtered.map(h => ({
      date: formatDate(h.timestamp),
      weight: h.weight,
      timestamp: h.timestamp.toDate ? h.timestamp.toDate() : new Date(h.timestamp)
    }));
  };

  const getWeeklyChange = () => {
    if (history.length < 2) return null;
    
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    
    const recentWeights = history.filter(h => {
      const date = h.timestamp.toDate ? h.timestamp.toDate() : new Date(h.timestamp);
      return date >= weekAgo;
    });
    
    if (recentWeights.length < 2) return null;
    
    const latest = recentWeights[0].weight;
    const weekOld = recentWeights[recentWeights.length - 1].weight;
    const diff = latest - weekOld;
    
    return {
      value: Math.abs(diff).toFixed(1),
      isLoss: diff < 0
    };
  };

  const getMonthlyChange = () => {
    if (history.length < 2) return null;
    
    const now = new Date();
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    
    const recentWeights = history.filter(h => {
      const date = h.timestamp.toDate ? h.timestamp.toDate() : new Date(h.timestamp);
      return date >= monthAgo;
    });
    
    if (recentWeights.length < 2) return null;
    
    const latest = recentWeights[0].weight;
    const monthOld = recentWeights[recentWeights.length - 1].weight;
    const diff = latest - monthOld;
    
    return {
      value: Math.abs(diff).toFixed(1),
      isLoss: diff < 0
    };
  };

  const getTrend = () => {
    if (history.length < 3) return 'stable';
    
    const recent = history.slice(0, 3);
    const weights = recent.map(h => h.weight);
    
    const avgRecent = weights.reduce((a, b) => a + b, 0) / weights.length;
    const older = history.slice(3, 6).map(h => h.weight);
    
    if (older.length === 0) return 'stable';
    
    const avgOlder = older.reduce((a, b) => a + b, 0) / older.length;
    const diff = avgRecent - avgOlder;
    
    if (Math.abs(diff) < 0.3) return 'stable';
    return diff < 0 ? 'down' : 'up';
  };

  const diff = calculateDifference();
  const weeklyChange = getWeeklyChange();
  const monthlyChange = getMonthlyChange();
  const trend = getTrend();
  const chartData = getChartData();

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

      {/* CHART AND STATS */}
      {loadingHistory ? (
        <div style={{textAlign: 'center', padding: '40px'}}>
          <Loader size={32} className="spinner" style={{color: '#DAA520'}} />
          <p>Carregando histórico...</p>
        </div>
      ) : history.length === 0 ? (
        <div style={styles.emptyState}>
          <Scale size={48} style={{color: '#DAA520', opacity: 0.3}} />
          <p style={styles.emptyText}>Nenhum registro ainda</p>
          <p style={styles.emptyHint}>Registre seu peso acima para começar a acompanhar sua evolução!</p>
        </div>
      ) : (
        <div style={styles.statsSection}>
          {/* STATS CARDS */}
          <div style={styles.statsGrid}>
            {/* Peso Atual */}
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Peso Atual</div>
              <div style={styles.statValue}>{history[0]?.weight} kg</div>
            </div>

            {/* Peso Inicial */}
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Peso Inicial</div>
              <div style={styles.statValue}>{history[history.length - 1]?.weight} kg</div>
            </div>

            {/* Diferença Total */}
            {diff && (
              <div style={{
                ...styles.statCard,
                ...(diff.isLoss ? styles.statCardGreen : styles.statCardRed)
              }}>
                <div style={styles.statLabel}>Diferença Total</div>
                <div style={styles.statValue}>
                  {diff.isLoss ? '-' : '+'}{diff.value} kg
                </div>
              </div>
            )}

            {/* Meta */}
            {userProfile?.targetWeight && (
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Meta</div>
                <div style={styles.statValue}>{userProfile.targetWeight} kg</div>
              </div>
            )}
          </div>

          {/* FILTER BUTTONS */}
          <div style={styles.filterButtons}>
            <button
              onClick={() => setFilter('7')}
              style={{
                ...styles.filterButton,
                ...(filter === '7' && styles.filterButtonActive)
              }}
            >
              7 dias
            </button>
            <button
              onClick={() => setFilter('30')}
              style={{
                ...styles.filterButton,
                ...(filter === '30' && styles.filterButtonActive)
              }}
            >
              30 dias
            </button>
            <button
              onClick={() => setFilter('90')}
              style={{
                ...styles.filterButton,
                ...(filter === '90' && styles.filterButtonActive)
              }}
            >
              90 dias
            </button>
            <button
              onClick={() => setFilter('all')}
              style={{
                ...styles.filterButton,
                ...(filter === 'all' && styles.filterButtonActive)
              }}
            >
              Tudo
            </button>
          </div>

          {/* CHART */}
          {chartData.length > 1 ? (
            <div style={styles.chartContainer}>
              <h4 style={styles.chartTitle}>📊 Evolução do Peso</h4>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DAA520" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#DAA520" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{fontSize: 12, fill: '#666'}}
                    tickLine={{stroke: '#e0e0e0'}}
                  />
                  <YAxis 
                    domain={['dataMin - 2', 'dataMax + 2']}
                    tick={{fontSize: 12, fill: '#666'}}
                    tickLine={{stroke: '#e0e0e0'}}
                    label={{value: 'kg', angle: -90, position: 'insideLeft', style: {fontSize: 12, fill: '#666'}}}
                  />
                  <Tooltip 
                    contentStyle={{
                      background: 'white',
                      border: '2px solid #DAA520',
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}
                    labelStyle={{fontWeight: '600', color: '#8B4513'}}
                    formatter={(value) => [`${value} kg`, 'Peso']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#DAA520" 
                    strokeWidth={3}
                    fill="url(#colorWeight)"
                    dot={{fill: '#DAA520', r: 5}}
                    activeDot={{r: 7, fill: '#8B4513'}}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={styles.emptyChart}>
              <p>Registre mais pesos para ver o gráfico de evolução</p>
            </div>
          )}

          {/* PROGRESS CARDS */}
          <div style={styles.progressGrid}>
            {/* Semanal */}
            {weeklyChange && (
              <div style={styles.progressCard}>
                {weeklyChange.isLoss ? <TrendingDown size={20} style={{color: '#2E7D32'}} /> : <TrendingUp size={20} style={{color: '#D32F2F'}} />}
                <div>
                  <div style={styles.progressLabel}>Esta semana</div>
                  <div style={{...styles.progressValue, color: weeklyChange.isLoss ? '#2E7D32' : '#D32F2F'}}>
                    {weeklyChange.isLoss ? '-' : '+'}{weeklyChange.value} kg
                  </div>
                </div>
              </div>
            )}

            {/* Mensal */}
            {monthlyChange && (
              <div style={styles.progressCard}>
                {monthlyChange.isLoss ? <TrendingDown size={20} style={{color: '#2E7D32'}} /> : <TrendingUp size={20} style={{color: '#D32F2F'}} />}
                <div>
                  <div style={styles.progressLabel}>Este mês</div>
                  <div style={{...styles.progressValue, color: monthlyChange.isLoss ? '#2E7D32' : '#D32F2F'}}>
                    {monthlyChange.isLoss ? '-' : '+'}{monthlyChange.value} kg
                  </div>
                </div>
              </div>
            )}

            {/* Tendência */}
            <div style={styles.progressCard}>
              {trend === 'down' ? (
                <TrendingDown size={20} style={{color: '#2E7D32'}} />
              ) : trend === 'up' ? (
                <TrendingUp size={20} style={{color: '#D32F2F'}} />
              ) : (
                <Minus size={20} style={{color: '#666'}} />
              )}
              <div>
                <div style={styles.progressLabel}>Tendência</div>
                <div style={styles.progressValue}>
                  {trend === 'down' ? '↓ Perdendo' : trend === 'up' ? '↑ Ganhando' : '→ Estável'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#999'
  },
  emptyText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#666',
    margin: '16px 0 8px'
  },
  emptyHint: {
    fontSize: '13px',
    color: '#999',
    margin: 0
  },
  statsSection: {
    marginTop: '24px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
    marginBottom: '20px'
  },
  statCard: {
    background: 'white',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
    border: '2px solid #e0e0e0'
  },
  statCardGreen: {
    background: '#E8F5E9',
    borderColor: '#2E7D32'
  },
  statCardRed: {
    background: '#FFEBEE',
    borderColor: '#D32F2F'
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '8px',
    fontWeight: '600'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#8B4513'
  },
  filterButtons: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  filterButton: {
    flex: 1,
    minWidth: '70px',
    padding: '10px 16px',
    background: 'white',
    border: '2px solid #DAA520',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#8B4513',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  filterButtonActive: {
    background: '#DAA520',
    color: 'white'
  },
  chartContainer: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    border: '2px solid #e0e0e0'
  },
  chartTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: '16px',
    textAlign: 'center'
  },
  emptyChart: {
    background: 'white',
    borderRadius: '12px',
    padding: '40px 20px',
    textAlign: 'center',
    color: '#999',
    fontSize: '14px',
    border: '2px solid #e0e0e0'
  },
  progressGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px'
  },
  progressCard: {
    background: 'white',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    border: '2px solid #e0e0e0'
  },
  progressLabel: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '4px'
  },
  progressValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#8B4513'
  }
};

export default WeightTracker;
