# 🔥 GUIA COMPLETO - SETUP FIREBASE + BACKEND

## 📋 ÍNDICE
1. [Criar Projeto Firebase](#1-criar-projeto-firebase)
2. [Configurar Authentication](#2-configurar-authentication)
3. [Configurar Firestore](#3-configurar-firestore)
4. [Obter Credenciais](#4-obter-credenciais)
5. [Configurar no Projeto](#5-configurar-no-projeto)
6. [Testar Integração](#6-testar-integração)

---

## 1️⃣ CRIAR PROJETO FIREBASE

### **Passo 1: Acessar Console Firebase**
1. Acesse: https://console.firebase.google.com
2. Clique em **"Adicionar projeto"** ou **"Add project"**

### **Passo 2: Configurar Projeto**
```
Nome do projeto: receitas-mais-rapidas
(ou o nome que preferir)

✅ Aceitar termos
➡️ Continuar

Google Analytics: ATIVAR (recomendado)
Conta do Analytics: Default Account

➡️ Criar projeto
```

### **Passo 3: Aguardar**
- Aguarde 30-60 segundos
- Projeto será criado automaticamente

---

## 2️⃣ CONFIGURAR AUTHENTICATION

### **Ativar Authentication:**

1. **Menu lateral** → **Build** → **Authentication**
2. Clique em **"Get started"** ou **"Começar"**
3. **Sign-in method** (Métodos de login)

### **Ativar Email/Password:**
```
Email/Password → Habilitar
✅ Email/Password (primeira opção)
❌ Email link (deixar desabilitado)
Salvar
```

### **Ativar Google Sign-In:**
```
Google → Habilitar
Nome público do projeto: Receitas Mais Rápidas
Email de suporte: seu_email@gmail.com
Salvar
```

---

## 3️⃣ CONFIGURAR FIRESTORE

### **Criar Banco de Dados:**

1. **Menu lateral** → **Build** → **Firestore Database**
2. Clique em **"Create database"**

### **Configurações:**
```
Location: 
✅ southamerica-east1 (São Paulo) - RECOMENDADO
(Ou us-central1 se não tiver São Paulo)

Security rules:
✅ Start in production mode
(Vamos configurar regras depois)

Criar
```

### **Aguardar:**
- Provisionamento leva 1-2 minutos
- Banco será criado automaticamente

---

## 4️⃣ OBTER CREDENCIAIS

### **Adicionar Web App:**

1. **Página inicial do projeto** → Ícone **</>** (Web)
2. **Configurar:**
   ```
   App nickname: Receitas Web App
   
   Firebase Hosting: ❌ NÃO marcar
   (Já temos Vercel)
   
   ➡️ Register app
   ```

3. **Copiar Configuração:**
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "receitas-mais-rapidas.firebaseapp.com",
     projectId: "receitas-mais-rapidas",
     storageBucket: "receitas-mais-rapidas.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc..."
   };
   ```

4. **Copie esses valores!** Vamos usar no `.env`

---

## 5️⃣ CONFIGURAR NO PROJETO

### **Passo 1: Instalar Dependências**

```bash
cd receitas-app

npm install firebase
```

### **Passo 2: Criar arquivo `.env`**

Copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

### **Passo 3: Preencher `.env`**

Abra `.env` e cole suas credenciais Firebase:

```env
# Gemini (já tem)
VITE_GEMINI_API_KEY=sua_gemini_key_existente

# Hotmart (já tem)
VITE_HOTMART_CHECKOUT_URL=seu_link_hotmart

# Firebase (NOVO - cole aqui)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=receitas-mais-rapidas.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=receitas-mais-rapidas
VITE_FIREBASE_STORAGE_BUCKET=receitas-mais-rapidas.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc...
```

### **Passo 4: Verificar Estrutura**

Arquivos criados:
```
receitas-app/
├── src/
│   ├── firebase/
│   │   ├── config.js       ✅ (configuração)
│   │   ├── auth.js         ✅ (autenticação)
│   │   ├── profile.js      ✅ (perfil + cálculos)
│   │   └── diary.js        ✅ (diário alimentar)
│   └── App.jsx
├── .env                    ✅ (credenciais)
└── .env.example            ✅ (template)
```

---

## 6️⃣ CONFIGURAR SECURITY RULES

### **Firestore Rules (Segurança):**

1. **Firestore Database** → **Rules** (tab no topo)
2. **Cole estas regras:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      // User can read/write their own document
      allow read, write: if isOwner(userId);
      
      // Diary subcollection
      match /diary/{date} {
        allow read, write: if isOwner(userId);
      }
    }
  }
}
```

3. **Publicar** (Publish)

**O que fazem essas regras:**
- ✅ Usuário só acessa seus próprios dados
- ✅ Precisa estar autenticado
- ✅ Segurança total

---

## 7️⃣ TESTAR INTEGRAÇÃO

### **Teste 1: Verificar Configuração**

Abra DevTools (F12) e execute no console:

```javascript
// Deve aparecer o objeto de config
console.log(import.meta.env.VITE_FIREBASE_PROJECT_ID);
```

### **Teste 2: Registrar Usuário**

No seu app, tente criar conta:
```
Email: teste@teste.com
Senha: teste123
```

**Verificar no Firebase:**
1. Authentication → Users
2. Deve aparecer o usuário criado

### **Teste 3: Firestore**

1. Firestore Database → Data
2. Deve aparecer coleção `users`
3. Deve ter documento do usuário

---

## 8️⃣ PRÓXIMOS PASSOS

### **Agora que Firebase está configurado:**

✅ Backend pronto
✅ Authentication funcionando
✅ Firestore configurado

**Podemos:**
1. Criar telas de Login/Cadastro
2. Criar tela de Perfil
3. Implementar Diário Alimentar
4. Criar Dashboard

---

## 🐛 TROUBLESHOOTING

### **Erro: "Firebase not initialized"**
```bash
# Verificar se instalou Firebase
npm list firebase

# Se não, instalar
npm install firebase
```

### **Erro: "Missing or insufficient permissions"**
- Verificar Security Rules
- Regras devem permitir acesso do usuário autenticado

### **Erro: "Invalid API key"**
- Verificar `.env` está preenchido corretamente
- Reiniciar servidor: `npm run dev`

### **Erro: "Auth domain not authorized"**
- Firebase Console → Authentication → Settings
- Adicionar domínio autorizado: `receitasmaisrapidas.com.br`

---

## 📊 CUSTOS

### **Firebase Spark Plan (GRÁTIS):**
```
Authentication: 
- ✅ Ilimitado usuários grátis

Firestore:
- ✅ 50.000 leituras/dia
- ✅ 20.000 escritas/dia
- ✅ 1 GB armazenamento
- ✅ 10 GB transferência/mês

Suficiente para:
- 1.000-2.000 usuários ativos/mês
```

### **Quando fazer upgrade:**
- >50k leituras/dia
- >20k escritas/dia
- Firestore Blaze: Pay-as-you-go
- Custo estimado: R$ 0,10-0,30 por 1000 operações

---

## ✅ CHECKLIST COMPLETO

- [ ] Criar projeto Firebase
- [ ] Ativar Authentication (Email + Google)
- [ ] Criar Firestore Database
- [ ] Obter credenciais do Web App
- [ ] Instalar `npm install firebase`
- [ ] Criar `.env` com credenciais
- [ ] Configurar Security Rules
- [ ] Testar criação de usuário
- [ ] Verificar dados no Firestore

---

## 🎯 ESTÁ PRONTO!

**Firebase configurado com:**
- ✅ Authentication (Email/Password + Google)
- ✅ Firestore Database
- ✅ Security Rules
- ✅ Estrutura de dados

**Próximo:** Integrar com o frontend! 🚀

---

**Dúvidas? Erros? Me chama! 💪**
