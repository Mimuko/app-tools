import { SHARE_STATUS_CONFIG } from './constants';
import type { ProjectSummary } from '../types';

interface FleetSummaryProps {
  projects: ProjectSummary[];
}

export function FleetSummary({ projects }: FleetSummaryProps) {
  const attention = projects.filter((p) => p.shareStatus === 'attention').length;
  const caution = projects.filter((p) => p.shareStatus === 'caution').length;
  const stable = projects.filter((p) => p.shareStatus === 'stable').length;
  const totalAwaiting = projects.reduce((s, p) => s + p.awaitingConfirmationCount, 0);
  const totalUnreplied = projects.reduce((s, p) => s + p.unrepliedIssueCount, 0);

  return (
    <section className="obs-section-primary" aria-label="チーム全体の状況サマリー">
      <div className="mb-3">
        <h2 className="obs-heading">チーム状況 — 要約</h2>
        <p className="mt-1 text-sm obs-text-muted">朝会で最初に確認する指標</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <SummaryTile
          label={SHARE_STATUS_CONFIG.attention.label}
          value={attention}
          accent="text-rose-600 dark:text-rose-300"
          hint="慎重判断が必要"
          prominent
        />
        <SummaryTile
          label={SHARE_STATUS_CONFIG.caution.label}
          value={caution}
          accent="text-amber-700 dark:text-amber-300"
          hint="見えなくなっている"
          prominent
        />
        <SummaryTile
          label={SHARE_STATUS_CONFIG.stable.label}
          value={stable}
          accent="text-emerald-700 dark:text-emerald-300"
          hint="把握できている"
          className="col-span-2 sm:col-span-1"
          prominent
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:max-w-md">
        <SummaryTile
          label="確認待ち（合計）"
          value={totalAwaiting}
          accent="obs-accent"
          hint="チーム全体"
          small
        />
        <SummaryTile
          label="未返信（合計）"
          value={totalUnreplied}
          accent="text-amber-700 dark:text-amber-300"
          hint="チーム全体"
          small
        />
      </div>
    </section>
  );
}

function SummaryTile({
  label,
  value,
  accent,
  hint,
  small,
  prominent,
  className = '',
}: {
  label: string;
  value: number;
  accent: string;
  hint: string;
  small?: boolean;
  prominent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`obs-surface-elevated rounded-lg px-4 py-3 ${prominent ? 'py-4' : ''} ${className}`}
    >
      <p className="font-mono text-sm uppercase tracking-widest obs-text-muted">{label}</p>
      <p
        className={`mt-1 font-mono tabular-nums ${accent} ${small ? 'text-2xl' : prominent ? 'text-4xl font-semibold' : 'text-3xl'}`}
      >
        {value}
      </p>
      <p className="mt-1 text-sm obs-text-faint">{hint}</p>
    </div>
  );
}
