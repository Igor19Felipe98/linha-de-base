import { 
  ProjectData, 
  CalculationResult, 
  MatrixCell, 
  WeekDateMapping, 
  FinancialWeekData,
  WorkPackage,
  LearningCurve,
  StopPeriod,
  PartialReductionPeriod,
} from '../types';
import { formatWeekLabel, getReductionOpacity, roundToDecimals } from '../utils';
import { 
  MAX_HOUSES_LIMIT, 
  ERROR_MESSAGES, 
  CALCULATION_LIMITS, 
  LEARNING_CURVE_DEFAULTS 
} from '../constants';

export function calculateBaseline(data: ProjectData): CalculationResult {
  // 1. Validar dados de entrada
  if (!validateProjectData(data)) {
    throw new Error('Dados do projeto inválidos');
  }

  // 2. Calcular mapeamentos de datas
  const weekDateMappings = calculateWeekDateMappings(data);
  
  // 3. Calcular matriz base
  const { matrix, totalWeeks } = calculateMatrix(data, weekDateMappings);
  
  // 4. Calcular dados financeiros
  const financialData = calculateFinancialData(matrix, weekDateMappings, data.workPackages);
  
  // 5. Preparar resultado
  const weeks = Array.from({ length: totalWeeks }, (_, i) => formatWeekLabel(i));
  const houses = Array.from({ length: data.housesCount }, (_, i) => i + 1);
  
  const calculationMetadata = {
    totalProjectDuration: totalWeeks,
    totalPackages: data.workPackages.length,
    reductionPeriods: data.stopPeriods.length + data.partialReductionPeriods.length,
    calculatedAt: new Date().toISOString(),
    baseDate: data.startDate,
    totalProjectCost: financialData[financialData.length - 1]?.cumulativeCost || 0
  };

  return {
    matrix,
    weeks,
    houses,
    weekDateMappings,
    financialData,
    calculationMetadata
  };
}

function validateProjectData(data: ProjectData): boolean {
  if (data.housesCount <= 0 || data.housesCount > MAX_HOUSES_LIMIT) return false;
  if (!data.startDate) return false;
  if (data.workPackages.length === 0) return false;
  
  return data.workPackages.every(pkg => 
    pkg.duration > 0 && pkg.rhythm > 0 && pkg.cost >= 0
  );
}

function calculateWeekDateMappings(data: ProjectData): WeekDateMapping[] {
  const startDate = new Date(data.startDate);
  const mappings: WeekDateMapping[] = [];
  
  // Calcular número estimado de semanas necessárias com margem generosa
  const totalPackageWeeks = data.workPackages.reduce((sum, pkg) => sum + pkg.duration + pkg.latency, 0);
  const minRhythm = Math.min(...data.workPackages.map(pkg => pkg.rhythm));
  
  // Estimação mais conservadora para evitar parar na semana 98
  const baseEstimate = Math.ceil(data.housesCount / minRhythm) + totalPackageWeeks;
  const estimatedWeeks = Math.max(CALCULATION_LIMITS.MIN_ESTIMATED_WEEKS, baseEstimate * CALCULATION_LIMITS.ESTIMATION_MULTIPLIER);
  
  for (let weekIndex = 0; weekIndex < estimatedWeeks; weekIndex++) {
    const weekStartDate = new Date(startDate);
    weekStartDate.setDate(startDate.getDate() + (weekIndex * 7));
    
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);
    
    mappings.push({
      weekIndex,
      startDate: weekStartDate.toISOString().split('T')[0],
      endDate: weekEndDate.toISOString().split('T')[0],
      weekLabel: formatWeekLabel(weekIndex),
      month: weekStartDate.toLocaleString('pt-BR', { month: 'long' }),
      year: weekStartDate.getFullYear()
    });
  }
  
  return mappings;
}

