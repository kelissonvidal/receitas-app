import { useState, useEffect } from 'react';
import { getUserPreferences } from '../firebase/preferences';
import { Loader, RefreshCw, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import PreferencesQuiz from './PreferencesQuiz';

const MealPlan = ({ user, userProfile }) => {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    setLoading(true);
    const result = await getUserPreferences(user.uid);
    if (result.success) {
      setPreferences(result.preferences);
    }
    setLoading(false);
  };

  const handleGeneratePlan = async () => {
    setGenerating(true);
    
    // Simular geração (em produção, chamaria Gemini API)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Plano exemplo
    const examplePlan = {
      weekStart: new Date(),
      days: [
        {
          day: 'Segunda-feira',
          date: '08/01',
          meals: [
            {
              type: 'breakfast',
              name: 'Café da Manhã',
              icon: '☕',
              calories: 450,
              options: [
                {
                  name: 'Opção A',
                  items: ['2 fatias de pão integral', '2 ovos mexidos', 'Café com leite'],
                  protein: 18,
                  carbs: 45,
                  fat: 12
                },
                {
                  name: 'Opção B',
                  items: ['Tapioca com queijo', 'Suco de laranja natural'],
                  protein: 15,
                  carbs: 50,
                  fat: 8
                }
              ],
              selected: 0
            },
            {
              type: 'lunch',
              name: 'Almoço',
              icon: '🍱',
              calories: 650,
              options: [
                {
                  name: 'Opção A',
                  items: ['150g arroz branco', '150g frango grelhado', 'Salada de alface e tomate', 'Feijão'],
                  protein: 55,
                  carbs: 70,
                  fat: 15
                },
                {
                  name: 'Opção B',
                  items: ['Macarrão integral', 'Carne moída magra', 'Legumes refogados'],
                  protein: 50,
                  carbs: 75,
                  fat: 18
                }
              ],
              selected: 0
            },
            {
              type: 'snack',
              name: 'Lanche',
              icon: '🍪',
              calories: 200,
              options: [
                {
                  name: 'Opção A',
                  items: ['Iogurte natural', 'Frutas vermelhas', 'Granola'],
                  protein: 10,
                  carbs: 25,
                  fat: 5
                }
              ],
              selected: 0
            },
            {
              type: 'dinner',
              name: 'Jantar',
              icon: '🍽️',
              calories: 550,
              options: [
                {
                  name: 'Opção A',
                  items: ['150g salmão grelhado', '150g batata doce', 'Legumes assados'],
                  protein: 45,
                  carbs: 50,
                  fat: 20
                }
              ],
              selected: 0
            }
          ]
        }
      ]
    };
    
    setPlan(examplePlan);
    setGenerating(false);
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <Loader size={32} className="spinner" style={{color: '#DAA520'}} />
        <p>Carregando...</p>
      </div>
    );
  }

  if (!preferences && !showQuiz) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🍽️</div>
          <h3 style={styles.emptyTitle}>Configure suas Preferências</h3>
          <p style={styles.emptyText}>
            Para criar um plano semanal personalizado, primeiro precisamos conhecer suas preferências alimentares!
          </p>
          <button
            onClick={() => setShowQuiz(true)}
            style={styles.primaryButton}
          >
            Começar Questionário
          </button>
        </div>
      </div>
    );
  }

  if (showQuiz) {
    return (
      <PreferencesQuiz
        user={user}
        onComplete={() => {
          setShowQuiz(false);
          loadPreferences();
        }}
      />
    );
  }

  if (!plan) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>📅 Plano Semanal</h2>
            <p style={styles.subtitle}>
              Baseado em: {userProfile?.calculated?.calories || 2000} kcal/dia
            </p>
          </div>
          <button
            onClick={() => setShowQuiz(true)}
            style={styles.secondaryButton}
          >
            Editar Preferências
          </button>
        </div>

        <div style={styles.generateCard}>
          <div style={styles.generateIcon}>🤖</div>
          <h3 style={styles.generateTitle}>Gerar Plano Personalizado</h3>
          <p style={styles.generateText}>
            A IA vai criar um plano semanal de refeições baseado em suas preferências, objetivo e necessidades nutricionais.
          </p>
          <button
            onClick={handleGeneratePlan}
            disabled={generating}
            style={{...styles.generateButton, ...(generating && styles.buttonDisabled)}}
          >
            {generating ? (
              <><Loader size={18} className="spinner" /> Gerando...</>
            ) : (
              <><RefreshCw size={18} /> Gerar Plano</>
            )}
          </button>
        </div>

        <div style={styles.infoCard}>
          <h4 style={styles.infoTitle}>✨ Seu plano terá:</h4>
          <ul style={styles.infoList}>
            <li>7 dias de refeições completas</li>
            <li>2-3 opções para cada refeição</li>
            <li>Baseado nos alimentos que você gosta</li>
            <li>Respeitando suas restrições</li>
            <li>Dentro do seu orçamento</li>
            <li>Tempo de preparo adequado</li>
          </ul>
        </div>
      </div>
    );
  }

  // Exibir plano
  const day = plan.days[0]; // Por simplicidade, mostrando só 1 dia

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>📅 Seu Plano Semanal</h2>
          <p style={styles.subtitle}>
            Semana de {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
        <button
          onClick={handleGeneratePlan}
          style={styles.secondaryButton}
        >
          <RefreshCw size={16} /> Gerar Novo
        </button>
      </div>

      <div style={styles.dayCard}>
        <div
          onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
          style={styles.dayHeader}
        >
          <div>
            <h3 style={styles.dayTitle}>📅 {day.day}</h3>
            <p style={styles.dayDate}>{day.date}</p>
          </div>
          {expandedDay === day.day ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>

        {expandedDay === day.day && (
          <div style={styles.dayContent}>
            {day.meals.map((meal, idx) => (
              <div key={idx} style={styles.mealSection}>
                <div style={styles.mealHeader}>
                  <div>
                    <h4 style={styles.mealTitle}>
                      {meal.icon} {meal.name}
                    </h4>
                    <p style={styles.mealCalories}>{meal.calories} kcal</p>
                  </div>
                </div>

                {meal.options.map((option, optIdx) => (
                  <div
                    key={optIdx}
                    style={{
                      ...styles.optionCard,
                      ...(meal.selected === optIdx && styles.optionCardActive)
                    }}
                  >
                    <div style={styles.optionHeader}>
                      <strong>{option.name}</strong>
                      {meal.selected === optIdx && <span style={styles.selectedBadge}>✓ Selecionada</span>}
                    </div>
                    <ul style={styles.itemsList}>
                      {option.items.map((item, itemIdx) => (
                        <li key={itemIdx}>{item}</li>
                      ))}
                    </ul>
                    <div style={styles.macros}>
                      <span>🥩 {option.protein}g proteína</span>
                      <span>🍞 {option.carbs}g carbos</span>
                      <span>🥑 {option.fat}g gordura</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <div style={styles.dayTotal}>
              <h4 style={styles.totalTitle}>📊 Total do Dia</h4>
              <div style={styles.totalGrid}>
                <div style={styles.totalItem}>
                  <span style={styles.totalLabel}>Calorias</span>
                  <span style={styles.totalValue}>1850 kcal</span>
                </div>
                <div style={styles.totalItem}>
                  <span style={styles.totalLabel}>Proteínas</span>
                  <span style={styles.totalValue}>128g</span>
                </div>
                <div style={styles.totalItem}>
                  <span style={styles.totalLabel}>Carboidratos</span>
                  <span style={styles.totalValue}>190g</span>
                </div>
                <div style={styles.totalItem}>
                  <span style={styles.totalLabel}>Gorduras</span>
                  <span style={styles.totalValue}>55g</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={styles.infoNote}>
        💡 <strong>Dica:</strong> Este é um exemplo simplificado. Na versão completa, você terá 7 dias com múltiplas opções e poderá trocar livremente!
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px'
  },
  loading: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'white',
    borderRadius: '12px'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: '12px'
  },
  emptyText: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '24px',
    maxWidth: '500px',
    margin: '0 auto 24px'
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
    margin: '0 0 4px 0'
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: 0
  },
  primaryButton: {
    padding: '14px 28px',
    background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'white',
    color: '#8B4513',
    border: '2px solid #DAA520',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  generateCard: {
    background: 'linear-gradient(135deg, #FFF8DC 0%, #FAEBD7 100%)',
    border: '2px solid #DAA520',
    borderRadius: '12px',
    padding: '32px',
    textAlign: 'center',
    marginBottom: '24px'
  },
  generateIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  generateTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: '12px'
  },
  generateText: {
    fontSize: '15px',
    color: '#666',
    marginBottom: '24px',
    maxWidth: '600px',
    margin: '0 auto 24px'
  },
  generateButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 28px',
    background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  infoCard: {
    background: 'white',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    padding: '24px'
  },
  infoTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: '12px'
  },
  infoList: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.8',
    paddingLeft: '20px'
  },
  dayCard: {
    background: 'white',
    border: '2px solid #DAA520',
    borderRadius: '12px',
    marginBottom: '16px',
    overflow: 'hidden'
  },
  dayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #FFF8DC 0%, #FAEBD7 100%)'
  },
  dayTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#8B4513',
    margin: '0 0 4px 0'
  },
  dayDate: {
    fontSize: '13px',
    color: '#666',
    margin: 0
  },
  dayContent: {
    padding: '20px'
  },
  mealSection: {
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid #e0e0e0'
  },
  mealHeader: {
    marginBottom: '16px'
  },
  mealTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#8B4513',
    margin: '0 0 4px 0'
  },
  mealCalories: {
    fontSize: '13px',
    color: '#666',
    margin: 0
  },
  optionCard: {
    background: '#f9f9f9',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px'
  },
  optionCardActive: {
    background: '#E8F5E9',
    borderColor: '#4CAF50'
  },
  optionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    fontSize: '14px',
    color: '#333'
  },
  selectedBadge: {
    padding: '4px 8px',
    background: '#4CAF50',
    color: 'white',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600'
  },
  itemsList: {
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.6',
    paddingLeft: '20px',
    marginBottom: '12px'
  },
  macros: {
    display: 'flex',
    gap: '16px',
    fontSize: '12px',
    color: '#666',
    fontWeight: '600'
  },
  dayTotal: {
    background: 'linear-gradient(135deg, #FFF8DC 0%, #FAEBD7 100%)',
    border: '2px solid #DAA520',
    borderRadius: '8px',
    padding: '20px',
    marginTop: '24px'
  },
  totalTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: '16px'
  },
  totalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '16px'
  },
  totalItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  totalLabel: {
    fontSize: '12px',
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  totalValue: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#8B4513'
  },
  infoNote: {
    padding: '16px',
    background: '#E3F2FD',
    border: '2px solid #2196F3',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1565C0',
    marginTop: '16px'
  }
};

export default MealPlan;
