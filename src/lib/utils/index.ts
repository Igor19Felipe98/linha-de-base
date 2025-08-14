import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Re-export generators
export * from './generators';

export const months = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

export const validateDateFormat = (dateString: string): boolean => {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(dateString)) return false;
  
  const [day, month, year] = dateString.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  
  return date.getFullYear() === year &&
         date.getMonth() === month - 1 &&
         date.getDate() === day;
};

export const convertDateToISO = (dateString: string): string => {
  const [day, month, year] = dateString.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

export const convertDateFromISO = (isoString: string): string => {
  const [year, month, day] = isoString.split('-');
  return `${day}/${month}/${year}`;
};

export const isValidRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

export const roundToDecimals = (value: number, decimals: number): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Re-export theme utilities
export * from './theme';

// Re-export validation utilities
export * from './validation';

// Re-export spreadsheet utilities
export * from './spreadsheet';

// Re-export import helpers
export * from './import-helpers';