// NOVA LÓGICA BASEADA NO COMPORTAMENTO CORRETO ESPECIFICADO
function calculateMatrix(data: ProjectData, weekMappings: WeekDateMapping[]): { matrix: MatrixCell[][], totalWeeks: number } {
  const matrix: MatrixCell[][] = Array.from({ length: data.housesCount }, () => []);
  let maxWeekUsed = 0;
  
  // Controle de quando cada casa termina cada pacote (para sequência dentro da casa)
  const housePackageEndWeek: number[][] = Array.from({ length: data.housesCount }, () => Array(data.workPackages.length).fill(-1));
  
  // Controle de qual semana cada casa iniciou cada pacote
  const housePackageStartWeek: number[][] = Array.from({ length: data.housesCount }, () => Array(data.workPackages.length).fill(-1));
  
  // Rastrear próximo grupo de casas a iniciar para cada pacote
  const nextHouseToStart: number[] = Array(data.workPackages.length).fill(0);
  
  // Rastrear quando cada serviço começou (para curva de aprendizado)
  const packageStartWeek: number[] = Array(data.workPackages.length).fill(-1);
  
  // Processar cada semana sequencialmente
  let currentWeek = 0;
  let allHousesCompleted = false;
  
  while (!allHousesCompleted && currentWeek < weekMappings.length) {
    let activityThisWeek = false;
    
    // Para cada pacote, verificar se deve iniciar um novo bloco de casas
    for (let packageIndex = 0; packageIndex < data.workPackages.length; packageIndex++) {
      const pkg = data.workPackages[packageIndex];
      
      // Calcular ritmo base e informações de redução
      const rhythmInfo = getBaseRhythmForWeek(pkg, currentWeek, data, weekMappings);
      
      // Verificar se a curva de aprendizado deve ser aplicada a este pacote
      const shouldApplyLearningCurve = !data.learningCurve.appliedPackages || 
        data.learningCurve.appliedPackages.length === 0 || 
        data.learningCurve.appliedPackages.includes(pkg.name);
      
      let effectiveRhythm: number;
      
      if (shouldApplyLearningCurve) {
        // Para pacotes COM curva: contar APENAS semanas produtivas para curva de aprendizado
        // IMPORTANTE: Paradas totais não contam para melhoria da curva
        let weekForLearningCurve: number;
        if (packageStartWeek[packageIndex] === -1) {
          weekForLearningCurve = 0; // Primeira tentativa do serviço
        } else {
          // Contar apenas semanas produtivas (excluindo paradas totais)
          weekForLearningCurve = calculateProductiveWeeks(
            packageStartWeek[packageIndex],
            currentWeek,
            weekMappings,
            data.stopPeriods
          );
        }
        effectiveRhythm = applyLearningCurveToRhythm(
          pkg.rhythm, 
          weekForLearningCurve, 
          data.learningCurve, 
          rhythmInfo.hasPartialReduction, 
          rhythmInfo.reductionCoefficient
        );
      } else {
        // Para pacotes SEM curva: usar apenas o ritmo base (com reduções sazonais se houver)
        effectiveRhythm = rhythmInfo.rhythm;
      }
      
      if (effectiveRhythm <= 0) continue; // Pular se ritmo zero (parada total)
      
      // NOVA VERIFICAÇÃO: Impedir início de novas casas durante paradas totais
      const weekMapping = weekMappings[currentWeek];
      if (weekMapping) {
        const month = weekMapping.month.toLowerCase();
        const stopPeriod = data.stopPeriods.find(p => p.month.toLowerCase() === month);
        if (stopPeriod) {
          continue; // Parada total - não iniciar novas casas, apenas continuar as em andamento
        }
      }
      
      // Verificar se há casas esperando para iniciar este pacote
      if (nextHouseToStart[packageIndex] >= data.housesCount) continue;
      
      // Coletar casas que podem iniciar este pacote nesta semana
      const housesToStart: number[] = [];
      const startHouse = nextHouseToStart[packageIndex];
      const endHouse = Math.min(startHouse + effectiveRhythm, data.housesCount);
      
      for (let houseIndex = startHouse; houseIndex < endHouse; houseIndex++) {
        // Verificar dependência: pacote anterior deve estar terminado + latência
        if (packageIndex > 0) {
          const prevEndWeek = housePackageEndWeek[houseIndex][packageIndex - 1];
          if (prevEndWeek === -1) continue; // Pacote anterior não foi feito ainda
          
          const latencyWeeks = data.workPackages[packageIndex - 1].latency;
          
          if (currentWeek < prevEndWeek + 1 + latencyWeeks) {
            break; // Ainda em latência - não iniciar nenhuma casa deste bloco
          }
        }
        
        housesToStart.push(houseIndex);
      }
      
      // Se há casas prontas para iniciar, iniciar todas simultaneamente
      if (housesToStart.length > 0) {
        // Marcar início do serviço apenas quando realmente iniciar casas
        if (packageStartWeek[packageIndex] === -1) {
          packageStartWeek[packageIndex] = currentWeek;
        }
        
        // Aplicar curva de duração apenas se este pacote deve ter curva aplicada
        let adjustedDurationInWeeks: number;
        if (shouldApplyLearningCurve) {
          const productiveServiceWeeks = calculateProductiveWeeks(
            packageStartWeek[packageIndex],
            currentWeek,
            weekMappings,
            data.stopPeriods
          );
          adjustedDurationInWeeks = applyLearningCurveDuration(pkg.duration, productiveServiceWeeks, data.learningCurve);
        } else {
          adjustedDurationInWeeks = pkg.duration; // Sem curva, usar duração original
        }
        const baseDurationInWeeks = Math.ceil(adjustedDurationInWeeks);
        
        // Calcular duração real considerando paradas totais
        const realDurationInWeeks = calculateRealDurationWithStops(
          currentWeek,
          baseDurationInWeeks,
          weekMappings,
          data.stopPeriods
        );
        const endWeek = currentWeek + realDurationInWeeks - 1;
        
        // Iniciar todas as casas do bloco simultaneamente
        for (const houseIndex of housesToStart) {
          housePackageStartWeek[houseIndex][packageIndex] = currentWeek;
          housePackageEndWeek[houseIndex][packageIndex] = endWeek;
          
          // Gerar células da matriz
          const packageCells = generatePackageCells(
            houseIndex + 1, // houseNumber
            currentWeek,
            adjustedDurationInWeeks, // duração base em semanas
            pkg,
            weekMappings,
            data.stopPeriods,
            data.partialReductionPeriods,
            data.housesCount
          );
          
          matrix[houseIndex].push(...packageCells);
          maxWeekUsed = Math.max(maxWeekUsed, endWeek);
          activityThisWeek = true;
        }
        
        // Atualizar próximo grupo de casas para este pacote
        nextHouseToStart[packageIndex] = startHouse + housesToStart.length;
      }
    }
    
    // Verificar se ainda há trabalho a fazer
    allHousesCompleted = true;
    for (let houseIndex = 0; houseIndex < data.housesCount; houseIndex++) {
      if (housePackageEndWeek[houseIndex][data.workPackages.length - 1] === -1) {
        allHousesCompleted = false;
        break;
      }
    }
    
    currentWeek++;
    
    // Segurança: parar se não houve atividade por muito tempo
    if (!activityThisWeek && currentWeek > CALCULATION_LIMITS.MAX_SAFETY_WEEKS) break;
  }
  
  return { matrix, totalWeeks: maxWeekUsed + 1 };
}

