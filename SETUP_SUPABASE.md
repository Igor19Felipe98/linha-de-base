# 🚀 Setup Supabase - Sistema de Cenários Multiusuário

## 1. Criar Conta no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Crie uma conta gratuita
4. Crie um novo projeto

## 2. Configurar Banco de Dados

Execute os seguintes SQLs no Supabase SQL Editor:

### Criar tabela de perfis
```sql
-- Criar tabela de perfis
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### Criar tabela de cenários
```sql
-- Criar tabela de cenários
CREATE TABLE scenarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  project_data JSONB NOT NULL,
  calculation_result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_scenarios_updated_at
  BEFORE UPDATE ON scenarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX scenarios_user_id_idx ON scenarios(user_id);
CREATE INDEX scenarios_created_at_idx ON scenarios(created_at);

-- RLS (Row Level Security)
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scenarios" ON scenarios
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scenarios" ON scenarios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scenarios" ON scenarios
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scenarios" ON scenarios
  FOR DELETE USING (auth.uid() = user_id);
```

### Função para criar perfil automaticamente
```sql
-- Função para criar perfil quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 3. Configurar Variáveis de Ambiente

1. No painel do Supabase, vá em Settings > API
2. Copie a URL e as chaves
3. Crie o arquivo `.env.local`:

```bash
# Copie do .env.local.example e preencha com seus dados do Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
NEXTAUTH_SECRET=sua_chave_secreta_aqui
NEXTAUTH_URL=http://localhost:3000
```

## 4. Configurar Autenticação

No painel do Supabase:
1. Vá em Authentication > Settings
2. Configure os providers desejados (Email, Google, etc.)
3. Configure a URL de redirect: `http://localhost:3000/auth/callback`

## 5. Finalizar Implementação

### Ainda falta implementar:

1. **Páginas de autenticação** (`/login`, `/signup`)
2. **Atualizar componentes** para usar as novas funções async
3. **Middleware de autenticação** para proteger rotas
4. **Context de usuário** para gerenciar estado global

### Comandos úteis:

```bash
# Instalar dependências finais
npm install

# Executar em modo desenvolvimento
npm run dev

# Verificar se banco está conectado
# (teste fazendo login/registro)
```

## 6. Benefícios da Nova Arquitetura

✅ **Múltiplos usuários** - Cada um com seus cenários  
✅ **Banco PostgreSQL** - Escalável e confiável  
✅ **Autenticação completa** - Login, registro, reset de senha  
✅ **Sem limite de armazenamento** - Acabou o problema do localStorage  
✅ **Sync em tempo real** - Atualizações automáticas  
✅ **Backup automático** - Dados seguros na nuvem  

## 7. Próximos Passos

1. Configure o Supabase seguindo as instruções acima
2. Teste a criação de usuário e login
3. Implemente as páginas de autenticação restantes
4. Deploy em produção (Vercel + Supabase)

## 8. Suporte

- [Documentação Supabase](https://supabase.com/docs)
- [Exemplos Next.js + Supabase](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs)

---

**Observação**: O localStorage foi mantido como fallback para usuários não logados, mas recomenda-se migrar completamente para o Supabase.