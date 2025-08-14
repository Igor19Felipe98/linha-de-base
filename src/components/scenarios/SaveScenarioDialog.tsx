'use client';

import { useState } from 'react';
import { useProjectStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, X } from 'lucide-react';

interface SaveScenarioDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (scenarioId: string) => void;
}

export function SaveScenarioDialog({ isOpen, onClose, onSave }: SaveScenarioDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { saveCurrentScenario, calculationResult } = useProjectStore();

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Nome do cenário é obrigatório');
      return;
    }

    if (!calculationResult) {
      setError('Nenhum cálculo encontrado. Calcule a linha de base primeiro.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const savedScenario = await saveCurrentScenario(name.trim(), description.trim() || undefined);
      onSave?.(savedScenario.id);
      onClose();
      setName('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar cenário');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
      setName('');
      setDescription('');
      setError(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              Salvar Cenário
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSaving}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scenario-name">Nome do Cenário *</Label>
            <Input
              id="scenario-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Cenário Base 2024"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scenario-description">Descrição (opcional)</Label>
            <textarea
              id="scenario-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do cenário..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none h-20"
              disabled={isSaving}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSaving}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className="flex-1"
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}