import { useState } from 'react';
import { saveUserProfile } from '../firebase/profile';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Loader, ArrowRight, ArrowLeft, Check } from 'lucide-react';

const ProfileSetup = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [heightWarning, setHeightWarning] = useState('');

  const [formData, setFormData] = useState({
    // Dados básicos
    age: '',
    sex: '',
    weight: '',
    height: '',
    
    // Atividade e objetivo
    activityLevel: '',
    goal: '',
    targetWeight: '',
    targetDate: '',
    
    // Saúde
    health: {
      diabetes: false,
      hypertension: false,
      thyroid: false,
      kidney: false,
      cholesterol: false
    },
    
    // Restrições
    restrictions: []
  });

  // ===================================
  // NORMALIZAR ALTURA (converter metros para cm)
  // ===================================
  const normalizeHeight = (value) => {
    if (!value) return '';
    
    // Remove espaços
    let cleaned = value.toString().trim();
    
    // Substitui vírgula por ponto
    cleaned = cleaned.replace(',', '.');
    
    // Converte para número
    let height = parseFloat(cleaned);
    
    if (isNaN(height)) return '';
    
    // Se valor é muito pequeno (provavelmente em metros)
    // Valores típicos em metros: 1.50 a 2.20
    if (height >= 0.5 && height <= 2.5) {
      height = Math.round(height * 100); // Converte para cm
      setHeightWarning(`✅ Convertido para ${height} cm`);
    } else if (height < 50) {
      // Valor muito baixo, pode ser erro
      setHeightWarning('⚠️ Altura parece muito baixa. Use centímetros (ex: 175)');
    } else if (height > 250) {
      // Valor muito alto
      setHeightWarning('⚠️ Altura parece muito alta. Use centímetros (ex: 175)');
    } else {
      setHeightWarning('');
    }
    
    return height;
  };

  // ===================================
  // HANDLER DE MUDANÇA DE ALTURA
  // ===================================
  const handleHeightChange = (e) => {
    // Só permite números, vírgula e ponto
    const rawValue = e.target.value.replace(/[^0-9.,]/g, '');
    setFormData({...formData, height: rawValue});
    
    // Validar em tempo real
    if (rawValue) {
      const normalized = normalizeHeight(rawValue);
      // Não atualizar o formData aqui, só mostrar warning
    }
  };

  // ===================================
  // VALIDAR ANTES DE AVANÇAR
  // ===================================
  const validateAndProceed = () => {
    const normalizedHeight = normalizeHeight(formData.height);
    
    if (normalizedHeight && normalizedHeight >= 50 && normalizedHeight <= 250) {
      // Altura válida, atualizar e avançar
      setFormData({...formData, height: normalizedHeight.toString()});
      setHeightWarning('');
      setStep(2);
    } else {
      setError('Por favor, informe uma altura válida em centímetros (ex: 175)');
    }
  };

  const handleSubmit = async () => {
    setError('');
    
    // Validação
    if (!formData.age || !formData.sex || !formData.weight || !formData.height) {
      setError('Preencha todos os campos básicos');
      return;
    }
    
    if (!formData.activityLevel || !formData.goal) {
      setError('Preencha nível de atividade e objetivo');
      return;
    }

    // Normalizar altura antes de salvar
    const normalizedHeight = normalizeHeight(formData.height);
    if (!normalizedHeight || normalizedHeight < 50 || normalizedHeight > 250) {
      setError('Altura inválida. Use centímetros (ex: 175)');
      return;
    }
    
    setLoading(true);
    
    // Salvar perfil
    const result = await saveUserProfile(user.uid, {
      age: parseInt(formData.age),
      sex: formData.sex,
      weight: parseFloat(formData.weight),
      height: normalizedHeight, // Usar altura normalizada
      activityLevel: formData.activityLevel,
      goal: formData.goal,
      targetWeight: formData.targetWeight ? parseFloat(formData.targetWeight) : null,
      targetDate: formData.targetDate || null,
      health: formData.health,
      restrictions: formData.restrictions
    });
    
    if (result.success) {
      // Criar trial de 3 dias automaticamente
      try {
        const now = new Date();
        const trialEnd = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 dias
        
        await setDoc(doc(db, 'users', user.uid, 'subscription', 'current'), {
          status: 'trial',
          plan: null,
          createdAt: now,
          trialEnd: trialEnd,
          expiresAt: null,
          updatedAt: now
        });
        
        console.log('✅ Trial de 3 dias criado com sucesso!');
      } catch (error) {
        console.error('Erro ao criar trial:', error);
        // Não bloqueia o fluxo
      }
      
      setResults(result.calculated);
      setStep(4); // Vai para tela de resultados
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleRestrictionToggle = (restriction) => {
    if (formData.restrictions.includes(restriction)) {
      setFormData({
        ...formData,
        restrictions: formData.restrictions.filter(r => r !== restriction)
      });
    } else {
      setFormData({
        ...formData,
        restrictions: [...formData.restrictions, restriction]
      });
    }
  };

  // STEP 1: Dados Básicos
  const renderStep1 = () => (
    <div>
      <h3 style={styles.stepTitle}>Dados Básicos</h3>
      
      <div style={styles.formGrid}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Idade *</label>
          <input
            type="number"
            placeholder="Ex: 30"
            value={formData.age}
            onChange={(e) => setFormData({...formData, age: e.target.value})}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Sexo *</label>
          <div style={styles.radioGroup}>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                name="sex"
                value="M"
                checked={formData.sex === 'M'}
                onChange={(e) => setFormData({...formData, sex: e.target.value})}
              />
              <span>Masculino</span>
            </label>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                name="sex"
                value="F"
                checked={formData.sex === 'F'}
                onChange={(e) => setFormData({...formData, sex: e.target.value})}
              />
              <span>Feminino</span>
            </label>
          </div>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Peso Atual (kg) *</label>
          <input
            type="number"
            step="0.1"
            placeholder="Ex: 75.5"
            value={formData.weight}
            onChange={(e) => setFormData({...formData, weight: e.target.value})}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Altura em centímetros *</label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="Ex: 175 (digite 175, não 1,75)"
            value={formData.height}
            onChange={handleHeightChange}
            onBlur={() => {
              // Normalizar ao sair do campo
              if (formData.height) {
                const normalized = normalizeHeight(formData.height);
                if (normalized && normalized >= 50 && normalized <= 250) {
                  setFormData({...formData, height: normalized.toString()});
                }
              }
            }}
            style={styles.input}
          />
          {heightWarning && (
            <span style={{
              display: 'block',
              fontSize: '13px',
              marginTop: '6px',
              color: heightWarning.includes('✅') ? '#2E7D32' : '#f57c00',
              fontWeight: '500'
            }}>
              {heightWarning}
            </span>
          )}
          <span style={{fontSize: '12px', color: '#888', marginTop: '4px', display: 'block'}}>
            💡 Use centímetros. Ex: 175 para 1,75m
          </span>
        </div>
      </div>

      <button
        onClick={validateAndProceed}
        disabled={!formData.age || !formData.sex || !formData.weight || !formData.height}
        style={{...styles.button, ...((!formData.age || !formData.sex || !formData.weight || !formData.height) && styles.buttonDisabled)}}
      >
        Próximo <ArrowRight size={18} />
      </button>
    </div>
  );

  // STEP 2: Atividade e Objetivo
  const renderStep2 = () => (
    <div>
      <h3 style={styles.stepTitle}>Atividade e Objetivo</h3>
      
      <div style={styles.inputGroup}>
        <label style={styles.label}>Nível de Atividade Física *</label>
        <select
          value={formData.activityLevel}
          onChange={(e) => setFormData({...formData, activityLevel: e.target.value})}
          style={styles.select}
        >
          <option value="">Selecione...</option>
          <option value="sedentario">Sedentário (pouco ou nenhum exercício)</option>
          <option value="leve">Leve (exercício 1-3 dias/semana)</option>
          <option value="moderado">Moderado (exercício 3-5 dias/semana)</option>
          <option value="intenso">Intenso (exercício 6-7 dias/semana)</option>
          <option value="muito_intenso">Muito Intenso (atleta/treino 2x ao dia)</option>
        </select>
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Seu Objetivo *</label>
        <select
          value={formData.goal}
          onChange={(e) => setFormData({...formData, goal: e.target.value})}
          style={styles.select}
        >
          <option value="">Selecione...</option>
          <option value="perder">Perder Peso (déficit calórico)</option>
          <option value="manter">Manter Peso (manutenção)</option>
          <option value="ganhar">Ganhar Peso/Massa (superávit calórico)</option>
        </select>
      </div>

      {(formData.goal === 'perder' || formData.goal === 'ganhar') && (
        <>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Peso Alvo (kg)</label>
            <input
              type="number"
              step="0.1"
              placeholder="Ex: 70"
              value={formData.targetWeight}
              onChange={(e) => setFormData({...formData, targetWeight: e.target.value})}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Data Alvo (opcional)</label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
              style={styles.input}
            />
          </div>
        </>
      )}

      <div style={styles.buttonGroup}>
        <button onClick={() => setStep(1)} style={styles.buttonSecondary}>
          <ArrowLeft size={18} /> Voltar
        </button>
        <button
          onClick={() => setStep(3)}
          disabled={!formData.activityLevel || !formData.goal}
          style={{...styles.button, ...((!formData.activityLevel || !formData.goal) && styles.buttonDisabled)}}
        >
          Próximo <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );

  // STEP 3: Saúde e Restrições
  const renderStep3 = () => (
    <div>
      <h3 style={styles.stepTitle}>Saúde e Restrições</h3>
      
      <div style={styles.inputGroup}>
        <label style={styles.label}>Comorbidades (opcional)</label>
        <div style={styles.checkboxGroup}>
          {[
            { key: 'diabetes', label: 'Diabetes' },
            { key: 'hypertension', label: 'Hipertensão (pressão alta)' },
            { key: 'thyroid', label: 'Problemas de tireoide' },
            { key: 'kidney', label: 'Problemas renais' },
            { key: 'cholesterol', label: 'Colesterol alto' }
          ].map(item => (
            <label key={item.key} style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.health[item.key]}
                onChange={(e) => setFormData({
                  ...formData,
                  health: {...formData.health, [item.key]: e.target.checked}
                })}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Restrições Alimentares (opcional)</label>
        <div style={styles.checkboxGroup}>
          {[
            'Vegetariano',
            'Vegano',
            'Sem Lactose',
            'Sem Glúten',
            'Alergia a Frutos do Mar',
            'Alergia a Amendoim'
          ].map(restriction => (
            <label key={restriction} style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.restrictions.includes(restriction)}
                onChange={() => handleRestrictionToggle(restriction)}
              />
              <span>{restriction}</span>
            </label>
          ))}
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.buttonGroup}>
        <button onClick={() => setStep(2)} style={styles.buttonSecondary}>
          <ArrowLeft size={18} /> Voltar
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{...styles.button, ...(loading && styles.buttonDisabled)}}
        >
          {loading ? (
            <><Loader size={18} className="spinner" /> Calculando...</>
          ) : (
            <>Finalizar <Check size={18} /></>
          )}
        </button>
      </div>
    </div>
  );

  // STEP 4: Resultados
  const renderStep4 = () => (
    <div>
      <div style={{textAlign: 'center', marginBottom: '32px'}}>
        <div style={{fontSize: '64px', marginBottom: '16px'}}>🎉</div>
        <h2 style={{fontSize: '28px', fontWeight: '800', color: '#8B4513', marginBottom: '8px'}}>
          Perfil Configurado com Sucesso!
        </h2>
        <p style={{fontSize: '16px', color: '#666'}}>
          Aqui estão seus resultados personalizados
        </p>
      </div>

      <div style={styles.resultsGrid}>
        <div style={styles.resultCard}>
          <div style={styles.resultLabel}>IMC</div>
          <div style={styles.resultValue}>{results?.imc}</div>
          <div style={styles.resultSubtext}>{results?.imcClassification}</div>
        </div>

        <div style={styles.resultCard}>
          <div style={styles.resultLabel}>TMB</div>
          <div style={styles.resultValue}>{results?.tmb}</div>
          <div style={styles.resultSubtext}>kcal/dia</div>
        </div>

        <div style={styles.resultCard}>
          <div style={styles.resultLabel}>Gasto Total</div>
          <div style={styles.resultValue}>{results?.get}</div>
          <div style={styles.resultSubtext}>kcal/dia</div>
        </div>

        <div style={{...styles.resultCard, ...styles.resultCardHighlight}}>
          <div style={styles.resultLabel}>Meta Diária</div>
          <div style={styles.resultValue}>{results?.targetCalories}</div>
          <div style={styles.resultSubtext}>kcal/dia</div>
        </div>
      </div>

      <div style={styles.macrosCard}>
        <h4 style={{fontSize: '18px', fontWeight: '700', color: '#8B4513', marginBottom: '16px'}}>
          Distribuição de Macronutrientes
        </h4>
        <div style={styles.macrosGrid}>
          <div>
            <div style={{fontSize: '14px', color: '#666', marginBottom: '4px'}}>Proteínas</div>
            <div style={{fontSize: '24px', fontWeight: '700', color: '#E91E63'}}>{results?.macros.protein}g</div>
          </div>
          <div>
            <div style={{fontSize: '14px', color: '#666', marginBottom: '4px'}}>Carboidratos</div>
            <div style={{fontSize: '24px', fontWeight: '700', color: '#2196F3'}}>{results?.macros.carbs}g</div>
          </div>
          <div>
            <div style={{fontSize: '14px', color: '#666', marginBottom: '4px'}}>Gorduras</div>
            <div style={{fontSize: '24px', fontWeight: '700', color: '#FF9800'}}>{results?.macros.fat}g</div>
          </div>
        </div>
      </div>

      <button onClick={onComplete} style={styles.button}>
        Ir para o App <ArrowRight size={18} />
      </button>
    </div>
  );

  const styles = {
    stepTitle: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#8B4513',
      marginBottom: '24px'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '24px'
    },
    inputGroup: {
      marginBottom: '20px'
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
      border: '2px solid #f0f0f0',
      borderRadius: '8px',
      fontSize: '16px',
      outline: 'none',
      transition: 'border 0.3s',
      boxSizing: 'border-box',
      fontFamily: 'inherit'
    },
    select: {
      width: '100%',
      padding: '12px',
      border: '2px solid #f0f0f0',
      borderRadius: '8px',
      fontSize: '16px',
      outline: 'none',
      cursor: 'pointer',
      boxSizing: 'border-box',
      fontFamily: 'inherit'
    },
    radioGroup: {
      display: 'flex',
      gap: '16px'
    },
    radioLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      fontSize: '15px'
    },
    checkboxGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      fontSize: '15px'
    },
    button: {
      width: '100%',
      padding: '14px',
      background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '700',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.3s'
    },
    buttonSecondary: {
      padding: '14px 24px',
      background: '#f5f5f5',
      color: '#333',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    buttonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginTop: '24px'
    },
    error: {
      background: '#fee',
      color: '#c33',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '14px',
      marginBottom: '16px'
    },
    resultsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    resultCard: {
      background: '#f9f9f9',
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center'
    },
    resultCardHighlight: {
      background: 'linear-gradient(135deg, #FFF8DC 0%, #FAEBD7 100%)',
      border: '2px solid #DAA520'
    },
    resultLabel: {
      fontSize: '13px',
      color: '#666',
      marginBottom: '8px',
      textTransform: 'uppercase',
      fontWeight: '600'
    },
    resultValue: {
      fontSize: '32px',
      fontWeight: '800',
      color: '#8B4513',
      marginBottom: '4px'
    },
    resultSubtext: {
      fontSize: '13px',
      color: '#999'
    },
    macrosCard: {
      background: '#f9f9f9',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px'
    },
    macrosGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '20px'
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '800px',
        width: '100%',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
      }}>
        {/* Progress Bar */}
        {step < 4 && (
          <div style={{marginBottom: '32px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
              <span style={{fontSize: '14px', fontWeight: '600', color: '#8B4513'}}>
                Etapa {step} de 3
              </span>
              <span style={{fontSize: '14px', color: '#666'}}>
                {Math.round((step / 3) * 100)}%
              </span>
            </div>
            <div style={{
              height: '8px',
              background: '#f0f0f0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
                width: `${(step / 3) * 100}%`,
                transition: 'width 0.3s'
              }} />
            </div>
          </div>
        )}

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>
    </div>
  );
};

export default ProfileSetup;
