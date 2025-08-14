export const industrialTheme = {
  colors: {
    primary: '#1e3a8a',      // Azul marinho
    accent: '#7f1d1d',       // Vermelho escuro profundo
    success: '#166534',      // Verde escuro
    warning: '#ca8a04',      // Laranja âmbar escuro
    background: {
      primary: '#f1f5f9',    // Cinza azulado muito claro
      secondary: '#e2e8f0',  // Cinza azulado claro
      card: '#ffffff'        // Branco para cards
    },
    text: {
      primary: '#0f172a',    // Azul marinho muito escuro
      secondary: '#475569',  // Cinza azulado médio
      muted: '#64748b'       // Cinza azulado claro
    },
    border: {
      primary: '#cbd5e1',    // Cinza azulado claro
      secondary: '#94a3b8'   // Cinza azulado médio
    }
  },
  spacing: {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
  },
  borderRadius: {
    sm: '0.25rem',  // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem',   // 8px
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  }
};

// Paleta de cores otimizada com alta diferenciação visual
// Cores organizadas por grupos de matiz para maximizar contraste entre adjacentes
export const workPackageColors = [
  '#dc2626', // Vermelho escuro
  '#1d4ed8', // Azul royal
  '#059669', // Verde esmeralda
  '#7c2d12', // Marrom escuro
  '#6366f1', // Indigo
  '#ea580c', // Laranja vibrante
  '#0891b2', // Ciano escuro
  '#7c3aed', // Violeta
  '#ca8a04', // Âmbar escuro
  '#166534', // Verde escuro
  '#ec4899', // Rosa
  '#0f172a', // Azul marinho muito escuro
  '#b91c1c', // Vermelho
  '#1e40af', // Azul
  '#047857', // Verde teal
  '#92400e', // Laranja escuro
  '#4338ca', // Indigo escuro
  '#c2410c', // Laranja
  '#0e7490', // Ciano
  '#6d28d9', // Violeta escuro
  '#a16207', // Âmbar
  '#15803d', // Verde
  '#be185d', // Rosa escuro
];

// Função para obter cor de pacote evitando adjacentes similares
export const getWorkPackageColor = (index: number): string => {
  // Usa uma sequência que maximiza diferença entre índices adjacentes
  const optimizedSequence = [0, 8, 4, 12, 2, 10, 6, 14, 1, 9, 5, 13, 3, 11, 7, 15, 16, 17, 18, 19, 20, 21, 22];
  const colorIndex = optimizedSequence[index % optimizedSequence.length];
  return workPackageColors[colorIndex];
};

export const formatCurrency = (value: number, compact: boolean = false): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 2,
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

export const formatWeekLabel = (weekIndex: number): string => {
  return `S${(weekIndex + 1).toString().padStart(2, '0')}`;
};

export const getReductionOpacity = (coefficient: number): number => {
  if (coefficient === 0) return 0.1; // Parada total
  return Math.max(0.2, coefficient); // Redução parcial
};

export const getReductionPattern = (coefficient: number): string => {
  if (coefficient === 0) {
    return 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(156, 163, 175, 0.3) 2px, rgba(156, 163, 175, 0.3) 4px)';
  }
  return 'repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(220, 38, 38, 0.2) 1px, rgba(220, 38, 38, 0.2) 2px)';
};