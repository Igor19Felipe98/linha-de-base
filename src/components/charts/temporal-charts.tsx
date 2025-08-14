'use client'

import * as React from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts'
import { formatCurrency } from "@/lib"
import { TemporalData, TimeUnit } from "@/lib/services/temporal-analytics"

interface TemporalChartsProps {
  temporalData: any[] // Dados formatados para gráfico
  timeUnit: TimeUnit
}

/**
 * Obtém labels baseado na unidade temporal
 */
function getLabels(timeUnit: TimeUnit) {
  switch (timeUnit) {
    case 'weekly':
      return {
        costLabel: 'Custo Semanal',
        cumulativeLabel: 'Custo Acumulado',
        housesLabel: 'Casas Finalizadas',
        activeLabel: 'Casas Ativas'
      }
    case 'monthly':
      return {
        costLabel: 'Custo Mensal',
        cumulativeLabel: 'Custo Acumulado',
        housesLabel: 'Casas Finalizadas',
        activeLabel: 'Casas Ativas'
      }
    case 'quarterly':
      return {
        costLabel: 'Custo Trimestral',
        cumulativeLabel: 'Custo Acumulado',
        housesLabel: 'Casas Finalizadas',
        activeLabel: 'Casas Ativas'
      }
    case 'yearly':
      return {
        costLabel: 'Custo Anual',
        cumulativeLabel: 'Custo Acumulado',
        housesLabel: 'Casas Finalizadas',
        activeLabel: 'Casas Ativas'
      }
    default:
      return {
        costLabel: 'Custo do Período',
        cumulativeLabel: 'Custo Acumulado',
        housesLabel: 'Casas Finalizadas',
        activeLabel: 'Casas Ativas'
      }
  }
}

/**
 * Gráfico de custo por período (barras)
 */
export function TemporalCostChart({ temporalData, timeUnit }: TemporalChartsProps) {
  const labels = getLabels(timeUnit)

  // Se não há dados, mostrar mensagem
  if (temporalData.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="text-center text-industrial-text-muted">
          <div className="text-lg font-medium mb-2">Nenhum período com custos</div>
          <div className="text-sm">Não há dados de custo para exibir nesta unidade temporal.</div>
        </div>
      </div>
    );
  }

  // Calcular domínio do eixo Y baseado nos dados
  const maxCost = temporalData.length > 0 ? Math.max(...temporalData.map(d => d.periodCost)) : 0;
  const yAxisDomain = maxCost > 0 ? [0, Math.ceil(maxCost * 1.1)] : [0, 100000];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{payload[0]?.payload?.fullName}</p>
          <p className="text-industrial-accent">
            {labels.costLabel}: {payload[0]?.payload?.formattedPeriodCost}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={temporalData} 
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            stroke="#666"
            interval={0}
            angle={temporalData.length > 12 ? -45 : 0}
            textAnchor={temporalData.length > 12 ? "end" : "middle"}
            height={temporalData.length > 12 ? 80 : 60}
          />
          <YAxis 
            domain={yAxisDomain}
            tickFormatter={(value) => formatCurrency(value, true)}
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="periodCost" 
            fill="#2563eb" 
            name={labels.costLabel}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Gráfico combinado temporal (custo + casas + atividade)
 */
