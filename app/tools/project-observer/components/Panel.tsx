import type { ReactNode } from 'react';

interface PanelProps {
  title: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function Panel({ title, hint, children, className = '' }: PanelProps) {
  return (
    <section
      className={`rounded-lg border border-cyan-900/25 bg-[#0a1018]/90 p-5 backdrop-blur-sm ${className}`}
    >
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-cyan-900/20 pb-3">
        <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-cyan-500/90">
          {title}
        </h2>
        {hint && <p className="text-xs text-slate-600">{hint}</p>}
      </header>
      {children}
    </section>
  );
}
