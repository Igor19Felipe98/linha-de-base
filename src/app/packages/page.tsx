'use client'

import * as React from "react"
import { 
  useProjectStore, 
  getWorkPackageColor, 
  formatCurrency,
  generatePackagesTemplate,
  parsePackagesSpreadsheet,
  downloadFile,
  generateFileName,
  applyPackagesToStore,
  validatePackagesData
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
  Edit,
  Save,
  Package,
  DollarSign,
  Upload,
  Download
} from "lucide-react"

export default function PackagesPage() {
  const {
    workPackages,
    addWorkPackage,
    updateWorkPackage,
    removeWorkPackage,
    reorderWorkPackages
  } = useProjectStore()

  const [editingIndex, setEditingIndex] = React.useState<number | null>(null)
  const [newPackage, setNewPackage] = React.useState({
    name: '',
    duration: '1',
    rhythm: '5',
    latency: '0',
    cost: '25000'
  })
  const [successMessage, setSuccessMessage] = React.useState('')

  const resetNewPackage = () => {
    setNewPackage({
      name: '',
      duration: '1',
      rhythm: '5', 
      latency: '0',
      cost: '25000'
    })
  }

  const handleAddPackage = () => {
    if (!newPackage.name) return
    
    addWorkPackage({
      name: newPackage.name,
      duration: parseInt(newPackage.duration),
      rhythm: parseInt(newPackage.rhythm),
      latency: parseInt(newPackage.latency),
      cost: parseFloat(newPackage.cost)
    })
    
    resetNewPackage()
    setSuccessMessage('Pacote adicionado com sucesso!')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleUpdatePackage = (index: number, field: string, value: string) => {
    const numericFields = ['duration', 'rhythm', 'latency', 'cost']
    const updateValue = numericFields.includes(field) 
      ? (field === 'cost' ? parseFloat(value) : parseInt(value))
      : value
    
    updateWorkPackage(index, { [field]: updateValue })
  }

  // Funções para import/export
  const handleDownloadTemplate = () => {
    const template = generatePackagesTemplate()
    const filename = generateFileName('modelo_pacotes')
    downloadFile(template, filename)
  }

  const handleFileUpload = async (file: File) => {
    try {
      const data = await parsePackagesSpreadsheet(file)
      const validationErrors = validatePackagesData(data)
      
      if (validationErrors.length > 0) {
        return {
          success: false,
          errors: validationErrors,
          warnings: []
        }
      }

      const store = {
        workPackages,
        addWorkPackage,
        removeWorkPackage
      }

      const result = applyPackagesToStore(data, store)
      
      if (result.success) {
        setSuccessMessage('Pacotes importados com sucesso!')
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
      <div>
        <h1 className="text-2xl font-bold text-industrial-text-primary">
          Pacotes de Trabalho
        </h1>
        <p className="text-industrial-text-secondary mt-1">
          Configure os pacotes de trabalho e suas características
        </p>
      </div>

      {successMessage && (
        <FeedbackMessage type="success" message={successMessage} />
      )}

      {/* Adicionar Novo Pacote */}
      <IndustrialCard 
        title="Adicionar Novo Pacote"
        icon={<Plus className="h-5 w-5" />}
      >
        <div className="grid md:grid-cols-5 gap-4">
          <div>
            <Label>Nome</Label>
            <Input
              value={newPackage.name}
              onChange={(e) => setNewPackage(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Fundação"
            />
          </div>
          <div>
            <Label>Duração (semanas)</Label>
            <Input
              type="number"
              min="0.1"
              step="0.1"
              value={newPackage.duration}
              onChange={(e) => setNewPackage(prev => ({ ...prev, duration: e.target.value }))}
            />
          </div>
          <div>
            <Label>Ritmo (casas/semana)</Label>
            <Input
              type="number" 
              min="1"
              value={newPackage.rhythm}
              onChange={(e) => setNewPackage(prev => ({ ...prev, rhythm: e.target.value }))}
            />
          </div>
          <div>
            <Label>Latência (semanas)</Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={newPackage.latency}
              onChange={(e) => setNewPackage(prev => ({ ...prev, latency: e.target.value }))}
            />
          </div>
          <div>
            <Label>Custo (R$)</Label>
            <Input
              type="number"
              min="0"
              value={newPackage.cost}
              onChange={(e) => setNewPackage(prev => ({ ...prev, cost: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <IndustrialButton
            onClick={handleAddPackage}
            icon={<Plus className="h-4 w-4" />}
            disabled={!newPackage.name}
          >
            Adicionar Pacote
          </IndustrialButton>
        </div>
      </IndustrialCard>

      {/* Lista de Pacotes */}
      <div className="space-y-4">
        {workPackages.map((pkg, index) => (
          <IndustrialCard key={index}>
            <div className="flex items-center gap-4">
              <div 
                className="w-6 h-6 rounded"
                style={{ backgroundColor: pkg.color }}
              />
              
              <div className="flex-1 grid md:grid-cols-5 gap-4">
                <div>
                  <Label>Nome</Label>
                  <Input
                    value={pkg.name}
                    onChange={(e) => handleUpdatePackage(index, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Duração (sem)</Label>
                  <Input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={pkg.duration}
                    onChange={(e) => handleUpdatePackage(index, 'duration', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Ritmo (sem)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={pkg.rhythm}
                    onChange={(e) => handleUpdatePackage(index, 'rhythm', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Latência (sem)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={pkg.latency}
                    onChange={(e) => handleUpdatePackage(index, 'latency', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Custo</Label>
                  <Input
                    type="number"
                    value={pkg.cost}
                    onChange={(e) => handleUpdatePackage(index, 'cost', e.target.value)}
                  />
                </div>
              </div>

              <IndustrialButton
                size="sm"
                variant="destructive"
                icon={<Trash2 className="h-4 w-4" />}
                onClick={() => removeWorkPackage(index)}
              />
            </div>

            <div className="flex justify-between items-center mt-3 pt-3 border-t">
              <div className="text-sm text-industrial-text-secondary">
                Capacidade: {pkg.rhythm} casas/semana | Duração: {pkg.duration} semanas | Total: {formatCurrency(pkg.cost)}
              </div>
              <Badge variant="outline">
                Pacote {index + 1}
              </Badge>
            </div>
          </IndustrialCard>
        ))}
      </div>

      {workPackages.length === 0 && (
        <IndustrialCard>
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-industrial-text-muted mx-auto mb-4" />
            <p className="text-industrial-text-secondary">
              Nenhum pacote de trabalho configurado. Adicione pelo menos um pacote para continuar.
            </p>
          </div>
        </IndustrialCard>
      )}

      {/* Import/Export de Pacotes */}
      <IndustrialCard 
        title="Importar/Exportar Pacotes"
        description="Baixe uma planilha modelo ou importe pacotes de uma planilha"
        icon={<Upload className="h-5 w-5" />}
      >
        <FileUpload
          onFileUpload={handleFileUpload}
          onTemplateDownload={handleDownloadTemplate}
          templateName="Modelo de Pacotes"
          title="Importar Pacotes de Planilha"
          description="Baixe o modelo, preencha com seus pacotes e faça upload para importar automaticamente"
        />
      </IndustrialCard>
    </div>
  )
}