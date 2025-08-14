'use client'

import * as React from "react"
import Link from "next/link"
import { useProjectStore } from "@/lib"
import { 
  IndustrialCard,
  IndustrialButton,
  Badge,
  ProgressIndicator,
  FeedbackMessage
} from "@/components/ui"
import { 
  Settings, 
  Package, 
  Calculator, 
  Grid3x3, 
  BarChart3,
  CheckCircle,
  AlertCircle,
  Home,
  Calendar,
  DollarSign,
  TrendingUp
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib"
import { ClientOnly } from "@/components/common"

export default function HomePage() {
  const { 
    housesCount, 
    startDateDisplay,
    workPackages, 
    calculationResult,
    lastCalculatedAt,
    getConfigStatus 
  } = useProjectStore()

  const configStatus = getConfigStatus()

  // Status steps para o indicador de progresso
  const configSteps = [
    {
      label: 'Dados básicos configurados',
      status: (configStatus.isBasicDataValid ? 'completed' : 'pending') as 'completed' | 'pending',
      description: `${housesCount} casas, início em ${startDateDisplay}`
    },
    {
      label: 'Pacotes de trabalho definidos',
      status: (configStatus.isPackagesValid ? 'completed' : 'pending') as 'completed' | 'pending',
      description: `${workPackages.length} pacotes configurados`
    },
    {
      label: 'Períodos de redução configurados',
      status: (configStatus.isPeriodsValid ? 'completed' : 'pending') as 'completed' | 'pending',
      description: 'Períodos de parada e redução definidos'
    },
    {
      label: 'Curva de aprendizado ajustada',
      status: (configStatus.isLearningCurveValid ? 'completed' : 'pending') as 'completed' | 'pending',
      description: 'Parâmetros de curva de aprendizado'
    }
  ]

  // Estatísticas rápidas
  const projectStats = React.useMemo(() => {
    if (!calculationResult) return null

    const totalCost = calculationResult.calculationMetadata.totalProjectCost
    const duration = calculationResult.calculationMetadata.totalProjectDuration
    const packages = calculationResult.calculationMetadata.totalPackages

    return {
      totalCost,
      duration,
      packages,
      calculatedAt: calculationResult.calculationMetadata.calculatedAt
    }
  }, [calculationResult])

  const getStatusMessage = () => {
    if (!configStatus.canCalculate) {
      return {
        type: 'warning' as const,
        title: 'Configuração incompleta',
        message: 'Complete a configuração do projeto para poder executar os cálculos.'
      }
    }

    if (!calculationResult) {
      return {
        type: 'info' as const,
        title: 'Pronto para calcular',
        message: 'Todas as configurações estão completas. Execute o cálculo para gerar a linha de base.'
      }
    }

    return {
      type: 'success' as const,
      title: 'Linha de base calculada',
      message: `Cálculo executado em ${formatDate(lastCalculatedAt || '')}. Você pode visualizar os resultados ou recalcular se necessário.`
    }
  }

  const statusMessage = getStatusMessage()

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-industrial-text-primary mb-4">
          Linha de Base - Planejamento de Obras
        </h1>
        <p className="text-lg text-industrial-text-secondary max-w-2xl mx-auto">
          Sistema de planejamento e controle de cronogramas para obras residenciais 
          usando metodologia Lean Construction. Cenário pré-configurado: Jardins Montreal
          com 300 casas e 23 pacotes de trabalho.
        </p>
      </div>

      {/* Status Message */}
      <ClientOnly fallback={
        <FeedbackMessage 
          type="info"
          title="Carregando..."
          message="Carregando status do projeto..."
        />
      }>
        <FeedbackMessage {...statusMessage} />
      </ClientOnly>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <IndustrialCard>
          <ClientOnly fallback={
            <div className="flex items-center gap-3">
              <div className="p-2 bg-industrial-primary/10 rounded-lg">
                <Home className="h-5 w-5 text-industrial-primary" />
              </div>
              <div>
                <p className="text-sm text-industrial-text-secondary">Casas</p>
                <p className="text-2xl font-bold text-industrial-text-primary">-</p>
              </div>
            </div>
          }>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-industrial-primary/10 rounded-lg">
                <Home className="h-5 w-5 text-industrial-primary" />
              </div>
              <div>
                <p className="text-sm text-industrial-text-secondary">Casas</p>
                <p className="text-2xl font-bold text-industrial-text-primary">
                  {housesCount}
                </p>
              </div>
            </div>
          </ClientOnly>
        </IndustrialCard>

        <IndustrialCard>
          <ClientOnly fallback={
            <div className="flex items-center gap-3">
              <div className="p-2 bg-industrial-accent/10 rounded-lg">
                <Package className="h-5 w-5 text-industrial-accent" />
              </div>
              <div>
                <p className="text-sm text-industrial-text-secondary">Pacotes</p>
                <p className="text-2xl font-bold text-industrial-text-primary">-</p>
              </div>
            </div>
          }>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-industrial-accent/10 rounded-lg">
                <Package className="h-5 w-5 text-industrial-accent" />
              </div>
              <div>
                <p className="text-sm text-industrial-text-secondary">Pacotes</p>
                <p className="text-2xl font-bold text-industrial-text-primary">
                  {workPackages.length}
                </p>
              </div>
            </div>
          </ClientOnly>
        </IndustrialCard>

        <IndustrialCard>
          <ClientOnly fallback={
            <div className="flex items-center gap-3">
              <div className="p-2 bg-industrial-success/10 rounded-lg">
                <Calendar className="h-5 w-5 text-industrial-success" />
              </div>
              <div>
                <p className="text-sm text-industrial-text-secondary">Duração</p>
                <p className="text-2xl font-bold text-industrial-text-primary">--</p>
              </div>
            </div>
          }>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-industrial-success/10 rounded-lg">
                <Calendar className="h-5 w-5 text-industrial-success" />
              </div>
              <div>
                <p className="text-sm text-industrial-text-secondary">Duração</p>
                <p className="text-2xl font-bold text-industrial-text-primary">
                  {projectStats ? `${projectStats.duration}s` : '--'}
                </p>
              </div>
            </div>
          </ClientOnly>
        </IndustrialCard>

        <IndustrialCard>
          <ClientOnly fallback={
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-industrial-text-secondary">Valor Total</p>
                <p className="text-lg font-bold text-industrial-text-primary">--</p>
              </div>
            </div>
          }>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-industrial-text-secondary">Valor Total</p>
                <p className="text-lg font-bold text-industrial-text-primary">
                  {projectStats ? formatCurrency(projectStats.totalCost) : '--'}
                </p>
              </div>
            </div>
          </ClientOnly>
        </IndustrialCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Configuration Status */}
        <IndustrialCard 
          title="Status da Configuração"
          description="Progresso da configuração do projeto"
          icon={<Settings className="h-5 w-5" />}
        >
          <ClientOnly fallback={
            <div className="space-y-3">
              <div className="text-sm text-industrial-text-secondary">
                Carregando status da configuração...
              </div>
            </div>
          }>
            <ProgressIndicator steps={configSteps} />
          </ClientOnly>
          
          <div className="mt-6 flex gap-3">
            <Link href="/project-config">
              <IndustrialButton 
                size="sm"
                variant="outline"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurar Projeto
              </IndustrialButton>
            </Link>
            
            <Link href="/packages">
              <IndustrialButton 
                size="sm"
                variant="outline"
              >
                <Package className="h-4 w-4 mr-2" />
                Gerenciar Pacotes
              </IndustrialButton>
            </Link>
          </div>
        </IndustrialCard>

        {/* Quick Actions */}
        <IndustrialCard 
          title="Ações Principais"
          description="Executar cálculos e visualizar resultados"
          icon={<TrendingUp className="h-5 w-5" />}
        >
          <div className="space-y-3">
            {configStatus.canCalculate ? (
              <Link href="/calculate" className="w-full">
                <IndustrialButton className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  {calculationResult ? 'Recalcular Linha de Base' : 'Calcular Linha de Base'}
                </IndustrialButton>
              </Link>
            ) : (
              <IndustrialButton 
                className="w-full"
                disabled={true}
              >
                <Calculator className="h-4 w-4 mr-2" />
                {calculationResult ? 'Recalcular Linha de Base' : 'Calcular Linha de Base'}
              </IndustrialButton>
            )}

            {calculationResult ? (
              <Link href="/matrix" className="w-full">
                <IndustrialButton 
                  variant="outline"
                  className="w-full"
                >
                  <Grid3x3 className="h-4 w-4 mr-2" />
                  Visualizar Matriz
                </IndustrialButton>
              </Link>
            ) : (
              <IndustrialButton 
                variant="outline"
                className="w-full"
                disabled={true}
              >
                <Grid3x3 className="h-4 w-4 mr-2" />
                Visualizar Matriz
              </IndustrialButton>
            )}

            {calculationResult ? (
              <Link href="/dashboard" className="w-full">
                <IndustrialButton 
                  variant="outline"
                  className="w-full"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard Executivo
                </IndustrialButton>
              </Link>
            ) : (
              <IndustrialButton 
                variant="outline"
                className="w-full"
                disabled={true}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard Executivo
              </IndustrialButton>
            )}
          </div>

          {calculationResult && (
            <div className="mt-4 pt-4 border-t border-industrial-text-muted">
              <div className="flex items-center gap-2 text-sm text-industrial-text-secondary">
                <CheckCircle className="h-4 w-4 text-industrial-success" />
                Última atualização: {formatDate(lastCalculatedAt || '')}
              </div>
            </div>
          )}
        </IndustrialCard>
      </div>

      {/* Project Summary */}
      {calculationResult && (
        <IndustrialCard 
          title="Resumo do Projeto"
          description="Informações calculadas da linha de base"
          status="success"
        >
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-industrial-text-primary mb-2">
                Cronograma
              </h4>
              <div className="space-y-1 text-sm">
                <p className="text-industrial-text-secondary">
                  Duração: <span className="font-medium">{projectStats?.duration} semanas</span>
                </p>
                <p className="text-industrial-text-secondary">
                  Início: <span className="font-medium">{startDateDisplay}</span>
                </p>
                <p className="text-industrial-text-secondary">
                  Pacotes: <span className="font-medium">{workPackages.length}</span>
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-industrial-text-primary mb-2">
                Financeiro
              </h4>
              <div className="space-y-1 text-sm">
                <p className="text-industrial-text-secondary">
                  Total: <span className="font-medium">{formatCurrency(projectStats?.totalCost || 0)}</span>
                </p>
                <p className="text-industrial-text-secondary">
                  Por casa: <span className="font-medium">{formatCurrency((projectStats?.totalCost || 0) / housesCount)}</span>
                </p>
                <p className="text-industrial-text-secondary">
                  Por semana: <span className="font-medium">{formatCurrency((projectStats?.totalCost || 0) / (projectStats?.duration || 1))}</span>
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-industrial-text-primary mb-2">
                Status
              </h4>
              <div className="space-y-2">
                <Badge variant="default">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Calculado
                </Badge>
                <p className="text-sm text-industrial-text-secondary">
                  {calculationResult.calculationMetadata.reductionPeriods > 0 && (
                    <>Com {calculationResult.calculationMetadata.reductionPeriods} períodos de redução</>
                  )}
                </p>
              </div>
            </div>
          </div>
        </IndustrialCard>
      )}
    </div>
  )
}