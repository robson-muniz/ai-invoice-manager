import * as React from "react"

interface SelectContextType {
  value: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onValueChange: (value: string) => void
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined)

interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const Select = ({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  open: controlledOpen,
  onOpenChange,
  children,
}: SelectProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const [internalOpen, setInternalOpen] = React.useState(false)

  const value = controlledValue !== undefined ? controlledValue : internalValue
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen

  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
    if (controlledOpen === undefined) {
      setInternalOpen(false)
    } else {
      onOpenChange?.(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen)
    } else {
      onOpenChange?.(newOpen)
    }
  }

  return (
    <SelectContext.Provider
      value={{
        value,
        open,
        onOpenChange: handleOpenChange,
        onValueChange: handleValueChange,
      }}
    >
      {children}
    </SelectContext.Provider>
  )
}

const useSelectContext = () => {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error("Select components must be used within <Select>")
  }
  return context
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className = "", ...props }, ref) => {
    const { open, onOpenChange } = useSelectContext()

    return (
      <button
        ref={ref}
        onClick={() => onOpenChange(!open)}
        className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      />
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string
}

const SelectValue = ({ placeholder = "Select...", ...props }: SelectValueProps) => {
  const { value } = useSelectContext()
  return <span {...props}>{value || placeholder}</span>
}
SelectValue.displayName = "SelectValue"

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className = "", children, ...props }, ref) => {
    const { open } = useSelectContext()

    if (!open) return null

    return (
      <div
        ref={ref}
        className={`absolute top-full z-50 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg ${className}`}
        {...props}
      >
        <div className="max-h-60 overflow-auto">{children}</div>
      </div>
    )
  }
)
SelectContent.displayName = "SelectContent"

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  children: React.ReactNode
}

const SelectItem = ({ value, children, className = "", ...props }: SelectItemProps) => {
  const { value: selectedValue, onValueChange } = useSelectContext()
  const isSelected = selectedValue === value

  return (
    <div
      onClick={() => onValueChange(value)}
      className={`cursor-pointer px-3 py-2 hover:bg-gray-100 ${
        isSelected ? "bg-blue-50 text-blue-900" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
SelectItem.displayName = "SelectItem"

interface SelectControlProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const SelectControl = ({ className = "", children, ...props }: SelectControlProps) => (
  <div className={`relative ${className}`} {...props}>
    {children}
  </div>
)
SelectControl.displayName = "SelectControl"

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectControl,
}
