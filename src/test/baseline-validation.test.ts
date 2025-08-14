/**
 * Teste automatizado para validação da implementação da Linha de Balanço
 * Baseado na matriz gabarito fornecida
 */

import { calculateBaseline } from '../lib/calculations';
import { ProjectData } from '../lib/types';

describe('Validação da Linha de Balanço', () => {
  const testData: ProjectData = {
    housesCount: 116,
    startDate: '2026-04-06',
    stopPeriods: [],
    partialReductionPeriods: [],
    workPackages: [
      {
        name: 'Pré-Obra',
        duration: 14, // 2 semanas base
        rhythm: 10,
        latency: 28,  // 4 semanas de latência
        color: '#FF0000',
        cost: 0
      },
      {
        name: 'Estacas',
        duration: 7,  // 1 semana base
        rhythm: 12,
        latency: 0,
        color: '#00FF00',
        cost: 0
      },
      {
        name: 'Infraestrutura Enterrada',
        duration: 7,  // 1 semana base
        rhythm: 12,
        latency: 0,
        color: '#0000FF',
        cost: 0
      }
    ],
    learningCurve: {
      rhythmReducer: 0.60,
      increment: 0.20,
      periodWeeks: 4,
      durationMultiplier: 2.00,
      impactedWeeks: 6,
      durationImpactWeeks: 6
    }
  };

  test('Curva de aprendizado do ritmo para Pré-Obra', () => {
    const result = calculateBaseline(testData);
    
    // Contar quantas casas iniciam Pré-Obra em cada semana
    const preObraStarts: Record<number, number> = {};
    for (let i = 0; i < 116; i++) {
      const cells = result.matrix[i].filter(c => c.packageName === 'Pré-Obra');
      if (cells.length > 0) {
        const startWeek = Math.min(...cells.map(c => c.weekIndex)) + 1;
        preObraStarts[startWeek] = (preObraStarts[startWeek] || 0) + 1;
      }
    }

    // Validar curva de aprendizado do ritmo
    expect(preObraStarts[1]).toBe(6);  // Semana 1: 60% de 10 = 6 casas
    expect(preObraStarts[2]).toBe(6);  // Semana 2: 60% de 10 = 6 casas
    expect(preObraStarts[3]).toBe(6);  // Semana 3: 60% de 10 = 6 casas
    expect(preObraStarts[4]).toBe(6);  // Semana 4: 60% de 10 = 6 casas
    expect(preObraStarts[5]).toBe(8);  // Semana 5: 80% de 10 = 8 casas
    expect(preObraStarts[6]).toBe(8);  // Semana 6: 80% de 10 = 8 casas
    expect(preObraStarts[7]).toBe(8);  // Semana 7: 80% de 10 = 8 casas
    expect(preObraStarts[8]).toBe(8);  // Semana 8: 80% de 10 = 8 casas
    expect(preObraStarts[9]).toBe(10); // Semana 9: 100% de 10 = 10 casas
    expect(preObraStarts[10]).toBe(10); // Semana 10: 100% de 10 = 10 casas
  });

  test('Duração dos serviços com curva de aprendizado', () => {
    const result = calculateBaseline(testData);
    
    // Casa 1 - primeiras 6 casas devem ter duração dobrada
    const casa1 = result.matrix[0];
    const casa1PreObra = casa1.filter(c => c.packageName === 'Pré-Obra');
    const casa1Estacas = casa1.filter(c => c.packageName === 'Estacas');
    const casa1Infra = casa1.filter(c => c.packageName === 'Infraestrutura Enterrada');
    
    // Pré-Obra: 14 dias * 2 = 28 dias = 4 semanas
    expect(casa1PreObra.length).toBe(4);
    
    // Estacas: 7 dias * 2 = 14 dias = 2 semanas (primeiras 6 semanas do serviço)
    expect(casa1Estacas.length).toBe(2);
    
    // Infra: 7 dias * 2 = 14 dias = 2 semanas (primeiras 6 semanas do serviço)
    expect(casa1Infra.length).toBe(2);
  });

  test('Latência entre serviços', () => {
    const result = calculateBaseline(testData);
    
    // Casa 1
    const casa1 = result.matrix[0];
    const casa1PreObra = casa1.filter(c => c.packageName === 'Pré-Obra').map(c => c.weekIndex);
    const casa1Estacas = casa1.filter(c => c.packageName === 'Estacas').map(c => c.weekIndex);
    
    const preObraFim = Math.max(...casa1PreObra);
    const estacasInicio = Math.min(...casa1Estacas);
    
    // Latência de 4 semanas entre Pré-Obra e Estacas
    expect(estacasInicio - preObraFim).toBe(4);
  });

  test('Sequência correta dos serviços', () => {
    const result = calculateBaseline(testData);
    
    // Verificar algumas casas específicas
    const casasParaVerificar = [
      { casa: 1, preObra: [1, 2, 3, 4], estacas: [9, 10], infra: [11, 12] },
      { casa: 7, preObra: [2, 3, 4, 5], estacas: [10, 11], infra: [12, 13] },
      { casa: 14, preObra: [3, 4, 5, 6], estacas: [11, 12], infra: [13, 14] },
    ];
    
    casasParaVerificar.forEach(({ casa, preObra, estacas, infra }) => {
      const houseIndex = casa - 1;
      const cells = result.matrix[houseIndex];
      
      const preObraCells = cells.filter(c => c.packageName === 'Pré-Obra').map(c => c.weekIndex + 1);
      const estacasCells = cells.filter(c => c.packageName === 'Estacas').map(c => c.weekIndex + 1);
      const infraCells = cells.filter(c => c.packageName === 'Infraestrutura Enterrada').map(c => c.weekIndex + 1);
      
      expect(preObraCells).toEqual(preObra);
      expect(estacasCells).toEqual(estacas);
      expect(infraCells).toEqual(infra);
    });
  });

  test('Curva de aprendizado dos serviços subsequentes', () => {
    const result = calculateBaseline(testData);
    
    // Contar quantas casas iniciam Estacas em cada semana
    const estacasStarts: Record<number, number> = {};
    for (let i = 0; i < 116; i++) {
      const cells = result.matrix[i].filter(c => c.packageName === 'Estacas');
      if (cells.length > 0) {
        const startWeek = Math.min(...cells.map(c => c.weekIndex)) + 1;
        estacasStarts[startWeek] = (estacasStarts[startWeek] || 0) + 1;
      }
    }
    
    // Estacas começa na semana 9 para as primeiras casas
    // Primeiras 4 semanas DO SERVIÇO: 7 casas/semana (≈60% de 12)
    expect(estacasStarts[9]).toBe(7);   // Semana 1 do serviço
    expect(estacasStarts[10]).toBe(7);  // Semana 2 do serviço
    expect(estacasStarts[11]).toBe(7);  // Semana 3 do serviço
    expect(estacasStarts[12]).toBe(7);  // Semana 4 do serviço
    
    // Próximas 4 semanas DO SERVIÇO: 10 casas/semana (≈80% de 12)
    expect(estacasStarts[13]).toBe(10); // Semana 5 do serviço
    expect(estacasStarts[14]).toBe(10); // Semana 6 do serviço
    expect(estacasStarts[15]).toBe(10); // Semana 7 do serviço
    expect(estacasStarts[16]).toBe(10); // Semana 8 do serviço
    
    // Após 8 semanas DO SERVIÇO: 12 casas/semana (100%)
    expect(estacasStarts[17]).toBe(12); // Semana 9 do serviço
  });
});

