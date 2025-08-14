'use client'

import * as React from "react"
import { formatCurrency } from "@/lib"
import { TemporalData, TimeUnit } from "@/lib/services/temporal-analytics"

interface TemporalTableProps {
  temporalData: TemporalData[]
  timeUnit: TimeUnit
}

/**
 * Obtém labels da tabela baseado na unidade temporal
 */
function getTableLabels(timeUnit: TimeUnit) {
  switch (timeUnit) {
    case 'weekly':
      return {
        periodLabel: 'Semana',
        costLabel: 'Custo Semanal',
        housesLabel: 'Casas Finalizadas',
        activeLabel: 'Pico de Casas Ativas'
      }
    case 'monthly':
      return {
        periodLabel: 'Mês',
        costLabel: 'Custo Mensal',
        housesLabel: 'Casas Finalizadas',
        activeLabel: 'Pico de Casas Ativas'
      }
    case 'quarterly':
      return {
        periodLabel: 'Trimestre',
        costLabel: 'Custo Trimestral',
        housesLabel: 'Casas Finalizadas',
        activeLabel: 'Pico de Casas Ativas'
      }
    case 'yearly':
      return {
        periodLabel: 'Ano',
        costLabel: 'Custo Anual',
        housesLabel: 'Casas Finalizadas',
        activeLabel: 'Pico de Casas Ativas'
      }
    default:
      return {
        periodLabel: 'Período',
        costLabel: 'Custo do Período',
        housesLabel: 'Casas Finalizadas',
        activeLabel: 'Pico de Casas Ativas'
      }
  }
}

export function TemporalTable({ temporalData, timeUnit }: TemporalTableProps) {
  const labels = getTableLabels(timeUnit)
  
  // Filtrar períodos que têm atividade (consistente com os gráficos)
  const filteredData = temporalData.filter(period => 
    period.periodCost > 0 || 
    period.housesCompleted > 0 || 
    period.activeDevelopments > 0
  );
  
  // Calcular dados acumulados apenas para períodos com atividade
  const tableData = filteredData.map((item, index) => {
    const cumulativeHouses = filteredData
      .slice(0, index + 1)
      .reduce((sum, period) => sum + period.housesCompleted, 0);
    
    const totalHouses = filteredData.reduce((sum, p) => sum + p.housesCompleted, 0);
    
    return {
      ...item,
      cumulativeHouses,
      progressPercentage: totalHouses > 0 ? 
        Math.round((cumulativeHouses / totalHouses) * 100) : 0
    };
  });

  // Se não há dados, mostrar mensagem
  if (tableData.length === 0) {
    return (
      <div className="w-full p-8 text-center">
        <div className="text-industrial-text-muted">
          <div className="text-lg font-medium mb-2">Nenhum período com atividade</div>
          <div className="text-sm">
            Não há dados para exibir na unidade temporal selecionada.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-industrial-background-secondary">
              <th className="text-left p-3 border border-industrial-text-muted font-medium text-industrial-text-primary">
                {labels.periodLabel}
              </th>
              <th className="text-right p-3 border border-industrial-text-muted font-medium text-industrial-text-primary">
                {labels.costLabel}
              </th>
              <th className="text-right p-3 border border-industrial-text-muted font-medium text-industrial-text-primary">
                Custo Acumulado
              </th>
              <th className="text-right p-3 border border-industrial-text-muted font-medium text-industrial-text-primary">
                {labels.housesLabel}
              </th>
              <th className="text-right p-3 border border-industrial-text-muted font-medium text-industrial-text-primary">
                Total Acumulado
              </th>
              <th className="text-right p-3 border border-industrial-text-muted font-medium text-industrial-text-primary">
                Progresso
              </th>
              <th className="text-right p-3 border border-industrial-text-muted font-medium text-industrial-text-primary">
                {labels.activeLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((period, index) => (
              <tr 
                key={period.periodKey} 
                className={`${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } hover:bg-industrial-background-secondary transition-colors`}
              >
                <td className="p-3 border border-industrial-text-muted">
                  <div>
                    <div className="font-medium text-industrial-text-primary">
                      {period.period}
                    </div>
                    <div className="text-xs text-industrial-text-secondary">
                      {period.fullPeriod}
                    </div>
                  </div>
                </td>
                <td className="p-3 border border-industrial-text-muted text-right">
                  <span className={`font-medium ${
                    period.periodCost > 0 ? 'text-industrial-text-primary' : 'text-industrial-text-muted'
                  }`}>
                    {formatCurrency(period.periodCost)}
                  </span>
                </td>
                <td className="p-3 border border-industrial-text-muted text-right">
                  <span className="font-medium text-green-600">
                    {formatCurrency(period.cumulativeCost)}
                  </span>
                </td>
                <td className="p-3 border border-industrial-text-muted text-right">
                  {period.housesCompleted > 0 ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {period.housesCompleted} casa{period.housesCompleted !== 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="text-industrial-text-muted">—</span>
                  )}
                </td>
                <td className="p-3 border border-industrial-text-muted text-right">
                  <span className="font-medium text-green-700">
                    {period.cumulativeHouses} casa{period.cumulativeHouses !== 1 ? 's' : ''}
                  </span>
                </td>
                <td className="p-3 border border-industrial-text-muted text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.max(period.progressPercentage, 1)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-industrial-text-secondary w-8">
                      {period.progressPercentage}%
                    </span>
                  </div>
                </td>
                <td className="p-3 border border-industrial-text-muted text-right">
                  {period.activeDevelopments > 0 ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {period.activeDevelopments}
                    </span>
                  ) : (
                    <span className="text-industrial-text-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Resumo da tabela */}
      <div className="mt-4 p-4 bg-industrial-background-secondary rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-industrial-text-secondary">Períodos Ativos:</span>
            <div className="font-medium text-industrial-text-primary">
              {filteredData.length}
            </div>
          </div>
          <div>
            <span className="text-industrial-text-secondary">Custo Total:</span>
            <div className="font-medium text-industrial-accent">
              {formatCurrency(filteredData.reduce((sum, p) => sum + p.periodCost, 0))}
            </div>
          </div>
          <div>
            <span className="text-industrial-text-secondary">Casas Finalizadas:</span>
            <div className="font-medium text-green-600">
              {filteredData.reduce((sum, p) => sum + p.housesCompleted, 0)} casas
            </div>
          </div>
          <div>
            <span className="text-industrial-text-secondary">Pico de Atividade:</span>
            <div className="font-medium text-orange-600">
              {filteredData.length > 0 ? Math.max(...filteredData.map(p => p.activeDevelopments)) : 0} casas
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}