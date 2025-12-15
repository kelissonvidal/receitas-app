# 🚀 COMEÇAR AQUI - GUIA RÁPIDO

## ⚡ 3 MINUTOS PARA O AR!

### 1️⃣ CONFIGURAR API KEY (30 segundos)

1. Abra a pasta `receitas-app`
2. Copie o arquivo `.env.example` e renomeie para `.env`
3. Abra `.env` e cole sua Gemini API Key:

```
VITE_GEMINI_API_KEY=AIzaSy... (sua key aqui)
```

---

### 2️⃣ TESTAR LOCALMENTE (1 minuto)

Abra o terminal na pasta do projeto e execute:

```bash
npm install
npm run dev
```

Abra: `http://localhost:5173`

✅ Se funcionar → próximo passo!

---

### 3️⃣ COLOCAR NO AR (2 minutos)

**Opção A - Jeito Fácil (Vercel):**

1. Acesse https://vercel.com
2. Login com GitHub
3. Arraste a pasta `receitas-app` para importar
4. Adicione a variável de ambiente:
   - `VITE_GEMINI_API_KEY` = sua key
5. Clique em Deploy
6. ✅ **PRONTO!** Seu app está online!

**Opção B - Com Git (Profissional):**

Siga o arquivo `DEPLOY.md` com todos os detalhes.

---

## 📁 ESTRUTURA DOS ARQUIVOS

```
receitas-app/
├── src/
│   ├── App.jsx          ← Código principal do app
│   └── main.jsx         ← Entry point
├── index.html           ← HTML base
├── package.json         ← Dependências
├── vite.config.js       ← Config do Vite
├── .env.example         ← Exemplo de variáveis
├── README.md            ← Documentação completa
└── DEPLOY.md            ← Guia de deploy detalhado
```

---

## ✨ O QUE SEU APP FAZ

✅ Login/Cadastro
✅ 3 dias de trial grátis
✅ Criar receitas com IA:
   - Por nome do prato
   - Por ingredientes disponíveis
✅ Informações nutricionais
✅ Favoritar receitas
✅ Busca e filtros
✅ Design mobile-first
✅ Sistema de bloqueio após trial

---

## 🎯 CHECKLIST ANTES DE LANÇAR

- [ ] Testei localmente e funciona
- [ ] API Key configurada corretamente
- [ ] Deploy na Vercel feito com sucesso
- [ ] Testei no celular (responsivo)
- [ ] Perfil Instagram criado (@receitasmaisrapidas)
- [ ] Sistema de pagamento integrado (Hotmart/Stripe)

---

## 💡 DICAS IMPORTANTES

### Custos Estimados:
- **Gemini API**: ~R$ 1,50 por usuário/ano
- **Vercel Hosting**: GRÁTIS
- **Domínio (opcional)**: ~R$ 40/ano

### Preço Sugerido:
- R$ 59,90/ano (margem de 75-80% de lucro)
- Break-even: ~200-300 usuários

### Marketing:
1. Crie posts no Instagram mostrando o app
2. Faça vídeos curtos (Reels) com receitas
3. Use hashtags: #receitas #cozinha #ia
4. Ofereça trial de 3 dias grátis
5. Testemunhos de usuários

---

## ❓ PRECISA DE AJUDA?

### Erros Comuns:

**"API Key inválida"**
→ Verifique se copiou a key completa
→ Gere uma nova em: https://aistudio.google.com/app/apikey

**"npm not found"**
→ Instale Node.js: https://nodejs.org

**"Build failed na Vercel"**
→ Verifique se adicionou a variável de ambiente VITE_GEMINI_API_KEY

### Leia os Outros Arquivos:
- `README.md` → Documentação completa
- `DEPLOY.md` → Guia passo a passo detalhado

---

## 🎉 PRÓXIMOS PASSOS

Depois que seu app estiver no ar:

1. **Testar Tudo**: Crie conta, teste IA, veja se trial funciona
2. **Adicionar Mais Receitas**: Edite `src/App.jsx` linha ~33
3. **Integrar Pagamento**: Hotmart, Stripe ou Mercado Pago
4. **Marketing**: Instagram, TikTok, Facebook
5. **Iterar**: Ouça feedback dos usuários e melhore

---

## 💰 MONETIZAÇÃO

### Como Configurar Pagamento:

**Hotmart (Recomendado para Brasil):**
1. Crie conta em: https://hotmart.com/pt-br/create-account
2. Crie produto → Assinatura → R$ 59,90/ano
3. Configure webhook para liberar acesso
4. Integre no código (webhook URL)

**Stripe (Internacional):**
1. Crie conta em: https://stripe.com
2. Configure Subscription → $12/ano
3. Use Stripe Checkout
4. Webhook para ativar conta

---

## 🚀 ESTÁ PRONTO PARA LANÇAR?

### Mini Checklist Final:
1. ✅ App funcionando localmente
2. ✅ Deploy na Vercel OK
3. ✅ Testei criar receita com IA
4. ✅ Trial de 3 dias funcionando
5. ✅ Visual bonito no celular

### Lance! 🎊

Compartilhe o link, peça feedback, ajuste conforme necessário.

**Sucesso com seu aplicativo! 💪**

---

*Desenvolvido com Claude AI*
