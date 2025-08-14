import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle, AlertCircle, Info, XCircle } from "lucide-react"

export interface FeedbackMessageProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  className?: string
}

const FeedbackMessage: React.FC<FeedbackMessageProps> = ({ 
  type, 
  title, 
  message, 
  className 
}) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  }

  const styles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800", 
    info: "bg-blue-50 border-blue-200 text-blue-800"
  }

  const iconStyles = {
    success: "text-green-500",
    error: "text-red-500",
    warning: "text-yellow-500",
    info: "text-blue-500"
  }

  const Icon = icons[type]

  return (
    <div className={cn(
      "rounded-md border p-4",
      styles[type],
      className
    )}>
      <div className="flex gap-3">
        <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", iconStyles[type])} />
        <div className="flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <p className="text-sm">
            {message}
          </p>
        </div>
      </div>
    </div>
  )
}

export { FeedbackMessage }