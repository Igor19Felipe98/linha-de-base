import { SavedScenario, ScenarioMetadata, ProjectData, CalculationResult } from '../types';
import { generateId } from '../utils';
import { createClient } from '../supabase/client';

const SCENARIOS_VERSION = 1;
const SCENARIOS_STORAGE_KEY = 'calculadora-linha-base-scenarios';

export class ScenariosService {
  private static instance: ScenariosService;
  private supabase = createClient();
  
  public static getInstance(): ScenariosService {
    if (!ScenariosService.instance) {
      ScenariosService.instance = new ScenariosService();
    }
    return ScenariosService.instance;
  }

  private async getCurrentUser() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        // Fallback para desenvolvimento - usar localStorage
        return { id: 'local-user', email: 'desenvolvimento@local.com' };
      }
      return user;
    } catch (error) {
      // Fallback para desenvolvimento sem Supabase
      return { id: 'local-user', email: 'desenvolvimento@local.com' };
    }
  }

  // Fallback para localStorage (modo desenvolvimento)
  private getStorageData(): SavedScenario[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(SCENARIOS_STORAGE_KEY);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Erro ao carregar cenários do localStorage:', error);
      return [];
    }
  }

  private saveToStorage(scenarios: SavedScenario[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(scenarios));
    } catch (error) {
      console.error('Erro ao salvar cenários no localStorage:', error);
      throw new Error('Erro ao salvar cenário. Verifique se há espaço suficiente.');
    }
  }

  public async saveScenario(
    name: string,
    projectData: ProjectData,
    calculationResult: CalculationResult,
    description?: string
  ): Promise<SavedScenario> {
    const user = await this.getCurrentUser();
    const now = new Date().toISOString();
    
    // Tentar usar Supabase primeiro, fallback para localStorage
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && user.id !== 'local-user') {
        console.log('Tentando salvar no Supabase...', { userId: user.id });
        
        const scenarioData = {
          name: name.trim(),
          description: description?.trim() || null,
          user_id: user.id,
          project_data: projectData,
          calculation_result: calculationResult,
          version: SCENARIOS_VERSION
        };

        const { data, error } = await this.supabase
          .from('scenarios')
          .insert(scenarioData)
          .select()
          .single();

        if (error) {
          console.error('Erro do Supabase:', error);
          throw error; // Vamos forçar o fallback
        }

        if (data) {
          console.log('Salvo no Supabase com sucesso!', data.id);
          return {
            id: data.id,
            name: data.name,
            description: data.description,
            projectData: data.project_data as ProjectData,
            calculationResult: data.calculation_result as CalculationResult,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            version: data.version
          };
        }
      }
    } catch (error) {
      console.log('Erro no Supabase, usando localStorage como fallback:', error);
    }

    // Fallback para localStorage - versão compactada
    console.log('Usando localStorage como fallback...');
    
    try {
      const scenarios = this.getStorageData();
      
      // Criar versão reduzida do resultado (sem matriz completa para economizar espaço)
      const compactResult = {
        ...calculationResult,
        matrix: [], // Remover matriz para economizar espaço
        calculationMetadata: calculationResult.calculationMetadata
      };
      
      const newScenario: SavedScenario = {
        id: generateId(),
        name: name.trim(),
        description: description?.trim(),
        projectData: { ...projectData },
        calculationResult: compactResult,
        createdAt: now,
        updatedAt: now,
        version: SCENARIOS_VERSION
      };

      scenarios.push(newScenario);
      
      // Tentar salvar, se der erro de espaço, limpar cenários antigos
      try {
        this.saveToStorage(scenarios);
        console.log('Salvo no localStorage com sucesso!');
      } catch (storageError) {
        console.log('localStorage cheio, limpando cenários antigos...');
        // Manter apenas os 5 cenários mais recentes
        const recentScenarios = scenarios.slice(-5);
        recentScenarios.push(newScenario);
        this.saveToStorage(recentScenarios);
        console.log('Salvo no localStorage após limpeza!');
      }
      
      return newScenario;
    } catch (error) {
      console.error('Erro fatal ao salvar:', error);
      throw new Error('Não foi possível salvar o cenário. Tente configurar o Supabase.');
    }
  }

  public async updateScenario(
    id: string,
    updates: {
      name?: string;
      description?: string;
      projectData?: ProjectData;
      calculationResult?: CalculationResult;
    }
  ): Promise<SavedScenario | null> {
    const user = await this.getCurrentUser();
    
    // Tentar atualizar no Supabase primeiro
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && user.id !== 'local-user') {
      try {
        const updateData: any = {};
        if (updates.name) updateData.name = updates.name.trim();
        if (updates.description !== undefined) updateData.description = updates.description?.trim() || null;
        if (updates.projectData) updateData.project_data = updates.projectData;
        if (updates.calculationResult) updateData.calculation_result = updates.calculationResult;
        
        const { data, error } = await this.supabase
          .from('scenarios')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (!error && data) {
          return {
            id: data.id,
            name: data.name,
            description: data.description,
            projectData: data.project_data as ProjectData,
            calculationResult: data.calculation_result as CalculationResult,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            version: data.version
          };
        }
      } catch (error) {
        console.log('Erro ao atualizar no Supabase, usando localStorage:', error);
      }
    }

    // Fallback para localStorage
    const scenarios = this.getStorageData();
    const scenarioIndex = scenarios.findIndex(s => s.id === id);
    
    if (scenarioIndex === -1) {
      return null;
    }

    const scenario = scenarios[scenarioIndex];
    const updatedScenario: SavedScenario = {
      ...scenario,
      ...updates,
      name: updates.name?.trim() || scenario.name,
      description: updates.description?.trim() || scenario.description,
      updatedAt: new Date().toISOString()
    };

    scenarios[scenarioIndex] = updatedScenario;
    this.saveToStorage(scenarios);
    
    return updatedScenario;
  }

  public async deleteScenario(id: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    
    // Tentar deletar do Supabase primeiro
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && user.id !== 'local-user') {
      try {
        const { error } = await this.supabase
          .from('scenarios')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (!error) {
          return true;
        }
      } catch (error) {
        console.log('Erro ao deletar do Supabase, tentando localStorage:', error);
      }
    }

    // Fallback para localStorage
    const scenarios = this.getStorageData();
    const initialLength = scenarios.length;
    const filteredScenarios = scenarios.filter(s => s.id !== id);
    
    if (filteredScenarios.length === initialLength) {
      return false; // Cenário não encontrado
    }

    this.saveToStorage(filteredScenarios);
    return true;
  }

  public async getScenario(id: string): Promise<SavedScenario | null> {
    const user = await this.getCurrentUser();
    
    // Tentar buscar do Supabase primeiro
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && user.id !== 'local-user') {
      try {
        const { data, error } = await this.supabase
          .from('scenarios')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          return {
            id: data.id,
            name: data.name,
            description: data.description,
            projectData: data.project_data as ProjectData,
            calculationResult: data.calculation_result as CalculationResult,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            version: data.version
          };
        }
      } catch (error) {
        console.log('Erro ao buscar do Supabase, tentando localStorage:', error);
      }
    }

    // Fallback para localStorage
    const scenarios = this.getStorageData();
    return scenarios.find(s => s.id === id) || null;
  }

  public async getAllScenarios(): Promise<SavedScenario[]> {
    const user = await this.getCurrentUser();
    
    // Tentar buscar do Supabase primeiro
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && user.id !== 'local-user') {
      try {
        const { data, error } = await this.supabase
          .from('scenarios')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            projectData: item.project_data as ProjectData,
            calculationResult: item.calculation_result as CalculationResult,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            version: item.version
          }));
        }
      } catch (error) {
        console.log('Erro ao buscar do Supabase, usando localStorage:', error);
      }
    }

    // Fallback para localStorage
    return this.getStorageData();
  }

  public async getScenariosMetadata(): Promise<ScenarioMetadata[]> {
    const user = await this.getCurrentUser();
    let supabaseScenarios: SavedScenario[] = [];
    let localScenarios: SavedScenario[] = [];
    
    // Buscar do Supabase se disponível
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && user.id !== 'local-user') {
      try {
        const { data, error } = await this.supabase
          .from('scenarios')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          supabaseScenarios = data.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            projectData: item.project_data as ProjectData,
            calculationResult: item.calculation_result as CalculationResult,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            version: item.version
          }));
        }
      } catch (error) {
        console.log('Erro ao buscar do Supabase:', error);
      }
    }
    
    // Buscar do localStorage
    localScenarios = this.getStorageData();
    
    // Combinar cenários, priorizando Supabase e evitando duplicatas
    const allScenarios = [...supabaseScenarios];
    const supabaseIds = new Set(supabaseScenarios.map(s => s.id));
    
    localScenarios.forEach(localScenario => {
      if (!supabaseIds.has(localScenario.id)) {
        allScenarios.push(localScenario);
      }
    });
    
    return allScenarios.map(scenario => {
      const isInSupabase = supabaseIds.has(scenario.id);
      
      return {
        id: scenario.id,
        name: scenario.name,
        description: scenario.description,
        createdAt: scenario.createdAt,
        updatedAt: scenario.updatedAt,
        housesCount: scenario.projectData.housesCount,
        totalCost: scenario.calculationResult.calculationMetadata.totalProjectCost,
        duration: scenario.calculationResult.calculationMetadata.totalProjectDuration,
        packagesCount: scenario.projectData.workPackages.length,
        storageLocation: isInSupabase ? 'supabase' : 'local'
      };
    });
  }

  public async duplicateScenario(id: string, newName: string): Promise<SavedScenario | null> {
    const originalScenario = await this.getScenario(id);
    
    if (!originalScenario) {
      return null;
    }

    return await this.saveScenario(
      newName,
      originalScenario.projectData,
      originalScenario.calculationResult,
      originalScenario.description
    );
  }

  public async exportScenario(id: string): Promise<string | null> {
    const scenario = await this.getScenario(id);
    
    if (!scenario) {
      return null;
    }

    return JSON.stringify(scenario, null, 2);
  }

  public async importScenario(scenarioData: string): Promise<SavedScenario | null> {
    try {
      const scenario: SavedScenario = JSON.parse(scenarioData);
      
      // Validar estrutura básica
      if (!scenario.name || !scenario.projectData || !scenario.calculationResult) {
        throw new Error('Estrutura de cenário inválida');
      }

      // Importar como novo cenário usando saveScenario
      return await this.saveScenario(
        scenario.name + ' (Importado)',
        scenario.projectData,
        scenario.calculationResult,
        scenario.description
      );
    } catch (error) {
      console.error('Erro ao importar cenário:', error);
      return null;
    }
  }

  public async clearAllScenarios(): Promise<void> {
    const user = await this.getCurrentUser();
    
    // Limpar do Supabase primeiro
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && user.id !== 'local-user') {
      try {
        await this.supabase
          .from('scenarios')
          .delete()
          .eq('user_id', user.id);
      } catch (error) {
        console.log('Erro ao limpar Supabase:', error);
      }
    }

    // Limpar localStorage também
    localStorage.removeItem(SCENARIOS_STORAGE_KEY);
  }

  public async migrateToSupabase(scenarioId: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    
    // Verificar se Supabase está disponível e usuário está logado
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || user.id === 'local-user') {
      throw new Error('Supabase não configurado ou usuário não logado');
    }
    
    // Buscar cenário no localStorage
    const localScenarios = this.getStorageData();
    const scenario = localScenarios.find(s => s.id === scenarioId);
    
    if (!scenario) {
      throw new Error('Cenário não encontrado no armazenamento local');
    }
    
    try {
      // Salvar no Supabase
      const scenarioData = {
        name: scenario.name,
        description: scenario.description || null,
        user_id: user.id,
        project_data: scenario.projectData,
        calculation_result: scenario.calculationResult,
        version: SCENARIOS_VERSION
      };

      const { data, error } = await this.supabase
        .from('scenarios')
        .insert(scenarioData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        // Remover do localStorage após salvar com sucesso no Supabase
        const updatedLocalScenarios = localScenarios.filter(s => s.id !== scenarioId);
        this.saveToStorage(updatedLocalScenarios);
        
        console.log(`Cenário "${scenario.name}" migrado para Supabase com sucesso!`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao migrar cenário para Supabase:', error);
      throw error;
    }
  }

  public getStorageInfo(): { count: number; sizeKB: number } {
    const scenarios = this.getStorageData();
    const dataString = JSON.stringify(scenarios);
    
    return {
      count: scenarios.length,
      sizeKB: Math.round((dataString.length * 2) / 1024) // Aproximação em KB
    };
  }
}

// Instância singleton para uso global
export const scenariosService = ScenariosService.getInstance();