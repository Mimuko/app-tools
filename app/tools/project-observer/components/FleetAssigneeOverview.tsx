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
        <p className="mt-1 text-sm obs-text-muted">
          ディレクターのみ — 確認待ち・未返信（社内最終コメント）・要確認の負荷
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {snapshots.slice(0, 6).map((snap) => {
          const cog = COGNITIVE_LOAD_CONFIG[snap.cognitiveLoad];
          return (
            <AssigneeCard key={snap.assigneeId} snap={snap} cog={cog} />
          );
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
        <span className={`shrink-0 text-sm font-medium ${cog.textClass}`}>{cog.label}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm tabular-nums">
        <span className="text-cyan-700 dark:text-cyan-300/80">
          確認待ち {snap.totalAwaitingConfirmation}
        </span>
        <span className="text-amber-700 dark:text-amber-300/80">
          未返信 {snap.totalUnreplied}
        </span>
        <span className="obs-text-secondary">要確認 {snap.totalNeedsReview}</span>
        <span className="text-rose-700 dark:text-rose-300/80">
          要注目 {snap.totalAttentionIssues}
        </span>
      </div>
      {snap.topPrompt && (
        <p className="obs-divider mt-2 border-t pt-2 text-sm leading-snug obs-text-muted">
          優先: {snap.topPrompt}
        </p>
      )}
    </div>
  );
}
