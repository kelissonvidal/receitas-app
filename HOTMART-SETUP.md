# INTEGRAÇÃO HOTMART - WEBHOOK

## 📋 CONFIGURAÇÃO NECESSÁRIA

### 1. CRIAR PRODUTOS NA HOTMART

Acesse: https://app.hotmart.com/products/new

**Produto 1: VigorAI Mensal**
- Nome: VigorAI Premium - Plano Mensal
- Preço: R$ 19,90
- Recorrência: Mensal
- Comissão: Configure conforme necessário

**Produto 2: VigorAI Anual**
- Nome: VigorAI Premium - Plano Anual
- Preço: R$ 179,70
- Parcelamento: 3x sem juros (R$ 59,90)
- Recorrência: Anual
- Comissão: Configure conforme necessário

**Produto 3: VigorAI Vitalício**
- Nome: VigorAI Premium - Acesso Vitalício
- Preço: R$ 197,00
- Parcelamento: 6x sem juros (R$ 32,83)
- Pagamento único
- Comissão: Configure conforme necessário

---

### 2. OBTER LINKS DE CHECKOUT

Após criar os produtos, copie os links de checkout e atualize em:

**Arquivo:** `src/components/Paywall.jsx`

**Substitua nas linhas indicadas:**
```javascript
// Linha ~25 - Plano Mensal
hotmartLink: 'https://pay.hotmart.com/SEU_LINK_MENSAL'

// Linha ~42 - Plano Anual  
hotmartLink: 'https://pay.hotmart.com/SEU_LINK_ANUAL'

// Linha ~59 - Plano Vitalício
hotmartLink: 'https://pay.hotmart.com/SEU_LINK_VITALICIO'
```

---

### 3. CONFIGURAR WEBHOOK (DEPOIS DO DEPLOY)

**URL do Webhook será:**
```
https://us-central1-SEU_PROJETO.cloudfunctions.net/hotmartWebhook
```

**Passos:**
1. Faça o deploy da Cloud Function primeiro
2. Acesse: https://app.hotmart.com/tools/webhook
3. Configure a URL do webhook
4. Selecione eventos:
   - PURCHASE_COMPLETE
   - PURCHASE_CANCELED
   - SUBSCRIPTION_CANCELLATION

---

## 🎯 POR ENQUANTO

Você pode testar o sistema de assinatura SEM o webhook funcionando:

**Para testar:**
1. Configure os links de checkout no Paywall.jsx
2. O trial de 3 dias funcionará automaticamente
3. Quando um usuário comprar, você pode ativar manualmente no Firestore

**Ativação manual:**
```
users/{userId}/subscription/current
{
  status: 'active',
  plan: 'monthly', // ou 'annual' ou 'lifetime'
  expiresAt: [data futura],
  hotmartTransactionId: 'manual'
}
```

---

## 📞 SUPORTE

Dúvidas sobre a Hotmart:
- Docs: https://developers.hotmart.com/
- Suporte: https://atendimento.hotmart.com/
