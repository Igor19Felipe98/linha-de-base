'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

export function QuickLogin() {
  const [email, setEmail] = useState('11igorfelipe11@gmail.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const supabase = createClient();

  const handleSignUp = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) {
        setMessage(`Erro: ${error.message}`);
      } else if (data.user && !data.user.email_confirmed_at) {
        setMessage('⚠️ Verifique seu email para confirmar a conta. Ou desabilite confirmação no Supabase.');
      } else {
        setMessage('✅ Usuário criado com sucesso! Agora faça login.');
      }
    } catch (error) {
      setMessage(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
    
    setLoading(false);
  };

  const handleSignIn = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      
      if (error) {
        setMessage(`Erro: ${error.message}`);
      } else {
        setMessage('✅ Login realizado com sucesso!');
        // Recarregar a página para atualizar o estado
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      setMessage(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
    
    setLoading(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setMessage(`Erro: ${error.message}`);
      } else {
        setMessage('✅ Logout realizado com sucesso!');
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      setMessage(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
    
    setLoading(false);
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>🔑 Login de Teste</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleSignUp} disabled={loading} variant="outline">
            Criar Conta
          </Button>
          <Button onClick={handleSignIn} disabled={loading}>
            Fazer Login
          </Button>
          <Button onClick={handleSignOut} disabled={loading} variant="destructive">
            Logout
          </Button>
        </div>
        
        {message && (
          <div className={`text-sm p-2 rounded ${
            message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          <p>• Use o email/senha padrão ou altere conforme necessário</p>
          <p>• Primeiro clique em "Criar Conta", depois em "Fazer Login"</p>
        </div>
      </CardContent>
    </Card>
  );
}