import { COGNITIVE_LOAD_CONFIG } from './constants';
import { Panel } from './Panel';
import type { AssigneeLoad } from '../types';

interface AssigneeLoadPanelProps {
  loads: AssigneeLoad[];
}

export function AssigneeLoadPanel({ loads }: AssigneeLoadPanelProps) {
  return (
    <Panel
      title="認知・判断負荷"
      hint="確認待ち · 未返信（社内最終） · 要確認 — ディレクターのみ集計"
      className="lg:col-span-2"
    >
      {loads.length === 0 ? (
        <p className="text-base obs-text-muted">担当者データはありません。</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-base">
            <thead>
              <tr className="obs-divider border-b font-mono text-sm uppercase tracking-wider obs-text-muted">
                <th className="pb-3 pr-4 font-normal">担当</th>
                <th className="pb-3 pr-3 text-center font-normal">確認待ち</th>
                <th className="pb-3 pr-3 text-center font-normal">未返信</th>
                <th className="pb-3 pr-3 text-center font-normal">要確認</th>
                <th className="pb-3 pr-3 text-center font-normal">要注目</th>
                <th className="pb-3 font-normal">負荷</th>
              </tr>
            </thead>
            <tbody>
              {loads.map((load) => {
                const cog = COGNITIVE_LOAD_CONFIG[load.cognitiveLoad];
                return (
                  <tr key={load.id} className="obs-divider border-b last:border-0">
                    <td className="py-3 pr-4">
                      <p className="font-medium obs-text-primary">{load.name}</p>
                      <p className="text-sm obs-text-muted">{load.roleLabel}</p>
                      {load.suggestedNext && (
                        <p className="mt-1 text-sm leading-snug obs-accent">
                          次: {load.suggestedNext}
                        </p>
                      )}
                    </td>
                    <td className="py-3 pr-3 text-center font-mono tabular-nums text-cyan-700 dark:text-cyan-300/90">
                      {load.awaitingConfirmationCount}
                    </td>
                    <td className="py-3 pr-3 text-center font-mono tabular-nums text-amber-700 dark:text-amber-300/80">
                      {load.unrepliedIssueCount}
                    </td>
                    <td className="py-3 pr-3 text-center font-mono tabular-nums obs-text-secondary">
                      {load.needsReviewCount}
                    </td>
                    <td className="py-3 pr-3 text-center font-mono tabular-nums text-rose-700 dark:text-rose-300/80">
                      {load.attentionIssueCount}
                    </td>
                    <td className="py-3">
                      <span className={`text-sm font-medium ${cog.textClass}`}>
                        {cog.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
