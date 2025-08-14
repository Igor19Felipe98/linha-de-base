import { WorkPackage, StopPeriod, PartialReductionPeriod, LearningCurve } from '../types';
import { getWorkPackageColor, generateId } from '../utils';

// Dados padrão - Cenário Jardins Montreal (23 pacotes) - Durações em SEMANAS
// Custos são TOTAIS do pacote para 300 casas (sistema calculará custo unitário dinamicamente)
export const DEFAULT_WORK_PACKAGES: WorkPackage[] = [
  { name: 'Pré-Obra', duration: 1, rhythm: 10, latency: 4, color: getWorkPackageColor(0), cost: 10640525.91 },
  { name: 'Estacas', duration: 1, rhythm: 12, latency: 0, color: getWorkPackageColor(1), cost: 2579700.90 },
  { name: 'Infraestrutura Enterrada', duration: 1, rhythm: 12, latency: 0, color: getWorkPackageColor(2), cost: 6865387.49 },
  { name: 'Radier + Deck', duration: 1, rhythm: 12, latency: 4, color: getWorkPackageColor(3), cost: 9781629.31 },
  { name: 'Muro de Divisa + Conformação do terreno', duration: 1, rhythm: 10, latency: 0, color: getWorkPackageColor(4), cost: 6122539.94 },
  { name: 'Alvenaria Inferior', duration: 1, rhythm: 10, latency: 0, color: getWorkPackageColor(5), cost: 12260487.14 },
  { name: 'Laje Inferior', duration: 1, rhythm: 10, latency: 0, color: getWorkPackageColor(6), cost: 11737434.02 },
  { name: 'Alvenaria Superior', duration: 1, rhythm: 10, latency: 0, color: getWorkPackageColor(7), cost: 10917252.56 },
  { name: 'Laje Superior', duration: 1, rhythm: 10, latency: 0, color: getWorkPackageColor(8), cost: 6997122.67 },
  { name: 'Talisca + Alvenaria do Barrilete', duration: 1, rhythm: 10, latency: 0, color: getWorkPackageColor(9), cost: 7681311.25 },
  { name: 'Instalações de Prumadas', duration: 1, rhythm: 10, latency: 4, color: getWorkPackageColor(10), cost: 9814241.82 },
  { name: 'Contrapiso', duration: 1, rhythm: 10, latency: 0, color: getWorkPackageColor(11), cost: 4979397.31 },
  { name: 'Reboco', duration: 1, rhythm: 10, latency: 0, color: getWorkPackageColor(12), cost: 15367388.04 },
  { name: 'Rampas e Calçadas + revestimento de fachada + Instalações externas', duration: 1, rhythm: 10, latency: 0, color: getWorkPackageColor(13), cost: 9565074.83 },
  { name: 'Cobertura', duration: 1, rhythm: 10, latency: 0, color: getWorkPackageColor(14), cost: 7932952.69 },
  { name: 'Gesso Interno + Paisagismo', duration: 1, rhythm: 10, latency: 4, color: getWorkPackageColor(15), cost: 8468037.81 },
  { name: 'Massa PVA + Instalação de Módulos', duration: 1, rhythm: 10, latency: 0, color: getWorkPackageColor(16), cost: 4450403.21 },
  { name: 'Revestimento Cerâmico + Bancadas', duration: 1, rhythm: 10, latency: 0, color: getWorkPackageColor(17), cost: 19579358.85 },
  { name: 'Esquadria de alumínio', duration: 1, rhythm: 10, latency: 0, color: getWorkPackageColor(18), cost: 10168027.26 },
  { name: 'Pintura Final', duration: 1, rhythm: 10, latency: 4, color: getWorkPackageColor(19), cost: 12057469.21 },
  { name: 'Acabamentos Finais', duration: 1, rhythm: 10, latency: 0, color: getWorkPackageColor(20), cost: 4795404.39 },
  { name: 'Esquadrias de Madeira', duration: 1, rhythm: 10, latency: 0, color: getWorkPackageColor(21), cost: 4314479.27 },
  { name: 'Vistoria', duration: 1, rhythm: 10, latency: 0, color: getWorkPackageColor(22), cost: 0 }
];

export const DEFAULT_STOP_PERIODS: StopPeriod[] = [
  {
    id: generateId(),
    month: 'dezembro',
    coefficient: 0,
    description: 'Parada de final de ano/recesso natalino'
  }
];

export const DEFAULT_PARTIAL_REDUCTION_PERIODS: PartialReductionPeriod[] = [
  {
    id: generateId(),
    month: 'janeiro',
    coefficient: 0.5,
    description: 'Retorno gradual pós-feriados'
  },
  {
    id: generateId(),
    month: 'fevereiro',
    coefficient: 0.5,
    description: 'Continuação do período de baixa produtividade'
  },
  {
    id: generateId(),
    month: 'março',
    coefficient: 0.5,
    description: 'Normalização gradual da produtividade'
  }
];

export const DEFAULT_LEARNING_CURVE: LearningCurve = {
  rhythmReducer: 0.60,
  increment: 0.20,
  periodWeeks: 4,
  durationMultiplier: 2.00,
  durationImpactWeeks: 6 // 6 semanas de impacto na duração
};

// Cenário Jardins Montreal - Configurações padrão
export const DEFAULT_PROJECT_CONFIG = {
  housesCount: 300,
  startDate: '2026-04-06', // Segunda-feira, 06/04/2026
  startDateDisplay: '06/04/2026',
  workPackages: DEFAULT_WORK_PACKAGES,
  stopPeriods: DEFAULT_STOP_PERIODS,
  partialReductionPeriods: DEFAULT_PARTIAL_REDUCTION_PERIODS,
  learningCurve: DEFAULT_LEARNING_CURVE
} as const;