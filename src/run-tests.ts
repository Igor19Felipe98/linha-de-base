import { calculateBaseline, ProjectData } from './lib';

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
    durationImpactWeeks: 6
  }
};

console.log('🧪 Executando testes de validação da Linha de Balanço\n');
console.log('='.repeat(60));

let totalTests = 0;
let passedTests = 0;

// Teste 1: Curva de aprendizado do ritmo para Pré-Obra
console.log('\n📋 Teste 1: Curva de aprendizado do ritmo para Pré-Obra');
try {
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
    { week: 1, expected: 6 },
    { week: 2, expected: 6 },
    { week: 3, expected: 6 },
    { week: 4, expected: 6 },
    { week: 5, expected: 8 },
    { week: 6, expected: 8 },
    { week: 7, expected: 8 },
    { week: 8, expected: 8 },
    { week: 9, expected: 10 },
    { week: 10, expected: 10 },
  ];
  
  let testPassed = true;
  for (const check of checks) {
    const actual = preObraStarts[check.week] || 0;
    if (actual !== check.expected) {
      console.log(`  ✗ Semana ${check.week}: esperado ${check.expected}, obtido ${actual}`);
      testPassed = false;
    }
  }
  
  if (testPassed) {
    console.log('  ✓ Passou - Curva de aprendizado correta');
    passedTests++;
  }
  totalTests++;
} catch (error: any) {
  console.log(`  ✗ Erro: ${error.message}`);
  totalTests++;
}

// Teste 2: Duração dos serviços com curva de aprendizado
console.log('\n📋 Teste 2: Duração dos serviços com curva de aprendizado');
try {
  const result = calculateBaseline(testData);
  const casa1 = result.matrix[0];
  const casa1PreObra = casa1.filter(c => c.packageName === 'Pré-Obra');
  const casa1Estacas = casa1.filter(c => c.packageName === 'Estacas');
  const casa1Infra = casa1.filter(c => c.packageName === 'Infraestrutura Enterrada');
  
  let testPassed = true;
  
  if (casa1PreObra.length !== 4) {
    console.log(`  ✗ Pré-Obra: esperado 4 semanas, obtido ${casa1PreObra.length}`);
    testPassed = false;
  }
  
  if (casa1Estacas.length !== 2) {
    console.log(`  ✗ Estacas: esperado 2 semanas, obtido ${casa1Estacas.length}`);
    testPassed = false;
  }
  
  if (casa1Infra.length !== 2) {
    console.log(`  ✗ Infra: esperado 2 semanas, obtido ${casa1Infra.length}`);
    testPassed = false;
  }
  
  if (testPassed) {
    console.log('  ✓ Passou - Durações corretas com curva aplicada');
    passedTests++;
  }
  totalTests++;
} catch (error: any) {
  console.log(`  ✗ Erro: ${error.message}`);
  totalTests++;
}

// Teste 3: Latência entre serviços
console.log('\n📋 Teste 3: Latência entre serviços');
try {
  const result = calculateBaseline(testData);
  const casa1 = result.matrix[0];
  const casa1PreObra = casa1.filter(c => c.packageName === 'Pré-Obra').map(c => c.weekIndex);
  const casa1Estacas = casa1.filter(c => c.packageName === 'Estacas').map(c => c.weekIndex);
  
  const preObraFim = Math.max(...casa1PreObra) + 1; // Converter para base 1
  const estacasInicio = Math.min(...casa1Estacas) + 1; // Converter para base 1
  const latencia = estacasInicio - preObraFim - 1; // Subtrair 1 para contar intervalo
  
  if (latencia === 4) {
    console.log('  ✓ Passou - Latência de 4 semanas entre Pré-Obra e Estacas');
    passedTests++;
  } else {
    console.log(`  ✗ Latência: esperado 4 semanas, obtido ${latencia}`);
  }
  totalTests++;
} catch (error: any) {
  console.log(`  ✗ Erro: ${error.message}`);
  totalTests++;
}

