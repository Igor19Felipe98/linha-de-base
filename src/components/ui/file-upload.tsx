'use client'

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IndustrialButton } from "@/components/ui/industrial-button"
import { FeedbackMessage } from "@/components/ui/feedback-message"
import { Upload, FileSpreadsheet, Download, X } from "lucide-react"

interface FileUploadProps {
  onFileUpload: (file: File) => Promise<{ success: boolean; errors: string[]; warnings: string[] }>;
  onTemplateDownload: () => void;
  templateName: string;
  acceptedTypes?: string;
  maxSize?: number; // em bytes
  title: string;
  description?: string;
  disabled?: boolean;
}

export function FileUpload({
  onFileUpload,
  onTemplateDownload,
  templateName,
  acceptedTypes = ".xlsx",
  maxSize = 5 * 1024 * 1024, // 5MB default
  title,
  description,
  disabled = false
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadResult, setUploadResult] = React.useState<{
    success: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validações básicas
      const errors: string[] = []

      // Verificar tipo
      if (!file.name.toLowerCase().endsWith('.xlsx')) {
        errors.push('Arquivo deve ser uma planilha Excel (.xlsx)')
      }

      // Verificar tamanho
      if (file.size > maxSize) {
        errors.push(`Arquivo muito grande. Tamanho máximo: ${Math.round(maxSize / 1024 / 1024)}MB`)
      }

      if (errors.length > 0) {
        setUploadResult({
          success: false,
          errors,
          warnings: []
        })
        setSelectedFile(null)
        return
      }

      setSelectedFile(file)
      setUploadResult(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadResult(null)

    try {
      const result = await onFileUpload(selectedFile)
      setUploadResult(result)
      
      if (result.success) {
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } catch (error) {
      setUploadResult({
        success: false,
        errors: [`Erro ao processar arquivo: ${error}`],
        warnings: []
      })
    } finally {
      setIsUploading(false)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setUploadResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-industrial-text-primary">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-industrial-text-secondary mt-1">
            {description}
          </p>
        )}
      </div>

      {/* Download Template Button */}
      <div className="flex justify-start">
        <IndustrialButton
          variant="outline"
          onClick={onTemplateDownload}
          icon={<Download className="h-4 w-4" />}
          disabled={disabled}
        >
          Baixar {templateName}
        </IndustrialButton>
      </div>

      {/* File Upload Area */}
      <div className="border-2 border-dashed border-industrial-text-muted rounded-lg p-6">
        <div className="text-center">
          <FileSpreadsheet className="h-12 w-12 text-industrial-text-muted mx-auto mb-4" />
          
          <div className="space-y-2">
            <Label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-sm font-medium text-industrial-text-primary">
                Clique para selecionar arquivo
              </span>
              <span className="text-sm text-industrial-text-secondary block">
                ou arraste e solte aqui
              </span>
            </Label>
            
            <Input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept={acceptedTypes}
              onChange={handleFileSelect}
              className="hidden"
              disabled={disabled}
            />
            
            <p className="text-xs text-industrial-text-secondary">
              Apenas arquivos .xlsx • Máximo {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </div>
        </div>
      </div>

      {/* Selected File Info */}
      {selectedFile && (
        <div className="flex items-center justify-between p-3 bg-industrial-background-secondary rounded-lg">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-5 w-5 text-industrial-accent" />
            <div>
              <p className="text-sm font-medium text-industrial-text-primary">
                {selectedFile.name}
              </p>
              <p className="text-xs text-industrial-text-secondary">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <IndustrialButton
              size="sm"
              onClick={handleUpload}
              disabled={isUploading || disabled}
              icon={<Upload className="h-3 w-3" />}
            >
              {isUploading ? 'Processando...' : 'Importar'}
            </IndustrialButton>
            
            <IndustrialButton
              size="sm"
              variant="outline"
              onClick={clearFile}
              disabled={isUploading}
              icon={<X className="h-3 w-3" />}
            />
          </div>
        </div>
      )}

      {/* Upload Result Messages */}
      {uploadResult && (
        <div className="space-y-2">
          {uploadResult.success && (
            <FeedbackMessage
              type="success"
              title="Importação Concluída"
              message="Dados importados com sucesso!"
            />
          )}
          
          {uploadResult.errors.length > 0 && (
            <FeedbackMessage
              type="error"
              title="Erros de Importação"
              message={uploadResult.errors.join('; ')}
            />
          )}
          
          {uploadResult.warnings.length > 0 && (
            <FeedbackMessage
              type="warning"
              title="Avisos"
              message={uploadResult.warnings.join('; ')}
            />
          )}
        </div>
      )}
    </div>
  )
}