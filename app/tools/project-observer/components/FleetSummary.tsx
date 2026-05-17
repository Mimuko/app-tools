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
    <div className="mb-8 space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <SummaryTile
          label={SHARE_STATUS_CONFIG.attention.label}
          value={attention}
          accent="text-rose-300"
          hint="慎重判断が必要"
        />
        <SummaryTile
          label={SHARE_STATUS_CONFIG.caution.label}
          value={caution}
          accent="text-amber-300"
          hint="見えなくなっている"
        />
        <SummaryTile
          label={SHARE_STATUS_CONFIG.stable.label}
          value={stable}
          accent="text-emerald-300"
          hint="把握できている"
          className="col-span-2 sm:col-span-1"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <SummaryTile
          label="確認待ち（合計）"
          value={totalAwaiting}
          accent="text-cyan-300"
          hint="チーム全体"
          small
        />
        <SummaryTile
          label="未返信（合計）"
          value={totalUnreplied}
          accent="text-amber-300"
          hint="チーム全体"
          small
        />
      </div>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  accent,
  hint,
  small,
  className = '',
}: {
  label: string;
  value: number;
  accent: string;
  hint: string;
  small?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-cyan-900/25 bg-[#0a1018]/80 px-4 py-3 ${className}`}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
        {label}
      </p>
      <p
        className={`mt-1 font-mono tabular-nums ${accent} ${small ? 'text-xl' : 'text-2xl'}`}
      >
        {value}
      </p>
      <p className="mt-1 text-[10px] text-slate-600">{hint}</p>
    </div>
  );
}