// Calcular ritmo base e informações de redução
function getBaseRhythmForWeek(
  pkg: WorkPackage,
  weekIndex: number,
  data: ProjectData,
  weekMappings: WeekDateMapping[]
): { rhythm: number; hasPartialReduction: boolean; reductionCoefficient: number } {
  const weekMapping = weekMappings[weekIndex];
  if (!weekMapping) return { rhythm: pkg.rhythm, hasPartialReduction: false, reductionCoefficient: 1 };
  
  const month = weekMapping.month.toLowerCase();
  
  // Verificar parada total
  const stopPeriod = data.stopPeriods.find(p => p.month.toLowerCase() === month);
  if (stopPeriod) return { rhythm: 0, hasPartialReduction: false, reductionCoefficient: 0 }; // Parada total = ritmo zero
  
  // Verificar redução parcial
  const reductionPeriod = data.partialReductionPeriods.find(p => p.month.toLowerCase() === month);
  if (reductionPeriod) {
    // Retornar ritmo reduzido e informação sobre a redução
    return {
      rhythm: Math.max(1, Math.floor(pkg.rhythm * reductionPeriod.coefficient)),
      hasPartialReduction: true,
      reductionCoefficient: reductionPeriod.coefficient
    };
  }
  
  return { rhythm: pkg.rhythm, hasPartialReduction: false, reductionCoefficient: 1 };
}

