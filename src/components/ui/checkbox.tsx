import * as React from "react"

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", checked, onChange, onCheckedChange, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={(e) => {
        onChange?.(e)
        onCheckedChange?.(e.target.checked)
      }}
      className={`h-4 w-4 rounded border border-gray-300 bg-white accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