// Função para executar os testes manualmente
function runTests() {
  console.log('Executando testes de validação...\n');
  
  const testResults: { name: string; passed: boolean; error?: string }[] = [];
  
  // Executar cada teste
  const tests = [
    {
      name: 'Curva de aprendizado do ritmo para Pré-Obra',
      fn: () => {
        const result = calculateBaseline(testData);
        const preObraStarts: Record<number, number> = {};
        for (let i = 0; i < 116; i++) {
          const cells = result.matrix[i].filter(c => c.packageName === 'Pré-Obra');
          if (cells.length > 0) {
            const startWeek = Math.min(...cells.map(c => c.weekIndex)) + 1;
            preObraStarts[startWeek] = (preObraStarts[startWeek] || 0) + 1;
          }
        }
        
        const checks = [
          { week: 1, expected: 6, actual: preObraStarts[1] },
          { week: 2, expected: 6, actual: preObraStarts[2] },
          { week: 3, expected: 6, actual: preObraStarts[3] },
          { week: 4, expected: 6, actual: preObraStarts[4] },
          { week: 5, expected: 8, actual: preObraStarts[5] },
          { week: 6, expected: 8, actual: preObraStarts[6] },
          { week: 7, expected: 8, actual: preObraStarts[7] },
          { week: 8, expected: 8, actual: preObraStarts[8] },
          { week: 9, expected: 10, actual: preObraStarts[9] },
          { week: 10, expected: 10, actual: preObraStarts[10] },
        ];
        
        for (const check of checks) {
          if (check.actual !== check.expected) {
            throw new Error(`Semana ${check.week}: esperado ${check.expected}, obtido ${check.actual}`);
          }
        }
      }
    },
    {
      name: 'Duração dos serviços com curva de aprendizado',
      fn: () => {
        const result = calculateBaseline(testData);
        const casa1 = result.matrix[0];
        const casa1PreObra = casa1.filter(c => c.packageName === 'Pré-Obra');
        const casa1Estacas = casa1.filter(c => c.packageName === 'Estacas');
        const casa1Infra = casa1.filter(c => c.packageName === 'Infraestrutura Enterrada');
        
        if (casa1PreObra.length !== 4) {
          throw new Error(`Pré-Obra: esperado 4 semanas, obtido ${casa1PreObra.length}`);
        }
        if (casa1Estacas.length !== 2) {
          throw new Error(`Estacas: esperado 2 semanas, obtido ${casa1Estacas.length}`);
        }
        if (casa1Infra.length !== 2) {
          throw new Error(`Infra: esperado 2 semanas, obtido ${casa1Infra.length}`);
        }
      }
    },
    {
      name: 'Latência entre serviços',
      fn: () => {
        const result = calculateBaseline(testData);
        const casa1 = result.matrix[0];
        const casa1PreObra = casa1.filter(c => c.packageName === 'Pré-Obra').map(c => c.weekIndex);
        const casa1Estacas = casa1.filter(c => c.packageName === 'Estacas').map(c => c.weekIndex);
        
        const preObraFim = Math.max(...casa1PreObra);
        const estacasInicio = Math.min(...casa1Estacas);
        const latencia = estacasInicio - preObraFim;
        
        if (latencia !== 4) {
          throw new Error(`Latência: esperado 4 semanas, obtido ${latencia}`);
        }
      }
    }
  ];
  
  tests.forEach(test => {
    try {
      test.fn();
      testResults.push({ name: test.name, passed: true });
      console.log(`✓ ${test.name}`);
    } catch (error: any) {
      testResults.push({ name: test.name, passed: false, error: error.message });
      console.log(`✗ ${test.name}: ${error.message}`);
    }
  });
  
  // Resumo
  const passed = testResults.filter(r => r.passed).length;
  const failed = testResults.filter(r => !r.passed).length;
  
  console.log('\n' + '='.repeat(50));
  console.log(`Resultados: ${passed} passou, ${failed} falhou`);
  
  return failed === 0;
}

// Se executado diretamente, rodar os testes
// @ts-ignore
if (typeof require !== 'undefined' && require.main === module) {
  const testData: ProjectData = {
    housesCount: 116,
    startDate: '2026-04-06',
    stopPeriods: [],
    partialReductionPeriods: [],
    workPackages: [
      {
        name: 'Pré-Obra',
        duration: 14,
        rhythm: 10,
        latency: 28,
        color: '#FF0000',
        cost: 0
      },
      {
        name: 'Estacas',
        duration: 7,
        rhythm: 12,
        latency: 0,
        color: '#00FF00',
        cost: 0
      },
      {
        name: 'Infraestrutura Enterrada',
        duration: 7,
        rhythm: 12,
        latency: 0,
        color: '#0000FF',
        cost: 0
      }
    ],
    learningCurve: {
      rhythmReducer: 0.60,
      increment: 0.20,
      periodWeeks: 4,
      durationMultiplier: 2.00,
      impactedWeeks: 6,
      durationImpactWeeks: 6
    }
  };
  
  const success = runTests();
  process.exit(success ? 0 : 1);
}

export { runTests };