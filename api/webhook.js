// ===================================
// WEBHOOK HOTMART
// ===================================
// Endpoint: /api/webhook
// Recebe notificações de pagamento da Hotmart

export default async function handler(req, res) {
  // Apenas aceitar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;
    
    // Log para debug (remover em produção)
    console.log('Webhook recebido:', JSON.stringify(data, null, 2));

    // Verificar se é evento de compra
    const event = data.event;
    
    if (event === 'PURCHASE_COMPLETE' || event === 'PURCHASE_APPROVED') {
      // Dados do comprador
      const buyerEmail = data.data.buyer.email;
      const buyerName = data.data.buyer.name;
      const productId = data.data.product.id;
      const transactionId = data.data.purchase.transaction;
      const status = data.data.purchase.status;

      console.log('Pagamento aprovado:', {
        email: buyerEmail,
        nome: buyerName,
        transaction: transactionId,
        status: status
      });

      // AQUI: Ativar assinatura do usuário
      // Por enquanto, vamos apenas retornar sucesso
      // Depois vamos integrar com banco de dados

      return res.status(200).json({ 
        success: true,
        message: 'Webhook processado',
        email: buyerEmail
      });
    }

    // Outros eventos (cancelamento, expiração, etc)
    if (event === 'PURCHASE_CANCELED') {
      const buyerEmail = data.data.buyer.email;
      
      console.log('Assinatura cancelada:', buyerEmail);
      
      // AQUI: Desativar assinatura do usuário
      
      return res.status(200).json({ 
        success: true,
        message: 'Cancelamento processado'
      });
    }

    if (event === 'PURCHASE_EXPIRED') {
      const buyerEmail = data.data.buyer.email;
      
      console.log('Assinatura expirada:', buyerEmail);
      
      // AQUI: Desativar assinatura do usuário
      
      return res.status(200).json({ 
        success: true,
        message: 'Expiração processada'
      });
    }

    // Evento desconhecido
    return res.status(200).json({ 
      success: true,
      message: 'Evento recebido mas não processado',
      event: event
    });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return res.status(500).json({ 
      error: 'Erro ao processar webhook',
      message: error.message 
    });
  }
}
