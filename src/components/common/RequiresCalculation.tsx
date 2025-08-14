/**
 * Componente wrapper que condiciona o conteúdo à existência de cálculo
 */

import { ReactNode } from 'react';
import Link from 'next/link';
import { useCalculationStatus } from '@/lib/hooks/useCalculationStatus';
import { FeedbackMessage, IndustrialButton } from '@/components/ui';
import { Calculator } from 'lucide-react';

interface RequiresCalculationProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

export const RequiresCalculation = ({ 
  children, 
  fallbackTitle = "Cálculo não encontrado",
  fallbackMessage = "Execute o cálculo da linha de base primeiro para visualizar esta página."
}: RequiresCalculationProps) => {
  const { hasResult } = useCalculationStatus();

  if (!hasResult) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <FeedbackMessage
          type="warning"
          title={fallbackTitle}
          message={fallbackMessage}
        />
        
        <div className="mt-6">
          <Link href="/calculate">
            <IndustrialButton>
              <Calculator className="h-4 w-4 mr-2" />
              Calcular Linha de Base
            </IndustrialButton>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};