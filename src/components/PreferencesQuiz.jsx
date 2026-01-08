import { useState } from 'react';
import { saveUserPreferences } from '../firebase/preferences';
import { Loader, ArrowRight, ArrowLeft, Check } from 'lucide-react';

const PreferencesQuiz = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [preferences, setPreferences] = useState({
    breakfast: [],
    proteins: [],
    carbs: [],
    vegetables: [],
    fruits: [],
    avoid: [],
    mealsPerDay: 4,
    complexity: 'moderado',
    budget: 'moderado'
  });

  const handleSave = async () => {
    setSaving(true);
    
    const result = await saveUserPreferences(user.uid, preferences);
    
    if (result.success) {
      onComplete();
    } else {
      alert('Erro ao salvar: ' + result.error);
    }
    
    setSaving(false);
  };

  const toggleItem = (category, item) => {
    if (preferences[category].includes(item)) {
      setPreferences({
        ...preferences,
        [category]: preferences[category].filter(i => i !== item)
      });
    } else {
      setPreferences({
        ...preferences,
        [category]: [...preferences[category], item]
      });
    }
  };

  // STEP 1: Café da Manhã
  const renderStep1 = () => (
    <div>
      <h3 style={styles.stepTitle}>☕ Café da Manhã</h3>
      <p style={styles.stepSubtitle}>O que você costuma comer no café?</p>

      <div style={styles.optionsGrid}>
        {[
          'Pão francês', 'Pão integral', 'Tapioca', 'Ovos', 'Frutas',
          'Iogurte', 'Aveia', 'Granola', 'Queijo', 'Presunto',
          'Manteiga', 'Café com leite', 'Suco', 'Vitamina'
        ].map(item => (
          <button
            key={item}
            onClick={() => toggleItem('breakfast', item)}
            style={{
              ...styles.optionButton,
              ...(preferences.breakfast.includes(item) && styles.optionButtonActive)
            }}
          >
            {preferences.breakfast.includes(item) && <Check size={16} />}
            {item}
          </button>
        ))}
      </div>
    </div>
  );

  // STEP 2: Proteínas
  const renderStep2 = () => (
    <div>
      <h3 style={styles.stepTitle}>🥩 Proteínas</h3>
      <p style={styles.stepSubtitle}>Quais proteínas você come regularmente?</p>

      <div style={styles.optionsGrid}>
        {[
          'Frango', 'Carne vermelha', 'Peixe', 'Porco', 'Ovos',
          'Queijo', 'Iogurte', 'Feijão', 'Lentilha', 'Grão de bico',
          'Tofu', 'Whey protein'
        ].map(item => (
          <button
            key={item}
            onClick={() => toggleItem('proteins', item)}
            style={{
              ...styles.optionButton,
              ...(preferences.proteins.includes(item) && styles.optionButtonActive)
            }}
          >
            {preferences.proteins.includes(item) && <Check size={16} />}
            {item}
          </button>
        ))}
      </div>
    </div>
  );

  // STEP 3: Carboidratos
  const renderStep3 = () => (
    <div>
      <h3 style={styles.stepTitle}>🍞 Carboidratos</h3>
      <p style={styles.stepSubtitle}>Suas preferências de carboidratos:</p>

      <div style={styles.optionsGrid}>
        {[
          'Arroz branco', 'Arroz integral', 'Macarrão', 'Batata',
          'Batata doce', 'Mandioca', 'Inhame', 'Pão francês',
          'Pão integral', 'Tapioca', 'Aveia', 'Granola'
        ].map(item => (
          <button
            key={item}
            onClick={() => toggleItem('carbs', item)}
            style={{
              ...styles.optionButton,
              ...(preferences.carbs.includes(item) && styles.optionButtonActive)
            }}
          >
            {preferences.carbs.includes(item) && <Check size={16} />}
            {item}
          </button>
        ))}
      </div>
    </div>
  );

  // STEP 4: Verduras e Legumes
  const renderStep4 = () => (
    <div>
      <h3 style={styles.stepTitle}>🥗 Verduras e Legumes</h3>
      <p style={styles.stepSubtitle}>O que você gosta de comer?</p>

      <div style={styles.optionsGrid}>
        {[
          'Alface', 'Tomate', 'Cenoura', 'Brócolis', 'Couve',
          'Espinafre', 'Rúcula', 'Pepino', 'Chuchu', 'Abobrinha',
          'Berinjela', 'Pimentão', 'Cebola', 'Alho'
        ].map(item => (
          <button
            key={item}
            onClick={() => toggleItem('vegetables', item)}
            style={{
              ...styles.optionButton,
              ...(preferences.vegetables.includes(item) && styles.optionButtonActive)
            }}
          >
            {preferences.vegetables.includes(item) && <Check size={16} />}
            {item}
          </button>
        ))}
      </div>
    </div>
  );

  // STEP 5: Frutas
  const renderStep5 = () => (
    <div>
      <h3 style={styles.stepTitle}>🍎 Frutas</h3>
      <p style={styles.stepSubtitle}>Suas frutas preferidas:</p>

      <div style={styles.optionsGrid}>
        {[
          'Banana', 'Maçã', 'Laranja', 'Mamão', 'Melancia',
          'Melão', 'Uva', 'Morango', 'Abacaxi', 'Manga',
          'Kiwi', 'Pera', 'Abacate', 'Limão'
        ].map(item => (
          <button
            key={item}
            onClick={() => toggleItem('fruits', item)}
            style={{
              ...styles.optionButton,
              ...(preferences.fruits.includes(item) && styles.optionButtonActive)
            }}
          >
            {preferences.fruits.includes(item) && <Check size={16} />}
            {item}
          </button>
        ))}
      </div>
    </div>
  );

  // STEP 6: Evitar
  const renderStep6 = () => (
    <div>
      <h3 style={styles.stepTitle}>⚠️ Evitar</h3>
      <p style={styles.stepSubtitle}>Alimentos ou ingredientes que você NÃO come:</p>

      <div style={styles.optionsGrid}>
        {[
          'Glúten', 'Lactose', 'Carne vermelha', 'Porco', 'Frutos do mar',
          'Amendoim', 'Pimenta', 'Cebola', 'Alho'
        ].map(item => (
          <button
            key={item}
            onClick={() => toggleItem('avoid', item)}
            style={{
              ...styles.optionButton,
              ...(preferences.avoid.includes(item) && styles.optionButtonActive)
            }}
          >
            {preferences.avoid.includes(item) && <Check size={16} />}
            {item}
          </button>
        ))}
      </div>
    </div>
  );

  // STEP 7: Configurações
  const renderStep7 = () => (
    <div>
      <h3 style={styles.stepTitle}>⚙️ Configurações</h3>

      <div style={styles.configSection}>
        <label style={styles.configLabel}>Quantas refeições por dia?</label>
        <div style={styles.radioGroup}>
          {[3, 4, 5, 6].map(num => (
            <label key={num} style={styles.radioOption}>
              <input
                type="radio"
                checked={preferences.mealsPerDay === num}
                onChange={() => setPreferences({...preferences, mealsPerDay: num})}
              />
              <span>{num} refeições</span>
            </label>
          ))}
        </div>
      </div>

      <div style={styles.configSection}>
        <label style={styles.configLabel}>Complexidade das receitas:</label>
        <div style={styles.radioGroup}>
          <label style={styles.radioOption}>
            <input
              type="radio"
              checked={preferences.complexity === 'simples'}
              onChange={() => setPreferences({...preferences, complexity: 'simples'})}
            />
            <span>Simples (15-20 min)</span>
          </label>
          <label style={styles.radioOption}>
            <input
              type="radio"
              checked={preferences.complexity === 'moderado'}
              onChange={() => setPreferences({...preferences, complexity: 'moderado'})}
            />
            <span>Moderadas (30-40 min)</span>
          </label>
          <label style={styles.radioOption}>
            <input
              type="radio"
              checked={preferences.complexity === 'elaborado'}
              onChange={() => setPreferences({...preferences, complexity: 'elaborado'})}
            />
            <span>Elaboradas (1h+)</span>
          </label>
        </div>
      </div>

      <div style={styles.configSection}>
        <label style={styles.configLabel}>Orçamento mensal para alimentação:</label>
        <div style={styles.radioGroup}>
          <label style={styles.radioOption}>
            <input
              type="radio"
              checked={preferences.budget === 'economico'}
              onChange={() => setPreferences({...preferences, budget: 'economico'})}
            />
            <span>Econômico (R$ 300-500)</span>
          </label>
          <label style={styles.radioOption}>
            <input
              type="radio"
              checked={preferences.budget === 'moderado'}
              onChange={() => setPreferences({...preferences, budget: 'moderado'})}
            />
            <span>Moderado (R$ 500-800)</span>
          </label>
          <label style={styles.radioOption}>
            <input
              type="radio"
              checked={preferences.budget === 'confortavel'}
              onChange={() => setPreferences({...preferences, budget: 'confortavel'})}
            />
            <span>Confortável (R$ 800+)</span>
          </label>
        </div>
      </div>
    </div>
  );

  const totalSteps = 7;

  return (
    <div style={styles.container}>
      <div style={styles.progress}>
        <div style={{...styles.progressBar, width: `${(step / totalSteps) * 100}%`}} />
      </div>

      <div style={styles.header}>
        <h2 style={styles.title}>🍽️ Personalize seu Plano</h2>
        <p style={styles.subtitle}>
          Passo {step} de {totalSteps}
        </p>
      </div>

      <div style={styles.content}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
        {step === 6 && renderStep6()}
        {step === 7 && renderStep7()}
      </div>

      <div style={styles.actions}>
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            style={styles.backButton}
          >
            <ArrowLeft size={18} /> Voltar
          </button>
        )}
        
        {step < totalSteps ? (
          <button
            onClick={() => setStep(step + 1)}
            style={styles.nextButton}
          >
            Próximo <ArrowRight size={18} />
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving}
            style={{...styles.saveButton, ...(saving && styles.buttonDisabled)}}
          >
            {saving ? (
              <><Loader size={18} className="spinner" /> Salvando...</>
            ) : (
              <>Concluir <Check size={18} /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: 'white',
    borderRadius: '12px',
    maxWidth: '800px',
    margin: '0 auto'
  },
  progress: {
    height: '4px',
    background: '#e0e0e0',
    borderRadius: '4px 4px 0 0',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
    transition: 'width 0.3s ease'
  },
  header: {
    padding: '24px 24px 0',
    textAlign: 'center'
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#8B4513',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: 0
  },
  content: {
    padding: '24px'
  },
  stepTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: '8px'
  },
  stepSubtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '20px'
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '12px'
  },
  optionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '12px 16px',
    background: 'white',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  optionButtonActive: {
    background: 'linear-gradient(135deg, #FFF8DC 0%, #FAEBD7 100%)',
    borderColor: '#DAA520',
    color: '#8B4513'
  },
  configSection: {
    marginBottom: '24px'
  },
  configLabel: {
    display: 'block',
    fontSize: '15px',
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: '12px'
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  radioOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    background: '#f9f9f9',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  actions: {
    padding: '0 24px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px'
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#f5f5f5',
    color: '#666',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  nextButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginLeft: 'auto'
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginLeft: 'auto'
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  }
};

export default PreferencesQuiz;
