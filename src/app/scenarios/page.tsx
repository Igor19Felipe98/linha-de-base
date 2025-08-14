'use client';

import { ScenariosManager } from '@/components/scenarios';

export default function ScenariosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Gerenciar Cenários
        </h1>
        <p className="text-gray-600">
          Salve, carregue e gerencie diferentes cenários de planejamento de obras.
          Compare diferentes configurações e mantenha um histórico de suas análises.
        </p>
      </div>
      
      <ScenariosManager />
    </div>
  );
}