// Calcular duração real considerando paradas totais que estendem o cronograma
function calculateRealDurationWithStops(
  startWeek: number,
  baseDurationInWeeks: number,
  weekMappings: WeekDateMapping[],
  stopPeriods: StopPeriod[]
): number {
  let productiveWeeksCompleted = 0;
  let currentWeek = startWeek;
  
  while (productiveWeeksCompleted < baseDurationInWeeks && currentWeek < weekMappings.length) {
    const weekMapping = weekMappings[currentWeek];
    if (weekMapping) {
      const month = weekMapping.month.toLowerCase();
      const stopPeriod = stopPeriods.find(p => p.month.toLowerCase() === month);
      
      if (!stopPeriod) {
        // Semana produtiva
        productiveWeeksCompleted++;
      }
      // Paradas totais não contam como progresso, mas avançam o cronograma
    }
    currentWeek++;
  }
  
  return currentWeek - startWeek; // Duração total incluindo paradas
}

// Calcular semanas produtivas (excluindo paradas totais) para curva de aprendizado
function calculateProductiveWeeks(
  startWeek: number,
  currentWeek: number,
  weekMappings: WeekDateMapping[],
  stopPeriods: StopPeriod[]
): number {
  let productiveWeeks = 0;
  
  for (let week = startWeek; week < currentWeek && week < weekMappings.length; week++) {
    const weekMapping = weekMappings[week];
    if (weekMapping) {
      const month = weekMapping.month.toLowerCase();
      const stopPeriod = stopPeriods.find(p => p.month.toLowerCase() === month);
      
      if (!stopPeriod) {
        productiveWeeks++; // Apenas semanas sem parada total contam
      }
    }
  }
  
  return productiveWeeks;
}

// Aplicar curva de aprendizado sobre o ritmo base
function applyLearningCurveToRhythm(
  baseRhythm: number,
  weekIndex: number,
  learningCurve: LearningCurve,
  hasPartialReduction: boolean = false,
  reductionCoefficient: number = 1
): number {
  // Usar valores da configuração da curva de aprendizado ou defaults
  const firstPeriodWeeks = learningCurve.periodWeeks || LEARNING_CURVE_DEFAULTS.PERIOD_WEEKS;
  const secondPeriodWeeks = LEARNING_CURVE_DEFAULTS.SECOND_PERIOD_WEEKS;
  const initialReduction = learningCurve.rhythmReducer || LEARNING_CURVE_DEFAULTS.INITIAL_RHYTHM_REDUCTION;
  const increment = learningCurve.increment || LEARNING_CURVE_DEFAULTS.WEEKLY_INCREMENT;
  const fullProductivity = LEARNING_CURVE_DEFAULTS.FULL_PRODUCTIVITY_MULTIPLIER;
  
  let currentRhythmMultiplier: number;
  
  // TODOS os serviços seguem a mesma lógica da curva de aprendizado
  // A diferença é apenas no cálculo da semana (global vs. desde início do serviço)
  if (weekIndex < firstPeriodWeeks) {
    currentRhythmMultiplier = initialReduction; // Ex: 60%
  } else if (weekIndex < secondPeriodWeeks) {
    currentRhythmMultiplier = initialReduction + increment; // Ex: 80%
  } else {
    currentRhythmMultiplier = fullProductivity; // 100%
  }
  
  // Calcular ritmo com curva de aprendizado
  const rhythmWithLearningCurve = Math.round(baseRhythm * currentRhythmMultiplier);
  
  // Se há redução parcial, usar o MENOR valor entre:
  // 1. Ritmo com curva de aprendizado
  // 2. Ritmo com redução parcial
  let finalRhythm: number;
  if (hasPartialReduction) {
    const rhythmWithPartialReduction = Math.max(1, Math.floor(baseRhythm * reductionCoefficient));
    finalRhythm = Math.min(rhythmWithLearningCurve, rhythmWithPartialReduction);
  } else {
    finalRhythm = rhythmWithLearningCurve;
  }
  
  // IMPORTANTE: Durante paradas totais (baseRhythm = 0), manter ritmo zero
  if (baseRhythm === 0) {
    return 0; // Parada total deve permanecer parada total
  }
  
  // Para ritmos normais, garantir mínimo configurado
  return Math.max(LEARNING_CURVE_DEFAULTS.MIN_RHYTHM_PER_WEEK, finalRhythm);
}

