import Link from 'next/link';
import type { ReactNode } from 'react';

interface ObserverShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
}

function GridBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.08),transparent)]" />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
}

export function ObserverShell({
  children,
  title,
  subtitle,
  backHref = '/tools/project-observer',
  backLabel = '観測一覧',
  actions,
}: ObserverShellProps) {
  return (
    <div className="dark min-h-screen bg-[#060a10] text-slate-200">
      <GridBackground />

      <header className="relative border-b border-cyan-900/30 bg-[#080d14]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href={backHref}
              className="font-mono text-xs uppercase tracking-widest text-cyan-500/80 transition-colors hover:text-cyan-400"
            >
              ← {backLabel}
            </Link>
            <div className="hidden h-4 w-px bg-cyan-800/50 sm:block" />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-600/70">
                Project Observer
              </p>
              <h1 className="text-lg font-semibold tracking-tight text-slate-100 sm:text-xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
              )}
            </div>
          </div>
          {actions}
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
