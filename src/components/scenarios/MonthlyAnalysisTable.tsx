'use client';

import { SavedScenario } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, Home, DollarSign, Package } from 'lucide-react';

interface MonthlyAnalysisTableProps {
  scenarios: SavedScenario[];
}

interface MonthlyData {
  month: string;
  year: number;
  housesDelivered: number;
  monthlyCost: number;
  cumulativeCost: number;
  housesInExecution: number;
  packageBreakdown: Record<string, number>;
  scenarioBreakdown: Record<string, {
    housesDelivered: number;
    cost: number;
    housesInExecution: number;
  }>;
}

export function MonthlyAnalysisTable({ scenarios }: MonthlyAnalysisTableProps) {
  // Processar dados mensais de todos os cenários
  const getMonthlyData = (): MonthlyData[] => {
    const monthlyMap = new Map<string, MonthlyData>();
    
    scenarios.forEach(scenario => {
      if (!scenario.calculationResult?.weekDateMappings) return;
      
      const { weekDateMappings, financialData, matrix } = scenario.calculationResult;
      
      // Agrupar semanas por mês
      const monthlyGroups = new Map<string, {
        weeks: number[];
        year: number;
        month: string;
      }>();
      
      weekDateMappings.forEach((mapping, weekIndex) => {
        const monthKey = `${mapping.year}-${mapping.month}`;
        if (!monthlyGroups.has(monthKey)) {
          monthlyGroups.set(monthKey, {
            weeks: [],
            year: mapping.year,
            month: mapping.month
          });
        }
        monthlyGroups.get(monthKey)!.weeks.push(weekIndex);
      });
      
      // Processar cada mês
      monthlyGroups.forEach((group, monthKey) => {
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, {
            month: group.month,
            year: group.year,
            housesDelivered: 0,
            monthlyCost: 0,
            cumulativeCost: 0,
            housesInExecution: 0,
            packageBreakdown: {},
            scenarioBreakdown: {}
          });
        }
        
        const monthData = monthlyMap.get(monthKey)!;
        
        // Calcular casas entregues no mês
        let housesDeliveredInMonth = 0;
        let housesInExecutionInMonth = new Set<number>();
        let monthCost = 0;
        
        group.weeks.forEach(weekIndex => {
          // Contar casas em execução
          matrix.forEach((row, houseIndex) => {
            if (row[weekIndex] && row[weekIndex].packageName) {
              housesInExecutionInMonth.add(houseIndex);
              
              // Verificar se é última semana do pacote para esta casa
              const isLastWeek = !row[weekIndex + 1] || 
                                row[weekIndex + 1].packageName !== row[weekIndex].packageName;
              
              if (isLastWeek && weekIndex === group.weeks[group.weeks.length - 1]) {
                // Casa concluída no último mês
                const allPackagesComplete = row.every((cell, idx) => 
                  idx > weekIndex || (cell && cell.packageName)
                );
                if (allPackagesComplete) {
                  housesDeliveredInMonth++;
                }
              }
              
              // Contabilizar pacotes em execução
              const pkgName = row[weekIndex].packageName;
              if (pkgName) {
                monthData.packageBreakdown[pkgName] = 
                  (monthData.packageBreakdown[pkgName] || 0) + 1;
              }
            }
          });
          
          // Somar custos da semana
          if (financialData[weekIndex]) {
            monthCost += financialData[weekIndex].weeklyCost;
          }
        });
        
        // Atualizar dados do mês
        monthData.housesDelivered += housesDeliveredInMonth;
        monthData.monthlyCost += monthCost;
        monthData.housesInExecution += housesInExecutionInMonth.size;
        
        // Breakdown por cenário
        if (!monthData.scenarioBreakdown[scenario.name]) {
          monthData.scenarioBreakdown[scenario.name] = {
            housesDelivered: 0,
            cost: 0,
            housesInExecution: 0
          };
        }
        
        monthData.scenarioBreakdown[scenario.name].housesDelivered = housesDeliveredInMonth;
        monthData.scenarioBreakdown[scenario.name].cost = monthCost;
        monthData.scenarioBreakdown[scenario.name].housesInExecution = housesInExecutionInMonth.size;
      });
    });
    
    // Converter map para array e ordenar por data
    const monthlyArray = Array.from(monthlyMap.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      const monthOrder = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                         'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    });
    
    // Calcular custos acumulados
    let cumulativeCost = 0;
    monthlyArray.forEach(month => {
      cumulativeCost += month.monthlyCost;
      month.cumulativeCost = cumulativeCost;
    });
    
    return monthlyArray;
  };

  const monthlyData = getMonthlyData();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (scenarios.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise Mensal Consolidada</CardTitle>
          <CardDescription>
            Selecione cenários para ver a análise mensal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Nenhum cenário selecionado
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabela Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Análise Mensal Consolidada
          </CardTitle>
          <CardDescription>
            Resumo mensal de {scenarios.length} cenário(s) selecionado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead className="text-right">Casas Entregues</TableHead>
                  <TableHead className="text-right">Custo Mensal</TableHead>
                  <TableHead className="text-right">Custo Acumulado</TableHead>
                  <TableHead className="text-right">Casas em Execução</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyData.map((month, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {month.month}/{month.year}
                    </TableCell>
                    <TableCell className="text-right">
                      {month.housesDelivered > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Home className="h-4 w-4 text-green-600" />
                          {month.housesDelivered}
                        </span>
                      )}
                      {month.housesDelivered === 0 && '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(month.monthlyCost)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(month.cumulativeCost)}
                    </TableCell>
                    <TableCell className="text-right">
                      {month.housesInExecution}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold bg-gray-50">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-1">
                      <Home className="h-4 w-4 text-green-600" />
                      {monthlyData.reduce((sum, m) => sum + m.housesDelivered, 0)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(monthlyData.reduce((sum, m) => sum + m.monthlyCost, 0))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(monthlyData[monthlyData.length - 1]?.cumulativeCost || 0)}
                  </TableCell>
                  <TableCell className="text-right">-</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detalhamento por Pacotes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Casas em Execução por Pacote
          </CardTitle>
          <CardDescription>
            Quantidade de casas executando cada pacote simultaneamente por mês
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  {Array.from(new Set(
                    monthlyData.flatMap(m => Object.keys(m.packageBreakdown))
                  )).sort().map(pkg => (
                    <TableHead key={pkg} className="text-right">{pkg}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyData.map((month, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {month.month}/{month.year}
                    </TableCell>
                    {Array.from(new Set(
                      monthlyData.flatMap(m => Object.keys(m.packageBreakdown))
                    )).sort().map(pkg => (
                      <TableCell key={pkg} className="text-right">
                        {month.packageBreakdown[pkg] || '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Resumo por Cenário */}
      {scenarios.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Contribuição por Cenário
            </CardTitle>
            <CardDescription>
              Breakdown de custos e entregas por cenário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    {scenarios.map(scenario => (
                      <TableHead key={scenario.id} className="text-right">
                        {scenario.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyData.map((month, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {month.month}/{month.year}
                      </TableCell>
                      {scenarios.map(scenario => (
                        <TableCell key={scenario.id} className="text-right text-sm">
                          {month.scenarioBreakdown[scenario.name] ? (
                            <div className="space-y-1">
                              <div>
                                {month.scenarioBreakdown[scenario.name].housesDelivered > 0 && 
                                  `${month.scenarioBreakdown[scenario.name].housesDelivered} casas`
                                }
                              </div>
                              <div className="text-gray-600">
                                {formatCurrency(month.scenarioBreakdown[scenario.name].cost)}
                              </div>
                            </div>
                          ) : '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}