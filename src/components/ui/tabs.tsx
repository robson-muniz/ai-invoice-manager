import * as React from "react"

interface TabsContextType {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined)

interface TabsProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

const Tabs = ({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  children,
  className = "",
}: TabsProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue)

  const value = controlledValue !== undefined ? controlledValue : internalValue

  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

const useTabsContext = () => {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error("Tabs components must be used within <Tabs>")
  }
  return context
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex space-x-1 border-b border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
)
TabsList.displayName = "TabsList"

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  children: React.ReactNode
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className = "", value, children, ...props }, ref) => {
    const { value: activeValue, onValueChange } = useTabsContext()
    const isActive = activeValue === value

    return (
      <button
        ref={ref}
        onClick={() => onValueChange(value)}
        className={`px-4 py-2 font-medium text-sm transition-colors relative ${
          isActive
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-600 hover:text-gray-900"
        } ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  children: React.ReactNode
}

const TabsContent = ({ value, children, className = "", ...props }: TabsContentProps) => {
  const { value: activeValue } = useTabsContext()

  if (activeValue !== value) return null

  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
