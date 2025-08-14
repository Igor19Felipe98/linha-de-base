import * as XLSX from 'xlsx';
import { WorkPackage, StopPeriod, PartialReductionPeriod, LearningCurve } from '@/lib/types';

// Interfaces para dados de planilha
export interface ConfigSpreadsheetData {
  dadosBasicos: {
    quantidadeCasas: number;
    dataInicio: string; // formato DD/MM/AAAA
  };
  periodosParada: Array<{
    mes: string;
    descricao?: string;
  }>;
  periodosReducao: Array<{
    mes: string;
    coeficiente: number;
    descricao?: string;
  }>;
  curvaAprendizado: {
    redutorInicial: number;
    incrementoPorPeriodo: number;
    periodoSemanas: number;
    multiplicadorDuracao: number;
    semanasImpactadas: number;
    pacotesAplicados?: string; // lista separada por vírgula
  };
}

export interface PackagesSpreadsheetData {
  pacotes: Array<{
    nome: string;
    duracaoSemanas: number;
    ritmo: number;
    latenciaSemanas: number;
    custo: number;
  }>;
}

// Função para gerar planilha modelo de configurações
export function generateConfigTemplate(): Uint8Array {
  const wb = XLSX.utils.book_new();

  // Aba 1: Dados Básicos
  const dadosBasicos = [
    ['Campo', 'Valor', 'Observações'],
    ['Quantidade de Casas', 100, 'Número entre 1 e 10000'],
    ['Data de Início', '06/01/2025', 'Formato DD/MM/AAAA - deve ser segunda-feira']
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(dadosBasicos);
  
  // Formatar a célula da data como texto
  if (!ws1['!cols']) ws1['!cols'] = [];
  ws1['!cols'][1] = { wch: 15 }; // largura da coluna
  
  // Forçar a célula B3 (Data de Início) como texto
  if (ws1['B3']) {
    ws1['B3'].t = 's'; // tipo string
    ws1['B3'].z = '@'; // formato texto
  }
  
  XLSX.utils.book_append_sheet(wb, ws1, 'Dados Básicos');

  // Aba 2: Períodos de Parada
  const periodosParada = [
    ['Mês', 'Descrição'],
    ['janeiro', 'Exemplo: Festividades de ano novo'],
    ['dezembro', 'Exemplo: Festividades de fim de ano']
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(periodosParada);
  XLSX.utils.book_append_sheet(wb, ws2, 'Períodos Parada');

  // Aba 3: Períodos de Redução
  const periodosReducao = [
    ['Mês', 'Coeficiente', 'Descrição'],
    ['fevereiro', 0.7, 'Exemplo: Carnaval - 70% da produtividade'],
    ['julho', 0.8, 'Exemplo: Férias escolares - 80% da produtividade']
  ];

  const ws3 = XLSX.utils.aoa_to_sheet(periodosReducao);
  XLSX.utils.book_append_sheet(wb, ws3, 'Períodos Redução');

  // Aba 4: Curva de Aprendizado
  const curvaAprendizado = [
    ['Parâmetro', 'Valor', 'Descrição'],
    ['Redutor Inicial', 0.6, 'Fator de redução inicial (ex: 0.60 = 60%)'],
    ['Incremento por Período', 0.2, 'Melhoria a cada período (ex: 0.20 = +20%)'],
    ['Período (semanas)', 4, 'Duração de cada período de melhoria'],
    ['Multiplicador de Duração', 2.0, 'Fator de duração inicial (ex: 2.0 = dobro do tempo)'],
    ['Semanas Impactadas', 6, 'Semanas afetadas na curva de duração'],
    ['Pacotes Aplicados', '', 'Nomes dos pacotes separados por vírgula (vazio = todos)']
  ];

  const ws4 = XLSX.utils.aoa_to_sheet(curvaAprendizado);
  XLSX.utils.book_append_sheet(wb, ws4, 'Curva Aprendizado');

  // Aba 5: Instruções
  const instrucoes = [
    ['INSTRUÇÕES PARA PREENCHIMENTO'],
    [''],
    ['1. DADOS BÁSICOS:'],
    ['   - Preencha apenas a coluna "Valor"'],
    ['   - Data deve estar no formato DD/MM/AAAA'],
    ['   - Data deve ser uma segunda-feira'],
    [''],
    ['2. PERÍODOS DE PARADA:'],
    ['   - Liste os meses com parada total (coeficiente 0)'],
    ['   - Use nomes de meses em minúsculo'],
    ['   - Descrição é opcional'],
    [''],
    ['3. PERÍODOS DE REDUÇÃO:'],
    ['   - Liste os meses com produtividade reduzida'],
    ['   - Coeficiente entre 0.01 e 0.99'],
    ['   - Use nomes de meses em minúsculo'],
    [''],
    ['4. CURVA DE APRENDIZADO:'],
    ['   - Preencha apenas a coluna "Valor"'],
    ['   - Para "Pacotes Aplicados", liste nomes separados por vírgula'],
    ['   - Se vazio, será aplicado a todos os pacotes'],
    [''],
    ['5. APÓS PREENCHER:'],
    ['   - Salve o arquivo'],
    ['   - Faça upload na página de configurações'],
    ['   - O sistema validará os dados automaticamente']
  ];

  const ws5 = XLSX.utils.aoa_to_sheet(instrucoes);
  XLSX.utils.book_append_sheet(wb, ws5, 'Instruções');

  return new Uint8Array(XLSX.write(wb, { bookType: 'xlsx', type: 'array' }));
}

// Função para gerar planilha modelo de pacotes
export function generatePackagesTemplate(): Uint8Array {
  const wb = XLSX.utils.book_new();

  // Aba 1: Pacotes de Trabalho
  const pacotes = [
    ['Nome', 'Duração (semanas)', 'Ritmo (casas/semana)', 'Latência (semanas)', 'Custo (R$)'],
    ['', '', '', '', ''],
    ['EXEMPLOS (delete as linhas abaixo):', '', '', '', ''],
    ['Fundação', 2, 5, 0, 25000],
    ['Estrutura', 3, 3, 1, 45000],
    ['Alvenaria', 4, 4, 2, 35000],
    ['Cobertura', 2, 2, 1, 20000],
    ['Acabamento', 6, 2, 3, 55000]
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(pacotes);
  
  // Formatação da planilha
  if (!ws1['!cols']) ws1['!cols'] = [];
  ws1['!cols'][0] = { wch: 20 }; // Nome
  ws1['!cols'][1] = { wch: 18 }; // Duração
  ws1['!cols'][2] = { wch: 20 }; // Ritmo
  ws1['!cols'][3] = { wch: 18 }; // Latência
  ws1['!cols'][4] = { wch: 15 }; // Custo
  
  // Destacar linha de exemplos
  if (ws1['A3']) {
    ws1['A3'].s = { font: { bold: true, color: { rgb: "FF0000" } } };
  }
  
  XLSX.utils.book_append_sheet(wb, ws1, 'Pacotes');

  // Aba 2: Instruções
  const instrucoes = [
    ['INSTRUÇÕES PARA PREENCHIMENTO DA PLANILHA DE PACOTES'],
    [''],
    ['COMO PREENCHER:'],
    [''],
    ['1. Vá para a aba "Pacotes"'],
    ['2. Delete a linha "EXEMPLOS (delete as linhas abaixo):" e todas as linhas de exemplo'],
    ['3. Na linha 2, comece a preencher seus pacotes reais'],
    ['4. Preencha uma linha para cada pacote do seu projeto'],
    [''],
    ['CAMPOS OBRIGATÓRIOS:'],
    [''],
    ['📋 NOME:'],
    ['   • Nome do pacote de trabalho (ex: "Fundação", "Estrutura")'],
    ['   • Deve ser único (não repetir nomes)'],
    ['   • Evite caracteres especiais'],
    [''],
    ['⏱️ DURAÇÃO (SEMANAS):'],
    ['   • Tempo para completar o pacote em UMA casa'],
    ['   • Exemplos: 2 = duas semanas, 1.5 = uma semana e meia'],
    ['   • Deve ser maior que 0'],
    [''],
    ['🏗️ RITMO (CASAS/SEMANA):'],
    ['   • Quantas casas podem INICIAR o pacote simultaneamente por semana'],
    ['   • Exemplo: 5 = podem iniciar 5 casas por semana'],
    ['   • Deve ser número inteiro maior que 0'],
    [''],
    ['⏳ LATÊNCIA (SEMANAS):'],
    ['   • Tempo de espera entre o fim deste pacote e início do próximo'],
    ['   • Exemplo: 1 = esperar 1 semana para iniciar próximo pacote'],
    ['   • Pode ser 0 (sem espera)'],
    [''],
    ['💰 CUSTO (R$):'],
    ['   • Custo do pacote por casa'],
    ['   • Apenas números (ex: 25000, não R$ 25.000,00)'],
    ['   • Deve ser maior que 0'],
    [''],
    ['EXEMPLO PRÁTICO:'],
    ['Nome: "Fundação" | Duração: 2 | Ritmo: 5 | Latência: 0 | Custo: 25000'],
    ['Significa: Cada casa leva 2 semanas para fazer a fundação,'],
    ['podem iniciar 5 casas por semana, não há espera para próximo pacote,'],
    ['e custa R$ 25.000 por casa.'],
    [''],
    ['DICAS IMPORTANTES:'],
    [''],
    ['• Os pacotes são executados na ORDEM listada na planilha'],
    ['• Não deixe linhas vazias entre os pacotes'],
    ['• Salve o arquivo antes de fazer upload'],
    ['• O sistema irá validar automaticamente todos os dados']
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(instrucoes);
  XLSX.utils.book_append_sheet(wb, ws2, 'Instruções');

  return new Uint8Array(XLSX.write(wb, { bookType: 'xlsx', type: 'array' }));
}

// Função para processar planilha de configurações
export function parseConfigSpreadsheet(file: File): Promise<ConfigSpreadsheetData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const result: ConfigSpreadsheetData = {
          dadosBasicos: {
            quantidadeCasas: 0,
            dataInicio: ''
          },
          periodosParada: [],
          periodosReducao: [],
          curvaAprendizado: {
            redutorInicial: 0.6,
            incrementoPorPeriodo: 0.2,
            periodoSemanas: 4,
            multiplicadorDuracao: 2.0,
            semanasImpactadas: 6
          }
        };

        // Processar Dados Básicos
        if (workbook.SheetNames.includes('Dados Básicos')) {
          const ws = workbook.Sheets['Dados Básicos'];
          const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
          
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row[0] === 'Quantidade de Casas' && row[1]) {
              result.dadosBasicos.quantidadeCasas = Number(row[1]);
            }
            if (row[0] === 'Data de Início' && row[1]) {
              // Normalizar formato da data
              let dateStr = String(row[1]).trim();
              
              // Se vier como número (formato de data do Excel), converter
              if (!isNaN(Number(dateStr)) && Number(dateStr) > 40000) {
                // É uma data serial do Excel, converter para DD/MM/AAAA
                const excelDate = new Date((Number(dateStr) - 25569) * 86400 * 1000);
                const day = String(excelDate.getDate()).padStart(2, '0');
                const month = String(excelDate.getMonth() + 1).padStart(2, '0');
                const year = excelDate.getFullYear();
                dateStr = `${day}/${month}/${year}`;
              }
              
              // Se vier no formato AAAA-MM-DD, converter para DD/MM/AAAA
              if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const [year, month, day] = dateStr.split('-');
                dateStr = `${day}/${month}/${year}`;
              }
              
              result.dadosBasicos.dataInicio = dateStr;
            }
          }
        }

        // Processar Períodos de Parada
        if (workbook.SheetNames.includes('Períodos Parada')) {
          const ws = workbook.Sheets['Períodos Parada'];
          const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
          
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row[0] && row[0].trim()) {
              result.periodosParada.push({
                mes: String(row[0]).toLowerCase().trim(),
                descricao: row[1] ? String(row[1]) : undefined
              });
            }
          }
        }

        // Processar Períodos de Redução
        if (workbook.SheetNames.includes('Períodos Redução')) {
          const ws = workbook.Sheets['Períodos Redução'];
          const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
          
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row[0] && row[0].trim() && row[1] !== undefined) {
              result.periodosReducao.push({
                mes: String(row[0]).toLowerCase().trim(),
                coeficiente: Number(row[1]),
                descricao: row[2] ? String(row[2]) : undefined
              });
            }
          }
        }

        // Processar Curva de Aprendizado
        if (workbook.SheetNames.includes('Curva Aprendizado')) {
          const ws = workbook.Sheets['Curva Aprendizado'];
          const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
          
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row[0] && row[1] !== undefined) {
              const param = String(row[0]);
              const valor = row[1];
              
              switch (param) {
                case 'Redutor Inicial':
                  result.curvaAprendizado.redutorInicial = Number(valor);
                  break;
                case 'Incremento por Período':
                  result.curvaAprendizado.incrementoPorPeriodo = Number(valor);
                  break;
                case 'Período (semanas)':
                  result.curvaAprendizado.periodoSemanas = Number(valor);
                  break;
                case 'Multiplicador de Duração':
                  result.curvaAprendizado.multiplicadorDuracao = Number(valor);
                  break;
                case 'Semanas Impactadas':
                  result.curvaAprendizado.semanasImpactadas = Number(valor);
                  break;
                case 'Pacotes Aplicados':
                  result.curvaAprendizado.pacotesAplicados = valor ? String(valor) : undefined;
                  break;
              }
            }
          }
        }

        resolve(result);
      } catch (error) {
        reject(new Error(`Erro ao processar planilha: ${error}`));
      }
    };

    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsArrayBuffer(file);
  });
}

