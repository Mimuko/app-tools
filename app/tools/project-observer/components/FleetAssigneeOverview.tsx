import { ACTION_LABELS } from '../lib/labels';
import { COGNITIVE_LOAD_CONFIG } from './constants';
import type { FleetAssigneeSnapshot } from '../types';

interface FleetAssigneeOverviewProps {
  snapshots: FleetAssigneeSnapshot[];
}

export function FleetAssigneeOverview({ snapshots }: FleetAssigneeOverviewProps) {
  if (snapshots.length === 0) return null;

  return (
    <section className="obs-section-secondary">
      <div className="mb-4">
        <h2 className="obs-heading">チーム負荷 — ディレクター観測</h2>
        <p className="mt-1.5 obs-section-lead">
          要確認・待機・要注目の件数（返信待ちは廃止）
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {snapshots.slice(0, 6).map((snap) => {
          const cog = COGNITIVE_LOAD_CONFIG[snap.cognitiveLoad];
          return <AssigneeCard key={snap.assigneeId} snap={snap} cog={cog} />;
        })}
      </div>
    </section>
  );
}

function AssigneeCard({
  snap,
  cog,
}: {
  snap: FleetAssigneeSnapshot;
  cog: (typeof COGNITIVE_LOAD_CONFIG)[keyof typeof COGNITIVE_LOAD_CONFIG];
}) {
  return (
    <div className="obs-surface-muted rounded-lg px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium obs-text-primary">{snap.name}</p>
        <span className={`shrink-0 obs-body-sm font-medium ${cog.textClass}`}>{cog.label}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 obs-body-sm tabular-nums">
        <span className="text-amber-800 dark:text-amber-200/90">
          {ACTION_LABELS.needsConfirmation} {snap.totalNeedsConfirmation}
        </span>
        <span className="obs-metric-value--external">
          {ACTION_LABELS.externalWait} {snap.totalExternalWait}
        </span>
        <span className="obs-metric-value--internal">
          {ACTION_LABELS.internalWait} {snap.totalInternalWait}
        </span>
        <span className="text-rose-700 dark:text-rose-300/80">
          要注目 {snap.totalAttentionIssues}
        </span>
      </div>
      {snap.topPrompt && (
        <p className="obs-divider mt-2 border-t pt-2 obs-body-sm leading-snug obs-text-muted">
          優先: {snap.topPrompt}
        </p>
      )}
    </div>
  );
}
