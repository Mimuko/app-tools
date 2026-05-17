import { COGNITIVE_LOAD_CONFIG } from './constants';
import type { FleetAssigneeSnapshot } from '../types';

interface FleetAssigneeOverviewProps {
  snapshots: FleetAssigneeSnapshot[];
}

export function FleetAssigneeOverview({ snapshots }: FleetAssigneeOverviewProps) {
  if (snapshots.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="mb-4">
        <h2 className="font-mono text-sm uppercase tracking-[0.15em] text-cyan-600/80">
          チーム負荷 — ディレクター観測
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          ディレクターのみ — 確認待ち・未返信（社内最終コメント）・要確認の負荷
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {snapshots.slice(0, 6).map((snap) => {
          const cog = COGNITIVE_LOAD_CONFIG[snap.cognitiveLoad];
          return (
            <div
              key={snap.assigneeId}
              className="rounded-lg border border-cyan-900/25 bg-[#0a1018]/80 px-4 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-200">{snap.name}</p>
                  <p className="text-sm text-slate-500">{snap.roleLabel}</p>
                </div>
                <span className={`shrink-0 text-sm font-medium ${cog.textClass}`}>
                  {cog.label}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {snap.projectNames.join(' / ')}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-sm tabular-nums">
                <span className="text-cyan-300/80">確認待ち {snap.totalAwaitingConfirmation}</span>
                <span className="text-amber-300/80">未返信 {snap.totalUnreplied}</span>
                <span className="text-slate-400">要確認 {snap.totalNeedsReview}</span>
                <span className="text-rose-300/80">要注目 {snap.totalAttentionIssues}</span>
              </div>
              {snap.topPrompt && (
                <p className="mt-2 border-t border-cyan-900/20 pt-2 text-sm leading-snug text-slate-500">
                  優先: {snap.topPrompt}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
