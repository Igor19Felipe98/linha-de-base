import { CalculationResult, WeekDateMapping, FinancialWeekData } from '../types';
import { formatCurrency } from '../utils';

export type TimeUnit = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface TemporalData {
  period: string; // Nome do período (ex: "Jan/25", "2025-Q1", "Sem 1")
  fullPeriod: string; // Nome completo (ex: "Janeiro 2025", "1º Trimestre 2025", "Semana 1 - 06/01/2025")
  periodKey: string; // Chave única para ordenação
  year: number;
  periodNumber: number; // Número do período (mês: 1-12, trimestre: 1-4, semana: 1-n)
  periodCost: number;
  cumulativeCost: number;
  housesCompleted: number;
  activeDevelopments: number;
  weeklyDetails: {
    weekIndex: number;
    weekLabel: string;
    weeklyCost: number;
    activeHouses: number;
    startDate: string;
    endDate: string;
  }[];
}

export interface TemporalMetrics {
  totalProjectCost: number;
  projectDurationPeriods: number;
  projectDurationLabel: string; // ex: "12 meses", "4 trimestres", "52 semanas"
  leadTimeMin: number; // em semanas
  leadTimeMax: number; // em semanas
  totalHousesCompleted: number;
  averagePeriodCost: number;
  peakPeriodCost: number;
  peakActiveHouses: number;
}

export interface TemporalAnalytics {
  timeUnit: TimeUnit;
  temporalData: TemporalData[];
  temporalMetrics: TemporalMetrics;
}

/**
 * Calcula análise temporal flexível baseada na unidade temporal escolhida
 */
export function calculateTemporalAnalytics(
  result: CalculationResult, 
  timeUnit: TimeUnit
): TemporalAnalytics {
  
  const temporalMap = new Map<string, TemporalData>();
  
  // Agrupar dados por período temporal
  result.financialData.forEach((weekData) => {
    const weekMapping = result.weekDateMappings[weekData.weekIndex];
    if (!weekMapping) return;
    
    const { periodKey, period, fullPeriod, year, periodNumber } = getPeriodInfo(weekMapping, timeUnit);
    
    if (!temporalMap.has(periodKey)) {
      temporalMap.set(periodKey, {
        period,
        fullPeriod,
        periodKey,
        year,
        periodNumber,
        periodCost: 0,
        cumulativeCost: 0,
        housesCompleted: 0,
        activeDevelopments: 0,
        weeklyDetails: []
      });
    }
    
    const temporalData = temporalMap.get(periodKey)!;
    temporalData.periodCost += weekData.weeklyCost;
    temporalData.cumulativeCost = weekData.cumulativeCost;
    temporalData.activeDevelopments = Math.max(temporalData.activeDevelopments, weekData.activeHouses);
    
    temporalData.weeklyDetails.push({
      weekIndex: weekData.weekIndex,
      weekLabel: weekData.weekLabel,
      weeklyCost: weekData.weeklyCost,
      activeHouses: weekData.activeHouses,
      startDate: weekMapping.startDate,
      endDate: weekMapping.endDate
    });
  });
  
  // Calcular casas finalizadas por período
  calculateHousesCompletedPerPeriod(result, temporalMap, timeUnit);
  
  // Converter para array, filtrar períodos vazios e ordenar
  const temporalData = Array.from(temporalMap.values())
    .filter(period => 
      period.periodCost > 0 || 
      period.housesCompleted > 0 || 
      period.activeDevelopments > 0
    )
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.periodNumber - b.periodNumber;
    });
  
  // Calcular lead times
  const houseLeadTimes = calculateHouseLeadTimes(result);
  
  // Calcular duração do projeto
  const periodsWithActivity = temporalData.filter(period => 
    period.periodCost > 0 || period.housesCompleted > 0 || period.activeDevelopments > 0
  );
  const projectDurationPeriods = periodsWithActivity.length;
  const projectDurationLabel = getDurationLabel(projectDurationPeriods, timeUnit);
  
  // Calcular métricas
  const temporalMetrics: TemporalMetrics = {
    totalProjectCost: result.calculationMetadata.totalProjectCost,
    projectDurationPeriods,
    projectDurationLabel,
    leadTimeMin: houseLeadTimes.length > 0 ? Math.min(...houseLeadTimes) : 0,
    leadTimeMax: houseLeadTimes.length > 0 ? Math.max(...houseLeadTimes) : 0,
    totalHousesCompleted: temporalData.reduce((sum, period) => sum + period.housesCompleted, 0),
    averagePeriodCost: temporalData.length > 0 ? 
      temporalData.reduce((sum, period) => sum + period.periodCost, 0) / temporalData.length : 0,
    peakPeriodCost: temporalData.length > 0 ? Math.max(...temporalData.map(period => period.periodCost)) : 0,
    peakActiveHouses: temporalData.length > 0 ? Math.max(...temporalData.map(period => period.activeDevelopments)) : 0
  };
  
  return {
    timeUnit,
    temporalData,
    temporalMetrics
  };
}

