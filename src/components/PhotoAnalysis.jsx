import { useState, useEffect } from 'react';
import { Camera, Upload, X, Loader, Check, Edit } from 'lucide-react';
import { analyzeFood, resizeImage } from '../firebase/vision';

const PhotoAnalysis = ({ onSave, onCancel, user }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [mealType, setMealType] = useState('lunch');
  const [plateWeight, setPlateWeight] = useState('');
  const [weightHistory, setWeightHistory] = useState({ breakfast: [], lunch: [], snack: [], dinner: [] });
  const [showWeightWarning, setShowWeightWarning] = useState(false);
  
  // Estados para edição manual
  const [editMode, setEditMode] = useState(false);
  const [editedCalories, setEditedCalories] = useState('');
  const [editedProtein, setEditedProtein] = useState('');
  const [editedCarbs, setEditedCarbs] = useState('');
  const [editedFat, setEditedFat] = useState('');

  // Carregar histórico de pesos ao montar
  useEffect(() => {
    if (user?.uid) {
      loadWeightHistory();
    }
  }, [user]);

  const loadWeightHistory = async () => {
    try {
      if (!user?.uid) return;
      
      const history = localStorage.getItem(`plateWeights_${user.uid}`);
      if (history) {
        setWeightHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading weight history:', error);
    }
  };

  const saveWeightToHistory = (type, weight) => {
    if (!user?.uid) return;
    
    const newHistory = { ...weightHistory };
    if (!newHistory[type]) newHistory[type] = [];
    
    newHistory[type].unshift(weight);
    // Manter últimos 10 registros
    newHistory[type] = newHistory[type].slice(0, 10);
    
    setWeightHistory(newHistory);
    localStorage.setItem(`plateWeights_${user.uid}`, JSON.stringify(newHistory));
  };

  const getAverageWeight = (type) => {
    const weights = weightHistory[type] || [];
    if (weights.length === 0) return null;
    const sum = weights.reduce((acc, w) => acc + w, 0);
    return Math.round(sum / weights.length);
  };

  const getSuggestedWeight = () => {
    const avg = getAverageWeight(mealType);
    if (avg) return avg;
    
    // Pesos médios por refeição
    const defaults = {
      breakfast: 200,
      lunch: 450,
      snack: 100,
      dinner: 400
    };
    return defaults[mealType] || 350;
  };

  const validateWeight = (weight) => {
    const num = parseInt(weight);
    if (isNaN(num)) return true;
    
    const limits = {
      breakfast: { min: 50, max: 500 },
      lunch: { min: 100, max: 1000 },
      snack: { min: 20, max: 300 },
      dinner: { min: 100, max: 1000 }
    };
    
    const { min, max } = limits[mealType];
    if (num < min || num > max) {
      setShowWeightWarning(true);
      return false;
    }
    
    setShowWeightWarning(false);
    return true;
  };

  const getWeightWarningMessage = () => {
    const num = parseInt(plateWeight);
    const limits = {
      breakfast: { min: 50, max: 500, typical: '150-300g' },
      lunch: { min: 100, max: 1000, typical: '300-600g' },
      snack: { min: 20, max: 300, typical: '50-150g' },
      dinner: { min: 100, max: 1000, typical: '300-600g' }
    };
    
    const { min, max, typical } = limits[mealType];
    
    if (num < min) {
      return `Peso muito baixo para ${getMealTypeName()}. Típico: ${typical}`;
    }
    if (num > max) {
      return `Peso muito alto para ${getMealTypeName()}. Típico: ${typical}`;
    }
    return '';
  };

  const getMealTypeName = () => {
    const names = {
      breakfast: 'café da manhã',
      lunch: 'almoço',
      snack: 'lanche',
      dinner: 'jantar'
    };
    return names[mealType];
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida!');
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Imagem muito grande! Máximo 5MB.');
      return;
    }

    // Redimensionar para otimizar
    const resizedFile = await resizeImage(file);
    setSelectedFile(resizedFile);

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(resizedFile);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert('Selecione uma foto primeiro!');
      return;
    }

    // Validar peso se informado
    if (plateWeight && !validateWeight(plateWeight)) {
      const proceed = confirm(
        `${getWeightWarningMessage()}\n\nDeseja continuar mesmo assim?`
      );
      if (!proceed) return;
    }

    setAnalyzing(true);
    setAnalysis(null);

    const result = await analyzeFood(selectedFile, plateWeight ? parseInt(plateWeight) : null);

    if (result.success) {
      setAnalysis(result.analysis);
      // Preencher campos de edição
      setEditedCalories(result.analysis.totalCalories.toString());
      setEditedProtein(result.analysis.protein.toString());
      setEditedCarbs(result.analysis.carbs.toString());
      setEditedFat(result.analysis.fat.toString());
      
      // Salvar peso no histórico se foi informado
      if (plateWeight) {
        saveWeightToHistory(mealType, parseInt(plateWeight));
      }
    } else {
      alert('Erro ao analisar foto: ' + result.error);
    }

    setAnalyzing(false);
  };

  const handleSave = () => {
    if (!analysis) return;

    const finalAnalysis = editMode ? {
      ...analysis,
      totalCalories: parseInt(editedCalories) || analysis.totalCalories,
      protein: parseInt(editedProtein) || analysis.protein,
      carbs: parseInt(editedCarbs) || analysis.carbs,
      fat: parseInt(editedFat) || analysis.fat
    } : analysis;

    onSave({
      mealType,
      description: finalAnalysis.description,
      calories: finalAnalysis.totalCalories,
      protein: finalAnalysis.protein,
      carbs: finalAnalysis.carbs,
      fat: finalAnalysis.fat,
      photoUrl: preview, // Base64 da foto
      foods: finalAnalysis.foods,
      analyzedAt: new Date().toISOString()
    });
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high': return '#2E7D32';
      case 'medium': return '#F57C00';
      case 'low': return '#D32F2F';
      default: return '#666';
    }
  };

  const getConfidenceText = (confidence) => {
    switch (confidence) {
      case 'high': return 'Alta confiança';
      case 'medium': return 'Confiança média';
      case 'low': return 'Baixa confiança';
      default: return 'Desconhecida';
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={styles.title}>📸 Analisar Foto de Refeição</h3>
          <button onClick={onCancel} style={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        {/* UPLOAD SECTION */}
        {!preview && (
          <div style={styles.uploadSection}>
            <div style={styles.uploadBox}>
              <Camera size={48} style={{color: '#2E7D32', marginBottom: '16px'}} />
              <p style={styles.uploadText}>Escolha uma foto da sua refeição</p>
              
              <div style={styles.uploadButtons}>
                {/* Botão Galeria */}
                <label style={styles.uploadButton}>
                  <Upload size={20} />
                  Galeria
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{display: 'none'}}
                  />
                </label>

                {/* Botão Câmera (só mobile) */}
                <label style={styles.cameraButton}>
                  <Camera size={20} />
                  Câmera
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    style={{display: 'none'}}
                  />
                </label>
              </div>
              
              <p style={styles.uploadHint}>Máximo 5MB • JPG, PNG</p>
            </div>
          </div>
        )}

        {/* PREVIEW & ANALYSIS */}
        {preview && (
          <div style={styles.content}>
            {/* Photo Preview */}
            <div style={styles.previewSection}>
              <img src={preview} alt="Preview" style={styles.previewImage} />
              <button 
                onClick={() => {
                  setPreview(null);
                  setSelectedFile(null);
                  setAnalysis(null);
                }}
                style={styles.changePhotoButton}
              >
                Trocar Foto
              </button>
            </div>

            {/* Meal Type Selector */}
            <div style={styles.mealTypeSection}>
              <label style={styles.label}>Tipo de Refeição</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                style={styles.select}
              >
                <option value="breakfast">☕ Café da Manhã</option>
                <option value="lunch">🍱 Almoço</option>
                <option value="snack">🍪 Lanche</option>
                <option value="dinner">🍽️ Jantar</option>
              </select>
            </div>

            {/* Plate Weight Input */}
            <div style={styles.weightSection}>
              <label style={styles.label}>⚖️ Peso do Prato (opcional)</label>
              <div style={styles.weightInputContainer}>
                <input
                  type="number"
                  placeholder="Ex: 450"
                  value={plateWeight}
                  onChange={(e) => {
                    setPlateWeight(e.target.value);
                    if (e.target.value) validateWeight(e.target.value);
                  }}
                  style={{
                    ...styles.weightInput,
                    ...(showWeightWarning && styles.weightInputWarning)
                  }}
                />
                <span style={styles.weightUnit}>gramas</span>
              </div>
              
              {/* Sugestão baseada em histórico */}
              {!plateWeight && (
                <div style={styles.weightSuggestion}>
                  💡 Sugestão: <button 
                    onClick={() => setPlateWeight(getSuggestedWeight().toString())}
                    style={styles.suggestionButton}
                  >
                    {getSuggestedWeight()}g
                  </button>
                  {getAverageWeight(mealType) && (
                    <span style={styles.avgText}>
                      (sua média: {getAverageWeight(mealType)}g)
                    </span>
                  )}
                </div>
              )}
              
              {/* Warning */}
              {showWeightWarning && plateWeight && (
                <div style={styles.warningBox}>
                  ⚠️ {getWeightWarningMessage()}
                </div>
              )}
              
              <p style={styles.weightHint}>
                Informar o peso ajuda a IA calcular com mais precisão
              </p>
            </div>

            {/* Analyze Button */}
            {!analysis && !analyzing && (
              <button onClick={handleAnalyze} style={styles.analyzeButton}>
                <Camera size={20} />
                {plateWeight ? `Analisar ${plateWeight}g com IA` : 'Analisar com IA'}
              </button>
            )}

            {/* Loading */}
            {analyzing && (
              <div style={styles.loadingBox}>
                <Loader size={32} className="spinner" style={{color: '#2E7D32'}} />
                <p style={styles.loadingText}>Analisando foto...</p>
                <p style={styles.loadingSubtext}>
                  {plateWeight 
                    ? `Considerando peso de ${plateWeight}g no cálculo`
                    : 'Identificando alimentos e calculando nutrientes'
                  }
                </p>
              </div>
            )}

            {/* Analysis Results */}
            {analysis && (
              <div style={styles.resultsSection}>
                <div style={styles.confidenceBadge}>
                  <div 
                    style={{
                      ...styles.confidenceDot,
                      background: getConfidenceColor(analysis.confidence)
                    }}
                  />
                  {getConfidenceText(analysis.confidence)}
                </div>

                <div style={styles.descriptionBox}>
                  <h4 style={styles.descriptionTitle}>🍽️ Identificado:</h4>
                  <p style={styles.descriptionText}>{analysis.description}</p>
                </div>

                {/* Foods List */}
                <div style={styles.foodsSection}>
                  <h4 style={styles.sectionTitle}>
                    Alimentos Detectados:
                    {analysis.totalWeight && (
                      <span style={styles.totalWeightBadge}>
                        ⚖️ {analysis.totalWeight}g total
                      </span>
                    )}
                  </h4>
                  <div style={styles.foodsList}>
                    {analysis.foods.map((food, index) => (
                      <div key={index} style={styles.foodItem}>
                        <div style={styles.foodItemHeader}>
                          <span style={styles.foodName}>{food.name}</span>
                          {food.percentage && (
                            <span style={styles.foodPercentage}>{food.percentage}%</span>
                          )}
                        </div>
                        <div style={styles.foodItemDetails}>
                          {food.weight && (
                            <span style={styles.foodWeight}>⚖️ {food.weight}g</span>
                          )}
                          <span style={styles.foodPortion}>{food.portion}</span>
                          <span style={styles.foodCalories}>{food.calories} kcal</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nutrition Summary */}
                <div style={styles.nutritionBox}>
                  <div style={styles.nutritionHeader}>
                    <h4 style={styles.nutritionTitle}>📊 Resumo Nutricional</h4>
                    <button 
                      onClick={() => setEditMode(!editMode)}
                      style={styles.editButton}
                    >
                      <Edit size={16} />
                      {editMode ? 'Cancelar' : 'Ajustar'}
                    </button>
                  </div>

                  {!editMode ? (
                    <div style={styles.nutritionGrid}>
                      <div style={styles.nutritionCard}>
                        <div style={styles.nutritionValue}>{analysis.totalCalories}</div>
                        <div style={styles.nutritionLabel}>Calorias</div>
                      </div>
                      <div style={styles.nutritionCard}>
                        <div style={styles.nutritionValue}>{analysis.protein}g</div>
                        <div style={styles.nutritionLabel}>Proteínas</div>
                      </div>
                      <div style={styles.nutritionCard}>
                        <div style={styles.nutritionValue}>{analysis.carbs}g</div>
                        <div style={styles.nutritionLabel}>Carboidratos</div>
                      </div>
                      <div style={styles.nutritionCard}>
                        <div style={styles.nutritionValue}>{analysis.fat}g</div>
                        <div style={styles.nutritionLabel}>Gorduras</div>
                      </div>
                    </div>
                  ) : (
                    <div style={styles.editGrid}>
                      <div style={styles.editField}>
                        <label style={styles.editLabel}>Calorias</label>
                        <input
                          type="number"
                          value={editedCalories}
                          onChange={(e) => setEditedCalories(e.target.value)}
                          style={styles.editInput}
                        />
                      </div>
                      <div style={styles.editField}>
                        <label style={styles.editLabel}>Proteínas (g)</label>
                        <input
                          type="number"
                          value={editedProtein}
                          onChange={(e) => setEditedProtein(e.target.value)}
                          style={styles.editInput}
                        />
                      </div>
                      <div style={styles.editField}>
                        <label style={styles.editLabel}>Carboidratos (g)</label>
                        <input
                          type="number"
                          value={editedCarbs}
                          onChange={(e) => setEditedCarbs(e.target.value)}
                          style={styles.editInput}
                        />
                      </div>
                      <div style={styles.editField}>
                        <label style={styles.editLabel}>Gorduras (g)</label>
                        <input
                          type="number"
                          value={editedFat}
                          onChange={(e) => setEditedFat(e.target.value)}
                          style={styles.editInput}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={styles.actionButtons}>
                  <button onClick={onCancel} style={styles.cancelButton}>
                    Cancelar
                  </button>
                  <button onClick={handleSave} style={styles.saveButton}>
                    <Check size={20} />
                    Salvar no Diário
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '2px solid #f0f0f0'
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#2E7D32',
    margin: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: '#666'
  },
  uploadSection: {
    padding: '40px 20px'
  },
  uploadBox: {
    border: '3px dashed #2E7D32',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center',
    background: '#f9fff9'
  },
  uploadText: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '20px'
  },
  uploadButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  uploadButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  cameraButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  uploadHint: {
    fontSize: '13px',
    color: '#999',
    marginTop: '12px'
  },
  content: {
    padding: '20px'
  },
  previewSection: {
    marginBottom: '20px'
  },
  previewImage: {
    width: '100%',
    borderRadius: '12px',
    marginBottom: '12px'
  },
  changePhotoButton: {
    width: '100%',
    padding: '10px',
    background: '#f5f5f5',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
    cursor: 'pointer'
  },
  mealTypeSection: {
    marginBottom: '20px'
  },
  weightSection: {
    marginBottom: '20px'
  },
  weightInputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  weightInput: {
    flex: 1,
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  weightInputWarning: {
    borderColor: '#F57C00'
  },
  weightUnit: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '600'
  },
  weightSuggestion: {
    marginTop: '8px',
    fontSize: '13px',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },
  suggestionButton: {
    padding: '4px 12px',
    background: '#f0f0f0',
    border: '2px solid #2E7D32',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#2E7D32',
    cursor: 'pointer'
  },
  avgText: {
    fontSize: '12px',
    color: '#999'
  },
  warningBox: {
    marginTop: '8px',
    padding: '8px 12px',
    background: '#FFF3E0',
    border: '1px solid #F57C00',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#E65100'
  },
  weightHint: {
    fontSize: '12px',
    color: '#999',
    marginTop: '8px',
    marginBottom: 0
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: '8px'
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box'
  },
  analyzeButton: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  loadingBox: {
    textAlign: 'center',
    padding: '40px 20px'
  },
  loadingText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2E7D32',
    marginTop: '16px',
    marginBottom: '4px'
  },
  loadingSubtext: {
    fontSize: '13px',
    color: '#666'
  },
  resultsSection: {
    marginTop: '20px'
  },
  confidenceBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    background: '#f5f5f5',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '16px'
  },
  confidenceDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  descriptionBox: {
    background: '#f9f9f9',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px'
  },
  descriptionTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: '8px'
  },
  descriptionText: {
    fontSize: '14px',
    color: '#333',
    lineHeight: '1.6',
    margin: 0
  },
  foodsSection: {
    marginBottom: '20px'
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: '12px'
  },
  foodsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  totalWeightBadge: {
    marginLeft: '12px',
    padding: '4px 12px',
    background: '#E8F5E9',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#2E7D32'
  },
  foodItem: {
    padding: '12px',
    background: '#f9f9f9',
    borderRadius: '8px',
    border: '1px solid #e0e0e0'
  },
  foodItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  foodName: {
    fontWeight: '700',
    color: '#333',
    fontSize: '14px'
  },
  foodPercentage: {
    padding: '2px 8px',
    background: '#2E7D32',
    color: 'white',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '700'
  },
  foodItemDetails: {
    display: 'flex',
    gap: '12px',
    fontSize: '12px',
    color: '#666',
    flexWrap: 'wrap'
  },
  foodWeight: {
    fontWeight: '600',
    color: '#1976D2'
  },
  foodPortion: {
    color: '#666'
  },
  foodCalories: {
    color: '#2E7D32',
    fontWeight: '600'
  },
  nutritionBox: {
    background: '#f9fff9',
    border: '2px solid #2E7D32',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px'
  },
  nutritionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  nutritionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#2E7D32',
    margin: 0
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    background: 'white',
    border: '2px solid #2E7D32',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#2E7D32',
    cursor: 'pointer'
  },
  nutritionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
    gap: '12px'
  },
  nutritionCard: {
    textAlign: 'center'
  },
  nutritionValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2E7D32'
  },
  nutritionLabel: {
    fontSize: '11px',
    color: '#666',
    marginTop: '4px'
  },
  editGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px'
  },
  editField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  editLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#666'
  },
  editInput: {
    padding: '8px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  actionButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '12px'
  },
  cancelButton: {
    padding: '12px',
    background: '#f5f5f5',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
    cursor: 'pointer'
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer'
  }
};

export default PhotoAnalysis;
