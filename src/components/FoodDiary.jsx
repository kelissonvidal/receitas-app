import { useState, useEffect } from 'react';
import { addMealByText, getTodayDiary, getDiaryByDate, calculateDeficitSurplus, deleteMeal } from '../firebase/diary';
import { Loader, Plus, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const FoodDiary = ({ user, userProfile }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [diary, setDiary] = useState(null);
  const [deficitData, setDeficitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [mealData, setMealData] = useState({
    description: '',
    type: 'lunch'
  });

  // Carregar diário ao montar
  useEffect(() => {
    loadDiary();
  }, [selectedDate]);

  const loadDiary = async () => {
    setLoading(true);
    const result = await getDiaryByDate(user.uid, selectedDate);
    if (result.success) {
      setDiary(result.diary);
    }
    
    // Calcular déficit/superávit
    const deficitResult = await calculateDeficitSurplus(user.uid, selectedDate);
    if (deficitResult.success) {
      setDeficitData(deficitResult.result);
    }
    
    setLoading(false);
  };

  const handleAddMeal = async (e) => {
    e.preventDefault();
    
    if (!mealData.description.trim()) {
      alert('Digite o que você comeu');
      return;
    }
    
    setAdding(true);
    
    try {
      const result = await addMealByText(user.uid, {
        description: mealData.description,
        type: mealData.type
      });
      
      if (result.success) {
        setMealData({ description: '', type: 'lunch' });
        setShowForm(false);
        await loadDiary(); // Recarregar
      } else {
        alert('Erro ao adicionar refeição: ' + (result.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Error adding meal:', error);
      alert('Erro ao adicionar refeição. Verifique sua conexão e tente novamente.');
    }
    
    setAdding(false);
  };

  const handleDeleteMeal = async (mealId) => {
    if (!confirm('Deletar esta refeição?')) return;
    
    const today = new Date().toISOString().split('T')[0];
    const result = await deleteMeal(user.uid, today, mealId);
    
    if (result.success) {
      await loadDiary();
    } else {
      alert('Erro ao deletar: ' + result.error);
    }
  };

  const getMealTypeLabel = (type) => {
    const labels = {
      breakfast: '☕ Café da Manhã',
      lunch: '🍽️ Almoço',
      snack: '🍎 Lanche',
      dinner: '🌙 Jantar'
    };
    return labels[type] || type;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <Loader size={32} className="spinner" />
        <p>Carregando diário...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>📊 Diário Alimentar</h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            style={styles.dateInput}
          />
        </div>
        <button onClick={() => setShowForm(!showForm)} style={styles.addButton}>
          <Plus size={20} />
          Adicionar Refeição
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <form onSubmit={handleAddMeal} style={styles.form}>
          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Tipo de Refeição</label>
              <select
                value={mealData.type}
                onChange={(e) => setMealData({...mealData, type: e.target.value})}
                style={styles.select}
              >
                <option value="breakfast">☕ Café da Manhã</option>
                <option value="lunch">🍽️ Almoço</option>
                <option value="snack">🍎 Lanche</option>
                <option value="dinner">🌙 Jantar</option>
              </select>
            </div>

            <div style={{...styles.inputGroup, gridColumn: '1 / -1'}}>
              <label style={styles.label}>O que você comeu?</label>
              <textarea
                placeholder="Ex: Arroz, feijão, frango grelhado e salada"
                value={mealData.description}
                onChange={(e) => setMealData({...mealData, description: e.target.value})}
                style={styles.textarea}
                rows={3}
                disabled={adding}
              />
            </div>
          </div>

          <div style={styles.formButtons}>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setMealData({ description: '', type: 'lunch' });
              }}
              style={styles.cancelButton}
              disabled={adding}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={adding}
            >
              {adding ? (
                <><Loader size={18} className="spinner" /> Analisando com IA...</>
              ) : (
                'Adicionar'
              )}
            </button>
          </div>
        </form>
      )}

      {/* SUMMARY CARDS */}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Meta Diária</div>
          <div style={styles.summaryValue}>
            {deficitData?.targetCalories || userProfile?.calculated?.targetCalories || '---'}
          </div>
          <div style={styles.summarySubtext}>kcal</div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Consumido</div>
          <div style={styles.summaryValue}>
            {diary?.summary?.totalCalories || 0}
          </div>
          <div style={styles.summarySubtext}>kcal</div>
        </div>

        <div style={{
          ...styles.summaryCard,
          ...((deficitData?.result?.status === 'deficit') ? styles.summaryCardGreen :
              (deficitData?.result?.status === 'surplus') ? styles.summaryCardRed :
              (deficitData?.result?.status === 'balanced') ? styles.summaryCardYellow : {})
        }}>
          <div style={styles.summaryLabel}>
            {deficitData?.result?.status === 'deficit' ? 'Déficit' : 
             deficitData?.result?.status === 'surplus' ? 'Superávit' : 
             'Balanço'}
          </div>
          <div style={{...styles.summaryValue, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
            {deficitData?.result?.status === 'deficit' && <TrendingDown size={28} />}
            {deficitData?.result?.status === 'surplus' && <TrendingUp size={28} />}
            {deficitData?.result?.status === 'balanced' && <Minus size={28} />}
            {Math.abs(deficitData?.result?.difference || 0)}
          </div>
          <div style={styles.summarySubtext}>kcal</div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Refeições</div>
          <div style={styles.summaryValue}>
            {diary?.meals?.length || 0}
          </div>
          <div style={styles.summarySubtext}>hoje</div>
        </div>
      </div>

      {/* PROGRESS BAR */}
      {deficitData?.result && (
        <div style={styles.progressContainer}>
          <div style={styles.progressLabel}>
            <span>Progresso do Dia</span>
            <span style={{fontWeight: '700'}}>{deficitData.result.percentage || 0}%</span>
          </div>
          <div style={styles.progressBar}>
            <div style={{
              ...styles.progressFill,
              width: `${Math.min(deficitData.result.percentage || 0, 100)}%`,
              background: (deficitData.result.percentage || 0) > 100 ? '#f44336' :
                         (deficitData.result.percentage || 0) > 90 ? '#ff9800' :
                         'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)'
            }} />
          </div>
        </div>
      )}

      {/* MEALS LIST */}
      <div style={styles.mealsSection}>
        <h3 style={styles.mealsTitle}>Refeições de Hoje</h3>
        
        {(!diary?.meals || diary.meals.length === 0) ? (
          <div style={styles.emptyState}>
            <div style={{fontSize: '48px', marginBottom: '16px'}}>🍽️</div>
            <p style={{fontSize: '16px', color: '#666', marginBottom: '8px'}}>
              Nenhuma refeição registrada hoje
            </p>
            <p style={{fontSize: '14px', color: '#999'}}>
              Clique em "Adicionar Refeição" para começar
            </p>
          </div>
        ) : (
          <div style={styles.mealsList}>
            {diary.meals.map((meal) => (
              <div key={meal.id} style={styles.mealCard}>
                <div style={styles.mealHeader}>
                  <div>
                    <div style={styles.mealType}>{getMealTypeLabel(meal.type)}</div>
                    <div style={styles.mealTime}>{formatTime(meal.time)}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteMeal(meal.id)}
                    style={styles.deleteButton}
                    title="Deletar refeição"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div style={styles.mealDescription}>
                  {meal.description}
                </div>

                <div style={styles.mealNutrition}>
                  <div style={styles.nutritionItem}>
                    <span style={styles.nutritionLabel}>Calorias</span>
                    <span style={styles.nutritionValue}>{meal.totalCalories} kcal</span>
                  </div>
                  <div style={styles.nutritionItem}>
                    <span style={styles.nutritionLabel}>Proteínas</span>
                    <span style={styles.nutritionValue}>{meal.totalProtein}g</span>
                  </div>
                  <div style={styles.nutritionItem}>
                    <span style={styles.nutritionLabel}>Carbs</span>
                    <span style={styles.nutritionValue}>{meal.totalCarbs}g</span>
                  </div>
                  <div style={styles.nutritionItem}>
                    <span style={styles.nutritionLabel}>Gorduras</span>
                    <span style={styles.nutritionValue}>{meal.totalFat}g</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto'
  },
  loading: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#8B4513',
    margin: 0
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: '4px 0 0 0',
    textTransform: 'capitalize'
  },
  dateInput: {
    marginTop: '8px',
    padding: '8px 12px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '16px',
    outline: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit'
  },
  addButton: {
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  form: {
    background: '#f9f9f9',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '16px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#8B4513'
  },
  select: {
    padding: '10px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit'
  },
  textarea: {
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  formButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  },
  cancelButton: {
    padding: '10px 20px',
    background: '#f5f5f5',
    color: '#666',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  submitButton: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  summaryCard: {
    background: '#f9f9f9',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center'
  },
  summaryCardGreen: {
    background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
    border: '2px solid #4CAF50'
  },
  summaryCardRed: {
    background: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
    border: '2px solid #f44336'
  },
  summaryCardYellow: {
    background: 'linear-gradient(135deg, #FFF8E1 0%, #FFE082 100%)',
    border: '2px solid #FFC107'
  },
  summaryLabel: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '8px',
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  summaryValue: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#8B4513',
    marginBottom: '4px'
  },
  summarySubtext: {
    fontSize: '13px',
    color: '#999'
  },
  progressContainer: {
    marginBottom: '32px'
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px'
  },
  progressBar: {
    height: '12px',
    background: '#f0f0f0',
    borderRadius: '6px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    transition: 'width 0.5s ease'
  },
  mealsSection: {
    marginTop: '32px'
  },
  mealsTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: '16px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: '#f9f9f9',
    borderRadius: '12px'
  },
  mealsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  mealCard: {
    background: 'white',
    border: '2px solid #f0f0f0',
    borderRadius: '12px',
    padding: '20px'
  },
  mealHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px'
  },
  mealType: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: '4px'
  },
  mealTime: {
    fontSize: '13px',
    color: '#999'
  },
  deleteButton: {
    padding: '8px',
    background: '#fee',
    color: '#c33',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  mealDescription: {
    fontSize: '15px',
    color: '#666',
    marginBottom: '16px',
    lineHeight: '1.5'
  },
  mealNutrition: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px',
    paddingTop: '16px',
    borderTop: '1px solid #f0f0f0'
  },
  nutritionItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  nutritionLabel: {
    fontSize: '12px',
    color: '#999',
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  nutritionValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#333'
  }
};

export default FoodDiary;
