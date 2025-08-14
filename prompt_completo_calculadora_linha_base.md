
# Prompt Completo: Calculadora de Linha de Base para Construção Civil

## 1. VISÃO GERAL DA APLICAÇÃO

### Objetivo
Criar uma aplicação web Next.js 14+ com TypeScript que permita o planejamento e controle de cronogramas de obras residenciais usando a metodologia Lean Construction. A aplicação calcula e visualiza a "linha de base" (baseline) do projeto, considerando sequenciamento de atividades, períodos de redução, curva de aprendizado e análise financeira.

### Características Principais
- **Framework**: Next.js 14+ com App Router
- **Linguagem**: TypeScript
- **Estilo**: Tailwind CSS + ShadCN/UI + Design Industrial
- **Gerenciamento de Estado**: Zustand com persistência
- **Gráficos**: Recharts
- **Cores do Tema**: Azul marinho (#1e3a8a), vermelho escuro (#dc2626), cinzas neutros

---

## 2. ESTRUTURA DE ARQUIVOS

```
app/
├── app/
│   ├── layout.tsx                 # Layout raiz da aplicação
│   ├── page.tsx                  # Página inicial (dashboard)
│   ├── project-config/
│   │   └── page.tsx              # Configuração do projeto
│   ├── packages/
│   │   └── page.tsx              # Configuração de pacotes de trabalho
│   ├── calculate/
│   │   └── page.tsx              # Página de cálculo
│   ├── matrix/
│   │   └── page.tsx              # Visualização da matriz
│   ├── dashboard/
│   │   └── page.tsx              # Dashboard completo
│   └── globals.css               # Estilos globais
├── components/
│   ├── layout/
│   │   └── main-layout.tsx       # Layout principal com sidebar
│   ├── ui/                       # Componentes base ShadCN
│   ├── baseline-matrix.tsx       # Componente matriz interativa
│   ├── financial-curve.tsx       # Gráfico financeiro
│   └── project-health-indicator.tsx # Indicador de saúde
├── lib/
│   ├── store.ts                  # Store Zustand
│   ├── types.ts                  # Definições de tipos
│   ├── calculations.ts           # Lógica de cálculo
│   ├── theme.ts                  # Tema industrial
│   └── utils.ts                  # Utilitários
└── package.json                  # Dependências
```

---

## 3. TIPOS DE DADOS (lib/types.ts)

```typescript
export interface WorkPackage {
  name: string;
  duration: number;    // semanas para completar o pacote em uma casa
  rhythm: number;      // casas que podem iniciar simultaneamente por semana
  latency: number;     // semanas de espera até próximo pacote iniciar
  color: string;       // cor para visualização na matriz
  cost: number;        // custo por casa (R$)
}

export interface StopPeriod {
  id: string;
  month: string;       // ex: "dezembro" - aplicado todos os anos
  coefficient: 0;      // sempre 0 para parada total
  description?: string;
}

export interface PartialReductionPeriod {
  id: string;
  month: string;       // ex: "janeiro" - aplicado todos os anos
  coefficient: number; // 0.01-0.99
  description?: string;
}

export interface LearningCurve {
  rhythmReducer: number;      // redutor inicial (ex: 0.60)
  increment: number;          // acréscimo por período (ex: 0.20)
  periodWeeks: number;        // período em semanas (ex: 4)
  durationMultiplier: number; // multiplicador duração (ex: 2.00)
  impactedWeeks: number;      // semanas impactadas (ex: 6)
}

export interface ProjectData {
  housesCount: number;
  startDate: string;    // formato YYYY-MM-DD
  stopPeriods: StopPeriod[];
  partialReductionPeriods: PartialReductionPeriod[];
  workPackages: WorkPackage[];
  learningCurve: LearningCurve;
}

export interface MatrixCell {
  houseNumber: number;
  weekIndex: number;
  packageName: string;
  color: string;
  isReduced?: boolean;
  reductionOpacity?: number;
  cost?: number;
}

export interface CalculationResult {
  matrix: MatrixCell[][];
  weeks: string[];
  houses: number[];
  weekDateMappings: WeekDateMapping[];
  financialData: FinancialWeekData[];
  calculationMetadata: {
    totalProjectDuration: number;
    totalPackages: number;
    reductionPeriods: number;
    calculatedAt: string;
    baseDate: string;
    totalProjectCost: number;
  };
}
```

---

## 4. PÁGINAS DA APLICAÇÃO

### 4.1 Página Inicial (app/page.tsx)
**Funcionalidades:**
- Dashboard de status do projeto
- Navegação rápida (máximo 3 cliques para resultado)
- Indicadores de progresso da configuração
- Estatísticas rápidas (casas, pacotes, semanas)
- Ações principais destacadas
- Indicador de saúde do projeto

**Interface:**
- Hero section com título e descrição
- Cards com status de configuração
- Botões de ação primária (calcular, ver resultados)
- Grid de estatísticas
- Mensagens de feedback baseadas no estado

### 4.2 Configuração do Projeto (app/project-config/page.tsx)
**Funcionalidades:**
- Dados básicos: quantidade de casas, data inicial
- Períodos de parada total (coeficiente 0)
- Períodos de redução parcial (coeficiente 0.01-0.99)
- Configuração da curva de aprendizado
- Validação em tempo real dos dados

**Campos:**
- Quantidade de casas (1-9999)
- Data inicial (DD/MM/AAAA)
- Lista de períodos de parada por mês
- Lista de períodos de redução com coeficientes
- Parâmetros da curva de aprendizado (redutor, incremento, período, multiplicador)

### 4.3 Pacotes de Trabalho (app/packages/page.tsx)
**Funcionalidades:**
- CRUD de pacotes de trabalho
- Validação de dados (duração > 0, ritmo > 0)
- Seletor de cores para cada pacote
- Previsualização das configurações
- Informações calculadas (capacidade, tempo total)

**Campos por Pacote:**
- Nome do pacote
- Duração (1-100 semanas)
- Ritmo (1-200 casas/semana)
- Latência (0-50 semanas)
- Cor (seletor + input hex)

### 4.4 Cálculo (app/calculate/page.tsx)
**Funcionalidades:**
- Sistema de cálculo otimizado
- Validação prévia dos dados
- Feedback visual durante processamento
- Sistema de retry automático
- Navegação automática para resultados

**Interface:**
- Botão principal de cálculo
- Indicador de progresso
- Resumo da configuração atual
- Instruções passo-a-passo
- Mensagens de erro detalhadas

### 4.5 Matriz (app/matrix/page.tsx)
**Funcionalidades:**
- Visualização interativa da matriz
- Controles de zoom (20%-150%)
- Filtro de células vazias
- Exportação para CSV
- Auto-cálculo se necessário

**Interface:**
- Matriz scrollável e responsiva
- Headers fixos (casas e semanas)
- Células coloridas por pacote
- Overlay de períodos de redução
- Tooltips informativos

### 4.6 Dashboard (app/dashboard/page.tsx)
**Funcionalidades:**
- Visão executiva do projeto
- Gráficos de análise
- Métricas de performance
- Curva físico-financeira
- Matriz resumida

---

## 5. LÓGICA DE CÁLCULO (lib/calculations.ts)

### 5.1 Algoritmo Principal
```typescript
export function calculateBaseline(data: ProjectData): CalculationResult {
  // 1. Validar dados de entrada
  // 2. Calcular número total de semanas necessárias
  // 3. Inicializar matriz vazia
  // 4. Para cada pacote:
  //    - Para cada casa:
  //      - Calcular semana de início (considerando latência)
  //      - Aplicar escalonamento por ritmo
  //      - Aplicar duração com tratamento de reduções
  //      - Preencher matriz com células
  // 5. Calcular dados financeiros
  // 6. Retornar resultado completo
}
```

### 5.2 Tratamento de Períodos de Redução
- **Parada Total (coef. 0)**: Marca células cinzas, não consome duração
- **Redução Parcial (0.01-0.99)**: Trabalho com eficiência reduzida
- **Aplicação**: Por mês, válido para todos os anos do projeto
- **Visual**: Overlay com padrão diagonal e opacidade reduzida

### 5.3 Curva de Aprendizado
- **Ritmo Inicial**: Redutor aplicado no início do pacote
- **Incremento**: Melhoria progressiva a cada período
- **Duração**: Multiplicador aplicado nas primeiras casas
- **Escopo**: Afeta apenas as semanas/casas impactadas definidas

### 5.4 Escalonamento por Ritmo
- **Lógica**: Casa 1,2,3 com ritmo 3 = semana 0; Casa 4,5,6 = semana 1
- **Fórmula**: `Math.floor((houseNumber - 1) / rhythm)`
- **Latência**: Espera entre término de um pacote e início do próximo

---

## 6. COMPONENTES PRINCIPAIS

### 6.1 BaselineMatrix (components/baseline-matrix.tsx)
**Funcionalidades:**
- Renderização otimizada de matriz grande
- Zoom responsivo (20%-150%)
- Headers fixos com scroll
- Filtro de células vazias
- Tooltips informativos
- Exportação CSV

**Otimizações:**
- Virtualização para matrizes grandes
- Memoização de células
- Lazy loading de dados
- Debounce em zoom/scroll

### 6.2 FinancialCurve (components/financial-curve.tsx)
**Funcionalidades:**
- Gráfico combinado (barras + linhas)
- Custo semanal vs acumulado
- Casas em execução
- Métricas de resumo
- Validação financeira

**Dados:**
- Custo semanal por pacote
- Custo acumulado total
- Número de casas ativas
- Pico de execução

### 6.3 MainLayout (components/layout/main-layout.tsx)
**Funcionalidades:**
- Sidebar com navegação
- Header com breadcrumbs
- Indicador de versão
- Responsividade mobile
- Estados de loading

---

## 7. GERENCIAMENTO DE ESTADO (lib/store.ts)

### 7.1 Store Principal
```typescript
interface ProjectStore {
  // Dados básicos
  housesCount: number;
  startDate: string;
  startDateDisplay: string;
  
  // Pacotes e períodos
  workPackages: WorkPackage[];
  stopPeriods: StopPeriod[];
  partialReductionPeriods: PartialReductionPeriod[];
  learningCurve: LearningCurve;
  
  // Resultado
  calculationResult: CalculationResult | null;
  projectData: ProjectData | null;
  
  // Ações CRUD para todos os dados
  // Sistema de versionamento automático
  // Persistência local com migração
}
```

### 7.2 Dados Padrão
- 20 casas teste
- Data início: 06/01/2025
- 2 pacotes exemplo (duração 3/2, ritmo 5/3)
- Períodos: Dezembro (parada), Jan/Fev/Mar (redução 50%)
- Curva aprendizado padrão

---

## 8. TEMA E DESIGN (lib/theme.ts)

### 8.1 Paleta de Cores
```typescript
export const industrialTheme = {
  colors: {
    primary: '#1e3a8a',      // Azul marinho
    accent: '#dc2626',       // Vermelho escuro
    success: '#059669',      // Verde
    background: {
      primary: '#f8fafc',    // Cinza muito claro
      secondary: '#f1f5f9'   // Cinza claro
    },
    text: {
      primary: '#1f2937',    // Cinza escuro
      secondary: '#6b7280',  // Cinza médio
      muted: '#9ca3af'       // Cinza claro
    }
  }
}
```

### 8.2 Componentes Industriais
- IndustrialButton: Botões com estilo profissional
- IndustrialCard: Cards com bordas definidas
- ProgressIndicator: Barras de progresso
- FeedbackMessage: Mensagens de status

---

## 9. DEPENDÊNCIAS ESSENCIAIS

```json
{
  "dependencies": {
    "next": "14.2.28",
    "react": "18.2.0",
    "typescript": "5.2.2",
    "zustand": "5.0.3",
    "tailwindcss": "3.3.3",
    "@radix-ui/react-*": "latest", // Componentes base
    "recharts": "2.15.3",
    "lucide-react": "0.446.0",
    "date-fns": "3.6.0",
    "clsx": "2.1.1"
  }
}
```

---

## 10. FUNCIONALIDADES ESPECÍFICAS

### 10.1 Validações
- Casas: 1-9999
- Data: Formato DD/MM/AAAA, sempre segunda-feira
- Duração: 1-100 semanas
- Ritmo: 1-200 casas/semana
- Coeficientes: 0.01-0.99 para redução parcial

### 10.2 Cálculos
- Semana de início por casa = `Math.floor((casa-1) / ritmo)`
- Duração com redução = `duração * (1 / coeficiente)`
- Parada total não consome duração
- Curva aprendizado afeta primeiras semanas

### 10.3 Exportações
- CSV da matriz completa
- Headers: Casa, Sem1, Sem2, etc.
- Células: Nome do pacote ou vazio
- Encoding UTF-8 para caracteres especiais

### 10.4 Performance
- Lazy loading para matrizes > 1000 células
- Debounce em controles de zoom (300ms)
- Memoização de cálculos pesados
- Virtualização de scroll em listas grandes

---

## 11. FLUXO DE USO

### 11.1 Configuração Inicial
1. Usuário define quantidade de casas e data
2. Configura períodos de parada/redução
3. Ajusta curva de aprendizado
4. Define pacotes de trabalho

### 11.2 Cálculo e Visualização
1. Sistema valida dados automaticamente
2. Executa cálculo da linha de base
3. Gera matriz visual interativa
4. Apresenta análise financeira

### 11.3 Análise e Export
1. Usuário explora matriz com zoom/filtros
2. Analisa gráficos financeiros
3. Exporta dados para análise externa
4. Ajusta parâmetros se necessário

---

## 12. CRITÉRIOS DE QUALIDADE

### 12.1 Performance
- Tempo de cálculo < 5 segundos para 200 casas
- Renderização suave da matriz
- Responsividade < 100ms em interações

### 12.2 Usabilidade
- Máximo 3 cliques para resultado principal
- Feedback visual em todas as ações
- Tooltips explicativos em campos complexos

### 12.3 Robustez
- Validação completa de dados
- Tratamento de erros gracioso
- Recuperação automática de estado
- Compatibilidade mobile básica

---

## 13. INSTRUÇÕES DE IMPLEMENTAÇÃO

### 13.1 Ordem de Desenvolvimento
1. Configurar projeto Next.js + dependências
2. Implementar tipos e store base
3. Criar componentes UI industriais
4. Desenvolver páginas de configuração
5. Implementar lógica de cálculo
6. Criar componentes de visualização
7. Integrar sistema completo
8. Otimizar performance
9. Testes e validações finais

### 13.2 Pontos Críticos
- **Cálculo da matriz**: Algoritmo deve respeitar latências e ritmos
- **Períodos de redução**: Aplicar corretamente por mês/ano
- **Performance**: Otimizar renderização de matrizes grandes
- **Estado**: Manter sincronia entre páginas
- **Validações**: Prevenir dados inválidos

### 13.3 Testes Essenciais
- Cenário 1: 20 casas, 2 pacotes, sem reduções
- Cenário 2: 50 casas, 5 pacotes, com paradas
- Cenário 3: 100+ casas, 10 pacotes, todos períodos
- Validar exportação CSV
- Testar zoom extremos (20% e 150%)

---

**Este prompt contém todas as especificações necessárias para recriar completamente a aplicação Calculadora de Linha de Base. Siga as implementações na ordem sugerida, respeitando os tipos definidos e as lógicas de cálculo especificadas.**
