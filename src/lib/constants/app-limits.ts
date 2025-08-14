/**
 * Constantes de limites e configurações da aplicação
 * Centralizadas para facilitar manutenção e configuração
 */

// Limites de projeto
export const MAX_HOUSES_LIMIT = 9999 as const;
export const MIN_HOUSES_LIMIT = 1 as const;

// Configurações de interface
export const ZOOM_LIMITS = {
  MIN: 5,
  MAX: 120,
  DEFAULT: 10
} as const;

// Configurações de cálculo
export const CALCULATION_LIMITS = {
  MIN_ESTIMATED_WEEKS: 200,
  MAX_CALCULATION_ATTEMPTS: 3,
  MAX_SAFETY_WEEKS: 500,
  ESTIMATION_MULTIPLIER: 3,
  DEFAULT_TOTAL_HOUSES: 300,
  WEEKS_PER_PERIOD: 7
} as const;

// Configurações de validação
export const VALIDATION_RULES = {
  REQUIRED_START_DAY: 1, // Segunda-feira (0 = Domingo, 1 = Segunda)
  MIN_COEFFICIENT: 0.01,
  MAX_COEFFICIENT: 0.99,
  MIN_DURATION: 0.1, // semanas (0.1 = menos de 1 dia)
  MAX_DURATION: 52, // semanas (1 ano)
  MIN_RHYTHM: 1, // casas por semana
  MAX_RHYTHM: 100, // casas por semana
  MIN_LATENCY: 0, // semanas
  MAX_LATENCY: 52 // semanas (1 ano)
} as const;

// Configurações da curva de aprendizado
export const LEARNING_CURVE_DEFAULTS = {
  INITIAL_RHYTHM_REDUCTION: 0.60, // 60% do ritmo inicial
  WEEKLY_INCREMENT: 0.20,         // 20% de melhoria por período
  DURATION_MULTIPLIER: 2.00,      // Dobro da duração inicial
  RHYTHM_IMPACT_WEEKS: 6,         // Semanas de impacto no ritmo
  PERIOD_WEEKS: 4,                // Período de avaliação em semanas
  SECOND_PERIOD_WEEKS: 8,         // Segundo período (dobro do primeiro)
  DURATION_IMPACT_WEEKS: 6,       // Semanas de impacto na duração
  FULL_PRODUCTIVITY_MULTIPLIER: 1.0, // Produtividade total
  MIN_RHYTHM_PER_WEEK: 1          // Mínimo de 1 casa por semana
} as const;

// Nomes dos dias da semana para validação
export const DAY_NAMES = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 
  'Quinta-feira', 'Sexta-feira', 'Sábado'
] as const;

// Mensagens de erro padronizadas
export const ERROR_MESSAGES = {
  INVALID_HOUSES_COUNT: `Número de casas deve estar entre ${MIN_HOUSES_LIMIT} e ${MAX_HOUSES_LIMIT}`,
  INVALID_START_DAY: `Data de início deve ser uma ${DAY_NAMES[VALIDATION_RULES.REQUIRED_START_DAY]}`,
  INVALID_COEFFICIENT: `Coeficiente deve estar entre ${VALIDATION_RULES.MIN_COEFFICIENT} e ${VALIDATION_RULES.MAX_COEFFICIENT}`,
  INVALID_DURATION: `Duração deve estar entre ${VALIDATION_RULES.MIN_DURATION} e ${VALIDATION_RULES.MAX_DURATION} semanas`,
  INVALID_RHYTHM: `Ritmo deve estar entre ${VALIDATION_RULES.MIN_RHYTHM} e ${VALIDATION_RULES.MAX_RHYTHM} casas por semana`,
  INVALID_LATENCY: `Latência deve estar entre ${VALIDATION_RULES.MIN_LATENCY} e ${VALIDATION_RULES.MAX_LATENCY} semanas`
} as const;