export function CombinedTemporalChart({ temporalData, timeUnit }: TemporalChartsProps) {
  const labels = getLabels(timeUnit)

  // Se não há dados, mostrar mensagem
  if (temporalData.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="text-center text-industrial-text-muted">
          <div className="text-lg font-medium mb-2">Nenhum período com atividade</div>
          <div className="text-sm">Não há dados para exibir na visão geral temporal.</div>
        </div>
      </div>
    );
  }

  // Calcular domínios dos eixos Y baseado nos dados
  const maxCost = temporalData.length > 0 ? Math.max(...temporalData.map(d => d.cumulativeCost)) : 0;
  const maxCount = temporalData.length > 0 ? Math.max(
    Math.max(...temporalData.map(d => d.housesCompleted)),
    Math.max(...temporalData.map(d => d.activeDevelopments))
  ) : 0;
  
  const costDomain = maxCost > 0 ? [0, Math.ceil(maxCost * 1.1)] : [0, 100000];
  const countDomain = maxCount > 0 ? [0, Math.ceil(maxCount * 1.1)] : [0, 10];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{data?.fullName}</p>
          <div className="space-y-1 text-sm">
            <p className="text-blue-600">
              {labels.costLabel}: {data?.formattedPeriodCost}
            </p>
            <p className="text-green-600">
              {labels.cumulativeLabel}: {data?.formattedCumulativeCost}
            </p>
            <p className="text-purple-600">
              {labels.housesLabel}: {data?.housesCompleted}
            </p>
            <p className="text-orange-600">
              {labels.activeLabel}: {data?.activeDevelopments}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart 
          data={temporalData} 
          margin={{ top: 20, right: 50, left: 20, bottom: temporalData.length > 12 ? 80 : 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            stroke="#666"
            interval={0}
            angle={temporalData.length > 12 ? -45 : 0}
            textAnchor={temporalData.length > 12 ? "end" : "middle"}
          />
          <YAxis 
            yAxisId="cost"
            orientation="left"
            domain={costDomain}
            tickFormatter={(value) => formatCurrency(value, true)}
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          <YAxis 
            yAxisId="count"
            orientation="right"
            domain={countDomain}
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Área do custo acumulado */}
          <Area
            yAxisId="cost"
            type="monotone"
            dataKey="cumulativeCost"
            fill="#10b981"
            fillOpacity={0.1}
            stroke="#10b981"
            strokeWidth={2}
            name={labels.cumulativeLabel}
          />
          
          {/* Barras do custo por período */}
          <Bar
            yAxisId="cost"
            dataKey="periodCost"
            fill="#2563eb"
            name={labels.costLabel}
            radius={[2, 2, 0, 0]}
            fillOpacity={0.8}
          />
          
          {/* Linha de casas finalizadas */}
          <Line
            yAxisId="count"
            type="monotone"
            dataKey="housesCompleted"
            stroke="#7c3aed"
            strokeWidth={3}
            dot={{ fill: '#7c3aed', strokeWidth: 2, r: 4 }}
            name={labels.housesLabel}
          />
          
          {/* Linha de casas ativas */}
          <Line
            yAxisId="count"
            type="monotone"
            dataKey="activeDevelopments"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
            strokeDasharray="5 5"
            name={labels.activeLabel}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Gráfico de evolução de casas finalizadas
 */
export function HousesProgressChart({ temporalData, timeUnit }: TemporalChartsProps) {
  const labels = getLabels(timeUnit)

  // Se não há dados, mostrar mensagem
  if (temporalData.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="text-center text-industrial-text-muted">
          <div className="text-lg font-medium mb-2">Nenhum progresso registrado</div>
          <div className="text-sm">Não há dados de execução para exibir nesta unidade temporal.</div>
        </div>
      </div>
    );
  }

  // Calcular dados acumulados de casas finalizadas
  const cumulativeData = temporalData.map((item, index) => {
    const cumulativeHouses = temporalData
      .slice(0, index + 1)
      .reduce((sum, period) => sum + period.housesCompleted, 0);
    
    return {
      ...item,
      cumulativeHouses
    };
  });

  // Calcular domínio do eixo Y
  const maxCumulative = cumulativeData.length > 0 ? Math.max(...cumulativeData.map(d => d.cumulativeHouses)) : 0;
  const maxActive = cumulativeData.length > 0 ? Math.max(...cumulativeData.map(d => d.activeDevelopments)) : 0;
  const maxHouses = Math.max(maxCumulative, maxActive);
  const yAxisDomain = maxHouses > 0 ? [0, Math.ceil(maxHouses * 1.1)] : [0, 10];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{data?.fullName}</p>
          <div className="space-y-1 text-sm">
            <p className="text-purple-600">
              {labels.housesLabel}: {data?.housesCompleted}
            </p>
            <p className="text-green-600">
              Total Acumulado: {data?.cumulativeHouses} casas
            </p>
            <p className="text-orange-600">
              {labels.activeLabel}: {data?.activeDevelopments}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart 
          data={cumulativeData} 
          margin={{ top: 20, right: 30, left: 20, bottom: temporalData.length > 12 ? 80 : 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            stroke="#666"
            interval={0}
            angle={temporalData.length > 12 ? -45 : 0}
            textAnchor={temporalData.length > 12 ? "end" : "middle"}
          />
          <YAxis 
            domain={yAxisDomain}
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Área de casas acumuladas */}
          <Area
            type="monotone"
            dataKey="cumulativeHouses"
            fill="#10b981"
            fillOpacity={0.2}
            stroke="#10b981"
            strokeWidth={3}
            name="Casas Acumuladas"
          />
          
          {/* Barras de casas finalizadas no período */}
          <Bar
            dataKey="housesCompleted"
            fill="#7c3aed"
            name={labels.housesLabel}
            radius={[2, 2, 0, 0]}
          />
          
          {/* Linha de casas ativas */}
          <Line
            type="monotone"
            dataKey="activeDevelopments"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
            strokeDasharray="3 3"
            name={labels.activeLabel}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}