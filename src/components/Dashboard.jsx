import { useState, useEffect } from 'react';
import { getWeekSummary } from '../firebase/diary';
import { Loader, TrendingUp, TrendingDown, Calendar, Target } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Dashboard = ({ user, userProfile }) => {
  const [weekData, setWeekData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadWeekData();
  }, []);

  const loadWeekData = async () => {
    setLoading(true);
    
    const result = await getWeekSummary(user.uid);
    
    if (result.success) {
      const formattedData = result.weekData.map(day => ({
        ...day,
        dayName: getDayName(day.date),
        shortDate: formatShortDate(day.date),
        target: userProfile?.calculated?.targetCalories || 2000
      }));
      
      setWeekData(formattedData);
      calculateStats(formattedData);
    }
    
    setLoading(false);
  };

  const calculateStats = (data) => {
    const totalCalories = data.reduce((sum, day) => sum + day.totalCalories, 0);
    const avgCalories = Math.round(totalCalories / data.length);
    
    const daysWithMeals = data.filter(day => day.mealsCount > 0).length;
    const totalMeals = data.reduce((sum, day) => sum + day.mealsCount, 0);
    
    const target = userProfile?.calculated?.targetCalories || 2000;
    const avgDeficit = target - avgCalories;
    
    setStats({
      avgCalories,
      daysWithMeals,
      totalMeals,
      avgDeficit,
      weeklyTotal: totalCalories
    });
  };

  const getDayName = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { weekday: 'short' });
  };

  const formatShortDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <Loader size={32} className="spinner" />
        <p>Carregando estatísticas...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📈 Dashboard</h2>
      <p style={styles.subtitle}>Visão geral dos últimos 7 dias</p>

      {/* STATS CARDS */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🔥</div>
          <div style={styles.statValue}>{stats?.avgCalories || 0}</div>
          <div style={styles.statLabel}>Média Diária (kcal)</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>📅</div>
          <div style={styles.statValue}>{stats?.daysWithMeals || 0}/7</div>
          <div style={styles.statLabel}>Dias Registrados</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>🍽️</div>
          <div style={styles.statValue}>{stats?.totalMeals || 0}</div>
          <div style={styles.statLabel}>Refeições Total</div>
        </div>

        <div style={{
          ...styles.statCard,
          ...(stats?.avgDeficit > 0 ? styles.statCardGreen : styles.statCardRed)
        }}>
          <div style={styles.statIcon}>
            {stats?.avgDeficit > 0 ? <TrendingDown size={24} /> : <TrendingUp size={24} />}
          </div>
          <div style={styles.statValue}>{Math.abs(stats?.avgDeficit || 0)}</div>
          <div style={styles.statLabel}>
            {stats?.avgDeficit > 0 ? 'Déficit Médio' : 'Superávit Médio'}
          </div>
        </div>
      </div>

      {/* CALORIES CHART */}
      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>📊 Calorias por Dia</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weekData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="dayName" 
              tick={{ fill: '#666', fontSize: 12 }}
            />
            <YAxis 
              tick={{ fill: '#666', fontSize: 12 }}
              label={{ value: 'kcal', angle: -90, position: 'insideLeft', fill: '#666' }}
            />
            <Tooltip 
              contentStyle={{
                background: 'white',
                border: '2px solid #f0f0f0',
                borderRadius: '8px',
                padding: '12px'
              }}
              formatter={(value) => [`${value} kcal`, 'Consumido']}
              labelFormatter={(label) => `${label}`}
            />
            <Legend />
            <Bar 
              dataKey="totalCalories" 
              fill="#DAA520" 
              name="Consumido"
              radius={[8, 8, 0, 0]}
            />
            <Bar 
              dataKey="target" 
              fill="#e0e0e0" 
              name="Meta"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* MACROS CHART */}
      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>🥗 Evolução de Macronutrientes</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weekData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="shortDate" 
              tick={{ fill: '#666', fontSize: 12 }}
            />
            <YAxis 
              tick={{ fill: '#666', fontSize: 12 }}
              label={{ value: 'gramas', angle: -90, position: 'insideLeft', fill: '#666' }}
            />
            <Tooltip 
              contentStyle={{
                background: 'white',
                border: '2px solid #f0f0f0',
                borderRadius: '8px',
                padding: '12px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="totalProtein" 
              stroke="#E91E63" 
              name="Proteínas (g)"
              strokeWidth={2}
              dot={{ fill: '#E91E63', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="totalCarbs" 
              stroke="#2196F3" 
              name="Carboidratos (g)"
              strokeWidth={2}
              dot={{ fill: '#2196F3', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="totalFat" 
              stroke="#FF9800" 
              name="Gorduras (g)"
              strokeWidth={2}
              dot={{ fill: '#FF9800', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* WEEKLY SUMMARY */}
      <div style={styles.summaryCard}>
        <h3 style={styles.summaryTitle}>📋 Resumo da Semana</h3>
        <div style={styles.summaryGrid}>
          <div style={styles.summaryItem}>
            <div style={styles.summaryLabel}>Total Consumido</div>
            <div style={styles.summaryValue}>{stats?.weeklyTotal?.toLocaleString() || 0} kcal</div>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.summaryLabel}>Meta Semanal</div>
            <div style={styles.summaryValue}>
              {((userProfile?.calculated?.targetCalories || 0) * 7).toLocaleString()} kcal
            </div>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.summaryLabel}>Diferença</div>
            <div style={{
              ...styles.summaryValue,
              color: stats?.avgDeficit > 0 ? '#4CAF50' : '#f44336'
            }}>
              {stats?.avgDeficit > 0 ? '-' : '+'}{Math.abs((stats?.avgDeficit || 0) * 7).toLocaleString()} kcal
            </div>
          </div>
        </div>
      </div>

      {/* INSIGHTS */}
      {stats && (
        <div style={styles.insightsCard}>
          <h3 style={styles.insightsTitle}>💡 Insights</h3>
          <div style={styles.insightsList}>
            {stats.daysWithMeals < 7 && (
              <div style={styles.insightItem}>
                <div style={{fontSize: '24px', marginBottom: '8px'}}>📅</div>
                <p style={styles.insightText}>
                  Você registrou {stats.daysWithMeals} de 7 dias. Continue registrando para melhor acompanhamento!
                </p>
              </div>
            )}
            
            {stats.avgDeficit > 0 && (
              <div style={styles.insightItem}>
                <div style={{fontSize: '24px', marginBottom: '8px'}}>🎯</div>
                <p style={styles.insightText}>
                  Ótimo! Você está mantendo um déficit calórico médio de {Math.round(stats.avgDeficit)} kcal/dia.
                </p>
              </div>
            )}
            
            {stats.avgDeficit < 0 && Math.abs(stats.avgDeficit) > 500 && (
              <div style={styles.insightItem}>
                <div style={{fontSize: '24px', marginBottom: '8px'}}>⚠️</div>
                <p style={styles.insightText}>
                  Atenção! Você está em superávit de {Math.abs(Math.round(stats.avgDeficit))} kcal/dia em média.
                </p>
              </div>
            )}
            
            {stats.totalMeals / stats.daysWithMeals < 3 && stats.daysWithMeals > 0 && (
              <div style={styles.insightItem}>
                <div style={{fontSize: '24px', marginBottom: '8px'}}>🍽️</div>
                <p style={styles.insightText}>
                  Você está fazendo menos de 3 refeições por dia em média. Considere dividir melhor suas refeições.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  loading: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666'
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#8B4513',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '32px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '32px'
  },
  statCard: {
    background: '#f9f9f9',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center'
  },
  statCardGreen: {
    background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
    border: '2px solid #4CAF50'
  },
  statCardRed: {
    background: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
    border: '2px solid #f44336'
  },
  statIcon: {
    fontSize: '32px',
    marginBottom: '12px'
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#8B4513',
    marginBottom: '8px'
  },
  statLabel: {
    fontSize: '13px',
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  chartCard: {
    background: 'white',
    border: '2px solid #f0f0f0',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px'
  },
  chartTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: '24px'
  },
  summaryCard: {
    background: '#f9f9f9',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px'
  },
  summaryTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: '16px'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px'
  },
  summaryItem: {
    textAlign: 'center'
  },
  summaryLabel: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '8px'
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#8B4513'
  },
  insightsCard: {
    background: 'linear-gradient(135deg, #FFF8DC 0%, #FAEBD7 100%)',
    border: '2px dashed #DAA520',
    borderRadius: '12px',
    padding: '24px'
  },
  insightsTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: '16px'
  },
  insightsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  insightItem: {
    background: 'white',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center'
  },
  insightText: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
    lineHeight: '1.6'
  }
};

export default Dashboard;
