import { ACTION_LABELS, SECTION_HEADINGS } from '../lib/labels';
import { Panel } from './Panel';
import type { AssigneeLoad } from '../types';

interface AssigneeLoadPanelProps {
  loads: AssigneeLoad[];
}

export function AssigneeLoadPanel({ loads }: AssigneeLoadPanelProps) {
  return (
    <Panel
      title={SECTION_HEADINGS.directorAssignedIssues}
      hint={`担当者がディレクター · ${ACTION_LABELS.needsConfirmation} · ${ACTION_LABELS.externalWait} · ${ACTION_LABELS.internalWait}`}
      className="lg:col-span-2"
    >
      {loads.length === 0 ? (
        <p className="obs-body obs-text-muted">担当者データはありません。</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left obs-body">
            <thead>
              <tr className="obs-divider border-b obs-eyebrow obs-text-muted">
                <th className="pb-3 pr-4 font-normal normal-case">担当</th>
                <th className="pb-3 pr-3 text-center font-normal normal-case">
                  {ACTION_LABELS.needsConfirmation}
                </th>
                <th className="pb-3 pr-3 text-center font-normal normal-case">
                  {ACTION_LABELS.externalWait}
                </th>
                <th className="pb-3 pr-3 text-center font-normal normal-case">
                  {ACTION_LABELS.internalWait}
                </th>
              </tr>
            </thead>
            <tbody>
              {loads.map((load) => (
                <tr key={load.id} className="obs-divider border-b last:border-0">
                  <td className="py-3 pr-4">
                    <p className="font-medium obs-text-primary">{load.name}</p>
                    {load.suggestedNext && (
                      <p className="mt-1 obs-body-sm leading-snug obs-accent">
                        次: {load.suggestedNext}
                      </p>
                    )}
                  </td>
                  <td className="py-3 pr-3 text-center tabular-nums text-amber-800 dark:text-amber-200/90">
                    {load.needsConfirmationCount}
                  </td>
                  <td className="py-3 pr-3 text-center tabular-nums obs-metric-value--external">
                    {load.externalWaitCount}
                  </td>
                  <td className="py-3 pr-3 text-center tabular-nums obs-metric-value--internal">
                    {load.internalWaitCount}
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