// Aplicar curva de aprendizado na duração baseado em quantas semanas o serviço está em execução
function applyLearningCurveDuration(
  baseDurationInWeeks: number,
  serviceExecutionWeek: number,
  learningCurve: LearningCurve
): number {
  const durationImpactWeeks = learningCurve.durationImpactWeeks || LEARNING_CURVE_DEFAULTS.DURATION_IMPACT_WEEKS;
  
  // Curva de duração afeta as primeiras N semanas DE CADA SERVIÇO (configurável)
  if (serviceExecutionWeek >= durationImpactWeeks) {
    return baseDurationInWeeks; // Após N semanas DO SERVIÇO, duração normal
  }
  
  // Aplicar multiplicador configurável para as primeiras semanas do serviço
  const currentMultiplier = learningCurve.durationMultiplier || LEARNING_CURVE_DEFAULTS.DURATION_MULTIPLIER;
  
  return baseDurationInWeeks * currentMultiplier;
}


function generatePackageCells(
  houseNumber: number,
  startWeek: number,
  durationInWeeks: number,
  pkg: WorkPackage,
  weekMappings: WeekDateMapping[],
  stopPeriods: StopPeriod[],
  partialReductionPeriods: PartialReductionPeriod[],
  totalHouses: number = CALCULATION_LIMITS.DEFAULT_TOTAL_HOUSES
): MatrixCell[] {
  const cells: MatrixCell[] = [];
  
  // Calcular custo por casa: custo total do pacote / número de casas
  // O custo é distribuído igualmente por todas as semanas de duração do pacote
  const costPerHouse = pkg.cost / totalHouses;
  const costPerHousePerWeek = costPerHouse / durationInWeeks;
  
  // Gerar células considerando paradas totais que estendem a duração
  let productiveWeeksCompleted = 0;
  let currentWeek = startWeek;
  
  while (productiveWeeksCompleted < durationInWeeks && currentWeek < weekMappings.length) {
    const weekMapping = weekMappings[currentWeek];
    const month = weekMapping.month.toLowerCase();
    
    // Verificar períodos de parada total
    const stopPeriod = stopPeriods.find(p => p.month.toLowerCase() === month);
    if (stopPeriod) {
      // Parada total - atividade para, mas ocupa célula SEM CONTAR COMO PROGRESSO
      cells.push({
        houseNumber,
        weekIndex: currentWeek,
        packageName: pkg.name,
        color: pkg.color,
        isReduced: true,
        reductionOpacity: 0.1,
        cost: 0
      });
      // NÃO incrementar productiveWeeksCompleted - a duração é estendida
      currentWeek++;
      continue;
    }
    
    // Verificar períodos de redução parcial
    const reductionPeriod = partialReductionPeriods.find(p => p.month.toLowerCase() === month);
    const isReduced = !!reductionPeriod;
    const reductionCoeff = reductionPeriod?.coefficient || 1;
    
    // Semana produtiva - conta como progresso do pacote
    cells.push({
      houseNumber,
      weekIndex: currentWeek,
      packageName: pkg.name,
      color: pkg.color,
      isReduced,
      reductionOpacity: isReduced ? getReductionOpacity(reductionCoeff) : undefined,
      cost: costPerHousePerWeek // Custo sempre integral - redução afeta apenas velocidade
    });
    
    // Incrementar semanas produtivas completadas
    productiveWeeksCompleted++;
    currentWeek++;
  }
  
  return cells;
}

