'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useTheme } from '@shared/lib/theme';
import { ObserverThemeToggle } from './ObserverThemeToggle';

interface ObserverShellFrameProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
}

function GridBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, var(--obs-bg-glow), transparent)',
        }}
      />
      <GridLines />
    </div>
  );
}

function GridLines() {
  return (
    <div
      className="absolute inset-0 opacity-40 dark:opacity-35"
      style={{
        backgroundImage:
          'linear-gradient(var(--obs-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--obs-grid-line) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }}
    />
  );
}

export function ObserverShellFrame({
  children,
  title,
  subtitle,
  backHref = '/tools/project-observer/',
  backLabel = '一覧',
  actions,
}: ObserverShellFrameProps) {
  const { theme } = useTheme();

  return (
    <div
      className="observer-console obs-page text-lg leading-relaxed"
      data-theme={theme}
      suppressHydrationWarning
    >
      <GridBackground />

      <header className="obs-header relative">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <Link
              href={backHref}
              className="obs-link shrink-0 font-mono text-sm uppercase tracking-widest"
            >
              ← {backLabel}
            </Link>
            <div
              className="hidden h-4 w-px sm:block"
              style={{ backgroundColor: 'var(--obs-border-subtle)' }}
            />
            <div className="min-w-0">
              <p className="obs-heading-muted">朝会支援UI</p>
              <h1 className="obs-title text-xl sm:text-2xl">{title}</h1>
              {subtitle && <p className="mt-0.5 text-base obs-text-muted">{subtitle}</p>}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {actions}
            <ObserverThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
