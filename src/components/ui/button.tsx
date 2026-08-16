import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "destructive" | "secondary"
  size?: "sm" | "md" | "lg"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "md", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const baseStyles = "inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    
    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600",
      outline: "border border-gray-300 bg-white hover:bg-gray-50 focus-visible:ring-gray-300",
      destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
      secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-200",
    }

    const sizes = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-base",
      lg: "h-12 px-6 text-lg",
    }

    return (
      <Comp
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