// Função para processar planilha de pacotes
export function parsePackagesSpreadsheet(file: File): Promise<PackagesSpreadsheetData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const result: PackagesSpreadsheetData = {
          pacotes: []
        };

        // Processar Pacotes
        if (workbook.SheetNames.includes('Pacotes')) {
          const ws = workbook.Sheets['Pacotes'];
          const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
          
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row[0] && row[0].trim()) {
              result.pacotes.push({
                nome: String(row[0]).trim(),
                duracaoSemanas: Number(row[1]) || 1,
                ritmo: Number(row[2]) || 1,
                latenciaSemanas: Number(row[3]) || 0,
                custo: Number(row[4]) || 0
              });
            }
          }
        }

        resolve(result);
      } catch (error) {
        reject(new Error(`Erro ao processar planilha: ${error}`));
      }
    };

    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsArrayBuffer(file);
  });
}

// Função para download de arquivo
export function downloadFile(data: Uint8Array, filename: string) {
  const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Função para validar dados de configuração importados
export function validateConfigData(data: ConfigSpreadsheetData): string[] {
  const errors: string[] = [];

  // Validar dados básicos
  if (!data.dadosBasicos.quantidadeCasas || data.dadosBasicos.quantidadeCasas <= 0) {
    errors.push('Quantidade de casas deve ser maior que 0');
  }
  if (data.dadosBasicos.quantidadeCasas > 10000) {
    errors.push('Quantidade de casas não pode ser maior que 10000');
  }
  
  // Validar data de início
  if (!data.dadosBasicos.dataInicio) {
    errors.push('Data de início é obrigatória');
  } else {
    const dateStr = data.dadosBasicos.dataInicio.trim();
    if (!dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      errors.push('Data de início deve estar no formato DD/MM/AAAA');
    } else {
      // Validar se é uma data válida
      const [day, month, year] = dateStr.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      
      if (date.getFullYear() !== year || 
          date.getMonth() !== month - 1 || 
          date.getDate() !== day) {
        errors.push('Data de início inválida');
      } else if (date.getDay() !== 1) {
        // Verificar se é segunda-feira (0 = domingo, 1 = segunda)
        errors.push('Data de início deve ser uma segunda-feira');
      }
    }
  }

  // Validar períodos de redução
  data.periodosReducao.forEach((periodo, index) => {
    if (periodo.coeficiente <= 0 || periodo.coeficiente >= 1) {
      errors.push(`Período de redução ${index + 1}: coeficiente deve estar entre 0.01 e 0.99`);
    }
  });

  // Validar curva de aprendizado
  if (data.curvaAprendizado.redutorInicial <= 0 || data.curvaAprendizado.redutorInicial > 1) {
    errors.push('Redutor inicial deve estar entre 0.01 e 1');
  }
  if (data.curvaAprendizado.incrementoPorPeriodo < 0 || data.curvaAprendizado.incrementoPorPeriodo > 0.5) {
    errors.push('Incremento por período deve estar entre 0 e 0.5');
  }
  if (data.curvaAprendizado.periodoSemanas < 1 || data.curvaAprendizado.periodoSemanas > 12) {
    errors.push('Período deve estar entre 1 e 12 semanas');
  }

  return errors;
}

// Função para validar dados de pacotes importados
export function validatePackagesData(data: PackagesSpreadsheetData): string[] {
  const errors: string[] = [];

  if (data.pacotes.length === 0) {
    errors.push('Pelo menos um pacote deve ser definido');
  }

  data.pacotes.forEach((pacote, index) => {
    if (!pacote.nome || pacote.nome.trim() === '') {
      errors.push(`Pacote ${index + 1}: nome é obrigatório`);
    }
    if (pacote.duracaoSemanas <= 0) {
      errors.push(`Pacote ${index + 1}: duração deve ser maior que 0`);
    }
    if (pacote.ritmo <= 0 || !Number.isInteger(pacote.ritmo)) {
      errors.push(`Pacote ${index + 1}: ritmo deve ser um número inteiro maior que 0`);
    }
    if (pacote.latenciaSemanas < 0) {
      errors.push(`Pacote ${index + 1}: latência não pode ser negativa`);
    }
    if (pacote.custo < 0) {
      errors.push(`Pacote ${index + 1}: custo não pode ser negativo`);
    }
  });

  // Verificar nomes duplicados
  const nomes = data.pacotes.map(p => p.nome.toLowerCase());
  const nomesDuplicados = nomes.filter((nome, index) => nomes.indexOf(nome) !== index);
  if (nomesDuplicados.length > 0) {
    errors.push('Nomes de pacotes devem ser únicos');
  }

  return errors;
}