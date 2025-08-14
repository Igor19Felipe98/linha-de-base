'use client'

import * as React from "react"
import { useCalculationStatus } from "@/lib"
import { BaselineMatrix } from "@/components/charts"
import { RequiresCalculation } from "@/components"

export default function MatrixPage() {
  const { calculationResult } = useCalculationStatus()

  return (
    <RequiresCalculation
      fallbackTitle="Matriz indisponível"
      fallbackMessage="Execute o cálculo da linha de base para visualizar a matriz."
    >
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-industrial-text-primary">
            Matriz de Linha de Base
          </h1>
          <p className="text-industrial-text-secondary mt-1">
            Visualização interativa da matriz calculada
          </p>
        </div>

        {calculationResult && <BaselineMatrix result={calculationResult} />}
      </div>
    </RequiresCalculation>
  )
}