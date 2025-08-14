import React from 'react'
import { Input } from './input'
import { useDebounce } from '@/lib'

interface DebouncedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string
  onChange: (value: string) => void
  delay?: number
}

export const DebouncedInput = React.memo(({ 
  value, 
  onChange, 
  delay = 300, 
  ...props 
}: DebouncedInputProps) => {
  const [localValue, setLocalValue] = React.useState(value)
  const debouncedValue = useDebounce(localValue, delay)

  // Sincronizar com valor externo quando mudado externamente
  React.useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Chamar onChange quando valor debounced mudar
  React.useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue)
    }
  }, [debouncedValue, onChange, value])

  return (
    <Input
      {...props}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
    />
  )
})