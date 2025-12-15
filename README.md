# 🍳 Receitas Mais Rápidas

Aplicativo de receitas com IA integrada usando Gemini API.

## 🚀 Como Fazer Deploy na Vercel

### Passo 1: Preparar o Projeto

1. **Crie uma conta no GitHub** (se ainda não tiver): https://github.com
2. **Crie um novo repositório**:
   - Clique em "New repository"
   - Nome: `receitas-mais-rapidas`
   - Deixe público ou privado
   - Clique em "Create repository"

### Passo 2: Subir o Código para o GitHub

Abra o terminal na pasta do projeto e execute:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/receitas-mais-rapidas.git
git push -u origin main
```

### Passo 3: Deploy na Vercel

1. **Acesse**: https://vercel.com
2. **Faça login** com sua conta GitHub
3. **Clique em "Add New Project"**
4. **Importe** seu repositório `receitas-mais-rapidas`
5. **Configure as variáveis de ambiente**:
   - Clique em "Environment Variables"
   - Adicione: `VITE_GEMINI_API_KEY` = `SUA_API_KEY_AQUI`
6. **Clique em "Deploy"**

✅ Pronto! Seu app estará online em: `https://receitas-mais-rapidas.vercel.app`

---

## 🔑 Obter Gemini API Key

1. Acesse: https://aistudio.google.com/app/apikey
2. Clique em "Create API Key"
3. Copie a chave gerada (começa com `AIza...`)

---

## 💻 Rodar Localmente

```bash
# Instalar dependências
npm install

# Criar arquivo .env
cp .env.example .env

# Editar .env e colar sua API key
VITE_GEMINI_API_KEY=sua_key_aqui

# Rodar em desenvolvimento
npm run dev

# Acessar em: http://localhost:5173
```

---

## 📱 Funcionalidades

✅ Sistema de login/cadastro
✅ Trial de 3 dias grátis
✅ Criar receitas com IA por:
  - Nome do prato
  - Ingredientes disponíveis
  - Foto dos ingredientes (em breve)
✅ Informações nutricionais completas
✅ Favoritos
✅ Busca e filtros
✅ Design mobile-first
✅ PWA (funciona como app)

---

## 🎨 Paleta de Cores

- Primária: `#8B4513` (Marrom)
- Secundária: `#DAA520` (Amarelo Mostarda)
- Fundo: `#FFF8F0` (Creme)

---

## 📦 Tecnologias

- React 18
- Vite
- Lucide Icons
- Gemini API
- CSS-in-JS

---

## 💰 Monetização

- Trial: 3 dias grátis
- Assinatura: R$ 59,90/ano
- Sistema de bloqueio automático após trial
- Integração com gateway de pagamento (Hotmart/Stripe)

---

## 🤝 Suporte

Para dúvidas, entre em contato via Instagram: [@receitasmaisrapidas](https://instagram.com/receitasmaisrapidas)

---

**Desenvolvido com ❤️ e IA**