// Teste 4: Sequência correta dos serviços
console.log('\n📋 Teste 4: Sequência correta dos serviços');
try {
  const result = calculateBaseline(testData);
  
  const casasParaVerificar = [
    { casa: 1, preObra: [1, 2, 3, 4], estacas: [9, 10], infra: [11, 12] },
    { casa: 7, preObra: [2, 3, 4, 5], estacas: [10, 11], infra: [12, 13] },
    { casa: 14, preObra: [3, 4, 5, 6], estacas: [11, 12], infra: [13, 14] },
  ];
  
  let testPassed = true;
  
  casasParaVerificar.forEach(({ casa, preObra, estacas, infra }) => {
    const houseIndex = casa - 1;
    const cells = result.matrix[houseIndex];
    
    const preObraCells = cells.filter(c => c.packageName === 'Pré-Obra').map(c => c.weekIndex + 1).sort((a, b) => a - b);
    const estacasCells = cells.filter(c => c.packageName === 'Estacas').map(c => c.weekIndex + 1).sort((a, b) => a - b);
    const infraCells = cells.filter(c => c.packageName === 'Infraestrutura Enterrada').map(c => c.weekIndex + 1).sort((a, b) => a - b);
    
    if (JSON.stringify(preObraCells) !== JSON.stringify(preObra)) {
      console.log(`  ✗ Casa ${casa} Pré-Obra: esperado ${JSON.stringify(preObra)}, obtido ${JSON.stringify(preObraCells)}`);
      testPassed = false;
    }
    
    if (JSON.stringify(estacasCells) !== JSON.stringify(estacas)) {
      console.log(`  ✗ Casa ${casa} Estacas: esperado ${JSON.stringify(estacas)}, obtido ${JSON.stringify(estacasCells)}`);
      testPassed = false;
    }
    
    if (JSON.stringify(infraCells) !== JSON.stringify(infra)) {
      console.log(`  ✗ Casa ${casa} Infra: esperado ${JSON.stringify(infra)}, obtido ${JSON.stringify(infraCells)}`);
      testPassed = false;
    }
  });
  
  if (testPassed) {
    console.log('  ✓ Passou - Sequência correta para todas as casas testadas');
    passedTests++;
  }
  totalTests++;
} catch (error: any) {
  console.log(`  ✗ Erro: ${error.message}`);
  totalTests++;
}

// Teste 5: Curva de aprendizado dos serviços subsequentes
console.log('\n📋 Teste 5: Curva de aprendizado dos serviços subsequentes');
try {
  const result = calculateBaseline(testData);
  
  const estacasStarts: Record<number, number> = {};
  for (let i = 0; i < 116; i++) {
    const cells = result.matrix[i].filter(c => c.packageName === 'Estacas');
    if (cells.length > 0) {
      const startWeek = Math.min(...cells.map(c => c.weekIndex)) + 1;
      estacasStarts[startWeek] = (estacasStarts[startWeek] || 0) + 1;
    }
  }
  
  const checks = [
    { week: 9, expected: 7 },   // Semana 1 do serviço: 60% de 12 = 7
    { week: 10, expected: 7 },  // Semana 2 do serviço
    { week: 11, expected: 7 },  // Semana 3 do serviço
    { week: 12, expected: 7 },  // Semana 4 do serviço
    { week: 13, expected: 10 }, // Semana 5 do serviço: 80% de 12 = 10
    { week: 14, expected: 10 }, // Semana 6 do serviço
    { week: 15, expected: 10 }, // Semana 7 do serviço
    { week: 16, expected: 10 }, // Semana 8 do serviço
    { week: 17, expected: 12 }, // Semana 9 do serviço: 100% de 12 = 12
  ];
  
  let testPassed = true;
  for (const check of checks) {
    const actual = estacasStarts[check.week] || 0;
    if (actual !== check.expected) {
      console.log(`  ✗ Semana ${check.week}: esperado ${check.expected}, obtido ${actual}`);
      testPassed = false;
    }
  }
  
  if (testPassed) {
    console.log('  ✓ Passou - Curva de aprendizado correta para Estacas');
    passedTests++;
  }
  totalTests++;
} catch (error: any) {
  console.log(`  ✗ Erro: ${error.message}`);
  totalTests++;
}

// Resumo final
console.log('\n' + '='.repeat(60));
console.log(`\n📊 RESUMO FINAL:`);
console.log(`   Total de testes: ${totalTests}`);
console.log(`   ✓ Passou: ${passedTests}`);
console.log(`   ✗ Falhou: ${totalTests - passedTests}`);

if (passedTests === totalTests) {
  console.log('\n🎉 Todos os testes passaram! A implementação está correta.');
  process.exit(0);
} else {
  console.log('\n❌ Alguns testes falharam. Verifique os erros acima.');
  process.exit(1);
}