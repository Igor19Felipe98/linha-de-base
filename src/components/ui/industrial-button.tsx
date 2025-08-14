import * as React from "react"
import { Button, ButtonProps } from "./button"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export interface IndustrialButtonProps extends ButtonProps {
  loading?: boolean
  icon?: React.ReactNode
}

const IndustrialButton = React.forwardRef<HTMLButtonElement, IndustrialButtonProps>(
  ({ className, loading, icon, children, disabled, ...props }, ref) => {
    return (
      <Button
        className={cn(
          "font-semibold shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95",
          "border-2 border-transparent",
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        <div className="flex items-center gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            icon && <span className="flex-shrink-0">{icon}</span>
          )}
          {children && <span>{children}</span>}
        </div>
      </Button>
    )
  }
)
IndustrialButton.displayName = "IndustrialButton"

export { IndustrialButton }