import { useState, useEffect } from 'react'

/**
 * Hook para debounce de valores
 * @param value - Valor a ser debouncado
 * @param delay - Delay em millisegundos (padrão: 300ms)
 * @returns Valor debouncado
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook para inputs debouncados com controle de estado local
 * @param initialValue - Valor inicial
 * @param onDebouncedChange - Callback executado quando o valor debounced muda
 * @param delay - Delay em millisegundos (padrão: 300ms)
 * @returns [valor atual, setter, valor debouncado]
 */
export function useDebouncedInput<T>(
  initialValue: T,
  onDebouncedChange: (value: T) => void,
  delay: number = 300
): [T, (value: T) => void, T] {
  const [value, setValue] = useState<T>(initialValue)
  const debouncedValue = useDebounce(value, delay)

  useEffect(() => {
    if (debouncedValue !== initialValue) {
      onDebouncedChange(debouncedValue)
    }
  }, [debouncedValue, onDebouncedChange, initialValue])

  return [value, setValue, debouncedValue]
}