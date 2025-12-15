# 💳 GUIA COMPLETO - INTEGRAÇÃO DE PAGAMENTO HOTMART

## 📋 ÍNDICE
1. [Setup Hotmart](#1-setup-hotmart)
2. [Configurar Webhook](#2-configurar-webhook)
3. [Deploy do Backend](#3-deploy-do-backend)
4. [Testar Integração](#4-testar-integração)
5. [Banco de Dados (Próximo Passo)](#5-banco-de-dados)

---

## 1️⃣ SETUP HOTMART

### **Criar Conta**
1. Acesse: https://app.hotmart.com/signup
2. Preencha seus dados
3. Confirme o email
4. Faça login

### **Criar Produto**

1. **Dashboard** → **Produtos** → **Novo Produto**

2. **Informações Básicas:**
   - Nome: `Receitas Mais Rápidas - Premium`
   - Tipo: `Assinatura`
   - Categoria: `Alimentação e Saúde`

3. **Precificação:**
   - Preço: `R$ 59,90`
   - Recorrência: `Anual (12 meses)`
   - Trial: `3 dias grátis`

4. **Formas de Pagamento:**
   - ✅ PIX
   - ✅ Cartão de Crédito
   - ✅ Boleto Bancário

5. **Checkout:**
   - Tipo: `Checkout Hotmart` (padrão)
   - Página de obrigado: URL do seu app

6. **Salvar** e **Publicar**

### **Obter Link de Checkout**

1. No produto criado → **Vender**
2. Copie o **Link de Checkout**
   - Formato: `https://pay.hotmart.com/XXXXXXXXXXXXX`
3. **Guarde esse link!**

---

## 2️⃣ CONFIGURAR WEBHOOK

### **Na Hotmart:**

1. **Dashboard** → **Ferramentas** → **Webhooks**
2. **Adicionar Webhook**
3. **URL do Webhook**: 
   ```
   https://SEU-APP.vercel.app/api/webhook
   ```
   (Substitua `SEU-APP` pela sua URL da Vercel)

4. **Eventos a monitorar:**
   - ✅ `PURCHASE_COMPLETE`
   - ✅ `PURCHASE_APPROVED`
   - ✅ `PURCHASE_CANCELED`
   - ✅ `PURCHASE_EXPIRED`
   - ✅ `SUBSCRIPTION_CANCELED`

5. **Versão da API**: `2.0.0`

6. **Salvar**

### **Testar Webhook:**

Hotmart permite testar no ambiente de sandbox!

1. Na página de Webhooks → **Testar**
2. Escolha evento: `PURCHASE_COMPLETE`
3. **Enviar**
4. Verifique se chegou no seu endpoint

---

## 3️⃣ DEPLOY DO BACKEND

### **Arquivos Criados:**

Já criamos 2 endpoints serverless:

```
/api/webhook.js          → Recebe notificações da Hotmart
/api/check-subscription.js → Verifica status de assinatura
```

### **Adicionar Variável de Ambiente:**

No terminal, adicione o link do Hotmart:

```bash
vercel env add VITE_HOTMART_CHECKOUT_URL production
```

Cole seu link de checkout quando pedir.

### **Fazer Deploy:**

```bash
cd receitas-app
git add .
git commit -m "Integração de pagamento Hotmart"
vercel --prod
```

### **Testar Endpoints:**

#### Testar Webhook:
```bash
curl -X POST https://SEU-APP.vercel.app/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "PURCHASE_COMPLETE",
    "data": {
      "buyer": {
        "email": "teste@teste.com",
        "name": "Teste"
      },
      "product": {
        "id": "123"
      },
      "purchase": {
        "transaction": "TXN123",
        "status": "approved"
      }
    }
  }'
```

#### Testar Check Subscription:
```bash
curl https://SEU-APP.vercel.app/api/check-subscription?email=teste@teste.com
```

---

## 4️⃣ TESTAR INTEGRAÇÃO

### **Modo Sandbox (Hotmart):**

1. Hotmart → **Ferramentas** → **Modo Sandbox**
2. Ativar
3. Fazer compra teste
4. Verificar se webhook foi chamado

### **Logs na Vercel:**

1. Dashboard Vercel → Seu projeto
2. **Functions** → **Logs**
3. Acompanhar chamadas em tempo real

### **Fluxo de Teste:**

1. Abrir app no celular
2. Deixar trial expirar (ou simular)
3. Clicar "Assinar Agora"
4. Fazer compra teste
5. Verificar se webhook recebeu notificação
6. Ver logs no console

---

## 5️⃣ BANCO DE DADOS (Próximo Passo)

### **Por que precisa?**

Atualmente tudo está em `localStorage` (temporário).

Para produção, precisamos:
- Salvar usuários cadastrados
- Armazenar status de assinatura
- Registrar transações
- Sincronizar entre dispositivos

### **Opções Recomendadas:**

#### **OPÇÃO A: Firebase (Google) ✅ RECOMENDADO**

**Vantagens:**
- ✅ Grátis até 50k usuários
- ✅ Autenticação integrada
- ✅ Fácil de usar
- ✅ Sincronização em tempo real

**Setup:**
```bash
npm install firebase
```

**Estrutura no Firestore:**
```javascript
users/
  ├── user_email_com/
  │   ├── email: "user@email.com"
  │   ├── name: "Nome"
  │   ├── subscription: {
  │   │   ├── active: true
  │   │   ├── plan: "annual"
  │   │   ├── startDate: "2024-01-15"
  │   │   ├── expirationDate: "2025-01-15"
  │   │   └── transactionId: "TXN123"
  │   │}
  │   └── profile: {...}
```

#### **OPÇÃO B: Supabase (Open Source)**

**Vantagens:**
- ✅ PostgreSQL (SQL)
- ✅ Grátis até 500MB
- ✅ APIs REST automáticas

---

## 📊 PRÓXIMOS PASSOS

### **Implementação Completa:**

**SEMANA 1:**
1. ✅ Integrar Hotmart (FEITO!)
2. ⬜ Configurar Firebase/Supabase
3. ⬜ Criar sistema de autenticação
4. ⬜ Salvar usuários no banco

**SEMANA 2:**
1. ⬜ Webhook atualiza banco de dados
2. ⬜ Verificação de assinatura em tempo real
3. ⬜ Sincronizar favoritos entre dispositivos
4. ⬜ Histórico de receitas criadas

**SEMANA 3:**
1. ⬜ Painel administrativo
2. ⬜ Métricas e analytics
3. ⬜ Emails transacionais
4. ⬜ Testes completos

---

## 🐛 TROUBLESHOOTING

### **Webhook não está sendo chamado:**

1. Verificar URL está correta
2. Endpoint está público (sem autenticação Vercel)
3. Hotmart está no modo production
4. Ver logs na Hotmart (Ferramentas → Webhooks → Histórico)

### **Erro 500 no webhook:**

1. Ver logs na Vercel
2. Verificar estrutura do JSON
3. Adicionar mais try/catch

### **Link de checkout não abre:**

1. Produto está publicado?
2. Link está correto no `.env`?
3. Testar abrir manualmente no navegador

---

## 💰 CUSTOS

### **Hotmart:**
- Taxa: 9,9% + R$ 1,49 por venda
- Exemplo: Venda de R$ 59,90
  - Taxa Hotmart: R$ 7,43
  - Você recebe: R$ 52,47

### **Vercel:**
- Grátis até 100GB bandwidth
- Serverless functions ilimitadas (plano hobby)

### **Firebase/Supabase:**
- Grátis até limites generosos
- Escala conforme uso

---

## 📞 SUPORTE

**Hotmart:**
- Chat: https://atendimento.hotmart.com
- Email: suporte@hotmart.com

**Vercel:**
- Discord: https://vercel.com/discord
- Docs: https://vercel.com/docs

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [x] Criar conta Hotmart
- [x] Criar produto de assinatura
- [x] Obter link de checkout
- [x] Criar endpoints backend
- [x] Atualizar App.jsx
- [ ] Adicionar variável VITE_HOTMART_CHECKOUT_URL
- [ ] Deploy na Vercel
- [ ] Configurar webhook na Hotmart
- [ ] Testar em sandbox
- [ ] Implementar banco de dados
- [ ] Sistema de autenticação real
- [ ] Testes em produção
- [ ] Go live! 🚀

---

**Próximo arquivo a ler: `FIREBASE-SETUP.md` (quando pronto)**
