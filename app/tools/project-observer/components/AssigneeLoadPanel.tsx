import { ACTION_LABELS } from '../lib/labels';
import { Panel } from './Panel';
import type { AssigneeLoad } from '../types';

interface AssigneeLoadPanelProps {
  loads: AssigneeLoad[];
}

export function AssigneeLoadPanel({ loads }: AssigneeLoadPanelProps) {
  return (
    <Panel
      title="今日の確認アクション"
      hint={`${ACTION_LABELS.needsConfirmation} · ${ACTION_LABELS.awaitingReply} — ディレクターのみ`}
      className="lg:col-span-2"
    >
      {loads.length === 0 ? (
        <p className="text-base obs-text-muted">担当者データはありません。</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-base">
            <thead>
              <tr className="obs-divider border-b text-sm uppercase tracking-wider obs-text-muted">
                <th className="pb-3 pr-4 font-normal">担当</th>
                <th className="pb-3 pr-3 text-center font-normal">
                  {ACTION_LABELS.needsConfirmation}
                </th>
                <th className="pb-3 pr-3 text-center font-normal">
                  {ACTION_LABELS.awaitingReply}
                </th>
              </tr>
            </thead>
            <tbody>
              {loads.map((load) => (
                <tr key={load.id} className="obs-divider border-b last:border-0">
                  <td className="py-3 pr-4">
                    <p className="font-medium obs-text-primary">{load.name}</p>
                    {load.suggestedNext && (
                      <p className="mt-1 text-sm leading-snug obs-accent">
                        次: {load.suggestedNext}
                      </p>
                    )}
                  </td>
                  <td className="py-3 pr-3 text-center tabular-nums text-cyan-700 dark:text-cyan-300/90">
                    {load.awaitingConfirmationCount}
                  </td>
                  <td className="py-3 pr-3 text-center tabular-nums text-amber-700 dark:text-amber-300/80">
                    {load.unrepliedIssueCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
