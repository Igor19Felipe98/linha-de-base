import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: "bg-industrial-primary text-white hover:bg-blue-800",
    secondary: "bg-industrial-background-secondary text-industrial-text-primary hover:bg-gray-300",
    destructive: "bg-industrial-accent text-white hover:bg-red-700",
    outline: "text-industrial-text-primary border border-industrial-text-muted",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }