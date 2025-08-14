'use client'

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Calendar, BarChart3 } from "lucide-react"

export type TimeUnit = 'weekly' | 'monthly' | 'quarterly' | 'yearly'

interface TimeUnitOption {
  value: TimeUnit
  label: string
  description: string
  icon: React.ReactNode
}

interface TimeUnitSelectorProps {
  value: TimeUnit
  onChange: (unit: TimeUnit) => void
  disabled?: boolean
  className?: string
}

const timeUnitOptions: TimeUnitOption[] = [
  {
    value: 'weekly',
    label: 'Semanal',
    description: 'Dados agrupados por semana',
    icon: <Calendar className="h-4 w-4" />
  },
  {
    value: 'monthly',
    label: 'Mensal',
    description: 'Dados agrupados por mês',
    icon: <BarChart3 className="h-4 w-4" />
  },
  {
    value: 'quarterly',
    label: 'Trimestral',
    description: 'Dados agrupados por trimestre',
    icon: <BarChart3 className="h-4 w-4" />
  },
  {
    value: 'yearly',
    label: 'Anual',
    description: 'Dados agrupados por ano',
    icon: <BarChart3 className="h-4 w-4" />
  }
]

export function TimeUnitSelector({ 
  value, 
  onChange, 
  disabled = false,
  className = "" 
}: TimeUnitSelectorProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <Label className="text-sm font-medium text-industrial-text-primary">
        Unidade Temporal
      </Label>
      
      <div className="flex flex-wrap gap-3">
        {timeUnitOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg border transition-all
              ${value === option.value
                ? 'bg-industrial-accent text-white border-industrial-accent shadow-md'
                : 'bg-white text-industrial-text-primary border-industrial-text-muted hover:border-industrial-accent hover:bg-industrial-background-secondary'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span className={value === option.value ? 'text-white' : 'text-industrial-accent'}>
              {option.icon}
            </span>
            <div className="text-left">
              <div className="text-sm font-medium">
                {option.label}
              </div>
              <div className={`text-xs ${
                value === option.value 
                  ? 'text-white/80' 
                  : 'text-industrial-text-secondary'
              }`}>
                {option.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}