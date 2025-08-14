'use client';

import { useProjectStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useState } from 'react';
import { SaveScenarioDialog } from './SaveScenarioDialog';

export function ScenarioStatus() {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const { currentScenarioId, isUnsaved, calculationResult } = useProjectStore();

  const hasCalculation = !!calculationResult;
  const hasCurrentScenario = !!currentScenarioId;

  if (!hasCalculation && !hasCurrentScenario) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {hasCurrentScenario && (
          <Badge variant={isUnsaved ? "destructive" : "secondary"}>
            {isUnsaved ? "Não salvo" : "Salvo"}
          </Badge>
        )}
        
        {hasCalculation && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSaveDialog(true)}
            className="flex items-center gap-1"
          >
            <Save className="h-3 w-3" />
            {hasCurrentScenario && !isUnsaved ? "Salvar como novo" : "Salvar"}
          </Button>
        )}
      </div>

      <SaveScenarioDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
      />
    </>
  );
}