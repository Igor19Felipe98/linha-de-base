// Script para capturar configuração atual do navegador
// Execute no console do navegador (DevTools -> Console)

const storageKey = 'calculadora-linha-base-store';
const stored = localStorage.getItem(storageKey);

if (stored) {
  const config = JSON.parse(stored);
  const state = config.state || config;
  
  console.log('=== CONFIGURAÇÃO ATUAL ===');
  
  console.log('\n// Dados básicos');
  console.log(`housesCount: ${state.housesCount}`);
  console.log(`startDate: "${state.startDate}"`);
  console.log(`startDateDisplay: "${state.startDateDisplay}"`);
  
  console.log('\n// Pacotes de trabalho');
  console.log('workPackages: [');
  state.workPackages?.forEach((pkg, index) => {
    console.log(`  { name: '${pkg.name}', duration: ${pkg.duration}, rhythm: ${pkg.rhythm}, latency: ${pkg.latency}, color: '${pkg.color}', cost: ${pkg.cost} }${index < state.workPackages.length - 1 ? ',' : ''}`);
  });
  console.log(']');
  
  console.log('\n// Períodos de parada');
  console.log('stopPeriods: [');
  state.stopPeriods?.forEach((period, index) => {
    console.log(`  { id: '${period.id}', month: '${period.month}', coefficient: ${period.coefficient}, description: '${period.description || ''}' }${index < state.stopPeriods.length - 1 ? ',' : ''}`);
  });
  console.log(']');
  
  console.log('\n// Períodos de redução parcial');
  console.log('partialReductionPeriods: [');
  state.partialReductionPeriods?.forEach((period, index) => {
    console.log(`  { id: '${period.id}', month: '${period.month}', coefficient: ${period.coefficient}, description: '${period.description || ''}' }${index < state.partialReductionPeriods.length - 1 ? ',' : ''}`);
  });
  console.log(']');
  
  console.log('\n// Curva de aprendizado');
  const lc = state.learningCurve;
  console.log('learningCurve: {');
  console.log(`  rhythmReducer: ${lc?.rhythmReducer},`);
  console.log(`  increment: ${lc?.increment},`);
  console.log(`  periodWeeks: ${lc?.periodWeeks},`);
  console.log(`  durationMultiplier: ${lc?.durationMultiplier},`);
  console.log(`  durationImpactWeeks: ${lc?.durationImpactWeeks},`);
  if (lc?.appliedPackages) {
    console.log(`  appliedPackages: [${lc.appliedPackages.map(p => `'${p}'`).join(', ')}]`);
  }
  console.log('}');
  
} else {
  console.log('Nenhuma configuração encontrada no localStorage');
}