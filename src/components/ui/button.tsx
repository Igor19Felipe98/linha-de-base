import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    
    const variants = {
      default: "bg-industrial-accent text-white hover:bg-industrial-accent-dark shadow-sm hover:shadow transition-all duration-200",
      destructive: "bg-industrial-accent-dark text-white hover:bg-red-800 shadow-sm hover:shadow transition-all duration-200",
      outline: "border border-industrial-accent bg-transparent text-industrial-accent hover:bg-industrial-accent hover:text-white transition-all duration-200",
      secondary: "bg-industrial-background-secondary text-industrial-text-primary hover:bg-industrial-background-tertiary border border-industrial-border-primary shadow-sm transition-all duration-200",
      ghost: "hover:bg-industrial-background-secondary hover:text-industrial-text-primary transition-all duration-200",
      link: "text-industrial-accent underline-offset-4 hover:underline hover:text-industrial-accent-dark transition-colors",
    }
    
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    }
    
    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }