# 🚀 Guia de Deploy no Vercel

## 📋 Passos para Deploy

### 1. Login no Vercel
```bash
npx vercel login
```
- Escolha **GitHub** ou **Google** para login
- Siga o processo de autenticação no navegador

### 2. Fazer Deploy
```bash
npx vercel --prod
```

### 3. Configurar Variáveis de Ambiente
No painel do Vercel (https://vercel.com), vá em:
- **Project Settings** → **Environment Variables**

Adicione estas variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=https://rhrvvpmwlnwtmhvdupdw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocnZ2cG13bG53dG1odmR1cGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMzIwNjcsImV4cCI6MjA3MDcwODA2N30.uOqkMw3eLT5u2twT7v0UfRmuh3PFz50AiuOwwtc405A
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocnZ2cG13bG53dG1odmR1cGR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTEzMjA2NywiZXhwIjoyMDcwNzA4MDY3fQ.QbU286RbwXlkd1xv7NEh_3RiO4ulp2IB_wnq7rPDPLU
NEXTAUTH_SECRET=LhUIg3WeN+uVVV4VwGHJs9NNtfoQ8Nq/YIfN2th1IFs=
NEXTAUTH_URL=https://SEU-DOMINIO-VERCEL.vercel.app
```

⚠️ **IMPORTANTE**: Substitua `SEU-DOMINIO-VERCEL` pelo domínio real que o Vercel criar.

### 4. Atualizar Google OAuth
Depois do deploy, adicione seu novo domínio no Google Console:

**Authorized JavaScript origins:**
```
https://SEU-DOMINIO-VERCEL.vercel.app
```

**Authorized redirect URIs:**
```
https://rhrvvpmwlnwtmhvdupdw.supabase.co/auth/v1/callback
```

### 5. Redeploy
Após configurar as variáveis:
```bash
npx vercel --prod
```

## ✅ Resultado Final

Seu projeto estará disponível 24/7 em:
- **URL Vercel**: https://SEU-DOMINIO-VERCEL.vercel.app
- **Custom Domain** (opcional): Pode adicionar seu próprio domínio

## 🔄 Atualizações Futuras

Para updates:
```bash
git add .
git commit -m "Nova funcionalidade"
npx vercel --prod
```

## 💡 Dicas

- **Grátis**: Vercel é gratuito para projetos pessoais
- **Automático**: Pode conectar com GitHub para deploy automático
- **Domínio**: .vercel.app é gratuito, domínio customizado é pago
- **Analytics**: Vercel oferece analytics gratuitos

---

🎉 **Parabéns!** Seu projeto estará online e acessível globalmente!