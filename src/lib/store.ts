import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ProjectData,
  WorkPackage,
  StopPeriod,
  PartialReductionPeriod,
  LearningCurve,
  CalculationResult,
  ProjectConfigStatus,
  SavedScenario,
  ScenarioMetadata
} from './types';
import { generateId, getWorkPackageColor } from './utils';
import {
  DEFAULT_PROJECT_CONFIG,
  DEFAULT_WORK_PACKAGES,
  DEFAULT_STOP_PERIODS,
  DEFAULT_PARTIAL_REDUCTION_PERIODS,
  DEFAULT_LEARNING_CURVE,
  MAX_HOUSES_LIMIT
} from './constants';
import { scenariosService } from './services';

interface ProjectStore {
  // Dados básicos do projeto
  housesCount: number;
  startDate: string;
  startDateDisplay: string;

  // Configurações
  workPackages: WorkPackage[];
  stopPeriods: StopPeriod[];
  partialReductionPeriods: PartialReductionPeriod[];
  learningCurve: LearningCurve;

  // Resultados
  calculationResult: CalculationResult | null;
  projectData: ProjectData | null;

  // Estado da UI
  isCalculating: boolean;
  lastCalculatedAt: string | null;
  version: number;

  // Estado dos cenários
  currentScenarioId: string | null;
  isUnsaved: boolean;

  // Ações básicas do projeto
  setHousesCount: (count: number) => void;
  setStartDate: (date: string, displayDate: string) => void;

  // Ações para pacotes de trabalho
  addWorkPackage: (packageData: Omit<WorkPackage, 'color'>) => void;
  updateWorkPackage: (index: number, packageData: Partial<WorkPackage>) => void;
  removeWorkPackage: (index: number) => void;
  reorderWorkPackages: (fromIndex: number, toIndex: number) => void;

  // Ações para períodos de parada
  addStopPeriod: (period: Omit<StopPeriod, 'id'>) => void;
  updateStopPeriod: (id: string, period: Partial<StopPeriod>) => void;
  removeStopPeriod: (id: string) => void;

  // Ações para períodos de redução parcial
  addPartialReductionPeriod: (period: Omit<PartialReductionPeriod, 'id'>) => void;
  updatePartialReductionPeriod: (id: string, period: Partial<PartialReductionPeriod>) => void;
  removePartialReductionPeriod: (id: string) => void;

  // Ações para curva de aprendizado
  updateLearningCurve: (curve: Partial<LearningCurve>) => void;

  // Ações de cálculo
  setCalculationResult: (result: CalculationResult) => void;
  setIsCalculating: (isCalculating: boolean) => void;
  clearCalculationResult: () => void;
  forceResetCalculation: () => void;

  // Utilitários
  getProjectData: () => ProjectData;
  getConfigStatus: () => ProjectConfigStatus;
  resetToDefaults: () => void;

  // Ações de cenários
  saveCurrentScenario: (name: string, description?: string) => Promise<SavedScenario>;
  loadScenario: (id: string) => Promise<boolean>;
  deleteScenario: (id: string) => Promise<boolean>;
  duplicateScenario: (id: string, newName: string) => Promise<SavedScenario | null>;
  updateCurrentScenario: (updates: { name?: string; description?: string }) => Promise<boolean>;
  getAllScenariosMetadata: () => Promise<ScenarioMetadata[]>;
  exportScenario: (id: string) => Promise<string | null>;
  importScenario: (data: string) => Promise<SavedScenario | null>;
  clearAllScenarios: () => Promise<void>;
  migrateScenarioToSupabase: (id: string) => Promise<boolean>;
  markAsUnsaved: () => void;
  markAsSaved: () => void;
}


