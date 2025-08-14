'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { useProjectStore, calculateBaseline, validateCalculationInputs } from "@/lib"
import { 
  IndustrialCard,
  IndustrialButton,
  FeedbackMessage,
  ProgressIndicator
} from "@/components/ui"
import { ClientOnly } from "@/components/common"
import { Calculator, Play, CheckCircle, RotateCcw } from "lucide-react"

export default function CalculatePage() {
  const router = useRouter()
  const { 
    getProjectData, 
    setCalculationResult, 
    setIsCalculating,
    forceResetCalculation,
    isCalculating,
    getConfigStatus
  } = useProjectStore()

  const [errors, setErrors] = React.useState<string[]>([])
  const [progress, setProgress] = React.useState(0)

  const resetCalculation = () => {
    forceResetCalculation()
    setErrors([])
    setProgress(0)
  }

  // Reset ao montar o componente (caso tenha ficado travado)
  React.useEffect(() => {
    return () => {
      // Cleanup ao desmontar
      setIsCalculating(false)
    }
  }, [])

  const configStatus = getConfigStatus()
  const projectData = getProjectData()

  const handleCalculate = async () => {
    const validationErrors = validateCalculationInputs(projectData)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsCalculating(true)
    setErrors([])
    setProgress(0)

    try {
      // Simular progresso
      const steps = ['Validando dados', 'Calculando matriz', 'Processando períodos', 'Finalizando']
      
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500))
        setProgress((i + 1) / steps.length * 100)
      }

      const result = calculateBaseline(projectData)
      setCalculationResult(result)
      
      setTimeout(() => {
        router.push('/matrix')
      }, 1000)
      
    } catch (error) {
      console.error('Erro no cálculo:', error)
      setErrors(['Erro durante o cálculo: ' + (error as Error).message])
      setIsCalculating(false)
    } finally {
      // Garantir que sempre reseta o estado
      setTimeout(() => {
        setIsCalculating(false)
      }, 100)
    }
  }

  const calculationSteps = [
    {
      label: 'Configuração validada',
      status: (configStatus.canCalculate ? 'completed' : 'pending') as 'completed' | 'pending'
    },
    {
      label: 'Cálculo em execução',
      status: (isCalculating ? 'completed' : 'pending') as 'completed' | 'pending'
    },
    {
      label: 'Resultado gerado',
      status: 'pending' as 'pending'
    }
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-industrial-text-primary">
            Executar Cálculo
          </h1>
          <p className="text-industrial-text-secondary mt-1">
            Calcule a linha de base do projeto
          </p>
        </div>
        
        {isCalculating && (
          <IndustrialButton
            onClick={resetCalculation}
            variant="outline"
            size="sm"
            icon={<RotateCcw className="h-4 w-4" />}
          >
            Reset
          </IndustrialButton>
        )}
      </div>

      {errors.length > 0 && (
        <FeedbackMessage 
          type="error"
          title="Erros de validação"
          message={errors.join('; ')}
        />
      )}

      <IndustrialCard 
        title="Status do Cálculo"
        icon={<Calculator className="h-5 w-5" />}
      >
        <ProgressIndicator steps={calculationSteps} />

        {isCalculating && (
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-industrial-primary h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-industrial-text-secondary mt-2">
              Calculando... {Math.round(progress)}%
            </p>
          </div>
        )}

        <div className="flex justify-center gap-3 mt-6">
          <IndustrialButton
            onClick={handleCalculate}
            disabled={!configStatus.canCalculate || isCalculating}
            loading={isCalculating}
            icon={<Play className="h-4 w-4" />}
            size="lg"
          >
            {isCalculating ? 'Calculando...' : 'Executar Cálculo'}
          </IndustrialButton>

          {isCalculating && (
            <IndustrialButton
              onClick={resetCalculation}
              variant="outline"
              icon={<RotateCcw className="h-4 w-4" />}
              size="lg"
            >
              Cancelar
            </IndustrialButton>
          )}
        </div>
      </IndustrialCard>

      <IndustrialCard title="Resumo da Configuração">
        <ClientOnly fallback={
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium">Casas</h4>
              <p className="text-2xl font-bold">-</p>
            </div>
            <div>
              <h4 className="font-medium">Pacotes</h4>
              <p className="text-2xl font-bold">-</p>
            </div>
            <div>
              <h4 className="font-medium">Períodos</h4>
              <p className="text-2xl font-bold">-</p>
            </div>
          </div>
        }>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium">Casas</h4>
              <p className="text-2xl font-bold">{projectData.housesCount}</p>
            </div>
            <div>
              <h4 className="font-medium">Pacotes</h4>
              <p className="text-2xl font-bold">{projectData.workPackages.length}</p>
            </div>
            <div>
              <h4 className="font-medium">Períodos</h4>
              <p className="text-2xl font-bold">
                {projectData.stopPeriods.length + projectData.partialReductionPeriods.length}
              </p>
            </div>
          </div>
        </ClientOnly>
      </IndustrialCard>
    </div>
  )
}