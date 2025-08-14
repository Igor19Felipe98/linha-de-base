// Teste de validação da matriz gabarito
// Este arquivo testa se a implementação está calculando corretamente conforme as regras de negócio

import { calculateBaseline, ProjectData } from './lib';

// Configuração do teste com apenas 3 primeiros pacotes e 116 casas
const testData: ProjectData = {
  housesCount: 116,
  startDate: '2026-04-06',
  stopPeriods: [],
  partialReductionPeriods: [],
  workPackages: [
    {
      name: 'Pré-Obra',
      duration: 56, // 8 semanas (56/7 = 8)
      rhythm: 10,   // 10 casas/semana (base)
      latency: 28,  // 4 semanas de latência (28/7 = 4)
      color: '#FF0000',
      cost: 0
    },
    {
      name: 'Estacas',
      duration: 7,  // 1 semana
      rhythm: 12,   // 12 casas/semana (base)
      latency: 0,   // sem latência
      color: '#00FF00',
      cost: 0
    },
    {
      name: 'Infraestrutura Enterrada',
      duration: 7,  // 1 semana
      rhythm: 12,   // 12 casas/semana (base)
      latency: 0,   // sem latência
      color: '#0000FF',
      cost: 0
    }
  ],
  learningCurve: {
    rhythmReducer: 0.60,      // 60% do ritmo inicial
    increment: 0.20,          // incremento de 20%
    periodWeeks: 4,           // período de 4 semanas
    durationMultiplier: 2.00, // dobra a duração
    durationImpactWeeks: 6    // 6 semanas de impacto na duração
  }
};

// Matriz gabarito esperada (simplificada para visualização)
const expectedMatrix: Record<number, Record<number, string>> = {
  // Casa 1-6: Pré-Obra semanas 1-4, Estacas semanas 9-10, Infra semanas 11-12
  1: {1: 'Pré-Obra', 2: 'Pré-Obra', 3: 'Pré-Obra', 4: 'Pré-Obra', 9: 'Estacas', 10: 'Estacas', 11: 'Infra', 12: 'Infra'},
  6: {1: 'Pré-Obra', 2: 'Pré-Obra', 3: 'Pré-Obra', 4: 'Pré-Obra', 9: 'Estacas', 10: 'Estacas', 11: 'Infra', 12: 'Infra'},
  
  // Casa 7-13: Pré-Obra semanas 2-5, Estacas semanas 10-11, Infra semanas 12-13
  7: {2: 'Pré-Obra', 3: 'Pré-Obra', 4: 'Pré-Obra', 5: 'Pré-Obra', 10: 'Estacas', 11: 'Estacas', 12: 'Infra', 13: 'Infra'},
  13: {2: 'Pré-Obra', 3: 'Pré-Obra', 4: 'Pré-Obra', 5: 'Pré-Obra', 10: 'Estacas', 11: 'Estacas', 12: 'Infra', 13: 'Infra'},
  
  // Casa 14-21: Pré-Obra semanas 3-6, Estacas semanas 11-12, Infra semanas 13-14
  14: {3: 'Pré-Obra', 4: 'Pré-Obra', 5: 'Pré-Obra', 6: 'Pré-Obra', 11: 'Estacas', 12: 'Estacas', 13: 'Infra', 14: 'Infra'},
  21: {3: 'Pré-Obra', 4: 'Pré-Obra', 5: 'Pré-Obra', 6: 'Pré-Obra', 11: 'Estacas', 12: 'Estacas', 13: 'Infra', 14: 'Infra'},
  
  // Casa 48: Pré-Obra semanas 5-8, Estacas semanas 13-14, Infra semanas 15-16
  48: {5: 'Pré-Obra', 6: 'Pré-Obra', 7: 'Pré-Obra', 8: 'Pré-Obra', 13: 'Estacas', 14: 'Estacas', 15: 'Infra', 16: 'Infra'},
  
  // Casa 116: Pré-Obra semanas 11-12, Estacas semana 17, Infra semana 18
  116: {11: 'Pré-Obra', 12: 'Pré-Obra', 17: 'Estacas', 18: 'Infra'}
};

function validateMatrix() {
  console.log('Iniciando validação da matriz...\n');
  
  const result = calculateBaseline(testData);
  
  let errors = 0;
  let successes = 0;
  
  // Verificar casas específicas
  const casesToCheck = [1, 6, 7, 13, 14, 21, 48, 116];
  
  for (const houseNum of casesToCheck) {
    const houseIndex = houseNum - 1;
    const houseCells = result.matrix[houseIndex];
    
    console.log(`\nCasa ${houseNum}:`);
    
    // Criar mapa de semanas para esta casa
    const houseWeekMap: Record<number, string> = {};
    houseCells.forEach(cell => {
      houseWeekMap[cell.weekIndex + 1] = cell.packageName;
    });
    
    // Comparar com o esperado
    const expected = expectedMatrix[houseNum];
    if (expected) {
      for (const [week, expectedPackage] of Object.entries(expected)) {
        const weekNum = parseInt(week);
        const actualPackage = houseWeekMap[weekNum];
        
        if (actualPackage === expectedPackage) {
          console.log(`  ✓ Semana ${weekNum}: ${actualPackage} (correto)`);
          successes++;
        } else {
          console.log(`  ✗ Semana ${weekNum}: esperado "${expectedPackage}", obtido "${actualPackage || 'vazio'}"`);
          errors++;
        }
      }
    }
    
    // Mostrar timeline completa desta casa
    const timeline = Array.from({length: 22}, (_, i) => {
      const pkg = houseWeekMap[i + 1];
      return pkg ? pkg.substring(0, 3) : '   ';
    }).join(' | ');
    console.log(`  Timeline: ${timeline}`);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`Resultados: ${successes} sucessos, ${errors} erros`);
  
  // Análise detalhada da curva de aprendizado
  console.log('\n' + '='.repeat(50));
  console.log('Análise da Curva de Aprendizado:');
  console.log('\nPré-Obra (Ritmo base: 10 casas/semana):');
  console.log('  Semanas 1-4: 6 casas/semana (60%)');
  console.log('  Semanas 5-8: 8 casas/semana (80%)');
  console.log('  Semana 9+: 10 casas/semana (100%)');
  
  // Contar quantas casas iniciam em cada semana
  const preObraStarts: Record<number, number> = {};
  for (let i = 0; i < 116; i++) {
    const cells = result.matrix[i].filter(c => c.packageName === 'Pré-Obra');
    if (cells.length > 0) {
      const startWeek = cells[0].weekIndex + 1;
      preObraStarts[startWeek] = (preObraStarts[startWeek] || 0) + 1;
    }
  }
  
  console.log('\nCasas iniciando Pré-Obra por semana:');
  Object.entries(preObraStarts).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).forEach(([week, count]) => {
    console.log(`  Semana ${week}: ${count} casas`);
  });
  
  return errors === 0;
}

// Executar validação
const isValid = validateMatrix();
process.exit(isValid ? 0 : 1);