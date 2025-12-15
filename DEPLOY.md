# 🚀 DEPLOY - RECEITAS MAIS RÁPIDAS

## ✅ PRÉ-REQUISITOS

- Conta na Vercel (vercel.com)
- Domínio: receitasmaisrapidas.com.br (já configurado no HostGator)
- Firebase já configurado

---

## 📦 PASSO 1: PREPARAR CÓDIGO

### 1.1 Instalar Dependências
```bash
npm install
```

### 1.2 Testar Build Local
```bash
npm run build
npm run preview
```

---

## 🚀 PASSO 2: DEPLOY NA VERCEL

### 2.1 Via CLI (Recomendado)

#### Instalar Vercel CLI:
```bash
npm install -g vercel
```

#### Login:
```bash
vercel login
```

#### Deploy:
```bash
vercel
```

Siga as instruções:
- Set up and deploy? **Y**
- Which scope? (sua conta)
- Link to existing project? **N**
- Project name? **receitas-mais-rapidas**
- In which directory is your code? **./** (deixe em branco)
- Want to override settings? **N**

#### Deploy Production:
```bash
vercel --prod
```

---

### 2.2 Via Dashboard (Alternativa)

1. Acesse: https://vercel.com/new
2. Clique em "Import Git Repository" ou faça upload manualmente
3. Configure:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Adicione variáveis de ambiente (ver Passo 3)
5. Clique em "Deploy"

---

## 🔐 PASSO 3: CONFIGURAR VARIÁVEIS DE AMBIENTE

Na Vercel Dashboard → Settings → Environment Variables:

```
VITE_GEMINI_API_KEY=AIzaSyCbUP3FrOZpLtnfnR4x5bHhVGtnTx-putE
VITE_HOTMART_CHECKOUT_URL=https://pay.hotmart.com/XXXXXXXXXXXXX
VITE_FIREBASE_API_KEY=AIzaSyDplX--r70l3Go20NwBDC2R8KcQCphbH6o
VITE_FIREBASE_AUTH_DOMAIN=receitas-mais-rapidas.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=receitas-mais-rapidas
VITE_FIREBASE_STORAGE_BUCKET=receitas-mais-rapidas.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=729283598690
VITE_FIREBASE_APP_ID=1:729283598690:web:caa30ecbeb7772ff0a743b
```

**IMPORTANTE:** Adicione para Production, Preview e Development!

---

## 🌐 PASSO 4: CONECTAR DOMÍNIO

### 4.1 Na Vercel:
1. Vá em: Settings → Domains
2. Adicione: `receitasmaisrapidas.com.br`
3. Adicione: `www.receitasmaisrapidas.com.br`

### 4.2 No HostGator:
DNS já está configurado! ✅

---

## 🔥 PASSO 5: ATUALIZAR FIREBASE

Firebase Console → Authentication → Settings → Authorized Domains:

Adicione:
- `receitasmaisrapidas.com.br`
- `www.receitasmaisrapidas.com.br`
- Domínio da Vercel (ex: `receitas-mais-rapidas.vercel.app`)

---

## ✅ PASSO 6: TESTAR

Acesse: https://receitasmaisrapidas.com.br

---

## 🎉 PRONTO!

Seu app está no ar! 🚀
