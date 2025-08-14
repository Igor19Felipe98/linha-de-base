export interface WorkPackage {
  name: string;
  duration: number;    // semanas para completar o pacote em uma casa
  rhythm: number;      // casas que podem iniciar simultaneamente por semana
  latency: number;     // semanas de espera até próximo pacote iniciar
  color: string;       // cor para visualização na matriz
  cost: number;        // custo por casa (R$)
}

export interface StopPeriod {
  id: string;
  month: string;       // ex: "dezembro" - aplicado todos os anos
  coefficient: 0;      // sempre 0 para parada total
  description?: string;
}

export interface PartialReductionPeriod {
  id: string;
  month: string;       // ex: "janeiro" - aplicado todos os anos
  coefficient: number; // 0.01-0.99
  description?: string;
}

export interface LearningCurve {
  rhythmReducer: number;      // redutor inicial (ex: 0.60)
  increment: number;          // acréscimo por período (ex: 0.20)
  periodWeeks: number;        // período em semanas (ex: 4)
  durationMultiplier: number; // multiplicador duração (ex: 2.00)
  durationImpactWeeks?: number; // semanas impactadas na duração (ex: 6)
  appliedPackages?: string[]; // nomes dos pacotes onde a curva deve ser aplicada (vazio = todos)
}

export interface ProjectData {
  housesCount: number;
  startDate: string;    // formato YYYY-MM-DD
  stopPeriods: StopPeriod[];
  partialReductionPeriods: PartialReductionPeriod[];
  workPackages: WorkPackage[];
  learningCurve: LearningCurve;
}

export interface MatrixCell {
  houseNumber: number;
  weekIndex: number;
  packageName: string;
  color: string;
  isReduced?: boolean;
  reductionOpacity?: number;
  cost?: number;
}

export interface WeekDateMapping {
  weekIndex: number;
  startDate: string;
  endDate: string;
  weekLabel: string;
  month: string;
  year: number;
}

export interface FinancialWeekData {
  weekIndex: number;
  weekLabel: string;
  weeklyCost: number;
  cumulativeCost: number;
  activeHouses: number;
  packageCosts: Record<string, number>;
}

export interface CalculationResult {
  matrix: MatrixCell[][];
  weeks: string[];
  houses: number[];
  weekDateMappings: WeekDateMapping[];
  financialData: FinancialWeekData[];
  calculationMetadata: {
    totalProjectDuration: number;
    totalPackages: number;
    reductionPeriods: number;
    calculatedAt: string;
    baseDate: string;
    totalProjectCost: number;
  };
}

// Tipos auxiliares para UI
export interface ValidationError {
  field: string;
  message: string;
}

export interface ProjectConfigStatus {
  isBasicDataValid: boolean;
  isPackagesValid: boolean;
  isPeriodsValid: boolean;
  isLearningCurveValid: boolean;
  canCalculate: boolean;
}

export interface ExportOptions {
  format: 'csv' | 'json';
  includeEmptyCells: boolean;
  includeFinancialData: boolean;
}

// Tipos para gerenciamento de cenários
export interface SavedScenario {
  id: string;
  name: string;
  description?: string;
  projectData: ProjectData;
  calculationResult: CalculationResult;
  createdAt: string;
  updatedAt: string;
  version: number;
  storageLocation?: 'supabase' | 'local';
}

export interface ScenarioMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  housesCount: number;
  totalCost: number;
  duration: number;
  packagesCount: number;
  storageLocation?: 'supabase' | 'local';
}

// Re-export calculation types
export * from './calculation-types';

// Re-export UI types
export * from './ui-types';