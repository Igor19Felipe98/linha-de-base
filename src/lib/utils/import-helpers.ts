import { ConfigSpreadsheetData, PackagesSpreadsheetData } from './spreadsheet';
import { generateId } from './generators';
import { 
  convertDateToISO, 
  validateDateFormat,
  months,
  getWorkPackageColor 
} from './index';

export interface ImportResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

// Função para aplicar dados de configuração importados ao store
export function applyConfigToStore(
  data: ConfigSpreadsheetData,
  store: {
    setHousesCount: (count: number) => void;
    setStartDate: (date: string, displayDate: string) => void;
    stopPeriods: any[];
    partialReductionPeriods: any[];
    addStopPeriod: (period: any) => void;
    addPartialReductionPeriod: (period: any) => void;
    removeStopPeriod: (id: string) => void;
    removePartialReductionPeriod: (id: string) => void;
    updateLearningCurve: (curve: any) => void;
    workPackages: any[];
  }
): ImportResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Aplicar dados básicos
    if (data.dadosBasicos.quantidadeCasas > 0) {
      store.setHousesCount(data.dadosBasicos.quantidadeCasas);
    }

    if (data.dadosBasicos.dataInicio && validateDateFormat(data.dadosBasicos.dataInicio)) {
      const isoDate = convertDateToISO(data.dadosBasicos.dataInicio);
      store.setStartDate(isoDate, data.dadosBasicos.dataInicio);
    } else if (data.dadosBasicos.dataInicio) {
      errors.push('Data de início inválida');
    }

    // Limpar períodos existentes
    store.stopPeriods.forEach(period => store.removeStopPeriod(period.id));
    store.partialReductionPeriods.forEach(period => store.removePartialReductionPeriod(period.id));

    // Aplicar períodos de parada
    data.periodosParada.forEach(periodo => {
      if (months.includes(periodo.mes)) {
        store.addStopPeriod({
          month: periodo.mes,
          coefficient: 0,
          description: periodo.descricao
        });
      } else {
        warnings.push(`Mês "${periodo.mes}" não reconhecido e foi ignorado`);
      }
    });

    // Aplicar períodos de redução
    data.periodosReducao.forEach(periodo => {
      if (months.includes(periodo.mes)) {
        if (periodo.coeficiente > 0 && periodo.coeficiente < 1) {
          store.addPartialReductionPeriod({
            month: periodo.mes,
            coefficient: periodo.coeficiente,
            description: periodo.descricao
          });
        } else {
          errors.push(`Coeficiente inválido para o mês "${periodo.mes}": ${periodo.coeficiente}`);
        }
      } else {
        warnings.push(`Mês "${periodo.mes}" não reconhecido e foi ignorado`);
      }
    });

    // Aplicar curva de aprendizado
    const curveUpdate: any = {
      rhythmReducer: data.curvaAprendizado.redutorInicial,
      increment: data.curvaAprendizado.incrementoPorPeriodo,
      periodWeeks: data.curvaAprendizado.periodoSemanas,
      durationMultiplier: data.curvaAprendizado.multiplicadorDuracao,
      durationImpactWeeks: data.curvaAprendizado.semanasImpactadas
    };

    if (data.curvaAprendizado.pacotesAplicados) {
      const pacotesNomes = data.curvaAprendizado.pacotesAplicados
        .split(',')
        .map(nome => nome.trim())
        .filter(nome => nome.length > 0);
      
      // Verificar se os pacotes existem
      const existentPackages = store.workPackages.map(pkg => pkg.name);
      const validPackages = pacotesNomes.filter(nome => existentPackages.includes(nome));
      const invalidPackages = pacotesNomes.filter(nome => !existentPackages.includes(nome));
      
      if (invalidPackages.length > 0) {
        warnings.push(`Pacotes não encontrados: ${invalidPackages.join(', ')}`);
      }
      
      curveUpdate.appliedPackages = validPackages;
    }

    store.updateLearningCurve(curveUpdate);

    return {
      success: errors.length === 0,
      errors,
      warnings
    };

  } catch (error) {
    return {
      success: false,
      errors: [`Erro interno: ${error}`],
      warnings
    };
  }
}

// Função para aplicar dados de pacotes importados ao store
export function applyPackagesToStore(
  data: PackagesSpreadsheetData,
  store: {
    workPackages: any[];
    addWorkPackage: (pkg: any) => void;
    removeWorkPackage: (index: number) => void;
  }
): ImportResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Verificar se há pacotes válidos
    if (data.pacotes.length === 0) {
      return {
        success: false,
        errors: ['Nenhum pacote encontrado na planilha'],
        warnings
      };
    }

    // Limpar pacotes existentes
    const currentPackagesCount = store.workPackages.length;
    for (let i = currentPackagesCount - 1; i >= 0; i--) {
      store.removeWorkPackage(i);
    }

    // Adicionar novos pacotes
    data.pacotes.forEach((pacote, index) => {
      // Validações
      const pacoteErrors: string[] = [];
      
      if (!pacote.nome || pacote.nome.trim() === '') {
        pacoteErrors.push('Nome é obrigatório');
      }
      if (pacote.duracaoSemanas <= 0) {
        pacoteErrors.push('Duração deve ser maior que 0');
      }
      if (pacote.ritmo <= 0 || !Number.isInteger(pacote.ritmo)) {
        pacoteErrors.push('Ritmo deve ser um número inteiro maior que 0');
      }
      if (pacote.latenciaSemanas < 0) {
        pacoteErrors.push('Latência não pode ser negativa');
      }
      if (pacote.custo < 0) {
        pacoteErrors.push('Custo não pode ser negativo');
      }

      if (pacoteErrors.length > 0) {
        errors.push(`Pacote "${pacote.nome}" (linha ${index + 2}): ${pacoteErrors.join(', ')}`);
      } else {
        // Adicionar pacote válido
        store.addWorkPackage({
          name: pacote.nome.trim(),
          duration: pacote.duracaoSemanas,
          rhythm: pacote.ritmo,
          latency: pacote.latenciaSemanas,
          cost: pacote.custo
        });
      }
    });

    // Verificar nomes duplicados
    const nomes = data.pacotes.map(p => p.nome.toLowerCase().trim());
    const nomesDuplicados = nomes.filter((nome, index) => 
      nome && nomes.indexOf(nome) !== index
    );
    
    if (nomesDuplicados.length > 0) {
      warnings.push('Alguns pacotes têm nomes duplicados. Apenas a primeira ocorrência foi mantida.');
    }

    return {
      success: errors.length === 0,
      errors,
      warnings
    };

  } catch (error) {
    return {
      success: false,
      errors: [`Erro interno: ${error}`],
      warnings
    };
  }
}

// Função para validar arquivo antes do processamento
export function validateUploadFile(file: File): string[] {
  const errors: string[] = [];

  // Verificar tipo de arquivo
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'application/octet-stream' // fallback para alguns browsers
  ];

  if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.xlsx')) {
    errors.push('Arquivo deve ser uma planilha Excel (.xlsx)');
  }

  // Verificar tamanho (máximo 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    errors.push('Arquivo muito grande. Tamanho máximo: 5MB');
  }

  return errors;
}

// Função para gerar nome de arquivo com timestamp
export function generateFileName(prefix: string): string {
  const now = new Date();
  const timestamp = now.toISOString().split('T')[0].replace(/-/g, '');
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '');
  return `${prefix}_${timestamp}_${time}.xlsx`;
}