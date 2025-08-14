/**
 * Utility functions for generating IDs and other random values
 */

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const generateUniqueId = (prefix?: string): string => {
  const id = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}-${id}` : id;
};