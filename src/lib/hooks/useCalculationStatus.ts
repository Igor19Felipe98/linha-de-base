/**
 * Hook customizado para gerenciar status de cálculo
 */

import { useMemo } from 'react';
import { useProjectStore } from '../store';

export const useCalculationStatus = () => {
  const { calculationResult, getConfigStatus } = useProjectStore();
  const configStatus = getConfigStatus();

  const status = useMemo(() => {
    if (!configStatus.canCalculate) {
      return {
        type: 'warning' as const,
        title: 'Configuração incompleta',
        message: 'Complete a configuração do projeto para poder executar os cálculos.',
        canCalculate: false,
        hasResult: false
      };
    }

    if (!calculationResult) {
      return {
        type: 'info' as const,
        title: 'Pronto para calcular',
        message: 'Todas as configurações estão completas. Execute o cálculo para gerar a linha de base.',
        canCalculate: true,
        hasResult: false
      };
    }

    return {
      type: 'success' as const,
      title: 'Linha de base calculada',
      message: 'Cálculo concluído com sucesso. Você pode visualizar os resultados ou recalcular se necessário.',
      canCalculate: true,
      hasResult: true
    };
  }, [configStatus.canCalculate, calculationResult]);

  return {
    ...status,
    calculationResult,
    configStatus
  };
};