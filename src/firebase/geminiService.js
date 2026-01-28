// ===================================
// GEMINI SERVICE - SISTEMA ROBUSTO COM FALLBACK
// ===================================
// Este serviço garante que o app continue funcionando
// mesmo quando o Google muda/descontinua modelos

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// ===================================
// LISTA DE MODELOS (ordem de prioridade)
// ===================================
const GEMINI_MODELS = [
  'gemini-2.0-flash',       // Principal (mais recente)
  'gemini-1.5-flash',       // Fallback 1 (estável)
  'gemini-1.5-pro',         // Fallback 2 (mais capaz)
  'gemini-1.0-pro',         // Fallback 3 (legado)
];

// ===================================
// MENSAGENS DE ERRO AMIGÁVEIS
// ===================================
const ERROR_MESSAGES = {
  MODEL_NOT_FOUND: 'Estamos atualizando nossos serviços. Por favor, tente novamente em alguns segundos.',
  QUOTA_EXCEEDED: 'Muitas requisições no momento. Aguarde alguns segundos e tente novamente.',
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet e tente novamente.',
  INVALID_RESPONSE: 'Não conseguimos processar sua solicitação. Tente descrever de outra forma.',
  GENERIC_ERROR: 'Ocorreu um erro temporário. Por favor, tente novamente.',
};

// ===================================
// FUNÇÃO PARA DETECTAR TIPO DE ERRO
// ===================================
const getErrorType = (error) => {
  const errorString = error?.message || error?.toString() || '';
  
  if (errorString.includes('not found') || errorString.includes('not supported')) {
    return 'MODEL_NOT_FOUND';
  }
  if (errorString.includes('quota') || errorString.includes('rate limit') || errorString.includes('429')) {
    return 'QUOTA_EXCEEDED';
  }
  if (errorString.includes('network') || errorString.includes('fetch') || errorString.includes('Failed to fetch')) {
    return 'NETWORK_ERROR';
  }
  if (errorString.includes('JSON') || errorString.includes('parse')) {
    return 'INVALID_RESPONSE';
  }
  return 'GENERIC_ERROR';
};

// ===================================
// FUNÇÃO PARA OBTER MENSAGEM AMIGÁVEL
// ===================================
export const getFriendlyErrorMessage = (error) => {
  const errorType = getErrorType(error);
  return ERROR_MESSAGES[errorType] || ERROR_MESSAGES.GENERIC_ERROR;
};

