import { useState, useEffect } from 'react';
import { getUserProfile, saveUserProfile } from '../firebase/profile';
import { Loader, Edit2, Save, X, User, Activity, Target, AlertCircle } from 'lucide-react';

const ProfileEditor = ({ user, userProfile, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [heightWarning, setHeightWarning] = useState('');
  const [formData, setFormData] = useState({
    age: '',
    sex: '',
    weight: '',
    height: '',
    activityLevel: '',
    goal: '',
    targetWeight: '',
    health: {},
    restrictions: []
  });

  // Normalizar altura (converter metros para cm)
  const normalizeHeight = (value) => {
    if (!value) return '';
    let cleaned = value.toString().trim().replace(',', '.');
    let height = parseFloat(cleaned);
    if (isNaN(height)) return '';
    
    if (height >= 0.5 && height <= 2.5) {
      height = Math.round(height * 100);
      setHeightWarning(`✅ Convertido para ${height} cm`);
    } else if (height < 50) {
      setHeightWarning('⚠️ Altura parece muito baixa');
    } else if (height > 250) {
      setHeightWarning('⚠️ Altura parece muito alta');
    } else {
      setHeightWarning('');
    }
    return height;
  };

  useEffect(() => {
    if (userProfile) {
      setFormData({
        age: userProfile.age || '',
        sex: userProfile.sex || '',
        weight: userProfile.weight || '',
        height: userProfile.height || '',
        activityLevel: userProfile.activityLevel || '',
        goal: userProfile.goal || '',
        targetWeight: userProfile.targetWeight || '',
        health: userProfile.health || {},
        restrictions: userProfile.restrictions || []
      });
    }
  }, [userProfile]);

  const handleSave = async () => {
    setLoading(true);
    
    // Normalizar altura antes de salvar
    const normalizedHeight = normalizeHeight(formData.height);
    if (!normalizedHeight || normalizedHeight < 50 || normalizedHeight > 250) {
      alert('❌ Altura inválida. Use centímetros (ex: 175)');
      setLoading(false);
      return;
    }
    
    const dataToSave = {
      ...formData,
      height: normalizedHeight
    };
    
    const result = await saveUserProfile(user.uid, dataToSave);
    
    if (result.success) {
      setEditing(false);
      setHeightWarning('');
      if (onUpdate) onUpdate();
      alert('✅ Perfil atualizado com sucesso!');
    } else {
      alert('❌ Erro ao atualizar: ' + result.error);
    }
    
    setLoading(false);
  };

  const renderViewMode = () => (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>📋 Meu Perfil</h3>
        <button onClick={() => setEditing(true)} style={styles.editButton}>
          <Edit2 size={16} /> Editar
        </button>
      </div>

      <div style={styles.section}>
        <h4 style={styles.sectionTitle}><User size={18} /> Dados Pessoais</h4>
        <div style={styles.dataGrid}>
          <div style={styles.dataItem}>
            <span style={styles.dataLabel}>Idade:</span>
            <span style={styles.dataValue}>{formData.age || '—'} anos</span>
          </div>
          <div style={styles.dataItem}>
            <span style={styles.dataLabel}>Sexo:</span>
            <span style={styles.dataValue}>{formData.sex === 'M' ? '👨 Masculino' : formData.sex === 'F' ? '👩 Feminino' : '—'}</span>
          </div>
          <div style={styles.dataItem}>
            <span style={styles.dataLabel}>Altura:</span>
            <span style={styles.dataValue}>{formData.height || '—'} cm</span>
          </div>
          <div style={styles.dataItem}>
            <span style={styles.dataLabel}>Peso Atual:</span>
            <span style={styles.dataValue}>{formData.weight || '—'} kg</span>
          </div>
        </div>
      </div>

      {/* NOVA SEÇÃO: TAXA METABÓLICA */}
      {userProfile?.calculated?.tmb && (
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>🔥 Taxa Metabólica</h4>
          <div style={styles.tmbCard}>
            <div style={styles.tmbMain}>
              <span style={styles.tmbLabel}>TMB (Taxa Metabólica Basal)</span>
              <span style={styles.tmbValue}>{userProfile.calculated.tmb} kcal/dia</span>
              <span style={styles.tmbHint}>Calorias que seu corpo queima em repouso</span>
            </div>
          </div>
        </div>
      )}

      <div style={styles.section}>
        <h4 style={styles.sectionTitle}><Activity size={18} /> Atividade e Objetivo</h4>
        <div style={styles.dataGrid}>
          <div style={styles.dataItem}>
            <span style={styles.dataLabel}>Nível de Atividade:</span>
            <span style={styles.dataValue}>
              {formData.activityLevel === 'sedentario' && '🪑 Sedentário'}
              {formData.activityLevel === 'leve' && '🚶 Leve (1-3x/semana)'}
              {formData.activityLevel === 'moderado' && '🏃 Moderado (3-5x/semana)'}
              {formData.activityLevel === 'intenso' && '💪 Intenso (6-7x/semana)'}
              {formData.activityLevel === 'muito_intenso' && '🏋️ Muito Intenso (Atleta)'}
              {!formData.activityLevel && '—'}
            </span>
          </div>
          <div style={styles.dataItem}>
            <span style={styles.dataLabel}>Objetivo:</span>
            <span style={styles.dataValue}>
              {formData.goal === 'perder' && '📉 Perder Peso'}
              {formData.goal === 'manter' && '⚖️ Manter Peso'}
              {formData.goal === 'ganhar' && '📈 Ganhar Peso'}
              {!formData.goal && '—'}
            </span>
          </div>
          {formData.targetWeight && (
            <div style={styles.dataItem}>
              <span style={styles.dataLabel}>Peso Meta:</span>
              <span style={styles.dataValue}>{formData.targetWeight} kg</span>
            </div>
          )}
        </div>
      </div>

      {userProfile?.calculated && (
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}><Target size={18} /> Metas Calculadas</h4>
          <div style={styles.calculatedGrid}>
            <div style={styles.calculatedItem}>
              <span style={styles.calculatedLabel}>TMB:</span>
              <span style={styles.calculatedValue}>{userProfile.calculated.tmb} kcal/dia</span>
              <span style={styles.calculatedHint}>Metabolismo basal</span>
            </div>
            <div style={styles.calculatedItem}>
              <span style={styles.calculatedLabel}>GET:</span>
              <span style={styles.calculatedValue}>{userProfile.calculated.get} kcal/dia</span>
              <span style={styles.calculatedHint}>Gasto total diário</span>
            </div>
            <div style={styles.calculatedItem}>
              <span style={styles.calculatedLabel}>Meta Diária:</span>
              <span style={styles.calculatedValue}>{userProfile.calculated.targetCalories} kcal/dia</span>
              <span style={styles.calculatedHint}>Para seu objetivo</span>
            </div>
            <div style={styles.calculatedItem}>
              <span style={styles.calculatedLabel}>IMC:</span>
              <span style={styles.calculatedValue}>{userProfile.calculated.imc}</span>
              <span style={styles.calculatedHint}>{userProfile.calculated.imcClassification}</span>
            </div>
          </div>

          <div style={styles.infoBox}>
            <AlertCircle size={16} />
            <div>
              <strong>Como calculamos:</strong>
              <p style={{margin: '4px 0 0 0', fontSize: '13px'}}>
                TMB (Harris-Benedict) × Fator de Atividade = GET<br/>
                {formData.goal === 'perder' && 'GET - 500 kcal = Meta para perder ~0,5kg/semana'}
                {formData.goal === 'manter' && 'GET = Meta para manter peso'}
                {formData.goal === 'ganhar' && 'GET + 300 kcal = Meta para ganhar massa'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderEditMode = () => (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>✏️ Editar Perfil</h3>
        <button onClick={() => setEditing(false)} style={styles.cancelButton}>
          <X size={16} /> Cancelar
        </button>
      </div>

      <div style={styles.form}>
        <div style={styles.formSection}>
          <h4 style={styles.formSectionTitle}>Dados Pessoais</h4>
          
          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Idade</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Sexo</label>
              <select
                value={formData.sex}
                onChange={(e) => setFormData({...formData, sex: e.target.value})}
                style={styles.select}
              >
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Altura em cm (ex: 175)</label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Ex: 175"
                value={formData.height}
                onChange={(e) => {
                  // Só permite números, vírgula e ponto
                  const value = e.target.value.replace(/[^0-9.,]/g, '');
                  setFormData({...formData, height: value});
                  if (value) normalizeHeight(value);
                }}
                onBlur={() => {
                  if (formData.height) {
                    const normalized = normalizeHeight(formData.height);
                    if (normalized >= 50 && normalized <= 250) {
                      setFormData({...formData, height: normalized.toString()});
                    }
                  }
                }}
                style={styles.input}
              />
              {heightWarning && (
                <span style={{
                  display: 'block',
                  fontSize: '12px',
                  marginTop: '4px',
                  color: heightWarning.includes('✅') ? '#2E7D32' : '#f57c00'
                }}>
                  {heightWarning}
                </span>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Peso Atual (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                style={styles.input}
              />
            </div>
          </div>
        </div>

        <div style={styles.formSection}>
          <h4 style={styles.formSectionTitle}>Atividade e Objetivo</h4>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nível de Atividade Física</label>
            <select
              value={formData.activityLevel}
              onChange={(e) => setFormData({...formData, activityLevel: e.target.value})}
              style={styles.select}
            >
              <option value="sedentario">Sedentário (pouco ou nenhum exercício)</option>
              <option value="leve">Leve (exercício 1-3 dias/semana)</option>
              <option value="moderado">Moderado (exercício 3-5 dias/semana)</option>
              <option value="intenso">Intenso (exercício 6-7 dias/semana)</option>
              <option value="muito_intenso">Muito Intenso (atleta profissional)</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Objetivo</label>
            <select
              value={formData.goal}
              onChange={(e) => setFormData({...formData, goal: e.target.value})}
              style={styles.select}
            >
              <option value="perder">📉 Perder Peso</option>
              <option value="manter">⚖️ Manter Peso</option>
              <option value="ganhar">📈 Ganhar Peso/Massa</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Peso Meta (kg) - Opcional</label>
            <input
              type="number"
              step="0.1"
              value={formData.targetWeight}
              onChange={(e) => setFormData({...formData, targetWeight: e.target.value})}
              style={styles.input}
              placeholder="Ex: 70"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          style={{...styles.saveButton, ...(loading && styles.buttonDisabled)}}
        >
          {loading ? (
            <><Loader size={18} className="spinner" /> Salvando...</>
          ) : (
            <><Save size={18} /> Salvar Alterações</>
          )}
        </button>
      </div>
    </div>
  );

  return editing ? renderEditMode() : renderViewMode();
};

const styles = {
  container: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    border: '2px solid #e0e0e0',
    marginTop: '24px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#2E7D32',
    margin: 0
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: '#f5f5f5',
    color: '#666',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  section: {
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid #e0e0e0'
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: '16px'
  },
  dataGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  dataItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  dataLabel: {
    fontSize: '12px',
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  dataValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#333'
  },
  calculatedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '16px'
  },
  calculatedItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '12px',
    background: '#E8F5E9',
    borderRadius: '8px'
  },
  calculatedLabel: {
    fontSize: '11px',
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  calculatedValue: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#2E7D32'
  },
  calculatedHint: {
    fontSize: '11px',
    color: '#999'
  },
  infoBox: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    background: '#E3F2FD',
    border: '2px solid #2196F3',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1565C0'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  formSection: {
    paddingBottom: '24px',
    borderBottom: '1px solid #e0e0e0'
  },
  formSectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: '16px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#2E7D32'
  },
  input: {
    padding: '10px',
    border: '2px solid #C8E6C9',
    borderRadius: '6px',
    fontSize: '14px'
  },
  select: {
    padding: '10px',
    border: '2px solid #C8E6C9',
    borderRadius: '6px',
    fontSize: '14px',
    background: 'white'
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px',
    background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
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
  tmbCard: {
    background: 'linear-gradient(135deg, #FFF8DC 0%, #FAEBD7 100%)',
    border: '2px solid #DAA520',
    borderRadius: '12px',
    padding: '20px'
  },
  tmbMain: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  tmbLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#8B4513'
  },
  tmbValue: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#8B4513'
  },
  tmbHint: {
    fontSize: '13px',
    color: '#666',
    textAlign: 'center'
  }
};

export default ProfileEditor;
