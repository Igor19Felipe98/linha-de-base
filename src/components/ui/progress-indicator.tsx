import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle, Circle, AlertCircle } from "lucide-react"

export interface ProgressIndicatorProps {
  steps: {
    label: string
    status: 'pending' | 'completed' | 'error'
    description?: string
  }[]
  className?: string
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ steps, className }) => {
  return (
    <div className={cn("space-y-4", className)}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {step.status === 'completed' && (
              <CheckCircle className="h-5 w-5 text-industrial-success" />
            )}
            {step.status === 'pending' && (
              <Circle className="h-5 w-5 text-industrial-text-muted" />
            )}
            {step.status === 'error' && (
              <AlertCircle className="h-5 w-5 text-industrial-accent" />
            )}
          </div>
          <div className="flex-1">
            <p className={cn(
              "text-sm font-medium",
              step.status === 'completed' && "text-industrial-success",
              step.status === 'pending' && "text-industrial-text-secondary",
              step.status === 'error' && "text-industrial-accent"
            )}>
              {step.label}
            </p>
            {step.description && (
              <p className="text-xs text-industrial-text-muted mt-1">
                {step.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export { ProgressIndicator }