/**
 * Obtém informações do período baseado na unidade temporal
 */
function getPeriodInfo(weekMapping: WeekDateMapping, timeUnit: TimeUnit) {
  const year = weekMapping.year;
  const monthNumber = getMonthNumber(weekMapping.month);
  
  switch (timeUnit) {
    case 'weekly':
      const weekNumber = weekMapping.weekIndex + 1;
      return {
        periodKey: `${year}-W${String(weekNumber).padStart(2, '0')}`,
        period: `Sem ${weekNumber}`,
        fullPeriod: `Semana ${weekNumber} - ${weekMapping.startDate}`,
        year,
        periodNumber: weekNumber
      };
      
    case 'monthly':
      return {
        periodKey: `${year}-${String(monthNumber).padStart(2, '0')}`,
        period: `${weekMapping.month.substring(0, 3)}/${year.toString().substring(2)}`,
        fullPeriod: `${weekMapping.month} ${year}`,
        year,
        periodNumber: monthNumber
      };
      
    case 'quarterly':
      const quarter = Math.ceil(monthNumber / 3);
      return {
        periodKey: `${year}-Q${quarter}`,
        period: `${year}-Q${quarter}`,
        fullPeriod: `${quarter}º Trimestre ${year}`,
        year,
        periodNumber: quarter
      };
      
    case 'yearly':
      return {
        periodKey: `${year}`,
        period: `${year}`,
        fullPeriod: `Ano ${year}`,
        year,
        periodNumber: 1 // Para anos, sempre 1 (facilita ordenação)
      };
      
    default:
      throw new Error(`Unidade temporal não suportada: ${timeUnit}`);
  }
}

/**
 * Calcula casas finalizadas por período
 */
function calculateHousesCompletedPerPeriod(
  result: CalculationResult,
  temporalMap: Map<string, TemporalData>,
  timeUnit: TimeUnit
) {
  result.matrix.forEach((houseCells) => {
    if (houseCells.length === 0) return;
    
    // Encontrar a última célula da casa
    const lastCell = houseCells.reduce((latest, cell) => 
      cell.weekIndex > latest.weekIndex ? cell : latest
    );
    
    const weekMapping = result.weekDateMappings[lastCell.weekIndex];
    if (!weekMapping) return;
    
    const { periodKey } = getPeriodInfo(weekMapping, timeUnit);
    const temporalData = temporalMap.get(periodKey);
    if (temporalData) {
      temporalData.housesCompleted++;
    }
  });
}

/**
 * Calcula lead time de cada casa em semanas
 */
function calculateHouseLeadTimes(result: CalculationResult): number[] {
  const leadTimes: number[] = [];
  
  result.matrix.forEach((houseCells) => {
    if (houseCells.length === 0) {
      return;
    }
    
    const firstWeek = Math.min(...houseCells.map(cell => cell.weekIndex));
    const lastWeek = Math.max(...houseCells.map(cell => cell.weekIndex));
    const leadTime = lastWeek - firstWeek + 1;
    leadTimes.push(leadTime);
  });
  
  return leadTimes.filter(lt => lt > 0);
}

/**
 * Converte nome do mês para número
 */
function getMonthNumber(monthName: string): number {
  const months: Record<string, number> = {
    'janeiro': 1, 'fevereiro': 2, 'março': 3, 'abril': 4,
    'maio': 5, 'junho': 6, 'julho': 7, 'agosto': 8,
    'setembro': 9, 'outubro': 10, 'novembro': 11, 'dezembro': 12
  };
  return months[monthName.toLowerCase()] || 1;
}

/**
 * Gera label de duração baseado na unidade temporal
 */
function getDurationLabel(periods: number, timeUnit: TimeUnit): string {
  switch (timeUnit) {
    case 'weekly':
      return `${periods} semana${periods !== 1 ? 's' : ''}`;
    case 'monthly':
      return `${periods} mês${periods !== 1 ? 'es' : ''}`;
    case 'quarterly':
      return `${periods} trimestre${periods !== 1 ? 's' : ''}`;
    case 'yearly':
      return `${periods} ano${periods !== 1 ? 's' : ''}`;
    default:
      return `${periods} período${periods !== 1 ? 's' : ''}`;
  }
}

/**
 * Formata dados temporais para exibição em gráficos
 */
export function formatTemporalDataForChart(temporalData: TemporalData[]) {
  return temporalData.map(period => ({
    name: period.period,
    fullName: period.fullPeriod,
    periodCost: period.periodCost,
    cumulativeCost: period.cumulativeCost,
    housesCompleted: period.housesCompleted,
    activeDevelopments: period.activeDevelopments,
    formattedPeriodCost: formatCurrency(period.periodCost),
    formattedCumulativeCost: formatCurrency(period.cumulativeCost)
  }));
}