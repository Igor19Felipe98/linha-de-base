import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Sistema de cores profissional - Paleta harmoniosa
        'industrial-primary': '#1e3a8a',        // Azul marinho principal
        'industrial-primary-light': '#3b82f6',  // Azul marinho claro
        'industrial-primary-dark': '#1e40af',   // Azul marinho escuro
        'industrial-accent': '#991b1b',         // Vermelho escuro elegante
        'industrial-accent-light': '#dc2626',   // Vermelho médio
        'industrial-accent-dark': '#7f1d1d',    // Vermelho muito escuro
        'industrial-success': '#166534',        // Verde escuro
        'industrial-warning': '#d97706',        // Laranja elegante
        'industrial-background-primary': '#f8fafc',    // Cinza azulado sutilíssimo
        'industrial-background-secondary': '#f1f5f9',  // Cinza azulado muito claro
        'industrial-background-tertiary': '#e2e8f0',   // Cinza azulado claro
        'industrial-background-card': '#ffffff',       // Branco puro
        'industrial-text-primary': '#0f172a',     // Texto principal escuro
        'industrial-text-secondary': '#334155',   // Texto secundário
        'industrial-text-muted': '#64748b',      // Texto sutil
        'industrial-text-light': '#94a3b8',     // Texto muito sutil
        'industrial-border-primary': '#e2e8f0',    // Borda principal
        'industrial-border-secondary': '#cbd5e1',   // Borda secundária
        'industrial-border-accent': '#f1f5f9',     // Borda sutil
        
        // Cores padrão para compatibilidade - Atualizadas para paleta cinza azulada
        border: '#cbd5e1',
        input: '#ffffff',
        ring: '#1e3a8a',
        background: '#f1f5f9',
        foreground: '#0f172a',
        primary: {
          DEFAULT: '#1e3a8a',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#e2e8f0',
          foreground: '#0f172a',
        },
        destructive: {
          DEFAULT: '#7f1d1d',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#e2e8f0',
          foreground: '#475569',
        },
        accent: {
          DEFAULT: '#e2e8f0',
          foreground: '#0f172a',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#0f172a',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#0f172a',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
export default config