import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"
import { cn } from "@/lib/utils"

export interface IndustrialCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  icon?: React.ReactNode
  status?: 'default' | 'success' | 'warning' | 'error'
}

const IndustrialCard = React.forwardRef<HTMLDivElement, IndustrialCardProps>(
  ({ className, title, description, icon, status = 'default', children, ...props }, ref) => {
    const statusColors = {
      default: "border-industrial-border-primary",
      success: "border-industrial-success border-2",
      warning: "border-industrial-warning border-2", 
      error: "border-industrial-accent border-2"
    }

    const statusBgs = {
      default: "",
      success: "bg-green-50",
      warning: "bg-yellow-50",
      error: "bg-red-50"
    }

    return (
      <Card
        ref={ref}
        className={cn(
          "transition-all duration-200 hover:industrial-shadow-lg industrial-shadow-sm",
          statusColors[status],
          statusBgs[status],
          className
        )}
        {...props}
      >
        {(title || description || icon) && (
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              {icon && (
                <div className="flex-shrink-0 text-industrial-primary">
                  {icon}
                </div>
              )}
              <div className="flex-1">
                {title && <CardTitle className="text-lg">{title}</CardTitle>}
                {description && <CardDescription>{description}</CardDescription>}
              </div>
            </div>
          </CardHeader>
        )}
        {children && (
          <CardContent>
            {children}
          </CardContent>
        )}
      </Card>
    )
  }
)
IndustrialCard.displayName = "IndustrialCard"

export { IndustrialCard }