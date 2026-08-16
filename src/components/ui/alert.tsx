import * as React from "react"

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive"
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-blue-50 border border-blue-200 text-blue-900",
      destructive: "bg-red-50 border border-red-200 text-red-900",
    }

    return (
      <div
        ref={ref}
        className={`rounded-lg p-4 ${variants[variant]} ${className}`}
        {...props}
      />
    )
  }
)
Alert.displayName = "Alert"

const AlertDescription = ({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`text-sm ${className}`} {...props} />
)
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertDescription }
