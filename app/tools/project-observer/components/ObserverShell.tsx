import type { ReactNode } from 'react';
import { ObserverShellFrame } from './ObserverShellFrame';

interface ObserverShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
}

export function ObserverShell(props: ObserverShellProps) {
  return <ObserverShellFrame {...props} />;
}
