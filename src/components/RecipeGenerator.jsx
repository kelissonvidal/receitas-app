import { useState, useEffect } from 'react';
import { generateRecipe, saveFavoriteRecipe, getFavoriteRecipes, deleteFavoriteRecipe } from '../firebase/recipes';
import { ChefHat, Clock, Loader, Star, Trash2 } from 'lucide-react';

const RecipeGenerator = ({ user, userProfile }) => {
  const [ingredients, setIngredients] = useState('');
  const [mealType, setMealType] = useState('lunch');
  const [difficulty, setDifficulty] = useState('easy');
  const [time, setTime] = useState('30');
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  // Carregar favoritos ao montar
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoadingFavorites(true);
    const result = await getFavoriteRecipes(user.uid);
    if (result.success) {
      setFavorites(result.recipes);
    }
    setLoadingFavorites(false);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (!ingredients.trim()) {
      alert('Digite pelo menos alguns ingredientes!');
      return;
    }
    
    setLoading(true);
    setRecipe(null);
    
    const restrictions = userProfile?.dietaryRestrictions || [];
    const healthConditions = userProfile?.healthConditions || [];
    
    const result = await generateRecipe({
      ingredients: ingredients.trim(),
      mealType,
      difficulty,
      maxTime: parseInt(time),
      restrictions,
      healthConditions,
      targetCalories: userProfile?.calculated?.targetCalories
    });
    
    if (result.success) {
      setRecipe(result.recipe);
      // Limpar campos após gerar
      setIngredients('');
      setMealType('lunch');
      setDifficulty('easy');
      setTime('30');
    } else {
      alert('Erro ao gerar receita: ' + result.error);
    }
    
    setLoading(false);
  };

  const addToFavorites = async () => {
    if (recipe) {
      const recipeWithId = {
        ...recipe,
        id: Date.now().toString(),
        savedAt: new Date().toISOString()
      };
      
      const result = await saveFavoriteRecipe(user.uid, recipeWithId);
      
      if (result.success) {
        setFavorites([recipeWithId, ...favorites]);
        alert('Receita salva nos favoritos! ⭐');
      } else {
        alert('Erro ao salvar: ' + result.error);
      }
    }
  };

  const removeFavorite = async (recipeId) => {
    if (confirm('Remover receita dos favoritos?')) {
      const result = await deleteFavoriteRecipe(user.uid, recipeId);
      
      if (result.success) {
        setFavorites(favorites.filter(fav => fav.id !== recipeId));
      } else {
        alert('Erro ao remover: ' + result.error);
      }
    }
  };

  const openFavorite = (favoriteRecipe) => {
    setRecipe(favoriteRecipe);
    // Aguardar render e scroll até a receita
    setTimeout(() => {
      const recipeElement = document.getElementById('recipe-display');
      if (recipeElement) {
        recipeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <ChefHat size={32} style={{color: '#2E7D32'}} />
          <div>
            <h2 style={styles.title}>🍳 Gerador de Receitas com IA</h2>
            <p style={styles.subtitle}>Crie receitas personalizadas com inteligência artificial</p>
          </div>
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleGenerate} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>🥕 Ingredientes Disponíveis</label>
          <textarea
            placeholder="Ex: frango, arroz, brócolis, alho, cebola..."
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            disabled={loading}
            style={styles.textarea}
            rows={3}
          />
          <span style={styles.hint}>Separe por vírgula os ingredientes que você tem</span>
        </div>

        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>🍽️ Tipo de Refeição</label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              disabled={loading}
              style={styles.select}
            >
              <option value="breakfast">☕ Café da Manhã</option>
              <option value="lunch">🍱 Almoço</option>
              <option value="snack">🍪 Lanche</option>
              <option value="dinner">🍽️ Jantar</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>📊 Dificuldade</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              disabled={loading}
              style={styles.select}
            >
              <option value="easy">😊 Fácil</option>
              <option value="medium">👨‍🍳 Médio</option>
              <option value="hard">⭐ Difícil</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>⏱️ Tempo Máximo</label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={loading}
              style={styles.select}
            >
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">1 hora</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{...styles.button, ...(loading && styles.buttonDisabled)}}
        >
          {loading ? (
            <><Loader size={18} className="spinner" /> Criando receita...</>
          ) : (
            <><ChefHat size={18} /> Gerar Receita com IA</>
          )}
        </button>
      </form>

      {/* RECIPE DISPLAY */}
      {recipe && (
        <div id="recipe-display" style={styles.recipeCard}>
          <div style={styles.recipeHeader}>
            <div>
              <h3 style={styles.recipeName}>{recipe.name}</h3>
              <div style={styles.recipeInfo}>
                <span style={styles.infoItem}>
                  <Clock size={14} /> {recipe.prepTime} min
                </span>
                <span style={styles.infoItem}>
                  🔥 {recipe.calories} kcal
                </span>
                <span style={styles.infoItem}>
                  😊 {recipe.difficulty === 'easy' ? 'Fácil' : recipe.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                </span>
              </div>
            </div>
            <button onClick={addToFavorites} style={styles.favoriteButton}>
              <Star size={20} />
            </button>
          </div>

          <div style={styles.recipeSection}>
            <h4 style={styles.sectionTitle}>📝 Ingredientes</h4>
            <ul style={styles.ingredientsList}>
              {recipe.ingredients.map((item, index) => (
                <li key={index} style={styles.ingredientItem}>{item}</li>
              ))}
            </ul>
          </div>

          <div style={styles.recipeSection}>
            <h4 style={styles.sectionTitle}>👨‍🍳 Modo de Preparo</h4>
            <ol style={styles.stepsList}>
              {recipe.instructions.map((step, index) => (
                <li key={index} style={styles.stepItem}>{step}</li>
              ))}
            </ol>
          </div>

          {recipe.tips && (
            <div style={styles.tipsSection}>
              <h4 style={styles.sectionTitle}>💡 Dicas</h4>
              <p style={styles.tipsText}>{recipe.tips}</p>
            </div>
          )}

          <div style={styles.nutritionSection}>
            <h4 style={styles.sectionTitle}>📊 Informação Nutricional</h4>
            <div style={styles.nutritionGrid}>
              <div style={styles.nutritionItem}>
                <div style={styles.nutritionValue}>{recipe.protein}g</div>
                <div style={styles.nutritionLabel}>Proteínas</div>
              </div>
              <div style={styles.nutritionItem}>
                <div style={styles.nutritionValue}>{recipe.carbs}g</div>
                <div style={styles.nutritionLabel}>Carboidratos</div>
              </div>
              <div style={styles.nutritionItem}>
                <div style={styles.nutritionValue}>{recipe.fat}g</div>
                <div style={styles.nutritionLabel}>Gorduras</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAVORITES */}
      {favorites.length > 0 && (
        <div style={styles.favoritesSection}>
          <h3 style={styles.favoritesTitle}>⭐ Receitas Favoritas ({favorites.length})</h3>
          <div style={styles.favoritesGrid}>
            {favorites.map((fav) => (
              <div 
                key={fav.id} 
                style={styles.favoriteCard}
                className="favorite-card-hover"
                onClick={() => openFavorite(fav)}
              >
                <div style={styles.favoriteCardContent}>
                  <h4 style={styles.favoriteCardName}>{fav.name}</h4>
                  <div style={styles.favoriteCardInfo}>
                    <span><Clock size={12} /> {fav.prepTime} min</span>
                    <span>🔥 {fav.calories} kcal</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavorite(fav.id);
                  }}
                  style={styles.removeButton}
                  title="Remover"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {loadingFavorites && favorites.length === 0 && (
        <div style={styles.loadingFavorites}>
          <Loader size={20} className="spinner" />
          <span style={{marginLeft: '8px', color: '#666'}}>Carregando favoritos...</span>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    overflowX: 'hidden',
    width: '100%'
  },
  header: {
    marginBottom: '24px'
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#2E7D32',
    margin: 0
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: '4px 0 0 0'
  },
  form: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    border: '2px solid #f0f0f0',
    marginBottom: '24px',
    boxSizing: 'border-box',
    width: '100%',
    overflowX: 'hidden'
  },
  formGroup: {
    marginBottom: '20px',
    flex: 1
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: '8px'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box'
  },
  hint: {
    fontSize: '12px',
    color: '#999',
    display: 'block',
    marginTop: '4px'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px'
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
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
  recipeCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    border: '2px solid #2E7D32',
    marginBottom: '24px',
    boxSizing: 'border-box',
    width: '100%',
    overflowX: 'hidden'
  },
  recipeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '2px solid #f0f0f0'
  },
  recipeName: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2E7D32',
    margin: '0 0 8px 0'
  },
  recipeInfo: {
    display: 'flex',
    gap: '16px',
    fontSize: '13px',
    color: '#666'
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  favoriteButton: {
    padding: '8px',
    background: '#FFF8DC',
    border: '2px solid #DAA520',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#DAA520'
  },
  recipeSection: {
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: '12px'
  },
  ingredientsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '8px'
  },
  ingredientItem: {
    padding: '8px 12px',
    background: '#f9f9f9',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#333'
  },
  stepsList: {
    paddingLeft: '20px',
    margin: 0
  },
  stepItem: {
    fontSize: '14px',
    color: '#333',
    lineHeight: '1.8',
    marginBottom: '12px'
  },
  tipsSection: {
    background: 'linear-gradient(135deg, #FFF8DC 0%, #FAEBD7 100%)',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px'
  },
  tipsText: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
    lineHeight: '1.6'
  },
  nutritionSection: {
    background: '#f9f9f9',
    padding: '16px',
    borderRadius: '8px'
  },
  nutritionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px'
  },
  nutritionItem: {
    textAlign: 'center'
  },
  nutritionValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2E7D32'
  },
  nutritionLabel: {
    fontSize: '12px',
    color: '#666',
    marginTop: '4px'
  },
  favoritesSection: {
    marginTop: '32px'
  },
  favoritesTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: '16px'
  },
  favoritesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px'
  },
  favoriteCard: {
    background: 'white',
    border: '2px solid #f0f0f0',
    borderRadius: '8px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  favoriteCardContent: {
    flex: 1
  },
  favoriteCardName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#2E7D32',
    margin: '0 0 8px 0'
  },
  favoriteCardInfo: {
    fontSize: '12px',
    color: '#666',
    display: 'flex',
    gap: '12px'
  },
  removeButton: {
    padding: '4px',
    background: '#fee',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#c33',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingFavorites: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    color: '#666'
  }
};

export default RecipeGenerator;

// Adicionar hover effect nos favoritos
const hoverStyles = `
  .favorite-card-hover:hover {
    border-color: #2E7D32;
    box-shadow: 0 4px 12px rgba(46, 125, 50, 0.1);
    transform: translateY(-2px);
  }
`;
