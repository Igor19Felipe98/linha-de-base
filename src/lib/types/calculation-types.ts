/**
 * Tipos específicos para cálculos, substituindo usos de 'any'
 */

import { WorkPackage } from './index';

// Interface para cálculos de pacotes de trabalho
export interface WorkPackageCalculation extends WorkPackage {
  effectiveRhythm: number;
  effectiveDuration: number;
  startWeek: number;
  endWeek: number;
  isReduced: boolean;
  reductionFactor?: number;
}

// Interface para períodos de redução no cálculo
export interface CalculationReductionPeriod {
  month: string;
  coefficient: number;
  affectedWeeks: number[];
  type: 'stop' | 'partial';
}

// Interface para contexto de cálculo
export interface CalculationContext {
  currentWeek: number;
  currentHouse: number;
  totalWeeks: number;
  learningCurveActive: boolean;
  reductionPeriods: CalculationReductionPeriod[];
  metadata: {
    calculationStartTime: number;
    lastUpdateTime: number;
    iterationCount: number;
  };
}

// Interface para resultado de cálculo de casa
export interface HouseCalculationResult {
  houseNumber: number;
  packages: WorkPackageCalculation[];
  totalDuration: number;
  totalCost: number;
  startWeek: number;
  endWeek: number;
}

// Interface para props de tooltip nos gráficos
export interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    dataKey: string;
    fill: string;
    formatter?: (value: any, name: string) => [string, string];
    name: string;
    payload: any;
    stroke: string;
    strokeDasharray: string;
    type: string;
    unit: string;
    value: number;
  }>;
  label?: string | number;
  coordinate?: {
    x: number;
    y: number;
  };
}

// Interface para dados de validação
export interface ValidationContext {
  field: string;
  value: any;
  constraints: {
    min?: number;
    max?: number;
    required?: boolean;
    type?: 'number' | 'string' | 'date' | 'boolean';
    pattern?: RegExp;
  };
  customValidators?: Array<(value: any) => string | null>;
}

// Interface para resultado de validação
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  field: string;
}

// Interface para estado de cálculo
export interface CalculationState {
  status: 'idle' | 'calculating' | 'completed' | 'error';
  progress: number; // 0-100
  currentStep: string;
  estimatedTimeRemaining?: number; // em segundos
  error?: string;
}

// Interface para configurações de exportação
export interface ExportConfiguration {
  format: 'csv' | 'json' | 'xlsx';
  includeMetadata: boolean;
  includeEmptyCells: boolean;
  includeFinancialData: boolean;
  dateFormat: string;
  delimiter?: string; // para CSV
  compression?: boolean;
}

// Tipos auxiliares
export type CalculationPhase = 'initialization' | 'matrix-generation' | 'financial-calculation' | 'optimization' | 'finalization';

export type ReductionType = 'stop' | 'partial' | 'learning-curve';

export type ValidationSeverity = 'error' | 'warning' | 'info';