'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

export function DebugInfo() {
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkStorage = async () => {
    setLoading(true);
    const supabase = createClient();
    
    const result = {
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configurado' : 'Não configurado',
        hasAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurado' : 'Não configurado'
      },
      localStorage: {
        scenarios: []
      },
      supabase: {
        connected: false,
        user: null,
        scenarios: [],
        error: null
      }
    };

    // Verificar localStorage
    try {
      const localData = localStorage.getItem('calculadora-linha-base-scenarios');
      if (localData) {
        result.localStorage.scenarios = JSON.parse(localData);
      }
    } catch (error) {
      console.error('Erro ao ler localStorage:', error);
    }

    // Verificar Supabase
    try {
      console.log('Testando conexão Supabase...');
      
      // Primeiro teste: verificar se conseguimos conectar
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('User result:', { user, userError });
      
      result.supabase.user = user;
      
      // Teste de conexão básica - verificar se a tabela existe
      console.log('Testando acesso à tabela scenarios...');
      const { data: scenarios, error: scenariosError } = await supabase
        .from('scenarios')
        .select('count', { count: 'exact', head: true });
        
      console.log('Table check result:', { scenarios, scenariosError });
      
      // Se a tabela existe, tentar buscar dados
      if (!scenariosError) {
        console.log('Tabela existe, buscando cenários...');
        const { data: scenariosList, error: listError } = await supabase
          .from('scenarios')
          .select('id, name, created_at')
          .order('created_at', { ascending: false });
          
        console.log('Scenarios list result:', { scenariosList, listError });
        
        if (!listError) {
          result.supabase.scenarios = scenariosList || [];
        } else {
          result.supabase.error = listError.message;
        }
      } else {
        result.supabase.error = scenariosError.message;
      }
      
      if (!scenariosError) {
        result.supabase.connected = true;
      }
      
    } catch (error) {
      console.error('Erro ao conectar Supabase:', error);
      result.supabase.error = error.message;
    }

    setInfo(result);
    setLoading(false);
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>🔍 Debug - Onde estão os cenários?</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={checkStorage} disabled={loading}>
          {loading ? 'Verificando...' : 'Verificar Armazenamento'}
        </Button>

        {info && (
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="font-semibold">🔧 Configuração:</h4>
              <ul className="text-sm">
                <li>Supabase URL: {info.environment.supabaseUrl}</li>
                <li>Chave Anon: {info.environment.hasAnonKey}</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold">💾 LocalStorage:</h4>
              <p className="text-sm">
                {info.localStorage.scenarios.length} cenários encontrados
              </p>
              {info.localStorage.scenarios.length > 0 && (
                <ul className="text-xs text-gray-600">
                  {info.localStorage.scenarios.slice(0, 3).map((s: any) => (
                    <li key={s.id}>• {s.name}</li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h4 className="font-semibold">☁️ Supabase:</h4>
              <p className="text-sm">
                Conectado: {info.supabase.connected ? '✅ Sim' : '❌ Não'}
              </p>
              <p className="text-sm">
                Usuário: {info.supabase.user ? info.supabase.user.email || 'Logado' : 'Não logado'}
              </p>
              <p className="text-sm">
                {info.supabase.scenarios.length} cenários no banco
              </p>
              {info.supabase.error && (
                <p className="text-sm text-red-600">
                  Erro: {info.supabase.error}
                </p>
              )}
              {info.supabase.scenarios.length > 0 && (
                <ul className="text-xs text-gray-600">
                  {info.supabase.scenarios.slice(0, 3).map((s: any) => (
                    <li key={s.id}>• {s.name}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}