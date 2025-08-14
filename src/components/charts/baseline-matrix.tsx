'use client'

import * as React from "react"
import { cn, getReductionPattern, CalculationResult, MatrixCell, ZOOM_LIMITS, useMatrixVirtualizer } from "@/lib"
import { 
  IndustrialButton,
  IndustrialCard,
  Badge,
  Input,
  Label
} from "@/components/ui"
import { 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Eye,
  EyeOff
} from "lucide-react"
import { exportMatrixToCSV } from "@/lib"

interface BaselineMatrixProps {
  result: CalculationResult
  className?: string
}

const BaselineMatrixComponent = ({ result, className }: BaselineMatrixProps) => {
  const [zoom, setZoom] = React.useState(20)
  const [showEmpty, setShowEmpty] = React.useState(true)
  const [selectedCell, setSelectedCell] = React.useState<MatrixCell | null>(null)
  const matrixRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll para casa 1 (última linha) quando carregar
  React.useEffect(() => {
    if (matrixRef.current && result?.houses?.length > 0) {
      setTimeout(() => {
        matrixRef.current?.scrollTo({
          top: matrixRef.current.scrollHeight,
          behavior: 'smooth'
        })
      }, 500) // Aguarda renderização completa
    }
  }, [result?.houses?.length])

  const handleZoomChange = (newZoom: number) => {
    const clampedZoom = Math.max(ZOOM_LIMITS.MIN, Math.min(ZOOM_LIMITS.MAX, newZoom))
    setZoom(clampedZoom)
  }

  const handleExportCSV = () => {
    const csv = exportMatrixToCSV(result)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `matriz-linha-base-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getCellContent = React.useCallback((houseIndex: number, weekIndex: number): MatrixCell | null => {
    const houseCells = result.matrix[houseIndex] || []
    return houseCells.find(cell => cell.weekIndex === weekIndex) || null
  }, [result.matrix])

  const getCellTooltip = React.useCallback((cell: MatrixCell): string => {
    let tooltip = `Casa ${cell.houseNumber} - ${cell.packageName}\n`
    tooltip += `Semana ${cell.weekIndex + 1}`
    
    if (cell.isReduced) {
      tooltip += '\nProdutividade reduzida'
    }
    
    if (cell.cost) {
      tooltip += `\nCusto: R$ ${cell.cost.toFixed(2)}`
    }
    
    return tooltip
  }, [])

  const filteredWeeks = React.useMemo(() => {
    if (showEmpty || !result?.weeks) return result?.weeks || []

    // Filtrar apenas semanas que têm pelo menos uma atividade
    return result.weeks.filter((_, weekIndex) => {
      return result.houses.some((_, houseIndex) => {
        const cell = getCellContent(houseIndex, weekIndex)
        return cell !== null
      })
    })
  }, [result?.weeks, result?.houses, showEmpty, getCellContent])

  const cellSize = React.useMemo(() => {
    const baseHeight = 40
    const cellHeight = (baseHeight * zoom) / 100
    const cellWidth = cellHeight * 3 // Largura 3x a altura
    return { width: cellWidth, height: cellHeight }
  }, [zoom])

  // Determinar se deve usar virtualização
  const shouldVirtualize = React.useMemo(() => {
    const houseCount = result?.houses?.length || 0
    const weekCount = filteredWeeks.length
    return houseCount > 100 || weekCount > 200
  }, [result?.houses?.length, filteredWeeks.length])

  // Configuração da virtualização
  const containerHeight = 600 // altura fixa para virtualização
  const containerWidth = 800 // largura fixa para virtualização
  
  const virtualizer = useMatrixVirtualizer({
    rowCount: result?.houses?.length || 0,
    columnCount: filteredWeeks.length,
    rowHeight: cellSize.height,
    columnWidth: cellSize.width,
    containerHeight: shouldVirtualize ? containerHeight : Infinity,
    containerWidth: shouldVirtualize ? containerWidth : Infinity,
    overscan: 10
  })

  return (
    <div className={cn("space-y-4", className)}>
      {/* Controls */}
      <IndustrialCard 
        title="Controles da Matriz"
        description="Ajuste a visualização e exporte os dados"
      >
        <div className="flex flex-wrap items-center gap-4">
          {/* Zoom controls */}
          <div className="flex items-center gap-2">
            <Label>Zoom:</Label>
            <IndustrialButton
              size="sm"
              variant="outline"
              icon={<ZoomOut className="h-3 w-3" />}
              onClick={() => handleZoomChange(zoom - 10)}
              disabled={zoom <= 5}
            />
            <Input
              type="range"
              min="20"
              max="150"
              value={zoom}
              onChange={(e) => handleZoomChange(parseInt(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-industrial-text-secondary w-12">
              {zoom}%
            </span>
            <IndustrialButton
              size="sm"
              variant="outline"
              icon={<ZoomIn className="h-3 w-3" />}
              onClick={() => handleZoomChange(zoom + 10)}
              disabled={zoom >= 120}
            />
          </div>

          {/* Filter controls */}
          <div className="flex items-center gap-2">
            <IndustrialButton
              size="sm"
              variant={showEmpty ? "default" : "outline"}
              icon={showEmpty ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              onClick={() => setShowEmpty(!showEmpty)}
            >
              {showEmpty ? 'Mostrar vazias' : 'Ocultar vazias'}
            </IndustrialButton>
          </div>

          {/* Export */}
          <IndustrialButton
            size="sm"
            variant="outline"
            icon={<Download className="h-3 w-3" />}
            onClick={handleExportCSV}
          >
            Exportar CSV
          </IndustrialButton>

          {/* Stats */}
          <div className="flex items-center gap-4 ml-auto">
            <Badge variant="outline">
              {result.houses.length} casas
            </Badge>
            <Badge variant="outline">
              {filteredWeeks.length} semanas
            </Badge>
            <Badge variant="outline">
              {result.calculationMetadata.totalPackages} pacotes
            </Badge>
            {shouldVirtualize && (
              <Badge variant="secondary">
                Virtualizada
              </Badge>
            )}
          </div>
        </div>
      </IndustrialCard>

      {/* Matrix */}
      <IndustrialCard className="overflow-hidden">
        <div
          ref={matrixRef}
          className="relative overflow-auto max-h-screen"
          style={{ maxHeight: 'calc(100vh - 300px)' }}
        >
          <div className="relative">
            {/* Headers row */}
            <div className="sticky top-0 z-10 bg-white border-b border-industrial-text-muted">
              <div className="flex">
                {/* Corner cell */}
                <div 
                  className="flex-shrink-0 bg-industrial-background-secondary border-r border-industrial-text-muted flex items-center justify-center font-medium text-industrial-text-primary"
                  style={{ width: cellSize.width, height: cellSize.height }}
                >
                  Casa
                </div>
                
                {/* Week headers */}
                {filteredWeeks.map((week, weekIndex) => {
                  const actualWeekIndex = showEmpty 
                    ? weekIndex 
                    : result.weeks.findIndex(w => w === week);
                  const weekMapping = result.weekDateMappings?.[actualWeekIndex];
                  
                  return (
                    <div
                      key={`week-${weekIndex}`}
                      className="flex-shrink-0 bg-industrial-background-secondary border-r border-industrial-text-muted flex flex-col items-center justify-center text-xs font-medium text-industrial-text-primary p-1"
                      style={{ width: cellSize.width, height: cellSize.height }}
                      title={weekMapping ? `${weekMapping.month}/${weekMapping.year}` : week}
                    >
                      <span className="text-[10px] leading-tight">{week}</span>
                      {weekMapping && (
                        <span className="text-[8px] text-industrial-text-secondary leading-tight">
                          {weekMapping.month.substring(0, 3)}/{weekMapping.year.toString().substring(2)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Matrix rows */}
            <div>
              {result.houses.slice().reverse().map((houseNumber, houseIndex) => {
                const actualHouseIndex = result.houses.length - 1 - houseIndex;
                return (
                <div key={`house-${houseNumber}`} className="flex border-b border-industrial-text-muted">
                  {/* House number header */}
                  <div 
                    className="flex-shrink-0 bg-industrial-background-secondary border-r border-industrial-text-muted flex items-center justify-center font-medium text-industrial-text-primary sticky left-0 z-10"
                    style={{ width: cellSize.width, height: cellSize.height }}
                  >
                    {houseNumber}
                  </div>
                  
                  {/* Cells for this house */}
                  {filteredWeeks.map((_, weekIndex) => {
                    const actualWeekIndex = showEmpty 
                      ? weekIndex 
                      : result.weeks.findIndex(w => w === filteredWeeks[weekIndex])
                    const cell = getCellContent(actualHouseIndex, actualWeekIndex)
                    
                    return (
                      <div
                        key={`cell-${houseIndex}-${weekIndex}`}
                        className={cn(
                          "flex-shrink-0 border-r border-industrial-text-muted cursor-pointer transition-all duration-150",
                          "hover:shadow-md hover:z-20 relative"
                        )}
                        style={{ width: cellSize.width, height: cellSize.height }}
                        onClick={() => setSelectedCell(cell)}
                        title={cell ? getCellTooltip(cell) : ''}
                      >
                        {cell ? (
                          <div
                            className="w-full h-full flex items-center justify-center text-xs font-medium text-white relative overflow-hidden"
                            style={{ 
                              backgroundColor: cell.color,
                              opacity: cell.reductionOpacity || 1
                            }}
                          >
                            {/* Reduction pattern overlay */}
                            {cell.isReduced && (
                              <div
                                className="absolute inset-0"
                                style={{ 
                                  backgroundImage: getReductionPattern(
                                    cell.reductionOpacity === 0.1 ? 0 : (cell.reductionOpacity || 1)
                                  )
                                }}
                              />
                            )}
                            
                            {/* Package name (abbreviated) */}
                            <span className="relative z-10 text-center leading-tight">
                              {cell.packageName.substring(0, 3)}
                            </span>
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gray-50" />
                        )}
                      </div>
                    )
                  })}
                </div>
              )})}
            </div>
          </div>
        </div>
      </IndustrialCard>

      {/* Cell details */}
      {selectedCell && (
        <IndustrialCard
          title={`Detalhes - Casa ${selectedCell.houseNumber}`}
          description={`Semana ${selectedCell.weekIndex + 1} - ${selectedCell.packageName}`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Pacote</Label>
              <p className="text-sm font-medium text-industrial-text-primary mt-1">
                {selectedCell.packageName}
              </p>
            </div>
            <div>
              <Label>Casa</Label>
              <p className="text-sm font-medium text-industrial-text-primary mt-1">
                {selectedCell.houseNumber}
              </p>
            </div>
            <div>
              <Label>Semana</Label>
              <p className="text-sm font-medium text-industrial-text-primary mt-1">
                {selectedCell.weekIndex + 1}
              </p>
            </div>
            <div>
              <Label>Custo</Label>
              <p className="text-sm font-medium text-industrial-text-primary mt-1">
                {selectedCell.cost ? `R$ ${selectedCell.cost.toFixed(2)}` : 'N/A'}
              </p>
            </div>
            {selectedCell.isReduced && (
              <div className="col-span-2 md:col-span-4">
                <Badge variant="destructive">
                  Período de redução aplicado
                </Badge>
              </div>
            )}
          </div>
        </IndustrialCard>
      )}
    </div>
  )
}

export const BaselineMatrix = React.memo(BaselineMatrixComponent)