export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      // Estado inicial - Cenário Jardins Montreal
      housesCount: DEFAULT_PROJECT_CONFIG.housesCount,
      startDate: DEFAULT_PROJECT_CONFIG.startDate,
      startDateDisplay: DEFAULT_PROJECT_CONFIG.startDateDisplay,
      workPackages: DEFAULT_WORK_PACKAGES,
      stopPeriods: DEFAULT_STOP_PERIODS,
      partialReductionPeriods: DEFAULT_PARTIAL_REDUCTION_PERIODS,
      learningCurve: DEFAULT_LEARNING_CURVE,
      calculationResult: null,
      projectData: null,
      isCalculating: false,
      lastCalculatedAt: null,
      version: 1,
      currentScenarioId: null,
      isUnsaved: false,

      // Ações básicas
      setHousesCount: (count) => set({ housesCount: count, isUnsaved: true }),
      
      setStartDate: (date, displayDate) => set({ 
        startDate: date, 
        startDateDisplay: displayDate,
        isUnsaved: true
      }),

      // Pacotes de trabalho
      addWorkPackage: (packageData) => set((state) => ({
        workPackages: [
          ...state.workPackages,
          {
            ...packageData,
            color: getWorkPackageColor(state.workPackages.length)
          }
        ],
        isUnsaved: true
      })),

      updateWorkPackage: (index, packageData) => set((state) => ({
        workPackages: state.workPackages.map((pkg, i) => 
          i === index ? { ...pkg, ...packageData } : pkg
        ),
        isUnsaved: true
      })),

      removeWorkPackage: (index) => set((state) => ({
        workPackages: state.workPackages.filter((_, i) => i !== index),
        isUnsaved: true
      })),

      reorderWorkPackages: (fromIndex, toIndex) => set((state) => {
        const packages = [...state.workPackages];
        const [movedPackage] = packages.splice(fromIndex, 1);
        packages.splice(toIndex, 0, movedPackage);
        return { workPackages: packages, isUnsaved: true };
      }),

      // Períodos de parada
      addStopPeriod: (period) => set((state) => ({
        stopPeriods: [...state.stopPeriods, { ...period, id: generateId() }],
        isUnsaved: true
      })),

      updateStopPeriod: (id, period) => set((state) => ({
        stopPeriods: state.stopPeriods.map(p => 
          p.id === id ? { ...p, ...period } : p
        ),
        isUnsaved: true
      })),

      removeStopPeriod: (id) => set((state) => ({
        stopPeriods: state.stopPeriods.filter(p => p.id !== id),
        isUnsaved: true
      })),

      // Períodos de redução parcial
      addPartialReductionPeriod: (period) => set((state) => ({
        partialReductionPeriods: [...state.partialReductionPeriods, { ...period, id: generateId() }],
        isUnsaved: true
      })),

      updatePartialReductionPeriod: (id, period) => set((state) => ({
        partialReductionPeriods: state.partialReductionPeriods.map(p => 
          p.id === id ? { ...p, ...period } : p
        ),
        isUnsaved: true
      })),

      removePartialReductionPeriod: (id) => set((state) => ({
        partialReductionPeriods: state.partialReductionPeriods.filter(p => p.id !== id),
        isUnsaved: true
      })),

      // Curva de aprendizado
      updateLearningCurve: (curve) => set((state) => ({
        learningCurve: { ...state.learningCurve, ...curve },
        isUnsaved: true
      })),

      // Cálculos
      setCalculationResult: (result) => set({ 
        calculationResult: result,
        lastCalculatedAt: new Date().toISOString()
      }),

      setIsCalculating: (isCalculating) => set({ isCalculating }),

      clearCalculationResult: () => set({ 
        calculationResult: null,
        lastCalculatedAt: null 
      }),

      forceResetCalculation: () => set({
        isCalculating: false,
        calculationResult: null,
        lastCalculatedAt: null
      }),

      // Utilitários
      getProjectData: () => {
        const state = get();
        return {
          housesCount: state.housesCount,
          startDate: state.startDate,
          stopPeriods: state.stopPeriods,
          partialReductionPeriods: state.partialReductionPeriods,
          workPackages: state.workPackages,
          learningCurve: state.learningCurve
        };
      },

      getConfigStatus: () => {
        const state = get();
        const isBasicDataValid = state.housesCount > 0 && state.housesCount <= MAX_HOUSES_LIMIT && !!state.startDate;
        const isPackagesValid = state.workPackages.length > 0 && 
          state.workPackages.every(pkg => pkg.duration > 0 && pkg.rhythm > 0);
        const isPeriodsValid = true; // Períodos são opcionais
        const isLearningCurveValid = state.learningCurve.rhythmReducer > 0 && 
          state.learningCurve.increment >= 0;

        return {
          isBasicDataValid,
          isPackagesValid,
          isPeriodsValid,
          isLearningCurveValid,
          canCalculate: isBasicDataValid && isPackagesValid && isPeriodsValid && isLearningCurveValid
        };
      },

      resetToDefaults: () => set({
        housesCount: DEFAULT_PROJECT_CONFIG.housesCount,
        startDate: DEFAULT_PROJECT_CONFIG.startDate,
        startDateDisplay: DEFAULT_PROJECT_CONFIG.startDateDisplay,
        workPackages: DEFAULT_WORK_PACKAGES,
        stopPeriods: DEFAULT_STOP_PERIODS,
        partialReductionPeriods: DEFAULT_PARTIAL_REDUCTION_PERIODS,
        learningCurve: DEFAULT_LEARNING_CURVE,
        calculationResult: null,
        projectData: null,
        isCalculating: false,
        lastCalculatedAt: null,
        version: 2,
        currentScenarioId: null,
        isUnsaved: false
      }),

      // Ações de cenários
      saveCurrentScenario: async (name, description) => {
        const state = get();
        if (!state.calculationResult) {
          throw new Error('Não há cálculo para salvar. Calcule a linha de base primeiro.');
        }

        const projectData = state.getProjectData();
        const savedScenario = await scenariosService.saveScenario(
          name,
          projectData,
          state.calculationResult,
          description
        );

        set({
          currentScenarioId: savedScenario.id,
          isUnsaved: false
        });

        return savedScenario;
      },

      loadScenario: async (id) => {
        const scenario = await scenariosService.getScenario(id);
        if (!scenario) return false;

        set({
          housesCount: scenario.projectData.housesCount,
          startDate: scenario.projectData.startDate,
          startDateDisplay: scenario.projectData.startDate,
          workPackages: scenario.projectData.workPackages,
          stopPeriods: scenario.projectData.stopPeriods,
          partialReductionPeriods: scenario.projectData.partialReductionPeriods,
          learningCurve: scenario.projectData.learningCurve,
          calculationResult: scenario.calculationResult,
          currentScenarioId: id,
          isUnsaved: false,
          lastCalculatedAt: scenario.calculationResult.calculationMetadata.calculatedAt
        });

        return true;
      },

      deleteScenario: async (id) => {
        const success = await scenariosService.deleteScenario(id);
        if (success) {
          const state = get();
          if (state.currentScenarioId === id) {
            set({ currentScenarioId: null, isUnsaved: false });
          }
        }
        return success;
      },

      duplicateScenario: async (id, newName) => {
        return await scenariosService.duplicateScenario(id, newName);
      },

      updateCurrentScenario: async (updates) => {
        const state = get();
        if (!state.currentScenarioId) return false;

        const updatedScenario = await scenariosService.updateScenario(state.currentScenarioId, updates);
        return !!updatedScenario;
      },

      getAllScenariosMetadata: async () => {
        return await scenariosService.getScenariosMetadata();
      },

      exportScenario: async (id) => {
        return await scenariosService.exportScenario(id);
      },

      importScenario: async (data) => {
        return await scenariosService.importScenario(data);
      },

      clearAllScenarios: async () => {
        await scenariosService.clearAllScenarios();
        set({ currentScenarioId: null, isUnsaved: false });
      },

      migrateScenarioToSupabase: async (id) => {
        return await scenariosService.migrateToSupabase(id);
      },

      markAsUnsaved: () => set({ isUnsaved: true }),

      markAsSaved: () => set({ isUnsaved: false })
    }),
    {
      name: 'calculadora-linha-base-store',
      version: 2,
      partialize: (state) => ({
        // Salvar apenas dados essenciais, não o resultado completo do cálculo
        housesCount: state.housesCount,
        startDate: state.startDate,
        startDateDisplay: state.startDateDisplay,
        workPackages: state.workPackages,
        stopPeriods: state.stopPeriods,
        partialReductionPeriods: state.partialReductionPeriods,
        learningCurve: state.learningCurve,
        version: state.version,
        currentScenarioId: state.currentScenarioId,
        isUnsaved: state.isUnsaved
        // NÃO salvar: calculationResult, projectData, isCalculating, lastCalculatedAt
      })
    }
  )
);