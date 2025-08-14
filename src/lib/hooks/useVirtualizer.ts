import { useMemo, useState, useCallback, useEffect } from 'react'

interface VirtualizerOptions {
  itemCount: number
  itemHeight: number
  containerHeight: number
  overscan?: number
}

interface VirtualizerResult {
  totalHeight: number
  startIndex: number
  endIndex: number
  visibleItems: Array<{
    index: number
    offsetTop: number
  }>
}

export function useVirtualizer({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 5
}: VirtualizerOptions): VirtualizerResult {
  const [scrollTop, setScrollTop] = useState(0)

  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLElement
    setScrollTop(target.scrollTop)
  }, [])

  const result = useMemo<VirtualizerResult>(() => {
    const totalHeight = itemCount * itemHeight
    
    // Calcular quais itens estão visíveis
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      itemCount - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )

    // Gerar lista de itens visíveis com suas posições
    const visibleItems = []
    for (let i = startIndex; i <= endIndex; i++) {
      visibleItems.push({
        index: i,
        offsetTop: i * itemHeight
      })
    }

    return {
      totalHeight,
      startIndex,
      endIndex,
      visibleItems
    }
  }, [itemCount, itemHeight, containerHeight, scrollTop, overscan])

  return result
}

/**
 * Hook específico para virtualização de matriz com células de tamanho variável
 */
export function useMatrixVirtualizer({
  rowCount,
  columnCount,
  rowHeight,
  columnWidth,
  containerHeight,
  containerWidth,
  overscan = 5
}: {
  rowCount: number
  columnCount: number
  rowHeight: number
  columnWidth: number
  containerHeight: number
  containerWidth: number
  overscan?: number
}) {
  const [scrollTop, setScrollTop] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLElement
    setScrollTop(target.scrollTop)
    setScrollLeft(target.scrollLeft)
  }, [])

  const result = useMemo(() => {
    // Calcular linhas visíveis
    const startRowIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
    const endRowIndex = Math.min(
      rowCount - 1,
      Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
    )

    // Calcular colunas visíveis
    const startColumnIndex = Math.max(0, Math.floor(scrollLeft / columnWidth) - overscan)
    const endColumnIndex = Math.min(
      columnCount - 1,
      Math.ceil((scrollLeft + containerWidth) / columnWidth) + overscan
    )

    // Gerar células visíveis
    const visibleCells = []
    for (let rowIndex = startRowIndex; rowIndex <= endRowIndex; rowIndex++) {
      for (let columnIndex = startColumnIndex; columnIndex <= endColumnIndex; columnIndex++) {
        visibleCells.push({
          rowIndex,
          columnIndex,
          offsetTop: rowIndex * rowHeight,
          offsetLeft: columnIndex * columnWidth
        })
      }
    }

    return {
      totalHeight: rowCount * rowHeight,
      totalWidth: columnCount * columnWidth,
      startRowIndex,
      endRowIndex,
      startColumnIndex,
      endColumnIndex,
      visibleCells,
      handleScroll
    }
  }, [
    rowCount,
    columnCount,
    rowHeight,
    columnWidth,
    containerHeight,
    containerWidth,
    scrollTop,
    scrollLeft,
    overscan
  ])

  return result
}