function calculateFinancialData(
  matrix: MatrixCell[][],
  weekMappings: WeekDateMapping[],
  workPackages: WorkPackage[]
): FinancialWeekData[] {
  
  const financialData: FinancialWeekData[] = [];
  let cumulativeCost = 0;
  
  const maxWeek = weekMappings.length;
  
  for (let weekIndex = 0; weekIndex < maxWeek; weekIndex++) {
    const weekMapping = weekMappings[weekIndex];
    let weeklyCost = 0;
    let activeHouses = 0;
    const packageCosts: Record<string, number> = {};
    
    // Inicializar custos dos pacotes
    workPackages.forEach(pkg => {
      packageCosts[pkg.name] = 0;
    });
    
    // Calcular custos da semana
    matrix.forEach((houseCells) => {
      const cellsInWeek = houseCells.filter(cell => cell.weekIndex === weekIndex);
      
      if (cellsInWeek.length > 0) {
        activeHouses++;
        
        cellsInWeek.forEach(cell => {
          const cellCost = cell.cost || 0;
          weeklyCost += cellCost;
          packageCosts[cell.packageName] = (packageCosts[cell.packageName] || 0) + cellCost;
        });
      }
    });
    
    cumulativeCost += weeklyCost;
    
    financialData.push({
      weekIndex,
      weekLabel: weekMapping.weekLabel,
      weeklyCost: roundToDecimals(weeklyCost, 2),
      cumulativeCost: roundToDecimals(cumulativeCost, 2),
      activeHouses,
      packageCosts: Object.fromEntries(
        Object.entries(packageCosts).map(([name, cost]) => [name, roundToDecimals(cost, 2)])
      )
    });
  }
  
  return financialData;
}

// Funções auxiliares para exportação
export function exportMatrixToCSV(result: CalculationResult): string {
  const headers = ['Casa', ...result.weeks];
  const rows: string[][] = [headers];
  
  for (let houseIndex = 0; houseIndex < result.houses.length; houseIndex++) {
    const row: string[] = [result.houses[houseIndex].toString()];
    
    for (let weekIndex = 0; weekIndex < result.weeks.length; weekIndex++) {
      const cell = result.matrix[houseIndex]?.find(c => c.weekIndex === weekIndex);
      row.push(cell?.packageName || '');
    }
    
    rows.push(row);
  }
  
  return rows.map(row => row.join(',')).join('\n');
}

export function validateCalculationInputs(data: ProjectData): string[] {
  const errors: string[] = [];
  
  if (data.housesCount <= 0 || data.housesCount > MAX_HOUSES_LIMIT) {
    errors.push(ERROR_MESSAGES.INVALID_HOUSES_COUNT);
  }
  
  if (!data.startDate) {
    errors.push('Data de início é obrigatória');
  }
  
  if (data.workPackages.length === 0) {
    errors.push('Pelo menos um pacote de trabalho é obrigatório');
  }
  
  data.workPackages.forEach((pkg, index) => {
    if (pkg.duration <= 0) {
      errors.push(`Pacote ${index + 1}: Duração deve ser maior que zero`);
    }
    if (pkg.rhythm <= 0) {
      errors.push(`Pacote ${index + 1}: Ritmo deve ser maior que zero`);
    }
    if (pkg.cost < 0) {
      errors.push(`Pacote ${index + 1}: Custo não pode ser negativo`);
    }
  });
  
  return errors;
}