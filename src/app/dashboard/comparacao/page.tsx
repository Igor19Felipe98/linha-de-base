'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout/main-layout';
import { scenariosService } from '@/lib/services/scenarios';
import { SavedScenario } from '@/lib/types';
import { Calendar, BarChart3, AlertTriangle, TrendingUp } from 'lucide-react';
import { MonthlyAnalysisTable } from '@/components/scenarios/MonthlyAnalysisTable';

export default function ComparacaoPage() {
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [selectedScenarios, setSelectedScenarios] = useState<SavedScenario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      const loadedScenarios = await scenariosService.getAllScenarios();
      setScenarios(loadedScenarios);
    } catch (error) {
      console.error('Erro ao carregar cenários:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleScenario = (scenario: SavedScenario) => {
    setSelectedScenarios(prev => {
      const isSelected = prev.find(s => s.id === scenario.id);
      if (isSelected) {
        return prev.filter(s => s.id !== scenario.id);
      } else {
        return [...prev, scenario];
      }
    });
  };

  const getDateRange = () => {
    if (selectedScenarios.length === 0) return null;
    
    const allDates: Date[] = [];
    selectedScenarios.forEach(scenario => {
      if (scenario.calculationResult?.weekDateMappings) {
        scenario.calculationResult.weekDateMappings.forEach(mapping => {
          allDates.push(new Date(mapping.startDate));
          allDates.push(new Date(mapping.endDate));
        });
      }
    });

    if (allDates.length === 0) return null;

    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    return { start: minDate, end: maxDate };
  };

  const getOverlappingPeriods = () => {
    const overlaps: { scenarios: string[], period: { start: Date, end: Date } }[] = [];
    
    for (let i = 0; i < selectedScenarios.length; i++) {
      for (let j = i + 1; j < selectedScenarios.length; j++) {
        const scenario1 = selectedScenarios[i];
        const scenario2 = selectedScenarios[j];
        
        const mappings1 = scenario1.calculationResult?.weekDateMappings || [];
        const mappings2 = scenario2.calculationResult?.weekDateMappings || [];
        
        if (mappings1.length > 0 && mappings2.length > 0) {
          const start1 = new Date(mappings1[0].startDate);
          const end1 = new Date(mappings1[mappings1.length - 1].endDate);
          const start2 = new Date(mappings2[0].startDate);
          const end2 = new Date(mappings2[mappings2.length - 1].endDate);
          
          // Verificar sobreposição dos períodos completos
          if (start1 <= end2 && start2 <= end1) {
            const overlapStart = new Date(Math.max(start1.getTime(), start2.getTime()));
            const overlapEnd = new Date(Math.min(end1.getTime(), end2.getTime()));
            
            overlaps.push({
              scenarios: [scenario1.name, scenario2.name],
              period: { start: overlapStart, end: overlapEnd }
            });
          }
        }
      }
    }
    
    return overlaps;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const dateRange = getDateRange();
  const overlappingPeriods = getOverlappingPeriods();

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Comparação de Cenários</h1>
            <p className="text-gray-600">Compare cronogramas e identifique sobreposições entre diferentes obras</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Seleção de Cenários */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Selecionar Cenários
              </CardTitle>
              <CardDescription>
                Escolha os cenários que deseja comparar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="text-center py-4">Carregando cenários...</div>
              ) : scenarios.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Nenhum cenário salvo encontrado
                </div>
              ) : (
                scenarios.map(scenario => (
                  <div key={scenario.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox 
                      checked={selectedScenarios.some(s => s.id === scenario.id)}
                      onCheckedChange={() => toggleScenario(scenario)}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{scenario.name}</h4>
                      {scenario.description && (
                        <p className="text-sm text-gray-600">{scenario.description}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Salvo em: {new Date(scenario.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Badge variant={scenario.storageLocation === 'supabase' ? 'default' : 'secondary'}>
                      {scenario.storageLocation === 'supabase' ? 'Nuvem' : 'Local'}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Análise de Sobreposições */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Análise de Sobreposições
              </CardTitle>
              <CardDescription>
                Períodos onde as obras se cruzam
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedScenarios.length < 2 ? (
                <div className="text-center py-8 text-gray-500">
                  Selecione pelo menos 2 cenários para ver as sobreposições
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Período Total */}
                  {dateRange && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-medium text-blue-900">Período Total do Projeto</h4>
                      <p className="text-blue-700">
                        De {formatDate(dateRange.start)} até {formatDate(dateRange.end)}
                      </p>
                      <p className="text-sm text-blue-600">
                        Duração: {Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))} dias
                      </p>
                    </div>
                  )}

                  {/* Sobreposições */}
                  <div>
                    <h4 className="font-medium mb-2">Sobreposições Identificadas</h4>
                    {overlappingPeriods.length === 0 ? (
                      <div className="text-green-600 bg-green-50 p-3 rounded-lg">
                        ✅ Nenhuma sobreposição encontrada entre os cenários selecionados
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {overlappingPeriods.slice(0, 5).map((overlap, index) => (
                          <div key={index} className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                            <div className="font-medium text-yellow-800">
                              {overlap.scenarios.join(' × ')}
                            </div>
                            <div className="text-sm text-yellow-700">
                              {formatDate(overlap.period.start)} - {formatDate(overlap.period.end)}
                            </div>
                          </div>
                        ))}
                        {overlappingPeriods.length > 5 && (
                          <div className="text-sm text-gray-500 text-center">
                            +{overlappingPeriods.length - 5} sobreposições adicionais
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas Resumidas */}
        {selectedScenarios.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Estatísticas dos Cenários Selecionados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedScenarios.length}</div>
                  <div className="text-sm text-blue-700">Cenários</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedScenarios.reduce((sum, s) => 
                      sum + (s.calculationResult?.houses?.length || 0), 0
                    )}
                  </div>
                  <div className="text-sm text-green-700">Casas Total</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{overlappingPeriods.length}</div>
                  <div className="text-sm text-yellow-700">Sobreposições</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {dateRange ? Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)) : 0}
                  </div>
                  <div className="text-sm text-purple-700">Dias Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Análise Mensal Detalhada */}
        {selectedScenarios.length > 0 && (
          <MonthlyAnalysisTable scenarios={selectedScenarios} />
        )}
      </div>
    </MainLayout>
  );
}