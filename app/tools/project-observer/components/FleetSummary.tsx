import { SHARE_STATUS_CONFIG } from './constants';
import type { ProjectSummary } from '../types';

interface FleetSummaryProps {
  projects: ProjectSummary[];
}

/** 案件としてのチーム状態（要注目・注意のみ） */
export function FleetSummary({ projects }: FleetSummaryProps) {
  const attention = projects.filter((p) => p.shareStatus === 'attention').length;
  const caution = projects.filter((p) => p.shareStatus === 'caution').length;

  return (
    <section className="obs-section-primary" aria-label="チーム状態">
      <div className="mb-4">
        <h2 className="obs-heading">Backlogごとのプロジェクト状態</h2>
        <p className="mt-1.5 obs-section-lead">要注目・注意のみ</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:max-w-lg">
        <SummaryTile
          label={SHARE_STATUS_CONFIG.attention.label}
          value={attention}
          accent="text-rose-600 dark:text-rose-300"
          hint="進行停止または慎重判断が必要"
          prominent
        />
        <SummaryTile
          label={SHARE_STATUS_CONFIG.caution.label}
          value={caution}
          accent="text-amber-700 dark:text-amber-300"
          hint="状況共有不足・見えなくなっている"
          prominent
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
  prominent,
}: {
  label: string;
  value: number;
  accent: string;
  hint: string;
  prominent?: boolean;
}) {
  return (
    <div className={`obs-surface-elevated rounded-lg px-4 py-3 ${prominent ? 'py-4' : ''}`}>
      <p className="obs-eyebrow obs-text-muted">{label}</p>
      <p
        className={`mt-1.5 tabular-nums ${accent} ${prominent ? 'text-5xl font-semibold leading-none' : 'text-4xl font-semibold leading-none'}`}
      >
        {value}
      </p>
      <p className="mt-2 obs-body-sm obs-text-faint">{hint}</p>
    </div>
  );
}
