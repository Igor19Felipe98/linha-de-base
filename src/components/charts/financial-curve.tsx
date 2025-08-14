'use client'

import * as React from "react"
import { 
  ComposedChart, 
  Area, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import { cn, FinancialWeekData, formatCurrency, TooltipProps } from "@/lib"
import { IndustrialCard } from "@/components/ui/industrial-card"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Home,
  Calendar
} from "lucide-react"

interface FinancialCurveProps {
  data: FinancialWeekData[]
  className?: string
  showFinancials?: boolean
  showActiveHouses?: boolean
}

const FinancialCurveComponent = ({ 
  data, 
  className,
  showFinancials = true,
  showActiveHouses = true
}: FinancialCurveProps) => {
  // Calcular métricas resumidas
  const metrics = React.useMemo(() => {
    if (!data || data.length === 0) return null

    const totalCost = data[data.length - 1]?.cumulativeCost || 0
    const maxWeeklyCost = Math.max(...data.map(d => d.weeklyCost))
    const maxActiveHouses = Math.max(...data.map(d => d.activeHouses))
    const avgWeeklyCost = data.reduce((sum, d) => sum + d.weeklyCost, 0) / data.length
    
    // Encontrar pico de execução
    const peakWeek = data.find(d => d.weeklyCost === maxWeeklyCost)
    
    // Calcular tendência (últimas 4 semanas vs 4 anteriores)
    const recentWeeks = data.slice(-4)
    const previousWeeks = data.slice(-8, -4)
    
    const recentAvg = recentWeeks.reduce((sum, d) => sum + d.weeklyCost, 0) / recentWeeks.length
    const previousAvg = previousWeeks.reduce((sum, d) => sum + d.weeklyCost, 0) / previousWeeks.length
    
    const trend = recentAvg > previousAvg ? 'up' : recentAvg < previousAvg ? 'down' : 'stable'
    const trendPercentage = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0

    return {
      totalCost,
      maxWeeklyCost,
      maxActiveHouses,
      avgWeeklyCost,
      peakWeek,
      trend,
      trendPercentage
    }
  }, [data])

  const CustomTooltip = React.useCallback(({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as FinancialWeekData
      
      return (
        <div className="bg-white border border-industrial-text-muted rounded-lg shadow-lg p-3">
          <p className="font-medium text-industrial-text-primary mb-2">
            {label}
          </p>
          <div className="space-y-1 text-sm">
            <p className="text-industrial-primary">
              <span className="font-medium">Custo semanal:</span> {formatCurrency(data.weeklyCost)}
            </p>
            <p className="text-industrial-success">
              <span className="font-medium">Acumulado:</span> {formatCurrency(data.cumulativeCost)}
            </p>
            <p className="text-industrial-text-secondary">
              <span className="font-medium">Casas ativas:</span> {data.activeHouses}
            </p>
            
            {/* Mostrar custos por pacote se houver */}
            {Object.entries(data.packageCosts).some(([_, cost]) => cost > 0) && (
              <div className="mt-2 pt-2 border-t border-industrial-text-muted">
                <p className="font-medium text-industrial-text-primary mb-1">Por pacote:</p>
                {Object.entries(data.packageCosts)
                  .filter(([_, cost]) => cost > 0)
                  .map(([packageName, cost]) => (
                    <p key={packageName} className="text-xs text-industrial-text-secondary">
                      {packageName}: {formatCurrency(cost)}
                    </p>
                  ))
                }
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }, [])

  if (!data || data.length === 0) {
    return (
      <IndustrialCard 
        title="Curva Físico-Financeira"
        description="Nenhum dado disponível para exibir"
        className={className}
      >
        <p className="text-industrial-text-secondary text-center py-8">
          Execute o cálculo para visualizar a curva financeira
        </p>
      </IndustrialCard>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Métricas resumidas */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <IndustrialCard>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-industrial-primary/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-industrial-primary" />
              </div>
              <div>
                <p className="text-sm text-industrial-text-secondary">Total do projeto</p>
                <p className="text-lg font-bold text-industrial-text-primary">
                  {formatCurrency(metrics.totalCost)}
                </p>
              </div>
            </div>
          </IndustrialCard>

          <IndustrialCard>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-industrial-accent/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-industrial-accent" />
              </div>
              <div>
                <p className="text-sm text-industrial-text-secondary">Pico semanal</p>
                <p className="text-lg font-bold text-industrial-text-primary">
                  {formatCurrency(metrics.maxWeeklyCost)}
                </p>
              </div>
            </div>
          </IndustrialCard>

          <IndustrialCard>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-industrial-success/10 rounded-lg">
                <Home className="h-5 w-5 text-industrial-success" />
              </div>
              <div>
                <p className="text-sm text-industrial-text-secondary">Máx. casas ativas</p>
                <p className="text-lg font-bold text-industrial-text-primary">
                  {metrics.maxActiveHouses}
                </p>
              </div>
            </div>
          </IndustrialCard>

          <IndustrialCard>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-industrial-text-secondary">Média semanal</p>
                <p className="text-lg font-bold text-industrial-text-primary">
                  {formatCurrency(metrics.avgWeeklyCost)}
                </p>
              </div>
            </div>
          </IndustrialCard>
        </div>
      )}

      {/* Tendência */}
      {metrics && (
        <IndustrialCard>
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              metrics.trend === 'up' ? "bg-green-100" : 
              metrics.trend === 'down' ? "bg-red-100" : "bg-gray-100"
            )}>
              {metrics.trend === 'up' ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : metrics.trend === 'down' ? (
                <TrendingDown className="h-5 w-5 text-red-600" />
              ) : (
                <div className="h-5 w-5 bg-gray-400 rounded-full" />
              )}
            </div>
            <div>
              <p className="text-sm text-industrial-text-secondary">
                Tendência (últimas 4 semanas)
              </p>
              <div className="flex items-center gap-2">
                <Badge variant={
                  metrics.trend === 'up' ? 'default' : 
                  metrics.trend === 'down' ? 'destructive' : 'secondary'
                }>
                  {metrics.trend === 'up' ? 'Crescendo' : 
                   metrics.trend === 'down' ? 'Decrescendo' : 'Estável'}
                </Badge>
                {metrics.trendPercentage !== 0 && (
                  <span className={cn(
                    "text-sm font-medium",
                    metrics.trend === 'up' ? "text-green-600" : "text-red-600"
                  )}>
                    {metrics.trendPercentage > 0 ? '+' : ''}{metrics.trendPercentage.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </IndustrialCard>
      )}

      {/* Gráfico principal */}
      <IndustrialCard 
        title={showFinancials && showActiveHouses ? "Curva Físico-Financeira" : 
               showFinancials ? "Curva S - Custos" : "Casas em Execução"} 
        description={showFinancials && showActiveHouses ? "Evolução dos custos e casas em execução ao longo do tempo" :
                     showFinancials ? "Evolução dos custos acumulados e semanais" : "Quantidade de casas ativas por semana"}
      >
        <div style={{ width: '100%', height: '400px' }}>
          <ResponsiveContainer>
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="weekLabel" 
                stroke="#6b7280"
                fontSize={12}
                interval="preserveStartEnd"
              />
              {showFinancials ? (
                <YAxis 
                  yAxisId="cost"
                  orientation="left"
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => `R$ ${(value / 1000000).toFixed(1)}M`}
                />
              ) : showActiveHouses ? (
                <YAxis 
                  yAxisId="houses"
                  orientation="left"
                  stroke="#6b7280"
                  fontSize={12}
                />
              ) : null}
              
              {showFinancials && showActiveHouses && (
                <YAxis 
                  yAxisId="houses"
                  orientation="right"
                  stroke="#6b7280"
                  fontSize={12}
                />
              )}
              
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Área do custo acumulado */}
              {showFinancials && (
                <Area
                  yAxisId="cost"
                  type="monotone"
                  dataKey="cumulativeCost"
                  fill="#1e3a8a"
                  fillOpacity={0.1}
                  stroke="#1e3a8a"
                  strokeWidth={2}
                  name="Custo acumulado"
                />
              )}
              
              {/* Barras do custo semanal */}
              {showFinancials && (
                <Bar
                  yAxisId="cost"
                  dataKey="weeklyCost"
                  fill="#dc2626"
                  fillOpacity={0.8}
                  name="Custo semanal"
                />
              )}
              
              {/* Linha de casas ativas */}
              {showActiveHouses && (
                <Line
                  yAxisId={showFinancials && showActiveHouses ? "houses" : "houses"}
                  type="monotone"
                  dataKey="activeHouses"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={{ fill: '#059669', strokeWidth: 2, r: 3 }}
                  name="Casas ativas"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </IndustrialCard>
    </div>
  )
}

export const FinancialCurve = React.memo(FinancialCurveComponent)