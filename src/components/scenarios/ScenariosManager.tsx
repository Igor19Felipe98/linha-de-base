'use client';

import { useState, useEffect } from 'react';
import { useProjectStore } from '@/lib/store';
import { SavedScenario, ScenarioMetadata } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Download, 
  Upload, 
  Trash2, 
  Copy, 
  FolderOpen,
  Search,
  Calendar,
  Home,
  DollarSign,
  Package,
  Cloud,
  HardDrive,
  CloudUpload
} from 'lucide-react';
import { SaveScenarioDialog } from './SaveScenarioDialog';

export function ScenariosManager() {
  const [scenarios, setScenarios] = useState<ScenarioMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const {
    getAllScenariosMetadata,
    loadScenario,
    deleteScenario,
    duplicateScenario,
    exportScenario,
    importScenario,
    migrateScenarioToSupabase,
    currentScenarioId,
    calculationResult,
    isUnsaved
  } = useProjectStore();

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      setLoading(true);
      const scenariosData = await getAllScenariosMetadata();
      setScenarios(scenariosData);
    } catch (error) {
      console.error('Erro ao carregar cenários:', error);
      setScenarios([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredScenarios = scenarios.filter(scenario =>
    scenario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (scenario.description && scenario.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleLoadScenario = async (id: string) => {
    if (isUnsaved) {
      const confirmLoad = confirm(
        'Há alterações não salvas. Deseja continuar e perder as alterações?'
      );
      if (!confirmLoad) return;
    }

    try {
      const success = await loadScenario(id);
      if (success) {
        setSelectedScenario(id);
      }
    } catch (error) {
      console.error('Erro ao carregar cenário:', error);
      alert('Erro ao carregar cenário.');
    }
  };

  const handleDeleteScenario = async (id: string) => {
    const scenario = scenarios.find(s => s.id === id);
    if (!scenario) return;

    const confirmDelete = confirm(
      `Tem certeza que deseja excluir o cenário "${scenario.name}"?`
    );
    
    if (confirmDelete) {
      try {
        await deleteScenario(id);
        await loadScenarios();
        if (selectedScenario === id) {
          setSelectedScenario(null);
        }
      } catch (error) {
        console.error('Erro ao deletar cenário:', error);
        alert('Erro ao deletar cenário.');
      }
    }
  };

  const handleDuplicateScenario = async (id: string) => {
    const scenario = scenarios.find(s => s.id === id);
    if (!scenario) return;

    const newName = prompt('Nome para o cenário duplicado:', `${scenario.name} - Cópia`);
    if (newName && newName.trim()) {
      try {
        await duplicateScenario(id, newName.trim());
        await loadScenarios();
      } catch (error) {
        console.error('Erro ao duplicar cenário:', error);
        alert('Erro ao duplicar cenário.');
      }
    }
  };

  const handleExportScenario = async (id: string) => {
    const scenario = scenarios.find(s => s.id === id);
    if (!scenario) return;

    try {
      const exportData = await exportScenario(id);
      if (exportData) {
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cenario-${scenario.name.replace(/[^a-zA-Z0-9]/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erro ao exportar cenário:', error);
      alert('Erro ao exportar cenário.');
    }
  };

  const handleImportScenario = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const content = e.target?.result as string;
            const importedScenario = await importScenario(content);
            if (importedScenario) {
              await loadScenarios();
            } else {
              alert('Erro ao importar cenário. Verifique se o arquivo é válido.');
            }
          } catch (error) {
            console.error('Erro ao importar cenário:', error);
            alert('Erro ao importar cenário.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleMigrateToSupabase = async (id: string) => {
    const scenario = scenarios.find(s => s.id === id);
    if (!scenario) return;

    const confirmMigrate = confirm(
      `Deseja migrar o cenário "${scenario.name}" para a nuvem?\n\nIsso irá movê-lo do armazenamento local para o Supabase.`
    );
    
    if (confirmMigrate) {
      try {
        const success = await migrateScenarioToSupabase(id);
        if (success) {
          await loadScenarios();
          alert('Cenário migrado para a nuvem com sucesso!');
        }
      } catch (error) {
        console.error('Erro ao migrar cenário:', error);
        if (error.message.includes('não logado')) {
          alert('Você precisa estar logado para migrar cenários para a nuvem.');
        } else {
          alert('Erro ao migrar cenário para a nuvem.');
        }
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Gerenciamento de Cenários
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ações principais */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setShowSaveDialog(true)}
              disabled={!calculationResult}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Salvar Cenário Atual
            </Button>
            
            <Button
              variant="outline"
              onClick={handleImportScenario}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Importar
            </Button>
          </div>

          {/* Busca */}
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar cenários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Lista de cenários */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Carregando cenários...
              </div>
            ) : filteredScenarios.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Nenhum cenário encontrado.' : 'Nenhum cenário salvo ainda.'}
              </div>
            ) : (
              filteredScenarios.map((scenario) => (
                <Card 
                  key={scenario.id} 
                  className={`transition-all ${
                    currentScenarioId === scenario.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-md'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{scenario.name}</h3>
                          
                          {/* Indicador de localização */}
                          {scenario.storageLocation === 'supabase' ? (
                            <Cloud className="h-4 w-4 text-blue-500" title="Salvo na nuvem" />
                          ) : (
                            <HardDrive className="h-4 w-4 text-gray-500" title="Salvo localmente" />
                          )}
                          
                          {currentScenarioId === scenario.id && (
                            <Badge variant="secondary">Ativo</Badge>
                          )}
                          {isUnsaved && currentScenarioId === scenario.id && (
                            <Badge variant="destructive">Não salvo</Badge>
                          )}
                        </div>
                        
                        {scenario.description && (
                          <p className="text-gray-600 text-sm mb-3">{scenario.description}</p>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Home className="h-4 w-4 text-gray-500" />
                            <span>{scenario.housesCount} casas</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <span>{formatCurrency(scenario.totalCost)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>{scenario.duration} semanas</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4 text-gray-500" />
                            <span>{scenario.packagesCount} pacotes</span>
                          </div>
                        </div>

                        <div className="text-xs text-gray-500 mt-2">
                          Criado em: {formatDate(scenario.createdAt)}
                          {scenario.updatedAt !== scenario.createdAt && (
                            <span> • Atualizado em: {formatDate(scenario.updatedAt)}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleLoadScenario(scenario.id)}
                          disabled={currentScenarioId === scenario.id}
                        >
                          Carregar
                        </Button>
                        
                        <div className="flex gap-1">
                          {/* Botão para migrar para nuvem - apenas cenários locais */}
                          {scenario.storageLocation === 'local' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMigrateToSupabase(scenario.id)}
                              title="Migrar para nuvem"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <CloudUpload className="h-3 w-3" />
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDuplicateScenario(scenario.id)}
                            title="Duplicar"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExportScenario(scenario.id)}
                            title="Exportar"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteScenario(scenario.id)}
                            title="Excluir"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <SaveScenarioDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={() => loadScenarios()}
      />
    </div>
  );
}