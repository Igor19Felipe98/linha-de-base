'use client'

import * as React from "react"
import { 
  useProjectStore,
  validateDateFormat, 
  convertDateToISO, 
  isValidRange,
  months,
  MAX_HOUSES_LIMIT,
  ERROR_MESSAGES,
  VALIDATION_RULES,
  useDebounce,
  DEFAULT_PROJECT_CONFIG,
  generateConfigTemplate,
  parseConfigSpreadsheet,
  downloadFile,
  generateFileName,
  applyConfigToStore,
  validateConfigData
} from "@/lib"
import { 
  IndustrialCard,
  IndustrialButton,
  Input,
  Label,
  Badge,
  FeedbackMessage,
  FileUpload
} from "@/components/ui"
import { 
  Plus, 
  Trash2, 
  Save,
  Settings,
  Pause,
  TrendingDown,
  RotateCcw,
  AlertTriangle,
  Upload,
  Download
} from "lucide-react"

export default function ProjectConfigPage() {
  const {
    housesCount,
    startDateDisplay,
    stopPeriods,
    partialReductionPeriods,
    learningCurve,
    workPackages,
    setHousesCount,
    setStartDate,
    addStopPeriod,
    removeStopPeriod,
    updateStopPeriod,
    addPartialReductionPeriod,
    removePartialReductionPeriod,
    updatePartialReductionPeriod,
    updateLearningCurve,
    resetToDefaults
  } = useProjectStore()

  // Estados locais para formulários
  const [localHousesCount, setLocalHousesCount] = React.useState(housesCount.toString())
  const [localStartDate, setLocalStartDate] = React.useState(startDateDisplay)
  const [errors, setErrors] = React.useState<string[]>([])
  const [successMessage, setSuccessMessage] = React.useState('')
  const [showResetConfirm, setShowResetConfirm] = React.useState(false)

  // Debounce para os inputs críticos
  const debouncedHousesCount = useDebounce(localHousesCount, 500)
  const debouncedStartDate = useDebounce(localStartDate, 300)

  // Estados para novos períodos
  const [newStopPeriod, setNewStopPeriod] = React.useState({
    month: '',
    description: ''
  })
  const [newReductionPeriod, setNewReductionPeriod] = React.useState({
    month: '',
    coefficient: '0.5',
    description: ''
  })

  const validateAndSave = () => {
    const newErrors: string[] = []

    // Validar quantidade de casas usando valor debouncado
    const houses = parseInt(debouncedHousesCount)
    if (!isValidRange(houses, 1, MAX_HOUSES_LIMIT)) {
      newErrors.push(ERROR_MESSAGES.INVALID_HOUSES_COUNT)
    }

    // Validar data usando valor debouncado
    if (!validateDateFormat(debouncedStartDate)) {
      newErrors.push('Data deve estar no formato DD/MM/AAAA')
    } else {
      const [day, month, year] = debouncedStartDate.split('/').map(Number)
      const date = new Date(year, month - 1, day)
      
      // Verificar se é segunda-feira
      if (date.getDay() !== VALIDATION_RULES.REQUIRED_START_DAY) {
        newErrors.push(ERROR_MESSAGES.INVALID_START_DAY)
      }
    }

    setErrors(newErrors)

    if (newErrors.length === 0) {
      setHousesCount(houses)
      setStartDate(convertDateToISO(debouncedStartDate), debouncedStartDate)
      setSuccessMessage('Configurações salvas com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  const addNewStopPeriod = () => {
    if (newStopPeriod.month) {
      addStopPeriod({
        month: newStopPeriod.month,
        coefficient: 0,
        description: newStopPeriod.description
      })
      setNewStopPeriod({ month: '', description: '' })
    }
  }

  const addNewReductionPeriod = () => {
    if (newReductionPeriod.month) {
      const coefficient = parseFloat(newReductionPeriod.coefficient)
      if (coefficient >= VALIDATION_RULES.MIN_COEFFICIENT && coefficient <= VALIDATION_RULES.MAX_COEFFICIENT) {
        addPartialReductionPeriod({
          month: newReductionPeriod.month,
          coefficient,
          description: newReductionPeriod.description
        })
        setNewReductionPeriod({ month: '', coefficient: '0.5', description: '' })
      }
    }
  }

  const handleResetToDefaults = () => {
    resetToDefaults()
    setLocalHousesCount(DEFAULT_PROJECT_CONFIG.housesCount.toString())
    setLocalStartDate(DEFAULT_PROJECT_CONFIG.startDateDisplay)
    setShowResetConfirm(false)
    setSuccessMessage('Configurações restauradas para os padrões do sistema!')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  // Funções para import/export
  const handleDownloadTemplate = () => {
    const template = generateConfigTemplate()
    const filename = generateFileName('modelo_configuracoes')
    downloadFile(template, filename)
  }

  const handleFileUpload = async (file: File) => {
    try {
      const data = await parseConfigSpreadsheet(file)
      const validationErrors = validateConfigData(data)
      
      if (validationErrors.length > 0) {
        return {
          success: false,
          errors: validationErrors,
          warnings: []
        }
      }

      const store = {
        setHousesCount,
        setStartDate,
        stopPeriods,
        partialReductionPeriods,
        addStopPeriod,
        addPartialReductionPeriod,
        removeStopPeriod,
        removePartialReductionPeriod,
        updateLearningCurve,
        workPackages
      }

      const result = applyConfigToStore(data, store)
      
      if (result.success) {
        // Atualizar estados locais também
        setLocalHousesCount(data.dadosBasicos.quantidadeCasas.toString())
        setLocalStartDate(data.dadosBasicos.dataInicio)
        setSuccessMessage('Configurações importadas com sucesso!')
        setTimeout(() => setSuccessMessage(''), 3000)
      }

      return result
    } catch (error) {
      return {
        success: false,
        errors: [`Erro ao processar planilha: ${error}`],
        warnings: []
      }
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-industrial-text-primary">
            Configuração do Projeto
          </h1>
          <p className="text-industrial-text-secondary mt-1">
            Configure os dados básicos do projeto e períodos especiais
          </p>
        </div>
        <div>
          <IndustrialButton
            variant="outline"
            onClick={() => setShowResetConfirm(true)}
            icon={<RotateCcw className="h-4 w-4" />}
          >
            Restaurar Padrões
          </IndustrialButton>
        </div>
      </div>

      {successMessage && (
        <FeedbackMessage 
          type="success" 
          message={successMessage} 
        />
      )}

      {errors.length > 0 && (
        <FeedbackMessage 
          type="error" 
          title="Erros de validação"
          message={errors.join('; ')} 
        />
      )}

      {/* Dados Básicos */}
      <IndustrialCard 
        title="Dados Básicos"
        description="Informações fundamentais do projeto"
        icon={<Settings className="h-5 w-5" />}
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="houses-count">Quantidade de Casas</Label>
            <Input
              id="houses-count"
              type="number"
              min="1"
              max={MAX_HOUSES_LIMIT.toString()}
              value={localHousesCount}
              onChange={(e) => setLocalHousesCount(e.target.value)}
              className="mt-1"
            />
            <p className="text-sm text-industrial-text-secondary mt-1">
              Entre 1 e {MAX_HOUSES_LIMIT} casas
            </p>
          </div>

          <div>
            <Label htmlFor="start-date">Data de Início</Label>
            <Input
              id="start-date"
              type="text"
              placeholder="DD/MM/AAAA"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              className="mt-1"
            />
            <p className="text-sm text-industrial-text-secondary mt-1">
              Deve ser uma segunda-feira
            </p>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <IndustrialButton onClick={validateAndSave} icon={<Save className="h-4 w-4" />}>
            Salvar Dados Básicos
          </IndustrialButton>
        </div>
      </IndustrialCard>

      {/* Períodos de Parada Total */}
      <IndustrialCard 
        title="Períodos de Parada Total"
        description="Meses com parada completa das atividades (coeficiente 0)"
        icon={<Pause className="h-5 w-5" />}
      >
        <div className="space-y-4">
          {stopPeriods.map((period) => (
            <div key={period.id} className="flex items-center gap-4 p-3 bg-red-50 rounded-lg">
              <Badge variant="destructive">Parada Total</Badge>
              <div className="flex-1">
                <p className="font-medium capitalize">{period.month}</p>
                {period.description && (
                  <p className="text-sm text-industrial-text-secondary">{period.description}</p>
                )}
              </div>
              <IndustrialButton
                size="sm"
                variant="destructive"
                icon={<Trash2 className="h-3 w-3" />}
                onClick={() => removeStopPeriod(period.id)}
              />
            </div>
          ))}

          <div className="border-t pt-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Mês</Label>
                <select
                  value={newStopPeriod.month}
                  onChange={(e) => setNewStopPeriod(prev => ({ ...prev, month: e.target.value }))}
                  className="w-full h-10 px-3 py-2 border border-industrial-text-muted rounded-md text-sm"
                >
                  <option value="">Selecionar mês</option>
                  {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Descrição (opcional)</Label>
                <Input
                  value={newStopPeriod.description}
                  onChange={(e) => setNewStopPeriod(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ex: Festividades de fim de ano"
                />
              </div>
              <div className="flex items-end">
                <IndustrialButton
                  onClick={addNewStopPeriod}
                  icon={<Plus className="h-4 w-4" />}
                  disabled={!newStopPeriod.month}
                >
                  Adicionar Parada
                </IndustrialButton>
              </div>
            </div>
          </div>
        </div>
      </IndustrialCard>

      {/* Períodos de Redução Parcial */}
      <IndustrialCard 
        title="Períodos de Redução Parcial"
        description={`Meses com produtividade reduzida (coeficiente entre ${VALIDATION_RULES.MIN_COEFFICIENT} e ${VALIDATION_RULES.MAX_COEFFICIENT})`}
        icon={<TrendingDown className="h-5 w-5" />}
      >
        <div className="space-y-4">
          {partialReductionPeriods.map((period) => (
            <div key={period.id} className="flex items-center gap-4 p-3 bg-yellow-50 rounded-lg">
              <Badge variant="secondary">
                {Math.round(period.coefficient * 100)}% produtivo
              </Badge>
              <div className="flex-1">
                <p className="font-medium capitalize">{period.month}</p>
                {period.description && (
                  <p className="text-sm text-industrial-text-secondary">{period.description}</p>
                )}
              </div>
              <IndustrialButton
                size="sm"
                variant="destructive"
                icon={<Trash2 className="h-3 w-3" />}
                onClick={() => removePartialReductionPeriod(period.id)}
              />
            </div>
          ))}

          <div className="border-t pt-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Label>Mês</Label>
                <select
                  value={newReductionPeriod.month}
                  onChange={(e) => setNewReductionPeriod(prev => ({ ...prev, month: e.target.value }))}
                  className="w-full h-10 px-3 py-2 border border-industrial-text-muted rounded-md text-sm"
                >
                  <option value="">Selecionar mês</option>
                  {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Coeficiente</Label>
                <Input
                  type="number"
                  min={VALIDATION_RULES.MIN_COEFFICIENT.toString()}
                  max={VALIDATION_RULES.MAX_COEFFICIENT.toString()}
                  step="0.01"
                  value={newReductionPeriod.coefficient}
                  onChange={(e) => setNewReductionPeriod(prev => ({ ...prev, coefficient: e.target.value }))}
                />
              </div>
              <div>
                <Label>Descrição (opcional)</Label>
                <Input
                  value={newReductionPeriod.description}
                  onChange={(e) => setNewReductionPeriod(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ex: Carnaval e férias"
                />
              </div>
              <div className="flex items-end">
                <IndustrialButton
                  onClick={addNewReductionPeriod}
                  icon={<Plus className="h-4 w-4" />}
                  disabled={!newReductionPeriod.month}
                >
                  Adicionar Redução
                </IndustrialButton>
              </div>
            </div>
          </div>
        </div>
      </IndustrialCard>

      {/* Curva de Aprendizado */}
      <IndustrialCard 
        title="Curva de Aprendizado"
        description="Parâmetros para simular a curva de aprendizado das equipes"
        icon={<TrendingDown className="h-5 w-5" />}
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <Label>Redutor Inicial</Label>
            <Input
              type="number"
              min="0.1"
              max="1"
              step="0.01"
              value={learningCurve.rhythmReducer}
              onChange={(e) => updateLearningCurve({ rhythmReducer: parseFloat(e.target.value) })}
            />
            <p className="text-sm text-industrial-text-secondary mt-1">
              Fator de redução inicial do ritmo (ex: 0.60 = 60%)
            </p>
          </div>

          <div>
            <Label>Incremento por Período</Label>
            <Input
              type="number"
              min="0"
              max="0.5"
              step="0.01"
              value={learningCurve.increment}
              onChange={(e) => updateLearningCurve({ increment: parseFloat(e.target.value) })}
            />
            <p className="text-sm text-industrial-text-secondary mt-1">
              Melhoria a cada período (ex: 0.20 = +20%)
            </p>
          </div>

          <div>
            <Label>Período (semanas)</Label>
            <Input
              type="number"
              min="1"
              max="12"
              value={learningCurve.periodWeeks}
              onChange={(e) => updateLearningCurve({ periodWeeks: parseInt(e.target.value) })}
            />
            <p className="text-sm text-industrial-text-secondary mt-1">
              Duração de cada período de melhoria
            </p>
          </div>

          <div>
            <Label>Multiplicador de Duração</Label>
            <Input
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={learningCurve.durationMultiplier}
              onChange={(e) => updateLearningCurve({ durationMultiplier: parseFloat(e.target.value) })}
            />
            <p className="text-sm text-industrial-text-secondary mt-1">
              Fator de duração inicial (ex: 2.0 = dobro do tempo)
            </p>
          </div>

          <div>
            <Label>Semanas Impactadas</Label>
            <Input
              type="number"
              min="1"
              max="20"
              value={learningCurve.durationImpactWeeks || 6}
              onChange={(e) => updateLearningCurve({ durationImpactWeeks: parseInt(e.target.value) })}
            />
            <p className="text-sm text-industrial-text-secondary mt-1">
              Semanas afetadas na curva de duração
            </p>
          </div>
        </div>

        {/* Seleção de Pacotes */}
        {workPackages.length > 0 && (
          <div className="mt-6 border-t pt-6">
            <Label className="mb-3 block">Aplicar Curva nos Pacotes</Label>
            <div className="space-y-2">
              <p className="text-sm text-industrial-text-secondary mb-3">
                Selecione os pacotes onde a curva de aprendizado deve ser aplicada. 
                Se nenhum for selecionado, a curva será aplicada em todos.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {workPackages.map((pkg) => {
                  // Se appliedPackages está vazio/undefined, considerar todos selecionados
                  // Caso contrário, verificar se está na lista
                  const appliedPackages = learningCurve.appliedPackages || [];
                  const isAllSelected = appliedPackages.length === 0;
                  const isExplicitlySelected = appliedPackages.includes(pkg.name);
                  const isSelected = isAllSelected || isExplicitlySelected;
                  
                  return (
                    <label
                      key={pkg.name}
                      className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-industrial-background-secondary transition-colors"
                      style={{ borderColor: isSelected ? pkg.color : undefined }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const currentPackages = learningCurve.appliedPackages || [];
                          
                          if (e.target.checked) {
                            // Marcar pacote
                            if (currentPackages.length === 0) {
                              // Se estava "todos selecionados", criar lista com todos exceto este
                              const allOtherPackages = workPackages
                                .filter(p => p.name !== pkg.name)
                                .map(p => p.name);
                              updateLearningCurve({ appliedPackages: [...allOtherPackages, pkg.name] });
                            } else {
                              // Adicionar à lista existente
                              updateLearningCurve({ appliedPackages: [...currentPackages, pkg.name] });
                            }
                          } else {
                            // Desmarcar pacote
                            if (currentPackages.length === 0) {
                              // Se estava "todos selecionados", criar lista com todos exceto este
                              const allOtherPackages = workPackages
                                .filter(p => p.name !== pkg.name)
                                .map(p => p.name);
                              updateLearningCurve({ appliedPackages: allOtherPackages });
                            } else {
                              // Remover da lista existente
                              const newPackages = currentPackages.filter(p => p !== pkg.name);
                              updateLearningCurve({ appliedPackages: newPackages });
                            }
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <span 
                        className="font-medium"
                        style={{ color: pkg.color }}
                      >
                        {pkg.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </IndustrialCard>

      {/* Import/Export de Configurações */}
      <IndustrialCard 
        title="Importar/Exportar Configurações"
        description="Baixe uma planilha modelo ou importe configurações de uma planilha"
        icon={<Upload className="h-5 w-5" />}
      >
        <FileUpload
          onFileUpload={handleFileUpload}
          onTemplateDownload={handleDownloadTemplate}
          templateName="Modelo de Configurações"
          title="Importar Configurações de Planilha"
          description="Baixe o modelo, preencha com suas configurações e faça upload para importar automaticamente"
        />
      </IndustrialCard>

      {/* Modal de confirmação para reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <IndustrialCard className="max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-industrial-text-primary mb-2">
                    Restaurar Configurações Padrão?
                  </h3>
                  <p className="text-sm text-industrial-text-secondary mb-4">
                    Esta ação irá restaurar todas as configurações para os valores padrão do sistema, 
                    incluindo pacotes de trabalho, períodos de parada e curva de aprendizado.
                  </p>
                  <p className="text-sm font-medium text-industrial-accent mb-4">
                    Esta ação não pode ser desfeita!
                  </p>
                  <div className="flex gap-3">
                    <IndustrialButton
                      variant="destructive"
                      onClick={handleResetToDefaults}
                      icon={<RotateCcw className="h-4 w-4" />}
                    >
                      Sim, Restaurar
                    </IndustrialButton>
                    <IndustrialButton
                      variant="outline"
                      onClick={() => setShowResetConfirm(false)}
                    >
                      Cancelar
                    </IndustrialButton>
                  </div>
                </div>
              </div>
            </div>
          </IndustrialCard>
        </div>
      )}
    </div>
  )
}