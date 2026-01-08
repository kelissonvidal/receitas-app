import { useState, useEffect } from 'react';
import { getUserSupplements, saveSupplement, deleteSupplement } from '../firebase/preferences';
import { Loader, Plus, Trash2, Edit2, X } from 'lucide-react';

const SupplementsManager = ({ user }) => {
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    type: 'whey_protein',
    name: '',
    brand: '',
    flavor: '',
    servingSize: 30,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    whenToUse: []
  });

  useEffect(() => {
    loadSupplements();
  }, [user]);

  const loadSupplements = async () => {
    setLoading(true);
    const result = await getUserSupplements(user.uid);
    if (result.success) {
      setSupplements(result.supplements);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert('Digite o nome do suplemento');
      return;
    }

    setSaving(true);

    const supplementData = {
      ...formData,
      id: editingId,
      servingSize: parseFloat(formData.servingSize),
      calories: parseFloat(formData.calories),
      protein: parseFloat(formData.protein),
      carbs: parseFloat(formData.carbs),
      fat: parseFloat(formData.fat)
    };

    const result = await saveSupplement(user.uid, supplementData);

    if (result.success) {
      await loadSupplements();
      setShowForm(false);
      setEditingId(null);
      resetForm();
    } else {
      alert('Erro ao salvar: ' + result.error);
    }

    setSaving(false);
  };

  const handleEdit = (supplement) => {
    setFormData({
      type: supplement.type,
      name: supplement.name,
      brand: supplement.brand || '',
      flavor: supplement.flavor || '',
      servingSize: supplement.servingSize,
      calories: supplement.calories,
      protein: supplement.protein,
      carbs: supplement.carbs,
      fat: supplement.fat,
      whenToUse: supplement.whenToUse || []
    });
    setEditingId(supplement.id);
    setShowForm(true);
  };

  const handleDelete = async (supplementId) => {
    if (!window.confirm('Tem certeza que deseja remover este suplemento?')) {
      return;
    }

    const result = await deleteSupplement(user.uid, supplementId);
    if (result.success) {
      await loadSupplements();
    } else {
      alert('Erro ao deletar: ' + result.error);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'whey_protein',
      name: '',
      brand: '',
      flavor: '',
      servingSize: 30,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      whenToUse: []
    });
  };

  const toggleWhenToUse = (period) => {
    if (formData.whenToUse.includes(period)) {
      setFormData({
        ...formData,
        whenToUse: formData.whenToUse.filter(p => p !== period)
      });
    } else {
      setFormData({
        ...formData,
        whenToUse: [...formData.whenToUse, period]
      });
    }
  };

  const getSupplementIcon = (type) => {
    const icons = {
      whey_protein: '🥤',
      creatine: '💊',
      pre_workout: '🔥',
      bcaa: '💪',
      multivitamin: '🌟',
      omega3: '🐟',
      other: '💊'
    };
    return icons[type] || '💊';
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <Loader size={32} className="spinner" style={{color: '#DAA520'}} />
          <p>Carregando suplementos...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>💊 Meus Suplementos</h3>
          <p style={styles.subtitle}>
            Configure os suplementos que você usa para rastreamento automático
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingId(null);
            setShowForm(true);
          }}
          style={styles.addButton}
        >
          <Plus size={18} /> Adicionar
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h4 style={styles.formTitle}>
              {editingId ? 'Editar Suplemento' : 'Novo Suplemento'}
            </h4>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                resetForm();
              }}
              style={styles.closeButton}
            >
              <X size={20} />
            </button>
          </div>

          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                style={styles.select}
              >
                <option value="whey_protein">🥤 Whey Protein</option>
                <option value="creatine">💊 Creatina</option>
                <option value="pre_workout">🔥 Pré-Treino</option>
                <option value="bcaa">💪 BCAA</option>
                <option value="multivitamin">🌟 Multivitamínico</option>
                <option value="omega3">🐟 Ômega 3</option>
                <option value="other">💊 Outro</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Nome *</label>
              <input
                type="text"
                placeholder="Ex: Whey Concentrado"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Marca</label>
              <input
                type="text"
                placeholder="Ex: Integral Médica"
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Sabor</label>
              <input
                type="text"
                placeholder="Ex: Chocolate"
                value={formData.flavor}
                onChange={(e) => setFormData({...formData, flavor: e.target.value})}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Porção (g)</label>
              <input
                type="number"
                value={formData.servingSize}
                onChange={(e) => setFormData({...formData, servingSize: e.target.value})}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Calorias (kcal)</label>
              <input
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData({...formData, calories: e.target.value})}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Proteínas (g)</label>
              <input
                type="number"
                value={formData.protein}
                onChange={(e) => setFormData({...formData, protein: e.target.value})}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Carboidratos (g)</label>
              <input
                type="number"
                value={formData.carbs}
                onChange={(e) => setFormData({...formData, carbs: e.target.value})}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Gorduras (g)</label>
              <input
                type="number"
                value={formData.fat}
                onChange={(e) => setFormData({...formData, fat: e.target.value})}
                style={styles.input}
              />
            </div>
          </div>

          <div style={{marginTop: '20px'}}>
            <label style={styles.label}>Quando usar:</label>
            <div style={styles.checkboxGrid}>
              <label style={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={formData.whenToUse.includes('breakfast')}
                  onChange={() => toggleWhenToUse('breakfast')}
                />
                <span>☕ Café da manhã</span>
              </label>
              <label style={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={formData.whenToUse.includes('pre_workout')}
                  onChange={() => toggleWhenToUse('pre_workout')}
                />
                <span>💪 Pré-treino</span>
              </label>
              <label style={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={formData.whenToUse.includes('post_workout')}
                  onChange={() => toggleWhenToUse('post_workout')}
                />
                <span>💪 Pós-treino</span>
              </label>
              <label style={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={formData.whenToUse.includes('supper')}
                  onChange={() => toggleWhenToUse('supper')}
                />
                <span>🌙 Ceia</span>
              </label>
            </div>
          </div>

          <div style={styles.formActions}>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                resetForm();
              }}
              style={styles.cancelButton}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{...styles.saveButton, ...(saving && styles.buttonDisabled)}}
            >
              {saving ? (
                <><Loader size={16} className="spinner" /> Salvando...</>
              ) : (
                editingId ? 'Atualizar' : 'Adicionar'
              )}
            </button>
          </div>
        </div>
      )}

      {/* LIST */}
      {supplements.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>💊</div>
          <p style={styles.emptyText}>Nenhum suplemento cadastrado</p>
          <p style={styles.emptyHint}>
            Cadastre os suplementos que você usa para rastreamento automático no diário
          </p>
        </div>
      ) : (
        <div style={styles.list}>
          {supplements.map(supplement => (
            <div key={supplement.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardIcon}>
                  {getSupplementIcon(supplement.type)}
                </div>
                <div style={styles.cardInfo}>
                  <h4 style={styles.cardTitle}>{supplement.name}</h4>
                  {supplement.brand && (
                    <p style={styles.cardBrand}>{supplement.brand}</p>
                  )}
                  {supplement.flavor && (
                    <p style={styles.cardFlavor}>Sabor: {supplement.flavor}</p>
                  )}
                </div>
                <div style={styles.cardActions}>
                  <button
                    onClick={() => handleEdit(supplement)}
                    style={styles.editButton}
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(supplement.id)}
                    style={styles.deleteButton}
                    title="Remover"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div style={styles.cardNutrition}>
                <div style={styles.nutritionItem}>
                  <span style={styles.nutritionLabel}>Porção:</span>
                  <span style={styles.nutritionValue}>{supplement.servingSize}g</span>
                </div>
                <div style={styles.nutritionItem}>
                  <span style={styles.nutritionLabel}>Calorias:</span>
                  <span style={styles.nutritionValue}>{supplement.calories} kcal</span>
                </div>
                <div style={styles.nutritionItem}>
                  <span style={styles.nutritionLabel}>Proteínas:</span>
                  <span style={styles.nutritionValue}>{supplement.protein}g</span>
                </div>
                <div style={styles.nutritionItem}>
                  <span style={styles.nutritionLabel}>Carbos:</span>
                  <span style={styles.nutritionValue}>{supplement.carbs}g</span>
                </div>
                <div style={styles.nutritionItem}>
                  <span style={styles.nutritionLabel}>Gorduras:</span>
                  <span style={styles.nutritionValue}>{supplement.fat}g</span>
                </div>
              </div>

              {supplement.whenToUse && supplement.whenToUse.length > 0 && (
                <div style={styles.cardWhen}>
                  <span style={styles.whenLabel}>Quando usar:</span>
                  <div style={styles.whenTags}>
                    {supplement.whenToUse.map(period => (
                      <span key={period} style={styles.whenTag}>
                        {period === 'breakfast' && '☕ Café'}
                        {period === 'pre_workout' && '💪 Pré-treino'}
                        {period === 'post_workout' && '💪 Pós-treino'}
                        {period === 'supper' && '🌙 Ceia'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
    border: '2px solid #4CAF50',
    borderRadius: '12px',
    padding: '24px',
    marginTop: '24px'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
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
    fontSize: '20px',
    fontWeight: '700',
    color: '#2E7D32',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: 0
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  formCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '2px solid #4CAF50'
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  formTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#2E7D32',
    margin: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    padding: '4px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: '6px'
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
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px',
    marginTop: '8px'
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#333',
    cursor: 'pointer'
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '24px'
  },
  cancelButton: {
    padding: '10px 24px',
    background: '#f5f5f5',
    color: '#666',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'white',
    borderRadius: '12px'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: 0.3
  },
  emptyText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#666',
    marginBottom: '8px'
  },
  emptyHint: {
    fontSize: '14px',
    color: '#999',
    margin: 0
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    border: '2px solid #C8E6C9'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '16px'
  },
  cardIcon: {
    fontSize: '32px'
  },
  cardInfo: {
    flex: 1
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#2E7D32',
    margin: '0 0 4px 0'
  },
  cardBrand: {
    fontSize: '13px',
    color: '#666',
    margin: '0 0 2px 0'
  },
  cardFlavor: {
    fontSize: '12px',
    color: '#999',
    margin: 0
  },
  cardActions: {
    display: 'flex',
    gap: '8px'
  },
  editButton: {
    background: 'none',
    border: 'none',
    color: '#4CAF50',
    cursor: 'pointer',
    padding: '4px'
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    color: '#f44336',
    cursor: 'pointer',
    padding: '4px'
  },
  cardNutrition: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '12px',
    marginBottom: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #e0e0e0'
  },
  nutritionItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  nutritionLabel: {
    fontSize: '11px',
    color: '#999',
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  nutritionValue: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#2E7D32'
  },
  cardWhen: {
    paddingTop: '16px',
    borderTop: '1px solid #e0e0e0'
  },
  whenLabel: {
    fontSize: '12px',
    color: '#666',
    fontWeight: '600',
    marginBottom: '8px',
    display: 'block'
  },
  whenTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  whenTag: {
    padding: '4px 12px',
    background: '#E8F5E9',
    color: '#2E7D32',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '600'
  }
};

export default SupplementsManager;
