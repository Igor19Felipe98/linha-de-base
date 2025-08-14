/**
 * Funções utilitárias para validações comuns
 */

import { MAX_HOUSES_LIMIT, MIN_HOUSES_LIMIT, ERROR_MESSAGES } from '../constants';

/**
 * Valida quantidade de casas
 */
export const validateHousesCount = (count: number): boolean => {
  return count >= MIN_HOUSES_LIMIT && count <= MAX_HOUSES_LIMIT;
};

/**
 * Obtém erro de validação para quantidade de casas
 */
export const getHousesCountError = (count: number): string | null => {
  if (!validateHousesCount(count)) {
    return ERROR_MESSAGES.INVALID_HOUSES_COUNT;
  }
  return null;
};

/**
 * Valida se um valor está dentro de uma faixa
 */
export const validateRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Gera mensagem de erro para validação de faixa
 */
export const getRangeError = (fieldName: string, min: number, max: number): string => {
  return `${fieldName} deve estar entre ${min} e ${max}`;
};