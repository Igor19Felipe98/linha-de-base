'use client'

import * as React from "react"
import { 
  useCalculationStatus, 
  calculateTemporalAnalytics, 
  formatTemporalDataForChart, 
  formatCurrency,
  TimeUnit
} from "@/lib"
import { 
  TemporalCostChart,
  CombinedTemporalChart,
  HousesProgressChart,
  TemporalTable
} from "@/components/charts"
import { RequiresCalculation } from "@/components"
import { IndustrialCard, TimeUnitSelector } from "@/components/ui"

export default function DashboardPage() {
  const { calculationResult } = useCalculationStatus()
  const [timeUnit, setTimeUnit] = React.useState<TimeUnit>('monthly')
  
  // Calcular dados temporais
  const temporalAnalytics = React.useMemo(() => {
    if (!calculationResult) return null;
    return calculateTemporalAnalytics(calculationResult, timeUnit);
  }, [calculationResult, timeUnit]);
  
  const chartData = React.useMemo(() => {
    if (!temporalAnalytics) return [];
    return formatTemporalDataForChart(temporalAnalytics.temporalData);
  }, [temporalAnalytics]);
  
  const metrics = temporalAnalytics?.temporalMetrics;

  return (
    <RequiresCalculation
      fallbackTitle="Dashboard indisponível"
      fallbackMessage="Execute o cálculo da linha de base para visualizar o dashboard executivo."
    >
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-industrial-text-primary">
              Dashboard Executivo
            </h1>
            <p className="text-industrial-text-secondary mt-1">
              Visão executiva do projeto com métricas e gráficos temporais
            </p>
          </div>
          
          {/* Seletor de Unidade Temporal */}
          <div className="lg:w-auto">
            <TimeUnitSelector 
              value={timeUnit} 
              onChange={setTimeUnit}
              className="lg:items-end"
            />
          </div>
        </div>

        {/* Métricas Principais */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <IndustrialCard>
              <div className="text-center">
                <p className="text-sm text-industrial-text-secondary">Valor Total</p>
                <p className="text-2xl font-bold text-industrial-text-primary">
                  {formatCurrency(metrics.totalProjectCost)}
                </p>
              </div>
            </IndustrialCard>
            
            <IndustrialCard>
              <div className="text-center">
                <p className="text-sm text-industrial-text-secondary">Duração</p>
                <p className="text-2xl font-bold text-industrial-text-primary">
                  {metrics.projectDurationPeriods}
                </p>
                <p className="text-xs text-industrial-text-muted">{metrics.projectDurationLabel}</p>
              </div>
            </IndustrialCard>
            
            <IndustrialCard>
              <div className="text-center">
                <p className="text-sm text-industrial-text-secondary">Lead Time Mínimo</p>
                <p className="text-2xl font-bold text-green-600">
                  {metrics.leadTimeMin}
                </p>
                <p className="text-xs text-industrial-text-muted">semanas</p>
              </div>
            </IndustrialCard>
            
            <IndustrialCard>
              <div className="text-center">
                <p className="text-sm text-industrial-text-secondary">Lead Time Máximo</p>
                <p className="text-2xl font-bold text-red-600">
                  {metrics.leadTimeMax}
                </p>
                <p className="text-xs text-industrial-text-muted">semanas</p>
              </div>
            </IndustrialCard>
          </div>
        )}
        
        {/* Gráfico de Custo por Período */}
        <IndustrialCard title={`Custo por ${
          timeUnit === 'weekly' ? 'Semana' : 
          timeUnit === 'monthly' ? 'Mês' : 
          timeUnit === 'quarterly' ? 'Trimestre' : 'Ano'
        }`}>
          <TemporalCostChart temporalData={chartData} timeUnit={timeUnit} />
        </IndustrialCard>
        
        {/* Gráfico de Visão Geral Temporal */}
        <IndustrialCard title="Visão Geral Temporal">
          <CombinedTemporalChart temporalData={chartData} timeUnit={timeUnit} />
        </IndustrialCard>
        
        {/* Gráfico de Progresso de Casas */}
        <IndustrialCard title="Progresso de Execução">
          <HousesProgressChart temporalData={chartData} timeUnit={timeUnit} />
        </IndustrialCard>
        
        {/* Tabela Temporal Detalhada */}
        <IndustrialCard title={`Detalhamento ${
          timeUnit === 'weekly' ? 'Semanal' : 
          timeUnit === 'monthly' ? 'Mensal' : 
          timeUnit === 'quarterly' ? 'Trimestral' : 'Anual'
        }`}>
          <TemporalTable temporalData={temporalAnalytics?.temporalData || []} timeUnit={timeUnit} />
        </IndustrialCard>
      </div>
    </RequiresCalculation>
  )
}