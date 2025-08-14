import { CalculationResult, WeekDateMapping, FinancialWeekData, MatrixCell } from '../types';
import { formatCurrency } from '../utils';

export interface MonthlyData {
  month: string;
  year: number;
  monthKey: string;
  monthlyCost: number;
  cumulativeCost: number;
  housesCompleted: number;
  activeDevelopments: number;
  weeklyDetails: {
    weekIndex: number;
    weekLabel: string;
    weeklyCost: number;
    activeHouses: number;
  }[];
}

export interface ProjectMetrics {
  totalProjectCost: number;
  projectDurationMonths: number;
  leadTimeMin: number; // semanas
  leadTimeMax: number; // semanas
  totalHousesCompleted: number;
  averageMonthlyCost: number;
  peakMonthlyCost: number;
  peakActiveHouses: number;
}

export interface MonthlyAnalytics {
  monthlyData: MonthlyData[];
  projectMetrics: ProjectMetrics;
}

/**
 * Calcula dados mensais agregados a partir dos resultados de cálculo
 */
export function calculateMonthlyAnalytics(result: CalculationResult): MonthlyAnalytics {
  const monthlyMap = new Map<string, MonthlyData>();
  
  // Primeiro, agrupar dados semanais por mês
  result.financialData.forEach((weekData, index) => {
    const weekMapping = result.weekDateMappings[weekData.weekIndex];
    if (!weekMapping) return;
    
    const monthKey = `${weekMapping.year}-${String(getMonthNumber(weekMapping.month)).padStart(2, '0')}`;
    
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        month: weekMapping.month,
        year: weekMapping.year,
        monthKey,
        monthlyCost: 0,
        cumulativeCost: 0,
        housesCompleted: 0,
        activeDevelopments: 0,
        weeklyDetails: []
      });
    }
    
    const monthData = monthlyMap.get(monthKey)!;
    monthData.monthlyCost += weekData.weeklyCost;
    monthData.cumulativeCost = weekData.cumulativeCost; // Último valor acumulado do mês
    monthData.activeDevelopments = Math.max(monthData.activeDevelopments, weekData.activeHouses);
    
    monthData.weeklyDetails.push({
      weekIndex: weekData.weekIndex,
      weekLabel: weekData.weekLabel,
      weeklyCost: weekData.weeklyCost,
      activeHouses: weekData.activeHouses
    });
  });
  
  // Calcular casas finalizadas por mês
  calculateHousesCompletedPerMonth(result, monthlyMap);
  
  // Converter para array e ordenar
  const monthlyData = Array.from(monthlyMap.values()).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return getMonthNumber(a.month) - getMonthNumber(b.month);
  });
  
  // Calcular lead times (tempo total de cada casa)
  const houseLeadTimes = calculateHouseLeadTimes(result);
  
  // Calcular duração real do projeto em meses (considerando apenas meses com atividade)
  const monthsWithActivity = monthlyData.filter(month => 
    month.monthlyCost > 0 || month.housesCompleted > 0 || month.activeDevelopments > 0
  );
  const projectDurationMonths = monthsWithActivity.length;
  
  // Calcular métricas agregadas
  const projectMetrics: ProjectMetrics = {
    totalProjectCost: result.calculationMetadata.totalProjectCost,
    projectDurationMonths,
    leadTimeMin: Math.min(...houseLeadTimes),
    leadTimeMax: Math.max(...houseLeadTimes),
    totalHousesCompleted: monthlyData.reduce((sum, month) => sum + month.housesCompleted, 0),
    averageMonthlyCost: monthlyData.length > 0 ? 
      monthlyData.reduce((sum, month) => sum + month.monthlyCost, 0) / monthlyData.length : 0,
    peakMonthlyCost: Math.max(...monthlyData.map(month => month.monthlyCost)),
    peakActiveHouses: Math.max(...monthlyData.map(month => month.activeDevelopments))
  };
  
  return {
    monthlyData,
    projectMetrics
  };
}

/**
 * Calcula o lead time (duração total) de cada casa em semanas
 */
function calculateHouseLeadTimes(result: CalculationResult): number[] {
  const leadTimes: number[] = [];
  
  result.matrix.forEach((houseCells, houseIndex) => {
    if (houseCells.length === 0) {
      leadTimes.push(0);
      return;
    }
    
    // Encontrar primeira e última semana da casa
    const firstWeek = Math.min(...houseCells.map(cell => cell.weekIndex));
    const lastWeek = Math.max(...houseCells.map(cell => cell.weekIndex));
    
    // Lead time = última semana - primeira semana + 1
    const leadTime = lastWeek - firstWeek + 1;
    leadTimes.push(leadTime);
  });
  
  return leadTimes.filter(lt => lt > 0); // Remover casas sem atividade
}

/**
 * Calcula quantas casas são finalizadas em cada mês
 */
function calculateHousesCompletedPerMonth(
  result: CalculationResult, 
  monthlyMap: Map<string, MonthlyData>
) {
  // Para cada casa, encontrar quando ela completa o último pacote
  result.matrix.forEach((houseCells, houseIndex) => {
    if (houseCells.length === 0) return;
    
    // Encontrar a última célula da casa (último pacote concluído)
    const lastCell = houseCells.reduce((latest, cell) => 
      cell.weekIndex > latest.weekIndex ? cell : latest
    );
    
    const weekMapping = result.weekDateMappings[lastCell.weekIndex];
    if (!weekMapping) return;
    
    const monthKey = `${weekMapping.year}-${String(getMonthNumber(weekMapping.month)).padStart(2, '0')}`;
    const monthData = monthlyMap.get(monthKey);
    if (monthData) {
      monthData.housesCompleted++;
    }
  });
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
 * Formata dados mensais para exibição em gráficos
 */
export function formatMonthlyDataForChart(monthlyData: MonthlyData[]) {
  return monthlyData.map(month => ({
    name: `${month.month.substring(0, 3)}/${month.year.toString().substring(2)}`,
    fullName: `${month.month} ${month.year}`,
    monthlyCost: month.monthlyCost,
    cumulativeCost: month.cumulativeCost,
    housesCompleted: month.housesCompleted,
    activeDevelopments: month.activeDevelopments,
    formattedMonthlyCost: formatCurrency(month.monthlyCost),
    formattedCumulativeCost: formatCurrency(month.cumulativeCost)
  }));
}