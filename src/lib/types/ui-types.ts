/**
 * Tipos específicos para componentes de UI
 */

// Status types para componentes
export type ComponentStatus = 'default' | 'success' | 'warning' | 'error' | 'info';

// Variant types para componentes
export type ComponentVariant = 'default' | 'outline' | 'filled' | 'ghost';

// Size types para componentes
export type ComponentSize = 'sm' | 'md' | 'lg' | 'xl';

// Props para IndustrialCard
export interface IndustrialCardProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  status?: ComponentStatus;
  variant?: ComponentVariant;
  className?: string;
  children?: React.ReactNode;
}

// Props para IndustrialButton
export interface IndustrialButtonProps {
  variant?: ComponentVariant;
  size?: ComponentSize;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  children?: React.ReactNode;
}

// Props para Badge
export interface BadgeProps {
  variant?: ComponentVariant;
  size?: ComponentSize;
  status?: ComponentStatus;
  className?: string;
  children?: React.ReactNode;
}

// Props para FeedbackMessage
export interface FeedbackMessageProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  className?: string;
}

// Props para ProgressIndicator
export interface ProgressIndicatorProps {
  steps: Array<{
    label: string;
    status: 'completed' | 'pending' | 'in_progress';
    description?: string;
  }>;
  className?: string;
}

// Props para Input
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  helperText?: string;
}