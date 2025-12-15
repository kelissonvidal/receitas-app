// ===================================
// VERIFICAR ASSINATURA
// ===================================
// Endpoint: /api/check-subscription
// Verifica se usuário tem assinatura ativa

export default async function handler(req, res) {
  // Aceitar GET e POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const email = req.method === 'GET' ? req.query.email : req.body.email;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email obrigatório',
        active: false 
      });
    }

    // TEMPORÁRIO: Por enquanto, retorna falso
    // Quando integrar com banco de dados, vai buscar lá
    
    console.log('Verificando assinatura para:', email);

    // AQUI: Consultar banco de dados
    // const user = await db.users.findOne({ email });
    // const isActive = user && user.subscription && user.subscription.active;

    // Por enquanto, simulando
    const isActive = false;

    return res.status(200).json({
      email: email,
      active: isActive,
      message: isActive ? 'Assinatura ativa' : 'Sem assinatura ativa'
    });

  } catch (error) {
    console.error('Erro ao verificar assinatura:', error);
    return res.status(500).json({ 
      error: 'Erro ao verificar assinatura',
      active: false,
      message: error.message 
    });
  }
}
