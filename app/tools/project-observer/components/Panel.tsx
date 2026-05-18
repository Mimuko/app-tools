import type { ReactNode } from 'react';

interface PanelProps {
  title: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function Panel({ title, hint, children, className = '' }: PanelProps) {
  return (
    <section className={`obs-surface rounded-lg p-6 backdrop-blur-sm ${className}`}>
      <header className="obs-divider mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b pb-3">
        <h2 className="obs-heading">{title}</h2>
        {hint && <p className="text-sm obs-text-faint">{hint}</p>}
      </header>
      {children}
    </section>
  );
}
