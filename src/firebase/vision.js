// ===================================
// GEMINI VISION - ANÁLISE DE FOTOS
// ===================================

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_VISION_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

export const analyzeFood = async (imageFile) => {
  try {
    // Converter imagem para base64
    const base64Image = await fileToBase64(imageFile);
    
    const prompt = `Você é um nutricionista especializado em análise visual de alimentos.

Analise esta foto de refeição e forneça informações nutricionais detalhadas.

IMPORTANTE: Responda APENAS com um JSON válido (sem markdown, sem \`\`\`json), no seguinte formato:

{
  "description": "Descrição detalhada do que você vê no prato",
  "foods": [
    {
      "name": "Nome do alimento",
      "portion": "Porção estimada (ex: 150g, 1 unidade, 1 xícara)",
      "calories": 200
    }
  ],
  "totalCalories": 450,
  "protein": 35,
  "carbs": 45,
  "fat": 12,
  "confidence": "high"
}

Regras importantes:
1. Identifique TODOS os alimentos visíveis
2. Estime porções realistas baseadas no tamanho visual
3. Calcule calorias e macros com precisão
4. Se não tiver certeza, indique "confidence": "medium" ou "low"
5. Seja específico (ex: "arroz branco" não apenas "arroz")
6. Considere preparações (grelhado, frito, cozido)`;

    const response = await fetch(`${GEMINI_VISION_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: prompt
            },
            {
              inline_data: {
                mime_type: imageFile.type,
                data: base64Image
              }
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Erro na API do Gemini Vision');
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Resposta inválida da API');
    }

    let analysisText = data.candidates[0].content.parts[0].text.trim();
    
    // Remove markdown code blocks se existirem
    analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const analysis = JSON.parse(analysisText);

    // Validar estrutura
    if (!analysis.description || !analysis.foods || !analysis.totalCalories) {
      throw new Error('Análise incompleta gerada pela IA');
    }

    return {
      success: true,
      analysis
    };

  } catch (error) {
    console.error('Error analyzing food:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Função auxiliar para converter File para base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Remove o prefixo "data:image/jpeg;base64," etc
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Função para redimensionar imagem antes de enviar (otimização)
export const resizeImage = (file, maxWidth = 1024) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.85);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};
