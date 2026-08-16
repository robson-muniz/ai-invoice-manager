import * as React from "react"
import {
  useForm as useReactHookForm,
  FieldValues,
  FormProvider,
  useFormContext,
  Controller,
  type Control,
  type ControllerFieldState,
  type ControllerRenderProps,
  FieldPath,
} from "react-hook-form"

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode
}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ children, ...props }, ref) => (
    <form ref={ref} {...props}>
      {children}
    </form>
  )
)
Form.displayName = "Form"

interface FormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> {
  name: TName
  control: Control<TFieldValues>
  render: ({
    field,
    fieldState,
  }: {
    field: ControllerRenderProps<TFieldValues, TName>
    fieldState: ControllerFieldState
  }) => React.ReactElement
}

const FormField = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  name,
  control,
  render,
}: FormFieldProps<TFieldValues, TName>) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState }) => render({ field, fieldState })}
  />
)
FormField.displayName = "FormField"

interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className = "", children, ...props }, ref) => (
    <div ref={ref} className={`space-y-1 ${className}`} {...props}>
      {children}
    </div>
  )
)
FormItem.displayName = "FormItem"

interface FormLabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
}

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className = "", ...props }, ref) => (
    <label
      ref={ref}
      className={`text-sm font-medium text-gray-700 ${className}`}
      {...props}
    />
  )
)
FormLabel.displayName = "FormLabel"

interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  ({ className = "", children, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  )
)
FormControl.displayName = "FormControl"

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode
}

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={`text-xs text-red-600 ${className}`}
        {...props}
      >
        {children}
      </p>
    )
  }
)
FormMessage.displayName = "FormMessage"

export {
  useReactHookForm,
  FormProvider,
  useFormContext,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
}
