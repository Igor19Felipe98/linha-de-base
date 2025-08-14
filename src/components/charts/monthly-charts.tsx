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
import { MonthlyData } from "@/lib/services/monthly-analytics"

interface MonthlyChartsProps {
  monthlyData: any[] // Dados formatados para gráfico
}

/**
 * Gráfico de valores mensais (barras)
 */
export function MonthlyCostChart({ monthlyData }: MonthlyChartsProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{payload[0]?.payload?.fullName}</p>
          <p className="text-industrial-accent">
            Custo Mensal: {payload[0]?.payload?.formattedMonthlyCost}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="monthlyCost" 
            fill="#dc2626" 
            radius={[4, 4, 0, 0]}
            name="Custo Mensal"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Gráfico de valores acumulados (linha)
 */
export function CumulativeCostChart({ monthlyData }: MonthlyChartsProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{payload[0]?.payload?.fullName}</p>
          <p className="text-blue-600">
            Custo Acumulado: {payload[0]?.payload?.formattedCumulativeCost}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="cumulativeCost"
            stroke="#2563eb"
            fill="#2563eb"
            fillOpacity={0.3}
            strokeWidth={2}
            name="Custo Acumulado"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Gráfico de casas finalizadas por mês (barras)
 */
export function HousesCompletedChart({ monthlyData }: MonthlyChartsProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{payload[0]?.payload?.fullName}</p>
          <p className="text-green-600">
            Casas Finalizadas: {payload[0]?.value} casas
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="housesCompleted" 
            fill="#16a34a" 
            radius={[4, 4, 0, 0]}
            name="Casas Finalizadas"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Gráfico combinado com múltiplas métricas
 */
export function CombinedMonthlyChart({ monthlyData }: MonthlyChartsProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{data?.fullName}</p>
          <div className="space-y-1">
            <p className="text-red-600">
              Custo Mensal: {data?.formattedMonthlyCost}
            </p>
            <p className="text-blue-600">
              Custo Acumulado: {data?.formattedCumulativeCost}
            </p>
            <p className="text-green-600">
              Casas Finalizadas: {data?.housesCompleted} casas
            </p>
            <p className="text-purple-600">
              Casas em Andamento: {data?.activeDevelopments} casas
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
        <ComposedChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            yAxisId="cost"
            orientation="left"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
          />
          <YAxis 
            yAxisId="houses"
            orientation="right"
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          <Bar 
            yAxisId="cost"
            dataKey="monthlyCost" 
            fill="#dc2626" 
            radius={[2, 2, 0, 0]}
            name="Custo Mensal (R$)"
            opacity={0.8}
          />
          
          <Line
            yAxisId="cost"
            type="monotone"
            dataKey="cumulativeCost"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 4 }}
            name="Custo Acumulado (R$)"
          />
          
          <Line
            yAxisId="houses"
            type="monotone"
            dataKey="housesCompleted"
            stroke="#16a34a"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3 }}
            name="Casas Finalizadas"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}