'use client';

import { useHydration } from '@/lib/hooks';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const hasMounted = useHydration();

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}