// ===================================
// FUNÇÃO PRINCIPAL - CHAMADA COM FALLBACK
// ===================================
export const callGeminiWithFallback = async (prompt, options = {}) => {
  const { 
    isVision = false, 
    imageData = null,
    maxRetries = 3,
    retryDelay = 1000 
  } = options;

  let lastError = null;
  
  // Tentar cada modelo na lista
  for (const model of GEMINI_MODELS) {
    console.log(`🤖 Tentando modelo: ${model}`);
    
    try {
      const result = await callGeminiModel(model, prompt, { isVision, imageData });
      
      if (result.success) {
        console.log(`✅ Sucesso com modelo: ${model}`);
        return result;
      }
      
      lastError = result.error;
      console.warn(`⚠️ Modelo ${model} falhou:`, result.error);
      
      // Se for erro de modelo não encontrado, tentar próximo
      if (getErrorType(result.error) === 'MODEL_NOT_FOUND') {
        continue;
      }
      
      // Se for erro de quota, esperar e tentar novamente com mesmo modelo
      if (getErrorType(result.error) === 'QUOTA_EXCEEDED') {
        console.log(`⏳ Aguardando ${retryDelay}ms antes de tentar novamente...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      
    } catch (error) {
      lastError = error;
      console.error(`❌ Erro com modelo ${model}:`, error);
    }
  }
  
  // Todos os modelos falharam
  console.error('❌ Todos os modelos falharam!');
  return {
    success: false,
    error: lastError,
    friendlyMessage: getFriendlyErrorMessage(lastError)
  };
};

// ===================================
// FUNÇÃO PARA CHAMAR UM MODELO ESPECÍFICO
// ===================================
const callGeminiModel = async (model, prompt, options = {}) => {
  const { isVision = false, imageData = null } = options;
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  
  let requestBody;
  
  if (isVision && imageData) {
    // Requisição com imagem
    requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: imageData.mimeType || 'image/jpeg',
              data: imageData.base64
            }
          }
        ]
      }]
    };
  } else {
    // Requisição só texto
    requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || `HTTP ${response.status}`;
      return { success: false, error: errorMessage };
    }
    
    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      return { success: false, error: 'Resposta inválida da API' };
    }
    
    const text = data.candidates[0].content.parts[0].text;
    
    return { success: true, text, model };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ===================================
// FUNÇÕES DE CONVENIÊNCIA
// ===================================

/**
 * Analisar texto de refeição
 */
export const analyzeNutrition = async (description) => {
  const prompt = `Analise esta refeição e retorne APENAS um JSON válido com as informações nutricionais:

Refeição: "${description}"

Retorne no formato:
{
  "foods": [
    {
      "name": "nome do alimento",
      "quantity": "quantidade estimada",
      "calories": número,
      "protein": número em gramas,
      "carbs": número em gramas,
      "fat": número em gramas
    }
  ],
  "totalCalories": soma total,
  "totalProtein": soma total,
  "totalCarbs": soma total,
  "totalFat": soma total
}

IMPORTANTE: Retorne APENAS o JSON, sem explicações ou markdown.`;

  const result = await callGeminiWithFallback(prompt);
  
  if (!result.success) {
    return result;
  }
  
  try {
    // Limpar resposta e fazer parse do JSON
    const cleanText = result.text
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim();
    
    const nutritionData = JSON.parse(cleanText);
    return { success: true, data: nutritionData };
    
  } catch (parseError) {
    console.error('Erro ao fazer parse do JSON:', parseError);
    return { 
      success: false, 
      error: parseError.message,
      friendlyMessage: ERROR_MESSAGES.INVALID_RESPONSE
    };
  }
};

/**
 * Analisar foto de refeição
 */
export const analyzePhotoNutrition = async (base64Image, mimeType = 'image/jpeg', plateWeight = null) => {
  const weightInfo = plateWeight 
    ? `\n\nIMPORTANTE: O prato pesa ${plateWeight}g no total. Use este peso como referência para calcular as porções de cada alimento proporcionalmente.`
    : '';

  const prompt = `Analise esta foto de refeição e identifique todos os alimentos visíveis.
Para cada alimento, estime a quantidade e os valores nutricionais.${weightInfo}

Retorne APENAS um JSON válido no formato:
{
  "foods": [
    {
      "name": "nome do alimento",
      "quantity": "quantidade estimada (ex: 100g, 1 unidade)",
      "calories": número,
      "protein": número em gramas,
      "carbs": número em gramas,
      "fat": número em gramas
    }
  ],
  "totalCalories": soma total,
  "totalProtein": soma total em gramas,
  "totalCarbs": soma total em gramas,
  "totalFat": soma total em gramas,
  "description": "descrição breve da refeição"
}

IMPORTANTE: Retorne APENAS o JSON, sem explicações ou markdown.`;

  const result = await callGeminiWithFallback(prompt, {
    isVision: true,
    imageData: { base64: base64Image, mimeType }
  });
  
  if (!result.success) {
    return result;
  }
  
  try {
    const cleanText = result.text
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim();
    
    const nutritionData = JSON.parse(cleanText);
    return { success: true, data: nutritionData };
    
  } catch (parseError) {
    console.error('Erro ao fazer parse do JSON:', parseError);
    return { 
      success: false, 
      error: parseError.message,
      friendlyMessage: ERROR_MESSAGES.INVALID_RESPONSE
    };
  }
};

/**
 * Gerar receita
 */
export const generateRecipeWithAI = async (ingredients, preferences = {}) => {
  const { restrictions = [], goal = 'manter', maxCalories = null } = preferences;
  
  let prompt = `Crie uma receita saudável usando estes ingredientes: ${ingredients.join(', ')}.`;
  
  if (restrictions.length > 0) {
    prompt += `\n\nRestrições alimentares: ${restrictions.join(', ')}.`;
  }
  
  if (goal === 'perder') {
    prompt += '\n\nFoco em receita LOW CARB e baixa caloria.';
  } else if (goal === 'ganhar') {
    prompt += '\n\nFoco em receita RICA EM PROTEÍNAS.';
  }
  
  if (maxCalories) {
    prompt += `\n\nMáximo de ${maxCalories} calorias por porção.`;
  }
  
  prompt += `\n\nRetorne APENAS um JSON válido no formato:
{
  "name": "nome da receita",
  "description": "descrição breve",
  "prepTime": "tempo de preparo",
  "servings": número de porções,
  "ingredients": ["ingrediente 1 com quantidade", "ingrediente 2"],
  "instructions": ["passo 1", "passo 2"],
  "nutrition": {
    "calories": número por porção,
    "protein": gramas,
    "carbs": gramas,
    "fat": gramas
  },
  "tips": ["dica 1", "dica 2"]
}

IMPORTANTE: Retorne APENAS o JSON, sem explicações ou markdown.`;

  const result = await callGeminiWithFallback(prompt);
  
  if (!result.success) {
    return result;
  }
  
  try {
    const cleanText = result.text
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim();
    
    const recipeData = JSON.parse(cleanText);
    return { success: true, data: recipeData };
    
  } catch (parseError) {
    console.error('Erro ao fazer parse do JSON:', parseError);
    return { 
      success: false, 
      error: parseError.message,
      friendlyMessage: ERROR_MESSAGES.INVALID_RESPONSE
    };
  }
};

// ===================================
// EXPORTAR TUDO
// ===================================
export default {
  callGeminiWithFallback,
  analyzeNutrition,
  analyzePhotoNutrition,
  generateRecipeWithAI,
  getFriendlyErrorMessage,
  GEMINI_MODELS,
  ERROR_MESSAGES
};
