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
      <header className="obs-divider mb-5 flex flex-col gap-1 border-b pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <h2 className="obs-heading">{title}</h2>
        {hint && <p className="obs-body-sm max-w-xl obs-text-faint sm:text-right">{hint}</p>}
      </header>
      {children}
    </section>
  );
}
